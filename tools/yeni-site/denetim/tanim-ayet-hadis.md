# Denetim: "Kitabın Kendi Tanımları" ve "Âyet-i Kerîme ve Hadîs-i Şerîf İndeksi"

Konu: `tanim-ayet-hadis` · Veri: `veri/tanimlar.json` (510), `veri/ayet-hadis.json` (193 âyet, 449 hadîs) ·
Ölçüt: `veri/madde/*.json` içindeki kitap metni (241 madde, s. 17–1058). Bulgu listesi: `tanim-ayet-hadis.json` (92 bulgu).
Betikler: `betik-tanim-ayet-hadis/` (`tara.mjs`, `ikincil.mjs`, `red.mjs`, `ters.mjs`, `kapsam.mjs`, `bulgular.py`; ara çıktılar `tarama.json`, `oku-*.txt`, `red.txt`, `ters.txt`, `kapsam-eksik.txt`).

## Yöntem ve kapsam

1. **Betikle (1152 kaydın hepsi):** her `cumle`/`metin` `duzle()` ile normalleştirilip önce kendi maddesinde, yoksa
   sahîfenin maddelerinde, yoksa bütün kitapta arandı; bulunamayanlarda en uzun ön ek/son ek eşleşmesi çıkarıldı.
   Bulunanların kitaptaki çevresi (önceki ve sonraki 2 cümle) alındı. Tanımlarda tanım kalıbı ("denir, demekdir…"),
   terimin cümlede ve maddede kitap yazımıyla geçişi, başta gösterme zamiri ("Buna, Bu…") ve yarım parantez denetlendi.
   Âyetlerde çevrede "âyet/sûre/meâl" ipucu, `sure` adının ve `ayetNo`nun çevrede geçişi, yakında "hadîs" ipucu;
   hadîslerde "hadîs/buyurdu/Resûlullah" ipucu, `kaynak` adının yakında geçişi ve red ifadeleri ("sahîh değil, mevdû’,
   uydurma, hadîs değildir, aslı yok, za’îf…") tarandı.
2. **Okuyarak (1152 kaydın hepsi):** her kayıt, kitaptaki öncesi (~170–230 harf) ve sonrasıyla birlikte tek tek okundu;
   işaret alanlar ve şüpheli olanlar maddenin geniş bağlamında (500–1500 harf) yeniden okundu. Bu okuma "kayıt kitapta
   gerçekten tanım/âyet meâli/hadîs olarak mı veriliyor" sorusuna yöneliktir; her kaydın paragrafın tamamı okunmamıştır.
3. **Red taraması (bütün kitap):** kitapta bir sözün hadîs olmadığını/sahîh olmadığını/aslı olmadığını söyleyen 147 yer
   betikle bulundu ve indeksle karşılaştırıldı.
4. **Ters yön:** sabit tohumla seçilen 10 maddede (1-74, 3-48, 1-30, 3-62, 2-7, 3-25, 2-22, 3-44, 1-51, 3-7) âyet meâli ve
   hadîs olarak verilen cümleler elle sayıldı; ayrıca bütün kitapta "meâl"/"hadîs-i şerîf" işaretli parantezli alıntılar
   betikle sayılıp (gürültülü) bir kapsam tahmini çıkarıldı.

**Denetlenemeyen:** kitap metni dosyaları önsözü (s. 1–16) ve hâl tercemelerini (s. 1059–1248) içermiyor. Bu
sahîfelerdeki 32 tanım, 3 âyet, 4 hadîs kitap metniyle karşılaştırılamadı. Bunlardan 17 tanım ve 1 âyet,
sitenin şahıs dizini biyografilerinde (`veri/sahislar`) aynen bulundu; ama o metin bu denetimde "kitap metni" diye
verilmediği için doğrulanmış sayılmadı.

## Sayılar

| | Kayıt | Kitapta aynen (maddesinde) | Bulunamadı | Denetlenemedi | K | D | Y | B |
|---|---|---|---|---|---|---|---|---|
| Tanım | 510 | 478 (hepsi kendi maddesinde) | 0 | 32 | 0 | 0 | 9 | 44 |
| Âyet meâli | 193 | 189 | 1 (yazım farkı) | 3 | 0 | 0 | 6 | 6 |
| Hadîs-i şerîf | 449 | 444 | 1 (yazım farkı) | 4 | 3 | 13 (8’i kesin değil) | 3 | 8 |

Notlar: Önceki sayımdaki "55 tanım / 9 âyet-hadîs bulunamadı" farkı normalleştirmeden kaynaklanıyor; normalleştirince
kitap metninin kapsadığı sahîfelerdeki bütün tanımlar bulunuyor. Bulunamayan tek âyet (ayet/136: "Ümmül-kitâb" ↔ kitap
"Ümm-ül-kitâb") ve tek hadîs (hadis/416: "Anababasının" ↔ kitap "Ana-babasının") yazım farkıdır. Madde atfı ve sahîfe
hiçbir bulunan kayıtta maddenin dışına düşmüyor.

## A. Tanımlar — kanaat: **düzeltilerek kullanılabilir**

- Metin doğruluğu yüksek: kitap metninin kapsadığı 478 cümlenin hepsi kendi maddesinde aynen var. Okumada kayıtların
  büyük çoğunluğu gerçekten "(…) denir / demekdir" kalıplı tanımlar.
- **Kesik parantez (39 kayıt, B):** cümle bir kaynak adının "(" işaretinden sonra başlıyor, ör. "Mecelle)nin
  yediyüzaltmışikinci…", "Redd-ül-muhtâr)da vitr…", "Hadîka)da el âfetlerinde…". Okurda bozuk görünüyor.
