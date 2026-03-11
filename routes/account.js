// ═══════════════════════════════════════════════════════════════
//  routes/account.js  — /account/* pages
//
//  Mount in server.js:
//    const accountRoutes = require("./routes/account");
//    app.use("/account", accountRoutes);
//
//  Endpoints:
//    GET  /account/sessions          — sessions page (HTML)
//    GET  /account/sessions/api      — sessions JSON (for JS fetch)
//    POST /account/sessions/revoke   — revoke one session by jti
// ═══════════════════════════════════════════════════════════════

"use strict";

const express       = require("express");
const router        = express.Router();
const DeviceSession = require("../db/models/DeviceSession");
const { requireAuth } = require("../middleware/authMiddleware");

// All account routes require auth
router.use(requireAuth);

// ── GET /account/sessions  — HTML page ───────────────────────
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await DeviceSession.getActiveSessions(req.user._id);

    // Annotate which one is "this device"
    const enriched = sessions.map(s => ({
      ...s.toObject(),
      isCurrent: s.jti === req.jti,
    }));

    res.render("pages/account/sessions.njk", {
      user:       req.user,
      sessions:   enriched,
      sessionCount: enriched.length,
    });
  } catch (err) {
    console.error("[Account] Sessions page error:", err.message);
    res.status(500).render("pages/404.njk");
  }
});

// ── GET /account/sessions/api  — JSON for AJAX refresh ───────
router.get("/sessions/api", async (req, res) => {
  try {
    const sessions = await DeviceSession.getActiveSessions(req.user._id);
    const enriched = sessions.map(s => ({
      ...s.toObject(),
      isCurrent: s.jti === req.jti,
    }));
    res.json({ ok: true, sessions: enriched });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── POST /account/sessions/revoke  — revoke one by jti ───────
router.post("/sessions/revoke", async (req, res) => {
  try {
    const { jti } = req.body;
    if (!jti) {
      return res.status(400).json({ ok: false, error: "jti is required." });
    }

    // Security: only allow revoking sessions belonging to the logged-in user
    const session = await DeviceSession.findOne({ jti, userId: req.user._id, isActive: true });
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found or already revoked." });
    }

    await DeviceSession.revokeByJti(jti, "logout");
    return res.json({ ok: true, message: "Session revoked." });

  } catch (err) {
    console.error("[Account] Revoke error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error." });
  }
});

module.exports = router;