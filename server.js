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
});

const PORT = process.env.PORT || 3000;

// ── Static files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── Room state ────────────────────────────────────────────────
const rooms = new Map();   // roomId → Set of { socketId, deviceName }

// ── Socket.IO events ──────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Connected: ${socket.id}`);
  let currentRoom = null;
  let deviceName  = "Unknown";

  // ── JOIN ROOM ──────────────────────────────────────────────
  socket.on("join-room", ({ roomId, deviceName: name }) => {
    if (!roomId) return;
    deviceName = name || socket.id.slice(0, 6);

    // Leave previous room if any
    if (currentRoom) {
      leaveRoom(socket, currentRoom);
    }

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
  });

  // ── FILE OFFER ────────────────────────────────────────────
  socket.on("file-offer", ({ id, name, size, type }) => {
    if (!currentRoom) return;
    // Send to all OTHER users in the room
    socket.to(currentRoom).emit("file-offer", {
      from:       socket.id,
      fromName:   deviceName,
      meta: { id, name, size, type },
    });
    console.log(`[Room ${currentRoom}] ${deviceName} offered: ${name} (${fmtBytes(size)})`);
  });

  socket.on("file-answer", ({ to, accepted }) => {
    io.to(to).emit("file-answer", { from: socket.id, accepted });
    console.log(`[Room ${currentRoom}] ${deviceName} ${accepted ? "✅ accepted" : "❌ rejected"} file from ${to.slice(0,6)}`);
  });

  socket.on("file-cancel", (data) => {
    if (currentRoom) socket.to(currentRoom).emit("file-cancel", data);
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

  // ── DISCONNECT ────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[-] Disconnected: ${socket.id} (${deviceName})`);
    if (currentRoom) leaveRoom(socket, currentRoom);
  });

  function leaveRoom(sock, roomId) {
    sock.leave(roomId);
    const room = rooms.get(roomId);
    if (room) {
      room.forEach(p => { if (p.socketId === sock.id) room.delete(p); });
      if (room.size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit("room-status", { room: roomId, users: room.size, left: sock.id });
      }
    }
    if (currentRoom === roomId) currentRoom = null;
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