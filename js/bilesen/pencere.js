/* Pencere: yerel <dialog> üstünde ince sarmalayıcı.
   const p = pencere({ baslik: 'Notlar', icerik: dugum, sinif: 'genis' }); p.kapat();
   - Esc ve arka plana tıklama kapatır; odak, açan öğeye geri döner (tarayıcı <dialog> ile kendisi yapar).
   - Geçmişe kayıt EKLEMEZ (eski sitedeki geri tuşu tuzağı buradan çıkıyordu). */
import { h } from '../cekirdek/dom.js';

export function pencere({ baslik, icerik, sinif = '', kapaninca = null, etiket = null } = {}) {
  const govde = h('.pencere-govde', icerik);
  const d = h('dialog.pencere' + (sinif ? '.' + sinif : ''), { 'aria-label': etiket || baslik || 'Pencere' },
    baslik ? h('.pencere-bas', h('h2', baslik),
      h('button.dugme-simge', { type: 'button', 'aria-label': 'Kapatın', onclick: () => d.close() },
        h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', style: { width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' } }, h('path', { d: 'M6 6l12 12M18 6 6 18' })))) : null,
    govde);
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.addEventListener('close', () => { d.remove(); if (kapaninca) kapaninca(); });
  document.body.appendChild(d);
  d.showModal();
  return { dugum: d, govde, kapat: () => { if (d.open) d.close(); } };
}

/** Evet/hayır sorusu. Söz döner: true/false. */
export function sor(soru, { evet = 'Evet', hayir = 'Vazgeçin', baslik = '' } = {}) {
  return new Promise(coz => {
    let cevap = false;
    const p = pencere({
      baslik: baslik || soru, etiket: soru,
      icerik: [baslik ? h('p', soru) : null, h('.sira', { style: { marginTop: 'var(--a-5)', justifyContent: 'flex-end' } },
        h('button.dugme', { type: 'button', onclick: () => p.kapat() }, hayir),
        h('button.dugme.dugme-ana', { type: 'button', onclick: () => { cevap = true; p.kapat(); } }, evet))],
      kapaninca: () => coz(cevap)
    });
  });
}
