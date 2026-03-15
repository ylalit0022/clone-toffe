// ═══════════════════════════════════════════════════════════════
//  security.js  —  WebRTC Signaling Server Security Module
//
//  Rate limiters (HTTP, connection, join, signal) have been
//  removed. They caused multi-file transfer stalls by blocking
//  rapid WebRTC signaling (offer/answer/ICE) that occurs during
//  normal multi-file queue operation.
//
//  What remains:
//    • Room ID format validation (allowJoin)
//    • TURN credential TTL + token gating (optional)
//    • IP extraction helper
//    • Structured security logger
//
//  USAGE IN server.js:
//
//    const security = require("./security");
//
//    // Room join validation (format check only, no rate limit):
//    socket.on("join-room", ({ roomId, deviceName: name }) => {
//      if (!security.allowJoin(socket, roomId)) return;
//      // ... existing join logic
//    });
//
//    // ICE config (token gating optional):
//    app.get("/api/ice-config",
//      security.iceConfigMiddleware, iceConfigHandler);
//
// ═══════════════════════════════════════════════════════════════

"use strict";

const CFG = {
  ROOM_ID_MIN:   parseInt(process.env.SEC_ROOM_ID_MIN) || 6,
  ROOM_ID_MAX:   parseInt(process.env.SEC_ROOM_ID_MAX) || 32,
  ROOM_ID_REGEX: /^[a-zA-Z0-9_-]+$/,
  TURN_TTL_MS:   parseInt(process.env.SEC_TURN_TTL_MS) || 600_000,
  TRUST_PROXY:   process.env.SEC_TRUST_PROXY === "true" || false,
};

// ── Logger ────────────────────────────────────────────────────
const EventType = Object.freeze({
  INVALID_ROOM_ID: "INVALID_ROOM_ID",
  ROOM_FULL:       "ROOM_FULL",
  TURN_ISSUED:     "TURN_ISSUED",
  TURN_EXPIRED:    "TURN_EXPIRED",
  TURN_REJECTED:   "TURN_REJECTED",
});

function secLog(eventType, ip, details) {
  const ts          = new Date().toISOString();
  const safeIp      = String(ip || "unknown").slice(0, 45);
  const safeDetails = typeof details === "object"
    ? JSON.stringify(details)
    : String(details || "");
  console.warn(`[SEC] ${ts}  ${safeIp}  ${eventType}  ${safeDetails}`);
}

// ── IP extraction ─────────────────────────────────────────────
function getIp(reqOrSocket) {
  let raw = "";
  if (CFG.TRUST_PROXY) {
    const xfwd =
      (reqOrSocket.headers?.["x-forwarded-for"]) ||
      (reqOrSocket.handshake?.headers?.["x-forwarded-for"]) || "";
    if (xfwd) raw = xfwd.split(",")[0].trim();
  }
  if (!raw) {
    raw =
      reqOrSocket.ip ||
      reqOrSocket.remoteAddress ||
      reqOrSocket.handshake?.address ||
      "";
  }
  return raw.replace(/^::ffff:/, "");
}

// ── Room join guard (format validation only, no rate limit) ───
function allowJoin(socket, roomId) {
  const ip = getIp(socket);

  if (!roomId || typeof roomId !== "string") {
    secLog(EventType.INVALID_ROOM_ID, ip, { roomId, reason: "missing" });
    socket.emit("join-error", { code: "INVALID_ROOM_ID", message: "Invalid room ID." });
    return false;
  }

  const trimmed = roomId.trim();

  if (trimmed.length < CFG.ROOM_ID_MIN || trimmed.length > CFG.ROOM_ID_MAX) {
    secLog(EventType.INVALID_ROOM_ID, ip, { roomId: trimmed, reason: "length", len: trimmed.length });
    socket.emit("join-error", {
      code:    "INVALID_ROOM_ID",
      message: `Room ID must be ${CFG.ROOM_ID_MIN}–${CFG.ROOM_ID_MAX} characters (letters, numbers, - and _ only).`,
    });
    return false;
  }

  if (!CFG.ROOM_ID_REGEX.test(trimmed)) {
    secLog(EventType.INVALID_ROOM_ID, ip, { roomId: trimmed, reason: "chars" });
    socket.emit("join-error", {
      code:    "INVALID_ROOM_ID",
      message: "Room ID may only contain letters, numbers, hyphens and underscores.",
    });
    return false;
  }

  return true;
}

// ── TURN credential guard (optional) ─────────────────────────
const _turnTokens = new Map();

const _turnPruneInterval = setInterval(() => {
  const now = Date.now();
  for (const [token, data] of _turnTokens) {
    if (now >= data.expiresAt) {
      _turnTokens.delete(token);
      secLog(EventType.TURN_EXPIRED, data.ip, { token: token.slice(0, 8) + "…" });
    }
  }
}, 120_000);
if (_turnPruneInterval.unref) _turnPruneInterval.unref();

function generateTurnToken(ip, socketId) {
  const token     = _randomHex(24);
  const expiresAt = Date.now() + CFG.TURN_TTL_MS;
  _turnTokens.set(token, { ip, socketId, expiresAt });
  secLog(EventType.TURN_ISSUED, ip, { token: token.slice(0, 8) + "…", socketId, expiresAt: new Date(expiresAt).toISOString() });
  return token;
}

function validateTurnToken(token, ip) {
  if (!token) return false;
  const data = _turnTokens.get(token);
  if (!data) return false;
  const now = Date.now();
  if (now >= data.expiresAt) {
    _turnTokens.delete(token);
    secLog(EventType.TURN_EXPIRED, ip, { reason: "validated-expired" });
    return false;
  }
  if (data.ip !== ip) {
    secLog(EventType.TURN_REJECTED, ip, { reason: "ip_mismatch", issuedTo: data.ip });
    return false;
  }
  return true;
}

function iceConfigMiddleware(req, res, next) {
  const ip    = getIp(req);
  const token = req.query.token;
  if (token) {
    if (!validateTurnToken(token, ip)) {
      secLog(EventType.TURN_REJECTED, ip, { reason: "invalid_token" });
      return res.status(403).json({ error: "Invalid or expired session token.", message: "Please reload the page and try again." });
    }
    _turnTokens.delete(token); // single-use
  }
  next();
}

// ── Utility ───────────────────────────────────────────────────
function _randomHex(bytes) {
  const arr = new Uint8Array(bytes);
  try { require("crypto").randomFillSync(arr); }
  catch { for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256); }
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

module.exports = {
  allowJoin,
  iceConfigMiddleware,
  generateTurnToken,
  validateTurnToken,
  getIp,
  secLog,
  EventType,
  CFG,
};