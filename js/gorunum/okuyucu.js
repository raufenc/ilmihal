/* Okuyucu: /madde/:kisim/:no
   Sitenin kalbi. Kendi ince okuma çubuğunu taşır (sitenin üst çubuğu ve künyesi okuyucuda gizlidir).
   Madde değişince çubuklar yeniden kurulmaz: guncelle() yalnız sayfanın içini değiştirir.

   Alt modüller js/gorunum/okuyucu/ altında:
     metin.js (dizgi ve konum)  lugat.js (kenar notu)  sahife.js (kitabın aslı)  ayarlar.js (Aa)
     cekmece.js (fihrist)  secim.js (seçim çubuğu, vurgu)  son.js (Bu maddede, notlar, komşular)  menu.js (diğer) */

import { h, doldur, simge, semse, durum, kare } from '../cekirdek/dom.js';
import { veri, maddeKimlik, lugatIsaretle } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { kullanici } from '../cekirdek/kullanici.js';
import { okumaPlani } from '../cekirdek/okuma-plani.js';
import { ad, sahife as sahifeYaz, kisimAdi, okumaDakikasi, roma } from '../cekirdek/bicim.js';
import { bildir } from '../bilesen/bildirim.js';
import { sesCalarKur } from '../bilesen/ses-calar.js';
import { metinKur, lugatUygula, araligiSar, sok, metindeBul } from './okuyucu/metin.js';
import { hasiyeKur } from './okuyucu/lugat.js';
import { sahifePaneliKur } from './okuyucu/sahife.js';
import { ayarlarAc, ayarUygula } from './okuyucu/ayarlar.js';
import { cekmeceAc } from './okuyucu/cekmece.js';
import { secimKur } from './okuyucu/secim.js';
import { sonBolumCiz, notlarCiz } from './okuyucu/son.js';
import { digerAc, kisayollarAc } from './okuyucu/menu.js';
import { YOL } from './okuyucu/simgeler.js';

/* Tek okuyucu örneğinin durumu (aynı anda bir okuyucu açık olur). */
const S = { istek: 0, kabuk: false };

const yaziyor = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
const pencereAcik = () => !!document.querySelector('dialog[open]');

/** Yönlendirici işini bitirince (kaydırma, görünüm adı) çalışır. */
function hazirOlunca(fn, sinyal) {
  let n = 0;
  const bak = () => {
    if (sinyal && sinyal.aborted) return;
    if (document.body.dataset.hazir === '1' || n++ > 240) requestAnimationFrame(() => { if (!(sinyal && sinyal.aborted)) fn(); });
    else requestAnimationFrame(bak);
  };
  requestAnimationFrame(bak);
}

/* ───────────────────────── Bulunamadı / hata ───────────────────────── */

function okuyucuDisiGoster() {
  // Okuyucu çubukları açılmaz: sitenin kendi üst çubuğu ve künyesi görünsün
  hazirOlunca(() => { if (!S.kabuk) document.documentElement.dataset.gorunum = 'okuyucu-yok'; });
  document.documentElement.dataset.gorunum = 'okuyucu-yok';
}

function bulunamadiCiz(baglam) {
  baglam.baslikYaz('Madde bulunamadı');
  baglam.metaYaz({ robots: 'noindex' });
  doldur(S.kap, h('.kap.kap-dar.oku-yok', { style: { paddingBlock: 'var(--a-9)' } },
    h('p.ust-yazi.surh', 'Fihristte yok'),
    h('h1.baslik-2', { style: { marginTop: 'var(--a-3)' } }, 'Bu madde bulunamadı'),
    h('p.giris-yazi', { style: { marginTop: 'var(--a-4)' } }, 'Adresteki kısım ya da madde numarası kitapta bulunmuyor. Kitabın üç kısmındaki bütün maddeler fihristte sırasıyla durur.'),
    h('.sira', { style: { marginTop: 'var(--a-6)' } },
      h('a.dugme.dugme-ana', { href: '/icindekiler' }, 'Fihriste gidin'),
      h('a.dugme', { href: '/arama' }, 'Kitapta arayın'),
      h('a.dugme', { href: '/' }, 'Ana sayfa'))));
  okuyucuDisiGoster();
}

