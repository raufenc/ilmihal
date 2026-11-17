# sualler.json bulgu listesini üretir (elle verilmiş hükümler + betik çıktıları)
import json, re, os
from ara import madde, norm, KOK
OUT=os.path.join(os.path.dirname(__file__),'..','sualler.json')
B=[]
def b(kimlik,sinif,kesin,derleme,kitap,md,aciklama,oneri):
    if kitap and md:  # alıntı doğrulaması
        t=re.sub(r'\s+',' ',norm(madde(md)['metin'])); q=re.sub(r'\s+',' ',norm(kitap)).strip(' .…')
        for parca in [p for p in re.split(r'\s*…\s*',q) if p]:
            assert parca in t, (kimlik, parca[:60])
    B.append(dict(kimlik=kimlik,sinif=sinif,kesin=kesin,derleme=derleme,kitap=kitap,madde=md,sahife=None,aciklama=aciklama,oneri=oneri))

T=json.load(open(f'{KOK}/test-sorulari.json'))
def ts(k,i): 
    for x in T['konular']:
        if x['id']==k: return x['sorular'][i-1]
# ---------------- BİLGİ TESTİ ----------------
b('test / iman / 3','B',True,ts('iman',3)['aciklama'],
  'Ehl-i sünnetin reîsi, fıkhın kurucusu, imâm-ı a’zam Ebû Hanîfedir','1-26',
  "Açıklamadaki tırnak içindeki cümle kitapta bu biçimde yok; en yakını 1-26'dadır ve 'fıkhın kurucusu' kelimeleri düşürülmüştür. Atıf (K1/M5) yanlış: 1-5'teki cümle 've iki imâm, Ebû Mensûr Mâ-türîdî ve Ebül-Hasen-i Eş’arîdir' diye devam eder.",
  "Alıntıyı 1-26'daki cümleyle aynen değiştir ve atfı (K1/M26) yap; ya da 1-5'teki cümleyi tam ver.")
b('test / namaz / 3','Y',True,'Abdesti bozan hallerden değildir? … Kan gelmesi … (doğru: Ağlamak)',
  'Üçüncüsü, deriden çıkan kan, cerâhat, sarı su, ağrılı çıkan renksiz su, hanefîde bozar. Bunların, mâlikîde ve şâfi’îde abdesti bozmadıkları, fârisî (Menâhic-ül-ibâd) kitâbında yazılıdır','1-52',
  "Soru mezheb belirtmiyor; 'Kan gelmesi' şıkkı kitaba göre yalnız hanefîde abdesti bozar, mâlikî ve şâfi'î okuyucu için o şık da 'bozmaz' olur (iki doğru cevap). 'Uyumak' da kitapta şartlıdır (mak'adın gevşek olacağı hâlde). Ağlamakla ilgili açıklama kitapta vardır: 'Ağrı olmadan, herhangi bir sebeble ağlamakla … göz yaşı akınca bozmaz. Şâfi’îde ikisi de bozmaz.'",
  "Soruyu 'Hanefî mezhebinde' diye sınırla; açıklamaya kitabın 'hanefîde bozar … mâlikîde ve şâfi’îde abdesti bozmadıkları' cümlesini ekle.")
b('test / namaz / 6','Y',True,'Namazın vâciblerinden değildir? … Fâtiha okumak, Ta’dîl-i erkân, Selâm vermek … (doğru: Kıyâmda durmak)',
  'Nemâzda her rek’atde Fâtiha okumak ve rükü’da, secdelerde tumânînet [sâkin durmak] farzdır','1-56',
  "Kitap 1-66'da hanefî vâciblerini sayar; ama 1-56'da (başka mezheb nakli içinde) Fâtiha ve tumânînet 'farzdır' diye geçer. Soru mezheb belirtmeden tek cevap dayatıyor.",
  "Soruyu 'Hanefî mezhebinde nemâzın vâciblerinden değildir?' diye sınırla.")
b('test / namaz / 7','Y',True,'Seferde (yolculukta) dört rekâtlık farz namazlar kaç rekât kılınır? → 2 rekât; açıklama: "iki rekât kılınacağı bildirilmektedir"',
  'Seferî olan kimsenin, dört rek’at olan farz nemâzları iki rek’at kılması hanefîde vâcib, mâlikîde sünnet-i müekkede, şâfi’îde efdaldir','1-65',
  'Kitap hükmü mezheblere göre ayırıyor; açıklama bunu tek hükme indirmiş.',
  'Açıklamayı kitabın bu cümlesiyle değiştir.')
b('test / namaz / 8','D',True,'Cenâze namazı dört tekbîr ile kılınır; rükû ve secdesi yoktur.',
  'Cenâze nemâzının farzı ikidir: ⏎ 1 — Dört kerre tekbîr getirmekdir. ⏎ 2 — Ayakda kılmakdır'.replace(' ⏎ ',' '),'3-57',
  "'rükû ve secdesi yoktur' cümlesi kitapta (3-57'de) bulunamadı; cevap kitabın tarifinden çıkarım. Doğru şık kitapla çelişmiyor.",
  "Açıklamaya kitabın 'Cenâze nemâzının farzı ikidir: 1 — Dört kerre tekbîr getirmekdir. 2 — Ayakda kılmakdır.' cümlesini koy.")
b('test / oruc / 1','D',True,"Kitapta Ramazan orucunun hicretten on sekiz ay sonra, Şa’bân ayının onuncu günü farz olduğu bildirilmektedir; bu, hicretin ikinci yılıdır.",
  'Oruc, hicretden onsekiz ay sonra, Şa’bân ayının onuncu günü, Bedr gazâsından bir ay evvel farz oldu','1-79',
  "'bu, hicretin ikinci yılıdır' sitenin hesabıdır; kitapta yıl adı geçmiyor. Şık kitapla çelişmiyor ama kitapta aynen yok.",
  'Açıklamada yalnız kitabın cümlesini ver; "hicretin ikinci yılı" eklemesini kitap cümlesi olarak sunma.')
