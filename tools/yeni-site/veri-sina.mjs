#!/usr/bin/env node
/* veri/ katmanının sınaması.  Çalıştırma:  node tools/yeni-site/veri-sina.mjs
   Önce `node tools/yeni-site/veri-uret.mjs` çalışmış olmalı.
   Sonuç konsola basılır ve tools/yeni-site/VERI.md'nin sonundaki "Sınama sonucu" bölümüne yazılır.
   Çıkış kodu: hepsi geçtiyse 0, değilse 1. */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';
import {
  KOK, CIKTI, kaynaklariOku, uret, eskiSozlukDizini, eskiVurgu, eskiParagraflar, escapeHtml,
} from './veri-uret.mjs';

const { veri, maddeKimlik, paragraflar, lugatIsaretle, VeriHatasi } = await import(pathToFileURL(path.join(KOK, 'js/cekirdek/veri.js')).href);

const sonuclar = [];   // {bolum, ad, gecti, ayrinti}
let bolum = '';
function denetle(ad, kosul, ayrinti = '') {
  sonuclar.push({ bolum, ad, gecti: !!kosul, ayrinti: kosul ? '' : String(ayrinti) });
}
const oku = y => JSON.parse(fs.readFileSync(path.join(CIKTI, y), 'utf8'));
const varMi = y => fs.existsSync(path.join(CIKTI, y));
const anahtar = (k, m) => `${k}-${m}`;

const K = kaynaklariOku();
const toc = K.toc;
const maddeKumesi = new Set(toc.map(m => anahtar(m.kisim, m.madde_no)));
const hepsi = [];
(function gez(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const t = path.join(d, f.name); if (f.isDirectory()) gez(t); else hepsi.push(path.relative(CIKTI, t).split(path.sep).join('/')); } })(CIKTI);

/* ── 0. Genel ── */
bolum = '0. Genel';
{
  const { dosyalar } = uret(K);
  const yeniden = uret(K).dosyalar;
  let fark = 0, eksik = 0;
  for (const [y, o] of dosyalar) {
    const s = JSON.stringify(o);
    if (s !== JSON.stringify(yeniden.get(y))) fark++;
    if (!varMi(y) || fs.readFileSync(path.join(CIKTI, y), 'utf8') !== s) eksik++;
  }
  denetle('Üretim deterministik (iki çalıştırma bayt bayt aynı)', fark === 0, `${fark} parça farklı`);
  denetle('Diskteki veri/ güncel (üreticinin çıktısıyla aynı)', eksik === 0, `${eksik} parça eksik/farklı — veri-uret.mjs'i çalıştırın`);
  denetle('Fazla dosya yok', hepsi.length === dosyalar.size + 1, `${hepsi.length} dosya, beklenen ${dosyalar.size + 1}`);
  const kotu = hepsi.filter(y => !/^[a-z0-9-]+(\/[a-z0-9-]+)*\.json$/.test(y));
  denetle('Parça adları ASCII küçük harf/rakam/tire ve yalnız .json', kotu.length === 0, kotu.slice(0, 5).join(', '));
  let bozuk = [];
  for (const y of hepsi) { try { oku(y); } catch (e) { bozuk.push(y); } }
  denetle('Her parça geçerli JSON', bozuk.length === 0, bozuk.join(', '));
  const fz = zlib.gzipSync(fs.readFileSync(path.join(CIKTI, 'fihrist.json')), { level: 9 }).length;
  denetle(`fihrist.json gzip ≤ 25 KB (${(fz / 1024).toFixed(1)} KB)`, fz <= 25 * 1024, fz);
  const tekHarf = [];
  for (const y of hepsi) (function bak(o, yol) {
    if (Array.isArray(o)) o.forEach((x, i) => bak(x, yol));
    else if (o && typeof o === 'object') for (const k of Object.keys(o)) {
      // kimlik haritaları (sayısal anahtar, kelime biçimi, eş anlamlı) ve kaynaktan aynen gelen tablo satırları hariç
      if (/^(kelimeler|terimler|esAnlamlilar|ozetler|veriler|dallar|kokenler|kategoriler|sayilar)$/.test(yol)) continue;
      if (k.length === 1) tekHarf.push(y + ':' + k);
      bak(o[k], k);
    }
  })(oku(y), '');
  denetle('Kendi alanlarımızda tek harfli anahtar yok', tekHarf.length === 0, tekHarf.slice(0, 5).join(', '));
  const s = oku('surum.json');
  denetle('surum.json: sürüm 12 haneli onaltılık, dosya sayısı doğru', /^[0-9a-f]{12}$/.test(s.surum) && s.dosyaSayisi === hepsi.length, JSON.stringify(s));
}

