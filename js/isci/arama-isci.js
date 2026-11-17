/* Arama işçisi (modül Web Worker): new Worker(new URL('../isci/arama-isci.js', import.meta.url), {type: 'module'})
   - Dizin parçalarını (veri-arama/) kendisi indirir, sorguları çalıştırır, tam metin sonuçlarını parça parça yollar.
   - Aynı dosya ana iş parçacığında da içe aktarılabilir (Worker kurulamazsa geri dönüş): motorKur() dışa açıktır,
     ileti dinleyicisi yalnız gerçekten bir işçi bağlamında çalışılıyorsa kurulur.
   - İleti sözleşmesi ve sonuç nesneleri: tools/yeni-site/ARAMA.md */

import {
  duzle, duzleEslemeli, asilAralik, sorguCoz, terimEslesmeleri, araliklariBirlestir, kesit,
  esAnlamTablosu, anahtarBicimi, uzaklik, varyantlar,
} from '../cekirdek/metin.js';

const TUR_SIRASI = ['madde', 'lugat', 'tanim', 'sahis', 'hukum'];
const K1 = 1.2, B = 0.75;
const DILIM_MS = 8;
const KISA_KAYIT = 420;                    // bundan kısa lügat/tanım/hüküm/şahıs metni kesilmeden gösterilir                         // bu kadar çalışınca araya gir (iletiler ve arayüz nefes alsın)

// Ek ağırlığı: "hac" sorgusu "hacca"yı (hac + ek) tam sayar, "hâcet"i (başka kelime) az sayar.
// Kısa kelimelerde yalnız isim çekim ekleri; uzunlarda yapım ve fiil ekleri de kabul edilir.
const DAR_EKLER = new Set(('i u a e in un nin nun ni nu na ne ya ye yi yu da de ta te dan den tan ten nda nde ndan nden ' +
  'la le yla yle lar ler si su sin sun im um iz uz imiz umuz iniz unuz miz muz niz nuz dir dur tir tur ki daki deki ' +
  'ndaki ndeki taki teki ca ce ken yken').split(' '));
const GENIS_EKLER = new Set([...DAR_EKLER, ...('li lu siz suz lik luk ci cu ma me mak mek dik duk tik tuk mis mus di du ' +
  'ti tu ir ur ar er iyor uyor yor acak ecek arak erek ip up sa se meli mali il ul is us nci ncu inci uncu cik cuk lari ' +
  'leri ici ucu me ma mez maz an en yan yen dig dug tig tug digi dugu sel sal').split(' ')]);

function ekCozulur(kalan, kume, derinlik = 0) {
  if (!kalan) return true;
  if (derinlik >= 4) return false;
  for (let i = Math.min(5, kalan.length); i >= 1; i--) {
    if (kume.has(kalan.slice(0, i)) && ekCozulur(kalan.slice(i), kume, derinlik + 1)) return true;
  }
  return false;
}

function ekAgirligi(duz, [s, e, k]) {
  if (k === undefined || k >= e) return 1;
  const kok = k - s;
  const kalan = duz.slice(k, e);
  if (kok >= 5) return ekCozulur(kalan, GENIS_EKLER) ? 1 : 0.6;
  return ekCozulur(kalan, DAR_EKLER) ? 1 : 0.3;
}

function iptalHatasi() {
  const h = new Error('Arama iptal edildi');
  h.name = 'AbortError';
  return h;
}

/** Arama motoru. veriKoku: veri-arama/ klasörünün adresi (sonu '/').
    yukle(ad, ozet): isteğe bağlı; JSON nesnesine çözülen söz döndürür (sınamada dosyadan okumak için).
    bekle(): araya girme işlevi (işçide setTimeout 0; ana iş parçacığında scheduler.yield). */
