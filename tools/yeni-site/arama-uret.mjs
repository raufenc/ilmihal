#!/usr/bin/env node
/* Arama dizinini üretir: node tools/yeni-site/arama-uret.mjs
   - Kaynak dosyaları (texts/kisim1-3.json, data.js, sozluk-data.js, sahislar.js, hukumler-data.js,
     tanimlar.js, arama-sozluk.js) yalnız OKUR; hiçbirini değiştirmez.
   - veri-arama/ klasörünü baştan yazar (yalnız bu klasöre dokunur). Çıktı deterministiktir:
     aynı kaynaktan her seferinde bayt bayt aynı dosyalar çıkar (tarih/saat yazılmaz).
   Tasarım ve dosya biçimleri: tools/yeni-site/ARAMA.md */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { duzle, duzleEslemeli, asilAralik } from '../../js/cekirdek/metin.js';
import { yayinDisiUygula } from './yayin-disi.mjs';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CIKTI = path.join(KOK, 'veri-arama');
const PARCA_HEDEF = 560 * 1024;          // madde parçası başına hedef ham boyut (≈180 KB gzip)

function oku(ad) { return fs.readFileSync(path.join(KOK, ad), 'utf8'); }

/** Eski sitenin küresel değişkenli .js veri dosyalarını yalıtılmış bağlamda çalıştırıp değişkenleri alır. */
function jsVeri(ad, adlar) {
  const bag = { window: {} };
  bag.window = bag;
  vm.createContext(bag);
  const ek = adlar.map(a => `try { window.${a} = (typeof ${a} !== 'undefined') ? ${a} : window.${a}; } catch (e) {}`).join('\n');
  vm.runInContext(oku(ad) + '\n' + ek, bag, { filename: ad });
  const sonuc = {};
  for (const a of adlar) {
    if (bag[a] === undefined) throw new Error(`${ad} içinde ${a} bulunamadı`);
    sonuc[a] = JSON.parse(JSON.stringify(bag[a]));
  }
  return sonuc;
}

const ozet = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const gz = s => zlib.gzipSync(Buffer.from(s), { level: 9 }).length;

// ---------------------------------------------------------------- kaynaklar

const { tocData, tablolarData: tablolarHam } = jsVeri('data.js', ['tocData', 'tablolarData']);
const { sozlukData: sozlukHam } = jsVeri('sozluk-data.js', ['sozlukData']);
const { sahislarData } = jsVeri('sahislar.js', ['sahislarData']);
const { hukumlerData } = jsVeri('hukumler-data.js', ['hukumlerData']);
const { tanimlarData } = jsVeri('tanimlar.js', ['tanimlarData']);
const { aramaSynonyms, soruMaddeMap: soruMaddeHam } = jsVeri('arama-sozluk.js', ['aramaSynonyms', 'soruMaddeMap']);
// Denetimde yayından çekilen kayıtlar aramaya da girmez (tools/yeni-site/yayin-disi.mjs)
const suzulmus = { tablolar: tablolarHam, sozluk: sozlukHam, soruMadde: soruMaddeHam };
yayinDisiUygula(suzulmus);
const tablolarData = suzulmus.tablolar, sozlukData = suzulmus.sozluk, soruMaddeMap = suzulmus.soruMadde;
const metinler = {};
for (const k of [1, 2, 3]) metinler[k] = JSON.parse(oku(`texts/kisim${k}.json`));

const maddeler = tocData.map(m => {
  const metin = metinler[m.kisim][String(m.madde_no)];
  if (typeof metin !== 'string') throw new Error(`Metin yok: ${m.kisim}/${m.madde_no}`);
  return { k: m.kisim, m: m.madde_no, baslik: m.baslik, s: m.sayfa_no, sb: m.sayfa_bitis, metin };
});
const ortalama = Math.round(maddeler.reduce((t, m) => t + m.metin.length, 0) / maddeler.length);

// ---------------------------------------------------------------- parçalar

const dosyalar = new Map();   // ad → içerik (dizgi)
function yaz(ad, nesne) { const s = JSON.stringify(nesne); dosyalar.set(ad, s); return s; }
function parcaKaydi(ad, tur, kayitSayisi, icerik, ek = {}) {
  return { ad, tur, sayi: kayitSayisi, bayt: Buffer.byteLength(icerik), ozet: ozet(icerik), ...ek };
}

