# ilmihal.org: çalışma zamanı hata envanteri

Tarih: 17 Kasım 2026. Canlı site: https://www.ilmihal.org (SW sürümü `2026-10-19-r5`).
Araç: playwright + Chrome (başsız, `--mute-audio`), 1440×900 masaüstü ve 390×844 telefon (`is_mobile`, `has_touch`).
Hiçbir şey düzeltilmedi; hiçbir form gönderilmedi, paylaşım yapılmadı.

Kanıt klasörü: `tools/yeni-site/hata-kanit/`
- `tarama.py` → `tarama.json`: 47 adres × 2 boyut; konsol, ağ, CSP, süre, taşma, ekran görüntüsü
- `etkilesim.py masa|tel` → `etkilesim_masa.json`, `etkilesim_tel.json`: tema, menü, okuyucu, ses, PDF, test, geri/ileri, çevrimdışı
- `ek_denemeler.py`, `ek_denemeler2.py`, `ek_denemeler3.py`, `ek_denemeler4.py` → aynı adlı `.json`: bulguları doğrulayan hedefli denemeler
- `ekran/`: bütün ekran görüntüleri (`masa_*`, `tel_*` = tarama; `E_*` = etkileşim; `X_*`, `Y_*`, `Z_*` = ek denemeler)

Şiddet ölçeği: **kırık** (işlev hiç çalışmıyor) · **hatalı** (çalışıyor ama yanlış sonuç veriyor) · **kusur** (kullanıcıyı yanıltan ya da eksik davranış) · **kozmetik** (görsel ya da erişilebilirlik ayrıntısı).

Genel tablo: Sayfaların hiçbirinde JS istisnası (`pageerror`) yok, CSP ihlali yok, hiçbir boyutta yatay taşma yok (`scrollWidth == innerWidth`). Konsol hataları yalnızca bulunamayan adreslerde ve `/silsile-atlasi` adresinde çıktı. Ağır hatalar etkileşimlerde.

---

## Kırık

### K1. Telefonda okuma ayarları paneline dokunulamıyor (perde panelin üstünde)
- **Nerede:** herhangi bir madde, ör. `/madde/1/4`; genişlik ≤ 640 px (390×844'te denendi). 641 ve 700 px'te sorun yok.
- **Yeniden üretme:** 1) Telefonda maddeyi açın. 2) Araç çubuğunda “Aa” (Okuma ayarları) düğmesine dokunun. 3) Alttan açılan paneldeki A+, A−, Sık/Normal/Ferah, Sol/İki Yana, Açık/Sepya/Koyu, Lügat çizgileri düğmelerinden birine dokunun.
- **Ne oluyor:** Panel açılıyor ama yarı saydam karartma (`#panel-perde`) panelin de üstünde kalıyor; panel gri görünüyor. Panelin 11 düğmesinin hepsinde, düğmenin ortasındaki öğe `#panel-perde`. Dokunuş perdeye gidiyor (`onclick="okumaPaneliKapat()"`) ve panel kapanıyor. Yazı boyutu 16,8 px'te kalıyor. Telefonda yazı boyutu, satır aralığı, hizalama, okuyucu teması ve lügat çizgileri ayarlanamıyor.
- **Ne olmalıydı:** Panel perdenin üstünde olmalı, düğmeler çalışmalı.
- **Kök neden (kaynaktan):** `style.css` 4863 civarı: `@media (max-width:640px) .okuma-panel { position:fixed; z-index:300 }`. Ama panel araç çubuğunun yığın bağlamı (stacking context) içinde kalıyor. `.panel-perde { position:fixed; z-index:250 }` kök düzeyde olduğu için üstte kalıyor. Perdeyi yalnız ≤640 px'te `okumaPaneliAc` açıyor (`app.js` ~6278).
- **Kanıt:** `ek_denemeler3.json` → `tel_okuma_panel`: 11 düğmenin hepsi `ÖRTÜLÜ: panel-perde`; `tablet_okuma_panel` ve `dar_masa_okuma_panel`: hepsi `TIKLANIR`. `ek_denemeler2.json` → `tel_tap`: “`<div id="panel-perde" class="panel-perde acik"…> intercepts pointer events`”. Ekran: `ekran/Y_tel_okuma_panel.png`, `ekran/E_tel_okuma_ayarlari_hata.png`.
- **Şiddet:** kırık (telefonda).

