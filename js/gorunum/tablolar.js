/* Tablolar: liste (/fevaid/tablolar?kategori=…&ara=…) ve tek tablo (/fevaid/tablolar/:id).
   Eski adresler /fevaid/tablo/:id ve /tablo/:id aynı tabloyu açar; adres kanonik biçime çevrilir.
   Geri tuşu: liste ↔ tablo geçişi yönlendiricinin kendi geçmiş kaydıyla olur; görünüm geçmişe kayıt
   EKLEMEZ (eski sitedeki H-1 tuzağı yok). Tablonun hücreleri sitenin derlemesidir; kaynakMetin kitabın aynen sözüdür. */
import { h, doldur, durum, iskelet, semse } from '../cekirdek/dom.js';
import { veri } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { sayi, ad, kesme, sahife } from '../cekirdek/bicim.js';
import { duzle, duzleEslemeli, asilAralik, araliklariBirlestir } from '../cekirdek/metin.js';

const TIP = { tablo: 'Tablo', liste: 'Liste', iki_liste: 'Karşılaştırma', flowchart: 'Adımlar', agac: 'Şema', tanimlar: 'Tanımlar' };
const DURUM_BIRLES = { sunnet: 'sünnet', sebeb: 'sebep' };
const ACIKLAMA = 'Kitabın konularından derlenmiş tablolar, listeler ve şemalar. Her biri kitaptaki kaynağına, maddesine ve sahîfesine bağlıdır.';

let d = null;

/* ── Ortak parçalar ── */
const kategoriAdi = k => (k && k.etiket ? kesme(k.etiket) : 'Genel');
const buyukBas = s => { s = String(s || ''); return s ? s.charAt(0).toLocaleUpperCase('tr') + s.slice(1) : s; };

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

function sahifeBag(pdf, s) {
  if (!s) return null;
  return h('a.kaynak', { href: `${pdf}#page=${Math.min(s, 1248)}`, target: '_blank', rel: 'noopener', title: 'Kitabın aslında bu sahîfeyi açın (yeni sekme)' },
    'sahîfe ', h('span.sayi', sahife(s)));
}

function maddeBag(madde, kunyeler, sinif = '') {
  if (!madde) return null;
  const [k, n] = madde.split('-');
  const m = kunyeler.get(madde);
  return h('a.kaynak.tb-madde' + sinif, { href: `/madde/${k}/${n}` }, h('b', `${k}/${n}`), m ? h('span', ad(m.baslik)) : null);
}

async function ortak(baglam) {
  const sec = { sinyal: baglam.sinyal };
  const [dizin, fihrist] = await Promise.all([veri.tablolar(sec), veri.fihrist(sec)]);
  return { dizin, fihrist, pdf: fihrist.kitap.pdf, kunyeler: new Map(fihrist.maddeler.map(m => [`${m.kisim}-${m.no}`, m])) };
}

function hataCiz(kap, e, yeniden, baglam) {
  const cevrimdisi = e && e.tur === 'cevrimdisi';
  baglam.baslikYaz('Tablolar');
  doldur(kap, h('.kap', durum(cevrimdisi ? 'Bağlantı yok' : 'Tablolar yüklenemedi',
    cevrimdisi ? 'İnternet bağlantınız kesik görünüyor. Bağlandığınızda yeniden deneyin.' : 'Veri zamanında gelmedi. Yeniden deneyebilirsiniz.',
    h('button.dugme.dugme-ana', { type: 'button', onclick: yeniden }, 'Yeniden deneyin'),
    h('a.dugme', { href: '/fevaid' }, 'Fevâid'))));
}

function bulunamadiCiz(kap, id, baglam) {
  baglam.metaYaz({ robots: 'noindex' });
  baglam.baslikYaz('Tablo bulunamadı');
  doldur(kap, h('.kap.kap-dar.tb-yok',
    h('p.ust-yazi.surh', 'Bulunamadı'),
    h('h1.baslik-2', 'Bu adreste bir tablo yok'),
    h('p.giris-yazi', `“${id}” kimliğiyle kayıtlı bir tablo bulunamadı. Adres değişmiş ya da yanlış yazılmış olabilir; bütün tabloları fihristte görebilirsiniz.`),
    h('.sira', h('a.dugme.dugme-ana', { href: '/fevaid/tablolar' }, 'Bütün tablolar'), h('a.dugme', { href: '/fevaid' }, 'Fevâid'))));
}

