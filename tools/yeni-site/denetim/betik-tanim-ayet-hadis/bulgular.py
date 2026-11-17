# Bulgu listesini kurar; her "kitap" alıntısının maddede AYNEN geçtiğini doğrular. Çıktı: ../tanim-ayet-hadis.json
import json, re, os
KOK='../../../../veri/'
D=json.load(open('tarama.json'))
def M(mid): return json.load(open(KOK+f'madde/{mid}.json'))['metin']
def kes(mid, bas, son=None, n=None):
    m=M(mid); i=m.find(bas); assert i>=0, (mid,bas)
    if son is None: return m[i:i+n] if n else bas
    j=m.find(son,i); assert j>=0,(mid,son); return m[i:j+len(son)]
B=[]
def ekle(kimlik,sinif,kesin,derleme,kitap,madde,sahife,aciklama,oneri):
    if kitap is not None and madde: assert kitap in M(madde), (kimlik,kitap[:60])
    B.append(dict(kimlik=kimlik,sinif=sinif,kesin=kesin,derleme=derleme,kitap=kitap,madde=madde,sahife=sahife,aciklama=aciklama,oneri=oneri))
T=D['tanim']; A=D['ayet']; H=D['hadis']
def tk(n): t=T[n]; return f"tanim / {t['terim']} / s.{t['sahife']}"
# ---------------- TANIMLAR
# 1) parantez içinden başlayan (kesik) cümleler — betikle
for t in T:
    c=t['cumle']
    if t.get('bulunan') and re.match(r'^[^()]*\)',c) and t['once'].endswith('('):
        pass
        ekle(tk(t['n']),'B',True,c,'('+c,t['bulunan'],t['sahife'],
             'Cümle, kitapta bir kaynak adının açılış parantezinden sonra başlıyor; açılış "(" düşmüş, kapanış ")" kalmış (yarım parantez).',
             'Cümleyi kitaptaki açılış parantezi ile birlikte alın: "('+c[:60]+'…"')
x=T[6]; ekle(tk(6),'B',True,x['cumle'],kes('1-1','Bu emr ve yasakların hepsine','müfsid.'),'1-1',18,
   'Tanım cümlesine bir sonraki paragrafın "(Ef’âl-i mükellefîn) sekizdir…" cümleleri de katılmış (iki paragraf tek kayıtta). Ayrıca "Bu emr ve yasaklar" önceki cümlelere bağlı.',
   'Şu ifadeyle değiştir: "Bu emr ve yasakların hepsine (Ahkâm-ı ilâhiyye) veyâ (Ef’âl-i mükellefîn) ve (Ahkâm-ı islâmiyye) denir."')
x=T[219]; ekle(tk(219),'B',True,x['cumle'],kes('2-59','4 — Fâsıklardan','demekdir.'),'2-59',748,
   'Kayıt, kitapta ayrı numaralı iki maddeyi (3 — Firâset, 4 — İstidrâc) birleştiriyor; "İstidrâc" teriminin altında "Firâset" tanımı da duruyor.',
   'Şu ifadeyle değiştir: "Fâsıklardan, günâhı çok olanlardan zuhûr ederse (İstidrâc) denir ki, derece derece, kıymetini indirmek demekdir."')
x=T[425]; ekle(tk(425),'Y',True,x['cumle'],kes('2-47','Süâl — İnsanın elinde','boğulmuşdur.'),'2-47',680,
   'Kitap bir süâlin adını veriyor ("Bu süâle … denir"); terim bir kavram tanımı değil. Süâl ve Cevâb iki paragraf tek cümle gibi birleştirilmiş; terim ("Şerî’atde tevhîd, tevhîdde şerî’at") kitapta bu biçimde birleşik yazılmamış.',
   'Ya kaldır ya terimi kitaptaki gibi "(Şerî’atde tevhîd) ve (Tevhîdde şerî’at)" yaz ve süâl cümlesini ayrı tut.')
