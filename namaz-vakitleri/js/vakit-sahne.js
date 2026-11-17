// Nemâz Vakitleri — üç boyutlu gök sahnesi ve levha.
// Hesap: /js/cekirdek/vakit.js (tools/yeni-site/namaz-hesap.mjs'in değiştirilmemiş kopyası).
// Sahne: gözlemcinin ufuk tablası (pirinç), ortasında mil, üstünde usturlâb çizgili gök kubbesi;
// güneşin gün yayı, vakitlerin yerleri, ufuk altı irtifâ' daireleri, yıldızlar.
import * as THREE from 'three';
import { EffectComposer } from '/vendor/three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '/vendor/three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/vendor/three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from '/vendor/three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from '/vendor/three/addons/postprocessing/OutputPass.js';
import * as V from '/js/cekirdek/vakit.js';
import { VAKIT_METIN, GECE_OLAYI, FASILLAR, KUNYE_HTML, YUKSEK_ARZ } from './metinler.js?v=2026-11-17a';

/* ════════════════════════════════════════════════════════════════
   1. Sabitler ve yardımcılar
   ════════════════════════════════════════════════════════════════ */
const RAD = Math.PI / 180;
const R = 24;              // gök kubbesinin yarıçapı (usturlâb çizgileri, güneş, gün yayı)
const TABLA = 10;          // ufuk tablasının yarıçapı
const MIL = 2;             // milin boyu: tepe topuzunun merkezine kadar (gölge hesabındaki "bir boy")
const CUBUK = 0.06;        // mil çubuğunun yarıçapı
const TEPE = 0.16;         // tepe topuzunun yarıçapı
const ZEMIN_Y = -0.32;     // tablanın oturduğu yer
const GOK_R = 900;
const YER_ANAHTAR = 'ilmihal-vakit-yer';

