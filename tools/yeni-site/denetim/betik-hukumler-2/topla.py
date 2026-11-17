import json,glob
from collections import Counter,defaultdict
S={(b['tur'],b['kat'],b['id']):b for b in json.load(open('tarama.json'))}
plan=json.load(open('tum-plan.json'))
K=[]
for f in sorted(glob.glob('karar-oku-*.jsonl')):
    for x in map(json.loads,open(f)):
        x['_dosya']=f; K.append(x)
ist={}
def say(L):
    c=Counter(x['karar'] for x in L); n=len(L)
    return {'n':n, **{k:c.get(k,0) for k in ['TAMAM','K','Y','B','D']},
            'kalip':dict(Counter(x['kalip'] for x in L if x['karar']!='TAMAM').most_common()),
            'Y_baglamsiz':sum(1 for x in L if x['karar']=='Y' and x['kalip']=='BAGLAMSIZ'),
            'Y_baglamsiz_kesinDegil':sum(1 for x in L if x['karar']=='Y' and x['kalip']=='BAGLAMSIZ' and not x['kesin']),
            'K_kesin':sum(1 for x in L if x['karar']=='K' and x['kesin'])}
for t in ['mubah','mekruh','haram']:
    ist[t+'-acik']=say([x for x in K if x['tur']==t and x['kat']=='acik'])
    T=[x for x in K if x['tur']==t and x['kat']=='tum']
    o=set(plan[t]['orneklem'])
    # tum örneklemi: açıkta olanlar acik kararıyla da değerlendirildi; burada tum dosyasındaki karar
    ist[t+'-tum-orneklem']=say([x for x in T if x['id'] in o])
    ist[t+'-tum-supheli']=say([x for x in T if x['id'] not in o])
ist['acik-toplam']=say([x for x in K if x['kat']=='acik'])
json.dump(ist,open('istatistik.json','w'),ensure_ascii=False,indent=1)
for k,v in ist.items(): print(k, {a:b for a,b in v.items() if a!='kalip'}, v['kalip'])
# bulgu listesi
out=[]
for x in K:
    if x['karar']=='TAMAM': continue
    b=S[(x['tur'],x['kat'],x['id'])]
    out.append({'kimlik':f"{x['tur']}-{x['kat']}-{x['id']}",'sinif':x['karar'],'kesin':bool(x['kesin']),'kalip':x.get('kalip'),
        'tur':x['tur'],'katman':x['kat'],'altTur':b['altTur'],'derleme':b['metin'],'kitap':x.get('kitap'),
        'madde':b['madde'],'sahife':b['sahife'],'aciklama':x.get('aciklama'),'oneri':x.get('oneri')})
ek=[
 ('haram-acik-4384','B','Kayıt metninde "(Kurret-ül’uyûn)", kitapta "(Kurretül’uyûn)" yazılı; cümle bu farkla aynen bulunamadı.','haram','acik',4384),
 ('haram-tum-5557','B','Aynı yazım farkı: "(Kurret-ül’uyûn)" / kitapta "(Kurretül’uyûn)".','haram','tum',5557),
 ('haram-tum-5043','B','Kayıt "(Hülâsatül-kelâm…)", kitapta "(Hülâsat-ül-kelâm…)"; ayrıca "harâm" yalnız kitap adında (beled-il-harâm).','haram','tum',5043),
 ('mekruh-tum-3917','B','madde alanı null; cümle 241 maddenin hiçbirinde yok, kitabın Hâl tercemeleri kısmında (veri/sahislar) bulunuyor; sahîfe 1173 betikle doğrulanamadı (kesin değil).','mekruh','tum',3917),
]
for kim,s,ac,t,k,i in ek:
    b=S[(t,k,i)]
    out.append({'kimlik':kim+'-betik','sinif':s,'kesin':kim!='mekruh-tum-3917','kalip':'YAZIM' if s=='B' and 'yazım' in ac else 'ATIF','tur':t,'katman':k,'altTur':b['altTur'],
       'derleme':b['metin'],'kitap':(b.get('kismi') or {}).get('kitap'),'madde':b['madde'],'sahife':b['sahife'],'aciklama':ac,'oneri':'atfı/yazımı kitaba göre düzelt'})
sira={'K':0,'Y':1,'B':2,'D':3}
out.sort(key=lambda o:(o['katman']!='acik',sira[o['sinif']],not o['kesin'],o['tur'],o['kimlik']))
json.dump(out,open('../hukumler-2.json','w'),ensure_ascii=False,indent=1)
print(len(out), Counter((o['katman'],o['sinif']) for o in out))
