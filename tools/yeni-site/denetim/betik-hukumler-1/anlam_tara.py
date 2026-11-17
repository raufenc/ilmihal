# İki katmanda, tür kelimesinin hüküm dışı anlamda geçtiği kayıtları betikle sayar
import json, re, collections, unicodedata
d=json.load(open('tarama.json'))
def n(s):
    s=s.lower().replace('i̇','i'); s=unicodedata.normalize('NFKD',s); s=''.join(c for c in s if not unicodedata.combining(c))
    return s.replace('ı','i').replace('’',"'")
R={
 'sunnet':[('hitân (sünnet olmak/etdirmek, sünnet derisi, sünnetci)', r"sunnet (etdir|ettir|edil|derisi)|sunnetci|sunnet olma(si|k)? (sart|yas)|sunnet olmakla|olmus goruldu|sunnetin acisi|alameti, sunnet olmak|nasil yapilacagi|ziyafet, sunnet"),
           ('kaynak/hadîs (Kitâb ve sünnet, sünnet = hadîs)', r"kitab(dan)? (ve|ile)? ?sunnet|kitab, sunnet|sunnet, ya'?ni hadis|kitabullah ve sunnet|sunnet ve icma|sunnet, icma"),
           ('yalnız Ehl-i sünnet', None)],
 'farz':[('farz etmek = varsaymak', r"farz ed(elim|ersek|ilirse|ilse|erek|ersen|ilen)|farz edilir"),
         ('farz = mîrâs hissesi (ferâiz)', r"farzin(in)? (\[hisse|payda)|farz sahib|alti farz|farzi \[|hissesini \[farz")],
 'vacib':[('Vâcib-ül-vücûd / kelâm', r"vacib-?ul-? ?vucud|vacib, mumkin|mumkin, hic vacib|hic vacib olur|vacib, \[ya'?ni allah"),
          ('hadîs: şefâ\'at/Cennet vâcib olur', r"(sefa'?at(im)?|cennet) (etmek bana )?vacib ol")]}
out=collections.defaultdict(list)
for x in d:
    t=x['tur']
    if t not in R: continue
    s=n(x['metin'])
    for ad,re_ in R[t]:
        if re_ is None:
            if 'ehl-i sunnet' in s or 'ehli sunnet' in s:
                rest=re.sub(r"ehl-?i sunnet\w*",'',s)
                if not re.search(r"(^|[^a-z])sunnet",rest): out[(t,ad)].append((x['id'],x['katman']))
        elif re.search(re_,s): out[(t,ad)].append((x['id'],x['katman']))
res={}
for (t,ad),L in out.items():
    c=collections.Counter(k for _,k in L)
    print(t,'|',ad,'|',dict(c),'|',[i for i,_ in L][:40])
    res[f'{t}|{ad}']=L
json.dump(res,open('anlam-tarama.json','w'),ensure_ascii=False,indent=0)
