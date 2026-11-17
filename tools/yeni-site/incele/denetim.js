// Veri tutarlılık denetimi. Hiçbir dosyayı değiştirmez; yalnız sayar ve listeler.
const fs=require('fs');const {yukle,KOK}=require('./yukle');
const L=(...a)=>console.log(...a);
const ilk=(arr,n=20)=>arr.slice(0,n);
const toc=yukle('data.js'); const tocData=toc.tocData, tablolar=toc.tablolarData;
const mad=yukle('maddeler-data.js').maddelerData;
const texts={};for(const k of [1,2,3]) texts[k]=JSON.parse(fs.readFileSync(KOK+`/texts/kisim${k}.json`,'utf8'));
const key=(k,m)=>k+'/'+m; const tocMap=new Map(tocData.map(m=>[key(m.kisim,m.madde_no),m]));
const var_=(k,m)=>tocMap.has(key(k,m));
// app.js içindeki gömülü sesAraligiMap ve quizSorulari
const app=fs.readFileSync(KOK+'/app.js','utf8');
function literal(ad){const i=app.indexOf('var '+ad+' = ');let j=app.indexOf('{',i),d=0,p=j;for(;p<app.length;p++){const c=app[p];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}return (new Function('return '+app.slice(j,p+1)))();}
const ses=literal('sesAraligiMap'), quiz=literal('quizSorulari');

L('### 1. tocData');
const dup=(arr)=>{const s=new Map();arr.forEach(x=>s.set(x,(s.get(x)||0)+1));return [...s].filter(([,n])=>n>1);};
L('yinelenen anahtar:',dup(tocData.map(m=>key(m.kisim,m.madde_no))));
for(const k of [1,2,3]){const ns=tocData.filter(m=>m.kisim===k).map(m=>m.madde_no);L(`kısım ${k}: ${ns.length} madde, ardışık mı: ${ns.every((n,i)=>n===i+1)}`);}
L('sayfa_no===pdf_sayfa_baslangic:',tocData.filter(m=>m.sayfa_no===m.pdf_sayfa_baslangic).length,'/',tocData.length,'; sayfa_bitis===pdf_sayfa_bitis:',tocData.filter(m=>m.sayfa_bitis===m.pdf_sayfa_bitis).length);
L('sayfa_bitis<sayfa_no:',tocData.filter(m=>m.sayfa_bitis<m.sayfa_no).map(m=>key(m.kisim,m.madde_no)));
let geri=[];for(let i=1;i<tocData.length;i++) if(tocData[i].sayfa_no<tocData[i-1].sayfa_no) geri.push(key(tocData[i].kisim,tocData[i].madde_no));L('sayfa sırası geri giden:',geri);
L('sayfa aralığı:',Math.min(...tocData.map(m=>m.sayfa_no)),'-',Math.max(...tocData.map(m=>m.sayfa_bitis)));
L('mektup_ref dolu:',tocData.filter(m=>m.mektup_ref).length,'biçim örnekleri:',[...new Set(tocData.map(m=>m.mektup_ref).filter(Boolean))].slice(0,8),'biçime uymayan (^\\d—\\d+$):',tocData.map(m=>m.mektup_ref).filter(x=>x&&!/^\d—\d+$/.test(x)));

L('\n### 2. maddelerData vs tocData vs texts');
let metaFark=[];for(const m of mad){const t=tocMap.get(key(m.kisim,m.madde_no));if(!t){metaFark.push(key(m.kisim,m.madde_no)+' tocda yok');continue;}for(const f of ['mektup_ref','baslik','sayfa_no','sayfa_bitis','pdf_sayfa_baslangic','pdf_sayfa_bitis']) if(t[f]!==m[f]) metaFark.push(key(m.kisim,m.madde_no)+' '+f);}
L('meta farkı:',metaFark.length,ilk(metaFark));
let ayni=0,farkli=[],yok=[];for(const m of mad){const t=texts[m.kisim][String(m.madde_no)];if(t==null){yok.push(key(m.kisim,m.madde_no));continue;}if(t===m.metin)ayni++;else farkli.push(key(m.kisim,m.madde_no)+` (js ${m.metin.length} / json ${t.length})`);}
L('metin aynı:',ayni,'farklı:',farkli.length,ilk(farkli),'textsde yok:',yok);
for(const k of [1,2,3]){const ks=Object.keys(texts[k]);const fazla=ks.filter(x=>!var_(k,+x));L(`texts/kisim${k}.json: ${ks.length} anahtar, tocda olmayan: ${fazla}`);}
const tumMetin=[];for(const m of tocData){tumMetin.push([key(m.kisim,m.madde_no),texts[m.kisim][String(m.madde_no)]||'']);}
const toplamHarf=tumMetin.reduce((a,[,t])=>a+t.length,0);L('toplam karakter:',toplamHarf,'en kısa:',tumMetin.slice().sort((a,b)=>a[1].length-b[1].length).slice(0,3).map(([k,t])=>k+':'+t.length),'en uzun:',tumMetin.slice().sort((a,b)=>b[1].length-a[1].length).slice(0,3).map(([k,t])=>k+':'+t.length));

