// ═══════════════════════════════════════════════════════════════
//  ice.js  — ICE / TURN server configuration
//
//  NOTE: export keywords removed — loaded as plain <script>, not ES module.
//  Functions are globals: initIceConfig(), getIceServers(), buildIceServers(),
//  detectPathType()
// ═══════════════════════════════════════════════════════════════

let _iceServers = null;   // cached after first fetch

// Fallback STUN-only config used if the server is unreachable
// (no TURN = LAN/open-NAT only, but still better than nothing)
const STUN_ONLY_FALLBACK = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

// ── Fetch ice servers from server ────────────────────────────
async function initIceConfig() {
  if (_iceServers) return;   // already fetched

  try {
    const res = await fetch("/api/ice-config", { credentials: "same-origin" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data.iceServers) && data.iceServers.length > 0) {
      _iceServers = data.iceServers;
      console.log("[ICE] Config loaded from server —", _iceServers.length, "servers");
    } else {
      throw new Error("Empty iceServers array");
    }
  } catch (e) {
    console.warn("[ICE] Failed to fetch /api/ice-config — using STUN-only fallback:", e.message);
    _iceServers = STUN_ONLY_FALLBACK;
  }
}

// Returns the cached list (or fallback if initIceConfig was never called)
function getIceServers() {
  if (!_iceServers) {
    console.warn("[ICE] getIceServers() called before initIceConfig() — using STUN-only fallback");
    return STUN_ONLY_FALLBACK;
  }
  return _iceServers;
}

// ── Kept for backward compat — peer.js calls buildIceServers() ───────────
function buildIceServers() {
  return getIceServers();
}

// ── Path detection (unchanged) ────────────────────────────────
function detectPathType(stats) {
  let pair = null;
  stats.forEach(r => {
    if (r.type === "transport" && r.selectedCandidatePairId)
      pair = stats.get(r.selectedCandidatePairId);
  });
  if (!pair) return { pathType: "unknown", rttMs: 0, availBps: 0 };

  const local  = stats.get(pair.localCandidateId);
  const remote = stats.get(pair.remoteCandidateId);
  const lt = local?.candidateType  ?? "";
  const rt = remote?.candidateType ?? "";

  let pathType;
  if (lt === "host" && rt === "host")        pathType = "lan";
  else if (lt === "relay" || rt === "relay") pathType = "turn";
  else                                        pathType = "wan";

  if (pathType === "turn") {
    const relayUrl = local?.url || remote?.url || "";
    window._activeTurnServer = (relayUrl.includes("share.rumnnlg.com") || relayUrl.includes("128.199.28.210"))
      ? "digitalocean"
      : "metered";
  }

  return {
    pathType,
    rttMs:    (pair.currentRoundTripTime   ?? 0) * 1000,
    availBps:  pair.availableOutgoingBitrate ?? 0,
    pair,
  };
}