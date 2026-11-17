// Nemâz Vakitleri — levhadaki metinler.
// Kaynak: eski sayfanın metinleri (eski/namaz-vakitleri.html) ve tools/yeni-site/envanter-namaz.md;
// sayfa numaraları eski sayfanın kitaba yaptığı atıflardır (Se’âdet-i Ebediyye, 1. kısım, 60. madde, s. 175–203).
// Kitabın kendi cümlelerinden alıntı yapılan yerler tırnak içindedir ve değiştirilmemiştir.

/** Cedveldeki her vakit için: kısa ad, şerit adı, geçerli olay adı ve "nasıl bulunur" metni. */
export const VAKIT_METIN = {
  imsak: {
    kisa: 'İmsâk', olay: 'İmsâk — fecr-i sâdık (−19°)', arabi: 'الفجر الصادق',
    paragraflar: [
      'Sabah nemâzının ve orucun vakti, şark tarafında zâhirî ufuk hattının bir noktasında beyazlığın (fecr-i sâdık) görülmesiyle başlar (s. 176). Bu anda güneş, ufkun 19 derece altındadır.',
      'Fecrin irtifâı dört mezhepte de −19 derecedir (s. 176). İslâm âlimleri imsâkın, beyazlığın ufukta yayıldığı vakit değil, ilk görüldüğü vakit olduğunu bildirmişlerdir; beyazlığın yayılmasını esas alıp −18° veya −16° ile hesap eden takvimlere uyanların orucu sahîh olmaz (s. 176, 198).',
    ],
  },
  gunes: {
    kisa: 'Güneş', olay: 'Güneş (tulû’) — kerâhet vakti', arabi: 'طُلُوع الشَّمْس',
    paragraflar: [
      'Sabah nemâzının vakti, güneşin üst kenârının zâhirî ufuk hattından doğduğu görülünceye kadardır (s. 176–177). Güneş doğarken kerâhet vakti başlar.',
      'Sabah nemâzını kılarken güneş doğmaya başlarsa bu nemâz sahîh olmaz (s. 202). Takvimdeki güneş vakti, hakîkî tulû’dan temkin çıkarılarak bulunur (s. 187).',
    ],
  },
  israk: {
    kisa: 'İşrâk', olay: 'İşrâk (kuşluk) vakti', arabi: 'الإشراق',
    paragraflar: [
      'Nemâz kılmak tahrîmen mekrûh olan üç vakit vardır: güneş doğarken, batarken ve zevâl vaktinde (s. 201). Güneşin merkezi hakîkî ufuktan 5 derece (bir mızrak boyu) yükselince işrâk (kuşluk) vakti olur; bu, tulû’dan takrîben 40 dakika sonradır.',
      'Bu üç vakitte başlanan farzlar sahîh olmaz, nâfileler tahrîmen mekrûh olur (s. 201). İşrâk vaktinde iki rek’at işrâk (kuşluk) nemâzı kılmak sünnettir; bayram nemâzı da bu vakitte kılınır (s. 201). İşrâka temkin eklenir.',
    ],
  },
  zevalBaslangici: {
    kisa: 'Zevâl (kerâhet)', olay: 'Zevâl — kerâhet vakti', arabi: 'الزَّوَال',
    paragraflar: [
      'Zevâl (kerâhet) vakti, güneşin ön kenârının şer’î zevâl dâiresine girdiği ve arka kenârının çıktığı vakit arasıdır; İstanbul için hakîkî zevâlden 10 dakika önce başlar, 10 dakika sonra biter (s. 182, 202).',
      'Güneş, nısf-ün-nehâr dâiresine (meridyen) gelince en yükseğe çıkar; bu ana hakîkî zevâl denir. Bu anda her şeyin gölgesi en kısadır ve tam kuzey-güney doğrultusundadır.',
    ],
  },
  ogle: {
    kisa: 'Öğle', olay: 'Öğle (zuhr) vakti', arabi: 'الظُّهْر',
    paragraflar: [
      'Öğle vakti, güneşin arka kenârı zevâl yerinden ayrılıp gölgenin uzamaya başlamasıyla girer (s. 178). Takvimdeki öğle vakti, hakîkî zevâlden temkin kadar sonradır (s. 188).',
      'Öğlenin sonu: her şeyin gölgesi, zevâl vaktindeki gölgesinden (fey-i zevâl) kendi boyu kadar uzayınca (iki imâma ve diğer üç mezhebe göre) veya iki misli uzayınca (İmâm-ı a’zama göre) öğle vakti çıkar (s. 178).',
    ],
  },
  asrEvvel: {
    kisa: 'İkindi', olay: 'İkindi — asr-ı evvel', arabi: 'العَصْر',
    paragraflar: [
      'İkindi vakti, öğle vakti bitince başlar ve güneşin arka kenârı zâhirî ufuk hattından batıncaya kadar sürer (s. 178). Asr-ı evvel: gölge, fey-i zevâlden kendi boyu kadar uzayınca başlar; iki imâma ve diğer üç mezhebe göredir.',
      'Hesap: fey-i zevâl = tan (90° − gâye irtifâı); asr-ı evvel için tan (temâm-ı irtifâ) = 1 + fey-i zevâl (s. 196–197). Kitaptaki misâl: İstanbul’da 13 Ağustos’ta gâye irtifâı 63° 50′ olduğundan, 1 metrelik çubuğun fey-i zevâli tan 26° 10′ = 0,4913 metredir; asr-ı evvel irtifâı 33° 51′ olur (s. 196).',
    ],
  },
  asrSani: {
    kisa: 'Asr-ı sânî', olay: 'Asr-ı sânî (İmâm-ı a’zam)', arabi: 'العَصْر الثَّانِي',
    paragraflar: [
      'Asr-ı sânî: gölge, fey-i zevâlden iki misli uzayınca başlar; İmâm-ı a’zama göredir. Hesapta tan (temâm-ı irtifâ) = 2 + fey-i zevâl alınır (s. 196–197).',
      'Türkiye’deki takvimlerde ikindi, asr-ı evvele göre yazılıdır; bu vakitten kışın 36, yazın 72 dakika sonra kılınınca İmâm-ı a’zama da uyulmuş olur (s. 178). İkindi ve yatsıyı İmâm-ı a’zamın kavline göre kılmak ihtiyâtlıdır (s. 194).',
    ],
  },
  isfirar: {
    kisa: 'İsfirâr', olay: 'İsfirâr — kerâhet vakti', arabi: 'اصْفِرَار الشَّمْس',
    paragraflar: [
      'Güneş sarardıktan, ya’nî alt kenârı ufka bir mızrak boyu yaklaştıktan sonraya ikindiyi geciktirmek harâmdır (s. 178). Bu vakit, güneşin merkezi hakîkî ufka 5 derece yaklaşınca girer.',
      'Güneş batarken yalnız o günün ikindisi kılınır (s. 202). İsfirâr vaktine temkin eklenmez, değiştirilmez.',
    ],
  },
  aksam: {
    kisa: 'Akşam', olay: 'Akşam — şer’î gurûb', arabi: 'المَغْرِب',
    paragraflar: [
      'Akşam nemâzının vakti, güneşin üst kenârının zâhirî ufuk hattından kaybolduğu görülünce başlar ve yatsı vakti girinceye kadar devam eder (s. 178). Takvimdeki akşam vakti, hakîkî gurûba temkin eklenerek bulunan şer’î gurûbdur (s. 186).',
      'Akşam nemâzını vaktin evvelinde kılmak sünnettir.',
    ],
  },
  istibak: {
    kisa: 'İştibâk', olay: 'İştibâk-i nücûm (−10°)', arabi: 'اشْتِبَاك النُّجُوم',
    paragraflar: [
      'Yıldızlar çoğaldıktan, ya’nî güneşin arka kenârı ufkun 10 derece altına indikten sonraya (iştibâk-i nücûm) akşam nemâzını bırakmak harâmdır; hastalık, seferîlik ve hazır yemeği yemek için bu kadar geciktirilebilir (s. 178).',
    ],
  },
  yatsiEvvel: {
    kisa: 'Yatsı', olay: 'Yatsı — işâ-i evvel (−17°)', arabi: 'العِشَاء',
    paragraflar: [
      'Yatsı vakti, iki imâma ve diğer üç mezhebe göre batıdaki kırmızılık kaybolunca (işâ-i evvel), İmâm-ı a’zama göre beyazlık da kaybolunca (işâ-i sânî) başlar; Hanefî mezhebinde fecr-i sâdıka kadar sürer (s. 178).',
      'Kırmızılık, güneş ufkun 17 derece altına inince kaybolur (s. 178). Yatsıyı gecenin yarısından sonraya bırakmak Hanefîde mekrûhtur (s. 178, 194).',
    ],
  },
  yatsiSani: {
    kisa: 'İşâ-i sânî', olay: 'İşâ-i sânî (−19°)', arabi: 'العِشَاء الثَّانِي',
    paragraflar: [
      'Beyazlık, güneş ufkun 19 derece altına inince kaybolur; İmâm-ı a’zama göre yatsı vakti bununla başlar (s. 178).',
      'İkindi ve yatsıyı İmâm-ı a’zamın kavline göre kılmak ihtiyâtlıdır (s. 194).',
    ],
  },
};