/* ── a. Metin sadakati ── */
bolum = 'a. Metin sadakati';
{
  let ayni = 0; const farkli = [];
  for (const m of toc) {
    const a = anahtar(m.kisim, m.madde_no);
    const d = oku(`madde/${a}.json`);
    const kaynak = K.texts[m.kisim][String(m.madde_no)];
    if (d.metin === kaynak && Buffer.from(d.metin, 'utf8').equals(Buffer.from(kaynak, 'utf8'))) ayni++; else farkli.push(a);
  }
  denetle(`Madde metni texts/*.json ile bayt bayt aynı (${ayni}/241)`, ayni === 241 && toc.length === 241, farkli.join(', '));
  let kunye = 0;
  const f = oku('fihrist.json');
  f.maddeler.forEach((x, i) => { const m = toc[i]; if (x.kisim === m.kisim && x.no === m.madde_no && x.baslik === m.baslik && x.sahife[0] === m.sayfa_no && x.sahife[1] === m.sayfa_bitis) kunye++; });
  denetle(`Fihrist künyeleri tocData ile aynı ve aynı sırada (${kunye}/241)`, kunye === 241 && f.maddeler.length === 241);
  const ozet = oku('ozetler.json').ozetler;
  const ozetAyni = toc.filter(m => ozet[anahtar(m.kisim, m.madde_no)] === K.ozetler[`${m.kisim}/${m.madde_no}`]).length;
  denetle(`Özetler aynen (${ozetAyni}/241)`, ozetAyni === 241);
  // Paragraf ayrımı eski maddeMetniHTML ile aynı
  let parAyni = 0;
  for (const m of toc) {
    const metin = K.texts[m.kisim][String(m.madde_no)];
    const yeni = paragraflar(metin), eski = eskiParagraflar(metin);
    const ok = yeni.length === eski.length && yeni.every((p, i) => p.tur === eski[i].tur && p.metin === eski[i].par && p.lugat === eski[i].vurgu && metin.slice(p.bas, p.son) === p.metin);
    if (ok) parAyni++;
  }
  denetle(`paragraflar() türleri eski maddeMetniHTML ile aynı (${parAyni}/241)`, parAyni === 241);
}

