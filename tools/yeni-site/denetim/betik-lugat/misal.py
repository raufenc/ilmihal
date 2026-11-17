from ortak import *
import unicodedata
M=json.load(open('metinler.json'))
def nz(s):
    s=low(s); s=unicodedata.normalize('NFD',s); s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    s=s.replace('ı','i'); s=re.sub(r"[’'‘`ʼ´]",'',s); s=re.sub(r'[^a-z0-9çğöşü ]',' ',s.replace('ç','c').replace('ğ','g').replace('ö','o').replace('ş','s').replace('ü','u'))
    return re.sub(r'\s+',' ',s).strip()
KITAP=' '.join(nz(v['metin']) for v in M.values())
mis=[(i,T[i]['misal']) for i in sorted(T) if T[i].get('misal')]
tam=0;kismi=0;yok=0;kay=collections.defaultdict(lambda:[0,0,0]);ornek={'tam':[],'kismi':[],'yok':[]}
for i,m in mis:
    r=re.search(r'\(([^()]{2,80})\)\s*\.?\s*$',m.strip()); src=r.group(1).strip() if r else '—'
    govde=m.strip()[:r.start()] if r else m
    g=nz(govde); w=g.split()
    durum='yok'
    if len(g)>=20 and g in KITAP: durum='tam'
    else:
        # 6 kelimelik pencerelerden herhangi biri
        hit=sum(1 for k in range(0,max(1,len(w)-5),3) if ' '.join(w[k:k+6]) in KITAP)
        if hit and len(w)>=6: durum='kismi'
    {'tam':0,'kismi':1,'yok':2}
    idx={'tam':0,'kismi':1,'yok':2}[durum]; kay[src][idx]+=1
    if len(ornek[durum])<400: ornek[durum].append((i,T[i]['kelime'],src,govde[:140]))
    if durum=='tam':tam+=1
    elif durum=='kismi':kismi+=1
    else:yok+=1
print('misal',len(mis),'kitapta aynen',tam,'kısmen (6 kelimelik pencere)',kismi,'bulunamadı',yok)
for s,(a,b,c) in sorted(kay.items(),key=lambda z:-sum(z[1]))[:25]: print(f'  {s}: tam {a} kısmi {b} yok {c}')
json.dump(ornek,open('misal-ornek.json','w'),ensure_ascii=False,indent=0)
for d in ['tam','kismi']:
    print('--',d)
    for o in random.Random(4).sample(ornek[d],6): print('  ',o)
