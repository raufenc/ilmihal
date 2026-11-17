/* ilmihal.org — giriş noktası: kabuğu kurar, yolları tanımlar, yönlendiriciyi başlatır.
   Her görünüm kendi dosyasındadır ve ilk kez gerektiğinde yüklenir. */

import { rotaEkle, baslat, git } from './cekirdek/yonlendirici.js';
import { h, $, $$, doldur, semse } from './cekirdek/dom.js';
import { temaOku, temaYaz, temaUygula, TEMALAR } from './cekirdek/tema.js';

/* ── Hata kaydı: sınamalar ve hata ayıklama için ── */
window.__hatalar = [];
addEventListener('error', e => window.__hatalar.push(String(e.message || e.error)));
addEventListener('unhandledrejection', e => { window.__hatalar.push('söz: ' + String(e.reason && e.reason.message || e.reason)); console.error('Yakalanmamış söz:', e.reason); });

/* ── Yollar (vercel.json'daki rewrites ile aynı küme) ── */
const g = ad => () => import(`./gorunum/${ad}.js`);
rotaEkle('/', g('giris'));
rotaEkle('/anasayfa', g('giris'));
rotaEkle('/icindekiler', g('fihrist'));
rotaEkle('/madde/:kisim/:no', g('okuyucu'));
rotaEkle('/arama/:sorgu*', g('arama'));
rotaEkle('/sozluk', g('lugat'));
rotaEkle('/sahislar', g('sahislar'));
rotaEkle('/sahis/:slug', g('sahis'));
rotaEkle('/fevaid', g('fevaid'));
rotaEkle('/icerik', g('fihrist'));   // eski sitede /icerik İçindekiler'di; paylaşılmış bağlantılar çalışsın
rotaEkle('/fevaid/tablolar/:id?', g('tablolar'));
rotaEkle('/fevaid/tablo/:id', g('tablolar'));
rotaEkle('/tablo/:id', g('tablolar'));
rotaEkle('/hukumler/:tur?', g('hukumler'));
rotaEkle('/ayet-hadis', g('ayet-hadis'));
rotaEkle('/rehberler', g('rehberler'));
rotaEkle('/gunun-bilgisi', g('gunun'));
rotaEkle('/quiz', g('test'));
rotaEkle('/calisma-alanim', g('calisma'));
rotaEkle('/hakkinda', g('hakkinda'));
rotaEkle('/gizlilik', g('gizlilik'));

/* ── Üst çubuk ── */
const ust = $('#ust');
const kaydiMi = () => ust.classList.toggle('kaydi', scrollY > 8);
addEventListener('scroll', kaydiMi, { passive: true });
kaydiMi();

