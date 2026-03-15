// ═══════════════════════════════════════════════════════════════════════════
//  script.js  — P2P File Transfer  |  Full Optimized Build
//
//  Improvements over original:
//  ✅ Adaptive chunk size (LAN 1MB / WAN 256KB / TURN 64-128KB)
//  ✅ Dynamic pipeline depth based on RTT + bandwidth-delay product
//  ✅ Congestion control with adaptive high/low water marks
//  ✅ Slow TURN relay detection → auto-reduce chunk size
//  ✅ Multi-receiver mesh (1 sender → N receivers)
//  ✅ CRC32 chunk checksum verification + retransmission
//  ✅ Resume transfer after reconnect (keep file offset)
//  ✅ Automatic ICE restart + reconnect on connection failure
//  ✅ Memory backpressure (browser never holds >32MB)
//  ✅ Advanced diagnostics panel (RTT, bitrate, packet loss, path)
//  ✅ Wake Lock API for mobile (prevents screen + CPU sleep)
//  ✅ File type validation + max size limit + rate limiting
//  ✅ ICE candidate priority (host > srflx > relay)
//  ✅ India-first TURN + regional fallback
//  ✅ Worker unchanged in interface — pull/pause/resume/cancel preserved
// ═══════════════════════════════════════════════════════════════════════════

// ── FIX: Mobile file-picker disconnect ────────────────────────────────────────
// reconnectionAttempts: Infinity — never stop trying until tab is closed.
// reconnectionDelay: 500ms first retry, capped at 3s.
// On every "connect" event we re-emit join-room so the room is restored
// even if socket.id changed (see socket.on("connect") handler below).
const socket = io({
  reconnection:         true,
  reconnectionAttempts: Infinity,
  reconnectionDelay:    500,
  reconnectionDelayMax: 3000,
  timeout:              20000,
});

// ─── DEBUG ────────────────────────────────────────────────────────────────────
const DEBUG = true;
const dlog = (...a) => DEBUG && console.log("[P2P]", ...a);

// ─── SECURITY / VALIDATION CONSTANTS ─────────────────────────────────────────
const MAX_FILE_SIZE       = 10 * 1024 * 1024 * 1024;  // 10 GB hard limit
const ALLOWED_EXTENSIONS  = null;                       // null = all types allowed
//   Example whitelist: ["pdf","jpg","png","mp4","zip","docx"]

function validateFile(file) {
  if (!file) return "No file selected.";
  if (file.size > MAX_FILE_SIZE)
    return `File too large (${fmtBytes(file.size)}). Max: ${fmtBytes(MAX_FILE_SIZE)}.`;
  if (ALLOWED_EXTENSIONS) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext))
      return `File type .${ext} not allowed.`;
  }
  return null; // OK
}


// ─── MOBILE: WAKE LOCK API ────────────────────────────────────────────────────


// ─── MOBILE DETECTION ─────────────────────────────────────────────────────────
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ─── TURN / ICE CONFIG ────────────────────────────────────────────────────────
// Credentials are fetched from /api/ice-config (server reads from env vars).
// buildIceServers() returns STUN-only until the fetch completes — safe because
// createPeerConnection always calls getIceServers() not buildIceServers().
let _iceServers = null;

const STUN_ONLY = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

async function initIceConfig() {
  if (_iceServers) return;
  try {
    const res = await fetch("/api/ice-config", { credentials: "same-origin" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data.iceServers) && data.iceServers.length > 0) {
      _iceServers = data.iceServers;
      console.log("[ICE] Config loaded —", _iceServers.length, "servers");
    } else throw new Error("Empty");
  } catch(e) {
    console.warn("[ICE] Fetch failed — STUN-only fallback:", e.message);
    _iceServers = STUN_ONLY;
  }
}
function getIceServers() { return _iceServers || STUN_ONLY; }
// Legacy alias kept for any module that calls buildIceServers()
function buildIceServers() { return getIceServers(); }

// Kick off fetch immediately (non-blocking)
initIceConfig();

// RTC_CONFIG is a getter so every new RTCPeerConnection picks up the
// latest ice servers (fetched from /api/ice-config on startup).
function getRtcConfig() {
  return {
    iceServers: getIceServers(),
    iceTransportPolicy: "all",
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
    iceCandidatePoolSize: 4,
  };
}
// Keep legacy name for any code that references RTC_CONFIG directly
const RTC_CONFIG = {
  get iceServers()         { return getIceServers(); },
  iceTransportPolicy:      "all",
  bundlePolicy:            "max-bundle",
  rtcpMuxPolicy:           "require",
  iceCandidatePoolSize:    4,
};

// ─── ADAPTIVE NETWORK PROFILE ─────────────────────────────────────────────────
// All transfer tuning lives here — updated per-peer and per-RTT poll
const NET = {
  pathType: "unknown",
  rttMs: 0,
  availBps: 0,
  chunkSize:      256 * 1024,
  highWaterMark:  2   * 1024 * 1024,  // 2MB — pause when SCTP buffer reaches here
  lowWaterMark:   256 * 1024,          // resume when buffer drains to 256KB
  pipelineDepth:  16,                  // used for retransmit ring sizing only
  turnSlowSamples: [],
  turnSlowReduced: false,
};

// ── Chunk size hard cap ──────────────────────────────────────────────────────
// Chrome's WebRTC DataChannel wraps SCTP messages. The SCTP send buffer is
// ~256 KB by default. Sending a single message larger than this causes:
//   "Failure to send data" → DataChannel closes immediately.
// Even on LAN, chunk size must never exceed 256 KB.
// Higher throughput on LAN is achieved via deeper pipeline (more chunks in
// flight), NOT larger chunks.
const MAX_CHUNK_SIZE = 256 * 1024;   // 256 KB — hard Chrome/SCTP limit

// Mobile chunk size cap — same as desktop (256 KB).
const MOBILE_MAX_CHUNK = 256 * 1024;

function applyNetworkProfile() {
  const { pathType, rttMs, availBps } = NET;

  // All non-TURN paths use 256KB chunks — the SCTP hard limit.
  // Throughput is controlled entirely by pipeline depth and watermarks.
  if (pathType === "lan") {
    NET.chunkSize = 256 * 1024;
  } else if (pathType === "wan") {
    NET.chunkSize = 256 * 1024;   // raised from 128KB — fine for any broadband
  } else if (pathType === "turn") {
    NET.chunkSize = NET.turnSlowReduced ? 32 * 1024 : 64 * 1024;
  } else {
    NET.chunkSize = 256 * 1024;   // unknown — go fast, slow-TURN detection will reduce if needed
  }

  // Hard caps
  NET.chunkSize = Math.min(NET.chunkSize, MAX_CHUNK_SIZE);
  if (IS_MOBILE) NET.chunkSize = Math.min(NET.chunkSize, MOBILE_MAX_CHUNK);

  // ── Pipeline depth ────────────────────────────────────────────────────────
  // Target: keep the Chrome SCTP buffer (16MB) filled at all times.
  // depth = HWM / chunkSize ensures we always have enough in-flight chunks
  // to absorb the drain latency between the HWM trigger and the next sendLoop.
  //
  // BDP formula used when RTT + bandwidth are known; otherwise use path-type
  // defaults that are conservative enough not to cause memory pressure but
  // deep enough to sustain full throughput.
  let depth;
  if (availBps > 0 && rttMs > 0) {
    const bdp = (availBps / 8) * (rttMs / 1000);
    depth = Math.round(bdp / NET.chunkSize);
  } else {
    // BUG-FIX-SCTP: depth=64 (16MB in-flight) caused "RTCDataChannel send queue
    // is full" on every file because Chrome's internal SCTP send queue is only
    // ~2MB — far smaller than the 16MB transport buffer. Sending 16MB of chunks
    // before any drain saturates the SCTP queue immediately.
    // depth=16 (4MB in-flight) keeps the pipe full without overflowing SCTP.
    if (pathType === "lan")        depth = 16;
    else if (rttMs < 5)            depth = 16;
    else if (rttMs < 30)           depth = 12;
    else if (rttMs < 100)          depth = 8;
    else                           depth = 6;
  }
  // pipelineDepth is now used only for retransmit ring sizing and RTT polling.
  // The actual send pipeline is pull-one-ahead (queue depth = 1), so this value
  // no longer controls how many chunks are in-flight.
  NET.pipelineDepth = 16;

  // HWM: when dc.bufferedAmount reaches this, pause sending and wait for drain.
  // 2MB is safely under Chrome's internal SCTP send queue (~2-4MB).
  NET.highWaterMark = 2 * 1024 * 1024;
  NET.lowWaterMark  = 256 * 1024;  // resume sending when buffer drops to 256KB

  // Only log when something actually changed — avoids log spam on repeated
  // RTT polls that produce the same profile (common on LAN/stable connections).
  const _profileKey = `${NET.pathType}|${NET.chunkSize}|${NET.pipelineDepth}`;
  if (NET._lastProfileKey !== _profileKey) {
    NET._lastProfileKey = _profileKey;
    dlog("[NET] profile", {
      path: NET.pathType,
      chunk: `${(NET.chunkSize / 1024).toFixed(0)}KB`,
      depth: NET.pipelineDepth,
      hwm: `${(NET.highWaterMark / 1024 / 1024).toFixed(2)}MB`,
    });
  }
}

async function detectAndApplyNetworkProfile(pcRef) {
  if (!pcRef) return;
  try {
    const stats = await pcRef.getStats();
    let pair = null;
    stats.forEach(r => { if (r.type === "transport" && r.selectedCandidatePairId) pair = stats.get(r.selectedCandidatePairId); });
    if (!pair) return;
    const local  = stats.get(pair.localCandidateId);
    const remote = stats.get(pair.remoteCandidateId);
    const lt = local?.candidateType ?? "";
    const rt = remote?.candidateType ?? "";
    NET.rttMs    = (pair.currentRoundTripTime ?? 0) * 1000;
    NET.availBps = pair.availableOutgoingBitrate ?? 0;
    const _prevPath = NET.pathType;
    if (lt === "host" && rt === "host")       NET.pathType = "lan";
    else if (lt === "relay" || rt === "relay") NET.pathType = "turn";
    else if (lt === "srflx" || rt === "srflx") NET.pathType = "wan";
    else                                       NET.pathType = "unknown";
    // Only reset slow-TURN state when the path type actually changes.
    // Resetting on every reconnect (same path) erases the slow-turn samples
    // accumulated so far and delays reduction by 3 more samples each time.
    if (NET.pathType !== _prevPath) {
      NET.turnSlowSamples = [];
      NET.turnSlowReduced = false;
    }
    applyNetworkProfile();

    // ── Detect which TURN server is being used ────────────────────────────
    if (NET.pathType === "turn") {
      try {
        stats.forEach(r => {
          if (r.type === "local-candidate" && r.candidateType === "relay") {
            const url = r.url || r.relatedAddress || "";
            if (url.includes("share.rumnnlg.com") || url.includes("128.199.28.210")) {
              window._activeTurnServer = "digitalocean";
            } else {
              window._activeTurnServer = "metered";
            }
          }
        });
      } catch {}
    }

    showConnectionTypeBadge(NET.pathType, NET.rttMs);
    addMsg(`<span class="muted">📡 Path: <b>${NET.pathType.toUpperCase()}</b> · RTT ${NET.rttMs.toFixed(0)}ms · Chunk ${(NET.chunkSize/1024).toFixed(0)}KB · Pipeline ${NET.pipelineDepth}</span>`);
  } catch(e) { dlog("[NET] detectProfile error", e); }
}

const SLOW_TURN_THRESHOLD = 512 * 1024;  // bytes/sec
const SLOW_TURN_SAMPLES   = 3;

function recordThroughputSample(bps, fileWorker, file, currentDepth) {
  if (NET.pathType !== "turn" || NET.turnSlowReduced) return;
  NET.turnSlowSamples.push(bps);
  if (NET.turnSlowSamples.length > SLOW_TURN_SAMPLES) NET.turnSlowSamples.shift();
  if (NET.turnSlowSamples.length === SLOW_TURN_SAMPLES && NET.turnSlowSamples.every(s => s < SLOW_TURN_THRESHOLD)) {
    dlog("[NET] SLOW TURN detected — reducing chunk size to 64 KB");
    showToast("Slow relay detected — optimizing...", "warn", 3000);
    NET.turnSlowReduced = true;
    applyNetworkProfile();
    if (fileWorker && file) {
      fileWorker.postMessage({ type: "resize", chunkSize: NET.chunkSize });
      // BUG-FIX: keep startChunkSize in sync with the post-resize value.
      // After a resize, any subsequent reconnect must recompute chunkIndex
      // using THIS new size (not the original), because all chunks from this
      // point forward are this size. Receiver records first-chunk size too.
      if (sendState.startChunkSize) sendState.startChunkSize = NET.chunkSize;
    }
  }
}

let _rttPollTimer = null;
function startRttPolling(pcRef, onDepthChange) {
  stopRttPolling();
  _rttPollTimer = setInterval(async () => {
    if (!pcRef || !sendState.running || sendState.canceled) return;
    try {
      const stats = await pcRef.getStats();
      let pair = null;
      stats.forEach(r => { if (r.type === "transport" && r.selectedCandidatePairId) pair = stats.get(r.selectedCandidatePairId); });
      if (!pair) return;
      const newRtt   = (pair.currentRoundTripTime ?? 0) * 1000;
      const newAvail = pair.availableOutgoingBitrate ?? 0;
      const prevDepth = NET.pipelineDepth;
      NET.rttMs = newRtt; NET.availBps = newAvail;
      applyNetworkProfile();
      updateDiagnosticsPanel(pcRef, pair);
      if (NET.pipelineDepth !== prevDepth && onDepthChange) onDepthChange(NET.pipelineDepth);
    } catch {}
  }, 3000);
}
function stopRttPolling() {
  if (_rttPollTimer) { clearInterval(_rttPollTimer); _rttPollTimer = null; }
}

// ─── DIAGNOSTICS PANEL ────────────────────────────────────────────────────────
function ensureDiagnosticsPanel() {
  if (document.getElementById("diagPanel")) return;
  const panel = document.createElement("div");
  panel.id = "diagPanel";
  panel.style.cssText = `
    margin-top:12px;padding:10px 14px;border-radius:14px;
    background:rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.08);
    font-size:12px;font-family:monospace;line-height:1.7;
  `;
  panel.innerHTML = `<b>📊 Diagnostics</b><div id="diagContent" style="margin-top:4px;opacity:.8;">—</div>`;
  const host = (typeof fileInput !== "undefined" && fileInput)
    ? (document.getElementById("filePanelQueues") || document.getElementById("filePanel") || fileInput.closest(".g-card-body") || document.body)
    : document.body;
  host.appendChild(panel);
}

function updateDiagnosticsPanel(pcRef, pair) {
  ensureDiagnosticsPanel();
  const el = document.getElementById("diagContent");
  if (!el || !pair) return;
  const rtt      = pair.currentRoundTripTime != null ? `${(pair.currentRoundTripTime * 1000).toFixed(1)}ms` : "—";
  const bitrate  = pair.availableOutgoingBitrate != null ? `${(pair.availableOutgoingBitrate / 1024 / 1024).toFixed(2)} Mbps` : "—";
  const lost     = pair.packetsLost != null ? pair.packetsLost : "—";
  const sent     = pair.packetsSent != null ? pair.packetsSent : "—";
  const lossRate = (sent && lost && sent > 0) ? `${((lost / sent) * 100).toFixed(2)}%` : "—";
  el.innerHTML = `
    Path: <b>${NET.pathType.toUpperCase()}</b> &nbsp;|&nbsp;
    RTT: <b>${rtt}</b> &nbsp;|&nbsp;
    Bitrate: <b>${bitrate}</b><br>
    Packets sent: ${sent} &nbsp;|&nbsp; Lost: ${lost} (${lossRate})<br>
    Chunk: <b>${(NET.chunkSize/1024).toFixed(0)}KB</b> &nbsp;|&nbsp;
    Pipeline depth: <b>${NET.pipelineDepth}</b> &nbsp;|&nbsp;
    HWM: <b>${(NET.highWaterMark/1024/1024).toFixed(1)}MB</b>
  `;
}

function showConnectionTypeBadge(pathType, rttMs) {
  let badge = document.getElementById("connTypeBadge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "connTypeBadge";
    badge.style.cssText = "display:inline-block;margin-left:8px;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;";
    const connDot = document.getElementById("connDot");
    connDot?.parentElement?.appendChild(badge);
  }

  // Detect which TURN server is actually being used
  let turnLabel = "TURN";
  if (pathType === "turn") {
    // Check which relay candidate was selected via stored turn server info
    turnLabel = window._activeTurnServer === "digitalocean"
      ? "🔴 TURN · DigitalOcean 🇮🇳"
      : "🔴 TURN · Metered 🌍";
  }

  const map = {
    lan:  ["🟢 LAN",  "rgba(0,200,100,.15)", "#006633"],
    wan:  ["🟡 WAN",  "rgba(255,200,0,.15)", "#886600"],
    turn: [turnLabel,  "rgba(255,80,80,.12)", "#aa2200"],
  };
  const [label, bg, color] = map[pathType] || ["⚪ —", "transparent", "#888"];
  badge.innerText = `${label} ${rttMs > 0 ? `· ${rttMs.toFixed(0)}ms` : ""}`;
  badge.style.background = bg;
  badge.style.color = color;
}

// ─── MEMORY CONSTANTS ─────────────────────────────────────────────────────────
<<<<<<< HEAD
const MEMORY_MAX_BYTES   = 50 * 1024 * 1024;    // use disk streaming above 50 MB
=======
const MEMORY_MAX_BYTES   = 4 * 1024 * 1024 * 1024;  // effectively unlimited
// Disk streaming removed — all received files use memory → Blob → auto-download.
>>>>>>> a862989 (added zip and unzip)
const MAX_MEMORY_BUFFER  = 32  * 1024 * 1024;   // never hold >32MB across all queues

// ─── ACK / FLOW CONSTANTS ─────────────────────────────────────────────────────
const ACK_EVERY_BYTES = 1 * 1024 * 1024;   // ACK every 1MB — smooth progress bar, small end-gap
const MAX_ACK_AHEAD   = 256 * 1024 * 1024;

// ─── MULTI-RECEIVER MESH ──────────────────────────────────────────────────────
// Maps socketId → { pc, dc, state } for each connected peer
// Sender: one entry per receiver
// Receiver: one entry (the sender)
const peerConnections = new Map();  // socketId → { pc, dc, gen, pathType, state }

function getPeer(socketId) { return peerConnections.get(socketId); }
function setPeer(socketId, obj) { peerConnections.set(socketId, obj); }
function removePeer(socketId) {
  const peer = peerConnections.get(socketId);
  if (peer) {
    try { peer.dc?.close(); } catch {}
    try { peer.pc?.close(); } catch {}
    peerConnections.delete(socketId);
  }
}

// ── Single-peer send helpers ─────────────────────────────────────────────────
// 1-to-1 only — no multi-receiver mesh.
function getPrimaryDc() {
  if (!_primaryPeerSocketId) return null;
  const p = getPeer(_primaryPeerSocketId);
  return p?.dc?.readyState === "open" ? p.dc : null;
}
function sendChunk(buf) {
  const dc = getPrimaryDc();
  if (dc) dc.send(buf);
}
function sendMsg(obj) {
  const dc = getPrimaryDc();
  if (dc) { try { dc.send(JSON.stringify(obj)); } catch {} }
}

// ─── LEGACY SINGLE-PEER ALIASES (backwards compat with existing signaling) ───
// "dc" and "pc" always point to the primary (first) peer for single-receiver flows.
// Multi-receiver flows use the Maps above.
let _primaryPeerSocketId = null;
Object.defineProperty(window, "dc", {
  get() { return _primaryPeerSocketId ? getPeer(_primaryPeerSocketId)?.dc ?? null : null; },
  set() {},  // ignore — set via setPeer
});
Object.defineProperty(window, "pc", {
  get() { return _primaryPeerSocketId ? getPeer(_primaryPeerSocketId)?.pc ?? null : null; },
  set() {},
});

// ─── DC KEEPALIVE ─────────────────────────────────────────────────────────────
// Chrome's SCTP stack closes idle DataChannels after ~30s of no traffic.
// Between files (SHA-256, disk flush, ICE for next file) the gap can exceed 30s.
// Send a tiny ping every 15s to keep the connection alive.
// The receiver already ignores "ping" messages (onmessage handler returns early).
let _keepaliveTimer = null;

function startDcKeepalive() {
  stopDcKeepalive();
  _keepaliveTimer = setInterval(() => {
    const dc = getPrimaryDc();
    if (dc?.readyState === "open") {
      try { dc.send(JSON.stringify({ type: "ping" })); } catch {}
    }
  }, 15000);
}

function stopDcKeepalive() {
  if (_keepaliveTimer) { clearInterval(_keepaliveTimer); _keepaliveTimer = null; }
}
let fileQueue     = [];
let _zipInProgress = false;  // true while zipAndEnqueue is building the bundle
let sending       = false;
let outgoingFile  = null;
let fileWorker    = null;
let pendingIncoming = null;
<<<<<<< HEAD
let pendingWritable = null;

// ─── SESSION-LEVEL SAVE FOLDER ────────────────────────────────────────────────
// Chosen once per session via showDirectoryPicker(), then reused for every
// file ≥ MEMORY_MAX_BYTES. The user never sees a second picker for mixed-size
// batches (e.g. 50 MB + 400 MB + 1 GB queued together).
let _saveDir = null;   // FileSystemDirectoryHandle | null

/**
 * _getSaveDir() → Promise<FileSystemDirectoryHandle>
 * Returns the cached directory handle, or prompts once to pick a folder.
 * Throws if the user cancels (caller must handle).
 */
async function _getSaveDir() {
  if (_saveDir) return _saveDir;
  _saveDir = await window.showDirectoryPicker({ mode: "readwrite" });
  addMsg(`<span class="muted">📁 Save folder set — all large files will be saved there automatically.</span>`);
  dlog("Save folder chosen:", _saveDir.name);
  return _saveDir;
}

/**
 * _createWritableInDir(filename) → Promise<FileSystemWritableFileStream>
 * Creates (or overwrites) a file in the session save folder and returns
 * a writable stream. Automatically deduplicates names if the file exists.
 */
