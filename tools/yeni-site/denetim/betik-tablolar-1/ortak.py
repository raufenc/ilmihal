import json, os, re, sys, unicodedata, glob
KOK = "/Users/raufenc/Documents/Claude 2/ilmihal-site/veri"
def duz_ch(c):
    if c in 'Iİ': return 'i'
    if c == 'ı': return 'i'
    d = unicodedata.normalize('NFKD', c)
    d = ''.join(x for x in d if not unicodedata.combining(x)).lower()
    return d
def duzle(s):
    out=[]; pos=[]
    prev_sp=True
    for i,c in enumerate(s):
        d = duz_ch(c)
        for x in d:
            if x.isalnum():
                out.append(x); pos.append(i); prev_sp=False
            elif x in "'’‘`ʼ´":
                continue  # kesme yok say
            else:
                if not prev_sp:
                    out.append(' '); pos.append(i); prev_sp=True
    return ''.join(out), pos
_M = {}
def madde(k):
    if k not in _M:
        _M[k] = json.load(open(f"{KOK}/madde/{k}.json"))
    return _M[k]
def tum_maddeler():
    return sorted([os.path.basename(p)[:-5] for p in glob.glob(f"{KOK}/madde/*.json")], key=lambda x: tuple(map(int,x.split('-'))))
def tablo(id_):
    p = id_.replace('_','-')
    return json.load(open(f"{KOK}/tablolar/{p}.json"))
