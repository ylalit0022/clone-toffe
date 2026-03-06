// ═══════════════════════════════════════════════════════════════
//  transfer.js  — File send / receive logic
//
//  Owns:
//    sendFile(file, getDc, fileWorker)
//    startReceiver(meta, writable?)
//    handleIncomingChunk(buf)
//
//  Does NOT touch the DOM directly (calls UIEvents hooks).
//  Does NOT create WebRTC peers.
// ═══════════════════════════════════════════════════════════════

import { NET, recordThroughputSample } from "./net.js";

const DEBUG = true;
const tlog = (...a) => DEBUG && console.log("[XFER]", ...a);

// ── Hooks for UI updates (set by app.js) ─────────────────────────────────────
export const UIEvents = {
  onProgress:   (done, total) => {},
  onSpeed:      (mbps)        => {},
  onETA:        (sec)         => {},
  onStatus:     (text)        => {},
  onComplete:   ()            => {},
  onError:      (msg)         => {},
  onDiskSave:   (name, size, type, url) => {},  // url=null if savedToDisk
};

// ── Send state ────────────────────────────────────────────────────────────────
export const sendState = {
  running:    false,
  paused:     false,
  canceled:   false,
  offset:     0,
  chunkIndex: 0,
  file:       null,
  ackBytes:   0,
  ackEma:     0,
  _lastAckT:  0,
  _lastAckB:  0,
  gotComplete: false,
};

// ── Receive state ─────────────────────────────────────────────────────────────
let incomingFile = null;
export function getIncomingFile() { return incomingFile; }

// ── READY handshake ───────────────────────────────────────────────────────────
let _readyResolver = null;
let _readyReady    = false;

export function resetReady() { _readyResolver = null; _readyReady = false; }

export function waitForReady(ms = 120000) {
  if (_readyReady) return Promise.resolve(true);
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(false), ms);
    _readyResolver = ok => { clearTimeout(t); resolve(!!ok); };
  });
}

export function markReady(ok = true) {
  _readyReady = !!ok;
  if (_readyResolver) { const r = _readyResolver; _readyResolver = null; r(!!ok); }
}

// ── ACK constants ─────────────────────────────────────────────────────────────
const ACK_EVERY = 4 * 1024 * 1024;   // send ACK every 4MB received