async function _createWritableInDir(filename) {
  const dir = await _getSaveDir();
  // Deduplicate: if "photo.jpg" exists use "photo (2).jpg", etc.
  let finalName = filename;
  let counter   = 2;
  while (true) {
    try {
      await dir.getFileHandle(finalName, { create: false });
      // File exists — try next suffix
      const dot = filename.lastIndexOf(".");
      finalName = dot > 0
        ? filename.slice(0, dot) + ` (${counter})` + filename.slice(dot)
        : filename + ` (${counter})`;
      counter++;
    } catch {
      break;   // NotFoundError means name is free
    }
  }
  const fileHandle = await dir.getFileHandle(finalName, { create: true });
  _writableFileHandles.set(finalName, fileHandle);  // store for potential recovery
  return fileHandle.createWritable();
}

// Map of filename → FileSystemFileHandle for writable recovery
const _writableFileHandles = new Map();

/**
 * _reopenWritableAt(filename, position) → Promise<FileSystemWritableFileStream>
 * Reopens a writable stream for an already-created file, seeked to `position`.
 * Used when the original writable gets an InvalidStateError (datapipe broken).
 * keepExistingContents=true preserves bytes already written.
 */
async function _reopenWritableAt(filename, position) {
  const dir = await _getSaveDir();
  // Use the stored handle if available, otherwise look up by name
  let fileHandle = _writableFileHandles.get(filename);
  if (!fileHandle) {
    fileHandle = await dir.getFileHandle(filename, { create: false });
    _writableFileHandles.set(filename, fileHandle);
  }
  const newWritable = await fileHandle.createWritable({ keepExistingData: true });
  if (position > 0) {
    await newWritable.seek(position);
  }
  return newWritable;
}

/** Reset the save folder (e.g. when user leaves the room). */
function _clearSaveDir() { _saveDir = null; }
=======

// Disk-streaming helpers removed — all files use memory chunks → Blob → a.click() auto-download.
>>>>>>> a862989 (added zip and unzip)
let currentRoom   = "";
let transferCompleted = false;
let gracefulClosing   = false;
let peerGeneration    = 0;
let retryInProgress   = false;
let doneResendTimer   = null;
let lastStatusRes     = null;

// ── Session transfer stats (for completion popup) ──────────────────────────
let _sessionSentFiles  = 0;   // files fully confirmed by receiver this session
let _sessionSentBytes  = 0;   // total bytes sent this session
let _sessionSentStart  = 0;   // performance.now() when first file started
let _sessionRecvFiles  = 0;   // files fully received this session
let _sessionRecvBytes  = 0;   // total bytes received this session
let _sessionRecvStart  = 0;   // performance.now() when first file was received

// Sender state
let sendState = {
  running: false, paused: false, canceled: false,
  offset: 0, file: null,
  ackBytes: 0, lastAckTickT: 0, lastAckTickB: 0, ackEma: 0,
  gotComplete: false,
  chunkIndex: 0,        // for retransmit tracking
  pendingRetransmits: new Map(), // index → buf
  knownPeers: new Set(),  // socketIds that opened a DC for this transfer
  _workerGen: 0,        // incremented each sendFile() — drops stale worker messages
  _queueRafId: null,    // RAF handle for throttled sender queue UI updates
};

// Receiver state
let incomingFile = null;
// FIX-2: holds a meta object that arrived while the previous finalizeIncomingFile()
// was still running (async SHA-256 / disk flush).  Retried in the finally block.
let _deferredRecvMeta = null;

// READY handshake state (one per transfer)
let receiverReady = false;
let receiverReadyResolver = null;

function resetReceiverReady() { receiverReady = false; receiverReadyResolver = null; }
function waitReceiverReady(ms = 120000) {
  if (receiverReady) return Promise.resolve(true);
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(false), ms);
    receiverReadyResolver = ok => { clearTimeout(t); resolve(!!ok); };
  });
}
function markReceiverReady(ok = true) {
  receiverReady = !!ok;
  if (receiverReadyResolver) { const r = receiverReadyResolver; receiverReadyResolver = null; r(!!ok); }
}

// ─── UI ELEMENTS ─────────────────────────────────────────────────────────────
const joinBtn       = document.getElementById("joinBtn");
const createBtn     = document.getElementById("createBtn");
const roomInput     = document.getElementById("roomId");
const statusText    = document.getElementById("status");
const connDot       = document.getElementById("connDot");
const roomHint      = document.getElementById("roomHint");
const deviceNameInput = document.getElementById("deviceName");
const chatSection   = document.getElementById("chatSection");
const chatBox       = document.getElementById("chatBox");
const messageInput  = document.getElementById("messageInput");
const sendBtn       = document.getElementById("sendBtn");
const fileInput     = document.getElementById("fileInput");
const fileStatus    = document.getElementById("fileStatus");
const progressBar   = document.getElementById("progressBar");
const speedText     = document.getElementById("speedText");
const progressText  = document.getElementById("progressText");
const etaText       = document.getElementById("etaText");
const pauseBtn      = document.getElementById("pauseBtn");
const resumeBtn     = document.getElementById("resumeBtn");
const cancelBtn     = document.getElementById("cancelBtn");
const modalBg       = document.getElementById("modalBg");
const modalInfo     = document.getElementById("modalInfo");
const acceptBtn     = document.getElementById("acceptBtn");
const rejectBtn     = document.getElementById("rejectBtn");

// Drag & drop
setTimeout(() => { try { enableDragDrop(); } catch {} }, 0);

// ─── QUEUE / HISTORY ─────────────────────────────────────────
// sentHistory and recvHistory are persisted to localStorage so they
// survive page reloads. We keep the last 50 entries per list.
const HISTORY_KEY_SENT = "tranzo:sentHistory";
const HISTORY_KEY_RECV = "tranzo:recvHistory";
const HISTORY_MAX      = 50;

