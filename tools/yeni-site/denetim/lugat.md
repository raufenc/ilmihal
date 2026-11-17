# Fevâid denetimi — Dinî Lügat ve okuyucudaki lügat kenar notları (`lugat`)

Denetlenen: `veri/lugat/*.json` (9 863 terim), `veri/lugat-madde/*.json` (241 madde, 117 308 işaret), eşleme kuralı
(`js/cekirdek/veri.js` `lugatIsaretle`, `tools/yeni-site/veri-uret.mjs` `eskiSozlukDizini/eskiKokBul/eskiVurgu`), başvuru: kökteki `sozluk-data.js`.
Ölçüt: kitabın metni (`veri/madde/*.json`). Hiçbir veri ya da site dosyası değiştirilmedi.
Betikler: `tools/yeni-site/denetim/betik-lugat/` (önce `node hazirla.mjs` → `isaretler.jsonl`, `metinler.json`, `terimler.json` üretir; bu üç büyük ara dosya silindi).
Bulgu listesi: `tools/yeni-site/denetim/lugat.json` (197 bulgu).

## Kapsam ve yöntem

| İş | Nasıl | Kapsam |
|---|---|---|
| Kaynak | depo izleri, `kaynakSahife`, misal kaynakları; kitapta "lügat" geçen 30 yer | bütün kayıtlar betikle; kitap metni tam tarandı |
| Misaller kitapta mı | normalleştirilmiş tam metin + 6 kelimelik pencere araması | 3 689 misalin hepsi betikle |
| Kayıt niteliği | sabit tohumla (400) rastgele 400 kayıt TAM okundu (`kayit400.py`); 164 hassas terim TAM okundu (`hassas.txt`); kitabın 510 tanımından lügatte karşılığı olan 313’ü yan yana okundu (`tanim-yan.txt`) | 400 + 164 + 313 |
| Hürmet / yabancı dil | 9 863 kayıtta düzenli ifade taraması (`tarama.py`) | hepsi |
| Arap harfli yazım | biçim denetimi (boş, Latin, rakam, ters lafza, kırık lâm-elif, ilk/son harf uyumu) betikle; 400 kaydın yazımı göz ile | 9 863 betikle, 400 göz ile (harf harf okuma değil) |
| Kelime → terim eşlemesi | bütün işaretler betikle; sabit tohumla (20261117) rastgele 600 işaret cümlesiyle TAM okundu ve hükmü yazıldı (`orneklem600-hukum.json`); şüpheli 40 biçim grubunda 10’ar bağlam okundu (`grup.py`, `baglam.py`) | 117 308 betikle, 600 + ~300 bağlam okundu |
| Yinelenenler, Bkz. | 55 yinelenen başlığın 111 kaydı TAM okundu; 232 Bkz. hedefi betikle, anlam örtüşmesi düşük 40’ı TAM okundu | hepsi |
| Kural değişikliği etkisi | `kural-olc.py`: 600’lük örneklemdeki hükümler ve bütün işaretler üzerinde | — |

Sınıf sayıları (`lugat.json`): **K 7 · Y 107 · B 83** (Y’lerin 54’ü örneklemdeki tek tek yanlış eşleşmeler, 37’si biçim grubu bulguları).

## 1. Lügatin kaynağı

**Kitapta lügat bölümü yok.** Kitap metninde "lügat" 30 yerde geçer; hepsi başka lügatlere atıftır ((Müncid), (Lugat-ı Nâcî), (Kâmûs), (Burhân-ı kâtı’)) ya da bir kelimenin "lügatde" mânâsını verir (ör. 1-84: "Hac, lügatda, kasd etmek, yapmak, istemek demekdir."). Kitabın son maddesi 3-70 "(Se’âdet-i Ebediyye)nin son sözü" (s. 1040–1058); ardından hâl tercemeleri gelir; bir lügat kısmına dair iz bulunamadı.

