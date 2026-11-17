/* Konu Rehberleri (/rehberler, /rehberler?rehber=<id>): bir konuyu kitabın sırasıyla adım adım okuma yolları.
   İlerleme eski anahtarla: ilmihal-rehber-progress {"<rehberId>": ["1/52", …]} (kullanici.rehber). */

import { h, doldur, durum } from '../cekirdek/dom.js';
import { cssYukle } from '../cekirdek/css.js';
import { yenile } from '../cekirdek/yonlendirici.js';
import { veri } from '../cekirdek/veri.js';
import { kullanici } from '../cekirdek/kullanici.js';
import { ad, roma } from '../cekirdek/bicim.js';
import { kacinda } from '../bilesen/okuma-plani-kutu.js';

let etkin = null;   // { kap, baglam, R, kunye, id }

const SIRA = ['Birinci', 'İkinci', 'Üçüncü', 'Dördüncü', 'Beşinci', 'Altıncı', 'Yedinci', 'Sekizinci', 'Dokuzuncu', 'Onuncu'];
const anahtar = m => kullanici.maddeAnahtari(m);
const noYaz = key => { const m = kullanici.maddeCoz(key); return m ? roma(m.kisim) + ' · ' + m.no : key; };

function adimlar(r) {
  return [...new Set(r.bolumler.flatMap(b => b.maddeler.map(m => anahtar(m.madde))))].filter(Boolean);
}

export default {
  ad: 'rehberler',
  baslik: 'Konu Rehberleri',
  async kur(kap, p, baglam) {
    let R, f;
    try {
      [, R, f] = await Promise.all([cssYukle('/css/rehberler.css'), veri.rehberler({ sinyal: baglam.sinyal }), veri.fihrist({ sinyal: baglam.sinyal })]);
    } catch (e) {
      if (e.name === 'AbortError') return;
      kap.append(h('.kap.kap-dar', durum('Rehberler yüklenemedi',
        e.tur === 'cevrimdisi' ? 'Bağlantı yok. Rehberler bu cihaza henüz inmemiş; bağlanınca yeniden deneyin.' : 'Bir aksaklık oldu; yeniden deneyin.',
        h('button.dugme.dugme-ana', { type: 'button', onclick: () => yenile() }, 'Yeniden deneyin'))));
      return;
    }
    etkin = { kap, baglam, R: R.rehberler, kunye: new Map(f.maddeler.map(m => [m.kisim + '/' + m.no, m])), id: baglam.sorgu.get('rehber') };
    const birak = kullanici.izle('rehber', () => { if (etkin) ciz(true); });
    baglam.temizle(() => { birak(); etkin = null; });
    ciz();
  },
  async guncelle(p, baglam) {
    if (!etkin) return;
    etkin.baglam = baglam;
    etkin.id = baglam.sorgu.get('rehber');
    ciz();
  }
};

function ciz(yerinde = false) {
  const { kap, baglam, id } = etkin;
  const odak = yerinde && kap.contains(document.activeElement) ? document.activeElement.dataset.odak : null;
  if (id) {
    const r = etkin.R.find(x => x.id === id);
    if (!r) {
      baglam.baslikYaz('Rehber bulunamadı');
      baglam.metaYaz({ robots: 'noindex' });
      doldur(kap, h('.kap.kap-dar.rh', durum('Rehber bulunamadı', 'Adres değişmiş ya da yanlış yazılmış olabilir.',
        h('a.dugme.dugme-ana', { href: '/rehberler' }, 'Bütün rehberler'))));
      return;
    }
    baglam.baslikYaz(r.baslik);
    baglam.metaYaz({ aciklama: r.aciklama, kanonik: location.origin + '/rehberler?rehber=' + encodeURIComponent(r.id) });
    doldur(kap, detay(r));
  } else {
    baglam.baslikYaz('Konu Rehberleri');
    baglam.metaYaz({ aciklama: 'Se’âdet-i Ebediyye’de bir konuyu kitabın sırasıyla adım adım okuma yolları: nemâz, oruç, zekât, hac, îmân, ahlâk, aile.' });
    doldur(kap, liste());
  }
  if (odak) { const el = kap.querySelector(`[data-odak="${CSS.escape(odak)}"]`); if (el) el.focus({ preventScroll: true }); }
}