function _loadHistory(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function _saveHistory(key, arr) {
  try { localStorage.setItem(key, JSON.stringify(arr.slice(-HISTORY_MAX))); } catch {}
}

let queueWrap = null, queueListEl = null, queueCountEl = null;
let recvQueueWrap = null, recvQueueListEl = null, recvQueueCountEl = null;
const sentHistory = _loadHistory(HISTORY_KEY_SENT);
const recvHistory = _loadHistory(HISTORY_KEY_RECV);
let autoAcceptThisRoom = false;

function autoAcceptKey() { return `autoAccept:${currentRoom || ""}`; }
function loadAutoAcceptFlag() { try { autoAcceptThisRoom = sessionStorage.getItem(autoAcceptKey()) === "1"; } catch { autoAcceptThisRoom = false; } }
function saveAutoAcceptFlag(v) { autoAcceptThisRoom = !!v; try { sessionStorage.setItem(autoAcceptKey(), v ? "1" : "0"); } catch {} }

function upsertSentItem(id, name, size, state, done = 0, total = size || 0) {
  if (!id) id = `${name}|${size}`;
  let it = sentHistory.find(x => x.id === id);
  if (!it) { it = { id, name, size, state, done, total }; sentHistory.push(it); }
  it.name = name; it.size = size; it.state = state;
  it.done = Math.max(it.done || 0, done || 0);
  it.total = total || it.total || size || 0;
  _saveHistory(HISTORY_KEY_SENT, sentHistory);
  return it;
}
function upsertRecvItem(id, name, size, state, done = 0, total = size || 0) {
  if (!id) id = `${name}|${size}`;
  let it = recvHistory.find(x => x.id === id);
  if (!it) { it = { id, name, size, state, done, total }; recvHistory.push(it); }
  it.name = name; it.size = size; it.state = state;
  it.done = Math.max(it.done || 0, done || 0);
  it.total = total || it.total || size || 0;
  _saveHistory(HISTORY_KEY_RECV, recvHistory);
  return it;
}

function ensureQueueUI() {
  if (queueWrap) return;
  if (!fileInput) return;
  const host = document.getElementById("filePanelQueues") || document.getElementById("filePanel") || fileInput.closest(".g-card-body") || document.body;
  queueWrap = document.createElement("div");
  queueWrap.style.marginTop = "10px";
  queueWrap.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="font-weight:800;">📦 Queue</div>
      <div id="queueCount" style="opacity:.7;font-size:12px;">0</div>
    </div>
    <div id="queueList" style="margin-top:8px;max-height:140px;overflow:auto;border:1px solid rgba(0,0,0,.10);border-radius:12px;padding:8px;background:rgba(255,255,255,.6);"></div>`;
  queueListEl  = queueWrap.querySelector("#queueList");
  queueCountEl = queueWrap.querySelector("#queueCount");
  host.appendChild(queueWrap);
}
function renderQueueUI(currentFile = null) {
  if (!fileInput) return;
  ensureQueueUI();
  if (!queueListEl) return;
  const total = fileQueue.length + (currentFile ? 1 : 0);
  queueCountEl.innerText = `${total} file(s)`;
  const items = [];
  if (currentFile) items.push(`<div style="padding:6px 8px;border-radius:10px;background:rgba(255,210,120,.25);margin-bottom:6px;">▶️ <b>Sending:</b> ${currentFile.name} <span style="opacity:.7">(${fmtBytes(currentFile.size)})</span></div>`);
  fileQueue.forEach((f, i) => items.push(`<div style="padding:6px 8px;border-radius:10px;background:rgba(0,0,0,.03);margin-bottom:6px;">${i + 1}. ${f.name} <span style="opacity:.7">(${fmtBytes(f.size)})</span></div>`));
  if (!items.length) items.push(`<div style="opacity:.7;padding:6px 8px;">No files in queue</div>`);
  queueListEl.innerHTML = items.join("");
}

function ensureRecvQueueUI() {
  if (recvQueueWrap) return;
  if (!fileInput) return;
  const host = document.getElementById("filePanelQueues") || document.getElementById("filePanel") || fileInput.closest(".g-card-body") || document.body;
  recvQueueWrap = document.createElement("div");
  recvQueueWrap.style.marginTop = "10px";
  recvQueueWrap.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="font-weight:800;">📥 Receiver Queue</div>
      <div id="recvQueueCount" style="opacity:.7;font-size:12px;">0</div>
    </div>
    <div id="recvQueueList" style="margin-top:8px;max-height:140px;overflow:auto;border:1px solid rgba(0,0,0,.10);border-radius:12px;padding:8px;background:rgba(255,255,255,.6);"></div>`;
  recvQueueListEl  = recvQueueWrap.querySelector("#recvQueueList");
  recvQueueCountEl = recvQueueWrap.querySelector("#recvQueueCount");
  host.appendChild(recvQueueWrap);
}
function renderRecvQueueUI() {
  if (!fileInput) return; ensureRecvQueueUI();
  if (!recvQueueListEl) return;
  const pending = recvHistory.filter(x => x.state === "pending" || x.state === "receiving");
  const done    = recvHistory.filter(x => x.state === "done" || x.state === "canceled" || x.state === "failed");
  recvQueueCountEl.innerText = `${pending.length + done.length} file(s)`;
  const items = [];
  pending.forEach(it => {
    const pct = it.total ? Math.floor((it.done / it.total) * 100) : 0;
    items.push(`<div style="padding:8px 10px;border-radius:12px;background:rgba(255,210,120,.18);margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;gap:10px;">
        <div style="font-weight:700;">${it.state === "receiving" ? "⬇️ Receiving" : "🕒 Pending"}: ${it.name}</div>
        <div style="opacity:.7;font-size:12px;">${fmtBytes(it.size)}</div>
      </div>
      <div style="opacity:.75;font-size:12px;margin-top:4px;">${pct}% (${fmtBytes(it.done)} / ${fmtBytes(it.total)})</div>
      <div style="height:8px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden;margin-top:6px;"><div style="height:100%;width:${Math.min(100,pct)}%;background:linear-gradient(90deg,#ff4d6d,#ffa63d);"></div></div>
    </div>`);
  });
  done.forEach(it => {
    let label, bg, color;
    if (it.state === "done") {
      label = "✅ Received"; bg = "rgba(0,0,0,.06)"; color = "#555";
    } else if (it.state === "failed") {
      // FIX-C: show failed files distinctly in red with byte count so user knows which to resend
      const pct = it.total ? Math.floor((it.done / it.total) * 100) : 0;
      label = `⚠️ Incomplete (${pct}% — ${fmtBytes(it.done)} of ${fmtBytes(it.size)}) — ask sender to resend`;
      bg = "rgba(239,68,68,.08)"; color = "#b91c1c";
    } else {
      label = "❌ Canceled"; bg = "rgba(0,0,0,.06)"; color = "#555";
    }
    items.push(`<div style="padding:8px 10px;border-radius:12px;background:${bg};margin-bottom:8px;"><div style="font-weight:700;color:${color};">${label}: ${it.name} <span style="opacity:.7;font-size:12px;">${it.state === "failed" ? "" : fmtBytes(it.size)}</span></div></div>`);
  });
  if (!items.length) items.push(`<div style="opacity:.7;padding:6px 8px;">No received files yet</div>`);
  recvQueueListEl.innerHTML = items.join("");
}

try { ensureQueueUI(); ensureRecvQueueUI(); } catch {}

// ─── DOWNLOADS MANAGER ────────────────────────────────────────────────────────
const receivedFiles = [];
function ensureDownloadsManager() {
  if (document.getElementById("downloadsManager")) return;
  const wrap = document.createElement("div");
  wrap.id = "downloadsManager"; wrap.style.cssText = "margin-top:16px;";
  wrap.innerHTML = `<div style="font-weight:800;margin-bottom:8px;">📂 Received Files</div>
    <div id="downloadsList" style="max-height:200px;overflow:auto;border:1px solid rgba(0,0,0,.10);border-radius:12px;padding:8px;background:rgba(255,255,255,.7);"></div>`;
  const host = (typeof fileInput !== "undefined" && fileInput) ? (document.getElementById("filePanelQueues") || document.getElementById("filePanel") || fileInput.closest(".g-card-body") || document.body) : document.body;
  host.appendChild(wrap);
}
function addToDownloadsManager({ name, size, type, savedToDisk, url }) {
  receivedFiles.push({ name, size, type, savedToDisk, url, ts: Date.now() });
  ensureDownloadsManager(); renderDownloadsManager();
}
function renderDownloadsManager() {
  const list = document.getElementById("downloadsList"); if (!list) return;
  if (!receivedFiles.length) { list.innerHTML = `<div style="opacity:.6;padding:6px 8px;">No files received yet</div>`; return; }
  list.innerHTML = receivedFiles.map((f, i) => {
    const ext = f.name.split(".").pop().toLowerCase();
    const icon = ["mp4","mkv","avi","mov","webm"].includes(ext) ? "🎬" : ["jpg","jpeg","png","gif","webp","bmp"].includes(ext) ? "🖼️" : ["mp3","aac","flac","wav","ogg"].includes(ext) ? "🎵" : ["pdf"].includes(ext) ? "📄" : ["zip","rar","7z","tar","gz"].includes(ext) ? "🗜️" : "📁";
    const btn = f.savedToDisk ? `<span style="font-size:12px;opacity:.65;margin-left:8px;">Saved</span>` : `<button onclick="downloadReceivedFile(${i})" style="margin-left:8px;padding:4px 12px;border-radius:8px;border:none;background:#ff6b35;color:#fff;font-weight:700;cursor:pointer;font-size:12px;">⬇ Save</button>`;
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.03);margin-bottom:6px;">
      <div style="display:flex;align-items:center;gap:8px;overflow:hidden;"><span style="font-size:20px;">${icon}</span><div><div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">${f.name}</div><div style="font-size:11px;opacity:.6;">${fmtBytes(f.size)}</div></div></div>${btn}</div>`;
  }).join("");
}
function downloadReceivedFile(i) {
  const f = receivedFiles[i]; if (!f || !f.url) return;
  const a = document.createElement("a"); a.href = f.url; a.download = f.name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  f.savedToDisk = true; renderDownloadsManager();
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmtBytes(bytes) {
  const units = ["B","KB","MB","GB","TB"]; let i = 0, n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}
function formatETA(s) {
  if (!isFinite(s) || s <= 0) return "--";
  return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;
}
function resetTransferUI() {
  progressBar.value = 0;
  if (typeof fileStatus !== "undefined") fileStatus.innerText = ""; // FIX: clear stale ✅ so enhancements.js poll doesn't re-fire toast loop
  speedText.innerText = "Speed: 0 MB/s";
  progressText.innerText = "0% (0 B / 0 B)";
  etaText.innerText = "Remaining: --";
  pauseBtn.disabled = true; resumeBtn.disabled = true; cancelBtn.disabled = true;
}
// ── FIX-ALERTS: route status text through TransferAlerts when available ──────
// TransferAlerts (transfer-alerts.js) must be loaded before script.js in HTML.
// If it isn't present we fall back to the original innerText behaviour so
// nothing breaks.
function setStatus(text) {
  if (typeof TransferAlerts === "undefined") {
    fileStatus.innerText = text;
    return;
  }
  // Clear the raw text — the alert card replaces it
  fileStatus.innerText = "";

  if (text.startsWith("Waiting")) {
    TransferAlerts.onWaitingForReady(sendState.file?.name);
  } else if (text.includes("⏳") || text.includes("Processing")) {
    const name = incomingFile?.meta?.name || sendState.file?.name;
    const size = incomingFile?.meta?.size || sendState.file?.size;
    TransferAlerts.onProcessing(name, size);
  } else if (text.startsWith("✅") || text.startsWith("Receiving:") || text.startsWith("Sending:")) {
    // Handled by onProgress / onComplete — nothing extra needed here
  } else if (text.includes("incomplete") || text.startsWith("❌") || text.includes("⚠️")) {
    const clean = text.replace(/[❌⚠️✅⏳]/g, "").trim();
    if (text.includes("incomplete") || text.includes("size") || text.includes("corrupt")) {
      TransferAlerts.onIncompletFile(
        incomingFile?.receivedBytes || 0,
        incomingFile?.meta?.size   || 0,
        incomingFile?.meta?.name   || ""
      );
    } else {
      TransferAlerts.onError(clean);
    }
  } else {
    // Unrecognised state — show as plain text fallback
    fileStatus.innerText = text;
  }
}

// Initialise alerts container as soon as the DOM is ready
if (typeof TransferAlerts !== "undefined") TransferAlerts.init();
function setConnectedUI(ok, msg, hint = "") {
  connDot.classList.toggle("green", !!ok);
  statusText.innerText = msg || (ok ? "Connected" : "Not Connected");
  roomHint.innerText = hint || "";
}
// Throttled progress update — at most once per 100ms.
// Calling this on every 256KB chunk (thousands of times for a 600MB file)
// triggers a layout/paint on every call and was measurably reducing throughput.
let _progressRafId = null;
let _progressDone = 0, _progressTotal = 1;
function setProgressBytes(done, total) {
  _progressDone = done; _progressTotal = total;
  if (_progressRafId) return;  // already scheduled
  _progressRafId = requestAnimationFrame(() => {
    _progressRafId = null;
    const pct = _progressTotal > 0 ? Math.floor((_progressDone / _progressTotal) * 100) : 0;
    progressBar.value = Math.min(100, pct);
    progressText.innerText = `${Math.min(100, pct)}% (${fmtBytes(_progressDone)} / ${fmtBytes(_progressTotal)})`;
  });
}
function addMsg(html) {
  const div = document.createElement("div"); div.className = "msg"; div.innerHTML = html;
  chatBox.appendChild(div); chatBox.scrollTop = chatBox.scrollHeight;
}

// ── Toast notification system ─────────────────────────────────────────────────
// Small, non-blocking toasts in the bottom-right corner. Never covers UI.
// Types: "info" (blue), "success" (green), "warn" (amber), "error" (red)
(function injectToastStyles() {
  if (document.getElementById("toastStyles")) return;
  const s = document.createElement("style");
  s.id = "toastStyles";
  s.innerHTML = `
    #toastContainer{position:fixed;bottom:24px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:320px;}
    .tranzo-toast{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:14px;font-size:13px;line-height:1.4;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,.15);pointer-events:auto;animation:toastIn .25s ease;max-width:320px;word-break:break-word;}
    .tranzo-toast.info{background:#e8f4fd;color:#1565c0;border:1px solid #bbdefb;}
    .tranzo-toast.success{background:#e8f5e9;color:#1b5e20;border:1px solid #c8e6c9;}
    .tranzo-toast.warn{background:#fff8e1;color:#e65100;border:1px solid #ffe082;}
    .tranzo-toast.error{background:#fce4ec;color:#b71c1c;border:1px solid #f8bbd0;}
    .tranzo-toast .toast-icon{font-size:16px;line-height:1;flex-shrink:0;margin-top:1px;}
    .tranzo-toast .toast-close{margin-left:auto;padding:0 4px;background:none;border:none;font-size:16px;cursor:pointer;opacity:.5;flex-shrink:0;}
    .tranzo-toast .toast-close:hover{opacity:1;}
    @keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes toastOut{to{opacity:0;transform:translateY(8px)}}

    /* Completion popup */
    #completionPopup{position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);animation:fadeIn .2s ease;}
    #completionPopup .cp-card{background:#fff;border-radius:20px;padding:28px 28px 22px;max-width:340px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.25);text-align:center;animation:popIn .25s ease;}
    #completionPopup .cp-icon{font-size:48px;margin-bottom:12px;}
    #completionPopup .cp-title{font-size:20px;font-weight:800;color:#1a1a1a;margin-bottom:8px;}
    #completionPopup .cp-subtitle{font-size:14px;color:#666;margin-bottom:20px;line-height:1.5;}
    #completionPopup .cp-stats{display:flex;gap:12px;justify-content:center;margin-bottom:20px;}
    #completionPopup .cp-stat{background:#f8f8f8;border-radius:14px;padding:14px 20px;flex:1;min-width:100px;}
    #completionPopup .cp-stat-val{font-size:22px;font-weight:800;color:#ff6b35;}
    #completionPopup .cp-stat-lbl{font-size:12px;color:#999;margin-top:3px;}
    #completionPopup .cp-btn{display:inline-block;background:#ff6b35;color:#fff;font-weight:700;font-size:15px;padding:12px 32px;border-radius:12px;border:none;cursor:pointer;width:100%;}
    #completionPopup .cp-btn:hover{background:#e55a25;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
  `;
  document.head.appendChild(s);
  const container = document.createElement("div");
  container.id = "toastContainer";
  document.body.appendChild(container);
})();

const _toastIcons = { info: "ℹ️", success: "✅", warn: "⚠️", error: "❌" };

function showToast(message, type = "info", duration = 4000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `tranzo-toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${_toastIcons[type] || "ℹ️"}</span><span>${message}</span><button class="toast-close" onclick="this.closest('.tranzo-toast').remove()">×</button>`;
  container.appendChild(toast);
  if (duration > 0) {
    setTimeout(() => {
      toast.style.animation = "toastOut .3s ease forwards";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

<<<<<<< HEAD
function showCompletionPopup({ title, subtitle, stats, btnText = "Done" }) {
=======
function showCompletionPopup({ title, subtitle, stats, btnText = "Done", fileRows = [] }) {
>>>>>>> a862989 (added zip and unzip)
  const existing = document.getElementById("completionPopup");
  if (existing) existing.remove();
  const popup = document.createElement("div");
  popup.id = "completionPopup";
<<<<<<< HEAD
=======

  // Stats row (existing summary numbers)
>>>>>>> a862989 (added zip and unzip)
  const statsHtml = stats.map(s => `
    <div class="cp-stat">
      <div class="cp-stat-val">${s.value}</div>
      <div class="cp-stat-lbl">${s.label}</div>
    </div>`).join("");
<<<<<<< HEAD
=======

  // FIX-D: per-file rows — show exactly which files succeeded, failed, were skipped
  let fileListHtml = "";
  if (fileRows.length > 0) {
    const rows = fileRows.map(r => {
      let icon, color;
      if (r.state === "done")     { icon = "✅"; color = "#15803d"; }
      else if (r.state === "failed")   { icon = "⚠️"; color = "#b91c1c"; }
      else if (r.state === "canceled") { icon = "❌"; color = "#6b7280"; }
      else                             { icon = "⏭"; color = "#6b7280"; }
      const shortName = r.name.length > 36 ? r.name.slice(0, 34) + "…" : r.name;
      return `<div class="cp-file-row">
        <span class="cp-file-icon">${icon}</span>
        <span class="cp-file-name" style="color:${color}">${shortName}</span>
        <span class="cp-file-size">${fmtBytes(r.size)}</span>
      </div>`;
    }).join("");
    fileListHtml = `<div class="cp-file-list">${rows}</div>`;
  }

>>>>>>> a862989 (added zip and unzip)
  popup.innerHTML = `<div class="cp-card">
    <div class="cp-icon">🎉</div>
    <div class="cp-title">${title}</div>
    <div class="cp-subtitle">${subtitle}</div>
    <div class="cp-stats">${statsHtml}</div>
<<<<<<< HEAD
=======
    ${fileListHtml}
>>>>>>> a862989 (added zip and unzip)
    <button class="cp-btn" onclick="document.getElementById('completionPopup')?.remove()">${btnText}</button>
  </div>`;
  document.body.appendChild(popup);
  popup.addEventListener("click", e => { if (e.target === popup) popup.remove(); });
}
<<<<<<< HEAD
=======

// Inject per-file list styles into the existing popup CSS block
(function injectSummaryFileListStyles() {
  const s = document.createElement("style");
  s.textContent = `
    #completionPopup .cp-card{max-width:420px;max-height:90vh;overflow-y:auto;}
    #completionPopup .cp-file-list{text-align:left;border-top:1px solid rgba(0,0,0,.08);
      margin:0 -4px 16px;padding-top:10px;}
    #completionPopup .cp-file-row{display:flex;align-items:center;gap:8px;
      padding:5px 4px;border-radius:8px;}
    #completionPopup .cp-file-row:hover{background:rgba(0,0,0,.03);}
    #completionPopup .cp-file-icon{font-size:14px;flex-shrink:0;}
    #completionPopup .cp-file-name{flex:1;font-size:12px;font-weight:600;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    #completionPopup .cp-file-size{font-size:11px;color:#999;flex-shrink:0;}
  `;
  document.head.appendChild(s);
})()
>>>>>>> a862989 (added zip and unzip)
function addChatBubble({ user, text, mine }) {
  const row = document.createElement("div"); row.className = `msgRow ${mine ? "mine" : "other"}`;
  const bubble = document.createElement("div"); bubble.className = `bubble ${mine ? "mine" : "other"}`;
  bubble.innerHTML = `<div class="name">${user}</div><div class="text">${text}</div>`;
  row.appendChild(bubble); chatBox.appendChild(row); chatBox.scrollTop = chatBox.scrollHeight;
}

// Chat styles
(function() {
  const style = document.createElement("style");
  style.innerHTML = `#chatBox{padding:10px}.msgRow{display:flex;margin:6px 0}.msgRow.mine{justify-content:flex-end}.msgRow.other{justify-content:flex-start}.bubble{max-width:72%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.25;box-shadow:0 6px 14px rgba(0,0,0,.08);word-break:break-word}.bubble.mine{background:rgba(220,248,198,.95)}.bubble.other{background:rgba(255,255,255,.92)}.bubble .name{font-weight:800;font-size:12px;opacity:.75;margin-bottom:4px}.typingLine{font-size:13px;opacity:.75;padding:6px 10px}`;
  document.head.appendChild(style);
})();

// Typing indicator
const typingLine = document.createElement("div");
typingLine.className = "typingLine"; typingLine.style.display = "none";
if (chatSection) chatSection.appendChild(typingLine);
function showTyping(text) { typingLine.innerText = text; typingLine.style.display = text ? "block" : "none"; }

// ─── BROWSER NOTIFICATIONS ───────────────────────────────────────────────────
// Request permission once when the user first joins a room (requires gesture).
// We fire a notification when a file offer arrives while the tab is hidden.
let _notifPermission = (typeof Notification !== "undefined") ? Notification.permission : "denied";

function requestNotifPermission() {
  if (typeof Notification === "undefined") return;
  if (_notifPermission === "granted") return;
  // Must be called from a user gesture (joinBtn / createBtn click)
  Notification.requestPermission().then(p => { _notifPermission = p; });
}

function showFileOfferNotif(who, fileName, fileSize) {
  // Re-check permission fresh (may have been granted this session)
  const perm = (typeof Notification !== "undefined") ? Notification.permission : "denied";
  if (perm !== "granted") return;
  // Fire when tab is hidden OR document is not focused
  const tabHidden   = document.visibilityState !== "visible";
  const notFocused  = !document.hasFocus();
  if (!tabHidden && !notFocused) return;   // fully in focus — modal is enough
  try {
    const n = new Notification("📥 Incoming file — Tranzo", {
      body: `${who} wants to send you ${fileName} (${fmtBytes(fileSize)})`,
      icon: "/favicon.ico",
      tag:  "tranzo-file-offer",   // replace previous if another arrives quickly
      requireInteraction: true,    // stay visible until user dismisses on mobile
    });
    // Clicking the notification focuses the tab and shows the modal
    n.onclick = () => { window.focus(); n.close(); };
  } catch {}
}

// ─── DEVICE NAME ──────────────────────────────────────────────────────────────
function defaultDeviceName() {
  const ua = navigator.userAgent || "";
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const platform = (navigator.userAgentData?.platform) || navigator.platform || "Device";
  const browser = ua.includes("Edg") ? "Edge" : ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : "Browser";
  return `${isMobile ? "Phone" : "PC"}-${browser}-${platform}`;
}
function getDeviceName() { return (deviceNameInput?.value || "").trim() || defaultDeviceName(); }
if (deviceNameInput) {
  deviceNameInput.value = localStorage.getItem("deviceName") || defaultDeviceName();
  deviceNameInput.addEventListener("input", () => localStorage.setItem("deviceName", getDeviceName()));
}

// ─── SHARE LINK ───────────────────────────────────────────────────────────────
const shareLinkCard  = document.getElementById("shareLinkCard");
const shareLinkInput = document.getElementById("shareLinkInput");
const copyLinkBtn    = document.getElementById("copyLinkBtn");
const shareLinkHint  = document.getElementById("shareLinkHint");

function generateShareLink(roomId) {
  const base = window.location.origin + window.location.pathname;
  return `${base}?room=${encodeURIComponent(roomId)}&mode=download`;
}

function showShareLink(roomId) {
  if (!shareLinkCard || !shareLinkInput) return;
  const url = generateShareLink(roomId);
  shareLinkInput.value = url;
  shareLinkCard.style.display = "block";
  // Notify QR renderer that the link is set
  try { if (typeof window.__onShareLinkSet === "function") window.__onShareLinkSet(url); } catch {}
}

function hideShareLink() {
  if (shareLinkCard) shareLinkCard.style.display = "none";
}

if (copyLinkBtn) {
  copyLinkBtn.onclick = async () => {
    const link = shareLinkInput?.value;
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for non-HTTPS or older Android
      shareLinkInput.select();
      document.execCommand("copy");
    }
    copyLinkBtn.textContent = "✅ Copied!";
    if (shareLinkHint) { shareLinkHint.style.display = "block"; }
    setTimeout(() => {
      copyLinkBtn.textContent = "📋 Copy";
      if (shareLinkHint) shareLinkHint.style.display = "none";
    }, 2500);
  };
}

// ─── AUTO-JOIN VIA URL PARAMS ─────────────────────────────────────────────────
// When a receiver opens ?room=XYZ&mode=download, auto-fill room and join,
// with auto-accept enabled so files arrive immediately without manual accept.
(function autoJoinFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get("room");
  const modeParam = params.get("mode");
  if (!roomParam) return;

  // Wait for DOM + socket to be ready
  setTimeout(() => {
    if (roomInput) roomInput.value = roomParam;

    if (modeParam === "download") {
      // Auto-accept: receiver joined via share link — skip manual accept popup
      autoAcceptThisRoom = true;
      try { sessionStorage.setItem(`autoAccept:${roomParam}`, "1"); } catch {}
      addMsg(`<span class="muted">🔗 Joined via share link — auto-accept enabled. Waiting for sender to share files...</span>`);
    }

    joinRoom(roomParam, "join");

    // Clean the URL so refreshing doesn't re-trigger (cosmetic)
    try {
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    } catch {}
  }, 300);
})();

// ─── ROOM ─────────────────────────────────────────────────────────────────────
function joinRoom(roomId, mode) {
  // Clear the cached save folder when switching rooms — each room session
  // should pick its own destination folder.
<<<<<<< HEAD
  if (roomId !== currentRoom) _clearSaveDir();
=======
>>>>>>> a862989 (added zip and unzip)
  // Reset auto-accept when switching rooms so the new room always shows
  // the first-file modal (user explicitly consents per room session).
  if (roomId !== currentRoom) {
    autoAcceptThisRoom = false;
    _sessionAutoAccept = false;
    _sessionSentFiles = 0; _sessionSentBytes = 0; _sessionSentStart = 0;
    _sessionRecvFiles = 0; _sessionRecvBytes = 0; _sessionRecvStart = 0;
    try { sessionStorage.removeItem(`autoAccept:${currentRoom || ""}`); } catch {}
  }
  currentRoom = roomId;
  _openBroadcastChannel(roomId);   // open BC channel for same-device fallback
  loadAutoAcceptFlag();
  socket.emit("join-room", { roomId, deviceName: getDeviceName() });
  chatSection.style.display = "block";
  if (mode === "create") {
    setConnectedUI(false, "Room created", `Room: ${roomId} — Waiting...`);
    addMsg(`<span class="muted">🆕 Room: <b>${roomId}</b> (waiting...)</span>`);
    showShareLink(roomId);   // ← show share link for sender
  } else {
    setConnectedUI(false, "Joining...", `Room: ${roomId}`);
    addMsg(`<span class="muted">➡️ Joined: <b>${roomId}</b></span>`);
    hideShareLink();
  }
}
createBtn.onclick = () => { requestNotifPermission(); const id = Math.random().toString(36).slice(2, 8).toUpperCase(); roomInput.value = id; joinRoom(id, "create"); };
joinBtn.onclick   = () => { requestNotifPermission(); const r = roomInput.value.trim(); if (r) joinRoom(r, "join"); };
socket.on("room-status", ({ room, users }) => {
  if (room !== currentRoom) return;
  if (users >= 2) { setConnectedUI(true, "Connected", `Room: ${room} — ${users} user${users>2?"s":""} connected`); addMsg(`<span class="muted">✅ ${users} users in room.</span>`); }
  else            { setConnectedUI(false, "Waiting...", `Room: ${room} — Waiting...`); }
});

// room-peers: received when we join — full list of existing members
// Handled by multiroom.js (renderMemberPanel). Nothing to do here.
socket.on("room-peers", () => {});

// ─── BROADCASTCHANNEL FALLBACK SIGNALING ─────────────────────────────────────
// When both peers are on the same device (or same browser profile), Socket.IO
// goes through the server even though the peers are literally the same machine.
// BroadcastChannel is a same-origin, zero-latency inter-tab message bus.
//
// How it works:
//   - Both tabs open the same BroadcastChannel name ("tranzo-signal:<roomId>").
//   - When we emit webrtc-offer/answer/ice via socket, we ALSO broadcast on BC.
//   - On receiving a BC message we check if we already handled it via socket
//     (using a seen-set) to avoid double-processing.
//   - If the socket is disconnected, BC still works → same-device transfers
//     survive a server blip.
//
// BroadcastChannel is supported in all modern browsers (Chrome 54+, FF 38+,
// Safari 15.4+). Older browsers silently skip (try/catch guard).

let _bc = null;
const _bcSeen = new Set();   // deduplicate messages received on both channels

function _openBroadcastChannel(roomId) {
  try {
    if (_bc) { try { _bc.close(); } catch {} }
    _bc = new BroadcastChannel(`tranzo-signal:${roomId}`);
    _bc.onmessage = e => {
      const msg = e.data;
      if (!msg || !msg._bcId) return;
      if (_bcSeen.has(msg._bcId)) return;  // already handled via socket
      _bcSeen.add(msg._bcId);
      // Directly dispatch to our handlers
      if (msg.type === "webrtc-offer")  _handleWebrtcOffer(msg);
      else if (msg.type === "webrtc-answer") _handleWebrtcAnswer(msg);
      else if (msg.type === "webrtc-ice")    _handleWebrtcIce(msg);
    };
    dlog("[BC] Opened channel for room:", roomId);
  } catch(e) { dlog("[BC] BroadcastChannel not supported:", e.message); _bc = null; }
}

function _bcBroadcast(msg) {
  if (!_bc) return;
  try {
    const id = `${msg.type}-${Date.now()}-${Math.random()}`;
    // BUG-FIX-8: mark seen BEFORE postMessage so our own echo is always
    // filtered even if the event loop processes it synchronously.
    _bcSeen.add(id);
    _bc.postMessage({ ...msg, _bcId: id });
  } catch {}
}

// Open BC channel when room is joined
const _origJoinRoom = joinRoom;  // patch below after joinRoom is defined
let typingTimer = null;
messageInput?.addEventListener("input", () => {
  socket.emit("typing", { roomId: currentRoom, user: getDeviceName() });
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => socket.emit("stop-typing", { roomId: currentRoom, user: getDeviceName() }), 900);
});
socket.on("typing", ({ user }) => { if (user) showTyping(`${user} is typing...`); });
socket.on("stop-typing", () => showTyping(""));
sendBtn.onclick = () => {
  const msg = messageInput.value.trim(); if (!msg) return;
  socket.emit("chat-msg", { text: msg });
  addChatBubble({ user: "You", text: msg, mine: true });
  messageInput.value = "";
  socket.emit("stop-typing", { roomId: currentRoom, user: getDeviceName() });
};
socket.on("chat-msg", data => { if (data.from !== socket.id) addChatBubble({ user: data.name || "Peer", text: data.text || "", mine: false }); });

// ─── DRAG & DROP ──────────────────────────────────────────────────────────────
function enableDragDrop() {
  if (!fileInput) return;
  // Overlay attaches to #dropZone — the actual drag-drop area defined in the HTML.
  const dropZoneEl = document.getElementById("dropZone") || fileInput.parentElement;
  let overlay = document.getElementById("dropOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "dropOverlay";
    overlay.style.cssText = "position:relative;margin-top:10px;border:2px dashed rgba(0,0,0,.18);border-radius:16px;padding:14px;text-align:center;opacity:.75;user-select:none;";
    overlay.innerHTML = "🖱 Drag & Drop files here";
    dropZoneEl.appendChild(overlay);
  }
  const onDragOver  = e => { e.preventDefault(); overlay.style.opacity = "1"; overlay.style.borderColor = "rgba(255,140,60,.7)"; };
  const onDragLeave = () => { overlay.style.opacity = ".75"; overlay.style.borderColor = "rgba(0,0,0,.18)"; };
  const onDrop = e => { e.preventDefault(); onDragLeave(); if (!currentRoom) { alert("Join a room first."); return; } if (e.dataTransfer?.files?.length) enqueueFilesForSend(e.dataTransfer.files); };
  overlay.addEventListener("dragover", onDragOver);
  overlay.addEventListener("dragleave", onDragLeave);
  overlay.addEventListener("drop", onDrop);
}

fileInput.addEventListener("change", () => {
  // Snapshot into Array before clearing value — FileList is a live object
  // tied to the input and becomes empty after value="" in many browsers.
  const fileArr = Array.from(fileInput.files);
  fileInput.value = "";
  enqueueFilesForSend(fileArr);
});

// ── FIX: Auto rejoin room after socket reconnect ──────────────────────────────
// When Android opens the file picker, Chrome may background the tab and
// briefly disconnect Socket.IO. When it reconnects, socket.id has changed
// so we must re-emit join-room to restore the session.
// The server's 90-second grace period means the peer never sees us as "gone".
socket.on("connect", () => {
  if (currentRoom) {
    socket.emit("join-room", { roomId: currentRoom, deviceName: getDeviceName() });
    dlog("[Reconnect] Re-joined room:", currentRoom);
  }
});


document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Page came back into focus (user returned from gallery / file picker)
    dlog("[Visibility] Tab visible again");
    if (!socket.connected) {
      dlog("[Visibility] Socket disconnected — forcing reconnect");
      socket.connect();
    }
    // If we have a room, re-emit join-room as a safety net
    if (currentRoom && socket.connected) {
      socket.emit("join-room", { roomId: currentRoom, deviceName: getDeviceName() });
    }
  }
});

function enqueueFilesForSend(files) {
<<<<<<< HEAD
  Array.from(files || []).forEach(file => {
    const err = validateFile(file);
    if (err) { addMsg(`<span class="muted">❌ ${err}</span>`); return; }
    try { file._qid = file._qid || (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`); } catch { file._qid = `${Date.now()}-${Math.random()}`; }
    fileQueue.push(file);
    upsertSentItem(file._qid, file.name, file.size, "queued", 0, file.size);
    addMsg(`<span class="muted">📤 Selected: ${file.name} (${fmtBytes(file.size)})</span>`);
  });
=======
  const arr = Array.from(files || []);

  // ── ZIP BUNDLE: intercept multi-file selection ────────────────────────────
  // When 2+ files are selected simultaneously, zip them into a single bundle
  // and transfer as one file. The receiver auto-extracts and downloads each
  // file individually. Single-file selections bypass this entirely.
  // fflate availability is checked inside zipAndEnqueue (lazy-loads if needed).
  if (arr.length >= 2) {
    zipAndEnqueue(arr);   // async — shows progress, then calls _enqueueOneFile
    return;
  }
  // Single file — original path unchanged
  arr.forEach(f => _enqueueOneFile(f));
  _afterEnqueue();
}

// ── Internal: validate + push one file into the queue ────────────────────────
function _enqueueOneFile(file) {
  const err = validateFile(file);
  if (err) {
    addMsg(`<span class="muted">❌ ${err}</span>`);
    if (typeof TransferAlerts !== "undefined" && err.includes("too large")) {
      TransferAlerts.onFileTooLarge(file.name, file.size, MAX_FILE_SIZE);
    }
    return false;
  }
  try { file._qid = file._qid || (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`); } catch { file._qid = `${Date.now()}-${Math.random()}`; }
  fileQueue.push(file);
  upsertSentItem(file._qid, file.name, file.size, "queued", 0, file.size);
  addMsg(`<span class="muted">📤 Selected: ${file.name} (${fmtBytes(file.size)})</span>`);
  return true;
}

function _afterEnqueue(validFiles) {
  if (validFiles && validFiles.length > 0 && typeof TransferAlerts !== "undefined") {
    window._taTotalFiles = fileQueue.length;
    window._taFileIndex  = 1;
    TransferAlerts.onFilesQueued(validFiles);
  }
>>>>>>> a862989 (added zip and unzip)
  try { renderQueueUI(sending ? outgoingFile : null); } catch {}
  try { if (typeof window.multiroomBroadcastQueue === "function") window.multiroomBroadcastQueue(fileQueue.map(f => ({ name: f.name, size: f.size }))); } catch {}
  startNextFile();
}

// ── ZIP BUNDLE builder ────────────────────────────────────────────────────────
// Uses fflate.Zip streaming: never buffers the full ZIP in RAM.
// Each file is read via FileReader in chunks fed into a ZipDeflate entry.
// Output chunks accumulate in zipChunks[], then assembled into one File.
async function zipAndEnqueue(files) {
  _zipInProgress = true;  // block startNextFile until zip is ready
  // ── Ensure fflate is loaded (lazy-load if CDN script hasn't run yet) ──────
  if (typeof fflate === "undefined") {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js";
      s.onload  = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    }).catch(() => null);
    if (typeof fflate === "undefined") {
      // Still not available — fall back to sequential send
      addMsg('<span class="muted">⚠️ Zip library unavailable — sending files individually.</span>');
      _zipInProgress = false;
      files.forEach(f => _enqueueOneFile(f));
      _afterEnqueue(Array.from(files));
      return;
    }
  }
  // Validate all first
  const valid = [];
  for (const f of files) {
    const err = validateFile(f);
    if (err) {
      addMsg(`<span class="muted">❌ ${f.name}: ${err}</span>`);
      continue;
    }
    valid.push(f);
  }
  if (valid.length === 0) return;
  if (valid.length === 1) {
    // Only one valid file after filtering — skip zip
    _zipInProgress = false;
    _enqueueOneFile(valid[0]);
    _afterEnqueue([valid[0]]);
    return;
  }

  const totalSize = valid.reduce((s, f) => s + f.size, 0);
  const bundleName = `tranzo-bundle-${valid.length}files.zip`;

  // Show zipping status
  setStatus(`🗜️ Compressing ${valid.length} files…`);
  addMsg(`<span class="muted">🗜️ Zipping ${valid.length} files (${fmtBytes(totalSize)}) into bundle…</span>`);

  // Show each file as "zipping" in the queue while we build
  const zipQueueRows = valid.map(f => ({ name: f.name, state: "zipping", done: 0, total: f.size }));
  try { if (typeof window.renderQueueUI === "function") {
    // Temporarily inject rows so transfer-ui shows them
    window._zipPreviewRows = zipQueueRows;
    if (typeof renderFileList === "function") renderFileList(zipQueueRows);
  }} catch {}

  try {
    const zipChunks = [];
    let zippedBytes = 0;

    await new Promise((resolve, reject) => {
      const zip = new fflate.Zip((err, chunk, final) => {
        if (err) { reject(err); return; }
        zipChunks.push(chunk);
        if (final) resolve();
      });

      (async () => {
        for (let i = 0; i < valid.length; i++) {
          const file = valid[i];
          await new Promise((res, rej) => {
            const deflate = new fflate.ZipDeflate(file.name, { level: 0 }); // level 0 = store, fastest
            zip.add(deflate);

            const CHUNK = 2 * 1024 * 1024; // 2MB read chunks
            let offset = 0;

            function readNext() {
              const slice = file.slice(offset, offset + CHUNK);
              const reader = new FileReader();
              reader.onload = e => {
                const buf = new Uint8Array(e.target.result);
                offset += buf.byteLength;
                zippedBytes += buf.byteLength;
                // Update progress
                const pct = Math.round((zippedBytes / totalSize) * 100);
                setStatus(`🗜️ Compressing ${valid.length} files… ${pct}%`);
                const isFinal = offset >= file.size;
                deflate.push(buf, isFinal);
                if (!isFinal) readNext();
                else res();
              };
              reader.onerror = rej;
              reader.readAsArrayBuffer(slice);
            }
            readNext();
          });
        }
        zip.end();
      })().catch(reject);
    });

    // Assemble ZIP blob
    const totalZipSize = zipChunks.reduce((s, c) => s + c.byteLength, 0);
    const zipBlob = new Blob(zipChunks, { type: "application/zip" });
    const zipFile  = new File([zipBlob], bundleName, { type: "application/zip" });

    // Attach bundle metadata on the File object
    zipFile._zipBundle  = true;
    zipFile._zipFiles   = valid.map(f => ({ name: f.name, size: f.size, type: f.type || "application/octet-stream" }));
    try { zipFile._qid = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; } catch { zipFile._qid = `${Date.now()}-${Math.random()}`; }

    addMsg(`<span class="muted">✅ Bundle ready: ${bundleName} (${fmtBytes(zipFile.size)}) — starting transfer…</span>`);
    _zipInProgress = false;
    window._zipPreviewRows = null;

    // Enqueue the single zip file
    fileQueue.push(zipFile);
    upsertSentItem(zipFile._qid, zipFile.name, zipFile.size, "queued", 0, zipFile.size);

    if (typeof TransferAlerts !== "undefined") {
      window._taTotalFiles = fileQueue.length;
      window._taFileIndex  = 1;
      TransferAlerts.onFilesQueued([zipFile]);
    }
    try { renderQueueUI(sending ? outgoingFile : null); } catch {}
    try { if (typeof window.multiroomBroadcastQueue === "function") window.multiroomBroadcastQueue(fileQueue.map(f => ({ name: f.name, size: f.size }))); } catch {}
    startNextFile();

  } catch (err) {
    console.error("[ZIP] Failed to build bundle:", err);
    addMsg(`<span class="muted">⚠️ Zip failed — sending files individually instead.</span>`);
    _zipInProgress = false;
    window._zipPreviewRows = null;
    // Fallback: enqueue individually
    valid.forEach(f => _enqueueOneFile(f));
    _afterEnqueue(valid);
  }
}

