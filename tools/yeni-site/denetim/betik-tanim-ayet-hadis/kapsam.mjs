// Bütün kitapta "meâl" ve "hadîs-i şerîf" işaretli parantezli alıntıları bulur, indeksin kapsamını tahmin eder (betik tahmini).
import fs from 'fs';
import {duzle} from '../../../../js/cekirdek/metin.js';
const K='../../../../veri/';
const fih=JSON.parse(fs.readFileSync(K+'fihrist.json','utf8')).maddeler.map(f=>`${f.kisim}-${f.no}`);
const AH=JSON.parse(fs.readFileSync(K+'ayet-hadis.json','utf8'));
const idxA=AH.ayetler.map(a=>duzle(a.metin)), idxH=AH.hadisler.map(a=>duzle(a.metin));
const var_=(q,arr)=>arr.some(t=>t.includes(q.slice(0,30))||q.includes(t.slice(0,Math.min(30,t.length))));
let A={n:0,var:0,ornek:[]}, H={n:0,var:0,ornek:[]};
for (const id of fih){ const m=JSON.parse(fs.readFileSync(K+`madde/${id}.json`,'utf8')).metin;
  const pr=[]; let dep=0,st=-1; for(let i=0;i<m.length;i++){ if(m[i]==='('){ if(dep===0) st=i; dep++; } else if(m[i]===')'&&dep>0){ dep--; if(dep===0) pr.push([st,i]); } }
  // iç içe: bir seviye içini de tara
  const all=[...pr]; for(const [a,b] of pr){ let d=0,s=-1; for(let i=a+1;i<b;i++){ if(m[i]==='('){ if(d===0) s=i; d++; } else if(m[i]===')'&&d>0){ d--; if(d===0) all.push([s,i]); } } }
  for (const [a,b] of all){ const ic=m.slice(a+1,b); if(ic.length<20) continue; const on=duzle(m.slice(Math.max(0,a-70),a)); const sn=duzle(m.slice(b+1,b+40)); const q=duzle(ic);
    if (/(mealen|meal-i serifi|meali|ayetinde|ayet-i kerimesinde|ayet-i kerimede)[ ,;:]*$/.test(on) || /^[!?. ]*(mealindeki|meal-i serif|mealinde|olan [a-z]* ?ayet)/.test(sn)) { A.n++; if(var_(q,idxA)) A.var++; else if(A.ornek.length<400) A.ornek.push(id+' | '+ic.slice(0,100).replace(/\n/g,' ')); }
    else if (/(hadis-i serifde|hadis-i kudside|hadis-i serifinde|buyurdu ki|buyuruyor ki|buyurmusdur ki)[ ,;:]*$/.test(on) && !/(diyor ki|dedi ki)[ ,;:]*$/.test(on) || /^[!?. ]*(hadis-i serifi|hadisi\b|hadis-i serifleri)/.test(sn)) { H.n++; if(var_(q,idxH)) H.var++; else if(H.ornek.length<600) H.ornek.push(id+' | '+on.slice(-40)+' ⟦'+ic.slice(0,90).replace(/\n/g,' ')+'⟧ '+sn.slice(0,25)); }
  } }
console.log('AYET adayi',A.n,'indekste',A.var); console.log('HADIS adayi',H.n,'indekste',H.var);
fs.writeFileSync('kapsam-eksik.txt', 'AYET\n'+A.ornek.join('\n')+'\nHADIS\n'+H.ornek.join('\n'));
