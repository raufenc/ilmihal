// Ters yön örneklemi: rastgele (sabit tohumlu) 10 maddede âyet meâli / hadîs olarak verilen parantezli alıntıları sayar, indeksle karşılaştırır.
import fs from 'fs';
import {duzle} from '../../../../js/cekirdek/metin.js';
const K='../../../../veri/';
const fih=JSON.parse(fs.readFileSync(K+'fihrist.json','utf8')).maddeler.map(f=>`${f.kisim}-${f.no}`);
const AH=JSON.parse(fs.readFileSync(K+'ayet-hadis.json','utf8'));
let s=20261117; const r=()=>{s=(s*1103515245+12345)%2147483648; return s/2147483648;};
const sec=new Set(); while(sec.size<10) sec.add(fih[Math.floor(r()*fih.length)]);
const idxA=AH.ayetler.map(a=>duzle(a.metin)), idxH=AH.hadisler.map(a=>duzle(a.metin));
const ara=(q,arr)=>arr.findIndex(t=>t.includes(q)||q.includes(t.slice(0,Math.min(25,t.length))));
for (const id of sec) {
  const m=JSON.parse(fs.readFileSync(K+`madde/${id}.json`,'utf8')).metin;
  // en dıştaki parantezleri bul
  const out=[]; let dep=0, st=-1;
  for (let i=0;i<m.length;i++){ if(m[i]==='('){ if(dep===0) st=i; dep++; } else if(m[i]===')'&&dep>0){ dep--; if(dep===0){ out.push([st,i]); } } }
  const res={ayet:[],hadis:[]};
  for (const [a,b] of out) { const ic=m.slice(a+1,b); if(ic.length<15) continue; const once=duzle(m.slice(Math.max(0,a-160),a)); const sonra=duzle(m.slice(b+1,b+60));
    let tur=null;
    if (/(meal|ayet-i kerime|ayetinde|ayetin|suresi|suresinde)[^()]{0,60}$/.test(once) || /^[^a-z]{0,3}(meal|ayet)/.test(sonra) || /^\W*(meal)/.test(sonra)) tur='ayet';
    else if (/(hadis-i serif|hadis-i kudsi|buyurdu ki|buyuruyor ki|resulullah|peygamber)[^()]{0,80}$/.test(once) || /^[^a-z]{0,3}(buyurdu|buyuruldu|hadis)/.test(sonra)) tur='hadis';
    if (!tur) continue;
    const q=duzle(ic).replace(/\.\.\.?$/,'').slice(0,40);
    const iA=ara(q,idxA), iH=ara(q,idxH);
    res[tur].push({ic:ic.slice(0,90).replace(/\n/g,' '), indA:iA, indH:iH});
  }
  const say=(L,f)=>L.filter(f).length;
  console.log(`== ${id}: ayet-adayi ${res.ayet.length} (indekste ayet: ${say(res.ayet,x=>x.indA>=0)}, hadiste: ${say(res.ayet,x=>x.indH>=0)}) | hadis-adayi ${res.hadis.length} (indekste hadis: ${say(res.hadis,x=>x.indH>=0)}, ayette: ${say(res.hadis,x=>x.indA>=0)})`);
  for (const t of ['ayet','hadis']) for (const x of res[t]) console.log(`  ${t} A${x.indA} H${x.indH} | ${x.ic}`);
}
