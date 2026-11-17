# lugat.json bulgu listesini üretir
from ortak import *
M=json.load(open('metinler.json'))
def sah(a): return M[a]['sahife'][0] if a in M else None
B=[]
def ek(kimlik,sinif,kesin,derleme,kitap,madde,sahife,aciklama,oneri):
    B.append(dict(kimlik=kimlik,sinif=sinif,kesin=kesin,derleme=derleme,kitap=kitap,madde=madde,sahife=sahife,aciklama=aciklama,oneri=oneri))
A=lambda i:T[i]['anlam']
# ---------- K: lügat kayıtları kitaba aykırı
ek('lugat / 1234 / CÜMÂDE’L-ÂHİRE','K',True,A(1234),'Hilmi=8=Muharrem Bu=2=Safer Dünyâya=4=Rebî’ul-evvel Hiç=5=Rebî’ul-âhır Zahmet=7=Cemâzil-evvel Etme=1=Cemâzil-âhır Cemâli=3=Receb','1-89',359,'Kitabın ay sırasında Cemâzil-âhır altıncı aydır; lügat beşinci diyor. Lügatin kendi ARABÎ AYLAR (388) kaydı da "6. Cemâzi’l-âhir" der.','sıra numarasını kaldır; kitaptaki sıra 1-89’da: "Zahmet=7=Cemâzil-evvel Etme=1=Cemâzil-âhır"')
ek('lugat / 1235 / CÜMÂDE’L-ÛLÂ','K',True,A(1235)[:200],'Zahmet=7=Cemâzil-evvel Etme=1=Cemâzil-âhır','1-89',359,'Cemâzil-evvel kitapta beşinci aydır; lügat altıncı diyor. Ayrıca "Yanlış olarak Cemâziyelevvel ve Cemâziyelâhir de denirdi" cümlesi kitabın kullandığı adı (Cemâzil-evvel) yanlış sayıyor.','sıra numarasını ve “Yanlış olarak … denirdi” cümlesini kaldır')
ek('lugat / 7439 / Nefs-i Nâtıka','K',True,A(7439),'İnsanın hakîkati, ya’nî zâtı, kendisi, onun nefsidir. Buna, (Nefs-i nâtıka) denir.','2-64',754,'Kitap nefs-i nâtıkayı insanın hakîkati/zâtı diye tanımlar; lügat onu nefs-i emmâre ile bir tutuyor.','şu ifadeyle değiştir (kitaptan): "İnsanın hakîkati, ya’nî zâtı, kendisi, onun nefsidir. Buna, (Nefs-i nâtıka) denir."')
ek('lugat / 9864 / ZÜYÛF','K',True,A(9864),'Altını, gümüşü yarıdan fazla olan nukûddan; altını, gümüşü en çok olanına (Ceyyid), dahâ az olanlarına (Züyûf) denir.','3-4',793,'Kitaba göre züyûf, altını/gümüşü yarıdan FAZLA olan paraların daha az ayarlı olanlarıdır; lügat "yarıdan az olan paralar, mağşuş" diyor.','şu ifadeyle değiştir (kitaptan): "Altını, gümüşü yarıdan fazla olan nukûddan; … dahâ az olanlarına (Züyûf) denir."')
ek('lugat / 5948 / MEVZÛ HADÎS','K',True,A(5948),'Üsûl-i hadîs âlimleri, bir hadîsin sahîh olması için koydukları şartları taşımıyan bir hadîse (Mevdû’) der ki, (Benim ictihâdıma göre sahîh olmamışdır) demekdir.','3-60',1015,'Kitap "uydurma" mânâsının lügat mânâsı olduğunu, ıstılahta ise bir âlimin sıhhat şartını taşımamak demek olduğunu ayrıca bildirir (2-5: "Lügatde, mevdû’, bir yere sonradan konulmuş, uydurma demekdir."). Lügatin 5905 MEVDÛ‘ HADÎS kaydı kitaba uygun; 5948 ona aykırı.','5948 kaydını kaldır ya da 5905’e yönlendir')
# ---------- Y: kitabın tanımıyla örtüşmeyen / eksik
for i,a,s,kit,acik in [
 (4453,'2-49',701,'(İnsanların kalbleri ile veyâ bedenleri ile yapdıkları her işin ve canlılarda ve cansız şeylerde meydâna gelen her işin, Allahü teâlânın ezelde bilmesi ve dilemesi ve halk etmesi ile olmalarına (Kader) ve (Takdîr) denir.','Lügat kaderi yalnız "ezelden bilmesi" diye veriyor; kitabın tanımındaki "dilemesi ve halk etmesi" düşmüş.'),
 (2161,'2-4',409,'Tecribeye, hesâba dayanmıyan şahsî düşüncelere (Felsefe) denirdi.','Lügat felsefeyi "hakikati akıl ve mantıkla sistemli çözme… Hikmet" diye övücü tanımlıyor; kitap ona tecrübeye dayanmayan şahsî düşünce diyor.'),
 (9681,'2-17',473,'İster Ehl-i sünnet olsun, ister bid’at sâhibi olsun, dînini dünyâ çıkarlarına âlet eden, ya’nî dünyâlığa kavuşmak için dîninden veren câhillere (Yobaz) denir.','Lügat günümüz kullanımıyla "fanatik" diyor; kitabın tanımı başka.'),
 (9179,'1-68',236,'Yasak olmasına bir delîl, sened bulunmayıp, yapılmaması iyi olan şeye (Tenzîhen mekrûh) denir.','Lügat "kuvvetli, açık bir delil" diyerek kitabın "bir delîl, sened bulunmayıp" şartını değiştiriyor.'),
 (9810,'3-27',903,'Kalb ile ve dil ile birlikde zikrdir. Dil ile kendi işitecek kadar söylenirse, islâmiyyetde (Zikr-i hafî) denir.','Lügat zikr-i hafîyi "sessiz, kalb ile" diye veriyor; kitapta dil ile kendi işitecek kadar söylemektir.'),
 (9234,'2-52',721,'İrâdî ve ihtiyârî olarak raks etmeğe, (Tevâcüd) denir.','Kitabın tanımı (irâdî raks) lügatte yok.'),
 (249,'2-38',595,'Analardan, baba ve dedelerden ve çocuklardan, torunlardan başka olan yakınlara, (Akrabâ) denir.','Lügat akrabâya usûl/fürû ve evlilik yakınlığını da katıyor; kitabın tanımı daha dar.'),
 (2240,'2-35',577,'Muhârebe bitdikden sonra kâfirlerden zorla alınan mâla (Fey) denir.','Lügat "veya harb yapılmadan sulh yoluyla" ekliyor; kitabın tanımında yok.'),
 (9280,'2-42',628,'Yalnız cânlı resmlerine, (Timsâl) denir.','Lügat "sembol, rümuz; resim, suret" diyor; kitabın "yalnız cânlı resmi" kaydı yok.'),
]:
    ek(f'lugat / {i} / {T[i]["kelime"]}','Y',True,A(i)[:300],kit,a,s,acik,'şu ifadeyle değiştir (kitaptan) ya da kitabın tanımını ekle')
