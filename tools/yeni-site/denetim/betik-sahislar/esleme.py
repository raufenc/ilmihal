import json, collections
from ortak import *
from unvan import katla, adlar, bul
L=sahislar(); M=maddeler(); K=json.load(open('unvan-kanit.json'))
def sahife_madde(p):
    return [k for k,v in M.items() if v['sahife'][0]<=p<=v['sahife'][1]]
st=collections.Counter(); yok=[]
for x in L:
    g=K[x['slug']]['gecis']
    sm=set(); 
    for p in x['sahifeler']: sm.update(sahife_madde(p))
    for k in x['maddeler']:
        st['listeli']+=1
        if k in g: st['ad-geciyor']+=1
        else: yok.append((x['slug'],k))
        if k in sm: st['sahife-ile-uyumlu']+=1
    for k in g:
        if k not in x['maddeler']: st['ad-geciyor-ama-listede-yok']+=1
print(st); print(len(yok)); print(yok[:40])
