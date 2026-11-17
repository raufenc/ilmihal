from ortak import *
wm,kay,golge=sozluk()
I=isaretler()
# Sözlük dizisinin sırası id sırası mı? kontrol: sozluk-data.js sırası
import json
raw=open('../../../../sozluk-data.js').read()
ids=[int(x) for x in re.findall(r'\{"i": ?(\d+),',raw)]
print('dizi id artan mı', ids==sorted(ids), len(ids))
bad=0;ek=collections.Counter();exact=0
for x in I:
    i,s=coz(x['kelime'],wm)
    if i!=x['id']: bad+=1
    if s=='' : exact+=1
    else: ek[s]+=1
print('yeniden kurulumla uyuşmayan',bad,'tam eşleşme',exact,'ek atılarak',len(I)-exact)
print(ek.most_common(40))
print('gölgelenen parantez adları',len(golge))
gi=collections.Counter()
for x in I:
    pass
G={k:(i,j) for k,i,j in golge}
cnt=collections.Counter(low(x['kelime']) for x in I)
for k,(i,j) in sorted(G.items(), key=lambda z:-sum(v for f,v in cnt.items() if f==z[0])):
    n=cnt.get(k,0)
    print(n,k,'| istenen',i,T[i]['kelime'],':',T[i]['anlam'][:50],'| giden',j,T[j]['kelime'],':',T[j]['anlam'][:50])
