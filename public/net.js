// ═══════════════════════════════════════════════════════════════
//  net.js  — Adaptive network profile
//
//  Computes: chunkSize, pipelineDepth, highWaterMark, lowWaterMark
//  based on current path type (lan/wan/turn) and RTT.
// ═══════════════════════════════════════════════════════════════

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Current profile — read by transfer.js
export const NET = {
  pathType:       "unknown",
  rttMs:          0,
  availBps:       0,
  chunkSize:      256 * 1024,
  highWaterMark:  8   * 1024 * 1024,
  lowWaterMark:   256 * 1024,
  pipelineDepth:  8,
  // Slow-TURN detection state
  _slowSamples:   [],
  slowReduced:    false,
  _lastProfileKey: "",
};

export function applyProfile({ pathType, rttMs, availBps } = {}) {
  if (pathType !== undefined) NET.pathType = pathType;
  if (rttMs    !== undefined) NET.rttMs    = rttMs;
  if (availBps !== undefined) NET.availBps = availBps;

  const { pathType: pt, rttMs: rtt, availBps: bps } = NET;

  // Chunk size
  if (pt === "lan") {
    NET.chunkSize = rtt < 5 ? 1024 * 1024 : 512 * 1024;
  } else if (pt === "wan") {
    NET.chunkSize = 256 * 1024;
  } else if (pt === "turn") {
    // TURN speed improvement:
    // - Default 128KB chunks (was 128KB — keep for compatibility)
    // - slowReduced drops to 32KB (was 64KB) to recover from severe congestion
    // - highRtt (>200ms) stays at 64KB to avoid buffer bloat
    if (NET.slowReduced)        NET.chunkSize = 32 * 1024;   // severe slow path
    else if (rtt > 200)        NET.chunkSize = 64 * 1024;   // high-latency TURN
    else                       NET.chunkSize = 128 * 1024;  // normal TURN
  } else {
    NET.chunkSize = 256 * 1024;   // unknown — conservative
  }
  if (IS_MOBILE) NET.chunkSize = Math.min(NET.chunkSize, 128 * 1024);

  // Pipeline depth from bandwidth-delay product, or RTT tiers
  let depth;
  if (bps > 0 && rtt > 0) {
    depth = Math.round(((bps / 8) * (rtt / 1000)) / NET.chunkSize);
  } else {
    if (rtt < 5)        depth = 8;
    else if (rtt < 30)  depth = 12;
    else if (rtt < 100) depth = 16;
    // High RTT (>100ms) = TURN relay — use smaller pipeline to avoid congestion
    else if (rtt < 200) depth = IS_MOBILE ? 10 : 20;
    else                depth = IS_MOBILE ?  6 : 12;  // very high latency
  }
  NET.pipelineDepth = Math.max(4, Math.min(32, depth));

  // Buffer marks
  NET.highWaterMark = Math.min(8 * 1024 * 1024, NET.chunkSize * 32);
  NET.lowWaterMark  = NET.chunkSize * 4;

  const _pk = `${NET.pathType}|${NET.chunkSize}|${NET.pipelineDepth}`;
  if (NET._lastProfileKey !== _pk) {
    NET._lastProfileKey = _pk;
    console.log("[NET] profile", {
      path:  NET.pathType,
      chunk: `${(NET.chunkSize  / 1024).toFixed(0)}KB`,
      depth: NET.pipelineDepth,
      hwm:   `${(NET.highWaterMark / 1024 / 1024).toFixed(2)}MB`,
    });
  }
}

// Call once after ICE connects, passing pc.getStats() result
export async function detectAndApply(pc) {
  if (!pc) return;
  try {
    const stats = await pc.getStats();
    const { pathType, rttMs, availBps } = (await import("./ice.js")).detectPathType(stats);
    // Only reset slow-TURN samples when path type actually changes.
    // On reconnect within the same path, preserve accumulated samples so
    // slow-TURN detection still fires without needing 3 new samples.
    if (pathType !== NET.pathType) {
      NET._slowSamples = [];
      NET.slowReduced  = false;
    }
    applyProfile({ pathType, rttMs, availBps });
  } catch(e) { console.warn("[NET] detectAndApply error:", e); }
}

// Record one throughput sample; returns true if slow-TURN reduction fired
const SLOW_THRESHOLD = 256 * 1024;   // 256 KB/s — trigger reduction earlier on slow TURN
const SLOW_SAMPLES   = 3;

export function recordThroughputSample(bps) {
  if (NET.pathType !== "turn" || NET.slowReduced) return false;
  NET._slowSamples.push(bps);
  if (NET._slowSamples.length > SLOW_SAMPLES) NET._slowSamples.shift();
  if (NET._slowSamples.length === SLOW_SAMPLES && NET._slowSamples.every(s => s < SLOW_THRESHOLD)) {
    console.warn("[NET] Slow TURN detected — reducing to 64KB chunks");
    NET.slowReduced = true;
    applyProfile({});   // recompute with slowReduced = true
    return true;
  }
  return false;
}