// ═══════════════════════════════════════════════════════════════════════════════
//  SEND FILE
//  getDc()     → returns the current open RTCDataChannel or null
//  broadcastFn → sends ArrayBuffer to all receivers
//  workerRef   → { current: Worker }  (mutable ref so reconnect can update)
// ═══════════════════════════════════════════════════════════════════════════════
export async function sendFile(file, getDc, broadcastFn, workerRef) {
  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!getDc()) { tlog("sendFile: no open DC — aborting"); return; }

  // ── Init state ────────────────────────────────────────────────────────────
  Object.assign(sendState, {
    running: true, paused: false, canceled: false,
    offset: 0, chunkIndex: 0, file,
    ackBytes: 0, ackEma: 0, _lastAckT: 0, _lastAckB: 0,
    gotComplete: false,
  });

  UIEvents.onStatus(`Sending: ${file.name}`);

  // ── Meta → wait for receiver READY ───────────────────────────────────────
  resetReady();
  const metaMsg = JSON.stringify({
    type: "meta",
    meta: { id: file._id || `${file.name}|${file.size}`, name: file.name, size: file.size, type: file.type || "application/octet-stream" },
  });
  getDc().send(metaMsg);

  UIEvents.onStatus(`Waiting for receiver...`);
  const ready = await waitForReady(120000);
  if (!ready) { _cancel("Receiver not ready (timeout)"); return; }

  UIEvents.onStatus(`Sending: ${file.name}`);

  // ── Per-transfer loop state ───────────────────────────────────────────────
  const chunkQueue    = [];   // { buf, index }
  let   workerDone    = false;
  let   allSent       = false;
  let   loopRunning   = false;
  let   waitingDrain  = false;
  let   _lastSampleT  = performance.now();
  let   _lastSampleB  = 0;
  let   _pendingRetransmits = new Map();

  // ── Set threshold on channel ───────────────────────────────────────────────
  function applyThreshold() {
    const dc = getDc();
    if (dc) dc.bufferedAmountLowThreshold = NET.lowWaterMark;
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
        tlog("DC gone — waiting for reconnect");
        break;
      }

      // ── Read dc.bufferedAmount directly — no shadow counter ───────────────
      // This is the Google-recommended approach. bufferedAmount is the
      // browser's own count of bytes queued in SCTP; it is always accurate.
      if (dc.bufferedAmount >= NET.highWaterMark) {
        waitingDrain = true;
        function onLow() {
          dc.removeEventListener("bufferedamountlow", onLow);
          waitingDrain = false;
          sendLoop();
        }
        dc.addEventListener("bufferedamountlow", onLow);
        // Safety: unblock after 3s in case event never fires (DC swap etc.)
        setTimeout(() => {
          if (!waitingDrain) return;
          dc.removeEventListener("bufferedamountlow", onLow);
          waitingDrain = false;
          sendLoop();
        }, 3000);
        break;
      }

      const { buf, index } = chunkQueue.shift();

      // Keep last 128 chunks for retransmit
      _pendingRetransmits.set(index, buf);
      if (_pendingRetransmits.size > 128) {
        _pendingRetransmits.delete(_pendingRetransmits.keys().next().value);
      }

      try {
        broadcastFn(buf);
      } catch(err) {
        chunkQueue.unshift({ buf, index });
        tlog("dc.send threw:", err?.message);
        break;
      }

      sendState.offset    = Math.min(file.size, sendState.offset + buf.byteLength);
      sendState.chunkIndex = index + 1;

      // Release worker backpressure
      workerRef.current?.postMessage({ type: "ack-chunk", bytes: buf.byteLength });

      // Throughput sample
      const now = performance.now();
      if (now - _lastSampleT >= 2000) {
        const bps = (sendState.offset - _lastSampleB) / ((now - _lastSampleT) / 1000);
        _lastSampleT = now; _lastSampleB = sendState.offset;
        if (recordThroughputSample(bps)) {
          // Slow TURN detected — resize worker chunks
          workerRef.current?.postMessage({ type: "resize", chunkSize: NET.chunkSize });
        }
      }

      if (!workerDone) workerRef.current?.postMessage({ type: "pull" });
    }

    loopRunning = false;
    if (workerDone && chunkQueue.length === 0 && !allSent) {
      allSent = true;
      _finalize(getDc);
    }
  }

  // ── Reconnect hook ─────────────────────────────────────────────────────────
  // Called by app.js when a new DC opens mid-transfer.
  // IMPORTANT: do NOT call sendLoop() immediately here — the new DC needs
  // one tick to settle its SCTP state before we start pushing data.
  // Also do NOT send data before the receiver confirms its offset.
  sendState._onReconnect = (newDc) => {
    newDc.bufferedAmountLowThreshold = NET.lowWaterMark;
    waitingDrain = false;
    loopRunning  = false;
    // sendLoop() will be called after the receiver replies with resume-offset
  };

  // Called by app.js when receiver confirms its byte offset after reconnect
  sendState._onResumeConfirmed = (confirmedOffset) => {
    tlog("receiver confirmed offset:", confirmedOffset, "our offset was:", sendState.offset);
    // Wind back to receiver's confirmed position to avoid gaps
    sendState.offset     = confirmedOffset;
    sendState.ackBytes   = Math.min(sendState.ackBytes, confirmedOffset);
    sendState.chunkIndex = Math.floor(confirmedOffset / NET.chunkSize);
    // Re-seed worker from confirmed position
    workerRef.current?.postMessage({ type: "seek",   offset: confirmedOffset, chunkIndex: sendState.chunkIndex });
    for (let i = 0; i < NET.pipelineDepth; i++) workerRef.current?.postMessage({ type: "pull" });
    // Now safe to send
    sendLoop();
  };

  // ── Worker messages ────────────────────────────────────────────────────────
  workerRef.current.onmessage = e => {
    if (e.data.type === "chunk") {
      if (sendState.canceled) return;
      chunkQueue.push({ buf: e.data.buf, index: e.data.index });
      sendLoop();
      return;
    }
    if (e.data.type === "done") {
      workerDone = true;
      tlog("worker done, queue:", chunkQueue.length);
      if (chunkQueue.length === 0 && !allSent) { allSent = true; _finalize(getDc); }
    }
  };

  // ── KICK OFF ───────────────────────────────────────────────────────────────
  workerRef.current.postMessage({ type: "start", file, chunkSize: NET.chunkSize, offset: 0, chunkIndex: 0 });
  for (let i = 0; i < NET.pipelineDepth; i++) workerRef.current.postMessage({ type: "pull" });

  // ── Wait for completion ────────────────────────────────────────────────────
  while (sendState.running && !sendState.canceled && !sendState.gotComplete) {
    await new Promise(r => setTimeout(r, 150));
  }
}

async function _finalize(getDc) {
  if (sendState.canceled) return;
  tlog("all chunks sent — draining");

  // Wait for dc.bufferedAmount → 0
  const start = performance.now();
  while (true) {
    const dc = getDc();
    if (!dc || dc.bufferedAmount === 0) break;
    if (performance.now() - start > 30000) { tlog("drain timeout"); break; }
    await new Promise(r => setTimeout(r, 50));
  }

  const dc = getDc();
  if (dc) {
    dc.send(JSON.stringify({ type: "done" }));
    dc.send(JSON.stringify({ type: "status-req" }));
  }
}

function _cancel(reason) {
  sendState.canceled = true;
  tlog("canceled:", reason);
  UIEvents.onError(reason);
}

