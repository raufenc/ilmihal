/* Okuyucu — fihrist çekmecesi: soldan açılır, o kısmın maddeleri fihrist satırı olarak; etkin madde işaretli.
   Kısımlar arasında geçilebilir. Listeden bir maddeye geçince çekmece kapanır. */

import { h, simge } from '../../cekirdek/dom.js';
import { veri } from '../../cekirdek/veri.js';
import { kullanici } from '../../cekirdek/kullanici.js';
import { ad, roma } from '../../cekirdek/bicim.js';
import { pencereAc } from './ayarlar.js';
import { YOL } from './simgeler.js';

export async function cekmeceAc(S, dugme) {
  let fihrist = S.fihrist;
  if (!fihrist) {
    try { fihrist = S.fihrist = await veri.fihrist(); }
    catch (e) { const { bildir } = await import('../../bilesen/bildirim.js'); bildir('Fihrist yüklenemedi. Bağlantınızı denetleyin.'); return; }
  }
  const etkin = S.madde;
  let kisim = etkin ? etkin.kisim : 1;
  const liste = h('ol.fihrist.cekmece-liste');
  const sekme = h('.secim.cekmece-kisim', { role: 'group', 'aria-label': 'Kısım' });
  const aciklama = h('p.cekmece-aciklama');
  const okunanlar = new Set(kullanici.okunan.liste());
  const bitenler = new Set(kullanici.bitirilen.liste());

  const ciz = () => {
    const k = fihrist.kisimlar.find(x => x.no === kisim);
    aciklama.textContent = k ? k.aciklama : '';
    for (const b of sekme.children) b.setAttribute('aria-pressed', String(+b.dataset.k === kisim));
    liste.replaceChildren(...fihrist.maddeler.filter(m => m.kisim === kisim).map(m => {
      const key = `${m.kisim}/${m.no}`;
      const simdiki = etkin && etkin.kisim === m.kisim && etkin.no === m.no;
      const durum = bitenler.has(key) ? 'bitirildi' : okunanlar.has(key) ? 'okundu' : '';
      return h('li', h('a.fihrist-satir', { href: `/madde/${m.kisim}/${m.no}`, 'aria-current': simdiki ? 'page' : null, dataset: { durum } },
        h('span.fihrist-no', String(m.no)),
        h('span.fihrist-ad', h('span', ad(m.baslik)), durum ? h('span.gizli-yazi', durum === 'bitirildi' ? ' (bitirildi)' : ' (okundu)') : null),
        h('span.fihrist-sayfa', String(m.sahife[0]))));
    }));
  };
  for (const k of fihrist.kisimlar) sekme.append(h('button', { type: 'button', dataset: { k: String(k.no) }, title: k.ad, onclick: () => { kisim = k.no; ciz(); liste.scrollTop = 0; } }, roma(k.no) + '. Kısım'));
  ciz();

  const d = h('dialog.oku-pencere.oku-cekmece', { 'aria-labelledby': 'cekmece-baslik' },
    h('.oku-pencere-bas',
      h('h2#cekmece-baslik', 'Fihrist'),
      h('button.oku-dg', { type: 'button', 'aria-label': 'Fihristi kapatın', onclick: () => d.close() }, simge(YOL.kapat))),
    h('.cekmece-ust', sekme, aciklama),
    h('.cekmece-kaydir', liste),
    h('.cekmece-alt', h('a.ok-bag', { href: '/icindekiler' }, 'Bütün fihrist'), h('span.kunye', 'Okunanlar ince bir işaret taşır')));
  // Listeden geçince kapan (yönlendirici bağlantıyı yakalar)
  d.addEventListener('click', e => { if (e.target.closest && e.target.closest('a[href]')) { S.dgOdak = dugme; d.close(); } });
  pencereAc(d, dugme, { konumla: false });
  const simdiki = liste.querySelector('[aria-current="page"]');
  if (simdiki) {
    simdiki.scrollIntoView({ block: 'center' });
    simdiki.focus({ preventScroll: true });
  }
}
