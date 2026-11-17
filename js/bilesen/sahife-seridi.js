/* Sahîfe şeridi: kitabın tamamı tek bakışta.
   Her kısım bir satır; her madde, kapladığı sahîfe kadar yer tutan bir dilim.
   Okunan dilimler mürekkeple dolar; günün maddesi sürhle, kaldığınız yer altınla işaretlidir.

   sahifeSeridi({ fihrist, okunan: Set("1-43"), gunun: "1-81", son: "1-12", secilince(madde|null) }) → DOM düğümü
   Klavye: şerit tek odak durağıdır; ok tuşları dilimler arasında gezer, Enter maddeyi açar. */

import { h } from '../cekirdek/dom.js';
import { ad, sahife } from '../cekirdek/bicim.js';

const anahtar = m => `${m.kisim}-${m.no}`;

export function sahifeSeridi({ fihrist, okunan = new Set(), gunun = null, son = null, secilince = () => {} }) {
  const dilimler = [];          // { el, m }
  let etkin = -1;

  const satirlar = fihrist.kisimlar.map(k => {
    const maddeler = fihrist.maddeler.filter(m => m.kisim === k.no);
    const ilk = maddeler[0].sahife[0], sonS = maddeler[maddeler.length - 1].sahife[1];
    const okunanSayi = maddeler.filter(m => okunan.has(anahtar(m))).length;
    const ray = h('.ss-ray', { role: 'presentation' }, maddeler.map(m => {
      const a = anahtar(m);
      const boy = Math.max(1, m.sahife[1] - m.sahife[0] + 1);
      const el = h('a.ss-dilim', {
        href: `/madde/${m.kisim}/${m.no}`, tabindex: '-1',
        class: [okunan.has(a) ? 'ss-okundu' : '', a === gunun ? 'ss-gunun' : '', a === son ? 'ss-son' : ''].filter(Boolean).join(' '),
        style: { flexGrow: String(boy) },
        'aria-label': `${k.ad}, madde ${m.no}: ${m.baslik}. Sahîfe ${sahife(m.sahife[0], m.sahife[1])}` + (okunan.has(a) ? '. Okundu' : '')
      });
      dilimler.push({ el, m });
      return el;
    }));
    return h('.ss-satir',
      h('.ss-kisim', h('b', k.romen), h('span', k.ad)),
      ray,
      h('.ss-kunye.kunye', `s. ${ilk}–${sonS}`, okunanSayi ? h('span', ` · ${okunanSayi}/${maddeler.length}`) : null));
  });

  const bilgi = h('.ss-bilgi', { 'aria-live': 'off' });
  const kok = h('.sahife-seridi', {
    tabindex: '0', role: 'group',
    'aria-label': 'Kitabın tamamı: maddeler sahîfe sırasıyla. Ok tuşlarıyla gezin, Enter ile açın.'
  }, satirlar, bilgi);

  function bilgiYaz(m, etiket = '') {
    bilgi.replaceChildren();
    if (!m) return;
    bilgi.append(
      h('span.ss-no', `${m.kisim}. kısım · ${m.no}. madde`),
      h('b', ad(m.baslik)),
      h('span.kunye', `sahîfe ${sahife(m.sahife[0], m.sahife[1])}` + (etiket ? ` · ${etiket}` : '')));
  }
  const etiketBul = m => (anahtar(m) === son ? 'kaldığınız yer' : anahtar(m) === gunun ? 'günün maddesi' : okunan.has(anahtar(m)) ? 'okundu' : '');

  function sec(i, odakla = false) {
    if (etkin >= 0) dilimler[etkin].el.classList.remove('etkin');
    etkin = i;
    if (i < 0) { varsayilan(); secilince(null); return; }
    const { el, m } = dilimler[i];
    el.classList.add('etkin');
    bilgiYaz(m, etiketBul(m));
    secilince(m);
    if (odakla) el.focus({ preventScroll: true });
  }
  function varsayilan() {
    const i = dilimler.findIndex(d => anahtar(d.m) === (son || gunun));
    if (i >= 0) bilgiYaz(dilimler[i].m, etiketBul(dilimler[i].m)); else bilgi.replaceChildren();
  }

  dilimler.forEach((d, i) => {
    d.el.addEventListener('pointerenter', () => sec(i));
    d.el.addEventListener('focus', () => sec(i));
  });
  kok.addEventListener('pointerleave', () => { if (!kok.contains(document.activeElement) || document.activeElement === kok) sec(-1); });
  kok.addEventListener('keydown', e => {
    const adim = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 12, ArrowUp: -12, Home: -9999, End: 9999 }[e.key];
    if (adim === undefined) return;
    e.preventDefault();
    const bas = etkin < 0 ? Math.max(0, dilimler.findIndex(d => anahtar(d.m) === (son || gunun))) : etkin;
    sec(Math.min(dilimler.length - 1, Math.max(0, bas + adim)), true);
  });
  kok.addEventListener('focusout', e => { if (!kok.contains(e.relatedTarget)) sec(-1); });

  varsayilan();
  return kok;
}
