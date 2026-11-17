import sys, json
from ortak import *
from unvan import katla, adlar, bul
L={x['slug']:x for x in sahislar()}; M=maddeler()
BIO={k:v['biyografi'] for k,v in L.items()}
def goster(slug, yalniz_ifade=True, n=4, adlist=None):
    x=L[slug]; c=0
    for ad in (adlist or adlar(x['isim'])):
        for k in sorted(M):
            for pos,ifade in bul(ad, katla(M[k]['metin']), M[k]['metin']):
                if yalniz_ifade and not ifade: continue
                t=M[k]['metin']; print(f"  [{k} s.{M[k]['sahife']}] …{t[max(0,pos-70):pos+len(ad)+70]}…".replace('\n',' ')); c+=1
                if c>=n: return
if __name__=='__main__':
    for s in sys.argv[1:]:
        print('##',s,L[s]['isim'],L[s]['kategori'],repr(L[s]['unvan'])); goster(s)
