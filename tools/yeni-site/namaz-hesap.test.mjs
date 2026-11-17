// ============================================================================
// namaz-hesap.test.mjs — namaz-hesap.mjs için sınama
//   node tools/yeni-site/namaz-hesap.test.mjs              (tarayıcılı: a + b + c)
//   node tools/yeni-site/namaz-hesap.test.mjs --tarayicisiz (yalnız b + c)
//
// (a) ESKİ SAYFA ile birebir: namaz-vakitleri/index.html başsız Chrome'da açılır
//     (Python playwright, channel="chrome", headless, --mute-audio; tek tarayıcı),
//     6 yer × 4 tarih için sayfanın "Vakit cedveli"nde GÖSTERDİĞİ 12 vakit okunur ve
//     modülün dakikaSaat(...) çıktısıyla karşılaştırılır. Ayrıca sayfanın kendi
//     calcPrayerTimes çıktısı (ham dakika) modülün ham dakikasıyla karşılaştırılır.
//     Yerel sunucu: kısa ömürlü `python3 -m http.server 8097`, iş bitince kapatılır.
//     Mekke, Londra, Taşkent sayfanın şehir listesinde YOK: sayfanın CITIES dizisine
//     ve seçim kutusuna eklenip sayfanın kendi akışıyla (change olayı) hesaplatılır.
// (b) Bağımsız doğruluk: meyl ve ta'dîl-i zemân bilinen değerlerle.
// (c) Kitaptaki misallerle (kitabın yılı belli değil; ±2,5 dk).
//     ¶N = texts/kisim1.json["60"].split("\n") içindeki N. satır (1'den sayılır).
// ============================================================================
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as N from './namaz-hesap.mjs';

const BURASI = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.resolve(BURASI, '..', '..');
const PYTHON = '/usr/local/bin/python3';
const TARAYICISIZ = process.argv.includes('--tarayicisiz');

let gecen = 0, kalan = 0;
const hatalar = [];
function denetle(sart, mesaj) { if (sart) gecen++; else { kalan++; hatalar.push(mesaj); } }

// ─── Yerler ve tarihler ────────────────────────────────────────────────────
const YERLER = [
  { name: 'İstanbul', lat: 41.0082, lon: 28.9784, tz: 3, eskiListede: true },
  { name: 'Ankara',   lat: 39.9334, lon: 32.8597, tz: 3, eskiListede: true },
  { name: 'Van',      lat: 38.4891, lon: 43.3800, tz: 3, eskiListede: true },
  { name: 'Mekke',    lat: 21.4225, lon: 39.8262, tz: 3 },
  { name: 'Londra',   lat: 51.5074, lon: -0.1278, tz: 0, yazSaati: 1 },   // BST: 29 Mart–25 Ekim 2026
  { name: 'Taşkent',  lat: 41.2995, lon: 69.2401, tz: 5 },
];
const TARIHLER = ['2026-03-20', '2026-06-21', '2026-09-23', '2026-12-21'];
const BST = t => t >= '2026-03-29' && t < '2026-10-25';
function yerTarih(yer, t) {
  const tz = yer.yazSaati && BST(t) ? yer.tz + yer.yazSaati : yer.tz;
  return { ...yer, tz, name: tz !== yer.tz ? yer.name + ' (yaz saati)' : yer.name };
}