- **Birleştirme/kesik:** "Ahkâm-ı islâmiyye" kaydına sonraki paragraf ("(Ef’âl-i mükellefîn) sekizdir…") katılmış;
  "İstidrâc" kaydı kitaptaki 3. ve 4. maddeyi (Firâset + İstidrâc) birleştiriyor; "Şerî’atde tevhîd…" bir süâl ile
  cevâbını birleştiriyor.
- **Bağlam (Y):** "Contüsion" ("Buna" öncesi düşmüş), "Kâfir" (kitap önce Ehl-i kıbleye kâfir denmeyeceğini söyleyip
  "Fekat … buna (Kâfir) denir" diyor; kayıt yalnız ikinci cümle), "Dîn-i islâm" ("Ona" belirsiz), "Muhak".
- **Tanım olmayan / kitabın kendi sözü olmayan (Y):** "Bid’at ehli" tanımı kitapta bir hadîs-i şerîfin içinde
  ("Peygamberimiz, (İbâdetleri benden ve eshâbımdan gördüğünüz gibi yapınız! İbâdetlerde değişiklik yapanlara
  (bid’at ehli) denir…) buyurdu" — 1-58, s. 169; bu söz hadîs indeksinde de yok); "Ulûm-i islâmiyye" muhatabın
  mektûbundan nakil ("…denir, dediklerini yazıyorsunuz"); "İ’tibâr ediniz" bir âyet ifadesinin açıklaması.
- **Terim yazımı (B):** "Felse" (kitapta kelime "fels"; "Bir felse … denir" -e hâli), "Müfsidler" (kitap "(Müfsidleri)"),
  "Artık (su)". "Hayz kanı (Mâlikî mezhebinde)" terimine eklenen mezheb kaydı yerinde (cümlede var), hata sayılmadı.
- **Aynı terime iki tanım:** "Dünyâ" (1-11: kelimenin iştikâkı; 1-37: fen ve din bilgisindeki iki ma’nâsı) ve "Mevdû’"
  (2-16 ve 3-60) — ikisinde de kayıtlar birbirine aykırı değil, kitabın farklı yerlerindeki tamamlayıcı ifadeler.
  Bir cümleyi paylaşan terimler (Seyyid/Şerîf vb.) tasarım gereği.
