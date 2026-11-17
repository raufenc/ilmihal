# Fevâid denetimi — Fıkhî Hükümler dizini: FARZ, VÂCİB, SÜNNET, MÜSTEHAB (`hukumler-1`)

Denetlenen: `veri/hukumler/{farz,vacib,sunnet,mustehab}-{acik,tum}.json` (sitede "Açık hükümler" = `acik`, "Tamamı" = `tum`).
Ölçüt: yalnız kitabın metni (`veri/madde/*.json`). Hiçbir veri dosyası değiştirilmedi.
Bulgu listesi: `tools/yeni-site/denetim/hukumler-1.json` (859 kayıt). Betikler ve ara dosyalar: `tools/yeni-site/denetim/betik-hukumler-1/`
(`tara.mjs` betik taraması → `tarama.json`; `okuma.txt` kayıt kayıt okuma kararları; `mezheb_bloklari.py`; `anlam_tara.py`; `tum_hazirla.py`; `kapsam.mjs`, `kapsam_kitap.mjs`; `bulgu_yaz.py`).

## 1. Kapsam ve yöntem

| Katman | Kayıt | Ne yapıldı |
|---|---|---|
| farz-acik | 505 | betik + **tam okuma** (bağlamıyla) |
| vacib-acik | 226 | betik + **tam okuma** |
| sunnet-acik | 443 | betik + **tam okuma** |
| mustehab-acik | 491 | betik + **tam okuma** |
| farz-tum | 876 | betik; 505'i açıkla aynı (açık kararı geçerli); kalan 371'in şüpheli + örneklem olanları (239) okundu |
| vacib-tum | 410 | betik; 226'sı açıkla aynı; 132 okundu |
| sunnet-tum | 858 | betik; 443'ü açıkla aynı; 229 okundu |
| mustehab-tum | **0** | dosya boş; sitedeki "Tamamı" sekmesi müstehab için boş kalıyor |

- **Adım 1 (betik, 3.809 kaydın hepsi):** metnin kitapta, belirtilen maddede aynen (normalleştirilmiş) bulunması; sahîfenin madde aralığında olması; tür kelimesinin varlığı; birden çok hüküm kelimesi; olumsuzluk/sınırlama işaretleri; cümle ortasında başlama/bitme; yinelenme.
- **Adım 2 (tam okuma, 1.665 açık kayıt):** her kayıt, kitaptaki önceki ve sonraki cümlesiyle birlikte okundu; şüphelilerde daha geniş bağlam açıldı. Kararlar `okuma.txt`'de.
  Okumada kullanılan kodlar: H = açıkça bu türü bildiren hüküm (sorunsuz); G = türün tanımı/genel sözü (hüküm değil ama yanıltıcı değil; bulgu sayılmadı); E = edeb listesi maddesi (tür kelimesi cümlede yok, liste başlığında var; tek toplu bulgu); diğerleri bulgu (bkz. §3).
- **Adım 3 (tum):** sabit tohumla (20261117) farz/vâcib/sünnet'ten 80'er kayıt (240; müstehab-tum boş olduğu için 320 değil) + açık katmanda karşılığı olmayan bütün şüpheliler (558) okundu; ayrıca kelimenin hüküm dışı anlamda (hitân, "Kitâb ve sünnet", "farz edelim", ferâiz hissesi, Vâcib-ül-vücûd) geçtiği kayıtlar kalıpla bütün katmanda tarandı.
- **Adım 4 (ters yön):** sabit tohumla 35 fıkıh maddesinden 12'si seçildi (1-56, 1-60, 1-65, 1-66, 1-67, 1-74, 1-78, 1-79, 1-82, 1-84, 2-34, 3-58); bunlarda "…farzdır / farz olur / vâcibdir / vâcib olur / sünnetdir / sünnet-i müekkededir / müstehabdır / mendûbdur / edebdir" diye biten (olumsuz olmayan) cümleler bulundu ve dizinde arandı. Aynısı karşılaştırma için bütün kitaba da uygulandı.

## 2. Betik taraması sonuçları (adım 1)

