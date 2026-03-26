/* ========================================
   SİLSİLE-İ ALİYYE ATLASI — MAIN APP
   ======================================== */

let map = null;
let markers = [];
let activeScholarIdx = null;

// Campaign / Journey state
let campaignActive = false;
let campaignPaused = false;
let campaignTimer = null;
let campaignIndex = 0;
let campaignSpeed = 5000;
let campaignTrailLine = null;
let campaignTrailCoords = [];

// ========== ERA HELPERS ==========
function getEraClass(scholar) {
  const v = parseInt(scholar.vefat) || 2000;
  if (v <= 770) return 'era-early';
  if (v <= 1090) return 'era-classic';
  if (v <= 1400) return 'era-golden';
  if (v <= 1600) return 'era-timurid';
  if (v <= 1780) return 'era-mughal';
  if (v <= 1870) return 'era-ottoman';
  return 'era-modern';
}

function getEraColor(scholar) {
  const colors = {
    'era-early': '#e8b84c',
    'era-classic': '#d4956a',
    'era-golden': '#7ec4a0',
    'era-timurid': '#6aaed4',
    'era-mughal': '#9b8ec4',
    'era-ottoman': '#d47a7a',
    'era-modern': '#c8a96e'
  };
  return colors[getEraClass(scholar)] || '#c8a96e';
}

function getEraName(scholar) {
  const names = {
    'era-early': 'Sahabe-Tabiin',
    'era-classic': 'Horasan',
    'era-golden': 'Maverauennehr',
    'era-timurid': 'Timurlu-Babur',
    'era-mughal': 'Hindistan',
    'era-ottoman': 'Osmanli',
    'era-modern': 'Modern'
  };
  return names[getEraClass(scholar)] || '';
}

// ========== JITTER ==========
function applyJitter(silsile) {
  const seen = {};
  const result = [];
  silsile.forEach(s => {
    const key = s.koordinat[0].toFixed(2) + ',' + s.koordinat[1].toFixed(2);
    seen[key] = (seen[key] || 0) + 1;
    result.push({ ...s, _jitterIdx: seen[key] - 1, _jitterKey: key });
  });
  const counts = {};
  result.forEach(s => { counts[s._jitterKey] = Math.max(counts[s._jitterKey] || 0, s._jitterIdx + 1); });
  return result.map(s => {
    const n = counts[s._jitterKey];
    if (n <= 1) return s;
    const angle = (s._jitterIdx / n) * 2 * Math.PI;
    const r = 0.06;
    return { ...s, _lat: s.koordinat[0] + Math.cos(angle) * r, _lng: s.koordinat[1] + Math.sin(angle) * r };
  });
}

function lat(s) { return s._lat !== undefined ? s._lat : s.koordinat[0]; }
function lng(s) { return s._lng !== undefined ? s._lng : s.koordinat[1]; }

// ========== DATA ==========
const DATA = applyJitter(SILSILE);

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initSilsile();
  initGlobalSearch();
  initMobileMenu();
  initScrollAnimations();
  initJourneyButton();
  initCampaignControls();
  initModal();
  injectPersonSchema();
});

