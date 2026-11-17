/* Yayın anahtarları. Bir bölümü kapatmak ya da açmak için tek yer.

   HUKUMLER_ACIK = false (17 Kas 2026): Fıkhî Hükümler dizini yayından kaldırıldı.
   Dizin kitaptan sonradan, kelime avıyla derlenmişti; denetimde 2.864 "açık hüküm"ün 133'ünün kitaba
   aykırı (kitabın reddettiği görüşler, başka mezhebin hulâsası, olumsuz cümleler hüküm diye),
   yaklaşık yarısının sorunlu olduğu görüldü: tools/yeni-site/denetim/hukumler-1.md ve hukumler-2.md.
   Dizin ayıklanıp yeniden kurulmadan ve site sahibi onaylamadan `true` YAPILMAZ.
   Kapalıyken: /hukumler sayfası bir not gösterir; bağlantıları, okuyucudaki "bu maddenin hükümleri"
   satırı ve aramadaki "Fıkhî hükümler" türü gizlenir; veri dosyaları yayına çıkmaz (.vercelignore). */
export const HUKUMLER_ACIK = false;
