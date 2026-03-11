// ═══════════════════════════════════════════════════════════════
//  db/mongodb.js  — MongoDB connection via Mongoose
//
//  Reads MONGODB_URI from process.env (loaded by dotenv in server.js).
//
//  URI formats:
//    Local:  mongodb://127.0.0.1:27017/tranzo
//    Atlas:  mongodb+srv://user:pass@cluster.mongodb.net/tranzo
//
//  The connection is non-blocking — the app (signaling, WebRTC)
//  continues to work even if Mongo is temporarily unreachable.
//  DB calls (.catch) never crash the server.
// ═══════════════════════════════════════════════════════════════

"use strict";

const mongoose = require("mongoose");

// ── Read URI from env ─────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error([
    "",
    "╔══════════════════════════════════════════════════════════╗",
    "║  [MongoDB] ERROR: MONGODB_URI is not set in .env         ║",
    "║  Create a .env file in the project root with:            ║",
    "║                                                          ║",
    "║  MONGODB_URI=mongodb://127.0.0.1:27017/tranzo            ║",
    "║    — or for Atlas —                                      ║",
    "║  MONGODB_URI=mongodb+srv://user:pass@host/tranzo         ║",
    "╚══════════════════════════════════════════════════════════╝",
    "",
  ].join("\n"));
  // Don't exit — server works without DB
}

// ── Connection options ────────────────────────────────────────
const OPTS = {
  // Atlas is cloud — give it more time to connect initially
  serverSelectionTimeoutMS: 15000,   // 15s
  socketTimeoutMS:          45000,
  // NOTE: bufferCommands is intentionally LEFT at default (true)
  // so that DB operations fired before the connection is ready
  // are queued and executed once connected, instead of failing immediately.
};

let _connected = false;

async function connectDB() {
  if (_connected) return;
  if (!MONGODB_URI) return;   // already warned above

  // Mask password in logs: mongodb+srv://user:***@host/db
  const safeUri = MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  console.log(`[MongoDB] Connecting → ${safeUri}`);

  try {
    await mongoose.connect(MONGODB_URI, OPTS);
    _connected = true;
    console.log(`[MongoDB] ✅ Connected → ${safeUri}`);
  } catch (err) {
    // Non-fatal: signaling server still works without DB
    console.error([
      `[MongoDB] ❌ Connection failed: ${err.message}`,
      `[MongoDB] URI used: ${safeUri}`,
      "[MongoDB] Common fixes:",
      "  1. Atlas: check Network Access → IP whitelist includes your IP (or 0.0.0.0/0)",
      "  2. Atlas: verify username & password (no special chars like < > unencoded)",
      "  3. Atlas: URI must include DB name — e.g. .../tranzo?retryWrites=true",
      "  4. Local: run  sudo systemctl start mongod",
      "[MongoDB] Server will continue without database — retrying in background.",
    ].join("\n"));
  }

  // Log subsequent events
  mongoose.connection.on("connected",    () => { _connected = true;  console.log("[MongoDB] ✅ Reconnected"); });
  mongoose.connection.on("disconnected", () => { _connected = false; console.warn("[MongoDB] ⚠️  Disconnected — will retry"); });
  mongoose.connection.on("error",        (e) => { console.error("[MongoDB] Error:", e.message); });
}

// Graceful shutdown
process.on("SIGINT",  () => mongoose.connection.close().then(() => process.exit(0)));
process.on("SIGTERM", () => mongoose.connection.close().then(() => process.exit(0)));

module.exports = { connectDB, mongoose };