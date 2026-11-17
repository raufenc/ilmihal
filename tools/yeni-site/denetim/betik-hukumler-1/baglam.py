# Geniş bağlam: python3 baglam.py <id> [once=900] [sonra=300]
import json, sys, unicodedata
d = json.load(open('/Users/raufenc/Documents/Claude 2/ilmihal-site/tools/yeni-site/denetim/betik-hukumler-1/tarama.json'))
idx = {}
for x in d: idx.setdefault(x['id'], x)
once = int(sys.argv[2]) if len(sys.argv) > 2 else 900
sonra = int(sys.argv[3]) if len(sys.argv) > 3 else 300
for i in sys.argv[1].split(','):
    x = idx[int(i)]
    m = json.load(open(f"/Users/raufenc/Documents/Claude 2/ilmihal-site/veri/madde/{x['kitapMadde']}.json"))['metin']
    k = m.find(x['kitapAsil'])
    print(f"=== #{i} {x['kitapMadde']} s{x['sahife']}")
    print(m[max(0,k-once):k].replace('\n',' ⏎ '), ' <<<KAYIT>>> ', m[k+len(x['kitapAsil']):k+len(x['kitapAsil'])+sonra].replace('\n',' ⏎ '))
