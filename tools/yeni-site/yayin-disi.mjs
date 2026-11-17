/* Yayın dışı listesi: kitaptan sonradan derlenmiş veriden, denetimde kitaba aykırı ya da dayanaksız
   çıkan ve DÜZELTİLENE KADAR yayından çekilen kayıtlar. Rauf'un onayıyla (17 Kas 2026).

   Kaynak dosyalar (data.js, sozluk-data.js, ayet-hadis.js …) DEĞİŞTİRİLMEZ; süzme üretim sırasında
   yapılır: veri-uret.mjs (kaynaklariOku) ve arama-uret.mjs bu dosyayı uygular. Böylece çekilen kayıt
   veri/ ve veri-arama/ altına hiç yazılmaz; dizinler, sayılar, arama ve site haritası kendiliğinden uyar.

   Bir kaydı geri açmak: düzeltilip kitabın metniyle yeniden denetlendikten ve Rauf (ya da bir hoca)
   baktıktan sonra buradan silinir. Gerekçeler: tools/yeni-site/denetim/*.md

   Fıkhî hükümler dizini ayrı anahtarla kapalıdır: js/cekirdek/ayar.js → HUKUMLER_ACIK. */

export const YAYIN_DISI = {
  /* Tablolar (denetim: tablolar-1.md, tablolar-2.md). İlk 14: kitaba aykırı satır ya da değiştirilmiş
     "Kitaptan" alıntısı; son 4: kitapta dayanağı bulunmayan satır. */
  tablolar: [
    'abdest_adimlari', 'necaset_turleri', 'sularin_hukmu', 'namaz_farzlari', 'namaz_bozanlar', 'oruc_turleri',
    'haram_helal_hayvanlar', 'hadis_cesitleri', 'nafile_namazlar', 'sut_cocuklugu_haller', 'tutun_gorusleri',
    'israf_bes_bahs', 'efali_mukellefin', 'namaz_mekruhlari',
    'haram_helal_yiyecekler', 'iman_sartlari', 'oruc_bozanlar', 'fikh_dort_kisim',
  ],

  /* Günün suâli (denetim: sualler.md). Numaralar gununSorusuData içinde 1'den başlayan sıradır.
     itiraz: kitabın reddettiği itirazlar (kartta cevapsız, kitabın sözü gibi duruyordu);
     baglamsiz: öncesine bağlı olduğu için tek başına anlaşılmayan cümleler. */
  gununSualleri: {
    itiraz: [6, 18, 20, 21, 48, 54, 60, 62, 73, 78, 86, 87, 88, 111, 123],
    baglamsiz: [16, 17, 23, 29, 37, 38, 40, 46, 50, 51, 61, 74, 84, 85, 89, 118, 132, 139],
    // Sıra kayarsa yanlış kayıt çekilmesin diye demirler: [numara, sorunun başı]
    demir: [[6, 'Evliyâ-i kirâmdan'], [51, 'Kusûrlu olan, günâhı olan'], [123, 'Müslimânları sevmemiz, vehhâbîleri']],
    beklenenSayi: 155,
  },

  /* Hadîs-i şerîf dizini (denetim: tanim-ayet-hadis.md). Bu iki kayıt hadîs değil, hadîsin açıklamasıdır
     (Hadîka'nın ve Abdülhak-ı Dehlevî'nin sözü). Metnin başıyla tanınır. */
  hadisDegil: [
    'Günâhlardan sakınmayan müslimânların ibâdetleri sahîh olsa da kabûl ol',
    'Bu haber, farz borcu olanların, sünnetlerinin ve nâfilelerinin kabûl o',
  ],
  /* Hadîslerin "kaynak" alanı güvenilmez: incelenen 64 kaynağın 19'u bir önceki hadîsten taşınmış. */
  hadisKaynagiGizli: true,

  /* Arama kutusundaki "Bu suâlin cevabı" özetleri sitenin yazdığı cümlelerdir; 4'ü kitaba aykırı,
     1'i dayanaksız çıktı. Özet yayına çıkmaz; yalnız suâlin ilgili maddesi gösterilir. */
  cevapOzetleriGizli: true,

  /* Lügat (denetim: lugat.md). Lügat kitabın parçası değildir; bu kayıtların açıklaması kitaba aykırı:
     1234/1235 ay sırası ters, 7439 Nefs-i nâtıka, 9864 Züyûf, 5948 Mevzû hadîs. */
  lugatKayitlari: [1234, 1235, 7439, 9864, 5948],
  /* Arap harfli yazımı bozuk kayıtlar (lâm-elif ters, tümden ters dizilmiş, eksik). Kayıt kalır,
     yalnız Arap harfli yazımı gösterilmez. */
  lugatArapYazimi: [171, 270, 277, 278, 307, 325, 581, 607, 610, 806, 849, 897, 1067, 1068, 1088, 1234, 1235, 1307, 1343,
    1764, 2061, 2159, 2236, 2456, 3077, 3222, 3317, 3420, 3421, 3830, 4038, 4041, 4271, 4274, 4283, 4441, 4567, 4746, 4751,
    4768, 4798, 5038, 5043, 5073, 5074, 5078, 5083, 5085, 5146, 5147, 5157, 5495, 5685, 5922, 6037, 6699, 6863, 7204, 7549,
    7788, 7896, 8530, 8949, 9208, 9546, 9555, 9556, 9592],

  /* Okuyucudaki otomatik kenar notları (denetim: lugat.md, betik-lugat/kural-olc.py).
     Bu biçimler kitapta başka anlamda geçtiği hâlde yanlış lügat kaydına bağlanıyordu
     (zemân → "kefil olma", kadın → KADI, Ebû Bekr → BİKR, mest → "sarhoş" …). Küçük harfli yüzey biçimi. */
  kenarNotuKaraBicim: new RegExp('^(' + [
    'zemân\\p{L}*', 'geri\\p{L}*', 'fazla\\p{L}*', 'kadın\\p{L}*', 'altı(nda|na|ndan|ndaki)', 'cild\\p{L}*', 'madde\\p{L}*',
    'dil', 'dili\\p{L}*', 'dile\\p{L}*', 'dilin\\p{L}*', 'dilden', 'aynı\\p{L}*', 'ayna\\p{L}*', 'ayın\\p{L}*', 'yedi\\p{L}*',
    'bekr\\p{L}*', 'ziyâde\\p{L}*', 'sebze\\p{L}*', 'fâtiha\\p{L}*', 'deve\\p{L}*', 'hâle', 'sıra\\p{L}*', 'zor\\p{L}*',
    'mest\\p{L}*', 'eyle', 'hanîfe', 'çâre\\p{L}*', 'kes', 'kese', 'kesin', 'harekete', 'karn\\p{L}*', 'talebe\\p{L}*',
    'neye', 'neyi', 'neyin', 'ağırlık\\p{L}*', 'hakk\\p{L}*', 'beşer', 'hat', 'aşmak', 'arşın', 'pul\\p{L}*',
    'dem', 'deme', 'demde', 'demler', 'hüdâ', 'artık', 'saf', 'ah', 'basar\\p{L}*',
    // denetimin grup bulgularında olup yukarıdaki ölçüm listesinde bulunmayanlar
    'araba\\p{L}*', 'çekirdek\\p{L}*', 'çeki',
  ].join('|') + ')$', 'u'),
  /* Açıklaması yalnız "Bkz. …" ya da boş olan kayıt kenar notu olarak gösterilmez. */
  kenarNotuYalnizBkz: /^[^\p{L}\p{N}]*\(?Bkz\.?[^)]*\)?[^\p{L}\p{N}]*$|^[^\p{L}\p{N}]*$/u,
};

