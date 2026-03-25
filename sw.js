// Service Worker - ilmihal.org PWA
var CACHE_NAME = 'ilmihal-v7';
var CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css?v=20',
  '/data.js?v=12',
  '/tanimlar.js?v=1',
  '/sahislar.js?v=7',
  '/crossref.js?v=7',
  '/search-engine.js?v=6',
  '/ayet-hadis.js?v=2',
  '/audio-map.js?v=1',
  '/arama-sozluk.js?v=1',
  '/rehberler.js?v=1',
  '/app.js?v=22',
  '/favicon.svg',
  '/manifest.json'
];

var LAZY_ASSETS = [
  '/maddeler-data.js?v=1',
  '/sozluk-data.js?v=1',
  '/texts/kisim1.json',
  '/texts/kisim2.json',
  '/texts/kisim3.json'
];

// Install: core dosyaları cache'le
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: eski cache'leri temizle
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: cache-first for assets, network-first for navigation
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Sadece kendi origin'imiz
  if (url.origin !== location.origin) return;

  // Navigation request'leri: SPA index.html döndür (alt uygulamalar hariç)
  if (e.request.mode === 'navigate') {
    // silsile-atlasi ve namaz-vakitleri kendi index.html'lerini kullanır
    if (url.pathname.startsWith('/silsile-atlasi') || url.pathname.startsWith('/namaz-vakitleri')) {
      return;
    }
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Static assets: cache-first, network fallback
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Lazy asset'leri de cache'le
        if (response.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.json') || url.pathname.endsWith('.css'))) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      });
    })
  );
});
