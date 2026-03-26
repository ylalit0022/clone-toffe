// sw.js — Tranzo Service Worker
// Strategy: network-first for all requests, with graceful cross-origin handling.
// The SW is kept minimal — its purpose is PWA installability, not offline caching.

const SW_VERSION = 'tranzo-v3';

self.addEventListener('install', function(event) {
  // Activate immediately — don't wait for old SW to become idle
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Delete all old caches on activation
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== SW_VERSION; })
             .map(function(name) {
               console.log('[SW] Deleting old cache:', name);
               return caches.delete(name);
             })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  const req = event.request;

  // FIX (iOS 16.4+): Attempting to call fetch() for cross-origin opaque requests
  // inside a SW can cause the SW to crash or return a corrupt response on iOS Safari.
  // Only intercept same-origin requests. Let cross-origin (CDN fonts, STUN, etc.)
  // bypass the SW entirely — the browser handles them natively.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    // Cross-origin: do NOT call event.respondWith() — let browser handle it
    return;
  }

  // Non-GET requests (POST, etc.) — pass through without SW involvement
  if (req.method !== 'GET') {
    return;
  }

  // Same-origin GET: pass straight to network (network-only strategy)
  // We deliberately do not cache — file transfers are dynamic and large.
  // The SW is kept alive only for PWA installability requirements.
  event.respondWith(
    fetch(req).catch(function() {
      // If the network request fails (genuinely offline), return a minimal
      // offline response rather than a SW crash.
      return new Response(
        '<html><body style="font-family:sans-serif;text-align:center;padding:2rem">' +
        '<h2>📡 Tranzo — Offline</h2>' +
        '<p>Please check your internet connection and try again.</p>' +
        '<button onclick="location.reload()">Retry</button></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html' } }
      );
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});