function hataCiz(hata, kimlik) {
  const cevrimdisi = hata && hata.tur === 'cevrimdisi';
  const yeniden = h('button.dugme.dugme-ana', { type: 'button', onclick: () => maddeAc(kimlik, S.baglam) }, 'Yeniden deneyin');
  const blok = durum(cevrimdisi ? 'Bağlantı yok' : 'Madde yüklenemedi',
    cevrimdisi ? 'İnternet bağlantınız kesik görünüyor. Bağlantı gelince yeniden deneyin.' : 'Maddenin metni şu an getirilemedi. Biraz sonra yeniden deneyin.',
    yeniden, h('a.dugme', { href: '/icindekiler' }, 'Fihrist'));
  if (S.kabuk) {
    doldur(S.sayfa, h('.oku-sayfa-ic', blok));
  } else {
    S.baglam.baslikYaz(cevrimdisi ? 'Bağlantı yok' : 'Madde yüklenemedi');
    doldur(S.kap, h('.kap.kap-dar', blok));
    okuyucuDisiGoster();
  }
}

/* ───────────────────────── Kabuk: çubuk, ilerleme, paneller ───────────────────────── */

function dugme(sinif, etiket, yol, onclick, ek = {}) {
  return h('button.oku-dg' + sinif, { type: 'button', 'aria-label': etiket, title: etiket, onclick, ...ek }, simge(yol));
}

function kabukKur() {
  S.kabuk = true;
  S.kabukIptal = new AbortController();
  const sec = { signal: S.kabukIptal.signal };

  const d = S.dg = {};
  d.fihrist = dugme('', 'Kısmın fihristi (F)', YOL.fihrist, () => cekmeceAc(S, d.fihrist), { 'aria-haspopup': 'dialog' });
  d.ev = h('a.oku-dg.oku-ev', { href: '/', 'aria-label': 'Ana sayfa', title: 'Ana sayfa' }, semse());
  d.yer = h('button.oku-yer', { type: 'button', title: 'Maddenin başına dönün', onclick: () => scrollTo({ top: 0, behavior: 'smooth' }) },
    h('span.oku-yer-uzun'), h('span.oku-yer-kisa'));
  d.dinle = dugme('', 'Dinleyin', YOL.dinle, dinle, { 'aria-pressed': 'false' });
  d.asil = dugme('.genis-yalniz', 'Kitabın aslı', YOL.asil, () => S.sahife.degistir(), { 'aria-expanded': 'false' });
  d.aa = dugme('', 'Okuma ayarları', YOL.aa, () => ayarlarAc(S, d.aa), { 'aria-haspopup': 'dialog' });
  d.yerImi = dugme('.oku-yerimi', 'Yer imi ekleyin (B)', YOL.yerImi, yerImiDegistir, { 'aria-pressed': 'false' });
  d.paylas = dugme('.genis-yalniz', 'Paylaşın', YOL.paylas, () => paylas());
  d.diger = dugme('', 'Diğer', YOL.diger, () => digerAc(S, d.diger), { 'aria-haspopup': 'menu' });

  S.ilerleme = h('i');
  S.cubuk = h('header.oku-cubuk.baskida-yok',
    h('.oku-ilerleme', { 'aria-hidden': 'true' }, S.ilerleme),
    h('.oku-cubuk-ic',
      h('.oku-sol', d.fihrist, d.ev),
      h('.oku-orta', d.yer),
      h('.oku-sag', { role: 'toolbar', 'aria-label': 'Okuma araçları' }, d.dinle, d.asil, d.aa, d.yerImi, d.paylas, d.diger)));
  S.sayfa = h('article.oku-sayfa', { 'aria-labelledby': 'oku-baslik' });
  S.aramaSerit = h('.oku-arama.baskida-yok', { hidden: true, role: 'region', 'aria-label': 'Aramadan gelen eşleşmeler' });
  S.kok = h('.okuyucu', S.cubuk, S.aramaSerit, h('.oku-govde', S.sayfa));
  doldur(S.kap, S.kok);
  document.documentElement.dataset.gorunum = 'okuyucu';

  ayarUygula(S);
  S.calar = sesCalarKur({ onDegis: ({ acik, caliyor, kapatildi }) => {
    d.dinle.setAttribute('aria-pressed', String(!!acik));
    d.dinle.classList.toggle('caliyor', !!caliyor);
    if (kapatildi) d.dinle.focus({ preventScroll: true });
  } });
  S.hasiye = hasiyeKur(S);
  S.sahife = sahifePaneliKur(S);
  S.secim = secimKur(S);
  S.sahifeAc = no => S.sahife.ac(no);
  S.vurgulariYerlestir = vurgulariYerlestir;
  S.paylas = paylas;
  S.yerImiDegistir = yerImiDegistir;

  // Kaydırma: ilerleme çizgisi, çubuğun gizlenmesi, okuma yeri, kendiliğinden bitirme
  let sonY = scrollY, istendi = false, yerZaman = null;
  const kaydir = () => {
    istendi = false;
    const y = scrollY;
    const oran = okumaOrani();
    S.ilerleme.style.transform = `scaleX(${oran})`;
    const fark = y - sonY;
    if (y < 80 || fark < -6) S.cubuk.classList.remove('gizli');
    else if (fark > 6 && !S.cubuk.contains(document.activeElement)) S.cubuk.classList.add('gizli');
    sonY = y;
    S.cubuk.classList.toggle('kaydi', y > 8);
    if (!S.madde) return;
    clearTimeout(yerZaman);
    const key = S.key;
    yerZaman = setTimeout(() => { if (S.key === key) okumaPlani.okumaYeriKaydet(key, okumaOrani()); }, 800);
    otomatikBitirDene(oran);
  };
  addEventListener('scroll', () => { if (!istendi) { istendi = true; requestAnimationFrame(kaydir); } }, { passive: true, ...sec });
  S.cubuk.addEventListener('focusin', () => S.cubuk.classList.remove('gizli'), sec);
  addEventListener('keydown', tusa, sec);
  addEventListener('ilmihal:tema', () => S.sahife.temaDegisti(), sec);
  addEventListener('resize', () => S.hasiye.kapat(), sec);

  // Metin içi bağlantılar: sahîfe atıfları kitabın aslını açar
  S.sayfa.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[data-sahife]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    S.sahife.ac(+a.dataset.sahife, a);
  }, sec);

  // Günlük hedef: okuyucu açıkken dakikada bir (eski davranış; gün UTC'ye göredir)
  const hedef = setInterval(() => {
    if (document.visibilityState !== 'visible' || !S.madde) return;
    const g = kullanici.gunlukHedef.ekle(1);
    if (g.tamam && g.minutes === g.target && !okumaPlani.aktifMi()) bildir('Bugünkü okuma hedefinize ulaştınız.');
  }, 60000);
  S.kabukIptal.signal.addEventListener('abort', () => clearInterval(hedef));
}

