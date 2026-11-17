# ilmihal.org — Tasarım Dili

Bu belge yeni sitenin bütün görünümleri için bağlayıcıdır. Belirteçler ve ortak
bileşenler `css/temel.css` içindedir; önce onu oku. Burada **neden** ve **nasıl**
yazıyor.

## 1. Fikir: Kitap, Yer, Gök

Site üç âlemden oluşur ve üçü aynı elden çıkmış görünür:

| Âlem | Ne | Zemin |
|---|---|---|
| **Kitap** | Okuyucu, fihrist, lügat, hükümler, âyet ve hadîsler, tablolar, hâl tercemeleri | Gündüz: kâğıt ve mürekkep |
| **Yer** | Silsile-i Aliyye Atlası (üç boyutlu gece yeryüzü) | Gece |
| **Gök** | Namaz Vakitleri (üç boyutlu gök, güneşin gün yayı) | Gece ve seher |

Kitap okunur; okunan yer açık, sakin ve kâğıt gibidir. Yer ve Gök seyredilir;
karanlıktır ve tek sıcak renkleri altındır. Aralarındaki bağ: aynı yazılar
(Literata, Inter, Amiri), aynı altın, aynı şemse, aynı sükûnet.

Site kitabı **anlatmaz, gösterir**. Tanıtım cümlesi, özellik kartı, sayı şeridi
yerine kitabın kendisi (fihrist, sahîfeler, metin) öne çıkar.

## 2. Söz dağarcığı (kitap sanatlarından)

Süsleme hazır "İslâmî desen"lerden değil, Osmanlı kitap sanatının kendi
unsurlarından gelir. Her biri bir iş görür; süs için süs konmaz.

- **Fihrist satırı** (`.fihrist`): numara, ad, noktalı kılavuz, sahîfe. Sitedeki
  bütün listelerin (maddeler, hükümler, şahıslar, tablolar, arama sonucu) ana biçimi.
  Kart ızgarası yerine fihrist kullan.
- **Sürh** (`--surh`): kırmızı mürekkep. Yazmalarda başlık ve numara sürhle yazılır.
  Yalnız madde/sahîfe numarası, fasıl adı ve tek kelimelik vurgu için. Sayfada az olmalı.
- **Cetvel** (`.cetvel`): çift ince çizgili çerçeve. Bir sayfada en çok bir yerde,
  gerçekten öne çıkan tek blok için (günün maddesi, bir âyet-i kerîme).
- **Şemse** (`.semse`, `.rozet`): sekiz köşeli madalyon. Kısım ve madde numarasında,
  ayraçta. Zemine döşenmiş tekrar eden yıldız deseni KULLANILMAZ.
- **Ebru**: cildin iç kapağı. Yalnız büyük geçiş yerlerinde (kısım kapağı, sayfa
  sonu, boş durum, 404) ve hep bir görsel olarak; yazının arkasına döşenmez.
  Dosyalar `gorsel/ebru/` altında.
- **Ketebe**: sayfa sonundaki künye. Altbilgi bir künyedir: kaynak, baskı, sahîfe.

## 3. Renk

Belirteç adlarıyla yaz; onaltılık renk kodu görünüm CSS'ine yazılmaz.

- Zemin `--zemin`, üstte duran yaprak `--yuzey`. Gölge yalnız gerçekten üstte duran
  şeyde (pencere, açılır liste): `--golge`.
- Yazı `--murekkep`, ikincil `--murekkep-2`, en soluk `--murekkep-3` (daha soluğu yok;
  erişilebilirlik sınırı).
- Altın iki tonludur: süs ve büyük başlıkta `--altin`, küçük yazıda `--altin-yazi`.
- Bağlantı ve tek birincil eylem yeşildir (`--yesil-yazi`, `.dugme-ana`). Bir ekranda
  bir tane birincil düğme olur.
- Üç tema: `gunduz` (varsayılan), `sepya`, `gece`. `<html data-tema="…">`. Her görünüm
  üçünde de denenir. Gece teması atlasın göğüyle aynı zemindir.
- Renk tek başına anlam taşımaz (hüküm türleri renkle birlikte yazıyla da belirtilir).

## 4. Yazı