// ─── (a) Eski sayfa: Python + playwright ──────────────────────────────────
const PY = String.raw`
import json, sys, subprocess, time, socket, os
from playwright.sync_api import sync_playwright
kok, istek = sys.argv[1], json.loads(sys.argv[2])
port = 8097
s = socket.socket()
if s.connect_ex(('127.0.0.1', port)) == 0:
    print(json.dumps({'hata': '8097 portu dolu'})); sys.exit(0)
s.close()
sunucu = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1', '--directory', kok],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
sonuc = []
try:
    for _ in range(50):
        s = socket.socket()
        if s.connect_ex(('127.0.0.1', port)) == 0: s.close(); break
        s.close(); time.sleep(0.1)
    with sync_playwright() as p:
        tarayici = p.chromium.launch(channel='chrome', headless=True, args=['--mute-audio'])
        try:
            sayfa = tarayici.new_page()
            sayfa.goto('http://127.0.0.1:%d/namaz-vakitleri/index.html' % port, wait_until='load')
            sayfa.wait_for_function('typeof calcPrayerTimes === "function" && document.querySelectorAll("#pr-grid .pr-item").length === 12')
            for is_ in istek:
                r = sayfa.evaluate('''([y, t]) => {
                  let i = CITIES.findIndex(c => c.name === y.name);
                  const sel = document.getElementById('gc-city');
                  if (i < 0) {
                    CITIES.push({ name: y.name, lat: y.lat, lon: y.lon, tz: y.tz });
                    i = CITIES.length - 1;
                    const o = document.createElement('option'); o.value = i; o.textContent = y.name; sel.appendChild(o);
                  }
                  const c = CITIES[i];
                  if (c.lat !== y.lat || c.lon !== y.lon || c.tz !== y.tz) return { hata: 'listedeki koordinat farklı: ' + y.name };
                  sel.value = String(i);
                  const d = document.getElementById('gc-date'); d.value = t;
                  d.dispatchEvent(new Event('change'));
                  const satirlar = [...document.querySelectorAll('#pr-grid .pr-item')].map(e => [
                    e.querySelector('.pr-name').textContent, e.querySelector('.pr-time').textContent]);
                  const ham0 = calcPrayerTimes(selectedDate, selectedCity); const ham = {}; for (const k in ham0) ham[k] = Number.isNaN(ham0[k]) ? null : ham0[k];
                  return { yer: y.name, tarih: t, baslik: document.getElementById('pr-baslik').textContent,
                           decl: document.getElementById('gc-decl').textContent, satirlar, ham,
                           dugmeler: [...document.querySelectorAll('.prayer-btn .pb-time')].map(e => e.textContent) };
                }''', [is_['yer'], is_['tarih']])
                sonuc.append(r)
        finally:
            tarayici.close()
finally:
    sunucu.terminate()
    try: sunucu.wait(timeout=5)
    except Exception: sunucu.kill()
print(json.dumps(sonuc, ensure_ascii=False))
`;

const ANAHTAR_SIRASI = ['imsak', 'gunes', 'israk', 'zevalBas', 'ogle', 'ikindiEvvel', 'ikindiSani', 'kerahet', 'aksam', 'istibak', 'yatsiIma', 'yatsiImam'];
const satirlarTablo = [];
let karsilastirmaSayisi = 0, birebirSayisi = 0, hamBirebir = 0, hamSayisi = 0;

if (!TARAYICISIZ) {
  const istek = [];
  for (const y of YERLER) for (const t of TARIHLER) istek.push({ yer: yerTarih(y, t), tarih: t });
  const r = spawnSync(PYTHON, ['-c', PY, KOK, JSON.stringify(istek)], { encoding: 'utf8', timeout: 180000 });
  if (r.status !== 0) { console.error(r.stderr); throw new Error('Python/playwright çalışmadı'); }
  const veri = JSON.parse(r.stdout.trim().split('\n').pop());
  if (veri.hata) throw new Error(veri.hata);
  for (const s of veri) {
    if (s.hata) { denetle(false, s.hata); continue; }
    const yer = istek.find(i => i.yer.name === s.yer && i.tarih === s.tarih).yer;
    const m = N.eskiCalcPrayerTimes(s.tarih, yer);
    const v = N.vakitler({ tarih: s.tarih, enlem: yer.lat, boylam: yer.lon, saatDilimi: yer.tz });
    const modulSaat = N.VAKIT_ADLARI.map(([k]) => v.vakitler[k].saat);
    let uyum = 0;
    s.satirlar.forEach(([ad, saat], i) => {
      karsilastirmaSayisi++;
      const ok = saat === modulSaat[i] && ad === N.VAKIT_ADLARI[i][1];
      if (ok) { birebirSayisi++; uyum++; }
      denetle(ok, `${s.yer} ${s.tarih} ${ad}: sayfa ${saat}, modül ${modulSaat[i]}`);
    });
    // Ham dakika (sayfanın calcPrayerTimes çıktısı) — kayan nokta eşitliği
    for (const k of ['dec', 'eot', 'noon', 'maxAlt', 'feyZeval', ...ANAHTAR_SIRASI]) {
      hamSayisi++;
      const a = s.ham[k], b = m[k];
      const ok = (a === null && Number.isNaN(b)) || a === b || Math.abs(a - b) < 1e-9;
      if (ok) hamBirebir++;
      denetle(ok, `${s.yer} ${s.tarih} ham ${k}: sayfa ${a}, modül ${b}`);
    }
    satirlarTablo.push({ yer: s.yer, tarih: s.tarih, sayfa: s.satirlar.map(x => x[1]), modul: modulSaat, uyum, decl: s.decl });
  }
}

