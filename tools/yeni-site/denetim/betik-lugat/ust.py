from ortak import *
import sys
I=isaretler()
c=collections.Counter(x['id'] for x in I)
a,b=int(sys.argv[1]),int(sys.argv[2])
for i,n in c.most_common()[a:b]:
    forms=collections.Counter(low(x['kelime']) for x in I if x['id']==i).most_common(5)
    print(n,i,T[i]['kelime'],'|',T[i]['anlam'][:55],'|',' '.join(f'{f}:{k}' for f,k in forms))
