/* Okuma planı (hatim) — eski okuma-plani.js'in saf ES modülü karşılığı.
   Hesap birebir aynıdır: dakikada 1100 harf, madde uzunluğuna göre günlere bölme, 30/90/180/365 gün.
   DOM'a dokunmaz; bildirim/kutlama göstermez, yalnız veri döndürür.
   Kayıtlar (aynı anahtar, aynı biçim) js/cekirdek/kullanici.js üzerinden:
     ilmihal-hatim {baslangic:'YYYY-MM-DD' (yerel), gun, hatimSayisi} · ilmihal-bitirilen ['1/1', …]
     ilmihal-okuma-yeri {'1/60': 0.42} · ilmihal-hatim-kutlama '"YYYY-MM-DD"'
   `maddeler` her yerde kitap sırasıyla [{kisim, no, uzunluk}] dizisidir (uzunluk = harf sayısı;
   yoksa ya da 0 ise 4000 sayılır — eski `maddeUzunluklari[key] || 4000`). */

import { kullanici } from './kullanici.js';

export const DAKIKADA_HARF = 1100;
export const VARSAYILAN_UZUNLUK = 4000;
export const SURELER = Object.freeze([
  { gun: 30, ad: '30 gün' }, { gun: 90, ad: '90 gün' }, { gun: 180, ad: '180 gün' }, { gun: 365, ad: '1 yıl' }
]);

/* ---------- Tarih ---------- */

/** Yerel takvim günü 'YYYY-MM-DD' */
export function yerelGun(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
/** b − a gün sayısı ('YYYY-MM-DD') */
export function gunFarki(a, b) {
  const x = a.split('-').map(Number), y = b.split('-').map(Number);
  return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 86400000);
}
/** Eski sureYazi: "12 dk", "1 saat 20 dk" (5 dk altı artık yazılmaz) */
export function sureYazi(dk) {
  dk = Math.max(1, Math.round(dk));
  if (dk < 60) return dk + ' dk';
  const s = Math.floor(dk / 60), d = dk % 60;
  return s + ' saat' + (d >= 5 ? ' ' + d + ' dk' : '');
}

/* ---------- İç yardımcılar ---------- */

function hazirla(maddeler) {
  const keys = [], uz = new Map();
  for (const m of Array.isArray(maddeler) ? maddeler : []) {
    const key = kullanici.maddeAnahtari(m);
    if (!key) continue;
    keys.push(key);
    uz.set(key, m.uzunluk || VARSAYILAN_UZUNLUK);
  }
  return { keys, uzunluk: k => uz.get(k) || VARSAYILAN_UZUNLUK };
}

function planGecerli(p) {
  return !!p && typeof p === 'object' && /^\d{4}-\d{2}-\d{2}$/.test(p.baslangic) && Number(p.gun) > 0;
}

/* ---------- Saf hesap ---------- */

/** Toplam harf (kitap). */
export function toplamHarf(maddeler) {
  const { keys, uzunluk } = hazirla(maddeler);
  return keys.reduce((t, k) => t + uzunluk(k), 0);
}

/** Süre seçenekleri ve günlük okuma dakikası: [{gun, ad, gunlukDk}] */
export function sureSecenekleri(maddeler) {
  const toplamDk = toplamHarf(maddeler) / DAKIKADA_HARF;
  return SURELER.map(s => ({ ...s, gunlukDk: toplamDk / s.gun }));
}

/** Eski okumaPlani.durum()'un saf karşılığı.
    Girdi: maddeler, { plan, bitenler, bugun }. Eski alanların hepsi + bugunkuPayTamam, durumKodu, planBozuk. */
