import json,re
from ara import KOK
B=json.load(open('../sualler.json'))
hk={}
for x in B:
    for n in re.findall(r'\d+',x['kimlik'].split('/',1)[1]) if x['kimlik'].startswith(('cevap','sual')) else []:
        pass
def isaret(prefix):
    d={}
    for x in B:
        if not x['kimlik'].startswith(prefix): continue
        rest=x['kimlik'][len(prefix):]
        if '(' in rest: continue
        for n in re.findall(r'\d+',rest): d.setdefault(int(n),[]).append(x['sinif'])
    return d
# test
T=json.load(open(f'{KOK}/test-sorulari.json'))
tl=['| Konu / sıra | Soru (kısa) | Doğru şık | Hüküm |','|---|---|---|---|']
tb={x['kimlik']:x for x in B if x['kimlik'].startswith('test / ')}
for k in T['konular']:
    for i,s in enumerate(k['sorular'],1):
        key=f"test / {k['id']} / {i}"
        h='doğru' if key not in tb else ('düzeltilmeli ('+tb[key]['sinif']+')')
        tl.append(f"| {k['id']} / {i} | {s['soru'][:60]} | {s['siklar'][s['dogru']][:28]} | {h} |")
open('cizelge_test.md','w').write('\n'.join(tl))
# cevap
A=json.load(open(f'{KOK}/arama.json'))['sorular']; ci=isaret('cevap / ')
cl=[]
for i,s in enumerate(A,1):
    h=ci.get(i)
    cl.append(f"{i}:{'+'.join(sorted(set(h))) if h else 'doğru'}")
open('cizelge_cevap.txt','w').write(' · '.join(cl))
S=json.load(open(f'{KOK}/gunun-sualleri.json'))['sualler']; si=isaret('sual / ')
open('cizelge_sual.txt','w').write(' · '.join(f"{i}:{'+'.join(sorted(set(si[i]))) if i in si else 'doğru'}" for i in range(1,156)))
from collections import Counter
print(Counter('doğru' if i not in ci else 'bulgu' for i in range(1,230)), Counter('doğru' if i not in si else 'bulgu' for i in range(1,156)))
