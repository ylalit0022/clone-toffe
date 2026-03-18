// ═══════════════════════════════════════════════════════════════
//  middleware/pageCache.js  —  Redis HTML page cache
//
//  HOW IT WORKS
//  ─────────────
//  1. On every GET request the middleware checks Redis for a
//     cached copy of the rendered HTML (key = "page:<url>").
//  2. Cache HIT  → send saved HTML immediately, no Express render.
//  3. Cache MISS → monkey-patch res.render so that after Nunjucks
//     finishes rendering, the HTML is stored in Redis before being
//     sent to the browser.
//
//  CACHE KEYS
//  ──────────
//  page:/blog/page/1
//  page:/blog/my-post-slug
//  page:/blog/category/tips/page/1
//  page:/blog/author/john-doe
//
//  PURGE HELPERS  (exported for use in admin routes)
//  ────────────────────────────────────────────────
//  purgeUrl(url)          → delete one page key
//  purgePattern(pattern)  → delete all keys matching glob
//  purgeAll()             → delete every page:* key
// ═══════════════════════════════════════════════════════════════

const { createClient } = require("redis");

const PAGE_PREFIX = "page:";
const PAGE_TTL    = parseInt(process.env.CACHE_TTL_PAGE || "3600"); // 1 hour default
const REDIS_URL   = process.env.REDIS_URL || "";

let _redis = null;

// ── Lazy Redis connection ─────────────────────────────────────
async function getRedis() {
  if (_redis) return _redis;
  if (!REDIS_URL) return null;
  try {
    _redis = createClient({ url: REDIS_URL });
    _redis.on("error", e => console.warn("[PageCache] Redis error:", e.message));
    await _redis.connect();
    console.log("[PageCache] Redis connected — page caching active");
  } catch (e) {
    console.warn("[PageCache] Redis unavailable — page caching disabled:", e.message);
    _redis = null;
  }
  return _redis;
}

// ── Internal helpers ─────────────────────────────────────────
function pageKey(url) {
  // Strip query strings — cached pages are keyed by path only
  const path = url.split("?")[0].replace(/\/$/, "") || "/";
  return PAGE_PREFIX + path;
}

async function redisGet(key) {
  const r = await getRedis();
  if (!r) return null;
  try { return await r.get(key); } catch { return null; }
}

async function redisSet(key, html) {
  const r = await getRedis();
  if (!r) return;
  try { await r.setEx(key, PAGE_TTL, html); } catch {}
}

async function redisDel(keys) {
  const r = await getRedis();
  if (!r || !keys.length) return 0;
  try { await r.del(keys); return keys.length; } catch { return 0; }
}

async function redisScan(pattern) {
  const r = await getRedis();
  if (!r) return [];
  const keys = [];
  let cursor = 0;
  try {
    do {
      const res = await r.scan(cursor, { MATCH: pattern, COUNT: 200 });
      cursor = res.cursor;
      keys.push(...res.keys);
    } while (cursor !== 0);
  } catch {}
  return keys;
}

// ── Express middleware ────────────────────────────────────────
// Only caches GET requests for /blog/* paths.
// Never caches admin, API, or non-GET requests.
function pageCacheMiddleware(req, res, next) {
  // Only cache GET requests on blog pages
  if (req.method !== "GET" || !req.path.startsWith("/blog")) return next();

  const key = pageKey(req.path);

  // Async wrapper — we must not await in the sync middleware signature
  // so we call an inner async function and handle errors cleanly
  ;(async () => {
    const cached = await redisGet(key);
    if (cached) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Cache", "HIT");
      return res.send(cached);
    }

    // Cache MISS — patch res.render to capture rendered HTML
    res.setHeader("X-Cache", "MISS");
    const originalRender = res.render.bind(res);

    res.render = function (view, locals, callback) {
      // Normalise the three calling conventions Express supports
      if (typeof locals === "function") {
        callback = locals;
        locals   = {};
      }

      const done = callback || function (err, html) {
        if (err) return next(err);
        // Store in Redis before sending
        redisSet(key, html).catch(() => {});
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
      };

      // If caller passed an explicit callback, wrap it to also cache
      if (callback) {
        const wrappedCb = (err, html) => {
          if (!err) redisSet(key, html).catch(() => {});
          callback(err, html);
        };
        return originalRender(view, locals || {}, wrappedCb);
      }

      originalRender(view, locals || {}, done);
    };

    next();
  })().catch(next);
}

// ── Purge helpers (used by admin routes) ─────────────────────

/** Purge the cached HTML for one exact URL path */
async function purgeUrl(urlPath) {
  const key = pageKey(urlPath);
  return redisDel([key]);
}

/** Purge all page cache keys matching a glob pattern
 *  e.g. purgePattern("page:/blog/category/*")
 */
async function purgePattern(pattern) {
  const keys = await redisScan(pattern);
  return redisDel(keys);
}

/** Purge every cached blog page */
async function purgeAll() {
  return purgePattern(PAGE_PREFIX + "*");
}

/** Purge everything related to one post slug:
 *  - the post page itself
 *  - all list/category pages (they show post cards that may have changed)
 */
async function purgePost(slug) {
  const postKeys  = await redisScan(`${PAGE_PREFIX}/blog/${slug}`);
  const listKeys  = await redisScan(`${PAGE_PREFIX}/blog/page/*`);
  const catKeys   = await redisScan(`${PAGE_PREFIX}/blog/category/*`);
  const authorKeys= await redisScan(`${PAGE_PREFIX}/blog/author/*`);
  const all = [...postKeys, ...listKeys, ...catKeys, ...authorKeys];
  return redisDel(all);
}

module.exports = {
  pageCacheMiddleware,
  purgeUrl,
  purgePattern,
  purgeAll,
  purgePost,
};
