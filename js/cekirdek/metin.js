/* Metin yardımcıları: arama için normalleştirme, yazım varyantları, vurgu aralıkları ve kesit.
   - Saf ES modülü; DOM'a dokunmaz, HTML üretmez. Yalnız metin ve [bas, son) aralıkları döndürür;
     <mark> kurmak arayüzün işidir (metni parçalayıp DOM düğümleriyle; bkz. tools/yeni-site/ARAMA.md).
   - Hem ana iş parçacığında hem Web Worker'da (js/isci/arama-isci.js) hem node'da çalışır.
   - Eski Safari'yi düşürmemek için bu dosyada geriye bakan düzenli ifade KULLANILMAZ.

   Normalleştirilmiş ("düz") metnin alfabesi:
     küçük harf a–z (şapkasız, Türkçe harfler katlanmış), rakam, öteki yazıların küçük harfleri,
     ' ' (her türlü ayırıcı tek boşluğa iner) ve '-' (yalnız iki harf/rakam ARASINDAKİ tire korunur:
     "Ehl-i sünnet" → "ehl-i sunnet", "Dâr-ül-harb" → "dar-ul-harb").
   Kesme ve hemze/ayn işaretleri iki harf arasında ise silinir (harfler birleşir):
     "Kur’ân" → "kuran", "bid’at" → "bidat", "a’zam" → "azam", "Allah'ın" → "allahin".
   Kelime başı: metnin başı ya da ' ' veya '-' sonrası. */

// ---------------------------------------------------------------- karakter sınıfları

const HARF = 1;      // çıktıya bir harf yazar
const AYIRICI = 2;   // boşluğa iner (art arda gelenler tek boşluk)
const SIL = 3;       // iz bırakmaz (birleşik aksan, sıfır genişlikli, yumuşak tire)
const KESME = 4;     // iki harf arasında silinir, değilse ayırıcı
const TIRE = 5;      // iki harf arasında '-' olarak kalır, değilse ayırıcı

const OZEL = {
  'â': 'a', 'Â': 'a', 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i', 'i': 'i',
  'î': 'i', 'Î': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u', 'û': 'u', 'Û': 'u',
  'ê': 'e', 'Ê': 'e', 'ô': 'o', 'Ô': 'o',
};
const KESMELER = "'\u2019\u2018\u02BC\u02BE\u02BF\u00B4\u0060";   // kesme, hemze/ayn işaretleri
const TIRELER = '-\u2010\u2011';
const HARF_RE = /[\p{L}\p{N}]/u;
const SILINEN_RE = /[\p{Mn}\p{Me}\u00AD\u200B-\u200D\u2060\uFEFF]/u;

const sinif = new Uint8Array(65536);      // 0 = henüz hesaplanmadı
const cikti = new Array(65536);           // HARF için tek karakterlik çıktı

function sinifHesapla(kod) {
  const ch = String.fromCharCode(kod);
  let s, c = '';
  if (kod === 0xAD) s = SIL;                                   // yumuşak tire görünmez
  else if (KESMELER.includes(ch)) s = KESME;
  else if (TIRELER.includes(ch)) s = TIRE;
  else if (kod >= 0xD800 && kod <= 0xDFFF) s = AYIRICI;        // BMP dışı (emoji vb.) aranmaz
  else if (OZEL[ch]) { s = HARF; c = OZEL[ch]; }
  else if (SILINEN_RE.test(ch)) s = SIL;
  else if (HARF_RE.test(ch)) {
    s = HARF;
    let k = ch.toLowerCase();
    if (k.length !== 1) k = ch;
    const ayrik = k.normalize('NFD');                          // é → e, ä → a
    c = ayrik.length > 1 && SILINEN_RE.test(ayrik[1]) ? ayrik[0] : k;
    if (c.length !== 1) c = k;
  } else s = AYIRICI;
  sinif[kod] = s;
  cikti[kod] = c;
  return s;
}

function sinifi(kod) {
  const s = sinif[kod];
  return s === 0 ? sinifHesapla(kod) : s;
}

