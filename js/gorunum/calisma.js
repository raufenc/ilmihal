/* Çalışma Alanım (/calisma-alanim): kişinin defteri.
   Okuma planı, yer imleri, vurgular, notlar, okuma geçmişi, rehber ilerlemeleri ve yedek.
   Bölüm adrese ?bolum=… olarak yazılır (geçmişe kayıt eklemeden).
   Kayıtlar eski sitenin anahtarlarıyla js/cekirdek/kullanici.js üzerinden okunur/yazılır. */

import { h, doldur, iskelet, durum } from '../cekirdek/dom.js';
import { cssYukle } from '../cekirdek/css.js';
import { yenile } from '../cekirdek/yonlendirici.js';
import { veri } from '../cekirdek/veri.js';
import { kullanici } from '../cekirdek/kullanici.js';
import { depo } from '../cekirdek/depo.js';
import { temaUygula } from '../cekirdek/tema.js';
import { ad, roma, kisimAdi, tarih as tarihYaz } from '../cekirdek/bicim.js';
import { okumaPlaniKutu, planVerisi, kacinda, iyelik } from '../bilesen/okuma-plani-kutu.js';
import { sor } from '../bilesen/pencere.js';
import { bildir } from '../bilesen/bildirim.js';

const BOLUMLER = [
  { id: 'plan', ad: 'Okuma planı' },
  { id: 'yer-imleri', ad: 'Yer imleri' },
  { id: 'vurgular', ad: 'Vurgular' },
  { id: 'notlar', ad: 'Notlar' },
  { id: 'gecmis', ad: 'Okuma geçmişi' },
  { id: 'rehberler', ad: 'Rehberler' },
  { id: 'yedek', ad: 'Yedek' }
];
const BOLUM_KIMLIK = new Set(BOLUMLER.map(b => b.id));
const gecerliBolum = b => (BOLUM_KIMLIK.has(b) ? b : 'plan');
const A = kullanici.ANAHTAR;

let etkin = null;   // { kap, baglam, V, rehberler, bolum, planDugum, odakSonra }

export default {
  ad: 'calisma',
  baslik: 'Çalışma Alanım',
  async kur(kap, p, baglam) {
    baglam.metaYaz({ aciklama: 'Okuma planınız, yer imleriniz, vurgularınız ve notlarınız: Se’âdet-i Ebediyye okurken tuttuğunuz defter.', robots: 'noindex' });
    const [, V, rehberler] = await Promise.all([
      cssYukle('/css/calisma.css'),
      planVerisi(baglam.sinyal).catch(e => ({ hata: e })),
      veri.rehberler({ sinyal: baglam.sinyal }).catch(() => null)
    ]);
    if (V.hata) {
      if (V.hata.name === 'AbortError') return;
      kap.append(h('.kap.kap-dar', durum('Çalışma alanı açılamadı', V.hata.tur === 'cevrimdisi'
        ? 'Bağlantı yok. Kitabın fihristi henüz bu cihaza inmediği için defteriniz gösterilemiyor; kayıtlarınız yerinde duruyor.'
        : 'Kitabın fihristi yüklenemedi; kayıtlarınız yerinde duruyor.',
        h('button.dugme.dugme-ana', { type: 'button', onclick: () => yenile() }, 'Yeniden deneyin'))));
      return;
    }
    etkin = { kap, baglam, V, rehberler: rehberler && rehberler.rehberler, bolum: gecerliBolum(baglam.sorgu.get('bolum')), planDugum: null, odakSonra: null };
    let bekleyen = 0;
    const tazele = () => { if (!bekleyen) bekleyen = requestAnimationFrame(() => { bekleyen = 0; if (etkin) ciz(); }); };
    const birak = ['yerImleri', 'notlar', 'vurgular', 'gecmis', 'okunan', 'rehber', 'gunlukHedef', 'hatim', 'sonOkunan']
      .map(alan => kullanici.izle(alan, tazele));
    baglam.temizle(() => { birak.forEach(f => f()); if (bekleyen) cancelAnimationFrame(bekleyen); etkin = null; });
    ciz();
  },
  async guncelle(p, baglam) {
    if (!etkin) return;
    etkin.baglam = baglam;
    etkin.bolum = gecerliBolum(baglam.sorgu.get('bolum'));
    ciz();
  }
};

