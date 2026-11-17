// Bulunamayan kayıtları şahıs dizini biyografilerinde (kitabın hâl tercemeleri) ve lügatte arar.
import fs from 'fs';
import {duzle} from '../../../../js/cekirdek/metin.js';
const K='../../../../veri/';
const d=JSON.parse(fs.readFileSync('tarama.json','utf8'));
const kay=[];
for (const f of fs.readdirSync(K+'sahislar')) { if(f==='dizin.json') continue; const j=JSON.parse(fs.readFileSync(K+'sahislar/'+f,'utf8')); for(const s of j.sahislar) kay.push({yer:'sahis:'+s.isim+(s.sahife?'@'+s.sahife:''), metin:s.biyografi||''}); }
for (const f of fs.readdirSync(K+'lugat')) { if(!f.endsWith('.json')||f==='dizin.json') continue; const j=JSON.parse(fs.readFileSync(K+'lugat/'+f,'utf8')); for(const s of (j.kelimeler||j.lugat||[])) kay.push({yer:'lugat:'+(s.kelime||''), metin:JSON.stringify(s)}); }
const D=kay.map(k=>duzle(k.metin));
for (const k of ['tanim','ayet','hadis']) for (const x of d[k]) if (x.isaret.includes('BULUNAMADI')) {
  const q=duzle(x.cumle||x.metin).replace(/\.\.\.?$/,'').trim();
  const hits=[]; D.forEach((t,i)=>{ if(t.includes(q)) hits.push(kay[i].yer); });
  let alt=''; if(!hits.length){ const q2=q.slice(0,40); D.forEach((t,i)=>{ if(t.includes(q2)) hits.push('ONEK40:'+kay[i].yer); }); }
  console.log(k, x.n, x.sahife, JSON.stringify(hits.slice(0,4)));
}
