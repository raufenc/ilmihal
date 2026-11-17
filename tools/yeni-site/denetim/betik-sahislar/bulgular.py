import json, re
from ortak import *
L={x['slug']:x for x in sahislar()}; M=maddeler()
B=[]
def ilk(s, n=220): 
    b=L[s]['biyografi'].replace('\n',' '); return b[:n]+('…' if len(b)>n else '')
def sh(s):
    if s not in L: return None
    m=re.search(r's\. (\d+)',L[s]['kaynak']); return int(m.group(1)) if m else None
def ekle(s,sinif,kesin,derleme,kitap,aciklama,oneri,madde=None,sahife=None):
    B.append({'kimlik':s,'sinif':sinif,'kesin':kesin,'derleme':derleme,'kitap':kitap,'madde':madde,'sahife':sahife if sahife is not None else sh(s),'aciklama':aciklama,'oneri':oneri})
def kv(s): return f"kategori: {L[s]['kategori']}; unvan: {L[s]['unvan'] or '(boş)'}"
# 1. Peygamber sınıfı
ekle('hizir','Y',True,kv('hizir'),"İbrâhîm aleyhisselâmdan sonra yaşamış bir Nebî veyâ Velîdir.","Kitap Hızır'ın peygamber olduğunu kesin bildirmiyor (\"Nebî veyâ Velî\"); site 'Peygamberler' altında ve 'aleyhisselâm' ile gösteriyor. Aynı ifadeyle anılan Lokmân 'Âlimler' altında: tutarsız.","sınıfını kesin olmayan bir başlığa al ya da sınıf etiketini kaldır")
ekle('lokman-hakim','Y',True,kv('lokman-hakim'),"Peygamber veyâ Velîdir.","Kitap 'Peygamber veyâ Velîdir' diyor; site 'Âlimler' altında 'rahmetullahi teâlâ aleyh' ile gösteriyor. Hızır aynı ifadeyle 'Peygamberler' altında.","sınıfını Hızır ile aynı ölçüye getir; 'Âlimler' başlığından çıkar")
ekle('iskender','Y',True,kv('iskender'),"Üçüncü İskender, Kur’ân-ı kerîmde Zülkarneyn adı ile bildirilen, mubârek bir zâtdır. Peygamber veyâ Evliyâdandır.","Tek kayıtta üç ayrı İskender var; 'mubârek zât' denen Zülkarneyn, kâfir ve zâlim olanlarla birlikte 'Diğer' altında.","kaydı sınıfsız göster")
# 2. Sahabi
ekle('abdullah-bin-zeyd','K',False,kv('abdullah-bin-zeyd'),"Tâbi’înin büyüklerindendir. Ensârdan Zeyd bin Erkamın “radıyallahü anh” oğludur.","Kitap Tâbi'înden diyor; sitede unvan 'radıyallahü anhümâ' (sahâbe ifadesi) ve sınıf 'alim'. 'anhümâ' kitabın başlığında baba-oğul için olabilir; başlık metni veride yok, doğrulanamadı.","başlıktaki ifade kitapla karşılaştırılmalı; değilse unvanı boşalt")
ekle('meryem','Y',True,kv('meryem'),"Îsâ aleyhisselâmın annesidir.",'Unvan kitapla uyumlu (2-23: “Meryem “radıyallahü anhâ” da…”), fakat sınıf "Diğer": Ebû Cehl, Fir’avn, Hitler ile aynı başlıkta.','sınıf etiketini kaldır ya da ayrı başlık',madde='2-23')
ekle('havva','Y',True,kv('havva'),"Âdem aleyhisselâmın zevcesidir. … hazret-i Havvâyı yaratdı.","Kitap 'hazret-i Havvâ' diyor; sitede 'Diğer' altında, unvansız; Fir’avn ve Nemrûd ile aynı başlıkta.","sınıf etiketini kaldır")
ekle('mehdi','Y',False,kv('mehdi'),"Hazret-i Mehdî, âhır zemânda dünyâya gelecekdir.","'Diğer' altında; 'aleyhirrahme' ifadesi kitabın başlığından mı gelmiş doğrulanamadı (biyografide geçmiyor).","başlıktaki ifadeyle karşılaştır; sınıf etiketini kaldır")
# 3. Âlimler'de kitabın çekinceyle andıkları
ekle('kelebi','Y',True,kv('kelebi'),"Abdüllah bin Sebe’ ile çok sohbet etdiğinden, tefsîri sağlam sayılmaz.","Kitap tefsîrinin sağlam sayılmadığını bildiriyor; site 'Âlimler' başlığında övgü çağrışımlı gösteriyor.","'Âlimler' başlığından çıkar")
ekle('muhammed-bin-ebu-bekr','Y',True,kv('muhammed-bin-ebu-bekr'),"Sahâbî değildir. Tâbi’îndendir. Hazret-i Osmânı şehîd edenler arasında idi.","Kitap 'âlim' demiyor; 'Âlimler' başlığı ve 'rahmetullahi teâlâ aleyh' kitabın başlığından mı, doğrulanamadı.","'Âlimler' başlığından çıkar")
ekle('nesimi','Y',True,kv('nesimi'),"Nesîmînin hurûfî zındıklarından olduğu bildirilmekdedir. … Önce hurûfî olduğu, sonra tevbe etdiği anlaşılıyor.","Kitap tartışmalı olduğunu bildiriyor; site çekincesiz 'Âlimler' altında.","'Âlimler' başlığından çıkar")
ekle('hallac-i-mensur','Y',True,kv('hallac-i-mensur'),"Tarîkat serhoşluğunda gördüklerini, islâmiyyete uymıyan kelimelerle söylediğinden 306 [m. 919] da Bağdâdda şehîd edildi.","Kitap Sôfiyyeden sayıyor; 'âlim' demiyor. Bilgi için.","başlık etiketini kaldır")
# 4. Âlimler'de âlim olmayanlar
GRUP={'Resûlullahın dedeleri, ana-babası, oğlu':'abdullah abdullah-bin-abdulmuttalib-rahmetullahi-teala-a amine kab kilab kusayy mudar mudrike murre nizar kureys taruh',
 'devlet adamı, ağa, paşa, vâlî, vezîr, kumandan':'abdullah-aga abdullah-bin-tahir abidin-pasa besir-aga ibrahim-aga ibrahim-pasa-damad ibrahim-pasa-damad-2 kasim-pasa kilinc-ali-pasa osman-aga semsi-ahmed-pasa sokullu-muhammed-pasa nisanci-muhammed-pasa muhammed-ali-pasa ibrahim-pasa-kavalali tosun-pasa eyyub-sabri-pasa sirri-pasa nizam-ul-mulk ebu-said-i-harezmi han-i-hanan mesleme battal-gazi ibrahim-bin-abdullah',
 'hükümdar (Hükümdarlar yerine Âlimler altında)':'alemgir mahmud-gaznevi osmanli-sultanlari-rahmetullahi-teala-aleyhim-ecm sahzade-sultan-muhammed',
 'hayrât sâhibi hanım sultanlar':'bezm-i-alem-sultan fatima-sultan fatima-sultan-2 hadice-sultan mihr-i-mah-sultan mihr-i-sah-sultan mahpeyker-sultan turhan-sultan sah-sultan',
 'şâir, hattât, matbaacı, fizikçi':'nabi rasim-efendi hattat-hafiz-osman lutfullah-efendi heisenberg ibrahim-i-muteferrika'}