/* ───────────── Yardımcılar ───────────── */

const madYol = key => '/madde/' + key;
const noYaz = key => { const m = kullanici.maddeCoz(key); return m ? roma(m.kisim) + ' · ' + m.no : key; };
function kunye(key) { return etkin.V.kunye.get(key) || null; }
function sira(key) { const m = kunye(key); return m ? etkin.V.maddeler.indexOf(m) : 1e6; }
const kitapSirasi = (a, b) => sira(a) - sira(b);

function silSimge() {
  return h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' }, h('path', { d: 'M7 7l10 10M17 7 7 17' }));
}

/** Silme düğmesi: indeks, silmeden sonra odağın döneceği yeri bulmak için. */
function silDugmesi(etiket, yap, indeks) {
  return h('button.ds-sil', { type: 'button', 'aria-label': etiket, title: 'Silin', dataset: { sil: String(indeks) },
    onclick: () => { etkin.odakSonra = indeks; yap(); } }, silSimge());
}

/** Bir anahtarda değişiklik yapar; bildirimde "Geri alın" sunar. Bu arada başka değişiklik olduysa yedekYol kullanılır. */
function geriAlinir(anahtar, islem, mesaj, yedekYol = null) {
  const once = depo.alDuz(anahtar, null);
  if (islem() === false) return;
  const sonra = depo.alDuz(anahtar, null);
  bildir(mesaj, {
    sure: 8000,
    eylem: {
      ad: 'Geri alın', yap: () => {
        if (depo.alDuz(anahtar, null) === sonra) { if (once === null) depo.sil(anahtar); else depo.yazDuz(anahtar, once); }
        else if (yedekYol) yedekYol();
        else { bildir('Geri alınamadı: bu arada kayıt değişti.'); return; }
        bildir('Geri alındı.');
      }
    }
  });
}

/** Madde başlık satırı: no · başlık (bağlantı) · sahîfe */
function maddeBasi(key, etiket = 'h3') {
  const m = kunye(key);
  return h(etiket + '.ds-madde-bas',
    h('span.fihrist-no', noYaz(key)),
    m ? h('a.ds-baslik', { href: madYol(key) }, ad(m.baslik)) : h('span.ds-baslik.ds-bilinmez', `Bilinmeyen madde (${key})`),
    m ? h('span.fihrist-sayfa', { title: 'Sahîfe' }, String(m.sahife[0])) : h('span'));
}

function sayilar() {
  const o = kullanici.ozet();
  const yerlesmeyen = Object.values(kullanici.vurgular.yerlesmeyenler()).reduce((t, d) => t + d.length, 0);
  return {
    'yer-imleri': o.yerImi || 0, vurgular: o.vurgu || 0, notlar: o.not || 0, gecmis: o.gecmis || 0,
    rehberler: o.rehber || 0, okunan: o.okunan || 0, planVar: !!o.planVar, bitirilen: o.bitirilen || 0, yerlesmeyen
  };
}

/* ───────────── Sayfa ───────────── */

