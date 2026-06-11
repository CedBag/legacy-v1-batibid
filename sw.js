const CACHE_NAME = "batibid-cache-v1";
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
  "./css/header-footer.css",
  "./css/home.css",
  "./css/gerer.css",
  "./css/trouver.css",
  "./css/construire.css",
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

// Install Event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Event (Network-First Fallback to Cache)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
