// server/db/mongodb.js
// MongoDB connection for persistent storage

const { MongoClient } = require("mongodb");

let dbInstance = null;

async function connectDB() {
  if (dbInstance) return dbInstance;

  try {
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/p2p";
    const client = new MongoClient(mongoUrl);
    await client.connect();
    dbInstance = client.db();

    console.log("✓ MongoDB connected");

    // Create indexes for auto-expiry
    await dbInstance.collection("rooms").createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 86400 } // 24 hour TTL
    );

    await dbInstance.collection("room_events").createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 604800 } // 7 day TTL
    );

    await dbInstance.collection("audit_log").createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 2592000 } // 30 day TTL
    );

    console.log("✓ MongoDB indexes created");
    return dbInstance;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
}

async function getDB() {
  if (!dbInstance) {
    await connectDB();
  }
  return dbInstance;
}

module.exports = { connectDB, getDB };