function ciz() {
  const { kap } = etkin;
  const odakBolumde = document.activeElement && kap.contains(document.activeElement) ? document.activeElement : null;
  const odakAnahtar = odakBolumde && (odakBolumde.dataset.odak || null);
  const s = sayilar();
  const bos = !s['yer-imleri'] && !s.vurgular && !s.notlar && !s.gecmis && !s.rehberler && !s.okunan && !s.planVar && !s.bitirilen;

  if (!etkin.planDugum) etkin.planDugum = okumaPlaniKutu(etkin.baglam);

  const ust = h('header.defter-ust',
    h('p.ust-yazi', 'Defter'),
    h('h1.baslik-2', 'Çalışma Alanım'),
    h('p.giris-yazi', 'Okuma planınız, yer imleriniz, vurgularınız ve notlarınız; okurken tuttuğunuz defter.'),
    bos ? null : h('p.kunye.defter-ozet', [
      s['yer-imleri'] ? `${s['yer-imleri']} yer imi` : null,
      s.vurgular ? `${s.vurgular} vurgu` : null,
      s.notlar ? `${s.notlar} not` : null,
      `${kacinda(etkin.V.maddeler.length, s.okunan)} açıldı`
    ].filter(Boolean).join(' · ')),
    depo.kalici ? null : h('p.defter-uyari', { role: 'note' },
      'Bu tarayıcıda kalıcı depolama kapalı (ör. gizli pencere). Yaptıklarınız sayfa kapanınca kaybolur; saklamak için ',
      h('a', { href: '?bolum=yedek', onclick: e => { e.preventDefault(); bolumSec('yedek'); } }, 'yedek indirin'), '.'));

  if (bos) {
    doldur(kap, h('.kap.defter', ust,
      h('section.defter-bos',
        h('img', { src: '/gorsel/nesne/divit-kalem-k.webp', srcset: '/gorsel/nesne/divit-kalem-k.webp 768w, /gorsel/nesne/divit-kalem.webp 1536w', sizes: '(min-width: 900px) 30rem, 100vw', width: 768, height: 512, alt: '', loading: 'lazy', decoding: 'async' }),
        h('.defter-bos-yazi',
          h('h2.baslik-4', 'Defteriniz henüz boş'),
          h('p', 'Okurken eklediğiniz yer imleri, vurguladığınız satırlar ve aldığınız notlar burada kitabın sırasıyla toplanır. Bir okuma planı kurarsanız her günün payı da burada durur.'),
          h('.sira', h('a.dugme.dugme-ana', { href: '/icindekiler' }, 'Fihristi açın'), h('a.ok-bag', { href: '/rehberler' }, 'Konu rehberleri')))),
      h('section.defter-blok', { 'aria-label': 'Okuma planı' }, etkin.planDugum),
      h('section.defter-blok', { 'aria-labelledby': 'yedek-bos' },
        h('h2.ust-yazi#yedek-bos', 'Yedeğiniz var mı?'),
        geriYukleme(true))));
    return;
  }

  const bolum = etkin.bolum;
  const nav = h('nav.defter-gez', { 'aria-label': 'Defterin bölümleri' },
    h('ul', BOLUMLER.map(b => {
      const n = b.id === 'plan' ? null : b.id === 'yedek' ? null : s[b.id];
      return h('li', h('a', {
        href: '?bolum=' + b.id, 'aria-current': b.id === bolum ? 'true' : null, dataset: { odak: 'gez-' + b.id },
        onclick: e => { e.preventDefault(); bolumSec(b.id); }
      }, h('span.defter-gez-ad', h('span', b.ad)), n !== null && n !== undefined ? (n ? h('span.defter-gez-sayi', String(n)) : h('span')) : h('span')));
    })));

  const panel = h('section.defter-panel', { 'aria-labelledby': 'defter-bolum-baslik', tabindex: '-1' }, bolumIcerik(bolum, s));
  doldur(kap, h('.kap.defter', ust, h('.defter-govde', nav, panel)));

  // Odak: silmeden sonra sıradaki silme düğmesine, yoksa bölüm başlığına; öbür durumlarda aynı denetime
  if (etkin.odakSonra !== null) {
    const silinenler = [...panel.querySelectorAll('[data-sil]')];
    const hedef = silinenler[Math.min(etkin.odakSonra, silinenler.length - 1)] || panel.querySelector('#defter-bolum-baslik');
    etkin.odakSonra = null;
    if (hedef) { if (hedef.id) hedef.tabIndex = -1; hedef.focus({ preventScroll: true }); }
  } else if (odakAnahtar) {
    const el = kap.querySelector(`[data-odak="${CSS.escape(odakAnahtar)}"]`);
    if (el) el.focus({ preventScroll: true });
  }
}

function bolumSec(id) {
  id = gecerliBolum(id);
  etkin.bolum = id;
  etkin.baglam.yerineYaz(location.pathname + (id === 'plan' ? '' : '?bolum=' + id));
  ciz();
  const panel = etkin.kap.querySelector('.defter-panel');
  if (panel && matchMedia('(max-width: 899px)').matches) {
    const ust = panel.getBoundingClientRect().top;
    if (ust < 0 || ust > innerHeight * 0.6) panel.scrollIntoView({ block: 'start' });
  }
}

function panelBasi(baslik, aciklama, ...ek) {
  return h('header.defter-panel-bas',
    h('h2.baslik-4#defter-bolum-baslik', { tabindex: '-1' }, baslik),
    aciklama ? h('p.kunye', aciklama) : null,
    ek.length ? h('.sira.defter-panel-arac', ek) : null);
}
const bosDurum = (...p) => h('p.defter-bos-satir', ...p);

