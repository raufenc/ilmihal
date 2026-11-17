/* Arama sayfası: /arama ve /arama/:sorgu*  (?tur=madde|lugat|sahis|hukum|tanim &kisim=1|2|3)
   - Motor: js/cekirdek/arama.js (Worker). Tam metin dizini yalnız burada, sorgu varken iner.
   - Sonuçlar parça parça akar; çizilmiş satırların sırası akış sırasında değişmez, yeni gelen puanına göre
     araya girer; kullanıcı listenin içindeyse konumu korunur. Akış bitince, liste henüz okunmuyorsa son sıra uygulanır.
   - Yazarken adres yerinde güncellenir (her tuşta geçmiş kaydı yok); bir yazma oturumu tek kayıt açar, Enter onu
     kesinleştirir. Süzgeçler ?tur=…&kisim=… olarak yazılır.
   - Sorgu hiçbir yerde HTML'e ya da özniteliğe gömülmez (yalnız textContent ve kodlanmış adres). */

import { h, doldur } from '../cekirdek/dom.js';
import { cssYukle } from '../cekirdek/css.js';
import { arama } from '../cekirdek/arama.js';
import { veri } from '../cekirdek/veri.js';
import { sayi, sahife, roma, ad, kisimAdi } from '../cekirdek/bicim.js';
import { vurguluMetin, aramaYolu, maddeYolu, sonAramalar, tanimMaddesi } from '../bilesen/hizli-arama.js';

const TURLER = [
  { ad: 'madde', etiket: 'Maddeler', durum: n => `${n} maddede geçiyor`, kisimli: true },
  { ad: 'lugat', etiket: 'Lügat', durum: n => `lügatte ${n} terimde geçiyor` },
  { ad: 'sahis', etiket: 'Hâl tercemeleri', durum: n => `${n} hâl tercemesinde geçiyor` },
  { ad: 'hukum', etiket: 'Fıkhî hükümler', durum: n => `${n} fıkhî hükümde geçiyor`, kisimli: true },
  { ad: 'tanim', etiket: 'Tanımlar', durum: n => `kitabın ${n} tanımında geçiyor` },
];
const TUR = Object.fromEntries(TURLER.map(t => [t.ad, t]));
const HUKUM_AD = { farz: 'Farz', vacib: 'Vâcib', sunnet: 'Sünnet', mustehab: 'Müstehab', mubah: 'Mubâh', mekruh: 'Mekrûh', haram: 'Harâm' };
// Eski arama sayfasının hazır etiketleri (envanter 4.3)
const ORNEKLER = ['Abdest nasıl alınır?', 'Namaz', 'Namazın farzları', 'Oruç', 'Zekât kimlere verilir?', 'İmanın şartları', 'Nikâh', 'Cenaze', 'Bid’at'];
const SAYFA = 20;
const ILK_SINIR = { madde: 400, lugat: 60, sahis: 60, hukum: 60, tanim: 60 };   // madde: hepsi (kısım süzgeci yerelde)
const KESIT = { madde: 3, lugat: 1, sahis: 1, hukum: 1, tanim: 1 };
const YAZMA_BEKLEMESI = 550;
const ARA_SIMGE = 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16 16l5 5';

// Görünümden çıkıp geri gelince aynı listeyi aynı uzunlukta, beklemeden kurabilmek için (yalnız bellekte)
const onbellek = new Map();          // sorgu → kayıtlar { 'madde|': {...}, … }
const hatira = new Map();            // geçmiş kaydı → gösterilen satır sayısı

const norm = s => String(s || '').trim().replace(/\s+/g, ' ');
const harfSayisi = s => s.replace(/[^\p{L}\p{N}]/gu, '').length;
const tirnak = q => (/^["“].*["”]$/.test(q) && q.length > 2 ? `“${q.slice(1, -1)}”` : `“${q}”`);
let etkin = null;                    // açık arama görünümünün durumu (guncelle için)
const kayitAnahtari = () => (history.state && history.state.k ? history.state.k : '') + location.pathname;

export default {
  ad: 'arama',
  baslik: p => (norm(p.sorgu) ? `${tirnak(norm(p.sorgu))} araması` : 'Kitapta arayın'),

  async kur(kap, p, baglam) {
    const [, fihrist] = await Promise.all([
      cssYukle('/css/arama.css'),
      veri.fihrist({ sinyal: baglam.sinyal }).catch(() => null),
    ]);
    baglam.metaYaz({ robots: 'noindex' });
    const S = durumKur(kap, baglam, fihrist);
    etkin = S;
    baglam.temizle(() => { if (etkin === S) etkin = null; });
    await S.ac(norm(p.sorgu), baglam.sorgu, { ilk: true });
  },

  async guncelle(p, baglam) {
    baglam.metaYaz({ robots: 'noindex' });
    const S = etkin;
    if (!S) return;
    S.baglam = baglam;
    await S.ac(norm(p.sorgu), baglam.sorgu, { ilk: false });
  },
};

