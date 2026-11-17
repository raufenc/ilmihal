import json,re
from ara import norm, madde, tum, KOK
d=json.load(open(f'{KOK}/test-sorulari.json'))
def ws(s): return re.sub(r'\s+',' ',s)
for k in d['konular']:
  for i,s in enumerate(k['sorular'],1):
    refs=re.findall(r'\(K(\d)/M(\d+)\)',s['aciklama'])
    refs=[f'{a}-{b}' for a,b in refs] or [s['madde']]
    for q in re.findall(r"'([^']{12,})'",s['aciklama'].replace("’","’")):
      nq=ws(norm(q)).strip(" .")
      hit=[m for m in tum() if nq in ws(norm(madde(m)['metin']))]
      print(k['id'],i,'REFS',refs,'HIT',hit[:5],'|',q[:80])