function kabukYokEt() {
  if (!S.kabuk) return;
  S.kabuk = false;
  S.maddeIptal && S.maddeIptal.abort();
  S.kabukIptal.abort();
  for (const parca of [S.calar, S.hasiye, S.sahife, S.secim]) { try { parca && parca.yokEt(); } catch (e) { console.error(e); } }
  for (const d of document.querySelectorAll('dialog.oku-pencere')) d.remove();
  document.documentElement.classList.remove('sahife-acik', 'ses-acik');
  S.madde = null;
}

/* ───────────────────────── Ölçüler ───────────────────────── */

/** Metnin okunma oranı: metnin sonu ekranın altına gelince 1. */
function okumaOrani() {
  const m = S.metinKok;
  if (!m || !m.isConnected) return 0;
  const son = m.getBoundingClientRect().bottom + scrollY - innerHeight;
  if (son <= 0) return 1;
  return Math.max(0, Math.min(1, scrollY / son));
}

function oranaKaydir(oran) {
  const m = S.metinKok;
  if (!m) return;
  const r = m.getBoundingClientRect();
  const son = r.bottom + scrollY - innerHeight;
  scrollTo(0, Math.max(0, oran * son));
}

/* ───────────────────────── Madde yükleme ───────────────────────── */

async function maddeAc(kimlik, baglam, { ilk = false } = {}) {
  const no = ++S.istek;
  if (S.maddeIptal) S.maddeIptal.abort();
  const ic = new AbortController();
  S.maddeIptal = ic;
  if (baglam.sinyal.aborted) return;
  baglam.sinyal.addEventListener('abort', () => ic.abort(), { once: true });
  if (S.kabuk && S.calar) S.calar.yukle(null);

  let madde;
  try {
    const fihristSoz = S.fihrist ? Promise.resolve(S.fihrist) : veri.fihrist({ sinyal: ic.signal }).catch(e => { if (e.name !== 'AbortError') console.warn('Fihrist yüklenemedi:', e.message); return null; });
    [madde, S.fihrist] = await Promise.all([veri.madde(kimlik.kisim, kimlik.no, { sinyal: ic.signal }), fihristSoz]);
  } catch (e) {
    if (e.name === 'AbortError' || no !== S.istek) return;
    if (e.tur === 'bulunamadi' || e.tur === 'gecersiz') { kabukYokEt(); bulunamadiCiz(baglam); return; }
    console.warn('Madde yüklenemedi:', e.message);
    hataCiz(e, kimlik);
    return;
  }
  if (no !== S.istek || ic.signal.aborted) return;
  if (!S.kabuk) kabukKur();
  sayfaCiz(madde, baglam, ic.signal, { ilk });
}

