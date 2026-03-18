// Load .env FIRST — must be before any other require that reads process.env
require("dotenv").config();

// ═══════════════════════════════════════════════════════════════
//  server.js  — P2P File Transfer Signaling Server
//
//  IMPORTANT: Binds to 0.0.0.0 so it's reachable on:
//    - http://localhost:3000          (same machine)
//    - http://192.168.x.x:3000       (LAN / ipconfig IP)
//    - http://0.0.0.0:3000           (all interfaces)
//
//  To find your LAN IP:
//    Windows:  ipconfig  → look for "IPv4 Address"
//    Linux/Mac: ip addr  → look for inet under your NIC
// ═══════════════════════════════════════════════════════════════

const express   = require("express");
const http      = require("http");
const { Server } = require("socket.io");
const path      = require("path");
const os        = require("os");
const nunjucks  = require("nunjucks");
const cookieParser = require("cookie-parser");
const { sitemapHandler, staticSitemapHandler } = require("./sitemap");
const blogRoutes             = require("./routes/blog");
const { blogSitemapHandler } = require("./utils/blog/blogSitemap");
const adminRoutes            = require("./routes/admin");
const { pageCacheMiddleware } = require("./middleware/pageCache");

// ── MongoDB ───────────────────────────────────────────────────
const { connectDB } = require("./db/mongodb");
connectDB();   // non-blocking — server works even if Mongo is down

// ── Auth routes ───────────────────────────────────────────────
const authRoutes    = require("./routes/authRoutes");
const accountRoutes = require("./routes/account");
const { optionalAuth } = require("./middleware/authMiddleware");

// ── [SECURITY] WebRTC signaling protection ────────────────────
const security = require("./middleware/security");


const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] },
  maxHttpBufferSize: 1e6,   // 1MB for signaling messages (SDP, ICE)

  // ── FIX: Mobile file-picker / gallery disconnect ───────────────
  pingInterval:  25000,
  pingTimeout:   60000,
  upgradeTimeout: 30000,

  // ── FIX: Built-in Connection State Recovery (Socket.IO v4.6+) ──
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

const PORT     = process.env.PORT     || 3000;
const SITE_URL  = (process.env.SITE_URL || 'https://share.rumnnlg.com').replace(/\/$/, '');

// ── Nunjucks template engine ──────────────────────────────────
// FIX: use path.join(__dirname, ...) so this works regardless
// of which directory the process is started from (PM2, systemd, etc.)
nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app
});
app.set("view engine", "njk");

// ── Static files ──────────────────────────────────────────────
// NOTE: static MUST come before HTML-serving routes AND before
// the HTTP rate limiter so that JS/CSS/image requests never
// count against the per-IP request cap. express.static only
// intercepts requests for files that actually exist in public/.
// index.html is intentionally absent so the nunjucks "/" wins.
app.use(express.static(path.join(__dirname, "public")));

// HTML page cache
app.use(pageCacheMiddleware);


// ── Body parsers + cookie parser ─────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Auth routes (/auth/* and /account/*) ─────────────────────
// Mounted BEFORE page routes so /auth/login etc. resolve correctly.
app.use("/auth",    authRoutes);
app.use("/account", accountRoutes);

// ── Top-level /logout shortcut (for navbar <a href="/logout">) ─
app.get("/logout", (req, res) => res.redirect("/auth/logout"));

// ── injectUser — populates currentUser in every Nunjucks template ──
// Uses optionalAuth so unauthenticated visitors just get currentUser=null.
// Must be registered AFTER cookie-parser and BEFORE page routes.
app.use(optionalAuth, (req, res, next) => {
  res.locals.currentUser = req.user || null;
  // Inject siteUrl into every Nunjucks template automatically.
  // Change SITE_URL in .env — no template edits needed.
  res.locals.siteUrl = SITE_URL;
  next();
});

app.get("/sitemap.xml",        sitemapHandler);
app.get("/sitemap-static.xml", staticSitemapHandler);
app.get("/blog-sitemap.xml",   blogSitemapHandler);

// ── robots.txt ───────────────────────────────────────────────
app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `Sitemap: ${SITE_URL}/blog-sitemap.xml`,
  ].join("\n"));
});

