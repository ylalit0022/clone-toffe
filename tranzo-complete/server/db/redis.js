// server/db/redis.js
// Redis client setup for caching room state

const redis = require("redis");

const pubClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

const subClient = pubClient.duplicate();

// Connect clients
(async () => {
  try {
    await pubClient.connect();
    await subClient.connect();
    console.log("✓ Redis connected");
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
    process.exit(1);
  }
})();

// Error handling
pubClient.on("error", (err) => console.error("Redis error:", err));
pubClient.on("disconnect", () => console.warn("⚠ Redis disconnected"));

module.exports = { client: pubClient, pubClient, subClient };
