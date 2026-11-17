# Denetim: sitenin kendi yazdığı metinler (`sualler`)

Kapsam: bilgi testi, günün suâli, arama cevap özetleri, konu rehberleri, konu eşlemesi, kısım açıklamaları, madde başlıkları, madde özetleri, arama eş anlamlıları, arayüz tanıtım cümleleri, bölüm adı ("Fevâid").
Ölçüt: yalnız kitabın metni (`veri/madde/*.json` → `metin`). Bulgu listesi: `tools/yeni-site/denetim/sualler.json` (118 kayıt). Betikler: `tools/yeni-site/denetim/betik-sualler/` (`ara.py` normalleştirilmiş kitap araması; `test_alinti.py`, `gunun.py`, `ozet.py`, `baslik.py`, `bulgular.py` — bulgulardaki her kitap alıntısı bu betikle metinde aranıp doğrulandı; `cizelge.py`).

## Yöntem ve kapsam

| Parça | Kayıt | Nasıl |
|---|---|---|
| Bilgi testi | 43 soru (8 konu; `karisik` boş) | 43'ü TAM okundu; açıklamadaki tırnaklı alıntılar betikle kitapta arandı (19 alıntının 18'i aynen var); her soru için doğru şık ve yanlış şıklar ilgili maddede arandı |
| Günün suâli | 155 | 155'i betikle maddede arandı (155'i de aynen var, başlıklar fihristle aynı); her birinin öncesi/sonrası (60/200 harf) okundu; 15 kaydın geniş bağlamı ayrıca okundu |
| Arama cevap özetleri | 229 (`ifadeler` + `cevapOzet`) | 229'u TAM okundu, madde başlığıyla yan yana konuldu; başlığı aşan her hüküm cümlesi (~45 kayıt) maddede arandı |
| Eş anlamlılar | 392 anahtar | 392'si TAM okundu; şüpheli çiftler kitapta arandı |
| Rehberler | 8 rehber, 142 madde satırı | TAM; sıra betikle fihrist sırasına karşılaştırıldı |
| Konu eşlemesi | 10 konu, 241 madde (24'ü iki konuda) | TAM (başlıklara göre); boş kalan madde yok |
| Kısım açıklamaları | 3 | TAM |
| Madde başlıkları | 241 | betikle metnin başlık satırıyla karşılaştırıldı; farklı 92'si okundu |
| Madde özetleri | 241 | betikle (kelime kelime, kesilme yeri, giriş türü) |
| Arayüz | 11 görünüm dosyası | sabit metinler grep ile çıkarıldı, ~60 cümle okundu |

Sınıf sayıları (bulgu listesinde): **K 5 · D 3 · Y 81 · B 29** (toplam 118; Y'lerin 33'ü tek tek günün suâli kaydıdır).

## 1. Bilgi testi (43 soru)

Sonuç: **33 doğru, 10 düzeltilmeli, 0 kaldırılmalı.** Doğru şık 43'ünde de kitapla çelişmiyor; zekât nisâbında daha önce düzeltilen hata yerinde ("Altının nisâbı yirmi miskaldir" … "13,3 adet altın, 96 gram olur", 1-78). Sorunlar açıklamada ve mezheb kaydında:

- **test / namaz / 3 (Y):** "Abdesti bozan hallerden değildir?" — "Kan gelmesi" şıkkı kitaba göre yalnız hanefîde bozar: "Üçüncüsü, deriden çıkan kan, cerâhat, sarı su, ağrılı çıkan renksiz su, hanefîde bozar. Bunların, mâlikîde ve şâfi’îde abdesti bozmadıkları … yazılıdır" (1-52). Mezheb belirtilmeyince iki doğru cevap oluyor.
- **test / namaz / 6 ve 7 (Y):** vâcibler ve seferde kasr hanefîye göre; kitap 1-65'te "hanefîde vâcib, mâlikîde sünnet-i müekkede, şâfi’îde efdaldir" der.
- **test / namaz / 8 (D):** açıklamadaki "rükû ve secdesi yoktur" kitapta yok; kitap: "Cenâze nemâzının farzı ikidir: 1 — Dört kerre tekbîr getirmekdir. 2 — Ayakda kılmakdır." (3-57).
- **test / oruc / 1 (D):** "bu, hicretin ikinci yılıdır" sitenin hesabı; kitap: "Oruc, hicretden onsekiz ay sonra, Şa’bân ayının onuncu günü, Bedr gazâsından bir ay evvel farz oldu" (1-79).
- **test / iman / 3 (B):** alıntı K1/M5'e atfedilmiş, kitapta 1-26'da ve kısaltılmış ("Ehl-i sünnetin reîsi, fıkhın kurucusu, imâm-ı a’zam Ebû Hanîfedir").
- **test / namaz / 2 (B):** "Eûzü okumak ise sünnettir" 1-52'de değil 1-64'te.
- **test / zekat / 2, 4; hac / 5 (Y):** genelleme ya da mezheb kaydı eksik (672 gram kitapta "Hanefîde").
- Yazım (B, bütün test): "Namaz", "Oruç", "rekât", "İman ve İtikat" — kitap "nemâz" (2 446 kez; "namaz" hiç geçmez), "oruc", "rek’at", "îmân". Hürmet ifadeleri yerinde.

Hükümler çizelgesi:

| Konu / sıra | Soru (kısa) | Doğru şık | Hüküm |
|---|---|---|---|
| iman / 1 | İslâmın beş şartından ilki nedir? | Kelime-i şehâdet söylemek | doğru |
| iman / 2 | Ehl-i sünnet itikadında îmânın altı şartından biri değildir? | Tenâsühe inanmak | doğru |
| iman / 3 | Ehl-i sünnetin reîsi kimdir? | İmâm-ı a'zam Ebû Hanîfe hazr | düzeltilmeli (B) |
| iman / 4 | Peygamber Efendimiz (sallallahü aleyhi ve sellem) hangi şehi | Mekke-i mükerreme | doğru |
| iman / 5 | Kabirde suâl soracak iki meleğin ismi nedir? | Münker ve Nekîr | doğru |
| iman / 6 | Bid'at ne demektir? | Dinde sonradan çıkarılan şey | doğru |
| iman / 7 | Fıkıh ilmi ne demektir? | Yapılması ve yapılmaması lâz | doğru |
| iman / 8 | Kur'ân-ı Kerîm kaç sûredir? | 114 | doğru |
| namaz / 1 | Beş vakit namazda toplam kaç rekât farz vardır? | 17 | doğru |
| namaz / 2 | Namazın farzlarından (şartlarından) değildir? | Eûzü okumak | düzeltilmeli (B) |
| namaz / 3 | Abdesti bozan hallerden değildir? | Ağlamak | düzeltilmeli (Y) |
| namaz / 4 | Sabah namazının sünneti kaç rekâttır? | 2 | doğru |
| namaz / 5 | Namazda her rekâtta kaç secde yapılır? | 2 | doğru |
| namaz / 6 | Namazın vâciblerinden değildir? | Kıyâmda durmak | düzeltilmeli (Y) |
| namaz / 7 | Seferde (yolculukta) dört rekâtlık farz namazlar kaç rekât k | 2 rekât | düzeltilmeli (Y) |
| namaz / 8 | Cenâze namazında rükû ve secde var mıdır? | Hayır, ikisi de yok | düzeltilmeli (D) |
| oruc / 1 | Ramazan orucu ne zaman farz oldu? | Hicretin 2. yılında | düzeltilmeli (D) |
| oruc / 2 | Orucu bozmayan hallerden biri hangisidir? | Unutarak su içmek | doğru |
| oruc / 3 | İftar vakti ne zamandır? | Güneş batınca | doğru |
| oruc / 4 | İmsâk vakti ne demektir? | Oruca başlanan, yeme-içmenin | doğru |
| oruc / 5 | Oruçlu iken misvâk kullanmak orucu bozar mı? | Hayır bozmaz | doğru |
| zekat / 1 | Zekât vermek için en az ne kadar altın gerekir? | 20 miskal (96 gram) | doğru |
| zekat / 2 | Zekât, nisâb miktarı malın ne kadarıdır? | Kırkta biri (yüzde 2,5) | düzeltilmeli (Y) |
| zekat / 3 | Zekât kimlere verilmez? | Ana-babaya | doğru |
| zekat / 4 | Gümüşün zekât nisâbı kaç dirhemdir? | 200 dirhem | düzeltilmeli (Y) |
| zekat / 5 | Zekât ne zaman farz olmuştur? | Hicretin 2. yılında | doğru |
| hac / 1 | Peygamber Efendimiz (sallallahü aleyhi ve sellem) hicretin k | Onuncu | doğru |
| hac / 2 | Haccın farzlarından değildir? | Sa'y | doğru |
| hac / 3 | Arafat vakfesi hangi gün yapılır? | Zilhicce 9 (Arefe günü) | doğru |
| hac / 4 | İhrâmda iken yapılması yasak olan hallerden değildir? | Yemek yemek | doğru |
| hac / 5 | Umre ile hac arasındaki fark nedir? | Umrede vakfe yoktur | düzeltilmeli (Y) |
| ahlak / 1 | Kitapta nefs-i emmâre nasıl anlatılmaktadır? | Şehvetlere kavuşmak için ins | doğru |
| ahlak / 2 | Büyük günahlardan biri değildir? | Erken kalkmak | doğru |
| ahlak / 3 | Kitapta tevbenin şartlarından biri değildir? | Sadaka vermek | doğru |
| ahlak / 4 | Riyâ ne demektir? | İbâdeti başkasına göstermek  | doğru |

## 2. Günün suâli (155)

**`resmi` alanı:** `true` (90 kayıt) = kitapta "Süâl:" (ya da "Süâl 1 —") ile başlayan ve hemen ardından "Cevâb:" gelen suâl; `false` (65 kayıt, 91–155) = kitabın akan metninden alınmış soru cümlesi (çoğu retorik; birkaçı başkasının sözü içinde, ör. 123, 131). Arayüz bu alanı kullanmıyor.

**Kaynak:** 155 suâlin 155'i de gösterilen maddede kelime kelime var; `baslik` 155'inde fihristle aynı. Suâller sitenin yazısı değil, kitaptan aynen alınmış; alaycı/bilmece dili yok, dil kitabın dilidir. 90 resmî suâlin cevabı aynı maddede, hemen ardından "Cevâb:" ile gelir.

Sorunlar seçmede ve sunuşta:
- **15 kayıt (Y, itikad riski):** suâl kitabın reddettiği bir itirazı ya da yanlış öncülü taşıyor; kartta/paylaşımda tek başına kitabın sözü gibi okunabilir: 6, 18, 20, 21, 48, 54, 60, 62, 73, 78, 86, 87, 88, 111, 123. Örnekler: 62 "… belki bizim bilmediğimiz, başka sıfatları bulunan farklı bir ma’bûd dahâ bulunamaz mı?"; 73 "Bu sözlerden, tesavvuf büyüklerinin bâtıl bir yolda bulundukları … anlaşılıyor." (soru bile değil); 60 "… bu hakîkate kavuşan ârif, islâmiyyetden dışarı çıkmakdadır."; 123 "Müslimânları sevmemiz, vehhâbîleri de kardeş bilmemiz lâzım değil mi?" (kitapta "Ba’zı kimseler … diyorlar" diye aktarılır).
- **18 kayıt (Y, bağlamsız):** öncesine bağlı ya da soru olmayan cümleler: 16, 17, 23 ("… derse:"), 29 ("Fenâ ve Bekâyı soruyorsunuz."), 37, 38, 40 ("… denirse:"), 46, 50, 51, 61, 74, 84, 85, 89, 118, 132, 139.
- **65 retorik soru (Y, toplu):** "Cevabını kitapta okuyun" deniyor ama kitapta ayrı cevap yok.
- **sual / 12 (B):** görsel kart "Cevabı: Nemâzda otururken parmak kaldırmak" basıyor; Ravda suâlinin cevabı bu değil. Kart her kayıtta madde başlığını "Cevabı:" diye basıyor.
- **Yazım (B):** kitap her yerde "süâl" yazar (Süâl 92, süâl 24 … kez; "suâl" hiç yok).

Hükümler (sıra:hüküm; "doğru" = kitapta aynen var, cevâbı aynı maddede, tek başına okunabilir):

1:doğru · 2:doğru · 3:doğru · 4:doğru · 5:doğru · 6:Y · 7:doğru · 8:doğru · 9:doğru · 10:doğru · 11:doğru · 12:B · 13:doğru · 14:doğru · 15:doğru · 16:Y · 17:Y · 18:Y · 19:doğru · 20:Y · 21:Y · 22:doğru · 23:Y · 24:doğru · 25:doğru · 26:doğru · 27:doğru · 28:doğru · 29:Y · 30:doğru · 31:doğru · 32:doğru · 33:doğru · 34:doğru · 35:doğru · 36:doğru · 37:Y · 38:Y · 39:doğru · 40:Y · 41:doğru · 42:doğru · 43:doğru · 44:doğru · 45:doğru · 46:Y · 47:doğru · 48:Y · 49:doğru · 50:Y · 51:Y · 52:doğru · 53:doğru · 54:Y · 55:doğru · 56:doğru · 57:doğru · 58:doğru · 59:doğru · 60:Y · 61:Y · 62:Y · 63:doğru · 64:doğru · 65:doğru · 66:doğru · 67:doğru · 68:doğru · 69:doğru · 70:doğru · 71:doğru · 72:doğru · 73:Y · 74:Y · 75:doğru · 76:doğru · 77:doğru · 78:Y · 79:doğru · 80:doğru · 81:doğru · 82:doğru · 83:doğru · 84:Y · 85:Y · 86:Y · 87:Y · 88:Y · 89:Y · 90:doğru · 91:doğru · 92:doğru · 93:doğru · 94:doğru · 95:doğru · 96:doğru · 97:doğru · 98:doğru · 99:doğru · 100:doğru · 101:doğru · 102:doğru · 103:doğru · 104:doğru · 105:doğru · 106:doğru · 107:doğru · 108:doğru · 109:doğru · 110:doğru · 111:Y · 112:doğru · 113:doğru · 114:doğru · 115:doğru · 116:doğru · 117:doğru · 118:Y · 119:doğru · 120:doğru · 121:doğru · 122:doğru · 123:Y · 124:doğru · 125:doğru · 126:doğru · 127:doğru · 128:doğru · 129:doğru · 130:doğru · 131:doğru · 132:Y · 133:doğru · 134:doğru · 135:doğru · 136:doğru · 137:doğru · 138:doğru · 139:Y · 140:doğru · 141:doğru · 142:doğru · 143:doğru · 144:doğru · 145:doğru · 146:doğru · 147:doğru · 148:doğru · 149:doğru · 150:doğru · 151:doğru · 152:doğru · 153:doğru · 154:doğru · 155:doğru

## 3. Arama cevap özetleri (229) — en önemli kısım

Yapı: 229 kaydın ~190'ı madde başlığının yeniden yazılmışıdır ("… anlatılmaktadır / bildirilmektedir"); ~40'ı kendi hüküm cümlesini kurar. Hüküm cümlesi kuranlarda ciddi sorunlar var:

- **cevap / 8 (K):** "Kur'ân-ı Kerîmi kendi görüşüne göre tefsir etmek büyük günahtır" — kitap (1-8): "(Kur’ân-ı kerîmden kendi aklı ile, kendi düşüncesi ve bilgisi ile ma’nâ çıkaran kâfirdir)". Küfr hükmü "büyük günah"a indirilmiş.
- **cevap / 16 (K):** "Muhabbetin alâmeti, sevilenin isteklerine uymaktır" — kitap (1-15): "Bunun alâmeti de, Onun düşmanlarını düşman bilmek, Onu beğenmeyenleri sevmemekdir."
- **cevap / 39 (K):** bid'at "Eshâb-ı kirâmın zamanından sonra" — kitap (1-34): "Peygamberimizin “sallallahü aleyhi ve sellem” ve dört halîfesinin “radıyallahü anhüm” zemânlarında bulunmayıp da, onlardan sonra, dinde meydâna çıkarılan, ibâdet olarak yapılmağa başlanan şeylerdir."
- **cevap / 51 (K):** "ağıza ve burna su vermek farzdır" — kitap (1-54): "gusl abdesti alırken ağzın içini yıkamak, hanefî ve hanbelî mezheblerinde farzdır" ve "şâfi’î ve mâlikî mezheblerinde … farz değildir".
- **cevap / 168 (D):** "Şirk, insan için en büyük tehlikedir" — 3-2'de yok; başlıktaki sayım ("Şirk, insan için hayvan kesmek, hırsızlık, …") yanlış okunmuş.
- **Y:** 3 (1-3'ün cevabı "… inandım … demek kâfîdir"; Kelime-i şehâdet yalnız başlıkta), 11 (îmân tarifi 1-3'te yok, 1-31'de: "îmân, kalbin tasdîk etmesi, kabûl etmesi, inanması demekdir"), 14, 62 (sefer mezheb farkı), 69 ("erkeklere" düşmüş), 79 ("sekiz sınıf" — 1-78 "yedi sınıf" der; hanefîde bir sınıfa vermek yeter), 83, 9 ("hangi meal guvenilir" → madde meâl önermez), 17 ve 90 (sorgu yanlış maddeye gidiyor).
- **B:** 26/89 ("mahlûk değildir" 1-91'de yok, 1-25'te: "Bu kelâm-ı ilâhî olan Kur’ân mahlûk değildir"); 6 yinelenen kayıt grubu (40-41-93, 107-120, 166-167, 207-212, 219-224, 92-105); `ifadeler` 6 sorguda iki farklı maddeye gidiyor (akil nedir, kabir hayati, komsu hakki, kurbiyet nedir, haramlar nelerdir, resulullaha uymak).
- **Toplu Y:** "Bu suâlin cevabı" başlığı ~190 "anlatılmaktadır" kaydında yanıltıcı (cevap değil, madde tanıtımı). **Toplu B:** yazım (namaz, müslüman, itikad, kabir, dert, yani).
- Hürmet ifadeleri: Resûlullah ve Peygamber geçen her yerde "(sallallahü aleyhi ve sellem)" var; "Hz." yok.

Hükümler (sıra:hüküm; "doğru" = içerik kitapla çelişmiyor; toplu Y/B bunlar için de geçerli):

1:doğru · 2:doğru · 3:Y · 4:doğru · 5:doğru · 6:doğru · 7:doğru · 8:K · 9:Y · 10:doğru · 11:Y · 12:doğru · 13:doğru · 14:Y · 15:doğru · 16:K · 17:Y · 18:doğru · 19:doğru · 20:doğru · 21:doğru · 22:doğru · 23:doğru · 24:doğru · 25:doğru · 26:B · 27:doğru · 28:doğru · 29:doğru · 30:doğru · 31:doğru · 32:doğru · 33:doğru · 34:doğru · 35:doğru · 36:doğru · 37:doğru · 38:doğru · 39:K · 40:B · 41:B · 42:doğru · 43:doğru · 44:doğru · 45:doğru · 46:doğru · 47:doğru · 48:doğru · 49:doğru · 50:doğru · 51:K · 52:doğru · 53:doğru · 54:doğru · 55:doğru · 56:doğru · 57:doğru · 58:doğru · 59:doğru · 60:doğru · 61:doğru · 62:Y · 63:doğru · 64:doğru · 65:doğru · 66:doğru · 67:doğru · 68:doğru · 69:Y · 70:doğru · 71:doğru · 72:doğru · 73:doğru · 74:doğru · 75:doğru · 76:doğru · 77:doğru · 78:doğru · 79:Y · 80:doğru · 81:doğru · 82:doğru · 83:Y · 84:doğru · 85:doğru · 86:doğru · 87:doğru · 88:doğru · 89:B · 90:Y · 91:doğru · 92:B · 93:B · 94:doğru · 95:doğru · 96:doğru · 97:doğru · 98:doğru · 99:doğru · 100:doğru · 101:doğru · 102:doğru · 103:doğru · 104:doğru · 105:B · 106:doğru · 107:B · 108:doğru · 109:doğru · 110:doğru · 111:doğru · 112:doğru · 113:doğru · 114:doğru · 115:doğru · 116:doğru · 117:doğru · 118:doğru · 119:doğru · 120:B · 121:doğru · 122:doğru · 123:doğru · 124:doğru · 125:doğru · 126:doğru · 127:doğru · 128:doğru · 129:doğru · 130:doğru · 131:doğru · 132:doğru · 133:doğru · 134:doğru · 135:doğru · 136:doğru · 137:doğru · 138:doğru · 139:doğru · 140:doğru · 141:doğru · 142:doğru · 143:doğru · 144:doğru · 145:doğru · 146:doğru · 147:doğru · 148:doğru · 149:doğru · 150:doğru · 151:doğru · 152:doğru · 153:doğru · 154:doğru · 155:doğru · 156:doğru · 157:doğru · 158:doğru · 159:doğru · 160:doğru · 161:doğru · 162:doğru · 163:doğru · 164:doğru · 165:doğru · 166:B · 167:B · 168:D · 169:doğru · 170:doğru · 171:doğru · 172:doğru · 173:doğru · 174:doğru · 175:doğru · 176:doğru · 177:doğru · 178:doğru · 179:doğru · 180:doğru · 181:doğru · 182:doğru · 183:doğru · 184:doğru · 185:doğru · 186:doğru · 187:doğru · 188:doğru · 189:doğru · 190:doğru · 191:doğru · 192:doğru · 193:doğru · 194:doğru · 195:doğru · 196:doğru · 197:doğru · 198:doğru · 199:doğru · 200:doğru · 201:doğru · 202:doğru · 203:doğru · 204:doğru · 205:doğru · 206:doğru · 207:B · 208:doğru · 209:doğru · 210:doğru · 211:doğru · 212:B · 213:doğru · 214:doğru · 215:doğru · 216:doğru · 217:doğru · 218:doğru · 219:B · 220:doğru · 221:doğru · 222:doğru · 223:doğru · 224:B · 225:doğru · 226:doğru · 227:doğru · 228:doğru · 229:doğru

## 4. Konu rehberleri (8)

- Sekizinde de madde sırası kitap sırası değil (namaz: 1-57→1-51, 1-76→1-65, 3-57→1-75; îmân 8, ahlâk 9 geri dönüş); "kitabın sırasıyla adım adım" iddiası tutmuyor (Y).
- **iman-rehberi (Y):** îmânın esâslarını toplu anlatan 1-46 ("Âhırete inanmak, Allahü teâlâya inanmak gibi, îmânın şartıdır") yok; kabr azâbı (1-40, 2-20) yok. **yeni-musluman (Y):** İslâmın beş şartı (1-46) yok.
- **hac-rehberi (Y):** 2-18 genel kabr ziyâreti/şefâ'at maddesi, 1-53 mest; haccın bütün içeriği yalnız 1-84'te. **zekat-rehberi (B):** 1-46 notuna "(islâmın beş şartı)" eki; yemîn (1-83) zekâtla ilgisiz.
- ahlak-rehberi, aile-rehberi: maddeler başlıklarına göre konuyla uyumlu.
- Adlar ve açıklamalar kitabın yazımına uymuyor (Namaz, Oruç, İman ve İtikat, Müslüman) (B).

## 5. Konu eşlemesi, kısım açıklamaları, madde başlıkları

- **konular.json:** 241 maddenin hepsi en az bir konuda. Uyumsuzluklar (Y): zekat → 1-83 yemîn; hac → 2-18; cenaze → 3-67, 3-68, 3-69 (sıkıntı, kazâya rızâ); iman → 2-31…33 (atom), 3-54, 1-28, 1-44, 1-18 (kesin değil); ahlak → 2-41…43, 2-46, 2-56 (kesin değil).
- **Kısım açıklamaları (B):** sitenin yazısı; yazımı kitaba uymaz (İman, itikadı, namaz, oruç, fıkıh, mezhepler, helâl-haram, kabir, ceza hukuku); kitap "İKİNCİ KISM", "ÜÇÜNCÜ KISM" der. I. kısımda tesavvuf (1-50), emr-i ma’rûf (1-41), takvîm (1-86…89), Îsâ aleyhisselâm (1-92, 93) anılmıyor.
- **Madde başlıkları (B, kesin değil):** metninde başlık satırı olan 104 maddenin yalnız 12'sinde fihrist başlığı aynı; 92'si genişletilmiş (1-52 metin "NEMÂZIN FARZLARI (ABDEST ALMAK)" ↔ "Abdest almak. Abdesti bozan şeyler"; 2-18 "ŞEFÂ’AT, ÖLÜLERE YARDIM" ↔ "Kabr ziyâreti lâzımdır. Olgun rûhlardan istifâde edilir"; 2-21 "BOZUK DİNLER"; 2-17 "VEHHÂBÎLİK NEDİR?"; 2-27 "İSLÂM DÎNİ"; 2-39 "İSLÂMİYYET VE KADIN"). 137 maddede metinde başlık yok. Başlıklar eski sitenin `data.js`'inden geliyor; üslûpları kitabınkine benziyor, büyük ihtimalle basılı fihristtendir, ama fihrist sahîfeleri elimizdeki metinde olmadığı için doğrulanamadı. PDF fihristiyle karşılaştırılmalı.

## 6. Madde özetleri (241)

237'si maddenin başından kelime kelime alınmış (4'ü değil: 1-51, 2-4, 2-5, 3-61). 209'u cümle ortasında "…" ile kesiliyor; 87'si mektûbun tanıtım cümlesiyle ("Bu mektûb, … yazılmışdır:") başlıyor. Bunlar özet değil, "maddenin başı"dır (Y). **1-51 (B):** cedvel atlandığı için "Otuzüç farz şunlardır: Teyemmümün farzına iki diyenler de vardır." gibi anlamsız bir ek oluşmuş. **3-61 (B):** başlık satırının yarısı özete karışmış. Mevcut arayüzde "Özet" etiketi bulunamadı (`ozet` madde verisinde taşınıyor; nerede gösterildiği kesin değil).

## 7. Eş anlamlılar (392)

Çoğu yazım ya da dil karşılığı (vudu, salat, nemaz, kabr…) ve zararsız. Kitabın mendûb = müstehab eşitlemesi kitapta var ("Edeblere, mendûb ve müstehab da denir", 1-52). **farz ile vâcib eşitlenmemiş.** Sorunlu çiftler:
- **mest → mesh (Y):** biri giyecek, biri fiil.
- **içki ↔ şerâb, alkol → şerâb (Y):** kitap: "İçmesi harâm olan içkiler, dörtdür: 1 — Birincisi, şerâbdır" (2-42); hükümler ayrı.
- **peygamberimiz/resulullah → muhammed (Y):** İmâm-ı Muhammed, Muhammed Ma’sûm vb. de gelir. **peygamber → resul, nebi (Y, kesin değil):** kitap ayırır: "Resûllere tâbi’ olan bu Peygamberlere de, (Nebî) denir" (1-1).
- Y (kesin değil): bosanma → hul; sahur → seher; kira → ucret; tesettür/avret → setr; mufsid → bozar; ukubat → ceza; asure → muharrem; hanefi → imami azam; kelime i sehadet → sehadet; nafile namaz → nafile.
- **B:** kesme işaretinden bölünmüş parçalar: kur, rek, dil erkan, zir, ilik, cize, ita, tikad, sefa, cema, cum, emr ruf, bid, "gunah midir"; **et → yimek**.

## 8. Arayüz tanıtım cümleleri

- **K:** hukumler.js "Kitaptaki hükümler yedi türe ayrılmıştır" — kitap: "(Ef’âl-i mükellefîn) sekizdir. Farz, vâcib, sünnet, müstehab, mubâh, harâm, mekrûh, müfsid." (1-1).
- **Y:** "her hüküm kitaptaki cümlesiyle" (giris.js, hukumler.js) — 42 hüküm kaydı maddede aynen geçmiyor (VERI.md §8). "Kitaptan alınmış sorular" (test.js, giris.js, fevaid.js) — test soruları sitenin yazısı. hakkinda.js "Yorum yok, tefsir yok, kendi aklımızdan bir şey yok" — kitap metni için doğru, derlemeler için değil. "kitabın sırasıyla / baştan sona" (rehberler). Günün suâli kartında "Cevabı: <başlık>".
- **B:** "mübah, mekruh, haram" (fevaid.js); "Namaz, oruç, iman, Müslümanlar" (hakkinda.js); "Her kayıt … maddesine bağlıdır" (ayet-hadis.js: 7 kayıtta madde yok; tablolar.js: 3 tabloda).
- Yerinde olanlar: fevaid.js "Bu dizinler kitabın kendisi değildir; kitaptan sonradan derlenmiştir … esas olan kitabın metnidir."; giris.js "Kitabın kendisi değil, kitaptan derlenmiş dizinlerdir"; tablolar.js "hükmün aslı için kitabın ifadesi esastır"; hürmet ifadeleri eksiksiz.

## 9. Bölümün adı ("Fevâid")

Durum: kodda sayfa başlığı zaten "Kitaptan Derlenenler" (yorum: "eski adı Fevâid"); üst yazı "Dizinler ve cedveller"; adres `/fevaid` ve iç adlar "fevaid".

Kitapta kullanım:
- **fevâid** yalnız başka eserlerin adı içinde geçer (8 kez): "(Fevâid-i câmi’a)da yazılıdır" (2-45), "(Fevâid-i Osmâniyye)deki mıska" (2-46), "(Fevâid-ül-füâd) ve (Siyer-ül-evliyâ) kitâblarında" (2-52, 2-72), "(Mecmû’a-tül-fevâid) kitâbında" (2-53), "(Ferâid-ül-fevâid) ismindeki (Âmentü şerhı)" (3-58). Hepsi âlimlerin yazdığı müstakil eserlerdir. Tekili "fâide" kitapta yüzlerce kez "fayda" anlamında geçer; ayrıca kitap yayınevinin "(Fâideli Bilgiler) kitâbının 27.ci sahîfesini" anar (1-11).
- **Kitabın kendi ekleri:** "[Kitâbın sonundaki ism cedvelinde (Barnabas) ismine bakınız!]" (1-24; benzeri 1-31, 2-5); "kitâbımızın sonundaki cedvelde gösterilmişdir" (1-60, iki kez); "Bunların hepsi, kitâbımızın sonunda, harf sırası ile yazılarak, kısaca bilgi verilmişdir" (1-97); "kitâbımızın sonundaki, Abdüh kelimesinde yazılıdır" (2-17). Kitap kendi şahıslar ekine "ism cedveli", hesap tablolarına "cedvel" der.
- **fihrist:** bir kez, kitap listesi anlamında: "bu kitâbların ismlerini bildiren fihristler mevcûddur" (1-7). **hâl tercemeleri:** "talebesinden sekizyüzden fazlasının ismleri ve hâl tercemeleri kitâblarda yazılıdır" (1-7; ayrıca 2-5, 3-23). **lügat:** "lügat kitâbı" (1-25), "Lugat kitâblarında" (1-34). **miftâh:** yalnız eser adlarında: (Miftâh-un-necât), (Miftâh-us-se’âde), (Miftâh-ul-Cennet ilm-i hâli).

Değerlendirme: "Fevâid" adı uygun değil. (1) Kitapta bu kelime yalnız âlimlerin yazdığı müstakil eserlerin adıdır; bu bölümü de öyle bir eser gibi, kitaba eş değer "faydalı bilgiler" gibi gösterir. Oysa bölüm sonradan, büyük ölçüde makineyle derlenmiş dizinlerdir; bu denetimde içinde kitaba aykırı hükümler bulundu. (2) Yayınevinin "Fâideli Bilgiler" kitabıyla karışabilir. (3) Bölümün kitaptan çıkarılmış yardımcı bir dizin olduğunu söylemiyor.

Ad önerileri:

| Ad | Neyi doğru söyler | Neyi yanlış çağrıştırabilir |
|---|---|---|
| **Fihrist ve Cedveller** | Kitabın kendi kelimeleri ("ism cedveli", "kitâbımızın sonundaki cedvel"; "fihrist" 1-7); dizin ve tablo olduğu belli | Sitede "fihrist" içindekiler için de kullanılıyor; tek başına "sonradan derlendi" demez, alt yazı gerekir |
| **Kitaptan Derlenenler** (mevcut) | Derleme olduğunu açıkça söyler; bugünkü "kitabın kendisi değildir" notuyla tutarlı | Kitabın dilinden değil; kimin derlediği belli değil ("Sitenin derlediği" eklenebilir) |
| **Miftâh (Anahtar)** | Klasik kitap kültüründe bir esere açılan kılavuz/anahtar; yardımcı olduğunu söyler | Kitapta yalnız eser adlarında geçer (Miftâh-ul-Cennet…); müstakil bir eser izlenimi verebilir |
| **Zeyl: Derlenmiş Dizinler** | "Zeyl" bir esere sonradan eklenen ek demektir; asıl metinden ayrı olduğunu söyler | Klasik kullanımda zeyl çoğu zaman eserin devamı/tamamlayıcısıdır; içerik kitaba ait sanılabilir |
| **Yardımcı Dizinler** | Sade; kitabın yerine geçmediğini ve kılavuz olduğunu söyler | Kitabın dilinden değil; tablolar ve suâlleri tam karşılamaz |
| **İsm Cedveli, Lügat ve Fihristler** (bölüm başlıkları ayrı ayrı) | Kitabın kendi ek adlarını korur | Uzun; günün suâli ve test gibi parçaları kapsamaz |

Ad önerisi: üst başlık **"Fihrist ve Cedveller"**, hemen altında "Kitaptan sonradan derlenmiş yardımcı dizinler; esas olan kitabın metnidir" cümlesi. Kitabın kelimesini kullanır, derleme olduğunu da söyler. Adres `/fevaid` yönlendirmeyle korunabilir.

## Denetlenemeyenler

- Madde başlıklarının basılı kitabın fihristiyle karşılaştırılması (fihrist sahîfeleri metin verisinde yok).
- Kitabın kendi lügat ekinin adı: madde metinlerinde lügat ekine atıf bulunamadı.
- Günün suâlinde 90 resmî suâlin cevâbının içeriği tek tek okunmadı; cevabın aynı maddede hemen ardından geldiği betikle doğrulandı.
- Konu eşlemesinde maddeler başlıklarına göre değerlendirildi, metinleri okunmadı ("kesin değil" işaretli).
- Madde özetlerinin arayüzde nerede gösterildiği bulunamadı.

## Genel kanaat

- **Günün suâli:** suâller kitaptan aynen ve doğru maddeden alınmış. **Güvenilir**, 33 kayıt (15'i itikad riski taşıyan, 18'i bağlamsız) çıkarılır, retorik 65 kayıt ayrıca etiketlenirse.
- **Bilgi testi:** doğru şıklar kitapla uyumlu. **Düzeltilerek kullanılabilir:** 10 sorunun mezheb kaydı, açıklaması ya da atfı düzeltilmeli; "kitaptan alınmış sorular" denmemeli.
- **Arama cevap özetleri:** en sorunlu kısım. Kendi hüküm cümlesi kuran ~40 kaydın 4'ü kitaba aykırı (küfr hükmünün günaha inmesi, tanım ve alâmetin değişmesi, mezheb hükmünün genelleşmesi), 1'i dayanaksız, 10'u yanıltıcı. **Kaldırılmalı** (kitabın cümlesini ya da madde başlığını aynen gösteren "İlgili madde" kutusu kalabilir) ya da her özet kitaptan aynen alınmış bir cümleyle değiştirilmeli. Bugünkü hâliyle "Bu suâlin cevabı" başlığıyla sunulmamalı.
- **Rehberler ve konular:** **düzeltilerek kullanılabilir** (1-46 eklenmeli, "kitabın sırasıyla" kaldırılmalı, birkaç yanlış yerleştirme).
- **Kısım açıklamaları ve özetler:** düzeltilerek; özet adı "maddenin başı" olmalı.
- **Eş anlamlılar:** düzeltilerek (mest/mesh, içki/şerâb, muhammed; bozuk parçalar).
- **Arayüz:** "yedi tür" cümlesi kitaba aykırı; "kendi aklımızdan bir şey yok", "her hüküm kitaptaki cümlesiyle" ve "kitaptan alınmış sorular" cümleleri derlemeler için doğru değil, düzeltilmeli.
