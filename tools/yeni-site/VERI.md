# Veri katmanı — API başvurusu

Görünüm yazan için tek kaynak budur; kaynak veri dosyalarını açmanız gerekmez.

```js
import { veri, maddeKimlik, paragraflar, lugatIsaretle, VeriHatasi } from '/js/cekirdek/veri.js';
```
- Üretim: `node tools/yeni-site/veri-uret.mjs` → `veri/` baştan yazılır (deterministik). Sınama: `node tools/yeni-site/veri-sina.mjs [-v]`.
- `veri/` yalnız JSON içerir; elle düzenlenmez. Kaynak (kökteki `*.js`, `texts/*.json`, `app.js` sabitleri) değişince yeniden üretin.
- **Kitabın metni aynen gelir** (madde, hüküm, âyet/hadîs meâli, tanım, biyografi): kırpılmamış, tırnağı/boşluğu değiştirilmemiş
  düz metin. HTML yoktur → **daima kaçışla basın** (`textContent`). Çizim kuralları `paragraflar()`'dadır.

## 1. Ortak sözleşme
- **Madde atfı her parçada tek biçimdedir: `"1-43"`** (kısım-no). Bağlantı için `maddeKimlik.yol("1-43")` → `/madde/1/43`.
  Maddeye bağlı olmayan kayıtta `madde: null` gelir (§ 8) — bağlantı çizmeyin.
- Sahîfe = kitabın basılı sahîfesi (1–1248). Maddeler 17–1058 arasıdır. PDF: `fihrist.kitap.pdf + '#page=' + sahife`.
- Boş olabilecek alanlar `null`'dır (eksik anahtar yoktur); kaynakta boş dizge olanlar `''` kalır (ör. `unvan`, `baglam`).
- Her yükleyici **söz (Promise)** döndürür ve son bağımsız değişken olarak `{ sinyal }` alır:
  `await veri.madde(1, 43, { sinyal: baglam.sinyal })`. Aynı parça ikinci kez inmez; eşzamanlı çağrılar tek isteği paylaşır;
  dönen nesne **paylaşılır — değiştirmeyin** (kopyalayın).

### Hatalar
Yükleyiciler `VeriHatasi` ile reddeder: `{ name, message, parca, tur, durum }`. `message` Türkçedir ve parçayı söyler
(`"madde/1-43.json" bulunamadı (404)`). `tur`:

| tur | ne zaman | yeniden denendi mi | görünüm ne yapsın |
|---|---|---|---|
| `bulunamadi` | 404 | hayır | "bulunamadı" sayfası |
| `gecersiz` | kimlik/ad tanınmadı; istek gitmez | — | "bulunamadı" sayfası |
| `cevrimdisi` | istek düştü ve `navigator.onLine === false` (istek yine gönderilir: service worker önbellekten verebilir) | hayır | "Bağlantı yok" + Yeniden dene düğmesi |
| `zaman-asimi` | 20 sn'de cevap yok | 1 kez | Yeniden dene düğmesi |
| `ag` / `sunucu` | fetch düştü / 5xx | 1 kez | Yeniden dene düğmesi |
| `bozuk` | JSON okunamadı | 1 kez | Yeniden dene düğmesi |
| `iptal` | `sinyal` iptal edildi (`name === 'AbortError'`) | — | **sessizce yok sayın** |

Başarısız istek bellekte kalmaz: aynı yükleyiciyi yeniden çağırmak yeniden dener. İptal yalnız o çağıranı düşürür.

## 2. `maddeKimlik`
| İşlev | Dönüş |
|---|---|
| `coz(x)` / `coz(k, n)` | `{kisim, no}` ya da `null` (biçim bozuk, `null` alan, aralık dışı: 1/1–98, 2/1–73, 3/1–70) |
| `anahtar(x)` | `"1-43"` · `yol(x)` → `"/madde/1/43"` · `egik(x)` → `"1/43"` (eski localStorage anahtarları) · `esit(a, b)` |

