// sw.js — Tranzo Service Worker (no-cache mode)
// All requests go straight to network. SW kept only for PWA installability.

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Delete every cache that exists
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(name) {
        console.log('[SW] Deleting cache:', name);
        return caches.delete(name);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Pass every request straight to the network — no caching at all
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
