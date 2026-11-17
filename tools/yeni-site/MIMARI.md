# ilmihal.org — Yeni Site Mimarisi

Derleme adımı yok, çerçeve yok: tarayıcının kendi ES modülleri. Statik dosyalar
Vercel'den sunulur. Tasarım kuralları `TASARIM.md`, veri API'si `VERI.md`,
kullanıcı verisi `KULLANICI.md`, arama `ARAMA.md`. Eski sitenin ne yaptığı
`envanter-ozellikler.md` içindedir; bir özelliği yazarken oradaki ilgili bölümü oku.

## Klasörler

```
index.html                 tek kabuk: üst çubuk, <main id="icerik">, künye
css/temel.css              belirteçler + ortak bileşenler (DEĞİŞTİRME; eksik varsa bildir)
css/kabuk.css              üst çubuk, menü, künye
css/<gorunum>.css          görünüme özel stil (görünüm kendi yükler: cssYukle)
js/ana.js                  giriş: yollar, kabuk davranışı
js/cekirdek/               yonlendirici, dom, depo, tema, bicim, veri, kullanici, okuma-plani, arama, metin, vakit
js/gorunum/<ad>.js         her yol için bir görünüm (tembel yüklenir)
js/bilesen/                birden çok görünümün kullandığı parçalar (pencere, bildirim, hizli-arama …)
js/isci/                   Web Worker'lar
veri/                      üretilmiş veri parçaları (tools/yeni-site/veri-uret.mjs)
veri-arama/                üretilmiş arama dizini (tools/yeni-site/arama-uret.mjs)
gorsel/                    SVG'ler; gorsel/ebru/*.webp, gorsel/nesne/*.webp (her birinin -k küçük boyu var)
eski/, kökteki eski app.js/style.css ve veri dosyaları   yalnız başvuru; yayına çıkmaz ya da silinecek
```

## Görünüm sözleşmesi

```js
// js/gorunum/ornek.js
import { h, doldur, durum, iskelet } from '../cekirdek/dom.js';
import { veri } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';

export default {
  ad: 'ornek',                                  // tekil; <html data-gorunum="ornek"> olur
  baslik: p => 'Örnek',                         // sekme başlığı; kur() içinde baglam.baslikYaz(...) ile de verilebilir
  async kur(kap, p, baglam) {                   // kap: boş <div class="gorunum">; p: yol parametreleri
    await cssYukle('/css/ornek.css');           // stil gelmeden boyama yok (kırpışma olmaz)
    const liste = await veri.bir_sey({ sinyal: baglam.sinyal });
    kap.append(h('.kap', h('h1.baslik-2', 'Örnek'), …));
    baglam.temizle(() => { /* zamanlayıcı, gözlemci, ses, worker kapat */ });
  },
  async guncelle(p, baglam) { … }               // isteğe bağlı: aynı görünümde yalnız parametre değişince
};
```

`baglam`: `sinyal` (AbortSignal; görünümden çıkılınca iptal), `yol`, `sorgu`
(URLSearchParams), `karma`, `git(adres, {yerine})`, `yerineYaz(adres)`,
`baslikYaz(metin)`, `metaYaz({aciklama, kanonik, robots})`, `temizle(fn)`.

Kurallar:
- `kur()` ilk içeriği koyup döner; yönlendirici ancak o zaman `<body data-hazir="1">`
  yapar. Uzun süren ek yüklemeler (ör. lügat katmanı) `kur()` döndükten sonra da
  sürebilir ama `baglam.sinyal` iptal olunca durmalıdır.
- HTML'i `h()` ile kur. Veriden ya da kullanıcıdan gelen metni ASLA `innerHTML`'e,
  `html:` özelliğine ya da `onclick="…"` gibi özniteliklere koyma.
- Gezinme sıradan `<a href="/madde/1/43">` bağlantısıdır; yönlendirici yakalar.
  Programla gitmek için `baglam.git()`. `location.href =`, `history.pushState` kullanma.
