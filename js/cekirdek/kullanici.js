/* Kullanıcı verisi katmanı.
   Eski sitenin tarayıcıda bıraktığı 25 localStorage anahtarını AYNI ad ve AYNI değer biçimiyle
   okur ve yazar (bkz. tools/yeni-site/envanter-ozellikler.md §6 ve tools/yeni-site/KULLANICI.md).
   - Bütün okuma/yazma js/cekirdek/depo.js üzerinden yapılır; doğrudan localStorage çağrılmaz.
   - Hiçbir işlev istisna fırlatmaz. Bozuk/eksik kayıt makul varsayılana düşer ve SİLİNMEZ;
     bozuk bir kaydın üstüne yazmak gerekirse eski ham metin önce 'ilmihal-bozuk-kayitlar'a saklanır.
   - Tema anahtarı ('ilmihal-theme') js/cekirdek/tema.js'tedir; burada yalnız yedekte taşınır. */

import { depo } from './depo.js';

/* ---------- Anahtarlar ---------- */

export const ANAHTAR = Object.freeze({
  tema: 'ilmihal-theme',
  yaziBoyutu: 'ilmihal-font-size',
  okumaAyarlari: 'ilmihal-okuma-ayarlari',
  sahifeAcik: 'ilmihal-sahife-acik',
  fihristGizli: 'ilmihal-fihrist-gizli',
  yerImleri: 'ilmihal-bookmarks',
  okunan: 'ilmihal-read',
  gecmis: 'ilmihal-read-history',
  sonOkunan: 'ilmihal-son-okunan',
  notlar: 'ilmihal-notlar',
  vurgular: 'ilmihal-vurgulamalar',
  sesHizi: 'ilmihal-audio-speed',
  sesKonumu: 'ilmihal-audio-pos',
  gunlukHedef: 'ilmihal-daily-goal',
  quizPuani: 'ilmihal-quiz-puan',
  rehber: 'ilmihal-rehber-progress',
  duyuru: 'ilmihal-duyuru-kapatilan',
  hatim: 'ilmihal-hatim',
  bitirilen: 'ilmihal-bitirilen',
  okumaYeri: 'ilmihal-okuma-yeri',
  hatimKutlama: 'ilmihal-hatim-kutlama',
  debug: 'ilmihal-debug',
  buildId: 'ilmihal-build-id',
  onboardingGoruldu: 'ilmihal-onboarding-seen',
  onboardingBitti: 'ilmihal-onboarding-done'
});
/** YENİ anahtar: üstüne yazılmak zorunda kalınan bozuk kayıtların ham metni. { anahtar: [hamMetin, …] } */
export const BOZUK_ANAHTARI = 'ilmihal-bozuk-kayitlar';

/* ---------- Madde kimliği: {kisim, no} ↔ "1/43" ↔ "1-43" ---------- */

/** "1/43", "1-43", "K1/M43", {kisim, no}, {kisim, madde_no}, (1, 43) → {kisim, no} ya da null */
export function maddeCoz(a, b) {
  try {
    let k, n;
    if (b !== undefined && b !== null) { k = a; n = b; }
    else if (a && typeof a === 'object') { k = a.kisim; n = a.no ?? a.madde_no ?? a.maddeNo; }
    else if (typeof a === 'string') {
      const m = /^\s*K?(\d+)\s*[/\-]\s*M?(\d+)\s*$/i.exec(a);
      if (!m) return null;
      k = m[1]; n = m[2];
    } else return null;
    k = Number(k); n = Number(n);
    if (!Number.isInteger(k) || !Number.isInteger(n) || k < 1 || n < 1) return null;
    return { kisim: k, no: n };
  } catch (e) { return null; }
}
/** Depolamadaki biçim: "1/43" (geçersizse null) */
export function maddeAnahtari(a, b) { const m = maddeCoz(a, b); return m ? m.kisim + '/' + m.no : null; }
/** Tireli biçim: "1-43" (geçersizse null) */
export function maddeTireli(a, b) { const m = maddeCoz(a, b); return m ? m.kisim + '-' + m.no : null; }

/* ---------- İç yardımcılar ---------- */

const nesneMi = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const TURLER = { dizi: Array.isArray, nesne: nesneMi, her: () => true };

function ham(anahtar) { try { return depo.alDuz(anahtar, null); } catch (e) { return null; } }

function cozumle(r, tur) {
  if (r === null || r === undefined) return { var: false };
  try { const v = JSON.parse(r); if (TURLER[tur](v)) return { var: true, iyi: true, v }; } catch (e) { /* bozuk */ }
  return { var: true, iyi: false };
}

/** JSON kayıt okur; yoksa/bozuksa varsayilan() döner. */
function jsonOku(anahtar, tur, varsayilan) {
  const c = cozumle(ham(anahtar), tur);
  return c.iyi ? c.v : varsayilan();
}

function bozukSakla(anahtar, r) {
  try {
    let b = {};
    const c = cozumle(ham(BOZUK_ANAHTARI), 'nesne');
    if (c.iyi) b = c.v;
    if (!Array.isArray(b[anahtar])) b[anahtar] = [];
    if (!b[anahtar].includes(r)) b[anahtar].push(r);
    depo.yaz(BOZUK_ANAHTARI, b);
  } catch (e) { /* yoksay */ }
}

/** JSON yazar; var olan kayıt bozuksa önce ham metnini saklar. */
function jsonYaz(anahtar, tur, deger) {
  const r = ham(anahtar);
  const c = cozumle(r, tur);
  if (c.var && !c.iyi) bozukSakla(anahtar, r);
  return depo.yaz(anahtar, deger);
}

/** Düz metin yazar; var olan değer beklenen kalıba uymuyorsa önce saklar. */
function duzYaz(anahtar, deger, gecerli = () => true) {
  const r = ham(anahtar);
  if (r !== null && !gecerli(r)) bozukSakla(anahtar, r);
  return depo.yazDuz(anahtar, String(deger));
}