b('test / zekat / 2','Y',False,'Zekât, nisâb miktarı malın ne kadarıdır? → Kırkta biri (yüzde 2,5)',
  None,'1-78',"Kitap kırkda biri para ve ticâret malı için söyler; hayvan ve toprak mahsûlünde (uşr) oran başkadır. Soru 'malın' diye genelleştiriyor.",
  "Soruyu 'Para ve ticâret malında' diye sınırla.")
b('test / zekat / 4','Y',True,"açıklama: gümüşün nisâbının ikiyüz dirhem-i şer’î, ya’nî 672 gram olduğu bildirilmektedir",
  'O hâlde, Hanefîde gümüşün nisâbı, 2800 kırât veyâ altıyüzyetmişiki [672] gramdır','1-78',
  "672 gram kitapta 'Hanefîde' kaydıyla verilir; aynı maddede başka hesapla 484 gram da geçer. Doğru şık (200 dirhem) kitapla aynı.",
  "Açıklamaya 'Hanefîde' kaydını kitaptaki gibi koy.")
b('test / namaz / 2','B',True,'Eûzü okumak ise sünnettir. (K1/M52)',
  'Sübhâneke okumak ve yalnız kılarken, Sübhâneke okudukdan sonra E’ûzü, Besmele okumak sünnetdir','1-64',
  "Eûzü'nün sünnet olduğu 1-52'de değil 1-64'te geçer.",'Atfı K1/M64 yap.')
b('test / hac / 5','Y',False,'Umre ile hac arasındaki fark nedir? → Umrede vakfe yoktur',
  'senenin her günü, ihrâm ile yapılan, tavâf ve sa’y yapmak ve saç kazımak veyâ kesmekdir','1-84',
  "Kitabın umre tarifiyle uyumlu (vakfe sayılmaz); ancak soru 'fark' tekil diye tek farkı dayatıyor; kitap umrenin hükmünü de mezheblere göre ayırır ('hanefî ve mâlikîde müekked sünnet, şâfi’î ve hanbelîde farzdır').",
  "Soruyu 'Kitaba göre umrede hangisi yoktur?' biçimine getir.")
b('test / (hepsi)','B',True,"'Namaz', 'Oruç', 'rekât', 'İman ve İtikat', 'Peygamber' konu adları ve şıklarında",
  None,None,"Kitap 'nemâz' (2 446 kez; 'namaz' hiç yok), 'oruc', 'rek’at', 'îmân', 'i’tikâd' yazar. Hürmet ifadeleri (sallallahü aleyhi ve sellem) yerinde.",
  'Soru ve şıklarda kitabın yazımını kullan (nemâz, oruc, rek’at, îmân).')

# ---------------- GÜNÜN SUÂLİ ----------------
S=json.load(open(f'{KOK}/gunun-sualleri.json'))['sualler']
ITIKAD={6:"vahdet-i vücûd adına 'hiçbir şeyi fenâ görmemek lâzım gelmez mi' itirazı",18:"şefâ’ati 'şirkin en çirkini' sayan itiraz",
 20:"meyyitin yalnız Resûlullahın sözünü işittiği itirazı",21:"hadîs-i şerîfin yanlış nakledilmiş olabileceği itirazı",
 48:"ru’yetullahı inkâr eden itiraz cümlesi (soru değil)",54:"'Dâr-ül-harbde … fâiz almak câizdir' öncülü",
 60:"'ârif, islâmiyyetden dışarı çıkmakdadır' cümlesi (soru değil)",62:"'başka sıfatları bulunan farklı bir ma’bûd dahâ bulunamaz mı?'",
 73:"'tesavvuf büyüklerinin bâtıl bir yolda bulundukları' cümlesi (soru değil)",78:"vahdet-i vücûda dair itiraz",
 86:"'mahlûkların zâtı, Zât-i ilâhîden başka değildir' cümlesi",87:"mahlûkun hakîkatinin Zât-i ilâhînin aynı olduğu itirazı",
 88:"Zât-i teâlâda değişiklik itirazı",111:"karşı tarafın '( … ) denirse' itirazı",123:"'vehhâbîleri de kardeş bilmemiz lâzım değil mi?' (kitapta 'ba’zı kimseler'in sözü)"}
BAGLAM={16:"'Böyle olan Evliyânın' (öncesine bağlı)",17:"'O zemân … Onu nereden bildi?' (öncesine bağlı)",23:"'… derse:' ile biter, soru değil",
 29:"'Fenâ ve Bekâyı soruyorsunuz.' soru değil",37:"'Bu eşyâya' (öncesine bağlı)",38:"soru değil, itiraz cümlesi",40:"'… denirse:' ile biter",
 46:"'… diyorsunuz.' (Reşehât sözü), soru biçimi yok",50:"'Onun varlığı' (öncesine bağlı)",51:"öznesi yok ('râzı olurlar mı?')",
 61:"'Demek ki' ile başlar",74:"'Bizden, bu ayn-ül-yakînin anlatılmasını istiyor' (öncesine bağlı)",84:"'Bu te’ayyün' (öncesine bağlı)",
 85:"'O mertebe' (öncesine bağlı)",89:"'… dedik' (öncesine bağlı)",118:"'O hâlde' ile başlar",132:"'O hâlde' ile başlar",139:"'… ise, niçin' (öncesine bağlı)"}
