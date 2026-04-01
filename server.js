// server.js — Tranzo v2
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const nunjucks = require('nunjucks');
const os = require('os');

const RoomManager = require('./server/services/RoomManager');
const IceManager = require('./server/services/IceManager');
const AuditLogger = require('./server/services/AuditLogger');
const RateLimiter = require('./server/services/RateLimiter');

const {
  apiAbuseGuard, socketAbuseGuard, socketEventGuard,
  roomCreationGuard, requestSizeGuard, securityHeaders,
  extractIp,
} = require('./server/middleware/abuseShield');

const { getClientIp, createToken } = require('./server/middleware/security');
const errorHandler = require('./server/middleware/errorHandler');
const roomsRouter = require('./server/routes/rooms');
const iceRouter = require('./server/routes/ice');
const redis = require('./server/db/redis');
const { connectDB } = require('./server/db/mongodb');
const config = require('./server/config');

// IS_DEV: true when NODE_ENV=development (default)
// All security guards are OFF in dev so LAN/Android testing always works
const IS_DEV = config.node_env !== 'production';

let blogRouter = null;
try { blogRouter = require('./routes/blog'); } catch (e) { console.warn('Blog routes not loaded:', e.message); }

// ── In-memory room store ──────────────────────────────────────────────────────
const socketMeta = new Map();  // socketId → { roomId, deviceName }
const rooms = new Map();  // roomId   → Set<{ socketId, deviceName }>


//   ADD immediately below it:
// ─────────────────────────────────────────────────────────────────────────────

// ── WebRTC in-memory stats ────────────────────────────────────────────────────
const webrtcStats = {
  totalConnections: 0,   // every socket.io connection ever made
  turnConnections: 0,   // sockets that reported type === 'turn'
  stunConnections: 0,   // sockets that reported type === 'wan'  (STUN-resolved)
  directConnections: 0,   // sockets that reported type === 'lan'  (direct P2P)
  activeUsers: 0,   // current live sockets in any room
};


function getRoomMembers(roomId) {
  return rooms.has(roomId) ? [...rooms.get(roomId)] : [];
}
function addToRoom(roomId, socketId, deviceName) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId).forEach(m => { if (m.socketId === socketId) rooms.get(roomId).delete(m); });
  rooms.get(roomId).add({ socketId, deviceName });
}
function removeFromRoom(roomId, socketId) {
  if (!rooms.has(roomId)) return;
  rooms.get(roomId).forEach(m => { if (m.socketId === socketId) rooms.get(roomId).delete(m); });
  if (rooms.get(roomId).size === 0) rooms.delete(roomId);
}

// ── App + Socket.IO ───────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // FIX: Use an explicit origin function instead of origin:true in dev.
    // origin:true reflects any Origin header back as ACAO, which allows any
    // website to make credentialed requests — a real CORS misconfiguration.
    // Instead: allow localhost on any port + LAN IP patterns in dev.
    origin: IS_DEV
      ? (origin, cb) => {
        // Allow: no-origin requests (same-origin, Postman, curl)
        if (!origin) return cb(null, true);
        // Allow: localhost and 127.0.0.1 on any port
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
        // Allow: LAN IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin)) return cb(null, true);
        // Block everything else — even in dev
        return cb(null, false);
      }
      : config.allowed_origins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  maxHttpBufferSize: 1e5,
  pingTimeout: 20000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000, skipMiddlewares: true },
});

// ── Views ─────────────────────────────────────────────────────────────────────
const njkEnv = nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true, express: app,
  watch: IS_DEV,
  noCache: IS_DEV,
});
app.set('view engine', 'njk');
app.set('views', path.join(__dirname, 'views'));
njkEnv.addGlobal('siteUrl', config.site_url);
njkEnv.addGlobal('siteName', 'Tranzo');
njkEnv.addGlobal('year', new Date().getFullYear());
njkEnv.addGlobal('pwaEnabled', true);
njkEnv.addGlobal('ghostUrl', config.ghost_url);

// ── Security headers (always on) ──────────────────────────────────────────────
app.set('trust proxy', config.trust_proxy);
app.use(securityHeaders());

