import json,re,collections
from ara import norm, madde, KOK
oz=json.load(open(f'{KOK}/ozetler.json'))['ozetler']
def ws(s): return re.sub(r'\s+',' ',s).strip()
st=collections.Counter(); ornek=collections.defaultdict(list)
for k,o in oz.items():
    if o is None: st['bos']+=1; ornek['bos'].append(k); continue
    t=madde(k)['metin']; nt=ws(norm(t)); no=ws(norm(o)).rstrip('…').rstrip()
    p=nt.find(no)
    if p<0: st['aynen_yok']+=1; ornek['aynen_yok'].append(k); continue
    st['aynen']+=1
    # position relative to text start (skip heading)
    if p>400: st['ileride>400']+=1; ornek['ileride'].append((k,p))
    if no.startswith('bu mektub'): st['mektub_girisi']+=1; ornek['mektub'].append(k)
    if o.endswith('…'):
        nxt=nt[p+len(no):p+len(no)+2]
        if not o.rstrip('…').rstrip().endswith(('.','!','?',')',':')): st['cumle_ortasi']+=1
    else: st['tam']+=1
    if re.search(r'\b(süal|cevab)\b',no[:20]): st['sual_ile']+=1
print(st); 
for k,v in ornek.items(): print(k, v[:15])
