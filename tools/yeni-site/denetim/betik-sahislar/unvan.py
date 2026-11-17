"""Her şahıs için kitabın maddelerinde ve öbür hâl tercemelerinde adından hemen sonra gelen
hürmet ifadelerini toplar. Çıktı: unvan-kanit.json  {slug: {listeli:{ifade:[madde..]}, tum:{...}, bio:{...}, ornek:[...]}}"""
import json, re, sys
from ortak import *

KAT = {'â': 'a', 'Â': 'a', 'î': 'i', 'Î': 'i', 'û': 'u', 'Û': 'u', 'ı': 'i', 'I': 'i', 'İ': 'i',
       '’': "'", '‘': "'", 'ʼ': "'", 'ʾ': "'", 'ʿ': "'", '´': "'", '`': "'", 'ê': 'e', 'ô': 'o',
       'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g'}


def katla(t):
    """Uzunluğu koruyan katlama (konumlar asıl metinle aynı kalır)."""
    return ''.join(KAT.get(c, c).lower() if len(KAT.get(c, c).lower()) == 1 else KAT.get(c, c) for c in t)


def adlar(isim):
    """İsimden aranacak biçimler."""
    s = re.sub(r'\[.*?\]|\(.*?\)', ' ', isim)
    s = re.sub(r'\b(Han|Hân|I|II|III|IV|VI)\b\s*$', '', s).strip()
    parca = [p.strip() for p in re.split(r'\s+(?:veyâ|yâhud|ve)\s+', s) if p.strip()]
    out = []
    for p in parca:
        p = re.sub(r'\s+', ' ', p)
        if len(p) >= 3:
            out.append(katla(p))
    return list(dict.fromkeys(out))


HARF = "a-zçğıöşüâîû'"
SON = re.compile(r"^[a-zçğıöşüâîû'’]{0,7}(?:\s+(?:hazret(?:leri)?(?:nin|ne|ni|nden|nde)?|efendi(?:nin|ye|yi|den)?|hân(?:ın)?))?\s*(?:[“\"]([^”\"]{3,70})[”\"]|(aleyhisselâm|aleyhimesselâm|aleyhimüsselâm|aleyhirrahme|rahmetullahi[^.,;:()\n“”]{0,30}|radıyallahü[^.,;:()\n“”]{0,25}|kuddise[^.,;:()\n“”]{0,20}))")


def sinif(ifade):
    i = katla(ifade)
    if 'radiyallah' in i: return 'radiyallahu'
    if 'aleyhisselam' in i or 'aleyhimesselam' in i or 'aleyhimusselam' in i or 'sallallahu' in i or 'salevat' in i: return 'aleyhisselam'
    if 'kuddise' in i: return 'kuddise'
    if 'rahmetullah' in i or 'rahme' in i: return 'rahmetullahi'
    return 'diger:' + ifade


def bul(ad, fk, ham):
    """ad: katlanmış ad; fk: katlanmış metin; ham: asıl metin. (konum, ifade) üretir."""
    n = len(ad)
    i = fk.find(ad)
    while i >= 0:
        once = fk[i - 1] if i > 0 else ' '
        if not once.isalpha() and once != "'":
            sonra = ham[i + n:i + n + 120]
            m2 = SON.match(sonra)
            if m2:
                yield i, (m2.group(1) or m2.group(2)).strip()
            else:
                yield i, None
        i = fk.find(ad, i + 1)


if __name__ == '__main__':
    L = sahislar(); M = maddeler()
    MK = {k: katla(v['metin']) for k, v in M.items()}
    BIO = {x['slug']: x['biyografi'] for x in L}
    BK = {k: katla(v) for k, v in BIO.items()}
    sonuc = {}
    for x in L:
        r = {'adlar': adlar(x['isim']), 'listeli': {}, 'tum': {}, 'bio': {}, 'gecis': {}, 'ornek': []}
        for ad in r['adlar']:
            for k in M:
                for pos, ifade in bul(ad, MK[k], M[k]['metin']):
                    r['gecis'][k] = r['gecis'].get(k, 0) + 1
                    if ifade:
                        r['tum'].setdefault(ifade, []).append(k)
                        if k in x['maddeler']:
                            r['listeli'].setdefault(ifade, []).append(k)
                        if len(r['ornek']) < 6:
                            r['ornek'].append([k, M[k]['metin'][max(0, pos - 40):pos + len(ad) + 60]])
            for s, b in BIO.items():
                if s == x['slug']: continue
                for pos, ifade in bul(ad, BK[s], b):
                    if ifade:
                        r['bio'].setdefault(ifade, []).append(s)
        sonuc[x['slug']] = r
    json.dump(sonuc, open('unvan-kanit.json', 'w'), ensure_ascii=False, indent=0)
    print('tamam', len(sonuc))