/** Diziyi sırasını bozmadan yaklaşık eşit boyutlu (ham bayt) gruplara böler. */
function bol(dizi, boyutu, hedef) {
  const toplam = dizi.reduce((t, x) => t + boyutu(x), 0);
  const adet = Math.max(1, Math.round(toplam / hedef));
  const pay = toplam / adet;
  const gruplar = [[]];
  let birikim = 0;
  for (const x of dizi) {
    const b = boyutu(x);
    if (gruplar[gruplar.length - 1].length && birikim + b / 2 > pay * gruplar.length && gruplar.length < adet) gruplar.push([]);
    gruplar[gruplar.length - 1].push(x);
    birikim += b;
  }
  return gruplar;
}

const parcalar = { madde: [], lugat: [], tanim: [], sahis: [], hukum: [] };

// Maddeler: kısım sınırını aşmayan, kitap sırasında parçalar.
let no = 0;
for (const k of [1, 2, 3]) {
  const kisimMaddeleri = maddeler.filter(m => m.k === k);
  for (const grup of bol(kisimMaddeleri, m => Buffer.byteLength(m.metin), PARCA_HEDEF)) {
    const ad = `madde-${++no}.json`;
    const s = yaz(ad, { tur: 'madde', kayitlar: grup.map(m => [m.k, m.m, m.metin]) });
    parcalar.madde.push(parcaKaydi(ad, 'madde', grup.length, s, { kisim: k, ilk: grup[0].m, son: grup[grup.length - 1].m }));
  }
}

// Lügat tanımları: [i, terim, anlam] (misal "m" ve Osmanlıca yazılış alınmaz).
no = 0;
for (const grup of bol(sozlukData, x => Buffer.byteLength(x.k + x.a) + 12, 450 * 1024)) {
  const ad = `lugat-${++no}.json`;
  const s = yaz(ad, { tur: 'lugat', kayitlar: grup.map(x => [x.i, x.k, x.a]) });
  parcalar.lugat.push(parcaKaydi(ad, 'lugat', grup.length, s));
}

// Kitabın tanımları: kimlik = tanimlar.js dizisindeki sıra (0'dan).
{
  const s = yaz('tanim-1.json', { tur: 'tanim', kayitlar: tanimlarData.map((x, i) => [i, x.t, x.c, x.s]) });
  parcalar.tanim.push(parcaKaydi('tanim-1.json', 'tanim', tanimlarData.length, s));
}

// Hâl tercemeleri: [slug, isim, unvan, biyografi].
{
  const s = yaz('sahis-1.json', { tur: 'sahis', kayitlar: sahislarData.map(x => [x.slug, x.isim, x.unvan || '', x.biyografi || '']) });
  parcalar.sahis.push(parcaKaydi('sahis-1.json', 'sahis', sahislarData.length, s));
}

// Fıkhî hükümler: aynı metin bir kez. [kimlik, [tür…], [katman…], kisim, madde_no, sayfa, metin, [öteki kimlikler]]
{
  const gruplar = new Map();
  for (const h of hukumlerData) {
    const g = gruplar.get(h.metin);
    if (!g) { gruplar.set(h.metin, { ...h, turler: [h.tur], katmanlar: [h.katman], idler: [h.id] }); continue; }
    if (!g.turler.includes(h.tur)) g.turler.push(h.tur);
    if (!g.katmanlar.includes(h.katman)) g.katmanlar.push(h.katman);
    g.idler.push(h.id);
    if (h.katman === 'acik' && g.katman !== 'acik') { g.id = h.id; g.katman = 'acik'; }   // açık katmandaki kayıt öncelikli
  }
  const liste = [...gruplar.values()];
  no = 0;
  for (const grup of bol(liste, x => Buffer.byteLength(x.metin) + 40, 700 * 1024)) {
    const ad = `hukum-${++no}.json`;
    const s = yaz(ad, { tur: 'hukum', kayitlar: grup.map(x => [x.id, x.turler, x.katmanlar, x.kisim, x.madde_no, x.sayfa, x.metin, x.idler.filter(i => i !== x.id)]) });
    parcalar.hukum.push(parcaKaydi(ad, 'hukum', grup.length, s));
  }
}

