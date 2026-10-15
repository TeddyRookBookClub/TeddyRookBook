/* Regression Discontinuity (/business/econometrics/regression-discontinuity/): drawing and controls for the sharp RD
   simulation (with the density test and the bandwidth scan) and the fuzzy RD simulation.
   The models are in model.js (window.Ec13Model); statistics from stats.js (window.EconStats). */
(function () {
  'use strict';
  var PFX = 'ec13';
  /* ---------- shared drawing and control helpers (the same block in every chapter 12-17 sim.js) ---------- */
  var L = window.TRBLab, S = window.EconStats, D = document;
  if (!L || !S) return;
  var C = { bg: '#06111a', bg2: '#0b1b27', card: 'rgba(14,34,48,.92)', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', grid: 'rgba(120,170,200,.11)',
    green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', orange: '#ffa94d' };
  var MONO = 'ui-monospace,Menlo,Consolas,monospace', SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var reduced = L.reduced, fmt = L.fmt, TAU = Math.PI * 2;
  function $(id) { return D.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rgba(hex, a) { return 'rgba(' + parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16) + ',' + a + ')'; }
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // text: o = {col, size, weight, align, base, mono, max}
  function txt(c, s, x, y, o) {
    o = o || {}; c.font = (o.weight || 400) + ' ' + (o.size || 12) + 'px ' + (o.mono ? MONO : SANS);
    c.fillStyle = o.col || C.ink; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    if (o.max) c.fillText(s, x, y, o.max); else c.fillText(s, x, y);
  }
  function tw(c, s, size, weight, mono) { c.font = (weight || 400) + ' ' + (size || 12) + 'px ' + (mono ? MONO : SANS); return c.measureText(s).width; }
  // a dark card with a title, like the panels inside the simulations
  function card(c, x, y, w, h, title, col) {
    rr(c, x, y, w, h, 10); c.fillStyle = C.card; c.fill(); c.strokeStyle = C.line; c.lineWidth = 1; c.stroke();
    if (title) txt(c, title, x + 10, y + 17, { size: 11, weight: 700, col: col || C.muted, max: w - 20 });
  }
  // a plot area that maps data to pixels: P.X(v), P.Y(v), P.iX(px), P.iY(py)
  function Plot(x, y, w, h, xr, yr) {
    var P = { x: x, y: y, w: w, h: h, xr: xr, yr: yr };
    P.X = function (v) { return P.x + (v - P.xr[0]) / (P.xr[1] - P.xr[0]) * P.w; };
    P.Y = function (v) { return P.y + P.h - (v - P.yr[0]) / (P.yr[1] - P.yr[0]) * P.h; };
    P.iX = function (px) { return P.xr[0] + (px - P.x) / P.w * (P.xr[1] - P.xr[0]); };
    P.iY = function (py) { return P.yr[0] + (P.y + P.h - py) / P.h * (P.yr[1] - P.yr[0]); };
    P.inside = function (px, py) { return px >= P.x && px <= P.x + P.w && py >= P.y && py <= P.y + P.h; };
    return P;
  }
  // axes with grid lines and tick labels: o = {xt, yt (tick counts), xf, yf (label formatters), xlab, ylab, noX, noY, xticks, yticks}
  function axes(c, P, o) {
    o = o || {}; c.save(); c.lineWidth = 1;
    var xt = o.xticks || S.niceTicks(P.xr[0], P.xr[1], o.xt || 5).ticks, yt = o.yticks || S.niceTicks(P.yr[0], P.yr[1], o.yt || 4).ticks;
    c.strokeStyle = C.grid; c.beginPath();
    yt.forEach(function (v) { if (v < P.yr[0] - 1e-9 || v > P.yr[1] + 1e-9) return; var py = Math.round(P.Y(v)) + 0.5; c.moveTo(P.x, py); c.lineTo(P.x + P.w, py); });
    if (!o.noXgrid) xt.forEach(function (v) { if (v < P.xr[0] - 1e-9 || v > P.xr[1] + 1e-9) return; var px = Math.round(P.X(v)) + 0.5; c.moveTo(px, P.y); c.lineTo(px, P.y + P.h); });
    c.stroke();
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(P.x, P.y + P.h + 0.5); c.lineTo(P.x + P.w, P.y + P.h + 0.5); c.stroke();
    var xf = o.xf || function (v) { return fmt(v, dec(xt)); }, yf = o.yf || function (v) { return fmt(v, dec(yt)); };
    if (!o.noX) xt.forEach(function (v) { if (v < P.xr[0] - 1e-9 || v > P.xr[1] + 1e-9) return; txt(c, xf(v), P.X(v), P.y + P.h + 13, { size: 10, col: C.muted, align: 'center', mono: true }); });
    if (!o.noY) yt.forEach(function (v) { if (v < P.yr[0] - 1e-9 || v > P.yr[1] + 1e-9) return; txt(c, yf(v), P.x - 5, P.Y(v) + 3, { size: 10, col: C.muted, align: 'right', mono: true }); });
    if (o.xlab) txt(c, o.xlab, P.x + P.w / 2, P.y + P.h + 27, { size: 11, col: C.muted, align: 'center' });
    if (o.ylab) { c.translate(P.x - (o.ylabOff || 34), P.y + P.h / 2); c.rotate(-Math.PI / 2); txt(c, o.ylab, 0, 0, { size: 11, col: C.muted, align: 'center' }); }
    c.restore();
  }
  function dec(ticks) { if (ticks.length < 2) return 0; var s = Math.abs(ticks[1] - ticks[0]); return s >= 1 ? 0 : s >= 0.1 ? 1 : s >= 0.01 ? 2 : 3; }
  function clip(c, P, pad) { pad = pad || 0; c.save(); c.beginPath(); c.rect(P.x - pad, P.y - pad, P.w + 2 * pad, P.h + 2 * pad); c.clip(); }
  // a polyline through data points: xs, ys arrays (or a function f(x) sampled over the x range when ys is a function)
  function curve(c, P, xs, ys, col, lw, dash) {
    c.save(); c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.lineCap = 'round'; if (dash) c.setLineDash(dash);
    c.beginPath(); var started = false;
    for (var i = 0; i < xs.length; i++) { var yv = ys[i]; if (!isFinite(yv)) { started = false; continue; } var px = P.X(xs[i]), py = P.Y(yv); if (!started) { c.moveTo(px, py); started = true; } else c.lineTo(px, py); }
    c.stroke(); c.restore();
  }
  function fn(c, P, f, col, lw, dash, a, b, n) {
    a = a === undefined ? P.xr[0] : a; b = b === undefined ? P.xr[1] : b; n = n || 120; var xs = [], ys = [];
    for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n; xs.push(x); ys.push(f(x)); }
    curve(c, P, xs, ys, col, lw, dash);
  }
  function dot(c, x, y, r, fill, stroke, lw) { c.beginPath(); c.arc(x, y, r, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } }
  function seg(el, attr, cur, cb) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); cb(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd' + (r[2] ? ' class="' + r[2] + '"' : '') + '>' + r[1] + '</dd>'; }).join(''); }
  // a range slider bound to a state object: o = {el, out, get(), set(v), show(v)}
  function slider(id, get, set, show) {
    var el = $(id), out = $(id + '-o');
    function sync() { el.value = get(); if (out) out.textContent = show(get()); }
    el.addEventListener('input', function () { set(+el.value); if (out) out.textContent = show(+el.value); });
    sync(); return sync;
  }
  function counts(vals, lo, hi, nb) { var c = new Array(nb).fill(0), w = (hi - lo) / nb; vals.forEach(function (v) { var k = Math.floor((v - lo) / w); if (k >= 0 && k < nb) c[k]++; }); return c; }
  // pointer helper: positions in CSS pixels relative to the canvas
  function pointer(cv, h) {
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    var down = false;
    cv.addEventListener('pointerdown', function (e) { var p = pos(e); down = true; if (h.down && h.down(p.x, p.y, e) !== false) { try { cv.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); } });
    cv.addEventListener('pointermove', function (e) { var p = pos(e); if (down && h.drag) h.drag(p.x, p.y, e); else if (h.hover) h.hover(p.x, p.y, e); });
    function up(e) { if (!down) return; down = false; var p = pos(e); if (h.up) h.up(p.x, p.y, e); }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', function () { if (!down && h.leave) h.leave(); });
  }
  function celebrate(el) {
    if (reduced || !el) return;
    el.classList.remove(PFX + '-win'); void el.offsetWidth; el.classList.add(PFX + '-win');
    setTimeout(function () { el.classList.remove(PFX + '-win'); }, 1300);
  }
  function pText(p) { return p < 0.001 ? '< 0.001' : fmt(p, 3); }
  function pEq(p) { return p < 0.001 ? 'p < 0.001' : 'p = ' + fmt(p, 3); }

  var M = window.Ec13Model, root = $('ec13-lab');
  if (!M || !root) return;
  var store = L.store('econ-rd');

  var MIS = [
    { id: 'jump', title: 'Measure the jump', goal: 'Get an estimate within 1 point of the true effect with a standard error under 2.', sec: 'ec13-view' },
    { id: 'wide', title: 'Too smooth', goal: 'Make the bias from the curve alone bigger than 2 points: widen the bandwidth, or fit flat lines (order 0).', sec: 'ec13-view' },
    { id: 'narrow', title: 'Too noisy', goal: 'Shrink the bandwidth to 5 points or less until the standard error passes 2.8.', sec: 'ec13-view' },
    { id: 'sweet', title: 'The sweet spot', goal: 'Run “Scan bandwidths”, then set the bandwidth where the error (RMSE) is within 10% of its lowest point.', sec: 'ec13-view' },
    { id: 'cheat', title: 'Catch the bunching', goal: 'Turn on manipulation until the density test rejects (p < 0.05).', sec: 'ec13-view' },
    { id: 'placebo', title: 'Placebo test', goal: 'With manipulation on, switch the plot to the placebo covariate and find a jump that shouldn’t be there (|t| > 1.96).', sec: 'ec13-view' },
    { id: 'fuzzy', title: 'Fuzzy, not fooled', goal: 'In the fuzzy design, get the IV estimate within 1.5 of the truth while the takers-vs-others comparison misses by more than 3.', sec: 'ec13-fz' },
    { id: 'weak', title: 'Weak first stage', goal: 'Shrink the jump in take-up to 0.10 or less and watch the standard error explode past 5.', sec: 'ec13-fz' }
  ];
  var view = $('ec13-view'), mis = L.missions($('ec13-missions'), 'econ-rd', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    var el = $(m.sec); if (el && m.sec !== 'ec13-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }

  /* =========================================================================================
     1. Sharp RD
     ========================================================================================= */
  var SHN = { scurve: 'S-curve', wiggly: 'Wiggly', kink: 'Kink', flat: 'Straight' };
  var st = { shape: store.get('shape', 'scurve'), plot: 'y', h: +store.get('h', 10), ord: +store.get('ord', 1), k: store.get('k', 'tri'), tau: +store.get('tau', 6),
    n: +store.get('n', 1000), manip: +store.get('manip', 0), truth: store.get('truth', true), showMan: store.get('showMan', true), seed: 21, touched: false };
  if (!SHN[st.shape]) st.shape = 'scurve';
  var cv = $('ec13-cv'), G = L.canvas(cv), ctx = G.c, hud = $('ec13-hud');
  var data, E, Ecurve, Ey1, dens, scan = null, dirty = true, Lo = null;
  function params() { return { n: st.n, shape: st.shape, tau: st.tau, sd: 8, manip: st.manip }; }
  function regen() { data = M.gen(params(), st.seed); refit(); }
  function vals() { return data.map(function (o) { return st.plot === 'y' ? o.y : o.cov; }); }
  function refit() {
    var xs = data.map(function (o) { return o.x; }), ys = vals(), f = M.SHAPES[st.shape];
    E = M.locpoly(xs, ys, st.h, st.ord, st.k);
    // the bias that comes from the curve alone: fit the noise-free outcome at the same scores
    Ecurve = st.plot === 'y' ? M.locpoly(xs, data.map(function (o) { return f(o.x) + st.tau * o.D; }), st.h, st.ord, st.k) : null;
    Ey1 = st.ord !== 1 ? M.locpoly(xs, ys, st.h, 1, st.k) : E;
    dens = M.mccrary(xs, 2, 12, -50, 50);
    dirty = true; readout(); checks();
  }
  function bias() { return Ecurve ? Ecurve.tau - st.tau : NaN; }
  function checks() {
    if (!st.touched || !E) return;
    var b = bias();
    if (st.plot === 'y' && Math.abs(E.tau - st.tau) < 1 && E.se < 2) win('jump', 'Estimated jump ' + fmt(E.tau, 2) + ' vs truth ' + fmt(st.tau, 1) + ', SE ' + fmt(E.se, 2) + '.');
    if (st.plot === 'y' && Math.abs(b) > 2) win('wide', 'The curve alone biases the jump by ' + fmt(b, 2) + ' points, no matter how much data.');
    if (st.h <= 5 && E.se > 2.8) win('narrow', 'Only ' + (E.nL + E.nR) + ' students in the window: SE ' + fmt(E.se, 2) + '.');
    if (st.manip >= 0.1 && dens.p < 0.05) win('cheat', 'Too many students just above 50: the density jumps (' + pEq(dens.p) + ').');
    if (st.manip > 0 && st.plot === 'cov' && Math.abs(E.tau / E.se) > 1.96) win('placebo', 'Last year’s homework hours “jump” at the cutoff (t = ' + fmt(E.tau / E.se, 2) + '). Something is off.');
    if (scan && scan.done && st.plot === 'y') {
      var r = scanAt(st.h); if (r && r <= 1.1 * scan.min) win('sweet', 'RMSE ' + fmt(r, 2) + ' at h = ' + st.h + ', near the best possible ' + fmt(scan.min, 2) + '.');
    }
  }
  // the bandwidth scan: for each bandwidth, the bias and spread of the estimate over 150 fresh samples
  var HS = [3, 4, 5, 6, 8, 10, 12, 15, 18, 22, 27, 33, 40, 50];
  function startScan() {
    st.touched = true;
    scan = { reps: 0, R: 150, sum: HS.map(function () { return 0; }), sq: HS.map(function () { return 0; }), done: false, key: scanKey() };
    L.toast(view, 'Scanning 14 bandwidths × 150 samples…'); pump();
  }
  function scanKey() { return [st.shape, st.ord, st.k, st.tau, st.n].join('|'); }
  function pump() {
    if (!scan || scan.done) return;
    var per = reduced ? 150 : 6, pp = params(); pp.manip = 0;
    for (var r = 0; r < per && scan.reps < scan.R; r++) {
      var d = M.gen(pp, 777001 + scan.reps * 31), xs = d.map(function (o) { return o.x; }), ys = d.map(function (o) { return o.y; });
      HS.forEach(function (h, j) { var e = M.locpoly(xs, ys, h, st.ord, st.k); var v = e ? e.tau - st.tau : 0; scan.sum[j] += v; scan.sq[j] += v * v; });
      scan.reps++;
    }
    if (scan.reps >= scan.R) {
      scan.done = true; scan.bias = scan.sum.map(function (s) { return s / scan.R; });
      scan.vr = scan.sq.map(function (q, j) { return q / scan.R - scan.bias[j] * scan.bias[j]; });
      scan.rmse = scan.sq.map(function (q) { return Math.sqrt(q / scan.R); });
      scan.min = Math.min.apply(null, scan.rmse); scan.best = HS[scan.rmse.indexOf(scan.min)];
      readout(); checks();
    }
    dirty = true; if (!scan.done) setTimeout(pump, 16);
  }
  function scanAt(h) { // RMSE at bandwidth h, interpolated on the grid
    if (!scan || !scan.done) return NaN;
    if (h <= HS[0]) return scan.rmse[0]; if (h >= HS[HS.length - 1]) return scan.rmse[HS.length - 1];
    for (var j = 0; j < HS.length - 1; j++) if (h <= HS[j + 1]) { var t = (h - HS[j]) / (HS[j + 1] - HS[j]); return scan.rmse[j] + t * (scan.rmse[j + 1] - scan.rmse[j]); }
    return NaN;
  }
  function layout(w, h) {
    if (w >= 640) {
      var lw = Math.round(w * 0.62), dh = Math.round(h * 0.25), rx = lw + 8, rw = w - rx - 10, top = 54, ch = Math.round((h - top - 10) * 0.42);
      return { wide: true, sc: { x: 0, y: 0, w: lw, h: h - dh - 6 }, de: { x: 8, y: h - dh - 4, w: lw - 8, h: dh - 4 }, jump: { x: rx, y: top, w: rw, h: ch }, bv: { x: rx, y: top + ch + 8, w: rw, h: h - top - ch - 18 } };
    }
    var a = Math.round(h * 0.44), b = Math.round(h * 0.17), c2 = Math.round(h * 0.17);
    return { wide: false, sc: { x: 0, y: 0, w: w, h: a }, de: { x: 6, y: a + 2, w: w - 12, h: b - 4 }, jump: { x: 6, y: a + b + 2, w: w - 12, h: c2 - 4 }, bv: { x: 6, y: a + b + c2 + 2, w: w - 12, h: h - a - b - c2 - 8 } };
  }
  var PS = null; // the scatter plot area, for dragging the bandwidth
  function draw() {
    G.fit(); var c = ctx, w = G.w, h = G.h; c.clearRect(0, 0, w, h);
    Lo = layout(w, h); var A = Lo.sc, ys = vals(), f = M.SHAPES[st.shape];
    var lo = S.quantile(ys, 0.01), hi = S.quantile(ys, 0.99), pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    var P = PS = Plot(A.x + 44, A.y + 62, A.w - 58, A.h - 62 - 30, [0, 100], [lo, hi]);
    axes(c, P, { xt: 10, yt: 5, xlab: 'Exam score this year (cutoff 50)', ylab: st.plot === 'y' ? 'Score next year' : 'Homework hours last year (placebo)', ylabOff: 32 });
    // bandwidth window
    var xL = P.X(50 - st.h), xR = P.X(50 + st.h);
    c.fillStyle = 'rgba(99,230,190,.06)'; c.fillRect(xL, P.y, xR - xL, P.h);
    c.save(); c.strokeStyle = 'rgba(99,230,190,.55)'; c.setLineDash([5, 4]); c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(xL, P.y); c.lineTo(xL, P.y + P.h); c.moveTo(xR, P.y); c.lineTo(xR, P.y + P.h); c.stroke(); c.restore();
    [xL, xR].forEach(function (x) { rr(c, x - 5, P.y + P.h / 2 - 14, 10, 28, 4); c.fillStyle = 'rgba(99,230,190,.85)'; c.fill(); });
    txt(c, 'bandwidth ' + st.h + ' points ⇆ drag', (xL + xR) / 2, P.y - 6, { size: 10.5, col: C.green, align: 'center' });
    c.save(); c.strokeStyle = 'rgba(255,212,121,.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(P.X(50), P.y - 2); c.lineTo(P.X(50), P.y + P.h); c.stroke(); c.restore();
    clip(c, P, 2);
    var r = data.length > 1500 ? 1.4 : 1.9;
    data.forEach(function (o, i) {
      var col = st.showMan && o.man ? C.pink : o.D ? C.gold : C.blue, a = st.showMan && o.man ? 0.9 : Math.abs(o.x) <= st.h ? 0.5 : 0.22;
      dot(c, P.X(o.s), P.Y(ys[i]), st.showMan && o.man ? r + 0.8 : r, rgba(col, a));
    });
    // binned means (width 2)
    var bs = [], bc = []; for (var j = 0; j < 50; j++) { bs.push(0); bc.push(0); }
    data.forEach(function (o, i) { var k = Math.min(49, Math.floor(o.s / 2)); bs[k] += ys[i]; bc[k]++; });
    for (j = 0; j < 50; j++) if (bc[j] >= 4) dot(c, P.X(2 * j + 1), P.Y(bs[j] / bc[j]), 3.2, 'rgba(6,17,26,.6)', 'rgba(255,255,255,.85)', 1.3);
    if (st.truth && st.plot === 'y') { fn(c, P, function (s) { return f(s - 50); }, rgba(C.pink, 0.9), 1.8, [3, 4], 0, 49.99); fn(c, P, function (s) { return f(s - 50) + st.tau; }, rgba(C.pink, 0.9), 1.8, [3, 4], 50, 100); }
    if (E) {
      fn(c, P, function (s) { return M.curveAt(E.bl, st.h, s - 50); }, C.blue, 3.2, null, 50 - st.h, 49.999, 60);
      fn(c, P, function (s) { return M.curveAt(E.br, st.h, s - 50); }, C.gold, 3.2, null, 50, 50 + st.h, 60);
    }
    c.restore();
    if (E) {
      var x0 = P.X(50) + 7, ya = P.Y(E.aL), yb = P.Y(E.aR);
      c.save(); c.strokeStyle = C.green; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x0 - 4, ya); c.lineTo(x0, ya); c.lineTo(x0, yb); c.lineTo(x0 - 4, yb); c.stroke(); c.restore();
      dot(c, P.X(50), ya, 4.5, C.blue, '#06111a', 1.5); dot(c, P.X(50), yb, 4.5, C.gold, '#06111a', 1.5);
      var lab = 'jump ' + fmt(E.tau, 2);
      c.save(); var tw0 = tw(c, lab, 12, 700, true); rr(c, x0 + 4, (ya + yb) / 2 - 10, tw0 + 10, 18, 5); c.fillStyle = 'rgba(6,17,26,.8)'; c.fill(); c.restore();
      txt(c, lab, x0 + 9, (ya + yb) / 2 + 4, { size: 12, weight: 700, mono: true, col: C.green });
    }
    // legend
    var items = [[C.blue, 'below 50: no tutoring'], [C.gold, '50 or more: tutoring']];
    if (st.truth && st.plot === 'y') items.push([C.pink, 'true curve (dashed)']);
    if (st.manip > 0 && st.showMan) items.push([C.pink, '● moved over the line']);
    items.forEach(function (it, i) { txt(c, it[1], P.x + 6 + (Lo.wide ? 0 : 0), P.y + 12 + i * 14, { size: 10.5, col: it[0], weight: 600 }); });
    drawDensity(c, Lo.de); drawJump(c, Lo.jump); drawBV(c, Lo.bv);
    hud.innerHTML = '<b>' + SHN[st.shape] + '</b> · order ' + st.ord + ' · ' + (st.k === 'tri' ? 'triangular' : 'uniform') + ' kernel';
  }
  function drawDensity(c, A) {
    card(c, A.x, A.y, A.w, A.h, 'STUDENTS AT EACH SCORE');
    var bins = dens.bins, mx = 0; bins.forEach(function (b) { mx = Math.max(mx, b.y); });
    var narrow = A.w < 560, P = Plot(A.x + 36, A.y + (narrow ? 38 : 24), A.w - 48, A.h - (narrow ? 58 : 44), [0, 100], [0, mx * 1.15]);
    axes(c, P, { xt: 10, yticks: [], noXgrid: true });
    var bw = P.X(2) - P.X(0);
    bins.forEach(function (b) { var s = b.mid + 50, y = P.Y(b.y); c.fillStyle = rgba(b.mid < 0 ? C.blue : C.gold, Math.abs(b.mid) < 12 ? 0.6 : 0.3); c.fillRect(P.X(s - 1) + 0.5, y, bw - 1, P.y + P.h - y); });
    if (isFinite(dens.theta)) {
      fn(c, P, function (s) { return M.curveAt(dens.bL, 12, s - 50); }, C.ink, 2, null, 38, 49.99, 20);
      fn(c, P, function (s) { return M.curveAt(dens.bR, 12, s - 50); }, C.ink, 2, null, 50, 62, 20);
      var bad = dens.p < 0.05;
      var msg = 'density test: ln f₊ − ln f₋ = ' + fmt(dens.theta, 2) + ', ' + pEq(dens.p);
      if (narrow) txt(c, msg, A.x + 10, A.y + 32, { size: 10.5, mono: true, col: bad ? C.red : C.green, max: A.w - 20 });
      else txt(c, msg, A.x + A.w - 12, A.y + 17, { size: 10.5, mono: true, col: bad ? C.red : C.green, align: 'right', max: A.w - 200 });
    }
  }
  function drawJump(c, A) {
    card(c, A.x, A.y, A.w, A.h, st.plot === 'y' ? 'THE JUMP AT 50' : 'PLACEBO: JUMP IN A PRE-DETERMINED COVARIATE');
    if (!E) { txt(c, 'Too few students in the window.', A.x + 10, A.y + 40, { size: 12, col: C.red }); return; }
    var x = A.x + 12, y = A.y + 30, big = A.h > 110 ? 26 : 20;
    var ci = [E.tau - 1.96 * E.se, E.tau + 1.96 * E.se];
    txt(c, fmt(E.tau, 2), x, y + big - 4, { size: big, weight: 700, mono: true, col: C.green });
    txt(c, '± ' + fmt(1.96 * E.se, 2) + ' (95%)', x + tw(c, fmt(E.tau, 2), big, 700, true) + 10, y + big - 6, { size: 12, mono: true, col: C.muted });
    var rows = st.plot === 'y' ? [['true effect', fmt(st.tau, 2)], ['bias from the curve', fmt(bias(), 2)], ['standard error', fmt(E.se, 2)], ['students in window', (E.nL + E.nR).toLocaleString('en-US')]]
      : [['t statistic', fmt(E.tau / E.se, 2)], ['should be', 'about 0'], ['standard error', fmt(E.se, 2)], ['students in window', (E.nL + E.nR).toLocaleString('en-US')]];
    var lh = Math.min(17, (A.y + A.h - (y + big + 8)) / rows.length);
    if (lh < 11) rows = rows.slice(0, 2), lh = Math.min(17, (A.y + A.h - (y + big + 8)) / 2);
    var col2 = A.w > 420 ? 2 : 1, cw = (A.w - 24) / col2;
    rows.forEach(function (r0, i) {
      var cx = x + (col2 === 2 ? (i % 2) * cw : 0), cy = y + big + 14 + (col2 === 2 ? Math.floor(i / 2) : i) * (lh + 2);
      txt(c, r0[0], cx, cy, { size: 10.5, col: C.muted }); txt(c, r0[1], cx + cw - 12, cy, { size: 11, mono: true, col: C.ink, align: 'right' });
    });
  }
  function drawBV(c, A) {
    card(c, A.x, A.y, A.w, A.h, 'BIAS–VARIANCE: ERROR vs BANDWIDTH' + (scan && !scan.done ? ' · ' + scan.reps + '/150' : ''));
    if (!scan) {
      txt(c, 'Press “Scan bandwidths” (or S): 150 fresh', A.x + A.w / 2, A.y + A.h / 2 - 2, { size: 11.5, col: C.muted, align: 'center', max: A.w - 16 });
      txt(c, 'samples for each of 14 bandwidths.', A.x + A.w / 2, A.y + A.h / 2 + 14, { size: 11.5, col: C.muted, align: 'center', max: A.w - 16 });
      return;
    }
    if (!scan.done) {
      var pw = (A.w - 40) * scan.reps / scan.R; rr(c, A.x + 20, A.y + A.h / 2 - 5, A.w - 40, 10, 5); c.fillStyle = 'rgba(120,170,200,.15)'; c.fill();
      rr(c, A.x + 20, A.y + A.h / 2 - 5, Math.max(10, pw), 10, 5); c.fillStyle = C.green; c.fill(); return;
    }
    var mx = 0; HS.forEach(function (hh, j) { mx = Math.max(mx, scan.rmse[j] * scan.rmse[j]); });
    var P = Plot(A.x + 40, A.y + 40, A.w - 54, A.h - 74, [Math.log(3), Math.log(50)], [0, Math.min(mx, 4 * scan.min * scan.min) * 1.1]);
    axes(c, P, { xticks: [3, 5, 10, 20, 50].map(Math.log), xf: function (v) { return String(Math.round(Math.exp(v))); }, yt: 3, xlab: 'bandwidth (log scale)' });
    var lx = HS.map(Math.log);
    clip(c, P, 1);
    curve(c, P, lx, scan.bias.map(function (b) { return b * b; }), C.gold, 2);
    curve(c, P, lx, scan.vr, C.blue, 2);
    curve(c, P, lx, scan.rmse.map(function (r0) { return r0 * r0; }), C.green, 3);
    c.restore();
    var xh = P.X(Math.log(clamp(st.h, 3, 50)));
    c.save(); c.strokeStyle = C.ink; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(xh, P.y); c.lineTo(xh, P.y + P.h); c.stroke(); c.restore();
    dot(c, P.X(Math.log(scan.best)), P.Y(scan.min * scan.min), 4, C.green, '#06111a');
    txt(c, 'bias²', A.x + 12, A.y + 32, { size: 10.5, col: C.gold, weight: 700 }); txt(c, 'variance', A.x + 52, A.y + 32, { size: 10.5, col: C.blue, weight: 700 }); txt(c, 'MSE = bias² + variance', A.x + 112, A.y + 32, { size: 10.5, col: C.green, weight: 700, max: A.w - 124 });
  }
  function readout() {
    if (!E) { dl($('ec13-read'), [['Estimate', '—']]); return; }
    var rows = [
      ['Jump estimate (SE)', fmt(E.tau, 2) + ' (' + fmt(E.se, 2) + ')'],
      ['95% CI', '[' + fmt(E.tau - 1.96 * E.se, 2) + ', ' + fmt(E.tau + 1.96 * E.se, 2) + ']'],
      [st.plot === 'y' ? 'True effect' : 'True jump in the covariate', st.plot === 'y' ? fmt(st.tau, 2) : '0'],
      ['Bias from the curve', st.plot === 'y' ? fmt(bias(), 2) : '—'],
      ['Students in the window', (E.nL + E.nR) + ' of ' + data.length],
      ['Density test', pEq(dens.p), dens.p < 0.05 ? 'ec13-bad' : '']
    ];
    if (st.ord !== 1 && Ey1) rows.push(['SE with a straight line', fmt(Ey1.se, 2)]);
    if (scan && scan.done) rows.push(['Best bandwidth in the scan', scan.best + ' (RMSE ' + fmt(scan.min, 2) + ')']);
    dl($('ec13-read'), rows);
  }
  function touch() { st.touched = true; }
  function save() { ['shape', 'h', 'ord', 'k', 'tau', 'n', 'manip'].forEach(function (k) { store.set(k, st[k]); }); }
  var markShape = seg($('ec13-shape'), 'data-s', st.shape, function (v) { touch(); st.shape = v; save(); scan = null; regen(); });
  var markPlot = seg($('ec13-plot'), 'data-p', st.plot, function (v) { touch(); st.plot = v; refit(); });
  var markOrd = seg($('ec13-ord'), 'data-o', st.ord, function (v) { touch(); st.ord = +v; save(); scan = null; refit(); });
  var markK = seg($('ec13-k'), 'data-k', st.k, function (v) { touch(); st.k = v; save(); scan = null; refit(); });
  var syncH = slider('ec13-h', function () { return st.h; }, function (v) { touch(); st.h = v; save(); refit(); }, function (v) { return v + ' points'; });
  var syncTau = slider('ec13-tau', function () { return st.tau; }, function (v) { touch(); st.tau = v; save(); scan = null; regen(); }, function (v) { return (v > 0 ? '+' : '') + fmt(v, 1); });
  var syncN = slider('ec13-n', function () { return st.n; }, function (v) { touch(); st.n = v; save(); scan = null; regen(); }, function (v) { return v.toLocaleString('en-US'); });
  var syncMan = slider('ec13-man', function () { return st.manip * 100; }, function (v) { touch(); st.manip = v / 100; save(); regen(); }, function (v) { return v + '%'; });
  var cT = $('ec13-truth'), cM = $('ec13-showman'); cT.checked = !!st.truth; cM.checked = !!st.showMan;
  cT.addEventListener('change', function () { st.truth = cT.checked; store.set('truth', st.truth); dirty = true; });
  cM.addEventListener('change', function () { st.showMan = cM.checked; store.set('showMan', st.showMan); dirty = true; });
  function newSample() { touch(); st.seed = 1 + Math.floor(Math.random() * 1e8); regen(); }
  $('ec13-new').addEventListener('click', newSample); $('ec13-new2').addEventListener('click', newSample);
  $('ec13-scan').addEventListener('click', startScan);
  // drag the edges of the bandwidth window
  var drag = false;
  function nearEdge(x, y) { if (!PS || y < PS.y - 10 || y > PS.y + PS.h + 10) return false; return Math.abs(x - PS.X(50 - st.h)) < 14 || Math.abs(x - PS.X(50 + st.h)) < 14; }
  pointer(cv, {
    down: function (x, y) { if (nearEdge(x, y)) { drag = true; return true; } return false; },
    drag: function (x) { if (!drag) return; var hh = clamp(Math.round(Math.abs(PS.iX(x) - 50)), 2, 50); if (hh !== st.h) { touch(); st.h = hh; save(); syncH(); refit(); } },
    up: function () { drag = false; },
    hover: function (x, y) { cv.style.cursor = nearEdge(x, y) ? 'ew-resize' : 'default'; }
  });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === 'ArrowRight') { touch(); st.h = clamp(st.h + 1, 2, 50); syncH(); save(); refit(); }
    else if (k === 'ArrowLeft') { touch(); st.h = clamp(st.h - 1, 2, 50); syncH(); save(); refit(); }
    else if (k === 'ArrowUp') { touch(); st.ord = clamp(st.ord + 1, 0, 4); markOrd(st.ord); scan = null; save(); refit(); }
    else if (k === 'ArrowDown') { touch(); st.ord = clamp(st.ord - 1, 0, 4); markOrd(st.ord); scan = null; save(); refit(); }
    else if (k === 'n' || k === 'N') newSample();
    else if (k === 's' || k === 'S') startScan();
    else used = false;
    if (used) e.preventDefault();
  });
  $('ec13-reset').addEventListener('click', function () {
    st.h = 10; st.ord = 1; st.k = 'tri'; st.tau = 6; st.n = 1000; st.manip = 0; st.shape = 'scurve'; st.plot = 'y'; scan = null; save();
    markShape(st.shape); markPlot(st.plot); markOrd(st.ord); markK(st.k); syncH(); syncTau(); syncN(); syncMan(); regen();
  });

  /* =========================================================================================
     2. Fuzzy RD
     ========================================================================================= */
  var fz = { jump: +store.get('fzJ', 0.5), p0: +store.get('fzP', 0.15), tau: +store.get('fzT', 5), h: +store.get('fzH', 15), n: +store.get('fzN', 2000), seed: 8, touched: false };
  var fcv = $('ec13-fc'), FG = L.canvas(fcv), fd, fe, dirtyF = true;
  function fzFit() {
    fd = M.fuzzyGen({ n: fz.n, p0: fz.p0, jump: fz.jump, tau: fz.tau, sd: 8 }, fz.seed); fe = M.fuzzyEst(fd, fz.h); dirtyF = true;
    if (!fe) { dl($('ec13-fzread'), [['Estimate', 'too few students']]); return; }
    dl($('ec13-fzread'), [
      ['Jump in take-up (first stage)', fmt(fe.fs.tau, 3) + ' (' + fmt(fe.fs.se, 3) + ')'],
      ['Jump in outcome (reduced form)', fmt(fe.rf.tau, 2) + ' (' + fmt(fe.rf.se, 2) + ')'],
      ['Fuzzy RD = ratio (SE)', fmt(fe.tau, 2) + ' (' + fmt(fe.se, 2) + ')', fe.se > 5 ? 'ec13-bad' : ''],
      ['True effect of tutoring', fmt(fz.tau, 2)],
      ['Takers vs others, same window', fmt(fe.naive, 2), Math.abs(fe.naive - fz.tau) > 3 ? 'ec13-bad' : '']
    ]);
    if (!fz.touched) return;
    if (Math.abs(fe.tau - fz.tau) < 1.5 && Math.abs(fe.naive - fz.tau) > 3) win('fuzzy', 'IV at the cutoff: ' + fmt(fe.tau, 2) + '. Comparing takers with others: ' + fmt(fe.naive, 2) + '.', $('ec13-fzv'));
    if (fz.jump <= 0.1 && fe.se > 5) win('weak', 'A tiny first stage: SE ' + fmt(fe.se, 1) + '. Dividing by almost zero is risky.', $('ec13-fzv'));
  }
  function drawF() {
    FG.fit(); var c = FG.c, w = FG.w, h = FG.h; c.clearRect(0, 0, w, h); if (!fe) return;
    var wide = w >= 640, A1, A2;
    if (wide) { var hw = (w - 24) / 2; A1 = { x: 8, y: 8, w: hw, h: h - 16 }; A2 = { x: 16 + hw, y: 8, w: hw, h: h - 16 }; }
    else { var hh = (h - 20) / 2; A1 = { x: 6, y: 6, w: w - 12, h: hh }; A2 = { x: 6, y: hh + 14, w: w - 12, h: hh }; }
    function panel(A, title, key, yr, fit, col, lab) {
      card(c, A.x, A.y, A.w, A.h, title);
      var P = Plot(A.x + 40, A.y + 30, A.w - 54, A.h - 64, [10, 90], yr);
      axes(c, P, { xt: 8, yt: 4, xlab: 'exam score (cutoff 50)', yf: key === 'D' ? function (v) { return Math.round(v * 100) + '%'; } : null });
      c.fillStyle = 'rgba(99,230,190,.06)'; c.fillRect(P.X(50 - fz.h), P.y, P.X(50 + fz.h) - P.X(50 - fz.h), P.h);
      c.save(); c.strokeStyle = 'rgba(255,212,121,.7)'; c.beginPath(); c.moveTo(P.X(50), P.y); c.lineTo(P.X(50), P.y + P.h); c.stroke(); c.restore();
      var s = [], n = []; for (var j = 0; j < 40; j++) { s.push(0); n.push(0); }
      fd.forEach(function (o) { var k = Math.floor((o.x + 50 - 10) / 2); if (k >= 0 && k < 40) { s[k] += o[key]; n[k]++; } });
      for (j = 0; j < 40; j++) if (n[j] > 5) dot(c, P.X(11 + 2 * j), P.Y(s[j] / n[j]), 3.6, rgba(11 + 2 * j < 50 ? C.blue : C.gold, 0.85), '#06111a', 1);
      fn(c, P, function (x) { return M.curveAt(fit.bl, fz.h, x - 50); }, C.blue, 3, null, 50 - fz.h, 49.99, 30);
      fn(c, P, function (x) { return M.curveAt(fit.br, fz.h, x - 50); }, C.gold, 3, null, 50, 50 + fz.h, 30);
      var x0 = P.X(50) + 7, ya = P.Y(fit.aL), yb = P.Y(fit.aR);
      c.save(); c.strokeStyle = col; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x0 - 4, ya); c.lineTo(x0, ya); c.lineTo(x0, yb); c.lineTo(x0 - 4, yb); c.stroke(); c.restore();
      txt(c, lab, x0 + 6, Math.min(ya, yb) - 6, { size: 12, weight: 700, mono: true, col: col });
      return P;
    }
    panel(A1, 'FIRST STAGE: SHARE WHO TAKE THE TUTORING', 'D', [0, 1], fe.fs, C.violet, 'jump ' + fmt(fe.fs.tau, 2));
    var bm = {}, bn = {}; fd.forEach(function (o) { var k = Math.floor((o.x + 40) / 2); if (k >= 0 && k < 40) { bm[k] = (bm[k] || 0) + o.y; bn[k] = (bn[k] || 0) + 1; } });
    var yy = Object.keys(bm).filter(function (k) { return bn[k] > 5; }).map(function (k) { return bm[k] / bn[k]; });
    var lo = Math.min.apply(null, yy), hi = Math.max.apply(null, yy), pd = (hi - lo) * 0.08; lo -= pd; hi += pd;
    var P2 = panel(A2, 'REDUCED FORM: SCORE NEXT YEAR', 'y', [lo, hi], fe.rf, C.green, 'jump ' + fmt(fe.rf.tau, 2));
    var msg = 'fuzzy RD = ' + fmt(fe.rf.tau, 2) + ' ÷ ' + fmt(fe.fs.tau, 2) + ' = ' + fmt(fe.tau, 2), mw = tw(c, msg, 12, 700, true) + 14;
    c.save(); rr(c, P2.x + 4, P2.y + 4, Math.min(mw, P2.w - 8), 22, 6); c.fillStyle = 'rgba(6,17,26,.88)'; c.fill(); c.strokeStyle = 'rgba(255,212,121,.5)'; c.stroke(); c.restore();
    txt(c, msg, P2.x + 11, P2.y + 19, { size: 12, weight: 700, mono: true, col: C.gold, max: P2.w - 20 });
  }
  function fzTouch() { fz.touched = true; }
  slider('ec13-fzj', function () { return fz.jump; }, function (v) { fzTouch(); fz.jump = v; store.set('fzJ', v); fzFit(); }, function (v) { return '+' + Math.round(v * 100) + ' points'; });
  slider('ec13-fzp', function () { return fz.p0; }, function (v) { fzTouch(); fz.p0 = v; store.set('fzP', v); fzFit(); }, function (v) { return Math.round(v * 100) + '%'; });
  slider('ec13-fzt', function () { return fz.tau; }, function (v) { fzTouch(); fz.tau = v; store.set('fzT', v); fzFit(); }, function (v) { return fmt(v, 1); });
  slider('ec13-fzh', function () { return fz.h; }, function (v) { fzTouch(); fz.h = v; store.set('fzH', v); fzFit(); }, function (v) { return v + ' points'; });
  slider('ec13-fzn', function () { return fz.n; }, function (v) { fzTouch(); fz.n = v; store.set('fzN', v); fzFit(); }, function (v) { return v.toLocaleString('en-US'); });
  $('ec13-fznew').addEventListener('click', function () { fzTouch(); fz.seed = 1 + Math.floor(Math.random() * 1e8); fzFit(); });

  window.addEventListener('resize', function () { dirty = true; dirtyF = true; });
  regen(); fzFit();
  L.loop(function () { if (dirty) { draw(); dirty = false; } }, view);
  L.loop(function () { if (dirtyF) { drawF(); dirtyF = false; } }, $('ec13-fzv'));
})();