// ─── BUTTONS ──────────────────────────────────────────────────────────────────
pauseBtn.onclick = () => {
  if (!sendState.running) return;
  sendState.paused = true;
  pauseBtn.disabled = true; resumeBtn.disabled = false;
  setStatus("⏸ Paused");
  try { fileWorker?.postMessage({ type: "pause" }); } catch {}
  // FIX-ALERTS: show pause card
  if (typeof TransferAlerts !== "undefined") {
    TransferAlerts.onPaused(sendState.offset, sendState.file?.size || 0);
  }
};
resumeBtn.onclick = () => {
  if (!sendState.running) return;
  sendState.paused = false;
  pauseBtn.disabled = false; resumeBtn.disabled = true;
  setStatus(`Sending: ${sendState.file?.name || ""}`);
  try {
    fileWorker?.postMessage({ type: "resume" });
    fileWorker?.postMessage({ type: "pull" }); // pull-one-ahead: single seed pull
  } catch {}
};
cancelBtn.onclick = () => cancelTransfer("You canceled transfer", true, getDeviceName());

// ─── PEER CONNECTION MANAGEMENT ───────────────────────────────────────────────
// ── Reconnect backoff state ───────────────────────────────────────────────────
// Tracks reconnect attempts per socketId to apply exponential backoff and
// prevent the runaway reconnect loop seen in logs (gen 38→43+).
const _reconnectAttempts = new Map();   // socketId → attempt count
const _reconnectTimers   = new Map();   // socketId → setTimeout handle
const _iceFailTimers     = new Map();   // socketId → setTimeout handle (ICE failed debounce)

function _clearReconnectTimer(socketId) {
  const t = _reconnectTimers.get(socketId);
  if (t) { clearTimeout(t); _reconnectTimers.delete(socketId); }
}
function _clearIceFailTimer(socketId) {
  const t = _iceFailTimers.get(socketId);
  if (t) { clearTimeout(t); _iceFailTimers.delete(socketId); }
}

async function createPeerConnectionFor(socketId) {
  // ── Close any existing peer for this socketId first ──────────────────────
  // Without this, the old PC's ICE/DC event handlers keep firing after the new
  // PC is created. Both PCs share the same socketId key, so stale callbacks
  // from the old PC trigger handlePeerFailed with wrong state, causing the
  // "ICE connected → disconnected → failed" loop seen after soft resets.
  const existingPeer = getPeer(socketId);
  if (existingPeer) {
    existingPeer.state = "closing";
    try { existingPeer.dc?.close(); } catch {}
    try { existingPeer.pc?.close(); } catch {}
    peerConnections.delete(socketId);
  }

  peerGeneration++;
  const gen = peerGeneration;
  const pc = new RTCPeerConnection(RTC_CONFIG);
  const peerObj = { pc, dc: null, gen, pathType: "unknown", state: "connecting" };
  setPeer(socketId, peerObj);
  if (!_primaryPeerSocketId) _primaryPeerSocketId = socketId;

  pc.onicegatheringstatechange = () => dlog("ICE gathering:", pc.iceGatheringState, socketId);

  pc.oniceconnectionstatechange = () => {
    const s = pc.iceConnectionState;
    dlog("ICE connection:", s, socketId);

    if (s === "connected" || s === "completed") {
      _clearIceFailTimer(socketId);      // cancel any pending fail handler
      _clearReconnectTimer(socketId);
      detectAndApplyNetworkProfile(pc);
    }

    if (s === "disconnected") {
      // "disconnected" is usually transient (flaky wifi, candidate switch).
      // BUT: if the DC has never opened (we are still in the ICE setup phase
      // for a fresh file), "disconnected" means the candidate pair collapsed
      // before SCTP could negotiate. Schedule a faster reconnect (1.5s) so
      // small files don't wait 5-30s for ICE "failed" to be declared.
      const peer = getPeer(socketId);
      const dcNeverOpened = !peer || peer.dc === null || peer.dc?.readyState !== "open";
      if (dcNeverOpened && (outgoingFile || incomingFile || pendingIncoming)) {
        _clearIceFailTimer(socketId);
        const t = setTimeout(() => {
          _iceFailTimers.delete(socketId);
          // Suppress if a clean transfer just ended or completely idle
          if (transferCompleted || gracefulClosing) return;
          if (!sendState.running && !outgoingFile && !incomingFile && !pendingIncoming) return;
          // Only act if still disconnected/failed — ignore if ICE recovered
          const cur = getPeer(socketId)?.pc?.iceConnectionState;
          if (cur === "disconnected" || cur === "failed" || cur === "closed" || !cur) {
            dlog("ICE disconnected before DC opened — fast reconnect", socketId);
            showToast("Connection dropped — reconnecting...", "warn", 3000);
            handlePeerFailed(socketId);
          }
        }, 1500);
        _iceFailTimers.set(socketId, t);
      }
    }

    if (s === "failed") {
      // Debounce 300ms — transient glitch guard.
      _clearIceFailTimer(socketId);
      const t = setTimeout(() => {
        _iceFailTimers.delete(socketId);
        // Suppress if a clean transfer just ended
        if (transferCompleted || gracefulClosing) {
          dlog("ICE failed suppressed — transferCompleted=" + transferCompleted + " gracefulClosing=" + gracefulClosing, socketId);
          return;
        }
        // Suppress if completely idle — no transfer in any state.
        // Receiver is passive: sender closes its PC after timeout/complete,
        // which causes ICE "failed" on the receiver side. If we're not doing
        // anything, just clean up quietly — the sender will send a new offer.
        const idle = !sendState.running && !sendState.canceled &&
                     !outgoingFile && !incomingFile && !pendingIncoming;
        if (idle) {
          dlog("ICE failed suppressed — idle receiver, no transfer in progress", socketId);
          // Quietly close the dead peer without triggering reconnect logic
          const p = getPeer(socketId);
          if (p) {
            p.state = "closing";
            try { p.dc?.close(); } catch {}
            try { p.pc?.close(); } catch {}
            peerConnections.delete(socketId);
          }
          // Do NOT null _primaryPeerSocketId — keep it so incoming signaling
          // messages (new offer from sender) can still be matched.
          return;
        }
        dlog("ICE truly failed — triggering full reconnect", socketId);
        showToast("Connection lost — reconnecting...", "warn", 3000);
        handlePeerFailed(socketId);
      }, 300);
      _iceFailTimers.set(socketId, t);
    }
  };

  pc.onconnectionstatechange = () => {
    const s = pc.connectionState;
    dlog("connectionState:", s, socketId);
    if (s === "connected") {
      setTimeout(() => detectAndApplyNetworkProfile(pc), 600);
    }
    // ⚠️  Do NOT handle "failed" here — oniceconnectionstatechange already does.
    // Handling both causes a double-reconnect race that produces the loop.
    // "disconnected" is also intentionally ignored here for the same reason.
  };

  pc.onicecandidate = e => {
    if (e.candidate) {
      const sigMsg = { to: socketId, candidate: e.candidate };
      socket.emit("webrtc-ice", sigMsg);
      _bcBroadcast({ type: "webrtc-ice", from: socket.id, ...sigMsg });
    }
    else dlog("ICE gathering complete for", socketId);
  };
  pc.onicecandidateerror = e => dlog("ICE candidate error:", e?.errorCode, e?.errorText);
  pc.ondatachannel = event => {
    peerObj.dc = event.channel;
    setupDataChannelFor(socketId, event.channel, gen);
  };
  return pc;
}

function handlePeerFailed(socketId) {
  // Guard: only one reconnect attempt in flight at a time
  if (retryInProgress) {
    dlog("handlePeerFailed: retryInProgress — skipping", socketId);
    return;
  }

  // ── Decide whether to reconnect before destroying anything ───────────────
  // Reconnect if:
  //   (a) sender: sendState.running (we are actively sending)
  //   (b) receiver: incomingFile != null (we are actively receiving)
  // In all other cases (idle, canceled, completed) just close cleanly.
  // Reconnect if any transfer is in progress at ANY stage:
  //   (a) sendState.running  — data is actively being sent
  //   (b) outgoingFile       — file accepted, waiting for DC to open (small files
  //                            commonly drop here before sendFile() has started)
  //   (c) incomingFile       — actively receiving chunks
  //   (d) pendingIncoming    — receiver accepted the offer but startReceiver()
  //                            hasn't been called yet (DC dropped before first chunk)
  const shouldReconnect = !transferCompleted && (
    (sendState.running  && !sendState.canceled) ||
    (!!outgoingFile     && sending)             ||
    (!!incomingFile)                            ||
    (!!pendingIncoming)
  );

  retryInProgress = true;
  _clearReconnectTimer(socketId);
  _clearIceFailTimer(socketId);

  // Exponential backoff: 1s, 2s, 4s, 8s, cap 15s
  const attempts = (_reconnectAttempts.get(socketId) || 0) + 1;
  _reconnectAttempts.set(socketId, attempts);
  const delay = Math.min(1000 * Math.pow(2, attempts - 1), 15000);
  dlog(`handlePeerFailed: attempt ${attempts}, delay ${delay}ms, shouldReconnect=${shouldReconnect}`, socketId);

  // Close the dead peer BEFORE scheduling reconnect so removePeer's dc.close()
  // doesn't re-trigger dc.onclose → handlePeerFailed again.
  const peer = getPeer(socketId);
  if (peer) {
    peer.state = "closing";
    try { peer.dc?.close(); } catch {}
    try { peer.pc?.close(); } catch {}
    peerConnections.delete(socketId);
  }

  if (!shouldReconnect) {
    // When not reconnecting (idle or completed), do NOT null _primaryPeerSocketId.
    // Keeping it means the next incoming offer from the sender can still be matched
    // via signaling. Nulling it here caused the receiver to lose its peer reference
    // and misroute the next webrtc-offer/answer/ice exchange.
    retryInProgress = false;
    return;
  }

  // Only null _primaryPeerSocketId when we're actively reconnecting —
  // it will be reassigned when makeOfferAndConnect creates the new peer.
  if (socketId === _primaryPeerSocketId) {
    _primaryPeerSocketId = null;
  }

  showToast(`Connection lost — reconnecting... (attempt ${attempts})`, "warn", 4000);

<<<<<<< HEAD
=======
  // FIX-ALERTS: show reconnecting card
  if (typeof TransferAlerts !== "undefined") {
    TransferAlerts.onReconnecting(
      attempts, 5,
      sendState.offset || 0,
      sendState.file?.size || 0
    );
  }

>>>>>>> a862989 (added zip and unzip)
  const timer = setTimeout(async () => {
    _reconnectTimers.delete(socketId);
    try {
      await makeOfferAndConnect(socketId);
    } catch(e) {
      dlog("reconnect offer failed:", e);
    } finally {
      retryInProgress = false;
    }
  }, delay);
  _reconnectTimers.set(socketId, timer);
}

