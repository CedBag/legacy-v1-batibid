const CACHE_NAME = "batibid-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./BatiBid logo app.svg",
  "./BatiBid logo 1.svg",
  "./BatiBid logo 2.svg",
  "./js/db.js",
  "./js/dashboard-p1.js",
  "./js/dashboard-p2.js",
  "./js/dashboard-p3.js",
  "./js/dashboard-p4.js",
  "./css/variables.css",
  "./css/base.css",
  "./css/animations.css",
  "./css/header-footer.css",
  "./css/home.css",
  "./css/gerer.css",
  "./css/trouver.css",
  "./css/construire.css",
  "./css/conseils-juridiques.css",
  "./css/blog.css",
  "./css/contact.css",
  "./css/auth.css",
  "./css/partenariats.css",
  "./css/dashboard.css",
  "./css/dashboard-p1.css",
  "./css/dashboard-p2.css",
  "./css/dashboard-p3.css",
  "./css/dashboard-p4.css",
  "./css/detail.css",
  "./css/pay.css",
  "./css/modals.css",
  "./css/responsive.css",
  "./pages/home.html",
  "./pages/gerer.html",
  "./pages/faire-louer.html",
  "./pages/trouver.html",
  "./pages/construire.html",
  "./pages/conseils-juridiques.html",
  "./pages/partenariats.html",
  "./pages/blog.html",
  "./pages/contact.html",
  "./pages/auth.html",
  "./pages/dashboard.html",
  "./pages/detail.html",
  "./pages/pay.html",
  "./pages/invoices.html",
  "./pages/invoice-detail-view.html"
];

// Install: precache all assets + skip waiting immediately
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete ALL old caches + take control of all open tabs immediately
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null)
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-First strategy
// Always tries the network. Falls back to cache only if offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return networkResponse;
      })
      .catch(() => caches.match(e.request))
  );
});
