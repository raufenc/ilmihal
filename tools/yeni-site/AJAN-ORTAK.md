# Bölüm ajanları için ortak kurallar

Türkçe çalış, Türkçe yaz. ilmihal.org (Se'âdet-i Ebediyye kitabının etkileşimli baskısı) baştan yazılıyor.
Sana sitenin bir bölümü verildi. Hedef: canlıdaki eski siteden belirgin biçimde daha iyi, kitap sanatlarının
diliyle konuşan, hatasız bir bölüm. Hazır şablon görünümü ("AI slop") kabul edilmez.

## Önce oku (sırayla, tamamını)
1. `tools/yeni-site/MIMARI.md` — görünüm sözleşmesi, yardımcılar, deneme aracı, dosya sahipliği.
2. `tools/yeni-site/TASARIM.md` — tasarım dili ve dil/hürmet kuralları (bağlayıcı). Sonra `css/temel.css` ve `css/kabuk.css`.
3. `tools/yeni-site/VERI.md` — veri API'si. Kaynak veri dosyalarını açma; yalnız `veri` modülünü kullan.
4. `tools/yeni-site/KULLANICI.md` — kullanıcı verisi API'si (yer imi, okundu, not, vurgu, okuma planı…).
5. `tools/yeni-site/envanter-ozellikler.md` içinde SANA VERİLEN bölümler ve `tools/yeni-site/envanter-hatalar.md`
   (canlıdaki hatalar; aynılarını taşıma). Eski kod (`app.js`, `style.css`, `eski/index.html`) yalnız başvurudur;
   bir davranışın ayrıntısını öğrenmek için ilgili satırlara bak, kopyalama.
6. Örnek üslup: `js/gorunum/bulunamadi.js`, `js/ana.js`, `js/bilesen/pencere.js`.

## Ortam
- Depo: `/Users/raufenc/Documents/Claude 2/ilmihal-site` (dal `yeni-site`). Git komutu ÇALIŞTIRMA (status dahil), commit/push yapma.
- node: `export PATH="/Users/raufenc/pinokio/bin/miniconda/bin:$PATH"`; bağımlılık ekleme, `npm install` yapma. Python: `/usr/local/bin/python3`.
- Yerel sunucu açık: `http://localhost:8260/`. Tarayıcıyı YALNIZ `tools/yeni-site/dene.py` ile aç (MIMARI.md "Deneme").
- Yalnız sana verilen dosyalara yaz. Ortak dosyalara (`css/temel.css`, `css/kabuk.css`, `js/cekirdek/*`, `js/ana.js`,
  `index.html`, `js/bilesen/pencere.js`, `js/bilesen/bildirim.js`, `veri/`, veri kaynakları) DOKUNMA; bir değişiklik
  gerekiyorsa raporunda tam olarak ne gerektiğini yaz. Başka ajanlar aynı anda başka bölümleri yazıyor; onların
  dosyalarına da dokunma, henüz yazılmamış bir görünüme bağlantı vermek sorun değil (yol tablosu `js/ana.js`'te).

## Kesin kurallar
- Kitabın metni (madde, hüküm, meâl, hâl tercemesi, tanım) DEĞİŞTİRİLMEZ, kısaltılmaz, "düzeltilmez"; yalnız
  gösterilir. Önizleme için kesmek gerekirse veri katmanının verdiği hazır alanı kullan ya da CSS ile satır sınırla.
- Hürmet ifadeleri tam yazılır. İnsan, yüz, figür, siluet, hale, cami/bina resmi yok. Emoji yok.
- "yaratmak" ve türevleri, "mucize", "sihir", "şans", kutlama/oyun dili (tebrikler, rozet, seri, puan kazandınız) yok.
- Arayüz sizli hitap; kitabın yazımı: nemâz, sahîfe, hâl tercemesi, âyet-i kerîme, hadîs-i şerîf, lügat, fihrist.
- Veriden/kullanıcıdan gelen metin HTML olarak basılmaz (`h()` ve `textContent`). Regex lookbehind yasak.
- Sayılar veriden gelir; koda sabit yazılmaz.
- Görseller: `gorsel/ebru/*.webp` (battal-yesil, gelgit-yesil, tarakli-zeytin, bulbul-lacivert, sal-bordo, kumlu,
  neftli-gece, somaki-yesil, hafif, tarakli-lacivert) ve `gorsel/nesne/*.webp` (usturlab-rubu, usturlab-gece, mil-golge, divit-kalem,
  rahle-bos) ve kitabın GERÇEK kapağı `gorsel/kitap-kapak.webp` (yayınevinin görseli; üretilmiş kitap resmi KULLANILMAZ); her birinin `-k` ekli küçük boyu var
  (768px). Kullanırsan `loading="lazy"`, `decoding="async"`, genişlik/yükseklik (3:2) ve boş `alt` (süs) ver.
  TASARIM.md'deki ebru kuralına uy: az ve yerinde.

## Bitirmeden önce (zorunlu)
- 390×844 (telefon), 768×1024 ve 1440×900'de; gündüz, sepya ve gece temalarında ekran görüntüsü al ve KENDİN aç, eleştirel bak.
  Kalabalık, sıkışık, hizasız, taşan, kontrastı düşük ya da sıradan görünen yeri düzelt. İlk hâliyle yetinme: en az iki tur cilala.
- `dene.py` her yolunda "temiz" desin (konsol hatası, başarısız istek, yatay taşma yok).
- Yalnız klavyeyle kullan; odak görünür mü. Boş/yükleniyor/hata/bulunamadı durumlarını gör (ör. `cevrimdisi:1`, geçersiz kimlik).
- Tarayıcıda geri/ileri ve sayfayı derin adresle doğrudan açma doğru çalışıyor mu.

## Rapor (bana, kısa)
Yazdığın dosyalar; envanterdeki özelliklerden çalışanlar ve ÇALIŞMAYAN/atlananlar (gizleme); baktığın en iyi 6 karenin
dosya adı; ortak dosyalarda gereken değişiklikler; benim karar vermem gereken sorular.
