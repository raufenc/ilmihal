/* Okuyucu — madde sonu: "Bu maddede" (âyet-i kerîmeler, hadîs-i şerîfler, adı geçen büyükler, tablolar,
   fıkhî hükümler, atıflar), Notlarım ve vurgularım, önceki/sonraki madde.
   Kart yok: başlık + fihrist satırları. Boş bölüm hiç çizilmez. */

import { h, simge, semse } from '../../cekirdek/dom.js';
import { maddeKimlik } from '../../cekirdek/veri.js';
import { kullanici } from '../../cekirdek/kullanici.js';
import { ad, sayi, kisimAdi } from '../../cekirdek/bicim.js';
import { bildir } from '../../bilesen/bildirim.js';
import { araligiSar, sok, metindeBul } from './metin.js';
import { YOL } from './simgeler.js';

const ATIF_BASLIK = [
  ['madde referansı', 'Kitapta atıf', 'Bu maddenin metni şu maddelere gönderir'],
  ['atıf yapan madde', 'Bu maddeye atıf yapan', null],
  ['aynı konu', 'Yakın konu', null]
];

function kunyeHarita(S) {
  if (!S.fihrist) return new Map();
  if (!S._harita) S._harita = new Map(S.fihrist.maddeler.map(m => [`${m.kisim}-${m.no}`, m]));
  return S._harita;
}

/** Metindeki bir yeri kısa süre işaretleyip oraya kaydırır. */
export function metindeGoster(S, bas, son) {
  for (const m of [...S.metinKok.querySelectorAll('mark.goster')]) sok(m);
  const isaret = araligiSar(S.bloklar, bas, son, () => h('mark.goster'));
  if (!isaret.length) return false;
  isaret[0].scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  setTimeout(() => isaret.forEach(m => m.classList.add('sondu')), 2600);
  setTimeout(() => isaret.forEach(m => m.isConnected && sok(m)), 4200);
  return true;
}

function sahifeBag(S, n, metin = null) {
  return h('a.oku-sahife-bag', { href: S.pdfAdres + '#page=' + n, target: '_blank', rel: 'noopener', dataset: { sahife: String(n) }, title: 'Kitabın aslında açın' }, metin || `s. ${n}`);
}

function alinti(S, x, kunyeParca) {
  const yer = metindeBul(S.madde.metin, x.metin) || metindeBul(S.madde.metin, x.metin.slice(0, 48));
  const parcalar = kunyeParca.filter(Boolean);
  return h('li.oku-alinti',
    h('p.oku-alinti-metin', '“', x.metin, '”'),
    h('p.oku-alinti-kunye.kunye',
      parcalar.length ? h('span', parcalar.join(' · ')) : null,
      x.sahife ? sahifeBag(S, x.sahife) : null,
      yer ? h('button.bag.oku-goster', { type: 'button', onclick: () => metindeGoster(S, yer[0], yer[1]) }, 'Metinde gösterin') : null));
}

function bolum(baslik, ...ic) {
  return h('section.oku-bolum', h('h3.oku-bolum-baslik', baslik), ...ic);
}