// Helmet CSP: OFF in dev (LAN IP breaks 'self' rule), ON in prod
app.use(helmet({
  // FIX: Set frameguard to 'deny' explicitly.
  // helmet's default is SAMEORIGIN, which conflicts with our abuseShield
  // securityHeaders() that sets DENY. helmet runs last and overwrites it.
  // Setting it here ensures helmet outputs DENY, matching our policy.
  frameguard: { action: 'deny' },
  contentSecurityPolicy: IS_DEV ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com', 'fonts.googleapis.com'],
      connectSrc: ["'self'", 'wss:', 'ws:'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      workerSrc: ["'self'", 'blob:'],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── Core middleware ────────────────────────────────────────────────────────────
// HTTP CORS — same origin policy as Socket.IO above
app.use(cors({
  origin: IS_DEV
    ? (origin, cb) => {
      if (!origin) return cb(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin)) return cb(null, true);
      return cb(null, false);
    }
    : config.allowed_origins,
  credentials: true,
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
if (!IS_DEV) app.use(requestSizeGuard(100_000));  // size guard: prod only
// ── Block sensitive server-side files ────────────────────────────────────────
// Explicitly reject requests for source code and config files that should
// NEVER be served over HTTP, regardless of how the server is configured.
// This is a defence-in-depth layer — production nginx also blocks these,
// but the app-level block ensures they can't leak in any environment.
const BLOCKED_PATHS = /^\/?(server\.js|\.env.*|config\.js|package\.json|package-lock\.json|yarn\.lock|\.git|node_modules|\.npmrc|\.eslintrc|Dockerfile|docker-compose)/i;
app.use((req, res, next) => {
  if (BLOCKED_PATHS.test(req.path)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// ── Intercept /manifest.json BEFORE express.static ──────────────────────────
// public/manifest.json is an old incomplete file (no id, no purpose fields,
// wrong icon paths). express.static would serve it first and break PWA install.
// next('route') skips to the real manifest handler registered further below.
app.get('/manifest.json', (req, res, next) => next('route'));

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: IS_DEV ? 0 : '1d',
  setHeaders(res, fp) {
    if (fp.endsWith('sw.js')) {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));
app.use((req, res, next) => { req.clientIp = extractIp(req); next(); });

// ── Services init ─────────────────────────────────────────────────────────────
let roomManager, iceManager, auditLogger, rateLimiter;

// IceManager only needs env vars — initialize immediately, no DB/Redis dependency
iceManager = new IceManager(null);
rateLimiter = new RateLimiter(redis.client);
iceRouter.setDependencies(iceManager, rateLimiter);
console.log('✓ IceManager ready (independent of DB)');

// RoomManager + AuditLogger need MongoDB — initialize separately
(async () => {
  try {
    const db = await connectDB();
    roomManager = new RoomManager(redis.client, db);
    auditLogger = new AuditLogger(db);
    roomsRouter.setDependencies(roomManager, auditLogger, rateLimiter);
    console.log('✓ All DB services initialized');
  } catch (err) {
    console.error('❌ Service init:', err.message);
    if (!IS_DEV) process.exit(1);
    console.warn('⚠️  Running in degraded mode (no DB)');
  }
})();

// ── REST API routes ────────────────────────────────────────────────────────────
// API abuse guard: prod only
if (!IS_DEV) app.use('/api/', apiAbuseGuard({ globalRpm: 300, burstRps: 20 }));

app.use('/api/v1/rooms', (req, res, next) => {
  if (!roomManager) return res.status(503).json({ error: 'Service initializing, retry in a moment' });
  // Room creation guard: prod only
  if (!IS_DEV && req.method === 'POST' && !req.path.includes('/join') && !req.path.includes('/leave')) {
    return roomCreationGuard({ maxPerHour: 10, maxPerDay: 30 })(req, res, next);
  }
  next();
});
app.use('/api/v1/rooms', roomsRouter);
app.use('/api/v1/ice', iceRouter);

// ── Utility endpoints ──────────────────────────────────────────────────────────
// /ping — bare connectivity check, no auth, no middleware
app.get('/ping', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, ts: Date.now(), env: config.node_env });
});

// /pwa-debug — quick PWA installability diagnosis (dev only)
app.get('/pwa-debug', (req, res) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const host = req.headers.host || '';
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const isLanIp = /^(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[01]))/.test(host);

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    pwaDebug: true,
    secure: isSecure,
    host,
    isLocalhost,
    isLanIp,
    pwaInstallable: isSecure || isLocalhost,
    note: isLanIp && !isSecure
      ? 'LAN IP over HTTP: Chrome on Android will NOT install PWA. Use port forwarding or chrome://flags/#unsafely-treat-insecure-origin-as-secure'
      : isLocalhost
        ? 'localhost: PWA installable on desktop Chrome without HTTPS'
        : isSecure
          ? 'HTTPS: PWA installable on all platforms'
          : 'Unknown context',
    manifest: '/manifest.json',
    sw: '/sw.js',
  });
});

app.get('/api/health', (req, res) => {
  // SECURITY: Don't leak version/uptime in production (reduces fingerprinting surface)
  const body = { status: 'ok' };
  if (!IS_DEV) return res.json(body);
  res.json({ ...body, version: '2.0.0', pwa: true, uptime: Math.round(process.uptime()) });
});

app.get('/api/ice-config', async (req, res) => {
  try { if (iceManager) return res.json(await iceManager.getServers()); } catch { }
  res.json({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
    ]
  });
});

app.get('/api/site-config', (req, res) => {
  // SECURITY: Don't expose internal TURN host IPs to the public.
  // The client only needs these for RTT display labels — pass a boolean instead.
  res.json({ siteUrl: config.site_url, pwa: true, hasTurn: !!(config.turn?.india_host) });
});

app.post('/api/blog/cache-purge', (req, res) => {
  const secret = req.headers['x-cache-purge-secret'] || req.query.secret;
  if (!config.cache_purge_secret || secret !== config.cache_purge_secret)
    return res.status(401).json({ error: 'Unauthorized' });
  res.json({ ok: true, message: 'Cache purged' });
});

// GET /api/admin/stats — WebRTC connection analytics
// No auth guard in dev; add your own middleware in prod if needed
app.get('/api/admin/stats', (req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    stats: { ...webrtcStats },
    roomCount: rooms.size,
    socketCount: io.sockets.sockets.size,
  });
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  // FIX: Use 'anonymous' not 'use-credentials' since ACAO is '*'.
  // Sending credentials with a wildcard ACAO causes a CORS error in some browsers.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.json({
    id: '/',                          // FIX: stable app identity for Chrome 96+
    name: 'Tranzo – P2P File Transfer',
    short_name: 'Tranzo',
    description: 'Transfer files directly. No cloud. No signup.',
    start_url: '/?source=pwa',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#059669',
    orientation: 'any',
    scope: '/',
    lang: 'en',
    icons: [
      // FIX: 'any' and 'maskable' MUST be separate entries.
      // Chrome 93+ rejects 'any maskable' as a single purpose string,
      // which silently blocks the installability check on Android.
      { src: '/img/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/img/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Create Room', url: '/?action=create', icons: [{ src: '/img/icon-192.png', sizes: '192x192' }] },
    ],
    prefer_related_applications: false,
    categories: ['utilities', 'productivity'],
  });
});

