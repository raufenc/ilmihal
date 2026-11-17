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
        h('p.kunye.metin-tarih', 'Son güncelleme: 19 Ekim 2026')),

      bolum('gz-toplama', 'Veri toplama',
        h('p', 'ilmihal.org, kullanıcılarından herhangi bir kişisel veri ', vurgu('toplamaz'), ', sunucuya ', vurgu('göndermez'), ' ve üçüncü taraflarla ', vurgu('paylaşmaz'), '. Sitede üyelik sistemi, hesap oluşturma veya oturum açma mekanizması yoktur.')),

      bolum('gz-yerel', 'Yerel depolama',
        h('p', 'Aşağıdaki veriler yalnızca tarayıcınızda (localStorage) saklanır ve hiçbir sunucuya iletilmez:'),
        h('ul.metin-liste',
          h('li', 'Tema ve okuma ayarları (yazı boyutu, satır aralığı, hizalama)'),
          h('li', 'Son okunan madde, okunan maddeler ve okuma ilerlemesi'),
          h('li', 'Okuma planı, bitirdiğiniz maddeler ve uzun maddelerde kaldığınız yer'),
          h('li', 'Yer imleri, notlar ve vurguladığınız cümleler'),
          h('li', 'Sesli dinlemede kaldığınız yer'),
          h('li', 'Bilgi testi sonuçları')),
        h('p', 'Bu verileri tarayıcınızın ayarlarından istediğiniz zaman silebilirsiniz.')),

      bolum('gz-cerez', 'Çerezler',
        h('p', 'ilmihal.org birinci taraf veya üçüncü taraf çerez ', vurgu('kullanmaz'), '.')),

      bolum('gz-analitik', 'Analitik ve izleme',
        h('p', 'Sitede Google Analytics, Facebook Pixel veya benzeri herhangi bir izleme/analitik aracı ', vurgu('bulunmamaktadır'), '.')),

      bolum('gz-konum', 'Konum verisi',
        h('p', 'Nemâz vakitleri hesaplaması için konum bilgisi kullanılabilir. Bu veri yalnızca tarayıcınızda işlenir, herhangi bir sunucuya gönderilmez ve saklanmaz.')),

      bolum('gz-ucuncu', 'Üçüncü taraf hizmetler',
        h('p', 'Yazı tipleri ve tüm kod dosyaları sitenin kendi sunucusundan yüklenir; Google Fonts veya benzeri üçüncü taraf kaynaklar kullanılmaz. Şu durumlarda tarayıcınız başka bir siteye bağlanır:'),
        h('ul.metin-liste',
          h('li', 'Sesli dinlemeyi başlattığınızda ses dosyaları, PDF’i yeni sekmede açtığınızda kitabın PDF’i Hakîkat Kitâbevi’nin sitesinden (hakikatkitabevi.net) yüklenir. Okuyucudaki “Kitabın Aslı” panelinde ise aynı PDF, ilmihal.org sunucusu aracılığıyla parça parça yüklenir.'),
          h('li', 'Silsile Atlası sayfası harita karolarını Esri’nin (ArcGIS) sunucularından yükler.')),
        h('p', 'Bu hizmetlerin kendi gizlilik politikaları geçerlidir. Arama kutusuna yazdıklarınız hiçbir sunucuya gönderilmez; arama tamamen tarayıcınızda yapılır.')),

      bolum('gz-iletisim', 'İletişim',
        h('p', 'Gizlilikle ilgili sorularınız için ', h('a', { href: 'mailto:info@ilmihal.org' }, 'info@ilmihal.org'), ' adresine yazabilirsiniz.'))));
  }
};