### K2. `/silsile-atlasi` (sonunda eğik çizgi yok) boş ve bozuk açılıyor
- **Nerede:** `https://www.ilmihal.org/silsile-atlasi`, iki boyutta da.
- **Yeniden üretme:** Adresi sonunda `/` olmadan açın.
- **Ne oluyor:** HTML 200 ile geliyor ama göreli yollar kökten çözülüyor. `veri.js` ve `js/atlas.js` 404 dönüyor. `css/atlas.css` HTML olarak gelip uygulanmıyor. Sayfada biçimsiz koca siyah bir yıldız, çıplak bağlantılar ve düğmeler kalıyor. Konsol: “Refused to execute script from 'https://www.ilmihal.org/veri.js?v=2026-11-17b' because its MIME type ('text/html') is not executable…”, “Refused to apply style from '…/css/atlas.css…'”, iki adet 404.
- **Ne olmalıydı:** Eğik çizgili adrese yönlenmeli (301) ya da varlıklar mutlak yolla yüklenmeli. `/silsile-atlasi/` eğik çizgiyle düzgün açılıyor (konsol temiz, `ekran/Y_silsile_egik.png`). Site içi bağlantılar ve sitemap eğik çizgili adresi kullanıyor; sorun elle yazılan ya da dışarıdan verilen adreste. `/namaz-vakitleri` eğik çizgisiz de sorunsuz.
- **Kanıt:** `tarama.json` → `/silsile-atlasi` (masa ve tel); `ekran/masa_silsile-atlasi.png`, `ekran/tel_silsile-atlasi.png`.
- **Şiddet:** kırık (bu adres için).

---

## Hatalı

### H1. Arama en çok 30 madde gösteriyor; sayaç ve sonuç listesi yanıltıcı
- **Nerede:** `/arama/namaz`, `/arama/abdest`, ana sayfadaki arama kutusunda Enter. İki boyutta da.
- **Yeniden üretme:** `/arama/namaz` adresini açın; “Maddeler” sekmesine bakın; sayfanın sonuna kaydırın.
- **Ne oluyor:** Sekmede “Maddeler (30)” yazıyor. Kitabın metninde “namaz/nemâz” 147 maddede geçiyor (sayfa içinden `texts/kisim*.json` taranarak sayıldı). “Daha fazla” ya da “devamı” düğmesi yok. Kaynakta sınır sabit: `app.js` 3121 `searchEngine.fullSearch(rawQuery, { limit: 30, sideLimit: 8 })`. “nemâz” sorgusunda da 30 çıkıyor, “gusl” (ana sayfa Enter) 30.
- **Ne olmalıydı:** Bütün eşleşmeler (sayfalı) gösterilmeli ya da “ilk 30 / toplam 147” açıkça yazmalı.
- **Kanıt:** `ek_denemeler.json` → `namaz_sekmeler: ['Tümü (48)', 'Maddeler (30)', …]`, `namaz_madde_gecen: 147`, `namaz_dahafazla: []`; `ekran/X_arama_namaz_alt.png`.
- **Şiddet:** hatalı.