for g,ss in GRUP.items():
    for s in ss.split():
        ekle(s,'Y',True,kv(s),ilk(s,200),f"Kitap bu kişiyi âlim olarak tanıtmıyor ({g}); site 'Âlimler' başlığı altında gösteriyor. Sınıf, unvan 'rahmetullahi…' olduğu için mekanik verilmiş.","'Âlimler' başlığından çıkar (sınıfını düzelt ya da etiketi kaldır)")
# 5. Diğer'de hürmetle anılan âlim/velîler (yönlendirme dışı)
for s,km,kq in [('ali-haydar-be-g','2-40','Alî Haydar beğin “rahmetullahi teâlâ aleyh” (Mecelle) şerhi'),('ebu-musa-dineveri','2-47','Ebû Mûsâ Dîneverî “rahmetullahi teâlâ aleyh” diyor ki'),('esiruddin-i-ebheri','2-30','Esîrüddîn-i Ebherî “rahmetullahi teâlâ aleyh”'),('munavi-veya-menavi','2-17','imâm-ı Münâvî “rahmetullahi teâlâ aleyh”'),('resid-pasa','3-11','hâcı Reşîd pâşa “rahmetullahi teâlâ aleyhim ecma’în”')]:
    ekle(s,'Y',True,kv(s),kq,"Kitap maddede hürmet ifadesiyle anıyor; sitede unvan boş ve sınıf 'Diğer' (kâfirlerle aynı başlık).","unvanı kitaptaki ifadeyle doldur: “rahmetullahi teâlâ aleyh”; 'Diğer'den çıkar",madde=km,sahife=M[km]['sahife'][0])
