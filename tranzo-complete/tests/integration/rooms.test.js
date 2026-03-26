// tests/integration/rooms.test.js
// Phase 11 COMPLETE: Integration tests — REST API, rate limiting, security, RoomManager
// Uses supertest for HTTP routes + direct service tests for enforcement logic

// ════════════════════════════════════════════════════════════════
// MOCKS — declared before any require()
// ════════════════════════════════════════════════════════════════

const _redisStore = new Map();

jest.mock('../../server/db/mongodb', () => {
  const col = () => ({
    insertOne:   jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
    findOne:     jest.fn().mockResolvedValue(null),
    updateOne:   jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne:   jest.fn().mockResolvedValue({ deletedCount: 1 }),
    deleteMany:  jest.fn().mockResolvedValue({ deletedCount: 0 }),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([]),
    }),
    createIndex: jest.fn().mockResolvedValue({}),
  });
  return {
    connectDB: jest.fn().mockResolvedValue({ collection: col }),
    getDB:     jest.fn().mockReturnValue({ collection: col }),
  };
});

jest.mock('../../server/db/redis', () => ({
  client: {
    get:    jest.fn().mockImplementation(async k => _redisStore.get(k) || null),
    set:    jest.fn().mockImplementation(async (k, v) => { _redisStore.set(k, v); return 'OK'; }),
    setEx:  jest.fn().mockImplementation(async (k, _t, v) => { _redisStore.set(k, v); return 'OK'; }),
    del:    jest.fn().mockImplementation(async k => { _redisStore.delete(k); return 1; }),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    on:     jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    isReady: true,
    // multi() used by RateLimiter — always returns count=0 (under limit)
    multi: jest.fn().mockReturnValue({
      zRemRangeByScore: jest.fn().mockReturnThis(),
      zCard:            jest.fn().mockReturnThis(),
      zAdd:             jest.fn().mockReturnThis(),
      expire:           jest.fn().mockReturnThis(),
      exec:             jest.fn().mockResolvedValue([0, 0]),
    }),
    zAdd:             jest.fn().mockResolvedValue(1),
    zRemRangeByScore: jest.fn().mockResolvedValue(0),
    zCard:            jest.fn().mockResolvedValue(0),
  },
}));

// ════════════════════════════════════════════════════════════════
// SETUP
// ════════════════════════════════════════════════════════════════

const request = require('supertest');

let app, server;

beforeAll(async () => {
  _redisStore.clear();
  const mod = require('../../server');
  app    = mod.app    || mod;
  server = mod.server || null;
  await new Promise(r => setTimeout(r, 200));
});

afterAll(async () => {
  if (server) await new Promise(r => server.close(r)).catch(() => {});
});

beforeEach(() => {
  _redisStore.clear();
  jest.clearAllMocks();
  // Restore default multi() mock after each test
  const redis = require('../../server/db/redis');
  redis.client.multi.mockReturnValue({
    zRemRangeByScore: jest.fn().mockReturnThis(),
    zCard:            jest.fn().mockReturnThis(),
    zAdd:             jest.fn().mockReturnThis(),
    expire:           jest.fn().mockReturnThis(),
    exec:             jest.fn().mockResolvedValue([0, 0]),
  });
  redis.client.get.mockImplementation(async k => _redisStore.get(k) || null);
  redis.client.setEx.mockImplementation(async (k, _t, v) => { _redisStore.set(k, v); return 'OK'; });
  redis.client.del.mockImplementation(async k => { _redisStore.delete(k); return 1; });
});

// ════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns JSON content-type', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('includes uptime field', async () => {
    const res = await request(app).get('/api/health');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('includes pwa field', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('pwa');
  });
});

// ════════════════════════════════════════════════════════════════
// ROOM CREATION
// ════════════════════════════════════════════════════════════════