for i,s in enumerate(S,1):
    if i in ITIKAD:
        b(f'sual / {i}','Y',True,s['soru'][:300],None,s['madde'],
          f"Suâl kitapta aynen ve 'Süâl:'/itiraz olarak geçer; cevabı aynı maddede hemen ardındadır. Ancak tek başına (gün kartı, paylaş metni, görsel kart) gösterildiğinde kitabın reddettiği bir öncül kitabın sözü gibi okunabilir: {ITIKAD[i]}.",
          "Günün suâli listesinden çıkar ya da yanında kitabın cevâbının ilk cümlesini aynen göster.")
    elif i in BAGLAM:
        b(f'sual / {i}','Y',True,s['soru'][:300],None,s['madde'],
          f"Kitapta aynen var ama bağlamından koparılınca anlaşılmıyor: {BAGLAM[i]}.",
          "Kaldır ya da kitaptaki önceki cümleyle birlikte ver.")
b('sual / 12','B',True,S[11]['soru'],None,'1-73',
  "Suâl 1-73'te var (Süâl 1), fakat maddenin başlığı 'Nemâzda otururken parmak kaldırmak'tır; görsel kart 'Cevabı: Nemâzda otururken parmak kaldırmak' basıyor, bu Ravda suâlinin cevabı değildir.",
  "Kartta madde başlığını 'Cevabı:' etiketiyle değil, 'Madde:' etiketiyle bas.")
b('sual / (resmi: false, 65 kayıt)','Y',True,'resmi=false olan 65 suâl (91–155)',None,None,
  "Bu 65 cümle kitapta 'Süâl:'/'Cevâb:' bölümü değildir; akan metnin içindeki (çoğu cevabı kendinde olan) retorik soru cümleleridir (ör. 113: 'Değişen birşey devâmlı, sonsuz var olur mu?'). Sayfa ve kart bunları da 'Suâl' + 'Cevabını kitapta okuyun' diye sunuyor; kitapta ayrı bir cevap yok.",
  "Ya yalnız resmi=true (kitabın 'Süâl:' dediği 90 kayıt) kullan, ya da bunları 'Kitaptan bir soru' gibi ayrı etiketle göster.")
b('sual / (hepsi)','B',True,"'Günün Suâli', 'Suâl', 'suâller'",None,None,
  "Kitap bu kelimeyi her yerde 'süâl' yazar (Süâl 92, süâl 24 … kez; 'suâl' hiç yok).","Kitabın yazımı: 'Süâl'.")

# ---------------- ARAMA CEVAP ÖZETLERİ ----------------
A=json.load(open(f'{KOK}/arama.json'))['sorular']
def c(i): return A[i-1]['cevapOzet']
b('cevap / 8','K',True,c(8),'(Kur’ân-ı kerîmden kendi aklı ile, kendi düşüncesi ve bilgisi ile ma’nâ çıkaran kâfirdir)','1-8',
  "Kitap (hadîs-i şerîf olarak) kendi aklı ile ma'nâ çıkaranın 'kâfirdir' der; özet bunu 'büyük günahtır' diye hafifletmiş. 'büyük günah' ifadesi maddede yok.",
  "Özeti kitabın cümlesiyle değiştir: 'Kur’ân-ı kerîmden kendi aklı ile, kendi düşüncesi ve bilgisi ile ma’nâ çıkaran kâfirdir'.")
b('cevap / 16','K',True,c(16),'Bunun alâmeti de, Onun düşmanlarını düşman bilmek, Onu beğenmeyenleri sevmemekdir','1-15',
  "Maddede muhabbetin alâmeti olarak verilen şey başkadır; 'sevilenin isteklerine uymak' cümlesi 1-15'te yok.",
  'Özeti kitabın bu cümlesiyle değiştir.')
b('cevap / 39','K',True,c(39),'Bid’at, dinde sonradan yapılan şey demekdir. Peygamberimizin “sallallahü aleyhi ve sellem” ve dört halîfesinin “radıyallahü anhüm” zemânlarında bulunmayıp da, onlardan sonra, dinde meydâna çıkarılan, ibâdet olarak yapılmağa başlanan şeylerdir','1-34',
  "Kitabın tarifi 'dört halîfesinin zemânları'dır; özet 'Eshâb-ı kirâmın zamanından sonra' diyerek sınırı değiştirmiş. Ayrıca 'ibâdet olarak' kaydı düşmüş.",
  'Özeti kitabın tarifiyle aynen değiştir.')
b('cevap / 51','K',True,c(51),'Tekrâr bildirelim ki, gusl abdesti alırken ağzın içini yıkamak, hanefî ve hanbelî mezheblerinde farzdır','1-54',
  "Kitap mezheb farkını açıkça yazar: 'şâfi’î ve mâlikî mezheblerinde gusl abdesti alırken, ağzı, burnu yıkamak farz değildir'. Özet bir mezhebin hükmünü genel hüküm yapmış.",
  "Özete 'hanefî ve hanbelî mezheblerinde' kaydını kitaptaki gibi koy.")
b('cevap / 168','D',True,c(168),None,'3-2',
  "'Şirk, insan için en büyük tehlikedir' cümlesi 3-2'de yok. Özet, madde başlığındaki sayımı ('Şirk, insan için hayvan kesmek, hırsızlık, …' = şirk; insan için hayvan kesmek; …) yanlış okuyarak kurulmuş. 'insanin en buyuk gunahi' sorgusu da bu yanlış okumadan doğmuş.",
  "Kaldır ya da başlığı aynen ver; 'insanin en buyuk gunahi' ifadesini bu kayıttan çıkar.")
b('cevap / 3','Y',True,c(3),'Allahü teâlâya ve Resûlüne ve Onun Allahü teâlâdan getirdiklerinin hepsine inandım. Allahü teâlânın ve Resûlünün dostlarını severim ve düşmanlarını sevmem demek kâfîdir','1-3',
  "1-3'ün metni 'müslüman nasıl olunur' sorusuna bu cümleyle cevap verir; 'Kelime-i şehâdet söylenir; mânâsını bilip kalb ile inanmak şarttır' cümlesi bu maddenin metninde yok (Kelime-i şehâdet yalnız başlıkta).",
  'Özeti 1-3’teki cümleyle aynen değiştir.')
