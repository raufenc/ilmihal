// kaynak: tools/yeni-site/namaz-hesap.mjs, sınaması aynı klasörde (namaz-hesap.test.mjs).
// Bu dosya o modülün DEĞİŞTİRİLMEMİŞ kopyasıdır; hesapta bir değişiklik gerekirse önce kaynakta yapılıp sınanır, sonra buraya kopyalanır.
// ============================================================================
// namaz-hesap.mjs — ilmihal.org "Namaz Vakitleri" sayfasının hesap çekirdeği
// ----------------------------------------------------------------------------
// Kaynak: namaz-vakitleri/index.html, satır 551–815 (eski sayfa). Bu modül o
// hesabı DAVRANIŞI DEĞİŞTİRMEDEN, DOM'suz ve bağımlılıksız saf işlevlere taşır.
// Eski sayfadaki her işlevin karşılığı yanında satır numarasıyla yazılıdır.
//
// Kitap: Se'âdet-i Ebediyye, 1. kısım, 60. madde "Nemâz Vaktleri" (s. 175–203).
// Astronomi: NOAA güneş hesabı (Meeus, "Astronomical Algorithms" kısaltması).
//
// Birimler: açılar derece; vakitler "o günün yerel müşterek saatine göre gece
// yarısından itibaren dakika" (ör. 750 = 12:30). Saat dilimi saat olarak verilir
// (Türkiye +3). Yaz saati UYGULANMAZ: saatDilimi neyse odur (eski sayfa gibi).
//
// Ad karşılıkları:
//   meyl            = meyl-i şems, güneşin meyli (declination, δ)
//   tadiliZeman     = ta'dîl-i zemân (equation of time), dakika; + iken hakîkî
//                     zevâl vasatî 12'den öncedir (kitap s. 193)
//   fadliDair       = fadl-ı dâir zâviyesi H (hour angle), derece; ×4 = dakika
//   gayeIrtifa      = gâyet-ül-irtifâ', zevâldeki irtifâ' (s. 196)
//   feyiZeval       = fey-i zevâl, 1 birim çubuğun zevâldeki gölgesi (s. 196)
//   temkin          = hakîkî vakit ile şer'î vakit arasındaki fark (s. 186)
// ============================================================================

export const DERECE = Math.PI / 180;            // eski: DEG (satır 555)
export const RADYAN = 180 / Math.PI;            // eski: RAD (satır 556)

/** Eski sayfadaki sabit temkin: İstanbul için vasatî 10 dakika (kitap s. 186). Satır 561. */
export const TEMKIN_DK = 10;

/**
 * Vakitlerin güneş merkezinin hakîkî ufka göre irtifâ'ları (derece). Satır 686–687, 723–734.
 * fecr −19 (s. 176, 198), işâ-i evvel −17, işâ-i sânî −19 (s. 178, 197),
 * iştibâk-i nücûm −10 (s. 178), işrâk ve isfirâr +5 (s. 199–201), tulû' ve gurûb 0 (s. 202).
 */
export const IRTIFALAR = Object.freeze({
  imsak: -19, gunes: 0, israk: 5, isfirar: 5, aksam: 0, istibak: -10, yatsiEvvel: -17, yatsiSani: -19,
});

/** Kâbe'nin konumu (kıble hesabı için; eski sayfada YOK, yeni sahne için eklendi). */
export const KABE = Object.freeze({ enlem: 21.4225, boylam: 39.8262 });

// ─── Zaman ─────────────────────────────────────────────────────────────────

/** Jülyen günü. Eski: julianDay (satır 589–594). saat = UT saati (kesirli, negatif olabilir). */
export function julyenGunu(yil, ay, gun, saat = 0) {
  let y = yil, m = ay;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + gun + (saat || 0) / 24 + B - 1524.5;
}

/** J2000'den itibaren Jülyen yüzyılı. Eski: julianCentury (satır 596). */
export function julyenYuzyili(jd) { return (jd - 2451545.0) / 36525.0; }

// ─── Güneşin yeri (NOAA) — eski satır 598–643 ─────────────────────────────

