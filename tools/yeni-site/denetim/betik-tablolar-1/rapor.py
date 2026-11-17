import json, collections
exec(open('gen.py').read().split("d = json.load")[0].split("json.dump(B")[0])
exec("H="+open('gen.py').read().split("H = ",1)[1].split("\nd = json.load")[0])
B = json.load(open('/Users/raufenc/Documents/Claude 2/ilmihal-site/tools/yeni-site/denetim/tablolar-1.json'))
d = json.load(open(f"{KOK}/tablolar/dizin.json"))['tablolar'][:65]
tot = collections.Counter(x['sinif'] for x in B)
kes = collections.Counter(x['sinif'] for x in B if x['kesin'])
by = collections.defaultdict(list)
for x in B: by[x['kimlik'].split(' / ')[0]].append(x)
L=[]
L.append("# Fevâid denetimi — Tablolar, birinci parça (dizindeki ilk 65 tablo)\n")
L.append("Konu: `tablolar-1`. Bulgu listesi: `tools/yeni-site/denetim/tablolar-1.json`. Betikler: `tools/yeni-site/denetim/betik-tablolar-1/`.\n")
L.append("## Yöntem ve kapsam\n")
L.append("""- Kapsam: `veri/tablolar/dizin.json` içindeki `tablolar` dizisinin ilk 65 kaydı (`konu_haritasi` … `bidat_uc_tur`). `kitabin_tanimlari` (tip `tanimlar`) kurala göre ATLANDI (başka ajan denetliyor); yalnız varlığı not edildi. Denetlenen: **64 tablo**.
- Her tablonun bütün satırları/adımları/dalları TEK TEK okundu (64/64, örnekleme yok). Her satır, `kaynakMadde`deki madde metniyle karşılaştırıldı; madde metninde bulunamayan satırlar için bütün 241 madde normalleştirilmiş aramayla (şapka, kesme, büyük-küçük harf, boşluk farkı gözetmeksizin; `betik-tablolar-1/ara.py`) tarandı ve ilgili yerler okundu.
- `kaynakMetin` alıntılarının tamamı betikle (`kaynakmetin.py`, `kmfark.py`, `kesik.py`) madde metninde aynen/normalleştirerek arandı; farklar karakter karakter çıkarıldı. 57'si kitapta bulunuyor (çoğunda yalnız paragraf sonları boşluğa çevrilmiş); 7'si aynen bulunmuyor (`konu_haritasi`, `namaz_farzlari`, `uc_cesit_haci`, `fikh_dort_kisim`, `imansiz_on_sebep`, `islamiyyetin_temeli`, `bidat_uc_tur`), nedenleri aşağıda.
- Rapor ve JSON'daki bütün kitap alıntıları betikle (`dogrula.py`) yeniden madde metninde arandı; hepsi kitapta var (birkaçında yalnız satır sonu tek boşluğa indirildi). `konu_haritasi` bulgularındaki alıntılar madde başlığıdır (fihrist).
- Sahîfe: madde metninde sahîfe işareti olmadığı için bulguların `sahife` alanı yalnız tek sahîfelik maddelerde dolduruldu, öteki bulgularda `null` (madde kimliği verildi).
- Sınırlar: Kitabın 1–16. sahîfeleri (önsöz, fihrist) veride yok; s. 11 ve s. 16'ya dayanan iki derleme denetlenemedi. Hükmün başka maddede de geçip geçmediği her satır için aranmadı; bulunamayanlar 'kesin değil' diye işaretlendi.
""")
L.append("## Sayılar\n")
L.append(f"- Bulgu: **{len(B)}** — K (kitaba aykırı) **{tot['K']}**, D (dayanaksız) **{tot['D']}**, Y (yanıltıcı olabilir) **{tot['Y']}**, B (biçim) **{tot['B']}**. Kesin olanlar: K {kes['K']}, D {kes['D']}, Y {kes['Y']}, B {kes['B']}.")
hc = collections.Counter(v[0].split(' (')[0] for k,v in H.items())
L.append(f"- Tablo hükümleri (64 tablo): doğru **{hc['doğru']}**, düzeltilmeli **{hc['düzeltilmeli']}** (bunların 3'ünde içerik doğru, yalnız alıntı/atıf yanlış), kaldırılmalı **{hc['kaldırılmalı']}**, denetlenemedi **{hc['denetlenemedi']}**; atlanan 1 (`kitabin_tanimlari`).")
L.append("- 'Doğru' denen tablolarda her satır kitapta, aynı anlamda bulundu; yalnız imlâ/alıntı biçimi (B) bulguları olabilir.\n")
L.append("## En önemli bulgular\n")
L.append("""1. **`oruc_turleri` (K):** Keffâret orucu 'vâcib' sütununa konmuş. Kitap: “2- Mu’ayyen zemânda olmıyan farz oruclar: Kazâ ve keffâret orucları böyledir. Fekat, keffâret orucları farz-ı amelîdir.” (1-79)
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
""")
L.append("## Tablo hükümleri çizelgesi\n")
L.append("| # | Kimlik | Başlık | Tip | Atıf | Kaynak doğru mu | Hüküm | Bulgu (sınıf) |")
L.append("|---|---|---|---|---|---|---|---|")
L.append(open('cizelge.md').read())
L.append("\n## Ayrıntı: hükmü 'doğru' olmayan tablolar\n")
L.append("Her bulgu: **kimlik** [sınıf, kesin/değil] — derleme / kitap / açıklama / öneri. Tam liste JSON'dadır.\n")
dogru = {k for k,v in H.items() if v[0]=='doğru'}
for i,t in enumerate(d,1):
    if t['id'] in dogru or t['id']=='kitabin_tanimlari': continue
    L.append(f"### {i}. `{t['id']}` — {t['baslik']} → {H[t['id']][0]}\n")
    for x in by[t['id']]:
        L.append(f"- **{x['kimlik']}** [{x['sinif']}, {'kesin' if x['kesin'] else 'kesin değil'}]")
        L.append(f"  - Derleme: {x['derleme']}")
        L.append(f"  - Kitap ({x['madde'] or '—'}): {('“'+x['kitap']+'”') if x['kitap'] else 'bulunamadı'}")
        L.append(f"  - {x['aciklama']} Öneri: {x['oneri']}.")
    L.append("")
