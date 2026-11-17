# Kitapta başka mezheb hulâsası olan bloklar içine düşen kayıtları bulur (bütün türler, iki katman).
import json, collections
KOK='/Users/raufenc/Documents/Claude 2/ilmihal-site'
BLOK=[('1-54','(Şâfi’î mezhebinde guslün farzı ikidir','mezhebini taklîd eder).','Şâfi’î (Nemâz risâlesi nakli)'),
      ('1-54','[(El-mukaddemet-ül-izziyye)de diyor ki, (Mâlikî','tekbîr-i teşrîk sünnetdir.)','Mâlikî (El-mukaddemet-ül-izziyye nakli)'),
      ('1-56','(El-fıkh-u alel-mezâhib-il erbe’a)da diyor ki, (Mâlikî','] El ile yıkanan','Mâlikî (El-fıkh-u alel-mezâhib, Ez-Zehîre, El-müdevvene nakli)'),
      ('1-73','(El-fıkhu alel-mezâhib-il-erbe’a)da diyor ki, (Mâlikî mezhebinde, seferde','selâm vermek de farzdır.)]','Mâlikî/Şâfi’î/Hanbelî (El-fıkhu alel-mezâhib nakli)')]
d=json.load(open(KOK+'/tools/yeni-site/denetim/betik-hukumler-1/tarama.json'))
metin={}
aralik=[]
for md,b,e,ad in BLOK:
    m=metin.setdefault(md,json.load(open(f'{KOK}/veri/madde/{md}.json'))['metin'])
    s=m.find(b); t=m.find(e,s)+len(e); assert s>=0 and t>s,(md,b)
    aralik.append((md,s,t,ad))
sonuc=[]
for x in d:
    if not x.get('kitapAsil'): continue
    md=x['kitapMadde']
    for (bm,s,t,ad) in aralik:
        if bm!=md: continue
        m=metin[md]; k=m.find(x['kitapAsil'])
        if k<0: continue
        # kayıt bloğun içinde başlıyorsa
        if s<=k<t: sonuc.append({'id':x['id'],'tur':x['tur'],'katman':x['katman'],'madde':md,'blok':ad,'tamamen_icinde':k+len(x['kitapAsil'])<=t,'metin':x['metin'][:160]})
json.dump(sonuc,open('mezheb-blok-kayitlari.json','w'),ensure_ascii=False,indent=1)
print(len(sonuc), collections.Counter((r['tur'],r['katman']) for r in sonuc))
for r in sonuc: print(r['id'],r['tur'],r['katman'],r['blok'][:12],r['tamamen_icinde'],r['metin'][:110])
