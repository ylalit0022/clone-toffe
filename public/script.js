const socket = io();

// ================= DEBUG =================
const DEBUG = true;
const dlog = (...a) => DEBUG && console.log("[P2P]", ...a);

// ================= TAB THROTTLING PREVENTION =================
// Chrome throttles background tabs (timers fire only 1x/second instead of normal rate).
// WebRTC DataChannel is EXEMPT from intensive throttling per Chrome spec, BUT
// the JS event loop (bufferedamountlow, onmessage handlers) can still be delayed
// when the tab is hidden.
//
// SOLUTION: Play a silent AudioContext buffer while transfer is active.
// This marks the tab as "playing audio" which prevents Chrome from throttling it.
// Used by many WebRTC apps (Google Meet, Discord) for the same reason.
let _noSleepCtx = null;
let _noSleepSource = null;
let _noSleepActive = false;

function noSleepStart() {
  if (_noSleepActive) return;
  try {
    if (!_noSleepCtx) _noSleepCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = _noSleepCtx.createBuffer(1, _noSleepCtx.sampleRate * 0.1, _noSleepCtx.sampleRate);
    const src = _noSleepCtx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(_noSleepCtx.destination);
    src.start();
    _noSleepSource = src;
    _noSleepActive = true;
    dlog("NoSleep: started (tab throttling prevented)");
  } catch(e) { dlog("NoSleep: failed", e); }
}

function noSleepStop() {
  if (!_noSleepActive) return;
  try {
    _noSleepSource?.stop();
    _noSleepSource?.disconnect();
  } catch(e) {}
  _noSleepSource = null;
  _noSleepActive = false;
  dlog("NoSleep: stopped");
}

// Also use Page Visibility API to log when tab goes background
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    dlog("Tab hidden — NoSleep active:", _noSleepActive);
  } else {
    dlog("Tab visible");
  }
});



let fileQueue = [];
let sending = false;



// ================= Queue UI (NO HTML change) =================
// Shows selected/sending/pending files inside the Send File card area
let queueWrap = null;
let queueListEl = null;
let queueCountEl = null;

function ensureQueueUI() {
  if (queueWrap && queueListEl && queueCountEl) return;
  if (!fileInput) return;

  // Place near file input (inside same card/section)
  const host = fileInput.closest(".card") || fileInput.parentElement || document.body;

  queueWrap = document.createElement("div");
  queueWrap.style.marginTop = "10px";

  queueWrap.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="font-weight:800;">📦 Queue</div>
      <div id="queueCount" style="opacity:.7;font-size:12px;">0</div>
    </div>
    <div id="queueList" style="
      margin-top:8px;
      max-height:140px;
      overflow:auto;
      border:1px solid rgba(0,0,0,.10);
      border-radius:12px;
      padding:8px;
      background: rgba(255,255,255,.6);
    "></div>
  `;

  queueListEl = queueWrap.querySelector("#queueList");
  queueCountEl = queueWrap.querySelector("#queueCount");
  host.appendChild(queueWrap);
}

function renderQueueUI(currentFile = null) {
  if (!fileInput) return;
  ensureQueueUI();
  if (!queueListEl || !queueCountEl) return;

  const total = fileQueue.length + (currentFile ? 1 : 0);
  queueCountEl.innerText = `${total} file(s)`;

  const items = [];

  if (currentFile) {
    items.push(`
      <div style="padding:6px 8px;border-radius:10px;background:rgba(255,210,120,.25);margin-bottom:6px;">
        ▶️ <b>Sending:</b> ${currentFile.name}
        <span style="opacity:.7">(${fmtBytes(currentFile.size)})</span>
      </div>
    `);
  }

  if (fileQueue.length === 0 && !currentFile) {
    items.push(`<div style="opacity:.7;padding:6px 8px;">No files in queue</div>`);
  } else {
    fileQueue.forEach((f, i) => {
      items.push(`
        <div style="padding:6px 8px;border-radius:10px;background:rgba(0,0,0,.03);margin-bottom:6px;">
          ${i + 1}. ${f.name} <span style="opacity:.7">(${fmtBytes(f.size)})</span>
        </div>
      `);
    });
  }

  queueListEl.innerHTML = items.join("");
}


// ================= Receiver Queue UI + Auto-Accept (NO HTML change) =================
// First incoming file asks for Accept. After you accept once, it auto-accepts remaining files in this room session.
let recvQueueWrap = null;
let recvQueueListEl = null;
let recvQueueCountEl = null;

// histories (for grey "done" tracking)
const sentHistory = [];   // {id,name,size,state,done,total}
const recvHistory = [];   // {id,name,size,state,done,total}

// auto-accept flag (per room session)
let autoAcceptThisRoom = false;

function autoAcceptKey() {
  return `autoAccept:${currentRoom || ""}`;
}

function loadAutoAcceptFlag() {
  try { autoAcceptThisRoom = sessionStorage.getItem(autoAcceptKey()) === "1"; } catch { autoAcceptThisRoom = false; }
}

function saveAutoAcceptFlag(v) {
  autoAcceptThisRoom = !!v;
  try { sessionStorage.setItem(autoAcceptKey(), v ? "1" : "0"); } catch {}
}

function ensureRecvQueueUI() {
  if (recvQueueWrap && recvQueueListEl && recvQueueCountEl) return;
  if (!fileInput) return;

  const host = fileInput.closest(".card") || fileInput.parentElement || document.body;

  recvQueueWrap = document.createElement("div");
  recvQueueWrap.style.marginTop = "10px";

  recvQueueWrap.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="font-weight:800;">📥 Receiver Queue</div>
      <div id="recvQueueCount" style="opacity:.7;font-size:12px;">0</div>
    </div>
    <div id="recvQueueList" style="
      margin-top:8px;
      max-height:140px;
      overflow:auto;
      border:1px solid rgba(0,0,0,.10);
      border-radius:12px;
      padding:8px;
      background: rgba(255,255,255,.6);
    "></div>
  `;

  recvQueueListEl = recvQueueWrap.querySelector("#recvQueueList");
  recvQueueCountEl = recvQueueWrap.querySelector("#recvQueueCount");
  host.appendChild(recvQueueWrap);
}

function renderRecvQueueUI() {
  if (!fileInput) return;
  ensureRecvQueueUI();
  if (!recvQueueListEl || !recvQueueCountEl) return;

  const pending = recvHistory.filter(x => x.state === "pending" || x.state === "receiving");
  const done = recvHistory.filter(x => x.state === "done" || x.state === "canceled");

  const total = pending.length + done.length;
  recvQueueCountEl.innerText = `${total} file(s)`;

  const items = [];

  pending.forEach((it) => {
    const pct = it.total ? Math.floor((it.done / it.total) * 100) : 0;
    const bar = `<div style="height:8px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden;margin-top:6px;">
      <div style="height:100%;width:${Math.min(100,pct)}%;background:linear-gradient(90deg,#ff4d6d,#ffa63d);"></div>
    </div>`;
    items.push(`
      <div style="padding:8px 10px;border-radius:12px;background:rgba(255,210,120,.18);margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;gap:10px;">
          <div style="font-weight:700;">${it.state === "receiving" ? "⬇️ Receiving" : "🕒 Pending"}: ${it.name}</div>
          <div style="opacity:.7;font-size:12px;">${fmtBytes(it.size)}</div>
        </div>
        <div style="opacity:.75;font-size:12px;margin-top:4px;">${pct}% (${fmtBytes(it.done)} / ${fmtBytes(it.total)})</div>
        ${bar}
      </div>
    `);
  });

  done.forEach((it) => {
    const label = it.state === "done" ? "✅ Received" : "❌ Canceled";
    items.push(`
      <div style="padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.06);margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;gap:10px;">
          <div style="font-weight:700;color:#555;">${label}: ${it.name}</div>
          <div style="opacity:.7;font-size:12px;color:#555;">${fmtBytes(it.size)}</div>
        </div>
      </div>
    `);
  });

  if (items.length === 0) items.push(`<div style="opacity:.7;padding:6px 8px;">No received files yet</div>`);
  recvQueueListEl.innerHTML = items.join("");
}

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

