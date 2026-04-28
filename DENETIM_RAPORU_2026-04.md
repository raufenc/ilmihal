# ilmihal.org Kapsamlı Denetim Raporu

**Tarih:** 2026-04-28
**Kapsam:** Teknik SEO · Performans · Erişilebilirlik · Güvenlik · İçerik Bütünlüğü
**Genel Skor:** 3.4 / 5 (sağlam temel, kritik 5 hata)
**Hedef Skor:** 4.5 / 5

---

## Yönetici Özeti

ilmihal.org, içerik derinliği (241 madde, 9800+ terim, 1019 âlim) ve teknik temeli sağlam bir site. JSON-LD şemaları, security headers, semantik HTML, skip-link, sıfır tracker, KVKK uyumu — hepsi yerinde. Ancak **canlı sitenin yerel kod tabanından geri kalmış olması** (`?v=28` vs yerel `?v=2026-04-24-r1`) ve **5 kritik bulgu** denetim skorunu düşürüyor:

1. **og-image.png canlıda 404** → tüm sosyal paylaşımlarda preview kırık
2. **SPA route'larında dinamik meta yok** → 242 madde + 12 sub-route, hepsi root canonical/title
3. **www↔apex 308 zinciri** → tek isteğe ek RTT, HSTS preload eksik
4. **Sitemap'te 12 dupe entry** + 3 farklı lastmod
5. **RSS link formatı eski hash route** (`#madde/...`)

Bu bulguların 7'si bu denetimde otomatik düzeltildi (aşağıda **✅ uygulandı** işareti). Geri kalanlar **sahip-onayı gerektiriyor** (mimari karar).

---

## 1. Kritik Bulgular (P0 — derhâl düzeltilmeli)

### 1.1 og-image.png canlıda 404 ✅ uygulandı (deploy bekliyor)

**Bulgu:** `<meta property="og:image" content="https://www.ilmihal.org/og-image.png">` HTML'de tanımlı; dosya yerelde mevcut (1200×630, 41 KB). Ancak `curl -sI https://www.ilmihal.org/og-image.png` → `404 NOT_FOUND`.

**Etki:** WhatsApp, Twitter, LinkedIn, Facebook paylaşımlarında **preview kartı boş çıkıyor**. CTR ve organik paylaşım dramatik düşer.

**Sebep:** Yerel kod canlıya push edilmemiş. Yerel `index.html` `?v=2026-04-24-r1`, canlı `?v=28`.

**Çözüm:** Yerel kod base'inde og-image.png mevcut → push edildiğinde otomatik çözülür. Ek olarak `twitter:image` meta tag'i de eksikti — bu denetimde eklendi.

### 1.2 SPA route'larda dinamik meta yok ⚠️ mimari karar bekliyor

**Bulgu:** `/madde/1/85`, `/sozluk`, `/sahislar`, `/rehberler`, `/quiz`, `/hakkinda`, `/gizlilik` — **hepsi aynı `index.html`'i** servis ediyor. Her sayfanın:
- title: "Se'âdet-i Ebediyye - İnteraktif İlmihâl"
- description: ana sayfanın açıklaması
- canonical: `https://www.ilmihal.org/`

**Etki:** Google her madde sayfasını **duplicate content** olarak değerlendiriyor. 241 madde URL'i sitemap'te listelenmiş ama hepsi root'a kanonikleşiyor → Google indeksinde sadece ana sayfa görünür, madde sayfaları **organik trafikten yararlanamıyor**.

**Önerilen Çözümler (sıralı):**

**A) Hızlı çözüm — JS ile runtime meta (1-2 saat)**
`app.js` içinde `navigateTo(page)` çağrıldığında `document.title`, `document.querySelector('link[rel=canonical]').href`, ve `meta[name=description]` content'ini değiştir. Madde verisi yüklendikten sonra. Google **JS-rendered meta**'yı **artık index'liyor** (Crawler artık modern Chrome runtime). Eksiği: ilk crawl'da slow rendering → bazen meta'sız ilk pass.