b('cevap / 11','Y',False,c(11),'Çünki îmân, kalbin tasdîk etmesi, kabûl etmesi, inanması demekdir','1-31',
  "Îmânın tarifi 1-3'te yok; 1-31'de var. 'iman nedir' sorgusu 1-3'e gidiyor.",
  "Maddeyi 1-31'e çevir ya da özeti 1-31'deki cümleyle ver.")
b('cevap / 14','Y',False,c(14),'İnsanların, âhıretdeki ni’metlere nâil olmamaları, Ondan yüzçevirdikleri içindir','1-13',
  "'âhirette ise yalnız mü'minlere verilir' cümlesi 1-13'te bu sözle yok; kitap sebebi 'yüzçevirmek' olarak anlatır.",'Özeti kitap cümlesiyle değiştir.')
b('cevap / 26 ve 89','B',True,c(26),'Bu kelâm-ı ilâhî olan Kur’ân mahlûk değildir','1-25',
  "'mahlûk değildir' 1-91'de yok, 1-25'tedir. 'kuran mahluk mu / kuran yaratilmis mi' sorguları 1-91'e gidiyor; ayrıca iki kayıt aynı cümleyi tekrar ediyor.",
  "89. kaydın maddesini 1-25 yap; 26 ile 89'u birleştir.")
b('cevap / 62','Y',True,c(62),'Seferî olan kimsenin, dört rek’at olan farz nemâzları iki rek’at kılması hanefîde vâcib, mâlikîde sünnet-i müekkede, şâfi’îde efdaldir','1-65',
  'Mezheb farkı kaybolmuş.','Özetin ikinci yarısını kitabın cümlesiyle değiştir.')
b('cevap / 69','Y',True,c(69),'iki rek’at bayram nemâzı kılmak, erkeklere vâcibdir','1-72',
  "Kitapta 'erkeklere' kaydı var; özet düşürmüş.","'Bayram nemâzı kılmak, erkeklere vâcibdir' yap.")
b('cevap / 79','Y',True,c(79),'Şâfi’îlerin Hanefî mezhebini taklîd ederek, mal yerine nakd vermeleri ve yedi sınıfın hepsine değil de, diledikleri bir veyâ birkaç sınıfa vermeleri câiz olacağı','1-78',
  "1-78 'yedi sınıf' der; 'sekiz sınıf' 1-35'te şâfi’î mezhebi anlatılırken geçer ve orada 'hanefî mezhebinde, bu sınıflardan herhangi birine vermek yetişir' denir. Özet bunları vermiyor. 'zekat kimlere farz' sorgusu da bu cevaba gidiyor ama cevap onu karşılamıyor.",
  "Özeti 1-78/1-35 cümleleriyle ver; 'zekat kimlere farz' ifadesini 77. kayda taşı.")
b('cevap / 83','Y',False,c(83),'Nezrin yerine getirilmesini islâmiyyet emr etmekdedir. Getirilmezse, günâh olur','1-82',
  "Madde 'günâh olan adaklar'ı da anlatır; özet 'adağı yerine getirmek vâcibdir' diyerek bunu kayıtsız bırakıyor.",'Özete kitabın cümlesini koy.')
b('cevap / 9','Y',True,c(9),'Kur’ân-ı kerîmden ve hadîs-i şerîflerden çıkarılan ilmler içinde, kıymetli ve doğru olan, yalnız (Ehl-i sünnet) âlimlerinin anladıkları ve bildirdikleridir','1-9',
  "Madde bir meâl adı vermez; 'hangi meal guvenilir' sorgusuna 'hangisine güveneceği bildirilmektedir' cevabı, maddede bir meâl önerisi var izlenimi veriyor.",'Özeti kitabın cümlesiyle değiştir.')
b('cevap / 17','Y',True,c(17),None,'1-16',"'peygamberimizin hayati' sorgusu 1-16'ya (Allahü teâlânın sevgilisi) gidiyor; hayâtı 1-95'te (Hilye, siyer) anlatılır.",
  "'peygamberimizin hayati' ifadesini 91. kayda (1-95) taşı.")
b('cevap / 90','Y',True,c(90),None,'1-94',"'allahin sifatlari' sorgusu 1-94'e gidiyor; sıfatlar başlıkta 2-54 ('Rûhların hâzır olması. Allahü teâlânın sıfatları') ve 3-39'dadır.",
  "'allahin sifatlari' ifadesini kaldır ya da 2-54'e bağla.")
for grup in [(40,41,93),(107,120),(166,167),(207,212),(219,224),(92,105)]:
    b('cevap / '+' ve '.join(map(str,grup)),'B',True,c(grup[0]),None,A[grup[0]-1]['madde'],'Aynı madde ve aynı (ya da neredeyse aynı) cevap özeti birden çok kayıtta yineleniyor.','Kayıtları birleştir, ifadeleri tek kayıtta topla.')
b('cevap / (hepsi, ~190 kayıt)','Y',True,"'… anlatılmaktadır', '… bildirilmektedir' biçimindeki özetler",None,None,
  "Arama penceresi bunları 'Bu suâlin cevabı' başlığıyla gösteriyor, oysa çoğu cevap değil, madde başlığının yeniden yazılmışıdır (ör. 142: 'Tütün ve sigara içmenin hükmü ele alınmaktadır'). Okuyucuya cevap verilmiş izlenimi doğuyor.",
  "Başlığı 'İlgili madde' yap; özet yerine kitabın başlığını aynen göster.")