/** Güneşin vasatî tûlü L0 (derece). Satır 598–602. */
export function gunesVasatiTulu(T) {
  let L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
  if (L0 < 0) L0 += 360;
  return L0;
}
/** Vasatî anomali M (derece). Satır 603–605. */
export function gunesVasatiAnomali(T) { return 357.52911 + T * (35999.05029 - 0.0001537 * T); }
/** Yer yörüngesinin dış merkezliği e (beyzî yörünge, kitap s. 183). Satır 606–608. */
export function yorungeBasikligi(T) { return 0.016708634 - T * (0.000042037 + 0.0000001267 * T); }
/** Merkez denklemi C (derece). Satır 609–614. */
export function merkezDenklemi(T) {
  const M = gunesVasatiAnomali(T) * DERECE;
  return Math.sin(M) * (1.914602 - T * (0.004817 + 0.000014 * T))
       + Math.sin(2 * M) * (0.019993 - 0.000101 * T)
       + Math.sin(3 * M) * 0.000289;
}
/** Güneşin hakîkî tûlü. Satır 615. */
export function gunesHakikiTulu(T) { return gunesVasatiTulu(T) + merkezDenklemi(T); }
/** Görünen tûl λ (nutasyon ve sapınç düzeltmeli). Satır 616–619. */
export function gunesGorunenTulu(T) {
  const omega = 125.04 - 1934.136 * T;
  return gunesHakikiTulu(T) - 0.00569 - 0.00478 * Math.sin(omega * DERECE);
}
/** Vasatî mâil (husûf ile ekvator arası açı; kitapta 23° 27′, s. 184). Satır 620–622. */
export function vasatiMail(T) {
  return 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
}
/** Düzeltilmiş mâil ε. Satır 623–626. */
export function duzeltilmisMail(T) {
  const omega = 125.04 - 1934.136 * T;
  return vasatiMail(T) + 0.00256 * Math.cos(omega * DERECE);
}
/** Meyl-i şems δ (derece), Jülyen yüzyılından: sin δ = sin ε · sin λ. Eski: solarDeclination (satır 628–632). */
export function meylT(T) {
  const e = duzeltilmisMail(T) * DERECE;
  const lambda = gunesGorunenTulu(T) * DERECE;
  return Math.asin(Math.sin(e) * Math.sin(lambda)) * RADYAN;
}
/** Ta'dîl-i zemân (dakika), Jülyen yüzyılından. Eski: equationOfTime (satır 634–643). */
export function tadiliZemanT(T) {
  const epsilon = duzeltilmisMail(T) * DERECE;
  const L0 = gunesVasatiTulu(T) * DERECE;
  const e = yorungeBasikligi(T);
  const M = gunesVasatiAnomali(T) * DERECE;
  let y = Math.tan(epsilon / 2); y *= y;
  const eot = y * Math.sin(2 * L0) - 2 * e * Math.sin(M) + 4 * e * y * Math.sin(M) * Math.cos(2 * L0)
            - 0.5 * y * y * Math.sin(4 * L0) - 1.25 * e * e * Math.sin(2 * M);
  return 4 * eot * RADYAN;
}

// ─── Tarih/an yardımcıları ────────────────────────────────────────────────

/**
 * Tarihi {yil, ay, gun} biçimine getirir. Kabul: 'YYYY-MM-DD' metni, {yil,ay,gun}
 * veya Date (Date'in YEREL takvim günü alınır; eski sayfa da getFullYear/getMonth/getDate kullanır).
 */
export function tarihAyristir(tarih) {
  if (typeof tarih === 'string') {
    const m = /^(-?\d{1,4})-(\d{1,2})-(\d{1,2})/.exec(tarih);
    if (!m) throw new Error('Tarih YYYY-MM-DD olmalı: ' + tarih);
    return { yil: +m[1], ay: +m[2], gun: +m[3] };
  }
  if (tarih instanceof Date) return { yil: tarih.getFullYear(), ay: tarih.getMonth() + 1, gun: tarih.getDate() };
  if (tarih && 'yil' in tarih) return { yil: tarih.yil, ay: tarih.ay, gun: tarih.gun };
  throw new Error('Tanınmayan tarih: ' + tarih);
}

/** Bir anın (Date, UTC olarak yorumlanır) Jülyen yüzyılı. */
export function anJulyenYuzyili(an) {
  const d = an instanceof Date ? an : new Date(an);
  return julyenYuzyili(d.getTime() / 86400000 + 2440587.5);
}

/** Meyl-i şems (derece) verilen anda. `an`: Date/ms (UTC) veya tarih (o günün 12:00 UT'si). */
export function meyl(an) { return meylT(anVeyaGunT(an)); }

/** Ta'dîl-i zemân (dakika) verilen anda; + iken hakîkî zevâl vasatî 12'den öncedir. */
export function tadiliZeman(an) { return tadiliZemanT(anVeyaGunT(an)); }

function anVeyaGunT(an) {
  if (an instanceof Date || typeof an === 'number') return anJulyenYuzyili(an);
  const { yil, ay, gun } = tarihAyristir(an);
  return julyenYuzyili(julyenGunu(yil, ay, gun, 12));
}

// ─── Küresel üçgen (kitap s. 196–199) — eski satır 646–670 ────────────────

/**
 * Hakîkî zevâl, yerel müşterek saatle gece yarısından dakika:
 * 720 − 4·tûl − ta'dîl + 60·saatDilimi. Eski: solarNoon (satır 646–648).
 * (Kitap s. 190–193: bir tûl derecesi 4 dakika; ta'dîl + ise zevâl 12'den önce.)
 */
