/* Dinî Lügat (/sozluk) — basılı bir lügat sayfası gibi dizilmiş, yazarken bulan sözlük.
   Adres: /sozluk?harf=M#sozluk-entry-619 (eski bağlantılar), ?q=… arama.
   Bir harf 2.000 terimi bulabilir: önce ilk sahîfeler çizilir, kalanı kaydırdıkça ya da boşta eklenir.
   Her "sahîfe" kendi iki sütununu taşır; sonradan eklenen sahîfe öncekilerin dizgisini oynatmaz. */

import { h, doldur, durum, semse, simge } from '../cekirdek/dom.js';
import { veri } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { sayi } from '../cekirdek/bicim.js';
import { duzle, duzleEslemeli, asilAralik } from '../cekirdek/metin.js';
import { bildir } from '../bilesen/bildirim.js';

const ALFABE = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'];
const SAHIFE = 40;          // bir sahîfedeki terim
const ILK = 80;             // ilk boyamada çizilen terim
const UZUN_MISAL = 360;     // bundan uzun misal kısaltılmış gösterilir (metin değişmez; CSS ile)
const SONUC_EN_COK = 80;
const CAPA = /^sozluk-entry-(\d+)$/;

// Geri dönüşte (tarayıcı geri tuşu) kaydırma konumu tutsun diye: geçmiş kaydı → çizilmiş terim sayısı
const cizimIzi = new Map();
let D = null;               // etkin görünümün durumu (görünümden çıkınca null)

const yol = (harf, id) => `/sozluk?harf=${encodeURIComponent(harf)}` + (id ? `#sozluk-entry-${id}` : '');
const iptalMi = e => e && (e.name === 'AbortError' || e.tur === 'iptal');
const bosta = fn => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(() => fn({ timeRemaining: () => 12 }), 60));
const bostaIptal = k => (typeof cancelIdleCallback === 'function' ? cancelIdleCallback(k) : clearTimeout(k));

/* ── Metin parçalama (kitabın metni değişmez; yalnız düğümlere bölünür) ── */

/** "1.Kapı. 2.Bir kitabın…" → [{no:'1.', metin:'Kapı. '}, …]; sıralı numara yoksa null. */
function numaraliAnlamlar(anlam) {
  if (!/^1\.\s?\S/.test(anlam)) return null;
  const kesitler = [0];
  let ara = 2;
  for (let k = 2; k < 40; k++) {
    const re = new RegExp('\\s' + k + '\\.\\s?\\S', 'g');
    re.lastIndex = ara;
    const m = re.exec(anlam);
    if (!m) break;
    kesitler.push(m.index + 1);
    ara = m.index + 2;
  }
  if (kesitler.length < 2) return null;
  return kesitler.map((bas, i) => {
    const parca = anlam.slice(bas, kesitler[i + 1] ?? anlam.length);
    const m = /^(\d+\.)([\s\S]*)$/.exec(parca);
    return { no: m[1], metin: m[2] };
  });
}

/** Metni "(Bkz. X, Y)" parçalarında hedef bağlantısıyla döndürür; bulunamayan hedef düz metin kalır. */
function bkzIsle(metin) {
  const sonuc = [];
  const re = /\(Bkz\.\s*([^)]*)\)/g;
  let son = 0, m;
  while ((m = re.exec(metin))) {
    const icBas = m.index + m[0].length - 1 - m[1].length;
    sonuc.push(metin.slice(son, icBas));
    const ic = m[1];
    const parcaRe = /[^,]+/g;
    let p, sonIc = 0;
    while ((p = parcaRe.exec(ic))) {
      const bosBas = p[0].length - p[0].trimStart().length;
      const ad = p[0].trim();
      sonuc.push(ic.slice(sonIc, p.index + bosBas));
      sonuc.push(hedefBag(ad));
      sonIc = p.index + bosBas + ad.length;
    }
    sonuc.push(ic.slice(sonIc));
    son = icBas + ic.length;
  }
  sonuc.push(metin.slice(son));
  return sonuc.filter(x => x !== '');
}

