# hukumler-2 okuma yönergesi (mubâh / mekrûh / harâm dizini)

Önce `tools/yeni-site/denetim/ORTAK.md` dosyasını oku; oradaki kurallar geçerlidir (yalnız denetle, veri dosyalarına dokunma,
ölçüt kitabın metnidir, kendi dinî bilginle hüküm verme, tahmin yazma, emin değilsen `kesin:false`).

## Okuma dosyalarının biçimi (`oku-*.txt`)
```
#<id> [<altTur etiketi>] <madde> s.<sahîfe> <betik işaretleri>
  BAGLAM-ALANI(sitede görünür): ...   (varsa; sitede kaydın altında "Bağlam" diye gösterilir)
  < kitapta cümlenin ÖNCESİ (son ~220 harf, kitaptan aynen; ¶ = paragraf sonu)
  = KAYDIN METNİ (sitede gösterilen cümle; kitapta aynen bulundu)
  > kitapta cümlenin SONRASI (ilk ~180 harf, aynen)
```
Sitede kayıt, ait olduğu türün sayfasında gösterilir: dosya adındaki tür (`mubah` / `mekruh` / `haram`) ve katman:
- `acik` = "Açık hükümler" sekmesi: sitede "bir şeyin <tür> olduğunu AÇIKÇA bildiren cümleler" diye sunulur.
- `tum` = "Tamamı" sekmesi: "<tür> hükmünün kitapta geçtiği bütün yerler" diye sunulur. `altTur` etiketi sitede kaydın yanında görünür.

Betik işaretleri yalnız ipucudur: `COKLU:x` metinde başka hüküm kelimesi var; `OLUMSUZ/SINIR:…` olumsuzluk/sınırlama/mezhep
kelimesi var; `TURLER_ARASI` aynı cümle birden çok türde açık hüküm; `ANLAM_DISI?` "Mescid-i harâm", "Harem" gibi; `BULUNAMADI` kitapta aynen yok.
Önceki/sonraki metin yetmezse maddenin tamamına bak: `veri/madde/<madde>.json` alanı `metin` (python ile arayıp çevresini yazdır; dosyayı bütün dökme).

## Her kayıt için sorulacak soru
**acik**: Bu cümle, GERÇEKTEN bir şeyin bu türden olduğunu AÇIKÇA bildiriyor mu?
**tum**: Kayıt gerçekten bu hükmün kitapta "geçtiği yer" mi; bu tür başlığı ve `altTur` etiketi altında durması okuyanı yanıltır mı?

