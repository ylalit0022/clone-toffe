// ═══════════════════════════════════════════════════════════════
//  db/models/DeviceSession.js  — Tracks per-device login sessions
//
//  One document = one active login on one device.
//  Linked to User via userId (ObjectId ref).
//
//  Lifecycle:
//    CREATE  → on POST /auth/login  (or /auth/register)
//    UPDATE  → lastActiveAt bumped by authMiddleware on every request
//    REVOKE  → isActive = false  (soft-delete; keeps audit trail)
//    PURGE   → TTL index auto-removes revoked docs after 30 days
// ═══════════════════════════════════════════════════════════════

"use strict";

const { mongoose } = require("../mongodb");
const { Schema, Types } = mongoose;

const DeviceSessionSchema = new Schema(
  {
    // ── Owner ──────────────────────────────────────────────
    userId: {
      type:     Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    // ── Device fingerprint ─────────────────────────────────
    deviceName: {
      type:      String,
      default:   "Unknown Device",
      maxlength: 200,
      trim:      true,
    },

    // desktop | mobile | tablet | bot | unknown
    deviceType: {
      type:    String,
      enum:    ["desktop", "mobile", "tablet", "bot", "unknown"],
      default: "unknown",
    },

    ipAddress: {
      type:      String,
      default:   "0.0.0.0",
      maxlength: 45,   // IPv6 max length
    },

    userAgent: {
      type:      String,
      default:   "",
      maxlength: 512,
    },

    // ── JWT jti — one-time ID embedded in the token ────────
    // Allows instant single-session revocation without touching
    // the user doc or rotating the JWT secret.
    jti: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },

    // ── Status ─────────────────────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
      index:   true,
    },

    // Reason a session was revoked (audit trail)
    revokedReason: {
      type: String,
      enum: ["logout", "logout_all", "password_change", "admin", null],
      default: null,
    },

    // ── Activity timestamps ────────────────────────────────
    lastActiveAt: {
      type:    Date,
      default: Date.now,
      index:   true,
    },

    // TTL: auto-purge revoked sessions 30 days after revocation
    // (Active sessions are never purged by TTL — only after revoke)
    revokedAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
  }
);

// ── TTL index: purge revoked sessions 30 days after revokedAt ─
// Only fires when revokedAt is set (null docs are ignored by TTL).
DeviceSessionSchema.index(
  { revokedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { revokedAt: { $type: "date" } } }
);

// ── Compound index for "get all active sessions for user" ─────
DeviceSessionSchema.index({ userId: 1, isActive: 1, lastActiveAt: -1 });

// ── Static helpers ────────────────────────────────────────────

/**
 * Create a new device session record.
 */
DeviceSessionSchema.statics.createSession = function ({ userId, deviceName, deviceType, ipAddress, userAgent, jti }) {
  return this.create({ userId, deviceName, deviceType, ipAddress, userAgent, jti });
};

/**
 * Soft-revoke a single session by jti.
 * The JWT stays signed but this doc's isActive=false causes middleware to reject it.
 */
DeviceSessionSchema.statics.revokeByJti = function (jti, reason = "logout") {
  return this.findOneAndUpdate(
    { jti },
    { $set: { isActive: false, revokedAt: new Date(), revokedReason: reason } },
    { new: true }
  );
};

/**
 * Revoke all sessions for a user EXCEPT the one with the given jti.
 * Used when changing password — keeps the current session alive.
 */
DeviceSessionSchema.statics.revokeAllExcept = function (userId, currentJti, reason = "password_change") {
  return this.updateMany(
    { userId, isActive: true, jti: { $ne: currentJti } },
    { $set: { isActive: false, revokedAt: new Date(), revokedReason: reason } }
  );
};

/**
 * Revoke ALL sessions for a user (logout from all devices).
 */
DeviceSessionSchema.statics.revokeAll = function (userId, reason = "logout_all") {
  return this.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false, revokedAt: new Date(), revokedReason: reason } }
  );
};

/**
 * Bump lastActiveAt for a session (called by auth middleware on each request).
 * Throttled: only writes if last update was > 2 minutes ago to avoid hammering DB.
 */
DeviceSessionSchema.statics.touch = function (jti) {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  return this.findOneAndUpdate(
    { jti, isActive: true, lastActiveAt: { $lt: twoMinutesAgo } },
    { $set: { lastActiveAt: new Date() } }
  );
};

/**
 * Get all active sessions for a user, newest first.
 */
DeviceSessionSchema.statics.getActiveSessions = function (userId) {
  return this.find({ userId, isActive: true })
    .sort({ lastActiveAt: -1 })
    .select("deviceName deviceType ipAddress userAgent createdAt lastActiveAt jti");
};

const DeviceSession = mongoose.models.DeviceSession || mongoose.model("DeviceSession", DeviceSessionSchema);
module.exports = DeviceSession;
