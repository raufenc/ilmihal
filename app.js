// ===== Se'âdet-i Ebediyye - İnteraktif İlmihâl =====
const PDF_URL = 'https://www.hakikatkitabevi.net/downloads/001.pdf';

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

function handleRoute() {
  if (routingSilent) return;
  const fullPath = getRoutePath();
  const parts = fullPath.split('/');
  const route = parts[0];

  if (route === 'madde' && parts.length >= 3) {
    const kisim = parseInt(parts[1]);
    const maddeNo = parseInt(parts[2]);
    if (kisim && maddeNo) {
      navigateTo('icerik', true);
      openMadde(kisim, maddeNo, true);
      return;
    }
  }

  if (route === 'sahis' && parts[1]) {
    navigateTo('sahislar', true);
    setTimeout(() => openSahis(decodeURIComponent(parts[1]), true), 150);
    return;
  }

  if (route === 'arama' && parts[1]) {
    navigateTo('arama', true);
    const query = decodeURIComponent(parts.slice(1).join('/'));
    document.getElementById('full-search').value = query;
    setTimeout(() => doFullSearch(true), 150);
    return;
  }

  if (route === 'fikih-karsilastirma') {
    navigateTo('fikih-karsilastirma', true);
    return;
  }

  const validPages = ['anasayfa','icerik','fevaid','sozluk','arama','sahislar','hakkinda','quiz','ayet-hadis','okuma-plani','gunun-bilgisi','rehberler'];
  if (validPages.includes(route)) {
    navigateTo(route, true);
  } else {
    navigateTo('anasayfa', true);
  }
}

