/* Fevâid (/fevaid, /icerik): kitabın içinden derlenen dizinlerin fihristi.
   Kart ızgarası yok: her dizin büyük bir fihrist satırıdır (ad, tek cümle açıklama, noktalı kılavuz, sayı).
   Sayılar veriden gelir; satırlar hemen çizilir, sayılar indikçe yerine oturur. */

import { h } from '../cekirdek/dom.js';
import { veri } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { sayi } from '../cekirdek/bicim.js';
import { kullanici } from '../cekirdek/kullanici.js';

/* say(sinyal) → { sayi, birim } | null. Hatada sayı boş kalır (satır yine çalışır). */
const yavas = { oncelik: 'low' };
const GRUPLAR = [
  {
    ad: 'Dizinler',
    satirlar: [
      { ad: 'Fıkhî hükümler', yol: '/hukumler', aciklama: 'Kitapta geçen farz, vâcib, sünnet, müstehab, mübah, mekruh ve haram hükümler; her cümle kitaptaki yerine bağlı.',
        say: async s => { const d = await veri.hukumlerDizin({ sinyal: s }); return { sayi: d.turler.reduce((t, k) => t + ((d.sayilar[k] || {}).acik || 0), 0), birim: 'açık hüküm' }; } },
      { ad: 'Âyet-i kerîme ve hadîs-i şerîfler', yol: '/ayet-hadis', aciklama: 'Kitapta geçen âyet-i kerîme meâlleri ve hadîs-i şerîfler, kitaptaki yerleriyle.',
        say: async s => { const f = await veri.fihrist({ sinyal: s }); return { sayi: f.sayilar.ayet + f.sayilar.hadis, birim: 'kayıt' }; } },   // sayılar fihrist.json'da; ağır dizini indirmeye gerek yok
      { ad: 'Dinî lügat', yol: '/sozluk', aciklama: 'Kitapta geçen kelimelerin Osmanlıca yazılışları, asılları ve mânâları.',
        say: async s => { const d = await veri.lugatDizin({ sinyal: s }); return { sayi: d.sayi, birim: 'terim' }; } },
      { ad: 'Hâl tercemeleri', yol: '/sahislar', aciklama: 'Kitapta adı geçenlerin, kitabın sonundaki hâl tercemeleri.',
        say: async s => { const f = await veri.fihrist({ sinyal: s }); return { sayi: f.sayilar.sahis, birim: 'kişi' }; } },
      { ad: 'Tablolar', yol: '/fevaid/tablolar', aciklama: 'Kitaptaki bilgilerin özet tabloları ve akış şemaları; her biri kaynağı olan maddeye bağlı.',
        // Eski sitedeki gibi: konu haritası ve kitabın tanımları tablo listesinde sayılmaz
        say: async s => { const d = await veri.tablolar({ sinyal: s }); return { sayi: d.tablolar.filter(t => t.tip !== 'tanimlar' && t.id !== 'konu_haritasi').length, birim: 'tablo' }; } },
      { ad: 'Konu rehberleri', yol: '/rehberler', aciklama: 'Adım adım okuma yolları; bir konuyu baştan sona takip edin.',
        say: async s => { const d = await veri.rehberler({ sinyal: s }); return { sayi: d.rehberler.length, birim: 'rehber' }; } }
    ]
  },
  {
    ad: 'Okurken',
    satirlar: [
      { ad: 'Günün suâli', yol: '/gunun-bilgisi', aciklama: 'Her gün kitaptan bir suâl; cevâbı ilgili maddededir.',
        say: async s => { const d = await veri.gununSualleri({ sinyal: s, ...yavas }); return { sayi: d.sualler.length, birim: 'suâl' }; } },
      { ad: 'Bilgi testi', yol: '/quiz', aciklama: 'Kitaptan sorularla öğrendiklerinizi yoklayın.',
        say: async s => { const d = await veri.testSorulari({ sinyal: s }); return { sayi: d.konular.length, birim: 'konu' }; } },
      { ad: 'Çalışma alanım', yol: '/calisma-alanim', aciklama: 'Yer imleriniz, notlarınız, vurgularınız ve okuma planınız; yalnız bu tarayıcıda tutulur.',
        say: async () => { const o = kullanici.ozet(); const n = o.yerImi + o.not + o.vurgu; return n ? { sayi: n, birim: 'kaydınız' } : { yazi: 'Kişisel' }; } }
    ]
  },
  {
    ad: 'Yer ve gök',
    satirlar: [
      { ad: 'Silsile-i Aliyye Atlası', yol: '/silsile-atlasi/', aciklama: 'Silsile-i aliyye büyüklerinin kabr-i şerîfleri harita üzerinde.' },
      { ad: 'Nemâz vakitleri', yol: '/namaz-vakitleri/', aciklama: 'Kitaptaki usûle göre nemâz vakitlerinin hesabı ve gösterimi.' }
    ]
  }
];

