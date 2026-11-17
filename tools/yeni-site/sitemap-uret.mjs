/* sitemap.xml'i veri/ klasöründen baştan yazar:  node tools/yeni-site/sitemap-uret.mjs

   İçerik: ana sayfalar · bütün maddeler · bütün hâl tercemeleri (/sahis/<slug>) · tablolar ·
   hüküm türleri · konu rehberleri · /silsile-atlasi/ · /namaz-vakitleri/.
   Bilerek dışarıda: /calisma-alanim (kişisel), /arama/<sorgu> (arama sonucu), lügat terimleri
   (9 bin ince sayfa; /sozluk yeter).
   lastmod yazılmaz: uydurma tarih vermemek ve çıktıyı deterministik tutmak için. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = 'https://www.ilmihal.org';
const oku = g => JSON.parse(fs.readFileSync(path.join(KOK, 'veri', g), 'utf8'));

const fihrist = oku('fihrist.json');
const sahislar = oku('sahislar/dizin.json');
const tablolar = oku('tablolar/dizin.json');
const hukumler = oku('hukumler/dizin.json');
const rehberler = oku('rehberler.json');

const yollar = [
  '/', '/icindekiler', '/sozluk', '/sahislar', '/arama', '/fevaid', '/fevaid/tablolar', '/hukumler',
  '/ayet-hadis', '/rehberler', '/gunun-bilgisi', '/quiz', '/hakkinda', '/gizlilik',
  '/silsile-atlasi/', '/namaz-vakitleri/',
  ...fihrist.maddeler.map(m => `/madde/${m.kisim}/${m.no}`),
  ...hukumler.turler.map(t => `/hukumler/${encodeURIComponent(t)}`),
  ...tablolar.tablolar.map(t => `/fevaid/tablolar/${encodeURIComponent(t.id)}`),
  ...rehberler.rehberler.map(r => `/rehberler?rehber=${encodeURIComponent(r.id)}`),
  ...sahislar.sahislar.map(s => `/sahis/${encodeURIComponent(s.slug)}`)
];

const tekil = [...new Set(yollar)];
if (tekil.length !== yollar.length) console.warn(`uyarı: ${yollar.length - tekil.length} yinelenen adres atlandı`);
const kacis = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  tekil.map(y => `  <url><loc>${kacis(SITE + y)}</loc></url>`).join('\n') + '\n' +
  '</urlset>\n';

const hedef = path.join(KOK, 'sitemap.xml');
const once = fs.existsSync(hedef) ? fs.readFileSync(hedef, 'utf8') : '';
if (once !== xml) fs.writeFileSync(hedef, xml);
console.log(`sitemap.xml ${once === xml ? 'zaten güncel' : 'yazıldı'}: ${tekil.length} adres ` +
  `(${fihrist.maddeler.length} madde, ${sahislar.sahislar.length} hâl tercemesi, ${tablolar.tablolar.length} tablo, ` +
  `${hukumler.turler.length} hüküm türü, ${rehberler.rehberler.length} rehber)`);
