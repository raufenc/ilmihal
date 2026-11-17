// hukumler-2 denetimi: mubah/mekruh/haram × acik/tum kayıtlarını kitapla karşılaştırır.
import fs from 'fs';
import {duzle, duzleEslemeli} from '../../../../js/cekirdek/metin.js';
import {fileURLToPath} from 'url';
const KOK = fileURLToPath(new URL('../../../../', import.meta.url));
const fih = JSON.parse(fs.readFileSync(KOK+'veri/fihrist.json','utf8')).maddeler;
const M = {};
for (const f of fih) {
  const id = `${f.kisim}-${f.no}`;
  const d = JSON.parse(fs.readFileSync(KOK+`veri/madde/${id}.json`,'utf8'));
  const e = duzleEslemeli(d.metin);
  M[id] = {id, metin:d.metin, duz:e.duz, konum:e.konum, sahife:d.sahife, baslik:d.baslik};
}
const ids = Object.keys(M);
const KW = {
  haram: /\bharam/,
  mekruh: /\bmekruh|\bkerahet|\btenzihen|\btahrimen/,
  mubah: /\bmubah|\bcaiz|\bhalal|\bserbest|\bizin/,
};
const DIGER = {farz:/\bfarz/, vacib:/\bvacib|\bvacip/, sunnet:/\bsunnet/, mustehab:/\bmustehab|\bmendub/,
  mubah:/\bmubah|\bcaiz/, mekruh:/\bmekruh|\bkerahet/, haram:/\bharam(?!-)/, kufur:/\bkufur|\bkafir olur/};
