// ===== Se'âdet-i Ebediyye - İnteraktif İlmihâl =====
const PDF_URL = 'https://www.hakikatkitabevi.net/downloads/001.pdf';

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

// Madde detayı içindeki sayfa linki: PDF gösterir
function sayfaLinkPdf(sayfa, label) {
  if (!label) label = 'Sayfa ' + sayfa;
  return `<a href="#" onclick="showPdfPage(${sayfa});return false" class="sayfa-link" title="PDF sayfasını göster">${label}</a>`;
}

function openSayfa(sayfa) {
  const madde = window.tocData?.find(m =>
    m.sayfa_no <= sayfa && (m.sayfa_bitis || m.sayfa_no) >= sayfa
  );
  if (madde) {
    openMadde(madde.kisim, madde.madde_no);
  }
}

function showPdfPage(sayfa) {
  // Mevcut PDF viewer varsa kapat
  let viewer = document.getElementById('pdf-viewer');
  if (viewer) viewer.remove();

  viewer = document.createElement('div');
  viewer.id = 'pdf-viewer';
  viewer.innerHTML = `
    <div class="pdf-viewer-header">
      <span>Sayfa ${sayfa}</span>
      <div class="pdf-nav">
        <button onclick="changePdfPage(-1)">◀</button>
        <span id="pdf-page-num">${sayfa}</span>
        <button onclick="changePdfPage(1)">▶</button>
      </div>
      <button onclick="document.getElementById('pdf-viewer').remove()" class="pdf-close">✕</button>
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

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  const navBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');
  // Close mobile menu
  document.querySelector('.main-nav')?.classList.remove('open');
  window.scrollTo(0, 0);

  // Lazy load content
  if (page === 'icerik' && !icerikLoaded) loadIcerik();
  if (page === 'sozluk' && !sozlukLoaded) loadSozluk();
  if (page === 'tablolar' && !tablolarLoaded) loadTablolar();
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
  const searchText = (filterText || document.getElementById('icerik-search')?.value || '').toLowerCase();

  let filtered = window.tocData;
  if (kisimFilter !== 'all') filtered = filtered.filter(m => m.kisim == kisimFilter);
  if (searchText) filtered = filtered.filter(m => m.baslik.toLowerCase().includes(searchText));

  const kisimLabels = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
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
          <div class="madde-meta">${kisimLabels[m.kisim]}${m.mektup_ref ? ' · Mektup: ' + m.mektup_ref : ''}</div>
        </div>
        <div class="madde-sayfa">${sayfaLink(m.sayfa_no)}</div>
      </div>
    `;
  });

  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Sonuç bulunamadı.</p>';
}

document.getElementById('kisim-filter')?.addEventListener('change', () => loadIcerik());
document.getElementById('icerik-search')?.addEventListener('input', () => loadIcerik());

// Kısım filtresi shortcut
function showKisim(k) {
  navigateTo('icerik');
  document.getElementById('kisim-filter').value = k;
  loadIcerik();
}

// Kategori filtresi
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

  // Konu haritasından filtrele
  if (window.tablolarData) {
    const konuHaritasi = window.tablolarData.find(t => t.id === 'konu_haritasi');
    if (konuHaritasi && konuHaritasi.veriler) {
      const kategori = konuHaritasi.veriler.find(v => v.id === cat);
      if (kategori) {
        const maddeler = kategori.maddeler || [];
        const list = document.getElementById('icerik-list');
        const filtered = window.tocData.filter(m => {
          const key = `K${m.kisim}/M${m.madde_no}`;
          return maddeler.includes(key);
        });
        renderFilteredMaddeler(filtered);
        return;
      }
    }
  }

  // Fallback: search based
  const searchTerms = {
    'iman': 'îmân', 'temizlik': 'abdest', 'namaz': 'nemâz',
    'oruc': 'oruc', 'zekat': 'zekât', 'hac': 'hac',
    'ticaret': 'ticâret', 'aile': 'nikâh', 'ahlak': 'ahlâk', 'cenaze': 'cenâze'
  };
  document.getElementById('icerik-search').value = searchTerms[cat] || cat;
  loadIcerik();
}

function renderFilteredMaddeler(filtered) {
  const list = document.getElementById('icerik-list');
  const kisimLabels = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
  let html = '';
  filtered.forEach(m => {
    html += `
      <div class="madde-item" onclick="openMadde(${m.kisim}, ${m.madde_no})">
        <div class="madde-badge">${m.madde_no}</div>
        <div class="madde-info">
          <div class="madde-title">${m.baslik}</div>
          <div class="madde-meta">${kisimLabels[m.kisim]}${m.mektup_ref ? ' · Mektup: ' + m.mektup_ref : ''}</div>
        </div>
        <div class="madde-sayfa">${sayfaLink(m.sayfa_no)}</div>
      </div>
    `;
  });
  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Sonuç bulunamadı.</p>';
}