/** Bkz. hedefi: lügatte bulunursa bağlantı, değilse düz metin. Terim listesi gelmeden çizilenler sonra bağlanır. */
function hedefBag(ad) {
  const id = D && D.kelimeId ? D.kelimeId.get(duzle(ad)) : undefined;
  if (id) return h('a.lt-bkz-bag', { href: yol(D.idHarf(id), id), dataset: { terim: id } }, ad);
  return h('span.lt-bkz-ad', { dataset: { bkz: ad } }, ad);
}

/** Aranan kesimi <mark> ile işaretler (şapka/büyük harf farkı gözetmeden). */
function isaretle(metin, qd) {
  if (!qd) return [metin];
  const { duz, konum } = duzleEslemeli(metin);
  const i = duz.indexOf(qd);
  if (i < 0) return [metin];
  const [bas, son] = asilAralik(metin, konum, i, i + qd.length);
  return [metin.slice(0, bas), h('mark', metin.slice(bas, son)), metin.slice(son)];
}

/* ── Çizim ── */

const bagSimge = () => simge(['M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2', 'M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2']);

function terimCiz(t) {
  const koken = t.koken && D.dizin.kokenler[t.koken] && D.dizin.kokenler[t.koken].ad;
  const anlamlar = numaraliAnlamlar(t.anlam || '');
  const uzun = t.misal && t.misal.length > UZUN_MISAL;
  return h('article.lt', { id: `sozluk-entry-${t.id}`, dataset: { id: t.id } },
    h('header.lt-bas',
      h('h3.lt-kelime', t.kelime),
      t.osmanlica ? h('span.lt-osm', { lang: 'ar', dir: 'rtl' }, t.osmanlica) : null,
      koken ? h('span.lt-koken', koken) : null,
      h('button.lt-kopya', { type: 'button', title: 'Bağlantıyı kopyalayın', 'aria-label': `${t.kelime} teriminin bağlantısını kopyalayın`, dataset: { kopya: t.id } }, bagSimge())),
    anlamlar
      ? h('ol.lt-anlam.lt-anlamlar', anlamlar.map(a => h('li', h('span.lt-no', a.no), bkzIsle(a.metin))))
      : h('p.lt-anlam', bkzIsle(t.anlam || '')),
    t.misal ? h('.lt-misal' + (uzun ? '.kisa' : ''), { id: `lt-misal-${t.id}` }, h('p', t.misal)) : null,
    uzun ? h('button.lt-misal-ac', { type: 'button', 'aria-expanded': 'false', 'aria-controls': `lt-misal-${t.id}` }, 'Misali gösterin') : null,
    t.bakiniz ? h('p.lt-bkz', h('span.lt-bkz-et', 'Bkz.'), ' ', bkzIsle(`(Bkz. ${t.bakiniz})`).slice(1, -1)) : null);
}

function sahifeCiz(terimler) {
  return h('section.lg-sahife', { 'aria-label': `${terimler[0].kelime} – ${terimler[terimler.length - 1].kelime}` },
    h('.lg-sahife-bas', { 'aria-hidden': 'true' }, h('span', terimler[0].kelime), h('span', terimler[terimler.length - 1].kelime)),
    h('.lg-sutunlar', terimler.map(terimCiz)));
}

/** Bir sonraki sahîfeyi ekler; eklenecek kalmadıysa false. */
function sahifeEkle() {
  if (!D || !D.liste) return false;
  const n = D.liste.length;
  if (D.cizilen >= n) return false;
  const son = Math.min(D.cizilen + SAHIFE, n);
  D.sahifeler.appendChild(sahifeCiz(D.liste.slice(D.cizilen, son)));
  D.cizilen = son;
  if (son >= n) D.sonIsaret.hidden = true;
  return true;
}

function kadarCiz(adet) { while (D.cizilen < Math.min(adet, D.liste.length) && sahifeEkle()); }

function bostaDevam() {
  if (D.bostaKimlik) bostaIptal(D.bostaKimlik);
  const kendi = D;
  D.bostaKimlik = bosta(son => {
    if (D !== kendi) return;
    D.bostaKimlik = null;
    while ((son.timeRemaining() > 6 || son.didTimeout) && sahifeEkle()) if (son.didTimeout) break;
    if (D.cizilen < D.liste.length) bostaDevam();
  });
}

