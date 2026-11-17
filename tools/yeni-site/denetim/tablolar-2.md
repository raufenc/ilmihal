# Fevâid denetimi — Tablolar (2. parça: dizindeki son 65 tablo)

Kapsam: `veri/tablolar/dizin.json` → `tablolar` dizisinin 66.–130. kayıtları (`kan_gruplari` … `yimek_adabi`).
Bulgu listesi: `tools/yeni-site/denetim/tablolar-2.json` (41 bulgu). Betikler: `tools/yeni-site/denetim/betik-tablolar-2/`.

## Yöntem
- 65 tablonun **hepsi tek tek ve tam** okundu (her satır/kalem/hücre). Örnekleme yapılmadı. `tanimlar` tipinde tablo bu parçada **yok**
  (tipler: 53 `tablo`, 11 `liste`, 1 `iki_liste`).
- Her tablo için: (1) `kaynakMetin` maddede aranıp (aynen / normalleştirilerek) farkları çıkarıldı (`kaynakmetin.py`, `kmfark.py`, `kmyok.py`);
  (2) her satırın cümlesi kitapta arandı (`ara.py`, normalleştirilmiş arama) ve çevresiyle birlikte okundu (`yer.py`, `metin.py`);
  (3) bütün sayılar (dört ay, dört ay on gün, üç gün, ikibuçuk yaş, beş kerre, yirmibeş/onsekiz/yedi kadın, on fakîr, iki/bir akîka hayvanı,
  yedi yaş, dört parmak vb.) kitapta bulundu — **sayı hatası bulunmadı**; (4) hüküm kelimeleri ve mezheb kayıtları kitapla karşılaştırıldı.
- Sahîfe: madde metninde sahîfe işareti olmadığından, hüküm/âyet/hadîs/tanım derlemelerindeki (metin, sahîfe) çiftleri madde içinde çapa
  yapılarak tahminî sahîfe bulundu (`ortak.py: sahife_tahmin`). Bu yüzden "s.571" gibi düzeltme önerileri **tahminîdir** (±1 sahîfe).
- Bulgu alıntılarının (`kitap` alanı) 41'inin de maddede **aynen** geçtiği betikle sınandı (`bulgular.py`).
- Ölçü: tablonun bir satırı "doğru" sayıldı ancak kitapta aynı yerde aynı anlamda bulunduysa. Tablonun hükmü: K/D/Y bulgusu ya da
  kaynakMetin/atıf yanlışı varsa **düzeltilmeli**; yalnız önemsiz B notu (başlık, imlâ) varsa **doğru** bırakıldı.