/* ── Liste ── */
function liste() {
  const ilerleme = kullanici.rehber.hepsi();
  return h('.kap.kap-dar.rh',
    h('header.rh-ust',
      h('p.ust-yazi', 'Kitaptan Derlenenler'),
      h('h1.baslik-2', 'Konu Rehberleri'),
      h('p.giris-yazi', 'Bir konuyu kitabın sırasıyla, adım adım okumak için hazırlanmış yollar. Okuduğunuz maddeleri işaretlerseniz kaldığınız yer burada durur.')),
    h('ol.rh-liste', etkin.R.map((r, i) => {
      const tum = adimlar(r);
      const tamam = (ilerleme[r.id] || []).filter(k => tum.includes(k)).length;
      return h('li', h('a.rh-satir', { href: '/rehberler?rehber=' + encodeURIComponent(r.id) },
        h('span.fihrist-no', String(i + 1)),
        h('span.rh-satir-govde',
          h('span.fihrist-ad', h('span.rh-ad', ad(r.baslik))),
          h('span.rh-aciklama', r.aciklama),
          tamam ? h('span.rh-ilerleme', `${kacinda(tum.length, tamam)} okundu`) : null),
        h('span.fihrist-sayfa', `${tum.length} madde`)));
    })));
}

/* ── Rehberin içi ── */
function detay(r) {
  const tum = adimlar(r);
  const biten = new Set(kullanici.rehber.adimlar(r.id));
  const tamam = tum.filter(k => biten.has(k)).length;
  const siradaki = tum.find(k => !biten.has(k));
  let no = 0;
  const gorulen = new Set();

  return h('.kap.kap-dar.rh.rh-detay',
    h('a.rh-geri', { href: '/rehberler' }, '← Konu rehberleri'),
    h('header.rh-ust',
      h('p.ust-yazi', 'Konu rehberi'),
      h('h1.baslik-2', ad(r.baslik)),
      h('p.giris-yazi', r.aciklama),
      h('p.kunye.rh-kunye', `${r.bolumler.length} bölüm · ${tum.length} madde` + (tamam ? ` · ${iyelikOkundu(tum.length, tamam)}` : '')),
      tamam === tum.length
        ? h('p.rh-tamam', 'Bu rehberdeki bütün maddeleri okudunuz. Allahü teâlâ ilminizi artırsın.')
        : h('.sira.rh-eylem', h('a.dugme.dugme-ana', { href: '/madde/' + siradaki, dataset: { odak: 'devam' } },
            tamam ? 'Sıradaki maddeden devam edin' : 'İlk maddeden başlayın'),
            h('span.kunye', 'Sıradaki: ' + noYaz(siradaki) + ' · ' + (etkin.kunye.get(siradaki) ? ad(etkin.kunye.get(siradaki).baslik) : '')))),
    r.bolumler.map((b, bi) => {
      const keys = b.maddeler.map(m => anahtar(m.madde)).filter(Boolean);
      const bitti = keys.length && keys.every(k => biten.has(k));
      return h('section.rh-bolum', { 'aria-labelledby': `rh-b-${bi}` },
        h('header.rh-bolum-bas',
          h('p.ust-yazi.surh', (SIRA[bi] || (bi + 1) + '.') + ' bölüm'),
          h('h2.baslik-4', { id: `rh-b-${bi}` }, ad(b.baslik)),
          bitti ? h('p.kunye', 'Okundu') : null),
        h('ol.rh-adimlar', b.maddeler.map(m => {
          const key = anahtar(m.madde);
          if (!key) return null;
          const k = etkin.kunye.get(key);
          const baslik = k ? k.baslik : (m.not || key);
          const okundu = biten.has(key);
          const tekrar = gorulen.has(key); gorulen.add(key);
          return h('li' + (okundu ? '.okundu' : ''),
            h('span.fihrist-no', String(++no)),
            h('a.rh-adim-ad', { href: '/madde/' + key },
              h('span', ad(baslik)),
              h('span.rh-adim-no', noYaz(key) + (k ? ' · s. ' + k.sahife[0] : '') + (tekrar ? ' · yukarıda da geçti' : ''))),
            h('button.rh-isaret', {
              type: 'button', 'aria-pressed': String(okundu), dataset: { odak: `isaret-${bi}-${key}` },
              'aria-label': `Okundu: ${baslik}`,
              title: okundu ? 'Okundu; işareti kaldırmak için basın' : 'Okundu olarak işaretleyin',
              onclick: () => kullanici.rehber.degistir(r.id, key)
            }, h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
              h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'm8 12.4 2.7 2.7L16.2 9.4' }))));
        })));
    }),
    h('nav.rh-son', { 'aria-label': 'Rehberler' }, h('a.ok-bag', { href: '/rehberler' }, 'Bütün rehberler')));
}

const iyelikOkundu = (t, n) => `${kacinda(t, n).replace(/^\d+ maddenin /, '')} okundu`;
