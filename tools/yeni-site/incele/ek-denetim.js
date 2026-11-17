const fs=require('fs');const {yukle,KOK}=require('./yukle');
const T={};for(const k of [1,2,3])T[k]=JSON.parse(fs.readFileSync(KOK+`/texts/kisim${k}.json`,'utf8'));
const toc=yukle('data.js').tocData;const tm=new Map(toc.map(m=>[m.kisim+'/'+m.madde_no,m]));
const tum=toc.map(m=>[m.kisim+'/'+m.madde_no,T[m.kisim][m.madde_no]]);const norm=s=>s.replace(/\s+/g,' ');
// 1) ")" ile biten liste numaraları
let lst=0;for(const [,t] of tum) lst+=(t.match(/(^|[\s(])[0-9a-zA-Zçğıöşü]{1,2}\)/gm)||[]).length;console.log('"1)" / "a)" biçimli liste işareti (kapanış parantezi dengesizliğini açıklayabilir):',lst);
const d2=tum.filter(([k])=>['2/47','2/46','3/20','1/31'].includes(k)).map(([k,t])=>k+': '+(t.match(/(^|\n)[^\n(]{0,10}\)/g)||[]).slice(0,4).map(x=>JSON.stringify(x)).join(' '));console.log(d2.join('\n'));
// 2) tablo/cedvel dışı çift boşluk
let cb=[];for(const [k,t] of tum)for(const p of t.split(/\n{2,}/)){if(p.includes('\n')||p.startsWith('⟦'))continue;const m=p.match(/\S  +\S/g);if(m)cb.push(k+': '+JSON.stringify(m[0])+' … '+JSON.stringify(p.slice(Math.max(0,p.search(/\S  +\S/)-30),p.search(/\S  +\S/)+30)));}
console.log('tek satırlık paragraflarda çift boşluk:',cb.length,cb.slice(0,20));
// 3) hüküm metni bulunamayanlar
const huk=yukle('hukumler-data.js').hukumlerData;const mm=new Map(tum.map(([k,t])=>[k,norm(t)]));
const yok=huk.filter(h=>h.kisim&&!(mm.get(h.kisim+'/'+h.madde_no)||'').includes(norm(h.metin)));
console.log('hüküm bulunamayan',yok.length);yok.slice(0,4).forEach(h=>{const t=mm.get(h.kisim+'/'+h.madde_no);const bas=norm(h.metin).slice(0,30);const i=t.indexOf(bas);console.log(' id',h.id,h.kisim+'/'+h.madde_no,'ilk 30 harf metinde:',i>=0,'|',JSON.stringify(h.metin.slice(0,120)), i>=0?'\n    kitap: '+JSON.stringify(t.slice(i,i+120)):'');});
console.log(' bulunamayanların tümü:',yok.map(h=>h.id).join(','));
// 4) tanimlar bulunamayan ve madde aralığında olan
const tan=yukle('tanimlar.js').tanimlarData;const hepsi=tum.map(([,t])=>norm(t)).join('\n');const icinde=p=>toc.some(m=>p>=m.sayfa_no&&p<=m.sayfa_bitis);
const ty=tan.filter(x=>!hepsi.includes(norm(x.c)));console.log('tanım bulunamayan',ty.length,'— bunlardan madde aralığındaki sayfada olan:',ty.filter(x=>icinde(x.s)).map(x=>x.t+' s.'+x.s));
// 5) ayet/hadis bulunamayan
const ah=yukle('ayet-hadis.js').ayetHadisData;for(const tur of ['ayetler','hadisler']){const y=ah[tur].filter(r=>r.kisim&&!(mm.get(r.kisim+'/'+r.madde)||'').includes(norm(r.metin)));console.log(tur,'bulunamayan',y.map(r=>r.kisim+'/'+r.madde+' s.'+r.sayfa+' '+JSON.stringify(r.metin.slice(0,70))));}
// 6) ayet sayfa < 17 ya da > 1058 olanlar (madde dışı)
for(const tur of ['ayetler','hadisler'])console.log(tur,'madde dışı sayfa (önsöz/hâl tercemeleri):',ah[tur].filter(r=>r.sayfa<17||r.sayfa>1058).length);
// 7) özet bulunamayan
const O=yukle('ozetler.js').maddeOzetleri;for(const k of ['1/51','2/4','2/5','3/61'])console.log('özet',k,JSON.stringify(O[k].slice(0,140)));
// 8) sahislar sayfalar: maddeler dışı sayfa sayısı
const sah=yukle('sahislar.js').sahislarData;let dis=0,top=0;sah.forEach(s=>s.sayfalar.forEach(p=>{top++;if(!icinde(p))dis++;}));console.log('şahıs sayfalar toplam',top,'madde aralığı dışı',dis);
// sahis isimlerinin metinde geçme oranı: gectigiMaddeler boş olanlar
console.log('gectigiMaddeler boş:',sah.filter(s=>!s.gectigiMaddeler.length).length,'sayfalar boş:',sah.filter(s=>!s.sayfalar.length).length);
// biyografi uzunluğu
const bl=sah.map(s=>s.biyografi.length).sort((a,b)=>a-b);console.log('biyografi uzunluğu min/medyan/max',bl[0],bl[bl.length>>1],bl[bl.length-1]);
// 9) N. ci sahîfe atıflarının hedef sayfası
const hedef=[];for(const [k,t] of tum)for(const m of t.matchAll(/(\d+)\. ?(?:ci|cı|cü|cu) sah[îi]fe/g))hedef.push(+m[1]);console.log('sahîfe atfı hedef aralığı',Math.min(...hedef),'-',Math.max(...hedef),'1248 üstü:',hedef.filter(x=>x>1248).length);
// 10) [m. ] köşeli parantez açıklamaları türleri
const kp={};for(const [,t] of tum)for(const m of t.matchAll(/\[([^\]]{0,40})\]/g)){const x=/^\d+$/.test(m[1])?'[sayı]':/^m\. ?\d/.test(m[1])?'[m. yıl]':/^\d+[\-–—]\d+$/.test(m[1])?'[sayı-sayı]':'[açıklama]';kp[x]=(kp[x]||0)+1;}console.log('köşeli parantez içerik türleri:',kp);
// 11) normal parantez: (Kitap adı) kalıbı — büyük harfle başlayan kısa parantez
let pa=0,pk=0;for(const [,t] of tum)for(const m of t.matchAll(/\(([^()]{1,60})\)/g)){pa++;if(/^[A-ZÇĞİÖŞÜÂÎÛ]/.test(m[1]))pk++;}console.log('kısa (≤60) parantez',pa,'büyük harfle başlayan (kitap adı/terim/alıntı):',pk);
// 12) “ ” çifti içinde dua kalıpları
const tt={};for(const [,t] of tum)for(const m of t.matchAll(/“([^”]{1,40})”/g))tt[m[1]]=(tt[m[1]]||0)+1;console.log('“…” en sık içerikler:',Object.entries(tt).sort((a,b)=>b[1]-a[1]).slice(0,12));
// 13) ’ kullanım: kesme/hemze
// 14) Sözlük i eksik ve d nadir değerler
const sz=yukle('sozluk-data.js').sozlukData;console.log('d nadir:',sz.filter(x=>['İ','E','B'].includes(x.d)).slice(0,14).map(x=>x.k+':'+x.d));
console.log('sözlük o (Osmanlıca) içinde Arap harfi olmayan:',sz.filter(x=>x.o&&!/[؀-ۿ]/.test(x.o)).length);
console.log('sözlük a/m içinde HTML:',sz.filter(x=>/<[a-z]/i.test(x.a+(x.m||''))).length);
// 15) madde başlığı metindeki ilk satırla
let bOk=0;for(const m of toc){const t=T[m.kisim][m.madde_no];const ilk=t.split('\n\n').find(p=>/^\d+ [—–] /.test(p));if(ilk)bOk++;}console.log('"N — BAŞLIK" satırı bulunan madde',bOk);
const ornekBas=toc.slice(0,4).map(m=>JSON.stringify(T[m.kisim][m.madde_no].split('\n\n').find(p=>/^\d+ [—–] /.test(p))||'').slice(0,90)+'  ⇔ toc: '+m.baslik);console.log(ornekBas.join('\n'));
