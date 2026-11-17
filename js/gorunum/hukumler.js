/* Fıkhî Hükümler: /hukumler (tür fihristi), /hukumler?madde=1-60 (bir maddenin hükümleri, türlere göre)
   ve /hukumler/:tur (?katman=tum&ara=…&alt=…&kisim=…&madde=…).
   Her hüküm kitaptaki cümlesiyle aynen basılır; künyesi sahîfeye (kitabın aslı) ve maddeye götürür.
   "Açık" ve "tamamı" katmanları ayrı parçalardır, birleştirilmez. */
import { HUKUMLER_ACIK } from '../cekirdek/ayar.js';
import { h, doldur, durum, iskelet } from '../cekirdek/dom.js';
import { veri, maddeKimlik } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { sayi, ad, sahife, kisimAdi } from '../cekirdek/bicim.js';
import { duzle, duzleEslemeli, asilAralik, araliklariBirlestir } from '../cekirdek/metin.js';

const TURLER = {
  farz: { ad: 'Farz', kucuk: 'farz' },
  vacib: { ad: 'Vâcib', kucuk: 'vâcib' },
  sunnet: { ad: 'Sünnet', kucuk: 'sünnet' },
  mustehab: { ad: 'Müstehab', kucuk: 'müstehab' },
  mubah: { ad: 'Mubâh', kucuk: 'mubâh' },
  mekruh: { ad: 'Mekrûh', kucuk: 'mekrûh' },
  haram: { ad: 'Harâm', kucuk: 'harâm' }
};
const PARTI = 60;
const UZUN = 900;          // bu kadar harften uzun hüküm satırla sınırlanır, "Tamamını okuyun" ile açılır
const ACIKLAMA = 'Kitapta geçen fıkhî hükümlerin türlerine göre listesi. Her hüküm kitaptaki cümlesiyle verilir; künyesinden maddesine ve kitabın aslındaki sahîfesine gidebilirsiniz.';

let d = null;              // etkin görünümün durumu

/* ── Ortak parçalar ── */
function isaretli(metin, kelimeler) {
  if (!kelimeler.length) return metin;
  const { duz, konum } = duzleEslemeli(metin);
  const ar = [];
  for (const k of kelimeler) {
    for (let i = duz.indexOf(k); i >= 0; i = duz.indexOf(k, i + k.length)) ar.push(asilAralik(metin, konum, i, i + k.length));
  }
  const parcalar = [];
  let son = 0;
  for (const [b, s] of araliklariBirlestir(ar)) {
    if (b > son) parcalar.push(metin.slice(son, b));
    parcalar.push(h('mark', metin.slice(b, s)));
    son = s;
  }
  parcalar.push(metin.slice(son));
  return parcalar;
}

function sahifeBag(pdf, bas, bit) {
  if (!bas) return null;
  const son = bit && bit <= 1248 ? bit : null;
  return h('a.kaynak', { href: `${pdf}#page=${Math.min(bas, 1248)}`, target: '_blank', rel: 'noopener', title: 'Kitabın aslında bu sahîfeyi açın (yeni sekme)' },
    'sahîfe ', h('span.sayi', sahife(bas, son)));
}