b('cevap / (hepsi)','B',True,"namaz, müslüman, itikad, kabir, dert, oruç, fıkıh, yani …",None,None,
  "Özetler kitabın yazımını kullanmıyor (kitapta 'nemâz', 'müslimân', 'i’tikâd', 'kabr', 'derd', 'oruc', 'fıkh', 'ya’nî').",'Kitabın yazımına çevir ya da kitabın başlığını aynen göster.')

# ---------------- REHBERLER ----------------
b('rehber / (hepsi)','Y',True,"'kitabın sırasıyla adım adım' (rehberler.js, giris.js, namaz rehberi açıklaması)",None,None,
  "8 rehberin 8'inde de madde sırası kitabın sırası değil (namaz: 1-57→1-51, 1-76→1-65, 3-57→1-75; îmân: 8 geri dönüş; ahlâk: 9).",
  "'kitabın sırasıyla' ifadesini kaldır ya da maddeleri kitap sırasına diz.")
b('rehber / iman-rehberi','Y',True,'İman ve İtikat Rehberi — Îmânın Esâsları bölümü','Âhırete inanmak, Allahü teâlâya inanmak gibi, îmânın şartıdır','1-46',
  "Îmânın esâslarını (âhıret, kabr, Münker-Nekîr …) toplu anlatan 1-46 bu rehberde yok (yalnız zekât rehberinde); kabr azâbı maddeleri 1-40, 2-20 de yok. Rehber 'bu konuyu öğrenmek için yeter' izlenimi veriyor.",
  "1-46'yı (ve 1-40, 2-20'yi) 'Îmânın Esâsları' bölümüne ekle.")
b('rehber / yeni-musluman','Y',True,'Yeni Müslümanlar İçin Rehber','(İslâmın binâsı beş direk üzerine kurulmuşdur','1-46',
  "İslâmın beş şartını ve îmânı toplu anlatan 1-46 rehberde yok.",'1-46’yı ekle.')
b('rehber / zekat-rehberi','B',True,"1-46 notu: 'Îmân, ibâdetler ve lüzûmlu nasîhatler (islâmın beş şartı)'",None,'1-46',
  "Rehberdeki 'not' madde başlığı sayılıyor (VERI.md) ama burada başlığa sitenin eki konmuş. Ayrıca 'Kurban, Adak ve Yemîn' bölümündeki 1-83 (yemîn) zekâtla ilgili değil.",
  "Notu başlığın aynısı yap; 1-83'ü çıkar ya da bölüm adını düzelt.")
b('rehber / hac-rehberi','Y',True,"Kabr-i Şerîfin Ziyâreti → 2-18; Yolculuk Hükümleri → 1-53",None,'2-18',
  "2-18 kabr ziyâretini genel olarak (şefâ'at, ölülere yardım) anlatır; kabr-i şerîfin ziyâreti 1-84'ün içindedir. 1-53 (mest üzerine mesh) hac maddesi değildir. Açıklamadaki 'şartları, farzları, vâcibleri, sünnetleri; ihrâm, tavâf, sa’y, umre' yalnız 1-84'tedir.",
  "Bölümleri 1-84 merkezli kur; 2-18 ve 1-53'ü çıkar ya da 'ilgili' diye ayır.")
b('rehber / oruc-rehberi','B',True,"açıklama: 'terâvih namazı'",None,None,"Kitap 'nemâz' yazar. Rehber oruç için tek madde (1-79) içerir; imsâk vaktinin anlatıldığı 1-60 yok (kesin değil: eksiklik sayılmayabilir).",
  "Yazımı düzelt; 1-60'ı eklemeyi düşün.")
b('rehber / (adlar)','B',True,"Namaz Rehberi, Oruç ve Ramazan Rehberi, İman ve İtikat Rehberi, Yeni Müslümanlar İçin Rehber",None,None,"Kitap: nemâz, oruc, Ramezân, îmân, i’tikâd, müslimân.",'Kitabın yazımını kullan.')

# ---------------- KONULAR / KISIMLAR / BAŞLIKLAR ----------------
b('konu / iman','Y',False,"İman ve İtikat: 2-31, 2-32, 2-33 (atom), 3-54 (hüceyre, mikrop), 1-28, 1-44 (sünnet/farz çeşitleri), 1-18 (evlâd terbiyesi)",None,None,
  "Bu maddeler başlıklarına göre îmân/i’tikâd konusu değil (fen, fıkh, terbiye). Kesin değil: atom/madde maddeleri kitapta yaratıcının varlığına delîl olarak anlatılır.",'Ayrı bir "Fen ve din" konusu aç ya da çıkar.')
