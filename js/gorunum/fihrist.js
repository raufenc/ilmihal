/* Fihrist (/icindekiler): kitabın kapısı.
   Üç kısım, her biri ebru şeritli bir kısım kapağıyla açılır; altında 241 madde fihrist satırı olarak durur.
   Süzgeçler (kısım, konu, durum, başlıkta arama) anında çalışır ve adres çubuğuna ?kisim=&konu=&durum=&q= olarak yazılır. */

import { h, doldur, durum, semse, simge, dinle } from '../cekirdek/dom.js';
import { veri, maddeKimlik } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { ad, sayi, sure, okumaDakikasi, kisimAdi } from '../cekirdek/bicim.js';
import { kullanici } from '../cekirdek/kullanici.js';
import { okumaPlani } from '../cekirdek/okuma-plani.js';
import { yenile } from '../cekirdek/yonlendirici.js';
import { duzleEslemeli, sorguCoz, terimEslesmeleri, vurguAraliklari, esAnlamTablosu } from '../cekirdek/metin.js';

/* Kısım kapaklarının ebrusu (kısım no → dosya) */
const EBRU = { 1: 'battal-yesil', 2: 'tarakli-lacivert', 3: 'sal-bordo' };

/* Eski sitedeki duyuru (app.js DUYURULAR); kapatılanlar 'ilmihal-duyuru-kapatilan' anahtarında. */
const DUYURULAR = [
  { id: 'metin-2026-10', baslik: 'Kitabın metni yenilendi', metin: 'Metin, başlıklar ve sahîfe numaraları Hakîkat Kitâbevi’nin 2026 baskısına göre düzeltildi.', bitis: '2026-12-31' }
];

const DURUMLAR = [['', 'Hepsi'], ['okunmayan', 'Okunmayanlar'], ['yerimi', 'Yer imleri']];

/* "12'si", "3'ü", "40'ı": sayının iyelik eki (okunuşa göre) */
function iyelik(n) {
  const BIR = ['', 'i', 'si', 'ü', 'ü', 'i', 'sı', 'si', 'i', 'u'];
  const ON = ['', 'u', 'si', 'u', 'ı', 'si', 'ı', 'i', 'i', 'ı'];
  if (n % 10) return BIR[n % 10];
  if (n % 100) return ON[(n % 100) / 10];
  if (n % 1000) return 'ü';
  return 'i';
}
function okunanYazi(okunan, toplam) {
  if (!okunan) return 'henüz okunmadı';
  if (okunan >= toplam) return 'hepsi okundu';
  return `${sayi(okunan)}’${iyelik(okunan)} okundu`;
}

/* bicim.ad() ile aynı dönüşüm, ama asıl metindeki konumların yeni metindeki karşılığıyla:
   vurgu aralıklarını izâfet çizgisi korumasını bozmadan yerleştirmek için. */
function adEslemeli(s) {
  let cikti = '';
  const konum = new Array(s.length + 1);
  for (let i = 0; i < s.length; i++) {
    konum[i] = cikti.length;
    const c = s[i];
    cikti += c === "'" ? '’' : c;
    if (c === '-' && i > 0 && i < s.length - 1 && /\p{L}/u.test(s[i - 1]) && /\p{L}/u.test(s[i + 1])) cikti += '⁠';
  }
  konum[s.length] = cikti.length;
  return { cikti, konum };
}

/* Başlığı (varsa) vurgulu düğümlere çevirir. */
function baslikDugumleri(baslik, araliklar) {
  const { cikti, konum } = adEslemeli(baslik);
  if (!araliklar || !araliklar.length) return [cikti];
  const parcalar = [];
  let i = 0;
  for (const [b, s] of araliklar) {
    const bb = konum[b], ss = konum[s];
    if (bb > i) parcalar.push(cikti.slice(i, bb));
    parcalar.push(h('mark', cikti.slice(bb, ss)));
    i = ss;
  }
  if (i < cikti.length) parcalar.push(cikti.slice(i));
  return parcalar;
}

const yerImiSimge = () => h('svg.yerimi-im', { viewBox: '0 0 12 16', 'aria-hidden': 'true', focusable: 'false' }, h('path', { d: 'M2 1.5h8v13l-4-3.2-4 3.2z' }));