// ─── (b) Bağımsız doğruluk ────────────────────────────────────────────────
const bTablo = [];
function bSatir(ad, hesap, beklenen, tolerans, birim, kaynak) {
  const fark = hesap - beklenen;
  const ok = Math.abs(fark) <= tolerans;
  denetle(ok, `${ad}: hesap ${hesap.toFixed(4)}, beklenen ${beklenen} (±${tolerans} ${birim})`);
  bTablo.push({ ad, hesap, beklenen, fark, tolerans, birim, ok, kaynak });
}
// Gündönümü / ekinoks anları 2026 (UT): 20 Mar 14:46, 21 Haz 08:24, 23 Eyl 00:05, 21 Ara 20:50
// (yaygın almanak değerleri; anlar dakika düzeyinde doğrulanmadı, tolerans buna göre geniş).
bSatir('Meyl, 21 Haz 2026 08:24 UT (yaz gündönümü)', N.meyl(new Date('2026-06-21T08:24:00Z')), 23.436, 0.01, '°', 'mâil ε≈23,436° (2026)');
bSatir('Meyl, 21 Ara 2026 20:50 UT (kış gündönümü)', N.meyl(new Date('2026-12-21T20:50:00Z')), -23.436, 0.01, '°', 'mâil ε≈23,436°');
bSatir('Meyl, 20 Mar 2026 14:46 UT (bahar ekinoksu)', N.meyl(new Date('2026-03-20T14:46:00Z')), 0, 0.02, '°', 'ekinoks anı');
bSatir('Meyl, 23 Eyl 2026 00:05 UT (güz ekinoksu)', N.meyl(new Date('2026-09-23T00:05:00Z')), 0, 0.02, '°', 'ekinoks anı');
// Yıl içi uçlar (günlük 12:00 UT taraması)
let enBuyukMeyl = -99, enKucukMeyl = 99, tadilMin = { v: 99 }, tadilMax = { v: -99 }, tadilMaxMayis = { v: -99 }, tadilMinTemmuz = { v: 99 };
let grafikFarkEnBuyuk = { v: 0 };
for (let d = new Date(Date.UTC(2026, 0, 1, 12)); d.getUTCFullYear() === 2026; d = new Date(d.getTime() + 86400000)) {
  const dec = N.meyl(d), e = N.tadiliZeman(d);
  enBuyukMeyl = Math.max(enBuyukMeyl, dec); enKucukMeyl = Math.min(enKucukMeyl, dec);
  const gun = d.toISOString().slice(0, 10);
  if (e < tadilMin.v) tadilMin = { v: e, gun };
  if (e > tadilMax.v) tadilMax = { v: e, gun };
  const ay = d.getUTCMonth();
  if (ay >= 3 && ay <= 5 && e > tadilMaxMayis.v) tadilMaxMayis = { v: e, gun };
  if (ay >= 6 && ay <= 7 && e < tadilMinTemmuz.v) tadilMinTemmuz = { v: e, gun };
  // Eski sayfanın grafik formülü (yerel 12:00) ile NOAA (o günün 12:00 UT'si) farkı
  const yerel = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12);
  const f = N.tadiliZemanGrafik(yerel) - e;
  if (Math.abs(f) > Math.abs(grafikFarkEnBuyuk.v)) grafikFarkEnBuyuk = { v: f, gun };
}
bSatir('Meyl yıllık en büyük (2026, 12:00 UT)', enBuyukMeyl, 23.436, 0.01, '°', 'mâil');
bSatir('Meyl yıllık en küçük (2026, 12:00 UT)', enKucukMeyl, -23.436, 0.01, '°', 'mâil');
bSatir(`Ta'dîl en küçük (${tadilMin.gun})`, tadilMin.v, -14.2, 0.2, 'dk', 'bilinen uç: ~11–12 Şubat, −14,2 dk');
bSatir(`Ta'dîl en büyük (${tadilMax.gun})`, tadilMax.v, 16.4, 0.2, 'dk', 'bilinen uç: ~3 Kasım, +16,4 dk');
bSatir(`Ta'dîl Mayıs ucu (${tadilMaxMayis.gun})`, tadilMaxMayis.v, 3.7, 0.2, 'dk', 'bilinen uç: ~14 Mayıs, +3,7 dk');
bSatir(`Ta'dîl Temmuz ucu (${tadilMinTemmuz.gun})`, tadilMinTemmuz.v, -6.5, 0.2, 'dk', 'bilinen uç: ~26 Temmuz, −6,5 dk');
const gunFark = (g, hedef) => Math.abs((Date.parse(g) - Date.parse(hedef)) / 86400000);
denetle(gunFark(tadilMin.gun, '2026-02-11') <= 2, `Ta'dîl en küçük günü ${tadilMin.gun} (beklenen ~11 Şubat ±2 gün)`);
denetle(gunFark(tadilMax.gun, '2026-11-03') <= 2, `Ta'dîl en büyük günü ${tadilMax.gun} (beklenen ~3 Kasım ±2 gün)`);
// Kitabın verdiği değerler (yıl belirtilmemiş; ±6′ ve ±1 dk tolerans)
const KITAP = [
  ['1 Mayıs meyl', '05-01', 14 + 55 / 60, 'meyl', '¶143'],
  ['1 Nisan meyl', '04-01', 4 + 20 / 60, 'meyl', '¶145'],
  ['13 Ağustos meyl', '08-13', 14 + 50 / 60, 'meyl', '¶213'],
  ['1 Şubat meyl', '02-01', -(17 + 15 / 60), 'meyl', '¶324'],
  ['1 Mayıs ta\'dîl', '05-01', 3, 'tadil', '¶143'],
  ['1 Nisan ta\'dîl', '04-01', -4, 'tadil', '¶145'],
  ['13 Ağustos ta\'dîl', '08-13', -5, 'tadil', '¶244'],
  ['1 Şubat ta\'dîl', '02-01', -(13 + 31 / 60), 'tadil', '¶324'],
  ['1 Mart ta\'dîl', '03-01', -13, 'tadil', '¶155'],
];
for (const [ad, ag, deger, tur, s] of KITAP) {
  // Kitap meyli "Londra sâati ile 00:00" için verir (¶288); ta'dîl için gün içi an önemsiz.
  // Yıl belirtilmediğinden (4 yıllık artık yıl kayması ~0,1°) tolerans meylde ±0,15°, ta'dîlde ±1 dk.
  const d = new Date(`1985-${ag}T00:00:00Z`);
  const h = tur === 'meyl' ? N.meyl(d) : N.tadiliZeman(d);
  bSatir(`Kitap: ${ad} (${s}) [1985, 00:00 UT]`, h, +deger.toFixed(4), tur === 'meyl' ? 0.15 : 1, tur === 'meyl' ? '°' : 'dk', 'kitap');
}

