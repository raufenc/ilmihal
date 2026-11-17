B = []
def b(kimlik, sinif, kesin, derleme, kitap, madde, sahife, aciklama, oneri):
    B.append(dict(kimlik=kimlik, sinif=sinif, kesin=kesin, derleme=derleme, kitap=kitap, madde=madde, sahife=sahife, aciklama=aciklama, oneri=oneri))

# 1 konu_haritasi
b("konu_haritasi / kaynakMetin","D",False,"(Se’âdet-i Ebediyye) kitâbında ikiyüzkırkbir [241] madde vardır. Kitâb üç kısma ayrılmışdır.",None,None,11,
  "Alıntı 241 maddenin hiçbirinin metninde geçmiyor; gösterilen s. 11 madde metinlerinin dışında (önsöz/fihrist) kalıyor, veride yok, bu yüzden denetlenemedi. Sayılar (241 madde, 3 kısım) fihristle tutarlı.",
  "PDF'in 11. sahîfesiyle karşılaştırılarak doğrulanmalı; doğrulanamazsa 'Kitaptan' etiketi kaldırılmalı")
b("konu_haritasi / hac / K2/M18","Y",True,"Hac ve Umre konusu altında: K2/M18 (Kabr ziyâreti lâzımdır. Olgun rûhlardan istifâde edilir)","Kabr ziyâreti lâzımdır. Olgun rûhlardan istifâde edilir","2-18",475,
  "2-18 kabr ziyâretini anlatıyor; metninde hac/umre bahsi yok (yalnız 'İbni Hacer' adı geçiyor). Hac konusuna konması dayanaksız.","Hac ve Umre'den kaldır (Cenaze konusunda zaten var)")
b("konu_haritasi / zekat / K1/M83","Y",True,"Zekât, Kurban ve Adak konusu altında: K1/M83","Yemîn nasıl edilir? Yemînin çeşidleri. Yemîn keffâreti","1-83",334,
  "Yemîn maddesi 'Zekât, Kurban ve Adak' başlığının kapsamına girmiyor; başlık içeriğe uymuyor.","Başlığı genişlet ya da maddeyi uygun konuya taşı")
b("konu_haritasi / iman / K2/M31, K2/M32, K2/M33, K3/M54","Y",False,"İman ve İtikat konusu altında atom/madde/hüceyre maddeleri","Madde, atom üzerinde yeni bilgiler. Radyo-aktivite. Radar | Atom kuvveti ve sulh zemânında kullanılması | Atom bombası yapılması, te’sîri, korunma çâreleri | Madde üzerinde yeni bilgiler. Hüceyre, hayât, mikrop, zehr","2-31",546,
  "Bu maddelerin başlıkları fen bilgisi anlatıyor; 'İman ve İtikat' altında listelenmeleri başlıkla uyuşmuyor (kesin değil: metinlerde yer yer îmâna bağlanan cümleler olabilir).","Ayrı bir 'İslâm ve fen' konusuna al ya da kaldır")
b("konu_haritasi / ahlak / K2/M46","Y",False,"Ahlâk ve Tasavvuf konusu altında: K2/M46","Hasta yemekleri. Ba’zı hastalıkların tedâvîsi","2-46",652,"Tıbbî madde 'Ahlâk ve Tasavvuf' başlığına uymuyor.","Konusunu gözden geçir")

# 2 tovbe_sartlari
b("tovbe_sartlari / kaynakMetin","Y",True,"Peygamberlerin sonuncusu ve en yükseği olan Muhammed ... hergün, yetmiş kerre istigfâr ediyorum).",
  "Yapılan günâhda, kul hakkı bulunmayıp, ... yalnız Allahü teâlâ ile kendi arasında olursa, böyle günâhlara tevbe etmek, pişmân olmakla, istigfâr okumakla, Allahü teâlâdan utanıp, sıkılıp, Ondan afv dilemekle olur. Farzlardan birini özrsüz terk etdi ise, tevbe için, bunlarla birlikde, o farzı da yapmak lâzımdır.","1-43",98,
  "Alıntı kitapta aynen var, ama tevbenin şartlarını değil, Resûlullahın istigfârını anlatıyor; tablonun dayandığı cümle hemen arkasındaki cümledir.","kaynakMetin'i kitaptaki şu cümleyle değiştir (aynen): 'Yapılan günâhda, kul hakkı bulunmayıp ... o farzı da yapmak lâzımdır.'")
b("tovbe_sartlari / adım 3 Günâhı Bırakmak","Y",True,"Günâhı Bırakmak — Yapılan günâhtan vazgeçmek",
  "Tevbenin sahîh olması için dört şart vardır. Bunlar, pişmân olup, günâha devâm etmemek, bir dahâ yapmamağa karâr vermek, afv olması için düâ ve istigfâr etmek, Allah ve kul haklarını ödemekdir.","1-74",283,
  "Bu adım kaynak gösterilen 1-43'te yok; 1-74'te var. Aynı yerde sayılan 'bir dahâ yapmamağa karâr vermek' şartı tabloda hiç yok. Kitap burada 'dört şart' diyor, tablo beş adım veriyor.","1-74'teki dört şartı aynen kullan ya da 'bir dahâ yapmamağa karâr vermek' adımını ekle; atfa 1-74'ü de koy")
b("tovbe_sartlari / adım 4 Kul Hakkı","B",True,"Kul Hakkı Varsa Helâlleşmek — hakkını ödemek veya helâllaşmak",
  "Günâhda kul hakkı da varsa, buna tevbe için, kul hakkını hemen ödemek, onunla halâllaşmak, ona iyilik ve düâ etmek de lâzımdır.","1-43",98,
  "Anlam doğru; ancak kitap 'halâllaşmak' yazıyor (tabloda 'Helâlleşmek/helâllaşmak'), 'ona iyilik ve düâ etmek' eksik.","Kitabın cümlesini aynen kullan")
b("tovbe_sartlari / imlâ","B",True,"İstiğfâr, günâhtan, oruc/oruç","istigfâr ... günâhda","1-43",98,"Kitap 'istigfâr', 'günâhdan' yazar.","Kitabın imlâsına çevir")

# 3 iman_sartlari
b("iman_sartlari / kaynakMadde","B",True,"kaynakMadde 1-24, s. 42","Îmân sâhibi olmak için, altı şart vardır: 1- Allahü teâlâya inanmak, 2- Meleklere inanmak, 3- Kitâblara inanmak, 4- Peygamberlere “aleyhimüsselâm” inanmak, 5Âhırete (öldükden sonra, tekrâr dirilmeğe) inanmak, 6- Kazâ ve kaderin Allahü teâlâdan geldiğine inanmak.","2-49",705,
  "1-24 yalnız birinci şartı anar ('Îmânın altı şartından birincisi...'). Altı şartın sayıldığı yer 2-49'dur (iki kez). Altı satırın adları ve sırası 2-49'la aynı.","Atfı 2-49'a çevir; kaynakMetin'i 2-49'daki cümleyle değiştir")
b("iman_sartlari / 2 Meleklerine îmân","D",True,"nûrdan yaratılmışlardır",None,None,None,
  "Kitabın hiçbir maddesinde meleklerin 'nûrdan yaratıldığı' cümlesi bulunamadı. 1-46'daki melek tarifi: 'Allahü teâlânın kıymetli kullarıdır... Emr olunduklarını yaparlar. İsyân etmezler. Yimeleri, içmeleri yokdur. Evlenmezler...'","Kaldır ya da 1-46'daki tarifle değiştir")
b("iman_sartlari / 3 Kitaplarına îmân","D",False,"Kur'ân-ı kerîm sonuncusudur",None,None,None,"'Son kitâb' ifadesi kitapta bulunamadı (kesin değil: başka sözlerle geçiyor olabilir).","Kaldır ya da kitaptan bir dayanak bul")
b("iman_sartlari / imlâ","B",True,"Kitaplarına, Âhiret, Hazret-i Âdem, cennet","kitâblarına ... Âhıret ... hazret-i Âdem","1-46",None,"Kitap 'kitâb', 'âhıret' yazar.","Kitabın imlâsına çevir")

