/* ========================================
   SİLSİLE-İ ALİYYE ATLASI — MAIN APP
   Veri: veri.js (Se'âdet-i Ebediyye, s. 969 ve hâl tercemeleri)
   ======================================== */

let map = null;
let markers = [];
let activeScholarIdx = null;

// Sırayla gösterme durumu
let campaignActive = false;
let campaignPaused = false;
let campaignTimer = null;
let campaignIndex = 0;
let campaignSpeed = 5000;
let campaignTrailLine = null;
let campaignTrailCoords = [];

// ========== YARDIMCILAR ==========
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function yilSayisi(v) {
  const m = String(v == null ? '' : v).match(/\d{3,4}/);
  return m ? parseInt(m[0], 10) : NaN;
}

const ROMA = { I: 1, V: 5, X: 10, L: 50, C: 100 };
function asirdanYil(asir) {
  const m = String(asir || '').match(/^([IVXLC]+)/);
  if (!m) return NaN;
  let t = 0;
  const r = m[1];
  for (let i = 0; i < r.length; i++) {
    const a = ROMA[r[i]], b = ROMA[r[i + 1]] || 0;
    t += a < b ? -a : a;
  }
  return t * 100 - 50;
}

// Renk/çağ hesabı için temsilî yıl: vefât, yoksa doğum, yoksa asır
function temsiliYil(s) {
  let y = yilSayisi(s.vefat);
  if (isNaN(y)) y = yilSayisi(s.dogum);
  if (isNaN(y)) y = asirdanYil(s.asir);
  return isNaN(y) ? 2000 : y;
}

// Mîlâdî tarih metni: "1563 – 1624", "v. 1180" veya ""
function tarihMetni(s) {
  const d = String(s.dogum || '').trim(), v = String(s.vefat || '').trim();
  const dBilinir = d && d !== '?', vBilinir = v && v !== '?';
  if (dBilinir && vBilinir) return d + ' – ' + v;
  if (vBilinir) return 'v. ' + v;
  if (dBilinir) return 'd. ' + d;
  return '';
}

// Panel ve pencerede: mîlâdî + kitaptaki hicrî bilgi
function tamTarihMetni(s) {
  const m = tarihMetni(s);
  if (m && s.hicri) return 'm. ' + m + '  ·  ' + s.hicri;
  return m ? 'm. ' + m : (s.hicri || '');
}

function halkaEtiketi(s) {
  if (s.halka === 0) return 'Menba-i feyz';
  if (s.halka === null || s.halka === undefined) return "Se'âdet-i Ebediyye'yi hazırlayan";
  return s.halka + '. halka';
}

function markerMetni(s) {
  if (s.halka === 0) return '✦';
  if (s.halka === null || s.halka === undefined) return '❖';
  return String(s.halka);
}

// ========== ERA HELPERS ==========
function getEraClass(scholar) {
  const v = temsiliYil(scholar);
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
    'era-early': 'Sahâbe ve Tâbiîn',
    'era-classic': 'Horasan',
    'era-golden': 'Mâverâünnehr',
    'era-timurid': 'Mâverâünnehr (Hâcegân)',
    'era-mughal': 'Hindistan',
    'era-ottoman': 'Osmanlı',
    'era-modern': 'Son asır'
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
const ID_INDEX = {};
DATA.forEach((s, i) => { ID_INDEX[s.id] = i; });

// Feyz aldığı halkalar (veri.js'te "hoca" yoksa bir önceki sıradaki zât)
function hocaIndeksleri(idx) {
  const s = DATA[idx];
  if (Array.isArray(s.hoca) && s.hoca.length) {
    return s.hoca.map(id => ID_INDEX[id]).filter(i => i !== undefined);
  }
  return idx > 0 ? [idx - 1] : [];
}
function talebeIndeksleri(idx) {
  const out = [];
  DATA.forEach((s, j) => { if (j !== idx && hocaIndeksleri(j).indexOf(idx) !== -1) out.push(j); });
  return out;
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  // Her adım bağımsız: biri çökerse (ör. harita kütüphanesi yüklenemezse)
  // sayfanın geri kalanı görünür ve kullanılabilir kalır.
  const adim = (fn, ad) => { try { fn(); } catch (e) { console.error('Atlas init hatası [' + ad + ']:', e); } };
  adim(initScrollAnimations, 'animasyon'); // içerik görünürlüğü haritadan önce gelir
  adim(initStats, 'sayılar');
  adim(initMap, 'harita');
  adim(initSilsile, 'silsile');
  adim(initGlobalSearch, 'arama');
  adim(initMobileMenu, 'menü');
  adim(initJourneyButton, 'sırayla-göster');
  adim(initCampaignControls, 'sırayla-göster-kontrol');
  adim(initModal, 'modal');
  adim(injectPersonSchema, 'schema');
});

