# Kullanım: baglam.py <terim id> [biçim regex] [adet]
from ortak import *
import sys
I=isaretler(); M=json.load(open('metinler.json'))
i=int(sys.argv[1]); rx=re.compile(sys.argv[2]) if len(sys.argv)>2 else None; n=int(sys.argv[3]) if len(sys.argv)>3 else 8
L=[x for x in I if x['id']==i and (not rx or rx.fullmatch(low(x['kelime'])))]
print(i,T[i]['kelime'],'|',T[i]['anlam'][:100],'| toplam',len(L))
r=random.Random(1)
for x in r.sample(L,min(n,len(L))):
    t=M[x['madde']]['metin'];b=x['bas'];k=len(x['kelime'])
    print('  ',x['madde'],(t[max(0,b-50):b]+'['+x['kelime']+']'+t[b+k:b+k+40]).replace('\n',' '))
