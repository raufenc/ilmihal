# Hâl tercemeleri (1.024 kişi): sınıf, ünvan, isim ve madde eşlemeleri denetimi

Bulgu listesi: `tools/yeni-site/denetim/sahislar.json` (178 kayıt). Betikler ve ara çıktılar: `tools/yeni-site/denetim/betik-sahislar/`
(`unvan.py`, `unvan-analiz.py`, `esleme2.py`, `yonlendirme.py`, `bulgular.py`; örneklem listeleri `orneklem-120.json`, `orneklem-bos-40.json`).
Hiçbir veri ya da site dosyası değiştirilmedi.

## Yöntem ve kapsam

- **Kaynak:** `veri/sahislar/*.json` (1.024 kayıt), kitabın 241 madde metni (`veri/madde/*.json`). Hâl tercemelerinin BAŞLIK satırı
  (kitapta adın yanında yazan hürmet ifadesi) veride yok; yalnız `biyografi` var. Bu yüzden `unvan` iki yoldan denetlendi:
  (a) biyografinin kendisi, (b) maddelerde ve öbür hâl tercemelerinde kişinin adından hemen sonra gelen ifade (betikle çıkarıldı).
- **Okuma:** 1.024 kaydın hepsi betikle tarandı. Peygamber (25), sahâbî (97), hükümdar (49) ve "Diğer" (259) kayıtlarının biyografi başları
  tek tek okundu; "Âlimler"in 592 kaydının tamamının biyografi başı (125–260 harf) okundu; olumsuz kelime (sapık, mezhebsiz, kâfir, mason,
  zındık, vehhâbî, hurûfî, bid’at, düşman, zulm …) geçen 79 "alim" ve 84 "diger" kaydında ilgili cümle okundu; yaklaşık 45 biyografi tam okundu.
- **Madde eşlemesi:** 2.593 kişi–madde bağının hepsi betikle denetlendi (ad maddede geçiyor mu); sabit tohumla (20261117) 120 kişi (419 bağ)
  örneklendi ve bulunamayanlar başka adlarıyla (ör. "İmâm-ı a’zam") elle arandı; `maddeler`i boş 278 kişiden 40'ı örneklendi.

## Ana tespit: sınıflar mekaniktir

Sınıf, kitabın sınıflamasından değil, `unvan` alanından türetilmiş:

| unvan | peygamber | sahabi | alim | hukumdar | diger |
|---|---|---|---|---|---|
| aleyhisselâm | 25 | | | | |
| radıyallahü … | | 97 | 1 | | 1 |
| rahmetullahi … | | | 590 | 38 | |
| aleyhirrahme | | | | | 1 |
| (boş) | | | 1 | 11 | 259 |

Yani "Âlimler" = "başlığında *rahmetullahi teâlâ aleyh* yazanlar", "Diğer" = "başlığında hürmet ifadesi olmayanlar". `unvan`'ın kendisi
büyük olasılıkla kitabın başlığından alınmış (37 slug'ın içinde `…-rahmetullahi-teala-aleyh` kalmış; `muhammed-rebhami` biyografisi
`“rahmetullahi teâlâ aleyh”: Hindistânın fıkh âlimlerindendir` diye başlıyor), bu yüzden ünvanlar **büyük ölçüde güvenilir**; sorun
onlardan türetilen **başlıklarda**.

## 1. Sınıf (`kategori`)

**Peygamber (25):** 23'ünde kitap açıkça peygamber diyor. İki tutarsızlık (Y):
- `hizir`: kitap "İbrâhîm aleyhisselâmdan sonra yaşamış bir **Nebî veyâ Velîdir**." — site kesin "Peygamberler" altında.
- `lokman-hakim`: kitap "**Peygamber veyâ Velîdir.**" — site "Âlimler" altında, "rahmetullahi teâlâ aleyh" ile. Aynı ifade iki ayrı sınıfa gitmiş.
- Başka sınıfta duran, kitabın peygamber dediği biri bulunamadı (bütün biyografilerde "Peygamber/Nebî/Resûl" tarandı; yalnız Müseyleme ve
  Kâdıyânî "peygamber olduğunu iddi’â eden" olarak geçiyor, doğru olarak "Diğer"de). `iskender` kaydı üç kişiyi birleştiriyor; üçüncüsü
  "Zülkarneyn … mubârek bir zâtdır. Peygamber veyâ Evliyâdandır." — "Diğer" altında (Y).