// ========== SAYILAR (veriden hesaplanır) ==========
function initStats() {
  const halkalar = DATA.map(s => s.halka).filter(h => typeof h === 'number' && h > 0);
  const halkaSayisi = halkalar.length ? Math.max.apply(null, halkalar) : 0;
  // Asır sayısı veri.js'teki "asir" alanlarından (ör. "VII. Yüzyıl" … "XX. Yüzyıl")
  const asirlar = [];
  DATA.forEach(s => {
    (String(s.asir || '').match(/[IVXLC]+/g) || []).forEach(r => {
      const y = asirdanYil(r);
      if (!isNaN(y)) asirlar.push(Math.round((y + 50) / 100));
    });
  });
  const asirSayisi = asirlar.length ? Math.max.apply(null, asirlar) - Math.min.apply(null, asirlar) + 1 : 0;
  const bolgeSayisi = new Set(DATA.map(s => s.bolge)).size;
  const yaz = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  yaz('stat-halka', halkaSayisi);
  yaz('stat-asir', asirSayisi);
  yaz('stat-bolge', bolgeSayisi);
  yaz('campaignProgressLabel', '0 / ' + DATA.length);
  const bar = document.getElementById('campaignProgressBar');
  if (bar) bar.setAttribute('aria-valuemax', DATA.length);
}

