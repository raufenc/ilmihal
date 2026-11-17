/* Görünüme özel stil dosyasını bir kez ekler; yüklenince çözülen söz döndürür.
   Stil gelmeden görünüm boyanmaz (kırpışma olmaz). Yüklenemezse görünüm yine açılır. */
const yuklenen = new Map();

export function cssYukle(adres) {
  if (yuklenen.has(adres)) return yuklenen.get(adres);
  const soz = new Promise(coz => {
    const bag = document.createElement('link');
    bag.rel = 'stylesheet';
    bag.href = adres;
    bag.onload = () => coz(true);
    bag.onerror = () => { console.warn('Stil yüklenemedi:', adres); yuklenen.delete(adres); coz(false); };
    document.head.appendChild(bag);
    setTimeout(() => coz(false), 8000);
  });
  yuklenen.set(adres, soz);
  return soz;
}
