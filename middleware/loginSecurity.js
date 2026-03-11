// ═══════════════════════════════════════════════════════════════
//  middleware/loginSecurity.js
//
//  Provides THREE security layers, all in one file:
//
//  1. ipRateLimit(req, res, next)
//     — Max 10 login attempts per IP per 10 min (in-memory, no Redis needed)
//     — Fires BEFORE password check so we never hit the DB excessively
//
//  2. checkAccountLock(user, res)  [called inside route, not middleware]
//     — Returns true if account is locked, sends 423 response
//
//  3. recordLoginResult({ success, user, ip, device, SecurityLog })
//     — Called after password check:
//       success=true  → reset failedAttempts, check for new IP, log
//       success=false → increment failedAttempts, lock if threshold hit, log
//
//  4. isNewIp(user, ip)  [helper]
//     — Returns true if this IP has never been seen for this user
//
//  Usage in routes/authRoutes.js:
//    const { ipRateLimit, checkAccountLock, recordLoginResult, isNewIp }
//      = require("../middleware/loginSecurity");
// ═══════════════════════════════════════════════════════════════

"use strict";

const User        = require("../db/models/User");
const SecurityLog = require("../db/models/SecurityLog");

// ── Config ────────────────────────────────────────────────────
const IP_MAX_ATTEMPTS  = 10;          // per IP per window
const IP_WINDOW_MS     = 10 * 60 * 1000;  // 10 minutes
const ACCOUNT_MAX_FAIL = 5;           // per account
const ACCOUNT_LOCK_MS  = 15 * 60 * 1000; // 15 minutes
const MAX_KNOWN_IPS    = 20;          // cap stored IPs per user

// ── In-memory IP rate limit store ────────────────────────────
// Map<ip, { count, resetAt }>
// Resets automatically — no cron needed.
const _ipStore = new Map();

function _getIpRecord(ip) {
  const now = Date.now();
  let rec = _ipStore.get(ip);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + IP_WINDOW_MS };
    _ipStore.set(ip, rec);
  }
  return rec;
}

