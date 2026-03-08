// ═══════════════════════════════════════════════════════════════
//  app.js  — Orchestrator
//
//  Wires together:  peer.js + transfer.js + signaling + UI
//
//  RULE: No business logic here. Only wiring.
//  If you're debugging a crash: it's in peer.js or transfer.js.
// ═══════════════════════════════════════════════════════════════

import * as Peer     from "./peer.js";
import * as Transfer from "./transfer.js";
import { NET, applyProfile, detectAndApply } from "./net.js";
import { initIceConfig } from "./ice.js";

// ── Signaling ──────────────────────────────────────────────────────────────────
const socket = io();
window._signalingSocket = socket;   // peer.js reads this for ICE candidates

// ── Fetch ICE config from server on startup ────────────────────────────────────
// SECURITY FIX: credentials are served from server env vars, not hardcoded.
// Must be called before any RTCPeerConnection is created.
initIceConfig().catch(e => console.warn("[APP] ICE init failed:", e));

// ── Worker reference (mutable so reconnect can update chunk size) ──────────────
const workerRef = { current: null };

// ── getDc helper: always returns the current open DC or null ──────────────────
const getDc = () => Peer.getPrimaryDc();

// ── broadcastFn: send ArrayBuffer to all open DCs ─────────────────────────────
function broadcastFn(buf) {
  const dcs = Peer.allOpenDcs();
  if (dcs.length === 0) throw new Error("No open DC");
  dcs.forEach((dc, i) => dc.send(i === 0 ? buf : buf.slice(0)));
}

// ── Peer event hooks ──────────────────────────────────────────────────────────
Peer.PeerEvents.onDcOpen = async (socketId, dc) => {
  uiLog(`✅ Connected (${socketId.slice(0,6)})`);

  // Detect network path
  const pc = Peer.getPrimaryPc();
  if (pc) await detectAndApply(pc);

  if (Transfer.sendState.running && !Transfer.sendState.canceled) {
    // ── RECONNECT: transfer in progress ─────────────────────────────────────
    uiLog(`🔄 Reconnected — resuming`);

    // Tell the new DC about its threshold
    if (typeof Transfer.sendState._onReconnect === "function") {
      Transfer.sendState._onReconnect(dc);
    }

    // Ask receiver to confirm its offset BEFORE we send any data.
    // We do NOT call sendLoop() here — _onResumeConfirmed does that
    // after the receiver replies.
    try {
      dc.send(JSON.stringify({ type: "resume-offset", offset: Transfer.sendState.offset }));
    } catch(e) { console.warn("[APP] resume-offset send failed:", e); }

    // Seed the worker so chunks will be ready in the queue once confirmed
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "seek", offset: Transfer.sendState.offset, chunkIndex: Transfer.sendState.chunkIndex });
      for (let i = 0; i < NET.pipelineDepth; i++) workerRef.current.postMessage({ type: "pull" });
    }
  } else if (outgoingFile && !Transfer.sendState.running) {
    // ── FRESH: first connection for this file ────────────────────────────────
    if (!workerRef.current) workerRef.current = new Worker("worker.js");
    Transfer.sendFile(outgoingFile, getDc, broadcastFn, workerRef).catch(console.error);
  }
};

Peer.PeerEvents.onDcClose = (socketId) => {
  uiLog(`⚠️ Connection closed (${socketId.slice(0,6)})`);
};

Peer.PeerEvents.onDcMessage = async (socketId, msg) => {
  const dc = getDc();

  // ── Sender receives ────────────────────────────────────────────────────────
  if (msg.type === "ack") {
    Transfer.onAck(msg.bytes || 0);
    return;
  }

  if (msg.type === "resume-offset") {
    // Receiver confirmed how many bytes it has. Seek and resume.
    if (typeof Transfer.sendState._onResumeConfirmed === "function") {
      Transfer.sendState._onResumeConfirmed(msg.offset || 0);
    }
    return;
  }

  if (msg.type === "complete") {
    Transfer.sendState.gotComplete = true;
    Transfer.sendState.running     = false;
    outgoingFile = null;
    sending = false;
    uiLog("✅ Receiver confirmed complete");
    UI.onTransferComplete();
    Peer.closeAll();
    setTimeout(() => startNextFile(), 900);
    return;
  }

  // ── Receiver receives ──────────────────────────────────────────────────────
  if (msg.type === "meta") {
    const result = Transfer.startReceiver(msg.meta, pendingWritable);
    pendingWritable = null;

    if (result.reconnect) {
      // Same transfer after reconnect — just re-send ready + our confirmed offset
      try {
        dc?.send(JSON.stringify({ type: "resume-offset", offset: result.receivedBytes }));
        dc?.send(JSON.stringify({ type: "ready" }));
      } catch {}
    } else {
      try { dc?.send(JSON.stringify({ type: "ready" })); } catch {}
    }
    return;
  }

  if (msg.type === "ready") {
    Transfer.markReady(true);
    return;
  }

  if (msg.type === "done") {
    Transfer.onDoneReceived();
    try { dc?.send(JSON.stringify({ type: "complete" })); } catch {}
    return;
  }

  if (msg.type === "status-req") {
    const incoming = Transfer.getIncomingFile();
    const r = incoming
      ? { receivedBytes: incoming.receivedBytes, size: incoming.meta.size }
      : { receivedBytes: 0, size: 0 };
    try { dc?.send(JSON.stringify({ type: "status-res", ...r })); } catch {}
    return;
  }

  if (msg.type === "cancel") {
    cancelTransfer(`${msg.by || "Peer"} canceled`);
    return;
  }
};

