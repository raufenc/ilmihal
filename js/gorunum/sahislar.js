/* Hâl Tercemeleri (/sahislar) — kitabın sonundaki hâl tercemelerinin fihristi.
   Adres: ?sinif=sahabi&q=…&harf=E (süzgeç, arama ve harf adres çubuğuna yazılır, açılışta okunur).
   Liste harf harf, kartsız fihrist satırlarıdır; numara kitabın kendi sıra numarasıdır. */

import { h, doldur, durum, semse, simge } from '../cekirdek/dom.js';
import { veri } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { sayi, ad } from '../cekirdek/bicim.js';
import { duzle, duzleEslemeli, asilAralik } from '../cekirdek/metin.js';

export const SINIFLAR = [
  ['', 'Tümü'], ['peygamber', 'Peygamberler'], ['sahabi', 'Eshâb-ı Kirâm'],
  ['alim', 'Âlimler'], ['hukumdar', 'Hükümdarlar'], ['diger', 'Diğer']
];
const ALFABE = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'W', 'Y', 'Z'];
const SAPKA = { 'Â': 'A', 'Î': 'İ', 'Û': 'U', 'Ô': 'O', 'Ê': 'E' };

/** İsmin fihrist harfi (Â → A, Î → İ). */
export function harfi(isim) {
  const c = String(isim || '').trim().charAt(0);
  const b = c.toLocaleUpperCase('tr');
  return SAPKA[b] || b;
}

const iptalMi = e => e && (e.name === 'AbortError' || e.tur === 'iptal');
let D = null;

function isaretle(metin, qd) {
  if (!qd) return [metin];
  const { duz, konum } = duzleEslemeli(metin);
  const i = duz.indexOf(qd);
  if (i < 0) return [metin];
  const [bas, son] = asilAralik(metin, konum, i, i + qd.length);
  return [metin.slice(0, bas), h('mark', metin.slice(bas, son)), metin.slice(son)];
}

function satir(s, qd) {
  return h('li', h('a.fihrist-satir.sh-satir', { href: `/sahis/${encodeURIComponent(s.slug)}` },
    h('span.fihrist-no', s.no ?? ''),
    h('span.fihrist-ad', h('span.sh-ad',
      h('span.sh-isim', qd ? isaretle(ad(s.isim), qd) : ad(s.isim)),
      s.unvan ? [' ', h('i.sh-unvan', s.unvan)] : null)),
    h('span.fihrist-sayfa.sh-kunye', s.maddeSayisi ? `${s.maddeSayisi} maddede geçer` : ''),
    s.giris ? h('span.fihrist-alt.sh-giris', qd ? isaretle(s.giris, qd) : s.giris) : null));
}

function suz() {
  const qd = duzle(D.sorgu).trim();
  const sayilar = { '': 0 };
  const sonuc = [];
  for (const s of D.kisiler) {
    if (qd && !s.duzIsim.includes(qd) && !s.duzGiris.includes(qd)) continue;
    sayilar[''] = (sayilar[''] || 0) + 1;
    sayilar[s.kategori] = (sayilar[s.kategori] || 0) + 1;
    if (D.sinif && s.kategori !== D.sinif) continue;
    sonuc.push(s);
  }
  if (qd) {
    // İsimde geçenler önce, girişte geçenler sonra
    const isimde = sonuc.filter(s => s.duzIsim.includes(qd));
    const giriste = sonuc.filter(s => !s.duzIsim.includes(qd));
    return { qd, sayilar, liste: isimde.concat(giriste), isimdeSayi: isimde.length };
  }
  return { qd, sayilar, liste: sonuc };
}