// ─── (c) Kitaptaki vakit misalleri (İstanbul φ=41°, λ=29°, müşterek saat +2, temkin 10) ─
const cTablo = [];
function cSatir(ad, tarih, anahtar, alan, kitapSaat, s) {
  const v = N.vakitler({ tarih, enlem: 41, boylam: 29, saatDilimi: 2 });
  const dk = v.vakitler[anahtar][alan];
  const [h, m] = kitapSaat.split(':').map(Number);
  const fark = dk - (h * 60 + m);
  cTablo.push({ ad, tarih, hesap: N.dakikaSaat(dk), kitap: kitapSaat, fark, s });
  denetle(Math.abs(fark) <= 2.5, `Kitap misali ${ad}: hesap ${N.dakikaSaat(dk)}, kitap ${kitapSaat}`);
}
cSatir('1 Mayıs şer\'î gurûb (akşam)', '1985-05-01', 'aksam', 'temkinli', '19:05', '¶348');
cSatir('1 Mayıs şer\'î tulû\'', '1985-05-01', 'gunes', 'temkinli', '04:57', '¶348');
cSatir('1 Mayıs zevâl (kerâhet) başı', '1985-05-01', 'zevalBaslangici', 'temkinli', '11:51', '¶346');
cSatir('13 Ağustos imsâk', '1985-08-13', 'imsak', 'temkinli', '03:09', '¶280');
cSatir('13 Ağustos asr-ı evvel', '1985-08-13', 'asrEvvel', 'temkinli', '16:10', '¶244');
cSatir('13 Ağustos işâ-i evvel', '1985-08-13', 'yatsiEvvel', 'temkinli', '20:55', '¶271');
cSatir('11 Ocak işrâk', '1985-01-11', 'israk', 'temkinli', '08:15', '¶318');
cSatir('11 Ocak isfirâr', '1985-01-11', 'isfirar', 'temkinli', '16:19', '¶320');
cSatir('1 Şubat asr-ı evvel', '1985-02-01', 'asrEvvel', 'temkinli', '15:08', '¶330');
cSatir('1 Mart öğle', '1985-03-01', 'ogle', 'temkinli', '12:27', '¶155');
{ // Dahve-i kübrâ (¶29): 13 Ağustos 3:09 + 19:13 → 11:11
  const v = N.vakitler({ tarih: '1985-08-13', enlem: 41, boylam: 29, saatDilimi: 2 });
  const dk = N.dahveiKubra(v), fark = dk - (11 * 60 + 11);
  cTablo.push({ ad: '13 Ağustos dahve-i kübrâ', tarih: '1985-08-13', hesap: N.dakikaSaat(dk), kitap: '11:11', fark, s: '¶29' });
  denetle(Math.abs(fark) <= 2.5, `Dahve-i kübrâ: hesap ${N.dakikaSaat(dk)}, kitap 11:11`);
}
// Temkin: 21 Mart İstanbul, irtifâ zâviyesi 1°29′6,2″ → 7 dk 52,29 sn (¶107)
{
  const z = (29 + 44.5 + 15.75 - 8.8 / 60) / 60;
  const t = (N.fadliDair(41, 0, -z) - N.fadliDair(41, 0, 0)) * 4;
  cTablo.push({ ad: 'Temkin 21 Mart (φ=41, δ=0, 267 m)', tarih: '—', hesap: t.toFixed(3) + ' dk', kitap: '7,871 dk (7 dk 52,29 sn)', fark: t - (7 + 52.29 / 60), s: '¶107' });
  denetle(Math.abs(t - (7 + 52.29 / 60)) < 0.02, `Temkin 21 Mart: ${t}`);
  const u = N.temkinUnsurlari({ tarih: '2026-03-20', enlem: 41.0082, boylam: 28.9784, saatDilimi: 3, yukseklik: 267 });
  denetle(Math.abs(u.inhitatDk - 29) < 0.15, `İnhitât 267 m: ${u.inhitatDk}′ (kitap 29′)`);
  cTablo.push({ ad: 'İnhitât-ı ufuk 267 m', tarih: '—', hesap: u.inhitatDk.toFixed(2) + '′', kitap: '29′', fark: u.inhitatDk - 29, s: '¶107' });
  const ky = N.temkinKitapYaklasik(41, 0, 267);
  cTablo.push({ ad: 'Kitabın yaklaşık temkin düstûru (4), φ=41, δ=0, 267 m', tarih: '—', hesap: ky.toFixed(2) + ' dk', kitap: '— (eski sayfa kullanmaz)', fark: NaN, s: '¶394' });
}

