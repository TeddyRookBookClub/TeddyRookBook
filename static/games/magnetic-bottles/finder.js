/* Magnetic Bottles: "Find a better bottle". A trade-off map (any two settings across and up, colored by one output, the
   forbidden region hatched), a goal finder (a coarse scan, then Nelder-Mead, drawn on the map as it runs) and a trade-off
   (Pareto) chart of many sampled bottles. The numbers come from explore.js, worked out in a Web Worker when possible. */
(function () {
  'use strict';
  var root = document.getElementById('magnetic-bottles-lab'), secEl = document.getElementById('mb-find');
  var L = window.TRBLab, MB = window.MagBottles, X = window.MBExplore;
  if (!root || !secEl || !L || !MB || !X || !root.mbApi) return;
  function $(id) { return document.getElementById(id); }
  var PI = Math.PI, TAU = 2 * PI, f = L.fmt, reduced = L.reduced, store = L.store('magnetic-bottles');
  var client = X.shared(), state = root.mbApi.get();
  var phone = Math.min(window.innerWidth, window.innerHeight) < 600 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  var C = { gold: '#ffd479', aqua: '#63e6be', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', ink: '#dbe7ef', muted: '#8fb3c6', bg: '#06111a', grid: 'rgba(120,170,200,0.18)' };

  /* ---------- names and formats ---------- */
  var SYM = { f1: { eps: 'ε', tau: 'τ₀', delta: 'δ' }, f2: { eps: 'ε', S: 'S', lam: 'λ', tau: 'τ₁', delta: 'δ' } };
  var LONG = { f1: { eps: 'Elongation ε', tau: 'Symmetry breaking τ₀', delta: 'Size δ' }, f2: { eps: 'Focal distance ε', S: 'Axis size S', lam: 'Vertical scale λ', tau: 'Symmetry breaking τ₁', delta: 'Size δ' } };
  var OUTN = { bV: 'Average β (β<sub>V</sub>)', V: 'Volume <var>V</var>', ie: 'Twist ι at the edge', sh: 'Shear ι<sub>edge</sub> − ι<sub>axis</sub>', ash: 'Shear, size of |ι<sub>edge</sub> − ι<sub>axis</sub>|', rip: 'Ripple on the edge, |<b>B</b>|<sub>max</sub> ÷ |<b>B</b>|<sub>min</sub>', gap: 'Mirror gap ÷ plasma radius' };
  var OUTT = { bV: 'Average β', V: 'Volume V', ie: 'Twist ι at the edge', sh: 'Shear', ash: '|Shear|', rip: 'Ripple', gap: 'Mirror gap ÷ radius' };
  function fv(o, v) {
    if (!isFinite(v)) return '—';
    if (o === 'bV') return f(100 * v, 2) + '%';
    if (o === 'gap') return f(v, 2) + '×';
    if (o === 'V') return Math.abs(v) < 0.01 ? v.toPrecision(3) : f(v, 3);
    return f(v, 3);
  }
  function fs(fam, k, v) { return k === 'delta' ? f(v, fam === 'f1' ? 4 : 3) : f(v, 2); }
  function f2only(o) { return o === 'ie' || o === 'sh' || o === 'ash'; }

  /* ---------- color ramp: dark green to pale gold, lightness rising with the value ---------- */
  var RAMP = [[0, 9, 34, 26], [0.2, 13, 74, 52], [0.4, 30, 120, 82], [0.6, 82, 170, 120], [0.8, 168, 214, 160], [1, 255, 240, 196]];
  function ramp(t, o) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    for (var i = 1; i < RAMP.length; i++) if (t <= RAMP[i][0]) { var a = RAMP[i - 1], b = RAMP[i], u = (t - a[0]) / (b[0] - a[0]); o[0] = a[1] + (b[1] - a[1]) * u; o[1] = a[2] + (b[2] - a[2]) * u; o[2] = a[3] + (b[3] - a[3]) * u; return o; }
    o[0] = 255; o[1] = 240; o[2] = 196; return o;
  }
  function rampCss() { return 'linear-gradient(90deg,' + RAMP.map(function (s) { return 'rgb(' + s[1] + ',' + s[2] + ',' + s[3] + ') ' + s[0] * 100 + '%'; }).join(',') + ')'; }
  function niceStep(x) { var e = Math.pow(10, Math.floor(Math.log10(x))), m = x / e; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e; }

  /* ================= the trade-off map ================= */
  var mapCv = $('mb-map'), MG = L.canvas(mapCv), tip = $('mb-map-tip'), mapCap = $('mb-map-cap'), live = $('mb-map-live');
  var selX = $('mb-map-x'), selY = $('mb-map-y'), selO = $('mb-map-o');
  var DEFMAP = { f1: { kx: 'eps', ky: 'delta', o: 'bV' }, f2: { kx: 'S', ky: 'delta', o: 'bV' } };
  var mapSet = store.get('map', null) || {};
  ['f1', 'f2'].forEach(function (fm) {
    var d = mapSet[fm] || {}, ok = d.kx && d.ky && d.kx !== d.ky && X.spec(fm, d.kx) && X.spec(fm, d.ky) && X.OUT[d.o] && !(fm === 'f1' && f2only(d.o)) && d.o !== 'ash';
    mapSet[fm] = ok ? d : Object.assign({}, DEFMAP[fm]);
  });
  var grid = null, mapKey = '', mapT = 0, path = null;
  function gridSize(o) { var heavy = o === 'gap'; return phone ? (heavy ? [20, 15] : [30, 22]) : (heavy ? [34, 26] : [48, 36]); }
  function fillSelects() {
    var fam = state.fam, ms = mapSet[fam], ks = X.keys(fam);
    selX.innerHTML = ks.map(function (k) { return '<option value="' + k + '"' + (k === ms.kx ? ' selected' : '') + '>' + LONG[fam][k] + '</option>'; }).join('');
    selY.innerHTML = ks.map(function (k) { return '<option value="' + k + '"' + (k === ms.ky ? ' selected' : '') + '>' + LONG[fam][k] + '</option>'; }).join('');
    selO.innerHTML = ['bV', 'V', 'ie', 'sh', 'rip', 'gap'].map(function (o) {
      var dis = fam === 'f1' && f2only(o);
      return '<option value="' + o + '"' + (o === ms.o ? ' selected' : '') + (dis ? ' disabled' : '') + '>' + OUTT[o] + (dis ? ' (always 2 here)' : '') + '</option>';
    }).join('');
  }
  function onSel() {
    var ms = mapSet[state.fam], nx = selX.value, ny = selY.value;
    if (nx === ny) { if (this === selX) ny = ms.kx; else nx = ms.ky; }        // picking the other axis's setting swaps the two
    ms.kx = nx; ms.ky = ny; ms.o = selO.value; store.set('map', mapSet); fillSelects(); path = null; requestMap();
  }
  selX.addEventListener('change', onSel); selY.addEventListener('change', onSel); selO.addEventListener('change', onSel);

  function plotRect() { var w = MG.w, h = MG.h; return { x: 50, y: 12, w: Math.max(40, w - 62), h: Math.max(40, h - 52) }; }
  function requestMap() {
    var fam = state.fam, ms = mapSet[fam], n = gridSize(ms.o), P = state.P, fixed = {};
    X.keys(fam).forEach(function (k) { if (k !== ms.kx && k !== ms.ky) fixed[k] = P[k]; });
    var key = fam + ms.kx + ms.ky + ms.o + JSON.stringify(fixed) + n.join('x');
    if (key === mapKey && grid) { drawMap(); return; }
    mapKey = key;
    var g = grid = { fam: fam, kx: ms.kx, ky: ms.ky, o: ms.o, nx: n[0], ny: n[1], P: X.copy(P), xr: X.mapRange(fam, ms.kx, P, ms.ky), yr: X.mapRange(fam, ms.ky, P, ms.kx),
      v: new Float64Array(n[0] * n[1]).fill(NaN), lev: new Float64Array(n[0] * n[1]).fill(99), shown: new Float64Array(n[0] * n[1]).fill(NaN), ok: new Uint8Array(n[0] * n[1]), done: false, count: 0, t0: performance.now(), contours: null };
    /* where the surfaces are nested: known at once from the formulas */
    var Q = X.copy(P), nOk = 0;
    for (var j = 0; j < g.ny; j++) for (var i = 0; i < g.nx; i++) { Q[g.kx] = gx(g, i); Q[g.ky] = gy(g, j); var ok = X.valid(fam, Q); g.ok[j * g.nx + i] = ok ? 1 : 0; nOk += ok; }
    g.total = nOk; g.valid = validField(g);
    client.run('map', 'map', { fam: fam, P: P, kx: g.kx, ky: g.ky, o: g.o, nx: g.nx, ny: g.ny }, function (m, done) {
      if (g !== grid) return;
      if (m && m.t === 'pts') {
        var d = m.d;
        for (var q = 0; q < d.length; q += 3) {
          var id = d[q], v = d[q + 1], lv = d[q + 2], i0 = id % g.nx, j0 = (id - i0) / g.nx;
          g.v[id] = v; if (g.ok[id]) g.count++;
          for (var jj = j0; jj < Math.min(g.ny, j0 + lv); jj++) for (var ii = i0; ii < Math.min(g.nx, i0 + lv); ii++) {
            var p = jj * g.nx + ii, l2 = (p === id) ? 0 : lv; if (l2 <= g.lev[p] && g.ok[p]) { g.lev[p] = l2; g.shown[p] = v; }
          }
        }
        drawMapSoon();
      }
      if (done) { g.done = true; g.ms = performance.now() - g.t0; g.contours = contours(g); drawMap(); }
    });
    drawMap();
  }
  function gx(g, i) { return g.xr[0] + (g.xr[1] - g.xr[0]) * i / (g.nx - 1); }
  function gy(g, j) { return g.yr[0] + (g.yr[1] - g.yr[0]) * j / (g.ny - 1); }
  /* a fine field of (allowed delta - delta) for the forbidden region's edge */
  function validField(g) {
    var n = 100, m = 76, out = new Float64Array((n + 1) * (m + 1)), Q = X.copy(g.P);
    for (var j = 0; j <= m; j++) for (var i = 0; i <= n; i++) { Q[g.kx] = g.xr[0] + (g.xr[1] - g.xr[0]) * i / n; Q[g.ky] = g.yr[0] + (g.yr[1] - g.yr[0]) * j / m; out[j * (n + 1) + i] = 0.98 * X.dmax(g.fam, Q) - Q.delta; }
    return { n: n, m: m, a: out };
  }
  function scaleOf(g) {
    var lo = 1e300, hi = -1e300, src = g.done ? g.v : g.shown;
    for (var i = 0; i < src.length; i++) { var v = src[i]; if (v === v && g.ok[i]) { if (v < lo) lo = v; if (v > hi) hi = v; } }
    if (!(hi >= lo)) return null;
    var log = (g.o === 'V' || g.o === 'rip') && lo > 0 && hi / lo > 20;
    var a = log ? Math.log(lo) : lo, b = log ? Math.log(hi) : hi; if (b - a < 1e-12) { b = a + 1e-6; }
    return { lo: lo, hi: hi, log: log, t: function (v) { return ((log ? Math.log(v) : v) - a) / (b - a); }, inv: function (t) { var u = a + (b - a) * t; return log ? Math.exp(u) : u; } };
  }
  function contours(g) {
    var sc = scaleOf(g); if (!sc) return null;
    var levels = [], n = 7;
    if (sc.log) { for (var k = 1; k < n; k++) levels.push(sc.inv(k / n)); }
    else { var st = niceStep((sc.hi - sc.lo) / 6); for (var v = Math.ceil(sc.lo / st) * st; v < sc.hi; v += st) if (v > sc.lo) levels.push(v); }
    return levels.map(function (lv) { var segs = []; march(g.v, g.nx - 1, g.ny - 1, lv, function (a, b, c2, d) { segs.push(a, b, c2, d); }); return { v: lv, segs: segs }; });
  }
  var heat = document.createElement('canvas'), hctx = heat.getContext('2d'), drawT = 0, rgbv = [0, 0, 0];
  function drawMapSoon() { if (!drawT) drawT = requestAnimationFrame(function () { drawT = 0; drawMap(); }); }
  function drawMap() {
    var g = grid; if (!g) return;
    MG.fit(); var c = MG.c, w = MG.w, h = MG.h, R = plotRect();
    c.clearRect(0, 0, w, h); c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
    function X_(v) { return R.x + R.w * (v - g.xr[0]) / (g.xr[1] - g.xr[0]); }
    function Y_(v) { return R.y + R.h * (1 - (v - g.yr[0]) / (g.yr[1] - g.yr[0])); }
    /* hatch: everything first; the heat map covers the allowed part */
    c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
    c.fillStyle = '#140d14'; c.fillRect(R.x, R.y, R.w, R.h);
    c.strokeStyle = 'rgba(255,135,135,0.33)'; c.lineWidth = 1; c.beginPath();
    for (var d = -R.h; d < R.w; d += 9) { c.moveTo(R.x + d, R.y + R.h); c.lineTo(R.x + d + R.h, R.y); } c.stroke();
    var sc = scaleOf(g);
    heat.width = g.nx; heat.height = g.ny; var img = hctx.createImageData(g.nx, g.ny);
    for (var j = 0; j < g.ny; j++) for (var i = 0; i < g.nx; i++) {
      var id = j * g.nx + i, p = ((g.ny - 1 - j) * g.nx + i) * 4; if (!g.ok[id]) continue;
      var v = g.shown[id];
      if (v === v && sc) { ramp(sc.t(v), rgbv); img.data[p] = rgbv[0]; img.data[p + 1] = rgbv[1]; img.data[p + 2] = rgbv[2]; }
      else { img.data[p] = 12; img.data[p + 1] = 28; img.data[p + 2] = 38; }
      img.data[p + 3] = 255;
    }
    hctx.putImageData(img, 0, 0);
    var cw = R.w / (g.nx - 1), ch = R.h / (g.ny - 1);
    c.imageSmoothingEnabled = true; c.drawImage(heat, R.x - cw / 2, R.y - ch / 2, R.w + cw, R.h + ch);
    /* contour lines */
    if (g.contours) {
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1;
      g.contours.forEach(function (ct) { c.beginPath(); for (var q = 0; q < ct.segs.length; q += 4) { c.moveTo(R.x + ct.segs[q] * cw, R.y + R.h - ct.segs[q + 1] * ch); c.lineTo(R.x + ct.segs[q + 2] * cw, R.y + R.h - ct.segs[q + 3] * ch); } c.stroke(); });
    }
    /* the edge of the allowed region */
    var vf = g.valid, fcw = R.w / vf.n, fch = R.h / vf.m;
    c.strokeStyle = C.red; c.lineWidth = 1.6; c.setLineDash([5, 4]); c.beginPath();
    march(vf.a, vf.n, vf.m, 0, function (a, b, c2, d2) { c.moveTo(R.x + a * fcw, R.y + R.h - b * fch); c.lineTo(R.x + c2 * fcw, R.y + R.h - d2 * fch); });
    c.stroke(); c.setLineDash([]);
    /* label the forbidden region at the middle of its cells */
    var sx = 0, sy = 0, nb = 0;
    for (j = 0; j < g.ny; j++) for (i = 0; i < g.nx; i++) if (!g.ok[j * g.nx + i]) { sx += i; sy += j; nb++; }
    if (nb > 0.04 * g.nx * g.ny) {
      var lx = R.x + R.w * (sx / nb) / (g.nx - 1), ly = R.y + R.h * (1 - (sy / nb) / (g.ny - 1)), txt = 'not allowed: surfaces not nested';
      c.font = '600 11px system-ui,sans-serif'; var tw = c.measureText(txt).width + 14;
      lx = Math.max(R.x + tw / 2 + 4, Math.min(R.x + R.w - tw / 2 - 4, lx)); ly = Math.max(R.y + 14, Math.min(R.y + R.h - 14, ly));
      c.fillStyle = 'rgba(6,17,26,0.85)'; rr(c, lx - tw / 2, ly - 10, tw, 20, 10); c.fill();
      c.fillStyle = '#ffc9c9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, lx, ly);
    }
    /* the finder's path */
    if (path && path.fam === g.fam) {
      c.fillStyle = 'rgba(219,231,239,0.45)';
      path.scan.forEach(function (s) { c.beginPath(); c.arc(X_(s[g.kx]), Y_(s[g.ky]), s.ok ? 1.8 : 1.2, 0, TAU); c.fill(); });
      var shown = path.steps.slice(0, path.reveal);
      if (shown.length) {
        c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath();
        shown.forEach(function (s, k) { var x = X_(s.P[g.kx]), y = Y_(s.P[g.ky]); if (k && s.run === shown[k - 1].run) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
        var last = shown[shown.length - 1]; c.fillStyle = C.pink; c.beginPath(); c.arc(X_(last.P[g.kx]), Y_(last.P[g.ky]), 3.5, 0, TAU); c.fill();
      }
    }
    /* the current bottle */
    var P = state.P, mx = X_(P[g.kx]), my = Y_(P[g.ky]);
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(mx, R.y); c.lineTo(mx, R.y + R.h); c.moveTo(R.x, my); c.lineTo(R.x + R.w, my); c.stroke(); c.setLineDash([]);
    c.lineWidth = 4; c.strokeStyle = C.bg; c.beginPath(); c.arc(mx, my, 7, 0, TAU); c.stroke();
    c.lineWidth = 2.4; c.strokeStyle = '#fff'; c.beginPath(); c.arc(mx, my, 7, 0, TAU); c.stroke();
    c.restore();
    if (path && path.fam === g.fam && path.best && path.reveal >= path.steps.length) star(c, Math.max(R.x, Math.min(R.x + R.w, X_(path.best[g.kx]))), Math.max(R.y, Math.min(R.y + R.h, Y_(path.best[g.ky]))), 9, C.gold);
    /* axes */
    c.strokeStyle = C.grid; c.strokeRect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1);
    c.fillStyle = C.muted; c.font = '11px system-ui,sans-serif';
    ticks(g.xr, function (v, s) { var x = X_(v); c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(fs(g.fam, g.kx, v).replace(/0+$/, '').replace(/\.$/, '') || '0', x, R.y + R.h + 4); });
    ticks(g.yr, function (v) { var y = Y_(v); c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(fs(g.fam, g.ky, v).replace(/0+$/, '').replace(/\.$/, '') || '0', R.x - 5, y); });
    c.fillStyle = C.ink; c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText(LONG[g.fam][g.kx] + ' →', R.x + R.w / 2, h - 3);
    c.save(); c.translate(12, R.y + R.h / 2); c.rotate(-PI / 2); c.textBaseline = 'middle'; c.fillText(LONG[g.fam][g.ky] + ' →', 0, 0); c.restore();
    /* legend and caption */
    mapCv.dataset.path = path ? path.reveal + '/' + path.steps.length + (path.best ? ' best' : '') : '';
    var ms = g.done ? ' Computed ' + g.count + ' bottles in ' + (g.ms < 100 ? 'under 0.1' : (g.ms / 1000).toFixed(1)) + ' s' + (client.worker() ? '' : ' (on the page: this browser has no worker)') + '.' : ' Working: ' + g.count + ' of ' + g.total + ' bottles…';
    $('mb-map-bar').style.background = rampCss();
    $('mb-map-lo').textContent = sc ? fv(g.o, sc.lo) : '…'; $('mb-map-hi').textContent = sc ? fv(g.o, sc.hi) : '…';
    $('mb-map-what').innerHTML = OUTN[g.o] + (sc && sc.log ? ' (log scale)' : '') + (X.OUT[g.o].better > 0 ? ' · higher is the goal' : X.OUT[g.o].better < 0 ? ' · lower is the goal' : '');
    mapCap.textContent = 'Each pixel is a whole bottle: ' + LONG[g.fam][g.kx] + ' across, ' + LONG[g.fam][g.ky] + ' up, every other setting as it is now. White lines join bottles with equal values; the white ring is your bottle.' + ms;
    mapCv.setAttribute('aria-label', 'Trade-off map of ' + OUTT[g.o] + ' over ' + LONG[g.fam][g.kx] + ' and ' + LONG[g.fam][g.ky] + '. Your bottle is at ' + SYM[g.fam][g.kx] + ' = ' + fs(g.fam, g.kx, P[g.kx]) + ', ' + SYM[g.fam][g.ky] + ' = ' + fs(g.fam, g.ky, P[g.ky]) + '. Click or tap to move it; arrow keys move it one step, with Shift five steps.');
  }
  function ticks(r, fn) { var st = niceStep((r[1] - r[0]) / 5); for (var v = Math.ceil(r[0] / st - 1e-9) * st; v <= r[1] + 1e-9 * st; v += st) fn(Math.abs(v) < st * 1e-9 ? 0 : v, st); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function star(c, x, y, r, col) {
    c.beginPath(); for (var k = 0; k < 10; k++) { var a = -PI / 2 + k * PI / 5, rr2 = k % 2 ? r * 0.45 : r; c.lineTo(x + rr2 * Math.cos(a), y + rr2 * Math.sin(a)); } c.closePath();
    c.lineWidth = 3; c.strokeStyle = C.bg; c.stroke(); c.fillStyle = col; c.fill();
  }
  /* marching squares on a node grid (row-major, (nx+1) x (nz+1)), y counted from the bottom row */
  function march(g, nx, nz, lv, seg) {
    var w = nx + 1;
    function lerp(a, b) { return (lv - a) / (b - a); }
    for (var j = 0; j < nz; j++) for (var i = 0; i < nx; i++) {
      var a = g[j * w + i], b = g[j * w + i + 1], c = g[(j + 1) * w + i + 1], d = g[(j + 1) * w + i];
      if (!(a === a && b === b && c === c && d === d)) continue;
      var k = (a > lv ? 1 : 0) | (b > lv ? 2 : 0) | (c > lv ? 4 : 0) | (d > lv ? 8 : 0);
      if (k === 0 || k === 15) continue;
      var T = [i + lerp(a, b), j], Rt = [i + 1, j + lerp(b, c)], Bt = [i + lerp(d, c), j + 1], Lt = [i, j + lerp(a, d)], segs;
      switch (k) {
        case 1: case 14: segs = [[Lt, T]]; break; case 2: case 13: segs = [[T, Rt]]; break; case 3: case 12: segs = [[Lt, Rt]]; break;
        case 4: case 11: segs = [[Rt, Bt]]; break; case 6: case 9: segs = [[T, Bt]]; break; case 7: case 8: segs = [[Lt, Bt]]; break;
        case 5: segs = [[Lt, T], [Rt, Bt]]; break; case 10: segs = [[T, Rt], [Bt, Lt]]; break;
      }
      for (var s = 0; s < segs.length; s++) seg(segs[s][0][0], segs[s][0][1], segs[s][1][0], segs[s][1][1]);
    }
  }
  /* value of the map at a point (bilinear between grid nodes) */
  function mapAt(g, x, y) {
    var u = (x - g.xr[0]) / (g.xr[1] - g.xr[0]) * (g.nx - 1), v = (y - g.yr[0]) / (g.yr[1] - g.yr[0]) * (g.ny - 1);
    var i = Math.max(0, Math.min(g.nx - 2, Math.floor(u))), j = Math.max(0, Math.min(g.ny - 2, Math.floor(v))), a = u - i, b = v - j, src = g.done ? g.v : g.shown;
    var q = [src[j * g.nx + i], src[j * g.nx + i + 1], src[(j + 1) * g.nx + i], src[(j + 1) * g.nx + i + 1]], wt = [(1 - a) * (1 - b), a * (1 - b), (1 - a) * b, a * b], s = 0, sw = 0;
    for (var k = 0; k < 4; k++) if (q[k] === q[k]) { s += q[k] * wt[k]; sw += wt[k]; }
    return sw > 0.2 ? s / sw : NaN;
  }
  function eventXY(e) {
    var g = grid, r = mapCv.getBoundingClientRect(), R = plotRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    var x = g.xr[0] + (g.xr[1] - g.xr[0]) * (px - R.x) / R.w, y = g.yr[0] + (g.yr[1] - g.yr[0]) * (1 - (py - R.y) / R.h);
    return { px: px, py: py, x: x, y: y, inside: px >= R.x - 4 && px <= R.x + R.w + 4 && py >= R.y - 4 && py <= R.y + R.h + 4 };
  }
  function moveTo(x, y, quiet) {
    var g = grid, fam = g.fam, P = X.copy(state.P), sx = X.spec(fam, g.kx), sy = X.spec(fam, g.ky);
    P[g.kx] = Math.min(g.xr[1], Math.max(g.xr[0], x)); P[g.ky] = Math.min(g.yr[1], Math.max(g.yr[0], y));
    var Pn = snapKeep(fam, P, g.kx, g.ky);
    if (!X.valid(fam, Pn)) { say('Not allowed there: the surfaces would not be nested. Pick a point outside the hatched area.'); if (!quiet) root.mbApi.toast('Not allowed: the surfaces would not be nested'); return false; }
    var upd = {}; upd[g.kx] = Pn[g.kx]; upd[g.ky] = Pn[g.ky];
    root.mbApi.set(fam, upd);
    var v = mapAt(g, Pn[g.kx], Pn[g.ky]);
    say(SYM[fam][g.kx] + ' = ' + fs(fam, g.kx, Pn[g.kx]) + ', ' + SYM[fam][g.ky] + ' = ' + fs(fam, g.ky, Pn[g.ky]) + (v === v ? ': ' + OUTT[g.o] + ' about ' + fv(g.o, v) : ''));
    return true;
  }
  function snapKeep(fam, P, kx, ky) {           // round only the two map settings to their slider steps (delta down, so it stays allowed)
    var o = X.copy(P);
    [kx, ky].forEach(function (k) { var s = X.spec(fam, k); o[k] = k === 'delta' ? Math.max(s.min, Math.floor(o[k] / s.step + 1e-9) * s.step) : Math.round(o[k] / s.step) * s.step; o[k] = +o[k].toFixed(k === 'delta' ? (fam === 'f1' ? 4 : 3) : 2); });
    return o;
  }
  function say(t) { live.textContent = t; }
  var down = null;
  mapCv.addEventListener('pointerdown', function (e) { if (!grid) return; down = { x: e.clientX, y: e.clientY, id: e.pointerId, mouse: e.pointerType === 'mouse' }; if (down.mouse) { try { mapCv.setPointerCapture(e.pointerId); } catch (er) { } var p = eventXY(e); if (p.inside) moveTo(p.x, p.y); } });
  mapCv.addEventListener('pointermove', function (e) {
    if (!grid) return; var p = eventXY(e);
    if (down && down.mouse && e.buttons) { if (p.inside) moveTo(p.x, p.y, true); }
    if (e.pointerType === 'mouse') showTip(p);
  });
  mapCv.addEventListener('pointerup', function (e) {
    if (down && !down.mouse && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12) { var p = eventXY(e); if (p.inside) { moveTo(p.x, p.y); showTip(p); } }
    down = null;
  });
  mapCv.addEventListener('pointerleave', function () { tip.hidden = true; });
  function showTip(p) {
    var g = grid; if (!p.inside) { tip.hidden = true; return; }
    var x = Math.min(g.xr[1], Math.max(g.xr[0], p.x)), y = Math.min(g.yr[1], Math.max(g.yr[0], p.y)), Q = X.copy(state.P); Q[g.kx] = x; Q[g.ky] = y;
    var ok = X.valid(g.fam, Q), v = ok ? mapAt(g, x, y) : NaN;
    tip.innerHTML = SYM[g.fam][g.kx] + ' = ' + fs(g.fam, g.kx, x) + ', ' + SYM[g.fam][g.ky] + ' = ' + fs(g.fam, g.ky, y) + '<br>' + (ok ? OUTT[g.o] + ' ≈ ' + fv(g.o, v) : 'not allowed: surfaces not nested');
    tip.hidden = false;
    var bw = mapCv.clientWidth, tw = tip.offsetWidth;
    tip.style.left = Math.max(4, Math.min(bw - tw - 4, p.px + 14)) + 'px'; tip.style.top = Math.max(4, p.py - 46) + 'px';
  }
  mapCv.addEventListener('keydown', function (e) {
    var g = grid; if (!g) return;
    var dx = 0, dy = 0, k = e.key, n = e.shiftKey ? 5 : 1;
    if (k === 'ArrowLeft') dx = -1; else if (k === 'ArrowRight') dx = 1; else if (k === 'ArrowUp') dy = 1; else if (k === 'ArrowDown') dy = -1; else return;
    e.preventDefault();
    var sx = Math.max(X.spec(g.fam, g.kx).step, (g.xr[1] - g.xr[0]) / (g.nx - 1)), sy = Math.max(X.spec(g.fam, g.ky).step, (g.yr[1] - g.yr[0]) / (g.ny - 1));
    moveTo(state.P[g.kx] + dx * n * sx, state.P[g.ky] + dy * n * sy, true);
  });

  /* ================= the goal finder ================= */
  var GOAL = {
    bV: { name: 'Most pressure for the field', short: 'highest β<sub>V</sub>', o: 'bV', about: 'β<sub>V</sub> compares the plasma’s pressure with the magnetic field’s own pressure, averaged over the bottle. Higher means the same field holds more plasma pressure. Above 100% the plasma pushes harder than the field, on average: the formulas allow it, but nothing here checks whether such a plasma would stay put.' },
    V: { name: 'Biggest bottle', short: 'largest <var>V</var>', o: 'V', about: 'More room for plasma. On its own this mostly makes a fatter bottle, so it pairs well with the δ rule below.' },
    sh: { name: 'Most shear', short: 'largest |ι<sub>edge</sub> − ι<sub>axis</sub>|', o: 'ash', about: 'Shear means the twist changes from one layer to the next. Designers sometimes want it and sometimes avoid it; here it is one more number to explore.' },
    rip: { name: 'Smoothest field on the edge', short: 'smallest ripple', o: 'rip', about: 'Ripple is the strongest |<b>B</b>| on the edge divided by the weakest. Particles can get trapped where the field is weak. Real designs care more about how the weak spots are arranged than about their size, but a small ripple is a simple first measure. On its own it favors thin bottles, so try it with a volume rule too.' },
    gap: { name: 'Most symmetric', short: 'smallest mirror gap', o: 'gap', about: 'Any bottle with τ = 0 passes the mirror test exactly, so the finder only changes τ for this goal.' }
  };
  var goal = store.get('goal', 'bV'); if (!GOAL[goal]) goal = 'bV';
  var kmax = +store.get('kmax', 80) || 80, freeSet = store.get('free', null) || {}, job = null;
  var goalsEl = $('mb-goals'), runBtn = $('mb-run'), statusEl = $('mb-status'), bar = $('mb-prog-bar'), resEl = $('mb-result'), ctrlsEl = $('mb-goal-ctrls');
  function showControls() { resEl.hidden = true; ctrlsEl.hidden = false; runBtn.textContent = 'Find it'; }
  function drawGoals() {
    goalsEl.innerHTML = Object.keys(GOAL).map(function (k) {
      var dis = state.fam === 'f1' && k === 'sh';
      return '<button type="button" data-goal="' + k + '" aria-pressed="' + (k === goal) + '"' + (dis ? ' disabled title="ι is 2 everywhere in Family 1"' : '') + '>' + GOAL[k].name + '</button>';
    }).join('');
    $('mb-goal-about').innerHTML = '<b>Goal: ' + GOAL[goal].short + '.</b> ' + GOAL[goal].about;
    var ks = X.keys(state.fam), fr = freeSet[state.fam] || {};
    $('mb-free').innerHTML = ks.map(function (k) {
      var on = goal === 'gap' ? k === 'tau' : fr[k] !== false, dis = goal === 'gap';
      return '<label class="lab-chk"><input type="checkbox" data-free="' + k + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '> ' + SYM[state.fam][k] + '</label>';
    }).join('');
  }
  goalsEl.addEventListener('click', function (e) { var b = e.target.closest('[data-goal]'); if (!b || b.disabled) return; goal = b.dataset.goal; store.set('goal', goal); drawGoals(); });
  $('mb-free').addEventListener('change', function (e) { var k = e.target.dataset.free; if (!k) return; var fr = freeSet[state.fam] = freeSet[state.fam] || {}; fr[k] = e.target.checked; store.set('free', freeSet); });
  var kEl = $('mb-kmax'), kOut = $('mb-kmax-o');
  kEl.value = kmax; kOut.textContent = kmax + '%';
  kEl.addEventListener('input', function () { kmax = +kEl.value; kOut.textContent = kmax + '%'; kEl.setAttribute('aria-valuetext', kmax + ' percent'); store.set('kmax', kmax); requestPareto(); });
  var minVEl = $('mb-minv');
  runBtn.addEventListener('click', function () { if (job) stop(); else run(); });
  function stop() { client.cancel('find'); job = null; runBtn.textContent = 'Find it'; statusEl.textContent = 'Stopped.'; }
  function run() {
    var fam = state.fam, P0 = X.copy(state.P), fr = freeSet[fam] || {}, free = X.keys(fam).filter(function (k) { return fr[k] !== false; });
    if (goal === 'sh' && fam === 'f1') return;
    if (!free.length && goal !== 'gap') { statusEl.textContent = 'Tick at least one setting the finder may change.'; return; }
    var now0 = X.metrics(fam, P0, X.ALL, X.QM), minV = +minVEl.value * now0.V;
    var j = job = { fam: fam, P0: P0, now: now0, t0: performance.now(), scanned: 0 };
    path = { fam: fam, scan: [], steps: [], reveal: 0, best: null };
    showControls(); runBtn.textContent = 'Stop'; bar.style.width = '0%'; statusEl.textContent = 'Scanning…';
    client.run('find', 'find', { fam: fam, P: P0, goal: goal, kmax: kmax / 100, minV: minV, free: free, nScan: phone && goal !== 'gap' ? (free.length <= 3 ? 60 : 140) : undefined, maxIt: phone ? 80 : 120 }, function (m, done) {
      if (j !== job) return;
      if (m && m.t === 'scan') { for (var q = 0; q < m.d.length; q += 2) { var s = m.d[q]; s.ok = m.d[q + 1]; path.scan.push(s); } bar.style.width = (60 * m.i / m.n).toFixed(0) + '%'; statusEl.textContent = 'Scanning: ' + m.i + ' of ' + m.n + ' bottles…'; drawMapSoon(); }
      else if (m && m.t === 'path') { path.steps.push(m); bar.style.width = Math.min(95, 60 + path.steps.length * 0.4).toFixed(0) + '%'; statusEl.textContent = 'Polishing with Nelder–Mead: step ' + path.steps.length + '…'; if (reduced) path.reveal = path.steps.length; animate(); }
      else if (m && m.t === 'best') { j.best = m; }
      if (done) { job = null; runBtn.textContent = 'Find it'; bar.style.width = '100%'; if (j.best) finish(j); else statusEl.textContent = 'The search stopped early.'; }
    });
  }
  var animT = 0;
  function animate() {
    if (animT || !path) return;
    (function stepAnim() {
      if (!path || path.reveal >= path.steps.length) { animT = 0; drawMapSoon(); return; }
      path.reveal = Math.min(path.steps.length, path.reveal + Math.max(1, Math.ceil(path.steps.length / 45)));   // the whole path shows within about 1.5 s
      drawMapSoon(); animT = setTimeout(stepAnim, 35);
    })();
  }
  function finish(j) {
    var b = j.best, fam = j.fam, o = GOAL[goal].o, before = X.OUT[o].f(j.now), sec = (performance.now() - j.t0) < 100 ? 'under 0.1' : ((performance.now() - j.t0) / 1000).toFixed(1);
    path.best = b.P; if (reduced) path.reveal = path.steps.length; animate(); drawMapSoon();
    if (!b.ok) { statusEl.textContent = 'No bottle met the rules. Try a smaller volume rule or let more settings change.'; return; }
    var better = X.OUT[o].better === 0 ? true : (b.v - before) * (goal === 'rip' || goal === 'gap' ? -1 : 1) > 1e-9 * Math.abs(before);
    statusEl.textContent = 'Done: ' + b.evals + ' bottles tried in ' + sec + ' s.' + (better ? '' : ' Your bottle is already as good as anything it found.');
    var rows = X.keys(fam).map(function (k) { var ch = Math.abs(b.P[k] - j.P0[k]) > 1e-12; return '<tr' + (ch ? ' class="mb-ch"' : '') + '><th scope="row">' + LONG[fam][k] + '</th><td>' + fs(fam, k, j.P0[k]) + '</td><td>' + fs(fam, k, b.P[k]) + '</td></tr>'; }).join('');
    var outs = ['bV', 'V', 'rip', 'gap'].concat(fam === 'f2' ? ['sh'] : []), r = b.r;
    var rows2 = outs.map(function (q) { var a = X.OUT[q].f(j.now), c2 = X.OUT[q].f(r); return '<tr' + (q === o || (o === 'ash' && q === 'sh') ? ' class="mb-goalrow"' : '') + '><th scope="row">' + OUTT[q] + '</th><td>' + fv(q, a) + '</td><td>' + fv(q, c2) + '</td></tr>'; }).join('');
    resEl.innerHTML = '<table class="mb-rtab"><caption>Best found for “' + GOAL[goal].name.toLowerCase() + '”</caption><thead><tr><th scope="col">Setting</th><th scope="col">Now</th><th scope="col">Found</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<table class="mb-rtab"><thead><tr><th scope="col">Output</th><th scope="col">Now</th><th scope="col">Found</th></tr></thead><tbody>' + rows2 + '</tbody></table>' +
      '<p class="lab-small">Rounded to the sliders’ steps and measured again. On the map, the pink line is the search’s path (seen on the map’s two settings) and the gold star is where it ended.</p>' +
      '<div class="mb-resbtns"><button type="button" class="lab-btn pri" id="mb-apply">Apply these settings</button><button type="button" class="lab-btn" id="mb-again">Change the goal</button></div>';
    resEl.hidden = false; ctrlsEl.hidden = true; runBtn.textContent = 'Run again';
    $('mb-apply').addEventListener('click', function () { root.mbApi.set(fam, b.P, 'Loaded the bottle the finder found'); });
    $('mb-again').addEventListener('click', function () { showControls(); var g0 = goalsEl.querySelector('[aria-pressed="true"]'); if (g0) g0.focus(); });
  }

  /* ================= the trade-off (Pareto) chart ================= */
  var parCv = $('mb-par'), PG = L.canvas(parCv), parTip = $('mb-par-tip'), selPX = $('mb-par-x'), selPY = $('mb-par-y');
  var DEFPAR = { f1: { x: 'rip', y: 'bV' }, f2: { x: 'rip', y: 'bV' } }, parSet = store.get('par', null) || {};
  ['f1', 'f2'].forEach(function (fm) { var d = parSet[fm] || {}; parSet[fm] = d.x && d.y && d.x !== d.y && X.OUT[d.x] && X.OUT[d.y] && !(fm === 'f1' && (f2only(d.x) || f2only(d.y))) ? d : Object.assign({}, DEFPAR[fm]); });
  var cloud = null, cloudKey = '', parSel = -1, curVals = null;
  var POPTS = ['bV', 'V', 'rip', 'gap', 'ash'];
  function fillPar() {
    var fam = state.fam, ps = parSet[fam];
    function opts(sel) { return POPTS.filter(function (o) { return !(fam === 'f1' && f2only(o)); }).map(function (o) { return '<option value="' + o + '"' + (o === sel ? ' selected' : '') + '>' + OUTT[o] + '</option>'; }).join(''); }
    selPX.innerHTML = opts(ps.x); selPY.innerHTML = opts(ps.y);
  }
  function onPar() { var ps = parSet[state.fam], nx = selPX.value, ny = selPY.value; if (nx === ny) { if (this === selPX) ny = ps.x; else nx = ps.y; } ps.x = nx; ps.y = ny; store.set('par', parSet); fillPar(); requestPareto(); }
  selPX.addEventListener('change', onPar); selPY.addEventListener('change', onPar);
  function requestPareto() {
    var fam = state.fam, ps = parSet[fam], n = phone ? (fam === 'f1' ? 220 : 180) : (fam === 'f1' ? 520 : 420), key = fam + ps.x + ps.y + kmax + ':' + n;
    curVals = null;
    if (key === cloudKey && cloud) { drawPar(); return; }
    cloudKey = key; parSel = -1;
    var cl = cloud = { fam: fam, x: ps.x, y: ps.y, pts: [], n: n, done: false, front: [] };
    client.run('pareto', 'pareto', { fam: fam, n: n, kmax: kmax / 100, outs: [ps.x, ps.y] }, function (m, done) {
      if (cl !== cloud) return;
      if (m && m.t === 'pts') { cl.pts = cl.pts.concat(m.d); drawParSoon(); }
      if (done) { cl.done = true; cl.front = front(cl); drawPar(); }
    });
    drawPar();
  }
  function better(o) { return o === 'ash' ? 1 : X.OUT[o].better; }
  function front(cl) {
    var bx = better(cl.x), by = better(cl.y), pts = cl.pts, out = [];
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i].v, dom = false;
      for (var j = 0; j < pts.length && !dom; j++) { if (i === j) continue; var b = pts[j].v; if (bx * b[0] >= bx * a[0] && by * b[1] >= by * a[1] && (bx * b[0] > bx * a[0] || by * b[1] > by * a[1])) dom = true; }
      if (!dom) out.push(i);
    }
    return out.sort(function (i, j) { return pts[i].v[0] - pts[j].v[0]; });
  }
  var parT = 0;
  function drawParSoon() { if (!parT) parT = requestAnimationFrame(function () { parT = 0; drawPar(); }); }
  function parScale(vals, o) {
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), log = lo > 0 && hi / lo > 20;
    if (!(hi > lo)) { hi = lo + 1e-6; }
    var a = log ? Math.log(lo) : lo, b = log ? Math.log(hi) : hi, pad = (b - a) * 0.05; a -= pad; b += pad;
    return { log: log, a: a, b: b, t: function (v) { return ((log ? Math.log(v) : v) - a) / (b - a); }, inv: function (t) { var u = a + (b - a) * t; return log ? Math.exp(u) : u; } };
  }
  function parRect() { return { x: 66, y: 12, w: Math.max(40, PG.w - 78), h: Math.max(40, PG.h - 50) }; }
  function drawPar() {
    var cl = cloud; if (!cl) return;
    PG.fit(); var c = PG.c, w = PG.w, h = PG.h, R = parRect();
    c.clearRect(0, 0, w, h); c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
    if (!curVals || curVals.fam !== cl.fam) { var r = X.metrics(cl.fam, state.P, (function () { var nd = {}; [cl.x, cl.y].forEach(function (o) { for (var q in X.OUT[o].need) nd[q] = 1; }); return nd; })(), X.QM); curVals = { fam: cl.fam, x: X.OUT[cl.x].f(r), y: X.OUT[cl.y].f(r) }; }
    var xs = cl.pts.map(function (p) { return p.v[0]; }).concat([curVals.x]), ys = cl.pts.map(function (p) { return p.v[1]; }).concat([curVals.y]);
    xs = xs.filter(isFinite); ys = ys.filter(isFinite);
    if (xs.length < 2) { c.fillStyle = C.muted; c.font = '12px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('Working out the bottles…', w / 2, h / 2); return; }
    var SX = parScale(xs, cl.x), SY = parScale(ys, cl.y);
    cl.SX = SX; cl.SY = SY;
    function X_(v) { return R.x + R.w * SX.t(v); } function Y_(v) { return R.y + R.h * (1 - SY.t(v)); }
    c.strokeStyle = C.grid; c.lineWidth = 1; c.strokeRect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1);
    c.fillStyle = C.muted; c.font = '11px system-ui,sans-serif';
    axisTicks(SX, function (v, lab) { var x = X_(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, R.y); c.lineTo(x, R.y + R.h); c.stroke(); c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(lab, x, R.y + R.h + 4); }, cl.x);
    axisTicks(SY, function (v, lab) { var y = Y_(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(R.x, y); c.lineTo(R.x + R.w, y); c.stroke(); c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(lab, R.x - 5, y); }, cl.y);
    c.fillStyle = C.ink; c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom';
    c.fillText(OUTT[cl.x] + (better(cl.x) > 0 ? '  (more is better →)' : '  (← less is better)'), R.x + R.w / 2, h - 3);
    c.save(); c.translate(13, R.y + R.h / 2); c.rotate(-PI / 2); c.textBaseline = 'middle'; c.fillText(OUTT[cl.y] + (better(cl.y) > 0 ? '  (more is better →)' : '  (← less is better)'), 0, 0); c.restore();
    c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
    var fset = {}; cl.front.forEach(function (i) { fset[i] = 1; });
    c.fillStyle = 'rgba(143,179,198,0.55)';
    cl.pts.forEach(function (p, i) { if (fset[i] || !isFinite(p.v[0]) || !isFinite(p.v[1])) return; c.beginPath(); c.arc(X_(p.v[0]), Y_(p.v[1]), 2.6, 0, TAU); c.fill(); });
    if (cl.front.length) {
      c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath();
      cl.front.forEach(function (i, k) { var p = cl.pts[i]; if (k) c.lineTo(X_(p.v[0]), Y_(p.v[1])); else c.moveTo(X_(p.v[0]), Y_(p.v[1])); }); c.stroke();
      cl.front.forEach(function (i) { var p = cl.pts[i], x = X_(p.v[0]), y = Y_(p.v[1]); c.beginPath(); c.arc(x, y, 4.5, 0, TAU); c.lineWidth = 2; c.strokeStyle = C.bg; c.stroke(); c.fillStyle = C.gold; c.fill(); });
    }
    if (parSel >= 0 && cl.front[parSel] !== undefined) { var ps2 = cl.pts[cl.front[parSel]]; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(X_(ps2.v[0]), Y_(ps2.v[1]), 9, 0, TAU); c.stroke(); }
    var cx = X_(curVals.x), cy = Y_(curVals.y);
    c.lineWidth = 4; c.strokeStyle = C.bg; c.beginPath(); c.arc(cx, cy, 6.5, 0, TAU); c.stroke(); c.lineWidth = 2.4; c.strokeStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 6.5, 0, TAU); c.stroke();
    c.restore();
    $('mb-par-cap').innerHTML = 'Each dot is one bottle, with its settings spread evenly over the sliders and δ kept below ' + kmax + '% of its limit (τ only from 0 up: −τ gives the same numbers). <span class="mb-kk"><i style="background:' + C.gold + '"></i>Gold</span>: the best trade-offs, bottles that no other dot beats on both numbers at once. <span class="mb-kk"><i class="ring"></i>White ring</span>: your bottle. Tap a dot to load it.' + (cl.done ? '' : ' Working: ' + cl.pts.length + ' of about ' + cl.n + '…');
    parCv.setAttribute('aria-label', 'Trade-off chart: ' + OUTT[cl.y] + ' against ' + OUTT[cl.x] + ' for ' + cl.pts.length + ' bottles. ' + cl.front.length + ' of them are best trade-offs. Use the left and right arrow keys to step along the best trade-offs and Enter to load one.');
  }
  function axisTicks(S, fn, o) {
    var lo = S.inv(0), hi = S.inv(1);
    if (S.log) {
      var e0 = Math.floor(Math.log10(lo)), e1 = Math.ceil(Math.log10(hi)), cand = [];
      for (var e = e0; e <= e1; e++) [1, 2, 5].forEach(function (mm) { var v = mm * Math.pow(10, e); if (v >= lo && v <= hi) cand.push(v); });
      if (cand.length > 7) cand = cand.filter(function (v) { var m0 = v / Math.pow(10, Math.floor(Math.log10(v) + 1e-9)); return Math.abs(m0 - 1) < 1e-6 || (cand.length <= 10 && Math.abs(m0 - 5) < 1e-6); });
      cand.forEach(function (v) { fn(v, compact(o, v)); }); return;
    }
    var st = niceStep((hi - lo) / 5); for (var v = Math.ceil(lo / st) * st; v <= hi; v += st) fn(v, o === 'bV' ? f(100 * v, st * 100 < 1 ? 1 : 0) + '%' : o === 'gap' ? f(v, st < 0.1 ? 2 : 1) + '×' : f(v, st < 0.01 ? 3 : st < 0.1 ? 2 : 1));
  }
  function compact(o, v) {
    if (o === 'bV') { var pc = 100 * v; return (pc >= 1 ? String(Math.round(pc)) : pc >= 0.1 ? pc.toFixed(1) : pc.toPrecision(1)) + '%'; }
    var s2 = v >= 100 ? String(Math.round(v)) : v >= 1 ? String(+v.toFixed(1)) : String(+v.toPrecision(2));
    return o === 'gap' ? s2 + '×' : s2;
  }
  function nearest(e) {
    var cl = cloud; if (!cl || !cl.SX) return -1;
    var r = parCv.getBoundingClientRect(), R = parRect(), px = e.clientX - r.left, py = e.clientY - r.top, best = -1, bd = e.pointerType === 'mouse' ? 12 : 22;
    cl.pts.forEach(function (p, i) { var x = R.x + R.w * cl.SX.t(p.v[0]), y = R.y + R.h * (1 - cl.SY.t(p.v[1])), d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function parTipShow(i, e) {
    var cl = cloud; if (i < 0) { parTip.hidden = true; return; }
    var p = cl.pts[i], fam = cl.fam;
    parTip.innerHTML = OUTT[cl.x] + ' ' + fv(cl.x, p.v[0]) + ' · ' + OUTT[cl.y] + ' ' + fv(cl.y, p.v[1]) + '<br>' + X.keys(fam).map(function (k) { return SYM[fam][k] + ' ' + fs(fam, k, p.P[k]); }).join(', ');
    parTip.hidden = false;
    var r = parCv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    parTip.style.left = Math.max(4, Math.min(parCv.clientWidth - parTip.offsetWidth - 4, px + 14)) + 'px'; parTip.style.top = Math.max(4, py - 50) + 'px';
  }
  var pdown = null;
  parCv.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') parTipShow(nearest(e), e); });
  parCv.addEventListener('pointerleave', function () { parTip.hidden = true; });
  parCv.addEventListener('pointerdown', function (e) { pdown = { x: e.clientX, y: e.clientY }; });
  parCv.addEventListener('pointerup', function (e) {
    if (!pdown || Math.hypot(e.clientX - pdown.x, e.clientY - pdown.y) > 12) { pdown = null; return; } pdown = null;
    var i = nearest(e); if (i < 0) return; parTipShow(i, e);
    root.mbApi.set(cloud.fam, cloud.pts[i].P, 'Loaded a bottle from the trade-off chart');
  });
  parCv.addEventListener('keydown', function (e) {
    var cl = cloud; if (!cl || !cl.front.length) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') parSel = Math.min(cl.front.length - 1, parSel + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') parSel = Math.max(0, parSel < 0 ? 0 : parSel - 1);
    else if (e.key === 'Enter' && parSel >= 0) { root.mbApi.set(cl.fam, cl.pts[cl.front[parSel]].P, 'Loaded a best trade-off bottle'); e.preventDefault(); return; }
    else return;
    e.preventDefault(); drawPar();
    var p = cl.pts[cl.front[parSel]];
    $('mb-par-live').textContent = 'Best trade-off ' + (parSel + 1) + ' of ' + cl.front.length + ': ' + OUTT[cl.x] + ' ' + fv(cl.x, p.v[0]) + ', ' + OUTT[cl.y] + ' ' + fv(cl.y, p.v[1]) + '. Press Enter to load it.';
  });

  /* ================= keeping up with the bottle ================= */
  var reT = 0;
  root.addEventListener('mb:state', function (e) {
    var old = state; state = e.detail;
    if (old.fam !== state.fam) { fillSelects(); fillPar(); drawGoals(); path = null; showControls(); statusEl.textContent = ''; bar.style.width = '0%'; if (job) stop(); requestMap(); requestPareto(); return; }
    curVals = null; drawMapSoon(); drawParSoon();
    clearTimeout(reT); reT = setTimeout(function () { requestMap(); drawPar(); }, 300);
  });
  var rsT = 0;
  window.addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(function () { drawMap(); drawPar(); }, 120); });
  if (window.ResizeObserver) { try { new ResizeObserver(function () { drawMapSoon(); drawParSoon(); }).observe(secEl); new ResizeObserver(function () { drawMapSoon(); }).observe(mapCv); new ResizeObserver(function () { drawParSoon(); }).observe(parCv); } catch (er) { } }

  /* start when the section comes near the screen, so the first view of the page stays quick */
  fillSelects(); fillPar(); drawGoals();
  var started = false;
  function start() { if (started) return; started = true; requestMap(); requestPareto(); }
  if ('IntersectionObserver' in window) { try { new IntersectionObserver(function (es) { if (es.some(function (x) { return x.isIntersecting; })) start(); }, { rootMargin: '600px 0px' }).observe(secEl); } catch (er) { start(); } }
  else start();
})();
