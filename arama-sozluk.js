/*
 * Se'âdet-i Ebediyye - Arama Optimizasyon Sözlüğü
 *
 * Bu dosya iki veri yapısı içerir:
 * 1. aramaSynonyms: Günümüz Türkçesiyle yazılan arama terimleri -> kitaptaki yazım biçimleri
 * 2. soruMaddeMap: Sık sorulan sorular -> doğrudan madde eşleştirmeleri
 *
 * NOT: Arama anahtarları ("soru" ve aramaSynonyms anahtarları) normalizeSearch() ile karşılaştırıldığı için
 * küçük harf ve şapkasız (â→a, ı→i, ş→s ...) yazılır; çok kelimeli eşanlamlılar kelime kelime eklendiğinden
 * "ve", "ile" gibi bağlaçlar ve iki harfli parçalar eşanlamlılara konmaz.
 * "cevapOzet" ise ekranda gösterilen metindir: tam Türkçe imlâ ve sitenin üslûp kurallarıyla yazılır.
 */

// ============================================================================
// 1. SINONIM / ALTERNATIF YAZIM HARITASI
// ============================================================================
var aramaSynonyms = {

  // ---- NAMAZ / IBADET TERIMLERI ----
  "namaz": ["nemaz", "salat", "salah"],
  "namaz kilmak": ["nemaz kilmak", "nemaz kilinir"],
  "namaz vakitleri": ["nemaz vaktleri", "nemaz vakti"],
  "namaz kilinir": ["nemaz kilmak"],
  "abdest": ["abdest", "vudu", "vuzu", "wudu"],
  "abdest almak": ["abdest almak", "vudu almak"],
  "abdesti bozan": ["abdesti bozan", "abdest bozulur"],
  "gusul": ["gusl", "gusul"],
  "gusul abdesti": ["gusl abdesti", "gusul abdesti"],
  "teyemmum": ["teyemmum"],
  "secde": ["secde", "sucud"],
  "secde i sahv": ["secde i sehv", "sehv secdesi"],
  "secde i tilavet": ["secde i tilavet", "tilavet secdesi"],
  "ruku": ["ruku"],
  "kible": ["kible"],
  "ezan": ["ezan"],
  "ikamet": ["ikamet"],
  "imam": ["imam"],
  "cemaat": ["cema", "cemaat"],
  "cuma": ["cum", "cuma"],
  "cuma namazi": ["cuma nemazi"],
  "bayram namazi": ["bayram nemazi", "bayram nemazlari"],
  "teravih": ["teravih"],
  "teravih namazi": ["teravih nemazi"],
  "vitir": ["vitr", "vitir"],
  "vitir namazi": ["vitr nemazi"],
  "kunut": ["kunut"],
  "sabah namazi": ["sabah nemazi", "fecer"],
  "ogle namazi": ["ogle nemazi", "zuhr"],
  "ikindi namazi": ["ikindi nemazi", "asr"],
  "aksam namazi": ["aksam nemazi", "magrib"],
  "yatsi namazi": ["yatsi nemazi"],
  "kaza namazi": ["kaza nemazi", "kaza nemazlari"],
  "nafile namaz": ["nafile nemaz", "nafile"],
  "seferi namaz": ["seferi nemaz", "yolculukda nemaz"],
  "yolculukta namaz": ["yolculukda nemaz", "seferi"],
  "cenaze namazi": ["cenaze nemazi"],
  "sunnet": ["sunnet"],
  "farz": ["farz", "fard"],
  "vacip": ["vacib", "vacip"],
  "vacib": ["vacib"],
  "mustehap": ["mustehab", "mustehap", "mendub"],
  "mendub": ["mendub", "mustehab"],
  "mekruh": ["mekruh"],
  "haram": ["haram"],
  "helal": ["helal", "halal"],
  "mufsid": ["mufsid", "bozar"],
  "tadili erkan": ["dil erkan", "tadil i erkan"],
  "otuzuc farz": ["otuzuc farz"],
  "namazin farzlari": ["nemazin farzlari", "nemaz farzlari"],
  "namazin vacibleri": ["nemazin vacibleri", "nemaz vacibleri"],
  "namazi bozan": ["nemazi bozan", "nemaz bozan"],
  "namazin mekruhlari": ["nemazin mekruhlari"],

  // ---- TEMIZLIK / TAHARET ----
  "taharet": ["taharet"],
  "necaset": ["necaset", "necasetden"],
  "istinca": ["istinca"],
  "istibra": ["istibra"],
  "mest": ["mest", "mesh"],
  "mest uzerine mesh": ["mest uzerine mesh"],
  "setr i avret": ["setr i avret", "avret yerleri"],
  "avret": ["avret", "setr"],
  "ozur sahibi": ["ozr sahibi", "ozr"],

  // ---- IMAN / AKAID ----
  "iman": ["iman", "iyman"],
  "imanin sartlari": ["imanin sartlari", "iman sartlari"],
  "allah": ["allahu teala"],
  "allahu teala": ["allahu teala"],
  "peygamber": ["peygamber", "resul", "resulullah", "nebi"],
  "peygamberimiz": ["peygamberimiz", "resulullah", "muhammed"],
  "resulullah": ["resulullah", "muhammed"],
  "mucize": ["cize", "mucize"],
  "kuran": ["kur", "kuran"],
  "kurani kerim": ["kur kerim"],
  "tefsir": ["tefsir"],
  "hadis": ["hadis"],
  "hadisi serif": ["hadis i serif", "hadis i serifler"],
  "sunneti seniyye": ["sunnet i seniyye"],
  "mezhep": ["mezheb", "mezhep", "mezhebat"],
  "mezheb": ["mezheb"],
  "ehli sunnet": ["ehl i sunnet", "ehli sunnet", "ehl-i sunnet", "sunni"],
  "ehl i sunnet": ["ehl i sunnet"],
  "hanefi": ["hanefi", "hanifi", "hanefi mezhebi", "hanefiyye", "imami azam"],
  "safii": ["safi i", "safii", "safiiyye"],
  "maliki": ["maliki", "malikiyye"],
  "hanbeli": ["hanbeli", "hanbeliyye"],
  "bidat": ["bid", "bidat"],
  "bid at": ["bid"],
  "sapik": ["sapik", "dalalet"],
  "dalalet": ["dalalet"],
  "kelime i sehadet": ["kelime i sehadet", "sehadet"],
  "musluman olmak": ["musliman", "kelime i sehadet"],
  "kafir": ["kafir", "kuffar"],
  "musrik": ["musrik"],
  "sirk": ["sirk", "shirk"],
  "gayba iman": ["gayba iman"],
  "ahiret": ["ahiret"],
  "cennet": ["cennet", "jannah"],
  "cehennem": ["cehennem", "jahannam"],
  "kabir": ["kabr", "kabir", "mezar"],
  "kabir azabi": ["kabr azabi", "kabir azabi"],
  "kabir hayati": ["kabr hayati"],
  "kabir ziyareti": ["kabr ziyareti"],
  "kiyamet": ["kiyamet", "qiyama"],
  "mahser": ["mahser", "hashr"],
  "mizan": ["mizan", "terazi"],
  "sirat": ["sirat"],
  "sefaat": ["sefa", "sefaat", "shafaat"],
  "kaza": ["kaza"],
  "kader": ["kader"],
  "kaza kader": ["kaza kader"],
  "irade i cuzi": ["irade i cuz iyye", "irade i cuzi"],
  "levh i mahfuz": ["levh mahfuz"],

  // ---- AHLAK / TASAVVUF ----
  "tovbe": ["tevbe", "tovbe"],
  "tevbe": ["tevbe", "tewbe", "tobe"],
  "tevekkul": ["tevekkul", "tawakkul"],
  "sabir": ["sabr", "sabir"],
  "sukur": ["sukr", "sukur"],
  "hamd": ["hamd"],
  "ihlas": ["ihlas", "ikhlas"],
  "takva": ["takva", "taqwa", "taqva"],
  "vera": ["vera", "wara"],
  "nefs": ["nefs", "nefis", "nafs"],
  "kalp": ["kalb", "kalp"],
  "kalb": ["kalb", "kalp", "qalb"],
  "gunah": ["gunah", "gunah midir"],
  "sevap": ["sevab", "sevap"],
  "kibir": ["kibr", "kibir"],
  "ucub": ["ucb", "ucub"],
  "riya": ["riya"],
  "giybet": ["giybet"],
  "hased": ["hased", "haset"],
  "israf": ["israf"],
  "tasavvuf": ["tesavvuf", "tasavvuf"],
  "tarikat": ["tarikat", "tarikkat", "tariqat", "tarikaat"],
  "evliya": ["evliya", "veli", "veliyy"],
  "keramet": ["keramet", "karama"],
  "firaset": ["firaset"],
  "fena fillah": ["fena fillah"],
  "vahdet i vucud": ["vahdet i vucud"],
  "kelime i tevhid": ["kelime i tevhid"],

  // ---- FIKIH / HUKUK ----
  "zekat": ["zekat"],
  "nisap": ["nisab", "nisap"],
  "zekat nisabi": ["zekat nisabi"],
  "fitre": ["fitre", "fitr", "fitra"],
  "sadaka i fitr": ["sadaka i fitr"],
  "osur": ["osr", "osur", "usur"],
  "hac": ["hacc", "hac"],
  "hacca gitmek": ["hacca gitmek"],
  "umre": ["umre"],
  "ihram": ["ihram"],
  "tavaf": ["tavaf"],
  "kurban": ["kurban"],
  "adak": ["adak", "nezr"],
  "nezir": ["nezr"],
  "oruc": ["oruc", "savm", "sovm"],
  "ramazan": ["ramezan"],
  "ramazan orucu": ["ramezan orucu"],
  "iftar": ["iftar"],
  "sahur": ["sahur", "seher"],
  "keffaret": ["keffaret", "kefaret"],
  "fidye": ["fidye"],
  "iskat": ["iskat"],
  "nikah": ["nikah"],
  "evlenme": ["nikah", "evlenme"],
  "talak": ["talak"],
  "bosanma": ["bosanma", "talak", "hul"],
  "miras": ["miras", "feraiz"],
  "feraiz": ["feraiz"],
  "mehr": ["mehr", "mehir"],
  "mehir": ["mehr", "mehir"],
  "nafaka": ["nafaka"],
  "faiz": ["faiz", "riba"],
  "riba": ["riba", "faiz", "ribaa"],
  "ticaret": ["ticaret"],
  "alis veris": ["alis veris"],
  "bey sira": ["bey sira"],
  "selem": ["selem"],
  "odunc": ["odunc"],
  "kefalet": ["kefalet"],
  "havale": ["havale"],
  "vekalet": ["vekalet"],
  "sirket": ["sirket", "sirketler"],
  "kira": ["kira", "ucret"],
  "sigorta": ["sigorta", "sigortacilik"],
  "banka": ["banka", "bankalar"],
  "bono": ["bono"],
  "vakif": ["vakf", "vakif", "vaqf"],
  "ihtikar": ["ihtikar"],
  "emanet": ["emanet"],
  "yemin": ["yemin"],
  "kefen": ["kefen"],
  "cenaze": ["cenaze"],
  "defin": ["defn", "defin"],
  "diyet": ["diyet"],
  "cinayet": ["cinayet", "cinayetler"],
  "tazir": ["zir", "tazir"],
  "ukubat": ["ukubat", "ceza"],
  "ikrah": ["ikrah"],

  // ---- KISILER / UNVANLAR ----
  "imam i azam": ["imam i a zam", "ebu hanife"],
  "ebu hanife": ["ebu hanife", "imam i a zam"],
  "imam i safii": ["imam i safi i"],
  "imam i rabbani": ["imam i rabbani"],
  "abdulkadir geylani": ["abdulkadir geylani"],
  "ibni abidin": ["ibni abidin"],
  "sahabi": ["sahabi", "eshab", "ashab"],
  "eshab i kiram": ["eshab i kiram"],
  "ashab": ["ashab", "eshab"],
  "alim": ["alim", "ulema", "aalim"],
  "ulema": ["ulema", "alimler"],
  "veli": ["veli", "evliya", "veliyy"],
  "muceddid": ["muceddid"],
  "abdullah i dehlevi": ["abdullah i dehlevi"],
  "dort halife": ["dort halife"],

  // ---- MUBAREK GUNLER / GECELER ----
  "mubarek geceler": ["mubarek geceler"],
  "kadir gecesi": ["kadir gecesi"],
  "mirac gecesi": ["mirac"],
  "berat gecesi": ["berat gecesi"],
  "regaib gecesi": ["regaib gecesi"],
  "mevlid": ["mevlid", "mevlud"],
  "asure": ["asure", "muharrem"],

  // ---- SORU KALIPLARI ----
  "kilinir": ["kilinir", "kilmak", "kilinis"],
  "bozar": ["bozar", "bozulur"],
  "caiz": ["caiz"],
  "sartlari": ["sartlari", "sart", "sartlar"],
  "rekat": ["rek", "rekat"],
  "sevabi": ["sevabi", "sevab"],

  // ---- GENEL KAVRAMLAR ----
  "ibadet": ["ibadet"],
  "itaat": ["ita", "itaat"],
  "isyan": ["isyan"],
  "fitne": ["fitne", "fitnah"],
  "cihad": ["cihad", "jihad", "cihat"],
  "emri bil maruf": ["emr ruf"],
  "ilim": ["ilm", "ilim"],
  "fikh": ["fikh", "fikih"],
  "ictihad": ["ictihad", "ijtihaad"],
  "muctehid": ["muctehid", "mujtahid"],
  "fetva": ["fetva", "fetvaa", "fatwa"],
  "icma": ["icma", "ijma"],
  "kiyas": ["kiyas", "qiyas"],

  // ---- BOZUK AKIMLAR ----
  "vehhabi": ["vehhabi", "vehhabiyye", "vahhabi"],
  "vehhabilik": ["vehhabilik"],
  "hurufilik": ["hurufilik", "hurufi"],
  "siilik": ["ilik", "siilik"],

  // ---- YIYECEK / ICECEK ----
  "yemek": ["yimek", "yemek"],
  "icmek": ["icmek"],
  "serab": ["serab", "icki"],
  "icki": ["icki", "serab"],
  "alkol": ["alkol", "serab"],
  "tutun": ["tutun"],
  "sigara": ["sigara", "tutun"],
  "domuz": ["domuz", "hınzır"],
  "et": ["et", "yimek"],

  // ---- KADIN / AILE ----
  "kadin": ["kadin"],
  "tesettur": ["tesettur", "setr"],
  "sut kardeslik": ["sut kardeslik", "sut akraba"],
  "hidane": ["hidane"],
  "iddet": ["iddet"],
  "zihar": ["zihar"],
  "lian": ["lian"],

  // ---- OLUM / AHIRET ----
  "olum": ["olum"],
  "sifa ayetleri": ["sifa ayetleri"],
  "cin": ["cin"],
  "ruh": ["ruh", "ruhlar", "rooh"],
  "sihr": ["sihr", "buyu"],
  "buyu": ["buyu", "sihr"],
  "nazar": ["nazar"],

  // ---- YAZIM FARKLARI / YAYGIN YANLISLAR ----
  "nemaz": ["nemaz"],
  "cami": ["cami", "camii"],
  "minare": ["minare"],
  "mihrab": ["mihrab"],
  "minber": ["minber"],
  "hutbe": ["hutbe"],
  "muezzin": ["muezzin"],
  "sala": ["sala"],
  "tekbir": ["tekbir"],
  "selam": ["selam", "selamlasmak"],
  "selamlasmak": ["selamlasmak"],
  "dua": ["dua"],
  "zikir": ["zikr", "zikir", "dhikr"],
  "tesbih": ["tesbih"],
  "istigfar": ["istigfar", "estagfirullah"],
  "salavat": ["salavat"],
  "mubarek": ["mubarek"],

  // ---- EK FIKIH TERIMLERI ----
  "muhayyer": ["muhayyer", "muhayyerlik"],
  "batil": ["batil"],
  "fasid": ["fasid"],
  "sahih": ["sahih"],
  "sarraflik": ["sarraflik"],
  "istisna": ["istisna"],

  // ---- TOPLUMSAL ----
  "adalet": ["adalet"],
  "sosyalizm": ["sosyalizm"],
  "kapitalizm": ["kapitalizm"],
  "komunizm": ["komunizm"],
  "fen": ["fen"],
  "atom": ["atom"],
  "madde": ["madde"],
  "hucre": ["hucre", "huceyre"],
  "mikrop": ["mikrop"],

  // ---- DIGER ARAMA VARYANTLARI ----
  "abdestsiz": ["abdestsiz"],
  "cunup": ["cunub", "cunup"],
  "cunub": ["cunub"],
  "hayiz": ["hayz", "hayiz"],
  "nifas": ["nifas"],
  "lohusa": ["lohusa", "nifas"],
  "gunahlar": ["gunahlar"],
  "buyuk gunah": ["buyuk gunah", "kebire"],
  "kebire": ["kebire"],
  "taat": ["taat"],
  "amel": ["amel"],
  "ihlasi serif": ["ihlas i serif"],
  "fatiha": ["fatiha"],
  "muavvizeteyn": ["muavvizeteyn"],
  "ayet": ["ayet"],
  "sure": ["sure"],
  "mushaf": ["mushaf"],
  "hafiz": ["hafiz"],
  "hatim": ["hatim"],
  "vaaz": ["vaaz"],
  "vaiz": ["vaiz"],
  "mufti": ["mufti"],
  "kadi": ["kadi", "qadi", "hakim"],
  "imam hatip": ["imam hatip"],
  "medrese": ["medrese"],
  "cuma hutbesi": ["cum", "hutbe"],
  "salli barik": ["salli barik"],
  "tahiyyat": ["tahiyyat", "ettehiyyatu"],
  "ettehiyyatu": ["ettehiyyatu", "tahiyyat"],
  "subhaneke": ["subhaneke"],
  "kunut duasi": ["kunut duasi"],
  "sena": ["sena"],
  "kiyam": ["kiyam"],
  "kuud": ["kuud", "oturmak"],
  "niyet": ["niyyet", "niyet"],
  "iftitah tekbiri": ["iftitah tekbiri", "tahrime"],
  "tahrime": ["tahrime"],
  "kade i ahire": ["kade i ahire"],
  "fatiha okumak": ["fatiha okumak"],
  "zammi sure": ["zammi sure"],
  "salli": ["salli"],
  "barik": ["barik"],
  "rabbena": ["rabbena"],
  "farz namaz": ["farz nemaz"],
  "sunnet namaz": ["sunnet nemaz"],

  // ---- OSMANLI / TRANSLİTERASYON GENİŞLETME (SEARCH-02) ----
  "itikad": ["tikad", "itikad", "itikat", "akaid"],
  "akaid": ["akaid", "akaaid", "itikad"],
  "kelam": ["kelam"],
  "naksi": ["naksi", "naksibendi", "naksibendiyye"],
  "naksibendi": ["naksibendi", "naksibendiyye", "naksi"],
  "silsile": ["silsile"],
  "rabita": ["rabita"],
  "mursid": ["mursid", "mursi"],
  "murid": ["murid", "muriid"],
  "iman etmek": ["iyman"],
  "tagut": ["tagut", "taagut"],
  "kufr": ["kufr", "kufur", "kufir"],
  "munafik": ["munafik", "nifak"],
  "fasik": ["fasik", "fisq"],
  "mubtedi": ["mubtedi", "bid"],
  "maturidi": ["maturidi", "maturidiyye"],
  "esari": ["esari", "esariyye"],
  "nass": ["nass"],
  "muftu": ["muftu", "mufti"],
  "taklid": ["taklid", "taqlid"],
  "ihtilaf": ["ihtilaf", "ikhtilaaf"],
  "ruhsat": ["ruhsat", "rukhsa"],
  "azimet": ["azimet", "azime"],
  "sehid": ["sehid", "shahid", "sehit"],
  "gazi": ["gazi", "ghazi"],
  "daru l islam": ["dar islam", "darul islam"],
  "daru l harp": ["dar harp", "darul harp", "darul harb"],
  "zuhd": ["zuhd", "zuhd"],
  "sabr": ["sabr", "sabir"],
  "sukr": ["sukr", "sukur"],
  "riza": ["riza", "ridha"],
  "murakabe": ["murakabe", "muraqaba"],
  "muhasebeyi nefs": ["muhasebe-i nefs", "muhasebe"],
  "amelisalih": ["salih amel"],
  "sagire": ["sagire"],
  "azab": ["azab", "azaab"],
  "berzah": ["berzah", "barzakh"],
  "hesap gunu": ["hesap gunu", "yevm hisab"],
  "mehdi": ["mehdi", "mahdi"],
  "deccal": ["deccal", "dajjal"],
  "isa aleyhisselam": ["isa aleyhisselam", "hazreti isa"],
  "magfiret": ["magfiret", "mughfira"],
  "rahmet": ["rahmet", "rahmah"],
  "bereket": ["bereket", "baraka"],
  "sadaka": ["sadaka", "sadaqah"],
  "usur": ["usur", "osr", "ushr"],
  "cizye": ["cizye", "jizyah"],
  "harac": ["harac", "kharaj"],
  "mudaraba": ["mudaraba", "mudarebe"],
  "murabaha": ["murabaha", "murabehe"]
};

