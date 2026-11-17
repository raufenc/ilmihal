from ortak import *
I=isaretler(); M=json.load(open('metinler.json'))
ad=[i for i in T if re.search(r'\((aleyhisselâm|aleyhimesselâm)',T[i]['kelime'])]
print('aleyhisselâm başlıklı terim',len(ad))
iyi=re.compile(r'^\W{0,3}(“|")?\s*(aleyh|sallallah|alâ nebiyyinâ|salevât)',re.I)
for i in ad+[3548]:
    L=[x for x in I if x['id']==i]
    if not L: continue
    bad=[]
    for x in L:
        t=M[x['madde']]['metin']; s=t[x['bas']+len(x['kelime']):x['bas']+len(x['kelime'])+30]
        # ekli biçimlerde ek kelimeye bitişik
        if not iyi.search(s): bad.append((t[max(0,x['bas']-30):x['bas']]+'['+x['kelime']+']'+s).replace('\n',' '))
    print(i,T[i]['kelime'],'toplam',len(L),'ardında salavât yok',len(bad))
    for b in random.Random(3).sample(bad,min(6,len(bad))): print('     ',b)
