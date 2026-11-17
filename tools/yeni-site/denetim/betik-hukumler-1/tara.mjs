// Fıkhî hükümler (farz, vâcib, sünnet, müstehab) — 1. adım: betikle tarama.
// Çalıştır: node tara.mjs  (depo kökünden bağımsız; yollar mutlak)
import fs from 'fs';
import path from 'path';
const KOK = '/Users/raufenc/Documents/Claude 2/ilmihal-site';
const { duzle, duzleEslemeli } = await import(path.join(KOK, 'js/cekirdek/metin.js'));
const OUT = path.join(KOK, 'tools/yeni-site/denetim/betik-hukumler-1');

const fihrist = JSON.parse(fs.readFileSync(path.join(KOK, 'veri/fihrist.json'), 'utf8'));
const maddeler = {};
for (const f of fs.readdirSync(path.join(KOK, 'veri/madde'))) {
  if (!f.endsWith('.json')) continue;
  const m = JSON.parse(fs.readFileSync(path.join(KOK, 'veri/madde', f), 'utf8'));
  const e = duzleEslemeli(m.metin);
  maddeler[m.madde] = { metin: m.metin, duz: e.duz, konum: e.konum, sahife: m.sahife, baslik: m.baslik };
}
const maddeIds = Object.keys(maddeler);

const TURLER = ['farz', 'vacib', 'sunnet', 'mustehab'];
const KATMAN = ['acik', 'tum'];
const kelimeRe = {
  farz: /(^|[ -])fa?rz/,            // farz, farzdır, farz-ı, farzları
  vacib: /(^|[ -])(vacib|vacip|vucub)/,
  sunnet: /(^|[ -])sunnet/,
  mustehab: /(^|[ -])(mustehab|mustehap|mustahab|mendub|edeb|adab|mustahsen)/,
};
const hukumSinifRe = {
  farz: /(^|[ -])farz/, vacib: /(^|[ -])(vacib|vacip)/, sunnet: /(^|[ -])sunnet/,
  mustehab: /(^|[ -])(mustehab|mendub)/, mubah: /(^|[ -])mubah/, mekruh: /(^|[ -])mekruh/,
  haram: /(^|[ -])haram/, caiz: /(^|[ -])caiz/,
};
const olumsuzRe = [
  ['degil', /(^|[ -])degil/], ['olmaz', /(^|[ -])olmaz/], ['denildi', /(^|[ -])denil(di|mis)/],
  ['diyen', /(^|[ -])diyen/], ['gore', /(^|[ -])gore( |$)/], ['safii', /(^|[ -])safii/],
  ['maliki', /(^|[ -])maliki/], ['hanbeli', /(^|[ -])hanbeli/], ['imameyn', /(^|[ -])imameyn/],
  ['kavl', /(^|[ -])(bir )?kavl/], ['bazi', /(^|[ -])bazi (alim|ulema|fikih|kitap)|bazilari|bazi alimler/],
  ['ehl-i sunnet', /ehl-i sunnet|ehli sunnet/], ['farz edelim', /farz ed(elim|ersek|ilirse|ilse)|farz edil(ir|en|irse)? ise/],
  ['ise', / ise( |$)/], ['icin degil', /icin degil/], ['lazim degil', /lazim degil/],
];

function cumleBas(metin, i) {           // i'den geriye cümle başı
  let j = i;
  while (j > 0) { const c = metin[j - 1]; if ('.!?\n'.includes(c)) break; j--; }
  return j;
}
function cumleSon(metin, i) {
  let j = i;
  while (j < metin.length) { const c = metin[j]; if ('.!?\n'.includes(c)) { j++; break; } j++; }
  return j;
}
function bul(duzMetin) {
  const sonuc = [];
  for (const id of maddeIds) {
    const m = maddeler[id];
    let k = m.duz.indexOf(duzMetin);
    while (k >= 0) { sonuc.push([id, k]); k = m.duz.indexOf(duzMetin, k + 1); }
  }
  return sonuc;
}
function sahifeAraligi(id) { return maddeler[id]?.sahife; }

const kayitlar = [];
for (const tur of TURLER) for (const katman of KATMAN) {
  const d = JSON.parse(fs.readFileSync(path.join(KOK, `veri/hukumler/${tur}-${katman}.json`), 'utf8'));
  for (const h of d.hukumler) kayitlar.push({ ...h, tur, katman });
}

const anahtarSay = {};
for (const r of kayitlar) {
  const k = r.tur + '|' + r.katman + '|' + duzle(r.metin);
  anahtarSay[k] = (anahtarSay[k] || 0) + 1;
}

