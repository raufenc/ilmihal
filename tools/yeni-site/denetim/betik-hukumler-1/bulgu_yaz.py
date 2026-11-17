# okuma.txt kararlarından bulgu listesi (hukumler-1.json) üretir
import json, re, collections
D='/Users/raufenc/Documents/Claude 2/ilmihal-site/tools/yeni-site/denetim/'
d={}
for x in json.load(open('tarama.json')): d[(x['id'],x['katman'])]=x
byid=collections.defaultdict(list)
for (i,k),x in d.items(): byid[i].append(x)
blok={r['id']:r['blok'] for r in json.load(open('mezheb-blok-kayitlari.json'))}
TURAD={'farz':'farz','vacib':'vâcib','sunnet':'sünnet','mustehab':'müstehab'}
MET={}
def _m(md):
    if md not in MET: MET[md]=json.load(open(f'/Users/raufenc/Documents/Claude 2/ilmihal-site/veri/madde/{md}.json'))['metin']
    return MET[md]
SON='.!?\n'
def _bas(m,i):
    # i'nin içinde bulunduğu cümlenin başı; i zaten cümle başındaysa bir önceki cümlenin başı
    j=i
    while j>0 and m[j-1] in ' \t': j-=1
    if j==i or (j>0 and m[j-1] in SON):
        while j>0 and m[j-1] in ' \n\t.!?)]»”"': j-=1
    while j>0 and m[j-1] not in SON: j-=1
    return j
def _son(m,i):
    j=i
    while j<len(m) and m[j] not in SON: j+=1
    while j<len(m) and m[j] in '.!?)]»”"\'': j+=1
    return j
def _yer(x):
    m=_m(x['kitapMadde']); k=m.find(x['kitapAsil'])
    if k<0: return m,None,None
    e=k+len(x['kitapAsil'])
    while e<len(m) and m[e] in '.!?)]»”"': e+=1
    return m,k,e
