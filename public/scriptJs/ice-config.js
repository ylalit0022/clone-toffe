// ─── ice-config.js ───────────────────────────────────────────────────────────
// Extracted from script.js (lines 99–158)
// Handles TURN/STUN config fetch, caching, and RTC config generation.
// No external dependencies — safe to import first.
// ─────────────────────────────────────────────────────────────────────────────

// ── State (module-private) ────────────────────────────────────────────────────
let _iceServers       = null;
let _iceConfigPromise = null; // single shared promise — prevents race on parallel callers

// ── STUN-only fallback (used until /api/ice-config resolves) ──────────────────
export const STUN_ONLY = [
  { urls: "stun:stun.l.google.com:19302"  },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

// ── initIceConfig ─────────────────────────────────────────────────────────────
// Returns a single shared Promise — safe to call many times; one HTTP request.
export function initIceConfig() {
  if (_iceConfigPromise) return _iceConfigPromise;
  _iceConfigPromise = (async () => {
    if (_iceServers) return;
    try {
      const res = await fetch("/api/ice-config", { credentials: "same-origin" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.iceServers) && data.iceServers.length > 0) {
        _iceServers = data.iceServers;
        console.log("[ICE] Config loaded —", _iceServers.length, "servers");
      } else throw new Error("Empty iceServers array");
    } catch (e) {
      console.warn("[ICE] Fetch failed — STUN-only fallback:", e.message);
      _iceServers = STUN_ONLY;
    }
  })();
  return _iceConfigPromise;
}

// ── getIceServers ─────────────────────────────────────────────────────────────
// Synchronous accessor — returns latest fetched servers or STUN_ONLY.
export function getIceServers() {
  return _iceServers || STUN_ONLY;
}

// ── buildIceServers ───────────────────────────────────────────────────────────
// Legacy alias — kept for modules that call buildIceServers() directly.
export function buildIceServers() {
  return getIceServers();
}

// ── getRtcConfig ──────────────────────────────────────────────────────────────
// Returns a fresh config object each call so every new RTCPeerConnection
// picks up the latest ice servers.
export function getRtcConfig() {
  return {
    iceServers:          getIceServers(),
    iceTransportPolicy:  "all",
    bundlePolicy:        "max-bundle",
    rtcpMuxPolicy:       "require",
    iceCandidatePoolSize: 4,
  };
}

// ── RTC_CONFIG ────────────────────────────────────────────────────────────────
// Legacy object — any code referencing RTC_CONFIG.iceServers still works.
export const RTC_CONFIG = {
  get iceServers()        { return getIceServers(); },
  iceTransportPolicy:     "all",
  bundlePolicy:           "max-bundle",
  rtcpMuxPolicy:          "require",
  iceCandidatePoolSize:   4,
};

// ── Kick off pre-fetch immediately on module load (non-blocking) ──────────────
initIceConfig();
