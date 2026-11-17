import json,re
from ara import norm, madde, KOK
f=json.load(open(f'{KOK}/fihrist.json'))
def toks(s): return [w for w in re.findall(r"[a-zçğıöşü]+", norm(s)) if len(w)>2]
out=[]
for m in f['maddeler']:
    k=f"{m['kisim']}-{m['no']}"; t=madde(k)['metin']
    lines=[l for l in t.split('\n') if l.strip()]
    i=0
    while i<len(lines) and not re.match(r'^\s*\d+\s*[—–-]',lines[i]): i+=1
    first=lines[i] if i<len(lines) else lines[0]
    head=re.sub(r'^\s*\d+\s*[—–-]\s*','',first)
    tip='baslik' if (head.upper()==head and len(head)<200) else 'metin'
    if 'MEKTÛB' in head.upper() and tip=='baslik': tip='mektub'
    bt=toks(m['baslik']); 
    ref=head if tip=='baslik' else ' '.join(lines[i:i+3])[:1500]
    rt=set(toks(ref)); cov=sum(1 for w in bt if w in rt)/max(1,len(bt))
    nb=norm(m['baslik']).strip(' .?'); nh=norm(head).strip(' .?')
    aynen = nb==nh
    out.append((k,tip,round(cov,2),aynen,m['baslik'],head[:140]))
import collections
print(collections.Counter(o[1] for o in out), 'aynen:',sum(o[3] for o in out))
json.dump(out,open('baslik_kontrol.json','w'),ensure_ascii=False,indent=0)
for o in out:
    if o[1]=='baslik' and not o[3]: print('B≠',o)