# 4 islam_sartlari
b("islam_sartlari / 3 Zekât vermek","Y",True,"Zengin olan müslimânın malının kırkda birini fakîrlere vermesi farzdır",
  "İslâmın üçüncü şartı, malın zekâtını vermekdir. Zekât vermek, elbette lâzımdır. Zekâtı seve seve ve islâmiyyetin emr etdiği kimselere vermelidir.","1-46",110,
  "Kaynak maddede 'kırkda bir' yok; kitapta kırkda bir para ve ticâret malı için söylenir (1-78), hayvan ve toprak mahsûlünde başka ölçüler vardır. Her mala genellemek ve 'fakîrlere' demek eksik.","Kitabın cümlesiyle değiştir: 'malın zekâtını vermekdir ... islâmiyyetin emr etdiği kimselere vermelidir'")
b("islam_sartlari / 5 Hacca gitmek","Y",True,"Gücü yeten müslimânın ömründe bir kere Kâbe'yi ziyâret etmesi farzdır",
  "İslâmın beşinci şartı hacdır [ömründe bir kerre, Mekke şehrine gidip, hac vazîfelerini yapmakdır]. Hac vazîfesinin şartları vardır.","1-46",111,
  "Kitap hacı 'Mekke şehrine gidip, hac vazîfelerini yapmak' diye tarif ediyor; 'Kâbe'yi ziyâret' haccı eksik anlatıyor.","Kitabın ifadesiyle değiştir")
b("islam_sartlari / 1 Kelime-i şehâdet","Y",False,"Îmân etmek, islâmın şartının birincisidir",
  "Birincisi, Eşhedü en lâ ilâhe illallah ve eşhedü enne Muhammeden abdühu ve resûlüh, demek ve bunun ma’nâsına inanmakdır","1-46",109,"Kitapta birinci şart kelime-i şehâdeti söylemek ve ma'nâsına inanmak; tablodaki cümle kitapta bu sözle geçmiyor.","Kitabın ifadesiyle değiştir")
b("islam_sartlari / imlâ","B",True,"oruç, Kâbe'yi","oruc","1-46",None,"Kitap 'oruc' yazar (satır 4 açıklamasında 'oruç').","Kitabın imlâsına çevir")

# 5 allahin_sifatlari
b("allahin_sifatlari / kaynakMetin","B",False,"Bu sekiz sıfata, (Sıfât-ı sübûtiyye) ... sıfatları olduğunu bilememişdir.",
  "Bunlar, hayât [diri olmak], ilm [bilmek], sem’ [işitmek], basar [görmek], kudret [gücü yetmek], irâde [istemek], kelâm [söylemek] ve tekvîn [yaratmak]dır.","1-46",103,
  "Alıntı aynen var ama sekiz sıfatı sayan cümleyi dışarıda bırakıp 'Bu sekiz sıfata' diye başlıyor; tablonun asıl dayanağı bir önceki cümle.","kaynakMetin'in başına kitaptaki önceki cümleyi ekle")
b("allahin_sifatlari / imlâ","B",True,"her şeyi, her şeye, dörtte","herşeyi ... Herşeye gücü yeter","2-28",None,"Kitap 'herşey' bitişik yazar.","Kitabın imlâsına çevir")

# 6 peygamber_sifatlari
b("peygamber_sifatlari / Fetânet","B",True,"Fetânet","Dahî hem nebîler hakkında bildim ismetü fitnet,","2-30",545,"Kitap (şiirde) 'fitnet' diyor; 'fetânet' kelimesi kitabın hiçbir yerinde geçmiyor.","'Fitnet' yaz")
b("peygamber_sifatlari / Fetânet açıklaması","D",False,"Akıl ve zekâ bakımından bütün insanlardan üstündürler",
  "Gadrle, zenbü humk ve kezbü ketmü hıyânetden, / münezzehdir, müberrâdır cemî’i Enbiyâullah.","2-30",545,
  "Kitap yalnız şiirde sıfatların adını ve zıdlarından (humk vb.) uzak olduklarını söylüyor; 'bütün insanlardan üstün' açıklaması bulunamadı. Öteki açıklamalar (doğru söz, güvenilir, bildirmek, günâhsız) şiirin ikinci beytindeki zıdlarla (kezb, hıyânet, ketm, zenb) ve 1-46'daki 'ma’sûm [ya’nî günâhsız] ve doğru sözlü' ifadesiyle karşılanıyor.","Açıklamayı kitabın beytine dayandır ya da kaldır")
b("peygamber_sifatlari / Nezâfet açıklaması","Y",True,"Kitapta peygamberlerin sıfatları arasında sayılır (s. 545)",None,"2-30",545,"Açıklama sütununda sıfatın anlamı yerine sitenin kendi notu var.","Öteki satırlar gibi doldur ya da boş bırak")
b("peygamber_sifatlari / Tebliğ, Günah","B",True,"Tebliğ, Günahsızlık, Günah işlemekden","sıdkla teblîgu hükmillah","2-30",545,"Kitap 'teblîg', 'günâh' yazar.","Kitabın imlâsına çevir")
b("peygamber_sifatlari / kaynakMetin","B",True,"Dahî hem nebîler hakkında bildim ismetü fitnet, nezâfet hem emânet, sıdkla teblîgu hükmillah.","Dahî hem nebîler hakkında bildim ismetü fitnet, / nezâfet hem emânet, sıdkla teblîgu hükmillah.","2-30",545,"Şiirin iki mısraı tek satıra birleştirilmiş (mısra ayrımı düşmüş).","Mısra ayrımını koru")

# 7 namaz_rekatlari
b("namaz_rekatlari / imlâ","B",True,"Beş Vakit Namazın Rekat Sayıları; Sabah, Akşam","BEŞ VAKT NEMÂZ ... rek’at","1-51",121,"Başlıkta kitabın imlâsı (vakt, nemâz, rek'at) yok. İçerik sayıları kitapla birebir aynı.","Başlığı 'Beş Vakt Nemâzın Rek'at Sayıları' yap")

# 8 abdest_adimlari
b("abdest_adimlari / 12 Kelime-i Şehâdet","K",True,"Abdest sonunda şehâdet getirilir (sünnet)",
  "Abdestin edeblerinden, (Halebî-yi sagîr)de bildirilenler şunlardır: ... 9 — Her uzvu yıkarken, kelime-i şehâdet okumakdır.","1-52",123,
  "Kitap bunu sünnet değil 'edeb' sayıyor ve 'edeb ... yapılmazsa hiç günâh olmayan şeyler' diye sünnetten ayırıyor; vakti de 'abdest sonunda' değil 'her uzvu yıkarken'.","'Her uzvu yıkarken, kelime-i şehâdet okumakdır' (edeb) yaz")
b("abdest_adimlari / 7 ve 11 sağdan başlayarak","D",True,"Dirseklerle birlikde sağdan başlayarak yıkanır / Topuklarla birlikde sağdan başlayarak yıkanır",None,"1-52",None,
  "1-52'de kolları ve ayakları sağdan başlayarak yıkamak bulunamadı (sağ el yalnız ağız/burun için anılıyor).","'sağdan başlayarak' kısmını kaldır")
b("abdest_adimlari / 10 Boynu Mesh Et","Y",True,"Her iki elin dışıyla boyun mesh edilir (sünnet)",
  "12 — Enseyi, üçer bitişik parmaklarla, bir kerre mesh etmek. ... Sonra, diğer üç parmakların dış yüzleri enseye konup, ensenin ortasından, iki tarafına doğru çekilerek mesh edilir.","1-52",122,
  "Kitap 'ense' diyor ve üç parmağın dış yüzüyle mesh edildiğini anlatıyor; 'boyun' ve 'iki elin dışı' kitabın ifadesi değil.","'Enseyi, üçer bitişik parmaklarla, bir kerre mesh etmek' yaz")
b("abdest_adimlari / 1 Niyet Et","Y",True,"Abdest almağa kalben niyet edilir (sünnet) — ilk adım",
  "15 — Hanefîde, yüzü yıkayacağı zemân, kalb ile niyyet etmek sünnetdir. ... [Şâfi’îde ve mâlikîde niyyet de farzdır.","1-52",122,
  "Kitap niyyetin vaktini 'yüzü yıkayacağı zemân' diye veriyor, tablo en başa koyuyor; Hanefîde sünnet, Şâfi'î ve Mâlikîde farz olduğu belirtilmemiş.","Niyyeti yüz yıkama adımına al; 'Hanefîde' kaydını ekle")
