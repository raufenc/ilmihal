import re, json
from ortak import *
exec(open('bulgu1.py').read())
tum = tum_maddeler()
bad = 0
for x in B:
    k = x['kitap']
    if not k: continue
    parcalar = [p.strip(' .…[]') for p in re.split(r'\s*(?:\.\.\.|…|\|)\s*', k) if len(p.strip())>12]
    for p in parcalar:
        ks = [x['madde']] if x['madde'] else tum
        found = any(p in madde(m)['metin'] for m in ks)
        if not found:
            # normalized
            pd = duzle(p)[0].strip()
            nf = [m for m in (ks if x['madde'] else tum) if pd in duzle(madde(m)['metin'])[0]]
            other = [m for m in tum if p in madde(m)['metin']] if not nf else []
            print('YOK' if not nf else 'NORM', x['kimlik'], '|', p[:90], '|', nf[:2] or other[:2])
            bad += 1
print('sorunlu', bad, 'toplam bulgu', len(B))