export const GECE_OLAYI = 'Gece — yatsı vakti';

/** Hesabın adımları için ortak açıklamalar. */
export const HESAP = {
  hakiki: 'Vakitler, kitaptaki usûle göre hesaplanmıştır: güneş merkezinin hakîkî ufka göre vaktin irtifâına geldiği hakîkî vakit bulunur; imsâk ve güneş vakitlerinden temkin çıkarılır, öğle, ikindi, akşam ve yatsı vakitlerine eklenir (s. 187–188).',
  fadliDair: 'Güneşin, meyli bilinen bir günde ve arz derecesi bilinen bir yerde, nemâzın irtifâına ulaştığı hakîkî vaktin zevâlden farkına fadl-ı dâir denir; derecesi hesap edilip dört misli alınarak dakikaya çevrilir.',
};

/** Fasıllar: başlık, kısa adı ve levha metni (dinamik cümleler sahne dosyasında eklenir). */
export const FASILLAR = [
  {
    ad: 'Gün yayı ve vakitler', kisa: 'Gün yayı',
    paragraflar: [
      'Kitapta bildirildiği üzere her nemâzın vakti, güneşin ufka göre belli bir irtifâa gelmesiyle başlar (s. 175). Kitapta her nemâzın evvel vakti, güneşin o yerdeki ufuktan belli bir irtifâa gelmesiyle tarif edilir (s. 175–178).',
    ],
  },
  {
    ad: 'Fecr ve imsâk', kisa: 'Fecr',
    paragraflar: [
      'Sabah nemâzının ve orucun vakti, şark tarafında zâhirî ufuk hattının bir noktasında beyazlığın (fecr-i sâdık) görülmesiyle başlar (s. 176). Bu anda güneş, ufkun 19 derece altındadır.',
      'Fecrin irtifâı dört mezhepte de −19 derecedir (s. 176). İslâm âlimleri imsâkın, beyazlığın ufukta yayıldığı vakit değil, ilk görüldüğü vakit olduğunu bildirmişlerdir; beyazlığın yayılmasını esas alıp −18° veya −16° ile hesap eden takvimlere uyanların orucu sahîh olmaz (s. 176, 198).',
    ],
  },
  {
    ad: 'Zevâl ve öğle: fey-i zevâl', kisa: 'Zevâl',
    paragraflar: [
      'Zevâl vaktindeki en kısa gölgeye fey-i zevâl denir. Fey-i zevâl, yalnız öğle ve ikindi vakitlerini bulurken kullanılır (s. 182).',
      'Öğle vakti, güneşin arka kenârı zevâl yerinden ayrılıp gölgenin uzamaya başlamasıyla girer (s. 178). Takvimdeki öğle vakti, hakîkî zevâlden temkin kadar sonradır (s. 188). Zevâl (kerâhet) vakti, güneşin ön kenârının şer’î zevâl dâiresine girdiği ve arka kenârının çıktığı vakit arasıdır (s. 182, 202).',
    ],
  },
  {
    ad: 'İkindi: gölge halkaları', kisa: 'İkindi',
    paragraflar: [
      'Her şeyin gölgesi, zevâl vaktindeki gölgesinden (fey-i zevâl) kendi boyu kadar uzayınca (iki imâma ve diğer üç mezhebe göre) veya iki misli uzayınca (İmâm-ı a’zama göre) öğle vakti çıkar, ikindi girer (s. 178).',
      'Hesap: fey-i zevâl = tan (90° − gâye irtifâı); asr-ı evvel için tan (temâm-ı irtifâ) = 1 + fey-i zevâl, asr-ı sânî için 2 + fey-i zevâl (s. 196–197). Kitaptaki misâl: İstanbul’da 13 Ağustos’ta gâye irtifâı 63° 50′ olduğundan, 1 metrelik çubuğun fey-i zevâli tan 26° 10′ = 0,4913 metredir; asr-ı evvel irtifâı 33° 51′ olur (s. 196).',
    ],
  },
  {
    ad: 'Akşam, iştibâk ve işâ', kisa: 'Akşam',
    paragraflar: [
      'Akşam nemâzının vakti, güneşin üst kenârının zâhirî ufuk hattından kaybolduğu görülünce başlar ve yatsı vakti girinceye kadar devam eder (s. 178). Takvimdeki akşam vakti, hakîkî gurûba temkin eklenerek bulunan şer’î gurûbdur (s. 186).',
      'Yıldızlar çoğaldıktan, ya’nî güneşin arka kenârı ufkun 10 derece altına indikten sonraya (iştibâk-i nücûm) bırakmak harâmdır (s. 178).',
      'Yatsı vakti, iki imâma ve diğer üç mezhebe göre batıdaki kırmızılık kaybolunca (işâ-i evvel), İmâm-ı a’zama göre beyazlık da kaybolunca (işâ-i sânî) başlar. Kırmızılık, güneş ufkun 17 derece altına inince; beyazlık, 19 derece altına inince kaybolur (s. 178).',
    ],
  },
  {
    ad: 'Temkin', kisa: 'Temkin',
    paragraflar: [
      'Bir nemâzın hakîkî vakti ile şer’î vakti arasındaki zaman farkına temkin denir (s. 176). Güneşin merkezi hakîkî ufuktan battıktan sonra, arka kenârının şer’î ufka inerek ziyâsının en yüksek tepeden kaybolması için geçen zamandır (s. 186). Temkin bir ihtiyât payı değildir: kitapta, temkini ihtiyât zannedip imsâkı 3–4 dakika geciktirenin ve iftarı 3–4 dakika öne alanın orucunun fâsid olacağı bildirilir (s. 186).',
    ],
    unsurlar: [
      { ad: 'İnhitât-ı ufuk zâviyesi', metin: 'Şehrin en yüksek yerinden bakan râsıdın ufkunun alçalmasıdır. Ahmed Ziyâ beğe göre açı sâniyesi olarak 106,92 × √yükseklik (m) kadardır; İstanbul’da Çamlıca tepesi (267 m) için 29 dakikadır (s. 185).' },
      { ad: 'İnkisâr (ışığın kırılması)', metin: 'Ufkun altındaki bu irtifâa âit ziyânın kırılmasıdır; kitapta 44,5 dakika olarak alınmıştır (s. 185). Hava tabakaları ziyâyı kırdığı için güneş, batmasından sonra da bir müddet görünür (s. 179).' },
      { ad: 'Nısf-ı kutr-ı zâhirî', metin: 'Güneşin görünen yarıçapıdır; kitapta asgarî değeri olan 15 dakika 45 sâniye alınmıştır (s. 185). Bu üç büyüklükten ihtilâf-ı manzar (8,8 sâniye) çıkarılınca güneşin irtifâ zâviyesi bulunur.' },
    ],
    ufuklar: 'Kitapta altı ufuk düzlemi sayılır; bunlardan riyâdî ufuk râsıdın ayaklarından, hakîkî ufuk yer küresinin merkezinden, şer’î ufuk ise bulunulan yerin en yüksek noktasının zâhirî ufuk hattından geçer ve bu düzlemler birbirine paraleldir (¶9). Hesap hakîkî ufka göre yapılır; nemâz vakitleri yükseklikle değişmeyen şer’î ufka göredir.',
    not: 'Kitapta İstanbul için 21 Mart ve 23 Eylül’de temkin 7 dakika 52 sâniye bulunmuş; hesaptaki küçük farkları gidermek için iki dakika ihtiyât eklenerek İstanbul’un temkini vasatî 10 dakika kabûl edilmiştir (s. 186). Bir şehirde tek bir temkin vardır; her nemâz için ayrı temkin yoktur. İmsâk ve güneş vakitlerinde temkin hakîkî vakitten çıkarılır; öğle, ikindi, akşam, iştibâk ve yatsı vakitlerinde eklenir (s. 187–188). Cedveldeki yükseklik, şehrin en yüksek yerinin en aşağı yerinden itibaren yüksekliğidir (s. 1244).',
  },
  {
    ad: 'Ta’dîl-i zemân', kisa: 'Ta’dîl',
    paragraflar: [
      'Hakîkî güneş ile vasatî güneş arasındaki bir günlük zaman farkına ta’dîl-i zemân denir; vasatî güneş ileride ise artı, geride ise eksidir (s. 184). Vasatî saat ile bilinen bir vakte ta’dîl-i zemân eklenince hakîkî zamana göre vakit bulunur; bu yüzden öğle vaktini doğrudan etkiler.',
    ],
    sebepler: [
      'Yer küresinin güneş etrafındaki yolu dâire değil, beyzî (elips) olduğundan eşit zamanlarda gittiği yaylar eşit değildir; güneşe yaklaştıkça sür’ati artar.',
      'Yer küresinin mihveri, husûf düzlemine (ekliptik) dik değildir; mihver ile husûf mihveri arasında 23° 27′ açı vardır.',
    ],
    mikdar: 'Ta’dîl-i zemân bir senede takrîben +16 dakika ile −14 dakika arasında değişir ve senede dört defa sıfır olur (s. 184). Vasatî saat ile zevâl vakti 12’den önce ise ta’dîl-i zemân (+), sonra ise (−) olur (s. 193).',
  },
];