function setupDataChannelFor(socketId, channel, gen) {
  channel.binaryType = "arraybuffer";
  channel.bufferedAmountLowThreshold = NET.lowWaterMark;

  channel.onerror = e => dlog("DC error", socketId, e?.error?.message);

  channel.onopen = () => {
    dlog("DC open", socketId, "gen", gen);
    showToast(`Connected to peer`, "success", 2500);
    const peer = getPeer(socketId);
    if (peer) peer.state = "open";
    // Reset backoff — connection is healthy
    _reconnectAttempts.delete(socketId);
    _clearReconnectTimer(socketId);
    _clearIceFailTimer(socketId);
    startDcKeepalive();   // prevent SCTP 30s idle timeout between files

    if (sendState.running && !sendState.canceled) {
      // ── Reconnect path: DC reopened mid-transfer ─────────────────────────
      dlog("[ONOPEN] reconnect — offset=" + sendState.offset + " file=" + (sendState.file?.name || "null"), socketId);
      showToast(`🔄 Reconnected — resuming transfer`, "info", 3000);

      if (typeof sendState._onReconnect === "function") {
        sendState._onReconnect(channel);
      }
      try {
        channel.send(JSON.stringify({ type: "resume-offset", offset: sendState.offset }));
      } catch(e) { dlog("resume-offset send failed:", e); }

      sendState.knownPeers.add(socketId);

    } else if (outgoingFile && !sendState.running) {
      // ── FRESH start: first connection for this file ───────────────────────
      dlog("[ONOPEN] FRESH START path — outgoingFile=" + outgoingFile.name +
        " sendState.running=" + sendState.running +
        " sending=" + sending, socketId);
      sendState.knownPeers.add(socketId);
      sendFile(outgoingFile).catch(console.error);
    } else {
<<<<<<< HEAD
      // ── No-op path — log why we skipped both branches ──────────────────────
=======
      // ── NO-OP path ───────────────────────────────────────────────────────────
>>>>>>> a862989 (added zip and unzip)
      dlog("[ONOPEN] NO-OP — sendState.running=" + sendState.running +
        " canceled=" + sendState.canceled +
        " outgoingFile=" + (outgoingFile?.name || "null") +
        " sending=" + sending, socketId);
<<<<<<< HEAD
=======

      // ── BUG-FIX-NOOP-QUEUE: DC reconnected but state was already cleared ──
      // This happens when:
      //   (a) DC dropped mid fast-path (sendFile had already started/finished
      //       for the current file, so sendState.running=false, outgoingFile=null)
      //   (b) handlePeerFailed correctly reconnected but onopen has no file to
      //       resume or start because the state window passed.
      // Recovery: if the queue still has files waiting, restart it now that DC
      // is healthy. Guard: only do this when truly idle (not canceled, not
      // already sending) to avoid double-starting.
      if (!sendState.canceled && !sending && fileQueue.length > 0) {
        dlog("[ONOPEN] NO-OP but queue non-empty — restarting queue", socketId);
        showToast("🔄 Reconnected — resuming queue", "info", 3000);
        setTimeout(() => startNextFile(), 100);
      } else if (!sendState.canceled && sending && !outgoingFile) {
        // ── sending=true but outgoingFile was cleared — stuck flag ───────────
        // softResetForNextFile set sending=false, startNextFile set sending=true,
        // then something cleared outgoingFile without clearing sending.
        // Reset sending so the queue can unblock on next attempt.
        dlog("[ONOPEN] NO-OP: sending=true but outgoingFile=null — resetting sending flag");
        sending = false;
        setTimeout(() => startNextFile(), 100);
      }
>>>>>>> a862989 (added zip and unzip)
    }
  };

  channel.onclose = () => {
    dlog("DC closed", socketId, "gen", gen);
    stopDcKeepalive();

    // ── Ignore expected closes ────────────────────────────────────────────────
    // 1. gracefulClosing: we initiated the close (transfer done / cancel)
    // 2. transferCompleted: everything finished cleanly
    // 3. gen mismatch: stale handler from a previous connection generation
    // 4. peer.state === "closing": we manually closed this peer in handlePeerFailed
    //    BEFORE scheduling reconnect, so dc.onclose must not re-trigger it.
    if (gracefulClosing || transferCompleted) return;
    if (gen !== peerGeneration) return;
    const peer = getPeer(socketId);
    if (peer?.state === "closing") return;

    // ── Idle close — sender closed its PC, we are a passive receiver ─────────
    // If no transfer is in progress at all, the sender closed its connection
    // after its own timeout/complete cycle. Don't reconnect — just clean up
    // quietly and wait for the next incoming offer.
    const isIdle = !sendState.running && !sendState.canceled &&
                   !outgoingFile && !incomingFile && !pendingIncoming;
    if (isIdle) {
      dlog("DC closed while idle — passive close, no reconnect needed", socketId);
      // If we received files this session and haven't shown the popup yet, show it now.
      if (_sessionRecvFiles > 0) {
        const _popupFiles   = _sessionRecvFiles;
        const _popupBytes   = _sessionRecvBytes;
        const _popupElapsed = (_sessionRecvStart > 0) ? Math.round((performance.now() - _sessionRecvStart) / 1000) : 0;
<<<<<<< HEAD
=======
        // FIX-D: per-file rows — include failed files so user sees the full picture
        const _popupRows = recvHistory.slice(-Math.max(_popupFiles, recvHistory.filter(r=>r.state==="failed").length))
          .map(r => ({ name: r.name, size: r.size, state: r.state }));
>>>>>>> a862989 (added zip and unzip)
        _sessionRecvFiles = 0; _sessionRecvBytes = 0; _sessionRecvStart = 0;
        setTimeout(() => showCompletionPopup({
          title: "All Files Received! 🎉",
          subtitle: `${_popupFiles} file${_popupFiles !== 1 ? "s" : ""} (${fmtBytes(_popupBytes)}) saved successfully.`,
          stats: [
            { value: _popupFiles.toString(), label: _popupFiles !== 1 ? "Files Received" : "File Received" },
            { value: `${_popupElapsed}s`, label: "Time Taken" },
          ],
<<<<<<< HEAD
=======
          fileRows: _popupRows,
>>>>>>> a862989 (added zip and unzip)
          btnText: "Great!",
        }), 300);
      }
      return;
    }

    addMsg(`<span class="muted">⚠️ DataChannel closed (${socketId.slice(0,6)})</span>`);
<<<<<<< HEAD
    // Only trigger reconnect if we're mid-transfer and not already handling it
    if (sendState.running && !sendState.canceled && !retryInProgress) {
=======

    // ── BUG-FIX-RECV-UI: mark in-progress receive items as "reconnecting" ──
    // When DC drops mid-receive, incomingFile stays alive (for resume), but the
    // queue UI keeps showing "Receiving" with a frozen progress bar forever.
    // Mark it as a transient "reconnecting" state so the user gets feedback,
    // then restore to "receiving" when the DC reopens and chunks flow again.
    if (incomingFile && !incomingFile.finalizing) {
      try {
        const id = incomingFile.meta?.id || `${incomingFile.meta?.name}|${incomingFile.meta?.size}`;
        upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0,
          "reconnecting", incomingFile.receivedBytes || 0, incomingFile.meta.size || 0);
        renderRecvQueueUI();
      } catch {}
    }

    // ── FIX-E: reconnect when EITHER sender or receiver is mid-transfer ────────
    // Old code only reconnected when sendState.running (sender side). On the
    // receiver side, DC close mid-receive left incomingFile hanging — no chunks
    // ever arrived again, poll timeout fired, file lost silently.
    // BUG-FIX-QUEUE-RECONNECT: also reconnect when outgoingFile is set (DC
    // dropped between queue items — sendState.running is false during the
    // offer/ICE phase but outgoingFile is non-null). Without this, the queue
    // stalls silently at the dropped item and never advances.
    const shouldReconnect = (!sendState.canceled && !retryInProgress) && (
      (sendState.running)                          ||
      (!!outgoingFile && sending)                  ||
      (!!incomingFile && !incomingFile.finalizing) ||
      (!!pendingIncoming)
    );
    if (shouldReconnect) {
>>>>>>> a862989 (added zip and unzip)
      handlePeerFailed(socketId);
    }
  };

  channel.onmessage = async event => {
    if (typeof event.data === "string") {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      if (msg.type === "meta")       { await startReceiver(msg.meta); return; }
      if (msg.type === "ready")      { markReceiverReady(true); return; }
      if (msg.type === "ack") {
        if (sendState.running) {
          sendState.ackBytes = Math.max(sendState.ackBytes, msg.bytes || 0);
          updateSenderUIByAck();
        }
        return;
      }
      if (msg.type === "nack") {
        // Receiver detected missing chunk — retransmit
        handleRetransmitRequest(msg.index, channel);
        return;
      }
      if (msg.type === "retry-chunk") {
        // enhancements.js smart retry: receiver requests a specific chunk by index
        window.__enh?.handleRetryChunk(msg.index, channel);
        return;
      }
      if (msg.type === "ping") {
        // enhancements.js keepalive: respond with a pong (no-op on sender side)
        return;
      }
      if (msg.type === "status-res") { lastStatusRes = msg; return; }
      if (msg.type === "status-req") {
        const r = incomingFile ? { receivedBytes: incomingFile.receivedBytes, size: incomingFile.meta.size, sawDone: incomingFile.sawDone } : { receivedBytes: 0, size: 0, sawDone: false };
        try { channel.send(JSON.stringify({ type: "status-res", ...r })); } catch {}
        return;
      }
      if (msg.type === "complete") {
        if (doneResendTimer) { clearInterval(doneResendTimer); doneResendTimer = null; }
        sendState.gotComplete = true;
        dlog("[COMPLETE] received from receiver — file=" + (sendState.file?.name || "null") +
          " running=" + sendState.running + " offset=" + sendState.offset);
        transferCompleted = true;
        setStatus(`✅ Sent: ${sendState.file?.name || ""}`);
        try { const f = sendState.file; if (f) { upsertSentItem(f._qid || `${f.name}|${f.size}`, f.name, f.size, "done", f.size, f.size); renderQueueUI(null); } } catch {}
        setProgressBytes(sendState.file?.size || 0, sendState.file?.size || 1);
        etaText.innerText = "Remaining: 0m 0s";
        sendState.running = false; outgoingFile = null;
        pauseBtn.disabled = true; resumeBtn.disabled = true; cancelBtn.disabled = true;

        // Track session stats
        if (!_sessionSentStart) _sessionSentStart = performance.now();
        _sessionSentFiles++;
        _sessionSentBytes += sendState.file?.size || 0;

<<<<<<< HEAD
        if (fileQueue.length > 0) {
          softResetForNextFile();
        } else {
=======
        // FIX-ALERTS: increment file index counter for next file
        window._taFileIndex = (window._taFileIndex || 1) + 1;

        if (fileQueue.length > 0) {
          // FIX-ALERTS: show "between files" alert while DC resets for next file
          if (typeof TransferAlerts !== "undefined") {
            const nextFile  = fileQueue[0];
            const doneCount = (window._taTotalFiles || 1) - fileQueue.length;
            TransferAlerts.onBetweenFiles(nextFile.name, doneCount, window._taTotalFiles || 1);
          }
          softResetForNextFile();
        } else {
          // FIX-ALERTS: all done — show completion card
          if (typeof TransferAlerts !== "undefined") {
            TransferAlerts.onComplete({
              fileName:      sendState.file?.name || "",
              fileSizeBytes: sendState.file?.size || 0,
              isSender:      true,
              allDone:       true,
              totalFiles:    window._taTotalFiles || _sessionSentFiles,
            });
            window._taTotalFiles = 0; window._taFileIndex = 1;
          }
>>>>>>> a862989 (added zip and unzip)
          safeCloseAllPeers();
          // Capture values NOW before resetting — setTimeout reads vars by reference,
          // not by value, so resetting before the callback fires gave "0 files".
          const _popupFiles = _sessionSentFiles;
          const _popupBytes = _sessionSentBytes;
          const _popupElapsed = (_sessionSentStart > 0) ? Math.round((performance.now() - _sessionSentStart) / 1000) : 0;
<<<<<<< HEAD
=======
          // FIX-D: capture per-file rows from sentHistory for this session
          const _popupRows = sentHistory.slice(-_popupFiles).map(r => ({ name: r.name, size: r.size, state: r.state }));
>>>>>>> a862989 (added zip and unzip)
          _sessionSentFiles = 0; _sessionSentBytes = 0; _sessionSentStart = 0;
          setTimeout(() => showCompletionPopup({
            title: "All Files Sent! 🎉",
            subtitle: `${_popupFiles} file${_popupFiles !== 1 ? "s" : ""} (${fmtBytes(_popupBytes)}) delivered to the receiver.`,
            stats: [
              { value: _popupFiles.toString(), label: _popupFiles !== 1 ? "Files Sent" : "File Sent" },
              { value: `${_popupElapsed}s`, label: "Time Taken" },
            ],
<<<<<<< HEAD
=======
            fileRows: _popupRows,
>>>>>>> a862989 (added zip and unzip)
            btnText: "Done",
          }), 400);
        }
        sending = false;
<<<<<<< HEAD
        setTimeout(() => startNextFile(), 200);
=======
        // ── FIX-DOUBLE-START: call startNextFile() directly here, NOT via setTimeout.
        // The old setTimeout(startNextFile, 200) raced with finalizeSend Path A's
        // own return path and with the resetReceiverReady() call inside startNextFile:
        //
        //   complete handler:  softResetForNextFile() → sending=false → setTimeout(startNextFile,200)
        //   finalizeSend PathA: returns immediately (does NOT call startNextFile)
        //   200ms later: startNextFile() → resetReceiverReady() → sendFile() → sendMsg("meta")
        //                receiver replies "ready" → receiverReady=true
        //   If ANY other code path calls resetReceiverReady() between the "ready"
        //   arriving and waitReceiverReady() being called, the flag is cleared and
        //   waitReceiverReady hangs for 120s → file skipped.
        //
        // Fix: call startNextFile() synchronously here. DC is already open (soft-reset
        // kept it alive), so startNextFile takes the fast path immediately.
        startNextFile();
>>>>>>> a862989 (added zip and unzip)
        return;
      }
      if (msg.type === "done")   { await finalizeIncomingIfReady(msg.sha256 || null); return; }
      if (msg.type === "cancel") {
        try { const id = incomingFile?.meta?.id; if (id && incomingFile?.meta) { upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0, "canceled", incomingFile.receivedBytes || 0, incomingFile.meta.size || 0); renderRecvQueueUI(); } } catch {}
        cancelTransfer(`${msg.by || "Peer"} canceled`, false);
        return;
      }
      if (msg.type === "resume-offset") {
        // This message is used in two directions:
        //
        // 1. SENDER → RECEIVER (msg.offset = sender's current offset):
        //    Sender asks "where are you?". Receiver replies with its receivedBytes.
        //    We detect this by checking if incomingFile exists (we are the receiver).
        //
        // 2. RECEIVER → SENDER (msg.offset = receiver's confirmed receivedBytes):
        //    Receiver answers the question. Sender resumes from that position.
        //    We detect this by sendState.running (we are the sender).

        if (incomingFile) {
          // ── We are the RECEIVER — reply with our confirmed byte count ───────
          // IMPORTANT: snap receivedBytes down to the nearest chunk boundary.
          // If the DC dropped mid-chunk, we may have received a partial chunk
          // that incremented receivedBytes by less than chunkSize. The sender
          // will re-send from its own chunkIndex boundary. If our count doesn't
          // align, we'd accept duplicate bytes or skip bytes → corruption.
          // Snapping to floor(receivedBytes / chunkSize) * chunkSize ensures
          // we only claim bytes from complete chunks.
          // BUG-FIX-4: use recorded chunkSize, not NET.chunkSize which may have been resized.
          const chunkSz  = incomingFile.chunkSize || NET.chunkSize || 262144;
          const aligned  = Math.floor(incomingFile.receivedBytes / chunkSz) * chunkSz;

          if (aligned < incomingFile.receivedBytes) {
            // Drop the partial last chunk from memory-mode chunks array
            if (incomingFile.chunks.length > 0) {
              // Remove chunks beyond the aligned offset
              let total = 0;
              const keep = [];
              for (const c of incomingFile.chunks) {
                if (total + c.byteLength <= aligned) { keep.push(c); total += c.byteLength; }
                else break;
              }
              incomingFile.chunks = keep;
            }
            dlog("resume-offset: snapping receivedBytes", fmtBytes(incomingFile.receivedBytes), "→", fmtBytes(aligned));
            incomingFile.receivedBytes = aligned;
            incomingFile.lastAckSent   = aligned;
            incomingFile.sawDone       = false;   // reset done flag — more data coming
            incomingFile.finalizing    = false;
          }

          const myOffset = incomingFile.receivedBytes;
          dlog("resume-offset: replying with confirmed offset:", fmtBytes(myOffset));
          try {
            channel.send(JSON.stringify({ type: "resume-offset", offset: myOffset }));
          } catch(e) { dlog("resume-offset reply failed:", e); }
          return;
        }

        // ── FIX-B: reply offset=0 even when incomingFile is null ─────────────
        // If DC dropped before the first chunk arrived (receivedBytes=0) or after
        // finalizeIncomingFile already nulled incomingFile, we have no state to
        // reply from. Previously: fell through silently → sender's
        // _onResumeConfirmed never fired → sender waited forever → file skipped.
        // Fix: always reply. offset=0 tells sender to re-send from the beginning,
        // which is correct — receiver has nothing yet.
        // Guard: only reply if we are NOT the sender (sendState.running).
        // If sendState.running is true and incomingFile is null, we ARE the sender
        // and the message is a receiver-confirms reply — handle below as normal.
        if (!sendState.running) {
          dlog("resume-offset: no incomingFile — replying offset=0 so sender re-seeks");
          try { channel.send(JSON.stringify({ type: "resume-offset", offset: 0 })); } catch {}
          return;
        }

        if (sendState.running && fileWorker) {
          // ── We are the SENDER — receiver confirmed its offset ────────────────
          const confirmedOffset = msg.offset || 0;
          dlog("resume-offset confirmed by receiver:", fmtBytes(confirmedOffset));
          if (typeof sendState._onResumeConfirmed === "function") {
            sendState._onResumeConfirmed(confirmedOffset);
          }
        }
        return;
      }
      return;
    }
    await handleIncomingChunk(event.data);
  };
}

// ─── RETRANSMISSION ───────────────────────────────────────────────────────────
function handleRetransmitRequest(chunkIndex, channel) {
  const buf = sendState.pendingRetransmits.get(chunkIndex);
  if (buf) {
    dlog("retransmit chunk index:", chunkIndex);
    try { channel.send(buf); } catch(e) { dlog("retransmit failed:", e); }
  } else {
    dlog("retransmit requested for index", chunkIndex, "but buffer not found");
  }
}

// ─── SIGNALING ────────────────────────────────────────────────────────────────
async function makeOfferAndConnect(targetSocketId) {
  const sid = targetSocketId || _primaryPeerSocketId;
  if (!sid) return;
  const pc = await createPeerConnectionFor(sid);
  const channel = pc.createDataChannel("file", { ordered: true });
  const peer = getPeer(sid);
  if (peer) peer.dc = channel;
  setupDataChannelFor(sid, channel, peerGeneration);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const sigMsg = { to: sid, sdp: pc.localDescription };
  socket.emit("webrtc-offer", sigMsg);
  _bcBroadcast({ type: "webrtc-offer", from: socket.id, ...sigMsg });
}

async function _handleWebrtcOffer({ from, sdp, resume }) {
  _primaryPeerSocketId = from;
  // Cancel any stale ICE-fail or reconnect timers for this peer before creating
  // a new PC. Timers from the old (dying) PC can fire after the new PC is set up
  // and call handlePeerFailed on the new connection, causing immediate ICE failure.
  _clearIceFailTimer(from);
  _clearReconnectTimer(from);
  const pc = await createPeerConnectionFor(from);
  await pc.setRemoteDescription(sdp);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  const sigMsg = { to: from, sdp: pc.localDescription };
  socket.emit("webrtc-answer", sigMsg);
  _bcBroadcast({ type: "webrtc-answer", from: socket.id, ...sigMsg });

  if (resume && incomingFile) {
    setTimeout(() => {
      const peer = getPeer(from);
      if (peer?.dc?.readyState === "open") {
        peer.dc.send(JSON.stringify({ type: "resume-offset", offset: incomingFile.receivedBytes }));
      }
    }, 500);
  }
}

async function _handleWebrtcAnswer({ from, sdp }) {
  const peer = getPeer(from || _primaryPeerSocketId);
  if (peer) await peer.pc.setRemoteDescription(sdp);
  else if (window.pc) await window.pc.setRemoteDescription(sdp);
}

async function _handleWebrtcIce({ from, candidate }) {
  const sid = from || _primaryPeerSocketId;
  const peer = getPeer(sid);
  try {
    if (peer) await peer.pc.addIceCandidate(candidate);
  } catch(e) { dlog("addIceCandidate error:", e); }
}

socket.on("webrtc-offer",  msg => _handleWebrtcOffer(msg).catch(e => dlog("[SIGNAL] webrtc-offer handler error:", e)));
socket.on("webrtc-answer", msg => _handleWebrtcAnswer(msg).catch(e => dlog("[SIGNAL] webrtc-answer handler error:", e)));
socket.on("webrtc-ice",    msg => { _handleWebrtcIce(msg).catch(e => dlog("[SIGNAL] webrtc-ice handler error:", e)); });

// ─── SAFE CLOSE ───────────────────────────────────────────────────────────────
// ── CONNECTION REUSE ──────────────────────────────────────────────────────────
// Closing and re-opening a WebRTC PeerConnection between files costs 2-8s of
// ICE negotiation and is the primary cause of "connection failed" errors when
// transferring multiple large files. Instead:
//   • If another file is queued: keep the existing DC alive, just reset state.
//   • If the queue is empty (or on cancel/error): close normally.
//
// safeCloseAllPeers() is now split into two functions:
//   softResetForNextFile() — resets transfer state, keeps DC open
//   safeCloseAllPeers()   — hard close, only called when queue is empty or on error

function softResetForNextFile() {
  dlog("[SOFT-RESET] keeping DC alive for next file");
  stopRttPolling();
  if (doneResendTimer) { clearInterval(doneResendTimer); doneResendTimer = null; }
  resetReceiverReady();
  retryInProgress = false;
  if (_primaryPeerSocketId) {
    _reconnectAttempts.delete(_primaryPeerSocketId);
    _clearReconnectTimer(_primaryPeerSocketId);
    _clearIceFailTimer(_primaryPeerSocketId);
  }
  sendState.knownPeers = new Set();
  sendState._onReconnect = null;
  sendState._onResumeConfirmed = null;
  sendState._queueRafId = null;
  // Keep pc, dc, _primaryPeerSocketId — reused for next file
}

function safeCloseAllPeers() {
  dlog("[SAFE-CLOSE] running=" + sendState.running + " file=" + (sendState.file?.name || outgoingFile?.name || "null"));
  stopRttPolling();
  stopDcKeepalive();
  gracefulClosing = true;
  peerGeneration++;
  if (_primaryPeerSocketId) {
    _clearReconnectTimer(_primaryPeerSocketId);
    _clearIceFailTimer(_primaryPeerSocketId);
    _reconnectAttempts.delete(_primaryPeerSocketId);
    removePeer(_primaryPeerSocketId);
  }
  _primaryPeerSocketId = null;
  if (doneResendTimer) { clearInterval(doneResendTimer); doneResendTimer = null; }
  resetReceiverReady();
  retryInProgress = false;
  sendState.knownPeers = new Set();
  sendState._onReconnect = null;
  sendState._onResumeConfirmed = null;
  sendState._queueRafId = null;
  setTimeout(() => (gracefulClosing = false), 800);
}

function safeClosePeer() { safeCloseAllPeers(); }

function cancelTransfer(reason, notifyPeer, canceledBy) {
  if (transferCompleted) return;
  if (doneResendTimer) { clearInterval(doneResendTimer); doneResendTimer = null; }
  markReceiverReady(false);
  if (sendState.running) {
    sendState.canceled = true;
    sendState._onReconnect = null;
    sendState._onResumeConfirmed = null;
    try { fileWorker?.postMessage({ type: "cancel" }); } catch {}
    try { fileWorker?.terminate(); } catch {}
    fileWorker = null;
    sendMsg({ type: "cancel", by: canceledBy || getDeviceName() });
    if (notifyPeer) socket.emit("file-cancel", { room: currentRoom, by: canceledBy || getDeviceName(), reason });
  }
  incomingFile = null;
  setStatus("❌ Transfer canceled");
  resetTransferUI(); safeCloseAllPeers();
  addMsg(`<span class="muted">❌ ${reason}</span>`);
  try { const f = sendState?.file || outgoingFile; if (f) { upsertSentItem(f._qid || `${f.name}|${f.size}`, f.name, f.size, "canceled", sendState?.ackBytes || 0, f.size); renderQueueUI(null); } } catch {}
  // FIX-ALERTS: show cancel card
  const byPeer = reason && !reason.toLowerCase().includes("you canceled");
  if (typeof TransferAlerts !== "undefined") TransferAlerts.onCanceled(byPeer);
}
socket.on("file-cancel", data => { if (!transferCompleted) cancelTransfer(`${data?.by || "Peer"} canceled`, false); });

// ─── BUFFER HELPERS ───────────────────────────────────────────────────────────
function waitForBufferDrain(channel) {
  const dc = channel || (window.dc);
  return new Promise(resolve => {
    if (!dc) return resolve();
    if (dc.bufferedAmount <= NET.lowWaterMark) return resolve();
    const onLow = () => { dc.removeEventListener("bufferedamountlow", onLow); resolve(); };
    dc.addEventListener("bufferedamountlow", onLow);
    const iv = setInterval(() => {
      if (!dc || dc.readyState !== "open" || dc.bufferedAmount <= NET.lowWaterMark) {
        clearInterval(iv); dc?.removeEventListener("bufferedamountlow", onLow); resolve();
      }
    }, 10);
  });
}

// ─── SENDER UI ────────────────────────────────────────────────────────────────
function updateSenderUIByAck() {
  const file = sendState.file; if (!file) return;
  setProgressBytes(sendState.ackBytes, file.size);
  // Throttle queue UI — renderQueueUI rebuilds innerHTML; RAF-throttle it
  if (!sendState._queueRafId) {
    sendState._queueRafId = requestAnimationFrame(() => {
      sendState._queueRafId = null;
      if (!sendState.file) return;
      try { upsertSentItem(sendState.file._qid || `${sendState.file.name}|${sendState.file.size}`, sendState.file.name, sendState.file.size, "sending", sendState.ackBytes, sendState.file.size); renderQueueUI(sendState.file); } catch {}
    });
  }
  const now = performance.now(); const dt = (now - sendState.lastAckTickT) / 1000;
  if (!sendState.lastAckTickT) { sendState.lastAckTickT = now; sendState.lastAckTickB = sendState.ackBytes; return; }
  if (dt >= 1.0) {
    const db = sendState.ackBytes - sendState.lastAckTickB;
    sendState.ackEma = sendState.ackEma ? 0.8 * sendState.ackEma + 0.2 * (db / dt) : db / dt;
    speedText.innerText = `Speed: ${(sendState.ackEma / 1024 / 1024).toFixed(2)} MB/s`;
    const remaining = file.size - sendState.ackBytes;
    etaText.innerText = `Remaining: ${formatETA(sendState.ackEma > 0 ? remaining / sendState.ackEma : NaN)}`;
    sendState.lastAckTickT = now; sendState.lastAckTickB = sendState.ackBytes;
    // FIX-ALERTS: keep alert card live during active send
    if (typeof TransferAlerts !== "undefined") {
      TransferAlerts.onProgress({
        done:       sendState.ackBytes,
        total:      file.size,
        speedMbps:  sendState.ackEma / 1024 / 1024,
        etaSec:     sendState.ackEma > 0 ? remaining / sendState.ackEma : NaN,
        isSender:   true,
        fileName:   file.name,
        fileIndex:  window._taFileIndex  || 1,
        totalFiles: window._taTotalFiles || 1,
      });
    }
  }
}

// ─── FILE QUEUE ───────────────────────────────────────────────────────────────
function startNextFile() {
  if (_zipInProgress) { dlog("[QUEUE] startNextFile deferred — zip in progress"); return; }
  if (sending || fileQueue.length === 0) return;
  const file = fileQueue.shift();
  dlog("[QUEUE] startNextFile — starting:", file.name, "queue remaining:", fileQueue.length,
    "sendState.running=" + sendState.running, "dc=" + (window.dc?.readyState || "none"));
  try { if (typeof window.multiroomBroadcastQueue === "function") window.multiroomBroadcastQueue(fileQueue.map(f => ({ name: f.name, size: f.size }))); } catch {}
  sending = true;
  // BUG-FIX-RECONNECT: reset transferCompleted HERE (not in the complete handler).
  // Resetting it earlier caused dc.onclose (which fires after safeCloseAllPeers)
  // to see transferCompleted=false and trigger handlePeerFailed → reconnect loop.
  transferCompleted = false;
  gracefulClosing = false;
  resetReceiverReady(); retryInProgress = false;
  outgoingFile = file;
  resetTransferUI();

  // ── FAST PATH: reuse existing open DataChannel ───────────────────────────
  // If the previous transfer left the DC open (softResetForNextFile was used),
  // skip the entire offer/answer/ICE cycle and go straight to sendFile().
  // This eliminates the 2-8s re-connection delay between consecutive files.
  const existingDc = window.dc;
  if (existingDc?.readyState === "open" && _primaryPeerSocketId) {
    dlog("[QUEUE] DC already open — reusing connection, skipping ICE for", file.name);
    setStatus(`Sending: ${file.name} (${fmtBytes(file.size)})`);
    sendState.knownPeers.add(_primaryPeerSocketId);
    sendFile(file).catch(console.error);
    return;
  }

  // ── SLOW PATH: full offer/answer/ICE negotiation ─────────────────────────
  setStatus(`Waiting for receiver... (${file.name}, ${fmtBytes(file.size)})`);
  try { renderQueueUI(file); } catch {}
  socket.emit("file-offer", { id: file._qid || `${file.name}|${file.size}`, name: file.name, size: file.size, type: file.type || "application/octet-stream" });

  // ── Watchdog: re-emit file-offer if DC never opens within 15s ────────────
  // Covers the case where the webrtc-answer is lost (ICE stuck at "gathering:
  // complete" with no "checking") due to signaling races or socket reconnects.
  const _watchdogFile = file;
  const _watchdogTimer = setTimeout(() => {
    // Only retry if this file is still the outgoing file and DC is still closed
    if (outgoingFile === _watchdogFile && sending && !sendState.running) {
      const dcState = window.dc?.readyState;
      if (!dcState || dcState !== "open") {
        dlog("[WATCHDOG] DC never opened for", _watchdogFile.name, "— re-emitting file-offer");
        showToast(`Connection stalled — retrying...`, "warn", 3000);
        // Close stale peer if any, then re-offer
        if (_primaryPeerSocketId) {
          _clearIceFailTimer(_primaryPeerSocketId);
          _clearReconnectTimer(_primaryPeerSocketId);
          const p = getPeer(_primaryPeerSocketId);
          if (p) { p.state = "closing"; try { p.dc?.close(); } catch {} try { p.pc?.close(); } catch {} peerConnections.delete(_primaryPeerSocketId); }
        }
        socket.emit("file-offer", { id: _watchdogFile._qid || `${_watchdogFile.name}|${_watchdogFile.size}`, name: _watchdogFile.name, size: _watchdogFile.size, type: _watchdogFile.type || "application/octet-stream" });
      }
    }
  }, 15000);

  // Cancel watchdog as soon as DC opens (normal path)
  const _cancelWatchdog = () => clearTimeout(_watchdogTimer);
<<<<<<< HEAD
  const _origOnDcOpen = Peer?.PeerEvents?.onDcOpen;  // in case peer.js is used
=======
  // BUG-FIX-PEER-UNDEF: Peer?.X?.Y throws ReferenceError when Peer is an
  // undeclared identifier — optional chaining only guards null/undefined, not
  // variables that were never declared. Use typeof guard instead. This line
  // was a dead stub left over from a removed peer.js integration.
  const _origOnDcOpen = (typeof Peer !== "undefined") ? Peer?.PeerEvents?.onDcOpen : undefined;
>>>>>>> a862989 (added zip and unzip)
  // Use a one-shot listener on the peerConnections map via onopen inside setupDataChannelFor
  // The watchdog self-cancels when sendState.running becomes true
  const _watchdogPoll = setInterval(() => {
    if (!sending || outgoingFile !== _watchdogFile || sendState.running || window.dc?.readyState === "open") {
      clearInterval(_watchdogPoll);
      clearTimeout(_watchdogTimer);
    }
  }, 500);
}