/** Her yöntemi try/catch ile sarar: API hiçbir koşulda istisna fırlatmaz. */
function guvenli(nesne, varsayilanlar = {}) {
  for (const ad of Object.keys(nesne)) {
    const f = nesne[ad];
    if (typeof f !== 'function') continue;
    nesne[ad] = function (...args) {
      try { return f.apply(nesne, args); }
      catch (e) { try { console.error('kullanici.' + ad + ':', e); } catch (x) { /* yoksay */ } return typeof varsayilanlar[ad] === 'function' ? varsayilanlar[ad]() : varsayilanlar[ad]; }
    };
  }
  return nesne;
}

const dizgeler = d => d.filter(x => typeof x === 'string');
const utcGun = (t = new Date()) => t.toISOString().slice(0, 10);

/* ---------- Yer imleri: ilmihal-bookmarks ---------- */
// Biçim: [{"key":"1/52","kisim":1,"madde_no":52,"baslik":"…"}]; eski kayıtlar düz metin olabilir: ["1/52"].

function yerImiAnahtari(o) {
  if (typeof o === 'string') return maddeAnahtari(o);
  if (nesneMi(o)) return maddeAnahtari(typeof o.key === 'string' ? o.key : o);
  return null;
}

const yerImleri = guvenli({
  /** Tekrarsız liste: [{key, kisim, madde_no, baslik}] (eski düz metin kayıtta baslik null) */
  liste() {
    const gorulen = new Map();
    for (const o of jsonOku(ANAHTAR.yerImleri, 'dizi', () => [])) {
      const key = yerImiAnahtari(o);
      if (!key) continue;
      const m = maddeCoz(key);
      const baslik = nesneMi(o) && typeof o.baslik === 'string' ? o.baslik : null;
      const onceki = gorulen.get(key);
      if (!onceki) gorulen.set(key, { key, kisim: m.kisim, madde_no: m.no, baslik });
      else if (!onceki.baslik && baslik) onceki.baslik = baslik;
    }
    return [...gorulen.values()];
  },
  varMi(a, b) { const key = maddeAnahtari(a, b); return !!key && this.liste().some(x => x.key === key); },
  /** madde: {kisim, madde_no|no, baslik} · zaten varsa false */
  ekle(madde, baslik) {
    const mm = maddeCoz(madde);
    if (!mm) return false;
    const key = mm.kisim + '/' + mm.no;
    const ad = nesneMi(madde) && typeof madde.baslik === 'string' ? madde.baslik : (typeof baslik === 'string' ? baslik : '');
    const dizi = jsonOku(ANAHTAR.yerImleri, 'dizi', () => []);
    if (dizi.some(o => yerImiAnahtari(o) === key)) return false;
    dizi.push({ key, kisim: mm.kisim, madde_no: mm.no, baslik: ad });
    jsonYaz(ANAHTAR.yerImleri, 'dizi', dizi);
    return true;
  },
  /** Eski düz metin kayıt dahil o maddenin bütün kayıtlarını kaldırır. */
  cikar(a, b) {
    const key = maddeAnahtari(a, b);
    if (!key) return false;
    const dizi = jsonOku(ANAHTAR.yerImleri, 'dizi', () => []);
    const kalan = dizi.filter(o => yerImiAnahtari(o) !== key);
    if (kalan.length === dizi.length) return false;
    jsonYaz(ANAHTAR.yerImleri, 'dizi', kalan);
    return true;
  },
  /** Varsa kaldırır, yoksa ekler; yeni durumu döndürür (true = yer imli). */
  degistir(madde) {
    if (this.varMi(madde)) { this.cikar(madde); return false; }
    return this.ekle(madde);
  }
}, { liste: () => [], varMi: false, ekle: false, cikar: false, degistir: false });

/* ---------- Okundu (açıldı): ilmihal-read ---------- */
// Biçim: ["1/1","1/2"] açılma sırasıyla. "Bitirilen" (okuma planı) ile KARIŞTIRILMAZ.

const okunan = guvenli({
  liste() { return dizgeler(jsonOku(ANAHTAR.okunan, 'dizi', () => [])); },
  varMi(a, b) { const key = maddeAnahtari(a, b); return !!key && this.liste().includes(key); },
  /** Yoksa sona ekler (eskisi gibi yalnız yeni ise yazar). Yeni eklendiyse true. */
  isaretle(a, b) {
    const key = maddeAnahtari(a, b);
    if (!key) return false;
    const dizi = jsonOku(ANAHTAR.okunan, 'dizi', () => []);
    if (dizi.includes(key)) return false;
    dizi.push(key);
    jsonYaz(ANAHTAR.okunan, 'dizi', dizi);
    return true;
  }
}, { liste: () => [], varMi: false, isaretle: false });

/* ---------- Okuma geçmişi: ilmihal-read-history ---------- */
// Biçim: ["1/5","1/1"] en çok 50, tekrarsız, en yenisi SONDA.

const GECMIS_EN_COK = 50;
const gecmis = guvenli({
  liste() { return dizgeler(jsonOku(ANAHTAR.gecmis, 'dizi', () => [])); },
  /** En yeniden eskiye, en çok n tane (Çalışma Alanım: 12). */
  sonlar(n = 12) { return this.liste().slice(-n).reverse(); },
  ekle(a, b) {
    const key = maddeAnahtari(a, b);
    if (!key) return false;
    let dizi = jsonOku(ANAHTAR.gecmis, 'dizi', () => []).filter(h => h !== key);
    dizi.push(key);
    if (dizi.length > GECMIS_EN_COK) dizi = dizi.slice(-GECMIS_EN_COK);
    jsonYaz(ANAHTAR.gecmis, 'dizi', dizi);
    return true;
  }
}, { liste: () => [], sonlar: () => [], ekle: false });