// ─── (d) 3B yardımcıları için iç tutarlılık ───────────────────────────────
{
  // Alt noktada güneş tepede olmalı
  for (const an of ['2026-03-20T09:00:00Z', '2026-06-21T15:30:00Z', '2026-12-21T02:10:00Z']) {
    const a = N.gunesAltNoktasi(new Date(an));
    const k = N.gunesKonumu(new Date(an), a.enlem, a.boylam);
    denetle(k.irtifa > 89.99, `Alt noktada irtifâ 90 olmalı (${an}): ${k.irtifa}`);
  }
  // gunesKonumu (an) ile gunesKonumuDakika (yerel dakika) aynı olmalı
  const k1 = N.gunesKonumu(new Date('2026-06-21T09:30:00Z'), 41.0082, 28.9784);
  const k2 = N.gunesKonumuDakika('2026-06-21', 12 * 60 + 30, 41.0082, 28.9784, 3);
  denetle(Math.abs(k1.irtifa - k2.irtifa) < 1e-9 && Math.abs(k1.semt - k2.semt) < 1e-9, 'gunesKonumu ≡ gunesKonumuDakika');
  // Hakîkî vakitte güneşin irtifâı vaktin irtifâı olmalı (±0,05°)
  const kon = N.vakitKonumlari({ tarih: '2026-06-21', enlem: 41.0082, boylam: 28.9784, saatDilimi: 3 });
  for (const [k, h] of Object.entries(N.IRTIFALAR)) {
    const anahtar = { imsak: 'imsak', gunes: 'gunes', israk: 'israk', isfirar: 'isfirar', aksam: 'aksam', istibak: 'istibak', yatsiEvvel: 'yatsiEvvel', yatsiSani: 'yatsiSani' }[k];
    denetle(Math.abs(kon[anahtar].hakiki.irtifa - h) < 0.05, `Hakîkî ${k} anında irtifâ ${kon[anahtar].hakiki.irtifa} ≠ ${h}`);
  }
  // Kıble: İstanbul ~151,6°, Londra ~118,9°
  denetle(Math.abs(N.kibleAcisi(41.0082, 28.9784) - 151.6) < 0.3, 'Kıble İstanbul');
  denetle(Math.abs(N.kibleAcisi(51.5074, -0.1278) - 118.99) < 0.3, 'Kıble Londra');
  // Gün yayı: 145 nokta (10 dk adım), öğlede en yüksek
  const yay = N.gunYayi({ tarih: '2026-06-21', enlem: 41.0082, boylam: 28.9784, saatDilimi: 3 });
  denetle(yay.length === 145, 'Gün yayı nokta sayısı');
}