export function hakikiZevalDakika(boylam, saatDilimi, tadil) { return 720 - 4 * boylam - tadil + saatDilimi * 60; }

/**
 * Fadl-ı dâir H (derece): güneş merkezi hakîkî ufuktan `irtifa` derecede iken
 * nısf-ün-nehârdan saat açısı. cos H = (sin h − sin φ sin δ) / (cos φ cos δ)
 * (kitap s. 199, (3) numaralı müsâvât, "hep payındaki (–) işâreti" şekli).
 * Güneş o irtifâa hiç varmıyorsa NaN döner. Eski: sunriseHourAngle (satır 651–656).
 */
export function fadliDair(enlem, meylDer, irtifa) {
  const latR = enlem * DERECE, decR = meylDer * DERECE, altR = irtifa * DERECE;
  const cosH = (Math.sin(altR) - Math.sin(latR) * Math.sin(decR)) / (Math.cos(latR) * Math.cos(decR));
  if (cosH > 1 || cosH < -1) return NaN;
  return Math.acos(cosH) * RADYAN;
}

/** Saat açısından irtifâ': sin h = sin φ sin δ + cos φ cos δ cos H. Eski: solarAltitude (satır 658–661). */
export function irtifaHesapla(enlem, meylDer, saatAcisi) {
  const latR = enlem * DERECE, decR = meylDer * DERECE, haR = saatAcisi * DERECE;
  return Math.asin(Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(haR)) * RADYAN;
}

/**
 * Semt (azimut), kuzeyden saat yönünde derece (doğu 90, güney 180, batı 270).
 * Eski: solarAzimuth (satır 663–670). Not: enlem ±90 ve irtifâ ±90'da tanımsızdır.
 */
export function semtHesapla(enlem, meylDer, saatAcisi, irtifa) {
  const latR = enlem * DERECE, decR = meylDer * DERECE, altR = irtifa * DERECE;
  let cosAz = (Math.sin(decR) - Math.sin(altR) * Math.sin(latR)) / (Math.cos(altR) * Math.cos(latR));
  cosAz = Math.max(-1, Math.min(1, cosAz));
  let az = Math.acos(cosAz) * RADYAN;
  if (saatAcisi > 0) az = 360 - az;
  return az;
}