b('konu / zekat','Y',True,"Zekât, Kurban ve Adak: 1-83 (Yemîn …)",None,'1-83',"Yemîn zekâtla ve konunun adıyla ilgili değil.",'Konu adına Yemîn ekle ya da 1-83’ü çıkar.')
b('konu / hac','Y',True,"Hac ve Umre: 2-18 (Kabr ziyâreti lâzımdır …)",None,'2-18',"2-18 genel kabr ziyâreti / şefâ'at maddesidir, hac değil.",'Çıkar.')
b('konu / cenaze','Y',True,"Cenaze ve Miras: 3-67, 3-68, 3-69 (dünyâ sıkıntıları, kazâya rızâ, sevgiliden gelen sıkıntı)",None,None,"Başlıklara göre ahlâk/tesavvuf konusu.",'Ahlâk ve Tasavvuf’a taşı.')
b('konu / ahlak','Y',False,"Ahlâk ve Tasavvuf: 2-41, 2-42, 2-43, 2-46 (harâm yiyecek/içki, tütün, hasta yemekleri), 2-56 (tenâsüh)",None,None,"Fıkhî hüküm ve i’tikâd maddeleri ahlâk konusuna konmuş (kesin değil: sınıflama tercihidir).",'Gözden geçir.')
b('konu / (adlar)','B',True,"Namaz; Oruç, Takvim …; İman ve İtikat; Aile Hukuku; Ticaret, Muâmelât ve Ukûbât",None,None,"Kitap: nemâz, oruc, îmân, i’tikâd.",'Kitabın yazımını kullan.')
F=json.load(open(f'{KOK}/fihrist.json'))
b('konu / kisim-aciklamalari','B',True,' | '.join(k['aciklama'] for k in F['kisimlar']),'İKİNCİ KISM','2-1',
  "Açıklamalar sitenin yazısıdır ve kitabın yazımına uymaz (İman, itikadı, namaz, oruç, Tefsir, hadis, fıkıh, mezhepler, helâl-haram, kabir, ceza hukuku); kitap kısımlara 'KISM' der ('İKİNCİ KISM', 'ÜÇÜNCÜ KISM'). İçerik kabaca doğru ama eksik: I. kısımda tesavvuf (1-50), emr-i ma’rûf (1-41), takvîm (1-86–89), Îsâ aleyhisselâm (1-92, 1-93), Kur’ân-ı kerîm (1-25, 1-91) anılmıyor.",
  "Kitabın yazımına çevir; ya da kısım adının altında açıklama yerine o kısmın ilk birkaç madde başlığını aynen ver.")
b('konu / madde-basliklari','B',False,"fihrist.json maddeler[].baslik (241)",None,None,
  "Metninde kendi başlık satırı olan 104 maddenin yalnız 12'sinde fihrist başlığı metindeki başlıkla aynı; 92'sinde genişletilmiş (ör. 1-52 metin 'NEMÂZIN FARZLARI (ABDEST ALMAK)', fihrist 'Abdest almak. Abdesti bozan şeyler'; 2-18 metin 'ŞEFÂ’AT, ÖLÜLERE YARDIM', fihrist 'Kabr ziyâreti lâzımdır. Olgun rûhlardan istifâde edilir'; 2-21 metin 'BOZUK DİNLER'; 2-17 'VEHHÂBÎLİK NEDİR?'; 2-27 'İSLÂM DÎNİ'; 2-39 'İSLÂMİYYET VE KADIN'). 137 maddede metinde başlık yok (mektûb künyesi ya da doğrudan metin). Başlıklar eski sitenin data.js'inden geliyor; üslûpları kitabınkine benziyor, büyük ihtimalle kitabın basılı fihristindendir, ama fihrist sahîfeleri elimizdeki metinde olmadığından doğrulanamadı.",
  "Basılı kitabın fihrist sahîfeleriyle (PDF) 241 başlığı karşılaştır; tutmayanları kitabınkiyle değiştir.")

# ---------------- ÖZETLER ----------------
O=json.load(open(f'{KOK}/ozetler.json'))['ozetler']
b('konu / ozetler','Y',True,'ozetler.json (241)',None,None,
  "237'si maddenin başından kelime kelime alınmış; 209'u cümle ortasında '…' ile kesiliyor; 87'si mektûbun künye/tanıtım cümlesiyle ('Bu mektûb, … yazılmışdır:') başlıyor. Bunlar 'özet' değil, 'maddenin başı'dır; 'özet' adı içeriği özetlediği izlenimini verir.",
  "Adını 'Maddenin başından' / 'İlk satırlar' yap; cümle sonunda kes.")
b('konu / ozetler / 1-51','B',True,O['1-51'],'Her müslimânın, otuzüç farzı bilmesi lâzımdır. Otuzüç farz şunlardır:','1-51',
  "Aradaki cedvel (Îmânın şartı ALTI … Teyemmümün farzı ÜÇ) atlanınca 'Otuzüç farz şunlardır: Teyemmümün farzına iki diyenler de vardır' diye anlamsız bir ek oluşmuş.",'Özeti cedvelden önce kes.')
b('konu / ozetler / 3-61','B',True,O['3-61'],None,'3-61',"Metindeki başlık satırının yarısı ('RESÛLULLAHIN (Sallallahü aleyhi ve sellem)') özete karışmış, 'TA’ZİYE MEKTÛBU' düşmüş.",'Başlık satırlarını atla.')
b('konu / ozetler / 2-4, 2-5','B',True,O['2-4'][:120],None,'2-4',"Paragraf sınırında 'Efendim,' satırı düşürülüp iki paragraf birleştirilmiş; metin kelime kelime aynı değil.",'Paragraf sınırında kes.')