- **Metnin kitapta bulunması:** 3.809 kaydın 3.804'ü kitapta, belirtilen maddede aynen var. Yalnız kısmen bulunan 5 kayıt: farz-tum #241, sünnet-acik #1011 ve #1714, sünnet-tum #7474 ve #7755 (iki paragrafın birleştirilmesi; #1011'de "sebetel-ecr" → "sebe-tel-ecr" yazım farkı; #1714 "Berekât)da diyor ki" diye kitap adının ortasından başlıyor). Hiç bulunamayan (D) kayıt **yok**.
- **Sahîfe:** bütün kayıtların sahîfesi maddenin sahîfe aralığında (madde zaten sahîfeden hesaplanmış). Maddenin içinde doğru sahîfe olup olmadığı denetlenemedi (metinde sahîfe işareti yok).
- **Tür kelimesi yok:** yalnız müstehab-acik'te 305 kayıt (hepsi okundu; çoğu Excel'in "Abdest_Edebleri", "Yimek_Icme_Adabi", "Diger_Adab_Cumleleri" sayfalarından gelen cümle dökümleri — bkz. §4).
- **Birden çok hüküm kelimesi:** açıkta 361, tum'da 622; **olumsuzluk/sınırlama işareti:** açıkta 331, tum'da 541 (hepsi açıkta okundu).
- **Kitapta cümle ortasında başlayan/biten:** açıkta 241 (çoğu ayraç "(" "[" ile başlayan nakiller; gerçek kesikler okumada F olarak sayıldı).
- **Yinelenme:** aynı katmanda birebir 2+2 kayıt (farz-tum #84/#414, vâcib-tum #2667/#2771); ayrıca okumada farklı kimlikli, uzatılmış/kısaltılmış yinelenmeler bulundu (ör. vâcib #5983 = #2395, #6710 = #2358; sünnet #911 = #141, #1525 = #1023, #1539 = #1031, #1602 = #1049, #1668 = #1077, #1691 = #1108, #1695 = #1112, #6469 = #1616; müstehab #6711 = #6399). Aynı paragraf blokları hem farz hem sünnet açık listesinde (ör. #851 = #1698, #854 = #1700, #862 = #1703).

## 3. Tam okuma sonuçları (açık katman, 1.665 kaydın hepsi)

| Tür | Kayıt | Açık hüküm (H) | Tanım/genel (G) | Edeb listesi (E) | **K** | **Y** | **B** |
|---|---|---|---|---|---|---|---|
| farz | 505 | 203 (%40,2) | 74 (%14,7) | – | 17 (%3,4) | 179 (%35,4) | 32 (%6,3) |
| vâcib | 226 | 143 (%63,3) | 10 (%4,4) | – | 8 (%3,5) | 52 (%23,0) | 13 (%5,8) |
| sünnet | 443 | 167 (%37,7) | 45 (%10,2) | – | 18 (%4,1) | 181 (%40,9) | 32 (%7,2) |
| müstehab | 491 | 116 (%23,6) | 12 (%2,4) | 129 (%26,3) | 30 (%6,1) | 181 (%36,9) | 23 (%4,7) |
| **toplam** | **1.665** | **629 (%37,8)** | **141 (%8,5)** | **129 (%7,7)** | **73 (%4,4)** | **593 (%35,6)** | **100 (%6,0)** |

Yani "bir şeyin bu türden olduğunu açıkça bildiren cümle" tanımına uyan kayıt **yalnız %38**; tanım/genel sözleri ve edeb listesini de kabul etsek **%54**. Kayıtların **%35,6'sı (Y)** o türü bildirmiyor ya da tek başına okununca yanıltıcı, **%4,4'ü (K)** kitaba aykırı (tersini, başka türü ya da başka mezhebi/sapık sözü hüküm gibi veriyor).

K ve Y'nin alt dağılımı:

| Kod | Ne | farz | vâcib | sünnet | müstehab |
|---|---|---|---|---|---|
| KK/K | sapık fırkanın / reddedilen kitabın sözü ya da kitabın "iftirâ" dediği söz hüküm gibi | 4 | 1 | 3 | – |
| MK | başka mezheb (çoğu Mâlikî) hulâsası içinden, mezheb adı olmadan | 6 | 2 | 11 | 6 |
| O | türü olumsuzluyor ("… değildir", "denilmedi") | 3 | 1 | 2 | 4 |
| X | başka türü bildiriyor (harâm, mekrûh, câiz, sünnet…) | 4 | – | 1 | 18 |
| SK | ihtilâf nakli; kitabın neticesi sonraki cümlede ve tersine | – | 1 | 1 | 1 |
| AK | kelime fıkhî anlamda değil (Vâcib = Vâcib-ül-vücûd; "âdâb" kitap adında) | – | 3 | – | 1 |
| A (+AF, LA) | hüküm yok: kelime yalnız anılıyor (ör. "farz nemâz", "sünnet nemâz", sevâb/günâh sözü, anlatı, tıbbî bilgi) | 134 | 25 | 151 | 161 |
| Z | öznesi zamir/eksik ("Bunlar nass ile farzdır.", "Kesmek vâcibdir.") | 16 | 18 | 13 | 15 |
| M (+MF, LM) | bir mezhebin/imâmın/kavlin görüşü (mezheb adı kayıtta var ama "açık hüküm"ler arasında karışık) | 22 | 8 | 15 | 3 |
| S | şart/istisna/ihtilâf sonraki cümlede kalmış | 2 | 1 | 1 | 1 |
| LX | paragraf bloğu, içeriği başka türden | 5 | – | 1 | 1 |

### 3.1 En önemli bulgular (kitaptan alıntıyla)

**a) Sapık fırkaların ve reddedilen kitapların sözleri hüküm diye verilmiş (K, kesin).**
- farz #682, #683, #684 (2-22 s501): "Nemâzı bir kerre kılmak farzdır." / "Oruc da, ömründe bir gün tutmak farzdır." / "Gusl de, ömründe bir kerre farzdır." Kitapta bunlar (Kâşif-ül-esrâr) nakliyle bâtınî "babalar"ın yalanları arasında sayılıyor: "Yalanlarından biri de, … babaların elindedir derler. Nemâzı bir kerre kılmak farzdır. … Gusl edip de, vücûdünüzü hırpalamayınız derlerdi."
- farz #662 (2-17 s447): "Bir farzı yapmıyan, meselâ farz olduğuna inandığı hâlde, bir nemâz kılmıyan kâfir olur diyor." — kitapta Vehhâbîliğin "bozuk inanışları" sayımında ("1 — Amel, ibâdet, îmânın parçasıdır diyor.").
- vâcib #2369 (2-17 s453): "Müslimân meliklerinin, vâlîlerinin, bu kubbeleri yıkmaları vâcibdir." — kitap bunu (Feth-ul-mecîd)in İbni Hacer'e isnâdı olarak verip hemen reddediyor: "Hâlbuki, İbni Hacer-i Mekkî … (Zevâcir) kitâbında, (Kabrler üzerine kubbe yapmak büyük günâhdır) demiyor."
- sünnet #1582, #1583 ("sünnet-i müekkede" etiketiyle, 2-22 s502): "Bıyık uzatmak hazret-i Alînin sünnetidir derlerdi." / "Bıyık kesmek, Mu'âviyenin sünnetidir derlerdi." — kitapta "Sahte Bektâşîler"in sözü; ardından: "Hâlbuki, bıyıkları kısaltmak, hadîs-i şerîflerle emr edildi." (#1585 de aynı iftirâyı anıyor.)