b("abdest_adimlari / mezheb","Y",True,"Başlıkta/adımlarda mezheb belirtilmemiş","Hanefî mezhebinde, abdestin farzı dörtdür","1-52",122,"Farz/sünnet ayrımı Hanefîye göre; kitap Şâfi'î ve Mâlikîde niyyet, tertîb, delk, muvâlâtın farz olduğunu ayrıca söylüyor.","Başlığa ya da açıklamaya 'Hanefî mezhebine göre' ekle")
b("abdest_adimlari / imlâ","B",True,"Niyet, kere, hilâllenir, dörtte","niyyet ... kerre ... tahlîl","1-52",122,"Kitap 'niyyet', 'kerre', 'tahlîl' yazar.","Kitabın imlâsına çevir")

# 9 abdesti_bozanlar
b("abdesti_bozanlar / başlık","Y",True,"Abdesti Bozan Yedi Şey","(Hanefî mezhebinde yedi şey, abdesti bozar:","1-52",125,"Kitap sayıyı Hanefî mezhebine bağlıyor; başlıkta mezheb düşmüş.","Başlığı 'Hanefî mezhebinde abdesti bozan yedi şey' yap")
b("abdesti_bozanlar / 3 deriden çıkan kan","Y",True,"Deriden çıkan kan, cerâhat, sarı su ... bozar",
  "Üçüncüsü, deriden çıkan kan, cerâhat, sarı su, ağrılı çıkan renksiz su, hanefîde bozar. Bunların, mâlikîde ve şâfi’îde abdesti bozmadıkları, fârisî (Menâhic-ül-ibâd) kitâbında yazılıdır.","1-52",126,"Kitabın belirttiği mezheb farkı tabloda yok.","'hanefîde bozar' kaydını ekle")
b("abdesti_bozanlar / 5 bayılmak","Y",False,"Bayılmak, deli olmak, sar'a tutmak","Beşincisi, bayılmak ve deli olmakla ve sar’a tutmakla bozulur. Yürürken sallanacak kadar serhoş olmak da bozar.","1-52",126,"Aynı maddede sayılan serhoşluk eksik.","'Yürürken sallanacak kadar serhoş olmak da bozar' ekle")

# 32 abdest_sunnetleri
b("abdest_sunnetleri / 5","B",True,"Kaşların, sakalın altındaki görünmeyen deriyi ıslatmak","5 — Kaşların, sakalın, bıyığın altındaki görünmiyen deriyi ıslatmak sünnetdir, farz değildir.","1-52",122,"'bıyığın' düşmüş.","Kitabın cümlesini aynen al")
b("abdest_sunnetleri / 9 misvâk","Y",False,"Dişleri birşey ile oğmak, temizlemek (misvâk)","9 — Dişleri, birşey ile oğmak, temizlemek. ... 13 — Ağzı yıkarken, dişleri (Misvâk) ile temizlemekdir.","1-52",122,"Kitap sünnetler listesinde misvâk demiyor; misvâkı edebler arasında (13. edeb) sayıyor. Parantez eki iki ayrı hükmü karıştırıyor.","Parantezi kaldır")
b("abdest_sunnetleri / 15 niyyet","Y",True,"Yüzü yıkayacağı zemân kalb ile niyyet etmek","15 — Hanefîde, yüzü yıkayacağı zemân, kalb ile niyyet etmek sünnetdir.","1-52",122,"'Hanefîde' kaydı düşmüş; kitap aynı yerde Şâfi'î ve Mâlikîde niyyetin farz olduğunu söylüyor. 16 (tertîb: şâfi'îde farz) ve 17-18 (delk, muvâlât: mâlikîde farz) için de mezheb kaydı düşmüş.","Kitaptaki mezheb kayıtlarını ekle")
b("abdest_sunnetleri / kaynakMetin","B",True,"2 — Elleri, bilekleri ile berâber","2 — Elleri, bilekleri ile beraber, üç kerre yıkamak.","1-52",122,"Alıntıda kitapta olmayan şapka eklenmiş ('berâber'); satır sonları birleştirilmiş.","Alıntıyı aynen düzelt")

# 10 gusul_gerektiren
b("gusul_gerektiren / kaynakMetin","Y",True,"Hanefî mezhebinde guslün farzı üçdür: 1 — Ağzın hepsini iyice yıkamak ...",
  "Onbir dürlü gusl abdesti vardır: Beşi farzdır. Bunlardan ikisi, kadının hayz ve nifâsdan kurtulunca gusl abdesti almasıdır.","1-54",135,
  "Alıntı guslün farzlarını (ağız, burun, beden) anlatıyor; tablo ise guslü gerektiren hâlleri sayıyor. Tablonun dayanağı başka cümlelerdir. Beş satırın hepsi kitapta var ('Farz olan guslün üçüncüsü, cünüb ... Cünüb olmak üç dürlüdür: Haşefe ... menî, yerinden şehvetle kopup çıkınca veyâ ihtilâm ile').","kaynakMetin'i 'Onbir dürlü gusl abdesti vardır: Beşi farzdır...' cümlesiyle değiştir")
b("gusul_gerektiren / başlık","Y",False,"Gusül Abdesti Gerektiren Durumlar (yalnız 5 farz)","Onbir dürlü gusl abdesti vardır: Beşi farzdır.","1-54",135,"Kitap onbir dürlü gusl sayıyor (farz, sünnet-i zevâid, vâcib-i kifâye, müstehab); tablo yalnız beş farzı veriyor, başlık bunu söylemiyor. Ayrıca kitap 'Gusül' değil 'Gusl' yazar.","Başlığı 'Farz olan gusller' yap")

# 49 gusul_adimlari
b("gusul_adimlari / kaynakMetin","Y",True,"Necâset ile nemâz kılar. Çünki, harâmdan kaçmak, farzı yapmakdan dahâ çok sevâbdır. ...",
  "Sünnet üzere gusl abdesti almak için, önce, temiz olsalar dahî, iki eli ve avret yerini yıkamalıdır. Sonra bedeninde necâset varsa yıkamalı, sonra, tam bir abdest almalı, yüzünü yıkarken, gusle niyyet etmeli, ayakları altında su toplanmıyorsa, ayakları da yıkamalıdır. Sonra bütün bedene üç def’a su dökmelidir. Önce üç def’a başa, sonra sağ omuza, sonra sol omuza dökmeli, her döküşde, o taraf temâm ıslanmalıdır. Birinci dökmede oğmalıdır.","1-54",133,
  "Alıntı, tenhâ yer bulamıyanın necâsetle nemâz kılmasıyla başlıyor; guslün nasıl alınacağını anlatan paragraf değil.","kaynakMetin'i 'Sünnet üzere gusl abdesti almak için...' paragrafıyla değiştir")
b("gusul_adimlari / 1 Niyet Et","Y",True,"Niyet Et (ilk adım)","sonra, tam bir abdest almalı, yüzünü yıkarken, gusle niyyet etmeli","1-54",133,"Kitap niyyeti abdest içinde yüz yıkanırken söylüyor; tablo en başa koyuyor.","Niyyeti abdest adımına taşı")
b("gusul_adimlari / 2 Elleri Yıka","Y",True,"Elleri bileklere kadar üç kere yıka","önce, temiz olsalar dahî, iki eli ve avret yerini yıkamalıdır.","1-54",133,"Avret yerini yıkamak düşmüş; 'üç kere' bu yerde yok.","Kitabın cümlesini aynen al")
b("gusul_adimlari / 4 Abdest Al","Y",True,"Namaz abdesti gibi tam abdest alınır (ayaklar dâhil)","ayakları altında su toplanmıyorsa, ayakları da yıkamalıdır.","1-54",133,"Kitap ayakları şarta bağlıyor; tablo şartı düşürüp kesin hüküm veriyor.","Şartı ekle")
b("gusul_adimlari / imlâ","B",True,"Gusül, Niyet, Namaz, kere, hayızdan","gusl ... niyyet ... def’a ... hayzdan","1-54",133,"Kitap 'gusl', 'niyyet', 'nemâz', 'hayz' yazar.","Kitabın imlâsına çevir")

