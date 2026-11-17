import re, json
from ortak import *
L=sahislar(); NO={}
for x in L:
    if x['no'] is not None: NO.setdefault(x['no'],[]).append(x)
SAY={'bir':1,'iki':2,'üç':3,'dört':4,'beş':5,'altı':6,'yedi':7,'sekiz':8,'dokuz':9,'on':10,'yirmi':20,'otuz':30,'kırk':40,'elli':50,'altmış':60,'yetmiş':70,'seksen':80,'doksan':90,'yüz':100,'bin':1000}
out=[]
for x in L:
    b=x['biyografi']
    if not re.search(r'bakınız|sıradadır',b[:200]): continue
    m=re.search(r'\[(\d+)\.?\]|(\d+)\s*\.\s*(?:c[iıuü]|n[cç][iıuü]|[iıuü]nc[iıuü])?\s*(?:sırada|sayıda|numarada|isme)|(\d+)\.\s*c[iıuü]',b[:200])
    n=None
    if m: n=int(next(g for g in m.groups() if g))
    hedef=NO.get(n,[None])[0] if n else None
    out.append({'slug':x['slug'],'isim':x['isim'],'kat':x['kategori'],'unvan':x['unvan'],'no':n,'hedef':hedef and hedef['slug'],'hkat':hedef and hedef['kategori'],'hunvan':hedef and hedef['unvan'],'metin':b[:120]})
json.dump(out,open('yonlendirme.json','w'),ensure_ascii=False,indent=0)
print(len(out))
for o in out:
    if o['hedef'] is None or o['kat']!=o['hkat'] or o['unvan']!=o['hunvan']:
        print(o['slug'],o['kat'],repr(o['unvan'][:12]),'->',o['no'],o['hedef'],o['hkat'],repr((o['hunvan'] or '')[:12]),'|',o['metin'][:70])
