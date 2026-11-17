import json
from ortak import *
B=json.load(open('../tablolar-2.json'))
d=json.load(open(f"{KOK}/tablolar/dizin.json"))['tablolar'][65:]
notlar={}
for l in open('notlar.txt'):
    p=[x.strip() for x in l.split('|')]
    i,id_=p[0].split(); notlar[id_]=(p[1],p[2])
kaynak_hayir={'nikah_hukumleri':'hayır (kaynakMetin, sahîfe)','nikah_niyyet_haram':'hayır (kaynakMetin, sahîfe)','bosama_yetkisi':'kısmen (1. satır 2-34; kaynakMetin)','ila_hul':'hayır (kaynakMetin, sahîfe)','akika':'hayır (kaynakMetin)','sut_cocuklugu_haller':'hayır (kaynakMetin değiştirilmiş)','muhayyerlik_uc_turlu':'hayır (3-5 olmalı)','miras_alamiyanlar':'hayır (3-64 olmalı)','subheler_uc_kisim':'hayır (kaynakMetin, sahîfe)','zaruret_ruhsatlari':'hayır (kaynakMetin)','israf_bes_bahs':'hayır (kaynakMetin uydurma)','nezr_iki_turlu':'kısmen (kaynakMetin birleştirilmiş)'}
satir=[]
for i,t in enumerate(d,66):
    n=sum(1 for x in B if x['kimlik'].split(' / ')[0]==t['id'])
    h=notlar[t['id']][0]
    hk = 'doğru' if h.startswith('doğru') else 'düzeltilmeli'
    sin = h[h.find('(')+1:h.find(')')] if '(' in h else ''
    satir.append(f"| {i} | `{t['id']}` | {t['baslik']} | {t['tip']} | {t['kaynakMadde']} s.{t['sahife']} | {kaynak_hayir.get(t['id'],'evet')} | **{hk}**{(' ('+sin+')') if sin else ''} | {n} |")
print('\n'.join(satir))
from collections import Counter
c=Counter('doğru' if notlar[t['id']][0].startswith('doğru') else 'düzeltilmeli' for t in d); print(c)