// ── ACK from receiver ─────────────────────────────────────────────────────────
export function onAck(bytes) {
  sendState.ackBytes = Math.max(sendState.ackBytes, bytes);

  const now = performance.now();
  const dt  = (now - sendState._lastAckT) / 1000;
  if (!sendState._lastAckT) { sendState._lastAckT = now; sendState._lastAckB = sendState.ackBytes; return; }
  if (dt >= 1.0) {
    const db = sendState.ackBytes - sendState._lastAckB;
    sendState.ackEma = sendState.ackEma ? 0.8 * sendState.ackEma + 0.2 * (db / dt) : db / dt;
    UIEvents.onProgress(sendState.ackBytes, sendState.file?.size || 0);
    UIEvents.onSpeed(sendState.ackEma / 1024 / 1024);
    UIEvents.onETA(sendState.ackEma > 0 ? (sendState.file?.size - sendState.ackBytes) / sendState.ackEma : NaN);
    sendState._lastAckT = now; sendState._lastAckB = sendState.ackBytes;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  RECEIVE FILE
// ═══════════════════════════════════════════════════════════════════════════════
export function startReceiver(meta, writable) {
  // ── Reconnect guard ───────────────────────────────────────────────────────
  if (incomingFile?.meta) {
    const same = (meta.id && meta.id === incomingFile.meta.id)
              || (meta.name === incomingFile.meta.name && meta.size === incomingFile.meta.size);
    if (same) {
      tlog("same transfer detected (reconnect) — resuming at", incomingFile.receivedBytes);
      return { reconnect: true, receivedBytes: incomingFile.receivedBytes };
    }
  }

  // ── Fresh start ───────────────────────────────────────────────────────────
  incomingFile = {
    meta,
    receivedBytes: 0,
    lastAckSent:   0,
    lastT: performance.now(), lastB: 0, ema: 0,
    chunks:     [],
    writable:   writable ?? null,
    writeChain: Promise.resolve(),
    sawDone: false, finalizing: false,
  };

  tlog("startReceiver", meta.name, meta.size);
  UIEvents.onStatus(`Receiving: ${meta.name}`);
  return { reconnect: false };
}

export function handleIncomingChunk(buf, getDc) {
  if (!incomingFile) return;

  // Disk mode: write at exact byte position (prevents offset drift)
  if (incomingFile.writable) {
    const pos    = incomingFile.receivedBytes;
    const ref    = incomingFile.writable;
    const u8     = new Uint8Array(buf.slice(0));
    incomingFile.writeChain = incomingFile.writeChain
      .then(() => ref.write({ type: "write", position: pos, data: u8 }))
      .catch(e  => tlog("disk write error at", pos, e));
  } else {
    incomingFile.chunks.push(buf);
  }

  incomingFile.receivedBytes += buf.byteLength;

  // Progress
  UIEvents.onProgress(incomingFile.receivedBytes, incomingFile.meta.size);

  // Speed + ETA
  const now = performance.now();
  const dt  = (now - incomingFile.lastT) / 1000;
  if (dt >= 1.0) {
    const bps = (incomingFile.receivedBytes - incomingFile.lastB) / dt;
    incomingFile.ema = incomingFile.ema ? 0.8 * incomingFile.ema + 0.2 * bps : bps;
    UIEvents.onSpeed(incomingFile.ema / 1024 / 1024);
    UIEvents.onETA(incomingFile.ema > 0 ? (incomingFile.meta.size - incomingFile.receivedBytes) / incomingFile.ema : NaN);
    incomingFile.lastT = now; incomingFile.lastB = incomingFile.receivedBytes;
  }

  // ACK back to sender
  const dc = getDc();
  if (dc) {
    const shouldAck = incomingFile.receivedBytes - incomingFile.lastAckSent >= ACK_EVERY
                   || incomingFile.receivedBytes >= incomingFile.meta.size;
    if (shouldAck) {
      incomingFile.lastAckSent = incomingFile.receivedBytes;
      try { dc.send(JSON.stringify({ type: "ack", bytes: incomingFile.receivedBytes })); } catch {}
    }
  }

  // Check if we can finalize
  if (incomingFile.sawDone && incomingFile.receivedBytes >= incomingFile.meta.size && !incomingFile.finalizing) {
    incomingFile.finalizing = true;
    finalizeReceive().catch(e => { tlog("finalize error:", e); });
  }
}

export function onDoneReceived() {
  if (!incomingFile) return;
  incomingFile.sawDone = true;
  if (incomingFile.receivedBytes >= incomingFile.meta.size && !incomingFile.finalizing) {
    incomingFile.finalizing = true;
    finalizeReceive().catch(e => tlog("finalize error:", e));
  }
}

async function finalizeReceive() {
  if (!incomingFile) return;
  const { writable, writeChain, chunks, meta } = incomingFile;

  try {
    if (writable) {
      await writeChain;
      await writable.close();
      UIEvents.onStatus(`✅ Saved: ${meta.name}`);
      UIEvents.onDiskSave(meta.name, meta.size, meta.type, null);
    } else {
      const blob = new Blob(chunks, { type: meta.type });
      const url  = URL.createObjectURL(blob);
      UIEvents.onStatus(`✅ Received: ${meta.name}`);
      UIEvents.onDiskSave(meta.name, meta.size, meta.type, url);
    }
    UIEvents.onComplete();
  } finally {
    incomingFile = null;
  }
}
