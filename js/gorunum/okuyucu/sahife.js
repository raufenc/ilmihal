/* Okuyucu — "Kitabın aslı": basılı sahîfe paneli (pdf.js 5.4.624, ilk kullanımda yüklenir).
   Geniş ekranda (≥1100px) sağda yan panel, metin yanında okunur; dar ekranda tam ekran katman.
   PDF aynı kaynaktaki vekil adresten (/kitap/seadet-i-ebediyye.pdf) parça parça okunur. Yerel sunucuda vekil
   olmadığından yüklenemez: panel anlaşılır bir ileti ve "PDF'i yeni sekmede açın" bağlantısı gösterir. */

import { h, simge } from '../../cekirdek/dom.js';
import { kullanici } from '../../cekirdek/kullanici.js';
import { YOL } from './simgeler.js';

const PDF_YOLU = '/kitap/seadet-i-ebediyye.pdf';
const PDFJS = '/vendor/pdfjs-5.4.624/';
const GENIS = 1100;

let belgeSoz = null;     // oturum boyunca bir kez (başarısızsa yeniden denenir)
function belgeYukle() {
  if (belgeSoz) return belgeSoz;
  belgeSoz = import(PDFJS + 'pdf.min.mjs').then(pdfjs => {
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.mjs';
    return pdfjs.getDocument({ url: PDF_YOLU, disableAutoFetch: true, disableStream: true, rangeChunkSize: 262144, isEvalSupported: false, enableXfa: false }).promise;
  });
  belgeSoz.catch(() => { belgeSoz = null; });
  return belgeSoz;
}

