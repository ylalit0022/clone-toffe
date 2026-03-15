// ═══════════════════════════════════════════════════════════════
//  app.js  — Orchestrator
//
//  Wires together:  peer.js + transfer.js + signaling + UI
//
//  RULE: No business logic here. Only wiring.
//  If you're debugging a crash: it's in peer.js or transfer.js.
//
//  FIXES (multi-file queue freeze — see transfer.js for full details):
//
//    FIX-2  resetReady() called in startNextFile() BEFORE file-offer so a
//            stale _readyReady=true cannot skip the next waitForReady().
//            Also called in cancelTransfer() for the same reason.
//
//    FIX-3  startReceiver() returns { deferred:true } when the previous
//            file's finalizeReceive() is still running. We store the pending
//            meta and retry via Transfer.onFinalizeComplete().
//
//    FIX-4  Worker is TERMINATED and recreated between files. This destroys
//            the old onmessage closure (closed over the prior chunkQueue /
//            allSent / loopRunning) before sendFile() installs a new one.
//            workerRef.current is always null between transfers.
//
//    FIX-4b _pendingNextFile flag: Peer.closeAll() tears down the DataChannel.
//            The 900ms timeout previously used to start the next file raced
//            against P2P reconnection. Now onDcOpen checks _pendingNextFile
//            and starts the next file only after a real DC is open.
//
//    BUG-FIX-B  "complete" is now sent inside UIEvents.onComplete, which is
//            called at the END of finalizeReceive() after the file is fully
//            written and verified. Previously it was sent immediately when
//            "done" arrived, before the blob was assembled — the sender tore
//            down the DataChannel while the last chunk was still in-flight,
//            causing the receiver to silently drop it (sender showed 100%,
//            receiver got a size-mismatch or missing file).
// ═══════════════════════════════════════════════════════════════

import * as Peer     from "./peer.js";
import * as Transfer from "./transfer.js";
import { NET, applyProfile, detectAndApply } from "./net.js";
import { initIceConfig } from "./ice.js";

// ── Signaling ──────────────────────────────────────────────────────────────────
const socket = io();
window._signalingSocket = socket;   // peer.js reads this for ICE candidates

// ── Fetch ICE config from server on startup ────────────────────────────────────
initIceConfig().catch(e => console.warn("[APP] ICE init failed:", e));

// ── Worker reference (mutable so reconnect can update chunk size) ──────────────
// FIX-4: This is null between transfers. _recycleWorker() terminates the old
// worker and creates a new one immediately before sendFile() is called.
const workerRef = { current: null };

function _recycleWorker() {
  if (workerRef.current) {
    try { workerRef.current.terminate(); } catch {}
    workerRef.current = null;
  }
  workerRef.current = new Worker("worker.js");
}

// ── getDc helper: always returns the current open DC or null ──────────────────
const getDc = () => Peer.getPrimaryDc();

// ── broadcastFn: send ArrayBuffer to all open DCs ─────────────────────────────
function broadcastFn(buf) {
  const dcs = Peer.allOpenDcs();
  if (dcs.length === 0) throw new Error("No open DC");
  dcs.forEach((dc, i) => dc.send(i === 0 ? buf : buf.slice(0)));
}

// ── FIX-4b: pending-next-file flag ────────────────────────────────────────────
// Set to true after a transfer completes and Peer.closeAll() is called.
// onDcOpen checks this and calls startNextFile() once a real DC is open,
// instead of relying on a fixed 900ms setTimeout that races P2P setup.
let _pendingNextFile = false;

// ── FIX-3: deferred meta storage ──────────────────────────────────────────────
// When startReceiver() returns { deferred:true }, we store the args here
// and retry once finalizeReceive() fires onFinalizeComplete().
let _deferredMeta = null;   // { meta, pendingWritable, socketId }

function _retryDeferredMeta() {
  if (!_deferredMeta) return;
  const { meta, pendingWritable: pw, socketId } = _deferredMeta;
  _deferredMeta = null;
  tlog_app("retrying deferred meta for", meta.name);
  const result = Transfer.startReceiver(meta, pw);
  _handleStartReceiverResult(result, meta, pw, socketId);
}