**Lügat başka, basılı bir eserden aktarılmış görünüyor (adı bulunamadı; kesin değil).** İpuçları:
- `kaynakSahife` 7–677 arasında, kayıt sırasıyla hiç geri gitmeden artar; her harf bölümü tek sayılı bir sahîfede başlar (A 7, B 53, C 79, Ç 99, D 101, E 117, F 147, G 169, H 181, I 239, İ 243, K 297 … Z 665). Bu, her harfi sağ sahîfeden başlatan ~680 sahîfelik basılı bir lügatin dizgisine uyar. Madde sahîfeleriyle örtüşmez (`envanter-veri.md` de "muhtemelen kaynak lügatin sayfası" der).
- Misallerin kaynak etiketleri (982 ayrı etiket): İbni Âbidîn 590, Mektûbât-ı İmâm-ı Rabbânî 500, Mektûbât-ı Ma’sûmiyye 147, Berîka 97, Miftâhü’l-Cenne 68, El-İstigâsetü’l-Kübrâ 51, Ni’met-i İslâm 50, Halebî 48, hadîs kitapları, Seâdet-i Ebediyye 37, Abdülhakîm Arvâsî 24 … ayrıca Yûnus Emre, Süleymân Çelebi, Sâmi Paşa, "Diyarbakırlı Said Paşa", "Terzi Baba", "Lâ edrî". Bu, kitabın yayıncısının çevresindeki kaynak listesine benzer; ama lügatin dili kitabınkinden farklıdır ("namaz/nemâz", "Fakat/Fekat", "yani/ya’nî", "Hazret-i Peygamber", "Allah’ın").
- Köken kodları (A 8 264, T 872, F 553, Fr 97, Y 31, İt 20, L 13, İ 11, E 1, B 1) ve Fransızca/Latince başlıklar (ENDÜLJANS, EROİN, SEZERYAN, ÖTENAZİ, MARKSİZM) genel bir "ansiklopedik dinî lügat" çizgisini gösterir.
- Depoda (DENETIM_RAPORU_*, PREMIUM_PLAN, `tools/`, `eski/`, `sozluk-data.js` başı) kaynağı söyleyen bir yorum ya da not yok; `sozluk-data.js` doğrudan `var sozlukData=[…]` ile başlar.
- Makine üretimi izi zayıf: yazım ve kırık karakterler (lâm-elif terslikleri, "A, hı)", "(altmış sa‘? …)") taranmış/dizilmiş bir basılı metinden aktarmaya işaret eder; tanımların üslubu tutarlı bir elden çıkmıştır.

**Misaller kitaptan değil.** 3 689 misalden yalnız **44’ü (%1,2) kitapta aynen** geçiyor; **985’i (%26,7)** kitapla en az bir 6 kelimelik dizi paylaşıyor (aynı kaynakların başka tercemesi/özeti); **2 660’ı (%72,1) kitapta bulunamadı**. "Seâdet-i Ebediyye" etiketli 37 misalin de hiçbiri kitapta aynen yok (20’si kısmen). Misaller, etiketlerinin gösterdiği eserlerden (çoğu bugünkü Türkçeye uyarlanmış) alınmış.

**Lügatin kitapla ilişkisi:** 9 863 başlığın yalnız ~4 166’sı (eksiz biçimiyle) kitap metninde geçiyor; okuyucuda en az bir kez işaretlenen terim 2 948 (%30). Çok kelimeli 3 063 başlık eşleme kuralı gereği hiç işaretlenmiyor (bunların 710’u kitapta geçer).

## 2. Lügat kayıtlarının niteliği

**Genel:** Okunan 400 + 164 + 313 kayıtta itikadî çizgi Ehl-i sünnet ve kitabın çizgisiyle uyumlu (vehhâbîlik, selefiyye, Şîa "bid‘at fırkası"; tevessül, istigâse, râbıta, kerâmet, evliyâ olumlu; ALLAH kaydı "Allah adı yerine tanrı kelimesi kullanılamaz" der). "Hz." kısaltması yok; "Tanrı" yalnız yalancı ilâhlar ve başka dinler için. Kitabın kendi tanımlarıyla karşılaştırılan 313 terimin büyük çoğunluğu kitapla örtüşüyor; birçoğu kitabın tanım cümlesini neredeyse aynen taşıyor (Fâsid kan, Müselles, Nebîz, Hîle-i şer’ıyye, Mürâhık…).

