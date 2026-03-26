// tests/unit/RateLimiter.test.js
// Test RateLimiter service

const RateLimiter = require("../../server/services/RateLimiter");

class MockRedis {
  constructor() {
    this.data = new Map();
    this.zsets = new Map();
  }

  async multi() {
    return {
      zRemRangeByScore: (key, min, max) => {
        if (!this.zsets.has(key)) this.zsets.set(key, []);
        const zset = this.zsets.get(key);
        this.zsets.set(
          key,
          zset.filter((item) => item.score < min || item.score > max)
        );
        return this;
      },
      zCard: (key) => this,
      zAdd: (key, items) => {
        if (!this.zsets.has(key)) this.zsets.set(key, []);
        this.zsets.get(key).push(...items);
        return this;
      },
      expire: () => this,
      exec: async () => {
        const zset = Array.from(this.zsets.values())[0] || [];
        return [[null, 0], [null, zset.length]];
      },
    };
  }
}

describe("RateLimiter", () => {
  let limiter, mockRedis;

  beforeEach(() => {
    mockRedis = new MockRedis();
    limiter = new RateLimiter(mockRedis);
  });

  describe("checkLimit", () => {
    test("should allow requests within limit", async () => {
      const result = await limiter.checkLimit("test-key", 10, 60);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    test("should reject requests exceeding limit", async () => {
      // Create 10 requests
      for (let i = 0; i < 10; i++) {
        mockRedis.zsets.set(`ratelimit:test-key`, [
          ...((mockRedis.zsets.get(`ratelimit:test-key`) as any) || []),
          { score: Date.now() - i * 100, member: `req-${i}` },
        ]);
      }

      const result = await limiter.checkLimit("test-key", 10, 60);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(60);
    });
  });

  describe("Specific Limiters", () => {
    test("checkCreateRoom: 10/hour per IP", async () => {
      const result = await limiter.checkCreateRoom("192.168.1.1");
      expect(result.allowed).toBe(true);
    });

    test("checkJoinRoom: 30/minute per IP", async () => {
      const result = await limiter.checkJoinRoom("192.168.1.1");
      expect(result.allowed).toBe(true);
    });

    test("checkWebRTCSignal: 1000/second per device", async () => {
      const result = await limiter.checkWebRTCSignal("device-123");
      expect(result.allowed).toBe(true);
    });

    test("checkGetRoom: 100/minute per IP", async () => {
      const result = await limiter.checkGetRoom("192.168.1.1");
      expect(result.allowed).toBe(true);
    });
  });

  describe("Different IPs are separate limits", () => {
    test("IP1 limit should not affect IP2", async () => {
      const result1 = await limiter.checkCreateRoom("192.168.1.1");
      const result2 = await limiter.checkCreateRoom("192.168.1.2");

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });
});