# 11 teyemmum_adimlari
b("teyemmum_adimlari / 2 Niyet Et","Y",True,"Niyet Et — FARZ işareti yok (yalnız yüz ve kollar FARZ diye işaretli)","Teyemmümün farzı üçdür: 1— Cenâbetden temizlenmek için veyâ abdestsizlikden temizlenmek için niyyet etmekdir.","1-55",150,"Kitap niyyeti teyemmümün üç farzından biri sayıyor; tablo onu farz diye işaretlemiyor.","'Niyyet (FARZ)' yaz")
b("teyemmum_adimlari / 4 toprağa veya taşa","Y",True,"İki eli temiz toprağa veya taşa vurur","(Menâhic) kitâbında diyorki, (Şâfi’î ve Hanbelî mezheblerinde, teyemmüm yalnız toprakla yapılır. Hanefîde ve Mâlikîde ... temiz toprağa, taşa, toprak veyâ kireç sıvalı dıvara sürüp","1-55",150,"Kitabın belirttiği mezheb farkı düşmüş.","Hanefî/Mâlikî kaydını ekle")
b("teyemmum_adimlari / 7 Kolları Mesh Et","Y",False,"Sol elin içiyle sağ kolun dışını, sağ elin içiyle sol kolun dışını dirseklere kadar mesh eder",
  "önce sol elin dört parmağı içi ile, sağ kolun alt yüzünü, parmak ucundan dirseğe doğru sığayıp sonra, sağ kolun iç yüzünü, sol avuç içi ile, dirsekden avuca kadar sığamakdır.","1-55",150,"Kolun iç yüzünün de sığanması düşmüş.","Kitabın tarifini aynen al")
b("teyemmum_adimlari / imlâ","B",True,"zirâ’, Niyet, kere, tekrar","zrâ’ ... niyyet","1-55",150,"Kitap 'zrâ’', 'niyyet' yazar.","Kitabın imlâsına çevir")

# 33 teyemmum_yedi_hal
b("teyemmum_yedi_hal / 5 düşman","Y",True,"Su yakın ise de yanında düşman, yırtıcı hayvan, ateş veya nöbetçi varsa teyemmüm eder",
  "teyemmüm ederek kılar ise de, bu sebebler kul tarafından oldukları için, gusl ve abdest alınca, bu nemâzları tekrâr kılması lâzımdır.","1-55",149,"Kitabın aynı maddede söylediği 'nemâzları tekrâr kılması lâzımdır' kaydı düşmüş; ayrıca mahbûs olmak ve tehdîd hâlleri eksik.","Kaydı ekle")
b("teyemmum_yedi_hal / 4 soğuk","Y",False,"Gusl abdesti alınca soğukdan ölmek veya hasta olmak tehlikesi varsa teyemmüm eder",
  "4 — Gusl abdesti alınca, soğukdan ölmek veyâ hasta olmak tehlükesi varsa, şehrde dahî olsa, hamâm parası yoksa ve başka çâre bulamazsa, gusl abdesti için teyemmüm eder ve su ile abdest alır.","1-55",149,"'hamâm parası yoksa ve başka çâre bulamazsa' şartı ve 'su ile abdest alır' kaydı düşmüş.","Kitabın cümlesini aynen al")
b("teyemmum_yedi_hal / kaynakMetin","B",True,"girmeden önce sahîh değildir. Abdest ve gusl için ...","Teyemmüm, hanefîde, vakt girmeden önce de sahîhdir. Diğer üç mezhebde, vakt girmeden önce sahîh değildir.","1-55",149,"Alıntı cümle ortasından başlıyor.","Alıntıyı 'Abdest ve gusl için su bulamamak...' cümlesinden başlat")

# 12 necaset_turleri
b("necaset_turleri / galîza 1 hayvan idrarı","K",True,"İnsan ve hayvan idrarı ve dışkısı (kaba necâset)",
  "Eti yinen dört ayaklı hayvanların bevli ve eti yinmiyen kuşların pisliği hafîfdir. Güvercin, serçe ve benzerleri gibi eti yinen kuşların pisliği temizdir.","1-56",154,
  "Kitap her hayvan idrârını kaba saymıyor: eti yinen dört ayaklıların bevli hafîf, eti yinen kuşların pisliği temizdir. Satır, aynı tablonun hafîf sütunuyla da çelişiyor.","'İnsandan çıkınca abdeste veyâ gusle sebeb olan herşey, eti yinmiyen hayvanların ... pisliği ve bevli' diye kitabın ifadesine çevir")
b("necaset_turleri / galîza 6 leş","D",True,"Hayvan leşi (balık ve çekirge hâriç)","ve şerâb, leş, domuz eti","1-56",154,"Kitap burada yalnız 'leş' diyor; 'balık ve çekirge hâriç' istisnası 1-56/1-57'de bulunamadı (1-57 akıcı kanı olmıyan hayvanların ve su hayvanlarının ölüsünün suyu necs etmediğini başka sözlerle söylüyor).","Parantezi kaldır ya da 1-57'deki kitap cümlesiyle değiştir")
b("necaset_turleri / galîza 8 menî","Y",True,"Menî (Şâfiî'de temizdir; Hanefî'de necistir)",
  "Menî, mezy ve idrârdan sonra çıkan vedî ismindeki beyâz, bulanık, koyu sıvı, hanefî ve mâlikîde kaba necâsetdirler. Şâfi’îde yalnız menî, hanbelîde ise, her üçü de temizdir.","1-56",154,"Mezy ve vedî düşmüş; mâlikî ve hanbelî hükmü eksik. Kitap 'necis' değil 'kaba necâset' diyor.","Kitabın cümlesini aynen al")
b("necaset_turleri / galîza 7 domuz","D",False,"Domuz eti ve her parçası","şerâb, leş, domuz eti","1-56",154,"'ve her parçası' 1-56'da yok.","'Domuz eti' yaz")
b("necaset_turleri / kaynakMetin","Y",False,"2 — Hafîf necâset: ...","NECÂSET İKİ DÜRLÜDÜR: 1 — Kaba necâset: İnsandan çıkınca abdeste veyâ gusle sebeb olan herşey,","1-56",154,"Alıntı yalnız hafîf necâseti kapsıyor; tablonun yarısını oluşturan kaba necâset tarifi alıntıda yok.","Alıntıyı 'NECÂSET İKİ DÜRLÜDÜR' cümlesinden başlat")
b("necaset_turleri / imlâ","B",True,"idrarı, Şarap, yenmeyen, necistir, Şâfiî","idrâr ... şerâb ... yinmiyen ... Şâfi’î","1-56",154,"Kitabın imlâsı farklı.","Kitabın imlâsına çevir")

# 50 sularin_hukmu
b("sularin_hukmu / temiz 7 müsta'mel su","K",True,"Müsta'mel su (abdest/guslde kullanılmış su): temizdir — 'Temiz ve Temizleyici Sular' sütununda",
  "Müsta’mel su ve pis su ve çiçek suyu, üzüm suyu gibi, cinsi, sıfatı da söylenen sular mutlak su değildir. Bunlar ile abdest ve gusl alınmaz.","1-57",160,
  "Kitap müsta'mel suyu temizleyici saymıyor; ayrıca '(Mâ-i müsta’mel) ... yıkanan uzvdan ayrılınca necs olur. Ba’zı âlimlere göre, başka uzva, elbiseye, yere düşdükden sonra necs olur' diyor. 'Temiz ve temizleyici' sütununa konması kitaba aykırı.","Bu sütundan çıkar; kitabın iki cümlesini aynen ver")
b("sularin_hukmu / temiz 4 ve pis 2 'iki havuz'","K",True,"durgun su (iki havuz büyüklüğünde ise) / Küçük havuzda (iki havuzdan az) necâset bulaşan su",
  "Eni on zrâ’ [4,8 metre], boyu da on zrâ’ olan kare şeklindeki havuza (büyük havuz) denir ki, sathı [alanı] yüz zrâ’ kare, ya’nî yirmiüç metre karedir.","1-57",161,
  "Kitapta 'iki havuz' diye bir ölçü yok; hanefîde ölçü 'büyük havuz' (on zrâ'ya on zrâ'), şâfi'îde 'kulleteyn'dir. 'İki havuz' büyük olasılıkla 'kulleteyn' (iki kulle) ile karıştırılmış.","'büyük havuz' / 'küçük havuz' yaz; şâfi'î için kulleteyn kaydını kitaptan ekle")
b("sularin_hukmu / temiz 6 tuz","Y",True,"Toprak veya tuz ile bulanıklaşan su (temiz ve temizleyici)","Doymuş tuz eriyikleri ile abdest ve gusl câiz değildir.","1-57",160,"Kitap tuzlu suda abdesti sınırlıyor; toprakla bulanmış su için bu maddede açık hüküm bulunamadı.","Satırı kaldır ya da kitabın cümlesiyle sınırla")
b("sularin_hukmu / temiz 1 dolu","D",False,"Yağmur, kar ve dolu suyu","Yağmur, dere, nehr, kaynak, kuyu, deniz ve kar suları, mutlak sudur.","1-57",160,"Kitap 'dolu' saymıyor.","'dolu'yu çıkar")
b("sularin_hukmu / pis 4 leş","Y",True,"İçine leş düşüp kokan su","Hanefîde, küçük havuza, şâfi’îde ise, kulleteynden az olan suya, az necâset düşerse, üç sıfatı değişmese de, necs olur. ... Uzun zemân durmakla üç sıfatı değişen su, pis olmaz.","1-57",161,
  "Kitap küçük havuz için kokma şartı aramıyor (sıfat değişmese de necs); büyük/akar suda ise eseri görülmeyen taraf temizdir. Akıcı kanı olmıyan hayvan ve su hayvanı ölüsünü de ayırıyor. 'Kokan' şartı hükmü yanlış daraltıyor.","Kitabın cümlelerini aynen al")
