// KAMIKAZE SW — tüm cache'leri siler, kendini unregister eder.
// PWA modu kaldırıldı; eski cache'lere takılı kalan kullanıcıları kurtarmak için bu SW deploy edildi.
// Sonraki ziyaretlerde index.html SW register etmiyor, tarayıcı network'ten fresh içerik alır.
self.addEventListener('install', function(e) {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.registration.unregister();
    }).then(function() {
      return self.clients.matchAll({ type: 'window' });
    }).then(function(clients) {
      clients.forEach(function(c) {
        try { c.navigate(c.url); } catch (err) {}
      });
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request));
});
