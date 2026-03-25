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
  "sunnet namaz": ["sunnet nemaz"]
};

// ============================================================================
// 2. SORU -> MADDE ESLESTIRME HARITASI
// ============================================================================
var soruMaddeMap = [

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
    soru: ["cennet nedir", "cennete girmek", "cennete nasil girilir"],
    kisim: 1, maddeNo: 21,
    cevapOzet: "Cennete girmek icin Muhammed aleyhisselama uymak lazimdir."
  },
  {
    soru: ["kabir azabi", "kabir azabi var mi", "kabir hayati"],
    kisim: 2, maddeNo: 19,
    cevapOzet: "Kabr azabi haktir. Inanmiyanlara cevab verilmektedir."
  },
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
    soru: ["ictihad nedir", "muctehid kimdir", "ictihad ne demek"],
    kisim: 1, maddeNo: 27,
    cevapOzet: "Ictihad, ahkam-i ser iyyeyi delillerden cikarmaktir. Muctehid, bunu yapabilecek ilme sahip alimdir."
  },
  {
    soru: ["farz sunnet nafile farki", "farz sunnet onemi"],
    kisim: 1, maddeNo: 44,
    cevapOzet: "Farz, sunnet ve nafilelerin ehemmiyyetleri ve farklari bildirilmektedir."
  },

  // ---- NAMAZ ----
  {
    soru: ["otuzuc farz", "33 farz", "bes vakit namaz farzlari"],
    kisim: 1, maddeNo: 51,
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

  // ---- ORUC ----
  {
    soru: ["ramazan orucu", "oruc nasil tutulur", "ramazanin kiymetii"],
    kisim: 1, maddeNo: 77,
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

  // ---- MUBAREK GECELER ----
  {
    soru: ["mubarek geceler", "kandil geceleri", "kadir gecesi", "mirac gecesi"],
    kisim: 1, maddeNo: 85,
    cevapOzet: "Mubarek geceler ve bu gecelerde yapilacak ibadetler bildirilmektedir."
  },

  // ---- SELAMLASMA ----
  {
    soru: ["selam vermek", "selamlasmak", "selam nasil verilir"],
    kisim: 1, maddeNo: 90,
    cevapOzet: "Selamlasmak sunnetdir. Selam vermenin ve almanin adabi bildirilmektedir."
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

  // ---- IKINCI KISIM ----
  {
    soru: ["dua nedir", "dua nasil edilir", "dua etmenin adabi"],
    kisim: 2, maddeNo: 2,
    cevapOzet: "Dua etmekdeki gizli bilgiler aciklanmaktadir."
  },
  {
    soru: ["adalet nedir", "akil nedir", "iman ve akil"],
    kisim: 2, maddeNo: 4,
    cevapOzet: "Adalet, akl, iman, kaza ve kader meseleleri aciklanmaktadir."
  },
  {
    soru: ["hadis nedir", "hadis cesitleri", "hadis alimleri"],
    kisim: 2, maddeNo: 6,
    cevapOzet: "Hadis-i seriflerin cesidleri ve hadis alimleri bildirilmektedir."
  },
  {
    soru: ["sabir nedir", "belaya sabir", "derde sabr"],
    kisim: 2, maddeNo: 9,
    cevapOzet: "Insanlardan gelen sikintilara sabretmek lazimdir."
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
    soru: ["eshab i kiram", "sahabe", "sahabi kimdir"],
    kisim: 2, maddeNo: 24,
    cevapOzet: "Eshab-i kiram birbirini cok severdi. Buyuklukleri bildirilmektedir."
  },
  {
    soru: ["nikah nasil kiyilir", "evlenme", "islamda nikah", "nikah hukumleri"],
    kisim: 2, maddeNo: 34,
    cevapOzet: "Islamiyyetde nikah ve evlenmesi caiz olmayan kadinlar bildirilmektedir."
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
  {
    soru: ["helal haram", "halal haram", "subheli seyler", "vera ve takva"],
    kisim: 2, maddeNo: 40,
    cevapOzet: "Halal, haram ve subheli seyler, vera ve takva aciklanmaktadir."
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
    soru: ["faiz haram mi", "faiz nedir", "riba nedir", "faiz yasak mi"],
    kisim: 2, maddeNo: 44,
    cevapOzet: "Israf ve faiz haramdir. Tutun icmek de ele alinmaktadir."
  },
  {
    soru: ["yemek adabi", "sofra adabi", "yemek icmek adabi"],
    kisim: 2, maddeNo: 45,
    cevapOzet: "Yimek, icmek adabi bildirilmektedir."
  },
  {
    soru: ["tevekkul nedir", "tevekkul ne demek", "allaha tevekkul"],
    kisim: 2, maddeNo: 47,
    cevapOzet: "Tevekkul, sebeplerine yapisilip neticeyi Allahu tealaya havale etmektir."
  },
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
    soru: ["mucize keramet fark", "keramet nedir", "sihr nedir"],
    kisim: 2, maddeNo: 59,
    cevapOzet: "Mu cize, keramet, firaset ve sihr arasindaki farklar aciklanmaktadir."
  },
  {
    soru: ["nefs nedir", "akil nedir", "nefsi terbiye"],
    kisim: 2, maddeNo: 28,
    cevapOzet: "Nefs ve akl aciklanmaktadir."
  },

  // ---- UCUNCU KISIM ----
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
    soru: ["muhayyerlik nedir", "alis veriste muhayyerlik"],
    kisim: 3, maddeNo: 5,
    cevapOzet: "Alis veriste muhayyerlik cesitleri aciklanmaktadir."
  },
  {
    soru: ["batil satis", "fasid satis", "mekruh satis", "sarraflik"],
    kisim: 3, maddeNo: 6,
    cevapOzet: "Batil, fasid ve mekruh satislar ve sarraflik hukumleri bildirilmektedir."
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
    soru: ["ceza hukuku", "ukubat", "islamda ceza"],
    kisim: 3, maddeNo: 22,
    cevapOzet: "Ukubat (ceza hukumleri) aciklanmaktadir."
  },
  {
    soru: ["cinayet hukmu", "adam oldurme", "katl"],
    kisim: 3, maddeNo: 24,
    cevapOzet: "Cinayetler ve hukumleri bildirilmektedir."
  },
  {
    soru: ["diyet nedir", "diyet cezasi", "katl keffareti"],
    kisim: 3, maddeNo: 25,
    cevapOzet: "Diyet cezalari ve katl keffareti hukumleri aciklanmaktadir."
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
  {
    soru: ["olume hazirlik", "olum hakki", "can cekmek"],
    kisim: 3, maddeNo: 55,
    cevapOzet: "Olum ve olume hazirlanmak, sifa ayetleri bildirilmektedir."
  },
  {
    soru: ["kefen nedir", "kefenleme nasil yapilir", "oluve yapilacaklar"],
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
  }
];
