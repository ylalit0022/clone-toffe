// ═══════════════════════════════════════════════════════════════
//  utils/blog/strapi.js  —  Strapi API client + Redis data cache
//
//  Exact field names from your Strapi schema (verified from screenshots):
//  Post:   Title, Slug, Description, Content (Blocks), CoverImage,
//          Category, PublishedDate, metaTitle, metaDescription,
//          canonicalUrl, schemaType, ogImage, ogTitle, ogDescription,
//          noIndex, author (relation → Author)
//  Author: name, bio, avatar, website, twitter, posts
//
//  NOTE: Strapi v4 lowercases PascalCase field names in API responses,
//  so CoverImage → coverImage, PublishedDate → publishedDate, etc.
//  Content is Rich text (Blocks) — rendered to HTML by blocksToHtml().
// ═══════════════════════════════════════════════════════════════

const { createClient } = require("redis");

const STRAPI_URL     = process.env.STRAPI_URL   || "http://localhost:1337";
const STRAPI_TOKEN   = process.env.STRAPI_TOKEN || "";
const CACHE_PREFIX   = "blog:";
const CACHE_TTL_LIST = parseInt(process.env.CACHE_TTL_LIST || "300");
const CACHE_TTL_POST = parseInt(process.env.CACHE_TTL_POST || "600");

// ── Redis (lazy connect) ─────────────────────────────────────────────────────
let _redis = null;
async function getRedis() {
  if (_redis) return _redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    _redis = createClient({ url });
    _redis.on("error", e => console.warn("[BlogData] Redis error:", e.message));
    await _redis.connect();
  } catch (e) {
    console.warn("[BlogData] Redis unavailable:", e.message);
    _redis = null;
  }
  return _redis;
}
async function cacheGet(key) {
  const r = await getRedis(); if (!r) return null;
  try { const v = await r.get(CACHE_PREFIX + key); return v ? JSON.parse(v) : null; } catch { return null; }
}
async function cacheSet(key, value, ttl) {
  const r = await getRedis(); if (!r) return;
  try { await r.setEx(CACHE_PREFIX + key, ttl, JSON.stringify(value)); } catch {}
}
async function cacheDel(pattern) {
  const r = await getRedis(); if (!r) return 0;
  try {
    const fp = CACHE_PREFIX + (pattern || "*");
    const keys = []; let cursor = 0;
    do {
      const res = await r.scan(cursor, { MATCH: fp, COUNT: 200 });
      cursor = res.cursor; keys.push(...res.keys);
    } while (cursor !== 0);
    if (keys.length) await r.del(keys);
    return keys.length;
  } catch { return 0; }
}

