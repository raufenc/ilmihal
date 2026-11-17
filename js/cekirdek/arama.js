/* Arama: ana iş parçacığındaki ince sarmalayıcı.
   Bütün iş js/isci/arama-isci.js içinde (modül Web Worker) yapılır; Worker yoksa ya da kurulamazsa aynı
   motor ana iş parçacığında, araya nefes payları koyarak çalıştırılır. Ayrıntı: tools/yeni-site/ARAMA.md

   import { arama } from '/js/cekirdek/arama.js';
   const h = await arama.hizli('namaz');                      // { maddeler, lugat, sahislar, tablolar, soru }
   const t = await arama.tam('namaz', { turler: ['madde'], sinyal, parcaGeldi: (sonuclar, ilerleme) => … });
   const o = await arama.oneriler('abdset');                 // { oneriler: […], duzeltilmis }
   const a = await arama.vurguAraliklari(maddeMetni, 'namaz'); // [[bas, son]…] (okuyucuda "bu maddede ara") */

import { vurguAraliklari as araliklar, esAnlamTablosu } from './metin.js';

const ISCI_ADRESI = new URL('../isci/arama-isci.js', import.meta.url);
const VARSAYILAN_KOK = new URL('../../veri-arama/', import.meta.url).href;
const KURULUM_SURESI = 10000;     // Worker 'hazir' demezse ana iş parçacığına geç

let veriKoku = VARSAYILAN_KOK;
let kurulum = null;               // söz: { tur: 'isci', isci } | { tur: 'yerel', motor }
let sayac = 0;
const bekleyenler = new Map();    // no → { coz, red, parcaGeldi }
let etkinTam = null;              // { no, red, iptal() }
let esTablo = null;

function iptalHatasi() {
  try { return new DOMException('Arama iptal edildi', 'AbortError'); } catch (e) {
    const h = new Error('Arama iptal edildi');
    h.name = 'AbortError';
    return h;
  }
}

function hataKur(ileti, ad) {
  if (ad === 'AbortError') return iptalHatasi();
  const h = new Error(ileti || 'Arama hatası');
  if (ad) h.name = ad;
  return h;
}

function hepsiniReddet(hata) {
  for (const b of bekleyenler.values()) b.red(hata);
  bekleyenler.clear();
  etkinTam = null;
}

function iletiIsle(olay) {
  const m = olay.data || {};
  if (m.no === null || m.no === undefined) {
    if (m.tip === 'hata') hepsiniReddet(hataKur('Arama işçisinde hata: ' + m.ileti, m.ad));
    return;
  }
  const b = bekleyenler.get(m.no);
  if (!b) return;                                  // iptal edilmiş isteğin geç gelen iletisi
  if (m.tip === 'parca') {
    if (b.parcaGeldi) { try { b.parcaGeldi(m.sonuclar, m.ilerleme); } catch (h) { console.error('parcaGeldi:', h); } }
    return;
  }
  bekleyenler.delete(m.no);
  if (m.tip === 'sonuc') b.coz(m.veri);
  else b.red(hataKur(m.ileti, m.ad));
}

function isciKur() {
  if (typeof Worker === 'undefined') return Promise.resolve(null);
  let isci;
  try { isci = new Worker(ISCI_ADRESI, { type: 'module' }); } catch (e) { return Promise.resolve(null); }
  return new Promise(coz => {
    const bitir = sonuc => { clearTimeout(zaman); coz(sonuc); };
    const zaman = setTimeout(() => { isci.terminate(); bitir(null); }, KURULUM_SURESI);
    isci.onmessage = olay => {
      if (!olay.data || olay.data.tip !== 'hazir') return;
      isci.onmessage = iletiIsle;
      isci.onerror = olay2 => {                    // kurulduktan sonra çökerse: bekleyenler hata alır, sonra yerele geç
        if (olay2.preventDefault) olay2.preventDefault();
        isci.terminate();
        kurulum = null;
        hepsiniReddet(new Error('Arama işçisi çöktü: ' + (olay2.message || 'bilinmeyen hata')));
      };
      isci.onmessageerror = () => hepsiniReddet(new Error('Arama işçisinden okunamayan ileti geldi'));
      isci.postMessage({ tip: 'kur', no: -1, veriKoku });
      bitir({ tur: 'isci', isci });
    };
    isci.onerror = olay => {                       // modül işçisi desteklenmiyor ya da dosya yüklenemedi
      if (olay.preventDefault) olay.preventDefault();
      isci.terminate();
      bitir(null);
    };
  });
}

function nefes() {
  if (typeof scheduler !== 'undefined' && scheduler.yield) return scheduler.yield();
  return new Promise(r => setTimeout(r, 0));
}

async function yerelKur() {
  const { motorKur } = await import(ISCI_ADRESI.href);
  return { tur: 'yerel', motor: motorKur({ veriKoku, bekle: nefes }) };
}

function kur() {
  if (!kurulum) {
    kurulum = isciKur().then(s => s || yerelKur());
    kurulum.catch(() => { kurulum = null; });
  }
  return kurulum;
}