**Kitaba aykırı (K):**
- `lugat / 1234 / CÜMÂDE’L-ÂHİRE` "Kamerî senenin beşinci ayı" ve `1235 / CÜMÂDE’L-ÛLÂ` "Kamerî senenin altıncı ayı" — kitapta (1-89, s. 359) ay sırası: "Hilmi=8=Muharrem Bu=2=Safer Dünyâya=4=Rebî’ul-evvel Hiç=5=Rebî’ul-âhır Zahmet=7=Cemâzil-evvel Etme=1=Cemâzil-âhır". Lügatin kendi ARABÎ AYLAR (388) kaydı da doğru sırayı verir. 1235 ayrıca kitabın kullandığı adı "Yanlış olarak Cemâziyelevvel … denirdi" diye yanlışlıyor.
- `lugat / 7439 / Nefs-i Nâtıka` "İnsanı hep kötülük ve aşağılık işler yapmaya sürükleyen nefs. Nefs-i emmâre." — kitap (2-64, s. 754): "İnsanın hakîkati, ya’nî zâtı, kendisi, onun nefsidir. Buna, (Nefs-i nâtıka) denir."
- `lugat / 9864 / ZÜYÛF` "Altın ve gümüş nisbeti yarıdan az olan paralar. Mağşuş paralar." — kitap (3-4, s. 793): "Altını, gümüşü yarıdan fazla olan nukûddan; altını, gümüşü en çok olanına (Ceyyid), dahâ az olanlarına (Züyûf) denir."
- `lugat / 5948 / MEVZÛ HADÎS` "Peygamber efendimize söylemediği hâlde isnâd edilen uydurma söz." — kitap (3-60, s. 1015): "Üsûl-i hadîs âlimleri, bir hadîsin sahîh olması için koydukları şartları taşımıyan bir hadîse (Mevdû’) der ki, (Benim ictihâdıma göre sahîh olmamışdır) demekdir." Kitap "uydurma"nın yalnız lügat mânâsı olduğunu ayrıca söyler (2-5: "Lügatde, mevdû’, bir yere sonradan konulmuş, uydurma demekdir."). Lügatin 5905 MEVDÛ‘ HADÎS kaydı kitaba uygun; 5948 ona da aykırı.
- `lugat / 3420 / HÜDÂ` "Aldatma, oyun, hîle, dalavere, düzen." — okuyucuda kitabın "sünnet-i hüdâ" ifadesine (6 yer) iliştiriliyor; kitap (1-28, s. 52): "… (Sünnet-i hüdâ) veyâ (Müekked sünnet) denir."
- `esleme / * / Muhammed (başka şahıslar) → 6217` — bkz. §4.

**Yanıltıcı / eksik (Y), kitabın tanımıyla:** KADER (kitap 2-49 s. 701 "ezelde bilmesi ve dilemesi ve halk etmesi"; lügat yalnız "ezelden bilmesi"), FELSEFE (kitap 2-4 s. 409 "Tecribeye, hesâba dayanmıyan şahsî düşüncelere (Felsefe) denirdi"; lügat "… Hikmet"), YOBAZ (kitap 2-17 s. 473 "dînini dünyâ çıkarlarına âlet eden …"; lügat "fanatik"), TENZÎHEN MEKRÛH (lügat "kuvvetli, açık bir delil … bulunmayıp"; kitap 1-68 s. 236 "Yasak olmasına bir delîl, sened bulunmayıp"), ZİKR-İ HAFÎ (lügat "sessiz, kalb ile"; kitap 3-27 s. 903 "Dil ile kendi işitecek kadar söylenirse"), TEVÂCÜD, AKRABÂ, FEY, TİMSÂL; kesin değil: İCMÂ‘, SELEF-İ SÂLİHÎN, GÜNÂH. Ayrıca İLÂHÎ (3826) Allahü teâlâya yakarışı "Tanrım!" diye karşılıyor (lügatin kendi ALLAH kaydına aykırı). ÂCİL (34/35) iki kaydında mânâlar Arap harfli yazımlara çapraz bağlanmış görünüyor (kitapla karşılaştırılamadı; kesin değil).

**Hürmet ifadeleri:** 53 kayıtta "Hazret-i Peygamber", 8 kayıtta "Hazret-i Muhammed" salavâtsız (ör. 1532 DÜLDÜL "Hazret-i Muhammed’in Hazret-i Ali’ye verdiği kır katır"); 282 kayıtta yalın "Allah’ın/Allah’a". Kitabın dilinde böyle kullanım yok. Itikada aykırı bir ifade bulunmadı; dil farkıdır.

