# ilmihal.org — Veri Dosyaları Envanteri ve Şeması

Hazırlanma: 17 Kasım 2026, `yeni-site` dalı çalışma kopyası üzerinden.
Amaç: Site baştan yazılırken veri dosyaları **aynen** kullanılacak. Bu belge, yeni kodu yazanın
veriyi yalnız buna bakarak doğru okuyabilmesi içindir.

**Usul.** Bütün sayılar `tools/yeni-site/incele/` altındaki betiklerle çıkarıldı; hiçbir veri dosyası
değiştirilmedi. Veri dosyaları tarayıcıyı taklit eden bir `vm` bağlamında çalıştırılıp tanımladıkları
küreseller yakalandı (`yukle.js`). Betikle doğrulanamayan her şey **"doğrulanmadı"** diye işaretlidir.
Dinî metnin içeriğine dair hiçbir yorum yoktur; "tutarsızlık" denen her şey yapısal/teknik farktır.

Betikler (yeniden çalıştırmak için önce `export PATH="/Users/raufenc/pinokio/bin/miniconda/bin:$PATH"`):

| Betik | Ne yapar | Çıktısı |
|---|---|---|
| `incele/yukle.js` | Bir veri dosyasını çalıştırıp küresellerini döndürür (ortak modül) | — |
| `incele/sema.js <dosya…>` | Alan birleşimi, tür, boş sayısı, örnek kayıt | `incele/sema-cikti.txt` |
| `incele/denetim.js` | Bütün bağ/kimlik/metin/kodlama denetimleri | `incele/denetim-cikti.txt` |
| `incele/ek-denetim.js` | Ek ayrıntılar (parantez, hüküm farkları vb.) | `incele/ek-denetim-cikti.txt` |
| `incele/ayet.js` | `ayet-hadis.js` ile `ayet_hadis_data.json` karşılaştırması | konsol |

---

## 0. Bir bakışta

| Dosya | Küresel değişken (tür) | Kayıt | Ham boyut | gzip -9 | Yükleme (bugünkü sitede) |
|---|---|---|---|---|---|
| `data.js` | `tocData` (Array), `tablolarData` (Array) | 241 / 130 | 211 920 | 56 146 | İlk açılış (`defer`) |
| `maddeler-data.js` | `maddelerData` (Array) | 241 | 4 536 742 | 1 466 808 | Yalnız yedek (texts başarısızsa) |
| `texts/kisim1.json` | — (JSON nesnesi) | 98 | 1 653 914 | 525 345 | Madde açılınca, kısım kısım |
| `texts/kisim2.json` | — (JSON nesnesi) | 73 | 1 633 998 | 540 578 | 〃 |
| `texts/kisim3.json` | — (JSON nesnesi) | 70 | 1 201 998 | 390 246 | 〃 |
| `sozluk-data.js` | `sozlukData` (Array) | 9 863 | 3 182 984 | 1 091 774 | Açılıştan 1,5–5 sn sonra arka planda (!) |
| `arama-sozluk.js` | `aramaSynonyms` (Object), `soruMaddeMap` (Array) | 392 / 229 | 62 569 | 16 817 | İlk açılış |
| `sahislar.js` | `sahislarData` (Array) | 1 024 | 804 385 | 240 029 | Şahıs sayfası / madde içi ilgili şahıslar |
| `hukumler-data.js` | `window.hukumlerData` (Array) | 7 158 | 3 110 110 | 574 400 | `/hukumler` sayfası |
| `ayet-hadis.js` | `window.ayetHadisData` (Object: 2 dizi) | 193 + 449 | 126 342 | 35 014 | `/ayet-hadis` sayfası |
| `ayet_hadis_data.json` | — | 232 + 231 | 103 110 | 30 383 | **Hiç kullanılmıyor (atıl)** |
| `tanimlar.js` | `window.tanimlarData` (Array) | 510 | 100 165 | 32 616 | İlk açılış |
| `crossref.js` | `crossRefData` (Object) | 241 anahtar / 1 391 ilişki | 79 251 | 4 869 | İlk açılış |
| `ozetler.js` | `window.maddeOzetleri`, `window.maddeUzunluklari` (Object) | 241 / 241 | 85 485 | 29 134 | Ana sayfada boşta (idle) |
| `rehberler.js` | `rehberlerData` (Array) | 8 | 22 389 | 5 335 | `/rehberler` |
| `gunun-sorusu-data.js` | `gununSorusuData` (Array) | 155 | 48 020 | 13 576 | Günün suâli kartı |
| `audio-map.js` | `audioMap` (Object) | 1 194 | 76 724 | 10 209 | Ses çalar açılınca |
| `okuma-plani.js` | `window.okumaPlani` (Object, 11 fonksiyon) | — (kod) | 17 786 | 5 865 | İlk açılış |
| `sitemap.xml` | — | 256 URL | 42 794 | 1 104 | Arama motorları |
| `manifest.json` | — | — | 1 425 | 588 | PWA |
| `api/rss.js` | `MADDELER` (const, kendi kopyası) | 241 | 19 424 | 7 749 | Vercel Edge `/rss.xml` |
| `silsile-atlasi/veri.js` | `SILSILE` (const Array) | 37 | 83 042 | 24 624 | Yalnız `/silsile-atlasi` |
| `gorsel/*.svg` | — | 5 dosya | 7 827 toplam | 3 326 | Süsler |
| `fonts/` | `fontlar.css` + 25 woff2 | 25 `@font-face` | ~1,3 MB woff2 | (woff2 zaten sıkışık) | CSS ile |
| `vendor/pdfjs-5.4.624/` | `pdf.min.mjs`, `pdf.worker.min.mjs` | — | 1,61 MB | — | "Kitabın aslı" paneli açılınca |

**`app.js` içine gömülü veri** (ayrı dosya değil ama yeni sitede veri katmanına taşınmalı, § 17):
`sesAraligiMap` (241 madde ses aralığı), `quizSorulari` (35 soru), `KISIM_ADLARI`, `KISIM_ROMEN`,
`KISIM_ACIKLAMA`, `SOZLUK_KOKEN`, `tabloKatLabels`/`tabloKatOrder`, `pageSeoMap`, `DUYURULAR`,
`OTTOMAN_MANUAL`, `TR_SUFFIXES`, `PDF_URL`, `AUDIO_BASE`, `KITAP_SAHIFE_SAYISI = 1248`.

Hiçbir veri dosyasında BOM, `\r`, `�` (U+FFFD), mojibake (`Ã`, `Ä`…), sıfır genişlikli karakter,
NBSP veya kontrol karakteri **yok** (betikle sayıldı, § 15).

---

## 1. Kimlik sistemi — en önemli bölüm

### 1.1 Madde kimliği
Kitap 3 kısım, 241 maddedir: kısım 1 = 98, kısım 2 = 73, kısım 3 = 70 madde. Her kısımda madde
numaraları 1'den başlar ve boşluksuz ardışıktır (doğrulandı). **Madde kimliği = (kısım, madde_no)**
çiftidir; tek başına madde numarası benzersiz değildir.

Aynı kimlik dosyalara göre **yedi farklı biçimde** yazılmıştır — yeni veri katmanı bunları tek
bir yardımcıyla çözmelidir:

| Biçim | Örnek | Kullanan |
|---|---|---|
| `{kisim, madde_no}` (sayı) | `{kisim:1, madde_no:43}` | `tocData`, `maddelerData`, `hukumlerData`, `crossRefData` değerleri |
| `"kisim/madde"` dizgesi | `"1/43"` | `crossRefData` anahtarları, `maddeOzetleri`, `maddeUzunluklari`, `sahislarData.gectigiMaddeler`, `sesAraligiMap`, URL `/madde/1/43` |
| `"K{k}/M{m}"` dizgesi | `"K1/M43"` | `tablolarData.kaynak_madde`, `tablolarData.veriler[].maddeler` (konu haritası) |
| `{kisim, madde}` | `{kisim:1, madde:11}` | `gununSorusuData`, `ayetHadisData`, `ayet_hadis_data.json` |
| `{kisim, maddeNo}` | `{kisim:1, maddeNo:52}` | `rehberlerData…maddeler`, `soruMaddeMap` |
| `{k, m}` | `m:{k:1, m:46}` | `quizSorulari` (app.js) |
| `texts/kisimN.json` anahtarı | dosya `kisim1.json`, anahtar `"43"` | madde metinleri |