/* ── b. Kayıt sayıları ve alan sadakati ── */
bolum = 'b. Kayıt sayıları';
{
  const ld = oku('lugat/dizin.json');
  const terimler = ld.parcalar.flatMap(p => oku(`lugat/${p.ad}.json`).terimler);
  denetle(`Lügat: ${terimler.length} = kaynak ${K.sozluk.length}`, terimler.length === K.sozluk.length && ld.sayi === K.sozluk.length);
  const kaynakI = new Map(K.sozluk.map(e => [e.i, e]));
  const lugatAlan = terimler.filter(t => { const e = kaynakI.get(t.id); return e && t.kelime === e.k && t.osmanlica === (e.o ?? null) && t.anlam === e.a && t.misal === (e.m ?? null) && t.bakiniz === (e.b ?? null) && t.koken === (e.d ?? null) && t.kaynakSahife === (e.s ?? null); }).length;
  denetle(`Lügat alanları kaynakla aynı (${lugatAlan}/${K.sozluk.length})`, lugatAlan === K.sozluk.length);
  const tl = oku('lugat/terimler.json').terimler;
  denetle(`lugat/terimler.json: ${tl.length} kayıt, kimlik/kelime aynı`, tl.length === K.sozluk.length && tl.every((t, i) => t.id === K.sozluk[i].i && t.kelime === K.sozluk[i].k));

  const sd = oku('sahislar/dizin.json');
  const sahislar = [...new Set(K.sahislar.map(s => s.slug[0]))].flatMap(h => oku(`sahislar/${h}.json`).sahislar);
  denetle(`Şahıs: parçalarda ${sahislar.length}, dizinde ${sd.sahislar.length} = kaynak ${K.sahislar.length}`, sahislar.length === K.sahislar.length && sd.sahislar.length === K.sahislar.length);
  const kS = new Map(K.sahislar.map(s => [s.slug, s]));
  const sahisAlan = sahislar.filter(s => { const e = kS.get(s.slug); return e && s.isim === e.isim && s.unvan === e.unvan && s.kategori === e.kategori && s.biyografi === e.biyografi && s.kaynak === e.kaynak && s.no === (e.no ?? null) && JSON.stringify(s.sahifeler) === JSON.stringify(e.sayfalar) && s.maddeler.length === e.gectigiMaddeler.length; }).length;
  denetle(`Şahıs alanları (biyografi dahil) kaynakla aynı (${sahisAlan}/${K.sahislar.length})`, sahisAlan === K.sahislar.length);

  const hd = oku('hukumler/dizin.json');
  const hukumler = [];
  for (const t of hd.turler) for (const k of hd.katmanlar) hukumler.push(...oku(`hukumler/${t}-${k}.json`).hukumler.map(h => ({ ...h, tur: t, katman: k })));
  denetle(`Hüküm: ${hukumler.length} = kaynak ${K.hukumler.length}`, hukumler.length === K.hukumler.length && hd.sayi === K.hukumler.length);
  const kH = new Map(K.hukumler.map(h => [h.id, h]));
  const hukumAlan = hukumler.filter(h => { const e = kH.get(h.id); return e && h.metin === e.metin && h.tur === e.tur && h.katman === e.katman && h.sahife === e.sayfa && h.sahifeBitis === (e.sayfa_bitis ?? null) && h.altTur === e.alt_tur && h.baglam === e.baglam && h.madde === (e.kisim != null ? anahtar(e.kisim, e.madde_no) : null); }).length;
  denetle(`Hüküm alanları kaynakla aynı (${hukumAlan}/${K.hukumler.length})`, hukumAlan === K.hukumler.length);
  const ah = oku('ayet-hadis.json');
  denetle(`Âyet: ${ah.ayetler.length} = ${K.ayetHadis.ayetler.length}; hadîs: ${ah.hadisler.length} = ${K.ayetHadis.hadisler.length}`, ah.ayetler.length === K.ayetHadis.ayetler.length && ah.hadisler.length === K.ayetHadis.hadisler.length);
  denetle('Âyet/hadîs metinleri ve alanları aynen', ah.ayetler.every((a, i) => { const e = K.ayetHadis.ayetler[i]; return a.metin === e.metin && a.sure === (e.sure ?? null) && a.ayetNo === (e.ayet_no ?? null) && a.sahife === e.sayfa; }) && ah.hadisler.every((a, i) => { const e = K.ayetHadis.hadisler[i]; return a.metin === e.metin && a.kaynak === (e.kaynak ?? null) && a.sahife === e.sayfa; }));
  const mAyet = toc.reduce((n, m) => n + oku(`madde/${anahtar(m.kisim, m.madde_no)}.json`).ayetler.length, 0);
  const mHadis = toc.reduce((n, m) => n + oku(`madde/${anahtar(m.kisim, m.madde_no)}.json`).hadisler.length, 0);
  denetle(`Madde parçalarındaki âyet ${mAyet} + maddesiz 3 = ${K.ayetHadis.ayetler.length}; hadîs ${mHadis} + maddesiz 4 = ${K.ayetHadis.hadisler.length}`, mAyet + K.ayetHadis.ayetler.filter(a => a.kisim == null || a.madde == null).length === K.ayetHadis.ayetler.length && mHadis + K.ayetHadis.hadisler.filter(a => a.kisim == null || a.madde == null).length === K.ayetHadis.hadisler.length);
  const td = oku('tablolar/dizin.json');
  denetle(`Tablo: dizinde ${td.tablolar.length}, parça ${hepsi.filter(y => y.startsWith('tablolar/') && y !== 'tablolar/dizin.json').length} = kaynak ${K.tablolar.length}`, td.tablolar.length === K.tablolar.length && hepsi.filter(y => y.startsWith('tablolar/') && y !== 'tablolar/dizin.json').length === K.tablolar.length);
  const tabloAyni = K.tablolar.filter(t => { const d = oku(`tablolar/${t.id.replace(/_/g, '-')}.json`); return JSON.stringify(d.veriler) === JSON.stringify(t.veriler === undefined ? null : t.veriler) && JSON.stringify(d.dallar) === JSON.stringify(t.dallar ?? null) && d.kaynakMetin === (t.kaynak_metin ?? null) && JSON.stringify(d.kolonlar) === JSON.stringify(t.kolonlar ?? null); }).length;
  denetle(`Tablo içerikleri (veriler/dallar, anahtar sırası dahil) aynen (${tabloAyni}/${K.tablolar.length})`, tabloAyni === K.tablolar.length);
  const tn = oku('tanimlar.json').tanimlar;
  denetle(`Tanım: ${tn.length} = ${K.tanimlar.length}, alanlar aynen`, tn.length === K.tanimlar.length && tn.every((t, i) => t.terim === K.tanimlar[i].t && t.cumle === K.tanimlar[i].c && t.sahife === K.tanimlar[i].s));
  const gs = oku('gunun-sualleri.json').sualler;
  denetle(`Günün suâli: ${gs.length} = ${K.gunun.length}`, gs.length === K.gunun.length && gs.every((g, i) => g.soru === K.gunun[i].soru));
  const ts = oku('test-sorulari.json').konular;
  const qn = Object.values(K.app.quiz).reduce((n, l) => n + l.length, 0);
  denetle(`Bilgi testi: ${ts.reduce((n, k) => n + k.sorular.length, 0)} = ${qn}`, ts.reduce((n, k) => n + k.sorular.length, 0) === qn && qn === 35);
  const rh = oku('rehberler.json').rehberler;
  denetle(`Rehber: ${rh.length} = ${K.rehberler.length}; madde atfı ${rh.reduce((n, r) => n + r.bolumler.reduce((x, b) => x + b.maddeler.length, 0), 0)}`, rh.length === K.rehberler.length && rh.every((r, i) => r.ikon === K.rehberler[i].ikon));
  const ar = oku('arama.json');
  denetle(`Arama: eş anlamlı ${Object.keys(ar.esAnlamlilar).length} = ${Object.keys(K.esAnlamlilar).length}; soru eşlemesi ${ar.sorular.length} = ${K.soruMadde.length}`, Object.keys(ar.esAnlamlilar).length === Object.keys(K.esAnlamlilar).length && ar.sorular.length === K.soruMadde.length);
  const atif = toc.reduce((n, m) => n + oku(`madde/${anahtar(m.kisim, m.madde_no)}.json`).atiflar.length, 0);
  const atifKaynak = Object.values(K.crossref).reduce((n, l) => n + l.length, 0);
  denetle(`Çapraz atıf: ${atif} = ${atifKaynak}`, atif === atifKaynak);
  const sesYok = toc.filter(m => !oku(`madde/${anahtar(m.kisim, m.madde_no)}.json`).ses).map(m => `${m.kisim}/${m.madde_no}`);
  const sesYokKaynak = Object.keys(K.app.sesAraligi).filter(k => K.app.sesAraligi[k] === null);
  denetle(`Sesi olmayan madde ${sesYok.length} = sesAraligiMap null ${sesYokKaynak.length}`, sesYok.length === sesYokKaynak.length && sesYok.every(k => sesYokKaynak.includes(k)), sesYok.join(','));
  const hukumMaddeToplam = toc.reduce((n, m) => { const h = oku(`madde/${anahtar(m.kisim, m.madde_no)}.json`).hukumSayisi; return n + h.acik + h.tum; }, 0);
  denetle(`Madde hüküm sayıları toplamı ${hukumMaddeToplam} + maddesiz 1 = ${K.hukumler.length}`, hukumMaddeToplam + 1 === K.hukumler.length);
}

