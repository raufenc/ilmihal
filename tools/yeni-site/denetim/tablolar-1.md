# Fevâid denetimi — Tablolar, birinci parça (dizindeki ilk 65 tablo)

Konu: `tablolar-1`. Bulgu listesi: `tools/yeni-site/denetim/tablolar-1.json`. Betikler: `tools/yeni-site/denetim/betik-tablolar-1/`.

## Yöntem ve kapsam

- Kapsam: `veri/tablolar/dizin.json` içindeki `tablolar` dizisinin ilk 65 kaydı (`konu_haritasi` … `bidat_uc_tur`). `kitabin_tanimlari` (tip `tanimlar`) kurala göre ATLANDI (başka ajan denetliyor); yalnız varlığı not edildi. Denetlenen: **64 tablo**.
- Her tablonun bütün satırları/adımları/dalları TEK TEK okundu (64/64, örnekleme yok). Her satır, `kaynakMadde`deki madde metniyle karşılaştırıldı; madde metninde bulunamayan satırlar için bütün 241 madde normalleştirilmiş aramayla (şapka, kesme, büyük-küçük harf, boşluk farkı gözetmeksizin; `betik-tablolar-1/ara.py`) tarandı ve ilgili yerler okundu.
- `kaynakMetin` alıntılarının tamamı betikle (`kaynakmetin.py`, `kmfark.py`, `kesik.py`) madde metninde aynen/normalleştirerek arandı; farklar karakter karakter çıkarıldı. 57'si kitapta bulunuyor (çoğunda yalnız paragraf sonları boşluğa çevrilmiş); 7'si aynen bulunmuyor (`konu_haritasi`, `namaz_farzlari`, `uc_cesit_haci`, `fikh_dort_kisim`, `imansiz_on_sebep`, `islamiyyetin_temeli`, `bidat_uc_tur`), nedenleri aşağıda.
- Rapor ve JSON'daki bütün kitap alıntıları betikle (`dogrula.py`) yeniden madde metninde arandı; hepsi kitapta var (birkaçında yalnız satır sonu tek boşluğa indirildi). `konu_haritasi` bulgularındaki alıntılar madde başlığıdır (fihrist).
- Sahîfe: madde metninde sahîfe işareti olmadığı için bulguların `sahife` alanı yalnız tek sahîfelik maddelerde dolduruldu, öteki bulgularda `null` (madde kimliği verildi).
- Sınırlar: Kitabın 1–16. sahîfeleri (önsöz, fihrist) veride yok; s. 11 ve s. 16'ya dayanan iki derleme denetlenemedi. Hükmün başka maddede de geçip geçmediği her satır için aranmadı; bulunamayanlar 'kesin değil' diye işaretlendi.

## Sayılar