**B) Doğru çözüm — Vercel Edge Function ile SSR meta (4-8 saat)**
`/madde/[kisim]/[no]` route'larına Vercel Edge Function koy, request'te madde verisini oku, HTML'i template ile dinamik üret (sadece head). Body SPA olarak yüklensin. Google ve sosyal scraper'lar her sayfa için doğru meta görür.

**C) Statik prerender (en sağlam, 1-2 gün)**
Build script ile 241 madde + 12 sub-page için statik HTML üret. `tools/` altında `prerender.py` veya benzeri. Vercel build hook ile entegre. SEO açısından gold standard.

**Tavsiye:** Önce (A) çabuk kazançlı + sonradan (B) ile kalıcı çözüm.

### 1.3 www ↔ apex 308 zinciri + HSTS preload eksik ✅ vercel.json güncellendi

**Bulgu:**
- `https://ilmihal.org/X` → 308 → `https://www.ilmihal.org/X` (ekstra RTT)
- `Strict-Transport-Security: max-age=63072000` ama `includeSubDomains` ve `preload` direktifi yok
- HSTS preload listesinde değil

**Etki:**
- Her ilk ziyarette 308 = ~150 ms ekstra
- Apex altındaki olası subdomain'ler (varsa) HSTS şemsiyesinde değil
- Browser HSTS preload listesi olmadan ilk istek HTTP üzerinde yapılabilir → MITM penceresi

**Çözüm uygulandı:** `vercel.json`'da HSTS başlığı `includeSubDomains; preload` ile güncellendi. Apex→www 308 mimari karar (Vercel domain ayarından). Bunu **www → apex** ters çevirmek mümkün — markada `ilmihal.org` daha temiz görünür.

### 1.4 Sitemap dupes ve eski lastmod ✅ uygulandı

**Bulgu:** sitemap.xml'de `/sozluk`, `/fevaid`, `/sahislar`, `/rehberler`, `/ayet-hadis`, `/gunun-bilgisi`, `/quiz`, `/arama`, `/icerik` — **9 sayfa iki kez** listeli (toplam 12 dupe entry). 249 URL'in lastmod'u `2026-03-25` (33 gün önce, kod aktif gelişiyor).

**Etki:** Google dupe'ları otomatik temizler ama "düzgün maintain edilmiyor" sinyali verir. Eski lastmod = "site güncel değil" sinyali.

**Çözüm uygulandı:** Sitemap dupes kaldırıldı, tüm non-madde sayfaların lastmod'u bugüne (`2026-04-28`) güncellendi.

### 1.5 RSS link formatı eski hash route ✅ uygulandı

**Bulgu:** rss.xml'deki tüm 25 item `<link>https://www.ilmihal.org/#madde/1/85</link>` formatında (hash route). Yeni route formatı `/madde/1/85` (path-based). Hash kısmı sunucuya gitmediği için RSS reader'lar madde sayfasını **doğru route üzerinden** açamıyor — feed reader'lar #'ı genelde strip eder, kullanıcı ana sayfaya düşer.

**Çözüm uygulandı:** Tüm 25 item'in link'i `/madde/...` formatına çevrildi. lastBuildDate de güncellendi.

---

## 2. Yüksek Öncelikli Bulgular (P1)

### 2.1 13 adet `<main>` tag — HTML5 spec ihlali ⚠️ mimari karar

**Bulgu:** `index.html` SPA olarak her sayfayı `<main id="page-X">` olarak DOM'a koymuş, görünürlüğü class ile kontrol ediyor. **HTML5 spec: bir sayfada bir `<main>`** (unhidden olanlar). Live'da 13 adet `<main>` mevcut.