### H2. Metin içindeki “[Madde 54’e bakınız!]” atfı bağlantıya dönüşmüyor
- **Nerede:** `/madde/1/66`. Bu, kitap metnindeki tek “Madde NN’e bakınız” atfı.
- **Yeniden üretme:** Maddeyi açın, sonuna kadar kaydırın, “[Madde 54’e bakınız!]” yazısına bakın.
- **Ne oluyor:** `#madde-detay .crossref-link` sayısı 0. “Madde” kelimesi ile “ 54’e bakınız!]” ayrı metin düğümlerinde duruyor (önceki kardeş düğüm “Madde”; muhtemelen lügat ya da sahîfe işaretlemesi böldü). `aktivCrossLinks` (`app.js` 5874) tek bir metin düğümünde `Madde (\d{1,3})(?=[’']?[ea] bak)` deseni aradığı için eşleşme bulamıyor.
- **Ne olmalıydı:** “Madde 54” tıklanınca 1/54 açılmalı.
- **Kanıt:** `ek_denemeler2.json` → `xref: {bul:[{txt:" 54’e bakınız!]", parent:"P.", prev:"Madde"}], link:0}`. Ayrıca `ek_denemeler.json` → `xref_adet: 0`.
- **Şiddet:** hatalı. Tek bir yerde ama özellik bütünüyle ölü.

### H3. Klavye kısayolları J / K / + / − çalışmıyor (yardım penceresi bunları vaat ediyor)
- **Nerede:** masaüstünde herhangi bir madde, ör. `/madde/1/20`.
- **Yeniden üretme:** Maddeyi açın; `j` tuşuna, sonra `k` tuşuna basın; `?` ile kısayol penceresine bakın.
- **Ne oluyor:** Adres `/madde/1/20` olarak kalıyor, madde değişmiyor. Kısayol penceresi “J Sonraki Madde, K Önceki Madde, + Yazıyı Büyüt, - Yazıyı Küçült” diyor. Kaynakta `sonrakiMadde`, `oncekiMadde`, `artirFont` ve `azaltFont` hiç tanımlı değil; asıl işlevler `navMadde(±1)` ve `adjustFontSize(±1)` (`app.js` 5724–5727, `typeof … === 'function'` koruması yüzünden hata da vermiyor). `?`, `Esc` ve `t` çalışıyor.
- **Kanıt:** `etkilesim_masa.json` → `klavye: {j:"/madde/1/20", k:"/madde/1/20", esc:["/icerik",…,"none"], "?":"flex"}`; `grep -n "function sonrakiMadde" app.js` boş dönüyor.
- **Şiddet:** hatalı.

### H4. Var olmayan madde adresi yumuşak 404 veriyor; okuyucu yarım açılıyor
- **Nerede:** `/madde/1/999`, `/madde/9/1`; iki boyutta da.
- **Yeniden üretme:** Adresi açın; “Sonraki madde”, yer imi ve ses düğmelerine basın.
- **Ne oluyor:** HTTP 200. Okuyucu katmanı açık; ortada “Madde bulunamadı / Kapat” yazıyor. Altında “Notlarım” kutusu ve içi boş “← Önceki madde / Sonraki madde →” kartları duruyor. Araç çubuğu (ses, PDF, yer imi, paylaş) etkin. Sekme başlığı “İçindekiler - …”. “Sonraki madde”ye basınca bir şey olmuyor. Ses düğmesi boş bir çalar çubuğu açıyor (`src:""`, etiket boş). Yer imi bir şey kaydetmiyor. `/madde/9/1` ayrıca `texts/kisim9.json` için 404 ve konsol hatası “Kısım 9 metinleri yüklenemedi: Error: HTTP 404” üretiyor.
- **Ne olmalıydı:** Gerçek 404 (ya da açık bir “bulunamadı” sayfası), araç çubuğu ve gezinme kartları olmadan.
- **Kanıt:** `tarama.json` (`/madde/9/1` konsol ve http alanları); `ek_denemeler.json` → `yok_madde`, `yok_madde_sonraki`, `yok_madde_ses`; `ekran/masa_madde_1_999.png`, `ekran/tel_madde_1_999.png`, `ekran/X_yok_madde_ses.png`.
- **Şiddet:** hatalı.

