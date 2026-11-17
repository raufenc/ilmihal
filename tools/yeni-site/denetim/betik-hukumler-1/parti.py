# Okuma partisi yazdırır: python3 parti.py <tur> <katman> <bas> <adet> [idler,virgüllü]
import json, sys
d = json.load(open('/Users/raufenc/Documents/Claude 2/ilmihal-site/tools/yeni-site/denetim/betik-hukumler-1/tarama.json'))
tur, katman, bas, adet = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
secili = None
if len(sys.argv) > 5: secili = set(int(x) for x in sys.argv[5].split(','))
L = [x for x in d if x['tur'] == tur and x['katman'] == katman]
if secili: L = [x for x in L if x['id'] in secili]
else: L = L[bas:bas + adet]
def kisa(s, n, son=False):
    s = s.replace('\n', ' ⏎ ')
    if len(s) <= n: return s
    return ('…' + s[-n:]) if son else (s[:n] + '…')
for i, x in enumerate(L):
    b = [y for y in x['bayrak'] if not y.startswith('kitapta-cumle-ortasinda')]
    if 'kitapta-cumle-ortasinda-basliyor' in x['bayrak']: b.append('ORTA-BAS')
    if 'kitapta-cumle-ortasinda-bitiyor' in x['bayrak']: b.append('ORTA-SON')
    m = x['metin'].replace('\n', ' ⏎ ')
    if len(m) > 1500 and not secili: m = m[:700] + f' …[UZUN BLOK: {len(m)} harf, ayrıca okunacak]… ' + m[-300:]
    print(f"[{bas+i}] #{x['id']} {x['madde']} s{x['sahife']} «{x['altTur']}» {' '.join(b)}")
    print('  Ö:', kisa(x.get('kitapOnce', ''), 170, True))
    print('  M:', m)
    print('  S:', kisa(x.get('kitapSonra', ''), 130))
