import json,random
exec(open('dok.py').read().split("for t in ['mubah'")[0])
SUP=('COKLU','OLUMSUZ','ANLAM','KELIME_YOK','BULUNAMADI')
plan={}
for t in ['mubah','mekruh','haram']:
    tum=[b for b in S if b['tur']==t and b['kat']=='tum']
    rnd=random.Random(20261117); orn=rnd.sample(tum,100)
    oid={b['id'] for b in orn}
    sup=[b for b in tum if not b['acikta'] and b['id'] not in oid and any(i.startswith(SUP) for i in b['isaret'])]
    for b in orn: b['_neden']='orneklem'
    for b in sup: b['_neden']='supheli'
    L=sorted(orn,key=lambda b:b['id'])+sup
    plan[t]={'orneklem':[b['id'] for b in orn],'supheli':[b['id'] for b in sup],'orneklemAcikta':sum(b['acikta'] for b in orn)}
    print(t,len(orn),'acikta',plan[t]['orneklemAcikta'],'supheli-ek',len(sup))
    if t=='haram':
        yaz(L[:200],'oku-haram-tum-1.txt'); yaz(L[200:],'oku-haram-tum-2.txt')
    else: yaz(L,f'oku-{t}-tum.txt')
json.dump(plan,open('tum-plan.json','w'))