// ── Page routes ───────────────────────────────────────────────────────────────
app.get('/', (req, res) =>
  res.render('pages/index.njk', { autoJoinRoom: req.query.room || null, autoCreate: req.query.action === 'create' })
);
app.get('/room/:roomId', (req, res) => res.render('pages/index.njk', { autoJoinRoom: req.params.roomId }));

const staticPages = [
  '/about', '/how-it-works', '/faq', '/privacy', '/terms', '/security',
  '/contact', '/cookies', '/disclaimer', '/send-large-files',
  '/android-to-pc-file-transfer', '/webrtc-file-transfer',
];
staticPages.forEach(p => app.get(p, (req, res) => res.render('pages' + p + '.njk')));

app.get('/auth/login', (req, res) => res.render('pages/auth/login.njk'));
app.get('/auth/register', (req, res) => res.render('pages/auth/register.njk'));
app.get('/account/sessions', (req, res) => res.render('pages/account/sessions.njk'));

if (blogRouter) {
  app.use('/blog', blogRouter);
} else {
  app.get('/blog', (req, res) => res.render('blog/list.njk', { posts: [], pagination: null }));
  app.get('/blog/author/:name', (req, res) => res.render('blog/author.njk', { author: req.params.name, posts: [] }));
  app.get('/blog/:slug', (req, res) => res.render('blog/post.njk', { post: { slug: req.params.slug } }));
}