/* ── c. Bağlar ── */
bolum = 'c. Bağlar';
{
  const kirik = [];
  const madde = (yer, a) => { if (a !== null && !maddeKumesi.has(a)) kirik.push(`${yer}→${a}`); };
  const slugParca = new Map();
  for (const y of hepsi.filter(y => /^sahislar\/[a-z0-9]\.json$/.test(y))) for (const s of oku(y).sahislar) slugParca.set(s.slug, y);
  let slugSay = 0, slugKirik = [];
  const tabloVar = id => varMi(`tablolar/${id.replace(/_/g, '-')}.json`);
  let tabloSay = 0, tabloKirik = [];
  let lugatSay = 0, lugatKirik = [];
  const ld = oku('lugat/dizin.json');
  const parcaTerim = new Map(ld.parcalar.map(p => [p.ad, new Set(oku(`lugat/${p.ad}.json`).terimler.map(t => t.id))]));
  for (const m of toc) {
    const a = anahtar(m.kisim, m.madde_no);
    const d = oku(`madde/${a}.json`);
    for (const r of d.atiflar) madde(`madde ${a} atıf`, r.madde);
    madde(`madde ${a} önceki`, d.onceki); madde(`madde ${a} sonraki`, d.sonraki);
    for (const s of d.sahislar) { slugSay++; if (!slugParca.has(s.slug) || slugParca.get(s.slug) !== `sahislar/${s.slug[0]}.json`) slugKirik.push(s.slug); }
    for (const t of d.tablolar) { tabloSay++; if (!tabloVar(t.id)) tabloKirik.push(t.id); }
    const l = oku(`lugat-madde/${a}.json`);
    for (const [id, t] of Object.entries(l.terimler)) { lugatSay++; if (!parcaTerim.get(t.parca)?.has(+id)) lugatKirik.push(id); }
    for (const id of Object.values(l.kelimeler)) if (!l.terimler[String(id)]) lugatKirik.push('kelime→' + id);
  }
  // Bütün şahıs slug'ları (kaynak) kendi parçasında
  for (const s of K.sahislar) { slugSay++; if (!slugParca.has(s.slug)) slugKirik.push(s.slug); }
  for (const t of oku('tablolar/dizin.json').tablolar) { tabloSay++; if (!tabloVar(t.id)) tabloKirik.push(t.id); madde('tablo ' + t.id, t.kaynakMadde); }
  for (const y of hepsi.filter(y => y.startsWith('tablolar/') && y !== 'tablolar/dizin.json')) { const t = oku(y); for (const x of t.maddeAtiflari || []) for (const a of x.maddeler) { if (a === null) kirik.push(`tablo ${t.id} çözülemeyen atıf`); else madde('tablo ' + t.id, a); } }
  for (const y of hepsi.filter(y => /^sahislar\/[a-z0-9]\.json$/.test(y))) for (const s of oku(y).sahislar) for (const a of s.maddeler) madde('şahıs ' + s.slug, a);
  for (const y of hepsi.filter(y => y.startsWith('hukumler/') && y !== 'hukumler/dizin.json')) for (const h of oku(y).hukumler) madde('hüküm ' + h.id, h.madde);
  const ah = oku('ayet-hadis.json');
  for (const x of [...ah.ayetler, ...ah.hadisler]) madde('âyet/hadîs', x.madde);
  for (const t of oku('tanimlar.json').tanimlar) madde('tanım ' + t.terim, t.madde);
  for (const r of oku('rehberler.json').rehberler) for (const b of r.bolumler) for (const x of b.maddeler) madde('rehber ' + r.id, x.madde);
  for (const g of oku('gunun-sualleri.json').sualler) madde('günün suâli', g.madde);
  for (const k of oku('test-sorulari.json').konular) for (const q of k.sorular) madde('test', q.madde);
  for (const s of oku('arama.json').sorular) madde('arama', s.madde);
  for (const k of oku('konular.json').konular) for (const a of k.maddeler) madde('konu ' + k.id, a);
  for (const a of Object.keys(oku('ozetler.json').ozetler)) madde('özet', a);
  denetle(`Bütün madde atıfları çözülüyor (kırık ${kirik.length})`, kirik.length === 0, kirik.slice(0, 10).join('; '));
  denetle(`Şahıs slug'ları kendi harf parçasında çözülüyor (${slugSay - slugKirik.length}/${slugSay})`, slugKirik.length === 0, slugKirik.slice(0, 10).join(', '));
  denetle(`Tablo kimlikleri çözülüyor (${tabloSay - tabloKirik.length}/${tabloSay})`, tabloKirik.length === 0, tabloKirik.join(', '));
  denetle(`Madde lügat terimleri doğru harf parçasında (${lugatSay - lugatKirik.length}/${lugatSay})`, lugatKirik.length === 0, lugatKirik.slice(0, 10).join(', '));
  // Lügat dizinindeki kimlik aralıkları her kimliği yalnız kendi parçasına götürüyor
  let aralikHata = 0;
  for (const e of K.sozluk) { const p = ld.parcalar.filter(p => p.araliklar.some(([a, b]) => a <= e.i && e.i <= b)); if (p.length !== 1 || !parcaTerim.get(p[0].ad).has(e.i)) aralikHata++; }
  denetle('Lügat kimlik aralıkları her terimi tek ve doğru parçaya götürüyor', aralikHata === 0, aralikHata);
  // Ses adresleri audioMap ile aynı
  let sesHata = 0, sesParca = 0;
  for (const m of toc) {
    const d = oku(`madde/${anahtar(m.kisim, m.madde_no)}.json`);
    if (!d.ses) continue;
    for (const p of d.ses.parcalar) { sesParca++; if (p.adres !== K.app.audioBase + encodeURI(K.audioMap[p.kayit])) sesHata++; }
  }
  denetle(`Ses adresleri AUDIO_BASE + encodeURI(audioMap) (${sesParca - sesHata}/${sesParca})`, sesHata === 0);
}

