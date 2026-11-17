// Ters yön kapsam denetimi: 12 fıkıh maddesinde açık hüküm cümlelerini bul, dizinde var mı bak.
import fs from 'fs'; import {fileURLToPath} from 'url';
import {duzle} from '../../../../js/cekirdek/metin.js';
const KOK = fileURLToPath(new URL('../../../../', import.meta.url));
const ADAY=['1-52','1-54','1-58','1-64','1-67','1-68','1-69','1-70','1-71','1-74','1-78','1-79','1-81','1-84','2-34','2-36','2-40','2-41','2-42','2-44','2-45','3-3','3-4','3-5','3-6','3-10','3-13','3-14','3-15','3-19'];
// sabit tohumlu karıştırma (mulberry32)
let t=20261117; const r=()=>{t|=0;t=t+0x6D2B79F5|0;let x=Math.imul(t^t>>>15,1|t);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296};
const a=[...ADAY]; for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
const SEC=a.slice(0,12).sort();
const RE={haram:/\bharam(dir|dirlar| olur| olurlar| oldu| olmus|dir)\b/, mekruh:/\bmekruh(dur|durlar| olur| olurlar)\b|\b(tahrimen|tenzihen) mekruh/, mubah:/\bmubah(dir| olur)\b|\bcaiz(dir| olur| oldu)\b|\bhalal(dir| olur)\b/};
const NEG=/degil|olmaz|denilemez|diyemez|yokdur/;
const D={};
for (const tur of Object.keys(RE)) for (const k of ['acik','tum']) D[tur+k]=JSON.parse(fs.readFileSync(KOK+`veri/hukumler/${tur}-${k}.json`,'utf8')).hukumler.map(h=>({m:h.madde,d:duzle(h.metin)}));
const sonuc={secilen:SEC, maddeler:{}}; const kacan=[];
for (const id of SEC){
  const metin=JSON.parse(fs.readFileSync(KOK+`veri/madde/${id}.json`,'utf8')).metin;
  const cumleler=metin.split(/(?<=[.!?])\s+(?=[(\[“"A-ZÇĞİÖŞÜÂÎÛ0-9])|\n+/).map(s=>s.trim()).filter(Boolean);
  const say={};
  for (const c of cumleler){ const d=duzle(c);
    for (const tur of Object.keys(RE)) { if(!RE[tur].test(d)) continue;
      const neg=NEG.test(d);
      const iç=(L)=>L.some(x=>x.m===id && x.d.length>8 && (d.includes(x.d)||x.d.includes(d)));
      const ac=iç(D[tur+'acik']), tm=iç(D[tur+'tum']);
      const s=(say[tur]??={toplam:0,olumsuzHaric:0,acikta:0,tumde:0,hicbiri:0});
      s.toplam++; if(neg) continue; s.olumsuzHaric++; if(ac)s.acikta++; if(tm)s.tumde++; if(!ac&&!tm){s.hicbiri++; kacan.push({madde:id,tur,cumle:c});}
    }}
  sonuc.maddeler[id]=say;
}
sonuc.kacan=kacan;
fs.writeFileSync(new URL('./kapsam.json',import.meta.url),JSON.stringify(sonuc,null,1));
console.log(SEC.join(' '));
const top={}; for(const [id,s] of Object.entries(sonuc.maddeler)){console.log(id,JSON.stringify(s)); for(const [t,v] of Object.entries(s)){top[t]??={}; for(const [k,n] of Object.entries(v)) top[t][k]=(top[t][k]||0)+n;}}
console.log('TOPLAM',JSON.stringify(top));
