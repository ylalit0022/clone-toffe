// ═══════════════════════════════════════════════════════════════
//  routes/blog.js  —  Complete blog router
//
//  Routes:
//    GET /blog                        → redirect to /blog/page/1
//    GET /blog/page/:n                → paginated post list
//    GET /blog/category/:cat          → redirect
//    GET /blog/category/:cat/page/:n  → category filter
//    GET /blog/author/:slug           → redirect
//    GET /blog/author/:slug/page/:n   → author profile + posts
//    GET /blog/post/:slug             → single post (explicit)
//    GET /blog/:slug                  → single post (short URL)
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const router  = express.Router();

const {
  getPosts, getPostBySlug, getRelatedPosts,
  getTags, getAuthorBySlug, getPostsByAuthor,
  authorSlug,
} = require("../utils/blog/ghost");

const {
  buildArticleSchema, buildBreadcrumbSchema, buildBreadcrumbs,
  buildWebsiteSchema, schemaToScript, SITE_URL,
} = require("../utils/blog/schema");

const PAGE_SIZE = parseInt(process.env.BLOG_PAGE_SIZE || "12");

function pagLinks(base, cur, count) {
  return {
    prev:  cur > 1     ? `${base}/page/${cur - 1}` : null,
    next:  cur < count ? `${base}/page/${cur + 1}` : null,
    pages: Array.from({ length: count }, (_, i) => ({
      n: i + 1, url: i === 0 ? base : `${base}/page/${i + 1}`, current: i + 1 === cur,
    })),
  };
}
function err404(res, msg) { console.error("[Blog]", msg); return res.status(404).render("pages/404.njk"); }
function err500(res, e)   { console.error("[Blog]", e?.message || e); return res.status(500).render("pages/404.njk"); }

// /blog
router.get("/", (req, res) => res.redirect(301, "/blog/page/1"));

// /blog/page/:n
router.get("/page/:page", async (req, res) => {
  const page = Math.max(1, parseInt(req.params.page) || 1);
  try {
    const [{ posts, pagination }, categories] = await Promise.all([
      getPosts({ page, pageSize: PAGE_SIZE }),
      getTags(),
    ]);
    const base = `${SITE_URL}/blog`;
    const paginationLinks = pagLinks(base, page, pagination.pageCount);
    const breadcrumbs = [{ label: "Home", url: SITE_URL }, { label: "Blog", url: base }];
    res.render("blog/list.njk", {
      posts, pagination, paginationLinks, categories, currentCategory: null, currentPage: page, breadcrumbs,
      schemaScripts: schemaToScript(buildWebsiteSchema(), buildBreadcrumbSchema(breadcrumbs)),
      metaTitle: "Blog — File Transfer Tips & Guides | Tranzo",
      metaDescription: "Expert tips on P2P file transfer, WebRTC, and privacy. No-cloud guides from the Tranzo team.",
      canonicalUrl: page === 1 ? base : `${base}/page/${page}`,
      ogTitle: "Tranzo Blog", ogDescription: "Guides on fast, private P2P file transfers.",
      ogImage: `${SITE_URL}/img/og-default.png`, noIndex: false,
    });
  } catch (e) { err500(res, e); }
});

// /blog/category/:cat
router.get("/category/:cat", (req, res) =>
  res.redirect(301, `/blog/category/${encodeURIComponent(req.params.cat)}/page/1`));

// /blog/category/:cat/page/:n
router.get("/category/:cat/page/:page", async (req, res) => {
  const cat  = req.params.cat;
  const page = Math.max(1, parseInt(req.params.page) || 1);
  try {
    const [{ posts, pagination }, categories] = await Promise.all([
      getPosts({ page, pageSize: PAGE_SIZE, category: cat }),
      getTags(),
    ]);
    if (!posts.length && page === 1) return err404(res, `No posts in category "${cat}"`);
    const base = `${SITE_URL}/blog/category/${encodeURIComponent(cat)}`;
    const paginationLinks = pagLinks(base, page, pagination.pageCount);
    const breadcrumbs = [
      { label: "Home", url: SITE_URL },
      { label: "Blog", url: `${SITE_URL}/blog` },
      { label: cat,    url: base },
    ];
    res.render("blog/list.njk", {
      posts, pagination, paginationLinks, categories, currentCategory: cat, currentPage: page, breadcrumbs,
      schemaScripts: schemaToScript(buildBreadcrumbSchema(breadcrumbs)),
      metaTitle: `${cat} Articles — Tranzo Blog`,
      metaDescription: `Browse all ${cat} articles on Tranzo.`,
      canonicalUrl: page === 1 ? base : `${base}/page/${page}`,
      ogTitle: `${cat} — Tranzo Blog`, ogDescription: `All ${cat} articles on Tranzo.`,
      ogImage: `${SITE_URL}/img/og-default.png`, noIndex: false,
    });
  } catch (e) { err500(res, e); }
});

