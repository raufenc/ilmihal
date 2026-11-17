/* Bilgi Testi (/quiz): okuduklarını kitaptan alınmış sorularla tekrar etme.
   Oyun dili yok: puan/rozet gösterilmez. En yüksek oran eski anahtara (ilmihal-quiz-puan) eski biçimiyle yazılır.
   Klavye: 1–4 ya da A–D şık seçer; Enter sonraki soruya geçer. Zamanlayıcı yok. */

import { h, doldur, durum, dinle } from '../cekirdek/dom.js';
import { cssYukle } from '../cekirdek/css.js';
import { yenile } from '../cekirdek/yonlendirici.js';
import { veri, maddeKimlik } from '../cekirdek/veri.js';
import { kullanici } from '../cekirdek/kullanici.js';
import { ad, roma } from '../cekirdek/bicim.js';
import { iyelik } from '../bilesen/okuma-plani-kutu.js';

const HARF = ['A', 'B', 'C', 'D', 'E', 'F'];
const KARISIK_SAYI = 10;
const ATIF = /\s*\((K\d+\s*\/\s*M\d+)\)/g;
/** 7 → "7’sine", 6 → "6’sına" */
const yonelme = n => { const y = iyelik(n); return y + 'n' + (/[iü]$/.test(y) ? 'e' : 'a'); };
const noYaz = m => { const c = maddeKimlik.coz(m); return c ? roma(c.kisim) + ' · ' + c.no : ''; };