// ===== MADDE DETAY =====
// Cache for loaded kisim texts
const kisimTextsCache = {};

async function loadKisimTexts(kisim) {
  if (kisimTextsCache[kisim]) return kisimTextsCache[kisim];
  try {
    const resp = await fetch(`texts/kisim${kisim}.json`);
    const data = await resp.json();
    kisimTextsCache[kisim] = data;
    return data;
  } catch (e) {
    console.error(`Kısım ${kisim} metinleri yüklenemedi:`, e);
    return null;
  }
}

async function openMadde(kisim, maddeNo) {
  const madde = window.maddelerData?.find(m => m.kisim === kisim && m.madde_no === maddeNo);
  if (!madde) return;

  const kisimLabels = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
  const body = document.getElementById('madde-body');

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
    <div class="madde-text" style="text-align:center;padding:40px;color:var(--text-muted);">Metin yükleniyor...</div>
  `;

  // Load full text from kisim file
  const texts = await loadKisimTexts(kisim);
  let metin = texts?.[String(maddeNo)] || madde.metin || '(Metin bulunamadı)';

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
    ${getRelatedTables(kisim, maddeNo)}
  `;

  // Tooltip events
  body.querySelectorAll('.zor-kelime').forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

function getRelatedTables(kisim, maddeNo) {
  if (!window.tablolarData) return '';
  const ref = `K${kisim}/M${maddeNo}`;
  const related = window.tablolarData.filter(t => t.kaynak_madde === ref);
  if (related.length === 0) return '';
  const tipIcons = {tablo:'▦', liste:'▤', iki_liste:'⇄', flowchart:'▥', agac:'◈'};
  const items = related.map(t =>
    `<a href="#" onclick="navigateTo('tablolar');setTimeout(()=>{document.getElementById('tablo-${t.id}')?.scrollIntoView({behavior:'smooth'})},300);closeMadde();return false" class="related-tablo-link">
      <span class="rt-icon">${tipIcons[t.tip] || '▦'}</span>
      <span>${t.baslik}</span>
    </a>`
  ).join('');
  return `<div class="related-tablolar">
    <div class="related-tablolar-title">İlgili Tablo ve Diyagramlar</div>
    ${items}
  </div>`;
}

function closeMadde() {
  document.getElementById('madde-detay').style.display = 'none';
  document.body.style.overflow = '';
}

// ESC ile kapat
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMadde();
});

// Overlay dışına tıklayınca kapat
document.getElementById('madde-detay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('madde-detay')) closeMadde();
});

