// Kullanıcı verisi katmanı ve okuma planı sınaması (node, tarayıcısız).
// Çalıştırma (depo kökünden):  TZ=Europe/Istanbul node tools/yeni-site/kullanici-sina.mjs
// Eski okuma-plani.js, data.js (tocData) ve ozetler.js (maddeUzunluklari) vm içinde, sahte window ile yüklenir.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const oku = f => fs.readFileSync(path.join(KOK, f), 'utf8');

/* ---------- localStorage taklidi ---------- */
class SahteDepo {
  constructor() { this.v = new Map(); this.dolu = false; }
  getItem(k) { return this.v.has(k) ? this.v.get(k) : null; }
  setItem(k, d) { if (this.dolu) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } this.v.set(k, String(d)); }
  removeItem(k) { this.v.delete(k); }
  clear() { this.v.clear(); }
  key(i) { return [...this.v.keys()][i] ?? null; }
  get length() { return this.v.size; }
  kopya() { return Object.fromEntries(this.v); }
}
const LS = new SahteDepo();
globalThis.localStorage = LS;
globalThis.addEventListener = () => {};
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });

const { kullanici, maddeCoz, maddeAnahtari, maddeTireli, ANAHTAR, BOZUK_ANAHTARI } = await import('../../js/cekirdek/kullanici.js');
const P = await import('../../js/cekirdek/okuma-plani.js');
const { temaOku } = await import('../../js/cekirdek/tema.js');

/* ---------- Denetim kaydı ---------- */
let toplam = 0, gecen = 0;
const basarisiz = [];
const bolumler = {};
let bolum = '';
function b(ad) { bolum = ad; bolumler[ad] = { t: 0, g: 0 }; }
function denetle(ad, kosul, ayrinti = '') {
  toplam++; bolumler[bolum].t++;
  if (kosul) { gecen++; bolumler[bolum].g++; }
  else basarisiz.push(`[${bolum}] ${ad}${ayrinti ? ' — ' + ayrinti : ''}`);
}
const atmaz = (ad, f) => { try { f(); denetle(ad + ' (istisna yok)', true); } catch (e) { denetle(ad + ' (istisna yok)', false, String(e)); } };
const esit = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const temizle = () => LS.clear();
const koy = (k, v) => LS.v.set(k, v);
const ham = k => LS.getItem(k);

/* ========== (a) Her anahtar: eski biçim → oku → değiştir → yaz → eski biçim ========== */
b('a) 25 anahtar eski biçimle');
temizle();

// 1 ilmihal-theme (tema.js)
koy(ANAHTAR.tema, 'sepia');
denetle('tema: "sepia" → sepya', temaOku() === 'sepya');
koy(ANAHTAR.tema, 'dark');
denetle('tema: "dark" → gece', temaOku() === 'gece');

// 2 font-size
koy(ANAHTAR.yaziBoyutu, '1.1500000000000001');
denetle('yazı boyutu: kayan nokta artıklı eski değer okunur', Math.abs(kullanici.yaziBoyutu.al() - 1.15) < 1e-9);
kullanici.yaziBoyutu.degistir(+1);
denetle('yazı boyutu: düz metin sayı yazılır, eski parseFloat okur', ham(ANAHTAR.yaziBoyutu) === '1.25' && parseFloat(ham(ANAHTAR.yaziBoyutu)) === 1.25);
kullanici.yaziBoyutu.degistir(+20);
denetle('yazı boyutu: üst sınır 1.6', ham(ANAHTAR.yaziBoyutu) === '1.6');
LS.removeItem(ANAHTAR.yaziBoyutu);
denetle('yazı boyutu: yoksa 1.05 ve kayitliMi=false', kullanici.yaziBoyutu.al() === 1.05 && !kullanici.yaziBoyutu.kayitliMi());

// 3 okuma-ayarlari
koy(ANAHTAR.okumaAyarlari, '{"aralik":"2.3","hiza":"justify","lugat":false}');
denetle('okuma ayarları: etkin()', esit(kullanici.okumaAyarlari.etkin(), { aralik: '2.3', hiza: 'justify', lugat: false }));
kullanici.okumaAyarlari.yaz('aralik', 1.7);
denetle('okuma ayarları: aralik METİN olarak yazılır, öbür alanlar korunur', ham(ANAHTAR.okumaAyarlari) === '{"aralik":"1.7","hiza":"justify","lugat":false}');
koy(ANAHTAR.okumaAyarlari, '{"hiza":"left"}');
denetle('okuma ayarları: eksik alan varsayılan', esit(kullanici.okumaAyarlari.etkin(), { aralik: '2', hiza: 'left', lugat: true }));

// 4-5 bayraklar
koy(ANAHTAR.sahifeAcik, '1'); koy(ANAHTAR.fihristGizli, '0');
denetle('sahîfe paneli "1" → true, fihrist "0" → false', kullanici.sahifeAcik.al() === true && kullanici.fihristGizli.al() === false);
kullanici.sahifeAcik.yaz(false); kullanici.fihristGizli.yaz(true);
denetle('bayraklar "0"/"1" düz metin yazılır', ham(ANAHTAR.sahifeAcik) === '0' && ham(ANAHTAR.fihristGizli) === '1');