export function sonBolumCiz(S, kap) {
  const m = S.madde;
  const harita = kunyeHarita(S);
  const bolumler = [];

  if (m.ayetler.length) bolumler.push(bolum(m.ayetler.length > 1 ? 'Âyet-i kerîmeler' : 'Âyet-i kerîme',
    h('ul.oku-alintilar', m.ayetler.map(a => alinti(S, a, [a.sure ? `${a.sure} sûresi` : null, a.ayetNo ? `${a.ayetNo} âyet` : null])))));
  if (m.hadisler.length) bolumler.push(bolum(m.hadisler.length > 1 ? 'Hadîs-i şerîfler' : 'Hadîs-i şerîf',
    h('ul.oku-alintilar', m.hadisler.map(x => alinti(S, x, [x.kaynak])))));

  if (m.sahislar.length) bolumler.push(bolum('Adı geçen büyükler',
    h('ul.oku-sahislar', m.sahislar.map(s => h('li', h('a', { href: `/sahis/${encodeURIComponent(s.slug)}` }, ad(s.isim), s.unvan ? h('span.oku-unvan', ` (${s.unvan})`) : null))))));

  if (m.tablolar.length) bolumler.push(bolum('Tablolar',
    h('ul.fihrist.oku-satirlar', m.tablolar.map(t => h('li', h('a.fihrist-satir', { href: `/fevaid/tablolar/${encodeURIComponent(t.id)}` },
      h('span.fihrist-no', h('span.gizli-yazi', 'Tablo')),
      h('span.fihrist-ad', h('span', ad(t.baslik))),
      h('span.fihrist-sayfa', t.sahife ? String(t.sahife) : '')))))));

  if (m.hukumSayisi && m.hukumSayisi.tum > 0) {
    const { acik, tum } = m.hukumSayisi;
    bolumler.push(bolum('Fıkhî hükümler',
      h('p.oku-hukum',
        acik ? [h('b.sayi', sayi(acik)), ' açık hüküm'] : null,
        acik && tum > acik ? '; bütün geçişleriyle ' : (acik ? '' : 'Bütün geçişleriyle '),
        !acik || tum > acik ? [h('b.sayi', sayi(tum)), ' kayıt'] : null,
        '. ',
        h('a.ok-bag', { href: `/hukumler?madde=${m.madde}` }, 'Bu maddenin hükümleri'))));
  }

  const atifGruplari = [];
  for (const [neden, baslik] of ATIF_BASLIK) {
    const satirlar = m.atiflar.filter(a => a.neden === neden).map(a => harita.get(a.madde)).filter(Boolean);
    if (!satirlar.length) continue;
    atifGruplari.push(h('.oku-atif-grup',
      h('h4.ust-yazi', baslik),
      h('ul.fihrist.oku-satirlar', satirlar.map(x => h('li', h('a.fihrist-satir', { href: maddeKimlik.yol(x.kisim, x.no) },
        h('span.fihrist-no', x.kisim !== m.kisim ? `${['', 'I', 'II', 'III'][x.kisim] || x.kisim}·${x.no}` : String(x.no)),
        h('span.fihrist-ad', h('span', ad(x.baslik))),
        h('span.fihrist-sayfa', String(x.sahife[0]))))))));
  }
  if (atifGruplari.length) bolumler.push(bolum('Atıflar', ...atifGruplari));

  kap.replaceChildren();
  if (bolumler.length) {
    kap.append(h('section.oku-son', { 'aria-labelledby': 'bu-maddede' },
      h('.ayrac', { 'aria-hidden': 'true' }, semse()),
      h('h2.oku-son-baslik#bu-maddede', 'Bu maddede'),
      ...bolumler));
  }
}

export function komsuCiz(S, kap) { kap.replaceChildren(komsular(S)); }

function komsular(S) {
  const m = S.madde;
  const harita = kunyeHarita(S);
  const satir = (anahtar, yon) => {
    if (!anahtar) return null;
    const x = harita.get(anahtar);
    const c = maddeKimlik.coz(anahtar);
    if (!c) return null;
    const kisimFarkli = c.kisim !== m.kisim;
    return h('a.oku-komsu-satir.' + yon, { href: maddeKimlik.yol(c), rel: yon === 'onceki' ? 'prev' : 'next' },
      h('span.oku-komsu-yon.ust-yazi', yon === 'onceki' ? 'Önceki madde' : 'Sonraki madde', kisimFarkli ? ` · ${kisimAdi(c.kisim)}` : ''),
      h('span.oku-komsu-ad',
        h('span.oku-komsu-no', String(c.no)),
        h('span.oku-komsu-baslik', x ? ad(x.baslik) : `Madde ${c.no}`)),
      h('span.oku-komsu-ok', { 'aria-hidden': 'true' }, simge(yon === 'onceki' ? YOL.sol : YOL.sag)));
  };
  return h('nav.oku-komsu.baskida-yok', { 'aria-label': 'Önceki ve sonraki madde' },
    satir(m.onceki, 'onceki') || h('p.oku-komsu-uc.kunye', 'Kitabın ilk maddesi.'),
    satir(m.sonraki, 'sonraki') || h('p.oku-komsu-uc.kunye', 'Kitabın son maddesi. ', h('a', { href: '/icindekiler' }, 'Fihriste dönün')));
}

