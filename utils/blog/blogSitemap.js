// ═══════════════════════════════════════════════════════════════
//  utils/blog/blogSitemap.js  —  /blog-sitemap.xml handler
// ═══════════════════════════════════════════════════════════════

const { getAllPostSlugs } = require("./strapi");

const BASE_URL = process.env.SITE_URL || "https://share.rumnnlg.com";

async function blogSitemapHandler(req, res) {
  try {
    const slugs = await getAllPostSlugs();
    const today = new Date().toISOString().split("T")[0];

    const urls = slugs.map(({ slug, publishedDate }) => {
      const lastmod = publishedDate
        ? new Date(publishedDate).toISOString().split("T")[0]
        : today;
      return [
        "  <url>",
        `    <loc>${BASE_URL}/blog/${slug}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>monthly</changefreq>`,
        `    <priority>0.7</priority>`,
        "  </url>",
      ].join("\n");
    });

    const staticUrls = [
      `  <url>\n    <loc>${BASE_URL}/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticUrls,
      ...urls,
      "</urlset>",
    ].join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (e) {
    console.error("[BlogSitemap] Error:", e.message);
    res.status(500).send("<!-- sitemap generation error -->");
  }
}

module.exports = { blogSitemapHandler };