function topluSil(etiket, soru, yap, anahtar) {
  return h('button.bag.defter-toplu', { type: 'button', dataset: { odak: 'toplu-' + anahtar },
    onclick: async () => {
      if (!(await sor(soru, { evet: 'Hepsini silin' }))) return;
      geriAlinir(anahtar, yap, 'Silindi.');
    } }, etiket);
}

function bolumIcerik(bolum, s) {
  switch (bolum) {
    case 'yer-imleri': return yerImleri();
    case 'vurgular': return vurgular();
    case 'notlar': return notlar();
    case 'gecmis': return gecmis(s);
    case 'rehberler': return rehberIlerleme();
    case 'yedek': return yedek();
    default: return [h('span.gizli-yazi#defter-bolum-baslik', { tabindex: '-1' }, 'Okuma planı'), etkin.planDugum];
  }
}

/* ───────────── Yer imleri ───────────── */

function yerImleri() {
  const liste = kullanici.yerImleri.liste().slice().sort((a, b) => kitapSirasi(a.key, b.key));
  if (!liste.length) return [panelBasi('Yer imleri'), bosDurum('Henüz yer imi yok. Okurken araç çubuğundaki yer imi düğmesiyle (ya da ', h('kbd', 'B'), ' tuşuyla) bir maddeyi buraya ekleyebilirsiniz.')];
  return [
    panelBasi('Yer imleri', `${liste.length} madde · kitabın sırasıyla`,
      topluSil('Bütün yer imlerini silin', 'Bütün yer imleri silinsin mi?', () => { for (const y of kullanici.yerImleri.liste()) kullanici.yerImleri.cikar(y.key); }, A.yerImleri)),
    h('ul.ds-liste', liste.map((y, i) => {
      const m = kunye(y.key);
      const baslik = m ? m.baslik : (y.baslik || y.key);
      return h('li.ds-satir',
        h('span.fihrist-no', noYaz(y.key)),
        m ? h('a.ds-baslik', { href: madYol(y.key) }, ad(m.baslik)) : h('span.ds-baslik.ds-bilinmez', `Bilinmeyen madde (${y.key})`),
        h('span.fihrist-sayfa', m ? String(m.sahife[0]) : ''),
        silDugmesi(`Yer imini silin: ${baslik}`, () => geriAlinir(A.yerImleri, () => kullanici.yerImleri.cikar(y.key), 'Yer imi silindi.',
          () => kullanici.yerImleri.ekle(y.key, y.baslik || (m && m.baslik) || undefined)), i));
    }))
  ];
}

/* ───────────── Vurgular ───────────── */

function vurguRengi(renk) {
  return /^#[0-9a-f]{3,8}$/i.test(renk) ? renk : '#fff3b0';
}

