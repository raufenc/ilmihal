/* Okuyucu — okuma ayarları (Aa): yazı boyutu, satır aralığı, hizalama, tema, lügat çizgileri.
   Eski anahtarlarla saklanır (ilmihal-font-size, ilmihal-okuma-ayarlari, ilmihal-theme).
   Yerel <dialog> üstünde: karartma her zaman panelin ALTINDA kalır (canlıdaki telefon hatası taşınmadı). */

import { h, simge } from '../../cekirdek/dom.js';
import { kullanici, YAZI_BOYUTU } from '../../cekirdek/kullanici.js';
import { temaOku, temaYaz, TEMALAR } from '../../cekirdek/tema.js';
import { YOL } from './simgeler.js';

const ARALIK = [{ d: '1.7', ad: 'Sık', css: 1.58 }, { d: '2', ad: 'Normal', css: 1.78 }, { d: '2.3', ad: 'Ferah', css: 2.02 }];
const HIZA = [{ d: 'left', ad: 'Sola' }, { d: 'justify', ad: 'İki yana' }];
const TEMA_RENK = { gunduz: '#f4efe4', sepya: '#ecdfc4', gece: '#0a0d14' };

/** Kayıtlı ayarları okuyucu köküne uygular. */
export function ayarUygula(S) {
  const a = kullanici.okumaAyarlari.etkin();
  const boy = kullanici.yaziBoyutu.al();
  const k = S.kok;
  k.style.setProperty('--oku-boy', boy + 'rem');
  k.style.setProperty('--oku-aralik', String((ARALIK.find(x => x.d === a.aralik) || ARALIK[1]).css));
  k.classList.toggle('iki-yana', a.hiza === 'justify');
  const kapali = !a.lugat;
  if (k.classList.contains('lugat-kapali') !== kapali) {
    k.classList.toggle('lugat-kapali', kapali);
    if (S.metinKok) for (const s of S.metinKok.querySelectorAll('.zor-kelime')) s.tabIndex = kapali ? -1 : 0;
    if (kapali && S.hasiye) S.hasiye.kapat();
  }
}

export function ayarlarAc(S, dugme) {
  const yuzde = h('output.ayar-yuzde', { 'aria-live': 'polite' });
  const kucult = h('button.ayar-boy', { type: 'button', 'aria-label': 'Yazıyı küçültün' }, h('span', { style: { fontSize: '0.85em' } }, 'A'), '−');
  const buyut = h('button.ayar-boy', { type: 'button', 'aria-label': 'Yazıyı büyütün' }, h('span', { style: { fontSize: '1.2em' } }, 'A'), '+');
  const boyGoster = () => {
    const n = kullanici.yaziBoyutu.al();
    yuzde.textContent = '%' + Math.round(n * 100);
    kucult.disabled = n <= YAZI_BOYUTU.en_az + 1e-6;
    buyut.disabled = n >= YAZI_BOYUTU.en_cok - 1e-6;
  };
  kucult.addEventListener('click', () => { kullanici.yaziBoyutu.degistir(-1); ayarUygula(S); boyGoster(); });
  buyut.addEventListener('click', () => { kullanici.yaziBoyutu.degistir(1); ayarUygula(S); boyGoster(); });

  const secimGrubu = (etiket, secenekler, etkin, yaz) => {
    const grup = h('.secim.ayar-secim', { role: 'group', 'aria-label': etiket });
    const isaretle = () => { const e = etkin(); for (const b of grup.children) b.setAttribute('aria-pressed', String(b.dataset.d === e)); };
    for (const s of secenekler) grup.append(h('button', { type: 'button', dataset: { d: s.d }, onclick: () => { yaz(s.d); ayarUygula(S); isaretle(); } }, s.ad));
    isaretle();
    return grup;
  };

  const aralik = secimGrubu('Satır aralığı', ARALIK, () => kullanici.okumaAyarlari.etkin().aralik, d => kullanici.okumaAyarlari.yaz('aralik', d));
  const hiza = secimGrubu('Hizalama', HIZA, () => kullanici.okumaAyarlari.etkin().hiza, d => kullanici.okumaAyarlari.yaz('hiza', d));
  const tema = h('.ayar-tema', { role: 'group', 'aria-label': 'Tema' });
  const temaIsaretle = () => { for (const b of tema.children) b.setAttribute('aria-pressed', String(b.dataset.d === temaOku())); };
  for (const t of TEMALAR) tema.append(h('button', { type: 'button', dataset: { d: t.ad }, onclick: () => { temaYaz(t.ad); temaIsaretle(); } }, h('i', { style: { background: TEMA_RENK[t.ad] } }), t.etiket));
  temaIsaretle();

  const anahtar = h('button.ayar-anahtar', { type: 'button', role: 'switch' }, h('span.ayar-anahtar-iz', { 'aria-hidden': 'true' }, h('i')));
  const anahtarGoster = () => anahtar.setAttribute('aria-checked', String(kullanici.okumaAyarlari.etkin().lugat));
  anahtar.addEventListener('click', () => { kullanici.okumaAyarlari.yaz('lugat', !kullanici.okumaAyarlari.etkin().lugat); ayarUygula(S); anahtarGoster(); });
  anahtarGoster();

  const satir = (baslik, ...ic) => h('.ayar-satir', h('span.ayar-etiket', baslik), ...ic);
  const d = h('dialog.oku-pencere.oku-ayarlar', { 'aria-labelledby': 'ayar-baslik' },
    h('.oku-pencere-bas',
      h('h2.ust-yazi#ayar-baslik', 'Okuma ayarları'),
      h('button.oku-dg', { type: 'button', 'aria-label': 'Kapatın', onclick: () => d.close() }, simge(YOL.kapat))),
    satir('Yazı boyutu', h('.ayar-boyut', kucult, yuzde, buyut)),
    satir('Satır aralığı', aralik),
    satir('Hizalama', hiza),
    satir('Tema', tema),
    h('label.ayar-satir.ayar-lugat', h('span.ayar-etiket', 'Lügat çizgileri', h('small', 'Açıklaması olan kelimelerin altındaki noktalı çizgi')), anahtar));
  boyGoster();
  pencereAc(d, dugme);
}

/** Okuyucu penceresini açar: Esc ve dışarı tıklama kapatır, odak açan düğmeye döner. Geçmişe kayıt eklemez. */
export function pencereAc(d, dugme, { konumla = true } = {}) {
  for (const eski of document.querySelectorAll('dialog.oku-pencere')) eski.close();
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.addEventListener('close', () => {
    d.remove();
    if (dugme) { dugme.setAttribute('aria-expanded', 'false'); if (dugme.isConnected) dugme.focus({ preventScroll: true }); }
  });
  document.body.append(d);
  if (dugme && konumla && innerWidth > 640) {
    const r = dugme.getBoundingClientRect();
    d.style.top = Math.round(r.bottom + 8) + 'px';
    d.style.right = Math.max(12, Math.round(innerWidth - r.right - 6)) + 'px';
    d.classList.add('cipa');
  }
  if (dugme) dugme.setAttribute('aria-expanded', 'true');
  d.showModal();
  return d;
}