b("sularin_hukmu / pis 3 artık","Y",False,"Köpek, domuz ve yırtıcı hayvan artığı su","Domuzun, köpeğin ve yırtıcı hayvânların ve henüz fâre yiyen kedinin artıkları ... kaba necâsetdir. ... Mâlikî mezhebinde domuz ve köpek temizdir.","1-57",162,"Kitabın andığı mâlikî farkı ve fâre yiyen kedi düşmüş.","Kitabın cümlesini aynen al")

# 13 namaz_farzlari
b("namaz_farzlari / kaynakMetin","D",True,"... Beş farz ise, nemâzın içindedir: Kıyâm, kırâat, rükû', secde ve ka'de-i ahîredir.",
  "Nemâzın farzlarından beşi, nemâzın içindedir. Bu beş farzdan her birine (Rükn) de denir.","1-52",122,
  "'Kitaptan' diye verilen alıntının son cümlesi kitapta yok; ilk cümleye bitiştirilmiş bir derleme cümlesi. Rüknlerin adları kitapta 1-64'te ayrı başlıklar hâlinde geçiyor.","Son cümleyi kaldır; kitabın 'Nemâzın farzlarından beşi, nemâzın içindedir' cümlesini koy")
b("namaz_farzlari / 6 Niyyet","K",True,"Hangi namazı kıldığını bilmek",
  "Nemâza niyyet etmek demek, ismini, vaktini, kıbleyi, imâma uymağı irâde etmek, kalbinden geçirip, kılmağı tercîh etmek demekdir. Yalnız ilm, ya’nî ne yapacağını bilmek niyyet olmaz.","1-64",214,
  "Kitap niyyetin 'bilmek' olmadığını açıkça söylüyor; tablo niyyeti tam da 'bilmek' diye tarif ediyor.","'ismini, vaktini, kıbleyi, imâma uymağı irâde etmek, kalbinden geçirip, kılmağı tercîh etmek' yaz")
b("namaz_farzlari / imlâ","B",True,"Hadesten, Necâsetten, Vakit, namaz, rükün, teşehhüd mikdârı","Hadesden tahâret, necâsetden tahâret ... vakt ... (Rükn) ... tehıyyât okuyacak kadar","1-52",122,"Kitabın imlâsı ve ifadesi farklı.","Kitabın imlâsına çevir")

# 31 otuzuc_farz
b("otuzuc_farz / kaynakMetin","B",True,"Îmânın şartı : ALTI (6)İslâmın şartı : BEŞ (5)Nemâzın farzı ...","Îmânın şartı             : ALTI          (6)\nİslâmın şartı            : BEŞ           (5)","1-51",121,"Kitaptaki çizelge satırları alıntıda bitişik yazılmış (satır sonları silinmiş). İçerik satırları kitapla aynı.","Satır sonlarını koru")

# 48 efali_mukellefin
b("efali_mukellefin / kaynakMadde","B",True,"kaynakMadde 1-1 (bütün tanımlar)","Açık olmayıp, zan ederek anlaşılan emrlerine (Vâcib) denir. Farz veyâ vâcib olmayıp, Resûlullahın “sallallahü teâlâ aleyhi ve sellem” kendiliğinden emr etdiği veyâ yapdığı ibâdetlere (Sünnet) denir.","1-28",51,
  "1-1 yalnız sekizin adlarını ve farz, harâm, sünnet, mekrûh, mubâh tarifini veriyor. Tablodaki farz/vâcib/sünnet tarifleri 1-28'den, mekrûh tarifi 1-68'den ('delîlinden zan ile anlaşılan yasaklardır') alınmış.","Atıflara 1-28 ve 1-68'i ekle")
b("efali_mukellefin / Müstehab","K",False,"Resûlullahın bazen yapıp bazen yapmadığı ibâdetler.",
  "Kendisi ara sıra terk etmiş ise, (Sünnet-i gayr-ı müekkede) denir.","1-28",51,
  "Kitap 'ara sıra terk edilen' ibâdete sünnet-i gayr-ı müekkede diyor; müstehabı ise 'Edeb, burada yapılması sevâb olup, yapılmazsa hiç günâh olmayan şeyler demekdir ... Edeblere, mendûb ve müstehab da denir' (1-52) diye tarif ediyor. Tablodaki tarif kitapta sünnetin bir çeşidine aittir.","1-52'deki tarifi aynen al")
b("efali_mukellefin / Müstehab örnek","K",False,"Kuşluk namazı, pazartesi-perşembe orucu","Duhâ vakti olunca, iki rek’at (İşrak nemâzı) kılmak sünnetdir. Bu nemâza (Kuşluk nemâzı) da denir.","1-60",None,
  "Kitap kuşluk nemâzına (bu yerde) sünnet diyor. Pazartesi-perşembe orucu kitapta bulunamadı.","Örnekleri kitaptan seç")
b("efali_mukellefin / Müfsid","D",False,"Başlanmış bir ibâdeti bozan şeyler.",None,None,None,"Kitap 'müfsid' kelimesini kullanıyor ama bir tarifini veren cümle bulunamadı.","Tarifi kitaptan bul ya da kaldır")
b("efali_mukellefin / Mekrûh","Y",False,"Yasak olduğu, açık olmayıp, zan ile anlaşılan işler.",
  "Onun beğenmediği şeylere ve ibâdetin sevâbını gideren şeylere (Mekrûh) denir.","1-1",18,
  "Kaynak madde 1-1'deki mekrûh tarifi farklı; tablodaki tarif 1-68'de yalnız 'tahrîmen mekrûh' için verilmiş, tenzîhen mekrûh ayrıca tarif ediliyor.","1-1'deki tarifi koy ya da tahrîmen/tenzîhen ayrımını ekle")
b("efali_mukellefin / imlâ","B",True,"Helâl diyen, namaz, oruç, emr ettiği, yaptığı","halâl diyen ... nemâz ... emr etdiği veyâ yapdığı","1-46",None,"Kitap 'halâl', 'nemâz', 'etdiği' yazar.","Kitabın imlâsına çevir")

# 14 namaz_sunnetleri
b("namaz_sunnetleri / kaynakMetin","Y",True,"İbâdetler yapılırken, yalnız ağız ile söylemeğe niyyet denmez. ...",
  "Ayakda iken, sağ eli, sol el üzerine koyup, sağ elin küçük ve baş parmaklarını, sol bilek etrâfına halka yapmak, Sübhâneke okumak ve yalnız kılarken, Sübhâneke okudukdan sonra E’ûzü, Besmele okumak sünnetdir.","1-64",214,
  "Alıntı niyyetin ağızla değil kalble olduğunu anlatıyor; sünnetleri sayan bir yer değil.","kaynakMetin'i kitaptaki bu cümleyle değiştir")
b("namaz_sunnetleri / 1, 4, 5, 7, 8","D",False,"Tekbîr alırken elleri kaldırmak; âmîn demek; rükû'da/secdede üç kere tesbîh; son oturuşta salevât (hepsi 'sünnet')",
  "Rükü’da, en az, üç kerre (Sübhâne rabbiyel-azîm) der. ... Secdede en az üç kerre (Sübhâne rabbiyel-a’lâ) denir.","1-64",215,
  "1-64 bu işleri anlatıyor ama 'sünnetdir' hükmünü bu satırlar için açıkça vermiyor; son oturuşta salevât için hüküm bulunamadı (kesin değil: başka maddede geçiyor olabilir).","Hükmü kitapta bulunamayan satırları ya çıkar ya da kitaptaki yerini göster")