/* ── d. maddeKimlik ── */
bolum = 'd. maddeKimlik';
{
  const ornekler = [
    ['{kisim, madde_no}', { kisim: 1, madde_no: 43 }],
    ['"kisim/madde"', '1/43'],
    ['"K{k}/M{m}"', 'K1/M43'],
    ['{kisim, madde}', { kisim: 1, madde: 43 }],
    ['{kisim, maddeNo}', { kisim: 1, maddeNo: 43 }],
    ['{k, m}', { k: 1, m: 43 }],
    ['texts anahtarı (dosya, anahtar)', ['kisim1.json', '43']],
  ];
  for (const [ad, x] of ornekler) {
    const c = Array.isArray(x) ? maddeKimlik.coz(x[0], x[1]) : maddeKimlik.coz(x);
    denetle(`coz ${ad}`, c && c.kisim === 1 && c.no === 43, JSON.stringify(c));
  }
  const ek = [['"1-43"', '1-43'], ['/madde/1/43', '/madde/1/43'], ['{dosya, anahtar}', { dosya: 'kisim1.json', anahtar: '43' }], ['"kisim1.json#43"', 'kisim1.json#43'], ['{kisim, no}', { kisim: 1, no: 43 }], ['(1, 43)', [1, 43]]];
  for (const [ad, x] of ek) { const c = Array.isArray(x) ? maddeKimlik.coz(...x) : maddeKimlik.coz(x); denetle(`coz ek biçim ${ad}`, c && c.kisim === 1 && c.no === 43, JSON.stringify(c)); }
  const gecersizler = [null, undefined, '', 'Tüm Kısımlar', { kisim: null, madde: null }, 'K4/M1', '1/99', '2/74', '3/71', '0/1', '1/0', { kisim: 1, madde_no: 1.5 }, 'abc', { kisim: 1 }];
  denetle('coz geçersizleri null döndürüyor', gecersizler.every(x => maddeKimlik.coz(x) === null), gecersizler.filter(x => maddeKimlik.coz(x) !== null).map(x => JSON.stringify(x)).join(', '));
  denetle('Her madde 7 biçimde de aynı kimliğe çözülüyor (241×7)', toc.every(m => {
    const k = m.kisim, n = m.madde_no;
    const ler = [maddeKimlik.coz({ kisim: k, madde_no: n }), maddeKimlik.coz(`${k}/${n}`), maddeKimlik.coz(`K${k}/M${n}`), maddeKimlik.coz({ kisim: k, madde: n }), maddeKimlik.coz({ kisim: k, maddeNo: n }), maddeKimlik.coz({ k, m: n }), maddeKimlik.coz(`kisim${k}.json`, String(n))];
    return ler.every(c => c && c.kisim === k && c.no === n);
  }));
  denetle('anahtar / yol / egik', maddeKimlik.anahtar('K1/M43') === '1-43' && maddeKimlik.yol({ kisim: 2, madde_no: 17 }) === '/madde/2/17' && maddeKimlik.egik('3-70') === '3/70' && maddeKimlik.anahtar('x') === null);
  const f = oku('fihrist.json');
  denetle('veri.js MADDE_SAYISI fihristle aynı (98/73/70)', [1, 2, 3].every(k => maddeKimlik.coz(k, f.kisimlar[k - 1].maddeSayisi) && !maddeKimlik.coz(k, f.kisimlar[k - 1].maddeSayisi + 1)));
}

