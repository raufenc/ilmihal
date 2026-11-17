/* Giriş (ana sayfa). Kitabı anlatmaz, gösterir:
   göğün şu anki hâli (vakit bandı) → serlevha → kitabın tamamı (sahîfe şeridi) → günün maddesi
   → fihristten → fevâid dizini → yer ve gök. */

import { h, ekle, semse } from '../cekirdek/dom.js';
import { veri } from '../cekirdek/veri.js';
import { kullanici } from '../cekirdek/kullanici.js';
import { gununMaddesi } from '../cekirdek/okuma-plani.js';
import { cssYukle } from '../cekirdek/css.js';
import { ad, sayi, sahife, tarih, okumaDakikasi, sure } from '../cekirdek/bicim.js';
import { sahifeSeridi } from '../bilesen/sahife-seridi.js';
import { vakitBandi } from '../bilesen/vakit-bandi.js';

const tireli = m => `${m.kisim}-${m.no}`;
const yol = m => `/madde/${m.kisim}/${m.no}`;
const ok = () => h('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true' }, h('path', { d: 'M4 10h11M11 5.5 15.5 10 11 14.5' }));

function resim(adi, sinif, { oncelik = false } = {}) {
  return h('img', {
    class: sinif, alt: '', width: 1536, height: 1024, decoding: 'async',
    loading: oncelik ? 'eager' : 'lazy', fetchpriority: oncelik ? 'high' : null,
    src: `/gorsel/${adi}.webp`, srcset: `/gorsel/${adi}-k.webp 768w, /gorsel/${adi}.webp 1536w`, sizes: '(max-width: 900px) 100vw, 50vw'
  });
}