function vurgular() {
  const hepsi = kullanici.vurgular.hepsi();
  const yerlesmeyen = kullanici.vurgular.yerlesmeyenler();
  const anahtarlar = Object.keys(hepsi).sort(kitapSirasi);
  const toplam = anahtarlar.reduce((t, k) => t + hepsi[k].length, 0);
  if (!toplam) return [panelBasi('Vurgular'), bosDurum('Henüz vurgu yok. Okurken bir cümleyi seçip “Vurgula” derseniz, o cümle rengiyle burada durur.')];
  let i = 0;
  const kayit = (key, v, sira, ayri = false) => h('li.ds-vurgu' + (ayri ? '.ds-yerlesmedi' : ''), { style: '--renk:' + vurguRengi(v.renk) },
    h('blockquote.ds-vurgu-metin', v.text),
    silDugmesi(`Vurguyu silin: ${v.text.slice(0, 60)}`, () => geriAlinir(A.vurgular, () => kullanici.vurgular.sil(key, sira), 'Vurgu silindi.',
      () => kullanici.vurgular.ekle(key, v.text, v.renk)), i++));

  const ayrilar = Object.keys(yerlesmeyen).filter(k => hepsi[k]).sort(kitapSirasi);
  const ayriKume = new Set(ayrilar.flatMap(k => yerlesmeyen[k].map(x => k + '\u0000' + x.text)));
  return [
    panelBasi('Vurgular', `${toplam} vurgu · ${anahtarlar.length} maddede · kitabın sırasıyla`,
      topluSil('Bütün vurguları silin', 'Bütün vurgular silinsin mi?', () => {
        for (const [k, d] of Object.entries(kullanici.vurgular.hepsi())) for (let j = d.length - 1; j >= 0; j--) kullanici.vurgular.sil(k, j);
      }, A.vurgular)),
    ayrilar.length ? h('section.ds-ayri', { 'aria-labelledby': 'ds-ayri-bas' },
      h('h3.ds-ayri-bas#ds-ayri-bas', 'Metinde yeri bulunamayan vurgular'),
      h('p.ds-ayri-not', 'Bu vurgular kaydınızda duruyor; ancak madde son açıldığında aynı ifade metinde bulunamadığı için işaretlenemedi (metin yenilenmiş olabilir). Kendiliğinden silinmez; isterseniz siz silebilirsiniz.'),
      ayrilar.map(k => h('.ds-madde', maddeBasi(k, 'h4'),
        h('ul', yerlesmeyen[k].map(x => {
          const sira = hepsi[k].findIndex(v => v.text === x.text);
          return sira >= 0 ? kayit(k, hepsi[k][sira], sira, true) : null;
        }))))) : null,
    anahtarlar.map(k => {
      const d = hepsi[k].map((v, sira) => ({ v, sira })).filter(x => !ayriKume.has(k + '\u0000' + x.v.text));
      if (!d.length) return null;
      return h('.ds-madde', maddeBasi(k), h('ul', d.map(x => kayit(k, x.v, x.sira))));
    })
  ];
}

/* ───────────── Notlar ───────────── */

function notlar() {
  const hepsi = kullanici.notlar.hepsi();
  const anahtarlar = Object.keys(hepsi).sort(kitapSirasi);
  const toplam = anahtarlar.reduce((t, k) => t + hepsi[k].length, 0);
  if (!toplam) return [panelBasi('Notlar'), bosDurum('Henüz not yok. Bir maddenin sonundaki “Notlarım” bölümüne yazdıklarınız burada toplanır.')];
  let i = 0;
  return [
    panelBasi('Notlar', `${toplam} not · ${anahtarlar.length} maddede · kitabın sırasıyla`,
      topluSil('Bütün notları silin', 'Bütün notlar silinsin mi?', () => {
        for (const [k, d] of Object.entries(kullanici.notlar.hepsi())) for (let j = d.length - 1; j >= 0; j--) kullanici.notlar.sil(k, j);
      }, A.notlar)),
    anahtarlar.map(k => h('.ds-madde', maddeBasi(k),
      h('ul', hepsi[k].map((n, sira) => {
        const t = kullanici.notlar.tarihCoz(n.date);
        return h('li.ds-not',
          h('.ds-not-govde',
            n.date ? h('p.kunye', t ? tarihYaz(t, { gun: false }) : n.date) : null,
            h('p.ds-not-metin', n.text)),
          silDugmesi(`Notu silin: ${n.text.slice(0, 60)}`, () => geriAlinir(A.notlar, () => kullanici.notlar.sil(k, sira), 'Not silindi.',
            () => kullanici.notlar.ekle(k, n.text, t || new Date())), i++));
      }))))
  ];
}

/* ───────────── Okuma geçmişi ───────────── */

function gecmisSil(key) {
  const ham = depo.al(A.gecmis, null);
  if (!Array.isArray(ham)) return false;
  const yeni = ham.filter(x => x !== key);
  if (yeni.length === ham.length) return false;
  return depo.yaz(A.gecmis, yeni), true;
}

function oncesi(zaman) {
  const fark = Date.now() - zaman;
  if (!(fark >= 0)) return '';
  const dk = Math.round(fark / 60000);
  if (dk < 1) return 'az önce';
  if (dk < 60) return dk + ' dk önce';
  const sa = Math.round(dk / 60);
  if (sa < 24) return sa + ' saat önce';
  return Math.round(sa / 24) + ' gün önce';
}