// ===== ZOR KELİME HIGHLIGHT =====
function highlightWords(text) {
  if (!window.sozlukData || window.sozlukData.length === 0) return escapeHtml(text);

  // Metni kelimelere ayır, her kelimeyi kontrol et
  const sozlukMap = new Map();
  window.sozlukData.forEach(entry => {
    sozlukMap.set(entry.kelime.toLowerCase(), entry);
  });

  // Metni paragraf ve satırlara ayırarak işle
  const escaped = escapeHtml(text);

  // Kelime sınırlarında böl, parçaları koru
  const parts = escaped.split(/(\s+)/);
  const usedWords = new Map(); // kelime -> kaç kez kullanıldı

  const result = parts.map(part => {
    if (/^\s+$/.test(part)) return part; // boşluk

    // Kelimeyi temizle (noktalama hariç)
    const clean = part.replace(/^[.,;:!?()\[\]"']+|[.,;:!?()\[\]"']+$/g, '');
    const lower = clean.toLowerCase();

    const entry = sozlukMap.get(lower);
    if (entry) {
      const count = usedWords.get(lower) || 0;
      if (count < 3) {
        usedWords.set(lower, count + 1);
        // Kelimeyi span ile sar, etrafındaki noktalamayı koru
        const prefix = part.substring(0, part.indexOf(clean));
        const suffix = part.substring(part.indexOf(clean) + clean.length);
        const safeAnlam = entry.anlam.replace(/["\u201C\u201D]/g, '&quot;').replace(/['\u2018\u2019]/g, '&#39;');
        const osmAttr = entry.osmanli ? ` data-osmanli="${entry.osmanli}"` : '';
        return `${prefix}<span class="zor-kelime" data-anlam="${safeAnlam}" data-kat="${entry.kategori}"${osmAttr}>${clean}</span>${suffix}`;
      }
    }
    return part;
  });

  return result.join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===== TOOLTIP =====
function showTooltip(e) {
  const el = e.target;
  const tooltip = document.getElementById('sozluk-tooltip');
  const anlam = el.dataset.anlam;
  if (!anlam) return;

  const osmanli = el.dataset.osmanli;
  if (osmanli) {
    tooltip.innerHTML = '<span class="tooltip-osmanli">' + osmanli + '</span>' + anlam;
  } else {
    tooltip.textContent = anlam;
  }
  tooltip.style.display = 'block';

  const rect = el.getBoundingClientRect();
  // Tooltip boyutunu ölç
  tooltip.style.visibility = 'hidden';
  tooltip.style.top = '0';
  tooltip.style.left = '0';
  const tipH = tooltip.offsetHeight;
  const tipW = tooltip.offsetWidth;
  tooltip.style.visibility = '';

  // Yatay: kelimeyi ortala, ekrandan taşmasın
  let left = rect.left + rect.width/2 - tipW/2;
  left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
  tooltip.style.left = left + 'px';

  // Dikey: yukarıda yer varsa yukarı, yoksa aşağı
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
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
  if (!window.sozlukData) { list.innerHTML = '<div class="loading">Sözlük yükleniyor...</div>'; return; }

  const katFilter = filterKat || 'all';
  const searchText = (filterText || document.getElementById('sozluk-search')?.value || '').toLowerCase();

  let filtered = window.sozlukData;
  if (katFilter !== 'all') filtered = filtered.filter(s => s.kategori === katFilter);
  if (searchText) filtered = filtered.filter(s =>
    s.kelime.toLowerCase().includes(searchText) || s.anlam.toLowerCase().includes(searchText)
  );

  // Alfabetik sırala
  filtered.sort((a, b) => a.kelime.localeCompare(b.kelime, 'tr'));

  const katLabels = {
    akaid: 'Akâid/Kelâm', ibadet: 'İbadet/Taharet', tasavvuf: 'Tasavvuf/Ahlâk',
    fikih: 'Fıkıh/Usûl', muamelat: 'Muâmelât/Ticaret', siyer: 'Siyer/Tarih',
    hadis: 'Hadis/Sünnet', kuran: "Kur'an/Tefsir", mezhepler: 'Mezhepler/Fırkalar',
    aile: 'Aile/Nikâh', dil: 'Dil/Edebiyat', miras: 'Miras/Ferâiz', osmanli: 'Osmanlı/Kurumlar'
  };
  let html = '';
  filtered.forEach(s => {
    const osmanli = s.osmanli ? `<div class="sozluk-osmanli">${s.osmanli}</div>` : '';
    const katLabel = katLabels[s.kategori] || s.kategori;
    html += `
      <div class="sozluk-item">
        <div class="sozluk-kelime-row">
          <div class="sozluk-kelime">${s.kelime}</div>
          ${osmanli}
        </div>
        <div class="sozluk-anlam">${s.anlam}</div>
        <span class="sozluk-kat kat-${s.kategori}">${katLabel}</span>
      </div>
    `;
  });

  list.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px;">Kelime bulunamadı.</p>';
  countEl.textContent = `${filtered.length} kelime gösteriliyor`;
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

// ===== TABLOLAR =====
let tablolarLoaded = false;

const tabloKatLabels = {
  itikat: 'İman ve İtikat', temizlik: 'Temizlik', namaz: 'Namaz',
  oruc: 'Oruç', zekat: 'Zekât', hac: 'Hac ve Umre',
  aile: 'Aile Hukuku', tasavvuf: 'Tasavvuf', genel: 'Diğer Konular'
};
const tabloKatOrder = ['itikat','temizlik','namaz','oruc','zekat','hac','aile','tasavvuf','genel'];

function loadTablolar() {
  tablolarLoaded = true;
  const grid = document.getElementById('tablolar-grid');
  if (!window.tablolarData) { grid.innerHTML = '<div class="loading">Tablolar yükleniyor...</div>'; return; }

  let html = '';
  // Kategoriye göre grupla ama kitap sırası koru (data zaten sayfa_no'ya göre sıralı)
  for (const kat of tabloKatOrder) {
    const items = window.tablolarData.filter(t => t.kategori === kat && t.id !== 'konu_haritasi');
    if (items.length === 0) continue;
    html += `<div class="tablo-kategori-baslik tablo-kat-${kat}"><span>${tabloKatLabels[kat]}</span><span class="tablo-kat-count">${items.length}</span></div>`;
    items.forEach(tablo => {
      html += `
        <div class="tablo-card tablo-kat-${kat}" id="tablo-${tablo.id}">
          <div class="tablo-card-header">
            <h4>${tablo.baslik}</h4>
            <div class="tablo-card-ref">Kaynak: ${tablo.kaynak_madde} · ${sayfaLink(tablo.sayfa_no, 'Sayfa ' + tablo.sayfa_no)}</div>
          </div>
          <div class="tablo-card-body">
            ${renderTabloBody(tablo)}
            <div class="tablo-kaynak">
              <strong>Kitaptan:</strong> ${tablo.kaynak_metin}
            </div>
          </div>
        </div>
      `;
    });
  }

  grid.innerHTML = html;
}

function renderTabloBody(tablo) {
  if (tablo.tip === 'tablo' && tablo.veriler) {
    return renderTable(tablo.veriler, tablo.kolonlar);
  }
  if (tablo.tip === 'flowchart' && tablo.veriler) {
    return renderFlowchart(tablo.veriler);
  }
  if (tablo.tip === 'liste' && tablo.veriler) {
    return renderListe(tablo.veriler);
  }
  if (tablo.tip === 'iki_liste' && tablo.veriler) {
    return renderIkiListe(tablo.veriler);
  }
  return '<p>Tablo verisi yükleniyor...</p>';
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
    html += '<div><h5 style="color:#c62828;margin-bottom:8px;">Orucu Bozan Şeyler</h5><ul class="check-list">';
    veriler.bozanlar.forEach(item => {
      html += `<li><span class="check-icon check-no">&#10007;</span> <span>${item}</span></li>`;
    });
    html += '</ul></div>';
  }

  if (veriler.bozmayalar) {
    html += '<div><h5 style="color:#2e7d32;margin-bottom:8px;">Orucu Bozmayan Şeyler</h5><ul class="check-list">';
    veriler.bozmayalar.forEach(item => {
      html += `<li><span class="check-icon check-yes">&#10003;</span> <span>${item}</span></li>`;
    });
    html += '</ul></div>';
  }

  html += '</div>';
  return html;
}

// ===== ARAMA =====
async function doFullSearch() {
  const query = document.getElementById('full-search').value.trim().toLowerCase();
  if (!query || query.length < 2) return;

  const results = document.getElementById('arama-results');
  if (!window.maddelerData) {
    results.innerHTML = '<p>Veriler yükleniyor...</p>';
    return;
  }

  results.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">Tam metin aranıyor...</p>';

  // Load all kisim texts for full search
  await Promise.all([loadKisimTexts(1), loadKisimTexts(2), loadKisimTexts(3)]);

  const kisimLabels = { 1: 'Birinci Kısım', 2: 'İkinci Kısım', 3: 'Üçüncü Kısım' };
  const matches = [];

  window.maddelerData.forEach(m => {
    // Use full text from cache
    const fullText = kisimTextsCache[m.kisim]?.[String(m.madde_no)] || m.metin || '';
    const metin = fullText.toLowerCase();
    const baslik = (m.baslik || '').toLowerCase();
    const idx = metin.indexOf(query);
    const inTitle = baslik.includes(query);

    if (idx !== -1 || inTitle) {
      let context = '';
      if (idx !== -1) {
        const start = Math.max(0, idx - 80);
        const end = Math.min(fullText.length, idx + query.length + 80);
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

  // Başlıkta geçenler önce
  matches.sort((a, b) => (b.inTitle ? 1 : 0) - (a.inTitle ? 1 : 0));

  let html = `<p style="color:var(--text-muted);margin-bottom:16px;">${matches.length} sonuç bulundu</p>`;

  matches.slice(0, 50).forEach(m => {
    const highlighted = m.context.replace(
      new RegExp(escapeRegex(query), 'gi'),
      match => `<mark>${match}</mark>`
    );

    html += `
      <div class="arama-result" onclick="openMadde(${m.kisim}, ${m.madde_no})">
        <h4>${m.baslik}</h4>
        <p>${highlighted || '(Başlıkta eşleşme)'}</p>
        <div class="result-meta">${kisimLabels[m.kisim]}, Madde ${m.madde_no} · ${sayfaLink(m.sayfa_no, 'Sayfa ' + m.sayfa_no)}</div>
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
    console.log(`Yüklendi: ${window.tocData.length} madde, ${window.sozlukData?.length || 0} sözlük kelimesi, ${window.tablolarData?.length || 0} tablo`);
  }
  // Arka planda tüm metinleri önceden yükle
  setTimeout(() => {
    loadKisimTexts(1);
    loadKisimTexts(2);
    loadKisimTexts(3);
  }, 500);
});