function enqueueFilesForSend(files) {
  const arr = Array.from(files || []);
  if (!arr.length) return;

  arr.forEach((file) => {
    try { file._qid = file._qid || (crypto?.randomUUID ? crypto.randomUUID() : (Date.now() + "-" + Math.random())); }
    catch { file._qid = file._qid || (Date.now() + "-" + Math.random()); }

    fileQueue.push(file);
    upsertSentItem(file._qid, file.name, file.size, "queued", 0, file.size);
    addMsg(`<span class="muted">📤 Selected: ${file.name} (${fmtBytes(file.size)})</span>`);
  });

  try { renderQueueUI(sending ? outgoingFile : null); } catch {}
  startNextFile();
}

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

  const onDragOver = (e) => { e.preventDefault(); overlay.style.opacity = "1"; overlay.style.borderColor = "rgba(255,140,60,.7)"; };
  const onDragLeave = () => { overlay.style.opacity = ".75"; overlay.style.borderColor = "rgba(0,0,0,.18)"; };
  const onDrop = (e) => {
    e.preventDefault();
    onDragLeave();
    if (!currentRoom) {
      alert("Please create or join a room first.");
      return;
    }
    const files = e.dataTransfer?.files;
    if (files && files.length) enqueueFilesForSend(files);
  };

  overlay.addEventListener("dragover", onDragOver);
  overlay.addEventListener("dragleave", onDragLeave);
  overlay.addEventListener("drop", onDrop);
}
// UI
const joinBtn = document.getElementById("joinBtn");
const createBtn = document.getElementById("createBtn");
const roomInput = document.getElementById("roomId");
const statusText = document.getElementById("status");
const connDot = document.getElementById("connDot");
const roomHint = document.getElementById("roomHint");

// ✅ device name input
const deviceNameInput = document.getElementById("deviceName");

const chatSection = document.getElementById("chatSection");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const fileInput = document.getElementById("fileInput");
// ✅ Drag & Drop support
setTimeout(() => { try { enableDragDrop(); } catch {} }, 0);
const fileStatus = document.getElementById("fileStatus");
const progressBar = document.getElementById("progressBar");
const speedText = document.getElementById("speedText");
const progressText = document.getElementById("progressText");
const etaText = document.getElementById("etaText");

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Modal
const modalBg = document.getElementById("modalBg");
const modalInfo = document.getElementById("modalInfo");
const acceptBtn = document.getElementById("acceptBtn");
const rejectBtn = document.getElementById("rejectBtn");

// ================= Device Name (no random names) =================
function defaultDeviceName() {
  const ua = navigator.userAgent || "";
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const platform =
    (navigator.userAgentData && navigator.userAgentData.platform) ||
    navigator.platform ||
    "Device";

  const browser =
    ua.includes("Edg") ? "Edge" :
      ua.includes("Chrome") ? "Chrome" :
        ua.includes("Firefox") ? "Firefox" :
          ua.includes("Safari") ? "Safari" : "Browser";

  return `${isMobile ? "Phone" : "PC"}-${browser}-${platform}`;
}

function getDeviceName() {
  const v = (deviceNameInput?.value || "").trim();
  return v || defaultDeviceName();
}

try { ensureQueueUI(); ensureRecvQueueUI(); } catch {}

if (deviceNameInput) {
  deviceNameInput.value =
    localStorage.getItem("deviceName") || defaultDeviceName();
  deviceNameInput.addEventListener("input", () => {
    localStorage.setItem("deviceName", getDeviceName());
  });
}

// ================= WhatsApp-like Chat UI (NO HTML change) =================
(function injectChatStyles() {
  const css = `
    #chatBox { padding: 10px; }
    .msgRow { display:flex; margin: 6px 0; }
    .msgRow.mine { justify-content:flex-end; }
    .msgRow.other { justify-content:flex-start; }
    .bubble {
      max-width: 72%;
      padding: 10px 12px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.25;
      box-shadow: 0 6px 14px rgba(0,0,0,.08);
      word-break: break-word;
    }
    .bubble.mine { background: rgba(220,248,198,.95); }
    .bubble.other { background: rgba(255,255,255,.92); }
    .bubble .name { font-weight: 800; font-size: 12px; opacity: .75; margin-bottom: 4px; }
    .typingLine { font-size: 13px; opacity: .75; padding: 6px 10px; }
  `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
})();

// Typing indicator (NO HTML change)
const typingLine = document.createElement("div");
typingLine.className = "typingLine";
typingLine.style.display = "none";
if (chatSection) chatSection.appendChild(typingLine);

function showTyping(text) {
  typingLine.innerText = text;
  typingLine.style.display = text ? "block" : "none";
}

// Helpers
function addMsg(html) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = html;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addChatBubble({ user, text, mine }) {
  const row = document.createElement("div");
  row.className = `msgRow ${mine ? "mine" : "other"}`;

  const bubble = document.createElement("div");
  bubble.className = `bubble ${mine ? "mine" : "other"}`;

  bubble.innerHTML = `
    <div class="name">${user}</div>
    <div class="text">${text}</div>
  `;

  row.appendChild(bubble);
  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function fmtBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}