function maddeler() {
  return S.fihrist ? S.fihrist.maddeler.map(m => ({ kisim: m.kisim, no: m.no, uzunluk: m.uzunluk })) : null;
}

function sayfaCiz(madde, baglam, sinyal, { ilk }) {
  S.madde = madde;
  S.key = `${madde.kisim}/${madde.no}`;
  S.acilis = Date.now();
  S.otomatikBitti = false;
  S.isaretler = [];
  S.lugat = null;
  S.hasiye.kapat();
  S.secim.kapat();
  S.sorgu = (baglam.sorgu.get('v') || '').trim();
  const kitap = S.fihrist ? S.fihrist.kitap : null;
  S.pdfAdres = kitap ? kitap.pdf : ((madde.isaretler[0] && madde.isaretler[0].adres.split('#')[0]) || '');
  S.sahifeSayisi = kitap ? kitap.sahifeSayisi : 0;

  const kisim = kisimAdi(madde.kisim);
  baglam.baslikYaz(madde.baslik);
  baglam.metaYaz({ aciklama: madde.ozet || `${kisim}, Madde ${madde.no}: ${madde.baslik}` });

  // Çubuk
  S.dg.yer.firstChild.textContent = `${kisim} · Madde ${madde.no}`;
  S.dg.yer.lastChild.textContent = `${roma(madde.kisim)} · ${madde.no}`;
  const sesVar = !!(madde.ses && madde.ses.parcalar && madde.ses.parcalar.length);
  S.dg.dinle.setAttribute('aria-disabled', String(!sesVar));
  S.dg.dinle.title = sesVar ? 'Dinleyin' : 'Bu madde seslendirilmemiş';
  S.dg.dinle.setAttribute('aria-label', sesVar ? 'Dinleyin' : 'Dinleyin (bu madde seslendirilmemiş)');
  yerImiGoster();
  S.calar.yukle({ kisim: madde.kisim, no: madde.no, baslik: madde.baslik, kisimAdi: kisim, ses: madde.ses });

  // Sayfa
  const { kok, bloklar } = metinKur(madde, { sahifeSayisi: S.sahifeSayisi, pdfAdres: S.pdfAdres });
  S.metinKok = kok;
  S.bloklar = bloklar;
  const sure = okumaDakikasi(madde.uzunluk);
  const kunye = [
    h('a.oku-kunye-sahife', { href: S.pdfAdres + '#page=' + madde.sahife[0], target: '_blank', rel: 'noopener', dataset: { sahife: String(madde.sahife[0]) }, title: 'Kitabın aslında açın' },
      madde.sahife[1] !== madde.sahife[0] ? 'Sahîfe ' : 'Sahîfe ', h('b', sahifeYaz(madde.sahife[0], madde.sahife[1]))),
    madde.mektup ? h('span', { title: madde.mektup.uzun }, madde.mektup.kisa) : null,
    h('span', `≈ ${sure} dk okuma`)
  ].filter(Boolean);
  const kunyeSatir = h('p.oku-kunye.kunye');
  kunye.forEach((k, i) => { if (i) kunyeSatir.append(h('span.oku-nokta', { 'aria-hidden': 'true' }, '·')); kunyeSatir.append(k); });

  S.bitirAlan = h('.oku-bitir.baskida-yok');
  S.sonAlan = h('.oku-son-kap');
  S.notAlan = h('section.oku-notlar.baskida-yok#notlarim', { 'aria-labelledby': 'notlarim-baslik' });
  doldur(S.sayfa,
    h('.oku-sayfa-ic',
      h('header.oku-kapak',
        h('.rozet.oku-rozet', semse({}, false), h('span', String(madde.no))),
        h('p.ust-yazi.surh.oku-ust', `${kisim} · Madde ${madde.no}`),
        h('h1.oku-baslik#oku-baslik', ad(madde.baslik)),
        kunyeSatir),
      h('.ayrac.oku-ayrac', { 'aria-hidden': 'true' }, semse()),
      kok,
      S.bitirAlan,
      S.sonAlan,
      S.notAlan,
      h('p.oku-ketebe.kunye', 'Se’âdet-i Ebediyye · ', kisim, ', Madde ', String(madde.no), ' · Sahîfe ', sahifeYaz(madde.sahife[0], madde.sahife[1]),
        h('span.yalniz-baski', ' · ', location.origin + `/madde/${madde.kisim}/${madde.no}`))));

  bitirCiz();
  sonBolumCiz(S, S.sonAlan);
  notlarCiz(S, S.notAlan);
  S.sahife.maddeDegisti(madde, { ilk });
  S.ilerleme.style.transform = 'scaleX(0)';
  S.cubuk.classList.remove('gizli');
  if (S.dgOdak) { const o = S.dgOdak; S.dgOdak = null; requestAnimationFrame(() => o.focus({ preventScroll: true })); }

  // Kayıt
  kullanici.maddeAcildi({ kisim: madde.kisim, madde_no: madde.no, baslik: madde.baslik });

  // İlk boyamadan sonra: vurgular, arama, lügat, ön yükleme, kaldığı yer
  const geriDonus = geriMi();
  const hash = location.hash.slice(1);
  hazirOlunca(async () => {
    vurgulariYerlestir();
    let aramaIlk = null;
    if (S.sorgu) aramaIlk = await aramaUygula(S.sorgu, sinyal);
    if (sinyal.aborted) return;
    if (aramaIlk) aramaIlk.scrollIntoView({ block: 'center', behavior: 'auto' });
    else if (!geriDonus && !hash) {
      const yer = okumaPlani.donulecekYer(S.key);
      if (yer !== null) {
        oranaKaydir(yer);
        bildir('Kaldığınız yerden devam ediyorsunuz.', { sure: 5000, eylem: { ad: 'Başa dönün', yap: () => scrollTo(0, 0) } });
      }
    }
    lugatYukle(madde, sinyal);
    if (madde.sonraki) veri.onYukle(madde.sonraki, null, { lugat: true });
  }, sinyal);
}

