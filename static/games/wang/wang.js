/* Wang tiles lab: a small corner-Wang tile set drawn in code (16 corner patterns x 4 variants, 16x16 pixels each),
   then three demos: repeated or random tiles vs Wang tiles, the tile sheet, and paint-your-own autotiling.
   A tile's index is its four corners read as bits: top-left 1, top-right 2, bottom-right 4, bottom-left 8 (1 = path). */
(function (W, D) {
  'use strict';
  var T = 16, VARS = 4;
  var GRASS = ['#6f9a3e', '#7ba648', '#86b052', '#668f38'], GDARK = '#557a2c', TUFT = '#9cc061';
  var PATH = ['#dcc9a0', '#d4bf93', '#e3d2ad'], PDARK = '#b39a6c', EDGE = '#8a7048', PEB = '#c4ae82';

  function hash(a, b, c) { // small deterministic hash, 0..1
    var h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0; h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y, s) { // value noise on a 4x4 lattice inside the tile
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    var a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  }
  function inner(u) { var m = Math.min(u, 1 - u); return Math.max(0, Math.min(1, (m - 0.1) / 0.22)); }

  // The terrain field: bilinear blend of the corners, plus wobble that fades to zero near the tile's sides.
  // Along a side only its two corners matter, so any two tiles that agree on a shared side join without a seam.
  function field(id, v, x, y) {
    var tl = id & 1, tr = id >> 1 & 1, br = id >> 2 & 1, bl = id >> 3 & 1;
    var u = (x + 0.5) / T, w = (y + 0.5) / T;
    var b = (tl * (1 - u) + tr * u) * (1 - w) + (bl * (1 - u) + br * u) * w;
    var n = vnoise(u * 3, w * 3, id * 7 + v * 131 + 5) - 0.5;
    return b + n * 0.7 * inner(u) * inner(w);
  }
  function drawTile(id, v) {
    var cv = D.createElement('canvas'); cv.width = T; cv.height = T;
    var c = cv.getContext('2d'), img = c.createImageData(T, T), f = [], x, y;
    for (y = 0; y < T; y++) for (x = 0; x < T; x++) f[y * T + x] = field(id, v, x, y);
    function on(x, y) { // path test, reading the field just past the tile's side when needed
      if (x < 0 || y < 0 || x >= T || y >= T) return field(id, v, Math.max(-0.5, Math.min(T - 0.5, x)), Math.max(-0.5, Math.min(T - 0.5, y))) > 0.5;
      return f[y * T + x] > 0.5;
    }
    for (y = 0; y < T; y++) for (x = 0; x < T; x++) {
      var p = f[y * T + x] > 0.5, r = hash(x, y, id * 31 + v * 977), col;
      if (p) {
        var edge = !on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1);
        col = edge ? EDGE : (!on(x, y - 2) ? PDARK : PATH[(r * 3) | 0]);
        if (!edge && r > 0.94) col = PEB;
      } else {
        var nearP = on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1);
        col = nearP ? GDARK : GRASS[(vnoise(x / 3, y / 3, v * 17 + id) * 4) | 0];
        if (!nearP && r > 0.93) col = TUFT;
      }
      var k = (y * T + x) * 4, n = parseInt(col.slice(1), 16);
      img.data[k] = n >> 16; img.data[k + 1] = n >> 8 & 255; img.data[k + 2] = n & 255; img.data[k + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    return cv;
  }
  var TILES = [];
  for (var id = 0; id < 16; id++) { TILES[id] = []; for (var v = 0; v < VARS; v++) TILES[id][v] = drawTile(id, v); }

  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }
  function prep(cv, cols, rows) { cv.width = cols * T; cv.height = rows * T; var c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return c; }
  function cornerId(g, cols, x, y) { // g holds (cols+1) x (rows+1) corner values
    var r = cols + 1;
    return g[y * r + x] | g[y * r + x + 1] << 1 | g[(y + 1) * r + x + 1] << 2 | g[(y + 1) * r + x] << 3;
  }

  // ---- 1: repeated or random vs Wang ----
  var COLS = 12, ROWS = 9, seed = 7;
  var cvA = D.getElementById('wt-a'), cvB = D.getElementById('wt-b'), modeA = 'random';
  function corners(R, cols, rows, p) { var g = []; for (var i = 0; i < (cols + 1) * (rows + 1); i++) g[i] = R() < p ? 1 : 0; return g; }
  function drawCompare() {
    var R = rng(seed * 9973), g = corners(R, COLS, ROWS, 0.4), a = prep(cvA, COLS, ROWS), b = prep(cvB, COLS, ROWS), x, y;
    // "Repeat": a 3x3 patch of the same corners copied over and over, so it joins up but the pattern is plain to see.
    var rep = []; for (y = 0; y <= ROWS; y++) for (x = 0; x <= COLS; x++) rep[y * (COLS + 1) + x] = g[(y % 3) * (COLS + 1) + (x % 3)];
    for (y = 0; y < ROWS; y++) for (x = 0; x < COLS; x++) {
      a.drawImage(modeA === 'repeat' ? TILES[cornerId(rep, COLS, x, y)][0] : TILES[(R() * 16) | 0][(R() * VARS) | 0], x * T, y * T);
      b.drawImage(TILES[cornerId(g, COLS, x, y)][(R() * VARS) | 0], x * T, y * T);
    }
    cvA.setAttribute('aria-label', modeA === 'repeat' ? 'One small patch repeated: the same shape shows over and over.' : 'Tiles picked at random: paths break off at the tile sides.');
    lab('wt-la', modeA === 'repeat' ? 'One patch, repeated' : 'Random tiles');
  }
  function lab(id, t) { var el = D.getElementById(id); if (el) el.textContent = t; }
  D.getElementById('wt-new').addEventListener('click', function () { seed = (seed * 48271) % 2147483647; drawCompare(); });
  [].forEach.call(D.querySelectorAll('[data-wt-a]'), function (btn) {
    btn.addEventListener('click', function () {
      modeA = btn.getAttribute('data-wt-a');
      [].forEach.call(D.querySelectorAll('[data-wt-a]'), function (o) { o.setAttribute('aria-pressed', o === btn ? 'true' : 'false'); });
      drawCompare();
    });
  });
  drawCompare();

  // ---- 2: the tile sheet ----
  var sheet = D.getElementById('wt-sheet');
  if (sheet) {
    var sc = prep(sheet, 16, 1);
    for (var i = 0; i < 16; i++) sc.drawImage(TILES[i][0], i * T, 0);
    var nums = D.getElementById('wt-nums');
    if (nums) for (var j = 0; j < 16; j++) { var s = D.createElement('span'); s.textContent = j; nums.appendChild(s); }
  }

  // ---- 3: paint and autotile ----
  var PC = 16, PR = 10, cvP = D.getElementById('wt-paint'), grid = [], auto = true, erase = false, showIds = false, down = false;
  for (var k = 0; k < (PC + 1) * (PR + 1); k++) grid[k] = 0;
  (function starter() { // a little path to start from
    for (var x = 2; x <= 13; x++) grid[5 * (PC + 1) + x] = 1;
    for (var y = 2; y <= 8; y++) grid[y * (PC + 1) + 8] = 1;
    grid[4 * (PC + 1) + 12] = grid[4 * (PC + 1) + 13] = grid[6 * (PC + 1) + 12] = 1;
  })();
  var pick = []; for (var q = 0; q < PC * PR; q++) pick[q] = (hash(q, 3, 11) * VARS) | 0; // variant per cell, fixed, so painting never reshuffles other cells
  function drawPaint() {
    var c = prep(cvP, PC, PR), x, y, r = PC + 1;
    if (auto) {
      for (y = 0; y < PR; y++) for (x = 0; x < PC; x++) c.drawImage(TILES[cornerId(grid, PC, x, y)][pick[y * PC + x]], x * T, y * T);
    } else { // no autotiling: each painted corner is a hard square, the way a plain grid looks
      for (y = 0; y < PR; y++) for (x = 0; x < PC; x++) c.drawImage(TILES[0][pick[y * PC + x]], x * T, y * T);
      for (y = 0; y <= PR; y++) for (x = 0; x <= PC; x++) if (grid[y * r + x]) { c.fillStyle = PATH[0]; c.fillRect(x * T - T / 2, y * T - T / 2, T, T); }
    }
    if (showIds && auto) {
      c.font = '7px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (y = 0; y < PR; y++) for (x = 0; x < PC; x++) {
        var t = cornerId(grid, PC, x, y); c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(x * T + 3, y * T + 4, 10, 8);
        c.fillStyle = '#fff'; c.fillText(String(t), x * T + 8, y * T + 8.5);
      }
    }
  }
  function paintAt(ev) {
    var rc = cvP.getBoundingClientRect(), x = Math.round((ev.clientX - rc.left) / rc.width * PC), y = Math.round((ev.clientY - rc.top) / rc.height * PR);
    if (x < 0 || y < 0 || x > PC || y > PR) return;
    var i = y * (PC + 1) + x, val = erase ? 0 : 1;
    if (grid[i] !== val) { grid[i] = val; drawPaint(); }
  }
  cvP.addEventListener('pointerdown', function (e) { down = true; try { cvP.setPointerCapture(e.pointerId); } catch (er) { } paintAt(e); e.preventDefault(); });
  cvP.addEventListener('pointermove', function (e) { if (down) paintAt(e); });
  ['pointerup', 'pointercancel'].forEach(function (n) { cvP.addEventListener(n, function () { down = false; }); });
  function toggle(id, fn) { var b = D.getElementById(id); b.addEventListener('click', function () { var on = fn(); b.setAttribute('aria-pressed', on ? 'true' : 'false'); drawPaint(); }); }
  toggle('wt-auto', function () { auto = !auto; return auto; });
  toggle('wt-erase', function () { erase = !erase; return erase; });
  toggle('wt-ids', function () { showIds = !showIds; return showIds; });
  D.getElementById('wt-clear').addEventListener('click', function () { for (var i = 0; i < grid.length; i++) grid[i] = 0; drawPaint(); });
  drawPaint();
})(window, document);
