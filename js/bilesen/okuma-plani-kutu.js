/* Okuma planı (hatim) parçası. Çalışma Alanım'da tam hâliyle, ana sayfada kısa hâliyle kullanılır.
     import { okumaPlaniKutu } from '/js/bilesen/okuma-plani-kutu.js';
     kap.append(okumaPlaniKutu(baglam));                 // tam
     kap.append(okumaPlaniKutu(baglam, { kisa: true }));  // ana sayfa özeti
   - Hemen bir DOM düğümü döndürür; veri gelince kendini doldurur.
   - Kendi stilini yükler (css/okuma-plani.css); aboneliklerini baglam.temizle ile kapatır.
   - Hesap js/cekirdek/okuma-plani.js'tedir (eski okuma-plani.js ile birebir); burada yalnız arayüz var.
   - "Okundu" (madde açıldı) ile "bitirildi" (plan için bitirildi) ayrıdır; burada yalnız "bitirildi" kullanılır. */

import { h, doldur, iskelet } from '../cekirdek/dom.js';
import { cssYukle } from '../cekirdek/css.js';
import { veri } from '../cekirdek/veri.js';
import { kullanici } from '../cekirdek/kullanici.js';
import { okumaPlani, sureYazi, yerelGun } from '../cekirdek/okuma-plani.js';
import { ad, roma, tarih as tarihYaz } from '../cekirdek/bicim.js';
import { sor } from './pencere.js';
import { bildir } from './bildirim.js';

/* ── Türkçe sayı ekleri (241 maddenin 12'si) ── */
const BIRLER = ['', 'i', 'si', 'ü', 'ü', 'i', 'sı', 'si', 'i', 'u'];
const ONLAR = ['', 'u', 'si', 'u', 'ı', 'si', 'ı', 'i', 'i', 'ı'];
/** 3. tekil iyelik eki kesmeyle: 12 → "12’si", 3 → "3’ü", 40 → "40’ı" */
export function iyelik(n) {
  n = Math.abs(Math.round(+n || 0));
  let ek;
  if (n === 0) ek = 'ı';
  else if (n % 10) ek = BIRLER[n % 10];
  else if (n % 100) ek = ONLAR[(n % 100) / 10];
  else if (n % 1000) ek = 'ü';
  else ek = n % 1000000 ? 'i' : 'u';
  return n + '’' + ek;
}
/** "241 maddenin 12’si" · 0 için "241 maddenin hiçbiri" */
export const kacinda = (toplam, n, ad = 'madde') => `${toplam} ${ad}nin ${n ? iyelik(n) : 'hiçbiri'}`;

/* ── Ortak veri: fihrist + okuma planı uzunlukları (bir kez hazırlanır) ── */
let hazirSoz = null;
export function planVerisi(sinyal) {
  if (!hazirSoz) {
    hazirSoz = Promise.all([veri.fihrist(), veri.okumaPlani()]).then(([f, op]) => {
      const maddeler = f.maddeler.map((m, i) => ({
        kisim: m.kisim, no: m.no, baslik: m.baslik, sahife: m.sahife,
        uzunluk: (op.uzunluklar && op.uzunluklar[i]) || m.uzunluk
      }));
      const kunye = new Map(maddeler.map(m => [m.kisim + '/' + m.no, m]));
      return { kitap: f.kitap, kisimlar: f.kisimlar, maddeler, kunye, sureler: op.sureler };
    });
    hazirSoz.catch(() => { hazirSoz = null; });
  }
  if (!sinyal) return hazirSoz;
  return new Promise((coz, red) => {
    const iptal = () => red(Object.assign(new Error('iptal'), { name: 'AbortError', tur: 'iptal' }));
    if (sinyal.aborted) return iptal();
    sinyal.addEventListener('abort', iptal, { once: true });
    hazirSoz.then(coz, red);
  });
}

const yolu = key => '/madde/' + key;
const noYaz = key => { const [k, n] = key.split('/'); return roma(+k) + ' · ' + n; };

/* Harf konumunu (kitabın başından) sahîfeye çevirir: madde içinde sahîfe aralığına oranlanır. */
function harftenSahife(maddeler, harf) {
  let bas = 0;
  for (const m of maddeler) {
    const son = bas + m.uzunluk;
    if (harf <= son) {
      const oran = m.uzunluk ? (harf - bas) / m.uzunluk : 0;
      return Math.round(m.sahife[0] + oran * (m.sahife[1] - m.sahife[0]));
    }
    bas = son;
  }
  const s = maddeler[maddeler.length - 1];
  return s ? s.sahife[1] : 1;
}