L('\n### 3. Metin biçimi ve işaretler (texts/*.json, 241 madde)');
const say=(re)=>{let n=0,mad=0;for(const [,t] of tumMetin){const c=(t.match(re)||[]).length;n+=c;if(c)mad++;}return n+' (madde: '+mad+')';};
const desenler={'( ':/\(/g,') ':/\)/g,'[':/\[/g,']':/\]/g,'“ (U+201C)':/“/g,'” (U+201D)':/”/g,'‘ (U+2018)':/‘/g,'’ (U+2019)':/’/g,"' (düz kesme)":/'/g,'" (düz tırnak)':/"/g,'« »':/[«»]/g,'— (U+2014)':/—/g,'– (U+2013)':/–/g,'… (U+2026)':/…/g,'... (üç nokta)':/\.\.\./g,'* yıldız':/\*/g,'⟦şekil:N⟧':/⟦şekil:\d+⟧/g,'⟦cedvel:N⟧':/⟦cedvel:\d+⟧/g,'⟦ diğer':/⟦(?!şekil:|cedvel:)/g,'[N] dipnot paragrafı':/(^|\n\n)\[\d\] /g,'[rakam] metin içi':/\[\d+\]/g,'[m. YYYY] miladi':/\[m\. ?\d+/g,'Madde N’e bak (çapraz atıf)':/Madde \d{1,3}(?=[’']?[ea] bak)/g,'N. ci/cı sahîfe atfı':/\d+\. ?(?:ci|cı|cü|cu) sah[îi]fe/g,'sahîfe kelimesi':/sah[îi]fe/g,'sekme \\t':/\t/g,'NBSP U+00A0':/ /g,'yumuşak tire U+00AD':/­/g,'sıfır genişlik U+200B-200D/FEFF':/[​-‍﻿]/g,'� U+FFFD':/�/g,'HTML etiketi <..>':/<\/?[a-zA-Z][^>]*>/g,'HTML varlığı &x;':/&[a-zA-Z#0-9]+;/g,'çift boşluk (tablo dışı da dahil)':/\S  +\S/g,'satır sonu boşluk':/ +\n/g,'3+ satır sonu':/\n{3,}/g,'\\r':/\r/g,'Arapça harf':/[؀-ۿ]/g,'ﷺ vb. özel':/[ﷰ-﷿]/g};
for(const [a,re] of Object.entries(desenler)) L(' ',a,':',say(re));
// açılış satırı
const basNo=tumMetin.filter(([k,t])=>new RegExp('^'+k.split('/')[1]+' — ').test(t));L('metni "N — " ile başlayan:',basNo.length,'/ 241; başlamayan:',tumMetin.filter(([k,t])=>!new RegExp('^'+k.split('/')[1]+' — ').test(t)).map(([k,t])=>k+': '+JSON.stringify(t.slice(0,40))).slice(0,12));
// paragraf türleri (app.js maddeMetniHTML mantığı)
function araBaslik(par){if(par.length>160)return false;const h=par.replace(/“[^”]*”/g,'').replace(/[^A-Za-zÇĞİÖŞÜÂÎÛçğıöşüâîû]/g,'');if(h.length<3)return false;let b=0;for(const ch of h)if(ch===ch.toLocaleUpperCase('tr')&&ch!==ch.toLocaleLowerCase('tr'))b++;return b/h.length>=0.7;}
const tip={};const tipOrn={};for(const [k,t] of tumMetin){for(const par of t.split(/\n{2,}/)){if(!par.trim()){tip.bos=(tip.bos||0)+1;continue;}let x;if(/^⟦şekil:(\d+)⟧$/.test(par))x='sekil';else if(/^⟦cedvel:(\d+)⟧\n/.test(par))x='cedvel';else if(par.includes('\n'))x=/\S {2,}\S/.test(par)?'tablo(pre)':'siir(br)';else if(/^\[\d\] /.test(par))x='dipnot';else if(araBaslik(par))x='ara-baslik';else x='paragraf';tip[x]=(tip[x]||0)+1;if(!tipOrn[x])tipOrn[x]=k+': '+JSON.stringify(par.slice(0,120));}}
L('paragraf türleri:',tip);for(const [a,o] of Object.entries(tipOrn))L('   örnek',a,'=',o);
// parantez dengesi
const dengesiz=[];for(const [k,t] of tumMetin){const r=(a,b)=>(t.split(a).length-1)-(t.split(b).length-1);const d={'()':r('(',')'),'[]':r('[',']'),'“”':r('“','”')};const bozuk=Object.entries(d).filter(([,v])=>v);if(bozuk.length)dengesiz.push(k+' '+bozuk.map(([a,v])=>a+':'+(v>0?'+':'')+v).join(' '));}
L('parantez/tırnak dengesiz madde:',dengesiz.length,ilk(dengesiz));
// alışılmadık karakterler
const kar={};for(const [,t] of tumMetin)for(const ch of t){if(/[A-Za-z0-9\s.,;:!?()\[\]\-ÇĞİÖŞÜÂÎÛçğıöşüâîûÊêÔô’‘“”—…'"*\/]/.test(ch))continue;kar[ch]=(kar[ch]||0)+1;}
L('olağan dışı karakterler (ilk 60):',Object.entries(kar).sort((a,b)=>b[1]-a[1]).slice(0,60).map(([c,n])=>`${JSON.stringify(c)} U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}×${n}`).join(', '));
// çapraz atıf hedefleri var mı (aynı kısım içinde)
const atifKirik=[];for(const [k,t] of tumMetin){const kis=+k.split('/')[0];for(const m of t.matchAll(/Madde (\d{1,3})(?=[’']?[ea] bak)/g)){if(!var_(kis,+m[1]))atifKirik.push(k+' → Madde '+m[1]);}}
L('metin içi "Madde N’e bak" kırık (aynı kısımda yok):',atifKirik.length,ilk(atifKirik));
const sekilSayfa=[];for(const [k,t] of tumMetin){for(const m of t.matchAll(/⟦(?:şekil|cedvel):(\d+)⟧/g)){const md=tocMap.get(k);const s=+m[1];if(s<md.sayfa_no||s>md.sayfa_bitis)sekilSayfa.push(k+' ⟦'+s+'⟧ madde aralığı '+md.sayfa_no+'-'+md.sayfa_bitis);}}
L('⟦şekil/cedvel⟧ sayfası madde aralığı dışında:',sekilSayfa.length,ilk(sekilSayfa));

L('\n### 4. tablolarData');
L('id yinelenen:',dup(tablolar.map(t=>t.id)));const tipD={};tablolar.forEach(t=>tipD[t.tip]=(tipD[t.tip]||0)+1);L('tip dağılımı:',tipD);const katD={};tablolar.forEach(t=>katD[t.kategori]=(katD[t.kategori]||0)+1);L('kategori dağılımı:',katD);
const kmBicim=tablolar.map(t=>t.kaynak_madde).filter(x=>x&&!/^K[123]\/M\d+$/.test(x));L('kaynak_madde biçime uymayan:',kmBicim);
const kmKirik=tablolar.filter(t=>t.kaynak_madde&&/^K(\d)\/M(\d+)$/.test(t.kaynak_madde)&&!var_(+RegExp.$1,+RegExp.$2)).map(t=>t.id+' '+t.kaynak_madde);L('kaynak_madde kırık:',kmKirik);
L('kaynak_madde boş:',tablolar.filter(t=>!t.kaynak_madde).map(t=>t.id));
L('veriler yok/null:',tablolar.filter(t=>t.veriler==null).map(t=>t.id+' tip='+t.tip+' anahtarlar='+Object.keys(t).join(',')));
const sayfaDis=tablolar.filter(t=>{const m=/^K(\d)\/M(\d+)$/.exec(t.kaynak_madde||'');if(!m)return false;const md=tocMap.get(m[1]+'/'+m[2]);return md&&(t.sayfa_no<md.sayfa_no||t.sayfa_no>md.sayfa_bitis);}).map(t=>t.id+' s.'+t.sayfa_no+' '+t.kaynak_madde);L('sayfa_no kaynak madde aralığı dışında:',sayfaDis.length,ilk(sayfaDis));
// tip başına veriler şekli
const tipSekil={};for(const t of tablolar){const v=t.veriler;let s;if(Array.isArray(v)){const ks=new Set();v.forEach(x=>{if(x&&typeof x==='object'&&!Array.isArray(x))Object.keys(x).forEach(k=>ks.add(k));else ks.add('<'+(Array.isArray(x)?'array':typeof x)+'>');});s='array['+[...ks].join(',')+']';}else if(v&&typeof v==='object')s='object{'+Object.keys(v).join(',')+'}';else s=String(v);(tipSekil[t.tip]=tipSekil[t.tip]||new Set()).add(s+(t.kolonlar?' +kolonlar':'')+(t.sol_baslik?' +sol/sag_baslik':'')+(t.dallar?' +dallar':''));}
for(const [k,v] of Object.entries(tipSekil))L('  tip',k,':',[...v].join(' || '));
// tablolar içinde geçen madde atıfları K\d/M\d
const icAtif=[];const icKirik=[];for(const t of tablolar){const s=JSON.stringify(t.veriler||'')+JSON.stringify(t.dallar||'');for(const m of s.matchAll(/K(\d)\/M(\d+)/g)){icAtif.push(1);if(!var_(+m[1],+m[2]))icKirik.push(t.id+' '+m[0]);}}
L('veriler/dallar içindeki K/M atıfları:',icAtif.length,'kırık:',icKirik.length,ilk(icKirik));
const hangiMaddeTablosuz=tocData.filter(m=>!tablolar.some(t=>t.kaynak_madde==='K'+m.kisim+'/M'+m.madde_no)).length;L('kaynak tablosu olmayan madde:',hangiMaddeTablosuz,'/ 241');

L('\n### 5. sahislarData');
const sah=yukle('sahislar.js').sahislarData;
function slugify(text){return text.toLowerCase().replace(/[âÂ]/g,'a').replace(/[çÇ]/g,'c').replace(/[êÊ]/g,'e').replace(/[ğĞ]/g,'g').replace(/[ıİ]/g,'i').replace(/[îÎ]/g,'i').replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u').replace(/[ûÛ]/g,'u').replace(/[''‘’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
L('slug yinelenen:',dup(sah.map(s=>s.slug)));
let sOk=0;const sYok=[];const goruldu={};for(const s of sah){const b=slugify(s.isim);goruldu[b]=(goruldu[b]||0)+1;const bek=goruldu[b]>1?b+'-'+goruldu[b]:b;if(bek===s.slug)sOk++;else sYok.push(s.isim+' → '+s.slug+' (beklenen '+bek+')');}
L('slug = slugify(isim) [+ "-N" yinelenmede, N=sıra]:',sOk,'/',sah.length,'uymayan:',sYok.length,ilk(sYok,25));
L('isim yinelenen:',dup(sah.map(s=>s.isim)).length,ilk(dup(sah.map(s=>s.isim)),10));
const nolar=sah.map(s=>s.no).filter(x=>x!=null);L('no yinelenen:',dup(nolar),'aralık',Math.min(...nolar),'-',Math.max(...nolar),'eksik numaralar:',(()=>{const st=new Set(nolar);const e=[];for(let i=1;i<=Math.max(...nolar);i++)if(!st.has(i))e.push(i);return e;})(),'no=null olanlar:',sah.filter(s=>s.no==null).map(s=>s.isim+' | '+s.kaynak));
const katS={};sah.forEach(s=>katS[s.kategori]=(katS[s.kategori]||0)+1);L('kategori:',katS);
const unv={};sah.forEach(s=>unv[s.unvan]=(unv[s.unvan]||0)+1);L('unvan değerleri:',unv);
const gmKirik=[];const gmBicim=[];let gmTop=0;for(const s of sah)for(const r of s.gectigiMaddeler){gmTop++;if(!/^\d\/\d+$/.test(r))gmBicim.push(s.slug+' '+r);else{const [a,b]=r.split('/');if(!var_(+a,+b))gmKirik.push(s.slug+' '+r);}}
L('gectigiMaddeler toplam atıf:',gmTop,'biçim bozuk:',gmBicim.length,ilk(gmBicim),'kırık:',gmKirik.length,ilk(gmKirik));
L('gectigiMaddeler içinde yinelenen olan şahıs:',sah.filter(s=>new Set(s.gectigiMaddeler).size!==s.gectigiMaddeler.length).length);
const sayfaKotu=sah.filter(s=>s.sayfalar.some(p=>typeof p!=='number'||p<1||p>1248)).map(s=>s.slug);L('sayfalar 1-1248 dışı/sayı değil:',sayfaKotu.length,ilk(sayfaKotu));
// sayfalar ↔ gectigiMaddeler tutarlılığı
const sayfaMadde=p=>tocData.filter(m=>p>=m.sayfa_no&&p<=m.sayfa_bitis).map(m=>key(m.kisim,m.madde_no));
let tutarsizSG=[];for(const s of sah){const fromPages=new Set(s.sayfalar.flatMap(sayfaMadde));const eks=s.gectigiMaddeler.filter(r=>!fromPages.has(r));if(eks.length)tutarsizSG.push(s.slug+' maddeler sayfalarla örtüşmüyor: '+eks.join(','));}
L('gectigiMaddeler sayfalar listesiyle örtüşmeyen şahıs:',tutarsizSG.length,ilk(tutarsizSG,10));
L('kaynak biçimleri:',[...new Set(sah.map(s=>s.kaynak.replace(/\d+/g,'N')))]);
L('biyografisi "… ismine bakınız" yönlendirmesi olan:',sah.filter(s=>/ismine bak/.test(s.biyografi)).length);
L('biyografide \\n olan:',sah.filter(s=>s.biyografi.includes('\n')).length);

L('\n### 6. hukumlerData');
const huk=yukle('hukumler-data.js').hukumlerData;
L('id yinelenen:',dup(huk.map(h=>h.id)).length,'id aralığı',Math.min(...huk.map(h=>h.id)),'-',Math.max(...huk.map(h=>h.id)));
const turD={},katmD={},altD={};huk.forEach(h=>{turD[h.tur]=(turD[h.tur]||0)+1;katmD[h.katman]=(katmD[h.katman]||0)+1;altD[h.alt_tur]=(altD[h.alt_tur]||0)+1;});L('tur:',turD,'katman:',katmD,'alt_tur farklı değer:',Object.keys(altD).length);
const hKirik=huk.filter(h=>!var_(h.kisim,h.madde_no)).map(h=>'id '+h.id+' '+h.kisim+'/'+h.madde_no+' s.'+h.sayfa+' konu='+h.konu);L('madde kırık/null:',hKirik.length,ilk(hKirik));
const hKonu=huk.filter(h=>var_(h.kisim,h.madde_no)&&tocMap.get(key(h.kisim,h.madde_no)).baslik!==h.konu).map(h=>'id '+h.id+' konu≠başlık: '+h.konu+' ≠ '+tocMap.get(key(h.kisim,h.madde_no)).baslik);L('konu ≠ madde başlığı:',hKonu.length,ilk(hKonu,5));
const hSayfa=huk.filter(h=>{const m=tocMap.get(key(h.kisim,h.madde_no));return m&&(h.sayfa<m.sayfa_no||h.sayfa>m.sayfa_bitis);}).map(h=>'id '+h.id+' s.'+h.sayfa+' madde '+h.kisim+'/'+h.madde_no);L('sayfa madde aralığı dışında:',hSayfa.length,ilk(hSayfa,10));
// metin kitapta aynen geçiyor mu
const norm=s=>s.replace(/\s+/g,' ');let hBul=0;const hBulma=[];const metinMap=new Map(tumMetin.map(([k,t])=>[k,norm(t)]));for(const h of huk){const t=metinMap.get(key(h.kisim,h.madde_no));if(t&&t.includes(norm(h.metin)))hBul++;else hBulma.push('id '+h.id);}
L('hüküm metni kendi maddesinde aynen geçen:',hBul,'/',huk.length,'geçmeyen:',hBulma.length,ilk(hBulma,10));
L('metin yinelenen (aynı metin birden çok kayıt):',dup(huk.map(h=>h.metin)).length);
L('hükmü olmayan madde:',tocData.filter(m=>!huk.some(h=>h.kisim===m.kisim&&h.madde_no===m.madde_no)).map(m=>key(m.kisim,m.madde_no)));

L('\n### 7. ayetHadisData');
const ah=yukle('ayet-hadis.js').ayetHadisData;
for(const tur of ['ayetler','hadisler']){const a=ah[tur];const kir=a.filter(r=>r.kisim==null||!var_(r.kisim,r.madde)).map(r=>`${r.kisim}/${r.madde} s.${r.sayfa}: ${r.metin.slice(0,50)}`);L(tur,a.length,'madde null/kırık:',kir.length,kir);
 const sd=a.filter(r=>{const m=tocMap.get(key(r.kisim,r.madde));return m&&(r.sayfa<m.sayfa_no||r.sayfa>m.sayfa_bitis);}).map(r=>`${r.kisim}/${r.madde} s.${r.sayfa}`);L('  sayfa madde aralığı dışında:',sd.length,ilk(sd,10));
 let bul=0;const yokl=[];for(const r of a){const t=metinMap.get(key(r.kisim,r.madde));if(t&&t.includes(norm(r.metin)))bul++;else yokl.push(`${r.kisim}/${r.madde}`);}L('  metni kendi maddesinde aynen geçen:',bul,'/',a.length);
 L('  yinelenen metin:',dup(a.map(r=>r.metin)).length);}

L('\n### 8. tanimlarData');
const tan=yukle('tanimlar.js').tanimlarData;L('t yinelenen:',dup(tan.map(x=>x.t)));
const tanSayfaMadde=tan.filter(x=>!sayfaMadde(x.s).length).map(x=>x.t+' s.'+x.s);L('sayfası hiçbir madde aralığına düşmeyen:',tanSayfaMadde.length,ilk(tanSayfaMadde));
let tb=0;const tYok=[];const hepsi=tumMetin.map(([,t])=>norm(t)).join('\n');for(const x of tan){if(hepsi.includes(norm(x.c)))tb++;else tYok.push(x.t);}L('tanım cümlesi kitap metninde aynen geçen:',tb,'/',tan.length,'geçmeyen:',tYok.length,ilk(tYok,10));

L('\n### 9. crossRefData');
const cr=yukle('crossref.js').crossRefData;const crK=Object.keys(cr);L('anahtar tocda olmayan:',crK.filter(k=>!tocMap.has(k)),'toc maddesi anahtarsız:',tocData.filter(m=>!(key(m.kisim,m.madde_no) in cr)).length);
const nedD={};let crKirik=[],crSelf=[],crDup=[];for(const [k,arr] of Object.entries(cr)){const g=new Set();for(const r of arr){nedD[r.neden]=(nedD[r.neden]||0)+1;const t=key(r.kisim,r.madde_no);if(!tocMap.has(t))crKirik.push(k+'→'+t);if(t===k)crSelf.push(k);if(g.has(t))crDup.push(k+'→'+t);g.add(t);}}
L('neden dağılımı:',nedD,'kırık:',crKirik,'kendine:',crSelf,'aynı hedef yinelenen:',crDup.length,ilk(crDup));
const boyut=Object.values(cr).map(a=>a.length);L('madde başına ilişki: en az',Math.min(...boyut),'en çok',Math.max(...boyut));
// "madde referansı" kitap metniyle uyumlu mu
let mrOk=0,mrTop=0;const mrYok=[];for(const [k,arr] of Object.entries(cr))for(const r of arr)if(r.neden==='madde referansı'){mrTop++;const t=(texts[+k.split('/')[0]]||{})[k.split('/')[1]]||'';if(new RegExp('\\b'+r.madde_no+'\\b').test(t))mrOk++;else mrYok.push(k+'→'+r.kisim+'/'+r.madde_no);}
L('"madde referansı" ilişkisinde hedef numara kaynak metinde geçiyor:',mrOk,'/',mrTop,ilk(mrYok,10));
// atıf yapan madde simetri
let asim=[];for(const [k,arr] of Object.entries(cr))for(const r of arr)if(r.neden==='atıf yapan madde'){const t=key(r.kisim,r.madde_no);if(!(cr[t]||[]).some(x=>key(x.kisim,x.madde_no)===k&&x.neden==='madde referansı'))asim.push(k+'←'+t);}
L('"atıf yapan madde" karşılığında "madde referansı" bulunmayan:',asim.length,ilk(asim,10));

L('\n### 10. ozetler / maddeUzunluklari');
const oz=yukle('ozetler.js');const O=oz.maddeOzetleri,U=oz.maddeUzunluklari;
L('özet anahtarı tocda olmayan:',Object.keys(O).filter(k=>!tocMap.has(k)),'özeti olmayan madde:',tocData.filter(m=>!O[key(m.kisim,m.madde_no)]).map(m=>key(m.kisim,m.madde_no)));
let ozPrefix=0;const ozDegil=[];for(const [k,v] of Object.entries(O)){const t=norm(texts[+k.split('/')[0]][k.split('/')[1]]||'');const v2=norm(v.replace(/…$/,''));if(t.includes(v2))ozPrefix++;else ozDegil.push(k);}
L('özet metnin içinde aynen geçen:',ozPrefix,'/ 241',ilk(ozDegil));
L('… ile biten özet:',Object.values(O).filter(v=>v.endsWith('…')).length);
let uzEsit=0;const uzFark=[];for(const [k,v] of Object.entries(U)){const t=texts[+k.split('/')[0]][k.split('/')[1]]||'';if(t.length===v)uzEsit++;else uzFark.push(k+' '+v+' vs '+t.length+' (fark '+(v-t.length)+')');}
L('maddeUzunluklari = metin.length:',uzEsit,'/',Object.keys(U).length,ilk(uzFark,8));

L('\n### 11. rehberler');
const reh=yukle('rehberler.js').rehberlerData;let rT=0;const rK=[],rN=[];for(const r of reh)for(const b of r.bolumler)for(const m of b.maddeler){rT++;if(!var_(m.kisim,m.maddeNo))rK.push(r.id+' '+m.kisim+'/'+m.maddeNo);else if(m.not!==tocMap.get(key(m.kisim,m.maddeNo)).baslik)rN.push(r.id+' '+m.kisim+'/'+m.maddeNo+': "'+m.not+'"');}
L('rehber sayısı',reh.length,'bölüm',reh.reduce((a,r)=>a+r.bolumler.length,0),'madde atfı',rT,'kırık:',rK,'not≠başlık:',rN.length,ilk(rN,8));
const bolAlan=new Set();reh.forEach(r=>r.bolumler.forEach(b=>Object.keys(b).forEach(k=>bolAlan.add(k))));const mAlan=new Set();reh.forEach(r=>r.bolumler.forEach(b=>b.maddeler.forEach(m=>Object.keys(m).forEach(k=>mAlan.add(k)))));L('bölüm alanları',[...bolAlan],'madde alanları',[...mAlan]);

L('\n### 12. gununSorusuData');
const gs=yukle('gunun-sorusu-data.js').gununSorusuData;const gK=gs.filter(g=>!var_(g.kisim,g.madde)).map(g=>g.kisim+'/'+g.madde);const gB=gs.filter(g=>var_(g.kisim,g.madde)&&g.baslik!==tocMap.get(key(g.kisim,g.madde)).baslik).map(g=>g.kisim+'/'+g.madde+' '+g.baslik);
L('kırık:',gK,'başlık≠toc:',gB.length,ilk(gB,5),'resmi true:',gs.filter(g=>g.resmi).length,'false:',gs.filter(g=>!g.resmi).length,'yinelenen soru:',dup(gs.map(g=>g.soru)).length);
let gsBul=0;for(const g of gs){const t=metinMap.get(key(g.kisim,g.madde));if(t&&t.includes(norm(g.soru)))gsBul++;}L('soru metni kendi maddesinde aynen geçen:',gsBul,'/',gs.length);

L('\n### 13. arama-sozluk');
const as=yukle('arama-sozluk.js');const smK=as.soruMaddeMap.filter(s=>!var_(s.kisim,s.maddeNo)).map(s=>s.kisim+'/'+s.maddeNo);L('soruMaddeMap kırık:',smK,'toplam soru ifadesi:',as.soruMaddeMap.reduce((a,s)=>a+s.soru.length,0));
L('aramaSynonyms boş dizi:',Object.entries(as.aramaSynonyms).filter(([,v])=>!v.length).map(([k])=>k));

L('\n### 14. sozlukData');
const sz=yukle('sozluk-data.js').sozlukData;L('i yinelenen:',dup(sz.map(x=>x.i)).length,'i aralığı',Math.min(...sz.map(x=>x.i)),'-',Math.max(...sz.map(x=>x.i)),'eksik i:',(()=>{const st=new Set(sz.map(x=>x.i));const e=[];for(let i=1;i<=9864;i++)if(!st.has(i))e.push(i);return e;})());
L('k yinelenen (birebir):',dup(sz.map(x=>x.k)).length,ilk(dup(sz.map(x=>x.k)).map(([k,n])=>k+'×'+n),10));
L('k yinelenen (küçük harf):',dup(sz.map(x=>x.k.toLocaleLowerCase('tr'))).length);
const dD={};sz.forEach(x=>dD[x.d]=(dD[x.d]||0)+1);L('d (köken) dağılımı:',dD);
const sNum=sz.filter(x=>!/^\d+$/.test(x.s)).map(x=>x.k+' s='+x.s);L('s sayı olmayan:',sNum.length,ilk(sNum,5),'s aralığı',Math.min(...sz.map(x=>+x.s)),'-',Math.max(...sz.map(x=>+x.s)));
let sMono=0;for(let i=1;i<sz.length;i++)if(+sz[i].s<+sz[i-1].s)sMono++;L('s sıralı mı: geri giden',sMono);
L('k BÜYÜK harf:',sz.filter(x=>x.k===x.k.toLocaleUpperCase('tr')).length,'karışık:',sz.filter(x=>x.k!==x.k.toLocaleUpperCase('tr')).length);
L('b örnekleri:',sz.filter(x=>x.b).slice(0,5).map(x=>x.k+' → b='+x.b));
const bK=sz.filter(x=>x.b&&!sz.some(y=>y.k.toLocaleLowerCase('tr')===x.b.toLocaleLowerCase('tr'))).map(x=>x.k+'→'+x.b);L('b değeri sözlükte madde başı olarak yok:',bK.length,ilk(bK,10));
L('a içinde "bk." / "bakınız":',sz.filter(x=>/\bbk\.|bakınız|Bkz/i.test(x.a)).length);

L('\n### 15. audioMap ve ses aralıkları');
const am=yukle('audio-map.js').audioMap;const amK=Object.keys(am).map(Number).sort((a,b)=>a-b);L('anahtar sayısı',amK.length,'aralık',amK[0],'-',amK[amK.length-1]);
const eksikSayfa=[];for(let p=amK[0];p<=amK[amK.length-1];p++)if(!(p in am))eksikSayfa.push(p);L('aralıkta ses dosyası olmayan sayfa:',eksikSayfa.length,eksikSayfa.slice(0,60).join(','));
const klas={};Object.values(am).forEach(u=>{const m=/^\/audio\/(\d+)\//.exec(u);klas[m?m[1]:'?']=(klas[m?m[1]:'?']||0)+1;});L('klasörler:',klas);
const adBicim=Object.entries(am).filter(([p,u])=>!new RegExp('/TISE-'+String(p).padStart(4,'0')+'[ .]').test(u)).map(([p,u])=>p+' '+u);L('dosya adı sayfa no ile uyuşmayan:',adBicim.length,ilk(adBicim,10));
L('URL yinelenen:',dup(Object.values(am)).length);
L('sesAraligiMap anahtar:',Object.keys(ses).length,'null (seslendirilmemiş):',Object.entries(ses).filter(([,v])=>v===null).map(([k])=>k));
L('saniyeli (ortadan başlayan/biten) aralık:',Object.entries(ses).filter(([,v])=>v&&(v[1]>0||v[3]!=null)).length);
const sesYok=[];const sesEksikSayfa=[];for(const m of tocData){const a=ses[key(m.kisim,m.madde_no)];if(a===null){sesYok.push(key(m.kisim,m.madde_no));continue;}const s=a?a[0]:m.sayfa_no,e=a?a[2]:Math.max(m.sayfa_bitis,m.pdf_sayfa_bitis,m.sayfa_no);let n=0;for(let p=s;p<=e;p++){if(am[p])n++;else sesEksikSayfa.push(key(m.kisim,m.madde_no)+' kayıt '+p);}if(!n)sesYok.push(key(m.kisim,m.madde_no)+'(kayıt yok)');}
L('sesi olmayan madde:',sesYok.length,sesYok);L('aralığında kaydı olmayan kayıt no:',sesEksikSayfa.length,ilk(sesEksikSayfa));
L('sesAraligiMap tocda olmayan anahtar:',Object.keys(ses).filter(k=>!tocMap.has(k)));

L('\n### 16. quizSorulari (app.js içinde)');
const qK=Object.keys(quiz);let qT=0;const qKirik=[];const qAlan=new Set();for(const k of qK)for(const q of quiz[k]){qT++;Object.keys(q).forEach(a=>qAlan.add(a));if(q.m&&!var_(q.m.k,q.m.m))qKirik.push(k+' '+q.m.k+'/'+q.m.m);if(!(q.d>=0&&q.d<q.c.length))qKirik.push(k+' d dışı: '+q.s);}
L('kategoriler',qK.map(k=>k+':'+quiz[k].length).join(', '),'toplam',qT,'alanlar',[...qAlan],'kırık:',qKirik);

L('\n### 17. tüm veri dosyalarında kodlama bozuklukları');
for(const f of ['data.js','maddeler-data.js','texts/kisim1.json','texts/kisim2.json','texts/kisim3.json','sozluk-data.js','arama-sozluk.js','sahislar.js','hukumler-data.js','ayet-hadis.js','ayet_hadis_data.json','tanimlar.js','crossref.js','ozetler.js','rehberler.js','gunun-sorusu-data.js','audio-map.js','silsile-atlasi/veri.js']){const s=fs.readFileSync(KOK+'/'+f,'utf8');const c=(re)=>(s.match(re)||[]).length;L(f.padEnd(24),'�:',c(/�/g),'mojibake(Ã/Ä/Å):',c(/[ÃÄÅ][\u0080-¿Ā-ſ]/g),'çift boşluk:',c(/\S  \S/g),'\\u00a0:',c(/ /g),'sıfır-gen:',c(/[​-‍﻿]/g),'kontrol kar.:',c(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g),'<etiket:',c(/<[a-zA-Z\/][^>]{0,40}>/g),'BOM:',s.charCodeAt(0)===0xFEFF);}
