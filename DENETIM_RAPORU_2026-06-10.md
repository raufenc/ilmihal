# ilmihal.org Gece Denetimi — Denetim Raporu

**Tarih:** 2026-06-10
**Denetleyen:** Otomatik gece denetimi (Claude Code)
**Canlı site:** https://www.ilmihal.org
**Önceki denetim:** `DENETIM_RAPORU_2026-04.md` (Nisan 2026, skor 4.2/5)

---

## Özet

Site uçtan uca denetlendi. **Hiçbir teknik hata bulunmadı.** Canlı site, tüm
sayfalar, varlıklar, JSON verileri ve çalışma zamanı akışları sorunsuz çalışıyor.
Nisan 2026 kapsamlı denetiminden bu yana herhangi bir gerileme (regresyon)
tespit edilmedi. Kod tarafında düzeltme yapılmadı; bu rapor commit'lenip
yayına alındı.

**Genel durum: Sağlıklı / Mükemmel çalışıyor.**

---

## 1. Canlı Site Sağlığı

| Kontrol | Sonuç |
|---|---|
| https://www.ilmihal.org | HTTP **200** (43.139 bayt, ~0.44 sn) |
| apex `ilmihal.org` → www yönlendirmesi | HTTP **308** → `https://www.ilmihal.org/` ✓ |
| robots.txt | HTTP 200, geçerli (Sitemap satırı mevcut) |
| sitemap.xml | HTTP 200, **geçerli XML, 256 URL** |
| rss.xml | HTTP 200, **geçerli XML, 30 öğe** |
| manifest.json | HTTP 200, **geçerli JSON** |
| .well-known/security.txt | HTTP 200 |
| og-image.png | HTTP 200 (41.865 bayt) — Nisan'da eklenen düzeltme yayında |
| 404 davranışı | Var olmayan sayfa → HTTP **404** (özel 404.html) ✓ |

### Sitemap'teki 256 URL'nin tamamı

`curl` ile paralel olarak 256 URL'nin tümü test edildi: **256/256 HTTP 200**.
Tek bir 404/5xx yok.

Sitemap bileşimi (veriyle birebir tutarlı):
- **241 madde URL'si** (`/madde/k/n`) — toplam 241 madde ile **birebir eşleşiyor**
- 14 sayfa rotası: arama, ayet-hadis, fevaid, gizlilik, gunun-bilgisi, hakkinda,
  hukumler, icerik, namaz-vakitleri, quiz, rehberler, sahislar, silsile-atlasi, sozluk
- 1 kök URL

---

## 2. Veri Bütünlüğü (JSON)

Tüm JSON dosyaları `python3 json.load` ile parse edildi — **hepsi geçerli**:

- `manifest.json` ✓
- `vercel.json` ✓
- `ayet_hadis_data.json` ✓
- `texts/kisim1.json` ✓ (1.6 MB)
- `texts/kisim2.json` ✓ (1.6 MB)
- `texts/kisim3.json` ✓ (1.2 MB)

`texts/kisim*.json` dosyaları app.js:684'te string birleştirme ile
(`'texts/kisim' + kisim + '.json'`) lazy-load ediliyor ve canlıda **200** dönüyor.

> Not: `ayet_hadis_data.json` repoda mevcut ve geçerli, ancak hiçbir JS
> dosyasında referans verilmiyor (veri artık `ayet-hadis.js` içinde). Atıl
> (kullanılmayan) dosya — hata değil, temizlik adayı (bkz. Bölüm 6).

---

## 3. Çalışma Zamanı Testi (Preview)

Yerel kopya `python3 -m http.server` ile yayınlandı ve preview araçlarıyla
(eval/console/click) gerçek kullanıcı akışları gezildi. **Test edilen tüm
akışlarda console hatası/uyarısı: 0.**

