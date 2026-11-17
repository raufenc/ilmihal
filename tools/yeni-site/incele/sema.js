// Her dizi/nesne için alan birleşimi, türler, boş sayıları ve kısaltılmış örnek kaydı yazar.
const {yukle}=require('./yukle');
function tur(v){if(v===null)return'null';if(Array.isArray(v))return'array';return typeof v;}
function kisalt(v,n=140){ if(typeof v==='string') return v.length>n? v.slice(0,n)+'…':v;
  if(Array.isArray(v)) return v.slice(0,3).map(x=>kisalt(x,n)).concat(v.length>3?['…(+'+(v.length-3)+')']:[]);
  if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v))o[k]=kisalt(v[k],n);return o;} return v;}
function alanAnalizi(kayitlar,ad){
  const alan={};
  for(const r of kayitlar){ if(!r||typeof r!=='object'){alan['<ilkel>']=alan['<ilkel>']||{t:{},bos:0,var:0};alan['<ilkel>'].t[tur(r)]=(alan['<ilkel>'].t[tur(r)]||0)+1;continue;}
    for(const k of Object.keys(r)){const a=alan[k]=alan[k]||{t:{},bos:0,var:0,ornek:new Set()};a.var++;const v=r[k];a.t[tur(v)]=(a.t[tur(v)]||0)+1;
      if(v===null||v===''||(Array.isArray(v)&&!v.length))a.bos++; if(a.ornek.size<6&&(typeof v==='string'&&v.length<40||typeof v==='number'||typeof v==='boolean'))a.ornek.add(JSON.stringify(v));}}
  console.log(`-- ${ad}: ${kayitlar.length} kayıt`);
  for(const [k,a] of Object.entries(alan)) console.log(`   ${k}: tür=${JSON.stringify(a.t)} bulunan=${a.var} eksik=${kayitlar.length-a.var} boş/null=${a.bos} örnek=${a.ornek?[...a.ornek].join(' | '):''}`);
}
const dosyalar=process.argv.slice(2);
for(const f of dosyalar){const o=yukle(f);console.log('\n######## '+f);
  for(const [k,v] of Object.entries(o)){
    if(Array.isArray(v)){alanAnalizi(v,k);console.log('   ÖRNEK[0]: '+JSON.stringify(kisalt(v[0])));if(v.length>1)console.log('   ÖRNEK[son]: '+JSON.stringify(kisalt(v[v.length-1])));}
    else if(v&&typeof v==='object'){const ks=Object.keys(v);console.log(`-- ${k}: nesne, ${ks.length} anahtar; ilk anahtarlar: ${ks.slice(0,8).join(', ')} ; son: ${ks.slice(-3).join(', ')}`);
      const vals=Object.values(v);const tt={};vals.forEach(x=>tt[tur(x)]=(tt[tur(x)]||0)+1);console.log('   değer türleri: '+JSON.stringify(tt));
      if(vals.every(x=>Array.isArray(x))) alanAnalizi(vals.flat(),k+' (değer dizilerinin elemanları)');
      else if(vals.every(x=>x&&typeof x==='object'&&!Array.isArray(x))) alanAnalizi(vals,k+' (değerler)');
      console.log('   ÖRNEK: '+JSON.stringify(kisalt(v[ks[0]])).slice(0,600));}
    else console.log(`-- ${k}: ${tur(v)}`);
  }}