**b) Mâlikî (ve Hanbelî) mezhebi hulâsalarından cümleler, mezheb adı olmadan "açık hüküm" olarak (K, kesin; 25 açık + 28 tum kayıt).** Kitapta 1-54 s146-147 ([(El-mukaddemet-ül-izziyye)de diyor ki, (Mâlikî mezhebinde …]), 1-56 s157-159 ((El-fıkh-u alel-mezâhib-il erbe'a)da diyor ki, (Mâlikî mezhebinde …, Ez-Zehîre, El-müdevvene) ve 1-73 s271 (Hanbelî) nakilleri var; dizin bu blokların cümlelerini tek tek almış. Bunların bir kısmı kitabın Hanefî hükmünün tersini söylüyor:
- sünnet #1174: "Ağız, burun ve kulak içini ve saçları yıkamak sünnetdir." (gusl) ve #154: "Guslde ağzı ve burnu yıkamak farz değil, sünnetdir." — kitap Hanefî için: "Tekrâr bildirelim ki, gusl abdesti alırken ağzın içini yıkamak, hanefî ve hanbelî mezheblerinde farzdır." (1-54 s142)
- sünnet #908: "İlk iki rek'atde Zamm-ı sûre okumak, iki teşehhüdde oturmak, tehıyyât ve salevât okumak ve ikinci selâm sünnetdir." — kitap Hanefî için bunları vâcib sayıyor (vâcib #2279, 1-66 s227).
- sünnet #909: "Bayram ve cenâze nemâzları sünnetdir." — kitapta Hanefî için bayram nemâzı "erkeklere vâcibdir" (1-72 s266), cenâze nemâzı "farz-ı kifâyedir" (3-56 s994).
- farz #138: "Nemâza başlarken (Allahü ekber) demek, Fâtiha okumak, kavmede dikilmek, celsede oturmak, … (Esselâmü aleyküm) demek farzdır." ve farz #156: "Nemâzda her rek'atde Fâtiha okumak … farzdır." — Mâlikî hulâsası; kitap Hanefî için Fâtiha okumayı vâcib sayıyor.
- müstehab #6253: "İmâmın gizli okuduğu rek'atlerde cemâ'atin Fâtiha okumaları müstehab …" — kitap Hanefî için: "İmâmın arkasında Fâtiha okumak, hanefîde tahrîmen mekrûhdur." (1-70 s253)
- müstehab #6249: "Sabâh ikinci rek'atde sessiz kunût okumak, teşehhüdde şehâdet parmağı kaldırmak müstehabdır." (Mâlikî hulâsası)
- sünnet #140: "Günâh olmıyan seferde dört rek'at farzları iki kılmak sünnetdir." — kitapta: "… iki rek'at kılması hanefîde vâcib, mâlikîde sünnet-i müekkede, şâfi'îde efdaldir." (1-65 s222)

**c) Olumsuz ya da başka tür bildiren cümleler o türün "açık hükmü" olarak (K).**
- farz #217: "Farz veyâ vâcib diyenlerin hatâ etdiği (Redd-ül-muhtâr)da yazılıdır." (önceki cümle: "… uçlarını kıbleye çevirmek sünnetdir.")
- vâcib #2448: "Vâcib olur denilmedi." ; müstehab #6348: "Birden fazla evlenmek vâcib olmadığı gibi, mendûb da değildir." ; müstehab #6454: "Önce el yıkarken ağzı da yıkamak sünnet değildir."
- sünnet #1316 / müstehab #6299: "Demek ki, bu din büyükleri, işâretin sünnet ve müstehab olduğunu gösteren haberlerin değil, belki yasak olduğunu gösteren vesîkaların doğru olduğunu anlamışlardır."
- sünnet #898 / müstehab #6233: "Ağız ile de niyyet etmeğe sünnetdir, müstehabdır veyâ bid'atdir denildiği …" — kitabın neticesi: "Bunun için, ağız ile de niyyet etmemelidir."
- vâcib #2288: "… işitenlerin secde etmesi vâcib olur denildi." — sonraki cümle: "Fekat, bunların ve kuşun okuması ile secde edilmemesi doğrudur."
- müstehab başlığında harâm/mekrûh/câiz bildiren 18 kayıt (ör. #6704 "… eğilmek günâhdır … rükü' ve secde yapmak harâmdır", #6699 "Başkasının öpülmez.", #6614 "Tavşan eti halâldir.", #6584 "(Ayakda içmeyiniz!) buyururdu.", #6472 "… bid'atden biri, doyuncaya kadar yimekdir.").
- vâcib #2458, #2459, #2461: "Mümkin, hiç Vâcib olur mu?" vb. — burada Vâcib = Vâcib-ül-vücûd (Allahü teâlâ), fıkhî hüküm değil.

**d) Hüküm bildirmeyen cümleler "açık hüküm" olarak (Y; 471 kayıt).** En büyük küme. Ör. farz #50 "Farz nemâz borcu olan geceleri de, kazâ nemâzlarını kılmalıdır."; 1-74 (kazâ) maddesindeki "farz/sünnet nemâz" geçen onlarca cümle (sünnet-acik'te yalnız 1-74'ten 81 kayıt); farz #842 "altı farzdan" (burada farz = mîrâs hissesi); sünnet #880, #1540 (sünnet = hitân: "Doğduğu zemân, göbeği kesilmiş ve sünnet olmuş görüldü."). Müstehab-acik'te 2-45 "Yimek, içmek âdâbı" maddesinin hemen bütün cümleleri tek tek alınmış: "Solucan düşürür.", "Gözlere kuvvet verir.", "Geceleri cinnîler yayılır.", "Melekler sevmez.", "Sofra, deriden olur.", "Kavun, karpuz böbrekleri temizler, baş ağrısını giderir." gibi cümleler müstehab hükmü diye duruyor; 3-23'ten "(Hadîka)dan terceme temâm oldu." ve "(Berîka)dan terceme temâm oldu." cümleleri, 1-90'dan "İkiyüzaltmışbeşinci mektûb tercemesi temâm oldu." bile müstehab kaydı.

**e) Biçim (B).** 37 paragraf bloğu (farz-acik'te 9.296 harflik zekât bloğu #867 dahil; Excel'in "Liste_Bloğu" sayfaları); hadîslerin ortadan bölünüp ayraçlarının düşürülmesi (müstehab #6483/#6484, #6486/#6487, #6495/#6496); başına önceki cümlenin sonu yapışmış kayıtlar (ör. farz #7 "Hâlbuki halâldir. Îmânı ve farzları … farzdır."); kısaltmada kesilenler (müstehab #6305 "6- Müstehab oruclar: Her arabî ayın 13."); ilgisiz cümle eklenmiş kayıtlar (vâcib #2362 sonuna manzûme: "Dostlarımın ayrılığından, kalbim kan ağlıyor."); farz-acik'te "farz-ı kifâye" alt etiketli 79 kaydın 53'ünde metinde "kifâye" yok, 5'i açıkça "farz-ı ayn" diyor.

## 4. En sık hata kalıpları

1. **Kelime avı:** kayıtlar "farz/vâcib/sünnet/müstehab" kelimesinin geçtiği cümlelerden derlenmiş; cümlenin o şeyin hükmünü bildirip bildirmediğine bakılmamış ("farz nemâz", "sünnet nemâz", "sünnet olmak" = hitân, "Kitâb ve sünnet", ferâiz "farz"ı, Vâcib-ül-vücûd).
2. **Nakil bağlamının kaybı:** kitabın başka mezheb hulâsası, sapık fırkaların iddiası ya da reddettiği bir kitabın sözü olarak naklettiği cümleler, nakil çerçevesi atılarak hüküm diye alınmış (en ağır hata).
3. **Olumsuzluk ve netice:** "… değildir", "denilmedi", "diyenlerin hatâ etdiği", "denildi … doğrusu …" yapıları ayıklanmamış.
4. **Zamir ve öznesizlik:** "Bunlar nass ile farzdır.", "Kesmek vâcibdir.", "Az ise, sünnetdir." — neyin hükmü olduğu önceki cümlede kalmış (63 kayıt).
5. **Cümle dökümü:** müstehab-acik'in 305 kaydı (Excel'in "Abdest_Edebleri", "Yimek_Icme_Adabi", "Diger_Adab_Cumleleri" sayfaları; bkz. `tools/excel-to-hukumler.py`) bir maddenin bütün cümlelerinin sırayla dökülmesi; içlerinde edeb olanlar da (E) tıbbî bilgi, anlatı, hadîs parçası ve yasak bildirenler de var.
6. **Paragraf blokları:** Excel'in "Liste_Bloğu" sayfalarından gelen paragraf boyu kayıtlar tek "hüküm" gibi listelenmiş.

## 5. Tum katmanı ("Tamamı")

Tum katmanı açık katmanın hepsini (aynı cümleler) ve kelimenin geçtiği diğer cümleleri kapsıyor (farz 876 = 505 + 371; vâcib 410 = 226 + 184; sünnet 858 = 443 + 415). "Bu hükmün kitapta geçtiği bütün yerler" diye sunulduğu için ölçüt: kayıt kelimenin gerçekten o hüküm anlamında geçtiği yer mi?

- **Örneklem (sabit tohum, 80'er):** farz 77/80 uygun (1 sapık söz: #7218 = açık #662'nin eşi, Vehhâbî iddiası; 1 blok, 1 ferâiz "farz"ı); vâcib 70/80 uygun (6 biçim, 3 başka anlam: Vâcib-ül-vücûd, "şefâ'at vâcib oldu" hadîsi; 1 Mâlikî hulâsası); sünnet 69/80 uygun (5 başka anlam: hitân, "sünnet = hadîs"; 6 biçim). Yani tum katmanında **yaklaşık %86–96 kayıt uygun bir geçiş**, %4–14'ü başka anlam ya da biçim sorunu.
- **Okunan şüpheliler (558, açıkta karşılığı olmayan):** hemen hepsi kelimenin gerçek geçişi; tum'un alt etiketleri ("farz değildir / olmaz", "vâcib değildir", "kelâm ıstılâhı", "diğer geçiş") açık katmandakilerden çok daha isabetli. Sorunlular: "farz edilirse/edersek" (= varsaymak: #715, #847), ferâiz hesabındaki "farz" (= hisse: #843–#846, #876, #7335, #7361, #7362), Vâcib-ül-vücûd (#2493, #2494, #2805, #2853–#2861), hitân anlamında "sünnet" (≈17 kayıt, ör. #1079 "Kâfir, sünnet olmakla, müslimân olmaz.", #1188), "sünnet = hadîs/kaynak" (≈12 kayıt). Bunlar betikle bulundu ve `kesin: false` işaretlendi.
- Açık katmandaki sapık söz ve Mâlikî hulâsası kayıtları tum'da da var (28 Mâlikî/Hanbelî kayıt tum'da ayrıca bulgu olarak listelendi).
- **Müstehab-tum boş:** sitede müstehab için "Tamamı" sekmesi hiçbir şey göstermiyor.

