# Altyapı: önbellek, service worker, yayın

Eski sitenin en büyük derdi önbellekti: sürüm damgası 13 yerde elle eşitleniyor, service worker
eski dosyayı veriyordu. Yenisinde **elle yazılan sürüm yoktur**; adreslerde `?v=` eki yoktur
(ES modüllerinde ek, modül kimliğini böler). Tazelik iki yoldan gelir: HTTP'de kod her seferinde
ETag ile yeniden doğrulanır; service worker'da önbellek adları içerik karmasından türer.

## Önbellek stratejisi

| Adres | HTTP `Cache-Control` (vercel.json) | Service worker (sw.js) | Gerekçe |
|---|---|---|---|
| Belgeler: `/`, SPA yolları, `/index.html`, `/404.html`, `/silsile-atlasi/`, `/namaz-vakitleri/` | `public, max-age=0, must-revalidate` | önce ağ; 3 sn'de gelmezse ya da ağ yoksa önbellekteki kabuk (`/index.html`; ayrı belgeler kendi kopyası) | Yeni yayın anında ulaşır |
| `/sw.js` | `public, max-age=0, must-revalidate` (+ kayıtta `updateViaCache:'none'`) | karışmaz | Güncelleme denetimi hiç bayatlamaz |
| `/js/*`, `/css/*`, `/fonts/*.css`, atlas ve vakit `js/css`, `/vendor/three/*` | `public, max-age=0, must-revalidate` | önce ağ; ağ yoksa ya da 4 sn'de cevap yoksa **bu sürümün** önbelleği | Ekli sürüm yok → uzun önbellek tuzak olur; 304 ucuzdur |
| `/veri/*`, `/veri-arama/*`, `/silsile-atlasi/doku/*` | `public, max-age=300, stale-while-revalidate=3600` (+ `X-Robots-Tag: noindex` veride) | önbellekte varsa o, arkada `no-cache` ile tazelenir; yoksa ağ | Veri yalnız yayında değişir; SW kullanıcısı veri sürümü değişince önbelleği baştan kurar, SW'siz tarayıcıda en çok bir saatlik pencere |
| `/fonts/*.woff2`, `/vendor/pdfjs-<sürüm>/*` | `public, max-age=31536000, immutable` | önce önbellek | Ad, içeriği/sürümü taşır; değişecekse ad değişir |
| `/gorsel/*` | `public, max-age=86400, stale-while-revalidate=604800` | önce önbellek | Aynı adla yenilenebilir → `immutable` YOK; bayat süs görseli zararsızdır, SW sabit karma değişince yeniden indirir |
| simgeler, `og-image.png` / `manifest.json` / `sitemap.xml`, `robots.txt` | 1 hafta / 1 gün / 1 saat | kod gibi | |
| `/kitap/*` (PDF vekili, Range), `/api/*`, `/rss.xml`, `/_vercel/*`, başka alan adları (ses) | işlevin kendisi / Vercel | **hiç karışmaz** | Parçalı okuma ve dış kaynak |

Vercel'de başlık kuralları istek adresine göre eşleşir (yeniden yazmadan önce); bu yüzden SPA
yolları ayrıca sayılmıştır. Kurallar birbirini örtmez (aynı adrese iki farklı değer düşmez).

## Sürüm nasıl üretilir

`node tools/yeni-site/surum-uret.mjs` `sw.js` içindeki TEK üretilmiş bölümü yazar:

```
const SURUM = 'KOD.VERI.SABIT';   // her biri sha256'nın ilk 12 hanesi
const ON_YUKLE = [ … ];           // kurulumda indirilen kabuk
```

