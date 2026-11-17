import json,sys
d={x['id']:x for x in json.load(open('tarama.json'))}
p=json.load(open('tum-plan.json'))
t=sys.argv[1]; bas=int(sys.argv[2]); adet=int(sys.argv[3])
ids=sorted(set(p[t]['supheliYeni'])|set(p[t]['orneklemYeni']))
orn=set(p[t]['orneklem'])
for i in ids[bas:bas+adet]:
    x=d[i]; m=x['metin'].replace('\n',' ⏎ ')
    if len(m)>320: m=m[:220]+' …['+str(len(m))+']… '+m[-80:]
    print(f"#{i}{'*' if i in orn else ''} {x['kitapMadde'] if x.get('kitapMadde') else 'YOK'} «{x['altTur']}» {m}")
print('TOPLAM', len(ids))
