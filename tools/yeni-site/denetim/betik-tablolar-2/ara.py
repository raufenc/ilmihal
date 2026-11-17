# ara.py <madde|all> <sorgu> [genislik]
import sys
from ortak import *
hedef, q = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv)>3 else 200
qd,_ = duzle(q); qd=qd.strip()
ks = tum_maddeler() if hedef=='all' else hedef.split(',')
n=0
for k in ks:
    m = madde(k); s = m['metin']; d,pos = duzle(s)
    i = d.find(qd)
    while i!=-1 and n<40:
        a = pos[i]; b = pos[min(i+len(qd)-1, len(pos)-1)]+1
        print(f"--- {k} s.{m['sahife']} @{a}: ...{s[max(0,a-w):b+w]}...".replace('\n',' / '))
        n+=1
        i = d.find(qd, i+1)
print("toplam", n)
