"""Şahıs denetimi için ortak yardımcılar (yalnız okur)."""
import json, glob, re, os, unicodedata

KOK = '/Users/raufenc/Documents/Claude 2/ilmihal-site'
OZEL = {'â': 'a', 'Â': 'a', 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
        'î': 'i', 'Î': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u', 'û': 'u', 'Û': 'u',
        'ê': 'e', 'Ê': 'e', 'ô': 'o', 'Ô': 'o'}
KESME = "'’‘ʼʾʿ´`"


def duzle_eslemeli(t):
    """Normalleştirilmiş metin + her çıktı karakterinin asıl metindeki konumu."""
    out, pos = [], []
    n = len(t)
    for i, ch in enumerate(t):
        if ch in OZEL:
            c = OZEL[ch]
        elif ch in KESME:
            # iki harf arasında sil
            if 0 < i < n - 1 and t[i - 1].isalnum() and t[i + 1].isalnum():
                continue
            c = ' '
        elif ch in '-‐‑':
            c = '-' if (0 < i < n - 1 and t[i - 1].isalnum() and t[i + 1].isalnum()) else ' '
        elif unicodedata.category(ch) in ('Mn', 'Me'):
            continue
        elif ch.isalnum():
            c = ch.lower()
            c = unicodedata.normalize('NFD', c)[0]
        else:
            c = ' '
        if c == ' ' and out and out[-1] == ' ':
            continue
        out.append(c); pos.append(i)
    return ''.join(out), pos


def duzle(t):
    return duzle_eslemeli(t)[0]


def sahislar():
    return json.load(open(os.path.join(KOK, 'tools/yeni-site/denetim/betik-sahislar/hepsi.json')))


def maddeler():
    M = {}
    for f in glob.glob(os.path.join(KOK, 'veri/madde/*.json')):
        d = json.load(open(f))
        M[d['madde']] = d
    return M
