/* Gösterim biçimleri. Bunlar yalnız GÖSTERİM içindir; veriyi ve kitabın metnini değiştirmez. */

/** Düz kesmeyi tipografik kesmeye çevirir (arayüz etiketleri ve künyeler için; kitap metnine uygulanmaz). */
export const kesme = s => String(s ?? '').replace(/'/g, '’');

/** İzâfet çizgisinde satır bölünmesini önler: "Ahmed-i" → "Ahmed-⁠i" (U+2060). Başlık ve isimlerde kullanın. */
export const bitisik = s => String(s ?? '').replace(/(\p{L})-(?=\p{L})/gu, '$1-⁠');

/** Başlık/isim için ikisi birden. */
export const ad = s => bitisik(kesme(s));

const sayiBicimi = new Intl.NumberFormat('tr-TR');
/** 9863 → "9.863" */
export const sayi = n => (n === null || n === undefined || Number.isNaN(+n) ? '' : sayiBicimi.format(+n));

/** Sahîfe aralığı: (17, 21) → "17–21"; (17, 17) → "17" */
export function sahife(bas, son) {
  if (bas === null || bas === undefined || bas === '') return '';
  return son && +son !== +bas ? `${bas}–${son}` : String(bas);
}

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
/** 17 Kasım 2026 Salı */
export function tarih(t = new Date(), { gun = true } = {}) {
  return `${t.getDate()} ${AYLAR[t.getMonth()]} ${t.getFullYear()}` + (gun ? ` ${GUNLER[t.getDay()]}` : '');
}

/** Süre: 95 → "1 sa 35 dk"; 40 → "40 dk" */
export function sure(dakika) {
  const d = Math.max(0, Math.round(dakika));
  const sa = Math.floor(d / 60), dk = d % 60;
  return sa ? (dk ? `${sa} sa ${dk} dk` : `${sa} sa`) : `${dk} dk`;
}

/** Okuma süresi tahmini: eski sitedeki ölçü, dakikada 1100 harf. */
export const okumaDakikasi = harf => Math.max(1, Math.round((+harf || 0) / 1100));

const ROMA = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const roma = n => ROMA[n] || String(n);
const SIRA = ['', 'Birinci', 'İkinci', 'Üçüncü'];
/** 1 → "Birinci Kısım" */
export const kisimAdi = n => `${SIRA[n] || n + '.'} Kısım`;
