// ============================================================
// ilmihal.org Service Worker — versiyonlu offline katmanı
// (Haziran 2026; Nisan 2026'daki "kamikaze" SW'nin yerine)
//
// Tasarım ilkeleri (eski cache tuzağına karşı):
//  - Cache adları SURUM damgalı; activate'te eski sürümler silinir.
//  - Navigasyon: ÖNCE ağ, düşerse cache'teki kabuk (index) — yeni
//    yayınlar anında ulaşır, offline'da site yine açılır.
//  - ?v= damgalı varlıklar (js/css/font): cache-first — sürüm
//    değişince URL değişir, bayatlama imkânsız.
//  - Kitap metinleri (texts/*.json) ve veri dosyaları: önce cache,
//    arka planda tazele (stale-while-revalidate).
//  - Çapraz kaynak istekleri SW'ye hiç takılmaz.
// ============================================================
var SURUM = '2026-06-11-r2';
var KABUK_CACHE = 'ilmihal-kabuk-' + SURUM;
var VERI_CACHE = 'ilmihal-veri-' + SURUM;

var CEKIRDEK = [
  '/',
  '/style.css?v=' + SURUM,
  '/data.js?v=' + SURUM,
  '/tanimlar.js?v=' + SURUM,
  '/crossref.js?v=' + SURUM,
  '/search-engine.js?v=' + SURUM,
  '/arama-sozluk.js?v=' + SURUM,
  '/app.js?v=' + SURUM,
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/fonts/literata-400-normal-latin.woff2',
  '/fonts/literata-400-normal-latin-ext.woff2',
  '/fonts/inter-400-normal-latin.woff2',
  '/fonts/inter-400-normal-latin-ext.woff2'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(KABUK_CACHE)
      .then(function(cache) { return cache.addAll(CEKIRDEK); })
      .catch(function() {}) // tek dosya hatası kurulumu engellemesin
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== KABUK_CACHE && k !== VERI_CACHE) return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

function agdanVeCachele(istek, cacheAdi) {
  return fetch(istek).then(function(yanit) {
    if (yanit && yanit.ok) {
      var kopya = yanit.clone();
      caches.open(cacheAdi).then(function(c) { c.put(istek, kopya); }).catch(function() {});
    }
    return yanit;
  });
}

self.addEventListener('fetch', function(e) {
  var istek = e.request;
  if (istek.method !== 'GET') return;

  var url = new URL(istek.url);
  if (url.origin !== self.location.origin) return; // çapraz kaynak: dokunma

  // 1) Sayfa navigasyonu: ağ öncelikli, offline'da kabuk
  if (istek.mode === 'navigate') {
    e.respondWith(
      agdanVeCachele(istek, KABUK_CACHE).catch(function() {
        return caches.match(istek).then(function(c) {
          return c || caches.match('/');
        });
      })
    );
    return;
  }

  // 2) Sürüm damgalı varlıklar + fontlar + ikonlar: cache-first
  var damgali = url.search.indexOf('v=') !== -1;
  var kalici = damgali || url.pathname.indexOf('/fonts/') === 0 ||
    /\.(woff2|png|svg|ico)$/.test(url.pathname);
  if (kalici && url.pathname.indexOf('/texts/') !== 0 && !/-data\.js|audio-map|ayet-hadis|sahislar|rehberler|maddeler-data|sozluk-data|gunun-sorusu/.test(url.pathname)) {
    e.respondWith(
      caches.match(istek).then(function(c) {
        return c || agdanVeCachele(istek, KABUK_CACHE).catch(function() {
          return caches.match(istek, { ignoreSearch: true });
        });
      })
    );
    return;
  }

  // 3) Kitap metinleri ve veri dosyaları: önce cache, arkada tazele
  if (url.pathname.indexOf('/texts/') === 0 || /-data\.js|audio-map|ayet-hadis|sahislar|rehberler|sozluk-data|gunun-sorusu/.test(url.pathname)) {
    e.respondWith(
      caches.match(istek).then(function(cevap) {
        var taze = agdanVeCachele(istek, VERI_CACHE).catch(function() { return cevap; });
        return cevap || taze;
      })
    );
    return;
  }

  // 4) Kalanlar: ağ öncelikli, cache yedekli
  e.respondWith(
    agdanVeCachele(istek, VERI_CACHE).catch(function() {
      return caches.match(istek);
    })
  );
});
