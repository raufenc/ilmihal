import json,re
from ara import norm, madde, tum, KOK
d=json.load(open(f'{KOK}/gunun-sualleri.json'))
def ws(s): return re.sub(r'\s+',' ',s)
F={f"{m['kisim']}-{m['no']}":m for m in json.load(open(f'{KOK}/fihrist.json'))['maddeler']}
res=[]
for i,s in enumerate(d['sualler'],1):
    q=ws(norm(s['soru'])).strip()
    t=madde(s['madde'])['metin']; nt=ws(norm(t))
    pos=nt.find(q)
    where=None
    if pos<0:
        # try prefix
        for L in (80,40,25):
            pos=nt.find(q[:L])
            if pos>=0: where=f'prefix{L}'; break
    else: where='tam'
    if pos<0:
        hits=[m for m in tum() if q[:40] in ws(norm(madde(m)['metin']))]
        res.append((i,'YOK',hits,s['resmi'],'','')); continue
    before=nt[max(0,pos-60):pos]
    after=nt[pos+len(q):pos+len(q)+200]
    baslik_ok = s['baslik']==F[s['madde']]['baslik']
    res.append((i,where,s['madde'],s['resmi'],before[-60:],after[:200], baslik_ok))
for r in res: print(r)
