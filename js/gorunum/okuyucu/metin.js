/* Okuyucu — madde metninin dizgisi.
   - paragraflar() türlerine göre bloklar; her metin taşıyan blokta data-bas (maddedeki konum) vardır.
     Bir bloğun metin düğümleri art arda okunduğunda maddenin o parçası BİREBİR çıkar; böylece
     lügat, atıf, arama ve vurgu işaretleri aynı konum sistemiyle yerleşir.
   - İlk boyamada düz metin + metin içi atıflar; lügat sonra, parça parça (ana iş parçacığı kilitlenmez).
   - Veriden gelen hiçbir şey HTML olarak basılmaz. */

import { h } from '../../cekirdek/dom.js';
import { maddeKimlik, paragraflar } from '../../cekirdek/veri.js';

const KISIM_SIRA = { 'Birinci': 1, 'İkinci': 2, 'Üçüncü': 3 };

/** Ana iş parçacığına nefes aldırır. */
export const nefes = () => new Promise(c => {
  if (globalThis.scheduler && typeof scheduler.yield === 'function') scheduler.yield().then(c, c);
  else setTimeout(c, 0);
});

/** Diziyi zaman bütçesiyle işler; iptal edilirse false döner. */
export async function parcaParca(dizi, is, sinyal, butce = 8) {
  let t = performance.now();
  for (const x of dizi) {
    if (sinyal && sinyal.aborted) return false;
    is(x);
    if (performance.now() - t > butce) { await nefes(); t = performance.now(); }
  }
  return !(sinyal && sinyal.aborted);
}

/* ── Metin içi atıflar: "[Madde 54’e bakınız!]", "İkinci kısm, 52. ci maddeye bakınız", "566. cı sahîfeye bakınız" ── */
const MADDE_RE = /Madde (\d{1,3})(?=[’']?[ea] bak)/g;
const MADDEYE_RE = /(?:(Birinci|İkinci|Üçüncü) kısm(?:da|ın|ının)?,? )?(\d{1,3})\. ?[a-zçğıöşü]{0,4} maddeye(?= bak)/g;
const SAHIFE_RE = /(\d{1,4})\. ?[a-zçğıöşü]{0,4} sahîfeye(?= bak)/g;

/** Bir paragraftaki atıflar: [{bas, son, tur:'madde'|'sahife', yol?, sahife?}] (madde içi konumlar). */
export function atiflariBul(p, kisim, sahifeSayisi) {
  if (p.tur !== 'paragraf' && p.tur !== 'dipnot' && p.tur !== 'siir') return [];
  const t = p.metin, sonuc = [];
  for (const re of [MADDE_RE, MADDEYE_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(t))) {
      const k = re === MADDEYE_RE && m[1] ? KISIM_SIRA[m[1]] : kisim;
      const no = +(re === MADDEYE_RE ? m[2] : m[1]);
      const yol = maddeKimlik.yol(k, no);
      if (yol) sonuc.push({ bas: p.bas + m.index, son: p.bas + m.index + m[0].length, tur: 'madde', yol, etiket: `${k}. kısım, ${no}. madde` });
    }
  }
  SAHIFE_RE.lastIndex = 0;
  let m;
  while ((m = SAHIFE_RE.exec(t))) {
    const n = +m[1];
    const once = t.slice(Math.max(0, m.index - 14), m.index);
    // Başka kitabın sahîfesi "(Fâideli Bilgiler) 107. ci sahîfeye" ya da maddenin içi "74. cü madde, 5. ci sahîfeye" bağlanmaz
    if (/\)[.,]?\s*$/.test(once) || /madde,?\s*$/i.test(once)) continue;
    if (n < 1 || n > sahifeSayisi) continue;
    sonuc.push({ bas: p.bas + m.index, son: p.bas + m.index + m[0].length, tur: 'sahife', sahife: n });
  }
  return sonuc.sort((a, b) => a.bas - b.bas).filter((x, i, d) => !i || x.bas >= d[i - 1].son);
}