const sonuc = [];
for (const r of kayitlar) {
  const dz = duzle(r.metin);
  const o = { id: r.id, tur: r.tur, katman: r.katman, madde: r.madde, sahife: r.sahife, sahifeBitis: r.sahifeBitis,
    altTur: r.altTur, metin: r.metin, baglam: r.baglam, bayrak: [] };
  // (a) bulunma
  let yer = null, durum = 'yok';
  const mm = r.madde && maddeler[r.madde];
  if (mm && mm.duz.indexOf(dz) >= 0) { yer = [r.madde, mm.duz.indexOf(dz)]; durum = 'madde'; }
  else {
    const b = bul(dz);
    if (b.length) { yer = b[0]; durum = 'baska'; o.bulunanMaddeler = [...new Set(b.map(x => x[0]))]; }
    else {
      // kısmî: baştan ve sondan 40 harf
      const bas = dz.slice(0, 50), son = dz.slice(-50);
      const bb = dz.length > 60 ? bul(bas) : [], bs = dz.length > 60 ? bul(son) : [];
      if (bb.length || bs.length) { durum = 'kismi'; yer = (bb[0] || bs[0]); o.kismi = { bas: bb.length > 0, son: bs.length > 0, madde: (bb[0] || bs[0])[0] }; }
    }
  }
  o.bulunma = durum;
  if (durum === 'baska') o.bayrak.push('baska-maddede');
  if (durum === 'yok') o.bayrak.push('kitapta-yok');
  if (durum === 'kismi') o.bayrak.push('kismen-bulundu');
  // bağlam (asıl metinden)
  if (yer) {
    const m = maddeler[yer[0]];
    const sBas = m.konum[yer[1]];
    const eDuz = Math.min(yer[1] + dz.length, m.konum.length) - 1;
    const sSon = durum === 'kismi' ? Math.min(m.metin.length, sBas + r.metin.length) : m.konum[eDuz] + 1;
    const oncBas = cumleBas(m.metin, cumleBas(m.metin, sBas) - 1 > 0 ? cumleBas(m.metin, sBas) - 1 : 0);
    const cB = cumleBas(m.metin, sBas);
    const cS = cumleSon(m.metin, sSon - 1);
    const sonr = cumleSon(m.metin, cS);
    o.kitapAsil = m.metin.slice(sBas, sSon);
    o.kitapOnce = m.metin.slice(Math.max(oncBas, sBas - 400), sBas);
    o.kitapSonra = m.metin.slice(sSon, Math.min(sonr, sSon + 300));
    o.kitapMadde = yer[0];
    // (f) kesik: kitapta cümle ortasında başlıyor / bitiyor
    const onceki = m.metin.slice(Math.max(0, sBas - 3), sBas).replace(/[\s"“«(]+$/, '');
    if (cB < sBas && m.metin.slice(cB, sBas).trim().length > 0) o.bayrak.push('kitapta-cumle-ortasinda-basliyor');
    const sonKar = m.metin.slice(sSon - 1, sSon);
    if (!/[.!?:)\]»”"]/.test(sonKar) && cS > sSon && m.metin.slice(sSon, cS).trim().length > 1) o.bayrak.push('kitapta-cumle-ortasinda-bitiyor');
  }
  // (b) sahîfe
  const madSah = r.madde && sahifeAraligi(r.madde);
  if (madSah && r.sahife != null && (r.sahife < madSah[0] || r.sahife > madSah[1])) o.bayrak.push('sahife-madde-araligi-disinda');
  if (o.kitapMadde && o.kitapMadde !== r.madde) {
    const ks = sahifeAraligi(o.kitapMadde);
    if (ks && r.sahife != null && (r.sahife < ks[0] || r.sahife > ks[1])) o.bayrak.push('sahife-bulunan-madde-disinda');
  }
  // (c) tür kelimesi
  if (!kelimeRe[r.tur].test(dz)) o.bayrak.push('tur-kelimesi-yok');
  // (d) çok hüküm
  const siniflar = Object.keys(hukumSinifRe).filter(k => hukumSinifRe[k].test(dz));
  o.hukumKelimeleri = siniflar;
  if (siniflar.filter(k => k !== 'caiz').length >= 2) o.bayrak.push('cok-hukum-kelimesi');
  // (e) olumsuzluk / sınırlama
  const ol = olumsuzRe.filter(([, re]) => re.test(dz)).map(([a]) => a);
  if (ol.length) { o.isaretler = ol; o.bayrak.push('olumsuz/sinir:' + ol.join(',')); }
  if (r.tur === 'sunnet' && /ehl-i sunnet|ehli sunnet/.test(dz) && !/(^|[ -])sunnet(dir|tir|i|leri|ler|e|de)?( |$)/.test(dz.replace(/ehl-i sunnet\w*|ehli sunnet\w*/g, ''))) o.bayrak.push('yalniz-ehl-i-sunnet');
  // (f) biçim: kayıt başı küçük harf, sonu noktalamasız
  const ilk = r.metin.trim().replace(/^[\s"“«(\-–—*•\d.)]+/, '')[0] || '';
  if (ilk && ilk === ilk.toLocaleLowerCase('tr') && ilk !== ilk.toLocaleUpperCase('tr')) o.bayrak.push('kayit-kucuk-harfle-basliyor');
  if (!/[.!?:)\]»”"…]\s*$/.test(r.metin.trim())) o.bayrak.push('kayit-noktalamasiz-bitiyor');
  if (anahtarSay[r.tur + '|' + r.katman + '|' + dz] > 1) o.bayrak.push('yinelenen');
  sonuc.push(o);
}

// katmanlar arası: acik kaydı tum'da var mı (bilgi)
const tumSet = new Set(sonuc.filter(x => x.katman === 'tum').map(x => x.tur + '|' + duzle(x.metin)));
for (const o of sonuc) if (o.katman === 'acik') o.tumdaVar = tumSet.has(o.tur + '|' + duzle(o.metin));

fs.writeFileSync(path.join(OUT, 'tarama.json'), JSON.stringify(sonuc, null, 1));
// özet
const say = {};
for (const o of sonuc) {
  const k = o.tur + '-' + o.katman;
  say[k] ??= { toplam: 0 };
  say[k].toplam++;
  for (const b of o.bayrak) { const bb = b.split(':')[0]; say[k][bb] = (say[k][bb] || 0) + 1; }
  say[k]['bulunma=' + o.bulunma] = (say[k]['bulunma=' + o.bulunma] || 0) + 1;
}
fs.writeFileSync(path.join(OUT, 'tarama-ozet.json'), JSON.stringify(say, null, 1));
console.log(JSON.stringify(say, null, 1));
