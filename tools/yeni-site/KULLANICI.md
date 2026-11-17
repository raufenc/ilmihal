# Kullanıcı verisi ve okuma planı — API başvurusu

Görünüm yazan ajanlar yalnız bunu okur. İki modül: `js/cekirdek/kullanici.js` (kayıtlar) ve
`js/cekirdek/okuma-plani.js` (hesap). İkisi de DOM'a dokunmaz, bildirim göstermez, **hiçbir koşulda istisna fırlatmaz**.

```js
import { kullanici } from '/js/cekirdek/kullanici.js';
import { okumaPlani } from '/js/cekirdek/okuma-plani.js';   // ya da tek tek: import { durum, planKur } from …
```

**Temel kurallar**
- Eski sitenin 25 `localStorage` anahtarı aynı ad ve aynı biçimle okunur/yazılır (envanter §6). Doğrudan `localStorage` çağırmayın.
- Madde kimliği depoda hep `"1/43"`. Her işlev madde için şunlardan birini alır: `"1/43"`, `"1-43"`, `"K1/M43"`,
  `{kisim, no}`, `{kisim, madde_no}`, ya da `(kisim, no)` (iki bağımsız değişkenli işlevlerde).
  Yardımcılar: `kullanici.maddeCoz(x) → {kisim, no} | null`, `maddeAnahtari(x) → "1/43"`, `maddeTireli(x) → "1-43"`.
- Bozuk/eksik kayıt varsayılana düşer, **silinmez**. Bozuk bir kaydın üstüne yazmak gerekirse eski ham metin önce
  `ilmihal-bozuk-kayitlar` anahtarına saklanır (**yeni** anahtar: `{"ilmihal-bookmarks":["{bozuk"]}`).
- Gizli gezinti / dolu kota: yazma sessizce başarısız olur (`false`), oturum boyunca bellekte tutulur (depo.js), var olan veri bozulmaz.
- "Okundu" (`okunan`: madde **açıldı**) ile "bitirildi" (`bitirilen`: okuma planı için **bitirildi**) ayrı kavramdır; birleştirmeyin.

## kullanici.js

