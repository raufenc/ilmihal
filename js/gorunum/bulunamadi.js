/* Eşleşmeyen yol. */
import { h } from '../cekirdek/dom.js';

export default {
  ad: 'bulunamadi',
  baslik: 'Sahîfe bulunamadı',
  async kur(kap, p, baglam) {
    baglam.metaYaz({ robots: 'noindex' });
    kap.append(h('.kap.kap-dar', { style: { paddingBlock: 'var(--a-9)' } },
      h('p.ust-yazi.surh', 'Bulunamadı'),
      h('h1.baslik-2', { style: { marginTop: 'var(--a-3)' } }, 'Aradığınız sahîfe burada değil'),
      h('p.giris-yazi', { style: { marginTop: 'var(--a-4)' } }, 'Adres değişmiş ya da yanlış yazılmış olabilir. Fihristten ya da aramadan devam edebilirsiniz.'),
      h('.sira', { style: { marginTop: 'var(--a-6)' } },
        h('a.dugme.dugme-ana', { href: '/icindekiler' }, 'Fihrist'),
        h('a.dugme', { href: '/arama' }, 'Kitapta arayın'),
        h('a.dugme', { href: '/' }, 'Ana sayfa'))));
  }
};
