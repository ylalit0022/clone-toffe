// ═══════════════════════════════════════════════════════════════
//  utils/blog/ghost.js  —  Ghost Content API client + Redis cache
//
//  Ghost API fields used:
//    id, title, slug, excerpt, html, feature_image, feature_image_alt,
//    published_at, reading_time, tags, primary_tag, authors, primary_author,
//    meta_title, meta_description, og_title, og_description, og_image,
//    twitter_title, twitter_description, twitter_image,
//    canonical_url, custom_template, visibility
//
//  .env keys needed:
//    GHOST_URL=http://localhost:2368
//    GHOST_KEY=a9cde61d55d1a6f9833ba5d7a2   (Content API key)
// ═══════════════════════════════════════════════════════════════

const { createClient } = require("redis");

const GHOST_URL  = (process.env.GHOST_URL  || "http://localhost:2368").replace(/\/$/, "");
const GHOST_KEY  = process.env.GHOST_CONTENT_KEY   || "a9cde61d55d1a6f9833ba5d7a2";
const SITE_URL   = (process.env.SITE_URL   || "http://localhost:3000").replace(/\/$/, "");

const CACHE_PREFIX   = "ghost:";
const CACHE_TTL_LIST = parseInt(process.env.CACHE_TTL_LIST || "300");
const CACHE_TTL_POST = parseInt(process.env.CACHE_TTL_POST || "600");