for i,a,s,kit,acik in [
 (3594,'2-16',437,'Selef-i sâlihînin söz birliğine (İcmâ’-ı ümmet) denir.','Lügat "bir asırdaki müctehidlerin ittifakı" diyor; kitabın bu yerdeki tanımı Selef-i sâlihînle sınırlı. Başka yerde kitap daha geniş tanım verebilir; bütün kitap taranmadı.'),
 (8278,'2-72',768,'Eshâb-ı kirâm ile Tâbi’în-i ızâma (Selef-i sâlihîn) denir.','Lügat Tebe-i tâbiîni de katıyor; kitabın tanımında yok.'),
 (2503,'2-47',681,'Azâbların şiddetlerini, çokluğunu bildiren ölçü birimine, (İsm) ve (Günâh) denir.','Lügatteki tanım kitabınkinden farklı yönden; çelişme değil, eksiklik.'),
]:
    ek(f'lugat / {i} / {T[i]["kelime"]}','Y',False,A(i)[:300],kit,a,s,acik,'kitabın tanımını ekle')
ek('lugat / 3420 / HÜDÂ','K',True,A(3420),'Bunları devâmlı yaparak, nâdiren terk etmiş ve terk edenlere birşey dememiş ise, (Sünnet-i hüdâ) veyâ (Müekked sünnet) denir.','1-28',52,'İki HÜDÂ kaydının ilki "aldatma, hîle" mânâsındadır ve okuyucuda kitabın "sünnet-i hüdâ" ifadesindeki "hüdâ" kelimesine (6 işaret, 1-28 ve 1-71) bu açıklama iliştirilir. İkinci kayıt (3421) doğru mânâyı taşır ama Arap harfli yazımı حدى (doğrusu kitapta yok; bkz. B bulgusu).','eşlemede "hüdâ" → 3421; 3420’nin yazımını/yerini gözden geçir')
ek('lugat / 34 / ÂCİL','Y',False,'34 آجل: '+A(34)+' | 35 عاجل: '+A(35),None,None,None,'Aynı başlıklı iki kayıtta mânâlar Arap harfli yazımlarla çapraz görünüyor (lügatin kendi Mehr-i mu‘accel = peşin, Mehr-i müeccel = vâdeli kayıtlarına göre). Kitapta "âcil" başlığı tanımlanmıyor; kitapla karşılaştırılamadı.','iki kaydın mânâlarını yer değiştir (gözden geçirilerek)')
ek('lugat / 3826 / İLÂHÎ','Y',True,A(3826),None,None,None,'Lügatin kendi ALLAH (317) kaydı "Allah adı yerine tanrı kelimesi kullanılamaz" derken burada Allahü teâlâya yakarış "Tanrım!" diye karşılanıyor.','“Tanrım!” ifadesini kaldır')
ek('lugat / * / Hazret-i Peygamber (salavâtsız)','Y',True,'53 kayıtta "Hazret-i Peygamber", 8 kayıtta "Hazret-i Muhammed" salavâtsız geçiyor (ör. 1532 DÜLDÜL: "Hazret-i Muhammed’in Hazret-i Ali’ye verdiği kır katır"); 282 kayıtta yalın "Allah’ın/Allah’a".',None,None,None,'Kitap her yerde "Resûlullah sallallahü aleyhi ve sellem", "Muhammed aleyhisselâm", "Allahü teâlâ" der; lügat dili bu hürmet ifadelerini tutarlı kullanmıyor. Hz. kısaltması ve "Tanrı" (yalancı ilâhlar dışında) yok.','hürmet ifadelerini tamamla')
# ---------- Y: site açıklamaları
ek('lugat / * / Fevâid ve Hakkında açıklaması','Y',True,'fevaid.js: "Kitapta geçen kelimelerin Osmanlıca yazılışları, asılları ve mânâları." · "Se’âdet-i Ebediyye’nin içinden derlenen dizinler: … dinî lügat" · hakkinda.js: "bağlama göre değişen manaları kayıtlıdır."',None,None,None,'Lügat kitaptan derlenmemiştir: 9 863 başlığın yalnız ~4 166’sı kitap metninde (eksiz) geçiyor; misallerin %1,2’si kitapta aynen var; kitapta lügat bölümü yok. Okuyucudaki eşleme bağlama bakmaz.','açıklamayı kaynağı belirsiz, kitaptan ayrı bir lügat olduğunu söyleyecek biçimde değiştir')
# ---------- B: Arap harfli yazım
osmB=[(607,'ters dizilmiş (عزيمت)'),(610,'ters dizilmiş (عزل)'),(5685,'ters dizilmiş (مناط)'),(7896,'ters dizilmiş (ريال)'),(5083,'lâm-elif ters'),(5085,'lâm-elif ters'),(5073,'lâm-elif ters (لاهوت)'),(5074,'lâm-elif ters'),(5078,'lâm-elif ters (لعين)'),(5146,'lâm-elif ters'),(5147,'lâm-elif ters'),(5157,'lâm-elif ters'),
 (1068,'hürmet ifadesi: جل جالله (lâm-elif ters; ALLAH kaydında doğru: جلّ جلاله)'),(307,'hürmet ifadesi: "عليه الصالة" hem lâm-elif ters hem eksik (ve’s-selâm yok)'),(4751,'Kelâmullah: كالم الله (lâm-elif ters)'),(4746,'Kelâm-ı İlâhî: كالم الهى'),(3830,'اعالي كلمة الله (lâm-elif ters)'),(8949,'طالق (lâm-elif ters; TALÂK kaydında doğru)'),(9555,'واليت'),(9556,'واليت'),(9592,'واليت'),(3222,'خالف'),(4768,'كالله'),(5038,'كاله'),(2159,'فالح'),(2061,'فالنجه'),(270,'آالفرانغه'),(277,'آالتوركه'),(278,'آالى'),(325,'آالت'),(1067,'جالله'),(1307,'بالدالله'),(1764,'امالك'),(4567,'بالوالء'),(5922,'موالء'),(6037,'ميرآالى'),(8530,'آاليى'),(806,'بالاستغالل'),(849,'القالع بالقالع'),
 (897,'اآل kırık'),(1088,'اآل kırık'),(1234,'اآل kırık'),(1343,'اآل kırık'),(7788,'اآل kırık'),
 (2236,'yalnız tenvin "ً"'),(2456,'yalnız tenvin "ً"'),(4441,'yalnız tenvin "ً"'),(4798,'yalnız tenvin "ً"'),(5495,'yalnız tenvin "ً"'),
 (171,'kırık: "ى طاكويم-"'),(581,'ilk harf düşmüş (عيب → قيب)'),(9208,'kelime sırası ters'),(3077,'حذل (HAZR ile uyuşmuyor)'),(6699,'مهيم'),(7204,'متوصط'),(9546,'مصخر'),(7549,'تفويذ'),(5043,'بروض'),(3317,'حجوم'),(3420,'حدا'),(3421,'حدى'),(4038,'اتتباح; mânâ "1.Pişme." ikinci kayıtta "2.Uyarılma" diye bölünmüş'),(4041,'انتباع (İNTİFÂ)'),(4271,'استرشاء: başlık İSTİS‘Â, yazım ve mânâ istirşâ'),(4274,'استسحاب'),(4283,'استشفاع: mânâ "Şifâ isteme"'),(6863,'منتفع: mânâda iki ayrı kelime karışmış'),(1235,'جماد الاولى doğru; 1234 kırık')]