**Biçim (B):** mânâsı yalnız "(Bkz. …)" ya da "." olan kayıtlar (MÜSÂFİR 6929 — okuyucuda 108 işarete boş not; TAHİYYÂT 8895; FETEVÂ 2214), kırık başlangıçlar (DEHÂLET "A, hı)", MÜSTESNÂ VAKIF "."), kelime alanında Arap harfi (BEDESTÂN), çift numara (CEVHER), soru işaretli not (VESK).

## 3. Arap harfli yazımlar

- Betikle (9 863): boş 39; Latin harf 0; rakam 0; sunum biçimi 0; **ters lafza (هللا) 0**; "Allah" geçen bütün başlıklarda الله doğru (79 kayıt). Mübârek isimler (الله جلّ جلاله, محمد, رسول الله, مصطفى, عليه السلام, عيسى, ابراهيم, موسى, آدم, جبرائيل) doğru.
- **Ters dizilmiş:** AZÎMET تميزع, AZL لزع, MENÂT طانم, RİYÂL لاير.
- **Lâm-elif terslikleri (لا → ال, geçmişte düzeltilen هللا hatasının akrabası):** ~45 kayıt bulundu (betik `osm-lamelif.json`; sayı alt sınırdır). Hassas olanlar: CELLE CELÂLUH جل جالله, ALEYHİSSALÂTÜ VE’S-SELÂM عليه الصالة (hem ters hem eksik), Kelâmullah كالم الله, Kelâm-ı İlâhî كالم الهى, İ‘LÂ-YI KELİMETULLAH اعالي كلمة الله, Talâk-ı bi’l-Kinâye طالق, Velâyet/Vilâyet bileşikleri واليت; başta lâm-elif: LÂHUT, LA‘ÎN, LÂL, LALA, Lİ-EB, Lİ-ÜMM; kırık "اآل": BİLAHARE, CEMÂZİ’L-ÂHİR, CÜMÂDE’L-ÂHİRE, DÂRÜ’L-ÂHİRE, REBÎ‘UL-ÂHİR. Aynı kelimelerin tek başına kayıtları (TALÂK طلاق, KELÂM كلام, VELÂYET ولايت, HİLÂF خلاف) doğrudur; bozulma bileşik başlıklarda toplanmış.
- Yalnız tenvin işareti "ً" olan 5 kayıt (FEVREN, GIYÂBEN, KADÂEN, KERHEN, MECCÂNEN); kırık Ahsen-i Takvîm "ى طاكويم-"; sırası ters "Tesbih Çekmek چكمك تسبيح".
- Göz ile okunan 400 kayıtta 9 yanlış yazım (≈%2): HAZR حذل, MÜHÎM مهيم, MÜTEVASSIT متوصط, Vekîl-i Musahhar مصخر, Nikâh-ı Tefviz تفويذ, KÜMÛN ve BÜRÛZ بروض, Lİ-ÜMM ألم, CÜMÂDE’L-ÂHİRE اآلخره, MÜNTEFÎ منتفع. Yinelenen başlıklarda ayrıca HÜCÛM حجوم, HÜDÂ حدا/حدى, İNTİFÂ انتباع, İSTİS‘Â استرشاء (başlıkla mânâ/yazım ayrı kelime), İSTİŞFÂ "Şifâ isteme" استشفاع, İNTİBÂH اتتباح.

## 4. Kelime → terim eşlemesi (okuyucudaki kenar notları)

**Kural:** her terimin tek kelimelik ana başlığı (≥2 harf) ve parantez içi adları küçük harfle anahtar olur; ilk gelen kazanır (önce bütün ana başlıklar, sonra parantez adları). Metindeki her belirteç önce aynen, olmazsa en kısa ekten başlayarak **tek bir ek** atılarak aranır. Bağlama bakılmaz. Sonuç: 117 308 işaret, 9 299 biçim, 2 948 terim; 60 947’si aynen, 56 361’i ek atılarak. Aynı biçim bütün maddelerde aynı terime gider (çakışma 0) — yanlış bir eşleme her geçtiği yerde tekrarlanır. Şapkalar korunduğu için mal/mâl, adet/âdet, alem/âlem, hakîm/hâkim, kar/kâr ayrılıyor; "bir, her, an, ân, id, kadar, kat, nar, hal" hiçbir terime bağlanmıyor.

