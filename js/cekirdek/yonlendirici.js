/* Yönlendirici: History API ile tek sayfa gezinme.
   Görünüm sözleşmesi (her js/gorunum/*.js dosyası `export default` ile bunu verir):

     export default {
       ad: 'fihrist',                                  // tekil ad (aynı görünüme yeniden gelindiğini anlamak için)
       baslik: (p) => 'İçindekiler',                   // sekme başlığı (dizgi ya da işlev; kur() içinde baglam.baslikYaz ile de verilebilir)
       async kur(kap, p, baglam) { … },                // kap: boş <div>; içini doldur. Bitince döner.
       async guncelle(p, baglam) { … }                 // (isteğe bağlı) aynı görünümde yalnız parametre değişince, yeniden kurmadan
     }

   baglam: { sinyal, yol, sorgu, karma, git, yerineYaz, baslikYaz, metaYaz, temizle }
     - sinyal: AbortSignal; görünümden çıkılınca iptal olur. fetch'e ve dinleyicilere verin.
     - temizle(fn): görünümden çıkılırken çağrılacak işlev kaydeder (zamanlayıcı, gözlemci, ses vb.).
   Görünüm ilk boyamasını bitirince yönlendirici <body data-hazir="1"> yapar (sınamalar buna bakar). */

import { h, doldur, iskelet, durum, azHareket } from './dom.js';

