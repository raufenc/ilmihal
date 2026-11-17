# Arama motoru — API başvurusu

Dosyalar: `js/cekirdek/metin.js` (saf yardımcılar) · `js/cekirdek/arama.js` (ana iş parçacığı sarmalayıcısı) ·
`js/isci/arama-isci.js` (modül Web Worker + motor) · `tools/yeni-site/arama-uret.mjs` (dizin üretir → `veri-arama/`) ·
`tools/yeni-site/arama-sina.mjs` (sınama). Kaynak veri yalnız okunur; `veri/` klasörüne dokunulmaz.
Yeniden üretim: `node tools/yeni-site/arama-uret.mjs` (deterministik; yalnız değişen dosyayı yazar, artakalanı siler).

## Tasarım ve gerekçe
- **Hızlı dizin** `hizli.json` (gzip ≈121 KB): 241 başlık (+sahîfe), 9 863 lügat terimi, 510 tanım, 1 024 şahıs, 130 tablo,
  229 soru→madde, eş anlamlılar. İşçi bunu bir kez indirip normalleştirir (≈15 ms); her tuş 1–5 ms.
- **Tam metin: kısım kısım ASIL metin parçaları + işçide tarama** (seçenek a). 8 madde parçası (kısım sınırını aşmaz,
  her biri ≈180 KB gzip), en çok 3'ü birlikte iner, hangisi önce gelirse işlenir ve sonuçlar o anda akar.
  Ters dizin (b) ölçüldü: yalnız madde-düzeyi (konumsuz) 55 543 kelime / 239 086 çift = **585 KB gzip**; kesit yine asıl
  metinden alınacağı için metin de inmek zorunda → toplam indirme büyür. Taramanın bedeli küçük: 4 MB metni
  normalleştirmek ≈37 ms, bir terimi bütün kitapta aramak 2–5 ms. İfade araması, yakınlık ve doğru vurgu metin
  elde olunca kendiliğinden çözülür. Parçalar sürüm özetiyle (`?v=`) istenir; tarayıcı önbelleği yeter.
- Lügat tanımları (3 parça), tanımlar, şahıs biyografileri, hükümler (aynı metin bir kez: 7 158 → 4 252) ayrı parçalardır;
  yalnız o tür istenince iner. `oneri.json` (kitap sözcük sıklığı) yalnız `oneriler()` çağrılınca iner.

## Normalleştirme (`duzle`) — her konum asıl metne geri döner
- Türkçe küçük harf (İ/I/ı/i → i), şapka ve Türkçe harf katlama (â→a, ç→c, ğ→g, ö→o, ş→s, ü/û→u, é→e …).
- İki harf arasındaki kesme/hemze/ayn (`’ ' ‘ ʼ ʾ ʿ`) silinir: `Kur’ân`→`kuran`, `bid’at`→`bidat`, `a’zam`→`azam`.
- İki harf arasındaki tire korunur (`Ehl-i`→`ehl-i`); kelime başı = metin başı, boşluk ya da tire sonrası.
  Sorgu tarafında `ehli`→`ehl-i`, `darul`→`dar-ul` varyantı üretilir; böylece `ehli sünnet` = `Ehl-i sünnet`.
- Öteki her şey (noktalama, tırnak, satır sonu, —) tek boşluğa iner. Silme/sıkıştırma yapılsa da `konum` dizisi
  her düz karakterin asıl indeksini tutar → vurgu kaymaz (eski H-7 burada kapandı).