**Sahâbî (97):** 97'sinin hepsinde biyografi Eshâbdan olduğunu gösteriyor ("Eshâb-ı kirâmdandır", "Ensâr-ı kirâmdan", "Resûlullahı bir görüşde
îmân etdi" vb.). Tâbi’înden biri bu sınıfta yok. Ters yönde: Eshâbdan olduğu söylenip başka sınıfta duran yok
(Ubeydüllah bin Cahş "Eshâbdan oldu" denip sonra dinden çıktığı bildirildiği için "Diğer"de; doğru). Tek sorun:
- `abdullah-bin-zeyd` (K, kesin değil): kitap "**Tâbi’înin büyüklerindendir.** Ensârdan Zeyd bin Erkamın “radıyallahü anh” oğludur." —
  site unvanı "radıyallahü anhümâ", sınıfı "alim". "anhümâ" başlıkta baba-oğul için yazılmış olabilir; başlık veride yok.

**Âlimler (592):** Kitabın *kötülediği* (sapık, mezhebsiz, zındık, mason, vehhâbî…) **hiç kimse "Âlimler" altında değil**; bu kelimeler
"alim" kayıtlarında hep başkaları için geçiyor (ör. Şâh Veliyyullah kaydında torunu Şâh İsmâ’îl, Tirmizî kaydında Enver Şâh Keşmîrî).
Çekinceyle anılanlar (Y): `kelebi` ("tefsîri sağlam sayılmaz"), `muhammed-bin-ebu-bekr` ("Sahâbî değildir. Tâbi’îndendir. Hazret-i Osmânı
şehîd edenler arasında idi."), `nesimi` ("hurûfî zındıklarından olduğu bildirilmekdedir … sonra tevbe etdiği anlaşılıyor").
Asıl sorun: **en az 55 kişi âlim değil** ama "Âlimler" başlığında (tam liste JSON'da):
- Resûlullahın dedeleri, ana-babası, oğlu (12): Abdüllah bin Abdülmuttalib, Âmine, Kâ’b, Kilâb, Kusayy, Mudar, Müdrike, Mürre, Nizâr, Kureyş,
  Resûlullahın oğlu Abdüllah ("memede iken vefât etdi"), Târuh.
- Devlet adamı/ağa/paşa/vâlî/kumandan (25): ör. `abdullah-aga` ("Üçüncü Murâd hânın bostancı başıdır"), `kasim-pasa`, `sokullu-muhammed-pasa`,
  `nizam-ul-mulk`, `mesleme`, `battal-gazi`, `tosun-pasa`, `ibrahim-pasa-kavalali`.
- Hükümdar (4) "Hükümdarlar" yerine burada: `alemgir`, `mahmud-gaznevi`, `osmanli-sultanlari…` (topluluk kaydı), `sahzade-sultan-muhammed`.
- Hayrât sâhibi hanım sultanlar (9): Bezm-i Âlem, Mihr-i Mâh, Turhân, Kösem (Mâhpeyker) vb.
- Şâir, hattât, matbaacı, fizikçi (6): Nâbî, Râsim efendi, Hâfız Osmân, Latîfî, İbrâhîm Müteferrika, Heisenberg ("Atomun yapısı ile uğraşdı. Müslimân oldu.").

**Hükümdarlar (49):** sınıf uygun; fakat "Hükümdarlar" yalnız rahmetle anılan Müslüman hükümdarları ve birkaç unvansızı (Belkıs, Tâlût,
Me’mûn …) kapsıyor; Fir’avn, Nemrûd, Herakliüs, Cengiz, Hülâgü, Ekber Şâh, Yezîd vb. "Diğer"de; Âlemgîr ve Gazneli Mahmûd "Âlimler"de. Tutarsız (Y).

**Diğer (261):** Kitabın kötülediği 69 kişi (Ebû Cehl, Ebû Leheb, İbni Teymiyye, Abduh, Efgânî, Behâullah, Kâdıyânî, Hitler, Stalin …) burada;
ama aynı başlıkta kitabın övdüğü ya da hürmetle andığı kişiler de var:
- Yönlendirme kayıtları (23): kitapta yalnız "… ismine bakınız!" olan kayıt "Diğer"de unvansız, hedefi "Âlimler"de "rahmetullahi" ile —
  aynı kişi iki başlıkta. Ör. `seyyid-abdulhakim-efendi` ("14. cü sıradadır.") → `abdulhakim-efendi`; `sazili` → `ebul-hasen-i-sazili`;
  `subki`, `tac-ud-din-i-subki`, `sehabuddin-suhreverdi`, `abdullah-i-nesefi`, `rafii`, `pezdevi`, `ibn-us-sakka`, `nesli-sah-sultan` …
- Kitabın maddede "rahmetullahi teâlâ aleyh" ile andığı hâlde unvanı boş, "Diğer"de olan 5 kişi (Y): `ali-haydar-be-g` (2-40: "Alî Haydar beğin
  “rahmetullahi teâlâ aleyh” (Mecelle) şerhi"), `ebu-musa-dineveri` (2-47), `esiruddin-i-ebheri` (2-30), `munavi-veya-menavi` (2-17: "imâm-ı Münâvî
  “rahmetullahi teâlâ aleyh”"), `resid-pasa` (3-11, toplu "aleyhim ecma’în").
- Biyografisi âlim/velî diyen ya da öven 16 kişi: `tahavi` ("Hanefî fıkh âlimidir"), `sirri-yi-sekati` ("Sôfiyye-i aliyyedendir … Cüneyd-i Bağdâdînin
  … mürşididir"), `zeynuddin-i-hafi` ("Büyük Velîlerdendir"), `abdurrezzak-kasi`, `alusi` (Bağdâd müftîsi), `ahmed-naim-efendi` ("Tâm ve hâlis müslimân idi") …
- Hz. Havvâ ("hazret-i Havvâ"), Hz. Meryem (unvanı kitapla aynı: 2-23 "Meryem “radıyallahü anhâ”"), Mehdî ("Hazret-i Mehdî"), Resûlullahın
  dedeleri Abdülmuttalib, Hâşim, Abdü-Menâf, Fihr, Mâlik, İlyâs, Adnân: Ebû Cehl ve Fir’avn ile aynı başlık altında.

**Sınıflama hakkında kanaat:** Beş başlık kitabın kişilerini yanıltmadan ayırmaya **yetmiyor**. Kitabın kendi ayrımı (peygamber /
Eshâb-ı kirâm / Ehl-i sünnet âlimi ve velî / kâfir, sapık ve mezhebsiz / ne övülen ne yerilen yabancı bilgin, devlet adamı) bu beşe
oturmuyor; özellikle "Diğer" aynı anda Hz. Havvâ'yı, Resûlullahın dedelerini, Tahâvî'yi ve Ebû Cehl'i taşıyor; "Âlimler" ise
sultan hanımları, ağaları ve Resûlullahın dedelerini. Oturmayanlar: Resûlullahın ataları ve ailesi, "Nebî veyâ Velî" denenler (Hızır,
Lokmân, Zülkarneyn), yönlendirme kayıtları, topluluk kayıtları (Osmânlı Sultânları, Havârîler, Şâh Sultân), Tâbi’în (âlim olmayanlar).

## 2. Hürmet ifadesi (`unvan`)

- Dolu 753 kayıttan maddelerde/öbür biyografilerde adının yanında ifade bulunanların (238) **224'ünde** sitedeki ifade kitabınkiyle aynı sınıfta.
  515 kayıt için kitapta ad + ifade birlikte bulunamadı (çoğu kişi maddelerde ifadesiz ya da başka adla anılıyor); bunlar başlıktan geldiği
  için doğrulanamadı, ama aykırı bir kanıt da yok.
- **Sınıf–ifade uyumsuzluğu (K):** peygamber olmayana "aleyhisselâm" yok; sahâbî olmayana "radıyallahü" yalnız `abdullah-bin-zeyd`
  (kesin değil); kitabın kötülediği hiç kimseye "rahmetullahi" ya da "kuddise sirruh" verilmemiş (69 kötülenenin 69'unun unvanı boş).
- **Kitap başka ifade de kullanıyor (Y, kesin değil):** Cüneyd-i Bağdâdî, Şiblî, Behâeddîn-i Buhârî, Bâkî-billah, Bâyezîd-i Bistâmî,
  Sadreddîn-i Konevî, Ebû Sa’îd-i Harrâz için maddelerde "kuddise sirruh"; Ca’fer-i Sâdık için 3-42'de "radıyallahü anh"; Âmine için 1-95'te
  hem "rahmetullahi teâlâ aleyhâ" hem "radıyallahü anhâ". Site tek ifade gösteriyor; yanlış değil, eksik.
- **Unvanı boş ama kitap hürmetle anıyor (Y):** yukarıdaki 5 kişi + `muhammed-rebhami` (ifade biyografiye kaymış, B).
  Diğer "boş ama kitapta var" adayları (12) ad karışmasıydı (ör. `abdulaziz-han`'a düşen "Ömer bin Abdül’azîz “rahmetullahi aleyh”").
- Tekil/çoğul ve cinsiyet: "anhâ"/"aleyhâ" yalnız kadınlarda; "anhümâ" 7 kayıtta (Hasen bin Alî, Abdüllah bin Abbâs, Abdüllah bin Ömer, Abdüllah bin Zübeyr,
  Abdürrahmân bin Ebû Bekr, Abdüllah bin Hanzala, Abdüllah bin Zeyd: baba-oğulun ikisi için kitabın kalıbı); "aleyhinne" `sah-sultan` (üç kız) ve "aleyhim ecma’în" `osmanli-sultanlari` topluluk kayıtlarında; uyumlu.

## 3. İsim (`isim`)

- İsimler başlıktan temiz alınmış; 37 kaydın **slug'ında** hürmet ifadesi kalmış (`burhaneddin-i-merginani-rahmetullahi-teala-al` …) ve
  `selman-i-farisiisfehanli-idi-m` slug'ı biyografinin ilk kelimelerini taşıyor (B; slug değişmemeli, bilgi).
- Aynı adı taşıyan 18 isim (Âlûsî ×3, Süveydî ×3, Kâdî-Zâde ×3, Kâ’b ×2, Safiyye ×2 …) biyografilere göre **ayrı kişiler**, doğru ayrılmış.
  `tarsusi` (905. sıra) ile `muhammed-tarsusi` (677. sıra) aynı kişi görünüyor ama kitapta da iki ayrı sıradadır (sitenin hatası değil).
- `alauddevle`: kitabın sahîfe listesi biyografide kalmış ("112, 768, 936, 1016, 1076."), `sahifeler`/`maddeler` boş (B).

## 4. Madde eşlemesi (`maddeler`)

- `maddeler` ad aramasıyla değil, `sahifeler`den (kitabın hâl tercemesindeki sahîfe atıflarından; `alauddevle` örneği bunu gösteriyor, kesin değil)
  türetilmiş: 2.593 bağın **2.593'ü** sahîfe→madde dönüşümüyle birebir uyuşuyor. Bu yüzden "Alî/Abdüllah/Muhammed" gibi yaygın adlarda
  ad karışmasından doğan yanlış eşleşme beklenmez ve görülmedi (ör. 2-44'teki "Kâ’b “radıyallahü anh”" doğru olarak sahâbî `kab-2`'ye bağlı).
- Bütün bağlar: 1.822'sinde ad tam, 561'inde adın belirleyici kelimesi geçiyor, 210'unda geçmiyor. Geçmeyenlerin çoğu başka adla anılış
  (Ebû Hanîfe → "İmâm-ı a’zam"). 19 bağ iki maddenin paylaştığı bir sahîfeden geliyor ve ad o maddede yok: büyük olasılıkla yanlış madde (B, JSON'da).
- **Örneklem (120 kişi, 419 bağ):** 287 tam, 98 kısmî, 34 yok; yoklar elle arandı: 1 kesin yanlış (`ebu-hanife` → 3-26, paylaşılan s. 897),
  4 bulunamadı (`hizir` 2-20, `hayreddin-i-remli` 2-38, `abdul-ehad` 3-47, `muhammed-masum…` 3-36). **Tahmini yanlış eşleşme oranı ≈ %1–1,5**
  (kesin değil; kısmî eşleşmelerin hepsi elle okunmadı).
- **Boş `maddeler` (278), 40 örnek:** 6'sında ad bir maddede geçiyor gibiydi; hepsi başka kişi çıktı (ör. `meymune` → 2-34 "meymûnen mubâreken"
  düâsı; `ebu-seleme` → 1-31'deki Ebû Seleme bin Abdürrahmân). 2'si yönlendirme kaydı (bağlar hedef kayıtta). Kitapta gerçekten geçip
  eşlenmemiş kişi bulunamadı. 109 kişinin sahîfeleri yalnız önsöz ya da hâl tercemeleri sahîfelerine (≥ 1059) düştüğü için madde yok.

## 5. "Adı geçen büyükler" başlığı

Okuyucu madde sonunda `sahislar` listesini "Adı geçen büyükler" başlığıyla, unvanı parantez içinde basıyor. **241 maddenin 83'ünde** listede
"Diğer" sınıfından biri, **45'inde kitabın açıkça kötülediği biri** var (69 kişilik liste `betik-sahislar/kitabin-kotuledikleri.json`;
Muhammed Âkif kaydı hem övüp hem yerdiği için kesin değil). Ör. 2-21: Behâullah, Kâdıyânî, Hasen bin Sabbâh, İbni Teymiyye, Mevdûdî …;
2-26: Engels, Karl Marx, Lenin, Stalin; 1-95: Ebû Cehl, Ebû Leheb, Hülâgü, Volter. Bu başlık bu maddelerde yanıltıcıdır (Y).

## Sınıf sayıları (sahislar.json, 178 bulgu)

| Sınıf | Kesin | Kesin değil | Toplam |
|---|---|---|---|
| K | 0 | 1 | 1 |
| D | 0 | 0 | 0 |
| Y | 153 | 10 | 163 (45'i madde düzeyinde "Adı geçen büyükler") |
| B | 5 | 9 | 14 |

## Denetlenemeyenler

- Kitabın hâl tercemesi başlıkları (adın yanındaki ifade) veride yok; `unvan`'ın başlıkla birebir aynı olup olmadığı doğrulanamadı.
- `sahifeler`'in kitabın kendi atıfları olduğu çıkarımdır; sitenin sahîfe sınırlarıyla kitabın sayfalamasının aynı baskı olduğu denetlenmedi.
- 561 "kısmî" bağın hepsi elle okunmadı.

## Genel kanaat

- **`unvan`: düzeltilerek kullanılabilir.** Kitabın başlığından gelmiş görünüyor; kötülenen kimseye hürmet ifadesi verilmemiş. Düzeltme:
  `muhammed-rebhami`, kitabın maddede hürmetle andığı 5 kişi, yönlendirme kayıtları (hedefin ifadesi); `abdullah-bin-zeyd` başlıkla karşılaştırılmalı.
- **`kategori`: bu hâliyle kullanılmamalı.** Sınıflar ünvandan mekanik türetilmiş; "Âlimler" en az 55 âlim olmayanı, "Diğer" ise kitabın
  hürmetle andığı kişileri kitabın kötülediklerle birlikte taşıyor. Ya sınıf süzgeci kaldırılmalı (liste yalnız kitabın adıyla "Hâl tercemeleri"),
  ya da her kayıt elle yeniden sınıflanmalı; "Âlimler" ve "Diğer" etiketleri bu hâliyle kaldırılmalı. "Peygamberler" ve "Eshâb-ı Kirâm" doğru
  (Hızır için kitabın "Nebî veyâ Velî" ifadesi gözetilmeli).
- **`maddeler`: güvenilir** (≈ %1–1,5 yanlış; paylaşılan sahîfelerden gelen 19 bağ ayıklanmalı).
- **"Adı geçen büyükler" başlığı kaldırılmalı ya da "Hâl tercemeleri" yapılmalı**; 45 maddede kitabın kötülediği kişileri "büyük" diye sunuyor.