// ── 1. IP rate-limit middleware ───────────────────────────────
function ipRateLimit(req, res, next) {
  const ip  = _getClientIp(req);
  const rec = _getIpRecord(ip);
  rec.count++;

  if (rec.count > IP_MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((rec.resetAt - Date.now()) / 1000);

    // Log (fire and forget)
    SecurityLog.log({
      eventType: "login_blocked_ip",
      ipAddress: ip,
      device:    req.headers["user-agent"]?.slice(0, 200) || "Unknown",
      meta:      { attempts: rec.count },
    });

    return res.status(429).json({
      ok:    false,
      error: `Too many login attempts from your network. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
      retryAfterSec,
    });
  }

  next();
}

// ── 2. Account lock check ─────────────────────────────────────
// Call this AFTER finding the user but BEFORE checking password.
// Returns true if blocked (response already sent), false if OK.
function checkAccountLock(user, res) {
  if (!user.lockedUntil) return false;
  if (new Date() < user.lockedUntil) {
    const secsLeft = Math.ceil((user.lockedUntil - Date.now()) / 1000);
    res.status(423).json({
      ok:    false,
      error: `Account is temporarily locked due to too many failed attempts. Try again in ${Math.ceil(secsLeft / 60)} minute(s).`,
      lockedUntilMs: user.lockedUntil.getTime(),
    });
    return true;
  }
  return false;
}

// ── 3. Record login result ────────────────────────────────────
async function recordLoginResult({ success, user, ip, deviceName, req }) {
  if (success) {
    // Reset failure counter
    const isNew = isNewIp(user, ip);

    // Build update: reset counters, add IP to known list
    const update = {
      $set:  { failedLoginAttempts: 0, lockedUntil: null },
      $addToSet: { knownIps: ip },
    };
    // Cap knownIps array size — pull oldest if over limit
    await User.findByIdAndUpdate(user._id, update);
    // Trim if over cap (separate update to keep atomic)
    await User.findByIdAndUpdate(user._id, {
      $push: { knownIps: { $each: [], $slice: -MAX_KNOWN_IPS } },
    });

    if (isNew) {
      SecurityLog.log({ userId: user._id, eventType: "new_device_login", ipAddress: ip, device: deviceName });
      // Send email notification (fire-and-forget)
      _sendNewDeviceEmail(user, ip, deviceName, req).catch(() => {});
    }

    SecurityLog.log({ userId: user._id, eventType: "login_success", ipAddress: ip, device: deviceName });

  } else {
    // Increment failure counter
    const newCount = (user.failedLoginAttempts || 0) + 1;
    let lockUntil  = null;

    if (newCount >= ACCOUNT_MAX_FAIL) {
      lockUntil = new Date(Date.now() + ACCOUNT_LOCK_MS);
      SecurityLog.log({
        userId:    user._id,
        eventType: "account_locked",
        ipAddress: ip,
        device:    deviceName,
        meta:      { attempts: newCount },
      });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: {
        failedLoginAttempts: newCount,
        ...(lockUntil && { lockedUntil: lockUntil }),
      },
    });

    SecurityLog.log({
      userId:    user._id,
      eventType: "login_failure",
      ipAddress: ip,
      device:    deviceName,
      meta:      { attempt: newCount },
    });
  }
}

// ── 4. Is new IP? ─────────────────────────────────────────────
function isNewIp(user, ip) {
  if (!user.knownIps || user.knownIps.length === 0) return true;
  return !user.knownIps.includes(ip);
}

// ── Password strength validator ───────────────────────────────
/**
 * Returns null if strong, or an error string if weak.
 * Rules: 8+ chars, uppercase, number, special char.
 */
function validatePasswordStrength(password) {
  if (!password || password.length < 8)         return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password))                  return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password))                  return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password))           return "Password must contain at least one special character (e.g. @, #, $, !).";
  return null;
}

// ── Internal helpers ──────────────────────────────────────────
function _getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "0.0.0.0";
}

async function _sendNewDeviceEmail(user, ip, deviceName, req) {
  // Only send if nodemailer transport is configured
  const transport = _getMailTransport();
  if (!transport) return;

  const loginTime = new Date().toUTCString();
  await transport.sendMail({
    from:    process.env.MAIL_FROM || "noreply@tranzo.app",
    to:      user.email,
    subject: "New login detected on your Tranzo account",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#059669">⚡ Tran<span>zo</span></h2>
        <h3>New login detected</h3>
        <p>A new login to your Tranzo account was detected from a device or location we don't recognise.</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0">
          <tr><td style="padding:8px;border:1px solid #eee;color:#666">Device</td>
              <td style="padding:8px;border:1px solid #eee">${deviceName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666">IP Address</td>
              <td style="padding:8px;border:1px solid #eee">${ip}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#666">Time</td>
              <td style="padding:8px;border:1px solid #eee">${loginTime}</td></tr>
        </table>
        <p>If this was you, no action is needed.</p>
        <p>If this wasn't you, <a href="${process.env.APP_URL || "http://localhost:3000"}/account/sessions" style="color:#059669">log out all devices immediately</a> and change your password.</p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
        <p style="color:#999;font-size:12px">Tranzo — P2P File Transfer</p>
      </div>
    `,
  });
}

// Lazy-init nodemailer transport (only if SMTP vars are set)
let _transport = undefined;
function _getMailTransport() {
  if (_transport !== undefined) return _transport;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    _transport = null;   // not configured — skip silently
    return null;
  }
  try {
    const nodemailer = require("nodemailer");
    _transport = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } catch {
    _transport = null;
  }
  return _transport;
}

module.exports = { ipRateLimit, checkAccountLock, recordLoginResult, isNewIp, validatePasswordStrength };
