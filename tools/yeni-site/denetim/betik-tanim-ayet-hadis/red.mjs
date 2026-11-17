// Kitapta bir sözün hadîs olmadığını / sahîh olmadığını söyleyen yerleri bulur; indeksteki hadîslerle yakınlığını gösterir.
import fs from 'fs';
import {duzle, duzleEslemeli} from '../../../../js/cekirdek/metin.js';
const K='../../../../veri/';
const fih=JSON.parse(fs.readFileSync(K+'fihrist.json','utf8')).maddeler;
const AH=JSON.parse(fs.readFileSync(K+'ayet-hadis.json','utf8'));
const hd=AH.hadisler.map(h=>duzle(h.metin));
const RX=/(sahih olmadig|sahih degil|hadis olmadig|hadis degil|asli yok|mevdu|uydurma hadis|hadis uydur|uydurulmus|zaif hadis|hadisi zaif|zaif oldug|sahih olmamis|hadis-i serif olmadig|batil|kizb)/g;
for (const f of fih) { const id=`${f.kisim}-${f.no}`; const d=JSON.parse(fs.readFileSync(K+`madde/${id}.json`,'utf8')); const e=duzleEslemeli(d.metin);
  let m; RX.lastIndex=0;
  while((m=RX.exec(e.duz))){ if(m[1]==='batil'||m[1]==='kizb') continue; const p=e.konum[m.index]; const ctx=d.metin.slice(Math.max(0,p-400),p+200).replace(/\n/g,' ¶ ');
    const near=[]; const win=duzle(d.metin.slice(Math.max(0,p-800),p+400)); hd.forEach((h,i)=>{ if(win.includes(h.slice(0,Math.min(40,h.length)))) near.push(i); });
    console.log(`${id} [${m[1]}] yakin-indeks:${JSON.stringify(near)}\n  ${ctx}\n`); }
}
