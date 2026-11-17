/* Veri katmanı: veri/ altındaki JSON parçalarını tembel yükler ve bellekte saklar.
   Tek giriş:  import { veri, maddeKimlik } from '/js/cekirdek/veri.js';
   Başvuru:    tools/yeni-site/VERI.md   ·   Parçaları üreten: tools/yeni-site/veri-uret.mjs

   - Aynı parça iki kez istenmez; eşzamanlı çağrılar tek isteği paylaşır.
   - Başarısız istek bellekte kalmaz; sonraki çağrı yeniden dener.
   - Her yükleyici son bağımsız değişken olarak { sinyal } (AbortSignal) alabilir. İptal yalnız o çağıranın
     sözünü düşürür; paylaşılan istek diğer bekleyenler için sürer.
   - Küresel değişken tanımlamaz, DOM'a dokunmaz. */

/* ───────────── Ayarlar ───────────── */
const ayar = {
  kok: '/veri/',          // parçaların adresi (sonda / olmalı)
  zamanAsimi: 20000,      // tek deneme için ms (gövde okuma dahil)
  yenidenBekleme: 600,    // ilk başarısızlıktan sonra bekleme (ms)
};

/** Kısım başına madde sayısı (veri-sina.mjs fihristle karşılaştırır). */
const MADDE_SAYISI = { 1: 98, 2: 73, 3: 70 };

/* ───────────── Hata ───────────── */
/** tur: 'bulunamadi' | 'bozuk' | 'cevrimdisi' | 'zaman-asimi' | 'ag' | 'sunucu' | 'iptal' | 'gecersiz' */
export class VeriHatasi extends Error {
  constructor(mesaj, { parca = null, tur = 'ag', durum = null, neden = null } = {}) {
    super(mesaj);
    this.name = tur === 'iptal' ? 'AbortError' : 'VeriHatasi';
    this.parca = parca;
    this.tur = tur;
    this.durum = durum;
    if (neden) this.cause = neden;
  }
}

const TUR_ACIKLAMA = {
  'bulunamadi': 'sunucuda yok (404)',
  'bozuk': 'gelen veri okunamadı (bozuk JSON)',
  'cevrimdisi': 'internet bağlantısı yok',
  'zaman-asimi': 'sunucu zamanında cevap vermedi',
  'ag': 'ağ hatası',
  'sunucu': 'sunucu hatası',
  'iptal': 'istek iptal edildi',
};

const cevrimdisiMi = () => typeof navigator !== 'undefined' && navigator && navigator.onLine === false;
const bekle = ms => new Promise(r => setTimeout(r, ms));

/* ───────────── İndirme ───────────── */
async function tekDeneme(yol, oncelik) {
  if (cevrimdisiMi()) throw new VeriHatasi(`"${yol}" yüklenemedi: ${TUR_ACIKLAMA.cevrimdisi}`, { parca: yol, tur: 'cevrimdisi' });
  const denetim = new AbortController();
  let zamanDoldu = false;
  const sayac = setTimeout(() => { zamanDoldu = true; denetim.abort(); }, ayar.zamanAsimi);
  try {
    let cevap;
    try {
      const secenek = { signal: denetim.signal, credentials: 'same-origin' };
      if (oncelik) secenek.priority = oncelik;
      cevap = await fetch(ayar.kok + yol, secenek);
    } catch (e) {
      if (zamanDoldu) throw new VeriHatasi(`"${yol}" yüklenemedi: ${TUR_ACIKLAMA['zaman-asimi']} (${ayar.zamanAsimi / 1000} sn)`, { parca: yol, tur: 'zaman-asimi', neden: e });
      const tur = cevrimdisiMi() ? 'cevrimdisi' : 'ag';
      throw new VeriHatasi(`"${yol}" yüklenemedi: ${TUR_ACIKLAMA[tur]}`, { parca: yol, tur, neden: e });
    }
    if (cevap.status === 404) throw new VeriHatasi(`"${yol}" bulunamadı (404)`, { parca: yol, tur: 'bulunamadi', durum: 404 });
    if (!cevap.ok) throw new VeriHatasi(`"${yol}" yüklenemedi: sunucu ${cevap.status} döndürdü`, { parca: yol, tur: 'sunucu', durum: cevap.status });
    let metin;
    try { metin = await cevap.text(); } catch (e) {
      const tur = zamanDoldu ? 'zaman-asimi' : 'ag';
      throw new VeriHatasi(`"${yol}" okunurken kesildi: ${TUR_ACIKLAMA[tur]}`, { parca: yol, tur, neden: e });
    }
    try { return JSON.parse(metin); } catch (e) {
      throw new VeriHatasi(`"${yol}" ${TUR_ACIKLAMA.bozuk}`, { parca: yol, tur: 'bozuk', durum: cevap.status, neden: e });
    }
  } finally {
    clearTimeout(sayac);
  }
}