b("namaz_sunnetleri / 9 Selâm","Y",True,"Selâmı sağdan ve soldan vermek (sünnet)","nemâz sonunda esselâmü... demek, kunût düâsı okumak, ... vâcibdir.","1-66",227,
  "Kitap nemâzı selâmla bitirmeyi vâcib sayıyor (aynı sitenin vâcibler tablosunda da öyle). İki yana vermenin sünnetliği bulunamadı; satır, okuyucuda selâmın sünnet olduğu izlenimini bırakabilir.","'Selâm vermek vâcibdir' kaydını ekle ya da satırı kaldır")
b("namaz_sunnetleri / 6 semi'allahü","Y",False,"Rükû'dan kalkınca semi'allahü limen hamideh demek","Rükü’dan kalkarken (Semi’allahü limen hamideh) demek, imâma ve yalnız kılana sünnetdir. Cemâ’at bunu söylemez.","1-64",215,"'imâma ve yalnız kılana' kaydı ve 'cemâ’at bunu söylemez' düşmüş.","Kitabın cümlesini aynen al")
b("namaz_sunnetleri / 3 Eûzü-besmele","Y",False,"Eûzü-besmele çekmek","yalnız kılarken, Sübhâneke okudukdan sonra E’ûzü, Besmele okumak sünnetdir.","1-64",215,"'yalnız kılarken' kaydı düşmüş.","Kaydı ekle")

# 15 namaz_vacibleri
b("namaz_vacibleri / 6 Ettehıyyâtü","Y",False,"İlk ve son oturuşta Ettehiyyâtü okumak","ikinci rek’atde teşehhüd mikdârı oturmak, son rek’atde otururken, (Ettehıyyâtü) okumak","1-66",227,"1-66 Ettehıyyâtü okumayı son oturuş için sayıyor; ilk oturuşta okumanın vâcib olduğu bu listede yok (kesin değil: başka yerde geçebilir).","Kitabın ifadesine göre düzelt")
b("namaz_vacibleri / 8 ta'dîl-i erkân","D",False,"Rükünleri ta'dîl-i erkân ile yapmak (Ebû Yûsuf'a göre farz)","rükü’da ve iki secdede ta’dîl-i erkân, [ya’nî sübhânallah diyecek kadar hareketsiz durmak vâcib, dahâ çok durmak sünnetdir], kavmede ve celsede tumânînet","1-66",227,"'Ebû Yûsuf'a göre farz' kaydı 1-66'da yok; kitapta bu görüşü bildiren cümle bulunamadı.","Parantezi kaldır")
b("namaz_vacibleri / 9 ve 11","Y",True,"Secde-i tilâvet ...; Bayram namazlarında zâid tekbîrleri söylemek",None,"1-66",227,"Bunlar 1-66'nın 'nemâzın vâcibleri' sayımında yok: secde-i tilâvet aynı maddede ayrı bir konu, bayram tekbîrlerinin vâcibliği 1-66'da geçmiyor (1-72'de de 'zâid tekbîr vâcib' cümlesi bulunamadı).","Başka maddeden geldiklerini belirt ya da çıkar")
b("namaz_vacibleri / eksikler","Y",True,"(listede yok)","secdeleri birbiri ardınca yapmak, ... kavmede ve celsede tumânînet ..., imâmın, sabâh, Cum’a, bayram, terâvîh, vitr nemâzlarında ve akşam ile yatsının ilk iki rek’atinde yüksek sesle okuması, imâmın ve yalnız kılanın öğle ve ikindi farzlarında ... hafîf sesle okumaları vâcibdir.","1-66",227,"Kitabın saydığı vâciblerden secdelerin ardarda yapılması, kavme/celse tumânîneti, cehrî/hafî okuma tabloda yok.","Eksikleri kitaptan ekle")
b("namaz_vacibleri / kaynakMetin","B",False,"... ta’dîl-i erkân, [ya’nî sübhânallah diyecek kadar hareketsiz durmak","[ya’nî sübhânallah diyecek kadar hareketsiz durmak vâcib, dahâ çok durmak sünnetdir]","1-66",227,"Alıntı açılmış köşeli parantezin ortasında kesilmiş.","Cümle sonuna kadar al")

# 16 namaz_bozanlar
b("namaz_bozanlar / 8 Abdesti bozulması","K",True,"Abdesti bozulması — bozar",
  "Son rek’atde teşehhüd mikdârı oturmadan önce yaparsa, nemâzı hemen bozulur. Teşehhüd mikdârı oturdukdan sonra yaparsa, nemâzı temâm olur. Teşehhüd mikdârı oturmadan evvel, abdesti kendiliğinden bozulursa, hemen gidip tâzeleyip, nemâzına devâm edebilir ise de, başdan kılması efdaldir.","1-67",233,
  "Kitap abdestin bozulmasını şarta bağlıyor (kendisi mi bozdu, kendiliğinden mi bozuldu; teşehhüd mikdârı oturmadan önce mi sonra mı). Şartsız 'bozar' hükmü kitaba aykırı.","Kitabın 22. maddesini aynen al")
b("namaz_bozanlar / 2 selâm","Y",True,"Namazdakine selâm vermek ve selâmı almak","Başkasının selâmına, her sûret ile cevâb söylemek bozar.","1-67",231,"Kitap selâma cevâb vermeyi bozan sayıyor; 'namazdakine selâm vermek' ifadesi kitapta yok ve selâm verenin nemâzı bozulur gibi anlaşılabiliyor.","'Başkasının selâmına, her sûret ile cevâb söylemek bozar' yaz")
b("namaz_bozanlar / 6 öh öh, of of","Y",False,"Dünyâ işi için öh öh, of of demek","4 — Ah, of gibi inlemek bozar. 5 — Uf diye sıkıntıyı bildirmek bozar.","1-67",231,"'Dünyâ işi için' kaydı kitapta bu maddelerde yok.","Kitabın ifadesini al")
b("namaz_bozanlar / eksik","Y",True,"8 madde","Nemâzın müfsidlerinden otuzbir adedini aşağıda bildiriyoruz:","1-67",231,"Kitap otuzbir müfsid sayıyor; tablo sekizini veriyor ve bunu belirtmiyor (boğazdan ses çıkarmak, âmîn demek, Kur'âna bakıp okumak, necs yerde secde, avret açılması, rükn terki, yanlış okumak vb. yok).","Başlığa 'ba’zıları' ekle ya da eksikleri tamamla")
b("namaz_bozanlar / imlâ","B",True,"Namazda, Namazdakine","Nemâzı bozan şeyler","1-67",231,"Kitap 'nemâz' yazar.","Kitabın imlâsına çevir")

# 17 namaz_mekruhlari
b("namaz_mekruhlari / 7 Esnemek","K",False,"Esnerken ağzını açık bırakmak — tenzîhen mekrûh",
  "Nemâzda ve nemâz hâricinde ağzını açarak esnemek mekrûhdur.","1-68",238,
  "Kitap 'mekrûh' diyor ve aynı maddenin başında 'Yalnız mekrûh denildiği zemân (Tahrîmen mekrûh) demekdir' kaidesini koyuyor; tablo 'tenzîhen' yazıyor.","Sınıfını 'mekrûh' (tahrîmen) yap")
b("namaz_mekruhlari / 5 Bağdaş","D",True,"Bağdaş kurarak oturmak (özürsüz) — tahrîmen mekrûh","Teşehhüdlerde, sünnete uygun oturmamak, tenzîhen mekrûhdur. Özrü varsa, mekrûh olmaz.","1-68",241,
  "Kitabın mekrûhlar listesinde bağdaş kurmak geçmiyor (bağdaş yalnız hastanın oturuşu olarak 1-64'te anılıyor). En yakın madde 'sünnete uygun oturmamak' ve o da tenzîhen mekrûh.","Kaldır ya da 43. maddeyi aynen al")
b("namaz_mekruhlari / 9 Secdede kollar","Y",True,"Secdede kollarını yere yayarak yatırmak","Secdede, erkeklerin kollarını yere döşemesi mekrûhdur. Kadınlar ise, kollarını yere yaymalıdır.","1-68",237,"Hüküm erkeklere mahsûs; kadınlar için tersi emr ediliyor. Kayıt düşmüş.","'erkeklerin' kaydını ekle")
b("namaz_mekruhlari / eksik","Y",False,"11 madde","45 numaralı mekrûh","1-68",236,"Kitap 45 mekrûh sayıyor; tablo 11'ini veriyor ve bunu belirtmiyor.","Başlığa 'ba’zıları' ekle")
b("namaz_mekruhlari / imlâ","B",True,"Namazda Mekruh, özürsüz, rek'atte","Nemâzın mekrûhları ... özrsüz ... rek’atde","1-68",236,"Kitap 'nemâz', 'mekrûh', 'özrsüz' yazar.","Kitabın imlâsına çevir")

