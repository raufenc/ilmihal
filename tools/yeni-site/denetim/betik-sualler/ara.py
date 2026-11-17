# kullanım: python3 ara.py "<regex (normal metinde)>" [madde ...] [-c N]
import json, re, sys, glob, os
KOK=os.path.join(os.path.dirname(__file__),'../../../../veri')
TR={'İ':'i','I':'ı','Â':'a','â':'a','Î':'i','î':'i','Û':'u','û':'u','’':"'",'‘':"'",'`':"'",'´':"'",'Ô':'o','ô':'o','Ê':'e','ê':'e'}
def norm(s):
    return ''.join(TR.get(c, c.lower() if len(c.lower())==1 else c) for c in s)
_M={}
def madde(k):
    if k not in _M: _M[k]=json.load(open(f'{KOK}/madde/{k}.json'))
    return _M[k]
def tum():
    f=json.load(open(f'{KOK}/fihrist.json'))
    return [f"{m['kisim']}-{m['no']}" for m in f['maddeler']]
def ara(pat, maddeler=None, c=150, en=40):
    r=re.compile(pat); n=0; out=[]
    for k in (maddeler or tum()):
        t=madde(k)['metin']; nt=norm(t)
        for mm in r.finditer(nt):
            a=max(0,mm.start()-c); b=min(len(t),mm.end()+c)
            out.append((k, t[a:b].replace('\n',' ⏎ ')))
            n+=1
            if n>=en: return out
    return out
if __name__=='__main__':
    a=sys.argv[1:]; c=150
    if '-c' in a: i=a.index('-c'); c=int(a[i+1]); del a[i:i+2]
    for k,s in ara(a[0], a[1:] or None, c):
        print(f'[{k}] …{s}…\n')