const ONAY = {
  sil: 'Okuma planı silinsin mi? Bitirdiğiniz maddeler kayıtlı kalır.',
  yeni: 'Bitirilen maddeler sıfırlanıp yeni bir hatime başlansın mı?'
};

/** Okuma planı kutusu. Döner: DOM düğümü. birincil=false iken "devam" düğmesi birincil (yeşil) çizilmez. */
export function okumaPlaniKutu(baglam, { kisa = false, birincil = true } = {}) {
  const kok = h('section.op' + (kisa ? '.op-kisa' : ''), { 'aria-label': 'Okuma planı', 'aria-busy': 'true' }, iskelet(kisa ? 4 : 6));
  let V = null;                 // planVerisi
  let takvimAcik = false, sureAcik = false;
  let bekleyen = 0;

  const yenile = () => {
    if (bekleyen || !V) return;
    bekleyen = requestAnimationFrame(() => { bekleyen = 0; ciz(); });
  };

  async function yukle() {
    try {
      const [, v] = await Promise.all([cssYukle('/css/okuma-plani.css'), planVerisi(baglam && baglam.sinyal)]);
      V = v;
      kok.removeAttribute('aria-busy');
      ciz();
    } catch (e) {
      if (e && (e.name === 'AbortError' || e.tur === 'iptal')) return;
      kok.removeAttribute('aria-busy');
      doldur(kok, h('p.op-hata', 'Okuma planı yüklenemedi. ',
        h('button.bag', { type: 'button', onclick: () => { doldur(kok, iskelet(4)); yukle(); } }, 'Yeniden deneyin')));
    }
  }

  if (baglam && typeof baglam.temizle === 'function') {
    const birak = [kullanici.izle('hatim', yenile), kullanici.izle('bitirilen', yenile)];
    baglam.temizle(() => { birak.forEach(f => f()); if (bekleyen) cancelAnimationFrame(bekleyen); });
  }
  yukle();

  /* ── Çizim ── */
  function ciz() {
    // Odak, yeniden çizimden sonra aynı denetime döner
    const odak = kok.contains(document.activeElement) ? document.activeElement.dataset.odak : null;
    const d = okumaPlani.durum(V.maddeler);
    doldur(kok, d.aktif ? planli(d) : plansiz(d));
    if (odak) {
      const el = kok.querySelector(`[data-odak="${CSS.escape(odak)}"]`);
      if (el) el.focus({ preventScroll: true });
    }
  }

  function basliklar(ust, kunyeMetni) {
    return h('header.op-bas', h('h2.ust-yazi', ust), kunyeMetni ? h('p.kunye', kunyeMetni) : null);
  }

  /* Plan yok: tek cümle + dört süre */
  function plansiz(d) {
    const secenekler = okumaPlani.sureSecenekleri(V.maddeler);
    const kur = gun => {
      const s = secenekler.find(x => x.gun === gun);
      okumaPlani.planKur(gun, V.maddeler);
      bildir(`Okuma planı kuruldu: ${s.ad === '1 yıl' ? 'bir yılda' : gun + ' günde'} hatim, günde yaklaşık ${sureYazi(s.gunlukDk)}.`);
    };
    const onceki = d.bitenSayi ? h('p.kunye.op-not', `Daha önce bitirdiğiniz ${d.bitenSayi} madde yeni plana sayılır.`) : null;
    const bozuk = d.planBozuk ? h('p.op-not', 'Kayıtlı okuma planınız okunamadı; yeni bir süre seçerek baştan kurabilirsiniz.') : null;
    if (kisa) {
      return [
        basliklar('Okuma planı'),
        h('p.op-cumle', 'Kitabı baştan sona okumak için bir süre seçin; her günün payı maddelerin uzunluğuna göre hesaplanır.'),
        bozuk,
        h('.secim.op-sureler', { role: 'group', 'aria-label': 'Okuma süresi' }, secenekler.map(s =>
          h('button', { type: 'button', dataset: { odak: 'sure-' + s.gun }, onclick: () => kur(s.gun), title: `Günde yaklaşık ${sureYazi(s.gunlukDk)}` },
            s.ad, h('span.op-sure-dk', ' · ' + sureYazi(s.gunlukDk)))))
      ];
    }
    return [
      basliklar('Okuma planı'),
      h('p.op-cumle', 'Kitabı baştan sona okumak için bir süre seçin; her günün payı maddelerin uzunluğuna göre hesaplanır.'),
      bozuk,
      h('ul.op-sureler-liste', { role: 'list' }, secenekler.map(s => h('li',
        h('button.op-sure', { type: 'button', dataset: { odak: 'sure-' + s.gun }, onclick: () => kur(s.gun) },
          h('span.op-sure-ad', h('span', s.ad)),
          h('span.op-sure-dk', 'günde ≈ ' + sureYazi(s.gunlukDk)))))),
      onceki
    ];
  }

  /* Plan var */
  function planli(d) {
    const plan = d.plan;
    const hatimNo = (plan.hatimSayisi || 0) + 1;
    const gunMetni = `${Math.min(d.gunNo, d.gunSayisi)}. gün / ${d.gunSayisi}`;

    if (d.hatimBitti) return hatimTamam(d, hatimNo);

    const ilkAcik = d.bugunkuler.find(x => !x.bitti);
    const devamKey = (ilkAcik && ilkAcik.key) || d.siradaki;
    const devamYazi = d.bitenSayi === 0 ? 'Okumaya başlayın' : 'Kaldığınız yerden devam edin';
    const devam = devamKey ? h('a.dugme' + (birincil ? '.dugme-ana' : ''), { href: yolu(devamKey), dataset: { odak: 'devam' } }, devamYazi) : null;

    const bugun = h('p.op-bugun', d.bugunKalanDk > 0 ? `Bugün ≈ ${sureYazi(d.bugunKalanDk)} okuma kaldı.` : 'Bugünkü kısım tamam.');
    const durumCumle = DURUM_YAZI[d.durumKodu] ? h('p.op-durum', DURUM_YAZI[d.durumKodu](d)) : null;

    if (kisa) {
      const goster = d.bugunkuler.slice(0, 5);
      const kalan = d.bugunkuler.length - goster.length;
      return [
        basliklar('Okuma planı', gunMetni + (hatimNo > 1 ? ` · ${hatimNo}. hatim` : '')),
        bugun,
        payListesi(goster, false),
        kalan > 0 ? h('p.kunye.op-daha', `ve ${kalan} madde daha`) : null,
        h('.sira.op-eylem', devam, h('a.ok-bag', { href: '/calisma-alanim?bolum=plan' }, 'Plan ayrıntıları'))
      ];
    }

    const [by, ba, bg] = plan.baslangic.split('-').map(Number);
    const baslangic = new Date(by, ba - 1, bg);
    return [
      basliklar('Okuma planı', `${plan.gun === 365 ? 'Bir yıllık' : plan.gun + ' günlük'} plan · ${gunMetni}` + (hatimNo > 1 ? ` · ${hatimNo}. hatim` : '') + ` · ${tarihYaz(baslangic, { gun: false })} başladı`),
      bugun,
      d.bugunkuler.length ? h('h3.op-alt-baslik', 'Bugünkü kısım') : null,
      payListesi(d.bugunkuler, true),
      serit(d),
      durumCumle,
      h('.sira.op-eylem', devam),
      araclar(d)
    ];
  }

  function hatimTamam(d, hatimNo) {
    const yeni = async () => {
      okumaPlani.yeniHatim(V.maddeler);
      bildir('Yeni hatim başladı. Allahü teâlâ kolaylık versin.');
    };
    return [
      basliklar('Okuma planı'),
      h('p.op-bugun', 'Elhamdülillah, kitabı baştan sona okudunuz.'),
      h('p.op-durum', `${hatimNo}. hatminiz tamamlandı. Allahü teâlâ okuduklarınızla amel etmeyi nasîb eylesin.`),
      h('.sira.op-eylem',
        h('button.dugme' + (birincil ? '.dugme-ana' : ''), { type: 'button', dataset: { odak: 'yeni-hatim' }, onclick: yeni }, 'Yeni bir hatime başlayın'),
        kisa ? null : h('button.bag', { type: 'button', dataset: { odak: 'birak' }, onclick: planiBirak }, 'Planı bırakın'))
    ];
  }

  /* Bugünün payı: fihrist satırları; tam hâlde her satırda "bitirildi" düğmesi */
  function payListesi(liste, duzenle) {
    if (!liste.length) return null;
    return h('ol.op-pay', liste.map(x => {
      const m = V.kunye.get(x.key);
      const baslik = m ? ad(m.baslik) : x.key;
      const isaret = duzenle
        ? h('button.op-isaret', {
            type: 'button', 'aria-pressed': String(!!x.bitti), dataset: { odak: 'bitir-' + x.key },
            'aria-label': 'Bitirildi: ' + (m ? m.baslik : x.key),
            title: x.bitti ? 'Bitirildi; işareti kaldırmak için basın' : 'Bitirildi olarak işaretleyin',
            onclick: () => bitir(x.key, !x.bitti)
          }, isaretSimge())
        : h('span.op-isaret', { 'aria-hidden': 'true', dataset: { bitti: x.bitti ? '1' : '0' } }, isaretSimge());
      return h('li' + (x.bitti ? '.bitti' : ''),
        isaret,
        h('span.fihrist-no', noYaz(x.key)),
        h('a.op-pay-ad', { href: yolu(x.key) }, h('span', baslik), x.devam ? h('span.op-devami', ' (devamı)') : null),
        m ? h('span.fihrist-sayfa', m.sahife[0] + '') : null,
        x.bitti ? h('span.gizli-yazi', ' (bitirildi)') : null);
    }));
  }

  function bitir(key, bitti) {
    const r = okumaPlani.maddeBitir(key, bitti, V.maddeler);
    if (r.olay === 'hatim-tamam') bildir('Elhamdülillah, kitabı baştan sona okudunuz.', { sure: 6000 });
    else if (r.olay === 'bugunku-pay-tamam') bildir('Bugünkü okumanızı tamamladınız.', { sure: 5000 });
  }

  /* Kitabın 1–1248 sahîfelik şeridi: bitirilen maddeler dolu, bugünkü hedef ince çizgi */
  function serit(d) {
    const S = (V.kitap && V.kitap.sahifeSayisi) || 1248;
    const biten = new Set(kullanici.bitirilen.liste());
    const parcalar = [];
    for (const m of V.maddeler) {
      if (!biten.has(m.kisim + '/' + m.no)) continue;
      const son = parcalar[parcalar.length - 1];
      if (son && m.sahife[0] <= son[1] + 1) son[1] = Math.max(son[1], m.sahife[1]);
      else parcalar.push([m.sahife[0], m.sahife[1]]);
    }
    const hedef = harftenSahife(V.maddeler, d.beklenen);
    const siradaki = d.siradaki ? V.kunye.get(d.siradaki) : null;
    const yer = siradaki ? siradaki.sahife[0] : S;
    const kisimBaslari = V.kisimlar.map(k => {
      const ilk = V.maddeler.find(m => m.kisim === k.no);
      return ilk ? { romen: k.romen || roma(k.no), s: ilk.sahife[0] } : null;
    }).filter(Boolean);
    const yuzde = s => (Math.max(1, Math.min(S, s)) - 1) / (S - 1) * 100;
    const ozet = `${d.bitenSayi ? yer + '. sahîfedesiniz' : 'Henüz başlamadınız'} · ${kacinda(d.maddeSayi, d.bitenSayi)} bitirildi · bugünkü hedef ${hedef}. sahîfe`;
    return h('figure.op-serit',
      h('.op-serit-cizgi', { role: 'img', 'aria-label': `Kitabın ${S} sahîfesi üzerinde ilerleme: ${ozet}` },
        parcalar.map(([a, b]) => h('i.op-dolu', { style: { left: yuzde(a) + '%', width: Math.max(0.25, yuzde(b + 1) - yuzde(a)) + '%' } })),
        h('i.op-hedef', { style: { left: yuzde(hedef) + '%' }, title: `Bugünkü hedef: ${hedef}. sahîfe` }),
        d.bitenSayi ? h('i.op-yer', { style: { left: yuzde(yer) + '%' } }) : null),
      h('.op-serit-olcek', { 'aria-hidden': 'true' },
        h('span', { style: { left: '0%' } }, '1'),
        kisimBaslari.map(k => h('span.op-kisim', { style: { left: yuzde(k.s) + '%' } }, k.romen)),
        h('span', { style: { left: '100%' } }, String(S))),
      h('figcaption.kunye', ozet));
  }

  /* Takvim, süre değiştirme, baştan başlama, bırakma */
  function araclar(d) {
    const sureler = okumaPlani.sureSecenekleri(V.maddeler);
    const takvimDet = h('details.op-acilir', { open: takvimAcik, ontoggle: e => { takvimAcik = e.currentTarget.open; if (takvimAcik && !govde.childElementCount) takvimCiz(govde); } },
      h('summary', { dataset: { odak: 'takvim' } }, `Plan takvimi (${d.gunSayisi} gün)`));
    const govde = h('ol.op-takvim');
    takvimDet.append(govde);
    if (takvimAcik) takvimCiz(govde);

    const sureDet = h('details.op-acilir', { open: sureAcik, ontoggle: e => { sureAcik = e.currentTarget.open; } },
      h('summary', { dataset: { odak: 'sure' } }, 'Süreyi değiştirin'),
      h('p.kunye', 'Yeni plan bugünden başlar; bitirdiğiniz maddeler kayıtlı kalır.'),
      h('.secim', { role: 'group', 'aria-label': 'Yeni süre' }, sureler.map(s =>
        h('button', { type: 'button', 'aria-pressed': String(s.gun === Number(d.gunSayisi)), dataset: { odak: 'degis-' + s.gun },
          onclick: async () => {
            const tamam = await sor(`Okuma planı bugünden başlayarak ${s.ad} üzerine yeniden kurulsun mu? Bitirdiğiniz maddeler kayıtlı kalır.`, { evet: 'Yeniden kurun' });
            if (!tamam) return;
            okumaPlani.planKur(s.gun, V.maddeler);
            bildir(`Okuma planı kuruldu: ${s.ad === '1 yıl' ? 'bir yılda' : s.gun + ' günde'} hatim, günde yaklaşık ${sureYazi(s.gunlukDk)}.`);
          } }, `${s.ad} · ${sureYazi(s.gunlukDk)}`))));

    return h('.op-araclar',
      takvimDet, sureDet,
      h('.sira.op-ikincil',
        h('button.bag', { type: 'button', dataset: { odak: 'yeni-hatim' }, onclick: async () => {
          if (!(await sor(ONAY.yeni, { evet: 'Baştan başlayın' }))) return;
          okumaPlani.yeniHatim(V.maddeler);
          bildir('Yeni hatim başladı. Allahü teâlâ kolaylık versin.');
        } }, 'Baştan başlayın'),
        h('button.bag', { type: 'button', dataset: { odak: 'birak' }, onclick: planiBirak }, 'Planı bırakın')));
  }

  async function planiBirak() {
    if (!(await sor(ONAY.sil, { evet: 'Planı silin' }))) return;
    okumaPlani.planSil();
    bildir('Okuma planı silindi.');
  }

  function takvimCiz(govde) {
    const gunler = okumaPlani.takvim(V.maddeler);
    const bugunGun = yerelGun();
    doldur(govde, gunler.map(g => {
      const [y, a, gn] = g.tarih.split('-').map(Number);
      const ilk = V.kunye.get(g.ilk), son = V.kunye.get(g.son);
      const aralik = g.ilk === g.son ? noYaz(g.ilk) : `${noYaz(g.ilk)} – ${noYaz(g.son)}`;
      return h('li' + (g.bitti ? '.bitti' : '') + (g.bugun ? '.bugun' : ''), g.bugun ? { 'aria-current': 'date' } : null,
        h('span.op-takvim-gun', g.gun + '.'),
        h('span.op-takvim-tarih', tarihYaz(new Date(y, a - 1, gn), { gun: false })),
        h('span.op-takvim-madde',
          h('a', { href: yolu(g.ilk) }, aralik),
          ilk ? h('span.op-takvim-baslik', ' ' + ad(ilk.baslik) + (son && g.son !== g.ilk ? ' …' : '')) : null),
        h('span.op-takvim-durum', g.bitti ? 'bitti' : g.bugun ? 'bugün' : (g.tarih < bugunGun ? 'geride' : '')));
    }));
  }

  return kok;
}

const DURUM_YAZI = {
  geride: d => `Plana göre ≈ ${sureYazi(d.geriDk)} geridesiniz.`,
  onde: d => `Plana göre ≈ ${sureYazi(d.ondeDk)} öndesiniz.`,
  uygun: () => 'Plana uygun gidiyorsunuz.',
  'sure-doldu': () => 'Plan süresi doldu; kalan maddelerle devam edebilirsiniz.'
};

function isaretSimge() {
  return h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'm8 12.4 2.7 2.7L16.2 9.4' }));
}
