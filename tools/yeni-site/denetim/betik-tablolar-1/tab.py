import sys, json
from ortak import tablo
t = tablo(sys.argv[1])
print(json.dumps(t, ensure_ascii=False, indent=1))
