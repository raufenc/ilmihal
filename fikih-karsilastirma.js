/*
 * Fıkıh Karşılaştırma Tabloları
 * Dört Sünnî Mezhebe Göre Mukayeseli Fıkıh Bilgileri
 *
 * Bu bilgiler Se'âdet-i Ebediyye ve muteber fıkıh kaynaklarından derlenmiştir.
 * Her müslümanın kendi mezhebinin hükümlerini öğrenmesi ve ona göre amel etmesi lâzımdır.
 */

var fikihKarsilastirma = [
  {
    id: "fatiha-muktedi",
    baslik: "Namazda Fâtiha Okumak (Muktedînin Fâtihası)",
    kategori: "ibadet",
    aciklama: "Cemâatle namazda imâma uyan kimsenin Fâtiha okuması hakkında dört mezhebin görüşleri",
    mezhepler: {
      hanefi: "Muktedî (imâma uyan kimse), ister gizli ister açık okunan namazlarda olsun, Fâtiha ve zamm-ı sûre okumaz; yalnızca sükût ederek imâmı dinler. İmâmın kırâati muktedî için de kâfîdir. Muktedînin Fâtiha okuması tahrîmen mekrûhtur.",
      safii: "Muktedînin her rek'atte Fâtiha okuması farzdır. İmâm açık (cehrî) okuduğu namazlarda da muktedî Fâtiha'yı okur. İmâmın Fâtiha'dan sonraki sükût anında muktedî kendi Fâtiha'sını tamamlamalıdır.",
      maliki: "Muktedî, imâmın gizli (hafî) okuduğu namazlarda Fâtiha okur. Açık (cehrî) okunan namazlarda ise imâmı dinler, Fâtiha okuması mekrûhtur. İmâmın kırâati muktedî için yeterlidir.",
      hanbeli: "Muktedînin Fâtiha okuması sünnettir, farz değildir. Açık okunan namazlarda imâmın sükût ettiği anlarda okur. İmâmın kırâatini işitiyorsa susar ve dinler, işitmiyorsa okur."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 18",
    ilgiliMadde: { kisim: 1, maddeNo: 18 }
  },
  {
    id: "abdest-bozan",
    baslik: "Abdest Bozan Hâller",
    kategori: "ibadet",
    aciklama: "Dört mezhebe göre abdesti bozan ve bozmayan durumların karşılaştırması",
    mezhepler: {
      hanefi: "Ön ve arkadan çıkan her şey abdesti bozar. Ağız dolusu kusmak, vücûdun herhangi bir yerinden kan veya irin akması, uyumak (yaslanarak veya uzanarak), kahkaha ile gülmek (namaz içinde) abdesti bozar. Kadına dokunmak abdesti bozmaz.",
      safii: "Ön ve arkadan çıkan her şey abdesti bozar. Deriye dokunma (yabancı kadın-erkek arası) abdesti bozar. Avuç içi ile kendi avret yerine dokunmak bozar. Uyku abdesti bozar. Kan veya irin akması abdesti bozmaz.",
      maliki: "Ön ve arkadan çıkan her şey, ağır uyku, bayılmak abdesti bozar. Lezzet duyarak kadına dokunmak bozar, lezzet duymadan dokunmak bozmaz. Kan ve irin akması abdesti bozmaz. Kahkaha abdesti bozmaz.",
      hanbeli: "Ön ve arkadan çıkan her şey, şehvetle kadına dokunmak, avret yerine dokunmak, uyku, bayılma abdesti bozar. Vücuttan çok miktarda kan çıkması abdesti bozar. Deve eti yemek de abdesti bozar."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 28",
    ilgiliMadde: { kisim: 1, maddeNo: 28 }
  },
  {
    id: "namazin-farzlari",
    baslik: "Namazın Farzları (Dâhilî ve Hâricî Şartlar)",
    kategori: "ibadet",
    aciklama: "Namazın içindeki ve dışındaki farzları hakkında dört mezhep görüşleri",
    mezhepler: {
      hanefi: "Namazın dışındaki şartları (şurût): Hadesten tahâret, necâsetten tahâret, setr-i avret, istikbâl-i kıble, vakit, niyet. Namazın içindeki farzları (erkân): İftitâh tekbîri, kıyâm, kırâat, rükû, secde, ka'de-i ahîre. Tâdîl-i erkân vâciptir, farz değildir.",
      safii: "Namazın şartları: Hadesten ve necâsetten tahâret, setr-i avret, istikbâl-i kıble, vakit, niyet (kılınacak namazı tâyin etmek farzdır). Rükünler: Niyet, iftitâh tekbîri, kıyâm, Fâtiha okumak, rükû, secdeler, ka'de-i ahîre, Tahiyyât, Peygamber Efendimiz sallallâhü aleyhi ve selleme salevât, selâm, tertîb. Tâdîl-i erkân farzdır.",
      maliki: "Şartlar: İslâm, akıl, temyîz, hadesten tahâret, necâsetten tahâret, setr-i avret, vakit, kıbleye yönelmek. Farzları (rükünler): Niyet, iftitâh tekbîri, kıyâm, Fâtiha, rükû, rükûdan kalkma, secde, secdeden kalkma, selâm, ka'de-i ahîre, tâdîl-i erkân, tertîb.",
      hanbeli: "Şartlar: Vakit, tahâret, setr-i avret, kıble, niyet. Rükünler: İftitâh tekbîri, kıyâm, Fâtiha okumak, rükû, rükûdan doğrulmak, secde, secdeden doğrulmak, ka'de-i ahîre, Tahiyyât, tertîb, tümâ'nîne (tâdîl-i erkân farzdır), selâm."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 15-16",
    ilgiliMadde: { kisim: 1, maddeNo: 15 }
  },
  {
    id: "vitir-namazi",
    baslik: "Vitir Namazı",
    kategori: "ibadet",
    aciklama: "Vitir namazının hükmü, rek'at sayısı ve edâ şekli hakkında mezhepler arası farklılıklar",
    mezhepler: {
      hanefi: "Vitir namazı vâciptir. Üç rek'at olup tek selâm ile kılınır. Her üç rek'atte de Fâtiha ve zamm-ı sûre okunur. Üçüncü rek'atte rükûdan önce tekbîr alınarak kunût duâsı okunur. Yatsı namazının vaktinde kılınır.",
      safii: "Vitir namazı sünnet-i müekkededir, vâcip değildir. Bir rek'at olarak da, üç, beş, yedi, dokuz veya on bir rek'at olarak da kılınabilir. Kunût duâsı Ramazân'ın son yarısında sabah namazında okunur, vitirde devamlı okunmaz.",
      maliki: "Vitir namazı sünnet-i müekkededir. Bir rek'at olarak kılınır, ancak öncesinde şef' (çift) rek'at kılmak sünnettir. Kunût duâsı yoktur. Yatsı namazından sonra ve fecr-i sâdık'tan önce kılınır.",
      hanbeli: "Vitir namazı sünnet-i müekkededir. En az bir, en çok on bir rek'attir. Tercih edilen üç rek'attir. İki rek'at kılıp selâm verdikten sonra bir rek'at daha kılarak vitir yapılabilir. Son rek'atte kunût duâsı okunması sünnettir."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 21",
    ilgiliMadde: { kisim: 1, maddeNo: 21 }
  },
  {
    id: "kunut-duasi",
    baslik: "Kunût Duâsı",
    kategori: "ibadet",
    aciklama: "Kunût duâsının hangi namazda, ne zaman ve nasıl okunacağı hakkında mezheplerin görüşleri",
    mezhepler: {
      hanefi: "Kunût duâsı yalnızca vitir namazının üçüncü rek'atinde okunur. Rükûdan önce, kırâatten sonra tekbîr alınarak eller kaldırılır ve kunût duâları okunur. Vitir dışında kunût okunmaz. Sabah namazında kunût okumak bâtıldır.",
      safii: "Kunût duâsı sabah namazının ikinci rek'atinde rükûdan sonra (i'tidâlde) okunur ve bu sünnettir. Ramazân ayının son yarısında vitir namazında da kunût okunur. Belâ ve musîbet zamanında tüm farz namazlarda kunût okunabilir (kunût-i nâzile).",
      maliki: "Kunût duâsı yalnızca sabah namazının ikinci rek'atinde rükûdan önce okunur. Gizli (hafî) okunması tercih edilir. Vitir namazında kunût yoktur. Nâzile kunûtu da meşrû görülmemiştir.",
      hanbeli: "Kunût duâsı vitir namazının son rek'atinde rükûdan sonra okunur. Sabah namazında devamlı kunût okumak meşrû değildir. Müslümanların başına bir belâ geldiğinde sabah dışındaki namazlarda nâzile kunûtu okunabilir."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 21",
    ilgiliMadde: { kisim: 1, maddeNo: 21 }
  },
  {
    id: "kadin-erkek-namaz-farki",
    baslik: "Kadın ile Erkeğin Namazda Farkları",
    kategori: "ibadet",
    aciklama: "Kadın ve erkeğin namaz kılış şekillerindeki farklılıklar hakkında mezheplerin görüşleri",
    mezhepler: {
      hanefi: "Kadın ve erkeğin namazı arasında önemli farklar vardır. Kadınlar iftitâh tekbîrinde ellerini omuz hizâsına kaldırır, kıyâmda ellerini göğsü üzerine koyar, rükûda dizlerini hafif büker, secdede kollarını yere yapıştırır ve karnını uyluklarına yaklaştırır. Teverrük ile oturur.",
      safii: "Kadın ile erkeğin namazında temel rükünlerde fark yoktur. İkisi de aynı şekilde kılar. Ancak kadının namazda daha toplanık (inkıbâz hâlinde) olması müstehaptır. Secdede kollarını yere yaklaştırması ve bedenini toplu tutması güzeldir.",
      maliki: "Kadın ile erkeğin namazı arasında rükünler bakımından fark yoktur. Kadınlar da erkekler gibi kılar. Ancak kadının örtünmesi farzdır; elleri ve yüzü dışında tüm bedeni avrettir. Namazda toplanık durması müstehaptır.",
      hanbeli: "Kadın ile erkeğin namazında esâsta fark yoktur. Kadınlar da erkekler gibi ellerini kulak hizâsına kaldırır. Ancak kadının secdede daha toplanık olması, kollarını yere yaklaştırması müstehaptır. Avret bakımından yüz dışında tüm bedeni avrettir."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 20",
    ilgiliMadde: { kisim: 1, maddeNo: 20 }
  },
  {
    id: "orucu-bozan-bozmayan",
    baslik: "Orucu Bozan ve Bozmayan Hâller",
    kategori: "ibadet",
    aciklama: "Dört mezhebe göre orucu bozan ve bozmayan durumların karşılaştırması",
    mezhepler: {
      hanefi: "Kasten yemek, içmek ve cinsî münâsebet orucu bozar; kasten yapıldığında hem kazâ hem de keffâret gerekir. Unutarak yiyip içmek orucu bozmaz. Göz ve kulağa damla damlatmak bozmaz. Kan aldırmak (hacâmat) bozmaz. Misvak kullanmak mekrûh değildir. Kusturmak (istifra) bozar, kendiliğinden gelen kusmak (ağız dolusu değilse) bozmaz.",
      safii: "Kasten yemek, içmek ve cinsî münâsebet orucu bozar. Unutarak yiyip içmek bozmaz. Kasten kusmak bozar. Vücûda bir şey girmesi (menfez yoluyla) orucu bozar; göze sürme çekmek bozmaz. Keffâret yalnızca kasten cinsî münâsebetle bozulduğunda gerekir, yeme-içme ile bozmada yalnız kazâ gerekir.",
      maliki: "Kasten yemek, içmek, cinsî münâsebet orucu bozar ve keffâret gerektirir. Keffâret, kasıtlı olarak yeme-içme ile bozulduğunda da gerekir. Unutarak yemek bozmaz. Ağıza su vermekte mübalağa edip su yutmak bozar. Gözden sürmeden akıp boğaza ulaşan bozar.",
      hanbeli: "Kasten yemek, içmek, cinsî münâsebet, kan aldırmak (hacâmat) orucu bozar. Hacâmat yaptırana da yaptırana da bozar. Kasten kusmak bozar. Unutarak yemek-içmek bozmaz. Keffâret yalnızca cinsî münâsebette gerekir. Göz damlası gibi normâl menfez olmayan yollardan giren şeyler orucu bozmaz."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 36",
    ilgiliMadde: { kisim: 1, maddeNo: 36 }
  },
  {
    id: "zekat-nisab",
    baslik: "Zekât Nisâb Miktarları",
    kategori: "ibadet",
    aciklama: "Dört mezhebe göre zekâtın farz olma şartları ve nisâb miktarları",
    mezhepler: {
      hanefi: "Altında nisâb 20 miskal (80,18 gr), gümüşte 200 dirhem (561,2 gr). Ticâret mallarında gümüş nisâbına göre hesaplanır. Paranın zekâtı kırkta birdir (%2,5). Nisâba ulaşan malın üzerinden bir kamerî yıl geçmesi şarttır. Borçlar nisâbdan düşülür.",
      safii: "Altında nisâb 20 miskal (yaklaşık 85 gr), gümüşte 200 dirhem (yaklaşık 595 gr). Zekât oranı kırkta birdir. Üzerinden bir yıl geçmiş olması şarttır. Ticâret malları yıl sonundaki değerine göre hesaplanır. Nisâb, yılın başında ve sonunda mevcut olmalıdır.",
      maliki: "Altında nisâb 20 miskal, gümüşte 200 dirhem. Zekât oranı kırkta birdir. Yılın tamamında nisâba mâlik olmak şart değildir; yılın başında ve sonunda mevcut olması yeterlidir. Borçlar nisâbdan düşülmez, yalnız gizli (bâtınî) mallarda düşülür.",
      hanbeli: "Altında nisâb 20 miskal, gümüşte 200 dirhem. Kırkta bir zekât verilir. Nisâba ulaştıktan sonra üzerinden tam bir kamerî yıl geçmesi şarttır. Yılın tamamında nisâba mâlik olmak gerekir. Borçlar nisâbdan düşülür."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 41",
    ilgiliMadde: { kisim: 1, maddeNo: 41 }
  },
  {
    id: "seferilik-mesafesi",
    baslik: "Seferîlik (Yolculuk) Mesâfesi",
    kategori: "ibadet",
    aciklama: "Namazları kısaltmayı ve oruç tutmamayı mubah kılan seferîlik mesâfesi ve hükümleri",
    mezhepler: {
      hanefi: "Seferîlik mesâfesi üç günlük yol, yâni yaklaşık 104 km (18 fersah) dir. Dört rek'atlı farz namazlar iki rek'at olarak kılınır ve bu kısaltma vâciptir (farz). Seferde Ramazân orucu tutmamak câizdir. Mest üzerine mesh süresi üç gün üç geceye çıkar.",
      safii: "Seferîlik mesâfesi 2 merhaledir, yaklaşık 81 km (16 fersah). Dört rek'atlı farz namazlar iki rek'at olarak kılınabilir; bu bir ruhsattır, farz değildir. Kısaltmak (kasr) câizdir, tamamlamak da câizdir. İki namazı cem' etmek (birleştirmek) de câizdir.",
      maliki: "Seferîlik mesâfesi 4 bürd, yaklaşık 81 km'dir. Dört rek'atlı namazları kısaltmak sünnet-i müekkededir. Tamamlamak mekrûhtur. İki namazı cem' etmek yağmur gibi özürlerle câiz olur, yalnız yolculuk sebebiyle cem' de câizdir.",
      hanbeli: "Seferîlik mesâfesi 16 fersah, yaklaşık 81 km'dir. Dört rek'atlı farz namazları kısaltmak câizdir, sünnettir. Tamamlamak da câiz olmakla birlikte kısaltmak efdaldir. İki namazı cem' etmek yolculukta câizdir."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 22",
    ilgiliMadde: { kisim: 1, maddeNo: 22 }
  },
  {
    id: "mest-mesh-suresi",
    baslik: "Mest Üzerine Mesh Süresi ve Şartları",
    kategori: "ibadet",
    aciklama: "Mest üzerine mesh süreleri, meshin şartları ve geçerlilik durumları",
    mezhepler: {
      hanefi: "Mukîm (yerleşik) için bir gün bir gece (24 saat), müsâfir için üç gün üç gece (72 saat). Mestler abdestli iken giyilmiş olmalıdır. Mestin topukları örtmesi, su geçirmemesi ve bir fersah yol yürünebilecek dayanıklılıkta olması şarttır. Ayağın çoğunluğuna mesh etmek farzdır.",
      safii: "Mukîm için bir gün bir gece, müsâfir için üç gün üç gece. Abdestli iken giyilmiş olmalıdır. Mestin altında üç parmak miktarı delik olursa mesh bâtıl olur. Her ayağın üstüne bir miktar mesh etmek yeterlidir. Çorap kalın ve su geçirmez ise mesh câizdir.",
      maliki: "Mesh süresi sınırsızdır; müddet tahdîdi yoktur. Abdest bozulup tekrar abdest alındıkça mesh devam edebilir. Cünüplük hâlinde mestler çıkarılmalıdır. Mestlerin deri olması şarttır, çorap üzerine mesh câiz değildir.",
      hanbeli: "Mukîm için bir gün bir gece, müsâfir için üç gün üç gece. Abdestli iken giyilmiş olmalıdır. Mestlerde küçük delik mesh'e mâni değildir. Mestin ayağın çoğunluğunu örtmesi şarttır. Kalın çorap üzerine de mesh câizdir."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 29",
    ilgiliMadde: { kisim: 1, maddeNo: 29 }
  },
  {
    id: "bayram-namazi",
    baslik: "Bayram Namazı Hükmü",
    kategori: "ibadet",
    aciklama: "Ramazân ve Kurbân bayramı namazlarının hükmü, şartları ve kılınış şekli",
    mezhepler: {
      hanefi: "Bayram namazı vâciptir. Cum'a namazının şartları bayram namazı için de geçerlidir: Şehirde olmak, erkek olmak, hür olmak, mukîm olmak. İki rek'at olup birinci rek'atte üç, ikinci rek'atte üç zâid tekbîr alınır. Hutbe namazdan sonra okunur.",
      safii: "Bayram namazı sünnet-i müekkededir. Kadın-erkek herkes için sünnettir. Münferiden de kılınabilir. İki rek'at olup birinci rek'atte yedi, ikinci rek'atte beş zâid tekbîr alınır. Hutbe namazdan sonra okunur. Cemâat şartı yoktur.",
      maliki: "Bayram namazı sünnet-i müekkededir. İki rek'at olup birinci rek'atte altı, ikinci rek'atte beş zâid tekbîr alınır. Hutbe namazdan sonra okunur. Kadınların da kılması sünnettir. Cemâatsiz münferiden de kılınabilir.",
      hanbeli: "Bayram namazı farz-ı kifâyedir. Yeterli sayıda müslüman kılarsa diğerlerinden düşer. İki rek'at olup birinci rek'atte altı, ikinci rek'atte beş zâid tekbîr alınır. Hutbe namazdan sonra okunur. Kadınların da kılması müstehaptır."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 23",
    ilgiliMadde: { kisim: 1, maddeNo: 23 }
  },
  {
    id: "nikah-sartlari",
    baslik: "Nikâh Şartları",
    kategori: "aile",
    aciklama: "İslâm'da nikâhın sahîh olmasının şartları hakkında dört mezhebin görüşleri",
    mezhepler: {
      hanefi: "Nikâhın rükünleri îcâb ve kabûldür. İki erkek veya bir erkek iki kadın şâhit bulunması şarttır. Velî şartı yoktur; âkıl ve bâliğ kadın velîsinin izni olmadan nikâh kıyabilir, ancak velînin i'tirâz hakkı (küfüv meselesi) saklıdır. Mehir nikâhın şartıdır.",
      safii: "Nikâhın rükünleri: Karı-koca, îcâb ve kabûl, iki âdil erkek şâhit ve velî. Kadının velîsi (asabe cihetinden) olmadan nikâh sahîh olmaz. Velî, kadının rızâsı olmadan da onu evlendiremez (dul kadın için rızâsı şarttır). Mehr-i misil kadının hakkıdır.",
      maliki: "Nikâhın rükünleri: Velî, mehr, karı-koca, îcâb-kabûl sîgası. Velî olmadan nikâh sahîh olmaz. Şâhitlerin nikâh ânında hazır bulunması şart değildir, duhûlden (zifâftan) önce ilân edilmesi yeterlidir. Mehr tesmiye edilmemiş olsa bile nikâh sahîhtir.",
      hanbeli: "Nikâhın şartları: Karı-kocanın tâyîni, her ikisinin rızâsı, velî, iki âdil erkek şâhit. Velî olmadan nikâh bâtıldır. Kadının kendi rızâsı da şarttır. Mehr kadının hakkı olup nikâh esnâsında belirlenmemiş olsa bile mehr-i misil gerekir."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 2, Madde 7",
    ilgiliMadde: { kisim: 2, maddeNo: 7 }
  },
  {
    id: "gusul-farzlari",
    baslik: "Guslün Farzları",
    kategori: "ibadet",
    aciklama: "Gusül abdestinin farzları ve yapılış şekli hakkında mezheplerin görüşleri",
    mezhepler: {
      hanefi: "Guslün farzları üçtür: Ağza su vermek (mazmaza), burna su vermek (istinşâk), bütün bedeni yıkamak. Niyet farz değildir, sünnettir. Ağız ve burun bedenin içinden sayıldığı için ayrıca yıkanması farzdır. Saç diplerine suyun ulaşması şarttır.",
      safii: "Guslün farzları ikiden ibârettir: Niyet ve bütün bedeni su ile yıkamak. Niyet farzdır. Ağza su vermek ve burna su vermek sünnettir, farz değildir. Saç diplerine suyun ulaşması şarttır. Kadınlar örgülü saçlarını çözmek zorunda değildir, diplere su ulaşması yeterlidir.",
      maliki: "Guslün farzları beştir: Niyet, bütün bedeni yıkamak, vücûdu ovmak (delk), peş peşe yıkamak (muvâlât), saç diplerini ve beden kıvrımlarını yıkamak. Niyet farzdır. Ovmak (delk) diğer mezheblerde farz değilken Mâlikî'de farzdır.",
      hanbeli: "Guslün farzları ikiden ibârettir: Niyet ve bütün bedeni su ile yıkamak. Niyet farzdır. Ağza su vermek ve burna su vermek de farzdır (Hanefî mezhebi ile aynıdır). Suyun beden üzerindeki her noktaya ulaşması şarttır."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 30",
    ilgiliMadde: { kisim: 1, maddeNo: 30 }
  },
  {
    id: "namazda-kahkaha",
    baslik: "Namazda Kahkaha ile Gülmek",
    kategori: "ibadet",
    aciklama: "Namaz içinde kahkaha ile gülmenin namaz ve abdeste etkisi hakkında mezheplerin görüşleri",
    mezhepler: {
      hanefi: "Namazda kahkaha ile gülmek (yanındakilerin duyacağı şekilde) hem namazı hem de abdesti bozar. Bu hüküm yalnızca rükûlu ve secdeli namazlara mahsûstur; cenâze namazı ve secde-i tilâvette kahkaha abdesti bozmaz. Namaz dışında kahkaha abdesti bozmaz.",
      safii: "Namazda kahkaha ile gülmek namazı bozar, fakat abdesti bozmaz. Namaz dışında da kahkaha abdesti bozmaz. Namazda gülmek, konuşma hükmünde olduğu için namazı ifsâd eder. Yalnız tebessüm ise namazı bozmaz.",
      maliki: "Namazda kahkaha ile gülmek namazı bozar, fakat abdesti bozmaz. Kahkaha abdesti bozan hâllerden sayılmamıştır. Namazda kasıtlı olarak çok gülmek namazı bâtıl kılar. Az gülmek ise mekrûhtur, namazı bozmaz.",
      hanbeli: "Namazda kahkaha ile gülmek namazı bozar, fakat abdesti bozmaz. Kahkaha abdest bozucular arasında sayılmamıştır. Bu meselede Şâfiî ve Mâlikî mezhepleri ile aynı görüştedir. Yalnızca tebessüm namazı bozmaz."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 28",
    ilgiliMadde: { kisim: 1, maddeNo: 28 }
  },
  {
    id: "secde-sahv",
    baslik: "Sehiv (Yanılma) Secdesi",
    kategori: "ibadet",
    aciklama: "Namazda yapılan hatâ ve yanılmalar sebebiyle gereken sehiv secdesinin hükmü ve yapılış şekli",
    mezhepler: {
      hanefi: "Sehiv secdesi vâciptir. Namazın vâciplerinden birinin terk edilmesi veya geciktirilmesi hâlinde yapılır. Farzlardan birinin terki hâlinde namaz bâtıl olur, sehiv secdesi yetmez. Sehiv secdesi selâmdan sonra yapılır: Sağa selâm verildikten sonra iki secde yapılıp tekrar Tahiyyât okunarak selâm verilir.",
      safii: "Sehiv secdesi sünnettir, vâcip değildir. Namazın eb'âzından birinin terki, bir sünnetin kasten yapılması, bir fiilin şüpheyle yapılması hâllerinde sehiv secdesi yapılır. Selâmdan önce yapılması efdaldir. İki secde yapılır, ardından selâm verilir.",
      maliki: "Sehiv secdesi bazen vâcip, bazen sünnettir. Eksiklik sebebiyle yapılıyorsa selâmdan önce, fazlalık sebebiyle yapılıyorsa selâmdan sonra yapılır. Hem eksiklik hem fazlalık varsa selâmdan önce yapılması tercih edilir. İki secde ve Tahiyyât'tan sonra selâm verilir.",
      hanbeli: "Sehiv secdesi vâciptir. Fazlalık, eksiklik ve şüphe hâllerinde yapılır. Genellikle selâmdan sonra yapılır; ancak eksiklik hâlinde ve rek'at sayısında şüphe edip az olanı esas alındığında selâmdan önce yapılır. İki secde yapılıp selâm verilir."
    },
    kaynak: "Se'âdet-i Ebediyye, Kısım 1, Madde 19",
    ilgiliMadde: { kisim: 1, maddeNo: 19 }
  }
];