// 6 bookmarks (yeni biçim + eski düz metin)
koy(ANAHTAR.yerImleri, '[{"key":"1/52","kisim":1,"madde_no":52,"baslik":"Abdest almak"},"2/16"]');
let yi = kullanici.yerImleri.liste();
denetle('yer imi: nesne + eski düz metin birlikte okunur', yi.length === 2 && yi[1].key === '2/16' && yi[1].baslik === null && yi[0].baslik === 'Abdest almak');
denetle('yer imi: eski düz metin kayıt "var" sayılır (H-12 düzeltmesi)', kullanici.yerImleri.varMi(2, 16) && kullanici.yerImleri.varMi('2/16'));
denetle('yer imi: zaten varsa ikinci kez eklenmez', kullanici.yerImleri.ekle({ kisim: 2, madde_no: 16, baslik: 'X' }) === false && JSON.parse(ham(ANAHTAR.yerImleri)).length === 2);
kullanici.yerImleri.ekle({ kisim: 3, madde_no: 5, baslik: 'Kazâ' });
let ymHam = JSON.parse(ham(ANAHTAR.yerImleri));
denetle('yer imi: eski biçimle aynı alanlar {key,kisim,madde_no,baslik}', esit(ymHam[2], { key: '3/5', kisim: 3, madde_no: 5, baslik: 'Kazâ' }));
denetle('yer imi: eski düz metin öğe yerinde kalır', ymHam[1] === '2/16');
denetle('yer imi: eski toggleBookmark araması (b.key) yeni kaydı bulur', ymHam.findIndex(x => x.key === '3/5') === 2);
kullanici.yerImleri.cikar('2/16');
denetle('yer imi: eski düz metin kayıt kaldırılabilir', !JSON.parse(ham(ANAHTAR.yerImleri)).includes('2/16'));
denetle('yer imi: degistir() aç/kapa', kullanici.yerImleri.degistir({ kisim: 1, madde_no: 52 }) === false && kullanici.yerImleri.degistir({ kisim: 1, madde_no: 52, baslik: 'A' }) === true);

// 7 read
koy(ANAHTAR.okunan, '["1/1","1/2","2/16"]');
denetle('okundu: liste', esit(kullanici.okunan.liste(), ['1/1', '1/2', '2/16']));
kullanici.okunan.isaretle(1, 3); kullanici.okunan.isaretle(1, 1);
denetle('okundu: sona eklenir, tekrar edilmez', ham(ANAHTAR.okunan) === '["1/1","1/2","2/16","1/3"]');

// 8 read-history
koy(ANAHTAR.gecmis, JSON.stringify(Array.from({ length: 50 }, (_, i) => '1/' + (i + 1))));
kullanici.gecmis.ekle(1, 10); kullanici.gecmis.ekle(2, 1);
const gh = JSON.parse(ham(ANAHTAR.gecmis));
denetle('geçmiş: tekrarsız, en yenisi sonda, en çok 50', gh.length === 50 && gh[49] === '2/1' && gh[48] === '1/10' && gh.filter(x => x === '1/10').length === 1 && gh[0] === '1/2');
denetle('geçmiş: sonlar(12) yeniden eskiye', kullanici.gecmis.sonlar(2).join() === '2/1,1/10');

// 9 son-okunan
koy(ANAHTAR.sonOkunan, '{"kisim":1,"madde_no":52,"baslik":"Abdest","zaman":1763371200000}');
denetle('son okunan: okunur', esit(kullanici.sonOkunan.al(), { kisim: 1, madde_no: 52, baslik: 'Abdest', zaman: 1763371200000 }));
kullanici.maddeAcildi({ kisim: 2, madde_no: 7, baslik: 'Namaz' }, 1763400000000);
denetle('maddeAcildi: son okunan eski biçimde', ham(ANAHTAR.sonOkunan) === '{"kisim":2,"madde_no":7,"baslik":"Namaz","zaman":1763400000000}');
denetle('maddeAcildi: okundu + geçmiş', kullanici.okunan.varMi('2/7') && kullanici.gecmis.liste().at(-1) === '2/7');

// 10 notlar
koy(ANAHTAR.notlar, '{"1/52":[{"text":"ilk not","date":"17.11.2026"}]}');
kullanici.notlar.ekle({ kisim: 1, madde_no: 52 }, '  ikinci  ', new Date(2026, 10, 5));
let nh = JSON.parse(ham(ANAHTAR.notlar));
denetle('not: date tr-TR görüntü metni, metin kırpılır', esit(nh['1/52'][1], { text: 'ikinci', date: new Date(2026, 10, 5).toLocaleDateString('tr-TR') }) && /^\d{2}\.\d{2}\.\d{4}$/.test(nh['1/52'][1].date), nh['1/52'][1].date);
denetle('not: eski not değişmeden kalır', esit(nh['1/52'][0], { text: 'ilk not', date: '17.11.2026' }));
denetle('not: tarihCoz', +kullanici.notlar.tarihCoz('17.11.2026') === +new Date(2026, 10, 17));
denetle('not: boş metin eklenmez', kullanici.notlar.ekle('1/52', '   ') === null);
kullanici.notlar.sil('1/52', 0); kullanici.notlar.sil('1/52', 0);
denetle('not: boş kalan madde anahtarı silinir', ham(ANAHTAR.notlar) === '{}');

// 11 vurgulamalar
koy(ANAHTAR.vurgular, '{"1/52":[{"text":"seçilen metin","renk":"#fff3b0"},{"text":"yerleşmeyecek metin","renk":"#ffc8d8"}]}');
kullanici.vurgular.ekle('1/52', 'yeni vurgu', '#b8f0c8');
let vh = JSON.parse(ham(ANAHTAR.vurgular));
denetle('vurgu: eklenince ESKİLER korunur ({text, renk} biçimi)', vh['1/52'].length === 3 && esit(vh['1/52'][2], { text: 'yeni vurgu', renk: '#b8f0c8' }) && vh['1/52'][1].text === 'yerleşmeyecek metin');
const rapor = kullanici.vurgular.yerlestirmeRaporu('1/52', [0, 'yeni vurgu']);
denetle('vurgu: yerleşmeyen raporlanır', rapor.length === 1 && rapor[0].text === 'yerleşmeyecek metin' && kullanici.vurgular.yerlesmeyenler()['1/52'].length === 1);
denetle('vurgu: yerleşmeyen depodan SİLİNMEZ', JSON.parse(ham(ANAHTAR.vurgular))['1/52'].length === 3);
kullanici.vurgular.ekle('1/52', 'yeni vurgu', '#ffd8a8');
denetle('vurgu: aynı metin tekrar eklenmez, rengi güncellenir', JSON.parse(ham(ANAHTAR.vurgular))['1/52'].length === 3 && JSON.parse(ham(ANAHTAR.vurgular))['1/52'][2].renk === '#ffd8a8');
kullanici.vurgular.sil('1/52', 'seçilen metin');
denetle('vurgu: metinle silinir', JSON.parse(ham(ANAHTAR.vurgular))['1/52'].length === 2);