for i,a in osmB:
    ek(f'lugat / {i} / {T[i]["kelime"]}','B',i not in (6863,3077,4271,1235),'osmanlica: '+(T[i].get('osmanlica') or '∅'),None,None,None,'Arap harfli yazım: '+a+'.','yazımı düzelt (kaynak lügatin basılısından) ya da gösterme')
ek('lugat / * / osmanlica boş (39)','B',True,'39 kayıtta osmanlica boş (ör. 265, 606, 749, 1556 EBED, 2703).',None,None,None,'Boş alan.','gösterme')
# ---------- B: anlam/biçim
for i,a in [(1400,'mânâ "A, hı)" ile başlıyor'),(733,'kelime alanında Arap harfi: "BEDESTÂN ( بدستانBedesten)"; mânâ ": (F)" ile başlıyor, köken A'),(1136,'numara "2." iki kez'),(3008,'parantez dengesiz "Bkz. …)"'),(9574,'"(altmış sa‘? ikiyüzelli litre)" soru işaretli not'),(7056,'mânâ "." ile başlıyor'),(2214,'mânâ yalnız "."'),(6929,'mânâ yalnız "(Bkz. Misâfir)"; okuyucuda 108 işarete boş açıklama çıkar; doğru kayıt 6044 MİSÂFİR (Müsâfir) parantez adı gölgelendiği için hiç kullanılmıyor'),(8895,'mânâ yalnız "(Bkz. Tehiyyât)"; TEŞEHHÜD’den gelen Bkz. burada ikinci bir Bkz.’ye düşer'),(8705,'yinelenen "Şehâdet Kelimesi" kaydının biri yalnız Bkz., osmanlica yok'),(745,'yinelenen BEHÂİYYE kaydının biri yalnız Bkz.')]:
    ek(f'lugat / {i} / {T[i]["kelime"]}','B',True,A(i)[:200],None,None,None,a+'.','biçimi düzelt')
