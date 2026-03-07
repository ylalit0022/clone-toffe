// ═══════════════════════════════════════════════
//  ice.js  — ICE / TURN server configuration
// ═══════════════════════════════════════════════

// ── India TURN server credentials ────────────────
const INDIA_TURN_HOST = "share.rumnnlg.com";
const INDIA_TURN_USER = "testuser";
const INDIA_TURN_PASS = "testpass123";

export function buildIceServers() {
  const servers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ];

  if (INDIA_TURN_HOST && INDIA_TURN_USER && INDIA_TURN_PASS) {
    servers.push({
      urls: [
        `turn:${INDIA_TURN_HOST}:3478?transport=udp`,
        `turn:${INDIA_TURN_HOST}:3478?transport=tcp`,
        `turns:${INDIA_TURN_HOST}:5349?transport=tcp`,
      ],
      username: INDIA_TURN_USER,
      credential: INDIA_TURN_PASS,
    });
  }

  // Metered global fallback
  servers.push({
    urls: [
      "turn:global.relay.metered.ca:80?transport=udp",
      "turn:global.relay.metered.ca:80?transport=tcp",
      "turn:global.relay.metered.ca:443?transport=tcp",
      "turns:global.relay.metered.ca:443?transport=tcp",
    ],
    username: "a8d9d73530add1b926be15b7",
    credential: "NgH88GxMUO1f4Knl",
  });

  return servers;
}

export function detectPathType(stats) {
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

  // ── Detect which TURN server is being used ──────────────────────────────
  if (pathType === "turn") {
    const relayUrl = local?.url || remote?.url || "";
    if (relayUrl.includes("share.rumnnlg.com") || relayUrl.includes("128.199.28.210")) {
      window._activeTurnServer = "digitalocean";
    } else {
      window._activeTurnServer = "metered";
    }
  }

  return {
    pathType,
    rttMs:    (pair.currentRoundTripTime   ?? 0) * 1000,
    availBps:  pair.availableOutgoingBitrate ?? 0,
    pair,
  };
}