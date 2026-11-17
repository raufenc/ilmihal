/* Service worker sürümünü ve ön yükleme listesini üretir:  node tools/yeni-site/surum-uret.mjs [--kuru]

   Sitenin TEK sürüm kaynağı sw.js içindeki `const SURUM = '…'` sabitidir; onu yalnız bu betik yazar.
   SURUM üç karmadan oluşur:  KOD.VERI.SABIT  (her biri sha256'nın ilk 12 hanesi)
     KOD    index.html, 404.html, manifest.json, favicon.svg, css/**, js/**, fonts/*.css,
            silsile-atlasi/** ve namaz-vakitleri/** (dokular hariç)
     VERI   veri/surum.json (veri-uret.mjs'in kendi karması) + veri-arama/** içerikleri
     SABIT  fonts/*.woff2, gorsel/**, vendor/**, silsile-atlasi/doku/**
   Herhangi bir dosya değişince sw.js baytça değişir → tarayıcı yeni service worker'ı kurar →
   yalnız karması değişen önbellek yenilenir (veri değişmediyse okunmuş maddeler önbellekte kalır).

   Ön yükleme listesi: kabuk (index.html, temel css, yazı tipleri, fihrist.json) + js/ana.js'ten
   başlayarak ana sayfa, fihrist, okuyucu ve bulunamadı görünümlerinin (ve ana sayfadaki okuma planı
   kutusunun) DURAĞAN import ağacı ve
   bu dosyalardaki cssYukle('/css/…') çağrıları. Böylece çevrimdışı açılışta bu görünümler çalışır.

   Deterministiktir: aynı dosyalar → aynı SURUM. Kopya artığı adlar (" 2.json" gibi), .DS_Store ve
   .claude karmaya girmez (yayına da çıkmaz: .vercelignore). --kuru: sw.js'e yazmaz, yalnız raporlar. */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SW = path.join(KOK, 'sw.js');
const KURU = process.argv.includes('--kuru');

const DISLA = ad => ad === '.DS_Store' || ad === '.claude' || / 2(\.[^.]+)?$/.test(ad);

function dosyalar(goreli) {
  const tam = path.join(KOK, goreli);
  if (!fs.existsSync(tam)) return [];
  if (fs.statSync(tam).isFile()) return [goreli];
  const cikti = [];
  for (const ad of fs.readdirSync(tam).sort()) {
    if (DISLA(ad)) continue;
    const alt = path.posix.join(goreli, ad);
    if (fs.statSync(path.join(KOK, alt)).isDirectory()) cikti.push(...dosyalar(alt));
    else cikti.push(alt);
  }
  return cikti;
}

function karma(liste) {
  const k = crypto.createHash('sha256');
  for (const g of [...new Set(liste)].sort()) {
    k.update(g + '\0');
    k.update(fs.readFileSync(path.join(KOK, g)));
    k.update('\0');
  }
  return k.digest('hex').slice(0, 12);
}

/* ── Karma kümeleri ── */
const ayriBelge = d => dosyalar(d).filter(g => !g.startsWith(d + '/doku/'));
const KOD_DOSYA = [
  'index.html', '404.html', 'manifest.json', 'favicon.svg',
  ...dosyalar('css'), ...dosyalar('js'),
  ...dosyalar('fonts').filter(g => g.endsWith('.css')),
  ...ayriBelge('silsile-atlasi'), ...ayriBelge('namaz-vakitleri')
].filter(g => fs.existsSync(path.join(KOK, g)));
const VERI_DOSYA = ['veri/surum.json', ...dosyalar('veri-arama')];
const SABIT_DOSYA = [
  ...dosyalar('fonts').filter(g => g.endsWith('.woff2')),
  ...dosyalar('gorsel'), ...dosyalar('vendor'), ...dosyalar('silsile-atlasi/doku')
];
if (!fs.existsSync(path.join(KOK, 'veri/surum.json'))) {
  console.error('veri/surum.json yok: önce node tools/yeni-site/veri-uret.mjs');
  process.exit(1);
}
const SURUM = [karma(KOD_DOSYA), karma(VERI_DOSYA), karma(SABIT_DOSYA)].join('.');