**Kuralın iki yapısal kusuru:**
1. **Parantez adı gölgelenmesi (116 ad):** aynı biçim başka bir terimin ana başlığıysa parantez adı hiç kullanılmaz. En ağırı: kitapta 1 822 kez "zaman" mânâsında geçen **zemân → 9764 ZEMÂN "Kefil olma, zâmin olma…"** (doğrusu 9715 ZAMAN (Zemân) "Vakit, devir…"); **hakk-ı/hakkında → 2707 HAKK "Toprak."** (332; doğrusu 2686 HAK (Hakk)); müsâfir → 6929 (yalnız "Bkz. Misâfir"; 108); tesavvuf, hac, şerâb, iddet, sekr, gîbet… (bunlarda iki kayıt aynı mânâda, zararsız).
2. **Yinelenen başlıklarda ilk kayıt kazanır:** **mest → 5822 "Sarhoş, kendinden geçmiş"** (76; abdestteki mest; doğrusu 5823), **dem → 1419 "Kan; hacda kurban"** (şiirlerde "zaman"; doğrusu 1420), **hüdâ → 3420 "Aldatma, hîle"** (sünnet-i hüdâ; doğrusu 3421).

**600 işaretlik rastgele örneklem (tohum 20261117), her biri cümlesiyle okundu:**

| Hüküm | Sayı | Oran |
|---|---|---|
| Doğru (açıklama o cümledeki mânâ) | 525 | %87,5 |
| Çok anlamlı: doğru mânâ listede var ama ilk değil (din "1.Karşılık, ceza", sâhib "1.Sohbet eden", Hak = Allah) | 20 | %3,3 |
| **Yanlış** | **54** | **%9,0** (95% güven aralığı ≈ %6,8–11,3) |
| Boş yönlendirme | 1 | %0,2 |

Bütün işaretlere yayılırsa **≈10 500 yanlış kenar notu** (≈8 000–13 300). Bunların ~5 800’ü bu denetimde tek tek sayılan biçim gruplarıdır (`lugat.json` "esleme / * / …"):

| Biçim (kitaptaki mânâ) | → iliştirilen | işaret |
|---|---|---|
| zemân… (zaman) | ZEMÂN "Kefil olma" | 1 822 |
| kadın… | KADI "hüküm veren hâkim" | 369 |
| Muhammed (İmâm-ı Muhammed, Muhammed Ma’sûm, Muhammed bin Abdülvehhâb, Muhammed Abdüh…) | MUHAMMED aleyhisselâm "son peygamber" | ~360 |
| fazla | FAZL "Lütuf, ihsân" | 335 |
| cild (kitap cildi) | CİLD "Deri." | ~316 / 334 |
| hakkı, hakkında | HAKK "Toprak." | 332 |
| geri | GER "Eğer (şiirde)" | 284 |
| madde (kitabın maddesi) | MADDE "ağırlığı olan varlık" | ~%60–70 / 602 (kesin değil) |
| altında/altına/altından (yer) | ALTIN (maden) | ~200 / 226 |
| dil (lisan, uzuv) | DİL "Gönül" | ~205 |
| yedi | YED "El" | 142 |
| ayın… (ay) | AYIN "21. harf" | 125 |
| bekr (Ebû Bekr) | BİKR "Evlenmemiş erkek veya kız" | 94 |
| mest (abdest) | MEST "Sarhoş" | 76 |
| sebze, ziyâde, fâtiha, deve, hâle, ağırlık, zor, eyle, sıra, ayna, hanîfe, karn, çâre, kese/kesin, harekete, râzî, neye, araba, talebe, dem, ah … | SEBZ "Yeşil", ZİYÂ "Işık", FÂTİH, SÂİBE, HÂLE "Teyze", AĞIRLIK "mehr", ZOR "Yalan", EYLE "Kızıldeniz kıyısında yer", SIR, AYN, HANÎF, KARN "Boynuz", ÇÂR "Dört", KES "Kimse", HAREKE, RÂZI, NEY, ARAB, TALEB, DEM "Kan", AH "Erkek kardeş" | 13–74 arası, toplam ~1 000 |

