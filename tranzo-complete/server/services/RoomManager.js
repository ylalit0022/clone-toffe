// server/services/RoomManager.js
// Centralized room management - backend enforced

const crypto = require("crypto");

class RoomManager {
  constructor(redis, db) {
    this.redis = redis;
    this.db = db;
  }

  // ✅ Generate cryptographically secure room ID
  _generateSecureId(length = 8) {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
  }

  // ✅ Create new room (backend-controlled)
  async createRoom(config = {}) {
    const roomId = this._generateSecureId(8);
    const ttlMs = config.ttlMs || 24 * 60 * 60 * 1000; // Default 24h

    const room = {
      id: roomId,
      maxUsers: Math.min(Math.max(config.maxUsers || 2, 1), 10), // Clamp: 1-10
      createdBy: config.userId || "anonymous",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ttlMs),
      members: [],
      state: "active",
      metadata: config.metadata || {},
    };

    try {
      // Store in Redis (fast lookups)
      await this.redis.setEx(
        `room:${roomId}`,
        Math.ceil(ttlMs / 1000),
        JSON.stringify(room)
      );

      // Store in MongoDB (audit trail + persistence)
      await this.db.collection("rooms").insertOne({
        ...room,
        createdAt: room.createdAt,
      });

      console.log(`✓ Room created: ${roomId} (maxUsers=${room.maxUsers})`);
      return room;
    } catch (err) {
      console.error("❌ Failed to create room:", err.message);
      throw { code: "ROOM_CREATE_FAILED", message: "Failed to create room" };
    }
  }

  // ✅ Join room with validation (backend enforced)
  async joinRoom(roomId, deviceId, deviceName) {
    // Input validation
    if (!roomId || typeof roomId !== "string") {
      throw { code: "INVALID_ROOM_ID", message: "Invalid room ID" };
    }

    if (!deviceId || typeof deviceId !== "string") {
      throw { code: "INVALID_DEVICE_ID", message: "Invalid device ID" };
    }

    const deviceNameStr = String(deviceName || "Anonymous").slice(0, 100);

    try {
      // Fetch from Redis (cache-first)
      let roomData = await this.redis.get(`room:${roomId}`);
      let room = roomData ? JSON.parse(roomData) : null;

      if (!room) {
        // Fallback to MongoDB
        room = await this.db.collection("rooms").findOne({ id: roomId });
        if (room) {
          await this.redis.setEx(`room:${roomId}`, 3600, JSON.stringify(room));
        }
      }

      // ✅ Backend validation (cannot be bypassed)
      if (!room) {
        throw { code: "ROOM_NOT_FOUND", message: "Room does not exist" };
      }

      if (new Date() > new Date(room.expiresAt)) {
        await this.deleteRoom(roomId);
        throw { code: "ROOM_EXPIRED", message: "Room has expired" };
      }

      if (room.state !== "active") {
        throw { code: "ROOM_INACTIVE", message: "Room is not active" };
      }

      const memberCount = room.members?.length || 0;
      if (memberCount >= room.maxUsers) {
        throw { code: "ROOM_FULL", message: "Room is full" };
      }

      // Check for duplicate device
      if (room.members.some((m) => m.deviceId === deviceId)) {
        throw { code: "ALREADY_JOINED", message: "Device already in room" };
      }

      // Add member
      room.members.push({
        deviceId,
        name: deviceNameStr,
        joinedAt: new Date(),
      });

      // Update Redis
      await this.redis.setEx(`room:${roomId}`, 3600, JSON.stringify(room));

      // Log event
      await this.db.collection("room_events").insertOne({
        roomId,
        event: "join",
        deviceId,
        deviceName: deviceNameStr,
        timestamp: new Date(),
      });

      console.log(
        `✓ [Room ${roomId}] ${deviceNameStr} joined (${room.members.length}/${room.maxUsers})`
      );
      return room;
    } catch (err) {
      console.error("❌ Failed to join room:", err.message);
      throw err;
    }
  }

  // ✅ Leave room
  async leaveRoom(roomId, deviceId) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return;

      room.members = room.members.filter((m) => m.deviceId !== deviceId);

      if (room.members.length === 0) {
        await this.deleteRoom(roomId);
        console.log(`✓ Room ${roomId} auto-deleted (empty)`);
      } else {
        await this.redis.setEx(`room:${roomId}`, 3600, JSON.stringify(room));
      }

      // Log event
      await this.db.collection("room_events").insertOne({
        roomId,
        event: "leave",
        deviceId,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("❌ Failed to leave room:", err.message);
      throw err;
    }
  }

  // ✅ Get room (cache-first)
  async getRoom(roomId) {
    const cached = await this.redis.get(`room:${roomId}`);
    if (cached) return JSON.parse(cached);

    const room = await this.db.collection("rooms").findOne({ id: roomId });
    if (room) {
      await this.redis.setEx(`room:${roomId}`, 3600, JSON.stringify(room));
    }
    return room;
  }

  // ✅ List rooms (for admin)
  async listRooms(skip = 0, limit = 50) {
    const rooms = await this.db
      .collection("rooms")
      .find({ state: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    return rooms;
  }

  // ✅ Delete room
  async deleteRoom(roomId) {
    await this.redis.del(`room:${roomId}`);
    await this.db.collection("rooms").deleteOne({ id: roomId });
  }

  // ✅ Cleanup expired rooms (run periodically)
  async cleanupExpiredRooms() {
    const now = new Date();
    const result = await this.db.collection("rooms").deleteMany({
      expiresAt: { $lt: now },
    });
    console.log(`✓ Cleanup: Deleted ${result.deletedCount} expired rooms`);
    return result.deletedCount;
  }
}

module.exports = RoomManager;