export function motorKur({ veriKoku = '/veri-arama/', yukle = null, bekle = null } = {}) {
  const ara = bekle || (() => new Promise(r => setTimeout(r, 0)));
  const getir = yukle || (async (ad, ozet) => {
    const kok = new URL(veriKoku, typeof location !== 'undefined' ? location.href : 'http://yerel/');
    const adres = new URL(ad + (ozet ? '?v=' + ozet : ''), kok);
    let cevap;
    try { cevap = await fetch(adres); } catch (e) { throw new Error(`Arama verisi indirilemedi (${ad}): ağ hatası`); }
    if (!cevap.ok) throw new Error(`Arama verisi indirilemedi (${ad}): HTTP ${cevap.status}`);
    try { return await cevap.json(); } catch (e) { throw new Error(`Arama verisi bozuk (${ad})`); }
  });
  async function getirTekrarli(ad, ozet) {
    try { return await getir(ad, ozet); } catch (e) { return getir(ad, ozet); }   // bir kez daha dene
  }

  let hizliSoz = null;          // hızlı dizin (hizli.json) — bir kez
  let oneriSoz = null;          // öneri sözcükleri (oneri.json) — yalnız öneriler istenince
  const parcaSozleri = new Map();   // ad → söz(hazırlanmış parça)

  // ------------------------------------------------------------ hızlı dizin

  function hizliHazirla(v) {
    const kayit = (baslik, ek) => ({ baslik, duz: duzle(baslik), ...ek });
    const d = {
      surum: v.surum,
      ortalamaUzunluk: v.ortalamaUzunluk,
      parcalar: v.parcalar,
      oneri: v.oneri,
      esHam: v.esAnlamlilar || {},
      es: esAnlamTablosu(v.esAnlamlilar || {}),
      maddeler: v.maddeler.map(([kisim, no, baslik, sahife, sahifeBitis, uzunluk]) =>
        kayit(baslik, { tur: 'madde', kimlik: kisim + '/' + no, kisim, no, sahife, sahifeBitis, uzunluk })),
      lugat: v.lugat.map(([i, k]) => kayit(k, { tur: 'lugat', kimlik: i })),
      tanimlar: v.tanimlar.map(([i, t, s]) => kayit(t, { tur: 'tanim', kimlik: i, sahife: s })),
      sahislar: v.sahislar.map(([slug, isim, unvan]) => kayit(isim, { tur: 'sahis', kimlik: slug, unvan })),
      tablolar: v.tablolar.map(([id, baslik, kaynak, sahife]) =>
        kayit(baslik, { tur: 'tablo', kimlik: id, kisim: kaynak ? kaynak[0] : null, no: kaynak ? kaynak[1] : null, sahife })),
      sorular: v.sorular.map(([sorular, kisim, no, cevapOzet]) => ({ sorular: sorular.map(anahtarBicimi), kisim, no, cevapOzet })),
    };
    d.maddeHaritasi = new Map(d.maddeler.map(m => [m.kimlik, m]));
    // Bulanık eşleşme için başlık sözcükleri (tire ayrılmış ve birleşik biçimleriyle).
    const sozluk = new Set();
    for (const liste of [d.maddeler, d.lugat, d.tanimlar, d.sahislar, d.tablolar]) {
      for (const x of liste) {
        x.bitisik = x.duz.replace(/-/g, '');
        for (const w of x.duz.split(/[ -]/)) if (w.length >= 3) sozluk.add(w);
        for (const w of x.bitisik.split(' ')) if (w.length >= 3) sozluk.add(w);
      }
    }
    d.sozluk = [...sozluk];
    d.sozlukDuz = d.sozluk.join(' ');
    d.toplam = {};
    for (const tur of TUR_SIRASI) d.toplam[tur] = (d.parcalar[tur] || []).reduce((t, p) => t + p.sayi, 0);
    return d;
  }

  function hazirla() {
    if (!hizliSoz) {
      hizliSoz = getirTekrarli('hizli.json', null).then(hizliHazirla);
      hizliSoz.catch(() => { hizliSoz = null; });      // sonraki istekte yeniden dene
    }
    return hizliSoz;
  }

  /** Başlıkta (kısa metin) bir seçeneğin bütün terimleri geçiyor mu; geçiyorsa puan ve düz aralıklar. */
  function baslikEslestir(duz, secenek, bulanik) {
    let puan = 0;
    const araliklar = [];
    for (let j = 0; j < secenek.length; j++) {
      let es = terimEslesmeleri(duz, secenek[j], 4);
      let carpan = 1;
      if (!es.length && bulanik[j]) { es = terimEslesmeleri(duz, bulanik[j], 4); carpan = 0.45; }
      if (!es.length) return null;
      const [s, e] = es[0];
      let p = 10;
      if (s === 0) p += j === 0 ? 8 : 3;
      if (e - s <= secenek[j].gosterim.length + 1) p += 4;         // ek almamış (tam kelime)
      const yazilan = secenek[j].gosterim;
      if (carpan === 1 && duz.slice(s, e).replace(/-/g, '').startsWith(yazilan.replace(/-/g, ''))) p += 3;   // kullanıcının yazdığı biçim
      puan += p * carpan;
      for (const a of es) araliklar.push(a);
    }
    return { puan, araliklar };
  }

  function bulanikTerimler(d, secenek) {
    return secenek.map(t => {
      if (t.tur !== 'kelime') return null;
      if (terimEslesmeleri(d.sozlukDuz, t, 1).length) return null;   // dizinde zaten geçiyor: yazım hatası değil
      const w = t.gosterim.replace(/-/g, '');
      if (w.length < 4) return null;
      const sinir = w.length <= 5 ? 1 : 2;
      const yakin = [];
      for (const s of d.sozluk) {
        if (s[0] !== w[0] || Math.abs(s.length - w.length) > sinir) continue;
        if (uzaklik(w, s, sinir) <= sinir) yakin.push(s);
        if (yakin.length >= 12) break;
      }
      if (!yakin.length) return null;
      return { tur: 'bulanik', gosterim: w, desen: '(?:^|[ \\-])((?:' + yakin.join('|') + ')(?=[ \\-]|$))' };
    });
  }

  function hizliListe(liste, cozum, bulaniklar, sinir, tekilBaslik) {
    const anahtar = anahtarBicimi(cozum.ham);
    const adaylar = [];
    for (const x of liste) {
      let en = null;
      cozum.secenekler.forEach((secenek, si) => {
        for (const duz of x.bitisik !== x.duz ? [x.duz, x.bitisik] : [x.duz]) {
          const r = baslikEslestir(duz, secenek, si === 0 ? bulaniklar : []);
          if (r && (!en || r.puan > en.puan)) en = { ...r, duz };
        }
      });
      if (!en) continue;
      let puan = en.puan;
      const xa = anahtarBicimi(x.baslik);
      if (xa === anahtar) puan += 100;
      else if (xa.startsWith(anahtar + ' ')) puan += 25;
      puan -= Math.min(10, x.duz.length / 25);
      adaylar.push({ x, puan, duz: en.duz, araliklar: en.araliklar });
    }
    adaylar.sort((a, b) => b.puan - a.puan || a.x.duz.length - b.x.duz.length);
    const sonuc = [];
    const gorulen = new Set();
    for (const a of adaylar) {
      if (sonuc.length >= sinir) break;
      if (tekilBaslik) { if (gorulen.has(a.x.duz)) continue; gorulen.add(a.x.duz); }
      const araliklar = a.duz === a.x.duz ? a.araliklar : bitisiktenTireliye(a.x.duz, a.araliklar);
      const vurgular = baslikVurgulari(a.x.baslik, araliklar);
      const { duz, bitisik, ...gorunen } = a.x;
      sonuc.push({ ...gorunen, puan: Math.round(a.puan * 10) / 10, vurgular });
    }
    return sonuc;
  }

  /** Tiresi silinmiş düz metindeki aralıkları tireli düz metne taşır. */
  function bitisiktenTireliye(duz, araliklar) {
    const harita = [];
    for (let i = 0; i < duz.length; i++) if (duz[i] !== '-') harita.push(i);
    harita.push(duz.length);
    return araliklar.map(([s, e]) => [harita[s], harita[e - 1] + 1]);
  }

  function baslikVurgulari(baslik, araliklar) {
    if (!araliklar.length) return [];
    const { konum } = duzleEslemeli(baslik);
    return araliklariBirlestir(araliklar.map(([s, e]) => asilAralik(baslik, konum, s, e)));
  }

  /** Soru → madde (eski findDirectMatch'in taşıması; anahtar biçimiyle). */
  function soruBul(d, cozum) {
    const norm = anahtarBicimi(cozum.ham);
    if (!norm) return [];
    const kelimeler = norm.split(' ').filter(w => w.length >= 2);
    const soruGibi = cozum.ham.includes('?') || kelimeler.length >= 3 || (kelimeler.length >= 2 && kelimeler.length > cozum.kelimeler.length);
    const adaylar = [];
    for (const e of d.sorular) {
      let en = 0, enSoru = null;
      for (const s of e.sorular) {
        if (!(norm === s || norm.includes(s) || s.includes(norm))) continue;
        if (norm !== s && !soruGibi) continue;
        const p = s.length + (norm === s ? 100 : 0);
        if (p > en) { en = p; enSoru = s; }
      }
      if (enSoru) {
        const m = d.maddeHaritasi.get(e.kisim + '/' + e.no);
        adaylar.push({ kisim: e.kisim, no: e.no, kimlik: e.kisim + '/' + e.no, baslik: m ? m.baslik : '', cevapOzet: e.cevapOzet, soru: enSoru, tam: norm === enSoru, puan: en });
      }
    }
    return adaylar.sort((a, b) => b.puan - a.puan).slice(0, 3);
  }

  async function hizli(sorgu, { sinir = 5 } = {}) {
    const d = await hazirla();
    const t0 = simdi();
    const cozum = sorguCoz(sorgu, { esAnlamlilar: d.es });
    const bos = { maddeler: [], lugat: [], sahislar: [], tablolar: [], soru: [] };
    if (!cozum.secenekler.length) return { ...bos, sure: 0 };
    const bulaniklar = bulanikTerimler(d, cozum.secenekler[0]);
    const lugat = hizliListe(d.lugat.concat(d.tanimlar), cozum, bulaniklar, sinir, true);
    return {
      maddeler: hizliListe(d.maddeler, cozum, bulaniklar, sinir, false),
      lugat,
      sahislar: hizliListe(d.sahislar, cozum, bulaniklar, sinir, false),
      tablolar: hizliListe(d.tablolar, cozum, bulaniklar, sinir, false),
      soru: soruBul(d, cozum),
      sure: Math.round((simdi() - t0) * 10) / 10,
    };
  }

  // ------------------------------------------------------------ tam metin

  function belgeKur(tur, k, d) {
    if (tur === 'madde') {
      const [kisim, no, metin] = k;
      const m = d.maddeHaritasi.get(kisim + '/' + no) || {};
      const govde = metin.replace(/⟦(?:şekil|cedvel):\d+⟧/g, x => ' '.repeat(x.length));   // işaretler aranmaz; konum aynı
      return { tur, kimlik: kisim + '/' + no, baslik: m.baslik || '', kisim, no, sahife: m.sahife, sahifeBitis: m.sahifeBitis, govde };
    }
    if (tur === 'lugat') return { tur, kimlik: k[0], baslik: k[1], govde: k[2] };
    if (tur === 'tanim') return { tur, kimlik: k[0], baslik: k[1], govde: k[2], sahife: k[3] };
    if (tur === 'sahis') return { tur, kimlik: k[0], baslik: k[1], unvan: k[2], govde: k[3] };
    if (tur === 'hukum') {
      const [id, turler, katmanlar, kisim, no, sahife, metin, digerleri] = k;
      const m = kisim ? d.maddeHaritasi.get(kisim + '/' + no) : null;
      return { tur, kimlik: id, baslik: m ? m.baslik : '', baslikAranmaz: true, hukumTurleri: turler, katmanlar, kisim, no, sahife, digerKimlikler: digerleri, govde: metin };
    }
    throw new Error('Bilinmeyen tür: ' + tur);
  }

  async function parcaAl(p, d) {
    if (!parcaSozleri.has(p.ad)) {
      const soz = getirTekrarli(p.ad, p.ozet).then(async ham => {
        const belgeler = ham.kayitlar.map(k => belgeKur(ham.tur || p.tur, k, d));
        const duzler = [];
        let t = simdi();
        for (const b of belgeler) {
          const x = duzle(b.govde);
          duzler.push(x);
          b.uzunluk = x.length;
          b.baslikDuz = b.baslikAranmaz ? '' : duzle(b.baslik);
          if (simdi() - t > DILIM_MS) { await ara(); t = simdi(); }
        }
        const baslar = new Int32Array(belgeler.length);
        let konum = 0;
        duzler.forEach((x, i) => { baslar[i] = konum; konum += x.length + 2; });
        return { tur: ham.tur || p.tur, belgeler, duz: duzler.join('\u0001 '), baslar };
      });
      soz.catch(() => parcaSozleri.delete(p.ad));
      parcaSozleri.set(p.ad, soz);
    }
    return parcaSozleri.get(p.ad);
  }

  /** Terimlerin her birinden birer eşleşmeyi kapsayan en dar pencere (düz konumlarıyla). */
  function enDarPencere(listeler) {
    const n = listeler.length;
    const imlec = new Array(n).fill(0);
    let en = null;
    for (;;) {
      let enAzI = -1, enAz = Infinity, enCok = -Infinity;
      for (let j = 0; j < n; j++) {
        const a = listeler[j][imlec[j]];
        if (a[0] < enAz) { enAz = a[0]; enAzI = j; }
        if (a[1] > enCok) enCok = a[1];
      }
      if (!en || enCok - enAz < en[1] - en[0]) en = [enAz, enCok];
      if (++imlec[enAzI] >= listeler[enAzI].length) break;
    }
    return en;
  }

  function kesitlerKur(b, eslesmeler, pencere, adet, tur) {
    if (!adet) return [];
    if (!eslesmeler.length) return [kesit(b.govde, [0, 0], { once: 0, sonra: tur === 'madde' ? 200 : 260, vurgular: [] })];   // yalnız başlıkta: metnin başı
    const { konum } = duzleEslemeli(b.govde);
    const tumu = eslesmeler.slice().sort((x, y) => x[0] - y[0]);
    // Kısa kayıt (lügat mânâsı, tanım, hüküm cümlesi): bütünü tek kesit; yoksa cümle sınırı yalnız eşleşmenin
    // bulunduğu son cümleyi bırakabiliyordu ("ABDEST" → "… Vüdû’.").
    if (tur !== 'madde' && b.govde.length <= KISA_KAYIT) {
      const asilHepsi = araliklariBirlestir(tumu.map(([s, e]) => asilAralik(b.govde, konum, s, e)));
      return [kesit(b.govde, [0, b.govde.length], { once: 0, sonra: 0, vurgular: asilHepsi })];
    }
    const once = tur === 'madde' ? 70 : 90, sonra = tur === 'madde' ? 160 : 220;
    let merkez = pencere;
    if (!merkez) {                                       // tek terim: en yoğun 250 harflik bölge
      let enI = 0, enSay = 0, j = 0;
      for (let i = 0; i < tumu.length; i++) {
        while (tumu[j][0] < tumu[i][0] - 250) j++;
        if (i - j + 1 > enSay) { enSay = i - j + 1; enI = j; }
      }
      merkez = [tumu[enI][0], tumu[enI][1]];
    }
    const asil = tumu.map(([s, e]) => asilAralik(b.govde, konum, s, e));
    const kesitler = [];
    const ortu = [];
    const ekle = (s, e) => {
      const ar = asilAralik(b.govde, konum, s, e);
      const k = kesit(b.govde, ar, { once, sonra, vurgular: asil });
      kesitler.push(k);
      ortu.push([k.bas, k.son]);
    };
    ekle(merkez[0], merkez[1]);
    for (let i = 0; i < tumu.length && kesitler.length < adet; i++) {
      const [ab] = asil[i];
      if (ortu.some(([o1, o2]) => ab >= o1 - 40 && ab < o2 + 40)) continue;
      ekle(tumu[i][0], tumu[i][1]);
    }
    return kesitler;
  }

  /** Bir belgenin bir seçenekle istatistiği (puan sonradan, df bilindikçe hesaplanır). */
  function belgeIstatistigi(b, secenek, isabetler) {
    const tf = [], baslikta = [];
    for (let j = 0; j < secenek.length; j++) {
      tf.push(isabetler[j].reduce((t, x) => t + x[2], 0));        // eke göre ağırlıklı sayım
      baslikta.push(!!b.baslikDuz && terimEslesmeleri(b.baslikDuz, secenek[j], 1).length > 0);
      if (!tf[j] && !baslikta[j]) return null;
    }
    const dolu = isabetler.filter(l => l.length);
    const pencere = secenek.length > 1 && dolu.length === secenek.length ? enDarPencere(isabetler) : null;
    return { tf, baslikta, pencere };
  }

  function puanla(ist, secenek, df, N, ortUz, b, anahtar) {
    let puan = 0, idfToplam = 0;
    for (let j = 0; j < secenek.length; j++) {
      const idf = Math.log(1 + (N - df[j] + 0.5) / (df[j] + 0.5));
      idfToplam += idf;
      const tf = ist.tf[j];
      if (tf) puan += idf * (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * b.uzunluk / (ortUz || 1)));
      if (ist.baslikta[j]) puan += idf * 1.5;
    }
    if (ist.pencere) {
      const genislik = ist.pencere[1] - ist.pencere[0];
      const enKisa = secenek.reduce((t, x) => t + x.gosterim.length + 1, 0);
      puan += idfToplam * 2 * Math.min(1, 40 / Math.max(1, genislik - enKisa + 10));
    }
    // Kademe (başlık): 3 = başlık sorgunun kendisi; 2 = bütün terimler başlıkta harfiyen (yazım varyantı dahil),
    // ilki başta; 1 = harfiyen ama başta değil; 0,5 = başlıkta ancak eş anlamlısıyla; 0 = yalnız metinde.
    let kademe = 0;
    if (ist.baslikta.every(Boolean)) {
      const harfiyen = secenek.map(t => !!t.yazim && terimEslesmeleri(b.baslikDuz, t.yazim, 1));
      if (harfiyen.every(x => x && x.length)) {
        kademe = harfiyen[0][0][0] === 0 ? 2 : 1;
        if (anahtarBicimi(b.baslik) === anahtar) kademe = 3;
      } else kademe = 0.5;
      // Aynı kademede, başlığın büyük kısmı sorgudan ibaret olan önce ("Namaz" > "Namazın şartları").
      const kapsam = secenek.reduce((t, x) => t + x.gosterim.length, 0) / Math.max(1, b.baslikDuz.length);
      puan += 40 * Math.min(1, kapsam);
    }
    return { puan: kademe * 100 + puan, kademe };
  }

  async function tam(sorgu, secenekler = {}, { iptalMi = () => false, parca = null } = {}) {
    const { turler = ['madde'], kisim = null, sinir = 50, kesitSayisi = 3 } = secenekler;
    const t0 = simdi();
    const d = await hazirla();
    if (iptalMi()) throw iptalHatasi();
    const cozum = sorguCoz(sorgu, { esAnlamlilar: d.es });
    const istenen = TUR_SIRASI.filter(t => turler.includes(t));
    const sonucBos = { sonuclar: [], toplam: {}, eslesmeToplami: 0, sure: 0, hatalar: [], kelimeler: cozum.kelimeler };
    if (!cozum.secenekler.length || !istenen.length) return sonucBos;
    const anahtar = anahtarBicimi(cozum.ham);
    const isler = [];
    for (const tur of istenen) {
      for (const p of d.parcalar[tur] || []) {
        if (kisim && tur === 'madde' && p.kisim !== kisim) continue;
        isler.push({ ...p, tur });
      }
    }
    // tür → { birikim: Map(kimlik → kayıt), df: [[…]], uzunlukToplam, belgeSayisi }
    const durum = {};
    for (const tur of istenen) {
      durum[tur] = { birikim: new Map(), df: cozum.secenekler.map(s => s.map(() => 0)), uz: 0, say: 0 };
    }
    const hatalar = [];
    let yuklenen = 0;

    const siraliSonuclar = () => {
      const liste = [];
      for (const tur of istenen) {
        const du = durum[tur];
        const N = d.toplam[tur] || du.say || 1;
        const ortUz = tur === 'madde' ? d.ortalamaUzunluk : (du.uz / (du.say || 1));
        const turListe = [];
        for (const k of du.birikim.values()) {
          let en = null;
          k.istler.forEach((ist, si) => {
            if (!ist) return;
            const p = puanla(ist, cozum.secenekler[si], du.df[si], N, ortUz, k.belge, anahtar);
            if (!en || p.puan > en.puan) en = p;
          });
          k.sonuc.puan = Math.round(en.puan * 100) / 100;
          turListe.push(k.sonuc);
        }
        turListe.sort((a, b) => b.puan - a.puan || (a.kisim || 0) - (b.kisim || 0) || (a.no || 0) - (b.no || 0));
        liste.push(...turListe.slice(0, sinir));
      }
      return liste;
    };

    async function isle(p) {
      const du = durum[p.tur];
      const terimIsabetleri = cozum.secenekler.map(secenek => secenek.map(terim => {
        const kova = new Map();                 // belge sırası → [[s, e]…] (belge içi konum)
        const es = terimEslesmeleri(p.duz, terim);
        let bi = 0;
        for (const [s, e, k] of es) {
          while (bi + 1 < p.baslar.length && p.baslar[bi + 1] <= s) bi++;
          const bas = p.baslar[bi];
          let l = kova.get(bi);
          if (!l) kova.set(bi, l = []);
          l.push([s - bas, e - bas, ekAgirligi(p.duz, [s, e, k])]);
        }
        return kova;
      }));
      let t = simdi();
      for (let bi = 0; bi < p.belgeler.length; bi++) {
        const b = p.belgeler[bi];
        if (kisim && (p.tur === 'madde' || p.tur === 'hukum') && b.kisim !== kisim) continue;
        du.uz += b.uzunluk; du.say++;
        const istler = [];
        let eslesme = null, enIst = -1;
        cozum.secenekler.forEach((secenek, si) => {
          const isabetler = secenek.map((_, j) => terimIsabetleri[si][j].get(bi) || []);
          const ist = belgeIstatistigi(b, secenek, isabetler);
          istler.push(ist);
          if (!ist) return;
          secenek.forEach((_, j) => { if (ist.tf[j] || ist.baslikta[j]) du.df[si][j]++; });
          const toplam = isabetler.reduce((a, l) => a + l.length, 0);
          if (enIst < 0 || toplam > eslesme.toplam) { enIst = si; eslesme = { toplam, isabetler, pencere: ist.pencere }; }
        });
        if (enIst < 0) continue;
        const tumIsabetler = [].concat(...eslesme.isabetler);
        const sonuc = {
          tur: b.tur, kimlik: b.kimlik, baslik: b.baslik,
          kisim: b.kisim ?? null, no: b.no ?? null, sahife: b.sahife ?? null,
          puan: 0,
          kesitler: kesitlerKur(b, tumIsabetler, eslesme.pencere, kesitSayisi, b.tur),
          eslesmeSayisi: eslesme.toplam,
          baslikVurgulari: b.baslikAranmaz ? [] : vurgularBaslikta(b.baslik, cozum),
        };
        if (b.tur === 'madde') sonuc.sahifeBitis = b.sahifeBitis;
        if (b.tur === 'sahis') sonuc.unvan = b.unvan;
        if (b.tur === 'hukum') Object.assign(sonuc, { hukumTurleri: b.hukumTurleri, katmanlar: b.katmanlar, digerKimlikler: b.digerKimlikler });
        du.birikim.set(b.kimlik, { belge: b, istler, sonuc });
        if (simdi() - t > DILIM_MS) {
          await ara(); t = simdi();
          if (iptalMi()) throw iptalHatasi();
        }
      }
    }

    // Parçalar en çok 3'er 3'er indirilir; hangisi önce gelirse önce işlenir.
    const bekleyen = isler.slice();
    const tamam = [];
    let yolda = 0, uyandir = null;
    const baslat = () => {
      while (yolda < 3 && bekleyen.length) {
        const is = bekleyen.shift();
        yolda++;
        parcaAl(is, d).then(p => ({ is, p }), hata => ({ is, hata })).then(x => {
          yolda--;
          tamam.push(x);
          if (uyandir) { const u = uyandir; uyandir = null; u(); }
        });
      }
    };
    baslat();
    for (let islenen = 0; islenen < isler.length; islenen++) {
      if (!tamam.length) await new Promise(r => { uyandir = r; });
      const { is, p, hata } = tamam.shift();
      baslat();
      if (iptalMi()) throw iptalHatasi();
      if (hata) { hatalar.push({ parca: is.ad, ileti: String(hata.message || hata) }); continue; }
      await isle(p);
      yuklenen++;
      if (iptalMi()) throw iptalHatasi();
      if (parca) parca(siraliSonuclar(), { yuklenen, toplam: isler.length, parca: is.ad, tur: is.tur, sure: Math.round(simdi() - t0) });
      await ara();
    }
    if (hatalar.length && hatalar.length === isler.length) {
      throw new Error('Arama verisi indirilemedi: ' + hatalar.map(h => h.ileti).join('; '));
    }
    const toplam = {};
    let eslesmeToplami = 0;
    for (const tur of istenen) {
      toplam[tur] = durum[tur].birikim.size;
      for (const k of durum[tur].birikim.values()) eslesmeToplami += k.sonuc.eslesmeSayisi;
    }
    return { sonuclar: siraliSonuclar(), toplam, eslesmeToplami, sure: Math.round(simdi() - t0), hatalar, kelimeler: cozum.kelimeler };
  }

  function vurgularBaslikta(baslik, cozum) {
    const araliklar = [];
    const { duz } = duzleEslemeli(baslik);
    for (const s of cozum.secenekler) for (const t of s) for (const a of terimEslesmeleri(duz, t, 10)) araliklar.push(a);
    return baslikVurgulari(baslik, araliklar);
  }

  // ------------------------------------------------------------ öneriler

  async function oneriSozlugu(d) {
    if (!oneriSoz) {
      oneriSoz = getirTekrarli(d.oneri.ad, d.oneri.ozet).then(v => {
        const harita = new Map();
        for (const [w, n, g] of v.sozcukler) harita.set(w, { n, g: g || w });
        const sirali = [...harita.keys()].sort();
        return { harita, sirali };
      });
      oneriSoz.catch(() => { oneriSoz = null; });
    }
    return oneriSoz;
  }

  function onekVarMi(sirali, w) {
    let lo = 0, hi = sirali.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (sirali[m] < w) lo = m + 1; else hi = m; }
    return lo < sirali.length && sirali[lo].startsWith(w);
  }

  /** "Bunu mu demek istediniz": yazım varyantı, eş anlamlı ve yazım hatası düzeltmeleri. */
  async function oneriler(sorgu) {
    const d = await hazirla();
    const o = await oneriSozlugu(d);
    const cozum = sorguCoz(sorgu, { esAnlamlilar: null });
    const liste = [];
    const ilk = cozum.secenekler[0] || [];
    const duzeltilmis = [];
    for (const t of ilk) {
      const w = t.gosterim.replace(/-/g, '');
      let yerine = t.gosterim;
      const kendi = o.harita.get(w);
      const bilinen = kendi || onekVarMi(o.sirali, w);
      // Yazım varyantı: kitapta çok daha sık geçen yazım (namaz → nemâz).
      let enVar = null;
      for (const v of varyantlar(w)) {
        if (v === w || v.length < 3) continue;
        const k = o.harita.get(v);
        if (k && k.n > (kendi ? kendi.n * 2 : 0) && (!enVar || k.n > enVar.n)) enVar = { v, ...k };
      }
      if (enVar) liste.push({ tur: 'yazim', kelime: w, oneri: enVar.g, aciklama: `Kitapta “${enVar.g}” yazımıyla ${enVar.n} kez geçer.` });
      // Yazım hatası: kitapta hiç yoksa en yakın sık kelime.
      if (!bilinen && !enVar && w.length >= 4) {
        const sinir = w.length <= 5 ? 1 : 2;
        let en = null;
        for (const [s, k] of o.harita) {
          if (s[0] !== w[0] || Math.abs(s.length - w.length) > sinir) continue;
          const u = uzaklik(w, s, sinir);
          if (u <= sinir && (!en || u < en.u || (u === en.u && k.n > en.n))) en = { s, u, ...k };
        }
        if (en) { liste.push({ tur: 'duzeltme', kelime: w, oneri: en.g, aciklama: `“${w}” kitapta geçmiyor.` }); yerine = en.g; }
      }
      // Eş anlamlılar
      for (const e of d.es.get(w) || []) {
        if (e !== w && !liste.some(x => x.oneri === e)) liste.push({ tur: 'esanlam', kelime: w, oneri: e, aciklama: 'Eş anlamlı / ilgili terim' });
      }
      duzeltilmis.push(yerine);
    }
    const yeni = duzeltilmis.join(' ');
    return { oneriler: liste.slice(0, 8), duzeltilmis: liste.some(x => x.tur === 'duzeltme') ? yeni : null };
  }

  return {
    hazirla: () => hazirla().then(d => ({ surum: d.surum, toplam: d.toplam, esAnlamlilar: d.esHam })),
    hizli, tam, oneriler,
  };
}