- **"Kitabın Kendi Tanımları" adı (Y):** 510 kaydın ~53’ü kitabın başka eserlerden naklettiği cümleler (Mecelle,
  Hadîka, Redd-ül-muhtâr, Kâmûs-ül-a’lâm, Müncid, Hasîb beğ’in Kozmografya’sı, El-halâl vel-harâm vb.; betik tahmini),
  biri hadîs içinde, biri muhatabın sözü. Liste kitaptaki tanım kalıplarının da yalnız bir kısmı (betik kitapta
  "(…) denir/demekdir" kalıbını ~627 kez saydı; birden çok terim içerenler var). "Kendi" ve kayıtsız "Tanımlar" ifadesi
  hem kaynak hem kapsam bakımından fazla iddialı.

## B. Âyet-i kerîme meâlleri — kanaat: **güvenilir (birkaç künye düzeltmesiyle)**

- 189 meâlin hepsi maddesinde aynen var; hepsi kitapta "meâlen / meâlindeki / âyet-i kerîmede … buyuruldu" çerçevesiyle
  veriliyor. **Bir hadîsin ya da başka sözün "âyet" diye sunulduğu kayıt bulunamadı (K = 0).** Yakında "hadîs" geçen
  9 kayıt tek tek okundu; hepsi âyet.
- `sure`/`ayetNo` dolu kayıtların hepsinde sûre adı ve âyet numarası kitapta o cümle için bildirilmiş (betik 2 istisna
  buldu: ayet/166 kitapta bir paragraf önce bildirilmiş, doğru; ayet/34 aynı âyetin açıklamalı tekrarı, künye ayet/33’ten
  taşınmış). 24 kayıtta sûre boş: kitapta da sûre bildirilmemiş.