| Alan / işlev | Anahtar | Değer biçimi (gerçek örnek) | Not |
|---|---|---|---|
| `yerImleri.liste()` → `[{key,kisim,madde_no,baslik}]` | `ilmihal-bookmarks` | `[{"key":"1/52","kisim":1,"madde_no":52,"baslik":"Abdest almak…"}]` | eski düz metin `["1/52"]` de okunur (baslik `null`); tekrarsız |
| `yerImleri.varMi(m)`, `ekle(madde, baslik?)`, `cikar(m)`, `degistir(madde)` | 〃 | `ekle` yeni öğeyi nesne biçiminde sona ekler | `cikar` eski düz metin kaydı da siler; `degistir` yeni durumu (true=var) döndürür |
| `okunan.liste()`, `varMi(m)`, `isaretle(m)` | `ilmihal-read` | `["1/1","1/2","2/16"]` açılma sırası | yalnız yeni ise yazar |
| `gecmis.liste()`, `sonlar(n=12)`, `ekle(m)` | `ilmihal-read-history` | `["1/5","1/1"]` en çok 50, tekrarsız, **en yenisi sonda** | `sonlar` yeniden eskiye |
| `sonOkunan.al()` → `{kisim,madde_no,baslik,zaman}`\|null, `yaz(madde, zaman?)` | `ilmihal-son-okunan` | `{"kisim":1,"madde_no":52,"baslik":"…","zaman":1763371200000}` | "Kaldığınız yerden devam" |
| `maddeAcildi({kisim, madde_no, baslik}, zaman?)` | read + history + son-okunan | — | eski `openMadde`'nin kayıt kısmı; madde açılınca bunu çağırın |
| `notlar.hepsi()` → `{"1/52":[{text,date}]}`, `liste(m)`, `ekle(madde, metin, tarih?)`, `sil(madde, sira)`, `tarihCoz(date)` | `ilmihal-notlar` | `{"1/52":[{"text":"…","date":"17.11.2026"}]}` | `date` = `toLocaleDateString('tr-TR')` **görüntü metni** (ISO değil; eski kayıtta `5.11.2026` olabilir); metin kırpılır, boşsa `null`; boş kalan madde silinir; `tarihCoz` → `Date`\|null |
| `vurgular.hepsi()`, `liste(m)`, `ekle(madde, metin, renk?)` → sıra, `sil(madde, sira\|metin)` | `ilmihal-vurgulamalar` | `{"1/52":[{"text":"seçilen metin","renk":"#fff3b0"}]}` | konum yok, **metin eşlemesi**; aynı metin tekrar eklenmez (rengi güncellenir) |
| `vurgular.yerlestirmeRaporu(m, yerlesenler)` → `[{sira,text,renk}]`, `yerlesmeyenler()` | (bellek) | `yerlesenler`: yerleştirilebilen vurguların sıra no'ları ya da metinleri | yerleşmeyen vurgu **silinmez**, raporlanır (H-17 taşınmadı) |
| `VURGU_RENKLERI` | — | Sarı `#fff3b0`, Yeşil `#b8f0c8`, Turuncu `#ffd8a8`, Pembe `#ffc8d8` | |
| `yaziBoyutu.al()` → rem, `kayitliMi()`, `yaz(n)`, `degistir(±1)` | `ilmihal-font-size` | düz metin `"1.15"` (eski: `"1.1500000000000001"`) | 0,8–1,6, adım 0,1; yoksa 1.05; yeni yazımlar 2 ondalığa yuvarlanır |
| `okumaAyarlari.al()` (ham), `etkin()` → `{aralik,hiza,lugat}`, `yaz(alan, deger)` | `ilmihal-okuma-ayarlari` | `{"aralik":"2.3","hiza":"justify","lugat":false}` | `aralik` METİN `"1.7"\|"2"\|"2.3"` (vars. `"2"`), `hiza` `"left"\|"justify"` (vars. left), `lugat` boolean (yalnız `false` kapatır) |
| `sahifeAcik.al()`, `kayitliMi()`, `yaz(bool)` | `ilmihal-sahife-acik` | `"1"` \| `"0"` | ≥1100 px'te paneli açma tercihi |
| `fihristGizli.al()`, `kayitliMi()`, `yaz(bool)` | `ilmihal-fihrist-gizli` | `"1"` \| `"0"` | eski site yalnız geniş ekranda yazardı |
| `sesHizi.al()`, `yaz(n)`, `sonraki()`; `SES_HIZLARI` | `ilmihal-audio-speed` | düz metin `"1.25"` | 0.5/0.75/1/1.25/1.5/2; listede olmayandan sonra 0.5 (eski) |
| `sesKonumu.al()`, `icin(m)`, `yaz({kisim, maddeNo, pageIdx, time})` | `ilmihal-audio-pos` | `{"kisim":1,"maddeNo":52,"pageIdx":0,"time":123.45}` | dikkat: **`maddeNo`** (camelCase); `icin` başka maddeye aitse `null` |
| `gunlukHedef.al()`, `bugunkuDakika(simdi?)`, `ekle(dk=1, simdi?)` → `{target,today,minutes,tamam}` | `ilmihal-daily-goal` | `{"target":30,"today":"2026-11-17","minutes":12}` | `today` **UTC** günü (eski davranış, H-13); gün değişince sıfırlanır |
| `quizPuani.al()`, `kaydet(puan)` → en yüksek | `ilmihal-quiz-puan` | düz metin `"80"` | |
| `rehber.hepsi()`, `adimlar(id)`, `tamamMi(id, m)`, `degistir(id, m)` → yeni durum | `ilmihal-rehber-progress` | `{"<rehberId>":["1/51","1/52"]}` | |
| `duyuru.kapatilanlar()`, `kapatildiMi(id)`, `kapat(id)`, `gorunenler(liste, simdi?)` | `ilmihal-duyuru-kapatilan` | `["metin-2026-10"]` | `gorunenler`: kapatılmamış ve `bitis` (UTC günü) geçmemiş |
| `hatim.al()`, `yaz(p)`, `sil()` | `ilmihal-hatim` | `{"baslangic":"2026-11-17","gun":90,"hatimSayisi":0}` | `baslangic` **yerel** tarih; doğrudan değil `okumaPlani` ile kullanın |
| `bitirilen.liste()`, `varMi(m)`, `ayarla(m, bool)`, `sifirla()` | `ilmihal-bitirilen` | `["1/1","1/2"]` bu hatimde | 〃 |
| `okumaYeri.hepsi()`, `al(m)`, `yaz(m, oran)`, `sil(m)`, `kaydet(m, oran, bitti)`, `sifirla()` | `ilmihal-okuma-yeri` | `{"1/60":0.42}` (0,03–0,97, 3 ondalık) | 〃 |
| `hatimKutlama.al()` → `'YYYY-MM-DD'`\|`''`, `yaz(gun)` | `ilmihal-hatim-kutlama` | JSON metni, tırnaklı: `"\"2026-11-17\""` | tırnaksız eski değer de okunur; yazım hep tırnaklı |
| `debug.acikMi()`, `yaz(bool)` | `ilmihal-debug` | `"1"` | false → anahtar silinir |
| `buildId.al()`, `yaz(id)` | `ilmihal-build-id` | `"2026-10-19-r5"` | eski sitede yazılıyor, okunmuyordu |
| `onboardingGoruldu.al()`, `isaretle()` | `ilmihal-onboarding-seen` | `"1"` | ölü özellik; eski ziyaretçide bulunabilir |
| `onboardingBitti.al()`, `isaretle()` | `ilmihal-onboarding-done` | `"1"` | 〃 |
| (tema) | `ilmihal-theme` | `"light"\|"sepia"\|"dark"` | **`js/cekirdek/tema.js`**: `temaOku/temaYaz/temaUygula`; burada yalnız yedeğe girer |