Peer.PeerEvents.onDcBinary = (socketId, buf) => {
  Transfer.handleIncomingChunk(buf, getDc);
};

// Also handle reconnect signaling
Peer.setReconnectCallback((socketId) => {
  // Return false to suppress reconnect if transfer is done or canceled
  if (!Transfer.sendState.running || Transfer.sendState.canceled) return false;
  return true;
});

// ── Transfer UI hooks ─────────────────────────────────────────────────────────
Transfer.UIEvents.onProgress = (done, total) => {
  const pct = total > 0 ? Math.floor((done / total) * 100) : 0;
  progressBar.value = Math.min(100, pct);
  progressText.innerText = `${Math.min(100,pct)}% (${fmtBytes(done)} / ${fmtBytes(total)})`;
};
Transfer.UIEvents.onSpeed  = mbps  => { speedText.innerText = `Speed: ${mbps.toFixed(2)} MB/s`; };
Transfer.UIEvents.onETA    = sec   => { etaText.innerText   = `Remaining: ${formatETA(sec)}`; };
Transfer.UIEvents.onStatus = text  => { fileStatus.innerText = text; };
Transfer.UIEvents.onComplete = () => {
  cancelBtn.disabled  = true;
  pauseBtn.disabled   = true;
  resumeBtn.disabled  = true;
};
Transfer.UIEvents.onError = msg => {
  fileStatus.innerText = `❌ ${msg}`;
  addMsg(`<span class="muted">❌ ${msg}</span>`);
};
Transfer.UIEvents.onDiskSave = (name, size, type, url) => {
  addToDownloadsManager({ name, size, type, savedToDisk: !url, url });
};

// ── Signaling handlers ─────────────────────────────────────────────────────────
socket.on("webrtc-offer",  async ({ from, sdp }) => { await Peer.handleOffer(from, sdp, socket); });
socket.on("webrtc-answer", async ({ from, sdp }) => { await Peer.handleAnswer(from, sdp); });
socket.on("webrtc-ice",    async ({ from, candidate }) => { await Peer.handleIceCandidate(from, candidate); });

socket.on("file-answer", async ({ from, accepted }) => {
  if (!accepted) { uiLog("❌ Receiver rejected."); outgoingFile = null; return; }
  Peer.setPrimaryId(from);
  uiLog("Accepted — connecting P2P...");
  addMsg(`<span class="muted">📤 Accepted. Connecting P2P...</span>`);
  await Peer.createAndOffer(from, socket);
});

socket.on("file-cancel", data => {
  cancelTransfer(`${data?.by || "Peer"} canceled`);
});

// ── Server-side rate limit feedback ───────────────────────────────────────────
// Emitted by server when this socket exceeds 5 file-offers/minute.
socket.on("file-offer-rejected", ({ message }) => {
  uiLog(`⚠️ ${message || "File offer rejected by server."}`);
  sending = false;
  outgoingFile = null;
});

socket.on("room-status", ({ room, users }) => {
  if (room !== currentRoom) return;
  if (users >= 2) { setConnectedUI(true, "Connected", `Room: ${room}`); addMsg(`<span class="muted">✅ Peer joined.</span>`); }
  else            { setConnectedUI(false, "Waiting...", `Room: ${room} — waiting...`); }
});

// ── File queue ────────────────────────────────────────────────────────────────
let fileQueue    = [];
let sending      = false;
let outgoingFile = null;
let pendingWritable = null;
let currentRoom  = "";

