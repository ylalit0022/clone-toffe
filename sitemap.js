// ─────────────────────────────────────────────────────────────────────────────
//  sitemap.js  —  Dynamic sitemap generator for Tranzo
//
//  HOW TO ADD A NEW ROUTE TO THE SITEMAP
//  ======================================
//  1. Add a new entry to the ROUTES array below.
//  2. That's it. The sitemap at /sitemap.xml auto-regenerates on every request.
//
//  ROUTE OBJECT SHAPE:
//  {
//    loc:        '/path',            // URL path (no trailing slash)
//    changefreq: 'weekly',           // always|hourly|daily|weekly|monthly|yearly|never
//    priority:   '0.8',              // 0.0 – 1.0 (string)
//    lastmod:    '2025-01-01',       // YYYY-MM-DD  (omit for auto = today)
//  }
//
//  PRIORITY GUIDE:
//    1.0  — homepage only
//    0.9  — primary feature / landing pages
//    0.8  — secondary feature pages
//    0.7  — informational pages (how it works, faq, about)
//    0.5  — legal pages (privacy, terms, cookies, disclaimer, contact)
//
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://share.rumnnlg.com';

// ── ADD / REMOVE ROUTES HERE ─────────────────────────────────────────────────
const ROUTES = [
  // Homepage
  { loc: '/',                          changefreq: 'daily',   priority: '1.0' },

  // Feature / landing pages
  { loc: '/send-large-files',          changefreq: 'weekly',  priority: '0.9' },
  { loc: '/android-to-pc-file-transfer', changefreq: 'weekly', priority: '0.9' },
  { loc: '/webrtc-file-transfer',      changefreq: 'weekly',  priority: '0.9' },

  // Informational
  { loc: '/how-it-works',              changefreq: 'monthly', priority: '0.8' },
  { loc: '/security',                  changefreq: 'monthly', priority: '0.8' },
  { loc: '/faq',                       changefreq: 'weekly',  priority: '0.7' },
  { loc: '/about',                     changefreq: 'monthly', priority: '0.7' },

  // Legal / contact
  { loc: '/contact',                   changefreq: 'yearly',  priority: '0.5' },
  { loc: '/privacy',                   changefreq: 'yearly',  priority: '0.5' },
  { loc: '/terms',                     changefreq: 'yearly',  priority: '0.5' },
  { loc: '/cookies',                   changefreq: 'yearly',  priority: '0.5' },
  { loc: '/disclaimer',                changefreq: 'yearly',  priority: '0.5' },
];
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Express route handler — generates and serves sitemap.xml
 * Mount with:  app.get('/sitemap.xml', sitemapHandler);
 */
function sitemapHandler(req, res) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const urls = ROUTES.map(r => {
    const lastmod = r.lastmod || today;
    return [
      '  <url>',
      `    <loc>${BASE_URL}${r.loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    urls,
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1 hour
  res.send(xml);
}

module.exports = { sitemapHandler, ROUTES };