/** Dakikayı "SS:DD" yapar; en yakın dakikaya yuvarlar; NaN → "--:--". Eski: minutesToHM (satır 672–679). */
export function dakikaSaat(m) {
  if (isNaN(m)) return '--:--';
  m = ((m % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60);
  let mm = Math.round(m % 60);
  if (mm === 60) { h++; mm = 0; }
  return String(h % 24).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

/** Gâye irtifâ' = 90 − |φ − δ| (s. 196). Eski satır 713. */
export function gayeIrtifa(enlem, meylDer) { return 90 - Math.abs(enlem - meylDer); }

/** Fey-i zevâl = tan(90 − gâye irtifâ') (s. 196). Eski satır 722. */
export function feyiZeval(enlem, meylDer) { return Math.tan((90 - gayeIrtifa(enlem, meylDer)) * DERECE); }

/**
 * Asr irtifâ'ı: tan(temâm-ı irtifâ') = kat + fey-i zevâl (s. 196–197); kat = 1 asr-ı evvel, 2 asr-ı sânî.
 * Eski satır 715. DİKKAT: eski sayfa burada fey-i zevâli, zevâldeki meyl yerine o
 * yinelemedeki (ikindi anındaki) meyl ile hesaplar; davranış korunmuştur.
 */
export function asrIrtifa(kat, enlem, meylDer) {
  return Math.atan(1 / (kat + Math.tan((90 - gayeIrtifa(enlem, meylDer)) * DERECE))) * RADYAN;
}

// ─── Vakitler — eski calcPrayerTimes (satır 689–738) ──────────────────────

/**
 * Bir vaktin hakîkî zamanı (temkinsiz), dakika. Eski iç işlev hakikiVakit (satır 696–711):
 * öğle 12:00'den başlar, meyl ve ta'dîl o âna göre 3 kez yinelenerek düzeltilir.
 * isaret: −1 zevâlden önce, +1 sonra, 0 zevâlin kendisi.
 * @returns {{t:number, meyl:number, tadil:number}}
 */
export function hakikiVakit({ yil, ay, gun }, enlem, boylam, saatDilimi, isaret, irtifaFn) {
  let dk = 720, sonuc = NaN, dec = 0, eot = 0;
  for (let i = 0; i < 3; i++) {
    const T = julyenYuzyili(julyenGunu(yil, ay, gun, dk / 60 - saatDilimi));
    dec = meylT(T); eot = tadiliZemanT(T);
    const zeval = hakikiZevalDakika(boylam, saatDilimi, eot);
    if (isaret === 0) { sonuc = zeval; }
    else {
      const H = fadliDair(enlem, dec, irtifaFn(dec));
      if (isNaN(H)) return { t: NaN, meyl: dec, tadil: eot };
      sonuc = zeval + isaret * 4 * H;
    }
    dk = sonuc;
  }
  return { t: sonuc, meyl: dec, tadil: eot };
}

/** Vakitlerin sırası ve adları (eski sayfadaki cedvel, satır 1230–1243). */
export const VAKIT_ADLARI = Object.freeze([
  ['imsak', 'İmsâk (fecr-i sâdık)', true],
  ['gunes', "Güneş (şer'î tulû')", true],
  ['israk', 'İşrâk (kuşluk)', false],
  ['zevalBaslangici', 'Zevâl (kerâhet) başlangıcı', false],
  ['ogle', 'Öğle (zuhr)', true],
  ['asrEvvel', 'İkindi (asr-ı evvel)', true],
  ['asrSani', 'Asr-ı sânî', false],
  ['isfirar', 'İsfirâr-ı şems', false],
  ['aksam', "Akşam (şer'î gurûb)", true],
  ['istibak', 'İştibâk-i nücûm', false],
  ['yatsiEvvel', 'Yatsı (işâ-i evvel)', true],
  ['yatsiSani', 'İşâ-i sânî', false],
]);

/**
 * Bir gün ve yer için bütün vakitler.
 * @param {object} p
 * @param {string|Date|{yil,ay,gun}} p.tarih
 * @param {number} p.enlem   arz-ı belde (kuzey +)
 * @param {number} p.boylam  tûl (doğu +)
 * @param {number} p.saatDilimi  saat (Türkiye 3). Yaz saati varsa çağıran ekler.
 * @param {number} [p.temkin=10] dakika. Eski sayfa her yer için 10 kullanır.
 * @param {number} [p.rakim]  metre. ESKİ SAYFA VAKİTLERDE RAKIMI KULLANMAZ; burada da
 *                            vakitleri değiştirmez, yalnız `temkinUnsurlari` için geri verilir.
 * @returns {{meyl, tadil, temkin, gayeIrtifa, feyiZeval, hakikiZeval,
 *            vakitler: Object<string,{ad, ana, irtifa, hakiki, temkinli, hakikiSaat, saat, temkinYonu}>}}
 *   hakiki   = güneş merkezinin hakîkî ufka göre vaktin irtifâına geldiği an (temkinsiz)
 *   temkinli = sayfanın gösterdiği şer'î vakit (zevâlden önce − temkin, sonra + temkin; s. 187–188)
 */
export function vakitler({ tarih, enlem, boylam, saatDilimi, temkin = TEMKIN_DK, rakim = null }) {
  const g = tarihAyristir(tarih);
  const hv = (isaret, fn) => hakikiVakit(g, enlem, boylam, saatDilimi, isaret, fn);
  const sabit = a => () => a;
  const asr = kat => dec => asrIrtifa(kat, enlem, dec);

  const z = hv(0);
  const ham = {
    imsak:      [hv(-1, sabit(IRTIFALAR.imsak)).t, -1, IRTIFALAR.imsak],
    gunes:      [hv(-1, sabit(IRTIFALAR.gunes)).t, -1, IRTIFALAR.gunes],
    israk:      [hv(-1, sabit(IRTIFALAR.israk)).t, +1, IRTIFALAR.israk],     // işrâka temkin EKLENİR (s. 200–201)
    zevalBaslangici: [z.t, -1, null],                                         // şer'î zevâl başı (s. 202)
    ogle:       [z.t, +1, null],
    asrEvvel:   [hv(1, asr(1)).t, +1, 'asr-1'],
    asrSani:    [hv(1, asr(2)).t, +1, 'asr-2'],
    isfirar:    [hv(1, sabit(IRTIFALAR.isfirar)).t, 0, IRTIFALAR.isfirar],    // isfirâr değiştirilmez (s. 201)
    aksam:      [hv(1, sabit(IRTIFALAR.aksam)).t, +1, IRTIFALAR.aksam],
    istibak:    [hv(1, sabit(IRTIFALAR.istibak)).t, +1, IRTIFALAR.istibak],
    yatsiEvvel: [hv(1, sabit(IRTIFALAR.yatsiEvvel)).t, +1, IRTIFALAR.yatsiEvvel],
    yatsiSani:  [hv(1, sabit(IRTIFALAR.yatsiSani)).t, +1, IRTIFALAR.yatsiSani],
  };
  const vk = {};
  for (const [anahtar, ad, ana] of VAKIT_ADLARI) {
    const [hakiki, yon, irt] = ham[anahtar];
    const temkinli = hakiki + yon * temkin;
    vk[anahtar] = {
      ad, ana, irtifa: irt === 'asr-1' ? asrIrtifa(1, enlem, z.meyl) : irt === 'asr-2' ? asrIrtifa(2, enlem, z.meyl) : irt,
      hakiki, temkinli, temkinYonu: yon,
      hakikiSaat: dakikaSaat(hakiki), saat: dakikaSaat(temkinli),
    };
  }
  return {
    tarih: g, enlem, boylam, saatDilimi, temkin, rakim,
    meyl: z.meyl, tadil: z.tadil,
    hakikiZeval: z.t,
    gayeIrtifa: gayeIrtifa(enlem, z.meyl),
    feyiZeval: feyiZeval(enlem, z.meyl),
    vakitler: vk,
  };
}

/**
 * Eski calcPrayerTimes'ın döndürdüğü nesnenin AYNISI (alan adları dâhil): eski sayfa ile
 * birebir karşılaştırma için. Alanlar: dec, eot, temkin, noon, maxAlt, feyZeval, imsak, gunes,
 * israk, zevalBas, ogle, ikindiEvvel, ikindiSani, kerahet, aksam, istibak, yatsiIma, yatsiImam.
 */
export function eskiCalcPrayerTimes(tarih, sehir) {
  const v = vakitler({ tarih, enlem: sehir.lat, boylam: sehir.lon, saatDilimi: sehir.tz, temkin: TEMKIN_DK });
  const k = v.vakitler;
  return {
    dec: v.meyl, eot: v.tadil, temkin: v.temkin, noon: v.hakikiZeval, maxAlt: v.gayeIrtifa, feyZeval: v.feyiZeval,
    imsak: k.imsak.temkinli, gunes: k.gunes.temkinli, israk: k.israk.temkinli, zevalBas: k.zevalBaslangici.temkinli,
    ogle: k.ogle.temkinli, ikindiEvvel: k.asrEvvel.temkinli, ikindiSani: k.asrSani.temkinli, kerahet: k.isfirar.temkinli,
    aksam: k.aksam.temkinli, istibak: k.istibak.temkinli, yatsiIma: k.yatsiEvvel.temkinli, yatsiImam: k.yatsiSani.temkinli,
  };
}

/**
 * Dahve-i kübrâ (s. 179): şer'î gündüzün (imsâk–şer'î gurûb) yarısı = (imsâk + akşam) / 2.
 * ESKİ SAYFADA YOK; kitaptaki tarif için eklendi. İmsâk yoksa (yüksek arz) NaN.
 */
export function dahveiKubra(v) { return (v.vakitler.imsak.temkinli + v.vakitler.aksam.temkinli) / 2; }

// ─── Güneş konumu, gün yayı, alt nokta (3B sahne) ─────────────────────────

/**
 * Yerel müşterek saatle `dakika` anında güneşin konumu. Eski: getSunPosAtMinute (satır 803–815).
 * @returns {{irtifa, semt, meyl, saatAcisi, tadil}} saatAcisi derece, öğleden sonra +.
 */
export function gunesKonumuDakika(tarih, dakika, enlem, boylam, saatDilimi) {
  const { yil, ay, gun } = tarihAyristir(tarih);
  const T = julyenYuzyili(julyenGunu(yil, ay, gun, dakika / 60 - saatDilimi));
  const dec = meylT(T);
  const eot = tadiliZemanT(T);
  const noon = hakikiZevalDakika(boylam, saatDilimi, eot);
  const ha = (dakika - noon) / 4;
  const alt = irtifaHesapla(enlem, dec, ha);
  const az = semtHesapla(enlem, dec, ha, alt);
  return { irtifa: alt, semt: az, meyl: dec, saatAcisi: ha, tadil: eot };
}

/**
 * Verilen an (Date veya UTC ms) ve yer için güneşin semt ve irtifâ'ı (hakîkî, kırılmasız, merkez).
 * Saat açısı = 15·(UT saat) + boylam − 180 + ta'dîl/4 (eski hesapla aynı bağıntı).
 */
export function gunesKonumu(an, enlem, boylam) {
  const d = an instanceof Date ? an : new Date(an);
  const T = anJulyenYuzyili(d);
  const dec = meylT(T), eot = tadiliZemanT(T);
  const utDk = ((d.getTime() / 60000) % 1440 + 1440) % 1440;
  let ha = (utDk - (720 - 4 * boylam - eot)) / 4;   // = (dakika − hakîkî zevâl)/4, saatDilimi=0 ile
  ha = ((ha + 180) % 360 + 360) % 360 - 180;
  const alt = irtifaHesapla(enlem, dec, ha);
  return { irtifa: alt, semt: semtHesapla(enlem, dec, ha, alt), meyl: dec, saatAcisi: ha, tadil: eot };
}

/**
 * Gün yayı: gün boyu (00:00–24:00 yerel müşterek saat) güneşin yolu.
 * @returns {Array<{dakika, saat, irtifa, semt}>}
 */
export function gunYayi({ tarih, enlem, boylam, saatDilimi, adimDk = 10 }) {
  const n = [];
  for (let dk = 0; dk <= 1440; dk += adimDk) {
    const p = gunesKonumuDakika(tarih, dk, enlem, boylam, saatDilimi);
    n.push({ dakika: dk, saat: dakikaSaat(dk), irtifa: p.irtifa, semt: p.semt });
  }
  return n;
}

/**
 * Her vaktin (hakîkî ve temkinli anında) güneş konumu.
 * @returns {Object<string,{hakiki:{dakika,irtifa,semt}, temkinli:{dakika,irtifa,semt}}>}
 */
export function vakitKonumlari(p) {
  const v = vakitler(p), s = {};
  for (const [k, x] of Object.entries(v.vakitler)) {
    const f = dk => isNaN(dk) ? null : { dakika: dk, ...pick(gunesKonumuDakika(p.tarih, dk, p.enlem, p.boylam, p.saatDilimi)) };
    s[k] = { hakiki: f(x.hakiki), temkinli: f(x.temkinli) };
  }
  return s;
}
function pick(o) { return { irtifa: o.irtifa, semt: o.semt }; }

/**
 * Güneşin alt noktası (zenit noktası; gece-gündüz sınırının merkezi): güneşin tam tepede
 * olduğu yer. enlem = meyl; boylam = (720 − UT dakika − ta'dîl)/4, [−180, 180).
 * Terminatör: bu noktadan 90° uzaklıktaki büyük daire. ESKİ SAYFADA YOK.
 */
export function gunesAltNoktasi(an) {
  const d = an instanceof Date ? an : new Date(an);
  const T = anJulyenYuzyili(d);
  const dec = meylT(T), eot = tadiliZemanT(T);
  const utDk = ((d.getTime() / 60000) % 1440 + 1440) % 1440;
  let lon = (720 - utDk - eot) / 4;
  lon = ((lon + 180) % 360 + 360) % 360 - 180;
  return { enlem: dec, boylam: lon };
}

/**
 * Kıble açısı: kuzeyden saat yönünde, büyük daire başlangıç yönü (derece). ESKİ SAYFADA YOK.
 * tan q = sin Δλ / (cos φ tan φk − sin φ cos Δλ).
 */
export function kibleAcisi(enlem, boylam) {
  const f = enlem * DERECE, fk = KABE.enlem * DERECE, dl = (KABE.boylam - boylam) * DERECE;
  const q = Math.atan2(Math.sin(dl), Math.cos(f) * Math.tan(fk) - Math.sin(f) * Math.cos(dl)) * RADYAN;
  return (q + 360) % 360;
}

// ─── Temkin (kitap s. 185–186, cedvel s. 1244) — eski satır 743–801 ─────────

/**
 * Temkin cedveli (eski sayfa satır 743–765, "kitap s. 1244'ten aynen" diye işaretli;
 * bu cedvelin kitap metniyle karşılaştırılması DOĞRULANMADI: texts/ içinde bulunmadı).
 * Satırlar yükseklik 0–500 m (25 m aralık), sütunlar arz 0°–60° (3° aralık); "dakika.saniye".
 */
export const TEMKIN_CEDVELI = Object.freeze([
  [3.49,3.49,3.51,3.53,3.55,3.58,4.02,4.06,4.12,4.20,4.29,4.42,4.57,5.13,5.33,5.57,6.28,7.09,8.06,9.25,11.44],
  [4.38,4.38,4.39,4.41,4.45,4.49,4.54,5.01,5.08,5.19,5.31,5.41,5.59,6.20,6.42,7.13,7.52,8.40,9.54,11.20,14.20],
  [4.58,4.58,5.00,5.02,5.06,5.10,5.16,5.23,5.31,5.42,5.54,6.08,6.27,6.48,7.14,7.46,8.28,9.19,10.38,12.19,15.27],
  [5.16,5.16,5.18,5.21,5.24,5.29,5.36,5.43,5.52,6.03,6.12,6.27,6.50,7.10,7.38,8.12,8.59,9.54,11.11,13.05,16.26],
  [5.27,5.27,5.29,5.30,5.35,5.40,5.47,5.55,6.05,6.15,6.27,6.44,7.04,7.28,7.56,8.33,9.19,10.16,11.39,13.39,17.06],
  [5.38,5.39,5.40,5.42,5.46,5.53,6.00,6.07,6.17,6.27,6.41,6.58,7.19,7.44,8.14,8.51,9.38,10.39,12.05,14.08,17.42],
  [5.49,5.50,5.52,5.54,5.58,6.03,6.11,6.19,6.29,6.40,6.54,7.12,7.34,7.59,8.30,9.08,9.57,11.00,12.28,14.35,18.17],
  [5.58,5.59,6.01,6.03,6.08,6.14,6.21,6.29,6.40,6.52,7.06,7.24,7.47,8.13,8.45,9.24,10.14,11.18,12.51,15.00,18.49],
  [6.08,6.09,6.10,6.13,6.17,6.23,6.31,6.39,6.50,7.03,7.18,7.36,7.59,8.26,8.59,9.39,10.30,11.36,13.11,15.23,19.21],
  [6.17,6.17,6.18,6.22,6.26,6.32,6.40,6.48,7.00,7.13,7.28,7.46,8.10,8.38,9.12,9.53,10.45,11.53,13.31,15.45,19.51],
  [6.25,6.25,6.26,6.30,6.35,6.41,6.49,6.57,7.09,7.22,7.38,7.57,8.21,8.49,9.24,10.06,10.59,12.09,13.49,16.06,20.20],
  [6.31,6.33,6.34,6.38,6.41,6.47,6.57,7.06,7.18,7.32,7.48,8.06,8.31,9.00,9.35,10.18,11.13,12.25,14.06,16.26,20.48],
  [6.40,6.41,6.42,6.46,6.51,6.57,7.05,7.14,7.26,7.40,7.57,8.16,8.41,9.12,9.46,10.30,11.26,12.40,14.23,16.46,21.15],
  [6.47,6.48,6.49,6.53,6.58,7.05,7.12,7.22,7.34,7.49,8.05,8.25,8.52,9.21,9.57,10.41,11.39,12.54,14.38,17.05,21.41],
  [6.54,6.55,6.56,7.00,7.05,7.13,7.20,7.30,7.42,7.57,8.13,8.32,9.01,9.31,10.07,10.52,11.51,13.07,14.53,17.25,22.05],
  [7.01,7.02,7.04,7.07,7.12,7.19,7.27,7.37,7.49,8.05,8.22,8.42,9.10,9.40,10.17,11.03,12.03,13.20,15.08,17.44,22.31],
  [7.08,7.09,7.11,7.14,7.19,7.25,7.34,7.45,7.57,8.12,8.30,8.51,9.18,9.49,10.27,11.14,12.15,13.32,15.23,18.03,22.55],
  [7.14,7.15,7.17,7.20,7.25,7.32,7.41,7.51,8.04,8.20,8.37,8.58,9.26,9.58,10.34,11.24,12.26,13.44,15.38,18.22,23.17],
  [7.20,7.21,7.23,7.26,7.32,7.38,7.47,7.58,8.11,8.26,8.44,9.06,9.34,10.07,10.42,11.34,12.37,13.56,15.53,18.40,23.38],
  [7.26,7.27,7.29,7.32,7.38,7.44,7.54,8.04,8.18,8.34,8.52,9.13,9.42,10.15,10.50,11.44,12.48,14.08,16.08,18.58,23.59],
  [7.32,7.33,7.35,7.39,7.44,7.51,8.00,8.11,8.25,8.41,8.59,9.21,9.50,10.23,10.58,11.53,12.58,14.20,16.18,19.15,24.20],
].map(r => Object.freeze(r)));

/** "dakika.saniye" → dakika. Eski: dkSnDakika (satır 768). */
export function dkSnDakika(v) { const dk = Math.floor(v); return dk + Math.round((v - dk) * 100) / 60; }

/** Cedvelden temkin (dakika), arz ve yükseklikte doğrusal ara değer. Eski: temkinCedvelden (satır 771–778). */
export function temkinCedvelden(enlem, yukseklik) {
  const a = Math.max(0, Math.min(60, Math.abs(enlem))) / 3;
  const e = Math.max(0, Math.min(500, yukseklik)) / 25;
  const a0 = Math.min(Math.floor(a), 19), e0 = Math.min(Math.floor(e), 19);
  const fa = a - a0, fe = e - e0;
  const v = (i, j) => dkSnDakika(TEMKIN_CEDVELI[i][j]);
  return v(e0, a0) * (1 - fa) * (1 - fe) + v(e0, a0 + 1) * fa * (1 - fe) + v(e0 + 1, a0) * (1 - fa) * fe + v(e0 + 1, a0 + 1) * fa * fe;
}

/**
 * Temkin unsurları (s. 185–186): inhitât-ı ufuk + inkisâr + nısf-ı kutr − ihtilâf-ı manzar = irtifâ zâviyesi;
 * temkin = merkezin hakîkî ufuktan bu kadar inmesi için geçen zaman. Eski: calcTemkinComponents (satır 782–801).
 * Eski sayfa meyli o günün hakîkî zevâlindeki meyl olarak alır (pt.dec).
 * @param {{tarih, enlem, boylam, saatDilimi, yukseklik}} p  yukseklik: en yüksek yerin yüksekliği (m)
 */
export function temkinUnsurlari({ tarih, enlem, boylam, saatDilimi, yukseklik }) {
  const Y = Math.max(0, yukseklik);
  const dipArcmin = 106.92 * Math.sqrt(Y) / 60;     // inhitât-ı ufuk: 106,92″ × √Y (Ahmed Ziyâ beğ, s. 185)
  const refractionArcmin = 44.5;                    // inkisâr 44,5′ (s. 185)
  const semiDiamArcmin = 15.75;                     // nısf-ı kutr-ı zâhirî 15′45″ (s. 185)
  const parallaxArcmin = 8.8 / 60;                  // ihtilâf-ı manzar 8,8″ (çıkarılır)
  const totalArcmin = dipArcmin + refractionArcmin + semiDiamArcmin - parallaxArcmin;
  const dec = vakitler({ tarih, enlem, boylam, saatDilimi }).meyl;
  const H0 = fadliDair(enlem, dec, 0);
  const H1 = fadliDair(enlem, dec, -totalArcmin / 60);
  const hesapDk = (H1 - H0) * 4;
  return {
    yukseklik: Y, inhitatDk: dipArcmin, inkisarDk: refractionArcmin, nisfKutrDk: semiDiamArcmin,
    ihtilafiManzarDk: parallaxArcmin, irtifaZaviyesiDk: totalArcmin, irtifaZaviyesi: totalArcmin / 60,
    hesapDk,                                   // bu gün için hesap
    cedvelDk: temkinCedvelden(enlem, Y),       // eski sayfanın cedveli
    ihtiyatliDk: hesapDk + 2,                  // iki dakika ihtiyât ile (s. 186)
  };
}

/**
 * Kitabın temkin yaklaşık düstûru (s. 203, (4)): N (saat) = sin(0,03·√Y + 1,05) / (cos φ · cos δ) × 3,82.
 * ESKİ SAYFADA KULLANILMAZ; karşılaştırma için. Dakika döner.
 */
export function temkinKitapYaklasik(enlem, meylDer, yukseklik) {
  const a = (0.03 * Math.sqrt(Math.max(0, yukseklik)) + 1.05) * DERECE;
  return Math.sin(a) / (Math.cos(enlem * DERECE) * Math.cos(meylDer * DERECE)) * 3.82 * 60;
}

// ─── Ta'dîl grafiğindeki İKİNCİ formül (eski satır 1514–1525) ─────────────

/**
 * Eski sayfanın Ta'dîl-i Zemân grafiği bölümünde kullanılan AYRI yaklaşık formül (Spencer 1971 türü).
 * Üstteki cedvel ve vakitler `tadiliZemanT` (NOAA) kullanır; grafik bunu kullanır. Tarih: Date (yerel).
 */
export function tadiliZemanGrafik(date) {
  const s = new Date(date.getFullYear(), 0, 1);
  const N = Math.floor((date - s) / 86400000) + 1;
  const y = date.getFullYear();
  const days = ((y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)) ? 366 : 365;
  const g = 2 * Math.PI / days * (N - 1);
  return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
}

/** Eski sayfadaki şehir listesi (satır 563–584). */
export const ESKI_SEHIRLER = Object.freeze([
  { name:'İstanbul',   lat:41.0082, lon:28.9784, tz:3 },
  { name:'Ankara',     lat:39.9334, lon:32.8597, tz:3 },
  { name:'İzmir',      lat:38.4192, lon:27.1287, tz:3 },
  { name:'Bursa',      lat:40.1885, lon:29.0610, tz:3 },
  { name:'Antalya',    lat:36.8969, lon:30.7133, tz:3 },
  { name:'Konya',      lat:37.8746, lon:32.4932, tz:3 },
  { name:'Adana',      lat:37.0000, lon:35.3213, tz:3 },
  { name:'Gaziantep',  lat:37.0662, lon:37.3833, tz:3 },
  { name:'Diyarbakır', lat:37.9144, lon:40.2306, tz:3 },
  { name:'Trabzon',    lat:41.0027, lon:39.7168, tz:3 },
  { name:'Erzurum',    lat:39.9043, lon:41.2679, tz:3 },
  { name:'Samsun',     lat:41.2867, lon:36.3300, tz:3 },
  { name:'Kayseri',    lat:38.7312, lon:35.4787, tz:3 },
  { name:'Eskişehir',  lat:39.7767, lon:30.5206, tz:3 },
  { name:'Edirne',     lat:41.6818, lon:26.5623, tz:3 },
  { name:'Van',        lat:38.4891, lon:43.3800, tz:3 },
  { name:'Sivas',      lat:39.7477, lon:37.0179, tz:3 },
  { name:'Malatya',    lat:38.3554, lon:38.3335, tz:3 },
  { name:'Şanlıurfa',  lat:37.1591, lon:38.7969, tz:3 },
  { name:'Hatay',      lat:36.2025, lon:36.1606, tz:3 },
].map(s => Object.freeze(s)));
