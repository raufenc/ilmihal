#!/usr/bin/env node
/* Arama motoru sınaması: node tools/yeni-site/arama-sina.mjs [--yaz] [--ayrinti]
   Önce: node tools/yeni-site/arama-uret.mjs (veri-arama/ üretilmiş olmalı)
   (a) duzleEslemeli konum eşlemesi   (b) vurgu doğruluğu   (c) eski motorla karşılaştırma
   (d) geriye bakan düzenli ifade yok (e) süreler            (f) işçi ileti akışı (worker_threads) + ana iş parçacığı geri dönüşü
   --yaz: özeti tools/yeni-site/ARAMA.md içindeki SINAMA işaretleri arasına yazar.
   --ayrinti: eski/yeni karşılaştırmasında her sorgunun farklarını tek tek döker. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import {
  duzle, duzleEslemeli, asilAralik, sorguCoz, terimEslesmeleri, vurguAraliklari, kesit, varyantlar, esAnlamTablosu,
} from '../../js/cekirdek/metin.js';
import { motorKur } from '../../js/isci/arama-isci.js';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERI = path.join(KOK, 'veri-arama');
const AYRINTI = process.argv.includes('--ayrinti');
const sonuclar = [];       // { bolum, ad, gecti, ayrinti }
function denetle(bolum, ad, gecti, ayrinti = '') {
  sonuclar.push({ bolum, ad, gecti: !!gecti, ayrinti });
  if (!gecti) console.log(`  ✗ [${bolum}] ${ad} ${ayrinti}`);
}
const oku = ad => fs.readFileSync(path.join(KOK, ad), 'utf8');
const dosyaYukle = async ad => JSON.parse(fs.readFileSync(path.join(VERI, ad.split('?')[0]), 'utf8'));

if (!fs.existsSync(path.join(VERI, 'hizli.json'))) {
  console.error('veri-arama/ yok. Önce: node tools/yeni-site/arama-uret.mjs');
  process.exit(2);
}

// Kitap metni
const tocBag = { window: {} }; tocBag.window = tocBag; vm.createContext(tocBag);
vm.runInContext(oku('data.js') + ';window.tocData=tocData;window.tablolarData=tablolarData;', tocBag);
const metinler = {};
for (const k of [1, 2, 3]) metinler[k] = JSON.parse(oku(`texts/kisim${k}.json`));
const maddeler = tocBag.tocData.map(m => ({ kimlik: m.kisim + '/' + m.madde_no, baslik: m.baslik, metin: metinler[m.kisim][String(m.madde_no)] }));

// Basit, tekrarlanabilir rastgele sayı (sınama her seferinde aynı kesitleri seçer)
let tohum = 20261117;
const rastgele = () => ((tohum = (tohum * 1103515245 + 12345) % 2147483648) / 2147483648);

// ================================================================== (a) konum eşlemesi
console.log('(a) duzleEslemeli konum eşlemesi');
{
  const HARFRAKAM = /[\p{L}\p{N}]/u;
  let konumDenetimi = 0, kelimeDenetimi = 0, hatali = 0;
  const ornekler = [];
  for (let i = 0; i < 500; i++) {
    const m = maddeler[Math.floor(rastgele() * maddeler.length)];
    const bas = Math.floor(rastgele() * Math.max(1, m.metin.length - 50));
    ornekler.push(m.metin.slice(bas, bas + 50 + Math.floor(rastgele() * 350)));
  }
  // Zor örnekler: ayrık (NFD) şapka, emoji, Türkçe büyük harf, karışık kesme ve tire, sayılar
  ornekler.push('NEMÂZ'.normalize('NFD') + ' ve İMÂM-I A’ZAM’IN “kavli” — 3-4 sahîfe 😀 Ehl-i sünnet’e (Âdil) denir.',
    '  ...Kur\'ân-ı kerîm ’’ -- a - b ‘x’ ʼayn  ', 'ISPARTA ıIİi ÇĞÖŞÜ', '');
  for (const t of ornekler) {
    const { duz, konum } = duzleEslemeli(t);
    let iyi = duz === duzle(t) && konum.length === duz.length;
    for (let i = 0; i < duz.length && iyi; i++) {
      konumDenetimi++;
      if (i && konum[i] <= konum[i - 1]) { iyi = false; break; }
      const asil = t[konum[i]];
      if (duz[i] === ' ') iyi = !HARFRAKAM.test(asil);
      else if (duz[i] === '-') iyi = /[-‐‑]/.test(asil);
      else iyi = duzle(asil) === duz[i];
    }
    let s = 0;
    for (let i = 0; i <= duz.length && iyi; i++) {
      if (i < duz.length && duz[i] !== ' ' && duz[i] !== '-') continue;
      if (i > s) {
        kelimeDenetimi++;
        const [b, e] = asilAralik(t, konum, s, i);
        const parca = t.slice(b, e);
        iyi = duzle(parca) === duz.slice(s, i) && HARFRAKAM.test(parca[0]);
      }
      s = i + 1;
    }
    if (!iyi) { hatali++; if (hatali < 4) console.log('    hatalı kesit:', JSON.stringify(t.slice(0, 80))); }
  }
  denetle('a', `${ornekler.length} kesit (500 rastgele + 4 zor), ${konumDenetimi} konum + ${kelimeDenetimi} kelime geri dönüşü`, hatali === 0, `${hatali} hatalı`);
}

// ================================================================== (b) vurgu doğruluğu
console.log('(b) vurgu doğruluğu');
const esHam = (await dosyaYukle('hizli.json')).esAnlamlilar;
const es = esAnlamTablosu(esHam);
{
  const sorgular = ['nemaz', 'namaz', 'nemâz', 'abdest', 'Resulullah', 'resûlullah', "kur'an", 'kuran', 'zekat',
    "imam-ı a'zam", 'ehl-i sünnet', 'ehli sünnet', 'Allah’ın', 'se’âdet-i ebediyye', '(Âdil)', 'secde-i sehv',
    'abdest bozan şeyler', 'namaz kılmak', '"beş vakit namaz"', '"sallallahü aleyhi ve sellem"', '“İmâm-ı a’zam”',
    'oruç tutmak', 'dar-ül-harb', 'darul harb', 'niyet'];
  let aralikSayisi = 0, hatali = 0, sapkaliBulunan = 0;
  for (const sorgu of sorgular) {
    const cozum = sorguCoz(sorgu, { esAnlamlilar: es });
    const terimler = [].concat(...cozum.secenekler);
    let bu = 0, buHata = 0;
    for (const m of maddeler) {
      const esl = duzleEslemeli(m.metin);
      const ters = new Int32Array(m.metin.length + 1).fill(-1);
      esl.konum.forEach((k, i) => { ters[k] = i; });
      for (const [b, s] of vurguAraliklari(m.metin, cozum, { eslemeli: esl })) {
        bu++;
        const parca = m.metin.slice(b, s);
        const h = duzle(parca);
        // 1) Vurgulanan metin, terimlerin birinin (ya da birkaçının) tam eşleşmesinden oluşmalı.
        const kapsanan = new Uint8Array(h.length);
        for (const t of terimler) for (const [x, y] of terimEslesmeleri(h, t)) kapsanan.fill(1, x, y);
        let iyi = h.length > 0 && [...h].every((c, i) => c === ' ' || c === '-' || kapsanan[i]);
        // 2) Kelime başında başlamalı, kelime sonunda bitmeli (asıl metinde).
        const i0 = ters[b];
        iyi = iyi && i0 >= 0 && (i0 === 0 || esl.duz[i0 - 1] === ' ' || esl.duz[i0 - 1] === '-');
        let j = i0 + h.length;           // vurgunun düz metindeki bitişi
        iyi = iyi && (j >= esl.duz.length || esl.duz[j] === ' ' || esl.duz[j] === '-');
        if (/[âîûÂÎÛ]/.test(parca)) sapkaliBulunan++;
        if (!iyi) { buHata++; if (buHata <= 2) console.log(`    ${sorgu}: şüpheli vurgu ${m.kimlik} ${JSON.stringify(parca)}`); }
      }
    }
    aralikSayisi += bu; hatali += buHata;
    denetle('b', `"${sorgu}": ${bu} vurgu`, buHata === 0 && bu > 0, bu === 0 ? 'hiç eşleşme yok' : `${buHata} hatalı`);
  }
  // Eski hatanın (H-7) kendisi: şapkasız sorgu şapkalı metni vurgulamalı, noktalama kaydırmamalı.
  const ornek = '51 — BEŞ VAKT NEMÂZ. Âkıl ve bâlig olan her müslimânın, hergün (beş) nemâz vaktinin; Nemâzın farzları';
  const v = vurguAraliklari(ornek, 'nemaz').map(([b, s]) => ornek.slice(b, s));
  denetle('b', `H-7: "nemaz" → ${JSON.stringify(v)}`, JSON.stringify(v) === JSON.stringify(['NEMÂZ', 'nemâz', 'Nemâzın']));
  const v2 = vurguAraliklari('(Âdil) denir. Âdil’e, “âdil” ve adâlet', 'adil').map(([b, s]) => '(Âdil) denir. Âdil’e, “âdil” ve adâlet'.slice(b, s));
  denetle('b', `noktalama: "adil" → ${JSON.stringify(v2)}`, JSON.stringify(v2) === JSON.stringify(['Âdil', 'Âdil’e', 'âdil']));
  // Kesit: kelime ortasından kesmez, aralığı içerir, vurgular alıntının içindedir.
  let kesitHata = 0;
  for (let i = 0; i < 300; i++) {
    const m = maddeler[Math.floor(rastgele() * maddeler.length)].metin;
    const b = Math.floor(rastgele() * (m.length - 10)), e = b + 1 + Math.floor(rastgele() * 8);
    const k = kesit(m, [b, e], {});
    const iyi = (k.bas === 0 || /\s/.test(m[k.bas - 1])) && (k.son === m.length || /\s/.test(m[k.son])) &&
      k.metin.length === k.son - k.bas && k.vurgular.every(([x, y]) => x >= 0 && y <= k.metin.length) &&
      (b >= k.bas ? true : /\s/.test(m.slice(b, k.bas) || ' '));
    if (!iyi) { kesitHata++; if (kesitHata < 3) console.log('    kesit:', b, e, k.bas, k.son, JSON.stringify(k.metin.slice(0, 60))); }
  }
  denetle('b', '300 rastgele kesit: kelime ortasından kesilmiyor, aralık içeride', kesitHata === 0, `${kesitHata} hatalı`);
  denetle('b', `toplam ${aralikSayisi} vurgu aralığı denetlendi; ${sapkaliBulunan} tanesi şapkalı harf içeriyor`, hatali === 0);
}

// ================================================================== (c) eski motorla karşılaştırma
console.log('(c) eski motorla karşılaştırma');
const motor = motorKur({ yukle: dosyaYukle });
const KARSILASTIRMA = ['namaz', 'nemaz', 'abdest', 'gusül', 'gusl', 'oruç', 'zekât', 'hac', 'kurban', 'nikâh', 'talâk',
  'cenaze', 'iman', 'imanın şartları', "bid'at", 'ehl-i sünnet', "imam-ı a'zam", 'resulullah', 'peygamber', "kur'an",
  'kuran-ı kerim', 'tevbe', 'sabır', 'şükür', 'kader', 'mezhep', 'vehhabi', 'tasavvuf', 'evliya', 'keramet', 'cennet',
  'cehennem', 'kıyamet', 'faiz', 'miras', 'tesettür', 'avret', 'namazın farzları', 'abdest bozan', 'teyemmüm', 'mest',
  'ezan', 'kıble', 'sünnet', 'haram', 'dua', 'zikir', 'ahlak', 'cuma namazı', 'kaza namazı'];
const karsilastirma = [];
{
  const bag = { console, Map, Set, Promise, JSON, Math, Array, Object, RegExp, String, Number, Error };
  bag.window = bag;
  bag.document = { readyState: 'complete', addEventListener() {} };
  bag.setTimeout = () => 0;
  vm.createContext(bag);
  const app = oku('app.js');
  const parca = app.slice(app.indexOf('// ===== ARAMA NORMALİZASYON ====='), app.indexOf('// ===== ARAMA (BİRLEŞİK) ====='));
  vm.runInContext(oku('arama-sozluk.js') + ';window.aramaSynonyms=aramaSynonyms;window.soruMaddeMap=soruMaddeMap;', bag);
  vm.runInContext(oku('data.js') + ';window.tocData=tocData;window.tablolarData=tablolarData;', bag);
  vm.runInContext(oku('tanimlar.js'), bag);
  vm.runInContext(oku('sozluk-data.js') + ';window.sozlukData=sozlukData;', bag);
  vm.runInContext(oku('sahislar.js') + ';window.sahislarData=sahislarData;', bag);
  vm.runInContext(parca, bag);
  bag.kisimTextsCache = metinler;
  bag.ensureAllKisimTexts = async () => {};
  vm.runInContext(oku('search-engine.js'), bag);
  bag.SearchEngine.rebuild();
  const eskiAra = async sorgu => {
    const r = await bag.SearchEngine.fullSearch(sorgu, { limit: 30, sideLimit: 8 });
    let liste = r.madde.map(x => ({ kimlik: x.id, baslik: x.title, puan: x.score }));
    const kelimeler = bag.expandSearchQuery(sorgu).words;
    if (kelimeler.length === 1) {                       // doFullSearch'teki tek kelime başlık sıralaması
      const w = kelimeler[0];
      const derece = b => { const t = bag.normalizeSearch(b); return t === w ? 3 : (t.indexOf(w) === 0 ? 2 : (bag.includesWordStart(t, w) ? 1 : 0)); };
      liste = liste.map((x, i) => ({ ...x, i })).sort((a, b) => (derece(b.baslik) - derece(a.baslik)) || (b.puan - a.puan) || a.i - b.i);
    }
    return liste;
  };
  const maddeHarita = new Map(maddeler.map(m => [m.kimlik, m]));
  for (const sorgu of KARSILASTIRMA) {
    const eski = await eskiAra(sorgu);
    const yeni = (await motor.tam(sorgu, { turler: ['madde'], sinir: 241, kesitSayisi: 0 })).sonuclar;
    const e10 = eski.slice(0, 10).map(x => x.kimlik), y10 = yeni.slice(0, 10).map(x => x.kimlik);
    const cozum = sorguCoz(sorgu, { esAnlamlilar: es });
    const yalnizEski = e10.filter(k => !y10.includes(k)).map(k => {
      const yr = yeni.findIndex(x => x.kimlik === k);
      const m = maddeHarita.get(k);
      const baslikta = cozum.secenekler[0].every(t => terimEslesmeleri(duzle(m.baslik), t, 1).length);
      // Yeni motor hiç bulmuyorsa: eski eşleşme gerçekten metinde var mı?
      let neden;
      if (yr < 0) neden = 'yeni bulmuyor: eski eşleşme bulanık/alt dizgi (kelimeler metinde kelime başı olarak hepsi birden yok)';
      else if (baslikta) neden = `başlıkta geçiyor ama yeni ${yr + 1}. sırada`;
      else neden = `yeni ${yr + 1}. sırada (yalnız metinde)`;
      return { kimlik: k, baslik: m.baslik, eskiSira: e10.indexOf(k) + 1, yeniSira: yr + 1, baslikta, neden };
    });
    const yalnizYeni = y10.filter(k => !e10.includes(k)).map(k => {
      const er = eski.findIndex(x => x.kimlik === k);
      const m = maddeHarita.get(k);
      const baslikta = cozum.secenekler[0].every(t => terimEslesmeleri(duzle(m.baslik), t, 1).length);
      return { kimlik: k, baslik: m.baslik, yeniSira: y10.indexOf(k) + 1, eskiSira: er + 1, baslikta,
        neden: er < 0 ? 'eski bulmuyor (ilk 30\'da yok)' : `eski ${er + 1}. sırada` };
    });
    // Hüküm (kendiliğinden): yeni ilk 10'a başlığında sorgu geçMEyen bir madde girmişken eskinin başlığında geçen
    // bir maddesi düştüyse ALEYHİNE; yeni, eskinin hiç bulmadığı ya da başlıkta geçen maddeyi getirdiyse veya eskinin
    // eşleşmesi gerçek değilse LEHİNE; başlıkta geçenler arasında yer değişimi ve yalnız metindeki sıra farkı NÖTR.
    const yeniBasliksiz = yalnizYeni.filter(x => !x.baslikta).length;
    const aleyhine = Math.min(yalnizEski.filter(x => x.baslikta).length, yeniBasliksiz);
    const lehine = yalnizYeni.filter(x => x.baslikta && x.eskiSira === 0).length + yalnizEski.filter(x => x.yeniSira === 0).length;
    const notr = yalnizEski.length + yalnizYeni.length - aleyhine - lehine;
    karsilastirma.push({ sorgu, ortak: e10.filter(k => y10.includes(k)).length, eskiSayi: eski.length, yeniSayi: yeni.length, yalnizEski, yalnizYeni, aleyhine, lehine, notr,
      eskiIlk: eski[0] && eski[0].baslik, yeniIlk: yeni[0] && yeni[0].baslik });
  }
  for (const k of karsilastirma) {
    console.log(`  ${k.sorgu.padEnd(18)} ortak ${String(k.ortak).padStart(2)}/10 · eski ${k.eskiSayi} madde (en çok 30), yeni ${k.yeniSayi} · fark: lehine ${k.lehine}, nötr ${k.notr}, aleyhine ${k.aleyhine}`);
    if (AYRINTI || k.aleyhine) {
      for (const x of k.yalnizEski) console.log(`      − ${x.kimlik} ${x.baslik.slice(0, 50)} (eski ${x.eskiSira}.) → ${x.neden}`);
      for (const x of k.yalnizYeni) console.log(`      + ${x.kimlik} ${x.baslik.slice(0, 50)} (yeni ${x.yeniSira}.) ← ${x.neden}${x.baslikta ? ', başlıkta geçiyor' : ''}`);
    }
  }
  const aleyhineToplam = karsilastirma.reduce((t, k) => t + k.aleyhine, 0);
  denetle('c', `${karsilastirma.length} sorguda ilk 10 madde karşılaştırıldı; başlığında geçtiği hâlde yeni ilk 10'dan düşen madde`, aleyhineToplam === 0, `${aleyhineToplam} adet`);
}

// ================================================================== (d) geriye bakış yok
console.log('(d) geriye bakan düzenli ifade');
for (const ad of ['js/cekirdek/metin.js', 'js/cekirdek/arama.js', 'js/isci/arama-isci.js', 'tools/yeni-site/arama-uret.mjs', 'tools/yeni-site/arama-sina.mjs']) {
  const icerik = oku(ad);
  const yasak = ['(?', '<=', '(?', '<!'];
  const bulundu = icerik.includes(yasak[0] + yasak[1]) || icerik.includes(yasak[2] + yasak[3]);
  denetle('d', ad, !bulundu);
}

// ================================================================== (e) süreler
console.log('(e) süreler');
const sureler = {};
{
  const taze = motorKur({ yukle: dosyaYukle });
  let t = performance.now();
  await taze.hazirla();
  sureler.hizliYukleme = performance.now() - t;
  const hs = [];
  for (const q of KARSILASTIRMA) { t = performance.now(); await taze.hizli(q); hs.push(performance.now() - t); }
  hs.sort((a, b) => a - b);
  sureler.hizliOrtanca = hs[Math.floor(hs.length / 2)];
  sureler.hizliEnCok = hs[hs.length - 1];
  t = performance.now();
  let ilk = null;
  await taze.tam('namaz', { turler: ['madde'] }, { parca: () => { if (ilk === null) ilk = performance.now() - t; } });
  sureler.tamSoguk = performance.now() - t;
  sureler.tamIlkParca = ilk;
  const ts = [];
  for (const q of KARSILASTIRMA) { t = performance.now(); await taze.tam(q, { turler: ['madde'] }); ts.push(performance.now() - t); }
  ts.sort((a, b) => a - b);
  sureler.tamOrtanca = ts[Math.floor(ts.length / 2)];
  sureler.tamEnCok = ts[ts.length - 1];
  t = performance.now();
  await taze.tam('namaz', { turler: ['madde', 'lugat', 'tanim', 'sahis', 'hukum'] });
  sureler.tumTurlerSoguk = performance.now() - t;
  const f = x => x.toFixed(1) + ' ms';
  console.log(`  hızlı dizin yükleme+hazırlama ${f(sureler.hizliYukleme)} · hızlı arama ortanca ${f(sureler.hizliOrtanca)}, en çok ${f(sureler.hizliEnCok)}`);
  console.log(`  tam (madde) soğuk ${f(sureler.tamSoguk)} (ilk parça ${f(sureler.tamIlkParca)}) · sıcak ortanca ${f(sureler.tamOrtanca)}, en çok ${f(sureler.tamEnCok)}`);
  console.log(`  tam (bütün türler, soğuk lügat/şahıs/hüküm/tanım) ${f(sureler.tumTurlerSoguk)}`);
  denetle('e', `hızlı arama ortancası < 15 ms (${f(sureler.hizliOrtanca)})`, sureler.hizliOrtanca < 15);
  denetle('e', `sıcak tam arama ortancası < 150 ms (${f(sureler.tamOrtanca)})`, sureler.tamOrtanca < 150);
}

// ================================================================== (f) işçi ileti akışı
console.log('(f) işçi (worker_threads) ve geri dönüş');
{
  const sim = `
    import { parentPort } from 'node:worker_threads';
    import fs from 'node:fs';
    import { fileURLToPath } from 'node:url';
    globalThis.self = globalThis;
    const dinleyiciler = [];
    self.postMessage = m => parentPort.postMessage(m);
    self.addEventListener = (tip, f) => { if (tip === 'message') dinleyiciler.push(f); };
    parentPort.on('message', data => dinleyiciler.forEach(f => f({ data })));
    globalThis.fetch = async adres => {
      const u = new URL(adres);
      const yol = fileURLToPath(u);
      if (!fs.existsSync(yol)) return { ok: false, status: 404, json: async () => null };
      const metin = fs.readFileSync(yol, 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(metin) };
    };
    await import(${JSON.stringify(pathToFileURL(path.join(KOK, 'js/isci/arama-isci.js')).href)});
  `;
  const isci = new Worker(sim, { eval: true, type: 'module' });
  const gelen = [];
  const bekleyen = new Map();
  isci.on('message', m => {
    gelen.push(m);
    const b = bekleyen.get(m.no);
    if (b && m.tip !== 'parca') { bekleyen.delete(m.no); b(m); }
    if (m.tip === 'hazir' && bekleyen.has('hazir')) { const f = bekleyen.get('hazir'); bekleyen.delete('hazir'); f(m); }
  });
  isci.on('error', h => console.log('  işçi hatası:', h));
  const iste = (m, sure = 20000) => new Promise((coz, red) => {
    bekleyen.set(m.no, coz);
    isci.postMessage(m);
    setTimeout(() => red(new Error('zaman aşımı: ' + m.tip)), sure);
  });
  const hazir = gelen.some(m => m.tip === 'hazir') ? true : await new Promise(r => { bekleyen.set('hazir', () => r(true)); setTimeout(() => r(false), 5000); });
  denetle('f', 'işçi "hazir" iletisi yolluyor', hazir);
  await iste({ tip: 'kur', no: 1, veriKoku: pathToFileURL(VERI + '/').href });
  const h = await iste({ tip: 'hizli', no: 2, sorgu: 'namaz', secenek: { sinir: 3 } });
  denetle('f', 'hızlı sonuç geliyor', h.tip === 'sonuc' && h.veri.maddeler.length === 3, JSON.stringify(h).slice(0, 120));
  const t = await iste({ tip: 'tam', no: 3, sorgu: 'abdest', secenek: { turler: ['madde', 'lugat'], sinir: 5 } });
  const parcalar = gelen.filter(m => m.no === 3 && m.tip === 'parca');
  const hizliV = JSON.parse(fs.readFileSync(path.join(VERI, 'hizli.json'), 'utf8'));
  const beklenen = hizliV.parcalar.madde.length + hizliV.parcalar.lugat.length;
  denetle('f', `tam: ${parcalar.length} parça iletisi (beklenen ${beklenen}) + son sonuç`, t.tip === 'sonuc' && parcalar.length === beklenen &&
    parcalar.every((p, i) => p.ilerleme.yuklenen === i + 1) && t.veri.sonuclar.length > 0);
  // Yeni sorgu öncekini bırakır
  isci.postMessage({ tip: 'tam', no: 4, sorgu: 'namaz', secenek: { turler: ['madde', 'lugat', 'hukum', 'sahis'] } });
  const b5 = await iste({ tip: 'tam', no: 5, sorgu: 'oruç', secenek: { turler: ['madde'] } });
  await new Promise(r => setTimeout(r, 300));
  const m4 = gelen.filter(m => m.no === 4 && m.tip !== 'parca');
  denetle('f', 'yeni sorgu gelince önceki AbortError ile bırakılıyor', b5.tip === 'sonuc' && m4.length === 1 && m4[0].tip === 'hata' && m4[0].ad === 'AbortError', JSON.stringify(m4));
  // İptal iletisi
  isci.postMessage({ tip: 'tam', no: 6, sorgu: 'şeytan', secenek: { turler: ['madde', 'hukum'] } });
  isci.postMessage({ tip: 'iptal', hedef: 6 });
  await new Promise(r => setTimeout(r, 400));
  const m6 = gelen.filter(m => m.no === 6 && m.tip !== 'parca');
  denetle('f', 'iptal iletisi işi durduruyor', m6.length === 1 && m6[0].ad === 'AbortError');
  // Hata: veri yok → anlamlı ileti, işçi ölmez
  await iste({ tip: 'kur', no: 7, veriKoku: pathToFileURL(path.join(KOK, 'yok-boyle-klasor') + '/').href });
  const e8 = await iste({ tip: 'hizli', no: 8, sorgu: 'namaz' });
  denetle('f', 'veri yoksa anlamlı hata iletisi', e8.tip === 'hata' && /indirilemedi/.test(e8.ileti), e8.ileti);
  await iste({ tip: 'kur', no: 9, veriKoku: pathToFileURL(VERI + '/').href });
  const h10 = await iste({ tip: 'hizli', no: 10, sorgu: 'oruç' });
  denetle('f', 'hatadan sonra işçi çalışmaya devam ediyor', h10.tip === 'sonuc');
  const e11 = await iste({ tip: 'bilinmeyen', no: 11 });
  denetle('f', 'bilinmeyen istek → hata iletisi', e11.tip === 'hata');
  await isci.terminate();

  // Ana iş parçacığı geri dönüşü: node'da Worker yok → arama.js motoru doğrudan çalıştırır.
  const eskiFetch = globalThis.fetch;
  globalThis.fetch = async adres => {
    const yol = fileURLToPath(new URL(adres));
    if (!fs.existsSync(yol)) return { ok: false, status: 404, json: async () => null };
    const metin = fs.readFileSync(yol, 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(metin) };
  };
  const { arama } = await import('../../js/cekirdek/arama.js');
  denetle('f', 'Worker yokken arama.js yerel kipe geçiyor', (await arama.kip()) === 'yerel');
  const hh = await arama.hizli('zekat');
  denetle('f', 'yerel kip: hizli', hh.maddeler.length > 0);
  let parcaSay = 0;
  const ilk = arama.tam('namaz', { turler: ['madde'], parcaGeldi: () => parcaSay++ });
  const ikinci = arama.tam('abdest', { turler: ['madde'] });
  let ilkHata = null;
  try { await ilk; } catch (h2) { ilkHata = h2; }
  const ik = await ikinci;
  denetle('f', 'yerel kip: yeni tam() öncekini AbortError ile bitiriyor', ilkHata && ilkHata.name === 'AbortError' && ik.sonuclar.length > 0);
  const ctrl = new AbortController();
  const uc = arama.tam('oruç', { turler: ['madde', 'lugat'], sinyal: ctrl.signal });
  ctrl.abort();
  let ucHata = null;
  try { await uc; } catch (h3) { ucHata = h3; }
  denetle('f', 'yerel kip: AbortSignal ile iptal', ucHata && ucHata.name === 'AbortError');
  const va = await arama.vurguAraliklari('Nemâz kılmak ve salât', 'namaz');
  denetle('f', 'arama.vurguAraliklari eş anlamlıyı da vurguluyor (namaz → Nemâz, salât)', JSON.stringify(va) === JSON.stringify([[0, 5], [16, 21]]), JSON.stringify(va));
  const on = await arama.oneriler('abdset namaz');
  denetle('f', 'öneriler: yazım hatası ve yazım varyantı', on.duzeltilmis && on.oneriler.some(o => o.tur === 'duzeltme' && o.oneri === 'abdest') && on.oneriler.some(o => o.tur === 'yazim' && o.oneri === 'nemâz'), JSON.stringify(on).slice(0, 200));
  globalThis.fetch = eskiFetch;
}

// ================================================================== özet
const gecen = sonuclar.filter(s => s.gecti).length;
console.log(`\n${sonuclar.length} denetim, ${gecen} geçti, ${sonuclar.length - gecen} kaldı.`);
const olcum = { dosyalar: fs.readdirSync(VERI) };
if (process.argv.includes('--yaz')) {
  const { gzipSync } = await import('node:zlib');
  let ham = 0, gz = 0, hizliGz = 0, maddeGz = 0;
  for (const ad of olcum.dosyalar) {
    const b = fs.readFileSync(path.join(VERI, ad));
    const g = gzipSync(b, { level: 9 }).length;
    ham += b.length; gz += g;
    if (ad === 'hizli.json') hizliGz = g;
    if (ad.startsWith('madde-')) maddeGz += g;
  }
  const f = x => x.toFixed(1);
  const kb = x => (x / 1024).toFixed(0) + ' KB';
  const bolumler = ['a', 'b', 'c', 'd', 'e', 'f'].map(b => {
    const s = sonuclar.filter(x => x.bolum === b);
    return `${b}) ${s.filter(x => x.gecti).length}/${s.length}`;
  }).join(' · ');
  const kaldi = sonuclar.filter(s => !s.gecti).map(s => `  - KALDI [${s.bolum}] ${s.ad} ${s.ayrinti}`);
  const farkli = karsilastirma.filter(k => k.ortak < 10).map(k => `${k.sorgu} ${k.ortak}/10`).join(', ');
  const ozet = [
    `Son çalıştırma: \`node tools/yeni-site/arama-sina.mjs --yaz\` — **${sonuclar.length} denetim, ${gecen} geçti, ${sonuclar.length - gecen} kaldı** (${bolumler}).`,
    ...kaldi,
    `- veri-arama/: ${olcum.dosyalar.length} dosya, ${kb(ham)} ham, **${kb(gz)} gzip**; hizli.json gzip ${kb(hizliGz)}; madde parçaları gzip ${kb(maddeGz)}.`,
    `- Süreler (node, M1): hızlı dizin yükleme ${f(sureler.hizliYukleme)} ms; hızlı arama ortanca ${f(sureler.hizliOrtanca)} ms (en çok ${f(sureler.hizliEnCok)});` +
      ` tam/madde soğuk ${f(sureler.tamSoguk)} ms (ilk parça ${f(sureler.tamIlkParca)} ms), sıcak ortanca ${f(sureler.tamOrtanca)} ms (en çok ${f(sureler.tamEnCok)});` +
      ` bütün türler soğuk ${f(sureler.tumTurlerSoguk)} ms. Ağ süresi dahil değil.`,
    `- Eski motorla ilk 10: ${karsilastirma.filter(k => k.ortak === 10).length}/${karsilastirma.length} sorguda aynı küme; farklı olanlar: ${farkli}.`,
  ];
  const md = path.join(KOK, 'tools/yeni-site/ARAMA.md');
  const eski = fs.readFileSync(md, 'utf8');
  const bas = '<!-- SINAMA-BASLA -->', son = '<!-- SINAMA-BITIR -->';
  if (eski.includes(bas) && eski.includes(son)) {
    fs.writeFileSync(md, eski.slice(0, eski.indexOf(bas) + bas.length) + '\n' + ozet.join('\n') + '\n' + eski.slice(eski.indexOf(son)));
    console.log('ARAMA.md güncellendi.');
  }
}
process.exit(sonuclar.every(s => s.gecti) ? 0 : 1);