# ---------------- EŞ ANLAMLILAR ----------------
E=[('mest','mest, mesh','Mest bir giyecektir; mesh bir fiildir (mest üzerine mesh, başa mesh). Mest arayana başa mesh ve teyemmüm geçen yerler de çıkar.','Y',True,"'mesh'i 'mest' anahtarından çıkar."),
 ('icki','icki, serab','Y',None,None),
]
EA=[
 ('mest','mest → mest, mesh',"Mest bir giyecek, mesh bir fiildir; 'mest' arayan başa mesh ile ilgili yerleri de görür.",'Y',True,"'mesh'i çıkar.",None,None),
 ('icki','icki → icki, serab; serab → serab, icki; alkol → alkol, serab',"Kitap şerâbı içkilerin biri sayar ve hükmünü ayrı verir.",'Y',True,"Şerâbı 'içki'nin eşi yapma; tek yönlü (şerâb → içki) bırak.",'İçmesi harâm olan içkiler, dörtdür: 1 — Birincisi, şerâbdır','2-42'),
 ('bosanma','bosanma → bosanma, talak, hul',"Kitap talâk ile hul’ü ayrı başlıklarda anlatır ('İslâmiyyetdeki talâk. Hul’. Zihâr…').",'Y',False,"'hul'u çıkar.",None,None),
 ('sahur','sahur → sahur, seher',"Sahur yemek, seher vakittir.",'Y',False,"'seher'i çıkar.",None,None),
 ('et','et → et, yimek',"'et' (yiyecek) ile 'yimek' (fiil) ayrı; ayrıca 'et' kısaltması 'etmek' gibi çok sık kelimelere de uyabilir.",'B',True,'Kaldır.',None,None),
 ('kira','kira → kira, ucret',"Kitap başlığında ayrı geçer ('Kirâ, ücret, işçilik').",'Y',False,'Gözden geçir.',None,None),
 ('peygamberimiz / resulullah','peygamberimiz → … muhammed; resulullah → resulullah, muhammed',"'muhammed' kitapta İmâm-ı Muhammed, Muhammed Ma’sûm, Muhammed Bâkî gibi başka zâtları da gösterir; arama onlara da gider.",'Y',True,"'muhammed'i çıkar.",None,None),
 ('peygamber','peygamber → peygamber, resul, resulullah, nebi',"Kitap resûl ile nebîyi ayırır: 'Resûllere tâbi’ olan bu Peygamberlere de, (Nebî) denir'. Peygamber anahtarı altında toplanması kabul edilebilir; resûl↔nebî doğrudan eşitlenmemeli.",'Y',False,'Resûl ve nebî anahtarlarını ayrı tut.','Resûllere tâbi’ olan bu Peygamberlere de, (Nebî) denir','1-1'),
 ('tesettur / avret','tesettur → tesettur, setr; avret → avret, setr',"Setr-i avret (nemâzda ve dışında avret yerini örtmek) ile kadınların örtünmesi kitapta aynı maddede ama ayrı hükümlerle anlatılır.",'Y',False,'Gözden geçir.',None,None),
 ('mufsid','mufsid → mufsid, bozar',"'bozar' çok genel; abdesti, orucu, nikâhı, nemâzı bozan her yer gelir.",'Y',False,"'bozar'ı çıkar.",None,None),
 ('ukubat','ukubat → ukubat, ceza',"'ceza' kitapta âhıret cezâsı, ta’zîr, keffâret için de geçer.",'Y',False,'Gözden geçir.',None,None),
 ('asure','asure → asure, muharrem','Âşûrâ bir gün, Muharrem bir aydır.','Y',False,"'muharrem'i çıkar.",None,None),
 ('hanefi','hanefi → … imami azam','Mezheb ile imâm eşitlenmiş; imâm-ı a’zam arayan bütün hanefî geçen yerleri görür.','Y',False,'Ayır.',None,None),
 ('kelime i sehadet','kelime i sehadet → kelime i sehadet, sehadet',"'şehâdet' kitapta şehîdlik ve şâhidlik için de geçer.",'Y',False,"'sehadet'i tek başına koyma.",None,None),
 ('nafile namaz','nafile namaz → nafile nemaz, nafile',"'nâfile' hac, oruc, sadaka için de geçer.",'Y',False,"'nafile'yi tek başına koyma.",None,None),
 ('(bozuk anahtarlar)','kuran → kur; rekat → rek; tadili erkan → dil erkan; tazir → zir; siilik → ilik; mucize → cize; itaat → ita; itikad → tikad; sefaat → sefa; cemaat → cema; cuma → cum; emri bil maruf → emr ruf; bid at → bid; gunah → gunah midir',
  "Kesme işaretinden bölünme ile oluşmuş parça kelimeler; 'kur', 'rek', 'dil', 'zir', 'ilik', 'sefa', 'cum' gibi parçalar ilgisiz kelimelere (kurban, kurtulmak, dil, zir, ilik…) uyabilir.",'B',True,'Bu parçaları sil, kelimenin tamamını koy.',None,None),
]
for k,der,ac,s,kes,on,kit,md in EA:
    b('es-anlam / '+k,s,kes,der,kit,md,ac,on)