/* ---------- Son okunan: ilmihal-son-okunan ---------- */
// Biçim: {"kisim":1,"madde_no":52,"baslik":"…","zaman":1763371200000}

const sonOkunan = guvenli({
  al() {
    const v = jsonOku(ANAHTAR.sonOkunan, 'nesne', () => null);
    if (!v) return null;
    const m = maddeCoz(v.kisim, v.madde_no);
    if (!m) return null;
    return { kisim: m.kisim, madde_no: m.no, baslik: typeof v.baslik === 'string' ? v.baslik : '', zaman: Number.isFinite(v.zaman) ? v.zaman : null };
  },
  yaz(madde, zaman = Date.now()) {
    const m = maddeCoz(madde);
    if (!m) return false;
    return jsonYaz(ANAHTAR.sonOkunan, 'nesne', { kisim: m.kisim, madde_no: m.no, baslik: madde.baslik, zaman });
  }
}, { al: null, yaz: false });

/* ---------- Notlar: ilmihal-notlar ---------- */
// Biçim: {"1/52":[{"text":"…","date":"17.11.2026"}]} — date tr-TR GÖRÜNTÜ metnidir (ISO değil). Boş dizi silinir.

function notNormal(n) {
  if (nesneMi(n)) return { text: typeof n.text === 'string' ? n.text : String(n.text ?? ''), date: typeof n.date === 'string' ? n.date : '' };
  return { text: typeof n === 'string' ? n : '', date: '' };
}
const notlar = guvenli({
  /** { "1/52": [{text, date}] } (yalnız dizi değerli maddeler) */
  hepsi() {
    const v = jsonOku(ANAHTAR.notlar, 'nesne', () => ({}));
    const s = {};
    for (const k of Object.keys(v)) if (Array.isArray(v[k]) && v[k].length) s[k] = v[k].map(notNormal);
    return s;
  },
  /** Bir maddenin notları; sıra = depodaki sıra (sil() bu sırayı kullanır). */
  liste(a, b) {
    const key = maddeAnahtari(a, b);
    const v = jsonOku(ANAHTAR.notlar, 'nesne', () => ({}));
    return key && Array.isArray(v[key]) ? v[key].map(notNormal) : [];
  },
  /** Metin kırpılır; boşsa eklenmez (null döner). */
  ekle(madde, metin, tarih = new Date()) {
    const key = maddeAnahtari(madde);
    const text = String(metin ?? '').trim();
    if (!key || !text) return null;
    const v = jsonOku(ANAHTAR.notlar, 'nesne', () => ({}));
    if (!Array.isArray(v[key])) v[key] = [];
    const not = { text, date: tarih.toLocaleDateString('tr-TR') };
    v[key].push(not);
    jsonYaz(ANAHTAR.notlar, 'nesne', v);
    return not;
  },
  sil(madde, sira) {
    const key = maddeAnahtari(madde);
    const v = jsonOku(ANAHTAR.notlar, 'nesne', () => ({}));
    if (!key || !Array.isArray(v[key]) || !(sira >= 0 && sira < v[key].length)) return false;
    v[key].splice(sira, 1);
    if (v[key].length === 0) delete v[key];
    jsonYaz(ANAHTAR.notlar, 'nesne', v);
    return true;
  },
  /** "17.11.2026" → Date (yerel gece yarısı) ya da null */
  tarihCoz(date) {
    const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(String(date || '').trim());
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }
}, { hepsi: () => ({}), liste: () => [], ekle: null, sil: false, tarihCoz: null });

/* ---------- Vurgular: ilmihal-vurgulamalar ---------- */
// Biçim: {"1/52":[{"text":"seçilen metin","renk":"#fff3b0"}]} — konum yok, METİN eşlemesi.
// Eski koddan farklı olarak kayıt DOM'dan yeniden kurulmaz: yerleşemeyen vurgu silinmez, raporlanır.

export const VURGU_RENKLERI = Object.freeze([
  { ad: 'sari', etiket: 'Sarı', renk: '#fff3b0' },
  { ad: 'yesil', etiket: 'Yeşil', renk: '#b8f0c8' },
  { ad: 'turuncu', etiket: 'Turuncu', renk: '#ffd8a8' },
  { ad: 'pembe', etiket: 'Pembe', renk: '#ffc8d8' }
]);
function vurguNormal(x) {
  return nesneMi(x) ? { text: typeof x.text === 'string' ? x.text : '', renk: typeof x.renk === 'string' ? x.renk : VURGU_RENKLERI[0].renk } : { text: '', renk: VURGU_RENKLERI[0].renk };
}
const yerlesmeyenRaporu = new Map();   // key → [{sira, text, renk}] (yalnız bellekte)
const vurgular = guvenli({
  hepsi() {
    const v = jsonOku(ANAHTAR.vurgular, 'nesne', () => ({}));
    const s = {};
    for (const k of Object.keys(v)) if (Array.isArray(v[k]) && v[k].length) s[k] = v[k].map(vurguNormal);
    return s;
  },
  liste(a, b) {
    const key = maddeAnahtari(a, b);
    const v = jsonOku(ANAHTAR.vurgular, 'nesne', () => ({}));
    return key && Array.isArray(v[key]) ? v[key].map(vurguNormal) : [];
  },
  /** Aynı metin zaten varsa yalnız rengi güncellenir. Kaydın sırasını döndürür (-1: geçersiz). */
  ekle(madde, metin, renk = VURGU_RENKLERI[0].renk) {
    const key = maddeAnahtari(madde);
    const text = String(metin ?? '');
    if (!key || !text) return -1;
    const v = jsonOku(ANAHTAR.vurgular, 'nesne', () => ({}));
    if (!Array.isArray(v[key])) v[key] = [];
    let i = v[key].findIndex(x => nesneMi(x) && x.text === text);
    if (i >= 0) v[key][i].renk = String(renk);
    else { v[key].push({ text, renk: String(renk) }); i = v[key].length - 1; }
    jsonYaz(ANAHTAR.vurgular, 'nesne', v);
    return i;
  },
  /** sira (sayı) ya da metin ile siler. */
  sil(madde, siraYaDaMetin) {
    const key = maddeAnahtari(madde);
    const v = jsonOku(ANAHTAR.vurgular, 'nesne', () => ({}));
    if (!key || !Array.isArray(v[key])) return false;
    const i = typeof siraYaDaMetin === 'number' ? siraYaDaMetin : v[key].findIndex(x => nesneMi(x) && x.text === siraYaDaMetin);
    if (!(i >= 0 && i < v[key].length)) return false;
    v[key].splice(i, 1);
    if (v[key].length === 0) delete v[key];
    jsonYaz(ANAHTAR.vurgular, 'nesne', v);
    return true;
  },
  /** Görünüm, metne yerleştirebildiği vurguların sıra numaralarını (ya da metinlerini) bildirir.
      Yerleşmeyenler döner ve bellekte raporlanır; depodan SİLİNMEZ. */
  yerlestirmeRaporu(madde, yerlesenler = []) {
    const key = maddeAnahtari(madde);
    if (!key) return [];
    const kume = new Set(yerlesenler);
    const yok = this.liste(key).map((x, sira) => ({ sira, ...x })).filter(x => !kume.has(x.sira) && !kume.has(x.text));
    if (yok.length) yerlesmeyenRaporu.set(key, yok); else yerlesmeyenRaporu.delete(key);
    return yok;
  },
  /** Bu oturumda raporlanan yerleşmeyen vurgular: { "1/52": [{sira, text, renk}] } */
  yerlesmeyenler() { return Object.fromEntries(yerlesmeyenRaporu); }
}, { hepsi: () => ({}), liste: () => [], ekle: -1, sil: false, yerlestirmeRaporu: () => [], yerlesmeyenler: () => ({}) });

