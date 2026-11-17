import sys, json
from ortak import *
for id_ in sys.argv[1:]:
    T=tablo(id_)
    print('#####', id_, '|', T['baslik'], '|', T['tip'], T['kaynakMadde'], T['sahife'], '| not:', T.get('kaynakNotu'))
    print('ACIK:', T.get('aciklama'))
    if T.get('kolonlarTam'): print('KOL:', T['kolonlarTam'])
    if T.get('solBaslik'): print('SOL/SAG:', T.get('solBaslik'), T.get('sagBaslik'))
    v=T.get('veriler')
    if isinstance(v,list):
        for r in v: print(' -', json.dumps(r, ensure_ascii=False))
    elif v: print(json.dumps(v, ensure_ascii=False, indent=0))
    if T.get('dallar'): print('DALLAR:', json.dumps(T['dallar'], ensure_ascii=False))
    ek=[x for x in T if x not in ('id','parca','baslik','tip','kategori','kaynakMadde','kaynakNotu','sahife','kaynakMetin','aciklama','kolonlar','kolonlarTam','veriler','dallar','solBaslik','sagBaslik')]
    if ek: print('EK ALANLAR:', {x:T[x] for x in ek})