/** Tek cevaplı istek (hizli, oneriler, hazirla). */
async function istek(tip, veri) {
  const k = await kur();
  if (k.tur === 'yerel') {
    if (tip === 'hizli') return k.motor.hizli(veri.sorgu, veri.secenek);
    if (tip === 'oneriler') return k.motor.oneriler(veri.sorgu);
    return k.motor.hazirla();
  }
  const no = ++sayac;
  return new Promise((coz, red) => {
    bekleyenler.set(no, { coz, red });
    k.isci.postMessage({ tip, no, ...veri });
  });
}

async function esTablosuAl() {
  if (!esTablo) {
    const h = await arama.hazirla();
    esTablo = esAnlamTablosu(h.esAnlamlilar || {});
  }
  return esTablo;
}

export const arama = {
  /** Veri klasörünü değiştirir (varsayılan: sitenin kökündeki veri-arama/). İlk istekten önce çağrılmalı. */
  ayarla({ veriKoku: kok } = {}) {
    if (kok) veriKoku = new URL(kok, typeof location !== 'undefined' ? location.href : VARSAYILAN_KOK).href;
  },

  /** Küçük dizini önceden indirir; { surum, toplam: {madde, lugat, …}, esAnlamlilar } döndürür. */
  hazirla() {
    return istek('hazirla', {});
  },

  /** Yazarken: başlıklar, lügat/tanım terimleri, şahıs adları, tablolar, soru→madde. */
  hizli(sorgu, { sinir = 5 } = {}) {
    return istek('hizli', { sorgu: String(sorgu || ''), secenek: { sinir } });
  },

  /** Tam metin. turler: 'madde' | 'lugat' | 'tanim' | 'sahis' | 'hukum' (yalnız istenenlerin parçaları iner).
      parcaGeldi(sonuclar, ilerleme): her parça işlenince, o ana kadarki SIRALI sonuç listesiyle çağrılır.
      Yeni bir tam() öncekini AbortError ile bitirir; sinyal (AbortSignal) ile de iptal edilebilir. */
  async tam(sorgu, { turler = ['madde'], kisim = null, sinir = 50, kesitSayisi = 3, sinyal = null, parcaGeldi = null } = {}) {
    if (sinyal && sinyal.aborted) throw iptalHatasi();
    if (etkinTam) etkinTam.iptal();
    const no = ++sayac;
    let erkenIptal = false;                        // kurulum beklenirken gelen iptal / yeni sorgu
    const yer = { no, iptal: () => { erkenIptal = true; } };
    etkinTam = yer;
    const k = await kur();
    if (erkenIptal || (sinyal && sinyal.aborted)) {
      if (etkinTam === yer) etkinTam = null;
      throw iptalHatasi();
    }
    const secenek = { turler, kisim, sinir, kesitSayisi };
    return new Promise((coz, red) => {
      let bitti = false;
      const bitir = (f, x) => {
        if (bitti) return;
        bitti = true;
        if (etkinTam && etkinTam.no === no) etkinTam = null;
        if (sinyal) sinyal.removeEventListener('abort', iptal);
        bekleyenler.delete(no);
        f(x);
      };
      let yerelIptal = false;
      const iptal = () => {
        if (k.tur === 'isci') k.isci.postMessage({ tip: 'iptal', hedef: no });
        yerelIptal = true;
        bitir(red, iptalHatasi());
      };
      yer.iptal = iptal;
      if (sinyal) sinyal.addEventListener('abort', iptal);
      if (k.tur === 'isci') {
        bekleyenler.set(no, { coz: x => bitir(coz, x), red: h => bitir(red, h), parcaGeldi: (s, i) => { if (!bitti && parcaGeldi) parcaGeldi(s, i); } });
        k.isci.postMessage({ tip: 'tam', no, sorgu: String(sorgu || ''), secenek });
      } else {
        k.motor.tam(String(sorgu || ''), secenek, {
          iptalMi: () => yerelIptal,
          parca: (s, i) => { if (!bitti && parcaGeldi) { try { parcaGeldi(s, i); } catch (h) { console.error('parcaGeldi:', h); } } },
        }).then(x => bitir(coz, x), h => bitir(red, h));
      }
    });
  },

  /** "Bunu mu demek istediniz": { oneriler: [{tur: 'yazim'|'duzeltme'|'esanlam', kelime, oneri, aciklama}], duzeltilmis } */
  oneriler(sorgu) {
    return istek('oneriler', { sorgu: String(sorgu || '') });
  },

  /** Okuyucuda "bu maddede ara" ve aramadan gelince vurgu: asıl metindeki [[bas, son]…].
      Eş anlamlılar da vurgulanır (dizin yüklenemezse yalnız yazım varyantlarıyla). */
  async vurguAraliklari(metin, sorgu) {
    let tablo = null;
    try { tablo = await esTablosuAl(); } catch (e) { tablo = null; }
    return araliklar(metin, sorgu, { esAnlamlilar: tablo });
  },

  /** Hangi kipte çalışıyor: 'isci' | 'yerel' | null (henüz kurulmadı). Sınama ve tanı için. */
  async kip() {
    const k = await kur();
    return k.tur;
  },
};
