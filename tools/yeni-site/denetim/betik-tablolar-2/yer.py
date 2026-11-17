# yer.py id once sonra  -> kaynakMetin'in bulunduğu yerin çevresi
import sys
from ortak import *
T=tablo(sys.argv[1]); k=T['kaynakMadde']; s=madde(k)['metin']
p=bul(k,(T['kaynakMetin'] or '')[:60])
a=int(sys.argv[2]) if len(sys.argv)>2 else 100; b=int(sys.argv[3]) if len(sys.argv)>3 else 2500
print('@',p,'/',len(s)); print(s[max(0,p-a):p+b])
