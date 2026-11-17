/* Silsile-i Aliyye Atlası — üç boyutlu sahne ve gezinme
   Veri: veri.js (SILSILE), arazi dokuları: doku/ (tools/silsile-arazi.py üretir). */

import * as THREE from 'three';
import { EffectComposer } from '/vendor/three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '/vendor/three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/vendor/three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from '/vendor/three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from '/vendor/three/addons/postprocessing/OutputPass.js';

/* ════════════════════════════════════════════════════════════════
   1. Sabitler ve küçük yardımcılar
   ════════════════════════════════════════════════════════════════ */
const RAD = Math.PI / 180;
const DOKU = new URL('../doku/', import.meta.url).href;   // sayfa adresi '/silsile-atlasi' (eğik çizgisiz) olsa da doğru yer
const BOLGE = { bati: 14, dogu: 96, guney: 8, kuzey: 54 };   // tools/silsile-arazi.py ile aynı
const HMAX = 9000;            // doku yükseklik tavanı (m)
const KABART = 9;             // dağ kabartma çarpanı
const YER = 6371000;
const KAB = HMAX * KABART / YER;
const yukseklik = m => m * KABART / YER;
const kis = (x, a, b) => Math.min(b, Math.max(a, x));
const ara = (a, b, t) => a + (b - a) * t;
const yumusak = (a, b, x) => { const t = kis((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const kolayla = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const $ = id => document.getElementById(id);
const azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
const darEkran = () => innerWidth <= 860;

function yon(lat, lon, hedef = new THREE.Vector3()) {
  const f = lat * RAD, l = lon * RAD;
  return hedef.set(Math.cos(f) * Math.cos(l), Math.sin(f), -Math.cos(f) * Math.sin(l));
}
const doguYon = (up, h = new THREE.Vector3()) => h.set(up.z, 0, -up.x).normalize();
const kuzeyYon = (up, h = new THREE.Vector3()) => h.crossVectors(up, doguYon(up, _g1)).normalize();
const _g1 = new THREE.Vector3(), _g2 = new THREE.Vector3(), _g3 = new THREE.Vector3(), _g4 = new THREE.Vector3();

function kureAra(a, b, t, hedef = new THREE.Vector3()) {
  const aci = a.angleTo(b);
  if (aci < 1e-6) return hedef.copy(a);
  const s = Math.sin(aci);
  return hedef.copy(a).multiplyScalar(Math.sin((1 - t) * aci) / s).addScaledVector(b, Math.sin(t * aci) / s).normalize();
}

/* ════════════════════════════════════════════════════════════════
   2. Veri: halkalar, beldeler
   ════════════════════════════════════════════════════════════════ */
const yilSayi = s => { const m = String(s || '').match(/\d{3,4}/); return m ? +m[0] : null; };
const bilinir = s => { const t = String(s || '').trim(); return !!t && t !== '?'; };
const kitapDisi = s => s.halka === null || s.halka === undefined;      // kitabı hazırlayan âlim
const kesme = s => String(s || '').replace(/'/g, '’');
const bitisik = s => String(s || '').replace(/(\p{L})-(?=\p{L})/gu, '$1-\u2060');   // izâfet çizgisinde satır bölünmesin

// Sıra ve adlandırma veri.js'teki "halka" alanına göredir: 0 feyz kaynağı, 1–35 halkalar, null kitabı hazırlayan
const halkaEtiketi = s => (s.halka === 0 ? 'Menba-i feyz' : kitapDisi(s) ? 'Se’âdet-i Ebediyye’yi hazırlayan' : `${s.halka}. halka`);
const halkaIsareti = s => (s.halka === 0 ? '✦' : kitapDisi(s) ? '❖' : String(s.halka));

// Mîlâdî tarih metni: "1563 – 1624", "v. 1180", "d. 1512" veya ""
function tarihMetni(s) {
  const d = String(s.dogum || '').trim(), v = String(s.vefat || '').trim();
  if (bilinir(d) && bilinir(v)) return `${d} – ${v}`;
  if (bilinir(v)) return `v. ${v}`;
  if (bilinir(d)) return `d. ${d}`;
  return '';
}

// Zaman şeridindeki yeri: vefât; yoksa kitaptaki mîlâdî kayıt, doğum, en son asrın ortası
const ROMA = { I: 1, V: 5, X: 10, L: 50, C: 100 };
function temsiliYil(s) {
  if (bilinir(s.vefat) && yilSayi(s.vefat)) return yilSayi(s.vefat);
  const kayit = String(s.hicri || '').match(/m\.\s*(\d{3,4})/);
  if (kayit) return +kayit[1];
  if (bilinir(s.dogum) && yilSayi(s.dogum)) return yilSayi(s.dogum);
  const r = (String(s.asir || '').match(/[IVXLC]+/g) || []).pop();
  if (!r) return 2000;
  let t = 0;
  for (let k = 0; k < r.length; k++) { const a = ROMA[r[k]], b = ROMA[r[k + 1]] || 0; t += a < b ? -a : a; }
  return t * 100 - 50;
}

const HALKA = SILSILE.map((s, i) => {
  const m = s.tam_ad.match(/^(Peygamber Efendimiz\s+|Hazret-i\s+)?(.*?)(?:\s*\(([^)]+)\))?$/);
  const cekirdek = m[2].trim(), hazretleri = /\s+hazretleri$/.test(cekirdek);
  return {
    i, no: s.id, ham: s,
    on: (m[1] || '').trim(), ad: bitisik(kesme(cekirdek.replace(/\s+hazretleri$/, ''))),
    hurmet: (hazretleri ? 'hazretleri ' : '') + (m[3] ? `(${m[3]})` : ''),
    tam: bitisik(kesme(s.ad)), etiket: halkaEtiketi(s), isaret: halkaIsareti(s),
    lat: s.koordinat[0], lon: s.koordinat[1],
    yil: temsiliYil(s), yerKisa: kesme(s.sehir.replace(/\s*\(.*\)\s*/, '').trim()),
    durak: -1
  };
});
const SON = HALKA.length - 1;
const HALKA_SAYISI = Math.max(...SILSILE.map(s => (typeof s.halka === 'number' ? s.halka : 0)));
const KIMLIK = {};
HALKA.forEach(h => { KIMLIK[h.no] = h.i; });

// Feyz aldığı halkalar: veri.js'te "hoca" yoksa bir önceki sıradaki zât
function hocalar(i) {
  const s = HALKA[i].ham;
  if (Array.isArray(s.hoca) && s.hoca.length) return s.hoca.map(id => KIMLIK[id]).filter(j => j !== undefined);
  return i > 0 ? [i - 1] : [];
}
const talebeler = i => HALKA.map(h => h.i).filter(j => j !== i && hocalar(j).includes(i));
function iliskiEtiketi(kimden, kime, yon) {
  const a = HALKA[kimden].ham, b = HALKA[kime].ham;
  if (yon === 'hoca') return b.halka === 0 ? 'Feyz kaynağı' : kitapDisi(a) ? 'Hocası' : 'Feyz aldığı';
  return kitapDisi(b) ? 'Talebesi' : 'Feyz verdiği';
}

const DURAK = [];
HALKA.forEach(h => {
  const v = yon(h.lat, h.lon);
  let d = DURAK.find(x => x.yon.angleTo(v) < 0.00035);         // ≈ 2 km içindekiler aynı belde
  if (!d) { d = { yon: v, lat: h.lat, lon: h.lon, uyeler: [], rakim: 0, ad: h.yerKisa, P: new THREE.Vector3(), r: 1 }; DURAK.push(d); }
  d.uyeler.push(h.i);
  h.durak = DURAK.indexOf(d);
});

function durakYerlestir(rakimlar) {
  DURAK.forEach(d => {
    d.rakim = rakimlar ? rakimlar[d.uyeler[0]] || 0 : 0;
    d.r = 1 + yukseklik(d.rakim) + 0.0011;
    d.P.copy(d.yon).multiplyScalar(d.r);
  });
}
durakYerlestir(null);

/* ════════════════════════════════════════════════════════════════
   3. Durum
   ════════════════════════════════════════════════════════════════ */
const D = {
  kip: 'giris',            // giris | yolda | butun | bitti
  i: -1,                   // etkin halka
  iler: -0.3,              // zincirin açılmış kısmı (0 = ilk halka, 36 = son)
  ucus: null,
  oynat: false, oynatSure: 0,
  hazir: false,
  S: { yon: yon(27, 50), r: 1, uzak: 3.1, egim: 0.0, bas: 0 },   // kamera düzeneği
  kul: { bas: 0, egim: 0, uzak: 1 },                              // kullanıcının bakış kaydırması
  ofs: { x: 0, y: 0 },
  hayalet: 0,
  parla: new Float32Array(DURAK.length)
};
const OYNAT_BEKLE = 12;      // otomatik yolculukta her halkada kalış (sn)

/* ════════════════════════════════════════════════════════════════
   4. Arayüz: levha, zaman şeridi, dizin
   ════════════════════════════════════════════════════════════════ */
const govde = document.body;
const levha = $('levha');

function yilYaz(ham) {
  const s = String(ham || '').trim();
  const y = bilinir(s) ? yilSayi(s) : null;
  if (!y) return '<span title="Bilinmiyor">—</span>';
  return s.startsWith('~') ? `${y}<small>dolayları</small>` : String(y);
}

const paragraflar = metin => String(metin || '').split(/\n\s*\n/)
  .map(p => p.replace(/\s+/g, ' ').trim().replace(/(\p{L})-(?=\p{L})/gu, '$1-⁠')).filter(Boolean);

function paragrafYaz(kutu, metin) {
  kutu.textContent = '';
  paragraflar(metin).forEach(p => { const el = document.createElement('p'); el.textContent = p; kutu.appendChild(el); });
}

function levhaDoldur(i) {
  const h = HALKA[i], s = h.ham, sayili = typeof s.halka === 'number' && s.halka > 0;
  $('lv-halka').classList.toggle('adsiz', !sayili);
  $('lv-no').textContent = sayili ? s.halka : '';
  $('lv-no-ek').textContent = sayili ? '. halka' : h.etiket;
  $('lv-toplam').textContent = sayili ? `${HALKA_SAYISI} halkadan` : '';
  $('lv-on').textContent = h.on;
  $('lv-ad').textContent = h.ad;
  $('lv-hurmet').textContent = h.hurmet;
  const lakap = kesme(s.lakap);
  $('lv-lakap').textContent = lakap === h.etiket ? '' : lakap;
  $('lv-dogum').innerHTML = yilYaz(s.dogum);
  $('lv-vefat').innerHTML = yilYaz(s.vefat);
  $('lv-hicri').textContent = kesme(s.hicri);
  $('lv-hicri').parentElement.hidden = !s.hicri;
  $('lv-yer').textContent = kesme(`${s.sehir}, ${s.ulke}`);

  // Silsiledeki yeri: yalnız sıradaki komşularından farklıysa ayrıca gösterilir
  const hc = hocalar(i), tl = talebeler(i);
  const sade = (i === 0 ? !hc.length : hc.length === 1 && hc[0] === i - 1) && (i === SON ? !tl.length : tl.length === 1 && tl[0] === i + 1);
  const yeri = $('lv-yeri');
  yeri.textContent = '';
  yeri.hidden = sade;
  if (!sade) {
    const grup = (baslik, liste) => {
      if (!liste.length) return;
      const satir = document.createElement('div'), ad = document.createElement('span');
      ad.textContent = baslik;
      satir.appendChild(ad);
      liste.forEach(j => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = HALKA[j].tam;
        b.addEventListener('click', () => git(j));
        satir.appendChild(b);
      });
      yeri.appendChild(satir);
    };
    if (hc.length) grup(iliskiEtiketi(i, hc[0], 'hoca'), hc);
    if (tl.length) grup(iliskiEtiketi(i, tl[0], 'talebe'), tl);
  }

  paragrafYaz($('lv-metin'), kesme(s.biyografi));
  paragrafYaz($('lv-kitap'), s.hal_tercemesi);
  $('lv-kitap-kutu').hidden = !s.hal_tercemesi;
  $('lv-devam').textContent = kesme(s.kaynak);

  const once = $('dg-once'), sonra = $('dg-sonra');
  once.disabled = i === 0;
  once.querySelector('i').textContent = i > 0 ? (hc.includes(i - 1) ? iliskiEtiketi(i, i - 1, 'hoca') : 'Önceki') : '';
  $('gz-once-ad').textContent = i > 0 ? HALKA[i - 1].tam : '';
  sonra.querySelector('i').textContent = i < SON ? (hocalar(i + 1).includes(i) ? iliskiEtiketi(i, i + 1, 'talebe') : 'Sonraki') : 'Sonra';
  $('gz-sonra-ad').textContent = i < SON ? HALKA[i + 1].tam : 'Silsilenin tamamı';
  $('levha-kaydir').scrollTop = 0;
}

// Sayılar veriden hesaplanır
$('sayi-halka').textContent = HALKA_SAYISI;
$('sayi-durak').textContent = DURAK.length;

/* Zaman şeridi */
const YIL0 = 560, YIL1 = 2012;
const yilKonum = y => (y - YIL0) / (YIL1 - YIL0);
const centikler = [];
(function seritKur() {
  const asir = $('serit-asirlar');
  for (let y = 600; y <= 2000; y += 100) {
    const el = document.createElement('span');
    el.style.left = (yilKonum(y) * 100).toFixed(3) + '%';
    el.dataset.yil = y;
    asir.appendChild(el);
  }
  const ol = $('serit-centik');
  HALKA.forEach(h => {
    const li = document.createElement('li');
    const k = yilKonum(h.yil);
    li.style.left = (k * 100).toFixed(3) + '%';
    if (k < 0.13) li.classList.add('sol'); else if (k > 0.87) li.classList.add('sag');
    const b = document.createElement('button');
    b.type = 'button';
    const vefat = bilinir(h.ham.vefat) ? yilSayi(h.ham.vefat) : null;
    b.setAttribute('aria-label', `${h.etiket}: ${h.tam}` + (vefat ? `, vefâtı ${vefat}` : ''));
    const ip = document.createElement('span');
    ip.textContent = `${h.isaret} · ${h.tam}` + (vefat ? ` · ${vefat}` : '');
    b.appendChild(ip);
    b.addEventListener('click', () => git(h.i));
    li.appendChild(b);
    ol.appendChild(li);
    centikler.push(li);
  });
})();

function seritGuncelle() {
  const p = kis(D.iler, 0, SON), a = Math.floor(p), b = Math.min(SON, a + 1), f = p - a;
  const yil = ara(HALKA[a].yil, HALKA[b].yil, f);
  const k = yilKonum(yil) * 100;
  const yilEl = $('serit-yil');
  yilEl.style.left = k.toFixed(3) + '%';
  const yazi = String(Math.round(yil));
  if (yilEl.textContent !== yazi) yilEl.textContent = yazi;
  let enIleri = 0;
  for (let j = 0; j <= Math.floor(p + 0.001); j++) enIleri = Math.max(enIleri, yilKonum(HALKA[j].yil));
  $('serit-dolgu').style.width = (Math.max(enIleri, yilKonum(yil)) * 100).toFixed(3) + '%';
}
function seritIsaretle() {
  centikler.forEach((li, j) => {
    li.classList.toggle('gecildi', j <= D.i || D.kip === 'bitti');
    li.classList.toggle('etkin', j === D.i && D.kip === 'yolda');
  });
}

/* Dizin */
const dizin = $('dizin');
let dizinOnceki = null;
(function dizinKur() {
  const ol = $('dizin-liste');
  HALKA.forEach(h => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<span class="no"></span><span class="ad"></span><span class="alt"></span>';
    b.children[0].textContent = h.isaret;
    b.children[1].textContent = h.tam;
    b.children[2].textContent = [tarihMetni(h.ham), kesme(h.ham.sehir)].filter(Boolean).join(' · ');
    b.setAttribute('aria-label', `${h.etiket}: ${h.tam}`);
    b.addEventListener('click', () => { dizinKapat(); git(h.i); });
    li.appendChild(b);
    ol.appendChild(li);
  });
})();
function dizinAc() {
  dizinOnceki = document.activeElement;
  dizin.hidden = false;
  [...$('dizin-liste').children].forEach((li, j) => li.classList.toggle('etkin', j === D.i));
  $('dg-dizin-kapat').focus();
  oynatDur();
}
function dizinKapat() {
  dizin.hidden = true;
  if (dizinOnceki && dizinOnceki.focus) dizinOnceki.focus();
}

/* Silsile-i Aliyye nedir? (kitaptaki bilgi ve kaynak) */
const hakkinda = $('hakkinda');
let hakkindaOnceki = null;
function hakkindaAc() {
  hakkindaOnceki = document.activeElement;
  hakkinda.hidden = false;
  hakkinda.scrollTop = 0;
  $('dg-hakkinda-kapat').focus();
  oynatDur();
}
function hakkindaKapat() {
  hakkinda.hidden = true;
  if (hakkindaOnceki && hakkindaOnceki.focus) hakkindaOnceki.focus();
}

/* ════════════════════════════════════════════════════════════════
   5. Sahne
   ════════════════════════════════════════════════════════════════ */
const tuval = $('sahne');
let cizici = null, sahne = null, kamera = null, bestec = null, isilti = null, sonGecis = null;
let W = innerWidth, H = innerHeight, PO = 1;
let U = null;                 // paylaşılan uniform'lar
let zincir = null, zincirHale = null, kandiller = null, cografya = [], yildizlar = null;
let KARE = [];                // halka başına kamera karesi
const etiketler = [];

const GLSL_ORTAK = /* glsl */`
  uniform sampler2D uBolge;
  uniform vec4 uSinir;
  uniform float uKab;
  const float PI = 3.141592653589793;
  vec2 bolgeUv(vec2 ll){ return vec2((ll.x - uSinir.x) / (uSinir.y - uSinir.x), (ll.y - uSinir.z) / (uSinir.w - uSinir.z)); }
  float bolgeAgirlik(vec2 uv){
    if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) return 0.0;
    vec2 m = smoothstep(vec2(0.0), vec2(0.04, 0.07), uv) * smoothstep(vec2(0.0), vec2(0.04, 0.07), 1.0 - uv);
    return m.x * m.y;
  }
`;

const ARAZI_VS = /* glsl */`
  ${GLSL_ORTAK}
  uniform float uYama;
  uniform float uLod;
  varying vec3 vYon;
  varying vec3 vDunya;
  void main(){
    vec3 d = normalize(position);
    float yuk = 0.0;
    if (uYama > 0.5) {
      vec2 ll = vec2(atan(-d.z, d.x), asin(clamp(d.y, -1.0, 1.0)));
      vec2 uv = bolgeUv(ll);
      float w = smoothstep(0.5, 1.0, bolgeAgirlik(uv));
      float r = textureLod(uBolge, uv, uLod).r;
      yuk = r * r * uKab * w;
    }
    vec3 p = d * (1.0 + yuk);
    vYon = d;
    vDunya = p;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

const araziFS = durakSayi => /* glsl */`
  #define DURAK_SAYI ${durakSayi}
  ${GLSL_ORTAK}
  uniform sampler2D uKure;
  uniform sampler2D uNehir;
  uniform float uNehirEn;
  uniform float uYama;
  uniform float uDetay;
  uniform float uZaman;
  uniform vec4 uKandil[DURAK_SAYI];
  uniform float uKandilK;
  varying vec3 vYon;
  varying vec3 vDunya;

  float karma(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float gurultu(vec3 x){
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(karma(i), karma(i + vec3(1,0,0)), f.x), mix(karma(i + vec3(0,1,0)), karma(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(karma(i + vec3(0,0,1)), karma(i + vec3(1,0,1)), f.x), mix(karma(i + vec3(0,1,1)), karma(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main(){
    vec3 d = normalize(vYon);
    float lon = atan(-d.z, d.x), lat = asin(clamp(d.y, -1.0, 1.0));
    vec2 uvb = bolgeUv(vec2(lon, lat));
    float w = bolgeAgirlik(uvb);
    if (uYama > 0.5) { if (w < 0.5) discard; } else { if (w > 0.62) discard; }

    // dünya dokusu: ±180° dikişinde türevi düzelt
    float u1 = lon / (2.0 * PI) + 0.5, u2 = fract(u1 + 0.5) - 0.5, vv = lat / PI + 0.5;
    vec2 gx = vec2(abs(dFdx(u1)) < abs(dFdx(u2)) ? dFdx(u1) : dFdx(u2), dFdx(vv));
    vec2 gy = vec2(abs(dFdy(u1)) < abs(dFdy(u2)) ? dFdy(u1) : dFdy(u2), dFdy(vv));
    vec4 tg = textureGrad(uKure, vec2(u1, vv), gx, gy);
    vec4 tb = texture2D(uBolge, clamp(uvb, 0.0, 1.0));
    vec4 t = mix(tg, tb, w);

    float yuk = t.r * t.r * ${HMAX.toFixed(1)};
    vec2 e = (t.gb - 0.5) * 2.0; e = sign(e) * e * e * 0.8;

    float aa = clamp(fwidth(t.a) * 0.8, 0.004, 0.25);
    float kara = smoothstep(0.5 - aa, 0.5 + aa, t.a);

    // yakın bakışta ince doku
    float puruz = clamp(length(e) * 5.0, 0.12, 1.0);
    if (uDetay > 0.01) {
      vec3 p1 = d * 950.0, p2 = d * 2900.0;
      vec2 n1 = vec2(gurultu(p1), gurultu(p1 + 31.7)) - 0.5;
      vec2 n2 = vec2(gurultu(p2), gurultu(p2 + 17.3)) - 0.5;
      e += (n1 * 0.062 + n2 * 0.042) * uDetay * puruz * kara;
    }

    // yerel doğu-kuzey-yukarı çerçevesinde kabartma gölgesi (ışık kuzeybatıdan)
    vec3 n = normalize(vec3(-e.x * 7.5, -e.y * 7.5, 1.0));
    vec3 L = normalize(vec3(-0.62, 0.52, 0.56));
    float golge = dot(n, L);
    float isik = clamp(golge, 0.0, 1.0);

    vec3 E = normalize(vec3(d.z, 0.0, -d.x)), N = cross(d, E);
    vec3 nW = normalize(E * n.x + N * n.y + d * n.z);
    vec3 V = normalize(cameraPosition - vDunya);

    // ay ışığında yükseklik renkleri
    vec3 c0 = vec3(0.040, 0.052, 0.080), c1 = vec3(0.062, 0.072, 0.100), c2 = vec3(0.098, 0.108, 0.140), c3 = vec3(0.40, 0.45, 0.55);
    vec3 taban = mix(c0, c1, smoothstep(0.0, 1400.0, yuk));
    taban = mix(taban, c2, smoothstep(1400.0, 4000.0, yuk));
    taban = mix(taban, c3, smoothstep(4900.0, 6600.0, yuk) * 0.6);
    vec3 karaR = taban * (0.16 + 2.05 * pow(isik, 1.7));
    karaR += vec3(0.16, 0.20, 0.28) * pow(max(golge - 0.56, 0.0) / 0.44, 2.0) * 0.5;

    // su
    float sig = smoothstep(0.16, 0.5, t.a);
    vec3 su = mix(vec3(0.010, 0.017, 0.034), vec3(0.026, 0.046, 0.078), sig * sig);
    vec3 Lw = normalize(E * L.x + N * L.y + d * L.z);
    float par = pow(max(dot(reflect(-Lw, d), V), 0.0), 34.0);
    su += vec3(0.11, 0.14, 0.20) * par * 0.55;

    vec3 renk = mix(su, karaR, kara);

    // kıyı çizgisi
    float kiyi = (1.0 - smoothstep(0.0, aa * 1.5, abs(t.a - 0.5))) * (1.0 - smoothstep(0.02, 0.11, aa));
    renk = mix(renk, vec3(0.27, 0.32, 0.42), kiyi * 0.34);

    // nehirler
    if (w > 0.01) {
      float nd = texture2D(uNehir, clamp(uvb, 0.0, 1.0)).r;
      float tpp = max(fwidth(uvb.x) * uNehirEn, 1e-4);
      float dTex = (1.0 - nd) * 7.0;
      float en = max(0.5, 1.05 * tpp);
      float nehir = (1.0 - smoothstep(en * 0.5, en * 1.35, dTex)) * (1.0 - smoothstep(1.6, 3.6, tpp)) * w * kara;
      renk = mix(renk, vec3(0.11, 0.17, 0.28) + vec3(0.10, 0.13, 0.18) * par, nehir * mix(0.5, 0.82, smoothstep(0.25, 1.0, tpp)));
    }

    // kandiller: her beldenin altın ışığı çevresindeki araziyi aydınlatır
    vec3 altin = vec3(0.0);
    for (int i = 0; i < DURAK_SAYI; i++) {
      vec4 k = uKandil[i];
      if (k.w < 0.002) continue;
      vec3 dv = k.xyz - vDunya;
      float r2 = dot(dv, dv) * uKandilK;
      if (r2 > 16.0) continue;
      float f = k.w / (1.0 + r2 * 3.2) * (1.0 - r2 / 16.0);
      float nl = 0.30 + 0.70 * max(dot(nW, normalize(dv + d * 0.4 * sqrt(dot(dv, dv)))), 0.0);
      altin += vec3(1.0, 0.60, 0.22) * f * nl;
    }
    vec3 yansit = mix(vec3(0.05, 0.07, 0.10), taban * 4.2 + 0.05, kara);
    renk += altin * yansit;

    // ufka doğru hafif pus
    float fr = pow(1.0 - max(dot(V, d), 0.0), 3.0);
    renk = mix(renk, vec3(0.09, 0.13, 0.22), fr * 0.45);

    gl_FragColor = vec4(renk, 1.0);
  }
`;

const HAVA_VS = /* glsl */`
  varying vec3 vDunya;
  void main(){ vDunya = position; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }
`;
const HAVA_FS = /* glsl */`
  uniform float uRa;
  uniform vec3 uRenk;
  varying vec3 vDunya;
  void main(){
    vec3 ro = cameraPosition, rd = normalize(vDunya - cameraPosition);
    float b = dot(ro, rd), c = dot(ro, ro) - uRa * uRa, disc = b * b - c;
    if (disc < 0.0) discard;
    float sq = sqrt(disc), t0 = max(-b - sq, 0.0), t1 = -b + sq;
    float dp = b * b - (dot(ro, ro) - 1.0);
    if (dp > 0.0) { float tp = -b - sqrt(dp); if (tp > 0.0) t1 = min(t1, tp); }
    float yol = max(t1 - t0, 0.0);
    float I = pow(clamp(yol / (2.0 * sqrt(uRa * uRa - 1.0)), 0.0, 1.0), 2.1);
    gl_FragColor = vec4(uRenk * I, I);
  }
`;

const SERIT_VS = /* glsl */`
  attribute vec3 aDiger;
  attribute float aYan;
  attribute float aUc;
  attribute float aIler;
  uniform vec2 uCoz;
  uniform float uKalin;
  varying float vYan;
  varying float vIler;
  void main(){
    vec4 c = projectionMatrix * viewMatrix * vec4(position, 1.0);
    vec4 o = projectionMatrix * viewMatrix * vec4(aDiger, 1.0);
    vec2 sc = c.xy / max(c.w, 1e-5) * uCoz, so = o.xy / max(o.w, 1e-5) * uCoz;
    vec2 dir = (so - sc) * aUc;
    float boy = length(dir);
    dir = boy > 1e-4 ? dir / boy : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    c.xy += nrm * aYan * uKalin / uCoz * c.w;
    gl_Position = c;
    vYan = aYan;
    vIler = aIler;
  }
`;
const ZINCIR_FS = /* glsl */`
  uniform float uIler;
  uniform float uZaman;
  uniform float uHayalet;
  uniform float uGuc;
  varying float vYan;
  varying float vIler;
  void main(){
    float kenar = 1.0 - smoothstep(0.25, 1.0, abs(vYan));
    float acik = 1.0 - step(uIler, vIler);
    float bas = exp(-max(uIler - vIler, 0.0) * 16.0) * acik;
    float akis = pow(0.5 + 0.5 * sin(vIler * 30.0 - uZaman * 1.9), 8.0);
    vec3 altin = vec3(1.0, 0.60, 0.20);
    vec3 renk = altin * (0.95 + 0.9 * akis) + vec3(1.0, 0.86, 0.60) * bas * 3.0;
    vec3 soluk = vec3(0.62, 0.50, 0.30) * 0.5;
    float a = kenar * (acik + (1.0 - acik) * uHayalet * 0.5);
    gl_FragColor = vec4(mix(soluk, renk, acik) * uGuc, a);
  }
`;

const KANDIL_VS = /* glsl */`
  attribute float aGuc;
  uniform float uBoy;
  varying float vGuc;
  void main(){
    vGuc = aGuc;
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
    gl_PointSize = uBoy * (0.55 + 0.6 * min(aGuc, 1.6));
  }
`;
const KANDIL_FS = /* glsl */`
  varying float vGuc;
  void main(){
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0 || vGuc < 0.004) discard;
    float cekirdek = exp(-r * r * 30.0), hale = exp(-r * r * 4.6) * 0.26;
    vec3 renk = mix(vec3(1.0, 0.64, 0.24), vec3(1.0, 0.90, 0.66), cekirdek) * (cekirdek * 2.6 + hale);
    gl_FragColor = vec4(renk * min(vGuc, 1.8), 1.0);
  }
`;

const YAZI_VS = /* glsl */`
  varying vec2 vUv;
  varying float vYuz;
  varying float vUzak;
  void main(){
    vUv = uv;
    vec4 dp = modelMatrix * vec4(position, 1.0);
    vUzak = length(cameraPosition - dp.xyz);
    vec3 merkez = normalize(modelMatrix[3].xyz);
    vYuz = dot(merkez, normalize(cameraPosition - dp.xyz));
    gl_Position = projectionMatrix * viewMatrix * dp;
  }
`;
const YAZI_FS = /* glsl */`
  uniform sampler2D uDoku;
  uniform float uOpak;
  uniform vec3 uRenk;
  uniform vec2 uYakin;
  varying vec2 vUv;
  varying float vYuz;
  varying float vUzak;
  void main(){
    float a = texture2D(uDoku, vUv).a * uOpak * smoothstep(0.2, 0.52, vYuz) * smoothstep(uYakin.x, uYakin.y, vUzak);
    if (a < 0.003) discard;
    gl_FragColor = vec4(uRenk, a);
  }
`;

const YILDIZ_VS = /* glsl */`
  attribute float aBoy;
  attribute float aFaz;
  uniform float uZaman;
  uniform float uPO;
  varying float vPar;
  void main(){
    vPar = 0.72 + 0.28 * sin(uZaman * (0.5 + aFaz * 0.9) + aFaz * 40.0);
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
    gl_PointSize = aBoy * uPO;
  }
`;
const YILDIZ_FS = /* glsl */`
  varying float vPar;
  void main(){
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = exp(-r * r * 5.0) * vPar;
    gl_FragColor = vec4(vec3(0.78, 0.84, 1.0) * a * 0.85, 1.0);
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
      c.rgb *= mix(0.5, 1.0, smoothstep(0.86, 0.22, length(q)));
      float g = fract(sin(dot(vUv * uCoz + fract(uZaman) * 91.7, vec2(12.9898, 78.233))) * 43758.5453);
      c.rgb += (g - 0.5) * 0.010;
      gl_FragColor = c;
    }`
};

function seritGeometri(parcalar) {
  let seg = 0;
  for (const p of parcalar) seg += p.noktalar.length - 1;
  const konum = new Float32Array(seg * 12), diger = new Float32Array(seg * 12);
  const yan = new Float32Array(seg * 4), uc = new Float32Array(seg * 4), iler = new Float32Array(seg * 4);
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
        iler[v + j] = bas ? p.iler[k] : p.iler[k + 1];
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
  g.setAttribute('aIler', new THREE.BufferAttribute(iler, 1));
  g.setIndex(new THREE.BufferAttribute(indis, 1));
  return g;
}

/* Zincirin eğrisi: halkadan halkaya büyük daire yayları; aynı beldede kalınca küçük bir ilmek */
function zincirParcalari() {
  const parcalar = [];
  const N = 44;
  const yay = (A, B, i0, noktalar, iler) => {
    const aci = A.yon.angleTo(B.yon);
    const tepe = kis(0.2 * aci, Math.max(0.0011, Math.min(0.0034, 0.5 * aci)), 0.1);
    for (let k = 0; k <= N; k++) {
      const s = k / N;
      const r = ara(A.r, B.r, s) + tepe * 4 * s * (1 - s);
      noktalar.push(kureAra(A.yon, B.yon, s).multiplyScalar(r));
      iler.push(i0 + s);
    }
  };
  for (let i = 0; i < SON; i++) {
    const A = DURAK[HALKA[i].durak], B = DURAK[HALKA[i + 1].durak];
    const noktalar = [], iler = [];
    if (A === B) {
      const up = A.yon, e = doguYon(up, new THREE.Vector3()), n = kuzeyYon(up, new THREE.Vector3());
      const az = (i * 2.399963) % (Math.PI * 2);
      const yatay = e.multiplyScalar(Math.cos(az)).addScaledVector(n, Math.sin(az));
      const boy = 0.0062, en = 0.0026;
      for (let k = 0; k <= N; k++) {
        const s = k / N;
        noktalar.push(A.P.clone().addScaledVector(up, boy * Math.sin(Math.PI * s)).addScaledVector(yatay, en * Math.sin(2 * Math.PI * s)));
        iler.push(i + s);
      }
    } else yay(A, B, i, noktalar, iler);
    parcalar.push({ noktalar, iler });
  }
  // veri.js "hoca": sıradaki zâttan başka halkalardan da feyz almışsa, ayrı beldeler arasına bir yay daha
  const ciftler = new Set();
  for (let i = 0; i < SON; i++) ciftler.add(HALKA[i].durak + '>' + HALKA[i + 1].durak);
  HALKA.forEach(h => hocalar(h.i).forEach(j => {
    const a = HALKA[j].durak, b = h.durak, anahtar = a + '>' + b;
    if (j === h.i - 1 || a === b || ciftler.has(anahtar)) return;
    ciftler.add(anahtar);
    const noktalar = [], iler = [];
    yay(DURAK[a], DURAK[b], h.i - 1, noktalar, iler);
    parcalar.push({ noktalar, iler });
  }));
  return parcalar;
}

/* Yeryüzündeki coğrafya yazıları */
const COGRAFYA = [
  // metin, enlem, boylam, boy (derece), dönme (derece, saat yönünün tersi), tür
  ['HİCAZ', 22.6, 41.4, 1.15, 0, 'diyar'],
  ['IRAK', 31.3, 45.9, 1.05, 0, 'diyar'],
  ['ŞAM', 34.9, 38.4, 0.95, 0, 'diyar'],
  ['ANADOLU', 38.5, 35.0, 1.15, 0, 'diyar'],
  ['RUMELİ', 42.4, 24.8, 0.95, 0, 'diyar'],
  ['MISIR', 26.6, 29.4, 1.1, 0, 'diyar'],
  ['İRAN', 32.0, 54.0, 1.2, 0, 'diyar'],
  ['HORASAN', 34.4, 59.6, 1.15, 0, 'diyar'],
  ['MÂVERÂÜNNEHR', 41.9, 66.4, 1.2, -6, 'diyar'],
  ['HÂRİZM', 42.6, 59.6, 0.8, 0, 'diyar'],
  ['HİNDİSTAN', 23.4, 78.6, 1.35, 0, 'diyar'],
  ['PENCAP', 31.9, 72.6, 0.75, 0, 'diyar'],
  ['YEMEN', 15.6, 45.6, 1.0, 0, 'diyar'],
  ['KAFKASYA', 42.6, 44.6, 0.75, -12, 'diyar'],
  ['Akdeniz', 34.2, 25.0, 1.1, 0, 'deniz'],
  ['Karadeniz', 43.25, 34.4, 1.0, 0, 'deniz'],
  ['Hazar Denizi', 41.0, 50.7, 0.8, -62, 'deniz'],
  ['Kızıldeniz', 20.6, 38.3, 0.75, -57, 'deniz'],
  ['Basra Körfezi', 26.9, 51.5, 0.62, -36, 'deniz'],
  ['Umman Denizi', 18.6, 63.0, 1.1, 0, 'deniz'],
  ['Ceyhun', 41.2, 61.2, 0.42, -42, 'ince'],
  ['Seyhun', 44.5, 66.3, 0.42, -32, 'ince'],
  ['Dicle', 34.5, 44.7, 0.36, -52, 'ince'],
  ['Fırat', 35.5, 39.6, 0.36, -28, 'ince'],
  ['İndüs', 28.4, 69.3, 0.42, 58, 'ince'],
  ['Ganj', 26.4, 81.6, 0.42, -24, 'ince'],
  ['Nil', 24.9, 31.9, 0.42, 78, 'ince'],
  ['Hindukuş', 35.9, 69.6, 0.42, 22, 'ince'],
  ['Pamir', 38.7, 73.4, 0.42, 0, 'ince'],
  ['Himalaya', 30.2, 81.8, 0.5, -24, 'ince'],
  ['Zagros', 33.4, 48.0, 0.42, -46, 'ince'],
  ['Elburz', 36.25, 52.3, 0.36, -8, 'ince'],
  ['Karakum', 39.4, 59.2, 0.42, 0, 'ince'],
  ['Kızılkum', 42.4, 63.6, 0.42, 0, 'ince']
];

function yaziDokusu(metin, tur) {
  const px = 96;
  const tuv = document.createElement('canvas');
  const c = tuv.getContext('2d');
  const buyuk = tur === 'diyar';
  const yazi = buyuk ? metin.toLocaleUpperCase('tr') : metin;
  const font = buyuk ? `600 ${px}px Literata, Georgia, serif` : `italic 400 ${px}px Literata, Georgia, serif`;
  const aralik = buyuk ? px * 0.34 : px * 0.05;
  c.font = font;
  const harfler = [...yazi];
  const enler = harfler.map(h => c.measureText(h).width);
  const toplam = enler.reduce((a, b) => a + b, 0) + aralik * (harfler.length - 1);
  tuv.width = Math.ceil(toplam + px * 0.6);
  tuv.height = Math.ceil(px * 1.6);
  c.font = font;
  c.textBaseline = 'middle';
  c.fillStyle = '#fff';
  let x = px * 0.3;
  harfler.forEach((h, k) => { c.fillText(h, x, tuv.height / 2); x += enler[k] + aralik; });
  const doku = new THREE.CanvasTexture(tuv);
  doku.anisotropy = 8;
  doku.minFilter = THREE.LinearMipmapLinearFilter;
  return { doku, oran: tuv.width / tuv.height };
}

function cografyaKur() {
  const geo = new THREE.PlaneGeometry(1, 1);
  for (const [metin, lat, lon, boy, donme, tur] of COGRAFYA) {
    const { doku, oran } = yaziDokusu(metin, tur);
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uDoku: { value: doku }, uOpak: { value: 0 },
        uYakin: { value: tur === 'diyar' ? new THREE.Vector2(0.2, 0.55) : tur === 'deniz' ? new THREE.Vector2(0.12, 0.34) : new THREE.Vector2(0.0, 0.01) },
        uRenk: { value: tur === 'diyar' ? new THREE.Color(0.62, 0.68, 0.82) : tur === 'deniz' ? new THREE.Color(0.40, 0.50, 0.70) : new THREE.Color(0.66, 0.72, 0.84) }
      },
      vertexShader: YAZI_VS, fragmentShader: YAZI_FS,
      transparent: true, depthTest: false, depthWrite: false
    });
    const ag = new THREE.Mesh(geo, m);
    const up = yon(lat, lon), e = doguYon(up, new THREE.Vector3()), n = kuzeyYon(up, new THREE.Vector3());
    const r = donme * RAD;
    const x = e.clone().multiplyScalar(Math.cos(r)).addScaledVector(n, Math.sin(r));
    const y = e.clone().multiplyScalar(-Math.sin(r)).addScaledVector(n, Math.cos(r));
    const yuk = boy * RAD * (tur === 'diyar' ? 1.0 : 1.3);
    ag.matrixAutoUpdate = false;
    ag.matrix.makeBasis(x.multiplyScalar(yuk * oran), y.multiplyScalar(yuk), up.clone());
    ag.matrix.setPosition(up.clone().multiplyScalar(tur === 'ince' ? 1.0085 : 1.004));
    ag.matrixWorld.copy(ag.matrix);
    ag.frustumCulled = false;
    ag.renderOrder = 3;
    ag.userData.tur = tur;
    sahne.add(ag);
    cografya.push(ag);
  }
}

function yildizKur() {
  const say = 5200;
  const konum = new Float32Array(say * 3), boy = new Float32Array(say), faz = new Float32Array(say);
  let tohum = 20241117;
  const rs = () => { tohum = (tohum * 1664525 + 1013904223) >>> 0; return tohum / 4294967296; };
  for (let i = 0; i < say; i++) {
    const u = rs() * 2 - 1, a = rs() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    konum[i * 3] = s * Math.cos(a) * 40; konum[i * 3 + 1] = u * 40; konum[i * 3 + 2] = s * Math.sin(a) * 40;
    const p = rs();
    boy[i] = 1.0 + Math.pow(p, 9) * 3.4 + rs() * 0.9;
    faz[i] = rs();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(konum, 3));
  g.setAttribute('aBoy', new THREE.BufferAttribute(boy, 1));
  g.setAttribute('aFaz', new THREE.BufferAttribute(faz, 1));
  yildizlar = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: { uZaman: U.uZaman, uPO: { value: PO } },
    vertexShader: YILDIZ_VS, fragmentShader: YILDIZ_FS,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  yildizlar.frustumCulled = false;
  yildizlar.renderOrder = -2;
  sahne.add(yildizlar);
}

function dokuYukle(yol, ilerle) {
  return new Promise((coz, red) => new THREE.TextureLoader().load(yol, t => { ilerle(); coz(t); }, undefined, red));
}

async function sahneKur() {
  cizici = new THREE.WebGLRenderer({ canvas: tuval, antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!cizici.capabilities.isWebGL2) throw new Error('WebGL2 yok');
  const kucuk = darEkran() || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const kucukDoku = cizici.capabilities.maxTextureSize < 4096 || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  PO = Math.min(devicePixelRatio || 1, kucuk ? 1.75 : 2);
  cizici.setPixelRatio(PO);
  cizici.setSize(W, H, false);
  cizici.setClearColor(0x04060b, 1);
  cizici.toneMapping = THREE.ACESFilmicToneMapping;
  cizici.toneMappingExposure = 1.18;

  sahne = new THREE.Scene();
  kamera = new THREE.PerspectiveCamera(32, W / H, 0.01, 90);

  // yükleme
  let biten = 0;
  const adim = 5;
  const ilerle = () => { biten++; $('yukleme-dolgu').style.transform = `scaleX(${biten / adim})`; };
  const ek = kucukDoku ? '-k' : '';
  const [tBolge, tKure, tNehir, arazi] = await Promise.all([
    dokuYukle(`${DOKU}bolge${ek}.webp`, ilerle),
    dokuYukle(`${DOKU}kure.webp`, ilerle),
    dokuYukle(`${DOKU}nehir${ek}.webp`, ilerle),
    fetch(`${DOKU}arazi.json`).then(r => r.json()).then(j => { ilerle(); return j; }),
    Promise.all([document.fonts.load('600 96px Literata'), document.fonts.load('italic 400 96px Literata')]).catch(() => 0).then(ilerle)
  ]);
  for (const t of [tBolge, tKure, tNehir]) {
    t.colorSpace = THREE.NoColorSpace;
    t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
    t.anisotropy = Math.min(8, cizici.capabilities.getMaxAnisotropy());
    t.wrapT = THREE.ClampToEdgeWrapping;
  }
  tKure.wrapS = THREE.RepeatWrapping;
  tBolge.wrapS = tNehir.wrapS = THREE.ClampToEdgeWrapping;

  durakYerlestir(arazi.rakim);

  U = {
    uBolge: { value: tBolge }, uKure: { value: tKure }, uNehir: { value: tNehir },
    uNehirEn: { value: tNehir.image.width },
    uSinir: { value: new THREE.Vector4(BOLGE.bati * RAD, BOLGE.dogu * RAD, BOLGE.guney * RAD, BOLGE.kuzey * RAD) },
    uKab: { value: KAB }, uLod: { value: (kucuk ? 3.2 : 2.3) - (kucukDoku ? 1 : 0) },
    uDetay: { value: 0 }, uZaman: { value: 0 },
    uKandil: { value: DURAK.map(d => new THREE.Vector4(d.P.x, d.P.y, d.P.z, 0)) },
    uKandilK: { value: 1 },
    uCoz: { value: new THREE.Vector2(W * PO / 2, H * PO / 2) }
  };

  // yerküre + kabartmalı bölge yaması
  const fs = araziFS(DURAK.length);
  const kureMat = new THREE.ShaderMaterial({ uniforms: { ...U, uYama: { value: 0 } }, vertexShader: ARAZI_VS, fragmentShader: fs });
  const kure = new THREE.Mesh(new THREE.SphereGeometry(1, 288, 144), kureMat);
  kure.frustumCulled = false;
  sahne.add(kure);

  const sx = kucuk ? 460 : 860, sy = kucuk ? 258 : 482;
  const yamaGeo = new THREE.PlaneGeometry(1, 1, sx, sy);
  const pk = yamaGeo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pk.count; i++) {
    const lon = ara(BOLGE.bati, BOLGE.dogu, pk.getX(i) + 0.5), lat = ara(BOLGE.guney, BOLGE.kuzey, pk.getY(i) + 0.5);
    yon(lat, lon, v);
    pk.setXYZ(i, v.x, v.y, v.z);
  }
  yamaGeo.deleteAttribute('normal'); yamaGeo.deleteAttribute('uv');
  const yama = new THREE.Mesh(yamaGeo, new THREE.ShaderMaterial({ uniforms: { ...U, uYama: { value: 1 } }, vertexShader: ARAZI_VS, fragmentShader: fs, side: THREE.DoubleSide }));
  yama.frustumCulled = false;
  sahne.add(yama);

  // hava
  const hava = new THREE.Mesh(new THREE.SphereGeometry(1.032, 96, 48), new THREE.ShaderMaterial({
    uniforms: { uRa: { value: 1.032 }, uRenk: { value: new THREE.Color(0.16, 0.24, 0.46) } },
    vertexShader: HAVA_VS, fragmentShader: HAVA_FS,
    side: THREE.BackSide, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  hava.frustumCulled = false;
  hava.renderOrder = 1;
  sahne.add(hava);

  yildizKur();
  cografyaKur();

  // zincir
  const zGeo = seritGeometri(zincirParcalari());
  const zU = { uIler: { value: D.iler }, uHayalet: { value: 0 }, uZaman: U.uZaman, uCoz: U.uCoz };
  zincirHale = new THREE.Mesh(zGeo, new THREE.ShaderMaterial({
    uniforms: { ...zU, uKalin: { value: 6.5 * PO }, uGuc: { value: 0.085 } },
    vertexShader: SERIT_VS, fragmentShader: ZINCIR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  }));
  zincir = new THREE.Mesh(zGeo, new THREE.ShaderMaterial({
    uniforms: { ...zU, uKalin: { value: 1.35 * PO }, uGuc: { value: 1.0 } },
    vertexShader: SERIT_VS, fragmentShader: ZINCIR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  }));
  zincirHale.frustumCulled = zincir.frustumCulled = false;
  zincirHale.renderOrder = 4; zincir.renderOrder = 5;
  sahne.add(zincirHale, zincir);
  zincir.userData.u = zU;

  // kandiller
  const kg = new THREE.BufferGeometry();
  kg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DURAK.flatMap(d => [d.P.x, d.P.y, d.P.z])), 3));
  kg.setAttribute('aGuc', new THREE.BufferAttribute(new Float32Array(DURAK.length), 1));
  kandiller = new THREE.Points(kg, new THREE.ShaderMaterial({
    uniforms: { uBoy: { value: 30 * PO } },
    vertexShader: KANDIL_VS, fragmentShader: KANDIL_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  kandiller.frustumCulled = false;
  kandiller.renderOrder = 6;
  sahne.add(kandiller);

  // son işlem: ışıltı + kenar karartma + ince gren
  const hedef = new THREE.WebGLRenderTarget(W * PO, H * PO, { type: THREE.HalfFloatType, samples: kucuk ? 2 : 4 });
  bestec = new EffectComposer(cizici, hedef);
  bestec.setPixelRatio(PO);
  bestec.setSize(W, H);
  bestec.addPass(new RenderPass(sahne, kamera));
  isilti = new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.5, 0.92);
  bestec.addPass(isilti);
  sonGecis = new ShaderPass(SON_GECIS);
  bestec.addPass(sonGecis);
  bestec.addPass(new OutputPass());

  etiketKur();
  boyutla();
}

/* Belde etiketleri (HTML) */
function etiketKur() {
  const kap = $('etiketler');
  DURAK.forEach((d, k) => {
    const el = document.createElement('div');
    el.className = 'etiket';
    el.textContent = d.ad;
    const no = document.createElement('small');
    no.textContent = d.uyeler.map(i => HALKA[i].isaret).join(' · ');
    el.appendChild(no);
    el.addEventListener('click', () => {
      const sira = d.uyeler.indexOf(D.i);
      git(sira >= 0 ? d.uyeler[(sira + 1) % d.uyeler.length] : d.uyeler[0]);
    });
    kap.appendChild(el);
    etiketler.push({ el, d, k, en: 0, gorunur: false });
  });
}

function etiketGuncelle() {
  const etkinDurak = D.i >= 0 ? HALKA[D.i].durak : -1;
  const adaylar = [];
  for (const e of etiketler) {
    const d = e.d;
    const yandi = d.uyeler[0] <= D.iler + 0.02;
    let goster = (yandi || D.hayalet > 0.5) && D.kip !== 'giris';
    if (goster) {
      _g2.copy(kamera.position).sub(d.P);
      if (_g2.dot(d.yon) < 0.03 * _g2.length()) goster = false;
    }
    if (goster) {
      _g3.copy(d.P).project(kamera);
      const x = (_g3.x * 0.5 + 0.5) * W, y = (-_g3.y * 0.5 + 0.5) * H;
      const solSinir = D.kip === 'yolda' && !darEkran() ? Math.min(470, W * 0.37) + 70 : -40;
      const altSinir = darEkran() && D.kip === 'yolda' ? H * 0.54 - 60 : H - 96;
      if (_g3.z > 1 || x < solSinir || x > W + 40 || y < 70 || y > altSinir) goster = false;
      else {
        if (!e.en) e.en = e.el.offsetWidth || 120;
        const son = d.uyeler.filter(i => i <= D.iler + 0.02).pop() ?? -1;
        adaylar.push({ e, x, y, onem: e.k === etkinDurak ? 1e6 : son + (yandi ? 100 : 0) });
      }
    }
    if (!goster && e.gorunur) { e.gorunur = false; e.el.classList.remove('gorunur'); }
  }
  adaylar.sort((a, b) => b.onem - a.onem);
  const yerler = [];
  for (const a of adaylar) {
    const kutu = { x0: a.x, x1: a.x + a.e.en, y0: a.y - 11, y1: a.y + 11 };
    const cakisma = yerler.some(k => kutu.x0 < k.x1 && kutu.x1 > k.x0 && kutu.y0 < k.y1 && kutu.y1 > k.y0);
    const goster = !cakisma;
    if (goster) {
      yerler.push(kutu);
      a.e.el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) translateY(-50%)`;
    }
    if (goster !== a.e.gorunur) { a.e.gorunur = goster; a.e.el.classList.toggle('gorunur', goster); }
    a.e.el.classList.toggle('etkin', a.e.k === etkinDurak && D.kip === 'yolda');
  }
}

/* ════════════════════════════════════════════════════════════════
   6. Kamera
   ════════════════════════════════════════════════════════════════ */
function egimBul(uzak) {
  // Ufuk çizgisi görüntünün üst kenarının biraz altında kalacak eğimi bulur.
  const yarim = kamera.fov * RAD / 2, pay = 0.075;
  const f = e => {
    const C = Math.sqrt(1 + uzak * uzak + 2 * uzak * Math.cos(e));
    return Math.asin(kis((Math.cos(e) + uzak) / C, -1, 1)) - Math.acos(1 / C) - yarim + pay;
  };
  let a = 0.05, b = 1.22;
  if (f(b) > 0) return b;
  if (f(a) < 0) return a;
  for (let k = 0; k < 26; k++) { const m = (a + b) / 2; if (f(m) > 0) a = m; else b = m; }
  return (a + b) / 2;
}

function kareleriHesapla() {
  KARE = HALKA.map((h, i) => {
    const d = DURAK[h.durak];
    const once = i > 0 ? DURAK[HALKA[i - 1].durak].yon.angleTo(d.yon) : 0;
    const sonra = i < SON ? DURAK[HALKA[i + 1].durak].yon.angleTo(d.yon) : 0;
    let uzak = kis(1.15 * Math.max(once, 0.55 * sonra) + 0.04, 0.078, 0.78);
    if (i === 0) uzak = 0.46;
    return { yon: d.yon, r: 1 + yukseklik(d.rakim), uzak, egim: egimBul(uzak), bas: 0.2 * Math.sin(i * 2.3 + 0.7) };
  });
}
const kareGiris = () => ({ yon: yon(27, 50), r: 1, uzak: darEkran() ? 3.9 : 3.5, egim: 0, bas: 0 });
const kareButun = (kat = 1) => ({ yon: yon(33.2, 54.5), r: 1, uzak: kat * (kamera && kamera.aspect < 0.9 ? 2.25 : kamera && kamera.aspect < 1.45 ? 1.5 : 1.13), egim: 0.36, bas: 0 });

function kameraKur(t) {
  const S = D.S, K = D.kul;
  let bas = S.bas + K.bas, egim = kis(S.egim + K.egim, 0, 1.2), uzak = S.uzak * K.uzak;
  if (!azHareket) {
    bas += 0.03 * Math.sin(t * 0.13);
    uzak *= 1 + 0.012 * Math.sin(t * 0.1);
  }
  const up = S.yon, e = doguYon(up, _g2), n = _g3.crossVectors(up, e).normalize();
  const ileri = _g4.copy(n).multiplyScalar(Math.cos(bas)).addScaledVector(e, Math.sin(bas));
  const T = _g1.copy(up).multiplyScalar(S.r);
  kamera.position.copy(up).multiplyScalar(Math.cos(egim)).addScaledVector(ileri, -Math.sin(egim)).multiplyScalar(uzak).add(T);
  kamera.up.copy(ileri).addScaledVector(up, 0.5).normalize();
  kamera.lookAt(T);

  const irtifa = Math.max(0.01, kamera.position.length() - 1);
  kamera.near = Math.max(0.0015, irtifa * 0.12);
  kamera.far = 90;

  // levhaya yer açmak için görüntü merkezini kaydır
  const dar = darEkran();
  let hx = 0, hy = 0;
  if (D.kip === 'giris') { hx = dar ? 0 : W * 0.25; hy = dar ? H * 0.16 : 0; }
  else if (D.kip === 'yolda') { hx = dar ? -W * 0.14 : Math.min(470, W * 0.37) * 0.5 + 24; hy = dar ? H * 0.2 : -H * 0.03; }
  else if (D.kip === 'bitti') { hx = dar ? 0 : W * 0.17; hy = dar ? H * 0.16 : 0; }
  else { hy = dar ? H * 0.02 : H * 0.02; }
  const hiz = D.hazir ? 1 - Math.exp(-0.016 * 2.4) : 1;
  D.ofs.x += (hx - D.ofs.x) * hiz; D.ofs.y += (hy - D.ofs.y) * hiz;
  kamera.setViewOffset(W, H, -D.ofs.x, D.ofs.y, W, H);
}

function ucusBaslat(B, ilerB, sure, bitince) {
  const S = D.S;
  D.ucus = {
    t0: performance.now() / 1000, sure: azHareket ? 0.05 : sure,
    A: { yon: S.yon.clone(), r: S.r, uzak: S.uzak, egim: S.egim, bas: S.bas },
    B, ilerA: D.iler, ilerB, kulA: { ...D.kul },
    aci: S.yon.angleTo(B.yon), bitince
  };
}

function ucusIlerlet(t) {
  const u = D.ucus;
  if (!u) return;
  const ham = kis((t - u.t0) / u.sure, 0, 1), e = kolayla(ham);
  const S = D.S;
  kureAra(u.A.yon, u.B.yon, e, S.yon);
  S.r = ara(u.A.r, u.B.r, e);
  const tumsek = Math.sin(Math.PI * e);
  S.uzak = ara(u.A.uzak, u.B.uzak, e) + Math.min(0.9, 0.46 * u.aci) * tumsek;
  S.egim = ara(u.A.egim, u.B.egim, e) - 0.1 * tumsek * Math.min(1, u.aci * 4);
  S.bas = ara(u.A.bas, u.B.bas, e);
  D.kul.bas = u.kulA.bas * (1 - e); D.kul.egim = u.kulA.egim * (1 - e); D.kul.uzak = ara(u.kulA.uzak, 1, e);
  D.iler = ara(u.ilerA, u.ilerB, e);
  if (ham >= 1) {
    D.ucus = null;
    if (u.bitince) u.bitince();
  }
}

/* ════════════════════════════════════════════════════════════════
   7. Gezinme
   ════════════════════════════════════════════════════════════════ */
let levhaZaman = 0;
function kipKur(kip) {
  D.kip = kip;
  govde.classList.toggle('giris-acik', kip === 'giris');
  govde.classList.toggle('yolda', kip === 'yolda');
  govde.classList.toggle('butun', kip === 'butun');
  govde.classList.toggle('bitti', kip === 'bitti');
  $('bitis').hidden = kip !== 'bitti';
  $('dg-butun').setAttribute('aria-pressed', kip === 'butun' ? 'true' : 'false');
}

function git(i, sec = {}) {
  if (!D.hazir) return;
  i = kis(i, 0, SON);
  const onceki = D.i, oncekiKip = D.kip;
  if (i === onceki && oncekiKip === 'yolda' && !sec.zorla) return;
  kipKur('yolda');
  D.i = i;
  const komsu = oncekiKip === 'yolda' && Math.abs(i - onceki) === 1;
  const B = KARE[i] || { yon: DURAK[HALKA[i].durak].yon, r: 1, uzak: 0.3, egim: 0.7, bas: 0 };
  const aci = D.S.yon.angleTo(B.yon);
  let sure = komsu ? kis(2.3 + aci * 7.5, 2.4, 6.2) : kis(2.0 + aci * 2.6, 2.2, 4.2);
  if (oncekiKip === 'giris') sure = 5.2;
  const durak = HALKA[i].durak;
  ucusBaslat(B, i, sure, () => { D.parla[durak] = 1; D.oynatSure = 0; });

  // levha
  clearTimeout(levhaZaman);
  const ilk = oncekiKip !== 'yolda';
  if (ilk || azHareket) { levhaDoldur(i); levha.classList.remove('gecis'); }
  else {
    levha.classList.add('gecis');
    levhaZaman = setTimeout(() => {
      levhaDoldur(i);
      levhaZaman = setTimeout(() => levha.classList.remove('gecis'), Math.max(120, D.ucus ? D.ucus.sure * 520 - 330 : 120));
    }, 330);
  }
  seritIsaretle();
  try { history.replaceState(null, '', '#' + HALKA[i].no); } catch (e) { /* yoksay */ }
  D.oynatSure = 0;
  if (!sec.sessiz && document.activeElement === document.body) { /* odak yerinde kalsın */ }
}

function basla() {
  if (!D.hazir) return;
  D.iler = -0.3;
  git(0, { zorla: true });
}
function sonraki() {
  if (D.kip === 'giris') return basla();
  if (D.kip === 'bitti') return;
  if (D.kip === 'butun') return git(Math.max(0, D.i), { zorla: true });
  if (D.i < SON) git(D.i + 1); else bitir();
}
function onceki() {
  if (D.kip === 'bitti' || D.kip === 'butun') return git(Math.max(0, D.i), { zorla: true });
  if (D.kip === 'yolda' && D.i > 0) git(D.i - 1);
}
function butunAcKapa() {
  if (!D.hazir) return;
  if (D.kip === 'butun') return git(Math.max(0, D.i), { zorla: true });
  oynatDur();
  kipKur('butun');
  ucusBaslat(kareButun(), D.iler, 3.2);
  seritIsaretle();
}
function bitir() {
  oynatDur();
  kipKur('bitti');
  D.i = SON;
  $('bitis-alt').textContent = `Peygamber Efendimiz (sallallahü aleyhi ve sellem)’den gelen feyzi asırlar boyunca taşıyan büyüklerin kabr-i şerîfleri: Medîne-i münevvereden İstanbul’a ${DURAK.length} belde.`;
  ucusBaslat(kareButun(darEkran() ? 1 : 1.24), SON, 4.6);
  seritIsaretle();
  try { history.replaceState(null, '', location.pathname); } catch (e) { /* yoksay */ }
}
function bastan() {
  kipKur('yolda');
  D.iler = -0.3;
  D.i = -1;
  git(0, { zorla: true });
}

function oynatBasla() {
  D.oynat = true; D.oynatSure = 0;
  $('dg-oynat').setAttribute('aria-pressed', 'true');
  if (D.kip !== 'yolda') sonraki();
}
function oynatDur() {
  D.oynat = false;
  const b = $('dg-oynat');
  b.setAttribute('aria-pressed', 'false');
  b.style.setProperty('--sure', 0);
}

/* ════════════════════════════════════════════════════════════════
   8. Döngü
   ════════════════════════════════════════════════════════════════ */
let sonT = 0, kareSay = 0, kareToplam = 0, basamak = 0;
function dongu(simdi) {
  requestAnimationFrame(dongu);
  if (document.hidden) return;
  const t = simdi / 1000, dt = Math.min(0.05, Math.max(0.001, t - sonT));
  sonT = t;

  ucusIlerlet(t);

  if (D.kip === 'giris' && !D.ucus && !azHareket) {
    yon(27 + 2.5 * Math.sin(t * 0.045), 50 + 7 * Math.sin(t * 0.031), D.S.yon);
  }

  // otomatik yolculuk
  if (D.oynat && D.kip === 'yolda' && !D.ucus) {
    D.oynatSure += dt;
    $('dg-oynat').style.setProperty('--sure', kis(D.oynatSure / OYNAT_BEKLE, 0, 1).toFixed(3));
    if (D.oynatSure >= OYNAT_BEKLE) { D.oynatSure = 0; sonraki(); }
  }

  const hayaletHedef = D.kip === 'butun' ? 1 : 0;
  D.hayalet += (hayaletHedef - D.hayalet) * (1 - Math.exp(-dt * 3));

  seritGuncelle();
  if (!cizici || !bestec) return;

  kameraKur(t);

  // uniform'lar
  U.uZaman.value = t;
  const irtifa = kamera.position.length() - 1;
  U.uDetay.value = yumusak(0.9, 0.1, irtifa);
  const isikR = kis(irtifa * 0.07, 0.0024, 0.03);
  U.uKandilK.value = 1 / (isikR * isikR);
  const etkinDurak = D.i >= 0 && D.kip === 'yolda' ? HALKA[D.i].durak : -1;
  const guc = kandiller.geometry.attributes.aGuc;
  for (let k = 0; k < DURAK.length; k++) {
    const d = DURAK[k];
    let yan = 0;
    for (const m of d.uyeler) yan = Math.max(yan, kis((D.iler - (m - 0.07)) / 0.07, 0, 1));
    D.parla[k] *= Math.exp(-dt * 1.6);
    let g = yan * (0.82 + (k === etkinDurak ? 0.22 + 0.1 * Math.sin(t * 1.7) : 0)) + D.parla[k] * 0.9;
    g = Math.max(g, D.hayalet * 0.34);
    guc.array[k] = g;
    U.uKandil.value[k].w = g * (k === etkinDurak ? 1.0 : 0.72);
  }
  guc.needsUpdate = true;
  zincir.userData.u.uIler.value = D.iler;
  zincir.userData.u.uHayalet.value = D.hayalet;
  kandiller.material.uniforms.uBoy.value = PO * kis(18 + 22 * irtifa, 20, 30);

  for (const ag of cografya) {
    const tur = ag.userData.tur;
    let o;
    if (tur === 'diyar') o = yumusak(0.13, 0.3, irtifa) * (1 - yumusak(1.7, 2.7, irtifa)) * 0.26;
    else if (tur === 'deniz') o = yumusak(0.08, 0.2, irtifa) * (1 - yumusak(1.5, 2.3, irtifa)) * 0.42;
    else o = yumusak(0.02, 0.05, irtifa) * (1 - yumusak(0.42, 0.75, irtifa)) * 0.5;
    if (D.kip === 'giris') o *= 0.0;
    ag.material.uniforms.uOpak.value += (o - ag.material.uniforms.uOpak.value) * (1 - Math.exp(-dt * 4));
    ag.visible = ag.material.uniforms.uOpak.value > 0.004;
  }

  etiketGuncelle();

  sonGecis.uniforms.uZaman.value = t;
  bestec.render();

  // başarım: yavaş cihazda önce çözünürlüğü, sonra ışıltıyı kıs
  if (D.hazir && basamak < 2) {
    kareSay++; kareToplam += dt;
    if (kareSay === 80) {
      const ort = kareToplam / kareSay;
      if (ort > 0.034) {
        basamak++;
        if (basamak === 1) { PO = Math.max(1, PO * 0.72); boyutla(); }
        else isilti.enabled = false;
      } else if (ort < 0.024) basamak = 3;
      kareSay = 0; kareToplam = 0;
    }
  }
}

function boyutla() {
  W = innerWidth; H = innerHeight;
  if (!cizici) return;
  cizici.setPixelRatio(PO);
  cizici.setSize(W, H, false);
  kamera.aspect = W / H;
  kamera.fov = ara(46, 32, yumusak(0.65, 1.25, kamera.aspect));
  kamera.updateProjectionMatrix();
  bestec.setPixelRatio(PO);
  bestec.setSize(W, H);
  U.uCoz.value.set(W * PO / 2, H * PO / 2);
  sonGecis.uniforms.uCoz.value.set(W * PO, H * PO);
  zincirHale.material.uniforms.uKalin.value = 6.5 * PO;
  zincir.material.uniforms.uKalin.value = 1.35 * PO;
  yildizlar.material.uniforms.uPO.value = PO;
  kareleriHesapla();
  for (const e of etiketler) e.en = 0;
  if (!D.ucus) {
    if (D.kip === 'yolda' && D.i >= 0) Object.assign(D.S, { ...KARE[D.i], yon: D.S.yon });
    else if (D.kip === 'giris') Object.assign(D.S, kareGiris());
    else Object.assign(D.S, kareButun());
  }
}

/* ════════════════════════════════════════════════════════════════
   9. Olaylar
   ════════════════════════════════════════════════════════════════ */
$('dg-basla').addEventListener('click', basla);
$('dg-giris-dizin').addEventListener('click', dizinAc);
$('dg-dizin').addEventListener('click', dizinAc);
$('dg-dizin-kapat').addEventListener('click', dizinKapat);
dizin.addEventListener('click', e => { if (e.target === dizin) dizinKapat(); });
$('dg-hakkinda').addEventListener('click', hakkindaAc);
$('dg-giris-hakkinda').addEventListener('click', hakkindaAc);
$('dg-hakkinda-kapat').addEventListener('click', hakkindaKapat);
hakkinda.addEventListener('click', e => { if (e.target === hakkinda) hakkindaKapat(); });
$('dg-butun').addEventListener('click', butunAcKapa);
$('dg-oynat').addEventListener('click', () => (D.oynat ? oynatDur() : oynatBasla()));
$('dg-once').addEventListener('click', onceki);
$('dg-sonra').addEventListener('click', sonraki);
$('dg-bastan').addEventListener('click', bastan);
$('dg-levha-ac').addEventListener('click', () => {
  const acik = levha.classList.toggle('acik');
  govde.classList.toggle('levha-acik', acik);
  $('dg-levha-ac').setAttribute('aria-expanded', acik ? 'true' : 'false');
});
$('levha-kaydir').addEventListener('scroll', () => { D.oynatSure = Math.min(D.oynatSure, OYNAT_BEKLE * 0.4); }, { passive: true });

addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (!dizin.hidden || !hakkinda.hidden) {
    if (e.key === 'Escape') { e.preventDefault(); if (!dizin.hidden) dizinKapat(); else hakkindaKapat(); }
    return;
  }
  const hedef = e.target;
  const dugmede = hedef && (hedef.tagName === 'BUTTON' || hedef.tagName === 'A');
  switch (e.key) {
    case 'ArrowRight': case 'PageDown': e.preventDefault(); sonraki(); break;
    case 'ArrowLeft': case 'PageUp': e.preventDefault(); onceki(); break;
    case ' ': if (!dugmede) { e.preventDefault(); sonraki(); } break;
    case 'Enter': if (!dugmede && D.kip === 'giris') { e.preventDefault(); basla(); } break;
    case 'Home': if (D.kip !== 'giris') { e.preventDefault(); git(0); } break;
    case 'End': if (D.kip !== 'giris') { e.preventDefault(); git(SON); } break;
    case 'Escape': if (D.kip === 'butun') butunAcKapa(); else oynatDur(); break;
  }
});

/* Sürükleyerek bakış, tekerlek / iki parmakla yaklaşma, dokunarak belde seçme */
const parmak = new Map();
let surukle = null, cimdik = 0;
tuval.addEventListener('pointerdown', e => {
  tuval.setPointerCapture(e.pointerId);
  parmak.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (parmak.size === 1) surukle = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, oynadi: false };
  else if (parmak.size === 2) { const [a, b] = [...parmak.values()]; cimdik = Math.hypot(a.x - b.x, a.y - b.y); surukle = null; }
});
tuval.addEventListener('pointermove', e => {
  if (!parmak.has(e.pointerId)) return;
  parmak.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (D.kip === 'giris') return;
  if (parmak.size === 2) {
    const [a, b] = [...parmak.values()];
    const m = Math.hypot(a.x - b.x, a.y - b.y);
    if (cimdik > 0) D.kul.uzak = kis(D.kul.uzak * cimdik / m, 0.5, 3.4);
    cimdik = m;
    D.oynatSure = 0;
    return;
  }
  if (!surukle) return;
  const dx = e.clientX - surukle.x, dy = e.clientY - surukle.y;
  surukle.x = e.clientX; surukle.y = e.clientY;
  if (Math.hypot(e.clientX - surukle.x0, e.clientY - surukle.y0) > 5) surukle.oynadi = true;
  if (surukle.oynadi && !D.ucus) {
    D.kul.bas = kis(D.kul.bas + dx * 0.0042, -2.6, 2.6);
    D.kul.egim = kis(D.kul.egim + dy * 0.0034, -0.8, 0.55);
    D.oynatSure = 0;
  }
});
const birak = e => {
  parmak.delete(e.pointerId);
  if (parmak.size < 2) cimdik = 0;
  if (surukle && !surukle.oynadi && e.type === 'pointerup') beldeSec(e.clientX, e.clientY);
  if (parmak.size === 0) surukle = null;
};
tuval.addEventListener('pointerup', birak);
tuval.addEventListener('pointercancel', birak);
tuval.addEventListener('wheel', e => {
  e.preventDefault();
  if (D.kip === 'giris') return;
  D.kul.uzak = kis(D.kul.uzak * Math.exp(e.deltaY * 0.0011), 0.5, 3.4);
  D.oynatSure = 0;
}, { passive: false });

