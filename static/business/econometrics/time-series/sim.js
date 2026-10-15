/* Time Series: Trends, Autocorrelation and Forecasting (/business/econometrics/time-series/): drawing and controls for the
   AR(1) stream with its autocorrelations, spurious regression, forecasting and cointegration.
   The models are in model.js (window.Ec15Model); statistics from stats.js (window.EconStats). */
(function () {
  'use strict';
  var PFX = 'ec15';
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

  var M = window.Ec15Model, root = $('ec15-lab');
  if (!M || !root) return;
  var store = L.store('econ-ts');

  var MIS = [
    { id: 'white', title: 'White noise', goal: 'Set φ = 0 and θ = 0. Almost every autocorrelation bar stays inside the dashed bands: the past says nothing about the future.', sec: 'ec15-view' },
    { id: 'memory', title: 'Long memory', goal: 'Push φ to 0.95 or more until the autocorrelation at lag 10 is still above 0.5.', sec: 'ec15-view' },
    { id: 'zigzag', title: 'Zigzag', goal: 'Set φ to −0.6 or below and watch the autocorrelations flip sign at every lag.', sec: 'ec15-view' },
    { id: 'unit', title: 'Unit root', goal: 'Set φ = 1 (a random walk) and see the Dickey–Fuller test fail to reject a unit root.', sec: 'ec15-view' },
    { id: 'spur', title: 'Spurious!', goal: 'In “Two random walks”, run 1,000 regressions of one independent random walk on another. More than half come out “significant”.', sec: 'ec15-view' },
    { id: 'diff', title: 'Difference it', goal: 'Tick “Difference both series first” and run 1,000 again. The false alarms fall to about 5%.', sec: 'ec15-view' },
    { id: 'fore', title: 'Fan of uncertainty', goal: 'In the forecasting lab, run 500 forecast tests and check that the 95% band catches the next value 90–99% of the time.', sec: 'ec15-fc' },
    { id: 'coint', title: 'Wandering together', goal: 'In the cointegration lab, make the spread mean-revert (ρ ≤ 0.8) until the Engle–Granger test rejects at 5%.', sec: 'ec15-co' }
  ];
  var view = $('ec15-view'), mis = L.missions($('ec15-missions'), 'econ-ts', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    if (id === 'spur' || id === 'diff') setMode('spur');
    else if (m.sec === 'ec15-view') setMode('ar');
    var el = $(m.sec); if (el && m.sec !== 'ec15-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }

  /* =========================================================================================
     1. Main: an ARMA(1,1) stream, or spurious regression
     ========================================================================================= */
  var st = { mode: store.get('mode', 'ar'), phi: +store.get('phi', 0.8), theta: +store.get('theta', 0), T: +store.get('T', 200), diff: false, nw: false, paused: false, touched: false, sphi: 1, seed: 17 };
  var cv = $('ec15-cv'), G = L.canvas(cv), ctx = G.c, hud = $('ec15-hud');
  var arma = M.Arma(st.phi, st.theta, 99), buf = [], acc = 0, stats = null, statT = 0, yr = null, dirty = true;
  arma.burn(200); for (var i0 = 0; i0 < 500; i0++) buf.push(arma.next());
  function offscreen() { var r = view.getBoundingClientRect(); return r.bottom < 0 || r.top > window.innerHeight; }
  // with reduced motion, or while the stream is off screen (on a phone the sliders sit below it), redraw the whole window at once
  function refill() { if (!reduced && !offscreen()) return; arma = M.Arma(st.phi, st.theta, 1 + Math.floor(Math.random() * 1e8)); if (Math.abs(st.phi) < 1) arma.burn(200); buf = []; for (var i = 0; i < 600; i++) buf.push(arma.next()); yr = null; }
  function computeStats() {
    var w = buf.slice(-st.T), r = S.acf(w, 20), p = M.pacf(r), d = M.df(w);
    stats = { r: r, p: p, df: d, v: S.variance(w), band: 1.96 / Math.sqrt(w.length) };
    readAR(); checksAR();
  }
  function checksAR() {
    if (!st.touched || st.mode !== 'ar' || !stats) return;
    var out = stats.r.filter(function (v) { return Math.abs(v) > stats.band; }).length;
    if (st.phi === 0 && st.theta === 0 && out <= 2) win('white', out + ' of 20 bars outside the bands: about what chance gives (1 in 20).');
    if (st.phi >= 0.95 && stats.r[9] > 0.5) win('memory', 'Lag-10 autocorrelation ' + fmt(stats.r[9], 2) + ': shocks linger for a long time.');
    if (st.phi <= -0.6 && stats.r[0] < 0 && stats.r[1] > 0 && stats.r[2] < 0 && stats.r[3] > 0) win('zigzag', 'Negative, positive, negative, positive: each value overshoots the last.');
    if (st.phi >= 0.999 && stats.df.t > M.DF_CV['5%']) win('unit', 'DF t = ' + fmt(stats.df.t, 2) + ', above −2.86: no evidence against a unit root.');
  }
  function readAR() {
    var vt = M.varTheory(st.phi, st.theta);
    dl($('ec15-read'), [
      ['Model', 'yₜ = ' + fmt(st.phi, 2) + ' yₜ₋₁ + eₜ' + (st.theta ? (st.theta > 0 ? ' + ' : ' − ') + fmt(Math.abs(st.theta), 2) + ' eₜ₋₁' : '')],
      ['Lag-1 autocorrelation (theory)', fmt(stats.r[0], 2) + ' (' + (Math.abs(st.phi) < 1 ? fmt(M.acfTheory(st.phi, st.theta, 1)[0], 2) : '—') + ')'],
      ['Variance in the window (theory)', fmt(stats.v, 2) + ' (' + (isFinite(vt) ? fmt(vt, 2) : 'grows forever') + ')'],
      ['Dickey–Fuller t', fmt(stats.df.t, 2) + (stats.df.t < M.DF_CV['5%'] ? ' → reject unit root' : ' → can’t reject'), stats.df.t < M.DF_CV['5%'] ? 'ec15-good' : ''],
      ['Bars outside the bands', stats.r.filter(function (v) { return Math.abs(v) > stats.band; }).length + ' of 20']
    ]);
  }
  // spurious regressions
  var sp = null, spMC = null;
  function newPair() { st.seed = 1 + Math.floor(Math.random() * 1e8); fitPair(); }
  function fitPair() { sp = M.spurious(st.T, st.sphi, { diff: st.diff, nw: st.nw }, st.seed); dirty = true; readSP(); }
  function startMC() {
    st.touched = true; spMC = { ts: [], rej: 0, n: 0, target: 1000, diff: st.diff, nw: st.nw, phi: st.sphi, T: st.T };
    L.toast(view, 'Running 1,000 regressions of independent series…'); pumpMC();
  }
  function pumpMC() {
    if (!spMC || spMC.n >= spMC.target) return;
    var per = reduced ? 1000 : Math.max(8, Math.round(4000 / spMC.T));
    for (var r = 0; r < per && spMC.n < spMC.target; r++) { var s = M.spurious(spMC.T, spMC.phi, { diff: spMC.diff, nw: spMC.nw }, 500000 + spMC.n * 13); spMC.ts.push(s.t); if (s.p < 0.05) spMC.rej++; spMC.n++; }
    dirty = true;
    if (spMC.n >= spMC.target) {
      var rate = spMC.rej / spMC.n; readSP();
      if (!spMC.diff && spMC.phi === 1 && rate > 0.5) win('spur', Math.round(rate * 100) + '% “significant”, yet the two series have nothing to do with each other.');
      if (spMC.diff && spMC.phi === 1 && rate >= 0.03 && rate <= 0.08) win('diff', 'Differenced: ' + fmt(rate * 100, 1) + '% false alarms, right where a 5% test should be.');
    } else setTimeout(pumpMC, 16);
  }
  function readSP() {
    var rows = [
      ['This pair: slope t', fmt(sp.t, 2) + (sp.p < 0.05 ? ' (“significant”)' : ''), sp.p < 0.05 ? 'ec15-bad' : ''],
      ['R² · Durbin–Watson', fmt(sp.r2, 2) + ' · ' + fmt(sp.dw, 2)],
      ['Regression', (st.diff ? 'Δy on Δx' : 'y on x') + ', ' + (st.nw ? 'Newey–West SE' : 'OLS SE')]
    ];
    if (spMC && spMC.n >= spMC.target) rows.push(['1,000 regressions: |t| > 1.96', fmt(spMC.rej / spMC.n * 100, 1) + '%', spMC.rej / spMC.n > 0.1 ? 'ec15-bad' : 'ec15-good']);
    dl($('ec15-read'), rows);
  }
  function setMode(m) {
    st.mode = m; store.set('mode', m); markMode(m);
    root.querySelectorAll('[data-mode]').forEach(function (el) { el.hidden = el.getAttribute('data-mode') !== m; });
    if (m === 'spur') { if (!sp) fitPair(); else readSP(); } else if (stats) readAR();
    dirty = true;
  }
  function layout(w, h) {
    if (w >= 640) { var th = Math.round(h * 0.52); return { wide: true, top: { x: 0, y: 0, w: w, h: th }, a: { x: 8, y: th + 4, w: (w - 24) / 2, h: h - th - 12 }, b: { x: 16 + (w - 24) / 2, y: th + 4, w: (w - 24) / 2, h: h - th - 12 } }; }
    var t2 = Math.round(h * 0.42), r = (h - t2 - 14) / 2;
    return { wide: false, top: { x: 0, y: 0, w: w, h: t2 }, a: { x: 6, y: t2 + 2, w: w - 12, h: r }, b: { x: 6, y: t2 + r + 8, w: w - 12, h: r } };
  }
  function drawAR(c, Lo) {
    var A = Lo.top, w = buf.slice(-st.T), lo = Math.min.apply(null, w), hi = Math.max.apply(null, w);
    if (Math.abs(st.phi) < 1) { var s4 = 3.5 * Math.sqrt(M.varTheory(st.phi, st.theta)); lo = Math.min(lo, -s4); hi = Math.max(hi, s4); }
    var target = [lo - 0.1 * (hi - lo), hi + 0.1 * (hi - lo)];
    if (!yr) yr = target.slice(); else { yr[0] += (target[0] - yr[0]) * 0.15; yr[1] += (target[1] - yr[1]) * 0.15; if (target[0] < yr[0]) yr[0] = target[0]; if (target[1] > yr[1]) yr[1] = target[1]; }
    var P = Plot(A.x + 46, A.y + 54, A.w - 62, A.h - 54 - 28, [0, st.T - 1], yr);
    axes(c, P, { xt: 5, yt: 4, xlab: 'time (the last ' + st.T + ' periods; newest on the right)', xf: function (v) { return String(Math.round(v - st.T + 1)); } });
    c.save(); c.strokeStyle = 'rgba(219,231,239,.3)'; c.beginPath(); c.moveTo(P.x, P.Y(0)); c.lineTo(P.x + P.w, P.Y(0)); c.stroke(); c.restore();
    clip(c, P, 1);
    var xs = w.map(function (v, i) { return i; });
    curve(c, P, xs, w, C.green, 1.6);
    dot(c, P.X(w.length - 1), P.Y(w[w.length - 1]), 4, C.gold);
    c.restore();
    bars(c, Lo.a, stats.r, 'AUTOCORRELATION (ACF) BY LAG', Math.abs(st.phi) < 1 ? M.acfTheory(st.phi, st.theta, 20) : null);
    var pth = Math.abs(st.phi) < 1 ? M.pacf(M.acfTheory(st.phi, st.theta, 20)) : null;
    bars(c, Lo.b, stats.p, 'PARTIAL AUTOCORRELATION (PACF)', pth);
  }
  function bars(c, A, r, title, th) {
    card(c, A.x, A.y, A.w, A.h, title);
    var P = Plot(A.x + 36, A.y + 28, A.w - 48, A.h - 52, [0.4, 20.6], [-1, 1]);
    axes(c, P, { xticks: [1, 5, 10, 15, 20], yticks: [-1, -0.5, 0, 0.5, 1], xlab: 'lag', noXgrid: true });
    var b = stats.band;
    c.fillStyle = 'rgba(116,192,252,.08)'; c.fillRect(P.x, P.Y(b), P.w, P.Y(-b) - P.Y(b));
    c.save(); c.strokeStyle = 'rgba(116,192,252,.6)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(P.x, P.Y(b)); c.lineTo(P.x + P.w, P.Y(b)); c.moveTo(P.x, P.Y(-b)); c.lineTo(P.x + P.w, P.Y(-b)); c.stroke(); c.restore();
    var bw = P.w / 20 * 0.55;
    r.forEach(function (v, k) { var x = P.X(k + 1), y0 = P.Y(0), y1 = P.Y(v); c.fillStyle = Math.abs(v) > b ? C.green : 'rgba(99,230,190,.4)'; c.fillRect(x - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0)); });
    if (th) th.forEach(function (v, k) { dot(c, P.X(k + 1), P.Y(v), 3, C.gold, '#06111a', 1); });
    if (th) txt(c, '● theory', A.x + A.w - 10, A.y + 17, { size: 10.5, col: C.gold, align: 'right' });
  }
  function drawSP(c, Lo) {
    var A = Lo.top, T = sp.y.length, ys = sp.y.concat(sp.x), lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), pd = (hi - lo) * 0.1 + 0.1;
    var P = Plot(A.x + 46, A.y + 54, A.w - 62, A.h - 54 - 28, [0, T - 1], [lo - pd, hi + pd]);
    axes(c, P, { xt: 5, yt: 4, xlab: 'time', xf: function (v) { return String(Math.round(v)); } });
    var xs = sp.y.map(function (v, i) { return i; });
    curve(c, P, xs, sp.x, C.blue, 2); curve(c, P, xs, sp.y, C.gold, 2);
    txt(c, 'y', P.X(T - 1) + 4, P.Y(sp.y[T - 1]) + 4, { size: 12, weight: 700, col: C.gold }); txt(c, 'x', P.X(T - 1) + 4, P.Y(sp.x[T - 1]) + 4, { size: 12, weight: 700, col: C.blue });
    txt(c, st.sphi === 1 ? 'two independent random walks' : 'two independent AR(' + fmt(st.sphi, 2) + ') series', P.x + 6, P.y + 12, { size: 11, col: C.muted });
    // scatter with the OLS line
    var B = Lo.a; card(c, B.x, B.y, B.w, B.h, st.diff ? 'REGRESS Δy ON Δx' : 'REGRESS y ON x');
    var X = sp.Xv, Y = sp.Y, xl = Math.min.apply(null, X), xh = Math.max.apply(null, X), yl = Math.min.apply(null, Y), yh = Math.max.apply(null, Y);
    var Q = Plot(B.x + 40, B.y + 30, B.w - 52, B.h - 56, [xl, xh], [yl - 0.05 * (yh - yl), yh + 0.05 * (yh - yl)]);
    axes(c, Q, { xt: 4, yt: 3 });
    X.forEach(function (v, i) { dot(c, Q.X(v), Q.Y(Y[i]), 2, rgba(C.violet, 0.6)); });
    fn(c, Q, function (v) { return sp.b[0] + sp.b[1] * v; }, sp.p < 0.05 ? C.red : C.green, 2.4, null, xl, xh, 2);
    var lab = 't = ' + fmt(sp.t, 2) + ' · R² = ' + fmt(sp.r2, 2);
    txt(c, lab, B.x + B.w - 10, B.y + 17, { size: 11, mono: true, col: sp.p < 0.05 ? C.red : C.green, align: 'right', max: B.w * 0.55 });
    // Monte Carlo of t statistics
    var D2 = Lo.b; card(c, D2.x, D2.y, D2.w, D2.h, 't FROM ' + (spMC ? spMC.n.toLocaleString('en-US') : 0) + ' REGRESSIONS');
    if (!spMC) { txt(c, 'Press “Run 1,000 regressions” (or R).', D2.x + D2.w / 2, D2.y + D2.h / 2 + 4, { size: 12, col: C.muted, align: 'center', max: D2.w - 20 }); return; }
    var mx = 12, R = Plot(D2.x + 20, D2.y + 30, D2.w - 40, D2.h - 58, [-mx, mx], [0, 0.45]);
    axes(c, R, { xticks: [-10, -5, 0, 5, 10], yticks: [] });
    var nb = 48, cnt = counts(spMC.ts.map(function (v) { return clamp(v, -mx + 1e-9, mx - 1e-9); }), -mx, mx, nb), bw = R.w / nb, dens = cnt.map(function (k) { return k / spMC.n / (2 * mx / nb); });
    c.fillStyle = 'rgba(255,135,135,.08)'; c.fillRect(R.x, R.y, R.X(-1.96) - R.x, R.h); c.fillRect(R.X(1.96), R.y, R.x + R.w - R.X(1.96), R.h);
    dens.forEach(function (d, k) { if (!d) return; var y = R.Y(Math.min(d, 0.45)), mid = -mx + (k + 0.5) * 2 * mx / nb; c.fillStyle = Math.abs(mid) > 1.96 ? rgba(C.red, 0.75) : rgba(C.green, 0.7); c.fillRect(R.x + k * bw + 0.5, y, bw - 1, R.y + R.h - y); });
    fn(c, R, S.normPdf, C.gold, 2, [5, 4], -mx, mx, 120);
    txt(c, '- - what a 5% test assumes', R.x + 4, R.y + 10, { size: 10.5, col: C.gold });
    txt(c, Math.round(spMC.rej / Math.max(1, spMC.n) * 1000) / 10 + '% have |t| > 1.96', R.x + R.w - 4, R.y + 12, { size: 11, mono: true, weight: 700, col: spMC.rej / Math.max(1, spMC.n) > 0.1 ? C.red : C.green, align: 'right', max: D2.w * 0.5 });
  }
  function draw() {
    G.fit(); var c = ctx, w = G.w, h = G.h; c.clearRect(0, 0, w, h);
    var Lo = layout(w, h);
    if (st.mode === 'ar') drawAR(c, Lo); else drawSP(c, Lo);
    hud.innerHTML = st.mode === 'ar' ? '<b>' + (st.phi >= 0.999 ? 'Random walk' : Math.abs(st.phi) < 0.005 && !st.theta ? 'White noise' : st.theta && Math.abs(st.phi) < 0.005 ? 'MA(1)' : st.theta ? 'ARMA(1,1)' : 'AR(1)') + '</b> φ = ' + fmt(st.phi, 2) + (st.theta ? ', θ = ' + fmt(st.theta, 2) : '') + (st.paused ? ' · paused' : '')
      : '<b>Spurious regression</b> · T = ' + st.T;
  }
  var markMode = seg($('ec15-mode'), 'data-m', st.mode, function (m) { st.touched = true; setMode(m); });
  var syncPhi = slider('ec15-phi', function () { return st.phi; }, function (v) { st.touched = true; st.phi = v; arma.phi = v; store.set('phi', v); refill(); computeStats(); dirty = true; }, function (v) { return v >= 0.999 ? '1 (random walk)' : fmt(v, 2); });
  var syncTh = slider('ec15-theta', function () { return st.theta; }, function (v) { st.touched = true; st.theta = v; arma.theta = v; store.set('theta', v); refill(); computeStats(); dirty = true; }, function (v) { return fmt(v, 2); });
  slider('ec15-T', function () { return st.T; }, function (v) { st.touched = true; st.T = v; store.set('T', v); computeStats(); if (st.mode === 'spur') fitPair(); spMC = null; dirty = true; }, function (v) { return v + ' periods'; });
  var syncSphi = slider('ec15-sphi', function () { return st.sphi; }, function (v) { st.touched = true; st.sphi = v; spMC = null; fitPair(); }, function (v) { return v >= 0.999 ? '1 (random walks)' : fmt(v, 2); });
  var cD = $('ec15-diff'); cD.addEventListener('change', function () { st.touched = true; st.diff = cD.checked; spMC = null; fitPair(); });
  seg($('ec15-se'), 'data-s', 'ols', function (v) { st.touched = true; st.nw = v === 'nw'; spMC = null; fitPair(); });
  $('ec15-pair').addEventListener('click', function () { st.touched = true; newPair(); });
  $('ec15-run').addEventListener('click', startMC);
  $('ec15-pause').addEventListener('click', function () { st.paused = !st.paused; this.textContent = st.paused ? '▶' : '❚❚'; this.setAttribute('aria-label', st.paused ? 'Play' : 'Pause'); dirty = true; });
  $('ec15-reset').addEventListener('click', function () { st.phi = 0.8; st.theta = 0; arma.phi = 0.8; arma.theta = 0; store.set('phi', 0.8); store.set('theta', 0); syncPhi(); syncTh(); computeStats(); dirty = true; });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === ' ') $('ec15-pause').click();
    else if (k === 'ArrowRight' || k === 'ArrowUp') { st.touched = true; st.phi = clamp(Math.round((st.phi + 0.05) * 100) / 100, -1, 1); arma.phi = st.phi; syncPhi(); computeStats(); }
    else if (k === 'ArrowLeft' || k === 'ArrowDown') { st.touched = true; st.phi = clamp(Math.round((st.phi - 0.05) * 100) / 100, -1, 1); arma.phi = st.phi; syncPhi(); computeStats(); }
    else if (k === 'r' || k === 'R') { if (st.mode === 'spur') startMC(); }
    else if (k === 'n' || k === 'N') { if (st.mode === 'spur') newPair(); }
    else used = false;
    if (used) { e.preventDefault(); dirty = true; }
  });

  /* =========================================================================================
     2. Forecasting
     ========================================================================================= */
  var TRUTHS = { growth: { phi: [0.45, 0.25], c: 0.75, sd: 1, name: 'AR(2): growth rate' }, persist: { phi: [0.95], c: 0.25, sd: 0.5, name: 'AR(1), φ = 0.95: unemployment rate' }, rw: { phi: [1], c: 0, sd: 1, rw: true, name: 'random walk: a price' } };
  var fc = { truth: 'growth', p: '2', seed: 5, reveal: false, mc: null, touched: false }, fcv = $('ec15-fcc'), FG = L.canvas(fcv), fpath, ffit, ffc, dirtyF = true, HF = 24, TF = 100;
  function fcRun() {
    var tr = TRUTHS[fc.truth]; fpath = M.arPath(tr, TF + HF, fc.seed);
    var hist = fpath.slice(0, TF);
    if (fc.p === 'rw') { ffit = null; ffc = M.rwForecast(hist, HF); } else { ffit = M.fitAR(hist, +fc.p); ffc = M.forecast(hist, ffit, HF); }
    dirtyF = true; fcRead();
  }
  function fcRead() {
    var rows = [['True process', TRUTHS[fc.truth].name], ['Fitted model', fc.p === 'rw' ? 'random walk (no fitting)' : 'AR(' + fc.p + '): ' + ffit.phi.map(function (v, j) { return 'φ' + (j + 1) + ' = ' + fmt(v, 2); }).join(', ')],
      ['95% band half-width at h = 1 / 4 / 12', [1, 4, 12].map(function (h) { return fmt(1.96 * ffc.se[h - 1], 2); }).join(' / ')]];
    if (fc.mc && fc.mc.n >= fc.mc.R) rows.push(['Coverage in 500 tests: h = 1 / 4 / 12', [1, 4, 12].map(function (h) { return Math.round(fc.mc.hit[h] / fc.mc.n * 100) + '%'; }).join(' / ')]);
    else if (fc.mc) rows.push(['Testing…', fc.mc.n + ' of ' + fc.mc.R]);
    dl($('ec15-fcread'), rows);
  }
  function fcMC() {
    fc.touched = true; fc.mc = { n: 0, R: 500, hit: { 1: 0, 4: 0, 12: 0 } }; pumpF();
  }
  function pumpF() {
    var m = fc.mc; if (!m || m.n >= m.R) return; var tr = TRUTHS[fc.truth];
    for (var r = 0; r < 25 && m.n < m.R; r++) {
      var y = M.arPath(tr, TF + 12, 70000 + m.n * 17), hist = y.slice(0, TF), fut = y.slice(TF);
      var f = fc.p === 'rw' ? M.rwForecast(hist, 12) : M.forecast(hist, M.fitAR(hist, +fc.p), 12);
      [1, 4, 12].forEach(function (h) { if (Math.abs(fut[h - 1] - f.f[h - 1]) <= 1.96 * f.se[h - 1]) m.hit[h]++; }); m.n++;
    }
    fcRead();
    if (m.n >= m.R) { var c1 = m.hit[1] / m.n; if (c1 >= 0.9 && c1 <= 0.99) win('fore', 'One step ahead, the band caught ' + Math.round(c1 * 100) + '% of outcomes. Twelve ahead: ' + Math.round(m.hit[12] / m.n * 100) + '%.', $('ec15-fcv')); }
    else setTimeout(pumpF, 16);
  }
  function drawF() {
    FG.fit(); var c = FG.c, w = FG.w, h = FG.h; c.clearRect(0, 0, w, h);
    card(c, 6, 6, w - 12, h - 12, 'HISTORY, FORECAST AND 50 / 80 / 95% BANDS');
    var show = fpath.slice(0, TF), all = show.concat(ffc.f.map(function (v, i) { return v + 2.2 * ffc.se[i]; }), ffc.f.map(function (v, i) { return v - 2.2 * ffc.se[i]; }));
    if (fc.reveal) all = all.concat(fpath.slice(TF));
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pd = (hi - lo) * 0.06;
    var start = w < 600 ? 50 : 0, P = Plot(48, 36, w - 72, h - 72, [start, TF + HF - 1], [lo - pd, hi + pd]);
    axes(c, P, { xt: 6, yt: 4, xlab: 'period (forecast starts after ' + TF + ')' });
    var xs = []; for (var t = 0; t < HF; t++) xs.push(TF + t);
    [[1.96, 0.16], [1.2816, 0.2], [0.6745, 0.28]].forEach(function (z) {
      c.beginPath(); xs.forEach(function (x, i) { var y = P.Y(ffc.f[i] + z[0] * ffc.se[i]); if (i) c.lineTo(P.X(x), y); else { c.moveTo(P.X(TF - 1), P.Y(show[TF - 1])); c.lineTo(P.X(x), y); } });
      for (var i = HF - 1; i >= 0; i--) c.lineTo(P.X(xs[i]), P.Y(ffc.f[i] - z[0] * ffc.se[i])); c.lineTo(P.X(TF - 1), P.Y(show[TF - 1])); c.closePath();
      c.fillStyle = rgba(C.green, z[1]); c.fill();
    });
    var hx = []; for (t = start; t < TF; t++) hx.push(t);
    curve(c, P, hx, show.slice(start), C.ink, 1.8);
    curve(c, P, [TF - 1].concat(xs), [show[TF - 1]].concat(ffc.f), C.green, 2.4, [6, 4]);
    if (fc.reveal) { curve(c, P, [TF - 1].concat(xs), [show[TF - 1]].concat(fpath.slice(TF)), C.pink, 2.2); xs.forEach(function (x, i) { var v = fpath[TF + i], out = Math.abs(v - ffc.f[i]) > 1.96 * ffc.se[i]; dot(c, P.X(x), P.Y(v), out ? 4 : 2.6, out ? C.red : C.pink); }); }
    c.save(); c.strokeStyle = 'rgba(255,212,121,.5)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(P.X(TF - 0.5), P.y); c.lineTo(P.X(TF - 0.5), P.y + P.h); c.stroke(); c.restore();
    txt(c, 'now', P.X(TF - 0.5) + 4, P.y + 12, { size: 10.5, col: C.gold });
    txt(c, fc.reveal ? 'pink: what actually happened' : 'press “Reveal the future”', P.x + P.w - 4, P.y + 12, { size: 10.5, col: fc.reveal ? C.pink : C.muted, align: 'right' });
  }
  seg($('ec15-ftruth'), 'data-t', fc.truth, function (v) { fc.touched = true; fc.truth = v; fc.reveal = false; fc.mc = null; fcRun(); });
  seg($('ec15-fp'), 'data-p', fc.p, function (v) { fc.touched = true; fc.p = v; fc.mc = null; fcRun(); });
  $('ec15-fnew').addEventListener('click', function () { fc.seed = 1 + Math.floor(Math.random() * 1e8); fc.reveal = false; fcRun(); });
  $('ec15-freveal').addEventListener('click', function () { fc.reveal = !fc.reveal; this.textContent = fc.reveal ? 'Hide the future' : 'Reveal the future'; dirtyF = true; });
  $('ec15-fmc').addEventListener('click', fcMC);

  /* =========================================================================================
     3. Cointegration
     ========================================================================================= */
  var co = { rho: +store.get('coRho', 0.7), b: 1.5, T: 200, seed: 12, mc: null, touched: false }, ccv = $('ec15-coc'), CG = L.canvas(ccv), cd, ce, dirtyC = true;
  function coRun() {
    cd = M.coint({ T: co.T, rho: co.rho, a: 2, b: co.b }, co.seed); ce = M.engleGranger(cd.x, cd.y); dirtyC = true;
    var rej = ce.t < M.EG_CV['5%'];
    var rows = [['Long-run slope β̂ (truth)', fmt(ce.b, 3) + ' (' + fmt(co.b, 2) + ')'],
      ['Engle–Granger t on the spread', fmt(ce.t, 2) + (rej ? ' < −3.34 → cointegrated' : ' → can’t reject “no cointegration”'), rej ? 'ec15-good' : ''],
      ['Error correction: δ̂ (truth ρ − 1)', fmt(ce.ecm.d, 3) + ' (' + fmt(co.rho - 1, 2) + ')'],
      ['Short-run effect γ̂ of Δx', fmt(ce.ecm.g, 3)]];
    if (co.mc && co.mc.n >= co.mc.R) rows.push(['500 samples: test rejects', Math.round(co.mc.rej / co.mc.n * 100) + '%']);
    dl($('ec15-coread'), rows);
    if (co.touched && co.rho <= 0.8 && rej) win('coint', 'The spread keeps snapping back: t = ' + fmt(ce.t, 2) + '. These two are cointegrated.', $('ec15-cov'));
  }
  function coMC() {
    co.touched = true; co.mc = { n: 0, R: 500, rej: 0 };
    (function pump() { var m = co.mc; for (var r = 0; r < 25 && m.n < m.R; r++) { var d = M.coint({ T: co.T, rho: co.rho, a: 2, b: co.b }, 90000 + m.n * 7); if (M.engleGranger(d.x, d.y).t < M.EG_CV['5%']) m.rej++; m.n++; } coRun(); if (m.n < m.R) setTimeout(pump, 16); })();
  }
  function drawC() {
    CG.fit(); var c = CG.c, w = CG.w, h = CG.h; c.clearRect(0, 0, w, h);
    var wide = w >= 640, A1, A2;
    if (wide) { var hw = Math.round((w - 24) * 0.55); A1 = { x: 8, y: 8, w: hw, h: h - 16 }; A2 = { x: hw + 16, y: 8, w: w - hw - 24, h: h - 16 }; }
    else { var a = Math.round(h * 0.52); A1 = { x: 6, y: 6, w: w - 12, h: a - 6 }; A2 = { x: 6, y: a + 4, w: w - 12, h: h - a - 10 }; }
    card(c, A1.x, A1.y, A1.w, A1.h, 'TWO SERIES THAT WANDER (y vs ' + fmt(ce.a, 1) + ' + ' + fmt(ce.b, 2) + 'x)');
    var ys = cd.y.concat(cd.x), lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), pd = (hi - lo) * 0.08, xs = cd.x.map(function (v, i) { return i; });
    var P = Plot(A1.x + 40, A1.y + 30, A1.w - 52, A1.h - 58, [0, co.T - 1], [lo - pd, hi + pd]);
    axes(c, P, { xt: 4, yt: 4, xlab: 'time' });
    curve(c, P, xs, cd.x, C.blue, 1.8); curve(c, P, xs, cd.y, C.gold, 1.8);
    curve(c, P, xs, cd.x.map(function (v) { return ce.a + ce.b * v; }), rgba(C.ink, 0.35), 1.2, [3, 3]);
    txt(c, 'x', P.x + 6, P.y + 12, { size: 11, weight: 700, col: C.blue }); txt(c, 'y', P.x + 22, P.y + 12, { size: 11, weight: 700, col: C.gold }); txt(c, 'dashed: â + β̂x', P.x + 38, P.y + 12, { size: 11, col: C.muted });
    card(c, A2.x, A2.y, A2.w, A2.h, 'THE SPREAD ûₜ = yₜ − â − β̂xₜ');
    var u = ce.u, ul = Math.min.apply(null, u), uh = Math.max.apply(null, u), m = Math.max(Math.abs(ul), Math.abs(uh)) * 1.15 + 0.1;
    var Q = Plot(A2.x + 40, A2.y + 30, A2.w - 52, A2.h - 58, [0, co.T - 1], [-m, m]);
    axes(c, Q, { xt: 4, yt: 4, xlab: 'time' });
    c.save(); c.strokeStyle = 'rgba(219,231,239,.4)'; c.beginPath(); c.moveTo(Q.x, Q.Y(0)); c.lineTo(Q.x + Q.w, Q.Y(0)); c.stroke(); c.restore();
    curve(c, Q, xs, u, C.green, 1.6);
    var rej = ce.t < M.EG_CV['5%'];
    txt(c, 'EG t = ' + fmt(ce.t, 2) + (rej ? ' · mean-reverting' : ' · may wander off'), Q.x + Q.w - 4, Q.y + 12, { size: 11, mono: true, weight: 700, col: rej ? C.green : C.red, align: 'right', max: Q.w - 10 });
  }
  slider('ec15-rho', function () { return co.rho; }, function (v) { co.touched = true; co.rho = v; store.set('coRho', v); co.mc = null; coRun(); }, function (v) { return v >= 0.999 ? '1 (not cointegrated)' : fmt(v, 2); });
  slider('ec15-cob', function () { return co.b; }, function (v) { co.touched = true; co.b = v; co.mc = null; coRun(); }, function (v) { return fmt(v, 2); });
  slider('ec15-coT', function () { return co.T; }, function (v) { co.touched = true; co.T = v; co.mc = null; coRun(); }, function (v) { return v + ' periods'; });
  $('ec15-conew').addEventListener('click', function () { co.touched = true; co.seed = 1 + Math.floor(Math.random() * 1e8); coRun(); });
  $('ec15-comc').addEventListener('click', coMC);

  /* ---------- start ---------- */
  computeStats(); setMode(st.mode); fcRun(); coRun();
  window.addEventListener('resize', function () { dirty = true; dirtyF = true; dirtyC = true; });
  L.loop(function (dt) {
    if (st.mode === 'ar' && !st.paused) {
      acc += dt * (reduced ? 0 : 24);
      var k = Math.floor(acc); if (k > 0) { acc -= k; for (var i = 0; i < k; i++) buf.push(arma.next()); if (buf.length > 600) buf.splice(0, buf.length - 600); statT += k; dirty = true; }
      if (statT >= 6) { statT = 0; computeStats(); }
    }
    if (dirty) { draw(); dirty = false; }
  }, view);
  L.loop(function () { if (dirtyF) { drawF(); dirtyF = false; } }, $('ec15-fcv'));
  L.loop(function () { if (dirtyC) { drawC(); dirtyC = false; } }, $('ec15-cov'));
})();
