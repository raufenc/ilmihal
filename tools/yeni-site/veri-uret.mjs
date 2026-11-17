#!/usr/bin/env node
/* ilmihal.org — veri katmanı üretici.
   Kökteki kaynak veri dosyalarını (data.js, texts/*.json, sozluk-data.js, sahislar.js, …) ve app.js
   içine gömülü sabitleri okur; veri/ klasörünü BAŞTAN üretir (önce siler).

   Çalıştırma:  node tools/yeni-site/veri-uret.mjs
   Belge:       tools/yeni-site/VERI.md   Sınama: node tools/yeni-site/veri-sina.mjs

   İlkeler
   - Kaynak dosyalara dokunulmaz; kitabın metni (madde metni, hüküm/âyet/hadîs/tanım/biyografi metinleri)
     hiçbir dönüşüme uğramadan aktarılır.
   - Deterministik: aynı girdi → bayt bayt aynı çıktı. Nesne anahtarları sabit sırayla yazılır;
     kimlik→değer haritalarının anahtarları sıralanır. Zaman damgası yok.
   - Parça adları yalnız ASCII küçük harf, rakam, tire. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const BURASI = path.dirname(fileURLToPath(import.meta.url));
export const KOK = path.resolve(BURASI, '../..');
export const CIKTI = path.join(KOK, 'veri');
const { yukle } = require('./incele/yukle.js');

/* ───────────────────────── Kaynakları okuma ───────────────────────── */