export default {
  ad: 'giris',
  baslik: () => '',

  async kur(kap, p, baglam) {
    const [, fihrist] = await Promise.all([cssYukle('/css/giris.css'), veri.fihrist({ sinyal: baglam.sinyal })]);
    const { maddeler, kisimlar, sayilar, kitap } = fihrist;
    baglam.metaYaz({ aciklama: `Tam İlmihâl Se’âdet-i Ebediyye kitabının tamamı: ${sayilar.madde} madde, ${kitap.sahifeSayisi} sahîfe; lügati, hâl tercemeleri, fıkhî hükümleri ve sesli okunuşuyla.`, kanonik: location.origin + '/' });

    const okunan = new Set(kullanici.okunan.liste().map(a => a.replace('/', '-')));
    const sonKayit = kullanici.sonOkunan.al();
    const son = sonKayit ? maddeler.find(x => x.kisim === +sonKayit.kisim && x.no === +sonKayit.madde_no) || null : null;
    const bugun = new Date();
    const gunun = gununMaddesi(maddeler, bugun);

    /* 1 — Vakit bandı */
    let band = null;
    try { band = vakitBandi(baglam); } catch (e) { console.warn('Vakit bandı kurulamadı:', e); }

    /* 2 — Serlevha */
    const serlevha = h('section.serlevha',
      h('.kap.serlevha-ic',
        h('.serlevha-yazi',
          h('p.ust-yazi.surh', 'Tam İlmihâl'),
          h('h1.serlevha-baslik', 'Se’âdet-i', h('br'), h('em', 'Ebediyye')),
          h('p.giris-yazi', `Hüseyn Hilmi Işık hazretlerinin hazırladığı ${kitap.sahifeSayisi} sahîfelik ilmihâl. Kitabın tamamını okuyun, sesli dinleyin; her kelimesini lügatiyle, her hükmünü kaynağıyla araştırın.`),
          h('button.giris-ara', { type: 'button', 'aria-haspopup': 'dialog', onclick: () => document.getElementById('dg-ara')?.click() },
            h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, h('circle', { cx: 11, cy: 11, r: 6.5 }), h('path', { d: 'm20 20-4.2-4.2' })),
            h('span', 'Kitapta, lügatte ve hâl tercemelerinde arayın'), h('kbd', '/')),
          h('.sira.serlevha-dugme',
            son
              ? h('a.dugme.dugme-ana', { href: yol(son) }, 'Kaldığınız yerden devam edin', ok())
              : h('a.dugme.dugme-ana', { href: yol(maddeler[0]) }, 'Okumaya başlayın', ok()),
            h('a.dugme', { href: '/icindekiler' }, 'Fihrist')),
          son ? h('p.kunye.serlevha-son', `${son.kisim}. kısım, ${son.no}. madde · `, h('span', ad(son.baslik))) : null),
        // Kitabın kendi kapağı (Hakîkat Kitâbevi'nin yayınladığı görsel); üretilmiş bir kitap resmi kullanılmaz
        h('.serlevha-resim',
          h('figure.serlevha-kitap',
            h('img', { src: '/gorsel/kitap-kapak.webp', width: 484, height: 581, alt: 'Tam İlmihâl Se’âdet-i Ebediyye kitabının kapağı', decoding: 'async', fetchpriority: 'high' }),
            h('figcaption.kunye', 'Hakîkat Kitâbevi · 2026 baskısı')))));

    /* 3 — Kitabın tamamı: sahîfe şeridi */
    const okunanSayi = maddeler.filter(m => okunan.has(tireli(m))).length;
    const serit = h('section.bolum.kap', { 'aria-labelledby': 'b-serit' },
      h('.bolum-bas',
        h('div', h('p.ust-yazi', 'Kitabın tamamı'), h('h2.baslik-3', { id: 'b-serit' }, 'Üç kısım, ', h('span.sayi', sayi(sayilar.madde)), ' madde')),
        h('p.kunye', `${kitap.sahifeSayisi} sahîfe` + (okunanSayi ? ` · ${sayi(okunanSayi)} maddeyi açtınız` : ' · her dilim bir madde; genişliği sahîfe sayısı kadar'))),
      sahifeSeridi({ fihrist, okunan, gunun: gunun ? tireli(gunun) : null, son: son ? tireli(son) : null }),
      h('p.serit-lejant.kunye', h('i.lj.lj-okundu'), 'açtığınız', h('i.lj.lj-gunun'), 'günün maddesi', h('i.lj.lj-son'), 'kaldığınız yer'));

    /* 4 — Günün maddesi */
    let gununBlok = null;
    if (gunun) {
      const ozet = h('p.gunun-ozet', { 'aria-busy': 'true' });
      gununBlok = h('section.bolum.kap.kap-dar', { 'aria-labelledby': 'b-gunun' },
        h('.cetvel.gunun',
          h('p.ust-yazi.surh', 'Günün maddesi', h('span.gunun-tarih', ` · ${tarih(bugun)}`)),
          h('h2.baslik-3', { id: 'b-gunun' }, h('a', { href: yol(gunun) }, ad(gunun.baslik))),
          h('p.kunye', `${gunun.kisim}. kısım, ${gunun.no}. madde · sahîfe ${sahife(gunun.sahife[0], gunun.sahife[1])} · ${sure(okumaDakikasi(gunun.uzunluk))} okuma`),
          ozet,
          h('a.ok-bag', { href: yol(gunun) }, 'Maddeyi okuyun')));
      // Özet küçük bir ek istektir; sayfayı bekletmez
      veri.madde(tireli(gunun), { sinyal: baglam.sinyal }).then(m => {
        ozet.removeAttribute('aria-busy');
        if (m && m.ozet) ozet.textContent = m.ozet; else ozet.remove();
      }).catch(() => ozet.remove());
    }

    /* 5 — Okuma planı (parça başka dosyada; yoksa ya da hata verirse bölüm çizilmez) */
    const planYeri = h('section.bolum.kap.kap-dar', { hidden: true, 'aria-label': 'Okuma planı' });
    import('../bilesen/okuma-plani-kutu.js').then(m => {
      if (baglam.sinyal.aborted) return;
      const dugum = m.okumaPlaniKutu(baglam, { kisa: true, birincil: false });
      if (dugum) { planYeri.append(dugum); planYeri.hidden = false; }
    }).catch(e => console.warn('Okuma planı parçası yüklenemedi:', e));

    /* 6 — Fihristten */
    const fihristBolum = h('section.bolum.kap', { 'aria-labelledby': 'b-fihrist' },
      h('.bolum-bas',
        h('div', h('p.ust-yazi', 'Fihrist'), h('h2.baslik-3', { id: 'b-fihrist' }, 'Kitabın üç kısmı')),
        h('a.ok-bag', { href: '/icindekiler' }, 'Fihristin tamamı')),
      h('.kisimlar', kisimlar.map(k => {
        const km = maddeler.filter(m => m.kisim === k.no);
        return h('article.kisim',
          h('.kisim-bas',
            h('.rozet', semse({}, false), h('span', k.romen)),
            h('div', h('h3', h('a', { href: `/icindekiler#kisim-${k.no}` }, k.ad)), h('p.kunye', `${sayi(k.maddeSayisi)} madde · sahîfe ${km[0].sahife[0]}–${km[km.length - 1].sahife[1]}`))),
          h('p.kisim-aciklama', k.aciklama),
          h('ol.fihrist.kisim-liste', km.slice(0, 5).map(m => h('li', { style: { display: 'block', padding: 0 } },
            h('a.fihrist-satir', { href: yol(m), style: { borderBottom: 0 } },
              h('span.fihrist-no', m.no), h('span.fihrist-ad', h('span', ad(m.baslik))), h('span.fihrist-sayfa', m.sahife[0]))))),
          h('a.ok-bag', { href: `/icindekiler#kisim-${k.no}` }, `${sayi(k.maddeSayisi)} maddenin tamamı`));
      })));

    /* 7 — Fevâid: kitaptan derlenen dizinler (sayılar veriden) */
    const dizinler = [
      ['Fıkhî hükümler', 'Farz, vâcib, sünnet, mekrûh, harâm; her hüküm kitaptaki cümlesiyle', sayilar.hukumAcik, '/hukumler'],
      ['Âyet-i kerîme ve hadîs-i şerîfler', 'Kitapta geçen meâller ve hadîs-i şerîfler, bulundukları yerle', sayilar.ayet + sayilar.hadis, '/ayet-hadis'],
      ['Dinî lügat', 'Kitaptaki kelimelerin Osmanlıca yazılışları ve mânâları', sayilar.lugat, '/sozluk'],
      ['Hâl tercemeleri', 'Kitapta adı geçen büyüklerin ve şahısların hayatları', sayilar.sahis, '/sahislar'],
      ['Tablolar', 'Nemâz rek’atleri, nisâb mikdârları, mezheb farkları ve daha fazlası', sayilar.tablo, '/fevaid/tablolar'],
      ['Konu rehberleri', 'Bir konuyu kitabın sırasıyla adım adım okuma yolları', sayilar.rehber, '/rehberler'],
      ['Günün suâli', 'Her gün kitaptan bir suâl; cevabı ilgili maddede', sayilar.sual, '/gunun-bilgisi'],
      ['Bilgi testi', 'Okuduklarınızı kitaptan alınmış suâllerle tekrar edin', null, '/quiz']
    ];
    const fevaid = h('section.bolum.kap', { 'aria-labelledby': 'b-fevaid' },
      h('.bolum-bas',
        h('div', h('p.ust-yazi', 'Dizinler ve cedveller'), h('h2.baslik-3', { id: 'b-fevaid' }, 'Kitaptan Derlenenler')),
        h('p.kunye', 'Kitabın kendisi değil, kitaptan derlenmiş dizinlerdir; her kayıt sizi kitaptaki yerine götürür.')),
      h('ol.fihrist.dizinler', dizinler.map(([adi, aciklama, n, href]) => h('li', { style: { display: 'block', padding: 0 } },
        h('a.fihrist-satir.dizin', { href },
          h('span.fihrist-ad', h('span', adi)),
          h('span.fihrist-sayfa', n === null ? '' : sayi(n)),
          h('span.fihrist-alt', aciklama))))));

    /* 8 — Yer ve gök */
    const kapilar = h('section.bolum.kap', { 'aria-labelledby': 'b-yer' },
      h('.bolum-bas', h('div', h('p.ust-yazi', 'Yer ve gök'), h('h2.baslik-3', { id: 'b-yer' }, 'Kitabın dışına açılan iki pencere'))),
      h('.kapilar',
        h('a.kapi', { href: '/silsile-atlasi/' },
          resim('yer-atlas', 'kapi-resim'),
          h('.kapi-yazi', h('p.ust-yazi', 'Yer'), h('h3', 'Silsile-i Aliyye Atlası'),
            h('p', 'Silsile-i aliyye büyüklerinin kabr-i şerîfleri, üç boyutlu gece yeryüzünde; kitaptaki hâl tercemeleriyle.'),
            h('span.ok-bag', 'Atlası açın'))),
        h('a.kapi', { href: '/namaz-vakitleri/' },
          resim('gok-vakit', 'kapi-resim'),
          h('.kapi-yazi', h('p.ust-yazi', 'Gök'), h('h3', 'Nemâz Vakitleri'),
            h('p', 'Güneşin gün yayı, milin gölgesi ve vakitlerin nasıl bulunduğu; kitabın altmışıncı maddesindeki usûlle.'),
            h('span.ok-bag', 'Göğü açın')))));

    ekle(kap, [band, serlevha, serit, gununBlok, planYeri, fihristBolum, fevaid, kapilar]);

    // Kullanıcı başka sekmede okursa şerit güncel kalsın
    baglam.temizle(kullanici.izle('okunan', () => { /* bir sonraki açılışta yansır; şeridi yeniden kurmak gerekmez */ }));
  }
};