function gecmis(s) {
  const liste = kullanici.gecmis.sonlar(50);
  const okunan = new Set(kullanici.okunan.liste());
  const hedef = kullanici.gunlukHedef.al();
  const bugunDk = kullanici.gunlukHedef.bugunkuDakika();
  const son = kullanici.sonOkunan.al();

  const kisimlar = etkin.V.kisimlar.map(k => {
    const mad = etkin.V.maddeler.filter(m => m.kisim === k.no);
    const n = mad.filter(m => okunan.has(m.kisim + '/' + m.no)).length;
    return h('li.ds-kisim',
      h('span.ds-kisim-ad', kisimAdi(k.no)),
      h('span.ds-kisim-sayi', kacinda(mad.length, n)),
      h('span.ds-kisim-cizgi', { 'aria-hidden': 'true' }, h('i', { style: { width: (mad.length ? n / mad.length * 100 : 0) + '%' } })));
  });

  const hedefSatir = hedef && hedef.target ? (bugunDk >= hedef.target
    ? 'Bugünkü okuma hedefiniz tamam.'
    : `Bugün ≈ ${bugunDk} dk okudunuz; günlük hedef ${hedef.target} dk.`) : null;

  return [
    panelBasi('Okuma geçmişi', `Açtığınız maddeler: ${kacinda(etkin.V.maddeler.length, s.okunan)}`,
      liste.length ? topluSil('Geçmişi temizleyin', 'Okuma geçmişi temizlensin mi? Açtığınız maddelerin “okundu” işaretleri kalır.', () => depo.yaz(A.gecmis, []), A.gecmis) : null),
    h('ul.ds-kisimlar', kisimlar),
    hedefSatir || son ? h('.ds-gecmis-ozet',
      son && kunye(kullanici.maddeAnahtari(son)) ? h('p', 'Son açtığınız madde: ', h('a', { href: madYol(kullanici.maddeAnahtari(son)) }, ad(kunye(kullanici.maddeAnahtari(son)).baslik)),
        son.zaman ? h('span.kunye', ' · ' + oncesi(son.zaman)) : null) : null,
      hedefSatir ? h('p', hedefSatir) : null) : null,
    liste.length
      ? [h('h3.ds-alt-baslik', 'Son açılanlar'),
        h('ul.ds-liste', liste.map((key, i) => {
          const m = kunye(key);
          return h('li.ds-satir',
            h('span.fihrist-no', noYaz(key)),
            m ? h('a.ds-baslik', { href: madYol(key) }, ad(m.baslik)) : h('span.ds-baslik.ds-bilinmez', `Bilinmeyen madde (${key})`),
            h('span.fihrist-sayfa', m ? String(m.sahife[0]) : ''),
            silDugmesi(`Geçmişten silin: ${m ? m.baslik : key}`, () => geriAlinir(A.gecmis, () => gecmisSil(key), 'Geçmişten silindi.'), i));
        }))]
      : bosDurum('Henüz madde açmadınız. ', h('a', { href: '/icindekiler' }, 'Fihristten'), ' bir madde seçerek başlayabilirsiniz.')
  ];
}

/* ───────────── Rehber ilerlemeleri ───────────── */

function rehberIlerleme() {
  const R = etkin.rehberler;
  if (!R) return [panelBasi('Rehberler'), bosDurum('Rehberler yüklenemedi. ', h('a', { href: '/rehberler' }, 'Konu rehberleri'), ' sayfasından yeniden deneyebilirsiniz.')];
  const ilerleme = kullanici.rehber.hepsi();
  const satirlar = R.map(r => {
    const tum = [...new Set(r.bolumler.flatMap(b => b.maddeler.map(m => kullanici.maddeAnahtari(m.madde))))].filter(Boolean);
    const tamam = (ilerleme[r.id] || []).filter(k => tum.includes(k)).length;
    return { r, tum, tamam };
  }).sort((a, b) => (b.tamam > 0) - (a.tamam > 0));
  const baslanan = satirlar.filter(x => x.tamam > 0).length;
  let i = 0;
  return [
    panelBasi('Rehberler', baslanan ? `${R.length} rehberin ${iyelik(baslanan)} başlandı` : 'Henüz bir rehberde ilerleme kaydı yok'),
    h('ul.ds-rehberler', satirlar.map(({ r, tum, tamam }) => h('li.ds-rehber' + (tamam ? '' : '.baslanmadi'),
      h('a.ds-baslik', { href: '/rehberler?rehber=' + encodeURIComponent(r.id) }, ad(r.baslik)),
      h('span.kunye', tamam ? `${kacinda(tum.length, tamam)} okundu` : `${tum.length} madde`),
      h('span.ds-kisim-cizgi', { 'aria-hidden': 'true' }, h('i', { style: { width: (tum.length ? tamam / tum.length * 100 : 0) + '%' } })),
      tamam ? h('button.bag.ds-sifirla', { type: 'button', dataset: { sil: String(i++) }, 'aria-label': `${r.baslik}: ilerlemeyi sıfırlayın`,
        onclick: () => { etkin.odakSonra = 0; geriAlinir(A.rehber, () => { for (const k of kullanici.rehber.adimlar(r.id)) kullanici.rehber.degistir(r.id, k); }, 'Rehber ilerlemesi sıfırlandı.'); } }, 'Sıfırlayın') : h('span'))))
  ];
}