### H5. `/hukumler/<geçersiz>` adresi tür olarak kabul ediliyor
- **Nerede:** `/hukumler/yoktur`; iki boyutta da.
- **Ne oluyor:** Hiçbir sekme seçili değil; sayaç “0 açık yoktur hükmü”, altında “Sonuç bulunamadı.” yazıyor. Geçerli türler `all, farz, vacib, sunnet, mustehab, mubah, mekruh, haram`.
- **Ne olmalıydı:** Bilinmeyen türde “Tümü”ye düşmeli ya da 404 vermeli.
- **Kanıt:** `ekran/masa_hukumler_yoktur.png`, `ekran/tel_hukumler_yoktur.png`.
- **Şiddet:** hatalı.

---

## Kusur

### U1. Okuyucu Esc ya da × ile kapanınca sekme başlığı eski maddede kalıyor
- **Nerede:** `/madde/2/5` → `Esc` (masaüstü). `/madde/1/6` ve `/madde/1/20` kapanışlarında da aynı.
- **Ne oluyor:** Adres `/icerik` oluyor, İçindekiler görünüyor ama `document.title` “Tefsîr, hadîs ne demekdir? … - Se'âdet-i Ebediyye” olarak kalıyor. Tarayıcıda geri basınca madde doğru açılıyor.
- **Kanıt:** `ek_denemeler.json` → `esc_sonra`, `esc_sonra_geri`; `etkilesim_masa.json` → `ses_calarken_madde_kapat.d.title`.
- **Şiddet:** kusur.