export function planDurumu(maddeler, { plan = null, bitenler = [], bugun = new Date() } = {}) {
  const { keys, uzunluk } = hazirla(maddeler);
  const biten = new Set(Array.isArray(bitenler) ? bitenler : []);
  const toplam = keys.reduce((t, k) => t + uzunluk(k), 0);
  const bitenHarf = keys.reduce((t, k) => t + (biten.has(k) ? uzunluk(k) : 0), 0);
  const gecerli = planGecerli(plan);
  const p = gecerli ? plan : null;
  const d = { aktif: !!p, plan: p, toplam, bitenHarf, bitenSayi: keys.filter(k => biten.has(k)).length, maddeSayi: keys.length };
  if (plan && !gecerli) d.planBozuk = true;
  const oran = toplam ? bitenHarf / toplam * 100 : 0;
  d.yuzde = Math.floor(oran);
  d.yuzdeYazi = oran > 0 && oran < 10 ? oran.toFixed(1).replace('.', ',') : String(d.yuzde);
  d.hatimBitti = keys.length > 0 && d.bitenSayi === keys.length;
  d.siradaki = keys.find(k => !biten.has(k)) || null;
  d.bugunkuPayTamam = false;
  d.durumKodu = null;
  if (!p) return d;
  const gun = Number(p.gun);
  const gunNo = Math.max(1, gunFarki(p.baslangic, yerelGun(bugun)) + 1);
  d.gunNo = gunNo;
  d.gunSayisi = p.gun;
  const bugunSonu = toplam * Math.min(gunNo, gun) / gun;
  const bugunBasi = toplam * Math.min(gunNo - 1, gun) / gun;
  d.beklenen = bugunSonu;
  // Bugünün kısmı gün bitmeden borç sayılmaz: geride olmak dünkü hedefe, önde olmak bugünkü hedefe göre ölçülür
  d.geriDk = Math.max(0, bugunBasi - bitenHarf) / DAKIKADA_HARF;
  d.ondeDk = Math.max(0, bitenHarf - bugunSonu) / DAKIKADA_HARF;
  d.bugunKalanDk = Math.max(0, bugunSonu - bitenHarf) / DAKIKADA_HARF;
  d.gunlukDk = toplam / gun / DAKIKADA_HARF;
  let bas = 0;
  d.bugunkuler = [];
  for (const k of keys) {
    const son = bas + uzunluk(k);
    if (son > bugunBasi && bas < bugunSonu) d.bugunkuler.push({ key: k, devam: bas < bugunBasi, bitti: biten.has(k) });
    bas = son;
  }
  d.sureDoldu = gunNo > gun;
  d.bugunkuPayTamam = d.bugunKalanDk <= 0;
  // Eski durumYazisi() eşikleri (3 dk): 'bitti' | 'sure-doldu' | 'geride' | 'onde' | 'uygun'
  d.durumKodu = d.sureDoldu ? (d.hatimBitti ? 'bitti' : 'sure-doldu') : d.geriDk >= 3 ? 'geride' : d.ondeDk >= 3 ? 'onde' : 'uygun';
  return d;
}

/** Eski takvimHTML'in verisi: [{gun, tarih:'YYYY-MM-DD', ilk, son, maddeler:[key], bitti, bugun}] */
export function planTakvimi(maddeler, { plan = null, bitenler = [], bugun = new Date() } = {}) {
  if (!planGecerli(plan)) return [];
  const d = planDurumu(maddeler, { plan, bitenler, bugun });
  const { keys, uzunluk } = hazirla(maddeler);
  const biten = new Set(bitenler);
  const toplam = d.toplam, G = Number(d.gunSayisi);
  const bugunIdx = Math.min(d.gunNo, G);
  const pb = plan.baslangic.split('-').map(Number);
  const gunler = [];
  for (let g = 1; g <= G; g++) {
    const gb = toplam * (g - 1) / G;
    const gunSonu = toplam * g / G;
    const liste = [];
    let c = 0, ilk = null, son = null;
    for (let i = 0; i < keys.length; i++) {
      const mb = c, ms = c + uzunluk(keys[i]);
      if (ms > gb && mb < gunSonu) { if (!ilk) ilk = keys[i]; son = keys[i]; liste.push(keys[i]); }
      c = ms;
      if (mb >= gunSonu) break;
    }
    gunler.push({
      gun: g, tarih: yerelGun(new Date(pb[0], pb[1] - 1, pb[2] + g - 1)), ilk, son, maddeler: liste,
      bitti: liste.length > 0 && liste.every(k => biten.has(k)), bugun: g === bugunIdx
    });
  }
  return gunler;
}

/** Sonuna kadar kaydırılan maddenin kendiliğinden bitmesi için geçmesi gereken süre (ms): okuma süresinin üçte biri, 8 sn–3 dk. */
export function otomatikBitirmeSuresi(uzunluk) {
  return Math.min(180000, Math.max(8000, (uzunluk || VARSAYILAN_UZUNLUK) / DAKIKADA_HARF * 60000 / 3));
}
/** Eski kaydirildi() koşulu: oran ≥ 0,985, daha önce otomatik bitirilmemiş, bitmemiş ve süre dolmuş. */
export function otomatikBitirilmeli({ oran, kaydirilabilir = true, acilisMs, simdiMs = Date.now(), uzunluk, bitti = false, dahaOnceOtomatik = false }) {
  return !!kaydirilabilir && oran >= 0.985 && !dahaOnceOtomatik && !bitti && simdiMs - acilisMs >= otomatikBitirmeSuresi(uzunluk);
}

/* ---------- Kayıtlı plana göre ---------- */

/** Kayıtlı plan ve bitirilenlerle durum. */
export function durum(maddeler, bugun = new Date()) {
  return planDurumu(maddeler, { plan: kullanici.hatim.al(), bitenler: kullanici.bitirilen.liste(), bugun });
}
export function takvim(maddeler, bugun = new Date()) {
  return planTakvimi(maddeler, { plan: kullanici.hatim.al(), bitenler: kullanici.bitirilen.liste(), bugun });
}
export function aktifMi() { return !!kullanici.hatim.al(); }
export function bittiMi(key) { return kullanici.bitirilen.varMi(key); }

