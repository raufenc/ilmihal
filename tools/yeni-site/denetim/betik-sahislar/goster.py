import sys
from ortak import *
L={x['slug']:x for x in sahislar()}
for s in sys.argv[1:]:
    x=L[s]; print(f"### {s} | {x['isim']} | {x['kategori']} | {x['unvan']} | {x['kaynak']}\n{x['biyografi']}\n")
