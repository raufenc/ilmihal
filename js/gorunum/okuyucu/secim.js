/* Okuyucu — seçim çubuğu ve vurgular.
   Metinden bir parça seçilince seçimin yanında küçük bir çubuk: Vurgulayın (dört renk), Not ekleyin, Kopyalayın, Paylaşın.
   Fare ve dokunmatikte çalışır (selectionchange + pointerup/touchend). Vurgu metin eşlemesiyle saklanır;
   seçimin metni kitabın metninden (konumla) alınır. Bir vurguya basınca rengini değiştirme ya da kaldırma çubuğu açılır. */

import { h, simge } from '../../cekirdek/dom.js';
import { kullanici, VURGU_RENKLERI } from '../../cekirdek/kullanici.js';
import { kisimAdi, sahife as sahifeYaz } from '../../cekirdek/bicim.js';
import { bildir } from '../../bilesen/bildirim.js';
import { noktaKonumu } from './metin.js';
import { YOL } from './simgeler.js';

const EN_AZ = 3;

export function secimKur(S) {
  const iptal = new AbortController();
  const sec = { signal: iptal.signal };
  let cubuk = null;
  let secili = null;       // {bas, son, metin}
  let basili = false;
  let zaman = null;
  const dokunmatik = () => matchMedia('(pointer: coarse)').matches;

  function kapat() {
    clearTimeout(zaman);
    if (!cubuk) return false;
    cubuk.remove();
    cubuk = null;
    secili = null;
    return true;
  }

  function yerlestir(rect, ust = true) {
    const g = cubuk.offsetWidth, y = cubuk.offsetHeight;
    let x = rect.left + rect.width / 2 - g / 2;
    x = Math.max(8, Math.min(innerWidth - g - 8, x));
    const cubukAlti = (S.cubuk && !S.cubuk.classList.contains('gizli')) ? S.cubuk.getBoundingClientRect().bottom : 0;
    let top = ust && !dokunmatik() ? rect.top - y - 10 : rect.bottom + 12;
    if (top < cubukAlti + 6) top = rect.bottom + 12;
    if (top + y > innerHeight - 8) top = Math.max(cubukAlti + 6, rect.top - y - 10);
    cubuk.style.left = Math.round(x) + 'px';
    cubuk.style.top = Math.round(top) + 'px';
  }

  function cubukKur(icerik, rect) {
    if (cubuk) cubuk.remove();
    cubuk = h('.secim-cubugu.baskida-yok', { role: 'toolbar', 'aria-label': 'Seçili metin' }, icerik);
    cubuk.addEventListener('pointerdown', e => { basili = true; if (e.target.closest('button')) e.preventDefault(); });
    cubuk.addEventListener('pointerup', () => setTimeout(() => { basili = false; }, 50));
    cubuk.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); kapat(); } });
    document.body.append(cubuk);
    yerlestir(rect);
  }

  const dg = (etiket, yol, fn, ek = {}) => h('button.secim-dg', { type: 'button', onclick: fn, ...ek }, simge(yol), h('span', etiket));

  function secimOku() {
    const s = document.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount || !S.metinKok) return null;
    const r = s.getRangeAt(0);
    if (!r.intersectsNode(S.metinKok)) return null;
    let bas = noktaKonumu(S.bloklar, r.startContainer, r.startOffset, 'bas');
    let son = noktaKonumu(S.bloklar, r.endContainer, r.endOffset, 'son');
    if (bas === null || son === null || son <= bas) return null;
    const metin = S.madde.metin;
    while (bas < son && /\s/.test(metin[bas])) bas++;
    while (son > bas && /\s/.test(metin[son - 1])) son--;
    if (son - bas < EN_AZ) return null;
    return { bas, son, metin: metin.slice(bas, son), rect: r.getBoundingClientRect() };
  }

  function renkSecici(onSec, etkin = null) {
    return h('.secim-renkler', { role: 'group', 'aria-label': 'Vurgu rengi' },
      VURGU_RENKLERI.map(r => h('button.secim-renk', { type: 'button', 'aria-label': r.etiket, title: r.etiket, 'aria-pressed': String(etkin === r.renk), style: { '--vr': r.renk }, onclick: () => onSec(r.renk) })));
  }

  function secimCubugu(s) {
    secili = { bas: s.bas, son: s.son, metin: s.metin };
    const vurgula = renk => {
      if (!secili) return;
      const sira = kullanici.vurgular.ekle(S.key, secili.metin, renk);
      if (sira < 0) { bildir('Vurgu kaydedilemedi.'); return; }
      document.getSelection().removeAllRanges();
      kapat();
      S.vurgulariYerlestir();
      bildir('Vurgulandı.', { sure: 1600 });
    };
    const anaDugmeler = h('.secim-ana',
      dg('Vurgulayın', YOL.vurgu, () => { anaDugmeler.replaceWith(h('.secim-ana', renkSecici(vurgula), h('button.secim-dg.secim-geri', { type: 'button', 'aria-label': 'Geri', onclick: () => secimCubugu(s) }, simge(YOL.kapat)))); cubuk && cubuk.querySelector('.secim-renk').focus({ preventScroll: true }); }),
      dg('Not ekleyin', YOL.not, () => { const m = secili && secili.metin; document.getSelection().removeAllRanges(); kapat(); S.notYaz && S.notYaz(m); }),
      dg('Kopyalayın', YOL.kopya, async () => {
        const m = secili && secili.metin;
        kapat();
        const md = S.madde;
        const kunye = `Se’âdet-i Ebediyye, ${kisimAdi(md.kisim)}, Madde ${md.no} (sahîfe ${sahifeYaz(md.sahife[0], md.sahife[1])})`;
        const tamam = await S.panoyaYaz(`“${m}”\n— ${kunye}\n${location.origin}/madde/${md.kisim}/${md.no}`);
        bildir(tamam ? 'Alıntı künyesiyle kopyalandı.' : 'Kopyalanamadı.');
      }),
      dg('Paylaşın', YOL.paylas, () => { const m = secili && secili.metin; kapat(); S.paylas(m); }));
    cubukKur(anaDugmeler, s.rect);
  }

  function vurguCubugu(mark) {
    const sira = +mark.dataset.sira;
    const v = kullanici.vurgular.liste(S.key)[sira];
    if (!v) return;
    const rect = mark.getBoundingClientRect();
    cubukKur(h('.secim-ana',
      renkSecici(renk => { kullanici.vurgular.ekle(S.key, v.text, renk); kapat(); S.vurgulariYerlestir(); }, v.renk),
      h('span.secim-ayrac', { 'aria-hidden': 'true' }),
      dg('Kaldırın', YOL.sil, () => {
        kullanici.vurgular.sil(S.key, v.text);
        kapat();
        S.vurgulariYerlestir();
        S.notlariYenile && S.notlariYenile();
        bildir('Vurgu kaldırıldı.', { eylem: { ad: 'Geri alın', yap: () => { kullanici.vurgular.ekle(S.key, v.text, v.renk); S.vurgulariYerlestir(); S.notlariYenile && S.notlariYenile(); } } });
      })), rect);
    requestAnimationFrame(() => cubuk && cubuk.querySelector('button').focus({ preventScroll: true }));
  }

  function denetle() {
    clearTimeout(zaman);
    zaman = setTimeout(() => {
      if (basili) return;
      const s = secimOku();
      if (s) secimCubugu(s);
      else if (cubuk && !cubuk.contains(document.activeElement) && secili) kapat();
    }, dokunmatik() ? 380 : 160);
  }

  document.addEventListener('selectionchange', () => {
    if (basili) return;
    const s = document.getSelection();
    if (s && s.isCollapsed && cubuk && secili) { clearTimeout(zaman); zaman = setTimeout(() => { if (!basili && document.getSelection().isCollapsed) kapat(); }, 250); return; }
    if (dokunmatik()) denetle();       // dokunmatikte kulp sürüklenince pointerup gelmeyebilir
  }, sec);
  document.addEventListener('pointerup', e => { if (cubuk && cubuk.contains(e.target)) return; denetle(); }, sec);
  document.addEventListener('touchend', () => denetle(), { ...sec, passive: true });
  document.addEventListener('keyup', e => { if (e.shiftKey || e.key === 'Shift') denetle(); }, sec);

  // Vurguya basınca düzenleme çubuğu
  S.sayfa.addEventListener('click', e => {
    const m = e.target.closest && e.target.closest('mark.vurgu');
    if (!m || e.target.closest('.zor-kelime, a') || !document.getSelection().isCollapsed) return;
    vurguCubugu(m);
  }, sec);
  S.sayfa.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const m = e.target.closest && e.target.closest('mark.vurgu');
    if (m && e.target === m) { e.preventDefault(); vurguCubugu(m); }
  }, sec);
  addEventListener('scroll', () => { if (cubuk && !secili) kapat(); else if (cubuk && secili) { const s = document.getSelection(); if (s && s.rangeCount && !s.isCollapsed) yerlestir(s.getRangeAt(0).getBoundingClientRect()); } }, { ...sec, passive: true });

  return {
    kapat,
    yokEt() { kapat(); iptal.abort(); }
  };
}
