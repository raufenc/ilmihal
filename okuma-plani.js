// ===== OKUMA PLANI (HATİM) =====
// Kitabı seçilen sürede baştan sona okuma planı. Günlük bölümler maddelerin harf
// sayısına göre hesaplanır (ozetler.js → window.maddeUzunluklari); uzun bir madde
// birkaç güne yayılabilir. Bütün kayıtlar yalnızca tarayıcıda (localStorage) tutulur:
//   ilmihal-hatim       { baslangic: 'YYYY-MM-DD', gun: 90, hatimSayisi: 0 }
//   ilmihal-bitirilen   ['1/1', '1/2', …]  bu hatimde bitirilen maddeler
//   ilmihal-okuma-yeri  { '1/60': 0.42, … } yarım kalan maddelerde kalınan yer
(function() {
  var PLAN_ANAHTARI = 'ilmihal-hatim';
  var BITEN_ANAHTARI = 'ilmihal-bitirilen';
  var YER_ANAHTARI = 'ilmihal-okuma-yeri';
  var KUTLAMA_ANAHTARI = 'ilmihal-hatim-kutlama';
  var DAKIKADA_HARF = 1100;
  var SURELER = [{ gun: 30, ad: '30 gün' }, { gun: 90, ad: '90 gün' }, { gun: 180, ad: '180 gün' }, { gun: 365, ad: '1 yıl' }];

  function oku(k, varsayilan) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? varsayilan : v; } catch (e) { return varsayilan; }
  }
  function yaz(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function yerelGun(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function gunFarki(a, b) {
    var x = a.split('-').map(Number), y = b.split('-').map(Number);
    return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 86400000);
  }
  function tarihYazi(s) {
    var p = s.split('-').map(Number);
    try { return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }); } catch (e) { return s; }
  }
  function sureYazi(dk) {
    dk = Math.max(1, Math.round(dk));
    if (dk < 60) return dk + ' dk';
    var s = Math.floor(dk / 60), d = dk % 60;
    return s + ' saat' + (d >= 5 ? ' ' + d + ' dk' : '');
  }
  function kacis(t) { return typeof escapeHtml === 'function' ? escapeHtml(t) : String(t); }

  function sira() { return (window.tocData || []).map(function(m) { return m.kisim + '/' + m.madde_no; }); }
  function meta(key) {
    var p = key.split('/');
    return (window.tocData || []).find(function(m) { return m.kisim === +p[0] && m.madde_no === +p[1]; });
  }
  function uzunluk(key) { return (window.maddeUzunluklari && window.maddeUzunluklari[key]) || 4000; }
  function toplamHarf() { return sira().reduce(function(t, k) { return t + uzunluk(k); }, 0); }

  function plan() { return oku(PLAN_ANAHTARI, null); }
  function bitenler() { return oku(BITEN_ANAHTARI, []); }
  function bittiMi(key) { return bitenler().indexOf(key) !== -1; }

  // Planın bugünkü durumu
  function durum() {
    var p = plan();
    var keys = sira();
    var biten = new Set(bitenler());
    var toplam = toplamHarf();
    var bitenHarf = keys.reduce(function(t, k) { return t + (biten.has(k) ? uzunluk(k) : 0); }, 0);
    var d = { aktif: !!p, plan: p, toplam: toplam, bitenHarf: bitenHarf, bitenSayi: keys.filter(function(k) { return biten.has(k); }).length, maddeSayi: keys.length };
    var oran = toplam ? bitenHarf / toplam * 100 : 0;
    d.yuzde = Math.floor(oran);
    d.yuzdeYazi = oran > 0 && oran < 10 ? oran.toFixed(1).replace('.', ',') : String(d.yuzde);
    d.hatimBitti = keys.length > 0 && d.bitenSayi === keys.length;
    d.siradaki = keys.find(function(k) { return !biten.has(k); }) || null;
    if (!p) return d;
    var gunNo = Math.max(1, gunFarki(p.baslangic, yerelGun()) + 1);
    d.gunNo = gunNo;
    d.gunSayisi = p.gun;
    var bugunSonu = toplam * Math.min(gunNo, p.gun) / p.gun;
    var bugunBasi = toplam * Math.min(gunNo - 1, p.gun) / p.gun;
    d.beklenen = bugunSonu;
    // Bugünün kısmı gün bitmeden borç sayılmaz: geride olmak dünkü hedefe, önde olmak bugünkü hedefe göre ölçülür
    d.geriDk = Math.max(0, bugunBasi - bitenHarf) / DAKIKADA_HARF;
    d.ondeDk = Math.max(0, bitenHarf - bugunSonu) / DAKIKADA_HARF;
    d.bugunKalanDk = Math.max(0, bugunSonu - bitenHarf) / DAKIKADA_HARF;
    d.gunlukDk = toplam / p.gun / DAKIKADA_HARF;
    // bugünün harf aralığına düşen maddeler
    var bas = 0;
    d.bugunkuler = [];
    keys.forEach(function(k) {
      var son = bas + uzunluk(k);
      if (son > bugunBasi && bas < bugunSonu) d.bugunkuler.push({ key: k, devam: bas < bugunBasi, bitti: biten.has(k) });
      bas = son;
    });
    d.sureDoldu = gunNo > p.gun;
    return d;
  }

  // ---- Bildirim ----
  function bildir(metin, eylem) {
    if (typeof window.bildirimGoster === 'function') window.bildirimGoster(metin, eylem);
  }

  // ---- Kayıt işlemleri ----
  function planKur(gun) {
    var p = plan() || { hatimSayisi: 0 };
    p.baslangic = yerelGun();
    p.gun = gun;
    yaz(PLAN_ANAHTARI, p);
    hepsiniTazele();
    var d = durum();
    bildir('Okuma planı kuruldu: ' + gun + ' günde hatim, günde yaklaşık ' + sureYazi(d.gunlukDk) + '.');
  }

  function planSil() {
    if (!confirm('Okuma planı silinsin mi? Bitirdiğiniz maddeler kayıtlı kalır.')) return;
    try { localStorage.removeItem(PLAN_ANAHTARI); } catch (e) {}
    hepsiniTazele();
  }

  function yeniHatim() {
    var p = plan() || { hatimSayisi: 0 };
    if (durum().hatimBitti) p.hatimSayisi = (p.hatimSayisi || 0) + 1;
    p.baslangic = yerelGun();
    p.gun = p.gun || 90;
    yaz(PLAN_ANAHTARI, p);
    yaz(BITEN_ANAHTARI, []);
    yaz(YER_ANAHTARI, {});
    hepsiniTazele();
    bildir('Yeni hatim başladı. Allahü teâlâ kolaylık versin.');
  }

  function maddeBitir(key, bitti, sessiz) {
    var liste = bitenler();
    var i = liste.indexOf(key);
    var onceki = durum();
    if (bitti && i === -1) liste.push(key);
    if (!bitti && i !== -1) liste.splice(i, 1);
    yaz(BITEN_ANAHTARI, liste);
    if (bitti) {
      var yerler = oku(YER_ANAHTARI, {});
      if (yerler[key] != null) { delete yerler[key]; yaz(YER_ANAHTARI, yerler); }
    }
    hepsiniTazele();
    if (!bitti || sessiz) return;
    var d = durum();
    if (d.hatimBitti && !onceki.hatimBitti) {
      bildir('Elhamdülillah, Se’âdet-i Ebediyye\'yi baştan sona okudunuz. Allahü teâlâ okuduklarınızla amel etmeyi nasîb eylesin.');
      return;
    }
    if (d.aktif && onceki.bugunKalanDk > 0 && d.bugunKalanDk <= 0 && oku(KUTLAMA_ANAHTARI, '') !== yerelGun()) {
      yaz(KUTLAMA_ANAHTARI, yerelGun());
      bildir('Bugünkü kısım tamamlandı. Allahü teâlâ okuduklarınızla amel etmeyi nasîb eylesin.');
    }
  }

  // ---- Ana sayfa kartı ----
  function maddeBaglantisi(key, etiket) {
    var p = key.split('/');
    var m = meta(key);
    return '<a href="/madde/' + key + '" onclick="openMadde(' + p[0] + ',' + p[1] + ');return false">' + (etiket || (m ? m.madde_no + ' — ' + kacis(m.baslik) : key)) + '</a>';
  }

  function sureSecimiHTML(seciliGun) {
    var toplamDk = toplamHarf() / DAKIKADA_HARF;
    return '<div class="plan-sureler" role="group" aria-label="Plan süresi">' + SURELER.map(function(s) {
      return '<button type="button" class="plan-sure' + (s.gun === seciliGun ? ' secili' : '') + '" onclick="okumaPlani.kur(' + s.gun + ')">' +
        '<strong>' + s.ad + '</strong><span>günde ≈ ' + sureYazi(toplamDk / s.gun) + '</span></button>';
    }).join('') + '</div>';
  }

  function ilerlemeHTML(d) {
    return '<div class="plan-ilerleme" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + d.yuzde + '" aria-label="Hatim ilerlemesi">' +
      '<span style="width:' + d.yuzde + '%"></span></div>' +
      '<p class="plan-ilerleme-yazi">%' + d.yuzdeYazi + ' · ' + d.bitenSayi + ' / ' + d.maddeSayi + ' madde bitirildi</p>';
  }

  function durumYazisi(d) {
    if (d.sureDoldu) return d.hatimBitti ? '' : 'Plan süresi doldu; kalan maddelerle devam edebilirsiniz.';
    if (d.geriDk >= 3) return 'Plana göre ≈ ' + sureYazi(d.geriDk) + ' geridesiniz.';
    if (d.ondeDk >= 3) return 'Plana göre ≈ ' + sureYazi(d.ondeDk) + ' öndesiniz.';
    return 'Plana uygun gidiyorsunuz.';
  }

  function kartHTML() {
    var d = durum();
    var ust = '<div class="plan-ust"><span class="plan-etiket">Okuma Planı</span>';
    if (d.hatimBitti) {
      var sayi = ((d.plan && d.plan.hatimSayisi) || 0) + 1;
      return ust + '</div><h3 class="plan-baslik">Elhamdülillah, kitabı baştan sona okudunuz</h3>' +
        '<p class="plan-aciklama">' + sayi + '. hatminiz tamamlandı. Allahü teâlâ okuduklarınızla amel etmeyi nasîb eylesin.</p>' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="okumaPlani.yeniHatim()">Yeni Bir Hatime Başlayın</button>';
    }
    if (!d.aktif) {
      return ust + '</div><h3 class="plan-baslik">Kitabı baştan sona okuyun</h3>' +
        '<p class="plan-aciklama">Bir süre seçin; her gün okunacak kısım, maddelerin uzunluğuna göre sizin için hesaplansın.' +
        (d.bitenSayi ? ' Bitirdiğiniz ' + d.bitenSayi + ' madde plana sayılır.' : '') + '</p>' + sureSecimiHTML(0);
    }
    var bugun = d.bugunkuler.filter(function(x) { return !x.bitti; });
    // Bugünkü kısım: bitmemiş ilk maddeler öne, liste kısa tutulur
    var GOSTER = 5;
    var gosterilen = d.bugunkuler.slice(0, GOSTER);
    var kalan = d.bugunkuler.length - gosterilen.length;
    var bugunListe = d.bugunkuler.length ? '<ol class="plan-bugun">' + gosterilen.map(function(x) {
      return '<li class="' + (x.bitti ? 'bitti' : '') + '">' + maddeBaglantisi(x.key) + (x.devam ? ' <span class="plan-devam">(devamı)</span>' : '') + '</li>';
    }).join('') + (kalan > 0 ? '<li class="plan-dahasi">ve ' + kalan + ' madde daha</li>' : '') + '</ol>' : '';
    var siradaki = d.siradaki ? d.siradaki.split('/') : null;
    return ust + '<span class="plan-gun">' + Math.min(d.gunNo, d.gunSayisi) + '. gün / ' + d.gunSayisi + '</span></div>' +
      '<h3 class="plan-baslik">' + (d.bugunKalanDk > 0 ? 'Bugün ≈ ' + sureYazi(d.bugunKalanDk) + ' okuma kaldı' : 'Bugünkü kısım tamam') + '</h3>' +
      '<p class="plan-aciklama">' + durumYazisi(d) + '</p>' +
      ilerlemeHTML(d) +
      (bugunListe ? '<div class="plan-bugun-bas">Bugünkü kısım</div>' + bugunListe : '') +
      '<div class="plan-eylemler">' +
        (siradaki ? '<button type="button" class="btn btn-primary btn-sm" onclick="openMadde(' + siradaki[0] + ',' + siradaki[1] + ')">' + (d.bitenSayi === 0 ? 'Okumaya Başlayın' : (bugun.length || d.bugunKalanDk > 0 ? 'Okumaya Devam Edin' : 'Sıradaki Maddeyi Okuyun')) + '</button>' : '') +
        '<a class="plan-ayrinti" href="/calisma-alanim" onclick="navigateTo(\'calisma-alanim\');return false">Plan ayrıntıları</a>' +
      '</div>';
  }

  function kartiTazele() {
    var el = document.getElementById('okuma-plani-karti');
    if (!el || !window.tocData) return;
    el.innerHTML = kartHTML();
  }

  // ---- Çalışma Alanım bölümü ----
  function takvimHTML(d) {
    var keys = sira();
    var biten = new Set(bitenler());
    var toplam = d.toplam;
    var gunler = [];
    for (var g = 1; g <= d.gunSayisi; g++) {
      // bu günün harf aralığına değen her madde
      var gb = toplam * (g - 1) / d.gunSayisi;
      var gunSonu = toplam * g / d.gunSayisi;
      var liste = [];
      var c = 0, ilk = null, son = null;
      for (var i = 0; i < keys.length; i++) {
        var mb = c, ms = c + uzunluk(keys[i]);
        if (ms > gb && mb < gunSonu) { if (!ilk) ilk = keys[i]; son = keys[i]; liste.push(keys[i]); }
        c = ms;
        if (mb >= gunSonu) break;
      }
      gunler.push({ g: g, ilk: ilk, son: son, bitti: liste.length > 0 && liste.every(function(k) { return biten.has(k); }) });
    }
    var p = d.plan;
    var bugunIdx = Math.min(d.gunNo, d.gunSayisi);
    var pb = p.baslangic.split('-').map(Number);
    return '<details class="plan-takvim"><summary>Plan takvimi (' + d.gunSayisi + ' gün)</summary><ol>' + gunler.map(function(x) {
      var tarih = new Date(pb[0], pb[1] - 1, pb[2] + x.g - 1);
      var m1 = x.ilk ? meta(x.ilk) : null, m2 = x.son ? meta(x.son) : null;
      var aralik = m1 ? (m1.kisim + '/' + m1.madde_no + (x.son !== x.ilk && m2 ? ' – ' + m2.kisim + '/' + m2.madde_no : '')) : '';
      return '<li class="' + (x.bitti ? 'bitti ' : '') + (x.g === bugunIdx ? 'bugun' : '') + '"><span class="tk-gun">' + x.g + '. gün</span>' +
        '<span class="tk-tarih">' + tarihYazi(yerelGun(tarih)) + '</span><span class="tk-madde">' + aralik + (m1 ? ' · ' + kacis(m1.baslik) : '') + '</span></li>';
    }).join('') + '</ol></details>';
  }

  function calismaHTML() {
    var d = durum();
    var html = '<section class="plan-calisma">';
    if (!d.aktif && !d.hatimBitti) {
      html += '<div class="okuma-plani-karti ic">' + kartHTML() + '</div>';
      return html + '</section>';
    }
    html += '<div class="okuma-plani-karti ic">' + kartHTML() + '</div>';
    if (d.aktif) {
      html += '<div class="plan-ayar"><span>Süreyi değiştirin (bugünden başlar):</span>' + sureSecimiHTML(d.gunSayisi) + '</div>';
      html += takvimHTML(d);
      html += '<div class="plan-alt"><button type="button" class="plan-link" onclick="okumaPlani.sil()">Planı sil</button>' +
        '<button type="button" class="plan-link" onclick="if(confirm(\'Bitirilen maddeler sıfırlanıp yeni bir hatime başlansın mı?\'))okumaPlani.yeniHatim()">Baştan başla</button></div>';
    }
    return html + '</section>';
  }

  function calismaTazele() {
    var el = document.getElementById('okuma-plani-calisma');
    if (!el || !window.tocData) return;
    el.innerHTML = calismaHTML();
  }

  // ---- Okuyucu ----
  var _okunan = null; // { key, acilis, otomatik }

  function bitirDugmesiniTazele() {
    var kutu = document.getElementById('madde-bitir');
    if (!kutu || !_okunan) return;
    var bitti = bittiMi(_okunan.key);
    var d = durum();
    kutu.innerHTML = '<button type="button" class="bitir-btn' + (bitti ? ' bitti' : '') + '" aria-pressed="' + bitti + '" onclick="okumaPlani.bitirToggle()">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="8 12.5 11 15.5 16.5 9.5"/></svg>' +
      (bitti ? 'Bitirildi' : 'Bu maddeyi bitirdim') + '</button>' +
      '<span class="bitir-not">' + (d.aktif ? (bitti ? 'Okuma planınıza işlendi.' : 'Okuma planınıza işlenir.') :
        'Bitirdiğiniz maddeler kaydedilir. <a href="/calisma-alanim" onclick="closeMadde();navigateTo(\'calisma-alanim\');return false">Okuma planı yapın</a>') + '</span>';
  }

  function maddeAcildi(madde, aramaVar) {
    _okunan = { key: madde.kisim + '/' + madde.madde_no, acilis: Date.now(), otomatik: false, uzunluk: uzunluk(madde.kisim + '/' + madde.madde_no) };
    var yukle = window.maddeUzunluklari ? Promise.resolve() : (typeof ensureOzetlerData === 'function' ? ensureOzetlerData() : Promise.resolve());
    yukle.catch(function() {}).then(function() {
      if (!_okunan) return;
      _okunan.uzunluk = uzunluk(_okunan.key);
      bitirDugmesiniTazele();
    });
    bitirDugmesiniTazele();
    // Yarım kalan uzun maddede kalınan yere dön (aramadan gelinmediyse)
    if (aramaVar) return;
    var yer = oku(YER_ANAHTARI, {})[_okunan.key];
    if (!(yer > 0.03 && yer < 0.97) || bittiMi(_okunan.key)) return;
    var key = _okunan.key;
    requestAnimationFrame(function() { requestAnimationFrame(function() {
      var icerik = document.querySelector('#madde-detay .madde-overlay-content');
      if (!icerik || !_okunan || _okunan.key !== key) return;
      icerik.scrollTop = yer * (icerik.scrollHeight - icerik.clientHeight);
      bildir('Kaldığınız yerden devam ediyorsunuz.', { ad: 'Başa dön', fn: function() { icerik.scrollTop = 0; } });
    }); });
  }

  var _yerKayitZamani = 0;
  function kaydirildi(oran, kaydirilabilir) {
    if (!_okunan) return;
    var simdi = Date.now();
    if (kaydirilabilir && simdi - _yerKayitZamani > 800) {
      _yerKayitZamani = simdi;
      var yerler = oku(YER_ANAHTARI, {});
      if (oran > 0.03 && oran < 0.97 && !bittiMi(_okunan.key)) yerler[_okunan.key] = Math.round(oran * 1000) / 1000;
      else delete yerler[_okunan.key];
      yaz(YER_ANAHTARI, yerler);
    }
    // Sonuna kadar okunan madde kendiliğinden bitirilir (okuma süresinin üçte biri geçmişse)
    if (kaydirilabilir && oran >= 0.985 && !_okunan.otomatik && !bittiMi(_okunan.key)) {
      var gereken = Math.min(180000, Math.max(8000, _okunan.uzunluk / DAKIKADA_HARF * 60000 / 3));
      if (simdi - _okunan.acilis >= gereken) {
        _okunan.otomatik = true;
        var key = _okunan.key;
        maddeBitir(key, true);
        bildir('Madde bitirildi olarak işaretlendi.', { ad: 'Geri al', fn: function() { maddeBitir(key, false); } });
      }
    }
  }

  function bitirToggle() {
    if (!_okunan) return;
    maddeBitir(_okunan.key, !bittiMi(_okunan.key));
  }

  function hepsiniTazele() {
    kartiTazele();
    calismaTazele();
    bitirDugmesiniTazele();
  }

  function hazirla() {
    if (window.maddeUzunluklari) { kartiTazele(); return; }
    if (typeof ensureOzetlerData === 'function') ensureOzetlerData().then(kartiTazele).catch(kartiTazele);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hazirla);
  else hazirla();

  window.okumaPlani = {
    kur: planKur,
    sil: planSil,
    yeniHatim: yeniHatim,
    durum: durum,
    aktifMi: function() { return !!plan(); },
    bitirToggle: bitirToggle,
    maddeAcildi: maddeAcildi,
    maddeKapandi: function() { _okunan = null; },
    kaydirildi: kaydirildi,
    kartiTazele: kartiTazele,
    calismaTazele: function() {
      if (window.maddeUzunluklari) calismaTazele();
      else if (typeof ensureOzetlerData === 'function') ensureOzetlerData().then(calismaTazele).catch(calismaTazele);
    }
  };
})();