// ============================================================================
// 2. SORU -> MADDE ESLESTIRME HARITASI
// ============================================================================
var soruMaddeMap = [

  // ============================================================
  // BIRINCI KISIM — IMAN, IBADET, FIKIH
  // ============================================================

  // ---- PEYGAMBERE UYMAK ----
  {
    soru: ["peygambere uymak", "saadet nedir", "resulullaha uymak"],
    kisim: 1, maddeNo: 1,
    cevapOzet: "Peygamber Efendimize (sallallahü aleyhi ve sellem) uymak, insanı ebedî saadete kavuşturur."
  },
  {
    soru: ["allaha itaat", "resule itaat", "itaat nedir"],
    kisim: 1, maddeNo: 2,
    cevapOzet: "Allahü teâlâya itaat, Resûlüne (sallallahü aleyhi ve sellem) itaat etmekle olur."
  },

  // ---- IMAN VE AKAID ----
  {
    soru: ["musluman nasil olunur", "musluman olmak", "kelime i sehadet", "sehadet getirmek", "islam a girmek"],
    kisim: 1, maddeNo: 3,
    cevapOzet: "Müslüman olmak için Kelime-i şehâdet söylenir; mânâsını bilip kalb ile inanmak şarttır."
  },
  {
    soru: ["ehli sunnet nedir", "ehl i sunnet nedir", "ehl i sunnet kimdir", "ehli sunnet mezhebi"],
    kisim: 1, maddeNo: 4,
    cevapOzet: "Ehl-i sünnet, Peygamber Efendimizin (sallallahü aleyhi ve sellem) ve Eshâb-ı kirâmın yolunda olan müslümanların itikad mezhebidir."
  },
  {
    soru: ["imam i azam kimdir", "ebu hanife kimdir", "hanefi mezhebi kurucusu"],
    kisim: 1, maddeNo: 5,
    cevapOzet: "Ehl-i sünnetin reisi, İmâm-ı A'zam Ebû Hanîfe Nu'mân bin Sâbit hazretleridir."
  },
  {
    soru: ["imam i azam buyuklugu", "ebu hanife buyuklugu"],
    kisim: 1, maddeNo: 6,
    cevapOzet: "İmâm-ı A'zam Ebû Hanîfe hazretlerinin büyüklüğü, Dürr-ül-muhtâr ve Hayrât-ül-hisân kitaplarından nakledilmektedir."
  },
  {
    soru: ["islam alimleri", "islam alimleri kitaplari"],
    kisim: 1, maddeNo: 7,
    cevapOzet: "İslâm âlimlerinin kitapları, Ehl-i sünnet itikadını ve fıkhını doğru olarak bildirir."
  },
  {
    soru: ["kuran tefsiri", "tefsir nedir", "uydurma tefsir"],
    kisim: 1, maddeNo: 8,
    cevapOzet: "Kur'ân-ı Kerîmi kendi görüşüne göre tefsir etmek büyük günahtır; uydurma tefsir yazan kâfir olur."
  },
  {
    soru: ["kuran tercumesi", "kuran meali", "hangi meal guvenilir"],
    kisim: 1, maddeNo: 9,
    cevapOzet: "Kur'ân-ı Kerîm tercümelerine dikkat edilmelidir; hangisine güvenileceği bildirilmektedir."
  },
  {
    soru: ["din hirsizlari", "sahte hoca", "yanlis din anlatan"],
    kisim: 1, maddeNo: 10,
    cevapOzet: "Din hırsızları, dini yanlış anlatıp müslümanları doğru yoldan ayıran kimselerdir."
  },
  {
    soru: ["iman nedir", "iman ne demek", "iman tanimi", "iman bilgileri"],
    kisim: 1, maddeNo: 3,
    cevapOzet: "Îmân, Peygamber Efendimizin (sallallahü aleyhi ve sellem) Allahü teâlâdan getirdiklerinin hepsine kalb ile inanmaktır; müslüman olmak için Kelime-i şehâdet söylenir."
  },
  {
    soru: ["imani bozan seyler", "iman nasil gider", "kufre dusurmek", "kufur sozleri"],
    kisim: 1, maddeNo: 11,
    cevapOzet: "Îmânın gitmesine sebep olan söz ve işler bildirilmektedir; küfür sebeplerinden sakınmak lâzımdır."
  },
  {
    soru: ["imanin alameti nedir", "iman nasil belli olur"],
    kisim: 1, maddeNo: 12,
    cevapOzet: "Kalbde îmân bulunmasının alâmeti, İslâmiyetin hükümlerine (ahkâm-ı islâmiyye) uymaktır."
  },
  {
    soru: ["allahin nimetleri", "nimet nedir", "allahun nimetleri"],
    kisim: 1, maddeNo: 13,
    cevapOzet: "Allahü teâlânın nimetleri dünyada herkese, âhirette ise yalnız mü'minlere verilir."
  },
  {
    soru: ["kafir ahirette", "kafirin akibeti", "kafir merhamet"],
    kisim: 1, maddeNo: 14,
    cevapOzet: "Âhirette kâfir olarak ölenlere merhamet yoktur."
  },
  {
    soru: ["muhabbet nedir", "allah sevgisi alameti", "sevginin alameti"],
    kisim: 1, maddeNo: 15,
    cevapOzet: "Muhabbetin (sevginin) alâmeti, sevilenin isteklerine uymaktır."
  },
  {
    soru: ["peygamber efendimiz", "hz muhammed", "peygamberimizin hayati"],
    kisim: 1, maddeNo: 16,
    cevapOzet: "Peygamber Efendimiz Muhammed (sallallahü aleyhi ve sellem), Allahü teâlânın sevgilisidir."
  },
  {
    soru: ["mucize nedir", "peygamberimizin mucizeleri"],
    kisim: 1, maddeNo: 17,
    cevapOzet: "Peygamber Efendimizin (sallallahü aleyhi ve sellem) mûcizeleri ve Kur'ân-ı Kerîmin üstünlüğü bildirilmektedir."
  },
  {
    soru: ["resule tabi olmak", "evlad terbiyesi", "cocuk terbiyesi", "cocuga din ogretmek"],
    kisim: 1, maddeNo: 18,
    cevapOzet: "Resûlullaha (sallallahü aleyhi ve sellem) tâbi olmanın nasıl olacağı ve evlât terbiyesi anlatılmaktadır."
  },
  {
    soru: ["hubbi fillah", "bugdi fillah", "allah icin sevmek", "allah icin buzmek"],
    kisim: 1, maddeNo: 19,
    cevapOzet: "Hubb-i fillah ve buğd-i fillah, yani Allah için sevmek ve Allah için sevmemek anlatılmaktadır."
  },
  {
    soru: ["kazaya riza", "kadere razi olmak", "allahtan gelen bela"],
    kisim: 1, maddeNo: 19,
    cevapOzet: "Kazâya rızânın nasıl olacağı anlatılmaktadır."
  },
  {
    soru: ["cennet nedir", "cennete girmek", "cennete nasil girilir"],
    kisim: 1, maddeNo: 21,
    cevapOzet: "Cennete girmek için Peygamber Efendimize (sallallahü aleyhi ve sellem) uymak lâzımdır."
  },
  {
    soru: ["kafirlerin iyiligi", "kafir iyilik", "kafirin sevabi"],
    kisim: 1, maddeNo: 22,
    cevapOzet: "Kâfirlerin iyilikleri dünyada kalır; âhirette faydası olmaz."
  },
  {
    soru: ["dunya ahiretin tarlasi", "dunya nedir", "dunya ahiret"],
    kisim: 1, maddeNo: 23,
    cevapOzet: "Dünya, âhiretin tarlasıdır; burada ekilen âhirette biçilir."
  },
  {
    soru: ["ahiret bilgileri", "ahirete iman", "gayba iman"],
    kisim: 1, maddeNo: 24,
    cevapOzet: "Âhiret bilgileri aklın dışındadır; bunlara akıl ermez, îmân ile kabul edilir."
  },
  {
    soru: ["kuran i kerim nedir", "kuran allah kelami mi"],
    kisim: 1, maddeNo: 91,
    cevapOzet: "Kur'ân-ı Kerîm, Allah kelâmıdır; mahlûk değildir."
  },
  {
    soru: ["allah nedir", "allah nasil anlasilir", "allahu teala"],
    kisim: 1, maddeNo: 94,
    cevapOzet: "Allahü teâlâ akıl ile, hayal ile anlaşılamaz; gayba îmân etmek lâzımdır."
  },
  {
    soru: ["ictihad hatalari", "imam i azam ictihad", "muctehid hatasi"],
    kisim: 1, maddeNo: 26,
    cevapOzet: "İctihad hataları ve İmâm-ı A'zam Ebû Hanîfe hazretlerinin büyüklüğü anlatılmaktadır."
  },
  {
    soru: ["kafirlerin esyasi", "gayrimuslim esyasi kullanmak"],
    kisim: 1, maddeNo: 29,
    cevapOzet: "Kâfirlerin kullandığı şeyler iki türlüdür: âdete ait olanlar ve dine ait olanlar."
  },
  {
    soru: ["resulullaha uymak dereceleri", "sunnete uymak dereceleri"],
    kisim: 1, maddeNo: 30,
    cevapOzet: "Resûlullaha (sallallahü aleyhi ve sellem) uymak yedi derecedir."
  },
  {
    soru: ["ehl i sunnet itikadi", "itikad nedir", "haramlar nelerdir"],
    kisim: 1, maddeNo: 31,
    cevapOzet: "Ehl-i sünnet itikadı, haramlar ve tevbe anlatılmaktadır."
  },
  {
    soru: ["yetmisuc firka", "73 firka", "firkai naciye", "hangi mezhep kurtulur"],
    kisim: 1, maddeNo: 32,
    cevapOzet: "Bu ümmet yetmiş üç fırkaya ayrılacaktır; kurtulacak olan Ehl-i sünnet vel-cemâattir."
  },
  {
    soru: ["allahin yakin olmasi", "kurbiyet nedir", "allaha yakinlik"],
    kisim: 1, maddeNo: 45,
    cevapOzet: "Allahü teâlânın kullarına yakın olmasının ne demek olduğu anlatılmaktadır."
  },
  {
    soru: ["fen bilgileri ve din", "fen ve iman", "yaratici var mi"],
    kisim: 1, maddeNo: 36,
    cevapOzet: "Bir üniversiteliye cevap: Fen bilgileri, bir yaratıcının var olduğunu göstermektedir."
  },
  {
    soru: ["felsefecilere gore tefsir", "felsefi tefsir caiz mi"],
    kisim: 1, maddeNo: 33,
    cevapOzet: "Kur'ân-ı Kerîmi felsefecilere göre tefsir etmek câiz değildir."
  },
  {
    soru: ["tenasuh nedir", "reenkarnasyon", "ruh gocu var mi"],
    kisim: 1, maddeNo: 39,
    cevapOzet: "Tenâsüh (ruh göçü) ve iki ruhluluk yoktur; âlem-i misâl anlatılmaktadır."
  },

  // ---- SUNNET VE BID AT ----
  {
    soru: ["sunnet nedir", "sunnet i muekkede", "sunnet i zevaid"],
    kisim: 1, maddeNo: 28,
    cevapOzet: "Sünnet-i müekkede ve sünnet-i zevâid anlatılmaktadır."
  },
  {
    soru: ["sunnete yapismak", "sunnet onemi", "bid atten sakinmak"],
    kisim: 1, maddeNo: 34,
    cevapOzet: "Sünnete yapışmak, bid'atlerden sakınmak lâzımdır."
  },
  {
    soru: ["bidat nedir", "bid at nedir", "bid at ne demek"],
    kisim: 1, maddeNo: 34,
    cevapOzet: "Bid'at, Peygamber Efendimizin (sallallahü aleyhi ve sellem) ve Eshâb-ı kirâmın zamanından sonra dinde çıkarılan şeylerdir; bunlardan sakınmak lâzımdır."
  },
  {
    soru: ["bid at tehlikesi", "sunneti terk etmek", "bid atlerden sakinmak"],
    kisim: 2, maddeNo: 1,
    cevapOzet: "Unutulmuş sünnetleri meydana çıkarmak ve bid'atlerden sakınmak teşvik edilmektedir."
  },
  {
    soru: ["sunneti ihya", "unutulmus sunnet", "sunneti canlandirmak"],
    kisim: 2, maddeNo: 1,
    cevapOzet: "Unutulmuş sünnetleri meydana çıkarmak ve bid'atlerden sakınmak teşvik edilmektedir."
  },
  {
    soru: ["ictihad nedir", "muctehid kimdir", "ictihad ne demek"],
    kisim: 1, maddeNo: 27,
    cevapOzet: "İctihad, şer'î hükümleri delillerden çıkarmaktır; müctehid, bunu yapabilecek ilme sahip âlimdir."
  },
  {
    soru: ["farz sunnet nafile farki", "farz sunnet onemi"],
    kisim: 1, maddeNo: 44,
    cevapOzet: "Farz, sünnet ve nâfilelerin ehemmiyeti ve farkları bildirilmektedir."
  },
  {
    soru: ["iman ibadet nasihat", "iman ve ibadet", "luzumlu nasihatler"],
    kisim: 1, maddeNo: 46,
    cevapOzet: "Îmân, ibadetler ve lüzumlu nasihatler bildirilmektedir."
  },
  {
    soru: ["haramlar nelerdir", "iman ve haram", "buyuk gunahlar"],
    kisim: 1, maddeNo: 47,
    cevapOzet: "Îmân, ibadetler ve haramlar bildirilmektedir."
  },
  {
    soru: ["alem nasil yaratildi", "yoktan yaratma", "yunan filozoflari"],
    kisim: 1, maddeNo: 49,
    cevapOzet: "Âlemler ve her şey yoktan var edilmiştir; Yunan felsefecilerinin yanılgıları bildirilmektedir."
  },

  // ---- NAMAZ ----
  {
    soru: ["abdest nasil alinir", "abdest almak", "abdesti bozan seyler"],
    kisim: 1, maddeNo: 52,
    cevapOzet: "Abdest almak ve abdesti bozan şeyler bildirilmektedir."
  },
  {
    soru: ["otuzuc farz", "33 farz", "bes vakit namaz farzlari"],
    kisim: 1, maddeNo: 51,
    cevapOzet: "Beş vakit namaz ve otuz üç farz bildirilmektedir."
  },
  {
    soru: ["namazin farzlari", "namaz farzlari", "namazin sartlari"],
    kisim: 1, maddeNo: 51,
    cevapOzet: "Namazın farzları ve şartları, otuz üç farz içinde bildirilmektedir."
  },
  {
    soru: ["mest uzerine mesh", "meshe mesh", "ozur sahibi"],
    kisim: 1, maddeNo: 53,
    cevapOzet: "Mest üzerine mesh ve özür sahibi olmanın hükümleri bildirilmektedir."
  },
  {
    soru: ["gusul nasil alinir", "gusul abdesti nasil alinir", "boy abdesti"],
    kisim: 1, maddeNo: 54,
    cevapOzet: "Gusül abdestinin nasıl ve ne zaman alınacağı bildirilmektedir; ağıza ve burna su vermek farzdır."
  },
  {
    soru: ["teyemmum nasil yapilir", "teyemmum nasil alinir", "teyemmum nedir"],
    kisim: 1, maddeNo: 55,
    cevapOzet: "Teyemmüm, su bulunamadığı veya kullanılamadığı zaman temiz toprak ile yapılan temizliktir."
  },
  {
    soru: ["necaset nedir", "necaset temizligi", "istinca nedir", "istibra nedir"],
    kisim: 1, maddeNo: 56,
    cevapOzet: "Necâsetten tahâret, istincâ ve istibrâ hükümleri bildirilmektedir."
  },
  {
    soru: ["sular nedir", "su cesitleri", "temiz su"],
    kisim: 1, maddeNo: 57,
    cevapOzet: "Sular, temiz su, pis su ve artıklar anlatılmaktadır."
  },
  {
    soru: ["avret yerleri", "setr i avret", "avret nedir"],
    kisim: 1, maddeNo: 58,
    cevapOzet: "Setr-i avret: namazda ve namaz dışında örtülmesi gereken yerler bildirilmektedir."
  },
  {
    soru: ["kible neresi", "kible nasil bulunur", "kible tayini"],
    kisim: 1, maddeNo: 59,
    cevapOzet: "İstikbâl-i kıble, namazda Kâbe-i muazzamaya yönelmektir; kıblenin nasıl tayin edileceği anlatılmaktadır."
  },
  {
    soru: ["namaz vakitleri", "bes vakit namaz saatleri", "namaz vakti ne zaman"],
    kisim: 1, maddeNo: 60,
    cevapOzet: "Namaz vakitleri, takvimler ve ezan anlatılmaktadır."
  },
  {
    soru: ["ezan nedir", "ezan nasil okunur", "ezan kelimeleri"],
    kisim: 1, maddeNo: 61,
    cevapOzet: "Ezan ve ikamet bildirilmektedir."
  },
  {
    soru: ["ezan anlami", "ezan manasi", "ezan kelimelerinin manasi"],
    kisim: 1, maddeNo: 62,
    cevapOzet: "Ezan kelimelerinin mânâları açıklanmaktadır."
  },
  {
    soru: ["namaz kilmamak gunah mi", "namaz kilmayanin cezasi", "namaz onemi"],
    kisim: 1, maddeNo: 63,
    cevapOzet: "Namazın ehemmiyeti büyüktür; namaz kılmayanların hâli bildirilmektedir."
  },
  {
    soru: ["namaz nasil kilinir", "namaz kilinis", "namaz rukunleri", "namazin bes ruknu"],
    kisim: 1, maddeNo: 64,
    cevapOzet: "Namazın nasıl kılınacağı, namazın beş rüknü ve niyet açıklanmaktadır."
  },
  {
    soru: ["yolculukta namaz", "seferi namaz", "yolcu namazi", "misafir namazi"],
    kisim: 1, maddeNo: 65,
    cevapOzet: "Yolculukta, otobüste, gemide ve uçakta namaz bildirilmektedir; seferî olan, dört rekâtlı farzları iki rekât kılar."
  },
  {
    soru: ["secde i sahv", "sehiv secdesi", "namazin vacibleri", "vitir namazi"],
    kisim: 1, maddeNo: 66,
    cevapOzet: "Namazın vâcibleri, secde-i sehv, secde-i tilâvet ve vitir namazı açıklanmaktadır."
  },
  {
    soru: ["namazi bozan seyler", "namaz bozulur mu", "namazi ne bozar"],
    kisim: 1, maddeNo: 67,
    cevapOzet: "Namazı bozan şeyler ve kâfirlere benzemenin (teşebbüh) hükmü bildirilmektedir."
  },
  {
    soru: ["namazin mekruhlari", "namazda mekruh", "namazi bozmak icin ozur"],
    kisim: 1, maddeNo: 68,
    cevapOzet: "Namazın mekruhları ve namazı bozmak için özür sayılan hâller bildirilmektedir."
  },
  {
    soru: ["teravih namazi nasil kilinir", "teravih namazi", "camide adab"],
    kisim: 1, maddeNo: 69,
    cevapOzet: "Câmide yapılması câiz olmayan şeyler ve terâvih namazı anlatılmaktadır."
  },
  {
    soru: ["cemaatle namaz", "cemaat ile namaz", "hoparlorle namaz", "radyo ile namaz"],
    kisim: 1, maddeNo: 70,
    cevapOzet: "Cemaat ile namaz kılmanın hükümleri bildirilmektedir; hoparlörle ve radyo ile namaz da ele alınmaktadır."
  },
  {
    soru: ["cuma namazi nasil kilinir", "cuma namazi", "cuma farzi"],
    kisim: 1, maddeNo: 71,
    cevapOzet: "Cuma namazı erkeklere farzdır; cuma namazı ve ibadetin ne demek olduğu anlatılmaktadır."
  },
  {
    soru: ["bayram namazi nasil kilinir", "bayram namazi", "bayram namazlari"],
    kisim: 1, maddeNo: 72,
    cevapOzet: "Bayram namazı vâcibdir; kılınışı ve Kurban bayramı tekbirleri anlatılmaktadır."
  },
  {
    soru: ["namazda parmak kaldirmak", "tesehhudde parmak", "otururken parmak"],
    kisim: 1, maddeNo: 73,
    cevapOzet: "Namazda otururken parmak kaldırmanın hükmü bildirilmektedir."
  },
  {
    soru: ["kaza namazi", "kaza namazi nasil kilinir", "namaz borcu", "kaza namazlari"],
    kisim: 1, maddeNo: 74,
    cevapOzet: "Kazâ namazlarını kılmak lâzımdır; namaz kılmayanın cezası bildirilmektedir."
  },
  {
    soru: ["namaz ibadetlerin en ustunu mu", "namaz ustunlugu"],
    kisim: 1, maddeNo: 75,
    cevapOzet: "Namaz, ibadetlerin en üstünüdür."
  },
  {
    soru: ["tadili erkan nedir", "kul hakki"],
    kisim: 1, maddeNo: 76,
    cevapOzet: "Namazda ta'dîl-i erkân ve kul hakkı anlatılmaktadır."
  },
  {
    soru: ["helal lokma", "sehid kime denir", "sehidlik nedir"],
    kisim: 1, maddeNo: 77,
    cevapOzet: "Namazı doğru kılmak, helâl lokma ve şehîdin kime denildiği anlatılmaktadır."
  },

  // ---- ORUC ----
  {
    soru: ["ramazan orucu", "oruc nasil tutulur", "ramazanin kiymeti"],
    kisim: 1, maddeNo: 79,
    cevapOzet: "Ramazân-ı şerîfin kıymeti ve orucun nasıl tutulacağı anlatılmaktadır."
  },
  {
    soru: ["orucu bozan seyler", "oruc bozulur mu", "orucu ne bozar", "ramazan orucu hukmu"],
    kisim: 1, maddeNo: 79,
    cevapOzet: "Ramazan orucunun hükümleri ve orucu bozan şeyler bildirilmektedir."
  },

  // ---- ZEKAT ----
  {
    soru: ["zekat nedir", "zekat vermek", "zekat hukumleri", "zekat farz mi"],
    kisim: 1, maddeNo: 78,
    cevapOzet: "Zekât vermek farzdır; para, mal, hayvan ve toprak mahsullerinin zekâtı anlatılmaktadır."
  },
  {
    soru: ["zekat nisabi", "zekat nisabi ne kadar", "zekat miktari"],
    kisim: 1, maddeNo: 78,
    cevapOzet: "Hanefî mezhebinde altının zekât nisabı 96 gram, gümüşün nisabı 672 gramdır; hesaplanması anlatılmaktadır."
  },
  {
    soru: ["zekat kimlere verilir", "zekat kimlere farz", "zekat verilecek kimseler"],
    kisim: 1, maddeNo: 78,
    cevapOzet: "Zekât, Kur'ân-ı Kerîmde bildirilen sekiz sınıf insana verilir."
  },
  {
    soru: ["fitre nedir", "sadaka i fitr", "fitre ne kadar", "fitre kimlere verilir"],
    kisim: 1, maddeNo: 80,
    cevapOzet: "Sadaka-i fıtr, Ramazan bayramında verilmesi vâcib olan sadakadır; kimlerin vereceği ve kimlere verileceği bildirilmektedir."
  },

  // ---- HAC ----
  {
    soru: ["hac nasil yapilir", "hac farzi", "hacca gitmek", "hac ibadetleri"],
    kisim: 1, maddeNo: 84,
    cevapOzet: "Hac, imkânı olan müslümana ömründe bir kere farzdır; haccın nasıl yapılacağı anlatılmaktadır."
  },

  // ---- KURBAN / ADAK / YEMIN ----
  {
    soru: ["kurban kesmek", "kurban nedir", "kurban vacip mi", "kurban nasil kesilir"],
    kisim: 1, maddeNo: 81,
    cevapOzet: "Kurban kesmek, nisaba mâlik olan müslümanlara vâcibdir; kimlerin keseceği ve nasıl kesileceği anlatılmaktadır."
  },
  {
    soru: ["adak nedir", "adak nasil yapilir", "nezir nedir"],
    kisim: 1, maddeNo: 82,
    cevapOzet: "Adağın (nezir) ne demek olduğu ve günah olan adaklar bildirilmektedir; adağı yerine getirmek vâcibdir."
  },
  {
    soru: ["yemin nedir", "yemin keffareti", "yemin bozmak"],
    kisim: 1, maddeNo: 83,
    cevapOzet: "Yemînin nasıl edileceği, yemînin çeşitleri ve yemîn keffâreti bildirilmektedir."
  },

  // ---- MUBAREK GECELER / TAKVIM ----
  {
    soru: ["mubarek geceler", "kandil geceleri", "kadir gecesi", "mirac gecesi"],
    kisim: 1, maddeNo: 85,
    cevapOzet: "Mübârek geceler, kandiller ve Peygamber Efendimizin (sallallahü aleyhi ve sellem) mîrâcı anlatılmaktadır."
  },
  {
    soru: ["hicri takvim", "kameri sene", "hicri yil cevirme"],
    kisim: 1, maddeNo: 87,
    cevapOzet: "Kamerî seneyi mîlâdî seneye çevirmenin yolu bildirilmektedir."
  },

  // ---- SELAMLASMA ----
  {
    soru: ["selam vermek", "selamlasmak", "selam nasil verilir"],
    kisim: 1, maddeNo: 90,
    cevapOzet: "Selâmlaşmak sünnettir; selâm vermenin, almanın ve müsâfehanın âdâbı bildirilmektedir."
  },

  // ---- KUR AN ----
  {
    soru: ["kuran nedir", "kuran i kerim", "kuran tercemeleri"],
    kisim: 1, maddeNo: 25,
    cevapOzet: "Kur'ân-ı Kerîmin ne olduğu ve Kur'ân tercümeleri hakkında bilgi verilmektedir."
  },
  {
    soru: ["kuran mahluk mu", "kuran allah kelami", "kuran yaratilmis mi"],
    kisim: 1, maddeNo: 91,
    cevapOzet: "Kur'ân-ı Kerîm, Allah kelâmıdır; mahlûk değildir."
  },
  {
    soru: ["gayba iman nedir", "gayb nedir", "allahin sifatlari"],
    kisim: 1, maddeNo: 94,
    cevapOzet: "Allahü teâlâ akıl ile anlaşılamaz; gayba îmân etmek lâzımdır."
  },

  // ---- PEYGAMBER EFENDIMIZ ----
  {
    soru: ["hilye i saadet", "siyer kitaplari", "resulullahin zevceleri"],
    kisim: 1, maddeNo: 95,
    cevapOzet: "Hilye-i saâdet, siyer kitapları ve Peygamber Efendimizin (sallallahü aleyhi ve sellem) mübarek zevceleri anlatılmaktadır."
  },
  {
    soru: ["peygamberimizin ahlaki", "hz muhammed ahlaki"],
    kisim: 1, maddeNo: 96,
    cevapOzet: "Peygamber Efendimizin (sallallahü aleyhi ve sellem) güzel ahlâkı anlatılmaktadır."
  },
  {
    soru: ["unutulmus sunnetler", "sunneti ihya etmek", "sunnetleri canlandirmak"],
    kisim: 2, maddeNo: 1,
    cevapOzet: "Unutulmuş sünnetleri meydana çıkarmak ve bid'atlerden sakınmak teşvik edilmektedir."
  },

  // ---- TEVBE, AHLAK ----
  {
    soru: ["tevbe nedir", "tovbe nasil yapilir", "tevbe ve vera"],
    kisim: 1, maddeNo: 43,
    cevapOzet: "Tevbe, verâ ve takvâ anlatılmaktadır."
  },
  {
    soru: ["emri bil maruf", "iyiligi emretmek", "cihad sevabi"],
    kisim: 1, maddeNo: 41,
    cevapOzet: "Emr-i bil-ma'rûf, nehy-i ani'l-münker ve cihâdın sevabı çoktur."
  },
  {
    soru: ["tesettur farz mi", "kadinlarin ortunmesi", "islamda tesettur"],
    kisim: 1, maddeNo: 58,
    cevapOzet: "Setr-i avret ve kadınların örtünmesi bildirilmektedir; kadınların örtünmesi farzdır."
  },
  {
    soru: ["tasavvuf nedir", "tasavvuf yolu"],
    kisim: 1, maddeNo: 50,
    cevapOzet: "Tasavvuf yolunda çalışmak isteyenin yapması lâzım olan şeyler bildirilmektedir."
  },
  {
    soru: ["alemi ervah", "alemi misal", "alemi ecsad"],
    kisim: 1, maddeNo: 40,
    cevapOzet: "Âlem-i ervâh, âlem-i misâl, âlem-i ecsâd ve kabir azabı anlatılmaktadır."
  },
  {
    soru: ["genclikte ibadet", "genc ibadet", "genclik ibadeti"],
    kisim: 1, maddeNo: 48,
    cevapOzet: "Gençlikte yapılan ibadetlerin kıymeti büyüktür."
  },
  {
    soru: ["allahin yakinligi", "kurbiyet ilahi", "yakin olmak allah"],
    kisim: 1, maddeNo: 45,
    cevapOzet: "Allahü teâlânın yakın olmasının ne demek olduğu anlatılmaktadır."
  },

  // ============================================================
  // IKINCI KISIM — AHLAK, AILE, SOSYAL HAYAT, ITIKAD
  // ============================================================
  {
    soru: ["hilye i serif", "peygamberimizin dis gorunusu", "resulullahin sifatlari"],
    kisim: 1, maddeNo: 95,
    cevapOzet: "Hilye-i saâdet ve Peygamber Efendimizin (sallallahü aleyhi ve sellem) mübarek vasıfları anlatılmaktadır."
  },
  {
    soru: ["dua nedir", "dua nasil edilir", "dua etmenin adabi"],
    kisim: 2, maddeNo: 2,
    cevapOzet: "Duâ etmekteki gizli bilgiler açıklanmaktadır."
  },
  {
    soru: ["resulullaha uymak", "hocasini sevmek", "din alimine hurmet"],
    kisim: 2, maddeNo: 3,
    cevapOzet: "Resûlullaha (sallallahü aleyhi ve sellem) uymaya ve dinini öğrendiği kimseyi sevmeye teşvik edilmektedir."
  },
  {
    soru: ["adalet nedir", "akil nedir", "iman ve akil"],
    kisim: 2, maddeNo: 4,
    cevapOzet: "Îmân, akıl, zekâ, helâl, haram, adalet, zulüm, kazâ ve kader anlatılmaktadır."
  },
  {
    soru: ["peygamberimizin guzel ahlaki", "resulullahin ahlaki"],
    kisim: 1, maddeNo: 96,
    cevapOzet: "Peygamber Efendimizin (sallallahü aleyhi ve sellem) güzel ahlâkı anlatılmaktadır."
  },
  {
    soru: ["hadis nedir", "hadis cesitleri", "hadis alimleri"],
    kisim: 2, maddeNo: 6,
    cevapOzet: "Hadîs-i şeriflerin çeşitleri ve hadîs âlimleri bildirilmektedir."
  },
  {
    soru: ["dert bela allahtan", "musibete sabir", "bela allahtan gelir"],
    kisim: 2, maddeNo: 8,
    cevapOzet: "Dert ve belânın Allahü teâlâdan geldiğini düşünmelidir."
  },
  {
    soru: ["belaya sabretmek", "bela sabir", "musibet karsi sabir"],
    kisim: 2, maddeNo: 8,
    cevapOzet: "Dert ve belânın Allahü teâlâdan geldiğini düşünüp sabretmelidir."
  },
  {
    soru: ["sabir nedir", "belaya sabir", "derde sabr"],
    kisim: 2, maddeNo: 9,
    cevapOzet: "İnsanlardan gelen sıkıntılara sabretmek lâzımdır."
  },
  {
    soru: ["uzuntuyu nimet bilmek", "sikinti nimet mi", "bela nimet"],
    kisim: 2, maddeNo: 10,
    cevapOzet: "Üzüntü ve sıkıntıları nimet bilmelidir."
  },
  {
    soru: ["zahir ameller", "kalb dagilmasi", "dis islerin bozuklugu"],
    kisim: 2, maddeNo: 11,
    cevapOzet: "Zâhir işlerin bozuk olması, kalbin dağılmasına yol açar."
  },
  {
    soru: ["bela gunaha keffaret", "dert keffaret", "hastalik gunah siler mi"],
    kisim: 2, maddeNo: 12,
    cevapOzet: "Dert ve belâlar, günahlara keffârettir."
  },
  {
    soru: ["allahin arzusuna uymak", "teslim olmak", "irade i rabbani"],
    kisim: 2, maddeNo: 13,
    cevapOzet: "Kendi dileklerimizi bırakıp Sahibimizin arzusuna uymalıyız."
  },
  {
    soru: ["kibir nedir", "ucub nedir", "kibr ve ucb"],
    kisim: 2, maddeNo: 14,
    cevapOzet: "Kibir ve ucb, kalbin tehlikeli hastalığıdır."
  },
  {
    soru: ["allahin isimleri", "esma ul husna", "yaratmak ne demek"],
    kisim: 2, maddeNo: 15,
    cevapOzet: "Allahü teâlânın isimleri ve yaratmanın ne demek olduğu anlatılmaktadır."
  },
  {
    soru: ["fikih nedir", "mezhep nedir", "hanefi mezhebi"],
    kisim: 2, maddeNo: 16,
    cevapOzet: "Fıkıh ilmi, mezhebin ne olduğu ve İmâm-ı A'zam Ebû Hanîfe hazretleri anlatılmaktadır."
  },
  {
    soru: ["vehhabilik nedir", "vehhabi kimdir", "vehhabi inanci"],
    kisim: 2, maddeNo: 17,
    cevapOzet: "Vehhâbîler ve çeşitleri anlatılmakta; kıymetli din kitaplarını okumak, bozuk kitaplara aldanmamak tavsiye edilmektedir."
  },
  {
    soru: ["kabir ziyareti lazim mi", "olgun ruhlardan istifade", "olulere yardim", "olulere dua"],
    kisim: 2, maddeNo: 18,
    cevapOzet: "Kabir ziyaretinin lüzumu ve olgun ruhlardan istifade edildiği anlatılmaktadır."
  },
  {
    soru: ["kabir azabi", "kabir azabi var mi", "kabir hayati"],
    kisim: 2, maddeNo: 20,
    cevapOzet: "Kabir azabı haktır; buna inanmayanlara cevap verilmektedir."
  },
  {
    soru: ["bela ve sabir", "dert ve sabir", "beladan ders almak"],
    kisim: 2, maddeNo: 8,
    cevapOzet: "Dert ve belânın Allahü teâlâdan geldiğini düşünmelidir."
  },
  {
    soru: ["bozuk dinler", "baska dinler", "behailik", "durziler", "yezidiler"],
    kisim: 2, maddeNo: 21,
    cevapOzet: "Şâmânîler, Behâîler, Ahmediyye, Dürzîler, Yezîdîler ve Selefîler hakkında bilgi verilmektedir."
  },
  {
    soru: ["hurufilik nedir", "hurufilik", "hurufiler"],
    kisim: 2, maddeNo: 22,
    cevapOzet: "Hurûfîlik hakkında bilgi verilmektedir."
  },
  {
    soru: ["resulullahin vefati", "kagit hadisesi", "eshabi kiram ihtilafi"],
    kisim: 2, maddeNo: 23,
    cevapOzet: "Peygamber Efendimizin (sallallahü aleyhi ve sellem) vefatı sırasında kâğıt istemesi ve Eshâb-ı kirâmın üstünlüğü anlatılmaktadır."
  },
  {
    soru: ["eshab i kiram", "sahabe", "sahabi kimdir"],
    kisim: 2, maddeNo: 24,
    cevapOzet: "Eshâb-ı kirâm birbirini çok severdi; Şîîlerin iftiralarına cevap verilmektedir."
  },
  {
    soru: ["eshab i kiram buyuklugu", "sahabe fazileti", "sahabelere dert gelmesi"],
    kisim: 2, maddeNo: 25,
    cevapOzet: "Eshâb-ı kirâmın büyüklüğü ve dostlara çok dert gelmesi anlatılmaktadır."
  },
  {
    soru: ["sosyal adalet", "sosyalizm", "kapitalizm", "komunizm", "islam ekonomisi"],
    kisim: 2, maddeNo: 26,
    cevapOzet: "Sosyal adalet, sosyalizm, kapitalizm ve komünizm İslâm dinine göre değerlendirilmektedir."
  },
  {
    soru: ["islam dini nedir", "islam dini ozellikleri", "islamiyet nedir"],
    kisim: 2, maddeNo: 27,
    cevapOzet: "İslâmiyet, din ve dünya saadetlerinin kaynağıdır."
  },
  {
    soru: ["nefs nedir", "akil nedir", "nefsi terbiye"],
    kisim: 2, maddeNo: 28,
    cevapOzet: "Nefs ve akıl anlatılmaktadır."
  },
  {
    soru: ["muslumanlar neden geri kaldi", "islamin gerileme sebebi", "geri kalma"],
    kisim: 2, maddeNo: 29,
    cevapOzet: "Müslümanların niçin geri kaldıkları ve sebepleri açıklanmaktadır."
  },
  {
    soru: ["islamiyet ve fen", "din fen catisir mi", "islam bilim"],
    kisim: 2, maddeNo: 30,
    cevapOzet: "İslâmiyet fenni emretmektedir; fen bilgileri dine aykırı değildir."
  },
  {
    soru: ["atom nedir", "madde nedir", "atom bilgileri"],
    kisim: 2, maddeNo: 31,
    cevapOzet: "Madde ve atom üzerinde yeni bilgiler verilmektedir."
  },
  {
    soru: ["radyoaktivite nedir", "radar nedir", "radyo aktivite"],
    kisim: 2, maddeNo: 31,
    cevapOzet: "Madde, atom, radyoaktivite ve radar üzerinde yeni bilgiler verilmektedir."
  },

  // ---- AILE HUKUKU ----
  {
    soru: ["nikah nasil kiyilir", "evlenme", "islamda nikah", "nikah hukumleri"],
    kisim: 2, maddeNo: 34,
    cevapOzet: "İslâmiyette nikâh ve evlenmesi câiz olmayan kadınlar bildirilmektedir."
  },
  {
    soru: ["kafirlerin evlenmesi", "cocuga iman ogretmek", "cocuga islami ogretmek"],
    kisim: 2, maddeNo: 35,
    cevapOzet: "Kâfirlerin evlenmesi ve çocuklara îmânı, İslâmı öğretmenin lüzumu bildirilmektedir."
  },
  {
    soru: ["bosanma", "talak nedir", "bosanma hukumleri", "uc talak"],
    kisim: 2, maddeNo: 36,
    cevapOzet: "İslâmiyetteki talâk, hul', zıhâr, liân, iddet ve hıdâne hükümleri açıklanmaktadır."
  },
  {
    soru: ["sut kardeslik", "sut anne", "sut emzirmek"],
    kisim: 2, maddeNo: 37,
    cevapOzet: "Süt kardeşlik ve süt ile akraba olanlar bildirilmektedir."
  },
  {
    soru: ["nafaka nedir", "komsu hakki", "nafaka hukumleri"],
    kisim: 2, maddeNo: 38,
    cevapOzet: "Nafaka, lakît ve komşu hakkı hükümleri açıklanmaktadır."
  },
  {
    soru: ["kadin hakki", "islamda kadin", "kadin haklari"],
    kisim: 2, maddeNo: 39,
    cevapOzet: "İslâmiyette kadının kıymeti ve hakları çok büyüktür."
  },

  // ---- HELAL HARAM ----
  {
    soru: ["helal haram", "halal haram", "subheli seyler", "vera ve takva"],
    kisim: 2, maddeNo: 40,
    cevapOzet: "Helâl, haram ve şüpheli şeyler ile verâ ve takvâ açıklanmaktadır."
  },
  {
    soru: ["haram yiyecekler", "domuz eti", "haram giyecekler"],
    kisim: 2, maddeNo: 41,
    cevapOzet: "Yenmesi ve kullanılması haram olan şeyler bildirilmektedir."
  },
  {
    soru: ["icki haram mi", "serab icmek", "alkol haram mi"],
    kisim: 2, maddeNo: 42,
    cevapOzet: "İçilmesi haram olan içkiler bildirilmektedir."
  },
  {
    soru: ["sigara haram mi", "tutun gunah mi", "tutun icmek"],
    kisim: 2, maddeNo: 43,
    cevapOzet: "Tütün ve sigara içmenin hükmü ele alınmaktadır."
  },
  {
    soru: ["faiz haram mi", "faiz nedir", "riba nedir", "faiz yasak mi", "israf nedir"],
    kisim: 2, maddeNo: 44,
    cevapOzet: "İsrafın ne olduğu, tütünün israf olup olmadığı ve faizin haram olduğu bildirilmektedir."
  },

  // ---- ADAB / GUNLUK HAYAT ----
  {
    soru: ["yemek adabi", "sofra adabi", "yemek icmek adabi"],
    kisim: 2, maddeNo: 45,
    cevapOzet: "Yemek ve içmek âdâbı bildirilmektedir."
  },
  {
    soru: ["hasta yemekleri", "hastalik tedavisi", "saglik tavsiyeleri"],
    kisim: 2, maddeNo: 46,
    cevapOzet: "Hasta yemekleri ve bazı hastalıkların tedavisi bildirilmektedir."
  },
  {
    soru: ["tevekkul nedir", "tevekkul ne demek", "allaha tevekkul"],
    kisim: 2, maddeNo: 47,
    cevapOzet: "Tevekkül, sebeplere yapışıp neticeyi Allahü teâlâya bırakmaktır; evlilerin ve bekârların tevekkülü anlatılmaktadır."
  },
  {
    soru: ["levh i mahfuz", "umm ul kitab", "insan omru degisir mi"],
    kisim: 2, maddeNo: 48,
    cevapOzet: "Levh-i mahfûz, Ümmü'l-kitâb ve insan ömrünün değişmesi anlatılmaktadır."
  },

  // ---- KAZA KADER ----
  {
    soru: ["kaza kader nedir", "kaza ve kader", "kader inanci"],
    kisim: 2, maddeNo: 50,
    cevapOzet: "Ebüssuûd Efendi hazretlerinin Kazâ ve Kader risâlesi bildirilmektedir."
  },
  {
    soru: ["irade i cuziyye nedir", "irade i cuzi"],
    kisim: 2, maddeNo: 49,
    cevapOzet: "İrâde-i cüz'iyye anlatılmakta; bir ihtiyar müslümanın kızına nasihati ve münâcâtı bildirilmektedir."
  },
  {
    soru: ["hamd nedir", "sukur nedir", "hamd sukrden ustun mu"],
    kisim: 2, maddeNo: 51,
    cevapOzet: "Sevgilinin her işi sevilir; hamd, şükürden üstündür."
  },

  // ---- MUZIK / CIN ----
  {
    soru: ["muzik haram mi", "teganni nedir", "sarki soylemek", "calgi haram mi"],
    kisim: 2, maddeNo: 52,
    cevapOzet: "Tegannî, müzik ve radyoda, teypte Kur'ân-ı Kerîm okumak ve dinlemek hakkında hükümler bildirilmektedir."
  },
  {
    soru: ["cin nedir", "cin var mi", "cinler hakkinda"],
    kisim: 2, maddeNo: 53,
    cevapOzet: "Cinler hakkında geniş bilgi ve evliyânın ruhları anlatılmaktadır."
  },
  {
    soru: ["gayb imani", "gaybe iman", "secilmislerin imani"],
    kisim: 2, maddeNo: 62,
    cevapOzet: "Seçilmişlerin, câhillerin ve tasavvuf ehlinin gayba îmânları açıklanmaktadır."
  },
  {
    soru: ["dunyayi terk", "dunya dusuncesi", "evliya gonlu"],
    kisim: 2, maddeNo: 55,
    cevapOzet: "Allah adamlarının gönlünde zerre kadar dünya düşüncesi yoktur."
  },
  {
    soru: ["ruhlar gorunur mu", "tenasuh yoktur", "ruh insan seklinde"],
    kisim: 2, maddeNo: 56,
    cevapOzet: "Ruhlar insan şeklinde görünür; tenâsüh (ruh göçü) yoktur."
  },
  {
    soru: ["medeniyet nedir", "insan neden medeni", "toplum hayati"],
    kisim: 2, maddeNo: 57,
    cevapOzet: "İnsan medenî olmak için yaratılmıştır; yaşamak için başka insanlara muhtaçtır."
  },
  {
    soru: ["keramet cok az olmasi", "harikalarin sebebi"],
    kisim: 2, maddeNo: 60,
    cevapOzet: "Hârikaların ve kerâmetlerin çok veya az olmasının sebebi açıklanmaktadır."
  },
  {
    soru: ["mucize keramet fark", "keramet nedir", "sihr nedir"],
    kisim: 2, maddeNo: 59,
    cevapOzet: "Mûcize, kerâmet, firâset, istidrâc ve sihir arasındaki farklar açıklanmaktadır."
  },
  {
    soru: ["veli olmak icin keramet", "kerametsiz veli", "evliyalik sarti"],
    kisim: 2, maddeNo: 61,
    cevapOzet: "Velî olmak için hârikalar ve kerâmetler lâzım değildir."
  },
  {
    soru: ["allah hicbir seye benzemez", "allah neye benzer", "allah akl ile anlasilir mi"],
    kisim: 2, maddeNo: 66,
    cevapOzet: "Allahü teâlâ hiçbir şeye benzemez ve akıl ile anlaşılamaz."
  },
  {
    soru: ["cennetde allahi gormek", "ruyetullah", "allahu teala gorulecek mi"],
    kisim: 2, maddeNo: 67,
    cevapOzet: "Cennette Allahü teâlânın görüleceğine inanmayanlara cevap verilmektedir."
  },
  {
    soru: ["insanin asli", "nefs in asli", "adem nedir"],
    kisim: 2, maddeNo: 64,
    cevapOzet: "İnsanın aslı ademdir (yokluktur); ademde hiç iyilik yoktur."
  },
  {
    soru: ["guzel suretler", "guzellik sebebi", "guzel yuz"],
    kisim: 2, maddeNo: 65,
    cevapOzet: "Güzel suretlerin tatlı gelmesinin sebebi açıklanmaktadır."
  },
  {
    soru: ["kadinlarla sozlesme", "peygamberimiz kadinlar", "biat nedir"],
    kisim: 3, maddeNo: 2,
    cevapOzet: "Peygamber Efendimizin (sallallahü aleyhi ve sellem) kadınlarla yaptığı sözleşme (biat) ve şirkin tehlikesi bildirilmektedir."
  },
  {
    soru: ["abdullah i dehlevi", "mekatib i serife", "dehlevi hazretleri"],
    kisim: 2, maddeNo: 71,
    cevapOzet: "Abdullah-i Dehlevî hazretlerinin Mekâtib-i şerîfe kitabından mektuplar tercüme edilmektedir."
  },
  {
    soru: ["sunnete yapismak onemi", "bid at zulmet", "sunnet nur"],
    kisim: 3, maddeNo: 1,
    cevapOzet: "İşin başı, sünnet-i seniyyeye yapışmak ve bid'atten sakınmaktır."
  },

  // ============================================================
  // UCUNCU KISIM — TICARET, CEZA, CENAZE, TASAVVUF
  // ============================================================
  {
    soru: ["sunnete bagli olmak", "sunnet seniyye", "ahkam i islamiyye"],
    kisim: 3, maddeNo: 1,
    cevapOzet: "İşin başı, sünnet-i seniyyeye yapışmak ve bid'atten sakınmaktır."
  },
  {
    soru: ["sirk nedir", "insanin en buyuk gunahi", "sirk tehlikesi"],
    kisim: 3, maddeNo: 2,
    cevapOzet: "Şirk, insan için en büyük tehlikedir; Peygamber Efendimizin (sallallahü aleyhi ve sellem) kadınlarla yaptığı sözleşmede yasaklanan işler anlatılmaktadır."
  },
  {
    soru: ["ticaret hukumleri", "islami ticaret", "alis veris hukumleri"],
    kisim: 3, maddeNo: 3,
    cevapOzet: "İslâmiyette kazanç (kesb), ticaret ve helâl kazanmak açıklanmaktadır."
  },
  {
    soru: ["alim satim", "bey ve sira", "satis hukumleri"],
    kisim: 3, maddeNo: 4,
    cevapOzet: "Bey' ve şirâ (alım-satım) ile helâl ve haram satışlar bildirilmektedir."
  },
  {
    soru: ["muhayyerlik nedir", "alis veriste muhayyerlik"],
    kisim: 3, maddeNo: 5,
    cevapOzet: "Alışverişte muhayyerlik hükümleri açıklanmaktadır."
  },
  {
    soru: ["batil satis", "fasid satis", "mekruh satis", "sarraflik"],
    kisim: 3, maddeNo: 6,
    cevapOzet: "Bâtıl, fâsid ve mekruh satışlar ile sarraflık hükümleri bildirilmektedir."
  },
  {
    soru: ["hasta satis", "hasta hediyye", "hastanin satisi", "olum hastasi satis"],
    kisim: 3, maddeNo: 7,
    cevapOzet: "Ölüm hastasının satış ve hediye yapmasının hükümleri bildirilmektedir."
  },
  {
    soru: ["cesitli fikih bilgileri", "sufa nedir", "komsu hakki"],
    kisim: 3, maddeNo: 8,
    cevapOzet: "Komşu, şüf'a ve diğer haklar üzerinde çeşitli bilgiler verilmektedir."
  },
  {
    soru: ["sart ile soylemek", "sartli satis", "sartli muamele"],
    kisim: 3, maddeNo: 9,
    cevapOzet: "Şart ile söylenen şeylerin hükümleri açıklanmaktadır."
  },
  {
    soru: ["bono nedir", "sened kirdirmak", "police", "cek nedir"],
    kisim: 3, maddeNo: 13,
    cevapOzet: "Kefâlet, havâle, bono, senet kırdırmak ve poliçe hükümleri bildirilmektedir."
  },
  {
    soru: ["istisna nedir", "siparis usulu satis", "ismarlanmis mal"],
    kisim: 3, maddeNo: 11,
    cevapOzet: "İstisnâ' (ısmarlama yaptırmak) hükümleri açıklanmaktadır."
  },
  {
    soru: ["odunc vermek", "borc vermek", "karz i hasen"],
    kisim: 3, maddeNo: 12,
    cevapOzet: "Karz-ı hasen (ödünç vermek) ve kimlerin ödünç isteyebileceği bildirilmektedir."
  },
  {
    soru: ["kefalet nedir", "havale nedir"],
    kisim: 3, maddeNo: 13,
    cevapOzet: "Kefâlet ve havâle hükümleri açıklanmaktadır."
  },
  {
    soru: ["vekalet nedir", "vekil tayin"],
    kisim: 3, maddeNo: 14,
    cevapOzet: "Vekâlet; alışverişte ve zekât vermekte vekil tutmak bildirilmektedir."
  },
  {
    soru: ["ticarette adalet", "ihtikar nedir", "karaborsa"],
    kisim: 3, maddeNo: 15,
    cevapOzet: "Ticarette adalet ve ihtikâr (karaborsacılık) hükümleri açıklanmaktadır."
  },
  {
    soru: ["ticarette ihsan", "ticarette iyilik", "ticaret ahlaki"],
    kisim: 3, maddeNo: 16,
    cevapOzet: "Ticarette ihsan etmek, borç ödemek ve din kitapları anlatılmaktadır."
  },
  {
    soru: ["ticarette dinini kayirmak", "dindar tacir", "ticarette din"],
    kisim: 3, maddeNo: 17,
    cevapOzet: "Ticarette dinini kayırmak ve haramdan sakınmak anlatılmaktadır."
  },
  {
    soru: ["kira hukumleri", "ucret", "iscilik", "sigorta"],
    kisim: 3, maddeNo: 21,
    cevapOzet: "Kira, ücret, işçilik ve sigortacılık hükümleri bildirilmektedir."
  },
  {
    soru: ["faiz hukmu", "banka faizi", "bono kirdirmak", "islamda faiz"],
    kisim: 3, maddeNo: 19,
    cevapOzet: "İslâmiyette faiz, bankalar, bono kırdırmak ve vakıf hükümleri açıklanmaktadır."
  },
  {
    soru: ["sirket hukmu", "ortaklik", "sirket kurma"],
    kisim: 3, maddeNo: 20,
    cevapOzet: "İslâmiyette şirket kurmak ve şirketler hakkında hükümler bildirilmektedir."
  },
  {
    soru: ["emanet nedir", "emanete riayet", "emanetciye para"],
    kisim: 3, maddeNo: 21,
    cevapOzet: "Emanetçiye verilen para ile kira, ücret, işçilik ve sigortacılık hükümleri bildirilmektedir."
  },
  {
    soru: ["ceza hukuku", "ukubat", "islamda ceza"],
    kisim: 3, maddeNo: 22,
    cevapOzet: "Ukûbât: zinâ, içki, kazf, hırsızlık ve yol kesme cezaları açıklanmaktadır."
  },
  {
    soru: ["tazir cezasi", "tazir nedir", "fikih kitaplari okumak"],
    kisim: 3, maddeNo: 23,
    cevapOzet: "Ta'zîr cezaları bildirilmektedir; tefsir kitaplarını değil, fıkıh kitaplarını okumak lâzımdır."
  },
  {
    soru: ["cinayet hukmu", "adam oldurme", "katl", "kisas nedir"],
    kisim: 3, maddeNo: 24,
    cevapOzet: "Cinayetler, katlin çeşitleri ve cezaları ile kısas hükümleri bildirilmektedir."
  },
  {
    soru: ["diyet nedir", "diyet cezasi", "katl keffareti"],
    kisim: 3, maddeNo: 25,
    cevapOzet: "Diyet cezaları ve katl keffâreti açıklanmaktadır."
  },
  {
    soru: ["ikrah nedir", "zorla yapdirmak", "hicr nedir", "yasaklamak"],
    kisim: 3, maddeNo: 26,
    cevapOzet: "İkrâh (zorla yaptırmak) ve hicr (bir şeyi yasaklamak) hükümleri açıklanmaktadır."
  },
  {
    soru: ["evliyalik ve seriat", "ahkam i islamiyyesiz evliyalik", "seriat olmadan evliya"],
    kisim: 3, maddeNo: 27,
    cevapOzet: "Ahkâm-ı islâmiyyesiz evliyâlık olmaz."
  },
  {
    soru: ["kelime i tevhid", "la ilahe illallah", "tevhid"],
    kisim: 3, maddeNo: 28,
    cevapOzet: "Kelime-i tevhîdin mânâsı bildirilmektedir."
  },
  {
    soru: ["kelime i tevhid ustunlugu", "kelime i tevhid fazileti"],
    kisim: 3, maddeNo: 29,
    cevapOzet: "Kelime-i tevhîdin üstünlükleri açıklanmaktadır."
  },

  // ---- TASAVVUF ----
  {
    soru: ["fena beka nedir", "fena fillah", "beka billah"],
    kisim: 3, maddeNo: 30,
    cevapOzet: "Fenâ ve bekâ ile mahlûkların aslı ve hakîkatleri bildirilmektedir."
  },
  {
    soru: ["eshab i yemin", "eshab i simal", "sabikun kimdir"],
    kisim: 3, maddeNo: 31,
    cevapOzet: "Eshâb-ı yemîn, eshâb-ı şimâl ve sâbikûn açıklanmaktadır."
  },
  {
    soru: ["muminin kalbi", "kalbin kiymeti", "kalb kirmak"],
    kisim: 3, maddeNo: 32,
    cevapOzet: "Mü'minin kalbi kıymetlidir; hiç kimsenin kalbini kırmamalıdır."
  },
  {
    soru: ["ars nedir", "kursi nedir", "kalbin ustunlukleri"],
    kisim: 3, maddeNo: 33,
    cevapOzet: "Arş ve Kürsî ile kalbin üstünlükleri açıklanmaktadır."
  },
  {
    soru: ["alem i emr nedir", "bes cevher", "ruh kalb sir"],
    kisim: 3, maddeNo: 34,
    cevapOzet: "Âlem-i emrdeki beş cevher açıklanmaktadır."
  },
  {
    soru: ["fena fillah nedir", "fenaya kavusmak"],
    kisim: 3, maddeNo: 35,
    cevapOzet: "Fenâ-fillâh açıklanmaktadır."
  },
  {
    soru: ["tasavvuf yolu kac tane", "iki tasavvuf yolu", "naksibendi kadiri"],
    kisim: 3, maddeNo: 36,
    cevapOzet: "Allahü teâlâya kavuşturan tasavvuf yolu ikidir."
  },
  {
    soru: ["tasavvuf mutehassisi", "tesavvuf mektubu", "tasavvuf alimi"],
    kisim: 3, maddeNo: 37,
    cevapOzet: "Bir tasavvuf mütehassısının mektubu bildirilmektedir."
  },
  {
    soru: ["suluk dereceleri", "suluk nedir", "tasavvuf yolu dereceleri"],
    kisim: 3, maddeNo: 38,
    cevapOzet: "Tasavvuf yolu, sülûk dereceleri, fenâ ve bekâ açıklanmaktadır."
  },
  {
    soru: ["ihata nedir", "kurbiyet nedir", "maiyet sifati"],
    kisim: 3, maddeNo: 39,
    cevapOzet: "Allahü teâlânın ihâta, kurb ve maiyyet sıfatları açıklanmaktadır."
  },
  {
    soru: ["alem vehim mi", "vehm mertebesi", "alemi vehm"],
    kisim: 3, maddeNo: 40,
    cevapOzet: "Âlem, vehm mertebesinde yaratılmıştır."
  },
  {
    soru: ["tasavvuf ve seriat", "tasavvufda islamiyyete uymak"],
    kisim: 3, maddeNo: 50,
    cevapOzet: "Tasavvuf yolunun başında da sonunda da İslâmiyete uymak lâzımdır."
  },
  {
    soru: ["evliya kimdir", "evliya olmak", "nihayet nedir"],
    kisim: 3, maddeNo: 44,
    cevapOzet: "Nihâyet, âfâk ve enfüsün dışındadır; evliyânın kimlere denildiği açıklanmaktadır."
  },
  {
    soru: ["vahdet i vucud", "vucud i vehmi", "panteizm"],
    kisim: 3, maddeNo: 47,
    cevapOzet: "Vahdet-i vücûd bilgisi ve vücûd-i vehmî açıklanmaktadır."
  },
  {
    soru: ["kabenin kemalati", "namazin hakikati", "namazda allaha yakinlik"],
    kisim: 3, maddeNo: 46,
    cevapOzet: "Kâbe-i muazzamanın ve namazın kemâlâtı açıklanmaktadır."
  },
  {
    soru: ["namazda yakinlik", "namazin hakikati nedir", "secde yakinlik"],
    kisim: 3, maddeNo: 52,
    cevapOzet: "Namazda olanın Allahü teâlâya yakınlığı ve namazın hakîkati bildirilmektedir."
  },
  {
    soru: ["tasavvufda seriata uymak", "evliya seriata uyar"],
    kisim: 3, maddeNo: 50,
    cevapOzet: "Tasavvuf yolunun başında da sonunda da İslâmiyete uymak lâzımdır."
  },

  // ---- CENAZE / KABIR ----
  {
    soru: ["olume hazirlik", "olum hakki", "can cekmek"],
    kisim: 3, maddeNo: 55,
    cevapOzet: "Ölüm, ölüme hazırlanmak ve şifâ âyetleri bildirilmektedir."
  },
  {
    soru: ["kefen nedir", "kefenleme nasil yapilir", "oluye yapilacaklar"],
    kisim: 3, maddeNo: 56,
    cevapOzet: "Meyyite yapılacak dinî vazifeler ve kefen hükümleri açıklanmaktadır."
  },
  {
    soru: ["cenaze namazi nasil kilinir", "cenaze namazi hukmu"],
    kisim: 3, maddeNo: 57,
    cevapOzet: "Cenaze namazı farz-ı kifâyedir; kılınışı ve cenaze namazı kılınmayanlar bildirilmektedir."
  },
  {
    soru: ["cenaze tasima", "defin", "gomme", "mezar"],
    kisim: 3, maddeNo: 58,
    cevapOzet: "Cenaze taşımak ve defin hükümleri açıklanmaktadır."
  },
  {
    soru: ["kabir ziyareti", "mezar ziyareti", "kuran okumak olulere"],
    kisim: 3, maddeNo: 59,
    cevapOzet: "Kabir ziyareti ve ibadet sevabının ölülere hediye edilmesi bildirilmektedir."
  },
  {
    soru: ["kabir ziyaretinin faidesi", "mezar ziyareti faydalari"],
    kisim: 3, maddeNo: 60,
    cevapOzet: "Kabir ziyaretinin faydaları bildirilmektedir."
  },
  {
    soru: ["dunya sikintisi faydasi", "taun sevabi", "veba hastaligi"],
    kisim: 3, maddeNo: 67,
    cevapOzet: "Dünya sıkıntılarının faydası ve tâûnun sevabı bildirilmektedir."
  },
  {
    soru: ["iskat nedir", "iskat devir", "olu icin iskat"],
    kisim: 3, maddeNo: 63,
    cevapOzet: "Meyyit için ıskat ve devir yapmak ile defin izninin nasıl alınacağı bildirilmektedir."
  },
  {
    soru: ["miras hukuku", "feraiz nedir", "miras nasil paylasilir", "miras kimlere kalir"],
    kisim: 3, maddeNo: 64,
    cevapOzet: "Ferâiz bilgisi, mirası alacak kimseler ve vasî tayini açıklanmaktadır."
  },
  {
    soru: ["miras hesabi", "miras paylari", "miras bolumu"],
    kisim: 3, maddeNo: 65,
    cevapOzet: "Ferâiz hesapları ve mirasın bölünmesi bildirilmektedir."
  },
  {
    soru: ["kabir hayati", "taundan olmenin kiymeti", "berzah alemi"],
    kisim: 3, maddeNo: 66,
    cevapOzet: "Kabir hayatı ve tâûndan ölmenin kıymeti bildirilmektedir."
  },
  {
    soru: ["dunya sikintilari", "sikintinin faydasi", "belaya razi olmak"],
    kisim: 3, maddeNo: 67,
    cevapOzet: "Dünya sıkıntılarının faydası ve tâûnun sevabı bildirilmektedir."
  },
  {
    soru: ["kazaya razi olmak", "kaderden lezzet", "riza makami"],
    kisim: 3, maddeNo: 68,
    cevapOzet: "Kazâya râzı olmalı, hatta lezzet duymalıdır."
  },
  {
    soru: ["sevgiliden sikinti", "dert ceken asik", "bela tatliligi"],
    kisim: 3, maddeNo: 69,
    cevapOzet: "Sevgiliden gelen sıkıntılar, iyiliklerinden daha tatlıdır."
  },
  {
    soru: ["seadet i ebediyye son soz", "kitabin sonu", "son soz"],
    kisim: 3, maddeNo: 70,
    cevapOzet: "Se'âdet-i Ebediyye kitabının son sözü."
  },

  // ---- FEN / BILIM ----
  {
    soru: ["hucre nedir", "hayat nedir", "mikrop nedir"],
    kisim: 3, maddeNo: 54,
    cevapOzet: "Madde üzerinde yeni bilgiler: hücre, hayat, mikrop ve zehir açıklanmaktadır."
  },
  {
    soru: ["madde ilahiden nasibi", "alemin nasibi", "zat i ilahi"],
    kisim: 3, maddeNo: 53,
    cevapOzet: "Âlemin ve maddenin, Zât-ı ilâhîden nasibi yoktur."
  }
];
