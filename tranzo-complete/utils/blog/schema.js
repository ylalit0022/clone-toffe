// ═══════════════════════════════════════════════════════════════
//  utils/blog/schema.js  —  JSON-LD schema markup generator
// ═══════════════════════════════════════════════════════════════

const SITE_NAME = "Tranzo";
const SITE_URL  = process.env.SITE_URL || "https://share.rumnnlg.com";
const SITE_LOGO = `${SITE_URL}/img/logo.png`;

function buildArticleSchema(post) {
  if (!post) return null;

  const type = post.schemaType || "BlogPosting";
  const url  = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type":    type,
    "@id":      url + "#article",
    "headline": post.metaTitle || post.title,
    "name":     post.title,
    "description": post.metaDescription || post.description,
    "url":      url,
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "datePublished": post.publishedDate || new Date().toISOString(),
    "dateModified":  post.updatedAt    || post.publishedDate || new Date().toISOString(),
    "inLanguage":    "en-IN",
    "publisher": {
      "@type": "Organization",
      "name":  SITE_NAME,
      "url":   SITE_URL,
      "logo":  { "@type": "ImageObject", "url": SITE_LOGO, "width": 192, "height": 192 },
    },
    "isPartOf": {
      "@type": "Blog",
      "name":  `${SITE_NAME} Blog`,
      "url":   `${SITE_URL}/blog`,
    },
    "keywords": post.category
      ? [post.category, "file transfer", "WebRTC"]
      : ["file transfer", "WebRTC"],
  };

  if (post.coverImage?.url) {
    schema.image = {
      "@type": "ImageObject",
      "url":   post.coverImage.url,
      "width":  post.coverImage.width  || 1200,
      "height": post.coverImage.height || 630,
    };
  }

  if (post.author) {
    schema.author = buildPersonSchema(post.author);
  } else {
    schema.author = { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL };
  }

  if (post.content) {
    const words = post.content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
    schema.wordCount = words;
  }

  return schema;
}

function buildBreadcrumbSchema(breadcrumbs) {
  if (!breadcrumbs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, i) => ({
      "@type":    "ListItem",
      "position": i + 1,
      "name":     crumb.label,
      ...(crumb.url ? { "item": crumb.url } : {}),
    })),
  };
}

function buildPersonSchema(author) {
  if (!author) return null;
  const s = { "@type": "Person", "name": author.name };
  if (author.bio)      s.description = author.bio;
  if (author.twitter)  s.sameAs      = [author.twitter];
  if (author.website)  s.url         = author.website;
  if (author.avatar)   s.image       = { "@type": "ImageObject", "url": author.avatar };
  if (author.role)     s.jobTitle    = author.role;
  return s;
}

function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type":    "WebSite",
    "name":     SITE_NAME,
    "url":      SITE_URL,
    "potentialAction": {
      "@type":  "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/blog?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

function schemaToScript(...schemas) {
  const valid = schemas.filter(Boolean);
  if (!valid.length) return "";
  const payload = valid.length === 1 ? valid[0] : valid;
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function buildBreadcrumbs(post) {
  const crumbs = [
    { label: "Home", url: SITE_URL },
    { label: "Blog", url: `${SITE_URL}/blog` },
  ];
  if (post.category) {
    crumbs.push({
      label: post.category,
      url:   `${SITE_URL}/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`,
    });
  }
  crumbs.push({
    label: post.title,
    url:   post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`,
  });
  return crumbs;
}

module.exports = {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildPersonSchema,
  buildWebsiteSchema,
  buildBreadcrumbs,
  schemaToScript,
  SITE_URL,
  SITE_NAME,
};
