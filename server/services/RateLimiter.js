// server/services/RateLimiter.js
// Sliding-window rate limiting using Redis sorted sets.
// Compatible with redis@4 (exec returns flat values, not [err,val] tuples).

class RateLimiter {
  constructor(redis) {
    this.redis = redis;
  }

  // ✅ Generic sliding-window rate limit check
  // redis@4  → exec() returns [removedCount, cardCount]   (plain numbers)
  // redis@3  → exec() returns [[null,removed],[null,count]] (tuples)
  // We handle both safely.
  async checkLimit(key, limit, windowSeconds) {
    const now         = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const redisKey    = `ratelimit:${key}`;

    try {
      // Remove stale entries, then count what's left
      const results = await this.redis
        .multi()
        .zRemRangeByScore(redisKey, 0, windowStart)
        .zCard(redisKey)
        .exec();

      // Detect format: redis@4 gives [0, 3] — redis@3 gives [[null,0],[null,3]]
      let count = 0;
      const second = results[1];
      if (second !== null && typeof second === 'object' && Array.isArray(second)) {
        // redis@3 tuple: [err, value]
        count = Number(second[1]) || 0;
      } else {
        // redis@4 flat value
        count = Number(second) || 0;
      }

      if (count >= limit) {
        return { allowed: false, retryAfter: windowSeconds };
      }

      // Record this request
      const member = `${now}:${Math.random().toString(36).slice(2)}`;
      await this.redis
        .multi()
        .zAdd(redisKey, { score: now, value: member })
        .expire(redisKey, windowSeconds + 10)
        .exec();

      return { allowed: true, remaining: limit - count - 1 };

    } catch (err) {
      console.warn(`[RateLimiter] Redis error (${key}):`, err.message);
      // Fail-open in dev so a missing Redis doesn't block development
      if (process.env.NODE_ENV === 'production') {
        return { allowed: false, retryAfter: 60 };
      }
      return { allowed: true, remaining: limit };
    }
  }

  // ✅ Create room: 10/hour per IP
  async checkCreateRoom(ip) {
    return this.checkLimit(`create-room:${ip}`, 10, 3600);
  }

  // ✅ Join room: 30/minute per IP
  async checkJoinRoom(ip) {
    return this.checkLimit(`join-room:${ip}`, 30, 60);
  }

  // ✅ WebRTC signals: 1000/second per device
  async checkWebRTCSignal(deviceId) {
    return this.checkLimit(`signal:${deviceId}`, 1000, 1);
  }

  // ✅ Get room info: 100/minute per IP
  async checkGetRoom(ip) {
    return this.checkLimit(`get-room:${ip}`, 100, 60);
  }
}

module.exports = RateLimiter;