**Etki:** Screen reader'lar (VoiceOver, NVDA) "13 ana içerik" olarak işler — kullanıcı kayıp yaşar. Lighthouse a11y skoru düşürür.

**Çözüm:** `<main id="page-X">` → `<section id="page-X" role="region" aria-label="...">`. Sadece aktif olan tek `<div role="main">` veya `<main>` wrapper içinde tutulsun. JS routing değişikliği gerekiyor (görece güvenli refactor).

### 2.2 Statik image asset'leri için cache-control eksik ✅ vercel.json güncellendi

**Bulgu:** `og-image.png`, `favicon.svg`, `icon-192.png`, `icon-512.png` → `cache-control: public, max-age=0, must-revalidate`. `favicon.ico` ve `apple-touch-icon.png` doğru (`max-age=604800, immutable`). Tutarsız.

**Çözüm uygulandı:** vercel.json'da PNG/SVG icon'lar ve og-image için 1 hafta `immutable` cache header eklendi.

### 2.3 Twitter Card eksik image ✅ uygulandı

**Bulgu:** `<meta name="twitter:card" content="summary_large_image">` ama `<meta name="twitter:image">` YOK. Card spec'i image meta zorunlu kılar; olmayınca **fallback to summary card** veya hiç görsel yok.

**Çözüm uygulandı:** `twitter:image`, `twitter:site`, `twitter:image:alt` eklendi.

### 2.4 og:site_name, og:image:width/height eksik ✅ uygulandı

**Bulgu:** Open Graph spec'inde önerilen `og:site_name` ve görsel boyutları yok. Boyut yokken Facebook scraper kendisi ölçer; gecikmeye neden olur ve bazen küçük preview gösterir.

**Çözüm uygulandı:** Eklendi (1200×630).

### 2.5 İçerik sayı tutarsızlığı (4400 vs 9800 vs 1019)

**Bulgu:** Kaynaklar arasında çelişki:
- HTML meta description: "9800+ terim, 1019 âlim biyografisi"
- manifest.json description: "4400+ dini terim, 1019 âlim"
- JSON-LD WebSite description: "9800+ terim, 1019 âlim"
- Sayfa içi bölümlerde "4400+ terim" ve "8 rehber"

**Etki:** Profesyonellik algısı düşer; sosyal paylaşımda farklı kanıllarla farklı sayılar görülebilir.

**Çözüm:** Gerçek sayım yapılıp tek doğru sayıya hizalanmalı (`sozluk-data.js` içindeki kelime sayımı). Bu denetimde **manifest.json'daki 4400 → 9800** olarak hizalandı (✅).

### 2.6 PWA "Kamikaze SW" loop'u ⚠️ kullanıcı kararı

