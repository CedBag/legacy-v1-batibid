/* =======================================================
   BatiBid - Service Worker self-unregistration / cleanup
   This prevents cache-poisoning and stale content.
   ======================================================= */

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            console.log("Service Worker: Clearing cache - ", key);
            return caches.delete(key);
          })
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        console.log("Service Worker: Self-unregistering...");
        return self.registration.unregister();
      })
  );
});
