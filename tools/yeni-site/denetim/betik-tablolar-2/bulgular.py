# Bulgu listesini kurar; her "kitap" alıntısının maddede AYNEN geçtiğini sınar.
import json, sys
from ortak import *
B = []
def b(kimlik, sinif, kesin, derleme, kitap, madde_, sahife, aciklama, oneri):
    B.append(dict(kimlik=kimlik, sinif=sinif, kesin=kesin, derleme=derleme, kitap=kitap,
                  madde=madde_, sahife=sahife, aciklama=aciklama, oneri=oneri))

b("ulum_ogrenme_hukmu / başlık","B",True,"Ulûm-i İslâmiyyenin Öğrenme Hükmü Üç Tabakadadır",
  "Bu bilgilerin kimisini öğrenmek farzdır. Kimisini öğrenmek sünnet, bir kısmını öğrenmek de mubâhdır.","1-11",25,
  "Satırlar kitapta aynen var; başlıktaki \"üç tabaka\" ifadesi kitapta geçmiyor (sitenin ifadesi).","başlığı kitabın ifadesine yaklaştır")
b("insanlar_uc_turlu / tablo geneli","Y",True,"Üç kısım insan, kitabın hükmü olmadan sıralanmış",
  "Üçüncü kısm, herşey yimeli ammâ, lüzûmu kadar, der. Bunların üçü de yanılmakdadır.","2-40",610,
  "Kitap üç görüşü sayıp hemen \"üçü de yanılmakdadır\" diyor; tablo bunları doğru tavırlar gibi sıralıyor (kaynakMetin'de var, tabloda yok). Başlıktaki \"Vera' Bahsinde\" sitenin ifadesi.","tabloya kitabın şu cümlesini ekle: \"Bunların üçü de yanılmakdadır.\"")
b("nikah_hukumleri / kaynakMetin, sahife","B",True,"kaynakMetin: \"34 — İSLÂMİYYETDE NİKÂH … haberler de, başka başka olmuşdur.\"; sahife 564",
  "Hür erkeğin dörtden, kölenin ise ikiden çok kadın nikâhı altında bulundurması harâmdır.","2-34",571,
  "Tablonun satırları maddenin başında değil, 2-34'ün ortasında (tahminen s.570-571). kaynakMetin bekârlık/evlilik girişidir, satırlarla ilgisi yok.","atfı düzelt (s.570-571) ve kaynakMetin'i satırların geçtiği paragraftan al")
b("nikah_hukumleri / Zinâdan hâmile kadın","Y",True,"Zinâdan hâmile kadını vad'-ı haml etmeden evvel nikâh etmek sahîhdir. Fekat, vad'-ı haml edinciye kadar vaty etmek câiz olmaz.",
  "Fekat, vad’-ı haml edinciye kadar vaty etmek câiz olmaz ve nafakası vâcib olmaz. Nikâhdan hâmile olan kadını, vad’-ı haml edinciye kadar, nikâh etmek sahîh değildir.","2-34",571,
  "Cümle \"ve nafakası vâcib olmaz\" kısmından kesilmiş; hemen ardından gelen ve hükmü sınırlayan \"nikâhdan hâmile\" kaydı yok.","şu ifadeyle tamamla (kitaptan): \"… vaty etmek câiz olmaz ve nafakası vâcib olmaz. Nikâhdan hâmile olan kadını, vad’-ı haml edinciye kadar, nikâh etmek sahîh değildir.\"")
b("nikah_niyyet_haram / kaynakMetin, sahife","B",True,"kaynakMetin: \"Bunlardan sonra gelenlerin ise, bekâr kalması da iyi idi. … Harâmdan kendini kurtarmak güçleşdi.\"; sahife 565",
  "Nikâh eden kimsenin niyyeti, zinâdan, harâma bakmakdan korunmak olmalıdır.","2-34",575,
  "Satırların hepsi 2-34'ün sonlarında (tahminen s.575). kaynakMetin (Süfyân-ı Sevrî, bekârlık) satırlarla ilgisiz.","atfı s.575 yap, kaynakMetin'i bu paragraftan al")
