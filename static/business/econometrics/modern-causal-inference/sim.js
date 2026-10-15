/* Modern Causal Inference (/business/econometrics/modern-causal-inference/): drawing and controls for the causal-diagram
   builder, matching and propensity scores, synthetic control, and LASSO with double/debiased machine learning.
   The models are in model.js (window.Ec17Model); statistics from stats.js (window.EconStats). */
(function () {
  'use strict';
  var PFX = 'ec17';
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

  var M = window.Ec17Model, root = $('ec17-lab');
  if (!M || !root) return;
  var store = L.store('econ-causal');

  var MIS = [
    { id: 'confound', title: 'Close the back door', goal: 'In “Confounder”, control for the variable that drives both training and wages. The estimate should land on the true effect.', sec: 'ec17-view' },
    { id: 'mediator', title: 'Don’t block the road', goal: 'In “Mediator”, control for skills and watch the estimate drop to the direct effect only.', sec: 'ec17-view' },
    { id: 'collider', title: 'The collider trap', goal: 'In “Collider”, control for promotion, which both training and wages cause. A bias appears from nowhere.', sec: 'ec17-view' },
    { id: 'mbias', title: 'M-bias', goal: 'In “M-bias”, control for the survey answer, measured before training. Even a pre-treatment variable can hurt.', sec: 'ec17-view' },
    { id: 'build', title: 'Build a confounder', goal: 'In “Build your own”, draw arrows that confound training and the outcome, then control for the right set so the estimate is unbiased again.', sec: 'ec17-view' },
    { id: 'balance', title: 'Balance the groups', goal: 'In the matching lab, with selection strength of 1 or more, get every standardized difference after matching below 0.1 (more people, or a caliper, help).', sec: 'ec17-ma' },
    { id: 'synth', title: 'Build a twin', goal: 'In synthetic control, fit weights so the twin tracks the treated state before the policy (error under 0.6) and estimate the effect within 25%.', sec: 'ec17-sc' },
    { id: 'dml', title: 'Debiased', goal: 'In the machine-learning lab, run 200 studies: double machine learning covers the truth about 95% of the time while naive selection almost never does.', sec: 'ec17-ml' }
  ];
  var view = $('ec17-view'), mis = L.missions($('ec17-missions'), 'econ-causal', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    var map = { confound: 'confound', mediator: 'mediator', collider: 'collider', mbias: 'mbias', build: 'build' };
    if (map[id]) { setPreset(map[id]); markPre(map[id]); }
    var el = $(m.sec); if (el && m.sec !== 'ec17-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }

  /* =========================================================================================
     1. Causal diagram builder
     ========================================================================================= */
  var st = { preset: store.get('preset', 'confound'), Z: {}, mode: 'control', sel: null, touched: false };
  if (!M.PRESETS[st.preset]) st.preset = 'confound';
  var cv = $('ec17-cv'), G = L.canvas(cv), ctx = G.c, hud = $('ec17-hud'), g, R, dirty = true, DA = null, dragN = null, downP = null, hoverPath = -1;
  function setPreset(k) { st.preset = k; store.set('preset', k); g = M.makeGraph(k); st.Z = {}; st.sel = null; buildForms(); recompute(); }
  function recompute() {
    var Zl = Object.keys(st.Z).filter(function (k) { return st.Z[k]; }), data = M.simulateSEM(g, 2000, 7);
    var o = S.ols(data.Y, data.D.map(function (v, i) { return [v].concat(Zl.map(function (z) { return data[z][i]; })); }), { intercept: true, se: 'HC1' });
    var bd = M.backdoorOK(g, st.Z), te = M.totalEffect(g), pl = M.plim(g, Zl), P = M.paths(g);
    R = { est: o.b[1], se: o.se[1], truth: te, plim: pl, bd: bd, paths: P.map(function (p) { return { p: p, b: M.blocked(g, p, st.Z) }; }), sets: M.adjustmentSets(g), Zl: Zl, iv: null };
    var hasZ = g.nodes.some(function (n) { return n.id === 'Z'; });
    if (!R.sets.length && hasZ && M.has(g, 'Z', 'D')) R.iv = M.ivSimple(data.Y, data.D, data.Z);
    dirty = true; readDAG(); checksDAG();
  }
  function readDAG() {
    var rows = [
      ['True effect of D on Y', fmt(R.truth, 2)],
      ['Your regression: Y on D' + (R.Zl.length ? ' + ' + R.Zl.join(' + ') : ''), fmt(R.est, 2) + ' (SE ' + fmt(R.se, 2) + ')', Math.abs(R.plim - R.truth) > 0.05 ? 'ec17-bad' : 'ec17-good'],
      ['Bias in a huge sample', fmt(R.plim - R.truth, 2)],
      ['Backdoor criterion', R.bd.ok ? 'satisfied ✓' : R.bd.descendantsControlled.length ? 'broken: ' + R.bd.descendantsControlled.join(', ') + ' is caused by D' : 'broken: a back door is open']
    ];
    rows.push(['Valid sets to control for', R.sets.length ? R.sets.map(function (s) { return s.length ? '{' + s.join(', ') + '}' : 'nothing'; }).join(' or ') : 'none: the confounder is unobserved']);
    if (R.iv) rows.push(['IV estimate with the lottery Z', fmt(R.iv.b, 2) + ' (SE ' + fmt(R.iv.se, 2) + ')', 'ec17-good']);
    dl($('ec17-read'), rows);
  }
  function checksDAG() {
    if (!st.touched) return;
    var bias = Math.abs(R.plim - R.truth);
    if (st.preset === 'confound' && st.Z.X && R.bd.ok) win('confound', 'Back door closed: ' + fmt(R.est, 2) + ' vs the true ' + fmt(R.truth, 2) + '.');
    if (st.preset === 'mediator' && st.Z.M) win('mediator', 'Controlling for skills leaves only the direct effect (' + fmt(R.plim, 2) + ' of the total ' + fmt(R.truth, 2) + ').');
    if (st.preset === 'collider' && st.Z.C && bias > 0.3) win('collider', 'Conditioning on a common effect opened a path: the estimate fell to ' + fmt(R.est, 2) + '.');
    if (st.preset === 'mbias' && st.Z.C && bias > 0.05) win('mbias', 'Controlling for C opened D ← U1 → C ← U2 → Y: bias ' + fmt(R.plim - R.truth, 2) + '.');
    if (st.preset === 'build') {
      var naiveOK = M.backdoorOK(g, {}).ok;
      if (!naiveOK && R.bd.ok && R.Zl.length && bias < 0.01) win('build', 'You built a confounder and closed its back door with {' + R.Zl.join(', ') + '}.');
    }
  }
  // the forms: control checkboxes and the arrow editor
  function buildForms() {
    var box = $('ec17-ctl'); box.innerHTML = '';
    g.nodes.forEach(function (n) {
      if (n.id === 'D' || n.id === 'Y') return;
      var lab = D.createElement('label'); lab.className = 'lab-chk';
      lab.innerHTML = '<input type="checkbox"' + (n.obs ? '' : ' disabled') + (st.Z[n.id] ? ' checked' : '') + '> ' + n.id + ': ' + n.label + (n.obs ? '' : ' <span class="lab-small">(unobserved)</span>');
      lab.querySelector('input').addEventListener('change', function (e) { st.touched = true; st.Z[n.id] = e.target.checked ? 1 : 0; recompute(); });
      box.appendChild(lab);
    });
    var opts = g.nodes.map(function (n) { return '<option value="' + n.id + '">' + n.id + ' · ' + n.label + '</option>'; }).join('');
    $('ec17-from').innerHTML = opts; $('ec17-to').innerHTML = opts; $('ec17-to').value = 'Y';
    $('ec17-arrowbox').hidden = false;
  }
  function syncForms() { $('ec17-ctl').querySelectorAll('input').forEach(function (inp, i) { var n = g.nodes.filter(function (q) { return q.id !== 'D' && q.id !== 'Y'; })[i]; if (n) inp.checked = !!st.Z[n.id]; }); }
  function toggleArrow(a, b) {
    if (a === b) return;
    var i = g.edges.findIndex(function (e) { return e.from === a && e.to === b; }), j = g.edges.findIndex(function (e) { return e.from === b && e.to === a; });
    if (i >= 0) { g.edges.splice(i, 1); L.toast(view, 'Removed ' + a + ' → ' + b + '.'); }
    else {
      if (j >= 0) g.edges.splice(j, 1);
      if (!M.acyclicWith(g, a, b)) { if (j >= 0) g.edges.push({ from: b, to: a, b: 0.8 }); L.toast(view, a + ' → ' + b + ' would make a loop: causes can’t cause themselves.'); return; }
      g.edges.push({ from: a, to: b, b: a === 'D' && b === 'Y' ? 1 : 0.8 }); L.toast(view, (j >= 0 ? 'Reversed: ' : 'Added ') + a + ' → ' + b + '.');
    }
    st.touched = true; recompute();
  }
  function layout(w, h) {
    if (w >= 700) { var lw = Math.round(w * 0.56); return { wide: true, dag: { x: 0, y: 0, w: lw, h: h }, pa: { x: lw + 6, y: 54, w: w - lw - 16, h: Math.round((h - 64) * 0.5) }, es: { x: lw + 6, y: 54 + Math.round((h - 64) * 0.5) + 8, w: w - lw - 16, h: h - 64 - Math.round((h - 64) * 0.5) - 8 } }; }
    var a = Math.round(h * 0.5), b = Math.round(h * 0.2); return { wide: false, dag: { x: 0, y: 0, w: w, h: a }, pa: { x: 6, y: a + 2, w: w - 12, h: b - 6 }, es: { x: 6, y: a + b, w: w - 12, h: h - a - b - 6 } };
  }
  function npos(n) { return { x: DA.x + 40 + n.x * (DA.w - 80), y: DA.y + 60 + n.y * (DA.h - 120) }; }
  function nodeAt(x, y) { var best = null, bd = 34 * 34; g.nodes.forEach(function (n) { var p = npos(n), q = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (q < bd) { bd = q; best = n; } }); return best; }
  function arrow(c, a, b, col, lw, rad) {
    var dx = b.x - a.x, dy = b.y - a.y, L2 = Math.hypot(dx, dy), ux = dx / L2, uy = dy / L2, x0 = a.x + ux * rad, y0 = a.y + uy * rad, x1 = b.x - ux * (rad + 3), y1 = b.y - uy * (rad + 3);
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - ux * 8, y1 - uy * 8); c.stroke();
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - ux * 12 - uy * 6, y1 - uy * 12 + ux * 6); c.lineTo(x1 - ux * 12 + uy * 6, y1 - uy * 12 - ux * 6); c.closePath(); c.fill();
  }
  function draw() {
    G.fit(); var c = ctx, w = G.w, h = G.h; c.clearRect(0, 0, w, h);
    var Lo = layout(w, h); DA = Lo.dag; var rad = Lo.wide ? 27 : 22;
    // path underlays
    R.paths.forEach(function (pp, k) {
      var col = pp.p.causal ? (pp.b.blocked ? 'rgba(99,230,190,.12)' : 'rgba(99,230,190,.28)') : pp.b.blocked ? 'rgba(143,179,198,.10)' : 'rgba(255,135,135,.32)';
      if (hoverPath === k) col = pp.p.causal ? 'rgba(99,230,190,.55)' : 'rgba(255,135,135,.6)';
      c.save(); c.strokeStyle = col; c.lineWidth = hoverPath === k ? 16 : 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
      pp.p.nodes.forEach(function (id, i) { var n = g.nodes.filter(function (q) { return q.id === id; })[0], p = npos(n); if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.stroke(); c.restore();
    });
    g.edges.forEach(function (e) { var a = g.nodes.filter(function (n) { return n.id === e.from; })[0], b = g.nodes.filter(function (n) { return n.id === e.to; })[0]; arrow(c, npos(a), npos(b), 'rgba(219,231,239,.85)', 2, rad); });
    g.nodes.forEach(function (n) {
      var p = npos(n), col = n.id === 'D' ? C.gold : n.id === 'Y' ? C.blue : n.obs ? C.violet : C.muted, ctl = st.Z[n.id];
      if (ctl) { rr(c, p.x - rad - 6, p.y - rad - 6, 2 * rad + 12, 2 * rad + 12, 10); c.fillStyle = 'rgba(99,230,190,.15)'; c.fill(); c.strokeStyle = C.green; c.lineWidth = 2.5; c.stroke(); }
      c.beginPath(); c.arc(p.x, p.y, rad, 0, TAU); c.fillStyle = n.obs ? rgba(col, 0.22) : 'rgba(143,179,198,.08)'; c.fill();
      c.save(); c.strokeStyle = st.sel === n.id ? '#fff' : col; c.lineWidth = st.sel === n.id ? 3.5 : 2.2; if (!n.obs) c.setLineDash([5, 4]); c.stroke(); c.restore();
      txt(c, n.id, p.x, p.y + 6, { size: Lo.wide ? 17 : 14, weight: 700, col: col, align: 'center' });
      txt(c, n.label + (n.obs ? '' : ' (unseen)'), p.x, p.y + rad + (ctl ? 22 : 15), { size: 11, col: C.ink, align: 'center' });
      if (ctl) txt(c, 'controlled', p.x, p.y - rad - 10, { size: 10, weight: 700, col: C.green, align: 'center' });
    });
    txt(c, st.mode === 'arrow' ? (st.sel ? 'now click the node the arrow should point to' : 'click the node the arrow starts from') : 'click a node to control for it · drag to move', DA.x + DA.w / 2, DA.y + DA.h - 10, { size: 11, col: C.muted, align: 'center', max: DA.w - 20 });
    drawPaths(c, Lo.pa); drawEst(c, Lo.es);
    hud.innerHTML = '<b>' + M.PRESETS[st.preset].name + '</b> · ' + (st.mode === 'arrow' ? 'drawing arrows' : 'choosing controls');
  }
  var pathRows = [];
  function drawPaths(c, A) {
    card(c, A.x, A.y, A.w, A.h, 'EVERY PATH FROM D TO Y');
    var y = A.y + 38, lh = Math.min(22, (A.h - 44) / Math.max(1, R.paths.length)); pathRows = [];
    R.paths.forEach(function (pp, k) {
      var s = 'D', p = pp.p; p.steps.forEach(function (st2) { s += (st2.fwd ? ' → ' : ' ← ') + st2.to; });
      var tag = p.causal ? (pp.b.blocked ? 'causal, BLOCKED by ' + pp.b.at : 'causal ✓') : pp.b.blocked ? 'back door, blocked at ' + pp.b.at + (pp.b.why === 'collider' ? ' (collider)' : '') : 'back door, OPEN';
      var col = p.causal ? (pp.b.blocked ? C.orange : C.green) : pp.b.blocked ? C.muted : C.red;
      if (y > A.y + A.h - 4) return;
      txt(c, s, A.x + 10, y, { size: 12, mono: true, col: C.ink, max: A.w * 0.48 });
      txt(c, tag, A.x + A.w - 10, y, { size: 11, weight: 700, col: col, align: 'right', max: A.w * 0.5 });
      pathRows.push({ y0: y - lh + 4, y1: y + 4, k: k }); y += lh;
    });
  }
  function drawEst(c, A) {
    card(c, A.x, A.y, A.w, A.h, 'TRUE EFFECT vs YOUR REGRESSION (2,000 SIMULATED PEOPLE)');
    var vals = [0, R.truth, R.est - 2 * R.se, R.est + 2 * R.se, R.plim]; if (R.iv) vals.push(R.iv.b - 2 * R.iv.se, R.iv.b + 2 * R.iv.se);
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pd = (hi - lo) * 0.15 + 0.1;
    var P = Plot(A.x + 16, A.y + 30, A.w - 32, A.h - 58, [lo - pd, hi + pd], [0, 1]);
    axes(c, P, { xt: 5, yticks: [] });
    var rows = [['truth', R.truth, null, C.gold], ['your regression', R.est, R.se, Math.abs(R.plim - R.truth) > 0.05 ? C.red : C.green]];
    if (R.iv) rows.push(['IV with Z', R.iv.b, R.iv.se, C.violet]);
    var rh = P.h / (rows.length + 0.5);
    rows.forEach(function (r0, i) {
      var y = P.y + rh * (i + 0.75);
      if (r0[2]) { c.strokeStyle = r0[3]; c.lineWidth = 3; c.beginPath(); c.moveTo(P.X(r0[1] - 1.96 * r0[2]), y); c.lineTo(P.X(r0[1] + 1.96 * r0[2]), y); c.stroke(); }
      dot(c, P.X(r0[1]), y, 7, r0[3], '#06111a', 2);
      txt(c, r0[0] + ' ' + fmt(r0[1], 2), P.X(r0[1]) + (P.X(r0[1]) > P.x + P.w * 0.6 ? -12 : 12), y - 10, { size: 11, weight: 700, col: r0[3], align: P.X(r0[1]) > P.x + P.w * 0.6 ? 'right' : 'left' });
    });
    c.save(); c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,212,121,.5)'; c.beginPath(); c.moveTo(P.X(R.truth), P.y); c.lineTo(P.X(R.truth), P.y + P.h); c.stroke(); c.restore();
  }
  pointer(cv, {
    down: function (x, y) { var n = nodeAt(x, y); downP = { x: x, y: y, n: n, moved: false }; if (n) { dragN = n; return true; } var hit = pathRows.filter(function (r0) { return y > r0.y0 && y < r0.y1 && x > 0; })[0]; if (hit) { hoverPath = hit.k; dirty = true; } return false; },
    drag: function (x, y) {
      if (!dragN || !DA) return; if (Math.abs(x - downP.x) + Math.abs(y - downP.y) > 5) downP.moved = true;
      if (downP.moved) { dragN.x = clamp((x - DA.x - 40) / (DA.w - 80), 0, 1); dragN.y = clamp((y - DA.y - 60) / (DA.h - 120), 0, 1); dirty = true; }
    },
    up: function () {
      if (dragN && !downP.moved) clickNode(dragN);
      dragN = null;
    },
    hover: function (x, y) {
      var n = nodeAt(x, y); cv.style.cursor = n ? 'pointer' : 'default';
      var k = -1; pathRows.forEach(function (r0) { if (y > r0.y0 && y < r0.y1 && x > (G.w >= 700 ? G.w * 0.56 : 0)) k = r0.k; });
      if (k !== hoverPath) { hoverPath = k; dirty = true; }
    }
  });
  function clickNode(n) {
    if (st.mode === 'arrow') {
      if (!st.sel) { st.sel = n.id; dirty = true; return; }
      var a = st.sel; st.sel = null; toggleArrow(a, n.id); dirty = true; return;
    }
    if (n.id === 'D' || n.id === 'Y') { L.toast(view, n.id === 'D' ? 'D is the treatment: it’s always in the regression.' : 'Y is the outcome.'); return; }
    if (!n.obs) { L.toast(view, n.label + ' is unobserved: you can’t control for it.'); return; }
    st.touched = true; st.Z[n.id] = st.Z[n.id] ? 0 : 1; syncForms(); recompute();
  }
  var markPre = seg($('ec17-pre'), 'data-p', st.preset, function (v) { st.touched = true; setPreset(v); });
  var markMode = seg($('ec17-mode'), 'data-m', st.mode, function (v) { st.mode = v; st.sel = null; dirty = true; });
  $('ec17-addarrow').addEventListener('click', function () { toggleArrow($('ec17-from').value, $('ec17-to').value); });
  $('ec17-best').addEventListener('click', function () { st.touched = true; var s0 = R.sets[0]; if (!s0) { L.toast(view, 'No set of observed variables works here.'); return; } st.Z = {}; s0.forEach(function (k) { st.Z[k] = 1; }); syncForms(); recompute(); });
  $('ec17-reset').addEventListener('click', function () { setPreset(st.preset); });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, nodes = g.nodes.filter(function (n) { return n.id !== 'D' && n.id !== 'Y'; }), i = parseInt(k, 10);
    if (i >= 1 && i <= nodes.length) { clickNode(nodes[i - 1]); e.preventDefault(); }
  });

  /* =========================================================================================
     2. Matching and propensity scores
     ========================================================================================= */
  var ma = { s: 1, n: 1000, cal: false, seed: 11, touched: false }, mcv = $('ec17-mc'), MG = L.canvas(mcv), md, me, mdirty = true;
  function maFit() {
    md = M.matchData({ n: ma.n, s: ma.s }, ma.seed); me = M.matchEst(md, { caliper: ma.cal ? 0.02 : 0 }); mdirty = true;
    var mx = Math.max.apply(null, Object.keys(me.bal).map(function (k) { return Math.abs(me.bal[k].after); }));
    dl($('ec17-maread'), [
      ['True ATT / ATE', fmt(me.trueATT, 2) + ' / ' + fmt(me.trueATE, 2)],
      ['Naive difference in means', fmt(me.naive, 2), 'ec17-bad'],
      ['Matching on the score (ATT)', fmt(me.att, 2)],
      ['Weighting (IPW): ATT / ATE', fmt(me.ipwATT, 2) + ' / ' + fmt(me.ipwATE, 2)],
      ['Regression adjustment', fmt(me.reg, 2)],
      ['Largest |SMD| after matching', fmt(mx, 3), mx < 0.1 ? 'ec17-good' : 'ec17-bad'],
      ['Treated matched / dropped', (me.T.length - me.dropped) + ' / ' + me.dropped],
      ['Largest IPW weight', fmt(me.maxW, 1)]
    ]);
    if (ma.touched && ma.s >= 1 && mx < 0.1) win('balance', 'Balanced: largest standardized difference ' + fmt(mx, 3) + '. Matching estimate ' + fmt(me.att, 2) + ' vs true ATT ' + fmt(me.trueATT, 2) + '.', $('ec17-mav'));
  }
  function maDraw() {
    MG.fit(); var c = MG.c, w = MG.w, h = MG.h; c.clearRect(0, 0, w, h);
    var wide = w >= 700, A1, A2, A3;
    if (wide) { var a = Math.round(w * 0.36), b = Math.round(w * 0.3); A1 = { x: 8, y: 8, w: a, h: h - 16 }; A2 = { x: a + 16, y: 8, w: b, h: h - 16 }; A3 = { x: a + b + 24, y: 8, w: w - a - b - 32, h: h - 16 }; }
    else { var hh = Math.round((h - 24) / 3); A1 = { x: 6, y: 6, w: w - 12, h: hh }; A2 = { x: 6, y: hh + 12, w: w - 12, h: hh }; A3 = { x: 6, y: 2 * hh + 18, w: w - 12, h: h - 2 * hh - 24 }; }
    // overlap
    card(c, A1.x, A1.y, A1.w, A1.h, 'OVERLAP: PROPENSITY SCORES');
    var nb = 25, t = me.T.map(function (i) { return me.ps[i]; }), cc = me.C.map(function (i) { return me.ps[i]; }), ct = counts(t, 0, 1, nb), cc2 = counts(cc, 0, 1, nb), mx = Math.max.apply(null, ct.concat(cc2)) || 1;
    var P = Plot(A1.x + 18, A1.y + 30, A1.w - 30, A1.h - 56, [0, 1], [-mx, mx]);
    axes(c, P, { xticks: [0, 0.25, 0.5, 0.75, 1], yticks: [], xf: function (v) { return fmt(v, 2); } });
    var bw = P.w / nb;
    for (var k = 0; k < nb; k++) { if (ct[k]) { c.fillStyle = rgba(C.gold, 0.75); c.fillRect(P.x + k * bw + 0.5, P.Y(ct[k]), bw - 1, P.Y(0) - P.Y(ct[k])); } if (cc2[k]) { c.fillStyle = rgba(C.blue, 0.65); c.fillRect(P.x + k * bw + 0.5, P.Y(0), bw - 1, P.Y(-cc2[k]) - P.Y(0)); } }
    c.strokeStyle = 'rgba(219,231,239,.5)'; c.beginPath(); c.moveTo(P.x, P.Y(0)); c.lineTo(P.x + P.w, P.Y(0)); c.stroke();
    txt(c, 'treated ↑', P.x + 4, P.y + 12, { size: 11, weight: 700, col: C.gold }); txt(c, 'untreated ↓', P.x + 4, P.y + P.h - 4, { size: 11, weight: 700, col: C.blue });
    // love plot
    card(c, A2.x, A2.y, A2.w, A2.h, 'BALANCE: STANDARDIZED DIFFERENCES');
    var keys = Object.keys(me.bal), m2 = 0.2; keys.forEach(function (q) { m2 = Math.max(m2, Math.abs(me.bal[q].before), Math.abs(me.bal[q].after)); });
    var Q = Plot(A2.x + 44, A2.y + 30, A2.w - 56, A2.h - 74, [-m2 * 1.1, m2 * 1.1], [0, keys.length]);
    axes(c, Q, { xt: 4, yticks: [], xf: function (v) { return fmt(v, 1); } });
    c.fillStyle = 'rgba(99,230,190,.10)'; c.fillRect(Q.X(-0.1), Q.y, Q.X(0.1) - Q.X(-0.1), Q.h);
    keys.forEach(function (q, i) { var y = Q.Y(keys.length - i - 0.5); txt(c, q, Q.x - 6, y + 4, { size: 11, col: C.ink, align: 'right' }); var b0 = me.bal[q].before, b1 = me.bal[q].after; c.strokeStyle = 'rgba(219,231,239,.3)'; c.beginPath(); c.moveTo(Q.X(b0), y); c.lineTo(Q.X(b1), y); c.stroke(); dot(c, Q.X(b0), y, 5, C.red); dot(c, Q.X(b1), y, 5, C.green, '#06111a', 1.5); });
    txt(c, '● before', A2.x + 10, A2.y + A2.h - 10, { size: 10.5, col: C.red }); txt(c, '● after matching', A2.x + 66, A2.y + A2.h - 10, { size: 10.5, col: C.green }); txt(c, 'band ±0.1', A2.x + A2.w - 10, A2.y + A2.h - 10, { size: 10.5, col: C.muted, align: 'right' });
    // estimates
    card(c, A3.x, A3.y, A3.w, A3.h, 'ESTIMATES vs TRUTH');
    var est = [['naive', me.naive, C.red], ['regression', me.reg, C.orange], ['matching (ATT)', me.att, C.green], ['IPW (ATT)', me.ipwATT, C.green], ['IPW (ATE)', me.ipwATE, C.violet]];
    var vv = est.map(function (e) { return e[1]; }).concat([me.trueATT, me.trueATE, 0]), lo = Math.min.apply(null, vv), hi = Math.max.apply(null, vv);
    var E2 = Plot(A3.x + 96, A3.y + 30, A3.w - 110, A3.h - 58, [Math.min(0, lo) - 0.2, hi + 0.3], [0, est.length]);
    axes(c, E2, { xt: 4, yticks: [] });
    [[me.trueATT, C.gold, 'true ATT'], [me.trueATE, C.violet, 'true ATE']].forEach(function (q, i) { c.save(); c.setLineDash([4, 4]); c.strokeStyle = q[1]; c.beginPath(); c.moveTo(E2.X(q[0]), E2.y); c.lineTo(E2.X(q[0]), E2.y + E2.h); c.stroke(); c.restore(); txt(c, q[2], E2.X(q[0]) + 3, E2.y + 10 + i * 12, { size: 10, col: q[1] }); });
    est.forEach(function (e, i) { var y = E2.Y(est.length - i - 0.5); txt(c, e[0], E2.x - 6, y + 4, { size: 11, col: C.ink, align: 'right' }); c.fillStyle = rgba(e[2], 0.75); c.fillRect(E2.X(0), y - 6, E2.X(e[1]) - E2.X(0), 12); });
  }
  slider('ec17-mas', function () { return ma.s; }, function (v) { ma.touched = true; ma.s = v; maFit(); }, function (v) { return fmt(v, 1); });
  slider('ec17-man', function () { return ma.n; }, function (v) { ma.touched = true; ma.n = v; maFit(); }, function (v) { return String(v); });
  var cCal = $('ec17-macal'); cCal.addEventListener('change', function () { ma.touched = true; ma.cal = cCal.checked; maFit(); });
  $('ec17-manew').addEventListener('click', function () { ma.touched = true; ma.seed = 1 + Math.floor(Math.random() * 1e8); maFit(); });

  /* =========================================================================================
     3. Synthetic control
     ========================================================================================= */
  var EFF = { none: function () { return 0; }, drop: function () { return -3; }, grow: function (e) { return -0.6 * (e + 1); } };
  var sc = { eff: 'grow', seed: 3, w: null, plac: null, anim: 0, touched: false }, scv = $('ec17-scc'), SG = L.canvas(scv), sd, sdirty = true, WB = null, wdrag = -1;
  var J = 15, TT = 30, T0 = 20;
  function scData() { sd = M.synthData({ J: J, T: TT, T0: T0, sd: 0.5, trueW: { 2: 0.5, 5: 0.3, 9: 0.2 }, effect: EFF[sc.eff] }, sc.seed); sc.w = new Array(J).fill(1 / J); sc.plac = null; scRead(); sdirty = true; }
  function donors() { var d0 = []; for (var j = 1; j <= J; j++) d0.push(j); return d0; }
  function scStats() {
    var sp = M.synthPath(sd.Y, donors(), sc.w), pre = M.rmspe(sd.Y, 0, donors(), sc.w, 0, T0), gap = sd.Y[0].map(function (v, t) { return v - sp[t]; });
    return { sp: sp, pre: pre, gap: gap, est: S.mean(gap.slice(T0)), truth: S.mean(sd.eff.slice(T0)) };
  }
  function scRead() {
    var s = scStats(), rows = [['Fit before the policy (RMSPE)', fmt(s.pre, 2), s.pre < 0.6 ? 'ec17-good' : ''], ['Average gap after the policy', fmt(s.est, 2)], ['True average effect', fmt(s.truth, 2)],
      ['Largest weights', sc.w.map(function (v, i) { return [v, i + 1]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 3).map(function (q) { return 'unit ' + q[1] + ': ' + fmt(q[0], 2); }).join(', ')]];
    if (sc.plac) rows.push(['Placebo rank (post/pre ratio)', sc.plac.rank + ' of ' + (J + 1) + ' → p = ' + fmt(sc.plac.rank / (J + 1), 3)]);
    dl($('ec17-scread'), rows);
    if (sc.touched && sc.eff !== 'none' && s.pre < 0.6 && Math.abs(s.est - s.truth) <= 0.25 * Math.abs(s.truth)) win('synth', 'The twin tracks the past (error ' + fmt(s.pre, 2) + ') and puts the effect at ' + fmt(s.est, 2) + ' vs the true ' + fmt(s.truth, 2) + '.', $('ec17-scv'));
  }
  function scOptimize() { // animate the optimizer: a few accelerated steps per frame, starting from the current weights
    sc.touched = true; sc.anim = reduced ? 1 : 40; sc.plac = null;
  }
  function scPlacebos() {
    sc.touched = true; var ratio = [];
    for (var k = 0; k <= J; k++) { var f = k === 0 ? { w: sc.w, donors: donors(), rmspe: M.rmspe(sd.Y, 0, donors(), sc.w, 0, T0) } : M.synthFit(sd.Y, k, T0, null, 1200); ratio.push({ r: M.rmspe(sd.Y, k, f.donors, f.w, T0, TT) / f.rmspe, gap: sd.Y[k].map(function (v, t) { return v - M.synthPath(sd.Y, f.donors, f.w)[t]; }) }); }
    sc.plac = { list: ratio, rank: ratio.filter(function (q) { return q.r >= ratio[0].r; }).length };
    scRead(); sdirty = true;
  }
  function scDraw() {
    SG.fit(); var c = SG.c, w = SG.w, h = SG.h; c.clearRect(0, 0, w, h);
    var wide = w >= 700, A1, A2, A3;
    if (wide) { var lw = Math.round(w * 0.56), h2 = Math.round((h - 24) * 0.45); A1 = { x: 8, y: 8, w: lw, h: h - 16 }; A2 = { x: lw + 16, y: 8, w: w - lw - 24, h: h2 }; A3 = { x: lw + 16, y: h2 + 16, w: w - lw - 24, h: h - h2 - 24 }; }
    else { var a = Math.round(h * 0.42), b = Math.round(h * 0.26); A1 = { x: 6, y: 6, w: w - 12, h: a - 6 }; A2 = { x: 6, y: a + 4, w: w - 12, h: b - 6 }; A3 = { x: 6, y: a + b + 2, w: w - 12, h: h - a - b - 8 }; }
    var s = scStats(), all = []; sd.Y.forEach(function (r) { all = all.concat(r); });
    card(c, A1.x, A1.y, A1.w, A1.h, 'THE TREATED STATE, ITS SYNTHETIC TWIN, AND 15 DONORS');
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), ts = []; for (var t = 0; t < TT; t++) ts.push(t + 1);
    var P = Plot(A1.x + 40, A1.y + 30, A1.w - 52, A1.h - 58, [1, TT], [lo - 1, hi + 1]);
    axes(c, P, { xt: 6, yt: 4, xlab: 'year' });
    for (var j = 1; j <= J; j++) curve(c, P, ts, sd.Y[j], rgba(C.muted, 0.18 + 0.6 * sc.w[j - 1]), 1 + 2 * sc.w[j - 1]);
    c.save(); c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,212,121,.5)'; c.beginPath(); c.moveTo(P.X(T0 + 0.5), P.y); c.lineTo(P.X(T0 + 0.5), P.y + P.h); c.stroke(); c.restore();
    txt(c, 'policy', P.X(T0 + 0.5) + 4, P.y + 10, { size: 10.5, col: C.gold });
    curve(c, P, ts, s.sp, C.green, 2.6, [7, 5]); curve(c, P, ts, sd.Y[0], C.gold, 3);
    txt(c, 'treated', P.x + 4, P.y + 10, { size: 11, weight: 700, col: C.gold }); txt(c, 'synthetic twin', P.x + 56, P.y + 10, { size: 11, weight: 700, col: C.green });
    // weights (draggable)
    card(c, A2.x, A2.y, A2.w, A2.h, 'WEIGHTS ON EACH DONOR (drag a bar)');
    WB = Plot(A2.x + 30, A2.y + 30, A2.w - 42, A2.h - 54, [0.5, J + 0.5], [0, Math.max(0.5, Math.max.apply(null, sc.w) * 1.15)]);
    axes(c, WB, { xticks: [1, 5, 10, 15], yt: 2, noXgrid: true, yf: function (v) { return fmt(v, 1); } });
    var bw = WB.w / J * 0.7;
    sc.w.forEach(function (v, i) { var x = WB.X(i + 1); c.fillStyle = wdrag === i ? C.pink : rgba(C.green, 0.75); c.fillRect(x - bw / 2, WB.Y(v), bw, WB.Y(0) - WB.Y(v)); });
    // gaps
    card(c, A3.x, A3.y, A3.w, A3.h, sc.plac ? 'GAPS: TREATED (gold) vs 15 PLACEBOS' : 'GAP = TREATED − TWIN');
    var gs = s.gap.slice(); if (sc.plac) sc.plac.list.forEach(function (q) { gs = gs.concat(q.gap); });
    var gm = Math.max(1, Math.max.apply(null, gs.map(Math.abs))) * 1.1;
    var Q = Plot(A3.x + 36, A3.y + 30, A3.w - 48, A3.h - 56, [1, TT], [-gm, gm]);
    axes(c, Q, { xt: 4, yt: 4, xlab: 'year' });
    c.save(); c.strokeStyle = 'rgba(219,231,239,.4)'; c.beginPath(); c.moveTo(Q.x, Q.Y(0)); c.lineTo(Q.x + Q.w, Q.Y(0)); c.stroke(); c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,212,121,.5)'; c.beginPath(); c.moveTo(Q.X(T0 + 0.5), Q.y); c.lineTo(Q.X(T0 + 0.5), Q.y + Q.h); c.stroke(); c.restore();
    if (sc.plac) sc.plac.list.slice(1).forEach(function (q) { curve(c, Q, ts, q.gap, 'rgba(143,179,198,.35)', 1.2); });
    curve(c, Q, ts, sd.eff, rgba(C.pink, 0.8), 1.6, [3, 3]);
    curve(c, Q, ts, s.gap, C.gold, 2.6);
    txt(c, 'pink dashed: true effect', Q.x + Q.w - 4, Q.y + Q.h - 6, { size: 10.5, col: C.pink, align: 'right' });
  }
  pointer(scv, {
    down: function (x, y) { if (!WB || !WB.inside(x, y + 4)) return false; wdrag = clamp(Math.round(WB.iX(x)) - 1, 0, J - 1); setW(y); return true; },
    drag: function (x, y) { if (wdrag >= 0) setW(y); },
    up: function () { wdrag = -1; sdirty = true; scRead(); }
  });
  function setW(y) { // set one weight, scale the others so the weights still add to 1
    sc.touched = true; var v = clamp(WB.iY(y), 0, 1), rest = 1 - sc.w[wdrag], i;
    for (i = 0; i < J; i++) if (i !== wdrag) sc.w[i] = rest > 1e-9 ? sc.w[i] * (1 - v) / rest : (1 - v) / (J - 1);
    sc.w[wdrag] = v; sc.plac = null; sdirty = true; scRead();
  }
  seg($('ec17-sceff'), 'data-e', sc.eff, function (v) { sc.touched = true; sc.eff = v; scData(); });
  $('ec17-scfit').addEventListener('click', scOptimize);
  $('ec17-sceq').addEventListener('click', function () { sc.touched = true; sc.w = new Array(J).fill(1 / J); sc.plac = null; scRead(); sdirty = true; });
  $('ec17-scplac').addEventListener('click', scPlacebos);
  $('ec17-scnew').addEventListener('click', function () { sc.touched = true; sc.seed = 1 + Math.floor(Math.random() * 1e8); scData(); });

  /* =========================================================================================
     4. LASSO and double/debiased machine learning
     ========================================================================================= */
  var ml = { lam: 0.15, seed: 21, mc: null }, lcv = $('ec17-lc'), LG = L.canvas(lcv), lp = null, ldirty = true;
  function mlData() {
    var Dd = M.dmlData({ n: 1100, p: 50, theta: 1 }, ml.seed), X = Dd.X.map(function (r, i) { return [Dd.d[i]].concat(r); });
    var tr = X.slice(0, 100), ytr = Dd.y.slice(0, 100), te = X.slice(100), yte = Dd.y.slice(100), s = M.standardize(tr), lmax = M.lambdaMax(tr, ytr), lams = [];
    for (var k = 0; k < 40; k++) lams.push(lmax * Math.pow(0.002, k / 39));
    var path = M.lassoPath(tr, ytr, lams), ym = S.mean(ytr);
    function r2(b, X0, y0) { var m = S.mean(y0), a = 0, c0 = 0; X0.forEach(function (row, i) { var q = ym; for (var j = 0; j < row.length; j++) q += (row[j] - s.mu[j]) / s.sd[j] * b[j]; a += Math.pow(y0[i] - q, 2); c0 += Math.pow(y0[i] - m, 2); }); return 1 - a / c0; }
    lp = { lams: lams, path: path, train: path.map(function (b) { return r2(b, tr, ytr); }), test: path.map(function (b) { return r2(b, te, yte); }), nz: path.map(function (b) { return b.filter(function (v) { return v !== 0; }).length; }) };
    ldirty = true; mlRead();
  }
  function lamIdx() { var best = 0, bd = Infinity; lp.lams.forEach(function (l, i) { var d = Math.abs(Math.log(l) - Math.log(ml.lam)); if (d < bd) { bd = d; best = i; } }); return best; }
  function mlRead() {
    var i = lamIdx(), rows = [['λ (penalty)', fmt(lp.lams[i], 3)], ['Variables kept (of 51)', String(lp.nz[i])], ['R² on the 100 training rows', fmt(lp.train[i], 3)], ['R² on 1,000 new rows', fmt(lp.test[i], 3), lp.test[i] < lp.train[i] - 0.08 ? 'ec17-bad' : '']];
    if (ml.mc && ml.mc.n) { var m = ml.mc; rows.push(['Naive selection: mean, coverage', fmt(S.mean(m.nv), 3) + ', ' + Math.round(m.cn / m.n * 100) + '%']); rows.push(['Double ML: mean, coverage', fmt(S.mean(m.dm), 3) + ', ' + Math.round(m.cd / m.n * 100) + '%']); }
    dl($('ec17-mlread'), rows);
  }
  function mlMC() {
    ml.mc = { n: 0, R: 200, nv: [], dm: [], cn: 0, cd: 0 };
    (function pump() {
      var m = ml.mc, t0 = Date.now();
      while (m.n < m.R && Date.now() - t0 < 30) { var Dd = M.dmlData({ n: 400, p: 50, theta: 1 }, 31000 + m.n * 7), a = M.naiveSelect(Dd), b = M.dml(Dd, 2, m.n); m.nv.push(a.theta); m.dm.push(b.theta); if (Math.abs(a.theta - 1) < 1.96 * a.se) m.cn++; if (Math.abs(b.theta - 1) < 1.96 * b.se) m.cd++; m.n++; }
      ldirty = true; mlRead();
      if (m.n < m.R) setTimeout(pump, 10);
      else { var cd = m.cd / m.n, cn = m.cn / m.n; if (cd >= 0.88 && cd <= 0.99 && cn < 0.5) win('dml', 'Double ML covered the truth ' + Math.round(cd * 100) + '% of the time; naive selection ' + Math.round(cn * 100) + '%.', $('ec17-mlv')); }
    })();
  }
  function mlDraw() {
    LG.fit(); var c = LG.c, w = LG.w, h = LG.h; c.clearRect(0, 0, w, h);
    var wide = w >= 700, A1, A2, A3;
    if (wide) { var lw = Math.round(w * 0.55), h1 = Math.round((h - 24) * 0.58); A1 = { x: 8, y: 8, w: lw, h: h1 }; A2 = { x: 8, y: h1 + 16, w: lw, h: h - h1 - 24 }; A3 = { x: lw + 16, y: 8, w: w - lw - 24, h: h - 16 }; }
    else { var a = Math.round(h * 0.34), b = Math.round(h * 0.26); A1 = { x: 6, y: 6, w: w - 12, h: a - 6 }; A2 = { x: 6, y: a + 4, w: w - 12, h: b - 6 }; A3 = { x: 6, y: a + b + 2, w: w - 12, h: h - a - b - 8 }; }
    var xl = lp.lams.map(Math.log), li = lamIdx();
    card(c, A1.x, A1.y, A1.w, A1.h, 'LASSO COEFFICIENT PATHS (51 VARIABLES, 100 ROWS)');
    var mx = 0; lp.path.forEach(function (b) { b.forEach(function (v) { mx = Math.max(mx, Math.abs(v)); }); });
    var P = Plot(A1.x + 40, A1.y + 30, A1.w - 52, A1.h - 56, [xl[xl.length - 1], xl[0]], [-mx * 1.05, mx * 1.05]);
    axes(c, P, { xt: 4, yt: 4, xlab: 'penalty λ (log scale) → more shrinkage', xf: function (v) { return fmt(Math.exp(v), 2); } });
    for (var j = 0; j < lp.path[0].length; j++) { var col = j === 0 ? C.gold : j <= 3 ? C.pink : j <= 6 ? C.blue : 'rgba(143,179,198,.4)'; curve(c, P, xl, lp.path.map(function (b) { return b[j]; }), col, j <= 6 ? 2 : 1); }
    c.save(); c.strokeStyle = C.ink; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(P.X(xl[li]), P.y); c.lineTo(P.X(xl[li]), P.y + P.h); c.stroke(); c.restore();
    var ly = P.y + P.h - 6; txt(c, 'd', P.x + 4, ly, { size: 11, weight: 700, col: C.gold }); txt(c, 'x₁–x₃ (drive d)', P.x + 16, ly, { size: 11, weight: 700, col: C.pink }); txt(c, 'x₄–x₆ (drive y)', P.x + 120, ly, { size: 11, weight: 700, col: C.blue });
    card(c, A2.x, A2.y, A2.w, A2.h, 'FIT: TRAINING R² vs NEW-DATA R²');
    var Q = Plot(A2.x + 40, A2.y + 30, A2.w - 52, A2.h - 56, P.xr, [Math.max(-0.5, Math.min.apply(null, lp.test) - 0.05), 1]);
    axes(c, Q, { xt: 4, yt: 3, xf: function (v) { return fmt(Math.exp(v), 2); } });
    curve(c, Q, xl, lp.train, C.orange, 2.2); curve(c, Q, xl, lp.test, C.green, 2.6);
    c.save(); c.strokeStyle = C.ink; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(Q.X(xl[li]), Q.y); c.lineTo(Q.X(xl[li]), Q.y + Q.h); c.stroke(); c.restore();
    txt(c, 'training', Q.x + 4, Q.y + Q.h - 6, { size: 11, weight: 700, col: C.orange }); txt(c, 'new data', Q.x + 64, Q.y + Q.h - 6, { size: 11, weight: 700, col: C.green });
    card(c, A3.x, A3.y, A3.w, A3.h, 'ESTIMATING θ = 1: ' + (ml.mc ? ml.mc.n : 0) + ' STUDIES (n = 400)');
    if (!ml.mc) { txt(c, 'Press “Run 200 studies”.', A3.x + A3.w / 2, A3.y + A3.h / 2, { size: 12, col: C.muted, align: 'center' }); return; }
    var R3 = Plot(A3.x + 16, A3.y + 46, A3.w - 32, A3.h - 76, [0.6, 1.5], [0, 1]), nb = 30, c1 = counts(ml.mc.nv, 0.6, 1.5, nb), c2 = counts(ml.mc.dm, 0.6, 1.5, nb), m3 = Math.max.apply(null, c1.concat(c2)) || 1; R3.yr = [0, m3 * 1.1];
    axes(c, R3, { xt: 4, yticks: [] });
    var bw3 = R3.w / nb;
    c1.forEach(function (k, i) { if (!k) return; var y = R3.Y(k); c.fillStyle = rgba(C.red, 0.55); c.fillRect(R3.x + i * bw3 + 0.5, y, bw3 - 1, R3.y + R3.h - y); });
    c2.forEach(function (k, i) { if (!k) return; var y = R3.Y(k); c.fillStyle = rgba(C.green, 0.6); c.fillRect(R3.x + i * bw3 + 0.5, y, bw3 - 1, R3.y + R3.h - y); });
    c.save(); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(R3.X(1), R3.y - 6); c.lineTo(R3.X(1), R3.y + R3.h); c.stroke(); c.restore();
    txt(c, 'naive selection', A3.x + 10, A3.y + 34, { size: 11, weight: 700, col: C.red }); txt(c, 'double ML', A3.x + 110, A3.y + 34, { size: 11, weight: 700, col: C.green }); txt(c, 'truth', R3.X(1) + 4, R3.y + 4, { size: 10.5, col: C.gold });
  }
  slider('ec17-lam', function () { return Math.log10(ml.lam); }, function (v) { ml.lam = Math.pow(10, v); ldirty = true; mlRead(); }, function (v) { return fmt(Math.pow(10, v), 3); });
  $('ec17-mlnew').addEventListener('click', function () { ml.seed = 1 + Math.floor(Math.random() * 1e8); mlData(); });
  $('ec17-mlmc').addEventListener('click', mlMC);

  /* ---------- start ---------- */
  setPreset(st.preset); maFit(); scData(); mlData();
  window.addEventListener('resize', function () { dirty = true; mdirty = true; sdirty = true; ldirty = true; });
  L.loop(function () { if (dirty) { draw(); dirty = false; } }, view);
  L.loop(function () { if (mdirty) { maDraw(); mdirty = false; } }, $('ec17-mav'));
  L.loop(function () {
    if (sc.anim > 0) { // 40 frames of optimizer steps from the current weights
      var f = M.synthFit(sd.Y, 0, T0, sc.w, reduced ? 3000 : 12); sc.w = f.w; sc.anim--; if (reduced) sc.anim = 0;
      if (sc.anim === 0) { f = M.synthFit(sd.Y, 0, T0, sc.w, 1500); sc.w = f.w; } scRead(); sdirty = true;
    }
    if (sdirty) { scDraw(); sdirty = false; }
  }, $('ec17-scv'));
  L.loop(function () { if (ldirty) { mlDraw(); ldirty = false; } }, $('ec17-mlv'));
})();