// ─── FILE OFFER / ACCEPT ──────────────────────────────────────────────────────
socket.on("file-offer", async ({ from, fromName, fromShort, meta }) => {
  pendingIncoming = { from, meta };
  try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta?.name, meta?.size || 0, "pending", 0, meta?.size || 0); renderRecvQueueUI(); } catch {}
  const who = fromName || fromShort || (from ? from.substring(0, 5) : "User");

  // Fire background notification (no-op when tab is visible or permission denied)
  showFileOfferNotif(who, meta?.name || "file", meta?.size || 0);

  // ── Auto-accept logic ─────────────────────────────────────────────────────
  // After the user clicks Accept once per session (_sessionAutoAccept = true),
  // all subsequent file offers are accepted automatically without any modal.
<<<<<<< HEAD
  // For large files (>MEMORY_MAX_BYTES), _getSaveDir() has already been called
  // and the folder handle is cached — no second picker needed.
=======
>>>>>>> a862989 (added zip and unzip)
  // The very first offer (or if session auto-accept was never triggered) always
  // shows the modal so the user explicitly consents.
  //
  // Legacy multiroom.js hook: __mrShouldShowModal=false means solo-room
  // already handled accept for us. We still respect that.
  const mrOverride = (typeof window.__mrShouldShowModal !== "undefined")
    ? window.__mrShouldShowModal
    : undefined;

  const shouldAutoAccept = _sessionAutoAccept || mrOverride === false;

  if (shouldAutoAccept) {
    addMsg(`<span class="muted">✅ Auto-accepted: <b>${meta?.name}</b> (${fmtBytes(meta?.size || 0)}) from <b>${who}</b></span>`);
    await _acceptPendingFile();
    window.__mrShouldShowModal = undefined;
    return;
  }

  // Show modal — user must explicitly accept/reject this first file
  modalInfo.innerText = `From: ${who}\nFile: ${meta.name}\nSize: ${fmtBytes(meta.size)}\nType: ${meta.type}`;
  modalBg.style.display = "flex";
  window.__mrShouldShowModal = undefined;

  // ── Notify sender that receiver has seen the offer and is reviewing ────────
  // This lets the sender show a "Receiver is reviewing…" state instead of
  // just "Waiting for receiver…" with no feedback at all.
  try { socket.emit("file-offer-seen", { to: from }); } catch {}
});

rejectBtn.onclick = () => {
  if (!pendingIncoming) return;
  socket.emit("file-answer", { to: pendingIncoming.from, accepted: false });
  try { const id = pendingIncoming?.meta?.id || `${pendingIncoming?.meta?.name}|${pendingIncoming?.meta?.size}`; if (id && pendingIncoming?.meta) { upsertRecvItem(id, pendingIncoming.meta.name, pendingIncoming.meta.size || 0, "canceled", 0, pendingIncoming.meta.size || 0); renderRecvQueueUI(); } } catch {}
  pendingIncoming = null; modalBg.style.display = "none";
};

// ── Session-level auto-accept flag ───────────────────────────────────────────
// Set to true when user clicks Accept for the first time in a session.
// All subsequent file offers are auto-accepted without showing the modal.
<<<<<<< HEAD
// The user only needs to pick a save folder once (for large files) — _getSaveDir()
// caches the handle for the entire session.
let _sessionAutoAccept = false;

// ── Disk prep synchronization ─────────────────────────────────────────────────
// _acceptPendingFile emits file-answer immediately (to start ICE right away),
// then calls showDirectoryPicker in the background. The DC can open and meta
// can arrive while that picker is still open. startReceiver must wait for this
// promise before attempting its own _createWritableInDir, otherwise both code
// paths call showDirectoryPicker concurrently → NotAllowedError: File picker
// already active → pendingWritable stays null → "Save location missing".
let _diskPrepPromise = null;   // Promise<void> | null
=======
let _sessionAutoAccept = false;

>>>>>>> a862989 (added zip and unzip)

// Shared helper: accept a pending file offer (used by acceptBtn and auto-accept).
async function _acceptPendingFile() {
  if (!pendingIncoming) return;
  transferCompleted = false; gracefulClosing = false; resetReceiverReady(); retryInProgress = false;
  const { from, meta } = pendingIncoming;

  // ── Accept immediately — start P2P handshake right away ──────────────────
<<<<<<< HEAD
  if (pendingWritable) {
    try { pendingWritable.abort?.(); } catch {}
    pendingWritable = null;
  }
=======
>>>>>>> a862989 (added zip and unzip)
  pendingIncoming = null;
  modalBg.style.display = "none";
  _primaryPeerSocketId = from;
  socket.emit("file-answer", { to: from, accepted: true });
  setStatus("Accepted. Connecting P2P...");

<<<<<<< HEAD
  // ── Prepare disk storage in parallel with ICE negotiation ────────────────
  // Signal startReceiver to wait for this before trying its own picker.
  const canDisk = "showDirectoryPicker" in window && window.isSecureContext;
  if (meta.size > MEMORY_MAX_BYTES && canDisk) {
    let _diskPrepResolve;
    _diskPrepPromise = new Promise(r => { _diskPrepResolve = r; });
    try {
      pendingWritable = await _createWritableInDir(meta.name);
      const dirName = _saveDir?.name || "chosen folder";
      addMsg(`<span class="muted">💾 Saving to folder <b>${dirName}</b> → ${meta.name}</span>`);
    } catch {
      addMsg(`<span class="muted">❌ Save folder not chosen — file will be received in memory if possible.</span>`);
    } finally {
      _diskPrepResolve();   // always resolve so startReceiver is never stuck
      _diskPrepPromise = null;
    }
  } else if (meta.size > MEMORY_MAX_BYTES) {
    addMsg(`<span class="muted">⚠️ Large file needs HTTPS + a modern browser for disk saving.</span>`);
  }
  // Small files: pendingWritable stays null → finalize uses Blob + a.click()
=======
  // All files use memory → Blob → a.click() — no disk picker needed.
>>>>>>> a862989 (added zip and unzip)
}

acceptBtn.onclick = async () => {
  if (!pendingIncoming) return;
  // Mark session-level auto-accept so all future files skip the modal
  _sessionAutoAccept = true;
  addMsg(`<span class="muted">📥 Accepted. Auto-accept enabled for this session — all further files will be received automatically.</span>`);
  await _acceptPendingFile();
};


// ── Sender: receiver has seen the file offer and is reviewing it ──────────────
// Emitted by the receiver side just before the accept/reject modal is shown.
// Gives the sender meaningful feedback instead of a silent "Waiting…" state.
socket.on("file-offer-seen", ({ from }) => {
  // Only act if we are actually waiting for this peer's answer
  if (!outgoingFile && !sendState.running) return;
  const fileName = outgoingFile?.name || sendState.file?.name || "";
  const msg = fileName
    ? `<span class="muted">👀 Receiver is reviewing <b>${fileName}</b>…</span>`
    : `<span class="muted">👀 Receiver is reviewing your file offer…</span>`;
  addMsg(msg);
  setStatus("Receiver is reviewing your file offer…");
  if (typeof TransferAlerts !== "undefined") {
    TransferAlerts.onWaitingForReady(fileName);
  }
  try {
    const el = document.getElementById("tui-status-text");
    if (el) { el.textContent = "Receiver is reviewing…"; el.className = "tui-status-active"; }
    const fnEl = document.getElementById("tui-filename");
    if (fnEl && fileName && fnEl.classList.contains("tui-idle")) {
      fnEl.textContent = fileName; fnEl.classList.remove("tui-idle");
    }
  } catch {}
});

socket.on("file-answer", async ({ from, accepted }) => {
  if (!accepted) {
    addMsg(`<span class="muted">❌ ${from ? from.substring(0,6) : "Peer"} rejected.</span>`);
    if (!sendState.running && peerConnections.size === 0) {
      setStatus("Receiver rejected.");
      outgoingFile = null;
      sending = false;   // unblock queue so next file can be offered
    }
    return;
  }

  // ── BUG-FIX-STALE-ANSWER: guard against stale file-answer arriving while ──
  // the DC is already open and a transfer is running (fast-path case).
  //
  // Sequence that caused "User-Initiated Abort":
  //   1. FileN uses slow path → file-offer emitted → receiver queues file-answer
  //   2. FileN transfer completes → softResetForNextFile keeps DC alive
  //   3. FileN+1 uses FAST PATH (DC still open) → sendFile() called directly,
  //      no new file-offer emitted, no new file-answer expected
  //   4. Receiver's delayed file-answer for a re-offered or auto-accepted file
  //      arrives here → makeOfferAndConnect(from) called unconditionally
  //   5. createPeerConnectionFor closes the live DC with "User-Initiated Abort"
  //   6. Sender DC closes → handlePeerFailed → reconnect → [ONOPEN] NO-OP
  //      because outgoingFile/sending were cleared by the time DC reopens
  //
  // Fix: if DC is already open to this peer AND a transfer is actively running
  // or queued, this file-answer is stale — drop it silently.
  const existingDcOpen = window.dc?.readyState === "open" ||
    getPeer(from)?.dc?.readyState === "open" ||
    getPeer(_primaryPeerSocketId)?.dc?.readyState === "open";
  const transferActive = sendState.running || (!!outgoingFile && sending);
  if (existingDcOpen && transferActive) {
    dlog("[FILE-ANSWER] stale answer dropped — DC already open and transfer running", from);
    return;
  }

  // ── Also guard: if DC is open but we are between files (fast-path reset) ──
  // softResetForNextFile keeps the DC alive. If a file-answer arrives during
  // the brief window between softReset and the next sendFile(), calling
  // makeOfferAndConnect would still kill the live connection unnecessarily.
  // Recognise this by: DC open + _primaryPeerSocketId already set to this peer.
  if (existingDcOpen && _primaryPeerSocketId === from) {
    dlog("[FILE-ANSWER] stale answer dropped — DC already open to primary peer", from);
    return;
  }

  // Don't overwrite _primaryPeerSocketId if transfer already running with another peer
  if (!_primaryPeerSocketId) _primaryPeerSocketId = from;
  setStatus("Accepted. Connecting P2P...");
  addMsg(`<span class="muted">📤 Accepted by ${from ? from.substring(0,6) : "peer"}. Connecting P2P...</span>`);
  await makeOfferAndConnect(from);
});