/** Geri/ileri ile mi gelindi (yönlendirici bu kayıt için kaydırma konumu tutuyorsa). */
function geriMi() {
  const k = history.state && history.state.k;
  if (!k) return false;
  try { return sessionStorage.getItem('ilmihal_kaydir_' + k) !== null; } catch (e) { return false; }
}

/* ───────────────────────── Lügat katmanı ───────────────────────── */

async function lugatYukle(madde, sinyal) {
  let lugat;
  try {
    lugat = await veri.maddeLugat(madde.kisim, madde.no, { sinyal });
  } catch (e) {
    if (e.name !== 'AbortError') console.warn('Lügat yüklenemedi; metin lügatsiz okunur:', e.message);
    return;
  }
  if (sinyal.aborted || S.madde !== madde) return;
  S.lugat = lugat;
  await kare();
  const konumlar = lugatIsaretle(madde.metin, lugat.kelimeler);
  const kapali = S.kok.classList.contains('lugat-kapali');
  await lugatUygula(S.bloklar, konumlar, sinyal, {
    pdfAdres: S.pdfAdres,
    sonra: b => {
      isaretleriBlogaUygula(b);
      if (kapali) for (const s of b.el.querySelectorAll('.zor-kelime')) s.tabIndex = -1;
    }
  });
}

/* ───────────────────────── İşaretler: arama ve vurgu ───────────────────────── */

