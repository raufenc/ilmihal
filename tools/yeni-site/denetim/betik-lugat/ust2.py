from ortak import *
import sys
I=isaretler()
c=collections.Counter(x['id'] for x in I)
F=collections.defaultdict(collections.Counter)
for x in I: F[x['id']][low(x['kelime'])]+=1
a,b=int(sys.argv[1]),int(sys.argv[2])
for i,n in c.most_common()[a:b]:
    print(n,i,T[i]['kelime'][:22],'|',T[i]['anlam'][:28],'|',' '.join(f'{f}:{k}' for f,k in F[i].most_common(4)))