- **Künye eksikleri (B):** kitap iki yer bildirirken ikincisi düşmüş: ayet/9 ("Ra’d … ondördüncü ve Mü’min sûresinin
  ellinci âyetlerinde"), ayet/61 ("… ve Enfâl sûresinde"), ayet/155 ("… ve Rûm sûresindeki bir âyet-i kerîmede").
- **Yanıltıcı künye (Y):** ayet/8 — kitap "Mü’minûn sûresinin otuzuncu âyet-i kerîmesinden sonra, (…) meâlindeki âyet-i
  kerîmeleri gönderdi" diyor; derlemede âyetNo "otuzuncu".
- **Kesik meâl (B):** ayet/38 — Tâhâ 51–52’nin meâli kitapta iki parça (Fir’avnın süâli + Mûsâ aleyhisselâmın cevâbı);
  kayıtta yalnız ilk parça.
- **Tek âyet olmayan / Kur’ân âyeti olmayan (Y, kesin değil):** ayet/4 ("Elbette muhakkak böyledir" — âyetteki
  pekiştirmenin anlatımı, meâl değil), ayet/20 ve ayet/67 (kitap "birçok yerlerinde / müteaddid âyet-i kerîmeler" diye
  toplu ma’nâ veriyor), ayet/125 (kitap: "Dâvüd aleyhisselâma, (…) meâlindeki âyet-i kerîme ile vahy gönderdi").
- Sûre süzgecinde aynı sûre kitaptaki farklı adlarla iki kez çıkıyor (Vezzâriyât/Zâriyât, Ha-mîm Secde/Fussılet) — B.

## C. Hadîs-i şerîfler — kanaat: **düzeltilerek kullanılabilir; `kaynak` alanı bu hâliyle kullanılmamalı**

- 444 metnin hepsi maddesinde aynen var ve kitapta hemen hepsi "hadîs-i şerîfde … buyuruldu / Resûlullah … buyurdu ki"
  çerçevesiyle veriliyor.
- **Hadîs olmayan söz hadîs diye (K, 2):**
  - hadis/4 — kitap: "(Hadîka)da, (Bid’at sâhiblerinin ibâdetleri kabûl olmaz) hadîs-i şerîfini anlatırken buyuruyor ki,
    (Günâhlardan sakınmayan müslimânların ibâdetleri sahîh olsa da kabûl olmaz)" (1-1, s. 19). Kayıt Hadîka’nın
    açıklamasını hadîs diye veriyor; asıl hadîs kayıtta yok.
  - hadis/100 — "Bu haber, farz borcu olanların, sünnetlerinin ve nâfilelerinin kabûl olmıyacağını göstermekdedir…" kitapta
    "…bu hadîs-i şerîfi şerh eden Hanefî mezhebi âlimlerinden Abdülhak-ı Dehlevî buyuruyor ki, (Bu haber, …" (1-74,
    s. 278) — bir âlimin şerhi.
- **Kaynak aykırı (K, 1):** hadis/204 — kitap "Taberânînin “rahmetullahi teâlâ aleyh” bildirdiği hadîs-i şerîfde,
  (Kabrimi ziyâret edenin şefâ’atcisiyim)" diyor; derlemede kaynak "Beyhekî".
- **Kitabın "hadîs değildir / sahîh değildir" dediği söz indekste mi? (C3) — bulunamadı (K = 0).** Bütün kitapta 147 red
  ifadesi tarandı. Kitabın hadîs olmadığını söylediği sözler (1-71 sakal hakkında Tahâvî ve Kurtubî’ye nisbet edilen sözler
  "aslı yokdur"; 2-43 tütün hakkındaki sözler "hiçbiri hadîs değildir"; 2-71 "Ben, mimsiz Ahmedim" vb. "hadîs değildir")
  indekste yok. İndeksteki kayıtların çevresindeki 18 red ifadesi eşleşmesinin hepsi yalancı eşleşme ("yalan" kelimesi
  hadîsin kendi içinde vb.). Kitabın başkalarının "uydurma" dediği hadîsleri savunduğu yerler (2-16 Ebû Hanîfe hadîsleri,
  2-17 "Eshâbım yıldızlar gibidir", "Ümmetimin ihtilâfı rahmetdir") indekste hadîs olarak duruyor; bu kitabın kendi
  hükmüne uygun.
- **`kaynak` alanı (449 kaydın 64’ünde dolu):** 64’ün ~19’u sorunlu — 1 K (yukarıda); 5 kesin D (hadis/176, 177:
  "Dürr-ül-muhtâr" kitapta önceki habere âid; hadis/235: "Berîka" âyetlere âid not; hadis/262, 263: "Künûz" notu bir
  önceki hadîse âid, o hadîsin (261) kaynağı ise boş); 8 kesin olmayan D (hadis/94, 109, 172, 173, 174, 182, 310, 419:
  kaynak bir önceki nakilden taşınmış görünüyor); 5 B (birden çok kaynak sayılırken yalnız biri yazılmış: 74, 178,
  179, 203, 271). 385 kayıtta kaynak boş; betik bunların ~57’sinde kitabın hemen önce/sonra kaynak bildirdiğini buldu
  (ör. hadis/188: "(Âlimler, Peygamberlerin vârisleridir) hadîs-i şerîfi, (Buhârî)de yazılıdır."). Ayrıca "kaynak" alanı
  hadîs kitabı ile hadîsi nakleden fıkh/ahlâk kitabını (Hadîka, Dürr-ül-muhtâr, Tergîb-üs-salât…) karıştırıyor.
- **Diğer:** hadis/396 bir beytin ilk mısra’ı (ikincisi düşmüş); hadis/146, 315 olay anlatımı içindeki tek emir cümleleri
  (kitap "hadîs-i şerîfde" demiyor, "buyurdu" diyor; bağlamsız yarım); hadis/184 "anlarım" düşmüş; hadis/416 yazım.

## D. Ters yön ve kapsam

- **Örneklem (10 madde, elle sayım):** âyet meâli 1 (3-44) → 1’i indekste. Hadîs-i şerîf ~27 → 18’i indekste (~%67).
  1-74’te indekste 16 gerçek hadîs + 1 yanlış kayıt (hadis/100) var; eksikler: "(Unutulmuş sünnetimi meydâna çıkarana
  yüz şehîd sevâbı vardır) hadîsindeki", "(Bid’at işliyenin orucu, haccı, cihâdı kabûl olmaz) hadîs-i şerîfi",
  "(Sünnetimi terk edene şefâ’atim harâm oldu) hadîs-i şerîfini", "(Ümmetimin arasında fitne, fesâd yayıldığı zemân,
  sünnetime sarılana yüz şehîd sevâbı vardır) hadîs-i şerîfi", "(Sakalınızı uzatınız!) hadîs-i şerîfi", "(Öğleden önce
  olan sünneti terk eden, şefâ’atime kavuşamaz) hadîs-i şerîfi"; kesin olmayan 2 ("Gücün yeterse, yere secde et!…",
  "Ey kulum, nemâz hesâbının…"). 3-44’te "(İnsan, sevdiği ile berâberdir) buyurdu" eksik. Diğer 6 madde hadîs/âyet
  içermiyor.