- Okunan her şey Literata'dır (`--yazi`). Arayüz etiketleri, künyeler, sayılar Inter
  (`--arayuz`). Arapça/Osmanlıca harfli yazı Amiri (`--arabi`, `lang="ar"`).
- Gövde 17px, satır aralığı 1,7; okuma satırı `--olcu` (≈66 harf) genişliğini geçmez.
- Büyük başlık az kelimeyle, büyük boyda ve sıkı harf aralığıyla (`.baslik-1`).
  Başlığın üstünde aralıklı küçük bir `.ust-yazi` durur.
- Metin içinde rakamlar eski tip (oldstyle); tabloda ve künyede `.sayi` ile düz ve
  eş enli.
- Kesme işareti ’ (tipografik), tırnak “ ”. Verideki düz ' gösterimde ’ yapılabilir;
  **kitap metninin kendisi hiçbir şekilde değiştirilmez**.
- İzâfet çizgisinde satır bölünmez ("Ahmed-i" bölünmesin): çizgiden sonra U+2060.

## 5. Düzen

- Sayfa kabı `.kap` (geniş), `.kap-dar`, `.kap-okuma`. Kenar boşluğu `--kenar`.
- Aralıklar `--a-1 … --a-10`. Bölümler arası `--a-9`/`--a-10`; cömert boşluk bırak.
- Hizalama sola; ortalanmış başlık yalnız kısım/madde kapağında.
- Telefon önce gelir: 360px genişlikte yatay taşma olmaz, dokunma hedefi en az 44px.
- Kart kullanma alışkanlığına direnç: içerik bir liste ise fihrist, bir metin ise
  metin, bir sayı ise satır içinde sayı. Kenarlıklı yuvarlak köşeli kutu ızgarası,
  simge + başlık + açıklama üçlüsü, "özellik kartı", sayı şeridi KULLANILMAZ.
- Simge azdır; yalnız araç çubuğu düğmelerinde ve hep çizgi (1,6px), tek renk.
  Emoji kullanılmaz.

## 6. Hareket

- Varsayılan geçiş `var(--sure)` ve `var(--yay)`. Hareket bir şeyi açıklamak içindir
  (bir panel nereden geldi), dikkat çekmek için değil.
- Sayfa yüklenirken bir kez, sırayla beliren başlık dışında giriş canlandırması yok.
- `prefers-reduced-motion` temel dosyada ele alındı; JS ile yapılan hareketlerde de
  `matchMedia('(prefers-reduced-motion: reduce)')` denetlenir.

## 7. Dil ve hürmet

- Arayüz dili Türkçe, sizli hitap ("Okumaya başlayın"). Kitabın yazımı esas alınır:
  "nemâz", "sahîfe", "hâl tercemesi", "âyet-i kerîme", "hadîs-i şerîf", "lügat".
- Hürmet ifadeleri tam yazılır: (sallallahü aleyhi ve sellem), (radıyallahü anh),
  (rahmetullahi aleyh), (kuddise sirruh). Kısaltılmaz.
- "yaratmak" ve türevleri insan ve nesne için kullanılmaz (oluşturmak, hazırlamak,
  üretmek). "mucize", "sihir", "şans", "kader" arayüz metninde mecaz olarak geçmez.
- Kutlama, oyun dili, rozet kazanma, havai fişek yok. Tamamlanan iş vakur bir
  cümleyle bildirilir ("Bugünkü okumanızı tamamladınız").
- Peygamberler, melekler, Eshâb-ı kirâm ve âlimler için figür, siluet, hale, portre
  yok. İnsan resmi hiç yok. Görseller nesne, yazı, yer ve göktür.
- Kitabın metni, başlıkları, sahîfe numaraları değiştirilmez, kısaltılmaz, "düzeltilmez".

## 8. Bir görünümü bitirmeden önce

1. Üç temada ve 390 / 768 / 1440 genişlikte bak (ekran görüntüsünü KENDİN aç ve incele).
2. Yalnız klavyeyle dolaş; odak halkası görünüyor mu.
3. Boş, yükleniyor ve hata durumlarını gör.
4. Bu belgedeki "kullanılmaz" maddelerinden biri sızmış mı diye tara.