/* ── Liste ── */
function listeCiz(kap, o, baglam) {
  const { dizin, kunyeler } = o;
  const q = new URLSearchParams(location.search);
  const st = { kategori: dizin.kategoriler.some(k => k.ad === q.get('kategori')) ? q.get('kategori') : '', ara: q.get('ara') || '' };
  baglam.baslikYaz('Tablolar');
  baglam.metaYaz({ aciklama: ACIKLAMA, kanonik: location.origin + '/fevaid/tablolar' });

  const sirali = [...dizin.tablolar].map((t, i) => ({ t, i, duz: duzle(t.baslik) }))
    .sort((a, b) => (a.t.sahife || 0) - (b.t.sahife || 0) || a.i - b.i);

  const araAlan = h('input.alan.tb-ara', { type: 'search', value: st.ara, placeholder: 'Tablo adında arayın…', 'aria-label': 'Tablo adında arayın', autocomplete: 'off', spellcheck: 'false' });
  const kategoriSec = h('.secim.tb-kategoriler', { role: 'group', 'aria-label': 'Bölüme göre süzün' },
    [{ ad: '', etiket: 'Hepsi', sayi: dizin.sayi }, ...dizin.kategoriler].map(k => h('button', {
      type: 'button', dataset: { kategori: k.ad }, 'aria-pressed': String(st.kategori === k.ad),
      onclick: () => { st.kategori = k.ad; for (const b of kategoriSec.children) b.setAttribute('aria-pressed', String(b.dataset.kategori === k.ad)); ciz(); }
    }, k.ad ? kategoriAdi(k) : 'Hepsi', ' ', h('span.tb-secsayi.sayi', sayi(k.sayi)))));
  const sayac = h('p.tb-sayac.kunye', { 'aria-live': 'polite' });
  const govde = h('.tb-govde');

  let zaman = null;
  araAlan.addEventListener('input', () => { clearTimeout(zaman); zaman = setTimeout(() => { st.ara = araAlan.value.trim(); ciz(); }, 80); });
  araAlan.addEventListener('keydown', e => { if (e.key === 'Escape' && araAlan.value) { e.stopPropagation(); araAlan.value = ''; st.ara = ''; ciz(); } });

  function ciz() {
    const p = new URLSearchParams();
    if (st.kategori) p.set('kategori', st.kategori);
    if (st.ara) p.set('ara', st.ara);
    baglam.yerineYaz('/fevaid/tablolar' + (p.toString() ? '?' + p : ''));
    const kel = duzle(st.ara).split(' ').filter(Boolean);
    const uyan = sirali.filter(x => (!st.kategori || x.t.kategori === st.kategori) && kel.every(w => x.duz.includes(w)));
    sayac.textContent = (kel.length || st.kategori) ? `${sayi(uyan.length)} tablo · toplam ${sayi(dizin.sayi)}` : `${sayi(dizin.sayi)} tablo, liste ve şema`;
    if (!uyan.length) {
      doldur(govde, h('.tb-bos', h('p', 'Bu aramaya uyan tablo bulunamadı.'),
        h('button.dugme.dugme-kucuk', { type: 'button', onclick: () => { araAlan.value = ''; st.ara = ''; st.kategori = ''; for (const b of kategoriSec.children) b.setAttribute('aria-pressed', String(b.dataset.kategori === '')); ciz(); araAlan.focus(); } }, 'Aramayı temizleyin')));
      return;
    }
    doldur(govde, dizin.kategoriler.map(k => {
      const bunlar = uyan.filter(x => x.t.kategori === k.ad);
      if (!bunlar.length) return null;
      const kimlik = 'tb-bolum-' + k.ad;
      return h('section.tb-bolum', { 'aria-labelledby': kimlik },
        h('h2.tb-bolum-ad#' + kimlik, kategoriAdi(k), h('span.tb-bolum-sayi.sayi', sayi(bunlar.length))),
        h('ol.fihrist.tb-fihrist', bunlar.map((x, i) => {
          const t = x.t;
          const m = t.kaynakMadde ? kunyeler.get(t.kaynakMadde) : null;
          return h('li', h('a.fihrist-satir.tb-satir', { href: `/fevaid/tablolar/${t.id}` },
            h('span.fihrist-no', String(i + 1)),
            h('span.fihrist-ad', h('span', isaretli(ad(t.baslik), kel))),
            h('span.fihrist-sayfa', t.sahife ? String(t.sahife) : ''),
            h('span.fihrist-alt',
              h('span.tb-tip', TIP[t.tip] || t.tip),
              m ? [' · ', h('span.tb-alt-no', `${m.kisim}/${m.no}`), ' ', ad(m.baslik)] : null)));
        })));
    }));
  }

  doldur(kap, h('.kap.tb',
    h('header.tb-bas',
      h('a.ust-yazi.surh.tb-ust', { href: '/fevaid' }, 'Fevâid'),
      h('h1.baslik-2', 'Tablolar'),
      h('p.giris-yazi', ACIKLAMA)),
    h('.tb-arac', h('.tb-ara-kap', araAlan), kategoriSec),
    h('.tb-liste', sayac, h('p.tb-sutun-ad.kunye', { 'aria-hidden': 'true' }, h('span', 'Tablo'), h('span', 'sahîfe')), govde)));
  ciz();
}