for i,h,j,a in [(7920,'Âlem',283,'büyük/küçük harf ve şapka yok sayılınca "Âlem" ilk olarak 283 ALEM (nişan, bayrak) kaydına düşer; doğrusu 284 ÂLEM'),(8049,'Hadîs',2605,'"Hadîs" şapkasız aranınca 2605 HÂDİS (hudûs eden) kaydına düşer; doğrusu 2606 HADÎS'),(230,'Âkıl',215,'"Âkıl" şapkasız aranınca 215 AKIL’a düşer; ayrıca 230 ÂKİL’in kendi mânâsı "idrâk kuvveti" (akıl) yazılmış')]:
    ek(f'lugat / {i} / {T[i]["kelime"]} (Bkz. {h})','B',True,'bakiniz: '+T[i]['bakiniz'],None,None,None,a+'.','Bkz. hedefini kimlikle (id) bağla')
# ---------- Eşleme: grup bulguları
GR=[(9764,'zemân, zemâna, zemânda…',1822,'Kitapta "zemân" daima vakit/zaman mânâsındadır (taranan 12 bağlamın 12’si). Lügatte doğru kayıt 9715 ZAMAN (Zemân) "Vakit, devir…" vardır; fakat eşleme ana başlığı parantez adından önce aldığı için 9764 ZEMÂN "Kefil olma" gelir.','1-60','Ezânî zemâna göre şer’î zuhr vaktleri de, bütün mu’t…','eşlemede zemân → 9715'),
 (2707,'hakkı, hakkında, hakkın…',332,'Kitapta hak/hakk = hak, Hak teâlâ; lügat 2707 HAKK "Toprak." Doğru kayıt 2686 HAK (Hakk) parantez adı gölgelendiği için kullanılmıyor.','1-78','(Beyt-ül-mâldan hakkı olan fakîrler…','eşlemede hakk → 2686'),
 (4459,'kadın, kadına, kadının…',369,'"kadın" ekten "kadı + n" diye bölünüp KADI (hâkim) açıklaması iliştiriliyor.','3-56','Teyemmüm yapan erkek, yabancı kadının kollarına bakamaz.','kadın* biçimlerini dışla'),
 (2125,'fazla',335,'"fazla" ekten "fazl + a" diye bölünüyor; açıklama "Lütuf, ihsân".','3-6','bunların mikdârı yarıdan fazla ise','dışla'),
 (2447,'geri',284,'"geri" → GER "Eğer (şiirde)".','3-12','bir kısmını alıp, geri kalanı, başka vakte bırakması','dışla'),
 (1175,'cild, cildin, cildinde…',334,'Kitapta "cild" ~316 yerde kitap cildi (birinci cild, cild 5…), ~18 yerde deri; lügatte yalnız "Deri." var.','1-68','(Hadîka) ikinci cild, altıyüzotuzüçüncü sahîfede diyor ki','kitap cildi bağlamlarını dışla (sıra sayısı ardından)'),
 (5202,'madde, maddeye, maddede…',602,'Kitapta "madde" çoğunlukla kitabın maddesi (… maddeye bakınız!); lügat "ağırlığı olan… varlık". Örneklemde 4/4, bağlam taramasında 10’da ~7 yanlış (kesin oran ölçülmedi).','1-98','Üçüncü kısm, 59. cu maddeye bakınız!','dışla ya da bağlam kuralı'),
 (326,'altında, altına, altından, altındaki',226,'Yer bildiren "altında/altına" (≈10’da 9) ALTIN (maden) diye açıklanıyor.','2-72','bu zulmetlerin te’sîri altında kaldığını','bu biçimleri dışla'),
 (1479,'dil, dili, dile…',205,'Kitapta dil = lisan/uzuv; lügat 1479 DİL "Gönül, yürek, kalb" (Farsça). Taranan 10 bağlamın 10’u yanlış.','2-24','Mu’âviyeye “radıyallahü anh” dil uzatmak câiz değildir.','dışla ya da LİSÂN’a bağla'),
 (579,'ayın, ayının, ayında',125,'"ay" (ay/şehr) ekli biçimleri AYIN "Arap alfabesinin 21. harfi" kaydına bağlanıyor.',None,None,'dışla'),
 (587,'ayna',53,'"ayna" (mirât) AYN "Göz, pınar…" diye açıklanıyor.',None,None,'dışla'),
 (9638,'yedi',142,'"yedi" (7 sayısı ya da yemek fiili) YED "El" kaydına bağlanıyor.',None,None,'dışla'),
 (896,'bekr, bekrin…',94,'"Ebû Bekr" adı BİKR (Bekr) "Evlenmemiş erkek veya kız…" diye açıklanıyor (sahâbî adına alâkasız cins isim).','2-23','Ebû Bekr “radıyallahü anh”, sonra minbere çıkıp','dışla'),
 (9827,'ziyâde',59,'"ziyâde" → ZİYÂ "Işık".','1-60','dahâ ziyâde olan zemânlarda','dışla'),
 (8211,'sebze',74,'"sebze" → SEBZ "Yeşil".','2-46','nişastalı sebze püreleri','dışla'),
 (2118,'fâtiha',61,'Fâtiha sûresi → FÂTİH "Fetheden; açan".',None,None,'dışla'),
 (8065,'deve, devenin…',67,'"deve" SÂİBE kaydının parantez adı olduğu için bütün develere "câhiliyede salıverilen adak devesi" açıklaması iliştiriliyor.','1-78','iki aded dört yaşında deve verilir','dışla'),
 (2746,'hâle',65,'"hâle" (hâl + e) HÂLE "Teyze" diye açıklanıyor (10’da 10).',None,None,'dışla'),
 (8418,'sıra',44,'"sıra" → SIR "Gizli…".',None,None,'dışla'),
 (9832,'zor, zordur',55,'Türkçe "zor" → ZOR (Zûr) "Yalan" (10’da 10).','3-24','Gasb, bir kimsenin malını zor ile almak','dışla'),
 (5822,'mest, mestin, mestler…',76,'Abdestteki mest (ayakkabı) 5822 MEST "Sarhoş" diye açıklanıyor; doğru kayıt 5823 MEST "Ayakkabı…" ikinci olduğu için hiç kullanılmıyor (10’da 10).','1-53','Mest, büyük olup da, parmaklar, mestin ucuna kadar gitmez','eşlemede mest → 5823'),
 (1993,'eyle',45,'Duâlardaki "nasîb eyle" → EYLE "Kızıldeniz kıyısında bir yer" (10’da 10).','1-71','İşlerimizin iyi olmasını nasîb eyle!','dışla'),
 (2838,'hanîfe',41,'"Ebû Hanîfe" → HANÎF.',None,None,'dışla'),
 (1258,'çâre',31,'"çâre" → ÇÂR "Dört".',None,None,'dışla'),
 (4806,'kesin, kese, kes',30,'Türkçe "kesin/kese" → KES "Kimse".',None,None,'dışla'),
 (2875,'harekete',29,'"hareket + e" → HAREKE (Arap harfi harekesi).',None,None,'dışla'),
 (4595,'karna, karnı, karnından',33,'"karın" → KARN "Boynuz; asır".',None,None,'dışla'),
 (8960,'talebe',13,'"talebe" (öğrenci) → TALEB "İstemek".',None,None,'dışla'),
 (7501,'neye, neyi, neyin',17,'"ne + ye" → NEY (çalgı).',None,None,'dışla'),
 (95,'ağırlık…',57,'"ağırlık" (vezin) → AĞIRLIK "Evlenirken mehr… verilen mal" (10’da 10).','1-56','dört gram ve seksen santigram ağırlıkdır','dışla'),
 (442,'artık',82,'Zarf "artık" (≈10’da 4) ARTIK "kabdan içildikten sonra kalan su" diye açıklanıyor.',None,None,'yalnız "artığı/artıkları" biçimlerini bırak'),
 (1419,'dem, demde, deme…',12,'Şiirlerdeki "her dem" (zaman) ve "deme" (söyleme) 1419 DEM "Kan; hacda kurban" kaydına bağlanıyor; doğru kayıt 1420 DEM "Zaman" ikinci olduğu için kullanılmıyor.',None,None,'dem → 1420; "deme"yi dışla'),
 (103,'ah',8,'"Ah, of gibi inlemek" → AH "Erkek kardeş".','1-67','Ah, of gibi inlemek bozar.','ah → 101 ÂH ya da dışla'),
 (7785,'râzî',27,'"Fahreddîn-i Râzî", "İmâm-ı Râzî" adları RÂZI "Rızâ göstermiş" diye açıklanıyor.',None,None,'özel isim kuralı'),
 (382,'araba',14,'"araba" (taşıt) → ARAB kavmi.',None,None,'dışla'),
 (1266,'çekirdek…',61,'Atom çekirdeği bağlamları (2-32) ÇEKİRDEK "sarraflıkta ağırlık ölçüsü" diye açıklanıyor (oran ölçülmedi).',None,None,'gözden geçir'),
]
for i,b,n,acik,ma,kit,on in GR:
    ek(f'esleme / * / {b} → {i}','Y',True,f'{T[i]["kelime"]}: {A(i)[:120]} ({n} işaret)',kit,ma,sah(ma) if ma else None,acik,on)