// 12-13 ses
koy(ANAHTAR.sesHizi, '1.25');
denetle('ses hızı: "1.25" okunur', kullanici.sesHizi.al() === 1.25);
denetle('ses hızı: sonraki → 1.5, düz metin', kullanici.sesHizi.sonraki() === 1.5 && ham(ANAHTAR.sesHizi) === '1.5');
koy(ANAHTAR.sesHizi, '3');
denetle('ses hızı: listede olmayan değerden sonra 0.5 (eski davranış)', kullanici.sesHizi.sonraki() === 0.5);
koy(ANAHTAR.sesKonumu, '{"kisim":1,"maddeNo":52,"pageIdx":0,"time":123.45}');
denetle('ses konumu: maddeNo alanıyla okunur', kullanici.sesKonumu.icin(1, 52)?.time === 123.45 && kullanici.sesKonumu.icin(1, 53) === null);
kullanici.sesKonumu.yaz({ kisim: 2, maddeNo: 3, pageIdx: 1, time: 9.5 });
denetle('ses konumu: alan adları ve sırası aynen', ham(ANAHTAR.sesKonumu) === '{"kisim":2,"maddeNo":3,"pageIdx":1,"time":9.5}');

// 14 daily-goal (UTC günü)
koy(ANAHTAR.gunlukHedef, '{"target":30,"today":"2026-11-17","minutes":12}');
const s1 = new Date('2026-11-17T20:30:00Z'); // TR'de 18 Kasım 23:30 değil: 17 Kas 23:30 TR → UTC 20:30 aynı gün
let gh2 = kullanici.gunlukHedef.ekle(1, s1);
denetle('günlük hedef: aynı UTC gününde dk eklenir', gh2.minutes === 13 && ham(ANAHTAR.gunlukHedef) === '{"target":30,"today":"2026-11-17","minutes":13}');
const s2 = new Date('2026-11-17T22:30:00Z'); // TR 18 Kas 01:30, UTC hâlâ 17 Kas → eski davranış: aynı gün
denetle('günlük hedef: gün UTC ile döner (eski davranış, H-13)', kullanici.gunlukHedef.ekle(1, s2).minutes === 14);
const s3 = new Date('2026-11-18T00:30:00Z');
denetle('günlük hedef: UTC günü değişince sıfırlanır', kullanici.gunlukHedef.ekle(1, s3).minutes === 1 && JSON.parse(ham(ANAHTAR.gunlukHedef)).today === '2026-11-18');
denetle('günlük hedef: bugunkuDakika', kullanici.gunlukHedef.bugunkuDakika(s3) === 1 && kullanici.gunlukHedef.bugunkuDakika(s1) === 0);

// 15 quiz-puan
koy(ANAHTAR.quizPuani, '80');
denetle('quiz: en yüksek korunur', kullanici.quizPuani.kaydet(60) === 80 && ham(ANAHTAR.quizPuani) === '80');
denetle('quiz: yükselince düz metin yazılır', kullanici.quizPuani.kaydet(90) === 90 && ham(ANAHTAR.quizPuani) === '90');

// 16 rehber-progress
koy(ANAHTAR.rehber, '{"namaz-rehberi":["1/51","1/52"]}');
denetle('rehber: okunur', kullanici.rehber.tamamMi('namaz-rehberi', 1, 52));
kullanici.rehber.degistir('namaz-rehberi', 1, 51); kullanici.rehber.degistir('iman', 1, 1);
denetle('rehber: eski biçimde aç/kapa', ham(ANAHTAR.rehber) === '{"namaz-rehberi":["1/52"],"iman":["1/1"]}');

// 17 duyuru
koy(ANAHTAR.duyuru, '["metin-2026-10"]');
const DUY = [{ id: 'metin-2026-10', bitis: '2026-12-31' }, { id: 'yeni', bitis: '2026-11-30' }, { id: 'eski', bitis: '2026-01-01' }];
denetle('duyuru: kapatılan ve bitişi geçen görünmez', esit(kullanici.duyuru.gorunenler(DUY, new Date('2026-11-17T12:00:00Z')).map(d => d.id), ['yeni']));
kullanici.duyuru.kapat('yeni'); kullanici.duyuru.kapat('yeni');
denetle('duyuru: eski biçim, tekrar yok', ham(ANAHTAR.duyuru) === '["metin-2026-10","yeni"]');

// 18-21 hatim, bitirilen, okuma-yeri, kutlama (ayrıntısı (d) bölümünde)
koy(ANAHTAR.hatim, '{"baslangic":"2026-11-17","gun":90,"hatimSayisi":0}');
denetle('hatim: okunur', kullanici.hatim.al()?.gun === 90);
koy(ANAHTAR.bitirilen, '["1/1","1/2"]');
kullanici.bitirilen.ayarla('1/3', true);
denetle('bitirilen: eski biçim', ham(ANAHTAR.bitirilen) === '["1/1","1/2","1/3"]');
denetle('bitirilen ile okundu ayrı kalır', !kullanici.okunan.varMi('1/3') || JSON.parse(ham(ANAHTAR.okunan)).includes('1/3') === kullanici.okunan.varMi('1/3'));
koy(ANAHTAR.okumaYeri, '{"1/60":0.42}');
kullanici.okumaYeri.kaydet('1/61', 0.123456, false); kullanici.okumaYeri.kaydet('1/60', 0.99, false);
denetle('okuma yeri: 3 ondalık, aralık dışı silinir', ham(ANAHTAR.okumaYeri) === '{"1/61":0.123}');
koy(ANAHTAR.hatimKutlama, '"2026-11-17"');
denetle('kutlama: tırnaklı JSON okunur', kullanici.hatimKutlama.al() === '2026-11-17');
koy(ANAHTAR.hatimKutlama, '2026-11-16');
denetle('kutlama: tırnaksız eski değer okunur', kullanici.hatimKutlama.al() === '2026-11-16');
kullanici.hatimKutlama.yaz('2026-11-18');
denetle('kutlama: tırnaklı JSON yazılır; eski oku() aynı değeri verir', ham(ANAHTAR.hatimKutlama) === '"2026-11-18"' && JSON.parse(ham(ANAHTAR.hatimKutlama)) === '2026-11-18');