L.append("## 'Doğru' tablolar (yalnız biçim notları)\n")
for i,t in enumerate(d,1):
    if t['id'] not in dogru: continue
    notlar = '; '.join(f"{x['kimlik'].split(' / ',1)[1]}: {x['aciklama']}" for x in by[t['id']]) or 'not yok'
    L.append(f"- {i}. `{t['id']}` — {notlar}")
L.append("\n## Denetlenemeyen kısımlar\n")
L.append("""- `islamiyyetin_temeli` (s. 16) ve `konu_haritasi` alıntısı (s. 11): kitabın 1–16. sahîfeleri veride yok; PDF ile karşılaştırılmalı.
- `kitabin_tanimlari`: atlandı (başka ajanın parçası).
- Bir satırın kitapta 'bulunamadı' denmesi bütün maddelerde normalleştirilmiş arama ile yapıldı; başka kelimelerle anlatılmış olabilecek yerler için 'kesin değil' işareti konuldu.
""")
L.append("## Genel kanaat\n")
L.append("""**Düzeltilerek kullanılabilir; iki tablo kaldırılmalı.** 64 tablonun 18'i satır satır kitapla aynı; 43'ü kitaba dayanıyor ama düzeltilmeli. Düzeltmelerin çoğu üç türde toplanıyor: (1) kitabın 'Hanefîde', 'üç mezhebde', 'ba’zılarına göre' gibi kayıtlarının ve şartlarının düşmesi; (2) 'Kitaptan' diye gösterilen alıntının tabloyla ilgisiz bir yerden alınması, kırpılması ya da kitapta olmayan cümle içermesi; (3) kitapta olmayan ayrıntıların (rek'at aralıkları, dakîkalar, 'sağdan başlamak', 'pul ve solungaç', 'nûrdan yaratılmış' vb.) eklenmesi. 14 yerde hüküm sınıfı ya da tarif kitaba aykırı (K); bunlar öncelikle düzeltilmeli. `nafile_namazlar` ve `haram_helal_yiyecekler` büyük ölçüde kitapta dayanaksız olduğu için kaldırılmalı ya da kitaptan yeniden kurulmalı. Kitabın listelerini aynen aktaran tablolar (on mübârek gece, vera’nın on şartı, selâm hükümleri, tâbi’ olmanın yedi derecesi, kefen, ef’âl/amel ayrımı, Kur'ân ahkâmı vb.) güvenilir.
""")
open('/Users/raufenc/Documents/Claude 2/ilmihal-site/tools/yeni-site/denetim/tablolar-1.md','w').write('\n'.join(L))
print(len('\n'.join(L)))
