// ═══════════════════════════════════════════════════════════════
//  routes/admin.js  —  Cache purge admin routes
//
//  Mount in server.js:
//    app.use("/admin", require("./routes/admin"));
//
//  Routes:
//    GET  /admin/purge-cache          → purge ALL blog HTML cache + data cache
//    GET  /admin/purge-post/:slug     → purge one post + related list pages
//    POST /api/blog/cache-purge       → webhook-friendly purge (secret in body)
//
//  All GET routes are protected by ADMIN_SECRET query param:
//    /admin/purge-cache?secret=yourSecret
//
//  For Strapi webhook: POST /api/blog/cache-purge
//    Body: { "secret": "yourSecret", "slug": "optional-slug" }
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const router  = express.Router();

const { purgeCache }           = require("../utils/blog/strapi");
const { purgeAll, purgePost, purgePattern } = require("../middleware/pageCache");

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.CACHE_PURGE_SECRET || "change-me";

// ── Simple secret guard ───────────────────────────────────────
function guardSecret(req, res, next) {
  const secret = req.query.secret || req.body?.secret;
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden — wrong or missing secret" });
  }
  next();
}

// ── GET /admin/purge-cache  ───────────────────────────────────
// Purges EVERYTHING: all rendered HTML pages + all Strapi data cache
router.get("/purge-cache", guardSecret, async (req, res) => {
  try {
    const [htmlDeleted, dataDeleted] = await Promise.all([
      purgeAll(),
      purgeCache("*"),
    ]);
    console.log(`[Admin] Full purge — HTML pages: ${htmlDeleted}, data keys: ${dataDeleted}`);
    res.json({ ok: true, htmlDeleted, dataDeleted, message: "All blog cache cleared" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /admin/purge-post/:slug  ──────────────────────────────
// Purges only one post and all list/category pages (they show post cards)
router.get("/purge-post/:slug", guardSecret, async (req, res) => {
  const { slug } = req.params;
  try {
    const [htmlDeleted, dataDeleted] = await Promise.all([
      purgePost(slug),                          // HTML: post + all lists
      purgeCache(`post:${slug}`),               // data: post JSON
      purgeCache(`related:*`),                  // data: related caches
      purgeCache(`list:*`),                     // data: list pages
    ]);
    console.log(`[Admin] Post purge "${slug}" — HTML: ${htmlDeleted}, data: ${dataDeleted}`);
    res.json({ ok: true, slug, htmlDeleted, dataDeleted });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/blog/cache-purge  ───────────────────────────────
// Strapi webhook endpoint — fires on entry.publish / entry.update
// Body: { secret, slug? }   slug absent = purge all
router.post("/strapi-webhook", guardSecret, async (req, res) => {
  const { slug, model } = req.body || {};

  // Only act on post/author model events
  if (model && model !== "post" && model !== "author") {
    return res.json({ ok: true, skipped: true, model });
  }

  try {
    if (slug) {
      const [htmlDeleted, dataDeleted] = await Promise.all([
        purgePost(slug),
        purgeCache(`post:${slug}`),
        purgeCache("related:*"),
        purgeCache("list:*"),
      ]);
      res.json({ ok: true, slug, htmlDeleted, dataDeleted });
    } else {
      const [htmlDeleted, dataDeleted] = await Promise.all([
        purgeAll(),
        purgeCache("*"),
      ]);
      res.json({ ok: true, htmlDeleted, dataDeleted });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
