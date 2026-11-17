/* Gizlilik bildirimi (/gizlilik). Metnin aslı eski sitedeki "Gizlilik Bildirimi"dir (eski/index.html);
   anlam değiştirilmedi, yalnız yeni düzene dizildi. Yeni eklenen kayıtlar sonradan buraya işlenecek. */

import { h } from '../cekirdek/dom.js';
import { cssYukle } from '../cekirdek/css.js';

export default {
  ad: 'gizlilik',
  baslik: 'Gizlilik bildirimi',

  async kur(kap, p, baglam) {
    await cssYukle('/css/sayfa.css');
    baglam.metaYaz({ aciklama: 'ilmihal.org gizlilik bildirimi: kişisel veri toplanmaz; okuma kayıtlarınız yalnız tarayıcınızda tutulur.' });

    const bolum = (id, baslik, ...icerik) => h('section.metin-grup', { 'aria-labelledby': id }, h('h2.baslik-4', { id }, baslik), icerik);
    const vurgu = metin => h('strong', metin);

    kap.append(h('article.kap.kap-okuma.metin-sayfa',
      h('header',
        h('p.ust-yazi', 'Bu site'),
        h('h1.baslik-2', 'Gizlilik bildirimi'),
        h('p.kunye.metin-tarih', 'Son güncelleme: 17 Kasım 2026')),

      bolum('gz-toplama', 'Veri toplama',
        h('p', 'ilmihal.org, kullanıcılarından herhangi bir kişisel veri ', vurgu('toplamaz'), ', sunucuya ', vurgu('göndermez'), ' ve üçüncü taraflarla ', vurgu('paylaşmaz'), '. Sitede üyelik sistemi, hesap oluşturma veya oturum açma mekanizması yoktur.')),

      bolum('gz-yerel', 'Yerel depolama',
        h('p', 'Aşağıdaki veriler yalnızca tarayıcınızda (localStorage) saklanır ve hiçbir sunucuya iletilmez:'),
        h('ul.metin-liste',
          h('li', 'Tema, yazı boyutu ve okuma ayarları (satır aralığı, hizalama, lügat işaretleri)'),
          h('li', 'Yer imleri, okunan maddeler, okuma geçmişi ve son okunan madde'),
          h('li', 'Notlar ve vurguladığınız cümleler'),
          h('li', 'Okuma planı: başlangıç günü, bitirdiğiniz maddeler ve uzun maddelerde kaldığınız yer'),
          h('li', 'Günlük okuma hedefi ve konu rehberlerindeki ilerlemeniz'),
          h('li', 'Bilgi testi puanı'),
          h('li', 'Sesli dinlemede seçtiğiniz hız ve kaldığınız yer'),
          h('li', 'Kitabın aslı panelini açık tutma tercihi ve kapattığınız duyurular'),
          h('li', 'Nemâz Vakitleri’nde seçtiğiniz yer'),
          h('li', 'Okunamayan bozuk bir kaydın, üstüne yazılmadan önce alınan yedeği')),
        h('p', 'Ayrıca sayfaların kaydırma konumu, sekmeyi kapatınca silinen oturum belleğinde (sessionStorage) tutulur.'),
        h('p', 'Çalışma Alanım’daki “Verilerinizi indirin” ile aldığınız yedek dosyası yalnız kendi cihazınıza iner; hiçbir yere gönderilmez. Bu verileri tarayıcınızın ayarlarından istediğiniz zaman silebilirsiniz.')),

      bolum('gz-cerez', 'Çerezler',
        h('p', 'ilmihal.org birinci taraf veya üçüncü taraf çerez ', vurgu('kullanmaz'), '.')),

      bolum('gz-analitik', 'Analitik ve izleme',
        h('p', 'Sitede Google Analytics, Facebook Pixel veya benzeri herhangi bir izleme/analitik aracı ', vurgu('bulunmamaktadır'), '.')),

      bolum('gz-konum', 'Konum verisi',
        h('p', 'Konum bilgisi yalnız Nemâz Vakitleri sayfasında “Konumumu kullan” düğmesine basarsanız tarayıcınızdan istenir. Bu veri yalnızca vakit hesabı için tarayıcınızda işlenir, herhangi bir sunucuya gönderilmez.')),

      bolum('gz-ucuncu', 'Üçüncü taraf hizmetler',
        h('p', 'Yazı tipleri ve tüm kod dosyaları sitenin kendi sunucusundan yüklenir; Google Fonts veya benzeri üçüncü taraf kaynaklar ve betikler kullanılmaz. Şu durumlarda kitabın kendi dosyaları Hakîkat Kitâbevi’nin sitesinden (hakikatkitabevi.net) gelir:'),
        h('ul.metin-liste',
          h('li', 'Sesli dinlemeyi başlattığınızda ses dosyaları doğrudan hakikatkitabevi.net’ten yüklenir.'),
          h('li', 'Okuyucudaki “Kitabın Aslı” panelinde kitabın PDF’i, ilmihal.org sunucusu aracılığıyla hakikatkitabevi.net’ten alınır.'),
          h('li', 'Dizinlerdeki sahîfe numaralarına ya da “PDF’i yeni sekmede açın” bağlantısına bastığınızda kitabın PDF’i doğrudan hakikatkitabevi.net’ten açılır.')),
        h('p', 'Bu hizmetlerin kendi gizlilik politikaları geçerlidir. Arama kutusuna yazdıklarınız hiçbir sunucuya gönderilmez; arama tamamen tarayıcınızda yapılır.'),
        h('p', 'Site Vercel üzerinde barındırılır; her web sunucusu gibi Vercel de gelen isteklerin kayıtlarını (IP adresi, zaman) tutabilir.')),

      bolum('gz-iletisim', 'İletişim',
        h('p', 'Gizlilikle ilgili sorularınız için ', h('a', { href: 'mailto:info@ilmihal.org' }, 'info@ilmihal.org'), ' adresine yazabilirsiniz.'))));
  }
};