/** Tek hüküm satırı. sec: { kel (vurgu kelimeleri), pdf, T (tür) } */
function kayitCiz(x, no, { kel = [], pdf, T }) {
  const uzun = x.metin.length > UZUN && !kel.length;
  const metin = h('p.hk-metin', { class: uzun ? 'kisa' : null }, isaretli(x.metin, kel));
  const ac = uzun ? h('button.bag.hk-ac', { type: 'button', 'aria-expanded': 'false', onclick: () => {
    const acik = metin.classList.toggle('kisa');
    ac.setAttribute('aria-expanded', String(!acik));
    ac.textContent = acik ? 'Tamamını okuyun' : 'Kısaltın';
  } }, 'Tamamını okuyun') : null;
  let baglamEl = null;
  if (x.baglam) {
    const uzunB = x.baglam.length > 170;
    const p = h('p.hk-baglam', { class: uzunB ? 'kisa' : null }, h('span.hk-baglam-ad', 'Bağlam '), x.baglam);
    baglamEl = uzunB ? [p, h('button.bag.hk-ac.hk-ac-baglam', { type: 'button', 'aria-expanded': 'false', onclick: e => {
      const kapali = p.classList.toggle('kisa');
      e.currentTarget.setAttribute('aria-expanded', String(!kapali));
      e.currentTarget.textContent = kapali ? 'Bağlamın tamamı' : 'Bağlamı kısaltın';
    } }, 'Bağlamın tamamı')] : p;
  }
  return h('li.hk-kayit',
    h('span.hk-no.sayi', { 'aria-hidden': 'true' }, sayi(no)),
    h('.hk-govde',
      metin, ac, baglamEl,
      h('.hk-kunye',
        h('span.gizli-yazi', `${T.ad}.`),
        x.altTur ? h('span.etiket.hk-alt', x.altTur) : null,
        sahifeBag(pdf, x.sahife, x.sahifeBitis))));
}

const kitapSirasi = liste => liste.map((x, i) => ({ x, i, duz: null, kisim: x.madde ? +x.madde.split('-')[0] : 0 }))
  .sort((a, b) => (a.x.sahife || 0) - (b.x.sahife || 0) || a.i - b.i);

function bulunamadi(kap, baglam, tur) {
  baglam.metaYaz({ robots: 'noindex' });
  baglam.baslikYaz('Hüküm türü bulunamadı');
  doldur(kap, h('.kap.kap-dar.hk-yok',
    h('p.ust-yazi.surh', 'Bulunamadı'),
    h('h1.baslik-2', 'Böyle bir hüküm türü yok'),
    h('p.giris-yazi', `“${tur}” adında bir hüküm türü bulunmuyor. Kitaptaki hükümler yedi türe ayrılmıştır; aşağıdaki fihristten seçebilirsiniz.`),
    h('.sira', h('a.dugme.dugme-ana', { href: '/hukumler' }, 'Hüküm türleri'), h('a.dugme', { href: '/fevaid' }, 'Kitaptan Derlenenler'))));
}

function hataGoster(kap, hata, yeniden) {
  const cevrimdisi = hata && hata.tur === 'cevrimdisi';
  doldur(kap, h('.kap', durum(cevrimdisi ? 'Bağlantı yok' : 'Hükümler yüklenemedi',
    cevrimdisi ? 'İnternet bağlantınız kesik görünüyor. Bağlandığınızda yeniden deneyin.' : 'Veri zamanında gelmedi. Yeniden deneyebilirsiniz.',
    h('button.dugme.dugme-ana', { type: 'button', onclick: yeniden }, 'Yeniden deneyin'))));
}

function basKur(altBaslik) {
  return h('header.hk-bas',
    h('a.ust-yazi.surh.hk-ust', { href: '/fevaid' }, 'Kitaptan Derlenenler'),
    h('h1.baslik-2', 'Fıkhî Hükümler'),
    h('p.giris-yazi', ACIKLAMA),
    altBaslik || null);
}

