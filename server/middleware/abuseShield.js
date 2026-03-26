// server/middleware/abuseShield.js
// Comprehensive abuse prevention: DDoS, Socket.IO spam, API abuse, bot detection
// Zero-dependency beyond existing redis + express stack

'use strict';

// ════════════════════════════════════════════════════════════════
// In-memory fallback store (when Redis unavailable)
// ════════════════════════════════════════════════════════════════

class MemStore {
  constructor() { this._data = new Map(); }
  get(k)           { const e = this._data.get(k); if (!e || Date.now() > e.exp) return null; return e.val; }
  set(k, v, ttlMs) { this._data.set(k, { val: v, exp: Date.now() + ttlMs }); }
  inc(k, ttlMs)    { const cur = this.get(k) || 0; this.set(k, cur + 1, ttlMs); return cur + 1; }
  del(k)           { this._data.delete(k); }
  cleanup()        { const now = Date.now(); this._data.forEach((v,k) => { if (now > v.exp) this._data.delete(k); }); }
}

const _mem = new MemStore();
setInterval(() => _mem.cleanup(), 60_000);

// ════════════════════════════════════════════════════════════════
// IP extraction (handles Cloudflare, Nginx, direct)
// ════════════════════════════════════════════════════════════════

function extractIp(req) {
  // Cloudflare real IP header
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return cf.trim();
  // Standard proxy header
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  // Fallback
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// ════════════════════════════════════════════════════════════════
// Blocklist — permanent and temporary bans
// ════════════════════════════════════════════════════════════════

const _blocked = new Set();  // permanent blocks (in-memory, restart to clear)
const _tempBlocked = new Map(); // ip → unbanTime

function isBlocked(ip) {
  if (_blocked.has(ip)) return true;
  const until = _tempBlocked.get(ip);
  if (until) {
    if (Date.now() < until) return true;
    _tempBlocked.delete(ip);
  }
  return false;
}

function tempBlock(ip, durationMs, reason) {
  _tempBlocked.set(ip, Date.now() + durationMs);
  console.warn(`[SHIELD] Temp blocked ${ip} for ${durationMs/1000}s — ${reason}`);
}

// ════════════════════════════════════════════════════════════════
// Sliding-window counter (in-memory, fast)
// ════════════════════════════════════════════════════════════════

function swCount(ip, action, windowMs, limit) {
  const key = `${action}:${ip}`;
  const count = _mem.inc(key, windowMs);
  return { allowed: count <= limit, count, limit };
}

// ════════════════════════════════════════════════════════════════
// REQUEST SIZE GUARD
// ════════════════════════════════════════════════════════════════

function requestSizeGuard(maxBytes = 50_000) {
  return (req, res, next) => {
    const len = parseInt(req.headers['content-length'] || '0', 10);
    if (len > maxBytes) {
      return res.status(413).json({ error: 'Payload too large' });
    }
    next();
  };
}

// ════════════════════════════════════════════════════════════════
// BOT / SCANNER DETECTION
// ════════════════════════════════════════════════════════════════

const _BAD_UA_PATTERNS = [
  /curl\/[0-9]/i, /python-requests/i, /go-http-client/i, /java\//i,
  /nikto/i, /sqlmap/i, /nmap/i, /masscan/i, /zgrab/i, /scrapy/i,
  /bot(?!.*googlebot|.*bingbot|.*slurp)/i, /crawler/i, /scanner/i,
];

function isSuspiciousUA(ua) {
  // FIX: Don't block on short/blank UA — Android WebView and some mobile
  // browsers send minimal UAs on sub-requests. Only block known bad patterns.
  if (!ua) return false;
  return _BAD_UA_PATTERNS.some(p => p.test(ua));
}

// ════════════════════════════════════════════════════════════════
// API ABUSE MIDDLEWARE
// Usage: app.use('/api/', apiAbuseGuard())
// ════════════════════════════════════════════════════════════════

function apiAbuseGuard(opts = {}) {
  const {
    globalRpm  = 300,   // requests per minute per IP across all API
    burstRps   = 20,    // requests per second (burst)
    blockOnBot = true,
  } = opts;

  return (req, res, next) => {
    const ip = extractIp(req);
    req.clientIp = ip;

    // 1. Blocklist check
    if (isBlocked(ip)) {
      return res.status(429).json({ error: 'Access denied' });
    }

    // 2. Bot/scanner detection
    if (blockOnBot && isSuspiciousUA(req.headers['user-agent'])) {
      tempBlock(ip, 10 * 60_000, 'suspicious UA');
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 3. Global RPM check
    const rpm = swCount(ip, 'api_rpm', 60_000, globalRpm);
    if (!rpm.allowed) {
      if (rpm.count > globalRpm * 3) tempBlock(ip, 5 * 60_000, 'extreme API abuse');
      return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: 60 });
    }

    // 4. Burst check (per second)
    const burst = swCount(ip, 'api_burst', 1_000, burstRps);
    if (!burst.allowed) {
      return res.status(429).json({ error: 'Slow down', retryAfter: 1 });
    }

    next();
  };
}