# 18 cuma_namazi
b("cuma_namazi / Vücûb Şartları","Y",True,"Erkek, hür, mukim, sağlıklı olmak",
  "Cum’a nemâzının (Vücûb şartları) dokuzdur. ... 1- Şehrde, kasabada oturmakdır. ... 2Sağlam olmakdır. ... 3- Hür olmakdır. ... 4- Erkek olmakdır. ... 5- Âkıl ve bâlig olmakdır. 6- Kör olmamakdır. ... 7- Yürüyebilmekdir. ... 8- Mahbûs olmamak ve düşman korkusu ... olmamakdır. 9- Çok yağmur, kar, fırtına, çamur olmamakdır.","1-71",259,
  "Kitap dokuz vücûb şartı sayıyor; tablo dördünü veriyor. 'mukim' yerine kitap 'Şehrde, kasabada oturmak' diyor.","Dokuz şartı kitaptan aynen al")
b("cuma_namazi / Sıhhat Şartları","B",True,"Sıhhat Şartları","Edâ şartları yedidir:","1-71",257,"Kitap 'Edâ şartları' diyor (yedi şart); tablodaki ad kitabın ifadesi değil, hutbe ile ilgili iki şart birleştirilmiş.","'Edâ şartları' yaz")
b("cuma_namazi / kılınış","Y",True,"İlk sünnet, hutbe, farz, son sünnet, zühr-i âhir (14 rek'at)",
  "Sonra, dört rek’at (son sünneti), bundan sonra, dört rek’at (üzerime farz olan, kılmadığım son öğle nemâzını kılmağa) diye niyyet ederek, âhır zuhur nemâzı kılınır. Bundan sonra, iki rek’at (vaktin sünneti) kılınır.","1-71",258,
  "Kitap Cum'a nemâzını 'onaltı rek’at' diye veriyor; tabloda son iki rek'at 'vaktin sünneti' yok, toplam 14'te kalıyor.","'2 Rek'at Vaktin Sünneti' adımını ekle")
b("cuma_namazi / imlâ","B",True,"Cuma Namazı, şehirde, mukim, cemâat, Zühr-i Âhir","Cum’a nemâzı ... şehrde ... cemâ’at ... âhır zuhur","1-71",257,"Kitabın imlâsı farklı.","Kitabın imlâsına çevir")

# 19 bayram_namazi
b("bayram_namazi / imlâ","B",True,"Bayram Namazı, Niyet, namaz, Cuma","BAYRAM NEMÂZLARI ... niyyet ... Cum’a","1-72",266,"Kılınış adımları kitapla uyumlu; yalnız imlâ farklı.","Kitabın imlâsına çevir")

# 20 zekat_nisab
b("zekat_nisab / mezheb","Y",False,"Altın 20 miskal (96 gram); Gümüş 672 gram",
  "Bir miskal, mâlikîde üçbuçuk [3,456] gram ve hanefîde, dört gram ve seksen santigram [4,80 gr.] ağırlığında olmakdadır. O hâlde, altının nisâbı, [96] gramdır.","1-78",296,
  "Gram karşılıkları Hanefî ölçüsüne göre; kitap şâfi'î ve hanbelîde yirmi miskalin 69 gram olduğunu ayrıca bildiriyor. Tabloda mezheb kaydı yok. Sayılar kitapla aynı.","'Hanefîde' kaydını ekle")
b("zekat_nisab / Sığır terimleri","D",False,"tabî' ; müsinne","Otuz sığır için bir aded, bir yaşını aşmış erkek veyâ dişi buzağı verilir. ... Kırkdan ellidokuza kadar sığırı olan, bir aded, iki yaşını bitirmiş, erkek veyâ dişi dana verir.","1-78",311,
  "'Tabî'' ve 'müsinne' terimleri kitapta geçmiyor; sayılar ve yaşlar kitapla aynı.","Parantez içi terimleri kaldır")

# 21 zekat_kimlere_verilir
b("zekat_kimlere_verilir / verilmez 4 karı-koca","Y",True,"Karı-koca birbirine verilmez",
  "Zevceye de zekât verilmez. İmâm-ı a’zam buyurdu ki, kadın da, fakîr olan zevcine zekât veremez. İmâmeyn ise, fakîr zevcine zekât verir dediler.","1-78",308,"Kadının zevcine vermesinde kitabın bildirdiği ihtilâf (İmâmeyn: verir) düşmüş.","Kitabın cümlelerini aynen al")
b("zekat_kimlere_verilir / imlâ","B",True,"Verilmeyecek, toplıyan","Zekât verilmez ... toplayan (Sâ’î)","1-78",307,"Küçük imlâ farkları.","Kitabın imlâsına çevir")

# 53 sadaka_fitr
b("sadaka_fitr / Kime vâcibdir","Y",True,"Nisâb mikdârı malı olan her müslimâna",
  "Şâfi’î, Mâlikî ve Hanbelî mezheblerinde, bir günlük yiyeceği olanın fıtra vermesi farzdır ve buğdaydan ve arpadan da, hep bir sâ’ vermek lâzımdır.","1-80",323,"Nisâb şartı ve yarım sâ' Hanefî mezhebine göre; kitabın bildirdiği öteki mezheblerin hükmü düşmüş, hüküm genel gibi sunulmuş. 'Hür' şartı da yok.","'Hanefî mezhebinde' kaydını ekle")
b("sadaka_fitr / Kime verilir","Y",True,"Zekât verilecek yedi sınıfa verilir","Zimmîye, ya’nî gayr-i müslim vatandaşa zekât verilmez. Zimmîye fıtra, adak, sadaka, hediyye verilebilir.","1-78",308,"1-80'de fıtranın kime verileceği yedi sınıfa bağlanmıyor; kitap fıtranın zekâttan farklı olarak zimmîye de verilebileceğini söylüyor.","Kitabın cümlesini ekle ya da satırı kaldır")
b("sadaka_fitr / Ne zaman verilir","Y",False,"Bayram namazından önce vermek müstehabdır, sonra da verilir",
  "Bayram nemâzından önce verilince, sevâbı dahâ çok olur. Şâfi’îde Ramezândan önce, Mâlikîde ve Hanbelîde ise bayramdan önce verilemez.","1-80",322,"Kitap 'müstehab' demiyor; öteki mezheblerin vakit kayıtları düşmüş.","Kitabın cümlelerini aynen al")
b("sadaka_fitr / imlâ","B",True,"Ramazan, zaman, namazından","Ramezân ... zemân ... nemâzından","1-80",322,"Kitap 'Ramezân', 'zemân', 'nemâz' yazar.","Kitabın imlâsına çevir")

# 22 oruc_bozanlar
b("oruc_bozanlar / kaynakMetin","Y",True,"İmâm-ı Rabbânî ... (Ramezân-ı şerîf ayında yapılan nâfile nemâz ... Cehennemden âzâd olur.",
  "ORUCU BOZMAYAN ŞEYLER — Ramezân-ı şerîfde veyâ kazâ, keffâret, adak ve nâfile oruclarda, oruclu olduğunu unutarak yise, içse, cimâ’ etse, oruclu iken uykuda cünüb olsa, ...","1-79",316,
  "Alıntı Ramezânın fazîletini anlatıyor; orucu bozan/bozmayan şeylerle ilgisi yok.","kaynakMetin'i 'ORUCU BOZMAYAN ŞEYLER — ...' paragrafıyla değiştir")
b("oruc_bozanlar / bozanlar 9 bayılmak","D",True,"Bayılıp bütün gün kendine gelmemek",None,"1-79",None,"1-79'da bayılmanın orucu bozduğuna dair cümle bulunamadı.","Kaldır ya da kitapta yerini göster")
b("oruc_bozanlar / bozmayanlar 4 kusma","Y",True,"Ağız dolusu olmıyan kusma","istemiyerek ağız dolusu kussa, zorlıyarak biraz kussa","1-79",316,"Kitap istemiyerek ağız dolusu kusmanın da bozmadığını söylüyor; tablo 'ağız dolusu olmıyan' diyerek bunu dışarıda bırakıyor (ve bozanlardaki 'bilerek' ile karışıyor).","Kitabın ifadesini aynen al")
b("oruc_bozanlar / bozmayanlar 7 suya girmek","Y",True,"Serinlemek için suya girmek","serinlemek için yıkanmak bozmazlar ise de, tenzîhen mekrûhdurlar.","1-79",317,"Kitabın 'tenzîhen mekrûh' kaydı düşmüş.","Kaydı ekle")
b("oruc_bozanlar / imlâ","B",True,"nohut, bozmayalar (anahtar), Cinsî münâsebet","nohud ... cimâ’","1-79",316,"Kitap 'nohud', 'cimâ’' yazar; liste anahtarı 'bozmayalar' yazım hatalı.","Kitabın imlâsına çevir")

