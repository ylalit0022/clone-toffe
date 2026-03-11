// ═══════════════════════════════════════════════════════════════
//  routes/authRoutes.js  — Auth endpoints with full security
//
//  GET  /auth/login           — login page
//  GET  /auth/register        — register page
//  POST /auth/register        — create account (strong password enforced)
//  POST /auth/login           — login (rate limit + lockout + new-device email)
//  POST /auth/logout          — revoke current session
//  POST /auth/logout-all      — revoke all sessions
//  POST /auth/change-password — update password, invalidate other sessions
//  GET  /logout               — convenience redirect (for navbar link)
// ═══════════════════════════════════════════════════════════════

"use strict";

const express       = require("express");
const router        = express.Router();
const User          = require("../db/models/User");
const DeviceSession = require("../db/models/DeviceSession");
const SecurityLog   = require("../db/models/SecurityLog");
const { signToken, hashPassword, comparePassword, parseDevice, getClientIp }
  = require("../utils/authHelpers");
const { requireAuth }
  = require("../middleware/authMiddleware");
const { ipRateLimit, checkAccountLock, recordLoginResult, validatePasswordStrength }
  = require("../middleware/loginSecurity");

// ── Cookie config ─────────────────────────────────────────────
const COOKIE_NAME = "tranzo_token";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure:   process.env.NODE_ENV === "production",
  maxAge:   30 * 24 * 60 * 60 * 1000,   // 30 days
};

function setAuthCookie(res, token) { res.cookie(COOKIE_NAME, token, COOKIE_OPTS); }
function clearAuthCookie(res)      { res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax" }); }

// ── Build device session after auth ──────────────────────────
async function createDeviceSession(req, userId, jti) {
  const ua = req.headers["user-agent"] || "";
  const { deviceName, deviceType } = parseDevice(ua);
  return DeviceSession.createSession({
    userId, deviceName, deviceType,
    ipAddress: getClientIp(req),
    userAgent: ua.slice(0, 512),
    jti,
  });
}

// ═══════════════════════════════════════════════════════════════
//  PAGES
// ═══════════════════════════════════════════════════════════════

router.get("/login", (req, res) => {
  res.render("pages/auth/login.njk", {
    error:   req.query.error   || null,
    success: req.query.success || null,
    next:    req.query.next    || "/",
  });
});

router.get("/register", (req, res) => {
  res.render("pages/auth/register.njk", { error: req.query.error || null });
});

// ═══════════════════════════════════════════════════════════════
//  POST /auth/register
// ═══════════════════════════════════════════════════════════════
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const ip         = getClientIp(req);
    const ua         = req.headers["user-agent"] || "";
    const { deviceName } = parseDevice(ua);

    if (!email || !password)
      return res.status(400).json({ ok: false, error: "Email and password are required." });

    // ── Strong password check ─────────────────────────────
    const pwError = validatePasswordStrength(password);
    if (pwError) return res.status(400).json({ ok: false, error: pwError });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ ok: false, error: "An account with this email already exists." });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email:        email.toLowerCase().trim(),
      name:         (name || "").trim() || email.split("@")[0],
      passwordHash,
      onlineStatus: "online",
      knownIps:     [ip],
    });

    const { token, jti } = signToken(user._id);
    await createDeviceSession(req, user._id, jti);
    setAuthCookie(res, token);

    SecurityLog.log({ userId: user._id, eventType: "register", ipAddress: ip, device: deviceName });

    return res.status(201).json({ ok: true, message: "Account created.", redirect: "/" });

  } catch (err) {
    console.error("[Auth] Register error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error. Please try again." });
  }
});

