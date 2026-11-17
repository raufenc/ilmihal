import sys, difflib
from ortak import *
for id_ in sys.argv[1:]:
    T=tablo(id_); km=T['kaynakMetin']; k=T['kaynakMadde']; s=madde(k)['metin']
    print('=====',id_); print('KM:',km)
    # parçala cümlelere, her birini ara
    import re
    for parca in re.split(r'(?<=[.!?:])\s+', km):
        if len(parca)<8: continue
        p=bul(k,parca)
        print('  ', 'VAR' if p>=0 else 'YOK', p, '|', parca[:100])