// ========== MAP ==========
function initMap() {
  map = L.map('map', {
    center: [35, 55],
    zoom: 4,
    minZoom: 3,
    maxZoom: 12,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Draw silsile path (dashed line connecting all scholars)
  const pathCoords = DATA.map(s => [lat(s), lng(s)]);
  L.polyline(pathCoords, {
    color: '#c8963e',
    weight: 2,
    opacity: 0.35,
    dashArray: '8, 8',
  }).addTo(map);

  addMarkers();
}

function addMarkers() {
  DATA.forEach((scholar, i) => {
    const isFirst = i === 0;
    const isLast = i === DATA.length - 1;
    const num = i + 1;

    const extraClass = isFirst ? ' menba' : (isLast ? ' last' : '');
    const shortName = scholar.ad.length > 20 ? scholar.ad.substring(0, 18) + '\u2026' : scholar.ad;

    const icon = L.divIcon({
      className: 'scholar-marker',
      html: `
        <div class="marker-inner${extraClass}" data-idx="${i}">
          ${num}
        </div>
        <div class="marker-label">${shortName}</div>
      `,
      iconSize: isFirst ? [52, 52] : [44, 44],
      iconAnchor: isFirst ? [26, 26] : [22, 22],
    });

    const marker = L.marker([lat(scholar), lng(scholar)], { icon }).addTo(map);
    marker.on('click', () => {
      if (campaignActive) {
        // During campaign, clicking a marker jumps to it
        campaignIndex = i;
        clearTimeout(campaignTimer);
        campaignTrailCoords = DATA.slice(0, i).map(s => [lat(s), lng(s)]);
        if (campaignTrailLine) campaignTrailLine.setLatLngs(campaignTrailCoords);
        showCampaignStep();
      } else {
        openPanel(i);
      }
    });

    markers.push({ scholar, marker, idx: i });
  });
}

// ========== PANEL ==========
function openPanel(idx) {
  activeScholarIdx = idx;
  const scholar = DATA[idx];
  const isFirst = idx === 0;
  const panel = document.getElementById('scholar-panel');

  // Portrait
  const portrait = document.getElementById('panel-portrait');
  portrait.classList.toggle('menba', isFirst);

  // Halka
  document.getElementById('panel-halka').textContent = isFirst ? 'Menba-i Feyz' : (idx + 1) + '. Halka';

  // Name
  document.getElementById('panel-name').textContent = scholar.tam_ad;

  // Lakap
  document.getElementById('panel-lakap').textContent = scholar.lakap || '';

  // Dates
  document.getElementById('panel-dates').textContent =
    scholar.dogum && scholar.vefat ? scholar.dogum + ' \u2014 ' + scholar.vefat : '';

  // Location
  document.getElementById('panel-loc').textContent = scholar.sehir + ', ' + scholar.ulke;

  // Tags
  const tagsEl = document.getElementById('panel-tags');
  tagsEl.innerHTML = '';
  const eraTag = document.createElement('span');
  eraTag.className = 'panel-tag';
  eraTag.style.background = getEraColor(scholar);
  eraTag.textContent = scholar.asir;
  tagsEl.appendChild(eraTag);

  const bolgTag = document.createElement('span');
  bolgTag.className = 'panel-tag';
  bolgTag.style.background = 'rgba(200,150,62,0.25)';
  bolgTag.style.color = '#c8963e';
  bolgTag.textContent = scholar.bolge;
  tagsEl.appendChild(bolgTag);

  // Cross-reference links
  buildXrefLinks(idx);

  // Nav buttons
  const prev = idx > 0 ? DATA[idx - 1] : null;
  const next = idx < DATA.length - 1 ? DATA[idx + 1] : null;
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  btnPrev.disabled = !prev;
  btnNext.disabled = !next;
  document.getElementById('prev-name').textContent = prev ? prev.ad : '';
  document.getElementById('next-name').textContent = next ? next.ad : '';
  btnPrev.onclick = prev ? () => openPanel(idx - 1) : null;
  btnNext.onclick = next ? () => openPanel(idx + 1) : null;

  // Bio
  const bioEl = document.getElementById('panel-bio');
  bioEl.innerHTML = scholar.biyografi
    .split('\n\n')
    .map(p => '<p>' + p.replace(/\n/g, ' ').trim() + '</p>')
    .join('');

  // Show panel
  panel.classList.remove('hidden');
  panel.scrollTop = 0;

  // Fly to scholar
  const isMobile = window.innerWidth <= 1024;
  map.flyTo([lat(scholar), lng(scholar)], Math.max(map.getZoom(), 5), { duration: isMobile ? 0.8 : 1 });

  // Highlight marker
  highlightMarker(idx);
}

function buildXrefLinks(idx) {
  const linksEl = document.getElementById('panel-xref-links');
  linksEl.innerHTML = '';

  // Teacher (previous in chain)
  if (idx > 0) {
    const teacher = DATA[idx - 1];
    const btn = document.createElement('button');
    btn.className = 'xref-link';
    btn.innerHTML = `<span class="xref-label">Hocası</span><span class="xref-name">${teacher.ad}</span>`;
    btn.onclick = () => openPanel(idx - 1);
    linksEl.appendChild(btn);
  }

  // Student (next in chain)
  if (idx < DATA.length - 1) {
    const student = DATA[idx + 1];
    const btn = document.createElement('button');
    btn.className = 'xref-link';
    btn.innerHTML = `<span class="xref-label">Talebesi</span><span class="xref-name">${student.ad}</span>`;
    btn.onclick = () => openPanel(idx + 1);
    linksEl.appendChild(btn);
  }

  // Show on map link
  const mapBtn = document.createElement('button');
  mapBtn.className = 'xref-link';
  mapBtn.innerHTML = `<span class="xref-label">Harita</span><span class="xref-name">${DATA[idx].sehir}</span>`;
  mapBtn.onclick = () => {
    map.flyTo([lat(DATA[idx]), lng(DATA[idx])], 8, { duration: 1.2 });
  };
  linksEl.appendChild(mapBtn);
}

function closePanel() {
  activeScholarIdx = null;
  const panel = document.getElementById('scholar-panel');
  panel.classList.add('hidden');
  clearMarkerHighlights();
  map.flyTo([35, 55], 4, { duration: 1 });
}

function highlightMarker(idx) {
  markers.forEach((m, i) => {
    const inner = m.marker.getElement()?.querySelector('.marker-inner');
    if (inner) {
      inner.classList.toggle('active', i === idx);
      inner.classList.toggle('highlight', i <= idx);
    }
  });
}

function clearMarkerHighlights() {
  markers.forEach(m => {
    const inner = m.marker.getElement()?.querySelector('.marker-inner');
    if (inner) {
      inner.classList.remove('active', 'highlight');
    }
  });
}

// Panel close
document.addEventListener('click', (e) => {
  if (e.target.id === 'panel-close') {
    closePanel();
  }
});

// ========== GLOBAL SEARCH (Ctrl+K) ==========
function initGlobalSearch() {
  const modal = document.getElementById('global-search-modal');
  const input = document.getElementById('gs-input');
  const results = document.getElementById('gs-results');
  const backdrop = modal.querySelector('.gs-backdrop');
  const trigger = document.getElementById('global-search-btn');
  let activeIdx = -1;

  function openSearch() {
    modal.classList.remove('hidden');
    input.value = '';
    results.innerHTML = '';
    activeIdx = -1;
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    modal.classList.add('hidden');
    input.value = '';
    results.innerHTML = '';
    activeIdx = -1;
  }

  // Trigger button
  trigger.addEventListener('click', openSearch);

  // Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (modal.classList.contains('hidden')) {
        openSearch();
      } else {
        closeSearch();
      }
    }
  });

  // Backdrop close
  backdrop.addEventListener('click', closeSearch);

  // Escape close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeSearch();
    }
  });

  // Search input
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    activeIdx = -1;

    if (q.length < 1) {
      results.innerHTML = '';
      return;
    }

    const matches = DATA.map((s, i) => ({ s, i })).filter(({ s }) => {
      return s.ad.toLowerCase().includes(q) ||
        s.tam_ad.toLowerCase().includes(q) ||
        (s.lakap && s.lakap.toLowerCase().includes(q)) ||
        s.sehir.toLowerCase().includes(q) ||
        s.bolge.toLowerCase().includes(q) ||
        s.ulke.toLowerCase().includes(q) ||
        s.asir.toLowerCase().includes(q);
    }).slice(0, 12);

    if (!matches.length) {
      results.innerHTML = '<div style="padding:16px 20px;color:var(--text-muted);font-size:13px;">Sonu\u00e7 bulunamad\u0131</div>';
      return;
    }

    results.innerHTML = matches.map(({ s, i }) => `
      <div class="gs-result-item" data-idx="${i}" role="option">
        <div class="gs-result-num">${i + 1}</div>
        <div class="gs-result-info">
          <div class="gs-result-name">${s.tam_ad}</div>
          <div class="gs-result-meta">${s.sehir}, ${s.ulke} &bull; ${s.dogum}\u2013${s.vefat} &bull; ${s.bolge}</div>
        </div>
      </div>
    `).join('');

    // Click handlers
    results.querySelectorAll('.gs-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx);
        closeSearch();
        openPanel(idx);
        scrollToMap();
      });
    });
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.gs-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      updateActive(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      updateActive(items);
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      items[activeIdx].click();
    }
  });

  function updateActive(items) {
    items.forEach((item, i) => {
      item.classList.toggle('active', i === activeIdx);
      if (i === activeIdx) item.scrollIntoView({ block: 'nearest' });
    });
  }
}