const OLUMSUZ = [/degildir/,/degil\b/,/\bolmaz\b/,/\bolmadigi/,/denildi/,/diyenler/,/diyen\b/,/\bgore\b/,/\bsafii(de|ye|nin)?\b/,/\bmaliki(de|ye)?\b/,/\bhanbeli(de|ye)?\b/,/imameyne/,/bir kavl/,/bazi alim/,/bazi(lari|si)/,/rivayet/,/\bsoyle(nil|di)/,/denil/,/\bkavl/,/\bihtilaf/,/fetva/];
function bul(duzMetin, aday) {
  const r=[];
  for (const id of aday) { let i=M[id].duz.indexOf(duzMetin); if(i>=0) r.push({id,i}); }
  return r;
}
function baglam(id, i, n) {
  const m=M[id]; const bas=m.konum[i]; const son=m.konum[i+n-1]+1;
  return {once: m.metin.slice(Math.max(0,bas-350),bas), cumle:m.metin.slice(bas,son), sonra:m.metin.slice(son,son+300)};
}
const sonuc=[]; const goruldu={};
const ANLAMDISI=[/mescid-i haram/,/beled-i?l?-?haram/,/haram ay/,/eshur-u? ?l?-?hurum/,/harem/,/\bharameyn/,/beyt-i? ?l?-?haram/,/halallas/,/halallik dile/,/mesaril haram/,/mes.ar-i haram/];
for (const tur of ['mubah','mekruh','haram']) for (const kat of ['acik','tum']) {
  const H = JSON.parse(fs.readFileSync(KOK+`veri/hukumler/${tur}-${kat}.json`,'utf8')).hukumler;
  for (const h of H) {
    const d = duzle(h.metin);
    const b = {tur,kat,id:h.id,madde:h.madde,sahife:h.sahife,sahifeBitis:h.sahifeBitis,altTur:h.altTur,metin:h.metin,isaret:[]};
    let yer=null;
    if (h.madde && M[h.madde]) {
      const m=M[h.madde]; const occ=[]; let j=-1; while((j=m.duz.indexOf(d,j+1))>=0) occ.push(j);
      if (occ.length) { const tah = i => m.sahife[0] + i/m.duz.length*(m.sahife[1]-m.sahife[0]+1);
        occ.sort((a,b)=>Math.abs(tah(a)-0.5-(h.sahife??0))-Math.abs(tah(b)-0.5-(h.sahife??0))); yer={id:h.madde,i:occ[0]}; }
    }
    if (!yer) {
      const r=bul(d,ids);
      if (r.length) { yer=r[0]; b.isaret.push('BASKA_MADDE:'+r.map(x=>x.id).join(',')); }
    }
    if (!yer) {
      // kısmî: en uzun ön ek
      let lo=10, hi=d.length, best=null;
      const aday = h.madde&&M[h.madde]? [h.madde,...ids.filter(x=>x!==h.madde)]:ids;
      while(lo<=hi){const mid=(lo+hi)>>1; const r=bul(d.slice(0,mid),aday); if(r.length){best={...r[0],n:mid};lo=mid+1}else hi=mid-1;}
      b.isaret.push('BULUNAMADI');
      if (best) { b.kismi = {madde:best.id, oran:+(best.n/d.length).toFixed(2), kitap: baglam(best.id,best.i,Math.min(d.length+60, M[best.id].duz.length-best.i)).cumle.slice(0,400)}; }
    } else {
      b.bulunan=yer.id;
      const bg=baglam(yer.id,yer.i,d.length); b.once=bg.once; b.sonra=bg.sonra;
      const s=M[yer.id].sahife;
      if (h.sahife==null || h.sahife<s[0] || h.sahife>s[1]) b.isaret.push(`SAHIFE_DISI:${h.sahife} [${s}]`);
      // ayni cumle maddede birden fazla mi
      const ikinci = M[yer.id].duz.indexOf(d, yer.i+1); if (ikinci>=0) b.isaret.push('MADDEDE_TEKRAR');
      // yaklaşık sahîfe: maddedeki konuma göre doğrusal tahmin (kesin değil)
      const oran = yer.i / M[yer.id].duz.length; const tahmin = s[0] + oran*(s[1]-s[0]+1);
      b.tahminiSahife = Math.floor(tahmin);
      if (h.sahife!=null && Math.abs(h.sahife - tahmin) > 2.5 && s[1]-s[0] >= 3) b.isaret.push(`SAHIFE_UZAK?:${h.sahife}~${Math.floor(tahmin)}`);
      // tüm geçişler (aynı cümle maddede kaç kez)
      let n=0, j=-1; while((j=M[yer.id].duz.indexOf(d,j+1))>=0) n++; b.gecisSayisi=n;
    }
    if (h.madde && b.bulunan && b.bulunan!==h.madde) {}
    if (!KW[tur].test(d)) b.isaret.push('KELIME_YOK');
    const dig = Object.entries(DIGER).filter(([k,re])=>k!==tur && re.test(d)).map(([k])=>k);
    if (tur==='haram' && /tahrimen mekruh/.test(d)) dig.push('TAHRIMEN_MEKRUH');
    if (dig.length) b.isaret.push('COKLU:'+dig.join(','));
    const ol = OLUMSUZ.filter(re=>re.test(d)).map(re=>re.source);
    if (ol.length) b.isaret.push('OLUMSUZ/SINIR:'+ol.join('|'));
    const ad = ANLAMDISI.filter(re=>re.test(d)).map(re=>re.source); if (ad.length) b.isaret.push('ANLAM_DISI?:'+ad.join('|'));
    const t=h.metin.trim();
    if (!/[.!?)\]»”"’:]$/.test(t) || /^[a-zçğıöşüâîû,;]/.test(t)) b.isaret.push('KESIK?');
    if (t.length<40) b.isaret.push('KISA');
    const k=tur+kat+'|'+d+'|'+(b.bulunan||h.madde); (goruldu[k]??=[]).push(h.id);
    if (b.bulunan && goruldu[k].length > (b.gecisSayisi||1)) b.isaret.push('YINELENME:'+goruldu[k][0]);
    sonuc.push(b);
  }
}
// türler arası aynı cümle (acik)
const capraz={};
for (const b of sonuc) if (b.kat==='acik') { const d=duzle(b.metin); (capraz[d]??=[]).push(b.tur+':'+b.id); }
for (const b of sonuc) if (b.kat==='acik') { const l=capraz[duzle(b.metin)]; const diger=[...new Set(l.map(x=>x.split(':')[0]))]; if (diger.length>1) b.isaret.push('TURLER_ARASI:'+l.join(',')); }
const acikK=new Set(sonuc.filter(b=>b.kat==='acik').map(b=>b.tur+'|'+duzle(b.metin)+'|'+b.madde));
for (const b of sonuc) if (b.kat==='tum') b.acikta = acikK.has(b.tur+'|'+duzle(b.metin)+'|'+b.madde);
fs.writeFileSync(new URL('./tarama.json',import.meta.url), JSON.stringify(sonuc,null,1));
// özet
const ozet={};
for (const b of sonuc){const k=b.tur+'-'+b.kat; ozet[k]??={n:0}; ozet[k].n++; for(const i of b.isaret){const t=i.split(':')[0]; ozet[k][t]=(ozet[k][t]||0)+1;}}
console.log(JSON.stringify(ozet,null,1));
