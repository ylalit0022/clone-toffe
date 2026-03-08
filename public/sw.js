// ═══════════════════════════════════════════════════════════════
//  sw.js  — Tranzo Service Worker
//
//  Purpose: enable large-file downloads on HTTP (no File System
//  Access API needed).  Works by:
//
//    1. On startup, the main page registers this SW and opens a
//       MessageChannel so the SW can receive chunks via postMessage.
//
//    2. When the user accepts a large file transfer, script.js
//       calls swDownload.start(meta) which:
//         a. Tells the SW to register a fake download URL
//            (/sw-download/<transferId>/<filename>)
//         b. Opens that URL in a hidden <a> click — browser sees
//            a normal download response with Content-Disposition
//
//    3. The SW intercepts the fetch for that URL and returns a
//       Response whose body is a ReadableStream.
//
//    4. As WebRTC chunks arrive, script.js calls
//       swDownload.write(transferId, chunk) which enqueues the
//       ArrayBuffer into the ReadableStream controller.
//
//    5. When the transfer finishes, script.js calls
//       swDownload.close(transferId) — the stream ends, browser
//       finalizes the file.
//
//  Fallback: if SW is not available (very old browser, or SW
//  registration failed) the code falls back to the existing
//  Blob + a.click() approach.
//
//  IMPORTANT: The SW lives at /sw.js so its scope covers /
// ═══════════════════════════════════════════════════════════════

const SW_VERSION = "tranzo-sw-v1";

// ── Install / Activate ────────────────────────────────────────
self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", e  => e.waitUntil(self.clients.claim()));

// ── In-flight transfer registry ───────────────────────────────
// transferId → { controller: ReadableStreamDefaultController, meta }
const _transfers = new Map();

// ── Message handler (from main thread) ───────────────────────
self.addEventListener("message", e => {
  const { type, transferId, meta, chunk } = e.data || {};

  if (type === "sw-start") {
    // Register a new pending transfer — fetch will arrive shortly
    _transfers.set(transferId, { controller: null, meta, queue: [], done: false });
    return;
  }

  if (type === "sw-write") {
    const t = _transfers.get(transferId);
    if (!t) return;
    if (t.controller) {
      t.controller.enqueue(new Uint8Array(chunk));
    } else {
      // Fetch hasn't arrived yet — buffer chunk
      t.queue.push(new Uint8Array(chunk));
    }
    return;
  }

  if (type === "sw-close") {
    const t = _transfers.get(transferId);
    if (!t) return;
    t.done = true;
    if (t.controller) {
      t.controller.close();
      _transfers.delete(transferId);
    }
    return;
  }

  if (type === "sw-abort") {
    const t = _transfers.get(transferId);
    if (!t) return;
    if (t.controller) {
      try { t.controller.error(new Error("Transfer aborted")); } catch {}
    }
    _transfers.delete(transferId);
    return;
  }
});

// ── Fetch interceptor ─────────────────────────────────────────
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Only intercept /sw-download/<transferId>/<filename>
  if (!url.pathname.startsWith("/sw-download/")) return;

  const parts      = url.pathname.split("/");
  // parts: ["", "sw-download", transferId, ...filename parts]
  const transferId = parts[2];
  const filename   = decodeURIComponent(parts.slice(3).join("/"));

  if (!transferId) return;

  e.respondWith(new Promise(resolve => {
    // Wait up to 5s for the transfer to be registered
    let waited = 0;
    const wait = setInterval(() => {
      const t = _transfers.get(transferId);
      if (t) {
        clearInterval(wait);
        resolve(buildResponse(transferId, filename, t));
        return;
      }
      waited += 100;
      if (waited >= 5000) {
        clearInterval(wait);
        resolve(new Response("Transfer not found", { status: 404 }));
      }
    }, 100);
  }));
});

function buildResponse(transferId, filename, t) {
  const stream = new ReadableStream({
    start(controller) {
      t.controller = controller;
      // Flush buffered chunks that arrived before the fetch
      for (const chunk of t.queue) {
        controller.enqueue(chunk);
      }
      t.queue = [];
      if (t.done) {
        controller.close();
        _transfers.delete(transferId);
      }
    },
    cancel() {
      _transfers.delete(transferId);
    }
  });

  const mime = t.meta?.type || "application/octet-stream";
  const size = t.meta?.size;

  const headers = new Headers({
    "Content-Type":        mime,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "X-Content-Type-Options": "nosniff",
  });
  if (size) headers.set("Content-Length", String(size));

  return new Response(stream, { status: 200, headers });
}
