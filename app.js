// ===== Se'âdet-i Ebediyye - İnteraktif İlmihâl =====
const PDF_URL = 'https://www.hakikatkitabevi.net/downloads/001.pdf';
// Her release'te index.html'deki BUILD sabitiyle birlikte bump edilir — lazy-load edilen data/kod dosyalarının cache key'i.
const ASSET_VERSION = '2026-10-19-r2';
function vQuery() { return '?v=' + ASSET_VERSION; }

// ===== URL ROUTING (Clean URL + Hash Fallback) =====
let routingSilent = false;

function updateUrl(path) {
  routingSilent = true;
  if (window.history.pushState) {
    history.pushState(null, '', '/' + path);
  } else {
    location.hash = path;
  }
  setTimeout(() => { routingSilent = false; }, 50);
}

// Backward compat
function updateHash(hash) { updateUrl(hash); }

function getRoutePath() {
  // Clean URL varsa onu kullan, yoksa hash'e bak
  var path = location.pathname.replace(/^\//, '');
  if (path && path !== 'index.html') return path;
  if (location.hash) return location.hash.slice(1);
  return 'anasayfa';
}

function nextFrame() {
  return new Promise(function(resolve) {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function() { resolve(); });
      return;
    }
    setTimeout(resolve, 16);
  });
}

async function navigateAndRun(page, runner) {
  _navigateToCore(page, true);
  await nextFrame();
  return runner();
}

async function handleRoute() {
  if (routingSilent) return;
  try {
    const fullPath = getRoutePath();
    const parts = fullPath.split('/');
    // vercel.json'daki /icindekiler yolu da İçindekiler sayfasını açar
    const route = parts[0] === 'icindekiler' ? 'icerik' : parts[0];

    if (route === 'madde' && parts.length >= 3) {
      const kisim = parseInt(parts[1]);
      const maddeNo = parseInt(parts[2]);
      if (kisim && maddeNo) {
        await navigateAndRun('icerik', function() { return openMadde(kisim, maddeNo, true); });
        return;
      }
    }

    if (route === 'sahis' && parts[1]) {
      await navigateAndRun('sahislar', function() { return openSahis(decodeURIComponent(parts[1]), true); });
      return;
    }

    if (route === 'arama' && parts[1]) {
      const query = decodeURIComponent(parts.slice(1).join('/'));
      await navigateAndRun('arama', function() {
        const input = document.getElementById('full-search');
        if (input) input.value = query;
        return doFullSearch(true);
      });
      return;
    }

    if (route === 'fevaid' && parts[1] === 'tablolar' && parts[2]) {
      await navigateAndRun('fevaid', function() { openTabloDetay(decodeURIComponent(parts[2])); });
      return;
    }
    if (route === 'fevaid' && parts[1] === 'tablolar' && !parts[2]) {
      await navigateAndRun('fevaid', function() { openFevaidSection('tablolar'); });
      return;
    }
    // Geriye dönük uyumluluk: eski /fevaid/tablo/:id ve /tablo/:id
    if (route === 'fevaid' && parts[1] === 'tablo' && parts[2]) {
      await navigateAndRun('fevaid', function() { openTabloDetay(decodeURIComponent(parts[2])); });
      return;
    }
    if (route === 'tablo' && parts[1]) {
      await navigateAndRun('fevaid', function() { openTabloDetay(decodeURIComponent(parts[1])); });
      return;
    }

    if (route === 'hukumler') {
      navigateTo('hukumler', true);
      if (parts[1] && typeof ensureHukumlerData === 'function') {
        await ensureHukumlerData();
        setHukumlerTur(parts[1]);
      }
      return;
    }

    const validPages = ['anasayfa','icerik','fevaid','sozluk','arama','sahislar','hakkinda','quiz','ayet-hadis','gunun-bilgisi','rehberler','calisma-alanim','hukumler','gizlilik'];
    if (validPages.includes(route)) {
      navigateTo(route, true);
    } else {
      navigateTo('anasayfa', true);
    }
  } catch (e) {
    console.error('Route handling failed:', e);
    navigateTo('anasayfa', true);
  }
}

window.addEventListener('popstate', function() { void handleRoute(); });
window.addEventListener('hashchange', function() { void handleRoute(); });

// ===== DİNAMİK SEO META =====
function updateSeoMeta(title, description, url) {
  document.title = title;
  var setMeta = function(attr, key, val) {
    var el = document.querySelector('meta[' + attr + '="' + key + '"]');
    if (el) el.setAttribute('content', val);
  };
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url || location.href);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  var canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = url || location.href;
}

// ===== LAZY LOADING (sözlük + maddeler) =====
var _loadingScripts = {};
var MADDE_SAFE_MODE = false; // Nisan 2026 acil freni; kademeli render + try/catch korumaları sonrası Haziran 2026'da yeniden açıldı
var MADDE_ENABLE_SOZLUK_LAYER = true;

function assetUrl(path) {
  if (!path) return path;
  return path.charAt(0) === '/' ? path : '/' + path;
}

function isRuntimeDebugEnabled() {
  try {
    return /(?:[?&])debug=1(?:&|$)/.test(location.search || '') || localStorage.getItem('ilmihal-debug') === '1';
  } catch (e) {
    return false;
  }
}

function debugLog() {
  if (!isRuntimeDebugEnabled()) return;
  try {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[ilmihal-debug]');
    console.log.apply(console, args);
  } catch (e) {}
}

function settleWithTimeout(promise, timeoutMs, fallbackValue, label) {
  return new Promise(function(resolve) {
    var settled = false;
    var timer = setTimeout(function() {
      if (settled) return;
      settled = true;
      if (label) console.warn(label + ' zaman aşımına düştü.');
      resolve(fallbackValue);
    }, timeoutMs);

    Promise.resolve(promise).then(function(value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    }).catch(function(err) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (label) console.error(label + ' hatası:', err);
      resolve(fallbackValue);
    });
  });
}

function loadScript(src, timeoutMs) {
  var base = assetUrl(src.split('?')[0]);
  var timeout = timeoutMs || 5000;
  debugLog('loadScript:start', src, 'timeout=' + timeout);
  // Zaten yükleniyorsa aynı promise'i döndür
  if (_loadingScripts[base]) return _loadingScripts[base];
  // Başarıyla yüklenmiş script tag var mı? (onload tetiklendiyse)
  var existing = document.querySelector('script[src^="' + base + '"][data-loaded="1"]');
  if (existing) return Promise.resolve();
  // Yüklenmekte olan mevcut script'i yeniden kullan
  var old = document.querySelector('script[src^="' + base + '"]');
  if (old) {
    _loadingScripts[base] = new Promise(function(resolve, reject) {
      var settled = false;
      var timer = setTimeout(function() {
        if (settled) return;
        settled = true;
        delete _loadingScripts[base];
        reject(new Error('Script zaman aşımına uğradı: ' + src));
      }, timeout);
      function finish(fn, payload) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (fn === resolve) old.setAttribute('data-loaded', '1');
        delete _loadingScripts[base];
        fn(payload);
      }
      if (old.getAttribute('data-loaded') === '1' || old.readyState === 'complete') {
        debugLog('loadScript:reuse-loaded', src);
        finish(resolve);
        return;
      }
      old.addEventListener('load', function onLoad() {
        old.removeEventListener('load', onLoad);
        debugLog('loadScript:reuse-onload', src);
        finish(resolve);
      }, { once: true });
      old.addEventListener('error', function onErr() {
        old.removeEventListener('error', onErr);
        debugLog('loadScript:reuse-error', src);
        finish(reject, new Error('Script yüklenemedi: ' + src));
      }, { once: true });
    });
    return _loadingScripts[base];
  }

  _loadingScripts[base] = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    var settled = false;
    var timer = setTimeout(function() {
      if (settled) return;
      settled = true;
      delete _loadingScripts[base];
      try { s.remove(); } catch (e) {}
      reject(new Error('Script zaman aşımına uğradı: ' + src));
    }, timeout);
    s.src = assetUrl(src);
    s.onload = function() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      debugLog('loadScript:onload', src);
      s.setAttribute('data-loaded', '1');
      delete _loadingScripts[base];
      resolve();
    };
    s.onerror = function() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      debugLog('loadScript:onerror', src);
      delete _loadingScripts[base];
      reject(new Error('Script yüklenemedi: ' + src));
    };
    document.body.appendChild(s);
  });
  return _loadingScripts[base];
}

function rebuildSearchIndex() {
  if (window.SearchEngine && typeof window.SearchEngine.rebuild === 'function') {
    window.SearchEngine.rebuild();
  }
}

function ensureMaddelerData() {
  if (window.maddelerData) return Promise.resolve();
  return loadScript('maddeler-data.js' + vQuery());
}

function ensureSozlukData() {
  if (window.sozlukData) return Promise.resolve();
  return loadScript('sozluk-data.js' + vQuery()).then(rebuildSearchIndex);
}

function ensureSahislarData() {
  if (window.sahislarData) return Promise.resolve();
  return loadScript('sahislar.js' + vQuery()).then(rebuildSearchIndex);
}

function ensureAyetHadisData() {
  if (window.ayetHadisData) return Promise.resolve();
  return loadScript('ayet-hadis.js' + vQuery());
}

function ensureGununSorusuData() {
  if (window.gununSorusuData) return Promise.resolve();
  return loadScript('gunun-sorusu-data.js' + vQuery());
}

function ensureAudioMapData() {
  if (window.audioMap) return Promise.resolve();
  return loadScript('audio-map.js' + vQuery());
}

function ensureRehberlerData() {
  if (window.rehberlerData) return Promise.resolve();
  return loadScript('rehberler.js' + vQuery());
}

function preloadBackgroundData() {
  ensureSozlukData().catch(function() {});
}

function warmDirectRouteData(path) {
  var match = (path || '').match(/^madde\/(\d+)\/(\d+)/);
  if (!match) return;
  var kisim = parseInt(match[1], 10);
  if (!kisim) return;
  loadKisimTexts(kisim).catch(function() {});
}

function scheduleBackgroundPreload(delay) {
  setTimeout(function() {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(function() { preloadBackgroundData(); }, { timeout: 2000 });
      return;
    }
    preloadBackgroundData();
  }, delay);
}

// ===== TEMA: Gündüz / Sepya / Gece =====
var themeModes = ['light', 'sepia', 'dark'];

function initDarkMode() {
  var saved = localStorage.getItem('ilmihal-theme') || 'light';
  applyTheme(saved);
}

function applyTheme(mode) {
  document.documentElement.classList.remove('dark', 'sepia');
  if (mode === 'dark') document.documentElement.classList.add('dark');
  if (mode === 'sepia') document.documentElement.classList.add('sepia');
  updateThemeButton(mode);
  if (typeof temaSecimiGuncelle === 'function') temaSecimiGuncelle(mode);
}

function toggleDarkMode() {
  var current = localStorage.getItem('ilmihal-theme') || 'light';
  var idx = themeModes.indexOf(current);
  var next = themeModes[(idx + 1) % themeModes.length];
  localStorage.setItem('ilmihal-theme', next);
  applyTheme(next);
}

function updateThemeButton(mode) {
  var btn = document.querySelector('.dark-mode-toggle');
  if (!btn) return;
  var labels = { light: 'Gündüz', sepia: 'Sepya', dark: 'Gece' };
  var icons = { light: '\u263C', sepia: '\u2600', dark: '\u263D' };
  btn.innerHTML = '<span class="dm-icon">' + icons[mode] + '</span><span class="dm-label">' + labels[mode] + '</span>';
  btn.title = 'Tema: ' + labels[mode];
}

initDarkMode();

// ===== HELPERS =====
function sayfaLink(sayfa, label) {
  if (!label) label = 's. ' + sayfa;
  return `<a href="#" onclick="openSayfa(${sayfa});return false" class="sayfa-link" title="Kitabın bu sayfasını aç">${label}</a>`;
}

function sayfaLabel(madde) {
  if (madde.sayfa_bitis && madde.sayfa_bitis !== madde.sayfa_no && madde.sayfa_bitis > madde.sayfa_no) {
    return 'Sayfa ' + madde.sayfa_no + '-' + madde.sayfa_bitis;
  }
  return 'Sayfa ' + madde.sayfa_no;
}

// Kitabın içindekilerindeki "Mektûb No." sütunu: 1-3. cildler İmâm-ı Rabbânî hazretlerinin,
// 4-6. cildler Muhammed Ma'sûm-i Serhendî hazretlerinin (Mektûbât) kitâbıdır.
function mektubEtiketi(ref, duzMetin) {
  var m = /^(\d)—(\d+)$/.exec(ref || '');
  if (!m) return duzMetin ? 'Mektûb: ' + ref : '<span>Mektûb: ' + escapeHtml(ref) + '</span>';
  var c = parseInt(m[1], 10);
  var rabbani = c <= 3;
  var cild = rabbani ? c : c - 3;
  var kisa = (rabbani ? 'Mektûbât ' : 'Mektûbât-ı Ma\'sûmiyye ') + cild + '/' + m[2];
  if (duzMetin) return kisa;
  var uzun = (rabbani ? 'İmâm-ı Rabbânî hazretlerinin' : 'Muhammed Ma\'sûm-i Serhendî hazretlerinin') +
    ' (Mektûbât) kitâbı, ' + cild + '. cild, ' + m[2] + '. mektûb';
  return '<span style="white-space:nowrap" title="' + uzun + '">' + kisa + '</span>';
}

function sayfaLinkPdf(sayfa, label) {
  if (!label) label = 'Sayfa ' + sayfa;
  return `<a href="${PDF_URL}#page=${parseInt(sayfa, 10)}" target="_blank" rel="noopener" class="sayfa-link" title="Kitabın aslını (PDF) bu sahîfede aç">${label}</a>`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[âÂ]/g,'a').replace(/[çÇ]/g,'c').replace(/[êÊ]/g,'e')
    .replace(/[ğĞ]/g,'g').replace(/[ıİ]/g,'i').replace(/[îÎ]/g,'i')
    .replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u')
    .replace(/[ûÛ]/g,'u').replace(/[''\u2018\u2019]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// ===== PDF (kitabın aslı) =====
// Sitenin CSP'si başka alan adlarını iframe'de açmaya izin vermez; mobil tarayıcılar da
// iframe içinde PDF göstermez. Bu yüzden kitabın aslı yeni sekmede, ilgili sahîfede açılır.
function openSayfa(sayfa) {
  const madde = window.tocData?.find(m =>
    m.sayfa_no <= sayfa && (m.sayfa_bitis || m.sayfa_no) >= sayfa
  );
  if (madde) {
    openMadde(madde.kisim, madde.madde_no);
  }
}

function showPdfPage(sayfa) {
  window.open(PDF_URL + '#page=' + parseInt(sayfa, 10), '_blank', 'noopener');
}

// ===== NAVIGATION =====
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

function navigateTo(page, fromRoute) {
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (document.startViewTransition && !(rm && rm.matches)) {
    document.startViewTransition(function() { _navigateToCore(page, fromRoute); });
  } else {
    _navigateToCore(page, fromRoute);
  }
}

function _navigateToCore(page, fromRoute) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  const navBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if (navBtn) { navBtn.classList.add('active'); navBtn.setAttribute('aria-current', 'page'); }
  // Close mobile menu
  document.querySelector('.main-nav')?.classList.remove('open');
  window.scrollTo(0, 0);

  // Update hash
  if (!fromRoute) updateHash(page);

  // Fevaid: her zaman ana ekranı göster (tablo detay vs. içindeyken nav'a basılırsa sıfırla)
  if (page === 'fevaid') {
    const home = document.getElementById('fevaid-home');
    if (home) home.style.display = '';
    document.querySelectorAll('.fevaid-section').forEach(s => { s.style.display = 'none'; });
  }

  // Lazy load content
  if (page === 'icerik' && !icerikLoaded) loadIcerik();
  if (page === 'sozluk' && !sozlukLoaded) { ensureSozlukData().then(function() { loadSozluk(); }); }
  if (page === 'fevaid' && !fevaidLoaded) loadFevaid();
  if (page === 'sahislar') void loadSahislar();
  if (page === 'ayet-hadis' && typeof renderAyetHadis === 'function') void renderAyetHadis();
  if (page === 'gunun-bilgisi' && typeof renderGununBilgisi === 'function') void renderGununBilgisi();
  if (page === 'rehberler' && typeof renderRehberler === 'function') void renderRehberler();
  if (page === 'hukumler' && typeof ensureHukumlerData === 'function') ensureHukumlerData();
  if (page === 'calisma-alanim' && typeof window.renderCalismaAlanim === 'function') window.renderCalismaAlanim();

  var seo = pageSeoMap && pageSeoMap[page];
  if (seo) updateSeoMeta(seo[0], seo[1], 'https://www.ilmihal.org/' + (page === 'anasayfa' ? '' : page));
}

function goToSozlukSearch(term) {
  navigateTo('sozluk');
  var input = document.getElementById('sozluk-search');
  if (!input) return;
  input.value = term;
  input.dispatchEvent(new Event('input'));
}

function goToSahisDetay(slug) {
  navigateTo('sahislar');
  openSahis(slug);
}

function goToTabloDetay(id) {
  navigateTo('fevaid');
  openTabloDetay(id);
}

function goToRehberDetay(id) {
  navigateTo('rehberler');
  openRehber(id);
}

// Mobile menu
document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
  document.querySelector('.main-nav').classList.toggle('open');
});

// ===== İÇİNDEKİLER =====
let icerikLoaded = false;

function loadIcerik(filterKisim, filterText) {
  const list = document.getElementById('icerik-list');
  if (!window.tocData) { list.innerHTML = '<div class="loading">Veriler yükleniyor...</div>'; return; }
  icerikLoaded = true;

  const kisimFilter = filterKisim || document.getElementById('kisim-filter')?.value || 'all';
  const rawSearch = filterText || document.getElementById('icerik-search')?.value || '';
  const searchText = rawSearch.toLowerCase();

  let filtered = window.tocData;
  if (kisimFilter !== 'all') filtered = filtered.filter(m => m.kisim == kisimFilter);
  if (searchText) {
    const { wordVarLists: sVarLists } = expandSearchQuery(rawSearch);
    filtered = filtered.filter(m => {
      const nb = normalizeSearch(m.baslik || '');
      return sVarLists.every(wvars => wvars.some(v => includesWordStart(nb, v)));
    });
  }

  const kisimLabels = { 1: 'Birinci K\u0131s\u0131m', 2: '\u0130kinci K\u0131s\u0131m', 3: '\u00dc\u00e7\u00fcnc\u00fc K\u0131s\u0131m' };
  let currentKisim = 0;
  let html = '';
  const okundular = new Set(getReadMaddes());

  filtered.forEach(m => {
    if (m.kisim !== currentKisim && kisimFilter === 'all') {
      currentKisim = m.kisim;
      html += `<div style="padding:24px 0 8px;"><h3 style="font-family:var(--font-okuma);color:var(--primary-dark);font-size:1.3rem;">${kisimLabels[m.kisim]}</h3></div>`;
    }
    const okundu = okundular.has(m.kisim + '/' + m.madde_no);
    html += `
      <div class="madde-item${okundu ? ' okundu' : ''}" data-madde-key="${m.kisim}/${m.madde_no}" onclick="openMadde(${m.kisim}, ${m.madde_no})">
        <div class="madde-badge">${m.madde_no}</div>
        <div class="madde-info">
          <div class="madde-title">${m.baslik}${okundu ? OKUNDU_TIK_HTML : ''}</div>
          <div class="madde-meta">${kisimLabels[m.kisim]}${m.mektup_ref ? ' \u00B7 ' + mektubEtiketi(m.mektup_ref) : ''}</div>
        </div>
        <div class="madde-sayfa">s. ${m.sayfa_no}</div>
      </div>
    `;
  });

  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Sonu\u00e7 bulunamad\u0131.</p>';
}

document.getElementById('kisim-filter')?.addEventListener('change', () => loadIcerik());
document.getElementById('icerik-search')?.addEventListener('input', () => loadIcerik());

function showKisim(k) {
  navigateTo('icerik');
  document.getElementById('kisim-filter').value = k;
  loadIcerik();
}

function filterByCategory(cat) {
  navigateTo('icerik');
  const categoryMap = {
    'iman': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],
    'temizlik': [52,53,54,55,56,57,58],
    'namaz': [51,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77],
    'oruc': [79,80],
    'zekat': [78],
    'hac': [84,85,86,87,88,89],
    'ticaret': [],
    'aile': [],
    'ahlak': [],
    'cenaze': []
  };

  if (window.tablolarData) {
    const konuHaritasi = window.tablolarData.find(t => t.id === 'konu_haritasi');
    if (konuHaritasi && konuHaritasi.veriler) {
      const kategori = konuHaritasi.veriler.find(v => v.id === cat);
      if (kategori) {
        const maddeler = kategori.maddeler || [];
        const filtered = window.tocData.filter(m => {
          const key = `K${m.kisim}/M${m.madde_no}`;
          return maddeler.includes(key);
        });
        renderFilteredMaddeler(filtered);
        return;
      }
    }
  }

  const searchTerms = {
    'iman': '\u00eem\u00e2n', 'temizlik': 'abdest', 'namaz': 'nem\u00e2z',
    'oruc': 'oruc', 'zekat': 'zek\u00e2t', 'hac': 'hac',
    'ticaret': 'tic\u00e2ret', 'aile': 'nik\u00e2h', 'ahlak': 'ahl\u00e2k', 'cenaze': 'cen\u00e2ze'
  };
  document.getElementById('icerik-search').value = searchTerms[cat] || cat;
  loadIcerik();
}

function renderFilteredMaddeler(filtered) {
  const list = document.getElementById('icerik-list');
  const kisimLabels = { 1: 'Birinci K\u0131s\u0131m', 2: '\u0130kinci K\u0131s\u0131m', 3: '\u00dc\u00e7\u00fcnc\u00fc K\u0131s\u0131m' };
  let html = '';
  const okundular = new Set(getReadMaddes());
  filtered.forEach(m => {
    const okundu = okundular.has(m.kisim + '/' + m.madde_no);
    html += `
      <div class="madde-item${okundu ? ' okundu' : ''}" data-madde-key="${m.kisim}/${m.madde_no}" onclick="openMadde(${m.kisim}, ${m.madde_no})">
        <div class="madde-badge">${m.madde_no}</div>
        <div class="madde-info">
          <div class="madde-title">${m.baslik}${okundu ? OKUNDU_TIK_HTML : ''}</div>
          <div class="madde-meta">${kisimLabels[m.kisim]}${m.mektup_ref ? ' \u00B7 ' + mektubEtiketi(m.mektup_ref) : ''}</div>
        </div>
        <div class="madde-sayfa">s. ${m.sayfa_no}</div>
      </div>
    `;
  });
  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Sonu\u00e7 bulunamad\u0131.</p>';
}

// ===== MADDE DETAY =====
const kisimTextsCache = {};
window.kisimTextsCache = kisimTextsCache; // search-engine.js erişimi için
const kisimTextPromises = {};
var _allKisimTextsPromise = null;
var _maddeOpenRequestId = 0;
var _searchRequestId = 0;
var _tocIndexByKey = null;
var _tocByKisim = null;

function buildMaddeKey(kisim, maddeNo) {
  return String(kisim) + '/' + String(maddeNo);
}

function ensureTocIndexes() {
  if (_tocIndexByKey || !window.tocData) return;
  _tocIndexByKey = new Map();
  _tocByKisim = { 1: [], 2: [], 3: [] };
  window.tocData.forEach(function(m) {
    var key = buildMaddeKey(m.kisim, m.madde_no);
    _tocIndexByKey.set(key, m);
    if (_tocByKisim[m.kisim]) _tocByKisim[m.kisim].push(m);
  });
}

function getKisimMaddeler(kisim) {
  ensureTocIndexes();
  if (_tocByKisim && _tocByKisim[kisim]) return _tocByKisim[kisim];
  return (window.tocData || []).filter(function(m) { return m.kisim === kisim; });
}

async function loadKisimTexts(kisim) {
  debugLog('loadKisimTexts:start', kisim);
  if (kisimTextsCache[kisim]) return kisimTextsCache[kisim];
  if (kisimTextPromises[kisim]) return kisimTextPromises[kisim];
  kisimTextPromises[kisim] = new Promise(function(resolve) {
    var ctrl = new AbortController();
    var settled = false;
    var timer = setTimeout(function() {
      try { ctrl.abort(); } catch (e) {}
      finish(null, new Error('timeout'));
    }, 30000); // ~1,6 MB'lık kısım dosyası yavaş mobil bağlantıda 2,5 sn'de inmiyordu

    function finish(data, err) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (data) {
        debugLog('loadKisimTexts:success', kisim, Object.keys(data).length);
        kisimTextsCache[kisim] = data;
      } else {
        debugLog('loadKisimTexts:null', kisim, err ? String(err.message || err) : '');
        delete kisimTextPromises[kisim];
      }
      if (err) console.error(`K\u0131s\u0131m ${kisim} metinleri y\u00fcklenemedi:`, err);
      resolve(data || null);
    }

    var onYukleme = window.__kisimOnYukleme;
    var istek;
    if (onYukleme && String(onYukleme.kisim) === String(kisim)) {
      window.__kisimOnYukleme = null; // index.html'deki erken istek bir kez kullanılır
      istek = onYukleme.istek;
    } else {
      istek = fetch(assetUrl('texts/kisim' + kisim + '.json' + vQuery()), { signal: ctrl.signal }).then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      });
    }
    istek.then(function(data) {
      finish(data, null);
    }).catch(function(err) {
      finish(null, err);
    });
  });
  return kisimTextPromises[kisim];
}

function ensureAllKisimTexts() {
  if (_allKisimTextsPromise) return _allKisimTextsPromise;
  _allKisimTextsPromise = (async function() {
    var loaded = await Promise.all([1, 2, 3].map(function(kisim) {
      return loadKisimTexts(kisim);
    }));
    var result = {};
    loaded.forEach(function(texts, idx) {
      result[idx + 1] = texts;
    });
    return result;
  })();
  _allKisimTextsPromise.catch(function() {
    _allKisimTextsPromise = null;
  });
  return _allKisimTextsPromise;
}

function findMaddeTextInMaddelerData(kisim, maddeNo) {
  if (!window.maddelerData || !Array.isArray(window.maddelerData)) return null;
  var fallbackMadde = window.maddelerData.find(function(m) {
    return m.kisim === kisim && m.madde_no === maddeNo;
  });
  return fallbackMadde ? (fallbackMadde.metin || null) : null;
}

async function getMaddeText(kisim, maddeNo, options) {
  options = options || {};
  debugLog('getMaddeText:start', kisim, maddeNo);
  var cachedFallback = findMaddeTextInMaddelerData(kisim, maddeNo);
  if (cachedFallback) return cachedFallback;

  // Önce kısım dosyası (texts/kisimN.json); 4,5 MB'lık maddeler-data.js yalnız bu başarısız olursa iner.
  var kisimTexts = null;
  try { kisimTexts = await loadKisimTexts(kisim); } catch (e) {}
  var metin = kisimTexts ? (kisimTexts[String(maddeNo)] || kisimTexts[maddeNo] || null) : null;
  if (metin || options.allowFallback === false) return metin;

  try {
    await settleWithTimeout(ensureMaddelerData(), 30000, null, 'maddelerData fallback');
  } catch (e) {}
  return findMaddeTextInMaddelerData(kisim, maddeNo);
}

function getMaddeMeta(kisim, maddeNo) {
  ensureTocIndexes();
  var meta = _tocIndexByKey ? _tocIndexByKey.get(buildMaddeKey(kisim, maddeNo)) : null;
  if (meta) return meta;
  return window.maddelerData?.find(function(m) {
    return m.kisim === kisim && m.madde_no === maddeNo;
  }) || null;
}

function renderMaddeError(body, kisim, maddeNo, title, detail) {
  if (!body) return;
  body.innerHTML = '<div class="madde-detail-header">' +
    '<h3>' + escapeHtml(title || 'Metin yüklenemedi') + '</h3>' +
    '<div class="madde-text" style="text-align:center;padding:40px;">' +
      '<p style="margin-bottom:12px;color:var(--text-muted);">' + escapeHtml(detail || 'Madde metni şu anda yüklenemedi.') + '</p>' +
      '<button type="button" class="btn btn-primary" onclick="openMadde(' + kisim + ',' + maddeNo + ')">Tekrar Dene</button>' +
    '</div>' +
  '</div>';
}

function hydrateMaddeRelatedSahislar(requestId, kisim, maddeNo) {
  if (MADDE_SAFE_MODE) return;
  var slot = document.getElementById('madde-related-sahis-slot');
  if (!slot) return;
  if (window.sahislarData) {
    if (requestId !== _maddeOpenRequestId) return;
    slot.innerHTML = getRelatedSahislar(kisim, maddeNo) || '';
    return;
  }
  slot.innerHTML = '<div class="related-sahislar"><div class="related-sahislar-title">Şahıs bağlantıları hazırlanıyor...</div></div>';
  ensureSahislarData().then(function() {
    if (requestId !== _maddeOpenRequestId) return;
    var latestSlot = document.getElementById('madde-related-sahis-slot');
    if (!latestSlot) return;
    latestSlot.innerHTML = getRelatedSahislar(kisim, maddeNo) || '';
  }).catch(function() {
    if (requestId !== _maddeOpenRequestId) return;
    var latestSlot = document.getElementById('madde-related-sahis-slot');
    if (latestSlot) latestSlot.innerHTML = '';
  });
}

function hydrateMaddeRelatedTables(requestId, kisim, maddeNo) {
  if (MADDE_SAFE_MODE) return;
  var slot = document.getElementById('madde-related-table-slot');
  if (!slot || requestId !== _maddeOpenRequestId) return;
  try {
    slot.innerHTML = getRelatedTables(kisim, maddeNo) || '';
  } catch (e) {
    console.error('İlgili tablo yükleme hatası:', e);
    slot.innerHTML = '';
  }
}

function hydrateMaddeIliskiliMaddeler(requestId, kisim, maddeNo, baslik) {
  if (MADDE_SAFE_MODE) return;
  var slot = document.getElementById('madde-iliskili-slot');
  if (!slot || requestId !== _maddeOpenRequestId) return;
  try {
    slot.innerHTML = getIliskiliMaddeler(kisim, maddeNo) || '';
  } catch (e) {
    console.error('İlgili madde yükleme hatası:', e);
    slot.innerHTML = '';
  }
}

async function openMadde(kisim, maddeNo, fromRoute, searchQuery) {
  var requestId = ++_maddeOpenRequestId;
  debugLog('openMadde:start', kisim, maddeNo, 'req=' + requestId, 'fromRoute=' + !!fromRoute);
  // AŞAMA 0 — Modal'ı HEMEN aç, her şeyden önce. Sonraki satırlar hata atsa bile modal görünür.
  const _overlay = document.getElementById('madde-detay');
  const body = document.getElementById('madde-body');
  if (_overlay) { _overlay.classList.remove('kapaniyor'); _overlay.style.display = 'flex'; _overlay.setAttribute('aria-hidden', 'false'); }
  document.body.style.overflow = 'hidden';
  if (body) body.innerHTML = iskeletHTML();

  let madde = getMaddeMeta(kisim, maddeNo);
  debugLog('openMadde:meta-initial', kisim, maddeNo, !!madde);

  if (!madde && typeof ensureMaddelerData === 'function') {
    try { await ensureMaddelerData(); } catch (e) {}
    if (requestId !== _maddeOpenRequestId) return;
    madde = getMaddeMeta(kisim, maddeNo);
  }

  if (!madde) {
    if (body) body.innerHTML = `<div style="text-align:center;padding:40px;"><h3>Madde bulunamadı</h3><button type="button" class="btn" onclick="closeMadde()">Kapat</button></div>`;
    return;
  }

  madde = Object.assign({}, madde);
  debugLog('openMadde:meta-ready', kisim, maddeNo, madde.baslik);

  // Bookmark & read tracking (hataya dayanıklı)
  currentMaddeForBookmark = madde;
  try { if (typeof markAsRead === 'function') markAsRead(kisim, maddeNo); } catch(e) {}
  try { localStorage.setItem('ilmihal-son-okunan', JSON.stringify({kisim: kisim, madde_no: maddeNo, baslik: madde.baslik, zaman: Date.now()})); } catch(e) {}

  // SEO meta güncelle
  var kisimLabel = {1:'Birinci Kısım',2:'İkinci Kısım',3:'Üçüncü Kısım'}[kisim] || '';
  try {
    updateSeoMeta(
      madde.baslik + ' - Se\'âdet-i Ebediyye',
      kisimLabel + ', Madde ' + maddeNo + ' - ' + madde.baslik + '. Se\'âdet-i Ebediyye İnteraktif İlmihâl.',
      'https://www.ilmihal.org/madde/' + kisim + '/' + maddeNo
    );
  } catch(e) {}

  const kisimLabels = { 1: 'Birinci K\u0131s\u0131m', 2: '\u0130kinci K\u0131s\u0131m', 3: '\u00dc\u00e7\u00fcnc\u00fc K\u0131s\u0131m' };

  // Update URL
  if (!fromRoute) { try { updateHash(`madde/${kisim}/${maddeNo}`); } catch(e) {} }
  try { if (typeof updateBookmarkBtn === 'function') updateBookmarkBtn(kisim, maddeNo); } catch(e) {}

  body.innerHTML = `
    <div class="madde-detail-header">
      <h3>${madde.baslik}</h3>
      <div class="madde-detail-meta">
        <span>${kisimLabels[madde.kisim]}, Madde ${madde.madde_no}</span>
        <span>${sayfaLinkPdf(madde.sayfa_no, sayfaLabel(madde))}</span>
        ${madde.mektup_ref ? mektubEtiketi(madde.mektup_ref) : ''}
      </div>
    </div>
    <div class="madde-text" style="text-align:center;padding:40px;color:var(--text-muted);">Metin y\u00fckleniyor...</div>
  `;

  var rawMetin = null;
  try {
    debugLog('openMadde:before-getMaddeText', kisim, maddeNo, 'req=' + requestId);
    rawMetin = await getMaddeText(kisim, maddeNo);
  } catch (e) {
    console.error('Madde metni alınamadı:', e);
  }
  debugLog('openMadde:after-getMaddeText', kisim, maddeNo, !!rawMetin, rawMetin ? rawMetin.length : 0);
  if (requestId !== _maddeOpenRequestId) return;
  if (!rawMetin) {
    renderMaddeError(body, kisim, maddeNo, madde.baslik, 'Madde metni zamanında yüklenemedi. Tekrar deneyin veya sayfayı yenileyin.');
    return;
  }

  madde.metin = rawMetin || madde.metin || '';
  const rawMetinSafe = madde.metin || '(Metin yüklenemedi)';
  // Metni hemen göster (sözlük yükünü bekleme)
  function bindMaddeTooltipListeners() {
    bindSozlukTooltipListeners(body);
  }

  function renderBody(metin) {
    debugLog('openMadde:renderBody:start', kisim, maddeNo, metin ? metin.length : 0);
    body.innerHTML = `
    <nav class="breadcrumb" aria-label="Konum">
      <a href="#" onclick="closeMadde();navigateTo('anasayfa');return false">Ana Sayfa</a>
      <span class="breadcrumb-sep">›</span>
      <a href="#" onclick="closeMadde();navigateTo('icerik');return false">İçindekiler</a>
      <span class="breadcrumb-sep">›</span>
      <a href="#" onclick="closeMadde();navigateTo('icerik');showKisim(${kisim});return false">${kisimLabels[madde.kisim]}</a>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">Madde ${madde.madde_no}</span>
    </nav>
    <div class="madde-detail-header">
      <h3>${madde.baslik}</h3>
      <div class="madde-detail-meta">
        <span>${kisimLabels[madde.kisim]}, Madde ${madde.madde_no}</span>
        <span>${sayfaLinkPdf(madde.sayfa_no, sayfaLabel(madde))}</span>
        ${madde.mektup_ref ? mektubEtiketi(madde.mektup_ref) : ''}
      </div>
    </div>
    <div class="madde-text">${metin}</div>
    <div class="madde-paylasim-bar">
      <button type="button" class="btn btn-sm" onclick="maddePaylasText(${kisim},${maddeNo})">Paylaş</button>
      <button type="button" class="btn btn-sm btn-secondary" style="background:var(--primary-light);color:#fff;" onclick="maddePaylasimKarti(${kisim},${maddeNo})">Görsel Kart</button>
    </div>
    <div id="madde-related-sahis-slot"></div>
    <div id="madde-related-table-slot"></div>
    <div id="madde-iliskili-slot"></div>
  `;
    bindMaddeTooltipListeners();
  }

  // Arama highlight helper
  function applySearchHighlight() {
    if (searchQuery) {
      const maddeTextEl = body.querySelector('.madde-text');
      if (maddeTextEl) highlightAndScroll(maddeTextEl, searchQuery);
    }
  }

  function enhanceMaddeBodyWithSozluk() {
    if (requestId !== _maddeOpenRequestId) return;
    if (!body.isConnected) return;
    const textEl = body.querySelector('.madde-text');
    if (!textEl) return;
    try {
      textEl.innerHTML = maddeMetniHTML(rawMetinSafe, true);
      bindMaddeTooltipListeners();
      if (typeof initInlineSozluk === 'function') initInlineSozluk(textEl);
      if (typeof aktivCrossLinks === 'function') { try { aktivCrossLinks(textEl); } catch(e2) {} }
      if (typeof yukleVurgulamalar === 'function') { try { yukleVurgulamalar(textEl); } catch(e2) {} }
      applySearchHighlight();
    } catch (e) {
      console.error('Madde sözlük highlight hatası:', e);
    }
  }

  function scheduleMaddeSozlukEnhancement() {
    var run = function() {
      if (requestId !== _maddeOpenRequestId) return;
      nextFrame().then(function() {
        if (requestId !== _maddeOpenRequestId) return;
        enhanceMaddeBodyWithSozluk();
      });
    };
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(run, { timeout: 1500 });
      return;
    }
    setTimeout(run, 250);
  }

  // Önce çıplak metni göster; sözlük vurgularını sonra bindir.
  try {
    renderBody(maddeMetniHTML(rawMetinSafe, false));
    debugLog('openMadde:renderBody:done', kisim, maddeNo);
  } catch (e) {
    console.error('Madde render hatası:', e);
    debugLog('openMadde:renderBody:error', kisim, maddeNo, String(e && e.message || e));
    renderMaddeError(body, kisim, maddeNo, madde.baslik, 'Madde metni hazırlandı fakat ekrana işlenirken hata oluştu.');
    return;
  }
  if (!MADDE_SAFE_MODE) {
    try {
      applySearchHighlight();
      debugLog('openMadde:applySearchHighlight:done', kisim, maddeNo);
    } catch (e) {
      console.error('Madde arama highlight hatası:', e);
      debugLog('openMadde:applySearchHighlight:error', kisim, maddeNo, String(e && e.message || e));
    }
    nextFrame().then(function() {
      if (requestId !== _maddeOpenRequestId) return;
      try { if (typeof initAudioForMadde === 'function') initAudioForMadde(madde); } catch (e) {}
    });
    hydrateMaddeRelatedSahislar(requestId, kisim, maddeNo);
    nextFrame().then(function() {
      if (requestId !== _maddeOpenRequestId) return;
      hydrateMaddeRelatedTables(requestId, kisim, maddeNo);
      hydrateMaddeIliskiliMaddeler(requestId, kisim, maddeNo, madde.baslik);
    });
  }
  if (MADDE_ENABLE_SOZLUK_LAYER) {
    if (window.sozlukData) {
      scheduleMaddeSozlukEnhancement();
    } else {
      ensureSozlukData().then(function() {
        if (requestId !== _maddeOpenRequestId) return;
        if (window.sozlukData) scheduleMaddeSozlukEnhancement();
      }).catch(function() {});
    }
  }
  // FAQ Schema + OG meta + Streak
  if (typeof addFaqSchema === 'function') addFaqSchema(madde, rawMetinSafe);
  if (typeof updateOgMeta === 'function') updateOgMeta(madde);
  if (typeof updateStreak === 'function') updateStreak();
  if (window.updateDynamicSchema) {
    try {
      window.updateDynamicSchema('breadcrumb', [
        {name: 'Ana Sayfa', url: 'https://www.ilmihal.org/'},
        {name: 'İçindekiler', url: 'https://www.ilmihal.org/icerik'},
        {name: kisimLabels[kisim], url: 'https://www.ilmihal.org/icerik'},
        {name: madde.baslik, url: 'https://www.ilmihal.org/madde/' + kisim + '/' + maddeNo}
      ]);
    } catch (e) {}
  }
}