İstisnalar: `tablolarData.kaynak_madde` iki kayıtta boş (`konu_haritasi`, `islamiyyetin_temeli`), bir
kayıtta `"Tüm Kısımlar"` (`kitabin_tanimlari`). `hukumlerData` 1 kayıtta, `ayetHadisData` 7 kayıtta
`kisim`/`madde` `null` (madde dışı sayfalar; § 6, § 7).

Sıra: `tocData` kitabın İçindekiler sırasıdır (kısım 1→3, madde no artan); "önceki/sonraki madde"
bu dizinin indeksiyle bulunur (kısım sınırını geçer).

### 1.2 Sayfa (basılı sahîfe) numarası
- Kitabın basılı sahîfe sayısı: **1248** (`app.js` `KITAP_SAHIFE_SAYISI`). Maddeler s. **17–1058** arasıdır.
  1–16 önsöz/giriş; 1059–1207 "Hâl Tercemeleri"; 1208–1248 sonraki bölümler (fihrist vb., **içerik doğrulanmadı**).
- Sahîfe yalnız şu yerlerde tutulur: `tocData.sayfa_no`/`sayfa_bitis` (madde başı–sonu),
  `hukumlerData.sayfa`/`sayfa_bitis`, `ayetHadisData.sayfa`, `tanimlarData.s`, `tablolarData.sayfa_no`,
  `sahislarData.sayfalar[]`, `sahislarData.kaynak` (metin içinde "s. 1059"), `⟦şekil:N⟧`/`⟦cedvel:N⟧` işaretleri.
- **Madde metninin içinde sahîfe sınırı işareti YOK.** Bir paragrafın hangi sahîfede olduğu veriden
  çıkarılamaz; yalnız maddenin başlangıç/bitiş sahîfesi bilinir.
- `pdf_sayfa_baslangic`/`pdf_sayfa_bitis` 241 maddenin 241'inde `sayfa_no`/`sayfa_bitis` ile birebir
  aynıdır (doğrulandı). Yani bugünkü veri "PDF sayfa indeksi = basılı sahîfe no" varsayar. PDF'in
  kendisi açılıp bu eşitlik denetlenmedi → **doğrulanmadı**.
- Ardışık maddelerde `sayfa_no` hiç geri gitmez; `sayfa_bitis < sayfa_no` olan madde yok. Bir madde
  önceki maddenin bitiş sahîfesinde başlayabilir (sahîfe paylaşımı olağandır).

### 1.3 Şahıs kimliği (slug)
`sahislarData[].slug` benzersizdir (1 024 kayıt, yineleme 0). URL: `/sahis/{slug}`.
`app.js` içindeki `slugify(isim)`:

```js
text.toLowerCase().replace(/[âÂ]/g,'a').replace(/[çÇ]/g,'c').replace(/[êÊ]/g,'e')
  .replace(/[ğĞ]/g,'g').replace(/[ıİ]/g,'i').replace(/[îÎ]/g,'i').replace(/[öÖ]/g,'o')
  .replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u').replace(/[ûÛ]/g,'u')
  .replace(/['‘’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
```

**Uyarı:** Kayıtlı slug'lar bu fonksiyonla **yeniden üretilemez**. `slugify(isim)` (+ yinelenen adda
`-2`, `-3`) kuralı 1 024 slug'ın 852'sini tutturuyor, **172'sini tutturmuyor**. Örnekler:
`Abdülfettâh-ı Bağdâdî Akrî → abdulfettah-i-bagdadi-akri-rahmetullahi-teala-al` (unvan eklenmiş, 50 harfte
kesilmiş), `Arşimed → ar-simed`, `Âtıf Beğ → atif-be-g`, `Amr ibni Âs → amribni-as`,
`Abdürrahmân İmâdî → abdurrahmanimadi`. Sebep: slug'lar başka bir (eski, büyük harf `Ş/Ğ/İ`yi `-`'ye
çeviren, unvanı ekleyip kesen) süreçle üretilmiş (üreten betik depoda bulunamadı → doğrulanmadı).
**Sonuç: slug'ı asla isimden hesaplama; veri dosyasındaki `slug` alanını kimlik olarak kullan.**
Yayındaki `/sahis/...` adresleri bu slug'larla yaşıyor (sitemap'te şahıs adresi yok, § 12).

İsim benzersiz değildir: 18 isim birden çok kayıtta geçer (ör. `Âlûsî` ×3, `Kâdî-Zâde` ×3,
`İbrâhîm` ×2). Ayırt edici alan `no` (kitabın hâl tercemeleri sıra numarası) ve `slug`'dır.

### 1.4 Lügat terimi kimliği
`sozlukData[].i` sayısal kimliktir, benzersizdir; 1–9864 aralığında **2435 eksiktir** (9 863 kayıt).
`k` (terim) benzersiz **değildir**: 55 terim birebir yineleniyor (`ÂBÂD`, `ÂCİL`, `ARZ`…),
küçük harfe çevrilince 57. Sitede madde içi vurgu `data-id="{i}"` ile, liste çapası
`#sozluk-entry-{i}` ile yapılır → anahtar `i`'dir.

### 1.5 Diğer kimlikler
- Tablo: `tablolarData[].id` (snake_case dizge, 130, benzersiz). URL `/tablo/:id`, `/fevaid/tablo/:id`.
- Hüküm: `hukumlerData[].id` (sayı, 2–7772, benzersiz, dizide artan sıralı; aralıkta boşluk var).
- Rehber: `rehberlerData[].id` (dizge, 8).
- Silsile: `SILSILE[].id` (1–37) ve `halka` (0–35, biri `null`).
- Ses: `audioMap` anahtarı = ses kaydının sıra no'su (dizge "0"…"1249"), § 11.

---

## 2. `data.js`

Boyut 211 920 B (gzip 56 146). Tek satırlık iki `var` bildirimi: `tocData` (≈46 KB, gzip ≈10 KB) ve
`tablolarData` (≈156 KB, gzip ≈46 KB). Başka dosyalar (`tools/generate-ozetler.py`,
`tools/excel-to-hukumler.py`) `tocData`'yı bu dosyadan regex ile okur.

### 2.1 `tocData` — 241 kayıt (İçindekiler)

| Alan | Tür | Anlam | Boş olabilir mi |
|---|---|---|---|
| `kisim` | number 1–3 | Kısım | Hayır |
| `madde_no` | number | Kısım içi madde no | Hayır |
| `mektup_ref` | string | Maddenin alındığı mektup, `"cilt—mektup"` biçimi (`"1—114"`, ayraç U+2014) | Evet: 133 boş `""`; 108 dolu; dolu olanların hepsi `^\d—\d+$` |
| `baslik` | string | Madde başlığı (kitabın imlâsıyla) | Hayır |
| `sayfa_no` | number | Başlangıç sahîfesi (17–1040) | Hayır |
| `sayfa_bitis` | number | Bitiş sahîfesi (≤1058) | Hayır |
| `pdf_sayfa_baslangic` | number | PDF sayfası (241/241 = `sayfa_no`) | Hayır |
| `pdf_sayfa_bitis` | number | PDF sayfası (241/241 = `sayfa_bitis`) | Hayır |

```json
{"kisim":1,"madde_no":1,"mektup_ref":"1—114","baslik":"Muhammed aleyhisselâma uymak, se’âdete kavuşdurur","sayfa_no":17,"sayfa_bitis":21,"pdf_sayfa_baslangic":17,"pdf_sayfa_bitis":21}
```

