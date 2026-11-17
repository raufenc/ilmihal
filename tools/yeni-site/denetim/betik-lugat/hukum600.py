# 600 örneklemin elle verilen hükümleri: D=doğru, C=çok anlamlı (doğru anlam listede var, ilk değil), Y=yanlış, B=boş/yönlendirme
import json
Y={14:'cild=cild (kitap)',18:'fazla→fazl',24:'zemân→kefâlet',33:'artık (zarf)',39:'sebze→sebz',43:'geri→ger',45:'dil (lisan)→gönül',62:'dil (lisan)→gönül',65:'zemân→kefâlet',67:'zemân→kefâlet',74:'altında (yer)→altın',89:'madde (kitap maddesi)',
 104:'Selîm (özel isim)',115:'deve→sâibe',120:'madde (kitap maddesi)',123:'geri→ger',144:'Sâlih (peygamber adı)→iyi',158:'zemân→kefâlet',180:'kadın→kadı',186:'pul (posta pulu)→bakır para',199:'vücûd (beden)→var olma',
 202:'zemân→kefâlet',222:'fazla→fazl',229:'beşer (beşer beşer)→insan',237:'cild=cild (kitap)',241:'Râzî (özel isim)',264:'cild=cild (kitap)',
 320:'kadın→kadı',325:'kadın→kadı',332:'zemân→kefâlet',353:'madde (kitap maddesi)',384:'madde (kitap maddesi)',
 403:'hat (çizgi)→uzunluk ölçüsü',412:'aşmak→hayvan çiftleşmesi',420:'dil (lisan)→gönül',422:'İmâm-ı Muhammed→Peygamber',432:'Ebû Bekr→bikr',452:'Hayri (özel isim)→hayr',468:'dil (lisan)→gönül',474:'deve→sâibe',475:'Arş’ın→arşın (ölçü)',487:'Abdül’azîz bin İbrâhîm→İbrâhîm aleyhisselâm',494:'cild=cild (kitap)',
 502:'zemân→kefâlet',513:'İmâm-ı Muhammed→Peygamber',515:'kadın→kadı',524:'fazla→fazl',532:'ziyâde→ziyâ',538:'Seyyid Kutb→kutb',548:'banka çeki→çeki (tartı)',557:'atom çekirdeği→çekirdek (tartı)',582:'saf (arı)→saf (sıra)',589:'zemân→kefâlet',596:'hakk→toprak'}
C=[7,48,124,165,166,179,210,220,295,344,374,394,425,428,489,521,553,563,570,600]
B=[593]
S=json.load(open('orneklem600.json'))
H={}
for o in S:
    n=o['n']; H[n]={'n':n,'madde':o['madde'],'kelime':o['kelime'],'id':o['id'],'terim':o['terim'],'hukum':'Y' if n in Y else 'C' if n in C else 'B' if n in B else 'D','not':Y.get(n),'baglam':o['baglam']}
json.dump(list(H.values()),open('orneklem600-hukum.json','w'),ensure_ascii=False,indent=0)
import collections
print(collections.Counter(h['hukum'] for h in H.values()))