- **Bütün kitap (betik tahmini, gürültülü):** "meâl" işaretli 224 parantezli alıntının 175’i âyet indeksinde (~%78);
  kalan 49’un okunanlarının ~45’i gerçek âyet meâli (ör. 1-18 "Kendinizi ve evlerinizde … ateşden koruyunuz!", 2-47
  tevekkül âyetleri, 3-70 "Bilen ile bilmiyen hiç bir olur mu?"). Hadîslerde eksiklerin çoğu kitabın bir hadîsi cümle
  öznesi olarak andığı "(…) hadîs-i şerîfi …" kalıbında ve sıralı listelerde (ör. 2-16’da "… hadîs-i şerîfleri meşhûrdur"
  diye sayılan 4 Ebû Hanîfe hadîsi); hadîs kapsamı kabaca %70–80.
- Sayfadaki "Kitapta geçen meâller ve hadîs-i şerîfler, bulundukları yerle" ve "Se’âdet-i Ebediyye’de meâlleriyle geçen
  âyet-i kerîmeler ve hadîs-i şerîfler" ifadeleri **tamamı** izlenimi veriyor; gerçekte büyük ama eksik bir seçki
  (âyetlerde ~%80, hadîslerde ~%70–80). Ayrıca 4 âyet/hadîs kaydı kitapta tek parça verilen pasajın bir kısmı.

## En önemli bulgular

1. hadis/4 (K): Hadîka’nın açıklaması hadîs diye; asıl hadîs ("Bid’at sâhiblerinin ibâdetleri kabûl olmaz") yok.
2. hadis/100 (K): Abdülhak-ı Dehlevî’nin şerhi hadîs diye.
3. hadis/204 (K): kaynak "Beyhekî"; kitap "Taberânînin bildirdiği" diyor.
4. `kaynak` alanı: 64 dolu kaydın ~19’u yanlış/taşınmış/eksik; 385 boş (ör. hadis/176–177, 235, 262–263).
5. "Kitabın Kendi Tanımları" adı: ~53 nakil, 1 hadîs içi söz, 1 muhatap sözü; kapsam kısmi.
6. tanım "Bid’at ehli": hadîs-i şerîf içindeki söz kitabın tanımı diye; aynı söz hadîs indeksinde yok.
7. ayet/8: âyetNo "otuzuncu", kitap "otuzuncu âyetden sonra" diyor; ayet/9, 61, 155 ikinci sûre düşmüş.
8. Sayfa açıklaması "tamamı" izlenimi veriyor; âyetlerde ~%80, hadîslerde ~%70–80 kapsam.

## Genel kanaat

- **Tanımlar:** düzeltilerek kullanılabilir — metinler kitaba sadık; 39 kesik parantez ve ~10 bağlam/terim kaydı
  düzeltilmeli, başlık değişmeli.
- **Âyet meâlleri:** güvenilir — K yok; 3 eksik künye, 1 yanıltıcı âyetNo, 1 kesik meâl düzeltilmeli; sayfa açıklaması
  "seçki" olduğunu söylemeli.
- **Hadîs-i şerîfler:** düzeltilerek kullanılabilir — 2 kayıt kaldırılmalı/değiştirilmeli; `kaynak` alanı ve buna dayalı
  "Kaynağa göre süzün" süzgeci, alan elden geçirilene kadar gösterilmemeli; sayfa açıklaması "seçki" olduğunu söylemeli.
