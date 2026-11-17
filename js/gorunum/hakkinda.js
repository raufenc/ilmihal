/* Hakkında (/hakkinda). Metnin aslı eski sitedeki "Hakkında" sayfasıdır (eski/index.html); anlam değiştirilmedi,
   yalnız yeni düzene dizildi. Sayılar veriden gelir; veri inmezse cümle sayısız biçimiyle kalır. */

import { h, semse } from '../cekirdek/dom.js';
import { veri } from '../cekirdek/veri.js';
import { cssYukle } from '../cekirdek/css.js';
import { sayi, ad } from '../cekirdek/bicim.js';
import { okumaPlani } from '../cekirdek/okuma-plani.js';

const EPOSTA = 'info@ilmihal.org';
const GERI_BILDIRIM = [
  ['Öneri / İstek', 'Öneri ya da isteğinizi yazın'],
  ['Hata Bildirimi', 'Sitede gördüğünüz bir hatayı bildirin'],
  ['İçerik Hatası', 'Metinde, başlıkta ya da sahîfe numarasında gördüğünüz bir yanlışı bildirin']
];
const mailto = tur => `mailto:${EPOSTA}?subject=${encodeURIComponent('ilmihal.org geri bildirim: ' + tur)}`;

/* "30 günde, 90 günde, 180 günde veya bir yılda" — okuma planı süreleri koddan */
function sureListesi() {
  const adlar = okumaPlani.SURELER.map(s => s.gun === 365 ? 'bir yılda' : `${s.gun} günde`);
  return adlar.length > 1 ? adlar.slice(0, -1).join(', ') + ' veya ' + adlar[adlar.length - 1] : adlar.join('');
}