// ── /api/ice-config — serve TURN credentials server-side ──────
app.get("/api/ice-config", (req, res) => {
  const indiaHost  = process.env.INDIA_TURN_HOST || "";
  const indiaUser  = process.env.INDIA_TURN_USER || "";
  const indiaPass  = process.env.INDIA_TURN_PASS || "";
  const meteredUser = process.env.METERED_USER || "";
  const meteredPass = process.env.METERED_PASS || "";

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ];

  if (indiaHost && indiaUser && indiaPass) {
    iceServers.push({
      urls: [
        `turn:${indiaHost}:3478?transport=udp`,
        `turn:${indiaHost}:3478?transport=tcp`,
        `turns:${indiaHost}:5349?transport=tcp`,
      ],
      username: indiaUser,
      credential: indiaPass,
    });
  }

  if (meteredUser && meteredPass) {
    iceServers.push({
      urls: [
        "turn:global.relay.metered.ca:80?transport=udp",
        "turn:global.relay.metered.ca:80?transport=tcp",
        "turn:global.relay.metered.ca:443?transport=tcp",
        "turns:global.relay.metered.ca:443?transport=tcp",
      ],
      username: meteredUser,
      credential: meteredPass,
    });
  }

  res.setHeader("Cache-Control", "private, max-age=300");
  res.json({ iceServers });
});

// ── /api/site-config — exposes SITE_URL to browser JS ───────
// Allows ice.js / script.js to read the active domain without
// hardcoding. Cached 24h (changes only on redeploy).
app.get("/api/site-config", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.json({
    siteUrl:   SITE_URL,
    turnHosts: [process.env.INDIA_TURN_HOST || ""].filter(Boolean),
  });
});

// ════════════════════════════════════════════════════════════════
//  PAGE ROUTES
//
//  HOW TO ADD A NEW PAGE:
//  ──────────────────────
//  1. Create  views/pages/my-page.njk  (extend base.njk)
//  2. Add a route below:
//       app.get("/my-page", (req,res) => res.render("pages/my-page.njk"));
//  3. Add the route to sitemap.js ROUTES array.
//  4. Add a link in base.njk navbar / footer as needed.
//  5. pm2 restart share  (or node server.js)
// ════════════════════════════════════════════════════════════════

// ── Homepage ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  console.log("INDEX ROUTE HIT");
  res.render("pages/index.njk");
});

// ── Feature / landing pages ───────────────────────────────────
app.get("/send-large-files",            (req, res) => res.render("pages/send-large-files.njk"));
app.get("/android-to-pc-file-transfer", (req, res) => res.render("pages/android-to-pc-file-transfer.njk"));
app.get("/webrtc-file-transfer",        (req, res) => res.render("pages/webrtc-file-transfer.njk"));

// ── Informational pages ───────────────────────────────────────
app.get("/security",    (req, res) => res.render("pages/security.njk"));
app.get("/about",       (req, res) => res.render("pages/about.njk"));
app.get("/how-it-works",(req, res) => res.render("pages/how-it-works.njk"));
app.get("/faq",         (req, res) => res.render("pages/faq.njk"));

// ── Legal & contact ───────────────────────────────────────────
app.get("/contact",    (req, res) => res.render("pages/contact.njk"));
app.get("/privacy",    (req, res) => res.render("pages/privacy.njk"));
app.get("/terms",      (req, res) => res.render("pages/terms.njk"));
app.get("/cookies",    (req, res) => res.render("pages/cookies.njk"));
app.get("/disclaimer", (req, res) => res.render("pages/disclaimer.njk"));

app.use("/blog",  blogRoutes);
app.use("/admin", adminRoutes);