/* ── Ön yükleme listesi ── */
const GORUNUMLER = ['giris', 'fihrist', 'okuyucu', 'bulunamadi'];
const KABUK = [
  'index.html', 'css/temel.css', 'css/kabuk.css', 'fonts/fontlar.css', 'manifest.json', 'favicon.svg',
  'fonts/literata-400-normal-latin.woff2', 'fonts/literata-400-normal-latin-ext.woff2',
  'fonts/inter-400-normal-latin.woff2', 'fonts/inter-400-normal-latin-ext.woff2',
  'veri/fihrist.json', 'veri/surum.json', 'veri/konular.json',
  'js/cekirdek/sw-kayit.js'
];

/* Durağan import ağacı: `import … from '…'`, `export … from '…'`, `import '…'`.
   Dinamik import(…) bilerek izlenmez (yalnız yukarıdaki görünümler eklenir). */
function agac(baslangic) {
  const gorulen = new Set();
  const css = new Set();
  const sira = [...baslangic];
  while (sira.length) {
    const g = sira.shift();
    if (gorulen.has(g)) continue;
    const tam = path.join(KOK, g);
    if (!fs.existsSync(tam)) { console.warn('  uyarı: ön yüklenecek dosya yok:', g); continue; }
    gorulen.add(g);
    const metin = fs.readFileSync(tam, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const kalip = /(?:^|[;\n])\s*(?:import|export)\s+(?:[\w*{}\s,$]+?\s+from\s+)?['"]([^'"]+)['"]/g;
    for (const m of metin.matchAll(kalip)) {
      const hedef = m[1];
      if (!hedef.startsWith('.') && !hedef.startsWith('/')) continue;   // 'three' gibi çıplak adlar
      const yol = hedef.startsWith('/') ? hedef.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(g), hedef));
      sira.push(yol.split('?')[0]);
    }
    for (const m of metin.matchAll(/cssYukle\(\s*['"]\/([^'"]+\.css)['"]/g)) css.add(m[1]);
  }
  return [...gorulen, ...css];
}

const ON_YUKLE = [...new Set([
  ...KABUK,
  ...agac(['js/ana.js', 'js/cekirdek/sw-kayit.js', 'js/bilesen/okuma-plani-kutu.js', ...GORUNUMLER.map(g => `js/gorunum/${g}.js`)])
])].filter(g => fs.existsSync(path.join(KOK, g)))
  .sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));

let ham = 0, sikisik = 0;
for (const g of ON_YUKLE) {
  const b = fs.readFileSync(path.join(KOK, g));
  ham += b.length;
  sikisik += g.endsWith('.woff2') ? b.length : zlib.gzipSync(b, { level: 9 }).length;
}

/* ── sw.js'e yaz ── */
const BAS = '// ── ÜRETİLMİŞ BÖLÜM: tools/yeni-site/surum-uret.mjs yazar; elle değiştirmeyin ──';
const SON = '// ── ÜRETİLMİŞ BÖLÜM SONU ──';
const sw = fs.readFileSync(SW, 'utf8');
const i = sw.indexOf(BAS), j = sw.indexOf(SON);
if (i < 0 || j < i) { console.error('sw.js içinde üretilmiş bölüm işaretleri bulunamadı.'); process.exit(1); }
const blok = `${BAS}\nconst SURUM = '${SURUM}';\nconst ON_YUKLE = [\n${ON_YUKLE.map(g => `  '/${g}'`).join(',\n')}\n];\n`;
const yeni = sw.slice(0, i) + blok + sw.slice(j);
const kb = n => (n / 1024).toFixed(1).replace('.', ',') + ' KB';
if (!KURU && yeni !== sw) fs.writeFileSync(SW, yeni);
console.log(`sürüm ${SURUM}  (kod.veri.sabit; ${KOD_DOSYA.length}/${VERI_DOSYA.length}/${SABIT_DOSYA.length} dosya)`);
console.log(`ön yükleme: ${ON_YUKLE.length} dosya, ${kb(ham)} ham, ≈${kb(sikisik)} sıkıştırılmış` +
  (KURU ? '  [--kuru: sw.js yazılmadı]' : yeni === sw ? '  (sw.js zaten güncel)' : '  → sw.js yazıldı'));
