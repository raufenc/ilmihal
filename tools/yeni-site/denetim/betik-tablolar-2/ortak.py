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

# --- sahîfe tahmini: hüküm/âyet/hadîs/tanım kayıtlarındaki (metin, sahife) çapaları ile
_CAPA = None
def capalar():
    global _CAPA
    if _CAPA is not None: return _CAPA
    _CAPA = {}
    kay = []
    for p in glob.glob(f"{KOK}/hukumler/*-tum.json"):
        for h in json.load(open(p))['hukumler']:
            if h.get('madde'): kay.append((h['madde'], h['metin'], h['sahife']))
    ah = json.load(open(f"{KOK}/ayet-hadis.json"))
    for x in ah['ayetler']+ah['hadisler']:
        if x.get('madde'): kay.append((x['madde'], x['metin'], x['sahife']))
    for x in json.load(open(f"{KOK}/tanimlar.json"))['tanimlar']:
        if x.get('madde'): kay.append((x['madde'], x['cumle'], x['sahife']))
    dz = {}
    for k, met, sh in kay:
        if k not in dz: dz[k] = duzle(madde(k)['metin'])
        d, pos = dz[k]
        q = duzle(met)[0].strip()[:80]
        if len(q) < 25: continue
        i = d.find(q)
        if i >= 0 and d.find(q, i+1) < 0:
            _CAPA.setdefault(k, []).append((pos[i], sh))
    for k in _CAPA: _CAPA[k].sort()
    return _CAPA
def sahife_tahmin(k, p):
    m = madde(k); bas, son = m['sahife']
    c = [(0, bas)] + capalar().get(k, []) + [(len(m['metin']), son)]
    onc = max((x for x in c if x[0] <= p), default=c[0])
    son_ = min((x for x in c if x[0] >= p), default=c[-1])
    return onc[1], son_[1]
def bul(k, q):
    s = madde(k)['metin']
    i = s.find(q)
    if i >= 0: return i
    d, pos = duzle(s); qd = duzle(q)[0].strip()
    j = d.find(qd)
    return pos[j] if j >= 0 else -1