/** Sonraki anlamlı (SIL olmayan) karakterin harf olup olmadığı. */
function sonrakiHarfMi(metin, i) {
  for (let j = i + 1; j < metin.length; j++) {
    const s = sinifi(metin.charCodeAt(j));
    if (s === SIL) continue;
    return s === HARF;
  }
  return false;
}

// ---------------------------------------------------------------- normalleştirme

function normallestir(metin, eslemeli) {
  metin = metin == null ? '' : String(metin);
  const n = metin.length;
  const kodlar = new Uint16Array(n);              // çıktı hiçbir zaman girdiden uzun olmaz
  const konum = eslemeli ? new Int32Array(n) : null;
  let u = 0;
  let oncekiHarf = false;       // son yazılan anlamlı şey harf mi (aradaki SIL'ler sayılmaz)
  let bekleyenAyirici = -1;     // yazılmayı bekleyen boşluğun asıl konumu
  for (let i = 0; i < n; i++) {
    const kod = metin.charCodeAt(i);
    let s = sinifi(kod);
    if (s === SIL) continue;
    if (s === KESME) {
      if (oncekiHarf && sonrakiHarfMi(metin, i)) continue;     // harfleri birleştir
      s = AYIRICI;
    } else if (s === TIRE) {
      if (oncekiHarf && sonrakiHarfMi(metin, i)) {
        if (eslemeli) konum[u] = i;
        kodlar[u++] = 45;                                       // '-'
        oncekiHarf = false;
        continue;
      }
      s = AYIRICI;
    }
    if (s === AYIRICI) {
      if (bekleyenAyirici < 0) bekleyenAyirici = i;
      oncekiHarf = false;
      continue;
    }
    // HARF
    if (bekleyenAyirici >= 0) {
      if (u > 0) {
        if (kodlar[u - 1] === 45) u--;                          // "x- y" olmaz (koruma)
        if (eslemeli) konum[u] = bekleyenAyirici;
        kodlar[u++] = 32;
      }
      bekleyenAyirici = -1;
    }
    if (eslemeli) konum[u] = i;
    kodlar[u++] = cikti[kod].charCodeAt(0);
    oncekiHarf = true;
  }
  let duz = '';
  for (let i = 0; i < u; i += 8192) duz += String.fromCharCode.apply(null, kodlar.subarray(i, Math.min(u, i + 8192)));
  return eslemeli ? { duz, konum: konum.slice(0, u) } : duz;
}

/** Aramada eşleştirme için normalleştirir (bkz. dosya başı). */
export function duzle(metin) {
  return normallestir(metin, false);
}

/** duzle() + eşleme: konum[i] = düz metindeki i. karakterin ASIL metindeki indeksi. */
export function duzleEslemeli(metin) {
  return normallestir(metin, true);
}

/** Düz metindeki [s, e) aralığını asıl metindeki [bas, son) aralığına çevirir.
    Son harfin ardındaki birleşik aksanlar da aralığa katılır. */
export function asilAralik(metin, konum, s, e) {
  const bas = konum[s];
  let son = konum[e - 1] + 1;
  while (son < metin.length && sinifi(metin.charCodeAt(son)) === SIL) son++;
  return [bas, son];
}

/** Sözlük anahtarı biçimi: tire ve tek harflik eski parçalar birleşir.
    "ehl i sunnet" / "ehl-i sünnet" / "ehli sünnet" → "ehli sunnet";
    "imam i a zam" → "imami azam"; "daru l islam" → "darul islam". */
export function anahtarBicimi(metin) {
  const parcalar = duzle(metin).replace(/-/g, ' ').split(' ').filter(Boolean);
  const sonuc = [];
  let ekle = '';
  for (const p of parcalar) {
    if (p.length === 1 && (p === 'a' || p === 'e')) { ekle += p; continue; }   // a’zam, e’uzü
    if (p.length === 1 && sonuc.length) { sonuc[sonuc.length - 1] += ekle + p; ekle = ''; continue; }
    sonuc.push(ekle + p);
    ekle = '';
  }
  if (ekle) sonuc.push(ekle);
  return sonuc.join(' ');
}