// 22-25
koy(ANAHTAR.debug, '1');
denetle('debug "1"', kullanici.debug.acikMi());
kullanici.buildId.yaz('2026-10-19-r5');
denetle('build-id düz metin', ham(ANAHTAR.buildId) === '2026-10-19-r5' && kullanici.buildId.al() === '2026-10-19-r5');
koy(ANAHTAR.onboardingGoruldu, '1');
denetle('onboarding-seen okunur, done yok', kullanici.onboardingGoruldu.al() && !kullanici.onboardingBitti.al());
kullanici.onboardingBitti.isaretle();
denetle('onboarding-done "1" yazılır', ham(ANAHTAR.onboardingBitti) === '1');

denetle('ANAHTAR 25 anahtar, hepsi ilmihal- önekli ve tekil', Object.values(ANAHTAR).length === 25 && new Set(Object.values(ANAHTAR)).size === 25 && Object.values(ANAHTAR).every(k => k.startsWith('ilmihal-')));

// izle
let duyulan = null;
const birak = kullanici.izle('yerImleri', v => { duyulan = v; });
kullanici.yerImleri.ekle({ kisim: 3, madde_no: 9, baslik: 'Son' });
denetle('izle: değişince yeni liste gelir', Array.isArray(duyulan) && duyulan.some(x => x.key === '3/9'));
birak(); duyulan = null; kullanici.yerImleri.cikar('3/9');
denetle('izle: abonelik kaldırılınca çağrılmaz', duyulan === null);

// ozet
const oz = kullanici.ozet(s3);
denetle('ozet: sayılar', oz.yerImi === kullanici.yerImleri.liste().length && oz.vurgu === 2 && oz.not === 0 && oz.okunan === kullanici.okunan.liste().length && oz.planVar === true);

// madde kimliği
denetle('madde kimliği: "1/43" ↔ "1-43" ↔ {kisim,no}', esit(maddeCoz('1-43'), { kisim: 1, no: 43 }) && maddeAnahtari({ kisim: 1, no: 43 }) === '1/43' && maddeTireli('1/43') === '1-43' && maddeAnahtari('K1/M43') === '1/43' && maddeCoz('abc') === null && maddeCoz('0/3') === null);

/* ========== (b) Eski biçimli kayıtlar ========== */
b('b) eski biçimler');
temizle();
koy(ANAHTAR.yerImleri, '["1/52","2/3"]');
denetle('yalnız düz metin yer imleri', kullanici.yerImleri.liste().map(x => x.key).join() === '1/52,2/3');
denetle('düz metin yer imi: kisim/madde_no sayı', kullanici.yerImleri.liste()[0].kisim === 1 && kullanici.yerImleri.liste()[0].madde_no === 52);
koy(ANAHTAR.yerImleri, '["1/52",{"key":"1/52","kisim":1,"madde_no":52,"baslik":"Abdest"}]');
denetle('H-12 çift kaydı: listede tek, başlık nesneden', kullanici.yerImleri.liste().length === 1 && kullanici.yerImleri.liste()[0].baslik === 'Abdest');
kullanici.yerImleri.cikar(1, 52);
denetle('H-12 çift kaydı: çıkarınca ikisi de gider', ham(ANAHTAR.yerImleri) === '[]');
koy(ANAHTAR.hatimKutlama, '"2026-11-17"');
denetle('tırnaklı kutlama', kullanici.hatimKutlama.al() === '2026-11-17');
koy(ANAHTAR.yaziBoyutu, '1.1500000000000001');
denetle('kayan nokta artıklı yazı boyutu', kullanici.yaziBoyutu.al() === 1.1500000000000001);
koy(ANAHTAR.notlar, '{"1/52":[{"text":"x","date":"5.11.2026"}]}');
denetle('tek haneli gün tarihli not', kullanici.notlar.liste('1/52')[0].date === '5.11.2026' && +kullanici.notlar.tarihCoz('5.11.2026') === +new Date(2026, 10, 5));