/** Seçili harfi ve (varsa) hedef terimi çizer. */
async function harfAc(harf, { hedef = null } = {}) {
  const kendi = D;
  if (D.harf !== harf || !D.liste) {
    D.harf = harf;
    harfCubuguIsaretle();
    doldur(D.govde, h('.lg-bekle', { 'aria-hidden': 'true' }));
    let liste;
    try {
      liste = await veri.lugatHarf(harf, { sinyal: D.sinyal });
    } catch (e) {
      if (iptalMi(e) || D !== kendi) return;
      doldur(D.govde, hataDurumu(e, () => { D.liste = null; harfAc(harf, { hedef }); }));
      return;
    }
    if (D !== kendi || D.harf !== harf) return;
    D.liste = liste;
    D.cizilen = 0;
    const bilgi = D.dizin.harfler.find(x => x.harf === harf);
    D.sahifeler = h('.lg-sahifeler');
    D.sonIsaret = h('.lg-son-isaret', { 'aria-hidden': 'true' });
    doldur(D.govde,
      h('header.lg-harf-bas',
        h('.lg-harf-rozet', semse({}, false), h('span', harf)),
        h('div',
          h('h2.lg-harf-ad', `${harf} harfi`),
          h('p.kunye', `${sayi(bilgi ? bilgi.sayi : liste.length)} terim`),
          liste.length ? h('p.lg-harf-aralik', h('span', liste[0].kelime), h('span.lg-ok', { 'aria-hidden': 'true' }, '—'), h('span', liste[liste.length - 1].kelime)) : null)),
      D.sahifeler, D.sonIsaret);
    D.gozcu.disconnect();
    D.gozcu.observe(D.sonIsaret);
  }
  const iz = D.izAdet || 0;
  D.izAdet = 0;
  let sira = -1;
  if (hedef) sira = D.liste.findIndex(t => t.id === hedef);
  kadarCiz(Math.max(ILK, iz, sira >= 0 ? sira + SAHIFE : 0));
  bostaDevam();
  return sira >= 0 ? document.getElementById(`sozluk-entry-${hedef}`) || D.govde.querySelector(`[data-id="${hedef}"]`) : null;
}

function hedefIsaretle(el) {
  if (!el) return;
  for (const eski of D.govde.querySelectorAll('.lt.hedef')) eski.classList.remove('hedef');
  el.classList.add('hedef');
}

