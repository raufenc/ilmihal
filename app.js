// ===== Se'âdet-i Ebediyye - İnteraktif İlmihâl =====
const PDF_URL = 'https://www.hakikatkitabevi.net/downloads/001.pdf';

// ===== URL ROUTING =====
let routingSilent = false;

function updateHash(hash) {
  routingSilent = true;
  location.hash = hash;
  setTimeout(() => { routingSilent = false; }, 50);
}

function handleRoute() {
  if (routingSilent) return;
  const hash = (location.hash || '#anasayfa').slice(1);
  const parts = hash.split('/');
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

  const validPages = ['anasayfa','icerik','tablolar','sozluk','arama','sahislar','hakkinda'];
  if (validPages.includes(route)) {
    navigateTo(route, true);
  } else {
    navigateTo('anasayfa', true);
  }
}

window.addEventListener('hashchange', handleRoute);

// ===== DARK MODE =====
function initDarkMode() {
  const saved = localStorage.getItem('ilmihal-theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('ilmihal-theme', isDark ? 'dark' : 'light');
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
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  if (page === 'sozluk' && !sozlukLoaded) loadSozluk();
  if (page === 'tablolar' && !tablolarLoaded) loadTablolar();
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
    const { variants: sVariants } = expandSearchQuery(rawSearch);
    filtered = filtered.filter(m => {
      const nb = normalizeSearch(m.baslik || '');
      return sVariants.some(v => nb.includes(v));
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

async function openMadde(kisim, maddeNo, fromRoute) {
  const madde = window.maddelerData?.find(m => m.kisim === kisim && m.madde_no === maddeNo);
  if (!madde) return;

  const kisimLabels = { 1: 'Birinci K\u0131s\u0131m', 2: '\u0130kinci K\u0131s\u0131m', 3: '\u00dc\u00e7\u00fcnc\u00fc K\u0131s\u0131m' };
  const body = document.getElementById('madde-body');

  // Update URL
  if (!fromRoute) updateHash(`madde/${kisim}/${maddeNo}`);

  // Show modal immediately with loading state
  document.getElementById('madde-detay').style.display = 'flex';
  document.body.style.overflow = 'hidden';

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

  // Zor kelimeleri işaretle
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
    ${getRelatedSahislar(kisim, maddeNo)}
    ${getRelatedTables(kisim, maddeNo)}
  `;

  // Tooltip events
  body.querySelectorAll('.zor-kelime').forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

// ===== ÇAPRAZ REFERANS =====
function getRelatedMaddes(kisim, maddeNo) {
  if (!window.crossRefData) return '';
  const key = `${kisim}/${maddeNo}`;
  const refs = window.crossRefData[key];
  if (!refs || refs.length === 0) return '';

  const kisimLabels = { 1: 'I', 2: 'II', 3: 'III' };
  const items = refs.map(ref => {
    const m = window.tocData?.find(t => t.kisim === ref.kisim && t.madde_no === ref.madde_no);
    if (!m) return '';
    return `<a href="#" onclick="openMadde(${ref.kisim}, ${ref.madde_no});return false" class="related-madde-link">
      <span class="rm-badge">${kisimLabels[ref.kisim]}-${ref.madde_no}</span>
      <span class="rm-title">${m.baslik}</span>
      ${ref.neden ? `<span class="rm-neden">${ref.neden}</span>` : ''}
    </a>`;
  }).filter(Boolean).join('');

  if (!items) return '';
  return `<div class="related-maddeler">
    <div class="related-maddeler-title">\u0130lgili Maddeler</div>
    ${items}
  </div>`;
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
    const { variants: szVariants } = expandSearchQuery(rawSozlukSearch);
    filtered = filtered.filter(s => {
      const nk = normalizeSearch(s.kelime || '');
      const na = normalizeSearch(s.anlam || '');
      const altMatch = s.alternatif && s.alternatif.some(a => szVariants.some(v => normalizeSearch(a).includes(v)));
      return szVariants.some(v => nk.includes(v) || na.includes(v)) || altMatch;
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

// ===== TABLOLAR =====
let tablolarLoaded = false;

const tabloKatLabels = {
  itikat: '\u0130man ve \u0130tikat', temizlik: 'Temizlik', namaz: 'Namaz',
  oruc: 'Oru\u00e7', zekat: 'Zek\u00e2t', hac: 'Hac ve Umre',
  aile: 'Aile Hukuku', tasavvuf: 'Tasavvuf', genel: 'Di\u011fer Konular'
};
const tabloKatOrder = ['itikat','temizlik','namaz','oruc','zekat','hac','aile','tasavvuf','genel'];

let tabloActiveKat = 'all';
let tabloSearchText = '';

function loadTablolar(filterKat, filterText) {
  tablolarLoaded = true;
  const grid = document.getElementById('tablolar-grid');
  const countEl = document.getElementById('tablo-count');
  if (!window.tablolarData) { grid.innerHTML = '<div class="loading">Tablolar y\u00fckleniyor...</div>'; return; }

  const katFilter = filterKat || tabloActiveKat || 'all';
  const searchText = (filterText !== undefined ? filterText : tabloSearchText || '').toLowerCase();
  tabloActiveKat = katFilter;
  tabloSearchText = searchText;

  let allItems = window.tablolarData.filter(t => t.id !== 'konu_haritasi');
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
  return '<p>Tablo verisi y\u00fckleniyor...</p>';
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

// Bu kitaba özgü özel varyantlar — algoritmik kuralların yakalayamadığı a/e alternasyonu vb.
const OTTOMAN_MANUAL = {
  'namaz':    'nemaz',    // nemâz — en kritik varyant
  'niyet':    'niyyet',   // niyyet — şedde farkı
  'vasiyet':  'vasiyyet', // vasiyyet
  'tasavvuf': 'tesavvuf', // tesavvuf
  'mucize':   'mu cize',  // mu'cize → normalize → "mu cize"
  'salavat':  'salat',    // salât
  'tövbe':    'tevbe',    // tevbe (farklı kök sesli)
  'sakiyn':   'sakin',    // normalize sonrası ı→i zaten; bu elle gerekmez
};

// Tek kelime için tüm olası varyantları üret (algoritmik + manuel)
function wordVariants(word) {
  const vars = new Set([word]);
  const consonants = new Set('bcdfghjklmnpqrstvwxyz');
  const vowels = 'aeiou';

  // Manuel varyantlar
  if (OTTOMAN_MANUAL[word]) vars.add(OTTOMAN_MANUAL[word]);
  Object.entries(OTTOMAN_MANUAL).forEach(([mod, ott]) => {
    if (word === ott) vars.add(mod);
  });

  if (word.length >= 4) {
    // Kural 1: Son -p ↔ -b (kitâb/kitap, vâcib/vacip, sevâb/sevap, mezheb/mezhep…)
    if (word.endsWith('p')) vars.add(word.slice(0, -1) + 'b');
    if (word.endsWith('b')) vars.add(word.slice(0, -1) + 'p');
    // Kural 2: Son -t ↔ -d (cihâd/cihat, îcâd/icat, hamd/hamet…)
    if (word.endsWith('t')) vars.add(word.slice(0, -1) + 'd');
    if (word.endsWith('d')) vars.add(word.slice(0, -1) + 't');
  }

  // Kural 3: Ünsüz yığılması — kitapta bazı kelimeler sesli içermez
  // gusl↔gusul, vitr↔vitir, zikr↔zikir, sabr↔sabır, nasr↔nasır
  if (word.length >= 3) {
    const last = word[word.length - 1];
    const prev = word[word.length - 2];
    if (consonants.has(last) && consonants.has(prev)) {
      // Ünsüz yığılmalı form (gusl) → sesli eklenmiş form (gusul)
      let lastVowel = 'i';
      for (let i = word.length - 3; i >= 0; i--) {
        if (vowels.includes(word[i])) { lastVowel = word[i]; break; }
      }
      const ins = { a: 'u', e: 'i', i: 'i', o: 'u', u: 'u' }[lastVowel] || 'i';
      vars.add(word.slice(0, -1) + ins + last);
    }
    // Ters: sesli eklenmiş form (gusul) → ünsüz yığılmalı (gusl, vitr, zikr)
    // Osmanlıca'da kısa sesli (u/i) ünsüz yığılmasını kırmak için eklenmiştir
    // Bu yüzden sadece son hece -ul/-il/-ir/-ur/-ıl biçimindeyse uygula
    const penultimate = word[word.length - 2];
    if (word.length >= 5 && 'ui'.includes(penultimate) && consonants.has(last)) {
      const without = word.slice(0, -2) + last;
      // Sonuç iki ünsüzle bitmeli (gusl: s+l ✓, vitr: t+r ✓)
      if (without.length >= 3 && consonants.has(without[without.length - 2])) {
        vars.add(without);
      }
    }
  }

  // Kural 4: Şedde — niyyet/niyet, vasiyyet/vasiyet, müşekkel/müşekel
  // Çift ünsüz → tek ünsüz
  const dedouble = word.replace(/(.)\1/g, '$1');
  if (dedouble !== word) vars.add(dedouble);
  // Tek → çift (yalnızca y ve s için, diğerleri çok gürültülü olur)
  ['y', 's'].forEach(c => {
    const re = new RegExp(`(?<!${c})${c}(?!${c})`, 'g');
    const doubled = word.replace(re, c + c);
    if (doubled !== word) vars.add(doubled);
  });

  return Array.from(vars);
}

// Sorguyu genişlet: normalize et + her kelime için varyantlar üret
function expandSearchQuery(rawQuery) {
  const normalized = normalizeSearch(rawQuery);
  const words = normalized.split(/\s+/);

  const wordVarLists = words.map(w => wordVariants(w));

  const variantSet = new Set([normalized]);
  if (words.length <= 3) {
    // Kısa sorgularda tüm kombinasyonlar (patlama önlemek için kelime başına max 5 varyant)
    function combine(idx, current) {
      if (idx === words.length) { variantSet.add(current.join(' ')); return; }
      wordVarLists[idx].slice(0, 5).forEach(v => combine(idx + 1, [...current, v]));
    }
    combine(0, []);
  } else {
    // Uzun sorgularda her kelimeyi sırayla değiştir
    wordVarLists.forEach((vars, i) => {
      vars.forEach(v => {
        const w = [...words]; w[i] = v;
        variantSet.add(w.join(' '));
      });
    });
  }

  const variants = Array.from(variantSet);
  const altVariants = variants.filter(v => v !== normalized);
  return { normalized, variants, altVariants };
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

  // Sorguyu normalize et ve varyantlar üret
  const { normalized: normQuery, variants, altVariants } = expandSearchQuery(rawQuery);

  const kisimLabels = { 1: 'Birinci K\u0131s\u0131m', 2: '\u0130kinci K\u0131s\u0131m', 3: '\u00dc\u00e7\u00fcnc\u00fc K\u0131s\u0131m' };
  const matches = [];

  window.maddelerData.forEach(m => {
    const fullText = kisimTextsCache[m.kisim]?.[String(m.madde_no)] || m.metin || '';
    // Hem metin hem başlık normalize edilmiş formda aranır
    const normText = normalizeSearch(fullText);
    const normBaslik = normalizeSearch(m.baslik || '');

    // İlk eşleşen varyantı bul
    let matchedVariant = null;
    let idx = -1;
    for (const v of variants) {
      const i = normText.indexOf(v);
      if (i !== -1) { idx = i; matchedVariant = v; break; }
    }
    const inTitle = variants.some(v => normBaslik.includes(v));

    if (idx !== -1 || inTitle) {
      let context = '';
      if (idx !== -1) {
        // Konumlar 1-to-1 normalize edildiğinden orijinal metinde aynı konumu kullanabiliriz
        const termLen = matchedVariant.length;
        const start = Math.max(0, idx - 80);
        const end = Math.min(fullText.length, idx + termLen + 80);
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
        matchedVariant: matchedVariant,
        inTitle: inTitle
      });
    }
  });

  matches.sort((a, b) => (b.inTitle ? 1 : 0) - (a.inTitle ? 1 : 0));

  // Varyant uyarısı: kullanıcı farklı yazım kullandıysa bildir
  let variantNote = '';
  if (altVariants.length > 0) {
    const altList = altVariants.map(v => `<strong>${v}</strong>`).join(', ');
    variantNote = `<p style="color:var(--accent);font-size:0.88em;margin-bottom:12px;">
      "\u200b${escapeHtml(rawQuery)}" i\u00e7in ayn\u0131 zamanda ${altList} olarak da arand\u0131.</p>`;
  }

  let html = variantNote + `<p style="color:var(--text-muted);margin-bottom:16px;">${matches.length} sonu\u00e7 bulundu</p>`;

  matches.slice(0, 50).forEach(m => {
    // Normalize edilmiş bağlamda eşleşen konumları bul, orijinal metinde işaretle
    // (normalizasyon 1-to-1 olduğu için pozisyonlar birebir uyuşur)
    const normCtx = normalizeSearch(m.context);
    let highlighted = m.context;
    if (normCtx) {
      // Tüm varyant eşleşmelerini bul ve sırala
      const positions = [];
      for (const v of variants) {
        let from = 0;
        while (true) {
          const i = normCtx.indexOf(v, from);
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
        <h4>${m.baslik}</h4>
        <p>${highlighted || '(Ba\u015fl\u0131kta e\u015fle\u015fme)'}</p>
        <div class="result-meta">${kisimLabels[m.kisim]}, Madde ${m.madde_no} \u00B7 ${sayfaLink(m.sayfa_no, 'Sayfa ' + m.sayfa_no)}</div>
      </div>
    `;
  });

  results.innerHTML = html;
}

document.getElementById('full-search')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doFullSearch();
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (window.tocData) {
    console.log(`Y\u00fcklendi: ${window.tocData.length} madde, ${window.sozlukData?.length || 0} s\u00f6zl\u00fck kelimesi, ${window.tablolarData?.length || 0} tablo${window.sahislarData ? ', ' + window.sahislarData.length + ' \u015fah\u0131s' : ''}`);
  }
  // Arka planda tüm metinleri önceden yükle
  setTimeout(() => {
    loadKisimTexts(1);
    loadKisimTexts(2);
    loadKisimTexts(3);
  }, 500);

  // Handle initial route
  if (location.hash && location.hash !== '#' && location.hash !== '#anasayfa') {
    handleRoute();
  }
});