function ciz() {
  const { qd, sayilar, liste, isimdeSayi } = suz();
  // Süzgeç düğmeleri
  for (const b of D.secim.querySelectorAll('button')) {
    const k = b.dataset.sinif;
    b.setAttribute('aria-pressed', String(k === D.sinif));
    b.querySelector('.sh-sayi').textContent = sayi(sayilar[k] || 0);
  }
  D.grup = new Map();
  if (!liste.length) {
    doldur(D.liste, h('.sh-bos',
      h('p.sh-bos-bas', D.sorgu ? `“${D.sorgu}” için hâl tercemesi bulunamadı.` : 'Bu sınıfta hâl tercemesi yok.'),
      h('p', 'Yazılışı değiştirerek ya da ismin bir parçasını yazarak deneyin.'),
      h('.sira',
        D.sorgu ? h('a.dugme', { href: '/arama/' + encodeURIComponent(D.sorgu) }, 'Kitapta arayın') : null,
        h('button.dugme', { type: 'button', onclick: () => { D.girdi.value = ''; D.sorgu = ''; D.sinif = ''; guncelleAdres(); ciz(); D.girdi.focus(); } }, 'Süzgeci temizleyin'))));
    D.kunye.textContent = '0 kişi';
    D.duyuru.textContent = 'Sonuç yok';
    harfCubugu(new Set());
    return;
  }
  D.kunye.textContent = (D.sorgu || D.sinif)
    ? `${sayi(liste.length)} kişi` + (qd && isimdeSayi < liste.length ? ` · ${sayi(isimdeSayi)} tanesinin isminde, kalanının hâl tercemesinde geçiyor` : '')
    : `${sayi(D.dizin.sayi)} kişi · kitapta geçtikleri maddelerle`;
  D.duyuru.textContent = `${liste.length} kişi`;

  // Arama varken isimde geçenler tek liste (harfe bölmek sırayı bozar); yoksa harf harf
  const gruplar = [];
  if (qd) gruplar.push({ harf: null, kisiler: liste });
  else {
    const harita = new Map();
    for (const s of liste) { if (!harita.has(s.harf)) harita.set(s.harf, []); harita.get(s.harf).push(s); }
    for (const harf of [...ALFABE, ...[...harita.keys()].filter(x => !ALFABE.includes(x))]) if (harita.has(harf)) gruplar.push({ harf, kisiler: harita.get(harf) });
  }
  const parca = document.createDocumentFragment();
  for (const g of gruplar) {
    const bolum = h('section.sh-grup', { id: g.harf ? `harf-${g.harf}` : null, 'aria-labelledby': g.harf ? `harf-bas-${g.harf}` : null },
      g.harf ? h('h2.sh-harf#harf-bas-' + g.harf, h('span.sh-harf-rozet', semse({}, false), h('span', g.harf)), h('span.kunye', `${sayi(g.kisiler.length)} kişi`)) : null,
      h('ul.sh-liste', g.kisiler.map(s => satir(s, qd))));
    if (g.harf) D.grup.set(g.harf, bolum);
    parca.appendChild(bolum);
  }
  doldur(D.liste, parca);
  harfCubugu(new Set(D.grup.keys()));
}

function harfCubugu(varolan) {
  for (const el of D.cubuk.children) {
    const v = varolan.has(el.dataset.harf);
    el.setAttribute('aria-disabled', String(!v));
    el.tabIndex = v ? 0 : -1;
  }
}

function guncelleAdres() {
  const s = new URLSearchParams();
  if (D.sinif) s.set('sinif', D.sinif);
  if (D.sorgu) s.set('q', D.sorgu);
  if (D.harf && D.grup && D.grup.has(D.harf)) s.set('harf', D.harf);
  const q = s.toString();
  D.baglam.yerineYaz('/sahislar' + (q ? '?' + q : ''));
}