/* ── Notlarım ve vurgularım ── */

export function notlarCiz(S, kap) {
  const alan = h('textarea.alan.not-alan#not-metni', { rows: '3', placeholder: 'Bu madde hakkında bir not yazın…', 'aria-label': 'Not' });
  const kaydet = h('button.dugme.dugme-kucuk', { type: 'button' }, 'Notu kaydedin');
  const notListe = h('ul.not-liste');
  const vurguListe = h('ul.not-liste.vurgu-liste');
  const vurguBolum = h('.not-vurgular', h('h3.ust-yazi', 'Vurgularım'), vurguListe);

  const yenile = () => {
    const notlar = kullanici.notlar.liste(S.key);
    notListe.replaceChildren(...notlar.map((n, i) => h('li.not-satir',
      h('p.not-metin', n.text),
      h('p.not-alt.kunye', h('span', n.date || ''),
        h('button.bag', { type: 'button', onclick: () => {
          kullanici.notlar.sil(S.key, i);
          yenile();
          bildir('Not silindi.', { eylem: { ad: 'Geri alın', yap: () => { kullanici.notlar.ekle(S.key, n.text, n.date); yenile(); } } });
        } }, 'Silin')))));
    if (!notlar.length) notListe.append(h('li.not-bos.kunye', 'Henüz bu maddeye not yazmadınız. Metinden bir yer seçip “Not ekleyin” diyerek alıntıyla da başlayabilirsiniz.'));

    const vurgular = kullanici.vurgular.liste(S.key);
    vurguBolum.hidden = !vurgular.length;
    vurguListe.replaceChildren(...vurgular.map((v, i) => {
      const yer = metindeBul(S.madde.metin, v.text);
      const yerlesmedi = S.yerlesmeyen && S.yerlesmeyen.has(i);
      return h('li.not-satir.vurgu-satir', { style: /^#[0-9a-f]{6}$/i.test(v.renk) ? { '--vr': v.renk } : null },
        h('p.not-metin.vurgu-metin', v.text),
        h('p.not-alt.kunye',
          yer && !yerlesmedi ? h('button.bag', { type: 'button', onclick: () => { const mk = S.metinKok.querySelector(`mark.vurgu[data-sira="${i}"]`); if (mk) mk.scrollIntoView({ block: 'center' }); } }, 'Metinde gösterin')
            : h('span', 'Bu vurgu metinde bulunamadı; kaydı saklanıyor.'),
          h('button.bag', { type: 'button', onclick: () => { kullanici.vurgular.sil(S.key, v.text); S.vurgulariYerlestir(); yenile(); bildir('Vurgu kaldırıldı.', { eylem: { ad: 'Geri alın', yap: () => { kullanici.vurgular.ekle(S.key, v.text, v.renk); S.vurgulariYerlestir(); yenile(); } } }); } }, 'Kaldırın')));
    }));
  };

  kaydet.addEventListener('click', () => {
    const metin = alan.value.trim();
    if (!metin) { alan.focus(); return; }
    if (kullanici.notlar.ekle(S.key, metin)) { alan.value = ''; yenile(); bildir('Not kaydedildi.'); }
    else bildir('Not kaydedilemedi.');
  });
  alan.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); kaydet.click(); } });

  kap.replaceChildren(
    h('h2.oku-son-baslik#notlarim-baslik', 'Notlarım'),
    h('.not-yaz', alan, h('.not-yaz-alt', h('span.kunye', 'Notlar yalnız bu cihazda, tarayıcınızda saklanır.'), kaydet)),
    notListe,
    vurguBolum);
  yenile();

  S.notlariYenile = () => { yenile(); };
  S.notYaz = alintiMetni => {
    if (alintiMetni) alan.value = `“${alintiMetni}”\n`;
    kap.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setTimeout(() => { alan.focus({ preventScroll: true }); alan.setSelectionRange(alan.value.length, alan.value.length); }, 350);
  };
}