/** Kenar notu üretiminde bu (yüzey biçimi, lügat kaydı) eşleşmesi atlanır mı? lower: küçük harfli, kaçışsız biçim. */
export function kenarNotuAtla(lower, entry) {
  return YAYIN_DISI.kenarNotuKaraBicim.test(lower) || YAYIN_DISI.kenarNotuYalnizBkz.test(String(entry.a ?? ''));
}

const hata = m => { throw new Error('yayin-disi: ' + m); };

/** Ham dizileri süzer. Girdi nesnesindeki alanlar (varsa) yerinde değiştirilir; özet döner.
    tablolar: tablolarData · gunun: gununSorusuData · ayetHadis: ayetHadisData · sozluk: sozlukData · soruMadde: soruMaddeMap */
export function yayinDisiUygula(K) {
  const ozet = {};
  if (K.tablolar) {
    const cekilen = new Set(YAYIN_DISI.tablolar);
    const var_ = new Set(K.tablolar.map(t => t.id));
    for (const id of cekilen) if (!var_.has(id)) hata('tablo bulunamadı: ' + id);
    K.geriCekilenTablolar = K.tablolar.filter(t => cekilen.has(t.id)).map(t => ({ id: t.id, baslik: t.baslik }));
    K.tablolar = K.tablolar.filter(t => !cekilen.has(t.id));
    ozet.tablo = K.geriCekilenTablolar.length;
  }
  if (K.gunun) {
    const g = YAYIN_DISI.gununSualleri;
    if (K.gunun.length !== g.beklenenSayi) hata(`günün suâli sayısı ${K.gunun.length}, beklenen ${g.beklenenSayi}; numaralar kaymış olabilir`);
    for (const [no, bas] of g.demir) if (!K.gunun[no - 1].soru.startsWith(bas)) hata(`günün suâli ${no} "${bas}" ile başlamıyor`);
    const cekilen = new Set([...g.itiraz, ...g.baglamsiz]);
    if (cekilen.size !== g.itiraz.length + g.baglamsiz.length) hata('günün suâli listelerinde yinelenen numara');
    K.gunun = K.gunun.filter((_, i) => !cekilen.has(i + 1));
    ozet.gununSuali = cekilen.size;
  }
  if (K.ayetHadis) {
    const once = K.ayetHadis.hadisler.length;
    for (const bas of YAYIN_DISI.hadisDegil) {
      const n = K.ayetHadis.hadisler.filter(h => h.metin.startsWith(bas)).length;
      if (n !== 1) hata(`hadîs dışı kayıt ${n} kez bulundu: ${bas}`);
    }
    let hadisler = K.ayetHadis.hadisler.filter(h => !YAYIN_DISI.hadisDegil.some(bas => h.metin.startsWith(bas)));
    if (YAYIN_DISI.hadisKaynagiGizli) hadisler = hadisler.map(h => ({ ...h, kaynak: null }));
    K.ayetHadis = { ...K.ayetHadis, hadisler };
    ozet.hadis = once - hadisler.length;
  }
  if (K.sozluk) {
    const cekilen = new Set(YAYIN_DISI.lugatKayitlari), yazimsiz = new Set(YAYIN_DISI.lugatArapYazimi);
    const var_ = new Set(K.sozluk.map(e => e.i));
    for (const id of [...cekilen, ...yazimsiz]) if (!var_.has(id)) hata('lügat kaydı bulunamadı: ' + id);
    K.sozluk = K.sozluk.filter(e => !cekilen.has(e.i)).map(e => (yazimsiz.has(e.i) ? { ...e, o: null } : e));
    ozet.lugat = cekilen.size;
    ozet.lugatArapYazimi = [...yazimsiz].filter(id => !cekilen.has(id)).length;
  }
  if (K.soruMadde && YAYIN_DISI.cevapOzetleriGizli) {
    ozet.cevapOzeti = K.soruMadde.filter(s => s.cevapOzet).length;
    K.soruMadde = K.soruMadde.map(s => ({ ...s, cevapOzet: null }));
  }
  return ozet;
}