function harfCubuguIsaretle() {
  for (const a of D.cubuk.querySelectorAll('a')) {
    if (a.dataset.harf === D.harf && !D.aramada) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
  const etkin = D.cubuk.querySelector('[aria-current]');
  if (etkin && D.cubuk.scrollWidth > D.cubuk.clientWidth) {
    const sol = etkin.offsetLeft - D.cubuk.clientWidth / 2 + etkin.offsetWidth / 2;
    D.cubuk.scrollTo({ left: Math.max(0, sol) });
  }
}

/* ── Arama ── */

function terimListesi() {
  if (!D.terimSoz) {
    const kendi = D;
    D.terimSoz = veri.lugatTerimler({ sinyal: D.sinyal }).then(r => {
      if (D !== kendi) return null;
      D.terimDuz = r.terimler.map(t => ({ id: t.id, kelime: t.kelime, duz: duzle(t.kelime) }));
      D.kelimeId = new Map();
      for (const t of D.terimDuz) if (!D.kelimeId.has(t.duz)) D.kelimeId.set(t.duz, t.id);
      bkzBagla(D.govde);
      return D.terimDuz;
    }).catch(e => { if (D === kendi) D.terimSoz = null; throw e; });
  }
  return D.terimSoz;
}

/** Terim listesi gelmeden çizilmiş "Bkz." adlarını bağlantıya çevirir. */
function bkzBagla(kok) {
  if (!D.kelimeId) return;
  for (const s of kok.querySelectorAll('span.lt-bkz-ad')) s.replaceWith(hedefBag(s.dataset.bkz));
}

function aramaSonuclari(qd) {
  // Sıra: tam eşleşme · baştan ve kelime olarak · baştan · bir kelimenin başında · içinde
  const kume = [[], [], [], [], []];
  const sinir = c => c === undefined || c === ' ' || c === '-';
  for (const t of D.terimDuz) {
    const i = t.duz.indexOf(qd);
    if (i < 0) continue;
    if (i === 0) kume[t.duz.length === qd.length ? 0 : sinir(t.duz[qd.length]) ? 1 : 2].push(t);
    else if (t.duz[i - 1] === ' ' || t.duz[i - 1] === '-') kume[3].push(t);
    else kume[4].push(t);
  }
  const sirala = (a, b) => a.duz.length - b.duz.length || a.duz.localeCompare(b.duz, 'tr');
  return kume.flatMap(k => k.sort(sirala));
}

async function ara(sorgu) {
  const q = sorgu.trim();
  const qd = duzle(q).trim();
  const no = ++D.aramaNo;
  D.sorgu = q;
  D.temizDugme.hidden = !D.girdi.value;
  baglamYaz();
  if (!qd) { aramaKapat(); return; }
  D.aramada = true;
  harfCubuguIsaretle();
  D.govde.hidden = true;
  D.sonucKap.hidden = false;
  if (!D.terimDuz) {
    doldur(D.sonucKap, h('p.kunye.lg-sonuc-sayi', 'Lügat hazırlanıyor…'));
    try { await terimListesi(); } catch (e) {
      if (iptalMi(e) || no !== D.aramaNo) return;
      doldur(D.sonucKap, hataDurumu(e, () => ara(D.girdi.value)));
      return;
    }
    if (!D || no !== D.aramaNo) return;
  }
  const hepsi = aramaSonuclari(qd);
  const gosterilen = hepsi.slice(0, SONUC_EN_COK);
  D.sonuclar = gosterilen;
  if (!hepsi.length) {
    doldur(D.sonucKap,
      h('.lg-bos',
        h('p.lg-bos-bas', `“${q}” lügatte bulunamadı.`),
        h('p', 'Yazılışı değiştirerek ya da kelimenin kökünü yazarak deneyin. Kelime kitabın metninde geçiyor olabilir:'),
        h('.sira', h('a.dugme', { href: '/arama/' + encodeURIComponent(q) }, 'Kitapta arayın'),
          h('button.dugme', { type: 'button', onclick: () => { D.girdi.value = ''; ara(''); D.girdi.focus(); } }, 'Aramayı temizleyin'))));
    D.duyuru.textContent = 'Sonuç yok';
    return;
  }
  const liste = h('ol.lg-sonuclar', { 'aria-label': 'Lügat arama sonuçları' }, gosterilen.map(t => {
    const harf = D.idHarf(t.id);
    return h('li', h('a.lg-sonuc', { href: yol(harf, t.id), dataset: { terim: t.id } },
      h('span.lg-sonuc-kelime', isaretle(t.kelime, qd)),
      h('span.lg-sonuc-harf', harf),
      h('span.lg-sonuc-anlam', { dataset: { onizleme: t.id } }, ' ')));
  }));
  doldur(D.sonucKap,
    h('p.kunye.lg-sonuc-sayi', hepsi.length > gosterilen.length
      ? `${sayi(hepsi.length)} terim · ilk ${gosterilen.length} tanesi gösteriliyor; aramayı daraltın`
      : `${sayi(hepsi.length)} terim`),
    liste);
  D.duyuru.textContent = `${hepsi.length} terim bulundu`;
  onizlemeDoldur(gosterilen.slice(0, 24), no);
}

/** İlk sonuçların anlamını (bir satır) doldurur; gereken harf parçaları önbellekten ya da ağdan gelir. */
async function onizlemeDoldur(terimler, no) {
  const harfler = [...new Set(terimler.map(t => D.idHarf(t.id)))].slice(0, 4);
  const harita = new Map();
  for (const harf of harfler) {
    try {
      const liste = await veri.lugatHarf(harf, { sinyal: D.sinyal });
      for (const t of liste) harita.set(t.id, t);
    } catch (e) { if (iptalMi(e)) return; }
    if (!D || no !== D.aramaNo) return;
    for (const s of D.sonucKap.querySelectorAll('[data-onizleme]')) {
      const t = harita.get(+s.dataset.onizleme);
      if (t) { s.textContent = t.anlam; s.removeAttribute('data-onizleme'); }
    }
  }
  if (!D || no !== D.aramaNo) return;
  for (const s of D.sonucKap.querySelectorAll('[data-onizleme]')) s.remove();
}

function aramaKapat() {
  D.aramada = false;
  if (D.temizDugme) D.temizDugme.hidden = !D.girdi.value;
  D.sonucKap.hidden = true;
  doldur(D.sonucKap);
  D.govde.hidden = false;
  harfCubuguIsaretle();
}

/** Bir terimi açar: harfini yükler, terime kaydırır, adresi yazar. */
async function terimAc(id, { odak = true } = {}) {
  const harf = D.idHarf(id);
  if (!harf) return;
  D.girdi.value = '';
  D.sorgu = '';
  D.aramaNo++;
  aramaKapat();
  const el = await harfAc(harf, { hedef: id });
  if (!el) return;
  D.baglam.yerineYaz(yol(harf, id));
  basligiYaz(id);
  hedefIsaretle(el);
  el.scrollIntoView({ block: 'start' });
  if (odak) { el.tabIndex = -1; el.focus({ preventScroll: true }); }
}

/* ── Adres ── */

function baglamYaz() {
  const s = new URLSearchParams();
  s.set('harf', D.harf);
  if (D.sorgu) s.set('q', D.sorgu);
  D.baglam.yerineYaz('/sozluk?' + s.toString());
}

function basligiYaz(id) {
  const t = id && D.liste && D.liste.find(x => x.id === id);
  if (t) {
    D.baglam.baslikYaz(`${t.kelime} · Dinî Lügat`);
    D.baglam.metaYaz({ aciklama: t.anlam, kanonik: location.origin + yol(D.harf, t.id) });
  } else {
    D.baglam.baslikYaz('Dinî Lügat');
    D.baglam.metaYaz({ aciklama: genelAciklama(), kanonik: location.origin + '/sozluk' + (D.harf && D.harf !== 'A' ? '?harf=' + encodeURIComponent(D.harf) : '') });
  }
}

const genelAciklama = () => `Se’âdet-i Ebediyye okurken karşılaşılan ${sayi(D.dizin.sayi)} dinî terimin mânâsı, Arap harfli yazılışı, kökeni ve misâlleri.`;

function adrestenOku(baglam) {
  const harfHam = (baglam.sorgu.get('harf') || '').trim();
  let harf = harfHam ? harfHam.toLocaleUpperCase('tr') : '';
  const m = CAPA.exec(baglam.karma || '');
  const hedef = m ? +m[1] : null;
  if (hedef && D.idHarf(hedef)) harf = D.idHarf(hedef);
  if (!D.dizin.harfler.some(x => x.harf === harf)) harf = 'A';
  return { harf, hedef: hedef && D.idHarf(hedef) ? hedef : null, q: baglam.sorgu.get('q') || '' };
}

/* ── Hata ── */

function hataDurumu(e, tekrar) {
  const yok = e && e.tur === 'cevrimdisi';
  return durum(yok ? 'Bağlantı yok' : 'Lügat yüklenemedi',
    yok ? 'İnternete bağlandığınızda yeniden deneyin. Daha önce açtığınız harfler bağlantısız da açılır.' : 'Bir aksaklık oldu. Biraz sonra yeniden deneyin.',
    h('button.dugme.dugme-ana', { type: 'button', onclick: tekrar }, 'Yeniden deneyin'));
}

/* ── Görünüm ── */

export default {
  ad: 'lugat',
  baslik: 'Dinî Lügat',

  async kur(kap, p, baglam) {
    await cssYukle('/css/lugat.css');
    let dizin;
    try {
      dizin = await veri.lugatDizin({ sinyal: baglam.sinyal });
    } catch (e) {
      if (iptalMi(e)) return;
      kap.append(h('.kap', hataDurumu(e, () => { doldur(kap); this.kur(kap, p, baglam); })));
      return;
    }

    const parcaHarf = dizin.parcalar.map(x => ({ harf: x.harf, araliklar: x.araliklar }));
    D = {
      dizin, baglam, sinyal: baglam.sinyal, harf: null, liste: null, cizilen: 0, aramaNo: 0, sorgu: '', aramada: false,
      idHarf(id) {
        const n = +id;
        const p = parcaHarf.find(x => x.araliklar.some(([a, b]) => a <= n && n <= b));
        return p ? p.harf : null;
      }
    };
    const kendi = D;
    const ilk = adrestenOku(baglam);
    const anahtar = history.state && history.state.k;
    D.izAdet = (anahtar && cizimIzi.get(anahtar)) || 0;

    // Üst kısım
    const varHarf = new Map(dizin.harfler.map(x => [x.harf, x.sayi]));
    D.girdi = h('input.alan.lg-girdi#lg-ara', {
      type: 'search', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'search',
      placeholder: 'Kelime yazın: nemâz, âb…', 'aria-describedby': 'lg-ara-not', 'aria-controls': 'lg-sonuc'
    });
    D.duyuru = h('span.gizli-yazi', { 'aria-live': 'polite' });
    D.cubuk = h('nav.lg-harfler', { 'aria-label': 'Harfler' },
      ALFABE.map(harf => varHarf.get(harf)
        ? h('a', { href: yol(harf), dataset: { harf }, title: `${harf}: ${sayi(varHarf.get(harf))} terim` }, harf)
        : h('span', { 'aria-disabled': 'true', title: `${harf} harfiyle başlayan terim yok` }, harf)));
    D.govde = h('.lg-govde');
    D.sonucKap = h('.lg-sonuc-kap#lg-sonuc', { hidden: true });
    D.gozcu = new IntersectionObserver(girdiler => {
      if (D !== kendi) return;
      if (girdiler.some(g => g.isIntersecting)) { sahifeEkle(); sahifeEkle(); }
    }, { rootMargin: '0px 0px 1600px 0px' });

    kap.append(
      h('header.kap.lg-ust',
        h('p.ust-yazi.surh', 'Kelimeler ve ıstılahlar'),
        h('h1.baslik-1.lg-baslik', 'Dinî Lügat'),
        h('p.kunye.lg-kunye', `${sayi(dizin.sayi)} terim · Arap harfli yazılışı, kökeni ve misâliyle`),
        h('form.lg-ara', { role: 'search', onsubmit: e => { e.preventDefault(); const ilkSonuc = D.sonucKap.querySelector('a'); if (ilkSonuc) terimAc(+ilkSonuc.dataset.terim); } },
          h('label.gizli-yazi', { for: 'lg-ara' }, 'Lügatte arayın'),
          simge(['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-4-4'], { class: 'lg-ara-simge' }),
          D.girdi,
          D.temizDugme = h('button.lg-temizle', { type: 'button', hidden: true, 'aria-label': 'Aramayı temizleyin', onclick: () => { D.girdi.value = ''; ara(''); D.girdi.focus(); } },
            simge('M6 6l12 12M18 6 6 18'))),
        h('p.lg-ara-not.kunye#lg-ara-not', 'Şapka ve büyük-küçük harf farkı gözetilmez.', D.duyuru)),
      h('.lg-cubuk-kap', h('.kap', D.cubuk)),
      h('.kap.lg-ana', D.sonucKap, D.govde));

    // Olaylar
    let gecikme = 0;
    D.girdi.addEventListener('input', () => { clearTimeout(gecikme); gecikme = setTimeout(() => ara(D.girdi.value), 70); });
    D.girdi.addEventListener('focus', () => terimListesi().catch(() => {}), { once: true });
    D.girdi.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { const a = D.sonucKap.querySelector('a'); if (a && !D.sonucKap.hidden) { e.preventDefault(); a.focus(); } }
      else if (e.key === 'Escape' && D.girdi.value) { e.preventDefault(); e.stopPropagation(); D.girdi.value = ''; ara(''); }
    });
    D.sonucKap.addEventListener('keydown', e => {
      const baglar = [...D.sonucKap.querySelectorAll('a.lg-sonuc')];
      const i = baglar.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); (baglar[i + 1] || baglar[i]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (i ? baglar[i - 1] : D.girdi).focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); D.girdi.focus(); }
    });
    D.sonucKap.addEventListener('click', e => {
      const a = e.target.closest('a.lg-sonuc');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      terimAc(+a.dataset.terim);
    });
    D.cubuk.addEventListener('click', e => {
      const a = e.target.closest('a[data-harf]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      D.girdi.value = '';
      D.sorgu = '';
      D.aramaNo++;
      aramaKapat();
      harfAc(a.dataset.harf).then(() => {
        if (D !== kendi) return;
        baglamYaz();
        basligiYaz(null);
        const ust = D.govde.getBoundingClientRect().top + scrollY - D.cubuk.offsetHeight - 80;
        if (scrollY > ust) scrollTo(0, Math.max(0, ust));
      });
    });
    D.govde.addEventListener('click', e => {
      const kopya = e.target.closest('[data-kopya]');
      if (kopya) {
        const id = +kopya.dataset.kopya;
        const adres = location.origin + yol(D.idHarf(id), id);
        const yaz = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(adres) : Promise.reject(new Error('pano yok'));
        yaz.then(() => bildir('Bağlantı kopyalandı'), () => bildir('Bağlantı kopyalanamadı: ' + adres, { sure: 6000 }));
        return;
      }
      const ac = e.target.closest('.lt-misal-ac');
      if (ac) {
        const kutu = document.getElementById(ac.getAttribute('aria-controls'));
        const acik = ac.getAttribute('aria-expanded') !== 'true';
        kutu.classList.toggle('kisa', !acik);
        ac.setAttribute('aria-expanded', String(acik));
        ac.textContent = acik ? 'Misali kısaltın' : 'Misali gösterin';
        if (!acik && kutu.getBoundingClientRect().top < 0) kutu.closest('.lt').scrollIntoView({ block: 'start' });
        return;
      }
      const bkz = e.target.closest('a[data-terim]');
      if (bkz && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) {
        e.preventDefault();
        baglam.git(bkz.getAttribute('href'));
      }
    });

    baglam.temizle(() => {
      if (D !== kendi) return;
      const k = history.state && history.state.k;
      if (k && D.cizilen > ILK) cizimIzi.set(k, D.cizilen);
      clearTimeout(gecikme);
      if (D.bostaKimlik) bostaIptal(D.bostaKimlik);
      D.gozcu.disconnect();
      D = null;
    });

    addEventListener('ilmihal:gorunum', () => { if (D === kendi) harfCubuguIsaretle(); }, { once: true, signal: baglam.sinyal });

    // İlk içerik: harf (ve çapa) ya da arama
    const el = await harfAc(ilk.harf, { hedef: ilk.hedef });
    if (D !== kendi) return;
    if (el) hedefIsaretle(el);
    basligiYaz(ilk.hedef);
    if (ilk.q) { D.girdi.value = ilk.q; ara(ilk.q); }
    else terimListesiBosta(kendi);
  },

  async guncelle(p, baglam) {
    if (!D) return;
    D.baglam = baglam;
    const yeni = adrestenOku(baglam);
    if (yeni.q) {
      if (yeni.harf !== D.harf) await harfAc(yeni.harf);
      D.girdi.value = yeni.q;
      await ara(yeni.q);
      return;
    }
    if (D.aramada || D.girdi.value) { D.girdi.value = ''; D.sorgu = ''; D.aramaNo++; aramaKapat(); }
    const el = await harfAc(yeni.harf, { hedef: yeni.hedef });
    if (!D) return;
    if (el) hedefIsaretle(el);
    basligiYaz(yeni.hedef);
  }
};

/** Bkz. bağlantıları ve arama için terim listesini boşta indirir. */
function terimListesiBosta(kendi) {
  bosta(() => { if (D === kendi) terimListesi().catch(() => {}); });
}