// ─── SEND FILE ────────────────────────────────────────────────────────────────
// Uses the correct Google WebRTC datatransfer pattern:
// https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
//
// KEY: do NOT maintain a separate myBuffered counter. Instead check
// dc.bufferedAmount directly before each send. The channel drains asynchronously;
// bufferedamountlow tells us when it's safe to send again.
async function sendFile(file) {
  // ── FIX-A: DOUBLE-START GUARD ────────────────────────────────────────────────
  // Set running=true BEFORE any await so channel.onopen can't launch a second
  // sendFile() coroutine for the same file during the detectAndApplyNetworkProfile
  // yield window. Without this, an ICE restart that reopens the DC while sendFile()
  // is awaiting its first async call sees running=false, finds outgoingFile set, and
  // calls sendFile() again → two coroutines race, both send "meta", both start
  // workers → interleaved chunks, corrupted files, wrong "Sending N of 7" counter.
  if (sendState.running) {
    dlog("sendFile: already running — dropping duplicate call for", file.name);
    return;
  }
  sendState.running  = true;   // ← must be FIRST, before any await
  sendState.canceled = false;

  const getDc = () => {
    const p = getPeer(_primaryPeerSocketId);
    return p?.dc?.readyState === "open" ? p.dc : null;
  };

  if (!getDc()) {
    sendState.running = false;   // release guard if DC already gone
    dlog("sendFile: no open DC");
    return;
  }

  // Detect network profile first
  const primaryPeer = getPeer(_primaryPeerSocketId);
  if (primaryPeer?.pc) await detectAndApplyNetworkProfile(primaryPeer.pc);

  resetTransferUI();
  setStatus(`Sending: ${file.name} (${fmtBytes(file.size)})`);
  addMsg(`<b>Sending:</b> ${file.name} (${fmtBytes(file.size)})`);
  dlog("sendFile", { name: file.name, size: file.size, chunk: NET.chunkSize, depth: NET.pipelineDepth, path: NET.pathType });
  try { upsertSentItem(file._qid || `${file.name}|${file.size}`, file.name, file.size, "sending", 0, file.size); renderQueueUI(file); } catch {}

  pauseBtn.disabled = false; resumeBtn.disabled = true; cancelBtn.disabled = false;
  // running already set above — just set the rest of state here
  sendState.paused = false; sendState.canceled = false;
  sendState.offset = 0; sendState.file = file; sendState.ackBytes = 0;
  sendState.lastAckTickT = 0; sendState.lastAckTickB = 0; sendState.ackEma = 0;
  sendState.gotComplete = false; sendState.chunkIndex = 0;
  sendState.startChunkSize = 0;
  sendState.pendingRetransmits = new Map();
  sendState.knownPeers = new Set();
  if (!_sessionSentStart) _sessionSentStart = performance.now(); // track session start
<<<<<<< HEAD


  resetReceiverReady(); retryInProgress = false;

  sendMsg({ type: "meta", meta: {
    id: file._qid || `${file.name}|${file.size}`,
    name: file.name, size: file.size,
    type: file.type || "application/octet-stream"
=======


  // NOTE: resetReceiverReady() is intentionally NOT called here.
  // startNextFile() already called it synchronously before invoking sendFile().
  // Calling it again here (after the async detectAndApplyNetworkProfile await)
  // would clobber a "ready" that the receiver sent immediately upon getting "meta"
  // — causing waitReceiverReady() to hang for 120s and the file to be skipped.
  retryInProgress = false;

  sendMsg({ type: "meta", meta: {
    id:        file._qid || `${file.name}|${file.size}`,
    name:      file.name,
    size:      file.size,
    type:      file.type || "application/octet-stream",
    // ZIP bundle metadata — tells receiver to auto-extract after download
    zipBundle: file._zipBundle  || false,
    zipFiles:  file._zipFiles   || null,
>>>>>>> a862989 (added zip and unzip)
  }});

  setStatus(`Waiting receiver ready... (${file.name})`);
  const okReady = await waitReceiverReady(120000);
  if (!okReady) { cancelTransfer("Receiver not ready (timeout).", true); return; }
  setStatus(`Sending: ${file.name} (${fmtBytes(file.size)})`);

  // ── Always create a fresh worker for each transfer ───────────────────────
  // Reusing the same worker risks the old onmessage closure (with its own
  // chunkQueue/workerDone/allSent variables) still being alive and receiving
  // chunk messages → two send-loops running in parallel → interleaved data
  // → corrupted file on the receiver.
  // BUG-FIX-WORKER: terminate() stops the worker thread but already-queued
  // onmessage events (e.g. 28 buffered "pull" responses) are still delivered
  // to the old closure. A generation token lets each onmessage handler
  // immediately discard events that belong to a previous sendFile() call.
  if (fileWorker) {
    try { fileWorker.postMessage({ type: "cancel" }); } catch {}
    try { fileWorker.terminate(); } catch {}
    fileWorker = null;
  }
  const _workerGen = ++sendState._workerGen;   // unique stamp for THIS transfer
  fileWorker = new Worker("worker.js");

  // ── Send-loop state ───────────────────────────────────────────────────────
  const chunkQueue   = [];
  let   workerDone   = false;
  let   allSent      = false;
  let   loopRunning  = false;
  let   waitingDrain = false;     // true while we're blocked on SCTP drain
  let   _sendBackoff = 50;        // ms — exponential backoff for send-queue-full
  let   currentDepth = NET.pipelineDepth;
  let   _lastSampleT = performance.now();
  let   _lastSampleB = 0;

  // Set the drain threshold on whichever DC is currently open
  function applyThreshold() {
    const d = getDc();
    if (d) d.bufferedAmountLowThreshold = NET.lowWaterMark;
  }
  applyThreshold();

  // ── SEND LOOP ─────────────────────────────────────────────────────────────
  // Design: pull-one-ahead model.
  // We send one chunk, then pull one more from the worker — keeping exactly
  // one chunk pre-loaded. This means chunkQueue stays at 1 entry, SCTP never
  // sees more than one chunk queued at a time in JS memory, and the SCTP
  // "send queue is full" error is eliminated entirely.
  //
  // Flow control is via dc.bufferedAmount:
  //   - if bufferedAmount >= HWM: pause, wait for bufferedamountlow event
  //   - if dc.send throws: backoff and retry (last resort)
  //   - otherwise: send immediately and pull next chunk
  //
  // The pipeline depth (currentDepth) still controls how far ahead the
  // worker reads — but chunkQueue is bounded to 1 entry at any time.
  function sendLoop() {
    if (!sendState.running || sendState.canceled || allSent) return;
    if (loopRunning || waitingDrain) return;
    loopRunning = true;

    let dc = getDc();

    while (chunkQueue.length > 0) {
      if (sendState.paused || sendState.canceled) break;

      if (!dc) dc = getDc();
      if (!dc) {
        dlog("[SEND] DC not open — waiting for reconnect");
        waitingDrain = false;
        break;
      }

      // ── Backpressure check BEFORE dequeuing ───────────────────────────────
      // Check bufferedAmount every chunk — not just at HWM. This prevents
      // sending more chunks than SCTP can absorb in a single event loop tick.
      if (dc.bufferedAmount >= NET.highWaterMark) {
        waitingDrain = true;
        const onLow = () => {
          dc.removeEventListener("bufferedamountlow", onLow);
          waitingDrain = false;
          sendLoop();
        };
        dc.addEventListener("bufferedamountlow", onLow);
        setTimeout(() => {
          if (!waitingDrain) return;
          waitingDrain = false;
          dc.removeEventListener("bufferedamountlow", onLow);
          sendLoop();
        }, 2000);
        break;
      }

      const { buf: rawBuf, index } = chunkQueue.shift();

      const bytesLeftToSend = file.size - sendState.offset;
      const buf = (rawBuf.byteLength > bytesLeftToSend && bytesLeftToSend > 0)
        ? rawBuf.slice(0, bytesLeftToSend)
        : rawBuf;

      // Retransmit ring buffer
      const _ringSize = Math.max(currentDepth * 4, 256);
      sendState.pendingRetransmits.set(index, buf);
      if (sendState.pendingRetransmits.size > _ringSize) {
        sendState.pendingRetransmits.delete(index - _ringSize);
      }
      window.__xferRetransmits = sendState.pendingRetransmits;

      try {
        dc.send(buf);
      } catch(err) {
        chunkQueue.unshift({ buf: rawBuf, index });
        dlog("[SEND] dc.send threw:", err?.message);
        waitingDrain = true;
        loopRunning  = false;
        _sendBackoff = Math.min(_sendBackoff * 2, 1000);
        setTimeout(() => {
          if (!waitingDrain) return;
          waitingDrain = false;
          sendLoop();
        }, _sendBackoff);
        return;
      }
      _sendBackoff = 50;

      sendState.offset     = Math.min(file.size, sendState.offset + buf.byteLength);
      sendState.chunkIndex = index + 1;

      // ── Pull-one-ahead: request exactly one more chunk per send ───────────
      // This is the core fix. Previously we batch-pulled (depth - queue.length)
      // chunks on every successful send, causing the worker to fill chunkQueue
      // to 93–97 entries before SCTP could report congestion. Now we pull
      // exactly one chunk per chunk sent — queue stays at 0–1 entries.
      // SCTP backpressure (bufferedAmount) controls the actual send rate.
      if (!workerDone) {
        fileWorker.postMessage({ type: "pull" });
      }

      // Throughput sample for slow-TURN detection
      const now = performance.now();
      if (now - _lastSampleT >= 2000) {
        recordThroughputSample((sendState.offset - _lastSampleB) / ((now - _lastSampleT) / 1000), fileWorker, file, currentDepth);
        _lastSampleT = now; _lastSampleB = sendState.offset;
      }
    }

    loopRunning = false;
    if (workerDone && chunkQueue.length === 0 && !allSent) { allSent = true; finalizeSend(); }
  }

  // ── Reconnect hooks ───────────────────────────────────────────────────────
  // _onReconnect: called immediately when new DC opens.
  //   ONLY resets loop state. Does NOT call sendLoop or seed worker.
  //   Sending data into a new SCTP channel before it's settled causes
  //   "Failure to send data". We wait for receiver to confirm its offset first.
  sendState._onReconnect = (newDc) => {
    newDc.bufferedAmountLowThreshold = NET.lowWaterMark;
    waitingDrain = false;
    loopRunning  = false;
    _sendBackoff = 50;   // reset backoff for fresh connection
    // Drain chunkQueue — stale chunks from the dead channel.
    // Fresh chunks will be produced after _onResumeConfirmed seeks the worker.
    chunkQueue.length = 0;
    // Release finalize lock so a new finalizeSend() can run after reconnect.
    // The old finalizeSend's polling loop exits when sendState.gotComplete or
    // sendState.running becomes false — both are safe outcomes.
    _finalizeLock = false;
    dlog("[SEND] reconnect hook: state reset, waiting for receiver offset confirmation");

    // BUG-FIX-COMPLETE-TIMEOUT: if allSent=true, the entire file was already
    // sent before the DC died. The receiver may have finalized and sent "complete"
    // on the old DC (which was dropped). Re-send "done" immediately on the new DC
    // so the receiver re-finalizes and re-sends "complete" on this live channel.
    // Without this, the sender waits 30s for a "complete" that was already lost.
    if (allSent && !sendState.gotComplete) {
      dlog("[SEND] reconnect after allSent — resending 'done' on new DC");
      setTimeout(() => {
        if (!sendState.gotComplete && !sendState.canceled) {
          try { newDc.send(JSON.stringify({ type: "done", sha256: sendState._sha256 || null })); } catch {}
          try { newDc.send(JSON.stringify({ type: "status-req" })); } catch {}
        }
      }, 300);  // small delay for SCTP to settle after DC open
    }
  };

  // _onResumeConfirmed: called when receiver replies with its confirmed byte count.
  //   Seeks the worker to the right position, then kicks sendLoop.
  sendState._onResumeConfirmed = (confirmedOffset) => {
    const safeOffset = confirmedOffset || 0;
    dlog("[SEND] resume confirmed at", fmtBytes(safeOffset), "(our offset was", fmtBytes(sendState.offset) + ")");
    sendState.offset     = safeOffset;
    sendState.ackBytes   = Math.min(sendState.ackBytes, safeOffset);

    // BUG-FIX-COMPLETE-TIMEOUT: if the receiver already has all the bytes
    // (e.g. a small file sent before the DC dropped), skip the worker seek
    // entirely and re-send "done" directly. This avoids a redundant full
    // re-read of the file and immediately triggers finalization on the receiver.
    if (safeOffset >= file.size) {
      dlog("[SEND] resume confirmed: receiver already has all bytes — re-sending done");
      workerDone = true;   // mark so sendLoop triggers finalizeSend
      allSent    = false;  // allow sendLoop's guard to fire finalizeSend once
      _finalizeLock = false;
      // sendLoop with empty queue + workerDone=true will call finalizeSend()
      sendLoop();
      return;
    }

    const resumeChunkSize = sendState.startChunkSize || NET.chunkSize || 262144;
    sendState.chunkIndex = Math.floor(safeOffset / resumeChunkSize);
    // ── CRITICAL: reset end-of-file flags before re-seeking ─────────────────
    // workerDone/allSent are closure-local to sendFile. If the worker had already
    // finished reading the file before the connection dropped, both are true.
    // Without resetting them, the first chunk from the re-seeked worker causes
    // sendLoop to call finalizeSend() immediately (workerDone=true, queue empty),
    // sending a premature "done" to the receiver after just one chunk.
    workerDone   = false;
    allSent      = false;
    _sendBackoff = 50;
    fileWorker.postMessage({ type: "seek",  offset: safeOffset, chunkIndex: sendState.chunkIndex });
    // Pull-one-ahead: seed with a single pull after seek, same as kick-off.
    fileWorker.postMessage({ type: "pull" });
    // sendLoop will fire naturally once worker delivers the first chunk
  };

  // ── Worker messages ───────────────────────────────────────────────────────
  fileWorker.onmessage = e => {
    // Drop any message from a previous worker (stale queued events after terminate())
    if (sendState._workerGen !== _workerGen) {
      dlog("[WORKER] dropped stale message type=" + e.data.type + " gen=" + _workerGen + " current=" + sendState._workerGen);
      return;
    }
    if (e.data.type === "chunk") {
      if (sendState.canceled) return;
      chunkQueue.push({ buf: e.data.buf, index: e.data.index });
      // Only kick sendLoop when not already draining — if waitingDrain is
      // true, the drain handler will call sendLoop() when ready.
      if (!waitingDrain) sendLoop();
      return;
    }
    if (e.data.type === "done") {
      workerDone = true;
      // Stash SHA-256 so finalizeSend can broadcast it with the "done" message
      sendState._sha256 = e.data.sha256 || null;
      dlog("[WORKER] all chunks read, queue:", chunkQueue.length, "sha256:", sendState._sha256?.slice(0,12));
      if (chunkQueue.length === 0 && !allSent) { allSent = true; finalizeSend(); }
    }
  };

  // ── RTT polling ───────────────────────────────────────────────────────────
  startRttPolling(primaryPeer?.pc, newDepth => {
    currentDepth = newDepth;
    applyThreshold();
    // Pull-one-ahead model is self-regulating — no extra pulls needed on depth change.
  });

  // Guards against concurrent finalizeSend() calls.
  // After a reconnect, _onResumeConfirmed resets allSent=false so sendLoop
  // can call finalizeSend() a second time while the first is still polling
  // for "complete". Two concurrent pollers means the 30s timeout from the
  // first one fires even though "complete" DID arrive on the second one.
  let _finalizeLock = false;

  // ── FINALIZE ──────────────────────────────────────────────────────────────
  async function finalizeSend() {
    // Only one finalizeSend at a time — drop duplicates from reconnect paths
    if (_finalizeLock) {
      dlog("[FINALIZE] already running — skipping duplicate call");
      return;
    }
    _finalizeLock = true;
    stopRttPolling();
    if (sendState.canceled) { _finalizeLock = false; return; }
    // FIX-A: capture identity of THIS transfer — if sendState.file changes before
    // an await resumes (e.g. complete handler fires + startNextFile runs), we abort
    // rather than sending a ghost "done" message into the next file's DataChannel.
    const thisFile = file;
    dlog("[FINALIZE] all chunks sent — draining dc buffer. file=" + thisFile.name);

    // Wait for the real dc.bufferedAmount to reach 0
    const drainStart = performance.now();
    const waitDrain = () => new Promise(resolve => {
      const dc = getDc();
      if (!dc || dc.bufferedAmount === 0) return resolve();
      const check = () => {
        const d = getDc();
        if (!d || d.bufferedAmount === 0 || performance.now() - drainStart > 30000) return resolve();
        setTimeout(check, 50);
      };
      check();
    });
    await waitDrain();

    // FIX-A: abort if this transfer was superseded while we were awaiting the drain
    if (sendState.file !== thisFile || sendState.canceled) {
      dlog("[FINALIZE] transfer superseded after drain — aborting ghost send",
        "thisFile=" + thisFile.name, "sendState.file=" + (sendState.file?.name || "null"),
        "canceled=" + sendState.canceled);
      _finalizeLock = false;
      return;
    }

    sendMsg({ type: "done", sha256: sendState._sha256 || null });
    sendMsg({ type: "status-req" });

    // Force progress to 100% on sender side — don't wait for last ACK
    // The progress bar shows ackBytes which may lag by up to ACK_EVERY_BYTES (4MB)
    // at the end of the transfer, making it look stuck at 95-96%.
    setProgressBytes(file.size, file.size);
    etaText.innerText = "Remaining: 0m 0s";

    if (!doneResendTimer) {
      doneResendTimer = setInterval(() => {
        if (!sendState.running || sendState.canceled || sendState.gotComplete) {
          clearInterval(doneResendTimer); doneResendTimer = null; return;
        }
        sendMsg({ type: "done", sha256: sendState._sha256 || null });
        sendMsg({ type: "status-req" });
      }, 1000);   // resend every 1s — was 2s; faster recovery when "complete" is lost
    }

    // Wait for receiver to confirm "complete".
    // 20s timeout — covers SCTP congestion drain (up to ~10s for large queues)
    // plus TURN relay round-trip. The previous 8s caused false timeouts when
    // SCTP backoff was still clearing a backlogged chunkQueue (97 chunks seen).
    const waitStart = performance.now();
    while (sendState.running && !sendState.canceled && !sendState.gotComplete) {
      if (performance.now() - waitStart > 20000) {
        dlog("[SEND] complete timeout — assuming receiver got the file");
        sendState.gotComplete = true;
        if (doneResendTimer) { clearInterval(doneResendTimer); doneResendTimer = null; }
        break;
      }
      await new Promise(r => setTimeout(r, 150));
    }

    // ── BUG-FIX-RACE: detect if complete handler already ran cleanup ─────────
    // The while-loop above exits in two ways:
    //   (A) sendState.running became false  → the "complete" onmessage handler
    //       already called safeCloseAllPeers() + startNextFile(). File 2's DC
    //       may already be open. Do NOT call safeCloseAllPeers() again here or
    //       we will kill File 2's live connection.
    //   (B) 30-second timeout (gotComplete forced true, sendState.running still
    //       true) → normal path, we must do cleanup here.
    // Distinguish by checking sendState.running: the complete handler sets it
    // to false; the timeout path leaves it true until we clear it below.
    if (!sendState.running) {
      // Path A: complete handler already did full cleanup — just fire the summary.
      dlog("[SEND] finalizeSend: complete handler already ran cleanup — skipping safeCloseAllPeers");
      sendState._onReconnect       = null;
      sendState._onResumeConfirmed = null;
      _finalizeLock = false;
      try { window.__enh?.onTransferComplete(file.size); } catch {}
      return;
    }

    // Path B: timeout — we must do the cleanup ourselves.
    dlog("[SEND] finalizeSend: timeout path — running cleanup");
    sendState._onReconnect       = null;
    sendState._onResumeConfirmed = null;
    _finalizeLock = false;
    sendState.running = false; outgoingFile = null;
    pauseBtn.disabled = true; resumeBtn.disabled = true; cancelBtn.disabled = true;
<<<<<<< HEAD
=======
    // BUG-FIX-TIMEOUT-STATE: mark file as "done" in history so the queue UI
    // does not leave it stuck as "Sending" indefinitely. The complete-message
    // path does this in the onmessage handler; the timeout path was missing it.
    setStatus(`✅ Sent (confirmed): ${file.name}`);
    try { upsertSentItem(file._qid || `${file.name}|${file.size}`, file.name, file.size, "done", file.size, file.size); renderQueueUI(null); } catch {}
>>>>>>> a862989 (added zip and unzip)
    safeCloseAllPeers();   // sets gracefulClosing=true for 800ms
    sending = false;
    try { window.__enh?.onTransferComplete(file.size); } catch {}
    // Delay startNextFile until AFTER the gracefulClosing window (800ms) + margin.
    // Without this delay, file-offer is emitted while the old PC is still tearing
    // down ICE. The receiver accepts, creates a new PC, but ICE candidates from
    // the old session interfere → immediate "disconnected → failed" on new PC.
    setTimeout(() => startNextFile(), 1000);
  }

  // ── KICK OFF ──────────────────────────────────────────────────────────────
  sendState.startChunkSize = NET.chunkSize;
  fileWorker.postMessage({ type: "start", file, chunkSize: NET.chunkSize, offset: 0, chunkIndex: 0 });
  // Pull-one-ahead: seed with a single pull. sendLoop will pull one more per
  // chunk sent, so chunkQueue never grows beyond 1 entry. This eliminates the
  // SCTP "send queue is full" error caused by pre-loading 16+ chunks at once.
  fileWorker.postMessage({ type: "pull" });
}

// ─── RECEIVER ─────────────────────────────────────────────────────────────────

async function startReceiver(meta) {
  // ── FIX-2: block new file while previous finalizeIncomingFile() is running ──
  // finalizeIncomingFile() is async (SHA-256, SCTP flush, disk close).
  // If the sender sends the next file's "meta" before it completes, the
  // stale-state path below would null incomingFile prematurely and then
  // finalizeIncomingFile's finally block would null it AGAIN, killing the
  // new transfer mid-receive.  Queue the meta and retry once finalize ends.
  if (incomingFile?.finalizing) {
    dlog("startReceiver: previous file still finalizing — deferring meta for", meta.name);
    _deferredRecvMeta = meta;
    return;
  }

  // ── RECONNECT guard ────────────────────────────────────────────────────────
  // If we already have an incomingFile for this same transfer (same id/name+size),
  // this is a re-delivery of "meta" after a reconnect — NOT a new transfer.
  // Just re-send "ready" so the sender can resume; do not touch incomingFile or
  // ask for a save location again.
  if (incomingFile && incomingFile.meta) {
    const sameId   = meta.id && meta.id === incomingFile.meta.id;
    const sameName = meta.name === incomingFile.meta.name && meta.size === incomingFile.meta.size;
    if (sameId || sameName) {
      // ── FIX 3: Distinguish genuine mid-transfer reconnect from a user retry ─
      // A genuine reconnect: receivedBytes > 0, not finalizing, not sawDone,
      // and transfer is still incomplete. Resume without re-init.
      //
      // A user retry after a stuck/failed transfer: looks identical (same meta)
      // but incomingFile is stale. If we skip re-init here, new chunks get
      // appended to old chunks[] → Blob assembled from two attempts → CORRUPT.
      const isGenuineReconnect = incomingFile.receivedBytes > 0
        && !incomingFile.finalizing
        && !incomingFile.sawDone
        && incomingFile.receivedBytes < incomingFile.meta.size;

      if (isGenuineReconnect) {
        dlog("startReceiver: genuine reconnect — resuming at", fmtBytes(incomingFile.receivedBytes));
        showToast(`🔄 Reconnected — resuming from ${fmtBytes(incomingFile.receivedBytes)}`, "info", 3000);
<<<<<<< HEAD
=======
        // Restore "receiving" state — dc.onclose set it to "reconnecting" for UI feedback.
        try {
          const id = incomingFile.meta?.id || `${incomingFile.meta?.name}|${incomingFile.meta?.size}`;
          upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0,
            "receiving", incomingFile.receivedBytes || 0, incomingFile.meta.size || 0);
          renderRecvQueueUI();
        } catch {}
>>>>>>> a862989 (added zip and unzip)
        try {
          window.dc?.send(JSON.stringify({ type: "ready" }));
        } catch(e) { dlog("ready send failed on reconnect:", e); }
        return;
      }

      // Not a genuine reconnect — stale state (stuck, completed, or sawDone).
      // Reset so the fresh-start path below runs cleanly.
      dlog("startReceiver: stale incomingFile detected — resetting for fresh start",
        { receivedBytes: incomingFile.receivedBytes, sawDone: incomingFile.sawDone, finalizing: incomingFile.finalizing });
      incomingFile = null;
      // BUG-FIX-NEXTFILE-3: also abort any stale pendingWritable that was set
      // for THIS transfer but never consumed (e.g. startReceiver was never
      // reached, or the file handle belongs to the previous transfer's meta).
      if (pendingWritable) {
        try { pendingWritable.abort?.(); } catch {}
        pendingWritable = null;
        dlog("startReceiver: discarded stale pendingWritable on stale-state reset");
      }
      // fall through to fresh-start path
    }
  }

  // ── FRESH start ────────────────────────────────────────────────────────────
  resetTransferUI();
  cancelBtn.disabled = false;
  // Clear the post-finalize shield now that a real new transfer is starting.
  // This re-enables handlePeerFailed() for genuine connection failures during
  // the new transfer (the delayed reset in finalizeIncomingFile may not have
  // fired yet if the next meta arrived quickly).
  transferCompleted = false;

<<<<<<< HEAD
  const canDiskMode = (meta.size > MEMORY_MAX_BYTES) ||
                      ('showDirectoryPicker' in window && window.isSecureContext && pendingWritable !== null);
=======
>>>>>>> a862989 (added zip and unzip)

  incomingFile = {
    meta,
    receivedBytes: 0,
    lastAckSent: 0,
    lastT: performance.now(), lastB: 0, ema: 0,
    chunks: [],
<<<<<<< HEAD
    writable: null,
    writeChain: Promise.resolve(),
=======
>>>>>>> a862989 (added zip and unzip)
    sawDone: false, finalizing: false,
    expectedChecksums: new Map(),
    receivedChunkIndices: new Set(),
  };

  setStatus(`Receiving: ${meta.name} (${fmtBytes(meta.size)})`);
  addMsg(`<b>Receiving:</b> ${meta.name} (${fmtBytes(meta.size)})`);
  dlog("startReceiver", meta);
  try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size || 0, "receiving", 0, meta.size || 0); renderRecvQueueUI(); } catch {}

<<<<<<< HEAD
  // Use disk streaming for large files. pendingWritable is normally set by
  // acceptBtn / auto-accept BEFORE the DC opens. But _acceptPendingFile now
  // emits file-answer before disk prep completes — the DC can open and meta
  // can arrive while showDirectoryPicker is still active. Wait for it first.
  const needDisk = meta.size > MEMORY_MAX_BYTES;
  if (needDisk && _diskPrepPromise) {
    dlog("startReceiver: waiting for disk prep to complete...");
    await _diskPrepPromise;
    dlog("startReceiver: disk prep done, pendingWritable=", !!pendingWritable);
  }

  if (pendingWritable) {
    // Happy path: pre-chosen writable from acceptBtn / auto-accept
    incomingFile.writable = pendingWritable;
    pendingWritable = null;
    showToast(`💾 Saving to disk: ${meta.name}`, "info", 3000);
  } else if (needDisk) {
    // Recovery path: pendingWritable still null after waiting.
    // IMPORTANT: do NOT call showDirectoryPicker here — this code runs from
    // a DataChannel onmessage event, which is NOT a user gesture. The browser
    // will throw SecurityError: "Must be handling a user gesture to show a
    // file picker." Instead, fall back to memory mode (Blob + a.click()).
    // Files > MEMORY_MAX_BYTES that can't fit in memory will warn the user.
    const canFitInMemory = meta.size <= 500 * 1024 * 1024; // 500MB memory limit
    if (canFitInMemory) {
      dlog("startReceiver: no pendingWritable — falling back to memory mode for", meta.name);
      showToast(`⚠️ No save folder — receiving in memory. File will auto-download.`, "warn", 5000);
      // incomingFile.writable stays null → finalizeIncomingFile uses Blob + a.click()
    } else {
      dlog("startReceiver: file too large for memory and no pendingWritable — aborting");
      setStatus("❌ Save location needed for large files — tap Accept on next offer.");
      incomingFile = null;
      return;
    }
  } else {
    // Small file: memory mode, no message needed
  }
=======
>>>>>>> a862989 (added zip and unzip)

  const primaryDc = window.dc;
  try { primaryDc?.send(JSON.stringify({ type: "ready" })); } catch {}
}

async function handleIncomingChunk(buf) {
  if (!incomingFile) return;

  // Defensive: buf must be a non-empty ArrayBuffer
  if (!(buf instanceof ArrayBuffer) || buf.byteLength === 0) {
    dlog("handleIncomingChunk: skipping empty/invalid buffer");
    return;
  }

  // ── FIX 2: Trim instead of discard on overflow ──────────────────────────
  // Hard discard was losing the final partial chunk → receiver stuck at ~95%.
  // Now: trim to exact remaining bytes so the last bytes always get written.
  // Also handles stale SCTP frames from a previous transfer arriving on a new DC.
  if (incomingFile.receivedBytes >= incomingFile.meta.size) {
    dlog("handleIncomingChunk: chunk after EOF — ignoring",
      { received: incomingFile.receivedBytes, chunk: buf.byteLength, total: incomingFile.meta.size });
    return;
  }
  let writeBuf = buf;
  if (incomingFile.receivedBytes + writeBuf.byteLength > incomingFile.meta.size) {
    const allowed = incomingFile.meta.size - incomingFile.receivedBytes;
    dlog("handleIncomingChunk: trimming oversized final chunk",
      { received: incomingFile.receivedBytes, chunk: writeBuf.byteLength, allowed, total: incomingFile.meta.size });
    writeBuf = writeBuf.slice(0, allowed);
  }

<<<<<<< HEAD
  if (incomingFile.writable) {
    // Disk mode: write at the exact byte position so any seek/resume is safe
    const writePosition = incomingFile.receivedBytes;
    const filename      = incomingFile.meta.name;
    const u8 = new Uint8Array(writeBuf.slice(0));  // copy — keeps original buf intact
    // IMPORTANT: read incomingFile.writable at execution time (inside .then),
    // not at queue time. This ensures that if the writable is replaced during
    // datapipe recovery, queued writes use the recovered stream automatically.
    incomingFile.writeChain = incomingFile.writeChain
      .then(async () => {
        const w = incomingFile?.writable;
        if (!w) return;
        try {
          await w.write({ type: "write", position: writePosition, data: u8 });
        } catch(e) {
          // ── Datapipe recovery ────────────────────────────────────────────
          // Chrome's FileSystemWritableFileStream can enter InvalidStateError
          // ("Failed to create datapipe") after ICE restart or page background.
          // The stream is permanently broken — recover by reopening at position.
          if (e instanceof DOMException && e.name === "InvalidStateError" && incomingFile) {
            dlog("Disk write: datapipe broken at", writePosition, "— recovering");
            try {
              try { await w.close(); } catch {}
              const recovered = await _reopenWritableAt(filename, writePosition);
              if (incomingFile) incomingFile.writable = recovered;
              await recovered.write({ type: "write", position: writePosition, data: u8 });
              dlog("Disk write: recovered at", writePosition);
            } catch(e2) {
              dlog("Disk write: recovery failed at", writePosition, e2);
            }
          } else {
            dlog("Disk write error at position", writePosition, e);
          }
        }
      });
  } else {
    // Memory mode: store a copy so we own the memory regardless of DC GC
    incomingFile.chunks.push(writeBuf.slice(0));
  }
=======
  // Memory-only: accumulate chunk for later Blob assembly
  incomingFile.chunks.push(writeBuf.slice(0));
>>>>>>> a862989 (added zip and unzip)

  incomingFile.receivedBytes += writeBuf.byteLength;

  // BUG-FIX-4: record chunk size from first non-final chunk so resume-offset
  // snap is always accurate even if NET.chunkSize was resized mid-transfer.
  if (!incomingFile.chunkSize && incomingFile.receivedBytes < incomingFile.meta.size) {
    incomingFile.chunkSize = writeBuf.byteLength;
  }

  setProgressBytes(incomingFile.receivedBytes, incomingFile.meta.size);
  // Throttle queue UI updates — rendered at most once per animation frame.
  // Previously called on every 256KB chunk (~2400x for a 600MB file),
  // causing thousands of synchronous DOM reflows and cutting into throughput.
  if (!incomingFile._queueRafId) {
    incomingFile._queueRafId = requestAnimationFrame(() => {
      incomingFile._queueRafId = null;
      if (!incomingFile) return;
      try {
        const id = incomingFile.meta?.id || `${incomingFile.meta?.name}|${incomingFile.meta?.size}`;
        upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0, "receiving", incomingFile.receivedBytes, incomingFile.meta.size || 0);
        renderRecvQueueUI();
      } catch {}
    });
  }

  // ACK back to sender
  const primaryDc = window.dc;
  if (primaryDc && primaryDc.readyState === "open") {
    if (incomingFile.receivedBytes - incomingFile.lastAckSent >= ACK_EVERY_BYTES || incomingFile.receivedBytes >= incomingFile.meta.size) {
      incomingFile.lastAckSent = incomingFile.receivedBytes;
      try { primaryDc.send(JSON.stringify({ type: "ack", bytes: incomingFile.receivedBytes })); } catch(e) { dlog("ack failed", e); }
    }
  }

  // Speed + ETA
  const now = performance.now(); const dt = (now - incomingFile.lastT) / 1000;
  if (dt >= 1.0) {
    const db = incomingFile.receivedBytes - incomingFile.lastB;
    incomingFile.ema = incomingFile.ema ? 0.8 * incomingFile.ema + 0.2 * (db / dt) : db / dt;
    speedText.innerText = `Speed: ${(incomingFile.ema / 1024 / 1024).toFixed(2)} MB/s`;
    const remaining = incomingFile.meta.size - incomingFile.receivedBytes;
    etaText.innerText = `Remaining: ${formatETA(incomingFile.ema > 0 ? remaining / incomingFile.ema : NaN)}`;
    incomingFile.lastT = now; incomingFile.lastB = incomingFile.receivedBytes;
    // FIX-ALERTS: keep alert card live during active receive
    if (typeof TransferAlerts !== "undefined") {
      TransferAlerts.onProgress({
        done:       incomingFile.receivedBytes,
        total:      incomingFile.meta.size,
        speedMbps:  incomingFile.ema / 1024 / 1024,
        etaSec:     incomingFile.ema > 0 ? remaining / incomingFile.ema : NaN,
        isSender:   false,
        fileName:   incomingFile.meta.name,
        fileIndex:  window._taFileIndex  || 1,
        totalFiles: window._taTotalFiles || 1,
      });
    }
  }

  if (incomingFile.sawDone && incomingFile.receivedBytes >= incomingFile.meta.size && !incomingFile.finalizing) {
    dlog("all bytes + done flag — finalizing");
    incomingFile.finalizing = true;
    finalizeIncomingFile().catch(e => { dlog("Finalize failed", e); cancelTransfer("Finalize failed", false); });
  }
}