/** Bloğun içini parçalardan kurar: düz metin + atıf bağlantıları + lügat kelimeleri. */
export function blokDoldur(el, p, { atiflar = [], lugat = [], pdfAdres = '' } = {}) {
  const kaynak = p.tur === 'cedvel' ? p.icerik : p.metin;
  const ofset = +el.dataset.bas;
  const isaret = [];
  for (const a of atiflar) isaret.push({ ...a, cins: 'atif' });
  let ai = 0;
  for (const l of lugat) {
    while (ai < atiflar.length && atiflar[ai].son <= l.bas) ai++;
    if (ai < atiflar.length && atiflar[ai].bas < l.son && l.bas < atiflar[ai].son) continue;  // atıfla çakışan kelime işaretlenmez
    isaret.push({ ...l, cins: 'lugat' });
  }
  isaret.sort((a, b) => a.bas - b.bas);
  const parca = document.createDocumentFragment();
  let i = ofset;
  for (const x of isaret) {
    if (x.bas < i) continue;
    if (x.bas > i) parca.append(kaynak.slice(i - ofset, x.bas - ofset));
    const yazi = kaynak.slice(x.bas - ofset, x.son - ofset);
    if (x.cins === 'lugat') {
      parca.append(h('span.zor-kelime', { dataset: { id: String(x.id) }, role: 'button', tabindex: '0', 'aria-haspopup': 'dialog' }, yazi));
    } else if (x.tur === 'madde') {
      parca.append(h('a.atif', { href: x.yol, title: 'Kitapta: ' + x.etiket }, yazi));
    } else {
      parca.append(h('a.atif.atif-sahife', { href: pdfAdres + '#page=' + x.sahife, target: '_blank', rel: 'noopener', dataset: { sahife: String(x.sahife) }, title: `Kitabın aslında ${x.sahife}. sahîfe` }, yazi));
    }
    i = x.son;
  }
  if (i - ofset < kaynak.length) parca.append(kaynak.slice(i - ofset));
  el.replaceChildren(parca);
}

/** Metnin bloklarını kurar. Döner: { kok, bloklar:[{el, p, bas, son, atiflar}], paragraflar } */
export function metinKur(madde, { sahifeSayisi = 1248, pdfAdres = '' } = {}) {
  const pler = paragraflar(madde.metin);
  const kok = h('.oku-metin', { lang: 'tr' });
  const bloklar = [];
  let onceki = null;
  for (const p of pler) {
    if (p.tur === 'bos') continue;
    let dis, el = null;
    if (p.tur === 'baslik') {
      el = dis = h('h2.oku-ara-baslik');
    } else if (p.tur === 'siir') {
      el = dis = h('p.oku-siir');
    } else if (p.tur === 'dipnot') {
      el = h('p.oku-dipnot-metin');
      if (onceki && onceki.classList.contains('oku-dipnot')) { onceki.append(el); dis = null; }
      else dis = h('aside.oku-dipnot', { 'aria-label': 'Dipnot' }, el);
    } else if (p.tur === 'tablo') {
      el = h('pre.oku-tablo');
      dis = h('.oku-tablo-kutu', { tabindex: '0', role: 'region', 'aria-label': 'Hizalı metin (yana kaydırılabilir)' }, el);
    } else if (p.tur === 'cedvel') {
      el = h('pre.oku-tablo');
      dis = h('figure.oku-cedvel',
        h('.oku-tablo-kutu', { tabindex: '0', role: 'region', 'aria-label': 'Cedvel (yana kaydırılabilir)' }, el),
        h('figcaption.oku-not', 'Kitaptaki aslı: ',
          h('a', { href: pdfAdres + '#page=' + p.sahife, target: '_blank', rel: 'noopener', dataset: { sahife: String(p.sahife) } }, `${p.sahife}. sahîfe`)));
    } else if (p.tur === 'sekil') {
      dis = h('figure.oku-sekil',
        h('span.oku-sekil-isaret', { 'aria-hidden': 'true' }),
        h('figcaption.oku-not', 'Kitapta burada bir şekil vardır: ',
          h('a', { href: pdfAdres + '#page=' + p.sahife, target: '_blank', rel: 'noopener', dataset: { sahife: String(p.sahife) } }, `${p.sahife}. sahîfede görün`)));
    } else {
      el = dis = h('p.oku-p');
    }
    if (el) {
      const bas = p.tur === 'cedvel' ? p.son - p.icerik.length : p.bas;
      el.dataset.bas = String(bas);
      const atiflar = atiflariBul(p, madde.kisim, sahifeSayisi);
      blokDoldur(el, p, { atiflar, pdfAdres });
      bloklar.push({ el, p, bas, son: p.son, atiflar });
    }
    if (dis) { kok.append(dis); onceki = dis; }
  }
  return { kok, bloklar, paragraflar: pler };
}

