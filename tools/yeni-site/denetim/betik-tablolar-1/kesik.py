import json
from ortak import *
d = json.load(open(f"{KOK}/tablolar/dizin.json"))
for i,t in enumerate(d['tablolar'][:65],1):
    T = tablo(t['id']); km = T.get('kaynakMetin'); k=T.get('kaynakMadde')
    if not km or not k: continue
    s = madde(k)['metin']; sd,pos = duzle(s); kd,_=duzle(km); kd=kd.strip()
    j = sd.find(kd)
    if j<0: continue
    a = pos[j]; b = pos[j+len(kd)-1]+1
    bas_kesik = a>0 and s[a-1].isalpha()
    son_kesik = b<len(s) and s[b].isalpha()
    son_cumle = km.rstrip()[-1] in '.!?)]:'
    if bas_kesik or son_kesik or not son_cumle:
        print(i, t['id'], 'baş-kesik' if bas_kesik else '', 'son-kelime-kesik' if son_kesik else '', '' if son_cumle else 'cümle-yarım', repr(km[-30:]))
