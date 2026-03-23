/* ========================================
   SİLSİLE-İ ALİYYE ATLASI — MAIN APP
   ======================================== */

let map = null;
let markers = [];
let activeScholarIdx = null;
let journeyActive = false;
let journeyTimer = null;

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
    'era-early': 'Sahâbe-Tâbiîn',
    'era-classic': 'Horasan',
    'era-golden': 'Mâverâünnehr',
    'era-timurid': 'Timurlu-Bâbür',
    'era-mughal': 'Hindistan',
    'era-ottoman': 'Osmanlı',
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
  initSearch();
  initMobileMenu();
  initScrollAnimations();
  initJourneyButton();
  initModal();
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

  // Add markers
  addMarkers();
}

function addMarkers() {
  DATA.forEach((scholar, i) => {
    const isFirst = i === 0;
    const isLast = i === DATA.length - 1;
    const num = i + 1;

    const extraClass = isFirst ? ' menba' : (isLast ? ' last' : '');
    const shortName = scholar.ad.length > 20 ? scholar.ad.substring(0, 18) + '…' : scholar.ad;

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
      stopJourney();
      openPanel(i);
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
  const halka = document.getElementById('panel-halka');
  halka.textContent = isFirst ? 'Menba-i Feyz' : (idx + 1) + '. Halka';

  // Name
  document.getElementById('panel-name').textContent = scholar.tam_ad;

  // Lakap
  document.getElementById('panel-lakap').textContent = scholar.lakap || '';

  // Dates
  document.getElementById('panel-dates').textContent =
    scholar.dogum && scholar.vefat ? scholar.dogum + ' — ' + scholar.vefat : '';

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
  if (!isMobile) {
    map.flyTo([lat(scholar), lng(scholar)], Math.max(map.getZoom(), 5), { duration: 1 });
  } else {
    map.flyTo([lat(scholar), lng(scholar)], Math.max(map.getZoom(), 5), { duration: 0.8 });
  }

  // Highlight marker
  highlightMarker(idx);
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

// ========== SEARCH ==========
function initSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.classList.remove('active'); return; }

    const matches = DATA.filter(s => {
      return s.ad.toLowerCase().includes(q) ||
        s.tam_ad.toLowerCase().includes(q) ||
        (s.lakap && s.lakap.toLowerCase().includes(q)) ||
        s.sehir.toLowerCase().includes(q) ||
        s.bolge.toLowerCase().includes(q);
    }).slice(0, 8);

    if (!matches.length) { results.classList.remove('active'); return; }

    results.innerHTML = matches.map(s => {
      const idx = DATA.indexOf(s);
      return `
        <div class="search-result-item" data-idx="${idx}">
          <div><span class="result-num">${idx + 1}.</span> ${s.tam_ad}</div>
          <div class="result-meta">${s.sehir}, ${s.ulke} &bull; ${s.dogum}–${s.vefat}</div>
        </div>
      `;
    }).join('');

    results.classList.add('active');

    results.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx);
        openPanel(idx);
        scrollToMap();
        results.classList.remove('active');
        input.value = '';
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      results.classList.remove('active');
    }
  });
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

    const dates = scholar.dogum && scholar.vefat ? scholar.dogum + ' – ' + scholar.vefat : '';

    node.innerHTML = `
      <div class="sn-name">${scholar.tam_ad}</div>
      <div class="sn-dates">${dates}</div>
      <div class="sn-loc">${scholar.sehir}, ${scholar.ulke}</div>
    `;

    node.addEventListener('click', () => showModal(i));
    container.appendChild(node);

    if (i < DATA.length - 1) {
      const connector = document.createElement('div');
      connector.className = 'silsile-connector';
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
    scholar.dogum && scholar.vefat ? scholar.dogum + ' — ' + scholar.vefat : '';
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

// ========== JOURNEY ANIMATION ==========
function initJourneyButton() {
  document.getElementById('btn-journey').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToMap();
    setTimeout(() => startJourney(), 600);
  });
}

function scrollToMap() {
  document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
}

function startJourney() {
  if (journeyActive) { stopJourney(); return; }
  journeyActive = true;
  closePanel();
  clearMarkerHighlights();

  // Create toast if not exists
  let toast = document.getElementById('journey-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'journey-toast';
    document.body.appendChild(toast);
  }

  runJourneyStep(0);
}

function runJourneyStep(idx) {
  if (!journeyActive || idx >= DATA.length) {
    stopJourney();
    return;
  }

  const scholar = DATA[idx];
  const toast = document.getElementById('journey-toast');

  // Show toast
  toast.textContent = (idx + 1) + '. ' + scholar.tam_ad;
  toast.classList.add('visible');

  // Highlight markers up to this point
  markers.forEach((m, i) => {
    const inner = m.marker.getElement()?.querySelector('.marker-inner');
    if (inner) {
      inner.classList.toggle('active', i === idx);
      inner.classList.toggle('highlight', i <= idx);
    }
  });

  // Fly to scholar
  const zoomLevel = idx === 0 ? 5 : Math.max(map.getZoom(), 5);
  const duration = idx === 0 ? 1.5 : 1;
  map.flyTo([lat(scholar), lng(scholar)], zoomLevel, { duration });

  // Pause duration: longer for first and last
  const pause = idx === 0 ? 2500 : (idx === DATA.length - 1 ? 2000 : 1200);

  journeyTimer = setTimeout(() => {
    runJourneyStep(idx + 1);
  }, pause);
}

function stopJourney() {
  journeyActive = false;
  if (journeyTimer) { clearTimeout(journeyTimer); journeyTimer = null; }
  const toast = document.getElementById('journey-toast');
  if (toast) toast.classList.remove('visible');
  clearMarkerHighlights();
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('main-nav').classList.toggle('open');
  });

  document.querySelectorAll('#main-nav a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('main-nav').classList.remove('open');
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

  document.querySelectorAll('.section-header, .silsile-wrapper').forEach(el => {
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