app.use((req, res) => res.status(404).render('pages/404.njk'));

// ── Socket.IO ─────────────────────────────────────────────────────────────────
// Socket abuse guard: prod only — in dev every device connects freely
if (!IS_DEV) io.use(socketAbuseGuard({ maxConnsPerIp: 20, connRateLimit: 60 }));

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) { socket.user = null; return next(); }
  try { socket.user = jwt.verify(token, config.jwt_secret); next(); }
  catch { socket.user = null; next(); }
});

io.on('connection', (socket) => {
  const ip = socket._clientIp || socket.handshake.address;
  let currentRoom = null;
  let deviceName = socket.id.slice(0, 6);

  // Track every new Total connection
  webrtcStats.totalConnections++;

  // ── "connection-type" event — client reports its WebRTC path ──────────────
  // Payload: { type: 'lan' | 'wan' | 'turn', rtt?: number, bitrate?: number }
  socket.on('connection-type', ({ type, rtt, bitrate } = {}) => {
    // Sanitise
    const validTypes = ['lan', 'wan', 'turn'];
    if (!validTypes.includes(type)) return;

    const safeRtt = typeof rtt === 'number' ? Math.round(rtt) : null;
    const safeBitrate = typeof bitrate === 'number' ? Math.round(bitrate) : null;

    if (type === 'turn') webrtcStats.turnConnections++;
    if (type === 'wan') webrtcStats.stunConnections++;
    if (type === 'lan') webrtcStats.directConnections++;

    // Optionally store per-socket for per-room breakdowns later
    const meta = socketMeta.get(socket.id) || {};
    socketMeta.set(socket.id, { ...meta, connType: type, rtt: safeRtt, bitrate: safeBitrate });

    console.log(`[WebRTC] ${deviceName} (${socket.id.slice(0, 6)}) → type=${type} rtt=${safeRtt}ms bitrate=${safeBitrate}bps`);
  });


  // Event rate limits — relaxed in dev so mobile never gets blocked
  const LIM = IS_DEV
    ? { join: 500, sig: 2000, file: 500, chat: 500 }
    : { join: 5, sig: 300, file: 20, chat: 30 };

  function broadcastMemberList(roomId) {
    const members = getRoomMembers(roomId);
    io.to(roomId).emit('room-member-list', { room: roomId, members });
  }

  function leaveRoom(roomId) {
    if (!roomId) return;
    socket.leave(roomId);
    removeFromRoom(roomId, socket.id);
    const members = getRoomMembers(roomId);
    io.to(roomId).emit('room-status', { room: roomId, users: members.length, left: socket.id, deviceName });
    io.to(roomId).emit('room-member-list', { room: roomId, members });
    io.to(roomId).emit('peer-left', { socketId: socket.id, deviceName });
  }

  socket.on('join-room', ({ roomId, deviceName: dName } = {}) => {
    if (!socketEventGuard(socket, 'join-room', LIM.join)) return;

    roomId = (roomId || '').trim().slice(0, 50);
    dName = (dName || '').replace(/[<>'"&]/g, '').slice(0, 50) || socket.id.slice(0, 6);
    if (!roomId) return;

    deviceName = dName;
    socketMeta.set(socket.id, { roomId, deviceName });

    if (currentRoom && currentRoom !== roomId) leaveRoom(currentRoom);

    const existingSize = rooms.get(roomId)?.size || 0;
    if (existingSize >= 2) {
      const members = getRoomMembers(roomId);
      const isReconnect = members.some(m => m.deviceName === deviceName);
      if (!isReconnect) {
        socket.emit('room-full', { code: 'ROOM_FULL', message: 'This room already has two participants.' });
        return;
      }
      members.forEach(m => { if (m.deviceName === deviceName) m.socketId = socket.id; });
    }

    currentRoom = roomId;
    socket.join(roomId);
    addToRoom(roomId, socket.id, deviceName);
    if (auditLogger) auditLogger.log('socket-join', { roomId, deviceName }, ip).catch(() => { });

    const members = getRoomMembers(roomId);
    const users = members.length;
    io.to(roomId).emit('room-status', { room: roomId, users, joined: socket.id, deviceName });
    socket.emit('room-peers', members.filter(m => m.socketId !== socket.id));
    broadcastMemberList(roomId);
    console.log(`[Room ${roomId}] ${deviceName} joined (${users}/2)`);

    // Track every new Active connection
    webrtcStats.activeUsers++;
  });



  socket.on('webrtc-offer', ({ to, sdp, _offerSeq }) => { if (socketEventGuard(socket, 'webrtc-offer', LIM.sig)) io.to(to).emit('webrtc-offer', { from: socket.id, sdp, _offerSeq }); });
  socket.on('webrtc-answer', ({ to, sdp }) => { if (socketEventGuard(socket, 'webrtc-answer', LIM.sig)) io.to(to).emit('webrtc-answer', { from: socket.id, sdp }); });
  socket.on('webrtc-ice', ({ to, candidate }) => { if (socketEventGuard(socket, 'webrtc-ice', LIM.sig)) io.to(to).emit('webrtc-ice', { from: socket.id, candidate }); });

  socket.on('file-offer', ({ id, name, size, type }) => {
    if (!socketEventGuard(socket, 'file-offer', LIM.file) || !currentRoom) return;
    socket.to(currentRoom).emit('file-offer', {
      from: socket.id, fromName: deviceName, fromShort: socket.id.slice(0, 5),
      meta: {
        id: String(id || `${name}|${size}`).slice(0, 200),
        name: String(name || '').replace(/[<>'"]/g, '').slice(0, 500),
        size: Number(size) || 0,
        type: String(type || 'application/octet-stream').slice(0, 100),
      },
    });
  });

  socket.on('file-answer', ({ to, accepted }) => { if (socketEventGuard(socket, 'file-answer', LIM.file)) io.to(to).emit('file-answer', { from: socket.id, accepted: !!accepted }); });
  socket.on('file-cancel', (data) => {
    if (!currentRoom) return;
    // SECURITY FIX: Never spread untrusted client `data` into the emitted event.
    // A malicious client could send { by: "<script>..." } and override deviceName.
    // Only emit server-controlled fields.
    const reason = (typeof data?.reason === 'string') ? data.reason.slice(0, 100) : undefined;
    socket.to(currentRoom).emit('file-cancel', { by: deviceName, ...(reason ? { reason } : {}) });
  });
  socket.on('file-offer-seen', ({ to } = {}) => { if (to) io.to(to).emit('file-offer-seen', { from: socket.id }); });
  socket.on('room-queue', (data) => { if (currentRoom) socket.to(currentRoom).emit('room-queue', data); });
  socket.on('peer-closing', ({ room, name } = {}) => { const r = room || currentRoom; if (r) socket.to(r).emit('peer-left', { socketId: socket.id, deviceName: name || deviceName }); });

  socket.on('chat-msg', ({ text, msgId } = {}) => {
    if (!socketEventGuard(socket, 'chat-msg', LIM.chat) || !currentRoom) return;
    if (typeof text !== 'string' || text.length > 1000) return;
    const safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 1000);
    io.to(currentRoom).emit('chat-msg', { from: socket.id, name: deviceName, text: safe, msgId });
  });
  socket.on('chat-ack', ({ to, msgId, status } = {}) => { if (to) io.to(to).emit('chat-ack', { msgId, status }); });
  socket.on('chat-delivered', () => { if (currentRoom) socket.to(currentRoom).emit('chat-delivered', { from: socket.id }); });
  socket.on('typing', ({ roomId: rId, user } = {}) => { const r = rId || currentRoom; if (r) socket.to(r).emit('typing', { user: user || deviceName }); });
  socket.on('zip-compressing', ({ room, fileCount, totalSize, senderName } = {}) => { const r = room || currentRoom; if (r) socket.to(r).emit('zip-compressing', { fileCount, totalSize, senderName }); });
  socket.on('zip-ready', ({ room } = {}) => { const r = room || currentRoom; if (r) socket.to(r).emit('zip-ready', {}); });
  socket.on('reconnect-request', ({ to } = {}) => { if (to) io.to(to).emit('reconnect-request', { from: socket.id }); });
  socket.on('stop-typing', ({ roomId: rId } = {}) => { const r = rId || currentRoom; if (r) socket.to(r).emit('stop-typing'); });
  socket.on('keepalive', () => { });

  socket.on('disconnect', async (reason) => {
    console.log(`[WS] ${deviceName} (${socket.id.slice(0, 6)}) disconnected — ${reason}`);
    socketMeta.delete(socket.id);

    if (webrtcStats.activeUsers > 0) {
      webrtcStats.activeUsers--;
    }

    if (currentRoom) leaveRoom(currentRoom);
    try { await redis.client.del(`socket:${socket.id}`); } catch { }
    if (auditLogger) auditLogger.log('disconnect', { roomId: currentRoom, reason, deviceName }, ip).catch(() => { });
  });
});

setInterval(() => {
  io.emit('admin-stats', {
    ts: Date.now(),
    stats: { ...webrtcStats },
    roomCount: rooms.size,
    socketCount: io.sockets.sockets.size,
  });
}, 2000);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── LAN IP helper (used by manifest + startup log) ────────────────────────────
function getLanIPs() {
  const ips = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) ips.push(addr.address);
    }
  }
  return ips;
}

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(config.port, '0.0.0.0', () => {
  const lanIPs = getLanIPs();
  const primaryLanIp = lanIPs[0] || null;

  console.log('\n════════════════════════════════════════════════');
  console.log(`  ✅ Tranzo  |  port ${config.port}  |  ${config.node_env}`);
  console.log('');
  console.log(`  💻 Laptop :  http://localhost:${config.port}`);
  if (lanIPs.length) {
    lanIPs.forEach(ip => console.log(`  📱 Android:  http://${ip}:${config.port}`));
    console.log('');
    console.log(`  🔍 Test first: http://${lanIPs[0]}:${config.port}/ping`);
  } else {
    console.log('  ⚠️  No LAN IP found — connect to WiFi');
  }
  console.log('');
  console.log(`  CORS / CSP / Guards: ${IS_DEV ? 'OFF (dev mode — all devices allowed)' : 'ON (production)'}`);

  if (IS_DEV) {
    console.log('');
    console.log('  ── PWA LOCAL TESTING ──────────────────────────────');
    console.log('  PWA on DESKTOP Chrome (localhost):');
    console.log('    → Works automatically. Look for ⊕ icon in address bar.');
    console.log('    → If missing: chrome://flags → "Bypass App Banner Engagement"');
    console.log(`    → Or: DevTools → Application → Manifest → "Add to homescreen"`);
    console.log('');
    if (primaryLanIp) {
      console.log('  PWA on ANDROID (LAN IP — HTTP, not HTTPS):');
      console.log(`    1. Open Chrome on Android → http://${primaryLanIp}:${config.port}`);
      console.log('    2. Chrome DevTools remote debugging (USB):');
      console.log('       chrome://inspect → Port forwarding → localhost:3000 → 3000');
      console.log(`       Then visit http://localhost:${config.port} on Android`);
      console.log('    3. Or: chrome://flags/#unsafely-treat-insecure-origin-as-secure');
      console.log(`       Add: http://${primaryLanIp}:${config.port}`);
    }
    console.log('  ──────────────────────────────────────────────────');
  }
  console.log('════════════════════════════════════════════════\n');
});

module.exports = { app, server, io };