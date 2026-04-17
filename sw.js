// Service Worker - ilmihal.org PWA
// BYPASS MODE: cache'leme yapma, her isteği network'e gönder
// Sebep: önceki kırık deploy'un bozuk cache'i kullanıcılarda kaldı, bu SW
// aktive olunca tüm cache'leri siler ve bir daha cache etmez (geçici tedbir)
var CACHE_NAME = 'ilmihal-bypass-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(n) { return caches.delete(n); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Hiç fetch handler yok — tarayıcı her şeyi doğrudan network'ten alır
