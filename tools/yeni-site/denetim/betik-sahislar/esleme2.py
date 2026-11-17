import json, collections, random, re
from ortak import *
from unvan import katla, adlar
L=sahislar(); M=maddeler(); MK={k:katla(v['metin']) for k,v in M.items()}
GENEL={'abdullah','abdüllah','ahmed','muhammed','ali','alî','hasen','huseyn','hüseyn','omer','ömer','osman','osmân','ibrahim','ibrâhîm','mahmud','mahmûd','yusuf','yûsüf','efendi','pasa','pâşa','sultan','sultân','han','hân','seyyid','seyh','şeyh','bin','ibni','ebu','ebû','ebul','ebül','imam','imâm','hazret','molla','kadi','kâdî','hace','hâce','abdurrahman','mustafa','mustafâ','sah','şâh','beg','beğ'}
def belirleyici(isim):
    ws=re.findall(r"[\w'’]+", re.sub(r'\[.*?\]|\(.*?\)',' ',isim))
    ws=[katla(w) for w in ws]
    ws=[w for w in ws if len(w)>=4 and w not in {katla(g) for g in GENEL}]
    return ws
def kok(w): return w[:max(4,len(w)-2)]  # ek düşmesi/ünsüz yumuşaması payı
def gecer(ad, fk):
    i=fk.find(ad)
    while i>=0:
        if i==0 or not fk[i-1].isalpha(): return True
        i=fk.find(ad,i+1)
    return False
sonuc={}
for x in L:
    ad=adlar(x['isim']); bel=belirleyici(x['isim'])
    d={}
    for p in x['sahifeler']:
        mm=[k for k,v in M.items() if v['sahife'][0]<=p<=v['sahife'][1]]
        for k in mm: d.setdefault(k,[]).append((p,len(mm)))
    r={}
    for k in x['maddeler']:
        tam=any(gecer(a,MK[k]) for a in ad)
        kism=any(gecer(kok(w),MK[k]) for w in bel) if bel else False
        paylasimli=all(n>1 for p,n in d.get(k,[]))
        r[k]={'tam':tam,'kismi':kism,'paylasimli_sahife':paylasimli,'sahifeler':[p for p,n in d.get(k,[])]}
    sonuc[x['slug']]=r
json.dump(sonuc,open('esleme.json','w'),ensure_ascii=False)
c=collections.Counter()
for s,r in sonuc.items():
    for k,v in r.items():
        c[('tam' if v['tam'] else 'kismi' if v['kismi'] else 'yok', 'paylasimli' if v['paylasimli_sahife'] else 'tek')]+=1
print(c)