function durumKur(kap, baglam, fihrist) {
  const S = {
    baglam, q: '', tur: 'madde', kisim: null,
    kayit: {}, gosterilen: SAYFA, dizi: [], elemanlar: new Map(),
    is: null, taslak: false, bizden: null, zaman: 0, soruNo: 0, oneriNo: 0,
    soru: null, oneri: null, pdf: fihrist && fihrist.kitap ? fihrist.kitap.pdf : null,
  };

  /* ── İskelet ─────────────────────────────────────────────── */
  const girdi = h('input.alan.as-girdi', {
    type: 'search', name: 'q', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
    enterkeyhint: 'search', placeholder: 'Kelime, ifade ya da suâl yazın', 'aria-label': 'Kitapta arayın',
    'aria-describedby': 'as-ipucu',
  });
  const temizle = h('button.as-temizle', { type: 'button', 'aria-label': 'Aramayı temizleyin', hidden: true, onclick: () => { girdi.value = ''; girdiDegisti(); girdi.focus(); } },
    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' }, h('path', { d: 'M6 6l12 12M18 6 6 18' })));
  const form = h('form.as-form', { role: 'search', action: '/arama', onsubmit: e => { e.preventDefault(); kesinlestir(); } },
    h('svg.as-ara-simge', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' }, h('path', { d: ARA_SIMGE })),
    girdi, temizle,
    h('button.dugme.dugme-ana.as-ara-dugme', { type: 'submit' }, 'Arayın'));
  const ipucu = h('p.as-ipucu.kunye#as-ipucu',
    'Tam ifade için tırnak içinde yazın: ', h('q.as-ornek-ifade', 'ehl-i sünnet'),
    '. Birden çok kelimede hepsinin geçtiği yerler gelir; şapkalı ve şapkasız yazım aynı sonucu verir.');

  const turSecim = h('.secim.as-turler', { role: 'group', 'aria-label': 'Sonuç türü' });
  const kisimSecim = h('.secim.as-kisimlar', { role: 'group', 'aria-label': 'Kısım' });
  const suzgec = h('.as-suzgec', turSecim, kisimSecim);
  const durumSatiri = h('p.as-durum');
  const duyuru = h('p.gizli-yazi', { 'aria-live': 'polite', 'aria-atomic': 'true' });
  const durumAlt = h('p.as-durum-alt.kunye');
  const ustBlok = h('.as-ust-blok');
  const liste = h('ol.as-liste', { 'aria-label': 'Sonuçlar' });
  const dahaDugme = h('button.dugme.as-daha', { type: 'button', onclick: () => daha() }, 'Daha fazla gösterin');
  const devam = h('.as-devam', dahaDugme);
  const bosAlan = h('.as-bos');
  const sonucAlani = h('section.as-sonuclar', { 'aria-label': 'Arama sonuçları' },
    h('h2.gizli-yazi', 'Sonuçlar'), h('.as-durum-kap', durumSatiri, durumAlt, duyuru), ustBlok, liste, devam, bosAlan);

  kap.append(h('.kap.as-kap',
    h('header.as-ust',
      h('p.ust-yazi.surh', 'Se’âdet-i Ebediyye'),
      h('h1.baslik-2.as-baslik', 'Kitapta arayın'),
      form, ipucu,
      suzgec),
    sonucAlani));

  /* ── Yaşam döngüsü ───────────────────────────────────────── */
  const iptalHepsi = () => { if (S.is) S.is.abort(); S.is = null; clearTimeout(S.zaman); };
  baglam.temizle(iptalHepsi);
  baglam.sinyal.addEventListener('abort', iptalHepsi, { once: true });

  const gozcu = 'IntersectionObserver' in window ? new IntersectionObserver(g => {
    if (g.some(x => x.isIntersecting) && !devam.hidden && !dahaDugme.disabled) daha();
  }, { rootMargin: '0px 0px 500px 0px' }) : null;
  if (gozcu) { gozcu.observe(devam); baglam.temizle(() => gozcu.disconnect()); }

  /* ── Girdi ve adres ──────────────────────────────────────── */
  function sorguEki() {
    const u = new URLSearchParams();
    if (S.tur !== 'madde') u.set('tur', S.tur);
    if (S.kisim && TUR[S.tur].kisimli) u.set('kisim', String(S.kisim));
    const s = u.toString();
    return s ? '?' + s : '';
  }
  const adres = q => aramaYolu(q, q ? sorguEki() : '');
  const buAdres = () => location.pathname + location.search;

  function girdiDegisti() {
    temizle.hidden = !girdi.value;
    clearTimeout(S.zaman);
    S.zaman = setTimeout(() => uygula(norm(girdi.value), false), YAZMA_BEKLEMESI);
  }
  girdi.addEventListener('input', girdiDegisti);

  function kesinlestir() {
    clearTimeout(S.zaman);
    uygula(norm(girdi.value), true);
  }

  /** kesin: Enter. Yazma oturumunun ilk güncellemesi geçmişe tek kayıt açar; sonrakiler onu yerinde değiştirir. */
  function uygula(q, kesin) {
    const url = adres(q);
    if (url !== buAdres()) {
      if (S.taslak || (!kesin && q === S.q)) S.baglam.yerineYaz(url);
      else { S.taslak = !kesin; S.bizden = url; S.baglam.git(url); }
    }
    if (kesin) { S.taslak = false; if (harfSayisi(q) >= 2) sonAramalar.ekle(q); }
    S.baglam.baslikYaz(q ? `${tirnak(q)} araması` : 'Kitapta arayın');
    if (q !== S.q) baslat(q);
    else if (kesin && S.q && !S.is && !aktifKayit()) isle();
  }

  /** Yönlendiriciden (ilk açılış, geri/ileri, bağlantı). */
  S.ac = async (q, sorgu, { ilk }) => {
    const url = buAdres();
    if (S.bizden && S.bizden === url) { S.bizden = null; return; }      // kendi açtığımız kayıt: zaten aranıyor
    S.bizden = null;
    S.taslak = false;
    const tur = TUR[sorgu.get('tur')] ? sorgu.get('tur') : 'madde';
    const k = +sorgu.get('kisim');
    S.tur = tur;
    S.kisim = TUR[tur].kisimli && k >= 1 && k <= 3 ? k : null;
    girdi.value = q;
    temizle.hidden = !q;
    const donus = hatira.has(kayitAnahtari());
    S.gosterilen = hatira.get(kayitAnahtari()) || SAYFA;
    if (q !== S.q || ilk) baslat(q, { korunsun: true });
    else { S.dizi = []; ciz(); isle(); }
    if (!q && ilk && !matchMedia('(pointer: coarse)').matches) {
      addEventListener('ilmihal:gorunum', () => { if (girdi.isConnected) girdi.focus({ preventScroll: true }); }, { once: true });
    }
    // Geri dönüşte konumun tutması için liste, yönlendirici kaydırmadan önce tam olmalı
    if (donus && q && !aktifBitti()) await bitisBekle(6000);
  };

  /* ── Arama işleri ────────────────────────────────────────── */
  function baslat(q, { korunsun = false } = {}) {
    if (S.is) { S.is.abort(); S.is = null; }
    S.q = q;
    S.kayit = onbellek.get(q) || {};
    S.dizi = [];
    S.soru = null; S.oneri = null;
    if (!korunsun) S.gosterilen = SAYFA;
    for (const el of S.elemanlar.values()) el.remove();
    S.elemanlar.clear();
    ciz();
    if (harfSayisi(q) < 2) return;
    isle();
    soruGetir(q);
  }

  const anahtar = (tur, kisim) => tur + '|' + (kisim || '');
  const tamamMi = e => e && e.bitti && e.sonuclar.length >= e.toplam;

  /** Görüntülenen tür/kısım için kayıt (kısım süzgeci tam liste eldeyse yerelde uygulanır). */
  function aktifKayit() {
    const tum = S.kayit[anahtar(S.tur, null)];
    if (!S.kisim) return tum || null;
    if (tum && (tamamMi(tum) || (S.tur === 'madde' && tum.sonuclar))) {
      const sonuclar = tum.sonuclar.filter(s => s.kisim === S.kisim);
      return { ...tum, sonuclar, toplam: tum.bitti ? sonuclar.length : null };
    }
    return S.kayit[anahtar(S.tur, S.kisim)] || null;
  }
  const aktifBitti = () => { const e = aktifKayit(); return !!(e && e.bitti); };

  function siradaki() {
    // 1) Görüntülenen liste
    const tur = S.tur;
    const kisimli = S.kisim && !(tur === 'madde') && !tamamMi(S.kayit[anahtar(tur, null)]);
    const k = kisimli ? S.kisim : null;
    const e = S.kayit[anahtar(tur, k)];
    if (!e || !e.bitti) return { turler: [tur], kisim: k, sinir: ILK_SINIR[tur], aktif: true };
    const gorunen = aktifKayit();
    if (gorunen && S.gosterilen > gorunen.sonuclar.length && e.sonuclar.length < e.toplam) {
      return { turler: [tur], kisim: k, sinir: Math.min(e.toplam, e.sonuclar.length + 400), aktif: true, genislet: true };
    }
    // 2) Süzgeç sayıları: önce maddeler (kendi sınırıyla), sonra öbürleri birlikte
    if (!S.kayit[anahtar('madde', null)]?.bitti) return { turler: ['madde'], kisim: null, sinir: ILK_SINIR.madde };
    const eksik = TURLER.map(t => t.ad).filter(t => t !== 'madde' && !S.kayit[anahtar(t, null)]?.bitti);
    if (eksik.length) return { turler: eksik, kisim: null, sinir: 60 };
    return null;
  }

  async function isle() {
    if (S.is) S.is.abort();
    const is = new AbortController();
    S.is = is;
    const q = S.q;
    for (;;) {
      const g = siradaki();
      if (!g) break;
      const kesitSayisi = Math.max(...g.turler.map(t => KESIT[t]));
      if (g.aktif && !g.genislet) {
        S.kayit[anahtar(g.turler[0], g.kisim)] = { sonuclar: [], toplam: null, bitti: false, ilerleme: null };
        ciz();
      }
      let t;
      try {
        t = await arama.tam(q, {
          turler: g.turler, kisim: g.kisim, sinir: g.sinir, kesitSayisi, sinyal: is.signal,
          parcaGeldi: g.aktif && !g.genislet ? (sonuclar, ilerleme) => {
            if (S.is !== is) return;
            const e = S.kayit[anahtar(g.turler[0], g.kisim)];
            e.sonuclar = sonuclar; e.ilerleme = ilerleme;
            ciz();
          } : null,
        });
      } catch (hata) {
        if (hata && hata.name === 'AbortError') return;
        if (S.is !== is) return;
        console.warn('Arama:', hata);
        if (g.aktif) {
          S.kayit[anahtar(g.turler[0], g.kisim)] = { sonuclar: [], toplam: null, bitti: false, hata: String(hata.message || hata) };
          ciz();
        }
        break;
      }
      if (S.is !== is) return;
      for (const tur of g.turler) {
        S.kayit[anahtar(tur, g.kisim)] = {
          sonuclar: t.sonuclar.filter(s => s.tur === tur), toplam: t.toplam[tur] || 0, bitti: true,
          hatalar: t.hatalar, sure: t.sure,
        };
      }
      if (!g.kisim && !t.hatalar.length) { onbellek.delete(q); onbellek.set(q, S.kayit); while (onbellek.size > 6) onbellek.delete(onbellek.keys().next().value); }
      ciz({ son: g.aktif });
      if (g.turler.includes('madde') && !g.kisim && !g.genislet) oneriGetir(q);
    }
    if (S.is === is) S.is = null;
  }

  /** Eldeki sonuç bitene dek bekler (geri dönüşte konumun tutması için), en çok `ms`. */
  function bitisBekle(ms) {
    return new Promise(coz => {
      const bas = performance.now();
      const bak = () => {
        if (aktifBitti() || !S.q || S.baglam.sinyal.aborted || performance.now() - bas > ms) return coz();
        setTimeout(bak, 40);
      };
      bak();
    });
  }

  function soruGetir(q) {
    const no = ++S.soruNo;
    arama.hizli(q, { sinir: 1 }).then(s => {
      if (no !== S.soruNo || q !== S.q) return;
      S.soru = (s.soru && s.soru[0]) || null;
      ustCiz();
    }, () => {});
  }

  function oneriGetir(q) {
    const e = S.kayit[anahtar('madde', null)];
    if (!e || !e.bitti || e.toplam >= 10) return;
    const no = ++S.oneriNo;
    arama.oneriler(q).then(o => {
      if (no !== S.oneriNo || q !== S.q) return;
      S.oneri = o && o.oneriler && o.oneriler.length ? o : null;
      ustCiz();
      if (aktifBitti() && !(aktifKayit().toplam)) ciz();
    }, () => {});
  }

  function daha() {
    const e = aktifKayit();
    if (!e) return;
    const toplam = e.bitti ? e.toplam : e.sonuclar.length;
    if (S.gosterilen >= toplam) return;
    S.gosterilen += SAYFA;
    hatira.set(kayitAnahtari(), S.gosterilen);
    if (S.gosterilen > e.sonuclar.length && e.bitti && e.sonuclar.length < e.toplam) isle();
    ciz();
  }

  function filtre(tur, kisim) {
    if (tur === S.tur && kisim === S.kisim) return;
    S.tur = tur;
    S.kisim = TUR[tur].kisimli ? kisim : null;
    S.gosterilen = SAYFA;
    S.dizi = [];
    hatira.delete(kayitAnahtari());
    if (S.q) S.baglam.yerineYaz(adres(S.q));
    ciz();
    isle();
  }

  /* ── Çizim ───────────────────────────────────────────────── */
  const turDugmeleri = TURLER.map(t => {
    const sayiEl = h('span.as-cip-sayi');
    const b = h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => filtre(t.ad, S.kisim) }, t.etiket, sayiEl);
    turSecim.append(b);
    return { t, b, sayiEl };
  });
  const kisimDugmeleri = [null, 1, 2, 3].map(k => {
    const sayiEl = h('span.as-cip-sayi');
    const b = h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => filtre(S.tur, k), 'aria-label': k ? kisimAdi(k) : 'Bütün kısımlar' },
      k ? h('span', h('span.as-roma', roma(k)), h('span.as-kisim-ek', '. Kısım')) : 'Tümü', sayiEl);
    kisimSecim.append(b);
    return { k, b, sayiEl };
  });

  function cipCiz() {
    const sayiBul = t => {
      const e = S.kayit[anahtar(t, null)];
      if (!e) return null;
      if (e.bitti) return sayi(e.toplam);
      return e.sonuclar && e.sonuclar.length ? sayi(e.sonuclar.length) + '…' : null;
    };
    for (const { t, b, sayiEl } of turDugmeleri) {
      const n = sayiBul(t.ad);
      const e = S.kayit[anahtar(t.ad, null)];
      b.setAttribute('aria-pressed', String(S.tur === t.ad));
      b.classList.toggle('as-bos-cip', !!(e && e.bitti && !e.toplam));
      sayiEl.textContent = n === null ? '' : n;
    }
    kisimSecim.hidden = !TUR[S.tur].kisimli;
    if (!kisimSecim.hidden) {
      const tum = S.kayit[anahtar(S.tur, null)];
      const say = k => (tum && tum.bitti && tamamMi(tum)) ? sayi(k ? tum.sonuclar.filter(s => s.kisim === k).length : tum.toplam) : '';
      for (const { k, b, sayiEl } of kisimDugmeleri) {
        b.setAttribute('aria-pressed', String(S.kisim === k));
        sayiEl.textContent = say(k);
      }
    }
  }

  function ustCiz() {
    const bloklar = [];
    if (S.soru && S.q) {
      const s = S.soru;
      bloklar.push(h('aside.as-soru.cetvel', { 'aria-label': 'Bu suâlin cevabı' },
        h('p.ust-yazi.surh', 'Bu suâlin cevabı şu maddede'),
        h('a.as-soru-bas', { href: maddeYolu(s.kisim, s.no) },
          h('span.as-no', `${roma(s.kisim)}·${s.no}`), h('span', ad(s.baslik))),
        s.cevapOzet ? h('p.as-soru-ozet', s.cevapOzet) : null,
        s.cevapOzet ? h('p.as-soru-not.kunye', 'Bu kısa cevap sitenin özetidir; kitabın metni maddededir.') : null));
    }
    if (S.oneri && S.q && aktifKayit()?.toplam) bloklar.push(oneriSatiri(S.oneri));
    doldur(ustBlok, bloklar);
  }

  function oneriSatiri(o) {
    const goruldu = new Set();
    const bag = (q, aciklama) => h('a.as-oneri', { href: aramaYolu(q), title: aciklama || null }, q);
    const parcalar = [];
    if (o.duzeltilmis) { parcalar.push(bag(o.duzeltilmis)); goruldu.add(o.duzeltilmis); }
    for (const x of o.oneriler) {
      if (x.tur === 'duzeltme' || goruldu.has(x.oneri)) continue;
      goruldu.add(x.oneri);
      parcalar.push(bag(x.oneri, x.aciklama));
      if (parcalar.length >= 6) break;
    }
    if (!parcalar.length) return null;
    return h('p.as-oneriler', h('span.as-oneri-bas', o.duzeltilmis ? 'Bunu mu demek istediniz: ' : 'Şunları da arayabilirsiniz: '),
      parcalar.flatMap((p, i) => (i ? [h('span.as-ayir', { 'aria-hidden': 'true' }, ' · '), p] : [p])));
  }

  function durumCiz(e) {
    const t = TUR[S.tur];
    const kisimEk = S.kisim ? ` (${kisimAdi(S.kisim)})` : '';
    if (!e) { doldur(durumSatiri); doldur(durumAlt); return; }
    if (e.hata) {
      doldur(durumSatiri, 'Arama tamamlanamadı');
      doldur(durumAlt);
      return;
    }
    if (!e.bitti) {
      const n = e.sonuclar.length;
      const il = e.ilerleme;
      doldur(durumSatiri, tirnak(S.q), ' ', n ? `şimdiye dek ${sayi(n)} ${t.ad === 'madde' ? 'maddede' : 'yerde'} bulundu` : 'aranıyor', kisimEk);
      doldur(durumAlt, il ? `Kitap taranıyor: ${il.yuklenen}/${il.toplam}` : 'Dizin indiriliyor…');
      return;
    }
    const hicYok = TURLER.every(x => { const k = S.kayit[anahtar(x.ad, null)]; return k && k.bitti && !k.toplam; });
    doldur(durumSatiri, tirnak(S.q), ' ', e.toplam ? t.durum(sayi(e.toplam)) : hicYok ? 'kitapta geçmiyor' : 'bulunamadı', e.toplam || !hicYok ? kisimEk : '');
    if (duyuru.textContent !== durumSatiri.textContent) duyuru.textContent = durumSatiri.textContent;
    const eslesme = e.sonuclar.length >= e.toplam ? e.sonuclar.reduce((a, s) => a + (s.eslesmeSayisi || 0), 0) : 0;
    const ekler = [];
    if (eslesme && S.tur === 'madde') ekler.push(`toplam ${sayi(eslesme)} yerde`);
    if (e.hatalar && e.hatalar.length) ekler.push('kitabın bir bölümü indirilemedi, sonuçlar eksik olabilir');
    doldur(durumAlt, ekler.join(' · '), e.hatalar && e.hatalar.length ? [' · ', h('button.bag', { type: 'button', onclick: () => {
      for (const k of Object.keys(S.kayit)) if (S.kayit[k].hatalar && S.kayit[k].hatalar.length) delete S.kayit[k];
      S.dizi = []; ciz(); isle();
    } }, 'Yeniden deneyin')] : null);
  }

  /** Görüntülenen sıra: çizilmişlerin yeri korunur, yeni gelenler puanına göre araya girer. */
  function diziGuncelle(sonuclar, kesin) {
    const harita = new Map(sonuclar.map(s => [s.kimlik, s]));
    if (kesin || !S.dizi.length) { S.dizi = sonuclar.map(s => s.kimlik); return harita; }
    const dizi = S.dizi.filter(k => harita.has(k));
    const var_ = new Set(dizi);
    for (const s of sonuclar) {
      if (var_.has(s.kimlik)) continue;
      let j = dizi.findIndex(k => harita.get(k).puan < s.puan);
      if (j < 0) j = dizi.length;
      dizi.splice(j, 0, s.kimlik);
      var_.add(s.kimlik);
    }
    S.dizi = dizi;
    return harita;
  }

  function ciz({ son = false } = {}) {
    const q = S.q;
    kap.querySelector('.as-kap')?.toggleAttribute('data-dolu', !!q);
    const hepsiBos = TURLER.every(t => { const e = S.kayit[anahtar(t.ad, null)]; return e && e.bitti && !e.toplam; });
    suzgec.hidden = harfSayisi(q) < 2 || hepsiBos;
    sonucAlani.hidden = !q;
    if (!q) { bosSayfa(); return; }
    kap.querySelector('.as-baslangic')?.remove();
    doldur(bosAlan);
    if (harfSayisi(q) < 2) {
      doldur(durumSatiri); doldur(durumAlt); doldur(ustBlok);
      for (const el of S.elemanlar.values()) el.remove();
      S.elemanlar.clear();
      devam.hidden = true;
      doldur(bosAlan, h('.as-uyari', h('p.as-uyari-bas', 'En az iki harf yazın'),
        h('p', 'Tek harfle arama yapılmaz; bir kelimenin en az iki harfini yazın.')));
      return;
    }
    cipCiz();
    ustCiz();
    const e = aktifKayit();
    durumCiz(e);
    if (e && e.hata) {
      listeyiBosalt();
      doldur(bosAlan, h('.as-uyari', h('p.as-uyari-bas', navigator.onLine === false ? 'Bağlantı yok' : 'Arama verisi indirilemedi'),
        h('p', navigator.onLine === false ? 'Kitabın arama dizini henüz bu cihaza inmedi. Bağlantı gelince yeniden deneyin.' : 'Bağlantınızı denetleyip yeniden deneyin.'),
        h('.sira', h('button.dugme.dugme-ana', { type: 'button', onclick: () => { delete S.kayit[anahtar(S.tur, null)]; delete S.kayit[anahtar(S.tur, S.kisim)]; ciz(); isle(); } }, 'Yeniden deneyin'),
          h('a.dugme', { href: '/icindekiler' }, 'Fihrist'))));
      return;
    }
    const sonuclar = e ? e.sonuclar : [];
    if (e && e.bitti && !e.toplam) { listeyiBosalt(); sonucYok(); return; }

    // Kullanıcı listenin içindeyse (liste başı ekranın üstünde kalmışsa) son sırayı dayatma
    const listeUstu = liste.getBoundingClientRect().top;
    const okunuyor = liste.childElementCount > 0 && listeUstu < 0;
    const harita = diziGuncelle(sonuclar, son && !okunuyor);
    const istenen = S.dizi.slice(0, S.gosterilen).map(k => {
      let el = S.elemanlar.get(k);
      if (!el) { el = sonucEl(harita.get(k)); S.elemanlar.set(k, el); }
      return el;
    });

    // Konum koruma: görünen ilk satırın yeri değişmesin
    let capa = null;
    if (okunuyor) {
      for (const li of liste.children) { const r = li.getBoundingClientRect(); if (r.bottom > 90) { capa = { li, ust: r.top }; break; } }
    }
    istenen.forEach((el, i) => { if (liste.children[i] !== el) liste.insertBefore(el, liste.children[i] || null); });
    while (liste.children.length > istenen.length) liste.lastElementChild.remove();
    if (capa && capa.li.isConnected) {
      const fark = capa.li.getBoundingClientRect().top - capa.ust;
      if (Math.abs(fark) > 1) scrollBy(0, fark);
    }

    const toplam = e && e.bitti ? e.toplam : sonuclar.length;
    const kalan = toplam - Math.min(S.gosterilen, S.dizi.length);
    devam.hidden = !(e && kalan > 0 && S.dizi.length > 0 && (e.bitti || S.dizi.length > S.gosterilen));
    dahaDugme.disabled = !!(e && e.bitti && S.gosterilen > sonuclar.length);    // sonraki dilim iniyor
    doldur(dahaDugme, dahaDugme.disabled ? 'Yükleniyor…' : ['Daha fazla gösterin', e && e.bitti ? h('span.as-cip-sayi', `${sayi(kalan)} kaldı`) : null]);
    if (!e || (!e.bitti && !sonuclar.length)) { if (!liste.childElementCount) doldur(bosAlan, h('.as-bekle', { 'aria-hidden': 'true' }, h('i'), h('i'), h('i'))); }
    if (e && e.bitti) hatira.set(kayitAnahtari(), S.gosterilen);
  }

  function listeyiBosalt() {
    for (const el of S.elemanlar.values()) el.remove();
    S.elemanlar.clear();
    S.dizi = [];
    devam.hidden = true;
  }

  const hepsiBos = () => TURLER.every(t => { const e = S.kayit[anahtar(t.ad, null)]; return e && e.bitti && !e.toplam; });
  function sonucYok() {
    const t = TUR[S.tur];
    const baska = TURLER.filter(x => x.ad !== S.tur && S.kayit[anahtar(x.ad, null)]?.toplam);
    doldur(bosAlan, h('.as-sonucsuz',
      h('p.as-sonucsuz-bas', hepsiBos() ? 'Şunları deneyebilirsiniz' : S.kisim ? `${kisimAdi(S.kisim)}nda sonuç yok` : `${t.etiket} arasında sonuç yok`),
      baska.length ? h('p', 'Şuralarda geçiyor: ', baska.flatMap((x, i) => [i ? ', ' : null,
        h('button.bag', { type: 'button', onclick: () => filtre(x.ad, null) }, `${x.etiket} (${sayi(S.kayit[anahtar(x.ad, null)].toplam)})`)])) : null,
      S.kisim ? h('p', h('button.bag', { type: 'button', onclick: () => filtre(S.tur, null) }, 'Bütün kısımlarda arayın')) : null,
      S.oneri ? oneriSatiri(S.oneri) : null,
      h('p', 'Kelimeyi kısaltarak ya da kitabın yazımıyla (nemâz, gusl, oruc) yeniden deneyin. Şapkalı ve şapkasız yazım aynı sonucu verir.'),
      h('.sira', h('a.dugme', { href: '/icindekiler' }, 'Fihristte bakın'), h('a.dugme', { href: '/sozluk' }, 'Dinî lügat'))));
  }

  function bosSayfa() {
    doldur(durumSatiri); doldur(durumAlt); doldur(ustBlok);
    listeyiBosalt();
    const son = sonAramalar.liste();
    doldur(bosAlan);
    sonucAlani.hidden = true;
    const ornekler = h('.as-baslangic',
      h('section.as-ornekler', h('h2.ust-yazi', 'Sık aranan konular'),
        h('ul.as-etiketler', ORNEKLER.map(o => h('li', h('a', { href: aramaYolu(o) }, o))))),
      son.length ? h('section.as-sonlar', h('h2.ust-yazi', 'Son aramalarınız'),
        h('ul.fihrist', son.map((q, i) => h('li', h('a.fihrist-satir', { href: aramaYolu(q) },
          h('span.fihrist-no', String(i + 1)), h('span.fihrist-ad', h('span', q)), h('span.fihrist-sayfa', '→')))))) : null,
      h('section.as-diger', h('h2.ust-yazi', 'Başka yollar'),
        h('ul.fihrist', [['Fihrist', '/icindekiler', 'Kitabın bütün maddeleri sırasıyla'], ['Dinî lügat', '/sozluk', 'Kelimelerin mânâları'],
          ['Hâl tercemeleri', '/sahislar', 'Kitapta adı geçen zâtlar'], ['Fıkhî hükümler', '/hukumler', 'Farz, vâcib, sünnet, harâm…']]
          .map(([a, href, alt]) => h('li', h('a.fihrist-satir', { href }, h('span.fihrist-no', '·'), h('span.fihrist-ad', h('span', a)), h('span.fihrist-sayfa'), h('span.fihrist-alt', alt)))))));
    let yer = kap.querySelector('.as-baslangic');
    if (yer) yer.replaceWith(ornekler); else kap.querySelector('.as-kap').append(ornekler);
  }

  /* ── Satırlar ────────────────────────────────────────────── */
  const kesitler = s => (s.kesitler || []).map(k => h('p.as-kesit', vurguluMetin(k.metin, k.vurgular, k)));
  const pdfBag = (sahifeNo, metin) => (S.pdf && sahifeNo ? h('a.kaynak', { href: `${S.pdf}#page=${Math.min(+sahifeNo, 1248)}`, target: '_blank', rel: 'noopener', title: 'Kitabın aslında bu sahîfeyi açın (yeni sekme)' }, metin || ['sahîfe ', h('b', String(sahifeNo))]) : null);

  function sonucEl(s) {
    const q = S.q;
    const li = h('li.as-sonuc', { dataset: { tur: s.tur } });
    if (s.tur === 'madde') {
      li.append(
        h('h3.as-sonuc-bas', h('a.as-bag', { href: maddeYolu(s.kisim, s.no, q) },
          h('span.as-no', `${roma(s.kisim)}·${s.no}`),
          h('span.as-ad', vurguluMetin(s.baslik, s.baslikVurgulari, { bicim: ad })))),
        h('p.as-kunye.kunye', h('span.as-kunye-kisim', kisimAdi(s.kisim)), h('span', 'sahîfe ', sahife(s.sahife, s.sahifeBitis)),
          h('span', s.eslesmeSayisi ? `${sayi(s.eslesmeSayisi)} yerde geçiyor` : 'yalnız başlıkta geçiyor')),
        h('.as-kesitler', kesitler(s)));
    } else if (s.tur === 'lugat') {
      li.append(
        h('h3.as-sonuc-bas', h('a.as-bag', { href: `/sozluk#sozluk-entry-${s.kimlik}` },
          h('span.as-ad.as-terim', vurguluMetin(s.baslik, s.baslikVurgulari, { bicim: ad })))),
        h('p.as-kunye.kunye', h('span', 'Dinî lügat'), s.eslesmeSayisi > 1 ? h('span', `${sayi(s.eslesmeSayisi)} yerde geçiyor`) : null),
        h('.as-kesitler', kesitler(s)));
    } else if (s.tur === 'sahis') {
      li.append(
        h('h3.as-sonuc-bas', h('a.as-bag', { href: `/sahis/${encodeURIComponent(s.kimlik)}` },
          h('span.as-ad', vurguluMetin(s.baslik, s.baslikVurgulari, { bicim: ad }), s.unvan ? h('i.as-unvan', ' ' + s.unvan) : null))),
        h('p.as-kunye.kunye', h('span', 'Hâl tercemesi'), s.eslesmeSayisi > 1 ? h('span', `${sayi(s.eslesmeSayisi)} yerde geçiyor`) : null),
        h('.as-kesitler', kesitler(s)));
    } else if (s.tur === 'hukum') {
      const turler = (s.hukumTurleri || []).map(t => h('span.etiket', HUKUM_AD[t] || t));
      li.append(
        h('p.as-kunye.kunye', turler.length ? h('span.as-hukum-tur', turler) : null, s.sahife ? pdfBag(s.sahife) : null),
        h('.as-kesitler.as-hukum', kesitler(s)),
        s.kisim ? h('p.as-hukum-madde', h('a.as-bag.as-bag-kucuk', { href: maddeYolu(s.kisim, s.no, q) },
          h('span.as-no', `${roma(s.kisim)}·${s.no}`), h('span.as-ad', ad(s.baslik || kisimAdi(s.kisim))))) : null);
    } else if (s.tur === 'tanim') {
      const bag = h('a.as-bag', { href: S.pdf && s.sahife ? `${S.pdf}#page=${Math.min(+s.sahife, 1248)}` : aramaYolu(s.baslik), ...(S.pdf && s.sahife ? { target: '_blank', rel: 'noopener' } : {}) },
        h('span.as-ad', vurguluMetin(s.baslik, s.baslikVurgulari, { bicim: ad })));
      tanimMaddesi(s.kimlik).then(m => {
        const p = m && /^(\d)-(\d+)$/.exec(m);
        if (!p) return;
        bag.setAttribute('href', maddeYolu(p[1], p[2], s.baslik));
        bag.removeAttribute('target'); bag.removeAttribute('rel');
      });
      li.append(
        h('h3.as-sonuc-bas', bag),
        h('p.as-kunye.kunye', h('span', 'Kitabın kendi tanımı'), s.sahife ? h('span', 'sahîfe ', String(s.sahife)) : null),
        h('.as-kesitler', kesitler(s)));
    }
    return li;
  }

  return S;
}