## Karar ve kalıp kodları
Her kayda bir `karar` ver: `TAMAM` ya da sınıf `K` / `D` / `Y` / `B` (ORTAK.md'deki tanımlar). Sorunluysa bir `kalip` kodu ver:

| kalip | ne zaman | olağan sınıf |
|---|---|---|
| `OLUMSUZ` | cümle bu türü olumsuzluyor ("harâm değildir", "mekrûh olmaz", "câiz değildir") ama açık hüküm / olumlu etiketle duruyor | K |
| `BASKA_TUR` | cümle asıl olarak başka bir türü bildiriyor (ör. harâm altında "mekrûhdur", mubâh altında "mekrûhdur", "sünnetdir") | K |
| `TAHRIMEN` | "tahrîmen mekrûh" harâm altında açık hüküm olarak duruyor; ya da mekrûh altında tahrîmen/tenzîhen ayrımı etiketle çelişiyor (`altTur` "tenzîhen" ama metin "tahrîmen" vb.) | K ya da Y |
| `MEZHEP_GORUS` | yalnız bir mezhebin/âlimin/kavlin görüşü; ama bu sınırlama gösterilen cümlenin DIŞINDA (önceki cümlede) kalmış ve cümle genel hüküm gibi duruyor; ya da kitap bu görüşü aktarıp sonra reddediyor ("…diyenler oldu ise de, doğrusu…") | K |
| `HUKUMSUZ` | hüküm bildirmiyor, yalnız kelimeyi anıyor ("harâmlardan sakınan…", "harâm olan şeylerin sayısı azdır", tarif, kelime açıklaması) | acik'te Y; tum'da çoğu TAMAM (bir geçiştir) |
| `SART_EKSIK` | hükmün şartı/istisnası ya da öznesi önceki/sonraki cümlede kalmış ve cümle tek başına yanlış ya da genişletilmiş bir hüküm veriyor | Y (anlam tersine dönüyorsa K) |
| `BAGLAMSIZ` | özne yok, tek başına anlaşılmaz ("Harâm olur.", "Bu da harâmdır.", "İkisi de harâmdır."); site BAGLAM-ALANI'nda bağlamı veriyorsa daha hafif say ve bunu açıklamada belirt | Y |
| `ALTTUR` | `altTur` etiketi içerikle uyuşmuyor | Y |
| `CAIZ_AMA_MEKRUH` | mubâh altında, aslında "câiz ama mekrûh / sahîh ama mekrûh / câiz olmakla berâber…" diyen cümle; ya da "câiz" kelimesi "sahîh olur (geçerli)" anlamında, mubâhlık bildirmiyor | Y ya da K |
| `ANLAM_DISI` | kelime hükümle ilgisiz anlamda: "Mescid-i harâm", "harâm aylar", "Harem", "beled-il-harâm", "halâllaşmak", kitap adı | Y (kesin) |
| `KESIK` | cümle kesik / yarım alınmış (ör. açılan parantez kapanmıyor, sözün yarısı) ve bu anlamı bozuyor | B (anlam bozuluyorsa Y) |
| `ATIF` | sahîfe ya da madde yanlış | B |
| `YINELENME` | aynı yerdeki aynı cümle iki kayıt | B |

Ayarlama örnekleri (aşırı işaretleme yapma):
- "Yalan söylemek harâmdır." → TAMAM. Şart cümlenin İÇİNDEyse ("…sebeb olursa, harâm olur") → TAMAM.
- Mezhep sınırlaması cümlenin İÇİNDEyse ("Şâfi'îde harâmdır", "İmâm-ı a'zama göre câizdir") → TAMAM (okuyan görüyor). Yalnız önceki cümlede kalmışsa → MEZHEP_GORUS.
- Kitap bir kitaptan nakil yapıyorsa ("(Dürr-ül-muhtâr)da buyuruyor ki, (… harâmdır)") → TAMAM; bu kitabın kendi üslûbudur.
- Hadîs-i şerîf içinde hüküm ("Her lehv harâmdır") → TAMAM.
- "Harâm olur." tek başına → Y BAGLAMSIZ (BAGLAM-ALANI varsa açıklamada "sitede bağlam alanı var" yaz; yine Y ama hafif).
- Cümle hem harâm hem başka hüküm söylüyorsa (ör. "A harâm, B mekrûhdur") ve harâm kısmı açıksa → TAMAM; ama cümlenin ASIL hükmü başka türse → BASKA_TUR.
- `tum` katmanında `altTur` "harâm değildir / olmaz", "mekrûh değildir / istisnâ", "mubâh değildir", "karşı görüş" etiketli olumsuz cümle → etiket doğruysa TAMAM.
  `tum`'da olumsuz cümle olumlu etikette ("harâmdır", "diğer geçiş") → Y `OLUMSUZ`.
- Kitabın metnini, hükmünü ASLA değerlendirme; yalnız derlemenin kitabı doğru yansıtıp yansıtmadığını değerlendir.

## Çıktı (zorunlu)
Sana verilen her okuma dosyası için, aynı ada `.jsonl` uzantılı bir karar dosyası yaz: `karar-<dosya adı .txt'siz>.jsonl`
(ör. `oku-haram-acik-01.txt` → `karar-oku-haram-acik-01.jsonl`), `tools/yeni-site/denetim/betik-hukumler-2/` altında.
Dosyadaki HER kayıt için bir satır (TAMAM dahil; kayıt atlanmaz; satır sayısı = dosyadaki `#` sayısı):
```
{"id": 4048, "tur": "haram", "kat": "acik", "karar": "TAMAM|K|D|Y|B", "kesin": true, "kalip": "BAGLAMSIZ|…|null",
 "aciklama": "bir-iki cümle, Türkçe", "kitap": "sorunluysa kitaptan cümlenin tam hâli önü-arkasıyla, AYNEN (gerekirse veri/madde'den); TAMAM ise null",
 "oneri": "kaldır | sınıfını şu yap | altTur'u şu yap | şu ifadeyle değiştir (kitaptan aynen) | … ; TAMAM ise null"}
```
Kararları 20–30 kayıtlık parçalar hâlinde dosyaya EKLE (append) ki iş yarıda kalırsa ilerleme kaybolmasın. Okumayı hızlandırmak için atlama yapma.
Bitince satır sayısını `#` sayısıyla karşılaştır, eksik varsa tamamla.
Kapanışta kısa rapor ver: kaç kayıt okundu, karar sayıları (TAMAM/K/D/Y/B), en ciddi 5 bulgu (id + tek satır), emin olamadıkların.