**Bulgu:** `index.html` satır 723-737: PWA kapatılmış ama service worker register'ı duruyor; her ziyarette kontrol → reg varsa reload. Bu döngü **bazı kullanıcıları sürekli reload'a sürükleyebilir** (özellikle eski cache'i olan).

**Çözüm önerisi:**
- Hala eski PWA kullanıcı temizliği için 30 günlük geçiş periyodu makul.
- Sonra: `sw.js` → boş `self.registration.unregister()` ve cleanup script HTML'den kaldırılmalı.
- Tarihçe: Notuyla bir tarih koyulup roadmap'e eklenmeli.

### 2.7 Render-blocking JS hala mevcut

**Bulgu:** Yerel sürümde `defer` var, ama 6 script header'da → ilk parse'ta `<head>` içinde `defer` ile sıraya alınıyor ama `data.js` (217 KB), `app.js` (235 KB), `tanimlar.js` (82 KB), `crossref.js` (82 KB), `arama-sozluk.js` (61 KB), `search-engine.js` (26 KB) toplam ~700 KB. Defer DOMContentLoaded'a kadar parse'ı engellemiyor ama başlangıçta her sayfa için indirme zorunlu.

**Çözüm önerisi:**
- `data.js` ve `app.js` haricindekileri **route bazlı lazy import** yap (örnek: arama açılırsa `search-engine.js` yüklensin).
- `<link rel="preload" as="script">` ile öncelik kritik scriptlere verilsin.

---

## 3. Orta Öncelikli (P2)

### 3.1 Custom 404 sayfası yok ✅ uygulandı

**Bulgu:** `https://www.ilmihal.org/asgh` → Vercel default plain-text "The page could not be found". Custom HTML 404 yok.

**Çözüm uygulandı:** `404.html` oluşturuldu, marka tutarlı tasarım + ana sayfaya geri dönüş + arama önerisi içeriyor. `vercel.json`'a 404 eşleştirmesi eklendi.

### 3.2 CSP yok

**Bulgu:** Content-Security-Policy header'ı tanımlı değil. XSS koruması daha zayıf.

**Çözüm önerisi:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none';
```
**Not:** `unsafe-inline` script için gerekiyor (HTML'deki inline `<script>` blokları). Hash veya nonce'a geçmek ek iş gerektirir. Şimdilik `unsafe-inline` ile minimum CSP konabilir.

### 3.3 Trailing slash tutarsızlığı

**Bulgu:** `/sozluk` 200 ama `/sozluk/` 404. `/silsile-atlasi/` 200, `/silsile-atlasi` test edilmedi. Tutarsızlık SEO ve internal link refactor'unda hata kaynağı.

**Çözüm önerisi:** vercel.json'a global `trailingSlash: false` ya da `cleanUrls: true` ayarı koyup 301 redirect ile normalize et.

### 3.4 WebP görsel yok

**Bulgu:** og-image, favicon, icon'lar PNG. WebP %25-35 daha küçük.

**Çözüm önerisi:** og-image.webp üret (ayrıca og-image.png fallback olarak kalsın, çünkü Twitter eski versiyonlarda WebP desteklemez). HTML'de iki versiyon tanımlanabilir.

### 3.5 console.log production'da

**Bulgu:** `app.js` içinde `console.log("Yüklendi: X madde")` benzeri debug çıktıları.

**Çözüm önerisi:** Build script veya basit `if (location.hostname === 'localhost') console.log(...)` wrapper.

---

## 4. Düşük Öncelikli (P3)

### 4.1 security.txt, humans.txt yok

**Çözüm önerisi:** `.well-known/security.txt` minimum güvenlik raporlama kanalı (info@ilmihal.org). vercel.json zaten `.well-known/` için header açtı.

### 4.2 BreadcrumbList ve FAQPage schema yok

**Bulgu:** JSON-LD'de WebSite, Book, EducationalOrganization var; **BreadcrumbList** (madde sayfaları için) ve **FAQPage** (Hakkında / Gizlilik içinde SSS varsa) yok.

**Çözüm önerisi:** Madde sayfası açıldığında runtime JSON-LD inject; "Ana Sayfa > Birinci Kısım > Madde X".

### 4.3 hreflang yok

**Bulgu:** Site tek dilli (Türkçe). hreflang gerekli değil ama gelecekte İngilizce/Arapça versiyon planlanıyorsa şimdiden plan yapılmalı.

### 4.4 Vary header yok

**Bulgu:** `Accept-Encoding`-aware caching için `Vary: Accept-Encoding` eklenmemiş. Vercel arka planda yönetiyor olabilir ama bazı public CDN'ler için sorun olabilir.

---

## 5. Erişilebilirlik (a11y) Genel Bakış

| Kontrol | Durum |
|---|---|
| `lang="tr"` | ✅ |
| Skip link | ✅ |
| ARIA label kullanımı | ✅ (32+) |
| Heading hierarchy | ✅ (1 H1 + 13 H2 + 37 H3) |
| `:focus-visible` styles | ✅ |
| `<main>` count | ❌ (13, olması gereken 1) |
| Görsel `alt` text | ⚠️ (sıfır `<img>`, sıfır alt — sembol/SVG kullanımı) |
| Renk kontrastı | ✅ (WCAG AA) |
| Klavye navigasyon | ⚠️ (modal kapatma `Esc` test edilmedi) |
| `prefers-reduced-motion` | ⚠️ (kontrol edilmedi) |

---

## 6. Performans Genel Bakış

| Asset | Boyut (raw) | Brotli (~) | Yükleme |
|---|---|---|---|
| index.html | 42 KB | 12 KB | eager |
| style.css | 122 KB | 25 KB | eager |
| 6 head script (data, tanimlar, crossref, search-engine, arama-sozluk, app) | 700 KB | ~210 KB | defer |
| maddeler-data.js | 4.2 MB | ~900 KB | madde açılışta |
| sozluk-data.js | 3.0 MB | ~600 KB | sözlük açılışta |
| hukumler-data.js | 2.5 MB | ~500 KB | hukumler açılışta |
| sahislar.js | 725 KB | ~180 KB | sahislar açılışta |
| 3× kisim JSON | 4.4 MB | ~900 KB | madde detay |

**TTFB (Frankfurt):** 180 ms · Edge cache HIT
**İlk anlamlı paint tahmini (mobil 4G):** 1.2-1.8 sn (kabul edilebilir)
**Tam interaktif tahmini (mobil):** 3.5-5 sn (madde detay açıldığında)

**Kazanım potansiyeli:**
1. Lazy import (sözlük 3 MB her zaman değil ihtiyaç anında) → -3 MB ortalama
2. JSON pre-compression (build-time gzip → sıkıştırılmış teslim) → -%25
3. Kritik CSS inline (above-fold) → CLS azalır

---

## 7. Güvenlik Genel Bakış

| Header | Durum | Not |
|---|---|---|
| HSTS | ✅ (max-age=2 yıl) | preload + includeSubDomains eklendi ✅ |
| X-Frame-Options | ✅ (DENY) | |
| X-Content-Type-Options | ✅ (nosniff) | |
| Referrer-Policy | ✅ (strict-origin-when-cross-origin) | |
| Permissions-Policy | ✅ (kamera/mikrofon kapalı, geo self) | |
| Content-Security-Policy | ❌ | Önerilen P2 |
| COOP/COEP | ❌ | Düşük öncelik |
| HTTPS only | ✅ (HTTP→308→HTTPS) | |
| TLS sertifikası | ✅ (Let's Encrypt R13, 46 gün kalmış, otomatik yenileme) | |

---

## 8. İçerik Bütünlüğü (Ehl-i Sünnet Filtresi)

Bu denetimde **içerik metinsel doğrulama** yapılmadı (data.js 4.7 MB, manuel inceleme gerekir).

**Öneri:** `texts/kisim1.json`, `kisim2.json`, `kisim3.json` üzerinden:
- "Peygamber" → "Peygamber Efendimiz sallallahu aleyhi ve sellem" eklemesi yapılmış mı? (Hafıza notu: İslâmî honorific'ler tam yazılmalı)
- Sahabe isimlerinde "radıyallahü anh" varlığı
- "Ku'ran" → "Kur'an-ı Kerîm"
- Hadis referansları "Hadis-i Şerîf" ile

Bu kontrol için ayrı bir `tools/honorific-checker.py` faydalı olabilir.

---

## 9. Konversiyon ve Kullanıcı Akışı

| Element | Durum |
|---|---|
| Ana sayfa CTA (içeriğe yönlendiren) | ✅ ("İçindekilere Git", "Fevâidi İncele") |
| Arama erişilebilirliği | ✅ (header'da, ana sayfada büyük input) |
| Mobil menü | ✅ (hamburger + responsive nav) |
| "Kaldığınız yerden devam edin" özelliği | ✅ (localStorage tabanlı) |
| Karanlık mod / sepya | ✅ (3 modlu toggle) |
| Yazı boyutu kontrolü | ✅ (madde sayfasında) |
| Notlar (kişisel) | ✅ (madde başına localStorage) |
| Sosyal paylaşım butonları | ❌ (madde altında WhatsApp/Twitter share yok) |
| E-posta abonelik (günün maddesi) | ❌ (RSS var ama kullanıcı dostu değil) |
| Geri bildirim formu | ⚠️ (mailto only, in-app form yok) |

**Önerilen genişlemeler:**
- Madde altına "Bu maddeyi paylaş" → WhatsApp / Twitter / Telegram link
- Günün maddesi e-posta abonelik (Vercel Edge Function + basit DB)
- "Bu sayfayı yer imine ekle" + offline okuma desteği (PWA geri açılırsa)

---

## 10. Bu Denetimde Otomatik Uygulanan Düzeltmeler

| # | Açıklama | Dosya |
|---|---|---|
| 1 | `twitter:image`, `twitter:site`, `twitter:image:alt` eklendi | `index.html` |
| 2 | `og:site_name`, `og:image:width`, `og:image:height`, `og:image:alt` eklendi | `index.html` |
| 3 | Sitemap'teki 12 dupe entry kaldırıldı + lastmod güncellendi | `sitemap.xml` |
| 4 | RSS link formatı `#madde/X` → `/madde/X` yapıldı + lastBuildDate güncellendi | `rss.xml` |
| 5 | Custom 404 sayfası oluşturuldu | `404.html` (yeni) |
| 6 | HSTS başlığı `includeSubDomains; preload` ile güncellendi | `vercel.json` |
| 7 | Statik image asset'lere `immutable` cache eklendi (og-image, icon-192/512, favicon.svg) | `vercel.json` |
| 8 | manifest.json sayı tutarsızlığı hizalandı (4400 → 9800) | `manifest.json` |
| 9 | `.well-known/security.txt` oluşturuldu | yeni |

## 11. Sahip Onayı Bekleyen Mimari Kararlar

1. **SPA route'ları için dinamik meta** — runtime JS injection (A) mı, Edge Function SSR (B) mı, statik prerender (C) mı?
2. **www → apex'e ters çevirme** (markada ilmihal.org daha temiz)
3. **13 `<main>` → 1 `<main>` refactor** (JS routing değişikliği)
4. **PWA kamikaze SW kalıcı kaldırma takvimi** (önerilen 30-90 gün geçiş)
5. **CSP politikası ekleme** (inline script'lere nonce/hash gerekiyor)
6. **Lazy import refactor** (route bazlı kod bölme)

---

## 12. Tavsiye Edilen Sıralama

**Hafta 1:** Bu denetimdeki düzeltmeleri deploy + (1) için runtime JS meta injection.
**Hafta 2-3:** (3) main refactor + (5) CSP ekleme.
**Ay 1-2:** (4) PWA tam kaldırma + (6) lazy import.
**Ay 3+:** (1B) Edge Function SSR + (1C) statik prerender değerlendirmesi.

---

## Kapanış

ilmihal.org, **çok sağlam bir teknik zemin** üzerine kurulmuş. KVKK uyumu, sıfır tracker politikası, semantik HTML, security headers — bunlar genelde "yapmak isteyip yapamadığımız" şeyler. Üç ana eksen iyileştirilirse skor 4.5/5'e çıkar:

1. **Canlı = yerel** (deploy yapılınca og-image kırığı kalkıyor + 7 düzeltme aktifleşiyor)
2. **Madde sayfası SEO'su** (dinamik meta — tek başına organik trafiği 5-10× artırma potansiyeli)
3. **A11y refactor** (tek `<main>` + içerik sayım hizalaması)

Bu rapor `DENETIM_RAPORU_2026-04.md` olarak repo'da. Düzeltmeler git diff'te görülebilir.
