# ilmihal.org — Ana Uygulama Özellik Envanteri

> Hazırlanış: 17 Kasım 2026 · dal `yeni-site` · kaynak: `index.html`, `app.js` (6432 satır, baştan sona okundu),
> `okuma-plani.js`, `search-engine.js`, `sw.js`, `manifest.json`, `vercel.json`, `404.html`, `api/rss.js`,
> `style.css` (gerektiği kadar). Büyük veri dosyaları açılmadı; yalnız tanımladıkları global adlar ve
> app.js'in onlardan okuduğu alanlar yazıldı. `silsile-atlasi/` ve `namaz-vakitleri/` kapsam dışıdır
> (bu iki alt uygulamada localStorage/sessionStorage/IndexedDB kullanımı **yok**, grep ile bakıldı).
>
> Satır numaraları aksi yazılmadıkça `app.js` içindir. `idx:` = `index.html`, `op:` = `okuma-plani.js`,
> `se:` = `search-engine.js`. "Doğrulanmadı" = kodda görüldü, tarayıcıda denenmedi ya da veriye bakılmadan kesinleşmez.

---

## 0. Yeniden yazımda kırmızı çizgiler (özet)

1. **25 localStorage anahtarı** (bölüm 6) aynı adla ve aynı biçimle okunmalı. İkisinin eski biçimleri de var
   (`ilmihal-bookmarks` eski düz metin dizisi; `ilmihal-hatim-kutlama` JSON tırnaklı metin).
2. **Bütün adres kalıpları** (bölüm 1), eski `#madde/…` hash bağlantıları ve eski `/tablo/:id`, `/fevaid/tablo/:id` dahil, açılmaya devam etmeli.
3. "Okundu" (`ilmihal-read`: madde **açıldı**) ile "bitirildi" (`ilmihal-bitirilen`: plan için **bitirildi**) iki ayrı kavramdır; birleştirilmemeli.
4. Vurgular metin eşlemesiyle (konumla değil) saklanır; yeni dizgide metin değişirse vurgular kaybolur (bkz. H-17).
5. Günün maddesi seçimi (`yılın günü % 241`) RSS (`api/rss.js`) ile aynı kalmalı.

---

## 1. Yollar (route'lar)

### 1.1 Yönlendirme düzeni
- **History API** (`history.pushState`), yoksa `location.hash` (`updateUrl`, 10-18). `updateHash` geriye uyum takma adı (21).
- `getRoutePath` (23-29): önce `location.pathname`; boşsa veya `index.html` ise `location.hash`; ikisi de yoksa `anasayfa`.
  → **Eski hash bağlantıları (`/#madde/1/85`, `/#sozluk` …) hâlâ çalışır.**
- Dinleyiciler: `popstate` ve `hashchange` → `handleRoute` (118-119).
- `routingSilent` bayrağı: her `updateUrl`'den sonra 50 ms `handleRoute` yok sayılır (8, 17, 48).
- İlk yükleme: `DOMContentLoaded`'da yol `anasayfa` değilse `handleRoute` (3537-3553). `/` için HTML'deki etkin sayfa (`page-anasayfa`) zaten görünür.
- Sayfa geçişi `navigateTo(page, fromRoute)` (469-477): `document.startViewTransition` varsa ve `prefers-reduced-motion` yoksa geçiş animasyonu içinde `_navigateToCore` (479-515); söz (Promise) döner.
- `navigateAndRun(page, runner)` (41-45): sayfayı URL'ye dokunmadan kurar, bir kare bekler, sonra iş yapar (doğrudan adresle gelişte kullanılır).
- Vercel tarafı: her istemci yolu `vercel.json` `rewrites` ile `/index.html`'e yazılır. Listede olmayan yol **404.html** döner (ör. `/sozluk/` sonda eğik çizgiyle; `trailingSlash`/`cleanUrls` ayarı yok).

### 1.2 Adres kalıpları (24 istemci + 2 sunucu)

| # | Kalıp | Açılan görünüm | Kod | Not |
|---|---|---|---|---|
| 1 | `/` | Ana sayfa | 26-28 | |
| 2 | `/anasayfa` | Ana sayfa | 106 | rewrite var |
| 3 | `/icerik` | İçindekiler | 106 | |
| 4 | `/icindekiler` | İçindekiler (takma ad) | 53 | |
| 5 | `/madde/:kisim/:no` | İçindekiler + okuyucu katmanı | 55-62 | geçersiz sayı → ana sayfa |
| 6 | `/sahislar` | Hâl tercemeleri dizini | 106 | |
| 7 | `/sahis/:slug` | Dizin + şahıs katmanı | 64-67 | `decodeURIComponent` |
| 8 | `/arama` | Arama sayfası | 106 | |
| 9 | `/arama/:q…` | Arama + sonuçlar | 69-77 | `/` içeren sorgu parçaları birleştirilir; URL'ye yazarken sorgu `toLowerCase()` + `encodeURIComponent` (3084) |
| 10 | `/sozluk` | Dinî Lügat | 106 | |
| 11 | `/fevaid` | Fevâid ana ekranı | 106 | |
| 12 | `/fevaid/tablolar` | Tablolar listesi | 83-86 | |
| 13 | `/fevaid/tablolar/:id` | Tablo detay | 79-82 | |
| 14 | `/fevaid/tablo/:id` | Tablo detay (eski) | 88-91 | geriye uyum |
| 15 | `/tablo/:id` | Tablo detay (eski) | 92-95 | geriye uyum |
| 16 | `/hukumler` | Fıkhî hükümler | 97-104 | |
| 17 | `/hukumler/:tur` | Hükümler, sekme seçili | 97-104 | `farz/vacib/sunnet/mustehab/mubah/mekruh/haram`; sekme değişince `replaceState` (5429-5431) |
| 18 | `/quiz` | Bilgi Testi | 106 | |
| 19 | `/ayet-hadis` | Âyet-hadîs indeksi | 106 | |
| 20 | `/gunun-bilgisi` | Günün Suâli | 106 | |
| 21 | `/rehberler` | Konu rehberleri | 106 | rehber detayının kendi adresi **yok** |
| 22 | `/calisma-alanim` | Çalışma Alanım | 106 | sayfa DOM'a JS ile eklenir (5117-5131) |
| 23 | `/hakkinda` | Hakkında | 106 | |
| 24 | `/gizlilik` | Gizlilik Bildirimi | 106 | |
| S1 | `/rss.xml` | `api/rss.js` (Edge) | vercel.json | son 30 günün "Günün Maddesi" |
| S2 | `/kitap/seadet-i-ebediyye.pdf` | Hakîkat Kitâbevi PDF'ine vekil (proxy) | vercel.json | PDF.js aynı kaynaktan Range ile okur |

- Bilinmeyen yol → `navigateTo('anasayfa', true)`; URL değiştirilmez (109-111).
- Adresi olmayan durumlar: Fevâid "Kitabın Kendi Tanımları" bölümü, rehber detayı, sözlük harf/sayfa/arama durumu, içindekiler süzgeci, arama sonuç süzgeci, tablolar süzgeç/sıralama.
- Sorgu parametresi: yalnız `?debug=1` (150) → konsola `[ilmihal-debug]` günlüğü.

### 1.3 Başlık ve meta güncellemeleri
- `updateSeoMeta(title, desc, url)` (122-136): `document.title`, `meta[name=description]`, `og:title/description/url`, `twitter:title/description`, `link[rel=canonical]`.
- Sayfa başına sabitler `pageSeoMap` (4614-4629); `_navigateToCore` sonunda uygulanır, URL `https://www.ilmihal.org/<sayfa>` (513-514). `sahislar`, `hukumler` vb. hepsi var; `gizlilik` dahil 13 sayfa.
- Madde: `updateSeoMeta` (1206-1212) + `updateOgMeta` (3920-3931) + `addFaqSchema` (3899-3917, aslında `Article` JSON-LD, `#faq-schema`) + `updateDynamicSchema('breadcrumb', …)` (1354-1363, `#dynamic-schema`).
- Şahıs: `updateSeoMeta` (2135-2147); kapanınca önceki meta geri yüklenir (`window.__sahisOncekiSeo`, 2201-2204).
- Tablo detay: `updateSeoMeta` (2493-2497); açıklama `kaynak_metin`'in tamamı (kısaltılmaz).
- Madde kapanınca meta **geri alınmaz**; sonraki `navigateTo` gelene kadar madde başlığı kalır (bkz. H-21).

### 1.4 Kaydırma konumu
- Her `_navigateToCore` `window.scrollTo(0,0)` (488); geri tuşunda sayfa konumu **korunmaz**.
- Yeni madde açılınca okuyucu içeriği en başa (909-911).
- Okuma planı: yarım kalan uzun maddede kalınan oran (`ilmihal-okuma-yeri`) geri yüklenir, "Kaldığınız yerden devam ediyorsunuz." + "Başa dön" bildirimi (op:259-271). Aramadan gelinmişse yapılmaz.
- Aramadan açılan maddede en yoğun eşleşme bölgesine yumuşak kaydırma (`highlightAndScroll`, 1485-1489).
- Ses kaydında kalınan yer ayrıca saklanır (bölüm 6, `ilmihal-audio-pos`).

---

## 2. Görünümler

Bütün sayfalar `index.html` içinde `<section id="page-X" class="page">`; tek `<main id="app-root">`. Etkin sayfa `.active` sınıfı alır, menü düğmesi `aria-current="page"` (480-485). Üst menü: Ana Sayfa, İçindekiler, Fevâid, Arama, Hakkında (idx:87-91); dar ekranda hamburger (541-543). Tema düğmesi üç durumlu (bölüm 3.7).

### 2.1 Ana sayfa (`page-anasayfa`, idx:108-307)
- Hero: "Tam İlmihâl", "Se’âdet-i Ebediyye", tanıtım cümlesi; **hero arama kutusu** (bölüm 4.4); "Okumaya Başlayın" (varsayılan `openMadde(1,1)`) + "İçindekiler".
- "Kaldığınız Yerden Devam Edin": `ilmihal-son-okunan` varsa düğme metni ve tıklaması değişir; altında "Son okunan: <başlık> · N dk/saat/gün önce" (5595-5619). `DOMContentLoaded` ve her ana sayfa dönüşünde çalışır.
- Sayılar şeridi (sabit metin): 241 madde, 9.863 lügat terimi, 1020 hâl tercemesi, 193 âyet-i kerîme, 449 hadîs-i şerîf (hadîs sekmesini açar), 2.864 fıkhî hüküm.
- **Günün Maddesi** kartı (3556-3591): `tocData[yılınGünü % tocData.length]`; tarih (uzun Türkçe), "Birinci Kısım, Madde N · Mektûbât …"; `ozetler.js` boşta yüklenip ilk satırlar alıntı olarak eklenir; "Maddeyi Okuyun".
- **Okuma Planı kartı** (`#okuma-plani-karti`, op:178-213) — bölüm 5.1.
- "Kitabın Üç Kısmı": üç kart (98/73/70 madde, metinler sabit) → `showKisim(k)`; her kartta kısım ilerleme çubuğu "N / M madde okundu" (`kisimIlerlemeGuncelle`, 6367-6387; toplamı kartın `.madde-count` metninden okur).
- "Kitabı Derinlemesine Keşfedin" 8 kart: Fıkhî Hükümler, Âyet-hadîs, Dinî Lügat, Hâl Tercemeleri, Tablolar, Konu Rehberleri, Günün Suâli, Bilgi Testi (sayılar sabit metin: 2.864 / 193·449 / 9.863 / 1020 / 128 tablo / 155 suâl / 7 konu).
- "Konulara Hızlı Erişim" 10 düğme → `filterByCategory(cat)` (661-702): `tablolarData` içindeki `konu_haritasi` tablosunun `veriler[].id/maddeler` listesine göre süzülmüş fihrist; yoksa bir arama kelimesiyle başlık süzgeci. (`categoryMap` değişkeni tanımlı ama kullanılmıyor, ölü.)
- Silsile Atlası ve Namaz Vakitleri tanıtım kartları (alt uygulamalara düz bağlantı).