for s in 'tahavi sirri-yi-sekati zeynuddin-i-hafi abdurrezzak-kasi tayyibi nesefi-omer salah-ibni zahireddin-i-ishak zebidi-zubeydi serefuddin-ahmed-muniri alusi alusi-2 ahmed-naim-efendi halil-bin-osman ali-bin-ahmed-hiti halid-karsialan'.split():
    ekle(s,'Y',True,kv(s),ilk(s,200),"Kitap âlim/velî ya da övgüyle tanıtıyor; sitede unvansız 'Diğer' altında, kitabın kötülediği kişilerle aynı başlıkta. Kitabın bu kişi için kullandığı hürmet ifadesi maddelerde bulunamadı.","'Diğer'den çıkar; unvan kitabın başlığıyla karşılaştırılsın")
# 6. Yönlendirme kayıtları
Y=json.load(open('yonlendirme.json'))
for o in Y:
    if o['hedef'] and o['hkat']!=o['kat'] and o['slug'] not in ('enver-pasa','serefuddin-ahmed-muniri','seyh-i-necdi'):
        ekle(o['slug'],'Y',True,kv(o['slug']),o['metin'],f"Kitapta yalnız yönlendirme ('… ismine bakınız!'); hedef kayıt {o['hedef']} '{o['hkat']}' ve '{o['hunvan']}' ile gösterilirken bu kayıt 'Diğer' ve unvansız: aynı kişi iki başlıkta, biri kâfirlerle birlikte.",f"sınıf ve unvanı hedef kayıttan ({o['hedef']}) al ya da yönlendirme kayıtlarını listede sınıflama")
for s in ['semnani','sibgatullah-i-hizani','mahdum-i-cihaniyan']:
    ekle(s,'Y',True,kv(s),ilk(s,120),"Yönlendirme ya da çok kısa kayıt; hedefi âlim/velî olduğu hâlde 'Diğer' altında unvansız.","hedef kayıtla aynı sınıfa al")
# 7. Unvan: kitabın metindeki ifadeden farklı olanlar (kesin değil)
for s,km,q in [('cuneyd-i-bagdadi','3-17','“kuddise sirruh”'),('ebu-bekr-i-sibli','1-31','“kuddise sirruh”'),('muhammed-behaeddin-i-buhari-rahmetullahi-teala-a','1-41','“kuddise sirruh”'),('muhammed-baki-billah','2-61','“kuddise sirruh”'),('bayezid-i-bistami','3-51','“kuddise sirruh”'),('sadreddin-i-konevi','3-52','“kuddise sirruh”'),('ebu-said-i-harraz','3-44','“kuddise sirruh”'),('cafer-i-sadik','3-42','imâm-ı hümâm Ca’fer-i Sâdık “radıyallahü anh” buyurmuş ki'),('amine','1-95','annesi Âmine “radıyallahü anhâ”')]:
    ekle(s,'Y',False,kv(s),q,"Site tek bir ifade gösteriyor; kitabın maddelerinde bu kişi (ayrıca/çoğunlukla) başka ifadeyle anılıyor. Sitedeki ifade kitabın hâl tercemesi başlığından alınmış olabilir (veride başlık yok); yanlış değil, eksik.","bilgi: ifadeyi kitabın hâl tercemesi başlığıyla karşılaştır",madde=km,sahife=M[km]['sahife'][0])
