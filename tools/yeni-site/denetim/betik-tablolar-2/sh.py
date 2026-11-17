# sh.py madde "sorgu" ... -> tahmini sahîfe
import sys
from ortak import *
k=sys.argv[1]
for q in sys.argv[2:]:
    p=bul(k,q); print(p, sahife_tahmin(k,p) if p>=0 else None, q[:50])
