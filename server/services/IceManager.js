// ═══════════════════════════════════════════════════════════════
//  server/services/IceManager.js
//
//  Generates time-limited TURN credentials using the coturn
//  REST API / HMAC-SHA1 method (RFC 8489 §9.2).
//
//  ROOT CAUSE FIX (401 Unauthorized on TURN):
//    Static username/password (.env INDIA_TURN_USER=testuser) only
//    works if that exact user is added to coturn via turnadmin.
//    The standard production approach is time-limited HMAC tokens:
//      username  = "<unix_expiry>:<userId>"
//      password  = base64(HMAC-SHA1(TURN_SECRET, username))
//    coturn verifies the HMAC using the shared secret — no need to
//    manage individual user accounts.
//
//  .env keys used:
//    INDIA_TURN_HOST    — TURN server IP/hostname
//    INDIA_TURN_SECRET  — shared secret (set in turnserver.conf:
//                         use-auth-secret=yes + static-auth-secret=<value>)
//    INDIA_TURN_USER    — fallback static user  (legacy / dev only)
//    INDIA_TURN_PASS    — fallback static pass  (legacy / dev only)
//    TURN_TTL           — credential TTL seconds (default 86400 = 24h)
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');
const config  = require('../config');

const STUN_ONLY = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478'  },
];

class IceManager {
  constructor(redisClient) {
    this.redis  = redisClient;
    this.ttl    = parseInt(process.env.TURN_TTL || '86400', 10);  // 24 h default
  }

  // ── Generate time-limited HMAC credentials ─────────────────────────────────
  // Uses coturn's REST API auth (use-auth-secret in turnserver.conf).
  // These credentials expire after `ttl` seconds and cannot be reused.
  _generateHmacCredentials(host) {
    const secret  = process.env.INDIA_TURN_SECRET;
    if (!secret) return null;   // no secret configured — fall back to static

    const expiry   = Math.floor(Date.now() / 1000) + this.ttl;
    const username = `${expiry}:tranzo`;
    const password = crypto
      .createHmac('sha1', secret)
      .update(username)
      .digest('base64');

    return {
      urls:       [`turn:${host}:3478`, `turn:${host}:3478?transport=tcp`],
      username,
      credential: password,
    };
  }

  // ── Static credentials (legacy / fallback) ─────────────────────────────────
  // Only works if the user is added to coturn via:
  //   turnadmin -a -u <user> -r <realm> -p <pass>
  _staticCredentials(host, user, pass) {
    if (!user || !pass) return null;
    return {
      urls:       [`turn:${host}:3478`, `turn:${host}:3478?transport=tcp`],
      username:   user,
      credential: pass,
    };
  }

  // ── Build iceServers array ─────────────────────────────────────────────────
  async getServers() {
    const host   = process.env.INDIA_TURN_HOST;
    const user   = process.env.INDIA_TURN_USER;
    const pass   = process.env.INDIA_TURN_PASS;
    const secret = process.env.INDIA_TURN_SECRET;

    if (!host) {
      console.warn('[ICE] No TURN host configured — returning STUN only');
      return { iceServers: STUN_ONLY };
    }

    // Prefer HMAC (time-limited) credentials if secret is configured
    const turnEntry = secret
      ? this._generateHmacCredentials(host)
      : this._staticCredentials(host, user, pass);

    if (!turnEntry) {
      console.warn('[ICE] No TURN credentials available — returning STUN only');
      return { iceServers: STUN_ONLY };
    }

    console.log(`[ICE] Serving TURN credentials (${secret ? 'HMAC' : 'static'}) for ${host}`);

    return {
      iceServers: [
        // STUN first — cheap, used for path discovery
        { urls: `stun:${host}:3478` },
        ...STUN_ONLY,
        // TURN last — expensive relay, used only when STUN fails
        turnEntry,
      ],
    };
  }
}

module.exports = IceManager;