/* ── e. Lügat vurgusu eskisiyle aynı ── */
bolum = 'e. Lügat vurgusu';
{
  const wordMap = eskiSozlukDizini(K.sozluk);
  let ayni = 0, toplamVurgu = 0; const farkli = [];
  for (const m of toc) {
    const a = anahtar(m.kisim, m.madde_no);
    const metin = K.texts[m.kisim][String(m.madde_no)];
    const lm = oku(`lugat-madde/${a}.json`);
    const araliklar = lugatIsaretle(metin, lm.kelimeler);
    toplamVurgu += araliklar.length;
    let tamam = true;
    let j = 0;
    for (const p of paragraflar(metin)) {
      if (!p.lugat) continue;
      const eski = eskiVurgu(p.metin, wordMap, K.app.trSuffixes);
      let yeni = '', kon = p.bas;
      while (j < araliklar.length && araliklar[j].bas < p.son) {
        const r = araliklar[j++];
        yeni += escapeHtml(metin.slice(kon, r.bas)) + `<span data-id="${r.id}">` + escapeHtml(metin.slice(r.bas, r.son)) + '</span>';
        kon = r.son;
      }
      yeni += escapeHtml(metin.slice(kon, p.son));
      if (yeni !== eski) { tamam = false; break; }
    }
    if (tamam) ayni++; else farkli.push(a);
  }
  denetle(`lugatIsaretle() eski highlightWords ile birebir aynı HTML (${ayni}/241; ${toplamVurgu} vurgu)`, ayni === 241, farkli.slice(0, 10).join(', '));
}