b("nikah_niyyet_haram / Muvakkat nikâh","Y",True,"Yüz sene olsa bile, belli bir zemân sonra boşamağı söyliyerek yapılan nikâhdır.",
  "Muvakkat nikâh, yüz sene olsa bile, belli bir zemân sonra boşamağı söyliyerek, bütün şartlarına uygun yapılan nikâhdır. Söylemeyip, yalnız kalbinden geçirse, nikâh sahîh olur.","2-34",575,
  "Kitabın istisnâsı (söylemeyip kalbinden geçirirse nikâh sahîh) düşmüş.","kitabın cümlesini tam al")
b("bosama_yetkisi / Temlîk (atıf)","B",True,"Zevc zevcesine, talâk niyyeti ile, 'Sen nefsini ihtiyâr et' veyâ 'İşin elinde olsun' der … (kaynakMadde 2-36)",
  "Birincisi, (Temlîk) olup, zevc zevcesine, talâk niyyeti ile, (Sen nefsini ihtiyâr et) veyâ (İşin elinde olsun) yâhud niyyete lüzûm olmadan (Kendini boşa) der ve vakt bildirmezse, kadın o meclisde, vakt de bildirdi ise, o vakt içinde, kendini boşayabilir.","2-34",573,
  "Bu satırın ifadesi 2-36'da değil 2-34'te (tahminen s.573-574). 2-36'daki karşılığı \"1 — Tefvîd: Buna Temlîk de denir\" olup başka sözler sayar. kaynakMetin (nikâhda boşanma şartı) da üç yolun cümlesi değil; 2-36'daki asıl cümle: \"Erkeğin talâk hakkını başkasına bırakması üç dürlü olur:\".","1. satırın atfını 2-34'e çevir ya da 2-36'daki Tefvîd cümlesini al; kaynakMetin'i \"Erkeğin talâk hakkını başkasına bırakması üç dürlü olur:\" paragrafından al")
b("bosama_yetkisi / Temlîk (vakt kaydı)","Y",True,"… der ve vakt bildirmezse, kadın o meclisde kendini boşayabilir.",
  "vakt de bildirdi ise, o vakt içinde, kendini boşayabilir.","2-34",573,
  "\"vakt de bildirdi ise, o vakt içinde\" kısmı ile \"niyyete lüzûm olmadan (Kendini boşa)\" sözü düşmüş.","kitabın cümlesini tam al")
b("ila_hul / Îlâ","Y",True,"Zevcesine, dört ay veyâ dahâ çok zemân söyliyerek, 'Sana yaklaşmıyacağım' diye yemîn etmekdir.",
  "Îlâ — Zevcesine, dört ay veyâ dahâ çok zemân veyâ zemân söylemiyerek, (Sana yaklaşmıyacağım) diye yemîn etmekdir.","2-36",584,
  "Kitap \"veyâ zemân söylemiyerek\" diyor (zemânsız yemîn de îlâdır); tabloda bu düşmüş ve \"söyliyerek\" kalmış, anlam daralmış.","şu ifadeyle değiştir (kitaptan): \"Zevcesine, dört ay veyâ dahâ çok zemân veyâ zemân söylemiyerek, (Sana yaklaşmıyacağım) diye yemîn etmekdir.\"")
b("ila_hul / kaynakMetin, sahife","B",True,"kaynakMetin: maddenin girişi (\"36 — İSLÂMİYYETDE TALÂK … (Talâk-ı ric’î) denir.\"); sahife 580",
  "Hul’ — Mal karşılığı boşamak olup câizdir.","2-36",584,
  "Îlâ ve Hul' 2-36'nın sonunda (tahminen s.584); kaynakMetin talâk tarifidir.","atfı s.584 yap, kaynakMetin'i Îlâ/Hul' paragrafından al")
b("akika / kaynakMetin","B",True,"kaynakMetin: \"Keserse, nâfile olur ve etinden yiyebilir … zenginlere yidirmez.\"",
  "AKÎKA KESMEK: Akîka, çocuk ni’metine karşılık, Allahü teâlâya şükr etmek niyyeti ile hayvan kesmekdir.","1-81",329,
  "Satırlar akîka paragrafında aynen var; fakat \"Kitaptan\" alıntısı fakîrin nezr/nâfile kurbanı hakkındadır, akîka ile ilgisi yok.","kaynakMetin'i \"AKÎKA KESMEK\" paragrafından al")
