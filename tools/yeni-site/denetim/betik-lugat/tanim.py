from ortak import *
import unicodedata
def nz(s):
    s=low(s); s=unicodedata.normalize('NFD',s); s=''.join(c for c in s if unicodedata.category(c)!='Mn').replace('ı','i')
    return re.sub(r"[’'‘`\s\-]",'',s)
D=json.load(open('../../../../veri/tanimlar.json'))['tanimlar']
idx=collections.defaultdict(list)
for i in T:
    k=T[i]['kelime']; m=re.match(r'^([^(]+?)(?:\s*\(([^)]+)\))?$',k)
    for p in [m.group(1) if m else k] + (re.split(r'[,;/]',m.group(2)) if m and m.group(2) else []):
        idx[nz(p)].append(i)
es=[]
for d in D:
    L=idx.get(nz(d['terim']),[])
    es.append((d,L))
print('tanım',len(D),'lügatte karşılığı olan',sum(1 for d,L in es if L))
json.dump([{'terim':d['terim'],'madde':d['madde'],'sahife':d['sahife'],'cumle':d['cumle'],'lugat':[{'id':i,'kelime':T[i]['kelime'],'anlam':T[i]['anlam']} for i in L]} for d,L in es if L],open('tanim-eslesme.json','w'),ensure_ascii=False,indent=0)