function formatETA(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "--";
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}m ${ss}s`;
}
function resetTransferUI() {
  progressBar.value = 0;
  speedText.innerText = "Speed: 0 MB/s";
  progressText.innerText = "0% (0 B / 0 B)";
  etaText.innerText = "Remaining: --";
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  cancelBtn.disabled = true;
}
function setStatus(text) { fileStatus.innerText = text; }
function setConnectedUI(isConnected, msg, hint = "") {
  connDot.classList.toggle("green", !!isConnected);
  statusText.innerText = msg || (isConnected ? "Connected" : "Not Connected");
  roomHint.innerText = hint || "";
}
function setProgressBytes(doneBytes, totalBytes) {
  const pct = totalBytes > 0 ? Math.floor((doneBytes / totalBytes) * 100) : 0;
  progressBar.value = Math.min(100, pct);
  progressText.innerText = `${Math.min(100, pct)}% (${fmtBytes(doneBytes)} / ${fmtBytes(totalBytes)})`;
}

// ================= Room create/join =================
let currentRoom = "";
function joinRoom(roomId, mode) {
  currentRoom = roomId;

  loadAutoAcceptFlag();

  // ✅ send deviceName with join-room
  socket.emit("join-room", { roomId, deviceName: getDeviceName() });

  chatSection.style.display = "block";
  if (mode === "create") {
    setConnectedUI(false, "Room created", `Room: ${roomId} — Waiting for someone to join...`);
    addMsg(`<span class="muted">🆕 Room created: <b>${roomId}</b> (waiting...)</span>`);
  } else {
    setConnectedUI(false, "Joining...", `Room: ${roomId}`);
    addMsg(`<span class="muted">➡️ Joined room: <b>${roomId}</b></span>`);
  }
}
createBtn.onclick = () => {
  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  roomInput.value = id;
  joinRoom(id, "create");
};
joinBtn.onclick = () => {
  const room = roomInput.value.trim();
  if (!room) return;
  joinRoom(room, "join");
};
socket.on("room-status", ({ room, users }) => {
  if (room !== currentRoom) return;
  if (users >= 2) {
    setConnectedUI(true, "Connected", `Room: ${room} — Both connected`);
    addMsg(`<span class="muted">✅ Peer joined. Connected.</span>`);
  } else {
    setConnectedUI(false, "Waiting...", `Room: ${room} — Waiting for someone to join...`);
  }
});

// ================= Chat =================
let typingTimer = null;

messageInput?.addEventListener("input", () => {
  // typing start
  socket.emit("typing", { roomId: currentRoom, user: getDeviceName() });

  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit("stop-typing", { roomId: currentRoom, user: getDeviceName() });
  }, 900);
});

socket.on("typing", ({ user }) => {
  if (!user) return;
  showTyping(`${user} is typing...`);
});

socket.on("stop-typing", () => {
  showTyping("");
});

sendBtn.onclick = () => {
  const message = messageInput.value.trim();
  if (!message) return;

  socket.emit("send-message", message);

  // ✅ local echo (WhatsApp right side)
  addChatBubble({ user: "You", text: message, mine: true });

  messageInput.value = "";
  socket.emit("stop-typing", { roomId: currentRoom, user: getDeviceName() });
};

// server sends user = deviceName
socket.on("receive-message", (data) => {
  // Skip if this is our own message echoed back by server
  // (server should use socket.to(room).emit but if it broadcasts to all, we filter here)
  if (data.fromSelf) return;
  addChatBubble({ user: data.user || "Peer", text: data.text || "", mine: false });
});

// ================= WebRTC =================
// ✅ OPTIMIZED: India-first TURN config for max speed LAN + WAN
//
// HOW IT WORKS:
//   1. STUN first — if both peers are on same LAN or have open NAT, P2P direct = fastest (30-100 MB/s)
//   2. India TURN (self-hosted) — if NAT blocks direct, relay via India VPS = low latency all-India
//   3. Metered global — fallback only if India TURN is unreachable
//
// TO SET UP YOUR OWN INDIA TURN SERVER (recommended for best speed):
//   - Rent a VPS in Mumbai/Bangalore: DigitalOcean (ap-south-1), AWS Mumbai, Vultr Mumbai
//   - Run coturn: `apt install coturn` then configure /etc/turnserver.conf
//   - Replace INDIA_TURN_HOST/USER/PASS below with your values
//   - Cost: ~₹400-800/month for a basic VPS handles 50+ simultaneous transfers
//
// ⚠️ Without India TURN, cross-India traffic routes via Singapore/US = 2-3 MB/s cap
// ================= WebRTC =================

// ✅ Set these to your self-hosted India TURN server (see instructions above)
// Leave as empty string "" to skip India TURN and use only Metered fallback
const INDIA_TURN_HOST = "";        // e.g. "123.45.67.89" or "turn.yourapp.in"
const INDIA_TURN_USER = "";        // coturn username
const INDIA_TURN_PASS = "";        // coturn credential

function buildIceServers() {
  const servers = [
    // Multiple STUN servers — LAN/open-NAT = direct P2P, zero relay overhead
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ];

  // ✅ India TURN — add only if configured (replace with your VPS creds)
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
    console.warn("[P2P] No India TURN configured — cross-India WAN will use Metered (slower). See INDIA_TURN_HOST.");
  }

  // ✅ Metered global TURN — fallback for when India TURN is missing or unreachable
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
  // ✅ Hint browser to prefer UDP (faster) over TCP when both work
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
};

let pc = null;
let dc = null;
let peerSocketId = null;
let pendingIncoming = null;
let outgoingFile = null;

let fileWorker = null;


// ================= Transfer Tuning =================
// Based on official Google WebRTC datatransfer sample pattern.
//
// KEY INSIGHT: dc.bufferedAmount reads 0 in Chrome when SCTP flows freely.
// It only shows non-zero when SCTP is congested. So checking bufferedAmount
// before dc.send() DOES NOT protect you — by the time it's non-zero the
// queue is already full. Checking it causes the OperationError you see.
//
// CORRECT PATTERN: maintain your OWN byte counter. Send in a while-loop.
// Stop at HIGH_WATER_MARK. Wait for 'bufferedamountlow' event to resume.
// This is exactly what Google's official sample does.
const CHUNK_SIZE = 256 * 1024;  // 256KB chunks

// LOW_WATER_MARK: when dc buffer drains below this, bufferedamountlow fires → resume
const LOW_WATER_MARK  = CHUNK_SIZE;  // 256KB

// HIGH_WATER_MARK: our own send counter. Stop when we've sent this many unacked bytes.
// Needs to be large enough to keep the pipe full on high-latency TURN links.
// Chrome's hard SCTP limit is 16MB — we stay safely below at 8MB.
// On a 200ms RTT TURN link: bandwidth-delay product = speed * RTT.
// At 5MB/s * 0.2s = 1MB needed minimum. 8MB gives 8x headroom.
const HIGH_WATER_MARK = 8 * 1024 * 1024;  // 8MB

const BUFFER_LOW = LOW_WATER_MARK;
const BUFFER_MAX = HIGH_WATER_MARK;

const ACK_EVERY_BYTES = 4 * 1024 * 1024;
const MAX_ACK_AHEAD = 256 * 1024 * 1024;
const PIPELINE_DEPTH = 8;

// IMPORTANT: memory limit
const MEMORY_MAX_BYTES = 300 * 1024 * 1024;

// Graceful close flags
let gracefulClosing = false;
let transferCompleted = false;

// Sender state
let sendState = {
  running: false,
  paused: false,
  canceled: false,
  offset: 0,
  file: null,
  ackBytes: 0,
  lastAckTickT: 0,
  lastAckTickB: 0,
  ackEma: 0,
  gotComplete: false,
};

// Receiver state
let incomingFile = null;

// watchdog timer id
let doneResendTimer = null;
// last status from receiver
let lastStatusRes = null;

// ===== READY handshake (fix 99% stuck) =====
let receiverReady = false;
let receiverReadyResolver = null;
function resetReceiverReady() {
  receiverReady = false;
  receiverReadyResolver = null;
}
function waitReceiverReady(timeoutMs = 120000) {
  if (receiverReady) return Promise.resolve(true);
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(false), timeoutMs);
    receiverReadyResolver = (ok) => {
      clearTimeout(t);
      resolve(!!ok);
    };
  });
}
function markReceiverReady(ok = true) {
  receiverReady = !!ok;
  if (receiverReadyResolver) {
    const r = receiverReadyResolver;
    receiverReadyResolver = null;
    r(!!ok);
  }
}

// retry guard
let retryInProgress = false;

// Buttons
pauseBtn.onclick = () => {
  if (!sendState.running) return;
  sendState.paused = true;
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
  setStatus("⏸ Paused");
  try { fileWorker?.postMessage({ type: "pause" }); } catch { }
};
resumeBtn.onclick = () => {
  if (!sendState.running) return;
  sendState.paused = false;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
  setStatus(`Sending: ${sendState.file?.name || ""}`);
  try {
    fileWorker?.postMessage({ type: "resume" });
    // ✅ Re-kick the pipeline after resume (pipeline was drained while paused)
    // fillPipeline is called from within the chunk handler automatically,
    // but we need to seed it again since inFlight may be 0 after a pause.
    // We do this by sending PIPELINE_DEPTH pulls directly.
    for (let i = 0; i < PIPELINE_DEPTH; i++) {
      fileWorker?.postMessage({ type: "pull" });
    }
  } catch { }
};
cancelBtn.onclick = () => cancelTransfer("You canceled transfer", true, getDeviceName());

function safeClosePeer() {
  gracefulClosing = true;
  peerGeneration++;          // invalidate any pending dc.onclose from old connection
  try { dc?.close(); } catch { }
  try { pc?.close(); } catch { }
  dc = null;
  pc = null;
  peerSocketId = null;

  if (doneResendTimer) {
    clearInterval(doneResendTimer);
    doneResendTimer = null;
  }

  resetReceiverReady();
  retryInProgress = false;
  setTimeout(() => (gracefulClosing = false), 800);
}

function cancelTransfer(reason, notifyPeer, canceledBy) {
  if (transferCompleted) return;

  if (doneResendTimer) {
    clearInterval(doneResendTimer);
    doneResendTimer = null;
  }

  markReceiverReady(false);

  if (sendState.running) {
    sendState.canceled = true;
    try { fileWorker?.postMessage({ type: "cancel" }); } catch { }
    try { if (dc?.readyState === "open") dc.send(JSON.stringify({ type: "cancel", by: canceledBy || getDeviceName() })); } catch { }
    if (notifyPeer && peerSocketId) {
      try { socket.emit("file-cancel", { to: peerSocketId, by: canceledBy || getDeviceName(), reason }); } catch { }
    }
  }

  incomingFile = null;
  setStatus("❌ Transfer canceled");
  resetTransferUI();
  noSleepStop();
  safeClosePeer();
  addMsg(`<span class="muted">❌ ${reason}</span>`);
  try {
    const f = sendState?.file || outgoingFile;
    if (f) upsertSentItem(f._qid || `${f.name}|${f.size}`, f.name, f.size, "canceled", sendState?.ackBytes || 0, f.size);
    renderQueueUI(null);
    renderRecvQueueUI();
  } catch {}
  try { renderQueueUI(null); } catch {}
}

socket.on("file-cancel", (data) => {
  if (transferCompleted) return;
  const by = data?.by || "Peer";
  cancelTransfer(`${by} canceled transfer`, false);
});

// ===== Extra log helpers (exact reason) =====

// ✅ NEW: Detects LAN vs WAN path and logs expected speed
async function logSelectedCandidateAndAdapt(tag = "") {
  try {
    if (!pc) return;
    const stats = await pc.getStats();
    let selectedPair = null;

    stats.forEach((r) => {
      if (r.type === "transport" && r.selectedCandidatePairId) {
        selectedPair = stats.get(r.selectedCandidatePairId);
      }
    });

    if (!selectedPair) return;

    const local = stats.get(selectedPair.localCandidateId);
    const remote = stats.get(selectedPair.remoteCandidateId);

    const localType = local?.candidateType;   // "host" = LAN, "srflx" = STUN, "relay" = TURN
    const remoteType = remote?.candidateType;
    const rtt = selectedPair.currentRoundTripTime;

    let pathDesc = "unknown";
    let expectedSpeed = "";

    if (localType === "host" && remoteType === "host") {
      pathDesc = "🟢 DIRECT LAN (same network)";
      expectedSpeed = "Expected: 30-100+ MB/s";
    } else if (localType === "srflx" || remoteType === "srflx") {
      pathDesc = "🟡 DIRECT WAN (STUN, NAT traversal)";
      expectedSpeed = "Expected: limited by ISP upload speed";
    } else if (localType === "relay" || remoteType === "relay") {
      const relayAddr = local?.address || remote?.address || "";
      const isIndia = relayAddr.includes(INDIA_TURN_HOST || "NOINDIA");
      pathDesc = isIndia
        ? "🟠 RELAY via India TURN (low latency)"
        : "🔴 RELAY via Metered/Global TURN (higher latency, ~2-5 MB/s cap)";
      expectedSpeed = isIndia
        ? "Expected: 5-20 MB/s (depends on ISP)"
        : "Expected: 2-5 MB/s — set up India TURN for better speed";
    }

    console.log(`[P2P][PATH_DETECTED]${tag ? `(${tag})` : ""}`, {
      path: pathDesc,
      expectedSpeed,
      localType,
      remoteType,
      rtt: rtt ? `${(rtt * 1000).toFixed(1)}ms` : "unknown",
      protocol: local?.protocol,
      nominated: selectedPair.nominated,
      availableOutgoingBitrate: selectedPair.availableOutgoingBitrate,
      bytesSent: selectedPair.bytesSent,
    });

    addMsg(`<span class="muted">📡 Path: ${pathDesc} — ${expectedSpeed}</span>`);
  } catch (e) {
    console.log("[P2P] logSelectedCandidateAndAdapt error", e);
  }
}

async function logSelectedCandidatePair(tag = "") {
  return logSelectedCandidateAndAdapt(tag);
}

// Peer connection
async function createPeerConnection() {
  peerGeneration++;  // new connection = new generation
  pc = new RTCPeerConnection(RTC_CONFIG);

  pc.onicegatheringstatechange = () => {
    console.log("[P2P] iceGatheringState:", pc.iceGatheringState);
  };

  pc.oniceconnectionstatechange = () => {
    console.log("[P2P] iceConnectionState:", pc.iceConnectionState);

    if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
      logSelectedCandidatePair("ice");
    }
    if (pc.iceConnectionState === "failed") {
      addMsg(`<span class="muted">⚠️ ICE failed. TURN required on many networks. Check TURN creds.</span>`);
    }
  };

  // auto-retry on failed (kept minimal)
  pc.onconnectionstatechange = () => {
    console.log("[P2P] connectionState:", pc.connectionState);

    if (pc.connectionState === "connected") {
      setTimeout(() => logSelectedCandidateAndAdapt(), 600);
    }

    if (pc.connectionState === "connected") {
      logSelectedCandidateAndAdapt();
    }

    if (pc.connectionState === "failed") {
      addMsg(`<span class="muted">⚠️ Connection failed. Retrying...</span>`);

      if (retryInProgress) return;
      retryInProgress = true;

      try { dc?.close(); } catch { }
      try { pc?.close(); } catch { }
      dc = null;
      pc = null;

      if (peerSocketId && !transferCompleted && !sendState.canceled) {
        setTimeout(() => {
          makeOfferAndConnect()
            .then(() => { retryInProgress = false; })
            .catch(() => { retryInProgress = false; });
        }, 900);
      } else {
        retryInProgress = false;
      }
    }
  };

  pc.onicecandidate = (e) => {
    if (e.candidate && peerSocketId) {
      console.log("[P2P] ICE candidate:", e.candidate.candidate);
      socket.emit("webrtc-ice", { to: peerSocketId, candidate: e.candidate });
    } else {
      console.log("[P2P] ICE gathering complete");
    }
  };

  pc.onicecandidateerror = (e) => {
    console.log("[P2P] icecandidateerror:", e?.errorCode, e?.errorText, e?.url);
  };

  pc.ondatachannel = (event) => {
    dc = event.channel;
    setupDataChannel();
  };
}

// Each PeerConnection gets a unique generation number.
// dc.onclose checks its generation against the current one —
// if it's stale (old connection), it does nothing.
let peerGeneration = 0;

function setupDataChannel() {
  if (!dc) return;

  const myGen = peerGeneration;  // capture generation at setup time

  dc.binaryType = "arraybuffer";
  dc.bufferedAmountLowThreshold = BUFFER_LOW;

  dc.onerror = (e) => {
    const err = e?.error;
    console.error("[P2P] dc.onerror", {
      errorDetail: err?.errorDetail,
      message: err?.message,
      sctpCauseCode: err?.sctpCauseCode,
    });
  };

  dc.onopen = () => {
    dlog("DataChannel open (gen " + myGen + ")");
    addMsg(`<span class="muted">✅ DataChannel open (P2P ready)</span>`);
    if (outgoingFile) sendFile(outgoingFile).catch(console.error);
  };

  dc.onclose = () => {
    dlog("DataChannel closed (gen " + myGen + ", current " + peerGeneration + ")");
    // Ignore close from a previous generation — it's expected after safeClosePeer
    if (myGen !== peerGeneration) return;
    addMsg(`<span class="muted">⚠️ DataChannel closed</span>`);
    if (gracefulClosing || transferCompleted) return;
    if (sendState.running && !sendState.canceled) cancelTransfer("Connection closed", true);
  };

  dc.onmessage = async (event) => {
    if (typeof event.data === "string") {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      if (msg.type === "meta") {
        dlog("RX meta", msg.meta);
        await startReceiver(msg.meta);
        return;
      }

      if (msg.type === "ready") {
        dlog("RX ready", msg);
        markReceiverReady(true);
        return;
      }

      if (msg.type === "ack") {
        if (sendState.running) {
          sendState.ackBytes = Math.max(sendState.ackBytes, msg.bytes || 0);
          updateSenderUIByAck();
        }
        return;
      }

      if (msg.type === "status-res") {
        lastStatusRes = msg;
        dlog("RX status-res", msg);
        return;
      }

      if (msg.type === "status-req") {
        const r = incomingFile
          ? { receivedBytes: incomingFile.receivedBytes, size: incomingFile.meta.size, sawDone: incomingFile.sawDone }
          : { receivedBytes: 0, size: 0, sawDone: false };
        try { dc.send(JSON.stringify({ type: "status-res", ...r })); } catch { }
        return;
      }

      if (msg.type === "complete") {
        dlog("RX complete");
        sendState.gotComplete = true;
        transferCompleted = true;
        setStatus(`✅ Sent: ${sendState.file?.name || ""}`);
        try {
          const f = sendState.file;
          if (f) upsertSentItem(f._qid || `${f.name}|${f.size}`, f.name, f.size, "done", f.size, f.size);
          renderQueueUI(null);
        } catch {}
        setProgressBytes(sendState.file?.size || 0, sendState.file?.size || 1);
        etaText.innerText = "Remaining: 0m 0s";

        sendState.running = false;
        outgoingFile = null;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
        cancelBtn.disabled = true;

        // safeClosePeer increments peerGeneration — old dc.onclose is now a no-op
        safeClosePeer();

        sending = false;
        transferCompleted = false;   // reset NOW so startNextFile can run clean
        try { renderQueueUI(null); } catch {}

        // Wait for gracefulClosing window (800ms in safeClosePeer) then start next
        setTimeout(() => startNextFile(), 900);
        return;
      }

      if (msg.type === "done") {
        dlog("RX done");
        await finalizeIncomingIfReady();
        return;
      }

      if (msg.type === "cancel") {
        dlog("RX cancel");
        try {
          const id = incomingFile?.meta?.id || `${incomingFile?.meta?.name}|${incomingFile?.meta?.size}`;
          if (id && incomingFile?.meta) { upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0, "canceled", incomingFile.receivedBytes || 0, incomingFile.meta.size || 0); renderRecvQueueUI(); }
        } catch {}
        cancelTransfer(`${msg.by || "Peer"} canceled transfer`, false);
        return;
      }
      return;
    }

    await handleIncomingChunk(event.data);
  };
}

// Signaling
async function makeOfferAndConnect() {
  await createPeerConnection();
  dc = pc.createDataChannel("file");
  setupDataChannel();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("webrtc-offer", { to: peerSocketId, sdp: pc.localDescription });
}

socket.on("webrtc-offer", async ({ from, sdp }) => {
  peerSocketId = from;
  await createPeerConnection();
  await pc.setRemoteDescription(sdp);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("webrtc-answer", { to: from, sdp: pc.localDescription });
});

socket.on("webrtc-answer", async ({ sdp }) => {
  await pc.setRemoteDescription(sdp);
});

socket.on("webrtc-ice", async ({ candidate }) => {
  try { await pc.addIceCandidate(candidate); } catch (e) {
    console.log("[P2P] addIceCandidate error", e);
  }
});

// File offer UI
fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files);
  enqueueFilesForSend(files);
  fileInput.value = "";
});

function startNextFile() {

  if (sending) return;
  if (fileQueue.length === 0) return;

  const file = fileQueue.shift();

  sending = true;

  transferCompleted = false;
  gracefulClosing = false;
  resetReceiverReady();
  retryInProgress = false;

  outgoingFile = file;
  resetTransferUI();

  setStatus(`Waiting for receiver... (${file.name}, ${fmtBytes(file.size)})`);
  try { renderQueueUI(file); } catch {}

  socket.emit("file-offer", {
    id: file._qid || `${file.name}|${file.size}`,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream"
  });
}

// server sends fromName (device name)

socket.on("file-offer", ({ from, fromName, fromShort, meta }) => {
  pendingIncoming = { from, meta };

  try {
    const id = meta?.id || `${meta?.name}|${meta?.size}`;
    upsertRecvItem(id, meta?.name, meta?.size || 0, "pending", 0, meta?.size || 0);
    renderRecvQueueUI();
  } catch {}

  const who = fromName || fromShort || (from ? from.substring(0, 5) : "User");

  if (autoAcceptThisRoom) {
    addMsg(`<span class="muted">✅ Auto-accepted from <b>${who}</b>: ${meta.name} (${fmtBytes(meta.size)})</span>`);
    socket.emit("file-answer", { to: from, accepted: true });
    peerSocketId = from;
    pendingIncoming = null;
    modalBg.style.display = "none";
    setStatus("Auto-accepted. Connecting P2P...");
    return;
  }

  modalInfo.innerText = `From: ${who}\nFile: ${meta.name}\nSize: ${fmtBytes(meta.size)}\nType: ${meta.type}`;
  modalBg.style.display = "flex";
});


rejectBtn.onclick = () => {
  if (!pendingIncoming) return;
  socket.emit("file-answer", { to: pendingIncoming.from, accepted: false });
  try {
    const id = pendingIncoming?.meta?.id || `${pendingIncoming?.meta?.name}|${pendingIncoming?.meta?.size}`;
    if (id && pendingIncoming?.meta) { upsertRecvItem(id, pendingIncoming.meta.name, pendingIncoming.meta.size || 0, "canceled", 0, pendingIncoming.meta.size || 0); renderRecvQueueUI(); }
  } catch {}
  pendingIncoming = null;
  modalBg.style.display = "none";
};

acceptBtn.onclick = async () => {
  if (!pendingIncoming) return;

  transferCompleted = false;
  gracefulClosing = false;
  resetReceiverReady();
  retryInProgress = false;

  const meta = pendingIncoming.meta;
  const needDisk = meta.size > MEMORY_MAX_BYTES;

  // ── Ask for save location NOW (before WebRTC connects) ──────────────────────
  // This way the user picks a file before any data arrives, not mid-transfer.
  let writable = null;
  if (needDisk) {
    const canDisk = "showSaveFilePicker" in window && window.isSecureContext;
    if (!canDisk) {
      addMsg(`<span class="muted">⚠️ Large file (${fmtBytes(meta.size)}) needs HTTPS/localhost for disk saving.</span>`);
      socket.emit("file-answer", { to: pendingIncoming.from, accepted: false });
      pendingIncoming = null;
      modalBg.style.display = "none";
      return;
    }
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: meta.name });
      writable = await handle.createWritable();
      addMsg(`<span class="muted">💾 Save location chosen. Connecting...</span>`);
    } catch (e) {
      addMsg(`<span class="muted">❌ Save dialog canceled.</span>`);
      socket.emit("file-answer", { to: pendingIncoming.from, accepted: false });
      pendingIncoming = null;
      modalBg.style.display = "none";
      return;
    }
  }

  // Store writable so startReceiver can pick it up
  pendingWritable = writable;

  socket.emit("file-answer", { to: pendingIncoming.from, accepted: true });

  if (!autoAcceptThisRoom) {
    saveAutoAcceptFlag(true);
    addMsg(`<span class="muted">✅ Auto-accept enabled for this room</span>`);
  }
  peerSocketId = pendingIncoming.from;
  pendingIncoming = null;
  modalBg.style.display = "none";
  setStatus("Accepted. Connecting P2P...");
  addMsg(`<span class="muted">📥 Accepted file. Connecting P2P...</span>`);
};

socket.on("file-answer", async ({ from, accepted }) => {
  if (!accepted) {
    setStatus("Receiver rejected the file.");
    addMsg(`<span class="muted">❌ Receiver rejected.</span>`);
    outgoingFile = null;
    return;
  }
  peerSocketId = from;
  setStatus("Receiver accepted. Connecting P2P...");
  addMsg(`<span class="muted">📤 Receiver accepted. Connecting P2P...</span>`);
  await makeOfferAndConnect();
});

function waitForBufferDrain() {
  return new Promise((resolve) => {
    if (!dc) return resolve();
    if (dc.bufferedAmount <= BUFFER_LOW) return resolve();
    // ✅ Use event-driven drain instead of setInterval polling — lower latency resume
    const onLow = () => {
      dc.removeEventListener("bufferedamountlow", onLow);
      resolve();
    };
    dc.addEventListener("bufferedamountlow", onLow);
    // Safety fallback in case event never fires
    const iv = setInterval(() => {
      if (!dc || dc.readyState !== "open" || dc.bufferedAmount <= BUFFER_LOW) {
        clearInterval(iv);
        dc?.removeEventListener("bufferedamountlow", onLow);
        resolve();
      }
    }, 10);
  });
}

function waitForBufferedZero(timeoutMs = 45000) {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      if (!dc || dc.readyState !== "open") return resolve(false);
      if (dc.bufferedAmount === 0) return resolve(true);
      if (performance.now() - start > timeoutMs) return resolve(false);
      setTimeout(tick, 50);
    };
    tick();
  });
}

async function waitForAckWindow() {
  // ✅ Uses MAX_ACK_AHEAD — 256MB window keeps pipeline full even at 200ms RTT
  while (sendState.running && !sendState.canceled) {
    const ahead = sendState.offset - sendState.ackBytes;
    if (ahead <= MAX_ACK_AHEAD) return;
    await new Promise((r) => setTimeout(r, 20)); // ✅ 30ms → 20ms poll
  }
}

function updateSenderUIByAck() {
  const file = sendState.file;
  if (!file) return;

  setProgressBytes(sendState.ackBytes, file.size);
  try { upsertSentItem(file._qid || `${file.name}|${file.size}`, file.name, file.size, "sending", sendState.ackBytes, file.size); renderQueueUI(file); } catch {}

  const now = performance.now();
  const dt = (now - sendState.lastAckTickT) / 1000;

  if (!sendState.lastAckTickT) {
    sendState.lastAckTickT = now;
    sendState.lastAckTickB = sendState.ackBytes;
    return;
  }

  if (dt >= 1.0) {
    const db = sendState.ackBytes - sendState.lastAckTickB;
    const inst = db / dt;
    sendState.ackEma = sendState.ackEma ? 0.8 * sendState.ackEma + 0.2 * inst : inst;

    const mbps = sendState.ackEma / 1024 / 1024;
    speedText.innerText = `Speed: ${mbps.toFixed(2)} MB/s`;

    const remaining = file.size - sendState.ackBytes;
    const etaSec = sendState.ackEma > 0 ? remaining / sendState.ackEma : NaN;
    etaText.innerText = `Remaining: ${formatETA(etaSec)}`;

    sendState.lastAckTickT = now;
    sendState.lastAckTickB = sendState.ackBytes;
  }
}

async function safeSendArrayBuffer(buf) {
  while (true) {
    if (!dc || dc.readyState !== "open") throw new Error("DataChannel not open");

    // ✅ Hard safety gate (prevents OperationError when bufferedAmount spikes)
    while (dc && dc.readyState === "open" && dc.bufferedAmount > (BUFFER_MAX - CHUNK_SIZE)) {
      await waitForBufferDrain();
      await new Promise((r) => setTimeout(r, 10));
    }

    try {
      dc.send(buf);
      return;
    } catch (err) {
      dlog("dc.send threw, bufferedAmount=", dc?.bufferedAmount, "err=", err?.name || err);
      await waitForBufferDrain();
      await new Promise((r) => setTimeout(r, 20));
      if (sendState.canceled) throw err;
    }
  }
}

// ===== Sender =====
// CORRECT PATTERN — based on Google's official WebRTC datatransfer sample:
// https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
//
// dc.bufferedAmount is UNRELIABLE in Chrome — it reads 0 while SCTP flows,
// then jumps to 16MB when congested. Checking it before send() doesn't help.
//
// Instead: track your own `myBuffered` counter. Send in a while-loop.
// Stop when myBuffered >= HIGH_WATER_MARK. Resume ONLY on 'bufferedamountlow' event.
// Worker pre-reads chunks from disk into a queue so we never stall on I/O.

async function sendFile(file) {
  if (!dc || dc.readyState !== "open") return;

  resetTransferUI();
  setStatus(`Sending: ${file.name} (${fmtBytes(file.size)})`);
  addMsg(`<b>Sending:</b> ${file.name} (${fmtBytes(file.size)})`);
  dlog("sendFile start", { name: file.name, size: file.size, CHUNK_SIZE, HIGH_WATER_MARK, LOW_WATER_MARK });
  try { upsertSentItem(file._qid || `${file.name}|${file.size}`, file.name, file.size, "sending", 0, file.size); renderQueueUI(file); } catch {}

  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
  cancelBtn.disabled = false;

  sendState.running  = true;
  sendState.paused   = false;
  sendState.canceled = false;
  sendState.offset   = 0;
  sendState.file     = file;
  sendState.ackBytes = 0;
  sendState.lastAckTickT = 0;
  sendState.lastAckTickB = 0;
  sendState.ackEma   = 0;
  sendState.gotComplete = false;

  noSleepStart(); // prevent tab throttling during transfer

  resetReceiverReady();
  retryInProgress = false;

  // Send metadata
  try {
    dc.send(JSON.stringify({
      type: "meta",
      meta: { id: file._qid || `${file.name}|${file.size}`, name: file.name, size: file.size, type: file.type || "application/octet-stream" },
    }));
  } catch (e) { dlog("meta send failed", e); return; }

  setStatus(`Waiting receiver ready... (${file.name})`);
  const okReady = await waitReceiverReady(120000);
  if (!okReady) { cancelTransfer("Receiver not ready (timeout).", true); return; }
  setStatus(`Sending: ${file.name} (${fmtBytes(file.size)})`);

  if (!fileWorker) fileWorker = new Worker("worker.js");

  // ── Chunk queue (pre-read from disk by worker) ──────────────────────────────
  const chunkQueue = [];       // ArrayBuffers ready to send
  let workerDone   = false;    // worker has read all bytes
  let allSent      = false;    // we have called dc.send() for all chunks
  let myBuffered   = 0;        // OUR byte counter (not dc.bufferedAmount)
  let sending      = false;    // are we currently inside the send loop?

  // ── Set up bufferedamountlow threshold ONCE on the channel ─────────────────
  dc.bufferedAmountLowThreshold = LOW_WATER_MARK;

  // ── The send loop (Google's pattern) ────────────────────────────────────────
  function sendLoop() {
    if (!sendState.running || sendState.canceled || allSent) return;
    if (sending) return;
    sending = true;

    while (chunkQueue.length > 0) {
      if (sendState.paused || sendState.canceled) break;

      // Stop BEFORE sending if we're already at the high water mark
      if (myBuffered >= HIGH_WATER_MARK) {
        dlog("high water — waiting for drain", { myBuffered });
        break;
      }

      const buf = chunkQueue.shift();

      try {
        dc.send(buf);
      } catch (err) {
        // Truly unexpected — put chunk back and wait for next bufferedamountlow
        chunkQueue.unshift(buf);
        dlog("dc.send threw (unexpected):", err?.message, "myBuffered:", myBuffered);
        break;
      }

      myBuffered += buf.byteLength;
      sendState.offset = Math.min(file.size, sendState.offset + buf.byteLength);

      // Keep worker disk-read pipeline full
      if (!workerDone) {
        fileWorker.postMessage({ type: "pull" });
      }
    }

    sending = false;

    if (workerDone && chunkQueue.length === 0 && !allSent) {
      allSent = true;
      finalizeSend();
    }
  }

  // ── Resume when buffer drains ───────────────────────────────────────────────
  dc.addEventListener("bufferedamountlow", function onLow() {
    if (!sendState.running || sendState.canceled) {
      dc.removeEventListener("bufferedamountlow", onLow);
      return;
    }
    // Subtract LOW_WATER_MARK worth of data (what drained). Don't reset to 0 —
    // that would over-count and allow myBuffered to exceed Chrome's 16MB hard limit.
    myBuffered = Math.max(0, myBuffered - HIGH_WATER_MARK);
    sendLoop();
  });

  // ── Worker receives pre-read chunks ────────────────────────────────────────
  fileWorker.onmessage = (e) => {
    if (e.data.type === "chunk") {
      if (sendState.canceled) return;
      chunkQueue.push(e.data.buf);
      // Try to send — sendLoop is a no-op if already running or at high water
      sendLoop();
      return;
    }

    if (e.data.type === "done") {
      workerDone = true;
      dlog("worker read complete", { queueLen: chunkQueue.length });
      // If queue already drained, finalize now
      if (chunkQueue.length === 0 && !allSent) {
        allSent = true;
        finalizeSend();
      }
    }
  };

  // ── Finalize: wait for buffer to drain then send done signal ───────────────
  async function finalizeSend() {
    if (sendState.canceled) return;
    dlog("finalizeSend: waiting for buffer drain", { dcBuffered: dc?.bufferedAmount });

    // Wait for actual dc buffer to drain (best-effort)
    const drainStart = performance.now();
    while (dc && dc.readyState === "open" && dc.bufferedAmount > 0) {
      if (performance.now() - drainStart > 30000) { dlog("drain timeout"); break; }
      await new Promise((r) => setTimeout(r, 50));
    }

    dlog("sending done signal");
    try {
      if (dc && dc.readyState === "open") {
        dc.send(JSON.stringify({ type: "done" }));
        dc.send(JSON.stringify({ type: "status-req" }));
      }
    } catch (e2) { dlog("send done failed", e2); }

    if (!doneResendTimer) {
      doneResendTimer = setInterval(() => {
        if (!sendState.running || sendState.canceled || sendState.gotComplete) return;
        const size = sendState.file?.size || 0;
        const recv = lastStatusRes?.receivedBytes ?? 0;
        if (size - recv <= 0) return;
        try {
          if (dc?.readyState === "open") {
            dc.send(JSON.stringify({ type: "done" }));
            dc.send(JSON.stringify({ type: "status-req" }));
          }
        } catch { }
      }, 2000);
    }

    while (sendState.running && !sendState.canceled && !sendState.gotComplete) {
      await new Promise((r) => setTimeout(r, 150));
    }
    noSleepStop();
  }

  // ── Kick off: start worker and seed the disk-read pipeline ─────────────────
  fileWorker.postMessage({ type: "start", file, chunkSize: CHUNK_SIZE, offset: 0 });
  for (let i = 0; i < PIPELINE_DEPTH; i++) {
    fileWorker.postMessage({ type: "pull" });
  }
}
// ===== Receiver =====
// pendingWritable: set by acceptBtn before WebRTC connects, consumed here
let pendingWritable = null;

async function startReceiver(meta) {
  resetTransferUI();
  cancelBtn.disabled = false;

  const needDisk = meta.size > MEMORY_MAX_BYTES;

  incomingFile = {
    meta,
    receivedBytes: 0,
    lastAckSent: 0,
    lastT: performance.now(),
    lastB: 0,
    ema: 0,

    chunks: [],        // memory mode
    writable: null,    // disk mode
    writeChain: Promise.resolve(),  // sequential write promise chain

    sawDone: false,
    finalizing: false,
  };

  setStatus(`Receiving: ${meta.name} (${fmtBytes(meta.size)})`);
  addMsg(`<span class="muted">📥 Incoming: ${meta.name} (${fmtBytes(meta.size)})</span>`);
  addMsg(`<b>Receiving:</b> ${meta.name} (${fmtBytes(meta.size)})`);
  dlog("startReceiver", meta);
  try {
    const id = meta?.id || `${meta?.name}|${meta?.size}`;
    upsertRecvItem(id, meta.name, meta.size || 0, "receiving", 0, meta.size || 0);
    renderRecvQueueUI();
  } catch {}

  if (needDisk) {
    // Use the writable chosen by the user when they clicked Accept (before transfer)
    if (pendingWritable) {
      incomingFile.writable = pendingWritable;
      pendingWritable = null;
      addMsg(`<span class="muted">💾 Saving to disk...</span>`);
    } else {
      // Fallback: ask now (e.g. auto-accept path)
      const canDisk = "showSaveFilePicker" in window && window.isSecureContext;
      if (!canDisk) {
        addMsg(`<span class="muted">⚠️ Large file needs HTTPS/localhost for disk saving.</span>`);
        setStatus("⚠️ Large file needs disk saving (HTTPS/localhost).");
        try { dc?.send(JSON.stringify({ type: "cancel" })); } catch { }
        incomingFile = null;
        return;
      }
      try {
        const handle = await window.showSaveFilePicker({ suggestedName: meta.name });
        incomingFile.writable = await handle.createWritable();
        addMsg(`<span class="muted">💾 Saving to disk...</span>`);
      } catch (e) {
        addMsg(`<span class="muted">❌ Save dialog canceled.</span>`);
        setStatus("❌ Save canceled.");
        try { dc?.send(JSON.stringify({ type: "cancel" })); } catch { }
        incomingFile = null;
        return;
      }
    }
  } else {
    addMsg(`<span class="muted">ℹ️ File will appear in Downloads panel after transfer.</span>`);
  }

  noSleepStart(); // prevent tab throttling while receiving
  try { dc?.send(JSON.stringify({ type: "ready" })); } catch { }
}

// ── Disk write queue ─────────────────────────────────────────────────────────
// ROOT CAUSE OF CORRUPTION: FileSystemWritableFileStream.write() moves the
// internal cursor forward. If any write is skipped/dropped (e.g. due to a
// caught error in the chain), ALL subsequent writes land at the wrong offset.
//
// FIX: Always pass { type:'write', position, data } with an explicit byte
// offset derived from receivedBytes BEFORE adding the chunk. This way each
// chunk is written to its exact correct location in the file, regardless of
// what happened to previous writes. Even if a write fails and is retried,
// position never drifts.
//
// We still use a promise chain to avoid concurrent writes on the same stream.

async function handleIncomingChunk(buf) {
  if (!incomingFile) return;
  if (incomingFile.meta.size > MEMORY_MAX_BYTES && !incomingFile.writable) return;

  if (incomingFile.writable) {
    // Capture BOTH position AND writable reference NOW, at enqueue time.
    // The .then() callback runs later — by then incomingFile may be null
    // (set by finalizeIncomingFile's finally block). If we used incomingFile?.writable
    // inside the .then(), it would silently skip writes and produce a truncated file.
    const writePosition = incomingFile.receivedBytes;
    const writableRef   = incomingFile.writable;       // ← hold direct reference
    const u8 = new Uint8Array(buf.slice(0));

    incomingFile.writeChain = incomingFile.writeChain
      .then(() => writableRef.write({ type: "write", position: writePosition, data: u8 }))
      .catch((e) => {
        dlog("Disk write error at position", writePosition, e);
        // Don't call cancelTransfer here — it may already be finalized
      });
  } else {
    incomingFile.chunks.push(buf);
  }

  incomingFile.receivedBytes += buf.byteLength;
  setProgressBytes(incomingFile.receivedBytes, incomingFile.meta.size);
  try {
    const id = incomingFile.meta?.id || `${incomingFile.meta?.name}|${incomingFile.meta?.size}`;
    upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0, "receiving", incomingFile.receivedBytes, incomingFile.meta.size || 0);
    renderRecvQueueUI();
  } catch {}

  if (dc && dc.readyState === "open") {
    if (
      incomingFile.receivedBytes - incomingFile.lastAckSent >= ACK_EVERY_BYTES ||
      incomingFile.receivedBytes === incomingFile.meta.size
    ) {
      incomingFile.lastAckSent = incomingFile.receivedBytes;
      try {
        dc.send(JSON.stringify({ type: "ack", bytes: incomingFile.receivedBytes }));
      } catch (e) {
        dlog("ack send failed", e);
      }
    }
  }

  const now = performance.now();
  const dt = (now - incomingFile.lastT) / 1000;
  if (dt >= 1.0) {
    const db = incomingFile.receivedBytes - incomingFile.lastB;
    const inst = db / dt;
    incomingFile.ema = incomingFile.ema ? 0.8 * incomingFile.ema + 0.2 * inst : inst;
    const mbps = incomingFile.ema / 1024 / 1024;
    speedText.innerText = `Speed: ${mbps.toFixed(2)} MB/s`;
    const remaining = incomingFile.meta.size - incomingFile.receivedBytes;
    const etaSec = incomingFile.ema > 0 ? remaining / incomingFile.ema : NaN;
    etaText.innerText = `Remaining: ${formatETA(etaSec)}`;
    incomingFile.lastT = now;
    incomingFile.lastB = incomingFile.receivedBytes;
  }

  if (incomingFile.sawDone && incomingFile.receivedBytes >= incomingFile.meta.size && !incomingFile.finalizing) {
    // Both conditions met: sender said done AND we have all expected bytes
    dlog("all bytes received + done flag set — finalizing", {
      receivedBytes: incomingFile.receivedBytes,
      metaSize: incomingFile.meta.size,
    });
    incomingFile.finalizing = true;
    finalizeIncomingFile().catch((e) => {
      dlog("Finalize failed", e);
      cancelTransfer("Finalize failed", false);
    });
  }
}

// flushDiskQueue: wait for all pending writes to complete before closing stream
async function flushDiskQueue() {
  // incomingFile may be null by the time this resolves, so capture chain first
  const chain = incomingFile?.writeChain;
  if (chain) await chain;
}

async function finalizeIncomingIfReady() {
  if (!incomingFile) return;
  incomingFile.sawDone = true;

  if (incomingFile.receivedBytes < incomingFile.meta.size) {
    dlog("done received but bytes not complete", {
      received: incomingFile.receivedBytes,
      size: incomingFile.meta.size,
    });
    return;
  }
  if (incomingFile.finalizing) return;

  incomingFile.finalizing = true;
  await finalizeIncomingFile();
}

async function finalizeIncomingFile() {
  if (!incomingFile) return;

  // Capture writable NOW before finally{} sets incomingFile = null
  const writableRef = incomingFile.writable;
  const chainRef    = incomingFile.writeChain;

  try {
    if (writableRef) {
      // Wait for ALL queued chunk writes to finish
      await chainRef;
      await writableRef.close();
      setStatus(`✅ Saved: ${incomingFile.meta.name}`);
      try {
        const id = incomingFile.meta?.id || `${incomingFile.meta?.name}|${incomingFile.meta?.size}`;
        upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0, "done", incomingFile.meta.size || 0, incomingFile.meta.size || 0);
        renderRecvQueueUI();
      } catch {}
      addMsg(`<b>Saved to disk:</b> ${incomingFile.meta.name}`);
      // Show in downloads manager (disk-saved large file)
      addToDownloadsManager({ name: incomingFile.meta.name, size: incomingFile.meta.size, type: incomingFile.meta.type, savedToDisk: true, url: null });
    } else {
      const blob = new Blob(incomingFile.chunks, { type: incomingFile.meta.type });
      const url = URL.createObjectURL(blob);

      setStatus(`✅ Received: ${incomingFile.meta.name}`);
      try {
        const id = incomingFile.meta?.id || `${incomingFile.meta?.name}|${incomingFile.meta?.size}`;
        upsertRecvItem(id, incomingFile.meta.name, incomingFile.meta.size || 0, "done", incomingFile.meta.size || 0, incomingFile.meta.size || 0);
        renderRecvQueueUI();
      } catch {}
      addMsg(`<b>File received:</b> ${incomingFile.meta.name}`);
      // Show in downloads manager with manual download button (no auto-open/preview)
      addToDownloadsManager({ name: incomingFile.meta.name, size: incomingFile.meta.size, type: incomingFile.meta.type, savedToDisk: false, url });
    }

    transferCompleted = true;

    try { if (dc?.readyState === "open") dc.send(JSON.stringify({ type: "complete" })); } catch (e) {
      dlog("complete send failed", e);
    }

    setProgressBytes(incomingFile.meta.size, incomingFile.meta.size);
    etaText.innerText = "Remaining: 0m 0s";
    cancelBtn.disabled = true;

    safeClosePeer();
    noSleepStop();
    // Reset transferCompleted so receiver can accept the next file offer
    setTimeout(() => { transferCompleted = false; }, 200);
  } finally {
    incomingFile = null;
  }
}

// ================= Downloads Manager =================
// Shows received files as a list. No auto-preview. Click "Save" to download.
// For disk-saved files shows a note to check the chosen save location.
const receivedFiles = [];

function ensureDownloadsManager() {
  if (document.getElementById("downloadsManager")) return;
  const wrap = document.createElement("div");
  wrap.id = "downloadsManager";
  wrap.style.cssText = "margin-top:16px;";
  wrap.innerHTML = `
    <div style="font-weight:800;margin-bottom:8px;">📂 Received Files</div>
    <div id="downloadsList" style="
      max-height:200px;overflow:auto;
      border:1px solid rgba(0,0,0,.10);
      border-radius:12px;padding:8px;
      background:rgba(255,255,255,.7);
    "></div>
  `;
  // Attach after receiver queue
  const host = (typeof fileInput !== "undefined" && fileInput)
    ? (fileInput.closest(".card") || fileInput.parentElement || document.body)
    : document.body;
  host.appendChild(wrap);
}

function addToDownloadsManager({ name, size, type, savedToDisk, url }) {
  receivedFiles.push({ name, size, type, savedToDisk, url, ts: Date.now() });
  ensureDownloadsManager();
  renderDownloadsManager();
}

function renderDownloadsManager() {
  const list = document.getElementById("downloadsList");
  if (!list) return;
  if (receivedFiles.length === 0) {
    list.innerHTML = `<div style="opacity:.6;padding:6px 8px;">No files received yet</div>`;
    return;
  }
  list.innerHTML = receivedFiles.map((f, i) => {
    const ext = f.name.split(".").pop().toLowerCase();
    const icon = ["mp4","mkv","avi","mov","webm"].includes(ext) ? "🎬"
      : ["jpg","jpeg","png","gif","webp","bmp"].includes(ext) ? "🖼️"
      : ["mp3","aac","flac","wav","ogg"].includes(ext) ? "🎵"
      : ["pdf"].includes(ext) ? "📄"
      : ["zip","rar","7z","tar","gz"].includes(ext) ? "🗜️"
      : "📁";

    const actionBtn = f.savedToDisk
      ? `<span style="font-size:12px;opacity:.65;margin-left:8px;">Saved to chosen folder</span>`
      : `<button onclick="downloadReceivedFile(${i})" style="
          margin-left:8px;padding:4px 12px;border-radius:8px;border:none;
          background:#ff6b35;color:#fff;font-weight:700;cursor:pointer;font-size:12px;">
          ⬇ Save
        </button>`;

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.03);margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:8px;overflow:hidden;">
          <span style="font-size:20px;">${icon}</span>
          <div style="overflow:hidden;">
            <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">${f.name}</div>
            <div style="font-size:11px;opacity:.6;">${fmtBytes(f.size)}</div>
          </div>
        </div>
        ${actionBtn}
      </div>`;
  }).join("");
}

function downloadReceivedFile(i) {
  const f = receivedFiles[i];
  if (!f || !f.url) return;
  const a = document.createElement("a");
  a.href = f.url;
  a.download = f.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Update button to show saved state
  f.savedToDisk = true;
  renderDownloadsManager();
}