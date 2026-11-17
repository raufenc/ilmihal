/* Okuyucu — lügat kenar notu (hâşiye).
   Geniş ekranda (sağda yeterli boşluk varsa) kelimenin satırı hizasında, sağ kenar boşluğunda bir kenar notu;
   dar ekranda alttan açılan küçük sayfa. Fareyle üstüne gelince geçici açılır; tıklayınca ya da Enter ile sabitlenir.
   Esc kapatır, odak kelimeye döner. Lügat verisi gelmeden kelimeler işaretli değildir (metin yine okunur). */

import { h, simge } from '../../cekirdek/dom.js';
import { veri } from '../../cekirdek/veri.js';
import { YOL } from './simgeler.js';

const KENAR_GENISLIK = 14 * 17 + 36;   // kenar notu (14rem) + boşluk (px)
const inceIsaretci = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

export function hasiyeKur(S) {
  const iptal = new AbortController();
  const sec = { signal: iptal.signal };
  let not = null;          // açık not öğesi
  let kelime = null;       // açık notun kelimesi
  let sabit = false;
  let gecikme = null, kapanma = null;

  const kenarVar = () => {
    const sayfa = S.metinKok;
    if (!sayfa) return false;
    const r = sayfa.getBoundingClientRect();
    const sag = document.documentElement.classList.contains('sahife-acik') ? (S.sahife.genislik() || 0) : 0;
    return innerWidth >= 1180 && innerWidth - sag - r.right >= KENAR_GENISLIK + 20;
  };

  function icerik(id, kel) {
    const t = S.lugat && S.lugat.terimler && S.lugat.terimler[id];
    if (!t) return null;
    const anlam = h('p.hasiye-anlam', t.anlam || '');
    const ek = h('.hasiye-ek');
    const eylemler = h('.hasiye-eylem');
    if (t.misalVar) {
      const dg = h('button.bag', { type: 'button' }, 'Misali gösterin');
      dg.addEventListener('click', async () => {
        dg.disabled = true;
        dg.textContent = 'Getiriliyor…';
        try {
          const tam = await veri.lugatTerim(id);
          if (tam && tam.misal) ek.append(h('p.hasiye-misal', h('span.hasiye-etiket', 'Misal: '), tam.misal));
          dg.remove();
          konumla();
        } catch (e) {
          dg.disabled = false;
          dg.textContent = 'Misal getirilemedi; yeniden deneyin';
        }
      });
      eylemler.append(dg);
    }
    eylemler.append(h('a.ok-bag', { href: `/sozluk#sozluk-entry-${id}` }, 'Lügatte açın'));
    return [
      h('.hasiye-bas',
        h('b.hasiye-kelime', t.kelime || kel),
        t.osmanlica ? h('span.hasiye-arabi', { lang: 'ar', dir: 'rtl' }, t.osmanlica) : null),
      anlam,
      t.bakiniz ? h('p.hasiye-bkz', h('span.hasiye-etiket', 'Bakınız: '), t.bakiniz) : null,
      ek,
      eylemler
    ];
  }

  function konumla() {
    if (!not || !kelime || !not.classList.contains('kenar')) return;
    const kap = S.sayfa.querySelector('.oku-sayfa-ic');
    const ust = kelime.getBoundingClientRect().top - kap.getBoundingClientRect().top;
    not.style.top = Math.max(0, ust - 4) + 'px';
  }

  function kapat(odakGeri = false) {
    clearTimeout(gecikme); clearTimeout(kapanma);
    if (!not) return false;
    const k = kelime;
    not.remove();
    not = null; kelime = null; sabit = false;
    if (k) { k.classList.remove('acik'); k.setAttribute('aria-expanded', 'false'); if (odakGeri && k.isConnected) k.focus({ preventScroll: true }); }
    return true;
  }

  function ac(span, { sabitle = false, klavye = false } = {}) {
    const id = span.dataset.id;
    if (kelime === span && not) { if (sabitle) { sabit = true; not.classList.add('sabit'); } return; }
    kapat();
    const govde = icerik(id, span.textContent);
    if (!govde) return;
    kelime = span;
    sabit = sabitle;
    span.classList.add('acik');
    span.setAttribute('aria-expanded', 'true');
    const kenar = kenarVar();
    const kimlik = 'hasiye-' + id;
    if (kenar) {
      not = h('aside.hasiye.kenar', { id: kimlik, role: 'note', 'aria-live': 'polite', 'aria-label': 'Lügat: ' + span.textContent }, govde);
      S.sayfa.querySelector('.oku-sayfa-ic').append(not);
      konumla();
    } else {
      not = h('aside.hasiye.alt', { id: kimlik, role: 'dialog', 'aria-label': 'Lügat: ' + span.textContent, tabindex: '-1' },
        h('button.oku-dg.hasiye-kapat', { type: 'button', 'aria-label': 'Kapatın', onclick: () => kapat(true) }, simge(YOL.kapat)),
        h('.hasiye-kaydir', govde));
      document.body.append(not);
      sabit = true;
      if (klavye) requestAnimationFrame(() => not && not.focus({ preventScroll: true }));
    }
    if (sabit) not.classList.add('sabit');
    span.setAttribute('aria-controls', kimlik);
    not.addEventListener('mouseenter', () => clearTimeout(kapanma));
    not.addEventListener('mouseleave', () => { if (!sabit) kapanma = setTimeout(kapat, 350); });
    not.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); kapat(true); } });
  }

  const kelimeBul = e => e.target && e.target.closest ? e.target.closest('.zor-kelime') : null;

  S.sayfa.addEventListener('mouseover', e => {
    if (!inceIsaretci() || S.kok.classList.contains('lugat-kapali')) return;
    const k = kelimeBul(e);
    if (!k) return;
    clearTimeout(kapanma);
    if (sabit && not) return;
    clearTimeout(gecikme);
    gecikme = setTimeout(() => { if (!document.getSelection().toString()) ac(k); }, 180);
  }, sec);
  S.sayfa.addEventListener('mouseout', e => {
    const k = kelimeBul(e);
    if (!k) return;
    clearTimeout(gecikme);
    if (!sabit && not) kapanma = setTimeout(kapat, 350);
  }, sec);
  S.sayfa.addEventListener('click', e => {
    const k = kelimeBul(e);
    if (!k) return;
    if (document.getSelection().toString().length > 1) return;   // seçim yapılıyor
    e.preventDefault();
    if (kelime === k && sabit) { kapat(); return; }
    ac(k, { sabitle: true });
  }, sec);
  S.sayfa.addEventListener('keydown', e => {
    const k = kelimeBul(e);
    if (!k || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    if (kelime === k && sabit) { kapat(true); return; }
    ac(k, { sabitle: true, klavye: true });
  }, sec);
  // Dışarı tıklayınca sabit not kapanır
  document.addEventListener('pointerdown', e => {
    if (!not) return;
    if (not.contains(e.target) || (kelime && kelime.contains(e.target))) return;
    if (kelimeBul(e)) return;
    kapat();
  }, sec);

  return {
    kapat,
    acikMi: () => !!not,
    yokEt() { kapat(); iptal.abort(); }
  };
}