app.post("/api/blog/cache-purge", async (req, res) => {
  const { secret, key } = req.body || {};
  if (secret !== (process.env.CACHE_PURGE_SECRET || "change-me"))
    return res.status(403).json({ error: "Forbidden" });
  try {
    const { purgeCache } = require("./utils/blog/ghost");
    const deleted = await purgeCache(key || null);
    res.json({ ok: true, deleted });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use((req, res) => {
  res.status(404).render("pages/404.njk");
});

// ════════════════════════════════════════════════════════════════
//  SOCKET.IO  —  Room state & signaling (unchanged)
// ════════════════════════════════════════════════════════════════

// ── Room state ────────────────────────────────────────────────
const rooms = new Map();   // roomId → Set of { socketId, deviceName }

// ── Room activity tracker ─────────────────────────────────────
// roomId → timestamp (ms) of last observed activity.
// Updated on: join, file-offer, webrtc-offer.
// Read by the idle room reaper every REAPER_INTERVAL_MS.
const roomActivity = new Map();

function touchRoom(roomId) {
  if (roomId) roomActivity.set(roomId, Date.now());
}

// ── Idle Room Reaper ─────────────────────────────────────────
// Prevents ghost rooms from accumulating when:
//   • Peer A joins but Peer B never arrives
//   • Both peers close their tabs simultaneously
//   • A transfer fails and neither peer re-joins within 90s
//
// Runs every REAPER_INTERVAL_MS (5 min default).
// Only evicts a room when ALL of the following are true:
//   1. The room has had no activity for ROOM_IDLE_MS (10 min default)
//   2. No live sockets are present (room.size === 0) OR all occupants
//      are already in the gracePending map (i.e. physically disconnected)
//
// This is safe: active peers keep touching the room on every event,
// so the reaper will never evict a room with live participants.
//
// Tuneable via .env:
//   ROOM_IDLE_MS=600000      (default: 10 minutes)
//   REAPER_INTERVAL_MS=300000 (default: 5 minutes)

const ROOM_IDLE_MS       = parseInt(process.env.ROOM_IDLE_MS)       || 10 * 60 * 1000;
const REAPER_INTERVAL_MS = parseInt(process.env.REAPER_INTERVAL_MS) ||  5 * 60 * 1000;

const _reaperTimer = setInterval(() => {
  const now    = Date.now();
  let   reaped = 0;

  for (const [roomId, lastActive] of roomActivity) {
    if (now - lastActive < ROOM_IDLE_MS) continue;  // still fresh

    const room = rooms.get(roomId);

    // Collect grace-period socket IDs for this room
    const graceSids = new Set(
      [...gracePending.entries()]
        .filter(([, v]) => v.roomId === roomId)
        .map(([sid]) => sid)
    );

    const liveCount  = room ? room.size : 0;
    const allInGrace = liveCount > 0 && [...room].every(p => graceSids.has(p.socketId));

    if (liveCount === 0 || allInGrace) {
      // Cancel any lingering grace timers to prevent double-eviction
      for (const [sid, v] of gracePending) {
        if (v.roomId !== roomId) continue;
        clearTimeout(v.timer);
        gracePending.delete(sid);
      }
      rooms.delete(roomId);
      roomActivity.delete(roomId);
      reaped++;
      console.log(
        `[Reaper] Evicted idle room "${roomId}" ` +
        `(inactive ${Math.round((now - lastActive) / 60000)}min, ${liveCount} ghost peer(s) cleared)`
      );
    }
  }

  if (reaped) {
    console.log(`[Reaper] Sweep complete — ${reaped} room(s) evicted. Active rooms: ${rooms.size}`);
  }
}, REAPER_INTERVAL_MS);

if (_reaperTimer.unref) _reaperTimer.unref();  // don't prevent clean process exit

// ── Grace-period map ──────────────────────────────────────────
const gracePending = new Map(); // socketId → { roomId, deviceName, timer }

// ── Socket.IO events ──────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  let currentRoom = null;
  let deviceName  = "Unknown";

  // ── JOIN ROOM ──────────────────────────────────────────────
  socket.on("join-room", ({ roomId, deviceName: name }) => {
    deviceName = name || socket.id.slice(0, 6);
    // Validate room ID format (no rate limit)
    if (!security.allowJoin(socket, roomId)) return;


    // ── Recovered session fast-path ──────────────────────────
    if (socket.recovered) {
      console.log(`[Room ${roomId}] ${deviceName} session RECOVERED (no peer disruption)`);
      const room = rooms.get(roomId);
      if (room) {
        room.forEach(p => { if (p.deviceName === deviceName) p.socketId = socket.id; });
      }
      gracePending.forEach((v, k) => {
        if (v.roomId === roomId && v.deviceName === deviceName) {
          clearTimeout(v.timer);
          gracePending.delete(k);
        }
      });
      socket.join(roomId);
      currentRoom = roomId;
      const users = rooms.get(roomId)?.size || 1;
      // recovered=true tells the client this is a silent reconnect — no "Ready" toast
      io.to(roomId).emit("room-status", { room: roomId, users, joined: socket.id, deviceName, recovered: true });
      const peers = [...(rooms.get(roomId) || [])]
        .filter(p => p.socketId !== socket.id)
        .map(p => ({ socketId: p.socketId, deviceName: p.deviceName }));
      socket.emit("room-peers", peers);
      const fullList2 = [...(rooms.get(roomId) || [])].map(p => ({ socketId: p.socketId, deviceName: p.deviceName }));
      io.to(roomId).emit("room-member-list", { room: roomId, members: fullList2 });
      return;
    }

    if (currentRoom) {
      leaveRoom(socket, currentRoom);
    }

    // ── [ONE-TO-ONE] Enforce max 2 peers per room ─────────────
    // Count confirmed room members PLUS any grace-period slots (peers who
    // disconnected briefly but haven't been evicted yet). This prevents a
    // third browser tab from sneaking in during the 90-second grace window.
    const existingRoom    = rooms.get(roomId);
    const confirmedPeers  = existingRoom ? existingRoom.size : 0;
    const gracePeers      = [...gracePending.values()].filter(v => v.roomId === roomId).length;
    const effectivePeers  = confirmedPeers + gracePeers;

    // Exception: a grace-period reconnect for this exact deviceName is allowed
    // (it's the same person reconnecting, not a new third party).
    const isGraceReconnect = [...gracePending.values()].some(
      v => v.roomId === roomId && v.deviceName === (name || socket.id.slice(0, 6))
    );

    if (effectivePeers >= 2 && !isGraceReconnect) {
      console.warn(`[Room ${roomId}] FULL — rejected ${name || socket.id.slice(0,6)} (${effectivePeers} peers present)`);
      security.secLog("ROOM_FULL", security.getIp(socket), {
        roomId,
        deviceName: name || socket.id.slice(0, 6),
        confirmedPeers,
        gracePeers,
      });
      socket.emit("room-full", {
        code:    "ROOM_FULL",
        message: "This room already has two participants. Only one sender and one receiver are allowed.",
      });
      return;
    }

    gracePending.forEach((v, k) => {
      if (v.roomId === roomId && v.deviceName === deviceName) {
        clearTimeout(v.timer);
        gracePending.delete(k);
        const room = rooms.get(roomId);
        if (room) room.forEach(p => { if (p.socketId === k) room.delete(p); });
        console.log(`[Room ${roomId}] ${deviceName} rejoined within grace — connection restored`);
      }
    });

    currentRoom = roomId;
    socket.join(roomId);
    touchRoom(roomId);  // ← [REAPER] mark room as active on join

    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add({ socketId: socket.id, deviceName });

    const users = rooms.get(roomId).size;
    console.log(`[Room ${roomId}] ${deviceName} joined (${users} users)`);

    io.to(roomId).emit("room-status", {
      room: roomId,
      users,
      joined: socket.id,
      deviceName,
    });

    const peers = [...rooms.get(roomId)]
      .filter(p => p.socketId !== socket.id)
      .map(p => ({ socketId: p.socketId, deviceName: p.deviceName }));
    socket.emit("room-peers", peers);

    const fullList = [...rooms.get(roomId)]
      .map(p => ({ socketId: p.socketId, deviceName: p.deviceName }));
    io.to(roomId).emit("room-member-list", { room: roomId, members: fullList });
  });

  // ── FILE OFFER ────────────────────────────────────────────
  socket.on("file-offer", ({ id, name, size, type }) => {
    if (!currentRoom) return;
    touchRoom(currentRoom);  // ← [REAPER] file activity = room is live


    const safeName = String(name || "").slice(0, 512) || "file";
    const safeSize = Math.max(0, Number(size) || 0);
    const safeType = String(type || "application/octet-stream").slice(0, 256);

    socket.to(currentRoom).emit("file-offer", {
      from:     socket.id,
      fromName: deviceName,
      meta: { id, name: safeName, size: safeSize, type: safeType },
    });
    console.log(`[Room ${currentRoom}] ${deviceName} offered: ${safeName} (${fmtBytes(safeSize)})`);
  });

  socket.on("file-answer", ({ to, accepted }) => {
    io.to(to).emit("file-answer", { from: socket.id, accepted });
    console.log(`[Room ${currentRoom}] ${deviceName} ${accepted ? "✅ accepted" : "❌ rejected"} file from ${to.slice(0,6)}`);
  });

  // Client fires this on beforeunload so peers get instant notification
  // rather than waiting for the 90s grace-period expiry
  socket.on("peer-closing", ({ room, name }) => {
    if (room && room === currentRoom) {
      socket.to(room).emit("peer-left", { socketId: socket.id, deviceName: name || deviceName });
    }
  });

  socket.on("file-cancel", (data) => {
    if (currentRoom) socket.to(currentRoom).emit("file-cancel", data);
  });

  socket.on("room-queue", (data) => {
    if (currentRoom) socket.to(currentRoom).emit("room-queue", data);
  });
  // ── WebRTC SIGNALING ────────────────────────────────────
  socket.on("webrtc-offer", ({ to, sdp }) => {
    touchRoom(currentRoom);  // ← [REAPER] WebRTC negotiation = room is live
    io.to(to).emit("webrtc-offer", { from: socket.id, sdp });
  });
  socket.on("webrtc-answer", ({ to, sdp }) => {
    io.to(to).emit("webrtc-answer", { from: socket.id, sdp });
  });
  socket.on("webrtc-ice", ({ to, candidate }) => {
    io.to(to).emit("webrtc-ice", { from: socket.id, candidate });
  });

  // ── CHAT ──────────────────────────────────────────────────
  socket.on("chat-msg", ({ text, msgId }) => {
    if (!currentRoom || !text) return;
    io.to(currentRoom).emit("chat-msg", { from: socket.id, name: deviceName, text, msgId });
  });

  // Delivery/read receipt — route back to original sender only
  socket.on("chat-ack", ({ to, msgId, status }) => {
    if (!to || !msgId) return;
    io.to(to).emit("chat-ack", { msgId, status });
  });

  // ── TYPING INDICATORS ─────────────────────────────────────
  socket.on("typing", ({ roomId, user }) => {
    const room = roomId || currentRoom;
    if (!room) return;
    socket.to(room).emit("typing", { user: user || deviceName });
  });

  socket.on("stop-typing", ({ roomId } = {}) => {
    const room = roomId || currentRoom;
    if (!room) return;
    socket.to(room).emit("stop-typing");
  });

  // ── KEEPALIVE ─────────────────────────────────────────────
  socket.on("keepalive", () => {
    console.log(`[Keepalive] ${deviceName} (${socket.id.slice(0,6)})`);
    if (gracePending.has(socket.id)) {
      const entry = gracePending.get(socket.id);
      clearTimeout(entry.timer);
      gracePending.delete(socket.id);
      console.log(`[Keepalive] Grace timer cancelled for ${deviceName}`);
    }
  });

  // ── DISCONNECT ────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(`[-] Disconnected: ${socket.id} (${deviceName}) — reason: ${reason}`);

    if (!currentRoom) return;

    const savedRoom = currentRoom;
    const savedName = deviceName;
    currentRoom = null;

    const GRACE_MS = 90_000;
    const timer = setTimeout(() => {
      gracePending.delete(socket.id);
      _leaveRoom(socket, savedRoom, savedName);
      console.log(`[Room ${savedRoom}] ${savedName} — grace expired, evicted`);
    }, GRACE_MS);

    gracePending.set(socket.id, { roomId: savedRoom, deviceName: savedName, timer });
    console.log(`[Room ${savedRoom}] ${savedName} — grace period started (${GRACE_MS/1000}s)`);
  });

  function leaveRoom(sock, roomId) {
    _leaveRoom(sock, roomId, deviceName);
    currentRoom = null;
  }

  function _leaveRoom(sock, roomId, name) {
    sock.leave(roomId);
    const room = rooms.get(roomId);
    if (room) {
      room.forEach(p => { if (p.socketId === sock.id) room.delete(p); });
      if (room.size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit("room-status", { room: roomId, users: room.size, left: sock.id, deviceName: name });
        const fullList = [...room].map(p => ({ socketId: p.socketId, deviceName: p.deviceName }));
        io.to(roomId).emit("room-member-list", { room: roomId, members: fullList });
        io.to(roomId).emit("peer-left", { socketId: sock.id, deviceName: name });
      }
    }
  }
});

// ── Print all LAN IPs on startup ──────────────────────────────
function getLanIps() {
  const nets = os.networkInterfaces();
  const ips  = [];
  for (const iface of Object.values(nets)) {
    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) ips.push(addr.address);
    }
  }
  return ips;
}

function fmtBytes(b) {
  const u = ["B","KB","MB","GB"]; let i=0,n=b;
  while (n>=1024&&i<u.length-1){n/=1024;i++;}
  return `${n.toFixed(i?2:0)} ${u[i]}`;
}

// ── START ─────────────────────────────────────────────────────
server.listen(PORT, "0.0.0.0", () => {
  console.log("\n════════════════════════════════════════");
  console.log(`  🚀 Server running on port ${PORT}`);
  console.log("────────────────────────────────────────");
  console.log(`  Local:   http://localhost:${PORT}`);
  getLanIps().forEach(ip => {
    console.log(`  Network: http://${ip}:${PORT}   ← share this`);
  });
  console.log("════════════════════════════════════════\n");
});