const kis = (x, a, b) => Math.min(b, Math.max(a, x));
const ara = (a, b, t) => a + (b - a) * t;
const yumusak = (a, b, x) => { const t = kis((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const kolayla = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const $ = id => document.getElementById(id);
const azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
const darEkran = () => innerWidth <= 860;
const aciFark = (a, b) => ((b - a + 540) % 360) - 180;

/** irtifâ' ve semt (kuzeyden saat yönünde) → birim yön. x doğu, y yukarı, z güney. */
function yon(irt, semt, h = new THREE.Vector3()) {
  const c = Math.cos(irt * RAD);
  return h.set(c * Math.sin(semt * RAD), Math.sin(irt * RAD), -c * Math.cos(semt * RAD));
}
const kubbe = (irt, semt) => yon(irt, semt).multiplyScalar(R);

const ondalik = (x, k = 1) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(k).replace('.', ',');
const isaretli = (x, k = 1) => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(k).replace('.', ',');
const derece = (x, k = 1) => ondalik(x, k) + '°';
function dms(der) {                     // 33° 51′
  const s = der < 0 ? '−' : '';
  let a = Math.abs(der), d = Math.floor(a), m = Math.round((a - d) * 60);
  if (m === 60) { d++; m = 0; }
  return `${s}${d}° ${String(m).padStart(2, '0')}′`;
}
function dakikaSn(dk) {                 // 7 dk 52 sn
  const t = Math.round(Math.abs(dk) * 60), d = Math.floor(t / 60), s = t % 60;
  return `${d} dk ${String(s).padStart(2, '0')} sn`;
}
function aciDkSn(dkAci) {               // 44′ 30″
  const t = Math.round(dkAci * 60), d = Math.floor(t / 60), s = t % 60;
  return d >= 60 ? `${Math.floor(d / 60)}° ${String(d % 60).padStart(2, '0')}′ ${String(s).padStart(2, '0')}″` : `${d}′ ${String(s).padStart(2, '0')}″`;
}
const saat = V.dakikaSaat;
function saatSn(m) {
  if (isNaN(m)) return '--:--:--';
  m = ((m % 1440) + 1440) % 1440;
  const t = Math.round(m * 60), h = Math.floor(t / 3600) % 24, d = Math.floor(t / 60) % 60, s = t % 60;
  return `${String(h).padStart(2, '0')}:${String(d).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function sure(dk) {
  dk = Math.max(0, Math.round(dk));
  const s = Math.floor(dk / 60), d = dk % 60;
  if (s && d) return `${s} saat ${d} dakika`;
  if (s) return `${s} saat`;
  return `${d} dakika`;
}
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const artikMi = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const yilGunu = t => Math.round((Date.UTC(t.yil, t.ay - 1, t.gun) - Date.UTC(t.yil, 0, 1)) / 864e5) + 1;
const gundenTarih = (yil, n) => { const d = new Date(Date.UTC(yil, 0, n)); return { yil: d.getUTCFullYear(), ay: d.getUTCMonth() + 1, gun: d.getUTCDate() }; };
const gunEkle = (t, k) => { const d = new Date(Date.UTC(t.yil, t.ay - 1, t.gun + k)); return { yil: d.getUTCFullYear(), ay: d.getUTCMonth() + 1, gun: d.getUTCDate() }; };
const tarihMetin = t => `${t.yil}-${String(t.ay).padStart(2, '0')}-${String(t.gun).padStart(2, '0')}`;
const tarihUzun = t => `${t.gun} ${AYLAR[t.ay - 1]} ${t.yil}, ${GUNLER[new Date(Date.UTC(t.yil, t.ay - 1, t.gun)).getUTCDay()]}`;
const kesme = s => String(s).replace(/'/g, '’');

/* ════════════════════════════════════════════════════════════════
   2. Durum, yer ve zaman
   ════════════════════════════════════════════════════════════════ */
const SIRA = V.VAKIT_ADLARI.map(([k]) => k);
const ANA = new Set(V.VAKIT_ADLARI.filter(v => v[2]).map(v => v[0]));
const govde = document.body;

const D = {
  yer: null,            // {tur: 'sehir'|'konum', ad, enlem, boylam}
  tz: 3,
  tarih: null,
  dk: 720,
  canli: true,
  izle: false,
  v: null, yarin: null, yay: [],
  hk: {},               // her vaktin hakîkî anındaki güneş konumu
  secili: null,
  levhaKip: 'cedvel',
  hakikiGoster: false,
  fasil: -1, fasilOynat: false, fasilSure: 0,
  yukseklik: 267,
  zaman: null,          // zaman yolculuğu
  hazir: false,
  // kamera
  S: { P: new THREE.Vector3(0, 30, -80), T: new THREE.Vector3(0, 3, 0), gor: 50, bak: 0 },
  kul: { yaw: 0, pitch: 0, uzak: 1, gor: 1 },
  ucus: null,
  ofs: { x: 0, y: 0 },
  // sahne kipleri (0..1 arası yumuşak geçiş)
  kip: { temkin: 0, analemma: 0, halka: 0.3, saydam: 0 },
  hedefKip: { temkin: 0, analemma: 0, halka: 0.3, saydam: 0 },
};

function tzBul(tarih) {
  if (D.yer && D.yer.tur === 'konum') return -new Date(tarih.yil, tarih.ay - 1, tarih.gun, 12).getTimezoneOffset() / 60;
  return 3;
}
function simdiYerel() {
  const tz = D.yer && D.yer.tur === 'konum' ? -new Date().getTimezoneOffset() / 60 : 3;
  const t = new Date(Date.now() + tz * 3600e3);
  return {
    tarih: { yil: t.getUTCFullYear(), ay: t.getUTCMonth() + 1, gun: t.getUTCDate() },
    dk: t.getUTCHours() * 60 + t.getUTCMinutes() + t.getUTCSeconds() / 60 + t.getUTCMilliseconds() / 60000,
  };
}
function yerOku() {
  try {
    const s = JSON.parse(localStorage.getItem(YER_ANAHTAR) || 'null');
    if (s && s.tur === 'konum' && isFinite(s.enlem) && isFinite(s.boylam)) return { tur: 'konum', ad: 'Konumunuz', enlem: +s.enlem, boylam: +s.boylam };
    if (s && s.tur === 'sehir') {
      const c = V.ESKI_SEHIRLER.find(x => x.name === s.ad);
      if (c) return { tur: 'sehir', ad: c.name, enlem: c.lat, boylam: c.lon };
    }
  } catch (e) { /* depolama kapalı */ }
  const c = V.ESKI_SEHIRLER[0];
  return { tur: 'sehir', ad: c.name, enlem: c.lat, boylam: c.lon };
}
function yerYaz() {
  try {
    const y = D.yer;
    localStorage.setItem(YER_ANAHTAR, JSON.stringify(y.tur === 'konum' ? { tur: 'konum', enlem: +y.enlem.toFixed(4), boylam: +y.boylam.toFixed(4) } : { tur: 'sehir', ad: y.ad }));
  } catch (e) { /* depolama kapalı */ }
}

/* ════════════════════════════════════════════════════════════════
   3. Hesap
   ════════════════════════════════════════════════════════════════ */
function hesapla() {
  D.tz = tzBul(D.tarih);
  const p = { tarih: D.tarih, enlem: D.yer.enlem, boylam: D.yer.boylam, saatDilimi: D.tz };
  D.v = V.vakitler(p);
  D.yarin = V.vakitler({ ...p, tarih: gunEkle(D.tarih, 1), saatDilimi: tzBul(gunEkle(D.tarih, 1)) });
  D.yay = V.gunYayi({ ...p, adimDk: 2 });
  D.hk = {};
  for (const k of SIRA) {
    const x = D.v.vakitler[k];
    D.hk[k] = isNaN(x.hakiki) ? null : V.gunesKonumuDakika(D.tarih, x.hakiki, D.yer.enlem, D.yer.boylam, D.tz);
  }
  // güneş zevâlde güneyde mi kuzeyde mi
  D.zevalSemt = D.yer.enlem - D.v.meyl >= 0 ? 180 : 0;
  D.temkinU = V.temkinUnsurlari({ ...p, yukseklik: D.yukseklik });
}
function gunesAn(dk) { return V.gunesKonumuDakika(D.tarih, dk, D.yer.enlem, D.yer.boylam, D.tz); }
const gecerliMi = k => D.v && !isNaN(D.v.vakitler[k].temkinli);

/* ════════════════════════════════════════════════════════════════
   4. Levha
   ════════════════════════════════════════════════════════════════ */
const levha = $('levha');
$('kunye-metin').innerHTML = KUNYE_HTML;

// cedvel satırları bir kez kurulur
const satirlar = {};
(function cedvelKur() {
  const govdeT = $('cedvel-govde');
  for (const [k, ad, ana] of V.VAKIT_ADLARI) {
    const tr = document.createElement('tr');
    if (ana) tr.className = 'ana';
    const th = document.createElement('th'); th.scope = 'row';
    const b = document.createElement('button'); b.type = 'button'; b.textContent = kesme(ad);
    b.addEventListener('click', e => { e.stopPropagation(); vakitSec(k); });
    th.appendChild(b);
    const td = document.createElement('td');
    tr.append(th, td);
    tr.addEventListener('click', () => vakitSec(k));
    govdeT.appendChild(tr);
    satirlar[k] = { tr, td };
  }
})();

(function fasilListeKur() {
  const ol = $('fasil-liste');
  FASILLAR.forEach((f, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = `<span class="no">${i + 1}</span><span class="ad"></span>`;
    b.querySelector('.ad').textContent = f.ad;
    b.addEventListener('click', () => fasilAc(i));
    li.appendChild(b); ol.appendChild(li);
  });
})();

function levhaBasYaz() {
  const y = D.yer;
  $('lv-yer').textContent = y.ad;
  $('dg-yer-ad').textContent = y.ad;
  $('lv-tarih').textContent = tarihUzun(D.tarih);
  const tzM = `UTC${D.tz >= 0 ? '+' : '−'}${String(Math.abs(D.tz)).replace('.', ',')}`;
  const ek = y.tur === 'konum' ? ` · saat dilimi tarayıcınızdan: <b>${tzM}</b>` : ` · saat dilimi <b>${tzM}</b>`;
  $('lv-konum').innerHTML = `Arz <b>${ondalik(Math.abs(y.enlem), 2)}° ${y.enlem >= 0 ? 'K' : 'G'}</b> · Tûl <b>${ondalik(Math.abs(y.boylam), 2)}° ${y.boylam >= 0 ? 'D' : 'B'}</b>${ek} · Temkin <b>${D.v.temkin} dk</b><br>Meyl-i şems <b>${ondalik(D.v.meyl, 2)}°</b> · Ta’dîl-i zemân <b>${isaretli(D.v.tadil)} dk</b>`;
}

function cedvelYaz() {
  const h = D.hakikiGoster;
  $('cedvel-saat-bas').textContent = h ? 'Hakîkî vakit' : 'Takvim vakti';
  $('kip-takvim').setAttribute('aria-pressed', h ? 'false' : 'true');
  $('kip-hakiki').setAttribute('aria-pressed', h ? 'true' : 'false');
  let eksik = false;
  for (const k of SIRA) {
    const x = D.v.vakitler[k];
    const deger = h ? x.hakiki : x.temkinli;
    satirlar[k].td.textContent = saat(deger);
    if (isNaN(deger)) eksik = true;
  }
  $('cedvel-aciklama').textContent = `${D.yer.ad}, ${tarihUzun(D.tarih)} için on iki vakit (${h ? 'hakîkî vakit, temkinsiz' : 'takvim vakti, temkinli'})`;
  $('cedvel-not').textContent = eksik ? YUKSEK_ARZ : (h ? 'Hakîkî vakit: güneş merkezinin hakîkî ufka göre vaktin irtifâına geldiği an; takvim vaktinden temkin kadar farklıdır.' : '');
}

function siradaki() {
  const v = D.v.vakitler, liste = [];
  for (const k of SIRA) if (!isNaN(v[k].temkinli)) liste.push([k, v[k].temkinli]);
  liste.sort((a, b) => a[1] - b[1]);
  let gecerli = null;
  for (const [k, t] of liste) if (t <= D.dk + 1e-6) gecerli = k;
  let sonra = liste.find(([, t]) => t > D.dk + 1e-6);
  if (!sonra && D.yarin && !isNaN(D.yarin.vakitler.imsak.temkinli)) sonra = ['imsak', D.yarin.vakitler.imsak.temkinli + 1440, true];
  return { gecerli, sonra };
}

let sonSiraMetin = '';
function siraYaz() {
  const { gecerli, sonra } = siradaki();
  for (const k of SIRA) {
    satirlar[k].tr.classList.toggle('gecerli', k === gecerli);
    satirlar[k].tr.classList.toggle('secili', k === D.secili && D.levhaKip === 'vakit');
  }
  $('lv-sira-bas').textContent = D.canli ? 'Sıradaki vakit' : `Sahnedeki saatten (${saat(D.dk)}) sonra`;
  let ad = '—', st = '', kalan = '';
  if (sonra) {
    ad = VAKIT_METIN[sonra[0]].kisa + (sonra[2] ? ' (yarın)' : '');
    st = saat(sonra[1]);
    const fark = sonra[1] - D.dk;
    kalan = fark < 1 ? 'giriyor' : sure(fark) + ' sonra';
  }
  const m = ad + st + kalan;
  if (m !== sonSiraMetin) {
    sonSiraMetin = m;
    $('lv-sira-ad').textContent = ad; $('lv-sira-saat').textContent = st; $('lv-sira-kalan').textContent = kalan;
  }
  // şerit
  $('serit-olay').textContent = gecerli ? VAKIT_METIN[gecerli].olay : GECE_OLAYI;
}

function bolumGoster(kip) {
  D.levhaKip = kip;
  govde.classList.toggle('kip-cedvel', kip === 'cedvel');
  $('bolum-cedvel').hidden = kip !== 'cedvel';
  $('bolum-vakit').hidden = kip !== 'vakit';
  $('bolum-fasil').hidden = kip !== 'fasil';
  $('fasil-gez').hidden = kip !== 'fasil';
  $('levha-kaydir').scrollTop = 0;
}

function paragrafYaz(kutu, liste) {
  kutu.textContent = '';
  for (const m of liste) { const p = document.createElement('p'); p.textContent = m; kutu.appendChild(p); }
}

function satir(sol, sag, sinif = '', alt = '') {
  return `<div class="hesap-satir ${sinif}"><span>${sol}</span><b>${sag}</b>${alt ? `<span class="duz">${alt}</span>` : ''}</div>`;
}

/** Bir vaktin "nasıl bulunur" anlatımı: kitaptaki metin + bu günün hesabı. */
function vakitYaz(k) {
  const x = D.v.vakitler[k], m = VAKIT_METIN[k], v = D.v;
  $('vk-ust').textContent = `${D.yer.ad} · ${D.tarih.gun} ${AYLAR[D.tarih.ay - 1]} ${D.tarih.yil}`;
  $('vk-ad').textContent = kesme(x.ad);
  $('vk-arabi').textContent = m.arabi;
  const yonM = x.temkinYonu < 0 ? `hakîkî vakitten ${v.temkin} dk çıkarılır` : x.temkinYonu > 0 ? `hakîkî vakte ${v.temkin} dk eklenir` : 'temkin eklenmez';
  const irtM = x.irtifa === null ? 'zevâl (nısf-ün-nehâr)' : derece(x.irtifa, Math.abs(x.irtifa % 1) > 0.001 ? 2 : 0);
  $('vk-saat').innerHTML = `
    <div><dt>Takvim vakti</dt><dd class="altin">${saat(x.temkinli)}</dd></div>
    <div><dt>Hakîkî vakit</dt><dd>${saatSn(x.hakiki)}</dd></div>
    <div><dt>Güneş merkezinin irtifâı</dt><dd>${irtM}<small>hakîkî ufka göre</small></dd></div>
    <div><dt>Temkin</dt><dd>${x.temkinYonu === 0 ? 'yok' : (x.temkinYonu < 0 ? '−' : '+') + v.temkin + ' dk'}<small>${yonM}</small></dd></div>`;
  paragrafYaz($('vk-metin'), m.paragraflar);

  const kutu = $('vk-hesap');
  let h = `<h3>Bu günün hesabı</h3>`;
  const zevalM = `${saatSn(v.hakikiZeval)}`;
  h += satir('Meyl-i şems (δ)', derece(v.meyl, 2));
  h += satir('Ta’dîl-i zemân', isaretli(v.tadil, 2) + ' dk');
  h += satir('Hakîkî zevâl', zevalM, '', `12:00 − 4 × tûl (${ondalik(D.yer.boylam, 2)}°) − ta’dîl (${isaretli(v.tadil, 2)} dk) + ${D.tz} saat`);
  if (isNaN(x.hakiki)) {
    h += `<p class="uyari">${YUKSEK_ARZ}</p>`;
  } else if (x.irtifa === null) {
    h += satir(k === 'ogle' ? 'Öğle: zevâl + temkin' : 'Zevâl başı: zevâl − temkin', saat(x.temkinli), 'toplam');
    h += satir('Gâye irtifâ’ (zevâldeki irtifâ’)', dms(v.gayeIrtifa), '', `90° − |arz − meyl| = 90° − |${ondalik(D.yer.enlem, 2)}° − ${ondalik(v.meyl, 2)}°|`);
    h += satir('Fey-i zevâl (1 boyluk çubuk)', ondalik(v.feyiZeval, 4) + ' boy', '', 'tan (90° − gâye irtifâ’)');
  } else {
    if (k === 'asrEvvel' || k === 'asrSani') {
      const kat = k === 'asrEvvel' ? 1 : 2;
      h += satir('Fey-i zevâl', ondalik(v.feyiZeval, 4) + ' boy', '', `tan (90° − ${dms(v.gayeIrtifa)})`);
      h += satir(`tan (temâm-ı irtifâ’) = ${kat} + fey-i zevâl`, ondalik(kat + v.feyiZeval, 4));
      h += satir('Asr irtifâı', dms(x.irtifa));
    }
    const H = Math.abs(x.hakiki - v.hakikiZeval) / 4;
    const once = x.hakiki < v.hakikiZeval;
    h += satir('Fadl-ı dâir (H)', derece(H, 2), '', `cos H = (sin h − sin φ · sin δ) / (cos φ · cos δ); h = ${derece(x.irtifa, 2)}, φ = ${derece(D.yer.enlem, 2)}`);
    h += satir(`Zevâlden ${once ? 'önce' : 'sonra'}: 4 × H`, sure(4 * H).replace(' saat', ' sa').replace(' dakika', ' dk'));
    h += satir('Hakîkî vakit', saatSn(x.hakiki));
    h += satir(x.temkinYonu === 0 ? 'Takvim vakti (temkinsiz)' : `Takvim vakti (${x.temkinYonu < 0 ? '−' : '+'} temkin)`, saat(x.temkinli), 'toplam');
  }
  h += `<p class="hesap-not">Güneşin konumu meyl ve ta’dîl o anın değerleriyle üç kez yinelenerek bulunur; takvim vakti en yakın dakikaya yuvarlanmıştır.</p>`;
  kutu.innerHTML = h;
}

/* ── Fasıllar ─────────────────────────────────────────── */
function fasilYaz(i) {
  const f = FASILLAR[i], v = D.v;
  $('fs-no').textContent = i + 1;
  $('fs-toplam').textContent = `${FASILLAR.length} fasıldan`;
  $('fs-ad').textContent = f.ad;
  paragrafYaz($('fs-metin'), f.paragraflar);
  const ek = $('fs-ek');
  let h = '';
  const vk = v.vakitler;
  if (i === 0) {
    h += `<section class="fs-hesap"><h3>${D.yer.ad}, ${D.tarih.gun} ${AYLAR[D.tarih.ay - 1]}</h3>`;
    h += `<p>Altın yay, güneşin bu günkü yoludur: doğuda ufuktan çıkar, nısf-ün-nehâr dâiresinde en yükseğe varır, batıda ufka iner; ufkun altındaki kısmı kesik çizgiyle devam eder. Yay üzerindeki her işaret, güneş merkezinin hakîkî ufka göre bir vaktin irtifâına geldiği yerdir.</p>`;
    h += satir('Gâye irtifâ’ (zevâlde)', dms(v.gayeIrtifa), '', '90° − |arz − meyl|');
    h += satir('Meyl-i şems', derece(v.meyl, 2));
    if (!isNaN(vk.gunes.hakiki)) h += satir('Gündüz (hakîkî tulû’dan gurûba)', sure(vk.aksam.hakiki - vk.gunes.hakiki));
    h += `<p class="hesap-not">İnce yaylar 21 Haziran ve 21 Aralık günlerinin, ortadaki 21 Mart ile 23 Eylül’ün yollarıdır. Alttaki sene şeridini sürükleyince gün yayının yazın yükselip kışın alçaldığı görülür.</p></section>`;
  } else if (i === 1) {
    h += `<section class="fs-hesap"><h3>Bu gün</h3>`;
    h += satir('Güneş merkezi −19°’de (hakîkî imsâk)', saatSn(vk.imsak.hakiki));
    h += satir('Temkin çıkarılır', `−${v.temkin} dk`);
    h += satir('Takvimdeki imsâk', saat(vk.imsak.temkinli), 'toplam');
    h += `<p class="hesap-not">Kubbedeki kesik çizgiler ufkun altındaki irtifâ’ daireleridir: −19° (fecr ve işâ-i sânî), −17° (işâ-i evvel), −10° (iştibâk-i nücûm). Güneş −19° dairesine gelince doğu ufkunda ilk beyazlık görülür.</p></section>`;
  } else if (i === 2) {
    h += `<section class="fs-hesap"><h3>Bu gün</h3>`;
    h += satir('Hakîkî zevâl', saatSn(v.hakikiZeval));
    h += satir('Gâye irtifâ’', dms(v.gayeIrtifa), '', '90° − |arz − meyl|');
    h += satir('Fey-i zevâl', `${ondalik(v.feyiZeval, 4)} mil boyu`, '', 'tan (90° − gâye irtifâ’)');
    h += satir('Zevâl başı (− temkin)', saat(vk.zevalBaslangici.temkinli));
    h += satir('Öğle (+ temkin)', saat(vk.ogle.temkinli), 'toplam');
    h += `<p class="hesap-not">Tablanın ortasındaki mil, gölgesini güneşin tam tersine düşürür. Zevâlde gölge en kısadır ve tablaya kazılı nısf-ün-nehâr hattının (kuzey-güney) üstüne düşer; bu en kısa gölge fey-i zevâldir.</p></section>`;
  } else if (i === 3) {
    h += `<section class="fs-hesap"><h3>Bu gün</h3>`;
    h += satir('Fey-i zevâl', `${ondalik(v.feyiZeval, 4)} boy`);
    h += satir('İç halka: fey-i zevâl + 1 boy', `${ondalik(v.feyiZeval + 1, 3)} boy`, '', `asr-ı evvel irtifâı ${dms(vk.asrEvvel.irtifa)}`);
    h += satir('Dış halka: fey-i zevâl + 2 boy', `${ondalik(v.feyiZeval + 2, 3)} boy`, '', `asr-ı sânî irtifâı ${dms(vk.asrSani.irtifa)}`);
    h += satir('Gölge ucu iç halkada (hakîkî)', saatSn(vk.asrEvvel.hakiki));
    h += satir('İkindi, asr-ı evvel (+ temkin)', saat(vk.asrEvvel.temkinli), 'toplam');
    h += satir('Gölge ucu dış halkada (hakîkî)', saatSn(vk.asrSani.hakiki));
    h += satir('Asr-ı sânî (+ temkin)', saat(vk.asrSani.temkinli), 'toplam');
    h += `<p class="hesap-not">Halkaların merkezi milin dibidir; gölge ucunun halkaya değdiği an, güneşin asr irtifâına geldiği hakîkî vakittir. Takvimdeki vakit buna temkin eklenerek bulunur.</p></section>`;
  } else if (i === 4) {
    h += `<section class="fs-hesap"><h3>Bu gün</h3>`;
    for (const k of ['aksam', 'istibak', 'yatsiEvvel', 'yatsiSani']) {
      const x = vk[k];
      h += satir(`${kesme(x.ad)} · ${derece(x.irtifa, 0)}`, saat(x.temkinli), k === 'aksam' || k === 'yatsiEvvel' ? 'toplam' : '', `hakîkî ${saatSn(x.hakiki)}, temkin +${v.temkin} dk`);
    }
    if ([vk.yatsiEvvel, vk.yatsiSani].some(x => isNaN(x.hakiki))) h += `<p class="uyari">${YUKSEK_ARZ}</p>`;
    h += '</section>';
  } else if (i === 5) {
    const t = D.temkinU;
    h += `<section><h3>Üç pay</h3>`;
    f.unsurlar.forEach((u, j) => {
      const deger = j === 0 ? aciDkSn(t.inhitatDk) : j === 1 ? aciDkSn(t.inkisarDk) : aciDkSn(t.nisfKutrDk);
      h += `<div class="unsur"><h4><span><i>${j + 1}</i>${u.ad}</span><b${j === 0 ? ' id="inhitat-deger"' : ''}>${deger}</b></h4><p>${u.metin}</p></div>`;
    });
    h += `<div class="surgu"><label for="yukseklik">En yüksek yerin yüksekliği <b id="yukseklik-deger">${D.yukseklik} m</b></label><input type="range" id="yukseklik" min="0" max="2500" step="1" value="${D.yukseklik}" aria-describedby="yukseklik-deger"></div>`;
    h += `</section><section class="fs-hesap"><h3>Temkin hesabı — ${D.yer.ad}, ${D.tarih.gun} ${AYLAR[D.tarih.ay - 1]}</h3><div id="temkin-hesap">${temkinHesapHtml()}</div>`;
    h += `<p class="hesap-not">Sahnedeki takvim vakitleri her yerde kitaptaki İstanbul temkiniyle (10 dakika) hesaplanır; bu sürgü yalnız temkinin nasıl bulunduğunu gösterir, vakitleri değiştirmez.</p></section>`;
    h += `<section><h3>Ufuklar</h3>${kesitSvg()}<p>${f.ufuklar}</p><p>${f.not}</p></section>`;
  } else if (i === 6) {
    const y = D.tarih.yil, n = artikMi(y) ? 366 : 365;
    let enAz = { d: 1e9 }, enCok = { d: -1e9 };
    const deger = [];
    for (let g = 1; g <= n; g++) {
      const t = gundenTarih(y, g), e = V.tadiliZeman(tarihMetin(t));
      deger.push(e);
      if (e < enAz.d) enAz = { d: e, t }; if (e > enCok.d) enCok = { d: e, t };
    }
    const sifir = [];
    for (let g = 1; g < n; g++) if (Math.sign(deger[g - 1]) !== Math.sign(deger[g])) sifir.push(gundenTarih(y, Math.abs(deger[g - 1]) < Math.abs(deger[g]) ? g : g + 1));
    h += `<section class="fs-hesap"><h3>${y} senesi</h3>`;
    h += satir(`Seçili gün (${D.tarih.gun} ${AYLAR[D.tarih.ay - 1]})`, isaretli(v.tadil, 2) + ' dk', 'toplam');
    h += satir('En küçük', `${isaretli(enAz.d, 1)} dk · ${enAz.t.gun} ${AYLAR[enAz.t.ay - 1]}`);
    h += satir('En büyük', `${isaretli(enCok.d, 1)} dk · ${enCok.t.gun} ${AYLAR[enCok.t.ay - 1]}`);
    h += satir('Sıfır olduğu günler (yaklaşık)', sifir.map(t => `${t.gun} ${AY_KISA[t.ay - 1]}`).join(', '));
    h += tadilSvg(deger, n);
    h += `</section><section><h3>Kubbedeki sekiz</h3><p>Kubbedeki sekiz biçimli eğri, güneşin bir sene boyunca her gün aynı saatte, mahallî vasatî zevâlde (${saat(720 - 4 * D.yer.boylam + 60 * D.tz)}) bulunduğu yerlerdir. Eğrinin yukarı-aşağı uzanışı meyl-i şemsin, doğuya-batıya sapması ta’dîl-i zemânın eseridir: ta’dîl artı iken güneş nısf-ün-nehârı geçmiş, eksi iken henüz gelmemiştir.</p>`;
    h += `<h3>Sebepleri (s. 183–184)</h3><ol>${f.sebepler.map(s => `<li>${s}</li>`).join('')}</ol><p>${f.mikdar}</p></section>`;
  }
  ek.innerHTML = h;
  const sg = $('yukseklik');
  if (sg) sg.addEventListener('input', () => {
    D.yukseklik = +sg.value;
    $('yukseklik-deger').textContent = `${D.yukseklik} m`;
    D.temkinU = V.temkinUnsurlari({ tarih: D.tarih, enlem: D.yer.enlem, boylam: D.yer.boylam, saatDilimi: D.tz, yukseklik: D.yukseklik });
    temkinCizgileri();
    $('temkin-hesap').innerHTML = temkinHesapHtml();
    $('inhitat-deger').textContent = aciDkSn(D.temkinU.inhitatDk);
  });
  $('dg-once').disabled = i === 0;
  $('dg-sonra').disabled = false;
  $('gz-once-ad').textContent = i > 0 ? FASILLAR[i - 1].ad : '';
  $('gz-sonra-ad').textContent = i < FASILLAR.length - 1 ? FASILLAR[i + 1].ad : 'Vakit cedveli';
}

function temkinHesapHtml() {
  const t = D.temkinU;
  return satir('İrtifâ zâviyesi', aciDkSn(t.irtifaZaviyesiDk), '', `inhitât ${aciDkSn(t.inhitatDk)} + 44′ 30″ + 15′ 45″ − 8,8″`)
    + satir('Bu gün için hesap', dakikaSn(t.hesapDk))
    + satir('Kitaptaki cedvel (s. 1244)', D.yukseklik > 500 ? 'cedvel 500 metreye kadardır' : dakikaSn(t.cedvelDk))
    + satir('2 dakika ihtiyât ile', dakikaSn(t.ihtiyatliDk), 'toplam');
}

/** Ufuk düzlemlerinin ölçeksiz kesiti (kitaptaki s. 180 şeklinin sadeleştirilmişi). */
function kesitSvg() {
  return `<svg class="kesit" viewBox="0 0 400 210" role="img" aria-label="Ölçeksiz kesit: yer küresi, râsıd, en yüksek tepe ve paralel ufuk düzlemleri">
    <defs><clipPath id="ks"><rect x="0" y="0" width="400" height="210"/></clipPath></defs>
    <g clip-path="url(#ks)" fill="none" stroke-linecap="round">
      <circle cx="200" cy="700" r="560" stroke="rgba(236,229,211,.35)" stroke-width="1"/>
      <path d="M232 141 q18 -40 34 -40 q16 0 30 42" stroke="rgba(236,229,211,.55)" stroke-width="1.2"/>
      <line x1="10" y1="140" x2="390" y2="140" stroke="#d8b26a" stroke-width="1.2"/>
      <line x1="10" y1="101" x2="390" y2="101" stroke="#e8955a" stroke-width="1.2" stroke-dasharray="5 4"/>
      <line x1="10" y1="196" x2="390" y2="196" stroke="rgba(243,216,146,.75)" stroke-width="1" stroke-dasharray="2 4"/>
      <circle cx="160" cy="140" r="3" fill="#f3d892" stroke="none"/>
      <circle cx="265" cy="101" r="2.4" fill="#e8955a" stroke="none"/>
    </g>
    <g font-size="10.5" letter-spacing=".06em">
      <text x="14" y="133" fill="#d8b26a">RİYÂDÎ UFUK · râsıdın ayakları</text>
      <text x="14" y="94" fill="#e8955a">ŞER’Î UFUK · en yüksek yerin zâhirî ufuk hattı</text>
      <text x="14" y="190" fill="rgba(243,216,146,.85)">HAKÎKÎ UFUK · yer küresinin merkezinden (çok aşağıda)</text>
      <text x="152" y="158" fill="rgba(236,229,211,.7)">râsıd</text>
      <text x="246" y="88" fill="rgba(236,229,211,.7)">en yüksek yer</text>
    </g></svg>`;
}

/** Ta'dîl-i zemân'ın sene içindeki eğrisi (tek formül: modüldeki tadiliZeman). */
function tadilSvg(deger, n) {
  const W = 400, H = 150, ust = 18, alt = 132, sol = 28, sag = 396;
  const y = e => ara(alt, ust, (e + 17) / 34);
  const x = g => ara(sol, sag, (g - 1) / (n - 1));
  let yol = '';
  deger.forEach((e, k) => { yol += (k ? 'L' : 'M') + x(k + 1).toFixed(1) + ' ' + y(e).toFixed(1); });
  const sec = yilGunu(D.tarih);
  let ay = '';
  for (let a = 0; a < 12; a++) {
    const g = yilGunu({ yil: D.tarih.yil, ay: a + 1, gun: 1 });
    ay += `<line x1="${x(g)}" x2="${x(g)}" y1="${alt}" y2="${alt + 4}" stroke="rgba(236,229,211,.3)"/><text x="${x(g) + 2}" y="${H - 4}">${AY_KISA[a]}</text>`;
  }
  const izgara = [-15, -10, -5, 0, 5, 10, 15].map(e => `<line x1="${sol}" x2="${sag}" y1="${y(e)}" y2="${y(e)}" stroke="rgba(236,229,211,${e === 0 ? 0.35 : 0.08})"/><text x="0" y="${y(e) + 3}">${e > 0 ? '+' : e < 0 ? '−' : ''}${Math.abs(e)}</text>`).join('');
  return `<svg class="tadil-grafik" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ta’dîl-i zemânın bir sene içindeki değişimi, dakika">
    ${izgara}${ay}
    <path d="${yol}" fill="none" stroke="#d8b26a" stroke-width="1.6"/>
    <circle cx="${x(sec)}" cy="${y(D.v.tadil)}" r="4" fill="#f3d892"/>
    <text x="${sol}" y="10">dakika</text></svg>`;
}

/* ════════════════════════════════════════════════════════════════
   5. Zaman şeridi ve sene şeridi
   ════════════════════════════════════════════════════════════════ */
const rayGun = $('ray-gun'), rayYil = $('ray-yil');
(function seritKur() {
  const s = $('ray-saatler');
  for (let h = 0; h <= 24; h += 3) {
    const e = document.createElement('span'); e.style.left = (h / 24 * 100) + '%'; e.textContent = String(h).padStart(2, '0');
    s.appendChild(e);
  }
})();
function yilSeridiYaz() {
  const k = $('ray-aylar'); k.textContent = '';
  const y = D.tarih.yil, n = artikMi(y) ? 366 : 365;
  for (let a = 0; a < 12; a++) {
    const e = document.createElement('span');
    e.style.left = ((yilGunu({ yil: y, ay: a + 1, gun: 1 }) - 1) / (n - 1) * 100) + '%';
    e.dataset.ay = AY_KISA[a];
    k.appendChild(e);
  }
  for (const [ay, gun] of [[3, 20], [6, 21], [9, 23], [12, 21]]) {
    const e = document.createElement('span'); e.className = 'donum';
    e.style.left = ((yilGunu({ yil: y, ay, gun }) - 1) / (n - 1) * 100) + '%';
    k.appendChild(e);
  }
  rayYil.setAttribute('aria-valuemax', n);
}
function gunSeridiYaz() {
  const ol = $('ray-centik'); ol.textContent = '';
  for (const k of SIRA) {
    const t = D.v.vakitler[k].temkinli;
    if (isNaN(t)) continue;
    const li = document.createElement('li');
    if (ANA.has(k)) { li.className = 'ana'; li.innerHTML = `<span>${VAKIT_METIN[k].kisa}<small>${saat(t)}</small></span>`; }
    li.style.left = (t / 1440 * 100) + '%';
    ol.appendChild(li);
  }
  // gece-gündüz bandı
  const duraklar = [];
  for (let dk = 0; dk <= 1440; dk += 20) {
    const h = gunesAn(dk).irtifa;
    let c;
    if (h > 0) c = `rgba(216,178,106,${(0.10 + 0.2 * Math.min(1, h / 40)).toFixed(3)})`;
    else if (h > -19) c = `rgba(120,140,190,${(0.12 * (1 + h / 19)).toFixed(3)})`;
    else c = 'rgba(0,0,0,0)';
    duraklar.push(`${c} ${(dk / 1440 * 100).toFixed(2)}%`);
  }
  $('ray-gece').style.background = `linear-gradient(90deg, ${duraklar.join(',')})`;
}
function seritGuncelle() {
  const g = rayGun.clientWidth, y = rayYil.clientWidth;
  $('gun-tutamak').style.transform = `translateX(${(D.dk / 1440 * g).toFixed(1)}px)`;
  const n = artikMi(D.tarih.yil) ? 366 : 365;
  $('yil-tutamak').style.transform = `translateX(${((yilGunu(D.tarih) - 1) / (n - 1) * y).toFixed(1)}px)`;
  $('serit-saat').textContent = saat(D.dk);
  rayGun.setAttribute('aria-valuenow', Math.round(D.dk));
  rayGun.setAttribute('aria-valuetext', `${saat(D.dk)}, ${$('serit-olay').textContent}`);
  rayYil.setAttribute('aria-valuenow', yilGunu(D.tarih));
  rayYil.setAttribute('aria-valuetext', tarihUzun(D.tarih));
}

function canliBirak() {
  if (D.canli) { D.canli = false; $('dg-simdi').setAttribute('aria-pressed', 'false'); }
}
function izleDur() { D.izle = false; $('dg-izle').setAttribute('aria-pressed', 'false'); }
function zamanAyarla(dk, sec = {}) {
  D.dk = kis(dk, 0, 1440);
  if (!sec.koru) { canliBirak(); D.zaman = null; }
  siraYaz(); seritGuncelle();
}
function tarihAyarla(t, sec = {}) {
  const ayni = D.tarih && t.yil === D.tarih.yil && t.ay === D.tarih.ay && t.gun === D.tarih.gun;
  const yilDegisti = !D.tarih || t.yil !== D.tarih.yil;
  D.tarih = t;
  if (!sec.koru) canliBirak();
  if (ayni && !sec.zorla) return;
  hesapla();
  $('tarih-gir').value = tarihMetin(t);
  if (yilDegisti) { yilSeridiYaz(); sabitSahneyiGuncelle(); }
  levhaBasYaz(); cedvelYaz(); gunSeridiYaz(); siraYaz(); seritGuncelle();
  if (D.levhaKip === 'vakit' && D.secili) vakitYaz(D.secili);
  if (D.levhaKip === 'fasil' && D.fasil >= 0 && !sec.levhaDokunma) fasilYaz(D.fasil);
  sahneyiGuncelle();
}

function raySurukle(ray, deger) {
  let surukleniyor = false;
  const al = e => { const r = ray.getBoundingClientRect(); return kis((e.clientX - r.left) / r.width, 0, 1); };
  ray.addEventListener('pointerdown', e => {
    surukleniyor = true; ray.setPointerCapture(e.pointerId); deger(al(e)); e.preventDefault();
  });
  ray.addEventListener('pointermove', e => { if (surukleniyor) deger(al(e)); });
  const bitir = () => { surukleniyor = false; };
  ray.addEventListener('pointerup', bitir); ray.addEventListener('pointercancel', bitir);
}
let yilBekleyen = null;
raySurukle(rayGun, f => { izleDur(); fasilBirak(); zamanAyarla(f * 1440); });
raySurukle(rayYil, f => {
  izleDur(); fasilBirak();
  const n = artikMi(D.tarih.yil) ? 366 : 365;
  yilBekleyen = gundenTarih(D.tarih.yil, Math.round(1 + f * (n - 1)));
});
rayGun.addEventListener('keydown', e => {
  const adim = e.shiftKey ? 60 : 5;
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); izleDur(); zamanAyarla(D.dk + adim); }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); izleDur(); zamanAyarla(D.dk - adim); }
  else if (e.key === 'Home') { e.preventDefault(); zamanAyarla(0); }
  else if (e.key === 'End') { e.preventDefault(); zamanAyarla(1440); }
});
rayYil.addEventListener('keydown', e => {
  const adim = e.shiftKey ? 30 : 1;
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); tarihAyarla(gunEkle(D.tarih, adim)); }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); tarihAyarla(gunEkle(D.tarih, -adim)); }
});
$('tarih-gir').addEventListener('change', e => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.target.value);
  if (m) tarihAyarla({ yil: +m[1], ay: +m[2], gun: +m[3] });
});
$('dg-gun-once').addEventListener('click', () => tarihAyarla(gunEkle(D.tarih, -1)));
$('dg-gun-sonra').addEventListener('click', () => tarihAyarla(gunEkle(D.tarih, 1)));
$('dg-simdi').addEventListener('click', simdiyeDon);
$('dg-izle').addEventListener('click', () => {
  if (D.izle) return izleDur();
  fasilBirak();
  D.izle = true; canliBirak(); D.zaman = null;
  $('dg-izle').setAttribute('aria-pressed', 'true');
  if (D.levhaKip !== 'cedvel') { bolumGoster('cedvel'); }
  if (D.dk >= 1439) D.dk = 0;
  ucusBaslat(pozGenel(), 2.6);
});
$('kip-takvim').addEventListener('click', () => { D.hakikiGoster = false; cedvelYaz(); });
$('kip-hakiki').addEventListener('click', () => { D.hakikiGoster = true; cedvelYaz(); });

function simdiyeDon() {
  izleDur(); fasilBirak();
  D.canli = true; D.zaman = null;
  $('dg-simdi').setAttribute('aria-pressed', 'true');
  const s = simdiYerel();
  tarihAyarla(s.tarih, { koru: true });
  D.dk = s.dk;
  siraYaz(); seritGuncelle();
}

/* ════════════════════════════════════════════════════════════════
   6. Yer seçimi
   ════════════════════════════════════════════════════════════════ */
const yerPencere = $('yer-pencere');
let yerOnceki = null;
(function yerListeKur() {
  const ol = $('yer-liste');
  for (const c of V.ESKI_SEHIRLER) {
    const li = document.createElement('li');
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = `<span class="ad"></span><span class="alt">${ondalik(c.lat, 2)}° K · ${ondalik(c.lon, 2)}° D</span>`;
    b.querySelector('.ad').textContent = c.name;
    b.addEventListener('click', () => { yerSec({ tur: 'sehir', ad: c.name, enlem: c.lat, boylam: c.lon }); yerKapat(); });
    li.dataset.ad = c.name;
    li.appendChild(b); ol.appendChild(li);
  }
})();
function yerAc() {
  yerOnceki = document.activeElement;
  for (const li of $('yer-liste').children) li.classList.toggle('etkin', D.yer.tur === 'sehir' && li.dataset.ad === D.yer.ad);
  yerPencere.hidden = false;
  $('dg-yer-kapat').focus();
}
function yerKapat() { yerPencere.hidden = true; if (yerOnceki && yerOnceki.focus) yerOnceki.focus(); }
function yerSec(y) {
  D.yer = y;
  yerYaz();
  if (D.canli) { const s = simdiYerel(); D.tarih = null; tarihAyarla(s.tarih, { koru: true }); D.dk = s.dk; }
  else { const t = D.tarih; D.tarih = null; tarihAyarla(t, { koru: true }); }
  sabitSahneyiGuncelle();
  if (D.levhaKip === 'vakit' && D.secili) vakitSec(D.secili, { levhaYalniz: true });
  if (D.levhaKip === 'fasil') fasilAc(D.fasil, { zorla: true });
  else ucusBaslat(pozGenel(), 2.4);
}
$('dg-yer').addEventListener('click', yerAc);
$('dg-yer-kapat').addEventListener('click', yerKapat);
yerPencere.addEventListener('click', e => { if (e.target === yerPencere) yerKapat(); });
$('dg-konum').addEventListener('click', () => {
  const durum = $('konum-durum');
  if (!('geolocation' in navigator)) { durum.textContent = 'Tarayıcınız konum bildirmeyi desteklemiyor. Listeden bir şehir seçebilirsiniz.'; return; }
  durum.textContent = 'Konumunuz soruluyor…';
  navigator.geolocation.getCurrentPosition(p => {
    durum.textContent = '';
    yerSec({ tur: 'konum', ad: 'Konumunuz', enlem: p.coords.latitude, boylam: p.coords.longitude });
    yerKapat();
  }, () => {
    durum.textContent = 'Konumunuza erişilemedi; izin verilmemiş olabilir. Listeden bir şehir seçebilirsiniz. Konumunuz hiçbir yere gönderilmez; yalnız bu sayfada hesap için kullanılır.';
  }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
});

/* ════════════════════════════════════════════════════════════════
   7. Sahne: gölgelendiriciler
   ════════════════════════════════════════════════════════════════ */
const tuval = $('sahne');
let cizici = null, sahne = null, kamera = null, bestec = null, isilti = null, sonGecis = null, sahneHazir = false;
let W = innerWidth, H = innerHeight, PO = 1;
const U = {
  uGunes: { value: new THREE.Vector3(0, 1, 0) }, uIrt: { value: 30 }, uGece: { value: 0 },
  uMil: { value: MIL }, uCubuk: { value: CUBUK }, uTepe: { value: TEPE }, uTabla: { value: TABLA },
  uHalka: { value: new THREE.Vector4(1, 2, 3, 0.55) }, uDegme: { value: new THREE.Vector3() },
  uUfuk: { value: new THREE.Color() }, uYerAlt: { value: 0 }, uZaman: { value: 0 },
  uCoz: { value: new THREE.Vector2(1, 1) },
};
const G = {};   // sahne parçaları

const GLSL_GOLGE = /* glsl */`
  uniform vec3 uGunes; uniform float uMil; uniform float uCubuk; uniform float uTepe;
  uniform vec4 uHalka; uniform vec3 uDegme;
  // Milin gölgesi: çubuk + tepe topuzu; güneşin görünen yarıçapı kadar yarı gölge (0,27°).
  float milGolgesi(vec2 p, float yZemin){
    float yatay = length(uGunes.xz);
    if (uGunes.y <= 0.002 || yatay < 1e-4) return 0.0;
    vec2 u = -uGunes.xz / yatay;
    float tanh = uGunes.y / yatay;
    float L = (uMil - yZemin) / tanh;
    float pu = dot(p, u), pv = dot(p, vec2(-u.y, u.x));
    float aa = fwidth(pu) + fwidth(pv);
    float uzak = max(pu, 0.0) / yatay;
    float yar = 0.0047 * uzak;
    float w = uCubuk;
    float cubuk = (1.0 - smoothstep(w - yar - aa, w + yar + aa, abs(pv)))
                * smoothstep(-0.02, 0.02, pu) * (1.0 - smoothstep(L - 0.05, L, pu));
    cubuk *= min(1.0, w / max(yar, 1e-4) * 1.2);
    float df = L / yatay * 1.0;
    float yf = 0.0047 * df;
    vec2 q = vec2((pu - L) * uGunes.y, pv);
    float e = length(q);
    float tepe = (1.0 - smoothstep(uTepe - yf - aa, uTepe + yf + aa, e)) * min(1.0, uTepe / max(yf, 1e-4) * 1.4);
    return max(cubuk, tepe) * smoothstep(0.002, 0.03, uGunes.y);
  }
  float halka(float r, float R0, float w, float aa){ return 1.0 - smoothstep(w, w + aa * 1.6, abs(r - R0)); }
  // halkalar: gündüz pirince kazılmış koyu oyuk + ince altın; gölge ucu değince ışır
  vec3 halkalar(vec3 c, vec2 p, float aa, float gun){
    float r = length(p);
    float g = uHalka.w;
    float nok = step(0.5, fract(atan(p.y, p.x) * 48.0 / 6.2831853));
    float m0 = halka(r, uHalka.x, 0.02, aa) * nok * g;
    float m1 = halka(r, uHalka.y, 0.034, aa) * g;
    float m2 = halka(r, uHalka.z, 0.034, aa) * g;
    float m = max(m0 * 0.8, max(m1, m2));
    c = mix(c, c * 0.22, m * gun * 0.9);
    vec3 altin = vec3(0.95, 0.62, 0.24);
    float isik = m0 * (0.22 + 0.5 * uDegme.x) + m1 * (0.42 + 0.9 * uDegme.y) + m2 * (0.38 + 0.9 * uDegme.z);
    c += altin * isik * mix(0.55, 0.75, 1.0 - gun);
    return c;
  }
`;

const DUNYA_VS = /* glsl */`
  varying vec3 vW; varying vec3 vN;
  void main(){
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const GOK_VS = /* glsl */`
  varying vec3 vYon;
  void main(){ vYon = position; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }
`;
const GOK_FS = /* glsl */`
  uniform vec3 uGunes; uniform float uIrt; uniform float uYerAlt; uniform float uZaman;
  varying vec3 vYon;
  vec3 gok(vec3 d, float yu){
    float h = uIrt;
    float gun = smoothstep(-5.0, 12.0, h);
    vec2 dh = d.xz; float ld = length(dh); dh = ld > 1e-4 ? dh / ld : vec2(0.0, 1.0);
    vec2 sh = uGunes.xz; float ls = length(sh); sh = ls > 1e-4 ? sh / ls : vec2(0.0, 1.0);
    float yakin = clamp(0.5 + 0.5 * dot(dh, sh), 0.0, 1.0);
    float mu = clamp(dot(d, uGunes), 0.0, 1.0);
    vec3 c = mix(vec3(0.010, 0.016, 0.034), vec3(0.0025, 0.0045, 0.011), sqrt(yu));
    vec3 gu = mix(vec3(0.24, 0.31, 0.42), vec3(0.026, 0.080, 0.215), pow(yu + 1e-6, 0.42));
    gu += vec3(1.0, 0.86, 0.62) * (0.07 * pow(mu, 8.0) + 0.28 * pow(mu, 120.0));
    gu = mix(gu, gu * vec3(1.25, 0.95, 0.70), (1.0 - smoothstep(3.0, 22.0, h)) * exp(-yu * 3.5) * yakin);
    c = mix(c, gu, gun);
    float sig = smoothstep(-13.0, -2.0, h);
    float band = exp(-yu * mix(9.0, 3.6, sig));
    vec3 kizil = mix(vec3(0.62, 0.15, 0.045), vec3(0.78, 0.40, 0.16), smoothstep(0.0, 0.10, yu));
    kizil = mix(kizil, vec3(0.20, 0.25, 0.42), smoothstep(0.10, 0.42, yu));
    vec3 beyaz = vec3(0.22, 0.26, 0.34);
    vec3 renk = mix(beyaz, kizil, sig);
    float g1 = (h + 2.5) / 7.0, g2 = (h + 14.5) / 5.0;
    float guc = 0.80 * exp(-g1 * g1) + 0.42 * exp(-g2 * g2);
    float yonlu = pow(yakin, mix(2.2, 3.0, sig));
    c += renk * band * yonlu * guc * (1.0 - 0.65 * gun);
    float kusak = smoothstep(-7.0, -1.5, h) * (1.0 - smoothstep(0.5, 6.0, h));
    float karsi = (1.0 - yakin) * (1.0 - yakin);
    float kb = (yu - 0.13) / 0.09;
    c += vec3(0.18, 0.085, 0.12) * kusak * karsi * exp(-kb * kb);
    c *= 1.0 - kusak * karsi * exp(-yu / 0.06) * 0.35;
    return c;
  }
  void main(){
    vec3 d = normalize(vYon);
    float y = d.y;
    float sinr = sin(radians(uYerAlt));
    vec3 c = gok(d, max(y - sinr, 0.0));
    if (y < sinr) {
      float gun = smoothstep(-8.0, 10.0, uIrt);
      vec3 yer = mix(vec3(0.0035, 0.0045, 0.007), vec3(0.042, 0.040, 0.034), gun);
      float k = uYerAlt < -0.01 ? smoothstep(0.0, 0.0015, sinr - y) : smoothstep(0.01, 0.32, sinr - y);
      c = mix(c, yer, k);
    }
    float g = fract(sin(dot(gl_FragCoord.xy + fract(uZaman) * 37.0, vec2(12.9898, 78.233))) * 43758.5453);
    c += (g - 0.5) * 0.0025;
    gl_FragColor = vec4(c, 1.0);
  }
`;

const YER_FS = /* glsl */`
  uniform float uIrt; uniform vec3 uUfuk; uniform float uTabla;
  ${GLSL_GOLGE}
  varying vec3 vW; varying vec3 vN;
  void main(){
    vec2 p = vW.xz; float r = length(p);
    float gun = smoothstep(-6.0, 10.0, uIrt);
    float sh = max(uGunes.y, 0.0);
    float golge = r > uTabla ? milGolgesi(p, vW.y) : 0.0;
    vec3 alb = vec3(0.085, 0.080, 0.066);
    vec3 isik = mix(vec3(0.03, 0.035, 0.05), vec3(0.30, 0.32, 0.36), gun) + vec3(1.0, 0.9, 0.76) * pow(sh, 0.7) * (1.0 - 0.85 * golge);
    vec3 c = alb * isik;
    float aa = fwidth(r);
    if (r > uTabla + 0.05) c = halkalar(c, p, aa, gun);
    c = mix(c, uUfuk, smoothstep(24.0, 150.0, r));
    gl_FragColor = vec4(c, 1.0);
  }
`;

const TABLA_FS = /* glsl */`
  uniform sampler2D uOyma; uniform float uIrt; uniform float uGece; uniform float uTabla; uniform float uSaydam;
  ${GLSL_GOLGE}
  varying vec3 vW; varying vec3 vN;
  void main(){
    vec2 p = vW.xz; float r = length(p);
    vec3 N = normalize(vN);
    float gun = smoothstep(-4.0, 9.0, uIrt);
    float sh = max(uGunes.y, 0.0);
    vec3 V = normalize(cameraPosition - vW);
    if (N.y < 0.5) {
      // kenar
      float dif = max(dot(N, uGunes), 0.0) * step(0.0, uGunes.y);
      vec3 c = vec3(0.30, 0.21, 0.10) * (mix(vec3(0.03, 0.035, 0.05), vec3(0.22, 0.24, 0.28), gun) + dif);
      c += vec3(0.85, 0.60, 0.30) * pow(clamp(1.0 - abs(dot(N, V)), 0.0, 1.0), 4.0) * mix(0.08, 0.3, uGece);
      gl_FragColor = vec4(c, uSaydam);
      return;
    }
    vec2 uv = vec2(0.5 + p.x / (2.0 * uTabla), 0.5 - p.y / (2.0 * uTabla));
    float oy = texture2D(uOyma, uv).r;
    float golge = milGolgesi(p, 0.0);
    float aci = atan(p.y, p.x);
    float lif = 0.5 + 0.5 * sin(r * 180.0 + sin(aci * 5.0) * 1.7);
    vec3 alb = vec3(0.30, 0.205, 0.085) * (0.93 + 0.07 * lif) * (0.96 + 0.04 * smoothstep(uTabla, uTabla * 0.2, r));
    vec3 Hh = normalize(V + uGunes);
    float parla = pow(max(Hh.y, 0.0), 160.0) * smoothstep(0.0, 0.05, sh) * (1.0 - golge);
    vec3 dogrudan = vec3(1.0, 0.90, 0.76) * 0.78 * pow(sh, 0.55) * (1.0 - 0.94 * golge);
    vec3 cevre = mix(vec3(0.035, 0.04, 0.055), vec3(0.17, 0.19, 0.23), gun) * (1.0 - 0.35 * golge);
    vec3 c = alb * (cevre + dogrudan) + vec3(1.0, 0.82, 0.55) * parla * 0.1;
    // kazıma: gündüz koyu oyuk, gece altın
    c = mix(c, c * 0.30, oy * gun * 0.85);
    c += vec3(0.80, 0.56, 0.26) * oy * mix(0.035, 0.22, uGece);
    float aa = fwidth(r);
    c = halkalar(c, p, aa, gun);
    gl_FragColor = vec4(c, uSaydam);
  }
`;

const MIL_FS = /* glsl */`
  uniform vec3 uGunes; uniform float uIrt; uniform float uGece;
  varying vec3 vW; varying vec3 vN;
  void main(){
    vec3 N = normalize(vN); vec3 V = normalize(cameraPosition - vW);
    float gun = smoothstep(-4.0, 9.0, uIrt);
    float acik = smoothstep(-0.01, 0.03, uGunes.y);
    float dif = max(dot(N, uGunes), 0.0) * acik;
    vec3 alb = vec3(0.46, 0.33, 0.15);
    vec3 c = alb * (mix(vec3(0.04, 0.045, 0.06), vec3(0.22, 0.24, 0.28), gun) + vec3(1.0, 0.9, 0.75) * dif * 1.15);
    float sp = pow(max(dot(reflect(-uGunes, N), V), 0.0), 36.0) * acik;
    c += vec3(1.0, 0.86, 0.6) * sp * 0.9;
    c += vec3(0.95, 0.70, 0.36) * pow(clamp(1.0 - dot(N, V), 0.0, 1.0), 3.0) * mix(0.12, 0.6, uGece);
    gl_FragColor = vec4(c, 1.0);
  }
`;

const TEPE_VS = /* glsl */`
  attribute float aYuk;
  varying float vYuk; varying vec3 vW;
  void main(){ vYuk = aYuk; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
`;
const TEPE_FS = /* glsl */`
  uniform vec3 uUfuk; uniform float uIrt; uniform float uSis; uniform vec3 uGunes;
  varying float vYuk; varying vec3 vW;
  void main(){
    float gun = smoothstep(-6.0, 10.0, uIrt);
    vec3 koyu = mix(vec3(0.003, 0.004, 0.008), vec3(0.030, 0.032, 0.030), gun);
    vec3 c = mix(koyu, uUfuk, uSis * (0.35 + 0.65 * vYuk));
    // güneşe bakan sırtlar az aydınlık
    vec2 d = normalize(vW.xz);
    float yuz = max(dot(-d, normalize(uGunes.xz + 1e-5)), 0.0);
    c += vec3(0.05, 0.04, 0.02) * yuz * vYuk * smoothstep(0.0, 0.2, uGunes.y);
    gl_FragColor = vec4(c, 1.0);
  }
`;

// ekran uzayında kalınlığı sabit çizgi (atlastaki şerit tekniği)
const CIZGI_VS = /* glsl */`
  attribute vec3 aDiger; attribute float aYan; attribute float aUc; attribute float aT;
  uniform vec2 uCoz; uniform float uKalin;
  varying float vYan; varying float vT; varying float vY; varying vec3 vW;
  void main(){
    vec4 c = projectionMatrix * viewMatrix * vec4(position, 1.0);
    vec4 o = projectionMatrix * viewMatrix * vec4(aDiger, 1.0);
    vec2 sc = c.xy / max(abs(c.w), 1e-5) * uCoz, so = o.xy / max(abs(o.w), 1e-5) * uCoz;
    vec2 dir = (so - sc) * aUc;
    float boy = length(dir);
    dir = boy > 1e-4 ? dir / boy : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    c.xy += nrm * aYan * uKalin / uCoz * c.w;
    gl_Position = c;
    vYan = aYan; vT = aT; vY = position.y; vW = position;
  }
`;
const CIZGI_FS = /* glsl */`
  uniform vec3 uRenk; uniform float uOpak; uniform float uAlt; uniform float uKesikUst; uniform float uKesikAlt;
  uniform float uYakin;
  varying float vYan; varying float vT; varying float vY; varying vec3 vW;
  void main(){
    float kenar = 1.0 - smoothstep(0.3, 1.0, abs(vYan));
    float alt = step(vY, -0.002);
    float k = mix(uKesikUst, uKesikAlt, alt);
    float kes = k > 0.0 ? step(fract(vT / k), 0.55) : 1.0;
    // kubbenin kameraya bakan (dış) yüzü daha soluk
    float on = dot(vW, cameraPosition) > dot(vW, vW) ? uYakin : 1.0;
    float a = kenar * kes * uOpak * mix(1.0, uAlt, alt) * on;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uRenk, a);
  }
`;
const YAY_FS = /* glsl */`
  uniform float uOpak; uniform float uSimdi; uniform float uGece; uniform float uParla;
  varying float vYan; varying float vT; varying float vY; varying vec3 vW;
  void main(){
    float kenar = 1.0 - smoothstep(0.3, 1.0, abs(vYan));
    float alt = step(vY, -0.002);
    float kes = mix(1.0, step(fract(vT / 9.0), 0.5), alt);
    float on = dot(vW, cameraPosition) > dot(vW, vW) ? 0.55 : 1.0;
    vec3 gunduz = vec3(1.0, 0.60, 0.16), gece = vec3(0.98, 0.74, 0.38);
    vec3 renk = mix(gunduz, gece, uGece) * uParla;
    float gecti = 1.0 - smoothstep(uSimdi - 1.0, uSimdi + 1.0, vT);
    float a = kenar * kes * uOpak * mix(1.0, 0.36, alt) * on * mix(0.8, 1.0, gecti);
    if (a < 0.004) discard;
    gl_FragColor = vec4(renk * mix(1.0, 0.7, alt), a);
  }
`;

const GUNES_VS = /* glsl */`
  uniform vec3 uMerkez; uniform float uBoy;
  varying vec2 vUv; varying vec3 vW;
  void main(){
    vec3 sag = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 ust = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec3 w = uMerkez + (sag * position.x + ust * position.y) * uBoy;
    vUv = position.xy * 2.0; vW = w;
    gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
  }
`;
const GUNES_FS = /* glsl */`
  uniform float uDisk; uniform float uKizil; uniform float uKes; uniform float uKesYum; uniform float uHayalet; uniform float uGuc;
  varying vec2 vUv; varying vec3 vW;
  void main(){
    float ad = degrees(asin(clamp(normalize(vW).y, -1.0, 1.0)));
    float alti = (uKes > -89.0 && ad < uKes) ? 1.0 : 0.0;
    float altiH = uKes > -89.0 ? smoothstep(uKes + uKesYum, uKes - uKesYum, ad) : 0.0;
    float r = length(vUv);
    if (uHayalet > 0.5) {
      float hq = (r - uDisk) / (uDisk * 0.16), iq = r / (uDisk * 0.18);
      float halka = exp(-hq * hq);
      float ic = exp(-iq * iq) * 0.5;
      vec3 c = vec3(0.98, 0.78, 0.45) * (halka * 0.9 + ic) * uGuc;
      gl_FragColor = vec4(c, 1.0);
      return;
    }
    float disk = (1.0 - smoothstep(uDisk * 0.97, uDisk * 1.03, r)) * (1.0 - alti);
    float kq = r / uDisk;
    float kenarK = sqrt(max(1.0 - kq * kq, 0.0));
    vec3 ic = mix(vec3(1.0, 0.95, 0.84), vec3(1.0, 0.46, 0.13), uKizil);
    vec3 c = ic * disk * (0.55 + 0.45 * kenarK) * mix(3.6, 2.4, uKizil);
    float hl = r / (uDisk * 2.4);
    float hale = exp(-hl * hl) * 0.55 + exp(-r / (uDisk * 1.6)) * 0.18;
    c += mix(vec3(1.0, 0.82, 0.52), vec3(1.0, 0.45, 0.18), uKizil) * hale * (1.0 - disk) * 1.4 * (1.0 - 0.75 * altiH);
    gl_FragColor = vec4(c * uGuc * (1.0 - smoothstep(0.75, 1.0, r)), 1.0);
  }
`;

const NOKTA_VS = /* glsl */`
  attribute float aGuc; attribute float aBoy;
  uniform float uPO;
  varying float vGuc;
  void main(){
    vGuc = aGuc;
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
    gl_PointSize = aBoy * uPO;
  }
`;
const NOKTA_FS = /* glsl */`
  uniform vec3 uRenk;
  varying float vGuc;
  void main(){
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0 || vGuc < 0.004) discard;
    float cek = 1.0 - smoothstep(0.42, 0.62, r);
    float hal = exp(-r * r * 3.0) * 0.35;
    float hq = (r - 0.86) / 0.07;
    float halka = exp(-hq * hq) * 0.6;
    gl_FragColor = vec4(uRenk * (cek * 1.4 + hal + halka) * vGuc, 1.0);
  }
`;

const YILDIZ_VS = /* glsl */`
  attribute vec3 aEk; attribute float aBoy; attribute float aFaz;
  uniform mat3 uDon; uniform float uZaman; uniform float uPO; uniform float uGor;
  varying float vPar;
  void main(){
    vec3 d = uDon * aEk;
    vec3 w = d * 800.0;
    vPar = (0.74 + 0.26 * sin(uZaman * (0.6 + aFaz) + aFaz * 40.0)) * uGor * smoothstep(0.0, 0.08, d.y);
    gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
    gl_PointSize = d.y < 0.0 ? 0.0 : aBoy * uPO;
  }
`;
const YILDIZ_FS = /* glsl */`
  varying float vPar;
  void main(){
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = exp(-r * r * 5.0) * vPar;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vec3(0.80, 0.86, 1.0) * a * 0.9, 1.0);
  }
`;

const SON_GECIS = {
  uniforms: { tDiffuse: { value: null }, uZaman: { value: 0 }, uCoz: { value: new THREE.Vector2(1, 1) } },
  vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uZaman; uniform vec2 uCoz; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 q = (vUv - 0.5) * vec2(1.0, 0.86);
      c.rgb *= mix(0.55, 1.0, smoothstep(0.88, 0.24, length(q)));
      float g = fract(sin(dot(vUv * uCoz + fract(uZaman) * 91.7, vec2(12.9898, 78.233))) * 43758.5453);
      c.rgb += (g - 0.5) * 0.010;
      gl_FragColor = c;
    }`
};

/* ════════════════════════════════════════════════════════════════
   8. Sahne: geometri
   ════════════════════════════════════════════════════════════════ */
/** Çoklu çizgi → ekran uzayında genişleyen şerit. parcalar: [{noktalar:[V3], t:[sayı]}] */
function seritGeometri(parcalar) {
  let seg = 0;
  for (const p of parcalar) seg += Math.max(0, p.noktalar.length - 1);
  const konum = new Float32Array(seg * 12), diger = new Float32Array(seg * 12);
  const yan = new Float32Array(seg * 4), uc = new Float32Array(seg * 4), tt = new Float32Array(seg * 4);
  const indis = new Uint32Array(seg * 6);
  let v = 0, q = 0;
  for (const p of parcalar) {
    for (let k = 0; k < p.noktalar.length - 1; k++) {
      const a = p.noktalar[k], b = p.noktalar[k + 1];
      for (let j = 0; j < 4; j++) {
        const bas = j < 2, P = bas ? a : b, O = bas ? b : a, x = (v + j) * 3;
        konum[x] = P.x; konum[x + 1] = P.y; konum[x + 2] = P.z;
        diger[x] = O.x; diger[x + 1] = O.y; diger[x + 2] = O.z;
        yan[v + j] = j % 2 === 0 ? 1 : -1;
        uc[v + j] = bas ? 1 : -1;
        tt[v + j] = bas ? p.t[k] : p.t[k + 1];
      }
      indis.set([v, v + 1, v + 2, v + 2, v + 1, v + 3], q);
      v += 4; q += 6;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(konum, 3));
  g.setAttribute('aDiger', new THREE.BufferAttribute(diger, 3));
  g.setAttribute('aYan', new THREE.BufferAttribute(yan, 1));
  g.setAttribute('aUc', new THREE.BufferAttribute(uc, 1));
  g.setAttribute('aT', new THREE.BufferAttribute(tt, 1));
  g.setIndex(new THREE.BufferAttribute(indis, 1));
  return g;
}
function cizgiMalzeme(s = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCoz: U.uCoz, uKalin: { value: (s.kalin || 1.2) * PO }, uRenk: { value: new THREE.Color(...(s.renk || [0.9, 0.85, 0.75])) },
      uOpak: { value: s.opak ?? 0.5 }, uAlt: { value: s.alt ?? 0.4 }, uKesikUst: { value: s.kesikUst || 0 }, uKesikAlt: { value: s.kesikAlt ?? 2.2 },
      uYakin: { value: s.yakin ?? 0.4 },
    },
    vertexShader: CIZGI_VS, fragmentShader: CIZGI_FS, transparent: true, depthWrite: false,
    blending: s.ekle ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide,
  });
}
function cizgiAg(parcalar, s) {
  const m = new THREE.Mesh(seritGeometri(parcalar), cizgiMalzeme(s));
  m.frustumCulled = false; m.renderOrder = s.sira || 4;
  m.userData.kalin = s.kalin || 1.2;
  return m;
}
/** İrtifâ' dairesi (almukantar): t = semt derecesi. */
function irtifaDairesi(irt, s0 = 0, s1 = 360, adim = 1) {
  const noktalar = [], t = [];
  for (let s = s0; s <= s1 + 1e-6; s += adim) { noktalar.push(kubbe(irt, s)); t.push(s); }
  return { noktalar, t };
}
/** Semt yarım dairesi: ufuktan başucuna (ve ufkun altına). */
function semtYayi(semt, i0 = 0, i1 = 90, adim = 1) {
  const noktalar = [], t = [];
  for (let i = i0; i <= i1 + 1e-6; i += adim) { noktalar.push(kubbe(i, semt)); t.push(i); }
  return { noktalar, t };
}

function oymaDokusu() {
  const S = 2048, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d');
  const M = S / 2, k = M / TABLA;   // dünya birimi → piksel
  x.fillStyle = '#000'; x.fillRect(0, 0, S, S);
  x.translate(M, M);
  x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineCap = 'round';
  const daire = (r, w, kesik) => { x.lineWidth = w; x.setLineDash(kesik || []); x.beginPath(); x.arc(0, 0, r * k, 0, Math.PI * 2); x.stroke(); x.setLineDash([]); };
  // kenar bantları
  daire(TABLA * 0.992, 3.2); daire(TABLA * 0.978, 1.4); daire(TABLA * 0.905, 1.6); daire(TABLA * 0.895, 0.9);
  // derece taksimatı (semt, kuzeyden saat yönünde)
  for (let s = 0; s < 360; s++) {
    const a = (s - 90) * RAD;  // tuvalde 0 = doğu; semt 0 = kuzey (yukarı)
    const uz = s % 10 === 0 ? 0.064 : s % 5 === 0 ? 0.045 : 0.026;
    const r1 = TABLA * 0.978, r0 = r1 - TABLA * uz;
    x.lineWidth = s % 10 === 0 ? 2.2 : 1.2;
    x.beginPath(); x.moveTo(Math.cos(a) * r0 * k, Math.sin(a) * r0 * k); x.lineTo(Math.cos(a) * r1 * k, Math.sin(a) * r1 * k); x.stroke();
  }
  // derece rakamları (otuzar)
  x.font = '500 30px Inter, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let s = 30; s < 360; s += 30) {
    if (s % 90 === 0) continue;
    const a = (s - 90) * RAD, r = TABLA * 0.87;
    x.save(); x.rotate(a + Math.PI / 2); x.fillText(String(s), 0, -r * k); x.restore();
  }
  // yön yazıları
  x.font = '600 66px Literata, Georgia, serif';
  const yaz = (metin, s, r, aralik) => {
    const harf = [...metin];
    const en = harf.map(h => x.measureText(h).width);
    const top = en.reduce((p, q) => p + q, 0) + aralik * (harf.length - 1);
    let aci = (s - 90) * RAD - top / 2 / (r * k);
    harf.forEach((h, i) => {
      const yarim = en[i] / 2 / (r * k);
      aci += yarim;
      x.save(); x.rotate(aci + Math.PI / 2); x.fillText(h, 0, -r * k); x.restore();
      aci += yarim + aralik / (r * k);
    });
  };
  yaz('KUZEY', 0, TABLA * 0.83, 14); yaz('DOĞU', 90, TABLA * 0.83, 14); yaz('GÜNEY', 180, TABLA * 0.83, 14); yaz('BATI', 270, TABLA * 0.83, 14);
  // semt hatları
  for (let s = 0; s < 360; s += 22.5) {
    const a = (s - 90) * RAD, ana = s % 90 === 0;
    const r0 = ana ? 0.06 : 0.1, r1 = ana ? 0.76 : 0.79;
    x.lineWidth = ana ? 1.8 : 0.9; x.globalAlpha = ana ? 1 : 0.55;
    x.beginPath(); x.moveTo(Math.cos(a) * TABLA * r0 * k, Math.sin(a) * TABLA * r0 * k); x.lineTo(Math.cos(a) * TABLA * r1 * k, Math.sin(a) * TABLA * r1 * k); x.stroke();
  }
  x.globalAlpha = 1;
  // nısf-ün-nehâr hattı: çift çizgi
  x.lineWidth = 1.4;
  for (const d of [-5, 5]) { x.beginPath(); x.moveTo(d, -TABLA * 0.79 * k); x.lineTo(d, TABLA * 0.79 * k); x.stroke(); }
  // gölge boyu ölçeği: mil boyunun katları
  x.globalAlpha = 0.5;
  for (let b = 1; b <= 4; b++) daire(MIL * b, 1.0, [3, 9]);
  x.globalAlpha = 1;
  x.font = '500 24px Inter, system-ui, sans-serif';
  for (let b = 1; b <= 4; b++) { x.save(); x.rotate(Math.PI / 4); x.fillText(`${b} boy`, 0, -(MIL * b * k) - 16); x.restore(); }
  // ortada şemse
  x.lineWidth = 1.6;
  const r8 = 0.42 * k;
  for (const d of [0, 45]) { x.save(); x.rotate(d * RAD); x.strokeRect(-r8, -r8, r8 * 2, r8 * 2); x.restore(); }
  daire(0.2, 1.4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = Math.min(8, cizici.capabilities.getMaxAnisotropy());
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

function tepelerKur() {
  const katmanlar = [{ r: 120, yuk: [0.6, 3.4], sis: 0.22, tohum: 7 }, { r: 190, yuk: [1.6, 7.0], sis: 0.48, tohum: 19 }];
  const N = 900;
  for (const K of katmanlar) {
    let tohum = K.tohum;
    const rs = () => { tohum = (tohum * 1664525 + 1013904223) >>> 0; return tohum / 4294967296; };
    const dalga = [];
    for (let i = 0; i < 9; i++) dalga.push({ f: Math.round(2 + rs() * 3 + i * i * 1.6 + i * 2), a: Math.pow(0.62, i), fz: rs() * Math.PI * 2 });
    const yuk = a => {
      let s = 0, top = 0;
      for (const w of dalga) { s += w.a * (0.5 + 0.5 * Math.sin(w.f * a + w.fz)); top += w.a; }
      const u = s / top;
      return ara(K.yuk[0], K.yuk[1], Math.pow(u, 1.6));
    };
    const konum = [], yukA = [], indis = [];
    for (let i = 0; i <= N; i++) {
      const a = i / N * Math.PI * 2, h = yuk(a), c = Math.cos(a), s = Math.sin(a);
      const ekle = (r, y, f) => { konum.push(c * r, y, s * r); yukA.push(f); };
      ekle(K.r, ZEMIN_Y - 0.5, 0);
      ekle(K.r + 9, ZEMIN_Y + h, 1);
      ekle(K.r + 60, ZEMIN_Y + h * 0.92, 0.9);
      if (i < N) {
        const b = i * 3, n = b + 3;
        indis.push(b, n, b + 1, b + 1, n, n + 1, b + 1, n + 1, b + 2, b + 2, n + 1, n + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
    g.setAttribute('aYuk', new THREE.Float32BufferAttribute(yukA, 1));
    g.setIndex(indis);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({
      uniforms: { uUfuk: U.uUfuk, uIrt: U.uIrt, uSis: { value: K.sis }, uGunes: U.uGunes },
      vertexShader: TEPE_VS, fragmentShader: TEPE_FS, side: THREE.DoubleSide,
    }));
    m.renderOrder = -4; m.frustumCulled = false;
    sahne.add(m);
    (G.tepeler ||= []).push(m);
  }
}

function yildizKur() {
  const say = 3600;
  const ek = new Float32Array(say * 3), boy = new Float32Array(say), faz = new Float32Array(say);
  let tohum = 20261117;
  const rs = () => { tohum = (tohum * 1664525 + 1013904223) >>> 0; return tohum / 4294967296; };
  for (let i = 0; i < say; i++) {
    const u = rs() * 2 - 1, a = rs() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    ek[i * 3] = s * Math.cos(a); ek[i * 3 + 1] = s * Math.sin(a); ek[i * 3 + 2] = u;   // ekvator çatısı: z kutup
    const p = rs();
    boy[i] = 1.0 + Math.pow(p, 10) * 3.6 + rs() * 0.8;
    faz[i] = rs();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(say * 3), 3));
  g.setAttribute('aEk', new THREE.BufferAttribute(ek, 3));
  g.setAttribute('aBoy', new THREE.BufferAttribute(boy, 1));
  g.setAttribute('aFaz', new THREE.BufferAttribute(faz, 1));
  G.yildiz = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: { uDon: { value: new THREE.Matrix3() }, uZaman: U.uZaman, uPO: { value: PO }, uGor: { value: 0 } },
    vertexShader: YILDIZ_VS, fragmentShader: YILDIZ_FS, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  G.yildiz.frustumCulled = false; G.yildiz.renderOrder = -6;
  sahne.add(G.yildiz);
}

/** Kubbenin sabit çizgileri: usturlâb levhası gibi. */
function kubbeKur() {
  const ince = [], orta = [];
  for (let i = 10; i <= 80; i += 10) ince.push(irtifaDairesi(i, 0, 360, 2));
  for (let s = 0; s < 360; s += 15) if (s % 180 !== 0) ince.push(semtYayi(s, 0, 88, 2));
  orta.push(irtifaDairesi(0, 0, 360, 1));
  G.izgara = cizgiAg(ince, { kalin: 1.0, opak: 0.2, renk: [0.86, 0.82, 0.74], yakin: 0.16 });
  G.ufukC = cizgiAg(orta, { kalin: 1.6, opak: 0.7, renk: [0.95, 0.78, 0.46], yakin: 0.5 });
  // nısf-ün-nehâr dâiresi (kuzey-başucu-güney) ve ufuk altı devamı
  G.nehar = cizgiAg([semtYayi(0, -90, 90, 1), semtYayi(180, -90, 90, 1)], { kalin: 1.3, opak: 0.5, renk: [0.95, 0.80, 0.50], alt: 0.35, kesikAlt: 3, yakin: 0.2 });
  // ufuk derece taksimatı
  const centik = [];
  for (let s = 0; s < 360; s += 5) {
    const u = s % 30 === 0 ? 2.2 : s % 10 === 0 ? 1.2 : 0.6;
    centik.push({ noktalar: [kubbe(0, s), kubbe(u, s)], t: [0, u] });
  }
  G.centik = cizgiAg(centik, { kalin: 1.2, opak: 0.6, renk: [0.95, 0.80, 0.50], yakin: 0.4 });
  // ufuk altı irtifâ' daireleri ve +5°
  G.daire = {};
  const ozel = [[5, [0.98, 0.80, 0.46], 0.45], [-10, [0.72, 0.70, 0.92], 0.55], [-17, [0.92, 0.55, 0.42], 0.6], [-19, [0.80, 0.86, 1.0], 0.65]];
  for (const [i, renk, op] of ozel) {
    G.daire[i] = cizgiAg([irtifaDairesi(i, 0, 360, 1)], { kalin: 1.25, opak: op, renk, alt: 1, kesikUst: 2.6, kesikAlt: 2.6, yakin: 0.35 });
  }
  sahne.add(G.izgara, G.ufukC, G.nehar, G.centik, ...Object.values(G.daire));
}

/** Yere ve yere bağlı sabit parçaların (gün dönümü yayları, analemma) yeniden kurulması. */
function sabitSahneyiGuncelle() {
  if (!cizici) return;
  // gündönümü ve ekinoks yayları
  if (G.donum) { sahne.remove(G.donum); G.donum.geometry.dispose(); }
  const y = D.tarih.yil, parcalar = [];
  G.donumNokta = [];
  for (const [ay, gun] of [[6, 21], [12, 21], [3, 20]]) {
    const t = { yil: y, ay, gun };
    const tz = tzBul(t);
    const yay = V.gunYayi({ tarih: t, enlem: D.yer.enlem, boylam: D.yer.boylam, saatDilimi: tz, adimDk: 4 });
    parcalar.push({ noktalar: yay.map(n => kubbe(n.irtifa, n.semt)), t: yay.map(n => n.dakika / 4) });
    const z = V.vakitler({ tarih: t, enlem: D.yer.enlem, boylam: D.yer.boylam, saatDilimi: tz });
    const k = V.gunesKonumuDakika(t, z.hakikiZeval, D.yer.enlem, D.yer.boylam, tz);
    G.donumNokta.push(kubbe(k.irtifa + 1.2, k.semt));
  }
  G.donum = cizgiAg(parcalar, { kalin: 1.0, opak: 0.34, renk: [0.95, 0.82, 0.58], alt: 0.25, kesikUst: 0, kesikAlt: 3, yakin: 0.35 });
  sahne.add(G.donum);
  // analemma: mahallî vasatî zevâlde (12:00 vasatî) güneşin bir senelik yeri
  if (G.analemma) { sahne.remove(G.analemma); G.analemma.geometry.dispose(); sahne.remove(G.anaNokta); G.anaNokta.geometry.dispose(); }
  const n = artikMi(y) ? 366 : 365, an = [], at = [], nk = [], ng = [], nb = [];
  G.anaGun = [];
  for (let g = 1; g <= n + 1; g++) {
    const t = gundenTarih(y, Math.min(g, n));
    const tz = tzBul(t);
    const dk = 720 - 4 * D.yer.boylam + 60 * tz;
    const k = V.gunesKonumuDakika(t, dk, D.yer.enlem, D.yer.boylam, tz);
    const P = kubbe(k.irtifa, k.semt);
    an.push(P); at.push(g);
    if (g <= n) { G.anaGun.push({ P, t, irt: k.irtifa, semt: k.semt }); }
    if (g <= n && t.gun === 1) { nk.push(P.x, P.y, P.z); ng.push(0.85); nb.push(7.5); }
  }
  G.analemma = cizgiAg([{ noktalar: an, t: at }], { kalin: 1.6, opak: 0.9, renk: [0.98, 0.78, 0.42], yakin: 0.5 });
  G.analemma.renderOrder = 6;
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(nk, 3));
  pg.setAttribute('aGuc', new THREE.Float32BufferAttribute(ng, 1));
  pg.setAttribute('aBoy', new THREE.Float32BufferAttribute(nb, 1));
  G.anaNokta = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: { uPO: { value: PO }, uRenk: { value: new THREE.Color(1.0, 0.85, 0.55) } },
    vertexShader: NOKTA_VS, fragmentShader: NOKTA_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  G.anaNokta.frustumCulled = false; G.anaNokta.renderOrder = 7;
  sahne.add(G.analemma, G.anaNokta);
  // gök kutbu etiketi
  etiketKonum('kutup', yon(Math.abs(D.yer.enlem), D.yer.enlem >= 0 ? 0 : 180).multiplyScalar(R * 1.0));
  etiketMetin('kutup', 'Gök kutbu', `irtifâ’ı ${derece(Math.abs(D.yer.enlem), 1)}`);
  etiketKonum('neh', kubbe(55, D.yer.enlem >= 0 ? 0 : 180));
  ['yaz', 'kis', 'ekv'].forEach((k, i) => etiketKonum(k, G.donumNokta[i]));
  temkinCizgileri();
}

/** Güne bağlı parçalar: gün yayı, vakit noktaları, halkalar. */
function sahneyiGuncelle() {
  if (!cizici) return;
  if (G.yay) { sahne.remove(G.yay, G.yayHale); G.yay.geometry.dispose(); }
  const noktalar = D.yay.map(n => kubbe(n.irtifa, n.semt)), t = D.yay.map(n => n.dakika);
  const geo = seritGeometri([{ noktalar, t }]);
  const yayMat = (kalin, opak, ekle) => new THREE.ShaderMaterial({
    uniforms: { uCoz: U.uCoz, uKalin: { value: kalin * PO }, uOpak: { value: opak }, uSimdi: { value: 0 }, uGece: U.uGece, uParla: { value: ekle ? 0.16 : 1 } },
    vertexShader: CIZGI_VS, fragmentShader: YAY_FS, transparent: true, depthWrite: false,
    blending: ekle ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide,
  });
  G.yay = new THREE.Mesh(geo, yayMat(2.2, 0.95, false));
  G.yayHale = new THREE.Mesh(geo, yayMat(9, 1, true));
  G.yay.userData.kalin = 2.2; G.yayHale.userData.kalin = 9;
  G.yay.frustumCulled = G.yayHale.frustumCulled = false;
  G.yay.renderOrder = 8; G.yayHale.renderOrder = 7;
  sahne.add(G.yayHale, G.yay);
  // vakit noktaları (hakîkî anlarındaki yer)
  const kon = [], guc = [], boy = [];
  G.vakitNokta = [];
  for (const k of SIRA) {
    if (k === 'zevalBaslangici') continue;
    const x = D.hk[k];
    if (!x) { G.vakitNokta.push(null); continue; }
    const P = kubbe(x.irtifa, x.semt);
    kon.push(P.x, P.y, P.z); guc.push(1); boy.push(ANA.has(k) ? 13 : 10);
    G.vakitNokta.push({ k, P });
  }
  if (G.nokta) { sahne.remove(G.nokta); G.nokta.geometry.dispose(); }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(kon, 3));
  pg.setAttribute('aGuc', new THREE.Float32BufferAttribute(guc, 1));
  pg.setAttribute('aBoy', new THREE.Float32BufferAttribute(boy, 1));
  G.nokta = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: { uPO: { value: PO }, uRenk: { value: new THREE.Color(1.0, 0.86, 0.56) } },
    vertexShader: NOKTA_VS, fragmentShader: NOKTA_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  G.nokta.frustumCulled = false; G.nokta.renderOrder = 9;
  sahne.add(G.nokta);
  // halkalar: fey-i zevâl ve asr (mil boyu cinsinden × MIL)
  const fz = D.v.feyiZeval;
  U.uHalka.value.set(MIL * fz, MIL * (fz + 1), MIL * (fz + 2), U.uHalka.value.w);
  // etiketler
  for (const k of SIRA) {
    if (k === 'zevalBaslangici') continue;
    const x = D.hk[k];
    const e = etiketBul('v-' + k);
    if (!x) { e.aktif = false; continue; }
    e.aktif = true;
    e.P.copy(kubbe(x.irtifa, x.semt));
    const ad = k === 'ogle' ? 'Zevâl · öğle' : VAKIT_METIN[k].kisa;
    etiketMetin('v-' + k, ad, saat(D.v.vakitler[k].temkinli));
  }
  const fzR = MIL * fz;
  const kb = D.zevalSemt === 180 ? 0 : 180;   // gölge zevâlde kuzeye düşer
  etiketKonum('h-fey', yon(0, kb).multiplyScalar(fzR).setY(0.02));
  etiketKonum('h-asr1', yon(0, kb - 32).multiplyScalar(MIL * (fz + 1)).setY(0.02));
  etiketKonum('h-asr2', yon(0, kb - 26).multiplyScalar(MIL * (fz + 2)).setY(0.02));
  temkinCizgileri();
  if (G.anaNokta) seciliAnalemma();
}

/* Temkin faslının çizgileri: hakîkî ufuk, şer'î ufuk ve üç pay. */
function temkinCizgileri() {
  if (!cizici || !D.v) return;
  if (G.temkin) { for (const m of G.temkin) { sahne.remove(m); m.geometry.dispose(); } }
  G.temkin = [];
  const t = D.temkinU;
  const sonAn = D.v.vakitler.aksam.hakiki + t.hesapDk;
  const az = isNaN(sonAn) ? 270 : gunesAn(sonAn).semt;
  G.temkinSemt = az;
  const dip = t.inhitatDk / 60, sd = t.nisfKutrDk / 60, ref = t.inkisarDk / 60;
  const yarim = 6;
  const hat = (irt, s0, s1) => irtifaDairesi(irt, s0, s1, 0.05);
  const dikey = (s, i0, i1) => ({ noktalar: [kubbe(i0, s), kubbe(i1, s)], t: [0, 1] });
  const uc = (s, i) => ({ noktalar: [kubbe(i, s - 0.08), kubbe(i, s + 0.08)], t: [0, 1] });
  const kb = az - 0.62;        // köşeli ayraçların semti (güneşin güney yanında)
  const hk = cizgiAg([hat(0, az - yarim, az + yarim)], { kalin: 2.0, opak: 0.95, renk: [0.98, 0.80, 0.46], yakin: 1 });
  const sr = cizgiAg([hat(-dip, az - yarim, az + yarim)], { kalin: 2.0, opak: 0.95, renk: [0.95, 0.56, 0.30], yakin: 1, kesikUst: 0.12, kesikAlt: 0.12, alt: 1 });
  const p1 = cizgiAg([dikey(kb, 0, -dip), uc(kb, 0), uc(kb, -dip)], { kalin: 1.6, opak: 0.95, renk: [0.62, 0.74, 0.98], alt: 1, yakin: 1 });
  const p2 = cizgiAg([dikey(kb, -dip, -dip - sd), uc(kb, -dip), uc(kb, -dip - sd)], { kalin: 1.6, opak: 0.95, renk: [0.78, 0.66, 0.98], alt: 1, yakin: 1 });
  const p3 = cizgiAg([dikey(kb, -dip - sd, -dip - sd - ref), uc(kb, -dip - sd), uc(kb, -dip - sd - ref)], { kalin: 1.6, opak: 0.95, renk: [0.98, 0.62, 0.38], alt: 1, yakin: 1 });
  G.temkin.push(hk, sr, p1, p2, p3);
  for (const m of G.temkin) { m.renderOrder = 10; m.visible = false; sahne.add(m); }
  etiketKonum('t-hak', kubbe(0.13, az + 0.9));
  etiketKonum('t-ser', kubbe(-dip - 0.13, az + 0.9));
  etiketMetin('t-ser', 'Şer’î ufuk', `−${aciDkSn(t.inhitatDk)}`);
  etiketKonum('t-inh', kubbe(-dip / 2, kb - 0.04));
  etiketMetin('t-inh', 'İnhitât', aciDkSn(t.inhitatDk));
  etiketKonum('t-nis', kubbe(-dip - sd / 2, kb - 0.04));
  etiketMetin('t-nis', 'Nısf-ı kutr', aciDkSn(t.nisfKutrDk));
  etiketKonum('t-ink', kubbe(-dip - sd - ref / 2, kb - 0.04));
  etiketMetin('t-ink', 'İnkisâr', aciDkSn(t.inkisarDk));
}

function seciliAnalemma() {
  const g = yilGunu(D.tarih) - 1;
  const a = G.anaGun && G.anaGun[Math.min(g, G.anaGun.length - 1)];
  if (!a) return;
  etiketKonum('ana-gun', a.P);
  etiketMetin('ana-gun', `${D.tarih.gun} ${AYLAR[D.tarih.ay - 1]}`, `ta’dîl ${isaretli(D.v.tadil, 1)} dk`);
}

async function sahneKur() {
  let dene = null;
  try { dene = document.createElement('canvas').getContext('webgl2'); } catch (e) { dene = null; }
  if (!dene) throw new Error('WebGL2 açılamadı');
  dene.getExtension('WEBGL_lose_context')?.loseContext();
  cizici = new THREE.WebGLRenderer({ canvas: tuval, antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!cizici.capabilities.isWebGL2) throw new Error('WebGL2 yok');
  const kucuk = darEkran() || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  PO = Math.min(devicePixelRatio || 1, kucuk ? 1.6 : 2);
  cizici.setPixelRatio(PO);
  cizici.setSize(W, H, false);
  cizici.setClearColor(0x020309, 1);
  cizici.toneMapping = THREE.ACESFilmicToneMapping;
  cizici.toneMappingExposure = 1.12;
  sahne = new THREE.Scene();
  kamera = new THREE.PerspectiveCamera(50, W / H, 0.02, 2400);
  const ilerle = f => { $('yukleme-dolgu').style.transform = `scaleX(${f})`; };
  ilerle(0.2);
  await Promise.all([document.fonts.load('600 66px Literata'), document.fonts.load('500 30px Inter')]).catch(() => 0);
  ilerle(0.5);

  // gök
  const gok = new THREE.Mesh(new THREE.SphereGeometry(GOK_R, 96, 48), new THREE.ShaderMaterial({
    uniforms: { uGunes: U.uGunes, uIrt: U.uIrt, uYerAlt: U.uYerAlt, uZaman: U.uZaman },
    vertexShader: GOK_VS, fragmentShader: GOK_FS, side: THREE.BackSide, depthWrite: false,
  }));
  gok.renderOrder = -10; gok.frustumCulled = false;
  sahne.add(gok);
  yildizKur();
  // yer
  const yerU = { ...U };
  G.yer = new THREE.Mesh(new THREE.CircleGeometry(260, 128).rotateX(-Math.PI / 2).translate(0, ZEMIN_Y, 0), new THREE.ShaderMaterial({
    uniforms: yerU, vertexShader: DUNYA_VS, fragmentShader: YER_FS, depthWrite: false,
  }));
  G.yer.renderOrder = -5; G.yer.frustumCulled = false;
  sahne.add(G.yer);
  tepelerKur();
  // tabla
  const tablaGeo = new THREE.CylinderGeometry(TABLA, TABLA * 1.01, -ZEMIN_Y, 256, 1, false).translate(0, ZEMIN_Y / 2, 0);
  G.tabla = new THREE.Mesh(tablaGeo, new THREE.ShaderMaterial({
    uniforms: { ...U, uOyma: { value: oymaDokusu() }, uSaydam: { value: 1 } }, vertexShader: DUNYA_VS, fragmentShader: TABLA_FS, transparent: true,
  }));
  sahne.add(G.tabla);
  // mil
  const milMat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: DUNYA_VS, fragmentShader: MIL_FS });
  G.mil = new THREE.Group();
  const cubuk = new THREE.Mesh(new THREE.CylinderGeometry(CUBUK, CUBUK * 1.25, MIL - TEPE * 0.6, 32).translate(0, (MIL - TEPE * 0.6) / 2, 0), milMat);
  const tepe = new THREE.Mesh(new THREE.SphereGeometry(TEPE, 32, 16).translate(0, MIL, 0), milMat);
  const kaide = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.07, 48).translate(0, 0.035, 0), milMat);
  G.mil.add(cubuk, tepe, kaide);
  sahne.add(G.mil);
  ilerle(0.7);
  kubbeKur();
  // güneş ve hayaleti
  const kare = new THREE.PlaneGeometry(1, 1);
  const gunesU = () => ({ uMerkez: { value: new THREE.Vector3() }, uBoy: { value: 1 }, uDisk: { value: 0.25 }, uKizil: { value: 0 }, uKes: { value: -90 }, uKesYum: { value: 0.8 }, uHayalet: { value: 0 }, uGuc: { value: 1 } });
  G.gunes = new THREE.Mesh(kare, new THREE.ShaderMaterial({ uniforms: gunesU(), vertexShader: GUNES_VS, fragmentShader: GUNES_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  G.hayalet = new THREE.Mesh(kare, new THREE.ShaderMaterial({ uniforms: { ...gunesU(), uHayalet: { value: 1 } }, vertexShader: GUNES_VS, fragmentShader: GUNES_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  G.gunes.frustumCulled = G.hayalet.frustumCulled = false;
  G.gunes.renderOrder = 12; G.hayalet.renderOrder = 11;
  sahne.add(G.gunes, G.hayalet);
  // ışık hattı: gölge ucundan mil tepesine ve güneşe doğru
  G.isik = cizgiAg([{ noktalar: [new THREE.Vector3(), new THREE.Vector3()], t: [0, 1] }], { kalin: 1.6, opak: 0.55, renk: [1.0, 0.70, 0.30], yakin: 1, ekle: true });
  G.isik.renderOrder = 9;
  sahne.add(G.isik);

  // son işlem
  const hedef = new THREE.WebGLRenderTarget(W * PO, H * PO, { type: THREE.HalfFloatType, samples: kucuk ? 2 : 4 });
  bestec = new EffectComposer(cizici, hedef);
  bestec.setPixelRatio(PO);
  bestec.setSize(W, H);
  bestec.addPass(new RenderPass(sahne, kamera));
  isilti = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.62, 0.55, 0.88);
  bestec.addPass(isilti);
  sonGecis = new ShaderPass(SON_GECIS);
  bestec.addPass(sonGecis);
  bestec.addPass(new OutputPass());
  ilerle(1);
  sabitSahneyiGuncelle();
  sahneyiGuncelle();
  boyutla();
  sahneHazir = true;
}

/* ════════════════════════════════════════════════════════════════
   9. Etiketler (HTML)
   ════════════════════════════════════════════════════════════════ */
const ETK = new Map();
const etkKap = $('etiketler');
function etiket(id, sinif, oncelik, grup) {
  const el = document.createElement('div');
  el.className = 'etiket ' + sinif;
  etkKap.appendChild(el);
  const e = { id, el, P: new THREE.Vector3(), oncelik, grup, aktif: true, gorunur: false, en: 0, ortala: sinif.includes('etk-ortala'), sol: sinif.includes('etk-sol') };
  ETK.set(id, e);
  return e;
}
const etiketBul = id => ETK.get(id);
function etiketKonum(id, P) { const e = ETK.get(id); if (e) e.P.copy(P); }
function etiketMetin(id, ad, ek) {
  const e = ETK.get(id); if (!e) return;
  const m = ad + (ek || '');
  if (e.m === m) return;
  e.m = m; e.en = 0;
  e.el.textContent = ad;
  if (ek) { const s = document.createElement('small'); s.textContent = ek; e.el.appendChild(s); }
}
(function etiketleriKur() {
  for (const k of SIRA) if (k !== 'zevalBaslangici') etiket('v-' + k, 'etk-vakit', ANA.has(k) ? 60 : 40, 'vakit');
  for (const [s, ad] of [[0, 'Kuzey'], [90, 'Doğu'], [180, 'Güney'], [270, 'Batı']]) { const e = etiket('y-' + s, 'etk-yon', 30, 'yon'); e.P.copy(kubbe(3.2, s)); etiketMetin('y-' + s, ad); }
  for (const [i, ad] of [[5, 'İşrâk · isfirâr'], [-10, 'İştibâk-i nücûm'], [-17, 'İşâ-i evvel'], [-19, 'Fecr · işâ-i sânî']]) {
    etiket('d' + i, 'etk-cizgi', 20, 'daire'); etiketMetin('d' + i, ad, `${i > 0 ? '+' : '−'}${Math.abs(i)}°`);
  }
  etiket('h-fey', 'etk-cizgi', 25, 'halka'); etiketMetin('h-fey', 'Fey-i zevâl');
  etiket('h-asr1', 'etk-cizgi', 26, 'halka'); etiketMetin('h-asr1', 'Asr-ı evvel', '+1 boy');
  etiket('h-asr2', 'etk-cizgi', 26, 'halka'); etiketMetin('h-asr2', 'Asr-ı sânî', '+2 boy');
  etiket('kutup', 'etk-cizgi', 10, 'gece');
  etiket('neh', 'etk-cizgi', 8, 'genel'); etiketMetin('neh', 'Nısf-ün-nehâr dâiresi');
  etiket('yaz', 'etk-cizgi', 9, 'donum'); etiketMetin('yaz', '21 Haziran');
  etiket('kis', 'etk-cizgi', 9, 'donum'); etiketMetin('kis', '21 Aralık');
  etiket('ekv', 'etk-cizgi', 9, 'donum'); etiketMetin('ekv', '21 Mart · 23 Eylül');
  etiket('gunes', 'etk-cizgi etk-sicak', 55, 'gunes');
  etiket('golge', 'etk-cizgi', 50, 'golge');
  etiket('t-hak', 'etk-cizgi', 90, 'temkin'); etiketMetin('t-hak', 'Hakîkî ve riyâdî ufuk', '0°');
  etiket('t-ser', 'etk-cizgi etk-sicak', 90, 'temkin');
  etiket('t-inh', 'etk-cizgi etk-sol', 85, 'temkin');
  etiket('t-nis', 'etk-cizgi etk-sol', 85, 'temkin');
  etiket('t-ink', 'etk-cizgi etk-sol', 85, 'temkin');
  etiket('t-mer', 'etk-cizgi', 80, 'temkin'); etiketMetin('t-mer', 'Merkezin hakîkî yeri');
  etiket('ana-gun', 'etk-cizgi', 80, 'analemma');
  for (let a = 0; a < 12; a++) { etiket('ay-' + a, 'etk-cizgi', 30, 'analemma'); etiketMetin('ay-' + a, AYLAR[a]); }
})();

function grupGorunur(g) {
  const fs = D.fasil, tk = D.kip.temkin > 0.5, an = D.kip.analemma > 0.5;
  if (tk) return g === 'temkin';
  switch (g) {
    case 'vakit': return !an;
    case 'yon': return true;
    case 'daire': return !an && (fs === 1 || fs === 4 || ['imsak', 'istibak', 'yatsiEvvel', 'yatsiSani', 'israk', 'isfirar'].includes(D.levhaKip === 'vakit' ? D.secili : ''));
    case 'halka': return fs === 2 || fs === 3 || (D.levhaKip === 'vakit' && ['ogle', 'zevalBaslangici', 'asrEvvel', 'asrSani'].includes(D.secili));
    case 'gece': return U.uIrt.value < -8 && !an && kamera.position.length() < R * 0.8;
    case 'genel': return fs === 0 || fs === 2;
    case 'donum': return fs === 0 || (D.yilSurukle > 0);
    case 'gunes': return !an;
    case 'golge': return (fs === 2 || fs === 3) && U.uIrt.value > 0.5;
    case 'analemma': return an;
    default: return false;
  }
}

const _p = new THREE.Vector3(), _q = new THREE.Vector3(), _r = new THREE.Vector3();
function etiketGuncelle() {
  const adaylar = [];
  const ileri = kamera.getWorldDirection(_r);
  const solSinir = !darEkran() ? Math.min(440, W * 0.35) + 60 : 4;
  const altSinir = seritUst - 8;
  for (const e of ETK.values()) {
    let goster = e.aktif && grupGorunur(e.grup);
    if (goster) {
      _p.copy(e.P).project(kamera);
      // kameranın arkasında mı
      _q.copy(e.P).sub(kamera.position);
      if (_q.dot(ileri) <= 0) goster = false;
      else {
        const x = (_p.x * 0.5 + 0.5) * W, y = (-_p.y * 0.5 + 0.5) * H;
        if (x < solSinir || x > W - 30 || y < 64 || y > altSinir) goster = false;
        else adaylar.push({ e, x, y });
      }
    }
    if (!goster && e.gorunur) { e.gorunur = false; e.el.classList.remove('gorunur'); }
  }
  adaylar.sort((a, b) => b.e.oncelik - a.e.oncelik);
  const yerler = [];
  for (const a of adaylar) {
    if (!a.e.en) a.e.en = a.e.el.offsetWidth || 100;
    const x0 = a.e.ortala ? a.x - a.e.en / 2 : a.e.sol ? a.x - a.e.en - 8 : a.x + 6;
    const kutu = { x0, x1: x0 + a.e.en, y0: a.y - 10, y1: a.y + 10 };
    const cakisma = kutu.x1 > W - 6 || kutu.x0 < solSinir - 50 || yerler.some(k => kutu.x0 < k.x1 && kutu.x1 > k.x0 && kutu.y0 < k.y1 && kutu.y1 > k.y0);
    const goster = !cakisma;
    if (goster) {
      yerler.push(kutu);
      a.e.el.style.transform = `translate3d(${x0.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) translateY(-50%)`;
    }
    if (goster !== a.e.gorunur) { a.e.gorunur = goster; a.e.el.classList.toggle('gorunur', goster); }
    a.e.el.classList.toggle('etk-secili', a.e.id === 'v-' + D.secili);
  }
}

/* ════════════════════════════════════════════════════════════════
   10. Kamera
   ════════════════════════════════════════════════════════════════ */
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function yorunge(hedef, semt, irt, uzak, gor, bak = 0) {
  const T = hedef.clone();
  const P = T.clone().addScaledVector(yon(irt, semt), -uzak);
  return { P, T, gor, bak };
}
const genis = () => kamera ? kamera.aspect : W / H;
function pozGenel() {
  const z = D.zevalSemt ?? 180, a = genis();
  // gün yayı genişse (yaz) kubbeye biraz daha yukarıdan bakılır
  const dogus = D.hk && D.hk.gunes ? Math.abs(aciFark(D.hk.gunes.semt, z)) : 70;
  const g = yumusak(60, 115, dogus);
  const uzak = (a < 0.8 ? 76 : a < 1.3 ? 62 : 50) * ara(1, 1.14, g);
  return yorunge(V3(0, a < 0.8 ? 7 : 4, 0), z, ara(a < 0.8 ? -18 : -15, -25, g), uzak, a < 0.8 ? 58 : 50);
}
function pozGunYayi() { const z = D.zevalSemt ?? 180, a = genis(); return yorunge(V3(0, 4, 0), z + 28, -21, a < 0.8 ? 78 : a < 1.3 ? 64 : 54, a < 0.8 ? 58 : 50); }
function semtVakit(k, yedek) { return D.hk[k] ? D.hk[k].semt : yedek; }
function pozUfuk(semt, irt = -3) {
  const a = genis();
  return yorunge(V3(0, 1.4, 0), semt, irt, a < 0.8 ? 20 : 15, a < 0.8 ? 74 : 56);
}
function pozTablaZeval() {
  const z = D.zevalSemt ?? 180, a = genis();
  const kb = z === 180 ? 0 : 180;
  const T = yon(0, kb).multiplyScalar(MIL * D.v.feyiZeval * 0.45).setY(0.6);
  return yorunge(T, z - 32, -30, a < 0.8 ? 21 : 15.5, a < 0.8 ? 60 : 48);
}
function pozTablaAsr() {
  const s = semtVakit('asrEvvel', 230), a = genis();
  const kb = s + 180;
  const T = yon(0, kb).multiplyScalar(MIL * (D.v.feyiZeval + 1.2) * 0.5).setY(0.5);
  return yorunge(T, s - 26, -32, a < 0.8 ? 26 : 19, a < 0.8 ? 60 : 48);
}
function pozTemkin() {
  const az = G.temkinSemt ?? semtVakit('aksam', 270), a = genis();
  const dip = D.temkinU.inhitatDk / 60;
  const hedef = kubbe(-0.62, az - 0.15);
  return { P: V3(0, 0, 0), T: hedef, gor: a < 0.8 ? 9 : a < 1.3 ? 6 : 4.6, bak: 1 };
}
function pozAnalemma() {
  const z = D.zevalSemt ?? 180, a = genis();
  const orta = 90 - Math.abs(D.yer.enlem);
  const kb = z === 180 ? -1 : 1;
  return { P: V3(0, MIL + 0.6, 0), T: kubbe(kis(orta + 2, 8, 80), z), gor: a < 0.8 ? 88 : 70, bak: 1 };
}

function kameraKur(t) {
  const S = D.S, K = D.kul;
  const ileri = _q.copy(S.T).sub(S.P);
  let uzak = ileri.length();
  const sph = new THREE.Spherical().setFromVector3(ileri);
  let gor = S.gor * K.gor;
  if (S.bak > 0.5) {
    // yerinde dönerek bakma
    sph.theta += K.yaw * RAD; sph.phi = kis(sph.phi - K.pitch * RAD, 0.05, Math.PI - 0.05);
    kamera.position.copy(S.P);
    _p.setFromSpherical(sph).add(S.P);
    kamera.up.set(0, 1, 0);
    kamera.lookAt(_p);
  } else {
    sph.theta += K.yaw * RAD; sph.phi = kis(sph.phi - K.pitch * RAD, 0.12, Math.PI - 0.12);
    sph.radius = uzak * K.uzak;
    _p.setFromSpherical(sph);
    kamera.position.copy(S.T).sub(_p);
    if (kamera.position.y < 0.3) kamera.position.y = 0.3;
    kamera.up.set(0, 1, 0);
    kamera.lookAt(S.T);
  }
  kamera.fov = kis(gor, 2, 95);
  kamera.near = S.bak > 0.5 ? 0.05 : 0.08;
  // levhaya yer açmak için görüntü merkezini kaydır
  const dar = darEkran();
  let hx = 0, hy = 0;
  if (!dar) hx = Math.min(440, W * 0.35) * 0.5 + 14;
  else hy = levhaBoy * 0.5 + 40;
  const hiz = D.hazir ? 1 - Math.exp(-0.016 * 3) : 1;
  D.ofs.x += (hx - D.ofs.x) * hiz; D.ofs.y += (hy - D.ofs.y) * hiz;
  kamera.setViewOffset(W, H, -D.ofs.x, D.ofs.y, W, H);
  kamera.updateProjectionMatrix();
}

function ucusBaslat(B, sure = 2.4, bitince) {
  const S = D.S, K = D.kul;
  if (kamera && D.hazir) {
    // kullanıcının çevirmesi dâhil, ekrandaki görüntü başlangıç olur
    const P = kamera.position.clone();
    const yonu = kamera.getWorldDirection(new THREE.Vector3());
    const T = S.bak > 0.5 ? P.clone().addScaledVector(yonu, S.T.distanceTo(S.P)) : S.T.clone();
    S.P.copy(P); S.T.copy(T); S.gor = S.gor * K.gor;
    K.yaw = 0; K.pitch = 0; K.uzak = 1; K.gor = 1;
  }
  S.bak = B.bak;
  D.ucus = {
    t0: performance.now() / 1000, sure: azHareket ? 0.01 : sure,
    A: { P: S.P.clone(), T: S.T.clone(), gor: S.gor }, B, bitince,
  };
}
function ucusIlerlet(t) {
  const u = D.ucus;
  if (!u) return;
  const ham = kis((t - u.t0) / u.sure, 0, 1), e = kolayla(ham);
  const S = D.S;
  S.P.lerpVectors(u.A.P, u.B.P, e);
  S.T.lerpVectors(u.A.T, u.B.T, e);
  // uzak uçuşlarda hafif yükselme
  const tumsek = Math.sin(Math.PI * e) * Math.min(12, u.A.P.distanceTo(u.B.P) * 0.15);
  if (u.B.bak < 0.5) S.P.y += tumsek;
  S.gor = Math.exp(ara(Math.log(u.A.gor), Math.log(u.B.gor), e));
  if (ham >= 1) { D.ucus = null; if (u.bitince) u.bitince(); }
}

/* ════════════════════════════════════════════════════════════════
   11. Vakit seçimi ve fasıllar
   ════════════════════════════════════════════════════════════════ */
/** Zaman yolculuğu: [dakika, süre (sn), bekleme (sn)] adımları. */
function zamanYolu(adimlar, sec = {}) {
  const a = adimlar.filter(x => isFinite(x[0]));
  if (!a.length) return;
  D.zaman = { adim: a, i: 0, t0: performance.now() / 1000, dk0: D.dk, bekle: false, dongu: !!sec.dongu };
  canliBirak();
}
function zamanIlerlet(t) {
  const z = D.zaman;
  if (!z) return;
  const [hedef, sure, bekle] = z.adim[z.i];
  const gecen = t - z.t0;
  if (!z.bekle) {
    const u = azHareket ? 1 : kis(gecen / Math.max(sure, 0.01), 0, 1);
    D.dk = ara(z.dk0, hedef, u < 1 ? (sure > 6 ? u : kolayla(u)) : 1);
    if (u >= 1) { z.bekle = true; z.t0 = t; }
  } else if (gecen >= (bekle || 0)) {
    z.i++;
    if (z.i >= z.adim.length) {
      if (z.dongu) { z.i = 0; } else { D.zaman = null; return; }
    }
    z.bekle = false; z.t0 = t; z.dk0 = D.dk;
  }
}

function vakitPoz(k) {
  const vk = D.v.vakitler;
  switch (k) {
    case 'imsak': return pozUfuk(semtVakit('imsak', 100), -6);
    case 'gunes': case 'israk': return pozUfuk(semtVakit(k, 100), 0);
    case 'zevalBaslangici': case 'ogle': return pozTablaZeval();
    case 'asrEvvel': case 'asrSani': return pozTablaAsr();
    case 'isfirar': case 'aksam': return pozUfuk(semtVakit(k, 260), 0);
    default: return pozUfuk(semtVakit(k, 260), -6);
  }
}
function vakitSec(k, sec = {}) {
  fasilBirak(); izleDur();
  D.secili = k;
  vakitYaz(k);
  bolumGoster('vakit');
  siraYaz();
  if (sec.levhaYalniz) return;
  if (!D.v || isNaN(D.v.vakitler[k].hakiki)) { ucusBaslat(pozGenel(), 2.2); return; }
  hedefKip({ saydam: ['imsak', 'istibak', 'yatsiEvvel', 'yatsiSani'].includes(k) ? 1 : 0, halka: ['ogle', 'zevalBaslangici', 'asrEvvel', 'asrSani'].includes(k) ? 1 : 0.3 });
  ucusBaslat(vakitPoz(k), 2.4);
  zamanYolu([[D.v.vakitler[k].hakiki, 2.2, 0]]);
}

function hedefKip(k) {
  D.hedefKip.temkin = k.temkin || 0;
  D.hedefKip.analemma = k.analemma || 0;
  D.hedefKip.halka = k.halka ?? 0.3;
  D.hedefKip.saydam = k.saydam || 0;
}

const FASIL_SURE = [17, 17, 16, 20, 20, 18, 16];
function fasilAc(i, sec = {}) {
  if (i < 0 || i >= FASILLAR.length) return;
  izleDur();
  D.fasil = i; D.fasilSure = 0; D.secili = null;
  fasilYaz(i);
  bolumGoster('fasil');
  siraYaz();
  const vk = D.v.vakitler, h = k => vk[k].hakiki;
  hedefKip({});
  if (i === 0) {
    ucusBaslat(pozGunYayi(), 3.2);
    const bas = isNaN(h('imsak')) ? 240 : h('imsak') - 30, son = isNaN(h('yatsiSani')) ? 1380 : h('yatsiSani') + 20;
    zamanYolu([[bas, 2.2, 0.6], [son, 13, 1.5]]);
  } else if (i === 1) {
    hedefKip({ saydam: 1 });
    ucusBaslat(pozUfuk(semtVakit('imsak', 100), -6), 3);
    const im = h('imsak');
    zamanYolu([[im - 45, 2.2, 0.4], [im, 6, 3], [h('gunes'), 6, 2]]);
  } else if (i === 2) {
    hedefKip({ halka: 1 });
    ucusBaslat(pozTablaZeval(), 3);
    const z = D.v.hakikiZeval;
    zamanYolu([[z - 75, 2, 0.3], [z, 5, 3], [z + 75, 5, 1.5]]);
  } else if (i === 3) {
    hedefKip({ halka: 1 });
    ucusBaslat(pozTablaAsr(), 3);
    zamanYolu([[D.v.hakikiZeval + 20, 2, 0.4], [h('asrEvvel'), 6, 3.2], [h('asrSani'), 5, 3.2]]);
  } else if (i === 4) {
    hedefKip({ saydam: 1 });
    ucusBaslat(pozUfuk(semtVakit('aksam', 260), -6), 3);
    zamanYolu([[h('aksam') - 25, 2, 0.4], [h('aksam'), 3, 1.8], [h('istibak'), 3.5, 1.6], [h('yatsiEvvel'), 3, 1.6], [h('yatsiSani'), 2, 2]]);
  } else if (i === 5) {
    hedefKip({ temkin: 1 });
    ucusBaslat(pozTemkin(), 3.4);
    const g = h('aksam');
    zamanYolu([[g - 3, 2.6, 0.8], [g, 3, 1.6], [g + D.temkinU.hesapDk, 7, 3]]);
  } else if (i === 6) {
    hedefKip({ analemma: 1 });
    ucusBaslat(pozAnalemma(), 3.2);
    zamanYolu([[720 - 4 * D.yer.boylam + 60 * D.tz, 2.4, 0]]);
  }
}
function fasilBirak() {
  if (D.fasilOynat) fasilOynatDur();
  if (D.fasil >= 0) { D.fasil = -1; hedefKip({}); }
}
function fasilKapat() {
  fasilBirak();
  D.zaman = null;
  bolumGoster('cedvel');
  ucusBaslat(pozGenel(), 2.6);
}
function fasilOynatBasla() {
  D.fasilOynat = true; D.fasilSure = 0;
  $('dg-fasil').setAttribute('aria-pressed', 'true');
  const i = D.fasil >= 0 ? D.fasil : 0;
  const oynat = D.fasilOynat;
  fasilAc(i);
  D.fasilOynat = oynat;
}
function fasilOynatDur() {
  D.fasilOynat = false;
  const b = $('dg-fasil'); b.setAttribute('aria-pressed', 'false'); b.style.setProperty('--sure', 0);
}
function sonrakiFasil() {
  const oynat = D.fasilOynat;
  if (D.fasil < FASILLAR.length - 1) { fasilAc(D.fasil + 1); D.fasilOynat = oynat; }
  else { fasilOynatDur(); fasilKapat(); }
}
$('dg-fasil').addEventListener('click', () => (D.fasilOynat ? fasilOynatDur() : fasilOynatBasla()));
$('dg-once').addEventListener('click', () => { const o = D.fasilOynat; if (D.fasil > 0) { fasilAc(D.fasil - 1); D.fasilOynat = o; } });
$('dg-sonra').addEventListener('click', sonrakiFasil);
$('dg-fasil-geri').addEventListener('click', () => { fasilOynatDur(); fasilKapat(); });
$('dg-vakit-geri').addEventListener('click', () => { D.secili = null; bolumGoster('cedvel'); siraYaz(); ucusBaslat(pozGenel(), 2.4); });
$('dg-levha-ac').addEventListener('click', () => {
  const acik = levha.classList.toggle('acik');
  govde.classList.toggle('levha-acik', acik);
  $('dg-levha-ac').setAttribute('aria-expanded', acik ? 'true' : 'false');
  setTimeout(() => { levhaBoy = levha.offsetHeight; }, 520);
});

/* ════════════════════════════════════════════════════════════════
   12. Döngü
   ════════════════════════════════════════════════════════════════ */
function ufukRengi(h) {
  // gök gölgelendiricisinin ufuk rengine yakın bir ortalama (yer sisi için)
  const gun = yumusak(-5, 12, h), sig = yumusak(-13, -2, h);
  const gece = [0.010, 0.016, 0.034], gu = [0.20, 0.25, 0.32];
  const guc = 0.8 * Math.exp(-(((h + 2.5) / 7) ** 2)) + 0.16 * Math.exp(-(((h + 13.5) / 4.6) ** 2));
  const ar = [ara(0.22, 0.62, sig), ara(0.26, 0.17, sig), ara(0.34, 0.06, sig)];
  return [0, 1, 2].map(i => ara(gece[i], gu[i], gun) + ar[i] * guc * 0.28 * (1 - 0.65 * gun));
}

let sonT = 0, kareSay = 0, kareToplam = 0, basamak = 0, sonSaniye = -1;
const _s = new THREE.Vector3();
function dongu(simdi) {
  requestAnimationFrame(dongu);
  if (document.hidden || !D.yer) return;
  const t = simdi / 1000, dt = Math.min(0.05, Math.max(0.001, t - sonT));
  sonT = t;

  // zaman
  if (yilBekleyen) { tarihAyarla(yilBekleyen); yilBekleyen = null; D.yilSurukle = 2.5; }
  if (D.yilSurukle > 0) D.yilSurukle -= dt;
  if (D.canli) {
    const s = simdiYerel();
    if (s.tarih.gun !== D.tarih.gun || s.tarih.ay !== D.tarih.ay || s.tarih.yil !== D.tarih.yil) tarihAyarla(s.tarih, { koru: true });
    D.dk = s.dk;
  } else if (D.izle) {
    D.dk += dt * 26;
    if (D.dk >= 1440) D.dk -= 1440;
  }
  zamanIlerlet(t);
  const saniye = Math.floor(D.dk * 2);
  if (saniye !== sonSaniye) { sonSaniye = saniye; siraYaz(); }
  seritGuncelle();

  // fasılları sırayla gösterme
  if (D.fasilOynat && D.fasil >= 0 && !D.ucus) {
    D.fasilSure += dt;
    const top = FASIL_SURE[D.fasil] || 16;
    $('dg-fasil').style.setProperty('--sure', kis(D.fasilSure / top, 0, 1).toFixed(3));
    if (D.fasilSure >= top) sonrakiFasil();
  }

  if (!sahneHazir) return;
  ucusIlerlet(t);
  for (const k of ['temkin', 'analemma', 'halka', 'saydam']) D.kip[k] += (D.hedefKip[k] - D.kip[k]) * (1 - Math.exp(-dt * 3.2));
  const tk = D.kip.temkin, an = D.kip.analemma;

  // güneş
  const g = gunesAn(D.dk);
  yon(g.irtifa, g.semt, _s);
  U.uGunes.value.copy(_s);
  U.uIrt.value = g.irtifa;
  U.uZaman.value = t;
  const gece = 1 - yumusak(-8, 6, g.irtifa);
  U.uGece.value = gece;
  const ur = ufukRengi(g.irtifa);
  U.uUfuk.value.setRGB(ur[0], ur[1], ur[2]);

  // temkin faslında: görünen güneş inkisâr kadar yukarıda, şer'î ufkun altında kaybolur
  const dip = D.temkinU.inhitatDk / 60;
  U.uYerAlt.value = -dip * tk;
  const ink = (D.temkinU.inkisarDk / 60) * tk;
  const gorunen = kubbe(g.irtifa + ink, g.semt);
  const gm = G.gunes.material.uniforms, hm = G.hayalet.material.uniforms;
  const uzakG = gorunen.distanceTo(kamera.position);
  const diskAci = ara(0.62, D.temkinU.nisfKutrDk / 60, tk);
  const boy = Math.tan(diskAci * RAD) * uzakG * 10;
  gm.uMerkez.value.copy(gorunen); gm.uBoy.value = boy; gm.uDisk.value = 0.2;
  gm.uKizil.value = 1 - yumusak(-1, 14, g.irtifa);
  gm.uKes.value = tk > 0.5 ? -dip : -0.05;
  gm.uKesYum.value = tk > 0.5 ? 0.1 : 0.9;
  gm.uGuc.value = 1;
  G.gunes.visible = g.irtifa + ink > (tk > 0.5 ? -2.5 : -0.75);
  // güneş ufkun altındayken yerini gösteren halka
  const hayaletGor = tk > 0.5 ? 1 : yumusak(0.3, -1.5, g.irtifa);
  G.hayalet.visible = hayaletGor > 0.01;
  hm.uMerkez.value.copy(kubbe(g.irtifa, g.semt));
  const uzakH = hm.uMerkez.value.distanceTo(kamera.position);
  hm.uBoy.value = Math.tan((tk > 0.5 ? D.temkinU.nisfKutrDk / 60 : 0.55) * RAD) * uzakH * 3.2;
  hm.uDisk.value = 2 / 3.2 * 0.95;
  hm.uGuc.value = hayaletGor * (tk > 0.5 ? 0.9 : 0.75);
  hm.uKes.value = -90;
  etiketKonum('gunes', gorunen.clone().multiplyScalar(1.0));
  etiketMetin('gunes', '', `İrtifâ’ ${isaretli(g.irtifa, 1)}°`);
  etiketKonum('t-mer', kubbe(g.irtifa, g.semt));
  const sabah = g.saatAcisi < 0;
  const odak = sabah ? (D.hk.imsak ? D.hk.imsak.semt : 110) - 21 : (D.hk.yatsiSani ? D.hk.yatsiSani.semt : 250) + 21;
  for (const i of [5, -10, -17, -19]) etiketKonum('d' + i, kubbe(i + 0.5, odak));

  // gölge ve halkalara değme
  const golgeBoyu = g.irtifa > 0.2 ? MIL / Math.tan(g.irtifa * RAD) : Infinity;
  const fz = D.v.feyiZeval;
  const degme = R0 => Math.exp(-(((golgeBoyu - R0) / 0.12) ** 2));
  U.uDegme.value.set(degme(MIL * fz), degme(MIL * (fz + 1)), degme(MIL * (fz + 2)));
  U.uHalka.value.w = ara(0.1, 1, D.kip.halka) * (g.irtifa > -2 ? 1 : 0.4);
  const say = 1 - 0.7 * D.kip.saydam;
  G.tabla.material.uniforms.uSaydam.value = say;
  G.tabla.material.depthWrite = say > 0.97;
  if (isFinite(golgeBoyu) && golgeBoyu < 60) {
    const uc = _q.set(-_s.x, 0, -_s.z).normalize().multiplyScalar(golgeBoyu);
    etiketKonum('golge', uc.clone().setY(0.05));
    etiketMetin('golge', 'Gölge ucu', `${ondalik(golgeBoyu / MIL, 2)} boy`);
    // ışık hattı: gölge ucu → mil tepesi → güneşe doğru
    const ih = G.isik.geometry.attributes;
    const A = uc.clone().setY(0.01), B = V3(0, MIL, 0).addScaledVector(_s, 7);
    const pos = ih.position.array, dg = ih.aDiger.array;
    for (let j = 0; j < 4; j++) {
      const P = j < 2 ? A : B, O = j < 2 ? B : A;
      pos.set([P.x, P.y, P.z], j * 3); dg.set([O.x, O.y, O.z], j * 3);
    }
    ih.position.needsUpdate = true; ih.aDiger.needsUpdate = true;
    G.isik.visible = (D.fasil === 2 || D.fasil === 3 || (D.levhaKip === 'vakit' && ['ogle', 'zevalBaslangici', 'asrEvvel', 'asrSani'].includes(D.secili))) && tk < 0.5;
    G.isik.material.uniforms.uOpak.value = 0.5 * yumusak(0.5, 4, g.irtifa);
  } else G.isik.visible = false;

  // yıldızlar: yerel yıldız zamanı
  const ut = D.dk / 60 - D.tz;
  const jd = V.julyenGunu(D.tarih.yil, D.tarih.ay, D.tarih.gun, ut);
  const th = ((280.46061837 + 360.98564736629 * (jd - 2451545.0) + D.yer.boylam) % 360) * RAD;
  const fi = D.yer.enlem * RAD;
  const Sx = 0, Sy = Math.cos(fi), Sz = Math.sin(fi);       // ekvatorun nısf-ün-nehâr noktası
  const Wx = -1;                                              // batı
  const c1 = [Math.cos(th) * Sx + Math.sin(th) * Wx, Math.cos(th) * Sy, Math.cos(th) * Sz];
  const c2 = [Math.sin(th) * Sx - Math.cos(th) * Wx, Math.sin(th) * Sy, Math.sin(th) * Sz];
  const c3 = [0, Math.sin(fi), -Math.cos(fi)];
  G.yildiz.material.uniforms.uDon.value.set(c1[0], c2[0], c3[0], c1[1], c2[1], c3[1], c1[2], c2[2], c3[2]);
  G.yildiz.material.uniforms.uGor.value = (1 - yumusak(-17, -5, g.irtifa)) * (1 - tk);
  if (G.yildiz.material.uniforms.uGor.value > 0.01) {
    const kp = new THREE.Vector3(c3[0], c3[1], c3[2]).multiplyScalar(R);
    etiketKonum('kutup', kp);
  }

  // çizgilerin renkleri: gündüz koyu mürekkep, gece altın
  const gunF = 1 - gece;
  const murekkep = (m, gu, ge) => m.material.uniforms.uRenk.value.setRGB(ara(ge[0], gu[0], gunF), ara(ge[1], gu[1], gunF), ara(ge[2], gu[2], gunF));
  murekkep(G.izgara, [0.10, 0.12, 0.17], [0.86, 0.82, 0.74]);
  murekkep(G.ufukC, [0.42, 0.28, 0.10], [0.95, 0.78, 0.46]);
  murekkep(G.centik, [0.42, 0.28, 0.10], [0.95, 0.80, 0.50]);
  murekkep(G.nehar, [0.36, 0.26, 0.12], [0.95, 0.80, 0.50]);
  G.izgara.material.uniforms.uOpak.value = ara(0.085, 0.2, gunF) * (1 - tk) * (1 - 0.6 * an);
  G.ufukC.material.uniforms.uOpak.value = 0.7 * (1 - tk);
  G.centik.material.uniforms.uOpak.value = 0.6 * (1 - tk);
  G.nehar.material.uniforms.uOpak.value = ara(0.35, 0.6, D.fasil === 2 || an > 0.5 ? 1 : 0) * (1 - tk);
  G.donum.material.uniforms.uOpak.value = ara(D.fasil === 0 || D.yilSurukle > 0 ? 0.55 : 0.2, 0.08, an) * (1 - tk);
  murekkep(G.donum, [0.40, 0.26, 0.08], [0.95, 0.82, 0.58]);
  const daireVurgu = { 5: [], '-10': [4], '-17': [4], '-19': [1, 4] };
  for (const [i, m] of Object.entries(G.daire)) {
    const vur = (daireVurgu[i] || []).includes(D.fasil) ? 1 : 0;
    m.material.uniforms.uOpak.value = ara(0.16, 0.85, vur) * (1 - tk) * (1 - 0.7 * an);
    m.material.uniforms.uKalin.value = ara(1.1, 1.8, vur) * PO;
  }
  G.yay.material.uniforms.uSimdi.value = D.dk;
  G.yayHale.material.uniforms.uSimdi.value = D.dk;
  G.yay.material.uniforms.uOpak.value = 0.95 * (1 - tk) * (1 - 0.75 * an);
  G.yayHale.material.uniforms.uOpak.value = (1 - tk) * (1 - 0.75 * an);
  G.nokta.material.opacity = 1;
  G.nokta.visible = tk < 0.5 && an < 0.5;
  // seçili vakit noktası büyür
  const pg = G.nokta.geometry.attributes;
  let j = 0;
  for (const n of G.vakitNokta) {
    if (!n) continue;
    const sec = n.k === D.secili || (D.secili === 'zevalBaslangici' && n.k === 'ogle');
    pg.aBoy.array[j] = (ANA.has(n.k) ? 13 : 10) * (sec ? 1.7 : 1);
    pg.aGuc.array[j] = sec ? 1.6 : 0.95;
    j++;
  }
  pg.aBoy.needsUpdate = pg.aGuc.needsUpdate = true;
  G.analemma.visible = G.anaNokta.visible = an > 0.02;
  G.analemma.material.uniforms.uOpak.value = 0.9 * an;
  if (an > 0.02 && G.anaGun) {
    for (let a = 0; a < 12; a++) {
      const k = G.anaGun.find(x => x.t.ay === a + 1 && x.t.gun === 1);
      if (k) etiketKonum('ay-' + a, k.P);
    }
  }
  for (const m of G.temkin) m.visible = tk > 0.5;
  // temkin faslında tabla, mil, yer ve tepeler gizlenir
  const dunya = tk < 0.5;
  G.tabla.visible = G.mil.visible = G.yer.visible = dunya;
  const tepeGor = dunya && kamera.position.y < 15;
  for (const m of G.tepeler) m.visible = tepeGor;

  kameraKur(t);
  etiketGuncelle();
  sonGecis.uniforms.uZaman.value = t;
  isilti.strength = ara(0.62, 0.42, gunF);
  bestec.render();

  // başarım: yavaş cihazda önce çözünürlük, sonra ışıltı
  if (D.hazir && basamak < 2) {
    kareSay++; kareToplam += dt;
    if (kareSay === 90) {
      const ort = kareToplam / kareSay;
      if (ort > 0.03) {
        basamak++;
        if (basamak === 1) { PO = Math.max(1, PO * 0.7); boyutla(); }
        else isilti.enabled = false;
      } else if (ort < 0.021) basamak = 3;
      kareSay = 0; kareToplam = 0;
    }
  }
}

let levhaBoy = 0, seritUst = 0;
function boyutla() {
  W = innerWidth; H = innerHeight;
  levhaBoy = levha.offsetHeight;
  seritUst = document.querySelector('.serit-bas').getBoundingClientRect().top;
  seritGuncelle();
  if (!cizici || !bestec) return;
  cizici.setPixelRatio(PO);
  cizici.setSize(W, H, false);
  kamera.aspect = W / H;
  kamera.updateProjectionMatrix();
  bestec.setPixelRatio(PO);
  bestec.setSize(W, H);
  isilti.resolution.set(W / 2, H / 2);
  U.uCoz.value.set(W * PO / 2, H * PO / 2);
  sonGecis.uniforms.uCoz.value.set(W * PO, H * PO);
  sahne.traverse(o => {
    const u = o.material && o.material.uniforms;
    if (!u) return;
    if (u.uKalin && o.userData.kalin) u.uKalin.value = o.userData.kalin * PO;
    if (u.uPO) u.uPO.value = PO;
  });
  for (const e of ETK.values()) e.en = 0;
}

/* ════════════════════════════════════════════════════════════════
   13. Olaylar
   ════════════════════════════════════════════════════════════════ */
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (!yerPencere.hidden) { if (e.key === 'Escape') { e.preventDefault(); yerKapat(); } return; }
  const h = e.target, etiketAd = h && h.tagName;
  if (etiketAd === 'INPUT' || etiketAd === 'SELECT' || etiketAd === 'TEXTAREA' || (h && h.classList && h.classList.contains('ray'))) return;
  const dugmede = etiketAd === 'BUTTON' || etiketAd === 'A';
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      if (D.levhaKip === 'fasil') sonrakiFasil(); else { izleDur(); zamanAyarla(D.dk + (e.shiftKey ? 60 : 5)); }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (D.levhaKip === 'fasil') { if (D.fasil > 0) fasilAc(D.fasil - 1); } else { izleDur(); zamanAyarla(D.dk - (e.shiftKey ? 60 : 5)); }
      break;
    case 'ArrowUp': if (!dugmede) { e.preventDefault(); tarihAyarla(gunEkle(D.tarih, 1)); } break;
    case 'ArrowDown': if (!dugmede) { e.preventDefault(); tarihAyarla(gunEkle(D.tarih, -1)); } break;
    case ' ': if (!dugmede) { e.preventDefault(); $('dg-izle').click(); } break;
    case 'Escape':
      if (D.izle) izleDur();
      else if (D.levhaKip === 'fasil') { fasilOynatDur(); fasilKapat(); }
      else if (D.levhaKip === 'vakit') $('dg-vakit-geri').click();
      break;
  }
});

// Sürükleyerek bakış, tekerlek / iki parmakla yaklaşma
const parmak = new Map();
let surukle = null, cimdik = 0;
tuval.addEventListener('pointerdown', e => {
  tuval.setPointerCapture(e.pointerId);
  parmak.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (parmak.size === 1) surukle = { x: e.clientX, y: e.clientY };
  else if (parmak.size === 2) { const [a, b] = [...parmak.values()]; cimdik = Math.hypot(a.x - b.x, a.y - b.y); surukle = null; }
});
tuval.addEventListener('pointermove', e => {
  if (!parmak.has(e.pointerId)) return;
  parmak.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (parmak.size === 2) {
    const [a, b] = [...parmak.values()];
    const m = Math.hypot(a.x - b.x, a.y - b.y);
    if (cimdik > 0) yaklas(cimdik / m);
    cimdik = m;
    return;
  }
  if (!surukle || D.ucus) return;
  const dx = e.clientX - surukle.x, dy = e.clientY - surukle.y;
  surukle.x = e.clientX; surukle.y = e.clientY;
  const k = D.S.bak > 0.5 ? D.S.gor / 60 : 1;
  D.kul.yaw = kis(D.kul.yaw - dx * 0.16 * k, -170, 170);
  D.kul.pitch = kis(D.kul.pitch + dy * 0.12 * k, -60, 60);
  D.fasilSure = Math.min(D.fasilSure, 4);
});
const birak = e => { parmak.delete(e.pointerId); if (parmak.size < 2) cimdik = 0; if (parmak.size === 0) surukle = null; };
tuval.addEventListener('pointerup', birak);
tuval.addEventListener('pointercancel', birak);
function yaklas(k) {
  if (D.S.bak > 0.5) D.kul.gor = kis(D.kul.gor * k, 0.35, 2.2);
  else D.kul.uzak = kis(D.kul.uzak * k, 0.3, 1.9);
}
tuval.addEventListener('wheel', e => { e.preventDefault(); yaklas(Math.exp(e.deltaY * 0.001)); }, { passive: false });

let boyutZaman = 0;
addEventListener('resize', () => { clearTimeout(boyutZaman); boyutZaman = setTimeout(boyutla, 80); });

/* ════════════════════════════════════════════════════════════════
   14. Başlat
   ════════════════════════════════════════════════════════════════ */
function hazir() {
  D.hazir = true;
  govde.classList.remove('yukleniyor');
  govde.dataset.hazir = '1';
}

D.yer = yerOku();
{
  const s = simdiYerel();
  D.tarih = null;
  tarihAyarla(s.tarih, { koru: true, zorla: true });
  D.dk = s.dk;
  siraYaz(); seritGuncelle();
}
requestAnimationFrame(dongu);

sahneKur().then(() => {
  const P = pozGenel();
  D.S.P.copy(P.P).add(V3(0, 40, -60)); D.S.T.copy(P.T).add(V3(0, 16, 0)); D.S.gor = P.gor; D.S.bak = 0;
  ucusBaslat(P, azHareket ? 0.01 : 4.2);
  hazir();
}).catch(hata => {
  console.warn('Nemâz Vakitleri: 3B sahne açılamadı, düz görünüme geçildi.', hata);
  cizici = null; sahneHazir = false;
  govde.classList.add('duz');
  $('yukleme-yazi').textContent = '';
  hazir();
});

// Hata ayıklama ve denetim için
window.__vakit = {
  D, V, git: (k) => (typeof k === 'number' ? fasilAc(k) : vakitSec(k)), fasilAc, vakitSec, zamanAyarla, tarihAyarla,
  yerSec, simdiyeDon, gunesAn, MIL, R, TABLA, U, G,
  kamera: () => kamera, isilti: () => isilti, ucusBitir: () => { if (D.ucus) { D.ucus.t0 = -1e9; } },
  zamanBitir: () => { if (D.zaman) { const a = D.zaman.adim; D.dk = a[a.length - 1][0]; D.zaman = null; } },
};
