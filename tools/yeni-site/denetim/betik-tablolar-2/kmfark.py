import sys, json, difflib
from ortak import *
d = json.load(open(f"{KOK}/tablolar/dizin.json"))
sec = sys.argv[1:] 
for i,t in enumerate(d['tablolar'][65:],66):
    if sec and t['id'] not in sec: continue
    T = tablo(t['id']); km = T.get('kaynakMetin')
    if not km or not T.get('kaynakMadde'): continue
    s = madde(T['kaynakMadde'])['metin']
    if km in s: continue
    kd,_ = duzle(km); kd=kd.strip()
    sd,pos = duzle(s)
    j = sd.find(kd)
    if j<0: continue
    a = pos[j]; b = pos[j+len(kd)-1]+1
    asil = s[a:b+3]
    sm = difflib.SequenceMatcher(None, km, asil, autojunk=False)
    fark=[(op, km[i1:i2], asil[j1:j2]) for op,i1,i2,j1,j2 in sm.get_opcodes() if op!='equal']
    print(i, t['id'], fark[:12])
