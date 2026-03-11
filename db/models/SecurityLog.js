// ═══════════════════════════════════════════════════════════════
//  db/models/SecurityLog.js  — Security event audit trail
// ═══════════════════════════════════════════════════════════════
"use strict";

const { mongoose } = require("../mongodb");
const { Schema, Types } = mongoose;

const EVENT_TYPES = [
  "login_success", "login_failure",
  "login_blocked_ip", "login_blocked_account",
  "account_locked", "account_unlocked",
  "new_device_login", "register",
  "logout", "logout_all",
  "password_change", "password_reset_req", "session_revoked",
];

const SecurityLogSchema = new Schema(
  {
    userId:    { type: Types.ObjectId, ref: "User", default: null, index: true },
    eventType: { type: String, enum: EVENT_TYPES, required: true, index: true },
    ipAddress: { type: String, default: "0.0.0.0", maxlength: 45 },
    device:    { type: String, default: "Unknown", maxlength: 256 },
    meta:      { type: Object, default: {} },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false }, versionKey: false }
);

// Auto-purge after 90 days
SecurityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
SecurityLogSchema.index({ userId: 1, createdAt: -1 });
SecurityLogSchema.index({ eventType: 1, createdAt: -1 });

SecurityLogSchema.statics.log = function ({ userId = null, eventType, ipAddress = "0.0.0.0", device = "Unknown", meta = {} }) {
  return this.create({ userId, eventType, ipAddress, device, meta })
    .catch(err => console.warn("[SecurityLog] Failed to write log:", err.message));
};

const SecurityLog = mongoose.models.SecurityLog || mongoose.model("SecurityLog", SecurityLogSchema);
module.exports = SecurityLog;
