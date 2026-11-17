# tum katmanı: açık kayıtla aynı olanları eşle, örneklem (sabit tohum 20261117) ve şüpheli kümeyi çıkar
import json, random, re, collections, unicodedata
d=json.load(open('tarama.json'))
def norm(s):
    s=unicodedata.normalize('NFKD',s.lower()); s=''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9ıçğöşü]+',' ',s).strip()
acik={}
for x in d:
    if x['katman']=='acik': acik.setdefault((x['tur'],norm(x['metin'])),x['id'])
# kararlar
v={}
for l in open('okuma.txt'):
    l=l.strip()
    if re.match(r'^\d+\|',l):
        p=l.split('|',2); v[int(p[0])]=p[1]
out={}
rnd=random.Random(20261117)
for t in ['farz','vacib','sunnet']:
    T=[x for x in d if x['tur']==t and x['katman']=='tum']
    es={x['id']:acik.get((t,norm(x['metin']))) for x in T}
    orn=sorted(rnd.sample([x['id'] for x in T],80))
    sup=[x['id'] for x in T if any(not b.startswith('kitapta-cumle-ortasinda') for b in x['bayrak']) or 'kitapta-cumle-ortasinda-basliyor' in x['bayrak']]
    yeni_sup=[i for i in sup if es[i] is None]
    out[t]={'toplam':len(T),'aciktaVar':sum(1 for i in es if es[i]),'orneklem':orn,'orneklemYeni':[i for i in orn if es[i] is None],
            'supheli':len(sup),'supheliYeni':yeni_sup,'esleme':{str(k):v_ for k,v_ in es.items() if v_}}
    print(t,len(T),'açıkta da var:',out[t]['aciktaVar'],'örneklem yeni:',len(out[t]['orneklemYeni']),'şüpheli:',len(sup),'şüpheli yeni:',len(yeni_sup))
json.dump(out,open('tum-plan.json','w'),ensure_ascii=False,indent=0)