x=T[46]; ekle(tk(46),'Y',True,x['cumle'],kes('1-58','Peygamberimiz, (İbâdetleri benden','buyurdu.'),'1-58',169,
   'Bu tanım kitabın kendi cümlesi değil; kitap onu bir hadîs-i şerîf içinde, Peygamberimizin sözü olarak veriyor. "Kitabın Kendi Tanımları" başlığı altında ve bağlamsız durunca söyleyen belirsizleşiyor. (Bu söz âyet-hadîs indeksinde de yok.)',
   'Kaydı tanımlardan çıkarın ya da "Peygamberimiz … buyurdu" çerçevesiyle verin; sözü hadîs indeksine ekleyin.')
x=T[55]; ekle(tk(55),'Y',True,x['cumle'],kes('2-46','İnsanın derisi bir yere sıkışınca','(Contüsion) denir.'),'2-46',675,
   '"Buna" sözü önceki cümlelere (deri sıkışınca kan toplanıp morarması) bağlı; kayıt "Çok acır, sızlar"dan başladığı için tanımın asıl içeriği düşmüş.',
   'Şu ifadeyle değiştir: "İnsanın derisi bir yere sıkışınca, ezilince, oraya kan toplanır. Morarır. Çok acır, sızlar. Buna (Ezik) veyâ (Contüsion) denir."')
x=T[107]; ekle(tk(107),'B',True,x['terim'],kes('3-4','Fülûs, felsler demekdir.','(pul) denir.'),'3-4',796,
   'Kitapta kelime "fels"tir ("felsler"); "felse" ismin -e hâlidir ("Bir felse … denir"). Terim yanlış çıkarılmış; cümle de tanım değil, karşılık veriyor.',
   'Terimi kitaptaki yazımla "Fels" yapın ya da kaydı "Fülûs" tanımıyla birleştirin.')
x=T[229]; ekle(tk(229),'Y',True,x['cumle'],kes('1-70','Fekat, Kur’ân-ı kerîmde ve hadîs-i şerîflerde açıkca bildirilen',' (Kâfir) denir.') if False else None,None,None,'','')
B.pop()
m=M('1-70'); i=m.find(x['cumle'][:60]); pre=m[max(0,i-200):i]
k=m[m.rfind('. ',0,i-2)+2:i+len(x['cumle'])+len(' denir.')-len(' denir.')]
ekle(tk(229),'Y',True,x['cumle'],m[m.rfind('. ',0,i-2)+2:i]+x['cumle'],'1-70',252,
   'Kayıt "Fekat" ile başlıyor; kitap hemen önce Ehl-i kıbleye kâfir denmeyeceğini söyleyip ardından bu özel durumu bildiriyor. Bağlamsız durunca "Kâfir"in genel tanımı gibi okunuyor; oysa kitap genel tanımı başka yerde veriyor (ör. "Müslimân olmıyana (Kâfir) denir").',
   'Önceki cümleyle birlikte verin (kitaptaki ifade alıntıda) ya da terimi "Kâfir (Ehl-i kıble için)" gibi daraltın.')
x=T[223]; ekle(tk(223),'Y',True,x['cumle'],'('+x['cumle'],'2-17',474,
   'Bu bir terim tanımı değil, bir âyet-i kerîme ifadesinin ma’nâsının açıklaması.','Tanımlar listesinden kaldırın (âyet indeksinde ele alınmalı).')
x=T[478]; ekle(tk(478),'Y',True,x['cumle'],x['cumle'],'2-5',413,
   'Tanım, mektûbu yazan kişinin muhatabından naklettiği söz ("…denir, dediklerini yazıyorsunuz"); kitabın (mektûb sâhibinin) kendi tanımı değil, karşı tarafın sözü.','Kaldırın ya da nakil olduğunu belirtin.')
x=T[66]; ekle(tk(66),'Y',False,x['cumle'],'['+x['cumle'],'1-1',17,
   '"Ona" zamiri önceki cümledeki Muhammed aleyhisselâmı gösteriyor; tek başına okununca kime tâbi’ olunduğu belli değil. Ayrıca köşeli parantez açılışı düşmüş.','Cümleyi önceki cümleyle birlikte verin.')