export default {
  ad: 'test',
  baslik: 'Bilgi Testi',
  async kur(kap, p, baglam) {
    baglam.metaYaz({ aciklama: 'Se’âdet-i Ebediyye’den alınmış sorularla okuduklarınızı tekrar edin; her cevap kitaptaki yeriyle.' });
    let T, f;
    try {
      [, T, f] = await Promise.all([cssYukle('/css/test.css'), veri.testSorulari({ sinyal: baglam.sinyal }), veri.fihrist({ sinyal: baglam.sinyal })]);
    } catch (e) {
      if (e.name === 'AbortError') return;
      kap.append(h('.kap.kap-dar', durum('Sorular yüklenemedi',
        e.tur === 'cevrimdisi' ? 'Bağlantı yok. Sorular bu cihaza henüz inmemiş; bağlanınca yeniden deneyin.' : 'Bir aksaklık oldu; yeniden deneyin.',
        h('button.dugme.dugme-ana', { type: 'button', onclick: () => yenile() }, 'Yeniden deneyin'))));
      return;
    }
    const kunye = new Map(f.maddeler.map(m => [m.kisim + '-' + m.no, m]));
    const kok = h('.kap.kap-dar.ts');
    kap.append(kok);

    // Durum: null = konu seçimi
    let S = null;   // { konu, sorular:[{…, konuAd}], i, secim, dogru, yanlislar:[] }

    const odakla = el => { if (el) requestAnimationFrame(() => el.focus({ preventScroll: false })); };

    function secimEkrani() {
      S = null;
      doldur(kok,
        h('header.ts-ust',
          h('p.ust-yazi', 'Kitaptan Derlenenler'),
          h('h1.baslik-2', 'Bilgi Testi'),
          h('p.giris-yazi', 'Okuduklarınızı kitaptan alınmış sorularla tekrar edin. Her cevabın altında kitaptaki yeri yazılıdır.')),
        h('h2.ts-alt', 'Bir konu seçin'),
        h('ul.ts-konular', T.konular.map((k, i) => {
          const sayi = k.karisik ? Math.min(KARISIK_SAYI, T.konular.reduce((t, x) => t + (x.karisik ? 0 : x.sorular.length), 0)) : k.sorular.length;
          return h('li', h('button.ts-konu', { type: 'button', disabled: !sayi, onclick: () => basla(k) },
            h('span.fihrist-no', String(i + 1)),
            h('span.fihrist-ad', h('span', k.ad)),
            h('span.fihrist-sayfa', k.karisik ? `${sayi} soru · bütün konulardan` : `${sayi} soru`)));
        })));
      baglam.baslikYaz('Bilgi Testi');
    }

    function basla(konu) {
      let sorular;
      if (konu.karisik) {
        sorular = T.konular.filter(k => !k.karisik).flatMap(k => k.sorular.map(s => ({ ...s, konuAd: k.ad })));
        for (let i = sorular.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [sorular[i], sorular[j]] = [sorular[j], sorular[i]]; }
        sorular = sorular.slice(0, KARISIK_SAYI);
      } else sorular = konu.sorular.map(s => ({ ...s, konuAd: konu.ad }));
      if (!sorular.length) return;
      S = { konu, sorular, i: 0, secim: null, dogru: 0, yanlislar: [] };
      soruEkrani(true);
    }

    function soruEkrani(odakSoru = false) {
      const s = S.sorular[S.i];
      const cevapli = S.secim !== null;
      const n = S.sorular.length;
      const { metin, atiflar } = aciklamaAyir(s.aciklama);
      const madde = maddeKimlik.coz(s.madde) ? s.madde : (atiflar[0] || null);
      const k = madde ? kunye.get(maddeKimlik.anahtar(madde)) : null;
      const sonuncu = S.i === n - 1;

      const siklar = h('ol.ts-siklar', { 'aria-label': 'Şıklar' }, s.siklar.map((sik, j) => {
        const dogru = j === s.dogru, secilen = j === S.secim;
        const etiket = cevapli ? (dogru && secilen ? 'Doğru cevap · sizin cevabınız' : dogru ? 'Doğru cevap' : secilen ? 'Sizin cevabınız' : null) : null;
        return h('li', h('button.ts-sik' + (cevapli && dogru ? '.dogru' : '') + (cevapli && secilen && !dogru ? '.yanlis' : ''), {
          type: 'button', 'aria-disabled': cevapli ? 'true' : null, dataset: { sik: String(j) },
          'aria-keyshortcuts': `${j + 1} ${HARF[j]}`,
          onclick: () => cevapla(j)
        },
          h('span.ts-harf', { 'aria-hidden': 'true' }, HARF[j]),
          h('span.ts-sik-metin', h('span.gizli-yazi', HARF[j] + ') '), sik),
          etiket ? h('span.ts-etiket', etiket) : null));
      }));

      const sonra = cevapli ? h('section.ts-cevap', { 'aria-live': 'polite' },
        h('p.ts-hukum', S.secim === s.dogru ? 'Doğru.' : `Doğru cevap ${HARF[s.dogru]} şıkkı: ${s.siklar[s.dogru]}.`),
        h('p.ts-aciklama', metin.map(p => typeof p === 'string' ? p : atifBag(p, kunye))),
        k ? h('p.ts-kaynak', 'Kitaptaki yeri: ', h('a', { href: maddeKimlik.yol(madde) }, h('span.ts-no', noYaz(madde)), ' ', ad(k.baslik))) : null,
        h('.sira.ts-eylem', h('button.dugme.dugme-ana#ts-sonraki', { type: 'button', onclick: ilerle }, sonuncu ? 'Sonucu görün' : 'Sonraki soru'),
          h('span.kunye.ts-ipucu', 'ya da ', h('kbd', 'Enter')))) : null;

      doldur(kok,
        h('.ts-bas',
          h('button.bag.ts-geri', { type: 'button', onclick: async () => secimEkrani() }, '← Konular'),
          h('p.kunye.ts-sira', h('span', S.konu.karisik ? `Karışık · ${s.konuAd}` : s.konuAd), ' · ', h('b', `${S.i + 1} / ${n}`))),
        h('.ts-cizgi', { 'aria-hidden': 'true' }, h('i', { style: { width: ((S.i + (cevapli ? 1 : 0)) / n * 100) + '%' } })),
        h('h1.ts-soru#ts-soru', { tabindex: '-1' }, s.soru),
        siklar,
        cevapli ? null : h('p.kunye.ts-ipucu', 'Seçmek için şıkka basın ya da ', h('kbd', '1'), '–', h('kbd', String(s.siklar.length)), ' / ', h('kbd', 'A'), '–', h('kbd', HARF[s.siklar.length - 1]), ' tuşlarını kullanın.'),
        sonra);
      baglam.baslikYaz(`Bilgi Testi · ${S.i + 1} / ${n}`);
      if (odakSoru) odakla(kok.querySelector('#ts-soru'));
      else if (cevapli) odakla(kok.querySelector('#ts-sonraki'));
    }

    function cevapla(j) {
      if (!S || S.secim !== null) return;
      const s = S.sorular[S.i];
      if (!(j >= 0 && j < s.siklar.length)) return;
      S.secim = j;
      if (j === s.dogru) S.dogru++; else S.yanlislar.push(s);
      soruEkrani();
    }

    function ilerle() {
      if (!S || S.secim === null) return;
      if (S.i < S.sorular.length - 1) { S.i++; S.secim = null; soruEkrani(true); window.scrollTo(0, 0); }
      else ozetEkrani();
    }

    function ozetEkrani() {
      const n = S.sorular.length;
      kullanici.quizPuani.kaydet(Math.round(S.dogru / n * 100));
      const maddeler = [];
      for (const s of S.yanlislar) {
        const m = maddeKimlik.coz(s.madde) ? s.madde : aciklamaAyir(s.aciklama).atiflar[0];
        const a = m && maddeKimlik.anahtar(m);
        if (a && !maddeler.some(x => x.a === a)) maddeler.push({ a, m, s });
      }
      const konu = S.konu;
      doldur(kok,
        h('header.ts-ust',
          h('p.ust-yazi', konu.karisik ? 'Karışık' : konu.ad),
          h('h1.baslik-3#ts-ozet', { tabindex: '-1' }, S.dogru ? `${n} sorunun ${yonelme(S.dogru)} doğru cevap verdiniz.` : `${n} sorunun hiçbirine doğru cevap verilmedi.`),
          S.yanlislar.length ? null : h('p.giris-yazi', 'Bütün sorulara doğru cevap verdiniz.')),
        maddeler.length ? h('section.ts-tekrar', { 'aria-labelledby': 'ts-tekrar-bas' },
          h('h2.ts-alt#ts-tekrar-bas', 'Tekrar okumak isteyebileceğiniz maddeler'),
          h('ul.ts-maddeler', maddeler.map(({ a, m, s }) => {
            const k = kunye.get(a);
            return h('li', h('a.ts-madde', { href: maddeKimlik.yol(m) },
              h('span.fihrist-no', noYaz(m)),
              h('span.ts-madde-govde', h('span.ts-madde-ad', ad(k ? k.baslik : a)), h('span.ts-madde-soru', s.soru)),
              h('span.fihrist-sayfa', k ? String(k.sahife[0]) : '')));
          }))) : null,
        h('.sira.ts-eylem',
          h('button.dugme.dugme-ana', { type: 'button', onclick: () => basla(konu) }, konu.karisik ? 'Yeni karışık sorular' : 'Yeniden başlayın'),
          h('button.dugme', { type: 'button', onclick: secimEkrani }, 'Başka bir konu seçin')));
      S = { ...S, bitti: true };
      baglam.baslikYaz('Bilgi Testi · Sonuç');
      odakla(kok.querySelector('#ts-ozet'));
    }

    // Klavye: yalnız soru ekranında; yazı alanında ve açık pencerede çalışmaz
    baglam.temizle(dinle(document, 'keydown', e => {
      if (!S || S.bitti || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('dialog[open], .menu')) return;
      const sik = S.sorular[S.i].siklar.length;
      let j = -1;
      if (/^[1-9]$/.test(e.key)) j = +e.key - 1;
      else { const x = HARF.indexOf(e.key.toLocaleUpperCase('tr').replace('İ', 'I')); if (x >= 0) j = x; }
      if (j >= 0 && j < sik && S.secim === null) { e.preventDefault(); cevapla(j); return; }
      if (e.key === 'Enter' && S.secim !== null) {
        if (t && t.closest && t.closest('button, a')) return;   // odak bir düğmedeyse tarayıcı zaten tıklar
        e.preventDefault(); ilerle();
      }
    }));
    baglam.temizle(() => { S = null; });

    secimEkrani();
  }
};