// ── Helper: process startReceiver() result ────────────────────────────────────
// Extracted so both the normal path and the deferred-retry path share it.
function _handleStartReceiverResult(result, meta, pw, socketId) {
  const dc = getDc();

  if (result.deferred) {
    // FIX-3: previous finalize still in progress — queue and wait
    _deferredMeta = { meta, pendingWritable: pw, socketId };
    Transfer.onFinalizeComplete(_retryDeferredMeta);
    return;
  }

  if (result.reconnect) {
    try {
      dc?.send(JSON.stringify({ type: "resume-offset", offset: result.receivedBytes }));
      dc?.send(JSON.stringify({ type: "ready" }));
    } catch {}
  } else {
    try { dc?.send(JSON.stringify({ type: "ready" })); } catch {}
  }
}

// ── Peer event hooks ──────────────────────────────────────────────────────────
Peer.PeerEvents.onDcOpen = async (socketId, dc) => {
  uiLog(`✅ Connected (${socketId.slice(0,6)})`);

  const pc = Peer.getPrimaryPc();
  if (pc) await detectAndApply(pc);

  if (Transfer.sendState.running && !Transfer.sendState.canceled) {
    // ── RECONNECT: transfer in progress ─────────────────────────────────────
    uiLog(`🔄 Reconnected — resuming`);

    if (typeof Transfer.sendState._onReconnect === "function") {
      Transfer.sendState._onReconnect(dc);
    }

    try {
      dc.send(JSON.stringify({ type: "resume-offset", offset: Transfer.sendState.offset }));
    } catch(e) { console.warn("[APP] resume-offset send failed:", e); }

    if (workerRef.current) {
      workerRef.current.postMessage({ type: "seek", offset: Transfer.sendState.offset, chunkIndex: Transfer.sendState.chunkIndex });
      for (let i = 0; i < NET.pipelineDepth; i++) workerRef.current.postMessage({ type: "pull" });
    }

  } else if (_pendingNextFile) {
    // ── FIX-4b: a completed transfer queued the next file ────────────────────
    // DC is now open — safe to start. Clear the flag first so a second
    // onDcOpen (e.g. multi-peer) doesn't double-start.
    _pendingNextFile = false;
    startNextFile();

  } else if (outgoingFile && !Transfer.sendState.running) {
    // ── FRESH: first connection for this file ────────────────────────────────
    // FIX-4: always recycle the worker so no stale onmessage closure survives
    _recycleWorker();
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
    if (typeof Transfer.sendState._onResumeConfirmed === "function") {
      Transfer.sendState._onResumeConfirmed(msg.offset || 0);
    }
    return;
  }

  if (msg.type === "complete") {
    Transfer.sendState.gotComplete = true;
    Transfer.sendState.running     = false;
    outgoingFile = null;
    sending      = false;
    uiLog("✅ Receiver confirmed complete");
    UI.onTransferComplete();

    // FIX-4: terminate the worker NOW so the old onmessage closure is gone
    // before startNextFile() → sendFile() installs a new one.
    if (workerRef.current) {
      try { workerRef.current.terminate(); } catch {}
      workerRef.current = null;
    }

    Peer.closeAll();

    // FIX-4b: don't use a fixed timeout. Set the flag; onDcOpen will call
    // startNextFile() once the new P2P DataChannel is actually open.
    // If fileQueue is empty, the flag is harmless — startNextFile() is a no-op.
    _pendingNextFile = true;

    // Safety fallback: if no new DC opens within 5s (e.g. no more files,
    // or the receiver side initiates), clear the flag and try anyway.
    // startNextFile() is idempotent when fileQueue is empty.
    setTimeout(() => {
      if (_pendingNextFile) {
        _pendingNextFile = false;
        startNextFile();
      }
    }, 5000);
    return;
  }

  // ── Receiver receives ──────────────────────────────────────────────────────
  if (msg.type === "meta") {
    // FIX-3: capture pendingWritable before clearing it, then pass it to
    // _handleStartReceiverResult which may defer — if deferred, we must NOT
    // null pendingWritable yet since the retry needs it. But since we store
    // it in _deferredMeta, nulling here is safe.
    const pw = pendingWritable;
    pendingWritable = null;

    const result = Transfer.startReceiver(msg.meta, pw);
    _handleStartReceiverResult(result, msg.meta, pw, socketId);
    return;
  }

  if (msg.type === "ready") {
    Transfer.markReady(true);
    return;
  }

  if (msg.type === "done") {
    // BUG-FIX-B: Do NOT send "complete" here.
    // onDoneReceived() sets sawDone=true and triggers finalizeReceive() only
    // when all bytes have arrived. finalizeReceive() calls UIEvents.onComplete()
    // at the very end — after writeChain is awaited and blob size is verified.
    // UIEvents.onComplete (below) is where "complete" is actually sent.
    // Sending "complete" here (before finalization) caused the sender to call
    // Peer.closeAll() while the last binary chunk was still in-flight on slow
    // TURN paths — the receiver never got it, resulting in a silently truncated
    // or missing file on the receiver side.
    Transfer.onDoneReceived();
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

// Reconnect signaling: suppress if transfer is done or canceled
Peer.setReconnectCallback((socketId) => {
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

// BUG-FIX-B: "complete" is sent HERE — at the end of finalizeReceive(), after
// the file is fully written to disk / blob is assembled and size-verified.
// This replaces the old pattern of sending "complete" immediately on "done".
Transfer.UIEvents.onComplete = () => {
  const dc = getDc();
  try { dc?.send(JSON.stringify({ type: "complete" })); } catch {}
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
  if (!accepted) { uiLog("❌ Receiver rejected."); outgoingFile = null; sending = false; return; }
  Peer.setPrimaryId(from);
  uiLog("Accepted — connecting P2P...");
  addMsg(`<span class="muted">📤 Accepted. Connecting P2P...</span>`);
  await Peer.createAndOffer(from, socket);
});

socket.on("file-cancel", data => {
  cancelTransfer(`${data?.by || "Peer"} canceled`);
});

socket.on("file-offer-rejected", ({ message }) => {
  uiLog(`⚠️ ${message || "File offer rejected by server."}`);
  sending = false;
  outgoingFile = null;
  // FIX-2: clear ready state so the next offer starts clean
  Transfer.resetReady();
});

socket.on("room-status", ({ room, users }) => {
  if (room !== currentRoom) return;
  if (users >= 2) { setConnectedUI(true, "Connected", `Room: ${room}`); addMsg(`<span class="muted">✅ Peer joined.</span>`); }
  else            { setConnectedUI(false, "Waiting...", `Room: ${room} — waiting...`); }
});

// ── File queue ────────────────────────────────────────────────────────────────
let fileQueue       = [];
let sending         = false;
let outgoingFile    = null;
let pendingWritable = null;
let currentRoom     = "";

function startNextFile() {
  if (sending || fileQueue.length === 0) return;
  const file = fileQueue.shift();
  sending      = true;
  outgoingFile = file;
  resetTransferUI();
  setStatus(`Waiting for receiver... (${file.name})`);

  // FIX-2: reset the READY handshake BEFORE emitting file-offer.
  // If a stale `ready` message arrives between two transfers (e.g. from a
  // race with the previous receiver), _readyReady=true would let
  // waitForReady() resolve instantly for the new file without the receiver
  // having actually confirmed it.
  Transfer.resetReady();

  socket.emit("file-offer", {
    id:   file._id || `${file.name}|${file.size}`,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  });
}

function cancelTransfer(reason) {
  Transfer.sendState.canceled = true;
  Transfer.sendState.running  = false;   // BUG-FIX-A: ensure polling loop exits

  // FIX-2: clear ready state so the next file doesn't inherit it
  Transfer.resetReady();

  // FIX-4: terminate worker on cancel so old onmessage closure is gone
  if (workerRef.current) {
    try { workerRef.current.postMessage({ type: "cancel" }); } catch {}
    // Give cancel message a tick to land, then terminate
    setTimeout(() => {
      try { workerRef.current?.terminate(); } catch {}
      workerRef.current = null;
    }, 100);
  }

  // FIX-4b: cancel clears the pending flag too
  _pendingNextFile = false;

  // FIX-3: cancel clears any deferred meta
  _deferredMeta = null;

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

// ── Helpers ───────────────────────────────────────────────────────────────────
function uiLog(msg) { addMsg(`<span class="muted">${msg}</span>`); }
function tlog_app(...a) { console.log("[APP]", ...a); }

// fmtBytes, formatETA, addMsg, setStatus, setConnectedUI, resetTransferUI,
// addToDownloadsManager, getDeviceName  — defined in ui.js