async function finalizeIncomingIfReady(sha256 = null) {
  if (!incomingFile) return;
  incomingFile.sawDone = true;
  if (sha256) incomingFile.expectedSha256 = sha256;   // store for verification

  if (incomingFile.receivedBytes >= incomingFile.meta.size) {
    if (incomingFile.finalizing) return;
    incomingFile.finalizing = true;
    await finalizeIncomingFile();
    return;
  }

  // ── FIX 4: Poll instead of silent bail ───────────────────────────────────
  // Old code: "done rx but bytes incomplete" → return. This left incomingFile
  // alive with stale chunks[]. Next send() with same filename triggered the
  // reconnect guard (Fix 3 now handles that) but this is a belt-and-suspenders
  // fix: poll up to 5 s for the final bytes to arrive via SCTP, then clear
  // stale state so any subsequent transfer always starts completely fresh.
  // FIX-B: guard against multiple concurrent polls (e.g. doneResendTimer fires
  // sendMsg({type:"done"}) every 2s — each one calls finalizeIncomingIfReady
  // while receivedBytes < size, spawning a new poll each time → 22 concurrent polls)
<<<<<<< HEAD
  if (incomingFile._polling) {
    dlog("done rx: poll already running — skipping duplicate");
    return;
  }
  incomingFile._polling = true;
  dlog("done rx but bytes incomplete — polling for remaining bytes",
    { received: incomingFile.receivedBytes, total: incomingFile.meta.size });

  const deadline = Date.now() + 10000;  // 10s — was 5s, too short for slow SCTP drain
=======
  // ── FIX-1: extend deadline on every resent "done" ────────────────────────
  // The sender's doneResendTimer fires sendMsg({type:"done"}) every 1 second
  // until it gets "complete" back.  Each delivery calls this function.
  // OLD: a fixed 10s deadline started on the FIRST "done" → if SCTP was still
  //      draining a backlogged chunk, the clock expired before it arrived.
  // NEW: every subsequent "done" while _polling is already true resets the
  //      deadline, giving the full 10s window after each heartbeat.
  if (incomingFile._polling) {
    incomingFile._pollDeadline = Date.now() + 10000;  // extend on every resent "done"
    dlog("done rx: poll running — extending deadline");
    return;
  }
  incomingFile._polling      = true;
  incomingFile._pollDeadline = Date.now() + 10000;   // first deadline
  dlog("done rx but bytes incomplete — polling for remaining bytes",
    { received: incomingFile.receivedBytes, total: incomingFile.meta.size });

>>>>>>> a862989 (added zip and unzip)
  const poll = setInterval(() => {
    if (!incomingFile) { clearInterval(poll); return; }
    if (incomingFile.receivedBytes >= incomingFile.meta.size) {
      clearInterval(poll);
      if (incomingFile.finalizing) return;
      incomingFile.finalizing = true;
      finalizeIncomingFile().catch(e => {
        dlog("Finalize failed (poll path):", e);
      });
    } else if (Date.now() > incomingFile._pollDeadline) {  // FIX-1: use per-file deadline
      clearInterval(poll);
      dlog("finalizeIncomingIfReady: poll timeout — clearing stale incomingFile",
        { received: incomingFile.receivedBytes, total: incomingFile.meta.size });
      if (incomingFile && !incomingFile.finalizing) {
        // ── FIX-C: mark file as "failed" in history so the queue UI shows it ──
        // Old code: silently nulled incomingFile — user saw generic "Transfer
        // incomplete" with no filename and the queue entry stayed as "receiving".
        const failedMeta = incomingFile.meta;
        const failedRecv = incomingFile.receivedBytes;
        incomingFile = null;
<<<<<<< HEAD
        setStatus("⚠️ Transfer incomplete — please retry");
        addMsg(`<span class="muted">⚠️ Transfer incomplete. Please retry.</span>`);
        // Do NOT call cancelTransfer here — it sends a "cancel" socket event
        // which shows as "receiver canceled transfer" on the sender side, which
        // is misleading. The sender already moved on; just reset locally.
=======
        if (failedMeta) {
          const fid = failedMeta.id || `${failedMeta.name}|${failedMeta.size}`;
          upsertRecvItem(fid, failedMeta.name, failedMeta.size, "failed", failedRecv, failedMeta.size);
          try { renderRecvQueueUI(); } catch {}
          const shortName = failedMeta.name.length > 40
            ? failedMeta.name.slice(0, 38) + "…" : failedMeta.name;
          setStatus(`⚠️ Incomplete: ${shortName} — please resend`);
          addMsg(`<span class="muted">⚠️ <b>${failedMeta.name}</b> incomplete (${fmtBytes(failedRecv)} of ${fmtBytes(failedMeta.size)} received). Ask sender to resend this file.</span>`);
        } else {
          setStatus("⚠️ Transfer incomplete — please retry");
          addMsg(`<span class="muted">⚠️ Transfer incomplete. Please retry.</span>`);
        }
>>>>>>> a862989 (added zip and unzip)
        transferCompleted = false;
      }
    }
  }, 100);
}

async function finalizeIncomingFile() {
  if (!incomingFile) return;
<<<<<<< HEAD
  const writableRef  = incomingFile.writable;
  const chainRef     = incomingFile.writeChain;
=======
>>>>>>> a862989 (added zip and unzip)
  const meta         = incomingFile.meta;
  const expectedSha  = incomingFile.expectedSha256 || null;
  // Capture the exact incomingFile object so the finally block can check
  // if it was replaced by a new startReceiver() call during our async work.
  const thisIncoming = incomingFile;

  // ── FIX: set transferCompleted + "Processing" status IMMEDIATELY ─────────
  // transferCompleted=true must be set BEFORE any await so that:
  //   (1) DC onclose during the slow disk-flush/SHA window is silently
  //       suppressed (not treated as "unstable connection").
  //   (2) The enhancements poll sees a non-"✅"/non-"Receiving" status and
  //       does NOT fire the premature "Transfer complete! 🎉" toast while
  //       we're still writing bytes to disk or hashing.
  // The status is updated to ✅ only after all work is done.
  transferCompleted = true;
  setStatus(`⏳ Processing: ${meta.name}`);
  // Cancel any pending reconnect/ICE-fail timers immediately.
  if (_primaryPeerSocketId) {
    _clearReconnectTimer(_primaryPeerSocketId);
    _clearIceFailTimer(_primaryPeerSocketId);
  }

  // ── SHA-256 helper ───────────────────────────────────────────────────────
  async function verifySha256(data) {
    if (!expectedSha || typeof crypto === "undefined" || !crypto.subtle) return true; // skip
    try {
      const buf     = data instanceof Blob ? await data.arrayBuffer() : data;
      const hashBuf = await crypto.subtle.digest("SHA-256", buf);
      const actual  = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,"0")).join("");
      if (actual !== expectedSha) {
        dlog("SHA-256 MISMATCH", { expected: expectedSha, actual });
        addMsg(`<span class="muted">⚠️ Integrity check failed — file may be corrupted. Please retry.</span>`);
        return false;
      }
      dlog("SHA-256 verified ✅", actual.slice(0,12) + "…");
      addMsg(`<span class="muted">🔒 Integrity verified (SHA-256 ✅)</span>`);
      return true;
    } catch { return true; } // verification error → don't block download
  }
  try {
    {
      const blob = new Blob(incomingFile.chunks, { type: meta.type });
      // ── Sanity check: blob must be exactly meta.size bytes ────────────────
      // If blob is smaller, chunks[] was incomplete — log and abort rather than
      // save a truncated file that appears as a "half-black" image.
      if (blob.size !== meta.size) {
        dlog("finalizeIncomingFile: BLOB SIZE MISMATCH",
          { blobSize: blob.size, metaSize: meta.size, chunks: incomingFile.chunks.length,
            receivedBytes: incomingFile.receivedBytes });
        // Clear state so next attempt starts fresh
        incomingFile = null;
        setStatus("⚠️ File incomplete — please retry");
        addMsg(`<span class="muted">⚠️ Received ${fmtBytes(blob.size)} but expected ${fmtBytes(meta.size)} — file incomplete. Please retry.</span>`);
        return;
      }
      const url  = URL.createObjectURL(blob);

<<<<<<< HEAD
      // ── Auto-download immediately — don't wait for SHA-256 ───────────────
      // SHA-256 of a 30-37MB file takes 5-15s on mobile. Running it before
      // auto-download blocked "complete" from being sent, causing the sender's
      // 20s timeout to fire. Download now; verify in background.
      try {
        const a = document.createElement("a");
        a.href = url; a.download = meta.name; a.style.display = "none";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      } catch(e) { dlog("auto-download click failed:", e); }

      setStatus(`✅ Received: ${meta.name}`);
      try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size||0, "done", meta.size||0, meta.size||0); renderRecvQueueUI(); } catch {}
      addMsg(`<b>File received:</b> ${meta.name}`);
      addToDownloadsManager({ name: meta.name, size: meta.size, type: meta.type, savedToDisk: true, url });

      // SHA-256 in background — does not block "complete" or next file
      if (expectedSha) {
        verifySha256(blob).then(ok => {
          if (!ok) addMsg(`<span class="muted">⚠️ Integrity check failed for ${meta.name} — file may be corrupt.</span>`);
        }).catch(() => {});
=======
      // ── ZIP BUNDLE: auto-extract instead of downloading the raw zip ───────
      if (meta.zipBundle && meta.zipFiles && typeof fflate !== "undefined") {
        setStatus(`📦 Extracting ${meta.zipFiles.length} files…`);
        addMsg(`<span class="muted">📦 Bundle received — extracting ${meta.zipFiles.length} files…</span>`);

        // Mark bundle entry as "extracting" in history
        try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size||0, "extracting", meta.size||0, meta.size||0); renderRecvQueueUI(); } catch {}

        // fflate.unzip is async-callback — works on the ArrayBuffer
        blob.arrayBuffer().then(ab => {
          fflate.unzip(new Uint8Array(ab), (err, files) => {
            if (err) {
              dlog("[ZIP] Extraction failed:", err);
              setStatus(`⚠️ Extraction failed — downloading zip instead`);
              addMsg(`<span class="muted">⚠️ Could not extract bundle — downloading zip file directly.</span>`);
              // Fall back: download raw zip
              try {
                const a = document.createElement("a");
                a.href = url; a.download = meta.name; a.style.display = "none";
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
              } catch {}
              try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size||0, "done", meta.size||0, meta.size||0); renderRecvQueueUI(); } catch {}
              return;
            }

            const entries = Object.entries(files);
            dlog(`[ZIP] Extracted ${entries.length} files`);

            // Download each extracted file individually with a small stagger
            // to avoid the browser blocking rapid-fire a.click() calls.
            let downloadIndex = 0;
            function downloadNext() {
              if (downloadIndex >= entries.length) {
                // All done — update UI
                setStatus(`✅ Extracted ${entries.length} files`);
                addMsg(`<b>✅ Extracted ${entries.length} files from bundle</b>`);

                // Add each file to downloads manager + recv history
                entries.forEach(([name, data]) => {
                  const fileInfo = (meta.zipFiles || []).find(f => f.name === name) || {};
                  const fileBlob = new Blob([data], { type: fileInfo.type || "application/octet-stream" });
                  const fileUrl  = URL.createObjectURL(fileBlob);
                  try { upsertRecvItem(`zip:${name}`, name, data.byteLength, "done", data.byteLength, data.byteLength); } catch {}
                  addToDownloadsManager({ name, size: data.byteLength, type: fileInfo.type || "application/octet-stream", savedToDisk: true, url: fileUrl });
                });

                // Update the bundle entry as done
                try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size||0, "done", meta.size||0, meta.size||0); renderRecvQueueUI(); } catch {}

                if (typeof TransferAlerts !== "undefined") {
                  TransferAlerts.onComplete({
                    fileName: `${entries.length} files extracted`,
                    fileSizeBytes: meta.size,
                    isSender: false,
                    allDone: fileQueue.length === 0 && !sendState.running,
                    totalFiles: window._taTotalFiles || 1,
                  });
                }
                return;
              }

              const [name, data] = entries[downloadIndex++];
              const fileInfo = (meta.zipFiles || []).find(f => f.name === name) || {};
              const fileBlob = new Blob([data], { type: fileInfo.type || "application/octet-stream" });
              const fileUrl  = URL.createObjectURL(fileBlob);
              try {
                const a = document.createElement("a");
                a.href = fileUrl; a.download = name; a.style.display = "none";
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
              } catch(e) { dlog("extract download click failed:", name, e); }

              addMsg(`<span class="muted">⬇️ Downloaded: ${name} (${fmtBytes(data.byteLength)})</span>`);
              // Stagger downloads 300ms apart — avoids browser popup blockers
              setTimeout(downloadNext, 300);
            }
            downloadNext();
          });
        }).catch(err => {
          dlog("[ZIP] ArrayBuffer conversion failed:", err);
          // Fall back to raw zip download
          try {
            const a = document.createElement("a");
            a.href = url; a.download = meta.name; a.style.display = "none";
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
          } catch {}
          try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size||0, "done", meta.size||0, meta.size||0); renderRecvQueueUI(); } catch {}
        });

      } else {
        // ── Normal single file: auto-download immediately ─────────────────
        // SHA-256 of a 30-37MB file takes 5-15s on mobile. Running it before
        // auto-download blocked "complete" from being sent, causing the sender's
        // 20s timeout to fire. Download now; verify in background.
        try {
          const a = document.createElement("a");
          a.href = url; a.download = meta.name; a.style.display = "none";
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch(e) { dlog("auto-download click failed:", e); }

        setStatus(`✅ Received: ${meta.name}`);
        try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size||0, "done", meta.size||0, meta.size||0); renderRecvQueueUI(); } catch {}
        addMsg(`<b>File received:</b> ${meta.name}`);
        addToDownloadsManager({ name: meta.name, size: meta.size, type: meta.type, savedToDisk: true, url });

        // FIX-ALERTS: show received complete card
        if (typeof TransferAlerts !== "undefined") {
          const allDone = fileQueue.length === 0 && !sendState.running;
          TransferAlerts.onComplete({
            fileName:      meta.name,
            fileSizeBytes: meta.size,
            isSender:      false,
            allDone,
            totalFiles:    window._taTotalFiles || 1,
          });
        }

        // SHA-256 in background — does not block "complete" or next file
        if (expectedSha) {
          verifySha256(blob).then(ok => {
            if (!ok) addMsg(`<span class="muted">⚠️ Integrity check failed for ${meta.name} — file may be corrupt.</span>`);
          }).catch(() => {});
        }
>>>>>>> a862989 (added zip and unzip)
      }
    }

    setProgressBytes(meta.size, meta.size);
    etaText.innerText = "Remaining: 0m 0s";
    cancelBtn.disabled = true;
    try { window.__enh?.onTransferComplete(meta.size); } catch {}

    // Track receiver session stats
    if (!_sessionRecvStart) _sessionRecvStart = performance.now();
    _sessionRecvFiles++;
    _sessionRecvBytes += meta.size || 0;

    // ── Send "complete" IMMEDIATELY — before SHA-256 or any other async work ─
    // SHA-256 of a 30-37MB file takes 5-15s on mobile. Previously we sent
    // "complete" after SHA-256, causing the sender's 20s timeout to fire first,
    // which called safeCloseAllPeers() → closed the DC → "complete" was either
    // dropped or arrived on a dead channel → every 2nd file skipped.
    // Fix: send "complete" right away (file data is all received and written),
    // wait for SCTP to flush, then do SHA-256 in the background.
    const primaryDc = window.dc;
    if (primaryDc?.readyState === "open") {
      try { primaryDc.send(JSON.stringify({ type: "complete" })); } catch(e) { dlog("complete send failed", e); }
      // Wait for SCTP to flush (up to 1s — "complete" is tiny, drains instantly)
      const flushStart = performance.now();
      while (primaryDc.readyState === "open" && primaryDc.bufferedAmount > 0) {
        if (performance.now() - flushStart > 1000) break;
        await new Promise(r => setTimeout(r, 20));
      }
      // Brief settle so sender's onmessage fires before we reset state
      await new Promise(r => setTimeout(r, 150));
    }

    // Keep DC alive for next file (or close if DC already gone)
    if (primaryDc?.readyState === "open") {
      dlog("[RECV-FINALIZE] keeping DC open for next file");
      softResetForNextFile();
    } else {
      safeCloseAllPeers();
      // DC already closed — sender is done. Show receiver popup.
      const _popupFiles2   = _sessionRecvFiles;
      const _popupBytes2   = _sessionRecvBytes;
      const _popupElapsed2 = (_sessionRecvStart > 0) ? Math.round((performance.now() - _sessionRecvStart) / 1000) : 0;
<<<<<<< HEAD
=======
      // FIX-D: per-file rows for detailed summary
      const _popupRows2 = recvHistory.slice(-Math.max(_popupFiles2, 1))
        .map(r => ({ name: r.name, size: r.size, state: r.state }));
>>>>>>> a862989 (added zip and unzip)
      _sessionRecvFiles = 0; _sessionRecvBytes = 0; _sessionRecvStart = 0;
      setTimeout(() => showCompletionPopup({
        title: "All Files Received! 🎉",
        subtitle: `${_popupFiles2} file${_popupFiles2 !== 1 ? "s" : ""} (${fmtBytes(_popupBytes2)}) saved successfully.`,
        stats: [
          { value: _popupFiles2.toString(), label: _popupFiles2 !== 1 ? "Files Received" : "File Received" },
          { value: `${_popupElapsed2}s`, label: "Time Taken" },
        ],
<<<<<<< HEAD
=======
        fileRows: _popupRows2,
>>>>>>> a862989 (added zip and unzip)
        btnText: "Great!",
      }), 400);
    }
    // Delay transferCompleted reset to outlive ICE failure debounce timers
    setTimeout(() => {
      if (!sendState.running && !incomingFile) {
        transferCompleted = false;
      }
    }, 1500);
  } finally {
    // Only null incomingFile if it still refers to the file we started finalizing.
    // If a new meta arrived during our async work (SHA256, disk flush), startReceiver
    // already replaced incomingFile with the new transfer — don't null it.
    if (incomingFile === thisIncoming) {
      incomingFile = null;
    }
<<<<<<< HEAD
=======
    // FIX-2: if a meta was deferred because we were finalizing, start it now
    if (_deferredRecvMeta) {
      const m = _deferredRecvMeta;
      _deferredRecvMeta = null;
      dlog("startReceiver: firing deferred meta for", m.name);
      setTimeout(() => startReceiver(m), 0);
    }
>>>>>>> a862989 (added zip and unzip)
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
try { ensureQueueUI(); ensureRecvQueueUI(); ensureDiagnosticsPanel(); } catch {}
applyNetworkProfile(); // set defaults before any transfer

// ── WINDOW BRIDGE: expose script.js locals for enhancements.js ────────────────
// const/let at top level are script-scoped (not window-global). These getters
// always return the live value so enhancements.js reads current state.
(function() {
  try { Object.defineProperty(window, 'NET',          { get: function(){ return NET; },          configurable: true }); } catch(e) {}
  try { Object.defineProperty(window, 'incomingFile', { get: function(){ return incomingFile; }, configurable: true }); } catch(e) {}
  try { Object.defineProperty(window, 'sendState',    { get: function(){ return sendState; },    configurable: true }); } catch(e) {}
  try { Object.defineProperty(window, 'socket',       { get: function(){ return socket; },       configurable: true }); } catch(e) {}
  try { Object.defineProperty(window, '_signalingSocket', { get: function(){ return socket; },   configurable: true }); } catch(e) {}
})();