const SITE = 'Se’âdet-i Ebediyye';
// Bu yollar ayrı belgedir ya da dosyadır; yönlendirici karışmaz, tarayıcı gider.
const AYRI = [/^\/silsile-atlasi(\/|$)/, /^\/namaz-vakitleri(\/|$)/, /^\/kitap\//, /^\/api\//, /^\/rss\.xml$/, /\.[a-z0-9]{2,5}$/i];

const rotalar = [];
let kap = null, duyuru = null;
let etkin = null;            // { ad, gorunum, iptal, temizlik: [], yol }
let sayac = 0;
let bulunamadi = null;

/** kalip: '/madde/:kisim/:no' · ':ad*' kalan bütün yolu alır · sonda '?' ile biten parça isteğe bağlıdır: '/hukumler/:tur?' */
export function rotaEkle(kalip, yukle) {
  const adlar = [];
  const duzenli = kalip.split('/').filter(Boolean).map(parca => {
    const m = /^:(\w+)(\*|\?)?$/.exec(parca);
    if (!m) return '/' + parca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    adlar.push(m[1]);
    if (m[2] === '*') return '(?:/(.*))?';
    if (m[2] === '?') return '(?:/([^/]+))?';
    return '/([^/]+)';
  }).join('');
  rotalar.push({ kalip, duzenli: new RegExp('^' + (duzenli || '') + '/?$'), adlar, yukle });
}

function esle(yol) {
  for (const r of rotalar) {
    const m = r.duzenli.exec(yol === '' ? '/' : yol);
    if (!m) continue;
    const p = {};
    r.adlar.forEach((ad, i) => {
      let d = m[i + 1];
      if (d !== undefined) { try { d = decodeURIComponent(d); } catch (e) { /* bozuk kaçış: olduğu gibi */ } }
      p[ad] = d;
    });
    return { rota: r, p };
  }
  return null;
}

const ayriMi = yol => AYRI.some(d => d.test(yol));

/* ── Kaydırma konumu: her geçmiş kaydının kendi anahtarı vardır ── */
const anahtarUret = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function konumKaydet() {
  const k = history.state && history.state.k;
  if (!k) return;
  try { sessionStorage.setItem('ilmihal_kaydir_' + k, String(Math.round(scrollY))); } catch (e) { /* yoksay */ }
}
function konumOku() {
  const k = history.state && history.state.k;
  if (!k) return null;
  try { const v = sessionStorage.getItem('ilmihal_kaydir_' + k); return v === null ? null : +v; } catch (e) { return null; }
}

/** Başka bir adrese git. yerine: geçmişe yeni kayıt eklemeden. */
export function git(adres, { yerine = false } = {}) {
  const u = new URL(adres, location.href);
  if (u.origin !== location.origin || ayriMi(u.pathname)) { location.href = u.href; return; }
  if (u.pathname === location.pathname && u.search === location.search && u.hash === location.hash && etkin) return;
  konumKaydet();
  history[yerine ? 'replaceState' : 'pushState']({ k: anahtarUret() }, '', u.pathname + u.search + u.hash);
  return goster({ geri: false });
}

/** Adres çubuğunu görünümü yeniden kurmadan değiştirir (ör. arama kutusuna yazarken). */
export function yerineYaz(adres) {
  const u = new URL(adres, location.href);
  history.replaceState(history.state || { k: anahtarUret() }, '', u.pathname + u.search + u.hash);
}

function baslikYaz(metin) {
  document.title = metin ? `${metin} · ${SITE}` : `${SITE} — Tam İlmihâl`;
  if (duyuru) duyuru.textContent = metin || SITE;
}

function metaYaz({ aciklama, kanonik, robots } = {}) {
  const yaz = (secici, kur, deger) => {
    let el = document.head.querySelector(secici);
    if (!deger) { if (el && el.dataset.gorunum) el.remove(); return; }
    if (!el) { el = kur(); el.dataset.gorunum = '1'; document.head.appendChild(el); }
    el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', deger);
  };
  yaz('meta[name="description"]', () => h('meta', { name: 'description' }), aciklama);
  yaz('meta[property="og:description"]', () => h('meta', { property: 'og:description' }), aciklama);
  yaz('link[rel="canonical"]', () => h('link', { rel: 'canonical' }), kanonik || (location.origin + location.pathname));
  yaz('meta[name="robots"]', () => h('meta', { name: 'robots' }), robots);
}

function birak() {
  if (!etkin) return;
  etkin.iptal.abort();
  for (const fn of etkin.temizlik.splice(0).reverse()) {
    try { fn(); } catch (e) { console.error('görünüm temizliği:', e); }
  }
  etkin = null;
}

function baglamKur(kayit) {
  return {
    sinyal: kayit.iptal.signal,
    yol: location.pathname,
    sorgu: new URLSearchParams(location.search),
    karma: decodeURIComponent(location.hash.slice(1)),
    git, yerineYaz, baslikYaz, metaYaz,
    temizle: fn => kayit.temizlik.push(fn)
  };
}

async function goster({ geri }) {
  const no = ++sayac;
  const yol = location.pathname;
  document.body.dataset.hazir = '0';
  const eslesme = esle(yol) || { rota: { yukle: bulunamadi, kalip: '*' }, p: {} };

  try {
    const modul = await eslesme.rota.yukle();
    if (no !== sayac) return;
    const gorunum = modul.default;

    // Aynı görünümde yalnız parametre değiştiyse yeniden kurma
    if (etkin && etkin.ad === gorunum.ad && typeof gorunum.guncelle === 'function') {
      const baglam = baglamKur(etkin);
      metaYaz({});
      await gorunum.guncelle(eslesme.p, baglam);
      if (no !== sayac) return;
      if (typeof gorunum.baslik === 'function' || typeof gorunum.baslik === 'string') baslikYaz(typeof gorunum.baslik === 'function' ? gorunum.baslik(eslesme.p) : gorunum.baslik);
      konumla(geri);
      document.body.dataset.hazir = '1';
      return;
    }

    birak();
    const kayit = { ad: gorunum.ad, gorunum, iptal: new AbortController(), temizlik: [], yol };
    etkin = kayit;
    const yeni = h('div.gorunum', { dataset: { gorunum: gorunum.ad || '' } });
    // Yavaş kurulan görünümde boş ekran yerine iskelet
    const bekleme = setTimeout(() => { if (no === sayac && !yeni.isConnected) doldur(kap, h('.kap', iskelet(9))); }, 220);
    const baglam = baglamKur(kayit);
    metaYaz({});
    baslikYaz(typeof gorunum.baslik === 'function' ? gorunum.baslik(eslesme.p) : gorunum.baslik);
    try {
      await gorunum.kur(yeni, eslesme.p, baglam);
    } finally {
      clearTimeout(bekleme);
    }
    if (no !== sayac) { if (etkin === kayit) birak(); return; }

    const tak = () => doldur(kap, yeni);
    if (document.startViewTransition && !azHareket() && kap.childElementCount) {
      try {
        const gecis = document.startViewTransition(tak);
        // Geçiş yarıda kesilirse (pencere boyutu değişti, yeni gezinme başladı) bu sözler reddedilir; yakalanmazsa konsola hata düşer
        gecis.ready.catch(() => {});
        gecis.finished.catch(() => {});
        await gecis.updateCallbackDone;
      } catch (e) { if (!yeni.isConnected) tak(); }
    } else tak();
    document.documentElement.dataset.gorunum = gorunum.ad || '';
    konumla(geri);
    if (!geri) kap.focus({ preventScroll: true });
  } catch (hata) {
    if (no !== sayac) return;
    console.error('Görünüm açılamadı:', yol, hata);
    birak();
    baslikYaz('Sayfa açılamadı');
    doldur(kap, h('.kap', durum('Sayfa açılamadı',
      'Bağlantınızı denetleyip yeniden deneyin. Sorun sürerse ana sayfadan devam edebilirsiniz.',
      h('button.dugme.dugme-ana', { type: 'button', onclick: () => goster({ geri: false }) }, 'Yeniden deneyin'),
      h('a.dugme', { href: '/' }, 'Ana sayfa'))));
  }
  if (no === sayac) {
    document.body.dataset.hazir = '1';
    dispatchEvent(new CustomEvent('ilmihal:gorunum', { detail: { yol } }));
  }
}

function konumla(geri) {
  const eski = geri ? konumOku() : null;
  if (eski !== null) { scrollTo(0, eski); return; }
  const karma = decodeURIComponent(location.hash.slice(1));
  const hedef = karma ? document.getElementById(karma) : null;
  if (hedef) hedef.scrollIntoView({ block: 'start' });
  else scrollTo(0, 0);
}

/** kap: <main> öğesi. bulunamadiYukle: eşleşmeyen yol için görünüm yükleyici. */
export function baslat({ kap: anaKap, bulunamadiYukle }) {
  kap = anaKap;
  bulunamadi = bulunamadiYukle;
  kap.tabIndex = -1;
  duyuru = h('div.gizli-yazi', { 'aria-live': 'polite', 'aria-atomic': 'true' });
  document.body.appendChild(duyuru);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!history.state || !history.state.k) history.replaceState({ k: anahtarUret() }, '', location.href);

  addEventListener('popstate', () => goster({ geri: true }));
  addEventListener('pagehide', konumKaydet);

  // Site içi bağlantıları yakala
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.dis !== undefined) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || ayriMi(u.pathname)) return;
    // Aynı sayfada yalnız çapa: tarayıcı kendi kaydırsın
    if (u.pathname === location.pathname && u.search === location.search && u.hash) return;
    e.preventDefault();
    git(u.href);
  });

  return goster({ geri: true });
}

/** Etkin görünümü baştan kurar (ör. veri sürümü değişince). */
export function yenile() {
  birak();
  return goster({ geri: true });
}