// Madde metninde arama kelimelerini highlight'la ve en uygun bölgeye scroll et
function highlightAndScroll(container, query) {
  const normQ = normalizeSearch(query);
  const qWords = normQ.split(/\s+/).filter(w => w.length >= 3);
  if (qWords.length === 0) return;

  // Her kelime için varyantları topla (kelime bazlı gruplandırılmış)
  const wordGroups = qWords.map(w => {
    const vars = [w];
    if (typeof wordVariants === 'function') {
      wordVariants(w).forEach(v => { if (v !== w && v.length >= 3) vars.push(v); });
    }
    return vars;
  });
  const allVars = wordGroups.flat();

  // Tam metin üzerinde önce en iyi bölgeyi bul (highlight'tan önce)
  const fullText = container.textContent || '';
  const normFull = normalizeSearch(fullText);

  // ~500 karakterlik pencereler içinde en çok farklı kelime eşleşen yeri bul
  const WINDOW = 500;
  let bestOffset = 0;
  let bestScore = -1;

  for (let pos = 0; pos < normFull.length; pos += 100) {
    const windowText = normFull.substring(pos, pos + WINDOW);
    let score = 0;
    let uniqueWords = 0;
    wordGroups.forEach(vars => {
      const found = vars.some(v => {
        const i = windowText.indexOf(v);
        return i !== -1 && (i === 0 || windowText[i - 1] === ' ');
      });
      if (found) { score += 3; uniqueWords++; }
    });
    // Çok kelime eşleşmesi bonus
    score += uniqueWords * uniqueWords;
    if (score > bestScore) {
      bestScore = score;
      bestOffset = pos;
    }
  }

  // En iyi bölge civarındaki karakter aralığı (±300 karakter genişlet)
  const highlightStart = Math.max(0, bestOffset - 300);
  const highlightEnd = Math.min(normFull.length, bestOffset + WINDOW + 300);

  // TreeWalker ile text node'ları tara
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  let charCount = 0;
  let node;
  while ((node = walker.nextNode())) {
    const len = node.textContent.length;
    const nodeStart = charCount;
    const nodeEnd = charCount + len;
    charCount = nodeEnd;
    textNodes.push({ node, nodeStart, nodeEnd });
  }

  let scrollTarget = null;
  let totalMarks = 0;
  const MAX_MARKS = 25;

  textNodes.forEach(({ node: tn, nodeStart, nodeEnd }) => {
    if (totalMarks >= MAX_MARKS) return;
    // Sadece en iyi bölge civarındaki node'ları highlight'la
    if (nodeEnd < highlightStart || nodeStart > highlightEnd) return;

    const original = tn.textContent;
    const normText = normalizeSearch(original);
    if (!normText) return;

    const positions = [];
    for (const v of allVars) {
      let from = 0;
      while (from < normText.length) {
        const i = normText.indexOf(v, from);
        if (i === -1) break;
        if (i === 0 || normText[i - 1] === ' ') {
          positions.push({ start: i, end: i + v.length });
        }
        from = i + 1;
      }
    }
    if (positions.length === 0) return;

    positions.sort((a, b) => a.start - b.start);
    const merged = [];
    for (const p of positions) {
      if (merged.length && p.start <= merged[merged.length - 1].end) {
        merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, p.end);
      } else {
        merged.push({ ...p });
      }
    }

    const frag = document.createDocumentFragment();
    let lastEnd = 0;
    merged.forEach(({ start, end }) => {
      if (start > lastEnd) {
        frag.appendChild(document.createTextNode(original.substring(lastEnd, start)));
      }
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = original.substring(start, end);
      frag.appendChild(mark);
      if (!scrollTarget) scrollTarget = mark;
      totalMarks++;
      lastEnd = end;
    });
    if (lastEnd < original.length) {
      frag.appendChild(document.createTextNode(original.substring(lastEnd)));
    }

    tn.parentNode.replaceChild(frag, tn);
  });

  if (scrollTarget) {
    setTimeout(() => {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

// ===== İLGİLİ ŞAHİSLAR (madde içinde) =====
function getRelatedSahislar(kisim, maddeNo) {
  if (!window.sahislarData) return '';
  const key = `${kisim}/${maddeNo}`;
  const related = window.sahislarData.filter(s =>
    s.gectigiMaddeler && s.gectigiMaddeler.includes(key)
  );
  if (related.length === 0) return '';

  const items = related.slice(0, 12).map(s => {
    return `<a href="/sahis/${s.slug}" onclick="event.preventDefault();openSahis('${s.slug}')" class="related-sahis-link">
      <span class="rs-icon">${s.kategori === 'sahabi' ? '\u2739' : '\u2605'}</span>
      <span class="rs-isim">${s.isim}</span>
    </a>`;
  }).join('');

  return `<div class="related-sahislar">
    <div class="related-sahislar-title">Bu Maddede Geçen Şahıslar <span class="kavram-count-badge">${related.length}</span></div>
    ${items}
  </div>`;
}

function getRelatedTables(kisim, maddeNo) {
  if (!window.tablolarData) return '';
  const ref = `K${kisim}/M${maddeNo}`;
  const related = window.tablolarData.filter(t => t.kaynak_madde === ref);
  if (related.length === 0) return '';
  const tipIcons = {tablo:'\u25A6', liste:'\u25A4', iki_liste:'\u21C4', flowchart:'\u25A5', agac:'\u25C8'};
  const items = related.map(t =>
    `<a href="#" onclick="openTabloModal('${t.id}');return false" class="related-tablo-link">
      <span class="rt-icon">${tipIcons[t.tip] || '\u25A6'}</span>
      <span>${t.baslik}</span>
    </a>`
  ).join('');
  return `<div class="related-tablolar">
    <div class="related-tablolar-title">\u0130lgili Tablo ve Diyagramlar</div>
    ${items}
  </div>`;
}

function closeMadde() {
  _maddeOpenRequestId++;
  if (typeof okumaPaneliKapat === 'function') okumaPaneliKapat();
  if (typeof tasmaMenuKapat === 'function') tasmaMenuKapat();
  var _m = document.getElementById('madde-detay');
  if (_m && _m.style.display !== 'none') {
    var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!(rm && rm.matches)) {
      _m.classList.add('kapaniyor');
      _m.setAttribute('aria-hidden', 'true');
      setTimeout(function() {
        if (_m.classList.contains('kapaniyor')) {
          _m.classList.remove('kapaniyor');
          _m.style.display = 'none';
        }
      }, 165);
    } else {
      _m.style.display = 'none'; _m.setAttribute('aria-hidden', 'true');
    }
  }
  document.body.style.overflow = '';
  // Restore hash to parent page
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    updateHash(activePage.id.replace('page-', ''));
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('okuma-panel')?.classList.contains('acik') || document.getElementById('tasma-menu')?.classList.contains('acik')) {
      okumaPaneliKapat(); tasmaMenuKapat(); return;
    }
    if (document.getElementById('tablo-modal')?.style.display === 'flex') {
      closeTabloModal();
    } else if (document.getElementById('sahis-detay')?.style.display === 'flex') {
      closeSahis();
    } else {
      closeMadde();
    }
  }
});

document.getElementById('madde-detay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('madde-detay')) closeMadde();
});

// Focus trap for overlays
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Tab') return;
  var overlay = null;
  if (document.getElementById('sahis-detay')?.style.display === 'flex') {
    overlay = document.getElementById('sahis-detay');
  } else if (document.getElementById('madde-detay')?.style.display === 'flex') {
    overlay = document.getElementById('madde-detay');
  }
  if (!overlay) return;
  var focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  var first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// ===== ZOR KELİME HIGHLIGHT =====
// Turkish-aware lowercase: fix İ→i̇ problem, normalize combining chars
function trLower(s) {
  return s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().replace(/\u0307/g, '');
}

// Strip common Turkish suffixes to find base form
const TR_SUFFIXES = [
  // Long suffixes first
  'larından', 'lerinden', 'larının', 'lerinin', 'larında', 'lerinde',
  'larına', 'lerine', 'ların', 'lerin', 'ları', 'leri',
  'ından', 'inden', 'ünden', 'undan',
  'ının', 'inin', 'ünün', 'unun',
  'ında', 'inde', 'ünde', 'unde',
  'ına', 'ine', 'üne', 'una',
  'daki', 'deki', 'taki', 'teki',
  'lar', 'ler',
  'dan', 'den', 'tan', 'ten',
  'nın', 'nin', 'nün', 'nun',
  'dır', 'dir', 'dur', 'dür', 'tır', 'tir', 'tur', 'tür',
  'ın', 'in', 'ün', 'un',
  'da', 'de', 'ta', 'te',
  'ya', 'ye', 'na', 'ne',
  'nı', 'ni', 'nu', 'nü',
  'ı', 'i', 'u', 'ü', 'a', 'e'
];

// Dictionary-aware stemming: try shortest suffix first, prefer stems that exist in wordMap
function findByStems(lower, wordMap) {
  // Try suffixes shortest-first so we get the longest (most accurate) stem
  for (let i = TR_SUFFIXES.length - 1; i >= 0; i--) {
    const suf = TR_SUFFIXES[i];
    if (lower.length > suf.length + 2 && lower.endsWith(suf)) {
      const stem = lower.slice(0, -suf.length);
      const entry = wordMap.get(stem);
      if (entry) return entry;
    }
  }
  return null;
}

function buildSozlukIndex() {
  if (window._sozlukIndex) return window._sozlukIndex;
  const wordMap = new Map();

  function addKey(key, entry) {
    const k = trLower(key).trim();
    if (k.length < 2) return;
    if (!wordMap.has(k)) wordMap.set(k, entry);
  }

  // Phase 1: Tek-kelime girişleri (boşluk/tire içerenler atlanır)
  const altQueue = [];
  window.sozlukData.forEach(entry => {
    const kelime = entry.k;
    const parenMatch = kelime.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
    const main = parenMatch ? parenMatch[1].trim() : kelime.trim();
    const parens = parenMatch && parenMatch[2] ? parenMatch[2].trim() : null;

    if (!main.includes(' ') && !main.includes('-')) {
      addKey(main, entry);
    }

    // Parantez içi alternatifler Phase 2'ye kuyruğa al
    const isCompoundEntry = main.includes(' ') || main.includes('-');
    if (!isCompoundEntry && parens) {
      parens.split(/[,;\/]/).forEach(p => {
        const pt = p.trim();
        if (pt.length >= 2 && !pt.includes('aleyhi') && !pt.includes(' ') && !pt.includes('-')) {
          altQueue.push({ key: pt, entry });
        }
      });
    }
  });

  // Phase 2: Alternatifler — sadece boşlukları doldur
  altQueue.forEach(({ key, entry }) => addKey(key, entry));

  window._sozlukIndex = { wordMap };
  return window._sozlukIndex;
}

function makeSpan(matchedText, entry) {
  const safeAnlam = entry.a.replace(/["\u201C\u201D]/g, '&quot;').replace(/['\u2018\u2019]/g, '&#39;');
  const osmAttr = entry.o ? ` data-osmanli="${entry.o}"` : '';
  const idAttr = ` data-id="${entry.i}"`;
  const kelimeAttr = ` data-kelime="${entry.k}"`;
  const misalAttr = entry.m ? ' data-misal="1"' : '';
  return `<span class="zor-kelime" data-anlam="${safeAnlam}"${osmAttr}${idAttr}${kelimeAttr}${misalAttr}>${matchedText}</span>`;
}

function highlightWords(text) {
  if (!window.sozlukData || window.sozlukData.length === 0) return escapeHtml(text);

  const { wordMap } = buildSozlukIndex();
  let html = escapeHtml(text);

  // Single words only (multi-word pass removed: 3587 regex ops → too slow/crash on mobile)
  const parts = html.split(/(<span[^>]*class="zor-kelime"[^>]*>.*?<\/span>)/g);
  const result = parts.map(part => {
    // Skip already-highlighted spans
    if (part.startsWith('<span')) return part;

    // Split into words and whitespace
    return part.split(/(\s+|<[^>]+>)/).map(token => {
      if (/^\s+$/.test(token) || token.startsWith('<')) return token;
      const clean = token.replace(/^[.,;:!?()\[\]"'&;#\d]+|[.,;:!?()\[\]"'&;#\d]+$/g, '');
      if (clean.length < 2) return token;
      const lower = trLower(clean);
      const entry = wordMap.get(lower) || findByStems(lower, wordMap);
      if (entry) {
        const prefix = token.substring(0, token.indexOf(clean));
        const suffix = token.substring(token.indexOf(clean) + clean.length);
        return prefix + makeSpan(clean, entry) + suffix;
      }
      return token;
    }).join('');
  });

  return result.join('');
}

// ===== MADDE METNİ DİZGİSİ =====
// Metin kitabın düzeniyle saklanır: paragraflar boş satırla ayrılır; satır kırılımlı
// bloklar şiir veya cedveldir; ⟦şekil:N⟧ ve ⟦cedvel:N⟧ işaretleri kitabın o sahîfesine bağlanır.
function kitapSahifeBaglantisi(sayfa, etiket) {
  var s = parseInt(sayfa, 10);
  return '<a href="' + PDF_URL + '#page=' + s + '" target="_blank" rel="noopener" class="sayfa-link">' + escapeHtml(etiket || ('Kitabın ' + s + '. sahîfesi')) + '</a>';
}

function maddeAraBaslikMi(par) {
  if (par.length > 160) return false;
  var harfler = par.replace(/“[^”]*”/g, '').replace(/[^A-Za-zÇĞİÖŞÜÂÎÛçğıöşüâîû]/g, '');
  if (harfler.length < 3) return false;
  var buyuk = 0;
  for (var i = 0; i < harfler.length; i++) {
    var ch = harfler[i];
    if (ch === ch.toLocaleUpperCase('tr') && ch !== ch.toLocaleLowerCase('tr')) buyuk++;
  }
  return buyuk / harfler.length >= 0.7;
}

function maddeMetniHTML(raw, sozluklu) {
  var cevir = sozluklu ? highlightWords : escapeHtml;
  return String(raw || '').split(/\n{2,}/).map(function(par) {
    if (!par.trim()) return '';
    var sekil = par.match(/^⟦şekil:(\d+)⟧$/);
    if (sekil) {
      return '<div class="madde-sekil">Kitapta burada bir şekil vardır: ' + kitapSahifeBaglantisi(sekil[1], 'şekli ' + sekil[1] + '. sahîfede görün') + '</div>';
    }
    var cedvel = par.match(/^⟦cedvel:(\d+)⟧\n([\s\S]*)$/);
    if (cedvel) {
      return '<figure class="madde-cedvel"><pre>' + escapeHtml(cedvel[2]) + '</pre><figcaption>' + kitapSahifeBaglantisi(cedvel[1], 'Kitaptaki aslı: ' + cedvel[1] + '. sahîfe') + '</figcaption></figure>';
    }
    if (par.indexOf('\n') !== -1) {
      if (/\S {2,}\S/.test(par)) return '<pre class="madde-tablo">' + escapeHtml(par) + '</pre>';
      return '<p class="madde-siir">' + cevir(par).replace(/\n/g, '<br>') + '</p>';
    }
    if (/^\[\d\] /.test(par)) return '<p class="madde-dipnot">' + cevir(par) + '</p>';
    if (maddeAraBaslikMi(par)) return '<p class="madde-ara-baslik">' + cevir(par) + '</p>';
    return '<p>' + cevir(par) + '</p>';
  }).join('');
}

// ===== TOOLTIP =====
let _tooltipHideTimer = null;

// Sözlük ipucu ve açılır kutusu kapsayıcıya tek seferde bağlanır (olay delegasyonu). Kelime
// başına dinleyici, metin innerHTML ile yeniden yazılınca (vurgu, çapraz bağlantı) kayboluyordu.
function zorKelimeHedefi(e) {
  return e.target && e.target.closest ? e.target.closest('.zor-kelime') : null;
}

function bindSozlukTooltipListeners(container) {
  if (!container || container.dataset.sozlukIpucu === '1') return;
  container.dataset.sozlukIpucu = '1';
  container.addEventListener('mouseover', function(e) {
    var el = zorKelimeHedefi(e);
    if (el) showTooltip({ target: el });
  });
  container.addEventListener('mouseout', function(e) {
    var el = zorKelimeHedefi(e);
    if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) hideTooltip();
  });
}

function resetSozlukBindingState(container) {
  if (!container) return;
  delete container.dataset.sozlukIpucu;
  delete container.dataset.sozlukKutusu;
}

function showTooltip(e) {
  clearTimeout(_tooltipHideTimer);
  const el = e.target;
  const tooltip = document.getElementById('sozluk-tooltip');
  const anlam = el.dataset.anlam;
  if (!anlam) return;

  let html = '';
  const osmanli = el.dataset.osmanli;
  if (osmanli) {
    html += '<span class="tooltip-osmanli">' + osmanli + '</span>';
  }
  html += '<span class="tooltip-anlam">' + anlam + '</span>';

  const entryId = el.dataset.id;
  if (entryId && el.dataset.misal) {
    html += '<div class="tooltip-link"><a href="#" onclick="event.preventDefault();event.stopPropagation();showSozlukModal(' + entryId + ');return false;">Ayr\u0131nt\u0131lar \u2192</a></div>';
  }

  tooltip.innerHTML = html;
  tooltip.style.display = 'block';

  const rect = el.getBoundingClientRect();
  tooltip.style.visibility = 'hidden';
  tooltip.style.top = '0';
  tooltip.style.left = '0';
  const tipH = tooltip.offsetHeight;
  const tipW = tooltip.offsetWidth;
  tooltip.style.visibility = '';

  let left = rect.left + rect.width/2 - tipW/2;
  left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
  tooltip.style.left = left + 'px';

  const spaceAbove = rect.top;
  if (spaceAbove > tipH + 8) {
    tooltip.style.top = (rect.top - tipH - 6) + 'px';
    tooltip.classList.remove('tooltip-below');
    tooltip.classList.add('tooltip-above');
  } else {
    tooltip.style.top = (rect.bottom + 6) + 'px';
    tooltip.classList.remove('tooltip-above');
    tooltip.classList.add('tooltip-below');
  }
}

function hideTooltip() {
  _tooltipHideTimer = setTimeout(() => {
    document.getElementById('sozluk-tooltip').style.display = 'none';
  }, 200);
}

// Tooltip üzerine gelince kapanmasın
(function() {
  const tip = document.getElementById('sozluk-tooltip');
  if (tip) {
    tip.addEventListener('mouseenter', () => clearTimeout(_tooltipHideTimer));
    tip.addEventListener('mouseleave', hideTooltip);
  }
})();

// ===== SÖZLÜK MODAL =====
function showSozlukModal(entryId) {
  // Tooltip'i gizle
  clearTimeout(_tooltipHideTimer);
  document.getElementById('sozluk-tooltip').style.display = 'none';

  if (!window.sozlukData) return;
  const entry = window.sozlukData.find(s => s.i === entryId);
  if (!entry) return;

  // Varsa eski modalı kaldır
  let overlay = document.getElementById('sozluk-modal-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'sozluk-modal-overlay';
  overlay.className = 'sozluk-modal-overlay';

  let misalHtml = '';
  if (entry.m) {
    misalHtml = '<div class="sozluk-modal-misal"><strong>Misal:</strong> ' + entry.m + '</div>';
  }
  let bkzHtml = '';
  if (entry.b) {
    bkzHtml = '<div class="sozluk-modal-bkz">Bkz. ' + entry.b + '</div>';
  }

  overlay.innerHTML = `
    <div class="sozluk-modal">
      <button class="sozluk-modal-close" onclick="closeSozlukModal()">&times;</button>
      <div class="sozluk-modal-header">
        <div class="sozluk-modal-kelime">${entry.k}</div>
        ${entry.o ? '<div class="sozluk-modal-osmanli">' + entry.o + '</div>' : ''}
      </div>
      <div class="sozluk-modal-anlam">${entry.a}</div>
      ${misalHtml}
      ${bkzHtml}
    </div>
  `;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSozlukModal();
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
}

function closeSozlukModal() {
  const overlay = document.getElementById('sozluk-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 200);
  }
}

// ===== SÖZLÜK =====
let sozlukLoaded = false;
const SOZLUK_SAYFA_BOYUTU = 100;
let _sozlukSayfa = 1;

function loadSozluk(filterText) {
  sozlukLoaded = true;
  const list = document.getElementById('sozluk-list');
  const countEl = document.getElementById('sozluk-count');
  if (!window.sozlukData) { list.innerHTML = '<div class="loading">S\u00f6zl\u00fck y\u00fckleniyor...</div>'; return; }

  const rawSozlukSearch = filterText || document.getElementById('sozluk-search')?.value || '';

  let filtered = window.sozlukData;
  if (rawSozlukSearch) {
    const { wordVarLists: szVarLists } = expandSearchQuery(rawSozlukSearch);
    filtered = filtered.filter(s => {
      const nk = normalizeSearch(s.k || '');
      const na = normalizeSearch(s.a || '');
      const check = v => includesWordStart(nk, v) || includesWordStart(na, v);
      return szVarLists.every(wvars => wvars.some(check));
    });
  }

  filtered.sort((a, b) => a.k.localeCompare(b.k, 'tr'));

  // Sayfalama
  const toplam = filtered.length;
  const toplamSayfa = Math.max(1, Math.ceil(toplam / SOZLUK_SAYFA_BOYUTU));
  if (_sozlukSayfa > toplamSayfa) _sozlukSayfa = toplamSayfa;
  const baslangic = (_sozlukSayfa - 1) * SOZLUK_SAYFA_BOYUTU;
  const sayfaVerisi = filtered.slice(baslangic, baslangic + SOZLUK_SAYFA_BOYUTU);

  let html = '';
  sayfaVerisi.forEach(s => {
    const osmanli = s.o ? `<div class="sozluk-osmanli">${s.o}</div>` : '';
    const bkzHtml = s.b ? `<div class="sozluk-bkz">Bkz. ${s.b}</div>` : '';
    html += `
      <div class="sozluk-item" id="sozluk-entry-${s.i}">
        <div class="sozluk-kelime-row">
          <div class="sozluk-kelime">${s.k}</div>
          ${osmanli}
        </div>
        <div class="sozluk-anlam">${s.a}</div>
        ${s.m ? `<div class="sozluk-misal">${s.m}</div>` : ''}
        ${bkzHtml}
      </div>
    `;
  });

  // Sayfalama kontrolleri
  if (toplamSayfa > 1) {
    html += '<div class="sozluk-pagination">';
    html += `<button onclick="_sozlukSayfa=1;loadSozluk()" ${_sozlukSayfa===1?'disabled':''}>&#171;</button>`;
    html += `<button onclick="_sozlukSayfa--;loadSozluk()" ${_sozlukSayfa===1?'disabled':''}>&#8249;</button>`;
    html += `<span class="sozluk-sayfa-bilgi">${_sozlukSayfa} / ${toplamSayfa}</span>`;
    html += `<button onclick="_sozlukSayfa++;loadSozluk()" ${_sozlukSayfa===toplamSayfa?'disabled':''}>&#8250;</button>`;
    html += `<button onclick="_sozlukSayfa=${toplamSayfa};loadSozluk()" ${_sozlukSayfa===toplamSayfa?'disabled':''}>&#187;</button>`;
    html += '</div>';
  }

  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Kelime bulunamad\u0131.</p>';
  countEl.textContent = `${toplam.toLocaleString("tr-TR")} kelime${toplam > SOZLUK_SAYFA_BOYUTU ? ' \u00b7 Sayfa ' + _sozlukSayfa + '/' + toplamSayfa : ''}`;
  // Sayfanın başına scroll
  list.scrollTop = 0;
}

document.getElementById('sozluk-search')?.addEventListener('input', () => {
  _sozlukSayfa = 1;
  loadSozluk();
});

// ===== ŞAHİSLAR =====
let sahislarLoaded = false;

async function loadSahislar() {
  sahislarLoaded = true;
  const list = document.getElementById('sahislar-list');
  if (!list) return;
  if (!window.sahislarData || window.sahislarData.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:60px;">Şahıs verileri yükleniyor...</p>';
    try {
      await ensureSahislarData();
    } catch (e) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:60px;">Şahıs verileri yüklenemedi.</p>';
      return;
    }
  }

  const searchText = (document.getElementById('sahis-search')?.value || '').toLowerCase();

  let filtered = window.sahislarData;

  if (searchText) filtered = filtered.filter(s =>
    s.isim.toLowerCase().includes(searchText) ||
    (s.unvan || '').toLowerCase().includes(searchText) ||
    (s.biyografi || '').toLowerCase().includes(searchText)
  );

  filtered.sort((a, b) => a.isim.localeCompare(b.isim, 'tr'));

  let html = '';
  filtered.forEach(s => {
    const shortBio = s.biyografi ? s.biyografi.substring(0, 100) + (s.biyografi.length > 100 ? '...' : '') : '';
    html += `
      <div class="sahis-card" onclick="openSahis('${s.slug}')">
        <div class="sahis-card-body">
          <div class="sahis-card-isim">${s.isim}</div>
          ${s.unvan ? `<div class="sahis-card-unvan">${s.unvan}</div>` : ''}
          ${shortBio ? `<div class="sahis-card-bio">${shortBio}</div>` : ''}
        </div>
      </div>
    `;
  });

  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Şahıs bulunamadı.</p>';
}

document.getElementById('sahis-search')?.addEventListener('input', () => { void loadSahislar(); });

async function openSahis(slug, fromRoute) {
  if (!window.sahislarData) {
    try {
      await ensureSahislarData();
    } catch (e) {
      return;
    }
  }

  const sahis = window.sahislarData.find(s => s.slug === slug);
  if (!sahis) return;

  if (!fromRoute) updateHash(`sahis/${slug}`);

  // SEO meta: kapatınca önceki sayfanınkine dönülür
  try {
    if (!window.__sahisOncekiSeo) {
      var _can = document.querySelector('link[rel="canonical"]');
      var _desc = document.querySelector('meta[name="description"]');
      window.__sahisOncekiSeo = [document.title, _desc ? _desc.getAttribute('content') : '', _can ? _can.href : ''];
    }
    var _bio = String(sahis.biyografi || '').replace(/\s+/g, ' ').trim();
    updateSeoMeta(
      sahis.isim + ' - Se\'âdet-i Ebediyye',
      (_bio ? _bio.slice(0, 155) + (_bio.length > 155 ? '…' : '') : sahis.isim + ' hakkında Se\'âdet-i Ebediyye\'deki hâl tercemesi.'),
      'https://www.ilmihal.org/sahis/' + slug
    );
  } catch (e) {}

  const body = document.getElementById('sahis-body');
  var _s = document.getElementById('sahis-detay');
  if (_s) { _s.style.display = 'flex'; _s.setAttribute('aria-hidden', 'false'); }
  document.body.style.overflow = 'hidden';

  const kisimLabels = { 1: 'I', 2: 'II', 3: 'III' };

  let html = `
    <div class="sahis-detail-header">
      <div>
        <h3>${sahis.isim}</h3>
        ${sahis.unvan ? `<div class="sahis-detail-unvan">${sahis.unvan}</div>` : ''}
      </div>
    </div>
  `;

  if (sahis.biyografi) {
    html += `<div class="sahis-detail-section">
      <h4>Hâl Tercemesi</h4>
      <div class="sahis-biyografi">${String(sahis.biyografi).split(/\n+/).map(function(p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('')}</div>
    </div>`;
  }

  if (sahis.gectigiMaddeler && sahis.gectigiMaddeler.length > 0) {
    html += `<div class="sahis-detail-section">
      <h4>Geçtiği Maddeler <span class="kavram-count-badge">${sahis.gectigiMaddeler.length}</span></h4>
      <div class="kavram-madde-list">
        ${sahis.gectigiMaddeler.map(ref => {
          const parts = ref.split('/');
          const kisim = parseInt(parts[0]);
          const maddeNo = parseInt(parts[1]);
          const m = window.tocData?.find(t => t.kisim === kisim && t.madde_no === maddeNo);
          if (!m) return '';
          return `<a href="#" onclick="closeSahis();openMadde(${kisim},${maddeNo});return false" class="kavram-madde-link">
            <span class="rm-badge">${kisimLabels[kisim]}-${maddeNo}</span>
            <span>${m.baslik}</span>
          </a>`;
        }).filter(Boolean).join('')}
      </div>
    </div>`;
  }

  html += `<div class="sahis-kaynak">
    <strong>Kaynak:</strong> ${sahis.kaynak}
  </div>`;

  body.innerHTML = html;
}

function closeSahis() {
  var _s = document.getElementById('sahis-detay');
  if (_s) { _s.style.display = 'none'; _s.setAttribute('aria-hidden', 'true'); }
  if (window.__sahisOncekiSeo) {
    try { updateSeoMeta.apply(null, window.__sahisOncekiSeo); } catch (e) {}
    window.__sahisOncekiSeo = null;
  }
  // If madde overlay is open behind, return to it (don't navigate away)
  const maddeOverlay = document.getElementById('madde-detay');
  if (maddeOverlay && maddeOverlay.style.display === 'flex') {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
    updateHash('sahislar');
  }
}

document.getElementById('sahis-detay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('sahis-detay')) closeSahis();
});

// ===== FEVÂİD =====
let fevaidLoaded = false;
let tablolarLoaded = false;

const tabloKatLabels = {
  itikat: '\u0130man ve \u0130tikat', temizlik: 'Temizlik', namaz: 'Namaz',
  oruc: 'Oru\u00e7', zekat: 'Zek\u00e2t', hac: 'Hac ve Umre',
  aile: 'Aile Hukuku', cenaze: 'Cen\u00e2ze', muamelat: "Mu'\u00e2mel\u00e2t"
};
const tabloKatOrder = ['itikat','temizlik','namaz','oruc','zekat','hac','aile','cenaze','muamelat'];

let tabloActiveKat = 'all';
let tabloSearchText = '';
let tabloSortMode = 'kategori';

function loadFevaid() {
  fevaidLoaded = true;
  const count = window.tablolarData?.filter(t => t.id !== 'konu_haritasi' && t.id !== 'kitabin_tanimlari').length || 0;
  const el = document.getElementById('fevaid-count-tablolar');
  if (el) el.textContent = count + ' tablo';
}

function openFevaidSection(section) {
  document.getElementById('fevaid-home').style.display = 'none';
  document.querySelectorAll('.fevaid-section').forEach(s => { s.style.display = 'none'; });
  const el = document.getElementById('fevaid-section-' + section);
  if (el) el.style.display = '';
  window.scrollTo(0, 0);
  if (section === 'tablolar') {
    updateUrl('fevaid/tablolar');
    if (!tablolarLoaded) loadTablolar();
  }
  if (section === 'tanimlar') {
    const wrapper = document.getElementById('tanimlar-fevaid-wrapper');
    if (wrapper && !wrapper.dataset.loaded) {
      wrapper.innerHTML = renderTanimlar('fevaid-main');
      wrapper.dataset.loaded = '1';
    }
  }
}

function closeFevaidSection() {
  document.getElementById('fevaid-home').style.display = '';
  document.querySelectorAll('.fevaid-section').forEach(s => { s.style.display = 'none'; });
  window.scrollTo(0, 0);
}

function loadTablolar(filterKat, filterText) {
  tablolarLoaded = true;
  const grid = document.getElementById('tablolar-grid');
  const countEl = document.getElementById('tablo-count');
  if (!window.tablolarData) { grid.innerHTML = '<div class="loading">Tablolar y\u00fckleniyor...</div>'; return; }

  const katFilter = filterKat || tabloActiveKat || 'all';
  const searchText = (filterText !== undefined ? filterText : tabloSearchText || '').toLowerCase();
  tabloActiveKat = katFilter;
  tabloSearchText = searchText;

  let allItems = window.tablolarData.filter(t => t.id !== 'konu_haritasi' && t.id !== 'kitabin_tanimlari');
  if (katFilter !== 'all') allItems = allItems.filter(t => t.kategori === katFilter);
  if (searchText) allItems = allItems.filter(t =>
    t.baslik.toLowerCase().includes(searchText) ||
    t.kaynak_metin.toLowerCase().includes(searchText) ||
    (t.kaynak_madde || '').toLowerCase().includes(searchText)
  );

  let html = '';
  if (tabloSortMode === 'kitap') {
    // Kitap sırasıyla — sayfa numarasına göre
    allItems.sort((a, b) => (a.sayfa_no || 0) - (b.sayfa_no || 0));
    allItems.forEach(tablo => { html += renderTabloCard(tablo); });
  } else if (katFilter === 'all') {
    for (const kat of tabloKatOrder) {
      const items = allItems.filter(t => t.kategori === kat);
      if (items.length === 0) continue;
      html += `<div class="tablo-kategori-baslik tablo-kat-${kat}"><span>${tabloKatLabels[kat]}</span><span class="tablo-kat-count">${items.length}</span></div>`;
      items.forEach(tablo => { html += renderTabloCard(tablo); });
    }
    // genel ones without category label
    const genel = allItems.filter(t => !tabloKatOrder.includes(t.kategori));
    if (genel.length > 0) {
      html += `<div class="tablo-kategori-baslik tablo-kat-genel"><span>Genel</span><span class="tablo-kat-count">${genel.length}</span></div>`;
      genel.forEach(tablo => { html += renderTabloCard(tablo); });
    }
  } else {
    allItems.forEach(tablo => { html += renderTabloCard(tablo); });
  }

  const total = allItems.length;
  countEl.textContent = searchText ? `${total} tablo bulundu` : `${total} tablo`;
  grid.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Tablo bulunamad\u0131.</p>';
}

function parseKaynakMadde(ref) {
  if (!ref) return { kisim: 0, maddeNo: 0 };
  const m = ref.match(/K(\d+)\/M(\d+)/);
  return m ? { kisim: parseInt(m[1]), maddeNo: parseInt(m[2]) } : { kisim: 0, maddeNo: 0 };
}

function kaynakMaddeLink(ref, searchHint) {
  const { kisim, maddeNo } = parseKaynakMadde(ref);
  if (!kisim) return ref || '';
  const madde = window.tocData?.find(t => t.kisim === kisim && t.madde_no === maddeNo);
  const title = madde ? madde.baslik : ref;
  const sq = searchHint ? escapeSearchQ(searchHint) : '';
  const sqParam = sq ? `,false,'${sq}'` : '';
  return `<a href="#" onclick="openMadde(${kisim},${maddeNo}${sqParam});return false" class="tablo-madde-link" title="${title}">${ref}</a>`;
}

function renderTabloCard(tablo) {
  const tipIcons = {tablo:'\u25A6', liste:'\u25A4', iki_liste:'\u21C4', flowchart:'\u25A5', agac:'\u25C8'};
  return `
    <div class="tablo-card tablo-kat-${tablo.kategori}" id="tablo-${tablo.id}">
      <div class="tablo-card-header" onclick="openTabloDetay('${tablo.id}')" style="cursor:pointer" title="Tablo sayfasını aç">
        <h4>${tipIcons[tablo.tip] || '\u25A6'} ${tablo.baslik}</h4>
        <div class="tablo-card-ref">
          <span class="tablo-ref-madde" onclick="event.stopPropagation()">${kaynakMaddeLink(tablo.kaynak_madde)}</span>
          <span class="tablo-ref-sayfa" onclick="event.stopPropagation()">${sayfaLink(tablo.sayfa_no, 's. ' + tablo.sayfa_no)}</span>
        </div>
      </div>
      <div class="tablo-card-body">
        ${renderTabloBody(tablo)}
        ${tablo.kaynak_metin ? `<div class="tablo-kaynak">
          <strong>Kitaptan:</strong> ${tablo.kaynak_metin}
        </div>` : ''}
      </div>
    </div>
  `;
}

document.getElementById('tablo-search')?.addEventListener('input', (e) => {
  loadTablolar(tabloActiveKat, e.target.value);
});

document.querySelectorAll('.tablo-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tablo-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadTablolar(btn.dataset.kat, tabloSearchText);
  });
});