Kabul edilen biçimler (envanterdeki yedisi + ekler): `{kisim, madde_no}` · `"1/43"` · `"K1/M43"` · `{kisim, madde}` ·
`{kisim, maddeNo}` · `{k, m}` · `("kisim1.json", "43")` / `{dosya, anahtar}` / `"kisim1.json#43"` · `"1-43"` · `{kisim, no}` ·
`(1, 43)` · `[1, 43]` · `"/madde/1/43"`. `"Tüm Kısımlar"`, `""`, `{kisim:null}` → `null`.

## 3. Fihrist ve madde
**`veri.fihrist()`** — ilk açılışta inen tek parça (≈10 KB gzip).
```json
{ "kitap": {"ad":"Se’âdet-i Ebediyye","sahifeSayisi":1248,"pdf":"https://www.hakikatkitabevi.net/downloads/001.pdf"},
  "kisimlar": [{"no":1,"ad":"Birinci Kısım","romen":"I","aciklama":"İman ve Ehl-i sünnet itikadı; …","maddeSayisi":98}, …],
  "maddeler": [{"kisim":1,"no":1,"baslik":"Muhammed aleyhisselâma uymak, se’âdete kavuşdurur","sahife":[17,21],
                "mektup":"Mektûbât 1/114","uzunluk":16658,"ses":true,"ozet":true}, …] }
```
Ayrıca `sayilar: {madde, lugat, sahis, hukum, hukumAcik, ayet, hadis, tablo, tanim, sual, rehber}` (dizinlerin kayıt sayıları; ana sayfa ve Fevâid için, ek istek gerekmez).
`maddeler` kitabın sırasıdır (241). `mektup` 133 maddede `null`. `uzunluk` okuma süresi içindir (harf; `metin.length` değil).
`ses:false` 14 madde. Başlık için **daima** buradaki `baslik` (metnin ilk satırı başlık değildir).