**Abonelik** — `const birak = kullanici.izle(alan, fn)`; `alan` yukarıdaki adlardan biri (`'yerImleri'`, `'notlar'`,
`'okunan'`, `'bitirilen'`, `'hatim'`, `'gunlukHedef'`, `'tema'` …). `fn(yeniDeger)` normalleştirilmiş değeri alır
(ör. `yerImleri` için `liste()`); bu sekmedeki yazımlarda ve öbür sekmelerde (`storage` olayı) çağrılır. `birak()` kaldırır.

**Özet** — `kullanici.ozet(simdi?)` → `{yerImi, not, notluMadde, vurgu, vurguluMadde, okunan, bitirilen, gecmis, rehberAdimi, rehber, quizPuani, bugunkuDakika, planVar}`.

**Yedek (yeni özellik, Çalışma Alanım)**
- `kullanici.disaAktar(simdi?)` → `{ bicim: 'ilmihal-kullanici-yedegi', surum: 1, tarih: ISO, anahtarlar: { 'ilmihal-read': '["1/1"]', … } }`.
  Değerler depodaki **ham metin**dir (biçim birebir döner). `ilmihal-build-id` ve `ilmihal-debug` girmez; `ilmihal-bozuk-kayitlar` girer.
  Dosyaya yazmak görünümün işidir (`JSON.stringify(yedek, null, 2)`).
- `kullanici.iceAktar(nesne, { birlestir: false })` → `{ tamam, yazilan: [...], degismeyen: [...], atlanan: [{anahtar, sebep}] }`.
  `birlestir:false`: yedekteki anahtarlar yazılır, yedekte olmayanlara dokunulmaz. `birlestir:true`: listeler (yer imi, okundu,
  geçmiş, bitirilen, duyuru, rehber, not, vurgu) tekrarsız birleşir; quiz puanında büyük, son okunan / günlük hedef / kutlamada yeni olan;
  ayarlar, plan, ses konumu ve tema için **var olan kalır**. Bilinmeyen anahtar ve bozuk değer atlanır, raporlanır.

## okuma-plani.js