### 2.2 İçindekiler (`page-icerik`)
- Veri: `window.tocData` (data.js, eager). Alanlar: `kisim, madde_no, baslik, sayfa_no, sayfa_bitis, mektup_ref, pdf_sayfa_bitis`.
- Kısım sekmeleri "Tümü / I. Kısım / II. Kısım / III. Kısım" (`aria-pressed`) + görünmez `select#kisim-filter` (eşlik eder) + "Başlıklarda ara…" kutusu (591-652).
- Arama yokken üç kısım süslü başlıklarla (Romen rakamı, kısım açıklaması, "N madde · M okundu").
- Satır: madde no rozeti · başlık (+ okundu tiki) · alt satır (kısım adı aramada, Mektûb etiketi) · noktalı çizgi · sahîfe no (557-570). `mektubEtiketi` (392-403): `"c—n"` biçimini "Mektûbât c/n" veya "Mektûbât-ı Ma'sûmiyye c/n" yapar, `title`'da uzun açıklama.
- Başlık araması kelime başı + yazım varyantlı (`expandSearchQuery` + `includesWordStart`, 603-609). Sonuç: "N madde bulundu"; boş: "Sonuç bulunamadı.".
- Konu süzgecinde "<konu> konusunda N madde" + "Tüm fihrist" düğmesi (704-711).
- Okuyucudan dönünce yalnız okundu işaretleri tazelenir (631-641).

### 2.3 Okuyucu (madde katmanı) — ayrıntı bölüm 3.

### 2.4 Hâl Tercemeleri (`page-sahislar`)
- Veri: `sahislarData` (sahislar.js, lazy). Alanlar: `slug, isim, unvan, biyografi, kategori, gectigiMaddeler["k/m"], kaynak`.
- Arama kutusu: isim/unvan/biyografide `toLocaleLowerCase('tr')` alt dizgi araması (2080-2088; varyant yok).
- Kategori çipleri: Tümü, Peygamberler (`peygamber`), Eshâb-ı Kirâm (`sahabi`), Âlimler (`alim`), Hükümdarlar (`hukumdar`), Diğer (`diger`) (idx:463-470).
- Harf fihristi çubuğu (`harfFihristiCiz`, 1925-1940): Türk alfabesi; `Â→A, Î→İ, Û→U, Ô→O, Ê→E`; boş harf devre dışı, W yoksa gizli. Burada harfe tıklamak o harf bölümüne **kaydırır** (sözlükte ise süzer).
- Liste harf bölümleri hâlinde; kart: isim, unvan, biyografinin ilk 180 harfi, "N maddede geçer" (2055-2064). Süzgeç varken "N kişi".
- **Şahıs katmanı** (`#sahis-detay`, 2120-2196): isim, unvan, "Hâl Tercemesi" (paragraflar), "Geçtiği Maddeler" (sayı rozeti; `I-12` biçimli rozet + başlık, tıklayınca katman kapanır ve madde açılır), "Kaynak: …". Kapatma: × düğmesi, zemin tıklaması, Esc.

### 2.5 Dinî Lügat (`page-sozluk`)
- Veri: `sozlukData` (sozluk-data.js, 3,1 MB, lazy + arka planda önyükleme). Alanlar: `i` (id), `k` (kelime), `a` (mânâ, HTML olabilir), `o` (Osmanlıca yazılış), `m` (misal), `b` (bkz.), `d` (köken kodu: A, F, T, Fr, Y, İt, L → 1955).
- Arama: kelime **veya** mânâda kelime başı + varyant (1979-1986); arama varken harf süzgeci yok sayılır.
- Harf çubuğu "Tümü" + harfler (seçince süzer, aramayı temizler).
- Alfabetik (`localeCompare 'tr'`), **sayfa başına 100** kayıt; « ‹ n / N › » sayfalama, sayfa değişince harf çubuğuna yumuşak kaydırma (1957-1962).
- Kayıt: kelime, Osmanlıca (`lang=ar dir=rtl`), köken, mânâ, misal (blockquote), "Bkz. …".
- Sayaç: "“q” için N kelime" / "A harfi · N kelime" / "· Sayfa x/y (ilk – son)".