ek('esleme / * / Muhammed (başka şahıslar) → 6217','K',True,'MUHAMMED (aleyhisselâm): "Allahü teâlânın insanlara gönderdiği son peygamber." (604 işaretin ~425’inde ardında salavât yok)','İmâm-ı Muhammede göre câiz değildir.','1-54',sah('1-54'),'"İmâm-ı Muhammed", "Muhammed Ma’sûm", "Muhammed Pârisâ", "Muhammed bin Abdülvehhâb", "Mısrlı Muhammed Abdüh" gibi başka şahısların adına Peygamber efendimizin açıklaması iliştiriliyor. Salavâtsız 40 örneğin ~34’ü başka şahıs → ~360 işaret.','özel isim kuralı: "imâm-ı/bin/Ebû" ile ya da ardından "bin/Ma’sûm/…" gelen "Muhammed"i işaretleme; yalnız salavâtla gelenleri bağla')
ek('esleme / * / peygamber adları (başka şahıslar)','Y',True,'İBRÂHÎM 53/90, MÛSÂ 21/50, SÜLEYMÂN 27/33, YAHYÂ 14/15, EYYÛB 9/11, HÂRÛN 2/4 işaret ardında salavâtsız','… dahâ önce İbrâhîm Hakkı hazretleri “rahmetullah…',None,None,'Peygamber kayıtları "İbrâhîm Hakkı", "Mûsâ Kâzım", "Sultân Süleymân", "Yahyâ bin Mu’âz", "Eyyûb Sabri pâşa", "Hârûn Reşîd" gibi adlara da iliştiriliyor (salavâtsızların bir kısmı peygamber sayımlarıdır; oran ölçülmedi).','özel isim kuralı')
# ---------- Örneklem Y (tek tek)
for h in json.load(open('orneklem600-hukum.json')):
    if h['hukum']!='Y': continue
    ek(f'esleme / {h["madde"]} / {h["kelime"]} → {h["id"]}','Y',True,f'{h["terim"]}: {A(h["id"])[:110]}',h['baglam'].replace('[','').replace(']',''),h['madde'],None,f'Örneklem no {h["n"]}: {h["not"]}.','eşlemeden çıkar ya da doğru kayda bağla')
json.dump(B,open('../lugat.json','w'),ensure_ascii=False,indent=1)
print(len(B),collections.Counter(b['sinif'] for b in B))