## `metin.js` (DOM yok, HTML yok; hiçbir dosyada geriye bakan düzenli ifade yok)
```js
duzle(metin) → string
duzleEslemeli(metin) → { duz, konum: Int32Array }        // konum[i] = duz[i]'nin asıl indeksi
asilAralik(metin, konum, s, e) → [bas, son]               // düz [s,e) → asıl [bas,son) (aksanlar dahil)
varyantlar(kelime, { esAnlamlilar }) → string[]           // eski OTTOMAN_MANUAL + wordVariants aynen, + tire/kök
sorguCoz(sorgu, { esAnlamlilar }) → { ham, duz, kelimeler, ifadeler, secenekler: [[terim…]…] }
vurguAraliklari(metin, sorgu, { esAnlamlilar, eslemeli }) → [[bas, son]…]   // sıralı, çakışmasız
kesit(metin, [bas, son], { once = 70, sonra = 150, vurgular }) → { metin, vurgular, bas, son, basKesik, sonKesik }
anahtarBicimi(s), esAnlamTablosu(aramaSynonyms), terimEslesmeleri(duz, terim), araliklariBirlestir(a), uzaklik(a, b)
```
Sorgu: tırnak içi (`"…"` ya da `“…”`) **ifade** (kelimeler bitişik, sıra korunur; son kelime ek alabilir); öteki
kelimeler VE ile bağlanır; durak kelimeleri (eski liste) atılır; tüm sorgu bir eş anlam anahtarıysa (ör. `namaz kılmak`)
ikinci bir VEYA seçeneği eklenir. Kelime ≤2 harfse tam kelime, değilse kelime başı + ek (vurgu kelimenin sonuna uzar).

## `arama.js`
```js
import { arama } from '/js/cekirdek/arama.js';
await arama.hazirla();                       // isteğe bağlı ön yükleme → { surum, toplam: {madde:241,…}, esAnlamlilar }
await arama.hizli(sorgu, { sinir: 5 })       // → { maddeler, lugat, sahislar, tablolar, soru, sure }
await arama.tam(sorgu, { turler: ['madde'], kisim: null, sinir: 50, kesitSayisi: 3, sinyal, parcaGeldi })
      // → { sonuclar, toplam: {madde: 61}, eslesmeToplami, sure, hatalar: [{parca, ileti}], kelimeler }
await arama.oneriler(sorgu)                  // → { oneriler: [{tur: 'yazim'|'duzeltme'|'esanlam', kelime, oneri, aciklama}], duzeltilmis }
await arama.vurguAraliklari(metin, sorgu)    // metin.js'inkiyle aynı, eş anlamlılar da yüklü
arama.ayarla({ veriKoku: '/veri-arama/' })   // ilk istekten önce; varsayılan arama.js'e göre ../../veri-arama/
```
- `turler`: `madde | lugat | tanim | sahis | hukum`; sıralama tür içinde, `sinir` tür başına. `kisim` madde ve hükmü süzer.
- `parcaGeldi(sonuclar, ilerleme)`: her parça işlenince o ana kadarki **sıralı** liste (yeniden çizin);
  `ilerleme = { yuklenen, toplam, parca, tur, sure }`. Puanlar df öğrenildikçe biraz oynar; son söz kesindir.
