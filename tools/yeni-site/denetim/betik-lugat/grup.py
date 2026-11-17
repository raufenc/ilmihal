from ortak import *
import sys
I=isaretler(); M=json.load(open('metinler.json'))
G=[(2707,'hakk.*'),(4459,'kadın.*'),(2125,'fazla.*'),(2447,'geri.*'),(579,'.*'),(587,'ayna.*'),(587,'aynı.*'),(9638,'yedi.*'),(896,'bekr.*'),(9827,'ziyâde.*'),(8211,'sebze.*'),(2118,'fâtiha.*'),(8065,'deve.*'),(2746,'.*'),(8418,'sıra.*'),(9832,'.*'),(5822,'.*'),(1993,'.*'),(2838,'hanîfe'),(1258,'.*'),(4806,'.*'),(2875,'harekete'),(4595,'.*'),(8960,'talebe.*'),(7501,'.*'),(95,'.*'),(442,'.*'),(8006,'.*'),(1479,'.*'),(326,'altı(nda|na|ndan|ndaki)'),(7785,'râzî.*'),(1419,'.*'),(8977,'.*'),(382,'araba.*'),(1266,'.*'),(1269,'.*'),(2986,'.*'),(2985,'.*'),(509,'.*'),(475,'.*'),(812,'.*'),(7695,'.*'),(8313,'.*'),(1837,'.*'),(54,'.*'),(3445,'.*'),(531,'.*')]
sec=set(sys.argv[1:])
for i,rx in G:
    if i not in T: continue
    r=re.compile(rx)
    L=[x for x in I if x['id']==i and r.fullmatch(low(x['kelime']))]
    print(f'## {i} {T[i]["kelime"]} /{rx}/ -> {len(L)} | {T[i]["anlam"][:60]}')
    if str(i) in sec:
        for x in random.Random(2).sample(L,min(10,len(L))):
            t=M[x['madde']]['metin'];b=x['bas'];k=len(x['kelime'])
            print('    ',(t[max(0,b-38):b]+'['+x['kelime']+']'+t[b+k:b+k+28]).replace('\n',' '))