window.addEventListener('popstate', handleRoute);
window.addEventListener('hashchange', handleRoute);

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
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    if (document.querySelector('script[src^="' + src.split('?')[0] + '"]')) { resolve(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

function ensureMaddelerData() {
  if (window.maddelerData) return Promise.resolve();
  return loadScript('maddeler-data.js?v=1');
}

function ensureSozlukData() {
  if (window.sozlukData) return Promise.resolve();
  return loadScript('sozluk-data.js?v=1');
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

function sayfaLinkPdf(sayfa, label) {
  if (!label) label = 'Sayfa ' + sayfa;
  return `<a href="#" onclick="showPdfPage(${sayfa});return false" class="sayfa-link" title="PDF sayfasını göster">${label}</a>`;
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

// ===== PDF VIEWER =====
function openSayfa(sayfa) {
  const madde = window.tocData?.find(m =>
    m.sayfa_no <= sayfa && (m.sayfa_bitis || m.sayfa_no) >= sayfa
  );
  if (madde) {
    openMadde(madde.kisim, madde.madde_no);
  }
}

function showPdfPage(sayfa) {
  let viewer = document.getElementById('pdf-viewer');
  if (viewer) viewer.remove();

  viewer = document.createElement('div');
  viewer.id = 'pdf-viewer';
  viewer.innerHTML = `
    <div class="pdf-viewer-header">
      <span>Sayfa ${sayfa}</span>
      <div class="pdf-nav">
        <button onclick="changePdfPage(-1)">\u25C0</button>
        <span id="pdf-page-num">${sayfa}</span>
        <button onclick="changePdfPage(1)">\u25B6</button>
      </div>
      <button onclick="document.getElementById('pdf-viewer').remove()" class="pdf-close">\u2715</button>
    </div>
    <iframe src="${PDF_URL}#page=${sayfa}" id="pdf-iframe"></iframe>
  `;
  document.getElementById('madde-body')?.appendChild(viewer);
}

function changePdfPage(delta) {
  const numEl = document.getElementById('pdf-page-num');
  const iframe = document.getElementById('pdf-iframe');
  if (!numEl || !iframe) return;
  const newPage = parseInt(numEl.textContent) + delta;
  if (newPage < 1 || newPage > 1248) return;
  numEl.textContent = newPage;
  iframe.src = `${PDF_URL}#page=${newPage}`;
}

// ===== NAVIGATION =====
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

function navigateTo(page, fromRoute) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  const navBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');
  // Close mobile menu
  document.querySelector('.main-nav')?.classList.remove('open');
  window.scrollTo(0, 0);

  // Update hash
  if (!fromRoute) updateHash(page);

  // Lazy load content
  if (page === 'icerik' && !icerikLoaded) loadIcerik();
  if (page === 'sozluk' && !sozlukLoaded) { ensureSozlukData().then(function() { loadSozluk(); }); }
  if (page === 'fevaid' && !fevaidLoaded) loadFevaid();
  if (page === 'sahislar' && !sahislarLoaded) loadSahislar();
}

// Mobile menu
document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
  document.querySelector('.main-nav').classList.toggle('open');
});

// ===== İÇİNDEKİLER =====
let icerikLoaded = false;

function loadIcerik(filterKisim, filterText) {
  icerikLoaded = true;
  const list = document.getElementById('icerik-list');
  if (!window.tocData) { list.innerHTML = '<div class="loading">Veriler yükleniyor...</div>'; return; }

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

  filtered.forEach(m => {
    if (m.kisim !== currentKisim && kisimFilter === 'all') {
      currentKisim = m.kisim;
      html += `<div style="padding:24px 0 8px;"><h3 style="font-family:'Amiri',serif;color:var(--primary-dark);font-size:1.3rem;">${kisimLabels[m.kisim]}</h3></div>`;
    }
    html += `
      <div class="madde-item" onclick="openMadde(${m.kisim}, ${m.madde_no})">
        <div class="madde-badge">${m.madde_no}</div>
        <div class="madde-info">
          <div class="madde-title">${m.baslik}</div>
          <div class="madde-meta">${kisimLabels[m.kisim]}${m.mektup_ref ? ' \u00B7 Mektup: ' + m.mektup_ref : ''}</div>
        </div>
        <div class="madde-sayfa">${sayfaLink(m.sayfa_no)}</div>
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
  filtered.forEach(m => {
    html += `
      <div class="madde-item" onclick="openMadde(${m.kisim}, ${m.madde_no})">
        <div class="madde-badge">${m.madde_no}</div>
        <div class="madde-info">
          <div class="madde-title">${m.baslik}</div>
          <div class="madde-meta">${kisimLabels[m.kisim]}${m.mektup_ref ? ' \u00B7 Mektup: ' + m.mektup_ref : ''}</div>
        </div>
        <div class="madde-sayfa">${sayfaLink(m.sayfa_no)}</div>
      </div>
    `;
  });
  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Sonu\u00e7 bulunamad\u0131.</p>';
}

// ===== MADDE DETAY =====
const kisimTextsCache = {};
window.kisimTextsCache = kisimTextsCache; // search-engine.js erişimi için

async function loadKisimTexts(kisim) {
  if (kisimTextsCache[kisim]) return kisimTextsCache[kisim];
  try {
    const resp = await fetch(`texts/kisim${kisim}.json`);
    const data = await resp.json();
    kisimTextsCache[kisim] = data;
    return data;
  } catch (e) {
    console.error(`K\u0131s\u0131m ${kisim} metinleri y\u00fcklenemedi:`, e);
    return null;
  }
}

async function openMadde(kisim, maddeNo, fromRoute, searchQuery) {
  await ensureMaddelerData();
  const madde = window.maddelerData?.find(m => m.kisim === kisim && m.madde_no === maddeNo);
  if (!madde) return;

  // SEO meta güncelle
  var kisimLabel = {1:'Birinci Kısım',2:'İkinci Kısım',3:'Üçüncü Kısım'}[kisim] || '';
  updateSeoMeta(
    madde.baslik + ' - Se\'âdet-i Ebediyye',
    kisimLabel + ', Madde ' + maddeNo + ' - ' + madde.baslik + '. Se\'âdet-i Ebediyye İnteraktif İlmihâl.',
    'https://ilmihal.org/madde/' + kisim + '/' + maddeNo
  );

  // Bookmark & read tracking & audio
  currentMaddeForBookmark = madde;
  if (typeof markAsRead === 'function') markAsRead(kisim, maddeNo);
  if (typeof initAudioForMadde === 'function') initAudioForMadde(madde);

  const kisimLabels = { 1: 'Birinci K\u0131s\u0131m', 2: '\u0130kinci K\u0131s\u0131m', 3: '\u00dc\u00e7\u00fcnc\u00fc K\u0131s\u0131m' };
  const body = document.getElementById('madde-body');

  // Update URL
  if (!fromRoute) updateHash(`madde/${kisim}/${maddeNo}`);

  // Show modal immediately with loading state
  document.getElementById('madde-detay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  if (typeof updateBookmarkBtn === 'function') updateBookmarkBtn(kisim, maddeNo);

  body.innerHTML = `
    <div class="madde-detail-header">
      <h3>${madde.baslik}</h3>
      <div class="madde-detail-meta">
        <span>${kisimLabels[madde.kisim]}, Madde ${madde.madde_no}</span>
        <span>${sayfaLinkPdf(madde.sayfa_no, sayfaLabel(madde))}</span>
        ${madde.mektup_ref ? `<span>Mektup: ${madde.mektup_ref}</span>` : ''}
      </div>
    </div>
    <div class="madde-text" style="text-align:center;padding:40px;color:var(--text-muted);">Metin y\u00fckleniyor...</div>
  `;

  // Load full text from kisim file
  const texts = await loadKisimTexts(kisim);
  let metin = texts?.[String(maddeNo)] || madde.metin || '(Metin bulunamad\u0131)';

  // Zor kelimeleri işaretle (sözlük lazy yüklenir)
  await ensureSozlukData();
  if (window.sozlukData) {
    metin = highlightWords(metin);
  }

  body.innerHTML = `
    <div class="madde-detail-header">
      <h3>${madde.baslik}</h3>
      <div class="madde-detail-meta">
        <span>${kisimLabels[madde.kisim]}, Madde ${madde.madde_no}</span>
        <span>${sayfaLinkPdf(madde.sayfa_no, sayfaLabel(madde))}</span>
        ${madde.mektup_ref ? `<span>Mektup: ${madde.mektup_ref}</span>` : ''}
      </div>
    </div>
    <div class="madde-text">${metin}</div>
    <div class="madde-paylasim-bar">
      <button type="button" class="btn btn-sm" onclick="maddePaylasText(${kisim},${maddeNo})">Paylas</button>
      <button type="button" class="btn btn-sm btn-secondary" style="background:var(--primary-light);color:#fff;" onclick="maddePaylasimKarti(${kisim},${maddeNo})">Gorsel Kart</button>
    </div>
    ${getRelatedSahislar(kisim, maddeNo)}
    ${getRelatedTables(kisim, maddeNo)}
  `;

  // Tooltip events
  body.querySelectorAll('.zor-kelime').forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });

  // FAQ Schema + OG meta + Streak
  if (typeof addFaqSchema === 'function') addFaqSchema(madde, metin);
  if (typeof updateOgMeta === 'function') updateOgMeta(madde);
  if (typeof updateStreak === 'function') updateStreak();

  // Arama highlight: searchQuery varsa metinde ilgili yeri bul, highlight'la ve scroll et
  if (searchQuery) {
    const maddeTextEl = body.querySelector('.madde-text');
    if (maddeTextEl) {
      highlightAndScroll(maddeTextEl, searchQuery);
    }
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
    // .zor-kelime içindeki text'leri atla
    if (node.parentElement?.classList?.contains('zor-kelime')) continue;
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
    return `<a href="#sahis/${s.slug}" onclick="event.preventDefault();openSahis('${s.slug}')" class="related-sahis-link">
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
    `<a href="#" onclick="navigateTo('tablolar');setTimeout(()=>{document.getElementById('tablo-${t.id}')?.scrollIntoView({behavior:'smooth'})},300);closeMadde();return false" class="related-tablo-link">
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
  document.getElementById('madde-detay').style.display = 'none';
  document.body.style.overflow = '';
  // Restore hash to parent page
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    updateHash(activePage.id.replace('page-', ''));
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('sahis-detay')?.style.display === 'flex') {
      closeSahis();
    } else {
      closeMadde();
    }
  }
});

document.getElementById('madde-detay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('madde-detay')) closeMadde();
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
  const multiWords = [];

  function addKey(key, entry) {
    const k = trLower(key).trim();
    if (k.length < 2) return;
    if (!wordMap.has(k)) wordMap.set(k, entry);
  }

  // Phase 1: Bağımsız tek-kelime girişleri (en yüksek öncelik)
  const altQueue = [];
  window.sozlukData.forEach(entry => {
    const kelime = entry.kelime;
    const parenMatch = kelime.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
    const main = parenMatch ? parenMatch[1].trim() : kelime.trim();
    const parens = parenMatch && parenMatch[2] ? parenMatch[2].trim() : null;

    if (main.includes(' ') || main.includes('-')) {
      // Terkip: sadece çok kelimeli eşleşme (Pass 1)
      multiWords.push({ phrase: trLower(main), entry });
    } else {
      // Bağımsız tek kelime: en yüksek öncelik
      addKey(main, entry);
    }

    // Parantez ve alternatifler Phase 2'ye kuyruğa al
    // Sadece bağımsız tek-kelime girişlerinin alternatifleri eklenir
    // Terkip girişlerinin alternatifleri wordMap'e eklenmez (çünkü "kurban"→"Kurban Bayramı" gibi hatalar oluşur)
    const isCompoundEntry = main.includes(' ') || main.includes('-');
    if (!isCompoundEntry) {
      if (parens) {
        parens.split(/[,;\/]/).forEach(p => {
          const pt = p.trim();
          if (pt.length >= 2 && !pt.includes('aleyhi') && !pt.includes(' ') && !pt.includes('-')) {
            altQueue.push({ key: pt, entry });
          }
        });
      }
      if (entry.alternatif) {
        entry.alternatif.forEach(alt => {
          if (!alt.includes(' ') && !alt.includes('-')) {
            altQueue.push({ key: alt, entry });
          }
        });
      }
    }
  });

  // Phase 2: Alternatifler — sadece boşlukları doldur (bağımsız girişleri ezme)
  altQueue.forEach(({ key, entry }) => addKey(key, entry));

  // Sort multi-word phrases longest first for greedy matching
  multiWords.sort((a, b) => b.phrase.length - a.phrase.length);

  window._sozlukIndex = { wordMap, multiWords };
  return window._sozlukIndex;
}

function makeSpan(matchedText, entry) {
  const safeAnlam = entry.anlam.replace(/["\u201C\u201D]/g, '&quot;').replace(/['\u2018\u2019]/g, '&#39;');
  const osmAttr = entry.osmanli ? ` data-osmanli="${entry.osmanli}"` : '';
  const baglamAttr = entry.baglamlar ? ` data-baglamlar="${escapeHtml(JSON.stringify(entry.baglamlar))}"` : '';
  const altAttr = entry.alternatif ? ` data-alternatif="${entry.alternatif.join(', ')}"` : '';
  const kelimeAttr = ` data-kelime="${entry.kelime}"`;
  return `<span class="zor-kelime" data-anlam="${safeAnlam}" data-kat="${entry.kategori}"${osmAttr}${baglamAttr}${altAttr}${kelimeAttr}>${matchedText}</span>`;
}

function highlightWords(text) {
  if (!window.sozlukData || window.sozlukData.length === 0) return escapeHtml(text);

  const { wordMap, multiWords } = buildSozlukIndex();
  let html = escapeHtml(text);

  // Pass 1: Multi-word phrases (longest first, greedy)
  multiWords.forEach(({ phrase, entry }) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match phrase with flexible separators (space, dash, &#39; etc.)
    const pattern = escaped.split(/[\s\-]+/).join('[\\s\\-]+');
    const re = new RegExp('(?<![\\w\u00C0-\u024F])(' + pattern + ')(?![\\w\u00C0-\u024F])', 'gi');
    html = html.replace(re, (match) => {
      // Don't re-wrap if already inside a span
      if (match.includes('<span') || match.includes('</span')) return match;
      return makeSpan(match, entry);
    });
  });

  // Pass 2: Single words
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

// ===== TOOLTIP =====
function showTooltip(e) {
  const el = e.target;
  const tooltip = document.getElementById('sozluk-tooltip');
  const anlam = el.dataset.anlam;
  if (!anlam) return;

  let html = '';
  const osmanli = el.dataset.osmanli;
  if (osmanli) {
    html += '<span class="tooltip-osmanli">' + osmanli + '</span>';
  }
  html += anlam;

  if (el.dataset.alternatif) {
    html += '<div class="tooltip-alt">Di\u011fer yaz\u0131mlar: ' + el.dataset.alternatif + '</div>';
  }

  if (el.dataset.baglamlar) {
    try {
      const baglamlar = JSON.parse(el.dataset.baglamlar.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
      html += '<div class="tooltip-baglamlar"><strong>Ba\u011flama g\u00f6re:</strong>';
      baglamlar.forEach(b => {
        html += '<div class="tooltip-baglam"><em>' + b.baglam + ':</em> ' + b.anlam + '</div>';
      });
      html += '</div>';
    } catch(e) {}
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
  document.getElementById('sozluk-tooltip').style.display = 'none';
}

// ===== SÖZLÜK =====
let sozlukLoaded = false;

function loadSozluk(filterKat, filterText) {
  sozlukLoaded = true;
  const list = document.getElementById('sozluk-list');
  const countEl = document.getElementById('sozluk-count');
  if (!window.sozlukData) { list.innerHTML = '<div class="loading">S\u00f6zl\u00fck y\u00fckleniyor...</div>'; return; }

  const katFilter = filterKat || 'all';
  const rawSozlukSearch = filterText || document.getElementById('sozluk-search')?.value || '';
  const searchText = rawSozlukSearch.toLowerCase();

  let filtered = window.sozlukData;
  if (katFilter !== 'all') filtered = filtered.filter(s => s.kategori === katFilter);
  if (searchText) {
    const { wordVarLists: szVarLists } = expandSearchQuery(rawSozlukSearch);
    filtered = filtered.filter(s => {
      const nk = normalizeSearch(s.kelime || '');
      const na = normalizeSearch(s.anlam || '');
      const check = v => includesWordStart(nk, v) || includesWordStart(na, v) ||
        (s.alternatif && s.alternatif.some(a => includesWordStart(normalizeSearch(a), v)));
      return szVarLists.every(wvars => wvars.some(check));
    });
  }

  filtered.sort((a, b) => a.kelime.localeCompare(b.kelime, 'tr'));

  const katLabels = {
    akaid: 'Ak\u00e2id/Kel\u00e2m', ibadet: '\u0130badet/Taharet', tasavvuf: 'Tasavvuf/Ahl\u00e2k',
    fikih: 'F\u0131k\u0131h/Us\u00fbl', muamelat: 'Mu\u00e2mel\u00e2t/Ticaret', siyer: 'Siyer/Tarih',
    hadis: 'Hadis/S\u00fcnnet', kuran: "Kur'an/Tefsir", mezhepler: 'Mezhepler/F\u0131rkalar',
    aile: 'Aile/Nik\u00e2h', dil: 'Dil/Edebiyat', miras: 'Miras/Fer\u00e2iz', osmanli: 'Osmanl\u0131/Kurumlar'
  };
  let html = '';
  filtered.forEach(s => {
    const osmanli = s.osmanli ? `<div class="sozluk-osmanli">${s.osmanli}</div>` : '';
    const katLabel = katLabels[s.kategori] || s.kategori;
    const altHtml = s.alternatif ? `<div class="sozluk-alt">Di\u011fer yaz\u0131mlar: ${s.alternatif.join(', ')}</div>` : '';
    let baglamHtml = '';
    if (s.baglamlar && s.baglamlar.length > 0) {
      baglamHtml = '<div class="sozluk-baglamlar"><span class="baglam-label">Ba\u011flama g\u00f6re:</span>';
      s.baglamlar.forEach(b => {
        baglamHtml += `<div class="sozluk-baglam"><em>${b.baglam}:</em> ${b.anlam}</div>`;
      });
      baglamHtml += '</div>';
    }
    html += `
      <div class="sozluk-item">
        <div class="sozluk-kelime-row">
          <div class="sozluk-kelime">${s.kelime}</div>
          ${osmanli}
        </div>
        <div class="sozluk-anlam">${s.anlam}</div>
        ${s.misal ? `<div class="sozluk-misal">${s.misal}</div>` : ''}
        ${altHtml}
        ${baglamHtml}
        <span class="sozluk-kat kat-${s.kategori}">${katLabel}</span>
      </div>
    `;
  });

  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Kelime bulunamad\u0131.</p>';
  countEl.textContent = `${filtered.length} kelime g\u00f6steriliyor`;
}

document.getElementById('sozluk-search')?.addEventListener('input', () => {
  const activeKat = document.querySelector('.kat-btn.active')?.dataset.kat || 'all';
  loadSozluk(activeKat);
});

document.querySelectorAll('.kat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.kat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadSozluk(btn.dataset.kat);
  });
});

// ===== ŞAHİSLAR =====
let sahislarLoaded = false;

function loadSahislar() {
  sahislarLoaded = true;
  const list = document.getElementById('sahislar-list');
  if (!window.sahislarData || window.sahislarData.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:60px;">Şahıs verileri yükleniyor...</p>';
    return;
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

document.getElementById('sahis-search')?.addEventListener('input', () => loadSahislar());

function openSahis(slug, fromRoute) {
  if (!window.sahislarData) return;

  const sahis = window.sahislarData.find(s => s.slug === slug);
  if (!sahis) return;

  if (!fromRoute) updateHash(`sahis/${slug}`);

  const body = document.getElementById('sahis-body');
  document.getElementById('sahis-detay').style.display = 'flex';
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
      <div class="sahis-biyografi">${sahis.biyografi}</div>
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
  document.getElementById('sahis-detay').style.display = 'none';
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
  aile: 'Aile Hukuku'
};
const tabloKatOrder = ['itikat','temizlik','namaz','oruc','zekat','hac','aile'];

let tabloActiveKat = 'all';
let tabloSearchText = '';

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
  if (section === 'tablolar' && !tablolarLoaded) loadTablolar();
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
  if (katFilter === 'all') {
    for (const kat of tabloKatOrder) {
      const items = allItems.filter(t => t.kategori === kat);
      if (items.length === 0) continue;
      html += `<div class="tablo-kategori-baslik tablo-kat-${kat}"><span>${tabloKatLabels[kat]}</span><span class="tablo-kat-count">${items.length}</span></div>`;
      items.forEach(tablo => { html += renderTabloCard(tablo); });
    }
    // genel ones without category label
    const genel = allItems.filter(t => !tabloKatOrder.includes(t.kategori));
    genel.forEach(tablo => { html += renderTabloCard(tablo); });
  } else {
    allItems.forEach(tablo => { html += renderTabloCard(tablo); });
  }

  const total = allItems.length;
  countEl.textContent = searchText ? `${total} tablo bulundu` : `${total} tablo`;
  grid.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Tablo bulunamad\u0131.</p>';
}

function renderTabloCard(tablo) {
  const tipIcons = {tablo:'\u25A6', liste:'\u25A4', iki_liste:'\u21C4', flowchart:'\u25A5', agac:'\u25C8'};
  return `
    <div class="tablo-card tablo-kat-${tablo.kategori}" id="tablo-${tablo.id}">
      <div class="tablo-card-header">
        <h4>${tipIcons[tablo.tip] || '\u25A6'} ${tablo.baslik}</h4>
        <div class="tablo-card-ref">
          <span class="tablo-ref-madde">${tablo.kaynak_madde}</span>
          <span class="tablo-ref-sayfa">${sayfaLink(tablo.sayfa_no, 's. ' + tablo.sayfa_no)}</span>
        </div>
      </div>
      <div class="tablo-card-body">
        ${renderTabloBody(tablo)}
        <div class="tablo-kaynak">
          <strong>Kitaptan:</strong> ${tablo.kaynak_metin}
        </div>
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

function renderTabloBody(tablo) {
  if (tablo.tip === 'tablo' && tablo.veriler) return renderTable(tablo.veriler, tablo.kolonlar);
  if (tablo.tip === 'flowchart' && tablo.veriler) return renderFlowchart(tablo.veriler);
  if (tablo.tip === 'liste' && tablo.veriler) return renderListe(tablo.veriler);
  if (tablo.tip === 'iki_liste' && tablo.veriler) return renderIkiListe(tablo.veriler);
  if (tablo.tip === 'tanimlar') return renderTanimlar(tablo.id);
  return '<p>Tablo verisi y\u00fckleniyor...</p>';
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
  let html = '<ul class="check-list">';
  veriler.forEach(item => {
    const icon = item.durum === 'bozar' || item.durum === 'evet' ?
      '<span class="check-icon check-no">&#10007;</span>' :
      '<span class="check-icon check-yes">&#10003;</span>';
    html += `<li>${icon} <span>${item.madde || item.baslik || item.metin || JSON.stringify(item)}</span></li>`;
  });
  html += '</ul>';
  return html;
}

function renderIkiListe(veriler) {
  let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
  if (veriler.bozanlar) {
    html += '<div><h5 style="color:#c62828;margin-bottom:8px;">Orucu Bozan \u015eeyler</h5><ul class="check-list">';
    veriler.bozanlar.forEach(item => {
      html += `<li><span class="check-icon check-no">&#10007;</span> <span>${item}</span></li>`;
    });
    html += '</ul></div>';
  }
  if (veriler.bozmayalar) {
    html += '<div><h5 style="color:#2e7d32;margin-bottom:8px;">Orucu Bozmayan \u015eeyler</h5><ul class="check-list">';
    veriler.bozmayalar.forEach(item => {
      html += `<li><span class="check-icon check-yes">&#10003;</span> <span>${item}</span></li>`;
    });
    html += '</ul></div>';
  }
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
    .replace(/[''\u2018\u2019]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Kelime başı farkında indexOf: eşleşme ancak boşluk veya metin başından sonra gelebilir.
// Türkçe ekler serbest: "ahmet" → "ahmetten" ✓, ama "rahmetullah" içindeki "ahmet" → ✗
function indexOfWordStart(text, term, from) {
  from = from || 0;
  while (true) {
    const i = text.indexOf(term, from);
    if (i === -1) return -1;
    if (i === 0 || text[i - 1] === ' ') return i;
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
  'mucize':   'mu cize',
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
  'kuran':    'kur an',
  'hadis':    'hadis i serif',
  'sunnet':   'sunnet i seniyye',
  'mezhep':   'mezheb',
  'bidat':    'bid at',
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

  return Array.from(vars);
}

// Sorguyu genişlet: normalize et + her kelime için varyantlar üret
// Döndürülen yapı: { normalized, wordVarLists, altWords }
// wordVarLists[i] = i. kelimenin tüm varyantları
// Eski variants dizisi geriye uyumluluk için tutulur (tek kelime sorgularında)
function expandSearchQuery(rawQuery) {
  const normalized = normalizeSearch(rawQuery);
  const words = normalized.split(/\s+/);
  const wordVarLists = words.map(w => wordVariants(w));

  // Kullanıcıya gösterilecek "farklı yazım" uyarısı için
  const altWords = wordVarLists
    .flatMap((vars, i) => vars.filter(v => v !== words[i]))
    .filter((v, i, a) => a.indexOf(v) === i);

  // Eski tek-phrase aramasıyla geriye uyumluluk (tek kelimeli sorgular)
  const variantSet = new Set([normalized]);
  wordVarLists[0]?.forEach(v => {
    if (words.length === 1) variantSet.add(v);
  });

  return {
    normalized,
    words,
    wordVarLists,
    altWords,
    variants: Array.from(variantSet),           // tek kelime için
    altVariants: altWords,
  };
}

// ===== ARAMA =====
async function doFullSearch(fromRoute) {
  const rawQuery = document.getElementById('full-search').value.trim();
  if (!rawQuery || rawQuery.length < 2) return;
  const query = rawQuery.toLowerCase();

  if (!fromRoute) updateHash(`arama/${encodeURIComponent(query)}`);

  const results = document.getElementById('arama-results');
  if (!window.maddelerData) {
    results.innerHTML = '<p>Veriler y\u00fckleniyor...</p>';
    return;
  }

  results.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">Tam metin aran\u0131yor...</p>';

  await Promise.all([loadKisimTexts(1), loadKisimTexts(2), loadKisimTexts(3)]);

  // Sorguyu normalize et ve her kelime için varyant listeleri üret
  const { normalized: normQuery, words: qWords, wordVarLists, altVariants } = expandSearchQuery(rawQuery);
  // allVars: highlight için tüm kelime varyantlarının düz listesi
  const allVars = wordVarLists.flat();

  const kisimLabels = { 1: 'Birinci K\u0131s\u0131m', 2: '\u0130kinci K\u0131s\u0131m', 3: '\u00dc\u00e7\u00fcnc\u00fc K\u0131s\u0131m' };
  const matches = [];

  window.maddelerData.forEach(m => {
    const fullText = kisimTextsCache[m.kisim]?.[String(m.madde_no)] || m.metin || '';
    const normText = normalizeSearch(fullText);
    const normBaslik = normalizeSearch(m.baslik || '');

    // AND mantığı: her kelime (herhangi bir varyantıyla) metinde geçmeli
    let firstIdx = -1;
    let firstMatchedVar = null;
    let allFound = true;

    for (let wi = 0; wi < wordVarLists.length; wi++) {
      const wvars = wordVarLists[wi];
      let found = false;
      for (const v of wvars) {
        const i = indexOfWordStart(normText, v);
        if (i !== -1) {
          found = true;
          if (firstIdx === -1) { firstIdx = i; firstMatchedVar = v; }
          break;
        }
      }
      // Başlıkta da arayalım
      if (!found) {
        found = wvars.some(v => includesWordStart(normBaslik, v));
      }
      if (!found) { allFound = false; break; }
    }

    const inTitle = wordVarLists.every(wvars => wvars.some(v => includesWordStart(normBaslik, v)));

    if (allFound) {
      let context = '';
      if (firstIdx !== -1) {
        const termLen = firstMatchedVar ? firstMatchedVar.length : qWords[0].length;
        const start = Math.max(0, firstIdx - 80);
        const end = Math.min(fullText.length, firstIdx + termLen + 80);
        context = (start > 0 ? '...' : '') +
          fullText.substring(start, end) +
          (end < fullText.length ? '...' : '');
      }

      matches.push({
        kisim: m.kisim,
        madde_no: m.madde_no,
        baslik: m.baslik,
        sayfa_no: m.sayfa_no,
        context: context,
        inTitle: inTitle
      });
    }
  });

  matches.sort((a, b) => (b.inTitle ? 1 : 0) - (a.inTitle ? 1 : 0));

  let html = `<p style="color:var(--text-muted);margin-bottom:16px;">${matches.length} sonu\u00e7 bulundu</p>`;

  matches.slice(0, 50).forEach(m => {
    // Normalize edilmiş bağlamda eşleşen konumları bul, orijinal metinde işaretle
    // (normalizasyon 1-to-1 olduğu için pozisyonlar birebir uyuşur)
    const normCtx = normalizeSearch(m.context);
    let highlighted = escapeHtml(m.context);
    if (normCtx) {
      // Tüm varyant eşleşmelerini bul ve sırala
      const positions = [];
      for (const v of allVars) {
        let from = 0;
        while (true) {
          const i = indexOfWordStart(normCtx, v, from);
          if (i === -1) break;
          positions.push({ start: i, end: i + v.length });
          from = i + 1;
        }
      }
      positions.sort((a, b) => a.start - b.start);
      // Üst üste binen aralıkları birleştir, geriye doğru uygula (konumları bozmamak için)
      const merged = [];
      for (const p of positions) {
        if (merged.length && p.start <= merged[merged.length - 1].end) {
          merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, p.end);
        } else { merged.push({ ...p }); }
      }
      for (let i = merged.length - 1; i >= 0; i--) {
        const { start, end } = merged[i];
        highlighted = highlighted.slice(0, start) + '<mark>' + highlighted.slice(start, end) + '</mark>' + highlighted.slice(end);
      }
    }

    html += `
      <div class="arama-result" onclick="openMadde(${m.kisim}, ${m.madde_no})">
        <h4>${escapeHtml(m.baslik)}</h4>
        <p>${highlighted || '(Ba\u015fl\u0131kta e\u015fle\u015fme)'}</p>
        <div class="result-meta">${kisimLabels[m.kisim]}, Madde ${m.madde_no} \u00B7 ${sayfaLink(m.sayfa_no, 'Sayfa ' + m.sayfa_no)}</div>
      </div>
    `;
  });

  results.innerHTML = html;

  // RAG: Her aramada AI cevap üret
  triggerRagAnswer(rawQuery);
}

function triggerRagAnswer(question) {
  const container = document.getElementById('ai-answer-container');
  const textEl = document.getElementById('ai-answer-text');
  const sourcesEl = document.getElementById('ai-answer-sources');
  if (!container || !textEl) return;

  container.style.display = '';
  textEl.innerHTML = '';
  textEl.classList.add('loading');
  sourcesEl.innerHTML = '';

  SearchEngine.ragAnswer(
    question,
    // onChunk: streaming metin gelirken
    function(chunk, fullText) {
      textEl.classList.remove('loading');
      // Paragrafları ayır, satır sonlarını <br> yap
      const formatted = escapeHtml(fullText).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
      textEl.innerHTML = '<p>' + formatted + '<span class="ai-cursor"></span></p>';
    },
    // onDone: tamamlandı — kaynak kartlarını göster
    function(fullText, sources) {
      const formatted = escapeHtml(fullText).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
      textEl.innerHTML = '<p>' + formatted + '</p>';

      if (sources && sources.length > 0) {
        sourcesEl.innerHTML = sources.map(s => {
          const parts = s.id.split('/');
          const kisim = parts[0];
          const maddeNo = parts[1];
          const title = escapeHtml(s.title || '');
          // Kısa snippet (passage veya subtitle)
          const snippet = escapeHtml((s.passage || s.subtitle || '').replace(/<[^>]+>/g, '').slice(0, 80));
          return `<a href="#" class="ai-source-card" onclick="openMadde(${kisim}, ${maddeNo});return false;">
            <div class="ai-source-card-ref">K${kisim}/M${maddeNo}</div>
            <div class="ai-source-card-title">${title}</div>
            ${snippet ? '<div class="ai-source-card-snippet">' + snippet + '...</div>' : ''}
          </a>`;
        }).join('');
      }
    },
    // onError
    function(err) {
      textEl.classList.remove('loading');
      textEl.innerHTML = '<p style="color:var(--text-muted);font-style:italic;">' + escapeHtml(err) + '</p>';
    }
  );
}

function closeAiAnswer() {
  const container = document.getElementById('ai-answer-container');
  if (container) container.style.display = 'none';
  SearchEngine.ragAbort();
}

function hideAiAnswer() {
  const container = document.getElementById('ai-answer-container');
  if (container) container.style.display = 'none';
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
    sozluk: 'Dini L\u00fcgat',
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

        // Başlıkta eşleşen kelimeleri vurgula
        let titleHtml = escapeHtml(item.title);
        const normQuery = normalizeSearch(query);
        const qWords = normQuery.split(/\s+/);
        qWords.forEach(qw => {
          if (qw.length < 2) return;
          const normTitle = normalizeSearch(item.title);
          let pos = 0;
          while (true) {
            const i = normTitle.indexOf(qw, pos);
            if (i === -1) break;
            // Orijinal başlıktaki aynı pozisyonu vurgula
            titleHtml = titleHtml.substring(0, i + (titleHtml.length - item.title.length >= 0 ? 0 : 0));
            pos = i + qw.length;
            break; // İlk eşleşme yeter
          }
        });

        // Passage varsa (AI sonucu) highlight'lı göster, yoksa subtitle
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
        navigateTo('sozluk');
        setTimeout(() => {
          const sozlukSearch = document.getElementById('sozluk-search');
          if (sozlukSearch) {
            sozlukSearch.value = item.data.t;
            sozlukSearch.dispatchEvent(new Event('input'));
          }
        }, 100);
        break;
      case 'sahis':
        openSahis(item.data.slug || item.data.isim);
        break;
      case 'tablo':
        navigateTo('fevaid');
        setTimeout(() => openFevaidSection('tablolar'), 100);
        setTimeout(() => {
          const tabloSearch = document.getElementById('tablo-search');
          if (tabloSearch) {
            tabloSearch.value = item.data.baslik;
            tabloSearch.dispatchEvent(new Event('input'));
          }
        }, 200);
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

      const isQ = window.SearchEngine.isQuestion(query);

      // Soru formatındaysa doğrudan AI loading göster
      if (isQ) {
        dropdown.innerHTML = '<div class="search-ai-loading"><span class="search-ai-badge">AI</span> Kitapta aran\u0131yor<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span></div>';
        dropdown.style.display = 'block';

        const aiResults = await window.SearchEngine.aiSearch(query);
        if (aiResults === null) return; // iptal edildi

        // Keyword sonuçlarını da al (AI ile birleştirmek için)
        const results = window.SearchEngine.search(query, { limit: 4 });

        if (aiResults.length > 0) {
          const merged = { madde: [], sozluk: results.sozluk, sahis: results.sahis, tablo: results.tablo, total: 0 };
          const seenIds = new Set();
          aiResults.forEach(r => { merged.madde.push(r); seenIds.add(r.id); });
          results.madde.forEach(r => { if (!seenIds.has(r.id)) merged.madde.push(r); });
          merged.total = merged.madde.length + merged.sozluk.length + merged.sahis.length + merged.tablo.length;
          showDropdown(merged, query, true);
        } else {
          // AI sonuç bulamadı, keyword sonuçlarını göster
          showDropdown(results, query);
        }
      } else {
        // Kısa sorgu: sadece keyword arama
        const results = window.SearchEngine.search(query, { limit: 4 });
        showDropdown(results, query);
      }
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
  if (window.tocData) {
    console.log(`Y\u00fcklendi: ${window.tocData.length} madde, ${window.sozlukData?.length || 0} s\u00f6zl\u00fck kelimesi, ${window.tablolarData?.length || 0} tablo${window.sahislarData ? ', ' + window.sahislarData.length + ' \u015fah\u0131s' : ''}`);
  }
  // Arka planda veri dosyalarını önceden yükle
  setTimeout(() => {
    ensureSozlukData();
    ensureMaddelerData();
    loadKisimTexts(1);
    loadKisimTexts(2);
    loadKisimTexts(3);
  }, 300);

  // Günün maddesi
  if (typeof loadGununMaddesi === 'function') loadGununMaddesi();

  // Handle initial route (clean URL veya hash)
  var initialPath = getRoutePath();
  if (initialPath && initialPath !== 'anasayfa') {
    handleRoute();
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
  ozetEl.textContent = kisimLabels[madde.kisim] + ', Madde ' + madde.madde_no + (madde.mektup_ref ? ' · Mektup: ' + madde.mektup_ref : '');
  btn.onclick = () => { navigateTo('icerik'); openMadde(madde.kisim, madde.madde_no); };
}

// ===== FONT BOYUTU AYARI =====
let currentFontSize = parseFloat(localStorage.getItem('ilmihal-font-size') || '1.05');

function adjustFontSize(delta) {
  currentFontSize = Math.max(0.8, Math.min(1.6, currentFontSize + delta * 0.1));
  document.documentElement.style.setProperty('--madde-font-size', currentFontSize + 'rem');
  localStorage.setItem('ilmihal-font-size', String(currentFontSize));
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
    btn.innerHTML = '&#9733;';
    btn.classList.add('bookmarked');
  } else {
    btn.innerHTML = '&#9734;';
    btn.classList.remove('bookmarked');
  }
}

// ===== PAYLAŞIM =====
function shareMadde() {
  if (!currentMaddeForBookmark) return;
  const url = window.location.origin + window.location.pathname + '#madde/' + currentMaddeForBookmark.kisim + '/' + currentMaddeForBookmark.madde_no;
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
  }
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

// ===== QUIZ SİSTEMİ =====
var quizSorulari = {
  iman: [
    {s:"İslâmın beş şartından ilki nedir?",c:["Kelime-i şehâdet söylemek","Namaz kılmak","Oruç tutmak","Zekât vermek"],d:0,a:"Kitapta 'Her müslimânın beş şeyi yapması farzdır: Birincisi, kelime-i şehâdet söylemekdir' buyurulmaktadır. (K1/M51)",m:{k:1,m:51}},
    {s:"Ehl-i sünnet itikadında îmânın altı şartından biri değildir?",c:["Allahü teâlâya inanmak","Meleklere inanmak","Reenkarnasyona inanmak","Kadere inanmak"],d:2,a:"Kitapta, Âmentünün altı şartı bildirilmektedir: Allahü teâlâya, meleklerine, kitaplarına, peygamberlerine, âhiret gününe ve kadere inanmak. (K1/M3)",m:{k:1,m:3}},
    {s:"Ehl-i sünnetin reîsi kimdir?",c:["İmâm-ı Şâfi'î","İmâm-ı a'zam Ebû Hanîfe","İmâm-ı Mâlik","İmâm-ı Ahmed bin Hanbel"],d:1,a:"Kitapta 'Ehl-i sünnetin reîsi, imâm-ı a'zam Ebû Hanîfedir' buyurulmaktadır. (K1/M5)",m:{k:1,m:5}},
    {s:"Peygamber Efendimiz (sallallahü aleyhi ve sellem) hangi şehirde doğmuştur?",c:["Medîne","Mekke","Tâif","Kudüs"],d:1,a:"Kitapta Peygamber Efendimizin Mekke-i mükerremede doğduğu bildirilmektedir. (K1/M90)",m:{k:1,m:90}},
    {s:"Dört büyük melekten biri değildir?",c:["Cebrâîl","Mikâîl","Münker","İsrâfîl"],d:2,a:"Kitapta dört büyük melek bildirilmektedir: Cebrâîl, Mikâîl, İsrâfîl ve Azrâîl aleyhimüsselâm. Münker ise kabir meleklerindendir. (K1/M3)",m:{k:1,m:3}},
    {s:"Bid'at ne demektir?",c:["Güzel âdet","Dinde sonradan çıkarılan şey","Sünnet","Peygamberimizin emri"],d:1,a:"Kitapta 'Resûlullahın ve dört halîfesinin yapmadıkları şeyleri ibâdet olarak yapmağa bid'at denir' buyurulmaktadır. (K1/M1)",m:{k:1,m:1}},
    {s:"Fıkıh ilmi ne demektir?",c:["Kur'ân-ı kerîm tefsîri","Hadîs-i şerîf ilmi","Helâl ve harâmları bildiren ilim","Tasavvuf ilmi"],d:2,a:"Kitapta 'Fıkıh ilmi, insanların yapması ve yapmaması lâzım olan şeyleri bildirir' buyurulmaktadır. (K1/M6)",m:{k:1,m:6}},
    {s:"Kur'ân-ı kerîm kaç sûredir?",c:["100","110","114","120"],d:2,a:"Kur'ân-ı kerîm 114 sûre ve 6236 âyet-i kerîmedir. (K1/M5)",m:{k:1,m:5}}
  ],
  namaz: [
    {s:"Beş vakit namazda toplam kaç rekât farz vardır?",c:["17","20","25","40"],d:0,a:"Kitapta 'Beş vakt nemâz, otuzüç farz' başlığında, sabah 2, öğle 4, ikindi 4, akşam 3, yatsı 4 olmak üzere 17 rekât farz bildirilmektedir. (K1/M51)",m:{k:1,m:51}},
    {s:"Nemâzın farzlarından (şartlarından) değildir?",c:["Kıbleye dönmek","Niyet etmek","Eûzü okumak","Abdest almak"],d:2,a:"Kitapta nemâzın farzları: Hadesten tahâret, necâsetten tahâret, setr-i avret, istikbâl-i kıble, vakit ve niyyet olarak bildirilmektedir. Eûzü okumak sünnet-i müekkededir. (K1/M52)",m:{k:1,m:52}},
    {s:"Abdesti bozan hallerden değildir?",c:["Uyumak","Ağlamak","Kan gelmesi","Bayılmak"],d:1,a:"Kitapta abdesti bozan haller: Ön ve arkadan bir şey çıkması, kan gelmesi, uyumak, bayılmak gibi haller bildirilmektedir. Ağlamak abdesti bozmaz. (K1/M53)",m:{k:1,m:53}},
    {s:"Sabah namazının sünneti kaç rekâttır?",c:["2","4","3","Sünnet yoktur"],d:0,a:"Kitapta sabah namazının farzından önce iki rekât sünnet-i müekkede kılınacağı bildirilmektedir. (K1/M59)",m:{k:1,m:59}},
    {s:"Nemâzda secde kaç defa yapılır?",c:["Her rekâtta 1","Her rekâtta 2","Her rekâtta 3","Sadece son rekâtta"],d:1,a:"Kitapta her rekâtta iki secde yapılacağı bildirilmektedir. (K1/M62)",m:{k:1,m:62}},
    {s:"Nemâzın vâciblerinden değildir?",c:["Fâtiha okumak","Rükû'da üç kerre tesbîh","Selâm vermek","Kıyâmda durmak"],d:3,a:"Kitapta kıyâmda durmak nemâzın farzlarındandır. Fâtiha okumak, vitir nemâzında kunût okumak, rükû' ve secdelerde tesbîh söylemek vâcibdir. (K1/M62)",m:{k:1,m:62}},
    {s:"Seferde (yolculukda) dört rekâtlık farz nemâzlar kaç rekât kılınır?",c:["4 rekât","3 rekât","2 rekât","Kılınmaz"],d:2,a:"Kitapta seferde, ya'nî yolculukda dört rekâtlık farz nemâzların iki rekât kılınacağı bildirilmektedir. (K1/M72)",m:{k:1,m:72}},
    {s:"Cenâze nemâzında rükû' ve secde var mıdır?",c:["Evet, ikisi de var","Sadece rükû' var","Sadece secde var","Hayır, ikisi de yok"],d:3,a:"Kitapta cenâze nemâzında rükû' ve secde olmadığı, dört tekbîr ile kılındığı bildirilmektedir. (K1/M77)",m:{k:1,m:77}}
  ],
  oruc: [
    {s:"Ramazan orucu ne zaman farz oldu?",c:["Hicretin 1. yılında","Hicretin 2. yılında","Mekke'de","Hicretin 5. yılında"],d:1,a:"Kitapta Ramazan orucunun hicretin ikinci yılında, Şa'bân ayının onuncu günü farz olduğu bildirilmektedir. (K1/M79)",m:{k:1,m:79}},
    {s:"Orucu bozmayan hallerden biri hangisidir?",c:["Yemek yemek","Unutarak su içmek","Bilerek su içmek","İğne yaptırmak"],d:1,a:"Kitapta 'Unutarak yimek ve içmek orucu bozmaz. Hâtırlayınca bırakılır, oruca devâm edilir' buyurulmaktadır. (K1/M80)",m:{k:1,m:80}},
    {s:"İftar vakti ne zamandır?",c:["Güneş doğunca","Öğle ezanında","İkindi ezanında","Güneş batınca"],d:3,a:"Kitapta oruç, güneş batınca açılır denilmektedir. (K1/M79)",m:{k:1,m:79}},
    {s:"İmsâk vakti ne demektir?",c:["Güneşin doğma vakti","Oruç yeme-içmeyi bırakma vakti","Öğle vakti","Akşam vakti"],d:1,a:"Kitapta imsâk vaktinde yemenin, içmenin bırakılması gerektiği bildirilmektedir. (K1/M79)",m:{k:1,m:79}},
    {s:"Oruçlu iken misvâk kullanmak orucu bozar mı?",c:["Evet bozar","Hayır bozmaz","Sadece sabah bozar","Mekrûhdur"],d:1,a:"Kitapta misvâk kullanmanın orucu bozmadığı bildirilmektedir. (K1/M80)",m:{k:1,m:80}}
  ],
  zekat: [
    {s:"Zekât vermek için en az ne kadar altın gerekir?",c:["20 miskal (96 gram)","10 miskal","50 miskal","100 miskal"],d:0,a:"Kitapta, altının nisâbının 20 miskal, ya'nî 96 gram olduğu bildirilmektedir. '4x20=80 gramdır demek doğru olmaz' diye açıkça yazılıdır. (K1/M78)",m:{k:1,m:78}},
    {s:"Zekât malın yüzde kaçıdır?",c:["Yüzde 1","Yüzde 2.5","Yüzde 5","Yüzde 10"],d:1,a:"Kitapta zekâtın, nisâb mikdârı malın kırkta biri, ya'nî yüzde iki buçuğu olduğu bildirilmektedir. (K1/M78)",m:{k:1,m:78}},
    {s:"Zekât kimlere verilmez?",c:["Fakirlere","Borçlulara","Ana-babaya","Yolda kalmışlara"],d:2,a:"Kitapta zekâtın usûl (ana, baba, dede, nine) ve fürûa (evlât, torun) verilmeyeceği bildirilmektedir. (K1/M78)",m:{k:1,m:78}},
    {s:"Gümüşün zekât nisâbı kaç dirhemdir?",c:["100 dirhem","200 dirhem","300 dirhem","400 dirhem"],d:1,a:"Kitapta gümüşün nisâbının ikiyüz dirhem-i şer'î, ya'nî 672 gram olduğu bildirilmektedir. (K1/M78)",m:{k:1,m:78}},
    {s:"Zekât ne zaman farz olmuştur?",c:["Mekke'de","Hicretin 1. yılında","Hicretin 2. yılında","Hicretin 5. yılında"],d:2,a:"Kitapta zekâtın hicretin ikinci yılında farz olduğu bildirilmektedir. (K1/M78)",m:{k:1,m:78}}
  ],
  hac: [
    {s:"Hac ibâdeti ne zaman farz olmuştur?",c:["Hicretin 6. yılında","Hicretin 9. yılında","Mekke'de","Hicretin 2. yılında"],d:1,a:"Kitapta hac ibâdetinin hicretin dokuzuncu yılında farz olduğu bildirilmektedir. (K1/M84)",m:{k:1,m:84}},
    {s:"Haccın farzlarından değildir?",c:["İhrâm","Vakfe","Tavâf","Sa'y"],d:3,a:"Kitapta haccın farzlarının üç olduğu bildirilmektedir: İhrâm, Arafat'ta vakfe ve ziyâret tavâfı. Sa'y ise vâcibdir. (K1/M84)",m:{k:1,m:84}},
    {s:"Arafat vakfesi hangi gün yapılır?",c:["Zilhicce 8","Zilhicce 9","Zilhicce 10","Zilhicce 11"],d:1,a:"Kitapta Arafat vakfesinin Zilhicce ayının dokuzuncu günü yapılacağı bildirilmektedir. (K1/M85)",m:{k:1,m:85}},
    {s:"İhrâmda iken yapılması yasak olan hallerden değildir?",c:["Tıraş olmak","Güzel koku sürmek","Yemek yemek","Dikişli elbise giymek"],d:2,a:"Kitapta ihrâm yasakları bildirilmektedir: Tıraş, güzel koku, dikişli elbise harâmdır. Yemek serbesttir. (K1/M86)",m:{k:1,m:86}},
    {s:"Umre ile hac arasındaki fark nedir?",c:["Umrede vakfe yoktur","Umrede tavâf yoktur","Umrede sa'y yoktur","Fark yoktur"],d:0,a:"Kitapta umrede Arafat vakfesinin olmadığı bildirilmektedir. (K1/M88)",m:{k:1,m:88}}
  ],
  ahlak: [
    {s:"Kitapta nefs-i emmâre ne olarak tanımlanmıştır?",c:["İnsanın rûhu","Hep kötülük emreden nefs","Akıl","Kalb"],d:1,a:"Kitapta 'Nefs-i emmâre dâimâ kötülük emr eder' buyurulmaktadır. (K2/M4)",m:{k:2,m:4}},
    {s:"Büyük günahlardan biri değildir?",c:["Yalan söylemek","Gıybet etmek","Erken kalkmak","İçki içmek"],d:2,a:"Kitapta büyük günahlar arasında adam öldürmek, zinâ, içki, yalan, gıybet, hırsızlık bildirilmektedir. (K2/M1)",m:{k:2,m:1}},
    {s:"Hadîs-i şerîfte en çok tavsiye edilen ahlâk?",c:["Sabır","Cömertlik","Doğruluk","Tevâzu"],d:2,a:"Kitapta 'Doğrulukdan ayrılmayınız. Doğruluk iyiliğe, iyilik Cennete götürür' hadîs-i şerîfi bildirilmektedir. (K2/M1)",m:{k:2,m:1}},
    {s:"Kitapta tevbenin şartlarından biri değildir?",c:["Günâha pişmân olmak","Günâhı terk etmek","Bir daha yapmamağa azm etmek","Sadaka vermek"],d:3,a:"Kitapta tevbenin üç şartı bildirilmektedir: Pişmân olmak, terk etmek ve bir daha yapmamağa azm etmek. (K2/M1)",m:{k:2,m:1}},
    {s:"Riyâ ne demektir?",c:["Yalan söylemek","İbâdeti gösteriş için yapmak","Hased etmek","Gıybet etmek"],d:1,a:"Kitapta 'İbâdetini başkalarına gösteriş için yapmak riyâdır. Riyâ, gizli şirkdir' buyurulmaktadır. (K2/M3)",m:{k:2,m:3}},
    {s:"Tövbe-i nasûh ne demektir?",c:["Samîmî tevbe","Gizli tevbe","Topluluk önünde tevbe","Günde beş kez tevbe"],d:0,a:"Kitapta tövbe-i nasûh, samîmî olarak yapılan, bir daha günâha dönmemek üzere yapılan tevbe olarak bildirilmektedir. (K2/M1)",m:{k:2,m:1}}
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
    html += '<div class="quiz-secenek" onclick="quizCevapla(' + i + ')" data-idx="' + i + '">' + c + '</div>';
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
  });
  if (idx === s.d) quizState.dogru++;
  var aciklama = document.getElementById('quiz-aciklama');
  // Maddeye götüren buton ekle
  var maddeBtn = '';
  if (s.m) {
    maddeBtn = ' <a href="#madde/' + s.m.k + '/' + s.m.m + '" onclick="openMadde(' + s.m.k + ',' + s.m.m + ');return false" style="color:var(--primary);font-weight:600;text-decoration:none;margin-left:8px;">Maddeyi Oku →</a>';
  }
  aciklama.innerHTML = s.a + maddeBtn;
  aciklama.style.display = 'block';
  setTimeout(function() { quizState.current++; renderQuizSoru(); }, 3500);
}

function resetQuiz() {
  document.querySelector('.quiz-setup').style.display = 'block';
  document.getElementById('quiz-area').style.display = 'none';
}



// Türkçe stop words (soru kelimeleri + bağlaçlar)
var stopWords = new Set(['bir','bu','ve','de','da','ile','için','ne','nasıl','nedir','nelerdir','kaç','kadar','hangi','kimlere','mi','mı','mu','mü','var','yok','olan','olarak','ise','gibi','daha','en','çok','az','her','o','şu','ben','sen','biz','siz','onlar','ki','ama','fakat','veya','ya','hem','neden','niçin','acaba','dir','dır','dur','dür','tır','tir','tur','lar','ler','dan','den','tan','ten','kadardır','kadardır','midir','nerede','yoksa','eder','ise','olan','olur','olmuş']);

function cleanSearchQuery(query) {
  var norm = (typeof normalizeSearch === 'function') ? normalizeSearch(query) : query.toLowerCase();
  return norm.split(/\s+/).filter(function(w) { return w.length >= 2 && !stopWords.has(w); });
}

// Synonym expansion: kelimeyi kitaptaki alternatif yazımlarıyla genişlet
function expandWithSynonyms(words) {
  if (!window.aramaSynonyms) return words;
  var expanded = [];
  words.forEach(function(w) {
    expanded.push(w);
    // Tek kelime eşleşmesi
    if (window.aramaSynonyms[w]) {
      window.aramaSynonyms[w].forEach(function(syn) { expanded.push(syn); });
    }
  });
  // Çoklu kelime eşleşmesi (örn: "namaz kilmak")
  var phrase = words.join(' ');
  if (window.aramaSynonyms[phrase]) {
    window.aramaSynonyms[phrase].forEach(function(syn) {
      syn.split(' ').forEach(function(sw) { if (sw.length >= 2) expanded.push(sw); });
    });
  }
  return [...new Set(expanded)];
}

// Soru→Madde doğrudan eşleme
function findDirectMatch(query) {
  if (!window.soruMaddeMap) return null;
  var norm = (typeof normalizeSearch === 'function') ? normalizeSearch(query) : query.toLowerCase();
  var best = null;
  var bestScore = 0;
  window.soruMaddeMap.forEach(function(entry) {
    entry.soru.forEach(function(s) {
      // Tam eşleşme
      if (norm === s || norm.indexOf(s) !== -1 || s.indexOf(norm) !== -1) {
        var score = s.length;
        if (norm === s) score += 100; // tam eşleşme bonus
        if (score > bestScore) { bestScore = score; best = entry; }
      }
    });
  });
  return best;
}

function searchInBook(query) {
  var results = [];
  if (!window.tocData || !window.kisimTextsCache) return results;
  var qWords = cleanSearchQuery(query);
  if (qWords.length === 0) {
    var fallback = (typeof normalizeSearch === 'function') ? normalizeSearch(query) : query.toLowerCase();
    qWords = fallback.split(/\s+/).filter(function(w) { return w.length >= 3; });
    if (qWords.length === 0) return results;
  }
  // Synonym expansion — kitaptaki farklı yazımları da ara
  qWords = expandWithSynonyms(qWords);

  window.tocData.forEach(function(m) {
    var texts = window.kisimTextsCache[m.kisim];
    if (!texts) return;
    var metin = texts[String(m.madde_no)] || '';
    var normMetin = (typeof normalizeSearch === 'function') ? normalizeSearch(metin) : metin.toLowerCase();
    var normBaslik = (typeof normalizeSearch === 'function') ? normalizeSearch(m.baslik) : m.baslik.toLowerCase();

    // Metin skoru
    var score = 0;
    var matchedWords = 0;
    qWords.forEach(function(w) {
      var idx = normMetin.indexOf(w);
      if (idx !== -1) matchedWords++;
      while (idx !== -1) { score++; idx = normMetin.indexOf(w, idx + 1); }
    });

    // Başlık bonus (çok önemli)
    qWords.forEach(function(w) {
      if (normBaslik.indexOf(w) !== -1) score += 20;
    });

    // Tüm kelimeler eşleşirse bonus
    if (matchedWords === qWords.length) score += 10;

    if (score > 0) {
      // En iyi pasajı bul
      var bestPos = 0;
      var bestCount = 0;
      for (var i = 0; i < normMetin.length; i += 200) {
        var window_text = normMetin.substring(i, i + 400);
        var cnt = 0;
        qWords.forEach(function(w) { if (window_text.indexOf(w) !== -1) cnt++; });
        if (cnt > bestCount) { bestCount = cnt; bestPos = i; }
      }
      var start = Math.max(0, bestPos - 50);
      var pasaj = escapeHtml(metin.substring(start, start + 350));
      qWords.forEach(function(w) {
        var re = new RegExp('(' + escapeRegex(w) + ')', 'gi');
        pasaj = pasaj.replace(re, '<mark>$1</mark>');
      });
      results.push({ kisim: m.kisim, maddeNo: m.madde_no, baslik: escapeHtml(m.baslik), score: score, pasaj: '...' + pasaj + '...' });
    }
  });
  results.sort(function(a, b) { return b.score - a.score; });
  return results.slice(0, 12);
}

// ===== FAQ SCHEMA (dinamik) =====
function addFaqSchema(madde, metin) {
  var existing = document.getElementById('faq-schema');
  if (existing) existing.remove();
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'faq-schema';
  var snippet = metin.replace(/<[^>]+>/g, '').substring(0, 300);
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": madde.baslik,
      "acceptedAnswer": { "@type": "Answer", "text": snippet + '...' }
    }]
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
  setMeta('og:url', 'https://ilmihal.org/#madde/' + madde.kisim + '/' + madde.madde_no);
  setMeta('og:description', 'Kısım ' + madde.kisim + ', Madde ' + madde.madde_no + ' - Se\'âdet-i Ebediyye İnteraktif İlmihâl');
  setMeta('twitter:title', madde.baslik + ' - Se\'âdet-i Ebediyye');
  setMeta('twitter:description', 'Kısım ' + madde.kisim + ', Madde ' + madde.madde_no);
  document.title = madde.baslik + ' - Se\'âdet-i Ebediyye';
}

// ===== NAVİGASYON GÜNCELLEMESİ =====
// Yeni sayfalar için validPages'e ekle
var _origNavigateTo = navigateTo;
navigateTo = function(page, fromRoute) {
  _origNavigateTo(page, fromRoute);
  if (page === 'quiz') { document.getElementById('page-quiz')?.classList.add('active'); }
  if (page === 'ayet-hadis') { document.getElementById('page-ayet-hadis')?.classList.add('active'); renderAyetHadis(); }
  if (page === 'gunun-bilgisi') { document.getElementById('page-gunun-bilgisi')?.classList.add('active'); renderGununBilgisi(); }
  if (page === 'rehberler') { document.getElementById('page-rehberler')?.classList.add('active'); renderRehberler(); }
};

// ===== BİRLEŞİK ARAMA (Arama + Soru-Cevap) =====
function birlesikAra() {
  var query = document.getElementById('full-search').value.trim();
  if (!query) return;
  var ipuclari = document.getElementById('arama-ipuclari');
  if (ipuclari) ipuclari.style.display = 'none';

  var sonuc = document.getElementById('arama-results');
  sonuc.innerHTML = '<div class="loading">Kitapta aranıyor...</div>';
  updateUrl('arama/' + encodeURIComponent(query));

  // Her zaman hem tam metin hem başlık araması yap
  Promise.all([loadKisimTexts(1), loadKisimTexts(2), loadKisimTexts(3), ensureMaddelerData()]).then(function() {
    // Doğrudan soru eşleme — en üstte göster
    var directMatch = findDirectMatch(query);
    var bookResults = [];

    if (directMatch) {
      var dm = window.tocData?.find(function(t) { return t.kisim === directMatch.kisim && t.madde_no === directMatch.maddeNo; });
      if (dm) {
        bookResults.push({
          kisim: directMatch.kisim,
          maddeNo: directMatch.maddeNo,
          baslik: '<strong>' + escapeHtml(dm.baslik) + '</strong>',
          score: 9999,
          pasaj: '<div style="background:rgba(26,107,78,0.08);padding:12px;border-radius:8px;border-left:3px solid var(--primary);margin-bottom:4px;">' + escapeHtml(directMatch.cevapOzet) + '</div>'
        });
      }
    }

    // Tam metin arama (kitap içi)
    var moreResults = searchInBook(query);
    // Birleştir (duplicate önle)
    var seen = {};
    bookResults.forEach(function(r) { seen[r.kisim + '/' + r.maddeNo] = true; });
    moreResults.forEach(function(r) {
      var key = r.kisim + '/' + r.maddeNo;
      if (!seen[key]) { seen[key] = true; bookResults.push(r); }
    });

    // Başlık + index araması (search engine varsa)
    if (window.SearchEngine && window.SearchEngine.isReady()) {
      var seResults = window.SearchEngine.search(query, { limit: 8 });
      if (seResults.madde) {
        seResults.madde.forEach(function(m) {
          var key = m.kisim + '/' + m.madde_no;
          if (!seen[key]) {
            seen[key] = true;
            bookResults.push({
              kisim: m.kisim, maddeNo: m.madde_no,
              baslik: escapeHtml(m.baslik), score: m.score || 1,
              pasaj: m.context ? escapeHtml(m.context.substring(0, 200)) + '...' : ''
            });
          }
        });
      }
    }

    if (bookResults.length === 0) {
      sonuc.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Sonuç bulunamadı. Farklı kelimeler deneyin.</p>';
      return;
    }
    sonuc.innerHTML = '<p style="color:var(--text-muted);margin-bottom:16px;">' + bookResults.length + ' ilgili madde bulundu:</p>' + bookResults.map(function(r) {
      return '<div class="soru-cevap-card" style="cursor:pointer" onclick="openMadde(' + r.kisim + ',' + r.maddeNo + ',false,\'' + escapeHtml(query).replace(/'/g, "&#39;") + '\')"><h4>' + r.baslik + '</h4><div class="soru-cevap-passage">' + r.pasaj + '</div><div class="soru-cevap-ref">Kısım ' + r.kisim + ', Madde ' + r.maddeNo + ' · <a href="/madde/' + r.kisim + '/' + r.maddeNo + '" onclick="event.stopPropagation()">Maddeyi Aç</a></div></div>';
    }).join('');
  });
}

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

function renderAyetHadis(filterText) {
  if (!window.ayetHadisData) return;
  var list = document.getElementById('ayet-hadis-list');
  var countEl = document.getElementById('ah-count');
  if (!list) return;
  
  var items = ahCurrentTab === 'ayet' ? window.ayetHadisData.ayetler : window.ayetHadisData.hadisler;
  var label = ahCurrentTab === 'ayet' ? 'âyet-i kerîme' : 'hadîs-i şerîf';
  
  // Filtrele
  var search = filterText || (document.getElementById('ah-search') ? document.getElementById('ah-search').value.trim().toLowerCase() : '');
  if (search) {
    items = items.filter(function(item) {
      return item.metin.toLowerCase().indexOf(search) !== -1;
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
    var madde = window.tocData ? window.tocData.find(function(m) { return m.kisim === item.kisim && m.madde_no === item.madde; }) : null;
    var baslik = madde ? madde.baslik : 'K\u0131s\u0131m ' + item.kisim + ', Madde ' + item.madde;
    // 'arama' alanını searchQuery olarak gönder — maddenin tam o yerine scroll + highlight
    var searchQ = (item.arama || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return '<div class="ah-item" onclick="openMadde(' + item.kisim + ',' + item.madde + ',false,\'' + searchQ + '\')" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;"><div style="font-family:Amiri,serif;font-size:0.95rem;line-height:1.8;color:var(--text);margin-bottom:8px;">' + item.metin + '</div><div style="font-size:0.8rem;color:var(--text-muted);">\u{1F4D6} ' + baslik + ' \u2014 <span style="color:var(--primary)">Maddenin bu yerine git \u2192</span></div></div>';
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

// Fevâid'den gelen sahislar count
document.addEventListener('DOMContentLoaded', function() {
  if (window.sahislarData) {
    var el = document.getElementById('fevaid-count-sahislar');
    if (el) el.textContent = window.sahislarData.length + ' şahıs';
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

function getAudioPagesForMadde(madde) {
  if (!window.audioMap) return [];
  var start = madde.sayfa_no;
  var end = madde.sayfa_bitis || madde.sayfa_no;
  var pages = [];
  for (var p = start; p <= end; p++) {
    if (window.audioMap[p]) {
      pages.push({ page: p, path: window.audioMap[p] });
    }
  }
  return pages;
}

function initAudioForMadde(madde) {
  audioState.madde = madde;
  audioState.pages = getAudioPagesForMadde(madde);
  audioState.currentIdx = 0;
  audioState.playing = false;

  var btn = document.getElementById('audio-btn');
  var bar = document.getElementById('audio-player-bar');

  if (audioState.pages.length === 0) {
    if (btn) btn.style.display = 'none';
    if (bar) bar.style.display = 'none';
    return;
  }

  if (btn) {
    btn.style.display = 'flex';
    btn.innerHTML = '&#9654;';
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

  var label = document.getElementById('audio-page-label');
  if (label) label.textContent = 'Sayfa ' + page.page + ' (' + (idx + 1) + '/' + audioState.pages.length + ')';
}

function playAudio() {
  var audio = document.getElementById('madde-audio');
  if (!audio || !audio.src) return;
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
      btn.innerHTML = '&#9646;&#9646;';
      btn.classList.add('playing');
    } else {
      btn.innerHTML = '&#9654;';
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

  audio.addEventListener('ended', function() {
    if (audioState.currentIdx < audioState.pages.length - 1) {
      audioNav(1); playAudio();
    } else if (continuousPlay) {
      navMadde(1);
      setTimeout(function() { toggleAudio(); }, 1500);
    } else {
      audioState.playing = false; updateAudioUI();
    }
  });
});

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

// ===== OKUMA PLANI =====
function getPlan() {
  try { return JSON.parse(localStorage.getItem('ilmihal-plan') || 'null'); } catch(e) { return null; }
}

function getMaddeSayfa(m) {
  var s = m.sayfa_no;
  var e = m.sayfa_bitis || s;
  if (e < s) e = s;
  return Math.max(1, e - s + 1);
}

function startPlan(gun) {
  if (!window.tocData) return;
  // Toplam sayfa sayısını hesapla, günlere sayfa bazlı dengeli dağıt
  var totalPages = 0;
  window.tocData.forEach(function(m) { totalPages += getMaddeSayfa(m); });
  var pagesPerDay = Math.ceil(totalPages / gun);

  // Maddeleri günlere dağıt
  var days = [];
  var currentDay = [];
  var currentPages = 0;
  window.tocData.forEach(function(m, i) {
    var p = getMaddeSayfa(m);
    currentDay.push(i);
    currentPages += p;
    if (currentPages >= pagesPerDay) {
      days.push(currentDay);
      currentDay = [];
      currentPages = 0;
    }
  });
  if (currentDay.length > 0) days.push(currentDay);

  var plan = {
    gun: gun,
    pagesPerDay: pagesPerDay,
    days: days,
    startDate: new Date().toISOString().slice(0, 10),
    completed: []
  };
  localStorage.setItem('ilmihal-plan', JSON.stringify(plan));
  renderPlan();
}

function resetPlan() {
  localStorage.removeItem('ilmihal-plan');
  document.getElementById('plan-secim').style.display = 'grid';
  document.getElementById('plan-aktif').style.display = 'none';
}

function renderPlan() {
  var plan = getPlan();
  if (!plan || !window.tocData) {
    var secim = document.getElementById('plan-secim');
    if (secim) secim.style.display = 'grid';
    return;
  }

  // Eski format (perDay) varsa yeni formata çevir
  if (plan.perDay && !plan.days) {
    resetPlan();
    startPlan(plan.gun);
    return;
  }

  document.getElementById('plan-secim').style.display = 'none';
  document.getElementById('plan-aktif').style.display = 'block';

  var baslik = document.getElementById('plan-baslik');
  if (baslik) baslik.textContent = plan.gun + ' Günlük Okuma Planı (günde ~' + plan.pagesPerDay + ' sayfa)';

  // Kaçıncı gün?
  var start = new Date(plan.startDate);
  var today = new Date();
  var dayNum = Math.floor((today - start) / 86400000);
  if (dayNum < 0) dayNum = 0;
  if (dayNum >= plan.days.length) dayNum = plan.days.length - 1;

  // İlerleme
  var completed = plan.completed.length;
  var total = window.tocData.length;
  var pct = Math.round((completed / total) * 100);
  var bar = document.getElementById('plan-bar');
  if (bar) bar.style.width = pct + '%';
  var text = document.getElementById('plan-progress-text');
  if (text) text.textContent = completed + '/' + total + ' madde (%' + pct + ')';

  // Bugün okunacaklar
  var todayIndices = plan.days[dayNum] || [];
  var bugunEl = document.getElementById('plan-bugun');
  if (bugunEl && window.tocData) {
    var kisimLabels = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
    var html = '<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">' + (dayNum + 1) + '. gün — ' + todayIndices.length + ' madde</p>';
    todayIndices.forEach(function(idx) {
      if (idx >= window.tocData.length) return;
      var m = window.tocData[idx];
      var key = m.kisim + '/' + m.madde_no;
      var done = plan.completed.indexOf(key) !== -1;
      var sayfa = getMaddeSayfa(m);
      html += '<div class="plan-madde-item ' + (done ? 'plan-done' : '') + '" onclick="planMaddeOku(' + m.kisim + ',' + m.madde_no + ')"><span class="plan-check">' + (done ? '✓' : '○') + '</span><span class="plan-madde-title">' + escapeHtml(m.baslik) + '</span><span class="plan-madde-meta">' + kisimLabels[m.kisim] + ' · ' + sayfa + ' sayfa</span></div>';
    });
    if (completed >= total) {
      html = '<p style="text-align:center;color:var(--primary);font-size:1.1rem;padding:24px;">Tebrikler! Plan\u0131 tamamlad\u0131n\u0131z!</p>';
    }
    bugunEl.innerHTML = html;
  }
}

function planMaddeOku(kisim, maddeNo) {
  var plan = getPlan();
  if (plan) {
    var key = kisim + '/' + maddeNo;
    if (plan.completed.indexOf(key) === -1) {
      plan.completed.push(key);
      localStorage.setItem('ilmihal-plan', JSON.stringify(plan));
    }
  }
  openMadde(kisim, maddeNo);
}

// navigateTo override'a okuma planı ekle
var _prevNavTo = navigateTo;
navigateTo = function(page, fromRoute) {
  _prevNavTo(page, fromRoute);
  if (page === 'okuma-plani') { document.getElementById('page-okuma-plani')?.classList.add('active'); renderPlan(); }
};

// ===== SES HIZ KONTROLÜ =====
var audioSpeed = 1;
function cycleAudioSpeed() {
  var speeds = [0.75, 1, 1.25, 1.5, 2];
  var idx = speeds.indexOf(audioSpeed);
  audioSpeed = speeds[(idx + 1) % speeds.length];
  var audio = document.getElementById('madde-audio');
  if (audio) audio.playbackRate = audioSpeed;
  var btn = document.getElementById('audio-speed-btn');
  if (btn) btn.textContent = audioSpeed + 'x';
}

// ===== UYKU ZAMANLAYICI =====
var sleepTimer = null;
function setSleepTimer(minutes) {
  if (sleepTimer) clearTimeout(sleepTimer);
  if (minutes === 0) {
    var btn = document.getElementById('sleep-btn');
    if (btn) { btn.textContent = '🌙'; btn.title = 'Uyku zamanlayıcı'; }
    return;
  }
  sleepTimer = setTimeout(function() {
    pauseAudio();
    sleepTimer = null;
    var btn = document.getElementById('sleep-btn');
    if (btn) { btn.textContent = '🌙'; btn.title = 'Uyku zamanlayıcı'; }
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
}

// initAudioForMadde'e mediaSession + restore ekle
var _origInitAudio = initAudioForMadde;
initAudioForMadde = function(madde) {
  _origInitAudio(madde);
  updateMediaSession();
  restoreAudioPosition();
};

// ===== TAM EKRAN OKUMA MODU =====
function toggleFullscreenRead() {
  var overlay = document.getElementById('madde-detay');
  if (!overlay) return;
  overlay.classList.toggle('fullscreen-mode');
  var btn = document.getElementById('fullscreen-btn');
  if (btn) {
    btn.innerHTML = overlay.classList.contains('fullscreen-mode') ? '⊠' : '⊡';
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
  el.innerHTML = '<div class="celebration-content"><div class="celebration-icon">🎉</div><h3>Tebrikler!</h3><p>Bugünkü okuma hedefinizi tamamladınız.</p><button type="button" class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Devam Et</button></div>';
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

// İlk ziyarette splash göster
if (!sessionStorage.getItem('ilmihal-splash-shown')) {
  sessionStorage.setItem('ilmihal-splash-shown', '1');
  document.addEventListener('DOMContentLoaded', showSplash);
}

// ===== FIKIH KARŞILAŞTIRMA TABLOLARI =====
var fikihActiveFilter = 'all';
function filterFikih(kat) {
  fikihActiveFilter = kat;
  document.querySelectorAll('.fikih-toolbar .tablo-filter-btn').forEach(function(b) {
    b.classList.toggle('active', (b.textContent === 'Tümü' && kat === 'all') || b.getAttribute('onclick')?.includes("'" + kat + "'"));
  });
  renderFikihKarsilastirma();
}

function renderFikihKarsilastirma() {
  var list = document.getElementById('fikih-list');
  if (!list || !window.fikihKarsilastirma) return;
  var data = window.fikihKarsilastirma;
  if (fikihActiveFilter !== 'all') {
    data = data.filter(function(d) { return d.kategori === fikihActiveFilter; });
  }
  list.innerHTML = data.map(function(item) {
    var html = '<div class="fikih-card">';
    html += '<h3 class="fikih-baslik">' + escapeHtml(item.baslik) + '</h3>';
    html += '<p class="fikih-aciklama">' + escapeHtml(item.aciklama) + '</p>';
    html += '<div class="fikih-grid">';
    var mezhepler = [
      {key:'hanefi', label:'Hanefî', color:'#1a6b4e'},
      {key:'safii', label:'Şâfiî', color:'#4a7c59'},
      {key:'maliki', label:'Mâlikî', color:'#6b5b3e'},
      {key:'hanbeli', label:'Hanbelî', color:'#5b4a6b'}
    ];
    mezhepler.forEach(function(m) {
      html += '<div class="fikih-mezhep">';
      html += '<div class="fikih-mezhep-baslik" style="background:' + m.color + '">' + m.label + '</div>';
      html += '<div class="fikih-mezhep-icerik">' + escapeHtml(item.mezhepler[m.key]) + '</div>';
      html += '</div>';
    });
    html += '</div>';
    if (item.kaynak) {
      html += '<div class="fikih-kaynak">' + escapeHtml(item.kaynak);
      if (item.ilgiliMadde) {
        html += ' · <a href="#" onclick="openMadde(' + item.ilgiliMadde.kisim + ',' + item.ilgiliMadde.maddeNo + ');return false">Maddeyi Aç</a>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }).join('');

  updateSeoMeta(
    'Fıkıh Karşılaştırma Tabloları - Se\'âdet-i Ebediyye',
    'Dört mezhebe göre temel ibâdet ve muâmelât hükümlerinin karşılaştırması. Hanefî, Şâfiî, Mâlikî ve Hanbelî mezheplerinin görüşleri.',
    'https://ilmihal.org/fikih-karsilastirma'
  );
}

// ===== SAYFA SEO META GÜNCELLEMELERİ =====
var pageSeoMap = {
  'anasayfa': ["Se'âdet-i Ebediyye - İnteraktif İlmihâl", "Se'âdet-i Ebediyye kitabının tamamı, aranabilir 241 madde, 4400+ terimlik dini lügat, 1019 âlim biyografisi ve interaktif silsile atlası."],
  'sozluk': ["Dini Lügat (4400+ Terim) - Se'âdet-i Ebediyye", "Akâid, ibâdet, tasavvuf, fıkıh ve daha birçok kategoride 4400+ dini terimin Türkçe ve Osmanlıca karşılıkları."],
  'sahislar': ["İslâm Âlimleri (1019 Biyografi) - Se'âdet-i Ebediyye", "Kitapta adı geçen 1019 İslâm âlimi ve velîsinin hâl tercemeleri, eserleri ve yaşadıkları dönemler."],
  'fevaid': ["Fevâid - Se'âdet-i Ebediyye", "Tablolar, diyagramlar, fıkıh karşılaştırmaları, dini lügat, âlim biyografileri ve daha fazlası."],
  'arama': ["Arama - Se'âdet-i Ebediyye", "Se'âdet-i Ebediyye kitabının 241 maddesinde tam metin arama. Yapay zeka destekli soru-cevap."],
  'quiz': ["Bilgi Testi - Se'âdet-i Ebediyye", "İmân, namaz, oruç, zekât, hac ve ahlâk konularında bilgilerinizi test edin."],
  'ayet-hadis': ["Âyet-i Kerîme ve Hadîs-i Şerîf İndeksi - Se'âdet-i Ebediyye", "Kitapta geçen 232 âyet-i kerîme ve 231 hadîs-i şerîfin referanslı listesi."],
  'hakkinda': ["Hakkında - Se'âdet-i Ebediyye İnteraktif İlmihâl", "Se'âdet-i Ebediyye interaktif ilmihâl platformu hakkında bilgi."],
  'gunun-bilgisi': ["Günün Bilgisi - Se'âdet-i Ebediyye", "Her gün kitaptan bir hadîs-i şerîf veya âyet-i kerîme. Paylaşılabilir görsel kartlar."],
  'rehberler': ["Konuya Göre Rehberler - Se'âdet-i Ebediyye", "Namaz, oruç, hac, zekât, iman ve ahlâk konularında adım adım rehberler."]
};

// navigateTo'da SEO meta güncelle
var _origNavForSeo = navigateTo;
navigateTo = function(page, fromRoute) {
  _origNavForSeo(page, fromRoute);
  var seo = pageSeoMap[page];
  if (seo) updateSeoMeta(seo[0], seo[1], 'https://ilmihal.org/' + (page === 'anasayfa' ? '' : page));
};

// ===== GÜNÜN BİLGİSİ =====
function getGununBilgisiIdx() {
  var daysSinceEpoch = Math.floor(Date.now() / 86400000);
  return daysSinceEpoch;
}

function getGununBilgisi(offset) {
  if (!window.ayetHadisData) return null;
  var all = [];
  if (window.ayetHadisData.hadisler) {
    window.ayetHadisData.hadisler.forEach(function(h) {
      if (h.metin && h.metin.length > 20 && h.metin.length < 300) {
        all.push({ tip: 'hadis', metin: h.metin, kisim: h.kisim, madde: h.madde });
      }
    });
  }
  if (window.ayetHadisData.ayetler) {
    window.ayetHadisData.ayetler.forEach(function(a) {
      if (a.metin && a.metin.length > 20 && a.metin.length < 300) {
        all.push({ tip: 'ayet', metin: a.metin, kisim: a.kisim, madde: a.madde });
      }
    });
  }
  if (all.length === 0) return null;
  var idx = (getGununBilgisiIdx() + (offset || 0)) % all.length;
  if (idx < 0) idx += all.length;
  return all[idx];
}

function renderGununBilgisi() {
  var card = document.getElementById('gunun-bilgisi-card');
  var paylasim = document.getElementById('gunun-bilgisi-paylasim');
  if (!card) return;

  var bilgi = getGununBilgisi(0);
  if (!bilgi) { card.innerHTML = '<p>Veri yükleniyor...</p>'; return; }

  var tipLabel = bilgi.tip === 'hadis' ? 'Hadîs-i Şerîf' : 'Âyet-i Kerîme';
  card.innerHTML = '<div class="gb-tip">' + tipLabel + '</div>' +
    '<div class="gb-metin">' + escapeHtml(bilgi.metin) + '</div>' +
    '<div class="gb-kaynak">Se\'âdet-i Ebediyye, Kısım ' + bilgi.kisim + ', Madde ' + bilgi.madde +
    ' · <a href="#" onclick="openMadde(' + bilgi.kisim + ',' + bilgi.madde + ');return false">Maddeyi Aç</a></div>';

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
      html += '<div class="gb-onceki"><span class="gb-onceki-tarih">' + gun + '</span><span class="gb-onceki-metin">' + escapeHtml(b.metin.substring(0, 100)) + '...</span></div>';
    }
    onceki.innerHTML = html;
  }
}

function paylasGununBilgisi() {
  var bilgi = getGununBilgisi(0);
  if (!bilgi) return;
  var text = bilgi.metin + '\n\n— Se\'âdet-i Ebediyye, K' + bilgi.kisim + '/M' + bilgi.madde + '\nhttps://ilmihal.org/gunun-bilgisi';
  if (navigator.share) {
    navigator.share({ title: 'Günün Bilgisi - ilmihal.org', text: text }).catch(function(){});
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
  ctx.font = '28px sans-serif';
  ctx.fillText(bilgi.tip === 'hadis' ? 'Hadis-i Serif' : 'Ayet-i Kerime', 80, 180);

  // Metin (word wrap)
  ctx.fillStyle = '#ffffff';
  ctx.font = '36px serif';
  var words = bilgi.metin.split(' ');
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
  ctx.fillText('Se\'adet-i Ebediyye, Kisim ' + bilgi.kisim + ', Madde ' + bilgi.madde, 80, 940);
  ctx.fillText('ilmihal.org', 80, 980);

  // İndir
  var link = document.createElement('a');
  link.download = 'gunun-bilgisi.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ===== PAYLAŞIM KARTI (Madde İçinden) =====
function maddePaylasimKarti(kisim, maddeNo) {
  var madde = window.maddelerData?.find(function(m) { return m.kisim === kisim && m.madde_no === maddeNo; });
  if (!madde) return;
  var canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 630;
  var ctx = canvas.getContext('2d');

  var grad = ctx.createLinearGradient(0, 0, 1200, 630);
  grad.addColorStop(0, '#0e4a35'); grad.addColorStop(1, '#1a6b4e');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1200, 630);

  ctx.fillStyle = '#c9a84c'; ctx.fillRect(60, 80, 120, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '24px serif';
  ctx.fillText("Se'adet-i Ebediyye", 60, 140);
  ctx.fillStyle = '#e8d48b'; ctx.font = 'bold 42px serif';

  var words = madde.baslik.split(' '); var lines = []; var line = '';
  words.forEach(function(w) { if ((line + ' ' + w).length > 40) { lines.push(line); line = w; } else { line = line ? line + ' ' + w : w; } });
  if (line) lines.push(line);
  lines.forEach(function(l, i) { ctx.fillText(l, 60, 220 + i * 56); });

  var kl = { 1: 'Birinci Kisim', 2: 'Ikinci Kisim', 3: 'Ucuncu Kisim' };
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '22px sans-serif';
  ctx.fillText(kl[madde.kisim] + ', Madde ' + madde.madde_no, 60, 520);
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '20px sans-serif';
  ctx.fillText('ilmihal.org', 60, 580);

  var link = document.createElement('a');
  link.download = 'madde-' + kisim + '-' + maddeNo + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function maddePaylasText(kisim, maddeNo) {
  var madde = window.maddelerData?.find(function(m) { return m.kisim === kisim && m.madde_no === maddeNo; });
  if (!madde) return;
  var text = madde.baslik + '\n\nSe\'adet-i Ebediyye, Kisim ' + kisim + ', Madde ' + maddeNo + '\nhttps://ilmihal.org/madde/' + kisim + '/' + maddeNo;
  if (navigator.share) {
    navigator.share({ title: madde.baslik, text: text, url: 'https://ilmihal.org/madde/' + kisim + '/' + maddeNo }).catch(function(){});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() { alert('Kopyalandi!'); });
  }
}

// ===== REHBERLER =====
var rehberDetayAcik = null;

function renderRehberler() {
  var list = document.getElementById('rehber-list');
  var detay = document.getElementById('rehber-detay');
  if (!list || !window.rehberlerData) return;

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
      '<span class="fevaid-sec-count">' + r.bolumler.length + ' bolum, ' + toplamMadde + ' madde</span>' +
      '</div>';
  }).join('');
}

function openRehber(id) {
  rehberDetayAcik = id;
  renderRehberler();
}

function closeRehber() {
  rehberDetayAcik = null;
  renderRehberler();
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
      html += '<a href="#" class="rehber-madde-item" onclick="openMadde(' + m.kisim + ',' + m.maddeNo + ');return false">' +
        '<span class="rehber-madde-no">K' + m.kisim + ' / M' + m.maddeNo + '</span>' +
        '<span class="rehber-madde-not">' + escapeHtml(m.not) + '</span>' +
        '</a>';
    });
    html += '</div></div>';
  });

  detay.innerHTML = html;
}

// ===== PODCAST MODU (Sürekli Dinleme Geliştirmesi) =====
var podcastMode = false;
function togglePodcastMode() {
  podcastMode = !podcastMode;
  var btn = document.getElementById('podcast-btn');
  if (btn) {
    btn.style.opacity = podcastMode ? '1' : '0.5';
    btn.title = podcastMode ? 'Podcast modu: ACIK - Maddeler arasi durmadan devam eder' : 'Podcast modu: KAPALI';
  }
  // continuousPlay'i de aktifle
  if (typeof continuousPlay !== 'undefined') {
    continuousPlay = podcastMode;
    var cBtn = document.getElementById('continuous-btn');
    if (cBtn) cBtn.style.opacity = podcastMode ? '1' : '0.5';
  }
}

