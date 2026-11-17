/* Kalıcı depo: localStorage üstünde güvenli sarmalayıcı.
   - Gizli gezinti, dolu kota ya da kapalı depolama sayfayı ASLA düşürmez;
     o durumda değerler oturum boyunca bellekte tutulur.
   - Değerler JSON'dur; bozuk kayıt varsayılana düşer.
   - Anahtar adları eski siteyle aynıdır (kullanıcı verisi korunur): bkz. js/cekirdek/kullanici.js ve tools/yeni-site/KULLANICI.md */

const bellek = new Map();
let calisiyor = true;
try {
  const dene = '__ilmihal_dene__';
  localStorage.setItem(dene, '1');
  localStorage.removeItem(dene);
} catch (e) {
  calisiyor = false;
}

const dinleyiciler = new Map();   // anahtar → Set(işlev)

function hamAl(anahtar) {
  if (!calisiyor) return bellek.has(anahtar) ? bellek.get(anahtar) : null;
  try { return localStorage.getItem(anahtar); } catch (e) { return bellek.has(anahtar) ? bellek.get(anahtar) : null; }
}

function hamYaz(anahtar, deger) {
  bellek.set(anahtar, deger);
  if (!calisiyor) return false;
  try { localStorage.setItem(anahtar, deger); return true; } catch (e) { return false; }
}

export const depo = {
  /** JSON değeri okur; yoksa ya da bozuksa varsayılanı döndürür. */
  al(anahtar, varsayilan = null) {
    const ham = hamAl(anahtar);
    if (ham === null || ham === undefined) return varsayilan;
    try { return JSON.parse(ham); } catch (e) { return varsayilan; }
  },
  /** Düz dizgi olarak saklanmış eski değerler için (JSON olmayan). */
  alDuz(anahtar, varsayilan = null) {
    const ham = hamAl(anahtar);
    return ham === null || ham === undefined ? varsayilan : ham;
  },
  yaz(anahtar, deger) {
    const tamam = hamYaz(anahtar, JSON.stringify(deger));
    duyur(anahtar, deger);
    return tamam;
  },
  yazDuz(anahtar, deger) {
    const tamam = hamYaz(anahtar, String(deger));
    duyur(anahtar, deger);
    return tamam;
  },
  sil(anahtar) {
    bellek.delete(anahtar);
    if (calisiyor) { try { localStorage.removeItem(anahtar); } catch (e) { /* yoksay */ } }
    duyur(anahtar, null);
  },
  /** Değeri okuyup bir işlevle değiştirir ve yazar. */
  guncelle(anahtar, varsayilan, islev) {
    const yeni = islev(this.al(anahtar, varsayilan));
    this.yaz(anahtar, yeni);
    return yeni;
  },
  /** Anahtar değişince çağrılır (bu sekme ve diğer sekmeler). Aboneliği kaldıran işlev döner. */
  izle(anahtar, islev) {
    if (!dinleyiciler.has(anahtar)) dinleyiciler.set(anahtar, new Set());
    dinleyiciler.get(anahtar).add(islev);
    return () => dinleyiciler.get(anahtar)?.delete(islev);
  },
  /** Belirli ön ekle başlayan anahtarların listesi. */
  anahtarlar(onEk = '') {
    const liste = new Set([...bellek.keys()].filter(k => k.startsWith(onEk)));
    if (calisiyor) {
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(onEk)) liste.add(k); } } catch (e) { /* yoksay */ }
    }
    return [...liste];
  },
  get kalici() { return calisiyor; }
};

function duyur(anahtar, deger) {
  for (const islev of dinleyiciler.get(anahtar) || []) {
    try { islev(deger); } catch (e) { console.error('depo dinleyicisi:', e); }
  }
}

// Başka sekmede yapılan değişiklik
addEventListener('storage', e => {
  if (!e.key || !dinleyiciler.has(e.key)) return;
  let deger = null;
  try { deger = e.newValue === null ? null : JSON.parse(e.newValue); } catch (x) { deger = e.newValue; }
  duyur(e.key, deger);
});
