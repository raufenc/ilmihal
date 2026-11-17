# Namaz Vakitleri sayfası — envanter, hesap çekirdeği ve sınama

Kaynak dosya: `namaz-vakitleri/index.html` (1726 satır, tek dosya; dal `yeni-site`).
Çıkarılan modül: `tools/yeni-site/namaz-hesap.mjs` · Sınama: `tools/yeni-site/namaz-hesap.test.mjs`.
Kitap metni: `texts/kisim1.json["60"]` (60. madde "NEMÂZ VAKTLERİ", 114 462 karakter). Bu belgede
**¶N** = o metnin `split("\n")` ile bölünmüş hâlinin N. satırı (1'den sayılır; boş satırlar dâhil).
Metin değiştirilmedi. "s. …" diye geçen sayfa numaraları **sayfanın kendi atıflarıdır**; kitabın basılı
sayfa numaraları `texts/` içinde yalnız şekil/cedvel işaretlerinden (⟦şekil:180⟧, ⟦cedvel:185⟧, ⟦şekil:193⟧,
⟦cedvel:196–198, 203⟧) çıkarılabildi, satır bazında **doğrulanmadı**.

Sınama özeti: eski sayfanın gösterdiği **288 vakitten 288'i** (6 yer × 4 tarih × 12 vakit) modülle
dakikası dakikasına aynı; sayfanın ham hesap çıktısından **408 değerin 408'i** kayan nokta düzeyinde aynı.
Toplam 745 denetimin 745'i geçti (ayrıntı §6).

---

## 1. Sayfanın bölümleri ve arayüz metinleri

### 1.0 Baş kısım (satır 1–12)
- `<title>`: "Namaz Vakitleri | Se'âdet-i Ebediyye"
- `description`: "Se'âdet-i Ebediyye'nin "Nemâz Vaktleri" maddesine (1. kısım, 60. madde, s. 175–203) göre beş vakit namazın vakitleri: fecr ve şafak irtifâları, temkin, ta'dîl-i zemân ve kitaptaki hesap usûlü."
- Yazı tipleri `/fonts/fontlar.css` (Inter, Amiri). Renk teması koyu lacivert (`--bg:#06091a`), güneş sarısı (`--sun:#f5c842`).

### 1.1 Üst gezinti (satır 235–246)
- "← Se'âdet-i Ebediyye" (ana sayfaya), logo: ay simgesi + "Namâz Vakitleri"
- Bağlantılar: "Günün Vakitleri" (#gunes-arc), "Vakitlerin Tarifi" (#vakitler), "Temkin" (#temkin), "Ta'dîl-i Zemân" (#tadilzaman). 640 px altında bağlantılar gizlenir.

### 1.2 Giriş (hero, satır 249–262)
- Etiket: "Se'âdet-i Ebediyye · 1. kısım, 60. madde"
- Başlık: "NAMAZ / VAKİTLERİ"
- Alt yazı: "Beş vakit namazın vakitleri ve kitapta bildirilen hesap usûlü"
- Kaynak: "Kaynak: Se'âdet-i Ebediyye, "Nemâz Vaktleri", s. 175–203"
- Düğmeler: "Günün Vakitleri" (#gunes-arc), "Maddeyi Oku" (/madde/1/60)
- "Aşağı kaydır" ipucu; arka planda 200 yıldızlı titreşen canvas (satır 820–846).

### 1.3 "Günün Vakitleri" — Güneşin Bir Günlük Seyri (`#gunes-arc`, satır 265–315)
- Etiket "Günün Vakitleri", başlık "Güneşin Bir Günlük Seyri".
- Açıklama: "Kitapta bildirildiği üzere her namazın vakti, güneşin ufka göre belli bir irtifâa gelmesiyle başlar (s. 175). Şehri ve tarihi seçin; vakitler, güneşin seyri üzerinde gösterilir."
- Denetimler: **Tarih** (`#gc-date`, takvim girişi), **Konum** (`#gc-city`, 20 Türk şehri). Sağda bilgi: "Arz 41,01° · Tûl 28,98° · Temkin 10 dk" ve "Meyl-i şems: x,xx° · Ta'dîl-i zemân: ±x,x dk" (satır 1198–1201; arz/tûl noktayla, meyl/ta'dîl virgülle yazılır).
- **Güneş yayı canvas'ı** (`#solar-canvas`, satır 851–1104): yatay eksen 00:00–24:00 saat, düşey eksen irtifâ (ufkun üstü 0…gâye irtifâı, altı 0…−19°). Gök rengi irtifâya göre değişir. Kesik referans çizgileri ve etiketleri: "+5° (işrâk / isfirâr)", "−10° (iştibâk-i nücûm)", "−17° (işâ-i evvel)", "−19° (fecr / işâ-i sânî)". Pusula yazıları "DOĞU", "BATI", "ZENİT". Güneş üzerinde kutu: geçerli olayın adı + "İrtifâ: +xx,x° | Ufkun üzerinde/Ufkun altında". Ufuk çizgisinde 12 olay çentiği; 6 ana vakitte saat etiketi.
- Olay adları (EVENTS, satır 863–876): "İmsâk — fecr-i sâdık (−19°)", "Güneş (tulû') — kerâhet vakti", "İşrâk (kuşluk) vakti", "Zevâl — kerâhet vakti", "Öğle (zuhr) vakti", "İkindi — asr-ı evvel", "Asr-ı sânî (İmâm-ı a'zam)", "İsfirâr — kerâhet vakti", "Akşam — şer'î gurûb", "İştibâk-i nücûm (−10°)", "Yatsı — işâ-i evvel (−17°)", "İşâ-i sânî (−19°)"; imsâktan önce "Gece — yatsı vakti" (satır 1106).
- Oynatma: "▶ Başlat" / "⏸ Duraklat"; zaman şeridi sürüklenebilir; altında "SS:DD · geçerli olay → sonraki olay". Vakit düğmeleri: İmsâk, Güneş, Öğle, İkindi, Akşam, Yatsı (saatleriyle; satır 878–887).
- **Vakit cedveli** (`#pr-grid`, satır 309–313, 1226–1249): başlık "Vakit cedveli — {Şehir} · {gün ay yıl}". 12 satır (kalın olanlar ana vakit): **İmsâk (fecr-i sâdık)**, **Güneş (şer'î tulû')**, İşrâk (kuşluk), Zevâl (kerâhet) başlangıcı, **Öğle (zuhr)**, **İkindi (asr-ı evvel)**, Asr-ı sânî, İsfirâr-ı şems, **Akşam (şer'î gurûb)**, İştibâk-i nücûm, **Yatsı (işâ-i evvel)**, İşâ-i sânî.
- Cedvel notu (satır 312, aynen): "Vakitler, kitaptaki usûle göre hesaplanmıştır: güneş merkezinin hakîkî ufka göre vaktin irtifâına geldiği *hakîkî vakit* bulunur; imsâk ve güneş vakitlerinden **temkin** çıkarılır, öğle, ikindi, akşam ve yatsı vakitlerine eklenir (s. 187–188). Temkin, kitapta İstanbul için bildirilen vasatî 10 dakikadır (s. 186); kitapta başka şehirlerin vakitleri de İstanbul'un temkiniyle hesaplanmıştır (s. 193). Bir şehrin kendi temkini, en yüksek yerine göre bir-iki dakika farklı olabilir (s. 190). Bu sayfa kitaptaki hesabı anlatmak içindir; buradaki vakitler takvimden birkaç dakika farklı çıkabilir. **Namaz kılarken, oruca başlarken ve iftar ederken âlimlerin tasdîk ettiği takvime uyunuz**; Hakîkat Kitâbevi'nin hazırladığı Türkiye Takvimi bunlardandır." (bağlantı: turktakvim.com)

### 1.4 "Vakitlerin Tarifi" — Beş Vakit Namazın Vakitleri (`#vakitler`, satır 318–421)
Açıklama: "Kitapta her namazın evvel vakti, güneşin o yerdeki ufuktan belli bir irtifâa gelmesiyle tarif edilir (s. 175–178). Kartlardaki dereceler, güneş merkezinin hakîkî ufka göre irtifâıdır."

Sekiz kart (ad · Arapça · açı rozeti · açıklama · ayrıntı):

| # | Kart | Arapça | Rozet | Açıklama ve ayrıntının özü (sayfadaki atıflarla) |
|---|---|---|---|---|
| 1 | İmsâk — Fecr-i sâdık | الفجر الصادق | Güneşin irtifâı −19° | Sabah namazı ve oruç, şark ufkunda beyazlığın (fecr-i sâdık) görülmesiyle başlar (s. 176); bu anda güneş 19° altta. Fecr irtifâı dört mezhepte −19° (s. 176); imsâk beyazlığın yayıldığı değil ilk görüldüğü vakittir; −18° veya −16° ile hesap eden takvimlere uyanların orucu sahîh olmaz (s. 176, 198). |
| 2 | Güneş — Tulû' | طُلُوع الشَّمْس | 0° | Sabah vakti güneşin üst kenârı zâhirî ufuktan doğuncaya kadar (s. 176–177); doğarken kerâhet başlar. Sabah namazında güneş doğmaya başlarsa namaz sahîh olmaz (s. 202). Takvimdeki güneş vakti hakîkî tulû'dan temkin çıkarılarak bulunur (s. 187). |
| 3 | Kerâhet Vakitleri ve İşrâk | أَوْقَاتُ الْكَرَاهَة | İşrâk +5° | Üç tahrîmen mekrûh vakit: doğarken, batarken, zevâlde (s. 201). Merkez hakîkî ufuktan 5° (bir mızrak boyu) yükselince işrâk; tulû'dan takrîben 40 dk sonra. Bu vakitlerde başlanan farzlar sahîh olmaz, nâfileler tahrîmen mekrûh (s. 201); batarken yalnız o günün ikindisi (s. 202); işrâkta iki rek'at sünnet, bayram namazı bu vakitte (s. 201). |
| 4 | Öğle — Zuhr | الظُّهْر | zevâlden sonra | Güneşin arka kenârı zevâl yerinden ayrılıp gölge uzamaya başlayınca (s. 178); takvimdeki öğle, hakîkî zevâlden temkin kadar sonra (s. 188). **Zevâl (kerâhet) vakti:** ön kenârın şer'î zevâl dâiresine girdiği ve arka kenârın çıktığı vakit arası; İstanbul için hakîkî zevâlden 10 dk önce başlar, 10 dk sonra biter (s. 182, 202). **Öğlenin sonu:** gölge fey-i zevâlden bir boy (iki imâm ve üç mezhep) veya iki boy (İmâm-ı a'zam) uzayınca (s. 178). |
| 5 | İkindi — Asr | العَصْر | fey-i zevâl + 1 veya 2 boy | Öğle bitince başlar, arka kenâr zâhirî ufuktan batıncaya kadar (s. 178). **Asr-ı evvel** (bir boy), **asr-ı sânî** (iki boy, İmâm-ı a'zam); Türkiye takvimleri asr-ı evvele göre; kışın 36, yazın 72 dk sonra kılınınca İmâm-ı a'zama da uyulur (s. 178); ikindi ve yatsıyı İmâm-ı a'zamın kavline göre kılmak ihtiyâtlı (s. 194). **İsfirâr:** alt kenâr ufka bir mızrak boyu yaklaştıktan sonraya bırakmak harâm (s. 178). |
| 6 | Akşam — Mağrib | المَغْرِب | 0° (gurûb) | Üst kenâr zâhirî ufuktan kaybolunca başlar, yatsıya kadar (s. 178); takvimdeki akşam, hakîkî gurûba temkin eklenen şer'î gurûb (s. 186). Vaktin evvelinde kılmak sünnet; **iştibâk-i nücûm**dan (arka kenâr 10° altta) sonraya bırakmak harâm; hastalık, seferîlik, hazır yemek için geciktirilebilir (s. 178). |
| 7 | Yatsı — İşâ | العِشَاء | −17° veya −19° | Kırmızılık kaybolunca (işâ-i evvel; iki imâm ve üç mezhep), beyazlık da kaybolunca (işâ-i sânî; İmâm-ı a'zam); Hanefîde fecre kadar (s. 178). Kırmızılık −17°'de, beyazlık −19°'de kaybolur; gecenin yarısından sonraya bırakmak Hanefîde mekrûh (s. 178, 194). |
| 8 | Fey-i Zevâl ve İkindi Hesabı | فَيْء الزَّوَال | zevâldeki gölge | Zevâldeki en kısa gölge fey-i zevâl; yalnız öğle ve ikindi için kullanılır (s. 182). **Hesap:** fey-i zevâl = tan(90° − gâye irtifâı); asr-ı evvel tan(temâm-ı irtifâ) = 1 + fey-i zevâl, asr-ı sânî 2 + fey-i zevâl (s. 196–197). Misal: İstanbul 13 Ağustos gâye irtifâı 63° 50′, fey-i zevâl tan 26° 10′ = 0,4913 m, asr-ı evvel irtifâı 33° 51′ (s. 196). |

### 1.5 "Kitaptaki Hesap" — Temkin (`#temkin`, satır 424–484)
- Açıklama: "Bir namazın hakîkî vakti ile şer'î vakti arasındaki zaman farkına **temkin** denir (s. 176). Güneşin merkezi hakîkî ufuktan battıktan sonra, arka kenârının şer'î ufka inerek ziyâsının en yüksek tepeden kaybolması için geçen zamandır (s. 186). Temkin bir ihtiyât payı değildir: kitapta, temkini ihtiyât zannedip imsâkı 3–4 dakika geciktirenin ve iftarı 3–4 dakika öne alanın orucunun fâsid olacağı bildirilir (s. 186)."
- **Temkin canvas'ı** (satır 1255–1438): batı ufku, tepe ve râsıd; etiketler "Üfk-ı hakîkî (hesap) — 0°" (sarı kesik), "Üfk-ı şer'î (en yüksek tepeden)" (turuncu), köşeli ayraçlar "İnhitât", "Nısf-ı kutr", "İnkisâr" (değerleriyle), toplam "≈ x,x dk Temkin", "Râsıd", "En yüksek yer · N m", "Üst kenâr şer'î ufukta" / "Merkezin hakîkî yeri", lejant "Kırılmış ışın (görünen)", "Düz ışın (hakîkî)", "← BATI". Düğme "▶ Batışı Göster"/"Duraklat"; sürgü "En yüksek yerin yüksekliği: 267 m" (0–2500 m).
- Üç kart: **1 · İnhitât-ı ufuk zâviyesi** ("Şehrin en yüksek yerinden bakan râsıdın ufkunun alçalmasıdır. Ahmed Ziyâ beğe göre açı sâniyesi olarak `106,92 × √yükseklik (m)` kadardır; İstanbul'da Çamlıca tepesi (267 m) için 29 dakikadır (s. 185)." + canlı formül satırı); **2 · İnkisâr (ışığın kırılması)** 44′ 30″ ("…kitapta 44,5 dakika olarak alınmıştır (s. 185). Hava tabakaları ziyâyı kırdığı için güneş, batmasından sonra da bir müddet görünür (s. 179)."); **3 · Nısf-ı kutr-ı zâhirî** 15′ 45″ ("Güneşin görünen yarıçapıdır; kitapta asgarî değeri… alınmıştır (s. 185). Bu üç büyüklükten ihtilâf-ı manzar (8,8 sâniye) çıkarılınca güneşin *irtifâ zâviyesi* bulunur.").
- **Temkin hesabı — {Şehir}, {gün ay}** kartı: "İrtifâ zâviyesi: inhitât + 44′ 30″ + 15′ 45″ − 8,8″ = toplam"; "Bu gün için hesap: x dk yy sn"; "Kitaptaki cedvel (s. 1244): …" (500 m üstünde "cedvel 500 metreye kadardır"); "2 dakika ihtiyât ile: …". Not (satır 481): "Kitapta İstanbul için 21 Mart ve 23 Eylül'de temkin 7 dakika 52 sâniye bulunmuş; … iki dakika ihtiyât eklenerek İstanbul'un temkini vasatî 10 dakika kabûl edilmiştir (s. 186). Bir şehirde tek bir temkin vardır; her namaz için ayrı temkin yoktur. İmsâk ve güneş vakitlerinde temkin hakîkî vakitten çıkarılır; öğle, ikindi, akşam, iştibâk ve yatsı vakitlerinde eklenir (s. 187–188). Cedveldeki yükseklik, şehrin en yüksek yerinin en aşağı yerinden itibaren yüksekliğidir (s. 1244)."

### 1.6 "Zaman Düzeltmesi" — Ta'dîl-i Zemân (`#tadilzaman`, satır 487–542)
- Açıklama: "Hakîkî güneş ile vasatî güneş arasındaki bir günlük zaman farkına **ta'dîl-i zemân** denir; vasatî güneş ileride ise artı, geride ise eksidir (s. 184). Vasatî saat ile bilinen bir vakte ta'dîl-i zemân eklenince hakîkî zamana göre vakit bulunur; bu yüzden öğle vaktini doğrudan etkiler."
- Denetimler: "Tarih", "Grafik Yılı" (bu yıl ±5), "Hesapla & Güncelle"; sürgü "Tarihi sürükle: …", "Yılın günü: …".
- Göstergeler: "Seçili tarih için Ta'dîl-i Zemân", "Yıl içi minimum / maksimum", "Sıfır geçişleri (yaklaşık günler)".
- Grafik: "Ta'dîl-i zemân — bir sene içindeki değişimi", ay kısaltmaları Oca…Ara, ± alanlar sarı/çivit, seçili gün yeşil işaret.
- Alt metin: "**Sebepleri** (s. 183–184): 1. Yer küresinin güneş etrafındaki yolu dâire değil, beyzî (elips) olduğundan eşit zamanlarda gittiği yaylar eşit değildir; güneşe yaklaştıkça sür'ati artar. 2. Yer küresinin mihveri, husûf düzlemine (ekliptik) dik değildir; mihver ile husûf mihveri arasında 23° 27′ açı vardır. **Mikdârı:** Ta'dîl-i zemân bir senede takrîben +16 dakika ile −14 dakika arasında değişir ve senede dört defa sıfır olur (s. 184). Vasatî saat ile zevâl vakti 12'den önce ise ta'dîl-i zemân (+), sonra ise (−) olur (s. 193)."

### 1.7 Alt bilgi (satır 544–548)
"Kaynak: Se'âdet-i Ebediyye (Hakîkat Kitâbevi), 1. kısım, 60. madde "Nemâz Vaktleri", s. 175–203 · Temkin Cedveli, s. 1244" · "Maddeyi oku" · "← Se'âdet-i Ebediyye ana sayfasına dön".

### 1.8 Kavramlar sözlüğü (sayfada geçenler + kitaptaki karşılıkları)
`tanimlar.js` içinde 60. maddeden gelen tanımlar var (satır numarası: 91, 104, 119, 135, 140, 152–157, 183–184, 211, 214–215, 245, 284, 290–291, 300–301, 350–351, 368, 393–394, 403–405, 421, 430–433, 440, 460, 484–485, 489, 499–503); `data.js` içinde namaz vakitlerine ait cedvel YOK (yalnız rekât sayıları).

| Kavram | Sayfada / kitapta anlamı | Kitapta yeri |
|---|---|---|
| Hakîkî / riyâzî (riyâdî) vakit | Güneş merkezinin hakîkî ufka göre vaktin irtifâına geldiği, hesapla bulunan an | ¶11, ¶111 |
| Şer'î vakit | Güneş kenârının şer'î ufka göre o irtifâda olduğu an; hakîkî vakitten temkin kadar farklı | ¶111 |
| Mer'î vakit | Riyâdî vakitten 8 dk 20 sn sonra görülen; saatler zaten mer'î olduğu için ayrıca eklenmez | ¶11, ¶350 |
| Temkin | Hakîkî ile şer'î vakit arasındaki zaman; İstanbul için vasatî 10 dk | ¶107 |
| İrtifâ zâviyesi | İnhitât + inkisâr + nısf-ı kutr − ihtilâf-ı manzar = 1° 29′ 6,2″ (İstanbul) | ¶107 |
| İnhitât-ı ufuk | Yüksek yerden bakanın ufkunun alçalması: 106,92″·√Y; yaklaşık 0,03°·√Y | ¶51, ¶107, ¶360–368 |
| İnkisâr | Işığın kırılması, ufuk altı için 44,5′ (ova/deniz için 0,56° da geçer) | ¶31, ¶107 |
| Nısf-ı kutr-ı zâhirî | Güneşin görünen yarıçapı, asgarî 15′ 45″ | ¶107 |
| İhtilâf-ı manzar | Paralaks, 8,8″ (çıkarılır) | ¶107 |
| Fadl-ı dâir (H) | Güneş merkezinin vaktin irtifâındaki saat açısı; zevâlden (gündüz) veya gece yarısından (gece) zaman farkı; derecenin 4 katı dakika | ¶111, ¶183–205, ¶290–312 |
| Nısf fadla | sin(nısf fadla) = tan meyl · tan arz; gündüz uzunluğu farkının yarısı | ¶141–145 |
| Nısf-ün-nehâr | Meridyen; hakîkî zevâlin olduğu dâire | ¶15 |
| Meyl-i şems (δ) | Güneşin ekvatordan açısal uzaklığı; kitap sonundaki günlük cedvelden, saatlik ara değerle | ¶141, ¶286–288 |
| Ta'dîl-i zemân | Hakîkî ile vasatî güneş farkı; + iken vasatî zevâl 12'den önce | ¶73, ¶105, ¶151 |
| İrtifâ' (h) | Güneş merkezinin hakîkî ufuktan yüksekliği; ufuk altında − | ¶15, ¶196 |
| Gâye irtifâ' | Zevâldeki irtifâ' = 90 − |φ − δ| | ¶211 |
| Fey-i zevâl | Zevâldeki gölge = tan(temâm-ı gâye irtifâ') | ¶211 |
| Hakîkî / hissî / riyâzî / mer'î / sathî / şer'î ufuk | Altı ufuk düzlemi; şer'î ufuk en yüksek yerin zâhirî ufuk hattından geçen düzlem | ¶9, ¶53 |
| İşrâk (duhâ, kuşluk) | Merkez +5°; tulû'dan ~40 dk sonra; temkin kadar sonraya alınır | ¶318, ¶344 |
| İsfirâr-ı şems | Merkez +5° (ikindi tarafı); değiştirilmez | ¶320, ¶344 |
| Dahve-i kübrâ | Şer'î gündüzün yarısı = (imsâk + gurûb)/2 (müşterek saatle) — **sayfada yok** | ¶29 |
| Kerâhet zemânı | Tulû'–duhâ, isfirâr–gurûb, şer'î zevâl (hakîkî zevâl ± temkin) | ¶344, ¶346 |
| Asr-ı evvel / sânî | tan(temâm-ı irtifâ') = 1 / 2 + fey-i zevâl | ¶244–262, ¶326–330 |
| İşâ-i evvel / sânî | Merkez hakîkî ufuktan −17 / −19 | ¶25, ¶264 |
| İmsâk (fecr-i sâdık) | Merkez −19; hakîkî imsâktan temkin çıkarılır | ¶13, ¶273–280 |
| İştibâk-i nücûm | Arka kenâr zâhirî ufuktan 10° altta | ¶23 |
| Hisse-i fecr / şafak | Fecr–tulû' / gurûb–şafak arası | ¶282 |

---

## 2. Hesap: formüller ve sabitler (satır numaralarıyla)

Eski sayfanın hesabı `<script>` içinde satır 551–815'tedir. Modülde her işlevin yanına eski satır yazılıdır.

### 2.1 Zaman ve Jülyen günü
- `julianDay(y,m,d,h)` (589–594): Meeus JD; `h` = UT saati = **yerel müşterek dakika/60 − saatDilimi**.
- `T = (JD − 2451545)/36525` (596).

### 2.2 Güneşin meyli (598–632) — NOAA/Meeus kısaltması
- L0 = 280,46646 + T(36000,76983 + 0,0003032T) mod 360 (vasatî tûl)
- M = 357,52911 + T(35999,05029 − 0,0001537T) (vasatî anomali)
- e = 0,016708634 − T(0,000042037 + 0,0000001267T) (yörünge dış merkezliği; kitapta "beyzî yol", sayfada "Sebepleri 1")
- C = sin M(1,914602 − T(0,004817 + 0,000014T)) + sin 2M(0,019993 − 0,000101T) + 0,000289 sin 3M
- λ = L0 + C − 0,00569 − 0,00478 sin Ω, Ω = 125,04 − 1934,136T (görünen tûl)
- ε0 = 23° 26′ (21,448 − T(46,815 + …))″; ε = ε0 + 0,00256 cos Ω (kitapta 23° 27′)
- **δ = asin(sin ε · sin λ)**

### 2.3 Ta'dîl-i zemân (634–643)
- y = tan²(ε/2); E = y sin 2L0 − 2e sin M + 4ey sin M cos 2L0 − ½y² sin 4L0 − 1,25e² sin 2M; **ta'dîl = 4·E (rad→derece) dakika**.
- İşaret kitaptaki gibi: + iken hakîkî zevâl vasatî 12'den önce (¶151; satır 633 yorumu).
- **Dikkat:** Ta'dîl grafiği bölümü (1520–1525) **ayrı** bir yaklaşık formül kullanır (Spencer türü, yılın gününe bağlı). İki formül arasında 2026'da en çok **0,785 dk** fark (12 Ocak) ölçüldü (§4, §6).

### 2.4 Hakîkî zevâl, boylam ve saat dilimi (646–648)
- **zevâl (yerel müşterek dakika) = 720 − 4·tûl − ta'dîl + 60·saatDilimi**.
- Kitaptaki karşılığı: bir tûl derecesi 4 dakika (¶121), müşterek saat farkı tûl farkının 4 misli (¶127), vasatî vakit = hakîkî vakit − ta'dîl (¶73, ¶151). Yaz saati yok; saat dilimi şehirde sabit (hepsi +3).

### 2.5 Fadl-ı dâir (651–656)
- **cos H = (sin h − sin φ sin δ) / (cos φ cos δ)**; |cos H| > 1 ise NaN (güneş o irtifâa varmaz).
- Kitaptaki (3) numaralı müsâvât, "hep payındaki (–) işâreti ile, bütün sayılar işâretleriyle" şekli (¶290–312). Kitap ayrıca yarım açı şeklini (¶186–205: sin(H/2) = √[sin(M−temâm-ı meyl)·sin(M−temâm-ı arz)/(sin temâm-ı meyl · sin temâm-ı arz)], M = yarım çevre) verir; sonuç aynıdır.
- Vakit = zevâl ± 4·H dakika (zevâlden önce −, sonra +).

### 2.6 Her vaktin irtifâı ve temkin yönü (686–735)

| Vakit (cedvel adı) | Merkezin hakîkî irtifâı h | Hakîkî vakit | Temkin | Eski satır |
|---|---|---|---|---|
| İmsâk (fecr-i sâdık) | −19° | zevâl − 4H | **− temkin** | 723 |
| Güneş (şer'î tulû') | 0° | zevâl − 4H | **− temkin** | 724 |
| İşrâk (kuşluk) | +5° | zevâl − 4H | **+ temkin** | 725 |
| Zevâl (kerâhet) başlangıcı | — | zevâl | **− temkin** | 726 |
| Öğle (zuhr) | — | zevâl | **+ temkin** | 727 |
| İkindi (asr-ı evvel) | atan(1/(1 + tan(90 − gâye))) | zevâl + 4H | **+ temkin** | 728 |
| Asr-ı sânî | atan(1/(2 + tan(90 − gâye))) | zevâl + 4H | **+ temkin** | 729 |
| İsfirâr-ı şems | +5° | zevâl + 4H | yok | 730 |
| Akşam (şer'î gurûb) | 0° | zevâl + 4H | **+ temkin** | 731 |
| İştibâk-i nücûm | −10° | zevâl + 4H | **+ temkin** | 732 |
| Yatsı (işâ-i evvel) | −17° | zevâl + 4H | **+ temkin** | 733 |
| İşâ-i sânî | −19° | zevâl + 4H | **+ temkin** | 734 |

- Gâye irtifâ = 90 − |φ − δ| (713); fey-i zevâl = tan(90 − gâye) (722).
- Temkin: **her yerde sabit 10 dk** (`TEMKIN_DK`, 561). Rakım vakitlere hiç girmez.
- **Yineleme** (`hakikiVakit`, 696–711): hesap 12:00'de başlar; o anın meyli ve ta'dîli ile vakit bulunur, bulunan anın meyli/ta'dîli ile 3 kez tekrarlanır. 3 yinelemenin yakınsama hatası İstanbul'da 2026 boyunca < 0,01 sn ölçüldü. Kitap da meylin vaktin anına göre (saatlik değişimiyle) alınmasını söyler (¶286–288).
- Asr irtifâında fey-i zevâl, `irtifaFn(dec)` ile **ikindi anındaki** meyl ile hesaplanır (715), zevâldeki meyl ile değil (bkz. §3, ayrılık 3).
- Gösterim: `minutesToHM` (672–679) en yakın dakikaya **yuvarlar**; NaN → "--:--"; 24 saat sarmalı.
- Önbellek: `_vakitOnbellek`, anahtar "yıl-ay-gün|şehir adı" (688–692).

### 2.7 Temkin bölümünün hesabı (vakitlere girmez; 743–801)
- İnhitât (dakika) = 106,92·√Y / 60; inkisâr 44,5′; nısf-ı kutr 15,75′; ihtilâf-ı manzar 8,8″. Toplam = irtifâ zâviyesi.
- Bu gün için temkin = 4·(H(h = −toplam) − H(h = 0)), δ = o günün zevâlindeki meyl.
- "2 dakika ihtiyât ile" = hesap + 2.
- Cedvel (743–765): 21×21, yükseklik 0–500 m (25 m), arz 0–60° (3°), "dk.sn"; çift doğrusal ara değer (771–778). Sayfa "kitap s. 1244'ten aynen" der; `texts/` içinde bu cedvel bulunamadı → **doğrulanmadı**.
- Kitabın kendi yaklaşık düstûru (¶394, (4)): N(saat) = sin(0,03√Y + 1,05°)/(cos φ cos δ) × 3,82 — sayfada **kullanılmaz** (modülde `temkinKitapYaklasik`).

### 2.8 Yüksek enlemler
- |cos H| > 1 olunca vakit NaN, cedvelde "--:--". Londra 21 Haziran'da imsâk, işâ-i evvel ve işâ-i sânî "--:--" (güneş −15° altına inmiyor). Sayfada hiçbir açıklama yok.
- Kitap (¶27): arz + meyl ≥ 71° olan yaz günlerinde şafak kaybolmadan fecr başlar (Paris misali, 12–30 Haziran); Hanefîde vakit sebep olduğundan bu iki namazın farz olmadığı, bazı âlimlere göre yakın arzlardaki vakitlerde kılınacağı ve köşeli ayraç içinde "vaktlerinin olduğu en son günün vaktlerinde" kılmanın iyi olacağı bildirilir. Sayfa bu bilgiyi aktarmaz, hesapta da bir seçenek sunmaz. Türk şehirlerinde (arz ≤ 42°) bu durum oluşmaz.

---

## 3. Kitabın 60. maddesindeki usûl ile karşılaştırma

### Birebir uyan noktalar
- Hakîkî vakit → temkinle şer'î vakit; zevâlden önce (imsâk, tulû') temkin çıkarılır, sonra (zuhr, asr, gurûb, iştibâk, işâ) eklenir (¶111). Müşterek/vasatî saatte tek temkin; kitaptaki "iki temkin" kuralı yalnız **ezânî** saate çevirirken geçerlidir (¶111, ¶143) ve sayfa ezânî saat göstermez.
- İrtifâlar: fecr −19 (¶13, ¶273–280), işâ-i evvel −17 (¶264), işâ-i sânî −19 (¶25), tulû'/gurûb merkez 0 (¶348), işrâk ve isfirâr merkez +5 (¶318, ¶320). İşrâka temkin eklenir, isfirâr değiştirilmez (¶344). Şer'î zevâl = hakîkî zevâl ± temkin (¶346).
- Asr: tan(temâm-ı irtifâ') = 1 veya 2 + fey-i zevâl, fey-i zevâl = tan(φ − δ) (¶209–262, ¶326–330).
- Fadl-ı dâir düstûru (¶290–312) ve zevâl/boylam/ta'dîl bağıntıları (¶121–155).
- Ta'dîl işareti (¶151). Mer'î vakit için ayrıca 8 dk 20 sn eklenmez (¶11).
- Temkin bölümündeki unsurlar ve 21 Mart İstanbul temkini: modül 7,872 dk, kitap 7 dk 52,29 sn = 7,871 dk (¶107).
- İstanbul dışındaki şehirlerde 10 dk: kitap Ankara (¶155: öğle 12:11), Viyana, Paris, New York, Delhi (¶145) misallerinde de 10 dakika ile hesaplar; sayfanın "başka şehirler de İstanbul'un temkiniyle" sözü bu misallerle uyuşuyor.

### Ayrılan noktalar (karar sizin; düzeltme önerisi parantez içinde)
1. **Temkin şehre göre değişmiyor, rakım kullanılmıyor.** Kitap her şehrin tek bir temkini olduğunu, bunun o şehrin en yüksek yerinden hesaplandığını (¶107–109, ¶123), ayrıca cedvel ve yaklaşık düstûr (¶390–394) verdiğini söyler. Sayfa her yer için 10 dk kullanır; temkin bölümündeki yükseklik sürgüsü vakitleri etkilemez. Ölçüm: İstanbul 267 m için hesaplanan temkin yıl içinde 7,88–9,35 dk; cedvel 9,33 dk; 0 m için cedvel Mekke 4,11, Londra 7,31, Taşkent 5,47 dk. (Öneri: `vakitler({temkin})` parametresi var; şehir başına temkin verisi eklenebilir.)
2. **Meyl ve ta'dîl kaynağı.** Kitap günlük cedvelden (kitap sonunda) saatlik ara değerle alır (¶105, ¶141, ¶286–288); sayfa NOAA formülüyle her vaktin anına göre hesaplar. Kitabın verdiği değerlerle fark meylde ≤ 0,10°, ta'dîlde ≤ 0,52 dk (§6-b; kitabın yılı belli olmadığından bu farkın ne kadarının yıl seçiminden geldiği doğrulanmadı).
3. **Asr hesabında fey-i zevâlin meyli.** Kitap fey-i zevâli zevâldeki gâye irtifâından alır (¶205, ¶211); sayfa (satır 715) ikindi anındaki meyli kullanır. Fark en çok İstanbul 8,1 sn, Londra 11,3 sn, Mekke 5,9 sn; yuvarlanmış dakikayı 2026'da İstanbul'da 50, Londra'da 83, Mekke'de 41 gün-vakit çiftinde (asr-ı evvel + sânî, 730 çift içinde) bir dakika değiştiriyor. (Öneri: `asrIrtifa`'ya zevâl meyli verilebilir.)
4. **Yuvarlama.** Sayfa en yakın dakikaya yuvarlar. Kitapta takvime yazarken nasıl yuvarlandığına dair açık kural bulamadım → **doğrulanmadı**.
5. **Yüksek enlem** (§2.8): kitap seçenekler bildirir; sayfa yalnız "--:--" gösterir.
6. **Gösterilmeyenler:** ezânî vakitler (kitabın büyük kısmı ezânî çeviriye ayrılmıştır, ¶117–181), dahve-i kübrâ (¶29), hisse-i fecr/şafak (¶282), ikindiyi İmâm-ı a'zama göre kılmak için 36/72 dk kuralı (¶21) sayfada hesaplanmaz (kartta metin olarak var).
7. **Tarif metni ile hesap kuralı arasındaki ince fark (sayfa hesap kuralını izliyor):** kitap tarifte kırmızılığın "üst kenârın üfk-ı sathînin altında 17°" olduğunu (¶25), fecrin "ön kenârın şer'î ufka 19° yaklaşması" olduğunu (¶111) söyler; hesap misallerinde ise merkezin hakîkî ufka göre −17/−19 olduğu vakti bulup temkinle düzeltir (¶264, ¶273–280). ¶273'te "−19 dereceden farklıdır" ifadesi geçer ama aynı misalin hesabı 71° (= 90 − 19) ile yapılır. Sayfa bu misallerdeki hesabı aynen uygular.
8. **İnhitât değeri:** 106,92″·√267 = 29,12′; kitap 29′ yazar (¶107). Sayfa formülü kullanır (fark 7 sn açı; temkine etkisi < 1 sn).

---

## 4. Konum, saat dilimi, tarih

- **Konum:** yalnız açılır liste, 20 Türk şehri (satır 563–584; il merkezi koordinatları, Adana enlemi yuvarlak 37,0000). Geolocation **yok**, elle enlem/boylam girişi **yok**, rakım girişi **yok** (yalnız temkin bölümündeki gösterim sürgüsü). Varsayılan **İstanbul** (41,0082 K, 28,9784 D).
- **Saat dilimi:** her şehirde sabit `tz: 3`; yaz saati kuralı yok. Tarayıcının saat dilimi vakitleri etkilemez (yalnız tarih seçimi).
- **Tarih:** `#gc-date`, varsayılan tarayıcının bugünkü yerel tarihi (1189–1191); seçilen gün yerel 12:00 olarak tutulur, hesapta yalnız yıl-ay-gün kullanılır. Yıl sınırı yok.
- Ta'dîl bölümünün tarih ve yıl seçimi **ayrıdır**, üstteki tarih/şehirle bağlı değildir (1688–1707).

---

## 5. Mevcut sayfadaki hatalar ve kırılganlıklar

| # | Satır | Durum |
|---|---|---|
| 1 | 1520–1525 vs 634–643 | Ta'dîl-i zemân için **iki ayrı formül**: üst bilgi ve vakitler NOAA, grafik ve göstergeler Spencer türü. Aynı gün için iki bölüm farklı değer gösterebilir (2026'da en çok 0,785 dk, 12 Ocak). Grafikteki uç günler ve sıfır geçişleri de bu yaklaşık formülden. |
| 2 | 1696 | Ta'dîl bölümünün varsayılan tarihi `now.toISOString().slice(0,10)` = **UTC tarihi**; Türkiye'de 00:00–03:00 arası bir önceki günü gösterir. |
| 3 | 715 | Asr irtifâında fey-i zevâl ikindi anındaki meyl ile (kitapta zevâldeki); bkz. §3 ayrılık 3. |
| 4 | 561, 693 | Temkin her şehirde 10 dk; rakım sürgüsü (1464–1469) vakitleri etkilemez. Temkin bölümündeki "2 dakika ihtiyât ile" sonucu (ör. İstanbul 267 m için 9,9–11,4 dk) üstteki cedvelde kullanılan 10 dk ile aynı değildir; kullanıcı bunu karıştırabilir. |
| 5 | 564–583, 693 | Saat dilimi sabit +3, yaz saati yok: Türkiye 2016 öncesi (+2 ve yaz saati) için geçmiş tarihlerde saatler 1 saate kadar kayar; tarih girişi yıl sınırlamaz. |
| 6 | 654, 705, 862 | Yüksek enlemde NaN: `toF(NaN)` = NaN → EVENTS'e NaN girer, çentikler/etiketler NaN konumda çizilmeye çalışılır. Mevcut 20 şehirde oluşmaz, şehir listesi genişlerse görünür; kullanıcıya açıklama yok. |
| 7 | 982–1009 vs 905–915 | Güneş yayı canvas'ında referans çizgileri (+5°, −10°, −17°, −19°) güneş eğrisinden **farklı ölçekle** çizilir (ufuk üstü MAX_ALT=65 sabit, eğri gâye irtifâına göre; ufuk altı /25, eğri /19). Ör. −19° çizgisi derinliğin %76'sında, güneş −19°'de iken %100'de: güneş, kendi vaktinin çizgisinde görünmez. |
| 8 | 919–928 | `getSkyColor`: irtifâ tam 10,0° iken (irtifâ 0,1'e yuvarlanıyor, satır 934) hiçbir koşul tutmaz, **gece renkleri** döner. |
| 9 | 952, 1056 | Güneş parıltısı saydamlığı ve batış rengi sabit kesirlere (0,12; 0,85–0,92) bağlı, gerçek tulû'/gurûba değil; eşik dışında saydamlık eksiye düşebilir. |
| 10 | 1279 ve 1502 | `window.drawTemkin` iki kez tanımlanıyor (ikincisi birinciyi örter). |
| 11 | 688–692 | Önbellek anahtarı şehir **adı**; aynı adla farklı koordinat verilirse eski sonuç döner; önbellek sınırsız büyür. |
| 12 | 790–791 | Temkin bölümü günün temkinini zevâldeki meyl ile hesaplar (gurûb anındaki değil); etkisi saniye düzeyinde. |
| 13 | 743–765 | Temkin cedvelinin kitaptaki s. 1244 ile karşılaştırması yapılamadı (metin `texts/` içinde yok) → **doğrulanmadı**. |
| 14 | 312 | Cedvel notundaki "(s. 193)" ve "(s. 190)" atıflarının sayfa numaraları doğrulanmadı (kitap metninde basılı sayfa ayırıcı yok). İçerik ¶123 ve ¶145/¶155 ile uyuşuyor. |

---

## 6. Sınama sonuçları (`node tools/yeni-site/namaz-hesap.test.mjs`)

Çalıştırma: 17 Kasım 2026; Python playwright, `channel="chrome"`, başsız, `--mute-audio`, tek tarayıcı;
kısa ömürlü `python3 -m http.server 8097` (iş sonunda kapatıldı). Mekke, Londra, Taşkent sayfanın
listesinde olmadığından sayfanın `CITIES` dizisine ve seçim kutusuna eklenip sayfanın kendi `change`
akışıyla hesaplatıldı. Londra'da 21 Haziran ve 23 Eylül için yaz saati (+1) verildi.

**Sonuç: gösterilen vakitlerde 288/288 birebir; ham değerlerde (meyl, ta'dîl, zevâl, gâye irtifâ,
fey-i zevâl ve 12 vakit, dakika cinsinden kayan nokta) 408/408 birebir. Toplam 745 denetim, 745 geçti.**

### 6-a. Eski sayfa ile karşılaştırma (sayfanın gösterdiği = modül; hepsi 12/12)

| Yer | Tarih | İmsâk | Güneş | İşrâk | Zevâl başı | Öğle | Asr-ı evvel | Asr-ı sânî | İsfirâr | Akşam | İştibâk | İşâ-i evvel | İşâ-i sânî |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| İstanbul | 2026-03-20 | 05:20 | 07:02 | 07:49 | 13:02 | 13:22 | 16:47 | 17:38 | 18:45 | 19:22 | 20:15 | 20:53 | 21:04 |
| İstanbul | 2026-06-21 | 03:04 | 05:27 | 06:18 | 12:56 | 13:16 | 17:17 | 18:31 | 20:04 | 20:45 | 21:52 | 22:48 | 23:08 |
| İstanbul | 2026-09-23 | 05:05 | 06:47 | 07:33 | 12:47 | 13:07 | 16:31 | 17:22 | 18:29 | 19:06 | 19:59 | 20:37 | 20:48 |
| İstanbul | 2026-12-21 | 06:31 | 08:21 | 09:13 | 12:52 | 13:12 | 15:31 | 16:08 | 17:01 | 17:44 | 18:43 | 19:23 | 19:34 |
| Ankara | 2026-03-20 | 05:06 | 06:47 | 07:33 | 12:46 | 13:06 | 16:32 | 17:23 | 18:30 | 19:06 | 19:58 | 20:36 | 20:47 |
| Ankara | 2026-06-21 | 02:58 | 05:15 | 06:05 | 12:40 | 13:00 | 16:59 | 18:13 | 19:46 | 20:26 | 21:31 | 22:25 | 22:43 |
| Ankara | 2026-09-23 | 04:51 | 06:31 | 07:17 | 12:31 | 12:51 | 16:16 | 17:08 | 18:14 | 18:50 | 19:42 | 20:20 | 20:30 |
| Ankara | 2026-12-21 | 06:14 | 08:02 | 08:53 | 12:37 | 12:57 | 15:19 | 15:56 | 16:50 | 17:32 | 18:30 | 19:09 | 19:20 |
| Van | 2026-03-20 | 04:26 | 06:05 | 06:50 | 12:04 | 12:24 | 15:50 | 16:42 | 17:48 | 18:24 | 19:15 | 19:52 | 20:02 |
| Van | 2026-06-21 | 02:26 | 04:38 | 05:27 | 11:58 | 12:18 | 16:14 | 17:28 | 19:00 | 19:39 | 20:42 | 21:33 | 21:50 |
| Van | 2026-09-23 | 04:11 | 05:49 | 06:35 | 11:49 | 12:09 | 15:35 | 16:26 | 17:33 | 18:08 | 18:59 | 19:36 | 19:46 |
| Van | 2026-12-21 | 05:29 | 07:15 | 08:06 | 11:54 | 12:14 | 14:41 | 15:19 | 16:13 | 16:54 | 17:51 | 18:29 | 18:40 |
| Mekke (+3) | 2026-03-20 | 04:57 | 06:19 | 07:00 | 12:18 | 12:38 | 16:03 | 17:00 | 18:07 | 18:38 | 19:21 | 19:51 | 20:00 |
| Mekke (+3) | 2026-06-21 | 03:59 | 05:33 | 06:17 | 12:12 | 12:32 | 15:52 | 17:12 | 18:38 | 19:12 | 20:00 | 20:36 | 20:46 |
| Mekke (+3) | 2026-09-23 | 04:41 | 06:03 | 06:45 | 12:03 | 12:23 | 15:48 | 16:45 | 17:51 | 18:23 | 19:06 | 19:36 | 19:44 |
| Mekke (+3) | 2026-12-21 | 05:20 | 06:48 | 07:32 | 12:09 | 12:29 | 15:33 | 16:18 | 17:16 | 17:50 | 18:36 | 19:09 | 19:18 |
| Londra (+0) | 2026-03-20 | 03:53 | 05:59 | 06:51 | 11:58 | 12:18 | 15:36 | 16:25 | 17:36 | 18:18 | 19:23 | 20:10 | 20:25 |
| Londra (+1) | 2026-06-21 | --:-- | 04:40 | 05:40 | 12:52 | 13:12 | 17:35 | 18:50 | 20:35 | 21:25 | 23:05 | --:-- | --:-- |
| Londra (+1) | 2026-09-23 | 04:37 | 06:43 | 07:36 | 12:43 | 13:03 | 16:20 | 17:09 | 18:19 | 19:01 | 20:06 | 20:53 | 21:07 |
| Londra (+0) | 2026-12-21 | 05:43 | 08:01 | 09:06 | 11:49 | 12:09 | 13:48 | 14:17 | 15:02 | 15:57 | 17:13 | 18:01 | 18:14 |
| Taşkent (+5) | 2026-03-20 | 04:39 | 06:21 | 07:08 | 12:21 | 12:41 | 16:05 | 16:57 | 18:04 | 18:40 | 19:34 | 20:12 | 20:23 |
| Taşkent (+5) | 2026-06-21 | 02:20 | 04:45 | 05:36 | 12:15 | 12:35 | 16:36 | 17:50 | 19:24 | 20:04 | 21:12 | 22:09 | 22:29 |
| Taşkent (+5) | 2026-09-23 | 04:23 | 06:06 | 06:52 | 12:05 | 12:25 | 15:50 | 16:41 | 17:48 | 18:25 | 19:18 | 19:56 | 20:07 |
| Taşkent (+5) | 2026-12-21 | 05:50 | 07:40 | 08:33 | 12:11 | 12:31 | 14:49 | 15:26 | 16:19 | 17:02 | 18:02 | 18:41 | 18:52 |

Not: Bu tablo eski sayfanın (dolayısıyla modülün) ne gösterdiğidir; takvimlerle karşılaştırma değildir.
Londra 21 Haziran'daki "--:--" değerleri §2.8'deki yüksek enlem durumudur.

### 6-b. Bağımsız doğruluk (meyl ve ta'dîl-i zemân)

| Büyüklük | Modül | Beklenen | Fark | Tolerans | Sonuç |
|---|---|---|---|---|---|
| Meyl, 21 Haz 2026 08:24 UT (yaz gündönümü) | 23,438° | 23,436 | 0,002 | ±0,01 | uyuyor |
| Meyl, 21 Ara 2026 20:50 UT (kış gündönümü) | −23,438° | −23,436 | −0,002 | ±0,01 | uyuyor |
| Meyl, 20 Mar 2026 14:46 UT (ekinoks) | 0,002° | 0 | 0,002 | ±0,02 | uyuyor |
| Meyl, 23 Eyl 2026 00:05 UT (ekinoks) | 0,001° | 0 | 0,001 | ±0,02 | uyuyor |
| Meyl yıllık en büyük / en küçük (12:00 UT) | 23,438° / −23,437° | ±23,436 | 0,002 / −0,001 | ±0,01 | uyuyor |
| Ta'dîl en küçük (11 Şubat 2026) | −14,226 dk | −14,2 | −0,026 | ±0,2 | uyuyor |
| Ta'dîl en büyük (3 Kasım 2026) | +16,492 dk | +16,4 | 0,092 | ±0,2 | uyuyor |
| Ta'dîl Mayıs ucu (14 Mayıs) | +3,640 dk | +3,7 | −0,060 | ±0,2 | uyuyor |
| Ta'dîl Temmuz ucu (26 Temmuz) | −6,563 dk | −6,5 | −0,063 | ±0,2 | uyuyor |
| Kitap ¶143: 1 Mayıs meyl 14° 55′ (1985, 00:00 UT) | 14,995° | 14,917 | 0,078 | ±0,15 | uyuyor |
| Kitap ¶145: 1 Nisan meyl 4° 20′ | 4,436° | 4,333 | 0,103 | ±0,15 | uyuyor |
| Kitap ¶213: 13 Ağustos meyl 14° 50′ | 14,755° | 14,833 | −0,078 | ±0,15 | uyuyor |
| Kitap ¶324: 1 Şubat meyl −17° 15′ | −17,176° | −17,250 | 0,074 | ±0,15 | uyuyor |
| Kitap ¶143: 1 Mayıs ta'dîl +3 dk | 2,867 | 3 | −0,133 | ±1 | uyuyor |
| Kitap ¶145: 1 Nisan ta'dîl −4 dk | −4,013 | −4 | −0,013 | ±1 | uyuyor |
| Kitap ¶244: 13 Ağustos ta'dîl −5 dk | −4,910 | −5 | 0,090 | ±1 | uyuyor |
| Kitap ¶324: 1 Şubat ta'dîl −13 dk 31 sn | −13,595 | −13,517 | −0,078 | ±1 | uyuyor |
| Kitap ¶155: 1 Mart ta'dîl −13 dk | −12,481 | −13 | 0,519 | ±1 | uyuyor |

Beklenen değerlerin kaynağı: mâil ε ≈ 23,436° (2026) ve gündönümü/ekinoks anları yaygın almanak
değerleridir; anlar dakika düzeyinde **doğrulanmadı** (tolerans buna göre geniş tutuldu). Ta'dîl uçları
bilinen yaklaşık değerlerdir (±0,2 dk). Kitabın değerleri için yıl belirtilmediğinden 1985 alındı,
meyl kitaptaki gibi Londra 00:00'a göre (¶288). Kitapla farklar meylde 0,07–0,10°, ta'dîlde 0,01–0,52 dk;
kesin sebebi (yıl mı, kitabın cedveli mi) **doğrulanmadı**.

Eski sayfanın ta'dîl **grafik** formülü ile hesap formülü arasındaki en büyük fark (2026): **0,785 dk** (12 Ocak).

### 6-c. Kitaptaki vakit misalleri (İstanbul φ = 41°, λ = 29°, müşterek saat +2, temkin 10 dk, yıl 1985 varsayıldı)

| Misal | Modül | Kitap | Fark (dk) | Yeri |
|---|---|---|---|---|
| 1 Mayıs şer'î gurûb (akşam) | 19:06 | 19:05 | +0,72 | ¶348 |
| 1 Mayıs şer'î tulû' | 04:57 | 04:57 | +0,11 | ¶348 |
| 1 Mayıs şer'î zevâl başı | 11:51 | 11:51 | +0,08 | ¶346 |
| 13 Ağustos imsâk | 03:09 | 03:09 | +0,17 | ¶280 |
| 13 Ağustos asr-ı evvel | 16:10 | 16:10 | −0,42 | ¶244 |
| 13 Ağustos işâ-i evvel | 20:54 | 20:55 | −1,42 | ¶271 |
| 11 Ocak işrâk | 08:15 | 08:15 | −0,39 | ¶318 |
| 11 Ocak isfirâr | 16:20 | 16:19 | +0,58 | ¶320 |
| 1 Şubat asr-ı evvel | 15:09 | 15:08 | +0,65 | ¶330 |
| 1 Mart öğle | 12:26 | 12:27 | −0,60 | ¶155 |
| 13 Ağustos dahve-i kübrâ (modüle eklenen) | 11:10 | 11:11 | −0,97 | ¶29 |
| Temkin 21 Mart (φ=41, δ=0, 267 m) | 7,872 dk | 7 dk 52,29 sn = 7,871 dk | 0,00 | ¶107 |
| İnhitât-ı ufuk, 267 m | 29,12′ | 29′ | +0,12′ | ¶107 |
| Kitabın yaklaşık temkin düstûru (4), φ=41, δ=0, 267 m | 8,16 dk | — (sayfa kullanmaz) | — | ¶394 |

Bütün misaller ±1,5 dakika içinde (denetim eşiği ±2,5 dk). En büyük fark işâ-i evvelde (−1,42 dk);
sebebi doğrulanmadı (kitap cedvel meyli ve 41° yuvarlak arz kullanıyor).

### 6-d. 3B yardımcılarının iç tutarlılığı
- Alt noktada güneşin irtifâı 90° (3 an), `gunesKonumu` ≡ `gunesKonumuDakika`, her hakîkî vakitte güneşin
  irtifâı vaktin irtifâı (±0,05°), kıble İstanbul 151,6° / Londra 119,0°, gün yayı 145 nokta: hepsi geçti.

---

## 7. Üç boyutlu sahne için büyüklükler (modülde)

Hepsi **geometrik** (kırılmasız) güneş merkezi içindir; eski sayfa da kırılmayı vakitlerde temkinin
içinde (44,5′) sayar, konum hesabında saymaz.

| İşlev | Döndürdüğü | Formül / not |
|---|---|---|
| `meyl(an)`, `tadiliZeman(an)` | δ (°), ta'dîl (dk) | §2.2–2.3; `an` Date/ms (UTC) veya tarih (o günün 12:00 UT'si) |
| `vakitler({tarih, enlem, boylam, saatDilimi, temkin=10, rakim})` | 12 vakit için `{hakiki, temkinli, hakikiSaat, saat, irtifa, temkinYonu}` + meyl, ta'dîl, hakîkî zevâl, gâye irtifâ, fey-i zevâl | Eski `calcPrayerTimes` ile birebir. `rakim` vakitleri değiştirmez (eski davranış). |
| `eskiCalcPrayerTimes(tarih, {lat,lon,tz})` | Eski nesnenin aynısı | Karşılaştırma içindir |
| `gunesKonumu(an, enlem, boylam)` | `{irtifa, semt, meyl, saatAcisi, tadil}` | Saat açısı = (UT dakika − (720 − 4λ − ta'dîl))/4; sin h = sin φ sin δ + cos φ cos δ cos H; semt kuzeyden saat yönünde (doğu 90°). |
| `gunesKonumuDakika(tarih, dakika, enlem, boylam, saatDilimi)` | aynı | Eski `getSunPosAtMinute` (803–815) |
| `gunYayi({tarih, enlem, boylam, saatDilimi, adimDk=10})` | `[{dakika, saat, irtifa, semt}]` 00:00–24:00 | Gün yayı ve gece kısmı |
| `vakitKonumlari(p)` | her vaktin hakîkî ve temkinli anında `{dakika, irtifa, semt}` | NaN vakit → `null` |
| `gunesAltNoktasi(an)` | `{enlem: δ, boylam}` | boylam = (720 − UT dakika − ta'dîl)/4, [−180, 180). **Terminatör:** bu noktadan 90° açısal uzaklıktaki büyük daire; alacakaranlık sınırları (−10, −17, −19°) bu noktadan 90° + |h| uzaklıktaki küçük daireler. Eski sayfada yok. |
| `kibleAcisi(enlem, boylam)` | kuzeyden saat yönünde ° | Büyük daire yönü, Kâbe 21,4225 K, 39,8262 D. Eski sayfada **yok**; kitabın 60. maddesinde kıble hesabı yok. |
| `fadliDair`, `irtifaHesapla`, `semtHesapla`, `gayeIrtifa`, `feyiZeval`, `asrIrtifa`, `hakikiVakit` | alt parçalar | §2.5–2.6 |
| `temkinUnsurlari({…, yukseklik})`, `temkinCedvelden`, `temkinKitapYaklasik` | temkin bölümü ve kitap düstûru | §2.7 |
| `dahveiKubra(v)` | dakika | (imsâk + akşam)/2; eski sayfada yok (¶29) |
| `tadiliZemanGrafik(date)` | eski grafikteki ikinci formül | yalnız karşılaştırma için |
| `dakikaSaat(m)` | "SS:DD" | eski `minutesToHM`, en yakın dakika |

Sahne yönü (öneri değil, dönüşüm): yerel doğu-kuzey-yukarı birim vektör =
(cos h · sin semt, cos h · cos semt, sin h). Yer küresi üzerinde alt nokta için
(cos δ cos λ, cos δ sin λ, sin δ) (Greenwich x ekseni, kuzey kutbu z ekseni).