/* ---------- Yazı boyutu: ilmihal-font-size ---------- */
// Biçim: düz metin "1.15" (eski kayıtlarda "1.1500000000000001" olabilir). Aralık 0,8–1,6, adım 0,1.

export const YAZI_BOYUTU = Object.freeze({ en_az: 0.8, en_cok: 1.6, adim: 0.1, varsayilan: 1.05 });
const yaziBoyutu = guvenli({
  /** rem cinsinden sayı; kayıt yoksa/bozuksa 1.05 (eski JS varsayılanı). */
  al() { const n = parseFloat(ham(ANAHTAR.yaziBoyutu) || String(YAZI_BOYUTU.varsayilan)); return Number.isFinite(n) ? n : YAZI_BOYUTU.varsayilan; },
  /** Eski sitede CSS yalnız kayıt varsa uygulanırdı (H-25). */
  kayitliMi() { return ham(ANAHTAR.yaziBoyutu) !== null; },
  yaz(n) {
    n = Math.max(YAZI_BOYUTU.en_az, Math.min(YAZI_BOYUTU.en_cok, Number(n)));
    if (!Number.isFinite(n)) return this.al();
    n = Math.round(n * 100) / 100;
    duzYaz(ANAHTAR.yaziBoyutu, String(n), r => Number.isFinite(parseFloat(r)));
    return n;
  },
  /** delta: +1 / -1 adım (eski adjustFontSize) */
  degistir(delta) { return this.yaz(this.al() + delta * YAZI_BOYUTU.adim); }
}, { al: YAZI_BOYUTU.varsayilan, kayitliMi: false, yaz: YAZI_BOYUTU.varsayilan, degistir: YAZI_BOYUTU.varsayilan });

/* ---------- Okuma ayarları: ilmihal-okuma-ayarlari ---------- */
// Biçim: {"aralik":"2.3","hiza":"justify","lugat":false}; aralik METİN ("1.7"|"2"|"2.3"), hiza "left"|"justify",
// lugat boolean ve eski sitede yalnız false uygulanır. Eksik alan = varsayılan.

export const OKUMA_SECENEKLERI = Object.freeze({ aralik: ['1.7', '2', '2.3'], hiza: ['left', 'justify'] });
const okumaAyarlari = guvenli({
  /** Ham nesne (yalnız kayıtlı alanlar). */
  al() { return { ...jsonOku(ANAHTAR.okumaAyarlari, 'nesne', () => ({})) }; },
  /** Varsayılanlarla doldurulmuş: {aralik:'2', hiza:'left', lugat:true} */
  etkin() {
    const a = this.al();
    return {
      aralik: a.aralik != null && OKUMA_SECENEKLERI.aralik.includes(String(a.aralik)) ? String(a.aralik) : '2',
      hiza: OKUMA_SECENEKLERI.hiza.includes(a.hiza) ? a.hiza : 'left',
      lugat: a.lugat !== false
    };
  },
  /** alan: 'aralik' | 'hiza' | 'lugat' (diğer alanlar da korunur) */
  yaz(alan, deger) {
    const a = jsonOku(ANAHTAR.okumaAyarlari, 'nesne', () => ({}));
    a[alan] = alan === 'aralik' ? String(deger) : alan === 'lugat' ? !!deger : deger;
    return jsonYaz(ANAHTAR.okumaAyarlari, 'nesne', a);
  }
}, { al: () => ({}), etkin: () => ({ aralik: '2', hiza: 'left', lugat: true }), yaz: false });

/* ---------- "1"/"0" bayrakları ---------- */
function bayrak(anahtar) {
  return guvenli({
    al() { return ham(anahtar) === '1'; },
    kayitliMi() { return ham(anahtar) !== null; },
    yaz(acik) { return duzYaz(anahtar, acik ? '1' : '0', r => r === '1' || r === '0'); }
  }, { al: false, kayitliMi: false, yaz: false });
}
const sahifeAcik = bayrak(ANAHTAR.sahifeAcik);      // "1" | "0"
const fihristGizli = bayrak(ANAHTAR.fihristGizli);  // "1" | "0"