/* ── f. veri.js canlı (yerel http sunucusu) ── */
bolum = 'f. veri.js canlı';
const istekler = [];
let ariza = {};   // yol → {tur, kalan}
const sunucu = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  istekler.push(u);
  const yol = u.replace(/^\/veri\//, '');
  const a = ariza[yol];
  if (a && a.kalan > 0) {
    a.kalan--;
    if (a.tur === '500') { res.writeHead(500); return res.end('hata'); }
    if (a.tur === 'bozuk') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end('{"yarim":'); }
    if (a.tur === 'yavas') { setTimeout(() => { try { res.writeHead(200); res.end('{}'); } catch (e) {} }, 1500); return; }
  }
  const tam = path.join(CIKTI, yol);
  if (!tam.startsWith(CIKTI + path.sep) || !fs.existsSync(tam)) { res.writeHead(404); return res.end('yok'); }
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  fs.createReadStream(tam).pipe(res);
});
await new Promise(r => sunucu.listen(0, '127.0.0.1', r));
const port = sunucu.address().port;
veri.ayarla({ kok: `http://127.0.0.1:${port}/veri/`, yenidenBekleme: 50 });
const say = y => istekler.filter(x => x === '/veri/' + y).length;
const hataTuru = async p => { try { await p; return 'hata yok'; } catch (e) { return e instanceof VeriHatasi ? e.tur : 'başka: ' + e; } };
try {
  // Her yükleyici bir kez
  const cagrilar = {
    surum: () => veri.surum(), fihrist: () => veri.fihrist(), kisim: () => veri.kisim(2), maddeKunye: () => veri.maddeKunye('K1/M43'),
    madde: () => veri.madde(1, 43), maddeLugat: () => veri.maddeLugat('1/43'), komsu: () => veri.komsu(2, 1), sahifedenMadde: () => veri.sahifedenMadde(21),
    ozetler: () => veri.ozetler(), konular: () => veri.konular(), lugatDizin: () => veri.lugatDizin(), lugatParca: () => veri.lugatParca('b'),
    lugatHarf: () => veri.lugatHarf('M'), lugatTerimler: () => veri.lugatTerimler(), lugatTerim: () => veri.lugatTerim(3),
    sahislarDizin: () => veri.sahislarDizin(), sahis: () => veri.sahis('abbas'), hukumlerDizin: () => veri.hukumlerDizin(), hukumler: () => veri.hukumler('farz', 'acik'),
    ayetHadis: () => veri.ayetHadis(), tanimlar: () => veri.tanimlar(), tablolar: () => veri.tablolar(), tablo: () => veri.tablo('iman_sartlari'),
    rehberler: () => veri.rehberler(), rehber: () => veri.rehber('namaz-rehberi'), gununSualleri: () => veri.gununSualleri(), gununSuali: () => veri.gununSuali('2026-11-17'),
    testSorulari: () => veri.testSorulari(), arama: () => veri.arama(), okumaPlani: () => veri.okumaPlani(),
  };
  const sonuc = {};
  const basarisiz = [];
  for (const [ad, f] of Object.entries(cagrilar)) { try { sonuc[ad] = await f(); if (sonuc[ad] === undefined) basarisiz.push(ad + ': undefined'); } catch (e) { basarisiz.push(ad + ': ' + e.message); } }
  denetle(`Her yükleyici çalışıyor (${Object.keys(cagrilar).length - basarisiz.length}/${Object.keys(cagrilar).length})`, basarisiz.length === 0, basarisiz.join('; '));
  denetle('madde(1,43) doğru madde, metin kaynakla aynı', sonuc.madde?.madde === '1-43' && sonuc.madde?.metin === K.texts[1]['43']);
  denetle('komsu(2,1) → önceki 1-98, sonraki 2-2', sonuc.komsu?.onceki?.kisim === 1 && sonuc.komsu?.onceki?.no === 98 && sonuc.komsu?.sonraki?.kisim === 2 && sonuc.komsu?.sonraki?.no === 2);
  const komsuUc = await veri.komsu(1, 1), komsuSon = await veri.komsu(3, 70);
  denetle('komsu kitap başında/sonunda null', komsuUc.onceki === null && komsuSon.sonraki === null);
  denetle('sahifedenMadde(21) → 1/1 … 1/3 (paylaşılan sahîfe)', JSON.stringify((sonuc.sahifedenMadde || []).map(m => `${m.kisim}/${m.no}`)) === JSON.stringify(toc.filter(m => m.sayfa_no <= 21 && 21 <= m.sayfa_bitis).map(m => `${m.kisim}/${m.no ?? m.madde_no}`)));
  denetle('sahifedenMadde(5) madde dışı → []', (await veri.sahifedenMadde(5)).length === 0);
  denetle('lugatTerim(3) → ÂBÂD', sonuc.lugatTerim?.kelime === 'ÂBÂD');
  denetle('lugatTerim(olmayan kimlik) → null', (await veri.lugatTerim(2)) === null || K.sozluk.some(e => e.i === 2));
  denetle(`lugatHarf('M') ${sonuc.lugatHarf?.length} terim (birden çok parça birleşir)`, sonuc.lugatHarf?.length === K.sozluk.filter(e => /^M/.test(e.k.trim().charAt(0).toLocaleUpperCase('tr'))).length);
  denetle("sahis('abbas') biyografi kaynakla aynı; olmayan slug → null", sonuc.sahis?.biyografi === K.sahislar.find(s => s.slug === 'abbas').biyografi && (await veri.sahis('yok-boyle-biri')) === null && (await veri.sahis('')) === null);
  denetle("tablo('iman_sartlari') = tablo('iman-sartlari')", (await veri.tablo('iman-sartlari')) === sonuc.tablo);
  // Günün suâli eski algoritmayla
  const eskiGun = d => { const idx = Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000) % K.gunun.length; return K.gunun[idx < 0 ? idx + K.gunun.length : idx].soru; };
  let gunAyni = 0;
  for (let i = 0; i < 400; i++) { const d = new Date(2026, 0, 1 + i, 12); if ((await veri.gununSuali(d)).soru === eskiGun(d)) gunAyni++; }
  denetle(`gununSuali eski siteyle aynı (${gunAyni}/400 gün)`, gunAyni === 400);
  // Bellek: aynı istek ikinci kez gitmiyor; eşzamanlılar tek isteği paylaşıyor
  const once = say('madde/2-17.json');
  const [x1, x2, x3] = await Promise.all([veri.madde(2, 17), veri.madde('2/17'), veri.madde({ kisim: 2, madde_no: 17 })]);
  await veri.madde('K2/M17');
  denetle('Eşzamanlı 3 çağrı + 1 sonraki → tek istek, aynı nesne', say('madde/2-17.json') - once === 1 && x1 === x2 && x2 === x3, `istek ${say('madde/2-17.json') - once}`);
  // 404
  denetle("404 → tur 'bulunamadi', yeniden denenmez", (await hataTuru(veri.tablo('olmayan-tablo'))) === 'bulunamadi' && say('tablolar/olmayan-tablo.json') === 1);
  denetle("Geçersiz kimlik → tur 'gecersiz', istek gitmez", (await hataTuru(veri.madde('1/999'))) === 'gecersiz');
  // 500 bir kez → yeniden deneme başarılı
  ariza['madde/1-1.json'] = { tur: '500', kalan: 1 };
  const m11 = await veri.madde(1, 1).catch(e => e);
  denetle('500 bir kez → yeniden denemeyle başarılı (2 istek)', m11 && m11.madde === '1-1' && say('madde/1-1.json') === 2, m11 && m11.message);
  // 500 iki kez → hata; bellekte kalmaz, sonraki çağrı yeniden dener
  ariza['madde/1-2.json'] = { tur: '500', kalan: 2 };
  const t500 = await hataTuru(veri.madde(1, 2));
  const m12 = await veri.madde(1, 2).catch(e => e);
  denetle("500 iki kez → tur 'sunucu'; başarısız istek bellekte kalmıyor (sonraki çağrı başarılı)", t500 === 'sunucu' && m12?.madde === '1-2' && say('madde/1-2.json') === 3, `${t500}, istek ${say('madde/1-2.json')}`);
  // Bozuk JSON
  ariza['madde/1-3.json'] = { tur: 'bozuk', kalan: 2 };
  denetle("Bozuk JSON iki kez → tur 'bozuk'", (await hataTuru(veri.madde(1, 3))) === 'bozuk');
  // Zaman aşımı
  veri.ayarla({ zamanAsimi: 300 });
  ariza['madde/1-4.json'] = { tur: 'yavas', kalan: 2 };
  const zt = Date.now();
  const tz = await hataTuru(veri.madde(1, 4));
  denetle(`Zaman aşımı → tur 'zaman-asimi', bir kez yeniden denendi (${say('madde/1-4.json')} istek, ${Date.now() - zt} ms)`, tz === 'zaman-asimi' && say('madde/1-4.json') === 2, tz);
  veri.ayarla({ zamanAsimi: 20000 });
  // İptal: bir çağıranın iptali diğerini etkilemez
  ariza['madde/1-5.json'] = { tur: 'yavas', kalan: 0 };
  const ac = new AbortController();
  const p1 = veri.madde(1, 5, { sinyal: ac.signal });
  const p2 = veri.madde(1, 5);
  ac.abort();
  const [r1, r2] = await Promise.allSettled([p1, p2]);
  denetle("AbortSignal → tur 'iptal' (AbortError); paylaşan diğer çağrı tamamlanıyor", r1.status === 'rejected' && r1.reason.tur === 'iptal' && r1.reason.name === 'AbortError' && r2.status === 'fulfilled' && r2.value.madde === '1-5');
  const ac2 = new AbortController(); ac2.abort();
  denetle('Önceden iptal edilmiş sinyal → istek gitmeden iptal', (await hataTuru(veri.madde(1, 6, { sinyal: ac2.signal }))) === 'iptal' && say('madde/1-6.json') === 0);
  // Çevrimdışı
  const aslNav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true });
  const tc = await hataTuru(veri.madde(1, 7));
  Object.defineProperty(globalThis, 'navigator', aslNav);
  denetle("Çevrimdışı → tur 'cevrimdisi', istek gitmez; sonra çevrimiçi çağrı başarılı", tc === 'cevrimdisi' && say('madde/1-7.json') === 0 && (await veri.madde(1, 7)).madde === '1-7');
  // Ağ hatası (kapalı port)
  veri.ayarla({ kok: 'http://127.0.0.1:9/veri/' });
  denetle("Ağ hatası → tur 'ag'", (await hataTuru(veri.madde(1, 8))) === 'ag');
  veri.ayarla({ kok: `http://127.0.0.1:${port}/veri/` });
  // Hata iletisi parçayı söylüyor
  const e404 = await veri.hukumler('yok').catch(e => e);
  denetle('Hata iletisi parçayı ve nedeni söylüyor', e404 instanceof VeriHatasi && e404.parca === 'hukumler/yok-acik.json' && /bulunamadı/.test(e404.message), e404 && e404.message);
  // Ön yükleme
  const onc = say('madde/3-70.json');
  veri.onYukle(3, 70, { lugat: true });
  await new Promise(r => setTimeout(r, 400));
  await veri.madde(3, 70);
  denetle('onYukle → madde ve lügati belleğe alındı, sonraki çağrı istek göndermedi', say('madde/3-70.json') - onc === 1 && say('lugat-madde/3-70.json') === 1);
  // Küresel değişken yok
  const kod = fs.readFileSync(path.join(KOK, 'js/cekirdek/veri.js'), 'utf8');
  denetle('veri.js window.* / document / küresel atama içermiyor', !/\bwindow\./.test(kod) && !/\bdocument\./.test(kod) && !/globalThis\./.test(kod));
} finally {
  sunucu.close();
}