/** Levhanın altındaki künye (eski sayfadaki cedvel notu, aynen; yalnız düz kesme işaretleri ’ yapıldı). */
export const KUNYE_HTML = 'Vakitler, kitaptaki usûle göre hesaplanmıştır: güneş merkezinin hakîkî ufka göre vaktin irtifâına geldiği <em>hakîkî vakit</em> bulunur; imsâk ve güneş vakitlerinden <strong>temkin</strong> çıkarılır, öğle, ikindi, akşam ve yatsı vakitlerine eklenir (s. 187–188). Temkin, kitapta İstanbul için bildirilen vasatî 10 dakikadır (s. 186); kitapta başka şehirlerin vakitleri de İstanbul’un temkiniyle hesaplanmıştır (s. 193). Bir şehrin kendi temkini, en yüksek yerine göre bir-iki dakika farklı olabilir (s. 190). Bu sayfa kitaptaki hesabı anlatmak içindir; buradaki vakitler takvimden birkaç dakika farklı çıkabilir. <strong>Namaz kılarken, oruca başlarken ve iftar ederken âlimlerin tasdîk ettiği takvime uyunuz</strong>; Hakîkat Kitâbevi’nin hazırladığı <a href="https://www.turktakvim.com/" target="_blank" rel="noopener">Türkiye Takvimi</a> bunlardandır.';

/** Yüksek arzlarda hesaplanamayan vakit için tek satır (kitap ¶27'nin özü). */
export const YUKSEK_ARZ = 'Bu gün bu yerde güneş bu irtifâa inmediği için vakit hesapla bulunamaz. Kitapta böyle yerlerde, Hanefî mezhebinde vakit nemâzın sebebi olduğundan bu nemâzların farz olmadığı, bazı âlimlere göre yakın arzlardaki vakitlerinde kılınacağı ve “vaktlerinin olduğu en son günün vaktlerinde kılmak iyi olur” diye bildirildiği yazılıdır (¶27).';
