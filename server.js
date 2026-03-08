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

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] },
  maxHttpBufferSize: 1e6,   // 1MB for signaling messages (SDP, ICE)

  // ── FIX: Mobile file-picker / gallery disconnect ───────────────
  // ROOT CAUSE: When Android/iOS opens the file picker, Chrome puts
  // the tab into background and applies "Intensive Throttling" —
  // all JS timers are frozen. The default pingTimeout (20 s) is too
  // short; the client cannot reply to the server PING in time and
  // Socket.IO declares the socket dead.
  //
  // OFFICIAL FIX (socket.io docs): increase pingTimeout on the server.
  // Total tolerance window = pingInterval + pingTimeout = 25 + 60 = 85 s
  // This covers even the slowest gallery app open time on Android.
  //
  // NOTE: Your Apache ProxyTimeout in the vhost MUST be > 85 s.
  // Add this line inside your <VirtualHost> or <Location /socket.io/>:
  //   ProxyTimeout 120
  pingInterval:  25000,   // 25 s  (default: 25 000 — unchanged)
  pingTimeout:   60000,   // 60 s  (default: 20 000 — TRIPLED ← key fix)
  upgradeTimeout: 30000,  // 30 s  (default: 10 000 — safer on slow 4G)

  // ── FIX: Built-in Connection State Recovery (Socket.IO v4.6+) ──
  // If a brief disconnect still happens, this restores socket.id,
  // socket.rooms, and socket.data automatically on reconnect —
  // so the client rejoins its room without any extra code.
  // maxDisconnectionDuration: 2 min grace window for mobile reconnect.
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

const PORT = process.env.PORT || 3000;

// ── Static files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── /api/ice-config — serve TURN credentials server-side ──────
// SECURITY FIX: credentials are never shipped in client JS bundle.
// Client fetches this once per session. Credentials come from
// environment variables so they are never committed to source control.
//
// Set these in your environment (or a .env file with dotenv):
//   INDIA_TURN_HOST=share.rumnnlg.com
//   INDIA_TURN_USER=testuser
//   INDIA_TURN_PASS=testpass123
//   METERED_USER=a8d9d73530add1b926be15b7
//   METERED_PASS=NgH88GxMUO1f4Knl
app.get("/api/ice-config", (req, res) => {
  const indiaHost = process.env.INDIA_TURN_HOST || "";
  const indiaUser = process.env.INDIA_TURN_USER || "";
  const indiaPass = process.env.INDIA_TURN_PASS || "";
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

  // Short cache: 5 minutes — avoids per-request overhead while
  // keeping credentials rotatable without a server restart
  res.setHeader("Cache-Control", "private, max-age=300");
  res.json({ iceServers });
});

// ── Room state ────────────────────────────────────────────────
const rooms = new Map();   // roomId → Set of { socketId, deviceName }

