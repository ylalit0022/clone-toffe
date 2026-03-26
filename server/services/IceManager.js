// server/services/IceManager.js
// Manages ICE servers and TURN credentials

const crypto = require("crypto");

class IceManager {
  constructor(redis) {
    this.redis = redis;
  }

  // ✅ Get ICE servers with TURN credentials
  async getServers(clientIp, config = {}) {
    const stun = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" },
    ];

    const iceServers = [...stun];

    // Add India TURN
    const turnHost = process.env.INDIA_TURN_HOST || "";
    const turnUser = process.env.INDIA_TURN_USER || "";
    const turnPass = process.env.INDIA_TURN_PASS || "";

    if (turnHost && turnUser && turnPass) {
      iceServers.push({
        urls: [
          `turn:${turnHost}:3478?transport=udp`,
          `turn:${turnHost}:3478?transport=tcp`,
          `turns:${turnHost}:5349?transport=tcp`,
        ],
        username: turnUser,
        credential: turnPass,
      });
    }

    // Add Metered TURN
    const meteredUser = process.env.METERED_USER || "";
    const meteredPass = process.env.METERED_PASS || "";

    if (meteredUser && meteredPass) {
      iceServers.push({
        urls: [
          "turn:global.relay.metered.ca:80?transport=udp",
          "turn:global.relay.metered.ca:80?transport=tcp",
          "turn:global.relay.metered.ca:443?transport=tcp",
          "turns:global.relay.metered.ca:443?transport=tcp",
        ],
        username: meteredUser,
        credential: meteredPass,
      });
    }

    return { iceServers, expiresAt: new Date(Date.now() + 3600000) };
  }

  // ✅ Generate single-use TURN token (optional)
  async generateTurnToken(clientIp, deviceId) {
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await this.redis.setEx(
      `turn-token:${token}`,
      600,
      JSON.stringify({ clientIp, deviceId, expiresAt })
    );

    return { token, expiresAt: new Date(expiresAt) };
  }

  // ✅ Validate TURN token
  async validateTurnToken(token, clientIp) {
    const data = await this.redis.get(`turn-token:${token}`);
    if (!data) return false;

    const { clientIp: issuedIp, expiresAt } = JSON.parse(data);

    if (clientIp !== issuedIp) {
      console.warn(`⚠ TURN token IP mismatch: ${clientIp} vs ${issuedIp}`);
      return false;
    }

    if (Date.now() > expiresAt) {
      await this.redis.del(`turn-token:${token}`);
      return false;
    }

    return true;
  }
}

module.exports = IceManager;
