/* Kısa bildirim (ekranın altında, kendiliğinden kaybolur). bildir('Yer imi eklendi') */
import { h } from '../cekirdek/dom.js';

let kap = null;
export function bildir(metin, { sure = 3200, eylem = null } = {}) {
  if (!kap) { kap = h('.bildirimler', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(kap); }
  const el = h('.bildirim', metin, eylem ? h('button.bag', { type: 'button', style: { marginLeft: '1em', color: 'inherit' }, onclick: () => { eylem.yap(); el.remove(); } }, eylem.ad) : null);
  kap.appendChild(el);
  setTimeout(() => el.remove(), sure);
  return el;
}