// ---------------------------------------------------------------- yazım varyantları

/** Bu kitaba özgü elle yazılmış varyantlar (eski app.js OTTOMAN_MANUAL, aynen). */
export const OSMANLICA_ELLE = {
  'namaz': 'nemaz', 'niyet': 'niyyet', 'vasiyet': 'vasiyyet', 'tasavvuf': 'tesavvuf', 'mucize': 'mucize',
  'salavat': 'salat', 'tovbe': 'tevbe', 'zekat': 'zekat', 'oruc': 'savm', 'hac': 'hacc', 'abdest': 'abdest',
  'gusul': 'gusl', 'secde': 'sucud', 'ruku': 'ruku', 'peygamber': 'resulullah', 'kuran': 'kuran',
  'hadis': 'hadis', 'sunnet': 'sunnet', 'mezhep': 'mezheb', 'bidat': 'bidat', 'tevekkul': 'tevekkul',
  'sabir': 'sabr', 'sukur': 'sukr', 'nisap': 'nisab', 'faiz': 'riba', 'mehr': 'mehir', 'cennet': 'cennet',
  'cehennem': 'cehennem', 'kible': 'kible', 'ihram': 'ihram', 'nikah': 'nikah', 'talak': 'talak',
  'kurban': 'kurban', 'fidye': 'fidye', 'keffaret': 'keffaret', 'sahabi': 'eshab', 'evliya': 'evliya',
};

const UNSUZ = new Set('bcdfghjklmnpqrstvwxyz');
const UNLU = 'aeiou';
const CEKIM_EKLERI = ['a', 'e', 'i', 'u', 'in', 'a', 'e', 'dan', 'den', 'da', 'de', 'lar', 'ler', 'lari', 'leri'];

/** Eski wordVariants'ın birebir taşıması (en çok 15). Girdi düz (normalleştirilmiş) tek kelimedir. */
function eskiVaryantlar(word) {
  const vars = new Set([word]);
  if (OSMANLICA_ELLE[word]) vars.add(OSMANLICA_ELLE[word]);
  for (const [mod, ott] of Object.entries(OSMANLICA_ELLE)) if (word === ott) vars.add(mod);
  for (const [mod, ott] of Object.entries(OSMANLICA_ELLE)) {
    if (word.length > mod.length && word.startsWith(mod)) vars.add(ott + word.slice(mod.length));
    if (word.length > ott.length && word.startsWith(ott)) vars.add(mod + word.slice(ott.length));
  }
  if (word.length >= 4) {
    if (word.endsWith('p')) vars.add(word.slice(0, -1) + 'b');
    if (word.endsWith('b')) vars.add(word.slice(0, -1) + 'p');
    if (word.endsWith('t')) vars.add(word.slice(0, -1) + 'd');
    if (word.endsWith('d')) vars.add(word.slice(0, -1) + 't');
    for (const suf of CEKIM_EKLERI) {
      const kok = word.slice(0, -suf.length - 1);
      if (word.endsWith('p' + suf)) vars.add(kok + 'b' + suf);
      if (word.endsWith('b' + suf)) vars.add(kok + 'p' + suf);
      if (word.endsWith('t' + suf)) vars.add(kok + 'd' + suf);
      if (word.endsWith('d' + suf)) vars.add(kok + 't' + suf);
    }
  }
  const son = word[word.length - 1];
  if (!['p', 'b', 't', 'd'].includes(son)) {
    const onceki = word[word.length - 2];
    if (UNSUZ.has(son) && UNSUZ.has(onceki)) {
      let sonUnlu = 'i';
      for (let i = word.length - 3; i >= 0; i--) if (UNLU.includes(word[i])) { sonUnlu = word[i]; break; }
      const ara = { a: 'u', e: 'i', i: 'i', o: 'u', u: 'u' }[sonUnlu] || 'i';
      vars.add(word.slice(0, -1) + ara + son);
    }
    if (word.length >= 5 && 'ui'.includes(onceki) && UNSUZ.has(son)) {
      const kisa = word.slice(0, -2) + son;
      if (kisa.length >= 3 && UNSUZ.has(kisa[kisa.length - 2])) vars.add(kisa);
    }
  }
  const tekil = word.replace(/(.)\1/g, '$1');                         // şedde: niyyet → niyet
  if (tekil !== word) vars.add(tekil);
  let ciftY = '';                                                     // tek y → yy (önünde ve ardında y olmayan)
  for (let i = 0; i < word.length; i++) {
    const tekY = word[i] === 'y' && word[i - 1] !== 'y' && word[i + 1] !== 'y';
    ciftY += tekY ? 'yy' : word[i];
  }
  if (ciftY !== word) vars.add(ciftY);
  if (word.length >= 5) {                                             // vakitleri → vaktleri
    for (let pos = 1; pos < word.length - 1; pos++) {
      if ('iu'.includes(word[pos]) && UNSUZ.has(word[pos - 1]) && UNSUZ.has(word[pos + 1])) {
        const dusmus = word.slice(0, pos) + word.slice(pos + 1);
        if (dusmus.length >= 4) vars.add(dusmus);
      }
    }
  }
  const sonuc = Array.from(vars);
  return sonuc.length > 15 ? sonuc.slice(0, 15) : sonuc;
}