// ========== MAP ==========
function initMap() {
  map = L.map('map', {
    center: [35, 55],
    zoom: 4,
    minZoom: 3,
    maxZoom: 12,
    zoomControl: true,
    scrollWheelZoom: false, // sayfa kaydırılırken harita yakalanmasın; +/− düğmeleri veya tıklayınca açılır
  });
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());

  // Altlık harita: Esri "Light Gray Canvas" (anahtarsız). Eski CARTO adresi artık
  // "API KEY REQUIRED" filigranlı karo döndürdüğü için değiştirildi.
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Harita: &copy; Esri, HERE, Garmin, &copy; OpenStreetMap katkıcıları',
    maxNativeZoom: 16,
    maxZoom: 19
  }).addTo(map);
  // Yer isimleri ayrı bir katmanda (altlığın üstünde, işaretlerin altında)
  const etiketPane = map.createPane('etiketler');
  etiketPane.style.zIndex = 250;
  etiketPane.style.pointerEvents = 'none';
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 16,
    maxZoom: 19,
    pane: 'etiketler'
  }).addTo(map);

  // Silsile yolu (kesik çizgi)
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
    const isFirst = scholar.halka === 0;
    const isLast = scholar.halka === null || scholar.halka === undefined;

    const extraClass = isFirst ? ' menba' : (isLast ? ' last' : '');

    const icon = L.divIcon({
      className: 'scholar-marker',
      html: `
        <div class="marker-inner${extraClass}" data-idx="${i}">${esc(markerMetni(scholar))}</div>
        <div class="marker-label">${esc(scholar.ad)}</div>
      `,
      iconSize: isFirst ? [52, 52] : [44, 44],
      iconAnchor: isFirst ? [26, 26] : [22, 22],
    });

    const marker = L.marker([lat(scholar), lng(scholar)], {
      icon,
      title: scholar.tam_ad,
      alt: scholar.tam_ad,
      keyboard: true
    }).addTo(map);
    marker.on('click', () => {
      if (campaignActive) {
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

// ========== BİYOGRAFİ (site metni + kitaptaki hâl tercemesi) ==========
function bioHTML(scholar) {
  let html = String(scholar.biyografi || '')
    .split('\n\n')
    .map(p => '<p>' + esc(p.replace(/\n/g, ' ').trim()) + '</p>')
    .join('');
  if (scholar.hal_tercemesi) {
    html += '<div class="bio-kitap">'
      + '<div class="bio-kitap-baslik">Kitaptaki hâl tercemesi</div>'
      + '<blockquote>' + esc(scholar.hal_tercemesi) + '</blockquote>'
      + (scholar.kaynak ? '<div class="bio-kaynak">' + esc(scholar.kaynak) + '</div>' : '')
      + '</div>';
  }
  return html;
}

// ========== PANEL ==========
function openPanel(idx) {
  activeScholarIdx = idx;
  const scholar = DATA[idx];
  const isFirst = scholar.halka === 0;
  const panel = document.getElementById('scholar-panel');

  document.getElementById('panel-portrait').classList.toggle('menba', isFirst);
  document.getElementById('panel-halka').textContent = halkaEtiketi(scholar);
  document.getElementById('panel-name').textContent = scholar.tam_ad;
  document.getElementById('panel-lakap').textContent = scholar.lakap || '';
  document.getElementById('panel-dates').textContent = tamTarihMetni(scholar);
  document.getElementById('panel-loc').textContent = scholar.sehir + ', ' + scholar.ulke;

  // Etiketler
  const tagsEl = document.getElementById('panel-tags');
  tagsEl.innerHTML = '';
  const eraTag = document.createElement('span');
  eraTag.className = 'panel-tag';
  eraTag.style.background = getEraColor(scholar);
  eraTag.style.color = '#18181f';
  eraTag.textContent = scholar.asir;
  tagsEl.appendChild(eraTag);

  const bolgTag = document.createElement('span');
  bolgTag.className = 'panel-tag';
  bolgTag.style.background = 'rgba(200,150,62,0.25)';
  bolgTag.style.color = '#e8d48b';
  bolgTag.textContent = scholar.bolge;
  tagsEl.appendChild(bolgTag);

  buildXrefLinks(idx);

  // Sıradaki önceki/sonraki
  const prev = idx > 0 ? DATA[idx - 1] : null;
  const next = idx < DATA.length - 1 ? DATA[idx + 1] : null;
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  btnPrev.disabled = !prev;
  btnNext.disabled = !next;
  btnPrev.title = prev ? 'Önceki: ' + prev.tam_ad : '';
  btnNext.title = next ? 'Sonraki: ' + next.tam_ad : '';
  document.getElementById('prev-name').textContent = prev ? prev.ad : '';
  document.getElementById('next-name').textContent = next ? next.ad : '';
  btnPrev.onclick = prev ? () => openPanel(idx - 1) : null;
  btnNext.onclick = next ? () => openPanel(idx + 1) : null;

  document.getElementById('panel-bio').innerHTML = bioHTML(scholar);

  panel.classList.remove('hidden');
  panel.scrollTop = 0;

  const isMobile = window.innerWidth <= 1024;
  if (isMobile) {
    // Dar ekranda panel haritanın altında açılır; görünür alana getir
    const r = panel.getBoundingClientRect();
    if (r.top > window.innerHeight - 120) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  map.flyTo([lat(scholar), lng(scholar)], Math.max(map.getZoom(), 5), { duration: isMobile ? 0.8 : 1 });

  highlightMarker(idx);
}

function iliskiEtiketi(fromIdx, toIdx, yon) {
  // yon: 'hoca' | 'talebe'
  const from = DATA[fromIdx], to = DATA[toIdx];
  const kitapDisi = (s) => s.halka === null || s.halka === undefined;
  if (yon === 'hoca') {
    if (to.halka === 0) return 'Feyz kaynağı';
    if (kitapDisi(from)) return 'Hocası';
    return 'Feyz aldığı';
  }
  if (kitapDisi(to)) return 'Talebesi';
  return 'Feyz verdiği';
}

function buildXrefLinks(idx) {
  const linksEl = document.getElementById('panel-xref-links');
  linksEl.innerHTML = '';

  const ekle = (etiket, ad, onClick) => {
    const btn = document.createElement('button');
    btn.className = 'xref-link';
    btn.innerHTML = `<span class="xref-label">${esc(etiket)}</span><span class="xref-name">${esc(ad)}</span>`;
    btn.onclick = onClick;
    linksEl.appendChild(btn);
  };

  hocaIndeksleri(idx).forEach(j => ekle(iliskiEtiketi(idx, j, 'hoca'), DATA[j].ad, () => openPanel(j)));
  talebeIndeksleri(idx).forEach(j => ekle(iliskiEtiketi(idx, j, 'talebe'), DATA[j].ad, () => openPanel(j)));
  ekle('Harita', DATA[idx].sehir, () => {
    map.flyTo([lat(DATA[idx]), lng(DATA[idx])], 8, { duration: 1.2 });
  });
}

function closePanel() {
  activeScholarIdx = null;
  const panel = document.getElementById('scholar-panel');
  panel.classList.add('hidden');
  clearMarkerHighlights();
  if (map) map.flyTo([35, 55], 4, { duration: 1 });
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
    if (inner) inner.classList.remove('active', 'highlight');
  });
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'panel-close') closePanel();
});

