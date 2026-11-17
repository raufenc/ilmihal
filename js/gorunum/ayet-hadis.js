/* Âyet-i Kerîme ve Hadîs-i Şerîf İndeksi: /ayet-hadis (?sekme=hadis&ara=…&sure=…&kaynak=…).
   Kitapta geçen meâller aynen basılır; künyeleri sahîfeye (kitabın aslı) ve maddeye götürür.
   Veride Arap harfli metin yoktur; süs olarak da eklenmez. */
import { h, doldur, durum, iskelet } from '../cekirdek/dom.js';
import { veri } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { sayi, ad, sahife, bitisik } from '../cekirdek/bicim.js';
import { duzle, duzleEslemeli, asilAralik, araliklariBirlestir } from '../cekirdek/metin.js';

const PARTI = 60;
const SEKMELER = {
  ayet: { ad: 'Âyet-i kerîmeler', tekil: 'âyet-i kerîme', alan: 'sure', suzgecAd: 'Sûreye göre süzün', hepsi: 'Bütün sûreler' },
  hadis: { ad: 'Hadîs-i şerîfler', tekil: 'hadîs-i şerîf', alan: 'kaynak', suzgecAd: 'Kaynağa göre süzün', hepsi: 'Bütün kaynaklar' }
};
const ACIKLAMA = 'Se’âdet-i Ebediyye’de meâlleriyle geçen âyet-i kerîmeler ve hadîs-i şerîfler. Her kayıt kitaptaki sahîfesine ve maddesine bağlıdır.';

function isaretli(metin, kelimeler) {
  if (!kelimeler.length) return metin;
  const { duz, konum } = duzleEslemeli(metin);
  const ar = [];
  for (const k of kelimeler) {
    for (let i = duz.indexOf(k); i >= 0; i = duz.indexOf(k, i + k.length)) ar.push(asilAralik(metin, konum, i, i + k.length));
  }
  const parcalar = [];
  let son = 0;
  for (const [b, s] of araliklariBirlestir(ar)) {
    if (b > son) parcalar.push(metin.slice(son, b));
    parcalar.push(h('mark', metin.slice(b, s)));
    son = s;
  }
  parcalar.push(metin.slice(son));
  return parcalar;
}