- Bulgu: **175** — K (kitaba aykırı) **14**, D (dayanaksız) **30**, Y (yanıltıcı olabilir) **84**, B (biçim) **47**. Kesin olanlar: K 11, D 13, Y 52, B 45.
- Tablo hükümleri (64 tablo): doğru **18**, düzeltilmeli **43** (bunların 3'ünde içerik doğru, yalnız alıntı/atıf yanlış), kaldırılmalı **2**, denetlenemedi **1**; atlanan 1 (`kitabin_tanimlari`).
- 'Doğru' denen tablolarda her satır kitapta, aynı anlamda bulundu; yalnız imlâ/alıntı biçimi (B) bulguları olabilir.

## En önemli bulgular

1. **`oruc_turleri` (K):** Keffâret orucu 'vâcib' sütununa konmuş. Kitap: “2- Mu’ayyen zemânda olmıyan farz oruclar: Kazâ ve keffâret orucları böyledir. Fekat, keffâret orucları farz-ı amelîdir.” (1-79)
2. **`namaz_farzlari` (K):** Niyyet “Hangi namazı kıldığını bilmek” diye tarif edilmiş. Kitap: “Yalnız ilm, ya’nî ne yapacağını bilmek niyyet olmaz.” (1-64). Ayrıca 'Kitaptan' alıntısının son cümlesi kitapta yok (D).
3. **`namaz_bozanlar` (K):** “Abdesti bozulması — bozar” şartsız verilmiş. Kitap: “Teşehhüd mikdârı oturdukdan sonra yaparsa, nemâzı temâm olur. … abdesti kendiliğinden bozulursa, hemen gidip tâzeleyip, nemâzına devâm edebilir” (1-67).
4. **`necaset_turleri` (K):** Kaba necâsete “İnsan ve hayvan idrarı” yazılmış. Kitap: “Eti yinen dört ayaklı hayvanların bevli ve eti yinmiyen kuşların pisliği hafîfdir. Güvercin, serçe ve benzerleri gibi eti yinen kuşların pisliği temizdir.” (1-56)
5. **`sularin_hukmu` (K):** Müsta'mel su 'temiz ve temizleyici' sütununda. Kitap: “Müsta’mel su ve pis su … mutlak su değildir. Bunlar ile abdest ve gusl alınmaz.” (1-57). 'İki havuz' ölçüsü kitapta yok (kitap: büyük havuz / kulleteyn).
6. **`abdest_adimlari` (K):** Kelime-i şehâdet 'abdest sonunda, sünnet' denmiş; kitap bunu edeb sayıyor: “9 — Her uzvu yıkarken, kelime-i şehâdet okumakdır.” (1-52). 'Sağdan başlayarak' kitapta yok (D).
7. **`haram_helal_hayvanlar` (K/D):** Ehlî eşek 'Harâm' sütununda; kitap: “Ehlî eşek eti ve sütü tahrîmen mekrûhdur. Yalnız Mâlikî mezhebinde halâldir.” (2-41). Helâl sütunu (koyun, geyik, ceylan, hindi, bıldırcın, deve kuşu…) 2-41'de yok.
8. **`hadis_cesitleri` (K):** Mevkûf 'sahâbeye isnâd edilen sözler' diye tarif edilmiş; kitap: “Sahâbînin, Resûl-i ekremden … işitdim demeyip, böyle buyurmuş dediği hadîs-i şerîflerdir.” (2-6)
9. **`nafile_namazlar` (K/D, kaldırılmalı):** İşrak ve kuşluk iki ayrı nemâz yapılmış; kitap: “iki rek’at (İşrak nemâzı) kılmak sünnetdir. Bu nemâza (Kuşluk nemâzı) da denir.” (1-60). Evvâbîn '6-20' (kitap: “altı rek’at”); rek'at aralıkları ve dakîkalar kitapta yok.
10. **`haram_helal_yiyecekler` (kaldırılmalı):** Kaynak 2-42'nin içeriği (dört harâm içki; İmâm-ı a'zam ve Ebû Yûsüfe göre halâl dört içki) tabloda yok; çay, kahve, çekirge, süt-yumurta, 'putlar adına kesilen' kitapta bu yerde yok.
11. **`efali_mukellefin` (K):** Müstehab “Resûlullahın bazen yapıp bazen yapmadığı” diye tarif edilmiş; kitap bunu sünnet-i gayr-ı müekkedeye diyor (“Kendisi ara sıra terk etmiş ise, (Sünnet-i gayr-ı müekkede) denir.” 1-28).
12. **Mezheb kaydının düşmesi (Y, 20'den çok yerde):** abdestin farz/sünnetleri, abdesti bozan yedi şey, nikâh şâhidleri, kurbanın vâcibliği, fıtra nisâbı, altın nisâbı gramı, hacda mahrem şartı… Kitabın 'Hanefîde' dediği hükümler genel hüküm gibi verilmiş.
13. **Alıntı ('Kitaptan') sorunları:** 10 tabloda alıntı tablonun konusuyla ilgisiz bir paragraf (`tovbe_sartlari`, `gusul_gerektiren`, `gusul_adimlari`, `namaz_sunnetleri`, `oruc_bozanlar`, `nikah_sartlari`, `kurban_hukumleri`, `amel_uce_ayrilir`, `sunnet_tasnifi`, `kuran_bilgiler_uc`) (ör. `oruc_bozanlar`: Ramezânın fazîleti; `nikah_sartlari`: ehl-i kitâbla evlenme). 3 tabloda alıntıda kitapta olmayan cümle var ya da cümleler kırpılıp birleştirilmiş (`namaz_farzlari`, `fikh_dort_kisim`, `bidat_uc_tur`); `uc_cesit_haci`'nda 'umre' 'ömre'ye çevrilmiş.
14. **Atıf hataları:** `iman_sartlari` (altı şart 2-49'da sayılıyor, 1-24'te değil), `kuran_bilgiler_uc` (1-25, 1-26 değil), `efali_mukellefin` (tarifler 1-28/1-68), `nafile_namazlar` (satırların çoğu 1-60'ta değil).

## Tablo hükümleri çizelgesi

| # | Kimlik | Başlık | Tip | Atıf | Kaynak doğru mu | Hüküm | Bulgu (sınıf) |
|---|---|---|---|---|---|---|---|
| 1 | `konu_haritasi` | Konu Haritası | agac | — s.11 | denetlenemedi (s. 11 madde metni dışında) | **düzeltilmeli** | 5 (D1, Y4) |
| 2 | `tovbe_sartlari` | Tevbe Şartları | flowchart | 1-43 s.98 | kısmen (madde doğru; alıntı ilgisiz; bir adım 1-74’te) | **düzeltilmeli** | 4 (Y2, B2) |
| 3 | `iman_sartlari` | İmanın Altı Şartı (Âmentü) | tablo | 1-24 s.42 | hayır (sayım 2-49’da) | **düzeltilmeli** | 4 (D2, B2) |
| 4 | `islam_sartlari` | İslâm'ın Beş Şartı | tablo | 1-46 s.109 | evet | **düzeltilmeli** | 4 (Y3, B1) |
| 5 | `allahin_sifatlari` | Allahü Teâlânın Sıfatları | tablo | 1-46 s.103 | evet | **doğru** | 2 (B2) |
| 6 | `peygamber_sifatlari` | Peygamberlerin Sıfatları | tablo | 2-30 s.545 | evet | **düzeltilmeli** | 5 (D1, Y1, B3) |
| 7 | `namaz_rekatlari` | Beş Vakit Namazın Rekat Sayıları | tablo | 1-51 s.121 | evet | **doğru** | 1 (B1) |
| 8 | `abdest_adimlari` | Abdest Nasıl Alınır? | flowchart | 1-52 s.122 | evet | **düzeltilmeli** | 6 (K1, D1, Y3, B1) |
| 9 | `abdesti_bozanlar` | Abdesti Bozan Yedi Şey | liste | 1-52 s.125 | evet | **düzeltilmeli** | 3 (Y3) |
| 10 | `gusul_gerektiren` | Gusül Abdesti Gerektiren Durumlar | liste | 1-54 s.132 | kısmen (alıntı farzları anlatıyor) | **düzeltilmeli** | 2 (Y2) |
| 11 | `teyemmum_adimlari` | Teyemmüm Nasıl Alınır? | flowchart | 1-55 s.149 | evet | **düzeltilmeli** | 4 (Y3, B1) |
| 12 | `necaset_turleri` | Necâset (Pislik) Türleri | iki_liste | 1-56 s.154 | evet | **düzeltilmeli** | 6 (K1, D2, Y2, B1) |
| 13 | `namaz_farzlari` | Namazın Farzları (12 Farz) | tablo | 1-52 s.122 | kısmen (alıntıya kitapta olmayan cümle eklenmiş) | **düzeltilmeli** | 3 (K1, D1, B1) |
| 14 | `namaz_sunnetleri` | Namazın Sünnetleri | liste | 1-64 s.215 | kısmen (alıntı ilgisiz) | **düzeltilmeli** | 5 (D1, Y4) |
| 15 | `namaz_vacibleri` | Namazın Vâcibleri | liste | 1-66 s.227 | evet | **düzeltilmeli** | 5 (D1, Y3, B1) |
| 16 | `namaz_bozanlar` | Namazı Bozan Şeyler | liste | 1-67 s.231 | evet | **düzeltilmeli** | 5 (K1, Y3, B1) |
| 17 | `namaz_mekruhlari` | Namazda Mekruh Olan Şeyler | liste | 1-68 s.236 | evet | **düzeltilmeli** | 5 (K1, D1, Y2, B1) |
| 18 | `cuma_namazi` | Cuma Namazı Şartları ve Kılınışı | flowchart | 1-71 s.257 | evet | **düzeltilmeli** | 4 (Y2, B2) |
| 19 | `bayram_namazi` | Bayram Namazı Kılınışı | flowchart | 1-72 s.266 | evet | **doğru** | 1 (B1) |
| 20 | `zekat_nisab` | Zekât Nisâb Mikdârları | tablo | 1-78 s.296 | evet | **düzeltilmeli** | 2 (D1, Y1) |
| 21 | `zekat_kimlere_verilir` | Zekât Kimlere Verilir, Kimlere Verilmez? | iki_liste | 1-78 s.307 | evet | **düzeltilmeli** | 2 (Y1, B1) |
| 22 | `oruc_bozanlar` | Orucu Bozan ve Bozmayan Şeyler | iki_liste | 1-79 s.314 | kısmen (alıntı ilgisiz) | **düzeltilmeli** | 5 (D1, Y3, B1) |
| 23 | `oruc_turleri` | Oruç Türleri | tablo | 1-79 s.314 | evet | **düzeltilmeli** | 2 (K1, B1) |
| 24 | `hac_adimlari` | Hac Menâsiki (Adımlar) | flowchart | 1-84 s.343 | evet | **düzeltilmeli** | 5 (Y4, B1) |
| 25 | `umre_adimlari` | Umre Nasıl Yapılır? | flowchart | 1-84 s.339 | evet | **düzeltilmeli** | 3 (D2, Y1) |
| 26 | `mubarek_geceler` | Müslimânların On Mübârek Gecesi | tablo | 1-85 s.352 | evet | **doğru** | 1 (B1) |
| 27 | `haram_helal_hayvanlar` | Haram ve Helâl Hayvanlar | iki_liste | 2-41 s.619 | kısmen (helâl sütunu 2-41’de yok) | **düzeltilmeli** | 5 (K1, D3, Y1) |
| 28 | `haram_helal_yiyecekler` | Haram ve Helâl Yiyecek/İçecekler | iki_liste | 2-42 s.624 | hayır (2-42’nin içeriği tabloda yok) | **kaldırılmalı** | 5 (D3, Y1, B1) |
| 29 | `cenaze_namazi` | Cenaze Namazı Kılınışı | flowchart | 3-57 s.1000 | evet | **düzeltilmeli** | 3 (D2, Y1) |
| 30 | `kitabin_tanimlari` | Kitabın Kendi Tanımları | tanimlar | — s.17 | — | **atlandı (başka ajan)** | 0 (—) |
| 31 | `otuzuc_farz` | Otuzüç Farz | tablo | 1-51 s.121 | evet | **doğru** | 1 (B1) |
| 32 | `abdest_sunnetleri` | Abdestin Onsekiz Sünneti | liste | 1-52 s.122 | evet | **düzeltilmeli** | 4 (Y2, B2) |
| 33 | `teyemmum_yedi_hal` | Teyemmümün Câiz Olduğu Yedi Hâl | liste | 1-55 s.149 | evet | **düzeltilmeli** | 3 (Y2, B1) |
| 34 | `ezanin_kelimeleri` | Ezânın Yedi Kelimesi ve Mânâları | tablo | 1-62 s.209 | evet | **doğru** | 1 (B1) |
| 35 | `seferilik_kurallari` | Seferîlik (Yolculuk) Ahkâmı | flowchart | 1-65 s.221 | evet | **düzeltilmeli** | 1 (Y1) |
| 36 | `yemin_turleri` | Yemîn (And İçme) Türleri | agac | 1-83 s.334 | evet | **doğru** | 0 (—) |
| 37 | `uc_cesit_haci` | Üç Çeşit Hâcı | tablo | 1-84 s.339 | evet (alıntıda "umre" → "ömre") | **doğru** | 1 (B1) |
| 38 | `hac_sartlari` | Haccın Vücûb (8) ve Edâ (4) Şartları | iki_liste | 1-84 s.339 | evet | **düzeltilmeli** | 3 (Y3) |
| 39 | `ibadet_uc_kisim` | İbâdetlerin Üç Kısmı | tablo | 1-84 s.340 | evet | **düzeltilmeli** | 1 (Y1) |
| 40 | `dua_sartlari` | Duânın Kabûl Olmasının Beş Şartı | liste | 1-36 s.73 | evet | **doğru** | 1 (B1) |
| 41 | `vera_on_sart` | Tam Vera' Sâhibi Olmanın On Şartı | liste | 1-43 s.99 | evet | **doğru** | 0 (—) |
| 42 | `selam_hukumleri` | Selâm Vermenin Hükümleri | iki_liste | 1-90 s.363 | evet | **doğru** | 0 (—) |
| 43 | `tabi_olma_dereceleri` | Resûlullaha Tâbi' Olmanın Yedi Derecesi | liste | 1-30 s.53 | evet | **doğru** | 0 (—) |
| 44 | `fikh_dort_kisim` | Fıkh İlminin Dört Büyük Kısmı | agac | 2-16 s.437 | kısmen (alıntı kitapta yok) | **düzeltilmeli** | 1 (D1) |
| 45 | `imansiz_on_sebep` | Son Nefesde Îmânsız Gitmeğe Sebep On Şey | liste | 2-44 s.640 | evet | **düzeltilmeli** | 2 (Y1, B1) |
| 46 | `kefen_bilgisi` | Erkek ve Kadın Kefeni | iki_liste | 3-56 s.997 | evet | **doğru** | 0 (—) |
| 47 | `katl_turleri` | Beş Dürlü Katl ve Cezâları | tablo | 3-24 s.892 | evet | **düzeltilmeli** | 2 (Y1, B1) |
| 48 | `efali_mukellefin` | Ef'âl-i Mükellefîn (Sekiz Hüküm) | tablo | 1-1 s.18 | kısmen (tarifler 1-28 ve 1-68’den) | **düzeltilmeli** | 6 (K2, D1, Y1, B2) |
| 49 | `gusul_adimlari` | Gusül Abdesti Nasıl Alınır? | flowchart | 1-54 s.133 | kısmen (alıntı ilgisiz) | **düzeltilmeli** | 5 (Y4, B1) |
| 50 | `sularin_hukmu` | Suların Hükmü: Temiz ve Pis Sular | iki_liste | 1-57 s.160 | evet | **düzeltilmeli** | 6 (K2, D1, Y3) |
| 51 | `setr_avret` | Setr-i Avret (Örtünmesi Gereken Yerler) | tablo | 1-58 s.163 | evet | **düzeltilmeli** | 3 (Y2, B1) |
| 52 | `nikah_sartlari` | Nikâh (Evlenme) Ahkâmı | tablo | 2-34 s.571 | kısmen (alıntı ilgisiz) | **düzeltilmeli** | 2 (Y2) |
| 53 | `sadaka_fitr` | Sadaka-i Fıtr Hükümleri | tablo | 1-80 s.322 | evet | **düzeltilmeli** | 4 (Y3, B1) |
| 54 | `kurban_hukumleri` | Kurban Kesmenin Hükümleri | tablo | 1-81 s.325 | kısmen (alıntı ilgisiz) | **düzeltilmeli** | 4 (D1, Y3) |
| 55 | `hadis_cesitleri` | Hadîs-i Şerîf Çeşitleri | tablo | 2-6 s.422 | evet | **düzeltilmeli** | 5 (K1, Y3, B1) |
| 56 | `nafile_namazlar` | Nâfile (Tatavvu') Namazları | tablo | 1-60 s.183 | hayır (1-60’ta yalnız Evvâbîn) | **kaldırılmalı** | 5 (K2, D2, B1) |
| 57 | `islamiyyetin_temeli` | İslâmiyyetin Temeli Üçdür | tablo | — s.16 | denetlenemedi (s. 16 madde metni dışında) | **denetlenemedi** | 1 (D1) |
| 58 | `amel_uce_ayrilir` | Amel, Ya'nî İş Üçe Ayrılır | tablo | 1-1 s.18 | kısmen (alıntı ilgisiz) | **düzeltilmeli (yalnız alıntı)** | 1 (Y1) |
| 59 | `islam_bilgileri_ikiye` | İslâm Bilgileri İki Büyük Kısma Ayrılır | tablo | 1-11 s.25 | evet | **doğru** | 1 (B1) |
| 60 | `kuran_bilgiler_uc` | Kur'ân-ı Kerîmdeki Bilgiler Üç Kısmdır | tablo | 1-26 s.48 | hayır (kaynak 1-25) | **düzeltilmeli (yalnız atıf/alıntı)** | 1 (B1) |
| 61 | `kuran_ahkam_uc` | Kur'ân-ı Kerîmdeki Ahkâm Üç Kısmdır | tablo | 1-26 s.48 | evet | **doğru** | 0 (—) |
| 62 | `resulullah_yaptiklari` | Resûlullahın Yapdığı ve Kaçındığı Şeyler İki Kısmdır | tablo | 1-28 s.51 | evet | **doğru** | 0 (—) |
| 63 | `sunnet_tasnifi` | Sünnet Tasnîfi | tablo | 1-28 s.51 | kısmen (alıntı ilgisiz) | **düzeltilmeli (yalnız alıntı)** | 1 (Y1) |
| 64 | `kafirlerin_yaptiklari` | Kâfirlerin Yapdıkları ve Kullandıkları Şeyler İki Kısmdır | tablo | 1-29 s.52 | evet | **doğru** | 1 (B1) |
| 65 | `bidat_uc_tur` | Bid'at Üç Dürlüdür | tablo | 1-34 s.69 | evet (alıntı kırpılmış) | **doğru** | 1 (B1) |

## Ayrıntı: hükmü 'doğru' olmayan tablolar

Her bulgu: **kimlik** [sınıf, kesin/değil] — derleme / kitap / açıklama / öneri. Tam liste JSON'dadır.

### 1. `konu_haritasi` — Konu Haritası → düzeltilmeli

- **konu_haritasi / kaynakMetin** [D, kesin değil]
  - Derleme: (Se’âdet-i Ebediyye) kitâbında ikiyüzkırkbir [241] madde vardır. Kitâb üç kısma ayrılmışdır.
  - Kitap (—): bulunamadı
  - Alıntı 241 maddenin hiçbirinin metninde geçmiyor; gösterilen s. 11 madde metinlerinin dışında (önsöz/fihrist) kalıyor, veride yok, bu yüzden denetlenemedi. Sayılar (241 madde, 3 kısım) fihristle tutarlı. Öneri: PDF'in 11. sahîfesiyle karşılaştırılarak doğrulanmalı; doğrulanamazsa 'Kitaptan' etiketi kaldırılmalı.
- **konu_haritasi / hac / K2/M18** [Y, kesin]
  - Derleme: Hac ve Umre konusu altında: K2/M18 (Kabr ziyâreti lâzımdır. Olgun rûhlardan istifâde edilir)
  - Kitap (2-18): “Madde başlığı (fihrist): Kabr ziyâreti lâzımdır. Olgun rûhlardan istifâde edilir”
  - 2-18 kabr ziyâretini anlatıyor; metninde hac/umre bahsi yok (yalnız 'İbni Hacer' adı geçiyor). Hac konusuna konması dayanaksız. Öneri: Hac ve Umre'den kaldır (Cenaze konusunda zaten var).
- **konu_haritasi / zekat / K1/M83** [Y, kesin]
  - Derleme: Zekât, Kurban ve Adak konusu altında: K1/M83
  - Kitap (1-83): “Madde başlığı (fihrist): Yemîn nasıl edilir? Yemînin çeşidleri. Yemîn keffâreti”
  - Yemîn maddesi 'Zekât, Kurban ve Adak' başlığının kapsamına girmiyor; başlık içeriğe uymuyor. Öneri: Başlığı genişlet ya da maddeyi uygun konuya taşı.
- **konu_haritasi / iman / K2/M31, K2/M32, K2/M33, K3/M54** [Y, kesin değil]
  - Derleme: İman ve İtikat konusu altında atom/madde/hüceyre maddeleri
  - Kitap (2-31): “Madde başlığı (fihrist): Madde, atom üzerinde yeni bilgiler. Radyo-aktivite. Radar | Atom kuvveti ve sulh zemânında kullanılması | Atom bombası yapılması, te’sîri, korunma çâreleri | Madde üzerinde yeni bilgiler. Hüceyre, hayât, mikrop, zehr”
  - Bu maddelerin başlıkları fen bilgisi anlatıyor; 'İman ve İtikat' altında listelenmeleri başlıkla uyuşmuyor (kesin değil: metinlerde yer yer îmâna bağlanan cümleler olabilir). Öneri: Ayrı bir 'İslâm ve fen' konusuna al ya da kaldır.
- **konu_haritasi / ahlak / K2/M46** [Y, kesin değil]
  - Derleme: Ahlâk ve Tasavvuf konusu altında: K2/M46
  - Kitap (2-46): “Madde başlığı (fihrist): Hasta yemekleri. Ba’zı hastalıkların tedâvîsi”
  - Tıbbî madde 'Ahlâk ve Tasavvuf' başlığına uymuyor. Öneri: Konusunu gözden geçir.

### 2. `tovbe_sartlari` — Tevbe Şartları → düzeltilmeli

- **tovbe_sartlari / kaynakMetin** [Y, kesin]
  - Derleme: Peygamberlerin sonuncusu ve en yükseği olan Muhammed ... hergün, yetmiş kerre istigfâr ediyorum).
  - Kitap (1-43): “Yapılan günâhda, kul hakkı bulunmayıp, ... yalnız Allahü teâlâ ile kendi arasında olursa, böyle günâhlara tevbe etmek, pişmân olmakla, istigfâr okumakla, Allahü teâlâdan utanıp, sıkılıp, Ondan afv dilemekle olur. Farzlardan birini özrsüz terk etdi ise, tevbe için, bunlarla birlikde, o farzı da yapmak lâzımdır.”
  - Alıntı kitapta aynen var, ama tevbenin şartlarını değil, Resûlullahın istigfârını anlatıyor; tablonun dayandığı cümle hemen arkasındaki cümledir. Öneri: kaynakMetin'i kitaptaki şu cümleyle değiştir (aynen): 'Yapılan günâhda, kul hakkı bulunmayıp ... o farzı da yapmak lâzımdır.'.
- **tovbe_sartlari / adım 3 Günâhı Bırakmak** [Y, kesin]
  - Derleme: Günâhı Bırakmak — Yapılan günâhtan vazgeçmek
  - Kitap (1-74): “Tevbenin sahîh olması için dört şart vardır. Bunlar, pişmân olup, günâha devâm etmemek, bir dahâ yapmamağa karâr vermek, afv olması için düâ ve istigfâr etmek, Allah ve kul haklarını ödemekdir.”
  - Bu adım kaynak gösterilen 1-43'te yok; 1-74'te var. Aynı yerde sayılan 'bir dahâ yapmamağa karâr vermek' şartı tabloda hiç yok. Kitap burada 'dört şart' diyor, tablo beş adım veriyor. Öneri: 1-74'teki dört şartı aynen kullan ya da 'bir dahâ yapmamağa karâr vermek' adımını ekle; atfa 1-74'ü de koy.
- **tovbe_sartlari / adım 4 Kul Hakkı** [B, kesin]
  - Derleme: Kul Hakkı Varsa Helâlleşmek — hakkını ödemek veya helâllaşmak
  - Kitap (1-43): “Günâhda kul hakkı da varsa, buna tevbe için, kul hakkını hemen ödemek, onunla halâllaşmak, ona iyilik ve düâ etmek de lâzımdır.”
  - Anlam doğru; ancak kitap 'halâllaşmak' yazıyor (tabloda 'Helâlleşmek/helâllaşmak'), 'ona iyilik ve düâ etmek' eksik. Öneri: Kitabın cümlesini aynen kullan.
- **tovbe_sartlari / imlâ** [B, kesin]
  - Derleme: İstiğfâr, günâhtan, oruc/oruç
  - Kitap (1-43): “istigfâr ... günâhda”
  - Kitap 'istigfâr', 'günâhdan' yazar. Öneri: Kitabın imlâsına çevir.

### 3. `iman_sartlari` — İmanın Altı Şartı (Âmentü) → düzeltilmeli

- **iman_sartlari / kaynakMadde** [B, kesin]
  - Derleme: kaynakMadde 1-24, s. 42
  - Kitap (2-49): “Îmân sâhibi olmak için, altı şart vardır: 1- Allahü teâlâya inanmak, 2- Meleklere inanmak, 3- Kitâblara inanmak, 4- Peygamberlere “aleyhimüsselâm” inanmak, 5Âhırete (öldükden sonra, tekrâr dirilmeğe) inanmak, 6- Kazâ ve kaderin Allahü teâlâdan geldiğine inanmak.”
  - 1-24 yalnız birinci şartı anar ('Îmânın altı şartından birincisi...'). Altı şartın sayıldığı yer 2-49'dur (iki kez). Altı satırın adları ve sırası 2-49'la aynı. Öneri: Atfı 2-49'a çevir; kaynakMetin'i 2-49'daki cümleyle değiştir.
- **iman_sartlari / 2 Meleklerine îmân** [D, kesin]
  - Derleme: nûrdan yaratılmışlardır
  - Kitap (—): bulunamadı
  - Kitabın hiçbir maddesinde meleklerin 'nûrdan yaratıldığı' cümlesi bulunamadı. 1-46'daki melek tarifi: 'Allahü teâlânın kıymetli kullarıdır... Emr olunduklarını yaparlar. İsyân etmezler. Yimeleri, içmeleri yokdur. Evlenmezler...' Öneri: Kaldır ya da 1-46'daki tarifle değiştir.
- **iman_sartlari / 3 Kitaplarına îmân** [D, kesin değil]
  - Derleme: Kur'ân-ı kerîm sonuncusudur
  - Kitap (—): bulunamadı
  - 'Son kitâb' ifadesi kitapta bulunamadı (kesin değil: başka sözlerle geçiyor olabilir). Öneri: Kaldır ya da kitaptan bir dayanak bul.
- **iman_sartlari / imlâ** [B, kesin]
  - Derleme: Kitaplarına, Âhiret, Hazret-i Âdem, cennet
  - Kitap (1-46): “kitâblarına ... Âhıret ... hazret-i Âdem”
  - Kitap 'kitâb', 'âhıret' yazar. Öneri: Kitabın imlâsına çevir.

### 4. `islam_sartlari` — İslâm'ın Beş Şartı → düzeltilmeli

- **islam_sartlari / 3 Zekât vermek** [Y, kesin]
  - Derleme: Zengin olan müslimânın malının kırkda birini fakîrlere vermesi farzdır
  - Kitap (1-46): “İslâmın üçüncü şartı, malın zekâtını vermekdir. Zekât vermek, elbette lâzımdır. Zekâtı seve seve ve islâmiyyetin emr etdiği kimselere vermelidir.”
  - Kaynak maddede 'kırkda bir' yok; kitapta kırkda bir para ve ticâret malı için söylenir (1-78), hayvan ve toprak mahsûlünde başka ölçüler vardır. Her mala genellemek ve 'fakîrlere' demek eksik. Öneri: Kitabın cümlesiyle değiştir: 'malın zekâtını vermekdir ... islâmiyyetin emr etdiği kimselere vermelidir'.
- **islam_sartlari / 5 Hacca gitmek** [Y, kesin]
  - Derleme: Gücü yeten müslimânın ömründe bir kere Kâbe'yi ziyâret etmesi farzdır
  - Kitap (1-46): “İslâmın beşinci şartı hacdır [ömründe bir kerre, Mekke şehrine gidip, hac vazîfelerini yapmakdır]. Hac vazîfesinin şartları vardır.”
  - Kitap hacı 'Mekke şehrine gidip, hac vazîfelerini yapmak' diye tarif ediyor; 'Kâbe'yi ziyâret' haccı eksik anlatıyor. Öneri: Kitabın ifadesiyle değiştir.
- **islam_sartlari / 1 Kelime-i şehâdet** [Y, kesin değil]
  - Derleme: Îmân etmek, islâmın şartının birincisidir
  - Kitap (1-46): “Birincisi, Eşhedü en lâ ilâhe illallah ve eşhedü enne Muhammeden abdühu ve resûlüh, demek ve bunun ma’nâsına inanmakdır”
  - Kitapta birinci şart kelime-i şehâdeti söylemek ve ma'nâsına inanmak; tablodaki cümle kitapta bu sözle geçmiyor. Öneri: Kitabın ifadesiyle değiştir.
- **islam_sartlari / imlâ** [B, kesin]
  - Derleme: oruç, Kâbe'yi
  - Kitap (1-46): “oruc”
  - Kitap 'oruc' yazar (satır 4 açıklamasında 'oruç'). Öneri: Kitabın imlâsına çevir.

### 6. `peygamber_sifatlari` — Peygamberlerin Sıfatları → düzeltilmeli

- **peygamber_sifatlari / Fetânet** [B, kesin]
  - Derleme: Fetânet
  - Kitap (2-30): “Dahî hem nebîler hakkında bildim ismetü fitnet,”
  - Kitap (şiirde) 'fitnet' diyor; 'fetânet' kelimesi kitabın hiçbir yerinde geçmiyor. Öneri: 'Fitnet' yaz.
- **peygamber_sifatlari / Fetânet açıklaması** [D, kesin değil]
  - Derleme: Akıl ve zekâ bakımından bütün insanlardan üstündürler
  - Kitap (2-30): “Gadrle, zenbü humk ve kezbü ketmü hıyânetden, / münezzehdir, müberrâdır cemî’i Enbiyâullah.”
  - Kitap yalnız şiirde sıfatların adını ve zıdlarından (humk vb.) uzak olduklarını söylüyor; 'bütün insanlardan üstün' açıklaması bulunamadı. Öteki açıklamalar (doğru söz, güvenilir, bildirmek, günâhsız) şiirin ikinci beytindeki zıdlarla (kezb, hıyânet, ketm, zenb) ve 1-46'daki 'ma’sûm [ya’nî günâhsız] ve doğru sözlü' ifadesiyle karşılanıyor. Öneri: Açıklamayı kitabın beytine dayandır ya da kaldır.
- **peygamber_sifatlari / Nezâfet açıklaması** [Y, kesin]
  - Derleme: Kitapta peygamberlerin sıfatları arasında sayılır (s. 545)
  - Kitap (2-30): bulunamadı
  - Açıklama sütununda sıfatın anlamı yerine sitenin kendi notu var. Öneri: Öteki satırlar gibi doldur ya da boş bırak.
- **peygamber_sifatlari / Tebliğ, Günah** [B, kesin]
  - Derleme: Tebliğ, Günahsızlık, Günah işlemekden
  - Kitap (2-30): “sıdkla teblîgu hükmillah”
  - Kitap 'teblîg', 'günâh' yazar. Öneri: Kitabın imlâsına çevir.
- **peygamber_sifatlari / kaynakMetin** [B, kesin]
  - Derleme: Dahî hem nebîler hakkında bildim ismetü fitnet, nezâfet hem emânet, sıdkla teblîgu hükmillah.
  - Kitap (2-30): “Dahî hem nebîler hakkında bildim ismetü fitnet, / nezâfet hem emânet, sıdkla teblîgu hükmillah.”
  - Şiirin iki mısraı tek satıra birleştirilmiş (mısra ayrımı düşmüş). Öneri: Mısra ayrımını koru.

### 8. `abdest_adimlari` — Abdest Nasıl Alınır? → düzeltilmeli

- **abdest_adimlari / 12 Kelime-i Şehâdet** [K, kesin]
  - Derleme: Abdest sonunda şehâdet getirilir (sünnet)
  - Kitap (1-52): “Abdestin edeblerinden, (Halebî-yi sagîr)de bildirilenler şunlardır: ... 9 — Her uzvu yıkarken, kelime-i şehâdet okumakdır.”
  - Kitap bunu sünnet değil 'edeb' sayıyor ve 'edeb ... yapılmazsa hiç günâh olmayan şeyler' diye sünnetten ayırıyor; vakti de 'abdest sonunda' değil 'her uzvu yıkarken'. Öneri: 'Her uzvu yıkarken, kelime-i şehâdet okumakdır' (edeb) yaz.
- **abdest_adimlari / 7 ve 11 sağdan başlayarak** [D, kesin]
  - Derleme: Dirseklerle birlikde sağdan başlayarak yıkanır / Topuklarla birlikde sağdan başlayarak yıkanır
  - Kitap (1-52): bulunamadı
  - 1-52'de kolları ve ayakları sağdan başlayarak yıkamak bulunamadı (sağ el yalnız ağız/burun için anılıyor). Öneri: 'sağdan başlayarak' kısmını kaldır.
- **abdest_adimlari / 10 Boynu Mesh Et** [Y, kesin]
  - Derleme: Her iki elin dışıyla boyun mesh edilir (sünnet)
  - Kitap (1-52): “12 — Enseyi, üçer bitişik parmaklarla, bir kerre mesh etmek. ... Sonra, diğer üç parmakların dış yüzleri enseye konup, ensenin ortasından, iki tarafına doğru çekilerek mesh edilir.”
  - Kitap 'ense' diyor ve üç parmağın dış yüzüyle mesh edildiğini anlatıyor; 'boyun' ve 'iki elin dışı' kitabın ifadesi değil. Öneri: 'Enseyi, üçer bitişik parmaklarla, bir kerre mesh etmek' yaz.
- **abdest_adimlari / 1 Niyet Et** [Y, kesin]
  - Derleme: Abdest almağa kalben niyet edilir (sünnet) — ilk adım
  - Kitap (1-52): “15 — Hanefîde, yüzü yıkayacağı zemân, kalb ile niyyet etmek sünnetdir. ... [Şâfi’îde ve mâlikîde niyyet de farzdır.”
  - Kitap niyyetin vaktini 'yüzü yıkayacağı zemân' diye veriyor, tablo en başa koyuyor; Hanefîde sünnet, Şâfi'î ve Mâlikîde farz olduğu belirtilmemiş. Öneri: Niyyeti yüz yıkama adımına al; 'Hanefîde' kaydını ekle.
- **abdest_adimlari / mezheb** [Y, kesin]
  - Derleme: Başlıkta/adımlarda mezheb belirtilmemiş
  - Kitap (1-52): “Hanefî mezhebinde, abdestin farzı dörtdür”
  - Farz/sünnet ayrımı Hanefîye göre; kitap Şâfi'î ve Mâlikîde niyyet, tertîb, delk, muvâlâtın farz olduğunu ayrıca söylüyor. Öneri: Başlığa ya da açıklamaya 'Hanefî mezhebine göre' ekle.
- **abdest_adimlari / imlâ** [B, kesin]
  - Derleme: Niyet, kere, hilâllenir, dörtte
  - Kitap (1-52): “niyyet ... kerre ... tahlîl”
  - Kitap 'niyyet', 'kerre', 'tahlîl' yazar. Öneri: Kitabın imlâsına çevir.

### 9. `abdesti_bozanlar` — Abdesti Bozan Yedi Şey → düzeltilmeli

- **abdesti_bozanlar / başlık** [Y, kesin]
  - Derleme: Abdesti Bozan Yedi Şey
  - Kitap (1-52): “(Hanefî mezhebinde yedi şey, abdesti bozar:”
  - Kitap sayıyı Hanefî mezhebine bağlıyor; başlıkta mezheb düşmüş. Öneri: Başlığı 'Hanefî mezhebinde abdesti bozan yedi şey' yap.
- **abdesti_bozanlar / 3 deriden çıkan kan** [Y, kesin]
  - Derleme: Deriden çıkan kan, cerâhat, sarı su ... bozar
  - Kitap (1-52): “Üçüncüsü, deriden çıkan kan, cerâhat, sarı su, ağrılı çıkan renksiz su, hanefîde bozar. Bunların, mâlikîde ve şâfi’îde abdesti bozmadıkları, fârisî (Menâhic-ül-ibâd) kitâbında yazılıdır.”
  - Kitabın belirttiği mezheb farkı tabloda yok. Öneri: 'hanefîde bozar' kaydını ekle.
- **abdesti_bozanlar / 5 bayılmak** [Y, kesin değil]
  - Derleme: Bayılmak, deli olmak, sar'a tutmak
  - Kitap (1-52): “Beşincisi, bayılmak ve deli olmakla ve sar’a tutmakla bozulur. Yürürken sallanacak kadar serhoş olmak da bozar.”
  - Aynı maddede sayılan serhoşluk eksik. Öneri: 'Yürürken sallanacak kadar serhoş olmak da bozar' ekle.

### 10. `gusul_gerektiren` — Gusül Abdesti Gerektiren Durumlar → düzeltilmeli

- **gusul_gerektiren / kaynakMetin** [Y, kesin]
  - Derleme: Hanefî mezhebinde guslün farzı üçdür: 1 — Ağzın hepsini iyice yıkamak ...
  - Kitap (1-54): “Onbir dürlü gusl abdesti vardır: Beşi farzdır. Bunlardan ikisi, kadının hayz ve nifâsdan kurtulunca gusl abdesti almasıdır.”
  - Alıntı guslün farzlarını (ağız, burun, beden) anlatıyor; tablo ise guslü gerektiren hâlleri sayıyor. Tablonun dayanağı başka cümlelerdir. Beş satırın hepsi kitapta var ('Farz olan guslün üçüncüsü, cünüb ... Cünüb olmak üç dürlüdür: Haşefe ... menî, yerinden şehvetle kopup çıkınca veyâ ihtilâm ile'). Öneri: kaynakMetin'i 'Onbir dürlü gusl abdesti vardır: Beşi farzdır...' cümlesiyle değiştir.
- **gusul_gerektiren / başlık** [Y, kesin değil]
  - Derleme: Gusül Abdesti Gerektiren Durumlar (yalnız 5 farz)
  - Kitap (1-54): “Onbir dürlü gusl abdesti vardır: Beşi farzdır.”
  - Kitap onbir dürlü gusl sayıyor (farz, sünnet-i zevâid, vâcib-i kifâye, müstehab); tablo yalnız beş farzı veriyor, başlık bunu söylemiyor. Ayrıca kitap 'Gusül' değil 'Gusl' yazar. Öneri: Başlığı 'Farz olan gusller' yap.

### 11. `teyemmum_adimlari` — Teyemmüm Nasıl Alınır? → düzeltilmeli

- **teyemmum_adimlari / 2 Niyet Et** [Y, kesin]
  - Derleme: Niyet Et — FARZ işareti yok (yalnız yüz ve kollar FARZ diye işaretli)
  - Kitap (1-55): “Teyemmümün farzı üçdür: 1— Cenâbetden temizlenmek için veyâ abdestsizlikden temizlenmek için niyyet etmekdir.”
  - Kitap niyyeti teyemmümün üç farzından biri sayıyor; tablo onu farz diye işaretlemiyor. Öneri: 'Niyyet (FARZ)' yaz.
- **teyemmum_adimlari / 4 toprağa veya taşa** [Y, kesin]
  - Derleme: İki eli temiz toprağa veya taşa vurur
  - Kitap (1-55): “(Menâhic) kitâbında diyorki, (Şâfi’î ve Hanbelî mezheblerinde, teyemmüm yalnız toprakla yapılır. Hanefîde ve Mâlikîde ... temiz toprağa, taşa, toprak veyâ kireç sıvalı dıvara sürüp”
  - Kitabın belirttiği mezheb farkı düşmüş. Öneri: Hanefî/Mâlikî kaydını ekle.
- **teyemmum_adimlari / 7 Kolları Mesh Et** [Y, kesin değil]
  - Derleme: Sol elin içiyle sağ kolun dışını, sağ elin içiyle sol kolun dışını dirseklere kadar mesh eder
  - Kitap (1-55): “önce sol elin dört parmağı içi ile, sağ kolun alt yüzünü, parmak ucundan dirseğe doğru sığayıp sonra, sağ kolun iç yüzünü, sol avuç içi ile, dirsekden avuca kadar sığamakdır.”
  - Kolun iç yüzünün de sığanması düşmüş. Öneri: Kitabın tarifini aynen al.
- **teyemmum_adimlari / imlâ** [B, kesin]
  - Derleme: zirâ’, Niyet, kere, tekrar
  - Kitap (1-55): “zrâ’ ... niyyet”
  - Kitap 'zrâ’', 'niyyet' yazar. Öneri: Kitabın imlâsına çevir.

### 12. `necaset_turleri` — Necâset (Pislik) Türleri → düzeltilmeli

- **necaset_turleri / galîza 1 hayvan idrarı** [K, kesin]
  - Derleme: İnsan ve hayvan idrarı ve dışkısı (kaba necâset)
  - Kitap (1-56): “Eti yinen dört ayaklı hayvanların bevli ve eti yinmiyen kuşların pisliği hafîfdir. Güvercin, serçe ve benzerleri gibi eti yinen kuşların pisliği temizdir.”
  - Kitap her hayvan idrârını kaba saymıyor: eti yinen dört ayaklıların bevli hafîf, eti yinen kuşların pisliği temizdir. Satır, aynı tablonun hafîf sütunuyla da çelişiyor. Öneri: 'İnsandan çıkınca abdeste veyâ gusle sebeb olan herşey, eti yinmiyen hayvanların ... pisliği ve bevli' diye kitabın ifadesine çevir.
- **necaset_turleri / galîza 6 leş** [D, kesin]
  - Derleme: Hayvan leşi (balık ve çekirge hâriç)
  - Kitap (1-56): “ve şerâb, leş, domuz eti”
  - Kitap burada yalnız 'leş' diyor; 'balık ve çekirge hâriç' istisnası 1-56/1-57'de bulunamadı (1-57 akıcı kanı olmıyan hayvanların ve su hayvanlarının ölüsünün suyu necs etmediğini başka sözlerle söylüyor). Öneri: Parantezi kaldır ya da 1-57'deki kitap cümlesiyle değiştir.
- **necaset_turleri / galîza 8 menî** [Y, kesin]
  - Derleme: Menî (Şâfiî'de temizdir; Hanefî'de necistir)
  - Kitap (1-56): “Menî, mezy ve idrârdan sonra çıkan vedî ismindeki beyâz, bulanık, koyu sıvı, hanefî ve mâlikîde kaba necâsetdirler. Şâfi’îde yalnız menî, hanbelîde ise, her üçü de temizdir.”
  - Mezy ve vedî düşmüş; mâlikî ve hanbelî hükmü eksik. Kitap 'necis' değil 'kaba necâset' diyor. Öneri: Kitabın cümlesini aynen al.
- **necaset_turleri / galîza 7 domuz** [D, kesin değil]
  - Derleme: Domuz eti ve her parçası
  - Kitap (1-56): “şerâb, leş, domuz eti”
  - 've her parçası' 1-56'da yok. Öneri: 'Domuz eti' yaz.
- **necaset_turleri / kaynakMetin** [Y, kesin değil]
  - Derleme: 2 — Hafîf necâset: ...
  - Kitap (1-56): “NECÂSET İKİ DÜRLÜDÜR: 1 — Kaba necâset: İnsandan çıkınca abdeste veyâ gusle sebeb olan herşey,”
  - Alıntı yalnız hafîf necâseti kapsıyor; tablonun yarısını oluşturan kaba necâset tarifi alıntıda yok. Öneri: Alıntıyı 'NECÂSET İKİ DÜRLÜDÜR' cümlesinden başlat.
- **necaset_turleri / imlâ** [B, kesin]
  - Derleme: idrarı, Şarap, yenmeyen, necistir, Şâfiî
  - Kitap (1-56): “idrâr ... şerâb ... yinmiyen ... Şâfi’î”
  - Kitabın imlâsı farklı. Öneri: Kitabın imlâsına çevir.

### 13. `namaz_farzlari` — Namazın Farzları (12 Farz) → düzeltilmeli

- **namaz_farzlari / kaynakMetin** [D, kesin]
  - Derleme: ... Beş farz ise, nemâzın içindedir: Kıyâm, kırâat, rükû', secde ve ka'de-i ahîredir.
  - Kitap (1-52): “Nemâzın farzlarından beşi, nemâzın içindedir. Bu beş farzdan her birine (Rükn) de denir.”
  - 'Kitaptan' diye verilen alıntının son cümlesi kitapta yok; ilk cümleye bitiştirilmiş bir derleme cümlesi. Rüknlerin adları kitapta 1-64'te ayrı başlıklar hâlinde geçiyor. Öneri: Son cümleyi kaldır; kitabın 'Nemâzın farzlarından beşi, nemâzın içindedir' cümlesini koy.
- **namaz_farzlari / 6 Niyyet** [K, kesin]
  - Derleme: Hangi namazı kıldığını bilmek
  - Kitap (1-64): “Nemâza niyyet etmek demek, ismini, vaktini, kıbleyi, imâma uymağı irâde etmek, kalbinden geçirip, kılmağı tercîh etmek demekdir. Yalnız ilm, ya’nî ne yapacağını bilmek niyyet olmaz.”
  - Kitap niyyetin 'bilmek' olmadığını açıkça söylüyor; tablo niyyeti tam da 'bilmek' diye tarif ediyor. Öneri: 'ismini, vaktini, kıbleyi, imâma uymağı irâde etmek, kalbinden geçirip, kılmağı tercîh etmek' yaz.
- **namaz_farzlari / imlâ** [B, kesin]
  - Derleme: Hadesten, Necâsetten, Vakit, namaz, rükün, teşehhüd mikdârı
  - Kitap (1-52): “Hadesden tahâret, necâsetden tahâret, setr-i avret, istikbâl-i kıble, vakt, niyyet, tahrîme tekbîri. ... Bu beş farzdan her birine (Rükn) de denir.”
  - Kitabın imlâsı ve ifadesi farklı. Öneri: Kitabın imlâsına çevir.

### 14. `namaz_sunnetleri` — Namazın Sünnetleri → düzeltilmeli

- **namaz_sunnetleri / kaynakMetin** [Y, kesin]
  - Derleme: İbâdetler yapılırken, yalnız ağız ile söylemeğe niyyet denmez. ...
  - Kitap (1-64): “Ayakda iken, sağ eli, sol el üzerine koyup, sağ elin küçük ve baş parmaklarını, sol bilek etrâfına halka yapmak, Sübhâneke okumak ve yalnız kılarken, Sübhâneke okudukdan sonra E’ûzü, Besmele okumak sünnetdir.”
  - Alıntı niyyetin ağızla değil kalble olduğunu anlatıyor; sünnetleri sayan bir yer değil. Öneri: kaynakMetin'i kitaptaki bu cümleyle değiştir.
- **namaz_sunnetleri / 1, 4, 5, 7, 8** [D, kesin değil]
  - Derleme: Tekbîr alırken elleri kaldırmak; âmîn demek; rükû'da/secdede üç kere tesbîh; son oturuşta salevât (hepsi 'sünnet')
  - Kitap (1-64): “Rükü’da, en az, üç kerre (Sübhâne rabbiyel-azîm) der. ... Secdede en az üç kerre (Sübhâne rabbiyel-a’lâ) denir.”
  - 1-64 bu işleri anlatıyor ama 'sünnetdir' hükmünü bu satırlar için açıkça vermiyor; son oturuşta salevât için hüküm bulunamadı (kesin değil: başka maddede geçiyor olabilir). Öneri: Hükmü kitapta bulunamayan satırları ya çıkar ya da kitaptaki yerini göster.
- **namaz_sunnetleri / 9 Selâm** [Y, kesin]
  - Derleme: Selâmı sağdan ve soldan vermek (sünnet)
  - Kitap (1-66): “nemâz sonunda esselâmü... demek, kunût düâsı okumak, ... vâcibdir.”
  - Kitap nemâzı selâmla bitirmeyi vâcib sayıyor (aynı sitenin vâcibler tablosunda da öyle). İki yana vermenin sünnetliği bulunamadı; satır, okuyucuda selâmın sünnet olduğu izlenimini bırakabilir. Öneri: 'Selâm vermek vâcibdir' kaydını ekle ya da satırı kaldır.
- **namaz_sunnetleri / 6 semi'allahü** [Y, kesin değil]
  - Derleme: Rükû'dan kalkınca semi'allahü limen hamideh demek
  - Kitap (1-64): “Rükü’dan kalkarken (Semi’allahü limen hamideh) demek, imâma ve yalnız kılana sünnetdir. Cemâ’at bunu söylemez.”
  - 'imâma ve yalnız kılana' kaydı ve 'cemâ’at bunu söylemez' düşmüş. Öneri: Kitabın cümlesini aynen al.
- **namaz_sunnetleri / 3 Eûzü-besmele** [Y, kesin değil]
  - Derleme: Eûzü-besmele çekmek
  - Kitap (1-64): “yalnız kılarken, Sübhâneke okudukdan sonra E’ûzü, Besmele okumak sünnetdir.”
  - 'yalnız kılarken' kaydı düşmüş. Öneri: Kaydı ekle.

### 15. `namaz_vacibleri` — Namazın Vâcibleri → düzeltilmeli

- **namaz_vacibleri / 6 Ettehıyyâtü** [Y, kesin değil]
  - Derleme: İlk ve son oturuşta Ettehiyyâtü okumak
  - Kitap (1-66): “ikinci rek’atde teşehhüd mikdârı oturmak, son rek’atde otururken, (Ettehıyyâtü) okumak”
  - 1-66 Ettehıyyâtü okumayı son oturuş için sayıyor; ilk oturuşta okumanın vâcib olduğu bu listede yok (kesin değil: başka yerde geçebilir). Öneri: Kitabın ifadesine göre düzelt.
- **namaz_vacibleri / 8 ta'dîl-i erkân** [D, kesin değil]
  - Derleme: Rükünleri ta'dîl-i erkân ile yapmak (Ebû Yûsuf'a göre farz)
  - Kitap (1-66): “rükü’da ve iki secdede ta’dîl-i erkân, [ya’nî sübhânallah diyecek kadar hareketsiz durmak vâcib, dahâ çok durmak sünnetdir], kavmede ve celsede tumânînet”
  - 'Ebû Yûsuf'a göre farz' kaydı 1-66'da yok; kitapta bu görüşü bildiren cümle bulunamadı. Öneri: Parantezi kaldır.
- **namaz_vacibleri / 9 ve 11** [Y, kesin]
  - Derleme: Secde-i tilâvet ...; Bayram namazlarında zâid tekbîrleri söylemek
  - Kitap (1-66): bulunamadı
  - Bunlar 1-66'nın 'nemâzın vâcibleri' sayımında yok: secde-i tilâvet aynı maddede ayrı bir konu, bayram tekbîrlerinin vâcibliği 1-66'da geçmiyor (1-72'de de 'zâid tekbîr vâcib' cümlesi bulunamadı). Öneri: Başka maddeden geldiklerini belirt ya da çıkar.
- **namaz_vacibleri / eksikler** [Y, kesin]
  - Derleme: (listede yok)
  - Kitap (1-66): “secdeleri birbiri ardınca yapmak, ... kavmede ve celsede tumânînet ..., imâmın, sabâh, Cum’a, bayram, terâvîh, vitr nemâzlarında ve akşam ile yatsının ilk iki rek’atinde yüksek sesle okuması, imâmın ve yalnız kılanın öğle ve ikindi farzlarında ... hafîf sesle okumaları vâcibdir.”
  - Kitabın saydığı vâciblerden secdelerin ardarda yapılması, kavme/celse tumânîneti, cehrî/hafî okuma tabloda yok. Öneri: Eksikleri kitaptan ekle.
- **namaz_vacibleri / kaynakMetin** [B, kesin değil]
  - Derleme: ... ta’dîl-i erkân, [ya’nî sübhânallah diyecek kadar hareketsiz durmak
  - Kitap (1-66): “[ya’nî sübhânallah diyecek kadar hareketsiz durmak vâcib, dahâ çok durmak sünnetdir]”
  - Alıntı açılmış köşeli parantezin ortasında kesilmiş. Öneri: Cümle sonuna kadar al.

### 16. `namaz_bozanlar` — Namazı Bozan Şeyler → düzeltilmeli

- **namaz_bozanlar / 8 Abdesti bozulması** [K, kesin]
  - Derleme: Abdesti bozulması — bozar
  - Kitap (1-67): “Son rek’atde teşehhüd mikdârı oturmadan önce yaparsa, nemâzı hemen bozulur. Teşehhüd mikdârı oturdukdan sonra yaparsa, nemâzı temâm olur. Teşehhüd mikdârı oturmadan evvel, abdesti kendiliğinden bozulursa, hemen gidip tâzeleyip, nemâzına devâm edebilir ise de, başdan kılması efdaldir.”
  - Kitap abdestin bozulmasını şarta bağlıyor (kendisi mi bozdu, kendiliğinden mi bozuldu; teşehhüd mikdârı oturmadan önce mi sonra mı). Şartsız 'bozar' hükmü kitaba aykırı. Öneri: Kitabın 22. maddesini aynen al.
- **namaz_bozanlar / 2 selâm** [Y, kesin]
  - Derleme: Namazdakine selâm vermek ve selâmı almak
  - Kitap (1-67): “Başkasının selâmına, her sûret ile cevâb söylemek bozar.”
  - Kitap selâma cevâb vermeyi bozan sayıyor; 'namazdakine selâm vermek' ifadesi kitapta yok ve selâm verenin nemâzı bozulur gibi anlaşılabiliyor. Öneri: 'Başkasının selâmına, her sûret ile cevâb söylemek bozar' yaz.
- **namaz_bozanlar / 6 öh öh, of of** [Y, kesin değil]
  - Derleme: Dünyâ işi için öh öh, of of demek
  - Kitap (1-67): “4 — Ah, of gibi inlemek bozar. 5 — Uf diye sıkıntıyı bildirmek bozar.”
  - 'Dünyâ işi için' kaydı kitapta bu maddelerde yok. Öneri: Kitabın ifadesini al.
- **namaz_bozanlar / eksik** [Y, kesin]
  - Derleme: 8 madde
  - Kitap (1-67): “Nemâzın müfsidlerinden otuzbir adedini aşağıda bildiriyoruz:”
  - Kitap otuzbir müfsid sayıyor; tablo sekizini veriyor ve bunu belirtmiyor (boğazdan ses çıkarmak, âmîn demek, Kur'âna bakıp okumak, necs yerde secde, avret açılması, rükn terki, yanlış okumak vb. yok). Öneri: Başlığa 'ba’zıları' ekle ya da eksikleri tamamla.
- **namaz_bozanlar / imlâ** [B, kesin]
  - Derleme: Namazda, Namazdakine
  - Kitap (1-67): “Nemâzı bozan şeyler”
  - Kitap 'nemâz' yazar. Öneri: Kitabın imlâsına çevir.

### 17. `namaz_mekruhlari` — Namazda Mekruh Olan Şeyler → düzeltilmeli

- **namaz_mekruhlari / 7 Esnemek** [K, kesin değil]
  - Derleme: Esnerken ağzını açık bırakmak — tenzîhen mekrûh
  - Kitap (1-68): “Nemâzda ve nemâz hâricinde ağzını açarak esnemek mekrûhdur.”
  - Kitap 'mekrûh' diyor ve aynı maddenin başında 'Yalnız mekrûh denildiği zemân (Tahrîmen mekrûh) demekdir' kaidesini koyuyor; tablo 'tenzîhen' yazıyor. Öneri: Sınıfını 'mekrûh' (tahrîmen) yap.
- **namaz_mekruhlari / 5 Bağdaş** [D, kesin]
  - Derleme: Bağdaş kurarak oturmak (özürsüz) — tahrîmen mekrûh
  - Kitap (1-68): “Teşehhüdlerde, sünnete uygun oturmamak, tenzîhen mekrûhdur. Özrü varsa, mekrûh olmaz.”
  - Kitabın mekrûhlar listesinde bağdaş kurmak geçmiyor (bağdaş yalnız hastanın oturuşu olarak 1-64'te anılıyor). En yakın madde 'sünnete uygun oturmamak' ve o da tenzîhen mekrûh. Öneri: Kaldır ya da 43. maddeyi aynen al.
- **namaz_mekruhlari / 9 Secdede kollar** [Y, kesin]
  - Derleme: Secdede kollarını yere yayarak yatırmak
  - Kitap (1-68): “Secdede, erkeklerin kollarını yere döşemesi mekrûhdur. Kadınlar ise, kollarını yere yaymalıdır.”
  - Hüküm erkeklere mahsûs; kadınlar için tersi emr ediliyor. Kayıt düşmüş. Öneri: 'erkeklerin' kaydını ekle.
- **namaz_mekruhlari / eksik** [Y, kesin değil]
  - Derleme: 11 madde
  - Kitap (1-68): “45 — Farzdan sonra son sünnete hemen kalkmamak mekrûhdur.”
  - Kitap 45 mekrûh sayıyor; tablo 11'ini veriyor ve bunu belirtmiyor. Öneri: Başlığa 'ba’zıları' ekle.
- **namaz_mekruhlari / imlâ** [B, kesin]
  - Derleme: Namazda Mekruh, özürsüz, rek'atte
  - Kitap (1-68): “Nemâzın mekrûhları ... özrsüz ... rek’atde”
  - Kitap 'nemâz', 'mekrûh', 'özrsüz' yazar. Öneri: Kitabın imlâsına çevir.

### 18. `cuma_namazi` — Cuma Namazı Şartları ve Kılınışı → düzeltilmeli

- **cuma_namazi / Vücûb Şartları** [Y, kesin]
  - Derleme: Erkek, hür, mukim, sağlıklı olmak
  - Kitap (1-71): “Cum’a nemâzının (Vücûb şartları) dokuzdur. ... 1- Şehrde, kasabada oturmakdır. ... 2Sağlam olmakdır. ... 3- Hür olmakdır. ... 4- Erkek olmakdır. ... 5- Âkıl ve bâlig olmakdır. 6- Kör olmamakdır. ... 7- Yürüyebilmekdir. ... 8- Mahbûs olmamak ve düşman korkusu ... olmamakdır. 9- Çok yağmur, kar, fırtına, çamur olmamakdır.”
  - Kitap dokuz vücûb şartı sayıyor; tablo dördünü veriyor. 'mukim' yerine kitap 'Şehrde, kasabada oturmak' diyor. Öneri: Dokuz şartı kitaptan aynen al.
- **cuma_namazi / Sıhhat Şartları** [B, kesin]
  - Derleme: Sıhhat Şartları
  - Kitap (1-71): “Edâ şartları yedidir:”
  - Kitap 'Edâ şartları' diyor (yedi şart); tablodaki ad kitabın ifadesi değil, hutbe ile ilgili iki şart birleştirilmiş. Öneri: 'Edâ şartları' yaz.
- **cuma_namazi / kılınış** [Y, kesin]
  - Derleme: İlk sünnet, hutbe, farz, son sünnet, zühr-i âhir (14 rek'at)
  - Kitap (1-71): “Sonra, dört rek’at (son sünneti), bundan sonra, dört rek’at (üzerime farz olan, kılmadığım son öğle nemâzını kılmağa) diye niyyet ederek, âhır zuhur nemâzı kılınır. Bundan sonra, iki rek’at (vaktin sünneti) kılınır.”
  - Kitap Cum'a nemâzını 'onaltı rek’at' diye veriyor; tabloda son iki rek'at 'vaktin sünneti' yok, toplam 14'te kalıyor. Öneri: '2 Rek'at Vaktin Sünneti' adımını ekle.
- **cuma_namazi / imlâ** [B, kesin]
  - Derleme: Cuma Namazı, şehirde, mukim, cemâat, Zühr-i Âhir
  - Kitap (1-71): “Cum’a nemâzı ... şehrde ... cemâ’at ... âhır zuhur”
  - Kitabın imlâsı farklı. Öneri: Kitabın imlâsına çevir.

### 20. `zekat_nisab` — Zekât Nisâb Mikdârları → düzeltilmeli

- **zekat_nisab / mezheb** [Y, kesin değil]
  - Derleme: Altın 20 miskal (96 gram); Gümüş 672 gram
  - Kitap (1-78): “Bir miskal, mâlikîde üçbuçuk [3,456] gram ve hanefîde, dört gram ve seksen santigram [4,80 gr.] ağırlığında olmakdadır. O hâlde, altının nisâbı, [96] gramdır.”
  - Gram karşılıkları Hanefî ölçüsüne göre; kitap şâfi'î ve hanbelîde yirmi miskalin 69 gram olduğunu ayrıca bildiriyor. Tabloda mezheb kaydı yok. Sayılar kitapla aynı. Öneri: 'Hanefîde' kaydını ekle.
- **zekat_nisab / Sığır terimleri** [D, kesin değil]
  - Derleme: tabî' ; müsinne
  - Kitap (1-78): “Otuz sığır için bir aded, bir yaşını aşmış erkek veyâ dişi buzağı verilir. ... Kırkdan ellidokuza kadar sığırı olan, bir aded, iki yaşını bitirmiş, erkek veyâ dişi dana verir.”
  - 'Tabî'' ve 'müsinne' terimleri kitapta geçmiyor; sayılar ve yaşlar kitapla aynı. Öneri: Parantez içi terimleri kaldır.

### 21. `zekat_kimlere_verilir` — Zekât Kimlere Verilir, Kimlere Verilmez? → düzeltilmeli

- **zekat_kimlere_verilir / verilmez 4 karı-koca** [Y, kesin]
  - Derleme: Karı-koca birbirine verilmez
  - Kitap (1-78): “Zevceye de zekât verilmez. İmâm-ı a’zam buyurdu ki, kadın da, fakîr olan zevcine zekât veremez. İmâmeyn ise, fakîr zevcine zekât verir dediler.”
  - Kadının zevcine vermesinde kitabın bildirdiği ihtilâf (İmâmeyn: verir) düşmüş. Öneri: Kitabın cümlelerini aynen al.
- **zekat_kimlere_verilir / imlâ** [B, kesin]
  - Derleme: Verilmeyecek, toplıyan
  - Kitap (1-78): “Zimmîye, ya’nî gayr-i müslim vatandaşa zekât verilmez.”
  - Küçük imlâ farkları. Öneri: Kitabın imlâsına çevir.

### 22. `oruc_bozanlar` — Orucu Bozan ve Bozmayan Şeyler → düzeltilmeli

- **oruc_bozanlar / kaynakMetin** [Y, kesin]
  - Derleme: İmâm-ı Rabbânî ... (Ramezân-ı şerîf ayında yapılan nâfile nemâz ... Cehennemden âzâd olur.
  - Kitap (1-79): “ORUCU BOZMAYAN ŞEYLER — Ramezân-ı şerîfde veyâ kazâ, keffâret, adak ve nâfile oruclarda, oruclu olduğunu unutarak yise, içse, cimâ’ etse, oruclu iken uykuda cünüb olsa, ...”
  - Alıntı Ramezânın fazîletini anlatıyor; orucu bozan/bozmayan şeylerle ilgisi yok. Öneri: kaynakMetin'i 'ORUCU BOZMAYAN ŞEYLER — ...' paragrafıyla değiştir.
- **oruc_bozanlar / bozanlar 9 bayılmak** [D, kesin]
  - Derleme: Bayılıp bütün gün kendine gelmemek
  - Kitap (1-79): bulunamadı
  - 1-79'da bayılmanın orucu bozduğuna dair cümle bulunamadı. Öneri: Kaldır ya da kitapta yerini göster.
- **oruc_bozanlar / bozmayanlar 4 kusma** [Y, kesin]
  - Derleme: Ağız dolusu olmıyan kusma
  - Kitap (1-79): “istemiyerek ağız dolusu kussa, zorlıyarak biraz kussa”
  - Kitap istemiyerek ağız dolusu kusmanın da bozmadığını söylüyor; tablo 'ağız dolusu olmıyan' diyerek bunu dışarıda bırakıyor (ve bozanlardaki 'bilerek' ile karışıyor). Öneri: Kitabın ifadesini aynen al.
- **oruc_bozanlar / bozmayanlar 7 suya girmek** [Y, kesin]
  - Derleme: Serinlemek için suya girmek
  - Kitap (1-79): “serinlemek için yıkanmak bozmazlar ise de, tenzîhen mekrûhdurlar.”
  - Kitabın 'tenzîhen mekrûh' kaydı düşmüş. Öneri: Kaydı ekle.
- **oruc_bozanlar / imlâ** [B, kesin]
  - Derleme: nohut, bozmayalar (anahtar), Cinsî münâsebet
  - Kitap (1-79): “nohud ... cimâ’”
  - Kitap 'nohud', 'cimâ’' yazar; liste anahtarı 'bozmayalar' yazım hatalı. Öneri: Kitabın imlâsına çevir.

### 23. `oruc_turleri` — Oruç Türleri → düzeltilmeli

- **oruc_turleri / 2 ve 4 keffâret orucu** [K, kesin]
  - Derleme: Mu'ayyen olmıyan farz: Ramezân kazâsı ... / Gayr-i mu'ayyen vâcib: adak ve keffâret orucu; oruç keffâreti, yemîn keffâreti orucu
  - Kitap (1-79): “2- Mu’ayyen zemânda olmıyan farz oruclar: Kazâ ve keffâret orucları böyledir. Fekat, keffâret orucları farz-ı amelîdir.”
  - Kitap keffâret oruclarını farz (farz-ı amelî) sayıyor; tablo keffâreti farzdan çıkarıp vâcib sütununa koymuş. Kitabın 4. maddesi yalnız 'Herhangi bir veyâ birkaç gün oruc adamak' diyor. Öneri: Keffâreti 2. satıra al; 4. satırı 'Herhangi bir veyâ birkaç gün oruc adamak gibi' yap.
- **oruc_turleri / imlâ** [B, kesin]
  - Derleme: Oruç Türleri, oruç
  - Kitap (1-79): “SEKİZ DÜRLÜ ORUC VARDIR”
  - Kitap 'oruc' yazar. Öneri: Kitabın imlâsına çevir.

### 24. `hac_adimlari` — Hac Menâsiki (Adımlar) → düzeltilmeli

- **hac_adimlari / Ziyaret Tavafı (FARZ) 7 şavt** [Y, kesin]
  - Derleme: Ziyaret Tavafı (FARZ) — 7 şavt, haccın 3. farzı
  - Kitap (1-84): “Tavâf, Mescid-i harâm içinde, Kâ’be-i mu’azzama etrâfında dönmek demekdir. Dördü farz, üçü vâcib olmak üzere yedi kerre dönülür.”
  - Kitap yedi şavtın dördünü farz, üçünü vâcib sayıyor (vâcib 7: 'Tavâf-i ziyâretde ... dörtden sonra üç kerre dahâ dönmekdir'). Tablo yediyi birden farz gösteriyor. Öneri: 'Dördü farz, üçü vâcib' kaydını ekle.
- **hac_adimlari / Müzdelife (VÂCİB) geceleme** [Y, kesin]
  - Derleme: Müzdelife Vakfesi (VÂCİB) — Arafat'tan sonra geceleme
  - Kitap (1-84): “22 — Müzdelife vakfesi ve bu vakfeyi sabâh nemâzı vaktinde yapmak vâcibdir.”
  - Kitabın vâcib saydığı şey vakfe ve onun sabâh nemâzı vaktinde yapılması; 'geceleme' ifadesi kitabın vâcib tarifine uymuyor. Öneri: Kitabın ifadesini al.
- **hac_adimlari / Vedâ Tavafı (VÂCİB)** [Y, kesin değil]
  - Derleme: Mekke'den ayrılmadan son tavaf
  - Kitap (1-84): “5 — (Âfâkî) olan, ya’nî Mîkât denilen yerlerden dahâ uzak memleketlerin hâcıları, ... (Tavâf-ı vedâ) yapmakdır. Hayzlı kadına bu tavâf vâcib değildir.”
  - Vâcibliğin âfâkîlere mahsûs olduğu ve hayzlı kadının muaf olduğu düşmüş. Öneri: Kaydı ekle.
- **hac_adimlari / etiketsiz vâcibler** [Y, kesin değil]
  - Derleme: Şeytan Taşlama, Kurban Kesme, Tıraş Olma (hüküm etiketi yok)
  - Kitap (1-84): “3 — Şeytân taşlamak ... 4 — İhrâmdan çıkmadan önce, başın en az dörtde birini ustura ile traş etdirmek ... 19 — Kırân ve temettü’ hac yapan, şükr kurbanı kesmekdir.”
  - Kitap bunları da vâcib sayıyor; tablo sa'y ve Müzdelifeyi VÂCİB diye işaretleyip bunları işaretsiz bırakıyor. Öneri: Hepsine 'VÂCİB' işareti koy.
- **hac_adimlari / imlâ** [B, kesin]
  - Derleme: Mina, Arafat, Şeytan, Tıraş, Ziyaret Tavafı, niyet
  - Kitap (1-84): “Minâ ... Arafât ... Şeytân ... traş ... Tavâf-ı ziyâret ... niyyet”
  - Kitabın imlâsı farklı. Öneri: Kitabın imlâsına çevir.

### 25. `umre_adimlari` — Umre Nasıl Yapılır? → düzeltilmeli

- **umre_adimlari / FARZ/VÂCİB etiketleri** [D, kesin değil]
  - Derleme: Umre Tavafı (FARZ); Sa'y (VÂCİB)
  - Kitap (1-84): “Umre, hac zemânı olan beş günden başka, senenin her günü, ihrâm ile yapılan, tavâf ve sa’y yapmak ve saç kazımak veyâ kesmekdir. Umre, ömründe bir kerre, hanefî ve mâlikîde müekked sünnet, şâfi’î ve hanbelîde farzdır.”
  - 1-84 umrenin rükn/vâcib ayrımını vermiyor; etiketler hac hükümlerinden kıyasla konmuş görünüyor (kesin değil). Öneri: Etiketleri kaldır ya da kitapta dayanağını göster.
- **umre_adimlari / Tavaf Namazı** [D, kesin değil]
  - Derleme: Makâm-ı İbrâhîm arkasında 2 rek'at namaz kılınır
  - Kitap (1-84): “15 — Her tavâfdan sonra, (Mescid-i harâm) içinde iki rek’at nemâz kılmakdır.”
  - Kitap 'Mescid-i harâm içinde' diyor; 'Makâm-ı İbrâhîm arkasında' kaydı bulunamadı. Öneri: Kitabın ifadesini al.
- **umre_adimlari / mezheb** [Y, kesin değil]
  - Derleme: (umrenin hükmü yok)
  - Kitap (1-84): “Umre, ömründe bir kerre, hanefî ve mâlikîde müekked sünnet, şâfi’î ve hanbelîde farzdır.”
  - Kitabın kaynak cümlesindeki mezheb farkı tabloda hiç yok. Öneri: Kaydı ekle.

### 27. `haram_helal_hayvanlar` — Haram ve Helâl Hayvanlar → düzeltilmeli

- **haram_helal_hayvanlar / helâl sütunu** [D, kesin]
  - Derleme: Koyun, keçi, sığır, manda; Deve; Geyik, ceylan, dağ keçisi; Tavuk, hindi, kaz, ördek; Güvercin, serçe, bıldırcın; Deve kuşu
  - Kitap (2-41): bulunamadı
  - Kaynak madde 2-41 bu hayvanların helâlliğini saymıyor (2-41'de helâl diye anılanlar: yabânî eşek, at, tavşan, balık). Ceylan, hindi, bıldırcın, deve kuşu kitabın hiçbir maddesinde bulunamadı. Satırlar sitenin kendi derlemesi. Öneri: Kitapta geçmeyen satırları kaldır; 2-41'deki 'Yabânî eşek eti ve sütü halâldir ... At eti ve sütü temizdir, halâldir ... Tavşan eti halâldir' cümlelerini kullan.
- **haram_helal_hayvanlar / helâl 6 balık** [D, kesin]
  - Derleme: Pul ve solungaçlı balıklar (Hanefî'de yalnız balık câiz)
  - Kitap (2-41): “Avlanılan, yakalanan her balığı yimek halâl olduğu, Mâide sûresinde bildirilmekdedir. Su içinde kendiliğinden ölüp, karnı üst tarafda duran balık yinmez.”
  - 'Pul ve solungaç' ölçüsü kitapta yok. Öneri: Kitabın cümlesini aynen al.
- **haram_helal_hayvanlar / harâm 7 ehlî eşek** [K, kesin]
  - Derleme: Harâm Hayvanlar sütununda: Ehlî eşek (eti ve sütü tahrîmen mekrûhdur; yaban eşeği helâldir)
  - Kitap (2-41): “Ehlî eşek eti ve sütü tahrîmen mekrûhdur. Yalnız Mâlikî mezhebinde halâldir.”
  - Kitap ehlî eşeğe harâm değil tahrîmen mekrûh diyor; 'Harâm' sütununa konması sınıfı değiştiriyor. Mâlikî kaydı düşmüş. Öneri: Ayrı 'tahrîmen mekrûh' satırı yap; mâlikî kaydını ekle.
- **haram_helal_hayvanlar / harâm 4-5** [D, kesin değil]
  - Derleme: Kartal, şahin, akbaba ...; Kedi
  - Kitap (2-41): “Avını köpek dişi ile veyâ pençesi ile yakalayan hayvanın etini yimek harâmdır.”
  - Kitap genel ölçüyü veriyor; tek tek adlar (kartal, şahin, akbaba, kedi, aslan, kaplan, ayı, çakal, tilki) 2-41'de geçmiyor. Öneri: Kitabın genel cümlesini kullan.
- **haram_helal_hayvanlar / mezheb** [Y, kesin değil]
  - Derleme: (helâl/harâm genel hüküm)
  - Kitap (2-41): “Şâfi’î mezhebinde Besmelesiz kesileni yimek de câizdir. Mâlikî mezhebinde, Besmelesi unutulan da yinmez.”
  - Kitabın bu maddede andığı mezheb farkları tabloda yok. Öneri: Kaydı ekle.

### 28. `haram_helal_yiyecekler` — Haram ve Helâl Yiyecek/İçecekler → kaldırılmalı

- **haram_helal_yiyecekler / kaynakMadde ve içerik** [Y, kesin]
  - Derleme: Kaynak 2-42 (içkiler); tablo genel yiyecek listesi
  - Kitap (2-42): “İçmesi harâm olan içkiler, dörtdür: ... İçmesi, İmâm-ı a’zama ve İmâm-ı Ebû Yûsüfe göre halâl olan içkiler de dörtdür:”
  - 2-42'nin asıl içeriği olan dört harâm içki (şerâb, tılâ, seker, kuru üzüm nakî'i) ve İmâm-ı a'zam ile Ebû Yûsüfe göre halâl dört içki (nebîz vb.) tabloda yok; tablo maddenin anlatmadığı genel bir listeye dönüşmüş. Öneri: Tabloyu 2-42'deki iki dörtlü listeye göre yeniden kur.
- **haram_helal_yiyecekler / helâl 4-6, 8** [D, kesin]
  - Derleme: Çekirge (öldükten sonra da yenebilir); Süt, yumurta, bal, tereyağı; Sebze, meyve, tahıllar, baklagiller; Çay, kahve, su, meyve suyu
  - Kitap (2-42): bulunamadı
  - Bu satırların hiçbiri 2-41/2-42'de yok; 'çekirge', 'kahve' kitapta hiç geçmiyor. Öneri: Kaldır.
- **haram_helal_yiyecekler / helâl 3 balık** [D, kesin değil]
  - Derleme: ağ, sepet, zehir veya suyun çekilmesi ile ölen balık helâldir
  - Kitap (2-41): “Ağ ile, saçma ile, ilâc ile, sarsıntı ile ölen her balık yinir.”
  - 'sepet' ve 'suyun çekilmesi' kitapta yok; 'saçma', 'sarsıntı' düşmüş. Öneri: Kitabın cümlesini aynen al.
- **haram_helal_yiyecekler / harâm 6 putlar** [D, kesin]
  - Derleme: Putlar adına kesilen hayvan
  - Kitap (2-41): bulunamadı
  - 2-41/2-42'de bu hüküm bulunamadı. Öneri: Kaldır ya da kitaptaki yerini göster.
- **haram_helal_yiyecekler / imlâ** [B, kesin]
  - Derleme: Müslüman, Şarap, öldükten, sarhoş
  - Kitap (2-42): “müslimân ... şerâb ... serhoş”
  - Kitap 'müslimân', 'şerâb', 'serhoş' yazar. Öneri: Kitabın imlâsına çevir.

### 29. `cenaze_namazi` — Cenaze Namazı Kılınışı → düzeltilmeli

- **cenaze_namazi / 3. Tekbîr düâ metni** [D, kesin değil]
  - Derleme: cenâze düâsı okunur (Allahümmagfir lihayyinâ ve meyyitinâ...)
  - Kitap (3-57): “[Cenâze düâsı yerine, Rabbenâ âti-nâ..., veyâ yalnız Allahüm-magfir leh demek veyâhud düâ niyyeti ile besmelesiz Fâtiha-i şerîfe okumak da olur.”
  - Tablodaki düâ metni kitapta bulunamadı; kitap başka seçenekler sayıyor. Öneri: Parantezi kaldır ya da kitabın seçeneklerini yaz.
- **cenaze_namazi / Niyet Edilir** [D, kesin değil]
  - Derleme: Allah rızası için cenaze namazı kılmaya ve meyyit için düâ etmeye niyet edilir
  - Kitap (3-57): “Selâm verirken, cenâzeye ve cemâ’ate niyyet edilir.”
  - 3-57'de nemâza başlarken yapılacak niyyetin sözleri bulunamadı. Öneri: Kitapta dayanağı yoksa kaldır.
- **cenaze_namazi / Cenâze Konur** [Y, kesin değil]
  - Derleme: Cenâze kıbleye doğru konur, imâm göğsü hizasında durur
  - Kitap (3-57): “Cenâzenin başı, imâmın sağına, ayağı soluna gelecekdir. Tersine koymak günâhdır. ... İmâm, cenâzenin göğsü hizâsında durur.”
  - 'kıbleye doğru' belirsiz; kitabın baş-ayak yönü kaydı yok. Öneri: Kitabın cümlelerini aynen al.

### 32. `abdest_sunnetleri` — Abdestin Onsekiz Sünneti → düzeltilmeli

- **abdest_sunnetleri / 5** [B, kesin]
  - Derleme: Kaşların, sakalın altındaki görünmeyen deriyi ıslatmak
  - Kitap (1-52): “5 — Kaşların, sakalın, bıyığın altındaki görünmiyen deriyi ıslatmak sünnetdir, farz değildir.”
  - 'bıyığın' düşmüş. Öneri: Kitabın cümlesini aynen al.
- **abdest_sunnetleri / 9 misvâk** [Y, kesin değil]
  - Derleme: Dişleri birşey ile oğmak, temizlemek (misvâk)
  - Kitap (1-52): “9 — Dişleri, birşey ile oğmak, temizlemek. ... 13 — Ağzı yıkarken, dişleri (Misvâk) ile temizlemekdir.”
  - Kitap sünnetler listesinde misvâk demiyor; misvâkı edebler arasında (13. edeb) sayıyor. Parantez eki iki ayrı hükmü karıştırıyor. Öneri: Parantezi kaldır.
- **abdest_sunnetleri / 15 niyyet** [Y, kesin]
  - Derleme: Yüzü yıkayacağı zemân kalb ile niyyet etmek
  - Kitap (1-52): “15 — Hanefîde, yüzü yıkayacağı zemân, kalb ile niyyet etmek sünnetdir.”
  - 'Hanefîde' kaydı düşmüş; kitap aynı yerde Şâfi'î ve Mâlikîde niyyetin farz olduğunu söylüyor. 16 (tertîb: şâfi'îde farz) ve 17-18 (delk, muvâlât: mâlikîde farz) için de mezheb kaydı düşmüş. Öneri: Kitaptaki mezheb kayıtlarını ekle.
- **abdest_sunnetleri / kaynakMetin** [B, kesin]
  - Derleme: 2 — Elleri, bilekleri ile berâber
  - Kitap (1-52): “2 — Elleri, bilekleri ile beraber, üç kerre yıkamak.”
  - Alıntıda kitapta olmayan şapka eklenmiş ('berâber'); satır sonları birleştirilmiş. Öneri: Alıntıyı aynen düzelt.

### 33. `teyemmum_yedi_hal` — Teyemmümün Câiz Olduğu Yedi Hâl → düzeltilmeli

- **teyemmum_yedi_hal / 5 düşman** [Y, kesin]
  - Derleme: Su yakın ise de yanında düşman, yırtıcı hayvan, ateş veya nöbetçi varsa teyemmüm eder
  - Kitap (1-55): “teyemmüm ederek kılar ise de, bu sebebler kul tarafından oldukları için, gusl ve abdest alınca, bu nemâzları tekrâr kılması lâzımdır.”
  - Kitabın aynı maddede söylediği 'nemâzları tekrâr kılması lâzımdır' kaydı düşmüş; ayrıca mahbûs olmak ve tehdîd hâlleri eksik. Öneri: Kaydı ekle.
- **teyemmum_yedi_hal / 4 soğuk** [Y, kesin değil]
  - Derleme: Gusl abdesti alınca soğukdan ölmek veya hasta olmak tehlikesi varsa teyemmüm eder
  - Kitap (1-55): “4 — Gusl abdesti alınca, soğukdan ölmek veyâ hasta olmak tehlükesi varsa, şehrde dahî olsa, hamâm parası yoksa ve başka çâre bulamazsa, gusl abdesti için teyemmüm eder ve su ile abdest alır.”
  - 'hamâm parası yoksa ve başka çâre bulamazsa' şartı ve 'su ile abdest alır' kaydı düşmüş. Öneri: Kitabın cümlesini aynen al.
- **teyemmum_yedi_hal / kaynakMetin** [B, kesin]
  - Derleme: girmeden önce sahîh değildir. Abdest ve gusl için ...
  - Kitap (1-55): “Teyemmüm, hanefîde, vakt girmeden önce de sahîhdir. Diğer üç mezhebde, vakt girmeden önce sahîh değildir.”
  - Alıntı cümle ortasından başlıyor. Öneri: Alıntıyı 'Abdest ve gusl için su bulamamak...' cümlesinden başlat.

### 35. `seferilik_kurallari` — Seferîlik (Yolculuk) Ahkâmı → düzeltilmeli

- **seferilik_kurallari / Orucu Bozabilir ve mezheb** [Y, kesin değil]
  - Derleme: Yolculukda orucu bozup sonra kazâ edebilirsin; Üç günlük (104 km)
  - Kitap (1-65): “Orucunu bozabilir. Kurban kesmesi vâcib olmaz. Müsâfir râhat ise, orucunu bozmamalıdır.”
  - Kitabın 'râhat ise, orucunu bozmamalıdır' kaydı düşmüş; 104 km Hanefî ölçüsü olup kitap şâfi'î, mâlikî ve hanbelîde mesâfenin 'seksen kilometre altıyüzkırk metre' olduğunu ayrıca bildiriyor. Öneri: Kayıtları ekle.

### 38. `hac_sartlari` — Haccın Vücûb (8) ve Edâ (4) Şartları → düzeltilmeli

- **hac_sartlari / vücûb 2** [Y, kesin]
  - Derleme: 2. Haccın farz olduğunu işitmek
  - Kitap (1-84): “2 — Kâfir memleketinde olanın, haccın farz olduğunu işitmesi.”
  - Şartın 'kâfir memleketinde olan' için olduğu kaydı düşmüş. Öneri: Kitabın cümlesini aynen al.
- **hac_sartlari / edâ 3 mahrem** [Y, kesin]
  - Derleme: 3. Kadının yanında mahrem akrabâsı bulunmak
  - Kitap (1-84): “3 — Mekkeden üç gün üç gecelik uzak yerlerde bulunan hür kadının hacca gidebilmesi için, üç mezhebde, zevcinin veyâ ... mahrem akrabâsından ... bir erkeğin berâber gitmesi lâzımdır. ... Şâfi’î mezhebinde, mahremsiz olarak, iki kadın ile, farz olan hacca gidebilir.”
  - Mesâfe şartı ve şâfi'î farkı düşmüş; ayrıca kitabın 'zevci' de saydığı yok. Öneri: Kitabın cümlesini aynen al.
- **hac_sartlari / başlık** [Y, kesin değil]
  - Derleme: Haccın Vücûb (8) ... Şartları
  - Kitap (1-84): “A — Vücûb şartları, İmâm-ı a’zama göre, sekizdir:”
  - 'İmâm-ı a’zama göre' kaydı düşmüş. Öneri: Kaydı ekle.

### 39. `ibadet_uc_kisim` — İbâdetlerin Üç Kısmı → düzeltilmeli

- **ibadet_uc_kisim / 3 hac vekâleti** [Y, kesin]
  - Derleme: Beden kısmı başkasına verilebilir (bedel hac)
  - Kitap (1-84): “Bir kimse hayâtda iken, ancak devâmlı özrü olduğu zemân, bunun emri ve malı ile yerine başkası hac yapabilir.”
  - Kitabın 'ancak devâmlı özrü olduğu zemân, emri ve malı ile' şartı düşmüş; 'beden kısmı başkasına verilebilir' ifadesi kitapta yok. Öneri: Kitabın cümlesini aynen al.

### 44. `fikh_dort_kisim` — Fıkh İlminin Dört Büyük Kısmı → düzeltilmeli

- **fikh_dort_kisim / kaynakMetin** [D, kesin]
  - Derleme: Fıkh ilmi, ya'nî ahkâm-ı islâmiyye, dört büyük kısma ayrılır: I — (İbâdât): Nemâz, oruc, zekât, hac ve bunlar gibi Allahü teâlâya karşı yapılan vazîfelerdir. II — (Münâkehât): Evlenme, boşanma gibi hukûk-ı âile. III — (Mu'âmelât): Alış-veriş, kirâlama gibi ekonomi. IV — (Ukûbât): Cezâ kanunları.
  - Kitap (2-16): “Fıkh ilmi, ya’nî (Ahkâm-ı islâmiyye), dört büyük kısma ayrılır: 1 — (İbâdât) olup beşe ayrılır: Nemâz, oruc, zekât, hac, cihâd.”
  - 'Kitaptan' diye gösterilen alıntı kitapta yok; ilk cümleden sonrası sitenin yazdığı bir özet ('hukûk-ı âile', 'ekonomi', 'Cezâ kanunları' ifadeleri kitapta geçmiyor). Ağaçtaki dört dal ise kitapla aynı. Öneri: Alıntıyı kitaptaki cümlelerle değiştir.

### 45. `imansiz_on_sebep` — Son Nefesde Îmânsız Gitmeğe Sebep On Şey → düzeltilmeli

- **imansiz_on_sebep / kaynakMetin** [B, kesin]
  - Derleme: isâl yazmak fâideli görüldü: (On şey, ... 5- ... şükretmemek
  - Kitap (2-44): “birkaç misâl yazmak fâideli görüldü: (On şey, son nefesde îmânsız gitmeğe sebeb olur: ... 5- Allahü teâlâya ve iyilik gelmesine sebeb olanlara şükr etmemek,”
  - Alıntı kelime ortasından ('isâl') başlıyor; 'şükr etmemek' bitişik yazılmış, bu yüzden alıntı kitapta aynen bulunmuyor. Öneri: Alıntıyı kitaptaki sınırlarla ve yazımla düzelt.
- **imansiz_on_sebep / 9** [Y, kesin değil]
  - Derleme: Dînine bağlı olan müslimânları aşağı görmek
  - Kitap (2-44): “9- Dînine bağlı olan müslimânları aşağı görmek. Bunlara gerici gibi şeyler söylemek,”
  - Maddenin devamı ('Bunlara gerici gibi şeyler söylemek') düşmüş. Öneri: Kitabın maddesini tam al.

### 47. `katl_turleri` — Beş Dürlü Katl ve Cezâları → düzeltilmeli

- **katl_turleri / 1 Amd diyet** [Y, kesin]
  - Derleme: Diyet: Velîler affederse
  - Kitap (3-24): “Maktûlün velîlerinden biri afv ederse veyâ velî ile kâtil, belli bir mal, para ile uyuşurlarsa, kısâs yapılmaz. Uyuşulan mal alınır.”
  - Kitap afv ile mal üzerine uyuşmayı ayrı ayrı sayıyor; afvda mal alınmaz. 'Velîler affederse diyet' ifadesi kitabın söylediğini karıştırıyor; kitap burada 'diyet' kelimesini de kullanmıyor. Öneri: 'afv ederse kısâs düşer; mal ile uyuşurlarsa uyuşulan mal alınır' anlamında kitabın cümlesini al.
- **katl_turleri / imlâ** [B, kesin]
  - Derleme: Amd (kasıtlı), Şibh-i amd, Hatâya sebep
  - Kitap (3-24): “Amden ... şebehe olan ... Hatâya sebeb olan”
  - Kitap 'şebeh', 'sebeb' yazar. Öneri: Kitabın imlâsına çevir.

### 48. `efali_mukellefin` — Ef'âl-i Mükellefîn (Sekiz Hüküm) → düzeltilmeli

- **efali_mukellefin / kaynakMadde** [B, kesin]
  - Derleme: kaynakMadde 1-1 (bütün tanımlar)
  - Kitap (1-28): “Açık olmayıp, zan ederek anlaşılan emrlerine (Vâcib) denir. Farz veyâ vâcib olmayıp, Resûlullahın “sallallahü teâlâ aleyhi ve sellem” kendiliğinden emr etdiği veyâ yapdığı ibâdetlere (Sünnet) denir.”
  - 1-1 yalnız sekizin adlarını ve farz, harâm, sünnet, mekrûh, mubâh tarifini veriyor. Tablodaki farz/vâcib/sünnet tarifleri 1-28'den, mekrûh tarifi 1-68'den ('delîlinden zan ile anlaşılan yasaklardır') alınmış. Öneri: Atıflara 1-28 ve 1-68'i ekle.
- **efali_mukellefin / Müstehab** [K, kesin değil]
  - Derleme: Resûlullahın bazen yapıp bazen yapmadığı ibâdetler.
  - Kitap (1-28): “Kendisi ara sıra terk etmiş ise, (Sünnet-i gayr-ı müekkede) denir.”
  - Kitap 'ara sıra terk edilen' ibâdete sünnet-i gayr-ı müekkede diyor; müstehabı ise 'Edeb, burada yapılması sevâb olup, yapılmazsa hiç günâh olmayan şeyler demekdir ... Edeblere, mendûb ve müstehab da denir' (1-52) diye tarif ediyor. Tablodaki tarif kitapta sünnetin bir çeşidine aittir. Öneri: 1-52'deki tarifi aynen al.
- **efali_mukellefin / Müstehab örnek** [K, kesin değil]
  - Derleme: Kuşluk namazı, pazartesi-perşembe orucu
  - Kitap (1-60): “Duhâ vakti olunca, iki rek’at (İşrak nemâzı) kılmak sünnetdir. Bu nemâza (Kuşluk nemâzı) da denir.”
  - Kitap kuşluk nemâzına (bu yerde) sünnet diyor. Pazartesi-perşembe orucu kitapta bulunamadı. Öneri: Örnekleri kitaptan seç.
- **efali_mukellefin / Müfsid** [D, kesin değil]
  - Derleme: Başlanmış bir ibâdeti bozan şeyler.
  - Kitap (—): bulunamadı
  - Kitap 'müfsid' kelimesini kullanıyor ama bir tarifini veren cümle bulunamadı. Öneri: Tarifi kitaptan bul ya da kaldır.
- **efali_mukellefin / Mekrûh** [Y, kesin değil]
  - Derleme: Yasak olduğu, açık olmayıp, zan ile anlaşılan işler.
  - Kitap (1-1): “Onun beğenmediği şeylere ve ibâdetin sevâbını gideren şeylere (Mekrûh) denir.”
  - Kaynak madde 1-1'deki mekrûh tarifi farklı; tablodaki tarif 1-68'de yalnız 'tahrîmen mekrûh' için verilmiş, tenzîhen mekrûh ayrıca tarif ediliyor. Öneri: 1-1'deki tarifi koy ya da tahrîmen/tenzîhen ayrımını ekle.
- **efali_mukellefin / imlâ** [B, kesin]
  - Derleme: Helâl diyen, namaz, oruç, emr ettiği, yaptığı
  - Kitap (1-46): “Günâha, ya’nî harâma halâl diyen kâfir olur.”
  - Kitap 'halâl', 'nemâz', 'etdiği' yazar. Öneri: Kitabın imlâsına çevir.

### 49. `gusul_adimlari` — Gusül Abdesti Nasıl Alınır? → düzeltilmeli

- **gusul_adimlari / kaynakMetin** [Y, kesin]
  - Derleme: Necâset ile nemâz kılar. Çünki, harâmdan kaçmak, farzı yapmakdan dahâ çok sevâbdır. ...
  - Kitap (1-54): “Sünnet üzere gusl abdesti almak için, önce, temiz olsalar dahî, iki eli ve avret yerini yıkamalıdır. Sonra bedeninde necâset varsa yıkamalı, sonra, tam bir abdest almalı, yüzünü yıkarken, gusle niyyet etmeli, ayakları altında su toplanmıyorsa, ayakları da yıkamalıdır. Sonra bütün bedene üç def’a su dökmelidir. Önce üç def’a başa, sonra sağ omuza, sonra sol omuza dökmeli, her döküşde, o taraf temâm ıslanmalıdır. Birinci dökmede oğmalıdır.”
  - Alıntı, tenhâ yer bulamıyanın necâsetle nemâz kılmasıyla başlıyor; guslün nasıl alınacağını anlatan paragraf değil. Öneri: kaynakMetin'i 'Sünnet üzere gusl abdesti almak için...' paragrafıyla değiştir.
- **gusul_adimlari / 1 Niyet Et** [Y, kesin]
  - Derleme: Niyet Et (ilk adım)
  - Kitap (1-54): “sonra, tam bir abdest almalı, yüzünü yıkarken, gusle niyyet etmeli”
  - Kitap niyyeti abdest içinde yüz yıkanırken söylüyor; tablo en başa koyuyor. Öneri: Niyyeti abdest adımına taşı.
- **gusul_adimlari / 2 Elleri Yıka** [Y, kesin]
  - Derleme: Elleri bileklere kadar üç kere yıka
  - Kitap (1-54): “önce, temiz olsalar dahî, iki eli ve avret yerini yıkamalıdır.”
  - Avret yerini yıkamak düşmüş; 'üç kere' bu yerde yok. Öneri: Kitabın cümlesini aynen al.
- **gusul_adimlari / 4 Abdest Al** [Y, kesin]
  - Derleme: Namaz abdesti gibi tam abdest alınır (ayaklar dâhil)
  - Kitap (1-54): “ayakları altında su toplanmıyorsa, ayakları da yıkamalıdır.”
  - Kitap ayakları şarta bağlıyor; tablo şartı düşürüp kesin hüküm veriyor. Öneri: Şartı ekle.
- **gusul_adimlari / imlâ** [B, kesin]
  - Derleme: Gusül, Niyet, Namaz, kere, hayızdan
  - Kitap (1-54): “gusl ... niyyet ... def’a ... hayzdan”
  - Kitap 'gusl', 'niyyet', 'nemâz', 'hayz' yazar. Öneri: Kitabın imlâsına çevir.

### 50. `sularin_hukmu` — Suların Hükmü: Temiz ve Pis Sular → düzeltilmeli

- **sularin_hukmu / temiz 7 müsta'mel su** [K, kesin]
  - Derleme: Müsta'mel su (abdest/guslde kullanılmış su): temizdir — 'Temiz ve Temizleyici Sular' sütununda
  - Kitap (1-57): “Müsta’mel su ve pis su ve çiçek suyu, üzüm suyu gibi, cinsi, sıfatı da söylenen sular mutlak su değildir. Bunlar ile abdest ve gusl alınmaz.”
  - Kitap müsta'mel suyu temizleyici saymıyor; ayrıca '(Mâ-i müsta’mel) ... yıkanan uzvdan ayrılınca necs olur. Ba’zı âlimlere göre, başka uzva, elbiseye, yere düşdükden sonra necs olur' diyor. 'Temiz ve temizleyici' sütununa konması kitaba aykırı. Öneri: Bu sütundan çıkar; kitabın iki cümlesini aynen ver.
- **sularin_hukmu / temiz 4 ve pis 2 'iki havuz'** [K, kesin]
  - Derleme: durgun su (iki havuz büyüklüğünde ise) / Küçük havuzda (iki havuzdan az) necâset bulaşan su
  - Kitap (1-57): “Eni on zrâ’ [4,8 metre], boyu da on zrâ’ olan kare şeklindeki havuza (büyük havuz) denir ki, sathı [alanı] yüz zrâ’ kare, ya’nî yirmiüç metre karedir.”
  - Kitapta 'iki havuz' diye bir ölçü yok; hanefîde ölçü 'büyük havuz' (on zrâ'ya on zrâ'), şâfi'îde 'kulleteyn'dir. 'İki havuz' büyük olasılıkla 'kulleteyn' (iki kulle) ile karıştırılmış. Öneri: 'büyük havuz' / 'küçük havuz' yaz; şâfi'î için kulleteyn kaydını kitaptan ekle.
- **sularin_hukmu / temiz 6 tuz** [Y, kesin]
  - Derleme: Toprak veya tuz ile bulanıklaşan su (temiz ve temizleyici)
  - Kitap (1-57): “Doymuş tuz eriyikleri ile abdest ve gusl câiz değildir.”
  - Kitap tuzlu suda abdesti sınırlıyor; toprakla bulanmış su için bu maddede açık hüküm bulunamadı. Öneri: Satırı kaldır ya da kitabın cümlesiyle sınırla.
- **sularin_hukmu / temiz 1 dolu** [D, kesin değil]
  - Derleme: Yağmur, kar ve dolu suyu
  - Kitap (1-57): “Yağmur, dere, nehr, kaynak, kuyu, deniz ve kar suları, mutlak sudur.”
  - Kitap 'dolu' saymıyor. Öneri: 'dolu'yu çıkar.
- **sularin_hukmu / pis 4 leş** [Y, kesin]
  - Derleme: İçine leş düşüp kokan su
  - Kitap (1-57): “Hanefîde, küçük havuza, şâfi’îde ise, kulleteynden az olan suya, az necâset düşerse, üç sıfatı değişmese de, necs olur. ... Uzun zemân durmakla üç sıfatı değişen su, pis olmaz.”
  - Kitap küçük havuz için kokma şartı aramıyor (sıfat değişmese de necs); büyük/akar suda ise eseri görülmeyen taraf temizdir. Akıcı kanı olmıyan hayvan ve su hayvanı ölüsünü de ayırıyor. 'Kokan' şartı hükmü yanlış daraltıyor. Öneri: Kitabın cümlelerini aynen al.
- **sularin_hukmu / pis 3 artık** [Y, kesin değil]
  - Derleme: Köpek, domuz ve yırtıcı hayvan artığı su
  - Kitap (1-57): “Domuzun, köpeğin ve yırtıcı hayvânların ve henüz fâre yiyen kedinin artıkları ... kaba necâsetdir. ... Mâlikî mezhebinde domuz ve köpek temizdir.”
  - Kitabın andığı mâlikî farkı ve fâre yiyen kedi düşmüş. Öneri: Kitabın cümlesini aynen al.

### 51. `setr_avret` — Setr-i Avret (Örtünmesi Gereken Yerler) → düzeltilmeli

- **setr_avret / 4 Yabancı kadına bakma** [Y, kesin]
  - Derleme: Yüz ve ellere zaruret olmadan bakmak câiz değildir
  - Kitap (1-58): “Erkeklerin yabancı kadının yüzünden ve avuçlarının içinden ve dışından başka yerine bakmaları dört mezhebde de harâmdır. Kızların yüzlerine şehvet ile bakmaları da harâmdır.”
  - Kitabın asıl hükmü (yüz ve avuçlar dışına bakmak dört mezhebde harâm) satırda yok; yüz ve avuçlar için kitap şehvet kaydı koyuyor ve başka yerde 'lüzûmsuz olarak şehvetsiz bakmak mekrûhdur' diyor. 'Zaruret olmadan câiz değildir' ifadesi kitabın ayrımını kaybediyor. Öneri: Kitabın iki cümlesini aynen al.
- **setr_avret / 2 Kadın, kendi cinsine karşı** [Y, kesin değil]
  - Derleme: Göbekten diz altına kadar
  - Kitap (1-58): “Kadınların birbirlerine avret yeri, erkeğin erkeğe avret yeri gibidir. ... Gayr-ı müslim ve mürted kadınların ... müslimân kadınlarına bakması, ya’nî müslimân kadınların bunlara görünmeleri, yabancı erkeklere görünmeleri gibi, üç mezhebde de harâmdır.”
  - Satır doğru, ama kitabın gayr-ı müslim kadınlar için koyduğu istisna yok; okuyucu her kadına karşı aynı hükmü sanabilir. Öneri: İstisnayı ekle.
- **setr_avret / imlâ** [B, kesin]
  - Derleme: Namazda, Göbekten
  - Kitap (1-58): “nemâz ... göbekden”
  - Kitap 'nemâz', 'göbekden' yazar. Öneri: Kitabın imlâsına çevir.

### 52. `nikah_sartlari` — Nikâh (Evlenme) Ahkâmı → düzeltilmeli

- **nikah_sartlari / kaynakMetin** [Y, kesin]
  - Derleme: Müslimân kadın ile evli olanın da, bunları nikâhlaması câizdir. ... gusl abdesti almağa cebr edemez.
  - Kitap (2-34): “Nikâhın ikinci şartı, Hanefî mezhebinde, [fıskı belli olsa da] îcâb ve kabûl yapılırken, âkıl ve bâlig müslimân iki erkek veyâ bir erkekle iki kadın şâhid bulunmaları ve îcâb ile kabûlü işitmeleri lâzımdır.”
  - Alıntı ehl-i kitâb kadınla evlenmeyi anlatıyor; tablodaki şartlarla ilgisi yok. Ayrıca kitapta 'Ni’met-i islâm' yazılırken alıntıda 'Nimet-i islâm' yazılmış. Öneri: kaynakMetin'i kitaptaki şartları sayan cümleyle değiştir.
- **nikah_sartlari / Şâhidler** [Y, kesin]
  - Derleme: İki erkek veya bir erkek iki kadın müslimân şâhid bulunmalıdır
  - Kitap (2-34): “Şâfi’î ve Hanbelîde, şâhidlerin erkek olması ve fıskları belli olmaması şartdır. ... Mâlikî mezhebinde, şâhid lâzım olmayıp, velînin bulunması ve nikâhın i’lân edilmesi ... şartdır.”
  - Kitap bunu 'Hanefî mezhebinde' diye veriyor ve öteki mezheblerin farklı şartlarını sayıyor; tabloda mezheb kaydı yok. Öneri: 'Hanefî mezhebinde' kaydını ekle.

### 53. `sadaka_fitr` — Sadaka-i Fıtr Hükümleri → düzeltilmeli

- **sadaka_fitr / Kime vâcibdir** [Y, kesin]
  - Derleme: Nisâb mikdârı malı olan her müslimâna
  - Kitap (1-80): “Şâfi’î, Mâlikî ve Hanbelî mezheblerinde, bir günlük yiyeceği olanın fıtra vermesi farzdır ve buğdaydan ve arpadan da, hep bir sâ’ vermek lâzımdır.”
  - Nisâb şartı ve yarım sâ' Hanefî mezhebine göre; kitabın bildirdiği öteki mezheblerin hükmü düşmüş, hüküm genel gibi sunulmuş. 'Hür' şartı da yok. Öneri: 'Hanefî mezhebinde' kaydını ekle.
- **sadaka_fitr / Kime verilir** [Y, kesin]
  - Derleme: Zekât verilecek yedi sınıfa verilir
  - Kitap (1-78): “Zimmîye, ya’nî gayr-i müslim vatandaşa zekât verilmez. Zimmîye fıtra, adak, sadaka, hediyye verilebilir.”
  - 1-80'de fıtranın kime verileceği yedi sınıfa bağlanmıyor; kitap fıtranın zekâttan farklı olarak zimmîye de verilebileceğini söylüyor. Öneri: Kitabın cümlesini ekle ya da satırı kaldır.
- **sadaka_fitr / Ne zaman verilir** [Y, kesin değil]
  - Derleme: Bayram namazından önce vermek müstehabdır, sonra da verilir
  - Kitap (1-80): “Bayram nemâzından önce verilince, sevâbı dahâ çok olur. Şâfi’îde Ramezândan önce, Mâlikîde ve Hanbelîde ise bayramdan önce verilemez.”
  - Kitap 'müstehab' demiyor; öteki mezheblerin vakit kayıtları düşmüş. Öneri: Kitabın cümlelerini aynen al.
- **sadaka_fitr / imlâ** [B, kesin]
  - Derleme: Ramazan, zaman, namazından
  - Kitap (1-80): “Ramezân ... zemân ... nemâzından”
  - Kitap 'Ramezân', 'zemân', 'nemâz' yazar. Öneri: Kitabın imlâsına çevir.

### 54. `kurban_hukumleri` — Kurban Kesmenin Hükümleri → düzeltilmeli

- **kurban_hukumleri / kaynakMetin** [Y, kesin]
  - Derleme: Zekât alması câiz olur). Görülüyor ki, fetvâ imâm-ı Muhammede göre verilmişdir]. ...
  - Kitap (1-81): “Köyde, çölde, şehrde mukîm olan, âkıl, bâlig, hür ve müslimân erkek ve kadının, ihtiyâcından fazla nisâb mikdârı malı veyâ parası varsa, kurban bayramı için niyyet ederek, belli günlerde, belli bir hayvanı kesmeleri vâcib olur”
  - Alıntı cümle ortasından başlıyor ve tablodaki hükümlerin hiçbirini içermiyor. Öneri: kaynakMetin'i maddenin ilk cümlesiyle değiştir.
- **kurban_hukumleri / Kime vâcibdir** [Y, kesin]
  - Derleme: Nisâb mikdârı malı olan, mukîm, hür, âkıl ve bâliğ müslimâna (vâcib)
  - Kitap (1-81): “Diğer üç mezhebde sünnet-i müekkede olduğu (Mîzân-ı...”
  - Vâciblik Hanefî hükmüdür; kitap öteki üç mezhebde sünnet-i müekkede olduğunu bildiriyor. Kayıt düşmüş. Öneri: 'Hanefîde vâcib' kaydını ekle.
- **kurban_hukumleri / Hayvan çeşitleri manda** [D, kesin değil]
  - Derleme: Koyun, keçi, sığır, manda ve deve kesilebilir
  - Kitap (1-81): “Kurban, koyun, keçi, sığır, deveden birini, kurban bayramının ilk üç gününde, kurban niyyeti ile kesmek demekdir.”
  - 1-81 'manda' saymıyor (manda yalnız 1-78'de zekât için 'sığır gibidir' diye geçiyor). Öneri: 'manda'yı çıkar ya da kitaptaki dayanağı göster.
- **kurban_hukumleri / Etin taksîmi** [Y, kesin değil]
  - Derleme: Üçe bölünüp bir kısmı fakirlere, bir kısmı dostlara verilir, bir kısmı evde kalır
  - Kitap (1-81): “Etin üçde birini evine, üçde birini komşulara, gerisini fakîrlere vermek müstehabdır. Hepsini fakîrlere sadaka vermek veyâ kendi evine bırakmak da olur.”
  - Kitabın 'müstehabdır' hükmü ve 'hepsini ... vermek veyâ evine bırakmak da olur' ruhsatı düşmüş; satır bir zorunluluk gibi okunuyor. Öneri: Kitabın cümlesini aynen al.

### 55. `hadis_cesitleri` — Hadîs-i Şerîf Çeşitleri → düzeltilmeli

- **hadis_cesitleri / Hadîs-i mevkûf** [K, kesin]
  - Derleme: Eshâb-ı kirâma isnâd edilen sözler
  - Kitap (2-6): “8 — (Hadîs-i mevkûf): Sahâbîye “radıyallahü teâlâ anhüm ecma’în” kadar söyliyen hep bildirilip, Sahâbînin, Resûl-i ekremden “sallallahü aleyhi ve sellem” işitdim demeyip, böyle buyurmuş dediği hadîs-i şerîflerdir.”
  - Kitap mevkûfu, sahâbînin 'işitdim' demeden Resûlullahdan naklettiği hadîs diye tarif ediyor; tablo 'sahâbeye isnâd edilen sözler' diyerek kitabın tarifinden başka bir tarif veriyor. Öneri: Kitabın tarifini aynen al.
- **hadis_cesitleri / Hadîs-i meşhûr** [Y, kesin değil]
  - Derleme: İlk tabakada bir veya iki kişiden rivâyet edilip sonra şöhret bulan hadîs
  - Kitap (2-6): “7 — (Hadîs-i meşhûr): İlk zemânda bir kişi bildirmişken, ikinci asrda şöhret bulan hadîs-i şerîflerdir.”
  - Kitap 'bir kişi' ve 'ikinci asrda' diyor; tablo 'bir veya iki kişi' diyor ve asrı belirtmiyor. Öneri: Kitabın tarifini aynen al.
- **hadis_cesitleri / Hadîs-i sahîh** [Y, kesin değil]
  - Derleme: Râvîleri âdil ve hafızası kuvvetli olan, senedinde kopukluk bulunmayan hadîs
  - Kitap (2-6): “9 — (Hadîs-i sahîh): Âdil ve hadîs ilmini bilen kimselerden işitilen, müsned-i müttasıl ve mütevâtir ve meşhûr hadîslerdir.”
  - Kitabın tarifi farklı sözlerle ve 'mütevâtir ve meşhûr' kaydıyla veriliyor. Öneri: Kitabın tarifini aynen al.
- **hadis_cesitleri / eksik** [Y, kesin değil]
  - Derleme: 9 tür
  - Kitap (2-6): “31 — (Eser): Mevkûf ve maktû’ hadîs veyâ düâ bildiren merfû’ hadîs demekdir.”
  - Kitap 31 terim sayıyor; tablo 9'unu seçmiş, bunu belirtmiyor (mürsel, müsned, haber-i âhâd, garîb, mevdû' vb. yok). Öneri: Başlığa 'ba’zıları' ekle.
- **hadis_cesitleri / kaynakMetin** [B, kesin]
  - Derleme: ... Resûl-i ekrem “sallallahü aleyhi ve sellem” buyurdu ki, dedi
  - Kitap (2-6): “buyurdu ki, dediği hadîs-i şerîflerdir.”
  - Alıntı kelime ortasında kesilmiş ('dedi|ği'). Öneri: Cümle sonuna kadar al.

### 56. `nafile_namazlar` — Nâfile (Tatavvu') Namazları → kaldırılmalı

- **nafile_namazlar / İşrâk ve Duhâ ayrı satır** [K, kesin]
  - Derleme: İşrâk (Güneş doğduktan 40-50 dk sonra, 2-4 rek'at) / Duhâ (Kuşluk) (Güneş yükselince, 2-12 rek'at)
  - Kitap (1-60): “Duhâ vakti olunca, iki rek’at (İşrak nemâzı) kılmak sünnetdir. Bu nemâza (Kuşluk nemâzı) da denir.”
  - Kitap işrak nemâzı ile kuşluk nemâzını aynı nemâz sayıyor ve 'iki rek’at' diyor; tablo iki ayrı nemâz yapıp kitapta olmayan rek'at aralıkları ve dakîka veriyor. Öneri: Tek satıra indir; kitabın cümlesini aynen al.
- **nafile_namazlar / Evvâbîn** [K, kesin]
  - Derleme: Rekat: 6-20; Akşamın farzı ve sünnetinden sonra kılınır
  - Kitap (1-60): “Akşam nemâzının farzından sonra kılınan altı rek’ate (Evvâbîn) nemâzı denir.”
  - Kitap altı rek'at diyor; '6-20' kitapta yok. 1-51'de bu altı rek'atin ilk ikisinin son sünnet yerine sayıldığı bildiriliyor; tablodaki sıra kitaba uymuyor. Öneri: 'altı rek’at, farzdan sonra' yaz.
- **nafile_namazlar / Teheccüd** [D, kesin]
  - Derleme: Gece yarısından sonra; 2-12 rek'at; En kıymetli nâfiledir
  - Kitap (1-46): “[Teheccüd, gecenin üçde ikisi geçdikden sonra, kılınan nemâza denir, imsâk vaktinden önce kılınır.”
  - Kitap teheccüdün vaktini 'gecenin üçde ikisi geçdikden sonra' diye veriyor; rek'at aralığı ve 'en kıymetli nâfile' bulunamadı. 1-60'ta teheccüd geçmiyor. Öneri: Kitabın tarifini al; sayıları kaldır.
- **nafile_namazlar / Hâcet, Abdest namazı** [D, kesin]
  - Derleme: Hâcet namazı 2-12 rek'at; Abdest alıp kurulanmadan iki rekat kılmak müstehabdır
  - Kitap (1-52): “23 — Abdestden sonra (Sübha), ya’nî iki rek’at nemâz kılmakdır.”
  - Hâcet nemâzının rek'at sayısı kitapta bulunamadı (yalnız adı 2-17'de geçiyor). Abdest nemâzı için 'kurulanmadan' kaydı yok; kitap bunu abdestin edebleri arasında sayıyor. Öneri: Sayıları ve 'kurulanmadan'ı kaldır.
- **nafile_namazlar / kaynakMadde** [B, kesin]
  - Derleme: kaynakMadde 1-60 (bütün tablo)
  - Kitap (1-60): bulunamadı
  - 1-60'ta yalnız Evvâbîn tarifi var; tehıyyet-ül-mescid 1-69/1-74'te, istihâre 3-37'de, teheccüd 1-37/1-46'da, abdest nemâzı 1-52'de. Öneri: Her satıra kendi atfını ver.

### 57. `islamiyyetin_temeli` — İslâmiyyetin Temeli Üçdür → denetlenemedi

- **islamiyyetin_temeli / tamamı** [D, kesin değil]
  - Derleme: İslâmiyyetin temeli üçdür: İlm, amel ve ihlâs. ... İhlâs, ilmin ve amelin Allah rızâsı, Allah sevgisi ile olmasıdır. Mal, mevkı' ve şöhret için olmamasıdır.
  - Kitap (3-44): “Ahkâm-ı islâmiyyeye tam uyabilmek ise, ilm, amel ve ihlâs ile olur.”
  - Alıntı ve satırlar 241 maddenin hiçbirinde geçmiyor; gösterilen s. 16 madde metinlerinin dışında (önsöz), veride yok. Bu yüzden denetlenemedi. Kitapta en yakın ifade 3-44'teki cümle. İhlâs satırındaki tarif ('Allah rızâsı, Allah sevgisi ile ... Mal, mevkı' ve şöhret için olmamasıdır') de maddelerde bulunamadı. Öneri: PDF'in 16. sahîfesiyle karşılaştırılmalı; doğrulanamazsa kaldırılmalı.

### 58. `amel_uce_ayrilir` — Amel, Ya'nî İş Üçe Ayrılır → düzeltilmeli (yalnız alıntı)

- **amel_uce_ayrilir / kaynakMetin** [Y, kesin]
  - Derleme: (Miftâh-un-necât)daki (Yâ Alî, ...) ... Hakîkat kitâbevi tarafından basdırılmışdır.
  - Kitap (1-1): “(Mir’ât-ül-mekâsıd) kitâbı, yetmişüçüncü sahîfede ve İbni Âbidîn “rahmetullahi aleyh” abdestin niyyetinde ve (Milel-Nihal) tercemesi, ellidördüncü sahîfesinde diyor ki, amel, ya’nî iş üçe ayrılır:”
  - Alıntı farzları tamamlamayı anlatan hadîsler; amelin üçe ayrılmasıyla ilgisi yok. Satırların üçü de kitapla aynen aynı. Öneri: kaynakMetin'i 'amel, ya’nî iş üçe ayrılır: ...' paragrafıyla değiştir.

### 60. `kuran_bilgiler_uc` — Kur'ân-ı Kerîmdeki Bilgiler Üç Kısmdır → düzeltilmeli (yalnız atıf/alıntı)

- **kuran_bilgiler_uc / kaynakMadde ve kaynakMetin** [B, kesin]
  - Derleme: kaynakMadde 1-26, s. 48; kaynakMetin: 26 — Ahkâm-ı islâmiyyenin hepsi Kur’ân-ı kerîmden çıkmakdadır ...
  - Kitap (1-25): “(Mevdû’ât-ül-ulûm)da diyor ki, (Kur’ân-ı kerîmdeki bilgiler üç kısmdır: Birincisini hiçbir kuluna bildirmemişdir. Kendisini, ismlerini ve sıfatlarını kendinden başka kimse bilemez.”
  - Tablonun içeriği kitapla aynı, fakat 1-25'ten (Mevdû’ât-ül-ulûm nakli) alınmış; atıf ve alıntı 1-26'yı (ahkâmın üç kısmı) gösteriyor. kaynakMetin bu tabloyla ilgisiz (kuran_ahkam_uc tablosunun alıntısıyla aynı). Öneri: Atfı 1-25'e çevir; kaynakMetin'i 1-25'teki cümleyle değiştir.

### 63. `sunnet_tasnifi` — Sünnet Tasnîfi → düzeltilmeli (yalnız alıntı)

- **sunnet_tasnifi / kaynakMetin** [Y, kesin değil]
  - Derleme: Resûlullahın ... yapdığı ve kaçındığı şeyler iki kısmdır: Birisi, ibâdet olarak yapdığı ve kaçındığı şeylerdir.
  - Kitap (1-28): “Bunları devâmlı yaparak, nâdiren terk etmiş ve terk edenlere birşey dememiş ise, (Sünnet-i hüdâ) veyâ (Müekked sünnet) denir.”
  - Alıntı tablonun konusu olan sünnet çeşidlerini değil, madde başındaki iki kısm ayrımını gösteriyor. Satırlar kitapla aynı. Öneri: kaynakMetin'i sünnet çeşidlerini sayan İbni Âbidîn naklinden al.

## 'Doğru' tablolar (yalnız biçim notları)

- 5. `allahin_sifatlari` — kaynakMetin: Alıntı aynen var ama sekiz sıfatı sayan cümleyi dışarıda bırakıp 'Bu sekiz sıfata' diye başlıyor; tablonun asıl dayanağı bir önceki cümle.; imlâ: Kitap 'herşey' bitişik yazar.
- 7. `namaz_rekatlari` — imlâ: Başlıkta kitabın imlâsı (vakt, nemâz, rek'at) yok. İçerik sayıları kitapla birebir aynı.
- 19. `bayram_namazi` — imlâ: Kılınış adımları kitapla uyumlu; yalnız imlâ farklı.
- 26. `mubarek_geceler` — imlâ: On satırın hepsi kitapla aynı; yalnız ad yazımları farklı ('Kadir' / kitapta 'Kadr', 'Kurbân' / 'Kurban', başlıkta 'Mübârek' / 'Mubârek'). Kadr gecesinde kitabın andığı İmâm-ı Şâfi'înin 'onyedinci gece' görüşü verilmemiş.
- 31. `otuzuc_farz` — kaynakMetin: Kitaptaki çizelge satırları alıntıda bitişik yazılmış (satır sonları silinmiş). İçerik satırları kitapla aynı.
- 34. `ezanin_kelimeleri` — kaynakMetin: Alıntıda büyük harf küçültülmüş ('Ho-parlör' → 'ho-parlör'); başlık satırı ile metin birleştirilmiş. Yedi satır kitapla aynı anlamda.
- 36. `yemin_turleri` — not yok
- 37. `uc_cesit_haci` — kaynakMetin ve 'ömre': Kitap 'umre' yazıyor; alıntıda ve tabloda 'ömre'ye çevrilmiş, bu yüzden alıntı kitapta aynen bulunmuyor. İçerik kitapla aynı.
- 40. `dua_sartlari` — 4: 'Ramezân' kelimesi düşmüş. Öteki satırlar kitapla aynı.
- 41. `vera_on_sart` — not yok
- 42. `selam_hukumleri` — not yok
- 43. `tabi_olma_dereceleri` — not yok
- 46. `kefen_bilgisi` — not yok
- 59. `islam_bilgileri_ikiye` — kaynakMetin: Alıntıya kitapta olmayan bir boşluk girmiş. Satırların hepsi kitapla aynı.
- 61. `kuran_ahkam_uc` — not yok
- 62. `resulullah_yaptiklari` — not yok
- 64. `kafirlerin_yaptiklari` — kaynakMetin: Alıntı kelime ortasından ('...ını') başlıyor. Satırlar kitapla aynı (ikinci satır Birgivî naklinden).
- 65. `bidat_uc_tur` — kaynakMetin: Alıntıda iki cümle sessizce çıkarılıp kalan parçalar birleştirilmiş; bu yüzden kitapta aynen bulunmuyor. Ayrıca alıntı üç dürlü bid'atı anlatan yer değil ('Bid’at üç dürlüdür: 1 — İslâmiyyetin küfr alâmeti dediği şeyleri ...'). Satırlar kitapla aynı.

## Denetlenemeyen kısımlar

- `islamiyyetin_temeli` (s. 16) ve `konu_haritasi` alıntısı (s. 11): kitabın 1–16. sahîfeleri veride yok; PDF ile karşılaştırılmalı.
- `kitabin_tanimlari`: atlandı (başka ajanın parçası).
- Bir satırın kitapta 'bulunamadı' denmesi bütün maddelerde normalleştirilmiş arama ile yapıldı; başka kelimelerle anlatılmış olabilecek yerler için 'kesin değil' işareti konuldu.

## Genel kanaat

**Düzeltilerek kullanılabilir; iki tablo kaldırılmalı.** 64 tablonun 18'i satır satır kitapla aynı; 43'ü kitaba dayanıyor ama düzeltilmeli. Düzeltmelerin çoğu üç türde toplanıyor: (1) kitabın 'Hanefîde', 'üç mezhebde', 'ba’zılarına göre' gibi kayıtlarının ve şartlarının düşmesi; (2) 'Kitaptan' diye gösterilen alıntının tabloyla ilgisiz bir yerden alınması, kırpılması ya da kitapta olmayan cümle içermesi; (3) kitapta olmayan ayrıntıların (rek'at aralıkları, dakîkalar, 'sağdan başlamak', 'pul ve solungaç', 'nûrdan yaratılmış' vb.) eklenmesi. 14 yerde hüküm sınıfı ya da tarif kitaba aykırı (K); bunlar öncelikle düzeltilmeli. `nafile_namazlar` ve `haram_helal_yiyecekler` büyük ölçüde kitapta dayanaksız olduğu için kaldırılmalı ya da kitaptan yeniden kurulmalı. Kitabın listelerini aynen aktaran tablolar (on mübârek gece, vera’nın on şartı, selâm hükümleri, tâbi’ olmanın yedi derecesi, kefen, ef’âl/amel ayrımı, Kur'ân ahkâmı vb.) güvenilir.
