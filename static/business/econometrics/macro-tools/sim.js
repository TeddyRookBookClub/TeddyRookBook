/* VARs and GMM (/business/econometrics/macro-tools/): drawing and controls for the live two-variable economy with impulse
   responses, the method-of-moments map, and IV as GMM with Hansen's J.
   The models are in model.js (window.Ec16Model); statistics from stats.js (window.EconStats). */
(function () {
  'use strict';
  var PFX = 'ec16';
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

  var M = window.Ec16Model, root = $('ec16-lab');
  if (!M || !root) return;
  var store = L.store('econ-macro');

  var MIS = [
    { id: 'shock', title: 'Shock it', goal: 'Press “Shock inflation” and watch the interest rate respond over the next few quarters.', sec: 'ec16-view' },
    { id: 'order0', title: 'Order doesn’t matter…', goal: 'Set the error correlation to 0 and switch the ordering: the impact responses stay the same.', sec: 'ec16-view' },
    { id: 'order', title: '…until it does', goal: 'With an error correlation of 0.5 or more, switch the ordering and see the impact responses change.', sec: 'ec16-view' },
    { id: 'granger', title: 'Granger isn’t cause', goal: 'In “Rate sees the future”, find that the rate Granger-causes inflation (p < 0.05), though in this economy the rate has no effect on inflation at all.', sec: 'ec16-view' },
    { id: 'match', title: 'Match the moments', goal: 'In the method-of-moments map, drag the point until both moment gaps are within 0.02 of zero.', sec: 'ec16-mm' },
    { id: 'skew', title: 'One moment too many', goal: 'Use three moments on the skewed data and watch Hansen’s J reject the normal model (p < 0.05).', sec: 'ec16-mm' },
    { id: 'badiv', title: 'Catch a bad instrument', goal: 'In “IV as GMM”, make the third instrument invalid until the J test rejects (p < 0.05).', sec: 'ec16-iv' },
    { id: 'eff', title: 'Efficient weighting', goal: 'Turn on heteroskedasticity and run 500 samples: efficient GMM should be at least 10% more precise than 2SLS.', sec: 'ec16-iv' }
  ];
  var view = $('ec16-view'), mis = L.missions($('ec16-missions'), 'econ-macro', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    var el = $(m.sec); if (el && m.sec !== 'ec16-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }

  /* =========================================================================================
     1. A live two-variable economy and its VAR
     ========================================================================================= */
  var st = { world: store.get('world', 'taylor'), order: store.get('order', 'pi'), rho: +store.get('rho', 0.5), truth: true, paused: false, touched: false, seed: 3 };
  if (!M.WORLDS[st.world]) st.world = 'taylor';
  var cv = $('ec16-cv'), G = L.canvas(cv), ctx = G.c, hud = $('ec16-hud');
  var eco, hist = [], marks = [], fit = null, bands = null, boot = null, acc = 0, since = 0, dirty = true, flash = { col: -1, t: 0 }, lastImpact = {};
  var H = 16, NAMES = ['Inflation', 'Interest rate'], VC = [C.gold, C.blue];
  function newEconomy() {
    eco = M.Economy(M.WORLDS[st.world], st.rho, st.seed); hist = []; marks = [];
    for (var t = 0; t < 100; t++) eco.step();
    for (t = 0; t < 200; t++) hist.push(eco.step());
    refitVAR();
  }
  function refitVAR() {
    fit = M.fitVAR(hist.slice(-200)); bands = null; boot = { n: 0, draws: [] }; dirty = true; readVAR(); checksVAR();
  }
  function P() { return M.cholOrder(fit.Sig, st.order); }
  function readVAR() {
    var A = fit.A, th = M.irf(A, P(), 8), fe = M.fevd(th, 8);
    dl($('ec16-read'), [
      ['Â (row: equation)', '[' + fmt(A[0][0], 2) + ', ' + fmt(A[0][1], 2) + '; ' + fmt(A[1][0], 2) + ', ' + fmt(A[1][1], 2) + ']'],
      ['Correlation of the residuals', fmt(fit.corr, 2)],
      ['Rate Granger-causes inflation?', 'F = ' + fmt(fit.granger.iToPi.F, 1) + ', ' + pEq(fit.granger.iToPi.p), fit.granger.iToPi.p < 0.05 ? 'ec16-good' : ''],
      ['Inflation Granger-causes rate?', 'F = ' + fmt(fit.granger.piToI.F, 1) + ', ' + pEq(fit.granger.piToI.p), fit.granger.piToI.p < 0.05 ? 'ec16-good' : ''],
      ['Rate’s 2-year forecast error due to inflation shocks', Math.round(fe[1][0] * 100) + '%']
    ]);
  }
  function checksVAR() {
    if (!st.touched) return;
    if (st.world === 'news' && fit.granger.iToPi.p < 0.05) win('granger', 'Rate → inflation: ' + pEq(fit.granger.iToPi.p) + '. The rate only predicts inflation; it doesn’t cause it here.');
  }
  function orderSwitched(prev) {
    var a = M.cholOrder(fit.Sig, prev), b = M.cholOrder(fit.Sig, st.order), d = Math.max(Math.abs(a[0][1] - b[0][1]), Math.abs(a[1][0] - b[1][0]));
    var scale = Math.sqrt(fit.Sig[0][0] + fit.Sig[1][1]);
    if (Math.abs(st.rho) <= 0.05 && d < 0.12 * scale) win('order0', 'Uncorrelated shocks: both orderings give the same impact responses.');
    if (Math.abs(st.rho) >= 0.5 && d > 0.3 * scale) win('order', 'Same data, same VAR, different story: the impact responses moved by ' + fmt(d, 2) + '.');
  }
  // bootstrap bands, a few replications per frame
  function stepBoot() {
    if (!boot || boot.n >= 200) return false;
    var per = reduced ? 200 : 20;
    boot.draws = boot.draws.concat(M.bootDraws(hist.slice(-200), fit, st.order, H, per, 1000 + boot.n * 3 + hist.length)); boot.n += per;
    bands = M.bandsOf(boot.draws, H); return true;
  }
  function layout(w, h) {
    if (w >= 700) { var lw = Math.round(w * 0.44); return { wide: true, live: { x: 0, y: 0, w: lw, h: h }, irf: { x: lw + 4, y: 50, w: w - lw - 12, h: h - 58 } }; }
    var a = Math.round(h * 0.4); return { wide: false, live: { x: 0, y: 0, w: w, h: a }, irf: { x: 6, y: a + 2, w: w - 12, h: h - a - 8 } };
  }
  function draw() {
    G.fit(); var c = ctx, w = G.w, h = G.h; c.clearRect(0, 0, w, h);
    var Lo = layout(w, h), A = Lo.live, N = 80, seg0 = hist.slice(-N), all = [];
    seg0.forEach(function (p) { all.push(p[0], p[1]); });
    var m = Math.max(1, Math.max.apply(null, all.map(Math.abs)) * 1.15);
    var Pl = Plot(A.x + 40, A.y + 58, A.w - 52, A.h - 58 - 34, [0, N - 1], [-m, m]);
    axes(c, Pl, { xt: 4, yt: 4, xlab: Lo.wide ? 'quarters (newest on the right)' : null, xf: function (v) { return String(Math.round(v - N + 1)); } });
    c.save(); c.strokeStyle = 'rgba(219,231,239,.3)'; c.beginPath(); c.moveTo(Pl.x, Pl.Y(0)); c.lineTo(Pl.x + Pl.w, Pl.Y(0)); c.stroke(); c.restore();
    var off = hist.length - seg0.length;
    marks.forEach(function (mk) { var x = mk.t - off; if (x < 0) return; c.fillStyle = rgba(VC[mk.k], 0.16); c.fillRect(Pl.X(x) - 3, Pl.y, 6, Pl.h); var rt = Pl.X(x) > Pl.x + Pl.w - 90; txt(c, mk.k ? 'rate shock' : 'inflation shock', Pl.X(x) + (rt ? -6 : 6), Pl.y + 10 + mk.k * 12, { size: 10, col: VC[mk.k], weight: 700, align: rt ? 'right' : 'left' }); });
    var xs = seg0.map(function (p, i) { return i; });
    curve(c, Pl, xs, seg0.map(function (p) { return p[0]; }), C.gold, 2); curve(c, Pl, xs, seg0.map(function (p) { return p[1]; }), C.blue, 2);
    txt(c, 'inflation gap', Pl.x + 4, Pl.y - 8, { size: 11, weight: 700, col: C.gold }); txt(c, 'interest-rate gap', Pl.x + 90, Pl.y - 8, { size: 11, weight: 700, col: C.blue });
    drawIRF(c, Lo.irf, Lo.wide);
    hud.innerHTML = '<b>' + M.WORLDS[st.world].name + '</b> · ordering: ' + (st.order === 'pi' ? 'inflation first' : 'rate first') + (st.paused ? ' · paused' : '');
  }
  function drawIRF(c, A, wide) {
    var th = M.irf(fit.A, P(), H), tr = M.trueIRF(M.WORLDS[st.world], st.rho, H), gw = (A.w - 8) / 2, gh = (A.h - 8) / 2;
    for (var j = 0; j < 2; j++) for (var k = 0; k < 2; k++) {
      var x = A.x + k * (gw + 8), y = A.y + j * (gh + 8), hl = flash.col === k && flash.t > 0;
      card(c, x, y, gw, gh, (j ? 'RATE' : 'INFLATION') + ' ← ' + (k ? 'RATE' : 'INFLATION') + ' SHOCK', hl ? C.green : null);
      if (hl) { rr(c, x, y, gw, gh, 10); c.strokeStyle = rgba(C.green, Math.min(1, flash.t)); c.lineWidth = 2; c.stroke(); }
      var vals = [0]; th.forEach(function (q) { vals.push(q[j][k]); }); if (st.truth && st.world !== 'news') tr.forEach(function (q) { vals.push(q[j][k]); });
      if (bands) bands.lo.forEach(function (q, h) { vals.push(q[j][k], bands.hi[h][j][k]); });
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pd = (hi - lo) * 0.12 + 0.02;
      var Q = Plot(x + 36, y + 28, gw - 46, gh - 52, [0, H], [lo - pd, hi + pd]);
      axes(c, Q, { xticks: [0, 4, 8, 12, 16], yt: 3, xlab: wide ? 'quarters after the shock' : null });
      c.save(); c.strokeStyle = 'rgba(219,231,239,.35)'; c.beginPath(); c.moveTo(Q.x, Q.Y(0)); c.lineTo(Q.x + Q.w, Q.Y(0)); c.stroke(); c.restore();
      var hs = []; for (var h = 0; h <= H; h++) hs.push(h);
      if (bands) { c.beginPath(); hs.forEach(function (h2, i) { var py = Q.Y(bands.hi[h2][j][k]); if (i) c.lineTo(Q.X(h2), py); else c.moveTo(Q.X(h2), py); }); for (var i = H; i >= 0; i--) c.lineTo(Q.X(i), Q.Y(bands.lo[i][j][k])); c.closePath(); c.fillStyle = 'rgba(99,230,190,.16)'; c.fill(); }
      if (st.truth && st.world !== 'news') curve(c, Q, hs, tr.map(function (q) { return q[j][k]; }), C.gold, 1.8, [5, 4]);
      curve(c, Q, hs, th.map(function (q) { return q[j][k]; }), C.green, 2.6);
      dot(c, Q.X(0), Q.Y(th[0][j][k]), 3.5, C.green);
    }
    var leg = 'green: estimated · band: 90% bootstrap' + (st.truth && st.world !== 'news' ? ' · gold dashed: true' : '');
    txt(c, leg, A.x, A.y - 8, { size: 10.5, col: C.muted, max: A.w - (wide ? 100 : 0) });
  }
  function shock(k) {
    st.touched = true; if (st.paused) { st.paused = false; syncPause(); }
    pendingShock = k; flash = { col: k, t: 2.5 };
    if (k === 0) setTimeout(function () { win('shock', 'Inflation jumped, and the rate climbed after it. That’s the impulse response, live.'); }, 2600);
  }
  var pendingShock = -1;
  function save() { store.set('world', st.world); store.set('order', st.order); store.set('rho', st.rho); }
  seg($('ec16-world'), 'data-w', st.world, function (v) { st.touched = true; st.world = v; save(); newEconomy(); });
  seg($('ec16-order'), 'data-o', st.order, function (v) { st.touched = true; var prev = st.order; st.order = v; save(); bands = null; boot = { n: 0, draws: [] }; readVAR(); dirty = true; if (prev !== v) orderSwitched(prev); });
  slider('ec16-rho', function () { return st.rho; }, function (v) { st.touched = true; st.rho = v; save(); newEconomy(); }, function (v) { return fmt(v, 2); });
  var cTr = $('ec16-truth'); cTr.checked = true; cTr.addEventListener('change', function () { st.truth = cTr.checked; dirty = true; });
  $('ec16-shpi').addEventListener('click', function () { shock(0); });
  $('ec16-shi').addEventListener('click', function () { shock(1); });
  $('ec16-newh').addEventListener('click', function () { st.touched = true; st.seed = 1 + Math.floor(Math.random() * 1e8); newEconomy(); });
  function syncPause() { var b = $('ec16-pause'); b.textContent = st.paused ? '▶' : '❚❚'; b.setAttribute('aria-label', st.paused ? 'Play' : 'Pause'); }
  $('ec16-pause').addEventListener('click', function () { st.paused = !st.paused; syncPause(); dirty = true; });
  $('ec16-reset').addEventListener('click', function () { st.seed = 3; newEconomy(); });
  cv.addEventListener('keydown', function (e) {
    var k = e.key; if (k === 'i' || k === 'I') shock(0); else if (k === 'r' || k === 'R') shock(1); else if (k === ' ') $('ec16-pause').click(); else return; e.preventDefault();
  });

  /* =========================================================================================
     2. Method of moments
     ========================================================================================= */
  var mm = { kind: 'normal', k: 2, w: 'eff', th: null, seed: 4, touched: false }, mcv = $('ec16-mc'), MG = L.canvas(mcv), mx, mres, mdirty = true, MP = null, mgrid = null, mkey = '';
  function mmData() { mx = M.momData(mm.kind, 200, mm.seed); mm.th = [S.mean(mx) - 0.6, S.variance(mx, 0) + 0.8]; mmFit(); }
  function mmFit() { mres = M.gmmA(mx, mm.k, mm.w === 'identity' ? 'identity' : 'eff'); mkey = ''; mdirty = true; mmRead(); }
  function mmW() { return mm.w === 'identity' ? S.eye(mm.k) : mres.W; }
  function mmRead() {
    var g = M.gbar(mx, mm.th[0], mm.th[1], mm.k), Q = M.quad(g, mmW()), rows = [
      ['Your (μ, σ²)', '(' + fmt(mm.th[0], 3) + ', ' + fmt(mm.th[1], 3) + ')'],
      ['Moment gaps ḡ', g.map(function (v) { return fmt(v, 3); }).join(', ')],
      ['Objective ḡ′Wḡ', fmt(Q, 4)],
      ['GMM estimate (μ̂, σ̂²)', '(' + fmt(mres.th[0], 3) + ', ' + fmt(mres.th[1], 3) + ')'],
      ['Sample mean, variance', fmt(S.mean(mx), 3) + ', ' + fmt(S.variance(mx, 0), 3)]
    ];
    if (mm.k === 3 && mm.w !== 'identity') rows.push(['Hansen’s J (1 df)', fmt(mres.J, 2) + ', ' + pEq(mres.p), mres.p < 0.05 ? 'ec16-bad' : 'ec16-good']);
    dl($('ec16-mmread'), rows);
    if (!mm.touched) return;
    if (mm.k === 2 && Math.abs(g[0]) < 0.02 && Math.abs(g[1]) < 0.02) win('match', 'Both moments matched: μ̂ = ' + fmt(mm.th[0], 2) + ' is the sample mean, σ̂² = ' + fmt(mm.th[1], 2) + ' the sample variance.', $('ec16-mmv'));
    if (mm.k === 3 && mm.kind === 'skew' && mm.w !== 'identity' && mres.p < 0.05) win('skew', 'J = ' + fmt(mres.J, 1) + ': a normal model can’t match the mean, the variance and zero skewness at once.', $('ec16-mmv'));
  }
  function mmDraw() {
    MG.fit(); var c = MG.c, w = MG.w, h = MG.h; c.clearRect(0, 0, w, h);
    var wide = w >= 640, A1, A2;
    if (wide) { var lw = Math.round(w * 0.42); A1 = { x: 8, y: 8, w: lw, h: h - 16 }; A2 = { x: lw + 16, y: 8, w: w - lw - 24, h: h - 16 }; }
    else { var a = Math.round(h * 0.42); A1 = { x: 6, y: 6, w: w - 12, h: a - 6 }; A2 = { x: 6, y: a + 4, w: w - 12, h: h - a - 10 }; }
    card(c, A1.x, A1.y, A1.w, A1.h, 'THE DATA AND THE NORMAL CURVE AT YOUR (μ, σ²)');
    var lo = 0, hi = 8, nb = 32, cnt = counts(mx, lo, hi, nb), dens = cnt.map(function (k) { return k / mx.length / ((hi - lo) / nb); });
    var P1 = Plot(A1.x + 34, A1.y + 30, A1.w - 46, A1.h - 126, [lo, hi], [0, Math.max(0.5, Math.max.apply(null, dens) * 1.2)]);
    axes(c, P1, { xt: 4, yt: 3 });
    dens.forEach(function (d, k) { var y = P1.Y(d); c.fillStyle = rgba(C.violet, 0.55); c.fillRect(P1.X(lo + k * (hi - lo) / nb) + 0.5, y, P1.w / nb - 1, P1.y + P1.h - y); });
    var s = Math.sqrt(Math.max(1e-4, mm.th[1]));
    fn(c, P1, function (v) { return S.normPdf((v - mm.th[0]) / s) / s; }, C.pink, 2.4);
    // moment gap bars
    var g = M.gbar(mx, mm.th[0], mm.th[1], mm.k), labs = ['mean − μ', 'var − σ²', '3rd moment'], by = A1.y + A1.h - 62, bw = (A1.w - 40) / 3;
    txt(c, 'MOMENT GAPS (want all 0)', A1.x + 10, by - 4, { size: 10.5, weight: 700, col: C.muted });
    for (var j = 0; j < 3; j++) {
      var bx = A1.x + 14 + j * bw, cx2 = bx + bw / 2 - 6, v = j < mm.k ? g[j] : 0, hgt = clamp(v / 1.5, -1, 1) * 18;
      c.fillStyle = 'rgba(120,170,200,.12)'; c.fillRect(bx, by + 4, bw - 12, 40);
      if (j < mm.k) { c.fillStyle = Math.abs(v) < 0.02 ? C.green : C.gold; c.fillRect(bx + 4, by + 24 - Math.max(0, hgt), bw - 20, Math.abs(hgt) + 1); }
      txt(c, j < mm.k ? labs[j] + ' ' + fmt(v, 2) : '(not used)', cx2, by + 56, { size: 10, col: j < mm.k ? C.ink : C.muted, align: 'center', max: bw - 6 });
    }
    card(c, A2.x, A2.y, A2.w, A2.h, 'OBJECTIVE ḡ′Wḡ OVER (μ, σ²) · ' + (mm.w === 'identity' ? 'W = I' : 'EFFICIENT W') + ' · DRAG THE POINT');
    var mu0 = S.mean(mx), v0 = S.variance(mx, 0), B0 = [mu0 - 1.6, mu0 + 1.6], B1 = [Math.max(0.05, v0 * 0.15), v0 * 2.2];
    var Q = MP = Plot(A2.x + 46, A2.y + 30, A2.w - 60, A2.h - 64, B0, B1);
    var key = [B0.join(), B1.join(), Q.w, Q.h, mm.k, mm.w, mm.kind, mm.seed].join('|');
    if (key !== mkey) {
      mkey = key; var nx = clamp(Math.round(Q.w / 3), 2, 150), ny = clamp(Math.round(Q.h / 3), 2, 110), W = mmW(), vals = new Float32Array(nx * ny), qmin = Infinity;
      for (var yy = 0; yy < ny; yy++) for (var xx = 0; xx < nx; xx++) { var mu = B0[0] + (xx + 0.5) / nx * (B0[1] - B0[0]), s2 = B1[1] - (yy + 0.5) / ny * (B1[1] - B1[0]), q = M.quad(M.gbar(mx, mu, s2, mm.k), W); vals[yy * nx + xx] = q; qmin = Math.min(qmin, q); }
      var offc = document.createElement('canvas'); offc.width = nx; offc.height = ny; var oc = offc.getContext('2d'), img = oc.createImageData(nx, ny), stops = [[255, 212, 121], [99, 230, 190], [56, 140, 170], [30, 60, 110], [12, 22, 40]];
      for (var kk = 0; kk < nx * ny; kk++) { var tq = clamp(Math.log10(1 + (vals[kk] - qmin) * 200) / 3.2, 0, 1), band = Math.floor(Math.log10(1 + (vals[kk] - qmin) * 200) * 5) % 2 ? 0.92 : 1, u = tq * 4, ai = Math.min(3, Math.floor(u)), fr = u - ai; for (var ch = 0; ch < 3; ch++) img.data[4 * kk + ch] = (stops[ai][ch] + (stops[ai + 1][ch] - stops[ai][ch]) * fr) * band; img.data[4 * kk + 3] = 255; }
      oc.putImageData(img, 0, 0); mgrid = offc;
    }
    c.save(); c.imageSmoothingEnabled = true; c.drawImage(mgrid, Q.x, Q.y, Q.w, Q.h); c.restore();
    axes(c, Q, { xt: 4, yt: 4, xlab: 'μ (mean)', ylab: 'σ² (variance)', ylabOff: 38, noXgrid: true });
    clip(c, Q, 0);
    var ex = Q.X(mres.th[0]), ey = Q.Y(mres.th[1]);
    c.save(); c.strokeStyle = '#06111a'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex - 6, ey); c.lineTo(ex + 6, ey); c.moveTo(ex, ey - 6); c.lineTo(ex, ey + 6); c.stroke(); c.restore();
    dot(c, Q.X(mm.th[0]), Q.Y(mm.th[1]), 7, C.pink, '#fff', 2);
    c.restore();
    txt(c, '+ marks the GMM estimate', A2.x + A2.w - 10, A2.y + A2.h - 8, { size: 10.5, col: C.muted, align: 'right' });
  }
  var mdrag = false;
  pointer(mcv, {
    down: function (x, y) { if (!MP || !MP.inside(x, y)) return false; mdrag = true; mm.touched = true; mm.th = [MP.iX(x), Math.max(0.01, MP.iY(y))]; mdirty = true; mmRead(); return true; },
    drag: function (x, y) { if (!mdrag || !MP) return; mm.th = [clamp(MP.iX(x), MP.xr[0], MP.xr[1]), clamp(MP.iY(y), Math.max(0.01, MP.yr[0]), MP.yr[1])]; mdirty = true; mmRead(); },
    up: function () { mdrag = false; }
  });
  mcv.addEventListener('keydown', function (e) {
    if (!MP) return; var dx = (MP.xr[1] - MP.xr[0]) / 100, dy = (MP.yr[1] - MP.yr[0]) / 100, k = e.key, used = true; mm.touched = true;
    if (k === 'ArrowLeft') mm.th[0] -= dx; else if (k === 'ArrowRight') mm.th[0] += dx; else if (k === 'ArrowUp') mm.th[1] += dy; else if (k === 'ArrowDown') mm.th[1] = Math.max(0.01, mm.th[1] - dy); else used = false;
    if (used) { e.preventDefault(); mdirty = true; mmRead(); }
  });
  seg($('ec16-mmkind'), 'data-k', mm.kind, function (v) { mm.touched = true; mm.kind = v; mmData(); });
  seg($('ec16-mmk'), 'data-k', String(mm.k), function (v) { mm.touched = true; mm.k = +v; mmFit(); });
  seg($('ec16-mmw'), 'data-w', mm.w, function (v) { mm.touched = true; mm.w = v; mmFit(); });
  $('ec16-mmjump').addEventListener('click', function () { mm.touched = true; mm.th = mres.th.slice(); mdirty = true; mmRead(); });
  $('ec16-mmnew').addEventListener('click', function () { mm.touched = true; mm.seed = 1 + Math.floor(Math.random() * 1e8); mmData(); });

  /* =========================================================================================
     3. IV as GMM: three instruments, one parameter
     ========================================================================================= */
  var iv = { gamma: 0, n: 400, het: false, w: '2sls', seed: 2, mc: null, touched: false }, icv = $('ec16-ic'), IG = L.canvas(icv), idat, ires, idirty = true;
  function ivP() { return { n: iv.n, beta: 1, pi: [0.5, 0.4, 0.3], gamma: iv.gamma, het: iv.het }; }
  function ivFit() { idat = M.ivData(ivP(), iv.seed); ires = M.ivGMM(idat, iv.w); idirty = true; ivRead(); }
  function ivRead() {
    var r2 = M.ivGMM(idat, '2sls'), re = M.ivGMM(idat, 'eff'), rows = [
      ['2SLS β̂ (robust SE)', fmt(r2.b, 3) + ' (' + fmt(r2.se, 3) + ')'],
      ['Efficient GMM β̂ (SE)', fmt(re.b, 3) + ' (' + fmt(re.se, 3) + ')'],
      ['Each instrument alone', ires.single.map(function (v) { return fmt(v, 2); }).join(' / ')],
      ['Hansen’s J (2 df)', fmt(ires.J, 2) + ', ' + pEq(ires.Jp), ires.Jp < 0.05 ? 'ec16-bad' : 'ec16-good'],
      ['True β', '1.00']
    ];
    if (iv.mc && iv.mc.n >= iv.mc.R) { rows.push(['500 samples: SD of 2SLS / efficient', fmt(S.sd(iv.mc.b2), 3) + ' / ' + fmt(S.sd(iv.mc.be), 3)]); rows.push(['500 samples: J rejects', Math.round(iv.mc.rej / iv.mc.n * 100) + '%']); }
    dl($('ec16-ivread'), rows);
    if (iv.touched && iv.gamma > 0 && ires.Jp < 0.05) win('badiv', 'J = ' + fmt(ires.J, 1) + ': the three instruments disagree about β. At least one is invalid.', $('ec16-ivv'));
  }
  function ivMC() {
    iv.touched = true; iv.mc = { n: 0, R: 500, b2: [], be: [], rej: 0 };
    (function pump() {
      var m = iv.mc; for (var r = 0; r < 20 && m.n < m.R; r++) { var d = M.ivData(ivP(), 50000 + m.n * 11), a = M.ivGMM(d, '2sls'), b = M.ivGMM(d, 'eff'); m.b2.push(a.b); m.be.push(b.b); if (a.Jp < 0.05) m.rej++; m.n++; }
      idirty = true;
      if (m.n < m.R) setTimeout(pump, 16);
      else { ivRead(); var s2 = S.sd(m.b2), se = S.sd(m.be); if (iv.het && se < 0.9 * s2) win('eff', 'Efficient GMM: SD ' + fmt(se, 3) + ' vs 2SLS ' + fmt(s2, 3) + '. Weighting the noisy moment less pays off.', $('ec16-ivv')); }
    })();
  }
  function ivDraw() {
    IG.fit(); var c = IG.c, w = IG.w, h = IG.h; c.clearRect(0, 0, w, h);
    var wide = w >= 700, A1, A2, A3;
    if (wide) { var lw = Math.round(w * 0.62), h1 = Math.round((h - 24) * 0.5); A1 = { x: 8, y: 8, w: lw, h: h1 }; A2 = { x: 8, y: h1 + 16, w: lw, h: h - h1 - 24 }; A3 = { x: lw + 16, y: 8, w: w - lw - 24, h: h - 16 }; }
    else { var a = Math.round(h * 0.34), b = Math.round(h * 0.33); A1 = { x: 6, y: 6, w: w - 12, h: a - 6 }; A2 = { x: 6, y: a + 4, w: w - 12, h: b - 6 }; A3 = { x: 6, y: a + b + 2, w: w - 12, h: h - a - b - 8 }; }
    var bl = 0, bh = 2, ICOL = [C.gold, C.blue, C.pink];
    card(c, A1.x, A1.y, A1.w, A1.h, 'THREE MOMENT CONDITIONS: E[zⱼ(y − βx)] = 0, IN STANDARD ERRORS');
    var ts = [0, 1, 2].map(function (j) { return function (b) { return ires.g(b)[j] / (ires.sdG[j] / Math.sqrt(ires.n)); }; });
    var ext = 0; ts.forEach(function (f2) { ext = Math.max(ext, Math.abs(f2(bl)), Math.abs(f2(bh))); });
    var P1 = Plot(A1.x + 40, A1.y + 30, A1.w - 52, A1.h - 56, [bl, bh], [-Math.min(ext, 30), Math.min(ext, 30)]);
    axes(c, P1, { xt: 4, yt: 4, xlab: 'β' });
    c.save(); c.strokeStyle = 'rgba(219,231,239,.45)'; c.beginPath(); c.moveTo(P1.x, P1.Y(0)); c.lineTo(P1.x + P1.w, P1.Y(0)); c.stroke(); c.restore();
    clip(c, P1, 1);
    ts.forEach(function (f2, j) { fn(c, P1, f2, ICOL[j], 2.4, null, bl, bh, 2); var s = ires.single[j]; if (s > bl && s < bh) dot(c, P1.X(s), P1.Y(0), 5, ICOL[j], '#06111a', 1.5); });
    c.restore();
    ['z₁', 'z₂', 'z₃' + (iv.gamma > 0 ? ' (invalid)' : '')].forEach(function (l, j) { txt(c, l, P1.x + 6 + j * 54, P1.y + 12, { size: 11, weight: 700, col: ICOL[j] }); });
    card(c, A2.x, A2.y, A2.w, A2.h, 'EFFICIENT GMM OBJECTIVE J(β) = n·ḡ(β)′Ŝ⁻¹ḡ(β)');
    var effC = function (b) { return idat.y.length * M.quad(ires.g(b), ires.We); }, effMin = effC(ires.beff), bI = M.ivGMM(idat, 'identity').b, b2 = M.ivGMM(idat, '2sls').b;
    var P2 = Plot(A2.x + 40, A2.y + 30, A2.w - 52, A2.h - 56, [bl, bh], [0, Math.max(12, effMin * 1.6)]);
    axes(c, P2, { xt: 4, yt: 3, xlab: 'β' });
    c.save(); c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,135,135,.7)'; c.beginPath(); c.moveTo(P2.x, P2.Y(5.99)); c.lineTo(P2.x + P2.w, P2.Y(5.99)); c.stroke(); c.restore();
    txt(c, 'χ²₂ 5% critical value: 5.99', P2.x + P2.w - 4, P2.Y(5.99) - 4, { size: 10, col: C.red, align: 'right' });
    clip(c, P2, 1);
    fn(c, P2, effC, C.green, 3, null, bl, bh, 160);
    [[b2, C.violet], [bI, C.orange]].forEach(function (q) { c.save(); c.strokeStyle = q[1]; c.lineWidth = 2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(P2.X(q[0]), P2.y); c.lineTo(P2.X(q[0]), P2.y + P2.h); c.stroke(); c.restore(); });
    c.restore();
    dot(c, P2.X(ires.beff), P2.Y(effMin), 5, C.green, '#06111a', 1.5);
    txt(c, 'minimum = J = ' + fmt(effMin, 2) + ' at β̂ = ' + fmt(ires.beff, 3), P2.x + 6, P2.y + 12, { size: 10.5, weight: 700, col: C.green });
    txt(c, '┊ 2SLS ' + fmt(b2, 3), P2.x + 6, P2.y + 26, { size: 10.5, weight: 700, col: C.violet }); txt(c, '┊ identity W ' + fmt(bI, 3), P2.x + 96, P2.y + 26, { size: 10.5, weight: 700, col: C.orange });
    // Monte Carlo histograms
    card(c, A3.x, A3.y, A3.w, A3.h, 'β̂ OVER ' + (iv.mc ? iv.mc.n : 0) + ' SAMPLES');
    if (!iv.mc) { txt(c, 'Press “Run 500 samples”.', A3.x + A3.w / 2, A3.y + A3.h / 2, { size: 12, col: C.muted, align: 'center' }); return; }
    var P3 = Plot(A3.x + 16, A3.y + 50, A3.w - 32, A3.h - 80, [0, 2], [0, 1]), nb = 30;
    var c2 = counts(iv.mc.b2, 0, 2, nb), ce2 = counts(iv.mc.be, 0, 2, nb), mx2 = Math.max.apply(null, c2.concat(ce2)) || 1; P3.yr = [0, mx2 * 1.1];
    axes(c, P3, { xt: 4, yticks: [] });
    var bw = P3.w / nb;
    c2.forEach(function (k, i) { if (!k) return; var y = P3.Y(k); c.fillStyle = rgba(C.violet, 0.45); c.fillRect(P3.x + i * bw + 0.5, y, bw - 1, P3.y + P3.h - y); });
    ce2.forEach(function (k, i) { if (!k) return; var y = P3.Y(k); c.strokeStyle = C.green; c.lineWidth = 1.6; c.strokeRect(P3.x + i * bw + 1, y, bw - 2, P3.y + P3.h - y); });
    c.save(); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(P3.X(1), P3.y - 6); c.lineTo(P3.X(1), P3.y + P3.h); c.stroke(); c.restore();
    txt(c, 'filled: 2SLS · outline: efficient', A3.x + 10, A3.y + 34, { size: 10.5, col: C.muted, max: A3.w - 20 });
    txt(c, 'SD ' + fmt(S.sd(iv.mc.b2.length > 1 ? iv.mc.b2 : [0, 0]), 3) + ' vs ' + fmt(S.sd(iv.mc.be.length > 1 ? iv.mc.be : [0, 0]), 3), A3.x + A3.w - 10, A3.y + A3.h - 8, { size: 11, mono: true, col: C.ink, align: 'right' });
  }
  slider('ec16-ivg', function () { return iv.gamma; }, function (v) { iv.touched = true; iv.gamma = v; iv.mc = null; ivFit(); }, function (v) { return v === 0 ? 'valid' : fmt(v, 2); });
  slider('ec16-ivn', function () { return iv.n; }, function (v) { iv.touched = true; iv.n = v; iv.mc = null; ivFit(); }, function (v) { return String(v); });
  var cH = $('ec16-ivhet'); cH.addEventListener('change', function () { iv.touched = true; iv.het = cH.checked; iv.mc = null; ivFit(); });
  $('ec16-ivnew').addEventListener('click', function () { iv.touched = true; iv.seed = 1 + Math.floor(Math.random() * 1e8); ivFit(); });
  $('ec16-ivmc').addEventListener('click', ivMC);

  /* ---------- start ---------- */
  newEconomy(); mmData(); ivFit();
  window.addEventListener('resize', function () { dirty = true; mdirty = true; idirty = true; mkey = ''; });
  L.loop(function (dt) {
    if (!st.paused) {
      acc += dt * (reduced ? 2 : 4);
      while (acc >= 1) {
        acc -= 1; var sh = null;
        if (pendingShock >= 0) { sh = pendingShock === 0 ? [2, 0] : [0, 2]; marks.push({ t: hist.length, k: pendingShock }); pendingShock = -1; }
        hist.push(eco.step(sh)); if (hist.length > 400) { hist.shift(); marks.forEach(function (m) { m.t--; }); }
        marks = marks.filter(function (m) { return m.t > hist.length - 90; });
        since++; dirty = true;
        if (since >= 20) { since = 0; refitVAR(); }
      }
    }
    if (flash.t > 0) { flash.t -= dt; dirty = true; }
    if (stepBoot()) dirty = true;
    if (dirty) { draw(); dirty = false; }
  }, view);
  L.loop(function () { if (mdirty) { mmDraw(); mdirty = false; } }, $('ec16-mmv'));
  L.loop(function () { if (idirty) { ivDraw(); idirty = false; } }, $('ec16-ivv'));
})();
