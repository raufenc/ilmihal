// tanim-ayet-hadis denetimi: tanımlar, âyet meâlleri ve hadîs-i şerîfler kitapla karşılaştırılır (salt okuma).
import fs from 'fs';
import {duzle, duzleEslemeli} from '../../../../js/cekirdek/metin.js';
import {fileURLToPath} from 'url';
const KOK = fileURLToPath(new URL('../../../../', import.meta.url));
const CIK = fileURLToPath(new URL('./', import.meta.url));
const fih = JSON.parse(fs.readFileSync(KOK+'veri/fihrist.json','utf8')).maddeler;
const M = {};
for (const f of fih) {
  const id = `${f.kisim}-${f.no}`;
  const d = JSON.parse(fs.readFileSync(KOK+`veri/madde/${id}.json`,'utf8'));
  const e = duzleEslemeli(d.metin);
  M[id] = {id, metin:d.metin, duz:e.duz, konum:e.konum, sahife:d.sahife};
}
const ids = Object.keys(M);
const sahifeMaddeleri = s => ids.filter(id => M[id].sahife[0] <= s && s <= M[id].sahife[1]);
function bul(d, aday){ const r=[]; for(const id of aday){ let i=M[id].duz.indexOf(d); while(i>=0){ r.push({id,i}); i=M[id].duz.indexOf(d,i+1);} } return r; }
// asıl metinde cümle sınırları ile bağlam
function baglam(id, i, n, cumleSay=2) {
  const m=M[id]; const bas=m.konum[i]; const son=m.konum[Math.min(i+n, m.konum.length)-1]+1;
  const T=m.metin;
  let a=bas, k=0; while(a>0 && k<=cumleSay){ a--; if(/[.!?]/.test(T[a]) && /\s/.test(T[a+1]||'')) k++; } if(a>0) a+=2;
  a=Math.max(a, bas-700);
  let b=son, j=0; while(b<T.length && j<cumleSay){ if(/[.!?]/.test(T[b]) && /\s/.test(T[b+1]||'')) j++; b++; }
  b=Math.min(b, son+700);
  return {once:T.slice(a,bas), cumle:T.slice(bas,son), sonra:T.slice(son,b), bas, son};
}
function kismi(d, aday) {
  // en uzun ön ek ve en uzun son ek
  let lo=8, hi=d.length, on=null;
  while(lo<=hi){const mid=(lo+hi)>>1; const r=bul(d.slice(0,mid),aday); if(r.length){on={...r[0],n:mid};lo=mid+1}else hi=mid-1;}
  lo=8; hi=d.length; let sn=null;
  while(lo<=hi){const mid=(lo+hi)>>1; const r=bul(d.slice(d.length-mid),aday); if(r.length){sn={...r[0],n:mid};lo=mid+1}else hi=mid-1;}
  return {on, sn};
}
function konumla(metin, madde, sahife) {
  const d = duzle(metin).replace(/\.\.\.?$/,'').trim();
  const sonuc = {isaret:[]};
  let yer=null, nerede=null;
  if (madde && M[madde]) { const r=bul(d,[madde]); if(r.length){ yer=r[0]; nerede='madde'; if(r.length>1) sonuc.isaret.push('MADDEDE_'+r.length+'_KEZ'); } }
  if (!yer && sahife) { const r=bul(d, sahifeMaddeleri(sahife)); if(r.length){ yer=r[0]; nerede='sahife'; } }
  if (!yer) { const r=bul(d, ids); if(r.length){ yer=r[0]; nerede='kitap'; sonuc.baskaYer=[...new Set(r.map(x=>x.id))]; } }
  if (yer) {
    sonuc.bulunan=yer.id; sonuc.nerede=nerede;
    Object.assign(sonuc, baglam(yer.id, yer.i, d.length));
    const s=M[yer.id].sahife; if (sahife!=null && (sahife<s[0]||sahife>s[1])) sonuc.isaret.push(`SAHIFE_DISI:${sahife}[${s}]`);
    if (madde && madde!==yer.id) sonuc.isaret.push(`MADDE_FARKLI:${madde}->${yer.id}`);
  } else {
    sonuc.isaret.push('BULUNAMADI');
    const aday = madde&&M[madde]? [madde]: (sahife? sahifeMaddeleri(sahife):[]);
    let k = aday.length? kismi(d, aday): {on:null,sn:null};
    if ((!k.on||k.on.n<d.length*0.3) && (!k.sn||k.sn.n<d.length*0.3)) k = kismi(d, ids);
    sonuc.kismi = {uzunluk:d.length};
    if (k.on) { const b=baglam(k.on.id,k.on.i,Math.min(k.on.n+200, M[k.on.id].duz.length-k.on.i),1); sonuc.kismi.on={madde:k.on.id, n:k.on.n, kitap:(b.once.slice(-150)+'⟦'+b.cumle+'⟧')}; }
    if (k.sn) { const st=Math.max(0,k.sn.i-200); const b=baglam(k.sn.id,st,k.sn.i-st+k.sn.n,1); sonuc.kismi.sn={madde:k.sn.id, n:k.sn.n, kitap:('⟦'+b.cumle+'⟧'+b.sonra.slice(0,150))}; }
  }
  return sonuc;
}
const T = JSON.parse(fs.readFileSync(KOK+'veri/tanimlar.json','utf8')).tanimlar;
const AH = JSON.parse(fs.readFileSync(KOK+'veri/ayet-hadis.json','utf8'));
const TANIM_KALIP = /\b(demek(dir|tir)?|denir|denilir|denil(ir|mek)|deriz|derler|denmek|ismi verilir|adi verilir|ismi|denildi|dedik|dendi|dendigi|denen|denilen|soylenir|anlasilir|tarif|ma'?nasi|manasi|demekdir)\b/;
const out = {tanim:[], ayet:[], hadis:[]};
T.forEach((t,n)=>{
  const s = konumla(t.cumle, t.madde, t.sahife);
  const dc=duzle(t.cumle), dt=duzle(t.terim);
  if (!TANIM_KALIP.test(dc)) s.isaret.push('TANIM_KALIBI_YOK');
  if (!dc.includes(dt)) s.isaret.push('TERIM_CUMLEDE_YOK');
  if (/^(buna|bunlara|bu|boyle|bunun|bunlar|bunlarin|o|onlara|ona|soyle|bunu|bundan)\b/.test(dc)) s.isaret.push('GOSTERME_BASTA');
  if (s.cumle && duzle(s.cumle)!==dc) {}
  // terim kitapta aynı yazımla var mı
  const tt = t.terim; s.terimAynen = s.bulunan ? M[s.bulunan].metin.includes(tt) : null;
  if (s.bulunan && !s.terimAynen) s.isaret.push('TERIM_YAZIMI_MADDEDE_YOK');
  out.tanim.push({n, ...t, ...s});
});
const AYET_IP = /(ayet|sure(si|sinde|sinin)?\b|meal|buyuruldu|buyuruluyor|buyurdu|kelam|kur'?an|teala .{0,20}buyur)/;
const HADIS_IP = /(hadis|resulullah|peygamber|sallallahu aleyhi ve sellem|hazret.{0,40}buyurdu|buyurdu)/;
const RED = /(sahih (olmadig|degil)|sahih olmadi|mevdu|uydurma|hadis degil|asli yok|aslı yok|uydurul|yalan|zaif|da'?if|hadis olmadig|hadis-i serif degil|kizb)/;
function cevre(s){ return duzle((s.once||'')+' '+(s.cumle||'')+' '+(s.sonra||'')); }
AH.ayetler.forEach((a,n)=>{
  const s = konumla(a.metin, a.madde, a.sahife);
  const c=cevre(s), on=duzle(s.once||''), sn=duzle(s.sonra||'');
  if (s.bulunan) {
    if (!/(ayet|sure)/.test(on+' '+sn)) s.isaret.push('AYET_IPUCU_YOK');
    if (/hadis/.test(on.slice(-200)+' '+sn.slice(0,150))) s.isaret.push('HADIS_IPUCU_YAKIN');
    if (a.sure && !c.includes(duzle(a.sure).split(' ')[0])) s.isaret.push('SURE_ADI_YAKINDA_YOK');
    if (a.ayetNo && !c.includes(duzle(a.ayetNo))) s.isaret.push('AYETNO_YAKINDA_YOK');
  }
  out.ayet.push({n, ...a, ...s});
});
AH.hadisler.forEach((a,n)=>{
  const s = konumla(a.metin, a.madde, a.sahife);
  if (s.bulunan) {
    const on=duzle(s.once||''), sn=duzle(s.sonra||''), c=on+' '+sn;
    if (!/(hadis|buyurdu|buyurmus|buyurdular|resulullah)/.test(c)) s.isaret.push('HADIS_IPUCU_YOK');
    if (/(ayet|suresi)/.test(on.slice(-200))) s.isaret.push('AYET_IPUCU_YAKIN');
    if (RED.test(c+' '+duzle(s.cumle))) s.isaret.push('RED_IFADESI:'+(c.match(RED)||duzle(s.cumle).match(RED))[0]);
    if (a.kaynak && !c.includes(duzle(a.kaynak).split(' ')[0].slice(0,6))) s.isaret.push('KAYNAK_YAKINDA_YOK');
  }
  out.hadis.push({n, ...a, ...s});
});
// âyet ↔ hadîs çakışmaları
const ad = out.ayet.map(x=>duzle(x.metin)), hd=out.hadis.map(x=>duzle(x.metin));
out.cakisma=[]; ad.forEach((a,i)=>hd.forEach((h,j)=>{ if(a===h||(a.length>30&&h.includes(a))||(h.length>30&&a.includes(h))) out.cakisma.push([i,j]); }));
// yinelenenler
const yin=(arr,f)=>{const m={}; arr.forEach((x,i)=>{const k=duzle(f(x)); (m[k]=m[k]||[]).push(i)}); return Object.values(m).filter(v=>v.length>1);};
out.yinelenen={tanimCumle:yin(T,x=>x.cumle), ayet:yin(AH.ayetler,x=>x.metin), hadis:yin(AH.hadisler,x=>x.metin)};
fs.writeFileSync(CIK+'tarama.json', JSON.stringify(out,null,1));
const say = arr => { const c={}; for(const x of arr) for(const f of x.isaret) { const k=f.split(':')[0]; c[k]=(c[k]||0)+1; } return c; };
console.log('tanim', say(out.tanim)); console.log('ayet', say(out.ayet)); console.log('hadis', say(out.hadis));
console.log('cakisma', out.cakisma.length, 'yin', JSON.stringify(out.yinelenen));