/** Lügat konumlarını bloklara dağıtıp her bloğu yeniden kurar (parça parça). sonra(blok) her bloktan sonra çağrılır. */
export async function lugatUygula(bloklar, konumlar, sinyal, { pdfAdres = '', sonra = () => {} } = {}) {
  const dagilim = new Map();
  let j = 0;
  const sirali = bloklar.filter(b => b.p.lugat).sort((a, b) => a.bas - b.bas);
  for (const b of sirali) {
    const liste = [];
    while (j < konumlar.length && konumlar[j].son <= b.son) {
      if (konumlar[j].bas >= b.bas) liste.push(konumlar[j]);
      j++;
    }
    if (liste.length) dagilim.set(b, liste);
  }
  return parcaParca([...dagilim.keys()], b => {
    blokDoldur(b.el, b.p, { atiflar: b.atiflar, lugat: dagilim.get(b), pdfAdres });
    sonra(b);
  }, sinyal);
}

/* ── Konum ↔ DOM ── */

/** Maddedeki [bas, son) aralığını blokların metin düğümlerinde sarar. kur(): yeni sarmalayıcı öğe. Döner: öğeler. */
export function araligiSar(bloklar, bas, son, kur) {
  const sonuc = [];
  for (const b of bloklar) {
    const bb = +b.el.dataset.bas, bs = bb + (b.el.textContent || '').length;
    if (bs <= bas || bb >= son) continue;
    const yuruyen = document.createTreeWalker(b.el, NodeFilter.SHOW_TEXT);
    const parcalar = [];
    let i = bb;
    for (let n = yuruyen.nextNode(); n; n = yuruyen.nextNode()) {
      const L = n.data.length;
      const s = Math.max(bas, i), e = Math.min(son, i + L);
      if (s < e) parcalar.push([n, s - i, e - i]);
      i += L;
      if (i >= son) break;
    }
    for (const [n, s, e] of parcalar) {
      let x = n;
      if (s > 0) x = x.splitText(s);
      if (e - s < x.data.length) x.splitText(e - s);
      if (!x.data.trim()) continue;
      const m = kur();
      x.replaceWith(m);
      m.append(x);
      sonuc.push(m);
    }
  }
  return sonuc;
}

/** Sarmalayıcıyı söker (içindekiler yerinde kalır). */
export function sok(el) {
  const ust = el.parentNode;
  if (!ust) return;
  while (el.firstChild) ust.insertBefore(el.firstChild, el);
  el.remove();
  ust.normalize();
}

/** DOM'daki bir sınır noktasının maddedeki konumu (blok dışındaysa en yakın bloğa yaslanır). */
export function noktaKonumu(bloklar, node, off, yon = 'bas') {
  const el = node.nodeType === 3 ? node.parentElement : node;
  const blok = el && el.closest('[data-bas]');
  const b = blok && bloklar.find(x => x.el === blok);
  if (b) {
    const r = document.createRange();
    r.setStart(blok, 0);
    try { r.setEnd(node, off); } catch (e) { return null; }
    return +blok.dataset.bas + r.toString().length;
  }
  const r = document.createRange();
  if (yon === 'bas') {
    for (const x of bloklar) {
      r.selectNodeContents(x.el);
      if (r.comparePoint(node, off) <= 0) return +x.el.dataset.bas;
    }
  } else {
    for (let i = bloklar.length - 1; i >= 0; i--) {
      r.selectNodeContents(bloklar[i].el);
      if (r.comparePoint(node, off) >= 0) return +bloklar[i].el.dataset.bas + bloklar[i].el.textContent.length;
    }
  }
  return null;
}

/** Bir metni (vurgu) maddede bulur: önce birebir, sonra boşluk farkını yok sayarak. Döner [bas, son] ya da null. */
export function metindeBul(metin, aranan, baslangic = 0) {
  if (!aranan) return null;
  let i = metin.indexOf(aranan, baslangic);
  if (i >= 0) return [i, i + aranan.length];
  const ara = aranan.replace(/\s+/g, ' ').trim();
  if (ara.length < 2) return null;
  // boşlukları tek boşluğa indirerek eşle
  let duz = '';
  const konum = [];
  let bosluk = false;
  for (let k = 0; k < metin.length; k++) {
    const c = metin[k];
    if (/\s/.test(c)) { if (!bosluk) { duz += ' '; konum.push(k); bosluk = true; } }
    else { duz += c; konum.push(k); bosluk = false; }
  }
  i = duz.indexOf(ara);
  if (i < 0) return null;
  return [konum[i], konum[i + ara.length - 1] + 1];
}