function gezinmeIsaretle() {
  const yol = location.pathname;
  const kok = { '/madde': '/icindekiler', '/sahis': '/sahislar', '/hukumler': '/fevaid', '/ayet-hadis': '/fevaid', '/rehberler': '/fevaid', '/quiz': '/fevaid', '/gunun-bilgisi': '/fevaid', '/tablo': '/fevaid', '/calisma-alanim': '/fevaid' };
  let etkin = yol;
  for (const [on, hedef] of Object.entries(kok)) if (yol === on || yol.startsWith(on + '/')) etkin = hedef;
  for (const a of $$('.ust-gez a')) {
    const href = a.getAttribute('href');
    if (href === etkin || (href !== '/' && etkin.startsWith(href + '/'))) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}
addEventListener('ilmihal:gorunum', gezinmeIsaretle);

/* ── Tema seçici ── */
const dgTema = $('#dg-tema');
let temaKutu = null;
function temaKapat() {
  if (!temaKutu) return;
  temaKutu.remove(); temaKutu = null;
  dgTema.setAttribute('aria-expanded', 'false');
}
dgTema.addEventListener('click', () => {
  if (temaKutu) return temaKapat();
  const sec = () => { for (const b of $$('button', temaKutu)) b.setAttribute('aria-pressed', String(b.dataset.tema === temaOku())); };
  temaKutu = h('.tema-secici', { role: 'group', 'aria-label': 'Görünüm' },
    h('h2', 'Görünüm'),
    h('.tema-sira', TEMALAR.map(t => h('button', { type: 'button', dataset: { tema: t.ad }, onclick: () => { temaYaz(t.ad); sec(); } },
      h('i', { style: { background: { gunduz: '#f4efe4', sepya: '#ecdfc4', gece: '#0a0d14' }[t.ad] } }), t.etiket))));
  ust.appendChild(temaKutu);
  sec();
  dgTema.setAttribute('aria-expanded', 'true');
  temaKutu.querySelector('[aria-pressed="true"]')?.focus();
});
document.addEventListener('click', e => { if (temaKutu && !temaKutu.contains(e.target) && !dgTema.contains(e.target)) temaKapat(); });
temaUygula();

/* ── Menü (dar ekran): gezinmenin tamamı fihrist biçiminde ── */
const dgMenu = $('#dg-menu');
let menu = null;
function menuKapat() {
  if (!menu) return;
  menu.remove(); menu = null;
  document.documentElement.style.overflow = '';
  dgMenu.setAttribute('aria-expanded', 'false');
  dgMenu.focus();
}
dgMenu.addEventListener('click', () => {
  const grup = (baslik, baglar) => [
    h('h2.ust-yazi', baslik),
    h('ul.fihrist', baglar.map(([ad, href]) => h('li', { style: { display: 'block' } }, h('a.fihrist-ad', { href, style: { display: 'block', color: 'inherit', textDecoration: 'none' } }, ad))))
  ];
  menu = h('.menu', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Menü' },
    h('.menu-bas',
      h('a.marka', { href: '/' }, semse(), h('b', 'Se’âdet-i Ebediyye')),
      h('button.dugme-simge', { type: 'button', 'aria-label': 'Menüyü kapatın', onclick: menuKapat },
        h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', style: { width: '22px', height: '22px', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' } }, h('path', { d: 'M6 6l12 12M18 6 6 18' })))),
    grup('Kitap', [['Fihrist', '/icindekiler'], ['Kitapta arayın', '/arama'], ['Dinî lügat', '/sozluk'], ['Hâl tercemeleri', '/sahislar'], ['Çalışma alanım', '/calisma-alanim']]),
    grup('Fevâid', [['Fıkhî hükümler', '/hukumler'], ['Âyet-i kerîme ve hadîs-i şerîfler', '/ayet-hadis'], ['Tablolar', '/fevaid/tablolar'], ['Konu rehberleri', '/rehberler'], ['Günün suâli', '/gunun-bilgisi'], ['Bilgi testi', '/quiz']]),
    grup('Yer ve gök', [['Silsile-i Aliyye Atlası', '/silsile-atlasi/'], ['Nemâz vakitleri', '/namaz-vakitleri/']]),
    grup('Site', [['Hakkında', '/hakkinda'], ['Gizlilik', '/gizlilik']]));
  document.body.appendChild(menu);
  document.documentElement.style.overflow = 'hidden';
  dgMenu.setAttribute('aria-expanded', 'true');
  menu.querySelector('button').focus();
});
addEventListener('ilmihal:gorunum', () => { if (menu) { menu.remove(); menu = null; document.documentElement.style.overflow = ''; dgMenu.setAttribute('aria-expanded', 'false'); } temaKapat(); });

/* ── Hızlı arama: ilk açılışta yüklenir ── */
let hizliAc = null;
async function hizliArama(ilk = '') {
  try {
    if (!hizliAc) hizliAc = (await import('./bilesen/hizli-arama.js')).ac;
    hizliAc(ilk);
  } catch (e) {
    console.error('Hızlı arama yüklenemedi:', e);
    git('/arama' + (ilk ? '/' + encodeURIComponent(ilk) : ''));
  }
}
$('#dg-ara').addEventListener('click', () => hizliArama());

/* ── Genel klavye ── */
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (menu) menuKapat(); else temaKapat(); return; }
  const hedef = e.target;
  const yaziyor = hedef && (hedef.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(hedef.tagName));
  if (yaziyor || document.querySelector('dialog[open]')) return;
  if ((e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
    e.preventDefault();
    hizliArama();
  }
});

/* ── Başlat ── */
baslat({ kap: $('#icerik'), bulunamadiYukle: g('bulunamadi') });

/* ── Çevrimdışı çalışma ── */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => import('./cekirdek/sw-kayit.js').then(m => m.kaydet()).catch(e => console.warn('Service worker kaydedilemedi:', e)));
}
