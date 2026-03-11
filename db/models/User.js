// ═══════════════════════════════════════════════════════════════
//  db/models/User.js  — Mongoose User model
//
//  Fields (required by spec):
//    email             — unique identifier, indexed
//    name              — display name (falls back to deviceName in socket)
//    plan              — "free" | "premium"
//    onlineStatus      — "online" | "offline"
//    subscription_expiry — Date | null
//    created_at        — auto-set on first insert
//
//  Additional fields kept minimal to avoid scope creep:
//    socketId          — current Socket.IO id (transient, updated on connect)
//    lastSeen          — updated on every disconnect (for analytics / expiry)
//
//  Usage:
//    const User = require('./db/models/User');
//
//    // Upsert on socket connect (create if new, update if returning)
//    await User.findOneAndUpdate(
//      { email },
//      { $set: { onlineStatus: 'online', socketId, name } },
//      { upsert: true, new: true, setDefaultsOnInsert: true }
//    );
//
//    // Mark offline on disconnect
//    await User.findOneAndUpdate(
//      { socketId },
//      { $set: { onlineStatus: 'offline', lastSeen: new Date() } }
//    );
// ═══════════════════════════════════════════════════════════════

"use strict";

const { mongoose } = require("../mongodb");
const { Schema }   = mongoose;

const UserSchema = new Schema(
  {    // ── Identity ─────────────────────────────────────────────
    email: {
      type:     String,
      required: false,    // anonymous users have no email; upsert by socketId
      unique:   true,
      sparse:   true,     // allow multiple null emails (anonymous sessions)
      lowercase: true,
      trim:     true,
    },

    name: {
      type:    String,
      default: "Anonymous",
      trim:    true,
      maxlength: 128,
    },

    // ── Plan / subscription ──────────────────────────────────
    plan: {
      type:    String,
      enum:    ["free", "premium"],
      default: "free",
    },

    subscription_expiry: {
      type:    Date,
      default: null,
    },

    // ── Presence ─────────────────────────────────────────────
    onlineStatus: {
      type:    String,
      enum:    ["online", "offline"],
      default: "offline",
    },

    // Current Socket.IO socket id — updated on every connect/reconnect.
    // Transient: do NOT use as a permanent identifier.
    socketId: {
      type:    String,
      default: null,
      index:   true,    // fast lookup on disconnect
    },

    lastSeen: {
      type:    Date,
      default: null,
    },

    // ── Auth ─────────────────────────────────────────────────
    // Bcrypt hash stored here. Raw password is NEVER stored.
    // null for anonymous / socket-only users.
    passwordHash: {
      type:    String,
      default: null,
      select:  false,   // never returned in queries unless explicitly requested
    },

    // Stamp updated on every password change.
    // Auth middleware compares this against JWT iat to invalidate old tokens.
    passwordChangedAt: {
      type:    Date,
      default: null,
    },
    // ── Login lockout ────────────────────────────────────────
    // Tracks consecutive failed logins for account lock protection.
    failedLoginAttempts: {
      type:    Number,
      default: 0,
    },
    lockedUntil: {
      type:    Date,
      default: null,
      index:   true,
    },
    // Known IPs — used for new-device detection
    knownIps: {
      type:    [String],
      default: [],
      select:  false,
    },
  },
  {
    // ── Timestamps ───────────────────────────────────────────
    // Mongoose adds `createdAt` and `updatedAt` automatically.
    // We alias createdAt → created_at via a virtual so existing
    // code that reads `.created_at` keeps working.
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },

    // Remove __v from all query results
    versionKey: false,
  }
);

// ── Indexes ──────────────────────────────────────────────────
// email is already indexed (unique: true, sparse: true).
// socketId is indexed above.
// Compound index for presence queries (room dashboards, admin panels):
UserSchema.index({ onlineStatus: 1, updated_at: -1 });

// ── Instance helpers ─────────────────────────────────────────

/**
 * Mark this user as online, optionally update their socketId.
 * Returns the saved document.
 */
UserSchema.methods.goOnline = function (socketId) {
  this.onlineStatus = "online";
  if (socketId) this.socketId = socketId;
  return this.save();
};

/**
 * Mark this user as offline, record lastSeen.
 * Returns the saved document.
 */
UserSchema.methods.goOffline = function () {
  this.onlineStatus = "offline";
  this.lastSeen     = new Date();
  this.socketId     = null;
  return this.save();
};

// ── Static helpers ───────────────────────────────────────────

/**
 * Safe upsert: find-or-create a user record when a socket connects.
 * - If email is known: upsert by email.
 * - If anonymous: upsert by socketId (creates a lightweight session record).
 *
 * @param {object} opts
 * @param {string} [opts.email]      - user email (may be undefined)
 * @param {string}  opts.socketId    - current socket id (always present)
 * @param {string} [opts.name]       - device / display name
 * @returns {Promise<UserDocument>}
 */
UserSchema.statics.upsertOnConnect = async function ({ email, socketId, name }) {
  const filter = email ? { email } : { socketId };
  const update = {
    $set: {
      onlineStatus: "online",
      socketId,
      ...(name  && { name }),
      ...(email && { email }),
    },
    $setOnInsert: {
      plan: "free",
      subscription_expiry: null,
    },
  };
  return this.findOneAndUpdate(filter, update, {
    upsert:               true,
    new:                  true,
    setDefaultsOnInsert:  true,
  });
};

/**
 * Mark a user offline by their socketId.
 * Called in socket disconnect handler.
 *
 * @param {string} socketId
 * @returns {Promise<UserDocument|null>}
 */
UserSchema.statics.markOfflineBySocket = async function (socketId) {
  return this.findOneAndUpdate(
    { socketId },
    { $set: { onlineStatus: "offline", lastSeen: new Date(), socketId: null } },
    { new: true }
  );
};

/**
 * Find a registered user by email (includes passwordHash).
 * Used in login flow only.
 */
UserSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
};

// ── Export ───────────────────────────────────────────────────
// Guard against "Cannot overwrite model once compiled" error in
// hot-reload environments (jest, nodemon, etc.)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;