/* ── Tek tablo: tipine göre çizim ── */
function tabloTablo(t) {
  const kolonlar = t.kolonlarTam || t.kolonlar || [];
  const satirlar = Array.isArray(t.veriler) ? t.veriler : [];
  const sayisal = v => /^[\d\s\-–*().,+/]+$/.test(v) && /\d|^-$/.test(v);
  const hucre = v => (v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));
  const tablo = h('table.tb-cetvel',
    h('thead', h('tr', kolonlar.map(k => h('th', { scope: 'col' }, k)))),
    h('tbody', satirlar.map(r => {
      const ilk = hucre(r[kolonlar[0]]);
      const toplam = /^toplam$/i.test(ilk.trim());
      return h('tr', { class: toplam ? 'toplam' : null }, kolonlar.map((k, i) => {
        const v = hucre(r[k]);
        return i === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: sayisal(v) ? 'sayisal' : null }, v);
      }));
    })));
  const kutu = h('.tb-cetvel-kap', { tabindex: '0', role: 'region', 'aria-label': `${t.baslik} tablosu` }, tablo);
  if (satirlar.length > 14) kutu.classList.add('uzun');
  const not = satirlar.some(r => Object.values(r).some(v => String(v).includes('*'))) ? h('p.tb-dipnot.kunye', 'Yıldızlı (*) değerler için kaynak metne bakınız.') : null;
  return [kutu, not];
}

function tabloListe(t) {
  const gruplar = new Map();
  for (const v of t.veriler || []) {
    const ham = String(v.durum || '').trim();
    const anahtar = DURUM_BIRLES[ham] || ham;
    if (!gruplar.has(anahtar)) gruplar.set(anahtar, []);
    gruplar.get(anahtar).push(v);
  }
  return h('.tb-gruplar', [...gruplar].map(([durum, ogeler]) => h('section.tb-grup',
    h('h2.tb-grup-ad', durum ? buyukBas(durum) : 'Diğer', h('span.tb-bolum-sayi.sayi', sayi(ogeler.length))),
    h('ol.tb-maddeler', ogeler.map(v => h('li', h('span.tb-isaret', { 'aria-hidden': 'true' }), h('span', String(v.madde ?? ''))))))));
}

function tabloAkis(t) {
  return h('ol.tb-akis', (t.veriler || []).map((v, i) => h('li',
    h('span.tb-dugum', { 'aria-hidden': 'true' }, semse({}, false), h('b.sayi', String(i + 1))),
    h('.tb-adim', h('h2', h('span.gizli-yazi', `${i + 1}. `), String(v.baslik ?? '')), v.aciklama ? h('p', String(v.aciklama)) : null))));
}

function tabloIkiListe(t) {
  const v = t.veriler && typeof t.veriler === 'object' ? t.veriler : {};
  const anahtarlar = Object.keys(v);
  const basliklar = [t.solBaslik, t.sagBaslik];
  return h('.tb-iki', anahtarlar.slice(0, 2).map((k, i) => h('section.tb-iki-sutun', { class: i ? 'sag' : 'sol' },
    h('h2.tb-iki-ad', basliklar[i] || buyukBas(k.replace(/_/g, ' '))),
    h('ul.tb-maddeler', (Array.isArray(v[k]) ? v[k] : []).map(x => h('li', h('span.tb-isaret', { 'aria-hidden': 'true' }), h('span', String(x))))))));
}

