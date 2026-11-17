import json, collections
from ortak import *
from unvan import sinif
L = sahislar(); K = json.load(open('unvan-kanit.json'))
def say(d):
    c = collections.Counter()
    for ifade, yer in d.items(): c[sinif(ifade)] += len(yer)
    return c
rows=[]
for x in L:
    r = K[x['slug']]
    c = say(r['tum']) + say(r['bio'])
    u = sinif(x['unvan']) if x['unvan'] else ''
    rows.append((x, u, c))
json.dump([[x['slug'],u,dict(c)] for x,u,c in rows], open('unvan-siniflar.json','w'), ensure_ascii=False)
# özet
uyum=celis=bos_dolu=dolu_yok=bos_yok=0
for x,u,c in rows:
    hon={k:v for k,v in c.items() if not k.startswith('diger:')}
    if u and hon:
        if u in hon: uyum+=1
        else: celis+=1
    elif u and not hon: dolu_yok+=1
    elif not u and hon: bos_dolu+=1
    else: bos_yok+=1
print('uyumlu',uyum,'çelişik',celis,'unvan dolu-kitapta ifade bulunmadı',dolu_yok,'unvan boş-kitapta ifade var',bos_dolu,'ikisi de yok',bos_yok)
