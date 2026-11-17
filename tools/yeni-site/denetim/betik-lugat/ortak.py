import json, re, collections, random
T={int(k):v for k,v in json.load(open('terimler.json')).items()}
SUF=['larından','lerinden','larının','lerinin','larında','lerinde','larına','lerine','ların','lerin','ları','leri','ından','inden','ünden','undan','ının','inin','ünün','unun','ında','inde','ünde','unde','ına','ine','üne','una','daki','deki','taki','teki','lar','ler','dan','den','tan','ten','nın','nin','nün','nun','dır','dir','dur','dür','tır','tir','tur','tür','ın','in','ün','un','da','de','ta','te','ya','ye','na','ne','nı','ni','nu','nü','ı','i','u','ü','a','e']
def low(s): return s.replace('İ','i').replace('I','ı').lower().replace('̇','')
def sozluk():
    wm={}; kaynak={}; alt=[]
    for i in sorted(T):  # sozlukData sırası = id sırası mı? (dizide k alfabetik, i artan)
        e=T[i]; k=e['kelime']
        m=re.match(r'^([^(]+?)(?:\s*\(([^)]+)\))?$',k)
        main=m.group(1).strip() if m else k.strip(); par=m.group(2).strip() if m and m.group(2) else None
        if ' ' not in main and '-' not in main:
            kk=low(main).strip()
            if len(kk)>=2:
                if kk not in wm: wm[kk]=i; kaynak[kk]='ana'
        if not(' ' in main or '-' in main) and par:
            for p in re.split(r'[,;/]',par):
                p=p.strip()
                if len(p)>=2 and 'aleyhi' not in p and ' ' not in p and '-' not in p: alt.append((p,i))
    golge=[]
    for p,i in alt:
        kk=low(p).strip()
        if len(kk)<2: continue
        if kk not in wm: wm[kk]=i; kaynak[kk]='parantez'
        elif wm[kk]!=i: golge.append((kk,i,wm[kk]))
    return wm,kaynak,golge
def coz(form,wm):
    l=low(form)
    if l in wm: return wm[l],''
    for suf in reversed(SUF):
        if len(l)>len(suf)+2 and l.endswith(suf):
            st=l[:-len(suf)]
            if st in wm: return wm[st],suf
    return None,None
def isaretler(): return [json.loads(l) for l in open('isaretler.jsonl')]