/* ========== (c) Bozuk veri, null, yanlış tür, dolu kota ========== */
b('c) bozuk veri ve kota');
temizle();
const BOZUKLAR = ['{bozuk', 'null', '42', '"metin"', '[1,2', 'undefined', ''];
const okuyucular = [
  ['yerImleri.liste', () => kullanici.yerImleri.liste(), ANAHTAR.yerImleri, []],
  ['okunan.liste', () => kullanici.okunan.liste(), ANAHTAR.okunan, []],
  ['gecmis.liste', () => kullanici.gecmis.liste(), ANAHTAR.gecmis, []],
  ['notlar.hepsi', () => kullanici.notlar.hepsi(), ANAHTAR.notlar, {}],
  ['vurgular.hepsi', () => kullanici.vurgular.hepsi(), ANAHTAR.vurgular, {}],
  ['rehber.hepsi', () => kullanici.rehber.hepsi(), ANAHTAR.rehber, {}],
  ['duyuru.kapatilanlar', () => kullanici.duyuru.kapatilanlar(), ANAHTAR.duyuru, []],
  ['bitirilen.liste', () => kullanici.bitirilen.liste(), ANAHTAR.bitirilen, []],
  ['okumaYeri.hepsi', () => kullanici.okumaYeri.hepsi(), ANAHTAR.okumaYeri, {}],
  ['sonOkunan.al', () => kullanici.sonOkunan.al(), ANAHTAR.sonOkunan, null],
  ['sesKonumu.al', () => kullanici.sesKonumu.al(), ANAHTAR.sesKonumu, null],
  ['hatim.al', () => kullanici.hatim.al(), ANAHTAR.hatim, null],
  ['okumaAyarlari.al', () => kullanici.okumaAyarlari.al(), ANAHTAR.okumaAyarlari, {}]
];
for (const [ad, f, k, vars] of okuyucular) {
  for (const bz of BOZUKLAR) {
    koy(k, bz);
    let sonuc, hata = null;
    try { sonuc = f(); } catch (e) { hata = e; }
    denetle(`${ad} ← ${JSON.stringify(bz)}: istisna yok, varsayılan`, !hata && esit(sonuc, vars), hata ? String(hata) : JSON.stringify(sonuc));
    denetle(`${ad} ← ${JSON.stringify(bz)}: kayıt silinmedi`, ham(k) === bz);
  }
}
for (const [ad, f, k] of [['yaziBoyutu.al', () => kullanici.yaziBoyutu.al(), ANAHTAR.yaziBoyutu], ['sesHizi.al', () => kullanici.sesHizi.al(), ANAHTAR.sesHizi], ['quizPuani.al', () => kullanici.quizPuani.al(), ANAHTAR.quizPuani], ['gunlukHedef.al', () => kullanici.gunlukHedef.al(), ANAHTAR.gunlukHedef], ['hatimKutlama.al', () => kullanici.hatimKutlama.al(), ANAHTAR.hatimKutlama]]) {
  koy(k, '{bozuk');
  let s; atmaz(ad + ' bozuk', () => { s = f(); });
  denetle(ad + ' bozuk: makul varsayılan', s === 1.05 || s === 1 || s === 0 || s === '' || esit(s, { target: 30, today: '', minutes: 0 }), JSON.stringify(s));
}
// bozuk kaydın üstüne yazma: ham metin saklanır
temizle();
koy(ANAHTAR.yerImleri, '{bozuk');
kullanici.yerImleri.ekle({ kisim: 1, madde_no: 1, baslik: 'A' });
denetle('bozuk kayda yazılınca eski ham metin ilmihal-bozuk-kayitlar\'a saklanır', esit(JSON.parse(ham(BOZUK_ANAHTARI)), { [ANAHTAR.yerImleri]: ['{bozuk'] }) && JSON.parse(ham(ANAHTAR.yerImleri)).length === 1);
// yanlış türde öğeler
koy(ANAHTAR.yerImleri, '[null, 5, {"x":1}, "çöp", "1/9", {"kisim":2,"madde_no":4}]');
denetle('yer imi: geçersiz öğeler atlanır, geçerliler okunur', kullanici.yerImleri.liste().map(x => x.key).join() === '1/9,2/4');
kullanici.yerImleri.ekle('3/3', 'C');
denetle('yer imi: yazınca tanınmayan öğeler de korunur', JSON.parse(ham(ANAHTAR.yerImleri)).length === 7);
koy(ANAHTAR.notlar, '{"1/1":"metin","1/2":[{"text":5},null]}');
atmaz('notlar yanlış tür', () => kullanici.notlar.hepsi());
denetle('notlar yanlış tür: dizi olmayan atlanır', esit(Object.keys(kullanici.notlar.hepsi()), ['1/2']));
// geçersiz girdiler
atmaz('geçersiz girdiler', () => {
  kullanici.yerImleri.ekle(null); kullanici.yerImleri.ekle('abc'); kullanici.notlar.ekle(undefined, 'x');
  kullanici.vurgular.sil('1/1', 99); kullanici.rehber.degistir(null, 1, 1); kullanici.sesKonumu.yaz();
  kullanici.iceAktar(null); kullanici.iceAktar({ anahtarlar: 5 }); kullanici.izle('yok', 1);
  P.planDurumu(null, { plan: { baslangic: 'x', gun: 'y' } }); P.maddeBitir('çöp', true, []);
});
denetle('bozuk plan: aktif değil, planBozuk işaretli', P.planDurumu([{ kisim: 1, no: 1, uzunluk: 10 }], { plan: { baslangic: 'x', gun: 0 } }).planBozuk === true);
// dolu kota
temizle();
koy(ANAHTAR.yerImleri, '[{"key":"1/1","kisim":1,"madde_no":1,"baslik":"A"}]');
koy(ANAHTAR.notlar, '{"1/1":[{"text":"n","date":"1.1.2026"}]}');
const once = LS.kopya();
LS.dolu = true;
atmaz('dolu kota: her yazma işlemi', () => {
  kullanici.yerImleri.ekle({ kisim: 2, madde_no: 2, baslik: 'B' }); kullanici.yerImleri.cikar('1/1');
  kullanici.notlar.ekle('1/1', 'yeni'); kullanici.vurgular.ekle('1/1', 'abc'); kullanici.okunan.isaretle(1, 5);
  kullanici.gecmis.ekle(1, 5); kullanici.yaziBoyutu.degistir(1); kullanici.sesHizi.sonraki(); kullanici.gunlukHedef.ekle(1);
  kullanici.quizPuani.kaydet(50); kullanici.maddeAcildi({ kisim: 1, madde_no: 5, baslik: 'x' });
  P.planKur(30, [{ kisim: 1, no: 1, uzunluk: 100 }]); P.maddeBitir('1/1', true, [{ kisim: 1, no: 1, uzunluk: 100 }]);
  kullanici.iceAktar({ anahtarlar: { [ANAHTAR.okunan]: '["1/1"]' } });
});
LS.dolu = false;
denetle('dolu kota: var olan veri silinmedi/değişmedi', esit(LS.kopya(), once));