# ---------------- ARAYÜZ ----------------
U=[
 ('hukumler.js / Kitaptaki hükümler yedi türe ayrılmıştır','K',True,'“${tur}” adında bir hüküm türü bulunmuyor. Kitaptaki hükümler yedi türe ayrılmıştır; aşağıdaki fihristten seçebilirsiniz.',
  '(Ef’âl-i mükellefîn) sekizdir. Farz, vâcib, sünnet, müstehab, mubâh, harâm, mekrûh, müfsid','1-1',"Kitap sekiz der; yedi tür sitenin sınıflamasıdır (müfsid yok).","'Bu dizinde hükümler yedi türe ayrılmıştır' yap; kitaba nisbet etme."),
 ('fevaid.js / Kitapta geçen farz, vâcib, sünnet','B',True,'Kitapta geçen farz, vâcib, sünnet, müstehab, mübah, mekruh ve haram hükümler; her cümle kitaptaki yerine bağlı.',
  '(Ef’âl-i mükellefîn) sekizdir. Farz, vâcib, sünnet, müstehab, mubâh, harâm, mekrûh, müfsid','1-1',"Yazım kitaba uymuyor (mubâh, mekrûh, harâm); müfsid yok.","Kitabın sayımı ve yazımıyla ver."),
 ('giris.js / Farz, vâcib, sünnet, mekrûh, harâm; her hüküm','Y',True,'Farz, vâcib, sünnet, mekrûh, harâm; her hüküm kitaptaki cümlesiyle',None,None,
  "VERI.md §8: 42 hüküm kaydının metni maddede aynen geçmiyor. 'her hüküm' abartı. hukumler.js:22 'Her hüküm kitaptaki cümlesiyle verilir' de aynı.","42 kayıt düzeltilinceye kadar 'her' kelimesini kaldır."),
 ('fevaid.js / Kitaptan sorularla öğrendiklerinizi','Y',True,"Bilgi testi: 'Kitaptan sorularla öğrendiklerinizi yoklayın.' · test.js: 'Se’âdet-i Ebediyye’den alınmış sorularla …; her cevap kitaptaki yeriyle.' · 'Okuduklarınızı kitaptan alınmış sorularla tekrar edin.' · giris.js: 'Okuduklarınızı kitaptan alınmış suâllerle tekrar edin'",None,None,
  "Test soruları kitaptan alınmış değil, kitaba dayanarak sitece yazılmıştır; açıklamaların bir kısmı kitapta aynen yok (test/namaz/8, test/oruc/1) ya da yanlış maddeye atıflı (test/iman/3).","'Kitaba dayanan sorularla' yap ve 'sorular sitece hazırlanmıştır' notu ekle."),
 ('hakkinda.js / Yorum yok, tefsir yok, kendi aklımızdan','Y',True,'Yorum yok, tefsir yok, kendi aklımızdan bir şey yok. Kitaba bir harf eklenmedi, bir harf çıkarılmadı. … yapılan tek şey, kitaptaki bilgiyi olduğu gibi sunmak ve ulaşılabilir kılmaktır.',None,None,
  "Kitabın metni için doğru (metin bayt bayt aynı). Ama site kendi yazdığı metinler de sunuyor: aramada 'Bu suâlin cevabı' özetleri, bilgi testi soruları ve açıklamaları, rehber/konu/kısım açıklamaları, tablo verileri. Bunlar 'kendi aklımızdan' yazılmıştır; cümle bunları istisna etmiyor.","'Kitabın metnine bir harf eklenmedi…' diye metinle sınırla ve derlemelerin sitece hazırlandığını ayrıca yaz."),
 ('gunun.js / Cevabını kitapta okuyun','Y',True,"Sayfa: 'Suâl' + 'Cevabını kitapta okuyun'; kart: 'SUÂL' … 'Cevabı: <madde başlığı>'; fevaid.js: 'cevâbı ilgili maddededir'; hakkinda.js: 'cevabı, bağlantısı verilen maddededir'",None,None,
  "90 resmî suâlde doğru (cevâb aynı maddede, hemen ardından). 65 retorik soruda kitapta ayrı bir cevâb yok. Kartta 'Cevabı:' etiketiyle madde başlığı basılıyor; başlık cevap değildir (sual/12).","Kartta 'Cevabı:' yerine 'Madde:' yaz; retorik soruları ayır."),
 ('rehberler.js / kitabın sırasıyla adım adım','Y',True,"'Bir konuyu kitabın sırasıyla, adım adım okumak için hazırlanmış yollar.' · giris.js: 'Bir konuyu kitabın sırasıyla adım adım okuma yolları' · fevaid.js: 'bir konuyu baştan sona takip edin'",None,None,
  "8 rehberin hiçbiri kitap sırasında değil; asıl maddeler eksik (1-46). 'baştan sona' yeterlilik izlenimi veriyor.","'kitabın sırasıyla' ve 'baştan sona'yı kaldır."),
 ('hakkinda.js / Namaz, oruç, hac, zekât, iman','B',True,'Namaz, oruç, hac, zekât, iman, ahlâk, aile ve yeni Müslümanlar için hazırlanmış … adım adım rehber',None,None,'Kitap: nemâz, oruc, îmân, müslimân.','Kitabın yazımını kullan.'),
 ('giris.js / her kelimesini lügatiyle','Y',False,'Kitabın tamamını okuyun, sesli dinleyin; her kelimesini lügatiyle, her hükmünü kaynağıyla araştırın.',None,None,"'her kelimesini' abartı olabilir (lügat bütün kelimeleri kapsamaz; kesin değil, lügat denetimi bu parçanın dışında).",'"kelimelerini lügatiyle" yap.'),
 ('ayet-hadis.js / Her kayıt kitaptaki sahîfesine ve maddesine bağlıdır','B',True,'Her kayıt kitaptaki sahîfesine ve maddesine bağlıdır.',None,None,"VERI.md §7: 3 âyet ve 4 hadîs kaydında madde null (yalnız sahîfe). hakkinda.js 'tıklayınca maddenin tam o yerine gider' de aynı.",'"Her kayıt kitaptaki sahîfesine bağlıdır" yap.'),
 ('tablolar.js / Her biri kitaptaki kaynağına, maddesine ve sahîfesine bağlıdır','B',True,'Kitabın konularından derlenmiş tablolar, listeler ve şemalar. Her biri kitaptaki kaynağına, maddesine ve sahîfesine bağlıdır.',None,None,"VERI.md: 3 tabloda kaynakMadde null. tablolar.js'deki 'Bu tablo kitabın ilgili yerinden derlenmiştir; hükmün aslı için kitabın ifadesi esastır.' notu yerinde.",'"Her biri" → "Çoğu".'),
 ('fevaid.js / Kitaptan Derlenenler (eski Fevâid)','B',True,"Sayfa adı kodda 'Kitaptan Derlenenler' (yorumda 'eski adı Fevâid'); konsol iletisinde 'Fevâid sayısı alınamadı'; adres /fevaid",None,None,"Bölüm adı kodda değişmiş; adres ve iç adlar 'fevaid' kalmış. Ad kararı için bkz. raporda §9.",'Ad kararı verilince adres yönlendirmesiyle birlikte değiştir.'),
]
for k,s,kes,der,kit,md,ac,on in U:
    b('arayuz / '+k,s,kes,der,kit,md,ac,on)

json.dump(B,open(OUT,'w'),ensure_ascii=False,indent=1)
from collections import Counter
print(len(B),Counter(x['sinif'] for x in B))