### U2. Ana sayfadaki arama kutusunda Enter, sorguyu adrese yazmıyor
- **Nerede:** `/`, arama kutusu (`#hero-search`).
- **Yeniden üretme:** “gusl” yazın (açılır öneri listesi 6 öğeyle düzgün geliyor), Enter'a basın.
- **Ne oluyor:** Arama sayfası sonuçlarla açılıyor ama adres `/arama` oluyor (`/arama/gusl` değil). Sayfa yenilenince ya da adres paylaşılınca sorgu kayboluyor. Sekme başlığı da sorguyu içermiyor (“Arama - Se'âdet-i Ebediyye”; `/arama/namaz` için de aynı).
- **Kanıt:** `ek_denemeler2.json` → `hero_enter: {url:"/arama", q:"gusl", sonuc:30}`; `ekran/Y_hero_dropdown.png`, `ekran/Y_hero_enter.png`.
- **Şiddet:** kusur.

### U3. Tek harfli sorgu sessizce yok sayılıyor
- **Nerede:** `/arama/a`; arama sayfasında “a” yazıp Enter.
- **Ne oluyor:** Hiçbir sonuç ve uyarı yok; sayfa boş arama sayfası gibi görünüyor. Kaynakta `if (!rawQuery || rawQuery.length < 2) return;` (`app.js` 3081). Anlamsız sorguda (`/arama/qzxjwvk`) ise “Sonuç bulunamadı” ve öneri satırı doğru çıkıyor.
- **Ne olmalıydı:** “En az 2 harf yazın” gibi bir uyarı.
- **Kanıt:** `ek_denemeler.json` → `kisa_sorgu`; `ekran/X_arama_kisa.png`, `ekran/masa_arama_a.png`.
- **Şiddet:** kusur.

### U4. Bulunamayan şahıs ya da tablo adresi sessizce listeye düşüyor
- **Nerede:** `/sahis/yok-boyle-biri`, `/fevaid/tablolar/yok-boyle-tablo`; iki boyutta da.
- **Ne oluyor:** HTTP 200; Hâl Tercemeleri listesi ya da Fevâid ana ekranı açılıyor, “bulunamadı” bilgisi yok. Adres yanlış olduğu hâlde öyle kalıyor. Hata konsola da düşmüyor.
- **Kanıt:** `ekran/masa_sahis_yok-boyle-biri.png`, `ekran/masa_fevaid_tablolar_yok-boyle-tablo.png`.
- **Şiddet:** kusur.

### U5. Masaüstünde açılışta büyük düzen kayması (CLS)
- **Nerede:** 1440×900; en kötüsü `/arama/namaz` (1,048), `/sahis/imam-i-rabbani` (1,048), `/arama/abdest` (1,032), `/arama/qzxjwvk` (0,946), `/arama/a` (0,93). `/sahislar`, `/sozluk`, `/hukumler`, `/ayet-hadis` 0,234. Madde sayfaları ~0,03.
- **Ne oluyor:** İlk ~120 ms'de alt bilgi (`site-footer`) ekranın üstünde boyanıyor, sonra içerik gelip onu aşağı itiyor. Kayma kaynakları: `app-root`, `site-footer`, `main-nav` (0,93–0,95). Ardından ~200–590 ms'de footer bir kez daha kayıyor (0,102).
- **Doğrulanmadı:** Telefon profilinde bütün sayfalar CLS 0 ölçüldü. Bu, emülasyonun ölçüm farkı da olabilir; gerçek telefonda denenmeli.
- **Kanıt:** `ek_denemeler.json` → `cls/sahis/imam-i-rabbani`, `cls/arama/abdest`, `namaz_ls`; `tarama.json` → `cls` alanı.
- **Şiddet:** kusur.

### U6. Masaüstünde “Kitabın aslı” paneli bir kez açılınca her maddede kendiliğinden açılıyor ve PDF indirmeye başlıyor
- **Nerede:** 1440×900; `/madde/1/7`'de panel açıldıktan sonra açılan bütün maddeler.
- **Ne oluyor:** Tercih kalıcı olduğu için sonraki her madde açılışında `/kitap/seadet-i-ebediyye.pdf` (hakikatkitabevi.net'e giden rewrite) istekleri başlıyor. Sayfadan çıkınca bunlar `net::ERR_ABORTED` ile kesiliyor. Bu durum masaüstü etkileşim günlüğünde 9 adımda görüldü. Telefonda tercih kalıcı değil: sonraki maddeler metinle açıldı.
- **Doğrulanmadı:** Kalıcılık bilerek yapılmış olabilir (`sahifeTercihiAcik`). Yine de her maddede PDF parçası çekmek trafik ve süre maliyeti getiriyor.
- **Kanıt:** `etkilesim_masa.json` → `reqfail … seadet-i-ebediyye.pdf net::ERR_ABORTED` satırları; `ekran/E_masa_offline_madde_1_2.png` (panel kendiliğinden açık).
- **Şiddet:** kusur.

---

## Kozmetik

### Z1. Tablo kartındaki madde rozeti okunmuyor (koyu yeşil üstüne koyu yeşil)
- **Nerede:** `/fevaid/tablolar`, ör. “Allahü Teâlânın Sıfatları” kartı; iki boyutta da. Masaüstünde rozet boş yeşil bir hap gibi görünüyor, telefonda “K1/M46” zor seçiliyor.
- **Kanıt:** `ekran/masa_fevaid_tablolar.png`, `ekran/tel_fevaid_tablolar.png`, `ekran/E_masa_tablo_detay.png`.

### Z2. Yer imi düğmesinin durumu yardımcı teknolojilere bildirilmiyor
- **Nerede:** okuyucu, `#bookmark-btn`.
- **Ne oluyor:** Basınca yalnız `bookmarked` sınıfı ekleniyor; `aria-pressed` yok. Kayıt doğru yapılıyor (`ilmihal-bookmarks`) ve Çalışma Alanım'da görünüyor.
- **Kanıt:** `etkilesim_masa.json` → `yer_imi.pressed: null`, `class: "toolbar-btn bookmarked"`.

### Z3. “Okuma planı kuruldu” bildirimi “Plan ayrıntıları” bağlantısının üstüne biniyor (telefon)
- **Nerede:** `/`, okuma planında “30 gün” seçilince.
- **Ne oluyor:** Bildirim birkaç saniye bağlantıyı ve “Okumaya Başlayın” düğmesinin sağını örtüyor.
- **Kanıt:** `ekran/E_tel_plan.png`.

### Z4. Ses çalar kapandıktan sonra eski etiketi taşıyor
- **Nerede:** `/madde/1/6`'da sesi başlatıp Esc ile kapatın, `openMadde(1,7)` ile başka madde açın.
- **Ne oluyor:** Çubuk gizli (doğru) ama `audio.src` boş adrese (`https://www.ilmihal.org/`) dönmüş, etiket “Kayıt 1/1” olarak kalmış.
- **Doğrulanmadı:** Kullanıcıya görünen bir etkisi gözlenmedi.
- **Kanıt:** `ek_denemeler2.json` → `ses_baska_madde`.

---

## Hatasız çalışan, yeniden yazımda korunacak davranışlar

- **Derin adresler:** `/madde/k/n`, `/sahis/slug`, `/arama/sorgu`, `/hukumler/tür`, `/fevaid/tablolar`, `/sozluk`, `/icindekiler`, `/icerik`, `/anasayfa` doğrudan açılıyor; sayfa yenilenince aynı durum geri geliyor. Altı adreste denendi (`derin_adres_yenileme`).
- **Gerçek 404 sayfası:** `/olmayan-sayfa-xyz` 404 durum koduyla döndü; sayfada “Hızlı Erişim” bağlantıları var.
- **Okuyucu ve gezinme:** Önceki/sonraki madde adresi doğru değiştiriyor (1/5→1/6→1/5→1/4). Kısım geçişi çalışıyor (1/98 “sonraki” → 2/1). İlk maddede “önceki”, son maddede “sonraki” gizli.
- **Tarayıcıda geri/ileri:** Ana sayfa → İçindekiler → madde → sonraki madde zincirinde geri ve ileri doğru sayfaya ve maddeye dönüyor.
- **Lügat:** Lügat kelimesine tıklayınca anlam penceresi açılıyor (Arapça yazılışı ve “Lügatte aç” bağlantısıyla). Pencere ekranın içinde kalıyor; telefonda da düzgün.
- **Sesli okuma:** Ses hakikatkitabevi.net'ten çalmaya başlıyor; madde ortasındaki kayıtta doğru saniyeye atlıyor (1/6 → 87. saniye). Duraklat çalışıyor; madde kapanınca ses duruyor ve çubuk gizleniyor. Hata kodu yok.
- **Kitabın aslı (PDF):** Panel pdf.js ile sahîfe 22'yi yüklüyor, “sonraki” 23'e geçiyor. Telefonda panel tam ekran açılıyor. Çevrimdışıyken “Sahîfe yüklenemedi. PDF'i yeni sekmede açın.” uyarısı çıkıyor.
- **Yazı boyutu ve kalıcılığı (masaüstü):** 16,32 px'ten 3 kez büyüt ile 21,6 px'e çıkıyor, yenilemeden sonra da korunuyor.
- **Tema:** Üstteki düğme Sepya → Gece → Gündüz arasında dönüyor; etiket ve `localStorage` güncelleniyor. Okuyucu temaları (Açık/Sepya/Koyu) masaüstünde çalışıyor.
- **Fihrist paneli:** Telefonda açılıyor, içinden maddeye geçiliyor (2/10 → 2/2).
- **Yer imi ve Çalışma Alanım:** Yer imi kaydediliyor; Çalışma Alanım'da ilerleme (%4, 10/241) ve kısım çubukları gösteriliyor.
- **Okuma planı:** Süre seçilince plan kuruluyor (“Bugün ≈ 2 saat okuma kaldı”, bugünkü 6 madde).
- **Bilgi testi:** Konu seçiliyor, cevap işaretlenince doğru şık yeşile dönüyor ve şıklar kilitleniyor, 2. soruya geçiliyor.
- **Şahıslar ve tablolar:** Şahıs penceresi açılıyor; içindeki madde bağlantıları maddeyi açıyor. Tablodaki madde bağlantısı maddeyi açıyor. Maddedeki “ilgili şahıslar / tablolar” kutuları çalışıyor.
- **Fıkhî Hükümler:** Sekmeler adresi `/hukumler/<tür>` olarak güncelliyor; liste 100'lük partilerle yükleniyor (sonsuz kaydırma ayrıca denenmedi).
- **Arama:** Anlamsız sorguda “Sonuç bulunamadı” ve öneri çıkıyor. Arama sonucundan açılan maddede sorgu işaretleniyor. Ana sayfa arama kutusunun açılır öneri listesi çalışıyor.
- **Çevrimdışı:** Service worker kuruluyor (`ilmihal-kabuk-…`, `ilmihal-veri-…`). Bağlantı kesildikten sonra daha önce açılmamış `/madde/1/2` ve `/madde/2/40` da metinleriyle açılıyor (kısım JSON'u bir kez önbelleğe girince). `/sozluk` ve `/arama/namaz` da açıldı.
- **Duyuru:** Kapatılınca yenilemeden sonra bir daha görünmüyor.
- **Genel:** Hiçbir sayfada JS istisnası, CSP ihlali ya da yatay taşma yok. Konsol temiz (bulunamayan adresler ve `/silsile-atlasi` dışında). `/namaz-vakitleri` ve `/silsile-atlasi/` konsolu temiz.

---

## Ölçülen süreler (ms)

İlk satır (`/`) soğuk açılış. Sonrakiler aynı bağlamda, service worker ve HTTP önbelleği ısınmış hâlde ölçüldü; bunlar tekrar ziyaret süreleridir. TTFB, FCP, LCP ve load değerleri Navigation/Paint Timing'den alındı. CLS yalnız masaüstü için verildi (telefonda hepsi 0 ölçüldü, bkz. U5).

| Adres | Masa TTFB | Masa FCP | Masa LCP | Masa load | Masa CLS | Tel FCP | Tel LCP | Tel load |
|---|---|---|---|---|---|---|---|---|
| `/` (soğuk) | 305 | 508 | 788 | 1167 | 0.072 | 1456 | 1744 | 1559 |
| `/icindekiler` | 143 | 200 | 568 | 255 | 0.03 | 92 | 432 | 155 |
| `/madde/1/1` | 81 | 124 | 404 | 152 | 0.03 | 108 | 340 | 143 |
| `/madde/1/60` | 54 | 100 | 440 | 362 | 0.03 | 252 | 572 | 496 |
| `/madde/2/1` | 60 | 104 | 520 | 133 | 0.03 | 100 | 488 | 135 |
| `/madde/3/70` | 147 | 200 | 584 | 235 | 0.029 | 224 | 524 | 258 |
| `/madde/1/54` | 56 | 96 | 412 | 249 | 0.03 | 108 | 200 | 363 |
| `/madde/1/67` | 72 | 124 | 188 | 273 | 0.029 | 100 | 188 | 274 |
| `/madde/2/39` | 60 | 144 | 328 | 267 | 0 | 180 | 512 | 363 |
| `/madde/2/47` | 169 | 232 | 516 | 423 | 0.029 | 120 | 452 | 302 |
| `/madde/3/23` | 81 | 136 | 400 | 295 | 0.029 | 184 | 484 | 355 |
| `/madde/3/38` | 66 | 108 | 372 | 253 | 0.03 | 212 | 516 | 468 |
| `/sahislar` | 54 | 92 | 504 | 178 | 0.234 | 120 | 592 | 284 |
| `/sahis/abbas` | 54 | 112 | 204 | 180 | 0.102 | 192 | 540 | 299 |
| `/sahis/imam-i-rabbani` | 56 | 100 | 204 | 193 | 1.048 | 116 | 420 | 198 |
| `/sozluk` | 53 | 96 | 280 | 370 | 0.234 | 104 | 400 | 494 |
| `/arama` | 183 | 232 | 596 | 248 | 0.131 | 124 | 500 | 143 |
| `/arama/namaz` | 147 | 208 | 624 | 240 | 1.048 | 100 | 528 | 136 |
| `/arama/nemâz` | 56 | 112 | 488 | 120 | 0.102 | 220 | 632 | 255 |
| `/arama/abdest` | 72 | 124 | 456 | 145 | 1.032 | 120 | 484 | 161 |
| `/arama/qzxjwvk` | 53 | 96 | 416 | 124 | 0.946 | 152 | 500 | 181 |
| `/fevaid` | 197 | 252 | 620 | 269 | 0.029 | 128 | 484 | 133 |
| `/fevaid/tablolar` | 94 | 140 | 240 | 636 | 0.03 | 100 | 212 | 218 |
| `/hukumler` | 148 | 212 | 396 | 381 | 0.234 | 100 | 252 | 229 |
| `/hukumler/farz` | 55 | 132 | 460 | 139 | 0.204 | 132 | 464 | 155 |
| `/ayet-hadis` | 127 | 180 | 484 | 436 | 0.234 | 108 | 456 | 178 |
| `/rehberler` | 62 | 104 | 452 | 292 | 0.149 | 96 | 196 | 164 |
| `/quiz` | 65 | 112 | 144 | 125 | 0.132 | 104 | 468 | 122 |
| `/gunun-bilgisi` | 60 | 104 | 440 | 421 | 0.162 | 116 | 216 | 193 |
| `/calisma-alanim` | 156 | 208 | 588 | 228 | 0.029 | 120 | 464 | 142 |
| `/hakkinda` | 177 | 232 | 588 | 247 | 0.029 | 116 | 488 | 138 |
| `/gizlilik` | 126 | 176 | 528 | 196 | 0.03 | 124 | 492 | 146 |
| `/madde/1/999` | 101 | 144 | 508 | 817 | 0.029 | 156 | 540 | 743 |
| `/olmayan-sayfa-xyz` (404) | 63 | 152 | 152 | 124 | 0 | 148 | 148 | 122 |
| `/rss.xml` | 1555 | 1592 | 1592 | 1566 | 0 | 132 | 132 | 75 |
| `/namaz-vakitleri` | 237 | 356 | 356 | 341 | 0 | 232 | 232 | 226 |
| `/silsile-atlasi` (bozuk) | 57 | 220 | 220 | 202 | 0 | 352 | 352 | 651 |

Diğer süreler: PDF panelinde ilk sahîfe 2–3 sn içinde çizildi. Ses kaydı ~6 sn içinde `readyState 4` oldu ve çalıyordu. `/rss.xml` için ilk istek 1,5 sn TTFB verdi (sunucu tarafında üretiliyor; telefon turunda önbellekten 132 ms).

## Bulgu sayıları

| Şiddet | Sayı | Bulgular |
|---|---|---|
| kırık | 2 | K1, K2 |
| hatalı | 5 | H1–H5 |
| kusur | 6 | U1–U6 (U5 ve U6 kısmen doğrulanmadı) |
| kozmetik | 4 | Z1–Z4 (Z4 doğrulanmadı) |

## Denenmeyenler

- Paylaş düğmesi (paylaşım yapmamak için).
- Yazdır, sunum modu, yan yana okuma (telefonda dokunulabilir oldukları doğrulandı, işlevleri denenmedi).
- “Görsel Kart Oluştur”, not kaydetme, sesin uyku zamanlayıcısı ve sürekli dinleme.
- Hükümlerde sonsuz kaydırmanın 100'den sonraki partileri.
