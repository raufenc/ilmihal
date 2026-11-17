// Bütün maddelerdeki lügat işaretlerini cümle bağlamıyla çıkarır → isaretler.jsonl, terimler.json
import fs from 'fs'; import path from 'path';
import { lugatIsaretle, paragraflar } from '../../../../js/cekirdek/veri.js';
const KOK = path.resolve('../../../..');
const V = p => JSON.parse(fs.readFileSync(path.join(KOK, 'veri', p), 'utf8'));
const dizin = V('lugat/dizin.json');
const terimler = {};
for (const p of dizin.parcalar) for (const t of V(`lugat/${p.ad}.json`).terimler) terimler[t.id] = { ...t, parca: p.ad };
fs.writeFileSync('terimler.json', JSON.stringify(terimler));
const fih = V('fihrist.json');
const out = fs.createWriteStream('isaretler.jsonl');
let n = 0; const metinler = {};
for (const m of fih.maddeler) {
  const a = `${m.kisim}-${m.no}`;
  const md = V(`madde/${a}.json`); const lm = V(`lugat-madde/${a}.json`);
  metinler[a] = { metin: md.metin, sahife: md.sahife };
  for (const s of lugatIsaretle(md.metin, lm.kelimeler)) {
    const kel = md.metin.slice(s.bas, s.son);
    // cümle: önceki . ! ? \n ile sonrakine kadar
    let b = s.bas; while (b > 0 && !/[.!?\n]/.test(md.metin[b - 1]) && s.bas - b < 300) b--;
    let e = s.son; while (e < md.metin.length && !/[.!?\n]/.test(md.metin[e]) && e - s.son < 300) e++;
    out.write(JSON.stringify({ madde: a, bas: s.bas, kelime: kel, id: s.id, cumle: md.metin.slice(b, e + 1).trim() }) + '\n'); n++;
  }
}
out.end(); fs.writeFileSync('metinler.json', JSON.stringify(metinler));
console.log('işaret', n, 'terim', Object.keys(terimler).length);