- Pencere açmak geçmişe kayıt EKLEMEZ; Esc ve geri tuşu birbirine karışmaz
  (`js/bilesen/pencere.js`). Adres çubuğuna yansıması gereken durum (süzgeç, sekme,
  arama sorgusu) `baglam.yerineYaz()` ile `?sorgu` olarak yazılır ve açılışta okunur.
- Küresel değişken tanımlama (`window.x = …` yok). Görünümden çıkarken her şeyi kapat.
- Veri yüklenemezse `durum('…', '…', yenidenDeneDugmesi)` göster; boş ekran bırakma.
  Hata fırlatırsan yönlendirici genel "Sayfa açılamadı" durumunu gösterir.
- Tarayıcı desteği: son iki yılın Safari/Chrome/Firefox'u. Regex lookbehind
  (`(?<=`, `(?<!`) YASAK (eski Safari'de bütün dosya çöker).
- Kalıcı veri yalnız `kullanici` (ve `depo`) üzerinden; doğrudan `localStorage` yok.
- Sayılar (241 madde, 9.863 terim …) koda sabit yazılmaz; veriden okunur.

## Yardımcılar (hazır)

- `js/cekirdek/dom.js`: `h, ekle, doldur, $, $$, simge, semse, iskelet, durum, dinle, kare, azHareket`
- `js/cekirdek/bicim.js`: `kesme, bitisik, ad, sayi, sahife, tarih, sure, okumaDakikasi, roma, kisimAdi`
- `js/cekirdek/css.js`: `cssYukle(adres)` → söz; aynı dosya bir kez eklenir
- `js/cekirdek/depo.js`: güvenli kalıcı depo (çoğu zaman `kullanici` yeter)
- `js/cekirdek/tema.js`: `temaOku, temaYaz, TEMALAR`; tema değişince `ilmihal:tema` olayı
- `js/bilesen/pencere.js`: `pencere({baslik, icerik})`, `sor(soru)`
- `js/bilesen/bildirim.js`: `bildir('Yer imi eklendi')`
- Olaylar (`window`): `ilmihal:gorunum` (görünüm değişti), `ilmihal:tema`

## Deneme

Yerel sunucu açık: `http://localhost:8260/` (canlıdaki yönlendirme ve güvenlik
başlığıyla aynı davranır). Başsız tarayıcıyı YALNIZ şu araçla aç (sessiz çalışır,
eşzamanlı tarayıcıyı sınırlar, bitince kapatır); kendi başına playwright/Chrome açma:

```
/usr/local/bin/python3 tools/yeni-site/dene.py adim 1440x900 "url:/icindekiler;;sec:h1;;cek:fihrist-masa"
/usr/local/bin/python3 tools/yeni-site/dene.py adim 390x844 "url:/icindekiler;;sec:h1;;cek:fihrist-tel" --telefon --olcek 2
```

Adımlar `;;` ile ayrılır: `url: bekle: sec: tikla: yaz:SEÇİCİ=METİN tus: js: cek: tamcek: kaydir: cevrimdisi:`.
Kareler `tools/yeni-site/kare/` altına düşer; Read ile KENDİN aç ve bak. Araç,
konsol hatası / başarısız istek / yatay taşma varsa "HATA VAR" der; temiz çıkana
dek bitirme. Tema denemek için: `js:(document.documentElement.dataset.tema='gece',1)`.

Bir görünümü bitirme ölçütü: `TASARIM.md` 8. bölüm + araç "temiz" + envanterdeki
ilgili özelliklerin hepsi çalışıyor (çalışmayanı raporunda açıkça yaz).

## Dosya sahipliği

Her ajan yalnız kendisine verilen dosyalara yazar. Ortak dosyalarda (`css/temel.css`,
`js/cekirdek/*`, `js/ana.js`, `index.html`, `js/bilesen/pencere.js`, `bildirim.js`)
değişiklik gerekiyorsa DEĞİŞTİRME; raporunda ne gerektiğini yaz.