`maddeler` = kitap sırasıyla `[{kisim, no, uzunluk}]` (`uzunluk` = harf sayısı, `ozetler.js` `maddeUzunluklari["k/m"]`;
yoksa ya da 0 ise 4000). Veri katmanından alın, modül veri dosyası yüklemez. `bugun`/`tarih` her yerde isteğe bağlı `Date`.

| İşlev | Döner / yapar |
|---|---|
| `DAKIKADA_HARF` (1100), `VARSAYILAN_UZUNLUK` (4000), `SURELER` | `[{gun:30,ad:'30 gün'},{gun:90,…},{gun:180,…},{gun:365,ad:'1 yıl'}]` |
| `durum(maddeler, bugun?)` | kayıtlı plana göre durum (aşağıda) |
| `planDurumu(maddeler, {plan, bitenler, bugun})` | aynı hesap, saf (kayıt okumaz) |
| `takvim(maddeler, bugun?)` / `planTakvimi(maddeler, {plan, bitenler, bugun})` | `[{gun, tarih:'YYYY-MM-DD', ilk:'1/1', son:'1/9', maddeler:[…], bitti, bugun}]`; plan yoksa `[]` |
| `sureSecenekleri(maddeler)` | `[{gun, ad, gunlukDk}]` ("günde ≈ X dk" için) |
| `toplamHarf(maddeler)`, `sureYazi(dk)` | `"12 dk"`, `"1 saat 20 dk"` (eski biçim) |
| `aktifMi()`, `bittiMi(m)` | |
| `planKur(gun, maddeler, bugun?)` | başlangıç = bugün (yerel), hatim sayısı korunur; yeni durum |
| `planSil()` | plan silinir, bitirilenler kalır (onay sorusunu görünüm sorar) |
| `yeniHatim(maddeler, bugun?)` | hatim bittiyse `hatimSayisi+1`; bitirilenler `[]`, okuma yerleri `{}`; süre korunur (yoksa 90) |
| `maddeBitir(m, bitti, maddeler, {sessiz, bugun})` | `{bitti, olay, durum}`; `olay`: `'hatim-tamam'` \| `'bugunku-pay-tamam'` (günde bir kez, `ilmihal-hatim-kutlama` yazılır) \| `null`; `sessiz` = olay hesaplanmaz. Bitirince o maddenin okuma yeri silinir |
| `okumaYeriKaydet(m, oran)` | 0,03–0,97 ve bitmemişse 3 ondalık yazar, değilse siler (800 ms seyreltmeyi görünüm yapar) |
| `donulecekYer(m)` | açılışta kaydırılacak oran ya da `null` (aramadan gelindiyse çağırmayın) |
| `otomatikBitirmeSuresi(uzunluk)`, `otomatikBitirilmeli({oran, acilisMs, simdiMs, uzunluk, bitti, dahaOnceOtomatik})` | sonuna (≥%98,5) kaydırılan madde, okuma süresinin üçte biri (8 sn–3 dk) geçtiyse bitirilir → `maddeBitir(m, true, …)`; "Geri al" → `maddeBitir(m, false, …)` |
| `gununMaddesiSirasi(tarih?, maddeSayisi=241)`, `gununMaddesi(maddeler, tarih?)` | yerel yılın günü % sayı (eski app.js; Türkiye saatinde `api/rss.js` ile aynı) |
| `gununSualiSirasi(tarih?, uzunluk, offset=0)` | yerel gece yarısında değişen gün sayısı % uzunluk; `offset=-1..-7` "Önceki Günler" |