// ---------------------------------------------------------------- öneri sözcükleri (oneri.json)
// Kitapta en az 4 kez geçen (en az 3 harfli) kelimeler + kitaptaki en sık yazılışı (küçük harf).
{
  const sayac = new Map();
  for (const m of maddeler) {
    const { duz, konum } = duzleEslemeli(m.metin);
    let bas = 0;
    for (let i = 0; i <= duz.length; i++) {
      if (i < duz.length && duz[i] !== ' ' && duz[i] !== '-') continue;
      if (i - bas >= 3) {
        const w = duz.slice(bas, i);
        if (!/^\d+$/.test(w)) {
          const [ab, as] = asilAralik(m.metin, konum, bas, i);
          const yuzey = m.metin.slice(ab, as).toLocaleLowerCase('tr').replace(/['’]/g, '’');
          let k = sayac.get(w);
          if (!k) sayac.set(w, k = { n: 0, yuzey: new Map() });
          k.n++;
          k.yuzey.set(yuzey, (k.yuzey.get(yuzey) || 0) + 1);
        }
      }
      bas = i + 1;
    }
  }
  const sozcukler = [...sayac].filter(([, k]) => k.n >= 4)
    .sort((a, b) => b[1].n - a[1].n || (a[0] < b[0] ? -1 : 1))
    .map(([w, k]) => {
      const enSik = [...k.yuzey].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
      return enSik === w ? [w, k.n] : [w, k.n, enSik];
    });
  yaz('oneri.json', { sozcukler });
}

// ---------------------------------------------------------------- hızlı dizin

const tabloKaynak = t => {
  const m = /^K(\d)\/M(\d+)$/.exec(t.kaynak_madde || '');
  return m ? [Number(m[1]), Number(m[2])] : null;
};

const hizliGovde = {
  bicim: 1,
  ortalamaUzunluk: ortalama,
  // [kisim, no, başlık, sahîfe, bitiş sahîfesi, metin uzunluğu]
  maddeler: maddeler.map(m => [m.k, m.m, m.baslik, m.s, m.sb, m.metin.length]),
  // [i, terim]
  lugat: sozlukData.map(x => [x.i, x.k]),
  // [sıra, terim, sahîfe]
  tanimlar: tanimlarData.map((x, i) => [i, x.t, x.s]),
  // [slug, isim, unvan]
  sahislar: sahislarData.map(x => [x.slug, x.isim, x.unvan || '']),
  // [id, başlık, kaynak madde [k, m] | null, sahîfe]
  tablolar: tablolarData.map(t => [t.id, t.baslik, tabloKaynak(t), t.sayfa_no || null]),
  // [[soru ifadeleri…], kisim, maddeNo, cevapOzet]
  sorular: soruMaddeMap.map(e => [e.soru, e.kisim, e.maddeNo, e.cevapOzet || '']),
  esAnlamlilar: aramaSynonyms,
  parcalar,
  oneri: null,
};

// ---------------------------------------------------------------- yazma

fs.mkdirSync(CIKTI, { recursive: true });
const oneriIcerik = dosyalar.get('oneri.json');
hizliGovde.oneri = { ad: 'oneri.json', bayt: Buffer.byteLength(oneriIcerik), ozet: ozet(oneriIcerik) };
const govdeDizgi = JSON.stringify(hizliGovde);
const hizli = JSON.stringify({ surum: ozet(govdeDizgi), ...hizliGovde });
dosyalar.set('hizli.json', hizli);

// Klasörü silip yeniden kurmak yerine: üretilmeyen dosyaları sil, yalnız değişen dosyayı yaz.
// (Eşitlenen klasörlerde — iCloud vb. — sil-yaz döngüsü "ad 2.json" çakışma kopyaları bırakıyor.)
for (const ad of fs.readdirSync(CIKTI)) {
  if (!dosyalar.has(ad)) fs.rmSync(path.join(CIKTI, ad), { recursive: true, force: true });
}
let toplam = 0, toplamGz = 0, yazilan = 0;
const satirlar = [];
for (const [ad, icerik] of [...dosyalar].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  const yol = path.join(CIKTI, ad);
  if (!fs.existsSync(yol) || fs.readFileSync(yol, 'utf8') !== icerik) { fs.writeFileSync(yol, icerik); yazilan++; }
  const b = Buffer.byteLength(icerik), g = gz(icerik);
  toplam += b; toplamGz += g;
  satirlar.push(`${ad.padEnd(16)} ${String(b).padStart(9)} B   gzip ${String(g).padStart(8)} B`);
}
console.log(satirlar.join('\n'));
const turGz = tur => parcalar[tur].reduce((t, p) => t + gz(dosyalar.get(p.ad)), 0);
console.log(`\n${dosyalar.size} dosya (${yazilan} tanesi değişti), toplam ${toplam} B, gzip ${toplamGz} B`);
console.log(`hizli.json gzip ${gz(hizli)} B · madde parçaları gzip ${turGz('madde')} B (${parcalar.madde.length} parça)` +
  ` · lügat ${turGz('lugat')} · tanım ${turGz('tanim')} · şahıs ${turGz('sahis')} · hüküm ${turGz('hukum')} · oneri ${gz(oneriIcerik)}`);
console.log(`sürüm ${JSON.parse(hizli).surum}; düz metin örneği: ${duzle('Kur’ân-ı kerîm')}`);