/* ---------- Ses: ilmihal-audio-speed, ilmihal-audio-pos ---------- */

export const SES_HIZLARI = Object.freeze([0.5, 0.75, 1, 1.25, 1.5, 2]);
const sesHizi = guvenli({
  /** Biçim: düz metin "1.25"; yoksa/bozuksa 1 */
  al() { return parseFloat(ham(ANAHTAR.sesHizi)) || 1; },
  yaz(n) { n = Number(n); if (!(n > 0)) return false; return duzYaz(ANAHTAR.sesHizi, String(n), r => parseFloat(r) > 0); },
  /** Eski cycleAudioSpeed: listede yoksa 0.5'e döner. Yeni hızı döndürür. */
  sonraki() { const i = SES_HIZLARI.indexOf(this.al()); const y = SES_HIZLARI[(i + 1) % SES_HIZLARI.length]; this.yaz(y); return y; }
}, { al: 1, yaz: false, sonraki: 1 });

const sesKonumu = guvenli({
  /** Biçim: {"kisim":1,"maddeNo":52,"pageIdx":0,"time":123.45} — dikkat: maddeNo (camelCase) */
  al() {
    const v = jsonOku(ANAHTAR.sesKonumu, 'nesne', () => null);
    if (!v || !maddeCoz(v.kisim, v.maddeNo)) return null;
    return { kisim: v.kisim, maddeNo: v.maddeNo, pageIdx: Number(v.pageIdx) || 0, time: Number(v.time) || 0 };
  },
  /** Kayıt bu maddeye aitse döner, değilse null. */
  icin(a, b) {
    const m = maddeCoz(a, b); const p = this.al();
    return m && p && Number(p.kisim) === m.kisim && Number(p.maddeNo) === m.no ? p : null;
  },
  yaz({ kisim, maddeNo, pageIdx = 0, time = 0 } = {}) {
    if (!maddeCoz(kisim, maddeNo)) return false;
    return jsonYaz(ANAHTAR.sesKonumu, 'nesne', { kisim, maddeNo, pageIdx, time });
  }
}, { al: null, icin: null, yaz: false });

/* ---------- Günlük hedef: ilmihal-daily-goal ---------- */
// Biçim: {"target":30,"today":"2026-11-17","minutes":12}; today UTC tarihidir (eski davranış, H-13).

const gunlukHedef = guvenli({
  al() {
    const v = jsonOku(ANAHTAR.gunlukHedef, 'nesne', () => ({ target: 30, today: '', minutes: 0 }));
    return { target: Number.isFinite(v.target) ? v.target : 30, today: typeof v.today === 'string' ? v.today : '', minutes: Number.isFinite(v.minutes) ? v.minutes : 0 };
  },
  /** Bugün (UTC günü) okunan dakika. */
  bugunkuDakika(simdi = new Date()) { const g = this.al(); return g.today === utcGun(simdi) ? g.minutes : 0; },
  /** Eski updateDailyGoal: gün değiştiyse sıfırla, dk ekle. Döner: {target, today, minutes, tamam} */
  ekle(dk = 1, simdi = new Date()) {
    const v = jsonOku(ANAHTAR.gunlukHedef, 'nesne', () => ({ target: 30, today: '', minutes: 0 }));
    if (!Number.isFinite(v.target)) v.target = 30;
    if (!Number.isFinite(v.minutes)) v.minutes = 0;
    const bugun = utcGun(simdi);
    if (v.today !== bugun) { v.today = bugun; v.minutes = 0; }
    v.minutes += Number(dk) || 0;
    jsonYaz(ANAHTAR.gunlukHedef, 'nesne', v);
    return { target: v.target, today: v.today, minutes: v.minutes, tamam: v.minutes >= v.target };
  }
}, { al: () => ({ target: 30, today: '', minutes: 0 }), bugunkuDakika: 0, ekle: () => ({ target: 30, today: '', minutes: 0, tamam: false }) });

/* ---------- Quiz puanı: ilmihal-quiz-puan ---------- */
const quizPuani = guvenli({
  /** Biçim: düz metin "80" (en yüksek puan) */
  al() { return parseInt(ham(ANAHTAR.quizPuani) || '0') || 0; },
  /** En yüksek puanı saklar; saklanan en yüksek puanı döndürür. */
  kaydet(puan) { const y = Math.max(this.al(), Math.round(Number(puan)) || 0); duzYaz(ANAHTAR.quizPuani, String(y), r => !isNaN(parseInt(r))); return y; }
}, { al: 0, kaydet: 0 });

/* ---------- Rehber ilerlemesi: ilmihal-rehber-progress ---------- */
// Biçim: {"<rehberId>":["1/51","1/52"]}
const rehber = guvenli({
  hepsi() {
    const v = jsonOku(ANAHTAR.rehber, 'nesne', () => ({}));
    const s = {};
    for (const k of Object.keys(v)) if (Array.isArray(v[k])) s[k] = dizgeler(v[k]);
    return s;
  },
  adimlar(id) { return this.hepsi()[id] || []; },
  tamamMi(id, a, b) { const key = maddeAnahtari(a, b); return !!key && this.adimlar(id).includes(key); },
  /** Eski toggleRehberAdim. Yeni durumu döndürür. */
  degistir(id, a, b) {
    const key = maddeAnahtari(a, b);
    if (!key || id == null) return false;
    const v = jsonOku(ANAHTAR.rehber, 'nesne', () => ({}));
    if (!Array.isArray(v[id])) v[id] = [];
    const i = v[id].indexOf(key);
    if (i === -1) v[id].push(key); else v[id].splice(i, 1);
    jsonYaz(ANAHTAR.rehber, 'nesne', v);
    return i === -1;
  }
}, { hepsi: () => ({}), adimlar: () => [], tamamMi: false, degistir: false });