b("muvakkat_haram / yedinci kadın","Y",True,"4 satır (baldız, diğer akrabâ, müşrik kadın, başkasının zevcesi)",
  "Muvakkat harâm olan kadınların yedincisi, hür kadın ile evli iken, câriye ile de nikâhlanmakdır.","2-34",571,
  "Kitap muvakkat harâm yedi kadını sayıyor; yedincisi tabloda yok.","kitabın bu cümlesini satır olarak ekle")
b("muvakkat_haram / Başkasının zevcesi","Y",False,"Başkasının zevcesi — muvakkat harâm satırı",
  "Başkasının zevcesini nikâh etmek câiz değildir.","2-34",571,
  "Kitap bu hükmü yedi kadının sayımı bittikten sonra ayrı bir cümle olarak veriyor; yedinin içinde saymıyor. Kesin değil: hüküm doğru, yalnız sayım yeri farklı.","yedi kadından ayrı göster ya da yedinciyi ekleyip bunu ayrı not yap")
b("lian / Kadının yemîni","Y",True,"Sonra kadın, dört def'a … diye yemîn eder.",
  "Beşincisinde, (Doğru söyledi ise, Allahın gadabı benim üzerime olsun) der.","2-36",584,
  "Erkeğin beşinci yemîni verilmiş, kadınınki düşmüş; li'ân eksik anlatılıyor.","kitabın bu cümlesini satıra ekle")
b("lian / Netice","Y",True,"Li'ân yapıldıkdan sonra, adam sözünden dönerek had vurulmadıkca, bu kadınla tekrâr hiçbir zemân nikâhlanamaz.",
  "Li’ân yapıldıkdan sonra, adam sözünden dönerek veyâ başka bir afîf kadını kazf ederek had vurulmadıkca, bu kadınla tekrâr hiçbir zemân nikâhlanamaz.","2-36",584,
  "\"veyâ başka bir afîf kadını kazf ederek\" düşmüş.","kitabın cümlesini tam al")
b("sut_haram_olanlar / Aynı kadından emenler","Y",True,"… birbiri ile evlenemez.",
  "Aynı kadından emen oğlan ile kız, süt babaları başka olsa ve başka senelerde emmiş olsalar bile, birbiri ile ve birbirlerinin çocukları ve torunları ile evlenemez.","2-37",586,
  "\"ve birbirlerinin çocukları ve torunları ile\" düşmüş; harâmın kapsamı daralmış.","kitabın cümlesini tam al")
b("sut_haram_olanlar / İstisnâlar","Y",True,"Bir adam, kendi annesinden süt emen süt kardeşinin anası veyâ kız kardeşi ile evlenebilir. Öz kardeşinin yabancı kadından olan süt kardeşi ile evlenebilir.",
  "Bir adam, kendi annesinden süt emen süt kardeşinin anası veyâ kız kardeşi ile evlenebilir. Fekat, baba bir kardeşinin annesi ile evlenemez.","2-37",586,
  "İstisnânın hemen ardındaki \"evlenemez\" kaydı ve kitabın saydığı diğer harâmlar (çocuğun zevcesi–süt babası, süt kardeşinin öz/süt kızı, süt babanın diğer zevceleri) tabloda yok; başlık \"Evlenmesi Harâm Olanlar\" olduğu hâlde liste eksik.","\"Fekat, baba bir kardeşinin annesi ile evlenemez.\" cümlesini ve kitaptaki diğer harâmları ekle")