function startNextFile() {
  if (sending || fileQueue.length === 0) return;
  const file = fileQueue.shift();
  sending = true;
  outgoingFile = file;
  resetTransferUI();
  setStatus(`Waiting for receiver... (${file.name})`);
  socket.emit("file-offer", {
    id: file._id || `${file.name}|${file.size}`,
    name: file.name, size: file.size,
    type: file.type || "application/octet-stream",
  });
}

function cancelTransfer(reason) {
  Transfer.sendState.canceled = true;
  try { workerRef.current?.postMessage({ type: "cancel" }); } catch {}
  Peer.closeAll();
  fileStatus.innerText = `❌ ${reason}`;
  addMsg(`<span class="muted">❌ ${reason}</span>`);
  resetTransferUI();
  sending = false;
}

// ── Room ──────────────────────────────────────────────────────────────────────
createBtn.onclick = () => {
  const id = Math.random().toString(36).slice(2,8).toUpperCase();
  roomInput.value = id;
  joinRoom(id, "create");
};
joinBtn.onclick = () => { const r = roomInput.value.trim(); if (r) joinRoom(r, "join"); };

function joinRoom(roomId, mode) {
  currentRoom = roomId;
  socket.emit("join-room", { roomId, deviceName: getDeviceName() });
  chatSection.style.display = "block";
  setConnectedUI(false, mode === "create" ? "Room created" : "Joining...", `Room: ${roomId}`);
  addMsg(`<span class="muted">${mode === "create" ? "🆕 Created" : "➡️ Joined"}: <b>${roomId}</b></span>`);
}

// ── File input ────────────────────────────────────────────────────────────────
fileInput.addEventListener("change", () => {
  Array.from(fileInput.files || []).forEach(f => {
    try { f._id = f._id || crypto.randomUUID(); } catch { f._id = `${Date.now()}-${Math.random()}`; }
    fileQueue.push(f);
    addMsg(`<span class="muted">📤 Queued: ${f.name} (${fmtBytes(f.size)})</span>`);
  });
  fileInput.value = "";
  startNextFile();
});

// ── Receive accept modal ──────────────────────────────────────────────────────
let pendingIncoming = null;

socket.on("file-offer", ({ from, fromName, meta }) => {
  pendingIncoming = { from, meta };
  modalInfo.innerText = `From: ${fromName || from.slice(0,6)}\nFile: ${meta.name}\nSize: ${fmtBytes(meta.size)}`;
  modalBg.style.display = "flex";
});

acceptBtn.onclick = async () => {
  if (!pendingIncoming) return;
  const { from, meta } = pendingIncoming;
  pendingIncoming = null;
  modalBg.style.display = "none";

  if (meta.size > 300 * 1024 * 1024) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: meta.name });
      pendingWritable = await handle.createWritable();
    } catch {
      socket.emit("file-answer", { to: from, accepted: false });
      return;
    }
  }

  socket.emit("file-answer", { to: from, accepted: true });
  Peer.setPrimaryId(from);
  addMsg(`<span class="muted">📥 Accepted. Connecting P2P...</span>`);
};

rejectBtn.onclick = () => {
  if (!pendingIncoming) return;
  socket.emit("file-answer", { to: pendingIncoming.from, accepted: false });
  pendingIncoming = null;
  modalBg.style.display = "none";
};

// ── Pause / Resume / Cancel ───────────────────────────────────────────────────
pauseBtn.onclick = () => {
  Transfer.sendState.paused = true;
  pauseBtn.disabled = true; resumeBtn.disabled = false;
  fileStatus.innerText = "⏸ Paused";
  workerRef.current?.postMessage({ type: "pause" });
};
resumeBtn.onclick = () => {
  Transfer.sendState.paused = false;
  pauseBtn.disabled = false; resumeBtn.disabled = true;
  fileStatus.innerText = `Sending: ${Transfer.sendState.file?.name || ""}`;
  workerRef.current?.postMessage({ type: "resume" });
  for (let i = 0; i < NET.pipelineDepth; i++) workerRef.current?.postMessage({ type: "pull" });
};
cancelBtn.onclick = () => cancelTransfer("You canceled transfer");

// ── Helpers (shared UI utils) ─────────────────────────────────────────────────
function uiLog(msg) { addMsg(`<span class="muted">${msg}</span>`); }

// fmtBytes, formatETA, addMsg, setStatus, setConnectedUI, resetTransferUI,
// addToDownloadsManager, getDeviceName  — defined in ui.js (see below)