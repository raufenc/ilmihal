const {yukle,KOK}=require('./yukle');const fs=require('fs');
const A=yukle('ayet-hadis.js').ayetHadisData;
const J=JSON.parse(fs.readFileSync(KOK+'/ayet_hadis_data.json','utf8'));
for(const [ad,d] of [['js',A],['json',J]]){console.log('==',ad,Object.keys(d));for(const k of Object.keys(d)){const arr=d[k];console.log(k,Array.isArray(arr)?arr.length:typeof arr);
 if(Array.isArray(arr)){const keys={};arr.forEach(r=>Object.keys(r).forEach(x=>{keys[x]=keys[x]||{n:0,nul:0};keys[x].n++;if(r[x]==null||r[x]==='')keys[x].nul++;}));console.log(' alanlar',JSON.stringify(keys));console.log(' örnek',JSON.stringify(arr.find(r=>r.kaynak)||arr[0]).slice(0,400));}}}
// karşılaştır
const s=x=>JSON.stringify(x);
console.log('aynı mı (tam):',s(A)===s(J));
for(const k of ['ayetler','hadisler']){const a=A[k]||[],j=J[k]||[];const sa=new Set(a.map(r=>r.metin)),sj=new Set(j.map(r=>r.metin));
 console.log(k,'js',a.length,'json',j.length,'yalnız js',[...sa].filter(x=>!sj.has(x)).length,'yalnız json',[...sj].filter(x=>!sa.has(x)).length);}
// sure adları
const sur={};A.ayetler.forEach(r=>sur[r.sure]=(sur[r.sure]||0)+1);console.log('sure sayısı',Object.keys(sur).length);
const ayetNoOrn=A.ayetler.map(r=>r.ayet_no).filter(Boolean);console.log('ayet_no sayısal mı?',ayetNoOrn.filter(x=>/^\d+$/.test(x)).length,'/',ayetNoOrn.length);
const kay={};A.hadisler.forEach(r=>kay[r.kaynak]=(kay[r.kaynak]||0)+1);console.log('hadis kaynakları',Object.entries(kay).sort((a,b)=>b[1]-a[1]).slice(0,15));
