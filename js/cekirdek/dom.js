/* DOM yardımcıları. Görünümler HTML'i dizgi birleştirerek değil h() ile kurar;
   böylece veriden gelen metin hiçbir zaman HTML olarak yorumlanmaz. */

export const $ = (secici, kok = document) => kok.querySelector(secici);
export const $$ = (secici, kok = document) => [...kok.querySelectorAll(secici)];

const SVG_AD = 'http://www.w3.org/2000/svg';
const SVG_ETIKET = new Set(['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'use', 'ellipse', 'text', 'tspan', 'clipPath', 'linearGradient', 'radialGradient', 'stop', 'mask', 'title']);

/** h('a.fihrist-satir#x', { href: '/madde/1/1', onclick: fn, dataset: {no: 1} }, 'metin', h('span', …))
    - Etiket kısaltması: 'etiket.sinif.sinif#kimlik' (etiket yoksa div).
    - Özellikler: class, dataset, style (nesne), on<olay>, aria-*, hidden, html (yalnız GÜVENİLİR kaynak için).
    - Çocuklar: dizgi/sayı metin düğümü olur; null/false/undefined atlanır; diziler açılır. */
export function h(tanim, ozellik, ...cocuklar) {
  if (ozellik instanceof Node || typeof ozellik === 'string' || typeof ozellik === 'number' || Array.isArray(ozellik)) {
    cocuklar.unshift(ozellik);
    ozellik = null;
  }
  const [, etiket = 'div', kalan = ''] = /^([a-zA-Z][\w-]*)?(.*)$/.exec(tanim);
  const el = SVG_ETIKET.has(etiket) ? document.createElementNS(SVG_AD, etiket) : document.createElement(etiket);
  for (const parca of kalan.match(/[.#][^.#]+/g) || []) {
    if (parca[0] === '#') el.id = parca.slice(1);
    else el.classList.add(parca.slice(1));
  }
  for (const [ad, deger] of Object.entries(ozellik || {})) {
    if (deger === null || deger === undefined || deger === false) continue;
    if (ad === 'class') el.setAttribute('class', [el.getAttribute('class'), deger].filter(Boolean).join(' '));
    else if (ad === 'dataset') Object.assign(el.dataset, deger);
    else if (ad === 'style' && typeof deger === 'object') Object.assign(el.style, deger);
    else if (ad === 'html') el.innerHTML = deger;
    else if (ad.startsWith('on') && typeof deger === 'function') el.addEventListener(ad.slice(2).toLowerCase(), deger);
    else if (deger === true) el.setAttribute(ad, '');
    else el.setAttribute(ad, deger);
  }
  ekle(el, cocuklar);
  return el;
}

/** Çocukları ekler (iç içe diziler, metinler, düğümler). */
export function ekle(kap, cocuklar) {
  for (const c of [cocuklar].flat(Infinity)) {
    if (c === null || c === undefined || c === false || c === true) continue;
    kap.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return kap;
}

/** Kabın içini boşaltıp yeni içerik koyar. */
export function doldur(kap, ...cocuklar) {
  kap.replaceChildren();
  return ekle(kap, cocuklar);
}

/** HTML'e güvenle gömmek için kaçış (yalnız html: özelliği kullanılacaksa). */
export function kacis(s) {
  return String(s ?? '').replace(/[&<>"']/g, k => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[k]));
}

/** Tek renk çizgi simge. yol: 24×24 görüş kutusunda path "d" değeri (birden çoksa dizi). */
export function simge(yol, ozellik = {}) {
  return h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false', ...ozellik },
    [yol].flat().map(d => h('path', { d })));
}

/** Sekiz köşeli şemse (iki kare). ic: ortadaki daire çizilsin mi. */
export function semse(ozellik = {}, ic = true) {
  return h('svg.semse', { viewBox: '-12 -12 24 24', 'aria-hidden': 'true', focusable: 'false', ...ozellik },
    h('rect', { x: -7, y: -7, width: 14, height: 14 }),
    h('rect', { x: -7, y: -7, width: 14, height: 14, transform: 'rotate(45)' }),
    ic ? h('circle', { r: 2.6 }) : null);
}

/** İskelet satırları (yükleniyor). */
export function iskelet(satir = 7) {
  return h('.iskelet', { 'aria-hidden': 'true' }, Array.from({ length: satir }, () => h('i')));
}

/** Boş ya da hatalı durum bloğu. */
export function durum(baslik, aciklama, ...eylemler) {
  return h('.durum', { role: 'status' }, h('h2', baslik), aciklama ? h('p', aciklama) : null, eylemler.length ? h('.sira', eylemler) : null);
}

/** Olay dinleyici ekler; sinyal iptal edilince kendiliğinden kalkar. */
export function dinle(hedef, olay, isleyici, secenek = {}) {
  hedef.addEventListener(olay, isleyici, secenek);
  return () => hedef.removeEventListener(olay, isleyici, secenek);
}

/** Bir sonraki boyama karesini bekler. */
export const kare = () => new Promise(c => requestAnimationFrame(() => c()));

export const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