## 6. Ters yön: dizin ne kadar eksik? (adım 4)

Seçilen 12 maddede "…farzdır / vâcibdir / sünnetdir / müstehabdır …" diye açıkça hüküm bildiren (olumsuz olmayan) cümle sayısı ve dizindeki karşılığı:

| | farz | vâcib | sünnet | müstehab |
|---|---|---|---|---|
| 12 madde | 73/73 | 39/40 (1'i yalnız tum'da) | 40/40 | 28/29 |
| bütün kitap (karşılaştırma) | 253/254 | 175/176 | 166/168 | 115/119 |

Kaçanlar: "Her tavâfdan sonra zemzem içmek müstehâbdır." (1-84) ve kitaptaki diğer üç "müstehâbdır" (şapkalı yazım: 1-95, 2-48, 3-59) — dizin bu yazımı yakalamamış; "Fen bilgilerine, san'ate, en modern harb silâhlarını yapmağa uğraşmak, farz-ı kifâyedir." (3-70); 1-66'daki "… o nemâzı tekrâr kılması vâcib olur." yalnız tum'da; "Alîye mensûb olan, bizzarur ehli sünnetdir." gibi iki "Ehl-i sünnet" cümlesi (kaçması doğru).
**Netice:** dizin bu kalıptaki açık cümleler için **neredeyse tam (%98,7)**; "tam" izlenimi bu dar anlamda doğru. Ama bu kapsam yalnız "-dır / olur" kalıbını ölçüyor; "lâzımdır", "emr olundu", "yapmalıdır" gibi dolaylı ifadeler ölçülmedi. Dizinin sorunu eksiklik değil, **fazlalık ve yanlış yerleştirme**: açık katman, açık hükümle birlikte kelimenin geçtiği ilgisiz cümleleri de taşıyor.