/* ───────────── Yedek ───────────── */

function indir(dosyaAdi, metin, tur) {
  const blob = new Blob([metin], { type: tur });
  const adres = URL.createObjectURL(blob);
  const a = h('a', { href: adres, download: dosyaAdi, hidden: true });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(adres), 5000);
}

const gunAdi = (t = new Date()) => t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');

function disaAktar() {
  const yedek = kullanici.disaAktar();
  indir(`ilmihal-yedek-${gunAdi()}.json`, JSON.stringify(yedek, null, 2), 'application/json');
  bildir('Yedek dosyası indirildi.');
}

/** Eski "Notları ve Vurguları İndir (.md)" */
function mdAktar() {
  const n = kullanici.notlar.hepsi(), v = kullanici.vurgular.hepsi();
  const anahtarlar = [...new Set([...Object.keys(n), ...Object.keys(v)])].sort(kitapSirasi);
  if (!anahtarlar.length) { bildir('Dışa aktarılacak not ya da vurgu yok.'); return; }
  const satir = [`# Çalışma Alanım — Se’âdet-i Ebediyye`, '', `${tarihYaz(new Date(), { gun: false })}`, ''];
  for (const k of anahtarlar) {
    const m = kunye(k), c = kullanici.maddeCoz(k);
    satir.push(`## ${c ? kisimAdi(c.kisim) + ', ' + c.no + '. madde' : k}${m ? ' — ' + m.baslik : ''}`, '', `https://www.ilmihal.org/madde/${k}`, '');
    for (const x of v[k] || []) satir.push('> ' + x.text.replace(/\n/g, '\n> '), '');
    if (n[k] && n[k].length) {
      satir.push('**Notlarım:**', '');
      for (const x of n[k]) satir.push(`- ${x.text.replace(/\n/g, '\n  ')}${x.date ? ` (${x.date})` : ''}`);
      satir.push('');
    }
  }
  indir(`ilmihal-calisma-alanim-${gunAdi()}.md`, satir.join('\n'), 'text/markdown');
}

function yedekOzeti(nesne) {
  const a = nesne.anahtarlar || {};
  const p = k => { try { return JSON.parse(a[k]); } catch (e) { return null; } };
  const say = o => (o && typeof o === 'object' ? Object.values(o).reduce((t, d) => t + (Array.isArray(d) ? d.length : 0), 0) : 0);
  const parcalar = [];
  const yi = p(A.yerImleri); if (Array.isArray(yi) && yi.length) parcalar.push(`${yi.length} yer imi`);
  const vu = say(p(A.vurgular)); if (vu) parcalar.push(`${vu} vurgu`);
  const no = say(p(A.notlar)); if (no) parcalar.push(`${no} not`);
  const ok = p(A.okunan); if (Array.isArray(ok) && ok.length) parcalar.push(`${ok.length} açılmış madde`);
  const bi = p(A.bitirilen); if (Array.isArray(bi) && bi.length) parcalar.push(`${bi.length} bitirilmiş madde`);
  if (p(A.hatim)) parcalar.push('bir okuma planı');
  if (!parcalar.length) return 'yalnız ayarlar var';
  const son = parcalar.pop();
  return (parcalar.length ? parcalar.join(', ') + ' ve ' : '') + son + ' var';
}