function beldeSec(x, y) {
  if (!kamera || D.kip === 'giris') return;
  let en = null, enUzak = 26;
  for (const d of DURAK) {
    if (!(d.uyeler[0] <= D.iler + 0.02 || D.hayalet > 0.5)) continue;
    _g2.copy(kamera.position).sub(d.P);
    if (_g2.dot(d.yon) < 0) continue;
    _g3.copy(d.P).project(kamera);
    const u = Math.hypot((_g3.x * 0.5 + 0.5) * W - x, (-_g3.y * 0.5 + 0.5) * H - y);
    if (u < enUzak) { enUzak = u; en = d; }
  }
  if (en) {
    const sira = en.uyeler.indexOf(D.i);
    git(sira >= 0 && D.kip === 'yolda' ? en.uyeler[(sira + 1) % en.uyeler.length] : en.uyeler[0]);
  }
}

let boyutZaman = 0;
addEventListener('resize', () => { clearTimeout(boyutZaman); boyutZaman = setTimeout(boyutla, 80); });
addEventListener('hashchange', () => {
  const m = location.hash.match(/^#(\d{1,2})$/);
  if (m && D.hazir) git(+m[1] - 1);
});

/* ════════════════════════════════════════════════════════════════
   10. Başlat
   ════════════════════════════════════════════════════════════════ */
function hazir() {
  D.hazir = true;
  govde.classList.remove('yukleniyor');
  $('dg-basla').disabled = false;
  const m = location.hash.match(/^#(\d{1,2})$/);
  if (m && +m[1] >= 1 && +m[1] <= HALKA.length) {
    D.iler = +m[1] - 1.3;
    git(+m[1] - 1, { zorla: true });
  }
}

$('dg-basla').disabled = true;
seritGuncelle();
requestAnimationFrame(dongu);

sahneKur().then(() => {
  Object.assign(D.S, kareGiris());
  hazir();
}).catch(hata => {
  console.warn('Silsile Atlası: 3B sahne açılamadı, düz görünüme geçildi.', hata);
  cizici = null;
  govde.classList.add('duz');
  $('yukleme-yazi').textContent = '';
  hazir();
});

// SEO: JSON-LD kişi listesi
try {
  const kisiler = SILSILE.map(s => {
    const p = { '@type': 'Person', name: s.tam_ad, alternateName: s.ad, description: s.lakap || '' };
    if (bilinir(s.dogum) && !/~/.test(s.dogum) && yilSayi(s.dogum)) p.birthDate = String(yilSayi(s.dogum));
    if (bilinir(s.vefat) && !/~/.test(s.vefat) && yilSayi(s.vefat)) p.deathDate = String(yilSayi(s.vefat));
    return p;
  });
  const sema = document.createElement('script');
  sema.type = 'application/ld+json';
  sema.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Silsile-i Aliyye',
    description: "Se'âdet-i Ebediyye'deki Silsile-i aliyye büyüklerinin kabr-i şerîflerinin bulunduğu yerler",
    numberOfItems: kisiler.length,
    itemListElement: kisiler.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: p }))
  });
  document.head.appendChild(sema);
} catch (e) { /* yoksay */ }

// Hata ayıklama ve denetim için
window.__atlas = { D, git, HALKA, DURAK };
