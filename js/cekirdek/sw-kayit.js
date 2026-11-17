/* Service worker kaydı ve "Site güncellendi" bandı.
   Çağıran: js/ana.js →  import('./cekirdek/sw-kayit.js').then(m => m.kaydet())
   Belge:   tools/yeni-site/ALTYAPI.md

   - Kayıt yalnız https'te yapılır; sınamada {zorla: true} ile localhost'ta da yapılır.
   - Sayfa hiçbir zaman zorla yenilenmez. Açık bir sekmeye yeni sürüm gelirse sakin bir bant
     çıkar: "Site güncellendi" + "Yenileyin". Karar kullanıcınındır.
   - İlk ziyarette (sayfayı henüz bir service worker yönetmiyorken) bant çıkmaz.
   - Sayfa açılırken gelen güncellemede de çıkmaz: sayfa zaten ağdan, yeni hâliyle yüklenmiştir. */

import { h } from './dom.js';

const ACILIS_PAYI = 15000;          // açılıştan sonraki bu süre içinde gelen güncelleme bant gerektirmez
const DENETIM_ARASI = 60 * 60000;   // uzun açık sekmede saatte bir güncelleme denetimi

let bant = null;

function bantGoster() {
  if (bant || !document.body) return;
  const kapat = () => { bant?.remove(); bant = null; };
  // width: max-content — left:50% ile konumlanan bant aksi hâlde ekranın yarısına sığmaya çalışıp satır kırıyor
  // (kalıcı yeri css/kabuk.css .yeni-surum; oraya taşınmalı)
  bant = h('.yeni-surum.baskida-yok', { role: 'status', 'aria-live': 'polite', style: { width: 'max-content', maxWidth: 'calc(100vw - 2rem)' } },
    h('span', { style: { whiteSpace: 'nowrap' } }, 'Site güncellendi.'),
    h('button', { type: 'button', onclick: () => location.reload() }, 'Yenileyin'),
    h('button', { type: 'button', 'aria-label': 'Bandı kapatın', title: 'Sonra', onclick: kapat,
      style: { background: 'transparent', color: 'inherit', padding: '0 0.5em', fontSize: '1.2em' } }, '×'));
  document.body.appendChild(bant);
}

/** Service worker'ı kaydeder. Dönüş: ServiceWorkerRegistration ya da null. */
export async function kaydet({ zorla = false } = {}) {
  if (!('serviceWorker' in navigator)) return null;
  if (!zorla && location.protocol !== 'https:') return null;

  const yonetiliyordu = !!navigator.serviceWorker.controller;
  const acilis = performance.now();
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yonetiliyordu && performance.now() - acilis > ACILIS_PAYI) bantGoster();
  });

  const kayit = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });

  // Uzun süre açık kalan sekme: görünür olunca ve saatte bir yeni sürüm var mı diye sor.
  let son = Date.now();
  const denetle = () => {
    if (Date.now() - son < 5 * 60000) return;
    son = Date.now();
    kayit.update().catch(() => { /* çevrimdışı: sonra yine denenir */ });
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') denetle(); });
  setInterval(() => { son = 0; denetle(); }, DENETIM_ARASI);

  return kayit;
}

/** Etkin service worker'ın sürümü (sınama ve hata raporu için). Yoksa null. */
export function surum(zamanAsimi = 2000) {
  const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
  if (!sw) return Promise.resolve(null);
  return new Promise(coz => {
    const kanal = new MessageChannel();
    const t = setTimeout(() => coz(null), zamanAsimi);
    kanal.port1.onmessage = e => { clearTimeout(t); coz(e.data || null); };
    sw.postMessage({ tur: 'surum' }, [kanal.port2]);
  });
}