/** Açıklamadaki "(K1/M46)" atıflarını metinden ayırır. Sondakiler kaldırılır (bağlantısı altta verilir),
    ortadakiler yerinde bağlantı olur. Döner: { metin: [dizgi | {atif}], atiflar: ['K1/M46', …] } */
function aciklamaAyir(aciklama) {
  const s = String(aciklama || '');
  const atiflar = [];
  const parcalar = [];
  let son = 0, m;
  ATIF.lastIndex = 0;
  while ((m = ATIF.exec(s))) {
    const kod = m[1].replace(/\s+/g, '');
    if (maddeKimlik.coz(kod)) atiflar.push(kod);
    parcalar.push(s.slice(son, m.index));
    const sonda = s.slice(m.index + m[0].length).trim() === '';
    if (!sonda) parcalar.push({ atif: kod });
    son = m.index + m[0].length;
  }
  parcalar.push(s.slice(son));
  return { metin: parcalar.filter(p => p !== ''), atiflar };
}

function atifBag(p, kunye) {
  const yol = maddeKimlik.yol(p.atif);
  if (!yol) return ` (${p.atif})`;
  const k = kunye.get(maddeKimlik.anahtar(p.atif));
  return [' (', h('a.ts-atif', { href: yol, title: k ? k.baslik : '' }, noYaz(p.atif)), ')'];
}