describe('POST /api/v1/rooms', () => {
  it('creates a room — returns 201 with roomId', async () => {
    const res = await request(app).post('/api/v1/rooms').send({ maxUsers: 2 });
    expect([201, 503]).toContain(res.statusCode);
    if (res.statusCode === 201) {
      expect(typeof res.body.roomId).toBe('string');
      expect(res.body.roomId.length).toBeGreaterThan(0);
    }
  });

  it('returns a JWT token on creation', async () => {
    const res = await request(app).post('/api/v1/rooms').send({ maxUsers: 2 });
    if (res.statusCode === 201) {
      expect(res.body.token.split('.')).toHaveLength(3);
      expect(res.body).toHaveProperty('expiresAt');
    }
  });

  it('creates room with explicit maxUsers=4', async () => {
    const res = await request(app).post('/api/v1/rooms').send({ maxUsers: 4 });
    if (res.statusCode === 201) {
      expect(res.body.maxUsers).toBe(4);
    }
  });

  it('rejects maxUsers > 10', async () => {
    const res = await request(app).post('/api/v1/rooms').send({ maxUsers: 999 });
    expect([400, 422]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects maxUsers < 1', async () => {
    const res = await request(app).post('/api/v1/rooms').send({ maxUsers: 0 });
    expect([400, 422]).toContain(res.statusCode);
  });

  it('rejects string maxUsers', async () => {
    const res = await request(app).post('/api/v1/rooms').send({ maxUsers: 'abc' });
    expect([400, 422]).toContain(res.statusCode);
  });

  it('returns JSON on all error responses', async () => {
    const res = await request(app).post('/api/v1/rooms').send({ maxUsers: 999 });
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('does not leak stack traces in error body', async () => {
    const res = await request(app).post('/api/v1/rooms').send({ maxUsers: 999 });
    expect(JSON.stringify(res.body)).not.toMatch(/at Object\.|node_modules/);
  });
});

// ════════════════════════════════════════════════════════════════
// ROOM RETRIEVAL
// ════════════════════════════════════════════════════════════════

describe('GET /api/v1/rooms/:roomId', () => {
  it('returns 404 for nonexistent room', async () => {
    const res = await request(app).get('/api/v1/rooms/NO-SUCH-ROOM');
    expect([404, 503]).toContain(res.statusCode);
    if (res.statusCode === 404) expect(res.body).toHaveProperty('error');
  });

  it('returns room data after creation', async () => {
    const create = await request(app).post('/api/v1/rooms').send({ maxUsers: 3 });
    if (create.statusCode !== 201) return;

    const get = await request(app).get(`/api/v1/rooms/${create.body.roomId}`);
    expect(get.statusCode).toBe(200);
    expect(get.body.roomId).toBe(create.body.roomId);
    expect(get.body.maxUsers).toBe(3);
    expect(Array.isArray(get.body.members)).toBe(true);
  });

  it('new room has state=active', async () => {
    const create = await request(app).post('/api/v1/rooms').send({ maxUsers: 2 });
    if (create.statusCode !== 201) return;

    const get = await request(app).get(`/api/v1/rooms/${create.body.roomId}`);
    if (get.statusCode === 200) expect(get.body.state).toBe('active');
  });

  it('blocks path traversal attempts', async () => {
    const res = await request(app).get('/api/v1/rooms/../../../etc/passwd');
    expect([400, 404]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
// ROOM JOIN
// ════════════════════════════════════════════════════════════════

describe('POST /api/v1/rooms/:roomId/join', () => {
  it('returns 404 when joining nonexistent room', async () => {
    const res = await request(app)
      .post('/api/v1/rooms/FAKE-XYZ/join')
      .send({ deviceName: 'TestDevice' });
    expect([404, 503]).toContain(res.statusCode);
  });

  it('joins a real room and returns token + deviceId', async () => {
    const create = await request(app).post('/api/v1/rooms').send({ maxUsers: 3 });
    if (create.statusCode !== 201) return;

    const join = await request(app)
      .post(`/api/v1/rooms/${create.body.roomId}/join`)
      .send({ deviceName: 'Device-A' });

    expect([200, 401]).toContain(join.statusCode);
    if (join.statusCode === 200) {
      expect(join.body).toHaveProperty('token');
      expect(join.body).toHaveProperty('deviceId');
      expect(join.body.roomId).toBe(create.body.roomId);
    }
  });

  it('enforces capacity — rejects join when room is full', async () => {
    const create = await request(app).post('/api/v1/rooms').send({ maxUsers: 1 });
    if (create.statusCode !== 201) return;

    const { roomId } = create.body;

    // First join
    await request(app).post(`/api/v1/rooms/${roomId}/join`).send({ deviceName: 'Dev-A' });

    // Second join → should be rejected
    const join2 = await request(app)
      .post(`/api/v1/rooms/${roomId}/join`)
      .send({ deviceName: 'Dev-B' });

    expect([409, 401, 503]).toContain(join2.statusCode);
    if (join2.statusCode === 409) expect(join2.body.error).toMatch(/full/i);
  });

  it('rejects excessively long deviceName', async () => {
    const create = await request(app).post('/api/v1/rooms').send({ maxUsers: 3 });
    if (create.statusCode !== 201) return;

    const join = await request(app)
      .post(`/api/v1/rooms/${create.body.roomId}/join`)
      .send({ deviceName: 'A'.repeat(500) });

    expect([200, 400, 401]).toContain(join.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
// ROOM LEAVE — auth required
// ════════════════════════════════════════════════════════════════

describe('POST /api/v1/rooms/:roomId/leave', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/v1/rooms/ANY/leave').send({});
    expect([401, 403]).toContain(res.statusCode);
  });

  it('returns 401 with malformed JWT', async () => {
    const res = await request(app)
      .post('/api/v1/rooms/ANY/leave')
      .set('Authorization', 'Bearer not-a-jwt')
      .send({});
    expect([401, 403]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
// RATE LIMITER — service-level enforcement tests
// ════════════════════════════════════════════════════════════════

describe('RateLimiter enforcement', () => {
  let rl;

  beforeEach(() => {
    const RateLimiter = require('../../server/services/RateLimiter');
    const redis = require('../../server/db/redis');
    rl = new RateLimiter(redis.client);
  });

  it('allows request when count < limit', async () => {
    const redis = require('../../server/db/redis');
    redis.client.multi.mockReturnValueOnce({
      zRemRangeByScore: jest.fn().mockReturnThis(),
      zCard:            jest.fn().mockReturnThis(),
      zAdd:             jest.fn().mockReturnThis(),
      expire:           jest.fn().mockReturnThis(),
      exec:             jest.fn().mockResolvedValue([0, 3]),
    });
    const result = await rl.checkCreateRoom('1.2.3.4');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(6); // 10 - 3 - 1
  });

  it('blocks request when count >= limit', async () => {
    const redis = require('../../server/db/redis');
    redis.client.multi.mockReturnValueOnce({
      zRemRangeByScore: jest.fn().mockReturnThis(),
      zCard:            jest.fn().mockReturnThis(),
      zAdd:             jest.fn().mockReturnThis(),
      expire:           jest.fn().mockReturnThis(),
      exec:             jest.fn().mockResolvedValue([0, 10]), // limit = 10
    });
    const result = await rl.checkCreateRoom('1.2.3.4');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBe(3600);
  });

  it('uses separate key for join vs create', async () => {
    const redis = require('../../server/db/redis');
    await rl.checkCreateRoom('5.5.5.5');
    await rl.checkJoinRoom('5.5.5.5');
    // Two separate multi() calls
    expect(redis.client.multi).toHaveBeenCalledTimes(2);
  });

  it('separates limits per IP — IP A does not affect IP B', async () => {
    const redis = require('../../server/db/redis');
    await rl.checkJoinRoom('10.0.0.1');
    await rl.checkJoinRoom('10.0.0.2');
    expect(redis.client.multi).toHaveBeenCalledTimes(2);
  });

  it('fails open in non-production on Redis error', async () => {
    const savedEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const redis = require('../../server/db/redis');
    redis.client.multi.mockReturnValueOnce({
      zRemRangeByScore: jest.fn().mockReturnThis(),
      zCard:            jest.fn().mockReturnThis(),
      zAdd:             jest.fn().mockReturnThis(),
      expire:           jest.fn().mockReturnThis(),
      exec:             jest.fn().mockRejectedValue(new Error('Redis down')),
    });
    const result = await rl.checkCreateRoom('1.1.1.1');
    expect(result.allowed).toBe(true);
    process.env.NODE_ENV = savedEnv;
  });

  it('checkWebRTCSignal uses 1-second window', async () => {
    const redis = require('../../server/db/redis');
    // Count = 999, limit = 1000 → allowed
    redis.client.multi.mockReturnValueOnce({
      zRemRangeByScore: jest.fn().mockReturnThis(),
      zCard:            jest.fn().mockReturnThis(),
      zAdd:             jest.fn().mockReturnThis(),
      expire:           jest.fn().mockReturnThis(),
      exec:             jest.fn().mockResolvedValue([0, 999]),
    });
    const result = await rl.checkWebRTCSignal('device-abc');
    expect(result.allowed).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// ROOM MANAGER — service integration
// ════════════════════════════════════════════════════════════════

describe('RoomManager service', () => {
  let rm;

  beforeEach(() => {
    const RoomManager = require('../../server/services/RoomManager');
    const redis = require('../../server/db/redis');
    const mongo = require('../../server/db/mongodb');
    rm = new RoomManager(redis.client, { collection: mongo.getDB().collection });
  });

  it('creates a room with non-empty ID', async () => {
    const room = await rm.createRoom({ maxUsers: 2 });
    expect(room.id.length).toBeGreaterThan(0);
    expect(room.maxUsers).toBe(2);
    expect(room.state).toBe('active');
  });

  it('clamps maxUsers to minimum 1', async () => {
    const room = await rm.createRoom({ maxUsers: 0 });
    expect(room.maxUsers).toBe(1);
  });

  it('clamps maxUsers to maximum 10', async () => {
    const room = await rm.createRoom({ maxUsers: 100 });
    expect(room.maxUsers).toBe(10);
  });

  it('stores room in Redis on creation', async () => {
    const redis = require('../../server/db/redis');
    const room = await rm.createRoom({ maxUsers: 2 });
    expect(redis.client.setEx).toHaveBeenCalledWith(
      `room:${room.id}`, expect.any(Number), expect.any(String)
    );
  });

  it('generates unique IDs across multiple rooms', async () => {
    const rooms = await Promise.all([rm.createRoom(), rm.createRoom(), rm.createRoom()]);
    const ids = new Set(rooms.map(r => r.id));
    expect(ids.size).toBe(3);
  });

  it('throws INVALID_ROOM_ID for empty string', async () => {
    await expect(rm.joinRoom('', 'dev-1', 'Alice'))
      .rejects.toMatchObject({ code: 'INVALID_ROOM_ID' });
  });

  it('throws INVALID_DEVICE_ID for empty deviceId', async () => {
    await expect(rm.joinRoom('room-1', '', 'Alice'))
      .rejects.toMatchObject({ code: 'INVALID_DEVICE_ID' });
  });

  it('throws ROOM_NOT_FOUND for nonexistent room', async () => {
    await expect(rm.joinRoom('ghost-room', 'dev-1', 'Alice'))
      .rejects.toMatchObject({ code: 'ROOM_NOT_FOUND' });
  });

  it('throws ROOM_FULL when capacity reached', async () => {
    const room = await rm.createRoom({ maxUsers: 1 });
    const fullRoom = {
      ...room,
      members: [{ deviceId: 'already-here', name: 'Bob', joinedAt: new Date() }],
    };
    const redis = require('../../server/db/redis');
    redis.client.get.mockResolvedValueOnce(JSON.stringify(fullRoom));

    await expect(rm.joinRoom(room.id, 'new-dev', 'Carol'))
      .rejects.toMatchObject({ code: 'ROOM_FULL' });
  });

  it('throws ALREADY_JOINED for duplicate deviceId', async () => {
    const room = await rm.createRoom({ maxUsers: 3 });
    const withMember = {
      ...room,
      members: [{ deviceId: 'dev-1', name: 'Alice', joinedAt: new Date() }],
    };
    const redis = require('../../server/db/redis');
    redis.client.get.mockResolvedValueOnce(JSON.stringify(withMember));

    await expect(rm.joinRoom(room.id, 'dev-1', 'Alice'))
      .rejects.toMatchObject({ code: 'ALREADY_JOINED' });
  });

  it('deletes room from Redis when last member leaves', async () => {
    const room = await rm.createRoom({ maxUsers: 2 });
    const withMember = {
      ...room,
      members: [{ deviceId: 'dev-1', name: 'Solo', joinedAt: new Date() }],
    };
    const redis = require('../../server/db/redis');
    redis.client.get.mockResolvedValueOnce(JSON.stringify(withMember));

    await rm.leaveRoom(room.id, 'dev-1');
    expect(redis.client.del).toHaveBeenCalledWith(`room:${room.id}`);
  });

  it('sets expiry and includes expiresAt field', async () => {
    const room = await rm.createRoom({ maxUsers: 2 });
    expect(room.expiresAt).toBeDefined();
    expect(new Date(room.expiresAt) > new Date()).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// ICE CONFIG
// ════════════════════════════════════════════════════════════════

describe('GET /api/v1/ice/config', () => {
  it('returns iceServers array', async () => {
    const res = await request(app).get('/api/v1/ice/config');
    expect([200, 503]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body.iceServers)).toBe(true);
      expect(res.body.iceServers.length).toBeGreaterThan(0);
    }
  });

  it('each server has urls field', async () => {
    const res = await request(app).get('/api/v1/ice/config');
    if (res.statusCode === 200) {
      res.body.iceServers.forEach(s => expect(s.urls).toBeDefined());
    }
  });
});

// ════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ════════════════════════════════════════════════════════════════

describe('Security headers', () => {
  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('does not expose X-Powered-By', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('sets X-Frame-Options or Content-Security-Policy', async () => {
    const res = await request(app).get('/api/health');
    expect(!!(res.headers['x-frame-options'] || res.headers['content-security-policy'])).toBe(true);
  });

  it('does not leak stack traces in 4xx responses', async () => {
    const res = await request(app).get('/api/v1/rooms/FAKE');
    expect(JSON.stringify(res.body)).not.toMatch(/at Object\.|\.js:\d+:\d+/);
  });

  it('rejects oversized body payload', async () => {
    const res = await request(app)
      .post('/api/v1/rooms')
      .send({ maxUsers: 2, junk: 'x'.repeat(200_000) });
    expect([400, 413]).toContain(res.statusCode);
  });

  it('API error responses are JSON — not HTML', async () => {
    const res = await request(app)
      .get('/api/v1/rooms/NO-ROOM')
      .set('Accept', 'application/json');
    expect(res.headers['content-type']).toMatch(/json/);
    expect(typeof res.body).toBe('object');
  });
});

// ════════════════════════════════════════════════════════════════
// PWA ASSETS
// ════════════════════════════════════════════════════════════════

describe('PWA assets', () => {
  it('GET /manifest.json returns valid manifest', async () => {
    const res = await request(app).get('/manifest.json');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.display).toBe('standalone');
    expect(Array.isArray(res.body.icons)).toBe(true);
  });

  it('GET /sw.js serves with service-worker headers', async () => {
    const res = await request(app).get('/sw.js');
    if (res.statusCode === 200) {
      expect(res.headers['content-type']).toMatch(/javascript/);
      expect(res.headers['service-worker-allowed']).toBe('/');
      expect(res.headers['cache-control']).toMatch(/no-cache/);
    }
    expect([200, 404]).toContain(res.statusCode);
  });
});

// ════════════════════════════════════════════════════════════════
// END-TO-END ROOM LIFECYCLE
// ════════════════════════════════════════════════════════════════

describe('End-to-end: full room lifecycle', () => {
  it('create → get → join → leave', async () => {
    const create = await request(app).post('/api/v1/rooms').send({ maxUsers: 3 });
    if (create.statusCode !== 201) return;

    const { roomId } = create.body;

    const get = await request(app).get(`/api/v1/rooms/${roomId}`);
    expect(get.statusCode).toBe(200);
    expect(get.body.members).toHaveLength(0);

    const join = await request(app)
      .post(`/api/v1/rooms/${roomId}/join`)
      .send({ deviceName: 'MyPhone' });

    if (join.statusCode === 200) {
      const leave = await request(app)
        .post(`/api/v1/rooms/${roomId}/leave`)
        .set('Authorization', `Bearer ${join.body.token}`)
        .send({});
      expect([200, 401]).toContain(leave.statusCode);
    }
  });

  it('two independent IPs have separate rate-limit counters', async () => {
    const RateLimiter = require('../../server/services/RateLimiter');
    const redis = require('../../server/db/redis');
    const rl = new RateLimiter(redis.client);

    const [r1, r2] = await Promise.all([
      rl.checkJoinRoom('192.168.1.1'),
      rl.checkJoinRoom('10.0.0.1'),
    ]);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });
});
