/* Hızlı arama penceresi: üst çubuktaki düğme, "/" ve ⌘K/Ctrl+K ile her sayfadan açılır (js/ana.js).
   - Yerel <dialog>; Esc ve arka plan kapatır; geçmişe kayıt eklemez.
   - Her tuşta arama.hizli() (işçide ~1 ms): maddeler, lügat, hâl tercemeleri, tablolar, soru→madde.
   - hizli.json yalnız pencere ilk açıldığında iner; tam metin dizinine dokunulmaz.
   - Sorgu hiçbir yerde HTML'e ya da özniteliğe gömülmez; vurgular DOM düğümleriyle kurulur.
   Arama sayfası (js/gorunum/arama.js) buradaki vurguluMetin, aramaYolu ve sonAramalar'ı da kullanır. */

import { HUKUMLER_ACIK } from '../cekirdek/ayar.js';
import { h, doldur } from '../cekirdek/dom.js';
import { cssYukle } from '../cekirdek/css.js';
import { git } from '../cekirdek/yonlendirici.js';
import { arama } from '../cekirdek/arama.js';
import { veri } from '../cekirdek/veri.js';
import { roma, sahife, ad } from '../cekirdek/bicim.js';

const ARA_SIMGE = 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16 16l5 5';

/* ── Ortak yardımcılar ─────────────────────────────────────────── */

/** /arama/<sorgu>; sorgu yalnız kodlanmış olarak adrese girer. */
export const aramaYolu = (sorgu, ek = '') => '/arama' + (sorgu ? '/' + encodeURIComponent(sorgu) : '') + ek;

/** Maddeye, okuyucu sorguyu işaretleyip ilk eşleşmeye kaydırsın diye ?v= ile. */
export const maddeYolu = (kisim, no, sorgu) => `/madde/${kisim}/${no}` + (sorgu ? '?v=' + encodeURIComponent(sorgu) : '');

/** Vurgu aralıklarından (asıl metne göre [[bas, son]…]) DOM parçası kurar. bicim: her dilime uygulanan
    gösterim işlevi (yalnız başlık ve isimlerde: ad()); kitap metninde verilmez. */
export function vurguluMetin(metin, vurgular = [], { basKesik = false, sonKesik = false, bicim = null } = {}) {
  const b = bicim || (x => x);
  metin = String(metin ?? '');
  const parca = document.createDocumentFragment();
  if (basKesik) parca.append('… ');
  // Yalnız boşlukla ayrılan bitişik vurgular tek işaret olsun ("Ebû Hanîfe")
  const birlesik = [];
  for (const [bas, son] of vurgular || []) {
    const o = birlesik[birlesik.length - 1];
    if (o && bas >= o[1] && /^[ \u00a0]*$/.test(metin.slice(o[1], bas))) o[1] = Math.max(o[1], son);
    else birlesik.push([bas, son]);
  }
  let i = 0;
  for (const [bas, son] of birlesik) {
    if (bas < i || son <= bas || bas >= metin.length) continue;
    if (bas > i) parca.append(b(metin.slice(i, bas)));
    const m = document.createElement('mark');
    m.textContent = b(metin.slice(bas, son));
    parca.append(m);
    i = son;
  }
  parca.append(b(metin.slice(i)));
  if (sonKesik) parca.append(' …');
  return parca;
}

/** Bu oturumun son aramaları. Eski sitede arama geçmişi tutulmuyordu; yeni kalıcı anahtar açılmadı,
    liste yalnız sekme açık kaldıkça bellekte durur. */
const sonlar = [];
export const sonAramalar = {
  liste: () => sonlar.slice(),
  ekle(sorgu) {
    const q = String(sorgu || '').trim().replace(/\s+/g, ' ');
    if (q.length < 2) return;
    const k = q.toLocaleLowerCase('tr');
    const i = sonlar.findIndex(x => x.toLocaleLowerCase('tr') === k);
    if (i >= 0) sonlar.splice(i, 1);
    sonlar.unshift(q);
    if (sonlar.length > 8) sonlar.length = 8;
  },
};

