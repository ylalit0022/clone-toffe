// server/routes/rooms.js
// REST API endpoints for room CRUD operations

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { authenticate, createToken, getClientIp } = require("../middleware/security");
const { schemas, validate } = require("../middleware/validators");

const router = express.Router();

let roomManager;
let auditLogger;
let rateLimiter;

// ✅ Dependency injection
router.setDependencies = (rm, al, rl) => {
  roomManager = rm;
  auditLogger = al;
  rateLimiter = rl;
};

// ════════════════════════════════════════════════════════════════
// POST /api/v1/rooms — Create a new room
// ════════════════════════════════════════════════════════════════
router.post("/", async (req, res, next) => {
  try {
    const ip = getClientIp(req);

    // ✅ Rate limit: 10 rooms/hour per IP
    const limit = await rateLimiter.checkCreateRoom(ip);
    if (!limit.allowed) {
      await auditLogger.log("room_create_rate_limit", { ip }, ip);
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: limit.retryAfter,
      });
    }

    // ✅ Validate input
    const data = validate(req.body, schemas.createRoom);

    // ✅ Create room
    const room = await roomManager.createRoom({
      maxUsers: data.maxUsers,
      ttlMs: data.ttlMs,
      userId: req.user?.id,
      metadata: data.metadata,
    });

    // ✅ Issue JWT token
    const token = createToken({ roomId: room.id, role: "creator" }, "24h");

    await auditLogger.log(
      "room_created",
      { roomId: room.id, maxUsers: room.maxUsers },
      ip
    );

    res.status(201).json({
      roomId: room.id,
      maxUsers: room.maxUsers,
      token,
      expiresAt: room.expiresAt,
    });
  } catch (err) {
    next(err);
  }
});

// ════════════════════════════════════════════════════════════════
// GET /api/v1/rooms/:roomId — Get room information
// ════════════════════════════════════════════════════════════════
router.get("/:roomId", async (req, res, next) => {
  try {
    const ip = getClientIp(req);

    // ✅ Rate limit: 100 per minute per IP
    const limit = await rateLimiter.checkGetRoom(ip);
    if (!limit.allowed) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const room = await roomManager.getRoom(req.params.roomId);

    if (!room) {
      await auditLogger.log("room_not_found", { roomId: req.params.roomId }, ip);
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      roomId: room.id,
      maxUsers: room.maxUsers,
      members: room.members.map((m) => ({
        deviceId: m.deviceId,
        name: m.name,
      })),
      state: room.state,
    });
  } catch (err) {
    next(err);
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/v1/rooms/:roomId/join — Join a room
// ════════════════════════════════════════════════════════════════
router.post("/:roomId/join", authenticate(), async (req, res, next) => {
  try {
    const ip = getClientIp(req);

    // ✅ Rate limit: 30 per minute per IP
    const limit = await rateLimiter.checkJoinRoom(ip);
    if (!limit.allowed) {
      await auditLogger.log(
        "room_join_rate_limit",
        { roomId: req.params.roomId, ip },
        ip
      );
      return res.status(429).json({ error: "Too many requests" });
    }

    // ✅ Validate input
    const data = validate(req.body, schemas.joinRoom);

    // ✅ Generate device ID (server-side, not client-chosen)
    const deviceId = req.user?.deviceId || uuidv4();

    // ✅ Join room (backend enforces all rules)
    const room = await roomManager.joinRoom(
      req.params.roomId,
      deviceId,
      data.deviceName
    );

    // ✅ Issue session token
    const token = createToken({ deviceId, roomId: room.id }, "6h");

    await auditLogger.log(
      "room_joined",
      {
        roomId: room.id,
        deviceId,
        deviceName: data.deviceName,
      },
      ip
    );

    res.json({
      roomId: room.id,
      deviceId,
      members: room.members.map((m) => ({
        deviceId: m.deviceId,
        name: m.name,
        joinedAt: m.joinedAt,
      })),
      token,
    });
  } catch (err) {
    if (err.code === "ROOM_FULL") {
      return res.status(409).json({ error: err.message });
    }
    if (err.code === "ROOM_NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/v1/rooms/:roomId/leave — Leave a room
// ════════════════════════════════════════════════════════════════
router.post("/:roomId/leave", authenticate({ required: true }), async (req, res, next) => {
  try {
    const ip = getClientIp(req);

    await roomManager.leaveRoom(req.params.roomId, req.user.deviceId);

    await auditLogger.log(
      "room_left",
      { roomId: req.params.roomId, deviceId: req.user.deviceId },
      ip
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
