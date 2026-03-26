// ─────────────────────────────────────────────────────────────────────────────
//  sitemap.js  —  Sitemap index + static pages sitemap for Tranzo
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.SITE_URL || "https://share.rumnnlg.com";

const ROUTES = [
  { loc: "/",                            changefreq: "daily",   priority: "1.0" },
  { loc: "/send-large-files",            changefreq: "weekly",  priority: "0.9" },
  { loc: "/android-to-pc-file-transfer", changefreq: "weekly",  priority: "0.9" },
  { loc: "/webrtc-file-transfer",        changefreq: "weekly",  priority: "0.9" },
  { loc: "/blog",                        changefreq: "daily",   priority: "0.8" },
  { loc: "/how-it-works",                changefreq: "monthly", priority: "0.8" },
  { loc: "/security",                    changefreq: "monthly", priority: "0.8" },
  { loc: "/faq",                         changefreq: "weekly",  priority: "0.7" },
  { loc: "/about",                       changefreq: "monthly", priority: "0.7" },
  { loc: "/contact",                     changefreq: "yearly",  priority: "0.5" },
  { loc: "/privacy",                     changefreq: "yearly",  priority: "0.5" },
  { loc: "/terms",                       changefreq: "yearly",  priority: "0.5" },
  { loc: "/cookies",                     changefreq: "yearly",  priority: "0.5" },
  { loc: "/disclaimer",                  changefreq: "yearly",  priority: "0.5" },
];

// /sitemap.xml → sitemap index pointing to static + blog child sitemaps
function sitemapHandler(req, res) {
  const today = new Date().toISOString().split("T")[0];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <sitemap>",
    `    <loc>${BASE_URL}/sitemap-static.xml</loc>`,
    `    <lastmod>${today}</lastmod>`,
    "  </sitemap>",
    "  <sitemap>",
    `    <loc>${BASE_URL}/blog-sitemap.xml</loc>`,
    `    <lastmod>${today}</lastmod>`,
    "  </sitemap>",
    "</sitemapindex>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
}

// /sitemap-static.xml → static page URLs only
function staticSitemapHandler(req, res) {
  const today = new Date().toISOString().split("T")[0];

  const urls = ROUTES.map(r => [
    "  <url>",
    `    <loc>${BASE_URL}${r.loc}</loc>`,
    `    <lastmod>${r.lastmod || today}</lastmod>`,
    `    <changefreq>${r.changefreq}</changefreq>`,
    `    <priority>${r.priority}</priority>`,
    "  </url>",
  ].join("\n")).join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
}

module.exports = { sitemapHandler, staticSitemapHandler, ROUTES };
