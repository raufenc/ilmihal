from ortak import *
import unicodedata
O={i:(T[i].get('osmanlica') or '') for i in T}
def ara(ad,f,g=12):
    L=[i for i in sorted(T) if f(i)]
    print(f'## {ad}: {len(L)}')
    for i in L[:g]: print('   ',i,T[i]['kelime'],'|',O[i])
    return L
bos=ara('boş',lambda i: not O[i].strip())
ara('Latin harf',lambda i: re.search(r'[A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû]',O[i]),20)
ara('rakam',lambda i: re.search(r'[0-9٠-٩]',O[i]))
ara('Arap harfi yok',lambda i: O[i].strip() and not re.search(r'[؀-ۿ]',O[i]))
ara('sunum biçimi (FB50-FEFF)',lambda i: re.search(r'[ﭐ-﷿ﹰ-﻿]',O[i]))
ara('هللا (ters lafza)',lambda i: 'هللا' in O[i] or 'هلل' in O[i],20)
ara('اآل kırık',lambda i: 'اآل' in O[i] or 'الآل' in O[i],20)
ara('ALLAH geçen kelime, osmanlıcada الله yok',lambda i: re.search(r'(?i)allah',T[i]['kelime']) and 'الله' not in O[i] and 'لله' not in O[i],30)
# İlk harf denetimi
ILK={'A':'اآعأإ','Â':'آاعأ','B':'بپ','C':'جژ','Ç':'چج','D':'دضذظ','E':'اأإعه','F':'ف','G':'غگكق','Ğ':'غ','H':'حهخ','I':'اعإ','İ':'اإع','Î':'اإيع','K':'كقگخ','L':'ل','M':'م','N':'ن','O':'او','Ö':'او','P':'پب','R':'ر','S':'سصث','Ş':'ش','T':'تطث','U':'اعأو','Û':'او','Ü':'او','V':'وو','Y':'ي','Z':'زذضظ','Ô':'صس'}
def ilk(i):
    k=T[i]['kelime'].strip(); o=O[i].strip()
    if not o: return False
    h=k[0].upper().replace('i','İ')
    c=re.sub(r'[^ء-ۿ]','',o)[:1]
    return h in ILK and c and c not in ILK[h]
L=ara('ilk harf uyumsuz (ters dizilmiş olabilir)',ilk,60)
json.dump(L,open('osm-ilkharf.json','w'))
# son harf / ters dizi: Arap dizisinin son harfi kelimenin ilk harfine uyuyorsa
def ters(i):
    k=T[i]['kelime'].strip(); o=re.sub(r'[^ء-ۿ]','',O[i])
    if len(o)<3: return False
    h=k[0].upper().replace('i','İ')
    return h in ILK and o[0] not in ILK[h] and o[-1] in ILK[h]
ara('ters dizilmiş olabilir (ilk harf sonda)',ters,40)