function tabloAgac(t, o) {
  if (Array.isArray(t.veriler) && t.veriler.length && t.maddeAtiflari) {
    const atif = new Map(t.maddeAtiflari.map(a => [a.id, a.maddeler]));
    return h('.tb-harita', t.veriler.map((konu, i) => {
      const maddeler = atif.get(konu.id) || [];
      return h('details.tb-konu', { open: i === 0 ? true : null },
        h('summary', h('span.tb-konu-ad', String(konu.baslik ?? '')), h('span.tb-konu-sayi.sayi', `${sayi(maddeler.length)} madde`)),
        h('ol.fihrist.tb-konu-liste', maddeler.map(m => {
          const k = o.kunyeler.get(m);
          const [ks, n] = m.split('-');
          return h('li', h('a.fihrist-satir', { href: `/madde/${ks}/${n}` },
            h('span.fihrist-no', `${ks}/${n}`),
            h('span.fihrist-ad', h('span', k ? ad(k.baslik) : `Madde ${ks}/${n}`)),
            h('span.fihrist-sayfa', k ? String(k.sahife[0]) : '')));
        })));
    }));
  }
  const dal = liste => h('ul.tb-agac', (liste || []).map(x => h('li',
    h('.tb-dal', h('b', String(x.baslik ?? '')), x.aciklama ? h('p', String(x.aciklama)) : null),
    Array.isArray(x.alt) && x.alt.length ? dal(x.alt) : null)));
  return h('.tb-agac-kap', dal(t.dallar));
}

async function tabloTanimlar(t, o, baglam) {
  const veriT = await veri.tanimlar({ sinyal: baglam.sinyal });
  const kayitlar = veriT.tanimlar.map(x => ({ x, duz: null }));
  const q = new URLSearchParams(location.search);
  let ara = q.get('ara') || '';
  const alan = h('input.alan.tb-ara', { type: 'search', value: ara, placeholder: 'Terim ya da tanımda arayın…', 'aria-label': 'Terim ya da tanımda arayın', autocomplete: 'off', spellcheck: 'false' });
  const sayac = h('p.tb-sayac.kunye', { 'aria-live': 'polite' });
  const dl = h('dl.tb-sozluk');
  const ciz = () => {
    baglam.yerineYaz(location.pathname + (ara ? '?ara=' + encodeURIComponent(ara) : ''));
    const kel = duzle(ara).split(' ').filter(Boolean);
    const uyan = kayitlar.filter(k => {
      if (!kel.length) return true;
      if (k.duz === null) k.duz = duzle(k.x.terim + ' ' + k.x.cumle);
      return kel.every(w => k.duz.includes(w));
    });
    sayac.textContent = kel.length ? `${sayi(uyan.length)} tanım · toplam ${sayi(kayitlar.length)}` : `${sayi(kayitlar.length)} tanım`;
    if (!uyan.length) { doldur(dl, h('.tb-bos', h('p', 'Bu aramaya uyan tanım bulunamadı.'))); return; }
    doldur(dl, uyan.map(k => h('.tb-tanim',
      h('dt', isaretli(k.x.terim, kel)),
      h('dd', h('p', isaretli(k.x.cumle, kel)),
        h('p.tb-tanim-kunye', sahifeBag(o.pdf, k.x.sahife), maddeBag(k.x.madde, o.kunyeler))))));
  };
  let zaman = null;
  alan.addEventListener('input', () => { clearTimeout(zaman); zaman = setTimeout(() => { ara = alan.value.trim(); ciz(); }, 90); });
  alan.addEventListener('keydown', e => { if (e.key === 'Escape' && alan.value) { e.stopPropagation(); alan.value = ''; ara = ''; ciz(); } });
  ciz();
  return h('.tb-tanimlar', h('.tb-ara-kap.tb-tanim-ara', alan), sayac, dl);
}

