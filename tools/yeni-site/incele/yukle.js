// Veri dosyalarını tarayıcı ortamını taklit eden bir vm bağlamında çalıştırır ve tanımlanan küreselleri döndürür.
const fs=require('fs'),vm=require('vm'),path=require('path');
const KOK=path.resolve(__dirname,'../../..');
function yukle(dosya){
  const kod=fs.readFileSync(path.join(KOK,dosya),'utf8');
  const store={};
  const ls={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
  const sandbox={console,localStorage:ls,setTimeout:()=>0,clearTimeout(){},
    document:{addEventListener(){},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({style:{},appendChild(){},setAttribute(){},classList:{add(){},remove(){}}}),readyState:'complete',body:{appendChild(){}}},
    location:{hash:'',pathname:'/'},navigator:{},addEventListener(){}};
  sandbox.window=sandbox; sandbox.self=sandbox;
  const ctx=vm.createContext(sandbox);
  const once=new Set(Object.getOwnPropertyNames(ctx));
  // var/function bildirimleri bağlam küreseline düşer
  vm.runInContext(kod,ctx,{filename:dosya});
  const out={};
  for(const k of Object.getOwnPropertyNames(ctx)) if(!once.has(k)) out[k]=ctx[k];
  // const/let küresel bildirimleri yakala
  const lex=[...kod.matchAll(/^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/gm)].map(m=>m[1]);
  for(const n of lex){ try{ out[n]=vm.runInContext(n,ctx);}catch(e){} }
  return out;
}
module.exports={yukle,KOK};
if(require.main===module){
  for(const f of process.argv.slice(2)){
    const o=yukle(f);
    console.log('== '+f);
    for(const [k,v] of Object.entries(o)){
      let t=Array.isArray(v)?'Array('+v.length+')':typeof v;
      if(t==='object'&&v) t='Object('+Object.keys(v).length+' anahtar)';
      console.log('  '+k+': '+t);
    }
  }
}
