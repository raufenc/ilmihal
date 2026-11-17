# Sabit tohumla 600 işaret (tohum 20261117); bağlamıyla yazar
from ortak import *
import sys
I=isaretler()
M=json.load(open('metinler.json'))
rnd=random.Random(20261117)
S=rnd.sample(range(len(I)),600)
out=[]
for n,k in enumerate(S):
    x=I[k]; t=M[x['madde']]['metin']; b=x['bas']; L=len(x['kelime'])
    ctx=(t[max(0,b-45):b]+'['+x['kelime']+']'+t[b+L:b+L+40]).replace('\n',' ')
    out.append({'n':n+1,'sira':k,'madde':x['madde'],'kelime':x['kelime'],'id':x['id'],'terim':T[x['id']]['kelime'],'anlam':T[x['id']]['anlam'],'baglam':ctx})
json.dump(out,open('orneklem600.json','w'),ensure_ascii=False,indent=0)
a,b=int(sys.argv[1]),int(sys.argv[2])
for o in out[a:b]:
    print(o['n'],o['madde'],o['terim'][:18],'«'+o['anlam'][:75]+'»',o['baglam'])