Yardımcılar (hepsi fihristi kullanır): `veri.kisim(no)` → kısım nesnesi | null · `veri.maddeKunye(x)` → fihrist satırı | null ·
`veri.komsu(x)` → `{onceki, sonraki}` (fihrist satırları; kısım sınırını geçer; kitabın başında/sonunda `null`) ·
`veri.sahifedenMadde(sahife)` → **dizi**: bir sahîfeyi 2 madde paylaşabilir; 1–16 ve 1059+ için `[]`.
`veri.ozetler()` → `{ozetler: {"1-1": "…", …}}` (241; özet maddenin ilk paragraflarından ~250 harf, 214'ü `…` ile biter).

**`veri.madde(x)`** — tek istek (medyan 5 KB, en çok 45 KB gzip). `x` §2'deki her biçim.
```json
{ "madde":"1-43","kisim":1,"no":43,"sira":42,"baslik":"Tevbe, vera’ ve takvâ","sahife":[97,100],"pdfSahife":[97,100],
  "mektup":{"ref":"2—66","kisa":"Mektûbât 2/66","uzun":"İmâm-ı Rabbânî hazretlerinin (Mektûbât) kitâbı, 2. cild, 66. mektûb"},
  "onceki":"1-42","sonraki":"1-44","uzunluk":11612,"ozet":"Bu mektûb, …","metin":"43 — İKİNCİ CİLD, 66. cı MEKTÛB\n\nBu mektûb, …",
  "isaretler":[], "atiflar":[{"madde":"1-46","neden":"aynı konu"}, …],
  "tablolar":[{"id":"tovbe_sartlari","parca":"tovbe-sartlari","baslik":"Tevbe Şartları","tip":"flowchart","sahife":98}],
  "sahislar":[{"slug":"ali","isim":"Alî","unvan":"radıyallahü anh","kategori":"sahabi"}, …],
  "ayetler":[{"metin":"Ey mü’minler! …","sure":"Nûr","ayetNo":"otuzbirinci","sahife":97}],
  "hadisler":[{"metin":"Bir nemâzı özrsüz, …","kaynak":"Tergîb-üs-salât","sahife":98}],
  "hukumSayisi":{"acik":9,"tum":29}, "lugatSayisi":151,
  "ses":{"aralik":[97,0,99,null],"aralikKaynagi":"harita","parcalar":[{"kayit":97,"adres":"https://www.hakikatkitabevi.net/audio/001/TISE-0097%2043%202.cild%2066.mektub.mp3","bas":0,"son":null}, …]} }
```
- `mektup`: `null` olabilir. `onceki`/`sonraki`: kitabın ilk/son maddesinde `null`.
- `isaretler`: `[{tur:'sekil'|'cedvel', sahife, paragraf, adres}]` — `paragraf`, `paragraflar(metin)` dizisindeki sıra no'dur;
  `adres` kitabın PDF'inde o sahîfe. Yalnız 4 maddede dolu (`1/59`, `1/60`, `1/65`, `1/89`).
- `atiflar[].neden`: `madde referansı` (bu madde ona atıf yapıyor) · `atıf yapan madde` · `aynı konu` (otomatik benzerlik) ·
  `önceki madde` · `sonraki madde`. Önerilen sıra/etiket: referans "Kitapta atıf", atıf yapan "Bu maddeye atıf yapan", aynı konu "Yakın konu".
- `sahislar`: adı bu maddede geçen hâl tercemeleri (sözlük sırası). `ayetler.sure`/`ayetNo` ve `hadisler.kaynak` `null` olabilir;
  `ayetNo` **yazıyla** sıra sayısıdır (`"doksansekizinci"`), sayıya çevirmeyin.
- `ses`: `null` = seslendirilmemiş. Çalma: `parcalar` sırayla; ilk parçada `bas` saniyeden başla, `son` `null` değilse orada dur.
  `kayit` ses kaydının no'sudur, sahîfe değildir. Aralıkta kaydı eksik numaralar zaten atlanmıştır (`1/60`'ta 6 kayıt yok).
- `hukumSayisi` 0 olabilir (82 maddede hiç hüküm yok) → bağlantıyı gizleyin.

**`veri.maddeLugat(x)`** — maddedeki lügat kelimeleri (ayrı istek, metin göründükten sonra; medyan 9 KB gzip).
```json
{ "madde":"1-43", "kelimeler":{"abdest":15,"afv":88,"afvı":88, …},
  "terimler":{"15":{"kelime":"ABDEST","osmanlica":"آبدست","anlam":"“El suyu” mânâsına …","koken":"F","bakiniz":null,"misalVar":true,"parca":"a"}} }
```
`kelimeler`: metindeki kelime biçimi (Türkçe küçük harf) → terim `id`. Konumları **kendiniz aramayın**, `lugatIsaretle` kullanın.
Misal ya da tam kayıt için `veri.lugatTerim(id)`. Ön yükleme: `veri.onYukle(x, { lugat: true })` (boşta, düşük öncelik, hatayı yutar;
okuyucuda `sonraki` madde için çağırın).

### Metin çizimi: `paragraflar(metin)` ve `lugatIsaretle(metin, kelimeler)` (saf işlevler, istek yok)
`paragraflar(metin)` → `[{sira, tur, bas, son, metin, lugat, sahife?, icerik?}]` — eski sitenin `maddeMetniHTML` kuralları:

| tur | çizim |
|---|---|
| `paragraf` | `<p>` |
| `baslik` | ara başlık (≤160 harf, harflerin ≥%70'i büyük) |
| `siir` | satırlar `<br>` ile (manzûme) |
| `dipnot` | `[1] …` ile başlayan dipnot |
| `tablo` | çok satırlı, hizalı metin → `<pre>` (boşlukları koruyun) |
| `cedvel` | `icerik` → `<pre>` + "Kitaptaki aslı: `sahife`. sahîfe" bağlantısı |
| `sekil` | metin yok; "Kitapta burada bir şekil vardır" + `sahife` bağlantısı |
| `bos` | çizmeyin (pratikte yok) |

`lugatIsaretle(metin, kelimeler)` → `[{bas, son, id}]`: metin içindeki konumlar, artan sırada, yalnız `lugat:true` paragraflarda.
Eski sitenin vurgusuyla birebir aynıdır (sınandı: 241 madde, 117 308 vurgu). Çizim: paragrafı `p.bas..p.son` aralığında, araya
düşen aralıkları `<span class="zor-kelime" data-id>` ile sararak, geri kalanını `textContent` ile basın.
Tek satırlı `paragraf`larda çoklu boşluk 9 yerde hizadır → `white-space: pre-wrap` ile çizin. Parantez dengesi 24 maddede tutmaz; çizici buna güvenmesin.

## 4. Lügat (9 863 terim)
- `veri.lugatDizin()` → `{sayi, harfler:[{harf:"A",sayi:617,parcalar:["a"]}, …], parcalar:[{ad:"a",harf:"A",sayi:617,ilk:"ÂBÂ",son:"AZZE VE CELLE",araliklar:[[1,206],[208,618]]}, …], kokenler:{"A":{"ad":"Arapça","sayi":8264}, "İ":{"ad":null,"sayi":11}, …}}`.
  Harf sırası Türkçe alfabedir; `Â→A, Î→İ, Û→U` sayılır. Büyük harfler parçalıdır (`M`: `m-1, m-2, m-3`; `H`, `İ` ikişer).
- `veri.lugatHarf("M")` → o harfin bütün terimleri (parçaları birleştirir). `veri.lugatParca("m-2")` → `{parca, harf, terimler:[…]}`.
- Terim kaydı: `{"id":619,"kelime":"BÂB","osmanlica":"باب","anlam":"1.Kapı. 2.…","misal":null,"bakiniz":null,"koken":"A","kaynakSahife":"53"}`.
  `osmanlica` 39'unda, `misal` 6 174'ünde, `bakiniz` 9 644'ünde `null`. `osmanlica` Arap harflidir → `lang="ar" dir="rtl"`.
- `veri.lugatTerim(id)` → tam kayıt | `null`. `veri.lugatTerimler()` → `{terimler:[{id, kelime}]}` (9 863; arama ve "Bkz." için, 78 KB gzip — yalnız gerekince).
- **Kimlik `id`'dir; `kelime` benzersiz değildir** (55 terim yinelenir) — liste anahtarı, çapa (`#sozluk-entry-{id}`) `id` ile.
- `bakiniz` hedefini `kelime` ile ararken büyük/küçük harf ve şapka farkını yok sayın; 100'ü yine bulunamaz → düz metin gösterin.
- `koken` adı `kokenler[koken].ad`; `İ` (11), `E` (1), `B` (1) için `null` → kodu olduğu gibi gösterin ya da hiç göstermeyin.
- `kaynakSahife` hangi eserin sahîfesi olduğu belirsizdir; göstermeyin.

## 5. Hâl tercemeleri (1 024 kişi)
- `veri.sahislarDizin()` → `{sayi, kategoriler:{alim:592, diger:261, hukumdar:49, peygamber:25, sahabi:97}, sahislar:[…]}` (76 KB gzip;
  liste sayfası için). Satır: `{"slug":"abbas","isim":"Abbâs","unvan":"radıyallahü anh","kategori":"sahabi","no":1,"giris":"Abdülmuttalibin en küçük oğludur. …","maddeSayisi":7}`.
  `giris` biyografinin ilk ~160 harfidir (önizleme; `…` ile kesik olabilir).
- `veri.sahis(slug)` → tam kayıt | `null` (dizin gerekmez; tek küçük parça iner):
  `{slug, isim, unvan, kategori, no, biyografi, kaynak, maddeler:["1-31", …], sahifeler:[62, …]}`.
- **slug'ı asla isimden hesaplamayın** (172'si hesapla tutmaz); yalnız gelen `slug`. URL `/sahis/{slug}`.
- `unvan` 271 kişide `''`; `no` 4 kişide `null`; `maddeler` 278, `sahifeler` 169 kişide boş dizi. `isim` benzersiz değil (18 isim):
  aynı isimlileri `no` ile ayırın. `biyografi` içinde `\n` paragraf ayırır; 81'i "… ismine bakınız!" yönlendirmesidir.
  `ibni-cezeri`'nin sahîfesi 1249'dur (kitap 1248) — bağlantıyı 1248 ile sınırlayın.