b("sut_cocuklugu_haller / kaynakMetin","K",True,"\"İkibuçuk yaşından küçük çocuk, … birer yudum süt emerse, hanefîde, bu çocuk, o kadınların mahremi olur. Süt çocuğu olmak için: çocuğun iki buçuk yaşından küçük olması, sütün gerçek anlamda emilmesi ve bağlantı kurulabilmesi şartları aranır.\"",
  "İkibuçuk yaşından küçük çocuk, yabancı bir veyâ birkaç kadından, birer yudum süt emerse, hanefîde ve mâlikîde, bu kadınlar çocuğun süt annesi olur.","2-37",586,
  "\"Kitaptan\" diye gösterilen alıntı değiştirilmiş: \"ve mâlikîde\" atılmış, \"bu kadınlar çocuğun süt annesi olur\" yerine \"bu çocuk, o kadınların mahremi olur\" yazılmış; \"Süt çocuğu olmak için … şartları aranır\" cümlesi kitapta hiç yok.","kaynakMetin'i kitaptan aynen al; uydurma cümleyi kaldır")
b("sut_cocuklugu_haller / olur: Pişmemiş ise","Y",True,"Pişmemiş ise, yarıdan çok olunca, süt çocuğu olur.",
  "Pişmemiş ise, yarıdan çok olunca, süt çocuğu olur. İmâm-ı Şâfi’î “rahmetullahi teâlâ aleyh”, süt yarıdan az olunca da, süt çocuğu olur dedi.","2-37",587,
  "Kitabın hemen ardından verdiği Şâfi'î farkı düşmüş; hanefî hükmü genel gibi duruyor.","Şâfi'î kaydını ekle")
b("sut_emme_sabit / Eksik şehâdetde hüküm","Y",True,"İki erkek âdil değillerse veyâ iki kadın şâhid olmuş ise ve zevc tasdîk ederse, nikâh fâsid olur, ayrılırlar.",
  "İki erkek âdil değillerse veyâ iki kadın veyâ bir erkekle bir kadın yâhud yalnız âdil olan süt anne şâhid olmuş ise ve zevc tasdîk ederse, nikâh fâsid olur, ayrılırlar","2-37",587,
  "\"veyâ bir erkekle bir kadın yâhud yalnız âdil olan süt anne\" düşmüş.","kitabın cümlesini tam al")
b("olcu_birimleri / Şer'î birimler","B",True,"Peygamber Efendimiz (sallallahü aleyhi ve sellem) zamanında kullanılan …",
  "Şer’î birimler, Peygamberimiz “sallallahü teâlâ aleyhi ve sellem” zemânında kullanılan ve hadîs-i şerîflerde ismleri geçen birimlerdir.","1-78",295,
  "İmlâ kitaptan sapmış (\"zamanında\" ↔ \"zemânında\", \"Peygamber Efendimiz\" ↔ \"Peygamberimiz\").","kitabın ifadesiyle değiştir")
b("alacaklar_uc_turlu / başlık","Y",True,"Alacaklar Üç Dürlüdür",
  "Alacaklara gelince, İmâm-ı a’zama göre, üç dürlü alacak vardır:","1-78",294,
  "Kitap bu taksîmi İmâm-ı a'zama nisbet ediyor; tablo/başlık bunu genel hüküm gibi veriyor.","başlığa/açıklamaya \"İmâm-ı a’zama göre\" kaydını ekle")
b("muhayyerlik_uc_turlu / kaynakMadde, sahife, kaynakMetin","B",True,"kaynakMadde 3-4, sahife 797; kaynakMetin: \"Bu kadar ucuz malın, … velîsinin izn vermesi ile sahîh olur.\"",
  "Muhayyerlik, sahîh ve fâsid bey’lerde câiz olup, üç dürlüdür:","3-5",806,
  "Tablonun içeriği 3-5 \"ALIŞ VERİŞDE MUHAYYERLİK\" maddesinden; 3-4'te bu taksîm yok. kaynakMetin çocuğun bey'i hakkındadır, ilgisiz.","atfı 3-5 / s.806 yap, kaynakMetin'i bu maddeden al")
b("muhayyerlik_uc_turlu / Şart ile muhayyerlik","Y",True,"Bu muhayyerlik üç günden fazla olamaz.",
  "Bu muhayyerlik üç günden fazla olamaz. Bu müddet söylenmez ise, muhayyerlik olmaz. İmâmeyne göre, müddet belli olmak şartı ile çok uzun zemân muhayyer olabilirler.","3-5",806,
  "Kitabın verdiği İmâmeyn (ve İmâm-ı Muhammed) farkı düşmüş; tek görüş genel hüküm gibi sunulmuş.","İmâmeyn kaydını ekle")
