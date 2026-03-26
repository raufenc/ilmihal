/*
 * Se'adet-i Ebediyye - Arama Optimizasyon Sozlugu
 *
 * Bu dosya iki veri yapisi icerir:
 * 1. aramaSynonyms: Modern Turkce arama terimleri -> kitaptaki yazim bicimleri
 * 2. soruMaddeMap: Sik sorulan sorular -> dogrudan madde eslestirmeleri
 *
 * NOT: normalizeSearch fonksiyonu zaten a→a, i→i, u→u, '→bosluk donusumu yapar.
 * Bu nedenle tum girisler normalize (kucuk harf, diakritiksiz) formda yazilmistir.
 */

// ============================================================================
// 1. SINONIM / ALTERNATIF YAZIM HARITASI
// ============================================================================
var aramaSynonyms = {

  // ---- NAMAZ / IBADET TERIMLERI ----
  "namaz": ["nemaz", "salat", "salah"],
  "namaz kilmak": ["nemaz kilmak", "nemaz kilinir"],
  "namaz vakitleri": ["nemaz vaktleri", "nemaz vakti"],
  "namaz nasil kilinir": ["nemaz nasil kilinir", "nemaz kilmak"],
  "abdest": ["abdest", "vudu", "vuzu", "wudu"],
  "abdest almak": ["abdest almak", "vudu almak"],
  "abdesti bozan": ["abdesti bozan", "abdest bozulur"],
  "gusul": ["gusl", "gusul", "gusl abdesti"],
  "gusul abdesti": ["gusl abdesti", "gusul abdesti"],
  "teyemmum": ["teyemmum"],
  "secde": ["secde", "sucud"],
  "secde i sahv": ["secde i sehv", "sehv secdesi"],
  "secde i tilavet": ["secde i tilavet", "tilavet secdesi"],
  "ruku": ["ruku"],
  "kible": ["kible", "istikbal i kible"],
  "ezan": ["ezan", "ezanin manasi"],
  "ikamet": ["ikamet"],
  "imam": ["imam"],
  "cemaat": ["cema at", "cemaat"],
  "cuma": ["cum a", "cuma"],
  "cuma namazi": ["cum a nemazi", "cuma nemazi"],
  "bayram namazi": ["bayram nemazi", "bayram nemazlari"],
  "teravih": ["teravih", "teravih nemazi"],
  "teravih namazi": ["teravih nemazi"],
  "vitir": ["vitr", "vitir", "vitr nemazi"],
  "vitir namazi": ["vitr nemazi"],
  "kunut": ["kunut", "kunut duasi"],
  "sabah namazi": ["sabah nemazi", "fecer"],
  "ogle namazi": ["ogle nemazi", "zuhr"],
  "ikindi namazi": ["ikindi nemazi", "asr"],
  "aksam namazi": ["aksam nemazi", "magrib"],
  "yatsi namazi": ["yatsi nemazi", "isa"],
  "kaza namazi": ["kaza nemazi", "kaza nemazlari"],
  "nafile namaz": ["nafile nemaz", "nafile"],
  "seferi namaz": ["seferi nemaz", "yolculukda nemaz"],
  "yolculukta namaz": ["yolculukda nemaz", "seferi"],
  "cenaze namazi": ["cenaze nemazi"],
  "sünnet": ["sunnet"],
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
  "tadili erkan": ["ta dil i erkan", "tadil i erkan"],
  "otuzuc farz": ["otuzuc farz", "33 farz"],
  "namazin farzlari": ["nemazin farzlari", "nemaz farzlari"],
  "namazin vacibleri": ["nemazin vacibleri", "nemaz vacibleri"],
  "namazi bozan": ["nemazi bozan", "nemaz bozan"],
  "namazin mekruhlari": ["nemazin mekruhlari"],

  // ---- TEMIZLIK / TAHARET ----
  "taharet": ["taharet"],
  "necaset": ["necaset", "necasetden taharet"],
  "istinca": ["istinca"],
  "istibra": ["istibra"],
  "mest": ["mest", "mesh"],
  "mest uzerine mesh": ["mest uzerine mesh"],
  "su": ["sular", "sular ve cesidleri"],
  "setr i avret": ["setr i avret", "avret yerleri"],
  "avret": ["avret", "setr i avret"],
  "ozur sahibi": ["ozr sahibi", "ozr"],

  // ---- IMAN / AKAID ----
  "iman": ["iman", "iyman"],
  "iman nedir": ["iman", "iman bilgileri"],
  "imanin sartlari": ["imanin sartlari", "iman sartlari"],
  "allah": ["allahu teala", "hak teala"],
  "allahu teala": ["allahu teala"],
  "peygamber": ["peygamber", "resul", "resulullah", "nebi"],
  "peygamberimiz": ["peygamberimiz", "resulullah", "muhammed aleyhisselam"],
  "resulullah": ["resulullah", "muhammed aleyhisselam"],
  "mucize": ["mu cize", "mucize"],
  "kuran": ["kur an", "kuran", "kur an i kerim"],
  "kurani kerim": ["kur an i kerim"],
  "tefsir": ["tefsir"],
  "hadis": ["hadis", "hadis i serif"],
  "hadisi serif": ["hadis i serif", "hadis i serifler"],
  "sunnet": ["sunnet", "sunnet i seniyye"],
  "sunneti seniyye": ["sunnet i seniyye"],
  "mezhep": ["mezheb", "mezhep"],
  "mezheb": ["mezheb"],
  "ehli sunnet": ["ehl i sunnet", "ehli sunnet"],
  "ehl i sunnet": ["ehl i sunnet"],
  "hanefi": ["hanefi", "hanifi", "hanefi mezhebi"],
  "safii": ["safi i", "safii"],
  "maliki": ["maliki"],
  "hanbeli": ["hanbeli"],
  "bidat": ["bid at", "bidat"],
  "bid at": ["bid at"],
  "sapik": ["sapik", "dalalet"],
  "dalalet": ["dalalet"],
  "kelime i sehadet": ["kelime i sehadet", "sehadet"],
  "musluman olmak": ["musliman olmak", "kelime i sehadet"],
  "kafir": ["kafir", "kuffar"],
  "musrik": ["musrik"],
  "sirk": ["sirk"],
  "gayba iman": ["gayba iman"],
  "ahiret": ["ahiret"],
  "cennet": ["cennet"],
  "cehennem": ["cehennem"],
  "kabir": ["kabr", "kabir"],
  "kabir azabi": ["kabr azabi", "kabir azabi"],
  "kabir hayati": ["kabr hayati"],
  "kabir ziyareti": ["kabr ziyareti"],
  "kiyamet": ["kiyamet"],
  "mahser": ["mahser"],
  "mizan": ["mizan"],
  "sirat": ["sirat"],
  "sefaat": ["sefa at", "sefaat"],
  "kaza": ["kaza"],
  "kader": ["kader"],
  "kaza ve kader": ["kaza ve kader"],
  "irade i cuzi": ["irade i cuz iyye", "irade i cuzi"],
  "levh i mahfuz": ["levh il mahfuz"],

  // ---- AHLAK / TASAVVUF ----
  "tovbe": ["tevbe", "tovbe"],
  "tevbe": ["tevbe"],
  "tevekkul": ["tevekkul"],
  "sabir": ["sabr", "sabir"],
  "sukur": ["sukr", "sukur"],
  "hamd": ["hamd"],
  "ihlas": ["ihlas"],
  "takva": ["takva"],
  "vera": ["vera "],
  "nefs": ["nefs", "nefis"],
  "kalp": ["kalb", "kalp"],
  "kalb": ["kalb"],
  "gunah": ["gunah"],
  "sevap": ["sevab", "sevap"],
  "kibir": ["kibr", "kibir"],
  "ucub": ["ucb", "ucub"],
  "riya": ["riya"],
  "giybet": ["giybet"],
  "hased": ["hased", "haset"],
  "israf": ["israf"],
  "tasavvuf": ["tesavvuf", "tasavvuf"],
  "tarikat": ["tarikat", "tarikkat"],
  "evliya": ["evliya", "veli"],
  "keramet": ["keramet"],
  "firaset": ["firaset"],
  "fena fillah": ["fena fillah"],
  "vahdet i vucud": ["vahdet i vucud"],
  "kelime i tevhid": ["kelime i tevhid"],

  // ---- FIKIH / HUKUK ----
  "zekat": ["zekat"],
  "nisap": ["nisab", "nisap"],
  "zekat nisabi": ["zekat nisabi"],
  "fitre": ["fitre", "sadaka i fitr", "fitra"],
  "sadaka i fitr": ["sadaka i fitr"],
  "osur": ["osr", "osur", "usur"],
  "hac": ["hacc", "hac"],
  "hacca gitmek": ["hacca gitmek"],
  "umre": ["umre"],
  "ihram": ["ihram"],
  "tavaf": ["tavaf"],
  "kurban": ["kurban", "kurban kesmek"],
  "adak": ["adak", "nezr"],
  "nezir": ["nezr"],
  "oruc": ["oruc", "savm", "sovm"],
  "ramazan": ["ramezan", "ramezan i serif"],
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
  "riba": ["riba", "faiz"],
  "ticaret": ["ticaret"],
  "alis veris": ["alis veris", "bey ve sira"],
  "bey ve sira": ["bey ve sira"],
  "selem": ["selem"],
  "odunc": ["odunc", "odunc vermek"],
  "kefalet": ["kefalet"],
  "havale": ["havale"],
  "vekalet": ["vekalet"],
  "sirket": ["sirket", "sirketler"],
  "kira": ["kira", "ucret"],
  "sigorta": ["sigorta", "sigortacilik"],
  "banka": ["banka", "bankalar"],
  "bono": ["bono", "bono kirdirmak"],
  "vakif": ["vakf", "vakif"],
  "ihtikar": ["ihtikar"],
  "emanet": ["emanet"],
  "yemin": ["yemin", "yemin keffareti"],
  "kefen": ["kefen"],
  "cenaze": ["cenaze"],
  "defin": ["defn", "defin"],
  "diyet": ["diyet"],
  "cinayet": ["cinayet", "cinayetler"],
  "tazir": ["ta zir", "tazir"],
  "ukubat": ["ukubat", "ceza"],
  "ikrah": ["ikrah"],

  // ---- KISILER / UNVANLAR ----
  "imam i azam": ["imam i a zam", "ebu hanife", "nu man"],
  "ebu hanife": ["ebu hanife", "imam i a zam"],
  "imam i safii": ["imam i safi i"],
  "imam i rabbani": ["imam i rabbani"],
  "abdulkadir geylani": ["abdulkadir geylani"],
  "ibni abidin": ["ibni abidin"],
  "sahabi": ["sahabi", "eshab", "ashab"],
  "eshab i kiram": ["eshab i kiram"],
  "ashab": ["ashab", "eshab"],
  "alim": ["alim", "ulema"],
  "ulema": ["ulema"],
  "veli": ["veli", "evliya"],
  "muceddid": ["muceddid"],
  "abdullah i dehlevi": ["abdullah i dehlevi"],
  "resulullahinsallallahu aleyhi ve sellem": ["resulullah"],
  "dort halife": ["dort halife"],

  // ---- MUBAREK GUNLER / GECELER ----
  "mubarek geceler": ["mubarek geceler"],
  "kadir gecesi": ["kadir gecesi"],
  "mirac gecesi": ["mi rac gecesi", "mirac"],
  "berat gecesi": ["berat gecesi"],
  "regaib gecesi": ["regaib gecesi"],
  "mevlid": ["mevlid", "mevlud"],
  "asure": ["asure", "muharrem"],

  // ---- SORU KALIPLARI ----
  "nasil kilinir": ["kilinir", "kilmak", "kilinis"],
  "nasil alinir": ["alinir", "almak"],
  "nedir": ["nedir"],
  "kimlere verilir": ["verilir", "kimlere"],
  "bozar mi": ["bozar", "bozulur"],
  "caiz mi": ["caiz", "ca iz"],
  "haram mi": ["haram"],
  "farz mi": ["farz", "fard"],
  "sartlari": ["sartlari", "sart"],
  "sartlari nelerdir": ["sartlari", "sartlar"],
  "ne zaman": ["ne zaman", "vakti"],
  "kac rekat": ["kac rek at", "rekat"],
  "rekat": ["rek at", "rekat"],
  "ne kadar": ["ne kadar", "miktar"],
  "kimlere farz": ["kimlere farz"],
  "gunah mi": ["gunah mi", "gunah midir"],
  "sevabi": ["sevabi", "sevab"],

  // ---- GENEL KAVRAMLAR ----
  "ibadet": ["ibadet"],
  "itaat": ["ita at", "itaat"],
  "isyan": ["isyan"],
  "fitne": ["fitne"],
  "cihad": ["cihad"],
  "emri bil maruf": ["emr i bil ma ruf"],
  "ilim": ["ilm", "ilim"],
  "fikh": ["fikh", "fikih"],
  "ictihad": ["ictihad"],
  "muctehid": ["muctehid"],
  "fetva": ["fetva"],
  "icma": ["icma"],
  "kiyas": ["kiyas"],

  // ---- BOZUK AKIMLAR ----
  "vehhabi": ["vehhabi", "vehhabiyyik"],
  "vehhabilik": ["vehhabilik"],
  "hurufiilik": ["hurufiilik"],
  "siiilik": ["si ilik"],

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
  "tesettur": ["tesettur", "setr i avret"],
  "sut kardeslk": ["sut kardeslik", "sut ile akraba"],
  "hidane": ["hidane"],
  "iddet": ["iddet"],
  "zihar": ["zihar"],
  "lian": ["li an"],

  // ---- OLUM / AHIRET ----
  "olum": ["olum", "olume hazirlanmak"],
  "sifa ayetleri": ["sifa ayetleri"],
  "cin": ["cin"],
  "ruh": ["ruh", "ruhlar"],
  "sihr": ["sihr", "buyu"],
  "buyu": ["buyu", "sihr"],
  "nazar": ["nazar"],

  // ---- YAZIM FARKLARI / YAYGIN YANLISLAR ----
  "nemaz": ["nemaz"],
  "cami": ["cami", "cami lere saygi"],
  "minare": ["minare"],
  "mihrab": ["mihrab"],
  "minber": ["minber"],
  "hutbe": ["hutbe"],
  "muezzin": ["muezzin"],
  "sala": ["sala"],
  "tekbir": ["tekbir"],
  "selam": ["selam", "selamlasmak"],
  "selamlasmak": ["selamlasmak"],
  "dua": ["dua", "dua etmek"],
  "zikir": ["zikr", "zikir"],
  "tesbih": ["tesbih"],
  "istigfar": ["istigfar"],
  "salavat": ["salavat"],
  "mubarek": ["mubarek"],

  // ---- EK FIKIH TERIMLERI ----
  "muhayyer": ["muhayyer", "muhayyerlik"],
  "batil": ["batil"],
  "fasid": ["fasid"],
  "sahih": ["sahih"],
  "sarraflik": ["sarraflik"],
  "istisna": ["istisna "],

  // ---- TOPLUMSAL ----
  "adalet": ["adalet"],
  "sosyalizm": ["sosyalizm"],
  "kapitalizm": ["kapitalizm"],
  "komunizm": ["komunizm"],
  "fen": ["fen", "fen bilgileri"],
  "atom": ["atom"],
  "madde": ["madde"],
  "hurre": ["hucre", "hucyre"],
  "mikrop": ["mikrop"],

  // ---- DIGER ARAMA VARYANTLARI ----
  "abdestsiz": ["abdestsiz"],
  "curup": ["cunub", "curup"],
  "cunub": ["cunub"],
  "hayiz": ["hayz", "hayiz"],
  "nifas": ["nifas"],
  "lohusa": ["lohusa", "nifas"],
  "gunahlar": ["gunahlar"],
  "buyuk gunah": ["buyuk gunah", "kebire"],
  "kebire": ["kebire", "buyuk gunah"],
  "taat": ["ta at", "taat"],
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
  "kadi": ["kadi"],
  "imam hatip": ["imam hatip"],
  "medrese": ["medrese"],
  "cuma hutbesi": ["cum a hutbesi", "hutbe"],
  "salli barik": ["salli barik"],
  "tahiyyat": ["tahiyyat", "ettehiyyatu"],
  "ettehiyyatu": ["ettehiyyatu", "tahiyyat"],
  "subhaneke": ["subhaneke"],
  "kunut duasi": ["kunut dua si"],
  "sena": ["sena"],
  "kiyam": ["kiyam"],
  "kuud": ["ku ud", "kuud", "oturmak"],
  "niyet": ["niyyet", "niyet"],
  "iftitah tekbiri": ["iftitah tekbiri", "tahrime"],
  "tahrime": ["tahrime"],
  "ruku": ["ruku "],
  "kade i ahire": ["ka de i ahire"],
  "fatiha okumak": ["fatiha okumak"],
  "zammi sure": ["zammi sure"],
  "salli": ["salli"],
  "barik": ["barik"],
  "rabbena": ["rabbena"],
  "farz namaz": ["farz nemaz"],
  "sunnet namaz": ["sunnet nemaz"],

  // ---- OSMANLI / TRANSLİTERASYON GENİŞLETME (SEARCH-02) ----
  "evliya": ["evliya", "veliyy", "veli"],
  "veli": ["veli", "evliya", "veliyy"],
  "alim": ["alim", "aalim", "ulema"],
  "ulema": ["ulema", "alimler"],
  "mezhep": ["mezheb", "mezhep", "mezhebat"],
  "hanefi": ["hanefi", "hanefiyye", "imami azam"],
  "safii": ["safii", "safiiyye", "imam safii"],
  "maliki": ["maliki", "malikiyye", "imam malik"],
  "hanbeli": ["hanbeli", "hanbeliyye", "imam ahmed"],
  "itikad": ["i tikad", "itikad", "itikat", "akaid"],
  "akaid": ["akaid", "akaaid", "itikad"],
  "kelam": ["kelam", "ilm-i kelam", "ilmi kelam"],
  "tasavvuf": ["tesavvuf", "tasavvuf", "tesavvuf"],
  "tarikat": ["tarikat", "tariqat", "tarikaat"],
  "naksi": ["naksi", "naksibendi", "naksibendiyye"],
  "naksibendi": ["naksibendi", "naksibendiyye", "naksi"],
  "silsile": ["silsile", "silsile-i aliyye"],
  "rabita": ["rabita", "rabitai serif"],
  "mursi": ["mursid", "mursi", "mursidi kamil"],
  "mursid": ["mursid", "mursi"],
  "murid": ["murid", "muriid"],
  "zikir": ["zikr", "zikir", "dhikr"],
  "tesbih": ["tesbih", "tesbih cekmek"],
  "istigfar": ["istigfar", "estagfirullah"],
  "tevbe": ["tevbe", "tewbe", "tobe"],
  "ihlas": ["ihlas", "ikhlas"],
  "iman etmek": ["iman etmek", "iyman"],
  "tagut": ["tagut", "taagut"],
  "sirk": ["sirk", "shirk"],
  "kufr": ["kufr", "kufur", "kufir"],
  "munafik": ["munafik", "nifak"],
  "fasik": ["fasik", "fisq"],
  "mubtedi": ["mubtedi", "bid atci"],
  "ehli sunnet": ["ehl-i sunnet", "ehli sunnet", "ehl i sunnet", "sunni"],
  "vehhabi": ["vehhabi", "vahhabi", "vehhabiyye"],
  "maturidi": ["maturidi", "maturidiyye"],
  "esari": ["es ari", "esari", "esariyye"],
  "icma": ["icma", "ijma", "icma-i ummet"],
  "kiyas": ["kiyas", "qiyas"],
  "nass": ["nass", "nas", "ayet ve hadis"],
  "fetva": ["fetva", "fetvaa", "fatwa"],
  "muftu": ["muftu", "mufti"],
  "kadi": ["kadi", "qadi", "hakim"],
  "muctehid": ["muctehid", "mujtahid"],
  "taklid": ["taklid", "taqlid"],
  "ihtilaf": ["ihtilaf", "ikhtilaaf"],
  "ictihad": ["ictihad", "ijtihaad"],
  "ruhsat": ["ruhsat", "rukhsa"],
  "azimet": ["azimet", "azime"],
  "cihad": ["cihad", "jihad", "cihat"],
  "sehid": ["sehid", "shahid", "sehit"],
  "gazi": ["gazi", "ghazi"],
  "daru l islam": ["dar ul islam", "darul islam"],
  "daru l harp": ["dar ul harp", "darul harp", "darul harb"],
  "fitne": ["fitne", "fitnah"],
  "nefs": ["nefs", "nafs", "nefis"],
  "ruh": ["ruh", "rooh"],
  "kalb": ["kalb", "kalp", "qalb"],
  "takva": ["takva", "taqwa", "taqva"],
  "vera": ["vera ", "wara"],
  "zuhd": ["zuhd", "zuhd"],
  "sabr": ["sabr", "sabir", "sabr etmek"],
  "sukr": ["sukr", "sukur", "suku"],
  "tevekkul": ["tevekkul", "tawakkul"],
  "riza": ["riza", "ridha"],
  "murakabe": ["murakabe", "muraqaba"],
  "muhasebeyi nefs": ["muhasebe-i nefs", "muhasebe"],
  "amelisalih": ["amel-i salih", "salih amel"],
  "kebire": ["kebire", "buyuk gunah"],
  "sagire": ["sagire", "kucuk gunah"],
  "mizan": ["mizan", "terazi"],
  "sirat": ["sirat", "sirat koprusu"],
  "cennet": ["cennet", "jannah"],
  "cehennem": ["cehennem", "jahannam"],
  "azab": ["azab", "azaab"],
  "kabir": ["kabir", "kabr", "mezar"],
  "berzah": ["berzah", "barzakh"],
  "kiyamet": ["kiyamet", "qiyama", "kiyamet gunu"],
  "mahser": ["mahser", "hashr"],
  "hesap gunu": ["hesap gunu", "yevm ul hisab"],
  "mehdi": ["mehdi", "mahdi"],
  "deccal": ["deccal", "dajjal"],
  "isa aleyhisselam": ["isa aleyhisselam", "hazreti isa", "hz isa"],
  "sefaat": ["sefa at", "sefaat", "shafaat"],
  "magfiret": ["magfiret", "mughfira"],
  "rahmet": ["rahmet", "rahmah"],
  "bereket": ["bereket", "baraka"],
  "keramet": ["keramet", "karama"],
  "vakif": ["vakif", "vaqf", "vakf"],
  "sadaka": ["sadaka", "sadaqah"],
  "fitre": ["fitre", "sadaka-i fitr", "fitr"],
  "usur": ["usur", "osr", "ushr"],
  "cizye": ["cizye", "jizyah"],
  "harac": ["harac", "kharaj"],
  "riba": ["riba", "ribaa", "faiz"],
  "faiz": ["faiz", "riba"],
  "mudaraba": ["mudaraba", "mudarebe"],
  "murabaha": ["murabaha", "murabehe"],
  "selem": ["selem", "salaam"]
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
    cevapOzet: "Muhammed aleyhisselama uymak, se adete kavusdurur."
  },
  {
    soru: ["allaha itaat", "resule itaat", "itaat nedir"],
    kisim: 1, maddeNo: 2,
    cevapOzet: "Allahu tealaya ita at icin, Resulune ita at lazimdir."
  },

  // ---- IMAN VE AKAID ----
  {
    soru: ["musluman nasil olunur", "musluman olmak", "kelime i sehadet", "sehadet getirmek", "islam a girmek"],
    kisim: 1, maddeNo: 3,
    cevapOzet: "Musliman olmak icin Kelime-i sehadet soylenir. Ma nasini bilmek ve kalb ile inanmak sarttir."
  },
  {
    soru: ["ehli sunnet nedir", "ehl i sunnet nedir", "ehl i sunnet kimdir", "ehli sunnet mezhebi"],
    kisim: 1, maddeNo: 4,
    cevapOzet: "Ehl-i sunnet, Peygamber Efendimiz sallallahu aleyhi ve sellem ve Eshab-i kiram yolunda olan muslumanlarin i tikad mezhebidir."
  },
  {
    soru: ["imam i azam kimdir", "ebu hanife kimdir", "hanefi mezhebi kurucusu"],
    kisim: 1, maddeNo: 5,
    cevapOzet: "Ehl-i sunnetin reisi, Imam-i a zam Ebu Hanife Nu man bin Sabit hazretleridir."
  },
  {
    soru: ["imam i azam buyuklugu", "ebu hanife buyuklugu"],
    kisim: 1, maddeNo: 6,
    cevapOzet: "Imam-i a zam Ebu Hanife hazretlerinin buyuklugu, Durr-ul-muhtar da ve diger muteber kitablarda anlatilmaktadir."
  },
  {
    soru: ["islam alimleri", "islam alimleri kitaplari"],
    kisim: 1, maddeNo: 7,
    cevapOzet: "Islam alimlerinin kitablari, Ehl-i sunnet i tikadini ve fikhini dogru olarak bildirmektedir."
  },
  {
    soru: ["kuran tefsiri", "tefsir nedir", "uydurma tefsir"],
    kisim: 1, maddeNo: 8,
    cevapOzet: "Kur an-i kerimi kendi gorusune gore tefsir etmek buyuk gunahtir. Uydurma tefsir yazan kafir olur."
  },
  {
    soru: ["kuran tercumesi", "kuran meali", "hangi meal guvenilir"],
    kisim: 1, maddeNo: 9,
    cevapOzet: "Kur an-i kerim tercemelerine dikkat edilmelidir. Her tercemeye guvenilmez."
  },
  {
    soru: ["din hirsizlari", "sahte hoca", "yanlis din anlatan"],
    kisim: 1, maddeNo: 10,
    cevapOzet: "Din hirsizlari, dini yanlis ogretip muslumanlari dogru yoldan saptiran kimselerdir."
  },
  {
    soru: ["iman nedir", "iman ne demek", "iman tanimi", "iman bilgileri"],
    kisim: 1, maddeNo: 11,
    cevapOzet: "Iman, Resulullah sallallahu aleyhi ve sellemin bildirdigi seylerin hepsine kalb ile inanmaktir."
  },
  {
    soru: ["imani bozan seyler", "iman nasil gider", "kufre dusurmek", "kufur sozleri"],
    kisim: 1, maddeNo: 11,
    cevapOzet: "Imanin gitmesine sebeb olan seyler bildirilmektedir. Kufr sebebi olan soz ve islerden sakinmak lazimdir."
  },
  {
    soru: ["imanin alameti nedir", "iman nasil belli olur"],
    kisim: 1, maddeNo: 12,
    cevapOzet: "Kalbde iman bulunmasina alamet, ahkam-i islamiyyeye uymaktir."
  },
  {
    soru: ["allahin nimetleri", "nimet nedir", "allahun nimetleri"],
    kisim: 1, maddeNo: 13,
    cevapOzet: "Allahu tealanin ni metleri dunyada herkesedir; ahiretdeki ni metler ise yalniz muminleredir."
  },
  {
    soru: ["kafir ahirette", "kafirin akibeti", "kafir merhamet"],
    kisim: 1, maddeNo: 14,
    cevapOzet: "Ahiretde kafir olarak olenlere merhamet yoktur."
  },
  {
    soru: ["muhabbet nedir", "allah sevgisi alameti", "sevginin alameti"],
    kisim: 1, maddeNo: 15,
    cevapOzet: "Muhabbetin alametleri bildirilmektedir. Sevginin alameti, sevgilinin isteklerine uymaktir."
  },
  {
    soru: ["peygamber efendimiz", "hz muhammed", "peygamberimizin hayati"],
    kisim: 1, maddeNo: 16,
    cevapOzet: "Muhammed aleyhisselam, Allahu tealanin sevgilisidir."
  },
  {
    soru: ["mucize nedir", "peygamberimizin mucizeleri"],
    kisim: 1, maddeNo: 17,
    cevapOzet: "Peygamber Efendimiz sallallahu aleyhi ve sellemin mucizeleri bildirilmektedir. Kur an-i kerimin ustunlugu aciklanmaktadir."
  },
  {
    soru: ["resule tabi olmak", "evlad terbiyesi", "cocuk terbiyesi", "cocuga din ogretmek"],
    kisim: 1, maddeNo: 18,
    cevapOzet: "Resule tabi olmak nasil olur ve evlad terbiyesi aciklanmaktadir."
  },
  {
    soru: ["hubbi fillah", "bugdi fillah", "allah icin sevmek", "allah icin buzmek"],
    kisim: 1, maddeNo: 19,
    cevapOzet: "Hubb-i fillah ve bugd-i fillah, Allah icin sevmek ve buzmek aciklanmaktadir."
  },
  {
    soru: ["kazaya riza", "kadere razi olmak", "allahtan gelen bela"],
    kisim: 1, maddeNo: 20,
    cevapOzet: "Kazaya riza nasil olur, aciklanmaktadir."
  },
  {
    soru: ["cennet nedir", "cennete girmek", "cennete nasil girilir"],
    kisim: 1, maddeNo: 21,
    cevapOzet: "Cennete girmek icin Muhammed aleyhisselama uymak lazimdir."
  },
  {
    soru: ["kafirlerin iyiligi", "kafir iyilik", "kafirin sevabi"],
    kisim: 1, maddeNo: 22,
    cevapOzet: "Kafirlerin iyiligi dunyada kalir, ahiretde faidesi olmaz."
  },
  {
    soru: ["dunya ahiretin tarlasi", "dunya nedir", "dunya ahiret"],
    kisim: 1, maddeNo: 23,
    cevapOzet: "Dunya, ahiretin tarlasidir. Burada ekilen ahiretde birilir."
  },
  {
    soru: ["ahiret bilgileri", "ahirete iman", "gayba iman"],
    kisim: 1, maddeNo: 24,
    cevapOzet: "Ahiret bilgileri aklin disindadir; bunlara akl ermez, iman ile kabul edilir."
  },
  {
    soru: ["kuran i kerim nedir", "kuran allah kelami mi"],
    kisim: 1, maddeNo: 91,
    cevapOzet: "Kur an-i kerim, Allah kelamidir. Mahluk degildir."
  },
  {
    soru: ["allah nedir", "allah nasil anlasilir", "allahu teala"],
    kisim: 1, maddeNo: 93,
    cevapOzet: "Allahu teala akl ile, hayal ile anlasilamaz. Gayba iman etmek lazimdir."
  },
  {
    soru: ["ictihad hatalari", "imam i azam ictihad", "muctehid hatasi"],
    kisim: 1, maddeNo: 26,
    cevapOzet: "Ictihad hatalari ve Imam-i A zamin buyuklugu bildirilmektedir."
  },
  {
    soru: ["kafirlerin esyasi", "gayrimuslim esyasi kullanmak"],
    kisim: 1, maddeNo: 29,
    cevapOzet: "Kafirlerin kullandigi seyler iki turludur: adetlere ait olanlar ve dine ait olanlar."
  },
  {
    soru: ["resulullaha uymak dereceleri", "sunnete uymak dereceleri"],
    kisim: 1, maddeNo: 30,
    cevapOzet: "Resulullaha uymak yedi derecedir."
  },
  {
    soru: ["ehl i sunnet itikadi", "itikad nedir", "haramlar nelerdir"],
    kisim: 1, maddeNo: 31,
    cevapOzet: "Ehl-i sunnet i tikadi ve haramlar aciklanmaktadir."
  },
  {
    soru: ["yetmisuc firka", "73 firka", "firkai naciye", "hangi mezhep kurtulur"],
    kisim: 1, maddeNo: 32,
    cevapOzet: "Bu ummet yetmisuc firkaya ayrilacakdir. Kurtulacak olan Ehl-i sunnet vel-cema atdir."
  },
  {
    soru: ["allahin yakin olmasi", "kurbiyet nedir", "allaha yakinlik"],
    kisim: 1, maddeNo: 33,
    cevapOzet: "Allahu tealanin yakin olmasi ne demekdir, aciklanmaktadir."
  },
  {
    soru: ["fen bilgileri ve din", "fen ve iman", "yaratici var mi"],
    kisim: 1, maddeNo: 36,
    cevapOzet: "Fen bilgileri, bir yaraticinin varligini gostermektedir."
  },
  {
    soru: ["felsefecilere gore tefsir", "felsefi tefsir caiz mi"],
    kisim: 1, maddeNo: 37,
    cevapOzet: "Kur an-i kerimi felsefecilere gore tefsir etmek caiz degildir."
  },
  {
    soru: ["tenasuh nedir", "reenkarnasyon", "ruh gocu var mi"],
    kisim: 1, maddeNo: 39,
    cevapOzet: "Tenasuh (ruh gocu) yoktur. Alem-i misal ve fen bilgileri aciklanmaktadir."
  },

  // ---- SUNNET VE BID AT ----
  {
    soru: ["sunnet nedir", "sunnet i muekked", "sunnet i zevaid"],
    kisim: 1, maddeNo: 28,
    cevapOzet: "Sunnet-i muekked ve sunnet-i zevaid aciklanmaktadir."
  },
  {
    soru: ["sunnete yapismmak", "sunnet onem", "bid atten sakinmak"],
    kisim: 1, maddeNo: 34,
    cevapOzet: "Sunnete yapismmak ve bid atlerden sakinmak lazimdir."
  },
  {
    soru: ["bidat nedir", "bid at nedir", "bid at ne demek"],
    kisim: 1, maddeNo: 34,
    cevapOzet: "Bid at, Resulullah sallallahu aleyhi ve sellem zemaindan sonra ortaya cikan, dinde olmayan seylerdir."
  },
  {
    soru: ["sunnete yapismmak 2", "bid at tehlikesi", "sunneti terk"],
    kisim: 1, maddeNo: 35,
    cevapOzet: "Sunnete yapismmak ve bid atlerden sakinmak lazimdir. Bid at tehlikesi bildirilmektedir."
  },
  {
    soru: ["sunneti ihya", "unutulmus sunnet", "sunneti canlandirmak"],
    kisim: 1, maddeNo: 38,
    cevapOzet: "Sunnete yapismmak ve bid atlerden sakinmak lazimdir."
  },
  {
    soru: ["ictihad nedir", "muctehid kimdir", "ictihad ne demek"],
    kisim: 1, maddeNo: 27,
    cevapOzet: "Ictihad, ahkam-i ser iyyeyi delillerden cikarmaktir. Muctehid, bunu yapabilecek ilme sahip alimdir."
  },
  {
    soru: ["farz sunnet nafile farki", "farz sunnet onemi"],
    kisim: 1, maddeNo: 44,
    cevapOzet: "Farz, sunnet ve nafilelerin ehemmiyyetleri ve farklari bildirilmektedir."
  },
  {
    soru: ["iman ibadet nasihat", "iman ve ibadet", "luuzumlu nasihatler"],
    kisim: 1, maddeNo: 46,
    cevapOzet: "Iman, ibadetler ve luzumlu nasihatler bildirilmektedir."
  },
  {
    soru: ["haramlar nelerdir", "iman ve haram", "buyuk gunahlar"],
    kisim: 1, maddeNo: 47,
    cevapOzet: "Iman, ibadetler ve haramlar bildirilmektedir."
  },
  {
    soru: ["alem nasil yaratildi", "yoktan yaratma", "yunan filozoflari"],
    kisim: 1, maddeNo: 49,
    cevapOzet: "Alemler ve hersey yoktan var edildi. Yunan felsefecilerinin hatalari bildirilmektedir."
  },

  // ---- NAMAZ ----
  {
    soru: ["abdest nasil alinir", "abdest almak", "abdesti bozan seyler"],
    kisim: 1, maddeNo: 51,
    cevapOzet: "Abdest almak ve abdesti bozan seyler bildirilmektedir."
  },
  {
    soru: ["otuzuc farz", "33 farz", "bes vakit namaz farzlari"],
    kisim: 1, maddeNo: 42,
    cevapOzet: "Bes vakt nemaz ve otuzuc farz bildirilmektedir."
  },
  {
    soru: ["namazin farzlari", "namaz farzlari", "namazin sartlari"],
    kisim: 1, maddeNo: 52,
    cevapOzet: "Nemazin farzlari, sartlari ve rukunleri bildirilmektedir."
  },
  {
    soru: ["mest uzerine mesh", "meshe mesh", "ozur sahibi"],
    kisim: 1, maddeNo: 53,
    cevapOzet: "Mest uzerine mesh ve ozr sahibi olmanin hukumleri bildirilmektedir."
  },
  {
    soru: ["gusul nasil alinir", "gusul abdesti nasil alinir", "boy abdesti"],
    kisim: 1, maddeNo: 54,
    cevapOzet: "Gusl abdesti, butun bedeni yikamaktir. Agza ve burna su vermek farzdir."
  },
  {
    soru: ["teyemmum nasil yapilir", "teyemmum nasil alinir", "teyemmum nedir"],
    kisim: 1, maddeNo: 55,
    cevapOzet: "Teyemmum, su bulunamadigi veya kullanilamadigi zaman toprak ile yapilan temizliktir."
  },
  {
    soru: ["necaset nedir", "necaset temizligi", "istinca nedir", "istibra nedir"],
    kisim: 1, maddeNo: 56,
    cevapOzet: "Necasetden taharet, istinca ve istibra hukumleri bildirilmektedir."
  },
  {
    soru: ["sular nedir", "su cesitleri", "temiz su"],
    kisim: 1, maddeNo: 57,
    cevapOzet: "Sular ve cesidleri aciklanmaktadir: mutlak su, mukayyed su, musta mel su."
  },
  {
    soru: ["avret yerleri", "setr i avret", "avret nedir"],
    kisim: 1, maddeNo: 58,
    cevapOzet: "Setr-i avret, namazda ve namaz disinda ortulmesi gereken yerleri bildirmektedir."
  },
  {
    soru: ["kible neresi", "kible nasil bulunur", "kible tayini"],
    kisim: 1, maddeNo: 59,
    cevapOzet: "Istikbal-i kible, namaz icin Kabe-i muazzamaya donmek demektir. Kible ta yini anlatilmaktadir."
  },
  {
    soru: ["namaz vakitleri", "bes vakit namaz saatleri", "namaz vakti ne zaman"],
    kisim: 1, maddeNo: 60,
    cevapOzet: "Nemaz vaktleri ve takvimler aciklanmaktadir."
  },
  {
    soru: ["ezan nedir", "ezan nasil okunur", "ezan kelimeleri"],
    kisim: 1, maddeNo: 61,
    cevapOzet: "Ezan ve ikamet bildirilmektedir."
  },
  {
    soru: ["ezan anlami", "ezan manasi", "ezan kelimelerinin manasi"],
    kisim: 1, maddeNo: 62,
    cevapOzet: "Ezan kelimelerinin ma nalari aciklanmaktadir."
  },
  {
    soru: ["namaz kilmamak gunah mi", "namaz kilmayanin cezasi", "namaz onemi"],
    kisim: 1, maddeNo: 63,
    cevapOzet: "Nemazin ehemmiyyeti buyuktur. Nemaz kilmiyanlarin hali bildirilmektedir."
  },
  {
    soru: ["namaz nasil kilinir", "namaz kilinis", "namaz rukunleri", "namazin bes ruknu"],
    kisim: 1, maddeNo: 64,
    cevapOzet: "Nemaz nasil kilinir, nemazin bes ruknu ve niyyet aciklanmaktadir."
  },
  {
    soru: ["yolculukta namaz", "seferi namaz", "yolcu namazi", "misafir namazi"],
    kisim: 1, maddeNo: 65,
    cevapOzet: "Yolculukda nemaz kisaltilir. Seferi olan dort rek atlik farzlari iki rek at kilar."
  },
  {
    soru: ["secde i sahv", "sehiv secdesi", "namazin vacibleri", "vitir namazi"],
    kisim: 1, maddeNo: 66,
    cevapOzet: "Nemazin vacibleri, secde-i sehv, secde-i tilavet ve vitr nemazi aciklanmaktadir."
  },
  {
    soru: ["namazi bozan seyler", "namaz bozulur mu", "namazi ne bozar"],
    kisim: 1, maddeNo: 67,
    cevapOzet: "Nemazi bozan seyler ve kafirlere tesebbuh hukumleri bildirilmektedir."
  },
  {
    soru: ["namazin mekruhlari", "namazda mekruh", "namazi bozmak icin ozur"],
    kisim: 1, maddeNo: 68,
    cevapOzet: "Nemazin mekruhlari ve nemazi bozmak icin ozr sayilan haller bildirilmektedir."
  },
  {
    soru: ["teravih namazi nasil kilinir", "teravih namazi", "camide adab"],
    kisim: 1, maddeNo: 69,
    cevapOzet: "Teravih nemazi ve cami lere saygi hukumleri aciklanmaktadir."
  },
  {
    soru: ["cemaatle namaz", "cemaat ile namaz", "hoparlorle namaz", "radyo ile namaz"],
    kisim: 1, maddeNo: 70,
    cevapOzet: "Cema at ile nemaz kilmanin hukumleri bildirilmektedir."
  },
  {
    soru: ["cuma namazi nasil kilinir", "cuma namazi", "cuma farzi"],
    kisim: 1, maddeNo: 71,
    cevapOzet: "Cum a nemazi, erkeklere farzdir ve hutbe okunur."
  },
  {
    soru: ["bayram namazi nasil kilinir", "bayram namazi", "bayram namazlari"],
    kisim: 1, maddeNo: 72,
    cevapOzet: "Bayram nemazi vacibdir. Kilinis sekli anlatilmaktadir."
  },
  {
    soru: ["namazda parmak kaldirmak", "tesehhudde parmak", "otururken parmak"],
    kisim: 1, maddeNo: 73,
    cevapOzet: "Namazda otururken parmak kaldirmanin hukmu bildirilmektedir."
  },
  {
    soru: ["kaza namazi", "kaza namazi nasil kilinir", "namaz borcu", "kaza namazlari"],
    kisim: 1, maddeNo: 74,
    cevapOzet: "Kaza nemazi kilinmasi lazimdir. Nemaz kilmiyanin cezasi bildirilmektedir."
  },
  {
    soru: ["namaz ibadetlerin en ustunu mu", "namaz ustunlugu"],
    kisim: 1, maddeNo: 75,
    cevapOzet: "Nemaz ibadetin en ustunudur."
  },
  {
    soru: ["tadili erkan nedir", "kul hakki"],
    kisim: 1, maddeNo: 76,
    cevapOzet: "Nemazin ta dil-i erkani onemlidir. Kul hakki bildirilmektedir."
  },
  {
    soru: ["helal lokma", "sehid kime denir", "sehidlik nedir"],
    kisim: 1, maddeNo: 77,
    cevapOzet: "Nemazi dogru kilmali, helal lokma yimeli. Sehid kime denir, aciklanmaktadir."
  },

  // ---- ORUC ----
  {
    soru: ["ramazan orucu", "oruc nasil tutulur", "ramazanin kiymetii"],
    kisim: 1, maddeNo: 79,
    cevapOzet: "Ramezan-i serifin kiymeti buyuktur. Oruc nasil tutulur, aciklanmaktadir."
  },
  {
    soru: ["orucu bozan seyler", "oruc bozulur mu", "orucu ne bozar", "ramazan orucu hukmu"],
    kisim: 1, maddeNo: 79,
    cevapOzet: "Ramezan orucu hukumleri ve orucu bozan seyler bildirilmektedir."
  },

  // ---- ZEKAT ----
  {
    soru: ["zekat nedir", "zekat vermek", "zekat hukumleri", "zekat farz mi"],
    kisim: 1, maddeNo: 78,
    cevapOzet: "Zekat vermek farzdir. Zekat nisabi ve hukumleri aciklanmaktadir."
  },
  {
    soru: ["zekat nisabi", "zekat nisabi ne kadar", "zekat miktari"],
    kisim: 1, maddeNo: 78,
    cevapOzet: "Zekat nisabi, altin icin 20 miskal (96 gr), gumus icin 200 dirhem (672 gr) dir."
  },
  {
    soru: ["zekat kimlere verilir", "zekat kimlere farz", "zekat verilecek kimseler"],
    kisim: 1, maddeNo: 78,
    cevapOzet: "Zekat, Kur an-i kerimde bildirilen sekiz sinif insana verilir."
  },
  {
    soru: ["fitre nedir", "sadaka i fitr", "fitre ne kadar", "fitre kimlere verilir"],
    kisim: 1, maddeNo: 80,
    cevapOzet: "Sadaka-i fitr, Ramezan bayraminda verilmesi vacib olan sadakadir."
  },

  // ---- HAC ----
  {
    soru: ["hac nasil yapilir", "hac farzi", "hacca gitmek", "hac ibadetleri"],
    kisim: 1, maddeNo: 84,
    cevapOzet: "Hac ibadeti, imkani olan muslumana omrunde bir kere farzdir."
  },

  // ---- KURBAN / ADAK / YEMIN ----
  {
    soru: ["kurban kesmek", "kurban nedir", "kurban vacip mi", "kurban nasil kesilir"],
    kisim: 1, maddeNo: 81,
    cevapOzet: "Kurban kesmek, zengin olan muslumanlara vacibdir."
  },
  {
    soru: ["adak nedir", "adak nasil yapilir", "nezir nedir"],
    kisim: 1, maddeNo: 82,
    cevapOzet: "Adak (nezr), Allahu tealaya soz vermektir. Adagi yerine getirmek vacibdir."
  },
  {
    soru: ["yemin nedir", "yemin keffareti", "yemin bozmak"],
    kisim: 1, maddeNo: 83,
    cevapOzet: "Yemin hukumleri ve yemin keffareti bildirilmektedir."
  },

  // ---- MUBAREK GECELER / TAKVIM ----
  {
    soru: ["mubarek geceler", "kandil geceleri", "kadir gecesi", "mirac gecesi"],
    kisim: 1, maddeNo: 85,
    cevapOzet: "Mubarek geceler ve bu gecelerde yapilacak ibadetler bildirilmektedir."
  },
  {
    soru: ["hicri takvim", "kameri sene", "hicri yil cevirme"],
    kisim: 1, maddeNo: 87,
    cevapOzet: "Kameri seneyi miladi seneye cevirmek icin formul bildirilmektedir."
  },

  // ---- SELAMLASMA ----
  {
    soru: ["selam vermek", "selamlasmak", "selam nasil verilir"],
    kisim: 1, maddeNo: 90,
    cevapOzet: "Selamlasmak sunnetdir. Selam vermenin ve almanin adabi bildirilmektedir."
  },

  // ---- KUR AN ----
  {
    soru: ["kuran nedir", "kuran i kerim", "kuran tercemeleri"],
    kisim: 1, maddeNo: 25,
    cevapOzet: "Kur an-i kerim nedir ve Kur an tercemeleri hakkinda bilgi verilmektedir."
  },
  {
    soru: ["kuran mahluk mu", "kuran allah kelami", "kuran yaratilmis mi"],
    kisim: 1, maddeNo: 92,
    cevapOzet: "Kur an-i kerim, Allah kelamidir. Mahluk degildir."
  },
  {
    soru: ["gayba iman nedir", "gayb nedir", "allahin sifatlari"],
    kisim: 1, maddeNo: 94,
    cevapOzet: "Allahu teala akl ile anlasilamaz. Gayba iman etmek lazimdir."
  },

  // ---- PEYGAMBER EFENDIMIZ ----
  {
    soru: ["hilye i saadet", "siyer kitaplari", "resulullahinsallallahu aleyhi ve sellem zevceleri"],
    kisim: 1, maddeNo: 95,
    cevapOzet: "Hilye-i se adet, siyer kitablari ve Resulullahinsallallahu aleyhi ve sellem zevcelerinden bahsedilmektedir."
  },
  {
    soru: ["peygamberimizin ahlaki", "hz muhammed ahlaki"],
    kisim: 1, maddeNo: 96,
    cevapOzet: "Muhammed aleyhisselamin yuce ahlaki anlatilmaktadir."
  },
  {
    soru: ["unutulmus sunnetler", "sunneti ihya etmek", "sunnetleri canlandirmak"],
    kisim: 1, maddeNo: 98,
    cevapOzet: "Unutulmus sunnetleri meydana cikarmak ve bid atden sakinmak tesvjk edilmektedir."
  },

  // ---- TEVBE, AHLAK ----
  {
    soru: ["tevbe nedir", "tovbe nasil yapilir", "tevbe ve vera"],
    kisim: 1, maddeNo: 43,
    cevapOzet: "Tevbe, vera ve takva aciklanmaktadir."
  },
  {
    soru: ["emri bil maruf", "iyiligi emretmek", "cihad sevabi"],
    kisim: 1, maddeNo: 41,
    cevapOzet: "Emr-i bil-ma ruf, nehy-i anil-munker ve cihad sevabi coktur."
  },
  {
    soru: ["tesettur farz mi", "kadinlarin ortunmesi", "islamda tesettur"],
    kisim: 1, maddeNo: 58,
    cevapOzet: "Setr-i avret, nemazda ve nemaz disinda ortunmesi gereken yerleri bildirmektedir. Kadinlarin ortunmesi farzdir."
  },
  {
    soru: ["tasavvuf nedir", "tasavvuf yolu"],
    kisim: 1, maddeNo: 50,
    cevapOzet: "Tesavvuf yolunda calismak isteyenin yapmasi lazim olan seyler bildirilmektedir."
  },
  {
    soru: ["alemi ervan", "alemi misal", "alemi ecsad"],
    kisim: 1, maddeNo: 40,
    cevapOzet: "Alem-i ervah, alem-i misal ve alem-i ecsad aciklanmaktadir. Kabr azabi bildirilmektedir."
  },
  {
    soru: ["genclikte ibadet", "genc ibadet", "genclik ibadeti"],
    kisim: 1, maddeNo: 48,
    cevapOzet: "Genclikde yapilan ibadetlerin kiymeti buyuktur."
  },
  {
    soru: ["allahin yakinligi", "kurbiyet ilahi", "yakin olmak allah"],
    kisim: 1, maddeNo: 45,
    cevapOzet: "Allahu tealanin yakin olmasi ne demektir, aciklanmaktadir."
  },

  // ============================================================
  // IKINCI KISIM — AHLAK, AILE, SOSYAL HAYAT, ITIKAD
  // ============================================================
  {
    soru: ["hilye i saadet 2", "peygamberimizin disgorunu", "resulullahinsallallahu aleyhi ve sellem sifatlari"],
    kisim: 2, maddeNo: 1,
    cevapOzet: "Hilye-i se adet, siyer kitablari ve Resulullahinsallallahu aleyhi ve sellem zevceleri hakkinda bilgi verilmektedir."
  },
  {
    soru: ["dua nedir", "dua nasil edilir", "dua etmenin adabi"],
    kisim: 2, maddeNo: 2,
    cevapOzet: "Dua etmekdeki gizli bilgiler aciklanmaktadir."
  },
  {
    soru: ["resulullaha uymak", "hocasini sevmek", "din alimine hurmet"],
    kisim: 2, maddeNo: 3,
    cevapOzet: "Resulullaha uymaga ve dinini ogrendigi kimseyi sevmege tesvjk edilmektedir."
  },
  {
    soru: ["adalet nedir", "akil nedir", "iman ve akil"],
    kisim: 2, maddeNo: 4,
    cevapOzet: "Adalet, akl, iman, kaza ve kader meseleleri aciklanmaktadir."
  },
  {
    soru: ["peygamberimizin guzel ahlaki", "resulullahinsallallahu aleyhi ve sellem ahlaki"],
    kisim: 2, maddeNo: 5,
    cevapOzet: "Muhammed aleyhisselamin guzel ahlaki anlatilmaktadir."
  },
  {
    soru: ["hadis nedir", "hadis cesitleri", "hadis alimleri"],
    kisim: 2, maddeNo: 6,
    cevapOzet: "Hadis-i seriflerin cesidleri ve hadis alimleri bildirilmektedir."
  },
  {
    soru: ["dert bela allahtan", "musibete sabir", "bela allahtan gelir"],
    kisim: 2, maddeNo: 7,
    cevapOzet: "Derd ve belanin Allahu tealadan geldigini dusunmelidir."
  },
  {
    soru: ["belaya sabretmek", "bela sabir", "musibet karsi sabir"],
    kisim: 2, maddeNo: 8,
    cevapOzet: "Derd ve belanin Allahu tealadan geldigini dusunmeli ve sabretmelidir."
  },
  {
    soru: ["sabir nedir", "belaya sabir", "derde sabr"],
    kisim: 2, maddeNo: 9,
    cevapOzet: "Insanlardan gelen sikintilara sabretmek lazimdir."
  },
  {
    soru: ["uzuntuyu nimet bilmek", "sikinti nimet mi", "bela nimet"],
    kisim: 2, maddeNo: 10,
    cevapOzet: "Uzuntu ve sikintilari ni met bilmelidir."
  },
  {
    soru: ["zahir ameller", "kalb dagilmasi", "dis islerin bozuklugu"],
    kisim: 2, maddeNo: 11,
    cevapOzet: "Zahir islerin bozuk olmasi, kalbin dagilmasina yol acar."
  },
  {
    soru: ["bela gunaha keffaret", "dert keffaret", "hastalik gunah siler mi"],
    kisim: 2, maddeNo: 12,
    cevapOzet: "Derd ve belalar, gunahlara kaffaretdir."
  },
  {
    soru: ["allahin arzusuna uymak", "teslim olmak", "irade i rabbani"],
    kisim: 2, maddeNo: 13,
    cevapOzet: "Kendi dileklerimizi birakip sahibimizin arzusuna uymak lazimdir."
  },
  {
    soru: ["kibir nedir", "ucub nedir", "kibr ve ucb"],
    kisim: 2, maddeNo: 14,
    cevapOzet: "Kibr ve ucb, kalbin tehlukeli hastaliklaridir."
  },
  {
    soru: ["allahin isimleri", "esma ul husna", "yaratmak ne demek"],
    kisim: 2, maddeNo: 15,
    cevapOzet: "Allahu tealanin isimleri ve yaratmak ne demekdir, aciklanmaktadir."
  },
  {
    soru: ["fikih nedir", "mezhep nedir", "hanefi mezhebi"],
    kisim: 2, maddeNo: 16,
    cevapOzet: "Fikh, mezheb ve Imam-i A zam hakkinda bilgi verilmektedir."
  },
  {
    soru: ["vehhabilik nedir", "vehhabi kimdir", "vehhabi inanci"],
    kisim: 2, maddeNo: 17,
    cevapOzet: "Vehhabilik nedir, aciklanmaktadir."
  },
  {
    soru: ["sefaat nedir", "olulere yardim", "olulere dua"],
    kisim: 2, maddeNo: 18,
    cevapOzet: "Sefa at haktir. Olulere yardim meselesi aciklanmaktadir."
  },
  {
    soru: ["kabir azabi", "kabir azabi var mi", "kabir hayati"],
    kisim: 2, maddeNo: 19,
    cevapOzet: "Kabr azabi haktir. Inanmiyanlara cevab verilmektedir."
  },
  {
    soru: ["bela ve sabir", "dert ve sabir", "beladan ders almak"],
    kisim: 2, maddeNo: 20,
    cevapOzet: "Derd ve belanin Allahu tealadan geldigini dusunmelidir."
  },
  {
    soru: ["bozuk dinler", "baska dinler"],
    kisim: 2, maddeNo: 21,
    cevapOzet: "Bozuk dinler hakkinda bilgi verilmektedir."
  },
  {
    soru: ["hurufilik nedir", "hurufiilik"],
    kisim: 2, maddeNo: 22,
    cevapOzet: "Hurufilik hakkinda bilgi verilmektedir."
  },
  {
    soru: ["resulullahinsallallahu aleyhi ve sellem vefati", "kagid hadisesi", "eshabi kiram ihtilafi"],
    kisim: 2, maddeNo: 23,
    cevapOzet: "Resulullahinsallallahu aleyhi ve sellemin vefat ederken kagid istemesi ve Eshab-i kiramin durumu aciklanmaktadir."
  },
  {
    soru: ["eshab i kiram", "sahabe", "sahabi kimdir"],
    kisim: 2, maddeNo: 24,
    cevapOzet: "Eshab-i kiram birbirini cok severdi. Buyuklukleri bildirilmektedir."
  },
  {
    soru: ["eshab i kiram buyuklugu", "sahabe fazileti", "sahabelere dert gelmesi"],
    kisim: 2, maddeNo: 25,
    cevapOzet: "Eshab-i kiramin buyuklugu ve dostlara cok dert gelmesi bildirilmektedir."
  },
  {
    soru: ["sosyal adalet", "sosyalizm", "kapitalizm", "komunizm", "islam ekonomisi"],
    kisim: 2, maddeNo: 26,
    cevapOzet: "Sosyal adalet, sosyalizm, kapitalizm ve komunizm hakkinda Islam dinine gore degerlendirilmektedir."
  },
  {
    soru: ["islam dini nedir", "islam dini ozellikleri", "islamiyet nedir"],
    kisim: 2, maddeNo: 27,
    cevapOzet: "Islam dini hakkinda genel bilgiler verilmektedir."
  },
  {
    soru: ["nefs nedir", "akil nedir", "nefsi terbiye"],
    kisim: 2, maddeNo: 28,
    cevapOzet: "Nefs ve akl aciklanmaktadir."
  },
  {
    soru: ["muslumanlar neden geri kaldi", "islamin gerileme sebebi", "geri kalma"],
    kisim: 2, maddeNo: 29,
    cevapOzet: "Muslumanlar nicin geri kaldilar, sebebleri aciklanmaktadir."
  },
  {
    soru: ["islamiyet ve fen", "din fen catisir mi", "islam bilim"],
    kisim: 2, maddeNo: 30,
    cevapOzet: "Islamiyyet ve fen bilgileri catismaz; fen, dini destekler."
  },
  {
    soru: ["atom nedir", "madde nedir", "atom bilgileri"],
    kisim: 2, maddeNo: 31,
    cevapOzet: "Madde ve atom uzerinde yeni bilgiler verilmektedir."
  },
  {
    soru: ["radyoaktivite nedir", "radar nedir", "atom enerjisi"],
    kisim: 2, maddeNo: 32,
    cevapOzet: "Atom uzerinde yeni bilgiler, radyo-aktivite ve radar aciklanmaktadir."
  },

  // ---- AILE HUKUKU ----
  {
    soru: ["nikah nasil kiyilir", "evlenme", "islamda nikah", "nikah hukumleri"],
    kisim: 2, maddeNo: 34,
    cevapOzet: "Islamiyyetde nikah ve evlenmesi caiz olmayan kadinlar bildirilmektedir."
  },
  {
    soru: ["kafirlerin evlenmesi", "cocuga iman ogretmek", "cocuga islami ogretmek"],
    kisim: 2, maddeNo: 35,
    cevapOzet: "Kafirlerin evlenmesi ve cocuklara imani, islami ogretmek lazim oldugu bildirilmektedir."
  },
  {
    soru: ["bosanma", "talak nedir", "bosanma hukumleri", "uc talak"],
    kisim: 2, maddeNo: 36,
    cevapOzet: "Islamiyyetdeki talak, hul , zihar, li an, iddet ve hidane hukumleri aciklanmaktadir."
  },
  {
    soru: ["sut kardeslik", "sut anne", "sut emzirmek"],
    kisim: 2, maddeNo: 37,
    cevapOzet: "Sut kardeslik ve sut ile akraba olanlar bildirilmektedir."
  },
  {
    soru: ["nafaka nedir", "komsu hakki", "nafaka hukumleri"],
    kisim: 2, maddeNo: 38,
    cevapOzet: "Nafaka ve komsu hakki hukumleri aciklanmaktadir."
  },
  {
    soru: ["kadin hakki", "islamda kadin", "kadin haklari"],
    kisim: 2, maddeNo: 39,
    cevapOzet: "Islamiyyet ve kadin konusu ele alinmaktadir."
  },

  // ---- HELAL HARAM ----
  {
    soru: ["helal haram", "halal haram", "subheli seyler", "vera ve takva"],
    kisim: 2, maddeNo: 40,
    cevapOzet: "Halal, haram ve subheli seyler, vera ve takva aciklanmaktadir."
  },
  {
    soru: ["haram yiyecekler", "domuz eti", "haram giyecekler"],
    kisim: 2, maddeNo: 41,
    cevapOzet: "Yimesi ve kullanmasi haram olan seyler bildirilmektedir."
  },
  {
    soru: ["icki haram mi", "serab icmek", "alkol haram mi"],
    kisim: 2, maddeNo: 42,
    cevapOzet: "Serab (alkol) icmek haramdir."
  },
  {
    soru: ["sigara haram mi", "tutun gunah mi", "tutun icmek"],
    kisim: 2, maddeNo: 43,
    cevapOzet: "Tutun icmenin hukmu ele alinmaktadir."
  },
  {
    soru: ["faiz haram mi", "faiz nedir", "riba nedir", "faiz yasak mi", "israf nedir"],
    kisim: 2, maddeNo: 44,
    cevapOzet: "Israf ve faiz haramdir."
  },

  // ---- ADAB / GUNLUK HAYAT ----
  {
    soru: ["yemek adabi", "sofra adabi", "yemek icmek adabi"],
    kisim: 2, maddeNo: 45,
    cevapOzet: "Yimek, icmek adabi bildirilmektedir."
  },
  {
    soru: ["hasta yemekleri", "hastalik tedavisi", "saglik tavsiyeleri"],
    kisim: 2, maddeNo: 46,
    cevapOzet: "Hasta yemekleri ve bazi hastaliklarin tedavisi bildirilmektedir."
  },
  {
    soru: ["tevekkul nedir", "tevekkul ne demek", "allaha tevekkul"],
    kisim: 2, maddeNo: 47,
    cevapOzet: "Tevekkul, sebeplerine yapisilip neticeyi Allahu tealaya havale etmektir."
  },
  {
    soru: ["levh i mahfuz", "umm ul kitab", "insan omru degisir mi"],
    kisim: 2, maddeNo: 48,
    cevapOzet: "Levh-il-mahfuz ve Umm-ul-kitab aciklanmaktadir. Insan omrunun degismesi ele alinmaktadir."
  },

  // ---- KAZA KADER ----
  {
    soru: ["kaza kader nedir", "kaza ve kader", "kader inanci"],
    kisim: 2, maddeNo: 50,
    cevapOzet: "Kaza ve kader, Ehl-i sunnet itikadinin onemli meselelerindendir."
  },
  {
    soru: ["irade i cuziyye nedir", "irade i cuzi"],
    kisim: 2, maddeNo: 49,
    cevapOzet: "Irade-i cuz iyye, kulun bir ise yonelmesidir. Allahu teala, kulun iradesine gore yaratir."
  },
  {
    soru: ["hamd nedir", "sukur nedir", "hamd sukrden ustun mu"],
    kisim: 2, maddeNo: 51,
    cevapOzet: "Sevgilinin her isi sevilir. Hamd, sukrden ustundur."
  },

  // ---- MUZIK / CIN ----
  {
    soru: ["muzik haram mi", "teganni nedir", "sark soylmek", "calgi haram mi"],
    kisim: 2, maddeNo: 52,
    cevapOzet: "Teganni ve muzik hakkinda hukumler bildirilmektedir."
  },
  {
    soru: ["cin nedir", "cin var mi", "cinler hakkinda"],
    kisim: 2, maddeNo: 53,
    cevapOzet: "Cin hakkinda bilgi verilmektedir."
  },
  {
    soru: ["gayb imani", "gaybe iman", "secilmislerin imani"],
    kisim: 2, maddeNo: 54,
    cevapOzet: "Secilmislerin ve cahillerin gaybdan imanlari aciklanmaktadir."
  },
  {
    soru: ["dunyayi terk", "dunya dusuncesi", "evliya gonlu"],
    kisim: 2, maddeNo: 55,
    cevapOzet: "Allah adamlarinin gonlunde zerre kadar dunya dusuncesi yoktur."
  },
  {
    soru: ["ruhlar gorunur mu", "tenasuh yoktur", "ruh insan seklinde"],
    kisim: 2, maddeNo: 56,
    cevapOzet: "Ruhlar insan seklinde gorunur. Tenasuh (ruh gocu) yoktur."
  },
  {
    soru: ["medeniyet nedir", "insan neden medeni", "toplum hayati"],
    kisim: 2, maddeNo: 57,
    cevapOzet: "Insan medeni olmak icin yaratilmisdir."
  },
  {
    soru: ["keramet cok az olmasi", "harikaarin sebebi"],
    kisim: 2, maddeNo: 58,
    cevapOzet: "Harikalarin ve kerametlerin cok veya az olmasinin sebebi aciklanmaktadir."
  },
  {
    soru: ["mucize keramet fark", "keramet nedir", "sihr nedir"],
    kisim: 2, maddeNo: 59,
    cevapOzet: "Mu cize, keramet, firaset ve sihr arasindaki farklar aciklanmaktadir."
  },
  {
    soru: ["veli olmak icin keramet", "kerametsiz veli", "evliyalik sarti"],
    kisim: 2, maddeNo: 60,
    cevapOzet: "Veli olmak icin harikalar ve kerametler lazim degildir."
  },
  {
    soru: ["allah hicbir seye benzemez", "tesbihe imani", "allah akl ile anlasilir mi"],
    kisim: 2, maddeNo: 62,
    cevapOzet: "Allahu teala hicbir seye benzemez ve akl ile anlasilamaz."
  },
  {
    soru: ["cennetde allahi gormek", "ruyetullah", "allahu teala gorulecek mi"],
    kisim: 2, maddeNo: 63,
    cevapOzet: "Cennetde Allahu tealanin gorulecegine inanmiyanlara cevab verilmektedir."
  },
  {
    soru: ["insanin asli", "nefs in asli", "adem nedir"],
    kisim: 2, maddeNo: 64,
    cevapOzet: "Insanin asli ademdir. Ademde hic iyilik yoktur."
  },
  {
    soru: ["guzel suretler", "guzellik sebebi", "guzel yuz"],
    kisim: 2, maddeNo: 65,
    cevapOzet: "Guzel suretlerin tatli olmasinin sebebi aciklanmaktadir."
  },
  {
    soru: ["kadinlarla sozlesme", "peygamberimiz kadinlar", "biat nedir"],
    kisim: 2, maddeNo: 68,
    cevapOzet: "Resulullahinsallallahu aleyhi ve sellemin kadinlarla yapdigi sozlesme bildirilmektedir."
  },
  {
    soru: ["abdullah i dehlevi", "mekatib i serife", "dehlevi hazretleri"],
    kisim: 2, maddeNo: 69,
    cevapOzet: "Abdullah-i Dehlevi hazretlerinin Mekatib-i serife kitabindan bilgiler verilmektedir."
  },
  {
    soru: ["sunnete yapismak onemi", "bid at zulmet", "sunnet nur"],
    kisim: 2, maddeNo: 71,
    cevapOzet: "Isin basi, sunnet-i seniyyeye yapismak ve bid atden sakinmaktir."
  },

  // ============================================================
  // UCUNCU KISIM — TICARET, CEZA, CENAZE, TASAVVUF
  // ============================================================
  {
    soru: ["sunnete bagli olmak", "sunnet seniyye", "ahkam i islamiyye"],
    kisim: 3, maddeNo: 1,
    cevapOzet: "Isin basi, sunnet-i seniyyeye yapismak ve bid atden sakinmaktir."
  },
  {
    soru: ["sirk nedir", "insanin en buyuk gunahi", "sirk tehlikesi"],
    kisim: 3, maddeNo: 2,
    cevapOzet: "Sirk, insan icin en buyuk tehlikedir."
  },
  {
    soru: ["ticaret hukumleri", "islami ticaret", "alis veris hukumleri"],
    kisim: 3, maddeNo: 3,
    cevapOzet: "Islamiyyetde kesb ve ticaret hukumleri aciklanmaktadir."
  },
  {
    soru: ["alim satim", "bey ve sira", "satis hukumleri"],
    kisim: 3, maddeNo: 4,
    cevapOzet: "Bey ve sira (alim-satim) hukumleri bildirilmektedir."
  },
  {
    soru: ["muhayyerlik nedir", "alis veriste muhayyerlik", "olum hastasi satis"],
    kisim: 3, maddeNo: 5,
    cevapOzet: "Olum hastasinin satis ve hediyye yapmasi ve muhayyerlik hukumleri aciklanmaktadir."
  },
  {
    soru: ["batil satis", "fasid satis", "mekruh satis", "sarraflik"],
    kisim: 3, maddeNo: 6,
    cevapOzet: "Komsu hakki, suf a ve diger haklar uzerinde bilgiler verilmektedir."
  },
  {
    soru: ["hasta satis", "hasta hediyye", "hastanin satisi"],
    kisim: 3, maddeNo: 7,
    cevapOzet: "Hastanin satis yapmasi hukumleri bildirilmektedir."
  },
  {
    soru: ["cesitli fikih bilgileri", "muhtelif bilgiler"],
    kisim: 3, maddeNo: 8,
    cevapOzet: "Cesidli fikih bilgileri verilmektedir."
  },
  {
    soru: ["sart ile soylemek", "sartli satis", "sartli muamele"],
    kisim: 3, maddeNo: 9,
    cevapOzet: "Sart ile soylenen seylerin hukumleri aciklanmaktadir."
  },
  {
    soru: ["bono nedir", "sened kirdirmak", "police", "cek nedir"],
    kisim: 3, maddeNo: 10,
    cevapOzet: "Kefalet, havale, bono, sened kirdirmak ve police hukumleri bildirilmektedir."
  },
  {
    soru: ["istisna nedir", "siparis usulu satis", "ismarlanmis mal"],
    kisim: 3, maddeNo: 11,
    cevapOzet: "Istisna (siparis ile imal ettirmek) hukumleri aciklanmaktadir."
  },
  {
    soru: ["odunc vermek", "borc vermek", "karz i hasen"],
    kisim: 3, maddeNo: 12,
    cevapOzet: "Odunc vermenin hukumleri bildirilmektedir."
  },
  {
    soru: ["kefalet nedir", "havale nedir"],
    kisim: 3, maddeNo: 13,
    cevapOzet: "Kefalet ve havale hukumleri aciklanmaktadir."
  },
  {
    soru: ["vekalet nedir", "vekil tayin"],
    kisim: 3, maddeNo: 14,
    cevapOzet: "Vekalet hukumleri bildirilmektedir."
  },
  {
    soru: ["ticarette adalet", "ihtikar nedir", "karaborsa"],
    kisim: 3, maddeNo: 15,
    cevapOzet: "Ticaretde adalet ve ihtikar hukumleri aciklanmaktadir."
  },
  {
    soru: ["ticarette ihsan", "ticarette iyilik", "ticaret ahlaki"],
    kisim: 3, maddeNo: 16,
    cevapOzet: "Ticaretde ihsan ve iyilik yapmanin hukumleri bildirilmektedir."
  },
  {
    soru: ["ticarette dinini kayirmak", "dindar tacir", "ticarette din"],
    kisim: 3, maddeNo: 17,
    cevapOzet: "Ticaretde dinini kayirmanin hukumleri aciklanmaktadir."
  },
  {
    soru: ["kira hukumleri", "ucret", "iscilik", "sigorta"],
    kisim: 3, maddeNo: 18,
    cevapOzet: "Kira, ucret, iscilik ve sigortacilik hukumleri bildirilmektedir."
  },
  {
    soru: ["faiz hukmu", "banka faizi", "bono kirdirmak", "islamda faiz"],
    kisim: 3, maddeNo: 19,
    cevapOzet: "Islamiyyetde faiz, bankalar, bono kirdirmak ve vakf hukumleri aciklanmaktadir."
  },
  {
    soru: ["sirket hukmu", "ortaklik", "sirket kurma"],
    kisim: 3, maddeNo: 20,
    cevapOzet: "Sirketler hakkinda hukumler bildirilmektedir."
  },
  {
    soru: ["emanet nedir", "emanete riayet", "emanetciye para"],
    kisim: 3, maddeNo: 21,
    cevapOzet: "Kira, ucret, iscilik, sigortacilik ve emanetciye verilen para hukumleri bildirilmektedir."
  },
  {
    soru: ["ceza hukuku", "ukubat", "islamda ceza"],
    kisim: 3, maddeNo: 22,
    cevapOzet: "Ukubat (ceza hukumleri) aciklanmaktadir."
  },
  {
    soru: ["tazir cezasi", "tazir nedir", "fikih kitaplari okumak"],
    kisim: 3, maddeNo: 23,
    cevapOzet: "Ta zir cezalari bildirilmektedir. Tefsir kitablarini degil, fikh kitablarini okumak lazimdir."
  },
  {
    soru: ["cinayet hukmu", "adam oldurme", "katl", "kisas nedir"],
    kisim: 3, maddeNo: 24,
    cevapOzet: "Cinayetler, katlin cesidleri ve cezalari, kisas hukumleri bildirilmektedir."
  },
  {
    soru: ["diyet nedir", "diyet cezasi", "katl keffareti"],
    kisim: 3, maddeNo: 25,
    cevapOzet: "Diyet cezalari ve katl keffareti hukumleri aciklanmaktadir."
  },
  {
    soru: ["ikrah nedir", "zorla yapdirmak", "hicr nedir", "yasaklamak"],
    kisim: 3, maddeNo: 26,
    cevapOzet: "Ikrah (zorlama) ve hicr (yasaklama) hukumleri aciklanmaktadir."
  },
  {
    soru: ["evliyalik ve seriat", "ahkam i islamiyyesiz evliyalik", "seriat olmadan evliya"],
    kisim: 3, maddeNo: 27,
    cevapOzet: "Ahkam-i islamiyyesiz evliyalik olmaz."
  },
  {
    soru: ["kelime i tevhid", "la ilahe illallah", "tevhid"],
    kisim: 3, maddeNo: 28,
    cevapOzet: "Kelime-i tevhidin ma nasi bildirilmektedir."
  },
  {
    soru: ["kelime i tevhid ustunlugu", "kelime i tevhid fazileti"],
    kisim: 3, maddeNo: 29,
    cevapOzet: "Kelime-i tevhidin ustunlukleri aciklanmaktadir."
  },

  // ---- TASAVVUF ----
  {
    soru: ["fena beka nedir", "fena fillah", "beka billah"],
    kisim: 3, maddeNo: 30,
    cevapOzet: "Fena ve beka bildirilmektedir."
  },
  {
    soru: ["eshab i yemin", "eshab i simal", "sabikun kimdir"],
    kisim: 3, maddeNo: 31,
    cevapOzet: "Eshab-i yemin, eshab-i simal ve sabikun aciklanmaktadir."
  },
  {
    soru: ["muminin kalbi", "kalbin kiymetii", "kalb temizligi"],
    kisim: 3, maddeNo: 32,
    cevapOzet: "Mu minin kalbi kiymetlidir."
  },
  {
    soru: ["ars nedir", "kursi nedir", "kalbin ustunlukleri"],
    kisim: 3, maddeNo: 33,
    cevapOzet: "Ars ve Kursi aciklanmaktadir. Kalbin ustunlukleri bildirilmektedir."
  },
  {
    soru: ["alem i emr nedir", "bes cevher", "ruh kalb sir"],
    kisim: 3, maddeNo: 34,
    cevapOzet: "Alem-i emrdeki bes cevher aciklanmaktadir."
  },
  {
    soru: ["fena fillah nedir", "fenaya kavusmak"],
    kisim: 3, maddeNo: 35,
    cevapOzet: "Fena-fillah nedir, aciklanmaktadir."
  },
  {
    soru: ["tasavvuf yolu kac tane", "iki tasavvuf yolu", "naksibendi kadiri"],
    kisim: 3, maddeNo: 36,
    cevapOzet: "Allahu tealaya kavusduran tesavvuf yolu ikidir."
  },
  {
    soru: ["tasavvuf mutehassisi", "tesavvuf mektubu", "tasavvuf alimi"],
    kisim: 3, maddeNo: 37,
    cevapOzet: "Bir tesavvuf mutehassisinin mektubu bildirilmektedir."
  },
  {
    soru: ["suluk dereceleri", "suluk nedir", "tasavvuf yolu dereceleri"],
    kisim: 3, maddeNo: 38,
    cevapOzet: "Tesavvuf yolu, suluk dereceleri, fena ve beka aciklanmaktadir."
  },
  {
    soru: ["ihata nedir", "kurbiyet nedir", "maiyet sifati"],
    kisim: 3, maddeNo: 39,
    cevapOzet: "Allahu tealanin ihata, kurb ve ma iyyet sifatlari aciklanmaktadir."
  },
  {
    soru: ["alem vehim mi", "vehm mertebesi", "alemi vehm"],
    kisim: 3, maddeNo: 40,
    cevapOzet: "Alem vehm mertebesinde yaratilmisdir."
  },
  {
    soru: ["tasavvuf ve seriat", "tasavvufda islamiyyete uymak"],
    kisim: 3, maddeNo: 41,
    cevapOzet: "Tesavvuf yolunun basinda da, sonunda da islamiyyete uymak lazimdir."
  },
  {
    soru: ["evliya kimdir", "evliya olmak", "nihayet nedir"],
    kisim: 3, maddeNo: 44,
    cevapOzet: "Nihayet, afak ve enfusun disindadir. Evliya kimlere denir, aciklanmaktadir."
  },
  {
    soru: ["vahdet i vucud", "vucud i vehmi", "panteizm"],
    kisim: 3, maddeNo: 47,
    cevapOzet: "Vahdet-i vucud bilgisi ve vucud-i vehmi aciklanmaktadir."
  },
  {
    soru: ["kabenin kemalati", "namazin hakikati", "namazda allaha yakinlik"],
    kisim: 3, maddeNo: 46,
    cevapOzet: "Ka be-i muazzamanin ve nemazin kemalati aciklanmaktadir."
  },
  {
    soru: ["namazda yakinlik", "namazin hakikati 2", "secde yakinlik"],
    kisim: 3, maddeNo: 52,
    cevapOzet: "Nemazda olanin Allahu tealaya yakinligi ve nemazin hakikati bildirilmektedir."
  },
  {
    soru: ["tasavvufda seriata uymak", "evliya seriata uyar"],
    kisim: 3, maddeNo: 50,
    cevapOzet: "Tesavvuf yolunun basinda da, sonunda da islamiyyete uymak lazimdir."
  },

  // ---- CENAZE / KABIR ----
  {
    soru: ["olume hazirlik", "olum hakki", "can cekmek"],
    kisim: 3, maddeNo: 55,
    cevapOzet: "Olum ve olume hazirlanmak, sifa ayetleri bildirilmektedir."
  },
  {
    soru: ["kefen nedir", "kefenleme nasil yapilir", "oluye yapilacaklar"],
    kisim: 3, maddeNo: 56,
    cevapOzet: "Meyyite yapilacak dini vazife ve kefen hukumleri aciklanmaktadir."
  },
  {
    soru: ["cenaze namazi nasil kilinir", "cenaze namazi hukmu"],
    kisim: 3, maddeNo: 57,
    cevapOzet: "Cenaze nemazi farz-i kifayedir. Kilinis sekli bildirilmektedir."
  },
  {
    soru: ["cenaze tasima", "defin", "gomme", "mezar"],
    kisim: 3, maddeNo: 58,
    cevapOzet: "Cenaze tasimak ve defn hukumleri aciklanmaktadir."
  },
  {
    soru: ["kabir ziyareti", "mezar ziyareti", "kuran okumak olulere"],
    kisim: 3, maddeNo: 59,
    cevapOzet: "Kabr ziyareti ve Kur an-i kerim okumanin hukumleri bildirilmektedir."
  },
  {
    soru: ["kabir ziyaretinin faidesi", "mezar ziyareti faydalari"],
    kisim: 3, maddeNo: 60,
    cevapOzet: "Kabr ziyaretinin faidesi bildirilmektedir."
  },
  {
    soru: ["dunya sikintisi faydasi", "taun sevabi", "veba hastaligi"],
    kisim: 3, maddeNo: 62,
    cevapOzet: "Dunya sikintilarinin faidesi ve ta undan olmenin kiymeti bildirilmektedir."
  },
  {
    soru: ["iskat nedir", "iskat devir", "olu icin iskat"],
    kisim: 3, maddeNo: 63,
    cevapOzet: "Meyyit icin iskat hukumleri bildirilmektedir."
  },
  {
    soru: ["miras hukuku", "feraiz nedir", "miras nasil paylasilir", "miras kimlere kalir"],
    kisim: 3, maddeNo: 64,
    cevapOzet: "Feraiz bilgisi, miras alacak kimseler ve vasi ta yini aciklanmaktadir."
  },
  {
    soru: ["miras hesabi", "miras paylari", "miras bolumu"],
    kisim: 3, maddeNo: 65,
    cevapOzet: "Feraiz hesablari ve mirasi bolmek hukumleri bildirilmektedir."
  },
  {
    soru: ["kabir hayati", "taundan olmenin kiymeti", "berzah alemi"],
    kisim: 3, maddeNo: 66,
    cevapOzet: "Kabr hayati ve ta undan olmenin kiymeti bildirilmektedir."
  },
  {
    soru: ["dunya sikintilari", "sikintinin faidesi", "belaya razzi olmak"],
    kisim: 3, maddeNo: 67,
    cevapOzet: "Dunya sikintilarinin faidesi ve ta unun sevabi bildirilmektedir."
  },
  {
    soru: ["kazaya razi olmak", "kaderden lezzet", "riza makamii"],
    kisim: 3, maddeNo: 68,
    cevapOzet: "Kazaya razi olmalidir, hatta lezzet duymaalidir."
  },
  {
    soru: ["sevgiliden sikinti", "dert ceken asik", "bela tatliligi"],
    kisim: 3, maddeNo: 69,
    cevapOzet: "Sevgiliden gelen sikintilar, iyiliklerinden daha tatlidir."
  },
  {
    soru: ["seadet i ebediyye son soz", "kitabin sonu", "son soz"],
    kisim: 3, maddeNo: 70,
    cevapOzet: "Se adet-i Ebediyye nin son sozu bildirilmektedir."
  },

  // ---- FEN / BILIM ----
  {
    soru: ["hucre nedir", "hayat nedir", "mikrop nedir"],
    kisim: 3, maddeNo: 54,
    cevapOzet: "Madde uzerinde yeni bilgiler, hucre, hayat, mikrop ve zehr aciklanmaktadir."
  },
  {
    soru: ["madde ilahiden nasibi", "alemin nasibi", "zat i ilahi"],
    kisim: 3, maddeNo: 53,
    cevapOzet: "Alemin ve maddenin, zat-i ilahiden nasibi yokdur."
  }
];