### 2.2 `tablolarData` — 130 kayıt (Fevâid › Tablolar)
Sitenin hazırladığı özet tablolar/şemalar. `kaynak_metin` kitaptan alıntıdır; `veriler` ise
**kitabın aynen metni değil, derlemedir** (`kaynak_metin`'in 129 dolu kaydından 114'ü kitap
metninde aynen bulundu; 15'i bulunmadı: `konu_haritasi, namaz_farzlari, otuzuc_farz,
abdest_sunnetleri, ezanin_kelimeleri, uc_cesit_haci, fikh_dort_kisim, imansiz_on_sebep,
nikah_sartlari, islamiyyetin_temeli`, …).

Ortak alanlar:

| Alan | Tür | Anlam | Boş |
|---|---|---|---|
| `id` | string | Kimlik (snake_case) | Hayır |
| `baslik` | string | Görünen başlık | Hayır |
| `tip` | string | `tablo` 85, `liste` 21, `flowchart` 10, `iki_liste` 10, `agac` 3, `tanimlar` 1 | Hayır |
| `kaynak_madde` | string | `"K1/M43"`; 2 boş, 1 `"Tüm Kısımlar"` | Evet |
| `sayfa_no` | number | Kaynak sahîfe (hepsi kaynak maddenin aralığında, doğrulandı) | Hayır |
| `kaynak_metin` | string | Kitaptan alıntı paragraf | 1 boş |
| `kategori` | string | `genel` 41, `aile` 27, `itikat` 14, `muamelat` 13, `namaz` 12, `temizlik` 9, `zekat` 6, `hac` 4, `oruc` 2, `cenaze` 2 | Hayır |
| `veriler` | Array / Object / null | Tip'e göre değişir (aşağıda) | 2 kayıtta yok, 1'de `null` |

Tip'e göre şekil:

| `tip` | `veriler` şekli | Ek alanlar |
|---|---|---|
| `tablo` | `[{<kolon adı>: string, …}]` — satır anahtarları = `kolonlar` | `kolonlar: string[]` (85'in 85'inde) |
| `liste` | `[{madde: string, durum: string}]` | — |
| `flowchart` | `[{baslik, aciklama}]` (sıralı adımlar) | — |
| `iki_liste` | `{<solAnahtar>: string[], <sağAnahtar>: string[]}` (anahtar adları tablodan tabloya değişir: `verilir/verilmez`, `helal/haram`, `sol/sag`…; ilk anahtar sol) | `sol_baslik`, `sag_baslik` |
| `agac` | `konu_haritasi`: `[{id, baslik, maddeler:["K1/M1",…]}]`; diğer 2'si: `veriler` YOK, onun yerine `dallar: [{baslik, aciklama, alt?:[{baslik, aciklama}]}]` (özyineli) | `dallar` |
| `tanimlar` | `null` — içerik `tanimlarData`'dan gelir | — |

Diğer: `aciklama` yalnız `otuzuc_farz`'da var. `liste.durum` değerleri tutarsız yazımlı:
`sünnet` 28 / `sunnet` 11, `sebep` 10 / `sebeb` 5 (aynı anlamda iki yazım; filtrelemede birleştir).
`namaz_rekatlari`: `kolonlar` 5 öğe (`Vakit, İlk Sünnet, Farz, Son Sünnet, Toplam`), satırlarda 6 anahtar
(ek `Vâcib`) — kolon listesine güvenmek bir sütunu gizler.

Bağlar: `veriler`/`dallar` içinde 265 `K/M` atfı, kırık 0. 241 maddenin 179'unun kaynak tablosu yok
(beklenen; tablo her maddede yok).

```json
{"id":"iman_sartlari","baslik":"İmanın Altı Şartı (Âmentü)","tip":"tablo","kaynak_madde":"K1/M24","sayfa_no":42,
 "kaynak_metin":"Îmânın altı şartından birincisi, …","kolonlar":["No","Şart","Açıklama"],
 "veriler":[{"No":"1","Şart":"Allahü teâlâya îmân","Açıklama":"…"}, …],"kategori":"genel"}
```

---

## 3. Madde metni: `texts/kisim{1,2,3}.json` ve `maddeler-data.js`

### 3.1 Yapı
- `texts/kisimN.json`: düz JSON nesnesi, **anahtar = madde no (dizge)**, değer = metin (dizge).
  kisim1: 98 anahtar, kisim2: 73, kisim3: 70; fazla/eksik anahtar yok.
- `maddeler-data.js`: `var maddelerData = [ {kisim, madde_no, mektup_ref, baslik, sayfa_no, sayfa_bitis, metin, pdf_sayfa_baslangic, pdf_sayfa_bitis} ]` (241).
  Meta alanları `tocData` ile **241/241 birebir aynı**; `metin` alanı `texts/*.json` ile **241/241
  karakteri karakterine aynı** (betikle doğrulandı).

### 3.2 Hangisi kullanılıyor?
`app.js` `getMaddeText()` (satır 817 civarı):
1. `window.maddelerData` zaten yüklüyse oradan okur;
2. değilse `texts/kisim{k}.json`'u `fetch` eder (30 sn zaman aşımı), `index.html` `/madde/k/m`
   adresinde bu isteği erkenden başlatır (`window.__kisimOnYukleme`);
3. ancak bu başarısız olursa 4,5 MB'lık `maddeler-data.js`'i yedek olarak yükler.
   Ayrıca `openMadde` meta bulamazsa `ensureMaddelerData()` çağırır (satır 1185).

Arama (`search-engine.js`) tam metin için `ensureAllKisimTexts()` ile üç JSON'u birden yükler.
**Sonuç:** Asıl kaynak `texts/*.json`. `maddeler-data.js` yalnız yedektir ve içeriği
`tocData` + `texts/*.json`'un birleşiminden ibarettir (bilgi kaybı olmadan atılabilir; § 16).

### 3.3 Metnin biçimi
Düz metin (UTF-8, NFC'de Türkçe/Osmanlıca imlâ: `â î û`, `’` U+2019 hemze/ayn için). **HTML yok**
(`<…>` etiketi 0, `&x;` varlığı 0). Yapı yalnız satır sonlarıyla kodlanmıştır. `app.js`
`maddeMetniHTML()` kuralları (yeni site bunları aynen uygulamalı):

1. Paragraflar `\n{2,}` ile ayrılır (pratikte hep tam iki `\n`; 3+ ardışık satır sonu 0).
2. Paragraf `^⟦şekil:N⟧$` ise: kitabın N. sahîfesinde şekil var (metin yok) → sahîfe bağlantısı.
3. Paragraf `^⟦cedvel:N⟧\n…` ise: ilk satır işaret, kalanı eş aralıklı tablo metni → `<pre>` + N. sahîfe bağlantısı.
4. Paragraf içinde `\n` varsa: içinde `\S {2,}\S` (çoklu boşluk hizası) varsa **cedvel/tablo** (`<pre>`),
   yoksa **şiir/manzûme** (satırlar `<br>`).
5. `^\[\d\] ` ile başlayan tek satır paragraf: **dipnot**.
6. ≤160 harf ve harflerinin ≥%70'i büyük harf (`“…”` içi hariç): **ara başlık**.
7. Diğer: normal paragraf.

Betikle sayılan paragraf türleri (241 madde): normal 6 232, ara başlık 239, şiir 214, ⟦cedvel⟧ 27,
dipnot 10, çoklu boşluklu tablo 5, ⟦şekil⟧ 5.

Açılış: 237 madde `"{madde_no} — "` (U+2014) ile başlar. İstisnalar:
`1/1` `"TAM İLMİHÂL\n\nSE’ÂDET-İ EBEDİYYE\n\nBesmele…"` (kitap başı; "1 — " sonra gelir),
`1/59` `"59 – İSTİKBÂL-İ KIBLE"` (U+2013 kısa tire), `2/1` `"İKİNCİ KISM\n\n1 — …"`, `3/1` `"ÜÇÜNCÜ KISM\n\n1 — …"`.
"N — " deseni metin içindeki numaralı fıkralarda da kullanılır (`"16 — Tertîbdir…"`), madde başını
yalnız bu desenle bulmaya çalışma. Bazı maddelerde "N — " ardından büyük harfli başlık gelir
(`"51 — BEŞ VAKT NEMÂZ"`), bazılarında doğrudan metin (`"2 — Cenâb-ı Hak, …"`). `tocData.baslik`
metindeki bu satırla aynı değildir; başlık için daima `tocData` kullan.

Boyut: toplam 3 993 613 karakter; en kısa `1/6` (277), en uzun `1/60` (114 462), `2/17` (114 184).
Madde başına gzip: en az 254 B, medyan ≈4,8 KB, %90'lık ≈14,7 KB, en çok 41,6 KB (`2/17`).

### 3.4 Metindeki özel işaretlerin dökümü (241 madde, betikle sayıldı)

| İşaret | Adet | Geçtiği madde | Anlam / not |
|---|---|---|---|
| `(` / `)` | 10 114 / 10 163 | 227 | Kitap adı, terim, alıntı, âyet/hadîs meâli; kısa (≤60) parantezin 7 115/7 725'i büyük harfle başlar. `)` fazlası 182 adet `1)`/`a)`/`A)` liste işaretinden |
| `[` / `]` | 2 888 / 2 886 | 209 | Kitabın kendi açıklama/tarih köşeli parantezi: `[açıklama]` 1 434, `[m. YYYY]` mîlâdî yıl 264, `[sayı]` 245 (çoğu hicrî yıl/dipnot no) |
| `“ ”` (U+201C/D) | 2 723 / 2 718 | 205 | Dua/hürmet ifadeleri: en sık "sallallahü aleyhi ve sellem" 705, "rahmetullahi teâlâ aleyh" 481, "radıyallahü anh" 247 |
| `’` (U+2019) | 15 553 | 237 | Kesme ve hemze/ayn (`se’âdet`, `ya’nî`) — kelimenin parçası, sözlük eşleştirmede korunmalı |
| `‘` (U+2018) | 0 | — | |
| `'` düz kesme | 42 | 3 | Çoğu cedvel içinde açı dakikası (`50'`) |
| `"` düz tırnak | 4 | 1 | |
| `—` (U+2014) | 1 552 | 240 | Madde/fıkra numarası ayracı `N — ` |
| `–` (U+2013) | 92 | 4 | Formül/aralık, 1 madde başlığı (`1/59`) |
| `...` | 109 | 37 | Kitabın üç noktası (`…` U+2026 hiç yok) |
| `⟦şekil:N⟧` | 5 | 3 | Bkz. § 3.3 |
| `⟦cedvel:N⟧` | 27 | 3 | Bkz. § 3.3 (N hep maddenin sahîfe aralığında) |
| `[N] ` dipnot paragrafı | 10 | 9 | |
| `N. ci/cı/cü/cu sahîfe` atfı | 134 | 66 | Kitabın kendi sahîfe atfı; hedefler 2–2361, **4 tanesi 1248'den büyük** (başka kitaba/eski baskıya atıf olabilir — doğrulanmadı) |
| `Madde N’e bak` | 1 | 1 | `app.js` `aktivCrossLinks` bunu aynı kısımdaki maddeye bağlar; kırık 0 |
| Arap harfi | 0 | — | Arapça metin Latin harfle yazılmış |
| Matematik/özel | `=` 387, `_` 174, `°` 122, `+` 99, `′` 59, `″` 59, `÷` 44, `×` 38, `⟶` 27, Yunan harfleri (δ φ Δ α β) | — | Hep cedvel/hesap bloklarında (`1/59`, `1/60`, `2/42`…) |
| Latin dışı aksan | `é` 37, `è` 3, `ä` 1 | — | Yabancı özel adlar |

Tek satırlık paragraflarda çoklu boşluk 9 yerde (`1/46` "Nazm:          …" ×3, `1/60` ×3, `2/42`, `3/37`,
`3/53`) — bunlar `\n` içermediği için `<pre>` yerine düz paragraf olarak çiziliyor ve hizaları HTML'de
kayboluyor (görüntü sorunu; veri değişmeden çizimde `white-space` ile çözülebilir).

Parantez/tırnak dengesi tutmayan 24 madde var (ilk 20: `1/31 ():-3, 1/61 ():+1, 1/66 ():+1, 1/68 ():+1,
1/78 ():+2 []:+1, 1/83 ():-3, 1/95 ():+1, 1/96 ():+1, 1/98 []:+1, 2/15 ():+1, 2/17 “”:+1, 2/22 []:+1,
2/38 []:-1, 2/42 ():-2, 2/46 ():-11, 2/47 ():-15, 3/20 ():-13, 3/22 ():-3, 3/24 ():-2, 3/42 “”:+1`).
Negatif değerlerin büyük kısmı `1)`, `a)` liste işaretinden kaynaklanıyor (veri hatası değil); `+1`
olanlar (açılıp kapanmayan parantez) kitabın kendi dizgisinden mi geliyor, aktarım hatası mı —
**doğrulanmadı** (PDF'le karşılaştırma gerekir). Çizicinin dengesiz parantezde bozulmaması gerekir.

---

## 4. `sozluk-data.js` — `sozlukData` (9 863 kayıt)
Tek satır `var sozlukData=[…]`. 3,18 MB (gzip 1,09 MB). Kısaltılmış alan adları:

| Alan | Tür | Anlam | Var olduğu kayıt |
|---|---|---|---|
| `i` | number | Kimlik (1–9864, 2435 eksik) | 9 863 |
| `k` | string | Terim. 7 380'i TAMAMEN BÜYÜK, 2 483'ü karışık (ör. `Abâdile-i Erba‘a`) | 9 863 |
| `o` | string | Osmanlıca (Arap harfli) yazılışı; hepsi Arap harfi içerir | 9 824 (39 yok) |
| `a` | string | Anlam (düz metin, HTML yok) | 9 863 |
| `m` | string | Misal/örnek cümle (kaynaklı) | 3 689 |
| `b` | string | "Bkz." — yönlendirilen terim | 219 |
| `d` | string | Köken: `A` 8 264, `T` 872, `F` 553, `Fr` 97, `Y` 31, `İt` 20, `L` 13, `İ` 11, `E` 1, `B` 1 | 9 863 |
| `s` | string (rakam) | 7–677 arası, dizide hiç geri gitmeyen bir sayfa no. **Hangi eserin sayfası olduğu doğrulanmadı** (madde sahîfeleriyle örtüşmüyor; muhtemelen kaynak lügatin sayfası). `app.js` bu alanı **kullanmıyor** | 9 863 |

`app.js` `SOZLUK_KOKEN` yalnız `A, F, T, Fr, Y, İt, L`'yi tanır; `İ` (11 kayıt: TALMÛD, HAHAM… — muhtemelen
İbranice, doğrulanmadı), `E` (`HAÇ`), `B` (`HAYDÛD`) etiketsiz kalır.
`b` değerinin 100'ü sözlükte madde başı olarak yok (ör. `ÂDİL→Adâlet`, `AKIL→Akl`, `ÂKİBET→Âkıbet`;
çoğu büyük/küçük harf ve şapka farkı). `a` alanının 718'inde "bk./bakınız" metni geçer.
Kayıtlar `k`'ya göre alfabetik (`s` artan) sıralıdır.

```json
{"i":3,"k":"ÂBÂD","o":"آباد","a":"Mâmur, şen.","m":"Halkı tahrîb eyleyib de kendin âbâd eyleme, … (Diyarbakırlı Said Paşa)","d":"F","s":"7"}
```
Boyut notu: `m` alanı tek başına ≈1,35 MB; yalnız `{i,k,a}` gzip ≈487 KB.
Madde içi "zor kelime" vurgusu bu dosyayla, istemci tarafında kök/ek kurallarıyla (`TR_SUFFIXES`,
`findByStems`) yapılır; metinde önceden işaretlenmiş terim yoktur.

---

## 5. `sahislar.js` — `sahislarData` (1 024 kayıt)
Kaynak: kitabın "Hâl Tercemeleri" bölümü (s. 1059–1207).

| Alan | Tür | Anlam | Boş |
|---|---|---|---|
| `isim` | string | Ad (kitap imlâsı, düz `'` kesme kullanır) | Hayır |
| `slug` | string | Kimlik, URL parçası (§ 1.3) | Hayır |
| `unvan` | string | Hürmet ifadesi: `rahmetullahi teâlâ aleyh` 613, `''` 271, `radıyallahü anh` 70, `aleyhisselâm` 25, `radıyallahü anhâ` 21, … (12 farklı değer) | 271 boş |
| `kategori` | string | `alim` 592, `diger` 261, `sahabi` 97, `hukumdar` 49, `peygamber` 25 | Hayır |
| `biyografi` | string | Kitaptaki hâl tercemesi; 37'sinde `\n` (paragraf), 81'i "… ismine bakınız!" yönlendirmesi. Uzunluk 14–6 035 (medyan 254) | Hayır |
| `gectigiMaddeler` | string[] | `"k/m"` biçiminde, adın geçtiği maddeler | 278 boş dizi |
| `kaynak` | string | `"Se'âdet-i Ebediyye, Hâl Tercemeleri, s. N (N. sıra)"` ya da `"(… N. sıradan sonra, numarasız)"` | Hayır |
| `no` | number\|null | Kitaptaki sıra no 1–1020 (eksiksiz, benzersiz); 4 numarasız kayıtta `null` (Hempher, Manastırlı İsmâ'îl Hakkı, Me'mûn bin Hârûn, Yûşa') | 4 null |
| `sayfalar` | number[] | Adın geçtiği basılı sahîfeler (4 637 değer; 1 323'ü madde aralığı dışında, yani önsöz/hâl tercemeleri sahîfeleri) | 169 boş dizi |

```json
{"isim":"Abbâs","slug":"abbas","unvan":"radıyallahü anh","kategori":"sahabi","biyografi":"Abdülmuttalibin en küçük oğludur. …",
 "gectigiMaddeler":["1/31","1/84","1/95", …],"kaynak":"Se'âdet-i Ebediyye, Hâl Tercemeleri, s. 1059 (1. sıra)","no":1,"sayfalar":[62,350,376, …]}
```
Bağ denetimi: `gectigiMaddeler` 2 593 atıf, biçim bozuk 0, kırık 0, kayıt içi yineleme 0;
her `gectigiMaddeler` öğesi `sayfalar`'daki bir sahîfeyi kapsayan maddedir (tutarsız şahıs 0).
`sayfalar` geçersiz: `ibni-cezeri` → `[1249]` (kitap 1248 sahîfe).

---

## 6. `hukumler-data.js` — `window.hukumlerData` (7 158 kayıt)
3,11 MB (gzip 574 KB). `tools/excel-to-hukumler.py` ile Excel'lerden üretilmiş (kaynak Excel'ler
`/Users/raufenc/Downloads/…` — depoda yok). Madde bağı **sahîfeden** hesaplanmıştır (betik
`tocData`'nın sahîfe aralığından madde bulur).

| Alan | Tür | Anlam | Boş |
|---|---|---|---|
| `id` | number | Kimlik (2–7772, artan) | Hayır |
| `tur` | string | `haram` 1 984, `farz` 1 381, `sunnet` 1 301, `mekruh` 1 033, `vacib` 636, `mustehab` 491, `mubah` 332 | Hayır |
| `katman` | string | `acik` 2 864 / `tum` 4 294. UI ikisini ayrı sekmede gösterir ("açık" / "toplam"); bir kayıt yalnız kendi katmanında görünür | Hayır |
| `metin` | string | Kitaptan cümle/blok (aynen) | Hayır |
| `sayfa` | number | Basılı sahîfe | Hayır |
| `sayfa_bitis` | number\|null | Blok sahîfe aşıyorsa bitiş | 7 025 null |
| `alt_tur` | string | Alt sınıf (53 farklı değer: `diğer geçiş` 1 608, `harâmdır` 800, `mekrûh` 619, …) | 310 boş |
| `baglam` | string | Çevre metin; 1 454'ü `…` ile kesik | 5 201 boş |
| `konu` | string | Maddenin başlığı (= `tocData.baslik`, 0 fark) | Hayır |
| `kisim`, `madde_no` | number\|null | Madde | 1 kayıtta null (id 3917, s. 1173, konu "Hâl tercemeleri") |

```json
{"id":2,"tur":"farz","katman":"acik","metin":"Ona uymak için, önce îmân etmek, …","sayfa":17,"sayfa_bitis":null,
 "alt_tur":"farz / farzları","baglam":"","konu":"Muhammed aleyhisselâma uymak, se’âdete kavuşdurur","kisim":1,"madde_no":1}
```
Yineleme: aynı `metin` 2 421 grupta (5 327 kayıt) birden çok kez geçer. Sebep çoğunlukla tasarım:
`acik` kaydın 2 864'ünden 2 373'ü aynı tür+metinle `tum` katmanında da var; ayrıca aynı cümle birden
çok `tur` altında (ör. id 2 farz, 1117 sünnet, 3306 mekruh, 4593 haram — `alt_tur:"diğer geçiş"`).
Yeni katman: "toplam" görünümü = `katman==='tum'`; "açık" = `katman==='acik'`; ikisini birleştirme.
`tum` katmanının hangi süreçle üretildiği depoda yok (betik yalnız `acik` yazıyor) → **doğrulanmadı**.
Metin sadakati: 7 116/7 158 hüküm kendi maddesinin metninde aynen (boşluk normalize) geçiyor;
42 geçmiyor (41 + madde'si null olan 1). Farklar ufak imlâ/tire farkı (id 1011: `sebe-tel-ecr` ↔ kitap `sebetel-ecr`)
ya da iki paragrafı birleştiren bloklar. Tam liste: `241,854,872,1011,1208,1700,1714,3134,3301,3660,3913,4038,
4172,4186,4210,4384,4653,4861,5043,5129,5144,5180,5557,6299,6430,6484,6487,6496,6530,6538,6559,6654,6687,6691,6703,
7341,7358,7474,7743,7755,7771`.
Hükmü olmayan madde: 82 (ör. `1/2, 1/4…1/10, 1/13…`; tam liste `denetim-cikti.txt` § 6).
Boyut: `baglam` olmadan gzip ≈453 KB; yalnız `acik` gzip ≈261 KB.

---

## 7. `ayet-hadis.js` — `window.ayetHadisData` (+ atıl `ayet_hadis_data.json`)
`{ayetler: [...193], hadisler: [...449]}`.

`ayetler[]`:
| Alan | Tür | Anlam | Boş |
|---|---|---|---|
| `metin` | string | Kitaptaki meâl | Hayır |
| `sure` | string\|null | Sûre adı (kitap imlâsı: `Nahl`, `Âl-i İmrân`…; 61 farklı) | 24 null |
| `ayet_no` | string\|null | **Yazıyla sıra sayısı** (`"doksansekizinci"`, `"yüzellinci ve yüzellibirinci"`); 138 dolu kaydın 0'ı rakam. Sayıya çevrilmemiş | 55 null |
| `kisim`, `madde` | number\|null | Madde | 3 null (s. 3, 6, 1170) |
| `sayfa` | number | Sahîfe | Hayır |

`hadisler[]`: `metin`, `kaynak` (string\|null; 385 null; en sık `Künûz-üd-dekâık` 10, `Tergîb-üs-salât` 8, `Müslim` 8…),
`kisim`, `madde` (4 null: s. 2, 3, 3, 7), `sayfa`.

```json
{"metin":"Ey sevgili Peygamberim “sallallahü aleyhi ve sellem”! Seni, dünyâdaki bütün insanlara …","sure":"Sebe’","ayet_no":"yirmisekizinci","kisim":1,"madde":1,"sayfa":20}
{"metin":"Günâhlardan sakınmayan müslimânların ibâdetleri sahîh olsa da kabûl olmaz","kaynak":"Hadîka","kisim":1,"madde":1,"sayfa":19}
```
Bağ: kırık madde 0 (null'lar dışında), sahîfe hep madde aralığında; âyetlerin 189/193'ü, hadîslerin
444/449'u kendi maddesinin metninde aynen geçiyor (bulunamayanlar: âyet `2/48 s.698`, hadîs `3/59 s.1008`
ve madde'si null olanlar). Yinelenen metin 0.

**`ayet_hadis_data.json` atıldır**: hiçbir `.js/.html/.json/.css/.py` dosyası ona başvurmuyor.
Farklı bir veridir (aynı kopya değil): `{ayetler:[232], hadisler:[231]}`, alanlar yalnız
`{kisim, madde, metin}` ve `metin` âyeti/hadîsi **içeren paragrafın tamamı**; iki dosyanın `metin`
kümeleri hiç kesişmiyor (0 ortak). Eski bir çıkarım olduğu anlaşılıyor (doğrulanmadı). Yeni sitede kullanılmamalı.

---

## 8. `tanimlar.js` — `window.tanimlarData` (510 kayıt)
Kitabın "… (X) denir." kalıbındaki kendi tanımları. Alanlar: `t` (terim), `c` (tanım cümlesi), `s` (sahîfe).
```json
{"t":"Adâlet","c":"Adâletin yüksek ta’rîfi, (Kendi mülkünde olanı kullanmak) demekdir.","s":403}
```
Madde bağı **yoktur**; yalnız sahîfe. Madde bulmak için `s`'yi `tocData` aralığına düşür (32 kayıt
hiçbir maddeye düşmez: önsöz s. 2–16 ve hâl tercemeleri s. 1084–1248, ör. `Akl s.1248`, `Besmele s.3`).
455/510 tanım cümlesi madde metinlerinde aynen geçiyor; geçmeyen 55'in 32'si madde dışı sahîfeden,
23'ü madde aralığında ama aynen bulunamadı (`Emvâl-i zâhire s.309, Esmâ-i hüsnâ s.431, Ezân-ı Cavk s.205,
Farz s.230, …` tam liste `ek-denetim-cikti.txt`). `t` yinelenen: `Dünyâ` ×2, `Mevdû’` ×2.
Kullanım: Fevâid › Tanımlar, `tablolarData` `kitabin_tanimlari` (tip `tanimlar`) ve arama.

---

## 9. `crossref.js` — `crossRefData`
`{"k/m": [{kisim, madde_no, neden}, …]}` — 241 anahtar (her madde var), 1 391 ilişki, madde başına 2–15.
`neden` değerleri: `aynı konu` 693 (kelime benzerliği, otomatik), `sonraki madde` 233, `önceki madde` 233,
`madde referansı` 121 (bu madde o maddeye atıf yapıyor), `atıf yapan madde` 111 (o madde buna atıf yapıyor).
Kırık 0, kendine bağ 0, yinelenen hedef 0; her `atıf yapan madde`'nin karşı tarafta `madde referansı`
kaydı var (simetri tam). `madde referansı`'nın hedef numarası kaynak metinde 57/121'inde rakam olarak
geçiyor; diğerleri sahîfe atfından çıkarılmış olabilir (üretim betiği depoda yok → doğrulanmadı).
```json
"1/1":[{"kisim":1,"madde_no":74,"neden":"atıf yapan madde"},{"kisim":1,"madde_no":21,"neden":"aynı konu"}, …]
```

---

## 10. `ozetler.js` — `window.maddeOzetleri`, `window.maddeUzunluklari`
Üretici `tools/generate-ozetler.py` (texts'ten). Her ikisi de `"k/m"` anahtarlı, 241/241.
- `maddeOzetleri[k/m]`: maddenin ilk uygun paragraflarından ≈200–300 harf, kelime sınırından kesik;
  214'ü `…` ile biter. Başlık satırı, şiir/tablo, dipnot ve ⟦⟧ atlanır. 237/241 metinde aynen geçer;
  4'ü (`1/51, 2/4, 2/5, 3/61`) birden çok paragrafı birleştirdiği için aynen geçmez (beklenen).
- `maddeUzunluklari[k/m]`: sayı. Tanım (betikten): baştaki `^\d+\s*[—–-]\s*` silinir, `⟦…⟧` silinir,
  boşluklar teke indirilir, `strip`'lenir, `len()`. Bu yüzden `metin.length`'ten küçüktür (241'in 0'ı eşit;
  beklenen). Okuma planı bunu günlük bölüm hesabında kullanır.

---

## 11. Ses: `audio-map.js` + `app.js` `sesAraligiMap`

### 11.1 `audioMap`
`{"<kayıt no>": "/audio/001/TISE-<4 hane> <ad>.mp3"}` — 1 194 anahtar, "0"…"1249".
- Tam adres = `AUDIO_BASE + encodeURI(yol)` = `https://www.hakikatkitabevi.net/audio/001/TISE-0017 Birinci kisim.mp3`
  (dosya adlarında boşluk ve Türkçe harf var; `encodeURI` şart).
- Tek klasör `001`. Dosya adındaki 4 haneli no 1 194/1 194 anahtarla aynı. Yinelenen URL 0.
- Aralıkta kaydı olmayan numaralar (56): `2, 12–15, 180, 192, 196, 197, 199, 200, 1204–1248`.
- `app.js` yorumuna göre kayıtlar **eski baskının sahîfeleri**dir; 2026 baskısının sahîfeleriyle
  örtüşmez. Yani `audioMap` anahtarı = ses kaydı no'su ≠ basılı sahîfe no'su (kayıtları dinleyerek doğrulanmadı).
- Uzak dosyaların erişilebilirliği **doğrulanmadı** (ağ isteği yapılmadı). CSP `media-src` bu alan adına izin veriyor.

### 11.2 `sesAraligiMap` (app.js satır ~4055, gömülü)
`{"k/m": [başlangıçKaydı, başlangıçSaniyesi, bitişKaydı, bitişSaniyesi] | null}` — 241 anahtar.
- `null` = seslendirilmemiş madde (eski baskıda yok): **14 madde**
  `1/32, 1/38, 1/48, 1/86, 1/88, 2/7, 2/9, 2/11, 2/55, 2/58, 2/63, 2/65, 2/68, 3/48`.
- Bitiş saniyesi `null` = bitiş kaydının sonuna kadar. Saniyeli (ortadan başlayan/biten) aralık 30 madde
  (`1/1`–`1/30` civarı); bunlar Whisper ile metne hizalanmış (yorumdan).
- **Cümle/paragraf düzeyinde zaman damgası yok.** Hizalama madde düzeyindedir.
- Haritada olmayan madde olursa `sayfa_no..max(sayfa_bitis, pdf_sayfa_bitis)` kullanılır (şu an hepsi haritada).
- Çalma algoritması: `for p in başlangıçKaydı..bitişKaydı: if audioMap[p] → çal`; ilkinde
  `başlangıçSaniyesi`'nden başla, sonuncuda `bitişSaniyesi`'nde dur.
- `1/60`'ın aralığında (175–203) 6 kayıt yok: 180, 192, 196, 197, 199, 200 → o kısımlar atlanır.

---

## 12. `sitemap.xml`
256 `<url>`: `/` 1, `/madde/k/m` 241, statik sayfalar 14 (`/icerik /fevaid /sozluk /arama /sahislar /hakkinda
/quiz /ayet-hadis /gunun-bilgisi /rehberler /hukumler /gizlilik /namaz-vakitleri /silsile-atlasi`).
Alan adı `https://www.ilmihal.org`. Hepsinde `lastmod 2026-10-19`; `priority` madde = 0.8.
**Yok:** `/sahis/{slug}` (1 024), `/tablo/{id}` (130), `/hukumler/{tur}`. Elle mi üretildiği, betikle mi — üretici depoda bulunamadı (doğrulanmadı).

## 13. `manifest.json`, `api/rss.js`
- `manifest.json`: ad "Se'âdet-i Ebediyye - İnteraktif İlmihâl", `short_name` "İlmihâl", `start_url /`,
  `display standalone`, `theme_color #0d3a2b`, `background_color #faf8f4`, ikonlar `favicon.svg`,
  `icon-192.png`, `icon-512.png` (maskable), `apple-touch-icon.png`; kısayollar `/arama`, `/sozluk`, `/hukumler`.
  Açıklamada sabit sayılar (241, 9.863, 1020) yazılı.
- `api/rss.js` (Vercel Edge, `/rss.xml` → `/api/rss` yeniden yazımı): **kendi `MADDELER` kopyasını** taşır
  (`[kisim, madde_no, baslik]` ×241, `tocData` ile aynı sırada). Son 30 gün için "Günün Maddesi" =
  `MADDELER[yılın günü % 241]` (TR saati UTC+3). `tocData` değişirse bu kopya da güncellenmeli
  (çift kaynak; yeni yapıda tek kaynaktan üretilmeli).

## 14. `rehberler.js`, `gunun-sorusu-data.js`, `arama-sozluk.js`, `okuma-plani.js`

**`rehberlerData`** (8 rehber, 42 bölüm, 142 madde atfı):
`{id, baslik, aciklama, ikon (satır içi SVG dizgesi — 26 etiket burada), renk ("#1a6b4e"), bolumler:[{baslik, maddeler:[{kisim, maddeNo, not}]}]}`.
`not` = madde başlığı (141/142 aynı; `zekat-rehberi 1/46` sonuna "(islâmın beş şartı)" eklenmiş). Kırık 0.

**`gununSorusuData`** (155): `{soru, kisim, madde, baslik, resmi:boolean}` — `soru` kitaptaki suâl
metni (155/155 kendi maddesinde aynen geçer), `baslik` = madde başlığı (fark 0), `resmi` true 90 / false 65
(anlamı: kitapta "Suâl:" diye açıkça sorulmuş mu — kullanım yerinden çıkarım, **doğrulanmadı**). Kırık 0.

**`arama-sozluk.js`**:
- `aramaSynonyms`: `{"<normalize edilmiş arama terimi>": ["kitaptaki yazım", …]}` — 392 anahtar, 651 değer
  (ör. `"namaz": ["nemaz","salat","salah"]`). Anahtarlar küçük harf, şapkasız (`normalizeSearch`).
- `soruMaddeMap` (229): `{soru: string[] (toplam 702 ifade), kisim, maddeNo, cevapOzet}`; kırık 0.
  `cevapOzet` sitenin yazdığı açıklamadır (kitap metni değil).

**`okuma-plani.js`**: veri değil, modüldür (`window.okumaPlani` = 11 fonksiyon). Veri kısmı:
sabitler `DAKIKADA_HARF = 1100`, `SURELER = [30, 90, 180, 365 gün]`; `maddeUzunluklari`'nı kullanır;
yalnız tarayıcıda tutulan `localStorage` anahtarları: `ilmihal-hatim` `{baslangic:'YYYY-MM-DD', gun, hatimSayisi}`,
`ilmihal-bitirilen` `['1/1', …]`, `ilmihal-okuma-yeri` `{'1/60': 0.42}`, `ilmihal-hatim-kutlama`.
Yeni site bu anahtarları aynen okumalı ki kullanıcıların ilerlemesi kaybolmasın.

---

## 15. Tutarlılık denetimi — özet tablo
(DÜZELTİLMEDİ, yalnız listelendi. Ayrıntı: `incele/denetim-cikti.txt`, `incele/ek-denetim-cikti.txt`.)

| Denetim | Sonuç |
|---|---|
| Yinelenen madde kimliği / eksik madde / kısım içi boşluk | 0 / 0 / 0 |
| `maddeler-data.js` ↔ `texts` ↔ `tocData` farkı | 0 (birebir aynı) |
| Kodlama: `�`, mojibake, BOM, NBSP, sıfır genişlik, kontrol karakteri (bütün dosyalar) | 0 |
| Metinde HTML etiketi/varlığı | 0 |
| Kırık madde atfı: tablolar 0, şahıslar 0, crossref 0, rehberler 0, günün sorusu 0, soruMaddeMap 0, quiz 0, metin içi "Madde N’e bak" 0 | 0 |
| `madde` alanı `null` | hükümler 1 (id 3917), âyetler 3, hadîsler 4 |
| Geçersiz sahîfe | `sahislar` `ibni-cezeri` → 1249 (1 kayıt) |
| Slug isimden üretilemiyor | 172 / 1 024 |
| Yinelenen isim (şahıs) | 18 isim |
| Yinelenen terim (lügat `k`) | 55 (küçük harfte 57); `i` boşluğu: 2435 |
| Lügat `b` hedefi madde başı değil | 100 / 219 |
| Lügat köken kodu UI'de karşılıksız | `İ` 11, `E` 1, `B` 1 |
| Tanım `t` yinelenen | 2 (`Dünyâ`, `Mevdû’`) |
| Tanımı kitapta aynen bulunamayan | 55 (32'si madde dışı sahîfe) |
| Hüküm metni kendi maddesinde aynen bulunamayan | 42 |
| Âyet / hadîs metni kendi maddesinde bulunamayan | 4 / 5 (null'lar dahil) |
| Aynı hüküm metni birden çok kayıtta | 2 421 grup (tasarım gereği büyük kısmı) |
| Tablo kolonları ↔ satır anahtarları uyumsuz | 1 (`namaz_rekatlari`) |
| Tablo `liste.durum` çift yazım | `sünnet/sunnet`, `sebep/sebeb` |
| Parantez/tırnak dengesiz madde | 24 (çoğu liste işareti) |
| Tek satırda çoklu boşluk (hiza kaybı) | 9 yer |
| Madde başı `—` yerine `–` | 1 (`1/59`) |
| Sesi olmayan madde | 14 |
| Ses aralığında eksik kayıt | 6 (`1/60`) |
| Hükmü olmayan madde | 82 |
| Özeti olmayan madde | 0 |
| Kaynak tablosu olmayan madde | 179 (beklenen) |
| `gectigiMaddeler` boş şahıs / `sayfalar` boş şahıs | 278 / 169 |

---

## 16. Atıl / yinelenen veri
- **`ayet_hadis_data.json`**: hiçbir yerden yüklenmiyor; `ayet-hadis.js` ile aynı değil (§ 7). Atıl.
- **`maddeler-data.js`**: `tocData` + `texts/*.json`'un birebir birleşimi; yalnız yedek yolunda yüklenir. Bilgi bakımından yinelenen.
- **`tablolarData`** ilk açılışta `data.js` ile iner (~46 KB gzip) ama yalnız Fevâid/tablo sayfasında ve madde altı "ilgili tablo"da gerekir.
- **`api/rss.js` `MADDELER`**: `tocData`'nın el ile tutulan kopyası.
- **`sozlukData.s`**: hiçbir kodda okunmuyor.
- **Yazı tipleri**: `inter-{400,500,600,700}-normal-latin.woff2` dört dosya **birebir aynı** (md5 aynı; değişken font),
  `literata-{400,600,700}-normal-latin.woff2` üçü aynı (latin-ext'ler de boyutça aynı). Ayrıca `style.css` içinde
  25 ayrı `@font-face` var, `fonts/fontlar.css`'te de 25 — iki kopya (index.html `fontlar.css`'i değil `style.css`'i kullanıyor;
  `fontlar.css`'i `404.html`, `silsile-atlasi`, `namaz-vakitleri` kullanıyor).

## 17. `app.js` içine gömülü veri (yeni sitede ayrı veri dosyasına alınmalı)
| Ad | İçerik |
|---|---|
| `sesAraligiMap` | § 11.2 |
| `quizSorulari` | `{iman:8, namaz:8, oruc:5, zekat:5, hac:5, ahlak:4, karisik:0}` = 35 soru; soru şeması `{s: soru, c: [şıklar], d: doğru şık indeksi, a: açıklama (kitaptan alıntılı, "(K1/M46)" ekli), m: {k, m}}`; kırık 0 |
| `KISIM_ADLARI`, `KISIM_ROMEN`, `KISIM_ACIKLAMA` | Kısım adları ("Birinci Kısım"…), I/II/III, kısım tanıtım cümleleri |
| `SOZLUK_KOKEN` | `{A:'Arapça', F:'Farsça', T:'Türkçe', Fr:'Fransızca', Y:'Yunanca', 'İt':'İtalyanca', L:'Latince'}` |
| `tabloKatLabels` / `tabloKatOrder` | Tablo kategori adları ve sırası (`genel` sırada yok) |
| `pageSeoMap` | Sayfa başına `[title, description]` |
| `DUYURULAR` | `{id, baslik, metin, tarih, bitis, tur}` |
| `OTTOMAN_MANUAL`, `TR_SUFFIXES` | Arama/sözlük eşleme kuralları |

---

## 18. Dış kaynaklar ve alan adları
| Kaynak | Adres | Not |
|---|---|---|
| Kitabın PDF'i | `https://www.hakikatkitabevi.net/downloads/001.pdf` (`app.js` `PDF_URL`) | Sayfa bağlantısı `#page={sayfa_no}` |
| PDF (aynı kaynaklı) | `/kitap/seadet-i-ebediyye.pdf` → Vercel `rewrites` ile yukarıdaki adrese | PDF.js bunu `rangeChunkSize 262144`, `disableAutoFetch` ile parça parça okur |
| Ses dosyaları | `https://www.hakikatkitabevi.net/audio/001/TISE-NNNN …mp3` (`AUDIO_BASE`) | CSP `media-src` izinli |
| Site | `https://www.ilmihal.org` | sitemap, RSS, paylaşım bağlantıları |
| GitHub | `https://github.com/raufenc/ilmihal` (index.html `sameAs`) | |
Uzak adreslerin bugün çalıştığı **doğrulanmadı** (bu iş ağ isteği yapmadı).

## 19. Görseller, yazı tipleri, PDF.js
- `gorsel/*.svg` (`tools/generate-gorseller.py` üretir): `ayrac.svg` 467 B (süslü ayraç, altın `#c9a84c`),
  `desen.svg` 1 238 B (64×64 tekrar deseni), `kapak.svg` 4 726 B (228×328 kapak çerçevesi), `madalyon.svg` /
  `madalyon-koyu.svg` 698 B (sekiz köşeli madalyon; koyu tema). CSS değişkenleriyle (`--desen`, `--madalyon`) kullanılır.
- `fonts/`: aileler ve ağırlıklar (`fontlar.css`, 25 `@font-face`, hepsi `font-display: swap`, `unicode-range` ile alt küme):
  **Literata** (okuma) 400 normal+italik, 600, 700 — latin, latin-ext;
  **Inter** (arayüz) 400, 500, 600, 700 — latin, latin-ext;
  **Amiri** (Arapça; lügatteki Osmanlıca yazılış) 400 normal+italik, 700 — arabic, latin, latin-ext.
  Arabic alt kümeleri 100–111 KB; yalnız `o` alanı gösterildiğinde iner.
- `vendor/pdfjs-5.4.624/`: `pdf.min.mjs` (481 KB), `pdf.worker.min.mjs` (1,13 MB), `LICENSE` (Apache-2.0),
  `BENIOKU.txt`. Yalnız okuyucudaki "Kitabın aslı" panelinde PDF sahîfesini tuvale çizmek için,
  ilk kullanımda `import()` ile yüklenir. cmaps/standard_fonts klasörü yok.

## 20. `silsile-atlasi/veri.js` (şema özeti)
`const SILSILE = [...]` (37 kayıt; `const` olduğu için `window.SILSILE` değildir). Alanlar:
`id` (1–37), `ad`, `tam_ad`, `lakap`, `asir` ("VII. Yüzyıl"), `dogum`, `vefat` (mîlâdî dizge, "~573" olabilir),
`hicri` ("v. h. 13"), `sehir`, `ulke`, `bolge`, `koordinat` ([enlem, boylam]), `halka` (0 = feyz kaynağı,
1–35 halkalar, `null` = kitabı hazırlayan), `biyografi`, `hal_tercemesi`, `kaynak` ("…, s. 1090–1091"),
`portre` (37'sinde `null`), `hoca` (isteğe bağlı; 2 kayıtta, ek feyz alınan halka id'leri).
`sahislarData` ile slug bağı **yoktur** (eşleştirme yalnız isimle yapılabilir; denenmedi).
Arazi dokuları `silsile-atlasi/doku/` (`tools/silsile-arazi.py`).

---

## 21. Yükleme maliyeti ve bölme önerileri (yalnız öneri)

Bugün ilk açılışta inenler (gzip): `data.js` 56 KB + `tanimlar.js` 33 KB + `crossref.js` 5 KB +
`arama-sozluk.js` 17 KB + `okuma-plani.js` 6 KB + `app.js` 81 KB ≈ **198 KB veri+kod**; ardından
1,5 sn (ana sayfa) / 5 sn (diğer) sonra arka planda **`sozluk-data.js` 1,09 MB** (arama ve madde içi
sözlük vurgusu için). Bir madde açılınca o kısmın tamamı (390–541 KB gzip) iner.

| İhtiyaç | Gerekli veri | Öneri |
|---|---|---|
| İlk açılış (ana sayfa, fihrist) | `tocData` (10 KB gzip) | `toc.json` ayrı; `tablolarData`'yı ayır |
| Madde okuma | Tek maddenin metni | **Madde başına JSON** (`metin/1/43.json`): medyan ≈4,8 KB, en çok 41,6 KB gzip — kısım dosyası yerine 100 kat küçük |
| Madde altı ilişkiler | crossref (5 KB), ilgili şahıslar, tablolar, ses aralığı | Madde başına "yan veri" dosyasında birleştirilebilir; ya da `sahislar` için `slug→{isim,unvan}` küçük indeks + madde→slug listesi |
| Madde içi lügat vurgusu | `{i,k}` + kök indeksi | `k`'lar ve `i`'ler küçük indekste (≈birkaç yüz KB), `a/m/o` tıklanınca terim parçasından (harf başına dosya) |
| Lügat sayfası | 9 863 kayıt | Harf başına dosya; `m` alanı (1,35 MB ham) ayrı parçada |
| Hükümler | 7 158 | `tur × katman` başına dosya (ör. `acik` tamamı 261 KB gzip); `baglam` tembel |
| Tam metin arama | 3 kısmın tamamı (1,46 MB gzip) | Derleme anında üretilmiş ters indeks (sunucusuz) ya da bugünkü gibi ihtiyaç anında |
| Ses | `audioMap` 10 KB + `sesAraligiMap` | Madde başına çözülmüş URL listesi (derleme anında) |
| Şahıs sayfası | tek şahıs | Şahıs başına JSON veya 40 KB'lık (gzip) biyografisiz liste + tembel biyografi |

---

## 22. Yeni veri katmanı için kontrol listesi
1. Tek bir `maddeKimligi(k, m)` / `cozKimlik(x)` yardımcısı yaz; yedi biçimi (§ 1.1) oraya bağla.
2. Metni `texts/*.json`'dan oku; `maddeler-data.js`'e gerek yok. § 3.3 paragraf kurallarını aynen uygula
   (⟦şekil⟧, ⟦cedvel⟧, şiir, `<pre>`, dipnot, ara başlık). Metin düz metindir; her zaman kaçışla (escape) bas.
3. Şahıs slug'ını veri dosyasından al, asla hesaplama.
4. Lügatte anahtar `i`'dir; `k` benzersiz değildir.
5. Sahîfe bilgisi paragraf düzeyinde yoktur; yalnız madde başı/sonu ve kayıtların kendi `sayfa`/`s` alanları.
6. `sesAraligiMap`, `quizSorulari` ve diğer gömülü sabitleri `app.js`'ten çıkar (bugün kodun içinde).
7. `ayet_hadis_data.json`'u kullanma.
8. `okuma-plani` ve diğer `localStorage` anahtarlarını aynen koru.
9. `api/rss.js` ve `sitemap.xml`'i `tocData`'dan üret (bugün elle kopyalanmış).