export function sahifePaneliKur(S) {
  let panel = null, el = {};
  let no = 1, buyuk = false, cizim = null, acan = null, sira = 0;
  const genisMi = () => innerWidth >= GENIS;
  const toplam = () => S.sahifeSayisi || 1248;
  const disAdres = n => (S.pdfAdres || PDF_YOLU) + '#page=' + n;

  function kur() {
    el.no = h('input.sahife-no', { type: 'number', inputmode: 'numeric', min: '1', max: String(toplam()), 'aria-label': 'Sahîfe numarası' });
    el.onceki = h('button.oku-dg', { type: 'button', 'aria-label': 'Önceki sahîfe', title: 'Önceki sahîfe', onclick: () => ciz(no - 1) }, simge(YOL.sol));
    el.sonraki = h('button.oku-dg', { type: 'button', 'aria-label': 'Sonraki sahîfe', title: 'Sonraki sahîfe', onclick: () => ciz(no + 1) }, simge(YOL.sag));
    el.buyut = h('button.oku-dg', { type: 'button', 'aria-label': 'Büyütün', title: 'Büyütün / sığdırın', 'aria-pressed': 'false', onclick: () => { buyuk = !buyuk; el.buyut.setAttribute('aria-pressed', String(buyuk)); ciz(no); } }, simge(YOL.buyut));
    el.dis = h('a.oku-dg', { href: disAdres(no), target: '_blank', rel: 'noopener', 'aria-label': 'PDF’i yeni sekmede açın', title: 'PDF’i yeni sekmede açın' }, simge(YOL.disari));
    el.kapat = h('button.oku-dg', { type: 'button', 'aria-label': 'Kitabın aslını kapatın', title: 'Kapatın (Esc)', onclick: () => kapat() }, simge(YOL.kapat));
    el.tuval = h('canvas.sahife-tuval', { role: 'img', 'aria-label': 'Kitabın sahîfesi', hidden: true });
    el.durum = h('p.sahife-durum', { role: 'status' });
    el.kutu = h('.sahife-kutu', el.tuval, el.durum);
    el.tuval.addEventListener('dblclick', () => el.buyut.click());
    el.no.addEventListener('change', () => ciz(+el.no.value));
    el.no.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ciz(+el.no.value); } });
    panel = h('aside.oku-sahife.baskida-yok', { 'aria-label': 'Kitabın aslı', tabindex: '-1' },
      h('.sahife-bas',
        h('.sahife-ad', h('span.ust-yazi', 'Kitabın aslı'), h('span.kunye', 'Hakîkat Kitâbevi, 2026 baskısı')),
        el.kapat),
      h('.sahife-arac',
        el.onceki,
        h('label.sahife-sayi', h('span.gizli-yazi', 'Sahîfe'), el.no, h('span.kunye', '/ ' + toplam())),
        el.sonraki,
        h('span.sahife-bosluk'),
        el.buyut, el.dis),
      el.kutu);
    panel.addEventListener('keydown', e => {
      if (e.target === el.no) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); ciz(no - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); ciz(no + 1); }
    });
    S.kok.append(panel);
  }

  function renkler() {
    const tema = document.documentElement.dataset.tema;
    if (tema !== 'gece' && tema !== 'sepya') return null;
    const cs = getComputedStyle(document.documentElement);
    return { background: cs.getPropertyValue('--yuzey').trim(), foreground: cs.getPropertyValue('--murekkep').trim() };
  }

  async function ciz(n) {
    n = Math.max(1, Math.min(toplam(), parseInt(n, 10) || 1));
    no = n;
    const benim = ++sira;
    el.no.value = String(n);
    el.dis.href = disAdres(n);
    el.onceki.disabled = n <= 1;
    el.sonraki.disabled = n >= toplam();
    el.kutu.classList.add('yukleniyor');
    el.kutu.classList.toggle('buyuk', buyuk);
    el.durum.replaceChildren(`Sahîfe ${n} yükleniyor…`);
    el.durum.hidden = false;
    try {
      if (navigator.onLine === false) throw new Error('çevrimdışı');
      const belge = await belgeYukle();
      if (benim !== sira) return;
      const sayfa = await belge.getPage(n);
      if (benim !== sira) return;
      if (cizim) { try { cizim.cancel(); } catch (e) { /* bitti */ } }
      const genislik = Math.max(220, el.kutu.clientWidth - 32) * (buyuk ? 1.8 : 1);
      const olcek = genislik / sayfa.getViewport({ scale: 1 }).width;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const vp = sayfa.getViewport({ scale: olcek * dpr });
      el.tuval.width = Math.floor(vp.width);
      el.tuval.height = Math.floor(vp.height);
      el.tuval.style.width = Math.floor(vp.width / dpr) + 'px';
      el.tuval.style.height = Math.floor(vp.height / dpr) + 'px';
      cizim = sayfa.render({ canvasContext: el.tuval.getContext('2d'), canvas: el.tuval, viewport: vp, annotationMode: 0, pageColors: renkler() });
      await cizim.promise;
      if (benim !== sira) return;
      el.durum.hidden = true;
      el.tuval.hidden = false;
      el.kutu.classList.remove('yukleniyor');
      el.tuval.setAttribute('aria-label', `Kitabın ${n}. sahîfesi`);
      if (n < toplam()) belge.getPage(n + 1).catch(() => {});
    } catch (e) {
      if (e && e.name === 'RenderingCancelledException') return;
      if (benim !== sira) return;
      console.warn('Kitabın aslı yüklenemedi:', e && e.message);
      el.kutu.classList.remove('yukleniyor');
      el.tuval.hidden = true;
      el.durum.replaceChildren(
        h('strong', `Sahîfe ${n} burada açılamadı.`),
        h('span', navigator.onLine === false ? ' İnternet bağlantınız yok görünüyor.' : ' Kitabın dosyasına şu an ulaşılamıyor.'),
        h('span.sahife-durum-eylem',
          h('a.dugme.dugme-kucuk', { href: disAdres(n), target: '_blank', rel: 'noopener' }, 'PDF’i yeni sekmede açın'),
          h('button.dugme.dugme-kucuk', { type: 'button', onclick: () => ciz(n) }, 'Yeniden deneyin')));
      el.durum.hidden = false;
    }
  }

  function ac(n, kaynak = null) {
    if (!panel) kur();
    acan = kaynak || document.activeElement;
    const ilk = panel.hidden !== false || !panel.classList.contains('acik');
    panel.classList.add('acik');
    panel.hidden = false;
    document.documentElement.classList.add('sahife-acik');
    document.documentElement.classList.toggle('sahife-tam', !genisMi());
    S.dg.asil.setAttribute('aria-expanded', 'true');
    S.dg.asil.classList.add('etkin');
    if (genisMi()) kullanici.sahifeAcik.yaz(true);
    requestAnimationFrame(() => ciz(n || (S.madde && S.madde.sahife[0]) || 1));
    if (ilk) requestAnimationFrame(() => (genisMi() ? el.kapat : el.kapat).focus({ preventScroll: true }));
  }

  function kapat({ tercih = true } = {}) {
    if (!panel || !panel.classList.contains('acik')) return false;
    sira++;
    if (cizim) { try { cizim.cancel(); } catch (e) { /* bitti */ } }
    panel.classList.remove('acik');
    panel.hidden = true;
    document.documentElement.classList.remove('sahife-acik', 'sahife-tam');
    S.dg.asil.setAttribute('aria-expanded', 'false');
    S.dg.asil.classList.remove('etkin');
    if (tercih && genisMi()) kullanici.sahifeAcik.yaz(false);
    if (acan && acan.isConnected) acan.focus({ preventScroll: true });
    acan = null;
    return true;
  }

  let boyut = null;
  const boyutDegisti = () => {
    clearTimeout(boyut);
    boyut = setTimeout(() => {
      if (!panel || !panel.classList.contains('acik')) return;
      document.documentElement.classList.toggle('sahife-tam', !genisMi());
      ciz(no);
    }, 200);
  };
  addEventListener('resize', boyutDegisti);

  return {
    ac,
    kapat,
    acikMi: () => !!panel && panel.classList.contains('acik'),
    degistir() { if (this.acikMi()) kapat(); else ac(S.madde && S.madde.sahife[0], S.dg.asil); },
    genislik: () => (panel && panel.classList.contains('acik') && genisMi() ? panel.getBoundingClientRect().width : 0),
    temaDegisti() { if (this.acikMi()) ciz(no); },
    /** Yeni madde: panel açıksa o maddenin ilk sahîfesine geçer; ilk açılışta tercih açıksa (geniş ekranda) açar. */
    maddeDegisti(madde, { ilk = false } = {}) {
      if (this.acikMi()) { ciz(madde.sahife[0]); return; }
      if (ilk && genisMi() && kullanici.sahifeAcik.al()) ac(madde.sahife[0], S.dg.asil);
    },
    yokEt() { sira++; removeEventListener('resize', boyutDegisti); if (panel) panel.remove(); panel = null; document.documentElement.classList.remove('sahife-acik', 'sahife-tam'); }
  };
}