x=T[305]; ekle(tk(305),'Y',False,x['cumle'],x['cumle'],'1-89',360,'"Bu hâlde iken" önceki cümledeki (İctimâ’ı neyyireyn) hâline bağlı; bağlamsız eksik.','Önceki cümleyle birlikte verin.')
x=T[319]; ekle(tk(319),'B',True,x['terim'],x['cumle'],'1-67',231,'Kitapta terim "(Müfsidleri)" biçiminde geçiyor; derleme "Müfsidler" yazmış.','Terimi kitaptaki biçimle yazın ya da kitapta geçen yazımı not edin.')
x=T[21]; ekle(tk(21),'B',False,x['terim'],x['cumle'],'1-57',162,'Kitapta terim "(artık)"; "(su)" eki derlemenin.','Terimi "Artık" yapın; açıklayıcı ek gerekiyorsa terimden ayırın.')
# Başlık
ekle('tanim / (sayfa başlığı) / s.17','Y',True,'Kitabın Kendi Tanımları (Tüm Kısımlar)',None,None,17,
   '510 kaydın yaklaşık 53’ü kitabın başka eserlerden naklettiği cümleler (Mecelle, Hadîka, Redd-ül-muhtâr/İbni Âbidîn, Kâmûs-ül-a’lâm, Müncid, Hasîb beğ Kozmografya vb.); biri bir hadîs-i şerîf içindeki söz (Bid’at ehli), biri muhatabın mektûbundan nakil (Ulûm-i islâmiyye), biri âyet açıklaması (İ’tibâr ediniz), birkaçı süâl adı/karşılık. Ayrıca liste kitaptaki "(…) denir/demekdir" kalıbının yalnız bir kısmını kapsıyor (betik kitapta ~627 kalıp saydı). "Kendi" ve başlıksız "Tanımlar" ifadesi hem kaynak hem kapsam bakımından fazla iddialı.',
   'Başlığı "Kitapta geçen tanımlardan seçmeler" gibi bir ifadeyle değiştirin; nakil olanlarda nakledilen eseri gösterin.')
# ---------------- ÂYETLER
def ak(n): return f"ayet / {n}"
x=A[4]; ekle(ak(4),'Y',False,x['metin'],kes('1-2','Bunun pek kat’î','buyurdu'),'1-2',21,
   'Kitap burada âyetin meâlini vermiyor; âyetteki pekiştirmeyi "(Elbette muhakkak böyledir)" diye anlatıyor. Kayıt, "Nisâ, sekseninci" künyesiyle tam bir meâl gibi duruyor.','Kaldırın ya da kitaptaki çerçeveyle verin.')
x=A[8]; ekle(ak(8),'Y',True,'Mü’minûn, otuzuncu',kes('1-11','Meselâ Mü’minûn sûresinin otuzuncu','sonra,'),'1-11',26,
   'Kitap meâli otuzuncu âyetten SONRAKİ âyet-i kerîmeler için veriyor ("…meâlindeki âyet-i kerîmeleri gönderdi"); derleme âyetNo’yu "otuzuncu" yazmış.','âyetNo alanını kitaptaki gibi "otuzuncu âyet-i kerîmesinden sonra(ki âyetler)" yapın.')
