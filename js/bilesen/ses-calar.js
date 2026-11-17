/* Sesli okuma çaları: ekranın altında ince, yapışık bir şerit.
   const calar = sesCalarKur({ onDegis });
   calar.yukle({ kisim, no, baslik, kisimAdi, ses });   // ses: veri.madde(...).ses (null olabilir)
   calar.ac();        // şeridi gösterir ve çalar (yalnız kullanıcı isteğiyle; kendiliğinden çalmaz)
   calar.kapat();     // durdurur, şeridi gizler
   calar.yokEt();     // görünümden çıkarken

   Çalma düzeni (VERI.md §3): parçalar sırayla; her parçada `bas` saniyeden başla, `son` null değilse orada dur.
   Konum ve hız eski anahtarlarla saklanır (ilmihal-audio-pos, ilmihal-audio-speed). Kayıtlı konum
   yalnız aynı maddeye ve kaydedildiği PARÇAYA uygulanır (eski H-9 hatası taşınmadı). */

import { h, simge } from '../cekirdek/dom.js';
import { kullanici, SES_HIZLARI } from '../cekirdek/kullanici.js';

const YOL = {
  cal: 'M8 5.5v13l11-6.5z',
  dur: ['M8.5 5.5v13', 'M15.5 5.5v13'],
  geri: ['M4.5 12a7.5 7.5 0 1 0 2.2-5.3', 'M4.5 4.5v4h4'],
  ileri: ['M19.5 12a7.5 7.5 0 1 1-2.2-5.3', 'M19.5 4.5v4h-4'],
  kapat: 'M6 6l12 12M18 6 6 18'
};

const sureYaz = sn => {
  if (!Number.isFinite(sn) || sn < 0) return '0:00';
  sn = Math.floor(sn);
  const s = Math.floor(sn / 3600), d = Math.floor((sn % 3600) / 60), n = sn % 60;
  return (s ? s + ':' + String(d).padStart(2, '0') : d) + ':' + String(n).padStart(2, '0');
};
const hizYaz = n => String(n).replace('.', ',') + '×';

