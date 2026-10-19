(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const GRID = { rows: 12, cols: 16, south: 25.82, north: 27.48, west: 54.92, east: 57.28 };
  const LEVELS = { easy: 18, normal: 28, hard: 40 };
  let level = 'normal', mineTotal = LEVELS.normal, cells = [], tileLayers = [], labelLayers = [];
  let started = false, ended = false, flagMode = false, gridVisible = true, elapsed = 0, timerId = null;
  let toastTimeout = null, bestTimes = {};
  try { bestTimes = JSON.parse(localStorage.getItem('hormuz-sweeper-best') || '{}') || {}; } catch (_) { bestTimes = {}; }

  const map = L.map('map', { zoomControl: true, preferCanvas: true, zoomSnap: 0.25, minZoom: 6, maxZoom: 11, attributionControl: true }).setView([26.66, 56.12], 8.25);
  // Real-world basemaps: default to satellite imagery; switchable to a clean geographic map.
  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Imagery &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community'
  });
  const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
  });
  let usingSatellite = true;
  satelliteLayer.addTo(map);
  $('toggleBasemap').addEventListener('click', () => {
    if (usingSatellite) {
      map.removeLayer(satelliteLayer); streetLayer.addTo(map); usingSatellite = false;
      $('toggleBasemap').innerHTML = '🗺 <span class="map-tools-label">نقشه: جغرافیایی</span>';
      showToast('نمای نقشهٔ جغرافیایی فعال شد.');
    } else {
      map.removeLayer(streetLayer); satelliteLayer.addTo(map); usingSatellite = true;
      $('toggleBasemap').innerHTML = '🛰 <span class="map-tools-label">نقشه: ماهواره‌ای</span>';
      showToast('نمای تصاویر ماهواره‌ای فعال شد.');
    }
  });
  map.on('mousemove', (e) => { $('coordText').textContent = `${e.latlng.lat.toFixed(4)}° N · ${e.latlng.lng.toFixed(4)}° E`; });

  function formatTime(seconds) { const m = Math.floor(seconds / 60).toString().padStart(2, '0'); const s = (seconds % 60).toString().padStart(2, '0'); return `${m}:${s}`; }
  function padded(n) { return String(n).padStart(3, '0'); }
  function showToast(message) {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('show'), 2100);
  }
  function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }
  function startTimer() {
    if (timerId || ended) return;
    timerId = setInterval(() => { elapsed++; $('timer').textContent = formatTime(elapsed); }, 1000);
  }
  function cellId(r, c) { return r * GRID.cols + c; }
  function neighbors(index) {
    const r = Math.floor(index / GRID.cols), c = index % GRID.cols, out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < GRID.rows && nc >= 0 && nc < GRID.cols) out.push(cellId(nr, nc));
    }
    return out;
  }
  function boundsFor(r, c) {
    const latStep = (GRID.north - GRID.south) / GRID.rows;
    const lonStep = (GRID.east - GRID.west) / GRID.cols;
    return [[GRID.south + r * latStep, GRID.west + c * lonStep], [GRID.south + (r + 1) * latStep, GRID.west + (c + 1) * lonStep]];
  }
  function centerFor(bounds) { return [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]; }
  function baseStyle(cell) {
    if (cell.exploded) return { color: '#ff6579', weight: 2, opacity: .98, fillColor: '#ff5267', fillOpacity: .55 };
    if (cell.revealed && cell.mine) return { color: '#f26b79', weight: 1.1, opacity: .95, fillColor: '#e64d63', fillOpacity: .45 };
    if (cell.revealed) return { color: '#79d9dc', weight: .8, opacity: .55, fillColor: '#082638', fillOpacity: .56 };
    if (cell.flagged) return { color: '#ffce7f', weight: 1.5, opacity: .94, fillColor: '#a76a20', fillOpacity: .36 };
    return { color: '#8ce7f5', weight: gridVisible ? .95 : 0, opacity: gridVisible ? .78 : 0, fillColor: '#0b3044', fillOpacity: gridVisible ? .16 : 0 };
  }
  function iconFor(cell) {
    let html = '', klass = '';
    if (cell.flagged && !cell.revealed) { html = '<span class="flag">⚑</span>'; klass = 'flag'; }
    else if (cell.revealed && cell.mine) { html = `<span class="mine ${cell.exploded ? 'exploded' : ''}">✹</span>`; }
    else if (cell.revealed && cell.adjacent > 0) { html = `<span class="n${Math.min(cell.adjacent,4)}">${cell.adjacent}</span>`; }
    else if (cell.revealed && cell.adjacent === 0) { html = '<span style="opacity:.15">·</span>'; }
    if (!html) return null;
    return L.divIcon({ className: `cell-number ${klass}`, html, iconSize: [30, 30], iconAnchor: [15, 15] });
  }
  function updateCellVisual(i) {
    const cell = cells[i];
    tileLayers[i].setStyle(baseStyle(cell));
    const icon = iconFor(cell);
    if (icon) {
      if (labelLayers[i]) labelLayers[i].setIcon(icon).setOpacity(1);
      else { labelLayers[i] = L.marker(centerFor(boundsFor(cell.r, cell.c)), { icon, interactive: false, keyboard: false, zIndexOffset: 400 }).addTo(map); }
    } else if (labelLayers[i]) { map.removeLayer(labelLayers[i]); labelLayers[i] = null; }
    if (!gridVisible && !cell.revealed && !cell.flagged) tileLayers[i].setStyle({ weight: 0, opacity: 0, fillOpacity: 0 });
  }
  function updateStats() {
    const flags = cells.filter(c => c.flagged).length;
    const revealed = cells.filter(c => c.revealed && !c.mine).length;
    $('mineCount').textContent = padded(Math.max(0, mineTotal - flags));
    $('revealedCount').textContent = padded(revealed);
    $('timer').textContent = formatTime(elapsed);
    $('bestTime').textContent = bestTimes[level] == null ? '—' : formatTime(bestTimes[level]);
  }
  function createBoard() {
    stopTimer(); started = false; ended = false; elapsed = 0; flagMode = false;
    $('flagModeBtn').classList.remove('on'); $('flagModeBtn').textContent = '⚑ حالت پرچم: خاموش';
    $('endOverlay').classList.remove('show'); $('statusText').textContent = 'آمادهٔ شروع';
    tileLayers.forEach(l => map.removeLayer(l)); labelLayers.forEach(l => { if (l) map.removeLayer(l); });
    tileLayers = []; labelLayers = []; cells = [];
    for (let r = 0; r < GRID.rows; r++) for (let c = 0; c < GRID.cols; c++) {
      const i = cellId(r, c), cell = { i, r, c, mine: false, adjacent: 0, revealed: false, flagged: false, exploded: false };
      cells.push(cell); labelLayers.push(null);
      const layer = L.rectangle(boundsFor(r, c), { ...baseStyle(cell), className: 'cell', interactive: true, bubblingMouseEvents: false }).addTo(map);
      layer.on('click', (e) => { L.DomEvent.stopPropagation(e); handleCell(i); });
      layer.on('contextmenu', (e) => { L.DomEvent.preventDefault(e); L.DomEvent.stopPropagation(e); toggleFlag(i); });
      tileLayers.push(layer);
    }
    updateStats();
  }
  function generateMines(safeIndex) {
    const safe = new Set([safeIndex, ...neighbors(safeIndex)]);
    const eligible = cells.filter(c => !safe.has(c.i));
    for (let i = eligible.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [eligible[i], eligible[j]] = [eligible[j], eligible[i]]; }
    eligible.slice(0, Math.min(mineTotal, eligible.length)).forEach(c => c.mine = true);
    cells.forEach(c => { c.adjacent = c.mine ? 0 : neighbors(c.i).filter(n => cells[n].mine).length; });
  }
  function handleCell(i) {
    if (ended) return;
    if (flagMode) { toggleFlag(i); return; }
    const cell = cells[i];
    if (cell.revealed || cell.flagged) return;
    if (!started) { generateMines(i); started = true; startTimer(); $('statusText').textContent = 'در حال بررسی'; }
    if (cell.mine) { cell.revealed = true; cell.exploded = true; loseGame(i); updateCellVisual(i); return; }
    revealSafe(i); updateAllVisibleStats(); checkWin();
  }
  function revealSafe(startIndex) {
    const stack = [startIndex], visited = new Set();
    while (stack.length) {
      const i = stack.pop(); if (visited.has(i)) continue; visited.add(i);
      const cell = cells[i];
      if (!cell || cell.revealed || cell.flagged || cell.mine) continue;
      cell.revealed = true; updateCellVisual(i);
      if (cell.adjacent === 0) neighbors(i).forEach(n => { if (!visited.has(n)) stack.push(n); });
    }
  }
  function toggleFlag(i) {
    if (ended) return;
    const cell = cells[i]; if (cell.revealed) return;
    const flags = cells.filter(c => c.flagged).length;
    if (!cell.flagged && flags >= mineTotal) { showToast('تعداد پرچم‌ها به سقف این مرحله رسیده است.'); return; }
    cell.flagged = !cell.flagged; updateCellVisual(i); updateStats();
  }
  function updateAllVisibleStats() { updateStats(); }
  function loseGame(hitIndex) {
    ended = true; stopTimer(); $('statusText').textContent = 'مأموریت ناموفق';
    cells.forEach(c => { if (c.mine) c.revealed = true; updateCellVisual(c.i); });
    $('endIcon').textContent = '✹'; $('endTitle').textContent = 'به یکی از خطرها برخورد کردی'; $('endMessage').textContent = 'این دور تمام شد. با شروع دوباره، آرایش خطرها تغییر می‌کند.';
    $('endOverlay').classList.add('show'); updateStats();
  }
  function checkWin() {
    const safeTotal = cells.length - mineTotal;
    const safeRevealed = cells.filter(c => c.revealed && !c.mine).length;
    if (safeRevealed >= safeTotal) {
      ended = true; stopTimer(); $('statusText').textContent = 'مأموریت موفق';
      const prev = bestTimes[level];
      if (prev == null || elapsed < prev) { bestTimes[level] = elapsed; try { localStorage.setItem('hormuz-sweeper-best', JSON.stringify(bestTimes)); } catch (_) {} }
      cells.forEach(c => { if (c.mine) c.flagged = true; updateCellVisual(c.i); });
      $('endIcon').textContent = '✓'; $('endTitle').textContent = 'محدوده پاک‌سازی شد!'; $('endMessage').textContent = `همهٔ خانه‌های امن را در ${formatTime(elapsed)} باز کردی. عالی بود!`;
      $('endOverlay').classList.add('show'); updateStats();
    }
  }
  function setLevel(next) {
    level = next; mineTotal = LEVELS[level];
    document.querySelectorAll('.difficulty button').forEach(b => b.classList.toggle('active', b.dataset.level === level));
    document.querySelector('[data-level="easy"] span').textContent = '۱۸ خطر';
    document.querySelector('[data-level="normal"] span').textContent = '۲۸ خطر';
    document.querySelector('[data-level="hard"] span').textContent = '۴۰ خطر';
    createBoard(); showToast('سطح دشواری تغییر کرد.');
  }
  document.querySelectorAll('.difficulty button').forEach(b => b.addEventListener('click', () => setLevel(b.dataset.level)));
  $('restartBtn').addEventListener('click', () => { createBoard(); showToast('آرایش جدید آماده است.'); });
  $('newGameTop').addEventListener('click', () => { createBoard(); showToast('بازی جدید شروع شد.'); });
  $('playAgainBtn').addEventListener('click', () => { createBoard(); showToast('موفق باشی!'); });
  $('flagModeBtn').addEventListener('click', () => {
    flagMode = !flagMode; $('flagModeBtn').classList.toggle('on', flagMode);
    $('flagModeBtn').textContent = flagMode ? '⚑ حالت پرچم: روشن' : '⚑ حالت پرچم: خاموش';
    showToast(flagMode ? 'خانه‌ها را برای علامت‌گذاری انتخاب کن.' : 'حالت باز کردن خانه فعال شد.');
  });
  $('zoomToBoard').addEventListener('click', () => { map.fitBounds([[GRID.south, GRID.west], [GRID.north, GRID.east]], { padding: [45, 45], animate: true }); });
  $('toggleGrid').addEventListener('click', () => {
    gridVisible = !gridVisible; $('toggleGrid').innerHTML = `▦ <span class="map-tools-label">نمایش شبکه: ${gridVisible ? 'روشن' : 'خاموش'}</span>`;
    cells.forEach(c => updateCellVisual(c.i));
  });
  map.on('click', () => { if (flagMode) { flagMode = false; $('flagModeBtn').classList.remove('on'); $('flagModeBtn').textContent = '⚑ حالت پرچم: خاموش'; } });
  createBoard();
  setTimeout(() => { map.invalidateSize(); map.fitBounds([[GRID.south, GRID.west], [GRID.north, GRID.east]], { padding: [35, 35] }); }, 200);
  window.addEventListener('resize', () => map.invalidateSize());
})();
