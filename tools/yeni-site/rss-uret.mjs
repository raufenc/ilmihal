/* api/rss.js'i veri/fihrist.json'dan baştan yazar:  node tools/yeni-site/rss-uret.mjs [--sina]

   Eskiden 241 maddelik liste api/rss.js içine elle kopyalanıyordu; fihrist değişince RSS ile
   sitedeki "Günün Maddesi" ayrışabiliyordu. Artık liste buradan üretilir; işlevin davranışı aynıdır:
   Türkiye saatine (UTC+3, yaz saati yok) göre son 30 gün, günün maddesi = yılın günü % madde sayısı
   (js/cekirdek/okuma-plani.js → gununMaddesi ile aynı hesap). Çıktı deterministiktir.

   --sina: üretilen dosyayı node'da sahte bir istekle çalıştırır; XML'in iyi biçimli olduğunu,
   30 öğe verdiğini ve ilk öğenin bugünün maddesi olduğunu denetler (TZ=Europe/Istanbul önerilir). */

import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HEDEF = path.join(KOK, 'api/rss.js');
const fihrist = JSON.parse(fs.readFileSync(path.join(KOK, 'veri/fihrist.json'), 'utf8'));

const satirlar = fihrist.maddeler.map(m => `  [${m.kisim}, ${m.no}, ${JSON.stringify(m.baslik)}]`);
const kisimAdi = Object.fromEntries(fihrist.kisimlar.map(k => [k.no, k.ad]));
const kitap = fihrist.kitap.ad;

const govde = `// Günün Maddesi RSS akışı (Vercel Edge işlevi; /rss.xml buraya yazılır).
// BU DOSYA ÜRETİLMİŞTİR: node tools/yeni-site/rss-uret.mjs (kaynak: veri/fihrist.json). Elle düzenlemeyin.
// Seçim sitedeki "Günün Maddesi" ile aynıdır: Türkiye saatine göre yılın günü % madde sayısı
// (js/cekirdek/okuma-plani.js → gununMaddesi).
export const config = { runtime: 'edge' };

// [kısım, madde no, başlık] — kitabın sırası (fihrist)
const MADDELER = [
${satirlar.join(',\n')}
];

const KISIM_ADI = ${JSON.stringify(kisimAdi)};
const KITAP = ${JSON.stringify(kitap)};
const GUN_MS = 86400000;
const TR_FARK_MS = 3 * 3600000; // Türkiye, yaz saati uygulamadan UTC+3

function xmlKacis(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// Yerel (Türkiye) tarihin yılın kaçıncı günü olduğu
function yilinGunu(yil, ay, gun) {
  return Math.round((Date.UTC(yil, ay, gun) - Date.UTC(yil, 0, 0)) / GUN_MS);
}

export default function handler() {
  const simdiTr = new Date(Date.now() + TR_FARK_MS);
  const ogeler = [];
  for (let i = 0; i < 30; i++) {
    const g = new Date(Date.UTC(simdiTr.getUTCFullYear(), simdiTr.getUTCMonth(), simdiTr.getUTCDate() - i));
    const [kisim, no, baslik] = MADDELER[yilinGunu(g.getUTCFullYear(), g.getUTCMonth(), g.getUTCDate()) % MADDELER.length];
    const tarih = g.toISOString().slice(0, 10);
    const yayin = new Date(g.getTime() + 6 * 3600000 - TR_FARK_MS); // TR saatiyle 06:00
    const url = 'https://www.ilmihal.org/madde/' + kisim + '/' + no;
    ogeler.push(
      '    <item>\\n' +
      '      <title>' + xmlKacis(baslik) + '</title>\\n' +
      '      <link>' + url + '</link>\\n' +
      '      <guid isPermaLink="false">madde-' + kisim + '-' + no + '-' + tarih + '</guid>\\n' +
      '      <description>' + xmlKacis(KITAP + ', ' + KISIM_ADI[kisim] + ', Madde ' + no) + '</description>\\n' +
      '      <pubDate>' + yayin.toUTCString() + '</pubDate>\\n' +
      '    </item>'
    );
  }
  const govde = '<?xml version="1.0" encoding="UTF-8"?>\\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\\n' +
    '  <channel>\\n' +
    '    <title>' + xmlKacis(KITAP + ' - Günün Maddesi') + '</title>\\n' +
    '    <link>https://www.ilmihal.org/</link>\\n' +
    '    <description>' + xmlKacis('Her gün ' + KITAP + ' kitabından bir madde') + '</description>\\n' +
    '    <language>tr</language>\\n' +
    '    <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\\n' +
    '    <atom:link href="https://www.ilmihal.org/rss.xml" rel="self" type="application/rss+xml"/>\\n' +
    ogeler.join('\\n') + '\\n' +
    '  </channel>\\n' +
    '</rss>\\n';
  return new Response(govde, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
`;