/* ── Tür fihristi (/hukumler) ── */
function fihristCiz(kap, dizin, baglam) {
  baglam.baslikYaz('Fıkhî Hükümler');
  baglam.metaYaz({ aciklama: ACIKLAMA });
  const toplamAcik = dizin.turler.reduce((t, k) => t + dizin.sayilar[k].acik, 0);
  doldur(kap, h('.kap.hk',
    basKur(h('p.kunye.hk-toplam', `${sayi(dizin.sayi)} kayıt · ${sayi(toplamAcik)} açık hüküm · yedi tür`)),
    h('nav.hk-turfih', { 'aria-label': 'Hüküm türleri' },
      h('ol', dizin.turler.map((t, i) => {
        const s = dizin.sayilar[t];
        return h('li', h('a.hk-tursatir', { href: `/hukumler/${t}` },
          h('span.hk-turno', String(i + 1)),
          h('span.hk-turad', h('span', (TURLER[t] || { ad: t }).ad)),
          h('span.hk-tursayi', h('b.sayi', sayi(s.acik)), h('small', 'açık hüküm')),
          h('span.hk-turalt', s.tum ? `Tamamı: kitapta geçtiği ${sayi(s.tum)} yer` : 'Yalnız açık hükümler')));
      }))),
    h('p.hk-not', 'Bir cümle birden çok türde bulunabilir; meselâ hem farzı hem harâmı bildiren bir cümle iki türün listesinde de yer alır.')));
}

/* ── Tür sayfası (/hukumler/:tur) ── */
function sorguOku() {
  const q = new URLSearchParams(location.search);   // baglam.sorgu yerineYaz'dan sonra eskir
  return {
    katman: q.get('katman') === 'tum' ? 'tum' : 'acik',
    ara: q.get('ara') || '',
    alt: q.get('alt') || '',
    kisim: ['1', '2', '3'].includes(q.get('kisim')) ? +q.get('kisim') : 0,
    madde: q.get('madde') ? maddeKimlik.anahtar(q.get('madde')) || '' : ''   // geçersiz kimlik: süzgeç yok sayılır
  };
}

function adresYap(tur, s, { altsiz = false } = {}) {
  const q = new URLSearchParams();
  if (s.katman === 'tum') q.set('katman', 'tum');
  if (s.ara) q.set('ara', s.ara);
  if (s.alt && !altsiz) q.set('alt', s.alt);
  if (s.kisim) q.set('kisim', String(s.kisim));
  if (s.madde) q.set('madde', s.madde);
  const qs = q.toString();
  return `/hukumler${tur ? '/' + tur : ''}${qs ? '?' + qs : ''}`;
}