// ── Redis (lazy) ─────────────────────────────────────────────
let _redis = null;
async function getRedis() {
  if (_redis) return _redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    _redis = createClient({ url });
    _redis.on("error", e => console.warn("[GhostCache] Redis error:", e.message));
    await _redis.connect();
  } catch (e) {
    console.warn("[GhostCache] Redis unavailable:", e.message);
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

// ── Ghost Content API fetch ──────────────────────────────────
async function ghostGet(endpoint) {
  // Append key to every request
  const sep = endpoint.includes("?") ? "&" : "?";
  const url = `${GHOST_URL}/ghost/api/content${endpoint}${sep}key=${GHOST_KEY}`;
  const res = await fetch(url, {
    headers: { "Accept-Version": "v5.0" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Ghost ${res.status}: ${t.slice(0, 300)}`);
  }
  return res.json();
}

// ── Table of Contents generator ──────────────────────────────
// Parses h2/h3 from Ghost HTML, adds id anchors, returns { html, toc }
function buildToc(html) {
  if (!html) return { html: "", toc: [] };

  const toc = [];
  let counter = {};

  // Add id to every h2 and h3, collect TOC entries
  const processed = html.replace(/<(h[23])[^>]*>([\s\S]*?)<\/h[23]>/gi, (match, tag, inner) => {
    const level = parseInt(tag[1]);
    // Strip inner HTML tags to get plain text
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return match;

    // Build slug from text
    let slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

    // Deduplicate slugs
    counter[slug] = (counter[slug] || 0) + 1;
    const id = counter[slug] > 1 ? `${slug}-${counter[slug]}` : slug;

    toc.push({ id, text, level });

    return `<${tag} id="${id}">${inner}</${tag}>`;
  });

  return { html: processed, toc };
}

// ── Slug helper for authors (Ghost authors have a slug field) ─
function authorSlug(author) {
  return author?.slug || author?.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "";
}

// ── Normalizer ───────────────────────────────────────────────
function normalizePost(p) {
  if (!p) return null;

  // Tags → category (primary_tag is Ghost's main tag)
  const category = p.primary_tag?.name || p.tags?.[0]?.name || "General";
  const categorySlug = p.primary_tag?.slug || p.tags?.[0]?.slug || "general";

  // Author
  const rawAuthor = p.primary_author || p.authors?.[0] || null;
  const author = rawAuthor ? {
    id:       rawAuthor.id,
    name:     rawAuthor.name     || "Tranzo Team",
    slug:     authorSlug(rawAuthor),
    bio:      rawAuthor.bio      || "",
    role:     rawAuthor.website ? "Author" : "Author",
    website:  rawAuthor.website  || null,
    twitter:  rawAuthor.twitter  ? `https://twitter.com/${rawAuthor.twitter.replace("@", "")}` : null,
    avatar:   rawAuthor.profile_image || null,
  } : null;

  // Published date
  const publishedDate = p.published_at || p.created_at || null;

  // HTML with TOC anchors injected
  const { html: contentHtml, toc } = buildToc(p.html || "");

  // Canonical — Ghost's canonical_url or derive from our domain
  const canonicalUrl = p.canonical_url || `${SITE_URL}/blog/${p.slug}`;

  return {
    id:          p.id,
    title:       p.title       || "",
    slug:        p.slug        || "",
    description: p.excerpt     || p.meta_description || p.custom_excerpt || "",
    content:     contentHtml,
    toc,
    category,
    categorySlug,
    publishedDate,
    publishedDateFormatted: publishedDate
      ? new Date(publishedDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
      : "",
    readingTime: p.reading_time || 1,
    coverImage: p.feature_image ? {
      url:    p.feature_image,
      alt:    p.feature_image_alt || p.title || "",
      width:  1200,
      height: 630,
    } : null,
    // SEO
    metaTitle:       p.meta_title       || p.og_title       || p.title || "",
    metaDescription: p.meta_description || p.og_description || p.excerpt || "",
    canonicalUrl,
    schemaType:      "Article",
    ogTitle:         p.og_title         || p.meta_title     || p.title || "",
    ogDescription:   p.og_description   || p.meta_description || p.excerpt || "",
    ogImage:         p.og_image         || p.feature_image  || null,
    twitterTitle:    p.twitter_title    || p.og_title       || p.title || "",
    twitterImage:    p.twitter_image    || p.og_image       || p.feature_image || null,
    noIndex:         p.visibility === "members" || p.visibility === "paid",
    tags:            (p.tags || []).map(t => ({ name: t.name, slug: t.slug })),
    author,
  };
}

// ── Public API ───────────────────────────────────────────────

async function getPosts({ page = 1, pageSize = 12, tag } = {}) {
  const ck = `list:${page}:${pageSize}:${tag || "all"}`;
  const cached = await cacheGet(ck); if (cached) return cached;

  let qs = `/posts/?limit=${pageSize}&page=${page}&include=tags,authors&fields=id,title,slug,excerpt,feature_image,published_at,reading_time,primary_tag,primary_author`;
  if (tag) qs += `&filter=tag:${encodeURIComponent(tag)}`;

  const data = await ghostGet(qs);
  const posts = (data.posts || []).map(normalizePost).filter(Boolean);
  const meta  = data.meta?.pagination || {};
  const pagination = {
    page:      meta.page      || page,
    pageSize:  meta.limit     || pageSize,
    total:     meta.total     || posts.length,
    pageCount: meta.pages     || 1,
  };
  const result = { posts, pagination };
  await cacheSet(ck, result, CACHE_TTL_LIST);
  return result;
}

async function getPostBySlug(slug) {
  const ck = `post:${slug}`; const cached = await cacheGet(ck); if (cached) return cached;

  const data = await ghostGet(`/posts/slug/${encodeURIComponent(slug)}/?include=tags,authors`);
  const raw  = data.posts?.[0]; if (!raw) return null;
  const post = normalizePost(raw);
  await cacheSet(ck, post, CACHE_TTL_POST);
  return post;
}

async function getRelatedPosts(tag, excludeSlug, limit = 3) {
  const ck = `related:${tag}:${excludeSlug}`;
  const cached = await cacheGet(ck); if (cached) return cached;

  const data = await ghostGet(
    `/posts/?limit=${limit + 1}&filter=tag:${encodeURIComponent(tag)}&include=tags,authors&fields=id,title,slug,excerpt,feature_image,published_at,reading_time,primary_tag,primary_author`
  );
  const posts = (data.posts || [])
    .map(normalizePost)
    .filter(p => p && p.slug !== excludeSlug)
    .slice(0, limit);

  await cacheSet(ck, posts, CACHE_TTL_LIST);
  return posts;
}

async function getTags() {
  const ck = "tags"; const cached = await cacheGet(ck); if (cached) return cached;

  const data = await ghostGet("/tags/?limit=all&include=count.posts");
  const tags = (data.tags || [])
    .filter(t => (t.count?.posts || 0) > 0 && !t.slug.startsWith("hash-"))
    .map(t => ({ name: t.name, slug: t.slug, count: t.count?.posts || 0 }))
    .sort((a, b) => b.count - a.count);

  await cacheSet(ck, tags, CACHE_TTL_LIST);
  return tags;
}

async function getAuthorBySlug(slug) {
  const ck = `author:${slug}`; const cached = await cacheGet(ck); if (cached) return cached;

  const data = await ghostGet(`/authors/slug/${encodeURIComponent(slug)}/?include=count.posts`);
  const raw  = data.authors?.[0]; if (!raw) return null;

  const author = {
    id:        raw.id,
    name:      raw.name      || "Tranzo Team",
    slug:      raw.slug,
    bio:       raw.bio       || "",
    role:      "Author",
    website:   raw.website   || null,
    twitter:   raw.twitter   ? `https://twitter.com/${raw.twitter.replace("@", "")}` : null,
    avatar:    raw.profile_image || null,
    postCount: raw.count?.posts || 0,
  };
  await cacheSet(ck, author, CACHE_TTL_POST);
  return author;
}

async function getPostsByAuthor(slug, { page = 1, pageSize = 12 } = {}) {
  const ck = `author-posts:${slug}:${page}`;
  const cached = await cacheGet(ck); if (cached) return cached;

  const data = await ghostGet(
    `/posts/?limit=${pageSize}&page=${page}&filter=author:${encodeURIComponent(slug)}&include=tags,authors&fields=id,title,slug,excerpt,feature_image,published_at,reading_time,primary_tag,primary_author`
  );
  const posts = (data.posts || []).map(normalizePost).filter(Boolean);
  const meta  = data.meta?.pagination || {};
  const pagination = { page: meta.page || page, pageSize: meta.limit || pageSize, total: meta.total || posts.length, pageCount: meta.pages || 1 };
  const result = { posts, pagination };
  await cacheSet(ck, result, CACHE_TTL_LIST);
  return result;
}

async function getAllPostSlugs() {
  const ck = "all-slugs"; const cached = await cacheGet(ck); if (cached) return cached;

  const data = await ghostGet("/posts/?limit=all&fields=slug,published_at&order=published_at+desc");
  const slugs = (data.posts || []).map(p => ({ slug: p.slug, publishedDate: p.published_at })).filter(s => s.slug);
  await cacheSet(ck, slugs, CACHE_TTL_LIST);
  return slugs;
}

async function purgeCache(key) {
  const pattern = key || "*";
  const deleted = await cacheDel(pattern);
  console.log(`[GhostCache] Purged ${deleted} key(s) matching "${CACHE_PREFIX}${pattern}"`);
  return deleted;
}

module.exports = {
  getPosts,
  getPostBySlug,
  getRelatedPosts,
  getTags,
  getAuthorBySlug,
  getPostsByAuthor,
  getAllPostSlugs,
  purgeCache,
  authorSlug,
};