# 23 oruc_turleri
b("oruc_turleri / 2 ve 4 keffâret orucu","K",True,"Mu'ayyen olmıyan farz: Ramezân kazâsı ... / Gayr-i mu'ayyen vâcib: adak ve keffâret orucu; oruç keffâreti, yemîn keffâreti orucu",
  "2- Mu’ayyen zemânda olmıyan farz oruclar: Kazâ ve keffâret orucları böyledir. Fekat, keffâret orucları farz-ı amelîdir.","1-79",314,
  "Kitap keffâret oruclarını farz (farz-ı amelî) sayıyor; tablo keffâreti farzdan çıkarıp vâcib sütununa koymuş. Kitabın 4. maddesi yalnız 'Herhangi bir veyâ birkaç gün oruc adamak' diyor.","Keffâreti 2. satıra al; 4. satırı 'Herhangi bir veyâ birkaç gün oruc adamak gibi' yap")
b("oruc_turleri / imlâ","B",True,"Oruç Türleri, oruç","SEKİZ DÜRLÜ ORUC VARDIR","1-79",314,"Kitap 'oruc' yazar.","Kitabın imlâsına çevir")

# 24 hac_adimlari
b("hac_adimlari / Ziyaret Tavafı (FARZ) 7 şavt","Y",True,"Ziyaret Tavafı (FARZ) — 7 şavt, haccın 3. farzı",
  "Tavâf, Mescid-i harâm içinde, Kâ’be-i mu’azzama etrâfında dönmek demekdir. Dördü farz, üçü vâcib olmak üzere yedi kerre dönülür.","1-84",343,
  "Kitap yedi şavtın dördünü farz, üçünü vâcib sayıyor (vâcib 7: 'Tavâf-i ziyâretde ... dörtden sonra üç kerre dahâ dönmekdir'). Tablo yediyi birden farz gösteriyor.","'Dördü farz, üçü vâcib' kaydını ekle")
b("hac_adimlari / Müzdelife (VÂCİB) geceleme","Y",True,"Müzdelife Vakfesi (VÂCİB) — Arafat'tan sonra geceleme",
  "22 — Müzdelife vakfesi ve bu vakfeyi sabâh nemâzı vaktinde yapmak vâcibdir.","1-84",344,"Kitabın vâcib saydığı şey vakfe ve onun sabâh nemâzı vaktinde yapılması; 'geceleme' ifadesi kitabın vâcib tarifine uymuyor.","Kitabın ifadesini al")
b("hac_adimlari / Vedâ Tavafı (VÂCİB)","Y",False,"Mekke'den ayrılmadan son tavaf","5 — (Âfâkî) olan, ya’nî Mîkât denilen yerlerden dahâ uzak memleketlerin hâcıları, ... (Tavâf-ı vedâ) yapmakdır. Hayzlı kadına bu tavâf vâcib değildir.","1-84",344,"Vâcibliğin âfâkîlere mahsûs olduğu ve hayzlı kadının muaf olduğu düşmüş.","Kaydı ekle")
b("hac_adimlari / etiketsiz vâcibler","Y",False,"Şeytan Taşlama, Kurban Kesme, Tıraş Olma (hüküm etiketi yok)","3 — Şeytân taşlamak ... 4 — İhrâmdan çıkmadan önce, başın en az dörtde birini ustura ile traş etdirmek ... 19 — Kırân ve temettü’ hac yapan, şükr kurbanı kesmekdir.","1-84",344,"Kitap bunları da vâcib sayıyor; tablo sa'y ve Müzdelifeyi VÂCİB diye işaretleyip bunları işaretsiz bırakıyor.","Hepsine 'VÂCİB' işareti koy")
b("hac_adimlari / imlâ","B",True,"Mina, Arafat, Şeytan, Tıraş, Ziyaret Tavafı, niyet","Minâ ... Arafât ... Şeytân ... traş ... Tavâf-ı ziyâret ... niyyet","1-84",343,"Kitabın imlâsı farklı.","Kitabın imlâsına çevir")

# 25 umre_adimlari
b("umre_adimlari / FARZ/VÂCİB etiketleri","D",False,"Umre Tavafı (FARZ); Sa'y (VÂCİB)","Umre, hac zemânı olan beş günden başka, senenin her günü, ihrâm ile yapılan, tavâf ve sa’y yapmak ve saç kazımak veyâ kesmekdir. Umre, ömründe bir kerre, hanefî ve mâlikîde müekked sünnet, şâfi’î ve hanbelîde farzdır.","1-84",339,
  "1-84 umrenin rükn/vâcib ayrımını vermiyor; etiketler hac hükümlerinden kıyasla konmuş görünüyor (kesin değil).","Etiketleri kaldır ya da kitapta dayanağını göster")
b("umre_adimlari / Tavaf Namazı","D",False,"Makâm-ı İbrâhîm arkasında 2 rek'at namaz kılınır","15 — Her tavâfdan sonra, (Mescid-i harâm) içinde iki rek’at nemâz kılmakdır.","1-84",344,"Kitap 'Mescid-i harâm içinde' diyor; 'Makâm-ı İbrâhîm arkasında' kaydı bulunamadı.","Kitabın ifadesini al")
b("umre_adimlari / mezheb","Y",False,"(umrenin hükmü yok)","Umre, ömründe bir kerre, hanefî ve mâlikîde müekked sünnet, şâfi’î ve hanbelîde farzdır.","1-84",339,"Kitabın kaynak cümlesindeki mezheb farkı tabloda hiç yok.","Kaydı ekle")

# 37 uc_cesit_haci
b("uc_cesit_haci / kaynakMetin ve 'ömre'","B",True,"Hac ile ömreye birlikde niyyet eden ... Önce ömre için tavâf","2 — Kârin hâcı: Hac ile umreye birlikde niyyet eden kimsedir. Önce umre için tavâf ve sa’y edip,","1-84",339,
  "Kitap 'umre' yazıyor; alıntıda ve tabloda 'ömre'ye çevrilmiş, bu yüzden alıntı kitapta aynen bulunmuyor. İçerik kitapla aynı.","'ömre'yi 'umre' yap")

# 38 hac_sartlari
b("hac_sartlari / vücûb 2","Y",True,"2. Haccın farz olduğunu işitmek","2 — Kâfir memleketinde olanın, haccın farz olduğunu işitmesi.","1-84",339,"Şartın 'kâfir memleketinde olan' için olduğu kaydı düşmüş.","Kitabın cümlesini aynen al")
b("hac_sartlari / edâ 3 mahrem","Y",True,"3. Kadının yanında mahrem akrabâsı bulunmak",
  "3 — Mekkeden üç gün üç gecelik uzak yerlerde bulunan hür kadının hacca gidebilmesi için, üç mezhebde, zevcinin veyâ ... mahrem akrabâsından ... bir erkeğin berâber gitmesi lâzımdır. ... Şâfi’î mezhebinde, mahremsiz olarak, iki kadın ile, farz olan hacca gidebilir.","1-84",340,"Mesâfe şartı ve şâfi'î farkı düşmüş; ayrıca kitabın 'zevci' de saydığı yok.","Kitabın cümlesini aynen al")
b("hac_sartlari / başlık","Y",False,"Haccın Vücûb (8) ... Şartları","A — Vücûb şartları, İmâm-ı a’zama göre, sekizdir:","1-84",339,"'İmâm-ı a’zama göre' kaydı düşmüş.","Kaydı ekle")

# 39 ibadet_uc_kisim
b("ibadet_uc_kisim / 3 hac vekâleti","Y",True,"Beden kısmı başkasına verilebilir (bedel hac)",
  "Bir kimse hayâtda iken, ancak devâmlı özrü olduğu zemân, bunun emri ve malı ile yerine başkası hac yapabilir.","1-84",341,"Kitabın 'ancak devâmlı özrü olduğu zemân, emri ve malı ile' şartı düşmüş; 'beden kısmı başkasına verilebilir' ifadesi kitapta yok.","Kitabın cümlesini aynen al")