b("miras_alamiyanlar / kaynakMadde, kaynakMetin","B",True,"kaynakMadde 3-63, sahife 1019; kaynakMetin: \"63 — MEYYİT İÇİN İSKÂT …\"",
  "9 — Köle, meyyiti öldüren, başka dinden olanlar ve mürtedler mîrâs alamaz.","3-64",1027,
  "Liste 3-64'ün 9. fıkrasından (tahminen s.1027); 3-63 iskât maddesidir. kaynakMetin iskât maddesinin girişi, mîrâsla ilgisiz. 3-65'teki \"Katle yardım eden de, kâtil gibi mîrâs alamaz.\" listede yok.","atfı 3-64 / s.1027 yap, kaynakMetin'i bu fıkradan al")
b("miras_alamiyanlar / Veled-i zinâ","Y",True,"Veled-i zinâ, babasına vâris olamaz.",
  "Babası sâhib çıkmıyan veled-i zinâ, babasına vâris olamaz.","3-64",1027,
  "\"Babası sâhib çıkmıyan\" şartı düşmüş.","şu ifadeyle değiştir (kitaptan): \"Babası sâhib çıkmıyan veled-i zinâ, babasına vâris olamaz.\"")
b("nikah_sartlari_mezhebler / Şâhid – Hanefî","Y",True,"Îcâb ve kabûl yapılırken, âkıl ve bâlig müslimân iki erkek veyâ bir erkekle iki kadın şâhid bulunmalı …",
  "Nikâhın ikinci şartı, Hanefî mezhebinde, [fıskı belli olsa da] îcâb ve kabûl yapılırken, âkıl ve bâlig müslimân iki erkek veyâ bir erkekle iki kadın şâhid bulunmaları ve îcâb ile kabûlü işitmeleri lâzımdır.","2-34",566,
  "Hanefî ile Şâfi'î/Hanbelî arasındaki asıl fark olan \"[fıskı belli olsa da]\" kaydı düşmüş. Ayrıca kitap velî sırasını \"bu üç mezhebde\" (Mâlikî dahil) veriyor; Şâfi'î'ye has \"oğul ve onun oğlu velî olmaz\" kaydı yok.","kaydı ekle")
b("zevil_erham_bes / III-V. sınıflar","Y",True,"III: Her nev' kızkardeş çocukları ve erkek kardeş kızları. IV: Halalar, teyzeler, dayılar ve anadan amcalar. V: Ananın veyâ babanın halaları, teyzeleri, dayıları.",
  "Her nev’ kızkardeş çocukları veyâ torunları ve anadan erkek kardeş çocukları ve her nev’ erkek kardeş kızları veyâ torunları bunlardandır.","3-65",1033,
  "Sınıfların kitaptaki üyeleri eksik verilmiş (III: anadan erkek kardeş çocukları, torunlar; IV: \"Her nev’ amca kızları ve hepsinin çocukları\"; V: babanın anadan amcaları, ananın amcaları, amca kızları).","her sınıfı kitaptaki sayımla tamamla")
b("zevil_erham_tercih / Asl hüküm","Y",True,"Eshâb-ı ferâizden ve asabelerden kimse bulunmazsa, mîrâs zevil-erhâma verilir.",
  "Eshâb-ı ferâizden ve asabelerden kimse bulunmazsa veyâ bunlardan yalnız zevc, zevce varsa, mîrâs zevil-erhâma verilir.","3-65",1033,
  "\"veyâ bunlardan yalnız zevc, zevce varsa\" düşmüş.","kitabın cümlesini tam al")