// Yeniden denemeye değer hatalar (404 ve çevrimdışı denenmez)
const YENIDEN = new Set(['zaman-asimi', 'ag', 'sunucu', 'bozuk']);

async function indir(yol, oncelik) {
  try {
    return await tekDeneme(yol, oncelik);
  } catch (e) {
    if (!YENIDEN.has(e.tur) || (e.tur === 'sunucu' && e.durum && e.durum < 500)) throw e;
    await bekle(ayar.yenidenBekleme);
    return tekDeneme(yol, oncelik);
  }
}

const bellek = new Map();   // yol → Promise

function iptalHatasi(yol, sinyal) {
  return new VeriHatasi(`"${yol}" isteği iptal edildi`, { parca: yol, tur: 'iptal', neden: sinyal && sinyal.reason });
}

function getir(yol, { sinyal, oncelik } = {}) {
  if (sinyal && sinyal.aborted) return Promise.reject(iptalHatasi(yol, sinyal));
  let soz = bellek.get(yol);
  if (!soz) {
    soz = indir(yol, oncelik);
    bellek.set(yol, soz);
    soz.catch(() => { if (bellek.get(yol) === soz) bellek.delete(yol); });
  }
  if (!sinyal) return soz;
  return new Promise((coz, reddet) => {
    const iptal = () => reddet(iptalHatasi(yol, sinyal));
    sinyal.addEventListener('abort', iptal, { once: true });
    soz.then(
      d => { sinyal.removeEventListener('abort', iptal); coz(d); },
      e => { sinyal.removeEventListener('abort', iptal); reddet(e); },
    );
  });
}

/** Türetilmiş değerleri (dizin, Map) bir kez hesaplayıp saklar; başarısızlıkta saklamaz. */
const turetilmis = new Map();
function turet(ad, kaynakYol, islev, secenek) {
  let soz = turetilmis.get(ad);
  if (!soz) {
    soz = getir(kaynakYol).then(islev);
    turetilmis.set(ad, soz);
    soz.catch(() => { if (turetilmis.get(ad) === soz) turetilmis.delete(ad); });
  }
  if (!secenek || !secenek.sinyal) return soz;
  const sinyal = secenek.sinyal;
  if (sinyal.aborted) return Promise.reject(iptalHatasi(kaynakYol, sinyal));
  return new Promise((coz, reddet) => {
    const iptal = () => reddet(iptalHatasi(kaynakYol, sinyal));
    sinyal.addEventListener('abort', iptal, { once: true });
    soz.then(d => { sinyal.removeEventListener('abort', iptal); coz(d); }, e => { sinyal.removeEventListener('abort', iptal); reddet(e); });
  });
}

/* ───────────── Madde kimliği ───────────── */
const tamsayi = x => {
  if (typeof x === 'number') return Number.isInteger(x) ? x : NaN;
  if (typeof x === 'string' && /^\s*\d+\s*$/.test(x)) return parseInt(x, 10);
  return NaN;
};

function dogrula(k, n) {
  k = tamsayi(k); n = tamsayi(n);
  if (!(k in MADDE_SAYISI) || !(n >= 1 && n <= MADDE_SAYISI[k])) return null;
  return { kisim: k, no: n };
}

