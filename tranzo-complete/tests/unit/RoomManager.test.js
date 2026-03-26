// tests/unit/RoomManager.test.js
// Test RoomManager service

const RoomManager = require("../../server/services/RoomManager");

// Mock Redis and MongoDB
class MockRedis {
  constructor() {
    this.data = new Map();
  }

  async setEx(key, ttl, value) {
    this.data.set(key, value);
    return "OK";
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async del(key) {
    this.data.delete(key);
  }

  async multi() {
    return {
      zRemRangeByScore: () => this,
      zCard: () => this,
      zAdd: () => this,
      expire: () => this,
      exec: async () => [[null, 0], [null, 0]],
    };
  }
}

class MockDB {
  constructor() {
    this.rooms = new Map();
    this.events = [];
  }

  collection(name) {
    return {
      insertOne: async (doc) => {
        if (name === "rooms") {
          this.rooms.set(doc.id, doc);
        } else if (name === "room_events") {
          this.events.push(doc);
        }
        return { insertedId: doc.id };
      },
      findOne: async (query) => {
        const room = Array.from(this.rooms.values()).find(
          (r) => r.id === query.id
        );
        return room || null;
      },
      deleteOne: async (query) => {
        for (const [key, room] of this.rooms) {
          if (room.id === query.id) {
            this.rooms.delete(key);
            return { deletedCount: 1 };
          }
        }
        return { deletedCount: 0 };
      },
      find: () => ({
        sort: () => ({
          skip: () => ({
            limit: async () => [],
          }),
        }),
      }),
      deleteMany: async () => ({ deletedCount: 0 }),
    };
  }
}

describe("RoomManager", () => {
  let roomManager, mockRedis, mockDB;

  beforeEach(() => {
    mockRedis = new MockRedis();
    mockDB = new MockDB();
    roomManager = new RoomManager(mockRedis, mockDB);
  });

  describe("createRoom", () => {
    test("should create a room with default settings", async () => {
      const room = await roomManager.createRoom();

      expect(room.id).toBeTruthy();
      expect(room.maxUsers).toBe(2);
      expect(room.state).toBe("active");
      expect(room.members).toEqual([]);
    });

    test("should enforce maxUsers limit (1-10)", async () => {
      const room = await roomManager.createRoom({ maxUsers: 100 });
      expect(room.maxUsers).toBe(10); // Clamped to max

      const room2 = await roomManager.createRoom({ maxUsers: 0 });
      expect(room2.maxUsers).toBe(1); // Clamped to min
    });

    test("should generate cryptographically unique room IDs", async () => {
      const room1 = await roomManager.createRoom();
      const room2 = await roomManager.createRoom();

      expect(room1.id).not.toBe(room2.id);
      expect(room1.id.length).toBe(8);
      expect(room2.id.length).toBe(8);
    });

    test("should store room in both Redis and MongoDB", async () => {
      const room = await roomManager.createRoom();

      const redisRoom = await roomManager.getRoom(room.id);
      expect(redisRoom).toBeTruthy();
      expect(redisRoom.id).toBe(room.id);
    });
  });

  describe("joinRoom", () => {
    let room;

    beforeEach(async () => {
      room = await roomManager.createRoom({ maxUsers: 2 });
    });

    test("should allow joining an empty room", async () => {
      const joined = await roomManager.joinRoom(
        room.id,
        "device-1",
        "Device 1"
      );

      expect(joined.members.length).toBe(1);
      expect(joined.members[0].deviceId).toBe("device-1");
      expect(joined.members[0].name).toBe("Device 1");
    });

    test("should NOT allow joining when room is full", async () => {
      await roomManager.joinRoom(room.id, "device-1", "Device 1");
      await roomManager.joinRoom(room.id, "device-2", "Device 2");

      await expect(
        roomManager.joinRoom(room.id, "device-3", "Device 3")
      ).rejects.toEqual(
        expect.objectContaining({
          code: "ROOM_FULL",
        })
      );
    });

    test("should NOT allow joining non-existent room", async () => {
      await expect(
        roomManager.joinRoom("fake-room", "device-1", "Device 1")
      ).rejects.toEqual(
        expect.objectContaining({
          code: "ROOM_NOT_FOUND",
        })
      );
    });

    test("should NOT allow duplicate device IDs", async () => {
      await roomManager.joinRoom(room.id, "device-1", "Device 1");

      await expect(
        roomManager.joinRoom(room.id, "device-1", "Device 1 Again")
      ).rejects.toEqual(
        expect.objectContaining({
          code: "ALREADY_JOINED",
        })
      );
    });

    test("should sanitize device names", async () => {
      const joined = await roomManager.joinRoom(
        room.id,
        "device-1",
        "A".repeat(200) // Very long name
      );

      expect(joined.members[0].name.length).toBeLessThanOrEqual(100);
    });
  });

  describe("leaveRoom", () => {
    test("should remove member from room", async () => {
      const room = await roomManager.createRoom();
      await roomManager.joinRoom(room.id, "device-1", "Device 1");

      const before = await roomManager.getRoom(room.id);
      expect(before.members.length).toBe(1);

      await roomManager.leaveRoom(room.id, "device-1");

      const after = await roomManager.getRoom(room.id);
      expect(after).toBeNull(); // Room auto-deleted when empty
    });
  });

  describe("getRoom", () => {
    test("should return room from cache when available", async () => {
      const created = await roomManager.createRoom();
      const fetched = await roomManager.getRoom(created.id);

      expect(fetched.id).toBe(created.id);
      expect(fetched.state).toBe("active");
    });

    test("should return null for non-existent room", async () => {
      const room = await roomManager.getRoom("fake-room");
      expect(room).toBeNull();
    });
  });

  describe("Security & Validation", () => {
    test("should reject invalid room IDs", async () => {
      await expect(
        roomManager.joinRoom(null, "device-1", "Name")
      ).rejects.toEqual(
        expect.objectContaining({
          code: "INVALID_ROOM_ID",
        })
      );
    });

    test("should reject invalid device IDs", async () => {
      const room = await roomManager.createRoom();

      await expect(
        roomManager.joinRoom(room.id, null, "Name")
      ).rejects.toEqual(
        expect.objectContaining({
          code: "INVALID_DEVICE_ID",
        })
      );
    });
  });
});
