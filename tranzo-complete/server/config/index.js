// server/config/index.js
// Central configuration — all process.env reads happen here, nowhere else

require('dotenv').config();

const config = {
  // ── Server ─────────────────────────────────────────────────────────────────
  node_env: process.env.NODE_ENV || 'development',
  port:     parseInt(process.env.PORT, 10) || 3000,

  // ── Security ───────────────────────────────────────────────────────────────
  jwt_secret:   process.env.JWT_SECRET || 'dev-secret-change-in-production-min-64-chars',
  jwt_expires:  process.env.JWT_EXPIRES || '24h',
  admin_secret: process.env.ADMIN_SECRET || '',
  cache_purge_secret: process.env.CACHE_PURGE_SECRET || '',

  // ── Databases ──────────────────────────────────────────────────────────────
  redis_url: process.env.REDIS_URL || '',           // blank = Redis disabled (graceful)
  mongo_url: process.env.MONGO_URL ||
             process.env.MONGODB_URI ||              // backward compat with old .env
             'mongodb://localhost:27017/tranzo',

  // ── CORS ───────────────────────────────────────────────────────────────────
  // FIX: In development, allow any LAN IP so mobile testing via ipconfig works.
  // In production, set ALLOWED_ORIGINS=https://yourdomain.com
  allowed_origins: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
    : true,  // true = allow all origins in dev (required for LAN mobile testing)

  // ── Site ───────────────────────────────────────────────────────────────────
  site_url: process.env.SITE_URL || 'http://localhost:3000',
  app_url:  process.env.APP_URL  || process.env.SITE_URL || 'http://localhost:3000',

  // ── Ghost CMS ──────────────────────────────────────────────────────────────
  ghost_url:         process.env.GHOST_URL         || 'http://localhost:2368',
  ghost_content_key: process.env.GHOST_CONTENT_KEY || '',
  ghost_admin_key:   process.env.GHOST_ADMIN_KEY   || '',
  blog_page_size:    parseInt(process.env.BLOG_PAGE_SIZE, 10) || 12,

  // ── Caching (Redis TTLs) ────────────────────────────────────────────────────
  cache_ttl_list: parseInt(process.env.CACHE_TTL_LIST, 10) || 300,
  cache_ttl_post: parseInt(process.env.CACHE_TTL_POST, 10) || 600,
  cache_ttl_page: parseInt(process.env.CACHE_TTL_PAGE, 10) || 3600,

  // ── TURN / ICE servers ─────────────────────────────────────────────────────
  turn: {
    india_host: process.env.INDIA_TURN_HOST || '',
    india_user: process.env.INDIA_TURN_USER || '',
    india_pass: process.env.INDIA_TURN_PASS || '',
    metered_user: process.env.METERED_USER  || '',
    metered_pass: process.env.METERED_PASS  || '',
  },

  // ── Rate limits ────────────────────────────────────────────────────────────
  rate_limits: {
    create_room: { limit: 10,   window: 3600 },  // 10/hour
    join_room:   { limit: 30,   window: 60   },  // 30/min
    signal:      { limit: 1000, window: 1    },  // 1000/sec
    get_room:    { limit: 100,  window: 60   },  // 100/min
  },

  // ── Room defaults ──────────────────────────────────────────────────────────
  room: {
    default_max_users: 2,
    default_ttl_ms:    24 * 60 * 60 * 1000,  // 24h
    max_users_hard_limit: 10,
  },

  // ── Proxy ──────────────────────────────────────────────────────────────────
  trust_proxy: process.env.SEC_TRUST_PROXY === 'true',

  // ── Email (optional) ───────────────────────────────────────────────────────
  smtp: {
    host:     process.env.SMTP_HOST   || '',
    port:     parseInt(process.env.SMTP_PORT, 10) || 587,
    secure:   process.env.SMTP_SECURE === 'true',
    user:     process.env.SMTP_USER   || '',
    pass:     process.env.SMTP_PASS   || '',
    from:     process.env.MAIL_FROM   || 'noreply@tranzo.app',
    enabled:  !!(process.env.SMTP_HOST && process.env.SMTP_USER),
  },
};

// ── Production validation ────────────────────────────────────────────────────
if (config.node_env === 'production') {
  const errors = [];
  if (!config.jwt_secret || config.jwt_secret.includes('dev-secret'))
    errors.push('JWT_SECRET must be set (min 64 chars random)');
  if (!config.mongo_url || config.mongo_url.includes('localhost'))
    errors.push('MONGO_URL must point to production Atlas cluster');
  if (!config.admin_secret || config.admin_secret.includes('change-this'))
    errors.push('ADMIN_SECRET must be set to a secure random string');
  if (errors.length) {
    console.error('❌ Production config errors:\n  -', errors.join('\n  - '));
    process.exit(1);
  }
  console.log('✓ Production config validated');
}

module.exports = config;
