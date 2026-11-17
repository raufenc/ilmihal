from ortak import *
A={i:T[i]['anlam']+' || '+(T[i].get('misal') or '') for i in T}
def ara(ad,rx,goster=8):
    r=re.compile(rx)
    L=[i for i in sorted(A) if r.search(A[i])]
    print(f'## {ad}: {len(L)}')
    for i in L[:goster]:
        m=r.search(A[i]); s=A[i]
        print('   ',i,T[i]['kelime'],'…'+s[max(0,m.start()-60):m.end()+50].replace('\n',' ')+'…')
    return L
ara('Hz. kısaltması',r'\bHz\.')
ara('Tanrı',r'\b[Tt]anrı')
ara('yalın Muhammed (salavâtsız)',r'\bMuhammed\b(?!\s*(aleyh|’?in aleyh|Mustafa|\(aleyh|sallal|“|"|’|\'|bin|b\.|Bâkır|Ma|Emin|Hâdim|Behâ|Pârisâ|Şeybânî|Zâhid))',6)
ara('Peygamber + ad salavatsız','(Hz|Hazret-i) Peygamber(?!\s*(aleyh|efendi|’in aleyh|’e aleyh|’den aleyh|“|\())',8)
ara('mitoloji/efsane',r'[Mm]itoloj|[Ee]fsane',6)
ara('rivayete göre / inanışa göre',r'[İi]nanışa göre|inancına göre|rivayete göre|iddiasına göre',10)
ara('Batı / bilim / modern',r'\b[Bb]atı\b|[Bb]ilimsel|\bbilim\b',6)
ara('Allah’a (Allah yalın)',r"\bAllah[’']?(a|ın|tan|ı)\b",6)
ara('Hazret-i Muhammed',r'Hazret-i Muhammed',4)
ara('şîa/şiî anlatım',r'Şîa|Şiîler|Şîîler|İmâmiyye|Câferî',6)
ara('vehhabi',r'[Vv]ehhâb|[Vv]ehhab',8)
ara('ibn teymiyye',r'[Tt]eymiyye',8)
ara('kerâmet/evliyâ menfi',r'hurafe|hurâfe|batıl inanç',8)
ara('Tanrı/İlah çevirisi',r'\bilah\b|\bİlah\b',4)
