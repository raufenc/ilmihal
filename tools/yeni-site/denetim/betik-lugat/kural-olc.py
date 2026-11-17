# Kural değişikliklerinin etkisini ölçer: 600 örneklemde (elle hüküm) ve bütün işaretlerde
from ortak import *
wm,kay,golge=sozluk()
I=isaretler(); M=json.load(open('metinler.json'))
H={(h['madde'],h['kelime'],h['n']):h for h in json.load(open('orneklem600-hukum.json'))}
S=json.load(open('orneklem600.json'))
def bilgi(x):
    l=low(x['kelime']); i,s=coz(x['kelime'],wm); key=l[:-len(s)] if s else l
    t=M[x['madde']]['metin']; b=x['bas']
    once=t[max(0,b-12):b]; sonra=t[b+len(x['kelime']):b+len(x['kelime'])+8]
    bas_cumle=bool(re.search(r'(^|[.!?:\n(\[“"]\s*)$',t[max(0,b-3):b])) or b==0
    return {'l':l,'key':key,'suf':s,'once':once,'sonra':sonra,'buyuk':x['kelime'][:1].isupper(),'bas':bas_cumle}
# Kara liste: kitapta başka anlamla geçen biçimler (bu denetimde bulunan)
KARA_BICIM=re.compile(r'^(zemân\w*|geri\w*|fazla\w*|kadın\w*|altı(nda|na|ndan|ndaki)|cild\w*|madde\w*|dil|dili\w*|dile\w*|dilin\w*|dilden|aynı\w*|ayna\w*|ayın\w*|yedi\w*|bekr\w*|ziyâde\w*|sebze\w*|fâtiha\w*|deve\w*|hâle|sıra\w*|zor\w*|mest\w*|eyle|hanîfe|çâre\w*|kes|kese|kesin|harekete|karn\w*|talebe\w*|neye|neyi|neyin|ağırlık\w*|hakk\w*|beşer|hat|aşmak|arşın|pul\w*|dem|deme|demde|demler|hüdâ|artık|saf|ah|basar\w*)$')
YON=re.compile(r'^\W*\(?Bkz\.?[^)]*\)?\W*$|^\W*$')
def kurallar(x,f):
    r={}
    r['tam']= f['suf']!=''                      # yalnız tam eşleşme → ek atılanları kaldır
    r['uzun4']= len(f['key'])<4                 # anahtar en az 4 harf
    r['uzun5']= len(f['key'])<5
    r['kara']= bool(KARA_BICIM.match(f['l']))   # kara liste
    r['ozel']= bool(re.search(r'(imâm-ı |İmâm-ı |bin |Ebû |ibni |İbni |Seyyid |Sultân |sultân |hâce |Hâce |Mevlânâ |Fahreddîn-i )$',f['once'])) or (f['buyuk'] and not f['bas'] and not re.search(r'aleyh|Allah|Resûl|Peygamber|Kur',T[x['id']]['kelime']+x['kelime']))
    r['yon']= bool(YON.match(T[x['id']]['anlam']))
    return r
# örneklem
cnt=collections.defaultdict(lambda: collections.Counter())
for o in S:
    x=I[o['sira']]; f=bilgi(x); r=kurallar(x,f); h=H[(o['madde'],o['kelime'],o['n'])]['hukum']
    for k,v in r.items():
        if v: cnt[k][h]+=1
    if any(r[k] for k in ('kara','ozel','yon')): cnt['kara+ozel+yon'][h]+=1
print('ÖRNEKLEM (600; Y=54, D=525, C=20, B=1) — kuralın kaldıracağı işaretler:')
for k,c in cnt.items(): print(f'  {k}: Y {c["Y"]}  D {c["D"]}  C {c["C"]}  B {c["B"]}')
# bütün işaretler
tot=collections.Counter()
for x in I:
    f=bilgi(x); r=kurallar(x,f)
    for k,v in r.items():
        if v: tot[k]+=1
    if any(r[k] for k in ('kara','ozel','yon')): tot['kara+ozel+yon']+=1
print('BÜTÜN İŞARETLER (117 308) — kaldırılacak:',dict(tot))