/** Tanım kaydının (tanimlarData sırası) bağlı olduğu madde: "2-46" | null. Bir kez iner (küçük). */
let tanimSoz = null;
export function tanimMaddesi(kimlik) {
  if (!tanimSoz) {
    tanimSoz = veri.tanimlar().then(v => v.tanimlar);
    tanimSoz.catch(() => { tanimSoz = null; });
  }
  return tanimSoz.then(l => (l[kimlik] && l[kimlik].madde) || null, () => null);
}

const BASLANGIC = [
  ['Fihrist', '/icindekiler', 'Kitabın bütün maddeleri'],
  ['Dinî lügat', '/sozluk', 'Kitaptaki kelimelerin mânâları'],
  ['Hâl tercemeleri', '/sahislar', 'Kitapta adı geçen zâtlar'],
  ...(HUKUMLER_ACIK ? [['Fıkhî hükümler', '/hukumler', 'Farz, vâcib, sünnet, harâm…']] : []),
];

/* ── Pencere ──────────────────────────────────────────────────── */

let acik = null;
let sayac = 0;

export async function ac(ilkSorgu = '') {
  if (acik) {
    if (ilkSorgu) acik.yaz(ilkSorgu);
    acik.girdi.focus();
    return;
  }
  await cssYukle('/css/arama.css');
  if (acik) return;
  acik = kur(String(ilkSorgu || ''));
}