/* ---------- Duyuru kapatma: ilmihal-duyuru-kapatilan ---------- */
const duyuru = guvenli({
  kapatilanlar() { return dizgeler(jsonOku(ANAHTAR.duyuru, 'dizi', () => [])); },
  kapatildiMi(id) { return this.kapatilanlar().includes(id); },
  kapat(id) {
    const d = jsonOku(ANAHTAR.duyuru, 'dizi', () => []);
    if (d.includes(id)) return true;
    d.push(String(id));
    return jsonYaz(ANAHTAR.duyuru, 'dizi', d);
  },
  /** Eski renderDuyurular süzgeci: kapatılmamış ve bitişi (UTC günü) geçmemiş olanlar. */
  gorunenler(liste = [], simdi = new Date()) {
    const k = this.kapatilanlar(); const bugun = utcGun(simdi);
    return liste.filter(d => !k.includes(d.id) && (!d.bitis || bugun <= d.bitis));
  }
}, { kapatilanlar: () => [], kapatildiMi: false, kapat: false, gorunenler: () => [] });

/* ---------- Okuma planı kayıtları (hesap: js/cekirdek/okuma-plani.js) ---------- */

const hatim = guvenli({
  /** Biçim: {"baslangic":"2026-11-17","gun":90,"hatimSayisi":0}; baslangic YEREL tarih. Yoksa/bozuksa null. */
  al() { const v = jsonOku(ANAHTAR.hatim, 'nesne', () => null); return v ? { ...v } : null; },
  yaz(p) { return jsonYaz(ANAHTAR.hatim, 'nesne', p); },
  sil() { depo.sil(ANAHTAR.hatim); return true; }
}, { al: null, yaz: false, sil: false });

const bitirilen = guvenli({
  /** Biçim: ["1/1","1/2"] bu hatimde bitirilenler (okundu'dan AYRI) */
  liste() { return jsonOku(ANAHTAR.bitirilen, 'dizi', () => []); },
  varMi(a, b) { const key = maddeAnahtari(a, b); return !!key && this.liste().indexOf(key) !== -1; },
  /** Eski maddeBitir'in kayıt kısmı (her çağrıda yazar). */
  ayarla(a, bitti) {
    const key = maddeAnahtari(a);
    if (!key) return false;
    const liste = this.liste();
    const i = liste.indexOf(key);
    if (bitti && i === -1) liste.push(key);
    if (!bitti && i !== -1) liste.splice(i, 1);
    return jsonYaz(ANAHTAR.bitirilen, 'dizi', liste);
  },
  sifirla() { return jsonYaz(ANAHTAR.bitirilen, 'dizi', []); }
}, { liste: () => [], varMi: false, ayarla: false, sifirla: false });

const okumaYeri = guvenli({
  /** Biçim: {"1/60":0.42} (0,03–0,97 arası oran, 3 ondalık) */
  hepsi() { return jsonOku(ANAHTAR.okumaYeri, 'nesne', () => ({})); },
  al(a, b) { const key = maddeAnahtari(a, b); const v = key ? this.hepsi()[key] : undefined; return typeof v === 'number' ? v : null; },
  yaz(a, oran) { const key = maddeAnahtari(a); if (!key) return false; const y = this.hepsi(); y[key] = oran; return jsonYaz(ANAHTAR.okumaYeri, 'nesne', y); },
  sil(a) { const key = maddeAnahtari(a); const y = this.hepsi(); if (!key || y[key] == null) return false; delete y[key]; return jsonYaz(ANAHTAR.okumaYeri, 'nesne', y); },
  /** Eski kaydirildi(): her çağrıda yazar; aralık dışıysa ya da bittiyse kaydı siler. */
  kaydet(a, oran, bitti) {
    const key = maddeAnahtari(a); if (!key) return false;
    const y = this.hepsi();
    if (oran > 0.03 && oran < 0.97 && !bitti) y[key] = Math.round(oran * 1000) / 1000; else delete y[key];
    return jsonYaz(ANAHTAR.okumaYeri, 'nesne', y);
  },
  sifirla() { return jsonYaz(ANAHTAR.okumaYeri, 'nesne', {}); }
}, { hepsi: () => ({}), al: null, yaz: false, sil: false, kaydet: false, sifirla: false });

const hatimKutlama = guvenli({
  /** Biçim: JSON metni '"2026-11-17"' (tırnaklı). Tırnaksız eski/elle yazılmış değer de okunur. Yoksa ''. */
  al() {
    const r = ham(ANAHTAR.hatimKutlama);
    if (r == null) return '';
    try { const v = JSON.parse(r); if (typeof v === 'string') return v; } catch (e) { /* düz metin */ }
    return /^\d{4}-\d{2}-\d{2}$/.test(r.trim()) ? r.trim() : '';
  },
  /** Tırnaklı JSON olarak yazar (eski biçim). */
  yaz(gun) { return depo.yaz(ANAHTAR.hatimKutlama, String(gun)); }
}, { al: '', yaz: false });

/* ---------- Geliştirici ve eski bayraklar ---------- */
const debug = guvenli({
  /** "1" ise açık (elle konur) */
  acikMi() { return ham(ANAHTAR.debug) === '1'; },
  yaz(acik) { if (acik) return depo.yazDuz(ANAHTAR.debug, '1'); depo.sil(ANAHTAR.debug); return true; }
}, { acikMi: false, yaz: false });

const buildId = guvenli({
  /** Düz metin "2026-10-19-r5" */
  al() { return ham(ANAHTAR.buildId); },
  yaz(id) { return depo.yazDuz(ANAHTAR.buildId, String(id)); }
}, { al: null, yaz: false });

