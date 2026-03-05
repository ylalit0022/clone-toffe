const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("public"));

const rooms = {}; // roomId -> Set(socketIds)

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", (roomId) => {
    if (!roomId) return;

    // leave old room if any
    if (socket.roomId && socket.roomId !== roomId) {
      const old = socket.roomId;
      socket.leave(old);
      if (rooms[old]) {
        rooms[old].delete(socket.id);
        if (rooms[old].size === 0) delete rooms[old];
        else io.to(old).emit("room-status", { room: old, users: rooms[old].size });
      }
    }

    socket.join(roomId);
    socket.roomId = roomId;

    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(socket.id);

    io.to(roomId).emit("room-status", { room: roomId, users: rooms[roomId].size });
  });

  socket.on("send-message", (message) => {
    if (!socket.roomId) return;
    io.to(socket.roomId).emit("receive-message", {
      user: socket.id.substring(0, 5),
      text: message,
    });
  });

  socket.on("file-offer", (meta) => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit("file-offer", {
      from: socket.id,
      fromShort: socket.id.substring(0, 5),
      meta,
    });
  });

  socket.on("file-answer", ({ to, accepted }) => {
    if (!to) return;
    io.to(to).emit("file-answer", { from: socket.id, accepted: !!accepted });
  });

  socket.on("file-cancel", ({ to }) => {
    if (!to) return;
    io.to(to).emit("file-cancel", { from: socket.id });
  });

  socket.on("webrtc-offer", ({ to, sdp }) => {
    if (!to || !sdp) return;
    io.to(to).emit("webrtc-offer", { from: socket.id, sdp });
  });

  socket.on("webrtc-answer", ({ to, sdp }) => {
    if (!to || !sdp) return;
    io.to(to).emit("webrtc-answer", { from: socket.id, sdp });
  });

  socket.on("webrtc-ice", ({ to, candidate }) => {
    if (!to || !candidate) return;
    io.to(to).emit("webrtc-ice", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    const roomId = socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].delete(socket.id);
      if (rooms[roomId].size === 0) delete rooms[roomId];
      else io.to(roomId).emit("room-status", { room: roomId, users: rooms[roomId].size });
    }
  });
});

server.listen(5000, "0.0.0.0", () => console.log("✅ Server running on port 5000"));