// ========== ARAMA (Ctrl+K) ==========
function trKucuk(s) { return String(s || '').toLocaleLowerCase('tr'); }

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

  trigger.addEventListener('click', openSearch);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (modal.classList.contains('hidden')) openSearch(); else closeSearch();
    }
  });

  backdrop.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeSearch();
  });

  input.addEventListener('input', () => {
    const q = trKucuk(input.value.trim());
    activeIdx = -1;

    if (q.length < 1) { results.innerHTML = ''; return; }

    const matches = DATA.map((s, i) => ({ s, i })).filter(({ s }) => {
      return [s.ad, s.tam_ad, s.lakap, s.sehir, s.bolge, s.ulke, s.asir].some(v => trKucuk(v).includes(q));
    }).slice(0, 12);

    if (!matches.length) {
      results.innerHTML = '<div style="padding:16px 20px;color:var(--text-muted);font-size:13px;">Sonuç bulunamadı</div>';
      return;
    }

    results.innerHTML = matches.map(({ s, i }) => {
      const t = tarihMetni(s);
      return `
      <div class="gs-result-item" data-idx="${i}" role="option">
        <div class="gs-result-num">${esc(markerMetni(s))}</div>
        <div class="gs-result-info">
          <div class="gs-result-name">${esc(s.tam_ad)}</div>
          <div class="gs-result-meta">${esc(s.sehir)}, ${esc(s.ulke)}${t ? ' &bull; ' + esc(t) : ''} &bull; ${esc(s.bolge)}</div>
        </div>
      </div>`;
    }).join('');

    results.querySelectorAll('.gs-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        closeSearch();
        openPanel(idx);
        scrollToMap();
      });
    });
  });

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

