# okuma parçaları: her kayıt için önceki cümle(ler) + cümle + sonraki cümle
import json,re,sys
S=json.load(open('tarama.json'))
import os
_K='../../../../veri/hukumler/'
_B={}
for _t in ['mubah','mekruh','haram']:
    for _k in ['acik','tum']:
        for _h in json.load(open(_K+f'{_t}-{_k}.json'))['hukumler']: _B[(_t,_k,_h['id'])]=_h.get('baglam','')
for b in S: b['_baglam']=_B[(b['tur'],b['kat'],b['id'])]
def son_cumle(t,n=220):
    t=t.replace('\n',' ¶ ')
    if len(t)>n: t='…'+t[-n:]
    return t
def ilk_cumle(t,n=180):
    t=t.replace('\n',' ¶ ')
    return t[:n]+('…' if len(t)>n else '')
def yaz(kayitlar,dosya):
    with open(dosya,'w') as f:
        for b in kayitlar:
            isr=[i for i in b['isaret'] if not i.startswith('KISA')]
            f.write(f"#{b['id']} [{b['altTur']}] {b['madde']} s.{b['sahife']} {' '.join(isr)}\n")
            if b.get('_baglam'): f.write(f"  BAGLAM-ALANI(sitede görünür): {b['_baglam'][:260].replace(chr(10),' ')}\n")
            if 'once' in b:
                f.write(f"  < {son_cumle(b['once'])}\n  = {b['metin']}\n  > {ilk_cumle(b['sonra'])}\n")
            else:
                f.write(f"  = {b['metin']}\n  KISMI: {b.get('kismi')}\n")
for t in ['mubah','mekruh','haram']:
    a=[b for b in S if b['tur']==t and b['kat']=='acik']
    for k in range(0,len(a),110):
        yaz(a[k:k+110], f'oku-{t}-acik-{k//110+1:02d}.txt')
    print(t, len(a))