// ── Strapi fetch ─────────────────────────────────────────────────────────────
async function strapiGet(endpoint) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const headers = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Strapi ${res.status}: ${t.slice(0, 300)}`);
  }
  return res.json();
}

// ── Rich text (Blocks) → HTML ────────────────────────────────────────────────
// Strapi v4 "Rich text (Blocks)" stores content as a JSON array of block nodes,
// NOT as an HTML string. This converter handles all standard block types.
function blocksToHtml(blocks) {
  if (!blocks) return "";
  // If it's already a plain string (legacy plain-text), return as-is
  if (typeof blocks === "string") return blocks;
  if (!Array.isArray(blocks)) return "";

  return blocks.map(block => blockToHtml(block)).join("\n");
}

function blockToHtml(block) {
  if (!block) return "";
  switch (block.type) {
    case "paragraph":
      return `<p>${inlinesToHtml(block.children)}</p>`;
    case "heading": {
      const lvl = block.level || 2;
      return `<h${lvl}>${inlinesToHtml(block.children)}</h${lvl}>`;
    }
    case "list": {
      const tag = block.format === "ordered" ? "ol" : "ul";
      const items = (block.children || []).map(item =>
        `<li>${inlinesToHtml(item.children || [item])}</li>`
      ).join("");
      return `<${tag}>${items}</${tag}>`;
    }
    case "list-item":
      return `<li>${inlinesToHtml(block.children)}</li>`;
    case "quote":
      return `<blockquote>${inlinesToHtml(block.children)}</blockquote>`;
    case "code":
      return `<pre><code>${escHtml(textContent(block.children))}</code></pre>`;
    case "image": {
      const img = block.image || {};
      const url = img.url ? resolveUrl(img.url) : "";
      const alt = img.alternativeText || img.name || "";
      return url ? `<img src="${url}" alt="${escHtml(alt)}" loading="lazy" />` : "";
    }
    case "link": {
      const href = escHtml(block.url || "");
      return `<a href="${href}" rel="noopener">${inlinesToHtml(block.children)}</a>`;
    }
    case "divider":
      return `<hr />`;
    default:
      // Fallback: treat as paragraph
      return block.children ? `<p>${inlinesToHtml(block.children)}</p>` : "";
  }
}

function inlinesToHtml(children) {
  if (!Array.isArray(children)) return escHtml(String(children || ""));
  return children.map(node => {
    if (!node) return "";
    if (node.type === "link") {
      const href = escHtml(node.url || "");
      return `<a href="${href}" rel="noopener">${inlinesToHtml(node.children)}</a>`;
    }
    let text = escHtml(node.text || "");
    if (node.bold)          text = `<strong>${text}</strong>`;
    if (node.italic)        text = `<em>${text}</em>`;
    if (node.underline)     text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<s>${text}</s>`;
    if (node.code)          text = `<code>${text}</code>`;
    return text;
  }).join("");
}

function textContent(children) {
  if (!Array.isArray(children)) return String(children || "");
  return children.map(n => n.text || "").join("");
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : STRAPI_URL + url;
}

