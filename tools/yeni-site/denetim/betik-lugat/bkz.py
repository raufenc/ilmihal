from ortak import *
import unicodedata
def nz(s):
    s=low(s); s=unicodedata.normalize('NFD',s); s=''.join(c for c in s if unicodedata.category(c)!='Mn').replace('ı','i')
    return re.sub(r"[’'‘`\s\-]",'',s)
idx=collections.defaultdict(list)
for i in T:
    k=T[i]['kelime']; m=re.match(r'^([^(]+?)(?:\s*\(([^)]+)\))?$',k)
    idx[nz(m.group(1) if m else k)].append(i)
B=[i for i in sorted(T) if T[i].get('bakiniz')]
bul=[];yok=[]
for i in B:
    hedefler=[h.strip() for h in re.split(r'[,;]',T[i]['bakiniz']) if h.strip()]
    for h in hedefler:
        L=idx.get(nz(h),[])
        (bul if L else yok).append((i,h,L))
print('bakiniz alanı dolu',len(B),'hedef',len(bul)+len(yok),'bulunan',len(bul),'bulunamayan',len(yok))
print('-- bulunanlar (kaynak | hedef | hedef anlam)')
for i,h,L in bul:
    j=L[0]; print(f"  {i} {T[i]['kelime']} «{T[i]['anlam'][:60]}» → {h} [{j}] «{T[j]['anlam'][:60]}»{' +'+str(len(L)-1) if len(L)>1 else ''}")
print('-- bulunamayanlardan 20')
for i,h,L in yok[:20]: print('  ',i,T[i]['kelime'],'→',h)
print('== ŞÜPHELİ (anlam örtüşmesi düşük)')
def kel(s): return set(w for w in re.findall(r'\w{4,}',low(s)))
sup=[]
for i,h,L in bul:
    best=max(L,key=lambda j: len(kel(T[i]['anlam'])&kel(T[j]['anlam'])))
    a,b=kel(T[i]['anlam']),kel(T[best]['anlam'])
    ort=len(a&b)/max(1,min(len(a),len(b)))
    if ort<0.15: sup.append((i,h,best)); print(f"  {i} {T[i]['kelime']} «{T[i]['anlam'][:90]}» → {h} [{best} {T[best]['kelime']}] «{T[best]['anlam'][:90]}»")
print(len(sup))