document.querySelectorAll('.tablo-sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tablo-sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabloSortMode = btn.dataset.sort;
    // Kitap sırasında kategori filtreleri gizle
    const katFilters = document.querySelector('.tablo-kat-filters');
    if (katFilters) katFilters.style.display = tabloSortMode === 'kitap' ? 'none' : '';
    loadTablolar(tabloSortMode === 'kitap' ? 'all' : tabloActiveKat, tabloSearchText);
  });
});

// ===== TABLO MODAL =====
function openTabloModal(id) {
  if (!window.tablolarData) return;
  const tablo = window.tablolarData.find(t => t.id === id);
  if (!tablo) return;
  const tipIcons = {tablo:'\u25A6', liste:'\u25A4', iki_liste:'\u21C4', flowchart:'\u25A5', agac:'\u25C8'};
  const tipLabels = {tablo:'Tablo', liste:'Liste', iki_liste:'İki Liste', flowchart:'Akış', agac:'Ağaç'};
  const { kisim: mKisim, maddeNo: mNo } = parseKaynakMadde(tablo.kaynak_madde);
  const body = document.getElementById('tablo-modal-body');
  body.innerHTML = `
    <div class="tablo-card tablo-kat-${tablo.kategori}" style="border:none;border-radius:0;box-shadow:none">
      <div class="tablo-card-header" style="position:relative;cursor:default">
        <div>
          <h4 style="font-size:1.1rem">${tipIcons[tablo.tip] || '\u25A6'} ${tablo.baslik}</h4>
          <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
            <span class="tablo-meta-badge tablo-kat-${tablo.kategori}" style="font-size:0.72rem">${tabloKatLabels[tablo.kategori] || 'Genel'}</span>
            <span style="font-size:0.78rem;color:var(--text-muted)">${kaynakMaddeLink(tablo.kaynak_madde)}</span>
            <span style="font-size:0.78rem;color:var(--text-muted)">${sayfaLink(tablo.sayfa_no, 's.\u00a0' + tablo.sayfa_no)}</span>
          </div>
        </div>
        <button type="button" onclick="closeTabloModal()" style="position:absolute;top:12px;right:14px;background:rgba(255,255,255,0.25);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;color:var(--primary-dark);flex-shrink:0">\u00d7</button>
      </div>
      <div class="tablo-card-body" style="max-height:50vh;overflow-y:auto">
        ${renderTabloBody(tablo)}
      </div>
      ${tablo.kaynak_metin ? `<div class="tablo-kaynak">
        <strong>Kitaptan:</strong> ${tablo.kaynak_metin}
      </div>` : ''}
      <div class="tablo-modal-actions">
        <button type="button" class="btn btn-primary" onclick="closeTabloModal();closeMadde();goToTabloDetay('${tablo.id}')">
          Tablo Sayfasına Git \u2192
        </button>
      </div>
    </div>
  `;
  var _t = document.getElementById('tablo-modal');
  if (_t) { _t.style.display = 'flex'; _t.setAttribute('aria-hidden', 'false'); }
  document.body.style.overflow = 'hidden';
}