/** Tireli yazım varyantları (yeni): "ehli" → "ehl-i", "darul" → "dar-ul"; "ehl-i" → "ehli". */
function tireVaryantlari(w) {
  if (w.includes('-')) return [w.replace(/-/g, '')];
  const v = [];
  if (w.length >= 4 && /[iu]$/.test(w) && UNSUZ.has(w[w.length - 2])) v.push(w.slice(0, -1) + '-' + w.slice(-1));
  if (w.length >= 5 && /u[ldsntrz]$/.test(w) && UNSUZ.has(w[w.length - 3])) v.push(w.slice(0, -2) + '-' + w.slice(-2));   // -ül-, -üd-, -üs-…
  return v;
}

/** Eş anlamlı tablosunu (arama-sozluk.js aramaSynonyms) anahtar biçimine çevirir. */
export function esAnlamTablosu(ham) {
  const tablo = new Map();
  for (const [anahtar, degerler] of Object.entries(ham || {})) {
    const a = anahtarBicimi(anahtar);
    if (!a) continue;
    const liste = tablo.get(a) || [];
    for (const d of degerler || []) {
      const b = anahtarBicimi(d);
      if (!b || b === a || liste.includes(b)) continue;
      if (!b.includes(' ') && a.startsWith(b)) continue;             // "kuran" → "kur" gibi kesik artıklar gürültü yapar
      liste.push(b);
    }
    tablo.set(a, liste);
  }
  return tablo;
}

function esAnlamlilarAl(tablo, anahtar) {
  if (!tablo) return [];
  if (tablo instanceof Map) return tablo.get(anahtar) || [];
  return esAnlamlilarAl(esAnlamTablosu(tablo), anahtar);
}

/** Tek kelimenin aranacak bütün yazımları (düz biçimde): kendisi, eski Osmanlıca yazım varyantları (en çok 15),
    tireli yazımlar, tek ünlülü eki atılmış kök ve (verildiyse) tek kelimelik eş anlamlılar. */
export function varyantlar(kelime, { esAnlamlilar = null } = {}) {
  const w = duzle(kelime).replace(/ /g, '');
  if (!w) return [];
  const birlesik = w.replace(/-/g, '');
  const kume = new Set([w]);
  for (const v of eskiVaryantlar(birlesik)) kume.add(v);
  for (const v of tireVaryantlari(w)) kume.add(v);
  // Tek ünlülü ek (iyelik/yönelme) atılmış kök: "vakti" → "vakt" (kitap "vaktleri"), "namaza" → "namaz".
  if (birlesik.length >= 5 && /[aeiu]$/.test(birlesik) && UNSUZ.has(birlesik[birlesik.length - 2])) kume.add(birlesik.slice(0, -1));
  for (const e of esAnlamlilarAl(esAnlamlilar, birlesik)) if (!e.includes(' ')) kume.add(e);
  return Array.from(kume).filter(v => v.length >= 2);
}