## Sonuç sayıları
- **doğru: 40** (3'ünde yalnız önemsiz B notu: `ulum_ogrenme_hukmu`, `olcu_birimleri`, `farz_adamak`)
- **düzeltilmeli: 25** · **kaldırılmalı: 0** · **denetlenemedi: 0**
- Bulgular (41): **K 3 · D 0 · Y 25 · B 13**. Kesin: 40, kesin değil: 1.
- Kitapta karşılığı hiç olmayan **satır** bulunmadı (D=0). Bütün tabloların konusu kitapta var; `kan_gruplari` dahil (3-54'te dört kan grubu aynen anlatılıyor).

## Tablo tablo hüküm çizelgesi
| # | kimlik | başlık | tip | atıf (veri) | kaynak doğru mu | hüküm | bulgu |
|---|---|---|---|---|---|---|---|
| 66 | `kan_gruplari` | Dört Dürlü Kan Gurubu | tablo | 3-54 s.978 | evet | **doğru** | 0 |
| 67 | `uc_vazife` | Allahü Teâlâ Kullarına Üç Vazîfe Verdi | tablo | 1-11 s.29 | evet | **doğru** | 0 |
| 68 | `dunyayi_terk` | Dünyâyı Terk Etmek İki Dürlüdür | tablo | 1-11 s.29 | evet | **doğru** | 0 |
| 69 | `kafirler_iki_tur` | Bugün, Dünyâdaki Kâfirler İki Dürlüdür | tablo | 1-11 s.27 | evet | **doğru** | 0 |
| 70 | `gunahlar_ikiye` | Küfrden ve Bid'atden Başka Günâhlar İkiye Ayrılır | tablo | 1-31 s.64 | evet | **doğru** | 0 |
| 71 | `yetmisiki_bidat_firka` | Yetmişiki Bid'at Yolunun Esâsı, Dokuz Fırkadır | liste | 1-31 s.66 | evet | **doğru** | 0 |
| 72 | `eshab_iftiracilari` | Eshâb-ı Kirâma İftirâ Edenler Üç Grubda Toplanmakdadır | tablo | 1-31 s.61 | evet | **doğru** | 0 |
| 73 | `din_bilgileri_ikiye` | Resûlullahdan Gelen Din Bilgileri İkiye Ayrılır | tablo | 3-70 s.1053 | evet | **doğru** | 0 |
| 74 | `ulum_ogrenme_hukmu` | Ulûm-i İslâmiyyenin Öğrenme Hükmü Üç Tabakadadır | tablo | 1-11 s.25 | evet | **doğru** (B) | 1 |
| 75 | `insanlar_uc_turlu` | Vera' Bahsinde İnsanlar Üç Dürlüdür | tablo | 2-40 s.610 | evet | **düzeltilmeli** (Y) | 1 |
| 76 | `nikah_hukumleri` | Nikâh Hakkında Başlıca Hükümler | tablo | 2-34 s.564 | hayır (kaynakMetin, sahîfe) | **düzeltilmeli** (B,Y) | 2 |
| 77 | `nikah_niyyet_haram` | Nikâhda Niyyet ve Harâm Nikâh Nevileri | tablo | 2-34 s.565 | hayır (kaynakMetin, sahîfe) | **düzeltilmeli** (B,Y) | 2 |
| 78 | `bosama_yetkisi` | Boşama Yetkisinin Veriliş Yolları | tablo | 2-36 s.583 | kısmen (1. satır 2-34; kaynakMetin) | **düzeltilmeli** (B,Y) | 2 |
| 79 | `talak_ayrilik` | Talâk ve Ayrılık Nevileri | tablo | 2-36 s.580 | evet | **doğru** | 0 |
| 80 | `ila_hul` | Îlâ ve Hul' | tablo | 2-36 s.580 | hayır (kaynakMetin, sahîfe) | **düzeltilmeli** (Y,B) | 2 |
| 81 | `akika` | Akîka Hükümleri | tablo | 1-81 s.329 | hayır (kaynakMetin) | **düzeltilmeli** (B) | 1 |
| 82 | `nikahi_caiz_olmiyanlar` | Nikâhı Câiz Olmıyanlar | tablo | 2-34 s.569 | evet | **doğru** | 0 |
| 83 | `nesebden_yedi_mahrem` | Nesebden Olan Yedi Zî-Rahm-i Mahrem | liste | 2-34 s.569 | evet | **doğru** | 0 |
| 84 | `sut_ile_hukum` | Soydan Olmayıp Süt İle veyâ Zinâ İle Olursa Hüküm | tablo | 2-34 s.569 | evet | **doğru** | 0 |
| 85 | `nikah_sebebi_dort_kadin` | Nikâh Sebebi İle Sonradan Akrabâ Olan Dört Kadın | liste | 2-34 s.570 | evet | **doğru** | 0 |
| 86 | `muvakkat_haram` | Muvakkat Harâm Olan Kadınlar | tablo | 2-34 s.570 | evet | **düzeltilmeli** (Y) | 2 |
| 87 | `zihar` | Zıhâr | tablo | 2-36 s.584 | evet | **doğru** | 0 |
| 88 | `lian` | Li'ân | tablo | 2-36 s.584 | evet | **düzeltilmeli** (Y) | 2 |
| 89 | `iddet` | İddet Hükümleri | tablo | 2-36 s.584 | evet | **doğru** | 0 |
| 90 | `hidane` | Hıdâne (Çocuğu Yetişdirmek) | tablo | 2-36 s.585 | evet | **doğru** | 0 |
| 91 | `sut_cocuklugu_mezhebler` | Süt Çocukluğu Mezheblere Göre | tablo | 2-37 s.586 | evet | **doğru** | 0 |
| 92 | `sut_akrabaligi` | Süt Akrabâlığı Nasıl Kuruluyor? | tablo | 2-37 s.586 | evet | **doğru** | 0 |
| 93 | `sut_haram_olanlar` | Süt Sebebi İle Evlenmesi Harâm Olanlar | tablo | 2-37 s.586 | evet | **düzeltilmeli** (Y) | 2 |
| 94 | `sut_cocuklugu_haller` | Süt Çocukluğu Olmaz ve Olur Hâller | iki_liste | 2-37 s.586 | hayır (kaynakMetin değiştirilmiş) | **düzeltilmeli** (K,Y) | 2 |
| 95 | `sut_emme_sabit` | Süt Emmenin Sabit Olması | tablo | 2-37 s.587 | evet | **düzeltilmeli** (Y) | 1 |
| 96 | `nafaka_bes_sebeb` | Nafakayı Vermek Beş Sebeble Farz Olur | liste | 2-38 s.588 | evet | **doğru** | 0 |
| 97 | `zevce_nafakasi` | Zevce Nafakası | tablo | 2-38 s.588 | evet | **doğru** | 0 |
| 98 | `cocuk_nafakasi` | Fakîr Çocuğun Nafakası ve Lakît | tablo | 2-38 s.591 | evet | **doğru** | 0 |
| 99 | `anababa_nafaka` | Fakîr Ana-Babaya Nafaka | tablo | 2-38 s.591 | evet | **doğru** | 0 |
| 100 | `mahrem_nafaka` | Fakîr Zî-Rahm-i Mahreme Nafaka | tablo | 2-38 s.592 | evet | **doğru** | 0 |
| 101 | `nafaka_uc_sey` | Nafaka Üç Şeydir | liste | 2-38 s.588 | evet | **doğru** | 0 |
| 102 | `olcu_birimleri` | Ölçü Birimleri İkiye Ayrılır | tablo | 1-78 s.295 | evet | **doğru** (B) | 1 |
| 103 | `mal_ikiye_ayrilir` | Mal, (Ayn) ve (Deyn) Olarak İkiye Ayrılır | tablo | 3-4 s.793 | evet | **doğru** | 0 |
| 104 | `havale_uc_sekil` | Havâle Üç Şeklde Olabilir | tablo | 3-13 s.831 | evet | **doğru** | 0 |
| 105 | `ibadetler_on_kisim` | İbâdetler On Kısmdır | tablo | 3-3 s.786 | evet | **doğru** | 0 |
| 106 | `alacaklar_uc_turlu` | Alacaklar Üç Dürlüdür | tablo | 1-78 s.294 | evet | **düzeltilmeli** (Y) | 1 |
| 107 | `emval_zahire_batina` | Zekât Mallarından Emvâl-i Zâhire ve Emvâl-i Bâtına | tablo | 1-78 s.309 | evet | **doğru** | 0 |
| 108 | `mulk_sahibi_uc_yol` | Mülk Sâhibi Olmak Üç Yol İledir | tablo | 2-29 s.536 | evet | **doğru** | 0 |
| 109 | `muhayyerlik_uc_turlu` | Alış Verişde Muhayyerlik Üç Dürlüdür | tablo | 3-4 s.797 | hayır (3-5 olmalı) | **düzeltilmeli** (B,Y) | 2 |
| 110 | `insanin_kullandigi` | İnsanın Kullandığı Şeyler Beşe Ayrılır | tablo | 2-38 s.594 | evet | **doğru** | 0 |
| 111 | `miras_alamiyanlar` | Mîrâs Alamıyanlar | liste | 3-63 s.1019 | hayır (3-64 olmalı) | **düzeltilmeli** (B,Y) | 2 |
| 112 | `nikah_sartlari_mezhebler` | Nikâhın Şartları ve Mezheblere Göre Kayıtlar | tablo | 2-34 s.566 | evet | **düzeltilmeli** (Y) | 1 |
| 113 | `feraizte_takdiren` | Ferâizde Takdîren Ölü ve Takdîren Diri Sayılanlar | tablo | 3-64 s.1025 | evet | **doğru** | 0 |
| 114 | `zevil_erham_bes` | Zevil-Erhâm Beş Sınıfdır | tablo | 3-65 s.1033 | evet | **düzeltilmeli** (Y) | 1 |
| 115 | `zevil_erham_tercih` | Zevil-Erhâmda Tercih Kaideleri | tablo | 3-65 s.1033 | evet | **düzeltilmeli** (Y) | 2 |
| 116 | `yemin_keffareti` | Yemîn Keffâreti | tablo | 1-83 s.337 | evet | **doğru** | 0 |
| 117 | `yemin_keffaret_kayitlar` | Yemîn Keffâretinde Kayıtlar | tablo | 1-83 s.337 | evet | **doğru** | 0 |
| 118 | `nezr_iki_turlu` | Nezr, Ya'nî Adak, İki Dürlü Olur | tablo | 1-82 s.330 | kısmen (kaynakMetin birleştirilmiş) | **düzeltilmeli** (Y,B) | 2 |
| 119 | `adak_vasiflar` | Adakta Aranan Vasıflar ve Nezr Olunmayanlar | tablo | 1-82 s.331 | evet | **doğru** | 0 |
| 120 | `farz_adamak` | Zâten Farz Olanı Adamak ve Hac/Kurban Farkı | tablo | 1-82 s.331 | evet | **doğru** (B) | 1 |
| 121 | `vera_dereceleri` | Halâl ve Harâmda Vera'ın Dereceleri Beşdir | tablo | 2-40 s.608 | evet | **doğru** | 0 |
| 122 | `subheler_uc_kisim` | Şübheliler Üç Kısmdır | liste | 2-40 s.607 | hayır (kaynakMetin, sahîfe) | **düzeltilmeli** (B) | 1 |
| 123 | `zaruret_ruhsatlari` | Zarûret Hâlinde Ruhsatlar | tablo | 2-41 s.618 | hayır (kaynakMetin) | **düzeltilmeli** (B) | 1 |
| 124 | `altin_gumus_hukumleri` | Altın, Gümüş ve Zînet Hükümleri | tablo | 2-41 s.620 | evet | **düzeltilmeli** (Y) | 1 |
| 125 | `ipek_hukumleri` | Erkekler İçin İpek Hükümleri | tablo | 2-41 s.622 | evet | **doğru** | 0 |
| 126 | `tutun_gorusleri` | Tütün Hakkında Görüşler | tablo | 2-43 s.629 | evet | **düzeltilmeli** (K) | 2 |
| 127 | `yimegi_haram_eden` | Yimeği ve İçmeği Harâm Eden Sebebler Altıdır | tablo | 2-43 s.630 | evet | **doğru** | 0 |
| 128 | `israf_bes_bahs` | İsrâf Beş Bahs İçinde Anlatılır | liste | 2-44 s.640 | hayır (kaynakMetin uydurma) | **düzeltilmeli** (K) | 1 |
| 129 | `para_vermek_iki_turlu` | Parayı, Malı, Halâl Yerlere Vermek İki Dürlü Olur | tablo | 2-44 s.646 | evet | **düzeltilmeli** (Y) | 1 |
| 130 | `yimek_adabi` | Yimek Âdâbında Başlıca Sünnetler | liste | 2-45 s.648 | evet | **düzeltilmeli** (Y) | 1 |

## En önemli bulgular (kitaptan alıntıyla)
1. **K — `tutun_gorusleri` / "Bahsin sonucu"**: Tablo "Tütün içmek, nihâyet şübheli kalmakdadır. Şübheliler ise harâm olur. Tütüne tehlükeli demek insâf olur"
   sözlerini bahsin sonucu diye veriyor. Bu sözler Berîka (Hâdimî) tercemesinin içindendir (2-43, ~s.631; kitap ardından "(Berîka) kitâbından terceme burada temâm oldu" diyor).
   Kitabın kendi sonucu tersidir: "Yukarıdaki örnek yazılardan anlaşılıyor ki, tütün içmek, alkollü içkiler ve afyon, morfin, esrâr ve benzerleri uyuşdurucu maddeler gibi, harâm edilmemişdir." (2-43, ~s.633) ve devamında "Tütün böyle değildir" (şübhelilerden değildir).
   Ayrıca İbni Âbidîn'in "Tütün içmek Şâfi’î mezhebinde harâm değildir. Kitâblarında, tenzîhen mekrûh denilmekdedir.", Nablüsî'nin mubâh, Alî Echürî'nin "dört mezheb âlimleri sözbirliği" nakilleri tabloda yok.
2. **K — `sut_cocuklugu_haller` / kaynakMetin**: "Kitaptan" diye gösterilen alıntı değiştirilmiş ve uydurma cümle eklenmiş. Kitap: "İkibuçuk yaşından küçük çocuk, yabancı bir veyâ birkaç kadından, birer yudum süt emerse, hanefîde ve mâlikîde, bu kadınlar çocuğun süt annesi olur." (2-37, s.586).
   Derleme "ve mâlikîde"yi atmış, "bu çocuk, o kadınların mahremi olur" yazmış; "Süt çocuğu olmak için: … sütün gerçek anlamda emilmesi ve bağlantı kurulabilmesi şartları aranır." cümlesi kitapta yok.
3. **K — `israf_bes_bahs` / kaynakMetin**: Alıntının ikinci yarısı ("İKİNCİ BAHS — Yimekde isrâf. ÜÇÜNCÜ BAHS — İçmekde isrâf. DÖRDÜNCÜ BAHS — Giyinmekde isrâf. BEŞİNCİ BAHS — Binalarda isrâf. Her birinde haddi aşmak isrâfdır.") kitapta yok;
   kitabın başlıkları başkadır: "İKİNCİ BAHS — İsrâfın kötü olmasının birinci sebebi, malın kıymetli olmasıdır." (2-44, ~s.641). Tablonun kendi 5 satırı ise kitapla aynı.
4. **Y — `insanlar_uc_turlu`**: Üç kısım insan, kitabın hükmü olmadan sıralanmış; kitap hemen ardından "Bunların üçü de yanılmakdadır." diyor (2-40, s.610).
5. **Y — `ila_hul` / Îlâ**: Kitap "Zevcesine, dört ay veyâ dahâ çok zemân veyâ zemân söylemiyerek, (Sana yaklaşmıyacağım) diye yemîn etmekdir." (2-36, s.584); tablo "… zemân söyliyerek" diyerek zemânsız îlâyı düşürmüş.
6. **Y — `muvakkat_haram`**: Kitabın saydığı yedi kadından yedincisi yok: "Muvakkat harâm olan kadınların yedincisi, hür kadın ile evli iken, câriye ile de nikâhlanmakdır." (2-34, ~s.571).
7. **Y — `miras_alamiyanlar`**: Şart düşmüş — kitap "Babası sâhib çıkmıyan veled-i zinâ, babasına vâris olamaz." (3-64, ~s.1027); ayrıca atıf 3-63 (İskât) yerine 3-64 olmalı.
8. **Y — `lian`**: Kadının beşinci yemîni düşmüş: "Beşincisinde, (Doğru söyledi ise, Allahın gadabı benim üzerime olsun) der." (2-36, s.584).
9. **Y — mezheb/imâm kaydı düşmüş**: `alacaklar_uc_turlu` ("İmâm-ı a’zama göre, üç dürlü alacak vardır" 1-78 s.294), `muhayyerlik_uc_turlu` ("İmâmeyne göre, müddet belli olmak şartı ile çok uzun zemân muhayyer olabilirler" 3-5 s.806),
   `sut_cocuklugu_haller` (Şâfi'î: "süt yarıdan az olunca da, süt çocuğu olur dedi" 2-37 s.587), `nikah_sartlari_mezhebler` (Hanefî "[fıskı belli olsa da]" 2-34).
10. **Y — `yimek_adabi`**: Bütün kalemler "sünnet" etiketli; kitap üçüne sünnet demiyor ("Acıkmadan yimemeli, doymadan kalkmalı…", "Ekmeği … iki eli ile koparmalıdır", "Lokma küçük olmalı ve iyi çiğnenmelidir").
11. **B — yanlış/ilgisiz kaynakMetin ve atıf** (10 tabloda): `nikah_hukumleri`, `nikah_niyyet_haram`, `ila_hul`, `subheler_uc_kisim` (kaynakMetin maddenin girişi, sahîfe de giriş sahîfesi);
    `akika` (kaynakMetin fakîrin nezr kurbanı), `zaruret_ruhsatlari` (Berîka listesi), `bosama_yetkisi` (1. satır 2-34'ten), `muhayyerlik_uc_turlu` (3-4 yerine 3-5), `miras_alamiyanlar` (3-63 yerine 3-64), `nezr_iki_turlu` (iki paragraf birleştirilmiş).
    Ortak desen: derleyici, satırların geçtiği paragraf yerine **maddenin ilk cümlelerini** "Kitaptan" alıntısı olarak koymuş.

## "Düzeltilmeli" tabloların ayrıntısı
Her biri için satır satır bulgu ve kitaptan alıntı `tablolar-2.json`dadır; özet:
- 75 insanlar_uc_turlu | düzeltilmeli(Y) | 3 satır 2-40 aynen; kitap hemen ardından "Bunların üçü de yanılmakdadır" diyor, tablo bunu vermiyor (kaynakMetin'de var). başlık "Vera' Bahsinde" site yorumu (kitap: "Burada, insanlar üç dürlüdür")
- 76 nikah_hukumleri | düzeltilmeli(B,Y) | 6 satır 2-34'te var (s.570-571 tahmini); kaynakMetin maddenin girişi (bekârlık), satırlarla ilgisiz; sahife 564 → 570-571. Satır1 "kitâblı kâfir" tanımı (müşrik olmıyan) düşmüş(önemsiz). Satır6 "ve nafakası vâcib olmaz" + "Nikâhdan hâmile olan kadını… sahîh değildir" devamı eksik (Y)
- 77 nikah_niyyet_haram | düzeltilmeli(B,Y) | 5 satır 2-34 @46203-47080 (s.575); kaynakMetin (Süfyân-ı Sevrî/bekârlık) ilgisiz, sahife 565→575. "Muvakkat nikâh" satırında "bütün şartlarına uygun yapılan nikâhdır. Söylemeyip, yalnız kalbinden geçirse, nikâh sahîh olur" düşmüş (Y)
- 78 bosama_yetkisi | düzeltilmeli(B,Y) | satır2-3 2-36 aynen (s.583). Satır1 (Temlîk "Sen nefsini ihtiyâr et") 2-36'da değil 2-34 @41951 (s.573-574) ifadesi; "vakt de bildirdi ise, o vakt içinde" kısmı düşmüş. 2-36'da 1. yol "Tefvîd: Buna Temlîk de denir… (İşin, senin elinde olsun) veyâ (Kendini sen boşa) yâhud (Diler isen boşsun)". kaynakMetin (nikâhda şart) tablodaki üç yolun cümlesi değil
- 80 ila_hul | düzeltilmeli(Y,B) | Îlâ: kitap "dört ay veyâ dahâ çok zemân veyâ zemân söylemiyerek", tablo "…zemân söyliyerek" → zamansız îlâ düşmüş; Hul' aynen; kaynakMetin maddenin girişi (ilgisiz), sahife 580 → 584
- 81 akika | düzeltilmeli(B) | 8 satır 1-81 @19616 "AKÎKA KESMEK" paragrafında aynen; kaynakMetin fakîrin nezr/nâfile kurbanı cümleleri — akîka ile ilgisiz
- 88 lian | düzeltilmeli(Y) | kadının 5. yemîni ("Beşincisinde, (Doğru söyledi ise, Allahın gadabı benim üzerime olsun) der") düşmüş; Netice'de "veyâ başka bir afîf kadını kazf ederek" düşmüş
- 86 muvakkat_haram | düzeltilmeli(Y) | yedincisi eksik: "Muvakkat harâm olan kadınların yedincisi, hür kadın ile evli iken, câriye ile de nikâhlanmakdır" (2-34 @29095, s.570-571); "Başkasının zevcesi" kitapta yedinin dışında ayrı cümle; "Bunlar, süt ile olunca da harâmdır" düşmüş
- 93 sut_haram_olanlar | düzeltilmeli(Y) | satırlar 2-37'de var; "Aynı kadından emenler" satırında "ve birbirlerinin çocukları ve torunları ile" düşmüş; "İstisnâlar"ın hemen ardındaki "Fekat, baba bir kardeşinin annesi ile evlenemez" düşmüş; kitaptaki diğer harâmlar (çocuğun zevcesi–süt babası, Dürer'in süt kızı hükmü, süt babanın diğer zevceleri) yok
- 94 sut_cocuklugu_haller | düzeltilmeli(K,Y) | kaynakMetin kitapta aynen yok: "hanefîde, bu çocuk, o kadınların mahremi olur" (kitap: "hanefîde ve mâlikîde, bu kadınlar çocuğun süt annesi olur") + "Süt çocuğu olmak için: … sütün gerçek anlamda emilmesi ve bağlantı kurulabilmesi şartları aranır" kitapta yok. Satırlar kitapta; "Pişmemiş ise, yarıdan çok olunca" satırına kitabın "İmâm-ı Şâfi’î … süt yarıdan az olunca da, süt çocuğu olur dedi" kaydı eklenmemiş
- 95 sut_emme_sabit | düzeltilmeli(Y) | satırlar 2-37 aynen; son satırda "veyâ bir erkekle bir kadın yâhud yalnız âdil olan süt anne" düşmüş
- 106 alacaklar_uc_turlu | düzeltilmeli(Y) | 3 satır 1-78 @10843 aynen; kitap "İmâm-ı a’zama göre, üç dürlü alacak vardır" diyor, tablo/başlık bu kaydı vermiyor
- 109 muhayyerlik_uc_turlu | düzeltilmeli(B,Y) | içerik 3-5 (s.806) "5 — ALIŞ VERİŞDE MUHAYYERLİK … üç dürlüdür"den; kaynakMadde 3-4/s.797 yanlış, kaynakMetin (çocuğun bey'i) ilgisiz. Satır1 "üç günden fazla olamaz" ardındaki "İmâmeyne göre, müddet belli olmak şartı ile çok uzun zemân muhayyer olabilirler" ve "İmâm-ı Muhammed, câiz olur buyurdu" düşmüş (Y)
- 111 miras_alamiyanlar | düzeltilmeli(B,Y) | kaynak yanlış: 3-63 (İskât) değil 3-64 @9620 "9 — Köle, meyyiti öldüren, başka dinden olanlar ve mürtedler mîrâs alamaz" (s.1027-1028 tahmini); kaynakMetin İskât maddesinin başı (ilgisiz). Satır5 kitapta "Babası sâhib çıkmıyan veled-i zinâ, babasına vâris olamaz" — şart düşmüş (Y). 3-65'teki "Katle yardım eden de, kâtil gibi mîrâs alamaz" yok
- 114 zevil_erham_bes | düzeltilmeli(Y) | 5 sınıf doğru ama III, IV, V sınıflarının kitaptaki üyeleri eksik (III: "anadan erkek kardeş çocukları", torunlar; IV: "Her nev’ amca kızları ve hepsinin çocukları"; V: "babanın anadan amcaları, ananın amcaları…")
- 115 zevil_erham_tercih | düzeltilmeli(Y) | satır1'de "veyâ bunlardan yalnız zevc, zevce varsa" düşmüş; son satırda "ve içlerinde vâris ile bağlanan yoksa" şartı düşmüş; kitaptaki "vâris ile bağlanan vâris olur" ve "Yakınlık ciheti farklı ise … üçde iki … üçde bir" kaideleri yok
- 118 nezr_iki_turlu | düzeltilmeli(Y,B) | satırlar 1-82 aynen; "Şarta bağlı nezr" satırında kitabın hemen ardındaki köşeli parantez kaydı yok: "[Yerine getirmeyip, yemîn keffâreti yapması da câiz olduğu (Fetâvâ-yı Hayriyye)de yazılıdır…" ve "Hâsıl olmasını istemediği birşeyi şart ederse … isterse yapar. İstemezse, yapmayıp, yemîn keffâreti verir" (Y). kaynakMetin iki paragrafı "1 —" atılarak birleştirmiş (B)
- 122 subheler_uc_kisim | düzeltilmeli(B) | 3 kalem 2-40 @6496 (s.608) aynen; kaynakMetin maddenin girişi (ilgisiz), sahife 607→608
- 123 zaruret_ruhsatlari | düzeltilmeli(B) | 5 satır 2-41 @1318 (Redd-ül-muhtâr nakli) ve Bezzâziyye nakli aynen; kaynakMetin Berîka'nın harâm yiyecekler listesinin başı (ilgisiz); "soğukdan, sıcakdan" → "soğukdan" (önemsiz)
- 124 altin_gumus_hukumleri | düzeltilmeli(Y) | 5 satır 2-41 @8806 aynen; "Kadınlarda zînet" satırında hemen ardındaki kayıt düşmüş: "Fekat, bunları [meselâ, parmağındaki yüzüğünü] mahrem olmıyan erkeklere göstermeleri harâmdır"; "zînet olarak" (başka ma'den yüzük) düşmüş
- 126 tutun_gorusleri | düzeltilmeli(K) | "Bahsin sonucu" satırı ("Tütün içmek, nihâyet şübheli kalmakdadır. Şübheliler ise harâm olur. Tütüne tehlükeli demek insâf olur") Berîka (Hâdimî) naklinin içinden (@8739, s.631); kitabın kendi sonucu tersi: "Yukarıdaki örnek yazılardan anlaşılıyor ki, tütün içmek … harâm edilmemişdir … Tütün böyle değildir" (@19657, s.633). Ayrıca Şâfi'î "tenzîhen mekrûh", Nablüsî "mubâhdır, halâldir", Alî Echürî "dört mezheb âlimleri sözbirliği ile" görüşleri tabloda yok
- 112 nikah_sartlari_mezhebler | düzeltilmeli(Y) | satırlar 2-34 @7100-13770 var; Hanefî şâhid hücresinde "[fıskı belli olsa da]" düşmüş (Şâfi'î/Hanbelî ile farkı bu); velî sırası kitapta "bu üç mezhebde" (Mâlikî dahil); Şâfi'î "oğul ve onun oğlu velî olmaz" kaydı yok
- 128 israf_bes_bahs | düzeltilmeli(K) | 5 kalem 2-44 bahs başlıklarıyla aynı; kaynakMetin'in "Kötü bir huydur."dan sonrası uydurma ("İKİNCİ BAHS — Yimekde isrâf. ÜÇÜNCÜ BAHS — İçmekde isrâf. DÖRDÜNCÜ BAHS — Giyinmekde isrâf. BEŞİNCİ BAHS — Binalarda isrâf. Her birinde haddi aşmak isrâfdır.") — kitabın başlıklarıyla çelişiyor
- 129 para_vermek_iki_turlu | düzeltilmeli(Y) | 2 satır 2-44 (@24534, @29242); 2. satırda "Lüzûmu olan yere, lüzûmundan fazla vermek de isrâf olur" düşmüş
- 130 yimek_adabi | düzeltilmeli(Y) | 11 kalem 2-45'te var; hepsi "sünnet" etiketli ama 3'ü için kitap sünnet demiyor: "Acıkmadan yimemeli, doymadan kalkmalı", "Ekmeği … iki eli ile koparmalıdır", "Lokma küçük olmalı ve iyi çiğnenmelidir"

## "Doğru" sayılan tabloların dayanağı
- 66 kan_gruplari | doğru | kaynak 3-54 doğru; 4 satır kitapta ("dört dürlü kan gurubu vardır: 1 — 0 [sıfır] grubu…"), ifade yakın özet
- 67 uc_vazife | doğru | 3 satır aynen 1-11
- 68 dunyayi_terk | doğru | 2 satır 1-11 ("Birisi…", "İkincisi, dünyâda harâm ve şübheli…")
- 69 kafirler_iki_tur | doğru | 2 satır 1-11; (ülûhiyyet sıfatı) parantezi düşmüş, önemsiz
- 70 gunahlar_ikiye | doğru | 1-31 Rıyâd-un-nâsıhîn nakli; ikinci kısım uzakta (@46166) ama kitapta
- 71 yetmisiki_bidat_firka | doğru | 9 fırka aynen Gunye nakli
- 72 eshab_iftiracilari | doğru | 3 grup aynen 1-31
- 73 din_bilgileri_ikiye | doğru | 3-70 aynen; "Nûr ve Feyz" parantezleri düşmüş
- 74 ulum_ogrenme_hukmu | doğru(B) | 3 satır 1-11 aynen; başlıktaki "Üç Tabakadadır" kitapta yok (B)
- 79 talak_ayrilik | doğru | 6 satır 2-36'da (s.580-583); "derhâl bozulur" Mecmû'a-i Zühdiyye nakli, "üçden az bâin" İddet paragrafı
- 87 zihar | doğru | 4 satır 2-36 aynen (s.584)
- 89 iddet | doğru | 7 satır 2-36 aynen (s.584)
- 90 hidane | doğru | 4 satır 2-36 aynen (s.584-585); kaynakMetin başında iddet cümleleri var (önemsiz)
- 82 nikahi_caiz_olmiyanlar | doğru | 3 satır 2-34 @23523 aynen (s.569)
- 83 nesebden_yedi_mahrem | doğru | 7 kalem 2-34 aynen
- 84 sut_ile_hukum | doğru | 4 satır 2-34 aynen
- 85 nikah_sebebi_dort_kadin | doğru | 4 kalem 2-34 aynen (kitap da 3. ve 4.'yü bu cümlelerle veriyor)
- 91 sut_cocuklugu_mezhebler | doğru | 4 satır 2-37 aynen
- 92 sut_akrabaligi | doğru | 5 satır 2-37 aynen
- 96 nafaka_bes_sebeb | doğru | 2-38'de "Nafakayı veyâ bunların parasını vermek, beş sebeble farz olur: 1 — Zevcesi … 5 — Kölenin, câriyenin"
- 97 zevce_nafakasi | doğru | 7 satır 2-38 (@1538, @8154 nâşize, @13572 iddet) aynen
- 98 cocuk_nafakasi | doğru | 5 satır 2-38 @14331-15347; "bâlig olan hasta oğula iyi oluncaya kadar" düşmüş (önemsiz)
- 99 anababa_nafaka | doğru | 4 satır 2-38 @16045, @17028 (Fetâvâ-i Hayriyye), @31994
- 100 mahrem_nafaka | doğru | 3 satır 2-38 @17488, @18975
- 101 nafaka_uc_sey | doğru | 2-38 başı "yiyecek, giyecek ve ev … mutbah masrafı ve giyim eşyâsı masrafı ve ev kirâsı ile ev eşyâsı masrafıdır"
- 110 insanin_kullandigi | doğru | 5 satır 2-38 @24566 (Uyûn-ül-besâir nakli) aynen; zînet tarifi kitapta köşeli parantez içinde
- 102 olcu_birimleri | doğru(B) | 2 satır 1-78 @15246; satır1 imlâ: "Peygamber Efendimiz (sallallahü aleyhi ve sellem) zamanında" ← kitap "Peygamberimiz “sallallahü teâlâ aleyhi ve sellem” zemânında" (B)
- 103 mal_ikiye_ayrilir | doğru | 3-4 aynen
- 104 havale_uc_sekil | doğru | 3-13 aynen
- 105 ibadetler_on_kisim | doğru | 3-3 Hilyet-ül-evliyâ nakli aynen ("Büyüklerden çoğu buyurdu ki")
- 107 emval_zahire_batina | doğru | 1-78 @70699 İbni Âbidîn nakli aynen
- 108 mulk_sahibi_uc_yol | doğru | 2-29 Mecelle 1248 aynen
- 113 feraizte_takdiren | doğru | 3-64 Mültekâ nakli aynen
- 116 yemin_keffareti | doğru | 4 şekil 1-83 @10689 aynen
- 117 yemin_keffaret_kayitlar | doğru | 4 satır 1-83 (@11950, @12250, @14046) aynen
- 119 adak_vasiflar | doğru | 3 satır 1-82 aynen; vakf gerekçesi kısaltılmış (kitap: "Çünki vakf, müslimânlar için câmi’ binâ etmeğe benzemekdedir. … vakf başlı başına ibâdetdir")
- 120 farz_adamak | doğru(B) | 5 satır 1-82 @7330-9300 aynen; başlıkta "Hac" var ama tablodan hac misâli/hac adağı satırı çıkarılmış (B)
- 121 vera_dereceleri | doğru | 5 derece 2-40 (@4873-12126) aynen
- 125 ipek_hukumleri | doğru | 6 satır 2-41 @16966 Dürr/Redd nakli aynen
- 127 yimegi_haram_eden | doğru | 2-43 @5101 Berîka nakli aynen

## Denetlenemeyen kısımlar
- Yok. Yalnız sahîfe düzeltmeleri çapalardan tahmin edildiği için ±1 sahîfe şaşabilir; madde atıfları ise kesindir.
- Bütün satırlar kitapta bulundu; "bulunamadı" kalan satır yok.

## Genel kanaat
**Düzeltilerek kullanılabilir.** Bu 65 tablonun içeriği büyük ölçüde kitaptan kelimesi kelimesine alınmış; uydurma satır, yanlış sayı ya da
hüküm kelimesi değişikliği (bir istisnâ: `yimek_adabi` etiketleri) yok. Asıl zaaflar üç türdür: (a) **kesme** — satırın hemen ardındaki şart,
istisnâ ya da mezheb farkı düşürülmüş (25 Y bulgusu); (b) **"Kitaptan" alıntısı** çoğu yerde ilgisiz paragraftan (maddenin girişinden) alınmış,
ikisinde ise değiştirilmiş/uydurma (`sut_cocuklugu_haller`, `israf_bes_bahs`); (c) bir tabloda (`tutun_gorusleri`) bir nakil kitabın kendi
sonucu gibi sunulmuş ve kitabın vardığı sonucun tersi gösterilmiş — bu satır mutlaka düzeltilmeli. kaynakMetin alanlarının hepsi, satırların
geçtiği paragraftan aynen alınacak şekilde yeniden üretilmeli.
