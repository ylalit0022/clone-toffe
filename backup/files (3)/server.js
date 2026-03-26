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
const { sitemapHandler } = require("./sitemap");

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

const PORT = process.env.PORT || 3000;

// ── Nunjucks template engine ──────────────────────────────────
// FIX: use path.join(__dirname, ...) so this works regardless
// of which directory the process is started from (PM2, systemd, etc.)
nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app
});
app.set("view engine", "njk");

// ── Static files ──────────────────────────────────────────────
// NOTE: static MUST come before HTML-serving routes so that
// /socket.io/socket.io.js, /script.js etc. are served correctly.
// Express routes are matched in registration order; the GET "/"
// route below is registered after static — that's fine because
// express.static only intercepts requests for files that actually
// exist in the public/ folder. index.html is intentionally
// absent from public/ so the nunjucks route wins.
app.use(express.static(path.join(__dirname, "public")));

// ── Sitemap ───────────────────────────────────────────────────
// Dynamic XML sitemap — auto-updates when sitemap.js ROUTES change.
// To add a new page: edit sitemap.js ROUTES array, no server restart needed.
app.get("/sitemap.xml", sitemapHandler);

// ── robots.txt ───────────────────────────────────────────────
app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "Sitemap: https://share.rumnnlg.com/sitemap.xml",
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

// ── 404 — MUST be the LAST route ─────────────────────────────
// Any URL that doesn't match a route above lands here.
// Responds with HTTP 404 status so Google Search Console
// correctly marks these as "Not found" and does not index them.
app.use((req, res) => {
  res.status(404).render("pages/404.njk");
});

// ════════════════════════════════════════════════════════════════
//  SOCKET.IO  —  Room state & signaling (unchanged)
// ════════════════════════════════════════════════════════════════

// ── Room state ────────────────────────────────────────────────
const rooms = new Map();   // roomId → Set of { socketId, deviceName }

// ── Server-side file-offer rate limiter ───────────────────────
const _offerTimestamps = new Map();  // socketId → number[]

function checkOfferRateLimit(socketId) {
  const now  = Date.now();
  const prev = (_offerTimestamps.get(socketId) || []).filter(t => now - t < 60_000);
  if (prev.length >= 5) return false;
  prev.push(now);
  _offerTimestamps.set(socketId, prev);
  return true;
}

// ── Grace-period map ──────────────────────────────────────────
const gracePending = new Map(); // socketId → { roomId, deviceName, timer }

// ── Socket.IO events ──────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Connected: ${socket.id}`);
  let currentRoom = null;
  let deviceName  = "Unknown";

  // ── JOIN ROOM ──────────────────────────────────────────────
  socket.on("join-room", ({ roomId, deviceName: name }) => {
    if (!roomId) return;
    deviceName = name || socket.id.slice(0, 6);

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
      io.to(roomId).emit("room-status", { room: roomId, users, joined: socket.id, deviceName });
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

    if (!checkOfferRateLimit(socket.id)) {
      console.warn(`[RateLimit] ${deviceName} (${socket.id.slice(0,6)}) exceeded file-offer rate`);
      socket.emit("file-offer-rejected", { reason: "rate_limit", message: "Too many file offers. Wait a moment." });
      return;
    }

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

  socket.on("file-cancel", (data) => {
    if (currentRoom) socket.to(currentRoom).emit("file-cancel", data);
  });

  socket.on("room-queue", (data) => {
    if (currentRoom) socket.to(currentRoom).emit("room-queue", data);
  });

  // ── WebRTC SIGNALING (relay only — no inspection) ─────────
  socket.on("webrtc-offer",  ({ to, sdp })       => io.to(to).emit("webrtc-offer",  { from: socket.id, sdp }));
  socket.on("webrtc-answer", ({ to, sdp })        => io.to(to).emit("webrtc-answer", { from: socket.id, sdp }));
  socket.on("webrtc-ice",    ({ to, candidate })  => io.to(to).emit("webrtc-ice",    { from: socket.id, candidate }));

  // ── CHAT ──────────────────────────────────────────────────
  socket.on("chat-msg", ({ text }) => {
    if (!currentRoom || !text) return;
    io.to(currentRoom).emit("chat-msg", { from: socket.id, name: deviceName, text });
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