async function turCiz(kap, tur, baglam) {
  const s = sorguOku();
  const sec = { sinyal: baglam.sinyal };
  const [dizin, fihrist, parca] = await Promise.all([veri.hukumlerDizin(sec), veri.fihrist(sec), veri.hukumler(tur, s.katman, sec)]);
  const kunyeler = new Map(fihrist.maddeler.map(m => [`${m.kisim}-${m.no}`, m]));
  const T = TURLER[tur];
  baglam.baslikYaz(`${T.ad} · Fıkhî Hükümler`);
  baglam.metaYaz({ aciklama: `Se’âdet-i Ebediyye’de ${T.kucuk} hükmü bildiren cümleler, kitaptaki yerleriyle.`, kanonik: location.origin + `/hukumler/${tur}` });

  // Kitap sırası: sahîfeye göre (aynı sahîfede kaynaktaki sıra korunur); madde süzgeci baştan uygulanır
  const kayitlar = kitapSirasi(s.madde ? parca.hukumler.filter(x => x.madde === s.madde) : parca.hukumler);
  const mk = s.madde ? kunyeler.get(s.madde) : null;
  if (s.alt && !kayitlar.some(k => k.x.altTur === s.alt)) s.alt = '';
  const durumu = { tur, s, kayitlar, suzulmus: kayitlar, cizilen: 0, kelimeler: [], pdf: fihrist.kitap.pdf, kunyeler };
  d.tur = durumu;

  /* Tür çubuğu */
  const turCubugu = h('nav.hk-turler', { 'aria-label': 'Hüküm türü' },
    h('.secim', dizin.turler.map(t => h('a', {
      href: adresYap(t, s, { altsiz: true }),
      'aria-current': t === tur ? 'true' : null,
      onclick: e => { if (e.button || e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); if (t !== tur) baglam.git(adresYap(t, durumu.s, { altsiz: true }), { yerine: true }); }
    }, TURLER[t].ad, s.madde ? null : [' ', h('span.hk-secsayi.sayi', sayi(dizin.sayilar[t][s.katman]))]))));

  /* Katman anahtarı */
  const katmanDugme = (k, etiket, n) => h('button', {
    type: 'button', 'aria-pressed': String(s.katman === k),
    onclick: () => { if (durumu.s.katman === k) return; durumu.s.katman = k; durumu.s.alt = ''; baglam.yerineYaz(adresYap(tur, durumu.s)); yenidenCiz(); }
  }, etiket, n === null ? null : [' ', h('span.hk-secsayi.sayi', sayi(n))]);
  const katman = h('.hk-katman',
    h('.secim', { role: 'group', 'aria-label': 'Katman' },
      katmanDugme('acik', 'Açık hükümler', s.madde ? null : dizin.sayilar[tur].acik),
      katmanDugme('tum', 'Tamamı', s.madde ? null : dizin.sayilar[tur].tum)),
    h('p.kunye', `Açık hükümler, bir şeyin ${T.kucuk} olduğunu açıkça bildiren cümlelerdir. Tamamı, ${T.kucuk} hükmünün kitapta geçtiği bütün yerleri ayrı bir liste olarak verir.`));

  /* Süzgeçler */
  const altSayim = new Map();
  for (const k of kayitlar) if (k.x.altTur) altSayim.set(k.x.altTur, (altSayim.get(k.x.altTur) || 0) + 1);
  const kisimSayim = [0, 0, 0, 0];
  for (const k of kayitlar) kisimSayim[k.kisim]++;

  const araAlan = h('input.alan.hk-ara', { type: 'search', value: s.ara, placeholder: 'Hükümlerde arayın…', 'aria-label': 'Hükümlerde arayın', autocomplete: 'off', spellcheck: 'false' });
  const altSec = altSayim.size > 1 ? h('select.alan.hk-altsec', { 'aria-label': 'Alt türe göre süzün' },
    h('option', { value: '' }, 'Bütün alt türler'),
    [...altSayim].sort((a, b) => b[1] - a[1]).map(([v, n]) => h('option', { value: v, selected: v === s.alt ? true : null }, `${v} (${sayi(n)})`))) : null;
  const kisimSec = !kayitlar.length ? h('span') : h('.secim.hk-kisim', { role: 'group', 'aria-label': 'Kısma göre süzün' },
    [0, 1, 2, 3].filter(n => n === 0 || kisimSayim[n]).map(n => h('button', {
      type: 'button', 'aria-pressed': String(s.kisim === n), dataset: { kisim: n },
      onclick: () => { durumu.s.kisim = n; for (const b of kisimSec.children) b.setAttribute('aria-pressed', String(+b.dataset.kisim === n)); suz(); }
    }, n ? kisimAdi(n) : 'Bütün kısımlar')));

  const maddeEtiket = s.madde ? h('.hk-madde-suzgec',
    h('span.kunye', 'Madde süzgeci'),
    h('button.hk-madde-etiket', { type: 'button', 'aria-label': `Madde süzgecini kaldırın: ${s.madde.replace('-', '/')}`, onclick: () => {
      durumu.s.madde = ''; baglam.yerineYaz(adresYap(tur, durumu.s)); yenidenCiz();
    } }, h('b.sayi', s.madde.replace('-', '/')), mk ? [' · ', h('span', ad(mk.baslik))] : null, h('span.hk-kaldir', { 'aria-hidden': 'true' }, '×')),
    h('a.kaynak', { href: maddeKimlik.yol(s.madde) }, 'Maddeye dönün')) : null;
  const suzgecKutu = h('.hk-suzgec', h('.hk-ara-kap', araAlan), altSec, s.madde ? null : kisimSec);
  const sayac = h('p.hk-sayac.kunye', { 'aria-live': 'polite' });
  const liste = h('ol.hk-liste');
  const gozcu = h('.hk-gozcu', { 'aria-hidden': 'true' });
  const sonuc = h('.hk-sonuc', sayac, liste, gozcu);

  const yenidenCiz = () => ciz(kap, { tur }, baglam);

  let zaman = null;
  araAlan.addEventListener('input', () => { clearTimeout(zaman); zaman = setTimeout(() => { durumu.s.ara = araAlan.value.trim(); suz(); }, 90); });
  araAlan.addEventListener('keydown', e => { if (e.key === 'Escape' && araAlan.value) { e.stopPropagation(); araAlan.value = ''; durumu.s.ara = ''; suz(); } });
  if (altSec) altSec.addEventListener('change', () => { durumu.s.alt = altSec.value; suz(); });

  function suz() {
    const st = durumu.s;
    baglam.yerineYaz(adresYap(tur, st));
    const kelimeler = duzle(st.ara).split(' ').filter(Boolean);
    durumu.kelimeler = kelimeler;
    durumu.suzulmus = kayitlar.filter(k => {
      if (st.kisim && k.kisim !== st.kisim) return false;
      if (st.alt && k.x.altTur !== st.alt) return false;
      if (kelimeler.length) {
        if (k.duz === null) k.duz = duzle(k.x.metin);
        for (const w of kelimeler) if (!k.duz.includes(w)) return false;
      }
      return true;
    });
    const n = durumu.suzulmus.length, top = kayitlar.length;
    const temel = (st.madde ? `${st.madde.replace('-', '/')} maddesinde ` : '') + (st.katman === 'acik' ? `${sayi(top)} açık ${T.kucuk} hükmü` : `${T.kucuk} hükmünün geçtiği ${sayi(top)} yer`);
    const suzgecli = kelimeler.length || st.alt || st.kisim;
    sayac.textContent = suzgecli ? `${sayi(n)} sonuç · ${temel}` : temel;
    liste.replaceChildren();
    durumu.cizilen = 0;
    if (!top) {
      suzgecKutu.hidden = true;
      sonuc.replaceChildren(h('.hk-bos.hk-bos-tam',
        h('p', st.madde ? `Bu maddede ${st.katman === 'acik' ? 'açık ' : ''}${T.kucuk} hükmü bulunmuyor.` : st.katman === 'tum' ? `${T.ad} için ayrıca “tamamı” listesi hazırlanmamıştır.` : 'Bu türde kayıt yok.'),
        st.madde ? h('.sira', h('a.dugme.dugme-kucuk', { href: `/hukumler?madde=${st.madde}${st.katman === 'tum' ? '&katman=tum' : ''}` }, 'Maddenin bütün hükümleri'), h('a.dugme.dugme-kucuk', { href: maddeKimlik.yol(st.madde) }, 'Maddeye dönün')) : null,
        !st.madde && st.katman === 'tum' ? h('p.kunye', `Açık hükümlerin hepsi (${sayi(dizin.sayilar[tur].acik)} cümle) diğer katmandadır.`) : null,
        !st.madde && st.katman === 'tum' ? h('button.dugme', { type: 'button', onclick: () => katman.querySelector('button').click() }, 'Açık hükümleri gösterin') : null));
      return;
    }
    if (!sonuc.contains(liste)) sonuc.replaceChildren(sayac, liste, gozcu);
    if (!n) {
      liste.append(h('li.hk-bos', h('p', 'Bu süzgeçlere uyan hüküm bulunamadı.'),
        h('button.dugme.dugme-kucuk', { type: 'button', onclick: () => {
          araAlan.value = ''; durumu.s.ara = ''; durumu.s.alt = ''; durumu.s.kisim = 0;
          if (altSec) altSec.value = '';
          for (const b of kisimSec.children) b.setAttribute('aria-pressed', String(+b.dataset.kisim === 0));
          suz();
        } }, 'Süzgeçleri temizleyin')));
      return;
    }
    devam();
  }

  // Hükümler kitap sırasıyla gelir; madde değişince bir fasıl başlığı (madde no + başlık) araya girer.
  function devam() {
    const parti = durumu.suzulmus.slice(durumu.cizilen, durumu.cizilen + PARTI);
    const parcalar = [];
    let onceki = durumu.cizilen ? durumu.suzulmus[durumu.cizilen - 1].x.madde : undefined;
    parti.forEach((k, i) => {
      if (k.x.madde !== onceki) parcalar.push(fasilCiz(k.x));
      onceki = k.x.madde;
      parcalar.push(kayitCiz(k.x, durumu.cizilen + i + 1, { kel: durumu.kelimeler, pdf: durumu.pdf, T }));
    });
    liste.append(...parcalar);
    durumu.cizilen += parti.length;
    gozcu.hidden = durumu.cizilen >= durumu.suzulmus.length;
  }

  function fasilCiz(x) {
    if (!x.madde) return h('li.hk-fasil', h('span.hk-fasil-bag', h('b', '—'), h('span', x.konu || 'Maddeye bağlı olmayan sahîfe')));
    const [k, n] = x.madde.split('-');
    const m = kunyeler.get(x.madde);
    return h('li.hk-fasil', h('a.hk-fasil-bag', { href: `/madde/${k}/${n}` }, h('b.sayi', `${k}/${n}`), h('span', m ? ad(m.baslik) : 'Madde')));
  }

  const gozlemci = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => { if (es.some(e => e.isIntersecting) && durumu.cizilen < durumu.suzulmus.length) devam(); }, { rootMargin: '900px 0px' })
    : null;
  if (gozlemci) { gozlemci.observe(gozcu); d.gozlemciler.push(gozlemci); }
  else gozcu.append(h('button.dugme', { type: 'button', onclick: devam }, 'Devamını gösterin'));

  doldur(kap, h('.kap.hk',
    basKur(),
    turCubugu,
    katman,
    maddeEtiket,
    suzgecKutu,
    sonuc));
  suz();
}

