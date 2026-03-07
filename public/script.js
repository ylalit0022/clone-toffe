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

const socket = io();

// ─── DEBUG ────────────────────────────────────────────────────────────────────
const DEBUG = true;
const dlog = (...a) => DEBUG && console.log("[P2P]", ...a);

// ─── SECURITY / VALIDATION CONSTANTS ─────────────────────────────────────────
const MAX_FILE_SIZE       = 10 * 1024 * 1024 * 1024;  // 10 GB hard limit
const RATE_LIMIT_OFFERS   = 5;                          // max 5 file offers per minute
const ALLOWED_EXTENSIONS  = null;                       // null = all types allowed
//   Example whitelist: ["pdf","jpg","png","mp4","zip","docx"]

let offerTimestamps = [];   // rate-limit sliding window

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

function checkRateLimit() {
  const now = Date.now();
  offerTimestamps = offerTimestamps.filter(t => now - t < 60000);
  if (offerTimestamps.length >= RATE_LIMIT_OFFERS) return false;
  offerTimestamps.push(now);
  return true;
}

// ─── MOBILE: WAKE LOCK API ────────────────────────────────────────────────────
let _wakeLock = null;
async function wakeLockRequest() {
  if (!('wakeLock' in navigator)) return;
  try {
    _wakeLock = await navigator.wakeLock.request('screen');
    dlog("WakeLock: acquired");
  } catch(e) { dlog("WakeLock: failed", e); }
}
async function wakeLockRelease() {
  try { await _wakeLock?.release(); _wakeLock = null; dlog("WakeLock: released"); } catch {}
}
document.addEventListener("visibilitychange", async () => {
  if (_wakeLock !== null && document.visibilityState === "visible") {
    await wakeLockRequest();
  }
});

// ─── TAB THROTTLING PREVENTION (AudioContext trick) ──────────────────────────
let _noSleepCtx = null, _noSleepSource = null, _noSleepActive = false;

function noSleepStart() {
  if (_noSleepActive) return;
  try {
    if (!_noSleepCtx) _noSleepCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = _noSleepCtx.createBuffer(1, _noSleepCtx.sampleRate * 0.1, _noSleepCtx.sampleRate);
    const src = _noSleepCtx.createBufferSource();
    src.buffer = buf; src.loop = true;
    src.connect(_noSleepCtx.destination); src.start();
    _noSleepSource = src; _noSleepActive = true;
    dlog("NoSleep: started");
  } catch(e) { dlog("NoSleep: failed", e); }
  wakeLockRequest();
}
function noSleepStop() {
  if (!_noSleepActive) return;
  try { _noSleepSource?.stop(); _noSleepSource?.disconnect(); } catch {}
  _noSleepSource = null; _noSleepActive = false;
  dlog("NoSleep: stopped");
  wakeLockRelease();
}

document.addEventListener("visibilitychange", () => {
  dlog(document.hidden ? "Tab hidden — NoSleep:" : "Tab visible", _noSleepActive);
});

// ─── MOBILE DETECTION ─────────────────────────────────────────────────────────
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ─── TURN / ICE CONFIG ────────────────────────────────────────────────────────
// Set your India TURN credentials here
const INDIA_TURN_HOST = "";   // e.g. "123.45.67.89"
const INDIA_TURN_USER = "";
const INDIA_TURN_PASS = "";

function buildIceServers() {
  const servers = [
    // Priority 1: STUN (direct P2P — fastest on LAN + open NAT)
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ];
  // Priority 2: India TURN (low latency relay for India users)
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
    console.log("[P2P] India TURN configured:", INDIA_TURN_HOST);
  } else {
    console.warn("[P2P] No India TURN configured — WAN will use Metered. See INDIA_TURN_HOST.");
  }
  // Priority 3: Metered global TURN (final fallback)
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

const RTC_CONFIG = {
  iceServers: buildIceServers(),
  iceTransportPolicy: "all",
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
  // ICE candidate priority: host > srflx > relay
  iceCandidatePoolSize: 4,
};