## 7. Denetleyemediğim / sınırlı denetlediğim kısımlar

- 1.500 harfi aşan 27 paragraf bloğunun (farz 17, sünnet 10) ortası tam okunmadı; başı ve sonu okundu, metnin kitapta aynen geçtiği betikle doğrulandı. Hepsi zaten "blok" (B/Y) sayıldı.
- Tum katmanında açıkta karşılığı olmayan ve şüpheli de olmayan, örnekleme de düşmeyen 370 kayıt (farz 132, vâcib 52, sünnet 186) okunmadı; yalnız betikle tarandı. Tum'daki okumalar bağlamsız (yalnız kayıt metni) yapıldı.
- Kayıt sahîfesinin madde içinde doğru sahîfe olup olmadığı denetlenemedi.
- `altTur` yalnız "farz-ı kifâye" için sistemli denetlendi; diğerleri okumada göze çarptıkça not edildi.
- Y ile G arasındaki sınır (ör. "farzları yapmak lâzımdır" gibi genel sözler) bir ölçüde takdirdir; G sayılanlar bulgu listesine alınmadı. "Kesin değil" işaretli bulgular: #120 (bağlamdan mezheb çıkarımı) ve betikle bulunan "başka anlam" tum kayıtları.

## 8. Öneri ve genel kanaat