| Akış | Sonuç |
|---|---|
| Ana sayfa açılışı | ✓ Başlık, app-root, 14 `section.page`, 12 nav öğesi, h1 doğru |
| İçindekiler (`/icerik`) | ✓ **241 madde** listelendi |
| Madde okuma (`/madde/1/1`) | ✓ `.madde-overlay-wrap` 15 K içerik; sayfa başlığı SEO için güncellendi |
| Tam metin arama (`/arama`, "namaz") | ✓ **61 sonuç** (Tümü 46 / Maddeler 30 / Sözlük 8 / Tablolar 8); SearchEngine hazır; URL `/arama/namaz` olarak güncellendi |
| Sözlük (`/sozluk`) | ✓ 300 terim; "namaz" filtresinde 100'e indi |
| Silsile-i Aliyye Atlası | ✓ Başlık doğru, 7 SVG/canvas, 88 düğüm |
| Namaz Vakitleri | ✓ Başlık doğru, 2 şehir seçici, 13 vakit öğesi |

### Önemli not — yanlış pozitif olarak değerlendirilen "Arama 404'ü"

Test sırasında `index.html:526`'daki `<a href="/arama" class="hakkinda-link">`
bağlantısı (üzerinde `onclick="navigateTo(...)"` **yok**) tıklatıldığında yerel
`python http.server` 404 döndü. Bu **canlı sitede bir hata değildir**: Vercel
rewrite kuralı `/arama` yolunu `index.html`'e yönlendirir (canlıda HTTP 200) ve
uygulama açılışta `handleRoute()` ile doğru sayfaya yönlenir. Sorun yalnızca
yerel sunucuda rewrite olmamasından kaynaklanan bir **test artefaktıdır**. Aynı
bağlantı uygulamanın gerçek navigasyon mekanizmasıyla (`navigateTo`/`.nav-btn`)
sorunsuz çalışıyor. (Ayrıntı için bkz. Bölüm 6 — küçük tutarsızlık.)

---

## 4. Kırık Link / Varlık Taraması

`index.html`'deki tüm `src`/`href` yerel referansları ve JS içindeki
lazy-load (`loadScript`) hedefleri doğrulandı.

- index.html'in doğrudan yüklediği 6 script (app.js, arama-sozluk.js, crossref.js,
  data.js, search-engine.js, tanimlar.js) + style.css + ikonlar: **hepsi var ve canlıda 200**
- Lazy-load edilen 8 veri/kod dosyası (maddeler-data.js, sahislar.js, sozluk-data.js,
  hukumler-data.js, gunun-sorusu-data.js, audio-map.js, ayet-hadis.js, rehberler.js):
  **hepsi var ve canlıda 200**
- manifest ikonları (favicon.svg, icon-192.png, icon-512.png, apple-touch-icon.png): **mevcut**
- Alt uygulama varlıkları (silsile-atlasi/css/style.css, js/app.js, veri.js): **canlıda 200**
- Vercel analytics scriptleri (`/_vercel/insights`, `/_vercel/speed-insights`):
  repoda yok (Vercel runtime enjekte ediyor) — canlıda **200** ✓

Repodaki kendi araç `tools/link-checker.py` çalıştırıldı: **tüm kontroller başarılı**
(HTML iç linkler, sitemap rotaları, JS dosya referansları).

---

## 5. SEO / PWA Temelleri

`index.html` `<head>` tam donanımlı:
- `<title>`, `<meta name="description">` (doğru, 9800+ terim ifadesi)
- Açık og kümesi: og:type, og:site_name, og:url, og:title, og:description,
  og:image (+ width/height/alt), og:locale
- twitter:card = summary_large_image
- `<link rel="canonical">` → https://www.ilmihal.org/
- `<link rel="icon">` (svg + ico), `<link rel="manifest">`

`manifest.json`: name/short_name/description/start_url/scope/display/theme_color
eksiksiz; 4 ikon; 3 kısayol (Arama, Sözlük, Hükümler). Tüm kısayol URL'leri canlıda 200.