/** app.js içinden `var|const AD = …;` bildirimini (çok satırlı nesne/dizi dahil) çıkarıp değerlendirir. */
function appSabiti(appKod, ad) {
  const bas = new RegExp('^(?:var|const|let)\\s+' + ad + '\\s*=\\s*', 'm').exec(appKod);
  if (!bas) throw new Error('app.js içinde bulunamadı: ' + ad);
  const ilk = bas.index + bas[0].length;
  const ac = appKod[ilk];
  let son;
  if (ac === '{' || ac === '[') {
    // Dize ve yorumlara dikkat ederek eşleşen kapanışı bul
    let derinlik = 0, i = ilk, dize = null;
    for (; i < appKod.length; i++) {
      const c = appKod[i];
      if (dize) {
        if (c === '\\') { i++; continue; }
        if (c === dize) dize = null;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') { dize = c; continue; }
      if (c === '/' && appKod[i + 1] === '/') { i = appKod.indexOf('\n', i); continue; }
      if (c === '{' || c === '[') derinlik++;
      else if (c === '}' || c === ']') { derinlik--; if (derinlik === 0) break; }
    }
    son = i + 1;
  } else {
    son = appKod.indexOf(';', ilk);
  }
  const ifade = appKod.slice(ilk, son);
  return vm.runInNewContext('(' + ifade + ')', {});
}

export function kaynaklariOku() {
  const oku = f => yukle(f);
  const data = oku('data.js');
  const texts = {};
  for (const k of [1, 2, 3]) texts[k] = JSON.parse(fs.readFileSync(path.join(KOK, 'texts', `kisim${k}.json`), 'utf8'));
  const appKod = fs.readFileSync(path.join(KOK, 'app.js'), 'utf8');
  const ozet = oku('ozetler.js');
  const arama = oku('arama-sozluk.js');
  return {
    toc: data.tocData,
    tablolar: data.tablolarData,
    texts,
    sozluk: oku('sozluk-data.js').sozlukData,
    sahislar: oku('sahislar.js').sahislarData,
    hukumler: oku('hukumler-data.js').hukumlerData,
    ayetHadis: oku('ayet-hadis.js').ayetHadisData,
    tanimlar: oku('tanimlar.js').tanimlarData,
    crossref: oku('crossref.js').crossRefData,
    ozetler: ozet.maddeOzetleri,
    uzunluklar: ozet.maddeUzunluklari,
    rehberler: oku('rehberler.js').rehberlerData,
    gunun: oku('gunun-sorusu-data.js').gununSorusuData,
    audioMap: oku('audio-map.js').audioMap,
    esAnlamlilar: arama.aramaSynonyms,
    soruMadde: arama.soruMaddeMap,
    app: {
      sesAraligi: appSabiti(appKod, 'sesAraligiMap'),
      quiz: appSabiti(appKod, 'quizSorulari'),
      kisimAdlari: appSabiti(appKod, 'KISIM_ADLARI'),
      kisimRomen: appSabiti(appKod, 'KISIM_ROMEN'),
      kisimAciklama: appSabiti(appKod, 'KISIM_ACIKLAMA'),
      sozlukKoken: appSabiti(appKod, 'SOZLUK_KOKEN'),
      tabloKatLabels: appSabiti(appKod, 'tabloKatLabels'),
      tabloKatOrder: appSabiti(appKod, 'tabloKatOrder'),
      pdfUrl: appSabiti(appKod, 'PDF_URL'),
      audioBase: appSabiti(appKod, 'AUDIO_BASE'),
      sahifeSayisi: appSabiti(appKod, 'KITAP_SAHIFE_SAYISI'),
      trSuffixes: appSabiti(appKod, 'TR_SUFFIXES'),
    },
    okumaPlaniKod: fs.readFileSync(path.join(KOK, 'okuma-plani.js'), 'utf8'),
  };
}

/* ───────────────────────── Ortak yardımcılar ───────────────────────── */

const anahtar = (k, m) => `${k}-${m}`;
/** "K1/M43" → "1-43"; geçersizse null */
const kmAnahtar = s => { const m = /^K(\d)\/M(\d+)$/.exec(s || ''); return m ? anahtar(+m[1], +m[2]) : null; };
/** "1/43" → "1-43" */
const egikAnahtar = s => { const m = /^(\d)\/(\d+)$/.exec(s || ''); return m ? anahtar(+m[1], +m[2]) : null; };

function mektup(ref) {
  const m = /^(\d)—(\d+)$/.exec(ref || '');
  if (!ref) return null;
  if (!m) return { ref, kisa: 'Mektûb: ' + ref, uzun: 'Mektûb: ' + ref };
  const c = +m[1];
  const rabbani = c <= 3;
  const cild = rabbani ? c : c - 3;
  return {
    ref,
    kisa: (rabbani ? 'Mektûbât ' : 'Mektûbât-ı Ma\'sûmiyye ') + cild + '/' + m[2],
    uzun: (rabbani ? 'İmâm-ı Rabbânî hazretlerinin' : 'Muhammed Ma\'sûm-i Serhendî hazretlerinin') +
      ' (Mektûbât) kitâbı, ' + cild + '. cild, ' + m[2] + '. mektûb',
  };
}

/** Lügat ve harf fihristi için baş harf (app.js harfAnahtari ile aynı). */
const HARF_DUZELT = { 'Â': 'A', 'Î': 'İ', 'Û': 'U', 'Ô': 'O', 'Ê': 'E' };
export function harfAnahtari(metin) {
  const h = String(metin || '').trim().charAt(0).toLocaleUpperCase('tr');
  return HARF_DUZELT[h] || h;
}
const HARF_DOSYA = { 'Ç': 'cc', 'Ğ': 'gg', 'I': 'ii', 'İ': 'i', 'Ö': 'oo', 'Ş': 'ss', 'Ü': 'uu' };
const harfDosyaAdi = h => HARF_DOSYA[h] || h.toLowerCase();

/* ── Eski sitenin (app.js) lügat vurgusunun birebir kopyası ──
   Kaynak: app.js trLower, TR_SUFFIXES, findByStems, buildSozlukIndex, highlightWords, escapeHtml.
   Sınama (veri-sina.mjs) yeni veri.js'in sonucunu bununla karşılaştırır. */
export const trLower = s => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().replace(/̇/g, '');
export const escapeHtml = str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function eskiSozlukDizini(sozlukData) {
  const wordMap = new Map();
  const addKey = (key, entry) => { const k = trLower(key).trim(); if (k.length < 2) return; if (!wordMap.has(k)) wordMap.set(k, entry); };
  const altQueue = [];
  sozlukData.forEach(entry => {
    const kelime = entry.k;
    const parenMatch = kelime.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
    const main = parenMatch ? parenMatch[1].trim() : kelime.trim();
    const parens = parenMatch && parenMatch[2] ? parenMatch[2].trim() : null;
    if (!main.includes(' ') && !main.includes('-')) addKey(main, entry);
    const isCompoundEntry = main.includes(' ') || main.includes('-');
    if (!isCompoundEntry && parens) {
      parens.split(/[,;\/]/).forEach(p => {
        const pt = p.trim();
        if (pt.length >= 2 && !pt.includes('aleyhi') && !pt.includes(' ') && !pt.includes('-')) altQueue.push({ key: pt, entry });
      });
    }
  });
  altQueue.forEach(({ key, entry }) => addKey(key, entry));
  return wordMap;
}

export function eskiKokBul(lower, wordMap, ekler) {
  for (let i = ekler.length - 1; i >= 0; i--) {
    const suf = ekler[i];
    if (lower.length > suf.length + 2 && lower.endsWith(suf)) {
      const entry = wordMap.get(lower.slice(0, -suf.length));
      if (entry) return entry;
    }
  }
  return null;
}

/** app.js highlightWords: kaçışlı HTML döndürür; zor kelimeler <span data-id="i">…</span>. */
export function eskiVurgu(text, wordMap, ekler, bulunca) {
  const html = escapeHtml(text);
  return html.split(/(\s+|<[^>]+>)/).map(token => {
    if (/^\s+$/.test(token) || token.startsWith('<')) return token;
    const clean = token.replace(/^[.,;:!?()\[\]"'&;#\d]+|[.,;:!?()\[\]"'&;#\d]+$/g, '');
    if (clean.length < 2) return token;
    const lower = trLower(clean);
    const entry = wordMap.get(lower) || eskiKokBul(lower, wordMap, ekler);
    if (entry) {
      if (bulunca) bulunca(clean, entry);
      const prefix = token.substring(0, token.indexOf(clean));
      const suffix = token.substring(token.indexOf(clean) + clean.length);
      return prefix + `<span data-id="${entry.i}">${clean}</span>` + suffix;
    }
    return token;
  }).join('');
}

/** app.js maddeAraBaslikMi */
function araBaslikMi(par) {
  if (par.length > 160) return false;
  const harfler = par.replace(/“[^”]*”/g, '').replace(/[^A-Za-zÇĞİÖŞÜÂÎÛçğıöşüâîû]/g, '');
  if (harfler.length < 3) return false;
  let buyuk = 0;
  for (const ch of harfler) if (ch === ch.toLocaleUpperCase('tr') && ch !== ch.toLocaleLowerCase('tr')) buyuk++;
  return buyuk / harfler.length >= 0.7;
}

/** app.js maddeMetniHTML ile aynı paragraf ayrımı; lügat vurgusu alan paragraflar `vurgu:true`. */
export function eskiParagraflar(raw) {
  return String(raw || '').split(/\n{2,}/).map(par => {
    if (!par.trim()) return { tur: 'bos', par, vurgu: false };
    if (/^⟦şekil:(\d+)⟧$/.test(par)) return { tur: 'sekil', par, vurgu: false };
    if (/^⟦cedvel:(\d+)⟧\n([\s\S]*)$/.test(par)) return { tur: 'cedvel', par, vurgu: false };
    if (par.indexOf('\n') !== -1) {
      if (/\S {2,}\S/.test(par)) return { tur: 'tablo', par, vurgu: false };
      return { tur: 'siir', par, vurgu: true };
    }
    if (/^\[\d\] /.test(par)) return { tur: 'dipnot', par, vurgu: true };
    if (araBaslikMi(par)) return { tur: 'baslik', par, vurgu: true };
    return { tur: 'paragraf', par, vurgu: true };
  });
}

const unescapeHtml = s => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');

/** Kısa giriş: ilk paragrafın ilk ~160 harfi, kelime sınırında kesik (yalnız dizin önizlemesi içindir). */
function kisaGiris(metin, sinir = 160) {
  const ilk = String(metin || '').split('\n')[0];
  if (ilk.length <= sinir) return ilk;
  let kes = ilk.lastIndexOf(' ', sinir);
  if (kes < sinir * 0.6) kes = sinir;
  return ilk.slice(0, kes).replace(/[\s,;:.]+$/, '') + '…';
}

/* ───────────────────────── Üretim ───────────────────────── */

export function uret(K) {
  const dosyalar = new Map(); // yol (veri/ altında) → nesne
  const yaz = (yol, nesne) => {
    if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*\.json$/.test(yol)) throw new Error('Geçersiz parça adı: ' + yol);
    if (dosyalar.has(yol)) throw new Error('Aynı parça iki kez: ' + yol);
    dosyalar.set(yol, nesne);
  };
  const uyarilar = [];

  /* — Madde sırası ve sahîfe aralıkları — */
  const toc = K.toc;
  const tocAnahtar = new Map(toc.map((m, i) => [anahtar(m.kisim, m.madde_no), i]));
  const sahifedenMaddeler = s => toc.filter(m => m.sayfa_no <= s && s <= m.sayfa_bitis).map(m => anahtar(m.kisim, m.madde_no));

  /* — Lügat — */
  const ekler = K.app.trSuffixes;
  const wordMap = eskiSozlukDizini(K.sozluk);
  const sozlukById = new Map(K.sozluk.map(e => [e.i, e]));

  // Harf parçaları (en çok PARCA_SINIRI kayıt; büyük harfler -1, -2… diye bölünür)
  const PARCA_SINIRI = 700;
  const harfGrup = new Map();
  for (const e of K.sozluk) {
    const h = harfAnahtari(e.k);
    if (!harfGrup.has(h)) harfGrup.set(h, []);
    harfGrup.get(h).push(e);
  }
  const TR_SIRA = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'W', 'Y', 'Z'];
  const harfler = [...harfGrup.keys()].sort((a, b) => {
    const x = TR_SIRA.indexOf(a), y = TR_SIRA.indexOf(b);
    return (x < 0 ? 99 : x) - (y < 0 ? 99 : y) || (a < b ? -1 : a > b ? 1 : 0);
  });
  const lugatParcalari = [];
  const idParca = new Map();
  const kaynakSiraOf = new Map(K.sozluk.map((e, j) => [e, j]));
  const lugatKayit = e => ({
    id: e.i, kelime: e.k, osmanlica: e.o ?? null, anlam: e.a, misal: e.m ?? null,
    bakiniz: e.b ?? null, koken: e.d ?? null, kaynakSahife: e.s ?? null,
  });
  for (const h of harfler) {
    const liste = harfGrup.get(h);
    const n = Math.ceil(liste.length / PARCA_SINIRI);
    const boy = Math.ceil(liste.length / n);
    for (let p = 0; p < n; p++) {
      const dilim = liste.slice(p * boy, (p + 1) * boy);
      const ad = harfDosyaAdi(h) + (n > 1 ? '-' + (p + 1) : '');
      // kaynak sırasında bitişik kimlik aralıkları (kimlik → parça araması için)
      const araliklar = [];
      for (const e of dilim) {
        const son = araliklar[araliklar.length - 1];
        const kaynakSira = kaynakSiraOf.get(e);
        if (son && son.sonSira === kaynakSira - 1) { son[1] = e.i; son.sonSira = kaynakSira; } else { const a = [e.i, e.i]; a.sonSira = kaynakSira; araliklar.push(a); }
        idParca.set(e.i, ad);
      }
      lugatParcalari.push({ ad, harf: h, sayi: dilim.length, ilk: dilim[0].k, son: dilim[dilim.length - 1].k, araliklar: araliklar.map(a => [a[0], a[1]]) });
      yaz(`lugat/${ad}.json`, { parca: ad, harf: h, terimler: dilim.map(lugatKayit) });
    }
  }
  const kokenSayim = {};
  for (const e of K.sozluk) kokenSayim[e.d] = (kokenSayim[e.d] || 0) + 1;
  yaz('lugat/dizin.json', {
    sayi: K.sozluk.length,
    harfler: harfler.map(h => ({ harf: h, sayi: harfGrup.get(h).length, parcalar: lugatParcalari.filter(p => p.harf === h).map(p => p.ad) })),
    parcalar: lugatParcalari,
    kokenler: Object.fromEntries(Object.keys(kokenSayim).sort().map(k => [k, { ad: K.app.sozlukKoken[k] ?? null, sayi: kokenSayim[k] }])),
  });
  // Arama ve "Bkz." çözümü için bütün terimlerin hafif listesi
  yaz('lugat/terimler.json', { terimler: K.sozluk.map(e => ({ id: e.i, kelime: e.k })) });

  /* — Şahıslar — */
  const sahisMadde = new Map(); // "1-43" → [şahıs]
  for (const s of K.sahislar) for (const gm of s.gectigiMaddeler || []) {
    const a = egikAnahtar(gm);
    if (!a) { uyarilar.push(`şahıs ${s.slug}: çözülemeyen madde ${gm}`); continue; }
    if (!sahisMadde.has(a)) sahisMadde.set(a, []);
    sahisMadde.get(a).push(s);
  }
  const sahisHarf = new Map();
  for (const s of K.sahislar) {
    const h = s.slug[0];
    if (!/^[a-z0-9]$/.test(h)) throw new Error('slug ASCII harfle başlamıyor: ' + s.slug);
    if (!sahisHarf.has(h)) sahisHarf.set(h, []);
    sahisHarf.get(h).push(s);
  }
  const sahisKayit = s => ({
    slug: s.slug, isim: s.isim, unvan: s.unvan, kategori: s.kategori, no: s.no ?? null,
    biyografi: s.biyografi, kaynak: s.kaynak,
    maddeler: (s.gectigiMaddeler || []).map(egikAnahtar).filter(Boolean),
    sahifeler: s.sayfalar || [],
  });
  for (const h of [...sahisHarf.keys()].sort()) yaz(`sahislar/${h}.json`, { harf: h, sahislar: sahisHarf.get(h).map(sahisKayit) });
  const katSayim = {};
  for (const s of K.sahislar) katSayim[s.kategori] = (katSayim[s.kategori] || 0) + 1;
  yaz('sahislar/dizin.json', {
    sayi: K.sahislar.length,
    kategoriler: Object.fromEntries(Object.keys(katSayim).sort().map(k => [k, katSayim[k]])),
    sahislar: K.sahislar.map(s => ({
      slug: s.slug, isim: s.isim, unvan: s.unvan, kategori: s.kategori, no: s.no ?? null,
      giris: kisaGiris(s.biyografi), maddeSayisi: (s.gectigiMaddeler || []).length,
    })),
  });

  /* — Hükümler — */
  const hukumTurleri = ['farz', 'vacib', 'sunnet', 'mustehab', 'mubah', 'mekruh', 'haram'];
  const katmanlar = ['acik', 'tum'];
  for (const t of new Set(K.hukumler.map(h => h.tur))) if (!hukumTurleri.includes(t)) hukumTurleri.push(t);
  for (const k of new Set(K.hukumler.map(h => h.katman))) if (!katmanlar.includes(k)) katmanlar.push(k);
  const hukumSayilari = {};
  const hukumMadde = new Map();
  for (const t of hukumTurleri) {
    hukumSayilari[t] = {};
    for (const k of katmanlar) {
      const liste = K.hukumler.filter(h => h.tur === t && h.katman === k);
      hukumSayilari[t][k] = liste.length;
      yaz(`hukumler/${t}-${k}.json`, {
        tur: t, katman: k,
        hukumler: liste.map(h => {
          const madde = h.kisim != null && h.madde_no != null ? anahtar(h.kisim, h.madde_no) : null;
          const r = { id: h.id, metin: h.metin, sahife: h.sayfa, sahifeBitis: h.sayfa_bitis ?? null, altTur: h.alt_tur, baglam: h.baglam, madde };
          if (!madde) r.konu = h.konu; // maddeye bağlı olmayan kayıtta başlık başka yerden bulunamaz
          return r;
        }),
      });
    }
  }
  for (const h of K.hukumler) {
    if (h.kisim == null || h.madde_no == null) continue;
    const a = anahtar(h.kisim, h.madde_no);
    if (!hukumMadde.has(a)) hukumMadde.set(a, {});
    const o = hukumMadde.get(a);
    o[h.katman] = (o[h.katman] || 0) + 1;
  }
  yaz('hukumler/dizin.json', { sayi: K.hukumler.length, turler: hukumTurleri, katmanlar, sayilar: hukumSayilari });

  /* — Âyet / hadîs — */
  const ayetMadde = new Map(), hadisMadde = new Map();
  const ayetKayit = a => ({ metin: a.metin, sure: a.sure ?? null, ayetNo: a.ayet_no ?? null, sahife: a.sayfa, madde: a.kisim != null && a.madde != null ? anahtar(a.kisim, a.madde) : null });
  const hadisKayit = a => ({ metin: a.metin, kaynak: a.kaynak ?? null, sahife: a.sayfa, madde: a.kisim != null && a.madde != null ? anahtar(a.kisim, a.madde) : null });
  const ayetler = K.ayetHadis.ayetler.map(ayetKayit), hadisler = K.ayetHadis.hadisler.map(hadisKayit);
  for (const a of ayetler) if (a.madde) { if (!ayetMadde.has(a.madde)) ayetMadde.set(a.madde, []); ayetMadde.get(a.madde).push(a); }
  for (const a of hadisler) if (a.madde) { if (!hadisMadde.has(a.madde)) hadisMadde.set(a.madde, []); hadisMadde.get(a.madde).push(a); }
  yaz('ayet-hadis.json', { ayetler, hadisler });

  /* — Tanımlar (madde: sahîfeyi kapsayan; birden çok aday varsa cümlenin aynen geçtiği madde) — */
  const metinOf = a => { const [k, m] = a.split('-').map(Number); return K.texts[k][String(m)]; };
  yaz('tanimlar.json', {
    tanimlar: K.tanimlar.map(t => {
      const adaylar = sahifedenMaddeler(t.s);
      let madde = null;
      if (adaylar.length === 1) madde = adaylar[0];
      else if (adaylar.length > 1) madde = adaylar.find(a => metinOf(a).includes(t.c)) || adaylar[0];
      return { terim: t.t, cumle: t.c, sahife: t.s, madde };
    }),
  });

  /* — Tablolar — */
  const tabloMadde = new Map();
  const tabloDizin = [];
  for (const t of K.tablolar) {
    const ad = t.id.replace(/_/g, '-');
    const kaynak = kmAnahtar(t.kaynak_madde);
    if (kaynak) { if (!tabloMadde.has(kaynak)) tabloMadde.set(kaynak, []); tabloMadde.get(kaynak).push(t); }
    // Satırların bütün anahtarları (kolonlar listesinde olmayan sütunlar kaybolmasın)
    let kolonlarTam = null;
    if (Array.isArray(t.kolonlar)) {
      kolonlarTam = [...t.kolonlar];
      if (Array.isArray(t.veriler)) for (const r of t.veriler) for (const k of Object.keys(r || {})) if (!kolonlarTam.includes(k)) kolonlarTam.push(k);
    }
    const kayit = {
      id: t.id, parca: ad, baslik: t.baslik, tip: t.tip, kategori: t.kategori,
      kaynakMadde: kaynak, kaynakNotu: kaynak ? null : (t.kaynak_madde || null),
      sahife: t.sayfa_no ?? null, kaynakMetin: t.kaynak_metin ?? null,
      aciklama: t.aciklama ?? null,
      kolonlar: t.kolonlar ?? null, kolonlarTam,
      solBaslik: t.sol_baslik ?? null, sagBaslik: t.sag_baslik ?? null,
      // veriler/dallar kaynaktaki şekliyle (anahtar sırası korunur); K/M atıfları ayrıca çözülür
      veriler: t.veriler === undefined ? null : t.veriler,
      dallar: t.dallar ?? null,
    };
    if (t.tip === 'agac' && Array.isArray(t.veriler)) {
      kayit.maddeAtiflari = t.veriler.map(v => ({ id: v.id, maddeler: (v.maddeler || []).map(kmAnahtar) }));
    }
    yaz(`tablolar/${ad}.json`, kayit);
    tabloDizin.push({ id: t.id, parca: ad, baslik: t.baslik, tip: t.tip, kategori: t.kategori, kaynakMadde: kaynak, sahife: t.sayfa_no ?? null });
  }
  const tkSayim = {};
  for (const t of K.tablolar) tkSayim[t.kategori] = (tkSayim[t.kategori] || 0) + 1;
  yaz('tablolar/dizin.json', {
    sayi: K.tablolar.length,
    kategoriler: Object.keys(tkSayim).sort((a, b) => {
      const x = K.app.tabloKatOrder.indexOf(a), y = K.app.tabloKatOrder.indexOf(b);
      return (x < 0 ? 99 : x) - (y < 0 ? 99 : y) || (a < b ? -1 : 1);
    }).map(k => ({ ad: k, etiket: K.app.tabloKatLabels[k] ?? null, sayi: tkSayim[k] })),
    tablolar: tabloDizin,
  });
  // Konu haritası (fihristte konuya göre süzme için)
  const kh = K.tablolar.find(t => t.id === 'konu_haritasi');
  yaz('konular.json', { konular: (kh && Array.isArray(kh.veriler) ? kh.veriler : []).map(v => ({ id: v.id, baslik: v.baslik, maddeler: (v.maddeler || []).map(kmAnahtar).filter(Boolean) })) });

  /* — Maddeler — */
  const sesKok = K.app.audioBase;
  const fihristMaddeler = [];
  let lugatCakisma = 0;
  for (let i = 0; i < toc.length; i++) {
    const m = toc[i];
    const a = anahtar(m.kisim, m.madde_no);
    const egik = `${m.kisim}/${m.madde_no}`;
    const metin = K.texts[m.kisim][String(m.madde_no)];
    if (typeof metin !== 'string') throw new Error('Metin yok: ' + a);

    // Ses
    const aralik = Object.prototype.hasOwnProperty.call(K.app.sesAraligi, egik) ? K.app.sesAraligi[egik] : undefined;
    let ses = null;
    if (aralik !== null) {
      const bas = aralik ? aralik[0] : m.sayfa_no;
      const son = aralik ? aralik[2] : Math.max(m.sayfa_bitis || m.sayfa_no, m.pdf_sayfa_bitis || m.sayfa_no, m.sayfa_no);
      const parcalar = [];
      for (let p = bas; p <= son; p++) {
        const yol = K.audioMap[p];
        if (!yol) continue;
        parcalar.push({
          kayit: p, adres: sesKok + encodeURI(yol),
          bas: aralik && p === aralik[0] && aralik[1] > 0 ? aralik[1] : 0,
          son: aralik && p === aralik[2] ? (aralik[3] ?? null) : null,
        });
      }
      ses = { aralik: aralik ? [...aralik] : [bas, 0, son, null], aralikKaynagi: aralik ? 'harita' : 'sahife', parcalar };
      if (!parcalar.length) ses = null;
    }

    // Lügat: eski vurgunun bulduğu her kelime biçimi → terim kimliği
    const harita = new Map();
    const paragraflar = eskiParagraflar(metin);
    for (const p of paragraflar) {
      if (!p.vurgu) continue;
      eskiVurgu(p.par, wordMap, ekler, (clean, entry) => {
        const k = trLower(unescapeHtml(clean));
        if (harita.has(k) && harita.get(k) !== entry.i) lugatCakisma++;
        else harita.set(k, entry.i);
      });
    }
    const kelimeler = Object.fromEntries([...harita.keys()].sort().map(k => [k, harita.get(k)]));
    const terimIdleri = [...new Set(harita.values())].sort((x, y) => x - y);
    yaz(`lugat-madde/${a}.json`, {
      madde: a,
      kelimeler,
      terimler: Object.fromEntries(terimIdleri.map(id => {
        const e = sozlukById.get(id);
        return [String(id), { kelime: e.k, osmanlica: e.o ?? null, anlam: e.a, koken: e.d ?? null, bakiniz: e.b ?? null, misalVar: !!e.m, parca: idParca.get(id) }];
      })),
    });

    // Metindeki ⟦şekil:N⟧ / ⟦cedvel:N⟧ işaretleri
    const isaretler = [];
    paragraflar.forEach((p, sira) => {
      let x = /^⟦şekil:(\d+)⟧$/.exec(p.par);
      if (x) isaretler.push({ tur: 'sekil', sahife: +x[1], paragraf: sira, adres: K.app.pdfUrl + '#page=' + (+x[1]) });
      x = /^⟦cedvel:(\d+)⟧\n/.exec(p.par);
      if (x) isaretler.push({ tur: 'cedvel', sahife: +x[1], paragraf: sira, adres: K.app.pdfUrl + '#page=' + (+x[1]) });
    });

    const hs = hukumMadde.get(a) || {};
    const onceki = i > 0 ? anahtar(toc[i - 1].kisim, toc[i - 1].madde_no) : null;
    const sonraki = i < toc.length - 1 ? anahtar(toc[i + 1].kisim, toc[i + 1].madde_no) : null;
    const mk = mektup(m.mektup_ref);
    const ozet = K.ozetler[egik] ?? null;
    const uzunluk = K.uzunluklar[egik] ?? null;

    yaz(`madde/${a}.json`, {
      madde: a, kisim: m.kisim, no: m.madde_no, sira: i,
      baslik: m.baslik,
      sahife: [m.sayfa_no, m.sayfa_bitis],
      pdfSahife: [m.pdf_sayfa_baslangic, m.pdf_sayfa_bitis],
      mektup: mk,
      onceki, sonraki,
      uzunluk, ozet,
      metin,
      isaretler,
      atiflar: (K.crossref[egik] || []).map(r => ({ madde: anahtar(r.kisim, r.madde_no), neden: r.neden })),
      tablolar: (tabloMadde.get(a) || []).map(t => ({ id: t.id, parca: t.id.replace(/_/g, '-'), baslik: t.baslik, tip: t.tip, sahife: t.sayfa_no ?? null })),
      sahislar: (sahisMadde.get(a) || []).map(s => ({ slug: s.slug, isim: s.isim, unvan: s.unvan, kategori: s.kategori })),
      ayetler: (ayetMadde.get(a) || []).map(({ madde, ...r }) => r),
      hadisler: (hadisMadde.get(a) || []).map(({ madde, ...r }) => r),
      hukumSayisi: { acik: hs.acik || 0, tum: hs.tum || 0 },
      lugatSayisi: terimIdleri.length,
      ses,
    });

    fihristMaddeler.push({
      kisim: m.kisim, no: m.madde_no, baslik: m.baslik,
      sahife: [m.sayfa_no, m.sayfa_bitis],
      mektup: mk ? mk.kisa : null,
      uzunluk, ses: !!ses, ozet: !!ozet,
    });
  }
  if (lugatCakisma) uyarilar.push(`lügat: aynı kelime biçimi farklı terime gitti (${lugatCakisma}) — veri.js sonucu eskisinden sapabilir`);

  yaz('ozetler.json', { ozetler: Object.fromEntries(toc.map(m => [anahtar(m.kisim, m.madde_no), K.ozetler[`${m.kisim}/${m.madde_no}`] ?? null])) });

  const kisimlar = [1, 2, 3].map(k => ({
    no: k, ad: K.app.kisimAdlari[k], romen: K.app.kisimRomen[k], aciklama: K.app.kisimAciklama[k],
    maddeSayisi: toc.filter(m => m.kisim === k).length,
  }));
  yaz('fihrist.json', {
    kitap: { ad: 'Se’âdet-i Ebediyye', sahifeSayisi: K.app.sahifeSayisi, pdf: K.app.pdfUrl },
    // Dizinlerin kayıt sayıları: ana sayfa ve Fevâid tek istekte göstersin diye (koda sabit sayı yazılmaz)
    sayilar: {
      madde: toc.length, lugat: K.sozluk.length, sahis: K.sahislar.length,
      hukum: K.hukumler.length, hukumAcik: K.hukumler.filter(h => h.katman === 'acik').length,
      ayet: K.ayetHadis.ayetler.length, hadis: K.ayetHadis.hadisler.length,
      tablo: K.tablolar.length, tanim: K.tanimlar.length, sual: K.gunun.length, rehber: K.rehberler.length,
    },
    kisimlar,
    maddeler: fihristMaddeler,
  });

  /* — Rehberler, günün suâlleri, bilgi testi, arama, okuma planı — */
  yaz('rehberler.json', {
    rehberler: K.rehberler.map(r => ({
      id: r.id, baslik: r.baslik, aciklama: r.aciklama, ikon: r.ikon, renk: r.renk,
      bolumler: r.bolumler.map(b => ({ baslik: b.baslik, maddeler: b.maddeler.map(x => ({ madde: anahtar(x.kisim, x.maddeNo), not: x.not })) })),
    })),
  });
  yaz('gunun-sualleri.json', { sualler: K.gunun.map(g => ({ soru: g.soru, madde: anahtar(g.kisim, g.madde), baslik: g.baslik, resmi: !!g.resmi })) });
  // Bilgi testi: konu etiketleri eski index.html'deki düğmelerden (eski/index.html satır 653–659)
  const QUIZ_ETIKET = { iman: 'İman ve İtikat', namaz: 'Namaz', oruc: 'Oruç', zekat: 'Zekât', hac: 'Hac', ahlak: 'Ahlâk', karisik: 'Karışık' };
  yaz('test-sorulari.json', {
    konular: Object.keys(K.app.quiz).map(k => ({
      id: k, ad: QUIZ_ETIKET[k] ?? k, karisik: k === 'karisik',
      sorular: K.app.quiz[k].map(q => ({ soru: q.s, siklar: q.c, dogru: q.d, aciklama: q.a, madde: anahtar(q.m.k, q.m.m) })),
    })),
  });
  yaz('arama.json', {
    esAnlamlilar: Object.fromEntries(Object.keys(K.esAnlamlilar).sort().map(k => [k, K.esAnlamlilar[k]])),
    sorular: K.soruMadde.map(s => ({ ifadeler: s.soru, madde: anahtar(s.kisim, s.maddeNo), cevapOzet: s.cevapOzet })),
  });
  const dk = /DAKIKADA_HARF\s*=\s*(\d+)/.exec(K.okumaPlaniKod);
  const sureler = /SURELER\s*=\s*(\[[^\]]*\])/.exec(K.okumaPlaniKod);
  yaz('okuma-plani.json', {
    dakikadaHarf: dk ? +dk[1] : null,
    sureler: sureler ? vm.runInNewContext('(' + sureler[1] + ')', {}) : [],
    anahtarlar: { plan: 'ilmihal-hatim', bitirilen: 'ilmihal-bitirilen', okumaYeri: 'ilmihal-okuma-yeri', kutlama: 'ilmihal-hatim-kutlama' },
    // Sıra = fihrist sırası; uzunluk = maddeUzunluklari (ozetler.js) — fihrist.json'da da var
    uzunluklar: toc.map(m => K.uzunluklar[`${m.kisim}/${m.madde_no}`] ?? null),
  });

  return { dosyalar, uyarilar };
}

