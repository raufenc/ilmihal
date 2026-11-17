/* ilmihal.org — service worker (çevrimdışı okuma katmanı)
   Belge: tools/yeni-site/ALTYAPI.md

   İlke: bu dosyadaki TEK sürüm kaynağı aşağıdaki üretilmiş SURUM sabitidir.
   Onu tools/yeni-site/surum-uret.mjs yazar (yayından önce; yayin-oncesi.sh).
   Elle sürüm yazılmaz; adreslere ?v= eki konmaz.

   Stratejiler
     gezinme (belge)          önce ağ; 3 sn'de gelmezse ya da ağ yoksa önbellekteki kabuk
     kod (js, css, kalanlar)  önce ağ; ağ yoksa (ya da 4 sn'de cevap yoksa) bu sürümün önbelleği
     /veri, /veri-arama       önbellekte varsa o, arkada tazelenir (veri sürümü değişince önbellek silinir)
     yazı tipi, görsel,       önce önbellek (sabit dosyaların karması değişince önbellek silinir)
     vendor, atlas dokuları
     /kitap, /api, /_vercel,  hiç karışmaz (tarayıcı doğrudan ağa gider)
     /rss.xml, Range,
     başka alan adları                                                                           */
'use strict';

// ── ÜRETİLMİŞ BÖLÜM: tools/yeni-site/surum-uret.mjs yazar; elle değiştirmeyin ──
const SURUM = 'c2d28b8c2adc.46654fc16e26.e297a916d529';
const ON_YUKLE = [
  '/index.html',
  '/css/fihrist.css',
  '/css/giris.css',
  '/css/kabuk.css',
  '/css/okuma-plani.css',
  '/css/okuyucu.css',
  '/css/temel.css',
  '/favicon.svg',
  '/fonts/fontlar.css',
  '/fonts/inter-400-normal-latin-ext.woff2',
  '/fonts/inter-400-normal-latin.woff2',
  '/fonts/literata-400-normal-latin-ext.woff2',
  '/fonts/literata-400-normal-latin.woff2',
  '/js/ana.js',
  '/js/bilesen/bildirim.js',
  '/js/bilesen/okuma-plani-kutu.js',
  '/js/bilesen/pencere.js',
  '/js/bilesen/sahife-seridi.js',
  '/js/bilesen/ses-calar.js',
  '/js/bilesen/vakit-bandi.js',
  '/js/cekirdek/ayar.js',
  '/js/cekirdek/bicim.js',
  '/js/cekirdek/css.js',
  '/js/cekirdek/depo.js',
  '/js/cekirdek/dom.js',
  '/js/cekirdek/kullanici.js',
  '/js/cekirdek/metin.js',
  '/js/cekirdek/okuma-plani.js',
  '/js/cekirdek/sw-kayit.js',
  '/js/cekirdek/tema.js',
  '/js/cekirdek/vakit.js',
  '/js/cekirdek/veri.js',
  '/js/cekirdek/yonlendirici.js',
  '/js/gorunum/bulunamadi.js',
  '/js/gorunum/fihrist.js',
  '/js/gorunum/giris.js',
  '/js/gorunum/okuyucu.js',
  '/js/gorunum/okuyucu/ayarlar.js',
  '/js/gorunum/okuyucu/cekmece.js',
  '/js/gorunum/okuyucu/lugat.js',
  '/js/gorunum/okuyucu/menu.js',
  '/js/gorunum/okuyucu/metin.js',
  '/js/gorunum/okuyucu/sahife.js',
  '/js/gorunum/okuyucu/secim.js',
  '/js/gorunum/okuyucu/simgeler.js',
  '/js/gorunum/okuyucu/son.js',
  '/manifest.json',
  '/veri/fihrist.json',
  '/veri/konular.json',
  '/veri/surum.json'
];
// ── ÜRETİLMİŞ BÖLÜM SONU ──

/* ACİL DURUM: true yapıp yayınlayın. Yeni service worker kurulunca bütün önbellekleri siler,
   kaydını kaldırır ve hiçbir isteğe karışmaz; site tamamen ağdan çalışır. (ALTYAPI.md) */
const KALDIR = false;

const [KOD_S, VERI_S, SABIT_S] = SURUM.split('.');
const ONBELLEK = {
  kod: 'ilmihal2-kod-' + KOD_S,
  veri: 'ilmihal2-veri-' + VERI_S,
  sabit: 'ilmihal2-sabit-' + SABIT_S
};
const GECERLI = new Set(Object.values(ONBELLEK));
const KABUK = '/index.html';
const AYRI_BELGELER = ['/silsile-atlasi/', '/namaz-vakitleri/'];
const BELGE_SURE = 3000;
const KOD_SURE = 4000;
const ZAMAN = Symbol('zaman');

/* ───────────── Sınıflandırma ───────────── */
function sinif(yontem, kip, aralikli, url) {
  if (yontem !== 'GET') return null;
  if (url.origin !== self.location.origin) return null;          // ses dosyaları, dış PDF …
  if (aralikli) return null;                                      // parça parça (Range) okunan dosyalar
  const y = url.pathname;
  if (y.startsWith('/kitap/') || y.startsWith('/api/') || y.startsWith('/_vercel/') || y === '/rss.xml' || y === '/sw.js') return null;
  if (kip === 'navigate') return 'belge';
  if (y.startsWith('/veri/') || y.startsWith('/veri-arama/')) return 'veri';
  if ((y.startsWith('/fonts/') && y.endsWith('.woff2')) || y.startsWith('/gorsel/') || y.startsWith('/vendor/') ||
      y.startsWith('/silsile-atlasi/doku/')) return 'sabit';
  return 'kod';
}