function eskiBayrak(anahtar) {
  return guvenli({
    /** Eski kod "varsa" diye bakar (truthy). */
    al() { return !!ham(anahtar); },
    isaretle() { return depo.yazDuz(anahtar, '1'); }
  }, { al: false, isaretle: false });
}
const onboardingGoruldu = eskiBayrak(ANAHTAR.onboardingGoruldu);
const onboardingBitti = eskiBayrak(ANAHTAR.onboardingBitti);

/* ---------- Birleşik işlemler ---------- */

/** Eski openMadde'nin kayıt kısmı: okundu + geçmiş + son okunan. madde: {kisim, madde_no|no, baslik} */
function maddeAcildi(madde, zaman = Date.now()) {
  try {
    const m = maddeCoz(madde); if (!m) return false;
    okunan.isaretle(m.kisim, m.no);
    gecmis.ekle(m.kisim, m.no);
    sonOkunan.yaz({ kisim: m.kisim, madde_no: m.no, baslik: madde.baslik }, zaman);
    return true;
  } catch (e) { return false; }
}

/* ---------- Abonelik ---------- */

const ALANLAR = {
  yerImleri: () => yerImleri.liste(), okunan: () => okunan.liste(), gecmis: () => gecmis.liste(),
  sonOkunan: () => sonOkunan.al(), notlar: () => notlar.hepsi(), vurgular: () => vurgular.hepsi(),
  yaziBoyutu: () => yaziBoyutu.al(), okumaAyarlari: () => okumaAyarlari.etkin(),
  sahifeAcik: () => sahifeAcik.al(), fihristGizli: () => fihristGizli.al(),
  sesHizi: () => sesHizi.al(), sesKonumu: () => sesKonumu.al(), gunlukHedef: () => gunlukHedef.al(),
  quizPuani: () => quizPuani.al(), rehber: () => rehber.hepsi(), duyuru: () => duyuru.kapatilanlar(),
  hatim: () => hatim.al(), bitirilen: () => bitirilen.liste(), okumaYeri: () => okumaYeri.hepsi(),
  hatimKutlama: () => hatimKutlama.al(), debug: () => debug.acikMi(), buildId: () => buildId.al(),
  onboardingGoruldu: () => onboardingGoruldu.al(), onboardingBitti: () => onboardingBitti.al(),
  tema: () => ham(ANAHTAR.tema)
};

/** alan değişince fn(yeniDeger) çağrılır (bu sekme ve diğer sekmeler). Aboneliği kaldıran işlev döner. */
function izle(alan, fn) {
  try {
    if (!ALANLAR[alan] || typeof fn !== 'function') return () => {};
    return depo.izle(ANAHTAR[alan], () => { try { fn(ALANLAR[alan]()); } catch (e) { console.error('kullanici.izle:', e); } });
  } catch (e) { return () => {}; }
}

/* ---------- Dışa / içe aktarma ---------- */

export const YEDEK_BICIMI = 'ilmihal-kullanici-yedegi';
// Yedeğe girmeyenler: ilmihal-build-id (her yüklemede yazılır), ilmihal-debug (geliştirici).
const YEDEK_DISI = new Set([ANAHTAR.buildId, ANAHTAR.debug]);
const YEDEK_ANAHTARLARI = [...Object.values(ANAHTAR).filter(k => !YEDEK_DISI.has(k)), BOZUK_ANAHTARI];
const ANAHTAR_TURU = {
  [ANAHTAR.yerImleri]: 'dizi', [ANAHTAR.okunan]: 'dizi', [ANAHTAR.gecmis]: 'dizi', [ANAHTAR.duyuru]: 'dizi', [ANAHTAR.bitirilen]: 'dizi',
  [ANAHTAR.okumaAyarlari]: 'nesne', [ANAHTAR.sonOkunan]: 'nesne', [ANAHTAR.notlar]: 'nesne', [ANAHTAR.vurgular]: 'nesne',
  [ANAHTAR.sesKonumu]: 'nesne', [ANAHTAR.gunlukHedef]: 'nesne', [ANAHTAR.rehber]: 'nesne', [ANAHTAR.hatim]: 'nesne',
  [ANAHTAR.okumaYeri]: 'nesne', [BOZUK_ANAHTARI]: 'nesne'
};

/** Bütün kullanıcı verisi tek nesne: { bicim, surum, tarih, anahtarlar: { 'ilmihal-…': hamMetin } }.
    Değerler depodaki HAM metindir; geri yüklemede biçim birebir korunur. */
function disaAktar(simdi = new Date()) {
  const anahtarlar = {};
  for (const k of YEDEK_ANAHTARLARI) { const r = ham(k); if (r !== null) anahtarlar[k] = r; }
  return { bicim: YEDEK_BICIMI, surum: 1, tarih: simdi.toISOString(), anahtarlar };
}