// ── Server-side file-offer rate limiter ───────────────────────
// SECURITY FIX: client-side rate limiting (checkRateLimit in script.js)
// can be bypassed by anyone with DevTools. Enforce the same 5/min limit
// server-side so malicious clients cannot flood room members with modals.
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
// Backup for when connectionStateRecovery can't restore the session
// (e.g. server restart, long disconnect). Stores last room info for
// 90 seconds so the client can re-emit join-room and seamlessly
// rejoin without the peer ever seeing them as "gone".
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
    // If connectionStateRecovery succeeded, socket.recovered === true
    // and socket.rooms is already restored — we just need to refresh
    // the in-memory rooms Map entry so peers get the updated socket.id.
    if (socket.recovered) {
      console.log(`[Room ${roomId}] ${deviceName} session RECOVERED (no peer disruption)`);
      // Update socketId in the room set to the new socket.id
      const room = rooms.get(roomId);
      if (room) {
        room.forEach(p => { if (p.deviceName === deviceName) p.socketId = socket.id; });
      }
      // Cancel any pending grace timer for this device
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
      // Broadcast updated member list so panels refresh
      const fullList2 = [...(rooms.get(roomId) || [])].map(p => ({ socketId: p.socketId, deviceName: p.deviceName }));
      io.to(roomId).emit("room-member-list", { room: roomId, members: fullList2 });
      return;
    }

    // Leave previous room if any
    if (currentRoom) {
      leaveRoom(socket, currentRoom);
    }

    // ── Cancel grace timer if this device is rejoining ───────
    gracePending.forEach((v, k) => {
      if (v.roomId === roomId && v.deviceName === deviceName) {
        clearTimeout(v.timer);
        gracePending.delete(k);
        // Remove stale old entry from room set
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

    // Notify everyone in room about current user count
    io.to(roomId).emit("room-status", {
      room: roomId,
      users,
      joined: socket.id,
      deviceName,
    });

    // Send the new user the list of existing peers
    const peers = [...rooms.get(roomId)]
      .filter(p => p.socketId !== socket.id)
      .map(p => ({ socketId: p.socketId, deviceName: p.deviceName }));
    socket.emit("room-peers", peers);

    // ── MULTI-USER: broadcast full member list to everyone in room ──
    // Every client keeps a live roster. Emit to ALL so everyone's panel updates.
    const fullList = [...rooms.get(roomId)]
      .map(p => ({ socketId: p.socketId, deviceName: p.deviceName }));
    io.to(roomId).emit("room-member-list", { room: roomId, members: fullList });
  });

  // ── FILE OFFER ────────────────────────────────────────────
  socket.on("file-offer", ({ id, name, size, type }) => {
    if (!currentRoom) return;

    // SECURITY FIX: server-side rate limit — max 5 offers per minute.
    // Client-side checkRateLimit() can be bypassed via DevTools.
    if (!checkOfferRateLimit(socket.id)) {
      console.warn(`[RateLimit] ${deviceName} (${socket.id.slice(0,6)}) exceeded file-offer rate`);
      socket.emit("file-offer-rejected", { reason: "rate_limit", message: "Too many file offers. Wait a moment." });
      return;
    }

    // Sanitize: ensure name is a string, size is a non-negative number
    const safeName = String(name || "").slice(0, 512) || "file";
    const safeSize = Math.max(0, Number(size) || 0);
    const safeType = String(type || "application/octet-stream").slice(0, 256);

    // Send to all OTHER users in the room
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

  // Shared queue broadcast — sender tells all room members what's in their queue
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
  // Client emits this just before opening the file picker on mobile.
  // Receiving it proves the socket is alive — if there is a pending
  // grace timer for this socket we cancel it so the peer is not evicted.
  socket.on("keepalive", () => {
    console.log(`[Keepalive] ${deviceName} (${socket.id.slice(0,6)})`);
    // Cancel any pending grace eviction for this socket
    if (gracePending.has(socket.id)) {
      const entry = gracePending.get(socket.id);
      clearTimeout(entry.timer);
      gracePending.delete(socket.id);
      console.log(`[Keepalive] Grace timer cancelled for ${deviceName}`);
    }
  });

  // ── DISCONNECT ────────────────────────────────────────────
  // FIX: Don't evict the peer instantly on disconnect.
  //
  // Why: Android/iOS opening the file picker suspends the tab.
  // Socket.IO will briefly disconnect then auto-reconnect within
  // seconds. If we evict immediately, the peer sees "user left"
  // and WebRTC tears down — so we give a 90-second grace window.
  //
  // During grace: peer stays in the room. If they reconnect and
  // re-emit join-room within 90 s, the grace timer is cancelled
  // and everything is seamlessly restored with no UI disruption.
  // After 90 s with no reconnect: they are truly evicted.
  socket.on("disconnect", (reason) => {
    console.log(`[-] Disconnected: ${socket.id} (${deviceName}) — reason: ${reason}`);
    if (!currentRoom) return;

    const savedRoom = currentRoom;
    const savedName = deviceName;
    currentRoom = null;

    // Don't evict yet — start grace period
    const GRACE_MS = 90_000; // 90 seconds
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
        // ── MULTI-USER: broadcast updated member list after leave ──
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
// CRITICAL: listen on "0.0.0.0" not "localhost"
// "localhost" binds only to 127.0.0.1 → unreachable from other devices
// "0.0.0.0" binds to ALL interfaces → reachable via LAN IP
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