/* Önbelleğe yalnız sağlam, yönlendirmesiz, aynı kaynaklı 200 yanıt girer. */
const saglam = y => !!y && y.status === 200 && y.type === 'basic' && !y.redirected;

async function koy(ad, anahtar, yanit) {
  try { const c = await caches.open(ad); await c.put(anahtar, yanit); } catch (e) { /* kota, gizli kip: yoksay */ }
}
async function bul(ad, anahtar) {
  try { const c = await caches.open(ad); return (await c.match(anahtar)) || null; } catch (e) { return null; }
}
function zamanli(soz, ms) {
  return new Promise(coz => {
    const t = setTimeout(() => coz(ZAMAN), ms);
    soz.then(y => { clearTimeout(t); coz(y); }, () => { clearTimeout(t); coz(null); });
  });
}

/* ───────────── Kurulum ───────────── */
async function onYukle() {
  let eksik = 0;
  await Promise.all(ON_YUKLE.map(async yol => {
    const s = sinif('GET', 'cors', false, new URL(yol, self.location.origin));
    try {
      const y = await fetch(yol, { cache: 'reload', credentials: 'same-origin' });
      if (saglam(y)) await koy(ONBELLEK[s] || ONBELLEK.kod, yol, y); else eksik++;
    } catch (e) { eksik++; }
  }));
  return eksik;   // bir dosya inmese de kurulum sürer: site ağdan çalışmaya devam eder
}

self.addEventListener('install', e => {
  e.waitUntil((KALDIR ? Promise.resolve() : onYukle()).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try {
      const adlar = await caches.keys();
      // Eski sitenin (ilmihal-kabuk-*, ilmihal-veri-*) ve eski sürümlerin bütün önbellekleri
      await Promise.all(adlar.filter(ad => KALDIR || !GECERLI.has(ad)).map(ad => caches.delete(ad)));
    } catch (e) { /* yoksay */ }
    if (KALDIR) { try { await self.registration.unregister(); } catch (e) { /* yoksay */ } return; }
    try { await self.clients.claim(); } catch (e) { /* yoksay */ }
  })());
});

/* ───────────── Stratejiler ───────────── */
function belgeAnahtari(url) {
  for (const b of AYRI_BELGELER) if (url.pathname.startsWith(b)) return b;
  if (url.pathname === '/404.html') return null;
  return KABUK;   // tek sayfa uygulamasının bütün yolları aynı kabuktur
}

/* Ağdan getir; sağlamsa bir kopyasını arkada önbelleğe koy (yanıt beklemez).
   Ağ hatası reddedilen söz olarak kalır. */
function agdan(e, istek, ad, anahtar) {
  const ag = fetch(istek).then(y => {
    if (anahtar && saglam(y)) { try { e.waitUntil(koy(ad, anahtar, y.clone())); } catch (err) { /* yoksay */ } }
    return y;
  });
  e.waitUntil(ag.catch(() => {}));
  return ag;
}

async function belge(e, url) {
  const anahtar = belgeAnahtari(url);
  const ag = agdan(e, e.request, ONBELLEK.kod, anahtar);
  const sonuc = await zamanli(ag, BELGE_SURE);
  if (sonuc && sonuc !== ZAMAN) return sonuc;
  const yedek = anahtar && (await bul(ONBELLEK.kod, anahtar));
  return yedek || ag;   // önbellekte yoksa ağ ne verirse (hata da olsa) o
}

async function kod(e) {
  const ag = agdan(e, e.request, ONBELLEK.kod, e.request);
  const sonuc = await zamanli(ag, KOD_SURE);
  if (sonuc && sonuc !== ZAMAN) return sonuc;
  return (await bul(ONBELLEK.kod, e.request)) || ag;
}

async function veri(e, url) {
  const yedek = await bul(ONBELLEK.veri, e.request);
  // Tazeleme HTTP önbelleğini atlar, sunucuya sorar (değişmediyse ETag ile 304)
  const ag = agdan(e, new Request(url.href, { cache: 'no-cache', credentials: 'same-origin' }), ONBELLEK.veri, e.request);
  return yedek || ag;
}

async function sabit(e, url) {
  const yedek = await bul(ONBELLEK.sabit, e.request);
  return yedek || agdan(e, new Request(url.href, { cache: 'no-cache', credentials: 'same-origin' }), ONBELLEK.sabit, e.request);
}

const ISLE = { belge, kod, veri, sabit };

self.addEventListener('fetch', e => {
  if (KALDIR) return;
  let url, s;
  try {
    url = new URL(e.request.url);
    s = sinif(e.request.method, e.request.mode, e.request.headers.has('range'), url);
  } catch (err) { return; }
  if (!s) return;
  // Bir şey ters giderse düz ağ: service worker hiçbir koşulda siteyi kilitlemez.
  e.respondWith(ISLE[s](e, url).then(y => y || fetch(e.request)).catch(() => fetch(e.request)));
});

/* Sınama ve hata raporu için: sayfa sorarsa sürümü söyler. */
self.addEventListener('message', e => {
  if (!e.data || e.data.tur !== 'surum') return;
  const cevap = { tur: 'surum', surum: SURUM, onbellekler: [...GECERLI], kaldir: KALDIR };
  if (e.ports && e.ports[0]) e.ports[0].postMessage(cevap);
  else if (e.source) e.source.postMessage(cevap);
});