function geriYukleme(bosDefter = false) {
  const kutu = h('input', { type: 'checkbox', id: 'yedek-aynen' });
  const dosya = h('input.gizli-yazi', { type: 'file', accept: '.json,application/json', tabindex: '-1', 'aria-hidden': 'true' });
  dosya.addEventListener('change', async () => {
    const f = dosya.files && dosya.files[0];
    dosya.value = '';
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { bildir('Dosya çok büyük; bir ilmihal.org yedeği gibi görünmüyor.'); return; }
    let nesne = null;
    try { nesne = JSON.parse(await f.text()); } catch (e) { /* aşağıda */ }
    if (!nesne || nesne.bicim !== 'ilmihal-kullanici-yedegi' || !nesne.anahtarlar || typeof nesne.anahtarlar !== 'object') {
      bildir('Bu dosya bir ilmihal.org yedeği değil; hiçbir şey değiştirilmedi.');
      return;
    }
    const birlestir = !kutu.checked;
    const t = new Date(nesne.tarih);
    const ne = `${isNaN(t) ? 'Bu' : tarihYaz(t, { gun: false }) + ' tarihli'} yedekte ${yedekOzeti(nesne)}.`;
    const soru = ne + ' ' + (birlestir
      ? 'Kayıtlar mevcut verilerinizle birleştirilecek; hiçbir kaydınız silinmez. Okuma planınız ve ayarlarınız olduğu gibi kalır.'
      : 'Yedekteki kayıtlar mevcutların yerine yazılacak (okuma planı ve ayarlar dahil); yedekte bulunmayan kayıtlarınıza dokunulmaz.');
    if (!(await sor(soru, { baslik: 'Yedek geri yüklensin mi?', evet: 'Geri yükleyin' }))) return;
    const r = kullanici.iceAktar(nesne, { birlestir });
    if (!r.tamam) { bildir('Yedek yüklenemedi; hiçbir şey değiştirilmedi.'); return; }
    if (r.yazilan.includes(A.tema)) temaUygula();
    const atlanan = r.atlanan.length ? ` ${r.atlanan.length} kayıt okunamadığı için atlandı.` : '';
    bildir((r.yazilan.length ? `Yedek yüklendi; ${r.yazilan.length} kayıt türü güncellendi.` : 'Yedekteki kayıtlar zaten sizde var; değişiklik olmadı.') + atlanan, { sure: 6000 });
    if (etkin) ciz();
  });
  return h('.yedek-satir',
    h('.yedek-eylem',
      h('button.dugme', { type: 'button', dataset: { odak: 'geri-yukle' }, onclick: () => dosya.click() }, 'Yedekten geri yükleyin'),
      dosya,
      h('p.kunye', bosDefter ? 'Başka bir tarayıcıdan indirdiğiniz yedek dosyasını (.json) seçin.' : 'İndirdiğiniz yedek dosyasını (.json) seçin; önce ne olacağı sorulur.')),
    h('label.yedek-secenek', { for: 'yedek-aynen' }, kutu, h('span', 'Birleştirmek yerine yedekteki kayıtları olduğu gibi yazın')));
}

function yedek() {
  return [
    panelBasi('Yedek', null),
    h('p.yedek-giris', 'Verileriniz yalnız bu tarayıcıda durur; hesap ya da sunucu yoktur. Saklamak ya da başka bir cihaza taşımak için yedek indirin.'),
    depo.kalici ? null : h('p.defter-uyari', { role: 'note' }, 'Bu tarayıcıda kalıcı depolama kapalı; yaptıklarınız sayfa kapanınca kaybolur. Şimdi yedek indirmeniz iyi olur.'),
    h('.yedek-satir',
      h('.yedek-eylem',
        h('button.dugme', { type: 'button', dataset: { odak: 'indir' }, onclick: disaAktar }, 'Verilerinizi indirin'),
        h('p.kunye', 'Tek dosya (.json): okuma planı, yer imleri, vurgular, notlar, geçmiş ve ayarlar.'))),
    geriYukleme(false),
    h('.yedek-satir',
      h('.yedek-eylem',
        h('button.bag', { type: 'button', dataset: { odak: 'md' }, onclick: mdAktar }, 'Notlarınızı ve vurgularınızı metin olarak indirin (.md)'),
        h('p.kunye', 'Okumak ya da yazdırmak için; geri yüklenemez.'))),
    h('p.kunye.yedek-dip', 'Kayıtlarınızın ne olduğu ',
      h('a', { href: '/gizlilik' }, 'Gizlilik'), ' sahîfesinde yazılıdır.')
  ];
}