/** Süzgeç değerleri: yazımı farklı aynı adlar (Şûrâ / Şûra) tek seçenekte toplanır; gösterimde en sık yazım. */
function degerler(kayitlar, alan) {
  const m = new Map();
  for (const k of kayitlar) {
    const v = k.x[alan];
    if (!v) continue;
    const a = duzle(v);
    if (!m.has(a)) m.set(a, { anahtar: a, yazimlar: new Map(), sayi: 0 });
    const g = m.get(a);
    g.sayi++;
    g.yazimlar.set(v, (g.yazimlar.get(v) || 0) + 1);
  }
  return [...m.values()].map(g => ({ anahtar: g.anahtar, sayi: g.sayi, ad: [...g.yazimlar].sort((a, b) => b[1] - a[1])[0][0] }))
    .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

function sahifeBag(pdf, s) {
  if (!s) return null;
  return h('a.kaynak', { href: `${pdf}#page=${Math.min(s, 1248)}`, target: '_blank', rel: 'noopener', title: 'Kitabın aslında bu sahîfeyi açın (yeni sekme)' },
    'sahîfe ', h('span.sayi', sahife(s)));
}

function maddeBag(madde, kunyeler) {
  if (!madde) return null;
  const [k, n] = madde.split('-');
  const m = kunyeler.get(madde);
  return h('a.kaynak.ah-madde', { href: `/madde/${k}/${n}` }, h('b', `${k}/${n}`), m ? h('span', ad(m.baslik)) : null);
}

let d = null;

function sorguOku() {
  const q = new URLSearchParams(location.search);
  return { sekme: q.get('sekme') === 'hadis' ? 'hadis' : 'ayet', ara: q.get('ara') || '', deger: q.get(q.get('sekme') === 'hadis' ? 'kaynak' : 'sure') || '' };
}
function adresYap(s) {
  const q = new URLSearchParams();
  if (s.sekme === 'hadis') q.set('sekme', 'hadis');
  if (s.ara) q.set('ara', s.ara);
  if (s.deger) q.set(SEKMELER[s.sekme].alan, s.deger);
  const qs = q.toString();
  return '/ayet-hadis' + (qs ? '?' + qs : '');
}

async function ciz(kap, baglam) {
  const sec = { sinyal: baglam.sinyal };
  const [ah, fihrist] = await Promise.all([veri.ayetHadis(sec), veri.fihrist(sec)]);
  const kunyeler = new Map(fihrist.maddeler.map(m => [`${m.kisim}-${m.no}`, m]));
  const pdf = fihrist.kitap.pdf;
  const kumeler = {
    ayet: ah.ayetler.map(x => ({ x, duz: null })),
    hadis: ah.hadisler.map(x => ({ x, duz: null }))
  };
  const st = sorguOku();
  let kelimeler = [], suzulmus = [], cizilen = 0;

  baglam.baslikYaz('Âyet-i Kerîme ve Hadîs-i Şerîf İndeksi');
  baglam.metaYaz({ aciklama: ACIKLAMA, kanonik: location.origin + '/ayet-hadis' });

  const sekmeDugme = k => h('button', {
    type: 'button', role: 'tab', id: 'ah-sekme-' + k, 'aria-controls': 'ah-sonuc',
    'aria-selected': String(st.sekme === k), tabindex: st.sekme === k ? '0' : '-1', dataset: { sekme: k },
    onclick: () => sekmeSec(k)
  }, SEKMELER[k].ad, ' ', h('span.ah-secsayi.sayi', sayi(kumeler[k].length)));
  const sekmeler = h('.secim.ah-sekmeler', { role: 'tablist', 'aria-label': 'İndeks' }, sekmeDugme('ayet'), sekmeDugme('hadis'));
  sekmeler.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const yeni = st.sekme === 'ayet' ? 'hadis' : 'ayet';
    sekmeSec(yeni);
    sekmeler.querySelector(`[data-sekme="${yeni}"]`).focus();
  });

  const araAlan = h('input.alan.ah-ara', { type: 'search', value: st.ara, placeholder: 'Meâllerde arayın…', 'aria-label': 'Meâllerde arayın', autocomplete: 'off', spellcheck: 'false' });
  const degerSec = h('select.alan.ah-sec');
  const sayac = h('p.ah-sayac.kunye', { 'aria-live': 'polite' });
  const liste = h('ol.ah-liste');
  const gozcu = h('.ah-gozcu', { 'aria-hidden': 'true' });
  const sonuc = h('.ah-sonuc#ah-sonuc', { role: 'tabpanel' }, sayac, liste, gozcu);

  function secenekleriKur() {
    const S = SEKMELER[st.sekme];
    const ds = degerler(kumeler[st.sekme], S.alan);
    if (st.deger && !ds.some(x => x.anahtar === st.deger)) st.deger = '';
    degerSec.setAttribute('aria-label', S.suzgecAd);
    doldur(degerSec, h('option', { value: '' }, S.hepsi),
      ds.map(x => h('option', { value: x.anahtar, selected: x.anahtar === st.deger ? true : null }, `${x.ad} (${sayi(x.sayi)})`)));
    sonuc.setAttribute('aria-labelledby', 'ah-sekme-' + st.sekme);
  }

  function sekmeSec(k) {
    if (st.sekme === k) return;
    st.sekme = k; st.deger = '';
    for (const b of sekmeler.children) {
      const sec = b.dataset.sekme === k;
      b.setAttribute('aria-selected', String(sec));
      b.tabIndex = sec ? 0 : -1;
    }
    secenekleriKur();
    suz();
  }

  let zaman = null;
  araAlan.addEventListener('input', () => { clearTimeout(zaman); zaman = setTimeout(() => { st.ara = araAlan.value.trim(); suz(); }, 90); });
  araAlan.addEventListener('keydown', e => { if (e.key === 'Escape' && araAlan.value) { e.stopPropagation(); araAlan.value = ''; st.ara = ''; suz(); } });
  degerSec.addEventListener('change', () => { st.deger = degerSec.value; suz(); });

  function suz() {
    baglam.yerineYaz(adresYap(st));
    const S = SEKMELER[st.sekme];
    kelimeler = duzle(st.ara).split(' ').filter(Boolean);
    const kume = kumeler[st.sekme];
    suzulmus = kume.filter(k => {
      if (st.deger && (!k.x[S.alan] || duzle(k.x[S.alan]) !== st.deger)) return false;
      if (kelimeler.length) {
        if (k.duz === null) k.duz = duzle(k.x.metin);
        for (const w of kelimeler) if (!k.duz.includes(w)) return false;
      }
      return true;
    });
    const temel = `${sayi(kume.length)} ${S.tekil}`;
    sayac.textContent = (kelimeler.length || st.deger) ? `${sayi(suzulmus.length)} sonuç · ${temel}` : temel;
    liste.replaceChildren();
    liste.dataset.sekme = st.sekme;
    cizilen = 0;
    if (!suzulmus.length) {
      liste.append(h('li.ah-bos', h('p', 'Bu aramaya uyan kayıt bulunamadı.'),
        h('button.dugme.dugme-kucuk', { type: 'button', onclick: () => { araAlan.value = ''; st.ara = ''; st.deger = ''; degerSec.value = ''; suz(); araAlan.focus(); } }, 'Aramayı temizleyin')));
      gozcu.hidden = true;
      return;
    }
    devam();
  }

  function devam() {
    const parti = suzulmus.slice(cizilen, cizilen + PARTI);
    liste.append(...parti.map(k => kayitCiz(k.x)));
    cizilen += parti.length;
    gozcu.hidden = cizilen >= suzulmus.length;
  }

  function kayitCiz(x) {
    const ayet = st.sekme === 'ayet';
    const kunye = [];
    if (ayet) {
      if (x.sure) kunye.push(h('span.ah-yer', `${x.sure} sûresi`));
      if (x.ayetNo) kunye.push(h('span.ah-yer', `${x.ayetNo} âyet`));
    } else if (x.kaynak) {
      kunye.push(h('span.ah-yer.ah-eser', x.kaynak));
    }
    const ikincil = [sahifeBag(pdf, x.sahife), maddeBag(x.madde, kunyeler)].filter(Boolean);
    return h('li.ah-kayit',
      h('blockquote.ah-meal', h('p', isaretli(x.metin, kelimeler))),
      h('p.ah-kunye',
        h('span.gizli-yazi', ayet ? 'Âyet-i kerîme meâli. ' : 'Hadîs-i şerîf meâli. '),
        kunye.length ? h('span.ah-kunye-yer', kunye) : null,
        ikincil));
  }

  const gozlemci = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => { if (es.some(e => e.isIntersecting) && cizilen < suzulmus.length) devam(); }, { rootMargin: '900px 0px' })
    : null;
  if (gozlemci) { gozlemci.observe(gozcu); d.gozlemciler.push(gozlemci); }
  else gozcu.append(h('button.dugme', { type: 'button', onclick: devam }, 'Devamını gösterin'));

  secenekleriKur();
  doldur(kap, h('.kap.ah',
    h('header.ah-bas',
      h('a.ust-yazi.surh.ah-ust', { href: '/fevaid' }, 'Kitaptan Derlenenler'),
      h('h1.baslik-2', bitisik('Âyet-i Kerîme ve Hadîs-i Şerîf İndeksi')),
      h('p.giris-yazi', ACIKLAMA)),
    h('.ah-arac', sekmeler, h('.ah-suzgec', h('.ah-ara-kap', araAlan), degerSec)),
    sonuc));
  suz();
}

