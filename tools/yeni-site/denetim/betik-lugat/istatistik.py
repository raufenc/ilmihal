import json, collections
T={int(k):v for k,v in json.load(open('terimler.json')).items()}
I=[json.loads(l) for l in open('isaretler.jsonl')]
def low(s): return s.replace('İ','i').replace('I','ı').lower()
c=collections.Counter(x['id'] for x in I)
print('toplam işaret',len(I),'farklı terim',len(c),'farklı biçim',len(set(low(x['kelime']) for x in I)))
print('--- en çok işaretlenen 80 terim')
for i,n in c.most_common(80):
    forms=collections.Counter(low(x['kelime']) for x in I if x['id']==i).most_common(6)
    print(n,i,T[i]['kelime'],'|',T[i]['anlam'][:70],'|',forms)