/* ───────────────────────── Yazma ve özet ───────────────────────── */

const kb = n => (n / 1024).toFixed(1).replace('.', ',') + ' KB';

function main() {
  const t0 = Date.now();
  const K = kaynaklariOku();
  const { dosyalar, uyarilar } = uret(K);

  if (path.basename(CIKTI) !== 'veri' || path.dirname(CIKTI) !== KOK) throw new Error('Beklenmeyen çıktı yolu: ' + CIKTI);
  // Klasör topluca silinip yeniden yazılmaz: proje bulut eşitlemeli bir klasörde durursa (iCloud) her dosyanın
  // " 2.json" kopyası oluşuyordu. Yalnız içeriği değişen dosya yazılır; üretilmeyen dosyalar sonda silinir.

  const yollar = [...dosyalar.keys()].sort();
  const icerik = new Map(yollar.map(y => [y, JSON.stringify(dosyalar.get(y))]));
  const karma = crypto.createHash('sha256');
  for (const y of yollar) { karma.update(y); karma.update('\0'); karma.update(icerik.get(y)); karma.update('\0'); }
  const surum = karma.digest('hex').slice(0, 12);
  icerik.set('surum.json', JSON.stringify({ surum, dosyaSayisi: yollar.length + 1 }));
  yollar.push('surum.json');

  let toplam = 0, toplamGz = 0;
  const boylar = [];
  for (const y of yollar) {
    const tam = path.join(CIKTI, y);
    fs.mkdirSync(path.dirname(tam), { recursive: true });
    const b = Buffer.from(icerik.get(y), 'utf8');
    let ayni = false;
    try { ayni = fs.readFileSync(tam).equals(b); } catch (e) { /* dosya yok */ }
    if (!ayni) fs.writeFileSync(tam, b);
    const gz = zlib.gzipSync(b, { level: 9 }).length;
    toplam += b.length; toplamGz += gz;
    boylar.push({ y, ham: b.length, gz });
  }
  // Bu çalıştırmanın üretmediği her şeyi kaldır (eski parça, eşitleme kopyası, boş klasör)
  const uretilen = new Set(yollar);
  (function temizle(dizin) {
    for (const f of fs.readdirSync(dizin, { withFileTypes: true })) {
      const tam = path.join(dizin, f.name);
      if (f.isDirectory()) { temizle(tam); if (!fs.readdirSync(tam).length) fs.rmdirSync(tam); }
      else if (!uretilen.has(path.relative(CIKTI, tam).split(path.sep).join('/'))) fs.unlinkSync(tam);
    }
  })(CIKTI);
  const fih = boylar.find(b => b.y === 'fihrist.json');
  console.log(`veri/ üretildi (${Date.now() - t0} ms) — sürüm ${surum}`);
  console.log(`  dosya: ${yollar.length}   toplam: ${kb(toplam)}   gzip: ${kb(toplamGz)}`);
  console.log(`  fihrist.json: ${kb(fih.ham)} (gzip ${kb(fih.gz)})`);
  const gruplar = {};
  for (const b of boylar) { const g = b.y.includes('/') ? b.y.split('/')[0] + '/' : b.y; (gruplar[g] ||= { n: 0, ham: 0, gz: 0 }); gruplar[g].n++; gruplar[g].ham += b.ham; gruplar[g].gz += b.gz; }
  console.log('  Gruplar:');
  for (const [g, v] of Object.entries(gruplar).sort((a, b) => b[1].gz - a[1].gz)) console.log(`    ${g.padEnd(22)} ${String(v.n).padStart(4)} dosya  ${kb(v.ham).padStart(11)}  gzip ${kb(v.gz).padStart(10)}`);
  console.log('  En büyük 10 parça (gzip):');
  for (const b of [...boylar].sort((a, b) => b.gz - a.gz || (a.y < b.y ? -1 : 1)).slice(0, 10)) console.log(`    ${b.y.padEnd(30)} ${kb(b.ham).padStart(11)}  gzip ${kb(b.gz).padStart(10)}`);
  const madde = boylar.filter(b => b.y.startsWith('madde/')).map(b => b.gz).sort((a, b) => a - b);
  console.log(`  madde/ gzip: en az ${kb(madde[0])}, medyan ${kb(madde[madde.length >> 1])}, en çok ${kb(madde[madde.length - 1])}`);
  if (uyarilar.length) { console.log('  UYARILAR:'); for (const u of uyarilar) console.log('    - ' + u); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