export function sesCalarKur({ onDegis = () => {} } = {}) {
  const ses = new Audio();
  ses.preload = 'none';
  let madde = null;       // {kisim, no, baslik, kisimAdi, ses}
  let parca = 0;          // etkin parçanın sırası
  let bekleyenKonum = null;
  let sonKayit = 0;
  let acik = false;
  let surukleniyor = false;
  let hata = false;

  const dgCal = h('button.ses-dugme.ses-cal', { type: 'button', 'aria-label': 'Çalın', title: 'Çalın / duraklatın (boşluk)' }, simge(YOL.cal));
  const dgGeri = h('button.ses-dugme', { type: 'button', 'aria-label': '15 saniye geri', title: '15 saniye geri' }, simge(YOL.geri), h('span', '15'));
  const dgIleri = h('button.ses-dugme', { type: 'button', 'aria-label': '15 saniye ileri', title: '15 saniye ileri' }, simge(YOL.ileri), h('span', '15'));
  const konum = h('input.ses-konum', { type: 'range', min: '0', max: '100', step: '0.1', value: '0', 'aria-label': 'Konum' });
  const gecen = h('span.ses-sure', '0:00');
  const toplam = h('span.ses-sure', '0:00');
  const parcaYazi = h('span.ses-parca');
  const dgHiz = h('button.ses-hiz', { type: 'button', 'aria-label': 'Okuma hızı', title: 'Okuma hızı' });
  const dgKapat = h('button.ses-dugme', { type: 'button', 'aria-label': 'Çaları kapatın', title: 'Kapatın' }, simge(YOL.kapat));
  const baslik = h('span.ses-baslik');
  const ileti = h('p.ses-ileti', { role: 'status', hidden: true });

  const serit = h('section.ses-serit.baskida-yok', { 'aria-label': 'Sesli okuma', hidden: true },
    h('.ses-ic',
      h('.ses-dugmeler', dgGeri, dgCal, dgIleri),
      h('.ses-orta',
        h('.ses-ust', baslik, parcaYazi),
        h('.ses-cizgi', gecen, konum, toplam),
        ileti),
      h('.ses-sag', dgHiz, dgKapat)));
  document.body.appendChild(serit);

  function hizGoster() {
    const n = kullanici.sesHizi.al();
    dgHiz.textContent = hizYaz(n);
    ses.playbackRate = n;
    ses.defaultPlaybackRate = n;
  }
  hizGoster();

  const parcalar = () => (madde && madde.ses && madde.ses.parcalar) || [];
  const p = () => parcalar()[parca] || null;
  const basSn = () => (p() && p().bas) || 0;
  const sonSn = () => {
    const x = p();
    if (x && x.son !== null && x.son !== undefined) return x.son;
    return Number.isFinite(ses.duration) ? ses.duration : NaN;
  };

  function iletiYaz(metin, yeniden = false) {
    ileti.replaceChildren();
    if (!metin) { ileti.hidden = true; return; }
    ileti.append(metin);
    if (yeniden) ileti.append(' ', h('button.bag', { type: 'button', onclick: yenidenDene }, 'Yeniden deneyin'));
    ileti.hidden = false;
  }

  function dugmeGuncelle() {
    const caliyor = !ses.paused && !ses.ended;
    dgCal.replaceChildren(simge(caliyor ? YOL.dur : YOL.cal));
    dgCal.setAttribute('aria-label', caliyor ? 'Duraklatın' : 'Çalın');
    serit.classList.toggle('caliyor', caliyor);
    const n = parcalar().length;
    parcaYazi.textContent = n > 1 ? `Parça ${parca + 1}/${n}` : '';
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = caliyor ? 'playing' : 'paused';
    onDegis({ acik, caliyor });
  }

  function konumGoster() {
    if (surukleniyor) return;
    const b = basSn(), s = sonSn();
    const t = Math.max(0, ses.currentTime - b);
    const uzun = Number.isFinite(s) ? Math.max(0, s - b) : NaN;
    gecen.textContent = sureYaz(t);
    toplam.textContent = Number.isFinite(uzun) ? sureYaz(uzun) : '–:––';
    konum.value = Number.isFinite(uzun) && uzun > 0 ? String(Math.min(100, (t / uzun) * 100)) : '0';
    konum.style.setProperty('--dolu', konum.value + '%');
  }

  function konumKaydet(zorla = false) {
    if (!madde || !Number.isFinite(ses.currentTime)) return;
    const simdi = Date.now();
    if (!zorla && simdi - sonKayit < 5000) return;
    sonKayit = simdi;
    kullanici.sesKonumu.yaz({ kisim: madde.kisim, maddeNo: madde.no, pageIdx: parca, time: Math.round(ses.currentTime * 100) / 100 });
  }

  function parcaYukle(i, konumSn = null) {
    const liste = parcalar();
    if (!liste[i]) return false;
    parca = i;
    hata = false;
    iletiYaz('');
    bekleyenKonum = konumSn !== null ? konumSn : (liste[i].bas || 0);
    ses.src = liste[i].adres;
    ses.load();
    hizGoster();
    dugmeGuncelle();
    konumGoster();
    return true;
  }

  async function cal() {
    if (!madde || !parcalar().length) return;
    if (navigator.onLine === false) { iletiYaz('Bağlantı yok; ses şu an yüklenemiyor.', true); return; }
    if (!ses.currentSrc && !ses.src) {
      const kayit = kullanici.sesKonumu.icin(madde.kisim, madde.no);
      if (kayit && parcalar()[kayit.pageIdx] && kayit.time > basSn() + 2) parcaYukle(kayit.pageIdx, kayit.time);
      else parcaYukle(0);
    }
    try {
      await ses.play();
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      if (e && e.name === 'NotAllowedError') { iletiYaz('Tarayıcı sesi başlatmaya izin vermedi; çal düğmesine yeniden basın.'); return; }
      hataGoster();
    }
  }

  function hataGoster() {
    hata = true;
    iletiYaz(navigator.onLine === false ? 'Bağlantı yok; ses yüklenemedi.' : 'Ses kaydı yüklenemedi.', true);
    dugmeGuncelle();
  }

  function yenidenDene() {
    const t = Number.isFinite(ses.currentTime) && ses.currentTime > 0 ? ses.currentTime : null;
    parcaYukle(parca, t);
    cal();
  }

  function atla(fark) {
    if (!Number.isFinite(ses.currentTime)) return;
    const b = basSn(), s = sonSn();
    let t = ses.currentTime + fark;
    if (t < b) t = b;
    if (Number.isFinite(s) && t > s - 0.5) t = Math.max(b, s - 0.5);
    ses.currentTime = t;
    konumGoster();
  }

  function sonrakiParca() {
    if (parca + 1 < parcalar().length) {
      parcaYukle(parca + 1);
      cal();
      return true;
    }
    return false;
  }

  function bitti() {
    ses.pause();
    if (!sonrakiParca()) {
      kullanici.sesKonumu.yaz({ kisim: madde.kisim, maddeNo: madde.no, pageIdx: 0, time: 0 });
      parca = 0;
      bekleyenKonum = null;
      ses.removeAttribute('src');
      try { ses.load(); } catch (e) { /* boş */ }
      iletiYaz('Maddenin sesli okunuşu bitti.');
      dugmeGuncelle();
      konumGoster();
    }
  }

  ses.addEventListener('loadedmetadata', () => {
    if (bekleyenKonum !== null) {
      try { ses.currentTime = bekleyenKonum; } catch (e) { /* bazı tarayıcılar erken atlamaya izin vermez */ }
      bekleyenKonum = null;
    }
    konumGoster();
  });
  ses.addEventListener('timeupdate', () => {
    const x = p();
    if (x && x.son !== null && x.son !== undefined && ses.currentTime >= x.son) { bitti(); return; }
    konumGoster();
    konumKaydet();
  });
  ses.addEventListener('ended', bitti);
  ses.addEventListener('play', dugmeGuncelle);
  ses.addEventListener('pause', () => { dugmeGuncelle(); konumKaydet(true); });
  ses.addEventListener('waiting', () => serit.classList.add('bekliyor'));
  ses.addEventListener('playing', () => { serit.classList.remove('bekliyor'); iletiYaz(''); });
  ses.addEventListener('error', () => {
    if (!ses.getAttribute('src')) return;     // kaynağı biz boşalttık
    serit.classList.remove('bekliyor');
    hataGoster();
  });

  dgCal.addEventListener('click', () => { if (ses.paused || ses.ended || hata) { hata ? yenidenDene() : cal(); } else ses.pause(); });
  dgGeri.addEventListener('click', () => atla(-15));
  dgIleri.addEventListener('click', () => atla(15));
  dgHiz.addEventListener('click', () => { kullanici.sesHizi.sonraki(); hizGoster(); });
  dgKapat.addEventListener('click', () => kapat(true));
  konum.addEventListener('input', () => {
    surukleniyor = true;
    const b = basSn(), s = sonSn();
    konum.style.setProperty('--dolu', konum.value + '%');
    if (Number.isFinite(s)) gecen.textContent = sureYaz((s - b) * konum.value / 100);
  });
  konum.addEventListener('change', () => {
    surukleniyor = false;
    const b = basSn(), s = sonSn();
    if (Number.isFinite(s)) ses.currentTime = b + (s - b) * konum.value / 100;
    konumGoster();
  });

  function oturum() {
    if (!('mediaSession' in navigator) || !madde) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: madde.baslik, artist: 'Se’âdet-i Ebediyye', album: madde.kisimAdi || '' });
      const eylem = (ad, fn) => { try { navigator.mediaSession.setActionHandler(ad, fn); } catch (e) { /* desteklenmiyor */ } };
      eylem('play', () => cal());
      eylem('pause', () => ses.pause());
      eylem('seekbackward', () => atla(-15));
      eylem('seekforward', () => atla(15));
      eylem('previoustrack', parca > 0 ? () => { parcaYukle(parca - 1); cal(); } : null);
      eylem('nexttrack', () => sonrakiParca());
    } catch (e) { /* MediaMetadata yok */ }
  }

  function kapat(odakGeri = false) {
    konumKaydet(true);
    ses.pause();
    acik = false;
    serit.hidden = true;
    document.documentElement.classList.remove('ses-acik');
    dugmeGuncelle();
    if (odakGeri) onDegis({ acik: false, caliyor: false, kapatildi: true });
  }

  return {
    /** Yeni madde: çalan ses durur, şerit kapanır. Kendiliğinden çalmaz. */
    yukle(yeni) {
      if (madde) { konumKaydet(true); }
      ses.pause();
      ses.removeAttribute('src');
      try { ses.load(); } catch (e) { /* boş */ }
      madde = yeni && yeni.ses && yeni.ses.parcalar && yeni.ses.parcalar.length ? yeni : null;
      parca = 0;
      bekleyenKonum = null;
      hata = false;
      iletiYaz('');
      if (acik) kapat();
      baslik.textContent = madde ? madde.baslik : '';
      gecen.textContent = '0:00'; toplam.textContent = '0:00'; konum.value = '0'; konum.style.setProperty('--dolu', '0%');
      dugmeGuncelle();
    },
    var: () => !!madde,
    acikMi: () => acik,
    caliyorMu: () => !ses.paused && !ses.ended,
    ac() {
      if (!madde) return false;
      acik = true;
      serit.hidden = false;
      document.documentElement.classList.add('ses-acik');
      oturum();
      cal();
      requestAnimationFrame(() => dgCal.focus({ preventScroll: true }));
      return true;
    },
    /** Çalıyorsa duraklatır, değilse çalar (şerit açıksa). */
    degistir() { if (!acik) return this.ac(); if (ses.paused) cal(); else ses.pause(); return true; },
    kapat: () => kapat(false),
    yokEt() {
      konumKaydet(true);
      ses.pause();
      ses.removeAttribute('src');
      serit.remove();
      document.documentElement.classList.remove('ses-acik');
      if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = null; } catch (e) { /* yok */ } }
    }
  };
}
