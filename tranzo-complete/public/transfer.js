// NOTE: ES module import/export removed — loaded as plain <script>.
// Depends on: net.js / script.js globals: NET, recordThroughputSample

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
//
//  FIXES (multi-file queue freeze):
//    FIX-1  Generation counter — stale sendLoop() closures from a
//            previous sendFile() call are silently dropped instead of
//            racing against the new call's chunkQueue/allSent/loopRunning.
//
//    FIX-2  resetReady() is now EXPORTED so app.js can call it in
//            startNextFile() BEFORE emitting file-offer. This prevents
//            a stale _readyReady=true from short-circuiting waitForReady()
//            for the next file.
//
//    FIX-3  startReceiver() refuses to overwrite incomingFile while a
//            finalizeReceive() is still in progress (writeChain / writable.close).
//            Returns { deferred: true } so app.js can queue the meta and
//            retry once finalize completes.
//
//    FIX-4  sendFile() requires workerRef.current to be a fresh Worker.
//            app.js terminates + recreates the worker between files so the
//            old onmessage handler (closed over the prior chunkQueue) is gone.
//
//    FIX-5  _onReconnect / _onResumeConfirmed are nulled out on sendState
//            reset so a late callback from the previous transfer cannot
//            trigger sendLoop() inside the new transfer's closure.
//
//  BUG-FIX-A  sendState.running was never set false after clean completion,
//             causing two sendFile() coroutines to race on the second file.
//             Now set to false at end of the polling loop and in _cancel().
//
//  BUG-FIX-B  "complete" was sent by app.js immediately on receiving "done",
//             before finalizeReceive() finished. The sender tore down the DC
//             while the last binary chunk was still in-flight on slow TURN
//             paths, causing the receiver to silently miss the last chunk.
//             Fix: "complete" is now sent inside UIEvents.onComplete, which
//             is called at the END of finalizeReceive() — after writeChain
//             is awaited and the blob is verified. app.js wires this up.
//
//  BUG-FIX-C  sendState.canceled = true persisted into the next sendFile()
//             after a user cancel. sendLoop() checked canceled at the top
//             and exited immediately, so the new transfer's chunks queued up
//             but nothing ever drained them. Fix: canceled is reset to false
//             at the very START of sendFile(), before the worker is kicked
//             off — not bundled into the Object.assign that runs after
//             waitForReady() resolves.
// ═══════════════════════════════════════════════════════════════

const DEBUG = true;
const tlog = (...a) => DEBUG && console.log("[XFER]", ...a);

// ── Hooks for UI updates (set by app.js) ─────────────────────────────────────
const UIEvents = {
  onProgress:   (done, total) => {},
  onSpeed:      (mbps)        => {},
  onETA:        (sec)         => {},
  onStatus:     (text)        => {},
  onComplete:   ()            => {},   // app.js sends "complete" here (BUG-FIX-B)
  onError:      (msg)         => {},
  onDiskSave:   (name, size, type, url) => {},  // url=null if savedToDisk
};

// ── Send state ────────────────────────────────────────────────────────────────
const sendState = {
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
  // These two are set inside sendFile() and MUST be nulled on reset
  // so a stale reconnect from a finished transfer cannot re-enter
  // the new file's sendLoop() closure. (FIX-5)
  _onReconnect:       null,
  _onResumeConfirmed: null,
};

// ── Receive state ─────────────────────────────────────────────────────────────
let incomingFile = null;
function getIncomingFile() { return incomingFile; }

// ── READY handshake ───────────────────────────────────────────────────────────
let _readyResolver = null;
let _readyReady    = false;

// FIX-2: exported so app.js calls this in startNextFile() BEFORE file-offer,
// ensuring _readyReady cannot be true when the next waitForReady() runs.
function resetReady() { _readyResolver = null; _readyReady = false; }

function waitForReady(ms = 120000) {
  if (_readyReady) return Promise.resolve(true);
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(false), ms);
    _readyResolver = ok => { clearTimeout(t); resolve(!!ok); };
  });
}

function markReady(ok = true) {
  _readyReady = !!ok;
  if (_readyResolver) { const r = _readyResolver; _readyResolver = null; r(!!ok); }
}

// ── ACK constants ─────────────────────────────────────────────────────────────
const ACK_EVERY = 4 * 1024 * 1024;   // send ACK every 4MB received

