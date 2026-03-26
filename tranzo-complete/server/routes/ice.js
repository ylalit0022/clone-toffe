// server/routes/ice.js
// ICE server configuration endpoint

const express = require("express");
const { getClientIp } = require("../middleware/security");

const router = express.Router();

let iceManager;
let rateLimiter;

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

    // ✅ Rate limit: 100 per minute per IP
    const limit = await rateLimiter.checkGetRoom(ip);
    if (!limit.allowed) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const { iceServers, expiresAt } = await iceManager.getServers(ip);

    // ✅ Cache for 5 minutes (ICE servers don't change often)
    res.set("Cache-Control", "private, max-age=300");
    res.json({ iceServers, expiresAt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