function harfeGit(harf, { yumusak = true } = {}) {
  const g = D.grup && D.grup.get(harf);
  if (!g) return false;
  D.harf = harf;
  guncelleAdres();
  g.scrollIntoView({ block: 'start', behavior: yumusak && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  return true;
}

function adrestenOku(baglam) {
  const sinif = baglam.sorgu.get('sinif') || '';
  const harfHam = (baglam.sorgu.get('harf') || '').trim();
  return {
    sinif: SINIFLAR.some(([k]) => k === sinif) ? sinif : '',
    sorgu: (baglam.sorgu.get('q') || '').trim(),
    harf: harfHam ? harfHam.toLocaleUpperCase('tr') : ''
  };
}

function hataDurumu(e, tekrar) {
  const yok = e && e.tur === 'cevrimdisi';
  return durum(yok ? 'Bağlantı yok' : 'Hâl tercemeleri yüklenemedi',
    yok ? 'İnternete bağlandığınızda yeniden deneyin.' : 'Bir aksaklık oldu. Biraz sonra yeniden deneyin.',
    h('button.dugme.dugme-ana', { type: 'button', onclick: tekrar }, 'Yeniden deneyin'));
}

export default {
  ad: 'sahislar',
  baslik: 'Hâl Tercemeleri',

  async kur(kap, p, baglam) {
    await cssYukle('/css/sahislar.css');
    let dizin;
    try {
      dizin = await veri.sahislarDizin({ sinyal: baglam.sinyal });
    } catch (e) {
      if (iptalMi(e)) return;
      kap.append(h('.kap', hataDurumu(e, () => { doldur(kap); this.kur(kap, p, baglam); })));
      return;
    }
    const ilk = adrestenOku(baglam);
    D = {
      dizin, baglam, sinif: ilk.sinif, sorgu: ilk.sorgu, harf: ilk.harf,
      kisiler: dizin.sahislar.map(s => ({ ...s, harf: harfi(s.isim), duzIsim: duzle(s.isim), duzGiris: duzle(s.giris || '') }))
    };
    const kendi = D;

    D.girdi = h('input.alan.sh-girdi#sh-ara', {
      type: 'search', autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'search', value: ilk.sorgu,
      placeholder: 'İsim ya da hâl tercemesinde arayın'
    });
    D.girdi.value = ilk.sorgu;
    D.temiz = h('button.sh-temizle', { type: 'button', hidden: !ilk.sorgu, 'aria-label': 'Aramayı temizleyin',
      onclick: () => { D.girdi.value = ''; girdiDegisti(); D.girdi.focus(); } }, simge('M6 6l12 12M18 6 6 18'));
    D.secim = h('.secim.sh-secim', { role: 'group', 'aria-label': 'Sınıf' },
      SINIFLAR.map(([k, etiket]) => h('button', { type: 'button', dataset: { sinif: k }, 'aria-pressed': 'false' }, etiket, ' ', h('span.sh-sayi', ''))));
    D.cubuk = h('nav.sh-harfler', { 'aria-label': 'Harfler' },
      ALFABE.map(harf => h('a', { href: `/sahislar?harf=${encodeURIComponent(harf)}`, dataset: { harf } }, harf)));
    D.kunye = h('p.kunye.sh-kunye-ust');
    D.duyuru = h('span.gizli-yazi', { 'aria-live': 'polite' });
    D.liste = h('.sh-gruplar');

    kap.append(
      h('header.kap.sh-ust',
        h('p.ust-yazi.surh', 'Kitabın sonundaki hâl tercemelerinden'),
        h('h1.baslik-1.sh-baslik', 'Hâl Tercemeleri'),
        D.kunye,
        h('form.sh-ara', { role: 'search', onsubmit: e => { e.preventDefault(); const a = D.liste.querySelector('a.sh-satir'); if (a) a.focus(); } },
          h('label.gizli-yazi', { for: 'sh-ara' }, 'Hâl tercemelerinde arayın'),
          simge(['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-4-4'], { class: 'sh-ara-simge' }),
          D.girdi, D.temiz),
        D.secim, D.duyuru),
      h('.sh-cubuk-kap', h('.kap', D.cubuk)),
      h('.kap.sh-ana', D.liste));

    let gecikme = 0;
    function girdiDegisti() {
      D.sorgu = D.girdi.value.trim();
      D.temiz.hidden = !D.girdi.value;
      D.harf = '';
      clearTimeout(gecikme);
      gecikme = setTimeout(() => { if (D !== kendi) return; ciz(); guncelleAdres(); }, 90);
    }
    D.girdi.addEventListener('input', girdiDegisti);
    D.girdi.addEventListener('keydown', e => {
      if (e.key === 'Escape' && D.girdi.value) { e.preventDefault(); e.stopPropagation(); D.girdi.value = ''; girdiDegisti(); }
      else if (e.key === 'ArrowDown') { const a = D.liste.querySelector('a.sh-satir'); if (a) { e.preventDefault(); a.focus(); } }
    });
    D.secim.addEventListener('click', e => {
      const b = e.target.closest('button[data-sinif]');
      if (!b) return;
      D.sinif = b.dataset.sinif;
      D.harf = '';
      ciz();
      guncelleAdres();
    });
    D.cubuk.addEventListener('click', e => {
      const a = e.target.closest('a[data-harf]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if (a.getAttribute('aria-disabled') === 'true') return;
      harfeGit(a.dataset.harf);
      const ilkSatir = D.grup.get(a.dataset.harf).querySelector('a.sh-satir');
      if (ilkSatir) ilkSatir.focus({ preventScroll: true });
    });
    // Kişiye gidildiği an listedeki adres o kişinin harfini taşısın (geri gelince o bölüm)
    D.liste.addEventListener('click', e => {
      const a = e.target.closest('a.sh-satir');
      if (!a) return;
      const bolum = a.closest('.sh-grup');
      const harf = bolum && bolum.id ? bolum.id.slice(5) : '';
      if (harf) { D.harf = harf; guncelleAdres(); }
      listedenGidiliyor(location.pathname + location.search, a.getAttribute('href'));
    });

    baglam.temizle(() => { clearTimeout(gecikme); if (D === kendi) D = null; });
    addEventListener('ilmihal:gorunum', () => {
      // Derin adresle gelindiyse (geri tuşuyla konum geri gelmediyse) harfe kaydır
      if (D === kendi && D.harf && scrollY < 10) harfeGit(D.harf, { yumusak: false });
    }, { once: true, signal: baglam.sinyal });

    ciz();
  },

  async guncelle(p, baglam) {
    if (!D) return;
    D.baglam = baglam;
    const yeni = adrestenOku(baglam);
    D.sinif = yeni.sinif; D.sorgu = yeni.sorgu; D.harf = yeni.harf;
    D.girdi.value = yeni.sorgu;
    D.temiz.hidden = !yeni.sorgu;
    ciz();
    if (D.harf) requestAnimationFrame(() => { if (D && scrollY < 10) harfeGit(D.harf, { yumusak: false }); });
  }
};

/* Listeden kişiye geçiş: kişi sayfasındaki "Hâl Tercemeleri" bağlantısı geri tuşu gibi davranabilsin diye. */
let gecis = null;
export function listedenGidiliyor(liste, hedef) { gecis = { liste, hedef: decodeURIComponent(hedef) }; }
export function sonGecis() { return gecis; }