export default {
  ad: 'fevaid',
  baslik: 'Fevâid',

  async kur(kap, p, baglam) {
    await cssYukle('/css/sayfa.css');
    const sinyal = baglam.sinyal;
    baglam.metaYaz({
      aciklama: 'Se’âdet-i Ebediyye’nin içinden derlenen dizinler: fıkhî hükümler, âyet-i kerîme ve hadîs-i şerîfler, dinî lügat, hâl tercemeleri, tablolar ve konu rehberleri.',
      kanonik: location.origin + '/fevaid'
    });

    let sira = 0;
    const doldurulacak = [];
    const gruplar = GRUPLAR.map((g, gi) => h('section.dizin-grup', { 'aria-labelledby': `dizin-grup-${gi}` },
      h('h2.ust-yazi', { id: `dizin-grup-${gi}` }, g.ad),
      h('ol.dizinler', { start: sira + 1 }, g.satirlar.map(st => {
        sira++;
        const sayiYer = h('span.dizin-sayi');
        const birimYer = h('span.dizin-birim', '\u200b');
        if (st.say) doldurulacak.push({ st, sayiYer, birimYer });
        const dis = st.yol.endsWith('/');                          // atlas ve vakitler ayrı belgedir
        return h('li', h('a.dizin-satir', { href: st.yol },
          h('span.dizin-no', String(sira)),
          h('span.dizin-ad', h('span', st.ad)),
          h('span.dizin-sag', sayiYer, birimYer),
          h('span.dizin-aciklama', st.aciklama),
          dis ? h('span.gizli-yazi', ' (ayrı sayfada açılır)') : null));
      }))));

    kap.append(h('.kap.kap-dar.fevaid',
      h('header.fevaid-bas',
        h('.fevaid-bas-yazi',
          h('p.ust-yazi', 'Kitabın içinden'),
          h('h1.baslik-1', 'Fevâid'),
          h('p.giris-yazi', 'Kitabın içinden derlenen dizinler. Her kayıt sizi kitaptaki yerine götürür.')),
        h('figure.fevaid-gorsel', h('img', {
          src: '/gorsel/kitap-kapak.webp', width: 484, height: 581, alt: 'Tam İlmihâl Se’âdet-i Ebediyye kitabının kapağı', decoding: 'async',
          onerror: e => { const f = e.target.closest('figure'); if (f) f.hidden = true; }
        }))),
      gruplar));

    // Sayılar: küçük parçalar önce; her biri kendi başına yerine oturur.
    for (const { st, sayiYer, birimYer } of doldurulacak) {
      st.say(sinyal).then(sonuc => {
        if (sinyal.aborted || !sonuc) return;
        if (sonuc.yazi) { birimYer.textContent = sonuc.yazi; return; }
        sayiYer.textContent = sayi(sonuc.sayi);
        birimYer.textContent = sonuc.birim;
      }).catch(e => { if (e.name !== 'AbortError') console.warn(`Fevâid sayısı alınamadı (${st.ad}):`, e.message || e); });
    }
  }
};