// ── Author slug helper ───────────────────────────────────────────────────────
// Author collection has no slug field — we derive one from name
function authorSlug(name) {
  if (!name) return "";
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Normalizers ──────────────────────────────────────────────────────────────
function normalizeAuthor(raw) {
  if (!raw) return null;
  const d  = raw.attributes || raw;
  const id = raw.id || d.id;
  const name = d.name || "Tranzo Team";
  return {
    id,
    name,
    slug:     authorSlug(name),   // derived — no slug field in Strapi
    bio:      d.bio      || "",
    role:     d.role     || "Author",
    website:  d.website  || null,
    twitter:  d.twitter  || null,
    linkedin: null,               // not in your schema
    avatar:   d.avatar?.data?.attributes ? resolveUrl(d.avatar.data.attributes.url)
              : d.avatar?.url ? resolveUrl(d.avatar.url) : null,
  };
}

function normalizePost(raw) {
  if (!raw) return null;
  const d  = raw.attributes || raw;
  const id = raw.id || d.id;

  // CoverImage (PascalCase in Strapi → coverImage in API response)
  let coverImage = null;
  const ci = d.CoverImage || d.coverImage;
  if (ci?.data?.attributes) {
    const img = ci.data.attributes;
    coverImage = { url: resolveUrl(img.url), alt: img.alternativeText || d.Title || d.title || "", width: img.width || 1200, height: img.height || 630 };
  } else if (ci?.url) {
    coverImage = { url: resolveUrl(ci.url), alt: ci.alternativeText || d.Title || d.title || "", width: ci.width || 1200, height: ci.height || 630 };
  }

  // ogImage
  let ogImage = null;
  const ogi = d.ogImage;
  if (ogi?.data?.attributes)  ogImage = { url: resolveUrl(ogi.data.attributes.url) };
  else if (ogi?.url)           ogImage = { url: resolveUrl(ogi.url) };
  else if (coverImage)         ogImage = { url: coverImage.url };

  // Author
  let author = null;
  const ar = d.author;
  if (ar?.data?.attributes) {
    const a = ar.data.attributes;
    const aname = a.name || "Tranzo Team";
    author = {
      id:       ar.data.id,
      name:     aname,
      slug:     authorSlug(aname),
      bio:      a.bio      || "",
      role:     a.role     || "Author",
      website:  a.website  || null,
      twitter:  a.twitter  || null,
      linkedin: null,
      avatar:   a.avatar?.data?.attributes ? resolveUrl(a.avatar.data.attributes.url) : null,
    };
  } else if (ar?.name) {
    author = { name: ar.name, slug: authorSlug(ar.name), bio: ar.bio || "", role: ar.role || "Author", website: ar.website || null, twitter: ar.twitter || null };
  }

  // Field names — handle both PascalCase (Strapi storage) and camelCase (API response)
  const title       = d.Title           || d.title           || "";
  const slug        = d.Slug            || d.slug            || "";
  const description = d.Description     || d.description     || d.metaDescription || "";
  const category    = d.Category        || d.category        || "General";
  const publishedDate = d.PublishedDate || d.publishedDate   || d.publishedAt || d.createdAt || null;

  // Content — Rich text (Blocks) JSON array → HTML string
  const rawContent = d.Content || d.content || null;
  const content = blocksToHtml(rawContent);

  // Plain text excerpt for meta description fallback
  const plainText = rawContent ? textContent(
    Array.isArray(rawContent) ? rawContent.flatMap(b => b.children || []) : []
  ).slice(0, 200) : description;

  return {
    id,
    title,
    slug,
    description:     description || plainText,
    content,
    category,
    publishedDate,
    publishedDateFormatted: publishedDate
      ? new Date(publishedDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
      : "",
    readingTime: estimateReadingTime(content),
    coverImage,
    ogImage,
    metaTitle:       d.metaTitle       || title,
    metaDescription: d.metaDescription || description || plainText,
    canonicalUrl:    d.canonicalUrl    || `${process.env.SITE_URL || "https://share.rumnnlg.com"}/blog/${slug}`,
    schemaType:      d.schemaType      || "BlogPosting",
    ogTitle:         d.ogTitle         || d.metaTitle || title,
    ogDescription:   d.ogDescription   || d.metaDescription || description,
    noIndex:         !!d.noIndex,
    author,
  };
}

function estimateReadingTime(html) {
  if (!html) return 1;
  return Math.max(1, Math.round(html.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length / 200));
}

// ── Public API ───────────────────────────────────────────────────────────────

async function getPosts({ page = 1, pageSize = 12, category, sort = "publishedDate:desc" } = {}) {
  const ck = `list:${page}:${pageSize}:${category || "all"}`;
  const cached = await cacheGet(ck); if (cached) return cached;

  let qs = `?populate[CoverImage]=true&populate[author][populate][avatar]=true`
         + `&pagination[page]=${page}&pagination[pageSize]=${pageSize}`
         + `&sort=${encodeURIComponent(sort)}`;
  if (category) qs += `&filters[Category][$eqi]=${encodeURIComponent(category)}`;

  const data = await strapiGet(`/posts${qs}`);
  const posts = (data.data || []).map(normalizePost).filter(Boolean);
  const pagination = data.meta?.pagination || { page, pageSize, total: posts.length, pageCount: 1 };
  const result = { posts, pagination };
  await cacheSet(ck, result, CACHE_TTL_LIST);
  return result;
}

async function getPostBySlug(slug) {
  const ck = `post:${slug}`; const cached = await cacheGet(ck); if (cached) return cached;

  const qs = `?filters[Slug][$eq]=${encodeURIComponent(slug)}`
           + `&populate[CoverImage]=true&populate[ogImage]=true`
           + `&populate[author][populate][avatar]=true`;

  const data = await strapiGet(`/posts${qs}`);
  const raw  = data.data?.[0]; if (!raw) return null;
  const post = normalizePost(raw);
  await cacheSet(ck, post, CACHE_TTL_POST);
  return post;
}

async function getRelatedPosts(category, excludeSlug, limit = 3) {
  const ck = `related:${category}:${excludeSlug}`;
  const cached = await cacheGet(ck); if (cached) return cached;

  const qs = `?filters[Category][$eqi]=${encodeURIComponent(category)}`
           + `&filters[Slug][$ne]=${encodeURIComponent(excludeSlug)}`
           + `&pagination[pageSize]=${limit}&sort=publishedDate:desc`
           + `&populate[CoverImage]=true`;

  const data = await strapiGet(`/posts${qs}`);
  const posts = (data.data || []).map(normalizePost).filter(Boolean);
  await cacheSet(ck, posts, CACHE_TTL_LIST);
  return posts;
}

async function getCategories() {
  const ck = "categories"; const cached = await cacheGet(ck); if (cached) return cached;

  // Fetch without fields restriction — avoids "Invalid key" errors
  const data = await strapiGet("/posts?pagination[pageSize]=500");
  const counts = {};
  (data.data || []).forEach(p => {
    const d = p.attributes || p;
    const cat = d.Category || d.category || "General";
    counts[cat] = (counts[cat] || 0) + 1;
  });
  const categories = Object.entries(counts)
    .map(([name, count]) => ({ name, count, slug: name.toLowerCase().replace(/\s+/g, "-") }))
    .sort((a, b) => b.count - a.count);

  await cacheSet(ck, categories, CACHE_TTL_LIST);
  return categories;
}

async function getAuthorBySlug(nameSlug) {
  const ck = `author:${nameSlug}`; const cached = await cacheGet(ck); if (cached) return cached;

  // No slug field on Author — fetch all and match by derived slug from name
  const data = await strapiGet("/authors?populate[avatar]=true&pagination[pageSize]=100");
  const match = (data.data || []).find(r => {
    const name = (r.attributes || r).name || "";
    return authorSlug(name) === nameSlug;
  });
  if (!match) return null;

  const author = normalizeAuthor(match);
  await cacheSet(ck, author, CACHE_TTL_POST);
  return author;
}

async function getPostsByAuthor(nameSlug, { page = 1, pageSize = 12 } = {}) {
  const ck = `author-posts:${nameSlug}:${page}`;
  const cached = await cacheGet(ck); if (cached) return cached;

  // Fetch all authors to find the id matching this slug
  const authData = await strapiGet("/authors?pagination[pageSize]=100");
  const match = (authData.data || []).find(r => {
    const name = (r.attributes || r).name || "";
    return authorSlug(name) === nameSlug;
  });
  if (!match) return { posts: [], pagination: { page, pageSize, total: 0, pageCount: 0 } };

  const authorId = match.id;
  const qs = `?filters[author][id][$eq]=${authorId}`
           + `&pagination[page]=${page}&pagination[pageSize]=${pageSize}`
           + `&sort=publishedDate:desc`
           + `&populate[CoverImage]=true&populate[author][populate][avatar]=true`;

  const data = await strapiGet(`/posts${qs}`);
  const posts = (data.data || []).map(normalizePost).filter(Boolean);
  const pagination = data.meta?.pagination || { page, pageSize, total: posts.length, pageCount: 1 };
  const result = { posts, pagination };
  await cacheSet(ck, result, CACHE_TTL_LIST);
  return result;
}

async function getAllPostSlugs() {
  const ck = "all-slugs"; const cached = await cacheGet(ck); if (cached) return cached;

  // Fetch without fields[] restriction to avoid "Invalid key slug" error
  const data = await strapiGet("/posts?pagination[pageSize]=1000&sort=publishedDate:desc");
  const slugs = (data.data || []).map(p => {
    const d = p.attributes || p;
    return {
      slug:          d.Slug          || d.slug,
      publishedDate: d.PublishedDate || d.publishedDate || d.publishedAt,
    };
  }).filter(s => s.slug);

  await cacheSet(ck, slugs, CACHE_TTL_LIST);
  return slugs;
}

async function purgeCache(key) {
  const pattern = key || "*";
  const deleted = await cacheDel(pattern);
  console.log(`[BlogData] Purged ${deleted} key(s) matching "${CACHE_PREFIX}${pattern}"`);
  return deleted;
}

module.exports = {
  getPosts,
  getPostBySlug,
  getRelatedPosts,
  getCategories,
  getAuthorBySlug,
  getPostsByAuthor,
  getAllPostSlugs,
  purgeCache,
  authorSlug,
};