// ========== SİLSİLE ZİNCİRİ ==========
function initSilsile() {
  const container = document.getElementById('silsile');
  container.innerHTML = '';

  DATA.forEach((scholar, i) => {
    const isFirst = scholar.halka === 0;
    const isLast = scholar.halka === null || scholar.halka === undefined;

    const node = document.createElement('div');
    node.className = isFirst ? 'silsile-node menba' : (isLast ? 'silsile-node last' : 'silsile-node');
    node.dataset.idx = i;
    node.setAttribute('role', 'listitem');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', halkaEtiketi(scholar) + ': ' + scholar.tam_ad);

    const dates = tarihMetni(scholar);

    node.innerHTML = `
      <div class="sn-halka">${esc(halkaEtiketi(scholar))}</div>
      <div class="sn-name">${esc(scholar.tam_ad)}</div>
      ${dates ? `<div class="sn-dates">${esc(dates)}</div>` : ''}
      <div class="sn-loc">${esc(scholar.sehir)}, ${esc(scholar.ulke)}</div>
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
let modalOncekiOdak = null;

function initModal() {
  const modal = document.getElementById('scholar-modal');
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
}

function showModal(idx) {
  const scholar = DATA[idx];
  const modal = document.getElementById('scholar-modal');
  if (modal.classList.contains('hidden')) modalOncekiOdak = document.activeElement;

  document.getElementById('modal-halka').textContent = halkaEtiketi(scholar);
  document.getElementById('modal-name').textContent = scholar.tam_ad;
  document.getElementById('modal-lakap').textContent = scholar.lakap || '';
  document.getElementById('modal-dates').textContent = tamTarihMetni(scholar);
  document.getElementById('modal-location').textContent = scholar.sehir + ', ' + scholar.ulke;

  const tagsEl = document.getElementById('modal-tags');
  tagsEl.innerHTML = '';
  const eraTag = document.createElement('span');
  eraTag.className = 'modal-tag';
  eraTag.style.background = getEraColor(scholar);
  eraTag.style.color = '#18181f';
  eraTag.textContent = scholar.asir;
  tagsEl.appendChild(eraTag);

  const bolgTag = document.createElement('span');
  bolgTag.className = 'modal-tag';
  bolgTag.style.background = 'rgba(200,150,62,0.25)';
  bolgTag.style.color = '#e8d48b';
  bolgTag.textContent = scholar.bolge;
  tagsEl.appendChild(bolgTag);

  const xrefEl = document.getElementById('modal-xref');
  xrefEl.innerHTML = '';
  const ekle = (etiket, metin, onClick) => {
    const btn = document.createElement('button');
    btn.className = 'modal-xref-btn';
    btn.innerHTML = `<span class="xref-dir">${esc(etiket)}:</span> ${esc(metin)}`;
    btn.onclick = onClick;
    xrefEl.appendChild(btn);
  };
  hocaIndeksleri(idx).forEach(j => ekle(iliskiEtiketi(idx, j, 'hoca'), DATA[j].ad, () => showModal(j)));
  talebeIndeksleri(idx).forEach(j => ekle(iliskiEtiketi(idx, j, 'talebe'), DATA[j].ad, () => showModal(j)));
  ekle('Harita', 'Göster', () => { closeModal(); openPanel(idx); scrollToMap(); });

  document.getElementById('modal-bio').innerHTML = bioHTML(scholar);

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const icerik = modal.querySelector('.modal-content');
  if (icerik) icerik.scrollTop = 0;
  const kapat = modal.querySelector('.modal-close');
  if (kapat) kapat.focus();
}

function closeModal() {
  const modal = document.getElementById('scholar-modal');
  if (modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  if (modalOncekiOdak && typeof modalOncekiOdak.focus === 'function') modalOncekiOdak.focus();
  modalOncekiOdak = null;
}

// ========== SIRAYLA GÖSTER ==========
const METIN_BASLAT = '▶ Sırayla Göster';
const METIN_BITIR = '■ Gösterimi Bitir';
const METIN_DURAKLAT = '❘❘ Duraklat';
const METIN_DEVAM = '▶ Devam';

function initJourneyButton() {
  document.getElementById('btn-journey').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToMap();
    setTimeout(() => { if (!campaignActive) startCampaign(); }, 600);
  });
}

function initCampaignControls() {
  document.getElementById('campaignStartBtn').addEventListener('click', toggleCampaign);
  document.getElementById('campaignPauseBtn').addEventListener('click', pauseCampaign);
  document.getElementById('speed1').addEventListener('click', () => setCampaignSpeed(5000));
  document.getElementById('speed2').addEventListener('click', () => setCampaignSpeed(3000));
  document.getElementById('speed3').addEventListener('click', () => setCampaignSpeed(1500));
  document.getElementById('campaignProgressBar').addEventListener('click', seekCampaign);

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
  if (campaignActive) stopCampaign(); else startCampaign();
}

function startCampaign() {
  if (campaignActive) { stopCampaign(); return; }

  campaignActive = true;
  campaignPaused = false;
  campaignIndex = 0;
  campaignTrailCoords = [];

  document.getElementById('scholar-panel').classList.add('hidden');
  activeScholarIdx = null;
  clearMarkerHighlights();

  if (campaignTrailLine && map.hasLayer(campaignTrailLine)) map.removeLayer(campaignTrailLine);

  campaignTrailLine = L.polyline([], {
    color: '#c8963e',
    weight: 2.5,
    opacity: 0.7,
    dashArray: '6,4',
    className: 'campaign-trail'
  });
  campaignTrailLine.addTo(map);

  const startBtn = document.getElementById('campaignStartBtn');
  startBtn.textContent = METIN_BITIR;
  startBtn.setAttribute('aria-label', 'Sırayla göstermeyi bitir');
  startBtn.classList.add('active');
  document.getElementById('campaignPauseBtn').style.display = '';
  document.getElementById('campaignSpeedCtrl').style.display = '';
  document.getElementById('campaignProgress').classList.add('visible');

  setTimeout(() => showCampaignStep(), 500);
}

function stopCampaign() {
  campaignActive = false;
  campaignPaused = false;
  clearTimeout(campaignTimer);

  if (campaignTrailLine && map.hasLayer(campaignTrailLine)) map.removeLayer(campaignTrailLine);

  document.getElementById('campaignCard').classList.remove('visible');
  document.getElementById('campaignProgress').classList.remove('visible');

  const startBtn = document.getElementById('campaignStartBtn');
  startBtn.textContent = METIN_BASLAT;
  startBtn.setAttribute('aria-label', 'Silsileyi haritada sırayla göster');
  startBtn.classList.remove('active');
  document.getElementById('campaignPauseBtn').style.display = 'none';
  document.getElementById('campaignPauseBtn').textContent = METIN_DURAKLAT;
  document.getElementById('campaignSpeedCtrl').style.display = 'none';

  clearMarkerHighlights();
  map.flyTo([35, 55], 4, { duration: 1 });
}

function pauseCampaign() {
  if (campaignPaused) {
    campaignPaused = false;
    document.getElementById('campaignPauseBtn').textContent = METIN_DURAKLAT;
    showCampaignStep();
  } else {
    campaignPaused = true;
    clearTimeout(campaignTimer);
    document.getElementById('campaignPauseBtn').textContent = METIN_DEVAM;
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
  if (campaignIndex >= DATA.length) { stopCampaign(); return; }

  const scholar = DATA[campaignIndex];
  const coords = [lat(scholar), lng(scholar)];

  campaignTrailCoords.push(coords);
  if (campaignTrailLine) campaignTrailLine.setLatLngs(campaignTrailCoords);

  map.flyTo(coords, campaignIndex === 0 ? 5 : Math.max(map.getZoom(), 5), { duration: 1.2 });

  markers.forEach((m, i) => {
    const inner = m.marker.getElement()?.querySelector('.marker-inner');
    if (inner) {
      inner.classList.toggle('active', i === campaignIndex);
      inner.classList.toggle('highlight', i <= campaignIndex);
    }
  });

  const card = document.getElementById('campaignCard');
  document.getElementById('campaignNum').textContent = markerMetni(scholar);
  document.getElementById('campaignTitle').textContent = scholar.tam_ad;
  document.getElementById('campaignDates').textContent = tarihMetni(scholar);
  document.getElementById('campaignLocation').textContent = scholar.sehir + ', ' + scholar.ulke;
  document.getElementById('campaignLakap').textContent = halkaEtiketi(scholar) + (scholar.lakap ? ' · ' + scholar.lakap : '');

  const summary = String(scholar.biyografi || '').split('\n\n')[0];
  document.getElementById('campaignSummary').textContent =
    summary.length > 180 ? summary.substring(0, 177).replace(/\s+\S*$/, '') + '…' : summary;

  const prevLink = document.getElementById('campaignPrevLink');
  const nextLink = document.getElementById('campaignNextLink');
  prevLink.disabled = campaignIndex === 0;
  nextLink.disabled = campaignIndex >= DATA.length - 1;
  document.getElementById('campaignPrevName').textContent = campaignIndex > 0 ? DATA[campaignIndex - 1].ad : 'Önceki';
  document.getElementById('campaignNextName').textContent = campaignIndex < DATA.length - 1 ? DATA[campaignIndex + 1].ad : 'Sonraki';

  card.classList.remove('visible');
  setTimeout(() => card.classList.add('visible'), 150);

  const total = DATA.length;
  const pct = ((campaignIndex + 1) / total * 100);
  document.getElementById('campaignProgressFill').style.width = pct + '%';
  document.getElementById('campaignProgressLabel').textContent = (campaignIndex + 1) + ' / ' + total;
  document.getElementById('campaignProgressBar').setAttribute('aria-valuenow', campaignIndex + 1);

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

  campaignTrailCoords = DATA.slice(0, campaignIndex).map(s => [lat(s), lng(s)]);
  if (campaignTrailLine) campaignTrailLine.setLatLngs(campaignTrailCoords);

  clearTimeout(campaignTimer);
  campaignPaused = false;
  document.getElementById('campaignPauseBtn').textContent = METIN_DURAKLAT;
  showCampaignStep();
}

// ========== MOBİL MENÜ ==========
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('main-nav');

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    btn.setAttribute('aria-label', isOpen ? 'Menüyü kapat' : 'Menüyü aç');
  });

  document.querySelectorAll('#main-nav a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Menüyü aç');
    });
  });
}

// ========== KAYDIRMA ANİMASYONLARI ==========
function initScrollAnimations() {
  const hedefler = document.querySelectorAll('.section-header, .silsile-wrapper, .tanitim-content');
  const azHareket = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (azHareket || !('IntersectionObserver' in window)) {
    hedefler.forEach(el => el.classList.add('fade-in', 'visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.01 });
    hedefler.forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    header.style.background = window.scrollY > 100 ? 'rgba(24,24,31,0.98)' : 'rgba(24,24,31,0.95)';
  }, { passive: true });
}

// ========== SEO: JSON-LD ==========
function injectPersonSchema() {
  const persons = DATA.map((s) => {
    const p = {
      '@type': 'Person',
      'name': s.tam_ad,
      'alternateName': s.ad,
      'description': s.lakap || ''
    };
    const d = yilSayisi(s.dogum), v = yilSayisi(s.vefat);
    if (!isNaN(d) && !/[~?]/.test(String(s.dogum))) p.birthDate = String(d);
    if (!isNaN(v) && !/[~?]/.test(String(s.vefat))) p.deathDate = String(v);
    return p;
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Silsile-i Aliyye',
    'description': "Se'âdet-i Ebediyye'deki Silsile-i aliyye büyüklerinin kabr-i şerîflerinin bulunduğu yerler",
    'numberOfItems': DATA.length,
    'itemListElement': persons.map((p, i) => ({ '@type': 'ListItem', 'position': i + 1, 'item': p }))
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