// ========== SILSILE CHAIN ==========
function initSilsile() {
  const container = document.getElementById('silsile');
  container.innerHTML = '';

  DATA.forEach((scholar, i) => {
    const isFirst = i === 0;
    const isLast = i === DATA.length - 1;

    const node = document.createElement('div');
    const cls = isFirst ? 'silsile-node menba' : (isLast ? 'silsile-node last' : 'silsile-node');
    node.className = cls;
    node.dataset.idx = i;
    node.setAttribute('role', 'listitem');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', (i + 1) + '. halka: ' + scholar.tam_ad);

    const dates = scholar.dogum && scholar.vefat ? scholar.dogum + ' \u2013 ' + scholar.vefat : '';

    node.innerHTML = `
      <div class="sn-name">${scholar.tam_ad}</div>
      <div class="sn-dates">${dates}</div>
      <div class="sn-loc">${scholar.sehir}, ${scholar.ulke}</div>
    `;

    node.addEventListener('click', () => showModal(i));
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showModal(i); }
    });
    container.appendChild(node);

    if (i < DATA.length - 1) {
      const connector = document.createElement('div');
      connector.className = 'silsile-connector';
      connector.setAttribute('aria-hidden', 'true');
      container.appendChild(connector);
    }
  });
}

// ========== MODAL ==========
function initModal() {
  const modal = document.getElementById('scholar-modal');
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function showModal(idx) {
  const scholar = DATA[idx];
  const modal = document.getElementById('scholar-modal');

  document.getElementById('modal-halka').textContent =
    idx === 0 ? 'Menba-i Feyz' : (idx + 1) + '. Halka';
  document.getElementById('modal-name').textContent = scholar.tam_ad;
  document.getElementById('modal-lakap').textContent = scholar.lakap || '';
  document.getElementById('modal-dates').textContent =
    scholar.dogum && scholar.vefat ? scholar.dogum + ' \u2014 ' + scholar.vefat : '';
  document.getElementById('modal-location').textContent =
    scholar.sehir + ', ' + scholar.ulke;

  // Tags
  const tagsEl = document.getElementById('modal-tags');
  tagsEl.innerHTML = '';
  const eraTag = document.createElement('span');
  eraTag.className = 'modal-tag';
  eraTag.style.background = getEraColor(scholar);
  eraTag.textContent = scholar.asir;
  tagsEl.appendChild(eraTag);

  const bolgTag = document.createElement('span');
  bolgTag.className = 'modal-tag';
  bolgTag.style.background = 'rgba(200,150,62,0.25)';
  bolgTag.style.color = '#c8963e';
  bolgTag.textContent = scholar.bolge;
  tagsEl.appendChild(bolgTag);

  // Cross-reference buttons in modal
  const xrefEl = document.getElementById('modal-xref');
  xrefEl.innerHTML = '';
  if (idx > 0) {
    const btn = document.createElement('button');
    btn.className = 'modal-xref-btn';
    btn.innerHTML = `<span class="xref-dir">Hocas\u0131:</span> ${DATA[idx - 1].ad}`;
    btn.onclick = () => { closeModal(); showModal(idx - 1); };
    xrefEl.appendChild(btn);
  }
  if (idx < DATA.length - 1) {
    const btn = document.createElement('button');
    btn.className = 'modal-xref-btn';
    btn.innerHTML = `<span class="xref-dir">Talebesi:</span> ${DATA[idx + 1].ad}`;
    btn.onclick = () => { closeModal(); showModal(idx + 1); };
    xrefEl.appendChild(btn);
  }
  // "Show on Map" button
  const mapBtn = document.createElement('button');
  mapBtn.className = 'modal-xref-btn';
  mapBtn.innerHTML = `<span class="xref-dir">Harita:</span> G\u00f6ster`;
  mapBtn.onclick = () => { closeModal(); openPanel(idx); scrollToMap(); };
  xrefEl.appendChild(mapBtn);

  // Bio
  const bioEl = document.getElementById('modal-bio');
  bioEl.innerHTML = scholar.biyografi
    .split('\n\n')
    .map(p => '<p>' + p.replace(/\n/g, ' ').trim() + '</p>')
    .join('');

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('scholar-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ========== CAMPAIGN / YOLCULUK MODU ==========
function initJourneyButton() {
  document.getElementById('btn-journey').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToMap();
    setTimeout(() => startCampaign(), 600);
  });
}

function initCampaignControls() {
  document.getElementById('campaignStartBtn').addEventListener('click', toggleCampaign);
  document.getElementById('campaignPauseBtn').addEventListener('click', pauseCampaign);
  document.getElementById('speed1').addEventListener('click', () => setCampaignSpeed(5000));
  document.getElementById('speed2').addEventListener('click', () => setCampaignSpeed(3000));
  document.getElementById('speed3').addEventListener('click', () => setCampaignSpeed(1500));
  document.getElementById('campaignProgressBar').addEventListener('click', seekCampaign);

  // Campaign card nav links
  document.getElementById('campaignPrevLink').addEventListener('click', () => {
    if (!campaignActive || campaignIndex <= 1) return;
    campaignIndex = campaignIndex - 2;
    clearTimeout(campaignTimer);
    campaignTrailCoords = DATA.slice(0, campaignIndex).map(s => [lat(s), lng(s)]);
    if (campaignTrailLine) campaignTrailLine.setLatLngs(campaignTrailCoords);
    campaignPaused = false;
    showCampaignStep();
  });

  document.getElementById('campaignNextLink').addEventListener('click', () => {
    if (!campaignActive || campaignIndex >= DATA.length) return;
    clearTimeout(campaignTimer);
    showCampaignStep();
  });
}

function scrollToMap() {
  document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
}

function toggleCampaign() {
  if (campaignActive) {
    stopCampaign();
  } else {
    startCampaign();
  }
}

function startCampaign() {
  if (campaignActive) { stopCampaign(); return; }

  campaignActive = true;
  campaignPaused = false;
  campaignIndex = 0;
  campaignTrailCoords = [];

  // Close panel if open
  closePanel();
  clearMarkerHighlights();

  // Remove old trail
  if (campaignTrailLine && map.hasLayer(campaignTrailLine)) {
    map.removeLayer(campaignTrailLine);
  }

  // Create trail line
  campaignTrailLine = L.polyline([], {
    color: '#c8963e',
    weight: 2.5,
    opacity: 0.7,
    dashArray: '6,4',
    className: 'campaign-trail'
  });
  campaignTrailLine.addTo(map);

  // UI
  document.getElementById('campaignStartBtn').textContent = '\u2716 Yolculu\u011fu Bitir';
  document.getElementById('campaignStartBtn').classList.add('active');
  document.getElementById('campaignPauseBtn').style.display = '';
  document.getElementById('campaignSpeedCtrl').style.display = '';
  document.getElementById('campaignProgress').classList.add('visible');

  setTimeout(() => showCampaignStep(), 500);
}

function stopCampaign() {
  campaignActive = false;
  campaignPaused = false;
  clearTimeout(campaignTimer);

  // Remove trail
  if (campaignTrailLine && map.hasLayer(campaignTrailLine)) {
    map.removeLayer(campaignTrailLine);
  }

  // Hide card
  document.getElementById('campaignCard').classList.remove('visible');
  document.getElementById('campaignProgress').classList.remove('visible');

  // UI
  document.getElementById('campaignStartBtn').textContent = '\u2694 Yolculuk Modu';
  document.getElementById('campaignStartBtn').classList.remove('active');
  document.getElementById('campaignPauseBtn').style.display = 'none';
  document.getElementById('campaignPauseBtn').textContent = '\u2758\u2758 Duraklat';
  document.getElementById('campaignSpeedCtrl').style.display = 'none';

  clearMarkerHighlights();

  // Reset map
  map.flyTo([35, 55], 4, { duration: 1 });
}

function pauseCampaign() {
  if (campaignPaused) {
    campaignPaused = false;
    document.getElementById('campaignPauseBtn').textContent = '\u2758\u2758 Duraklat';
    showCampaignStep();
  } else {
    campaignPaused = true;
    clearTimeout(campaignTimer);
    document.getElementById('campaignPauseBtn').textContent = '\u25B6 Devam';
  }
}

function setCampaignSpeed(ms) {
  campaignSpeed = ms;
  document.querySelectorAll('.campaign-speed button').forEach(b => {
    b.classList.remove('active-speed');
    b.setAttribute('aria-pressed', 'false');
  });
  const btnId = ms === 5000 ? 'speed1' : ms === 3000 ? 'speed2' : 'speed3';
  document.getElementById(btnId).classList.add('active-speed');
  document.getElementById(btnId).setAttribute('aria-pressed', 'true');
}

function showCampaignStep() {
  if (!campaignActive || campaignPaused) return;
  if (campaignIndex >= DATA.length) {
    stopCampaign();
    return;
  }

  const scholar = DATA[campaignIndex];
  const coords = [lat(scholar), lng(scholar)];

  // Add to trail
  campaignTrailCoords.push(coords);
  if (campaignTrailLine) {
    campaignTrailLine.setLatLngs(campaignTrailCoords);
  }

  // Fly to location
  map.flyTo(coords, campaignIndex === 0 ? 5 : Math.max(map.getZoom(), 5), { duration: 1.2 });

  // Highlight markers
  markers.forEach((m, i) => {
    const inner = m.marker.getElement()?.querySelector('.marker-inner');
    if (inner) {
      inner.classList.toggle('active', i === campaignIndex);
      inner.classList.toggle('highlight', i <= campaignIndex);
    }
  });

  // Update card
  const card = document.getElementById('campaignCard');
  document.getElementById('campaignNum').textContent = campaignIndex + 1;
  document.getElementById('campaignTitle').textContent = scholar.tam_ad;
  document.getElementById('campaignDates').textContent =
    scholar.dogum && scholar.vefat ? scholar.dogum + ' \u2013 ' + scholar.vefat : '';
  document.getElementById('campaignLocation').textContent = '\uD83D\uDCCD ' + scholar.sehir + ', ' + scholar.ulke;
  document.getElementById('campaignLakap').textContent = scholar.lakap || '';

  // Summary: first ~150 chars of bio
  const summary = scholar.biyografi.split('\n\n')[0];
  document.getElementById('campaignSummary').textContent =
    summary.length > 180 ? summary.substring(0, 177) + '\u2026' : summary;

  // Nav links in card
  const prevLink = document.getElementById('campaignPrevLink');
  const nextLink = document.getElementById('campaignNextLink');
  prevLink.disabled = campaignIndex === 0;
  nextLink.disabled = campaignIndex >= DATA.length - 1;
  document.getElementById('campaignPrevName').textContent =
    campaignIndex > 0 ? DATA[campaignIndex - 1].ad : 'Hocas\u0131';
  document.getElementById('campaignNextName').textContent =
    campaignIndex < DATA.length - 1 ? DATA[campaignIndex + 1].ad : 'Talebesi';

  // Show with animation
  card.classList.remove('visible');
  setTimeout(() => card.classList.add('visible'), 150);

  // Update progress
  const total = DATA.length;
  const pct = ((campaignIndex + 1) / total * 100);
  document.getElementById('campaignProgressFill').style.width = pct + '%';
  document.getElementById('campaignProgressLabel').textContent = (campaignIndex + 1) + ' / ' + total;
  document.getElementById('campaignProgressBar').setAttribute('aria-valuenow', campaignIndex + 1);

  // Next step
  campaignIndex++;
  campaignTimer = setTimeout(() => showCampaignStep(), campaignSpeed);
}

function seekCampaign(e) {
  if (!campaignActive || DATA.length === 0) return;
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  const idx = Math.floor(pct * DATA.length);
  campaignIndex = Math.max(0, Math.min(idx, DATA.length - 1));

  // Rebuild trail up to this point
  campaignTrailCoords = DATA.slice(0, campaignIndex).map(s => [lat(s), lng(s)]);
  if (campaignTrailLine) campaignTrailLine.setLatLngs(campaignTrailCoords);

  clearTimeout(campaignTimer);
  campaignPaused = false;
  document.getElementById('campaignPauseBtn').textContent = '\u2758\u2758 Duraklat';
  showCampaignStep();
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('main-nav');

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('#main-nav a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-header, .silsile-wrapper, .tanitim-content').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // Header scroll effect
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 100) {
      header.style.background = 'rgba(24,24,31,0.98)';
    } else {
      header.style.background = 'rgba(24,24,31,0.95)';
    }
  });
}

// ========== SEO: JSON-LD Person Schema ==========
function injectPersonSchema() {
  const persons = DATA.map((s, i) => ({
    '@type': 'Person',
    'name': s.tam_ad,
    'alternateName': s.ad,
    'description': s.lakap || '',
    'birthDate': s.dogum,
    'deathDate': s.vefat,
    'birthPlace': {
      '@type': 'Place',
      'name': s.sehir + ', ' + s.ulke
    },
    'position': i + 1
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Silsile-i Aliyye - Nak\u015fibendiyye Alt\u0131n Zinciri',
    'description': '37 halkal\u0131k manevi silsile',
    'numberOfItems': 37,
    'itemListElement': persons.map((p, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'item': p
    }))
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