function birlestirDeger(k, mevcut, gelen) {
  const tur = ANAHTAR_TURU[k];
  if (!tur) {                                       // düz metin değerler
    if (k === ANAHTAR.quizPuani) return (parseInt(gelen) || 0) > (parseInt(mevcut) || 0) ? gelen : mevcut;
    if (k === ANAHTAR.hatimKutlama) {
      const g = s => { try { const v = JSON.parse(s); return typeof v === 'string' ? v : ''; } catch (e) { return String(s).trim(); } };
      return g(gelen) > g(mevcut) ? gelen : mevcut;
    }
    return mevcut;                                  // tema, yazı boyutu, ses hızı, bayraklar: var olan kalır
  }
  const p = r => { const c = cozumle(r, tur); return c.iyi ? c.v : undefined; };
  const a = p(mevcut), b = p(gelen);
  if (a === undefined) return gelen;               // mevcut bozuk/boş: gelen yazılır (bozuk mevcut jsonYaz'da saklanmaz, aşağıda saklanır)
  if (b === undefined) return mevcut;
  const json = v => JSON.stringify(v);
  switch (k) {
    case ANAHTAR.okunan: case ANAHTAR.bitirilen: case ANAHTAR.duyuru:
      return json([...a, ...b.filter(x => !a.includes(x))]);
    case ANAHTAR.gecmis: {
      const s = [...a, ...b.filter(x => !a.includes(x))];
      return json(s.slice(-GECMIS_EN_COK));
    }
    case ANAHTAR.yerImleri: {
      const var_ = new Set(a.map(yerImiAnahtari));
      return json([...a, ...b.filter(o => { const key = yerImiAnahtari(o); return key && !var_.has(key); })]);
    }
    case ANAHTAR.notlar: case ANAHTAR.vurgular: {
      const s = { ...a };
      const ayni = k === ANAHTAR.notlar ? (x, y) => x?.text === y?.text && x?.date === y?.date : (x, y) => x?.text === y?.text;
      for (const m of Object.keys(b)) {
        if (!Array.isArray(b[m])) continue;
        const hedef = Array.isArray(s[m]) ? [...s[m]] : [];
        for (const o of b[m]) if (!hedef.some(x => ayni(x, o))) hedef.push(o);
        s[m] = hedef;
      }
      return json(s);
    }
    case ANAHTAR.rehber: {
      const s = { ...a };
      for (const id of Object.keys(b)) {
        if (!Array.isArray(b[id])) continue;
        const h = Array.isArray(s[id]) ? [...s[id]] : [];
        for (const x of b[id]) if (!h.includes(x)) h.push(x);
        s[id] = h;
      }
      return json(s);
    }
    case ANAHTAR.okumaYeri: return json({ ...b, ...a });
    case BOZUK_ANAHTARI: {
      const s = { ...a };
      for (const x of Object.keys(b)) if (Array.isArray(b[x])) s[x] = [...new Set([...(Array.isArray(s[x]) ? s[x] : []), ...b[x]])];
      return json(s);
    }
    case ANAHTAR.gunlukHedef:
      if ((b.today || '') > (a.today || '')) return gelen;
      if (b.today === a.today && (b.minutes || 0) > (a.minutes || 0)) return gelen;
      return mevcut;
    case ANAHTAR.sonOkunan: return (b.zaman || 0) > (a.zaman || 0) ? gelen : mevcut;
    default: return mevcut;                         // okuma ayarları, plan, ses konumu: var olan kalır
  }
}

/** Yedeği geri yükler. birlestir=false: yedekteki anahtarlar yazılır (yedekte olmayanlara dokunulmaz).
    birlestir=true: listeler birleşir, sayılarda büyük/yeni olan, ayarlarda var olan kalır.
    Döner: { tamam, yazilan: [...], degismeyen: [...], atlanan: [{anahtar, sebep}] } */
function iceAktar(nesne, { birlestir = false } = {}) {
  const sonuc = { tamam: false, yazilan: [], degismeyen: [], atlanan: [] };
  try {
    if (!nesneMi(nesne) || !nesneMi(nesne.anahtarlar)) { sonuc.atlanan.push({ anahtar: '*', sebep: 'yedek biçimi tanınmadı' }); return sonuc; }
    const izinli = new Set([...YEDEK_ANAHTARLARI, ANAHTAR.buildId, ANAHTAR.debug]);
    for (const [k, gelen] of Object.entries(nesne.anahtarlar)) {
      if (!izinli.has(k)) { sonuc.atlanan.push({ anahtar: k, sebep: 'bilinmeyen anahtar' }); continue; }
      if (typeof gelen !== 'string') { sonuc.atlanan.push({ anahtar: k, sebep: 'değer metin değil' }); continue; }
      const tur = ANAHTAR_TURU[k];
      if (tur && !cozumle(gelen, tur).iyi && k !== BOZUK_ANAHTARI) { sonuc.atlanan.push({ anahtar: k, sebep: 'bozuk değer' }); continue; }
      const mevcut = ham(k);
      const yeni = birlestir && mevcut !== null ? birlestirDeger(k, mevcut, gelen) : gelen;
      if (yeni === mevcut) { sonuc.degismeyen.push(k); continue; }
      if (mevcut !== null && tur && !cozumle(mevcut, tur).iyi) bozukSakla(k, mevcut);
      depo.yazDuz(k, yeni);
      sonuc.yazilan.push(k);
    }
    sonuc.tamam = true;
  } catch (e) { sonuc.atlanan.push({ anahtar: '*', sebep: String(e && e.message || e) }); }
  return sonuc;
}

/* ---------- Özet ---------- */

function ozet(simdi = new Date()) {
  try {
    const n = notlar.hepsi(), v = vurgular.hepsi(), r = rehber.hepsi();
    const say = o => Object.values(o).reduce((t, d) => t + d.length, 0);
    return {
      yerImi: yerImleri.liste().length,
      not: say(n), notluMadde: Object.keys(n).length,
      vurgu: say(v), vurguluMadde: Object.keys(v).length,
      okunan: okunan.liste().length,
      bitirilen: bitirilen.liste().length,
      gecmis: gecmis.liste().length,
      rehberAdimi: say(r), rehber: Object.keys(r).length,
      quizPuani: quizPuani.al(),
      bugunkuDakika: gunlukHedef.bugunkuDakika(simdi),
      planVar: !!hatim.al()
    };
  } catch (e) { return {}; }
}

/* ---------- Dışa açılan nesne ---------- */

export const kullanici = {
  yerImleri, okunan, gecmis, sonOkunan, notlar, vurgular,
  yaziBoyutu, okumaAyarlari, sahifeAcik, fihristGizli,
  sesHizi, sesKonumu, gunlukHedef, quizPuani, rehber, duyuru,
  hatim, bitirilen, okumaYeri, hatimKutlama,
  debug, buildId, onboardingGoruldu, onboardingBitti,
  maddeAcildi, izle, disaAktar, iceAktar, ozet,
  maddeCoz, maddeAnahtari, maddeTireli,
  ANAHTAR, BOZUK_ANAHTARI
};
export default kullanici;
