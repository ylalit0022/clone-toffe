// server/routes/ice.js
// ICE server configuration endpoint

const express = require("express");
const { getClientIp } = require("../middleware/security");

const router = express.Router();

let iceManager;
let rateLimiter;

const STUN_FALLBACK = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ],
};

// ✅ Dependency injection
router.setDependencies = (im, rl) => {
  iceManager = im;
  rateLimiter = rl;
};

// ════════════════════════════════════════════════════════════════
// GET /api/v1/ice/config — Get ICE servers
// ════════════════════════════════════════════════════════════════
router.get("/config", async (req, res, next) => {
  try {
    const ip = getClientIp(req);

    // ✅ Skip rate limit if rateLimiter is not available
    if (rateLimiter) {
      const limit = await rateLimiter.checkGetRoom(ip);
      if (!limit.allowed) {
        return res.status(429).json({ error: "Too many requests" });
      }
    }

    // ✅ Return STUN fallback if iceManager is not ready
    if (!iceManager || typeof iceManager.getServers !== "function") {
      console.warn("[ICE] iceManager unavailable — returning STUN fallback");
      res.set("Cache-Control", "private, max-age=60");
      return res.json(STUN_FALLBACK);
    }

    const result = await iceManager.getServers(ip);
    const iceServers = result?.iceServers ?? STUN_FALLBACK.iceServers;
    const expiresAt = result?.expiresAt ?? null;

    // ✅ Cache for 5 minutes (ICE servers don't change often)
    res.set("Cache-Control", "private, max-age=300");
    res.json({ iceServers, ...(expiresAt && { expiresAt }) });
  } catch (err) {
    console.error("[ICE] Error fetching ICE config:", err);
    // ✅ Never crash — return STUN fallback on any unexpected error
    res.set("Cache-Control", "private, max-age=60");
    res.json(STUN_FALLBACK);
  }
});

module.exports = router;