/* ── Bir maddenin hükümleri (/hukumler?madde=1-60) ── */
async function maddeCiz(kap, madde, baglam) {
  const s = sorguOku();
  const sec = { sinyal: baglam.sinyal };
  const [dizin, fihrist] = await Promise.all([veri.hukumlerDizin(sec), veri.fihrist(sec)]);
  const kunyeler = new Map(fihrist.maddeler.map(m => [`${m.kisim}-${m.no}`, m]));
  const mk = kunyeler.get(madde);
  const [k, n] = madde.split('-');
  const yol = maddeKimlik.yol(madde);
  const katmanAd = s.katman === 'acik' ? 'açık hükümler' : 'hükümlerin geçtiği bütün yerler';
  baglam.baslikYaz(`${k}/${n} maddesindeki hükümler · Fıkhî Hükümler`);
  baglam.metaYaz({ aciklama: `Se’âdet-i Ebediyye ${k}/${n}${mk ? ' “' + mk.baslik + '”' : ''} maddesinde geçen fıkhî hükümler, türlerine göre.`, kanonik: location.origin + `/hukumler?madde=${madde}` });

  const katmanSec = h('.secim', { role: 'group', 'aria-label': 'Katman' },
    [['acik', 'Açık hükümler'], ['tum', 'Tamamı']].map(([kt, etiket]) => h('button', {
      type: 'button', 'aria-pressed': String(s.katman === kt),
      onclick: () => { if (s.katman === kt) return; baglam.yerineYaz(adresYap('', { katman: kt, madde })); ciz(kap, {}, baglam); }
    }, etiket)));
  const sayac = h('p.hk-sayac.hk-msayac.kunye', { 'aria-live': 'polite' }, 'Hükümler yükleniyor…');
  const bolumler = h('.hk-mbolumler');
  const yuvalar = new Map(dizin.turler.map(t => [t, h('section.hk-mbolum', { hidden: true, 'aria-labelledby': 'hk-mb-' + t })]));
  bolumler.append(...yuvalar.values());
  const bekleme = h('.hk-mbekle', iskelet(5));
  const bos = h('.hk-bos.hk-bos-tam', { hidden: true },
    h('p', s.katman === 'acik' ? 'Bu maddede açık bir fıkhî hüküm kaydı bulunmuyor.' : 'Bu maddede hüküm geçen bir yer kaydı bulunmuyor.'),
    s.katman === 'acik' ? h('p.kunye', '“Tamamı” katmanında hükmün geçtiği yerlere de bakabilirsiniz.') : null,
    h('.sira', h('a.dugme.dugme-kucuk', { href: yol }, 'Maddeye dönün'),
      s.katman === 'acik' ? h('button.dugme.dugme-kucuk', { type: 'button', onclick: () => katmanSec.children[1].click() }, 'Tamamını gösterin') : null));

  doldur(kap, h('.kap.hk.hk-maddeli',
    h('header.hk-bas',
      h('a.hk-madde-don', { href: yol },
        h('span.hk-don-ok', { 'aria-hidden': 'true' }, '←'),
        h('span.hk-don-ic', h('b.sayi', `${k}/${n}`), h('span', mk ? ad(mk.baslik) : `Madde ${k}/${n}`))),
      h('a.ust-yazi.surh.hk-ust', { href: '/hukumler' }, 'Fıkhî Hükümler'),
      h('h1.baslik-2', 'Bu maddedeki hükümler'),
      h('p.giris-yazi', 'Maddede geçen fıkhî hükümler, kitaptaki cümleleriyle ve türlerine göre. Her türün başlığından o türün bütün hükümlerine geçebilirsiniz.')),
    h('.hk-katman', katmanSec,
      h('p.kunye', 'Açık hükümler, hükmü açıkça bildiren cümlelerdir. Tamamı, hükmün kitapta geçtiği bütün yerleri ayrı bir liste olarak verir.')),
    h('.hk-sonuc', sayac, bekleme, bolumler, bos)));

  // Yedi parça paralel iner; gelen tür geldikçe kendi yuvasına çizilir (yuvalar kitap sırasında durur).
  const sonuclar = new Map();
  const ozetYaz = () => {
    const bitti = sonuclar.size === dizin.turler.length;
    const toplam = [...sonuclar.values()].reduce((t, v) => t + (v || 0), 0);
    const hatali = [...sonuclar.values()].filter(v => v === null).length;
    bekleme.hidden = bitti || toplam > 0;
    if (!bitti) { sayac.textContent = toplam ? `${sayi(toplam)} kayıt · yükleniyor…` : 'Hükümler yükleniyor…'; return; }
    sayac.textContent = toplam ? `${k}/${n} maddesinde ${sayi(toplam)} ${s.katman === 'acik' ? 'açık hüküm' : 'kayıt'}` : '';
    sayac.hidden = !toplam;
    bos.hidden = !!(toplam || hatali);
  };
  const yukle = async t => {
    const yuva = yuvalar.get(t);
    const T = TURLER[t] || { ad: t, kucuk: t };
    try {
      const parca = await veri.hukumler(t, s.katman, sec);
      const kayitlar = kitapSirasi(parca.hukumler.filter(x => x.madde === madde));
      sonuclar.set(t, kayitlar.length);
      if (!kayitlar.length) { yuva.hidden = true; doldur(yuva); ozetYaz(); return; }
      doldur(yuva,
        h('h2.hk-mbaslik#hk-mb-' + t, h('span', T.ad), h('span.hk-mbsayi.sayi', sayi(kayitlar.length)),
          h('a.hk-mbtum', { href: adresYap(t, { katman: s.katman, madde }) }, `${T.ad} hükümlerinde süzün`)),
        h('ol.hk-liste', kayitlar.map((r, i) => kayitCiz(r.x, i + 1, { pdf: fihrist.kitap.pdf, T }))));
      yuva.hidden = false;
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      sonuclar.set(t, null);
      doldur(yuva, h('p.hk-mhata', `${T.ad} hükümleri yüklenemedi.`,
        h('button.bag', { type: 'button', onclick: () => { sonuclar.delete(t); doldur(yuva, h('p.hk-mhata', `${T.ad} hükümleri yükleniyor…`)); ozetYaz(); yukle(t); } }, 'Yeniden deneyin')));
      yuva.hidden = false;
    }
    ozetYaz();
  };
  dizin.turler.forEach(t => { yukle(t); });
}