function closeTabloModal() {
  var _t = document.getElementById('tablo-modal');
  if (_t) { _t.style.display = 'none'; _t.setAttribute('aria-hidden', 'true'); }
  // Madde overlay açıksa, body overflow hidden kalsın
  if (document.getElementById('madde-detay')?.style.display === 'flex') {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

// Tablo modal click-outside
document.getElementById('tablo-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('tablo-modal')) closeTabloModal();
});

// ===== TABLO DETAY SAYFASI =====
function openTabloDetay(id) {
  if (!window.tablolarData) return;
  const tablo = window.tablolarData.find(t => t.id === id);
  if (!tablo) return;

  const tipIcons = {tablo:'\u25A6', liste:'\u25A4', iki_liste:'\u21C4', flowchart:'\u25A5', agac:'\u25C8'};

  // Sayfa sırasına göre prev/next bul
  const sorted = window.tablolarData
    .filter(t => t.id !== 'konu_haritasi' && t.id !== 'kitabin_tanimlari')
    .sort((a, b) => (a.sayfa_no || 0) - (b.sayfa_no || 0));
  const idx = sorted.findIndex(t => t.id === id);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  // Kaynak madde başlığını bul
  const { kisim, maddeNo } = parseKaynakMadde(tablo.kaynak_madde);
  const madde = window.tocData?.find(t => t.kisim === kisim && t.madde_no === maddeNo);
  const maddeTitle = madde ? madde.baslik : '';

  // Fevaid sectionları gizle, tablo-detay göster
  document.getElementById('fevaid-home').style.display = 'none';
  document.querySelectorAll('.fevaid-section').forEach(s => { s.style.display = 'none'; });
  const detayEl = document.getElementById('fevaid-section-tablo-detay');
  detayEl.style.display = '';

  const content = document.getElementById('tablo-detay-content');
  content.innerHTML = `
    <button type="button" class="fevaid-back-btn" onclick="closeTabloDetay()">\u2190 Tablolar</button>
    <div class="tablo-detay-page">
      <div class="tablo-card tablo-kat-${tablo.kategori}" style="margin-bottom:0">
        <div class="tablo-card-header">
          <h4>${tipIcons[tablo.tip] || '\u25A6'} ${tablo.baslik}</h4>
          <div class="tablo-card-ref">
            ${tablo.kaynak_madde ? kaynakMaddeLink(tablo.kaynak_madde) : ''}
            ${sayfaLink(tablo.sayfa_no, 's.\u00a0' + tablo.sayfa_no)}
          </div>
        </div>
        <div class="tablo-detay-meta" style="padding:8px 24px 0">
          <span class="tablo-meta-badge tablo-kat-${tablo.kategori}">${tabloKatLabels[tablo.kategori] || 'Genel'}</span>
          ${tablo.kaynak_madde && maddeTitle ? `<span class="tablo-meta-item" style="color:var(--text-muted);font-size:0.85rem">${maddeTitle}</span>` : ''}
        </div>
        <div class="tablo-card-body">
          ${renderTabloBody(tablo)}
        </div>
        ${tablo.kaynak_metin ? `<div class="tablo-kaynak">
          <strong>Kitaptan:</strong> ${tablo.kaynak_metin}
        </div>` : ''}
      </div>
      <div class="tablo-detay-nav">
        ${prev ? `<button type="button" class="tablo-nav-btn tablo-nav-prev" onclick="openTabloDetay('${prev.id}')">
          <small>\u2190 \u00d6nceki</small><span>${prev.baslik}</span>
        </button>` : '<div></div>'}
        ${next ? `<button type="button" class="tablo-nav-btn tablo-nav-next" onclick="openTabloDetay('${next.id}')">
          <small>Sonraki \u2192</small><span>${next.baslik}</span>
        </button>` : '<div></div>'}
      </div>
    </div>
  `;


  window.scrollTo(0, 0);
  updateUrl('fevaid/tablolar/' + id);
  updateSeoMeta(
    tablo.baslik + ' - Se\'âdet-i Ebediyye',
    tablo.kaynak_metin || (tablo.baslik + '. Se\'âdet-i Ebediyye\'den derlenen tablo.'),
    'https://www.ilmihal.org/fevaid/tablolar/' + id
  );
}

function closeTabloDetay() {
  document.getElementById('fevaid-section-tablo-detay').style.display = 'none';
  openFevaidSection('tablolar');
}

function renderTabloBody(tablo) {
  if (tablo.tip === 'tablo' && tablo.veriler) return renderTable(tablo.veriler, tablo.kolonlar);
  if (tablo.tip === 'flowchart' && tablo.veriler) return renderFlowchart(tablo.veriler);
  if (tablo.tip === 'liste' && tablo.veriler) return renderListe(tablo.veriler);
  if (tablo.tip === 'iki_liste' && tablo.veriler) return renderIkiListe(tablo.veriler, tablo.sol_baslik, tablo.sag_baslik);
  if (tablo.tip === 'agac') return renderAgac(tablo);
  if (tablo.tip === 'tanimlar') return renderTanimlar(tablo.id);
  return '<p>Tablo verisi y\u00fckleniyor...</p>';
}

function renderAgac(tablo) {
  // konu_haritasi format: veriler[] with {id, baslik, maddeler}
  if (tablo.veriler && Array.isArray(tablo.veriler)) {
    let html = '<div class="agac-tree">';
    tablo.veriler.forEach(dal => {
      html += `<div class="agac-branch"><div class="agac-branch-title">${dal.baslik || ''}</div>`;
      if (dal.maddeler && dal.maddeler.length > 0) {
        html += '<div class="agac-leaves">';
        dal.maddeler.forEach(m => { html += `<span class="agac-leaf">${m}</span>`; });
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    return html;
  }
  // dallar format: dallar[] with {baslik, aciklama, alt?[]}
  if (tablo.dallar && Array.isArray(tablo.dallar)) {
    function renderDallar(dallar) {
      let html = '<ul class="agac-dallar">';
      dallar.forEach(dal => {
        html += `<li class="agac-dal"><strong>${dal.baslik || ''}</strong>`;
        if (dal.aciklama) html += `<div class="agac-aciklama">${dal.aciklama}</div>`;
        if (dal.alt && dal.alt.length > 0) html += renderDallar(dal.alt);
        html += '</li>';
      });
      html += '</ul>';
      return html;
    }
    return '<div class="agac-tree">' + renderDallar(tablo.dallar) + '</div>';
  }
  return '<p>Ağaç verisi yükleniyor...</p>';
}

function renderTanimlar(id) {
  if (!window.tanimlarData) return '<p>Tanımlar yükleniyor...</p>';
  const containerId = 'tanimlar-container-' + id;
  const inputId = 'tanimlar-search-' + id;
  setTimeout(() => {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    if (!input || !container) return;
    function renderRows(q) {
      const qn = q ? normalizeSearch(q) : '';
      let rows;
      if (!qn) {
        rows = window.tanimlarData;
      } else {
        const { wordVarLists } = expandSearchQuery(q);
        rows = window.tanimlarData.filter(d => {
          const tn = normalizeSearch(d.t);
          const cn = normalizeSearch(d.c);
          return wordVarLists.every(vars => vars.some(v => tn.includes(v) || cn.includes(v)));
        });
      }
      let html = '<table class="tanimlar-table"><thead><tr><th>Terim</th><th>Kitaptaki Tanım</th><th>S.</th></tr></thead><tbody>';
      rows.forEach(d => {
        html += `<tr><td class="tanimlar-terim">${escapeHtml(d.t)}</td><td class="tanimlar-cumle">${escapeHtml(d.c)}</td><td class="tanimlar-sayfa">${d.s}</td></tr>`;
      });
      html += '</tbody></table>';
      html += `<div class="tanimlar-count">${rows.length} tanım gösteriliyor</div>`;
      container.innerHTML = html;
    }
    input.addEventListener('input', () => renderRows(input.value));
    renderRows('');
  }, 0);
  return `<div class="tanimlar-search-wrap"><input id="${inputId}" type="text" placeholder="Terim veya tanımda ara…" class="tanimlar-search-input" autocomplete="off"></div><div id="${containerId}"></div>`;
}

function renderTable(veriler, kolonlar) {
  if (!veriler || veriler.length === 0) return '';
  const cols = kolonlar || Object.keys(veriler[0]);
  let html = '<table><thead><tr>';
  cols.forEach(c => { html += `<th>${c}</th>`; });
  html += '</tr></thead><tbody>';
  veriler.forEach(row => {
    html += '<tr>';
    cols.forEach(c => { html += `<td>${row[c] || ''}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function renderFlowchart(veriler) {
  let html = '<div class="flowchart">';
  veriler.forEach((step, i) => {
    html += `
      <div class="flow-step">
        <div class="flow-num">${i + 1}</div>
        <div class="flow-content">
          <strong>${step.baslik || step.adim || ''}</strong>
          <span>${step.aciklama || step.detay || ''}</span>
        </div>
      </div>
    `;
  });
  html += '</div>';
  return html;
}

function renderListe(veriler) {
  const KIRMIZI = ['bozar', 'haram', 'tahrîmen mekrûh', 'tenzîhen mekrûh', 'alamaz'];
  const YESIL   = ['sünnet', 'sunnet', 'vâcib', 'farz', 'câiz'];
  let html = '<ul class="check-list">';
  veriler.forEach(item => {
    let icon;
    if (KIRMIZI.includes(item.durum)) {
      icon = '<span class="check-icon check-no">&#10007;</span>';
    } else if (YESIL.includes(item.durum)) {
      icon = '<span class="check-icon check-yes">&#10003;</span>';
    } else {
      icon = '<span class="check-icon check-neutral">&#8226;</span>';
    }
    html += `<li>${icon} <span>${item.madde || item.baslik || item.metin || JSON.stringify(item)}</span></li>`;
  });
  html += '</ul>';
  return html;
}

function ikiListeTip(key, baslik) {
  // Türkçe karakterleri normalize et, anahtar + başlık üzerinde eşleştir
  const raw = (key + ' ' + (baslik || '')).toLowerCase()
    .replace(/[ğĞ]/g,'g').replace(/[üÜ]/g,'u').replace(/[şŞ]/g,'s')
    .replace(/[ıI]/g,'i').replace(/[İ]/g,'i').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c')
    .replace(/[âÂ]/g,'a').replace(/[îÎ]/g,'i').replace(/[ûÛ]/g,'u');
  if (/bozanlar|haram|necis|necaset|pislik|pis[\s_,)]|verilmez|olmaz|galiza|yasak|alamaz/.test(raw)) return 'no';
  if (/helal|temiz|verilir[\s_,)]|bozmayan|olur[\s_,)]|caiz|sunnet|farz/.test(raw)) return 'yes';
  return 'neutral';
}

function renderIkiListe(veriler, solBaslik, sagBaslik) {
  const keys = Object.keys(veriler);
  if (keys.length < 2) return '';
  const solKey = keys[0];
  const sagKey = keys[1];
  const solItems = veriler[solKey] || [];
  const sagItems = veriler[sagKey] || [];
  const solLabel = solBaslik || solKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const sagLabel = sagBaslik || sagKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const solTip = ikiListeTip(solKey, solLabel);
  const sagTip = ikiListeTip(sagKey, sagLabel);

  function iconHtml(tip) {
    if (tip === 'no')  return '<span class="check-icon check-no">&#10007;</span>';
    if (tip === 'yes') return '<span class="check-icon check-yes">&#10003;</span>';
    return '<span class="check-icon check-neutral">&#8226;</span>';
  }
  function headerColor(tip) {
    if (tip === 'no')  return '#c62828';
    if (tip === 'yes') return '#1a6b4e';
    return 'var(--text-muted)';
  }

  let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0;">';
  html += `<div style="padding:16px 20px;border-right:1px solid var(--border)"><h5 style="color:${headerColor(solTip)};margin:0 0 10px;">${solLabel}</h5><ul class="check-list" style="padding:0">`;
  solItems.forEach(item => { html += `<li>${iconHtml(solTip)} <span>${item}</span></li>`; });
  html += '</ul></div>';
  html += `<div style="padding:16px 20px"><h5 style="color:${headerColor(sagTip)};margin:0 0 10px;">${sagLabel}</h5><ul class="check-list" style="padding:0">`;
  sagItems.forEach(item => { html += `<li>${iconHtml(sagTip)} <span>${item}</span></li>`; });
  html += '</ul></div>';
  html += '</div>';
  return html;
}

// ===== ARAMA NORMALİZASYON =====

// Diyakritikleri kaldır — metin ve sorgu için aynı dönüşüm uygulanır
// Tüm dönüşümler 1-to-1 olduğu için karakter konumları korunur
function normalizeSearch(text) {
  if (!text) return '';
  return text
    .replace(/[âÂ]/g, 'a').replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g').replace(/ı/g, 'i').replace(/I/g, 'i').replace(/İ/g, 'i')
    .replace(/[îÎ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u').replace(/[ûÛ]/g, 'u').replace(/[êÊ]/g, 'e')
    .replace(/[''\u2018\u2019-]/g, ' ')
    .replace(/[?!.,;:()"\[\]{}]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
window.normalizeSearch = normalizeSearch;

// Kelime başı farkında indexOf: eşleşme ancak kelime sınırından sonra gelebilir.
// "ahmet" → "ahmetten" ✓, ama "rahmetullah" içindeki "ahmet" → ✗
var _wordBoundaryChars = new Set([' ', '.', ',', '!', '?', ':', ';', '(', ')', '"', "'", '\u2014', '-', '\n', '\t']);
function indexOfWordStart(text, term, from) {
  from = from || 0;
  while (true) {
    var i = text.indexOf(term, from);
    if (i === -1) return -1;
    if (i === 0 || _wordBoundaryChars.has(text[i - 1])) return i;
    from = i + 1;
  }
}

function includesWordStart(text, term) {
  return indexOfWordStart(text, term) !== -1;
}

// Bu kitaba özgü özel varyantlar — algoritmik kuralların yakalayamadığı a/e alternasyonu vb.
const OTTOMAN_MANUAL = {
  'namaz':    'nemaz',
  'niyet':    'niyyet',
  'vasiyet':  'vasiyyet',
  'tasavvuf': 'tesavvuf',
  'mucize':   'mucize',
  'salavat':  'salat',
  'tovbe':    'tevbe',
  'zekat':    'zekat',
  'oruc':     'savm',
  'hac':      'hacc',
  'abdest':   'abdest',
  'gusul':    'gusl',
  'secde':    'sucud',
  'ruku':     'ruku',
  'peygamber':'resulullah',
  'kuran':    'kuran',
  'hadis':    'hadis',
  'sunnet':   'sunnet',
  'mezhep':   'mezheb',
  'bidat':    'bidat',
  'tevekkul': 'tevekkul',
  'sabir':    'sabr',
  'sukur':    'sukr',
  'nisap':    'nisab',
  'faiz':     'riba',
  'mehr':     'mehir',
  'cennet':   'cennet',
  'cehennem': 'cehennem',
  'kible':    'kible',
  'ihram':    'ihram',
  'nikah':    'nikah',
  'talak':    'talak',
  'kurban':   'kurban',
  'fidye':    'fidye',
  'keffaret': 'keffaret',
  'sahabi':   'eshab',
  'evliya':   'evliya',
};

// Tek kelime için tüm olası varyantları üret (algoritmik + manuel)
function wordVariants(word) {
  const vars = new Set([word]);
  const consonants = new Set('bcdfghjklmnpqrstvwxyz');
  const vowels = 'aeiou';

  // Manuel varyantlar — tam kelime eşleşmesi
  if (OTTOMAN_MANUAL[word]) vars.add(OTTOMAN_MANUAL[word]);
  Object.entries(OTTOMAN_MANUAL).forEach(([mod, ott]) => {
    if (word === ott) vars.add(mod);
  });

  // Önek tabanlı varyant: Türkçe çekimli formlar için köke bak
  // "namazi" → kök "namaz" ∈ OTTOMAN_MANUAL → "nemaz" + "i" = "nemazi"
  // Bu sayede namazı, namazda, namazdan, namazın... hepsi çalışır
  Object.entries(OTTOMAN_MANUAL).forEach(([mod, ott]) => {
    if (word.length > mod.length && word.startsWith(mod)) {
      const suffix = word.slice(mod.length);
      vars.add(ott + suffix);         // namazi → nemazi
    }
    if (word.length > ott.length && word.startsWith(ott)) {
      const suffix = word.slice(ott.length);
      vars.add(mod + suffix);         // nemazi → namazi
    }
  });

  if (word.length >= 4) {
    // Kural 1: Son -p ↔ -b (kitab/kitap, vacib/vacip, sevab/sevap…)
    if (word.endsWith('p')) vars.add(word.slice(0, -1) + 'b');
    if (word.endsWith('b')) vars.add(word.slice(0, -1) + 'p');
    // Kural 2: Son -t ↔ -d (cihad/cihat, icad/icat…)
    if (word.endsWith('t')) vars.add(word.slice(0, -1) + 'd');
    if (word.endsWith('d')) vars.add(word.slice(0, -1) + 't');

    // Çekimli b/p: "kitabi" → kitap kökü tespit, "kitabi" zaten doğru;
    // "kitapa" (dative) → "kitaba" ✓ (Türkçe bu zaten doğru yapıyor; Osmanlıca'da da aynı)
    // Ancak: "sevabi" → "sevabi" (book form), "sevapi" → "sevabi" (kural 1 ile değil, eke girmiş)
    // Sesli ek alan çekimli formlar için: Ck+ek → Cb+ek veya Cp+ek
    // Örnek: kitabi(kitap+ı), kitaba(kitap+a) → kök son harfine göre
    ['a','e','i','u','in','a','e','dan','den','da','de','lar','ler','lari','leri'].forEach(suf => {
      if (word.endsWith('p' + suf)) {
        vars.add(word.slice(0, -suf.length - 1) + 'b' + suf);
      }
      if (word.endsWith('b' + suf)) {
        vars.add(word.slice(0, -suf.length - 1) + 'p' + suf);
      }
      if (word.endsWith('t' + suf)) {
        vars.add(word.slice(0, -suf.length - 1) + 'd' + suf);
      }
      if (word.endsWith('d' + suf)) {
        vars.add(word.slice(0, -suf.length - 1) + 't' + suf);
      }
    });
  }

  // Kural 3: Ünsüz yığılması — kitapta bazı kelimeler sesli içermez
  // gusl↔gusul, vitr↔vitir, zikr↔zikir, sabr↔sabır, nasr↔nasır
  // NOT: -p/-b/-t/-d ile biten kelimeler Kural 1/2 tarafından zaten işlenir, burada atlat
  const last3 = word[word.length - 1];
  if (!['p','b','t','d'].includes(last3)) {
    const prev3 = word[word.length - 2];
    if (consonants.has(last3) && consonants.has(prev3)) {
      // Ünsüz yığılmalı (gusl) → sesli eklenmiş (gusul)
      let lastVowel = 'i';
      for (let i = word.length - 3; i >= 0; i--) {
        if (vowels.includes(word[i])) { lastVowel = word[i]; break; }
      }
      const ins = { a: 'u', e: 'i', i: 'i', o: 'u', u: 'u' }[lastVowel] || 'i';
      vars.add(word.slice(0, -1) + ins + last3);
    }
    // Ters: sesli eklenmiş (gusul) → ünsüz yığılmalı (gusl, vitr, zikr)
    // Sadece -ul/-il/-ir/-ur sonları için (epentetik kısa sesli)
    const penult = word[word.length - 2];
    if (word.length >= 5 && 'ui'.includes(penult) && consonants.has(last3)) {
      const without = word.slice(0, -2) + last3;
      // Sonuç iki ünsüzle bitmeli
      if (without.length >= 3 && consonants.has(without[without.length - 2])) {
        vars.add(without);
      }
    }
  }

  // Kural 4: Şedde — niyyet/niyet, vasiyyet/vasiyet
  // Çift ünsüz → tek ünsüz
  const dedouble = word.replace(/(.)\1/g, '$1');
  if (dedouble !== word) vars.add(dedouble);
  // Tek → çift (sadece 'y' — s başta gürültü çıkarıyor)
  const reY = /(?<!y)y(?!y)/g;
  const doubledY = word.replace(reY, 'yy');
  if (doubledY !== word) vars.add(doubledY);

  // Kural 5: Kök sesli düşürme — Osmanlıca çekimli biçimlerde epentetik sesli yoktur
  // vakitleri → vaktleri, nakleden → nakleden, zikirler → zikrler, şekilde → şekilde
  // Türkçe sesliler (a, e) kök sesileri, kısa sesliler (i, u) epentetik olabilir
  // Kural: kelime içinde C + (i|u) + C dizisi bulunursa o sesiyi kaldır
  if (word.length >= 5) {
    for (let pos = 1; pos < word.length - 1; pos++) {
      const ch = word[pos];
      if ('iu'.includes(ch) && consonants.has(word[pos - 1]) && consonants.has(word[pos + 1])) {
        // Seslinin gerçekten epentetik olduğuna işaret: önündeki harf kökte zaten var
        // Basit kontrol: kaldırma sonrası kelime geçerli uzunlukta olmalı
        const dropped = word.slice(0, pos) + word.slice(pos + 1);
        if (dropped.length >= 4) vars.add(dropped);
      }
    }
  }

  var result = Array.from(vars);
  return result.length > 15 ? result.slice(0, 15) : result;
}

// Sorguyu genişlet: normalize et + her kelime için varyantlar üret
// Döndürülen yapı: { normalized, wordVarLists, altWords }
// wordVarLists[i] = i. kelimenin tüm varyantları
// Eski variants dizisi geriye uyumluluk için tutulur (tek kelime sorgularında)
var _searchStopWords = new Set(['bir','bu','ve','de','da','ile','icin','ne','nasil','nedir','nelerdir','kac','kadar','hangi','kimlere','mi','mu','var','yok','olan','olarak','ise','gibi','daha','en','cok','az','her','su','ben','sen','biz','siz','onlar','ki','ama','fakat','veya','ya','hem','neden','nicin','acaba','dir','olur','eder','ler','lar','dan','den','tan','ten','nerede','yoksa','demektir','demek','olmak','etmek','yapmak','yapilir','edilir','alinir','verilir','olunur','neler','seyler','hangileri']);

function expandSearchQuery(rawQuery) {
  const normalized = normalizeSearch(rawQuery);
  var allWords = normalized.split(/\s+/).filter(w => w.length >= 2);
  // Stop-word filtresi: en az 1 anlamlı kelime kalmalı
  var meaningful = allWords.filter(w => !_searchStopWords.has(w));
  const words = meaningful.length > 0 ? meaningful : allWords;
  if (words.length === 0) return { normalized, words: [], wordVarLists: [], altWords: [], altVariants: [] };

  const wordVarLists = words.map(w => {
    const variants = wordVariants(w);
    // aramaSynonyms entegrasyonu — sinonim genişletme
    if (window.aramaSynonyms && window.aramaSynonyms[w]) {
      window.aramaSynonyms[w].forEach(syn => {
        var normSyn = normalizeSearch(syn);
        normSyn.split(/\s+/).forEach(sw => { if (sw.length >= 2 && !variants.includes(sw)) variants.push(sw); });
      });
    }
    return variants.length > 15 ? variants.slice(0, 15) : variants;
  });

  // Çoklu kelime sinonim eşleşmesi (örn: "namaz kilmak")
  var phrase = words.join(' ');
  if (window.aramaSynonyms && window.aramaSynonyms[phrase]) {
    window.aramaSynonyms[phrase].forEach(syn => {
      var normSyn = normalizeSearch(syn);
      normSyn.split(/\s+/).forEach(sw => {
        if (sw.length >= 2) {
          // İlk kelime listesine ekle (phrase synonym)
          if (!wordVarLists[0].includes(sw)) wordVarLists[0].push(sw);
        }
      });
    });
  }

  // Kullanıcıya gösterilecek "farklı yazım" uyarısı için
  const altWords = wordVarLists
    .flatMap((vars, i) => vars.filter(v => v !== words[i]))
    .filter((v, i, a) => a.indexOf(v) === i);

  return {
    normalized,
    words,
    wordVarLists,
    altWords,
    altVariants: altWords,
  };
}

// ===== ARAMA (BİRLEŞİK) =====

// BM25 scoring: TF saturation + doküman uzunluk normalizasyonu + başlık bonusu
var _avgDocLen = 15000; // ortalama madde uzunluğu (yaklaşık)
function scoreMadde(normText, normBaslik, wordVarLists) {
  var textLen = normText.length;
  var score = 0;
  var matchedWordCount = 0;
  var k1 = 1.5, b = 0.75;
  var dlNorm = 1 - b + b * (textLen / _avgDocLen); // BM25 doküman uzunluk normalizasyonu

  for (var wi = 0; wi < wordVarLists.length; wi++) {
    var wvars = wordVarLists[wi];
    var wordScore = 0;
    for (var vi = 0; vi < wvars.length; vi++) {
      var v = wvars[vi];
      var tf = 0;
      var pos = 0;
      while (pos < normText.length) {
        var idx = indexOfWordStart(normText, v, pos);
        if (idx === -1) break;
        tf++;
        pos = idx + v.length;
      }
      if (tf > 0) {
        // BM25: tf * (k1 + 1) / (tf + k1 * dlNorm)
        var tfScore = (tf * (k1 + 1)) / (tf + k1 * dlNorm);
        wordScore = Math.max(wordScore, tfScore);
      }
      // Başlık eşleşmesi: büyük bonus (sorgu kelime sayısına göre ölçekle)
      if (includesWordStart(normBaslik, v)) {
        wordScore += 5.0 / wordVarLists.length;
      }
    }
    if (wordScore > 0) matchedWordCount++;
    score += wordScore;
  }

  // Tüm kelimeler eşleştiyse büyük bonus
  if (matchedWordCount === wordVarLists.length && wordVarLists.length > 1) {
    score *= 2.0;
  }

  return { score: score, matchedWordCount: matchedWordCount, allMatched: matchedWordCount >= wordVarLists.length };
}

// En iyi snippet'ı bul — cümle sınırı farkındalığı ile
function findBestSnippet(fullText, normText, wordVarLists) {
  var allVars = [];
  for (var wi = 0; wi < wordVarLists.length; wi++) {
    for (var vi = 0; vi < wordVarLists[wi].length; vi++) allVars.push(wordVarLists[wi][vi]);
  }

  // 350 karakterlik pencereler, 80 adımla tara (daha hassas)
  var bestPos = 0;
  var bestScore = 0;
  var step = 80;
  for (var i = 0; i < normText.length; i += step) {
    var windowText = normText.substring(i, i + 350);
    var wscore = 0;
    for (var vi = 0; vi < allVars.length; vi++) {
      var vIdx = windowText.indexOf(allVars[vi]);
      if (vIdx !== -1) {
        wscore += 10; // kelime bulundu
        // Aynı pencerede kaç kez geçiyor?
        var cnt = 0; var from = 0;
        while ((from = windowText.indexOf(allVars[vi], from)) !== -1) { cnt++; from += allVars[vi].length; }
        wscore += Math.min(cnt, 3); // max 3 tekrar bonus
      }
    }
    if (wscore > bestScore) { bestScore = wscore; bestPos = i; }
  }

  // Cümle başına hizala (nokta, soru işareti veya satır sonu bul)
  var snapStart = Math.max(0, bestPos - 40);
  if (snapStart > 0) {
    var sentStart = fullText.lastIndexOf('. ', snapStart + 20);
    if (sentStart > snapStart - 80 && sentStart >= 0) snapStart = sentStart + 2;
  }
  var end = Math.min(fullText.length, snapStart + 280);
  var snippet = (snapStart > 0 ? '...' : '') + fullText.substring(snapStart, end).trim() + (end < fullText.length ? '...' : '');
  return snippet;
}

// Snippet'ta highlight uygula — kelime sınırı farkındalığı ile
function highlightSnippet(snippet, wordVarLists) {
  var escaped = escapeHtml(snippet);
  var allVars = [];
  for (var wi = 0; wi < wordVarLists.length; wi++) {
    for (var vi = 0; vi < wordVarLists[wi].length; vi++) {
      var v = wordVarLists[wi][vi];
      if (v.length >= 2 && allVars.indexOf(v) === -1) allVars.push(v);
    }
  }
  allVars.sort(function(a, b) { return b.length - a.length; });

  for (var i = 0; i < allVars.length; i++) {
    // Kelime sınırı: başta boşluk/başlangıç, sonda Türkçe ek olabilir (serbest)
    var re = new RegExp('(?:^|(?<=[\\s.,;:!?()\\-"…]))(' + escapeRegex(allVars[i]) + ')', 'gi');
    escaped = escaped.replace(re, '<mark>$1</mark>');
  }
  return escaped;
}

// Levenshtein mesafesi — fuzzy matching için
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  var matrix = [];
  for (var i = 0; i <= b.length; i++) matrix[i] = [i];
  for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (var i = 1; i <= b.length; i++) {
    for (var j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i-1] === a[j-1] ? matrix[i-1][j-1] :
        Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

// Fuzzy öneri: kullanıcının yazdığına benzer terimleri bul
function findFuzzySuggestions(query) {
  var normQ = normalizeSearch(query);
  var qWords = normQ.split(/\s+/).filter(function(w) { return w.length >= 3; });
  if (qWords.length === 0) return [];

  // Bilinen terimler havuzu: soruMaddeMap soruları + aramaSynonyms anahtarları + tocData başlıkları
  var knownTerms = new Set();
  if (window.aramaSynonyms) Object.keys(window.aramaSynonyms).forEach(function(k) { knownTerms.add(k); });
  if (window.soruMaddeMap) window.soruMaddeMap.forEach(function(e) {
    e.soru.forEach(function(s) { s.split(/\s+/).forEach(function(w) { if (w.length >= 3) knownTerms.add(w); }); });
  });
  // tocData başlık kelimeleri
  if (window.tocData) window.tocData.forEach(function(m) {
    normalizeSearch(m.baslik).split(/\s+/).forEach(function(w) { if (w.length >= 3) knownTerms.add(w); });
  });

  var suggestions = [];
  var termsArr = Array.from(knownTerms);
  for (var wi = 0; wi < qWords.length; wi++) {
    var w = qWords[wi];
    var bestTerm = null;
    var bestDist = 999;
    for (var ti = 0; ti < termsArr.length; ti++) {
      var t = termsArr[ti];
      if (t === w) { bestTerm = null; break; } // tam eşleşme var, öneri gerekmez
      if (Math.abs(t.length - w.length) > 2) continue; // çok farklı uzunluk
      var d = levenshtein(w, t);
      var threshold = w.length <= 4 ? 1 : 2;
      if (d <= threshold && d < bestDist) { bestDist = d; bestTerm = t; }
    }
    if (bestTerm) suggestions.push({ original: w, suggestion: bestTerm, distance: bestDist });
  }
  return suggestions;
}

async function doFullSearch(fromRoute) {
  var rawQuery = document.getElementById('full-search').value.trim();
  if (!rawQuery || rawQuery.length < 2) return;
  var requestId = ++_searchRequestId;

  if (!fromRoute) updateHash('arama/' + encodeURIComponent(rawQuery.toLowerCase()));

  var resultsEl = document.getElementById('arama-results');
  var ipuclari = document.getElementById('arama-ipuclari');
  if (ipuclari) ipuclari.style.display = 'none';

  var expanded = expandSearchQuery(rawQuery);
  var qWords = expanded.words;
  var wordVarLists = expanded.wordVarLists;
  if (qWords.length === 0) { resultsEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">En az 2 harfli kelime girin.</p>'; return; }

  var kisimLabels = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
  var matches = [];
  var sozlukResults = [];
  var sahisResults = [];
  var tabloResults = [];
  var searchEngine = window.SearchEngine || null;
  if (!window.sahislarData) ensureSahislarData().catch(function() {});
  function renderSearchStatus(message) {
    if (requestId !== _searchRequestId) return false;
    resultsEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">' + escapeHtml(message) + '</p>';
    return true;
  }
  renderSearchStatus('Aranıyor...');

  // 1. DOĞRUDAN EŞLEŞTİRME (soruMaddeMap)
  var directMatch = (typeof findDirectMatch === 'function') ? findDirectMatch(rawQuery) : null;

  if (searchEngine && searchEngine.isReady && !searchEngine.isReady() && searchEngine.onReady) {
    renderSearchStatus('Arama hazırlanıyor...');
    await new Promise(function(resolve) { searchEngine.onReady(resolve); });
  }
  if (requestId !== _searchRequestId) return;

  // 2. Birleşik tam arama
  if (searchEngine && searchEngine.fullSearch) {
    renderSearchStatus('Kitapta aranıyor...');
    var fullResults = await searchEngine.fullSearch(rawQuery, { limit: 30, sideLimit: 8 });
    if (requestId !== _searchRequestId) return;
    matches = (fullResults.madde || []).map(function(item) {
      var data = item.data || {};
      return {
        kisim: data.kisim,
        madde_no: data.madde_no,
        baslik: item.title || data.baslik || '',
        sayfa_no: data.sayfa_no,
        score: item.score || 0,
        snippet: item.snippet || item.context || '',
        snippetHtml: item.snippetHtml || null
      };
    });
    sozlukResults = fullResults.sozluk || [];
    sahisResults = fullResults.sahis || [];
    tabloResults = fullResults.tablo || [];
    if (qWords.length === 1) {
      var onlyWord = qWords[0];
      matches.sort(function(a, b) {
        var aTitle = normalizeSearch(a.baslik || '');
        var bTitle = normalizeSearch(b.baslik || '');
        var aRank = aTitle === onlyWord ? 3 : ((aTitle.indexOf(onlyWord + ' ') === 0 || aTitle === onlyWord || aTitle.indexOf(onlyWord) === 0) ? 2 : (includesWordStart(aTitle, onlyWord) ? 1 : 0));
        var bRank = bTitle === onlyWord ? 3 : ((bTitle.indexOf(onlyWord + ' ') === 0 || bTitle === onlyWord || bTitle.indexOf(onlyWord) === 0) ? 2 : (includesWordStart(bTitle, onlyWord) ? 1 : 0));
        if (aRank !== bRank) return bRank - aRank;
        return (b.score || 0) - (a.score || 0);
      });
    }
  } else if (searchEngine && searchEngine.search) {
    var fallbackResults = searchEngine.search(rawQuery, { limit: 8 });
    sozlukResults = fallbackResults.sozluk || [];
    sahisResults = fallbackResults.sahis || [];
    tabloResults = fallbackResults.tablo || [];
  }
  if (requestId !== _searchRequestId) return;

  // 3. AI MADDE ÖNERİSİ (sadece sorularda, arka planda)
  // Ekim 2026: raufenc.com/api/ilmihal-search uç noktası ilmihal.org'dan erişilemiyor (çapraz site
  // isteği 403, eğik çizgili adres 404, OpenAI çağrısı hata) ve gönderilen sorular Gizlilik
  // Bildirimi'nde yer almıyordu. Uç nokta düzelip bildirim güncellenene kadar kapalıdır.
  var AI_ARAMA_ACIK = false;
  var aiPromise = null;
  if (AI_ARAMA_ACIK && searchEngine && searchEngine.isQuestion && searchEngine.isQuestion(rawQuery) && searchEngine.aiSearch && !directMatch && matches.length < 4) {
    aiPromise = searchEngine.aiSearch(rawQuery);
  }

  // RENDER
  var seen = {};
  var html = '';

  // Fuzzy öneri banner (madde sonucu az veya yoksa)
  if (matches.length <= 2) {
    var fuzzy = findFuzzySuggestions(rawQuery);
    if (fuzzy.length > 0) {
      // Düzeltilmiş sorguyu oluştur (normalize form üzerinden)
      var correctedNorm = normalizeSearch(rawQuery);
      fuzzy.forEach(function(f) {
        correctedNorm = correctedNorm.replace(new RegExp(escapeRegex(f.original), 'g'), f.suggestion);
      });
      var corrected = correctedNorm;
      if (corrected !== normalizeSearch(rawQuery)) {
        html += '<div class="arama-fuzzy-banner">' +
          '<span>Bunu mu demek istediniz?</span> ' +
          '<a href="#" onclick="document.getElementById(\'full-search\').value=\'' +
          escapeHtml(corrected).replace(/'/g, "\\'") + '\';doFullSearch();return false;">' +
          escapeHtml(corrected) + '</a></div>';
      }
    }
  }

  // Sayaçlar
  var maddeCount = 0;
  var sozlukCount = sozlukResults.length;
  var sahisCount = sahisResults.length;
  var tabloCount = tabloResults.length;
  var searchQ = escapeSearchQ(rawQuery);

  // Direct match (en üstte)
  if (directMatch) {
    var dm = window.tocData ? window.tocData.find(function(t) { return t.kisim === directMatch.kisim && t.madde_no === directMatch.maddeNo; }) : null;
    if (dm) {
      var dmKey = directMatch.kisim + '/' + directMatch.maddeNo;
      seen[dmKey] = true;
      maddeCount++;
      html += '<div class="arama-result arama-result--direct" data-tip="madde" onclick="openMadde(' + directMatch.kisim + ',' + directMatch.maddeNo + ',false,\'' + searchQ + '\')">' +
        '<span class="arama-badge arama-badge--direct">Tam Eşleşme</span>' +
        '<h4>' + escapeHtml(dm.baslik) + '</h4>' +
        '<p class="arama-ozet">' + escapeHtml(directMatch.cevapOzet || '') + '</p>' +
        '<div class="result-meta">' + kisimLabels[dm.kisim] + ', Madde ' + dm.madde_no + ' · ' + sayfaLink(dm.sayfa_no, 'Sayfa ' + dm.sayfa_no) + '</div>' +
      '</div>';
    }
  }

  // Metin eşleşmeleri
    matches.forEach(function(m) {
    var key = m.kisim + '/' + m.madde_no;
    if (seen[key]) return;
    seen[key] = true;
    maddeCount++;

    var highlighted = highlightSnippet(m.snippet || '', wordVarLists);

    html += '<div class="arama-result" data-tip="madde" onclick="openMadde(' + m.kisim + ',' + m.madde_no + ',false,\'' + searchQ + '\')">' +
      '<h4>' + escapeHtml(m.baslik) + '</h4>' +
      '<p class="arama-snippet">' + (highlighted || '(Başlıkta eşleşme)') + '</p>' +
      '<div class="result-meta">' + kisimLabels[m.kisim] + ', Madde ' + m.madde_no + ' · ' + sayfaLink(m.sayfa_no, 'Sayfa ' + m.sayfa_no) + '</div>' +
    '</div>';
  });

  // Sözlük sonuçları
  if (sozlukResults.length > 0) {
    html += '<div class="arama-ilgili" data-tip="sozluk">' +
      '<h4>\uD83D\uDCD6 İlgili Sözlük Terimleri</h4><div class="arama-taglar">';
    sozlukResults.forEach(function(s) {
      html += '<a href="#" class="arama-tag" onclick="goToSozlukSearch(\'' + escapeHtml(s.title).replace(/'/g, "\\'") + '\');return false">' + escapeHtml(s.title) + '</a>';
    });
    html += '</div></div>';
  }

  // Şahıs sonuçları
  if (sahisResults.length > 0) {
    html += '<div class="arama-ilgili" data-tip="sahis">' +
      '<h4>\uD83D\uDC64 İlgili Şahıslar</h4><div class="arama-taglar">';
    sahisResults.forEach(function(s) {
      var slug = s.data ? s.data.slug : '';
      html += '<a href="#" class="arama-tag arama-tag--sahis" onclick="goToSahisDetay(\'' + slug + '\');return false">' + escapeHtml(s.title) + '</a>';
    });
    html += '</div></div>';
  }

  if (tabloResults.length > 0) {
    html += '<div class="arama-ilgili" data-tip="tablo">' +
      '<h4>\uD83D\uDCCA İlgili Tablolar</h4><div class="arama-taglar">';
    tabloResults.forEach(function(t) {
      var tabloId = t.data ? String(t.data.id || '') : '';
      html += '<a href="#" class="arama-tag arama-tag--tablo" onclick="goToTabloDetay(\'' + tabloId.replace(/'/g, "\\'") + '\');return false">' + escapeHtml(t.title) + '</a>';
    });
    html += '</div></div>';
  }

  // Hiç sonuç yoksa
  if (maddeCount === 0 && sozlukCount === 0 && sahisCount === 0 && tabloCount === 0) {
    // İlgili konular önerisi
    var relatedTags = '';
    var normQ = normalizeSearch(rawQuery);
    if (window.aramaSynonyms) {
      var related = [];
      Object.keys(window.aramaSynonyms).forEach(function(k) {
        if (k.indexOf(normQ) !== -1 || normQ.indexOf(k) !== -1) related.push(k);
      });
      if (related.length > 0) {
        relatedTags = '<p style="margin-top:12px;">İlgili konular: ' + related.slice(0, 5).map(function(r) {
          return '<a href="#" style="color:var(--primary);margin:0 4px;" onclick="document.getElementById(\'full-search\').value=\'' +
            escapeHtml(r).replace(/'/g, "\\'") + '\';doFullSearch();return false;">' + escapeHtml(r) + '</a>';
        }).join(' · ') + '</p>';
      }
    }
    html += '<div class="arama-bos">' +
      '<p>Sonuç bulunamadı.</p>' +
      relatedTags +
      '<p style="color:var(--text-muted);font-size:0.85rem;margin-top:16px;">Farklı kelimeler veya Osmanlıca yazım deneyin: nemâz, gusl, oruc</p>' +
    '</div>';
  }

  // Filtre çubuğu
  var totalCount = maddeCount + sozlukCount + sahisCount + tabloCount;
  var filterHtml = '<div class="arama-filtreler" id="arama-filtreler">' +
    '<button type="button" class="arama-filtre-btn active" data-filtre="all" onclick="filtreAramaSonuclari(\'all\')">Tümü <span class="filtre-count">(' + totalCount + ')</span></button>';
  if (maddeCount > 0) filterHtml += '<button type="button" class="arama-filtre-btn" data-filtre="madde" onclick="filtreAramaSonuclari(\'madde\')">Maddeler <span class="filtre-count">(' + maddeCount + ')</span></button>';
  if (sozlukCount > 0) filterHtml += '<button type="button" class="arama-filtre-btn" data-filtre="sozluk" onclick="filtreAramaSonuclari(\'sozluk\')">Sözlük <span class="filtre-count">(' + sozlukCount + ')</span></button>';
  if (sahisCount > 0) filterHtml += '<button type="button" class="arama-filtre-btn" data-filtre="sahis" onclick="filtreAramaSonuclari(\'sahis\')">Şahıslar <span class="filtre-count">(' + sahisCount + ')</span></button>';
  if (tabloCount > 0) filterHtml += '<button type="button" class="arama-filtre-btn" data-filtre="tablo" onclick="filtreAramaSonuclari(\'tablo\')">Tablolar <span class="filtre-count">(' + tabloCount + ')</span></button>';
  filterHtml += '</div>';

  resultsEl.innerHTML = (totalCount > 0 ? filterHtml : '') + html;

  // AI sonuçlarını bekle ve varsa ekle
  if (aiPromise) {
    aiPromise.then(function(aiResults) {
      if (requestId !== _searchRequestId) return;
      if (!aiResults || aiResults.length === 0) return;
      // AI sonuçlarını mevcut sonuçların başına ekle (duplicate önle)
      var aiHtml = '';
      aiResults.forEach(function(r) {
        var key = r.id;
        if (seen[key]) return;
        seen[key] = true;
        var passage = r.passage ? r.passage.replace(/<[^>]+>/g, '').slice(0, 200) : (r.subtitle || '');
        aiHtml += '<div class="arama-result arama-result--ai" data-tip="madde" onclick="openMadde(' + r.data.kisim + ',' + r.data.madde_no + ',false,\'' + searchQ + '\')">' +
          '<span class="arama-badge arama-badge--ai">AI Önerisi</span>' +
          '<h4>' + escapeHtml(r.title) + '</h4>' +
          '<p class="arama-snippet">' + escapeHtml(passage) + '</p>' +
          '<div class="result-meta">' + kisimLabels[r.data.kisim] + ', Madde ' + r.data.madde_no + ' · ' + sayfaLink(r.data.sayfa_no, 'Sayfa ' + r.data.sayfa_no) + '</div>' +
        '</div>';
      });
      if (aiHtml) {
        // Filtre çubuğundan sonra, direct match'ten sonra ekle
        var firstResult = resultsEl.querySelector('.arama-result');
        if (firstResult && firstResult.classList.contains('arama-result--direct')) {
          firstResult.insertAdjacentHTML('afterend', aiHtml);
        } else if (firstResult) {
          firstResult.insertAdjacentHTML('beforebegin', aiHtml);
        } else {
          resultsEl.insertAdjacentHTML('beforeend', aiHtml);
        }
      }
    }).catch(function() {});
  }
}

document.getElementById('full-search')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doFullSearch();
});

// ===== BİRLEŞİK ARAMA (Hero Search) =====
(function() {
  const heroInput = document.getElementById('hero-search');
  const dropdown = document.getElementById('hero-search-dropdown');
  if (!heroInput || !dropdown) return;

  let debounceTimer = null;
  let selectedIdx = -1;
  let currentItems = [];

  const categoryLabels = {
    madde: 'Maddeler',
    sozluk: 'Din\u00ee L\u00fcgat',
    sahis: '\u015eah\u0131slar',
    tablo: 'Tablolar'
  };
  const categoryIcons = {
    madde: '\u{1F4D6}',
    sozluk: '\u{1F4DD}',
    sahis: '\u{1F464}',
    tablo: '\u{1F4CA}'
  };

  function showDropdown(results, query, hasAI) {
    currentItems = [];
    selectedIdx = -1;

    if (results.total === 0) {
      dropdown.innerHTML = '<div class="search-empty">Sonu\u00e7 bulunamad\u0131</div>';
      dropdown.style.display = 'block';
      return;
    }

    let html = '';
    const order = ['madde', 'sozluk', 'sahis', 'tablo'];

    order.forEach(cat => {
      const items = results[cat];
      if (!items || items.length === 0) return;

      const headerExtra = (cat === 'madde' && hasAI) ? ' <span class="search-ai-badge">AI</span>' : '';
      html += `<div class="search-category-header">${categoryIcons[cat]} ${categoryLabels[cat]}${headerExtra}</div>`;

      items.forEach(item => {
        const idx = currentItems.length;
        currentItems.push(item);

        let detailHtml = '';
        if (item.passage) {
          detailHtml = `<span class="search-item-passage">${item.passage}</span>`;
        } else if (item.subtitle) {
          detailHtml = `<span class="search-item-subtitle">${escapeHtml(item.subtitle)}</span>`;
        }

        html += `<div class="search-item" data-idx="${idx}" role="option">
          <span class="search-item-title">${escapeHtml(item.title)}</span>
          ${detailHtml}
        </div>`;
      });
    });

    // Tüm sonuçları gör bağlantısı
    html += `<div class="search-show-all" data-action="show-all">
      T\u00fcm sonu\u00e7lar\u0131 g\u00f6r \u2192
    </div>`;

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    // Tıklama olayları
    dropdown.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('mousedown', e => {
        e.preventDefault();
        const idx = parseInt(el.dataset.idx);
        selectItem(currentItems[idx]);
      });
      el.addEventListener('mouseenter', () => {
        selectedIdx = parseInt(el.dataset.idx);
        updateHighlight();
      });
    });

    dropdown.querySelector('.search-show-all')?.addEventListener('mousedown', e => {
      e.preventDefault();
      goToFullSearch(heroInput.value);
    });
  }

  function hideDropdown() {
    dropdown.style.display = 'none';
    selectedIdx = -1;
    currentItems = [];
  }

  function updateHighlight() {
    dropdown.querySelectorAll('.search-item').forEach(el => {
      el.classList.toggle('search-item-active', parseInt(el.dataset.idx) === selectedIdx);
    });
  }

  function selectItem(item) {
    if (!item) return;
    const currentQuery = heroInput.value.trim();
    hideDropdown();
    heroInput.blur();

    switch (item.type) {
      case 'madde':
        const d = item.data;
        openMadde(d.kisim, d.madde_no, false, currentQuery);
        break;
      case 'sozluk':
        goToSozlukSearch(item.data.t);
        break;
      case 'sahis':
        openSahis(item.data.slug || item.data.isim);
        break;
      case 'tablo':
        goToTabloDetay(item.data.id);
        break;
    }
  }

  function goToFullSearch(query) {
    hideDropdown();
    // Birleşik arama sayfasına git
    navigateTo('arama');
    const searchInput = document.getElementById('full-search');
    if (searchInput) {
      searchInput.value = query;
      doFullSearch();
    }
  }

  // Input event (debounced)
  heroInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = heroInput.value.trim();
    if (query.length < 2) {
      hideDropdown();
      return;
    }
    debounceTimer = setTimeout(async () => {
      if (!window.SearchEngine || !window.SearchEngine.isReady()) return;

      const results = window.SearchEngine.search(query, { limit: 4 });
      showDropdown(results, query);
    }, 200);
  });

  // Keyboard navigation
  heroInput.addEventListener('keydown', e => {
    if (dropdown.style.display === 'none') {
      if (e.key === 'Enter' && heroInput.value.trim().length >= 2) {
        goToFullSearch(heroInput.value.trim());
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIdx = Math.min(selectedIdx + 1, currentItems.length - 1);
        updateHighlight();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIdx = Math.max(selectedIdx - 1, -1);
        updateHighlight();
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIdx >= 0 && currentItems[selectedIdx]) {
          selectItem(currentItems[selectedIdx]);
        } else {
          goToFullSearch(heroInput.value.trim());
        }
        break;
      case 'Escape':
        hideDropdown();
        break;
    }
  });

  // Dışarı tıklayınca kapat
  document.addEventListener('click', e => {
    if (!heroInput.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  });

  // Focus'ta tekrar göster
  heroInput.addEventListener('focus', () => {
    if (heroInput.value.trim().length >= 2 && currentItems.length > 0) {
      dropdown.style.display = 'block';
    }
  });
})();

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  var initialPath = getRoutePath();
  warmDirectRouteData(initialPath);
  if (window.tocData) {
    debugLog(`Y\u00fcklendi: ${window.tocData.length} madde, ${window.sozlukData?.length || 0} s\u00f6zl\u00fck kelimesi, ${window.tablolarData?.length || 0} tablo${window.sahislarData ? ', ' + window.sahislarData.length + ' \u015fah\u0131s' : ''}`);
  }
  // Arka plan preload'u ilk etkileşimi boğmasın diye geciktirilir.
  scheduleBackgroundPreload(initialPath && initialPath !== 'anasayfa' ? 5000 : 1500);

  // Günün maddesi
  if (typeof loadGununMaddesi === 'function') loadGununMaddesi();

  // Handle initial route (clean URL veya hash)
  if (initialPath && initialPath !== 'anasayfa') {
    void handleRoute();
  }
});

// ===== GÜNÜN MADDESİ =====
function loadGununMaddesi() {
  if (!window.tocData || window.tocData.length === 0) return;
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const index = dayOfYear % window.tocData.length;
  const madde = window.tocData[index];
  if (!madde) return;

  const baslikEl = document.getElementById('gunun-baslik');
  const ozetEl = document.getElementById('gunun-ozet');
  const btn = document.getElementById('gunun-oku-btn');
  if (!baslikEl) return;

  const kisimLabels = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
  baslikEl.textContent = madde.baslik;
  ozetEl.textContent = kisimLabels[madde.kisim] + ', Madde ' + madde.madde_no + (madde.mektup_ref ? ' · ' + mektubEtiketi(madde.mektup_ref, true) : '');
  btn.onclick = () => { navigateTo('icerik'); openMadde(madde.kisim, madde.madde_no); };
}

// ===== FONT BOYUTU AYARI =====
let currentFontSize = parseFloat(localStorage.getItem('ilmihal-font-size') || '1.05');

function adjustFontSize(delta) {
  currentFontSize = Math.max(0.8, Math.min(1.6, currentFontSize + delta * 0.1));
  document.documentElement.style.setProperty('--madde-font-size', currentFontSize + 'rem');
  localStorage.setItem('ilmihal-font-size', String(currentFontSize));
  boyutGostergeGuncelle();
}

if (localStorage.getItem('ilmihal-font-size')) {
  document.documentElement.style.setProperty('--madde-font-size', currentFontSize + 'rem');
}

// ===== YER İMİ SİSTEMİ =====
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('ilmihal-bookmarks') || '[]'); }
  catch(e) { return []; }
}
function saveBookmarks(bm) {
  localStorage.setItem('ilmihal-bookmarks', JSON.stringify(bm));
}

let currentMaddeForBookmark = null;

function toggleBookmark() {
  if (!currentMaddeForBookmark) return;
  const bm = getBookmarks();
  const key = currentMaddeForBookmark.kisim + '/' + currentMaddeForBookmark.madde_no;
  const idx = bm.findIndex(b => b.key === key);
  const btn = document.getElementById('bookmark-btn');
  if (idx >= 0) {
    bm.splice(idx, 1);
    if (btn) { btn.innerHTML = '&#9734;'; btn.classList.remove('bookmarked'); }
  } else {
    bm.push({ key, kisim: currentMaddeForBookmark.kisim, madde_no: currentMaddeForBookmark.madde_no, baslik: currentMaddeForBookmark.baslik });
    if (btn) { btn.innerHTML = '&#9733;'; btn.classList.add('bookmarked'); }
  }
  saveBookmarks(bm);
}

function updateBookmarkBtn(kisim, maddeNo) {
  const bm = getBookmarks();
  const key = kisim + '/' + maddeNo;
  const btn = document.getElementById('bookmark-btn');
  if (!btn) return;
  if (bm.some(b => b.key === key)) {
    btn.classList.add('bookmarked');
    btn.title = 'Yer imini kaldır';
  } else {
    btn.classList.remove('bookmarked');
    btn.title = 'Yer imi ekle';
  }
}

// ===== PAYLAŞIM =====
function shareMadde() {
  if (!currentMaddeForBookmark) return;
  const url = 'https://www.ilmihal.org/madde/' + currentMaddeForBookmark.kisim + '/' + currentMaddeForBookmark.madde_no;
  if (navigator.share) {
    navigator.share({
      title: currentMaddeForBookmark.baslik + ' - Se\'âdet-i Ebediyye',
      url: url
    }).catch(function(){});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      var btn = document.querySelector('.toolbar-btn[onclick="shareMadde()"]');
      if (btn) { var orig = btn.innerHTML; btn.innerHTML = '✓'; setTimeout(function(){ btn.innerHTML = orig; }, 1500); }
    }).catch(function(){});
  }
}

// ===== ARAMA ETİKET =====
function aramaEtiketTikla(kelime) {
  document.getElementById('full-search').value = kelime;
  doFullSearch();
  var ipuclari = document.getElementById('arama-ipuclari');
  if (ipuclari) ipuclari.style.display = 'none';
}

// ===== OKUMA İSTATİSTİKLERİ =====
function getReadMaddes() {
  try { return JSON.parse(localStorage.getItem('ilmihal-read') || '[]'); }
  catch(e) { return []; }
}

function markAsRead(kisim, maddeNo) {
  var read = getReadMaddes();
  var key = kisim + '/' + maddeNo;
  if (read.indexOf(key) === -1) {
    read.push(key);
    localStorage.setItem('ilmihal-read', JSON.stringify(read));
    var item = document.querySelector('.madde-item[data-madde-key="' + key + '"]');
    if (item && !item.classList.contains('okundu')) {
      item.classList.add('okundu');
      var t = item.querySelector('.madde-title');
      if (t) t.insertAdjacentHTML('beforeend', OKUNDU_TIK_HTML);
    }
  }
  try { kisimIlerlemeGuncelle(); } catch(e) {}
}

// ===== OKUMA MODLARI (Normal / Sepia / Dark) =====
var readingModes = ['normal', 'sepia', 'dark'];
var currentReadingMode = 0;

function cycleReadingMode() {
  document.documentElement.classList.remove('sepia');
  currentReadingMode = (currentReadingMode + 1) % readingModes.length;
  var mode = readingModes[currentReadingMode];
  var btn = document.getElementById('reading-mode-btn');
  if (mode === 'sepia') {
    document.documentElement.classList.add('sepia');
    document.documentElement.classList.remove('dark');
    if (btn) btn.innerHTML = '&#9790;';
  } else if (mode === 'dark') {
    document.documentElement.classList.remove('sepia');
    document.documentElement.classList.add('dark');
    localStorage.setItem('ilmihal-theme', 'dark');
    if (btn) btn.innerHTML = '&#9788;';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('sepia');
    localStorage.setItem('ilmihal-theme', 'light');
    if (btn) btn.innerHTML = '&#9788;';
  }
}

// ===== YAZDIRMA =====
function printMadde() {
  window.print();
}

// Maddeye giderken arama metni için güvenli escape
function escapeSearchQ(text) {
  if (!text) return '';
  return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
// Açıklama metninden anahtar cümle çıkar (tek tırnak içi alıntı veya ilk anlamlı kısım)
function extractSearchHint(explanation) {
  if (!explanation) return '';
  var q = explanation.match(/'([^']{10,})'/);
  if (q) return q[1];
  return explanation.replace(/\(K\d+\/M\d+\)/g, '').replace(/^Kitapta\s+/i, '').replace(/buyurulmaktadır\.?$/i, '').trim().substring(0, 80);
}

// ===== QUIZ SİSTEMİ =====
// Sorular ve açıklamalardaki alıntılar kitabın metniyle karşılaştırılmıştır (Ekim 2026); m = kaynak madde
var quizSorulari = {
  iman: [
    {s:"İslâmın beş şartından ilki nedir?",c:["Kelime-i şehâdet söylemek","Namaz kılmak","Oruç tutmak","Zekât vermek"],d:0,a:"Kitapta Peygamber Efendimizin (sallallahü aleyhi ve sellem) 'İslâmın binâsı beş direk üzerine kurulmuşdur. Birincisi, Eşhedü en lâ ilâhe illallah ve eşhedü enne Muhammeden abdühu ve resûlüh, demek ve bunun ma’nâsına inanmakdır' buyurduğu bildirilmektedir. (K1/M46)",m:{k:1,m:46}},
    {s:"Ehl-i sünnet itikadında îmânın altı şartından biri değildir?",c:["Allahü teâlâya inanmak","Meleklere inanmak","Tenâsühe inanmak","Kadere inanmak"],d:2,a:"Kitapta 'Îmânın altı şartından birincisi, Allahü teâlânın var olduğuna inanmakdır' buyurulmakta (K1/M24); tenâsühün, ya’nî rûhun başka bir bedenle tekrâr dünyâya geldiğine inanmanın küfr olduğu bildirilmektedir. (K1/M39)",m:{k:1,m:24}},
    {s:"Ehl-i sünnetin reîsi kimdir?",c:["İmâm-ı Şâfi'î hazretleri","İmâm-ı a'zam Ebû Hanîfe hazretleri","İmâm-ı Mâlik hazretleri","İmâm-ı Ahmed bin Hanbel hazretleri"],d:1,a:"Kitapta 'Ehl-i sünnetin reîsi, imâm-ı a’zam Ebû Hanîfedir' buyurulmaktadır. (K1/M5)",m:{k:1,m:5}},
    {s:"Peygamber Efendimiz (sallallahü aleyhi ve sellem) hangi şehirde dünyâya gelmiştir?",c:["Medîne-i münevvere","Mekke-i mükerreme","Tâif","Kudüs"],d:1,a:"Kitapta Peygamber Efendimizin (sallallahü aleyhi ve sellem) Mekke-i mükerreme şehrinde dünyâya geldiği bildirilmektedir. (K1/M95)",m:{k:1,m:95}},
    {s:"Kabirde suâl soracak iki meleğin ismi nedir?",c:["Cebrâîl ve İsrâfîl","Münker ve Nekîr","Kirâmen kâtibîn","Azrâîl ve Mikâîl"],d:1,a:"Kitapta kabrde Münker ve Nekîr denilen iki meleğin suâl soracağına inanmak lâzım olduğu bildirilmektedir. (K1/M46)",m:{k:1,m:46}},
    {s:"Bid'at ne demektir?",c:["Güzel âdet","Dinde sonradan çıkarılan şey","Sünnet","Peygamber Efendimizin (sallallahü aleyhi ve sellem) emri"],d:1,a:"Kitapta 'Bid’at, dinde sonradan yapılan şey demekdir' buyurulmakta; Peygamber Efendimizin (sallallahü aleyhi ve sellem) ve dört halîfesinin zemânlarında bulunmayıp sonradan ibâdet olarak çıkarılan şeyler olduğu bildirilmektedir. (K1/M34)",m:{k:1,m:34}},
    {s:"Fıkıh ilmi ne demektir?",c:["Kur'ân-ı Kerîm tefsîri","Hadîs-i şerîf ilmi","Yapılması ve yapılmaması lâzım olan işleri bildiren ilim","Tasavvuf ilmi"],d:2,a:"Kitapta 'Fıkh ilmi, insanların yapması ve yapmaması lâzım olan işleri bildirir' buyurulmaktadır. (K2/M16)",m:{k:2,m:16}},
    {s:"Kur'ân-ı Kerîm kaç sûredir?",c:["100","110","114","120"],d:2,a:"Kitapta 'Kur’ân-ı kerîmde yüzondört sûre ve altıbinikiyüzotuzaltı âyet vardır' buyurulmaktadır. (K1/M25)",m:{k:1,m:25}}
  ],
  namaz: [
    {s:"Beş vakit namazda toplam kaç rekât farz vardır?",c:["17","20","25","40"],d:0,a:"Kitapta sabah 2, öğle 4, ikindi 4, akşam 3, yatsı 4 olmak üzere beş vakit namazın farzları bildirilmektedir; toplamı 17 rekâttır. (K1/M51)",m:{k:1,m:51}},
    {s:"Namazın farzlarından (şartlarından) değildir?",c:["Kıbleye dönmek","Niyet etmek","Eûzü okumak","Abdest almak"],d:2,a:"Kitapta namazın dışındaki farzları (şartları) şöyle bildirilmektedir: Hadesden tahâret, necâsetden tahâret, setr-i avret, istikbâl-i kıble, vakt, niyyet, tahrîme tekbîri. Eûzü okumak ise sünnettir. (K1/M52)",m:{k:1,m:52}},
    {s:"Abdesti bozan hallerden değildir?",c:["Uyumak","Ağlamak","Kan gelmesi","Bayılmak"],d:1,a:"Kitapta abdesti bozan şeyler arasında uyumak ve bayılmak sayılmakta; ağrı olmadan ağlamakla göz yaşı akınca abdestin bozulmadığı bildirilmektedir. (K1/M52)",m:{k:1,m:52}},
    {s:"Sabah namazının sünneti kaç rekâttır?",c:["2","4","3","Sünnet yoktur"],d:0,a:"Kitapta sabah namazında 'Önce, iki rek’at sünneti, sonra iki rek’at farzı kılınır. Bu sünnet, çok kuvvetlidir' buyurulmaktadır. (K1/M51)",m:{k:1,m:51}},
    {s:"Namazda her rekâtta kaç secde yapılır?",c:["1","2","3","Sadece son rekâtta"],d:1,a:"Her rekâtta iki secde yapılır. Kitapta secdeleri birbiri ardınca yapmanın namazın vâciblerinden olduğu bildirilmektedir. (K1/M66)",m:{k:1,m:66}},
    {s:"Namazın vâciblerinden değildir?",c:["Fâtiha okumak","Ta’dîl-i erkân","Selâm vermek","Kıyâmda durmak"],d:3,a:"Kıyâmda durmak namazın farzlarındandır. Kitapta Fâtiha okumak, rükû’da ve secdelerde ta’dîl-i erkân ve namazın sonunda selâm vermek vâciblerden sayılmaktadır. (K1/M66)",m:{k:1,m:66}},
    {s:"Seferde (yolculukta) dört rekâtlık farz namazlar kaç rekât kılınır?",c:["4 rekât","3 rekât","2 rekât","Kılınmaz"],d:2,a:"Kitapta seferde, ya’nî yolculukta dört rekâtlık farz namazların iki rekât kılınacağı bildirilmektedir. (K1/M65)",m:{k:1,m:65}},
    {s:"Cenâze namazında rükû ve secde var mıdır?",c:["Evet, ikisi de var","Sadece rükû var","Sadece secde var","Hayır, ikisi de yok"],d:3,a:"Cenâze namazı dört tekbîr ile kılınır; rükû ve secdesi yoktur. Kitapta 'Cenâze nemâzının dört tekbîrinden herbiri, bir rek’at gibidir' buyurulmaktadır. (K3/M57)",m:{k:3,m:57}}
  ],
  oruc: [
    {s:"Ramazan orucu ne zaman farz oldu?",c:["Hicretin 1. yılında","Hicretin 2. yılında","Mekke'de","Hicretin 5. yılında"],d:1,a:"Kitapta Ramazan orucunun hicretten on sekiz ay sonra, Şa’bân ayının onuncu günü farz olduğu bildirilmektedir; bu, hicretin ikinci yılıdır. (K1/M79)",m:{k:1,m:79}},
    {s:"Orucu bozmayan hallerden biri hangisidir?",c:["Yemek yemek","Unutarak su içmek","Bilerek su içmek","Sigara içmek"],d:1,a:"Kitapta orucu bozmayan şeyler arasında, oruçlu olduğunu unutarak yemek ve içmek bildirilmektedir. (K1/M79)",m:{k:1,m:79}},
    {s:"İftar vakti ne zamandır?",c:["Güneş doğunca","Öğle ezanında","İkindi ezanında","Güneş batınca"],d:3,a:"Kitapta orucun güneş batınca açılacağı bildirilmektedir. (K1/M79)",m:{k:1,m:79}},
    {s:"İmsâk vakti ne demektir?",c:["Güneşin doğma vakti","Oruca başlanan, yeme-içmenin bırakıldığı vakit","Öğle vakti","Akşam vakti"],d:1,a:"Kitapta oruca imsâk vaktinde başlanacağı ve bu vaktin fecr-i sâdık ile başladığı bildirilmektedir. (K1/M60)",m:{k:1,m:60}},
    {s:"Oruçlu iken misvâk kullanmak orucu bozar mı?",c:["Evet bozar","Hayır bozmaz","Sadece sabah bozar","Mekrûhtur"],d:1,a:"Kitapta 'Misvâk, hacamat mekrûh değildir' buyurulmaktadır. (K1/M79)",m:{k:1,m:79}}
  ],
  zekat: [
    {s:"Zekât vermek için en az ne kadar altın gerekir?",c:["20 miskal (96 gram)","10 miskal","50 miskal","100 miskal"],d:0,a:"Kitapta altının nisâbının yirmi miskal, ya’nî 96 gram olduğu bildirilmektedir. '4x20=80 gramdır demek de doğru olmaz' diye açıkça yazılıdır. (K1/M78)",m:{k:1,m:78}},
    {s:"Zekât, nisâb miktarı malın ne kadarıdır?",c:["Yüzde 1","Kırkta biri (yüzde 2,5)","Yüzde 5","Onda biri"],d:1,a:"Kitapta para ve ticâret malında zekâtın kırkta bir olduğu bildirilmektedir. (K1/M78)",m:{k:1,m:78}},
    {s:"Zekât kimlere verilmez?",c:["Fakirlere","Borçlulara","Ana-babaya","Yolda kalmışlara"],d:2,a:"Kitapta 'Anaya, babaya ve dedelerin, ninelerin hiçbirine ve kendi çocuklarına ve torunlara zekât verilmez' buyurulmaktadır. (K1/M78)",m:{k:1,m:78}},
    {s:"Gümüşün zekât nisâbı kaç dirhemdir?",c:["100 dirhem","200 dirhem","300 dirhem","400 dirhem"],d:1,a:"Kitapta gümüşün nisâbının ikiyüz dirhem-i şer’î, ya’nî 672 gram olduğu bildirilmektedir. (K1/M78)",m:{k:1,m:78}},
    {s:"Zekât ne zaman farz olmuştur?",c:["Mekke'de","Hicretin 1. yılında","Hicretin 2. yılında","Hicretin 5. yılında"],d:2,a:"Kitapta zekâtın hicretin ikinci senesinde, Ramazan ayında farz olduğu bildirilmektedir. (K1/M78)",m:{k:1,m:78}}
  ],
  hac: [
    {s:"Peygamber Efendimiz (sallallahü aleyhi ve sellem) hicretin kaçıncı yılında hacca gitmiştir?",c:["Sekizinci","Dokuzuncu","Onuncu","On birinci"],d:2,a:"Kitapta 'Resûlullah “sallallahü aleyhi ve sellem”, hicretin onuncu yılında, Kusvâ adındaki devesine binerek hacca gitdi' buyurulmaktadır. (K1/M84)",m:{k:1,m:84}},
    {s:"Haccın farzlarından değildir?",c:["İhrâm","Vakfe","Tavâf","Sa'y"],d:3,a:"Kitapta 'Haccın farzı üçdür' buyurulmakta; bunların ihrâm, Arafât’ta vakfe ve ziyâret tavâfı olduğu, Safâ ile Merve arasında sa’y etmenin ise vâcib olduğu bildirilmektedir. (K1/M84)",m:{k:1,m:84}},
    {s:"Arafat vakfesi hangi gün yapılır?",c:["Zilhicce 8","Zilhicce 9 (Arefe günü)","Zilhicce 10","Zilhicce 11"],d:1,a:"Kitapta Arefe günü Arafât’ta vakfeye durmanın haccın farzlarından olduğu bildirilmektedir. (K1/M84)",m:{k:1,m:84}},
    {s:"İhrâmda iken yapılması yasak olan hallerden değildir?",c:["Tıraş olmak","Güzel koku sürmek","Yemek yemek","Dikişli elbise giymek"],d:2,a:"Kitapta ihrâmlı iken tıraş olmanın, güzel koku sürmenin ve erkeklerin dikişli elbise giymesinin yasak olduğu bildirilmektedir. Yemek yemek yasak değildir. (K1/M84)",m:{k:1,m:84}},
    {s:"Umre ile hac arasındaki fark nedir?",c:["Umrede vakfe yoktur","Umrede tavâf yoktur","Umrede sa'y yoktur","Fark yoktur"],d:0,a:"Kitapta umrenin ihrâm ile yapılan tavâf ve sa’y ile saçı kazımak veya kısaltmaktan ibâret olduğu bildirilmektedir; umrede Arafât vakfesi yoktur. (K1/M84)",m:{k:1,m:84}}
  ],
  ahlak: [
    {s:"Kitapta nefs-i emmâre nasıl anlatılmaktadır?",c:["İnsanın rûhu","Şehvetlere kavuşmak için insanı zorlayan, sınır tanımayan kuvvet","Akıl","Kalb"],d:1,a:"Kitapta '(Nefs-i emmâre) kuvvetidir. Bu kuvvet, şehvetlere kavuşmak ve gadab edilenlerle döğüşmek için insanı zorlar. Fekat insanın nefsi, bu işinde bir sınır tanımaz' buyurulmaktadır. (K2/M28)",m:{k:2,m:28}},
    {s:"Büyük günahlardan biri değildir?",c:["Gıybet etmek","Farz namazı özürsüz vaktinde kılmamak","Erken kalkmak","Şarap içmek"],d:2,a:"Kitapta 'Özrsüz, tenbellikle farz nemâzı vaktinde kılmamak, büyük günâhdır' (K1/M74), müslümanı kötüleyerek 'gıybet yapmak, elbet büyük günâhdır' (K2/M72) ve 'Şerâb içmek, büyük günâhların en büyüğüdür' (K2/M42) buyurulmaktadır.",m:{k:1,m:74}},
    {s:"Kitapta tevbenin şartlarından biri değildir?",c:["Günâha pişmân olmak","Günâha devâm etmemek","Bir daha yapmamaya karar vermek","Sadaka vermek"],d:3,a:"Kitapta 'Tevbenin sahîh olması için dört şart vardır. Bunlar, pişmân olup, günâha devâm etmemek, bir dahâ yapmamağa karâr vermek, afv olması için düâ ve istigfâr etmek, Allah ve kul haklarını ödemekdir' buyurulmaktadır. (K1/M74)",m:{k:1,m:74}},
    {s:"Riyâ ne demektir?",c:["Yalan söylemek","İbâdeti başkasına göstermek için yapmak","Hased etmek","Gıybet etmek"],d:1,a:"Kitapta Peygamber Efendimizin (sallallahü aleyhi ve sellem) 'Küçük şirkden korununuz!' buyurduğu, küçük şirkin ne olduğu sorulunca 'Riyâ' buyurduğu ve bunun başkasına göstermek için ibâdet etmek olduğu bildirilmektedir. (K3/M2)",m:{k:3,m:2}}
  ],
  karisik: []
};

var quizState = { sorular: [], current: 0, dogru: 0, toplam: 0, cevaplandi: false };

function startQuiz(konu) {
  var sorular;
  if (konu === 'karisik') {
    var tumSorular = [];
    for (var k in quizSorulari) { if (k !== 'karisik') tumSorular = tumSorular.concat(quizSorulari[k]); }
    sorular = tumSorular.sort(function() { return Math.random() - 0.5; }).slice(0, 10);
  } else {
    sorular = (quizSorulari[konu] || []).slice();
  }
  if (sorular.length === 0) { alert('Bu konuda henüz soru bulunmuyor.'); return; }
  quizState = { sorular: sorular, current: 0, dogru: 0, toplam: sorular.length, cevaplandi: false };
  document.querySelector('.quiz-setup').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'block';
  renderQuizSoru();
}

function renderQuizSoru() {
  var area = document.getElementById('quiz-area');
  if (quizState.current >= quizState.toplam) {
    var puan = Math.round((quizState.dogru / quizState.toplam) * 100);
    var eskiPuan = parseInt(localStorage.getItem('ilmihal-quiz-puan') || '0');
    localStorage.setItem('ilmihal-quiz-puan', String(Math.max(eskiPuan, puan)));
    area.innerHTML = '<div class="quiz-sonuc"><div class="quiz-sonuc-puan">' + puan + '/100</div><div class="quiz-sonuc-text">' + quizState.dogru + '/' + quizState.toplam + ' doğru cevap</div><button type="button" class="btn btn-primary" onclick="resetQuiz()">Yeni Test</button></div>';
    return;
  }
  var s = quizState.sorular[quizState.current];
  quizState.cevaplandi = false;
  var pct = Math.round((quizState.current / quizState.toplam) * 100);
  var html = '<div class="quiz-ilerleme"><div class="quiz-ilerleme-bar"><div class="quiz-ilerleme-fill" style="width:' + pct + '%"></div></div><span class="quiz-ilerleme-text">' + (quizState.current + 1) + '/' + quizState.toplam + '</span></div>';
  html += '<div class="quiz-soru"><div class="quiz-soru-num">Soru ' + (quizState.current + 1) + '</div><div class="quiz-soru-text">' + s.s + '</div><div class="quiz-secenekler">';
  s.c.forEach(function(c, i) {
    html += '<button type="button" class="quiz-secenek" onclick="quizCevapla(' + i + ')" data-idx="' + i + '">' + c + '</button>';
  });
  html += '</div><div class="quiz-aciklama" id="quiz-aciklama" style="display:none"></div></div>';
  area.innerHTML = html;
}

function quizCevapla(idx) {
  if (quizState.cevaplandi) return;
  quizState.cevaplandi = true;
  var s = quizState.sorular[quizState.current];
  var secenekler = document.querySelectorAll('.quiz-secenek');
  secenekler.forEach(function(el) {
    var i = parseInt(el.getAttribute('data-idx'));
    if (i === s.d) el.classList.add('dogru');
    if (i === idx && idx !== s.d) el.classList.add('yanlis');
    el.style.pointerEvents = 'none';
    el.disabled = true;
  });
  if (idx === s.d) quizState.dogru++;
  var aciklama = document.getElementById('quiz-aciklama');
  // Butonlar (sonraki soru + kitap bölümü)
  var butonlar = '<div class="quiz-butonlar">';
  if (s.m) {
    var hint = escapeSearchQ(extractSearchHint(s.a));
    butonlar += '<a href="/madde/' + s.m.k + '/' + s.m.m + '" onclick="openMadde(' + s.m.k + ',' + s.m.m + ',false,\'' + hint + '\');return false" class="quiz-bolum-btn">Kitaptaki yerini oku</a>';
  }
  if (quizState.current < quizState.toplam - 1) {
    butonlar += '<button type="button" class="btn btn-primary quiz-sonraki-btn" onclick="quizState.current++;renderQuizSoru()">Sonraki Soruya Geç →</button>';
  } else {
    butonlar += '<button type="button" class="btn btn-primary quiz-sonraki-btn" onclick="quizState.current++;renderQuizSoru()">Sonuçları Gör →</button>';
  }
  butonlar += '</div>';
  aciklama.innerHTML = s.a + butonlar;
  aciklama.style.display = 'block';
}

function resetQuiz() {
  document.querySelector('.quiz-setup').style.display = 'block';
  document.getElementById('quiz-area').style.display = 'none';
}



// Türkçe stop words (soru kelimeleri + bağlaçlar)
// Soru→Madde doğrudan eşleme
function findDirectMatch(query) {
  if (!window.soruMaddeMap) return null;
  var norm = (typeof normalizeSearch === 'function') ? normalizeSearch(query) : query.toLowerCase();
  var words = norm.split(/\s+/).filter(function(w) { return w.length >= 2; });
  var looksLikeQuestion = query.indexOf('?') !== -1 ||
    words.length >= 3 ||
    (words.length >= 2 && words.some(function(w) { return _searchStopWords.has(w); }));
  var best = null;
  var bestScore = 0;
  window.soruMaddeMap.forEach(function(entry) {
    entry.soru.forEach(function(s) {
      // Tam eşleşme
      if (norm === s || norm.indexOf(s) !== -1 || s.indexOf(norm) !== -1) {
        if (norm !== s && !looksLikeQuestion) return;
        var score = s.length;
        if (norm === s) score += 100; // tam eşleşme bonus
        if (score > bestScore) { bestScore = score; best = entry; }
      }
    });
  });
  return best;
}

// searchInBook kaldırıldı — doFullSearch içinde BM25 scoring ile birleştirildi

// ===== FAQ SCHEMA (dinamik) =====
// Madde sayfası için yapılandırılmış veri: kitabın bir bölümü (Article). Önceki FAQPage
// işaretlemesi, soru-cevap olmayan madde başlıklarını "soru" diye bildiriyordu.
function addFaqSchema(madde, metin) {
  var existing = document.getElementById('faq-schema');
  if (existing) existing.remove();
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'faq-schema';
  var ozet = String(metin || '').replace(/⟦[^⟧]*⟧/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300);
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": madde.baslik,
    "url": 'https://www.ilmihal.org/madde/' + madde.kisim + '/' + madde.madde_no,
    "inLanguage": "tr",
    "description": ozet + '…',
    "isPartOf": { "@type": "Book", "name": "Se'âdet-i Ebediyye", "author": { "@type": "Person", "name": "Hüseyn Hilmi Işık" } },
    "pagination": String(madde.sayfa_no) + (madde.sayfa_bitis > madde.sayfa_no ? '-' + madde.sayfa_bitis : '')
  });
  document.head.appendChild(script);
}

// ===== OG META DİNAMİK (paylaşım kartları) =====
function updateOgMeta(madde) {
  var setMeta = function(prop, content) {
    var el = document.querySelector('meta[property="' + prop + '"]') || document.querySelector('meta[name="' + prop + '"]');
    if (el) el.setAttribute('content', content);
  };
  setMeta('og:title', madde.baslik + ' - Se\'âdet-i Ebediyye');
  setMeta('og:url', 'https://www.ilmihal.org/madde/' + madde.kisim + '/' + madde.madde_no);
  setMeta('og:description', 'Kısım ' + madde.kisim + ', Madde ' + madde.madde_no + ' - Se\'âdet-i Ebediyye İnteraktif İlmihâl');
  setMeta('twitter:title', madde.baslik + ' - Se\'âdet-i Ebediyye');
  setMeta('twitter:description', 'Kısım ' + madde.kisim + ', Madde ' + madde.madde_no);
  document.title = madde.baslik + ' - Se\'âdet-i Ebediyye';
}

// birlesikAra kaldırıldı — doFullSearch ile birleştirildi

// ===== ÂYET-İ KERÎME VE HADÎS-İ ŞERÎF İNDEKSİ =====
var ahCurrentTab = 'ayet';

function switchAHTab(tab) {
  ahCurrentTab = tab;
  document.querySelectorAll('.ah-tab').forEach(function(t) { t.classList.remove('active'); });
  var btns = document.querySelectorAll('.ah-tab');
  if (tab === 'ayet' && btns[0]) btns[0].classList.add('active');
  if (tab === 'hadis' && btns[1]) btns[1].classList.add('active');
  renderAyetHadis();
}

async function renderAyetHadis(filterText) {
  var list = document.getElementById('ayet-hadis-list');
  var countEl = document.getElementById('ah-count');
  if (!list) return;
  if (!window.ayetHadisData) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Âyet ve hadîs verileri yükleniyor...</p>';
    if (countEl) countEl.textContent = 'Yükleniyor...';
    try {
      await ensureAyetHadisData();
    } catch (e) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Âyet ve hadîs verileri yüklenemedi.</p>';
      if (countEl) countEl.textContent = '';
      return;
    }
  }

  var items = ahCurrentTab === 'ayet' ? window.ayetHadisData.ayetler : window.ayetHadisData.hadisler;
  var label = ahCurrentTab === 'ayet' ? 'âyet-i kerîme' : 'hadîs-i şerîf';
  
  // Filtrele (metin + sûre/kaynak bilgisinde ara)
  var search = filterText || (document.getElementById('ah-search') ? document.getElementById('ah-search').value.trim().toLowerCase() : '');
  if (search) {
    items = items.filter(function(item) {
      if (item.metin.toLowerCase().indexOf(search) !== -1) return true;
      if (item.sure && item.sure.toLowerCase().indexOf(search) !== -1) return true;
      if (item.kaynak && item.kaynak.toLowerCase().indexOf(search) !== -1) return true;
      return false;
    });
  }
  
  if (countEl) countEl.textContent = items.length + ' ' + label + ' bulundu';
  
  if (items.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Sonuç bulunamadı.</p>';
    return;
  }
  
  // Sayfalama: ilk 50
  var shown = items.slice(0, 50);
  var html = shown.map(function(item) {
    // Kaynak etiketi (sûre/âyet no veya hadîs kaynağı)
    var kaynakEtiket = '';
    if (ahCurrentTab === 'ayet' && item.sure) {
      var ayetText = escapeHtml(item.sure) + ' s\u00fbresi';
      if (item.ayet_no) {
        ayetText += ', ' + escapeHtml(String(item.ayet_no)) + ' \u00e2yet-i ker\u00eemesinde me\u00e2len';
      } else {
        ayetText += 'nde me\u00e2len';
      }
      kaynakEtiket = '<div style="color:var(--primary-dark);font-size:0.85rem;font-weight:600;margin-bottom:10px;font-style:italic;">' + ayetText + '</div>';
    } else if (ahCurrentTab === 'hadis' && item.kaynak) {
      kaynakEtiket = '<div style="color:var(--primary-dark);font-size:0.85rem;font-weight:600;margin-bottom:10px;font-style:italic;">(' + escapeHtml(item.kaynak) + ') kit\u00e2b\u0131nda bildirilen had\u00ees-i \u015fer\u00eef</div>';
    }

    // Madde bilgisi (varsa)
    var maddeHtml = '';
    if (item.kisim && item.madde) {
      var madde = window.tocData ? window.tocData.find(function(m) { return m.kisim === item.kisim && m.madde_no === item.madde; }) : null;
      var baslik = madde ? madde.baslik : 'K\u0131s\u0131m ' + item.kisim + ', Madde ' + item.madde;
      var searchQ = item.metin.substring(0, 50).replace(/'/g, "\\'").replace(/"/g, '&quot;');
      maddeHtml = '<div class="ah-item" onclick="openMadde(' + item.kisim + ',' + item.madde + ',false,\'' + searchQ + '\')" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;">' +
        kaynakEtiket +
        '<div style="font-family:Amiri,serif;font-size:0.95rem;line-height:1.8;color:var(--text);margin-bottom:8px;">' + escapeHtml(item.metin) + '</div>' +
        '<div style="font-size:0.8rem;color:var(--text-muted);">\u{1F4D6} ' + escapeHtml(baslik) + ' \u2014 <span style="color:var(--primary)">Maddenin bu yerine git \u2192</span></div>' +
        '</div>';
    } else {
      maddeHtml = '<div class="ah-item" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:10px;">' +
        kaynakEtiket +
        '<div style="font-family:Amiri,serif;font-size:0.95rem;line-height:1.8;color:var(--text);">' + escapeHtml(item.metin) + '</div>' +
        (item.sayfa ? '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;">Se\'\u00e2det-i Ebediyye, sayfa ' + item.sayfa + '</div>' : '') +
        '</div>';
    }
    return maddeHtml;
  }).join('');
  
  if (items.length > 50) {
    html += '<p style="text-align:center;color:var(--text-muted);padding:16px;">İlk 50 sonuç gösteriliyor. Aramayı daraltın.</p>';
  }
  
  list.innerHTML = html;
}

// Âyet-Hadîs arama
document.addEventListener('DOMContentLoaded', function() {
  var ahSearch = document.getElementById('ah-search');
  if (ahSearch) {
    ahSearch.addEventListener('input', function() { renderAyetHadis(); });
  }
});


// ===== SESLİ DİNLEME SİSTEMİ =====
var audioState = {
  madde: null,
  pages: [],      // bu maddenin sayfa numaraları
  currentIdx: 0,  // şu an çalan sayfa index
  playing: false
};

var AUDIO_BASE = 'https://www.hakikatkitabevi.net';

// Maddelerin ses kayıtlarındaki yerleri:
//   "kısım/madde": [başlangıç kaydı, başlangıç saniyesi, bitiş kaydı, bitiş saniyesi]
// Ses kayıtları kitabın 2026 baskısının sayfa sınırlarıyla örtüşmediğinden her maddenin
// kayıttaki başlangıcı konuşma tanıma (Whisper) ile metne hizalanarak bulunmuştur.
// Bitiş saniyesi null ise son kayıt sonuna kadar çalınır. Değeri null olan maddeler
// kayıtların alındığı eski baskıda bulunmadığından seslendirilmemiştir. Haritada
// olmayan maddede kitabın sayfa aralığı kullanılır.
var sesAraligiMap = {
  "1/1": [17, 0, 21, 173.7], "1/2": [21, 173.7, 21, 271.6], "1/3": [21, 271.6, 21, null],
  "1/4": [22, 0, 22, 51.8], "1/5": [22, 51.8, 22, 82.9], "1/6": [22, 82.9, 22, 113.8],
  "1/7": [22, 113.8, 23, 58.8], "1/8": [23, 58.8, 23, 114.7], "1/9": [23, 114.7, 23, 159.8],
  "1/10": [23, 159.8, 23, 283.5], "1/11": [23, 283.5, 30, 254.6], "1/12": [30, 254.6, 30, 294.4],
  "1/13": [30, 294.4, 32, 133.5], "1/14": [32, 133.5, 32, 323.9], "1/15": [32, 323.9, 33, 12.6],
  "1/16": [33, 12.6, 33, 119.2], "1/17": [33, 119.2, 34, 147.5], "1/18": [34, 147.5, 38, 153.5],
  "1/19": [38, 153.5, 39, 76.3], "1/20": [39, 76.3, 40, 17.7], "1/21": [40, 17.7, 40, 64.0],
  "1/22": [40, 64.0, 40, 192.4], "1/23": [40, 192.4, 41, 22.7], "1/24": [41, 22.7, 43, 164.0],
  "1/25": [43, 164.0, 48, 172.1], "1/26": [48, 172.1, 50, 271.4], "1/27": [50, 271.4, 51, 328.2],
  "1/28": [51, 328.2, 52, 202.8], "1/29": [52, 202.8, 53, 113.4], "1/30": [53, 113.4, 53, null],
  "1/31": [54, 0, 67, null], "1/32": null, "1/33": [68, 0, 68, null], "1/34": [69, 0, 69, null],
  "1/35": [70, 0, 72, null], "1/36": [73, 0, 76, null], "1/37": [77, 0, 78, null], "1/38": null,
  "1/39": [79, 0, 86, null], "1/40": [87, 0, 88, null], "1/41": [89, 0, 95, null],
  "1/42": [96, 0, 96, null], "1/43": [97, 0, 99, null], "1/44": [100, 0, 100, null],
  "1/45": [101, 0, 101, null], "1/46": [102, 0, 114, null], "1/47": [115, 0, 115, null], "1/48": null,
  "1/49": [116, 0, 117, null], "1/50": [118, 0, 120, null], "1/51": [121, 0, 121, null],
  "1/52": [122, 0, 127, null], "1/53": [128, 0, 131, null], "1/54": [132, 0, 148, null],
  "1/55": [149, 0, 152, null], "1/56": [153, 0, 159, null], "1/57": [160, 0, 162, null],
  "1/58": [163, 0, 169, null], "1/59": [170, 0, 174, null], "1/60": [175, 0, 203, null],
  "1/61": [204, 0, 208, null], "1/62": [209, 0, 209, null], "1/63": [210, 0, 213, null],
  "1/64": [214, 0, 220, null], "1/65": [221, 0, 226, null], "1/66": [227, 0, 230, null],
  "1/67": [231, 0, 235, null], "1/68": [236, 0, 242, null], "1/69": [243, 0, 247, null],
  "1/70": [248, 0, 256, null], "1/71": [257, 0, 265, null], "1/72": [266, 0, 266, null],
  "1/73": [267, 0, 271, null], "1/74": [272, 0, 286, null], "1/75": [287, 0, 287, null],
  "1/76": [288, 0, 288, null], "1/77": [289, 0, 291, null], "1/78": [292, 0, 312, null],
  "1/79": [313, 0, 321, null], "1/80": [322, 0, 323, null], "1/81": [324, 0, 329, null],
  "1/82": [330, 0, 333, null], "1/83": [334, 0, 338, null], "1/84": [339, 0, 351, null],
  "1/85": [352, 0, 357, null], "1/86": null, "1/87": [358, 0, 358, null], "1/88": null,
  "1/89": [359, 0, 362, null], "1/90": [363, 0, 366, null], "1/91": [367, 0, 368, null],
  "1/92": [369, 0, 369, null], "1/93": [370, 0, 371, null], "1/94": [372, 0, 373, null],
  "1/95": [374, 0, 382, null], "1/96": [383, 0, 385, null], "1/97": [386, 0, 391, null],
  "1/98": [392, 0, 396, null], "2/1": [397, 0, 399, null], "2/2": [400, 0, 400, null],
  "2/3": [401, 0, 401, null], "2/4": [402, 0, 412, null], "2/5": [413, 0, 421, null],
  "2/6": [422, 0, 424, null], "2/7": null, "2/8": [425, 0, 425, null], "2/9": null,
  "2/10": [426, 0, 426, null], "2/11": null, "2/12": [427, 0, 427, null], "2/13": [428, 0, 428, null],
  "2/14": [429, 0, 430, null], "2/15": [431, 0, 436, null], "2/16": [437, 0, 446, null],
  "2/17": [447, 0, 474, null], "2/18": [475, 0, 479, null], "2/19": [480, 0, 480, null],
  "2/20": [481, 0, 482, null], "2/21": [483, 0, 498, null], "2/22": [499, 0, 504, null],
  "2/23": [505, 0, 511, null], "2/24": [512, 0, 514, null], "2/25": [515, 0, 522, null],
  "2/26": [523, 0, 527, null], "2/27": [528, 0, 528, null], "2/28": [529, 0, 531, null],
  "2/29": [532, 0, 536, null], "2/30": [537, 0, 545, null], "2/31": [546, 0, 553, null],
  "2/32": [554, 0, 559, null], "2/33": [560, 0, 563, null], "2/34": [564, 0, 576, null],
  "2/35": [577, 0, 579, null], "2/36": [580, 0, 585, null], "2/37": [586, 0, 587, null],
  "2/38": [588, 0, 597, null], "2/39": [598, 0, 606, null], "2/40": [607, 0, 617, null],
  "2/41": [618, 0, 623, null], "2/42": [624, 0, 628, null], "2/43": [629, 0, 639, null],
  "2/44": [640, 0, 647, null], "2/45": [648, 0, 651, null], "2/46": [652, 0, 676, null],
  "2/47": [677, 0, 697, null], "2/48": [698, 0, 700, null], "2/49": [701, 0, 713, null],
  "2/50": [714, 0, 715, null], "2/51": [716, 0, 717, null], "2/52": [718, 0, 734, null],
  "2/53": [735, 0, 742, null], "2/54": [743, 0, 744, null], "2/55": null, "2/56": [745, 0, 745, null],
  "2/57": [746, 0, 746, null], "2/58": null, "2/59": [747, 0, 747, null], "2/60": [748, 0, 748, null],
  "2/61": [749, 0, 752, null], "2/62": [753, 0, 753, null], "2/63": null, "2/64": [754, 0, 754, null],
  "2/65": null, "2/66": [755, 0, 755, null], "2/67": [756, 0, 762, null], "2/68": null,
  "2/69": [763, 0, 763, null], "2/70": [764, 0, 764, null], "2/71": [765, 0, 765, null],
  "2/72": [766, 0, 770, null], "2/73": [771, 0, 774, null], "3/1": [775, 0, 777, null],
  "3/2": [778, 0, 785, null], "3/3": [786, 0, 791, null], "3/4": [792, 0, 805, null],
  "3/5": [806, 0, 807, null], "3/6": [808, 0, 815, null], "3/7": [816, 0, 816, null],
  "3/8": [817, 0, 818, null], "3/9": [819, 0, 820, null], "3/10": [821, 0, 821, null],
  "3/11": [822, 0, 823, null], "3/12": [824, 0, 829, null], "3/13": [830, 0, 833, null],
  "3/14": [834, 0, 839, null], "3/15": [840, 0, 844, null], "3/16": [845, 0, 846, null],
  "3/17": [847, 0, 849, null], "3/18": [850, 0, 850, null], "3/19": [851, 0, 864, null],
  "3/20": [865, 0, 868, null], "3/21": [869, 0, 878, null], "3/22": [879, 0, 884, null],
  "3/23": [885, 0, 891, null], "3/24": [892, 0, 895, null], "3/25": [896, 0, 896, null],
  "3/26": [897, 0, 901, null], "3/27": [902, 0, 905, null], "3/28": [906, 0, 909, null],
  "3/29": [910, 0, 911, null], "3/30": [912, 0, 912, null], "3/31": [913, 0, 913, null],
  "3/32": [914, 0, 914, null], "3/33": [915, 0, 916, null], "3/34": [917, 0, 917, null],
  "3/35": [918, 0, 918, null], "3/36": [919, 0, 920, null], "3/37": [921, 0, 923, null],
  "3/38": [924, 0, 924, null], "3/39": [925, 0, 925, null], "3/40": [926, 0, 926, null],
  "3/41": [927, 0, 928, null], "3/42": [929, 0, 929, null], "3/43": [930, 0, 932, null],
  "3/44": [933, 0, 939, null], "3/45": [940, 0, 940, null], "3/46": [941, 0, 942, null],
  "3/47": [943, 0, 946, null], "3/48": null, "3/49": [947, 0, 947, null], "3/50": [948, 0, 952, null],
  "3/51": [953, 0, 958, null], "3/52": [959, 0, 966, null], "3/53": [967, 0, 970, null],
  "3/54": [971, 0, 987, null], "3/55": [988, 0, 993, null], "3/56": [994, 0, 998, null],
  "3/57": [999, 0, 1002, null], "3/58": [1003, 0, 1007, null], "3/59": [1008, 0, 1012, null],
  "3/60": [1013, 0, 1016, null], "3/61": [1017, 0, 1017, null], "3/62": [1018, 0, 1018, null],
  "3/63": [1019, 0, 1024, null], "3/64": [1025, 0, 1029, null], "3/65": [1030, 0, 1033, null],
  "3/66": [1034, 0, 1034, null], "3/67": [1035, 0, 1035, null], "3/68": [1036, 0, 1036, null],
  "3/69": [1037, 0, 1040, null], "3/70": [1041, 0, 1058, null]
};

function getAudioPagesForMadde(madde) {
  if (!window.audioMap) return [];
  var aralik = sesAraligiMap[madde.kisim + '/' + madde.madde_no];
  if (aralik === null) return [];
  var start = aralik ? aralik[0] : madde.sayfa_no;
  var end = aralik ? aralik[2] : Math.max(madde.sayfa_bitis || madde.sayfa_no, madde.pdf_sayfa_bitis || madde.sayfa_no, madde.sayfa_no);
  var pages = [];
  for (var p = start; p <= end; p++) {
    if (window.audioMap[p]) {
      pages.push({ page: p, path: window.audioMap[p] });
    }
  }
  return pages;
}

async function initAudioForMadde(madde) {
  audioState.madde = madde;
  audioState.currentIdx = 0;
  audioState.playing = false;

  var btn = document.getElementById('audio-btn');
  var bar = document.getElementById('audio-player-bar');
  audioState.pages = [];

  if (!window.audioMap) {
    if (btn) {
      btn.style.display = 'flex';
      btn.innerHTML = '…';
      btn.classList.remove('playing');
    }
    if (bar) bar.style.display = 'none';
    try {
      await ensureAudioMapData();
    } catch (e) {
      if (btn) btn.style.display = 'none';
      return;
    }
    if (!audioState.madde || audioState.madde.kisim !== madde.kisim || audioState.madde.madde_no !== madde.madde_no) return;
  }

  audioState.pages = getAudioPagesForMadde(madde);

  if (audioState.pages.length === 0) {
    if (btn) btn.style.display = 'none';
    if (bar) bar.style.display = 'none';
    return;
  }

  if (btn) {
    btn.style.display = 'flex';
    btn.innerHTML = SVG_OYNAT;
    btn.classList.remove('playing');
  }
  if (bar) bar.style.display = 'none';

  var audio = document.getElementById('madde-audio');
  if (audio) {
    audio.pause();
    audio.src = '';
  }
}

function toggleAudio() {
  var bar = document.getElementById('audio-player-bar');
  if (!bar) return;

  if (bar.style.display === 'none') {
    bar.style.display = 'flex';
    loadAudioPage(0);
    playAudio();
  } else {
    if (audioState.playing) {
      pauseAudio();
    } else {
      playAudio();
    }
  }
}

function loadAudioPage(idx) {
  if (idx < 0 || idx >= audioState.pages.length) return;
  audioState.currentIdx = idx;
  var page = audioState.pages[idx];
  var audio = document.getElementById('madde-audio');
  if (!audio) return;

  audio.src = AUDIO_BASE + encodeURI(page.path).replace(/%20/g, '%20');
  audio.load();

  // Madde kaydın ortasında başlıyorsa başlangıcına atla; son kayıtta maddenin bittiği yerde dur
  var aralik = audioState.madde ? sesAraligiMap[audioState.madde.kisim + '/' + audioState.madde.madde_no] : null;
  audioState.bitisSaniye = (aralik && idx === audioState.pages.length - 1 && page.page === aralik[2]) ? aralik[3] : null;
  if (idx === 0 && aralik && page.page === aralik[0] && aralik[1] > 0) {
    var offset = aralik[1];
    audio.addEventListener('loadedmetadata', function onMeta() {
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.currentTime = offset;
    });
  }

  var label = document.getElementById('audio-page-label');
  if (label) label.textContent = 'Kayıt ' + (idx + 1) + '/' + audioState.pages.length;
}

function playAudio() {
  var audio = document.getElementById('madde-audio');
  if (!audio || !audio.src) return;
  audio.playbackRate = audioSpeed;
  audio.play().catch(function(){});
  audioState.playing = true;
  updateAudioUI();
}

function pauseAudio() {
  var audio = document.getElementById('madde-audio');
  if (audio) audio.pause();
  audioState.playing = false;
  updateAudioUI();
}

function toggleAudioPlay() {
  if (audioState.playing) pauseAudio();
  else playAudio();
}

function audioNav(dir) {
  var newIdx = audioState.currentIdx + dir;
  if (newIdx < 0 || newIdx >= audioState.pages.length) return;
  loadAudioPage(newIdx);
  if (audioState.playing) playAudio();
}

function audioSeek(e) {
  var audio = document.getElementById('madde-audio');
  if (!audio || !audio.duration) return;
  var rect = e.currentTarget.getBoundingClientRect();
  var pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
}

function updateAudioUI() {
  var btn = document.getElementById('audio-btn');
  var playBtn = document.getElementById('audio-play-pause');
  if (btn) {
    if (audioState.playing) {
      btn.innerHTML = SVG_DURAKLAT;
      btn.classList.add('playing');
    } else {
      btn.innerHTML = SVG_OYNAT;
      btn.classList.remove('playing');
    }
  }
  if (playBtn) {
    playBtn.innerHTML = audioState.playing ? '&#9646;&#9646;' : '&#9654;';
  }
}

// Audio events
document.addEventListener('DOMContentLoaded', function() {
  var audio = document.getElementById('madde-audio');
  if (!audio) return;

  audio.addEventListener('timeupdate', function() {
    if (!audio.duration) return;
    if (audioState.bitisSaniye && audio.currentTime >= audioState.bitisSaniye) {
      audioState.bitisSaniye = null;
      audio.pause();
      sesKaydiBitti();
      return;
    }
    var pct = (audio.currentTime / audio.duration) * 100;
    var prog = document.getElementById('audio-progress');
    if (prog) prog.style.width = pct + '%';
    var timeEl = document.getElementById('audio-time');
    if (timeEl) {
      var m = Math.floor(audio.currentTime / 60);
      var s = Math.floor(audio.currentTime % 60);
      timeEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }
  });

  audio.addEventListener('ended', sesKaydiBitti);
});

function sesKaydiBitti() {
  if (audioState.currentIdx < audioState.pages.length - 1) {
    audioNav(1); playAudio();
  } else if (continuousPlay) {
    navMadde(1);
    setTimeout(function() { toggleAudio(); }, 1500);
  } else {
    audioState.playing = false; updateAudioUI();
  }
}

// closeMadde'de audio'yu durdur
var _origCloseMadde = closeMadde;
closeMadde = function() {
  var audio = document.getElementById('madde-audio');
  if (audio) { audio.pause(); audio.src = ''; }
  audioState.playing = false;
  _origCloseMadde();
};


// ===== NOT ALMA SİSTEMİ =====
function toggleNotlar() {
  var area = document.getElementById('notlar-area');
  var btn = document.getElementById('notlar-toggle');
  if (area.style.display === 'none') {
    area.style.display = 'block';
    if (btn) btn.textContent = '−';
    loadNotlar();
  } else {
    area.style.display = 'none';
    if (btn) btn.textContent = '+';
  }
}

function getNotlar() {
  try { return JSON.parse(localStorage.getItem('ilmihal-notlar') || '{}'); } catch(e) { return {}; }
}

function loadNotlar() {
  if (!currentMaddeForBookmark) return;
  var key = currentMaddeForBookmark.kisim + '/' + currentMaddeForBookmark.madde_no;
  var notlar = getNotlar();
  var list = notlar[key] || [];
  var listEl = document.getElementById('not-list');
  if (!listEl) return;
  if (list.length === 0) {
    listEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;margin-top:8px;">Henüz not yok.</p>';
  } else {
    listEl.innerHTML = list.map(function(n, i) {
      return '<div class="not-item"><div class="not-text">' + escapeHtml(n.text) + '</div><div class="not-meta"><span>' + escapeHtml(n.date) + '</span><button type="button" onclick="deleteNot(' + i + ')" class="not-sil">&times;</button></div></div>';
    }).join('');
  }
}

function saveNot() {
  if (!currentMaddeForBookmark) return;
  var input = document.getElementById('not-input');
  var text = input.value.trim();
  if (!text) return;
  var key = currentMaddeForBookmark.kisim + '/' + currentMaddeForBookmark.madde_no;
  var notlar = getNotlar();
  if (!notlar[key]) notlar[key] = [];
  notlar[key].push({ text: text, date: new Date().toLocaleDateString('tr-TR') });
  localStorage.setItem('ilmihal-notlar', JSON.stringify(notlar));
  input.value = '';
  loadNotlar();
}

function deleteNot(idx) {
  if (!currentMaddeForBookmark) return;
  var key = currentMaddeForBookmark.kisim + '/' + currentMaddeForBookmark.madde_no;
  var notlar = getNotlar();
  if (notlar[key]) {
    notlar[key].splice(idx, 1);
    if (notlar[key].length === 0) delete notlar[key];
    localStorage.setItem('ilmihal-notlar', JSON.stringify(notlar));
    loadNotlar();
  }
}

// ===== MADDE İÇİ NAVİGASYON =====
function navMadde(dir) {
  if (!currentMaddeForBookmark || !window.tocData) return;
  var current = window.tocData.findIndex(function(m) {
    return m.kisim === currentMaddeForBookmark.kisim && m.madde_no === currentMaddeForBookmark.madde_no;
  });
  if (current === -1) return;
  var newIdx = current + dir;
  if (newIdx < 0 || newIdx >= window.tocData.length) return;
  var next = window.tocData[newIdx];
  // Audio durdur
  var audio = document.getElementById('madde-audio');
  if (audio) { audio.pause(); audio.src = ''; }
  audioState.playing = false;
  var bar = document.getElementById('audio-player-bar');
  if (bar) bar.style.display = 'none';
  // Yeni maddeyi aç
  openMadde(next.kisim, next.madde_no);
}

// ===== SES HIZ KONTROLÜ =====
var audioSpeed = parseFloat(localStorage.getItem('ilmihal-audio-speed')) || 1;
function cycleAudioSpeed() {
  var speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  var idx = speeds.indexOf(audioSpeed);
  audioSpeed = speeds[(idx + 1) % speeds.length];
  var audio = document.getElementById('madde-audio');
  if (audio) audio.playbackRate = audioSpeed;
  var btn = document.getElementById('audio-speed-btn');
  if (btn) btn.textContent = audioSpeed + 'x';
  localStorage.setItem('ilmihal-audio-speed', audioSpeed);
}

// 10sn ileri/geri atlama
function audioSkip(seconds) {
  var audio = document.getElementById('madde-audio');
  if (!audio) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration || 9999, audio.currentTime + seconds));
}

// ===== UYKU ZAMANLAYICI =====
var sleepTimer = null;
function setSleepTimer(minutes) {
  if (sleepTimer) clearTimeout(sleepTimer);
  if (minutes === 0) {
    var btn = document.getElementById('sleep-btn');
    if (btn) { btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'; btn.title = 'Uyku zamanlayıcı'; }
    return;
  }
  sleepTimer = setTimeout(function() {
    pauseAudio();
    sleepTimer = null;
    var btn = document.getElementById('sleep-btn');
    if (btn) { btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'; btn.title = 'Uyku zamanlayıcı'; }
  }, minutes * 60000);
  var btn = document.getElementById('sleep-btn');
  if (btn) { btn.textContent = minutes + 'dk'; btn.title = minutes + ' dakika sonra duracak'; }
}
function cycleSleepTimer() {
  var timers = [0, 15, 30, 60];
  var current = sleepTimer ? parseInt(document.getElementById('sleep-btn')?.textContent) || 0 : 0;
  var idx = timers.indexOf(current);
  setSleepTimer(timers[(idx + 1) % timers.length]);
}

// ===== KALDIĞI YERDEN DEVAM =====
function saveAudioPosition() {
  if (!audioState.madde) return;
  var audio = document.getElementById('madde-audio');
  if (!audio || !audio.currentTime) return;
  var pos = {
    kisim: audioState.madde.kisim,
    maddeNo: audioState.madde.madde_no,
    pageIdx: audioState.currentIdx,
    time: audio.currentTime
  };
  localStorage.setItem('ilmihal-audio-pos', JSON.stringify(pos));
}

function restoreAudioPosition() {
  try {
    var pos = JSON.parse(localStorage.getItem('ilmihal-audio-pos'));
    if (pos && audioState.madde && pos.kisim === audioState.madde.kisim && pos.maddeNo === audioState.madde.madde_no) {
      if (pos.pageIdx < audioState.pages.length) {
        loadAudioPage(pos.pageIdx);
        var audio = document.getElementById('madde-audio');
        if (audio) {
          audio.addEventListener('loadeddata', function onLoad() {
            audio.currentTime = pos.time;
            audio.removeEventListener('loadeddata', onLoad);
          });
        }
      }
    }
  } catch(e) {}
}

// Her 5 saniyede pozisyon kaydet
setInterval(function() {
  if (audioState.playing) saveAudioPosition();
}, 5000);

// ===== SÜREKLİ DİNLEME (Sonraki maddeye otomatik geç) =====
var continuousPlay = false;
function toggleContinuousPlay() {
  continuousPlay = !continuousPlay;
  var btn = document.getElementById('continuous-btn');
  if (btn) {
    btn.style.opacity = continuousPlay ? '1' : '0.5';
    btn.title = continuousPlay ? 'Sürekli dinleme: AÇIK' : 'Sürekli dinleme: KAPALI';
  }
}


// ===== MEDIASESSION API (Kilit ekranı kontrolü) =====
function updateMediaSession() {
  if (!('mediaSession' in navigator) || !audioState.madde) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: audioState.madde.baslik,
    artist: "Se'âdet-i Ebediyye",
    album: 'Kısım ' + audioState.madde.kisim
  });
  navigator.mediaSession.setActionHandler('play', function() { playAudio(); });
  navigator.mediaSession.setActionHandler('pause', function() { pauseAudio(); });
  navigator.mediaSession.setActionHandler('previoustrack', function() { audioNav(-1); });
  navigator.mediaSession.setActionHandler('nexttrack', function() { audioNav(1); });
  navigator.mediaSession.setActionHandler('seekbackward', function() { audioSkip(-10); });
  navigator.mediaSession.setActionHandler('seekforward', function() { audioSkip(10); });
}

// initAudioForMadde'e mediaSession + restore ekle
var _origInitAudio = initAudioForMadde;
initAudioForMadde = function(madde) {
  return Promise.resolve(_origInitAudio(madde)).then(function() {
    updateMediaSession();
    restoreAudioPosition();
  });
};

// ===== TAM EKRAN OKUMA MODU =====
function toggleFullscreenRead() {
  var overlay = document.getElementById('madde-detay');
  if (!overlay) return;
  overlay.classList.toggle('fullscreen-mode');
  var btn = document.getElementById('fullscreen-btn');
  if (btn) {
    var fsAcik = overlay.classList.contains('fullscreen-mode');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg> ' + (fsAcik ? 'Tam ekrandan çık' : 'Tam ekran');
  }
}

// ===== GÜNLÜK HEDEF =====
function getDailyGoal() {
  try { return JSON.parse(localStorage.getItem('ilmihal-daily-goal') || '{"target":30,"today":"","minutes":0}'); }
  catch(e) { return {target:30,today:'',minutes:0}; }
}

function updateDailyGoal(addMinutes) {
  var goal = getDailyGoal();
  var today = new Date().toISOString().slice(0,10);
  if (goal.today !== today) { goal.today = today; goal.minutes = 0; }
  goal.minutes += addMinutes;
  localStorage.setItem('ilmihal-daily-goal', JSON.stringify(goal));
  checkGoalCompletion(goal);
}

var goalCelebrated = false;
function checkGoalCompletion(goal) {
  if (goal.minutes >= goal.target && !goalCelebrated) {
    goalCelebrated = true;
    showCelebration();
  }
}

function showCelebration() {
  var el = document.createElement('div');
  el.className = 'celebration-overlay';
  el.innerHTML = '<div class="celebration-content"><div class="celebration-icon">✓</div><h3>Bugünkü okuma hedefiniz tamam</h3><p>Allahü teâlâ okuduklarınızla amel etmeyi nasîb eylesin.</p><button type="button" class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Devam Et</button></div>';
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 8000);
}

// Her dakika okuma süresi güncelle (madde açıkken)
var readingInterval = null;
var _origOpenMadde2 = openMadde;

// Madde açılınca okuma süresi say
document.addEventListener('DOMContentLoaded', function() {
  // Her 60 saniyede madde açıksa 1 dakika ekle
  setInterval(function() {
    if (document.getElementById('madde-detay')?.style.display === 'flex') {
      updateDailyGoal(1);
    }
  }, 60000);
});

// ===== SPLASH SCREEN =====
function showSplash() {
  var splash = document.createElement('div');
  splash.id = 'splash-screen';
  splash.innerHTML = '<div class="splash-content"><div class="splash-besmele">بسم الله الرحمن الرحيم</div><h1 class="splash-title">Se\'âdet-i Ebediyye</h1><p class="splash-subtitle">İnteraktif İlmihâl</p><div class="splash-loader"></div></div>';
  document.body.appendChild(splash);
  setTimeout(function() {
    splash.classList.add('splash-fade');
    setTimeout(function() { splash.remove(); }, 600);
  }, 1800);
}

// Splash kapatıldı — 2.4 sn gereksiz bekleme, bazı ortamlarda CSS bozuk olup takılı kalıyordu
// (showSplash fonksiyonu ihtiyaç olursa el ile çağrılabilir)

// ===== SAYFA SEO META GÜNCELLEMELERİ =====
var pageSeoMap = {
  'anasayfa': ["Se'âdet-i Ebediyye - İnteraktif İlmihâl", "Se'âdet-i Ebediyye kitabının tamamı, aranabilir 241 madde, 9.863 terimlik dinî lügat, 1020 hâl tercemesi ve interaktif silsile atlası."],
  'sozluk': ["Dinî Lügat (9.863 Terim) - Se'âdet-i Ebediyye", "Se'âdet-i Ebediyye'de geçen 9.863 dinî terimin Osmanlıca yazılışları ve anlamları."],
  'sahislar': ["Hâl Tercemeleri (1020 Kişi) - Se'âdet-i Ebediyye", "Se'âdet-i Ebediyye'de adı geçen 1020 kişinin, kitabın kendi hâl tercemeleri bölümünden alınmış biyografileri."],
  'fevaid': ["Fevâid - Se'âdet-i Ebediyye", "Fıkhî hükümler, tablolar, âyet-i kerîme ve hadîs-i şerîf indeksi, dinî lügat, hâl tercemeleri ve kitabın kendi tanımları."],
  'arama': ["Arama - Se'âdet-i Ebediyye", "Se'âdet-i Ebediyye kitabının 241 maddesinde, dinî lügatte ve hâl tercemelerinde tam metin arama."],
  'quiz': ["Bilgi Testi - Se'âdet-i Ebediyye", "İmân, namaz, oruç, zekât, hac ve ahlâk konularında bilgilerinizi test edin."],
  'ayet-hadis': ["Âyet-i Kerîme ve Hadîs-i Şerîf İndeksi - Se'âdet-i Ebediyye", "Kitapta geçen 193 âyet-i kerîme ve 449 hadîs-i şerîfin, kitaptaki yerleriyle listesi."],
  'hakkinda': ["Hakkında - Se'âdet-i Ebediyye İnteraktif İlmihâl", "Se'âdet-i Ebediyye interaktif ilmihâl platformu hakkında bilgi."],
  'gunun-bilgisi': ["Günün Suâli - Se'âdet-i Ebediyye", "Her gün Se'âdet-i Ebediyye kitabından bir suâl; cevabı ilgili maddede. Paylaşılabilir görsel kartlar."],
  'rehberler': ["Konuya Göre Rehberler - Se'âdet-i Ebediyye", "Namaz, oruç, hac, zekât, iman ve ahlâk konularında adım adım rehberler."],
  'icerik': ["İçindekiler - Se'âdet-i Ebediyye", "Se'âdet-i Ebediyye kitabının 241 maddesinin tam listesi. Üç kısım halinde konulara göre düzenlenmiş."],
  'calisma-alanim': ["Çalışma Alanım - Se'âdet-i Ebediyye", "Kişisel okuma ilerlemesi, notlar ve çalışma takibi. Veriler yalnızca tarayıcınızda saklanır."],
  'gizlilik': ["Gizlilik Bildirimi - Se'âdet-i Ebediyye", "ilmihal.org gizlilik bildirimi. Kişisel veri toplanmaz, çerez kullanılmaz, veriler yalnızca tarayıcınızda saklanır."],
  'hukumler': ["Fıkhî Hükümler - Se'âdet-i Ebediyye", "Se'âdet-i Ebediyye kitabında geçen farz, vâcib, sünnet, müstehab, mübah, mekruh ve haram hükümlerinin kategorik listesi."]
};

// ===== GÜNÜN BİLGİSİ =====
function getGununBilgisiIdx() {
  // Gün, kullanıcının yerel gece yarısında değişir (UTC'ye göre hesap Türkiye'de sabah 03:00'te değiştiriyordu)
  return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
}

function getGununBilgisi(offset) {
  if (!window.gununSorusuData || window.gununSorusuData.length === 0) return null;
  var all = window.gununSorusuData;
  var idx = (getGununBilgisiIdx() + (offset || 0)) % all.length;
  if (idx < 0) idx += all.length;
  return all[idx];
}

async function renderGununBilgisi() {
  var card = document.getElementById('gunun-bilgisi-card');
  var paylasim = document.getElementById('gunun-bilgisi-paylasim');
  if (!card) return;
  if (!window.gununSorusuData) {
    card.innerHTML = '<p>Veri yükleniyor...</p>';
    try {
      await ensureGununSorusuData();
    } catch (e) {
      card.innerHTML = '<p>Veri yüklenemedi.</p>';
      if (paylasim) paylasim.innerHTML = '';
      return;
    }
  }

  var bilgi = getGununBilgisi(0);
  if (!bilgi) { card.innerHTML = '<p>Veri yükleniyor...</p>'; return; }

  var tipLabel = 'SUÂL';
  var baslikHtml = bilgi.baslik ? '<div class="gb-ozu">' + escapeHtml(bilgi.baslik) + '</div>' : '';
  var gbHint = escapeSearchQ(bilgi.soru || bilgi.baslik || '');
  var maddeLink = bilgi.kisim > 0 && bilgi.madde > 0 ? '<a href="#" class="gb-cevab-link" onclick="openMadde(' + bilgi.kisim + ',' + bilgi.madde + ',false,\'' + gbHint + '\');return false">Cevâbı için maddeyi oku &rarr;</a>' : '';
  card.innerHTML = '<div class="gb-tip">' + tipLabel + '</div>' +
    '<div class="gb-metin">' + escapeHtml(bilgi.soru) + '</div>' +
    baslikHtml +
    '<div class="gb-kaynak">' + maddeLink + '</div>';

  paylasim.innerHTML = '<button type="button" class="btn btn-primary" onclick="paylasGununBilgisi()">Paylaş</button> ' +
    '<button type="button" class="btn btn-secondary" style="background:var(--primary-light);color:#fff;" onclick="gununBilgisiKart()">Görsel Kart Oluştur</button>';

  // Önceki günler
  var onceki = document.getElementById('onceki-bilgiler');
  if (onceki) {
    var html = '';
    for (var i = 1; i <= 7; i++) {
      var b = getGununBilgisi(-i);
      if (!b) break;
      var gun = new Date(Date.now() - i * 86400000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
      var preview = b.soru.length > 100 ? b.soru.substring(0, 100) + '...' : b.soru;
      html += '<div class="gb-onceki" onclick="openMadde(' + b.kisim + ',' + b.madde + ')" style="cursor:pointer;"><span class="gb-onceki-tarih">' + gun + '</span><span class="gb-onceki-metin">' + escapeHtml(preview) + '</span></div>';
    }
    onceki.innerHTML = html;
  }
}

function paylasGununBilgisi() {
  var bilgi = getGununBilgisi(0);
  if (!bilgi) return;
  var kaynak = 'Se\'âdet-i Ebediyye, ' + (bilgi.baslik || ('Kısım ' + bilgi.kisim + ' / Madde ' + bilgi.madde));
  var text = 'Suâl: ' + bilgi.soru + '\n\n— ' + kaynak + '\nhttps://www.ilmihal.org/gunun-bilgisi';
  if (navigator.share) {
    navigator.share({ title: 'Günün Suâli - ilmihal.org', text: text }).catch(function(){});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() { alert('Kopyalandı!'); });
  }
}

function gununBilgisiKart() {
  var bilgi = getGununBilgisi(0);
  if (!bilgi) return;
  var canvas = document.getElementById('paylasim-canvas');
  if (!canvas) return;
  canvas.width = 1080; canvas.height = 1080;
  var ctx = canvas.getContext('2d');

  // Arka plan
  var grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#0e4a35');
  grad.addColorStop(1, '#1a6b4e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  // Dekoratif çizgi
  ctx.fillStyle = '#c9a84c';
  ctx.fillRect(80, 120, 100, 4);

  // Tip etiketi
  ctx.fillStyle = '#c9a84c';
  ctx.font = '600 28px Inter, sans-serif';
  ctx.fillText('SUÂL', 80, 180);

  // Metin (word wrap)
  ctx.fillStyle = '#ffffff';
  ctx.font = '400 36px Literata, Georgia, serif';
  var words = bilgi.soru.split(' ');
  var lines = []; var line = '';
  words.forEach(function(w) {
    var test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > 880) { lines.push(line); line = w; }
    else { line = test; }
  });
  if (line) lines.push(line);
  lines.slice(0, 12).forEach(function(l, i) {
    ctx.fillText(l, 80, 260 + i * 52);
  });

  // Alt bilgi
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '24px sans-serif';
  var baslikText = bilgi.baslik || ('Kısım ' + bilgi.kisim + ' / Madde ' + bilgi.madde);
  if (baslikText.length > 60) baslikText = baslikText.substring(0, 60) + '...';
  ctx.fillText("Se'âdet-i Ebediyye", 80, 900);
  ctx.fillText(baslikText, 80, 940);
  ctx.fillText('ilmihal.org', 80, 980);

  // İndir
  var link = document.createElement('a');
  link.download = 'gunun-bilgisi.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ===== PAYLAŞIM KARTI (Madde İçinden) =====
function maddePaylasimKarti(kisim, maddeNo) {
  var madde = getMaddeMeta(kisim, maddeNo);
  if (!madde) return;
  var fontlar = (document.fonts && document.fonts.load)
    ? Promise.all([
        document.fonts.load('600 56px Literata', madde.baslik.slice(0, 12)),
        document.fonts.load('600 26px Inter', 'SEÂDET'),
        document.fonts.load('400 24px Inter', 'Kısım')
      ]).catch(function() {})
    : Promise.resolve();
  fontlar.then(function() {
    var W = 1200, H = 630;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0c3d2c'); grad.addColorStop(1, '#1a6b4e');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(201,168,76,0.85)'; ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    ctx.fillStyle = '#c9a84c';
    ctx.font = '600 26px Inter, sans-serif';
    ctx.fillText("SE'ÂDET-İ EBEDİYYE", 80, 124);
    ctx.fillRect(80, 146, 84, 2);

    ctx.fillStyle = '#f3ead2';
    var fontBoyu = 56;
    ctx.font = '600 ' + fontBoyu + 'px Literata, Georgia, serif';
    var kelimeler = madde.baslik.split(/\s+/), satirlar = [], satir = '';
    for (var i = 0; i < kelimeler.length; i++) {
      var test = satir ? satir + ' ' + kelimeler[i] : kelimeler[i];
      if (ctx.measureText(test).width > W - 200 && satir) { satirlar.push(satir); satir = kelimeler[i]; }
      else satir = test;
    }
    if (satir) satirlar.push(satir);
    if (satirlar.length > 4) {
      satirlar = satirlar.slice(0, 4);
      satirlar[3] = satirlar[3].replace(/[,;:.\s]+$/, '') + '…';
    }
    satirlar.forEach(function(l, i) { ctx.fillText(l, 80, 240 + i * 76); });

    var kl = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.font = '400 24px Inter, sans-serif';
    ctx.fillText((kl[madde.kisim] || '') + ', Madde ' + madde.madde_no + (madde.sayfa_no ? ' · Sayfa ' + madde.sayfa_no : ''), 80, H - 104);
    ctx.fillStyle = '#c9a84c';
    ctx.font = '600 24px Inter, sans-serif';
    ctx.fillText('ilmihal.org', 80, H - 60);

    canvas.toBlob(function(blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'madde-' + kisim + '-' + maddeNo + '.png';
      a.click(); setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
    });
  });
}

function maddePaylasText(kisim, maddeNo) {
  var madde = getMaddeMeta(kisim, maddeNo);
  if (!madde) return;
  var kl = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
  var text = madde.baslik + '\n\nSe\'âdet-i Ebediyye, ' + (kl[kisim] || 'Kısım ' + kisim) + ', Madde ' + maddeNo + '\nhttps://www.ilmihal.org/madde/' + kisim + '/' + maddeNo;
  if (navigator.share) {
    navigator.share({ title: madde.baslik, text: text, url: 'https://www.ilmihal.org/madde/' + kisim + '/' + maddeNo }).catch(function(){});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() { alert('Kopyalandı!'); });
  }
}

// ===== REHBERLER =====
var rehberDetayAcik = null;

async function renderRehberler() {
  var list = document.getElementById('rehber-list');
  var detay = document.getElementById('rehber-detay');
  if (!list || !detay) return;
  if (!window.rehberlerData) {
    list.style.display = 'grid';
    detay.style.display = 'none';
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Rehberler yükleniyor...</p>';
    try {
      await ensureRehberlerData();
    } catch (e) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Rehberler yüklenemedi.</p>';
      return;
    }
  }

  if (rehberDetayAcik) {
    list.style.display = 'none';
    detay.style.display = 'block';
    renderRehberDetay(rehberDetayAcik);
    return;
  }

  list.style.display = 'grid';
  detay.style.display = 'none';
  list.innerHTML = window.rehberlerData.map(function(r) {
    var toplamMadde = 0;
    r.bolumler.forEach(function(b) { toplamMadde += b.maddeler.length; });
    return '<div class="rehber-card" onclick="openRehber(\'' + r.id + '\')" style="border-left:4px solid ' + r.renk + '">' +
      '<div class="rehber-ikon">' + r.ikon + '</div>' +
      '<h3>' + escapeHtml(r.baslik) + '</h3>' +
      '<p>' + escapeHtml(r.aciklama) + '</p>' +
      '<span class="fevaid-sec-count">' + r.bolumler.length + ' bölüm, ' + toplamMadde + ' madde</span>' +
      '</div>';
  }).join('');
}

async function openRehber(id) {
  if (!window.rehberlerData) {
    try {
      await ensureRehberlerData();
    } catch (e) {
      return;
    }
  }
  rehberDetayAcik = id;
  void renderRehberler();
}

function closeRehber() {
  rehberDetayAcik = null;
  void renderRehberler();
}

function renderRehberDetay(id) {
  var detay = document.getElementById('rehber-detay');
  var r = window.rehberlerData.find(function(x) { return x.id === id; });
  if (!r || !detay) return;

  var html = '<button type="button" class="fevaid-back-btn" onclick="closeRehber()">&#8592; Rehberler</button>';
  html += '<h2 style="color:var(--primary-dark);margin:16px 0 8px;">' + r.ikon + ' ' + escapeHtml(r.baslik) + '</h2>';
  html += '<p style="color:var(--text-muted);margin-bottom:24px;">' + escapeHtml(r.aciklama) + '</p>';

  r.bolumler.forEach(function(b, bi) {
    html += '<div class="rehber-bolum">';
    html += '<h3 class="rehber-bolum-baslik"><span class="rehber-bolum-no">' + (bi + 1) + '</span> ' + escapeHtml(b.baslik) + '</h3>';
    html += '<div class="rehber-maddeler">';
    b.maddeler.forEach(function(m) {
      var rHint = escapeSearchQ(m.not || b.baslik);
      html += '<a href="#" class="rehber-madde-item" onclick="openMadde(' + m.kisim + ',' + m.maddeNo + ',false,\'' + rHint + '\');return false">' +
        '<span class="rehber-madde-no">K' + m.kisim + ' / M' + m.maddeNo + '</span>' +
        '<span class="rehber-madde-not">' + escapeHtml(m.not) + '</span>' +
        '</a>';
    });
    html += '</div></div>';
  });

  detay.innerHTML = html;
}

// ===== UX-03: İLİŞKİSEL ÖNERİ MODÜLLERİ =====
// İlgili maddeler crossref.js'ten gelir: kitaptaki açık atıflar ("… maddeye bakınız"), bu maddeye
// atıf yapan maddeler ve metin benzerliğiyle bulunan yakın konular. Önceki/sonraki madde zaten
// alttaki gezinme düğmelerinde olduğu için burada gösterilmez.
function getIliskiliMaddeler(kisim, maddeNo) {
  if (!window.tocData || !window.crossRefData) return '';
  var kayitlar = window.crossRefData[kisim + '/' + maddeNo] || [];
  var oncelik = { 'madde referansı': 0, 'atıf yapan madde': 1, 'aynı konu': 2 };
  var etiket = { 'madde referansı': 'Kitapta atıf', 'atıf yapan madde': 'Bu maddeye atıf yapan', 'aynı konu': 'Yakın konu' };
  var gorulen = {};
  var related = kayitlar.filter(function(r) { return r.neden in oncelik; })
    .sort(function(a, b) { return oncelik[a.neden] - oncelik[b.neden]; })
    .map(function(r) {
      var key = r.kisim + '/' + r.madde_no;
      if (gorulen[key]) return null;
      gorulen[key] = true;
      var m = getMaddeMeta(r.kisim, r.madde_no);
      return m ? { m: m, neden: r.neden } : null;
    })
    .filter(Boolean);
  if (related.length === 0) return '';

  var kisimLabels = {1:'K1', 2:'K2', 3:'K3'};
  var html = '<div class="iliskili-maddeler"><h4>İlgili Maddeler</h4><div class="iliskili-grid">';
  related.slice(0, 8).forEach(function(r) {
    var m = r.m;
    html += '<a href="/madde/' + m.kisim + '/' + m.madde_no + '" class="iliskili-item" onclick="openMadde(' + m.kisim + ',' + m.madde_no + ');return false">' +
      '<span class="iliskili-kisim">' + kisimLabels[m.kisim] + '/M' + m.madde_no + ' · ' + etiket[r.neden] + '</span> ' +
      escapeHtml(m.baslik) + '</a>';
  });
  html += '</div></div>';
  return html;
}

// ===== SEARCH-01: FİLTRE FONKSİYONU =====
function filtreAramaSonuclari(tip) {
  var btns = document.querySelectorAll('.arama-filtre-btn');
  btns.forEach(function(b) { b.classList.toggle('active', b.dataset.filtre === tip); });
  // Hem sonuç kartlarını hem ilgili bölümleri filtrele
  var items = document.querySelectorAll('.arama-result, .arama-ilgili');
  items.forEach(function(el) {
    if (tip === 'all' || el.dataset.tip === tip) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}

// IA-01 niyet kartları kaldırıldı

// ===== SEO-03: DİNAMİK SCHEMA.ORG =====
(function() {
  // Madde açıldığında Article schema ekle
  var _origOpenMaddeForSchema = openMadde;
  // Schema güncelleme zaten openMadde içinde addFaqSchema ile yapılıyor
  // BreadcrumbList schema'yı dinamik ekleyelim
  var schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.id = 'dynamic-schema';
  document.head.appendChild(schemaScript);

  window.updateDynamicSchema = function(type, data) {
    var schema = null;
    if (type === 'breadcrumb') {
      schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": data.map(function(item, i) {
          return {
            "@type": "ListItem",
            "position": i + 1,
            "name": item.name,
            "item": item.url
          };
        })
      };
    } else if (type === 'article') {
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "author": {"@type": "Person", "name": "Hüseyn Hilmi Işık"},
        "publisher": {"@type": "Organization", "name": "ilmihal.org"},
        "url": data.url,
        "isPartOf": {"@type": "Book", "name": "Se'âdet-i Ebediyye"}
      };
    }
    if (schema) schemaScript.textContent = JSON.stringify(schema);
  };
})();

// ===== CONTENT-02: GÜNCELLEME TARİHİ =====
// Hakkında sayfasına güncelleme tarihi ekle
(function() {
  var hakkindaContent = document.querySelector('.hakkinda-content');
  if (!hakkindaContent) return;
  var metaDiv = document.createElement('div');
  metaDiv.className = 'icerik-meta';
  metaDiv.innerHTML = '<span class="icerik-meta-item">&#128197; Son güncelleme: Mart 2026</span>' +
    '<span class="icerik-meta-item">&#128214; Kaynak: Se\'âdet-i Ebediyye, Hakîkat Kitâbevi</span>';
  hakkindaContent.insertBefore(metaDiv, hakkindaContent.querySelector('h3'));
})();

// ===== PODCAST MODU (Sürekli Dinleme Geliştirmesi) =====
var podcastMode = false;
function togglePodcastMode() {
  podcastMode = !podcastMode;
  var btn = document.getElementById('podcast-btn');
  if (btn) {
    btn.style.opacity = podcastMode ? '1' : '0.5';
    btn.title = podcastMode ? 'Podcast modu: ACIK - Maddeler arasi durmadan devam eder' : 'Podcast modu: KAPALI';
  }
  if (typeof continuousPlay !== 'undefined') {
    continuousPlay = podcastMode;
    var cBtn = document.getElementById('continuous-btn');
    if (cBtn) cBtn.style.opacity = podcastMode ? '1' : '0.5';
  }
}

// ===== PRODUCT-02: REHBER ADIM TAMAMLAMA =====
(function() {
  function getRehberProgress() {
    try { return JSON.parse(localStorage.getItem('ilmihal-rehber-progress') || '{}'); } catch(e) { return {}; }
  }
  function saveRehberProgress(data) {
    localStorage.setItem('ilmihal-rehber-progress', JSON.stringify(data));
  }

  window.toggleRehberAdim = function(rehberId, kisim, maddeNo) {
    var prog = getRehberProgress();
    if (!prog[rehberId]) prog[rehberId] = [];
    var key = kisim + '/' + maddeNo;
    var idx = prog[rehberId].indexOf(key);
    if (idx === -1) {
      prog[rehberId].push(key);
    } else {
      prog[rehberId].splice(idx, 1);
    }
    saveRehberProgress(prog);
    if (typeof rehberDetayAcik !== 'undefined' && rehberDetayAcik) {
      renderRehberDetayEnhanced(rehberDetayAcik);
    }
  };

  // Override renderRehberDetay
  var _origRenderRehberDetay = renderRehberDetay;
  window.renderRehberDetayEnhanced = function(id) {
    var detay = document.getElementById('rehber-detay');
    var r = window.rehberlerData ? window.rehberlerData.find(function(x) { return x.id === id; }) : null;
    if (!r || !detay) return;

    var prog = getRehberProgress();
    var completed = prog[id] || [];
    var totalMaddeler = 0;
    r.bolumler.forEach(function(b) { totalMaddeler += b.maddeler.length; });
    var pct = totalMaddeler > 0 ? Math.round((completed.length / totalMaddeler) * 100) : 0;

    var html = '<button type="button" class="fevaid-back-btn" onclick="closeRehber()">&#8592; Rehberler</button>';
    html += '<h2 style="color:var(--primary-dark);margin:16px 0 8px;">' + r.ikon + ' ' + escapeHtml(r.baslik) + '</h2>';
    html += '<p style="color:var(--text-muted);margin-bottom:16px;">' + escapeHtml(r.aciklama) + '</p>';

    // Progress bar
    html += '<div style="margin-bottom:24px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
    html += '<span style="font-size:0.85rem;color:var(--text-light);">' + completed.length + '/' + totalMaddeler + ' adım tamamlandı</span>';
    html += '<span style="font-size:0.85rem;font-weight:600;color:var(--primary);">%' + pct + '</span>';
    html += '</div>';
    html += '<div class="istat-bar"><div class="istat-bar-fill" style="width:' + pct + '%;background:var(--primary);height:100%;border-radius:inherit;transition:width 0.3s;"></div></div>';
    html += '</div>';

    if (pct >= 100) {
      html += '<div style="text-align:center;padding:16px;margin-bottom:16px;background:rgba(26,107,78,0.1);border-radius:var(--radius);color:var(--primary-dark);font-weight:500;">Bu rehberi tamamladınız. Allahü teâlâ ilminizi artırsın.</div>';
    }

    r.bolumler.forEach(function(b, bi) {
      var bolumDone = b.maddeler.every(function(m) { return completed.indexOf(m.kisim + '/' + m.maddeNo) !== -1; });
      html += '<div class="rehber-bolum">';
      html += '<h3 class="rehber-bolum-baslik"><span class="rehber-bolum-no">' + (bi + 1) + '</span> ' + escapeHtml(b.baslik) + (bolumDone ? ' ✓' : '') + '</h3>';
      html += '<div class="rehber-maddeler">';
      b.maddeler.forEach(function(m) {
        var key = m.kisim + '/' + m.maddeNo;
        var done = completed.indexOf(key) !== -1;
        html += '<div class="rehber-madde-item" style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid rgba(0,0,0,0.04);' + (done ? 'opacity:0.6;' : '') + '">';
        html += '<button type="button" onclick="event.stopPropagation();toggleRehberAdim(\'' + id + '\',' + m.kisim + ',' + m.maddeNo + ')" style="width:24px;height:24px;border-radius:50%;border:2px solid ' + (done ? 'var(--primary)' : 'var(--border)') + ';background:' + (done ? 'var(--primary)' : 'transparent') + ';color:#fff;font-size:0.7rem;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;" aria-label="' + (done ? 'Tamamlandı olarak işaretle' : 'Okundu olarak işaretle') + '">' + (done ? '✓' : '') + '</button>';
        html += '<a href="#" onclick="openMadde(' + m.kisim + ',' + m.maddeNo + ');return false" style="flex:1;text-decoration:none;color:inherit;">';
        html += '<span class="rehber-madde-no">K' + m.kisim + ' / M' + m.maddeNo + '</span> ';
        html += '<span class="rehber-madde-not">' + escapeHtml(m.not) + '</span>';
        html += '</a></div>';
      });
      html += '</div></div>';
    });

    detay.innerHTML = html;
  };

  // Override
  renderRehberDetay = function(id) {
    renderRehberDetayEnhanced(id);
  };
})();

// ===== UX-02: ÇALIŞMA ALANIM SAYFASI =====
(function() {
  // Çalışma Alanım sayfası oluştur
  var calismaPage = document.createElement('section');
  calismaPage.id = 'page-calisma-alanim';
  calismaPage.className = 'page';
  calismaPage.innerHTML = '<div class="container"><h2 class="section-title">Çalışma Alanım</h2><p class="section-desc">Notlarınız, yer imleriniz ve okuma geçmişiniz tek bir yerde.</p><div id="calisma-icerik"></div></div>';

  // app-root içine ekle (yoksa footer'dan önce eklensin)
  var appRoot = document.getElementById('app-root');
  if (appRoot) {
    appRoot.appendChild(calismaPage);
  } else {
    var footer = document.querySelector('.site-footer');
    if (footer) footer.parentNode.insertBefore(calismaPage, footer);
  }

  // Footer'a link ekle
  var kesfetLinks = document.querySelectorAll('.footer-links');
  if (kesfetLinks.length >= 2) {
    var link = document.createElement('a');
    link.href = '/calisma-alanim';
    link.textContent = 'Çalışma Alanım';
    link.onclick = function() { navigateTo('calisma-alanim'); return false; };
    kesfetLinks[1].appendChild(link);
  }

  function renderCalismaAlanim() {
    var el = document.getElementById('calisma-icerik');
    if (!el) return;

    var html = '';

    // 0. Okuma İstatistikleri
    html += '<div id="okuma-istatistik" style="margin-bottom:32px;"></div>';

    // 0b. Dışa aktarım
    html += '<div style="margin-bottom:28px;display:flex;gap:10px;flex-wrap:wrap;">';
    html += '<button type="button" class="disa-aktar-btn" onclick="calismaAlaniDisaAktar()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/></svg> Notları ve Vurguları İndir (.md)</button>';
    html += '</div>';

    // 1. Yer İmleri
    var bookmarks = [];
    try { bookmarks = JSON.parse(localStorage.getItem('ilmihal-bookmarks') || '[]'); } catch(e) {}
    html += '<div style="margin-bottom:32px;">';
    html += '<h3 style="color:var(--primary-dark);margin-bottom:12px;"><svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px;" aria-hidden="true"><path d="M12 17.3l-6.2 3.3 1.2-6.9-5-4.9 6.9-1L12 1.5l3.1 6.3 6.9 1-5 4.9 1.2 6.9z"/></svg>Yer İmleri (' + bookmarks.length + ')</h3>';
    if (bookmarks.length === 0) {
      html += '<p style="color:var(--text-muted);">Henüz yer imi eklenmemiş. Bir madde açıp yıldız ikonuna tıklayarak ekleyebilirsiniz.</p>';
    } else {
      html += '<div class="iliskili-grid">';
      bookmarks.forEach(function(b) {
        var parts = b.split('/');
        if (parts.length === 2) {
          var kisim = parseInt(parts[0]), maddeNo = parseInt(parts[1]);
          var m = window.tocData?.find(function(t) { return t.kisim === kisim && t.madde_no === maddeNo; });
          if (m) {
            html += '<a href="#" class="iliskili-item" onclick="openMadde(' + kisim + ',' + maddeNo + ');return false"><span class="iliskili-kisim">K' + kisim + '/M' + maddeNo + '</span> ' + escapeHtml(m.baslik) + '</a>';
          }
        }
      });
      html += '</div>';
    }
    html += '</div>';

    // 2. Notlar (gerçek depo: ilmihal-notlar)
    var notDeposu = (typeof getNotlar === 'function') ? getNotlar() : {};
    var notSayisi = 0;
    Object.keys(notDeposu).forEach(function(k) { notSayisi += (notDeposu[k] || []).length; });
    html += '<div style="margin-bottom:32px;">';
    html += '<h3 style="color:var(--primary-dark);margin-bottom:12px;"><svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px;" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/></svg>Notlarım (' + notSayisi + ')</h3>';
    if (notSayisi === 0) {
      html += '<p style="color:var(--text-muted);">Henüz not alınmamış. Bir madde açıp "Notlarım" bölümünden not ekleyebilirsiniz.</p>';
    } else {
      Object.keys(notDeposu).forEach(function(mKey) {
        (notDeposu[mKey] || []).forEach(function(n, idx) {
          var baslik = calismaMaddeBaslik(mKey);
          var git = 'openMadde(' + mKey.split('/')[0] + ',' + mKey.split('/')[1] + ');return false';
          html += '<div class="vurgu-kart" style="border-left-color:var(--primary);" onclick="' + git + '">';
          html += '<div class="vurgu-kart-metin">' + escapeHtml(n.text) + '</div>';
          html += '<div class="vurgu-kart-kaynak"><span>' + escapeHtml(baslik) + (n.date ? ' · ' + escapeHtml(n.date) : '') + '</span>';
          html += '<button type="button" class="vurgu-sil" onclick="event.stopPropagation();calismaNotSil(\'' + mKey + '\',' + idx + ')">Sil</button></div>';
          html += '</div>';
        });
      });
    }
    html += '</div>';

    // 2b. Vurgularım
    var vurguDeposu = {};
    try { vurguDeposu = JSON.parse(localStorage.getItem('ilmihal-vurgulamalar') || '{}'); } catch(e) {}
    var vurguSayisi = 0;
    Object.keys(vurguDeposu).forEach(function(k) { vurguSayisi += (vurguDeposu[k] || []).length; });
    html += '<div style="margin-bottom:32px;">';
    html += '<h3 style="color:var(--primary-dark);margin-bottom:12px;"><svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px;" aria-hidden="true"><path d="M9 11l-6 6v3h9l3-3"/><path d="M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>Vurgularım (' + vurguSayisi + ')</h3>';
    if (vurguSayisi === 0) {
      html += '<p style="color:var(--text-muted);">Henüz vurgu yapılmamış. Madde okurken metin seçip "Vurgula" diyebilirsiniz.</p>';
    } else {
      Object.keys(vurguDeposu).forEach(function(mKey) {
        (vurguDeposu[mKey] || []).forEach(function(v, idx) {
          var baslik = calismaMaddeBaslik(mKey);
          var git = 'openMadde(' + mKey.split('/')[0] + ',' + mKey.split('/')[1] + ');return false';
          html += '<div class="vurgu-kart" style="border-left-color:' + (v.renk || 'var(--gold)') + ';" onclick="' + git + '">';
          html += '<div class="vurgu-kart-metin">&ldquo;' + escapeHtml(v.text) + '&rdquo;</div>';
          html += '<div class="vurgu-kart-kaynak"><span>' + escapeHtml(baslik) + '</span>';
          html += '<button type="button" class="vurgu-sil" onclick="event.stopPropagation();calismaVurguSil(\'' + mKey + '\',' + idx + ')">Sil</button></div>';
          html += '</div>';
        });
      });
    }
    html += '</div>';

    // 3. Okuma Geçmişi
    var readHistory = [];
    try { readHistory = JSON.parse(localStorage.getItem('ilmihal-read-history') || '[]'); } catch(e) {}
    html += '<div style="margin-bottom:32px;">';
    html += '<h3 style="color:var(--primary-dark);margin-bottom:12px;"><svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px;" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Son Okunanlar (' + readHistory.length + ')</h3>';
    if (readHistory.length === 0) {
      html += '<p style="color:var(--text-muted);">Henüz madde okumadınız.</p>';
    } else {
      html += '<div class="iliskili-grid">';
      readHistory.slice(-12).reverse().forEach(function(key) {
        var parts = key.split('/');
        if (parts.length === 2) {
          var kisim = parseInt(parts[0]), maddeNo = parseInt(parts[1]);
          var m = window.tocData?.find(function(t) { return t.kisim === kisim && t.madde_no === maddeNo; });
          if (m) {
            html += '<a href="#" class="iliskili-item" onclick="openMadde(' + kisim + ',' + maddeNo + ');return false"><span class="iliskili-kisim">K' + kisim + '/M' + maddeNo + '</span> ' + escapeHtml(m.baslik) + '</a>';
          }
        }
      });
      html += '</div>';
    }
    html += '</div>';

    // 4. Rehber İlerleme
    var rehberProg = {};
    try { rehberProg = JSON.parse(localStorage.getItem('ilmihal-rehber-progress') || '{}'); } catch(e) {}
    var rehberKeys = Object.keys(rehberProg);
    if (rehberKeys.length > 0 && window.rehberlerData) {
      html += '<div style="margin-bottom:32px;">';
      html += '<h3 style="color:var(--primary-dark);margin-bottom:12px;"><svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px;" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>Rehber İlerlemesi</h3>';
      rehberKeys.forEach(function(rid) {
        var r = window.rehberlerData.find(function(x) { return x.id === rid; });
        if (!r) return;
        var totalM = 0;
        r.bolumler.forEach(function(b) { totalM += b.maddeler.length; });
        var doneM = rehberProg[rid].length;
        var rpct = totalM > 0 ? Math.round((doneM / totalM) * 100) : 0;
        html += '<div style="padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;cursor:pointer;" onclick="goToRehberDetay(\'' + rid + '\')">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '<span>' + r.ikon + ' ' + escapeHtml(r.baslik) + '</span>';
        html += '<span style="font-size:0.85rem;color:var(--primary);font-weight:600;">%' + rpct + '</span>';
        html += '</div>';
        html += '<div class="istat-bar" style="margin-top:6px;"><div class="istat-bar-fill" style="width:' + rpct + '%;background:var(--primary);height:100%;border-radius:inherit;"></div></div>';
        html += '</div>';
      });
      html += '</div>';
    }

    el.innerHTML = html;
    if (typeof renderOkumaIstatistik === 'function') renderOkumaIstatistik();
  }

  function calismaMaddeBaslik(key) {
    var parts = String(key).split('/');
    var kisim = parseInt(parts[0], 10), maddeNo = parseInt(parts[1], 10);
    var kl = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
    var m = window.tocData && window.tocData.find(function(t) { return t.kisim === kisim && t.madde_no === maddeNo; });
    return (kl[kisim] || ('Kısım ' + kisim)) + ', Madde ' + maddeNo + (m ? ' — ' + m.baslik : '');
  }

  window.calismaNotSil = function(mKey, idx) {
    var notlar = (typeof getNotlar === 'function') ? getNotlar() : {};
    if (notlar[mKey]) {
      notlar[mKey].splice(idx, 1);
      if (notlar[mKey].length === 0) delete notlar[mKey];
      try { localStorage.setItem('ilmihal-notlar', JSON.stringify(notlar)); } catch(e) {}
      renderCalismaAlanim();
    }
  };

  window.calismaVurguSil = function(mKey, idx) {
    var all = {};
    try { all = JSON.parse(localStorage.getItem('ilmihal-vurgulamalar') || '{}'); } catch(e) {}
    if (all[mKey]) {
      all[mKey].splice(idx, 1);
      if (all[mKey].length === 0) delete all[mKey];
      try { localStorage.setItem('ilmihal-vurgulamalar', JSON.stringify(all)); } catch(e) {}
      renderCalismaAlanim();
    }
  };

  window.calismaAlaniDisaAktar = function() {
    var notlar = (typeof getNotlar === 'function') ? getNotlar() : {};
    var vurgular = {};
    try { vurgular = JSON.parse(localStorage.getItem('ilmihal-vurgulamalar') || '{}'); } catch(e) {}
    var anahtarlar = {};
    Object.keys(notlar).forEach(function(k) { anahtarlar[k] = true; });
    Object.keys(vurgular).forEach(function(k) { anahtarlar[k] = true; });
    var keys = Object.keys(anahtarlar).sort(function(a, b) {
      var pa = a.split('/').map(Number), pb = b.split('/').map(Number);
      return pa[0] - pb[0] || pa[1] - pb[1];
    });
    if (keys.length === 0) { alert('Dışa aktarılacak not veya vurgu yok.'); return; }
    var tarih = new Date().toLocaleDateString('tr-TR');
    var md = "# Çalışma Alanım — Se'âdet-i Ebediyye\n\n_" + tarih + " tarihinde ilmihal.org üzerinden dışa aktarıldı._\n\n";
    keys.forEach(function(k) {
      md += '## ' + calismaMaddeBaslik(k) + '\n';
      md += 'https://www.ilmihal.org/madde/' + k + '\n\n';
      (vurgular[k] || []).forEach(function(v) { md += '> ' + String(v.text).replace(/\n/g, ' ') + '\n\n'; });
      var notList = notlar[k] || [];
      if (notList.length) {
        md += '**Notlarım:**\n\n';
        notList.forEach(function(n) { md += '- ' + (n.date ? '(' + n.date + ') ' : '') + String(n.text).replace(/\n/g, ' ') + '\n'; });
        md += '\n';
      }
    });
    var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ilmihal-calisma-alanim-' + new Date().toISOString().slice(0, 10) + '.md';
    a.click();
    setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
  };

  window.renderCalismaAlanim = renderCalismaAlanim;

  // Okuma geçmişi takibi: markAsRead'i genişlet
  var _origMarkAsRead = (typeof markAsRead === 'function') ? markAsRead : function() {};
  markAsRead = function(kisim, maddeNo) {
    _origMarkAsRead(kisim, maddeNo);
    var key = kisim + '/' + maddeNo;
    var history = [];
    try { history = JSON.parse(localStorage.getItem('ilmihal-read-history') || '[]'); } catch(e) {}
    // Tekrarı kaldır, sona ekle
    history = history.filter(function(h) { return h !== key; });
    history.push(key);
    if (history.length > 50) history = history.slice(-50);
    localStorage.setItem('ilmihal-read-history', JSON.stringify(history));
  };
})();

// "Nereden Başlasam?" niyet kartları kaldırıldı — ana sayfa sade tutuldu

// UX-01 Onboarding ipucu kaldırıldı — istenmedik popup'lar çıkarıldı
(function() {
  if (true) return; // disabled
  if (localStorage.getItem('ilmihal-onboarding-seen')) return;

  var tip = document.createElement('div');
  tip.id = 'onboarding-tip';
  tip.innerHTML = '' +
    '<button type="button" onclick="closeOnboarding()" class="btn btn-primary btn-sm" style="margin-top:12px;width:100%;">Anladım</button>';
  document.body.appendChild(tip);

  window.closeOnboarding = function() {
    var el = document.getElementById('onboarding-tip');
    if (el) el.remove();
    localStorage.setItem('ilmihal-onboarding-seen', '1');
  };

  // 60 saniye sonra otomatik kapat
  setTimeout(function() {
    var el = document.getElementById('onboarding-tip');
    if (el) el.remove();
    localStorage.setItem('ilmihal-onboarding-seen', '1');
  }, 60000);
})();

// SEO-04 monkey-patch kaldırıldı — sözlük/şahıs sonuçları artık doFullSearch içinde temiz entegre

// ===== FIKHİ HÜKÜMLER =====
var _hukumlerLoaded = false;
var _hukumlerLoadPromise = null;
var _hukumlerEventsInit = false;
var _hukumlerTur = 'all';
var _hukumlerKatman = 'acik';
var _hukumlerSearchTimer = null;
var _hukumlerObserver = null;

function ensureHukumlerData() {
  if (_hukumlerLoaded && window.hukumlerData) {
    initHukumlerPage();
    return Promise.resolve(window.hukumlerData);
  }
  var list = document.getElementById('hukumler-list');
  if (list) list.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">Yükleniyor…</p>';
  if (_hukumlerLoadPromise) return _hukumlerLoadPromise;
  _hukumlerLoadPromise = loadScript('hukumler-data.js' + vQuery()).then(function() {
    _hukumlerLoaded = true;
    initHukumlerPage();
    return window.hukumlerData;
  }).catch(function() {
    if (list) list.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">Veri yüklenemedi.</p>';
    throw new Error('Hukumler verisi yüklenemedi');
  }).finally(function() {
    _hukumlerLoadPromise = null;
  });
  return _hukumlerLoadPromise;
}

function initHukumlerPage() {
  if (!window.hukumlerData) return;
  if (!_hukumlerEventsInit) {
    _hukumlerEventsInit = true;
    // Kategori tabları
    var tabContainer = document.getElementById('hukumler-tabs');
    if (tabContainer) {
      tabContainer.addEventListener('click', function(e) {
        var btn = e.target.closest('.hukum-tab');
        if (!btn) return;
        tabContainer.querySelectorAll('.hukum-tab').forEach(function(t) { t.classList.remove('active'); });
        btn.classList.add('active');
        _hukumlerTur = btn.dataset.tur;
        updateKatmanToggle();
        renderHukumler();
        if (_hukumlerTur !== 'all') {
          history.replaceState(null, '', '/hukumler/' + _hukumlerTur);
        } else {
          history.replaceState(null, '', '/hukumler');
        }
      });
    }
    // Katman toggle
    var katmanToggle = document.getElementById('katman-toggle');
    if (katmanToggle) {
      katmanToggle.addEventListener('click', function(e) {
        var btn = e.target.closest('.katman-btn');
        if (!btn) return;
        katmanToggle.querySelectorAll('.katman-btn').forEach(function(t) { t.classList.remove('active'); });
        btn.classList.add('active');
        _hukumlerKatman = btn.dataset.katman;
        renderHukumler();
      });
    }
    // Arama
    var searchEl = document.getElementById('hukumler-search');
    if (searchEl) {
      searchEl.addEventListener('input', function() {
        clearTimeout(_hukumlerSearchTimer);
        _hukumlerSearchTimer = setTimeout(renderHukumler, 250);
      });
    }
  }
  updateKatmanToggle();
  renderHukumler();
}

function updateKatmanToggle() {
  // Seçili kategoride "tum" verisi yoksa toggle'ı gizle
  var toggle = document.getElementById('katman-toggle');
  if (!toggle || !window.hukumlerData) return;
  var hasTum = window.hukumlerData.some(function(r) {
    return r.katman === 'tum' && (_hukumlerTur === 'all' || r.tur === _hukumlerTur);
  });
  toggle.style.display = hasTum ? '' : 'none';
  if (!hasTum) _hukumlerKatman = 'acik';
}

function setHukumlerTur(tur) {
  _hukumlerTur = tur;
  var tabs = document.querySelectorAll('#hukumler-tabs .hukum-tab');
  tabs.forEach(function(t) {
    t.classList.toggle('active', t.dataset.tur === tur);
  });
  updateKatmanToggle();
  renderHukumler();
}

function hukumTurLabel(tur) {
  var labels = { farz:'Farz', vacib:'Vâcib', sunnet:'Sünnet', mustehab:'Müstehab', mubah:'Mübah', mekruh:'Mekruh', haram:'Haram' };
  return labels[tur] || tur;
}

var _sayfaMaddeCache = {};
function findMaddeForSayfa(sayfa) {
  if (!sayfa || !window.tocData) return null;
  if (_sayfaMaddeCache[sayfa] !== undefined) return _sayfaMaddeCache[sayfa];
  var madde = window.tocData.find(function(m) {
    var s = m.sayfa_no || 0;
    var e = m.sayfa_bitis || s;
    return s <= sayfa && sayfa <= e;
  });
  _sayfaMaddeCache[sayfa] = madde || null;
  return _sayfaMaddeCache[sayfa];
}

function renderHukumCard(h) {
  var badge = '<span class="hukum-badge hukum-' + h.tur + '">' + hukumTurLabel(h.tur) + '</span>';
  var altTur = h.alt_tur ? '<span class="hukum-alt-tur">' + h.alt_tur + '</span>' : '';
  var madde = h.madde_no ? null : (h.sayfa ? findMaddeForSayfa(h.sayfa) : null);
  var kisim = h.kisim || (madde && madde.kisim);
  var maddeNo = h.madde_no || (madde && madde.madde_no);
  // Cümlenin ilk 60 karakterini searchQuery olarak kullan (JS string escape)
  var sq = h.metin.substring(0, 60).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  var sayfaRef = h.sayfa ? '<a href="#" class="hukum-sayfa-ref" onclick="event.preventDefault();openSayfa(' + h.sayfa + ')">s.\u202f' + h.sayfa + '</a>' : '';
  var maddeRef = (kisim && maddeNo) ? '<a href="/madde/' + kisim + '/' + maddeNo + '" class="hukum-madde-ref" onclick="event.preventDefault();openMadde(' + kisim + ',' + maddeNo + ',false,\'' + sq + '\')">K' + kisim + '/M' + maddeNo + '</a>' : '';
  var konu = h.konu ? '<div class="hukum-konu">' + h.konu + '</div>' : '';
  var baglam = h.baglam ? '<details class="hukum-baglam"><summary>Bağlam</summary><p>' + h.baglam + '</p></details>' : '';
  var clickFn = (kisim && maddeNo) ? 'onclick="openMadde(' + kisim + ',' + maddeNo + ',false,\'' + sq + '\')"' : '';
  return '<div class="hukum-card hukum-card-' + h.tur + '" ' + clickFn + ' style="cursor:' + (clickFn ? 'pointer' : 'default') + '">' +
    '<div class="hukum-card-header">' + badge + altTur + '<span class="hukum-refs">' + sayfaRef + maddeRef + '</span></div>' +
    '<div class="hukum-card-metin">' + h.metin + '</div>' +
    konu + baglam +
    '</div>';
}

function renderHukumler() {
  var list = document.getElementById('hukumler-list');
  var sonuc = document.getElementById('hukumler-sonuc');
  if (!list || !window.hukumlerData) return;

  if (_hukumlerObserver) {
    _hukumlerObserver.disconnect();
    _hukumlerObserver = null;
  }

  var search = (document.getElementById('hukumler-search') || {}).value;
  search = search ? search.trim().toLowerCase() : '';

  var filtered = window.hukumlerData.filter(function(r) {
    if (_hukumlerTur !== 'all' && r.tur !== _hukumlerTur) return false;
    if (r.katman !== _hukumlerKatman) return false;
    if (search) {
      return r.metin.toLowerCase().indexOf(search) !== -1 ||
             (r.alt_tur && r.alt_tur.toLowerCase().indexOf(search) !== -1) ||
             (r.konu && r.konu.toLowerCase().indexOf(search) !== -1);
    }
    return true;
  });

  var total = filtered.length;
  var batchSize = 100;

  var turLabel = _hukumlerTur === 'all' ? 'hüküm' : hukumTurLabel(_hukumlerTur).toLowerCase() + ' hükmü';
  var katmanLabel = _hukumlerKatman === 'acik' ? 'açık' : 'toplam';
  if (sonuc) sonuc.textContent = total + ' ' + katmanLabel + ' ' + turLabel + (search ? ' (arama: "' + search + '")' : '');

  if (total === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Sonuç bulunamadı.</p>';
    return;
  }

  list.innerHTML = '';
  var offset = 0;

  function renderBatch() {
    var end = Math.min(offset + batchSize, total);
    var html = '';
    for (var i = offset; i < end; i++) html += renderHukumCard(filtered[i]);
    var frag = document.createElement('div');
    frag.innerHTML = html;
    while (frag.firstChild) list.appendChild(frag.firstChild);
    offset = end;
  }

  renderBatch();

  if (offset < total && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.className = 'hukum-sentinel';
    sentinel.style.height = '1px';
    list.appendChild(sentinel);

    _hukumlerObserver = new IntersectionObserver(function(entries) {
      if (!entries[0].isIntersecting) return;
      sentinel.remove();
      renderBatch();
      if (offset < total) {
        list.appendChild(sentinel);
      } else if (_hukumlerObserver) {
        _hukumlerObserver.disconnect();
        _hukumlerObserver = null;
      }
    }, { rootMargin: '600px' });
    _hukumlerObserver.observe(sentinel);
  } else {
    // IntersectionObserver yoksa kalanı tek seferde bas
    while (offset < total) renderBatch();
  }
}

// ===== OZELLIK 1: KALDIGINIZ YERDEN DEVAM EDIN =====
function renderDevamEt() {
  var el = document.getElementById('devam-et-banner');
  if (!el) return;
  try {
    var son = JSON.parse(localStorage.getItem('ilmihal-son-okunan'));
    if (son && son.kisim && son.madde_no && son.baslik) {
      var sure = '';
      if (son.zaman) {
        var fark = Date.now() - son.zaman;
        var dk = Math.floor(fark / 60000);
        if (dk < 60) sure = dk + ' dk önce';
        else if (dk < 1440) sure = Math.floor(dk / 60) + ' saat önce';
        else sure = Math.floor(dk / 1440) + ' gün önce';
      }
      el.innerHTML = '<div class="devam-et-inner"><div class="devam-et-icon">&#128214;</div><div class="devam-et-text"><span class="devam-et-label">Kaldığınız yerden devam edin</span><strong>' + son.baslik + '</strong>' + (sure ? '<span class="devam-et-sure">' + sure + '</span>' : '') + '</div><button type="button" class="btn btn-primary btn-sm" onclick="openMadde(' + son.kisim + ',' + son.madde_no + ')">Devam Et</button><button type="button" class="devam-et-kapat" onclick="this.closest(\'.devam-et-banner\').style.display=\'none\'" aria-label="Kapat">&times;</button></div>';
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  } catch(e) { el.style.display = 'none'; }
}
document.addEventListener('DOMContentLoaded', renderDevamEt);

// ===== OZELLIK 2: GERI BILDIRIM / HATA BILDIR =====
function gosterGeriBildirim() {
  var overlay = document.getElementById('geri-bildirim-overlay');
  if (overlay) { overlay.style.display = 'flex'; document.body.style.overflow = 'hidden'; return; }
  overlay = document.createElement('div');
  overlay.id = 'geri-bildirim-overlay';
  overlay.className = 'gb-overlay';
  overlay.innerHTML = '<div class="gb-modal"><div class="gb-header"><h3>Geri Bildirim</h3><button type="button" class="gb-kapat" onclick="kapatGeriBildirim()">&times;</button></div><form id="gb-form" onsubmit="gonderGeriBildirim(event)"><label class="gb-label">Tür<select id="gb-tur" required><option value="oneri">Öneri / İstek</option><option value="hata">Hata Bildirimi</option><option value="icerik">İçerik Hatası</option></select></label><label class="gb-label">Mesajınız<textarea id="gb-mesaj" rows="4" required placeholder="Lütfen detaylı yazınız..."></textarea></label><label class="gb-label">E-posta (isteğe bağlı)<input type="email" id="gb-email" placeholder="ornek@email.com"></label><div class="gb-actions"><button type="submit" class="btn btn-primary">Gönder</button><button type="button" class="btn btn-secondary" onclick="kapatGeriBildirim()">İptal</button></div></form><div id="gb-basarili" style="display:none;text-align:center;padding:32px"><div style="font-size:2.5rem;margin-bottom:12px">&#10004;</div><h4>E-posta uygulamanız açılıyor</h4><p style="color:var(--text-light);margin-top:8px">Hazırlanan e-postayı gönderdiğinizde mesajınız bize ulaşır. Uygulama açılmadıysa info@ilmihal.org adresine yazabilirsiniz.</p><button type="button" class="btn btn-secondary" style="margin-top:16px" onclick="kapatGeriBildirim()">Kapat</button></div></div>';
  document.body.appendChild(overlay);
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) kapatGeriBildirim(); });
}
function kapatGeriBildirim() {
  var o = document.getElementById('geri-bildirim-overlay');
  if (o) { o.style.display = 'none'; document.body.style.overflow = ''; }
}
function gonderGeriBildirim(e) {
  e.preventDefault();
  var tur = document.getElementById('gb-tur');
  var turAdi = tur.options[tur.selectedIndex].text;
  var mesaj = document.getElementById('gb-mesaj').value;
  var email = document.getElementById('gb-email').value;
  var konu = encodeURIComponent('ilmihal.org geri bildirim: ' + turAdi);
  var govde = encodeURIComponent(mesaj + (email ? '\n\nGönderen: ' + email : '') + '\n\nSayfa: ' + location.href);
  // Site mesajı kendisi göndermez: e-posta uygulaması hazır metinle açılır
  window.location.href = 'mailto:info@ilmihal.org?subject=' + konu + '&body=' + govde;
  document.getElementById('gb-form').style.display = 'none';
  document.getElementById('gb-basarili').style.display = '';
}

// ===== OZELLIK 3: ONBOARDING / HOSGELDIN REHBERI =====
function showOnboarding() {
  if (localStorage.getItem('ilmihal-onboarding-done')) return;
  var steps = [
    {title:'Hoş Geldiniz!', desc:'Se\'âdet-i Ebediyye\'nin interaktif dijital platformuna hoş geldiniz. Size sitenin özelliklerini tanıtalım.', icon:'&#128075;'},
    {title:'Tam Metin Arama', desc:'Üstteki arama kutusuyla kitabın tamamında, sözlükte ve şahıslarda arama yapabilirsiniz.', icon:'&#128269;'},
    {title:'Sesli Dinleme', desc:'Her maddeyi sesli olarak dinleyebilirsiniz. Madde açıldığında ses butonuna tıklayın.', icon:'&#127911;'},
    {title:'Sözlük ve Lügat', desc:'9.863 dinî terim ve kelime anlamı. Fevâid menüsünden erişebilirsiniz.', icon:'&#128214;'},
    {title:'Not ve Yer İmi', desc:'Maddeleri işaretleyip kişisel notlar ekleyebilirsiniz. Verileriniz cihazınızda kalır.', icon:'&#128278;'},
    {title:'Tema ve Özelleştirme', desc:'Sağ üstteki tema butonuyla gündüz, sepya ve gece modları arasında geçiş yapın.', icon:'&#127769;'},
    {title:'Bilgi Testi', desc:'Fevâid bölümünden bilgi testine girerek öğrendiklerinizi pekiştirin.', icon:'&#127942;'},
    {title:'Klavye Kısayolları', desc:'Hızlı navigasyon için ? tuşuna basarak kısayolları görebilirsiniz.', icon:'&#9000;'}
  ];
  var current = 0;
  var overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.className = 'onb-overlay';
  function render() {
    var s = steps[current];
    var progress = '';
    for (var i = 0; i < steps.length; i++) progress += '<span class="onb-dot' + (i === current ? ' active' : '') + '"></span>';
    overlay.innerHTML = '<div class="onb-modal"><div class="onb-icon">' + s.icon + '</div><h3>' + s.title + '</h3><p>' + s.desc + '</p><div class="onb-dots">' + progress + '</div><div class="onb-actions">' + (current > 0 ? '<button type="button" class="btn btn-secondary btn-sm" id="onb-prev">Geri</button>' : '<span></span>') + '<button type="button" class="btn btn-primary btn-sm" id="onb-next">' + (current < steps.length - 1 ? 'İleri' : 'Başlayalım!') + '</button></div><button type="button" class="onb-skip" id="onb-skip">Atla</button></div>';
    overlay.querySelector('#onb-next').onclick = function() {
      if (current < steps.length - 1) { current++; render(); }
      else closeOnboarding();
    };
    var prev = overlay.querySelector('#onb-prev');
    if (prev) prev.onclick = function() { current--; render(); };
    overlay.querySelector('#onb-skip').onclick = closeOnboarding;
  }
  function closeOnboarding() {
    localStorage.setItem('ilmihal-onboarding-done', '1');
    overlay.classList.add('onb-fade');
    setTimeout(function() { overlay.remove(); }, 400);
  }
  render();
  document.body.appendChild(overlay);
}
// showOnboarding kaldırıldı — 8 adımlı tour istenmedi

// ===== OZELLIK 4: KLAVYE KISAYOLLARI =====
var _kisayollarAcik = false;
function gosterKisayollar() {
  _kisayollarAcik = true;
  var overlay = document.getElementById('kisayol-overlay');
  if (overlay) { overlay.style.display = 'flex'; return; }
  overlay = document.createElement('div');
  overlay.id = 'kisayol-overlay';
  overlay.className = 'kisayol-overlay';
  overlay.innerHTML = '<div class="kisayol-modal"><h3>Klavye Kısayolları</h3><div class="kisayol-grid"><div class="ks"><kbd>/</kbd> veya <kbd>F</kbd><span>Arama</span></div><div class="ks"><kbd>H</kbd><span>Ana Sayfa</span></div><div class="ks"><kbd>I</kbd><span>İçindekiler</span></div><div class="ks"><kbd>T</kbd><span>Tema Değiştir</span></div><div class="ks"><kbd>Esc</kbd><span>Maddeyi / Pencereyi Kapat</span></div><div class="ks"><kbd>B</kbd><span>Yer İmi Ekle/Çıkar</span></div><div class="ks"><kbd>J</kbd><span>Sonraki Madde</span></div><div class="ks"><kbd>K</kbd><span>Önceki Madde</span></div><div class="ks"><kbd>+</kbd><span>Yazıyı Büyüt</span></div><div class="ks"><kbd>-</kbd><span>Yazıyı Küçült</span></div><div class="ks"><kbd>?</kbd><span>Bu Pencere</span></div></div><button type="button" class="btn btn-primary btn-sm" onclick="kapatKisayollar()" style="margin-top:16px">Kapat</button></div>';
  document.body.appendChild(overlay);
  overlay.style.display = 'flex';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) kapatKisayollar(); });
}
function kapatKisayollar() {
  _kisayollarAcik = false;
  var o = document.getElementById('kisayol-overlay');
  if (o) o.style.display = 'none';
}
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;
  if (_kisayollarAcik && e.key === 'Escape') { kapatKisayollar(); return; }
  var maddeAcik = document.getElementById('madde-detay')?.style.display === 'flex';
  switch(e.key) {
    case '?': e.preventDefault(); gosterKisayollar(); break;
    case '/':
      if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); navigateTo('arama'); var si = document.getElementById('search-input'); if (si) si.focus(); }
      break;
    case 'h': if (!maddeAcik) navigateTo('anasayfa'); break;
    case 'i': if (!maddeAcik) navigateTo('icerik'); break;
    case 't': toggleDarkMode(); break;
    case 'b': if (maddeAcik && typeof toggleBookmark === 'function') toggleBookmark(); break;
    case 'j': if (maddeAcik && typeof sonrakiMadde === 'function') sonrakiMadde(); break;
    case 'k': if (maddeAcik && typeof oncekiMadde === 'function') oncekiMadde(); break;
    case '+': case '=': if (maddeAcik && typeof artirFont === 'function') artirFont(); break;
    case '-': if (maddeAcik && typeof azaltFont === 'function') azaltFont(); break;
  }
});

// ===== OZELLIK 5: DUYURU ALANI =====
// bitis: bu tarihten sonra duyuru kendiliğinden gösterilmez (eski duyurular herkese aylarca görünmesin)
var DUYURULAR = [
  {id:'metin-2026-10', baslik:'Kitabın metni yenilendi', metin:'Madde metinleri, başlıklar ve sahîfe numaraları Hakîkat Kitâbevi’nin 2026 baskısıyla karşılaştırılarak düzeltildi; paragraflar artık kitaptaki gibi gösteriliyor.', tarih:'2026-10-19', bitis:'2026-12-31', tur:'bilgi'},
];
function renderDuyurular() {
  var el = document.getElementById('duyuru-alani');
  if (!el) return;
  var kapatilanlar = [];
  try { kapatilanlar = JSON.parse(localStorage.getItem('ilmihal-duyuru-kapatilan') || '[]'); } catch(e) {}
  var bugun = new Date().toISOString().slice(0, 10);
  var aktif = DUYURULAR.filter(function(d) { return kapatilanlar.indexOf(d.id) === -1 && (!d.bitis || bugun <= d.bitis); });
  if (aktif.length === 0) { el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = aktif.map(function(d) {
    var badge = d.tur === 'yeni' ? '<span class="duyuru-badge duyuru-yeni">Yeni</span>' : '<span class="duyuru-badge duyuru-bilgi">Bilgi</span>';
    return '<div class="duyuru-item">' + badge + '<div class="duyuru-icerik"><strong>' + d.baslik + '</strong><p>' + d.metin + '</p></div><button type="button" class="duyuru-kapat" onclick="kapatDuyuru(\'' + d.id + '\')" aria-label="Kapat">&times;</button></div>';
  }).join('');
}
function kapatDuyuru(id) {
  var k = [];
  try { k = JSON.parse(localStorage.getItem('ilmihal-duyuru-kapatilan') || '[]'); } catch(e) {}
  k.push(id);
  localStorage.setItem('ilmihal-duyuru-kapatilan', JSON.stringify(k));
  renderDuyurular();
}
document.addEventListener('DOMContentLoaded', renderDuyurular);

// ===== OZELLIK 6: OKUMA ISTATISTIKLERI PANELI =====
function renderOkumaIstatistik() {
  var el = document.getElementById('okuma-istatistik');
  if (!el) return;
  var read = getReadMaddes();
  var toplam = window.tocData ? window.tocData.length : 241;
  var yuzde = Math.round((read.length / toplam) * 100);
  var goal = null;
  try { goal = JSON.parse(localStorage.getItem('ilmihal-daily-goal')); } catch(e) {}
  var gunlukDk = (goal && goal.today === new Date().toISOString().slice(0,10)) ? goal.minutes : 0;
  var bmCount = 0;
  try { bmCount = JSON.parse(localStorage.getItem('ilmihal-bookmarks') || '[]').length; } catch(e) {}
  var notCount = 0;
  try {
    var notlar = JSON.parse(localStorage.getItem('ilmihal-notlar') || '{}');
    for (var k in notlar) notCount += notlar[k].length;
  } catch(e) {}
  var k1 = 0, k2 = 0, k3 = 0;
  read.forEach(function(r) { var p = r.split('/'); if (p[0]==='1') k1++; else if (p[0]==='2') k2++; else if (p[0]==='3') k3++; });

  el.innerHTML = '<div class="ist-grid">' +
    '<div class="ist-card ist-buyuk"><div class="ist-daire"><svg viewBox="0 0 36 36" class="ist-svg"><path class="ist-bg-arc" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8e4dd" stroke-width="3"/><path class="ist-arc" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" stroke-width="3" stroke-dasharray="' + yuzde + ', 100" stroke-linecap="round"/></svg><span class="ist-yuzde">%' + yuzde + '</span></div><div class="ist-etiket">Tamamlanan<br><strong>' + read.length + ' / ' + toplam + ' madde</strong></div></div>' +
    '<div class="ist-card"><div class="ist-sayi">' + gunlukDk + '</div><div class="ist-etiket">dk bugün</div></div>' +
    '<div class="ist-card"><div class="ist-sayi">' + bmCount + '</div><div class="ist-etiket">yer imi</div></div>' +
    '<div class="ist-card"><div class="ist-sayi">' + notCount + '</div><div class="ist-etiket">not</div></div>' +
    '</div>' +
    '<div class="ist-kisimlar"><h4>Kısım İlerlemesi</h4><div class="ist-bar-group">' +
    '<div class="ist-bar-row"><span>I. Kısım</span><div class="ist-bar"><div class="ist-bar-fill" style="width:' + Math.round(k1/98*100) + '%"></div></div><span>' + k1 + '/98</span></div>' +
    '<div class="ist-bar-row"><span>II. Kısım</span><div class="ist-bar"><div class="ist-bar-fill" style="width:' + Math.round(k2/73*100) + '%"></div></div><span>' + k2 + '/73</span></div>' +
    '<div class="ist-bar-row"><span>III. Kısım</span><div class="ist-bar"><div class="ist-bar-fill" style="width:' + Math.round(k3/70*100) + '%"></div></div><span>' + k3 + '/70</span></div>' +
    '</div></div>';
}

// ===== OZELLIK 7: INLINE SOZLUK POPUP =====
var _sozlukPopupEl = null;
function initInlineSozluk(container) {
  if (!window.sozlukData || !container) return;
  if (!_sozlukPopupEl) {
    _sozlukPopupEl = document.createElement('div');
    _sozlukPopupEl.id = 'sozluk-popup';
    _sozlukPopupEl.className = 'sozluk-popup';
    _sozlukPopupEl.setAttribute('role', 'dialog');
    _sozlukPopupEl.setAttribute('aria-label', 'Kelimenin anlamı');
    document.body.appendChild(_sozlukPopupEl);
    document.addEventListener('click', function(e) {
      if (!zorKelimeHedefi(e) && _sozlukPopupEl && !_sozlukPopupEl.contains(e.target)) _sozlukPopupEl.style.display = 'none';
    });
  }
  if (container.dataset.sozlukKutusu === '1') return;
  container.dataset.sozlukKutusu = '1';
  container.addEventListener('click', function(e) {
    var el = zorKelimeHedefi(e);
    if (!el) return;
    e.stopPropagation();
    hideTooltip();
    var id = parseInt(el.dataset.id, 10);
    var kelime = el.dataset.kelime || el.textContent.trim();
    var entry = window.sozlukData.find(function(s) { return s.i === id; }) ||
      window.sozlukData.find(function(s) { return s.k && trLower(s.k) === trLower(kelime); });
    if (!entry) return;
    var anlam = entry.a || '';
    if (anlam.length > 300) anlam = anlam.substring(0, 300) + '…';
    _sozlukPopupEl.innerHTML = '<div class="sp-header"><strong>' + escapeHtml(entry.k) + '</strong>' +
      (entry.o ? '<span class="sp-osmanlica" lang="ar" dir="rtl">' + escapeHtml(entry.o) + '</span>' : '') +
      '<button type="button" class="sp-kapat" aria-label="Kapat" onclick="document.getElementById(\'sozluk-popup\').style.display=\'none\'">&times;</button></div>' +
      '<p class="sp-anlam">' + escapeHtml(anlam) + '</p>' +
      '<a class="sp-detay" href="#" onclick="event.preventDefault();goToSozlukSearch(\'' + escapeHtml(entry.k).replace(/'/g, "\\'") + '\');document.getElementById(\'sozluk-popup\').style.display=\'none\';return false">Lügatte aç</a>';
    var rect = el.getBoundingClientRect();
    _sozlukPopupEl.style.position = 'fixed';
    _sozlukPopupEl.style.display = 'block';
    var h = _sozlukPopupEl.offsetHeight;
    var top = rect.bottom + 8;
    if (top + h > window.innerHeight - 8 && rect.top - h - 8 > 8) top = rect.top - h - 8;
    _sozlukPopupEl.style.top = top + 'px';
    _sozlukPopupEl.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - _sozlukPopupEl.offsetWidth - 8)) + 'px';
  });
}

// ===== OZELLIK 8: SUNUM MODU =====
function sunumModuAc() {
  if (!currentMaddeForBookmark) return;
  var body = document.querySelector('#madde-detay .madde-text');
  if (!body) return;
  var sunum = document.createElement('div');
  sunum.id = 'sunum-modu';
  sunum.className = 'sunum-overlay';
  sunum.innerHTML = '<div class="sunum-header"><h2>' + currentMaddeForBookmark.baslik + '</h2><div class="sunum-kontroller"><button type="button" onclick="sunumFontDegistir(1)" title="Büyüt">A+</button><button type="button" onclick="sunumFontDegistir(-1)" title="Küçült">A-</button><button type="button" onclick="kapatSunumModu()" title="Kapat">&times;</button></div></div><div class="sunum-icerik" id="sunum-icerik">' + body.innerHTML + '</div>';
  document.body.appendChild(sunum);
  var sunumIcerik = document.getElementById('sunum-icerik');
  if (sunumIcerik) {
    resetSozlukBindingState(sunumIcerik);
    bindSozlukTooltipListeners(sunumIcerik);
    if (typeof initInlineSozluk === 'function') initInlineSozluk(sunumIcerik);
  }
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', _sunumEsc);
}
function kapatSunumModu() {
  var s = document.getElementById('sunum-modu');
  if (s) s.remove();
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _sunumEsc);
}
function _sunumEsc(e) { if (e.key === 'Escape') kapatSunumModu(); }
var _sunumFont = 1.8;
function sunumFontDegistir(dir) {
  _sunumFont = Math.max(1.2, Math.min(3.5, _sunumFont + dir * 0.2));
  var el = document.getElementById('sunum-icerik');
  if (el) el.style.fontSize = _sunumFont + 'rem';
}

// ===== OZELLIK 9: CAPRAZ REFERANS NAVIGASYONU =====
// Kitaptaki "[Madde 54’e bakınız!]" gibi atıfları aynı kısmın maddesine bağlar. Yalnız metin
// düğümleri işlenir (innerHTML yeniden yazılmaz); "Mecelle, Madde 855" gibi başka eserlerin
// madde numaraları bağlanmaz.
function aktivCrossLinks(container) {
  if (!container || !currentMaddeForBookmark) return;
  var kisim = currentMaddeForBookmark.kisim;
  var desen = /Madde (\d{1,3})(?=[’']?[ea] bak)/g;
  var tw = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  var dugumler = [], n;
  while ((n = tw.nextNode())) { if (/Madde \d/.test(n.nodeValue) && !n.parentElement.closest('a')) dugumler.push(n); }
  dugumler.forEach(function(dugum) {
    var metin = dugum.nodeValue, parca = document.createDocumentFragment(), son = 0, m;
    desen.lastIndex = 0;
    while ((m = desen.exec(metin))) {
      var no = parseInt(m[1], 10);
      if (!getMaddeMeta(kisim, no)) continue;
      parca.appendChild(document.createTextNode(metin.slice(son, m.index)));
      var a = document.createElement('a');
      a.href = '/madde/' + kisim + '/' + no;
      a.className = 'crossref-link';
      a.textContent = m[0];
      a.addEventListener('click', function(no2) { return function(e) { e.preventDefault(); openMadde(kisim, no2); }; }(no));
      parca.appendChild(a);
      son = m.index + m[0].length;
    }
    if (son === 0) return;
    parca.appendChild(document.createTextNode(metin.slice(son)));
    dugum.parentNode.replaceChild(parca, dugum);
  });
}

// ===== OZELLIK 10: METIN PAYLASIM KARTI (text selection) =====
function initMetinSecimPaylas() {
  document.addEventListener('mouseup', function() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim().length < 10) {
      gizleMetinPaylas(); return;
    }
    var container = document.querySelector('#madde-detay .madde-text');
    if (!container || !container.contains(sel.anchorNode)) { gizleMetinPaylas(); return; }
    var text = sel.toString().trim();
    if (text.length > 500) text = text.substring(0, 500) + '...';
    var range = sel.getRangeAt(0);
    var rect = range.getBoundingClientRect();
    gosterMetinPaylas(text, rect);
  });
}
function gosterMetinPaylas(text, rect) {
  var el = document.getElementById('metin-paylas-bar');
  if (!el) {
    el = document.createElement('div');
    el.id = 'metin-paylas-bar';
    el.className = 'metin-paylas-bar';
    document.body.appendChild(el);
  }
  el.innerHTML = '<button type="button" onclick="metinPaylasKopyala()" title="Kopyala"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Kopyala</button><button type="button" onclick="metinPaylasVurgula()" title="Vurgula"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/></svg>Vurgula</button><button type="button" onclick="metinPaylasKart()" title="Görsel kart oluştur"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>Kart</button>';
  el.dataset.metin = text;
  el.style.display = 'flex';
  el.style.position = 'fixed';
  var ustKonum = rect.top - 48;
  if (ustKonum < 8) ustKonum = rect.bottom + 10;
  el.style.top = ustKonum + 'px';
  el.style.left = Math.max(8, Math.min(window.innerWidth - 248, rect.left + rect.width / 2 - 120)) + 'px';
}
function gizleMetinPaylas() {
  var el = document.getElementById('metin-paylas-bar');
  if (el) el.style.display = 'none';
}
function metinPaylasKopyala() {
  var el = document.getElementById('metin-paylas-bar');
  if (!el) return;
  if (navigator.clipboard) navigator.clipboard.writeText(el.dataset.metin);
  gizleMetinPaylas();
}
function metinPaylasKart() {
  var el = document.getElementById('metin-paylas-bar');
  if (!el || !currentMaddeForBookmark) return;
  var text = el.dataset.metin;
  gizleMetinPaylas();
  var madde = currentMaddeForBookmark;
  var fontlar = (document.fonts && document.fonts.load)
    ? Promise.all([
        document.fonts.load('400 52px Literata', text.slice(0, 20)),
        document.fonts.load('600 30px Inter', 'SEÂDET'),
        document.fonts.load('500 26px Inter', 'ilmihal')
      ]).catch(function() {})
    : Promise.resolve();
  fontlar.then(function() {
    var W = 1080, H = 1350;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');

    // Fildişi zemin + çift altın çerçeve
    ctx.fillStyle = '#faf7f0'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.strokeStyle = 'rgba(201,168,76,0.45)'; ctx.lineWidth = 1;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    // Üst başlık: eser adı
    ctx.fillStyle = '#c9a84c';
    ctx.font = '600 30px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("SE'ÂDET-İ EBEDİYYE", W / 2, 140);
    ctx.fillRect(W / 2 - 40, 168, 80, 2);

    // Alıntı metni (Literata, akıllı sarma + dikey ortalama)
    var maxGenislik = W - 220;
    var boyutlar = [52, 46, 40, 36];
    var satirlar = null, fontBoyu = 36, satirAralik = 0;
    for (var b = 0; b < boyutlar.length; b++) {
      fontBoyu = boyutlar[b];
      satirAralik = Math.round(fontBoyu * 1.62);
      ctx.font = '400 ' + fontBoyu + 'px Literata, Georgia, serif';
      var kelimeler = text.split(/\s+/), deneme = [], satir = '';
      for (var i = 0; i < kelimeler.length; i++) {
        var test = satir ? satir + ' ' + kelimeler[i] : kelimeler[i];
        if (ctx.measureText(test).width > maxGenislik && satir) { deneme.push(satir); satir = kelimeler[i]; }
        else satir = test;
      }
      if (satir) deneme.push(satir);
      if (deneme.length * satirAralik <= 820 || b === boyutlar.length - 1) {
        var maxSatir = Math.floor(820 / satirAralik);
        if (deneme.length > maxSatir) {
          deneme = deneme.slice(0, maxSatir);
          deneme[maxSatir - 1] = deneme[maxSatir - 1].replace(/[,;:.\s]+$/, '') + '…';
        }
        satirlar = deneme;
        break;
      }
    }
    var blokYukseklik = satirlar.length * satirAralik;
    var yBas = 230 + Math.max(0, (820 - blokYukseklik) / 2) + fontBoyu;
    ctx.fillStyle = '#2c2418';
    ctx.font = '400 ' + fontBoyu + 'px Literata, Georgia, serif';
    satirlar.forEach(function(s, i) { ctx.fillText(s, W / 2, yBas + i * satirAralik); });

    // Alt bilgi: kaynak
    var kl = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
    ctx.fillStyle = '#c9a84c';
    ctx.fillRect(W / 2 - 40, H - 234, 80, 2);
    ctx.fillStyle = '#6b5f48';
    ctx.font = '500 27px Inter, sans-serif';
    var baslikKisa = madde.baslik.length > 52 ? madde.baslik.slice(0, 52).trim() + '…' : madde.baslik;
    ctx.fillText(baslikKisa, W / 2, H - 186);
    ctx.font = '400 24px Inter, sans-serif';
    ctx.fillStyle = '#8a7d63';
    ctx.fillText((kl[madde.kisim] || '') + ', Madde ' + madde.madde_no + (madde.sayfa_no ? ' · Sayfa ' + madde.sayfa_no : ''), W / 2, H - 146);
    ctx.font = '600 26px Inter, sans-serif';
    ctx.fillStyle = '#1a6b4e';
    ctx.fillText('ilmihal.org', W / 2, H - 92);
    ctx.textAlign = 'left';

    canvas.toBlob(function(blob) {
      if (!blob) return;
      var dosyaAdi = 'ilmihal-alinti-' + madde.kisim + '-' + madde.madde_no + '.png';
      var dosya = null;
      try { dosya = new File([blob], dosyaAdi, { type: 'image/png' }); } catch(e) {}
      if (dosya && navigator.canShare && navigator.canShare({ files: [dosya] })) {
        navigator.share({ files: [dosya], title: "Se'âdet-i Ebediyye" }).catch(function() {
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a'); a.href = url; a.download = dosyaAdi;
          a.click(); setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
        });
      } else {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = dosyaAdi;
        a.click(); setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
      }
    });
  });
}

// ===== OZELLIK 11: METIN ICI VURGULAMA =====
function metinPaylasVurgula() {
  var sel = window.getSelection();
  if (!sel || sel.isCollapsed) return;
  gizleMetinPaylas();
  renSecVurgula(sel);
}
function renSecVurgula(sel) {
  var renkler = [{ad:'Sarı',kod:'#fff3b0'},{ad:'Yeşil',kod:'#b8f0c8'},{ad:'Turuncu',kod:'#ffd8a8'},{ad:'Pembe',kod:'#ffc8d8'}];
  var popup = document.createElement('div');
  popup.className = 'vurgula-renk-popup';
  var range = sel.getRangeAt(0);
  var rect = range.getBoundingClientRect();
  popup.style.top = (rect.top + window.scrollY - 50) + 'px';
  popup.style.left = Math.max(8, rect.left + rect.width / 2 - 80) + 'px';
  renkler.forEach(function(r) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'vurgula-renk-btn';
    btn.style.background = r.kod; btn.title = r.ad;
    btn.onclick = function() { uygulaVurgulama(sel, r.kod); popup.remove(); };
    popup.appendChild(btn);
  });
  var kapat = document.createElement('button');
  kapat.type = 'button'; kapat.textContent = '\u00d7'; kapat.className = 'vurgula-renk-kapat';
  kapat.onclick = function() { popup.remove(); };
  popup.appendChild(kapat);
  document.body.appendChild(popup);
  setTimeout(function() {
    var handler = function(e) { if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', handler); } };
    document.addEventListener('click', handler);
  }, 100);
}
function uygulaVurgulama(sel, renk) {
  if (!sel || sel.isCollapsed) return;
  var range = sel.getRangeAt(0);
  var mark = document.createElement('mark');
  mark.className = 'ilmihal-highlight'; mark.style.backgroundColor = renk; mark.dataset.renk = renk;
  try { range.surroundContents(mark); } catch(e) {
    try {
      var frag = range.extractContents();
      mark.appendChild(frag);
      range.insertNode(mark);
    } catch(e2) {
      var text = sel.toString(); range.deleteContents();
      mark.textContent = text; range.insertNode(mark);
    }
  }
  sel.removeAllRanges();
  kaydetVurgulamalar();
}
function kaydetVurgulamalar() {
  if (!currentMaddeForBookmark) return;
  var key = currentMaddeForBookmark.kisim + '/' + currentMaddeForBookmark.madde_no;
  var container = document.querySelector('#madde-detay .madde-text');
  if (!container) return;
  var highlights = [];
  container.querySelectorAll('.ilmihal-highlight').forEach(function(m) {
    highlights.push({text: m.textContent, renk: m.dataset.renk});
  });
  var all = {};
  try { all = JSON.parse(localStorage.getItem('ilmihal-vurgulamalar') || '{}'); } catch(e) {}
  all[key] = highlights;
  localStorage.setItem('ilmihal-vurgulamalar', JSON.stringify(all));
}
function yukleVurgulamalar(container) {
  if (!currentMaddeForBookmark || !container) return;
  try {
    var key = currentMaddeForBookmark.kisim + '/' + currentMaddeForBookmark.madde_no;
    var all = {};
    try { all = JSON.parse(localStorage.getItem('ilmihal-vurgulamalar') || '{}'); } catch(e) {}
    var highlights = all[key];
    if (!highlights || highlights.length === 0) return;
    // Aynı metin zaten işaretliyse tekrarlama
    var mevcut = {};
    container.querySelectorAll('mark.ilmihal-highlight').forEach(function(m) { mevcut[m.textContent] = true; });
    highlights.forEach(function(h) {
      if (!h.text || h.text.length < 3 || mevcut[h.text]) return;
      vurguMetniIsaretle(container, h.text, h.renk);
    });
  } catch(e) {}
}

// Metin düğümleri üzerinde birleşik arama ile vurgu uygular (sözlük span'lerine dayanıklı)
function vurguMetniIsaretle(container, text, renk) {
  var tw = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: function(n) {
      return (n.parentElement && n.parentElement.closest('mark.ilmihal-highlight'))
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes = [], buf = '', node;
  while ((node = tw.nextNode())) {
    nodes.push({ node: node, start: buf.length });
    buf += node.textContent;
  }
  var idx = buf.indexOf(text);
  if (idx === -1) return;
  var end = idx + text.length;
  var startNode = null, startOff = 0, endNode = null, endOff = 0;
  for (var i = 0; i < nodes.length; i++) {
    var ns = nodes[i].start, ne = ns + nodes[i].node.textContent.length;
    if (!startNode && idx >= ns && idx < ne) { startNode = nodes[i].node; startOff = idx - ns; }
    if (end > ns && end <= ne) { endNode = nodes[i].node; endOff = end - ns; break; }
  }
  if (!startNode || !endNode) return;
  var range = document.createRange();
  range.setStart(startNode, startOff);
  range.setEnd(endNode, endOff);
  var mark = document.createElement('mark');
  mark.className = 'ilmihal-highlight';
  mark.dataset.renk = renk;
  mark.style.backgroundColor = renk;
  try { range.surroundContents(mark); }
  catch(e) {
    try {
      var frag = range.extractContents();
      mark.appendChild(frag);
      range.insertNode(mark);
    } catch(e2) {}
  }
}
initMetinSecimPaylas();

// ===== OZELLIK 12: COKLU SEKME / SPLIT VIEW =====
var _splitViewAcik = false;
function splitViewAc() {
  if (_splitViewAcik || !currentMaddeForBookmark) return;
  _splitViewAcik = true;
  var detay = document.getElementById('madde-detay');
  if (!detay) return;
  var overlay = detay.querySelector('.madde-overlay-content') || detay;
  var splitPanel = document.createElement('div');
  splitPanel.id = 'split-view-panel';
  splitPanel.className = 'split-panel';
  splitPanel.innerHTML = '<div class="split-header"><h4>Yan Yana Okuma</h4><button type="button" onclick="kapatSplitView()" class="split-kapat">&times;</button></div><div class="split-arama"><input type="text" id="split-search" placeholder="Madde ara..." oninput="splitViewAra(this.value)"></div><div id="split-liste" class="split-liste"></div><div id="split-icerik" class="split-icerik"></div>';
  overlay.appendChild(splitPanel);
  splitViewAra('');
}
function kapatSplitView() {
  _splitViewAcik = false;
  var p = document.getElementById('split-view-panel');
  if (p) p.remove();
}
function splitViewAra(q) {
  var liste = document.getElementById('split-liste');
  if (!liste || !window.tocData) return;
  q = q ? q.trim().toLowerCase() : '';
  var items = window.tocData.filter(function(m) {
    return !q || m.baslik.toLowerCase().indexOf(q) !== -1 || String(m.madde_no).indexOf(q) !== -1;
  }).slice(0, 20);
  liste.innerHTML = items.map(function(m) {
    return '<button type="button" class="split-madde-btn" onclick="splitViewMaddeAc(' + m.kisim + ',' + m.madde_no + ')">' + m.madde_no + '. ' + m.baslik + '</button>';
  }).join('');
}
async function splitViewMaddeAc(kisim, maddeNo) {
  var icerik = document.getElementById('split-icerik');
  var liste = document.getElementById('split-liste');
  if (!icerik) return;
  if (liste) liste.style.display = 'none';
  icerik.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">Yükleniyor...</div>';
  var texts = await loadKisimTexts(kisim);
  var metin = texts?.[String(maddeNo)] || '(Metin bulunamadı)';
  var madde = window.tocData?.find(function(m) { return m.kisim === kisim && m.madde_no === maddeNo; });
  var baslik = madde ? madde.baslik : 'Madde ' + maddeNo;
  icerik.innerHTML = '<div class="split-madde-header"><h4>' + baslik + '</h4><button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById(\'split-liste\').style.display=\'\';document.getElementById(\'split-icerik\').innerHTML=\'\'">Değiştir</button></div><div class="split-madde-text">' + maddeMetniHTML(metin, false) + '</div>';
}

// ===== Madde açılınca yeni özellikleri entegre et =====
// Not: Sözlük katmanı scheduleMaddeSozlukEnhancement ile uygulanır; burada yalnız
// çapraz bağlantılar + kayıtlı vurgular bağlanır. Geri besleme döngüsüne karşı
// madde başına tek atımlık (data-zengin) + zamanlayıcı korumalıdır (Nisan 2026 donma kökeni).
(function() {
  var _zenginlestirmeBekliyor = false;
  function maddeZenginlestir() {
    var body = document.querySelector('#madde-detay .madde-text');
    if (!body || body.textContent.length < 50) return;
    if (body.dataset.zengin === '1') return;
    body.dataset.zengin = '1';
    try { aktivCrossLinks(body); } catch(e) {}
    try { yukleVurgulamalar(body); } catch(e) {}
  }
  var _maddeObserver = new MutationObserver(function() {
    if (MADDE_SAFE_MODE) return;
    if (_zenginlestirmeBekliyor) return;
    var body = document.querySelector('#madde-detay .madde-text');
    if (!body || body.dataset.zengin === '1') return;
    _zenginlestirmeBekliyor = true;
    setTimeout(function() {
      _zenginlestirmeBekliyor = false;
      maddeZenginlestir();
    }, 60);
  });
  document.addEventListener('DOMContentLoaded', function() {
    var maddeBody = document.getElementById('madde-body');
    if (maddeBody) {
      _maddeObserver.observe(maddeBody, {childList: true, subtree: true});
    }
  });
})();



// ============================================================
// PREMIUM OKUYUCU (Haziran 2026)
// Aa okuma paneli, taşma menüsü, okuma haritası, iskelet yükleme
// ============================================================
var SVG_OYNAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="7 4.5 19.5 12 7 19.5 7 4.5"/></svg>';
var SVG_DURAKLAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="8.5" y1="5" x2="8.5" y2="19"/><line x1="15.5" y1="5" x2="15.5" y2="19"/></svg>';
var OKUNDU_TIK_HTML = '<span class="okundu-tik" title="Okundu"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4.5 12.5 9.5 17.5 19.5 7"/></svg></span>';

function iskeletHTML() {
  var s = '<div class="iskelet-sargi" aria-label="Yükleniyor" role="status"><div class="iskelet-satir iskelet-baslik"></div>';
  for (var i = 0; i < 7; i++) s += '<div class="iskelet-satir' + (i === 6 ? ' kisa' : '') + '"></div>';
  return s + '</div>';
}

// ---- Aa okuma ayarları paneli ----
function getOkumaAyarlari() {
  try { return JSON.parse(localStorage.getItem('ilmihal-okuma-ayarlari') || '{}'); }
  catch(e) { return {}; }
}
function saveOkumaAyar(k, v) {
  var a = getOkumaAyarlari(); a[k] = v;
  try { localStorage.setItem('ilmihal-okuma-ayarlari', JSON.stringify(a)); } catch(e) {}
}
function okumaPaneliToggle() {
  var p = document.getElementById('okuma-panel');
  if (!p) return;
  if (p.classList.contains('acik')) { okumaPaneliKapat(); return; }
  tasmaMenuKapat();
  p.classList.add('acik');
  var btn = document.getElementById('okuma-panel-btn');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  if (window.innerWidth <= 640) {
    var perde = document.getElementById('panel-perde');
    if (perde) perde.classList.add('acik');
  }
  boyutGostergeGuncelle();
}
function okumaPaneliKapat() {
  var p = document.getElementById('okuma-panel');
  if (p) p.classList.remove('acik');
  var btn = document.getElementById('okuma-panel-btn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  var perde = document.getElementById('panel-perde');
  if (perde) perde.classList.remove('acik');
}
function tasmaMenuToggle() {
  var m = document.getElementById('tasma-menu');
  if (!m) return;
  if (m.classList.contains('acik')) { tasmaMenuKapat(); return; }
  okumaPaneliKapat();
  m.classList.add('acik');
  var btn = document.getElementById('tasma-menu-btn');
  if (btn) btn.setAttribute('aria-expanded', 'true');
}
function tasmaMenuKapat() {
  var m = document.getElementById('tasma-menu');
  if (m) m.classList.remove('acik');
  var btn = document.getElementById('tasma-menu-btn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}
document.addEventListener('click', function(e) {
  var p = document.getElementById('okuma-panel');
  if (p && p.classList.contains('acik') && !p.contains(e.target) && !e.target.closest('#okuma-panel-btn')) okumaPaneliKapat();
  var m = document.getElementById('tasma-menu');
  if (m && m.classList.contains('acik') && !m.contains(e.target) && !e.target.closest('#tasma-menu-btn')) tasmaMenuKapat();
});

function setOkumaAralik(v, kaydetme) {
  document.documentElement.style.setProperty('--okuma-aralik', v);
  document.querySelectorAll('#aralik-grup .segment-btn').forEach(function(b) {
    b.classList.toggle('secili', b.dataset.aralik === String(v));
  });
  if (!kaydetme) saveOkumaAyar('aralik', String(v));
}
function setOkumaHiza(v, kaydetme) {
  document.documentElement.style.setProperty('--okuma-hiza', v);
  document.querySelectorAll('#hiza-grup .segment-btn').forEach(function(b) {
    b.classList.toggle('secili', b.dataset.hiza === v);
  });
  if (!kaydetme) saveOkumaAyar('hiza', v);
}
function setOkumaTema(mode) {
  try { localStorage.setItem('ilmihal-theme', mode); } catch(e) {}
  applyTheme(mode);
}
function temaSecimiGuncelle(mode) {
  document.querySelectorAll('#tema-grup .tema-btn').forEach(function(b) {
    b.classList.toggle('secili', b.dataset.tema === mode);
  });
}
function toggleLugatCizgi(force) {
  var root = document.documentElement;
  var acik; // çizgiler görünür mü
  if (typeof force === 'boolean') {
    root.classList.toggle('lugat-cizgisiz', !force);
    acik = force;
  } else {
    acik = !root.classList.toggle('lugat-cizgisiz');
  }
  var sw = document.getElementById('lugat-anahtar');
  if (sw) {
    sw.classList.toggle('acik', acik);
    sw.setAttribute('aria-checked', acik ? 'true' : 'false');
  }
  saveOkumaAyar('lugat', acik);
}
function boyutGostergeGuncelle() {
  var el = document.getElementById('boyut-deger');
  if (el) el.textContent = '%' + Math.round(((typeof currentFontSize === 'number' ? currentFontSize : 1)) * 100);
}
function okumaAyarlariUygula() {
  var a = getOkumaAyarlari();
  if (a.aralik) setOkumaAralik(a.aralik, true);
  if (a.hiza) setOkumaHiza(a.hiza, true);
  if (a.lugat === false) toggleLugatCizgi(false);
  temaSecimiGuncelle(localStorage.getItem('ilmihal-theme') || 'light');
  boyutGostergeGuncelle();
}

// ---- Okuma haritası: kısım ilerleme çubukları ----
function kisimIlerlemeGuncelle() {
  var alanlar = document.querySelectorAll('.kisim-ilerleme');
  if (!alanlar.length) return;
  var read = getReadMaddes();
  var sayilar = { '1': 0, '2': 0, '3': 0 };
  read.forEach(function(k) {
    var p = String(k).split('/')[0];
    if (sayilar[p] !== undefined) sayilar[p]++;
  });
  alanlar.forEach(function(el) {
    var n = el.dataset.kisim;
    var card = el.closest('.kisim-card');
    var toplamEl = card && card.querySelector('.madde-count');
    var toplam = toplamEl ? parseInt(toplamEl.textContent, 10) : 0;
    var okunan = Math.min(sayilar[n] || 0, toplam);
    if (!toplam || !okunan) { el.innerHTML = ''; return; }
    var yuzde = Math.round(okunan / toplam * 100);
    el.innerHTML = '<div class="kisim-ilerleme-bar"><div class="kisim-ilerleme-dolu" style="width:' + yuzde + '%"></div></div>' +
      '<div class="kisim-ilerleme-etiket">' + okunan + ' / ' + toplam + ' madde okundu</div>';
  });
}

okumaAyarlariUygula();
kisimIlerlemeGuncelle();

// ---- Vurgu kaldırma (madde içinde vurguya tıklayınca) ----
function vurguKaldirPopupGoster(mark) {
  vurguKaldirPopupGizle();
  var rect = mark.getBoundingClientRect();
  var popup = document.createElement('div');
  popup.id = 'vurgu-kaldir-popup';
  popup.className = 'metin-paylas-bar';
  popup.style.display = 'flex';
  popup.style.position = 'fixed';
  popup.style.top = Math.max(8, rect.top - 48) + 'px';
  popup.style.left = Math.max(8, Math.min(window.innerWidth - 180, rect.left + rect.width / 2 - 80)) + 'px';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Vurguyu kaldır';
  btn.onclick = function(e) {
    e.stopPropagation();
    var parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
    if (typeof kaydetVurgulamalar === 'function') kaydetVurgulamalar();
    vurguKaldirPopupGizle();
  };
  popup.appendChild(btn);
  document.body.appendChild(popup);
}
function vurguKaldirPopupGizle() {
  var p = document.getElementById('vurgu-kaldir-popup');
  if (p) p.remove();
}
document.addEventListener('click', function(e) {
  var mark = e.target && e.target.closest ? e.target.closest('mark.ilmihal-highlight') : null;
  if (mark && mark.closest('#madde-detay')) {
    var sel = window.getSelection();
    if (sel && !sel.isCollapsed) return; // seçim varken karışma
    e.stopPropagation();
    vurguKaldirPopupGoster(mark);
    return;
  }
  if (!e.target.closest || !e.target.closest('#vurgu-kaldir-popup')) vurguKaldirPopupGizle();
});
