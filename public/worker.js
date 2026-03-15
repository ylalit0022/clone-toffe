// ─── FILE CHUNK WORKER ────────────────────────────────────────────────────────
// Pull-based chunk reader. Reads File slices on demand and posts each chunk
// to the main thread.
//
// ANDROID SPEED FIX — two changes vs the previous version:
//
//   1. blob.arrayBuffer() instead of FileReader
//      FileReader.readAsArrayBuffer() is a legacy DOM API with known perf
//      problems on Android Chrome — each read takes 50-200ms due to internal
//      thread-hop overhead. blob.arrayBuffer() uses the browser's native
//      async I/O path and is 3-5x faster on mobile for the same data.
//
//   2. Removed synchronous checksum loop
//      The additive checksum iterated over every byte synchronously on the
//      worker thread BEFORE posting the chunk — 262,144 iterations per 256KB
//      chunk, taking 10-30ms on Android's slower JS engine. This blocked the
//      pipeline stall between each chunk. The checksum value was stored in
//      expectedChecksums on the receiver but was never actually verified
//      (the Map is allocated but no code reads it) — so it was pure overhead
//      with zero correctness benefit. Removed entirely.
//
// Architecture: synchronous onmessage + readNext() serialization
//   - onmessage is NOT async — no re-entrancy risk
//   - offset is captured and advanced BEFORE the async read starts
//   - `reading` flag ensures only one read is in flight at a time
//   - pullQueue accumulates requests while a read is running
//
// Message protocol (main → worker):
//   start      { file, chunkSize, offset, chunkIndex }
//   pull       {}
//   ack-chunk  { bytes }   — kept for API compat, not used for flow control
//   seek       { offset, chunkIndex }
//   resize     { chunkSize }
//   pause      {}
//   resume     {}
//   cancel     {}
//
// Message protocol (worker → main):
//   chunk      { buf, index, offset }
//   done       {}
//   error      { message }

let file        = null;
let chunkSize   = 262144;
let offset      = 0;
let chunkIndex  = 0;
let paused      = false;
let canceled    = false;
let reading     = false;
let pullQueue   = 0;
let seekGen     = 0;
// BUG-FIX-DONE-SPAM: once "done" has been posted, ignore all further "pull"
// messages until the next "start" or "seek". Without this flag, every pending
// "pull" in the message queue after EOF triggers _finalizeDone() again —
// the main thread received 35× "done" in logs, wasting CPU and confusing
// the "complete" timeout logic.
let doneSent    = false;

// ── SHA-256 streaming hash ─────────────────────────────────────────────────
// Uses DigestStream (Chrome 109+) for true zero-copy streaming — no 600MB
// memory spike at end of transfer. Falls back to chunk accumulation only if
// DigestStream is unavailable.
let _digestStream    = null;   // DigestStream | null
let _digestWriter    = null;   // WritableStreamDefaultWriter | null
let _hashBufs        = [];     // fallback accumulator
let _hashEnabled     = typeof crypto !== "undefined" && !!crypto.subtle;
let _useDigestStream = _hashEnabled && typeof DigestStream !== "undefined";

function _initHash() {
  _hashBufs = [];
  _digestStream = null;
  _digestWriter = null;
  if (!_hashEnabled) return;
  if (_useDigestStream) {
    try {
      _digestStream = new DigestStream("SHA-256");
      _digestWriter = _digestStream.getWriter();
    } catch {
      _useDigestStream = false;
    }
  }
}

function _feedHash(buf) {
  if (!_hashEnabled) return;
  if (_useDigestStream && _digestWriter) {
    _digestWriter.write(new Uint8Array(buf)).catch(() => {});
  } else {
    _hashBufs.push(buf.slice(0));   // keep copy before zero-copy transfer
  }
}

// Finalize hash and post done message.
async function _finalizeDone() {
  if (!_hashEnabled) {
    self.postMessage({ type: "done" });
    return;
  }
  try {
    let hashHex;
    if (_useDigestStream && _digestWriter) {
      await _digestWriter.close();
      const hashBuf = await _digestStream.digest;
      hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
    } else if (_hashBufs.length > 0) {
      const total  = _hashBufs.reduce((s, b) => s + b.byteLength, 0);
      const merged = new Uint8Array(total);
      let pos = 0;
      for (const b of _hashBufs) { merged.set(new Uint8Array(b), pos); pos += b.byteLength; }
      const hashBuf = await crypto.subtle.digest("SHA-256", merged);
      hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    self.postMessage({ type: "done", sha256: hashHex || null });
  } catch {
    self.postMessage({ type: "done" });
  } finally {
    _hashBufs = [];
    _digestStream = null;
    _digestWriter = null;
  }
}

function readNext() {
  if (reading || paused || canceled || !file) return;
  if (pullQueue <= 0) return;
  if (offset >= file.size) {
    pullQueue = 0;
    if (!doneSent) {
      doneSent = true;
      _finalizeDone();
    }
    return;
  }

  pullQueue--;
  reading = true;

  // Capture and advance offset SYNCHRONOUSLY before any async operation.
  // If offset were advanced inside the .then(), a second pull arriving while
  // the read is pending would see the old offset and read the same chunk twice
  // → stripe corruption on the receiver.
  const readOffset = offset;
  const readSize   = Math.min(chunkSize, file.size - readOffset);
  const readIndex  = chunkIndex;
  // BUG-FIX-6: snapshot the seek generation NOW so we can detect if a seek
  // arrived while this arrayBuffer() was in flight.
  const readGen    = seekGen;

  offset     += readSize;   // advance NOW — before await
  chunkIndex += 1;

  // blob.arrayBuffer() — modern fast path, 3-5x faster than FileReader on Android
  file.slice(readOffset, readOffset + readSize)
    .arrayBuffer()
    .then(buf => {
      reading = false;
      if (canceled) {
        readNext();
        return;
      }
      // BUG-FIX-6: drop stale chunk if a seek/start/cancel changed the generation
      // while this read was in flight. Posting it would stripe wrong data at the
      // receiver's current offset.
      if (readGen !== seekGen) {
        readNext();
        return;
      }

      // Transfer buffer ownership (zero-copy postMessage)
      // Feed chunk into streaming hash (before zero-copy transfer)
      _feedHash(buf);

      self.postMessage(
        { type: "chunk", buf, index: readIndex, offset: readOffset },
        [buf]
      );

      // Signal done if this was the last chunk
      if (offset >= file.size && pullQueue === 0) {
        _finalizeDone();
      } else {
        readNext();
      }
    })
    .catch(err => {
      reading = false;
      if (canceled) return;
      self.postMessage({ type: "error", message: String(err) });
    });
}

// Synchronous onmessage — never async, never re-entrant
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
      doneSent   = false;
      _initHash();
      seekGen++;
      break;

    case "pull":
      if (canceled) return;
      pullQueue++;
      readNext();
      break;

    case "ack-chunk":
      break;

    case "seek":
      offset     = msg.offset     ?? offset;
      chunkIndex = msg.chunkIndex ?? chunkIndex;
      reading    = false;
      pullQueue  = 0;
      doneSent   = false;
      _initHash();
      seekGen++;
      break;

    case "resize":
      chunkSize = msg.chunkSize || chunkSize;
      break;

    case "pause":
      paused = true;
      break;

    case "resume":
      paused = false;
      readNext();
      break;

    case "cancel":
      canceled  = true;
      paused    = false;
      pullQueue = 0;
      doneSent  = false;
      file      = null;
      seekGen++;
      break;
  }
};