// ═══════════════════════════════════════════════════════════════
//  utils/auth.js  — JWT helpers + device fingerprint utilities
//
//  JWT payload shape:
//    { sub: userId, jti: uuid, iat, exp }
//
//  jti is stored in DeviceSession so we can revoke individual
//  tokens without rotating the JWT secret.
// ═══════════════════════════════════════════════════════════════

"use strict";

const jwt    = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const JWT_SECRET   = process.env.JWT_SECRET || "change_me_in_production_use_long_random_string";
const JWT_EXPIRES  = process.env.JWT_EXPIRES || "30d";   // token lifetime
const BCRYPT_ROUNDS = 12;

// ── JWT ──────────────────────────────────────────────────────

/**
 * Generate a signed JWT for a user.
 * Returns { token, jti } — jti must be stored in DeviceSession.
 */
function signToken(userId) {
  const jti = crypto.randomUUID();   // unique per session
  const token = jwt.sign(
    { sub: userId.toString(), jti },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
  return { token, jti };
}

/**
 * Verify a JWT and return its decoded payload.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// ── Password ─────────────────────────────────────────────────

async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ── Device fingerprinting ────────────────────────────────────

/**
 * Parse a User-Agent string into a human-readable device name
 * and category (desktop / mobile / tablet / bot / unknown).
 *
 * Keeps it dependency-free using simple regex patterns.
 */
function parseDevice(userAgent = "") {
  const ua = userAgent.toLowerCase();

  // Type detection
  let deviceType = "unknown";
  if (/bot|crawler|spider|scraper|facebookexternalhit/i.test(ua)) {
    deviceType = "bot";
  } else if (/ipad|tablet|kindle|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|iemobile/i.test(ua)) {
    deviceType = "mobile";
  } else if (/windows|macintosh|linux|chrome os/i.test(ua)) {
    deviceType = "desktop";
  }

  // OS detection
  let os = "Unknown OS";
  if      (/windows nt 10/i.test(ua))  os = "Windows 10/11";
  else if (/windows nt 6\.3/i.test(ua)) os = "Windows 8.1";
  else if (/windows nt 6\.1/i.test(ua)) os = "Windows 7";
  else if (/windows/i.test(ua))         os = "Windows";
  else if (/iphone os (\d+)/i.test(ua)) os = `iOS ${ua.match(/iphone os (\d+)/i)?.[1]}`;
  else if (/ipad.*os (\d+)/i.test(ua))  os = `iPadOS ${ua.match(/os (\d+)/i)?.[1]}`;
  else if (/android (\d+)/i.test(ua))   os = `Android ${ua.match(/android (\d+)/i)?.[1]}`;
  else if (/mac os x (\d+[_\d]+)/i.test(ua)) os = `macOS ${ua.match(/mac os x ([\d_]+)/i)?.[1]?.replace(/_/g, ".")}`;
  else if (/linux/i.test(ua))           os = "Linux";
  else if (/cros/i.test(ua))            os = "ChromeOS";

  // Browser detection
  let browser = "Unknown Browser";
  if      (/edg\//i.test(ua))        browser = "Edge";
  else if (/opr\//i.test(ua))        browser = "Opera";
  else if (/chrome\/(\d+)/i.test(ua)) browser = `Chrome ${ua.match(/chrome\/(\d+)/i)?.[1]}`;
  else if (/firefox\/(\d+)/i.test(ua)) browser = `Firefox ${ua.match(/firefox\/(\d+)/i)?.[1]}`;
  else if (/safari\/(\d+)/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/msie|trident/i.test(ua))  browser = "Internet Explorer";

  return {
    deviceName: `${browser} on ${os}`,
    deviceType,
  };
}

/**
 * Extract the real client IP from a request,
 * respecting X-Forwarded-For (Nginx/reverse proxy).
 */
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "0.0.0.0";
}

module.exports = { signToken, verifyToken, hashPassword, comparePassword, parseDevice, getClientIp };
