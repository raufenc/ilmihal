import re, json, sys
from ortak import *
L = sahislar()
KEL = ['sapık','sapdı','sapıt','bid\'at','bid’at','bidat','mezhebsiz','lâ-mezheb','kâfir','kafir','münâfık','zındık','mason','reformcu','düşman','dinsiz','mülhid','vehhâbî','vehhabi','şî\'î','şî’î','mu\'tezile','mu’tezile','dalâlet','yehûdî','yahudi','hıristiyan','papas','casus','aldan','bozuk','râfizî','râfızî','hâricî','mürted','putperest','müşrik','kâfir','imânsız','îmânsız','ahmak','câhil','cahil','yalan','iftirâ','sahte','fitne','zulm','zâlim','kötü','ateşe gid','cehennem','fâsık','dinden çık','islâm düşman','islâmiyyeti yık','yıkmak','felsefeci','ehl-i sünnet değil','ehl-i sünnetden ayr','bid','fırka','ingiliz','nasrânî','mecûsî','yahûdî','kızılbaş','ismâ\'îlî','ismâ’îlî','bâtınî','dürzî','behâî','kadiyânî','modernist','islâmı içerden','din adamı perdesi','din câhili','din adamı']
sec = sys.argv[1] if len(sys.argv)>1 else None
for x in L:
    if sec and x['kategori']!=sec: continue
    b = x['biyografi']; bl=b.lower()
    hits = sorted(set(k for k in KEL if k.lower() in bl))
    if hits:
        print(f"{x['slug']} [{x['kategori']}|{x['unvan']}] {hits}")