**Yanlışların kalıpları (54 örnek; 32’si ek atılarak, 22’si aynen eşleşmiş):**
- Eş yazım — Türkçe ya da başka bir kelime, ek atılarak veya aynen, bambaşka bir terime düşüyor: **18** (fazla ×3, kadın ×4, geri ×2, deve ×2, sebze, ziyâde, altında, artık, "üçer beşer", "aşmak" → "Hayvanın çiftleşmesi", "Arş’ın" → arşın ölçüsü).
- Kitapta başka mânâda kullanılan kelime, lügatte o mânâ yok: **18** (cild ×4, madde ×4, dil ×4, hat "uzunluk ölçüsü", posta pulu, banka çeki, atom çekirdeği, saf su, vücûd [beden]).
- Doğru kayıt varken gölgelenme / ilk kayıt yüzünden yanlış kayıt: **9** (zemân ×8, hakkı).
- **Özel isim–cins isim karışması: 9** (Selîm, Sâlih [peygamber adı → "iyi"], Râzî, İmâm-ı Muhammed ×2 → Peygamber efendimizin açıklaması, Ebû Bekr → "bâkire", Hayri, Abdül’azîz bin İbrâhîm → İbrâhîm aleyhisselâm, Seyyid Kutb).

**Mübârek isimler ve hassas kelimeler:** "Allahü" 2 461, "Resûlullah" 653, "Kur’ân-ı kerîm" doğru bağlanıyor. Ancak **"Muhammed" adının salavâtsız geçtiği 425 işaretin ~%85’i başka şahıstır** ve hepsine "Allahü teâlânın insanlara gönderdiği son peygamber" açıklaması çıkar — "Muhammed bin Abdülvehhâb", "Mısrlı Muhammed Abdüh" dahil (K). Benzeri İbrâhîm (İbrâhîm Hakkı), Mûsâ (Mûsâ Kâzım), Süleymân (Sultân Süleymân, Süleymân bin Eş’as), Yahyâ (Yahyâ bin Mu’âz), Eyyûb (Eyyûb Sabri pâşa), Hârûn (Hârûn Reşîd) peygamber kayıtlarında. Ebû Bekr "radıyallahü anh"a "Evlenmemiş erkek veya kız. 2.Bekârlık; bâkirlik", Ebû Hanîfe’ye HANÎF, "sünnet-i hüdâ"ya "Aldatma, hîle", abdestteki meste "Sarhoş" çıkması bu bölümün en ciddi örnekleridir.

## 5. "Bkz." ve yinelenenler

- **Bkz.:** 219 kayıtta 232 hedef. VERI.md’deki kural (büyük/küçük harf ve şapka yok sayılır) ile 100’ü bulunmuyor; boşluk, tire ve kesme de yok sayılınca 226’sı bulunuyor. Anlam örtüşmesi düşük 40’ı okundu: çoğu doğru (ör. GÜNÂH→Harâm, GÂZÎ→Mücâhid). Yanlış hedef: RÛHLAR ÂLEMİ → "Âlem" şapkasız arandığında 283 ALEM (nişan, bayrak); Sahîh Hadîs → "Hadîs" → 2605 HÂDİS (hudûs eden); ÂKİL → "Âkıl" → 215 AKIL. Zincir: Kasr-ı Salât ve YOLCU → MÜSÂFİR (yalnız "Bkz. Misâfir"), TEŞEHHÜD → TAHİYYÂT (yalnız "Bkz. Tehiyyât"). Bkz. bağları kelimeyle değil kimlikle kurulmalı.
- **55 yinelenen başlık (111 kayıt):** çoğu farklı kelimelerdir (ARZ ارض/عرض, AZM عزم/عظم, HALK خلق/حلق, NÂSİH ناصح/ناسخ…) — birbiriyle çelişmiyorlar. Sorunlu olanlar: MEST, DEM, HÜDÂ (okuyucuda yanlış olan ilk kayıt seçiliyor), ÂCİL (mânâlar çapraz görünüyor; kesin değil), İNTİBÂH (tek mânâ "1.Pişme." / "2.Uyarılma" diye iki kayda bölünmüş, yazım bozuk), İSTİS‘Â, İSTİŞFÂ (başlık–yazım–mânâ uyumsuz), Şehâdet Kelimesi ve BEHÂİYYE (birer kaydı yalnız Bkz.).

## 6. Kanaat