## 6. Fıkhî hükümler (7 158)
- `veri.hukumlerDizin()` → `{sayi, turler:["farz","vacib","sunnet","mustehab","mubah","mekruh","haram"], katmanlar:["acik","tum"], sayilar:{farz:{acik:505,tum:876}, …}}`.
- `veri.hukumler(tur, katman = 'acik')` → `{tur, katman, hukumler:[{"id":2,"metin":"Ona uymak için, …","sahife":17,"sahifeBitis":null,"altTur":"farz / farzları","baglam":"","madde":"1-1"}]}`.
  Her tür × katman parçası vardır (boş olan `hukumler: []`, ör. `mustehab-tum`). "Açık" sekmesi `acik`, "toplam" sekmesi `tum`;
  **ikisini birleştirmeyin** (aynı cümle iki katmanda da bulunur). Aynı cümle birden çok türde de bulunabilir (tasarım).
- `altTur` 310'unda `''`, `baglam` 5 201'inde `''` (1 454'ü `…` ile kesik), `sahifeBitis` çoğunda `null`.
- `madde: null` tek kayıt (id 3917, s. 1173): onda ek alan `konu: "Hâl tercemeleri"` vardır.

## 7. Diğer parçalar
- `veri.ayetHadis()` → `{ayetler:[{metin, sure, ayetNo, sahife, madde}] (193), hadisler:[{metin, kaynak, sahife, madde}] (449)}`.
  `madde` âyetlerde 3, hadîslerde 4 kayıtta `null` (önsöz ve hâl tercemeleri sahîfeleri) → yalnız sahîfe bağlantısı.
- `veri.tanimlar()` → `{tanimlar:[{"terim":"Acrabadin","cumle":"Hastalıkların ilâclarını …","sahife":652,"madde":"2-46"}]}` (510).
  `madde` kaynakta yoktur, sahîfeden bulunmuştur (paylaşılan sahîfede cümlenin geçtiği madde); 32'sinde `null`. `terim` yinelenir (`Dünyâ`, `Mevdû’`).
- `veri.tablolar()` → `{sayi, kategoriler:[{ad:"itikat",etiket:"İman ve İtikat",sayi:14}, …], tablolar:[{id,parca,baslik,tip,kategori,kaynakMadde,sahife}]}`.
  `kategoriler` gösterim sırasındadır; `genel`'in `etiket`'i `null`.
- `veri.tablo(id)` (`"iman_sartlari"` ya da `"iman-sartlari"`) → `{id, parca, baslik, tip, kategori, kaynakMadde, kaynakNotu, sahife,
  kaynakMetin, aciklama, kolonlar, kolonlarTam, solBaslik, sagBaslik, veriler, dallar, maddeAtiflari?}`. `tip`'e göre:
  `tablo`: `veriler` = satır nesneleri; **sütun listesi için `kolonlarTam`** (`kolonlar`'da olmayan `Vâcib` sütunu `namaz_rekatlari`'nda) ·
  `liste`: `[{madde, durum}]` (`durum` çift yazımlı: `sünnet`/`sunnet`, `sebep`/`sebeb` — süzerken birleştirin) ·
  `flowchart`: `[{baslik, aciklama}]` · `iki_liste`: `{solAnahtar:[…], sağAnahtar:[…]}` (anahtar adları değişir; ilk anahtar sol) + `solBaslik/sagBaslik` ·
  `agac`: `konu_haritasi`'nda `veriler:[{id,baslik,maddeler:["K1/M1",…]}]` + çözülmüş `maddeAtiflari:[{id, maddeler:["1-1",…]}]`;
  diğer ikisinde `veriler:null`, `dallar:[{baslik, aciklama, alt?}]` (özyineli) · `tanimlar`: `veriler:null` → içeriği `veri.tanimlar()`'dan alın.
  `kaynakMadde` 3 tabloda `null` (`kaynakNotu` 1'inde `"Tüm Kısımlar"`); `kaynakMetin` 1'inde `null`. `veriler` sitenin derlemesidir, kitap metni değildir.
- `veri.konular()` → `{konular:[{id:"iman",baslik:"İman ve İtikat",maddeler:["1-1",…]}]}` (fihristi konuya göre süzmek için).
- `veri.rehberler()` → `{rehberler:[{id,baslik,aciklama,ikon,renk,bolumler:[{baslik, maddeler:[{madde:"1-52",not:"Abdest almak. …"}]}]}]}` (8);
  `veri.rehber(id)`. `ikon` satır içi SVG dizgesidir (kendi verimiz; `innerHTML` ile basılabilir). `not` madde başlığıdır.
- `veri.gununSualleri()` → `{sualler:[{soru, madde, baslik, resmi}]}` (155). `veri.gununSuali(tarih = bugün)` → `{sira, soru, madde, baslik, resmi}`;
  `tarih` `Date` ya da `"YYYY-MM-DD"` (yerel gün). Eski siteyle aynı gün aynı suâl.
- `veri.testSorulari()` → `{konular:[{id:"iman",ad:"İman ve İtikat",karisik:false,sorular:[{soru,siklar:[…],dogru:0,aciklama,madde}]}]}`.
  `karisik` konusunun `sorular`'ı boştur: diğer bütün konulardan karıştırıp 10 soru seçin (eski davranış). `aciklama` sonunda `(K1/M46)` atfı taşır.
- `veri.arama()` → `{esAnlamlilar:{"namaz":["nemaz","salat","salah"], …} (392; anahtar küçük harf, şapkasız), sorular:[{ifadeler:[…],madde,cevapOzet}] (229)}`.
  `cevapOzet` sitenin yazdığı özettir (kitap metni değil).
- `veri.okumaPlani()` → `{dakikadaHarf:1100, sureler:[{gun:30,ad:"30 gün"},…], anahtarlar:{plan:"ilmihal-hatim",…}, uzunluklar:[…241, fihrist sırasıyla]}`.
  localStorage anahtarlarını **aynen** kullanın; içlerinde madde `"1/43"` biçimindedir (`maddeKimlik.egik`).
- `veri.surum()` → `{surum:"27197607d263", dosyaSayisi:696}` (örnek) (çıktının karması; önbellek kırma/hata raporu için).
- Ayar (yalnız sınama/özel kök): `veri.ayarla({kok:'/veri/', zamanAsimi:20000, yenidenBekleme:600})`; `veri.bellegiBosalt()`.

## 8. Bilinen veri tutarsızlıkları (düzeltilmedi; görünüm böyle davransın)
| Durum | Ne yapmalı |
|---|---|
| `madde: null` (hüküm 1, âyet 3, hadîs 4, tanım 32, tablo 3) | Madde bağlantısı çizme; sahîfe bağlantısı ver |
| Madde metni `N — ` ile başlar; `1/59` `–` ile; `1/1`, `2/1`, `3/1` kitap/kısım başlığıyla | Başlığı metinden çıkarmaya çalışma; `baslik` kullan |
| Kitabın kendi sahîfe atıfları (`… 123. cü sahîfe`) 4'ü 1248'den büyük | Bağlantıyı 1–1248 dışında çizme |
| Sesi olmayan 14 madde (`ses: null`) | Ses düğmesini gizle |
| Lügat: yinelenen `kelime`, eksik köken adı, bulunamayan `bakiniz` | § 4 |
| Şahıs: aynı isim, boş `unvan`, `no: null`, s. 1249 | § 5 |
| Tablo: `kolonlar` eksik sütun, `durum` çift yazım | § 7 (`kolonlarTam`, birleştir) |
| Hüküm metni 42 kayıtta maddede aynen geçmez; âyet 1, hadîs 1 de öyle | Metinde vurgulamaya/kaydırmaya çalışırken bulunamazsa sessizce vazgeç |
| `ayet_hadis_data.json`, `maddeler-data.js` | Kullanılmıyor (veri katmanına alınmadı) |

## 9. Parçalar ve boyutlar
`fihrist.json` 9,9 KB gzip (ilk açılışta tek istek) · `madde/<k>-<n>.json` 241 (medyan 5,3, en çok 44,8 KB) ·
`lugat-madde/<k>-<n>.json` 241 (medyan 9,4, en çok 42 KB) · `lugat/<harf>.json` 31 + `dizin`, `terimler` · `sahislar/<a-z>.json` 23 + `dizin` ·
`hukumler/<tur>-<katman>.json` 14 + `dizin` · `tablolar/<id>.json` 130 + `dizin` · tekil: `ozetler, konular, ayet-hadis, tanimlar, rehberler,
gunun-sualleri, test-sorulari, arama, okuma-plani, surum`. Toplam ≈21,8 MB ham / 6,9 MB gzip; bir ziyaretçi yalnız açtığını indirir.
Lügat harf adları: `ç→cc, ğ→gg, ı→ii, ö→oo, ş→ss, ü→uu` (adları kendiniz kurmayın, dizinden alın).

## Sınama sonucu
<!-- sinama-basla -->
Son çalıştırma: 2026-11-17 · 94 denetim, **94 geçti**, 0 kaldı.

0. Genel 8/8 · a. Metin sadakati 4/4 · b. Kayıt sayıları 20/20 · c. Bağlar 6/6 · d. maddeKimlik 17/17 · e. Lügat vurgusu 1/1 · e2. Yayın dışı 12/12 · f. veri.js canlı 26/26

Her denetimin adı için: `node tools/yeni-site/veri-sina.mjs -v`
<!-- sinama-bitis -->

## Yayın dışı listesi

Kitaptan sonradan derlenmiş veriden, denetimde (tools/yeni-site/denetim/) kitaba aykırı ya da dayanaksız
çıkan kayıtlar **`tools/yeni-site/yayin-disi.mjs`** içinde listelenir ve üretim sırasında süzülür
(`veri-uret.mjs` → `kaynaklariOku()`, `arama-uret.mjs`). Kaynak dosyalar değişmez; çekilen kayıt `veri/` ve
`veri-arama/` altına hiç yazılmaz. Kapsam: çekilen tablolar (`tablolar/dizin.json` → `geriCekilen`; adresi
açana not gösterilir), günün suâlinden çıkarılan kayıtlar, hadîs olmayan kayıtlar ve hadîslerin `kaynak`
alanı, arama cevap özetleri, lügatten çekilen kayıtlar ve bozuk Arap harfli yazımlar, okuyucudaki kenar
notlarının kara listesi. Kenar notlarında özel isim ve salât-selâm kuralı çalışma zamanındadır:
`lugatIsaretle(metin, kelimeler, terimler)` (üçüncü bağımsız değişken verilince uygulanır).
Fıkhî hükümler dizini ayrı anahtarla kapalıdır: `js/cekirdek/ayar.js` → `HUKUMLER_ACIK`.
Bir kayıt, düzeltilip kitabın metniyle yeniden denetlenmeden ve Rauf onaylamadan listeden çıkarılmaz.
