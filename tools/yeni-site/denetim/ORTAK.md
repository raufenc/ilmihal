# Fevâid denetimi — ortak kurallar

Türkçe çalış, Türkçe yaz. ilmihal.org, Hüseyn Hilmi Işık hazretlerinin hazırladığı "Tam İlmihâl Se'âdet-i Ebediyye"
kitabının etkileşimli baskısıdır. **Kitabın metni esas kaynaktır.** Sitenin "Fevâid" bölümündeki dizinler, tablolar,
suâller ve açıklamalar ise kitaptan SONRADAN, büyük ölçüde makineyle derlenmiştir; ne kadar doğru oldukları
bilinmiyor. Site sahibi bunların tamamının kitapla karşılaştırılarak denetlenmesini istiyor. Sana bu derlemelerden
bir parça verildi.

## Görevin niteliği
- Yalnız DENETLE ve RAPORLA. Hiçbir veri dosyasını, hiçbir site dosyasını değiştirme, silme, "düzeltme".
  Yalnız `tools/yeni-site/denetim/` altına, sana söylenen adlarla yaz (rapor + bulgu listesi + kendi betiklerin
  için `tools/yeni-site/denetim/betik-<konu>/`). Git komutu çalıştırma. Tarayıcı açma.
- Ölçüt TEKTİR: kitabın kendi metni. Derlemedeki bir bilgi kitabın metninde, o yerde, o anlamda var mı?
  Kendi dinî bilginle, başka kaynakla ya da genel kanaatle hüküm verme; "doğrusu şudur" deme. Yalnız
  "kitap şurada şunu diyor, derleme şunu diyor" de ve kitaptan aynen alıntıla (madde ve sahîfe ile).
- Kitabın metnini değerlendirme, eleştirme, "düzeltme". Kitabın imlâsı (nemâz, harâm, mekrûh, kâfir, sahîfe…) doğrudur.
- Tahmin yazma. Emin olamadığın bulguyu "kesin değil" diye işaretle ve nedenini yaz. Bulamadığın şeyi
  "bulunamadı" diye yaz; uydurma.

## Veriye erişim
- Depo: `/Users/raufenc/Documents/Claude 2/ilmihal-site`. node: `export PATH="/Users/raufenc/pinokio/bin/miniconda/bin:$PATH"`
  (bağımlılık ekleme). Python: `/usr/local/bin/python3`.
- Kitabın metni: `veri/madde/<kisim>-<no>.json` → alan `metin` (241 madde; düz metin, kitapla bayt bayt aynı),
  künyeler `veri/fihrist.json`. Madde kimliği her yerde `"1-43"` (kısım-no). Sahîfe: maddenin başlangıç ve bitiş
  sahîfesi `sahife: [bas, son]`; metin içinde sahîfe işareti yoktur.
- Derlemeler: `veri/` altındaki JSON'lar; şemaları `tools/yeni-site/VERI.md` içinde (önce onu oku).
- Kitap metninde arama yaparken yazım farklarını hesaba kat: şapkalar (â î û), kesme türleri (' ’ ‘ `), tire,
  büyük-küçük harf, çift boşluk, satır sonu. Normalleştirerek ara; ama rapora alıntıyı ASIL metinden koy.
  `js/cekirdek/metin.js` içinde hazır normalleştirme işlevleri var (`duzle`, `duzleEslemeli`); node'dan içe aktarabilirsin.
- Büyük dosyaları tamamen ekrana dökme; betikle işle, okuman gereken kayıtları parça parça oku.

## Bulgu sınıfları (her bulguya birini ver)
- **K — kitaba aykırı**: derleme kitabın söylediğinin tersini ya da kitapta olmayan bir hükmü/bilgiyi söylüyor;
  yanlış sınıfa konmuş (ör. kitapta "mekrûh" denen iş "harâm" başlığı altında); olumsuzluk ("değildir", "olmaz")
  ya da şart düşmüş ve anlam değişmiş; bir mezhebin ya da bir âlimin görüşü genel hüküm gibi sunulmuş.
- **D — dayanaksız**: kitapta karşılığı bulunamadı (cümle kitapta yok; açıklama sitenin kendi yorumu).
- **Y — yanıltıcı olabilir**: bağlamından kopuk; şartı, istisnası ya da devamı eksik; başlık/etiket içeriğe uymuyor.
- **B — biçim**: yanlış madde/sahîfe atfı, yinelenme, yazım, kesik cümle, bozuk karakter.

## Çıktı
1. `tools/yeni-site/denetim/<konu>.md` — rapor: neyi, nasıl denetledin (yöntem ve kapsam: kaç kayıt TAM okundu, kaçı
   betikle tarandı, kaçı örneklendi), sınıflara göre sayılar, en önemli bulgular (kitaptan alıntıyla), denetleyemediğin
   kısımlar, bu derleme için genel kanaatin (güvenilir / düzeltilerek kullanılabilir / kaldırılmalı) ve gerekçesi.
2. `tools/yeni-site/denetim/<konu>.json` — bulgu listesi: `[{ "kimlik": "...", "sinif": "K|D|Y|B", "kesin": true|false,
   "derleme": "derlemedeki ifade", "kitap": "kitaptan aynen alıntı ya da null", "madde": "1-43"|null, "sahife": n|null,
   "aciklama": "bir-iki cümle", "oneri": "kaldır | şu ifadeyle değiştir (kitaptan) | sınıfını şu yap | atfı düzelt | …" }]`
   Önerilen her düzeltme metni kitaptan aynen alınmış olmalı; yeni cümle yazma.
3. Bana kısa bir kapanış özeti: kapsam, sınıf sayıları, en ciddi 8 bulgu (tek satır), genel kanaat.