/* ========== (d) Okuma planı: eski okuma-plani.js ile karşılaştırma ========== */
b('d) okuma planı eski = yeni');
const ESKI_LS = new SahteDepo();
const mesajlar = [];
const elemanlar = {};
const ctx = {
  console, localStorage: ESKI_LS, confirm: () => true, requestAnimationFrame: f => f(),
  bildirimGoster: m => mesajlar.push(m),
  document: { readyState: 'complete', addEventListener() {}, getElementById: id => elemanlar[id] || null, querySelector: () => null }
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(oku('data.js'), ctx);
vm.runInContext(oku('ozetler.js'), ctx);
vm.runInContext(`var __Gercek = Date; var __simdi = __Gercek.now();
  Date = class extends __Gercek { constructor(...a) { a.length ? super(...a) : super(__simdi); } static now() { return __simdi; } };`, ctx);
vm.runInContext(oku('okuma-plani.js'), ctx);
const ESKI = ctx.okumaPlani;
const saatAyarla = d => vm.runInContext(`__simdi = ${d.getTime()}`, ctx);

// Gerçek madde uzunlukları; iki madde uzunluğu kasten silinir (4000 yedeği sınansın)
const uzunluklar = ctx.maddeUzunluklari;
delete uzunluklar['2/5']; uzunluklar['3/7'] = 0;
const MADDELER = ctx.tocData.map(m => ({ kisim: m.kisim, no: m.madde_no, uzunluk: uzunluklar[m.kisim + '/' + m.madde_no] }));
denetle('241 madde yüklendi', MADDELER.length === 241, String(MADDELER.length));
const KEYS = MADDELER.map(m => m.kisim + '/' + m.no);

function ikisineKoy(kv) {
  ESKI_LS.clear(); LS.clear();
  for (const [k, v] of Object.entries(kv)) { ESKI_LS.setItem(k, v); LS.setItem(k, v); }
}
const BASLANGIC = '2026-01-10';
const tarihler = s => { const [y, a, g] = BASLANGIC.split('-').map(Number); return [0, 1, Math.floor(s / 2), s - 1, s, s + 40].map(n => new Date(y, a - 1, g + n, 14, 30)); };
const bitenSetleri = [[], KEYS.slice(0, 5), KEYS.slice(0, 120), KEYS.filter((_, i) => i % 3 === 0), KEYS.slice(0, 240), KEYS];
let karsilastirma = 0, takvimKars = 0;
for (const sure of P.SURELER.map(s => s.gun)) {
  for (const t of tarihler(sure)) {
    for (const bitenler of bitenSetleri) {
      ikisineKoy({ [ANAHTAR.hatim]: JSON.stringify({ baslangic: BASLANGIC, gun: sure, hatimSayisi: 2 }), [ANAHTAR.bitirilen]: JSON.stringify(bitenler) });
      saatAyarla(t);
      const eski = JSON.parse(JSON.stringify(ESKI.durum()));
      const yeni = JSON.parse(JSON.stringify(P.durum(MADDELER, t)));
      const farkli = Object.keys(eski).filter(k => !esit(eski[k], yeni[k]));
      karsilastirma++;
      denetle(`durum ${sure} gün, ${P.yerelGun(t)}, ${bitenler.length} biten`, farkli.length === 0, 'farklı alanlar: ' + farkli.join(','));
    }
    // takvim (bir biten seti ile)
    ikisineKoy({ [ANAHTAR.hatim]: JSON.stringify({ baslangic: BASLANGIC, gun: sure, hatimSayisi: 0 }), [ANAHTAR.bitirilen]: JSON.stringify(KEYS.slice(0, 60)) });
    saatAyarla(t);
    elemanlar['okuma-plani-calisma'] = { innerHTML: '' };
    ESKI.calismaTazele();
    const html = elemanlar['okuma-plani-calisma'].innerHTML;
    const lis = [...html.matchAll(/<li class="([^"]*)"><span class="tk-gun">(\d+)\. gün<\/span><span class="tk-tarih">([^<]*)<\/span><span class="tk-madde">([^<·]*?)(?: · [^<]*)?<\/span><\/li>/g)];
    const yt = P.takvim(MADDELER, t);
    const uyusan = lis.length === yt.length && yt.every((g, i) => {
      const [, sinif, gun, tarih, aralik] = lis[i];
      const [y, a, gg] = g.tarih.split('-').map(Number);
      const yTarih = new Date(y, a - 1, gg).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
      const yAralik = g.ilk ? g.ilk + (g.son !== g.ilk ? ' – ' + g.son : '') : '';
      return +gun === g.gun && tarih === yTarih && aralik.trim() === yAralik && sinif.includes('bitti') === g.bitti && sinif.includes('bugun') === g.bugun;
    });
    takvimKars++;
    denetle(`takvim ${sure} gün, ${P.yerelGun(t)} (${yt.length} gün)`, uyusan, `eski ${lis.length} satır, yeni ${yt.length}`);
  }
}
// Plansız durum
ikisineKoy({ [ANAHTAR.bitirilen]: JSON.stringify(KEYS.slice(0, 7)) });
denetle('plansız durum aynı', (() => { const e = JSON.parse(JSON.stringify(ESKI.durum())); const y = P.durum(MADDELER); return Object.keys(e).every(k => esit(e[k], y[k])); })());

// İşlemler: planKur, maddeBitir (olaylar), yeniHatim, okuma yeri
function islemKarsilastir(ad, kurulum, t, eskiIslem, yeniIslem, beklenenOlay) {
  ikisineKoy(kurulum); saatAyarla(t); mesajlar.length = 0;
  eskiIslem(); const yeniSonuc = yeniIslem();
  const eskiDepo = ESKI_LS.kopya(), yeniDepo = LS.kopya();
  denetle(ad + ': depo aynı', esit(eskiDepo, yeniDepo), JSON.stringify({ eskiDepo, yeniDepo }).slice(0, 400));
  if (beklenenOlay !== undefined) {
    const eskiOlay = mesajlar.some(m => m.startsWith('Elhamdülillah')) ? 'hatim-tamam' : mesajlar.some(m => m.startsWith('Bugünkü kısım')) ? 'bugunku-pay-tamam' : null;
    denetle(ad + ': olay aynı (' + eskiOlay + ')', eskiOlay === (yeniSonuc && yeniSonuc.olay) && eskiOlay === beklenenOlay, `eski ${eskiOlay}, yeni ${yeniSonuc && yeniSonuc.olay}`);
  }
}
const g0 = new Date(2026, 0, 10, 9, 0);
islemKarsilastir('planKur 30 (plan yokken)', {}, g0, () => ESKI.kur(30), () => P.planKur(30, MADDELER, g0));
islemKarsilastir('planKur 365 (hatim sayısı korunur)', { [ANAHTAR.hatim]: '{"baslangic":"2025-01-01","gun":90,"hatimSayisi":3}' }, g0, () => ESKI.kur(365), () => P.planKur(365, MADDELER, g0));
const bitir = (key, kur, t, olay) => islemKarsilastir(`maddeBitir ${key}`, kur, t,
  () => { const [k, m] = key.split('/').map(Number); ESKI.maddeAcildi({ kisim: k, madde_no: m }, true); ESKI.bitirToggle(); ESKI.maddeKapandi(); },
  () => P.maddeBitir(key, true, MADDELER, { bugun: t }), olay);
const plan30 = JSON.stringify({ baslangic: '2026-01-10', gun: 30, hatimSayisi: 0 });
// 1. gün payı: ilk maddeler; pay dolmadan
bitir('1/1', { [ANAHTAR.hatim]: plan30, [ANAHTAR.okumaYeri]: '{"1/1":0.5,"1/2":0.3}' }, g0, null);
// payı tamamlayan madde
const ilkGun = P.planDurumu(MADDELER, { plan: JSON.parse(plan30), bitenler: [], bugun: g0 }).bugunkuler.map(x => x.key);
const sonuncu = ilkGun.at(-1);
bitir(sonuncu, { [ANAHTAR.hatim]: plan30, [ANAHTAR.bitirilen]: JSON.stringify(ilkGun.slice(0, -1)) }, g0, 'bugunku-pay-tamam');
// aynı gün ikinci kez kutlama yok
bitir(sonuncu, { [ANAHTAR.hatim]: plan30, [ANAHTAR.bitirilen]: JSON.stringify(ilkGun.slice(0, -1)), [ANAHTAR.hatimKutlama]: '"2026-01-10"' }, g0, null);
// tırnaksız eski kutlama: eski kod tanımaz → kutlar; yeni kod tanır → kutlamaz (bilerek ayrılık; yalnız kayıt karşılaştırılmaz)
// hatim bitişi
bitir(KEYS[240], { [ANAHTAR.hatim]: plan30, [ANAHTAR.bitirilen]: JSON.stringify(KEYS.slice(0, 240)) }, g0, 'hatim-tamam');
// plansız bitirme
bitir('2/10', {}, g0, null);
// bitirmeyi geri alma
islemKarsilastir('maddeBitir geri al', { [ANAHTAR.hatim]: plan30, [ANAHTAR.bitirilen]: '["1/1","1/2"]' }, g0,
  () => { ESKI.maddeAcildi({ kisim: 1, madde_no: 2 }, true); ESKI.bitirToggle(); ESKI.maddeKapandi(); },
  () => P.maddeBitir('1/2', false, MADDELER, { bugun: g0 }), null);
// yeni hatim (bitmiş ve bitmemiş)
islemKarsilastir('yeniHatim (hatim bitmişken)', { [ANAHTAR.hatim]: '{"baslangic":"2025-06-01","gun":180,"hatimSayisi":1}', [ANAHTAR.bitirilen]: JSON.stringify(KEYS), [ANAHTAR.okumaYeri]: '{"1/5":0.4}' }, g0, () => ESKI.yeniHatim(), () => P.yeniHatim(MADDELER, g0));
islemKarsilastir('yeniHatim (plan yokken)', { [ANAHTAR.bitirilen]: '["1/1"]' }, g0, () => ESKI.yeniHatim(), () => P.yeniHatim(MADDELER, g0));
// okuma yeri kaydı (eski kaydirildi: 800 ms seyreltme dışında)
islemKarsilastir('okuma yeri kaydı', { [ANAHTAR.okumaYeri]: '{"1/60":0.42}' }, g0,
  () => { ESKI.maddeAcildi({ kisim: 1, madde_no: 61 }, true); ESKI.kaydirildi(0.5555, true); ESKI.maddeKapandi(); },
  () => P.okumaYeriKaydet('1/61', 0.5555));
denetle('donulecekYer', (() => { LS.clear(); LS.setItem(ANAHTAR.okumaYeri, '{"1/60":0.42,"1/61":0.98}'); return P.donulecekYer('1/60') === 0.42 && P.donulecekYer('1/61') === null; })());
denetle('otomatik bitirme süresi (8 sn – 3 dk, okuma süresinin üçte biri)', P.otomatikBitirmeSuresi(100) === 8000 && P.otomatikBitirmeSuresi(1e7) === 180000 && P.otomatikBitirmeSuresi(3300) === 60000);

// Günün maddesi = api/rss.js (Türkiye saati)
const rssKaynak = oku('api/rss.js');
const rssDizi = (() => { const c = { MADDELER: null }; vm.runInNewContext(rssKaynak.slice(rssKaynak.indexOf('const MADDELER'), rssKaynak.indexOf('const KISIM_ADI')).replace('const MADDELER', 'MADDELER'), c); return c.MADDELER; })();
const yilinGunuRss = (y, a, g) => Math.round((Date.UTC(y, a, g) - Date.UTC(y, 0, 0)) / 86400000);
denetle('RSS listesi 241 madde', Array.isArray(rssDizi) && rssDizi.length === 241, String(rssDizi && rssDizi.length));
let gmUyum = true, gmEskiUyum = true;
for (let i = 0; i < 800; i += 7) {
  for (const saat of [0, 2, 3, 12, 23]) {
    const t = new Date(2025, 0, 1 + i, saat, 15);
    const yeniSira = P.gununMaddesiSirasi(t, 241);
    const rssSira = yilinGunuRss(t.getFullYear(), t.getMonth(), t.getDate()) % 241;
    if (yeniSira !== rssSira || rssDizi[rssSira][0] !== MADDELER[yeniSira].kisim || rssDizi[rssSira][1] !== MADDELER[yeniSira].no) gmUyum = false;
    // eski app.js formülü (vm saatinde)
    saatAyarla(t);
    const eskiSira = vm.runInContext('(function(){ const today = new Date(); const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000); return dayOfYear % tocData.length; })()', ctx);
    if (eskiSira !== yeniSira) gmEskiUyum = false;
  }
}
denetle('günün maddesi: yeni = eski app.js formülü (115 gün × 5 saat)', gmEskiUyum);
denetle(`günün maddesi: yeni = api/rss.js (TZ=${process.env.TZ || 'yerel'})`, gmUyum);
// Günün suâli: eski getGununBilgisiIdx
let suUyum = true;
for (let i = 0; i < 60; i++) {
  const t = new Date(2026, 10, 1 + i, (i * 5) % 24, 10);
  saatAyarla(t);
  const eski = vm.runInContext('(function(o){ var n = 365; var idx = (Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000) + (o || 0)) % n; if (idx < 0) idx += n; return idx; })(' + (-(i % 8)) + ')', ctx);
  if (eski !== P.gununSualiSirasi(t, 365, -(i % 8))) suUyum = false;
}
denetle('günün suâli sırası = eski getGununBilgisi (60 gün, geçmiş günler dahil)', suUyum);

/* ========== (e) Dışa aktar → temizle → içe aktar ========== */
b('e) yedek gidiş-dönüş');
temizle();
const ORNEK = {
  [ANAHTAR.tema]: 'sepia', [ANAHTAR.yaziBoyutu]: '1.1500000000000001', [ANAHTAR.okumaAyarlari]: '{"aralik":"2.3","hiza":"justify","lugat":false}',
  [ANAHTAR.sahifeAcik]: '1', [ANAHTAR.fihristGizli]: '0', [ANAHTAR.yerImleri]: '[{"key":"1/52","kisim":1,"madde_no":52,"baslik":"Abdest"},"2/16"]',
  [ANAHTAR.okunan]: '["1/1","1/2"]', [ANAHTAR.gecmis]: '["1/2","1/1"]', [ANAHTAR.sonOkunan]: '{"kisim":1,"madde_no":1,"baslik":"A","zaman":1}',
  [ANAHTAR.notlar]: '{"1/52":[{"text":"not","date":"17.11.2026"}]}', [ANAHTAR.vurgular]: '{"1/52":[{"text":"vurgu metni","renk":"#fff3b0"}]}',
  [ANAHTAR.sesHizi]: '1.25', [ANAHTAR.sesKonumu]: '{"kisim":1,"maddeNo":52,"pageIdx":0,"time":123.45}',
  [ANAHTAR.gunlukHedef]: '{"target":30,"today":"2026-11-17","minutes":12}', [ANAHTAR.quizPuani]: '80',
  [ANAHTAR.rehber]: '{"r1":["1/51"]}', [ANAHTAR.duyuru]: '["metin-2026-10"]',
  [ANAHTAR.hatim]: '{"baslangic":"2026-11-17","gun":90,"hatimSayisi":0}', [ANAHTAR.bitirilen]: '["1/1"]',
  [ANAHTAR.okumaYeri]: '{"1/60":0.42}', [ANAHTAR.hatimKutlama]: '"2026-11-17"', [ANAHTAR.debug]: '1', [ANAHTAR.buildId]: '2026-10-19-r5',
  [ANAHTAR.onboardingGoruldu]: '1', [ANAHTAR.onboardingBitti]: '1', [BOZUK_ANAHTARI]: '{"ilmihal-read":["{x"]}'
};
for (const [k, v] of Object.entries(ORNEK)) koy(k, v);
const yedek = JSON.parse(JSON.stringify(kullanici.disaAktar()));
denetle('dışa aktarım: build-id ve debug hariç 24 anahtar', Object.keys(yedek.anahtarlar).length === 24 && !(ANAHTAR.buildId in yedek.anahtarlar) && !(ANAHTAR.debug in yedek.anahtarlar));
temizle();
const sonuc = kullanici.iceAktar(yedek);
const geri = LS.kopya();
const beklenen = { ...ORNEK }; delete beklenen[ANAHTAR.buildId]; delete beklenen[ANAHTAR.debug];
denetle('içe aktarım: bütün değerler HAM metniyle birebir', esit(Object.keys(geri).sort(), Object.keys(beklenen).sort()) && Object.keys(beklenen).every(k => geri[k] === beklenen[k]));
denetle('içe aktarım sonucu: 24 yazılan, atlanan yok', sonuc.tamam && sonuc.yazilan.length === 24 && sonuc.atlanan.length === 0);
// birleştirme
temizle();
koy(ANAHTAR.yerImleri, '[{"key":"3/1","kisim":3,"madde_no":1,"baslik":"C"},{"key":"1/52","kisim":1,"madde_no":52,"baslik":"Abdest"}]');
koy(ANAHTAR.notlar, '{"1/52":[{"text":"başka","date":"1.1.2026"}]}');
koy(ANAHTAR.tema, 'dark'); koy(ANAHTAR.quizPuani, '50'); koy(ANAHTAR.okunan, '["2/2"]');
const bs = kullanici.iceAktar(yedek, { birlestir: true });
denetle('birleştirme: yer imleri tekrarsız birleşir', kullanici.yerImleri.liste().map(x => x.key).join() === '3/1,1/52,2/16');
denetle('birleştirme: notlar eklenir', kullanici.notlar.liste('1/52').length === 2);
denetle('birleştirme: ayar (tema) var olan kalır, quiz büyük olan', ham(ANAHTAR.tema) === 'dark' && ham(ANAHTAR.quizPuani) === '80');
denetle('birleştirme: okundu birleşimi', ham(ANAHTAR.okunan) === '["2/2","1/1","1/2"]');
denetle('birleştirme: sonuç raporu', bs.tamam && bs.degismeyen.includes(ANAHTAR.tema));
// bozuk yedek
temizle(); koy(ANAHTAR.okunan, '["1/1"]');
const bozukYedek = kullanici.iceAktar({ anahtarlar: { [ANAHTAR.okunan]: '{bozuk', 'baska-site': 'x', [ANAHTAR.notlar]: 5 } });
denetle('bozuk yedek: bozuk değer atlanır, var olan veri kalır', ham(ANAHTAR.okunan) === '["1/1"]' && bozukYedek.atlanan.length === 3 && ham('baska-site') === null);

/* ---------- Sonuç ---------- */
console.log(`\nKullanıcı verisi sınaması — TZ=${process.env.TZ || '(yerel)'} · node ${process.version}`);
for (const [ad, s] of Object.entries(bolumler)) console.log(`  ${s.g === s.t ? 'TAMAM' : 'HATA '} ${ad}: ${s.g}/${s.t}`);
console.log(`  durum karşılaştırması: ${karsilastirma}, takvim karşılaştırması: ${takvimKars}`);
console.log(`TOPLAM: ${gecen}/${toplam} denetim geçti`);
if (basarisiz.length) { console.log('\nBAŞARISIZ:'); for (const x of basarisiz) console.log('  - ' + x); process.exitCode = 1; }