async function tabloCiz(kap, id, o, baglam, { listedenGeldi }) {
  // Dizinde olmayan kimlik için istek gönderme (boşuna 404 olmasın)
  const ara = String(id).toLowerCase().replace(/-/g, '_');
  const kayit = o.dizin.tablolar.find(x => x.id === ara);
  if (!kayit) { bulunamadiCiz(kap, id, baglam); return; }
  let t;
  try { t = await veri.tablo(kayit.id, { sinyal: baglam.sinyal }); }
  catch (e) {
    if (e && (e.tur === 'bulunamadi' || e.tur === 'gecersiz')) { bulunamadiCiz(kap, id, baglam); return; }
    throw e;
  }
  const kanonik = `/fevaid/tablolar/${t.id}`;
  if (location.pathname !== kanonik) baglam.yerineYaz(kanonik + location.search);
  const kategori = o.dizin.kategoriler.find(k => k.ad === t.kategori);
  baglam.baslikYaz(`${t.baslik} · Tablolar`);
  baglam.metaYaz({ aciklama: t.kaynakMetin || t.aciklama || `${t.baslik}: Se’âdet-i Ebediyye’den derlenmiş ${(TIP[t.tip] || 'tablo').toLocaleLowerCase('tr')}.`, kanonik: location.origin + kanonik });

  let cizim;
  switch (t.tip) {
    case 'tablo': cizim = tabloTablo(t); break;
    case 'liste': cizim = tabloListe(t); break;
    case 'flowchart': cizim = tabloAkis(t); break;
    case 'iki_liste': cizim = tabloIkiListe(t); break;
    case 'agac': cizim = tabloAgac(t, o); break;
    case 'tanimlar': cizim = await tabloTanimlar(t, o, baglam); break;
    default: cizim = h('p.kunye', 'Bu tablonun biçimi tanınmadı.');
  }

  // Kitap sırasına göre önceki / sonraki tablo
  const sira = [...o.dizin.tablolar].map((x, i) => ({ x, i })).sort((a, b) => (a.x.sahife || 0) - (b.x.sahife || 0) || a.i - b.i).map(y => y.x);
  const yer = sira.findIndex(x => x.id === t.id);
  const onceki = yer > 0 ? sira[yer - 1] : null, sonraki = yer >= 0 && yer < sira.length - 1 ? sira[yer + 1] : null;
  const komsu = (x, yon) => x ? h('a.tb-komsu-bag', { href: `/fevaid/tablolar/${x.id}`, class: yon },
    h('span.ust-yazi', yon === 'onceki' ? '← Önceki tablo' : 'Sonraki tablo →'), h('span.tb-komsu-ad', ad(x.baslik))) : h('span');

  const geri = h('a.tb-geri', { href: '/fevaid/tablolar', onclick: e => {
    // Listeden gelindiyse aynı geçmiş kaydına dön: liste kaldığı yerden açılır.
    if (listedenGeldi && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); history.back(); }
  } }, h('span', { 'aria-hidden': 'true' }, '←'), ' Bütün tablolar');

  const kunye = h('p.tb-kunye',
    h('span.etiket', TIP[t.tip] || t.tip),
    t.kaynakMadde ? maddeBag(t.kaynakMadde, o.kunyeler) : (t.kaynakNotu ? h('span.kaynak', t.kaynakNotu) : null),
    sahifeBag(o.pdf, t.sahife));

  // Dar çizimlerde kitaptan alıntı geniş ekranda yanda durur
  const yan = !!t.kaynakMetin && (['tablo', 'liste', 'flowchart'].includes(t.tip) || (t.tip === 'agac' && !t.maddeAtiflari));
  const kitaptan = t.kaynakMetin ? h('figure.tb-kitaptan.cetvel',
    h('figcaption.ust-yazi', 'Kitaptan'),
    h('blockquote', h('p', t.kaynakMetin)),
    h('p.tb-kitaptan-kunye', t.kaynakMadde ? maddeBag(t.kaynakMadde, o.kunyeler) : null, sahifeBag(o.pdf, t.sahife))) : null;

  doldur(kap, h('article.kap.tb-detay', { dataset: { tip: t.tip } },
    h('nav.tb-ustnav', { 'aria-label': 'Tablolar' }, geri),
    h('header.tb-detay-bas',
      h('p.ust-yazi.surh', kategoriAdi(kategori)),
      h('h1.baslik-2', ad(t.baslik)),
      t.aciklama ? h('p.giris-yazi.tb-aciklama', t.aciklama) : null,
      kunye),
    h('.tb-yerlesim', { class: yan ? 'yan' : null },
      h('.tb-ana',
        h('.tb-cizim', cizim),
        t.tip !== 'tanimlar' ? h('p.tb-derleme.kunye', 'Bu tablo kitabın ilgili yerinden derlenmiştir; hükmün aslı için kitabın ifadesi esastır.') : null),
      kitaptan),
    h('nav.tb-komsular', { 'aria-label': 'Önceki ve sonraki tablo' }, komsu(onceki, 'onceki'), komsu(sonraki, 'sonraki'))));
}

/* ── Görünüm ── */
async function goster(kap, p, baglam) {
  const onceki = d.son;
  const id = p.id ? String(p.id) : '';
  try {
    const o = await ortak(baglam);
    if (id) await tabloCiz(kap, id, o, baglam, { listedenGeldi: onceki === 'liste' });
    else listeCiz(kap, o, baglam);
    d.son = id ? 'tablo' : 'liste';
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    if (!e || e.tur !== 'cevrimdisi') console.error('Tablolar:', e);
    hataCiz(kap, e, () => { doldur(kap, h('.kap', iskelet(8))); goster(kap, p, baglam); }, baglam);
  }
}

export default {
  ad: 'tablolar',
  async kur(kap, p, baglam) {
    await cssYukle('/css/tablolar.css');
    d = { kap, son: null };
    const benim = d;
    baglam.temizle(() => { if (d === benim) d = null; });
    await goster(kap, p, baglam);
  },
  async guncelle(p, baglam) {
    if (!d) return;
    await goster(d.kap, p, baglam);
  }
};
