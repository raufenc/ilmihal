import sys, json
from ortak import *
d = json.load(open(f"{KOK}/tablolar/dizin.json"))
for i,t in enumerate(d['tablolar'][65:],66):
    T = tablo(t['id']); k=T.get('kaynakMadde'); km=T.get('kaynakMetin') or ''
    if not k: print(i,t['id'],'madde yok'); continue
    m=madde(k)
    p = bul(k, km[:120]) if km else -1
    tah = sahife_tahmin(k,p) if p>=0 else None
    ok = tah and tah[0] <= T['sahife'] <= tah[1]
    print(i, t['id'], k, m['sahife'], 'tablo:',T['sahife'], 'tahmin:',tah, 'OK' if ok else '??', 'dizin=' ,t['sahife'])
