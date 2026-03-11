// ═══════════════════════════════════════════════════════════════
//  middleware/auth.js  — JWT authentication middleware
//
//  Usage:
//    const { requireAuth, optionalAuth } = require("./middleware/auth");
//
//    // Protect a route — sends 401 if unauthenticated
//    app.get("/account/sessions", requireAuth, handler);
//
//    // Attach user if logged in, continue regardless
//    app.get("/", optionalAuth, handler);
//
//  Sets on req:
//    req.user          — User document (populated)
//    req.session       — DeviceSession document
//    req.jti           — jti from JWT payload
// ═══════════════════════════════════════════════════════════════

"use strict";

const { verifyToken } = require("../utils/authHelpers");
const User            = require("../db/models/User");
const DeviceSession   = require("../db/models/DeviceSession");

/**
 * Extract token from:
 *  1. Authorization: Bearer <token>   (API / fetch clients)
 *  2. Cookie: tranzo_token=<token>    (browser session)
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies?.tranzo_token || null;
}

/**
 * Core verification logic.
 * Returns { user, session, jti } or null.
 */
async function _verify(req) {
  const token = extractToken(req);
  if (!token) return null;

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return null;   // expired or tampered
  }

  const { sub: userId, jti } = payload;

  // Check session is still active in DB
  const session = await DeviceSession.findOne({ jti, isActive: true });
  if (!session) return null;

  // Check user still exists
  const user = await User.findById(userId);
  if (!user) return null;

  // Check password hasn't changed after token was issued
  // (payload.iat is in seconds, passwordChangedAt is a Date)
  if (user.passwordChangedAt) {
    const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (payload.iat < changedAtSec) return null;
  }

  // Throttled touch — update lastActiveAt (at most once per 2 min)
  DeviceSession.touch(jti).catch(() => {});

  return { user, session, jti };
}

/**
 * requireAuth — rejects unauthenticated requests.
 * HTML requests get a redirect to /auth/login.
 * JSON requests get a 401 JSON error.
 */
async function requireAuth(req, res, next) {
  const result = await _verify(req).catch(() => null);
  if (!result) {
    const wantsJson = req.headers.accept?.includes("application/json") ||
                      req.headers["content-type"]?.includes("application/json");
    if (wantsJson) {
      return res.status(401).json({ ok: false, error: "Unauthorized. Please log in." });
    }
    return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl)}`);
  }
  req.user    = result.user;
  req.session = result.session;
  req.jti     = result.jti;
  next();
}

/**
 * optionalAuth — attaches user/session if token is valid, never rejects.
 * Useful for pages that render differently when logged in.
 */
async function optionalAuth(req, res, next) {
  const result = await _verify(req).catch(() => null);
  if (result) {
    req.user    = result.user;
    req.session = result.session;
    req.jti     = result.jti;
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