x=A[9]; ekle(ak(9),'B',True,'Ra’d, ondördüncü',kes('1-11','Ra’d sûresinin ondördüncü','ellinci âyetlerinde'),'1-11',29,'Kitap iki yer bildiriyor; derleme ikinci sûreyi (Mü’min, ellinci) düşürmüş.','Künyeye "ve Mü’min sûresinin ellinci" ekleyin.')
x=A[61]; ekle(ak(61),'B',True,'Âl-i İmrân, yüzyirmialtıncı',kes('2-2','Âl-i İmrân sûresinin yüzyirmialtıncı','Enfâl sûresinde'),'2-2',400,'Kitap "ve Enfâl sûresinde" de diyor; derleme yalnız Âl-i İmrân’ı almış.','Künyeye "ve Enfâl sûresinde" ekleyin.')
x=A[155]; ekle(ak(155),'B',True,'Mü’minûn, ellidördüncü',kes('2-62','Mü’minûn sûresinin ellidördüncü','Rûm sûresindeki bir âyet-i kerîmede'),'2-62',753,'Kitap "ve Rûm sûresindeki bir âyet-i kerîmede" de diyor; derleme düşürmüş.','Künyeye Rûm sûresini ekleyin.')
x=A[38]; ekle(ak(38),'B',True,x['metin'],kes('1-46','Tâhâ sûresi 51 ve 52.','unutmaz.)'),'1-46',105,'Kitap 51-52. âyetlerin meâlini iki parça (Fir’avnın süâli ve Mûsâ aleyhisselâmın cevâbı) olarak veriyor; derleme yalnız birinci parçayı almış, künye ise iki âyeti gösteriyor.','Cevâb parçasını da ekleyin: "(Onların hâlleri ve istikbâllerini, Rabbim bilir. Levh-il-mahfûzda yazılmışdır. Rabbim hiçbir şeyde yanılmaz ve unutmaz.)"')
x=A[20]; ekle(ak(20),'Y',False,x['metin'][:80]+'…',kes('1-24','Allahü teâlâ, Kur’ân-ı kerîmin birçok yerlerinde',' (Sizden'),'1-24',42,'Kitap bunu tek bir âyetin meâli olarak değil, "birçok yerlerinde … meâlinde emrler" diye toplu bir ma’nâ olarak veriyor.','Kayıtta "birçok âyetin toplu meâli" olduğunu belirtin.')
x=A[67]; ekle(ak(67),'Y',False,x['metin'][:80]+'…',kes('2-15','Kur’ân-ı kerîmde, (Benim ismim','vardır.'),'2-15',431,'Kitap "meâlinde müteaddid âyet-i kerîmeler vardır" diyor; tek âyet meâli değil, toplu ma’nâ.','Kayıtta toplu meâl olduğunu belirtin.')
x=A[34]; ekle(ak(34),'Y',False,x['metin'][:80]+'…',kes('1-41','Cevâb: Buradaki doğru yolu','buyurulmakdadır.'),'1-41',94,'Bu, bir süâle verilen cevâbda aynı âyetin (ayet/33) açıklamalı tekrarıdır ("Ya’nî âyet-i kerîmede meâlen"); sûre/âyet numarası kitapta bu cümle için tekrarlanmamış, ayet/33’ten taşınmış.','ayet/33 ile birleştirin ya da "açıklamalı meâl" diye işaretleyin.')
x=A[125]; ekle(ak(125),'Y',False,x['metin'][:80]+'…',kes('2-47','Allahü teâlâ, Dâvüd aleyhisselâma','vahy gönderdi.'),'2-47',677,'Kitap bunu Dâvüd aleyhisselâma gönderilen vahy olarak bildiriyor; indekste sûresiz, Kur’ân-ı kerîm âyetleri arasında duruyor. Okur Kur’ân âyeti sanabilir.','Kayda "Dâvüd aleyhisselâma vahy" notunu ekleyin.')
x=A[136]; ekle(ak(136),'B',True,x['metin'],kes('2-48','Allahü teâlâ, dilediğini siler.','Ondadır'),'2-48',698,'Kitapta "Ümm-ül-kitâb" yazılı; derlemede "Ümmül-kitâb" (tek bulunamayan âyet kaydının sebebi bu yazım farkı).','Kitaptaki yazımla düzeltin.')
ekle(ak(140),'B',False,'Vezzâriyât (ayet/140) – Zâriyât (ayet/148); Ha-mîm Secde (ayet/43,44) – Fussılet (ayet/177)',None,None,703,'Aynı sûreler kitaptaki farklı adlarla geçtiği için sûre süzgecinde ayrı seçenekler olarak çıkar (sitenin birleştirmesi yalnız şapka/kesme farkını topluyor).','Süzgeçte bu adları tek sûre altında toplayın (adların kendisi kitabın yazımıdır, değiştirmeyin).')
# ---------------- HADÎSLER
def hk(n): return f"hadis / {n}"
x=H[4]; ekle(hk(4),'K',True,x['metin'],kes('1-1','(Hadîka)da, (Bid’at sâhiblerinin','kabûl olmaz).'),'1-1',19,
   'Kayıttaki cümle hadîs-i şerîf değil, Hadîka’nın (Bid’at sâhiblerinin ibâdetleri kabûl olmaz) hadîs-i şerîfini AÇIKLARKEN söylediği sözdür.','Metni kitaptaki hadîsle değiştirin: "Bid’at sâhiblerinin ibâdetleri kabûl olmaz" (kaynak: Hadîka).')