// ─── Rapor ────────────────────────────────────────────────────────────────
const f = (x, n = 3) => Number.isFinite(x) ? x.toFixed(n).replace('.', ',') : '—';
console.log('\n## (a) Eski sayfa ile karşılaştırma');
if (TARAYICISIZ) console.log('(atlandı: --tarayicisiz)');
else {
  console.log(`Gösterilen vakit: ${birebirSayisi}/${karsilastirmaSayisi} birebir · ham değer (calcPrayerTimes): ${hamBirebir}/${hamSayisi} birebir\n`);
  console.log('| Yer | Tarih | ' + N.VAKIT_ADLARI.map(x => x[0]).join(' | ') + ' | uyum |');
  console.log('|' + '---|'.repeat(N.VAKIT_ADLARI.length + 3));
  for (const s of satirlarTablo) {
    const h = s.sayfa.map((x, i) => x === s.modul[i] ? x : `**${x}≠${s.modul[i]}**`);
    console.log(`| ${s.yer} | ${s.tarih} | ${h.join(' | ')} | ${s.uyum}/12 |`);
  }
}
console.log('\n## (b) Bağımsız doğruluk');
console.log('| Büyüklük | Hesap | Beklenen | Fark | Tolerans | Sonuç |');
console.log('|---|---|---|---|---|---|');
for (const r of bTablo) console.log(`| ${r.ad} | ${f(r.hesap)} ${r.birim} | ${f(r.beklenen)} | ${f(r.fark)} | ±${f(r.tolerans, 2)} | ${r.ok ? 'uyuyor' : 'UYMUYOR'} |`);
console.log(`\nEski sayfanın ta'dîl GRAFİĞİ formülü ile cedvel/vakit formülü arasındaki en büyük fark (2026): ${f(grafikFarkEnBuyuk.v)} dk (${grafikFarkEnBuyuk.gun})`);
console.log('\n## (c) Kitaptaki misaller (İstanbul φ=41°, λ=29°, müşterek saat +2, temkin 10 dk, yıl 1985 varsayıldı)');
console.log('| Misal | Tarih | Modül | Kitap | Fark (dk) | Kaynak |');
console.log('|---|---|---|---|---|---|');
for (const r of cTablo) console.log(`| ${r.ad} | ${r.tarih} | ${r.hesap} | ${r.kitap} | ${f(r.fark, 2)} | ${r.s} |`);
console.log(`\nToplam denetim: ${gecen + kalan}, geçen ${gecen}, kalan ${kalan}`);
if (kalan) { console.log('\nUYMAYANLAR:'); for (const h of hatalar) console.log(' - ' + h); process.exitCode = 1; }
