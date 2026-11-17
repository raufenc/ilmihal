/* Okuyucu — "Diğer" menüsü, kısayollar penceresi ve sunum modu. */

import { h, simge } from '../../cekirdek/dom.js';
import { ad, kisimAdi } from '../../cekirdek/bicim.js';
import { pencere } from '../../bilesen/pencere.js';
import { pencereAc } from './ayarlar.js';
import { YOL } from './simgeler.js';

export function digerAc(S, dugme) {
  const kalem = (etiket, yol, fn, ek = null) => h('li', h('button.menu-kalem', { type: 'button', role: 'menuitem', onclick: () => { d.close(); fn(); } },
    simge(yol), h('span', etiket), ek ? h('kbd', ek) : null));
  const d = h('dialog.oku-pencere.oku-menu', { 'aria-label': 'Diğer araçlar' },
    h('ul', { role: 'menu', 'aria-label': 'Diğer araçlar' },
      h('li.dar-yalniz', { role: 'none' }, h('button.menu-kalem', { type: 'button', role: 'menuitem', onclick: () => { d.close(); S.sahife.ac(S.madde.sahife[0], S.dg.diger); } }, simge(YOL.asil), h('span', 'Kitabın aslı'))),
      h('li.dar-yalniz', { role: 'none' }, h('button.menu-kalem', { type: 'button', role: 'menuitem', onclick: () => { d.close(); S.paylas(); } }, simge(YOL.paylas), h('span', 'Paylaşın'))),
      kalem('Notlarım ve vurgularım', YOL.not, () => S.notYaz && S.notYaz()),
      kalem('Yazdırın', YOL.yazdir, () => setTimeout(() => print(), 60)),
      kalem('Sunum modu', YOL.sunum, () => sunumAc(S)),
      kalem('Klavye kısayolları', YOL.klavye, kisayollarAc, '?')));
  for (const li of d.querySelectorAll('li')) li.setAttribute('role', 'none');
  // Ok tuşlarıyla menüde gezinme
  d.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    const kalemler = [...d.querySelectorAll('.menu-kalem')].filter(b => b.offsetParent !== null);
    const i = kalemler.indexOf(document.activeElement);
    e.preventDefault();
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? kalemler.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + kalemler.length) % kalemler.length;
    kalemler[j].focus();
  });
  pencereAc(d, dugme);
  const ilk = [...d.querySelectorAll('.menu-kalem')].find(b => b.offsetParent !== null);
  if (ilk) ilk.focus();
}

export function kisayollarAc() {
  const satirlar = [
    [['J', '→'], 'Sonraki madde'],
    [['K', '←'], 'Önceki madde'],
    [['+', '−'], 'Yazıyı büyütün / küçültün'],
    [['B'], 'Yer imi ekleyin ya da kaldırın'],
    [['L'], 'Lügat çizgilerini açın / kapatın'],
    [['F'], 'Kısmın fihristi'],
    [['/'], 'Kitapta arayın'],
    [['Esc'], 'Açık paneli kapatın'],
    [['?'], 'Bu pencere']
  ];
  pencere({
    baslik: 'Klavye kısayolları',
    sinif: 'oku-kisayol',
    icerik: [
      h('dl.kisayol-liste', satirlar.map(([tuslar, ne]) => [h('dt', tuslar.map((t, i) => [i ? h('span.kisayol-ya', ' ya da ') : null, h('kbd', t)])), h('dd', ne)])),
      h('p.kunye', { style: { marginTop: 'var(--a-4)' } }, 'Yazı alanındayken kısayollar çalışmaz. Lügat kelimelerine Sekme tuşuyla gelip Enter ile açıklamasını görebilirsiniz.')
    ]
  });
}

/** Sunum modu: maddenin metni tam ekranda, büyük yazıyla. Esc yalnız sunumu kapatır. */
export function sunumAc(S) {
  if (!S.madde) return;
  let boy = 1.6;
  const metin = S.metinKok.cloneNode(true);
  for (const el of metin.querySelectorAll('[id]')) el.removeAttribute('id');
  for (const el of metin.querySelectorAll('mark.arama, mark.goster')) el.replaceWith(...el.childNodes);
  for (const el of metin.querySelectorAll('.zor-kelime')) { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.classList.remove('zor-kelime'); }
  const govde = h('.sunum-govde', { style: { '--sunum-boy': boy + 'rem' } },
    h('p.ust-yazi.surh', `${kisimAdi(S.madde.kisim)} · Madde ${S.madde.no}`),
    h('h2.sunum-baslik', ad(S.madde.baslik)),
    metin);
  const ayarla = fark => { boy = Math.max(1.2, Math.min(3.5, Math.round((boy + fark) * 10) / 10)); govde.style.setProperty('--sunum-boy', boy + 'rem'); };
  const d = h('dialog.oku-sunum', { 'aria-label': 'Sunum modu: ' + S.madde.baslik },
    h('.sunum-arac',
      h('button.oku-dg', { type: 'button', 'aria-label': 'Yazıyı küçültün', title: 'Küçültün', onclick: () => ayarla(-0.2) }, h('span.sunum-a', 'A−')),
      h('button.oku-dg', { type: 'button', 'aria-label': 'Yazıyı büyütün', title: 'Büyütün', onclick: () => ayarla(0.2) }, h('span.sunum-a', 'A+')),
      h('button.oku-dg', { type: 'button', 'aria-label': 'Sunumu kapatın', title: 'Kapatın (Esc)', onclick: () => d.close() }, simge(YOL.kapat))),
    govde);
  d.addEventListener('keydown', e => {
    if (e.key === '+' || e.key === '=') { e.preventDefault(); ayarla(0.2); }
    else if (e.key === '-' || e.key === '−') { e.preventDefault(); ayarla(-0.2); }
  });
  d.addEventListener('close', () => { d.remove(); if (S.dg && S.dg.diger.isConnected) S.dg.diger.focus({ preventScroll: true }); });
  document.body.append(d);
  d.showModal();
  d.querySelector('.sunum-arac button:last-child').focus();
}