export default {
  ad: 'fihrist',
  baslik: 'Fihrist',

  async kur(kap, p, baglam) {
    const sinyal = baglam.sinyal;
    let fihrist;
    try {
      [, fihrist] = await Promise.all([cssYukle('/css/fihrist.css'), veri.fihrist({ sinyal })]);
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      console.warn('Fihrist yüklenemedi:', e);
      kap.append(h('.kap.kap-dar', durum('Fihrist yüklenemedi',
        e.tur === 'cevrimdisi' ? 'İnternet bağlantınız yok gibi görünüyor. Bağlantı gelince yeniden deneyin.' : 'Fihrist şu an alınamadı. Biraz sonra yeniden deneyin.',
        h('button.dugme.dugme-ana', { type: 'button', onclick: () => yenile() }, 'Yeniden deneyin'))));
      return;
    }
    const konularSoz = veri.konular({ sinyal }).catch(e => { if (e.name === 'AbortError') throw e; console.warn('Konular yüklenemedi:', e); return null; });

    const { kitap, kisimlar, maddeler } = fihrist;
    baglam.metaYaz({ aciklama: `${kitap.ad} kitabının fihristi: ${kisimlar.length} kısım, ${maddeler.length} madde, ${sayi(kitap.sahifeSayisi)} sahîfe. Her madde kitaptaki sahîfesi ve okuma süresiyle.` });

    /* ── Durum ── */
    const s = { kisim: 0, konu: '', durum: '', q: '' };
    const sorgudanOku = sorgu => {
      const k = +sorgu.get('kisim');
      s.kisim = kisimlar.some(x => x.no === k) ? k : 0;
      s.konu = sorgu.get('konu') || '';
      s.durum = DURUMLAR.some(([d]) => d && d === sorgu.get('durum')) ? sorgu.get('durum') : '';
      s.q = (sorgu.get('q') || '').slice(0, 120);
    };
    sorgudanOku(baglam.sorgu);

    let okunan = new Set(kullanici.okunan.liste());
    let yerImi = new Set(kullanici.yerImleri.liste().map(b => b.key));
    let konuMaddeleri = null;          // id → Set("1-43")
    let esAnlam = null;                // eş anlamlılar (ilk aramada yüklenir)

    /* ── Satırlar ── */
    const satirlar = maddeler.map(m => {
      const key = m.kisim + '/' + m.no;
      const no = h('span.fihrist-no', String(m.no));
      const baslik = h('span.satir-baslik', ad(m.baslik));
      const im = h('span.satir-imler');
      const altParca = [m.mektup, sure(okumaDakikasi(m.uzunluk)) + ' okuma'].filter(Boolean).join(' · ');
      const a = h('a.fihrist-satir', { href: maddeKimlik.yol(m.kisim + '-' + m.no) },
        no,
        h('span.fihrist-ad', baslik, im),
        h('span.fihrist-sayfa', String(m.sahife[0])),
        h('span.fihrist-alt', altParca));
      const li = h('li', a);
      return { m, key, tire: m.kisim + '-' + m.no, li, a, baslik, im, esleme: null, vurgulu: false };
    });

    const imleriYaz = sat => {
      const o = okunan.has(sat.key), y = yerImi.has(sat.key);
      sat.a.classList.toggle('okundu', o);
      sat.a.classList.toggle('yerimli', y);
      doldur(sat.im,
        y ? [yerImiSimge(), h('span.gizli-yazi', ', yer imli')] : null,
        o ? h('span.gizli-yazi', ', okundu') : null);
    };
    satirlar.forEach(imleriYaz);

    /* ── Kısımlar ── */
    const kisimKayit = kisimlar.map(k => {
      const satirlari = satirlar.filter(x => x.m.kisim === k.no);
      const kunye = h('span');
      const cizgi = h('i');
      const kisaSayi = h('span.kunye');
      const ebru = EBRU[k.no];
      const kapak = h('header.kapak',
        ebru ? h('.kapak-ebru', h('img', {
          src: `/gorsel/ebru/${ebru}-k.webp`, srcset: `/gorsel/ebru/${ebru}-k.webp 768w, /gorsel/ebru/${ebru}.webp 1536w`,
          sizes: '(min-width: 900px) 48rem, 100vw', width: 768, height: 512, alt: '', loading: k.no === 1 ? 'eager' : 'lazy', decoding: 'async'
        })) : null,
        h('.rozet.kapak-rozet', semse({}, false), h('span', k.romen)),
        h('h2.kapak-ad', { id: `kisim-${k.no}-ad` }, ad(k.ad)),
        h('p.kapak-aciklama', ad(k.aciklama)),
        h('p.kunye.kapak-kunye', kunye),
        h('.kapak-ilerleme', { 'aria-hidden': 'true' }, cizgi));
      const kisa = h('h2.kisim-kisa', h('span.kisim-kisa-no', k.romen), h('span', ad(k.ad)), kisaSayi);
      const liste = h('ol.fihrist-liste', { 'aria-labelledby': `kisim-${k.no}-ad` }, satirlari.map(x => x.li));
      const bolum = h('section.kisim', { id: `kisim-${k.no}`, dataset: { kisim: k.no } }, kapak, kisa, liste);
      // Gezgin
      const gCizgi = h('i');
      const gSayi = h('span.kunye');
      const gBag = h('a.gezgin-bag', { href: `#kisim-${k.no}` },
        h('span.gezgin-no', k.romen),
        h('span.gezgin-ad', ad(k.ad)),
        gSayi,
        h('span.gezgin-cizgi', { 'aria-hidden': 'true' }, gCizgi));
      return { k, satirlari, bolum, kunye, cizgi, kisaSayi, gBag, gCizgi, gSayi };
    });

    const ilerlemeYaz = () => {
      for (const kk of kisimKayit) {
        const okunanSayi = kk.satirlari.filter(x => okunan.has(x.key)).length;
        const toplam = kk.satirlari.length;
        const oran = toplam ? okunanSayi / toplam : 0;
        kk.kunye.textContent = `${sayi(toplam)} madde · ${okunanYazi(okunanSayi, toplam)}`;
        kk.cizgi.style.width = (oran * 100).toFixed(2) + '%';
        kk.gCizgi.style.width = (oran * 100).toFixed(2) + '%';
        kk.gSayi.textContent = `${sayi(okunanSayi)} / ${sayi(toplam)}`;
        kk.gBag.setAttribute('aria-label', `${kk.k.ad}: ${toplam} maddeden ${okunanSayi} okundu`);
      }
    };
    ilerlemeYaz();

    /* ── Üst: başlık, künye, kaldığınız yer, okuma planı, duyuru ── */
    const ust = h('header.fihrist-bas',
      h('p.ust-yazi', ad(kitap.ad)),
      h('h1.baslik-1', 'Fihrist'),
      h('p.kunye.fihrist-kunye', `${kisimlar.length} kısım · ${sayi(maddeler.length)} madde · ${sayi(kitap.sahifeSayisi)} sahîfe`));

    const devam = h('.fihrist-devam');
    const devamYaz = () => {
      const satir = [];
      const son = kullanici.sonOkunan.al();
      const sonM = son && maddeler.find(m => m.kisim === son.kisim && m.no === son.madde_no);
      if (sonM) {
        satir.push(h('p.devam-satir',
          h('span.devam-etiket', 'Kaldığınız yer'),
          h('span.devam-ic',
            h('span.devam-no', `${kisimlar.find(k => k.no === sonM.kisim)?.romen || sonM.kisim}/${sonM.no}`),
            h('a.devam-ad', { href: maddeKimlik.yol(sonM.kisim + '-' + sonM.no) }, ad(sonM.baslik))),
          h('a.ok-bag', { href: maddeKimlik.yol(sonM.kisim + '-' + sonM.no), 'aria-label': `Devam edin: ${sonM.baslik}` }, 'Devam edin')));
      }
      if (okumaPlani.aktifMi()) {
        const d = okumaPlani.durum(maddeler);
        if (d.aktif) {
          let yazi, hedef = null, bag = 'Bugünkü kısma geçin';
          if (d.hatimBitti) { yazi = 'Hatim tamamlandı.'; bag = 'Planınız'; hedef = '/calisma-alanim'; }
          else {
            const gun = `${Math.min(d.gunNo, d.gunSayisi)}. gün / ${d.gunSayisi}`;
            const kalan = d.bugunKalanDk > 0 ? `Bugün ≈ ${okumaPlani.sureYazi(d.bugunKalanDk)} okuma kaldı` : 'Bugünkü kısım tamam';
            yazi = `${gun} · ${d.sureDoldu ? 'Plan süresi doldu; kalan maddelerle devam edebilirsiniz' : kalan}`;
            const ilk = (d.bugunkuler || []).find(b => !b.bitti);
            const sira = ilk ? ilk.key : d.siradaki;
            if (sira && (d.bugunKalanDk > 0 || d.sureDoldu)) hedef = maddeKimlik.yol(sira);
            else { hedef = '/calisma-alanim'; bag = 'Planınız'; }
          }
          satir.push(h('p.devam-satir',
            h('span.devam-etiket', 'Okuma planı'),
            h('span.devam-ic', yazi),
            hedef ? h('a.ok-bag', { href: hedef }, bag) : null));
        }
      }
      for (const d of kullanici.duyuru.gorunenler(DUYURULAR)) {
        const p = h('p.devam-satir.duyuru', { role: 'note' },
          h('span.devam-etiket', 'Bilgi'),
          h('span.devam-ic', h('b', d.baslik + '. '), d.metin),
          h('button.duyuru-kapat', { type: 'button', 'aria-label': 'Bilgi notunu kapatın', onclick: () => { kullanici.duyuru.kapat(d.id); p.remove(); } },
            simge('M6 6l12 12M18 6 6 18')));
        satir.push(p);
      }
      doldur(devam, satir);
      devam.hidden = !satir.length;
    };
    devamYaz();

    /* ── Süzgeçler ── */
    const ara = h('input.alan.suzgec-ara', {
      type: 'search', id: 'fihrist-ara', placeholder: 'Başlıklarda arayın…', autocomplete: 'off', spellcheck: 'false',
      enterkeyhint: 'search', 'aria-describedby': 'suzgec-sonuc', value: s.q
    });
    const kisimDugmeleri = [['0', 'Tümü', 'Bütün kısımlar'], ...kisimlar.map(k => [String(k.no), k.romen, k.ad])].map(([v, yazi, etiket]) =>
      h('button', { type: 'button', dataset: { v }, 'aria-label': etiket, title: etiket }, yazi));
    const durumDugmeleri = DURUMLAR.map(([v, yazi]) => h('button', { type: 'button', dataset: { v } }, yazi));
    const konuSec = h('select.alan.suzgec-konu', { id: 'fihrist-konu' }, h('option', { value: '' }, 'Bütün konular'));
    const konuKutu = h('.suzgec-grup.suzgec-konu-grup', { hidden: true }, h('label.suzgec-etiket', { for: 'fihrist-konu' }, 'Konu'), konuSec);
    const sonucYazi = h('p.suzgec-sonuc.kunye', { id: 'suzgec-sonuc', 'aria-live': 'polite' });
    const metindeAra = h('a.ok-bag.metinde-ara', { href: '/arama', hidden: true }, 'Kitabın metninde arayın');
    const temizleDugme = h('button.bag.suzgec-temizle', { type: 'button', hidden: true, onclick: () => { Object.assign(s, { kisim: 0, konu: '', durum: '', q: '' }); ara.value = ''; uygula(true); ara.focus(); } }, 'Süzgeçleri kaldırın');

    const suzgec = h('form.suzgec', { role: 'search', 'aria-label': 'Fihristi süzün', onsubmit: e => { e.preventDefault(); ara.blur(); } },
      h('.suzgec-ara-kutu',
        h('label.gizli-yazi', { for: 'fihrist-ara' }, 'Başlıklarda arayın'),
        simge(['M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z', 'm20 20-4.7-4.7']),
        ara),
      h('.suzgec-satir',
        h('.suzgec-grup', { role: 'group', 'aria-labelledby': 'sz-kisim' }, h('span.suzgec-etiket', { id: 'sz-kisim' }, 'Kısım'), h('.secim', kisimDugmeleri)),
        konuKutu,
        h('.suzgec-grup', { role: 'group', 'aria-labelledby': 'sz-durum' }, h('span.suzgec-etiket', { id: 'sz-durum' }, 'Durum'), h('.secim', durumDugmeleri))),
      h('.suzgec-alt', h('.suzgec-alt-sol', sonucYazi, metindeAra), temizleDugme));

    const bos = h('.fihrist-bos', { hidden: true },
      h('img', { src: '/gorsel/ebru/hafif-k.webp', width: 768, height: 512, alt: '', loading: 'lazy', decoding: 'async' }),
      durum('Bu süzgece uyan madde yok', 'Aradığınız kelimeyi kısaltmayı ya da süzgeçleri kaldırmayı deneyin. Maddelerin içinde aramak için kitapta arayın.',
        h('button.dugme', { type: 'button', onclick: () => temizleDugme.click() }, 'Süzgeçleri kaldırın'),
        h('a.dugme', { href: '/arama' + (s.q ? '/' + encodeURIComponent(s.q) : ''), class: 'bos-ara' }, 'Kitapta arayın')));

    const gezgin = h('nav.kisim-gezgin', { 'aria-label': 'Kısımlar' },
      h('p.ust-yazi', 'Kısımlar'),
      h('ol', kisimKayit.map(kk => h('li', kk.gBag))));

    const govde = h('.fihrist-govde', ust, devam, suzgec, kisimKayit.map(kk => kk.bolum), bos);
    kap.append(h('.kap.fihrist-kitap', h('.fihrist-duzen', gezgin, govde)));

    /* ── Uygula ── */
    let adresZaman = null;
    const adresYaz = hemen => {
      clearTimeout(adresZaman);
      const yaz = () => {
        const q = new URLSearchParams();
        if (s.kisim) q.set('kisim', s.kisim);
        if (s.konu) q.set('konu', s.konu);
        if (s.durum) q.set('durum', s.durum);
        if (s.q.trim()) q.set('q', s.q.trim());
        const yeni = '/icindekiler' + (q.toString() ? '?' + q : '');
        if (location.pathname + location.search !== yeni) baglam.yerineYaz(yeni);
      };
      if (hemen) yaz(); else adresZaman = setTimeout(yaz, 300);
    };

    const uygula = (adreseYaz = true, hemen = true) => {
      for (const b of kisimDugmeleri) b.setAttribute('aria-pressed', String(+b.dataset.v === s.kisim));
      for (const b of durumDugmeleri) b.setAttribute('aria-pressed', String(b.dataset.v === s.durum));
      const konu = konuMaddeleri && s.konu ? konuMaddeleri.get(s.konu) : null;
      if (konuMaddeleri && s.konu && !konu) s.konu = '';
      konuSec.value = s.konu;

      const cozum = s.q.trim() ? sorguCoz(s.q, { esAnlamlilar: esAnlam }) : null;
      const sorguVar = !!(cozum && cozum.secenekler.length);
      const suzgecli = sorguVar || !!konu || !!s.durum;
      let toplam = 0;
      for (const kk of kisimKayit) {
        let gorunen = 0;
        const kisimDisi = s.kisim && kk.k.no !== s.kisim;
        for (const sat of kk.satirlari) {
          let uyar = !kisimDisi;
          if (uyar && konu) uyar = konu.has(sat.tire);
          if (uyar && s.durum === 'okunmayan') uyar = !okunan.has(sat.key);
          if (uyar && s.durum === 'yerimi') uyar = yerImi.has(sat.key);
          let araliklar = null;
          if (uyar && sorguVar) {
            if (!sat.esleme) sat.esleme = duzleEslemeli(sat.m.baslik);
            uyar = cozum.secenekler.some(sec => sec.every(t => terimEslesmeleri(sat.esleme.duz, t, 1).length > 0));
            if (uyar) araliklar = vurguAraliklari(sat.m.baslik, cozum, { eslemeli: sat.esleme });
          }
          sat.li.hidden = !uyar;
          if (uyar && (araliklar || sat.vurgulu)) {
            doldur(sat.baslik, baslikDugumleri(sat.m.baslik, araliklar));
            sat.vurgulu = !!(araliklar && araliklar.length);
          }
          if (uyar) gorunen++;
        }
        kk.bolum.hidden = gorunen === 0;
        kk.gBag.parentElement.hidden = gorunen === 0;
        kk.kisaSayi.textContent = `${sayi(gorunen)} madde`;
        toplam += gorunen;
      }
      govde.classList.toggle('suzgecli', suzgecli);
      bos.hidden = toplam > 0;
      const araAdres = '/arama' + (s.q.trim() ? '/' + encodeURIComponent(s.q.trim()) : '');
      const bosAra = bos.querySelector('.bos-ara');
      if (bosAra) bosAra.setAttribute('href', araAdres);
      metindeAra.setAttribute('href', araAdres);
      metindeAra.hidden = !s.q.trim() || toplam === 0;
      const herhangi = suzgecli || !!s.kisim;
      temizleDugme.hidden = !herhangi;
      sonucYazi.textContent = !herhangi ? '' : toplam ? `Süzgece uyan ${sayi(toplam)} madde` : 'Süzgece uyan madde yok';
      if (adreseYaz) adresYaz(hemen);
    };

    /* ── Olaylar ── */
    for (const b of kisimDugmeleri) b.addEventListener('click', () => { s.kisim = +b.dataset.v; uygula(); });
    for (const b of durumDugmeleri) b.addEventListener('click', () => { s.durum = b.dataset.v; uygula(); });
    konuSec.addEventListener('change', () => { s.konu = konuSec.value; uygula(); });
    ara.addEventListener('input', () => {
      s.q = ara.value.slice(0, 120);
      uygula(true, false);
      if (!esAnlam && s.q.trim().length >= 2) esAnlamYukle();
    });
    ara.addEventListener('keydown', e => {
      if (e.key === 'Escape' && ara.value) { e.preventDefault(); e.stopPropagation(); ara.value = ''; s.q = ''; uygula(); }
    });

    let esAnlamIstendi = false;
    const esAnlamYukle = () => {
      if (esAnlamIstendi) return;
      esAnlamIstendi = true;
      veri.arama({ sinyal }).then(a => {
        esAnlam = esAnlamTablosu(a.esAnlamlilar);
        if (s.q.trim()) uygula(false);
      }).catch(e => { if (e.name !== 'AbortError') console.warn('Eş anlamlılar yüklenemedi:', e); });
    };
    if (s.q.trim().length >= 2) esAnlamYukle();

    // Konular gelince seçiciyi doldur
    konularSoz.then(k => {
      if (!k || sinyal.aborted) return;
      konuMaddeleri = new Map(k.konular.map(x => [x.id, new Set(x.maddeler)]));
      for (const x of k.konular) konuSec.append(h('option', { value: x.id }, ad(x.baslik)));
      konuKutu.hidden = false;
      uygula(false);
    }).catch(() => {});

    // Kullanıcı verisi değişince (bu sekmede ya da öbür sekmelerde)
    const tazele = () => {
      okunan = new Set(kullanici.okunan.liste());
      yerImi = new Set(kullanici.yerImleri.liste().map(b => b.key));
      satirlar.forEach(imleriYaz);
      ilerlemeYaz();
      if (s.durum) uygula(false);
    };
    baglam.temizle(kullanici.izle('okunan', tazele));
    baglam.temizle(kullanici.izle('yerImleri', tazele));
    baglam.temizle(kullanici.izle('sonOkunan', devamYaz));
    baglam.temizle(kullanici.izle('hatim', devamYaz));
    baglam.temizle(kullanici.izle('bitirilen', devamYaz));
    baglam.temizle(() => clearTimeout(adresZaman));

    // Gezgin: kaydırdıkça etkin kısım
    if ('IntersectionObserver' in window) {
      const gozcu = new IntersectionObserver(girdiler => {
        for (const g of girdiler) {
          if (!g.isIntersecting) continue;
          const no = +g.target.dataset.kisim;
          for (const kk of kisimKayit) {
            if (kk.k.no === no) kk.gBag.setAttribute('aria-current', 'true');
            else kk.gBag.removeAttribute('aria-current');
          }
        }
      }, { rootMargin: '-35% 0px -60% 0px' });
      kisimKayit.forEach(kk => gozcu.observe(kk.bolum));
      baglam.temizle(() => gozcu.disconnect());
    }
    // Gezginden çapaya geçerken adres çubuğunda süzgeç kalsın, odak kısma gelsin
    baglam.temizle(dinle(gezgin, 'click', e => {
      const a = e.target.closest('a.gezgin-bag');
      if (!a) return;
      const hedef = document.getElementById(a.getAttribute('href').slice(1));
      if (!hedef) return;
      e.preventDefault();
      hedef.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(history.state, '', location.pathname + location.search + '#' + hedef.id);
      hedef.querySelector('a.fihrist-satir')?.focus({ preventScroll: true });
    }));

    baglam.temizle(() => { this._uygula = null; });
    this._uygula = (sorgu) => { sorgudanOku(sorgu); ara.value = s.q; if (s.q.trim().length >= 2) esAnlamYukle(); uygula(false); };
    uygula(false);
  },

  /* Aynı görünümde yalnız sorgu değişince (ör. /icindekiler?kisim=2 bağlantısı) */
  async guncelle(p, baglam) {
    if (this._uygula) this._uygula(baglam.sorgu);
  }
};