async function ciz(kap, p, baglam) {
  for (const g of d.gozlemciler.splice(0)) g.disconnect();
  const tur = p.tur ? String(p.tur).toLowerCase() : '';
  const yeniden = () => { doldur(kap, h('.kap', iskelet(8))); ciz(kap, p, baglam); };
  try {
    const madde = sorguOku().madde;
    if (!tur && madde) {
      await maddeCiz(kap, madde, baglam);
    } else if (!tur) {
      const dizin = await veri.hukumlerDizin({ sinyal: baglam.sinyal });
      fihristCiz(kap, dizin, baglam);
    } else if (!TURLER[tur]) {
      bulunamadi(kap, baglam, p.tur);
    } else {
      await turCiz(kap, tur, baglam);
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    if (e && (e.tur === 'bulunamadi' || e.tur === 'gecersiz')) { bulunamadi(kap, baglam, p.tur); return; }
    if (!e || e.tur !== 'cevrimdisi') console.error('Hükümler:', e);
    hataGoster(kap, e, yeniden);
  }
}

/* Dizin yayından kaldırıldığında gösterilen not (js/cekirdek/ayar.js → HUKUMLER_ACIK). Veri yüklenmez. */
function kapaliNot(kap, baglam) {
  baglam.baslikYaz('Fıkhî hükümler dizini gözden geçiriliyor');
  baglam.metaYaz({ robots: 'noindex' });
  kap.append(h('.kap.kap-dar', { style: { paddingBlock: 'var(--a-9)' } },
    h('p.ust-yazi.surh', 'Kitaptan Derlenenler'),
    h('h1.baslik-2', { style: { marginTop: 'var(--a-3)' } }, 'Fıkhî hükümler dizini gözden geçiriliyor'),
    h('p.giris-yazi', { style: { marginTop: 'var(--a-5)' } },
      'Bu dizin kitabın kendisi değildi; kitaptan sonradan derlenmişti. Yapılan denetimde bazı cümlelerin yanlış başlık altında durduğu görüldü. Dizin düzeltilip yeniden denetlenene kadar yayından kaldırılmıştır.'),
    h('p.giris-yazi', { style: { marginTop: 'var(--a-4)' } },
      'Hükümleri kitabın kendi metninden okuyunuz; fihristten ilgili maddeyi açabilir ya da kitabın tamamında arayabilirsiniz.'),
    h('.sira', { style: { marginTop: 'var(--a-6)' } },
      h('a.dugme.dugme-ana', { href: '/icindekiler' }, 'Fihrist'),
      h('a.dugme', { href: '/arama' }, 'Kitapta arayın'),
      h('a.dugme', { href: '/fevaid' }, 'Kitaptan Derlenenler'))));
}

export default {
  ad: 'hukumler',
  async kur(kap, p, baglam) {
    if (!HUKUMLER_ACIK) return kapaliNot(kap, baglam);
    await cssYukle('/css/hukumler.css');
    d = { kap, gozlemciler: [], tur: null };
    const benim = d;
    baglam.temizle(() => { for (const g of benim.gozlemciler) g.disconnect(); if (d === benim) d = null; });
    await ciz(kap, p, baglam);
  },
  async guncelle(p, baglam) {
    if (!HUKUMLER_ACIK) return;
    if (!d) return;
    await ciz(d.kap, p, baglam);
  }
};