function isaretKur(x) {
  if (x.tur === 'arama') return h('mark.arama');
  const m = h('mark.vurgu', { dataset: { sira: String(x.sira) }, tabindex: '0', title: 'Vurgu: düzenlemek için seçin' });
  if (/^#[0-9a-f]{6}$/i.test(x.renk)) m.style.setProperty('--vr', x.renk);
  return m;
}

function isaretleriBlogaUygula(b) {
  for (const x of S.isaretler) {
    if (x.son <= b.bas || x.bas >= b.son) continue;
    araligiSar([b], x.bas, x.son, () => isaretKur(x));
  }
}

/** Kayıtlı vurguları metne yerleştirir; yerleşmeyenler SİLİNMEZ, raporlanır. */
function vurgulariYerlestir() {
  if (!S.madde) return [];
  for (const m of [...S.metinKok.querySelectorAll('mark.vurgu')]) sok(m);
  S.isaretler = S.isaretler.filter(x => x.tur !== 'vurgu');
  const liste = kullanici.vurgular.liste(S.key);
  const yerlesen = [];
  liste.forEach((v, sira) => {
    const yer = metindeBul(S.madde.metin, v.text);
    if (!yer) return;
    const x = { tur: 'vurgu', bas: yer[0], son: yer[1], renk: v.renk, sira };
    if (araligiSar(S.bloklar, x.bas, x.son, () => isaretKur(x)).length) { S.isaretler.push(x); yerlesen.push(sira); }
  });
  const yok = kullanici.vurgular.yerlestirmeRaporu(S.key, yerlesen);
  S.yerlesmeyen = new Set(yok.map(x => x.sira));
  if (S.notlariYenile) S.notlariYenile();
  return yok;
}

async function aramaUygula(sorgu, sinyal) {
  let araliklar = [];
  try {
    const m = await import('../cekirdek/metin.js');
    if (typeof m.vurguAraliklari !== 'function') throw new Error('vurguAraliklari yok');
    araliklar = m.vurguAraliklari(S.madde.metin, sorgu) || [];
  } catch (e) {
    console.warn('Arama vurgusu yapılamadı; madde vurgusuz açıldı:', e && e.message);
    return null;
  }
  if (sinyal.aborted) return null;
  const isaretli = [];
  for (const [bas, son] of araliklar) {
    if (!(son > bas)) continue;
    const x = { tur: 'arama', bas, son };
    if (araligiSar(S.bloklar, bas, son, () => isaretKur(x)).length) { S.isaretler.push(x); isaretli.push(x); }
  }
  aramaSeridi(sorgu, isaretli.length);
  return S.metinKok.querySelector('mark.arama');
}

function aramaSeridi(sorgu, sayi) {
  const s = S.aramaSerit;
  if (!sayi) {
    doldur(s, h('span', `“${sorgu}” bu maddenin metninde aynen geçmiyor.`), h('button.oku-dg', { type: 'button', 'aria-label': 'Kapatın', onclick: aramaKapat }, simge(YOL.kapat)));
    s.hidden = false;
    return;
  }
  let i = 0;
  const sayac = h('span.oku-arama-sayi', { 'aria-live': 'polite' });
  const git = yon => {
    const hepsi = [...S.metinKok.querySelectorAll('mark.arama')];
    if (!hepsi.length) return;
    i = (i + yon + hepsi.length) % hepsi.length;
    hepsi.forEach(m => m.classList.remove('etkin'));
    hepsi[i].classList.add('etkin');
    hepsi[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
    sayac.textContent = `${i + 1} / ${hepsi.length}`;
  };
  sayac.textContent = `${sayi} yer`;
  doldur(s,
    h('span.oku-arama-sorgu', '“', sorgu, '”'),
    sayac,
    h('button.oku-dg', { type: 'button', 'aria-label': 'Önceki eşleşme', title: 'Önceki eşleşme', onclick: () => git(-1) }, simge(YOL.yukari)),
    h('button.oku-dg', { type: 'button', 'aria-label': 'Sonraki eşleşme', title: 'Sonraki eşleşme', onclick: () => git(1) }, simge(YOL.asagi)),
    h('button.oku-dg', { type: 'button', 'aria-label': 'Arama vurgusunu kaldırın', title: 'Vurguyu kaldırın', onclick: aramaKapat }, simge(YOL.kapat)));
  s.hidden = false;
  i = -1;
  requestAnimationFrame(() => { const ilk = S.metinKok.querySelector('mark.arama'); if (ilk) { ilk.classList.add('etkin'); i = 0; sayac.textContent = `1 / ${sayi}`; } });
}

function aramaKapat() {
  for (const m of [...S.metinKok.querySelectorAll('mark.arama')]) sok(m);
  S.isaretler = S.isaretler.filter(x => x.tur !== 'arama');
  S.aramaSerit.hidden = true;
  S.sorgu = '';
  S.baglam.yerineYaz(location.pathname);
}

/* ───────────────────────── Bitirme ───────────────────────── */

function bitirCiz() {
  const a = S.bitirAlan;
  const bitti = okumaPlani.bittiMi(S.key);
  const plan = okumaPlani.aktifMi();
  doldur(a,
    h('button.oku-bitir-dg', { type: 'button', 'aria-pressed': String(bitti), onclick: () => bitir(!okumaPlani.bittiMi(S.key)) },
      h('span.oku-bitir-isaret', { 'aria-hidden': 'true' }, bitti ? simge(YOL.tamam) : null),
      bitti ? 'Bu maddeyi bitirdiniz' : 'Bu maddeyi bitirdim'),
    h('p.oku-bitir-not', bitti
      ? (plan ? 'Okuma planınıza işlendi. Geri almak için yeniden basın.' : 'Bitirdiğiniz maddeler kaydedilir. Geri almak için yeniden basın.')
      : (plan ? 'Okuma planınıza işlenir.' : ['Bitirdiğiniz maddeler kaydedilir. ', h('a', { href: '/calisma-alanim' }, 'Okuma planı'), ' kurarak kitabı baştan sona okuyabilirsiniz.'])));
}

function bitir(bitti, { sessiz = false } = {}) {
  const liste = maddeler();
  if (!liste) { bildir('Fihrist yüklenemediği için kaydedilemedi.'); return; }
  const sonuc = okumaPlani.maddeBitir(S.key, bitti, liste, { sessiz });
  bitirCiz();
  if (sonuc.olay === 'hatim-tamam') bildir('Elhamdülillah, kitabı baştan sona okudunuz.', { sure: 7000 });
  else if (sonuc.olay === 'bugunku-pay-tamam') bildir('Bugünkü okumanızı tamamladınız.', { sure: 5000 });
  else if (!sessiz) bildir(bitti ? 'Madde bitirildi olarak kaydedildi.' : 'Bitirme kaydı kaldırıldı.');
}

function otomatikBitirDene(oran) {
  if (S.otomatikBitti || !S.madde || !S.fihrist) return;
  const key = S.key;
  if (!okumaPlani.otomatikBitirilmeli({ oran, acilisMs: S.acilis, uzunluk: S.madde.uzunluk, bitti: okumaPlani.bittiMi(key), dahaOnceOtomatik: S.otomatikBitti })) return;
  S.otomatikBitti = true;
  okumaPlani.maddeBitir(key, true, maddeler(), { sessiz: true });
  bitirCiz();
  bildir('Bu madde bitirildi olarak işaretlendi.', { sure: 6000, eylem: { ad: 'Geri alın', yap: () => { okumaPlani.maddeBitir(key, false, maddeler(), { sessiz: true }); if (S.key === key) bitirCiz(); } } });
}

/* ───────────────────────── Araçlar ───────────────────────── */

function dinle() {
  if (!S.calar.var()) { bildir('Bu madde seslendirilmemiş; kitabın eski baskısında sesi yoktur.'); return; }
  if (S.calar.acikMi()) S.calar.kapat();
  else S.calar.ac();
  S.dg.dinle.setAttribute('aria-pressed', String(S.calar.acikMi()));
}

function yerImiGoster() {
  const var_ = kullanici.yerImleri.varMi(S.key);
  const d = S.dg.yerImi;
  d.setAttribute('aria-pressed', String(var_));
  d.title = var_ ? 'Yer imini kaldırın (B)' : 'Yer imi ekleyin (B)';
  d.setAttribute('aria-label', var_ ? 'Yer imini kaldırın' : 'Yer imi ekleyin');
}

function yerImiDegistir() {
  if (!S.madde) return;
  const var_ = kullanici.yerImleri.varMi(S.key);
  if (var_) kullanici.yerImleri.cikar(S.key);
  else kullanici.yerImleri.ekle(S.key, S.madde.baslik);
  yerImiGoster();
  bildir(var_ ? 'Yer imi kaldırıldı.' : 'Yer imi eklendi.');
}

async function panoyaYaz(metin) {
  try { await navigator.clipboard.writeText(metin); return true; }
  catch (e) {
    try {
      const t = h('textarea', { style: { position: 'fixed', opacity: '0' } }, metin);
      document.body.append(t); t.select();
      const tamam = document.execCommand('copy');
      t.remove();
      return tamam;
    } catch (e2) { return false; }
  }
}
S.panoyaYaz = panoyaYaz;

/** Maddeyi (ya da seçili alıntıyı) paylaşır: Web Share varsa onunla, yoksa panoya. */
async function paylas(alinti = '') {
  if (!S.madde) return;
  const m = S.madde;
  const url = location.origin + `/madde/${m.kisim}/${m.no}`;
  const kunye = `Se’âdet-i Ebediyye, ${kisimAdi(m.kisim)}, Madde ${m.no} (sahîfe ${sahifeYaz(m.sahife[0], m.sahife[1])})`;
  const metin = alinti ? `“${alinti}”\n— ${kunye}` : `${m.baslik}\n${kunye}`;
  if (navigator.share) {
    try { await navigator.share({ title: m.baslik, text: metin, url }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const tamam = await panoyaYaz(`${metin}\n${url}`);
  bildir(tamam ? (alinti ? 'Alıntı künyesiyle kopyalandı.' : 'Bağlantı kopyalandı.') : 'Kopyalanamadı; adresi tarayıcının çubuğundan alabilirsiniz.');
}

/* ───────────────────────── Klavye ───────────────────────── */

function tusa(e) {
  if (!S.madde || e.defaultPrevented) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const hedef = e.target;
  if (e.key === 'Escape') {
    if (pencereAcik()) return;              // açık pencere kendi Esc'ini işler
    if (S.secim.kapat()) return;
    if (S.hasiye.kapat(true)) return;
    if (S.sahife.acikMi()) { S.sahife.kapat(); return; }
    return;
  }
  if (yaziyor(hedef) || pencereAcik()) return;
  const kaydirmaKutusu = hedef && hedef.closest && hedef.closest('.oku-tablo-kutu, .oku-sahife');
  const k = e.key;
  const git = adres => { if (adres) { S.dgOdak = null; S.baglam.git(maddeKimlik.yol(adres)); } };
  if ((k === 'j' || k === 'J' || (k === 'ArrowRight' && !kaydirmaKutusu))) { e.preventDefault(); git(S.madde.sonraki); }
  else if ((k === 'k' || k === 'K' || (k === 'ArrowLeft' && !kaydirmaKutusu))) { e.preventDefault(); git(S.madde.onceki); }
  else if (k === '+' || k === '=') { e.preventDefault(); kullanici.yaziBoyutu.degistir(1); ayarUygula(S); bildir('Yazı boyutu: %' + Math.round(kullanici.yaziBoyutu.al() * 100), { sure: 1200 }); }
  else if (k === '-' || k === '−') { e.preventDefault(); kullanici.yaziBoyutu.degistir(-1); ayarUygula(S); bildir('Yazı boyutu: %' + Math.round(kullanici.yaziBoyutu.al() * 100), { sure: 1200 }); }
  else if (k === 'b' || k === 'B') { e.preventDefault(); yerImiDegistir(); }
  else if (k === 'l' || k === 'L') {
    e.preventDefault();
    const acik = !kullanici.okumaAyarlari.etkin().lugat;
    kullanici.okumaAyarlari.yaz('lugat', acik);
    ayarUygula(S);
    bildir(acik ? 'Lügat çizgileri açık.' : 'Lügat çizgileri kapalı.', { sure: 1400 });
  }
  else if (k === 'f' || k === 'F') { e.preventDefault(); cekmeceAc(S, S.dg.fihrist); }
  else if (k === '?') { e.preventDefault(); kisayollarAc(); }
}

/* ───────────────────────── Görünüm ───────────────────────── */

export default {
  ad: 'okuyucu',
  async kur(kap, p, baglam) {
    S.kap = kap;
    S.baglam = baglam;
    S.kabuk = false;
    baglam.temizle(() => { kabukYokEt(); S.kap = null; });
    const kimlik = maddeKimlik.coz(p.kisim, p.no);
    if (!kimlik) { bulunamadiCiz(baglam); return; }
    await cssYukle('/css/okuyucu.css');
    await maddeAc(kimlik, baglam, { ilk: true });
  },
  async guncelle(p, baglam) {
    S.baglam = baglam;
    const kimlik = maddeKimlik.coz(p.kisim, p.no);
    if (!kimlik) { S.istek++; kabukYokEt(); bulunamadiCiz(baglam); return; }
    await cssYukle('/css/okuyucu.css');
    await maddeAc(kimlik, baglam);
  }
};