**Genel kanaat:** *Açık katman bu hâliyle kullanılmamalı; düzeltilerek (yeniden ayıklanarak) kullanılabilir. Tum katmanı "kelimenin geçtiği yerler" dizini olarak büyük ölçüde güvenilir.*
Gerekçe: Açık katmanın yalnız %38'i adının vaat ettiği "açıkça bildiren cümle"; %4,4'ü kitabın söylediğinin tersini ya da başka mezhebin/sapık bir fırkanın sözünü hüküm gibi veriyor. Dinî hüküm dizininde bu oran kabul edilemez; okuyucu "Nemâzı bir kerre kılmak farzdır." ya da "Guslde ağzı ve burnu yıkamak farz değil, sünnetdir." gibi cümleleri kitabın hükmü sanır.

Sunuş önerileri:
1. **Önce 73 K kaydı kaldırılmalı** (`hukumler-1.json`, `sinif: "K"`); bunların tum'daki eşleri de ya kaldırılmalı ya "nakil / başka mezheb" diye etiketlenmeli.
2. **"Açık hükümler" adı** yalnız H kayıtlarına (629) — istenirse G'lerle (141) birlikte — bırakılmalı. Bu küme, vâcib'de en temiz (H %63), müstehab'da en kirli (H %24).
3. **Müstehab-acik yeniden kurulmalı:** "Yimek_Icme_Adabi" ve "Diger_Adab_Cumleleri" dökümleri (273 kayıt, id 6447 ve sonrası) çıkarılmalı; abdest edebleri listesi (1-52) "Abdestin edebleri" başlığıyla, kitaptaki liste başlığı aynen verilerek ayrı gösterilmeli ("Edeblere, mendûb ve müstehab da denir.").
4. **Paragraf blokları** (Excel "Liste_Bloğu") açık katmandan çıkarılmalı.
5. **Mezheb kayıtları:** kayıtta mezheb adı geçen M kayıtları (44) ayrı bir "mezheblere göre" etiketiyle verilmeli; Mâlikî/Hanbelî hulâsalarından gelenler (bloklar `betik-hukumler-1/mezheb-blok-kayitlari.json`) ya çıkarılmalı ya mezheb adıyla etiketlenmeli.
6. **Tum katmanı** "Tamamı / bu hükmün geçtiği yerler" yerine "Kelimenin kitapta geçtiği yerler" diye adlandırılmalı; başka anlamdaki geçişler (hitân, Kitâb ve sünnet, farz etmek, ferâiz, Vâcib-ül-vücûd) ayıklanmalı ya da etiketlenmeli. Müstehab-tum boş olduğu için sekme gizlenmeli ya da doldurulmalı.
7. "farz-ı kifâye" alt etiketi metne göre yeniden verilmeli.
