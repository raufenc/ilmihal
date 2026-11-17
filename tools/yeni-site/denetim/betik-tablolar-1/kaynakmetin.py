import sys, json
from ortak import *
d = json.load(open(f"{KOK}/tablolar/dizin.json"))
for i,t in enumerate(d['tablolar'][:65],1):
    T = tablo(t['id'])
    km = T.get('kaynakMetin')
    if not km: print(i,t['id'],'kaynakMetin YOK'); continue
    ks = [T['kaynakMadde']] if T.get('kaynakMadde') else tum_maddeler()
    kd,_ = duzle(km); kd=kd.strip()
    bulundu=None; tam=False
    for k in ks:
        s = madde(k)['metin']
        if km in s: bulundu=k; tam=True; break
        if kd in duzle(s)[0]: bulundu=k; break
    if not bulundu and T.get('kaynakMadde'):
        for k in tum_maddeler():
            s=madde(k)['metin']
            if km in s: bulundu=k+'(BAŞKA)'; tam=True; break
            if kd in duzle(s)[0]: bulundu=k+'(BAŞKA)'; break
    print(i, t['id'], 'aynen' if tam else ('normalde' if bulundu else 'YOK'), bulundu, len(km))