- **KOD**: `index.html`, `404.html`, `manifest.json`, `favicon.svg`, `css/**`, `js/**`, `fonts/*.css`, atlas ve vakit sayfaları.
- **VERI**: `veri/surum.json` (veri-uret'in kendi karması) + `veri-arama/**`.
- **SABIT**: `fonts/*.woff2`, `gorsel/**`, `vendor/**`, `silsile-atlasi/doku/**`.

Önbellekler `ilmihal2-kod-<KOD>`, `ilmihal2-veri-<VERI>`, `ilmihal2-sabit-<SABIT>` adını taşır. Bir dosya
değişince `sw.js` baytça değişir → tarayıcı yeni SW'yi kurar → yalnız karması değişen önbellek
yenilenir (yalnız kod değiştiyse okunmuş maddeler önbellekte kalır). Kopya artıkları (`* 2.json`),
`.DS_Store`, `.claude` karmaya girmez. Betik deterministiktir; başka hiçbir yerde sürüm yazılmaz.

**Ön yükleme**: kabuk + `js/ana.js`'ten başlayıp ana sayfa, fihrist, okuyucu, bulunamadı görünümlerinin
(ve okuma planı kutusunun) durağan import ağacı + `cssYukle('/css/…')` çağrıları + `veri/fihrist.json`,
`konular.json`, `surum.json` + 4 yazı tipi. 2026-11-17: 49 dosya, 663,6 KB ham, ≈351 KB sıkıştırılmış.
Okunan her madde ziyaret edildikçe veri önbelleğine girer; çevrimdışıyken de okunur.

## Güncelleme ve eski SW'den geçiş

- Yeni SW `skipWaiting` + `clients.claim` yapar; etkinleşince **geçerli üç ad dışındaki bütün
  önbellekleri** siler (eski sitenin `ilmihal-kabuk-*`, `ilmihal-veri-*` dahil).
- Eski site ziyaretçisinde kayıtlı eski `sw.js` aynı adreste olduğundan tarayıcı ilk gezinmede yenisini
  indirir; eski SW de gezinmeyi önce ağdan yaptığı için ilk açılış zaten yeni sitedir.
- Sayfa **zorla yenilenmez**. Açık bir sekmeye yeni sürüm gelirse `js/cekirdek/sw-kayit.js` sakin bir bant
  gösterir: "Site güncellendi." + "Yenileyin" + kapat. İlk ziyarette ve açılıştan sonraki 15 sn içinde
  (sayfa zaten ağdan yeni geldi) bant çıkmaz. Uzun açık sekme saatte bir ve görünür olunca denetler.
- Hata ayıklama: `import('/js/cekirdek/sw-kayit.js').then(m => m.surum())` → etkin SW'nin sürümü.

## Yayın adımları

```
bash tools/yeni-site/yayin-oncesi.sh
```
Sırayla: `veri-uret` → `arama-uret` → `sitemap-uret` → `rss-uret --sina` → `surum-uret` → JSON ve sözdizimi
denetimi → `veri-sina`, `kullanici-sina` (TZ=Europe/Istanbul), `arama-sina`, `namaz-hesap.test --tarayicisiz`
→ `dene.py duman` (yerel sunucu kapalıysa açar, sonra kapatır). Biri düşerse durur. Üretimden sonra
`veri/` ve `veri-arama/` değişti mi yazar. `surum-uret` hep EN SON üretim adımıdır (önceki adımların
çıktısını karmalar). Sonra commit + push (Vercel kendisi yayınlar).

`.vercelignore`: araçlar, eski site, raporlar, kökteki eski uygulama ve kaynak veri dosyaları, kopya
artıkları. Kalıplar köke `/` ile sabitlenmiştir: kökteki `sahislar.js`, `okuma-plani.js`, `rehberler.js`,
`ayet-hadis.js` adları `js/` altında da var; sabitlenmezse yeni sitenin dosyaları da yayından düşer.

## Acil durum: service worker'ı kaldırmak

1. `sw.js` içinde `const KALDIR = false;` satırını `true` yapın (başka hiçbir şeye dokunmayın).
2. Yayınlayın. Ziyaretçinin tarayıcısı sonraki gezinmede yeni `sw.js`'i alır (HTTP önbelleği atlanır).
3. Yeni SW kurulur, **bütün önbellekleri siler, kaydını kaldırır**, hiçbir isteğe karışmaz; site ağdan çalışır.
4. Sorun giderilince `false` yapıp yeniden yayınlayın; `js/ana.js` SW'yi yeniden kaydeder.

Sınandı (2026-11-17): kaldır sürümüne geçişte önbellek listesi `[]`, kayıt yok, sayfa ağdan açılıyor.
`KALDIR` açıkken `js/ana.js` her açılışta SW'yi yine kaydeder; o da hemen kendini kaldırır (zararsız).

## Sınama

- Duman: `python3 tools/yeni-site/dene.py duman` (`tools/yeni-site/yollar.txt`).
- SW yalnız https ya da localhost'ta çalışır; `js/ana.js` kaydı yalnız https'te yapar (yerel geliştirmede
  veri önbelleği başka ajanların yeniden ürettiği veriyi bayat göstermesin diye). Elle sınamak için:
  `dene.py adim … "js:import('/js/cekirdek/sw-kayit.js').then(m=>m.kaydet({zorla:true}))"`.
- `cevrimdisi:1` sonrası `url:` ile sayfayı yeniden açın; kabuk SW'den gelir.

## Bilinen sınırlar

- **Çevrimdışı madde okuma `js/cekirdek/veri.js`'teki bir değişikliğe bağlıdır**: `tekDeneme` şu an
  `navigator.onLine === false` iken `fetch`'i hiç denemeden "cevrimdisi" hatası atıyor; SW önbellekteki
  parçayı verebilecekken istek gitmiyor. O satır kalkınca (hata sınıflaması zaten `catch`'te) açılmış
  maddeler, ana sayfa ve fihrist çevrimdışı açılır (yamalı kopyayla sınandı).
- Ses (hakikatkitabevi.net) ve kitabın PDF'i çevrimdışı yoktur (dış kaynak, Range).
- Çevrimdışı arama yalnız arama dizini bir kez indirildiyse çalışır (ilk aramada 16 parça önbelleğe girer).
- Açık eski bir sekme yeni yayından sonra henüz yüklemediği bir görünümü isterse yeni kodu alır (modüllerde
  sürüm eki yok); bant bu yüzden "Yenileyin" der. Eski siteden açık kalmış sekmenin tembel yüklediği eski
  dosyalar (`sozluk-data.js` …) artık yayında yok: o sekme yenilenince düzelir.
- Yeni yayının ilk açılışında, yeni SW etkinleşene dek (birkaç saniye) eski SW eski veri önbelleğinden
  verebilir; etkinleşince silinir ve bant çıkar.
- Sondaki eğik çizgi (`/sozluk/` → `/sozluk`) yönlendirmeleri `vercel.json` `redirects`'tedir; yerel
  `sunucu.py` yönlendirme kurallarını taklit etmez (yerelde eğik çizgili adres zaten açılır).
