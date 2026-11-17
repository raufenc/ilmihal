# Fıkhî Hükümler dizini — MUBÂH, MEKRÛH, HARÂM denetimi (hukumler-2)

Denetlenen veri: `veri/hukumler/{mubah,mekruh,haram}-{acik,tum}.json` (Excel'den `tools/excel-to-hukumler.py` ile aktarılmış).
Ölçüt: kitabın metni (`veri/madde/*.json`). Hiçbir veri ya da site dosyası değiştirilmedi.
Bulgu listesi: `tools/yeni-site/denetim/hukumler-2.json` (697 kayıt). Betikler, okuma parçaları ve kayıt kayıt kararlar:
`tools/yeni-site/denetim/betik-hukumler-2/` (`tara.mjs`, `dok.py`, `tum.py`, `kapsam.mjs`, `topla.py`, `OKUMA-YONERGESI.md`,
`oku-*.txt`, `karar-oku-*.jsonl`, `tarama.json`, `kapsam.json`, `istatistik.json`).

## 1. Yöntem ve kapsam

| Adım | Ne yapıldı | Kapsam |
|---|---|---|
| Betik taraması | Her kaydın `metin`i normalleştirilerek (`js/cekirdek/metin.js` `duzle`) belirtilen maddede, yoksa bütün kitapta arandı; sahîfenin maddenin aralığında olup olmadığı; tür kelimesi; başka hüküm kelimesi; olumsuzluk/mezhep/kavl işaretleri; kesik cümle; yinelenme; aynı cümlenin birden çok türde bulunması; "Mescid-i harâm"/"Harem" gibi anlam dışı geçişler | **3.349 kaydın tamamı** (mubâh 122+210, mekrûh 420+613, harâm 657+1.327) |
| TAM okuma, `acik` | Her kayıt, kitaptaki önceki ve sonraki metinle (gerekirse maddenin tamamıyla) birlikte okundu; her kayda karar verildi | **1.199 / 1.199** (mubâh 122, mekrûh 420, harâm 657). Okunmadan kalan kayıt yok |
| Örnekleme, `tum` | Her türden sabit tohumla (20261117) rastgele 100 kayıt + açık katmanda bulunmayıp betiğin şüpheli bulduğu kayıtların tamamı | 300 örneklem + 458 şüpheli (mubâh 28, mekrûh 133, harâm 297) = **758 kayıt okundu** |
| Ters yön kapsam | Sabit tohumla seçilen 12 fıkıh maddesinde (1-67, 1-74, 1-78, 1-79, 1-84, 2-40, 2-42, 2-44, 3-3, 3-4, 3-5, 3-10) açık hüküm kalıbı taşıyan bütün cümleler çıkarılıp dizinde arandı; kaçanlardan 45'i okundu | §5 |

Okuma, ortak bir yönergeyle (`OKUMA-YONERGESI.md`: kalıp kodları ve ayar örnekleri) 100–230 kayıtlık parçalara bölünerek
yapıldı. Her karar dosyasının satır sayısı ve kimlikleri okuma dosyasıyla betikle karşılaştırıldı: 17 dosyada eksik ya da fazla
kayıt yok. Ağır (K) bulguların bir kısmı ayrıca kitap metninde yeniden açılıp doğrulandı (#4095, #3957, #4327, #5994, #2898,
#4380, #4499, #6029, #3135, #3894): hepsi kitapla uyumlu çıktı.
**Bilinen sınır:** Okuyan parçalar arasında `BAGLAMSIZ` (öznesiz cümle) ve `HUKUMSUZ` (kelime yalnız anılıyor) ölçüsü tam
aynı uygulanmadı. Örneğin mekrûh-acik-02'de 110 kayıttan 17'si Y aldı, harâm-acik-04'te 110 kayıttan 51'i. Bu yüzden Y
sayıları ±%5 kadar oynak sayılmalıdır. K sayıları daha sağlamdır.

## 2. Betik taraması sonuçları (bütün kayıtlar)

- **Kitapta bulunma:** 3.349 kaydın 3.344'ü belirtilen maddede aynen var. Bulunamayan 5 kayıt da yazım farkından:
  - #4384 / #5557: "(Kurret-ül’uyûn)" — kitapta "(Kurretül’uyûn)".
  - #5043: "Hülâsatül-kelâm" — kitapta "Hülâsat-ül-kelâm".
  - #3917 (mekrûh-tum): `madde: null`. Cümle 241 maddede yok; kitabın Hâl tercemeleri kısmında (`veri/sahislar`) var. s. 1173 doğrulanamadı.
  - **Uydurma (D) cümle yok.**
- **Madde ve sahîfe:** Bütün kayıtlar sahîfe bakımından atfedilen maddenin aralığında. Madde, sahîfeden hesaplandığı için bu
  beklenen bir sonuç. Madde içi doğrusal tahminle büyük sapma gösteren 4 kayıt maddede birden çok geçen kısa cümlelerdi. Bir
  kayıtta atıf karışmış: #4210 "Harâmdır." 1-54 s.142'ye atfedilmiş, ama bağlam alanı 2-39'daki sun'î ilkâh paragrafını
  gösteriyor (B). Sahîfe, maddeden ince düzeyde doğrulanamaz (madde metninde sahîfe işareti yok).
- **Tür kelimesi:** Her kayıtta türün kelimesi var (betik ölçüsüyle). Yani sınıflama kelime aramasıyla yapılmış. Sorun kelimenin
  bulunmasında değil, **hangi anlamda ve hangi hükümle** geçtiğinde.
- **Şüpheli işaretleri (açık katman):** Başka hüküm kelimesi 189; olumsuzluk/mezhep/kavl işareti 130; aynı cümle birden çok
  türde açık hüküm 28. Bunların hepsi tam okumada okundu.
- **Kesik cümle:** Betik ölçüsüyle yok. Okumada 26 kesik kayıt bulundu: parantez kapanmıyor, liste yarıda kesilmiş, "[m."
  kısaltmasında bölünmüş.
- **Yinelenme:** Aynı yerdeki aynı cümle için iki kayıt nadir. #3121/#3118 ve #3201/#3128: "Tahrîmen mekrûhdur." parçası, cümlenin kendisinden ayrıca kopartılmış.
- **"Tamamı" katmanı, açık katmanın üst kümesi:** Açıkların hepsi "Tamamı"nda da var. Mubâh'ta 88, mekrûh'ta 193, harâm'da 670 ek kayıt.

## 3. Tam okuma: `acik` katmanı (1.199 kayıt)

| Tür | Okunan | TAMAM | K | Y | (Y'nin BAGLAMSIZ olanı) | B | D | Sorunlu | BAGLAMSIZ hariç sorunlu |
|---|---|---|---|---|---|---|---|---|---|
| Mubâh | 122 | 53 | **5 (%4,1)** | 62 (%50,8) | 10 | 2 | 0 | 69 (**%56,6**) | 59 (%48,4) |
| Mekrûh | 420 | 292 | **12 (%2,9)** | 111 (%26,4) | 82 | 5 | 0 | 128 (**%30,5**) | 46 (%11,0) |
| Harâm | 657 | 395 | **43 (%6,5)** | 218 (%33,2) | 122 | 1 | 0 | 262 (**%39,9**) | 140 (%21,3) |
| **Toplam** | **1.199** | **740** | **60 (%5,0)** | **391 (%32,6)** | 214 | 8 (+1 betik) | 0 | **459 (%38,3)** | 245 (%20,4) |

Kalıp dağılımı (açık, sorunlular):
- BAGLAMSIZ 214
- HUKUMSUZ 109
- MEZHEP_GORUS 40
- SART_EKSIK 29
- BASKA_TUR 19
- OLUMSUZ 16
- ALTTUR 12
- "câiz"in sahîh anlamında olması / "câiz ama mekrûh" 7
- KESIK 6
- ANLAM_DISI 3
- YINELENME 2
- TAHRIMEN 1
- ATIF 1

K'ların 55'i kesin; 5'i kesin değil (#4208, #4319, #4320, #4350, #4499). BAGLAMSIZ Y'lerin 60'ı kesin değil: sitedeki
"Bağlam" alanı özneyi çoğunlukla veriyor.

### En önemli bulgular (kitaptan alıntıyla)

**1. Tütün bahsi (2-43): kitabın reddettiği görüşler "harâm" açık hükmü olarak duruyor (K, 21 kayıt; 3'ü kesin değil).**
Kitap: "Görülüyor ki, tütün harâmdır deyip, kesin söylenemez. Bunu ancak din câhili veyâ inâdcı, müte’assıb olan söyler." (2-43)
Derlemede harâm açık hükmü olarak duranlar:
- Karşı görüş ya da nakil:
  - #4306 "Hükûmet yasak edince, harâm olur." (Şâfi'î Necmeddîn-i Gazzî'nin sözü; nisbet önceki cümlede)
  - #4313 "Buna göre tütün de habîs ve harâm olur."
  - #4317 "Tütün aslında mubâh olsa da, bu sebeble harâm olur."
  - #4308, #4319, #4320, #4350
- Olumsuz cümleler:
  - #4327 "Görülüyor ki, tütün harâmdır deyip, kesin söylenemez."
  - #4329 "Tütün, isrâf olduğu için harâmdır da denilemez."
  - #4330 "Zararlı olduğundan harâmdır demek de ilmî bir söz değildir."
  - #4341, #4342, #4344 (soru cümlesi), #4348, #4349, #4358
- Hükmü halâl ya da mubâh olanlar: #4337, #4338, #4351, #4352. Son üçü aynı anda mubâh açık hükümlerinde de var.

Aynı bahiste mekrûh altında:
- #3219 "Kokusu mekrûhdur.", #3220 "Tab’an mekrûhdur."
- #3224 "Din bilgisi olan bir kimse, tütüne tahrîmen mekrûh diyemez." Bu cümle "tahrîmen mekrûh" etiketiyle açık hüküm olarak duruyor.
- #3228, #3229 (olumsuz)

Mubâh altında:
- #5994 "O hâlde tütün içmek, aslı üzere mubâhdır, halâldir." Kitapta bu cümle "Halâl diyenlere göre…" diye başlayan görüşün
  sonucudur, hemen ardından "Tehlükeli diyenler, belki dahâ haklıdır." gelir (2-43, kayıtta s. 631).

**2. Kitabın reddettiği ya da sınırladığı görüş, genel hüküm gibi duruyor (K, MEZHEP_GORUS 40).**
- #4095 (1-83) "Peygamber hakkı için yâhud ölü veyâ diri bir Velî hakkı için düâ etmek harâmdır." Kitap hemen ardından diyor ki:
  "Âlimlerin bir kısmı böyle ictihâd etdi ise de, böyle düâ etmek, (Yâ Rabbî, onlara vermiş olduğun hak için) niyyeti ile câiz olur."
- #3957 (1-54) "Altın tel ile bağlamak zarûret olmadığı için, harâm olur dedi." Bu İmâm-ı a'zamın sözüdür. Kitap ardından:
  "İmâm-ı Muhammedin “rahmetullahi teâlâ aleyh” kavli ile amel olunur." Oysa İmâm-ı Muhammed "Zarûret olduğu için altın ile bağlamak harâm olmaz" demişti.
- #4049 (1-71) "İbni Teymiyye, bu hadîs sakal kazımanın harâm olduğunu gösteriyor, dedi." (Kitap sonra bunu düzeltiyor.)
  Aynı yerde #4053 "…vücûbu gösterseydi, sakal kazımak harâm olurdu." (karşı-olgusal).
- #4131 (2-21) "21 — Şefâ’at istemek için gitmek de harâmdır diyor." Bu, kitabın reddettiği İbni Teymiyye sözlerinin listesinden.
  #4132 Hurûfî Fadl'ın sözü.
- Mekrûh altında:
  - #157, #2924, #2916: Mâlikî mezhebi nakli (El-fıkh-u alel-mezâhib-il-erbe’a). Mezhep kaydı nakl başında kalmış.
  - #3135 (1-71) "Yalnız kıldığı nemâzı da mekrûh olur." Kitap bu sözler için diyor ki: "…bunlara benzer sözlerin aslı yokdur, sâbit olmamışlardır".
- Mubâh altında:
  - #209 (1-64) farzı hareket hâlinde oturarak kılmanın "İmâm-ı a’zama göre câiz" olması. Ardından gelen "İmâmeyn ise, özrsüz câiz görmedi. Fetvâ da böyledir." düşmüş.
  - #5970 (2-17) "(Kitâb ile sünnetin bildirmediği herşey mubâhdır)". Bu, kitabın "iftirâ ediyor" dediği bir yazarın sözü.
- #4499 (3-15, kesin değil) "İnsanlara lâzım olan herşeyde ihtikâr harâmdır." Hemen önce "İmâmeyne göre, bunların hepsi
  ihtikârdır." deniyor, daha önce de "İlâclarda … ihtikâr harâm değildir."

**3. Asıl hükmü başka tür olan cümle (K, BASKA_TUR 19).**
- #4380 (2-47) "(Harâm olan şeylerin ilâc olarak içilmesi, bunun hastaya iyi geleceği bilinirse ve halâl olan ilâc bulunmazsa, câiz olur." Harâm açık hükmü olarak duruyor.
- #4479 (3-6) "…bununla alınanın yinmesi halâl olur"
- #4494 (3-12) zarûret hâlinde "câiz oldu"
- #4222, #4224, #4238 (2-40) "almak câiz olur" / "halâl olur"
- #3989 (1-58) "bakabilir"
- Hükmü küfr olanlar: #3937, #4115, #4116
- #5985 (2-40), mubâh açık hükmü olarak: "…mubâh yarışların … çoğu, kumâr veyâ başka harâmların karışmaları sebebi ile harâm olmakdadır."
- #3265 (3-6), mekrûh altında: "…tenzîhen mekrûh olan yere satması câizdir."

**4. "Tab'an mekrûh" (tabîatça hoşlanılmayan), fıkhî mekrûh gibi sunulmuş (K).**
#2898 (1-52) "Sigara içmek de şer’an değil, tab’an mekrûhdur." Önceki cümle: "…başkasının kullanması şer’an mekrûh değildir.
Tab’an mekrûhdur." #2897 bu "Tab’an mekrûhdur." parçasının tek başına kaydıdır. Aynı durum 2-43'te: #3220, #3219, #3784.

**5. Şart ya da istisnâ komşu cümlede kalmış (SART_EKSIK 29).**
- #6029 (3-19), mubâh: "Orada, onların malını almak mubâhdır." Kitapta hemen ardından: "Gönül rızâsı ile, gadr yapmadan almak câizdir." (devamında: diğer üç mezhebde câiz değildir).
- #3281 (3-26), mekrûh: "Böyle düşünerek de bunlara secde etmesi mekrûh olur." Söz mülcî ikrâh (öldürme tehdidi) altındaki kimse hakkındadır.
- #4466 "İki maldan biri veresiye olursa harâm olur." Fâiz şartı önceki cümlede.
- #4547 "Kadının aldığı ücret harâmdır [Şir’a]." Zinâ karşılığı ücret hakkında.
- #4460 "Çünki, istemek harâmdır." Ardından: "Ancak zarûret hâlinde mubâh olabilir."

**6. Mubâh açık hükümleri çoğunlukla mubâhlık bildirmiyor (Y, HUKUMSUZ 33 + "câiz" = sahîh 7).**
Kayıtların önemli bir kısmı mubâhın tarifi, "mubâhları azaltmak" tavsiyesi ya da niyetle mubâhın ibâdete dönmesi gibi
cümlelerdir. "Câiz" birkaç kayıtta "nemâz sahîh olur" anlamındadır: 233, 237, 238, 246, 610, 1394, 4163. Bunların bir kısmı kesin değil.

**7. Öznesiz cümleler (Y, BAGLAMSIZ 214).**
Örnekler: "Harâm olur." (#4048, #4112), "Harâmdır." (#4210), "İkisi de harâmdır." (#4461), "Tahrîmen mekrûhdur." (#3121,
#3201), "Fekat, mekrûhdur." (#3214), "Oruclu iken mekrûhdur.". Çoğunda sitedeki "Bağlam" alanı özneyi veriyor; bunlar hafif
sayıldı (60'ı kesin değil). Bazılarında ise bağlam alanı başka bir paragrafı gösteriyor (#3201: 2-40 şerâb parası paragrafı).

**8. `altTur` etiketi ile tahrîmen/tenzîhen ayrımı (ALTTUR 12, açık).**
- Metin iki derece veriyor, etiket tek: #3004 ("nemâzda … tahrîmen, başka yerlerde tenzîhen", etiket "tenzîhen"), #952, #3123, #3185, #3262.
- Metin "tahrîmen" ya da "harâma yakın" diyor, etiket düz "mekrûh": #3214, #3274.
- Metin "tenzîhen" diyor, etiket düz "mekrûh": #3235, #3236.
- Açık hüküm bildiren cümleler "tarif / atıf" etiketinde: #3150, #3160.
- Harâm altında "tahrîmen mekrûh" yalnız bir kayıtta: #4006, "Nemâz kılması tahrîmen mekrûh, ya’nî harâm olan zemân üçdür". Kitap kendisi "ya'nî harâm" diyor (Y, kesin değil).

## 4. Örnekleme: `tum` katmanı

| Tür | Kapsam | TAMAM | K | Y | B |
|---|---|---|---|---|---|
| Mubâh | Örneklem 100 | 72 | 2 | 24 | 2 |
| Mubâh | Şüpheli ek 28 | 25 | 0 | 3 | 0 |
| Mekrûh | Örneklem 100 | 72 | 2 | 26 | 0 |
| Mekrûh | Şüpheli ek 133 | 95 | 3 | 35 | 0 |
| Harâm | Örneklem 100 | 67 | 0 | 28 | 5 |
| Harâm | Şüpheli ek 297 | 193 | 0 | 94 | 10 |

Rastgele örneklemde sorunlu oran %28–33. Ağırlıklı olarak BAGLAMSIZ, ALTTUR ve OLUMSUZ.

**"Geçtiği yer" olmayan kayıtlar (ANLAM_DISI, harâm-tum'da 28).**
- 25'i "Mescid-i harâm" / "Harem-i Kâ’be" / "Meş’ar-i harâm" geçen cümleler. Örnekler:
  - #4981 "Mescid-i harâmın üstü açıkdır."
  - #4982 "Mescid-i harâm, dikdörtgen (Müstatîl) gibi olup…"
  - #4987 "Mescid-i harâm, muhtelif zemânlarda yenilenmişdir."
  - #5544 "Mescid-i harâma girip oturdum."
- #5043 ve #5179'da kelime kitap adında geçiyor: "beled-il-harâm", "(El-halâl vel-harâm)".
- #5861 bir sövme sözü.
- Bunların hiçbiri harâm hükmüyle ilgili değil; hepsi kaldırılmalı.

**Olumsuz cümle olumlu etikette (OLUMSUZ).** Harâm-tum'da 42, mekrûh-tum'da 19.
- Harâm-tum: "diğer geçiş" etiketinde tütünün harâm OLMADIĞINI söyleyen 20'ye yakın 2-43 cümlesi var (#5388, #5408, #5432, #5435, #5449, #5513–#5519…).
- #5887 "Hiçbirşey harâm değildir." Tek başına duruyor. Kitapta bu söz çocuk hakkındadır: "(Çocuğa hiçbir ibâdet, hattâ, Hanefîde zekât da farz değildir. Hiçbirşey harâm değildir."
- #5580 "Çalgı âletlerinin, kendileri harâm değildir." Hemen ardından gelen "Bunları çalmak ve dinlemek harâmdır." düşmüş.

**Etiket hükmü tersine çeviriyor (K, mekrûh-tum).**
- #3894 "…mekrûh olmaz diyenler varsa da, böyle de kılmak harâm olur." Etiketi "mekrûh değildir / istisnâ". Kitap (3-57): "Meyyiti câmi’ içine koyup nemâzını kılmak Hanefî ve Mâlikî mezheblerinde harâmdır."
- #3458 "…kısa kollu ile kılmak mekrûh olmaz demek doğru değildir." Etiketi "mekrûh değildir / istisnâ".

**Mubâh-tum.** Ana sorun etiket: hükmü vâcib, harâm, farz ya da mülkiyet olan cümleler "mubâhdır / câizdir" etiketiyle duruyor (6087, 6115, 6116, 6124, 6128, 6138, 6140, 6183 …).

## 5. Ters yön kapsam denetimi (12 madde)

Seçim: 30 fıkıh maddesinden sabit tohumla 12'si (1-67, 1-74, 1-78, 1-79, 1-84, 2-40, 2-42, 2-44, 3-3, 3-4, 3-5, 3-10).
Bu maddelerde açık hüküm kalıbı taşıyan bütün cümleler çıkarıldı:
- harâm: "harâmdır / harâm olur / harâm oldu…"
- mekrûh: "mekrûhdur / mekrûh olur / tahrîmen–tenzîhen mekrûh"
- mubâh: "mubâhdır / câizdir / câiz olur / halâldir / halâl olur"

Olumsuz olanlar ("değil", "olmaz", "denilemez"…) ayrıldı; kalan her cümle dizinde (aynı madde, metin içerme ilişkisi) arandı.

| Tür | Olumlu kalıp cümlesi | Açık katmanda | Tamamı'nda | Dizinde hiç yok |
|---|---|---|---|---|
| Harâm | 88 | 87 | 88 | **0** |
| Mekrûh | 44 | 42 | 42 | **2** ("Mekrûh olur." 1-84; "Tahrîmen mekrûhdur." 2-40) |
| Mubâh | 162 | 6 | 6 | **156** |

- **Harâm ve mekrûh:** Kelime kalıbıyla bulunan cümlelerin neredeyse tamamı dizinde. Dizin aynı yöntemle (kelime aramasıyla)
  kurulmuş görünüyor; bu yüzden bu sonuç yalnız kelime kalıbına giren cümlelerin kaçırılmadığını gösterir. Hükmü başka sözle
  bildiren cümleler bu denetimin dışındadır ("büyük günâhdır", "câiz değildir", "yapmamalıdır" gibi).
- **Mubâh, kesin değil, okumaya dayanan tahmin:** Dizin, bu 12 maddedeki "câizdir / halâldir" cümlelerinin yalnız 6'sını
  içeriyor. Kaçan 156 cümleden 45'i okundu:
  - Yaklaşık 27'si bir işin açıkça câiz ya da halâl olduğunu bildiriyor. Örnekler:
    - 1-78 "Aç veyâ hasta olanın, oturacak evi olsa da, yiyecek istemesi câizdir."
    - 2-42 "Şira ya’nî tâze üzüm suyu [Moût] ve pekmez [Moût cuit] ve bulama [Raisiné] ve boza [Bosan] içmek halâldir."
    - 2-40 "Şerâb yapan müslimâna üzüm ve şirâ satmak câizdir."
  - Yaklaşık 14'ünde "câiz" geçerlilik (sahîh) anlamında. Örnekler: 3-4 "Bâyı’ malı verse, müşterî parasını verse, hiçbirşey söylemeden câiz olur.", 1-79 oruc niyyeti.
  - Yaklaşık 4'ü bir mezhebe ya da imâma göre.
  - Bu orana göre yalnız bu 12 maddede dizinin kaçırdığı açık izin hükmü kabaca 90 civarındadır. Bütün dizinde açık mubâh
    hükmü 122'dir. Mubâh dizini kitaptaki izin hükümlerinin küçük bir kısmını kapsıyor.

## 6. En sık hata kalıpları

1. **Kelime eşleşmesi = hüküm sanılmış:** Cümlede "harâm/mekrûh/câiz" geçtiği için alınmış, ama asıl hüküm başka. Örnekler:
   "harâm olan malı vererek aldığı … halâl olur", "harâm olduğu bildirilmiyen birşeye halâl denir", "…kâfir olur". (BASKA_TUR, HUKUMSUZ)
2. **Nakil ve tartışma bölümleri hükümden ayıklanmamış:** Kitap bir görüşü aktarıp reddettiği yerde, aktarılan görüş kitabın
   hükmü gibi alınmış. Bu, tütün (2-43), İbni Teymiyye ve vehhâbî reddiyeleri (2-17, 2-21), sakal (1-71) bahislerinde yoğun. (MEZHEP_GORUS, OLUMSUZ)
3. **Cümle sınırı hükmü bölüyor:** Özne, şart, istisnâ ya da mezhep kaydı bir önceki ya da sonraki cümlede kalmış. Kitabın
   uzun nakil cümleleri kısa parçalara ayrılınca hüküm ya genişliyor ya da öznesiz kalıyor. (BAGLAMSIZ, SART_EKSIK)
4. **Olumsuzluk dikkate alınmamış:** "denilemez", "diyemez", "diyen yokdur", "demek pek yanlışdır" gibi olumsuz yapılar, olumlu hüküm sanılmış. (OLUMSUZ)
5. **Kelimenin anlamı ayırt edilmemiş:**
   - "Mescid-i harâm", kitap adları
   - "tab'an mekrûh"
   - "câiz" kelimesinin "sahîh" anlamı
6. **Etiketler kalıba göre konmuş, içeriğe göre değil:**
   - `altTur` cümlenin hükmünü değil, cümlede geçen ilk kalıbı yansıtıyor.
   - Tamamı katmanındaki "diğer geçiş" ve "tarif / atıf" etiketleri olumsuz hükümleri de içine alıyor.

## 7. Denetlenemeyen ya da sınırlı kalan kısımlar

- `tum` katmanında 2.150 kayıttan 758'i okundu. Okunmayan 1.392 kaydın 1.025'i açık katmanda da bulunduğu için içerikleri
  açık katman okumasında değerlendirildi. Yalnız "Tamamı"nda bulunan ve betiğin şüpheli bulmadığı kayıtlardan rastgele
  örnekleme girmeyenler (367) okunmadı.
- Sahîfe numaraları madde aralığı düzeyinde doğrulandı; aynı madde içindeki doğru sahîfe doğrulanamaz.
- Kapsam denetimi kelime kalıbına dayalıdır; başka sözlerle bildirilen hükümler ölçülmedi.
- Okuyan parçalar arasındaki ölçü farkı (§1).

## 8. Genel kanaat ve sunum önerisi

**Kanaat: düzeltilerek kullanılabilir, ama şimdiki sunumuyla değil. Mubâh dizini ise kaldırılmalı ya da baştan kurulmalı.**

Gerekçe:
- Cümlelerin hepsi kitapta aynen var; uydurma yok.
- Ancak "açık hüküm" iddiası tutmuyor: açık katmandaki kayıtların %38'i sorunlu, öznesizler hariç tutulsa da %20'si.
- 60 kayıtta (%5) okuyan, kitabın söylediğinin tersini ya da kitabın reddettiği bir görüşü "açık hüküm" olarak görüyor. Harâm'da bu oran %6,5'tir.
- En ağır yanılma tütün bahsindedir: kitap "tütün harâmdır deyip, kesin söylenemez" derken, dizin bu bahisten 21 cümleyi harâm açık hükmü olarak veriyor.
- Mubâh açık katmanının yarısından fazlası bir şeyin mubâh olduğunu bildirmiyor. Kapsam denetimi de mubâh dizininin kitaptaki izin hükümlerinin küçük bir kısmını içerdiğini gösteriyor.

Öneriler (veriyi değiştirmeden önce site sahibinin kararına):
1. `hukumler-2.json` içindeki 60 açık K kaydı ve 7 tum K kaydı hemen kaldırılmalı ya da doğru türe/etikete taşınmalı. Bunların içinde:
   - tütün kümesi
   - #4095, #3957, #4131, #4049
   - #2898 / #2897
   - #4380, #4479, #5985, #3894
2. "Mescid-i harâm" ve kitap adı geçişleri (28) "Tamamı"ndan kaldırılmalı.
3. "Açık hükümler" sekmesinin tanımı ("açıkça bildiren cümleler") ancak denetlenmiş kayıtlar için kullanılmalı. Öneri:
   - Bu katman yalnız TAMAM kararlı kayıtlarla yayınlansın.
   - Ya da sayfada "kelime aramasıyla derlenmiştir, hüküm için cümleyi kitaptaki yerinde okuyunuz" uyarısı ve her kayıtta kitaptaki yere bağlantı öne çıkarılsın.
4. Öznesiz kayıtlarda bağlam alanı kitabın önceki cümlesini doğru göstermeli; göstermiyorsa (#3201 gibi) kayıt kaldırılmalı.
5. `altTur` etiketleri içeriğe göre yeniden verilmeli: tahrîmen/tenzîhen; olumsuz cümlelere "… değildir" etiketi. "Tamamı"ndaki "diğer geçiş" ve "tarif / atıf" etiketli olumsuz cümleler ayrı etiketle gösterilmeli.
6. Mubâh dizini şimdiki hâliyle "açık mubâh hükümleri" diye sunulmamalı.
7. Sitede bu dizin "hüküm kaynağı" gibi değil, "kitapta bu kelimelerin geçtiği yerlerin listesi" gibi sunulmalı. Hüküm sorusu için okuyan her zaman kitabın ilgili sahîfesine yönlendirilmeli.
