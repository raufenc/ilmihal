/* Günün Suâli (/gunun-bilgisi): her gün kitaptan bir suâl; cevabı ilgili maddede.
   Seçim veri.gununSuali(tarih): yerel gece yarısında değişir, eski siteyle aynı gün aynı suâl.
   Eski sayfadaki "Paylaş" ve "Görsel Kart Oluştur" korunur; son 7 gün yerine son 14 gün ve bütün suâller listesi eklendi. */

import { h, doldur, durum } from '../cekirdek/dom.js';
import { cssYukle } from '../cekirdek/css.js';
import { yenile } from '../cekirdek/yonlendirici.js';
import { veri, maddeKimlik } from '../cekirdek/veri.js';
import { ad, roma, tarih as tarihYaz } from '../cekirdek/bicim.js';
import { bildir } from '../bilesen/bildirim.js';

const ONCEKI_GUN = 14;
const noYaz = m => { const c = maddeKimlik.coz(m); return c ? roma(c.kisim) + ' · ' + c.no : ''; };

export default {
  ad: 'gunun',
  baslik: 'Günün Suâli',
  async kur(kap, p, baglam) {
    baglam.metaYaz({ aciklama: 'Her gün Se’âdet-i Ebediyye’den bir suâl; cevabı kitabın ilgili maddesinde.' });
    let d, f;
    try {
      [, d, f] = await Promise.all([cssYukle('/css/gunun.css'), veri.gununSualleri({ sinyal: baglam.sinyal }), veri.fihrist({ sinyal: baglam.sinyal })]);
    } catch (e) {
      if (e.name === 'AbortError') return;
      kap.append(h('.kap.kap-dar', durum('Günün suâli yüklenemedi',
        e.tur === 'cevrimdisi' ? 'Bağlantı yok. Suâller bu cihaza henüz inmemiş; bağlanınca yeniden deneyin.' : 'Bir aksaklık oldu; yeniden deneyin.',
        h('button.dugme.dugme-ana', { type: 'button', onclick: () => yenile() }, 'Yeniden deneyin'))));
      return;
    }
    const kunye = new Map(f.maddeler.map(m => [m.kisim + '-' + m.no, m]));
    const bugun = new Date();
    const suali = await veri.gununSuali(bugun, { sinyal: baglam.sinyal });
    if (!suali) { kap.append(h('.kap.kap-dar', durum('Suâl bulunamadı', 'Bugün için bir suâl seçilemedi.'))); return; }

    const onceki = await Promise.all(Array.from({ length: ONCEKI_GUN }, async (_, i) => {
      const t = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() - i - 1);
      return { t, s: await veri.gununSuali(t, { sinyal: baglam.sinyal }) };
    }));

    const maddeBag = (s, sinif = '') => {
      const yol = maddeKimlik.yol(s.madde);
      const k = kunye.get(maddeKimlik.anahtar(s.madde));
      return yol ? h('a' + sinif, { href: yol }, h('span.gs-no', noYaz(s.madde)), ' ', h('span.gs-ad', ad(k ? k.baslik : s.baslik))) : null;
    };

    const boy = suali.soru.length > 380 ? 'uzun' : suali.soru.length > 180 ? 'orta' : 'kisa';
    const tumListe = h('ol.gs-tum');
    const tum = h('details.gs-acilir', {
      ontoggle: e => { if (e.currentTarget.open && !tumListe.childElementCount) tumuCiz(); }
    }, h('summary', `Bütün suâller (${d.sualler.length})`), tumListe);
    function tumuCiz() {
      doldur(tumListe, d.sualler.map((s, i) => h('li' + (i === suali.sira ? '.bugun' : ''),
        h('span.fihrist-no', String(i + 1)),
        h('.gs-satir-govde',
          h('p.gs-satir-soru', s.soru),
          maddeBag(s, '.gs-satir-madde'),
          i === suali.sira ? h('span.kunye', 'bugünün suâli') : null))));
    }

    kap.append(h('.kap.kap-dar.gs',
      h('header.gs-ust',
        h('p.ust-yazi', 'Günün suâli'),
        h('p.kunye.gs-tarih', h('time', { datetime: bugun.toISOString().slice(0, 10) }, tarihYaz(bugun)))),
      h('article.cetvel.gs-suali', { 'aria-labelledby': 'gs-soru' },
        h('p.ust-yazi.surh', 'Suâl'),
        h('h1.gs-soru#gs-soru', { dataset: { boy } }, suali.soru),
        h('.gs-cevap',
          h('p.gs-cevap-bas', 'Cevabını kitapta okuyun'),
          maddeBag(suali, '.gs-cevap-bag'))),
      h('.sira.gs-arac',
        h('button.dugme.dugme-kucuk', { type: 'button', onclick: () => paylas(suali) }, 'Paylaşın'),
        h('button.dugme.dugme-kucuk', { type: 'button', onclick: () => kart(suali, kunye) }, 'Görsel olarak indirin')),
      h('section.gs-onceki', { 'aria-labelledby': 'gs-onceki-bas' },
        h('h2.baslik-4#gs-onceki-bas', 'Önceki günler'),
        h('ol.gs-liste', onceki.filter(x => x.s).map(({ t, s }) => h('li',
          h('a.gs-satir', { href: maddeKimlik.yol(s.madde) || '/gunun-bilgisi' },
            h('time.gs-satir-tarih', { datetime: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}` },
              tarihYaz(t, { gun: false }).replace(/ \d{4}$/, '')),
            h('span.gs-satir-govde',
              h('span.gs-satir-soru', s.soru),
              h('span.gs-satir-madde', noYaz(s.madde) + ' · ' + ad((kunye.get(maddeKimlik.anahtar(s.madde)) || s).baslik)))))))),
      tum));
  }
};

function paylas(s) {
  const metin = `Suâl: ${s.soru}\n\n— Se’âdet-i Ebediyye, ${s.baslik}\nhttps://www.ilmihal.org/gunun-bilgisi`;
  if (navigator.share) {
    navigator.share({ title: 'Günün Suâli · ilmihal.org', text: metin }).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(metin).then(() => bildir('Panoya kopyalandı.'), () => bildir('Panoya kopyalanamadı.'));
  } else bildir('Bu tarayıcı paylaşmayı desteklemiyor.');
}

/* 1080×1080 görsel kart (eski "Görsel Kart Oluştur"): kâğıt zemin, çift altın cetvel, Literata */
async function kart(s, kunye) {
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.all([document.fonts.load('400 40px Literata'), document.fonts.load('600 26px Inter')]).catch(() => {});
    }
    const c = document.createElement('canvas');
    c.width = 1080; c.height = 1080;
    const x = c.getContext('2d');
    x.fillStyle = '#f4efe4'; x.fillRect(0, 0, 1080, 1080);
    x.strokeStyle = 'rgba(166,124,46,0.75)'; x.lineWidth = 2; x.strokeRect(56, 56, 968, 968);
    x.strokeStyle = 'rgba(27,25,21,0.18)'; x.lineWidth = 1.5; x.strokeRect(66, 66, 948, 948);
    x.fillStyle = '#8a2c20'; x.font = '600 24px Inter, sans-serif';
    if ('letterSpacing' in x) x.letterSpacing = '6px';
    x.fillText('SUÂL', 130, 180);
    if ('letterSpacing' in x) x.letterSpacing = '0px';
    // Metni sığdır: boyu küçülterek
    let boy = 46, satirlar = [];
    for (; boy >= 26; boy -= 2) {
      x.font = `400 ${boy}px Literata, Georgia, serif`;
      satirlar = sar(x, s.soru, 820);
      if (satirlar.length * boy * 1.5 <= 640) break;
    }
    x.fillStyle = '#1b1915';
    satirlar.forEach((l, i) => x.fillText(l, 130, 260 + i * boy * 1.5));
    const k = kunye.get(maddeKimlik.anahtar(s.madde));
    x.fillStyle = '#4b463c'; x.font = '400 24px Inter, sans-serif';
    const alt = sar(x, 'Cevabı: ' + ((k && k.baslik) || s.baslik), 820).slice(0, 2);
    alt.forEach((l, i) => x.fillText(l, 130, 900 + i * 34));
    x.fillStyle = '#7a5a1a'; x.font = '600 22px Inter, sans-serif';
    x.fillText('Se’âdet-i Ebediyye · ilmihal.org/gunun-bilgisi', 130, 980);
    const blob = await new Promise(coz => c.toBlob(coz, 'image/png'));
    if (!blob) throw new Error('kart');
    const adres = URL.createObjectURL(blob);
    const a = h('a', { href: adres, download: 'gunun-suali.png', hidden: true });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(adres), 5000);
  } catch (e) {
    bildir('Görsel hazırlanamadı.');
  }
}

function sar(x, metin, en) {
  const satir = [];
  let s = '';
  for (const k of String(metin).split(/\s+/)) {
    const d = s ? s + ' ' + k : k;
    if (x.measureText(d).width > en && s) { satir.push(s); s = k; } else s = d;
  }
  if (s) satir.push(s);
  return satir;
}