function kur(ilk) {
  const kimlik = 'hz' + (++sayac);
  let secili = -1;
  let istekNo = 0;
  let sonSorgu = '';
  let dizinHazir = false;

  const girdi = h('input.hizli-girdi', {
    type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': kimlik + '-l', 'aria-autocomplete': 'list',
    autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'search',
    placeholder: 'Kitapta, lügatte ve hâl tercemelerinde arayın', 'aria-label': 'Kitapta arayın',
  });
  const liste = h('.hizli-sonuc', { id: kimlik + '-l', role: 'listbox', 'aria-label': 'Sonuçlar' });
  const kapat = () => { if (d.open) d.close(); };
  const d = h('dialog.pencere.hizli', { 'aria-label': 'Kitapta arayın' },
    h('.hizli-alan', { role: 'search' },
      h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' }, h('path', { d: ARA_SIMGE })),
      girdi,
      h('button.hizli-kapat', { type: 'button', onclick: kapat, 'aria-label': 'Aramayı kapatın' },
        h('kbd', { 'aria-hidden': 'true' }, 'esc'), h('span', { 'aria-hidden': 'true' }, 'Kapatın'))),
    liste,
    h('.hizli-alt',
      h('p.hizli-ipucu.kunye', { 'aria-hidden': 'true' },
        h('span', h('kbd', '↑'), h('kbd', '↓'), ' gezin'), h('span', h('kbd', '↵'), ' açın'), h('span', h('kbd', 'esc'), ' kapatın')),
      h('a.ok-bag.hizli-sayfa', { href: '/arama' }, 'Arama sayfası')));

  const secenekler = () => [...liste.querySelectorAll('[role="option"]')];
  function sec(i, kaydir = true) {
    const l = secenekler();
    secili = l.length ? i : -1;
    l.forEach((el, j) => el.setAttribute('aria-selected', String(j === secili)));
    if (secili >= 0) {
      girdi.setAttribute('aria-activedescendant', l[secili].id);
      if (kaydir) l[secili].scrollIntoView({ block: 'nearest' });
    } else girdi.removeAttribute('aria-activedescendant');
  }

  let secenekSay = 0;
  const secenek = (href, ozellik, ...icerik) => h('a', { href, role: 'option', id: `${kimlik}-o${++secenekSay}`, 'aria-selected': 'false', tabindex: '-1', ...ozellik }, ...icerik);
  const grup = (baslik, satirlar) => {
    if (!satirlar.length) return null;
    const gid = `${kimlik}-g${++secenekSay}`;
    return h('.hizli-kume', { role: 'group', 'aria-labelledby': gid }, h('.hizli-grup.ust-yazi', { id: gid }, baslik), satirlar);
  };

  function tamSatir(q) {
    return h('.hizli-kume.hizli-tamkume',
      secenek(aramaYolu(q), { class: 'hizli-tam' },
        h('span.hizli-no', { 'aria-hidden': 'true' }, h('svg', { viewBox: '0 0 24 24', focusable: 'false' }, h('path', { d: ARA_SIMGE }))),
        h('span.hizli-ad', '“', h('b', q), '” için kitabın tamamında arayın'),
        h('span.hizli-ok', { 'aria-hidden': 'true' }, '→')));
  }

  function bosCiz() {
    const son = sonAramalar.liste().slice(0, 6);
    secenekSay = 0;
    doldur(liste,
      grup('Son aramalarınız', son.map(q => secenek(aramaYolu(q), {},
        h('span.hizli-no.hizli-gecmis', { 'aria-hidden': 'true' }, '↺'), h('span.hizli-ad', q)))),
      grup('Başlarken', BASLANGIC.map(([a, href, aciklama]) => secenek(href, {},
        h('span.hizli-no', { 'aria-hidden': 'true' }, '·'), h('span.hizli-ad', a), null, h('small', aciklama)))));
    sec(-1);
  }

  function ileti(baslik, aciklama, ...ek) {
    return h('.hizli-ileti', { role: 'status' }, h('p.hizli-ileti-bas', baslik), aciklama ? h('p', aciklama) : null, ek);
  }

  function sonucCiz(q, s) {
    secenekSay = 0;
    const no = (k, n) => h('span.hizli-no', { 'aria-hidden': 'true' }, `${roma(k)}·${n}`);
    const sayfa = (b, e) => b ? h('span.fihrist-sayfa.hizli-sayfa-no', sahife(b, e)) : null;

    const soru = s.soru && s.soru[0];
    const maddeler = (s.maddeler || []).slice(0, 6);
    const lugat = (s.lugat || []).slice(0, 5);
    const sahislar = (s.sahislar || []).slice(0, 5);
    const tablolar = (s.tablolar || []).slice(0, 5);
    const tanimlar = [];

    const kumeler = [
      soru ? grup('Bu suâlin cevabı', [secenek(maddeYolu(soru.kisim, soru.no), { class: 'hizli-soru' },
        no(soru.kisim, soru.no), h('span.hizli-ad', ad(soru.baslik)), null,
        soru.cevapOzet ? h('small', soru.cevapOzet) : null)]) : null,
      grup('Maddeler', maddeler.map(m => secenek(maddeYolu(m.kisim, m.no, q), {},
        no(m.kisim, m.no), h('span.hizli-ad', vurguluMetin(m.baslik, m.vurgular, { bicim: ad })), sayfa(m.sahife, m.sahifeBitis)))),
      grup('Lügat', lugat.map(x => {
        if (x.tur === 'tanim') {
          const a = secenek(aramaYolu(x.baslik, '?tur=tanim'), {},
            h('span.hizli-no', { 'aria-hidden': 'true' }), h('span.hizli-ad', vurguluMetin(x.baslik, x.vurgular, { bicim: ad })), sayfa(x.sahife),
            h('small', 'Kitabın kendi tanımı'));
          tanimlar.push([a, x]);
          return a;
        }
        return secenek(`/sozluk#sozluk-entry-${x.kimlik}`, {},
          h('span.hizli-no', { 'aria-hidden': 'true' }), h('span.hizli-ad', vurguluMetin(x.baslik, x.vurgular, { bicim: ad })));
      })),
      grup('Hâl tercemeleri', sahislar.map(x => secenek(`/sahis/${encodeURIComponent(x.kimlik)}`, {},
        h('span.hizli-no', { 'aria-hidden': 'true' }),
        h('span.hizli-ad', vurguluMetin(x.baslik, x.vurgular, { bicim: ad }), x.unvan ? h('i.hizli-unvan', ' ' + x.unvan) : null)))),
      grup('Tablolar', tablolar.map(x => secenek(`/fevaid/tablolar/${encodeURIComponent(x.kimlik)}`, {},
        h('span.hizli-no', { 'aria-hidden': 'true' }), h('span.hizli-ad', vurguluMetin(x.baslik, x.vurgular, { bicim: ad })), sayfa(x.sahife)))),
    ].filter(Boolean);

    doldur(liste,
      kumeler.length ? kumeler : ileti('Başlıklarda bulunamadı', 'Kitabın metninde aramak için Enter tuşuna basın ya da aşağıdaki satırı seçin.'),
      tamSatir(q));
    sec(-1);
    // Tanımın maddesi: bağlantıyı maddeye çevir (bulunamazsa tanım aramasında kalır)
    for (const [a, x] of tanimlar) {
      tanimMaddesi(x.kimlik).then(m => {
        const p = m && /^(\d)-(\d+)$/.exec(m);
        if (p && a.isConnected) a.setAttribute('href', maddeYolu(p[1], p[2], x.baslik));
      });
    }
  }

  function hataCiz(q) {
    secenekSay = 0;
    doldur(liste,
      ileti('Hızlı arama şu anda açılamadı', 'Bağlantınızı denetleyip yeniden deneyin. Arama sayfası da kullanılabilir.'),
      q ? tamSatir(q) : null);
    sec(-1);
  }

  function ara() {
    const q = girdi.value.trim().replace(/\s+/g, ' ');
    if (q === sonSorgu && liste.childElementCount) return;
    sonSorgu = q;
    const no = ++istekNo;
    if (!q) { bosCiz(); return; }
    // İlk açılışta dizin inene dek sessiz bir satır (anında gelirse hiç görünmez)
    const bekle = dizinHazir ? 0 : setTimeout(() => {
      if (no === istekNo) { secenekSay = 0; doldur(liste, ileti('Dizin hazırlanıyor…', null), tamSatir(q)); sec(-1); }
    }, 140);
    arama.hizli(q, { sinir: 6 }).then(s => {
      clearTimeout(bekle);
      dizinHazir = true;
      if (no !== istekNo || !d.open) return;
      sonucCiz(q, s);
    }, hata => {
      clearTimeout(bekle);
      if (no !== istekNo || !d.open) return;
      console.warn('Hızlı arama:', hata);
      hataCiz(q);
    });
  }

  girdi.addEventListener('input', ara);
  girdi.addEventListener('keydown', e => {
    if (e.isComposing) return;
    const l = secenekler();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (l.length) sec(secili < 0 || secili >= l.length - 1 ? 0 : secili + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (l.length) sec(secili <= 0 ? l.length - 1 : secili - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const q = girdi.value.trim().replace(/\s+/g, ' ');
      if (secili >= 0 && l[secili]) { l[secili].click(); return; }
      if (!q) return;
      sonAramalar.ekle(q);
      kapat();
      git(aramaYolu(q));
    }
  });
  // Bir satır seçilince (fare, dokunma, Enter) pencere kapanır; yönlendirici bağlantıyı belgede yakalar.
  d.addEventListener('click', e => {
    if (e.target === d) { kapat(); return; }
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (sonSorgu.length >= 2) sonAramalar.ekle(sonSorgu);
    setTimeout(kapat, 0);
  });
  liste.addEventListener('pointermove', e => {
    const a = e.target.closest && e.target.closest('[role="option"]');
    if (!a || a.getAttribute('aria-selected') === 'true') return;
    sec(secenekler().indexOf(a), false);
  });

  const gorunumDegisti = () => kapat();
  addEventListener('ilmihal:gorunum', gorunumDegisti);
  d.addEventListener('close', () => {
    removeEventListener('ilmihal:gorunum', gorunumDegisti);
    istekNo++;
    d.remove();
    acik = null;
  });

  document.body.appendChild(d);
  d.showModal();
  girdi.value = ilk;
  girdi.focus();
  if (ilk) girdi.select();
  ara();
  // Dizini şimdi iste (pencere açılmadan önce hiçbir şey inmez)
  arama.hazirla().then(() => { dizinHazir = true; }, () => {});

  return { girdi, yaz: q => { girdi.value = q; ara(); } };
}