# 8. Biçim
ekle('muhammed-rebhami','B',True,"unvan: (boş); biyografi: “rahmetullahi teâlâ aleyh”: Hindistânın…","“rahmetullahi teâlâ aleyh”: Hindistânın fıkh âlimlerindendir.","Başlıktaki hürmet ifadesi biyografinin başına kaymış, unvan boş kalmış; tek 'alim + boş unvan' kaydı.","unvanı “rahmetullahi teâlâ aleyh” yap, biyografi başından ifadeyi al")
ekle('alauddevle','B',True,"sahifeler: []; maddeler: []","… Sofî Âbâd şehrindedir. 112, 768, 936, 1016, 1076. [(Mesmû’ât)da sahîfe 110.]","Kitabın sahîfe listesi biyografide kalmış, sahifeler/maddeler boş; kişi okuyucuda hiçbir maddeye bağlanmıyor.","sahîfe listesini sahifeler alanına al, maddeleri buna göre üret")
ekle('selman-i-farisiisfehanli-idi-m','B',True,"slug: selman-i-farisiisfehanli-idi-m","Selmân-ı Fârisî … İsfehânlı idi.","Slug biyografinin ilk kelimeleriyle birleşmiş.","bilgi: slug değişmemeli (VERI.md); yönlendirme eklenebilir")
ekle('(37 kayıt)','B',True,"slug içinde 'rahmetullahi-teala-aleyh' (ör. burhaneddin-i-merginani-rahmetullahi-teala-al)",None,"37 kişinin slug'ı başlıktaki hürmet ifadesini taşıyor (kesik). Kitabın başlığında ifadenin bulunduğunu da gösteriyor.","bilgi")
ekle('ebu-hanife','B',True,"maddeler içinde 3-26","(3-26 metninde 'Ebû Hanîfe' / 'İmâm-ı a’zam' geçmiyor)","Kitabın 897. sahîfe atfı 3-25 ve 3-26'ya paylaşılıyor; ad yalnız 3-25'te.","3-26'yı listeden çıkar",madde='3-26',sahife=897)
E=json.load(open('esleme.json'))
for s,r in E.items():
    for k,v in r.items():
        if not v['tam'] and not v['kismi'] and v['paylasimli_sahife'] and s not in ('muhammed','ebu-hanife','muhammedseybani'):
            ekle(s,'B',False,f"maddeler içinde {k}",None,f"Kitabın sahîfe atfı ({v['sahifeler']}) iki maddenin paylaştığı sahîfede; adı bu maddenin metninde bulunamadı (öbür maddede olabilir).","listeden çıkarılması düşünülsün",madde=k,sahife=v['sahifeler'][0])
for s,k in [('hizir','2-20'),('hayreddin-i-remli','2-38'),('abdul-ehad','3-47'),('muhammed-masum-i-faruki-rahmetullahi-teala-aley','3-36')]:
    ekle(s,'B',False,f"maddeler içinde {k}",None,"Örneklemde: kişinin adı (ve denenen başka adları) bu maddenin metninde bulunamadı; kitabın sahîfe atfı ile sitenin sahîfe sınırları uyuşmuyor olabilir.","atfı kitapla karşılaştır",madde=k,sahife=M[k]['sahife'][0])
# 9. Adı geçen büyükler
kotu=json.load(open('kitabin-kotuledikleri.json'))
for k,m in sorted(M.items()):
    kk=[s['slug'] for s in m['sahislar'] if s['slug'] in kotu]
    if kk: ekle(k,'Y',True,"Okuyucu: 'Adı geçen büyükler' → "+', '.join(kk),None,"Bu başlık altında kitabın kötülediği (kâfir, sapık, mason, mezhebsiz vb.) kişiler 'büyükler' diye listeleniyor.","başlığı kaldır ya da 'Hâl tercemeleri' yap",madde=k,sahife=m['sahife'][0])
json.dump(B,open('../sahislar.json','w'),ensure_ascii=False,indent=1)
import collections; print(len(B), collections.Counter(b['sinif'] for b in B), collections.Counter((b['sinif'],b['kesin']) for b in B))