x=H[100]; ekle(hk(100),'K',True,x['metin'][:90]+'…',kes('1-74','Abdülkâdir-i Geylânînin yazdığı bu hadîs-i şerîfi','buyuruyor ki, (Bu haber,'),'1-74',278,
   'Kayıttaki sözler hadîs değil, Abdülhak-ı Dehlevî’nin bir önceki hadîse (hadis/99) yazdığı şerhdir; kitap "…Abdülhak-ı Dehlevî buyuruyor ki" diye veriyor.','Kaldırın.')
x=H[204]; ekle(hk(204),'K',True,'kaynak: Beyhekî',kes('2-18','Taberânînin “rahmetullahi teâlâ aleyh” bildirdiği hadîs-i şerîfde, (Kabrimi','şefâ’atcisiyim)'),'2-18',476,'Kitap bu hadîsi Taberânî’nin bildirdiğini söylüyor; derlemede kaynak "Beyhekî" (bir önceki hadîsin kaynak listesinden taşınmış).','Kaynağı "Taberânî" yapın.')
for n in (176,177):
    x=H[n]; ekle(hk(n),'D',True,'kaynak: Dürr-ül-muhtâr',kes('2-16','(Mir’ât-ül kâinât) kitâbında diyor ki:','(İbni Âbidîn) vesîkasını da bildirmekdedir.]'),'2-16',441,'Kitapta "[Bunu (Dürr-ül-muhtâr)… yazmakda]" notu, hadîslerden önceki Hz. Alî’nin düâsı haberine âiddir; bu hadîs için Dürr-ül-muhtâr bildirilmemiş (bölüm Mir’ât-ül kâinât’tan nakil).','Kaynağı boşaltın ya da "Mir’ât-ül kâinât" yapın.')
x=H[235]; ekle(hk(235),'D',True,'kaynak: Berîka',kes('2-39','Hadîs-i şerîfde, (Kadının neresine','atılacakdır)'),'2-39',603,'Bu hadîs için kitapta kaynak adı yok; yakındaki "(Hadîka)da ve (Berîka)da uzun yazılıdır" notu âyet-i kerîmeler içindir.','Kaynağı boşaltın.')
for n in (262,263):
    x=H[n]; ekle(hk(n),'D',True,'kaynak: Künûz-üd-dekâık',kes('2-42','[Bu hadîs-i şerîfi, (Zevâcir)','yazmakdadır.]'),'2-42',627,'Kitaptaki "Bu hadîs-i şerîfi (Zevâcir) ve (Künûzüddekâık) kitâbları da yazmakdadır" notu bir ÖNCEKİ hadîse (hadis/261: "Çok içildiği zemân serhoş eden…") âiddir; bu kayda yanlış taşınmış. hadis/261’in kaynağı ise boş bırakılmış.','Bu kaydın kaynağını boşaltın; hadis/261’e "Rıyâd-un-nâsıhîn, Zevâcir, Künûz-üd-dekâık" yazın.')