**Durum nesnesi** (eski `okumaPlani.durum()` alanları aynen): `aktif, plan, toplam, bitenHarf, bitenSayi, maddeSayi, yuzde,
yuzdeYazi` (`"4,7"` — %10 altı bir ondalık), `hatimBitti, siradaki` (`"1/5"`\|null); plan varsa ayrıca `gunNo, gunSayisi, beklenen,
geriDk, ondeDk, bugunKalanDk, gunlukDk, bugunkuler:[{key, devam, bitti}], sureDoldu`. Yeni alanlar: `bugunkuPayTamam` (bool),
`durumKodu` (`'uygun'|'geride'|'onde'|'sure-doldu'|'bitti'`, eşik 3 dk; eski metin: "Plana göre ≈ X geridesiniz/öndesiniz.",
"Plana uygun gidiyorsunuz.", "Plan süresi doldu; kalan maddelerle devam edebilirsiniz."), `planBozuk` (kayıt bozuksa).
Kart: `Math.min(gunNo, gunSayisi) + '. gün / ' + gunSayisi`; `bugunKalanDk > 0 ? 'Bugün ≈ ' + sureYazi(...) + ' okuma kaldı' : 'Bugünkü kısım tamam'`.
"Bugünkü kısım" listesinde `devam` → "(devamı)". Hatim bitince yazılacak sayı `(plan.hatimSayisi || 0) + 1`.

## Eski davranıştan bilerek ayrılınan yerler
1. **H-12**: eski düz metin yer imi (`"1/52"`) artık "var" sayılır ve kaldırılabilir; aynı madde ikinci kez eklenmez. Var olan çift kayıtlar listede tek görünür.
2. **H-17**: vurgu kaydı DOM'dan yeniden kurulmaz; ekle/sil tek tek yapılır, yerleşemeyen vurgu saklanır ve raporlanır. Aynı metin tekrar eklenmez.
3. Kutlama anahtarında tırnaksız değer de "bugün kutlandı" sayılır (eski kod tanımazdı). Yazım tırnaklı kalır.
4. Yazı boyutu yeni yazımlarda 2 ondalığa yuvarlanır (`"1.25"`); eski kayan nokta artıklı değer okunur.
5. Duyuru kapatma aynı kimliği ikinci kez eklemez.
6. Bozuk plan kaydı (`gun` ≤ 0, tarih bozuk) `aktif:false, planBozuk:true` verir (eski kod NaN üretirdi); kayıt silinmez.
7. Bozuk kaydın üstüne yazılırken ham metin `ilmihal-bozuk-kayitlar`'a saklanır (yeni anahtar; Gizlilik metnine eklenmeli).
Değişmeyenler (bilerek): günlük hedef ve duyuru bitişi **UTC** günüyle (H-13); günün maddesi yerel saatle (RSS Türkiye saatiyle).

## Sınama — `tools/yeni-site/kullanici-sina.mjs`
Çalıştırma: `TZ=Europe/Istanbul node tools/yeni-site/kullanici-sina.mjs` (localStorage taklidi; eski `okuma-plani.js`,
`data.js`, `ozetler.js` node `vm` içinde sahte `window`/`Date` ile yüklenir; iki madde uzunluğu 4000 yedeği sınansın diye silinir).

Sonuç (17 Kasım 2026, node v22.11.0, TZ=Europe/Istanbul): **477/477 denetim geçti.**
- a) 25 anahtar, eski biçimle oku–değiştir–yaz–eski biçim: 67/67
- b) eski biçimler (düz metin yer imi, H-12 çift kaydı, tırnaklı/tırnaksız kutlama, kayan noktalı boyut, tek haneli not tarihi): 7/7
- c) bozuk JSON, `null`, yanlış tür, yanlış öğeler, geçersiz girdi, dolu kota (istisna yok, veri silinmedi/değişmedi): 201/201
- d) okuma planı eski = yeni: 144 durum (4 süre × 6 tarih × 6 biten kümesi; bütün alanlar birebir), 24 takvim (gün, tarih, madde aralığı, bitti/bugün),
  planKur/maddeBitir/yeniHatim/okuma yeri işlemlerinde depo birebir ve olaylar (kutlama/hatim) aynı, günün maddesi 575 an eski formül ve
  `api/rss.js` ile aynı, günün suâli 60 gün eski formülle aynı: 193/193
- e) dışa aktar → temizle → içe aktar ham metinle birebir; birleştirme; bozuk yedek: 9/9

TZ=America/New_York ile: 476/477 — yalnız "günün maddesi = api/rss.js" düşer. Beklenen: RSS Türkiye saatine sabittir, istemci yerel
saati kullanır (eski site de böyleydi); eski app.js formülüyle eşitlik o dilimde de geçer.