/* ── Rapor ── */
const gecen = sonuclar.filter(s => s.gecti).length;
const satirlar = [];
let onceki = '';
for (const s of sonuclar) {
  if (s.bolum !== onceki) { satirlar.push(`\n**${s.bolum}**\n`); onceki = s.bolum; }
  satirlar.push(`- ${s.gecti ? 'GEÇTİ' : '**KALDI**'} — ${s.ad}${s.ayrinti ? ` (${s.ayrinti})` : ''}`);
}
const ozet = `Son çalıştırma: ${new Date().toISOString().slice(0, 10)} · ${sonuclar.length} denetim, **${gecen} geçti**, ${sonuclar.length - gecen} kaldı.`;
console.log(ozet.replace(/\*\*/g, ''));
for (const s of sonuclar) if (!s.gecti) console.log('  KALDI: ' + s.bolum + ' — ' + s.ad + (s.ayrinti ? ' (' + s.ayrinti + ')' : ''));
if (process.argv.includes('-v')) for (const s of sonuclar) console.log((s.gecti ? '  ok   ' : '  KALDI ') + s.ad);

const belge = path.join(KOK, 'tools/yeni-site/VERI.md');
if (fs.existsSync(belge)) {
  const b = fs.readFileSync(belge, 'utf8');
  const bas = '<!-- sinama-basla -->', son = '<!-- sinama-bitis -->';
  const i = b.indexOf(bas), j = b.indexOf(son);
  if (i >= 0 && j > i) {
    const bolumler = [...new Set(sonuclar.map(s => s.bolum))].map(bl => { const l = sonuclar.filter(s => s.bolum === bl); return `${bl} ${l.filter(s => s.gecti).length}/${l.length}`; }).join(' · ');
    const kalan = sonuclar.filter(s => !s.gecti).map(s => `- KALDI — ${s.bolum}: ${s.ad}${s.ayrinti ? ` (${s.ayrinti})` : ''}`);
    const blok = `${bas}\n${ozet}\n\n${bolumler}\n${kalan.length ? '\n' + kalan.join('\n') + '\n' : ''}\nHer denetimin adı için: \`node tools/yeni-site/veri-sina.mjs -v\`\n${son}`;
    fs.writeFileSync(belge, b.slice(0, i) + blok + b.slice(j + son.length));
  }
}
process.exit(gecen === sonuclar.length ? 0 : 1);
