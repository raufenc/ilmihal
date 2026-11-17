/* Bir hâl tercemesi (/sahis/:slug) — kitaptan bir sahîfe gibi.
   Metin aynen basılır; "… ismine bakınız!" yönlendirmesi ancak hedef kesin bulunursa bağlantı olur. */

import { h, doldur, durum, semse } from '../cekirdek/dom.js';
import { veri, maddeKimlik } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { ad, roma, sahife as sahifeYaz } from '../cekirdek/bicim.js';
import { duzle } from '../cekirdek/metin.js';
import { SINIFLAR, sonGecis } from './sahislar.js';

const SINIF_AD = Object.fromEntries(SINIFLAR.filter(([k]) => k));
const SON_SAHIFE = 1248;
const iptalMi = e => e && (e.name === 'AbortError' || e.tur === 'iptal');

/** Kelime dizisi a, b'nin içinde bitişik olarak geçiyor mu (düzlenmiş; tire de kelime ayırır). */
function icinde(b, a) {
  const x = b.split(/[ -]+/).filter(Boolean), y = a.split(/[ -]+/).filter(Boolean);
  if (!y.length || y.length > x.length) return false;
  for (let i = 0; i + y.length <= x.length; i++) if (y.every((k, j) => x[i + j] === k)) return true;
  return false;
}

/** "… [243] sırada Ebû Hasen-i Sübkî ismine bakınız!" → [{bas, son, kisi}]. Yalnız kesin eşleşmeler:
    - sıra numarası verilmişse: o numaradaki kişi ve adı bu kişinin adıyla örtüşüyor (biri ötekinin içinde, kelime kelime);
    - numara yoksa: ad, dizinde tek bir kişinin adıyla birebir aynı (şapka/büyük harf gözetmeden). */
function yonlendirmeler(metin, dizin, kendiSlug) {
  const sonuc = [];
  const isimle = new Map();
  const noyla = new Map();
  for (const s of dizin.sahislar) {
    const k = duzle(s.isim);
    if (!isimle.has(k)) isimle.set(k, []);
    isimle.get(k).push(s);
    if (s.no !== null && s.no !== undefined) noyla.set(s.no, s);
  }
  const re = /\s+ismine bak[ıi]n[ıi]z/g;
  let m;
  while ((m = re.exec(metin))) {
    const once = metin.slice(Math.max(0, m.index - 120), m.index);
    let adHam = null, kisi = null;
    const sm = /(\d+)\D{0,8}s[ıi]rada,?\s+([^\s.!?\[\]][^.!?\[\]]*)$/.exec(once);
    if (sm) {
      const k = noyla.get(+sm[1]);
      const a = duzle(sm[2]).trim(), b = k ? duzle(k.isim).trim() : '';
      if (k && a && (icinde(b, a) || icinde(a, b))) { adHam = sm[2]; kisi = k; }
    } else {
      const kelimeler = once.split(/(\s+)/);
      for (let n = 1; n <= 6 && 2 * n - 1 <= kelimeler.length; n++) {
        const aday = kelimeler.slice(-(2 * n - 1)).join('');
        const adaylar = isimle.get(duzle(aday).trim());
        if (adaylar) { adHam = aday; kisi = adaylar.length === 1 ? adaylar[0] : null; }
      }
    }
    if (!kisi || !adHam || kisi.slug === kendiSlug) continue;
    // Bağlantı yalnız adın kendisine: baştaki/sondaki ayraç ve noktalama dışarıda kalır
    const bosOn = adHam.length - adHam.replace(/^[\s,;:(\[]+/, '').length;
    const bosSon = adHam.length - adHam.replace(/[\s,;:)\]]+$/, '').length;
    const bas = m.index - adHam.length + bosOn, son = m.index - bosSon;
    if (son > bas) sonuc.push({ bas, son, kisi });
  }
  return sonuc;
}

function paragrafCiz(metin, baglar, ofset, ilk) {
  const parcalar = [];
  let son = 0;
  for (const b of baglar) {
    const bas = b.bas - ofset, bit = b.son - ofset;
    if (bas < 0 || bit > metin.length) continue;
    parcalar.push(metin.slice(son, bas), h('a', { href: `/sahis/${encodeURIComponent(b.kisi.slug)}` }, metin.slice(bas, bit)));
    son = bit;
  }
  parcalar.push(metin.slice(son));
  return h('p' + (ilk ? '.sk-ilk' : ''), parcalar.filter(x => x !== ''));
}