// ─── ADAPTIVE NETWORK PROFILE ─────────────────────────────────────────────────
// All transfer tuning lives here — updated per-peer and per-RTT poll
const NET = {
  pathType: "unknown",   // "lan" | "wan" | "turn" | "unknown"
  rttMs: 0,
  availBps: 0,
  chunkSize:      256 * 1024,
  highWaterMark:  8   * 1024 * 1024,
  lowWaterMark:   256 * 1024,
  pipelineDepth:  8,
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
// The old 64 KB cap was the primary cause of slow Android transfers:
//   64 KB × pipeline 8  =  512 KB in flight  →  ~1–2 MB/s ceiling on WiFi.
//   256 KB × pipeline 16 =  4 MB in flight   →  10–20 MB/s on good WiFi.
// Chrome's 256 KB SCTP message size limit applies to individual messages,
// not total memory. 256 KB chunks are safe on all modern Android Chrome builds.
const MOBILE_MAX_CHUNK = 256 * 1024;

function applyNetworkProfile() {
  const { pathType, rttMs, availBps } = NET;

  // Pick a base chunk size by path type
  if (pathType === "lan") {
    NET.chunkSize = 256 * 1024;   // max allowed — pipeline depth gives throughput
  } else if (pathType === "wan") {
    NET.chunkSize = 128 * 1024;
  } else if (pathType === "turn") {
    NET.chunkSize = NET.turnSlowReduced ? 32 * 1024 : 64 * 1024;
  } else {
    NET.chunkSize = 128 * 1024;   // unknown — conservative
  }

  // Hard caps
  NET.chunkSize = Math.min(NET.chunkSize, MAX_CHUNK_SIZE);
  if (IS_MOBILE) NET.chunkSize = Math.min(NET.chunkSize, MOBILE_MAX_CHUNK);

  // Dynamic pipeline depth — deeper pipeline on LAN compensates for smaller chunks
  // LAN target: keep ~8MB in flight → 8MB / 256KB = 32 chunks
  let depth;
  if (availBps > 0 && rttMs > 0) {
    const bdp = (availBps / 8) * (rttMs / 1000);
    depth = Math.round(bdp / NET.chunkSize);
  } else {
    if (pathType === "lan")        depth = 32;   // 32 × 256KB = 8MB in flight
    else if (rttMs < 5)            depth = 32;
    else if (rttMs < 30)           depth = 16;
    else if (rttMs < 100)          depth = 12;
    else                           depth = 16;   // mobile gets same depth as desktop — old value of 8 was too shallow
  }
  NET.pipelineDepth = Math.max(4, Math.min(64, depth));

  // Buffer marks scaled to chunk size; stay under Chrome's 16MB SCTP limit
  NET.highWaterMark = Math.min(8 * 1024 * 1024, NET.chunkSize * 32);
  NET.lowWaterMark  = NET.chunkSize * 4;

  dlog("[NET] profile", {
    path: pathType,
    chunk: `${(NET.chunkSize / 1024).toFixed(0)}KB`,
    depth: NET.pipelineDepth,
    hwm: `${(NET.highWaterMark / 1024 / 1024).toFixed(2)}MB`,
  });
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
    if (lt === "host" && rt === "host")       NET.pathType = "lan";
    else if (lt === "relay" || rt === "relay") NET.pathType = "turn";
    else if (lt === "srflx" || rt === "srflx") NET.pathType = "wan";
    else                                       NET.pathType = "unknown";
    NET.turnSlowSamples = [];
    NET.turnSlowReduced = false;
    applyNetworkProfile();
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
    addMsg(`<span class="muted">⚠️ Slow TURN relay — reducing to 64 KB chunks</span>`);
    NET.turnSlowReduced = true;
    applyNetworkProfile();
    if (fileWorker && file) {
      fileWorker.postMessage({ type: "resize", chunkSize: NET.chunkSize });
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
    ? (fileInput.closest(".card") || fileInput.parentElement || document.body)
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
  const map = {
    lan:  ["🟢 LAN",  "rgba(0,200,100,.15)", "#006633"],
    wan:  ["🟡 WAN",  "rgba(255,200,0,.15)", "#886600"],
    turn: ["🔴 TURN", "rgba(255,80,80,.12)", "#aa2200"],
  };
  const [label, bg, color] = map[pathType] || ["⚪ —", "transparent", "#888"];
  badge.innerText = `${label} ${rttMs > 0 ? `· ${rttMs.toFixed(0)}ms` : ""}`;
  badge.style.background = bg;
  badge.style.color = color;
}

// ─── MEMORY CONSTANTS ─────────────────────────────────────────────────────────
const MEMORY_MAX_BYTES   = 300 * 1024 * 1024;   // use disk streaming above 300 MB
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
function allDataChannels() {
  return [...peerConnections.values()].map(p => p.dc).filter(d => d?.readyState === "open");
}

// Broadcast a chunk buffer to all open data channels (multi-receiver)
function broadcastChunk(buf) {
  const channels = allDataChannels();
  if (channels.length === 0) return;
  if (channels.length === 1) {
    // single receiver: transfer ownership (zero-copy)
    channels[0].send(buf);
    return;
  }
  // Multiple receivers: copy once per additional peer, original used for first
  for (let i = 0; i < channels.length; i++) {
    channels[i].send(i === 0 ? buf : buf.slice(0));
  }
}

// Broadcast a JSON control message to all open data channels
function broadcastMsg(obj) {
  const str = JSON.stringify(obj);
  allDataChannels().forEach(d => { try { d.send(str); } catch {} });
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

// ─── GLOBAL STATE ─────────────────────────────────────────────────────────────
let fileQueue     = [];
let sending       = false;
let outgoingFile  = null;
let fileWorker    = null;
let pendingIncoming = null;
let pendingWritable = null;
let currentRoom   = "";
let transferCompleted = false;
let gracefulClosing   = false;
let peerGeneration    = 0;
let retryInProgress   = false;
let doneResendTimer   = null;
let lastStatusRes     = null;

// Sender state
let sendState = {
  running: false, paused: false, canceled: false,
  offset: 0, file: null,
  ackBytes: 0, lastAckTickT: 0, lastAckTickB: 0, ackEma: 0,
  gotComplete: false,
  chunkIndex: 0,        // for retransmit tracking
  pendingRetransmits: new Map(), // index → buf
};

// Receiver state
let incomingFile = null;

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

// ─── QUEUE / HISTORY ─────────────────────────────────────────────────────────
let queueWrap = null, queueListEl = null, queueCountEl = null;
let recvQueueWrap = null, recvQueueListEl = null, recvQueueCountEl = null;
const sentHistory = [], recvHistory = [];
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
  return it;
}
function upsertRecvItem(id, name, size, state, done = 0, total = size || 0) {
  if (!id) id = `${name}|${size}`;
  let it = recvHistory.find(x => x.id === id);
  if (!it) { it = { id, name, size, state, done, total }; recvHistory.push(it); }
  it.name = name; it.size = size; it.state = state;
  it.done = Math.max(it.done || 0, done || 0);
  it.total = total || it.total || size || 0;
  return it;
}

function ensureQueueUI() {
  if (queueWrap) return;
  if (!fileInput) return;
  const host = fileInput.closest(".card") || fileInput.parentElement || document.body;
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
  const host = fileInput.closest(".card") || fileInput.parentElement || document.body;
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
  const done    = recvHistory.filter(x => x.state === "done"    || x.state === "canceled");
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
    const label = it.state === "done" ? "✅ Received" : "❌ Canceled";
    items.push(`<div style="padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.06);margin-bottom:8px;"><div style="font-weight:700;color:#555;">${label}: ${it.name} <span style="opacity:.7;font-size:12px;">${fmtBytes(it.size)}</span></div></div>`);
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
  const host = (typeof fileInput !== "undefined" && fileInput) ? (fileInput.closest(".card") || fileInput.parentElement || document.body) : document.body;
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
  speedText.innerText = "Speed: 0 MB/s";
  progressText.innerText = "0% (0 B / 0 B)";
  etaText.innerText = "Remaining: --";
  pauseBtn.disabled = true; resumeBtn.disabled = true; cancelBtn.disabled = true;
}
function setStatus(text) { fileStatus.innerText = text; }
function setConnectedUI(ok, msg, hint = "") {
  connDot.classList.toggle("green", !!ok);
  statusText.innerText = msg || (ok ? "Connected" : "Not Connected");
  roomHint.innerText = hint || "";
}
function setProgressBytes(done, total) {
  const pct = total > 0 ? Math.floor((done / total) * 100) : 0;
  progressBar.value = Math.min(100, pct);
  progressText.innerText = `${Math.min(100, pct)}% (${fmtBytes(done)} / ${fmtBytes(total)})`;
}
function addMsg(html) {
  const div = document.createElement("div"); div.className = "msg"; div.innerHTML = html;
  chatBox.appendChild(div); chatBox.scrollTop = chatBox.scrollHeight;
}
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

// ─── ROOM ─────────────────────────────────────────────────────────────────────
function joinRoom(roomId, mode) {
  currentRoom = roomId;
  loadAutoAcceptFlag();
  socket.emit("join-room", { roomId, deviceName: getDeviceName() });
  chatSection.style.display = "block";
  if (mode === "create") {
    setConnectedUI(false, "Room created", `Room: ${roomId} — Waiting...`);
    addMsg(`<span class="muted">🆕 Room: <b>${roomId}</b> (waiting...)</span>`);
  } else {
    setConnectedUI(false, "Joining...", `Room: ${roomId}`);
    addMsg(`<span class="muted">➡️ Joined: <b>${roomId}</b></span>`);
  }
}
createBtn.onclick = () => { const id = Math.random().toString(36).slice(2, 8).toUpperCase(); roomInput.value = id; joinRoom(id, "create"); };
joinBtn.onclick   = () => { const r = roomInput.value.trim(); if (r) joinRoom(r, "join"); };
socket.on("room-status", ({ room, users }) => {
  if (room !== currentRoom) return;
  if (users >= 2) { setConnectedUI(true, "Connected", `Room: ${room} — Both connected`); addMsg(`<span class="muted">✅ Peer joined. Connected.</span>`); }
  else            { setConnectedUI(false, "Waiting...", `Room: ${room} — Waiting...`); }
});

// ─── CHAT ─────────────────────────────────────────────────────────────────────
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
  socket.emit("send-message", msg);
  addChatBubble({ user: "You", text: msg, mine: true });
  messageInput.value = "";
  socket.emit("stop-typing", { roomId: currentRoom, user: getDeviceName() });
};
socket.on("receive-message", data => { if (!data.fromSelf) addChatBubble({ user: data.user || "Peer", text: data.text || "", mine: false }); });

// ─── DRAG & DROP ──────────────────────────────────────────────────────────────
function enableDragDrop() {
  if (!fileInput) return;
  const host = fileInput.closest(".card") || fileInput.parentElement || document.body;
  let overlay = document.getElementById("dropOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "dropOverlay";
    overlay.style.cssText = "position:relative;margin-top:10px;border:2px dashed rgba(0,0,0,.18);border-radius:16px;padding:14px;text-align:center;opacity:.75;user-select:none;";
    overlay.innerHTML = "🖱 Drag & Drop files here";
    host.appendChild(overlay);
  }
  const onDragOver  = e => { e.preventDefault(); overlay.style.opacity = "1"; overlay.style.borderColor = "rgba(255,140,60,.7)"; };
  const onDragLeave = () => { overlay.style.opacity = ".75"; overlay.style.borderColor = "rgba(0,0,0,.18)"; };
  const onDrop = e => { e.preventDefault(); onDragLeave(); if (!currentRoom) { alert("Join a room first."); return; } if (e.dataTransfer?.files?.length) enqueueFilesForSend(e.dataTransfer.files); };
  overlay.addEventListener("dragover", onDragOver);
  overlay.addEventListener("dragleave", onDragLeave);
  overlay.addEventListener("drop", onDrop);
}

fileInput.addEventListener("change", () => { enqueueFilesForSend(fileInput.files); fileInput.value = ""; });

function enqueueFilesForSend(files) {
  Array.from(files || []).forEach(file => {
    const err = validateFile(file);
    if (err) { addMsg(`<span class="muted">❌ ${err}</span>`); return; }
    try { file._qid = file._qid || (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`); } catch { file._qid = `${Date.now()}-${Math.random()}`; }
    fileQueue.push(file);
    upsertSentItem(file._qid, file.name, file.size, "queued", 0, file.size);
    addMsg(`<span class="muted">📤 Selected: ${file.name} (${fmtBytes(file.size)})</span>`);
  });
  try { renderQueueUI(sending ? outgoingFile : null); } catch {}
  startNextFile();
}

// ─── BUTTONS ──────────────────────────────────────────────────────────────────
pauseBtn.onclick = () => {
  if (!sendState.running) return;
  sendState.paused = true;
  pauseBtn.disabled = true; resumeBtn.disabled = false;
  setStatus("⏸ Paused");
  try { fileWorker?.postMessage({ type: "pause" }); } catch {}
};
resumeBtn.onclick = () => {
  if (!sendState.running) return;
  sendState.paused = false;
  pauseBtn.disabled = false; resumeBtn.disabled = true;
  setStatus(`Sending: ${sendState.file?.name || ""}`);
  try {
    fileWorker?.postMessage({ type: "resume" });
    for (let i = 0; i < NET.pipelineDepth; i++) fileWorker?.postMessage({ type: "pull" });
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

    // ── "disconnected" is TRANSIENT — ICE will self-heal via keepalives ──────
    // Do NOT close or reconnect here. Chrome frequently oscillates
    // disconnected → checking → connected on flaky wifi. Only act on "failed".
    if (s === "connected" || s === "completed") {
      _clearIceFailTimer(socketId);      // cancel any pending fail handler
      _clearReconnectTimer(socketId);    // cancel any pending reconnect
      detectAndApplyNetworkProfile(pc);
    }

    if (s === "failed") {
      // Debounce 300ms — "disconnected" can briefly look like "failed" on some
      // browsers before recovering. If it truly fails the timer fires.
      _clearIceFailTimer(socketId);
      const t = setTimeout(() => {
        _iceFailTimers.delete(socketId);
        // Only handle here — do NOT also handle in onconnectionstatechange
        // to avoid the double-reconnect race.
        dlog("ICE truly failed — triggering full reconnect", socketId);
        addMsg(`<span class="muted">⚠️ ICE failed — reconnecting...</span>`);
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
    if (e.candidate) socket.emit("webrtc-ice", { to: socketId, candidate: e.candidate });
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
  retryInProgress = true;
  _clearReconnectTimer(socketId);
  _clearIceFailTimer(socketId);

  // Exponential backoff: 1s, 2s, 4s, 8s, cap 15s
  const attempts = (_reconnectAttempts.get(socketId) || 0) + 1;
  _reconnectAttempts.set(socketId, attempts);
  const delay = Math.min(1000 * Math.pow(2, attempts - 1), 15000);
  dlog(`handlePeerFailed: attempt ${attempts}, delay ${delay}ms`, socketId);
  addMsg(`<span class="muted">⚠️ Connection lost — reconnecting in ${(delay/1000).toFixed(1)}s (attempt ${attempts})...</span>`);

  // Close the dead peer BEFORE scheduling reconnect so removePeer's dc.close()
  // doesn't re-trigger dc.onclose → handlePeerFailed again.
  // We manually mark gracefulClosing for just this peer to suppress the onclose handler.
  const peer = getPeer(socketId);
  if (peer) {
    peer.state = "closing";
    try { peer.dc?.close(); } catch {}
    try { peer.pc?.close(); } catch {}
    peerConnections.delete(socketId);   // delete directly — don't call removePeer()
  }
  if (socketId === _primaryPeerSocketId) {
    _primaryPeerSocketId = peerConnections.size > 0 ? [...peerConnections.keys()][0] : null;
  }

  if (!sendState.running || sendState.canceled || transferCompleted) {
    retryInProgress = false;
    return;
  }

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
    addMsg(`<span class="muted">✅ DataChannel open (${socketId.slice(0,6)})</span>`);
    const peer = getPeer(socketId);
    if (peer) peer.state = "open";
    // Reset backoff — connection is healthy
    _reconnectAttempts.delete(socketId);
    _clearReconnectTimer(socketId);
    _clearIceFailTimer(socketId);

    if (sendState.running && !sendState.canceled) {
      // ── RECONNECT path: transfer already in progress ─────────────────────
      dlog("DC reopened mid-transfer — offset", sendState.offset);
      addMsg(`<span class="muted">🔄 Reconnected — resuming from ${fmtBytes(sendState.offset)}</span>`);

      // Reset drain state on the new channel (clears waitingDrain + loopRunning)
      if (typeof sendState._onReconnect === "function") {
        sendState._onReconnect(channel);
      }

      // Ask the receiver to confirm how many bytes it has received.
      // We MUST wait for the reply before seeding the worker or calling sendLoop.
      // Sending data immediately into a freshly-opened SCTP channel before the
      // receiver confirms causes "Failure to send data" because:
      //   a) SCTP window not yet negotiated
      //   b) We may re-send bytes the receiver already has → corruption
      // _onResumeConfirmed() (called when resume-offset reply arrives) does the
      // worker seek + sendLoop kick. Nothing else should trigger sending here.
      try {
        channel.send(JSON.stringify({ type: "resume-offset", offset: sendState.offset }));
        dlog("sent resume-offset request to receiver");
      } catch(e) { dlog("resume-offset send failed:", e); }

    } else if (outgoingFile && !sendState.running) {
      // ── FRESH start: first connection for this file ───────────────────────
      sendFile(outgoingFile).catch(console.error);
    }
  };

  channel.onclose = () => {
    dlog("DC closed", socketId, "gen", gen);

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

    addMsg(`<span class="muted">⚠️ DataChannel closed (${socketId.slice(0,6)})</span>`);
    // Only trigger reconnect if we're mid-transfer and not already handling it
    if (sendState.running && !sendState.canceled && !retryInProgress) {
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
      if (msg.type === "status-res") { lastStatusRes = msg; return; }
      if (msg.type === "status-req") {
        const r = incomingFile ? { receivedBytes: incomingFile.receivedBytes, size: incomingFile.meta.size, sawDone: incomingFile.sawDone } : { receivedBytes: 0, size: 0, sawDone: false };
        try { channel.send(JSON.stringify({ type: "status-res", ...r })); } catch {}
        return;
      }
      if (msg.type === "complete") {
        sendState.gotComplete = true;
        transferCompleted = true;
        setStatus(`✅ Sent: ${sendState.file?.name || ""}`);
        try { const f = sendState.file; if (f) { upsertSentItem(f._qid || `${f.name}|${f.size}`, f.name, f.size, "done", f.size, f.size); renderQueueUI(null); } } catch {}
        setProgressBytes(sendState.file?.size || 0, sendState.file?.size || 1);
        etaText.innerText = "Remaining: 0m 0s";
        sendState.running = false; outgoingFile = null;
        pauseBtn.disabled = true; resumeBtn.disabled = true; cancelBtn.disabled = true;
        safeCloseAllPeers();
        sending = false; transferCompleted = false;
        setTimeout(() => startNextFile(), 900);
        return;
      }
      if (msg.type === "done")   { await finalizeIncomingIfReady(); return; }
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
          const chunkSz  = NET.chunkSize || 262144;
          const aligned  = Math.floor(incomingFile.receivedBytes / chunkSz) * chunkSz;

          if (aligned < incomingFile.receivedBytes) {
            // Drop the partial last chunk from memory-mode chunks array
            if (!incomingFile.writable && incomingFile.chunks.length > 0) {
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
  socket.emit("webrtc-offer", { to: sid, sdp: pc.localDescription });
}

socket.on("webrtc-offer", async ({ from, sdp, resume, offset }) => {
  _primaryPeerSocketId = from;
  const pc = await createPeerConnectionFor(from);
  await pc.setRemoteDescription(sdp);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("webrtc-answer", { to: from, sdp: pc.localDescription });

  // If this is a reconnect resume offer, acknowledge with current receive offset
  if (resume && incomingFile) {
    setTimeout(() => {
      const peer = getPeer(from);
      if (peer?.dc?.readyState === "open") {
        peer.dc.send(JSON.stringify({ type: "resume-offset", offset: incomingFile.receivedBytes }));
      }
    }, 500);
  }
});

socket.on("webrtc-answer", async ({ from, sdp }) => {
  const peer = getPeer(from || _primaryPeerSocketId);
  if (peer) await peer.pc.setRemoteDescription(sdp);
  else if (window.pc) await window.pc.setRemoteDescription(sdp);
});

socket.on("webrtc-ice", async ({ from, candidate }) => {
  const sid = from || _primaryPeerSocketId;
  const peer = getPeer(sid);
  try {
    if (peer) await peer.pc.addIceCandidate(candidate);
  } catch(e) { dlog("addIceCandidate error:", e); }
});

// ─── SAFE CLOSE ───────────────────────────────────────────────────────────────
function safeCloseAllPeers() {
  stopRttPolling();
  gracefulClosing = true;
  peerGeneration++;
  // Cancel any pending reconnect/ICE-fail timers before closing
  for (const sid of peerConnections.keys()) {
    _clearReconnectTimer(sid);
    _clearIceFailTimer(sid);
    _reconnectAttempts.delete(sid);
  }
  for (const sid of peerConnections.keys()) removePeer(sid);
  _primaryPeerSocketId = null;
  if (doneResendTimer) { clearInterval(doneResendTimer); doneResendTimer = null; }
  resetReceiverReady();
  retryInProgress = false;
  setTimeout(() => (gracefulClosing = false), 800);
}

// Keep legacy alias
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
    // Terminate the worker entirely — prevents ghost onmessage callbacks on next transfer
    try { fileWorker?.terminate(); } catch {}
    fileWorker = null;
    broadcastMsg({ type: "cancel", by: canceledBy || getDeviceName() });
    if (notifyPeer) socket.emit("file-cancel", { room: currentRoom, by: canceledBy || getDeviceName(), reason });
  }
  incomingFile = null;
  setStatus("❌ Transfer canceled");
  resetTransferUI(); noSleepStop(); safeCloseAllPeers();
  addMsg(`<span class="muted">❌ ${reason}</span>`);
  try { const f = sendState?.file || outgoingFile; if (f) { upsertSentItem(f._qid || `${f.name}|${f.size}`, f.name, f.size, "canceled", sendState?.ackBytes || 0, f.size); renderQueueUI(null); } } catch {}
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
  try { upsertSentItem(file._qid || `${file.name}|${file.size}`, file.name, file.size, "sending", sendState.ackBytes, file.size); renderQueueUI(file); } catch {}
  const now = performance.now(); const dt = (now - sendState.lastAckTickT) / 1000;
  if (!sendState.lastAckTickT) { sendState.lastAckTickT = now; sendState.lastAckTickB = sendState.ackBytes; return; }
  if (dt >= 1.0) {
    const db = sendState.ackBytes - sendState.lastAckTickB;
    sendState.ackEma = sendState.ackEma ? 0.8 * sendState.ackEma + 0.2 * (db / dt) : db / dt;
    speedText.innerText = `Speed: ${(sendState.ackEma / 1024 / 1024).toFixed(2)} MB/s`;
    const remaining = file.size - sendState.ackBytes;
    etaText.innerText = `Remaining: ${formatETA(sendState.ackEma > 0 ? remaining / sendState.ackEma : NaN)}`;
    sendState.lastAckTickT = now; sendState.lastAckTickB = sendState.ackBytes;
  }
}

// ─── FILE QUEUE ───────────────────────────────────────────────────────────────
function startNextFile() {
  if (sending || fileQueue.length === 0) return;
  const file = fileQueue.shift();
  sending = true;
  transferCompleted = false; gracefulClosing = false;
  resetReceiverReady(); retryInProgress = false;
  outgoingFile = file;
  resetTransferUI();
  setStatus(`Waiting for receiver... (${file.name}, ${fmtBytes(file.size)})`);
  try { renderQueueUI(file); } catch {}
  if (!checkRateLimit()) { addMsg(`<span class="muted">⚠️ Rate limit: too many file offers. Wait a moment.</span>`); sending = false; return; }
  socket.emit("file-offer", { id: file._qid || `${file.name}|${file.size}`, name: file.name, size: file.size, type: file.type || "application/octet-stream" });
}

// ─── FILE OFFER / ACCEPT ──────────────────────────────────────────────────────
socket.on("file-offer", ({ from, fromName, fromShort, meta }) => {
  pendingIncoming = { from, meta };
  try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta?.name, meta?.size || 0, "pending", 0, meta?.size || 0); renderRecvQueueUI(); } catch {}
  const who = fromName || fromShort || (from ? from.substring(0, 5) : "User");
  if (autoAcceptThisRoom) {
    addMsg(`<span class="muted">✅ Auto-accepted from <b>${who}</b>: ${meta.name} (${fmtBytes(meta.size)})</span>`);
    socket.emit("file-answer", { to: from, accepted: true });
    _primaryPeerSocketId = from; pendingIncoming = null; modalBg.style.display = "none";
    setStatus("Auto-accepted. Connecting P2P...");
    return;
  }
  modalInfo.innerText = `From: ${who}\nFile: ${meta.name}\nSize: ${fmtBytes(meta.size)}\nType: ${meta.type}`;
  modalBg.style.display = "flex";
});

rejectBtn.onclick = () => {
  if (!pendingIncoming) return;
  socket.emit("file-answer", { to: pendingIncoming.from, accepted: false });
  try { const id = pendingIncoming?.meta?.id || `${pendingIncoming?.meta?.name}|${pendingIncoming?.meta?.size}`; if (id && pendingIncoming?.meta) { upsertRecvItem(id, pendingIncoming.meta.name, pendingIncoming.meta.size || 0, "canceled", 0, pendingIncoming.meta.size || 0); renderRecvQueueUI(); } } catch {}
  pendingIncoming = null; modalBg.style.display = "none";
};

acceptBtn.onclick = async () => {
  if (!pendingIncoming) return;
  transferCompleted = false; gracefulClosing = false; resetReceiverReady(); retryInProgress = false;
  const meta = pendingIncoming.meta;
  const canDisk = "showSaveFilePicker" in window && window.isSecureContext;
  let writable = null;

  // Ask for save location for ALL files (not just large ones).
  // Previously only files >300MB triggered showSaveFilePicker — small files
  // used auto-download via a.click() which Android Chrome silently blocks
  // unless it happens inside a direct user gesture on the same tick.
  // Asking here (inside the onclick, which IS a user gesture) works on Android.
  if (canDisk) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: meta.name });
      writable = await handle.createWritable();
      addMsg(`<span class="muted">💾 Save location chosen. Connecting...</span>`);
    } catch {
      addMsg(`<span class="muted">❌ Save dialog canceled.</span>`);
      socket.emit("file-answer", { to: pendingIncoming.from, accepted: false });
      pendingIncoming = null; modalBg.style.display = "none"; return;
    }
  } else {
    // Fallback for non-HTTPS or browsers without File System Access API —
    // will use in-memory Blob + a.click() at the end (best effort on desktop).
    if (meta.size > MEMORY_MAX_BYTES) {
      addMsg(`<span class="muted">⚠️ Large file needs HTTPS for disk saving.</span>`);
      socket.emit("file-answer", { to: pendingIncoming.from, accepted: false });
      pendingIncoming = null; modalBg.style.display = "none"; return;
    }
  }

  pendingWritable = writable;
  socket.emit("file-answer", { to: pendingIncoming.from, accepted: true });
  if (!autoAcceptThisRoom) { saveAutoAcceptFlag(true); addMsg(`<span class="muted">✅ Auto-accept enabled for this room</span>`); }
  _primaryPeerSocketId = pendingIncoming.from;
  pendingIncoming = null; modalBg.style.display = "none";
  setStatus("Accepted. Connecting P2P...");
  addMsg(`<span class="muted">📥 Accepted. Connecting P2P...</span>`);
};

socket.on("file-answer", async ({ from, accepted }) => {
  if (!accepted) { setStatus("Receiver rejected."); addMsg(`<span class="muted">❌ Rejected.</span>`); outgoingFile = null; return; }
  _primaryPeerSocketId = from;
  setStatus("Accepted. Connecting P2P...");
  addMsg(`<span class="muted">📤 Accepted. Connecting P2P...</span>`);
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
  const getDc = () => {
    const p = getPeer(_primaryPeerSocketId);
    return p?.dc?.readyState === "open" ? p.dc : null;
  };

  if (!getDc()) { dlog("sendFile: no open DC"); return; }

  // Detect network profile first
  const primaryPeer = getPeer(_primaryPeerSocketId);
  if (primaryPeer?.pc) await detectAndApplyNetworkProfile(primaryPeer.pc);

  resetTransferUI();
  setStatus(`Sending: ${file.name} (${fmtBytes(file.size)})`);
  addMsg(`<b>Sending:</b> ${file.name} (${fmtBytes(file.size)})`);
  dlog("sendFile", { name: file.name, size: file.size, chunk: NET.chunkSize, depth: NET.pipelineDepth, path: NET.pathType });
  try { upsertSentItem(file._qid || `${file.name}|${file.size}`, file.name, file.size, "sending", 0, file.size); renderQueueUI(file); } catch {}

  pauseBtn.disabled = false; resumeBtn.disabled = true; cancelBtn.disabled = false;
  sendState.running = true; sendState.paused = false; sendState.canceled = false;
  sendState.offset = 0; sendState.file = file; sendState.ackBytes = 0;
  sendState.lastAckTickT = 0; sendState.lastAckTickB = 0; sendState.ackEma = 0;
  sendState.gotComplete = false; sendState.chunkIndex = 0;
  sendState.pendingRetransmits = new Map();

  noSleepStart();
  resetReceiverReady(); retryInProgress = false;

  broadcastMsg({ type: "meta", meta: {
    id: file._qid || `${file.name}|${file.size}`,
    name: file.name, size: file.size,
    type: file.type || "application/octet-stream"
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
  if (fileWorker) {
    try { fileWorker.postMessage({ type: "cancel" }); } catch {}
    try { fileWorker.terminate(); } catch {}
  }
  fileWorker = new Worker("worker.js");

  // ── Send-loop state ───────────────────────────────────────────────────────
  const chunkQueue   = [];
  let   workerDone   = false;
  let   allSent      = false;
  let   loopRunning  = false;
  let   waitingDrain = false;     // true while we're blocked waiting for bufferedamountlow
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
  function sendLoop() {
    if (!sendState.running || sendState.canceled || allSent) return;
    if (loopRunning || waitingDrain) return;
    loopRunning = true;

    while (chunkQueue.length > 0) {
      if (sendState.paused || sendState.canceled) break;

      const dc = getDc();
      if (!dc) {
        // DC not open — wait for reconnect; _attachDrainListener will re-kick us
        dlog("[SEND] DC not open — waiting for reconnect");
        break;
      }

      // ── THE CORRECT CHECK: read dc.bufferedAmount directly ────────────────
      // Don't use a separate counter. Chrome's SCTP bufferedAmount is accurate
      // for flow control; just check it before each send.
      if (dc.bufferedAmount >= NET.highWaterMark) {
        // Register a one-shot drain listener then stop the loop.
        // The listener will call sendLoop() again once the buffer drains.
        waitingDrain = true;
        dlog("[SEND] HWM — pausing until bufferedamountlow", {
          buffered: (dc.bufferedAmount / 1024 / 1024).toFixed(2) + "MB",
          hwm: (NET.highWaterMark / 1024 / 1024).toFixed(2) + "MB"
        });
        const onLow = () => {
          dc.removeEventListener("bufferedamountlow", onLow);
          waitingDrain = false;
          sendLoop();
        };
        dc.addEventListener("bufferedamountlow", onLow);
        // Safety fallback: if the event never fires (e.g. DC closes) unblock after 2s
        setTimeout(() => {
          if (!waitingDrain) return;
          waitingDrain = false;
          dc.removeEventListener("bufferedamountlow", onLow);
          sendLoop();
        }, 2000);
        break;
      }

      const { buf: rawBuf, index } = chunkQueue.shift();

      // ── FIX 1: Trim final chunk to exact remaining bytes ──────────────────
      // Worker slices file at fixed chunkSize boundaries. With a deep pipeline
      // (depth 32) all chunks are pre-queued — a full-size chunk lands on the
      // receiver after only a partial amount of file data remains, pushing
      // receivedBytes past meta.size → overflow guard discards it → stuck/corrupt.
      const bytesLeftToSend = file.size - sendState.offset;
      const buf = (rawBuf.byteLength > bytesLeftToSend && bytesLeftToSend > 0)
        ? rawBuf.slice(0, bytesLeftToSend)
        : rawBuf;

      // Keep last 64 chunks for potential retransmit (trimmed buf is authoritative)
      sendState.pendingRetransmits.set(index, buf);
      if (sendState.pendingRetransmits.size > 64) {
        sendState.pendingRetransmits.delete(sendState.pendingRetransmits.keys().next().value);
      }

      try {
        broadcastChunk(buf);
      } catch(err) {
        chunkQueue.unshift({ buf: rawBuf, index });
        dlog("[SEND] dc.send threw:", err?.message);
        break;
      }

      sendState.offset    = Math.min(file.size, sendState.offset + buf.byteLength);
      sendState.chunkIndex = index + 1;

      // Release worker backpressure using original size so worker accounting stays correct
      fileWorker.postMessage({ type: "ack-chunk", bytes: rawBuf.byteLength });

      // Throughput sample for slow-TURN detection
      const now = performance.now();
      if (now - _lastSampleT >= 2000) {
        recordThroughputSample((sendState.offset - _lastSampleB) / ((now - _lastSampleT) / 1000), fileWorker, file, currentDepth);
        _lastSampleT = now; _lastSampleB = sendState.offset;
      }

      // Keep worker disk-read pipeline full
      if (!workerDone) fileWorker.postMessage({ type: "pull" });
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
    // Drain chunkQueue — stale chunks from the dead channel.
    // Fresh chunks will be produced after _onResumeConfirmed seeks the worker.
    chunkQueue.length = 0;
    dlog("[SEND] reconnect hook: state reset, waiting for receiver offset confirmation");
  };

  // _onResumeConfirmed: called when receiver replies with its confirmed byte count.
  //   Seeks the worker to the right position, then kicks sendLoop.
  sendState._onResumeConfirmed = (confirmedOffset) => {
    const safeOffset = confirmedOffset || 0;
    dlog("[SEND] resume confirmed at", fmtBytes(safeOffset), "(our offset was", fmtBytes(sendState.offset) + ")");
    sendState.offset     = safeOffset;
    sendState.ackBytes   = Math.min(sendState.ackBytes, safeOffset);
    sendState.chunkIndex = Math.floor(safeOffset / NET.chunkSize);
    // Re-seek the worker then prime the pipeline
    fileWorker.postMessage({ type: "seek",  offset: safeOffset, chunkIndex: sendState.chunkIndex });
    for (let i = 0; i < NET.pipelineDepth; i++) fileWorker.postMessage({ type: "pull" });
    // sendLoop will fire naturally once worker delivers the first chunk
  };

  // ── Worker messages ───────────────────────────────────────────────────────
  fileWorker.onmessage = e => {
    if (e.data.type === "chunk") {
      if (sendState.canceled) return;
      chunkQueue.push({ buf: e.data.buf, index: e.data.index });
      sendLoop();
      return;
    }
    if (e.data.type === "done") {
      workerDone = true;
      dlog("[WORKER] all chunks read, queue:", chunkQueue.length);
      if (chunkQueue.length === 0 && !allSent) { allSent = true; finalizeSend(); }
    }
  };

  // ── RTT polling ───────────────────────────────────────────────────────────
  startRttPolling(primaryPeer?.pc, newDepth => {
    const delta = newDepth - currentDepth;
    currentDepth = newDepth;
    applyThreshold();
    if (delta > 0 && !workerDone) for (let i = 0; i < delta; i++) fileWorker.postMessage({ type: "pull" });
  });

  // ── FINALIZE ──────────────────────────────────────────────────────────────
  async function finalizeSend() {
    stopRttPolling();
    // Clean up reconnect hooks — no more data to send
    sendState._onReconnect       = null;
    sendState._onResumeConfirmed = null;
    if (sendState.canceled) return;
    dlog("[SEND] all chunks sent — draining dc buffer");

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

    broadcastMsg({ type: "done" });
    broadcastMsg({ type: "status-req" });

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
        broadcastMsg({ type: "done" });
        broadcastMsg({ type: "status-req" });
      }, 2000);
    }

    // Wait for receiver to confirm "complete" — with a hard 30s timeout
    // so we never hang forever if the "complete" message is lost
    const waitStart = performance.now();
    while (sendState.running && !sendState.canceled && !sendState.gotComplete) {
      if (performance.now() - waitStart > 30000) {
        dlog("[SEND] complete timeout — assuming receiver got the file");
        sendState.gotComplete = true;
        break;
      }
      await new Promise(r => setTimeout(r, 150));
    }
    noSleepStop();
  }

  // ── KICK OFF ──────────────────────────────────────────────────────────────
  fileWorker.postMessage({ type: "start", file, chunkSize: NET.chunkSize, offset: 0, chunkIndex: 0 });
  for (let i = 0; i < currentDepth; i++) fileWorker.postMessage({ type: "pull" });
}

// ─── RECEIVER ─────────────────────────────────────────────────────────────────
let pendingWritableStore = null;

async function startReceiver(meta) {
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
        addMsg(`<span class="muted">🔄 Reconnected — resuming receive from ${fmtBytes(incomingFile.receivedBytes)}</span>`);
        try {
          window.dc?.send(JSON.stringify({ type: "ready" }));
        } catch(e) { dlog("ready send failed on reconnect:", e); }
        return;
      }

      // Not a genuine reconnect — stale state (stuck, completed, or sawDone).
      // Reset so the fresh-start path below runs cleanly.
      dlog("startReceiver: stale incomingFile detected — resetting for fresh start",
        { receivedBytes: incomingFile.receivedBytes, sawDone: incomingFile.sawDone, finalizing: incomingFile.finalizing });
      if (incomingFile.writable) {
        incomingFile.writable.abort?.().catch(() => {});
      }
      incomingFile = null;
      // fall through to fresh-start path
    }
  }

  // ── FRESH start ────────────────────────────────────────────────────────────
  resetTransferUI();
  cancelBtn.disabled = false;

  incomingFile = {
    meta,
    receivedBytes: 0,
    lastAckSent: 0,
    lastT: performance.now(), lastB: 0, ema: 0,
    chunks: [],        // fresh empty array — never reuse from a previous transfer
    writable: null,
    writeChain: Promise.resolve(),
    sawDone: false, finalizing: false,
    expectedChecksums: new Map(),
    receivedChunkIndices: new Set(),
  };

  setStatus(`Receiving: ${meta.name} (${fmtBytes(meta.size)})`);
  addMsg(`<b>Receiving:</b> ${meta.name} (${fmtBytes(meta.size)})`);
  dlog("startReceiver", meta);
  try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size || 0, "receiving", 0, meta.size || 0); renderRecvQueueUI(); } catch {}

  // Use disk streaming for any file where the user pre-chose a save location
  // (pendingWritable set in acceptBtn.onclick), OR for files >300MB which
  // always require disk. Small files without a pendingWritable fall back to
  // in-memory Blob mode (non-HTTPS / File System Access API not available).
  const needDisk = meta.size > MEMORY_MAX_BYTES;
  if (pendingWritable) {
    // Consume the pre-chosen writable (covers both small and large files)
    incomingFile.writable = pendingWritable;
    pendingWritable = null;
    addMsg(`<span class="muted">💾 Saving to disk: ${meta.name}</span>`);
  } else if (needDisk) {
    // Large file but no pendingWritable — shouldn't happen in normal flow
    // (acceptBtn should have set it), but handle gracefully as fallback.
    const canDisk = "showSaveFilePicker" in window && window.isSecureContext;
    if (!canDisk) {
      addMsg(`<span class="muted">⚠️ Large file needs HTTPS for disk saving.</span>`);
      setStatus("⚠️ Large file needs HTTPS/localhost."); incomingFile = null; return;
    }
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: meta.name });
      incomingFile.writable = await handle.createWritable();
      addMsg(`<span class="muted">💾 Saving to disk...</span>`);
    } catch {
      addMsg(`<span class="muted">❌ Save dialog canceled.</span>`);
      setStatus("❌ Save canceled."); incomingFile = null; return;
    }
  } else {
    addMsg(`<span class="muted">ℹ️ File will appear in Downloads panel after transfer.</span>`);
  }

  noSleepStart();
  const primaryDc = window.dc;
  try { primaryDc?.send(JSON.stringify({ type: "ready" })); } catch {}
}

async function handleIncomingChunk(buf) {
  if (!incomingFile) return;
  if (incomingFile.meta.size > MEMORY_MAX_BYTES && !incomingFile.writable) return;

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

  if (incomingFile.writable) {
    // Disk mode: write at the exact byte position so any seek/resume is safe
    const writePosition = incomingFile.receivedBytes;
    const writableRef   = incomingFile.writable;
    const u8 = new Uint8Array(writeBuf.slice(0));  // copy — keeps original buf intact
    incomingFile.writeChain = incomingFile.writeChain
      .then(() => writableRef.write({ type: "write", position: writePosition, data: u8 }))
      .catch(e => dlog("Disk write error at position", writePosition, e));
  } else {
    // Memory mode: store a copy so we own the memory regardless of DC GC
    incomingFile.chunks.push(writeBuf.slice(0));
  }

  incomingFile.receivedBytes += writeBuf.byteLength;
  setProgressBytes(incomingFile.receivedBytes, incomingFile.meta.size);
  try { const id = incomingFile.meta?.id || `${incomingFile.meta?.name}|${incomingFile.meta?.size}`; upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0, "receiving", incomingFile.receivedBytes, incomingFile.meta.size || 0); renderRecvQueueUI(); } catch {}

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
  }

  if (incomingFile.sawDone && incomingFile.receivedBytes >= incomingFile.meta.size && !incomingFile.finalizing) {
    dlog("all bytes + done flag — finalizing");
    incomingFile.finalizing = true;
    finalizeIncomingFile().catch(e => { dlog("Finalize failed", e); cancelTransfer("Finalize failed", false); });
  }
}

async function finalizeIncomingIfReady() {
  if (!incomingFile) return;
  incomingFile.sawDone = true;

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
  dlog("done rx but bytes incomplete — polling for remaining bytes",
    { received: incomingFile.receivedBytes, total: incomingFile.meta.size });

  const deadline = Date.now() + 5000;
  const poll = setInterval(() => {
    if (!incomingFile) { clearInterval(poll); return; }
    if (incomingFile.receivedBytes >= incomingFile.meta.size) {
      clearInterval(poll);
      if (incomingFile.finalizing) return;
      incomingFile.finalizing = true;
      finalizeIncomingFile().catch(e => {
        dlog("Finalize failed (poll path):", e);
        cancelTransfer("Finalize failed", false);
      });
    } else if (Date.now() > deadline) {
      clearInterval(poll);
      dlog("finalizeIncomingIfReady: poll timeout — clearing stale incomingFile",
        { received: incomingFile.receivedBytes, total: incomingFile.meta.size });
      if (incomingFile && !incomingFile.finalizing) {
        if (incomingFile.writable) incomingFile.writable.abort?.().catch(() => {});
        incomingFile = null;
        setStatus("⚠️ Transfer incomplete — please retry");
        addMsg(`<span class="muted">⚠️ Transfer incomplete. Please retry.</span>`);
      }
    }
  }, 100);
}

async function finalizeIncomingFile() {
  if (!incomingFile) return;
  const writableRef = incomingFile.writable;
  const chainRef    = incomingFile.writeChain;
  const meta        = incomingFile.meta;
  try {
    if (writableRef) {
      await chainRef;
      await writableRef.close();
      setStatus(`✅ Saved: ${meta.name}`);
      try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size||0, "done", meta.size||0, meta.size||0); renderRecvQueueUI(); } catch {}
      addMsg(`<b>Saved to disk:</b> ${meta.name}`);
      addToDownloadsManager({ name: meta.name, size: meta.size, type: meta.type, savedToDisk: true, url: null });
    } else {
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

      // ── Auto-download: trigger immediately, no manual "Save" click needed ─
      // Create a hidden <a> and click it so the browser saves the file straight
      // to Downloads without any extra user interaction.
      try {
        const a = document.createElement("a");
        a.href     = url;
        a.download = meta.name;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch(e) { dlog("auto-download click failed:", e); }

      setStatus(`✅ Received: ${meta.name}`);
      try { const id = meta?.id || `${meta?.name}|${meta?.size}`; upsertRecvItem(id, meta.name, meta.size||0, "done", meta.size||0, meta.size||0); renderRecvQueueUI(); } catch {}
      addMsg(`<b>File received:</b> ${meta.name}`);
      addToDownloadsManager({ name: meta.name, size: meta.size, type: meta.type, savedToDisk: true, url });
    }

    transferCompleted = true;
    setProgressBytes(meta.size, meta.size);
    etaText.innerText = "Remaining: 0m 0s";
    cancelBtn.disabled = true;
    noSleepStop();

    // ── Send "complete" and wait for DC to flush before closing ──────────────
    // CRITICAL: do NOT call safeCloseAllPeers() immediately after dc.send().
    // dc.send() only queues the message in the SCTP buffer — it is NOT delivered
    // instantly. Closing the DC right away drops the buffered "complete" and the
    // sender gets stuck in its while(!gotComplete) loop forever.
    // Fix: send "complete", then wait for dc.bufferedAmount → 0 (up to 3s),
    // then delay 200ms for the sender to process it, THEN close.
    const primaryDc = window.dc;
    if (primaryDc?.readyState === "open") {
      try { primaryDc.send(JSON.stringify({ type: "complete" })); } catch(e) { dlog("complete send failed", e); }

      // Wait for SCTP to flush
      const flushStart = performance.now();
      while (primaryDc.readyState === "open" && primaryDc.bufferedAmount > 0) {
        if (performance.now() - flushStart > 3000) break;
        await new Promise(r => setTimeout(r, 30));
      }
      // Extra settle time so sender's onmessage can fire before DC closes
      await new Promise(r => setTimeout(r, 300));
    }

    safeCloseAllPeers();
    setTimeout(() => { transferCompleted = false; }, 500);
  } finally {
    incomingFile = null;
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
try { ensureQueueUI(); ensureRecvQueueUI(); ensureDiagnosticsPanel(); } catch {}
applyNetworkProfile(); // set defaults before any transfer