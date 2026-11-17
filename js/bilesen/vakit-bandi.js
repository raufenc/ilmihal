/* Vakit bandı: ana sayfanın en üstünde, o anın göğü.
   Güneşin gün boyu irtifâ' eğrisi (gün yayı), ufuk çizgisi, altı ana vaktin yeri ve şu anki güneş.
   Hesap js/cekirdek/vakit.js'ten (kitabın 60. maddesindeki usûl, temkinli); yalnız gösterim burada.
   Yer: şimdilik İstanbul (Nemâz Vakitleri sayfasında yer seçilmişse o: 'ilmihal-vakit-yer'). */

import { h } from '../cekirdek/dom.js';
import { depo } from '../cekirdek/depo.js';
import { vakitler, gunYayi, gunesKonumuDakika, ESKI_SEHIRLER } from '../cekirdek/vakit.js';
import { sure, tarih as tarihYaz } from '../cekirdek/bicim.js';

const ANA = [['imsak', 'İmsâk'], ['gunes', 'Güneş'], ['ogle', 'Öğle'], ['asrEvvel', 'İkindi'], ['aksam', 'Akşam'], ['yatsiEvvel', 'Yatsı']];

/* Göğün rengi: güneşin irtifâ'ına göre üç duraklı düşey geçiş (üst, orta, ufuk). */
const GOK = [
  [-90, ['#05070d', '#080b16', '#0b1020']],
  [-19, ['#070a14', '#0c1122', '#131a30']],
  [-12, ['#0b1226', '#1b2140', '#3a3350']],
  [-6, ['#1c2a4c', '#5b4a66', '#b47a62']],
  [-1, ['#3d5683', '#b98a78', '#eab98a']],
  [4, ['#5f82ad', '#c9b89c', '#f0d9b4']],
  [12, ['#7ea1c4', '#c5d3d6', '#ece4d2']],
  [90, ['#86a9cb', '#cbdbe0', '#efe9da']]
];
const onaltili = r => [1, 3, 5].map(i => parseInt(r.slice(i, i + 2), 16));
const karistir = (a, b, t) => { const x = onaltili(a), y = onaltili(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`; };
function gokRengi(irtifa) {
  let i = GOK.findIndex(d => irtifa <= d[0]);
  if (i <= 0) i = 1;
  const [a0, r0] = GOK[i - 1], [a1, r1] = GOK[i];
  const t = Math.min(1, Math.max(0, (irtifa - a0) / (a1 - a0)));
  return r0.map((r, k) => karistir(r, r1[k], t));
}

function yerOku() {
  const k = depo.al('ilmihal-vakit-yer', null);
  if (k && Number.isFinite(+k.enlem) && Number.isFinite(+k.boylam) && Number.isFinite(+k.saatDilimi)) {
    return { ad: String(k.ad || 'Seçtiğiniz yer'), enlem: +k.enlem, boylam: +k.boylam, saatDilimi: +k.saatDilimi };
  }
  const i = ESKI_SEHIRLER[0];
  return { ad: i.name, enlem: i.lat, boylam: i.lon, saatDilimi: i.tz };
}

/* Yerin saat dilimine göre "şimdi": takvim günü ve gün içi dakika. */
function simdi(saatDilimi, an = new Date()) {
  const k = new Date(an.getTime() + saatDilimi * 3600000);
  return { gun: { yil: k.getUTCFullYear(), ay: k.getUTCMonth() + 1, gun: k.getUTCDate() }, dakika: k.getUTCHours() * 60 + k.getUTCMinutes() + k.getUTCSeconds() / 60, takvim: new Date(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()) };
}
const ertesi = g => { const d = new Date(Date.UTC(g.yil, g.ay - 1, g.gun + 1)); return { yil: d.getUTCFullYear(), ay: d.getUTCMonth() + 1, gun: d.getUTCDate() }; };

export function vakitBandi(baglam) {
  const kok = h('a.vakit-bandi', { href: '/namaz-vakitleri/', 'aria-label': 'Nemâz vakitleri: bugünün vakitleri ve güneşin gün yayı. Ayrıntısı için açın.' });
  const G = 1000, Y = 150, UFUK = 104;           // çizim alanı; ufuk çizgisinin y'si
  const olcek = irt => UFUK - irt * 1.12;         // 1° ≈ 1,12 birim

  function ciz() {
    const yer = yerOku();
    const s = simdi(yer.saatDilimi);
    let v;
    try { v = vakitler({ tarih: s.gun, enlem: yer.enlem, boylam: yer.boylam, saatDilimi: yer.saatDilimi }); }
    catch (e) { console.warn('Vakit bandı hesaplanamadı:', e); kok.hidden = true; return; }
    const konum = gunesKonumuDakika(s.gun, s.dakika, yer.enlem, yer.boylam, yer.saatDilimi);
    const [ust, orta, alt] = gokRengi(konum.irtifa);
    const gunduz = konum.irtifa > 5;
    kok.style.background = `linear-gradient(180deg, ${ust} 0%, ${orta} 62%, ${alt} 100%)`;
    kok.classList.toggle('gunduz', gunduz);

    // Sıradaki ana vakit
    const liste = ANA.map(([k, ad]) => ({ k, ad, dk: v.vakitler[k].temkinli, saat: v.vakitler[k].saat })).filter(x => !Number.isNaN(x.dk));
    let sira = liste.find(x => x.dk > s.dakika), kalan;
    if (sira) kalan = sira.dk - s.dakika;
    else {
      try {
        const y = vakitler({ tarih: ertesi(s.gun), enlem: yer.enlem, boylam: yer.boylam, saatDilimi: yer.saatDilimi }).vakitler.imsak;
        if (!Number.isNaN(y.temkinli)) { sira = { k: 'imsak', ad: 'İmsâk', saat: y.saat }; kalan = 1440 - s.dakika + y.temkinli; }
      } catch (e) { /* yoksay */ }
    }

    // Gün yayı eğrisi
    const yay = gunYayi({ tarih: s.gun, enlem: yer.enlem, boylam: yer.boylam, saatDilimi: yer.saatDilimi, adimDk: 12 });
    const nokta = p => `${(p.dakika / 1440 * G).toFixed(1)},${olcek(p.irtifa).toFixed(1)}`;
    const egri = 'M' + yay.map(nokta).join(' L');
    const gx = s.dakika / 1440 * G, gy = olcek(konum.irtifa);
    const kimlik = 'vb-' + Math.random().toString(36).slice(2, 7);

    const svg = h('svg.vb-cizim', { viewBox: `0 0 ${G} ${Y}`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' },
      h('defs',
        h('clipPath', { id: kimlik + 'u' }, h('rect', { x: 0, y: 0, width: G, height: UFUK })),
        h('clipPath', { id: kimlik + 'a' }, h('rect', { x: 0, y: UFUK, width: G, height: Y - UFUK })),
        h('clipPath', { id: kimlik + 'b' }, h('rect', { x: 0, y: 0, width: 1, height: 1 }))),
      h('path.vb-yay-alt', { d: egri, 'clip-path': `url(#${kimlik}a)` }),
      h('path.vb-yay', { d: egri, 'clip-path': `url(#${kimlik}u)` }),
      h('line.vb-ufuk', { x1: 0, x2: G, y1: UFUK, y2: UFUK }),
      liste.map(x => h('line.vb-centik', { x1: x.dk / 1440 * G, x2: x.dk / 1440 * G, y1: UFUK - 5, y2: UFUK + 5 }))
    );

    // Güneş HTML öğesidir: çizim alanı yatayda esnediği için SVG dairesi dar ekranda yassılaşırdı
    const gunes = h('i.vb-gunes', { 'aria-hidden': 'true', style: { left: (gx / G * 100).toFixed(2) + '%', top: (gy / Y * 100).toFixed(2) + '%' } });
    kok.replaceChildren(
      svg, gunes,
      h('.vb-ic.kap',
        h('.vb-ust',
          h('span.vb-yer', `${yer.ad} · ${tarihYaz(s.takvim)}`),
          h('span.vb-git', 'Vakitleri gökte görün')),
        sira ? h('.vb-orta',
          h('span.vb-sira-ad', sira.ad),
          h('span.vb-sira-saat', sira.saat),
          h('span.vb-kalan', `${sure(kalan)} sonra`)) : null),
      h('ol.vb-vakitler', liste.map(x => h('li', { class: sira && x.k === sira.k && kalan < 1440 && x.dk > s.dakika ? 'siradaki' : '', style: { left: (x.dk / 1440 * 100).toFixed(2) + '%' } },
        h('span', x.ad), h('b', x.saat)))));
    kok.hidden = false;
  }

  ciz();
  const zaman = setInterval(ciz, 30000);
  const gorunur = () => { if (!document.hidden) ciz(); };
  document.addEventListener('visibilitychange', gorunur);
  baglam.temizle(() => { clearInterval(zaman); document.removeEventListener('visibilitychange', gorunur); });
  return kok;
}