// ── FIX-1: sendFile generation counter ───────────────────────────────────────
// Each sendFile() call increments this. Every setTimeout(sendLoop, 0) callback
// checks that gen === _sendGeneration before doing anything. If a prior
// transfer's deferred sendLoop() fires after the next sendFile() has started,
// it sees a stale gen and returns immediately — no chunkQueue corruption, no
// double allSent=true, no spurious _finalize().
let _sendGeneration = 0;

// ═══════════════════════════════════════════════════════════════════════════════
//  SEND FILE
//  getDc()     → returns the current open RTCDataChannel or null
//  broadcastFn → sends ArrayBuffer to all receivers
//  workerRef   → { current: Worker }  (mutable ref, app.js owns lifecycle)
//                app.js MUST terminate + recreate the worker between files
//                so the old onmessage closure is fully gone. (FIX-4)
// ═══════════════════════════════════════════════════════════════════════════════
async function sendFile(file, getDc, broadcastFn, workerRef) {
  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!getDc()) { tlog("sendFile: no open DC — aborting"); return; }
  if (!workerRef.current) { tlog("sendFile: no worker — aborting"); return; }

  // ── BUG-FIX-C: reset canceled/running IMMEDIATELY, before anything async.
  // If cancelTransfer() was called on the previous file, sendState.canceled
  // is still true here. The worker kicks off below and posts chunks; those
  // chunks call sendLoop(), which checks canceled at the very top and exits
  // without sending anything — the queue fills up and the transfer stalls
  // permanently. Resetting here (before the worker starts) prevents that.
  sendState.canceled = false;
  sendState.running  = false;

  // ── FIX-1: claim this generation ─────────────────────────────────────────
  const gen = ++_sendGeneration;

  // ── Init state ────────────────────────────────────────────────────────────
  // FIX-5: null the reconnect callbacks BEFORE reassigning them below,
  // so there is never a window where a stale callback from the previous
  // transfer can fire into this call's locals.
  Object.assign(sendState, {
    running: true, paused: false, canceled: false,
    offset: 0, chunkIndex: 0, file,
    ackBytes: 0, ackEma: 0, _lastAckT: 0, _lastAckB: 0,
    gotComplete: false,
    startChunkSize: 0,          // set after worker start; used by _onResumeConfirmed
    _onReconnect:       null,   // FIX-5
    _onResumeConfirmed: null,   // FIX-5
  });

  UIEvents.onStatus(`Sending: ${file.name}`);

  // ── Meta → wait for receiver READY ───────────────────────────────────────
  // NOTE: resetReady() is called by app.js in startNextFile() BEFORE
  // file-offer is emitted (FIX-2). We do NOT call it here to avoid
  // clearing a valid ready signal that arrived in the gap between the
  // file-offer and sendFile() being invoked.
  const metaMsg = JSON.stringify({
    type: "meta",
    meta: {
      id:   file._id || `${file.name}|${file.size}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    },
  });
  getDc().send(metaMsg);

  UIEvents.onStatus(`Waiting for receiver...`);
  const ready = await waitForReady(120000);
  if (!ready) { _cancel("Receiver not ready (timeout)"); return; }

  // FIX-1: check generation after the async wait — if another sendFile()
  // started while we were waiting (e.g. cancel + immediate next file),
  // bail out silently.
  if (gen !== _sendGeneration) {
    tlog("sendFile: stale generation after waitForReady — aborting gen", gen);
    return;
  }

  UIEvents.onStatus(`Sending: ${file.name}`);

  // ── Per-transfer loop state ───────────────────────────────────────────────
  // These are closure-local. FIX-1 ensures no prior call's stale
  // setTimeout(sendLoop) can reach these variables.
  const chunkQueue          = [];   // { buf, index }
  let   workerDone          = false;
  let   allSent             = false;
  let   loopRunning         = false;
  let   waitingDrain        = false;
  let   _lastSampleT        = performance.now();
  let   _lastSampleB        = 0;
  const _pendingRetransmits = new Map();

  // ── Set threshold on channel ──────────────────────────────────────────────
  function applyThreshold() {
    const dc = getDc();
    if (dc) dc.bufferedAmountLowThreshold = NET.lowWaterMark;
  }
  applyThreshold();

  // ── BROWSER-RESPONSIVE SEND LOOP ─────────────────────────────────────────
  // Sends at most SEND_BATCH chunks per tick, then yields via setTimeout(0)
  // so the browser can process clicks, repaints, ACKs, and keepalives.
  // FIX-1: every entry point checks gen === _sendGeneration before work.
  const SEND_BATCH = 4;

  function sendLoop() {
    // FIX-1: drop stale callbacks from previous transfers
    if (gen !== _sendGeneration) return;
    if (!sendState.running || sendState.canceled || allSent) {
      // BUG-FIX-3: a deferred setTimeout(sendLoop,0) from the yield path leaves
      // loopRunning=true when it exits here. Reset it so future sendLoop calls
      // (e.g. from a new worker chunk arriving) are not permanently blocked.
      loopRunning = false;
      return;
    }
    if (loopRunning || waitingDrain) return;
    loopRunning = true;

    let sent = 0;

    while (chunkQueue.length > 0) {
      if (sendState.paused || sendState.canceled) break;

      const dc = getDc();
      if (!dc) {
        tlog("DC gone — waiting for reconnect");
        break;
      }

      if (dc.bufferedAmount >= NET.highWaterMark) {
        waitingDrain = true;
        let drainResumed = false;

        const safetyTimer = setTimeout(() => {
          if (drainResumed) return;
          drainResumed = true;
          dc.removeEventListener("bufferedamountlow", onLow);
          waitingDrain = false;
          sendLoop();
        }, 3000);

        function onLow() {
          if (drainResumed) return;
          drainResumed = true;
          clearTimeout(safetyTimer);
          dc.removeEventListener("bufferedamountlow", onLow);
          waitingDrain = false;
          sendLoop();
        }
        dc.addEventListener("bufferedamountlow", onLow);
        break;
      }

      const { buf, index } = chunkQueue.shift();

      // Keep last 128 chunks for retransmit
      _pendingRetransmits.set(index, buf);
      if (_pendingRetransmits.size > 128) {
        _pendingRetransmits.delete(_pendingRetransmits.keys().next().value);
      }
      // BUG-FIX-1: keep window bridge current so enhancements.js handleRetryChunk
      // can find the map even though it's a closure-local variable here.
      try { window.__xferRetransmits = _pendingRetransmits; } catch {}

      try {
        broadcastFn(buf);
      } catch(err) {
        chunkQueue.unshift({ buf, index });
        tlog("dc.send threw:", err?.message);
        break;
      }

      sendState.offset     = Math.min(file.size, sendState.offset + buf.byteLength);
      sendState.chunkIndex = index + 1;

      workerRef.current?.postMessage({ type: "ack-chunk", bytes: buf.byteLength });

      // Throughput sample
      const now = performance.now();
      if (now - _lastSampleT >= 2000) {
        const bps = (sendState.offset - _lastSampleB) / ((now - _lastSampleT) / 1000);
        _lastSampleT = now; _lastSampleB = sendState.offset;
        if (recordThroughputSample(bps)) {
          workerRef.current?.postMessage({ type: "resize", chunkSize: NET.chunkSize });
          // BUG-FIX: keep startChunkSize in sync after resize so subsequent
          // reconnects compute chunkIndex against the new (post-resize) chunk size.
          if (sendState.startChunkSize) sendState.startChunkSize = NET.chunkSize;
        }
      }

      if (!workerDone) workerRef.current?.postMessage({ type: "pull" });

      // ── YIELD: after SEND_BATCH chunks, release the main thread ───────────
      if (++sent >= SEND_BATCH && chunkQueue.length > 0) {
        // FIX-1: the deferred callback carries `gen` in its closure,
        // so it will drop itself if a new sendFile() has started.
        setTimeout(sendLoop, 0);
        return;   // loopRunning stays true — continuation owns the loop
      }
    }

    loopRunning = false;
    if (workerDone && chunkQueue.length === 0 && !allSent) {
      allSent = true;
      _finalize(getDc);
    }
  }

  // ── Reconnect hook (FIX-5) ────────────────────────────────────────────────
  // Written to sendState so app.js can call it from onDcOpen.
  // Closes over this call's loopRunning/waitingDrain — safe because
  // FIX-5 nulls both hooks before reassigning them on the next sendFile().
  sendState._onReconnect = (newDc) => {
    newDc.bufferedAmountLowThreshold = NET.lowWaterMark;
    waitingDrain = false;
    loopRunning  = false;
    // BUG-FIX-2: drain stale pre-drop chunks from the queue.
    // Without this, chunks read before the DC dropped are re-sent at the
    // new channel's head, stripping data at the wrong offset on the receiver.
    // Fresh chunks are produced once _onResumeConfirmed seeks the worker.
    chunkQueue.length = 0;
    // sendLoop() called after receiver confirms offset via _onResumeConfirmed
  };

  sendState._onResumeConfirmed = (confirmedOffset) => {
    tlog("receiver confirmed offset:", confirmedOffset, "our offset was:", sendState.offset);
    sendState.offset     = confirmedOffset;
    sendState.ackBytes   = Math.min(sendState.ackBytes, confirmedOffset);
    // BUG-FIX: use startChunkSize not NET.chunkSize — NET.chunkSize may have been
    // resized by slow-TURN detection mid-transfer, causing a boundary mismatch
    // between sender chunkIndex and receiver confirmed offset -> gap in file data.
    const resumeChunkSize = sendState.startChunkSize || NET.chunkSize || 262144;
    sendState.chunkIndex = Math.floor(confirmedOffset / resumeChunkSize);
    workerRef.current?.postMessage({ type: "seek", offset: confirmedOffset, chunkIndex: sendState.chunkIndex });
    for (let i = 0; i < NET.pipelineDepth; i++) workerRef.current?.postMessage({ type: "pull" });
    sendLoop();
  };

  // ── Worker messages (FIX-4) ───────────────────────────────────────────────
  // app.js terminates + recreates the worker between files, so this
  // onmessage replaces a handler on a brand-new Worker instance.
  // There is no old closure lingering on workerRef.current.onmessage.
  workerRef.current.onmessage = e => {
    // FIX-1: drop messages from worker if a newer sendFile() has taken over
    if (gen !== _sendGeneration) return;

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
  // BUG-FIX: record initial chunk size for resume chunkIndex computation.
  // NET.chunkSize can be resized mid-transfer by slow-TURN detection;
  // _onResumeConfirmed must use the size chunks were actually written at.
  sendState.startChunkSize = NET.chunkSize;
  workerRef.current.postMessage({ type: "start", file, chunkSize: NET.chunkSize, offset: 0, chunkIndex: 0 });
  for (let i = 0; i < NET.pipelineDepth; i++) workerRef.current.postMessage({ type: "pull" });

  // ── Wait for completion ────────────────────────────────────────────────────
  // BUG-FIX-A: after the loop exits, explicitly mark running=false.
  // Previously running was only reset at the top of the NEXT sendFile() call.
  // If startNextFile() triggered a second sendFile() within the 150ms poll
  // window before this loop exited, both coroutines were alive simultaneously,
  // racing on sendState / chunkQueue / loopRunning → stall after 2-3 files.
  while (sendState.running && !sendState.canceled && !sendState.gotComplete) {
    await new Promise(r => setTimeout(r, 150));
  }
  sendState.running = false;
}

async function _finalize(getDc) {
  if (sendState.canceled) return;
  tlog("all chunks sent — draining");

  // Wait until the sender-side DC outgoing buffer is empty.
  // Note: this only confirms data has LEFT the sender's memory.
  // The "done" message is sent right after — it rides the same ordered
  // channel so it will arrive after all binary chunks at the receiver.
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
    // BUG-FIX-B: "status-req" is still useful for logging but "complete" must
    // NOT be sent here. The receiver sends "complete" only after
    // finalizeReceive() fully succeeds (blob verified / file written to disk).
    // app.js wires UIEvents.onComplete → dc.send("complete").
    dc.send(JSON.stringify({ type: "status-req" }));
  }
}

function _cancel(reason) {
  sendState.canceled = true;
  sendState.running  = false;   // BUG-FIX-A: ensure polling loop exits immediately
  tlog("canceled:", reason);
  UIEvents.onError(reason);
}

// ── ACK from receiver ─────────────────────────────────────────────────────────
function onAck(bytes) {
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

// FIX-3: callback invoked by finalizeReceive() when it fully completes.
// app.js sets this if startReceiver() returns { deferred: true }.
// BUG-FIX-5: stored as a queue, not a single slot. If finalizeReceive() for
// file N triggers while deferred meta for file N+1 already registered a
// callback, both are preserved and fired in order.
let _onFinalizeCompleteQueue = [];

function startReceiver(meta, writable) {
  // ── FIX-3: block new file while previous finalize is running ─────────────
  // finalizeReceive() is async: it awaits writeChain and writable.close().
  // If the sender sends the next file's meta before that completes,
  // overwriting incomingFile here would corrupt the previous file on disk
  // (the writeChain promise is dropped) and cause a blob-size mismatch
  // in memory mode. Return deferred so app.js queues the meta and retries.
  if (incomingFile?.finalizing) {
    tlog("startReceiver: previous file still finalizing — deferring meta for", meta.name);
    return { reconnect: false, deferred: true };
  }

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
  return { reconnect: false, deferred: false };
}

function handleIncomingChunk(buf, getDc) {
  if (!incomingFile) return;

  if (!(buf instanceof ArrayBuffer) || buf.byteLength === 0) {
    tlog("handleIncomingChunk: skipping empty/invalid buffer");
    return;
  }

  if (incomingFile.receivedBytes >= incomingFile.meta.size) {
    tlog("handleIncomingChunk: chunk after EOF — ignoring");
    return;
  }

  let writeBuf = buf;
  if (incomingFile.receivedBytes + writeBuf.byteLength > incomingFile.meta.size) {
    const allowed = incomingFile.meta.size - incomingFile.receivedBytes;
    tlog("handleIncomingChunk: trimming oversized final chunk", { chunk: writeBuf.byteLength, allowed });
    writeBuf = writeBuf.slice(0, allowed);
  }

  if (incomingFile.writable) {
    const pos = incomingFile.receivedBytes;
    const ref = incomingFile.writable;
    const u8  = new Uint8Array(writeBuf.slice(0));
    incomingFile.writeChain = incomingFile.writeChain
      .then(() => ref.write({ type: "write", position: pos, data: u8 }))
      .catch(e  => tlog("disk write error at", pos, e));
  } else {
    incomingFile.chunks.push(writeBuf.slice(0));
  }

  incomingFile.receivedBytes += writeBuf.byteLength;

  UIEvents.onProgress(incomingFile.receivedBytes, incomingFile.meta.size);

  const now = performance.now();
  const dt  = (now - incomingFile.lastT) / 1000;
  if (dt >= 1.0) {
    const bps = (incomingFile.receivedBytes - incomingFile.lastB) / dt;
    incomingFile.ema = incomingFile.ema ? 0.8 * incomingFile.ema + 0.2 * bps : bps;
    UIEvents.onSpeed(incomingFile.ema / 1024 / 1024);
    UIEvents.onETA(incomingFile.ema > 0 ? (incomingFile.meta.size - incomingFile.receivedBytes) / incomingFile.ema : NaN);
    incomingFile.lastT = now; incomingFile.lastB = incomingFile.receivedBytes;
  }

  const dc = getDc();
  if (dc) {
    const shouldAck = incomingFile.receivedBytes - incomingFile.lastAckSent >= ACK_EVERY
                   || incomingFile.receivedBytes >= incomingFile.meta.size;
    if (shouldAck) {
      incomingFile.lastAckSent = incomingFile.receivedBytes;
      try { dc.send(JSON.stringify({ type: "ack", bytes: incomingFile.receivedBytes })); } catch {}
    }
  }

  if (incomingFile.sawDone && incomingFile.receivedBytes >= incomingFile.meta.size && !incomingFile.finalizing) {
    incomingFile.finalizing = true;
    finalizeReceive().catch(e => { tlog("finalize error:", e); });
  }
}

function onDoneReceived() {
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

      if (blob.size !== meta.size) {
        tlog("BLOB SIZE MISMATCH", { blobSize: blob.size, metaSize: meta.size });
        incomingFile = null;
        UIEvents.onStatus("⚠️ File incomplete — please retry");
        UIEvents.onError(`Received ${blob.size} bytes but expected ${meta.size} — file may be corrupt. Please retry.`);
        // FIX-3: still notify app.js so deferred meta can be retried
        const cb = _onFinalizeCompleteQueue.shift(); _onFinalizeCompleteQueue = []; cb?.();
        return;
      }

      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement("a");
        a.href = url; a.download = meta.name; a.style.display = "none";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      } catch(e) { tlog("auto-download click failed:", e); }

      UIEvents.onStatus(`✅ Received: ${meta.name}`);
      UIEvents.onDiskSave(meta.name, meta.size, meta.type, url);
    }

    // BUG-FIX-B: UIEvents.onComplete is called HERE — after the file is fully
    // written/verified. app.js hooks this to send the "complete" message back
    // to the sender. Previously "complete" was sent immediately on receiving
    // "done" in app.js, before the blob was assembled, causing the sender to
    // tear down the DataChannel while the last binary chunk was still in-flight.
    UIEvents.onComplete();
  } finally {
    incomingFile = null;
    // FIX-3: notify app.js that it is now safe to start the next meta
    // BUG-FIX-5: shift from queue — don't clobber a second waiting callback
    const cb = _onFinalizeCompleteQueue.shift(); cb?.();
  }
}

// FIX-3: called by app.js when startReceiver() returned { deferred: true }
// so the next file's meta can be retried once the async finalize finishes.
// BUG-FIX-5: push to queue — never overwrite a pending callback.
function onFinalizeComplete(callback) {
  _onFinalizeCompleteQueue.push(callback);
}