// ---------------------------------------------------------------- sorgu çözümleme

/** Eski _searchStopWords (aynen). */
export const DURAK_KELIMELERI = new Set(['bir', 'bu', 've', 'de', 'da', 'ile', 'icin', 'ne', 'nasil', 'nedir', 'nelerdir', 'kac', 'kadar', 'hangi', 'kimlere', 'mi', 'mu', 'var', 'yok', 'olan', 'olarak', 'ise', 'gibi', 'daha', 'en', 'cok', 'az', 'her', 'su', 'ben', 'sen', 'biz', 'siz', 'onlar', 'ki', 'ama', 'fakat', 'veya', 'ya', 'hem', 'neden', 'nicin', 'acaba', 'dir', 'olur', 'eder', 'ler', 'lar', 'dan', 'den', 'tan', 'ten', 'nerede', 'yoksa', 'demektir', 'demek', 'olmak', 'etmek', 'yapmak', 'yapilir', 'edilir', 'alinir', 'verilir', 'olunur', 'neler', 'seyler', 'hangileri']);

const TIRNAK_RE = /["“”«»„]([^"“”«»„]+)["“”«»„]?/g;

function regexKacir(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Bir terimin (kelime ya da ifade) arama deseni. Eşleşme dizisinin 1. grubu eşleşen kısımdır;
    kelime başını sağlamak için önündeki ayırıcı da tüketilir (geriye bakış yok). */
function desenKur(alternatifler) {
  const parcalar = alternatifler.map(slotlar => slotlar.map((vars, i) => {
    const sirali = [...vars].sort((a, b) => b.length - a.length).map(regexKacir);
    const tam = i < slotlar.length - 1 || vars.every(v => v.length <= 2);   // iç kelime ya da çok kısa: tam kelime
    return '(?:' + sirali.join('|') + ')' + (tam && i === slotlar.length - 1 ? '(?=[ \\-]|$)' : '');
  }).join('[ \\-]'));
  parcalar.sort((a, b) => b.length - a.length);
  return '(?:^|[ \\-])(' + parcalar.join('|') + ')';
}

function terimKur(tur, gosterim, alternatifler, yazimAlternatifleri = alternatifler) {
  // yazim: yalnız kullanıcının sözü ve yazım varyantları (eş anlamlılar hariç) — sıralamada "harfiyen" eşleşme için
  const yazim = yazimAlternatifleri ? { gosterim, desen: desenKur(yazimAlternatifleri) } : null;
  return { tur, gosterim, alternatifler, desen: desenKur(alternatifler), yazim };
}

function kelimeTerimi(w, esAnlamlilar) {
  const alternatifler = [[varyantlar(w, { esAnlamlilar })]];          // tek kelimelik tek alternatif
  for (const e of esAnlamlilarAl(esAnlamlilar, w.replace(/-/g, ''))) {
    if (e.includes(' ')) alternatifler.push(e.split(' ').map(p => varyantlar(p)));   // çok kelimeli eş anlamlı
  }
  return terimKur('kelime', w, alternatifler, [[varyantlar(w)]]);
}

/** Kullanıcı sorgusunu çözer.
    Dönüş: { ham, duz, kelimeler, secenekler: [[terim…]…] } — her seçenek bir VE grubudur, seçenekler
    VEYA ile bağlanır (1. seçenek kullanıcının sözleri; ötekiler tüm ifadenin eş anlamlıları).
    Terim: { tur: 'kelime'|'ifade'|'esanlam', gosterim, alternatifler: [[[yazım…] her kelime için]…], desen,
             yazim: { desen } | null (eş anlamlılar çıkarılmış desen) } */
export function sorguCoz(sorgu, { esAnlamlilar = null, durakAt = true } = {}) {
  if (sorgu && typeof sorgu === 'object' && sorgu.secenekler) return sorgu;
  const ham = String(sorgu == null ? '' : sorgu).slice(0, 300);
  const tablo = esAnlamlilar && !(esAnlamlilar instanceof Map) ? esAnlamTablosu(esAnlamlilar) : esAnlamlilar;
  const terimler = [];
  const ifadeler = [];
  const kalan = ham.replace(TIRNAK_RE, (_, ic) => { ifadeler.push(ic); return ' '; });
  for (const ic of ifadeler) {
    const kelimeler = duzle(ic).split(' ').filter(Boolean);
    if (!kelimeler.length) continue;
    if (kelimeler.length === 1) { terimler.push(kelimeTerimi(kelimeler[0], tablo)); continue; }
    terimler.push(terimKur('ifade', kelimeler.join(' '), [kelimeler.map(k => varyantlar(k))]));
  }
  const tumKelimeler = duzle(kalan).split(' ').filter(w => w.replace(/-/g, '').length >= 2);
  const anlamli = durakAt ? tumKelimeler.filter(w => !DURAK_KELIMELERI.has(w)) : tumKelimeler;
  const kelimeler = (anlamli.length || ifadeler.length) ? anlamli : tumKelimeler;
  for (const w of kelimeler) terimler.push(kelimeTerimi(w, tablo));
  const secenekler = terimler.length ? [terimler] : [];
  if (tablo && kelimeler.length > 1 && !ifadeler.length) {          // "namaz kılmak" gibi ifade eş anlamlıları
    const es = esAnlamlilarAl(tablo, anahtarBicimi(kelimeler.join(' ')));
    if (es.length) {
      const alt = es.map(e => e.split(' ').map(p => varyantlar(p)));
      secenekler.push([terimKur('esanlam', kelimeler.join(' '), alt, null)]);
    }
  }
  return { ham, duz: duzle(ham), kelimeler, ifadeler, secenekler };
}

/** Düz metinde bir terimin bütün eşleşmeleri: [[s, e, k]…] (düz konumlarıyla; e kelime sonuna uzatılmış,
    k desenin bittiği yer — e ile k arası kelimenin aldığı ektir). */
export function terimEslesmeleri(duz, terim, sinir = Infinity) {
  const re = terim.re || (terim.re = new RegExp(terim.desen, 'g'));
  re.lastIndex = 0;
  const sonuc = [];
  let m;
  while ((m = re.exec(duz)) && sonuc.length < sinir) {
    const s = m.index + m[0].length - m[1].length;
    let e = s + m[1].length;
    while (e < duz.length) {
      const c = duz.charCodeAt(e);
      if (c === 32 || c === 45 || c === 1) break;
      e++;
    }
    sonuc.push([s, e, s + m[1].length]);   // 3. öğe: kelime sonuna uzatmadan önceki bitiş (ek ağırlığı için)
    re.lastIndex = e;                     // kelimenin kalanını atla; sonraki eşleşme e'deki ayırıcıyla başlar
  }
  return sonuc;
}

/** Sıralar ve çakışan/bitişik aralıkları birleştirir. */
export function araliklariBirlestir(araliklar) {
  const sirali = araliklar.filter(a => a[1] > a[0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const sonuc = [];
  for (const [b, s] of sirali) {
    const son = sonuc[sonuc.length - 1];
    if (son && b <= son[1]) son[1] = Math.max(son[1], s);
    else sonuc.push([b, s]);
  }
  return sonuc;
}

/** Sorgunun asıl metindeki vurgu aralıkları: [[bas, son]…], sıralı ve çakışmasız.
    sorgu: dizgi ya da sorguCoz() sonucu. eslemeli: aynı metnin duzleEslemeli() sonucu (varsa yeniden hesaplanmaz). */
export function vurguAraliklari(metin, sorgu, { esAnlamlilar = null, eslemeli = null, sinir = 5000 } = {}) {
  metin = metin == null ? '' : String(metin);
  const cozum = sorguCoz(sorgu, { esAnlamlilar });
  if (!cozum.secenekler.length || !metin) return [];
  const { duz, konum } = eslemeli || duzleEslemeli(metin);
  const araliklar = [];
  for (const secenek of cozum.secenekler) {
    for (const terim of secenek) {
      for (const [s, e] of terimEslesmeleri(duz, terim, sinir)) araliklar.push(asilAralik(metin, konum, s, e));
    }
  }
  return araliklariBirlestir(araliklar);
}

// ---------------------------------------------------------------- kesit

function bosluk(c) { return c === ' ' || c === '\n' || c === '\t' || c === '\u00A0'; }
const CUMLE_SONU = '.!?:;';

/** Bir aralığın çevresinden kısa alıntı. Kelime ortasından kesmez; mümkünse cümle başına/sonuna yaslanır.
    sec: { once = 70, sonra = 150, vurgular = [aralik] } — vurgular ASIL metindeki aralıklardır.
    Dönüş: { metin, vurgular: [[bas, son]…] (alıntı içinde), bas, son (asıl metinde), basKesik, sonKesik }
    Alıntıdaki satır sonları boşluğa çevrilir (1'e 1, konumlar kaymaz). */
export function kesit(metin, aralik, { once = 70, sonra = 150, vurgular = null } = {}) {
  metin = metin == null ? '' : String(metin);
  const n = metin.length;
  const [ab, as] = aralik || [0, 0];
  // Başlangıç: önce cümle başı ara (ab - once - 40 .. ab), yoksa kelime sınırı.
  let bas = Math.max(0, ab - once);
  if (bas > 0) {
    let cumle = -1;
    for (let i = ab - 1; i >= Math.max(0, ab - once - 40); i--) {
      if (metin[i] === '\n' || (bosluk(metin[i]) && CUMLE_SONU.includes(metin[i - 1]))) { cumle = i + 1; break; }
    }
    if (cumle >= 0) bas = cumle;
    else {
      while (bas > 0 && bas < ab && !bosluk(metin[bas - 1])) bas++;            // kelime başına ilerle
      if (bas >= ab) bas = Math.max(0, ab);
    }
  }
  while (bas < ab && bosluk(metin[bas])) bas++;
  // Bitiş: cümle sonu (as + sonra .. +40), yoksa kelime sınırı.
  let son = Math.min(n, as + sonra);
  if (son < n) {
    let cumle = -1;
    const ust = Math.min(n, as + sonra + 40);
    for (let i = Math.max(as, as + Math.floor(sonra / 2)); i < ust; i++) {
      if (metin[i] === '\n' || (CUMLE_SONU.includes(metin[i]) && (i + 1 >= n || bosluk(metin[i + 1])))) {
        cumle = metin[i] === '\n' ? i : i + 1;
        break;
      }
    }
    if (cumle >= 0) son = cumle;
    else {
      while (son > as && son < n && !bosluk(metin[son])) son--;               // kelime sonuna geri çekil
      if (son <= as) son = Math.min(n, as);
    }
  }
  while (son > bas && bosluk(metin[son - 1])) son--;
  const parca = metin.slice(bas, son).replace(/[\n\t]/g, ' ');
  const kaynak = vurgular || [aralik];
  const ic = [];
  for (const [vb, vs] of kaynak) {
    const b = Math.max(vb, bas), s = Math.min(vs, son);
    if (s > b) ic.push([b - bas, s - bas]);
  }
  return { metin: parca, vurgular: araliklariBirlestir(ic), bas, son, basKesik: bas > 0, sonKesik: son < n };
}

/** Levenshtein uzaklığı (sınır aşılınca sinir+1 döner). */
export function uzaklik(a, b, sinir = 2) {
  if (Math.abs(a.length - b.length) > sinir) return sinir + 1;
  let onceki = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) onceki[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const simdi = [i];
    let enAz = i;
    for (let j = 1; j <= b.length; j++) {
      simdi[j] = Math.min(onceki[j] + 1, simdi[j - 1] + 1, onceki[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (simdi[j] < enAz) enAz = simdi[j];
    }
    if (enAz > sinir) return sinir + 1;
    onceki = simdi;
  }
  return onceki[b.length];
}
