/* Binary Outcomes: Logit, Probit and Maximum Likelihood (/business/econometrics/binary-outcomes/): drawing and controls
   for the yes/no data with three fitted models, and the log-likelihood surface you can climb.
   The models are in model.js (window.Ec14Model); statistics from stats.js (window.EconStats). */
(function () {
  'use strict';
  var PFX = 'ec14';
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

  var M = window.Ec14Model, root = $('ec14-lab');
  if (!M || !root) return;
  var store = L.store('econ-binary');

  var MIS = [
    { id: 'oob', title: 'Out of bounds', goal: 'Make the straight line (LPM) predict a probability below 0 or above 1 for one of the people in the data.', sec: 'ec14-view' },
    { id: 'pea', title: 'At the mean vs on average', goal: 'Make the logit’s partial effect at the average x differ from its average partial effect by more than 0.05.', sec: 'ec14-view' },
    { id: 'add', title: 'A surprising point', goal: 'Click to add a “yes” where the logit says yes is very unlikely (or a “no” where yes is nearly certain). Which model moves more?', sec: 'ec14-view' },
    { id: 'sep', title: 'Perfect separation', goal: 'Drag points until every yes lies to the right of every no (try 20 people). The logit has no finite answer.', sec: 'ec14-view' },
    { id: 'top', title: 'Find the top by hand', goal: 'In the likelihood map, click a spot within 0.1 of the highest log-likelihood.', sec: 'ec14-ml' },
    { id: 'newton', title: 'Newton’s leap', goal: 'Start more than 20 log-likelihood units below the top and reach it (within 0.0001) in at most 8 Newton steps.', sec: 'ec14-ml' },
    { id: 'slow', title: 'The slow climber', goal: 'With raw x, take 40 gradient steps and still be more than 0.5 below the top.', sec: 'ec14-ml' },
    { id: 'round', title: 'Round the ridge', goal: 'Center x, start at least 5 below the top, and let gradient ascent reach within 0.01 of it in 40 steps or fewer.', sec: 'ec14-ml' }
  ];
  var view = $('ec14-view'), mis = L.missions($('ec14-missions'), 'econ-binary', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    if (id === 'sep') { st.n = 20; syncN(); regen(); }
    var el = $(m.sec); if (el && m.sec !== 'ec14-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }

  /* =========================================================================================
     1. Yes/no data, three models
     ========================================================================================= */
  var st = { preset: store.get('preset', 'study'), link: store.get('link', 'logit'), steep: +store.get('steep', 1), n: +store.get('n', 200),
    show: store.get('show', { lpm: true, logit: true, probit: true }), seed: 3, touched: false };
  if (!M.PRESETS[st.preset]) st.preset = 'study';
  var cv = $('ec14-cv'), G = L.canvas(cv), ctx = G.c, hud = $('ec14-hud');
  var data, F, dirty = true, P = null, dragI = -1, hoverI = -1;
  function regen() { data = M.gen({ preset: st.preset, steep: st.steep, link: st.link, n: st.n }, st.seed); refit(); ml.reset(); }
  function refit() { F = M.fitAll(data.x, data.y); dirty = true; readout(); checks(); ml.dataChanged(); }
  function checks() {
    if (!st.touched) return;
    if (F.lpm && F.lpm.outside > 0) win('oob', F.lpm.outside + ' of ' + F.n + ' predicted “probabilities” are below 0 or above 1.');
    if (F.logit && Math.abs(F.logit.pea - F.logit.ape) > 0.05) win('pea', 'At the mean: ' + fmt(F.logit.pea, 3) + '. On average: ' + fmt(F.logit.ape, 3) + '. Not the same thing.');
    if (F.sep === 'complete' && F.n >= 4) win('sep', 'Perfect separation: the steeper the curve, the higher the likelihood, forever.');
  }
  function layout(w, h) {
    if (w >= 640) { var lw = Math.round(w * 0.6); return { wide: true, pl: { x: 0, y: 0, w: lw, h: h }, tab: { x: lw + 6, y: 54, w: w - lw - 16, h: Math.round((h - 64) * 0.55) }, me: { x: lw + 6, y: 54 + Math.round((h - 64) * 0.55) + 8, w: w - lw - 16, h: h - 64 - Math.round((h - 64) * 0.55) - 8 } }; }
    var a = Math.round(h * 0.5), b = Math.round(h * 0.28);
    return { wide: false, pl: { x: 0, y: 0, w: w, h: a }, tab: { x: 6, y: a + 2, w: w - 12, h: b - 6 }, me: { x: 6, y: a + b, w: w - 12, h: h - a - b - 6 } };
  }
  var COL = { lpm: C.violet, logit: C.green, probit: C.gold };
  function yPos(i) { return data.y[i] ? 1.035 + 0.07 * (data.j[i] - 0.5) : -0.035 + 0.07 * (data.j[i] - 0.5); }
  function draw() {
    G.fit(); var c = ctx, w = G.w, h = G.h; c.clearRect(0, 0, w, h);
    var Lo = layout(w, h), A = Lo.pl, PR = M.PRESETS[st.preset];
    P = Plot(A.x + 46, A.y + 60, A.w - 62, A.h - 60 - 40, [PR.lo, PR.hi], [-0.3, 1.3]);
    // impossible zones
    c.fillStyle = 'rgba(255,135,135,.07)'; c.fillRect(P.x, P.y, P.w, P.Y(1) - P.y); c.fillRect(P.x, P.Y(0), P.w, P.y + P.h - P.Y(0));
    axes(c, P, { xt: 6, yticks: [0, 0.25, 0.5, 0.75, 1], yf: function (v) { return fmt(v, 2); }, xlab: PR.x, ylab: 'P(' + PR.y.toLowerCase() + ')', ylabOff: 34, xf: function (v) { return fmt(v, PR.fmtd === 2 ? 1 : 0); } });
    txt(c, 'probability above 1: impossible', P.x + P.w - 6, P.y + 12, { size: 10, col: 'rgba(255,135,135,.8)', align: 'right' });
    txt(c, 'below 0: impossible', P.x + P.w - 6, P.y + P.h - 6, { size: 10, col: 'rgba(255,135,135,.8)', align: 'right' });
    c.save(); c.setLineDash([2, 4]); c.strokeStyle = 'rgba(219,231,239,.25)'; c.beginPath(); c.moveTo(P.x, P.Y(0.5)); c.lineTo(P.x + P.w, P.Y(0.5)); c.stroke(); c.restore();
    clip(c, P, 1);
    // binned shares
    var nb = 8, bs = new Array(nb).fill(0), bc = new Array(nb).fill(0);
    data.x.forEach(function (x, i) { var k = Math.floor((x - PR.lo) / (PR.hi - PR.lo) * nb); if (k >= 0 && k < nb) { bs[k] += data.y[i]; bc[k]++; } });
    for (var k = 0; k < nb; k++) if (bc[k] >= 3) dot(c, P.X(PR.lo + (k + 0.5) * (PR.hi - PR.lo) / nb), P.Y(bs[k] / bc[k]), 5, 'rgba(6,17,26,.5)', 'rgba(255,255,255,.75)', 1.5);
    // curves
    if (st.show.lpm && F.lpm) fn(c, P, function (x) { return F.lpm.b[0] + F.lpm.b[1] * x; }, COL.lpm, 2.6);
    if (!F.sep) {
      if (st.show.probit && F.probit) fn(c, P, function (x) { return S.normCdf(F.probit.b[0] + F.probit.b[1] * x); }, COL.probit, 2.6, [7, 5]);
      if (st.show.logit && F.logit) fn(c, P, function (x) { return M.Lam(F.logit.b[0] + F.logit.b[1] * x); }, COL.logit, 3);
    } else if (F.sep === 'complete') {
      var x0 = -Infinity, x1 = Infinity; data.x.forEach(function (x, i) { if (data.y[i]) x1 = Math.min(x1, x); else x0 = Math.max(x0, x); });
      var flip = false; data.x.forEach(function (x, i) { if (!data.y[i] && x > x1) flip = true; });
      if (flip) { x0 = -Infinity; x1 = Infinity; data.x.forEach(function (x, i) { if (!data.y[i]) x1 = Math.min(x1, x); else x0 = Math.max(x0, x); }); }
      var xm = (x0 + x1) / 2;
      c.save(); c.strokeStyle = COL.logit; c.lineWidth = 3; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(P.x, P.Y(flip ? 1 : 0)); c.lineTo(P.X(xm), P.Y(flip ? 1 : 0)); c.lineTo(P.X(xm), P.Y(flip ? 0 : 1)); c.lineTo(P.x + P.w, P.Y(flip ? 0 : 1)); c.stroke(); c.restore();
    }
    // the truth, faint
    var T = M.truth({ preset: st.preset, steep: st.steep, link: st.link });
    if ($('ec14-truth').checked) fn(c, P, T.prob, rgba(C.pink, 0.8), 1.6, [2, 4]);
    // points
    data.x.forEach(function (x, i) {
      var px = P.X(x), py = P.Y(yPos(i)), col = data.y[i] ? C.gold : C.blue, act = i === dragI || i === hoverI;
      dot(c, px, py, act ? 6 : 3.6, rgba(col, act ? 1 : 0.75), act ? '#fff' : null, 1.5);
    });
    c.restore();
    // legend
    var lx = P.x + 4, ly = A.y + 50;
    [['lpm', 'linear probability model'], ['logit', 'logit'], ['probit', 'probit']].forEach(function (it, i) {
      if (!st.show[it[0]]) return;
      c.save(); c.strokeStyle = COL[it[0]]; c.lineWidth = 2.6; if (it[0] === 'probit') c.setLineDash([7, 5]); c.beginPath(); c.moveTo(lx, ly - 4); c.lineTo(lx + 20, ly - 4); c.stroke(); c.restore();
      txt(c, it[1], lx + 25, ly, { size: 11, col: C.ink }); lx += 32 + tw(c, it[1], 11) + 8;
    });
    if (F.sep) {
      var msg = F.sep === 'all' ? 'Everyone has the same outcome: nothing to fit.' : F.sep === 'complete' ? 'Perfect separation: logit and probit have no finite maximum.' : 'Quasi-separation at one x value: the maximum is at infinity.';
      var mw = Math.min(P.w - 10, tw(c, msg, 12, 700) + 20);
      c.save(); rr(c, P.x + (P.w - mw) / 2, P.Y(0.5) - 15, mw, 30, 8); c.fillStyle = 'rgba(80,20,20,.9)'; c.fill(); c.strokeStyle = C.red; c.stroke(); c.restore();
      txt(c, msg, P.x + P.w / 2, P.Y(0.5) + 4, { size: 12, weight: 700, col: '#fff', align: 'center', max: mw - 12 });
    }
    drawTable(c, Lo.tab); drawME(c, Lo.me);
    hud.innerHTML = '<b>' + PR.y + '</b> · n = ' + F.n + ' · share yes ' + fmt(F.ybar, 2);
  }
  function drawTable(c, A) {
    card(c, A.x, A.y, A.w, A.h, 'THREE MODELS, ONE DATASET');
    var cols = [['', 0], ['LPM', 1], ['logit', 2], ['probit', 3]], cw = (A.w - 20 - 92) / 3, x0 = A.x + 10, y = A.y + 38, small = A.w < 330;
    var lh = Math.max(14, Math.min(20, (A.h - 46) / 8));
    function cell(t, i, yy, col, bold) { txt(c, t, i === 0 ? x0 : x0 + 92 + (i - 0.5) * cw, yy, { size: small ? 10.5 : 11.5, mono: i > 0, col: col || C.ink, align: i === 0 ? 'left' : 'center', weight: bold ? 700 : 400, max: i === 0 ? 90 : cw - 4 }); }
    cell('', 0, y); cell('LPM', 1, y, COL.lpm, 1); cell('logit', 2, y, COL.logit, 1); cell('probit', 3, y, COL.probit, 1);
    var L1 = F.lpm, Lg = F.sep ? null : F.logit, Pb = F.sep ? null : F.probit;
    function v(m, f2) { return m ? f2(m) : '—'; }
    var rows = [
      ['intercept β₀', function (m) { return fmt(m.b[0], 2); }],
      ['slope β₁', function (m) { return fmt(m.b[1], 3); }],
      ['  (SE)', function (m) { return '(' + fmt(m.se[1], 3) + ')'; }],
      ['avg partial effect', function (m) { return fmt(m.ape, 3); }],
      ['effect at mean x', function (m) { return fmt(m.pea, 3); }],
      ['log-likelihood', function (m) { return m.ll === undefined ? '—' : fmt(m.ll, 1); }],
      ['% predicted right', function (m) { return Math.round(m.pcp * 100) + '%'; }]
    ];
    rows.forEach(function (r, k) {
      var yy = y + (k + 1) * lh; if (yy > A.y + A.h - 4) return;
      cell(r[0], 0, yy, C.muted); cell(v(L1, r[1]), 1, yy); cell(v(Lg, r[1]), 2, yy); cell(v(Pb, r[1]), 3, yy);
    });
  }
  function drawME(c, A) {
    card(c, A.x, A.y, A.w, A.h, 'WHAT THE LOGIT SAYS');
    var x = A.x + 10, y = A.y + 36, PR = M.PRESETS[st.preset];
    if (F.sep || !F.logit) { txt(c, F.sep ? 'No finite estimates: see the plot.' : '—', x, y + 8, { size: 12, col: C.red }); return; }
    var g = F.logit, lines = [
      ['odds ratio for +1 ' + PR.unit, '× ' + fmt(g.or, 2), C.green],
      ['LR test of no effect', 'LR = ' + fmt(g.LR, 1) + ', ' + pEq(g.LRp), g.LRp < 0.05 ? C.green : C.muted],
      ['McFadden pseudo-R²', fmt(g.r2, 3), C.ink],
      ['logit slope ÷ probit slope', F.probit ? fmt(g.b[1] / F.probit.b[1], 2) : '—', C.ink],
      ['Newton iterations', String(g.iter), C.muted]
    ];
    var lh = Math.max(14, Math.min(20, (A.h - 40) / lines.length));
    lines.forEach(function (l, k) { var yy = y + k * lh; if (yy > A.y + A.h - 4) return; txt(c, l[0], x, yy, { size: 11, col: C.muted, max: A.w * 0.55 }); txt(c, l[1], A.x + A.w - 10, yy, { size: 11.5, mono: true, col: l[2], align: 'right', max: A.w * 0.45 }); });
  }
  function readout() {
    var g = F.sep ? null : F.logit, rows = [
      ['People (share yes)', F.n + ' (' + fmt(F.ybar, 2) + ')'],
      ['LPM slope (robust SE)', F.lpm ? fmt(F.lpm.b[1], 3) + ' (' + fmt(F.lpm.se[1], 3) + ')' : '—'],
      ['LPM predictions outside 0–1', F.lpm ? String(F.lpm.outside) : '—', F.lpm && F.lpm.outside ? 'ec14-bad' : ''],
      ['Logit average partial effect', g ? fmt(g.ape, 3) : '—'],
      ['Logit effect at mean x', g ? fmt(g.pea, 3) : '—'],
      ['Logit odds ratio', g ? fmt(g.or, 2) : '—'],
      ['LR test', g ? 'LR = ' + fmt(g.LR, 1) + ', ' + pEq(g.LRp) : '—']
    ];
    if (F.sep) rows.push(['Separation', F.sep, 'ec14-bad']);
    dl($('ec14-read'), rows);
  }
  // editing points: click to add, drag to move (across the middle to flip), double-click or drag off the plot to delete
  function hit(x, y) { if (!P) return -1; var best = -1, bd = 14 * 14; data.x.forEach(function (v, i) { var dx = P.X(v) - x, dy = P.Y(yPos(i)) - y, q = dx * dx + dy * dy; if (q < bd) { bd = q; best = i; } }); return best; }
  var downAt = null, moved = false;
  pointer(cv, {
    down: function (x, y) {
      if (!P || !P.inside(x, y)) return false;
      st.touched = true; var i = hit(x, y); downAt = { x: x, y: y }; moved = false;
      if (i >= 0) { dragI = i; dirty = true; return true; }
      // add a point
      var PR = M.PRESETS[st.preset], xv = clamp(P.iX(x), PR.lo, PR.hi), yv = P.iY(y) >= 0.5 ? 1 : 0;
      var before = F; data.x.push(xv); data.y.push(yv); data.j.push(Math.random()); refit();
      if (before && before.logit && !before.sep && F.logit && !F.sep) {
        var pr = M.Lam(before.logit.b[0] + before.logit.b[1] * xv), surprise = yv ? 1 - pr : pr;
        if (surprise > 0.9) {
          var dl1 = (F.lpm.b[1] - before.lpm.b[1]) / Math.abs(before.lpm.b[1]) * 100, dl2 = (F.logit.ape - before.logit.ape) / Math.abs(before.logit.ape) * 100;
          win('add', 'One point moved the LPM slope ' + fmt(dl1, 1) + '% and the logit’s average effect ' + fmt(dl2, 1) + '%.');
        }
      }
      return false;
    },
    drag: function (x, y) {
      if (dragI < 0) return; moved = moved || Math.abs(x - downAt.x) + Math.abs(y - downAt.y) > 3;
      var PR = M.PRESETS[st.preset];
      if (!P.inside(x, y)) { data.x[dragI] = clamp(P.iX(x), PR.lo, PR.hi); dirty = true; return; }
      data.x[dragI] = clamp(P.iX(x), PR.lo, PR.hi); data.y[dragI] = P.iY(y) >= 0.5 ? 1 : 0; refit();
    },
    up: function (x, y) {
      if (dragI >= 0 && moved && P && !P.inside(x, y) && data.x.length > 3) { data.x.splice(dragI, 1); data.y.splice(dragI, 1); data.j.splice(dragI, 1); }
      dragI = -1; refit();
    },
    hover: function (x, y) { var i = hit(x, y); if (i !== hoverI) { hoverI = i; dirty = true; } cv.style.cursor = i >= 0 ? 'grab' : P && P.inside(x, y) ? 'crosshair' : 'default'; },
    leave: function () { if (hoverI >= 0) { hoverI = -1; dirty = true; } }
  });
  cv.addEventListener('dblclick', function (e) { var r = cv.getBoundingClientRect(), i = hit(e.clientX - r.left, e.clientY - r.top); if (i >= 0 && data.x.length > 3) { data.x.splice(i, 1); data.y.splice(i, 1); data.j.splice(i, 1); refit(); } });
  // keyboard: move the last point with the arrows, flip it with space, add with A, delete with Delete
  cv.addEventListener('keydown', function (e) {
    var k = e.key, i = data.x.length - 1, PR = M.PRESETS[st.preset], step = (PR.hi - PR.lo) / 100, used = true; st.touched = true;
    if (k === 'ArrowLeft') data.x[i] = clamp(data.x[i] - step, PR.lo, PR.hi);
    else if (k === 'ArrowRight') data.x[i] = clamp(data.x[i] + step, PR.lo, PR.hi);
    else if (k === ' ' || k === 'ArrowUp' || k === 'ArrowDown') data.y[i] = k === 'ArrowUp' ? 1 : k === 'ArrowDown' ? 0 : 1 - data.y[i];
    else if (k === 'a' || k === 'A') { data.x.push((PR.lo + PR.hi) / 2); data.y.push(1); data.j.push(Math.random()); }
    else if ((k === 'Delete' || k === 'Backspace') && data.x.length > 3) { data.x.pop(); data.y.pop(); data.j.pop(); }
    else if (k === 'n' || k === 'N') { newSample(); e.preventDefault(); return; }
    else used = false;
    if (used) { e.preventDefault(); refit(); }
  });
  function save() { store.set('preset', st.preset); store.set('link', st.link); store.set('steep', st.steep); store.set('n', st.n); store.set('show', st.show); }
  var markPre = seg($('ec14-pre'), 'data-p', st.preset, function (v) { st.touched = true; st.preset = v; save(); regen(); });
  var markLink = seg($('ec14-link'), 'data-l', st.link, function (v) { st.touched = true; st.link = v; save(); regen(); });
  var syncSteep = slider('ec14-steep', function () { return st.steep; }, function (v) { st.touched = true; st.steep = v; save(); regen(); }, function (v) { return v === 0 ? 'no effect' : '× ' + fmt(v, 1); });
  var syncN = slider('ec14-n', function () { return st.n; }, function (v) { st.touched = true; st.n = v; save(); regen(); }, function (v) { return String(v); });
  ['lpm', 'logit', 'probit'].forEach(function (k) { var el = $('ec14-s-' + k); el.checked = !!st.show[k]; el.addEventListener('change', function () { st.show[k] = el.checked; save(); dirty = true; }); });
  $('ec14-truth').addEventListener('change', function () { dirty = true; });
  function newSample() { st.touched = true; st.seed = 1 + Math.floor(Math.random() * 1e8); regen(); }
  $('ec14-new').addEventListener('click', newSample); $('ec14-new2').addEventListener('click', newSample);
  $('ec14-reset').addEventListener('click', function () { st.preset = 'study'; st.link = 'logit'; st.steep = 1; st.n = 200; st.seed = 3; save(); markPre(st.preset); markLink(st.link); syncSteep(); syncN(); regen(); });

  /* =========================================================================================
     2. Climbing the log-likelihood
     ========================================================================================= */
  var ml = (function () {
    var mcv = $('ec14-mc'), MG = L.canvas(mcv), md = true, center = false, cur = null, path = [], gsteps = 0, nsteps = 0, startGap = 0, grid = null, gridKey = '', off = null, H = null, lastKind = '';
    function xs() { var xc = center ? F.xbar : 0; return data.x.map(function (v) { return v - xc; }); }
    function mle() { if (F.sep || !F.logit) return null; var xc = center ? F.xbar : 0; return { b0: F.logit.b[0] + F.logit.b[1] * xc, b1: F.logit.b[1], ll: F.logit.ll, se0: center ? Math.sqrt(1 / M.info(F.logit.b[0] + F.logit.b[1] * xc, F.logit.b[1], xs())[0][0]) : F.logit.se[0], se1: F.logit.se[1] }; }
    function box() { var m = mle(); if (!m) return null; var r0 = 8 * Math.max(m.se0, 0.05), r1 = 8 * Math.max(m.se1, 0.005); return { b0: [m.b0 - r0, m.b0 + r0], b1: [m.b1 - r1, m.b1 + r1] }; }
    function reset() { var B = box(); cur = B ? { b0: B.b0[0] + 0.15 * (B.b0[1] - B.b0[0]), b1: B.b1[0] + 0.8 * (B.b1[1] - B.b1[0]) } : { b0: 0, b1: 0 }; path = [cur]; gsteps = 0; nsteps = 0; startGap = gap(); lastKind = ''; md = true; upd(); }
    function gap() { var m = mle(); return m ? m.ll - M.ll(cur.b0, cur.b1, xs(), data.y) : NaN; }
    function setStart(b0, b1) { cur = { b0: b0, b1: b1 }; path = [cur]; gsteps = 0; nsteps = 0; startGap = gap(); lastKind = ''; md = true; upd(); if (gap() < 0.1) win('top', (gap() < 0.001 ? 'Less than 0.001' : 'Within ' + fmt(gap(), 3)) + ' below the maximum. That’s maximum likelihood, by hand.', $('ec14-mlv')); }
    function step(kind) {
      var m = mle(); if (!m) return; var X = xs();
      if (kind === 'newton') { var s = M.newton(cur.b0, cur.b1, X, data.y); cur = { b0: s.b0, b1: s.b1 }; nsteps++; }
      else { var I = M.info(m.b0, m.b1, X), r = M.safeRate(I); var s2 = M.ascent(cur.b0, cur.b1, X, data.y, r); cur = { b0: s2.b0, b1: s2.b1 }; gsteps++; }
      lastKind = kind; path.push(cur); if (path.length > 400) path.shift(); md = true; upd();
      var g = gap();
      if (kind === 'newton' && g < 1e-4 && startGap > 20 && nsteps <= 8 && gsteps === 0) win('newton', 'From ' + fmt(startGap, 1) + ' below the top to the top in ' + nsteps + ' Newton steps.', $('ec14-mlv'));
      if (kind === 'grad' && !center && gsteps >= 40 && nsteps === 0 && g > 0.5) win('slow', gsteps + ' gradient steps and still ' + fmt(g, 2) + ' below the top: the ridge is long and thin.', $('ec14-mlv'));
      if (kind === 'grad' && center && g < 0.01 && startGap >= 5 && gsteps <= 40 && nsteps === 0) win('round', 'Centered: gradient ascent made it in ' + gsteps + ' steps.', $('ec14-mlv'));
    }
    function upd() {
      var m = mle(), rows;
      if (!m) { dl($('ec14-mlread'), [['Log-likelihood', 'no finite maximum (separation)']]); return; }
      var X = xs(), L0 = M.ll(cur.b0, cur.b1, X, data.y), g = M.grad(cur.b0, cur.b1, X, data.y);
      rows = [
        ['Your point (β₀, β₁)', '(' + fmt(cur.b0, 3) + ', ' + fmt(cur.b1, 3) + ')'],
        ['Log-likelihood ℓ', fmt(L0, 3)],
        ['Below the top by', m.ll - L0 < 0.0001 ? '< 0.0001' : fmt(m.ll - L0, 4), m.ll - L0 < 0.01 ? 'ec14-good' : ''],
        ['Gradient size', fmt(Math.hypot(g[0], g[1]), 4)],
        ['Steps: Newton / gradient', nsteps + ' / ' + gsteps],
        ['The top: ℓ at (β₀, β₁)', fmt(m.ll, 3) + ' at (' + fmt(m.b0, 3) + ', ' + fmt(m.b1, 3) + ')'],
        ['Best with β₁ = 0', fmt(F.logit.ll0, 3) + ' → LR = ' + fmt(2 * (m.ll - F.logit.ll0), 1)]
      ];
      dl($('ec14-mlread'), rows);
    }
    function buildGrid(B, W, Hh) {
      var key = [B.b0.join(), B.b1.join(), W, Hh, data.x.length, center, F.logit ? F.logit.ll : 0].join('|');
      if (key === gridKey) return; gridKey = key;
      var X = xs(), m = mle(), nx = clamp(Math.round(W / 3), 2, 170), ny = clamp(Math.round(Hh / 3), 2, 120);
      grid = { nx: nx, ny: ny, v: new Float32Array(nx * ny) };
      for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) {
        var b0 = B.b0[0] + (i + 0.5) / nx * (B.b0[1] - B.b0[0]), b1 = B.b1[1] - (j + 0.5) / ny * (B.b1[1] - B.b1[0]);
        grid.v[j * nx + i] = m.ll - M.ll(b0, b1, X, data.y);
      }
      off = document.createElement('canvas'); off.width = nx; off.height = ny;
      var oc = off.getContext('2d'), img = oc.createImageData(nx, ny), stops = [[255, 212, 121], [99, 230, 190], [56, 140, 170], [30, 60, 110], [12, 22, 40]];
      for (var k = 0; k < nx * ny; k++) {
        var gg = grid.v[k], t = clamp(Math.log10(1 + gg) / 2.6, 0, 1), band = Math.floor(Math.log10(1 + gg) * 6) % 2 ? 0.92 : 1;
        var u = t * (stops.length - 1), a = Math.min(stops.length - 2, Math.floor(u)), f = u - a, col = [0, 1, 2].map(function (q) { return (stops[a][q] + (stops[a + 1][q] - stops[a][q]) * f) * band; });
        if (gg < 2.996) col = col.map(function (q, qi) { return q * 0.75 + [99, 230, 190][qi] * 0.25; });
        img.data[4 * k] = col[0]; img.data[4 * k + 1] = col[1]; img.data[4 * k + 2] = col[2]; img.data[4 * k + 3] = 255;
      }
      oc.putImageData(img, 0, 0);
    }
    function draw() {
      MG.fit(); var c = MG.c, w = MG.w, h = MG.h; c.clearRect(0, 0, w, h);
      var B = box(), m = mle(), wide = w >= 640, A1, A2;
      if (wide) { var lw = Math.round(w * 0.36); A1 = { x: 8, y: 8, w: lw, h: h - 16 }; A2 = { x: lw + 16, y: 8, w: w - lw - 24, h: h - 16 }; }
      else { var a = Math.round(h * 0.36); A1 = { x: 6, y: 6, w: w - 12, h: a - 6 }; A2 = { x: 6, y: a + 4, w: w - 12, h: h - a - 10 }; }
      card(c, A1.x, A1.y, A1.w, A1.h, 'THE CURVE AT YOUR POINT');
      card(c, A2.x, A2.y, A2.w, A2.h, 'LOG-LIKELIHOOD ℓ(β₀, β₁)' + (center ? ' · x CENTERED' : ' · RAW x'));
      if (!m) { txt(c, 'Perfect separation: there is no top to climb.', A2.x + A2.w / 2, A2.y + A2.h / 2, { size: 13, col: C.red, align: 'center', weight: 700 }); return; }
      var PR = M.PRESETS[st.preset], xc = center ? F.xbar : 0;
      var P1 = Plot(A1.x + 34, A1.y + 32, A1.w - 46, A1.h - 66, [PR.lo, PR.hi], [-0.08, 1.08]);
      axes(c, P1, { xt: 4, yticks: [0, 0.5, 1], xlab: PR.x, xf: function (v) { return fmt(v, PR.fmtd === 2 ? 1 : 0); } });
      data.x.forEach(function (x, i) { dot(c, P1.X(x), P1.Y(data.y[i] ? 1 - 0.03 * data.j[i] : 0.03 * data.j[i]), 2.4, rgba(data.y[i] ? C.gold : C.blue, 0.6)); });
      fn(c, P1, function (x) { return M.Lam(m.b0 + m.b1 * (x - xc)); }, C.green, 2, [6, 4]);
      fn(c, P1, function (x) { return M.Lam(cur.b0 + cur.b1 * (x - xc)); }, C.pink, 3);
      txt(c, 'your point', P1.x + 4, P1.y + 10, { size: 10.5, col: C.pink, weight: 700 }); txt(c, 'the maximum', P1.x + 72, P1.y + 10, { size: 10.5, col: C.green, weight: 700 });
      var P2 = Plot(A2.x + 54, A2.y + 30, A2.w - 70, A2.h - 80, B.b0, B.b1);
      buildGrid(B, P2.w, P2.h);
      c.save(); c.imageSmoothingEnabled = true; c.drawImage(off, P2.x, P2.y, P2.w, P2.h); c.restore();
      axes(c, P2, { xt: 5, yt: 5, xlab: center ? 'β₀ (intercept at the average x)' : 'β₀ (intercept at x = 0)', ylab: 'β₁ (slope)', ylabOff: 44, noXgrid: true });
      clip(c, P2, 0);
      // the restricted model b1 = 0, if it is on the map
      if (B.b1[0] < 0 && B.b1[1] > 0) {
        c.save(); c.strokeStyle = 'rgba(255,255,255,.45)'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(P2.x, P2.Y(0)); c.lineTo(P2.x + P2.w, P2.Y(0)); c.stroke(); c.restore();
        var br = Math.log(F.ybar / (1 - F.ybar)); dot(c, P2.X(br), P2.Y(0), 4, '#fff');
        var rt = P2.X(br) > P2.x + P2.w - 110; txt(c, 'best with β₁ = 0', P2.X(br) + (rt ? -6 : 6), P2.Y(0) - 6, { size: 10, col: '#fff', align: rt ? 'right' : 'left' });
      }
      // the climb
      c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath();
      path.forEach(function (q, i) { var px = P2.X(q.b0), py = P2.Y(q.b1); if (i) c.lineTo(px, py); else c.moveTo(px, py); }); c.stroke();
      path.forEach(function (q, i) { if (path.length < 60 || i % 5 === 0 || i === path.length - 1) dot(c, P2.X(q.b0), P2.Y(q.b1), i === path.length - 1 ? 6 : 2.6, i === path.length - 1 ? C.pink : '#fff', i === path.length - 1 ? '#06111a' : null, 2); });
      c.save(); c.strokeStyle = '#06111a'; c.lineWidth = 2; c.beginPath(); c.moveTo(P2.X(m.b0) - 6, P2.Y(m.b1)); c.lineTo(P2.X(m.b0) + 6, P2.Y(m.b1)); c.moveTo(P2.X(m.b0), P2.Y(m.b1) - 6); c.lineTo(P2.X(m.b0), P2.Y(m.b1) + 6); c.stroke(); c.restore();
      c.restore();
      txt(c, 'bright = higher ℓ · green tint = 95% confidence region · click to start', A2.x + 10, A2.y + A2.h - 8, { size: 10.5, col: C.muted, max: A2.w - 20 });
      H = P2;
    }
    pointer(mcv, {
      down: function (x, y) { if (!H || !H.inside(x, y)) return false; setStart(H.iX(x), H.iY(y)); return true; },
      drag: function (x, y) { if (H && H.inside(x, y)) setStart(H.iX(x), H.iY(y)); }
    });
    mcv.addEventListener('keydown', function (e) {
      var B = box(); if (!B) return; var k = e.key, d0 = (B.b0[1] - B.b0[0]) / 40, d1 = (B.b1[1] - B.b1[0]) / 40, used = true;
      if (k === 'ArrowLeft') setStart(cur.b0 - d0, cur.b1); else if (k === 'ArrowRight') setStart(cur.b0 + d0, cur.b1);
      else if (k === 'ArrowUp') setStart(cur.b0, cur.b1 + d1); else if (k === 'ArrowDown') setStart(cur.b0, cur.b1 - d1);
      else if (k === 'Enter') step('newton'); else if (k === 'g' || k === 'G') step('grad'); else used = false;
      if (used) e.preventDefault();
    });
    $('ec14-nt').addEventListener('click', function () { step('newton'); });
    $('ec14-gd').addEventListener('click', function () { step('grad'); });
    $('ec14-gd10').addEventListener('click', function () { for (var i = 0; i < 10; i++) step('grad'); });
    $('ec14-mlreset').addEventListener('click', function () { reset(); });
    var cc = $('ec14-center'); cc.addEventListener('change', function () { var m0 = mle(); center = cc.checked; gridKey = ''; reset(); void m0; });
    return { reset: reset, dataChanged: function () { gridKey = ''; md = true; if (cur) upd(); }, loop: function () { if (md) { draw(); md = false; } }, mark: function () { md = true; } };
  })();

  window.addEventListener('resize', function () { dirty = true; ml.mark(); });
  regen();
  L.loop(function () { if (dirty) { draw(); dirty = false; } }, view);
  L.loop(function () { ml.loop(); }, $('ec14-mlv'));
})();