### 2.6 Fevâid (`page-fevaid`)
- Ana ekran 11 kart (idx:497-565): Fıkhî Hükümler, Günün Suâli, Âyet-hadîs İndeksi (642 kayıt), Tablolar ve Diyagramlar (sayı `loadFevaid` ile doldurulur: `konu_haritasi` ve `kitabin_tanimlari` hariç), Dinî Lügat, Kitabın Kendi Tanımları (510 tanım), Hâl Tercemeleri, Silsile Atlası, Namaz Vakitleri, Çalışma Alanım, Bilgi Testi.
- Menüden Fevâid'e her girişte ana ekran sıfırlanır (494-498).
- **Tablolar** (`openFevaidSection('tablolar')`, 2241-2310): "Kategorik / Kitap Sırası" sıralama; kategori süzgeci (Tümü, İman ve İtikat, Temizlik, Namaz, Oruç, Zekât, Hac ve Umre, Aile Hukuku, Cenâze, Mu'âmelât) — Kitap Sırası'nda süzgeç gizlenir; "Tablo ara..." (başlık/kaynak metin/kaynak madde alt dizgisi). Kategorik görünümde kategori başlıkları + "Genel".
  Kart: tip simgesi + başlık (tıklayınca detay), kaynak madde bağlantısı (`K1/M51`), "s. N" (bkz. H-22), gövde, "Kitaptan: …".
- Tablo veri yapısı `tablolarData` (data.js): `id, baslik, tip (tablo|liste|iki_liste|flowchart|agac|tanimlar), kategori, kaynak_madde "K1/M51", sayfa_no, kaynak_metin, veriler, kolonlar, sol_baslik, sag_baslik, dallar`.
  Çiziciler: `renderTable` (2584), `renderFlowchart` (2599), `renderListe` (durum anahtarına göre ✓/✗/• — 2616-2633), `renderIkiListe` (anahtar/başlık kelimelerinden ✓/✗ tahmini — 2635-2679), `renderAgac` (2515-2547), `renderTanimlar` (2549-2582).
- **Tablo detay** (2430-2498): "← Tablolar", kategori rozeti, kaynak madde başlığı, sayfa sırasına göre "← Önceki / Sonraki →" tablo.
- **Tablo kipi (modal)** `openTabloModal` (2374-2411): madde içindeki "İlgili Tablo ve Diyagramlar"dan açılır; "Tablo Sayfasına Git →".
- **Kitabın Kendi Tanımları** (`renderTanimlar`, `tanimlarData` alanları `t` terim, `c` cümle, `s` sahîfe): "Terim veya tanımda ara…" (varyantlı alt dizgi), tablo "Terim | Kitaptaki Tanım | S.", "N tanım gösteriliyor".

### 2.7 Arama (`page-arama`) — bölüm 4.

### 2.8 Bilgi Testi (`page-quiz`, 3742-3865)
- Sorular **app.js içine gömülü** (`quizSorulari`): iman 8, namaz 8, oruc 5, zekat 5, hac 5, ahlak 4 = 35 soru; `karisik` = hepsinden rastgele 10. Soru alanları `s` (soru), `c` (şıklar), `d` (doğru indeks), `a` (açıklama, kitaptan alıntı), `m {k, m}` (kaynak madde).
- Akış: konu seç → ilerleme çubuğu "n/N" → "Soru n" → şık seç (doğru yeşil, yanlış kırmızı, kilitlenir) → açıklama + "Kitaptaki yerini oku" (açıklamadan çıkarılan ipucuyla madde açılır ve vurgulanır) + "Sonraki Soruya Geç →"/"Sonuçları Gör →" → "puan/100", "d/N doğru cevap", "Yeni Test".
- En yüksek puan `ilmihal-quiz-puan`'a yazılır ama **hiçbir yerde okunmaz** (`#quiz-skor-ozet` boş kalır).
- Konusu boşsa `alert('Bu konuda henüz soru bulunmuyor.')`.

### 2.9 Âyet-i Kerîme ve Hadîs-i Şerîf İndeksi (`page-ayet-hadis`, 3936-4035)
- Veri: `ayetHadisData` (ayet-hadis.js, lazy) `{ayetler[], hadisler[]}`; öğe alanları `metin, sure, ayet_no, kaynak, kisim, madde, sayfa`.
- İki sekme (Âyet-i Kerîmeler / Hadîs-i Şerîfler); "İndekste ara..." (metin, sûre, kaynakta düz `toLowerCase` alt dizgi, varyant yok).
- Âyet etiketi: "<Sûre> sûresi, <n> âyet-i kerîmesinde meâlen" / "<Sûre> sûresinde meâlen"; hadîs: "(<kaynak>) kitâbında bildirilen hadîs-i şerîf".
- Kayıt maddeye bağlıysa tıklanır: "<başlık> — Maddenin bu yerine git →" (metnin ilk 50 harfiyle vurgulu açılış); değilse "Se'âdet-i Ebediyye, sayfa N".
- **İlk 50 sonuç** gösterilir: "İlk 50 sonuç gösteriliyor. Aramayı daraltın." Sayfalama yok.
- Sayaç: "N âyet-i kerîme bulundu" / "N hadîs-i şerîf bulundu".

### 2.10 Günün Suâli (`page-gunun-bilgisi`, 4632-4755)
- Veri: `gununSorusuData` (lazy) dizisi; alanlar `soru, baslik, kisim, madde`.
- Seçim: yerel gece yarısında değişen gün sayısı `% uzunluk` (4632-4643).
- Kart: "SUÂL", soru, "özü" (baslik), "Cevâbı için maddeyi oku →".
- "Paylaş" (Web Share; yoksa panoya "Panoya kopyalandı."), "Görsel Kart Oluştur" (1080×1080 PNG, `gunun-bilgisi.png`).
- "Önceki Günler": son 7 günün suâli (tarih + ilk 100 harf), tıklayınca madde.

### 2.11 Konu Rehberleri (`page-rehberler`, 4832-4912 + 5035-5114)
- Veri: `rehberlerData` (lazy): `id, baslik, aciklama, ikon, renk, bolumler[{baslik, maddeler[{kisim, maddeNo, not}]}]`.
- Liste: kart (sol kenar rengi, ikon, başlık, açıklama, "N bölüm, M madde").
- Detay (`renderRehberDetayEnhanced` asıl çizici): "← Rehberler", ilerleme "n/N adım tamamlandı" + %; %100'de "Bu rehberi tamamladınız. Allahü teâlâ ilminizi artırsın."; bölüm başlıkları (bitti ✓); her adımda yuvarlak işaret düğmesi (`ilmihal-rehber-progress`) + "K1 / M51 · not" bağlantısı (madde açar).
- Rehber detayı URL'ye yazılmaz; sayfa yeniden açılınca son açık rehber (bellekte `rehberDetayAcik`) gösterilir.

### 2.12 Çalışma Alanım (`page-calisma-alanim`, 5117-5352)
- Sayfa JS ile oluşturulur. Bölümler sırasıyla:
  1. Okuma planı bölümü (`#okuma-plani-calisma`, op:215-280).
  2. Okuma istatistiği (`renderOkumaIstatistik`, 5760-5790): halka "%x Açılan n/241 madde", "dk bugün", "yer imi", "not"; kısım çubukları **sabit toplamlarla** 98/73/70.
  3. "Notları ve Vurguları İndir (.md)" → `ilmihal-calisma-alanim-YYYY-MM-DD.md` (5303-5335): madde sırasına göre başlık, bağlantı, `>` vurgular, "**Notlarım:**" listesi. Boşsa `alert('Dışa aktarılacak not veya vurgu yok.')`.
  4. "Yer İmleri (n)" — eski düz metin kayıtları da okunur (5160-5161).
  5. "Notlarım (n)" — kart, tıklayınca madde; "Sil".
  6. "Vurgularım (n)" — kart sol kenarı vurgu rengi; "Sil".
  7. "Son Okunanlar (n)" — `ilmihal-read-history`'nin son 12'si, yeniden eskiye.
  8. "Rehber İlerlemesi" — yalnız ilerleme kaydı olan rehberler ve `rehberlerData` yüklüyse.
- Boş durum metinleri bölüm 8'de.

### 2.13 Fıkhî Hükümler (`page-hukumler`, 5384-5592)
- Veri: `hukumlerData` (hukumler-data.js, 3,1 MB, lazy). Okunan alanlar: `tur, katman ('acik'|'tum'), metin (HTML), alt_tur, konu, baglam, sayfa, kisim, madde_no`.
- Sekmeler: Tümü, Farz, Vâcib, Sünnet, Müstehab, Mübah, Mekruh, Haram (`data-tur`); seçim `replaceState` ile `/hukumler/:tur`.
- Katman anahtarı "Açık Hükümler / Tüm Geçişler"; seçili türde `tum` kaydı yoksa gizlenir ve `acik`'a döner (5460-5469).
- "Hüküm ara..." 250 ms gecikmeli, metin/alt tür/konuda `toLowerCase` alt dizgi.
- Sonuç satırı: "N açık|toplam <tür> hükmü (arama: "q")".
- Kart: tür rozeti, alt tür, "s. N" (sahîfenin maddesini açar), "K1/M51" (cümlenin ilk 60 harfiyle vurgulu açılış), metin, konu, açılır "Bağlam". Kartın tamamı tıklanabilir.
- **Artımlı çizim**: 100'erli parti, `IntersectionObserver` gözcüsü (`rootMargin 600px`); destek yoksa hepsi bir kerede.
- Madde no yoksa sahîfeden madde bulunur (`findMaddeForSayfa`, önbellekli, 5486-5497).

### 2.14 Hakkında, Gizlilik
- Statik metin (idx:708-841). Hakkında'nın başına JS ile "Son güncelleme: Ekim 2026" ve "Kaynak: Se'âdet-i Ebediyye, Hakîkat Kitâbevi, 2026 baskısı" eklenir (5008-5016).
- Gizlilik metni localStorage'da tutulanları sayar; yeni anahtar eklenirse bu metin güncellenmeli.

### 2.15 Ortak öğeler
- Altbilgi: Kitap (İçindekiler, Arama, Konu Rehberleri, Çalışma Alanım), Fevâid (5 bağlantı), Site (Silsile Atlası, Namaz Vakitleri, Hakkında, Gizlilik, Geri Bildirim), "Günün Maddesi RSS".
- Duyuru bandı (bölüm 5.7), bildirim tostu `#bildirim` (414-431, `role=status`, 4,5 sn; eylemli 6,5 sn).
- `--ust-yukseklik` CSS değişkeni başlık yüksekliğinden ölçülür (yapışkan harf çubukları için, 1943-1948).
- 404 sayfası: "Aradığınız sayfa bulunamadı", "Ana Sayfaya Dön", "Sitede Ara", 9 hızlı bağlantı; kendi koyu tema medyası; `fonts/fontlar.css` kullanır.

---

## 3. Okuyucu (madde görünümü)

`#madde-detay` (idx:338-454): `role=dialog aria-modal=true aria-labelledby=okuyucu-baslik-ad`. Izgara: sol kısım fihristi · metin · sağ "Kitabın Aslı" paneli.

### 3.1 Açılış akışı — `openMadde(kisim, no, fromRoute, searchQuery)` (1172-1364)
1. İstek numarası (`_maddeOpenRequestId`) — eski isteklerin sonuçları atılır.
2. Katman **hemen** açılır, `body` kaydırması kilitlenir, iskelet yükleyici (`iskeletHTML`, 6255).
3. Meta: `tocData` dizinlerinden (`ensureTocIndexes`); yoksa `maddeler-data.js` (4,5 MB) yüklenip aranır. Bulunmazsa "Madde bulunamadı" + "Kapat".
4. `markAsRead` (okundu + okuma geçmişi), `ilmihal-son-okunan` yazılır, SEO meta, URL (`fromRoute` değilse), yer imi düğmesi durumu.
5. Çerçeve (`okuyucuCercevesiniHazirla`, 862-913): üst çubukta "Birinci Kısım · Madde N" + başlık; kısım fihristi (yalnız kısım değişince yeniden çizilir; etkin satır ortalanır, okundu işaretli); önceki/sonraki madde adları (kısım değişiyorsa kısım adıyla); sahîfe paneli açıksa yeni maddenin sahîfesi.
6. Metin: `texts/kisimN.json` (`{"<madde_no>": "<metin>"}`); 30 sn zaman aşımı; doğrudan `/madde/` adresinde `index.html` içindeki erken istek yeniden kullanılır (idx:910-930, 771-776); başarısızsa `maddeler-data.js` yedeği (817-833). Yine yoksa "Madde metni zamanında yüklenemedi…" + "Tekrar Dene".
7. Önce **çıplak metin** basılır (breadcrumb "Ana Sayfa › İçindekiler › <Kısım> › Madde N", başlık, metin, `#madde-bitir`, "Paylaş" + "Görsel Kart", üç boş yuva).
8. Sonra: arama vurgusu, ses hazırlığı (bir kare sonra), ilgili şahıslar, ilgili tablolar + ilgili maddeler, okuma planı bildirimi.
9. Sözlük katmanı boşta (`requestIdleCallback`, 1,5 sn sınır) metni **yeniden yazar** (`maddeMetniHTML(…, true)`), ardından ipucu/kutu dinleyicileri, çapraz bağlantılar, kayıtlı vurgular, arama vurgusu yeniden (1278-1308).
10. JSON-LD (Article + BreadcrumbList), OG meta.
- Ayrıca bir `MutationObserver` `#madde-body`'yi izler, ilk dolumda bir kez çapraz bağlantı + vurgu uygular (`data-zengin`, 6216-6243).

### 3.2 Metin dizgisi — `maddeMetniHTML` (1748-1768)
- Paragraflar boş satırla ayrılır.
- `⟦şekil:N⟧` → "Kitapta burada bir şekil vardır: şekli N. sahîfede görün" (PDF'e yeni sekme).
- `⟦cedvel:N⟧\n…` → `<figure><pre>` + "Kitaptaki aslı: N. sahîfe".
- Satır kırılımlı blok: iki+ boşluk içeriyorsa `<pre class="madde-tablo">`, değilse şiir (`<br>`'li `madde-siir`).
- `[1] ` ile başlayan → dipnot (`madde-dipnot`).
- Harflerin %70'i büyükse ve ≤160 harf → ara başlık (`madde-ara-baslik`), tırnak içi hariç.
- Sahîfe numarası metin içinde **değil**; başlıkta "Sayfa N-M" (383-388) → sahîfe panelini açar.

### 3.3 Lügat (zor kelime) katmanı
- Dizin `buildSozlukIndex` (1647-1686): tek kelimelik girişler + parantez içi alternatifler (boşluk/tire içerenler atlanır), `trLower` (İ/I düzeltmesi).
- Eşleme `highlightWords` (1697-1726): kelime kelime; doğrudan veya ek atılarak (`TR_SUFFIXES`, en kısa ekten başlayarak) bulunan giriş `<span class="zor-kelime" data-anlam data-osmanli data-id data-kelime data-misal>` olur. Çok kelimeli eşleme kaldırılmış (mobil donma).
- **İpucu** (fare üstü, olay delegasyonu 1779-1790): Osmanlıca + mânâ; misali olan girişte "Ayrıntılar →" → sözlük kipi (`showSozlukModal`, 1860-1913: kelime, Osmanlıca, mânâ, "Misal:", "Bkz.").
- **Tıklayınca açılır kutu** (`initInlineSozluk`, 5794-5835, `role=dialog`): kelime, Osmanlıca, mânâ (300 harfe kısaltılmış), "Lügatte aç" (sözlük sayfasında o kelimeyi arar), ×. Dışarı tıklayınca kapanır.
- "Lügat Çizgileri" anahtarı altı çizgileri gizler (`html.lugat-cizgisiz`, 6337-6352).
- Sözlük verisi gelmeden metin çizgisiz görünür; gelince yeniden yazılır.

### 3.4 Çapraz madde bağlantıları — `aktivCrossLinks` (5874-5900)
- Yalnız metin düğümlerinde, "Madde 54’e bak…" / "Madde 54'a bak…" kalıbı (`/Madde (\d{1,3})(?=[’']?[ea] bak)/`), **aynı kısmın** maddesi varsa `<a class="crossref-link" href="/madde/k/n">`. "Mecelle, Madde 855" gibi başka eser atıfları bağlanmaz.
- **İlgili Maddeler** (`getIliskiliMaddeler`, 4918-4946): `crossRefData["k/m"] = [{kisim, madde_no, neden}]`; nedenler ve etiketler: `madde referansı` → "Kitapta atıf", `atıf yapan madde` → "Bu maddeye atıf yapan", `aynı konu` → "Yakın konu"; bu sırayla, tekrarsız, en çok 8.

### 3.5 Âyet/hadîs vurgusu
- Okuyucuda âyet/hadîs için **ayrı bir görsel vurgu kodu yok**. Yalnız indeksten gelindiğinde metnin ilk 50 harfi arama vurgusu olarak (`mark.search-highlight`) işaretlenip kaydırılır (4006-4007). Metindeki tırnak/biçim, verinin kendisinden gelir (doğrulanmadı).

### 3.6 Kitabın aslı (PDF) paneli (915-1062)
- Açma: araç çubuğu sahîfe düğmesi (`sahifePaneliToggle`) veya başlıktaki "Sayfa N" bağlantısı.
- PDF.js 5.4.624 ilk kullanımda dinamik `import('/vendor/pdfjs-5.4.624/pdf.min.mjs')`; belge `/kitap/seadet-i-ebediyye.pdf` (Vercel vekili), `disableAutoFetch`, `disableStream`, `rangeChunkSize 262144`, `isEvalSupported:false`, `enableXfa:false`.
- Gezinti: ‹ › düğmeleri, sahîfe numarası kutusu (1–1248), "Büyüt / sığdır" (×1,8; tuvale çift tıklama da), "PDF'i yeni sekmede aç" (hakikatkitabevi.net `#page=N`), kapat.
- Tema renkleri: koyuda `#1f1f25/#dcdcdc`, sepyada `#f7f0da/#3a2a18` (`pageColors`).
- DPR en çok 2; bir sonraki sahîfe önceden istenir; pencere boyu veya tema sınıfı değişince yeniden çizim (200 ms gecikmeli).
- Durum metinleri: "Sahîfe N yükleniyor…", "Sahîfe yüklenemedi. PDF’i yeni sekmede açın.".
- Tercih `ilmihal-sahife-acik`; ≥1100 px ekranda madde açılınca panel kendiliğinden açılır. Panel açılınca mobil fihrist çekmecesi kapanır.
- Not: `sayfaLink` (378-381) ve hükümlerdeki "s. N" bağlantıları PDF'i **değil**, o sahîfeyi içeren **maddeyi** açar (`openSayfa`, 449-456).

### 3.7 Okuma ayarları paneli "Aa" (6261-6364, idx:359-395)
- Yazı Boyutu: A− / %değer / A+ (`adjustFontSize`, adım 0,1 rem, aralık 0,8–1,6; `--madde-font-size`; `ilmihal-font-size`).
- Satır Aralığı: Sık 1.7 / Normal 2 / Ferah 2.3 (`--okuma-aralik`).
- Hizalama: Sol / İki Yana (`--okuma-hiza`).
- Tema: Açık / Sepya / Koyu (üstteki tema düğmesiyle aynı anahtar `ilmihal-theme`). Üst düğme sırayla döner: Gündüz → Sepya → Gece (339-373); `html.dark` / `html.sepia`.
- Lügat Çizgileri anahtarı (`role=switch`).
- Dar ekranda (≤640 px) panel arkasında perde; dışarı tıklama ve Esc kapatır. Aa paneli ile taşma menüsü birbirini kapatır.
- **Yazı tipi seçimi yok** (Literata sabit, `--font-okuma`).

### 3.8 Araç çubuğu ve taşma menüsü
- Sırayla: kısım fihristi (geniş ekranda gizle/göster, `ilmihal-fihrist-gizli`; dar ekranda çekmece; metne dokununca çekmece kapanır), başlık, ses, sahîfe, Aa, yer imi (yıldız), paylaş, "Daha fazla" (⋯), kapat.
- Taşma menüsü (`role=menu`): Yazdır (`window.print`), Odak modu (`fullscreen-mode` sınıfı; tarayıcı tam ekranı **değil**; düğme metni "Odak modu"/"Odak modundan çık"), Sunum modu, Yan yana okuma.
- **Sunum modu** (5838-5868): madde metninin kopyası tam ekran katmanda, A+/A− (1,2–3,5 rem), ×, Esc; içinde lügat ipucu ve kutu çalışır.
- **Yan yana okuma** (6169-6210): okuyucu içinde ikinci panel; "Madde ara..." (başlık/no, ilk 20), seçilen maddenin çıplak metni, "Değiştir", ×.
- Okuma ilerleme çubuğu (üstte, `scaleX`), 120 px kaydırınca `kaydirildi` sınıfı (1064-1085).

### 3.9 Yer imi (3608-3647)
- Yıldız düğmesi / `B` kısayolu. Kayıt `{key, kisim, madde_no, baslik}`; `title` "Yer imi ekle"/"Yer imini kaldır"; `.bookmarked` sınıfı.

### 3.10 Vurgulama ve not
- **Metin seçim çubuğu** (5903-5938): okuyucu metninde ≥10 harflik seçimde (yalnız `mouseup`) seçimin üstünde: Kopyala / Vurgula / Kart. 500 harfe kısaltılır.
- **Vurgula**: 4 renk (Sarı `#fff3b0`, Yeşil `#b8f0c8`, Turuncu `#ffd8a8`, Pembe `#ffc8d8`) + ×; `<mark class="ilmihal-highlight" data-renk>`; kaydederken o maddedeki bütün işaretler metin+renk olarak yazılır (6095-6108).
- Yükleme: metin düğümleri birleştirilerek ilk geçtiği yer bulunur (6128-6165).
- Vurguya tıklayınca "Vurguyu kaldır" (6393-6432).
- **Kart** (`metinPaylasKart`, 5945-6043): 1080×1350 fildişi zemin, çift altın çerçeve, Literata alıntı (52→36 px uyarlanır), başlık, "Kısım, Madde · Sayfa", "ilmihal.org"; `navigator.share` dosya paylaşımı, yoksa `ilmihal-alinti-k-m.png` indirme.
- **Notlarım** (4341-4398, idx:436-447): açılır alan, metin kutusu, "Kaydet", not listesi (tarih + ×). Madde başına çoklu not.

### 3.11 Paylaşma
- Üst çubuk paylaş (`shareMadde`, 3650-3664): Web Share (başlık+URL), yoksa URL panoya, düğme 1,5 sn "✓".
- Metin altı "Paylaş" (`maddePaylasText`, 4819-4829): "başlık\n\nSe'âdet-i Ebediyye, Kısım, Madde N\nURL"; yoksa "Panoya kopyalandı.".
- "Görsel Kart" (`maddePaylasimKarti`, 4758-4817): 1200×630 yeşil degrade, altın çerçeve, başlık (en çok 4 satır), `madde-k-m.png` indirme.

### 3.12 Yazdırma
- `window.print()`; `@media print` (style.css 3392-3400 ve 5635-5639) başlık, altbilgi, araç çubuğu, fihrist, gezinti, notlar, ilgili kutuları gizler.

### 3.13 Önceki / sonraki
- Alttaki "← Önceki Madde / Sonraki Madde →" + madde adı; kısımlar arası geçer; uçta devre dışı (`navMadde`, 4401-4418). Geçişte ses durur.

### 3.14 Okundu işareti ve bitirme
- Açılan madde hemen "okundu" (`ilmihal-read`); fihristte ve kısım fihristinde tik.
- "Bu maddeyi bitirdim"/"Bitirildi" düğmesi (op:233-242) + not ("Okuma planınıza işlenir." / "Bitirdiğiniz maddeler kaydedilir. Okuma planı yapın").
- Sonuna kadar (≥%98,5) kaydırılan madde, okuma süresinin üçte biri (8 sn–3 dk) geçmişse kendiliğinden bitirilir; "Madde bitirildi olarak işaretlendi." + "Geri al" (op:288-298).

### 3.15 Özet (ozetler.js)
- `window.maddeOzetleri["k/m"]` yalnız **Günün Maddesi** alıntısında kullanılır; okuyucuda özet gösterilmez. `window.maddeUzunluklari["k/m"]` (harf sayısı) okuma planının hesabında.

### 3.16 İlgili şahıslar / tablolar
- "Bu Maddede Geçen Şahıslar" (sayı rozeti; en çok 12; sahâbî ✹, diğer ★) — `sahislarData[].gectigiMaddeler` içinde `k/m` (1493-1512). Yüklenirken "Şahıs bağlantıları hazırlanıyor...".
- "İlgili Tablo ve Diyagramlar" — `tablolarData[].kaynak_madde === "K{k}/M{m}"` (1514-1530) → tablo kipi.
- Okuyucuda ilgili **hükümler** yok.

### 3.17 Sesli okuma (4038-4537)
- Kaynak: `https://www.hakikatkitabevi.net` + `audioMap[sahîfe]` yolu (audio-map.js, lazy; `encodeURI`).
- Eşleme: `sesAraligiMap` (4055-4133, **app.js içine gömülü**, 241 madde): `"k/m": [başlangıç kaydı, başlangıç sn, bitiş kaydı, bitiş sn|null]`; `null` = seslendirilmemiş (eski baskıda yok; Hakkında'da "14 madde" denir); haritada olmayan maddede sahîfe aralığı.
- İlk kayıtta başlangıç saniyesine atlanır; son kayıtta bitiş saniyesinde durur.
- Kontroller (idx:399-414): ◀ önceki kayıt, −10, ▶/❚❚, +10, ▶ sonraki kayıt, ilerleme çubuğu (tıklayarak atlama), süre, hız (0.5/0.75/1/1.25/1.5/2), uyku zamanlayıcı (kapalı/15/30/60 dk), sürekli dinleme (bitince sonraki maddeye geçip 1,5 sn sonra çalar), "Kayıt n/N".
- Konum her 5 sn kaydedilir; madde yeniden açılınca geri yüklenmeye çalışılır (bkz. H-9).
- MediaSession: başlık, sanatçı "Se'âdet-i Ebediyye", albüm "Kısım N"; oynat/duraklat/önceki-sonraki kayıt/±10 sn.
- Cümle izleme / metin–ses eşlemesi **yok**.
- Kapanışta ses durur (`closeMadde` sarmalanmış, 4331-4337).

### 3.18 Klavye
- Esc sırası (1561-1580): Aa paneli/taşma menüsü → mobil fihrist çekmecesi → dar ekranda sahîfe paneli → tablo kipi → şahıs katmanı → madde.
- Kısayollar (5711-5729; giriş alanlarında çalışmaz): `?` kısayol penceresi, `/` arama, `h` ana sayfa, `i` içindekiler, `t` tema, `b` yer imi (madde açıkken). `j`/`k`/`+`/`-` ve `F` pencerede yazıyor ama **çalışmıyor** (H-3).
- Okuyucu ve şahıs katmanında Tab odak tuzağı (1587-1604).

### 3.19 Günlük hedef
- Madde açıkken her 60 sn +1 dk (`ilmihal-daily-goal`, hedef 30 dk); hedef dolunca (okuma planı yoksa) "Bugünkü okuma hedefiniz tamam" kutusu (8 sn) (4551-4596).

---

## 4. Arama

### 4.1 Normalleştirme ve yazım varyantları (app.js)
- `normalizeSearch` (2685-2697): â→a, ç→c, ğ→g, ı/I/İ/î→i, ö→o, ş→s, ü/û→u, ê→e; `'`, `‘`, `’`, `-` → boşluk; `?!.,;:()"[]{}` silinir; küçük harf; boşluk sıkıştırılır.
- Kelime başı eşleme `indexOfWordStart` (2703-2711): önceki karakter boşluk/noktalama olmalı ("rahmetullah" içinde "ahmet" bulunmaz).
- `OTTOMAN_MANUAL` (2718-2756): namaz↔nemaz, niyet↔niyyet, vasiyet↔vasiyyet, tasavvuf↔tesavvuf, salavat↔salat, tovbe↔tevbe, oruc↔savm, hac↔hacc, gusul↔gusl, secde↔sucud, peygamber↔resulullah, mezhep↔mezheb, sabir↔sabr, sukur↔sukr, nisap↔nisab, faiz↔riba, mehr↔mehir, sahabi↔eshab (+ eş değerli kalanlar); ekli biçimlere de uygulanır (namazi→nemazi).
- `wordVariants` (2759-2867): son p↔b, t↔d (≥4 harf, ekli biçimlerde de); ünsüz yığılması gusl↔gusul, zikr↔zikir; şedde tekleme (niyyet→niyet) ve tek y→yy; iç i/u düşürme (vakitleri→vaktleri); en çok 15 varyant.
- `expandSearchQuery` (2875-2921): durak kelimeleri (`_searchStopWords`, 2873) atılır (hepsi durak kelimesiyse korunur); `aramaSynonyms` (arama-sozluk.js) tek kelime ve tüm ifade için eş anlamlı ekler; sonuç `{normalized, words, wordVarLists, altWords}`.

### 4.2 Motor (search-engine.js)
- Ters dizin (`buildIndex`, se:108-220): madde başlıkları (boost 10), `tanimlarData` terim (8) ve tanım (2), `sozlukData` kelime (7) ve mânâ (1,5), şahıs isim+unvan (8), tablo başlığı (6). `tocData` hazır olunca 100 ms sonra kurulur; sözlük/şahıs verisi gelince `rebuild`.
- `unifiedSearch` (se:290-407): her kelime için varyantlar + bulanık eşleşme (önek 0,5; Levenshtein ≤1 kısa, ≤2 uzun; ilk harf aynı olmalı); 4+ kelimede bir kelime eksik olabilir; başlık eşitliği/başlangıcı/kapsamı, başlık kapsama, tam kelime bonusları; tür başına `limit`, aynı başlık tekrar etmez.
- `unifiedFullSearch` (se:447-570): üç kısım metninin **tamamı** (~4,5 MB) yüklenir, normalleştirilmiş külliyat önbelleğe alınır; kelime grubu başına başlık puanı (8/6/4) + tf (en çok 4×1,6) × idf; ifade bonusları; tek kelimede başlık bonusu; madde başına `findPassage` ile parça; en çok 30 madde, yan sonuçlar 8.
- `findPassage` (se:574-676): sorgu kelimelerinin en çok geçtiği cümle, 180 harflik parça, `<mark>`.
- AI araması (`aiSearch`, `isQuestion`, `raufenc.com/api/ilmihal-search/`) — **kapalı** (`AI_ARAMA_ACIK = false`, 3161); ölü kod.

### 4.3 Arama sayfası — `doFullSearch` (3079-3329)
- En az 2 harf; URL `/arama/<küçük harf sorgu>`; istek numarasıyla yarış koruması.
- Durum metinleri: "Aranıyor...", "Arama hazırlanıyor...", "Kitapta aranıyor...", "En az 2 harfli kelime girin.".
- **Doğrudan eşleşme** (`findDirectMatch`, 3871-3892): `soruMaddeMap` `[{soru[], kisim, maddeNo, cevapOzet}]`; soru gibi görünen sorgularda en uzun eşleşen soru; "Tam Eşleşme" rozetli kart + `cevapOzet`.
- Tek kelimede başlık sırası öne alınır (3138-3148).
- "Bunu mu demek istediniz?" (≤2 madde sonucunda; bilinen terim havuzunda Levenshtein, 3043-3077, 3171-3189).
- Sonuç kartı: başlık, vurgulu parça (`highlightSnippet`, 3008-3025) veya "(Başlıkta eşleşme)", "Kısım, Madde N · Sayfa N"; tıklayınca madde sorgu vurgusuyla açılır.
- Yan bloklar: "İlgili Sözlük Terimleri" (→ sözlük araması), "İlgili Şahıslar" (→ şahıs katmanı), "İlgili Tablolar" (→ tablo detay).
- Süzgeç çubuğu: Tümü (n) / Maddeler / Sözlük / Şahıslar / Tablolar — yalnız görünürlük süzer (4949-4961).
- Sonuç yoksa: "Sonuç bulunamadı.", eş anlamlı anahtarlardan "İlgili konular: …" (en çok 5), "Farklı kelimeler veya Osmanlıca yazım deneyin: nemâz, gusl, oruc".
- Hazır etiketler: Abdest nasıl alınır?, Namaz, Namazın farzları, Oruç, Zekât kimlere verilir?, İmanın şartları, Nikâh, Cenaze, Bid'at (ilk aramada gizlenir).
- Enter ile arama; "Ara" düğmesi.

### 4.4 Hero arama kutusu (3336-3534)
- 200 ms gecikmeli; motor hazır değilse sessizce bir şey göstermez; tür başına 4 sonuç; başlıklar "Maddeler / Dinî Lügat / Hâl Tercemeleri / Tablolar" (SVG simgeli); "Tüm sonuçları gör →"; "Sonuç bulunamadı".
- Klavye: ↑/↓ seçim, Enter (seçili öğe ya da arama sayfası), Esc; dışarı tıklayınca kapanır; odakta son sonuçlar yeniden görünür.
- Seçim: madde (sorgu vurgusuyla), sözlük (H-6), şahıs katmanı, tablo detay.

### 4.5 Vurgu
- Okuyucuda `highlightAndScroll` (1367-1490): 3+ harfli kelimeler ve varyantları; 500 harflik pencerede en yoğun bölge ±300 harf; en çok 25 `mark.search-highlight`; ilk işarete kaydırma.
- Arama geçmişi **yok**; öneri listesi yalnız hero açılır listesi.

---

## 5. Diğer özellikler

### 5.1 Okuma planı (hatim) — okuma-plani.js
- Süreler: 30 gün, 90 gün, 180 gün, 1 yıl (365). Okuma hızı varsayımı **dakikada 1100 harf**; madde uzunluğu `maddeUzunluklari` (yoksa 4000).
- Günlük kısım harf aralığıyla hesaplanır; uzun madde birkaç güne yayılabilir ("(devamı)").
- Durum (op:56-89): gün no, bugünkü kalan dk, geride/önde dk ("Plana göre ≈ X geridesiniz/öndesiniz.", "Plana uygun gidiyorsunuz.", "Plan süresi doldu; kalan maddelerle devam edebilirsiniz."), %ilerleme (<%10'da bir ondalık), "n / 241 madde bitirildi".
- Ana sayfa kartı: plansız → "Kitabı baştan sona okuyun" + süre düğmeleri ("günde ≈ X dk"); planlı → "N. gün / G", "Bugün ≈ X okuma kaldı"/"Bugünkü kısım tamam", ilerleme çubuğu (`role=progressbar`), "Bugünkü kısım" listesi (en çok 5 + "ve N madde daha"), "Okumaya Başlayın/Devam Edin/Sıradaki Maddeyi Okuyun", "Plan ayrıntıları"; hatim bitince "Elhamdülillah, kitabı baştan sona okudunuz" + "N. hatminiz tamamlandı…" + "Yeni Bir Hatime Başlayın".
- Çalışma Alanım: kart + "Süreyi değiştirin (bugünden başlar):" + açılır "Plan takvimi (G gün)" (her gün: tarih, madde aralığı, başlık; biten/bugün sınıfları) + "Planı sil" (onaylı) + "Baştan başla" (onaylı).
- Bildirimler: "Okuma planı kuruldu: G günde hatim, günde yaklaşık X.", "Yeni hatim başladı. Allahü teâlâ kolaylık versin.", "Bugünkü kısım tamamlandı. …" (günde bir kez, `ilmihal-hatim-kutlama`), hatim bitişi duası.
- Onay iletileri: "Okuma planı silinsin mi? Bitirdiğiniz maddeler kayıtlı kalır.", "Bitirilen maddeler sıfırlanıp yeni bir hatime başlansın mı?".

### 5.2 Günün maddesi / suâli — bölüm 2.1 ve 2.10. RSS bölüm 7.4.

### 5.3 Bilgi testi — 2.8. ### 5.4 Rehberler — 2.11. ### 5.5 Çalışma alanım — 2.12. ### 5.6 Tablolar, hükümler, âyet-hadîs, lügat, hâl tercemeleri — bölüm 2.

### 5.7 Duyuru bandı (5733-5757)
- `DUYURULAR` dizisi app.js içinde: `{id, baslik, metin, tarih, bitis, tur ('yeni'|'bilgi')}`. Şu an: `metin-2026-10` "Kitabın metni yenilendi" (bitiş 2026-12-31).
- Kapatılanlar `ilmihal-duyuru-kapatilan`; bitiş tarihinden sonra gösterilmez (UTC tarihle karşılaştırılır).

### 5.8 Geri bildirim (5622-5650)
- Kip: Tür (Öneri / İstek, Hata Bildirimi, İçerik Hatası), Mesajınız, E-posta (isteğe bağlı), "Gönder"/"İptal".
- Gönderim **sunucuya değil**: `mailto:info@ilmihal.org?subject=…&body=…` (sayfa adresi eklenir); ardından "E-posta uygulamanız açılıyor" bilgisi.

### 5.9 Paylaşım kartları
- Madde kartı 1200×630, alıntı kartı 1080×1350, günün suâli kartı 1080×1080 (bölüm 3.10-3.11, 2.10). Hepsi istemcide `canvas`.

### 5.10 PWA / çevrimdışı — bölüm 7.3.

### 5.11 Kapatılmış/ölü özellikler (yeniden yazımda karar gerekir)
- Açılış ekranı (`showSplash`, 4599-4608), 8 adımlı tanıtım turu (`showOnboarding`, 5653-5690), onboarding ipucu (5357-5379, `if (true) return`), podcast modu (`togglePodcastMode`, 5019-5032), AI arama, `cycleReadingMode` (3697-3720). Hiçbiri arayüzden çağrılmıyor.

---

## 6. Kalıcı kullanıcı verisi (ÇOK ÖNEMLİ)

- **sessionStorage: kullanılmıyor. IndexedDB: kullanılmıyor. Çerez: yok.** (app.js, okuma-plani.js, search-engine.js, index.html, alt uygulamalar grep'lendi.)
- Cache Storage (service worker): `ilmihal-kabuk-<SURUM>`, `ilmihal-veri-<SURUM>` (kullanıcı verisi değil; sürüm değişince silinir).
- localStorage anahtarı: **25**. Hepsi `ilmihal-` önekli. Çoğu yerde `try/catch` var; çıplak `setItem` yapılan yerler işaretli (Safari gizli mod riski).

| # | Anahtar | Değer biçimi (örnek) | Yazan | Okuyan | Not |
|---|---|---|---|---|---|
| 1 | `ilmihal-theme` | `"light"` \| `"sepia"` \| `"dark"` (düz metin) | 358 (çıplak), 3712, 3717 (ölü), 6329 | 342, 355, 6362 | yoksa `light` |
| 2 | `ilmihal-font-size` | `"1.15"` (düz metin; kayan nokta artığı olabilir: `"1.1500000000000001"`) | 3599 (çıplak) | 3594, 3603 | 0,8–1,6; yoksa JS 1.05 sayar, CSS 1.02rem kullanır (H-25) |
| 3 | `ilmihal-okuma-ayarlari` | `{"aralik":"2.3","hiza":"justify","lugat":false}` | 6266-6269 (`saveOkumaAyar`) | 6262-6265, 6357-6364 | `aralik` metin `"1.7"/"2"/"2.3"`; `lugat` boolean, yalnız `false` uygulanır |
| 4 | `ilmihal-sahife-acik` | `"1"` \| `"0"` | 1031, 1043 | 965-967 | ≥1100 px'te paneli kendiliğinden açar |
| 5 | `ilmihal-fihrist-gizli` | `"1"` \| `"0"` | 1097 (yalnız geniş ekranda) | 1112 (yükleme anında) | |
| 6 | `ilmihal-bookmarks` | `[{"key":"1/52","kisim":1,"madde_no":52,"baslik":"Abdest almak…"}]` **veya eski:** `["1/52"]` | 3613 (çıplak) | 3609, 5152, 5770 | eski düz metin öğeler yalnız Çalışma Alanım'da okunur (H-12) |
| 7 | `ilmihal-read` | `["1/1","1/2","2/16"]` (açılma sırası) | 3685 (çıplak) | 3676 (`getReadMaddes`) → fihrist, kısım çubukları, istatistik | "okundu" = **açıldı** |
| 8 | `ilmihal-read-history` | `["1/5","1/1"]` en çok 50, en yenisi sonda, tekrarsız | 5350 (çıplak) | 5223 | Çalışma Alanım "Son Okunanlar" |
| 9 | `ilmihal-son-okunan` | `{"kisim":1,"madde_no":52,"baslik":"…","zaman":1763371200000}` | 1202 | 5600 | "Kaldığınız yerden devam" |
| 10 | `ilmihal-notlar` | `{"1/52":[{"text":"…","date":"17.11.2026"}]}` | 4383, 4395 (çıplak), 5287 | 4355 (`getNotlar`), 5773 | `date` **tr-TR görüntü metni**, ISO değil; boş dizi silinir |
| 11 | `ilmihal-vurgulamalar` | `{"1/52":[{"text":"seçilen metin","renk":"#fff3b0"}]}` | 6107 (çıplak), 5298 | 5199, 5294, 5306, 6105, 6114 | konum yok, metin eşlemesi; renk 4 değerden biri |
| 12 | `ilmihal-audio-speed` | `"1.25"` (sayı metne çevrilmiş) | 4430 (çıplak) | 4421 | 0.5/0.75/1/1.25/1.5/2 |
| 13 | `ilmihal-audio-pos` | `{"kisim":1,"maddeNo":52,"pageIdx":0,"time":123.45}` | 4476 (çıplak) | 4481 | dikkat: `maddeNo` (camelCase) |
| 14 | `ilmihal-daily-goal` | `{"target":30,"today":"2026-11-17","minutes":12}` | 4562 (çıplak) | 4553, 5767 | `today` **UTC** tarihi (`toISOString`) |
| 15 | `ilmihal-quiz-puan` | `"80"` (en yüksek puan) | 3816 (çıplak) | 3815 | başka yerde okunmuyor |
| 16 | `ilmihal-rehber-progress` | `{"<rehberId>":["1/51","1/52"]}` | 5040 (çıplak) | 5037, 5246 | rehber id değerleri rehberler.js'ten (doğrulanmadı) |
| 17 | `ilmihal-duyuru-kapatilan` | `["metin-2026-10"]` | 5754 (çıplak) | 5740, 5752 | |
| 18 | `ilmihal-hatim` | `{"baslangic":"2026-11-17","gun":90,"hatimSayisi":0}` | op:20 (`yaz`) — planKur, yeniHatim | op:17 (`oku`) | `baslangic` **yerel** tarih; silinir: op:109 |
| 19 | `ilmihal-bitirilen` | `["1/1","1/2"]` (bu hatimde bitirilenler) | op:130, op:119 | op:50 | yeni hatimde `[]` |
| 20 | `ilmihal-okuma-yeri` | `{"1/60":0.42}` (0,03–0,97 arası oran, 3 ondalık) | op:286, op:133, op:120 | op:265, op:283 | 800 ms'de bir yazılır |
| 21 | `ilmihal-hatim-kutlama` | `"\"2026-11-17\""` (JSON ile yazılmış metin: tırnaklı) | op:144 | op:143 | günde bir kutlama |
| 22 | `ilmihal-debug` | `"1"` | — (elle) | 150 | geliştirici anahtarı |
| 23 | `ilmihal-build-id` | `"2026-10-19-r5"` | idx:901 | — | yazılıyor, okunmuyor |
| 24 | `ilmihal-onboarding-seen` | `"1"` | 5370, 5377 (ölü) | 5359 (ölü) | eski ziyaretçilerde bulunabilir |
| 25 | `ilmihal-onboarding-done` | `"1"` | 5683 (ölü) | 5654 (ölü) | eski ziyaretçilerde bulunabilir |

Dolaylı sarmalayıcılar: `getBookmarks/saveBookmarks` (3608-3614), `getReadMaddes` (3675), `markAsRead` (3680, 5341'de genişletilir), `getNotlar` (4354), `getDailyGoal/updateDailyGoal` (4552-4564), `getOkumaAyarlari/saveOkumaAyar` (6262-6269), `sahifeTercihiAcik` (965), okuma-plani `oku/yaz` (op:16-21), rehber `getRehberProgress/saveRehberProgress` (5036-5041).

Taşıma notları:
- Madde anahtarı her yerde `"kisim/madde_no"` metni (`"1/52"`), **tablolarda ise** `"K1/M52"` biçimi (veri tarafı).
- Yer imi, not, vurgu, okundu kayıtlarında madde numarası 2026 baskısının numarasıdır; numaralandırma değişirse bütün kayıtlar kayar.
- Notlar ve vurgular yalnız `.md` dışa aktarımıyla yedeklenebiliyor; **içe aktarım yok**.

---

## 7. Dış bağımlılıklar ve ağ istekleri

### 7.1 Yükleme sırası
- `<head>`: `style.css?v=…` (208 KB), 4 font önyüklemesi (Literata 400, Inter 400; latin + latin-ext). `@font-face` tanımları **iki yerde** aynı: style.css başı ve `fonts/fontlar.css` (25'er; 404.html ikincisini kullanır). Amiri, Inter 500-700, Literata 600/700/italik de var.
- `<body>` sonu: SW kaydı (window `load`'da), `/madde/` adresinde kısım metninin erken isteği, sonra **defer** sırayla: `data.js` (212 KB: `tocData`, `tablolarData`), `tanimlar.js` (100 KB: `tanimlarData`), `crossref.js` (79 KB: `crossRefData`), `search-engine.js` (26 KB), `arama-sozluk.js` (62 KB: `aramaSynonyms`, `soruMaddeMap`), `app.js` (289 KB), `okuma-plani.js` (18 KB). Toplam ~786 KB eager JS.
- Tembel (`loadScript`, 190-268; aynı dosyaya ikinci istek aynı sözü alır; **varsayılan zaman aşımı 5 sn**):
  - `sozluk-data.js` (3,1 MB) — açılıştan 1,5 sn (doğrudan adreste 5 sn) sonra boşta önyükleme; ayrıca sözlük sayfası, madde sözlük katmanı.
  - `sahislar.js` (804 KB) — şahıs sayfası/katmanı, madde "ilgili şahıslar", her tam arama.
  - `ozetler.js` (85 KB) — günün maddesi alıntısı, okuma planı.
  - `audio-map.js` (77 KB) — madde açılınca.
  - `ayet-hadis.js` (126 KB), `gunun-sorusu-data.js` (48 KB), `rehberler.js` (22 KB), `hukumler-data.js` (3,1 MB) — kendi sayfalarında.
  - `maddeler-data.js` (4,5 MB) — yalnız kısım metni alınamazsa veya madde meta'sı yoksa (30 sn sınır).
  - `texts/kisim1-3.json` (1,65 / 1,63 / 1,20 MB) — madde açılışında o kısım; **ilk tam aramada üçü birden**; `fetch`, 30 sn `AbortController`.
  - PDF.js (`/vendor/pdfjs-5.4.624/pdf.min.mjs`, `pdf.worker.min.mjs`) — sahîfe paneli ilk açılışta, dinamik `import`.

### 7.2 Sürüm damgası
- `2026-10-19-r5` şu yerlerde elle eşitlenir: `app.js:4` `ASSET_VERSION`; `index.html` 10 yer (`style.css?v=`, 7 script `?v=`, inline `AV` 915, `ilmihal-build-id` 901); `sw.js:15` `SURUM`. Tembel yüklenen her dosya `vQuery()` ile aynı damgayı alır. `pdf.*.mjs` damgasız (klasör adında sürüm var).

### 7.3 Service worker (`sw.js`)
- Kurulumda kabuk önbelleği: `/`, damgalı css + 7 script, `manifest.json`, `favicon.svg`, `gorsel/{desen,madalyon,ayrac,kapak}.svg`, `icon-192.png`, 4 font. Bir dosya hata verse de kurulum sürer; `skipWaiting` + `clients.claim`; eski sürüm önbellekleri silinir.
- Strateji: navigasyon **önce ağ**, düşerse önbellekteki sayfa ya da `/`; `?v=` damgalı ve font/png/svg/ico **önce önbellek**; `texts/*.json` ve veri dosyaları (`-data.js`, audio-map, ayet-hadis, sahislar, rehberler, sozluk-data, gunun-sorusu) **bayat-iken-tazele**; geri kalan önce ağ. Çapraz kaynak ve `/kitap/` (Range PDF) dokunulmaz.
- Çevrimdışı ses ve PDF yok (dış kaynak).

### 7.4 Sunucu tarafı
- `api/rss.js` (Edge): Türkiye saatine (UTC+3 sabit) göre son 30 gün; madde listesi **dosyanın içine kopyalanmış** 241 satır (data.js `tocData` ile elle eşit tutulmalı); `public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`.
- `vercel.json`: güvenlik başlıkları (HSTS preload, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy `geolocation=(self)`), **CSP**: `script-src 'self' 'unsafe-inline'`, `media-src 'self' https://www.hakikatkitabevi.net`, `connect-src 'self' https:`, `img-src 'self' data: blob: https:`; JS/CSS `max-age=0, must-revalidate`; vendor ve fontlar 1 yıl immutable; `sw.js` no-store.

### 7.5 Dış alan adları
- `www.hakikatkitabevi.net`: PDF yeni sekme bağlantıları (`downloads/001.pdf#page=N`), ses dosyaları (`<audio>`), ve Vercel vekiliyle PDF.js.
- `raufenc.com/api/ilmihal-search/`: kodda var, kapalı.
- `mailto:info@ilmihal.org`.
- Analitik/izleme: **yok** (Gizlilik metniyle tutarlı).

### 7.6 Yapılandırılmış veri ve paylaşım meta
- `index.html` sabit JSON-LD: WebSite (SearchAction `/arama/{search_term_string}`), Book, EducationalOrganization (`sameAs` github.com/raufenc/ilmihal).
- OG/Twitter sabitleri, `og-image.png` 1200×630, RSS `<link rel=alternate>`, `manifest.json` (kısayollar: Arama, Dinî Lügat, Fıkhî Hükümler; ikonlar svg/192/512/180; `display: standalone`).

---

## 8. Arayüz metinleri

### 8.1 Yazım tercihleri (kodda gözlenen)
- Kitap adı: **Se'âdet-i Ebediyye** (bazı yerlerde kıvrık kesme ’). Alt başlık "İnteraktif İlmihâl", "Tam İlmihâl".
- **sahîfe** (PDF paneli, fihrist, şekil/cedvel notları) ama birçok yerde **"Sayfa N"** (madde başlığı, arama sonuçları, kartlar, âyet indeksi) — karışık.
- **hâl tercemesi / Hâl Tercemeleri**; "Dinî Lügat"; "Fevâid"; "Günün Suâli", "SUÂL", "Cevâbı için maddeyi oku →"; "Âyet-i Kerîme", "Hadîs-i Şerîf", "meâlen"; "Mektûbât", "Mektûbât-ı Ma'sûmiyye", "mektûb", "cild".
- **Nemâz/Namaz**: arayüzde **"Namaz"** (sekme, konu düğmesi, quiz, arama etiketleri, Namaz Vakitleri); kitap başlıklarında "Nemâz". PREMIUM_PLAN'da "TÜM arayüz metni Nemâz" kararı yazılı, **uygulanmamış**.
- Hürmet ifadeleri: "Peygamber Efendimizin (sallallahü aleyhi ve sellem)", "Allahü teâlâ", "hazretleri", "Hüseyn Hilmi Işık hazretlerinin". Dualar: "Allahü teâlâ okuduklarınızla amel etmeyi nasîb eylesin.", "Allahü teâlâ kolaylık versin.", "Allahü teâlâ ilminizi artırsın.", "Elhamdülillah, …", "Kusurlar bizden, istifade Allahü teâlâdandır.", "Maksat, bu kıymetli esere hizmet etmektir.".
- Arama sonucu başlıklarında emoji: 📖 "İlgili Sözlük Terimleri", 👤 "İlgili Şahıslar", 📊 "İlgili Tablolar" (3233, 3243, 3253).

### 8.2 Metin listesi (görünüm görünüm)
- **Menü/başlık**: Ana Sayfa · İçindekiler · Fevâid · Arama · Hakkında · tema "Gündüz/Sepya/Gece" (title "Tema: …") · "İçeriğe Geç" (atlama bağlantısı) · "Menü".
- **Ana sayfa**: "Kitapta ve lügatte arayın…", "Enter", "Okumaya Başlayın", "Kaldığınız Yerden Devam Edin", "Son okunan: … · az önce / N dk önce / N saat önce / N gün önce", "Günün Maddesi", "Maddeyi Okuyun", "Kitabın Üç Kısmı", "Birinci/İkinci/Üçüncü Kısım", "N Madde", "N / M madde okundu", "Fevâid", "Kitabı Derinlemesine Keşfedin", "Kitabın içinden derlenen indeksler, tablolar ve rehberler. Her kayıt sizi kitaptaki yerine götürür.", kart başlık/açıklamaları (idx:213-259), "Konulara Hızlı Erişim" + 10 konu (İman ve İtikat, Temizlik, Namaz, Oruç, Zekât ve Kurban, Hac, Ticaret, Aile Hukuku, Ahlâk, Cenaze ve Miras), "Silsile-i Aliyye Atlası", "Haritayı Açın →", "35 Halka", "Namaz Vakitleri", "Vakitleri Görün →".
- **İçindekiler**: "Fihrist", "İçindekiler", "Tümü", "I./II./III. Kısım", "Başlıklarda ara…", "Veriler yükleniyor...", "N madde bulundu", "<konu> konusunda N madde", "Tüm fihrist", "Sonuç bulunamadı.", "N madde · M okundu", "Sahîfe" (gizli).
- **Okuyucu**: araç ipuçları (Kısmın fihristi, Sesli dinle, Kitabın aslı (PDF sahîfesi), Okuma ayarları, Yer imi ekle / Yer imini kaldır, Paylaş, Daha fazla, Maddeyi kapat), menü (Yazdır, Odak modu / Odak modundan çık, Sunum modu, Yan yana okuma), Aa paneli (Yazı Boyutu, A−, A+, Satır Aralığı: Sık/Normal/Ferah, Hizalama: Sol/İki Yana, Tema: Açık/Sepya/Koyu, Lügat Çizgileri), breadcrumb, "Paylaş", "Görsel Kart", "Bu maddeyi bitirdim", "Bitirildi", "Okuma planınıza işlendi./işlenir.", "Bitirdiğiniz maddeler kaydedilir.", "Okuma planı yapın", "Bu Maddede Geçen Şahıslar", "Şahıs bağlantıları hazırlanıyor...", "İlgili Tablo ve Diyagramlar", "İlgili Maddeler", "Kitapta atıf / Bu maddeye atıf yapan / Yakın konu", "Notlarım", "Bu madde hakkında not yazın...", "Kaydet", "Henüz not yok.", "← Önceki Madde", "Sonraki Madde →", "Madde bulunamadı", "Kapat", "Metin yüklenemedi", "Madde metni zamanında yüklenemedi. Tekrar deneyin veya sayfayı yenileyin.", "Madde metni hazırlandı fakat ekrana işlenirken hata oluştu.", "Tekrar Dene", "(Metin yüklenemedi)", "Yükleniyor" (iskelet), seçim çubuğu "Kopyala / Vurgula / Kart", "Vurguyu kaldır", sözlük "Ayrıntılar →", "Misal:", "Bkz.", "Lügatte aç", "Kelimenin anlamı", sunum "A+ / A− / ×", yan yana "Yan Yana Okuma", "Madde ara...", "Değiştir", "(Metin bulunamadı)", şekil/cedvel notları.
- **Kitabın Aslı**: "Kitabın Aslı", "Önceki sahîfe", "Sahîfe numarası", "/ 1248", "Sonraki sahîfe", "Büyüt / sığdır", "PDF'i yeni sekmede aç", "Kitabın aslını kapat", "Sahîfe N yükleniyor…", "Sahîfe yüklenemedi. PDF’i yeni sekmede açın.", "Hakîkat Kitâbevi, Tam İlmihâl Se’âdet-i Ebediyye, 2026 baskısı".
- **Ses**: "Önceki sayfa", "10 saniye geri" (-10), "Oynat veya duraklat", "+10", "Sonraki sayfa", "Hız", "1x", "Uyku zamanlayıcı", "N dk sonra duracak", "15dk", "Sürekli dinleme: AÇIK/KAPALI", "Kayıt n/N".
- **Hâl tercemeleri**: "Hâl Tercemeleri", "Kitabın sonundaki hâl tercemelerinden; Se’âdet-i Ebediyye'de adı geçen 1020 kişi.", "İsim veya hâl tercemesinde arayın…", kategori çipleri, "N kişi", "N maddede geçer", "Şahıs verileri yükleniyor...", "Şahıs verileri yüklenemedi.", "Şahıs bulunamadı.", "Hâl Tercemesi", "Geçtiği Maddeler", "Kaynak:".
- **Lügat**: "Dinî Lügat", "Kitapta geçen 9.863 kelimenin Osmanlıca yazılışı, aslı ve mânâsı.", "Kelime veya mânâ arayın…", "Tümü", köken adları (Arapça, Farsça, Türkçe, Fransızca, Yunanca, İtalyanca, Latince), "Sözlük yükleniyor...", "Kelime bulunamadı.", sayfalama etiketleri (İlk/Önceki/Sonraki/Son sayfa), "N kelime", "· Sayfa x/y".
- **Fevâid / Tablolar**: "← Fevâid", "Kategorik", "Kitap Sırası", "Tablo ara...", kategori adları, "N tablo", "N tablo bulundu", "Tablo bulunamadı.", "Tablolar yükleniyor...", "Kitaptan:", "Tablo sayfasını aç", "← Tablolar", "← Önceki", "Sonraki →", "Tablo Sayfasına Git →", tip adları (Tablo, Liste, İki Liste, Akış, Ağaç), "Genel", "Terim veya tanımda ara…", "Terim | Kitaptaki Tanım | S.", "N tanım gösteriliyor", "Tanımlar yükleniyor...".
- **Arama**: "Kitapta Arama", "241 maddenin tam metninde, sözlükte ve şahıslarda arayın", "Örn: Abdest nasıl alınır? veya namaz, zekât...", "Ara", etiketler, durum metinleri, "Tam Eşleşme", "(Başlıkta eşleşme)", "Bunu mu demek istediniz?", "Tümü/Maddeler/Sözlük/Şahıslar/Tablolar (n)", "Sonuç bulunamadı.", "İlgili konular:", "Farklı kelimeler veya Osmanlıca yazım deneyin: nemâz, gusl, oruc", hero "Tüm sonuçları gör →".
- **Bilgi testi**: "Bilgi Testi", "Se'âdet-i Ebediyye'den sorularla kendinizi sınayın.", "Konu Seçin", 7 konu, "Soru n", "Kitaptaki yerini oku", "Sonraki Soruya Geç →", "Sonuçları Gör →", "N/100", "d/N doğru cevap", "Yeni Test".
- **Âyet-hadîs**: sekmeler, "İndekste ara...", "Yükleniyor...", "Âyet ve hadîs verileri yükleniyor/yüklenemedi.", "N âyet-i kerîme/hadîs-i şerîf bulundu", "Maddenin bu yerine git →", "İlk 50 sonuç gösteriliyor. Aramayı daraltın.".
- **Günün suâli**: "Günün Suâli", "Her gün kitaptan bir suâl. Cevabı için ilgili maddeyi okuyunuz.", "Önceki Günler", "Paylaş", "Görsel Kart Oluştur", "Veri yükleniyor/yüklenemedi.", "Panoya kopyalandı.".
- **Rehberler**: "Konuya Göre Rehberler", "Adım adım öğrenme yolları. Bir konuyu baştan sona takip edin.", "N bölüm, M madde", "← Rehberler", "n/N adım tamamlandı", "Tamamlandı olarak işaretle" / "Okundu olarak işaretle" (aria; anlamları ters, H-28), tamamlama duası, "Rehberler yükleniyor/yüklenemedi.".
- **Çalışma Alanım**: "Notlarınız, yer imleriniz ve okuma geçmişiniz tek bir yerde.", "Notları ve Vurguları İndir (.md)", "Yer İmleri (n)", "Henüz yer imi eklenmemiş. Bir madde açıp yıldız ikonuna tıklayarak ekleyebilirsiniz.", "Notlarım (n)", "Henüz not alınmamış. Bir madde açıp "Notlarım" bölümünden not ekleyebilirsiniz.", "Vurgularım (n)", "Henüz vurgu yapılmamış. Madde okurken metin seçip "Vurgula" diyebilirsiniz.", "Son Okunanlar (n)", "Henüz madde okumadınız.", "Rehber İlerlemesi", "Sil", istatistik etiketleri ("Açılan", "dk bugün", "yer imi", "not", "Kısım İlerlemesi"), okuma planı metinleri (5.1).
- **Hükümler**: "Fıkhî Hükümler", açıklama, 8 sekme, "Açık Hükümler", "Tüm Geçişler", "Hüküm ara...", "Yükleniyor…", "Veri yüklenemedi.", "Bağlam", sonuç satırı.
- **Diğer**: duyuru "Yeni"/"Bilgi", "Kapat"; geri bildirim (5.8); kısayol penceresi "Klavye Kısayolları" + satırlar + "Kapat"; kutlama "Bugünkü okuma hedefiniz tamam", "Devam Et"; `alert`/`confirm` iletileri (2.8, 2.12, 5.1).

---

## 9. Erişilebilirlik ve klavye

- Var: `lang="tr"`, atlama bağlantısı (`#page-anasayfa` — sayfa ana sayfa değilken yanlış hedef), tek `<main>`, `aria-current="page"` menüde, okuyucu `role=dialog aria-modal aria-labelledby=okuyucu-baslik-ad`, `aria-hidden` geçişi, araç düğmelerinde `aria-label`/`aria-expanded`/`aria-controls`, kısım sekmeleri ve harf çubukları `aria-pressed`, Aa anahtarı `role=switch aria-checked`, taşma menüsü `role=menu/menuitem` (ok tuşu desteği yok), bildirim `role=status aria-live=polite`, arama sonuçları `aria-live=polite`, okuma planı ilerlemesi `role=progressbar`, iskelet `role=status`, sözlük kutusu `role=dialog`, PDF tuvali `role=img` + sahîfeye göre `aria-label`, `prefers-reduced-motion` (style.css 4893; JS tarafında geçiş animasyonları ve kapanış animasyonu kapatılır), `:focus-visible` çerçevesi.
- Odak: okuyucu ve şahıs katmanında Tab tuzağı (1587-1604); açılışta katmana odak verilmez, kapanınca önceki öğeye odak **iade edilmez**; tablo kipi, sözlük kipi, sunum, geri bildirim, kısayol penceresinde odak yönetimi yok.
- Eksikler (PREMIUM_PLAN Faz 1/8'den kodda olmayanlar, doğrulandı): `.zor-kelime` klavyeyle erişilemez (rol/tabindex yok, yalnız fare üstü/tık); kart/`div onclick` öğeleri (arama sonucu, tablo başlığı, hüküm kartı, ah-item, gb-onceki, rehber kartı, vurgu kartı) klavyeyle açılamaz; hero arama combobox rolleri yok (öğeler `role=option` ama `listbox` yok); mobil menü düğmesinde `aria-expanded` yok; ses ilerleme çubuğu kaydırıcı değil; duyuru bandı canlı bölge değil; `#sahis-detay` ve `#tablo-modal` `aria-labelledby` gövdenin tamamını gösterir.
- Kısayollar: bölüm 3.18.

---

## 10. Kodda görülen hatalar ve kırılganlıklar

**Gezinti / adres**
- **H-1 · Geri tuşu tuzağı (Tablolar).** `openFevaidSection('tablolar')` her çağrıda `updateUrl` yapar (2248); `openTabloDetay` da (2492). `handleRoute` popstate ile bunları çağırınca (84, 80, 89, 93) yeni kayıt **pushlanır**; `/fevaid/tablolar` ve tablo detayında Geri, kullanıcıyı aynı adrese hapseder ve ileri geçmişi siler.
- **H-2 · Geri tuşu açık katmanları kapatmaz.** `handleRoute` madde/şahıs dışı bir yola dönünce `closeMadde`/`closeSahis` çağırmaz (97-111); URL `/icerik` olur ama okuyucu açık ve `body` kilitli kalır.
- **H-3 · Görünüm geçişi yarışı.** `navigateTo` geçişi bir sonraki karede kurar (469-477; yorum 467-468 "beklenmeli" der) ama `goToTabloDetay` (530-533), `goToSahisDetay` (525-528), `goToRehberDetay` (535-538), `goToSozlukSearch` (517-523) ve `loadGununMaddesi` (3572) beklemez. View Transitions destekleyen tarayıcılarda geç gelen `_navigateToCore('fevaid')` açılan tablo detayını gizler (494-498) ve URL'yi `/fevaid`'e çevirir; şahısta URL `/sahislar`'a döner. (Chromium'da beklenir; doğrulanmadı.)
- **H-4 · Esc her yerde geçmiş kaydı ekler ve üstteki pencereyi değil okuyucuyu kapatır.** 1561-1580'deki dinleyici giriş alanlarını ayırmaz ve son durumda koşulsuz `closeMadde` çağırır → okuyucu kapalıyken bile `updateHash` ile yeni kayıt pushlanır. Sunum modu (`_sunumEsc`), sözlük kipi ve kısayol penceresi açıkken Esc arkadaki okuyucuyu da kapatır.
- **H-5 · Kapanışta yanlış adres.** `closeSahis` okuyucu kapalıysa her zaman `/sahislar` yazar (2211) — şahıs ana sayfadan/aramadan açıldıysa adres sayfayla uyuşmaz; okuyucu açıkken kapatılırsa adres `/sahis/slug` kalır. `closeMadde` meta'yı geri almaz (H-21).

**Arama**
- **H-6 · Hero aramada lügat sonucu "undefined" arar.** `selectItem` sözlük için `item.data.t` kullanır (3448); bu alan yalnız `tanimlarData` kayıtlarında var, `sozlukData` kayıtlarında (`k`) yok → lügat kutusuna "undefined" yazılır.
- **H-7 · Vurgu konumları kayar.** `normalizeSearch` noktalama siler ve boşluk sıkıştırır (2692-2696) ama 2684'teki yorum "1'e 1, konum korunur" der. `highlightAndScroll` normal metnin konumlarını özgün düğüm metnine uygular (1436-1473); `findPassage` da aynı (se:645-673) → vurgu yanlış harflere düşebilir. `highlightSnippet` ise şapkasız varyantı şapkalı metinde bulamaz ("nemaz" ≠ "Nemâz"; 3021) — PREMIUM_PLAN Faz 5.2, **hâlâ duruyor**.
- **H-8 · Lookbehind regex hâlâ var.** `(?<!y)` (2845), `(?<=…)` (3021), `(?<=[.!?])` (se:596). PREMIUM_PLAN "Faz 0: eski Safari'de parse çökmesi; bir daha asla ekleme" der. 2845 ve se:596 regex literali olduğundan desteklemeyen motorda dosyanın tamamı ayrıştırılamaz (Safari < 16.4; doğrulanmadı).
- Tablo sonuçlarının alt yazısı `t.kaynak_text` okur (se:208); alan adı `kaynak_metin` → hep boş.
- Her tam aramada 241 maddenin hepsi için `findPassage` çalışır (se:536) ve ilk aramada 4,5 MB metin iner; sözlük/şahıs verisi gelince `rebuild` normal külliyatı da atar (se:111-112).

**Okuyucu / ses / veri**
- **H-9 · Ses konumu geri yükleme yanlış kayda uygulanır.** `restoreAudioPosition` (4479-4495) kaydı yükleyip `loadeddata` dinleyicisi bırakır; kullanıcı ▶'e basınca `toggleAudio` `loadAudioPage(0)` yapar (4203), kalan dinleyici **0. kayda** eski saniyeyi uygular.
- **H-10 · Hız düğmesi yanlış gösterir.** `#audio-speed-btn` yalnız `cycleAudioSpeed`'de güncellenir (4428); kayıtlı hız 1,5 iken düğme "1x" yazar.
- `audio.src = ''` (4193, 4334, 4412) boş kaynağa istek tetikleyebilir; `sesKaydiBitti` `audioNav(1)` sonrası ikinci kez `playAudio` (4321) — PREMIUM_PLAN Faz 5.5, **hâlâ duruyor**.
- **H-11 · Kısayollar ölü.** `j/k/+/-` tanımsız `sonrakiMadde`, `oncekiMadde`, `artirFont`, `azaltFont`'u çağırır (5724-5727; hiçbir dosyada yok). `/` olmayan `#search-input`'a odaklanır (5718). Pencerede yazan `F` işlenmez.
- **H-12 · Eski yer imleri kaldırılamaz.** `toggleBookmark`/`updateBookmarkBtn` `b.key` arar (3622, 3640); eski düz metin kayıtlar ("1/52") bulunmaz → yıldız boş görünür, basınca aynı madde nesne olarak ikinci kez eklenir.
- **H-13 · Günlük hedef UTC'ye göre gün değiştirir.** `toISOString().slice(0,10)` (4559, 5768) Türkiye'de günü 03:00'te çevirir; `goalCelebrated` sayfa ömrü boyunca sıfırlanmaz (4566). Duyuru bitişi de UTC (5741).
- **H-14 · Sözlük sayfası "yükleniyor"da takılabilir.** `loadSozluk` veri yokken de `sozlukLoaded = true` yapar (1965); `goToSozlukSearch` veriden önce `input` olayı tetiklerse sonra `_navigateToCore` yüklemeyi başlatmaz (504). (Arama sayfasındaki `tanimlarData` kökenli lügat etiketiyle tetiklenebilir; doğrulanmadı.)
- **H-15 · 5 sn zaman aşımı büyük dosyalara dar.** `loadScript` varsayılanı 5000 ms (192); `sozluk-data.js` ve `hukumler-data.js` 3,1 MB, `sahislar.js` 0,8 MB. Yavaş bağlantıda istek düşer (PREMIUM_PLAN Faz 6.1 — kısım metni için düzeltilmiş, bunlar için **hâlâ duruyor**).
- **H-16 · Olası tıklamalı XSS (yansıtılan).** Kullanıcı sorgusu `escapeSearchQ` (3728-3731) ile yalnız `\ ' " <` kaçışlanıp `onclick="openMadde(…,'<sorgu>')"` içine konur (3205, 3223). `&` kaçışlanmadığından `&#39;` HTML çözümlemesinde `'`'ya döner ve dizgeden çıkar. `/arama/` adresiyle hazırlanmış sorgu, sonuç kartına tıklanınca kod çalıştırabilir; CSP `'unsafe-inline'` buna izin verir. (Kod okumasıyla; tarayıcıda denenmedi.) Yeni sitede olay işleyicisine veri gömülmemeli.
- **H-17 · Vurgu kaybı.** `kaydetVurgulamalar` maddenin kaydını DOM'daki işaretlerle **değiştirir** (6100-6107); `yukleVurgulamalar` bir vurguyu yerleştiremezse (metin değişti, aynı metin zaten işaretli, sözlük katmanı yeniden yazdı) yeni bir vurgu eklendiğinde eskisi sessizce silinir. Aynı metin iki yerde geçerse yalnız ilki işaretlenir.
- **H-18 · Seçim çubuğu dokunmatikte açılmaz.** Yalnız `mouseup` dinlenir (5904); PREMIUM_PLAN Faz 3.3, **hâlâ duruyor** (doğrulanmadı).
- **H-19 · Çift zenginleştirme.** `MutationObserver` (6226-6242) ve `enhanceMaddeBodyWithSozluk` (1278-1293) ikisi de çapraz bağlantı + vurgu uygular; `data-zengin` bayrağı sözlük yeniden yazımında aynı öğede kalır. PREMIUM_PLAN Faz 5.4, **kısmen duruyor**.
- **H-20 · Tema geç uygulanır.** `initDarkMode` deferred `app.js`'te (375); `<head>`'de erken tema betiği yok → koyu/sepya kullanıcıda açık tema anlık parlar.
- **H-21 · Madde kapanınca başlık/meta kalır.** `closeMadde` (1532-1559) SEO meta'yı sayfanınkine döndürmez; `updateOgMeta` `document.title`'ı da ayrıca değiştirir (3930).
- **H-22 · "s. N" bağlantıları yanıltıcı.** `sayfaLink` `title="Kitabın bu sayfasını aç"` der ama sahîfeyi içeren maddeyi açar (378-381, 449-456); tablo/hüküm kartlarında.
- **H-23 · Vurgulu PNG/kart ve pano işlemlerinde hata yakalanmaz.** `navigator.clipboard.writeText` `.catch`'siz (4698, 4827, 5942) — PREMIUM_PLAN Faz 5.5, **hâlâ duruyor**.
- **H-24 · Çıplak `localStorage.setItem`.** Tema (358), yazı boyutu (3599), yer imi (3613), okundu (3685), not (4383, 4395), ses (4430, 4476), hedef (4562), quiz (3816), rehber (5040), okuma geçmişi (5350), duyuru (5754), vurgu (6107) — kota/gizli mod hatası olayı yarıda keser. PREMIUM_PLAN Faz 4.4, **hâlâ duruyor**.
- **H-25 · Yazı boyutu varsayılanı tutarsız.** JS 1.05 sayar ve "%105" gösterir (3594, 6355), anahtar yoksa CSS `1.02rem` uygular (style.css 896, 3111); ilk A+ basışında 1.15'e sıçrar.
- **H-26 · Kısım toplamları sabit.** İstatistikte 98/73/70 (5786-5788), toplam yedeği 241 (5764), ana sayfa kart metinleri; `kisimIlerlemeGuncelle` toplamı kart metninden ayrıştırır (6380). Sayılar `pageSeoMap`, `index.html`, `manifest.json`'da elle yazılı (241, 9.863, 1020, 193, 449, 2.864, 128, 155, 510, 642, 35).
- **H-27 · `--card-bg` tanımsız.** style.css 1173, 3834, 3847, 4112, 4114 tanımsız değişken kullanır (koyu/sepyada zemin kaybolur). PREMIUM_PLAN Faz 2.1, **hâlâ duruyor**.
- **H-28 · Rehber adım düğmesinin `aria-label`'ı ters.** Tamamlanmış adımda "Tamamlandı olarak işaretle", tamamlanmamışta "Okundu olarak işaretle" (5098).
- `loadGununMaddesi` yılın gününü saat dahil hesaplar (3559) — RSS (`api/rss.js:259-261`) ile aynı sonucu verir ama RSS listesi data.js'ten **elle kopyalanmış**; biri değişirse günün maddesi ve RSS ayrışır.
- `routingSilent` 50 ms penceresinde gelen gerçek `popstate` yutulur (17, 48).
- `/arama/` adresine yazılan sorgu `toLowerCase()` ile (yerel duyarsız) küçültülür (3084): "İ" → "i̇".

**DENETIM_RAPORU_2026-04 bulgularının durumu (kodla doğrulandı)**
- Düzelmiş: dinamik meta (A seçeneği, istemci tarafı), tek `<main>`, CSP eklendi, kamikaze SW yerine sürümlü SW, `console.log` → `debugLog`, BreadcrumbList, og:image/twitter meta, RSS yol biçimi (artık Edge fonksiyonu).
- **Hâlâ duruyor**: sunucu tarafı meta/prerender yok (JS çalıştırmayan tarayıcı ve paylaşım botları her madde adresinde ana sayfa meta'sını görür); `trailingSlash`/`cleanUrls` yok (`/sozluk/` 404); ~786 KB eager JS (crossref.js, tanimlar.js, arama-sozluk.js hâlâ eager); paylaşım düğmeleri yalnız Web Share/pano (WhatsApp vb. bağlantı yok); geri bildirim yalnız `mailto`.
- PREMIUM_PLAN'dan ayrıca **hâlâ duranlar**: Faz 1 erişilebilirlik işleri (zor-kelime klavye, kart Enter/Space, modal odak iadesi — kodda yok), Faz 4.1 `viewport-fit=cover` yok (idx:6), Faz 6.3 damgalı JS/CSS'e uzun önbellek yok, Faz 6.5 crossref.js eager, Faz 7.1 şahıs sayfaları sitemap'te yok (sitemap 256 URL, 0 `/sahis/`), Faz 7.2 Person JSON-LD yok, Faz 7.5 `updateDynamicSchema('article')` hiç çağrılmıyor, Faz 9.6 `.madde-text` iki tanım (style.css 896 ve 3111), Faz 11.7 `@font-face` çift kopya ve kısım etiket sözlüğü 10+ yerde tekrar (`KISIM_ADLARI` 548'e karşın 1205, 1214, 2154, 3095, 3569, 4801, 4822, 5277, 6010…), arama başlıklarında emoji.
- PREMIUM_PLAN'dan düzelmiş: Faz 5.1 (olay delegasyonu ile sıra sorunu kalktı), 5.3 (çapraz bağlantı metin düğümlerinde), 7.3 (og:url yol biçimi), 11.6 (tek SW kaydı, build-id güncel); kısım metni zaman aşımı 30 sn.

---

## 11. Ölü / atıl kısımlar

- İşlevler: `sayfaLinkPdf` (405), `showPdfPage` (458), `scoreMadde` + `_avgDocLen` (2926-2967), `findBestSnippet` (2970-3005), `cycleReadingMode` + `readingModes` (3697-3720), `showSplash` (4599), `showOnboarding` (5653), onboarding IIFE (5357-5379), `togglePodcastMode` (5019), `_origOpenMadde2` + `readingInterval` (4585-4586), `_origOpenMaddeForSchema` (4968), `_origRenderRehberDetay` (5060), `updateDynamicSchema('article')` dalı (4991-5000), `kategoriyiUygula` içindeki `categoryMap` (666-677), `hydrateMaddeIliskiliMaddeler`'in `baslik` parametresi, `renderAyetHadis(filterText)` parametresi, `extractSearchHint` yalnız quiz'de.
- Kapalı özellik kodu: AI arama (`AI_ARAMA_ACIK`, 3161-3165, 3297-3328; se:678-747), hero `hasAI`/`passage` dalı (3376, 3384), `MADDE_SAFE_MODE` dalları (140; `false`).
- Erişilemeyen öğeler: `#quiz-skor-ozet` (hiç doldurulmuyor), `ilmihal-quiz-puan` (yazılıp okunmuyor), `ilmihal-build-id` (okunmuyor), `ilmihal-onboarding-*`, `.istatistik-grid`/`.soru-input-wrap` vb. CSS (eski "İstatistiklerim" ve soru sayfaları; idx:668 boş yorum).
- Veri: `ayet_hadis_data.json` (103 KB, hiçbir kod okumuyor; `.vercelignore` ile yayına çıkmıyor), `maddeler-data.js` (4,5 MB, yalnız yedek), `tablolarData` içindeki `kitabin_tanimlari` (listelerden dışlanıyor, `renderTanimlar`'ın `'tanimlar'` tipi yalnız oradan), `og-image.html` (geliştirme aracı).
- Tekrar eden kod: üç canvas kart işlevi ayrı ayrı sarma/indirme (4702, 4758, 5945); `tipIcons` 4 kez (1519, 2329, 2378, 2435); `levenshtein` iki kopya (3028, se:223).

---

## 12. Doğrulanmamış / veri ajanına bırakılanlar
- Rehber `id` değerleri, `hukumlerData` alanlarının tam listesi, `audioMap` yol biçimi, `crossRefData` neden türlerinin tamamı, `soruMaddeMap` alanları (`cevapOzet` dahil) — app.js'in okuduğu alanlar yazıldı; veri dosyaları açılmadı.
- Okuyucuda âyet/hadîs metninin özel biçimi metin verisinin içinde olabilir.
- H-3, H-8, H-14, H-16, H-18 tarayıcıda denenmedi.