for n,mid in ((94,'1-71'),(109,'1-74'),(172,'2-16'),(173,'2-16'),(174,'2-16'),(182,'2-17'),(310,'2-52'),(419,'3-59')):
    x=H[n]; on=x['once']; c=x['cumle']; k=on[-120:]+c
    ekle(hk(n),'D',False,'kaynak: '+x['kaynak'],k,mid,x['sahife'],'Kaynak adı kitapta bu hadîsten önceki başka bir hadîs/nakil için geçiyor; bu hadîs "Bir hadîs-i şerîfde / Hadîs-i şerîfde" diye kaynaksız veriliyor. Kaynak bir önceki kayıttan taşınmış görünüyor (nakil bölümünün devamı olabilir; kesin değil).','Kaynağı boşaltın ya da kitaptaki çerçeveyi kontrol edip "nakil devamı" notu düşün.')
for n,mid,bas,son in ((74,'1-63','(Mişkât)da ve (Künûz','bildirilen'),(178,'2-16','(Buhârî) ve (Müslim)deki hadîs-i şerîfde, (Îmân','getirir)'),(179,'2-16','(Buhârî)de ve (Müslim)deki','hadîs-i şerîfde'),(203,'2-18','(Taberânî), (İbni Adî)','bildirilen'),(271,'2-43','(Buhârî) ve (Müslim)de yazılı','hadîs-i şerîfde')):
    x=H[n]; ekle(hk(n),'B',True,'kaynak: '+x['kaynak'],kes(mid,bas,son),mid,x['sahife'],'Kitap birden çok kaynak sayıyor; derleme yalnız birini yazmış.','Kaynağı kitaptaki listenin tamamıyla yazın.')
ekle('hadis / 188','B',True,'kaynak: (boş)',kes('2-17','(Âlimler, Peygamberlerin vârisleridir) hadîs-i şerîfi, (Buhârî)de yazılıdır.'),'2-17',467,'Kitap kaynağı açıkça bildiriyor; derlemede boş. Aynı durum betikle ~57 kayıtta aday olarak bulundu (ör. hadis/66, 124, 148, 150, 189, 193, 207, 261, 273, 333, 420, 426); 449 kaydın 385’inde kaynak boş.','Kaynak alanını kitapta bildirilen eserle doldurun.')
x=H[396]; ekle(hk(396),'Y',False,x['cumle'],kes('3-53','Resûlullah buyurdu ki, (Âhıretde','şeytân olan!'),'3-53',970,'Kayıt bir beytin (manzum) ilk mısra’ıdır; ikinci mısra’ ("Se’âdete kavuşamaz, önderi şeytân olan!") dışarıda kalmış ve cümle yarım okunuyor.','Beyti iki mısra’ıyla verin ya da manzum olduğunu belirtin.')
for n,mid in ((146,'1-92'),(315,'2-61')):
    x=H[n]; ekle(hk(n),'Y',False,x['cumle'],x['once'][-140:]+x['cumle'],mid,x['sahife'],'Kitap bunu bir olay anlatımı içinde Resûlullahın söylediği söz olarak veriyor ("hadîs-i şerîfde" demiyor); bağlamından ayrılınca anlamsız/yarım bir emir cümlesi gibi duruyor.','Olay bağlamıyla verin ya da indeksten çıkarın.')
x=H[184]; ekle(hk(184),'B',True,x['metin'],kes('2-17','(Öldükden sonra da, hayâtda olduğum gibi bilirim), anlarım buyuruldu'),'2-17',452,'Kitapta söz "…bilirim), anlarım buyuruldu" diye devam ediyor; "anlarım" düşmüş.','Kitaptaki gibi "anlarım" ekiyle verin.')
x=H[416]; ekle(hk(416),'B',True,x['metin'],kes('3-59','Ana-babasının veyâ ikisinden','ödemiş olur'),'3-59',1008,'Kitapta "Ana-babasının"; derlemede "Anababasının" (bulunamayan tek hadîs kaydının sebebi bu yazım farkı).','Kitaptaki yazımla düzeltin.')
json.dump(B,open('../tanim-ayet-hadis.json','w'),ensure_ascii=False,indent=1)
from collections import Counter
print(len(B), Counter((b['kimlik'].split(' /')[0],b['sinif']) for b in B))
