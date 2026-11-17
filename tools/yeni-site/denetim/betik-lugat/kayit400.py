from ortak import *
import sys
I=isaretler(); M=json.load(open('metinler.json'))
byid=collections.defaultdict(list)
for x in I: byid[x['id']].append(x)
ids=sorted(T); S=sorted(random.Random(400).sample(ids,400))
json.dump(S,open('kayit400.json','w'))
a,b=int(sys.argv[1]),int(sys.argv[2])
for n,i in enumerate(S[a:b],a+1):
    t=T[i]; L=byid.get(i,[])
    ctx=''
    if L:
        x=L[0]; mt=M[x['madde']]['metin']; ctx=f" ⟨{len(L)}× {x['madde']}: "+mt[max(0,x['bas']-35):x['bas']+len(x['kelime'])+30].replace('\n',' ')+'⟩'
    print(f"{n}. {i} {t['kelime']} [{t['koken']}] {t['osmanlica'] or '∅'} — {t['anlam'][:170]}{' (M)' if t.get('misal') else ''}{' →'+t['bakiniz'] if t.get('bakiniz') else ''}{ctx}")