function bulunamadi(kap, baglam) {
  baglam.baslikYaz('Hâl tercemesi bulunamadı');
  baglam.metaYaz({ robots: 'noindex' });
  kap.append(h('.kap.kap-dar.sk-yok',
    h('p.ust-yazi.surh', 'Bulunamadı'),
    h('h1.baslik-2', 'Bu hâl tercemesi bulunamadı'),
    h('p.giris-yazi', 'Adres değişmiş ya da yanlış yazılmış olabilir. Hâl tercemeleri fihristinden ya da aramadan devam edebilirsiniz.'),
    h('.sira',
      h('a.dugme.dugme-ana', { href: '/sahislar' }, 'Hâl tercemeleri'),
      h('a.dugme', { href: '/arama' }, 'Kitapta arayın'))));
}

function hataDurumu(e, tekrar) {
  const yok = e && e.tur === 'cevrimdisi';
  return durum(yok ? 'Bağlantı yok' : 'Hâl tercemesi yüklenemedi',
    yok ? 'İnternete bağlandığınızda yeniden deneyin.' : 'Bir aksaklık oldu. Biraz sonra yeniden deneyin.',
    h('button.dugme.dugme-ana', { type: 'button', onclick: tekrar }, 'Yeniden deneyin'),
    h('a.dugme', { href: '/sahislar' }, 'Hâl tercemeleri'));
}

