// Ters yön: seçilen 12 fıkıh maddesinde açık hüküm cümlelerini bul, dizinde var mı bak.
import fs from 'fs'; import path from 'path';
const KOK='/Users/raufenc/Documents/Claude 2/ilmihal-site';
const { duzle } = await import(path.join(KOK,'js/cekirdek/metin.js'));
const ADAY=['1-51','1-52','1-53','1-54','1-55','1-56','1-57','1-58','1-59','1-60','1-61','1-64','1-65','1-66','1-67','1-68','1-69','1-70','1-71','1-72','1-74','1-78','1-79','1-80','1-81','1-82','1-84','1-90','2-34','2-36','2-38','2-45','3-56','3-57','3-58'];
// sabit tohumlu karıştırma (mulberry32, tohum 20261117)
let s=20261117; const r=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const a=[...ADAY]; for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
const SEC=a.slice(0,12).sort();
const KAL={ farz:/(^| )farz(dir|tir| olur| oldu|-i ayndir|-i kifayedir)( |$)/, vacib:/(^| )vacib(dir| olur)( |$)/,
  sunnet:/(^| )sunnet(dir|-i muekkededir|-i zevaiddir| olur)( |$)/, mustehab:/(^| )(mustehab(dir| olur)|mendubdur|edebdir)( |$)/ };
const OLUMSUZ=/ degil| olmaz| denildi| diyen/;
const hk={};
for (const t of Object.keys(KAL)) for (const k of ['acik','tum']) {
  const f=path.join(KOK,`veri/hukumler/${t}-${k}.json`); hk[t+k]=JSON.parse(fs.readFileSync(f,'utf8')).hukumler.map(h=>duzle(h.metin)); }
const sonuc={secilen:SEC, maddeler:{}};
let top={};
for (const md of SEC) {
  const m=JSON.parse(fs.readFileSync(path.join(KOK,`veri/madde/${md}.json`),'utf8'));
  const cumleler=m.metin.split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim()).filter(Boolean);
  const r={baslik:m.baslik, turler:{}};
  for (const t of Object.keys(KAL)) {
    const bul=[]; 
    for (const c of cumleler) { const d=duzle(c); if (d.length<8) continue; if(!KAL[t].test(d) || OLUMSUZ.test(d)) continue;
      const acik=hk[t+'acik'].some(h=>h.includes(d)||d.includes(h)&&h.length>20);
      const tum=hk[t+'tum'].some(h=>h.includes(d)||d.includes(h)&&h.length>20);
      bul.push({cumle:c.slice(0,220),acik,tum}); }
    r.turler[t]={toplam:bul.length, acikta:bul.filter(x=>x.acik).length, tumde:bul.filter(x=>x.tum||x.acik).length, eksikler:bul.filter(x=>!x.acik).map(x=>x.cumle+(x.tum?'  [yalnız tum]':''))};
    top[t]??={toplam:0,acikta:0,tumde:0}; top[t].toplam+=bul.length; top[t].acikta+=r.turler[t].acikta; top[t].tumde+=r.turler[t].tumde;
  }
  sonuc.maddeler[md]=r;
}
sonuc.toplam=top;
fs.writeFileSync('kapsam.json',JSON.stringify(sonuc,null,1));
console.log(SEC.join(' '), JSON.stringify(top));
for (const md of SEC) { const r=sonuc.maddeler[md]; console.log(md, r.baslik, Object.entries(r.turler).map(([t,v])=>`${t}:${v.acikta}/${v.toplam}`).join(' ')); }