// /blog/author/:slug
router.get("/author/:slug", (req, res) =>
  res.redirect(301, `/blog/author/${encodeURIComponent(req.params.slug)}/page/1`));

// /blog/author/:slug/page/:n
router.get("/author/:slug/page/:page", async (req, res) => {
  const slug = req.params.slug;
  const page = Math.max(1, parseInt(req.params.page) || 1);
  try {
    const [author, { posts, pagination }, categories] = await Promise.all([
      getAuthorBySlug(slug),
      getPostsByAuthor(slug, { page, pageSize: PAGE_SIZE }),
      getTags(),
    ]);
    if (!author) return err404(res, `Author not found: ${slug}`);
    const base = `${SITE_URL}/blog/author/${encodeURIComponent(slug)}`;
    const paginationLinks = pagLinks(base, page, pagination.pageCount);
    const breadcrumbs = [
      { label: "Home",      url: SITE_URL },
      { label: "Blog",      url: `${SITE_URL}/blog` },
      { label: author.name, url: base },
    ];
    res.render("blog/author.njk", {
      author, posts, pagination, paginationLinks, categories, currentPage: page, breadcrumbs,
      schemaScripts: schemaToScript(buildBreadcrumbSchema(breadcrumbs)),
      metaTitle: `${author.name} — Author at Tranzo Blog`,
      metaDescription: author.bio || `Read all articles by ${author.name} on Tranzo.`,
      canonicalUrl: page === 1 ? base : `${base}/page/${page}`,
      ogTitle: `${author.name} | Tranzo Blog`,
      ogDescription: author.bio || `Articles by ${author.name}`,
      ogImage: author.avatar || `${SITE_URL}/img/og-default.png`, noIndex: false,
    });
  } catch (e) { err500(res, e); }
});

// /blog/post/:slug  (explicit long-form URL)
router.get("/post/:slug", (req, res) => renderPost(req, res, req.params.slug));

// /blog/:slug  (short URL — MUST be last)
router.get("/:slug", (req, res) => {
  if (req.params.slug === "page") return res.redirect(301, "/blog/page/1");
  return renderPost(req, res, req.params.slug);
});

async function renderPost(req, res, slug) {
  try {
    const [post, categories] = await Promise.all([getPostBySlug(slug), getTags()]);
    if (!post) return err404(res, `Post not found: ${slug}`);
    if (post.noIndex) res.setHeader("X-Robots-Tag", "noindex, follow");

    const relatedPosts  = post.category ? await getRelatedPosts(post.category, slug, 3) : [];
    const breadcrumbs   = buildBreadcrumbs(post);
    const schemaScripts = schemaToScript(buildArticleSchema(post), buildBreadcrumbSchema(breadcrumbs));

    res.render("blog/post.njk", {
      post, relatedPosts, categories, breadcrumbs, schemaScripts,
      metaTitle:       post.metaTitle       || post.title,
      metaDescription: post.metaDescription || post.description,
      canonicalUrl:    post.canonicalUrl    || `${SITE_URL}/blog/${post.slug}`,
      ogTitle:         post.ogTitle         || post.title,
      ogDescription:   post.ogDescription   || post.description,
      ogImage:         post.ogImage?.url    || `${SITE_URL}/img/og-default.png`,
      noIndex:         post.noIndex || false,
    });
  } catch (e) { err500(res, e); }
}

module.exports = router;