// ════════════════════════════════════════════════════════════════
// SOCKET.IO ABUSE GUARD
// Call this inside io.use() middleware
// ════════════════════════════════════════════════════════════════

// Track per-IP socket connections
const _socketConns = new Map();  // ip → Set of socket IDs

function socketAbuseGuard(opts = {}) {
  const {
    maxConnsPerIp = 5,    // max simultaneous sockets per IP
    connRateLimit = 10,   // max connects per minute per IP
  } = opts;

  return (socket, next) => {
    const ip = socket.handshake.headers['cf-connecting-ip']
             || socket.handshake.headers['x-forwarded-for']?.split(',')[0].trim()
             || socket.handshake.address
             || 'unknown';

    socket._clientIp = ip;

    // 1. IP block check
    if (isBlocked(ip)) {
      return next(new Error('Access denied'));
    }

    // 2. Connection rate check (prevent rapid reconnect attacks)
    const rate = swCount(ip, 'sock_conn', 60_000, connRateLimit);
    if (!rate.allowed) {
      if (rate.count > connRateLimit * 2) tempBlock(ip, 2 * 60_000, 'rapid socket reconnects');
      return next(new Error('Too many connections'));
    }

    // 3. Max concurrent sockets per IP
    if (!_socketConns.has(ip)) _socketConns.set(ip, new Set());
    const conns = _socketConns.get(ip);

    if (conns.size >= maxConnsPerIp) {
      return next(new Error('Too many concurrent connections'));
    }

    conns.add(socket.id);

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      conns.delete(socket.id);
      if (conns.size === 0) _socketConns.delete(ip);
    });

    next();
  };
}

// ════════════════════════════════════════════════════════════════
// SOCKET EVENT RATE LIMITER
// Call per-event inside io.on('connection')
// Usage: if (!socketEventGuard(socket, 'webrtc-offer')) return;
// ════════════════════════════════════════════════════════════════

function socketEventGuard(socket, event, limitPerMin = 60) {
  const ip  = socket._clientIp || socket.handshake.address;
  const key = `sock_ev:${event}:${ip}`;
  const r   = swCount(ip, key, 60_000, limitPerMin);
  if (!r.allowed) {
    console.warn(`[SHIELD] Socket event flood: ${event} from ${ip} (${r.count}/${r.limit})`);
    if (r.count > limitPerMin * 5) {
      socket.disconnect(true);
      tempBlock(ip, 5 * 60_000, `event flood: ${event}`);
    }
    return false;
  }
  return true;
}

// ════════════════════════════════════════════════════════════════
// ROOM CREATION ABUSE (extra layer on top of RateLimiter.js)
// ════════════════════════════════════════════════════════════════

function roomCreationGuard(opts = {}) {
  const { maxPerHour = 10, maxPerDay = 30 } = opts;

  return (req, res, next) => {
    const ip = req.clientIp || extractIp(req);

    const hourly = swCount(ip, 'room_create_h', 3600_000, maxPerHour);
    if (!hourly.allowed) {
      return res.status(429).json({ error: 'Room creation limit reached. Try again later.', retryAfter: 3600 });
    }

    const daily = swCount(ip, 'room_create_d', 86400_000, maxPerDay);
    if (!daily.allowed) {
      tempBlock(ip, 60 * 60_000, 'room creation abuse'); // 1h ban
      return res.status(429).json({ error: 'Daily limit reached', retryAfter: 86400 });
    }

    next();
  };
}

// ════════════════════════════════════════════════════════════════
// SECURITY RESPONSE HEADERS
// ════════════════════════════════════════════════════════════════

function securityHeaders() {
  return (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Don't leak server info
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    next();
  };
}

// ════════════════════════════════════════════════════════════════
// SUSPICIOUS ACTIVITY LOGGER
// ════════════════════════════════════════════════════════════════

const _abuseLog = [];  // ring buffer, last 500 events
const _ABUSE_LOG_SIZE = 500;

function logAbuse(type, ip, detail) {
  const entry = { ts: new Date().toISOString(), type, ip, detail };
  if (_abuseLog.length >= _ABUSE_LOG_SIZE) _abuseLog.shift();
  _abuseLog.push(entry);
  console.warn(`[SHIELD] ${type} | ${ip} | ${detail}`);
}

function getAbuseLog(limit = 50) {
  return _abuseLog.slice(-limit);
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  extractIp,
  apiAbuseGuard,
  socketAbuseGuard,
  socketEventGuard,
  roomCreationGuard,
  requestSizeGuard,
  securityHeaders,
  tempBlock,
  isBlocked,
  logAbuse,
  getAbuseLog,
};