**(i) Lügat sayfası — düzeltilerek kullanılabilir.** Kayıtların büyük çoğunluğu düzgün ve kitabın çizgisinde; ama kitaptan derlenmemiştir ve sitede öyle sunuluyor (Fevâid: "Kitapta geçen kelimelerin…", "Se’âdet-i Ebediyye’nin içinden derlenen dizinler: … dinî lügat"; Hakkında: "bağlama göre değişen manaları kayıtlıdır"). Yayından önce: 7 K bulgusu düzeltilmeli/kaldırılmalı (Cümâde ayları, Nefs-i nâtıka, Züyûf, Mevzû hadîs, HÜDÂ 3420); ~60 bozuk Arap harfli yazım (özellikle CELLE CELÂLUH, ALEYHİSSALÂTÜ VE’S-SELÂM, Kelâmullah, ters dizilmiş 4 kayıt) düzeltilmeli ya da gizlenmeli; mânâsı yalnız "Bkz." ya da "." olan kayıtlar hedefiyle birleştirilmeli; Bkz. bağları kimlikle kurulmalı.

**(ii) Okuyucudaki otomatik kenar notları — olduğu gibi kalmamalı.** Örneklemde %9 yanlış (≈10 500 not), ve yanlışların bir kısmı hürmet ve itikad bakımından ağır (başka Muhammed’lere Peygamber açıklaması, Ebû Bekr’e "bâkire", sünnet-i hüdâya "hîle"). Ölçülen kural değişiklikleri (`kural-olc.py`; örneklem: Y 54, D 525):

| Değişiklik | Örneklemde giden yanlış | giden doğru | Bütün işaretlerden kalkan |
|---|---|---|---|
| Yalnız aynen eşleşme (ek atma yok) | 32 / 54 | 250 / 525 | 56 361 (%48) |
| Anahtar en az 4 harf | 9 | 51 | 12 309 |
| Anahtar en az 5 harf | 30 | 175 | 39 320 |
| Kara liste (bu denetimde bulunan ~45 biçim grubu) | 43 | 1 | 6 160 |
| Özel isim kuralı (önünde imâm-ı/bin/Ebû/İbni/Sultân…, ya da cümle ortasında büyük harf) | 8 | 13 | 5 111 |
| Kara liste + özel isim + yalnız-Bkz. kayıtları göstermeme | **50** | **14** (+2 çok anlamlı) | 11 041 (%9,4) |

Son satırla örneklemdeki yanlış oranı **%9,0 → ≈%0,8** (533 işarette 4) iner; doğru notların %2,7’si de gider. Uyarı: kara liste bu örneklemi de gören denetimden çıktığı için örneklemdeki başarısı iyimserdir; bağımsız bir doğrulama örneklemi gerekir. "Yalnız aynen eşleşme" ve "en az 5 harf" kuralları doğruları çok kaybettirdiği için önerilmez. Ayrıca kaldırmak yerine **doğru kayda yönlendirme** (zemân→9715, hakk→2686, mest→5823, dem→1420, hüdâ→3421, müsâfir→6044) ~2 350 yanlışı doğru nota çevirir. Hassas terimlerde (peygamber, sahâbî, mezheb imâmı adları; "Muhammed") yalnız salavâtla/unvanla gelen biçimler bağlanmalı ya da elle onaylanmalı.

**(iii) Kaynak beyanı.** Lügat sayfasında ve kenar notu kutusunda açıkça: bu lügatin Se’âdet-i Ebediyye’nin parçası olmadığı, kaynağının (basılı bir dinî lügat olduğu izlerine rağmen) belirlenemediği, misallerin başka eserlerden alındığı ve okuyucudaki işaretlerin kelimeye makineyle bağlandığı için yanlış olabileceği yazılmalı. Kaynak eserin adı ve baskısı bulunursa `kaynakSahife` o eserin sahîfesi olarak gösterilebilir.

## Denetlenemeyenler

- Lügatin basılı kaynağı bulunamadı; `kaynakSahife` doğrulanamadı.
- 9 863 kaydın ~%9’u tam okundu; kitapta tanımı olmayan terimlerin mânâları kitapla karşılaştırılamadı (kitap ölçütü dışında kalıyor).
- Arap harfli yazımda 200 kaydın harf harf okunması yapılmadı; 400 kayıt göz ile tarandı, geri kalanı betikle.
- "madde", "artık", "çekirdek", peygamber adlarındaki yanlış oranları kaba tahmindir (10’ar bağlam).
- Kural önerilerinin etkisi aynı örneklemde ölçüldü; bağımsız ikinci örneklem yapılmadı.