export default {
  ad: 'ayet-hadis',
  async kur(kap, p, baglam) {
    await cssYukle('/css/ayet-hadis.css');
    d = { gozlemciler: [] };
    const benim = d;
    baglam.temizle(() => { for (const g of benim.gozlemciler) g.disconnect(); if (d === benim) d = null; });
    const dene = async () => {
      try { await ciz(kap, baglam); }
      catch (e) {
        if (e && e.name === 'AbortError') return;
        if (!e || e.tur !== 'cevrimdisi') console.error('Âyet-hadîs:', e);
        const cevrimdisi = e && e.tur === 'cevrimdisi';
        baglam.baslikYaz('Âyet-i Kerîme ve Hadîs-i Şerîf İndeksi');
        doldur(kap, h('.kap', durum(cevrimdisi ? 'Bağlantı yok' : 'İndeks yüklenemedi',
          cevrimdisi ? 'İnternet bağlantınız kesik görünüyor. Bağlandığınızda yeniden deneyin.' : 'Veri zamanında gelmedi. Yeniden deneyebilirsiniz.',
          h('button.dugme.dugme-ana', { type: 'button', onclick: () => { doldur(kap, h('.kap', iskelet(8))); dene(); } }, 'Yeniden deneyin'))));
      }
    };
    await dene();
  }
};