const once = fs.existsSync(HEDEF) ? fs.readFileSync(HEDEF, 'utf8') : '';
if (once !== govde) fs.writeFileSync(HEDEF, govde);
console.log(`api/rss.js ${once === govde ? 'zaten güncel' : 'yazıldı'} (${fihrist.maddeler.length} madde)`);

if (process.argv.includes('--sina')) {
  const gecici = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rss-')), 'rss.mjs');
  fs.writeFileSync(gecici, govde);
  const mod = await import(pathToFileURL(gecici).href);
  const yanit = mod.default(new Request('https://www.ilmihal.org/rss.xml'));
  const xml = await yanit.text();
  fs.rmSync(path.dirname(gecici), { recursive: true, force: true });
  // okuma-plani.js tarayıcı modülüdür (depo.js 'storage' olayını dinler): node için boş taklit
  globalThis.addEventListener ??= () => {};
  const { gununMaddesi } = await import(pathToFileURL(path.join(KOK, 'js/cekirdek/okuma-plani.js')).href);
  const bugun = gununMaddesi(fihrist.maddeler, new Date());
  const ilk = /<item>[\s\S]*?<link>([^<]+)<\/link>/.exec(xml);
  const sayi = (xml.match(/<item>/g) || []).length;
  const hatalar = [];
  if (yanit.headers.get('content-type') !== 'application/rss+xml; charset=utf-8') hatalar.push('içerik türü yanlış');
  if (sayi !== 30) hatalar.push(`öğe sayısı ${sayi} (30 olmalı)`);
  const beklenen = `https://www.ilmihal.org/madde/${bugun.kisim}/${bugun.no}`;
  if (!ilk || ilk[1] !== beklenen) hatalar.push(`ilk öğe ${ilk && ilk[1]} — bugünün maddesi ${beklenen}`);
  if (Intl.DateTimeFormat().resolvedOptions().timeZone !== 'Europe/Istanbul') console.log('  not: TZ=Europe/Istanbul değil; günün maddesi karşılaştırması gece yarısı civarında şaşabilir');
  // İyi biçim: Python'un XML çözümleyicisi (bağımlılık eklemeden)
  const py = spawnSync('/usr/local/bin/python3', ['-I', '-c',
    'import sys,xml.etree.ElementTree as E;r=E.fromstring(sys.stdin.buffer.read());print(len(r.findall("channel/item")))'], { input: xml });
  if (py.status !== 0) hatalar.push('XML çözümlenemedi: ' + String(py.stderr).trim().split('\n').pop());
  else if (String(py.stdout).trim() !== '30') hatalar.push('çözümlenen öğe sayısı ' + String(py.stdout).trim());
  console.log(`  sınama: ${sayi} öğe, XML ${py.status === 0 ? 'iyi biçimli' : 'BOZUK'}, ilk öğe ${ilk && ilk[1]} (bugün: ${bugun.kisim}/${bugun.no} ${bugun.baslik})`);
  if (hatalar.length) { console.log('  BAŞARISIZ: ' + hatalar.join('; ')); process.exitCode = 1; }
  else console.log('  sınama geçti');
}