/** Eski planKur: başlangıç bugün, hatim sayısı korunur. Yeni durumu döndürür. */
export function planKur(gun, maddeler, bugun = new Date()) {
  const p = kullanici.hatim.al() || { hatimSayisi: 0 };
  p.baslangic = yerelGun(bugun);
  p.gun = gun;
  kullanici.hatim.yaz(p);
  return durum(maddeler, bugun);
}

/** Eski planSil (onay sorusu görünümde). Bitirilenler kalır. */
export function planSil() { return kullanici.hatim.sil(); }

/** Eski yeniHatim: hatim bittiyse sayı artar; bitirilenler ve okuma yerleri sıfırlanır. */
export function yeniHatim(maddeler, bugun = new Date()) {
  const p = kullanici.hatim.al() || { hatimSayisi: 0 };
  if (durum(maddeler, bugun).hatimBitti) p.hatimSayisi = (p.hatimSayisi || 0) + 1;
  p.baslangic = yerelGun(bugun);
  p.gun = p.gun || 90;
  kullanici.hatim.yaz(p);
  kullanici.bitirilen.sifirla();
  kullanici.okumaYeri.sifirla();
  return durum(maddeler, bugun);
}

/** Eski maddeBitir. Döner: { bitti, olay, durum }.
    olay: 'hatim-tamam' (bu işlemle kitap bitti) | 'bugunku-pay-tamam' (bugünkü pay bu işlemle tamamlandı; günde bir kez) | null.
    sessiz=true iken olay hesaplanmaz (eski otomatik bitirme ve geri al). */
export function maddeBitir(key, bitti, maddeler, { sessiz = false, bugun = new Date() } = {}) {
  key = kullanici.maddeAnahtari(key);
  if (!key) return { bitti: false, olay: null, durum: durum(maddeler, bugun) };
  const onceki = durum(maddeler, bugun);
  kullanici.bitirilen.ayarla(key, bitti);
  if (bitti && kullanici.okumaYeri.al(key) != null) kullanici.okumaYeri.sil(key);
  const d = durum(maddeler, bugun);
  let olay = null;
  if (bitti && !sessiz) {
    if (d.hatimBitti && !onceki.hatimBitti) olay = 'hatim-tamam';
    else if (d.aktif && onceki.bugunKalanDk > 0 && d.bugunKalanDk <= 0 && kullanici.hatimKutlama.al() !== yerelGun(bugun)) {
      kullanici.hatimKutlama.yaz(yerelGun(bugun));
      olay = 'bugunku-pay-tamam';
    }
  }
  return { bitti: !!bitti, olay, durum: d };
}

/** Eski kaydirildi()'nin kayıt kısmı (800 ms seyreltme görünümdedir). */
export function okumaYeriKaydet(key, oran) {
  return kullanici.okumaYeri.kaydet(key, oran, bittiMi(key));
}
/** Madde açılınca dönülecek oran (0,03–0,97 arası ve madde bitmemişse), yoksa null. Aramadan gelindiyse görünüm çağırmaz. */
export function donulecekYer(key) {
  const yer = kullanici.okumaYeri.al(key);
  return yer > 0.03 && yer < 0.97 && !bittiMi(key) ? yer : null;
}

/* ---------- Günün maddesi / günün suâli ---------- */

/** Eski loadGununMaddesi: yerel saatle yılın günü % madde sayısı (api/rss.js ile aynı; Türkiye için birebir). */
export function gununMaddesiSirasi(tarih = new Date(), maddeSayisi = 241) {
  const yilinGunu = Math.floor((tarih - new Date(tarih.getFullYear(), 0, 0)) / 86400000);
  return maddeSayisi > 0 ? yilinGunu % maddeSayisi : 0;
}
/** Kitap sırasındaki madde dizisinden günün maddesi. */
export function gununMaddesi(maddeler, tarih = new Date()) {
  return Array.isArray(maddeler) && maddeler.length ? maddeler[gununMaddesiSirasi(tarih, maddeler.length)] : null;
}
/** Eski getGununBilgisi: yerel gece yarısında değişen gün sayısı (+offset) % uzunluk. offset<0 = önceki günler. */
export function gununSualiSirasi(tarih = new Date(), uzunluk, offset = 0) {
  if (!(uzunluk > 0)) return -1;
  const gun = Math.floor((tarih.getTime() - tarih.getTimezoneOffset() * 60000) / 86400000);
  let i = (gun + (offset || 0)) % uzunluk;
  if (i < 0) i += uzunluk;
  return i;
}

export const okumaPlani = {
  DAKIKADA_HARF, VARSAYILAN_UZUNLUK, SURELER,
  yerelGun, gunFarki, sureYazi, toplamHarf, sureSecenekleri, planDurumu, planTakvimi,
  otomatikBitirmeSuresi, otomatikBitirilmeli,
  durum, takvim, aktifMi, bittiMi, planKur, planSil, yeniHatim, maddeBitir, okumaYeriKaydet, donulecekYer,
  gununMaddesiSirasi, gununMaddesi, gununSualiSirasi
};
export default okumaPlani;
