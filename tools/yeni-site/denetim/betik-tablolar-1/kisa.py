import sys, json
from ortak import tablo
for id_ in sys.argv[1:]:
    t = tablo(id_)
    print("=====", id_, "|", t['baslik'], "|", t['tip'], "|", t['kaynakMadde'], "s.", t['sahife'], "| not:", t.get('kaynakNotu'))
    print("KM:", t.get('kaynakMetin'))
    print("AÇ:", t.get('aciklama'), "| kol:", t.get('kolonlarTam'), "| sol/sag:", t.get('solBaslik'), t.get('sagBaslik'))
    v = t.get('veriler')
    if isinstance(v, list):
        for r in v: print("  -", json.dumps(r, ensure_ascii=False))
    elif isinstance(v, dict):
        for k, l in v.items():
            print(" [", k, "]")
            for r in l: print("   -", json.dumps(r, ensure_ascii=False))
    if t.get('dallar'): print(json.dumps(t['dallar'], ensure_ascii=False, indent=1))