b("zevil_erham_tercih / Herşey eşitse","Y",True,"Yakınlık dereceleri ve kuvvetleri ve cihetleri berâber olursa, erkekler kadınların iki katı olarak bölünür.",
  "Meyyite yakınlık dereceleri ve yakınlık kuvvetleri ve cihetleri berâber olursa ve içlerinde vâris ile bağlanan yoksa, erkekler, kadınların iki katı olarak bölünür.","3-65",1033,
  "\"ve içlerinde vâris ile bağlanan yoksa\" şartı düşmüş; kitabın \"vâris ile bağlanan vâris olur\" ve \"Yakınlık ciheti farklı ise … üçde iki … üçde bir\" kâideleri tabloda yok.","şartı ve eksik kâideleri kitaptan ekle")
b("nezr_iki_turlu / Şarta bağlı nezr","Y",True,"Murâd edilen şart hâsıl olunca, nezri yerine getirmesi lâzım olur.",
  "Hâsıl olmasını istemediği birşeyi şart ederse, istemediği şey hâsıl olunca, hac, oruc, sadaka, nâfile nemâz gibi nezrlerini, isterse yapar. İstemezse, yapmayıp, yemîn keffâreti verir.","1-82",330,
  "Kitabın hemen ardından köşeli parantezle verdiği istisnâ (istenmeyen şarta bağlı nezrde yemîn keffâreti ile çıkış) tabloda yok.","istisnâyı kitaptan ekle")
b("nezr_iki_turlu / kaynakMetin","B",True,"\"… Mutlak nezr, şarta bağlı nezr. Mutlak nezr (Allahü teâlâ için, …\"",
  "1 — Mutlak nezr (Allahü teâlâ için, bir sene oruc tutacağım) demek gibidir.","1-82",330,
  "Alıntı iki paragraf \"1 —\" atılarak birleştirilmiş; kelimeler kitapta var.","kaynakMetin'i paragraf ve numarasıyla aynen al")
b("farz_adamak / başlık","B",True,"Zâten Farz Olanı Adamak ve Hac/Kurban Farkı",
  "Hacca gitmeği nezr edince, hâcı olmağı, ya’nî farz olan hacca gitmeği kasd etmezse, iki kerre hacca gitmesi lâzımdır.","1-82",332,
  "Başlıkta \"Hac\" var ama tabloda hac adağı satırı yok (kitapta kurbanla birlikte anlatılıyor).","hac satırını kitaptan ekle ya da başlıktan \"Hac\"ı çıkar")
b("subheler_uc_kisim / kaynakMetin, sahife","B",True,"kaynakMetin: maddenin girişi (\"40 — HALÂL, HARÂM VE ŞÜBHELİ ŞEYLER …\"); sahife 607",
  "Şübheliler de, üç kısmdır: Ba’zısından sakınmak vâcibdir.","2-40",608,
  "Liste 2-40'ın ikinci derece vera' bahsinde (tahminen s.608); kaynakMetin maddenin girişi.","atfı s.608 yap, kaynakMetin'i bu cümleden al")
b("zaruret_ruhsatlari / kaynakMetin","B",True,"kaynakMetin: \"41 — YİMESİ ve KULLANMASI HARÂM OLAN ŞEYLER (Berîka)da … azını içmek de harâmdır.\"",
  "(Redd-ül-muhtâr) beşinci cild, ikiyüzonbeşinci sahîfede buyuruyor ki, açlığı giderecek kadar yimek ve avret yerini örtecek ve soğukdan, sıcakdan korunacak kadar giyinmek farzdır.","2-41",618,
  "Satırlar Redd-ül-muhtâr naklinden; kaynakMetin Berîka'nın harâm yiyecekler listesinin başı.","kaynakMetin'i Redd-ül-muhtâr naklinden al")
b("altin_gumus_hukumleri / Kadınlarda zînet","Y",True,"Altın ile gümüşü süs olarak takmak yalnız kadınlara halâldir.",
  "Altın ile gümüşü süs olarak takmak yalnız kadınlara halâldir. Fekat, bunları [meselâ, parmağındaki yüzüğünü] mahrem olmıyan erkeklere göstermeleri harâmdır.","2-41",620,
  "Hemen ardındaki kayıt düşmüş. Ayrıca \"Kadınlarda başka ma'den yüzük\" satırında \"zînet olarak\" kaydı düşmüş.","kitabın cümlesini tam al")