export default {
  ad: 'sahis',
  baslik: 'Hâl tercemesi',

  async kur(kap, p, baglam) {
    const sinyal = baglam.sinyal;
    const slug = String(p.slug || '');
    const [, kisiSonuc] = await Promise.all([
      cssYukle('/css/sahis.css'),
      veri.sahis(slug, { sinyal }).then(k => ({ k }), e => ({ e }))
    ]);
    if (kisiSonuc.e) {
      if (iptalMi(kisiSonuc.e)) return;
      kap.append(h('.kap.kap-dar', hataDurumu(kisiSonuc.e, () => { doldur(kap); this.kur(kap, p, baglam); })));
      return;
    }
    const k = kisiSonuc.k;
    if (!k) { bulunamadi(kap, baglam); return; }

    const isim = ad(k.isim);
    const sinifAd = SINIF_AD[k.kategori] || 'Hâl tercemesi';
    baglam.baslikYaz(k.isim);
    baglam.metaYaz({ kanonik: location.origin + '/sahis/' + encodeURIComponent(k.slug) });

    // Listeden gelindiyse "Hâl Tercemeleri" geri tuşu gibi davranır (süzgeç ve konum korunur)
    const gecis = sonGecis();
    const listeAdresi = gecis && gecis.liste ? gecis.liste : '/sahislar';
    const geriBag = h('a.sk-geri', { href: listeAdresi }, h('span', { 'aria-hidden': 'true' }, '←'), ' Hâl Tercemeleri');
    if (gecis && gecis.hedef === location.pathname) {
      geriBag.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        const g = sonGecis();
        if (g && g.hedef === location.pathname && history.length > 1) { e.preventDefault(); history.back(); }
      });
    }

    const paragraflar = String(k.biyografi || '').split('\n').filter(s => s.trim() !== '');
    const govde = h('.sk-metin');
    const ciz = (dizin) => {
      const baglar = dizin ? yonlendirmeler(k.biyografi || '', dizin, k.slug) : [];
      let ofset = 0;
      const bio = k.biyografi || '';
      const dugumler = [];
      let ara = 0;
      paragraflar.forEach((pr, i) => {
        const yer = bio.indexOf(pr, ara);
        ofset = yer >= 0 ? yer : ofset;
        ara = ofset + pr.length;
        dugumler.push(paragrafCiz(pr, baglar.filter(b => b.bas >= ofset && b.son <= ofset + pr.length), ofset, i === 0));
      });
      doldur(govde, dugumler);
    };
    ciz(null);

    const yerler = h('.sk-yerler');
    const komsular = h('nav.sk-komsu', { 'aria-label': `${sinifAd} içinde önceki ve sonraki` });

    kap.append(h('article.kap.kap-okuma.sk',
      h('p.sk-ust', geriBag),
      h('header.sk-bas',
        h('p.ust-yazi.surh', sinifAd),
        h('h1.sk-isim', isim),
        k.unvan ? h('p.sk-unvan', k.unvan) : null,
        k.no !== null && k.no !== undefined ? h('p.kunye.sk-sira', `Hâl tercemeleri, ${k.no}. sıra`) : null),
      h('.ayrac', { 'aria-hidden': 'true' }, semse()),
      govde,
      yerler,
      k.kaynak ? h('p.sk-kaynak.kunye', 'Kaynak: ', k.kaynak) : null,
      komsular));

    // Kitapta geçtiği yerler (maddeler ve sahîfeler)
    const maddeler = (k.maddeler || []).map(x => maddeKimlik.anahtar(x)).filter(Boolean);
    const sahifeler = [...new Set((k.sahifeler || []).map(s => Math.min(SON_SAHIFE, +s)).filter(s => s >= 1))];
    if (maddeler.length || sahifeler.length) {
      let fihrist = null;
      try {
        fihrist = await veri.fihrist({ sinyal });
      } catch (e) { if (iptalMi(e)) return; }
      const kunyeler = fihrist ? await Promise.all(maddeler.map(m => veri.maddeKunye(m, { sinyal }).catch(() => null))) : [];
      if (sinyal.aborted) return;
      const pdf = fihrist && fihrist.kitap && fihrist.kitap.pdf;
      doldur(yerler,
        h('h2.sk-yer-baslik', 'Kitapta geçtiği yerler'),
        maddeler.length ? h('section.sk-yer',
          h('h3.ust-yazi', maddeler.length === 1 ? 'Madde' : `${maddeler.length} madde`),
          h('ul.fihrist.sk-maddeler', maddeler.map((m, i) => {
            const kn = kunyeler[i];
            const c = maddeKimlik.coz(m);
            return h('li', h('a.fihrist-satir', { href: maddeKimlik.yol(m) },
              h('span.fihrist-no', `${roma(c.kisim)}·${c.no}`),
              h('span.fihrist-ad', h('span', kn ? ad(kn.baslik) : `${c.kisim}. kısım, ${c.no}. madde`)),
              h('span.fihrist-sayfa', kn && kn.sahife ? sahifeYaz(kn.sahife[0], kn.sahife[1]) : '')));
          }))) : null,
        sahifeler.length && pdf ? h('section.sk-yer',
          h('h3.ust-yazi', 'Kitabın aslında'),
          h('p.sk-sahifeler', sahifeler.map(s => h('a.sk-sahife', { href: `${pdf}#page=${s}`, target: '_blank', rel: 'noopener', title: `Kitabın aslında ${s}. sahîfeyi açın` }, String(s)))),
          h('p.kunye', 'Sahîfe numaraları kitabın basılı aslını (PDF) yeni sekmede açar.')) : null);
    }

    // Dizin: açıklama, "ismine bakınız" bağlantıları, aynı sınıftan önceki/sonraki
    veri.sahislarDizin({ sinyal }).then(dizin => {
      if (sinyal.aborted) return;
      const satir = dizin.sahislar.find(s => s.slug === k.slug);
      if (satir && satir.giris) baglam.metaYaz({ aciklama: satir.giris, kanonik: location.origin + '/sahis/' + encodeURIComponent(k.slug) });
      if (/ismine bak/.test(k.biyografi || '')) ciz(dizin);
      const ayni = dizin.sahislar.filter(s => s.kategori === k.kategori);
      const i = ayni.findIndex(s => s.slug === k.slug);
      if (i < 0) return;
      const satirCiz = (s, yon) => s ? h('a.sk-komsu-bag.' + yon, { href: `/sahis/${encodeURIComponent(s.slug)}` },
        h('span.ust-yazi', yon === 'onceki' ? 'Önceki' : 'Sonraki'),
        h('span.sk-komsu-ad', ad(s.isim)),
        s.unvan ? h('span.sk-komsu-unvan', s.unvan) : null) : h('span');
      doldur(komsular, satirCiz(ayni[i - 1], 'onceki'), satirCiz(ayni[i + 1], 'sonraki'));
    }, e => { if (!iptalMi(e)) console.warn('Hâl tercemeleri dizini yüklenemedi:', e && e.message); });
  }
};