- Yeni `tam()` öncekini `AbortError` ile bitirir; `sinyal` (AbortController) da bitirir. AbortError'u sessizce geçin.
- Worker kurulamazsa (eski tarayıcı, modül işçisi yok, 10 sn'de hazır demedi, sonradan çöktü) motor ana iş
  parçacığında `scheduler.yield`/`setTimeout` aralarıyla çalışır; `await arama.kip()` → `'isci' | 'yerel'`.
- Hata: söz `Error` ile reddedilir (ör. `Arama verisi indirilemedi (madde-3.json): HTTP 404`). Tek parça inmezse
  arama sürer, `hatalar` listesine yazılır; hepsi inmezse reddedilir.

Sonuç örnekleri (gerçek çıktı, kısaltılmış):
```json
hizli('zekat kimlere verilir', {sinir:1}) →
{"maddeler":[{"tur":"madde","kimlik":"1/78","kisim":1,"no":78,"baslik":"Zekât vermek. Para, mal, …","sahife":292,
  "sahifeBitis":312,"puan":22.6,"vurgular":[[0,5],[56,62]]}],"lugat":[{"tur":"lugat","kimlik":9759,"baslik":"ZEKÂT",
  "vurgular":[[0,5]]}],"sahislar":[],"tablolar":[{"tur":"tablo","kimlik":"zekat_kimlere_verilir","baslik":"Zekât Kimlere
  Verilir, Kimlere Verilmez?","kisim":1,"no":78,"sahife":307,"vurgular":[[0,5]]}],"soru":[{"kimlik":"1/78","kisim":1,"no":78,
  "baslik":"Zekât vermek. …","cevapOzet":"Zekât, Kur'ân-ı Kerîmde bildirilen sekiz sınıf insana verilir.","tam":true}],"sure":4.5}
tam('nemaz vakti', {sinir:1, kesitSayisi:1}).sonuclar[0] →
{"tur":"madde","kimlik":"1/60","baslik":"Nemâz vaktleri. Takvîmler. Ezân","kisim":1,"no":60,"sahife":175,"sahifeBitis":203,
 "puan":224.91,"eslesmeSayisi":572,"baslikVurgulari":[[0,5],[6,14]],"kesitler":[{"metin":"Âkıl ve bâlig olan, … hergün beş
 vakt nemâzı, vaktlerinde kılmaları farzdır. …","vurgular":[[…]],"bas":1079,"son":1285,"basKesik":true,"sonKesik":true}]}
```
`kimlik`: madde `"k/m"`, lügat `sozlukData.i`, tanım `tanimlarData` sırası (0'dan), şahıs `slug`, tablo `id`, hüküm `id`
(+`digerKimlikler`, `hukumTurleri`, `katmanlar`). Yalnız başlıkta eşleşen sonucun kesiti metnin başıdır (`vurgular: []`).
`puan` = kademe×100 + BM25 (+ başlıkta geçme + yakınlık); kademe: 3 başlık = sorgu, 2 başlık sorgunun kelimesiyle başlar,
1 başlıkta geçer, 0,5 başlıkta yalnız eş anlamlısı geçer, 0 yalnız metinde. Ekler ağırlıklıdır (`hacca` tam, `hâcet` az sayılır).

## Arayüzün yapması gerekenler
- Sorguyu hiçbir yerde HTML'e/özniteliğe gömmeyin; URL'ye `encodeURIComponent`, ekrana `textContent`.
- Vurguyu aralıklardan DOM düğümleriyle kurun (asla `innerHTML`):
```js
function vurguluMetin(metin, vurgular, { basKesik, sonKesik } = {}) {
  const parca = document.createDocumentFragment();
  if (basKesik) parca.append('… ');
  let i = 0;
  for (const [b, s] of vurgular) {
    if (b > i) parca.append(metin.slice(i, b));
    const m = document.createElement('mark');
    m.textContent = metin.slice(b, s);
    parca.append(m);
    i = s;
  }
  parca.append(metin.slice(i));
  if (sonKesik) parca.append(' …');
  return parca;
}
kart.append(vurguluMetin(k.metin, k.vurgular, k));            // k = sonuc.kesitler[0]
baslikEl.append(vurguluMetin(sonuc.baslik, sonuc.baslikVurgulari));
```
- Okuyucuda "bu maddede ara": `const a = await arama.vurguAraliklari(maddeMetni, sorgu)`; aralıklar maddenin asıl
  metnine göredir. Metin paragraflara bölünüp çizildiyse her paragrafın asıl metindeki başlangıcını tutup aralığı
  o paragrafa düşürün (TreeWalker ile metin düğümlerinin kümülatif uzunluğu da olur); ilk `mark`a kaydırın.
  Aramadan gelen sonuçta `kesitler[0].bas` asıl metindeki konumdur: oraya kaydırmak için kullanılabilir.
- Hızlı aramayı her tuşta çağırın (gecikme gerekmez; işçi sırayla cevaplar, eski cevabı yok sayın).
- "Bunu mu demek istediniz": sonuç azsa `oneriler()`; `duzeltilmis` varsa onu tek tıkla aratın.

## İşçi ileti sözleşmesi (`arama.js` bunu sarar; doğrudan kullanmak gerekmez)
Gelen: `{tip:'kur', veriKoku}` · `{tip:'hazirla'|'hizli'|'oneriler'|'tam', no, sorgu, secenek}` · `{tip:'iptal', hedef: no}`.
Giden: ilk iş `{tip:'hazir'}`; sonra `{no, tip:'parca', sonuclar, ilerleme}` · `{no, tip:'sonuc', veri}` ·
`{no, tip:'hata', ad, ileti}` (`no: null` = işçi geneli). Yeni `tam` öncekini bırakır (önceki `ad:'AbortError'` alır).

## `veri-arama/` boyutları
16 dosya, 7,5 MB ham, **2,51 MB gzip**. `hizli.json` 121 KB gzip · madde 8 parça 1 429 KB · lügat 3 parça 467 KB ·
şahıs 196 KB · hüküm 218 KB · tanım 33 KB · oneri 107 KB. Yalnız madde araması: 121 + 1 429 KB (bir kez; sonra önbellek).

## Eski motordan farklar
- Düzelen: H-7 (vurgu kayması; şapkasız sorgu şapkalı metni vurguluyor), H-8 (lookbehind yok), H-16 (sorgu HTML'e
  girmiyor), H-6 (lügat sonucu `baslik` taşır). `namaz` artık `Nemâz…` başlıklı maddeleri öne alıyor (eskide tek kelime
  sıralaması yalnız yazılan biçime bakıyordu: 8 başlıklı madde ilk 30'a bile girmiyordu). `kur'an`/`kuran` ve `ehli`/`ehl-i` eşit.
- Bilerek değişen: bulanık (Levenshtein) eşleşme yalnız hızlı aramada ve yalnız dizinde hiç geçmeyen kelimeye uygulanır;
  tam aramada yerine `oneriler()` vardır. 4+ kelimede "biri eksik olabilir" kuralı yok (hepsi geçmeli). BM25 uzunluğa
  göre normalleştirir: her şeyden söz eden uzun maddeler (1/46 vb.) eskisi kadar öne çıkmaz.
- Eski eş anlam değerlerinden `kur` gibi anahtarın kesiği olan tek kelimeler atıldı (`kuran`→`kur` → `kurban` gürültüsü).

## Sınama sonucu
Elle inceleme (`--ayrinti`): "nötr" farkların hepsi yalnız metinde geçen maddelerin sırasıdır. Eski motor kelimeyi
4+ kez anan uzun genel maddeleri (1/46, 1/52, 1/54, 1/74) öne alıyordu; yeni motor kelimenin yoğun geçtiği maddeleri
alıyor (oruç → adak, ıskat, yemîn keffâreti; duâ → kazâya rızâ, kabr ziyâreti). Kalan zayıflık: 3–4 harfli kelimelerin
önek gürültüsü (`hac` → `hacm`, `mest` → eş anlam tablosundaki `mesh` üzerinden `meşhûr`); ek ağırlığı bunları geriye atıyor ama silmiyor.
<!-- SINAMA-BASLA -->
Son çalıştırma: `node tools/yeni-site/arama-sina.mjs --yaz` — **52 denetim, 52 geçti, 0 kaldı** (a) 1/1 · b) 29/29 · c) 1/1 · d) 5/5 · e) 2/2 · f) 14/14).
- veri-arama/: 16 dosya, 7694 KB ham, **2570 KB gzip**; hizli.json gzip 121 KB; madde parçaları gzip 1429 KB.
- Süreler (node 22, Apple M4; ağ hariç): hızlı dizin yükleme 12.3 ms; hızlı arama ortanca 0.9 ms (en çok 3.5); tam/madde soğuk 99.1 ms (ilk parça 35.1 ms), sıcak ortanca 27.1 ms (en çok 49.8); bütün türler soğuk 102.5 ms.
- Eski motorla ilk 10 (50 sorgu): 2 sorguda aynı küme; ortalama ortak 6.4/10. Farklı madde: lehine 25, nötr 327, aleyhine 0 (ölçüt: betikteki "Hüküm" yorumu; ayrıntı: `--ayrinti`).
  Ortak sayısı: namaz 2/10, abdest 8/10, gusül 9/10, gusl 9/10, oruç 4/10, zekât 8/10, hac 2/10, kurban 8/10, nikâh 6/10, talâk 8/10, cenaze 8/10, iman 8/10, imanın şartları 4/10, bid'at 6/10, ehl-i sünnet 5/10, imam-ı a'zam 7/10, resulullah 8/10, peygamber 8/10, kur'an 6/10, kuran-ı kerim 7/10, tevbe 8/10, sabır 5/10, şükür 3/10, kader 7/10, mezhep 4/10, vehhabi 4/10, tasavvuf 8/10, evliya 4/10, keramet 9/10, cennet 3/10, cehennem 7/10, kıyamet 6/10, faiz 8/10, miras 6/10, tesettür 7/10, avret 7/10, namazın farzları 5/10, abdest bozan 8/10, mest 5/10, ezan 7/10, kıble 8/10, sünnet 8/10, haram 9/10, dua 2/10, zikir 7/10, ahlak 6/10, cuma namazı 3/10, kaza namazı 6/10.
<!-- SINAMA-BITIR -->