function coz(x, y) {
  if (x == null) return null;
  // İki bağımsız değişken: (1, 43) · ('1', '43') · ('kisim1.json', '43')
  if (y !== undefined) {
    const dosya = typeof x === 'string' && /^(?:texts\/)?kisim(\d)(?:\.json)?$/.exec(x.trim());
    return dosya ? dogrula(dosya[1], y) : dogrula(x, y);
  }
  if (Array.isArray(x)) return x.length === 2 ? coz(x[0], x[1]) : null;
  if (typeof x === 'string') {
    const s = x.trim();
    let m;
    if ((m = /^(\d+)\s*[/-]\s*(\d+)$/.exec(s))) return dogrula(m[1], m[2]);                         // "1/43", "1-43"
    if ((m = /^K(\d+)\s*\/\s*M(\d+)$/i.exec(s))) return dogrula(m[1], m[2]);                         // "K1/M43"
    if ((m = /^(?:https?:\/\/[^/]+)?\/?madde\/(\d+)\/(\d+)\/?(?:[?#].*)?$/.exec(s))) return dogrula(m[1], m[2]);   // "/madde/1/43"
    if ((m = /^(?:texts\/)?kisim(\d)(?:\.json)?\s*[#:/]\s*(\d+)$/.exec(s))) return dogrula(m[1], m[2]); // "kisim1.json#43"
    return null;
  }
  if (typeof x === 'object') {
    if ('dosya' in x) return coz(x.dosya, x.anahtar);                                               // {dosya:'kisim1.json', anahtar:'43'}
    const k = x.kisim ?? x.k;
    const n = x.madde_no ?? x.maddeNo ?? x.madde ?? x.no ?? x.m;
    if (k === undefined || k === null || n === undefined || n === null) return null;
    if (typeof n === 'string' && !/^\s*\d+\s*$/.test(n)) return null;
    return dogrula(k, n);
  }
  return null;
}

export const maddeKimlik = {
  /** Bilinen her biçimi {kisim, no}'ya çevirir; geçersiz/boş/aralık dışı → null. */
  coz,
  /** → "1-43" (veri/ içindeki bütün madde atıflarının biçimi) ya da null */
  anahtar(x, y) { const c = coz(x, y); return c ? `${c.kisim}-${c.no}` : null; },
  /** → "/madde/1/43" ya da null */
  yol(x, y) { const c = coz(x, y); return c ? `/madde/${c.kisim}/${c.no}` : null; },
  /** Eski sitenin "1/43" biçimi (localStorage anahtarları bununla yazılı) ya da null */
  egik(x, y) { const c = coz(x, y); return c ? `${c.kisim}/${c.no}` : null; },
  /** İki kimlik aynı maddeyi mi gösteriyor */
  esit(a, b) { const x = coz(a), y = coz(b); return !!x && !!y && x.kisim === y.kisim && x.no === y.no; },
};

/* ───────────── Metin yardımcıları (saf işlev; eski app.js maddeMetniHTML/highlightWords ile aynı sonuç) ───────────── */

function araBaslikMi(par) {
  if (par.length > 160) return false;
  const harfler = par.replace(/“[^”]*”/g, '').replace(/[^A-Za-zÇĞİÖŞÜÂÎÛçğıöşüâîû]/g, '');
  if (harfler.length < 3) return false;
  let buyuk = 0;
  for (const ch of harfler) if (ch === ch.toLocaleUpperCase('tr') && ch !== ch.toLocaleLowerCase('tr')) buyuk++;
  return buyuk / harfler.length >= 0.7;
}

/** Madde metnini paragraflara ayırır. Her öğe: {sira, tur, bas, son, metin, sahife?, icerik?, lugat}
    tur: 'paragraf' | 'baslik' | 'siir' | 'dipnot' | 'tablo' | 'cedvel' | 'sekil' | 'bos'
    bas/son: metin içindeki konum (metin.slice(bas, son) === öğe.metin). lugat: lügat vurgusu alır mı. */
export function paragraflar(metin) {
  const s = String(metin ?? '');
  const sonuc = [];
  const ayrac = /\n{2,}/g;
  let bas = 0, m, sira = 0;
  const ekle = (b, e) => {
    const par = s.slice(b, e);
    const o = { sira: sira++, tur: 'paragraf', bas: b, son: e, metin: par, lugat: true };
    let x;
    if (!par.trim()) { o.tur = 'bos'; o.lugat = false; }
    else if ((x = /^⟦şekil:(\d+)⟧$/.exec(par))) { o.tur = 'sekil'; o.sahife = +x[1]; o.lugat = false; }
    else if ((x = /^⟦cedvel:(\d+)⟧\n([\s\S]*)$/.exec(par))) { o.tur = 'cedvel'; o.sahife = +x[1]; o.icerik = x[2]; o.lugat = false; }
    else if (par.indexOf('\n') !== -1) {
      if (/\S {2,}\S/.test(par)) { o.tur = 'tablo'; o.lugat = false; } else o.tur = 'siir';
    }
    else if (/^\[\d\] /.test(par)) o.tur = 'dipnot';
    else if (araBaslikMi(par)) o.tur = 'baslik';
    sonuc.push(o);
  };
  while ((m = ayrac.exec(s))) { ekle(bas, m.index); bas = m.index + m[0].length; }
  ekle(bas, s.length);
  return sonuc;
}

const trLower = s => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().replace(/̇/g, '');
const KACIS = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const kacisCoz = s => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
const KIRP = /^[.,;:!?()\[\]"'&;#\d]+|[.,;:!?()\[\]"'&;#\d]+$/g;

/** Bir metin parçasında lügat kelimelerini bulur. kelimeler: madde lügat parçasının `kelimeler` nesnesi.
    Dönüş: [{bas, son, id}] (parçanın içindeki konumlar + ofset). */
function lugatParca(par, harita, ofset) {
  // Eski kod kaçışlı HTML üzerinde çalışıyordu; aynı sonuç için kaçışla birlikte konum eşlemi tutulur
  let esc = '';
  const kaynak = [];
  for (let i = 0; i < par.length; i++) {
    const c = par[i];
    const k = KACIS[c] || c;
    for (let j = 0; j < k.length; j++) kaynak.push(i);
    esc += k;
  }
  kaynak.push(par.length);
  const sonuc = [];
  const kelime = /\S+/g;
  let m;
  while ((m = kelime.exec(esc))) {
    const token = m[0];
    const clean = token.replace(KIRP, '');
    if (clean.length < 2) continue;
    const id = harita.get(trLower(kacisCoz(clean)));
    if (id === undefined) continue;
    const b = m.index + token.indexOf(clean);
    sonuc.push({ bas: ofset + kaynak[b], son: ofset + kaynak[b + clean.length], id });
  }
  return sonuc;
}

const haritaOnbellek = new WeakMap();
/** Madde metnindeki lügat kelimelerinin konumları: [{bas, son, id}] (metin içinde, artan sırayla).
    kelimeler: veri.maddeLugat(...) sonucundaki `kelimeler`. Yalnız lügat alan paragraflarda (paragraflar()[i].lugat). */
export function lugatIsaretle(metin, kelimeler) {
  if (!kelimeler) return [];
  let harita = haritaOnbellek.get(kelimeler);
  if (!harita) { harita = new Map(Object.entries(kelimeler)); haritaOnbellek.set(kelimeler, harita); }
  const sonuc = [];
  for (const p of paragraflar(metin)) if (p.lugat) sonuc.push(...lugatParca(p.metin, harita, p.bas));
  return sonuc;
}

/* ───────────── Yükleyiciler ───────────── */
const parcaAdi = s => String(s).toLowerCase().replace(/_/g, '-');
const GECERLI_AD = /^[a-z0-9-]+$/;
function gecersiz(ne, deger) { return Promise.reject(new VeriHatasi(`Geçersiz ${ne}: ${JSON.stringify(deger)}`, { tur: 'gecersiz' })); }

function maddeYolu(x, y) {
  const c = coz(x, y);
  return c ? `${c.kisim}-${c.no}` : null;
}

// Bağımsız değişkenin sonu seçenek nesnesi olabilir: veri.madde(1, 43, {sinyal})
const secenekMi = o => o && typeof o === 'object' && !Array.isArray(o) && ('sinyal' in o || 'oncelik' in o) && !('kisim' in o);

function maddeCagrisi(args) {
  let sec = {};
  if (args.length && secenekMi(args[args.length - 1])) sec = args[args.length - 1], args = args.slice(0, -1);
  return { a: maddeYolu(args[0], args[1]), sec, ham: args };
}

const fihristDizini = () => turet('fihrist-dizin', 'fihrist.json', f => {
  const sira = new Map(f.maddeler.map((m, i) => [`${m.kisim}-${m.no}`, i]));
  return { f, sira };
});

export const veri = {
  /** Ayarları değiştirir (sınama ya da farklı kök için): { kok, zamanAsimi, yenidenBekleme } */
  ayarla(yeni = {}) { Object.assign(ayar, yeni); return { ...ayar }; },
  /** Bellekteki bütün parçaları unutur. */
  bellegiBosalt() { bellek.clear(); turetilmis.clear(); },

  surum: (sec) => getir('surum.json', sec),
  fihrist: (sec) => getir('fihrist.json', sec),

  /** {no, ad, romen, aciklama, maddeSayisi} ya da null */
  async kisim(no, sec) { const f = await getir('fihrist.json', sec); return f.kisimlar.find(k => k.no === tamsayi(no)) || null; },

  /** Fihrist satırı (künye) ya da null */
  async maddeKunye(...args) {
    const { a, sec } = maddeCagrisi(args);
    if (!a) return null;
    const { f, sira } = await fihristDizini();
    if (sec.sinyal && sec.sinyal.aborted) throw iptalHatasi('fihrist.json', sec.sinyal);
    return sira.has(a) ? f.maddeler[sira.get(a)] : null;
  },

  /** Maddenin metni + bağlı her şey. Her biçim kabul: (1, 43) · ('1/43') · ({kisim, madde_no}) … */
  madde(...args) {
    const { a, sec, ham } = maddeCagrisi(args);
    return a ? getir(`madde/${a}.json`, sec) : gecersiz('madde kimliği', ham);
  },
  /** Maddedeki lügat kelimeleri: {madde, kelimeler:{biçim:id}, terimler:{id:{kelime, osmanlica, anlam, koken, bakiniz, misalVar, parca}}} */
  maddeLugat(...args) {
    const { a, sec, ham } = maddeCagrisi(args);
    return a ? getir(`lugat-madde/${a}.json`, sec) : gecersiz('madde kimliği', ham);
  },
  /** Boşta, düşük öncelikle maddeyi (istenirse lügatini de) belleğe alır. Hata yutulur. */
  onYukle(x, y, { lugat = false } = {}) {
    const a = maddeYolu(x, y);
    if (!a) return;
    const is = () => {
      getir(`madde/${a}.json`, { oncelik: 'low' }).catch(() => {});
      if (lugat) getir(`lugat-madde/${a}.json`, { oncelik: 'low' }).catch(() => {});
    };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(is, { timeout: 3000 });
    else setTimeout(is, 200);
  },
  /** {onceki, sonraki}: fihrist satırları ya da null (kısım sınırını geçer) */
  async komsu(...args) {
    const { a } = maddeCagrisi(args);
    const { f, sira } = await fihristDizini();
    if (!a || !sira.has(a)) return { onceki: null, sonraki: null };
    const i = sira.get(a);
    return { onceki: f.maddeler[i - 1] || null, sonraki: f.maddeler[i + 1] || null };
  },
  /** Basılı sahîfeyi kapsayan maddeler (fihrist satırları; 0, 1 ya da 2 — bir sahîfeyi iki madde paylaşabilir) */
  async sahifedenMadde(sahife, sec) {
    const s = tamsayi(sahife);
    const f = await getir('fihrist.json', sec);
    return f.maddeler.filter(m => m.sahife[0] <= s && s <= m.sahife[1]);
  },
  ozetler: (sec) => getir('ozetler.json', sec),
  konular: (sec) => getir('konular.json', sec),

  /* Lügat */
  lugatDizin: (sec) => getir('lugat/dizin.json', sec),
  lugatParca(ad, sec) { ad = parcaAdi(ad); return GECERLI_AD.test(ad) ? getir(`lugat/${ad}.json`, sec) : gecersiz('lügat parçası', ad); },
  /** Bir harfin bütün terimleri (birden çok parçaysa birleştirir), harf: 'A', 'Ç', 'İ' … */
  async lugatHarf(harf, sec) {
    const d = await getir('lugat/dizin.json', sec);
    const h = d.harfler.find(x => x.harf === harf);
    if (!h) return [];
    const parcalar = await Promise.all(h.parcalar.map(p => getir(`lugat/${p}.json`, sec)));
    return parcalar.flatMap(p => p.terimler);
  },
  lugatTerimler: (sec) => getir('lugat/terimler.json', sec),
  /** Tek terim (tam kayıt, misal dahil) ya da null */
  async lugatTerim(id, sec) {
    const n = tamsayi(id);
    const d = await getir('lugat/dizin.json', sec);
    const p = d.parcalar.find(x => x.araliklar.some(([a, b]) => a <= n && n <= b));
    if (!p) return null;
    const parca = await getir(`lugat/${p.ad}.json`, sec);
    return parca.terimler.find(t => t.id === n) || null;
  },

  /* Hâl tercemeleri */
  sahislarDizin: (sec) => getir('sahislar/dizin.json', sec),
  /** Tek şahıs (biyografi dahil) ya da null. slug veri dosyasındaki gibidir; asla isimden hesaplanmaz. */
  async sahis(slug, sec) {
    const s = String(slug ?? '').trim();
    if (!/^[a-z0-9]/.test(s)) return null;
    const p = await getir(`sahislar/${s[0]}.json`, sec).catch(e => { if (e.tur === 'bulunamadi') return null; throw e; });
    return (p && p.sahislar.find(x => x.slug === s)) || null;
  },

  /* Fıkhî hükümler */
  hukumlerDizin: (sec) => getir('hukumler/dizin.json', sec),
  /** tur: 'farz' | 'vacib' | 'sunnet' | 'mustehab' | 'mubah' | 'mekruh' | 'haram'; katman: 'acik' (varsayılan) | 'tum' */
  hukumler(tur, katman = 'acik', sec) {
    if (katman && typeof katman === 'object') { sec = katman; katman = 'acik'; }
    const ad = `${parcaAdi(tur)}-${parcaAdi(katman)}`;
    return GECERLI_AD.test(ad) ? getir(`hukumler/${ad}.json`, sec) : gecersiz('hüküm türü', ad);
  },

  ayetHadis: (sec) => getir('ayet-hadis.json', sec),
  tanimlar: (sec) => getir('tanimlar.json', sec),

  /* Tablolar */
  tablolar: (sec) => getir('tablolar/dizin.json', sec),
  /** id: 'iman_sartlari' ya da 'iman-sartlari' */
  tablo(id, sec) { const ad = parcaAdi(id ?? ''); return GECERLI_AD.test(ad) ? getir(`tablolar/${ad}.json`, sec) : gecersiz('tablo kimliği', id); },

  rehberler: (sec) => getir('rehberler.json', sec),
  async rehber(id, sec) { const r = await getir('rehberler.json', sec); return r.rehberler.find(x => x.id === id) || null; },

  gununSualleri: (sec) => getir('gunun-sualleri.json', sec),
  /** tarih: Date ya da 'YYYY-MM-DD' (yerel gün; varsayılan bugün). Eski sitedeki sırayla aynı suâl. */
  async gununSuali(tarih = new Date(), sec) {
    const d = await getir('gunun-sualleri.json', sec);
    const n = d.sualler.length;
    if (!n) return null;
    let gun;
    if (typeof tarih === 'string') {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarih);
      if (!m) return null;
      gun = Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000);
    } else {
      const t = tarih instanceof Date ? tarih : new Date(tarih);
      if (isNaN(t)) return null;
      gun = Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 86400000);
    }
    const sira = ((gun % n) + n) % n;
    return { sira, ...d.sualler[sira] };
  },

  testSorulari: (sec) => getir('test-sorulari.json', sec),
  arama: (sec) => getir('arama.json', sec),
  okumaPlani: (sec) => getir('okuma-plani.json', sec),

  paragraflar,
  lugatIsaretle,
};
