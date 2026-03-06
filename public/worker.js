// ─── FILE CHUNK WORKER ────────────────────────────────────────────────────────
// Reads the source File in chunkSize slices and posts each chunk to the main
// thread on demand (pull-based). Supports pipeline depth > 1 safely.
//
// CRITICAL: offset is advanced SYNCHRONOUSLY before FileReader.readAsArrayBuffer
// is called. This guarantees that even if multiple 'pull' messages arrive before
// the first read completes, each read starts from a unique offset.
//
// Message protocol (main → worker):
//   start      { file, chunkSize, offset, chunkIndex }
//   pull       {}               — request the next chunk
//   ack-chunk  { bytes }        — backpressure token (unused here, kept for compat)
//   seek       { offset, chunkIndex } — reposition for resume-after-reconnect
//   resize     { chunkSize }    — change chunk size mid-transfer
//   pause      {}               — stop auto-draining pull queue
//   resume     {}               — resume draining pull queue
//   cancel     {}               — abort everything
//
// Message protocol (worker → main):
//   chunk      { buf, index, offset, checksum }
//   done       {}               — all bytes sent

let file        = null;
let chunkSize   = 262144;      // 256 KB default
let offset      = 0;           // next byte to READ (advanced before FileReader starts)
let chunkIndex  = 0;
let paused      = false;
let canceled    = false;
let reading     = false;       // true while a FileReader is active
let pullQueue   = 0;           // number of pending pull requests

function readNext() {
  // Guard: don't start another read while one is in flight.
  // The queue counter ensures we don't lose pull requests.
  if (reading || paused || canceled || !file) return;
  if (pullQueue <= 0) return;
  if (offset >= file.size) {
    // All bytes have been scheduled — drain remaining pulls then signal done.
    pullQueue = 0;
    self.postMessage({ type: "done" });
    return;
  }

  pullQueue--;
  reading = true;

  // ── KEY FIX: capture and advance offset BEFORE the async read ────────────
  // If offset were advanced inside onload, concurrent pulls would all see the
  // same starting offset → same chunk sent multiple times → corrupt file.
  const readOffset = offset;
  const readSize   = Math.min(chunkSize, file.size - readOffset);
  const readIndex  = chunkIndex;

  offset     += readSize;   // advance NOW — synchronous, before FileReader starts
  chunkIndex += 1;

  const slice  = file.slice(readOffset, readOffset + readSize);
  const reader = new FileReader();

  reader.onload = e => {
    reading = false;
    if (canceled) return;

    const buf = e.target.result;   // ArrayBuffer

    // Simple additive checksum for integrity checking (optional, lightweight)
    const u8  = new Uint8Array(buf);
    let checksum = 0;
    for (let i = 0; i < u8.length; i++) checksum = (checksum + u8[i]) & 0xFFFFFFFF;

    self.postMessage(
      { type: "chunk", buf, index: readIndex, offset: readOffset, checksum },
      [buf]   // transfer ownership — zero-copy
    );

    // Immediately try to satisfy the next queued pull
    readNext();
  };

  reader.onerror = e => {
    reading = false;
    if (canceled) return;
    self.postMessage({ type: "error", message: String(e.target.error) });
  };

  reader.readAsArrayBuffer(slice);
}

self.onmessage = e => {
  const msg = e.data;

  switch (msg.type) {
    case "start":
      file       = msg.file;
      chunkSize  = msg.chunkSize  || 262144;
      offset     = msg.offset     || 0;
      chunkIndex = msg.chunkIndex || 0;
      paused     = false;
      canceled   = false;
      reading    = false;
      pullQueue  = 0;
      break;

    case "pull":
      if (canceled) return;
      pullQueue++;
      readNext();
      break;

    case "ack-chunk":
      // Backpressure token from main thread — not needed here since
      // we already gate on pullQueue, but kept for API compatibility.
      break;

    case "seek":
      // Resume after reconnect: reposition to a confirmed receiver offset.
      offset     = msg.offset     ?? offset;
      chunkIndex = msg.chunkIndex ?? chunkIndex;
      reading    = false;   // abandon any in-flight read (its onload will be ignored via canceled check below)
      // Don't reset pullQueue — existing pulls are still valid from new offset
      break;

    case "resize":
      chunkSize = msg.chunkSize || chunkSize;
      break;

    case "pause":
      paused = true;
      break;

    case "resume":
      paused = false;
      readNext();   // drain any queued pulls
      break;

    case "cancel":
      canceled  = true;
      paused    = false;
      pullQueue = 0;
      file      = null;
      break;
  }
};