def kitap_alinti(x, once=True, sonra=True, sinir=700):
    if not x.get('kitapAsil'): return None
    m,k,e=_yer(x)
    if k is None: return x['kitapAsil']
    b=_bas(m,k) if once else k
    if once and k-b>350: b=k
    s=_son(m,e+1) if sonra and e<len(m) else e
    if s-e>300: s=e
    t=m[b:s].strip()
    if len(t)>sinir+650:
        t=m[b:k]+m[k:k+sinir//2]+' […] '+m[e-sinir//3:s]
    return t.replace('\n',' ').replace('  ',' ').strip()
def ilk_cumle_sonra(x):
    m,k,e=_yer(x)
    if k is None: return ''
    j=e
    while j<len(m) and m[j] in ' \n': j+=1
    return m[j:_son(m,j+1)].replace('\n',' ').strip()
def son_cumle_once(x):
    m,k,e=_yer(x)
    if k is None: return ''
    b=_bas(m,k)
    return m[b:k].replace('\n',' ').strip()
SINIF={'KK':('K',True),'K':('K',True),'MK':('K',True),'SK':('K',True),'O':('K',True),'X':('K',True),'AK':('K',True),
       'M':('Y',True),'S':('Y',True),'Z':('Y',True),'A':('Y',True),'AF':('Y',True),'MF':('Y',True),'LM':('Y',True),'LX':('Y',True),'LA':('Y',True),
       'F':('B',True),'EF':('B',True),'L':('B',True),'LF':('B',True),'B':('B',True)}
ACIKLAMA={'KK':'Kitapta sapık bir fırkanın ya da reddedilen bir kitabın sözü olarak nakl edilip çürütülen ifade, hüküm gibi dizine alınmış.',
 'K':'Kitapta yanlış/iftirâ diye anılan söz hüküm başlığında duruyor.',
 'MK':'Cümle kitapta başka bir mezhebin (çoğu Mâlikî) hulâsası içinde geçiyor; kayıtta mezheb adı yok, genel hüküm gibi duruyor.',
 'SK':'Cümle bir ihtilâfı naklediyor; kitabın vardığı netice sonraki cümlede ve tersini söylüyor.',
 'O':'Cümle o türü olumsuzluyor (bu türden olmadığını bildiriyor).',
 'X':'Cümle başka bir türü bildiriyor (harâm, mekrûh, câiz, sünnet vb.).',
 'AK':'Kelime fıkhî hüküm anlamında değil (kelâm/tasavvuf terimi ya da kitap adı) geçiyor.',
 'M':'Hüküm yalnız bir mezhebin, imâmın ya da kavlin görüşü; kayıtta adı geçse de "açık hüküm" listesinde genel hükümlerle karışık duruyor.',
 'S':'Cümlenin anlamını sınırlayan şart/istisna/ihtilâf bir önceki ya da sonraki cümlede kalmış.',
 'Z':'Cümlenin öznesi zamir ya da eksik; neyin bu hükümde olduğu kayıttan anlaşılmıyor (önceki cümlede).',
 'A':'Kelime geçiyor ama cümle bir şeyin bu türden olduğunu bildirmiyor (anma, tanım, sevâb/günâh sözü, anlatı).',
 'AF':'Hüküm bildirmiyor; ayrıca kayıt cümle sınırına uymuyor.',
 'MF':'Mezheb görüşü; öznesi eksik ve kayıt cümle sınırına uymuyor.',
 'LM':'Paragraf boyu blok; içinde başka mezheb hulâsası var.',
 'LX':'Paragraf boyu blok; içeriği çoğunlukla başka türden hükümler.',
 'LA':'Paragraf boyu blok; bu türden hüküm bildirmiyor.',
 'F':'Kayıt cümle sınırına uymuyor: önceki/sonraki cümleden parça taşıyor, yarım ya da birleşik.',
 'EF':'Âdâb listesi maddesi; kayıt cümle sınırına uymuyor.',
 'L':'Tek hüküm cümlesi değil, paragraf boyu blok (Excel "liste bloğu" sayfasından).',
 'LF':'Paragraf boyu blok; sonundaki sayım (":" ile biten) kayda girmemiş.',
 'B':'Biçim: yinelenme, yazım ya da atıf satırı.'}
def oneri(kod,x,tur):
    if kod in ('KK','K'): return 'kaldır'
    if kod=='MK': return 'açık katmandan kaldır; kalacaksa mezheb adı kitaptaki gibi eklensin (blok: '+blok.get(x['id'],'mezheb hulâsası')+')'
    if kod=='SK': return 'kaldır; kalacaksa kitabın sonraki cümlesiyle verilsin: "'+ilk_cumle_sonra(x)+'"'
    if kod=='O': return f'{TURAD[tur]} açık hükümlerinden kaldır (tum katmanında "değildir" alt etiketiyle kalabilir)'
    if kod=='X': return f'{TURAD[tur]} başlığından kaldır; kitabın bildirdiği türün dizinine ait'
    if kod=='AK': return 'kaldır (fıkhî hüküm değil)'
    if kod in ('A','AF','LA'): return 'açık katmandan kaldır (hüküm bildirmiyor; tum katmanında geçiş olarak kalabilir)'
    if kod in ('M','MF','LM'): return 'mezheb/kavl kaydı olarak ayrı etiketle; ya da açık katmandan kaldır'
    if kod=='S': return 'kitabın sonraki/önceki cümlesiyle birlikte verilsin: "'+(ilk_cumle_sonra(x) or son_cumle_once(x))+'"'
    if kod=='Z': return 'öznesini veren önceki cümleyle birlikte verilsin: "'+son_cumle_once(x)+'"'
    if kod in ('F','EF'): return 'metni kitaptaki cümle sınırlarına göre yeniden kes'
    if kod in ('L','LF','LX'): return 'blok kaydı kaldır ya da kitabın cümlelerine böl'
    if kod=='B': return 'yinelenmeyi/biçimi düzelt (kaldır)'
    return ''
bul=[]
katman_of=lambda tum: 'tum' if tum else 'acik'
for l in open('okuma.txt'):
    l=l.rstrip('\n')
    m=re.match(r'^(T?)(\d+)\|([^|]*)\|(.*)$',l)
    if not m: continue
    tum,i,kod,not_=m.group(1)=='T',int(m.group(2)),m.group(3),m.group(4)
    if kod in ('G','E','H'): continue
    x=d.get((i,'tum' if tum else 'acik'))
    if not x: print('YOK',i,tum); continue
    sinif,kesin=SINIF[kod]
    if kod=='M' and 'kesin değil' in not_: kesin=False
    if kod in ('MK',) and x['id']==120: kesin=False
    if '— kesin değil' in not_: kesin=False
    bul.append({'kimlik':f"hukumler-1-{x['tur']}-{x['katman']}-{i}",'sinif':sinif,'kesin':kesin,'kod':kod,
        'tur':x['tur'],'katman':x['katman'],'altTur':x['altTur'],
        'derleme':x['metin'] if len(x['metin'])<=900 else x['metin'][:600]+' […] '+x['metin'][-200:],
        'kitap':kitap_alinti(x),'madde':x['madde'],'sahife':x['sahife'],
        'aciklama':ACIKLAMA[kod]+(' '+not_ if not_ else ''),'oneri':oneri(kod,x,x['tur'])})
# tum katmanında mezheb hulâsası içindeki kayıtlar (açıkta karşılığı bulgu olarak zaten var)
for r in json.load(open('mezheb-blok-kayitlari.json')):
    if r['katman']!='tum': continue
    x=d[(r['id'],'tum')]
    bul.append({'kimlik':f"hukumler-1-{x['tur']}-tum-{r['id']}",'sinif':'Y','kesin':True,'kod':'MK-tum','tur':x['tur'],'katman':'tum','altTur':x['altTur'],
      'derleme':x['metin'][:600],'kitap':kitap_alinti(x),'madde':x['madde'],'sahife':x['sahife'],
      'aciklama':'Tum katmanında; cümle kitapta '+r['blok']+' içinde. Geçiş olarak doğru, ama mezheb adı olmadan Hanefî hükmü gibi okunabilir.',
      'oneri':'mezheb adıyla etiketle'})
# anlam taraması (tum, betikle)
for k,L in json.load(open('anlam-tarama.json')).items():
    t,ad=k.split('|',1)
    for i,kat in L:
        if kat!='tum' or any(b['kimlik'].endswith(f'-tum-{i}') for b in bul): continue
        if i in (1157,1807,7748,7399): continue   # betik yanlış yakaladı (elle bakıldı)
        x=d[(i,'tum')]
        bul.append({'kimlik':f"hukumler-1-{t}-tum-{i}",'sinif':'Y','kesin':False,'kod':'anlam-betik','tur':t,'katman':'tum','altTur':x['altTur'],
          'derleme':x['metin'][:600],'kitap':kitap_alinti(x,once=False,sonra=False),'madde':x['madde'],'sahife':x['sahife'],
          'aciklama':f'Betik taraması: kelime burada "{ad}" anlamında; {TURAD[t]} hükmünün geçtiği yer değil. (Tek tek okunmadı; kalıpla bulundu.)',
          'oneri':'tum katmanından kaldır ya da "başka anlam" diye etiketle'})
# toplu bulgular
E=[int(re.match(r'^(\d+)',l).group(1)) for l in open('okuma.txt') if re.match(r'^\d+\|E\|',l)]
bul.append({'kimlik':'hukumler-1-mustehab-acik-edeb-listeleri','sinif':'Y','kesin':True,'kod':'E-grup','tur':'mustehab','katman':'acik','altTur':'',
  'derleme':f'{len(E)} kayıt: abdest edebleri/tenbîh listesi maddeleri (1-52) ile 2-45 "Yimek, içmek âdâbı" ve 1-31, 1-90, 2-34 maddelerinden "-malıdır" cümleleri; id: '+', '.join(map(str,E)),
  'kitap':'Edeblere, mendûb ve müstehab da denir. Abdestin edeblerinden, (Halebî-yi sagîr)de bildirilenler şunlardır:','madde':'1-52','sahife':123,
  'aciklama':'Bu kayıtların cümlesinde tür kelimesi yok; "edeb/müstehab" oldukları kitapta yalnız listenin başlığından (1-52) ya da madde başlığından (2-45) anlaşılıyor; Tenbîh listesi (1-52 s125) için kitap tür bildirmiyor ("ri\'âyet etmelidir"). İçerik çoğunlukla doğru, ama "açıkça bildiren cümle" tanımına uymuyor.',
  'oneri':'"açık hüküm" yerine "edeb listesi" diye ayrı gösterilsin; liste başlığı kitaptan aynen verilsin'})
bul.append({'kimlik':'hukumler-1-farz-acik-altTur-farz-i-kifaye','sinif':'B','kesin':True,'kod':'ALT','tur':'farz','katman':'acik','altTur':'farz-ı kifâye',
  'derleme':'altTur "farz-ı kifâye" olan 79 kaydın 53\'ünde metinde "kifâye" yok; #645 #648 #650 #652 #805 metinde açıkça "farz-ı ayn" diyor; 1-82 adak bahsi (#545–#570) toptan "farz-ı kifâye" etiketli',
  'kitap':'Bu sekiz ilmden, kelâm, fıkh ve ahlâk bilgilerini lüzûmu kadar öğrenmek ve çoluk çocuğuna öğretmek, her müslimâna (Farz-ı ayn)dır.','madde':'2-5','sahife':413,
  'aciklama':'Alt tür etiketi içerikle uyuşmuyor: farz-ı ayn bildiren cümleler "farz-ı kifâye" altında.','oneri':'altTur etiketini metne göre yeniden ver (metinde "kifâye" geçmiyorsa "farz-ı kifâye" yazma)'})
json.dump(bul,open(D+'hukumler-1.json','w'),ensure_ascii=False,indent=1)
c=collections.Counter((b['katman'],b['sinif']) for b in bul); print(len(bul),c)
print(collections.Counter(b['kod'] for b in bul))