// ═══════════════════════════════════════════════════════════════
//  POST /auth/login   (with rate-limit middleware)
// ═══════════════════════════════════════════════════════════════
router.post("/login", ipRateLimit, async (req, res) => {
  const ip             = getClientIp(req);
  const ua             = req.headers["user-agent"] || "";
  const { deviceName } = parseDevice(ua);

  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ ok: false, error: "Email and password are required." });

    // Load user WITH knownIps and passwordHash (both select:false fields)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select("+passwordHash +knownIps");

    // User not found — generic message (don't reveal account existence)
    if (!user || !user.passwordHash) {
      SecurityLog.log({ eventType: "login_failure", ipAddress: ip, device: deviceName, meta: { email } });
      return res.status(401).json({ ok: false, error: "Invalid email or password." });
    }

    // ── Account lock check ────────────────────────────────
    if (checkAccountLock(user, res)) {
      SecurityLog.log({ userId: user._id, eventType: "login_blocked_account", ipAddress: ip, device: deviceName });
      return;
    }

    // ── Password check ────────────────────────────────────
    const valid = await comparePassword(password, user.passwordHash);

    await recordLoginResult({ success: valid, user, ip, deviceName, req });

    if (!valid) {
      const attemptsLeft = Math.max(0, 5 - (user.failedLoginAttempts + 1));
      const msg = attemptsLeft > 0
        ? `Invalid email or password. ${attemptsLeft} attempt(s) remaining before lockout.`
        : "Invalid email or password. Account is now temporarily locked for 15 minutes.";
      return res.status(401).json({ ok: false, error: msg });
    }

    // ── Success ───────────────────────────────────────────
    await User.findByIdAndUpdate(user._id, { onlineStatus: "online" });

    const { token, jti } = signToken(user._id);
    await createDeviceSession(req, user._id, jti);
    setAuthCookie(res, token);

    return res.json({ ok: true, message: "Login successful.", redirect: req.body.next || "/" });

  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error. Please try again." });
  }
});

// ═══════════════════════════════════════════════════════════════
//  POST /auth/logout
// ═══════════════════════════════════════════════════════════════
router.post("/logout", requireAuth, async (req, res) => {
  try {
    await DeviceSession.revokeByJti(req.jti, "logout");
    clearAuthCookie(res);

    SecurityLog.log({
      userId:    req.user._id,
      eventType: "logout",
      ipAddress: getClientIp(req),
      device:    parseDevice(req.headers["user-agent"] || "").deviceName,
    });

    return res.json({ ok: true, redirect: "/auth/login?success=logged_out" });
  } catch (err) {
    console.error("[Auth] Logout error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error." });
  }
});

// ── GET /logout — navbar-friendly logout link ──────────────────
// Accepts GET so a plain <a href="/logout"> works in the UI.
router.get("/logout", requireAuth, async (req, res) => {
  try {
    await DeviceSession.revokeByJti(req.jti, "logout");
    clearAuthCookie(res);
    SecurityLog.log({
      userId:    req.user._id,
      eventType: "logout",
      ipAddress: getClientIp(req),
      device:    parseDevice(req.headers["user-agent"] || "").deviceName,
    });
  } catch { /* ignore */ }
  return res.redirect("/auth/login?success=logged_out");
});

// ═══════════════════════════════════════════════════════════════
//  POST /auth/logout-all
// ═══════════════════════════════════════════════════════════════
router.post("/logout-all", requireAuth, async (req, res) => {
  try {
    await DeviceSession.revokeAll(req.user._id, "logout_all");
    clearAuthCookie(res);

    SecurityLog.log({
      userId:    req.user._id,
      eventType: "logout_all",
      ipAddress: getClientIp(req),
      device:    parseDevice(req.headers["user-agent"] || "").deviceName,
    });

    return res.json({ ok: true, redirect: "/auth/login?success=logged_out_all" });
  } catch (err) {
    console.error("[Auth] Logout-all error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error." });
  }
});

// ═══════════════════════════════════════════════════════════════
//  POST /auth/change-password
// ═══════════════════════════════════════════════════════════════
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const ip             = getClientIp(req);
    const { deviceName } = parseDevice(req.headers["user-agent"] || "");

    if (!currentPassword || !newPassword)
      return res.status(400).json({ ok: false, error: "Both current and new password are required." });

    // ── Strong password check ─────────────────────────────
    const pwError = validatePasswordStrength(newPassword);
    if (pwError) return res.status(400).json({ ok: false, error: pwError });

    const user = await User.findOne({ email: req.user.email }).select("+passwordHash");
    if (!user?.passwordHash)
      return res.status(400).json({ ok: false, error: "No password set on this account." });

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid)
      return res.status(401).json({ ok: false, error: "Current password is incorrect." });

    const newHash = await hashPassword(newPassword);
    await User.findByIdAndUpdate(req.user._id, {
      passwordHash:      newHash,
      passwordChangedAt: new Date(),
    });

    // Revoke all OTHER sessions — current stays valid
    await DeviceSession.revokeAllExcept(req.user._id, req.jti, "password_change");

    SecurityLog.log({ userId: req.user._id, eventType: "password_change", ipAddress: ip, device: deviceName });

    return res.json({ ok: true, message: "Password changed. Other devices have been logged out." });

  } catch (err) {
    console.error("[Auth] Change-password error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error." });
  }
});

module.exports = router;