function simdi() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// ------------------------------------------------------------------ işçi bağlamı

const isciMi = typeof self !== 'undefined' && typeof self.postMessage === 'function' &&
  typeof window === 'undefined' && typeof document === 'undefined';

if (isciMi) {
  let motor = motorKur();
  let etkinTam = null;          // { no, iptal: bool }
  const yolla = ileti => { try { self.postMessage(ileti); } catch (e) { self.postMessage({ no: ileti.no, tip: 'hata', ileti: 'Sonuç iletilemedi: ' + e.message }); } };
  const hataYolla = (no, h) => yolla({ no, tip: 'hata', ad: h && h.name || 'Error', ileti: String(h && h.message || h || 'Bilinmeyen hata') });

  self.addEventListener('message', async olay => {
    const m = olay.data || {};
    const no = m.no;
    try {
      if (m.tip === 'kur') {
        motor = motorKur({ veriKoku: m.veriKoku });
        return yolla({ no, tip: 'sonuc', veri: true });
      }
      if (m.tip === 'iptal') {
        if (etkinTam && etkinTam.no === m.hedef) etkinTam.iptal = true;
        return;
      }
      if (m.tip === 'hazirla') return yolla({ no, tip: 'sonuc', veri: await motor.hazirla() });
      if (m.tip === 'hizli') return yolla({ no, tip: 'sonuc', veri: await motor.hizli(m.sorgu, m.secenek || {}) });
      if (m.tip === 'oneriler') return yolla({ no, tip: 'sonuc', veri: await motor.oneriler(m.sorgu) });
      if (m.tip === 'tam') {
        if (etkinTam) etkinTam.iptal = true;               // yeni sorgu öncekini bırakır
        const is = { no, iptal: false };
        etkinTam = is;
        const veri = await motor.tam(m.sorgu, m.secenek || {}, {
          iptalMi: () => is.iptal,
          parca: (sonuclar, ilerleme) => yolla({ no, tip: 'parca', sonuclar, ilerleme }),
        });
        if (etkinTam === is) etkinTam = null;
        return yolla({ no, tip: 'sonuc', veri });
      }
      hataYolla(no, new Error('Bilinmeyen istek: ' + m.tip));
    } catch (h) {
      hataYolla(no, h);
    }
  });
  self.addEventListener('unhandledrejection', o => hataYolla(null, o.reason));
  self.addEventListener('error', o => hataYolla(null, o.error || o.message));
  self.postMessage({ tip: 'hazir' });
}