export default {
  ad: 'hakkinda',
  baslik: 'Hakkında',

  async kur(kap, p, baglam) {
    const sinyal = baglam.sinyal;
    const yut = soz => soz.catch(e => { if (e.name === 'AbortError') throw e; return null; });
    const [, fihrist, lugat, rehberler, ayetHadis] = await Promise.all([
      cssYukle('/css/sayfa.css'),
      yut(veri.fihrist({ sinyal })),
      yut(veri.lugatDizin({ sinyal })),
      yut(veri.rehberler({ sinyal })),
      yut(veri.ayetHadis({ sinyal }))
    ]);
    baglam.metaYaz({ aciklama: 'ilmihal.org nedir: Tam İlmihâl Se’âdet-i Ebediyye kitabının tamamı, aranabilir biçimde; kitabın aslı, okuma planı, lügat, hâl tercemeleri ve sesli dinleme.' });

    const kitap = fihrist ? fihrist.kitap : null;
    const maddeSayisi = fihrist ? fihrist.maddeler.length : null;
    const kisimSayisi = fihrist ? fihrist.kisimlar.length : null;
    const sessiz = fihrist ? fihrist.maddeler.filter(m => !m.ses).length : null;
    const n = (deger, yedek, bicim = x => sayi(x)) => (deger === null || deger === undefined ? yedek : bicim(deger));
    const bag = (href, metin) => h('a', { href }, metin);

    const bolum = (baslik, ...icerik) => h('section.metin-bolum', h('h3', baslik), icerik);
    const yazilar = [
      bolum('Kitabın tamamı, aranabilir şekilde',
        h('p', n(maddeSayisi, 'Bütün maddelerin', x => `${sayi(x)} maddenin`), ' tam metni, ', n(kisimSayisi, 'kısımlarıyla', x => x === 3 ? 'üç kısmıyla' : `${x} kısmıyla`), ' birlikte burada. İstediğiniz konuyu ', bag('/icindekiler', 'fihristte'), ' başlıktan bulabilir, isterseniz ', bag('/arama', 'tam metin aramasıyla'), ' kitabın herhangi bir yerinde geçen bir kelimeyi veya ifadeyi saniyeler içinde bulabilirsiniz. Aramayı her sayfada ', h('kbd', '/'), ' tuşuyla ya da üstteki düğmeyle açabilirsiniz; şapkalı veya şapkasız yazmanız aynı sonucu verir, tırnak içinde yazdığınız ifade aynen aranır.'),
        h('p', 'Site bağlantı olmadan da açılır; daha önce açtığınız maddeleri çevrimdışı okuyabilirsiniz.')),
      bolum('Kitabın aslı yanınızda',
        h('p', 'Okurken sahîfe numarasına ya da “Kitabın aslı” düğmesine bastığınızda kitabın o basılı sahîfesi, Hakîkat Kitâbevi’nin yayımladığı PDF’ten, metnin hemen yanındaki panelde açılır.')),
      bolum('Okurken',
        h('p', 'Cümleleri dört renkle vurgulayabilir, maddelere not ve yer imi ekleyebilirsiniz. Seçtiğiniz bir cümleyi künyesiyle birlikte kopyalayabilir ya da paylaşabilir, maddeyi yazdırabilirsiniz. Kitaptaki “… maddeye bakınız” atıfları bağlantıdır. Klavyeyle de okunabilir: J, K, +, −, B, L, F ve ? tuşları.')),
      bolum('Okuma planı',
        h('p', `Kitabı ${sureListesi()} baştan sona okumak için ana sayfadan ya da `, bag('/calisma-alanim', 'Çalışma Alanım'), '’dan bir plan kurabilirsiniz. Her günün kısmı maddelerin uzunluğuna göre hesaplanır; bitirdiğiniz maddeler işaretlenir, uzun bir maddede kaldığınız yer hatırlanır. Bu kayıtların hepsi yalnızca sizin tarayıcınızda tutulur; Çalışma Alanım’dan dosya olarak indirip sonra geri yükleyebilirsiniz.')),
      bolum('Konuya göre rehberler',
        h('p', 'Namaz, oruç, hac, zekât, iman, ahlâk, aile ve yeni Müslümanlar için hazırlanmış ', bag('/rehberler', n(rehberler && rehberler.rehberler.length, 'adım adım rehberler', x => `${sayi(x)} adım adım rehber`)), ' ile bir konuyu baştan sona takip edebilirsiniz. Her rehber bölümlere ayrılmış, bölümlerdeki maddeler sırasıyla okunacak şekilde düzenlenmiştir.')),
      bolum('Günün suâli',
        h('p', 'Her gün kitaptan bir suâl ', bag('/gunun-bilgisi', 'Günün Suâli'), ' sayfasında yer alır; cevabı, bağlantısı verilen maddededir. Suâli görsel bir kart olarak da paylaşabilirsiniz.')),
      bolum('Kitap içinde pratik sözlük',
        h('p', 'Bir maddeyi okurken anlamını bilmediğiniz kelimeler ', h('span.ornek-kelime', 'işaretlidir'), '. Kelimeye bastığınızda Osmanlıca yazılışı ve anlamı, geniş ekranda sayfanın kenarında bir not olarak, dar ekranda alttan açılan küçük bir sayfada görünür.')),
      bolum(n(lugat && lugat.sayi, 'Dinî lügat', x => `${sayi(x)} terimlik Dinî Lügat`),
        h('p', 'Ayrı bir ', bag('/sozluk', 'sözlük sayfasında'), ' ', n(lugat && lugat.sayi, 'dinî terimler', x => `${sayi(x)} dinî terim`), ' alfabetik olarak listelenmiştir. Osmanlıca yazılışları, alternatif imlâları ve bağlama göre değişen manaları kayıtlıdır.')),
      bolum('Âyet-i kerîme ve hadîs-i şerîf indeksi',
        h('p', 'Kitapta geçen ', ayetHadis ? `${sayi(ayetHadis.ayetler.length)} âyet-i kerîme ve ${sayi(ayetHadis.hadisler.length)} hadîs-i şerîf` : 'âyet-i kerîme ve hadîs-i şerîfler', ' ', bag('/ayet-hadis', 'ayrı bir indekste'), ' toplanmıştır. Her birinin kitapta geçtiği yer bağlantılıdır — tıklayınca maddenin tam o yerine gider.')),
      bolum('Hâl tercemeleri',
        h('p', 'Kitapta adı geçenlerin hâl tercemeleri ayrı bir ', bag('/sahislar', 'bölümde'), ' toplanmıştır. Her şahsın biyografisi, unvanı ve kitapta geçtiği maddelere doğrudan bağlantıları vardır.')),
      bolum('Tablolar ve diyagramlar',
        h('p', 'Kitaptaki bilgileri özetleyen ', bag('/fevaid/tablolar', 'tablolar ve akış şemaları'), ' konularına göre düzenlenmiştir. Her tablo, kaynağı olan maddeye bağlıdır.')),
      bolum('Sesli dinleme',
        h('p', 'Maddeleri, Hakîkat Kitâbevi’nin sahîfe sahîfe hazırladığı ses kayıtlarından dinleyebilirsiniz. Okuma, maddenin kayıttaki başladığı yerden açılır ve bittiği yerde durur. Kaydı duraklatabilir, 15 saniye ileri ya da geri alabilir, hızını ayarlayabilirsiniz; kaldığınız yer hatırlanır. Kayıtlar kitabın daha önceki bir baskısından yapıldığı için sonradan eklenen ',
          n(sessiz, 'bazı maddelerin', x => `${sayi(x)} maddenin`), ' sesi bulunmamaktadır.')),
      bolum('Silsile-i Aliyye Atlası ve Nemâz Vakitleri',
        h('p', 'Silsile-i aliyye büyüklerini ', bag('/silsile-atlasi/', 'üç boyutlu, etkileşimli bir haritada'), ' görebilirsiniz. Her büyüğün kabr-i şerîfinin bulunduğu şehir harita üzerinde işaretlenmiştir.'),
        h('p', bag('/namaz-vakitleri/', 'Nemâz Vakitleri'), ' sayfası, vakitleri kitabın ', bag('/madde/1/60', '60. maddesindeki'), ' usûlle hesaplar ve güneşin yolunu üç boyutlu gösterir; temkin 10 dakikadır. Bir takvimin yerini tutmaz.')),
      bolum('Her şey birbirine bağlı',
        h('p', 'Bir maddeyi açtığınızda ilgili şahısları, konuyla ilgili tabloları ve metindeki terimlerin anlamlarını hep bir arada görürsünüz. Herhangi bir sayfanın bağlantısını birine gönderebilirsiniz — doğrudan o madde, o şahıs veya o arama sonucu açılır.'))
    ];

    const kunyeSatir = (dt, ...dd) => [h('dt', dt), h('dd', dd)];
    const kunye = h('section.metin-bolum.kunye-blok', { 'aria-labelledby': 'hk-kunye' },
      h('h2.ust-yazi', { id: 'hk-kunye' }, 'Künye'),
      h('dl.cetvel.kunye-liste',
        kunyeSatir('Kitap', 'Tam İlmihâl ', kitap ? ad(kitap.ad) : 'Se’âdet-i Ebediyye'),
        kunyeSatir('Hazırlayan', 'Hüseyn Hilmi Işık hazretleri'),
        kunyeSatir('Kaynak', 'Se’âdet-i Ebediyye, Hakîkat Kitâbevi, 2026 baskısı'),
        kitap ? kunyeSatir('Sahîfe', h('span.sayi', sayi(kitap.sahifeSayisi))) : null,
        maddeSayisi ? kunyeSatir('Madde', h('span.sayi', sayi(maddeSayisi)), kisimSayisi ? `, ${kisimSayisi === 3 ? 'üç' : kisimSayisi} kısım` : '') : null,
        kitap && kitap.pdf ? kunyeSatir('Kitabın aslı', h('a', { href: kitap.pdf, target: '_blank', rel: 'noopener', dataset: { dis: '' } }, 'Hakîkat Kitâbevi’nin sitesinde PDF olarak'), h('span.gizli-yazi', ' (yeni sekmede açılır)')) : null,
        kunyeSatir('Son güncelleme', 'Kasım 2026')));

    kap.append(h('article.kap.kap-okuma.metin-sayfa',
      h('header',
        h('p.ust-yazi', 'Bu site'),
        h('h1.baslik-2', 'Hakkında'),
        h('p.giris-yazi', 'Se’âdet-i Ebediyye’yi tanıyanlar bilir: bu kitap bir kere okunup bırakılacak bir eser değildir. Bir mesele aklınıza düştüğünde açar, arar, bulur, tekrar okursunuz. Yıllar geçtikçe aynı satırlardan yeni şeyler anlarsınız.'),
        h('p', 'Bu site, o arayışı kolaylaştırmak için yapıldı. Hepsi bu.')),
      h('section.metin-grup', { 'aria-labelledby': 'hk-neler' }, h('h2.baslik-4', { id: 'hk-neler' }, 'Sitede neler var'), yazilar),
      h('section.metin-grup', { 'aria-labelledby': 'hk-yok' },
        h('h2.baslik-4', { id: 'hk-yok' }, 'Ne yok burada'),
        h('p', 'Yorum yok, tefsir yok, kendi aklımızdan bir şey yok. Kitaba bir harf eklenmedi, bir harf çıkarılmadı. Gece modu, sepya modu, telefon uyumluluğu gibi kolaylıklar dışında yapılan tek şey, kitaptaki bilgiyi olduğu gibi sunmak ve ulaşılabilir kılmaktır.'),
        h('p', 'Maksat, bu kıymetli esere hizmet etmektir. Kitabın yerini tutmaz; ama kitaba müracaatı kolaylaştırır.')),
      h('.ayrac', { 'aria-hidden': 'true' }, semse()),
      h('p.dua', 'Kusurlar bizden, istifade Allahü teâlâdandır.'),
      h('section.metin-grup', { 'aria-labelledby': 'hk-geri' },
        h('h2.baslik-4', { id: 'hk-geri' }, 'Geri bildirim'),
        h('p', 'Görüş, istek ve hata bildirimlerinizi ', h('a', { href: `mailto:${EPOSTA}` }, EPOSTA), ' adresine yazabilirsiniz. Aşağıdaki bağlantılar e-posta uygulamanızı konusu yazılmış olarak açar; site mesajı kendisi göndermez.'),
        h('ul.eposta-liste', GERI_BILDIRIM.map(([tur, aciklama]) => h('li', h('a', { href: mailto(tur) }, h('b', tur), h('span', aciklama)))))),
      kunye));
  }
};