b("tutun_gorusleri / Bahsin sonucu","K",True,"Bahsin sonucu: Tütün içmek, nihâyet şübheli kalmakdadır. Şübheliler ise harâm olur. Tütüne tehlükeli demek insâf olur.",
  "Yukarıdaki örnek yazılardan anlaşılıyor ki, tütün içmek, alkollü içkiler ve afyon, morfin, esrâr ve benzerleri uyuşdurucu maddeler gibi, harâm edilmemişdir.","2-43",633,
  "\"Bahsin sonucu\" diye verilen sözler Berîka (Hâdimî) tercemesinin içindendir (s.631; kitap: \"(Berîka) kitâbından terceme burada temâm oldu\"). Kitabın kendi sonucu bunun tersidir ve \"Tütün böyle değildir\" diyerek tütünü şübhelilerden saymaz.","\"Bahsin sonucu\" satırını kaldır ya da Berîka'ya nisbet et; kitabın kendi sonucunu ekle")
b("tutun_gorusleri / eksik görüşler","Y",True,"4 satır (Necmeddîn-i Gazzî, çoğunluk, İmâdî, \"sonuç\")",
  "Tütün içmek Şâfi’î mezhebinde harâm değildir. Kitâblarında, tenzîhen mekrûh denilmekdedir.","2-43",629,
  "Kitabın naklettiği diğer görüşler (İbni Âbidîn: Şâfi'îde tenzîhen mekrûh; Nablüsî: mubâh; Alî Echürî: dört mezheb âlimleri sözbirliği ile harâm değil) yok; tablo görüş dağılımını harâm yönüne çarpıtıyor.","bu görüşleri kitaptan ekle")
b("israf_bes_bahs / kaynakMetin","K",True,"\"… Kötü bir huydur. İKİNCİ BAHS — Yimekde isrâf. ÜÇÜNCÜ BAHS — İçmekde isrâf. DÖRDÜNCÜ BAHS — Giyinmekde isrâf. BEŞİNCİ BAHS — Binalarda isrâf. Her birinde haddi aşmak isrâfdır.\"",
  "İKİNCİ BAHS — İsrâfın kötü olmasının birinci sebebi, malın kıymetli olmasıdır.","2-44",641,
  "\"Kitaptan\" diye gösterilen alıntının ikinci yarısı uydurma: bu bahs başlıkları ve son cümle kitapta yok; kitabın başlıkları başkadır (tablonun kendi satırları ise kitapla aynı).","kaynakMetin'i \"Kötü bir huydur.\"da bitir ya da kitabın bahs başlıklarını aynen al")
b("para_vermek_iki_turlu / Kendi bedeni için kullanmadığı zemân","Y",True,"Hakkı, ya'nî lüzûmu olmıyan yere, az da sarf etmek isrâf olur. Malı ateşde yakmak, denize atmak böyledir.",
  "Lüzûmu olan yere, lüzûmundan fazla vermek de isrâf olur.","2-44",647,
  "Kitabın ikinci kısmın tarifine eklediği cümle düşmüş.","cümleyi ekle")
b("yimek_adabi / sünnet etiketi","Y",True,"durum: sunnet — \"Acıkmadan yimemeli, doymadan kalkmalıdır.\", \"Ekmeği iki eli ile koparmalıdır.\", \"Lokma küçük olmalı ve iyi çiğnenmelidir.\"",
  "Acıkmadan yimemeli, doymadan kalkmalı, şaşacak şey olmadan gülmemeli","2-45",648,
  "Kitap bu üç edebe \"sünnet\" demiyor (\"-malıdır\" diye öğütlüyor); tablo hepsini \"sünnet\" sınıfına koymuş. Diğer 8 kalem için kitap \"sünnetdir\" diyor.","bu üçünün etiketini kaldır ya da \"edeb\" yap")

# sına
hata = 0
for x in B:
    if x['kitap'] and x['madde']:
        s = madde(x['madde'])['metin']
        if x['kitap'] not in s:
            hata += 1; print('ALINTI YOK:', x['kimlik'], '|', x['kitap'][:80])
print('bulgu', len(B), 'hata', hata)
from collections import Counter
print(Counter(x['sinif'] for x in B))
json.dump(B, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