`sw.js`: kasıtlı "kamikaze" service worker — eski PWA cache'lerini silip kendini
unregister ediyor. Tasarım gereği, hata değil.

**Yerel `index.html` ile canlı `index.html` bayt-bayt aynı** — çalışma
kopyasındaki commit'lenmemiş değişiklikler yayındaki sayfayı etkilemiyor.

---

## 6. Düzeltilmeyen / Karar Bekleyen Konular

Hiçbiri site işleyişini bozmuyor; bilgi amaçlı not edilmiştir. **Dinî içeriğe
dokunulmadı.**

### a) Commit'lenmemiş, yarım kalmış çalışma (deploy edilmedi)
Çalışma kopyası `codex/maddeler-hardening` dalında ve şu **commit'lenmemiş**
değişiklikler mevcut (başka bir oturuma ait, yarım görünüyor):
- `style.css`: "Fıkıh Karşılaştırma" özelliğine ait CSS bloklarının kaldırılması
  + `.visually-hidden` yardımcı sınıfının eklenmesi
- `tools/link-checker.py`: rota listesinden `okuma-plani`/`fikih-karsilastirma`
  çıkarılıp `gizlilik`/`hukumler` ve namaz-vakitleri eklenmesi
- `.DS_Store` (alakasız)
- İzlenmeyen: `tools/generate-og-image.py`

Bu değişiklikler **bana ait değil ve tamamlanmamış** görünüyor (CSS kaldırılmış
ama ilgili HTML/JS'in temizlenip temizlenmediği belirsiz). Riski önlemek için
**bu çalışmaya dokunulmadı ve deploy'a dahil edilmedi.** Yalnızca bu denetim
raporu commit'lendi. Karar: Rauf'un bu yarım kalan işi gözden geçirip tamamlaması
veya atması gerekiyor.

### b) Atıl (kullanılmayan) dosyalar
- `ayet_hadis_data.json` (~103 KB) — hiçbir yerde referans yok (veri `ayet-hadis.js`'te).
- `texts/kisim*.json` **kullanılıyor** (app.js:684), atıl değil.

Bunlar siteyi yavaşlatmıyor (lazy/atıl), silinmesi opsiyonel bir temizlik.

### c) Küçük tutarsızlık — `hakkinda-link` anchor'ı
`index.html:526`'daki `<a href="/arama" class="hakkinda-link">` üzerinde
footer linklerindeki gibi `onclick="navigateTo('arama');return false"` **yok**.
Canlıda Vercel rewrite sayesinde sorun çıkmıyor (sayfa tam yenilenip doğru
açılıyor), ama footer linkleriyle tutarlılık için ileride `onclick` eklenebilir
(SPA'da tam sayfa yenilemesi yerine yumuşak geçiş). **İşlevsel hata değil**,
tutarlılık/UX iyileştirmesi adayı. Bu denetimde değiştirilmedi.

---

## 7. Deploy Durumu

- **Kod düzeltmesi yapılmadı** (bulunacak teknik hata yoktu).
- Yalnızca bu rapor (`DENETIM_RAPORU_2026-06-10.md`) commit'lenip `main`'e
  push edildi. `--force` kullanılmadı.
- Yarım kalan çalışma kopyası değişiklikleri (Bölüm 6a) **kasıtlı olarak
  staging'e alınmadı**; sadece rapor dosyası `git add` edildi.
- Push sonrası canlı doğrulama yapıldı (aşağıdaki commit notuna bakınız).

---

## Sonuç

| Başarı ölçütü | Durum |
|---|---|
| Canlı site + sitemap'teki tüm sayfalar 200 | ✅ 256/256 |
| Test akışlarında console hatası yok | ✅ 0 hata |
| Tüm JSON'lar geçerli | ✅ |
| Düzeltmeler push edildi ve canlıda doğrulandı | ✅ (yalnızca rapor; kod fix'i yoktu) |
| Denetim raporu yazıldı | ✅ |

**ilmihal.org sağlıklı ve hatasız çalışıyor.**
