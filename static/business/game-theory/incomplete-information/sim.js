/* Game Theory, Chapter 8: Incomplete Information and Bayesian Games. Three interactive pieces:
   1. the market for lemons (main simulation, with missions), 2. Bayes' rule with a population of 1,000 cars,
   3. a Cournot duopoly where one firm's cost is private. The models are in model.js (window.GT8M), tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, M = W.GT8M, root = D.getElementById('gt8-lab');
  if (!root || !L || !M) return;
  /* ---------- drawing and UI helpers (the same in every Game Theory chapter from 8 on) ---------- */
  var fmt = L.fmt, reduced = L.reduced;
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', orange: '#ffa94d',
    ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', grid: 'rgba(120,170,200,.10)', panel: 'rgba(11,27,39,.92)', bg: '#06111a' };
  var FONT = 'system-ui,-apple-system,"Segoe UI",sans-serif', MONO = 'ui-monospace,Menlo,Consolas,monospace';
  function $(id) { return D.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function grp(v, d) { var s = fmt(v, d || 0), neg = s.charAt(0) === '−'; if (neg) s = s.slice(1); var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '−' : '') + p.join('.'); }
  function money(v, d) { var s = grp(Math.abs(v), d || 0); return (v < 0 && +Math.abs(v).toFixed(d || 0) !== 0 ? '−$' : '$') + s; }
  function pct(v, d) { return fmt(100 * v, d === undefined ? 0 : d) + '%'; }
  function label(c, text, x, y, col, o) {
    o = o || {};
    c.save(); c.font = (o.bold ? '600 ' : '') + (o.size || 12) + 'px ' + (o.mono ? MONO : FONT);
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (o.max) { var tw = c.measureText(text).width; if (tw > o.max) { var sc = o.max / tw; c.font = (o.bold ? '600 ' : '') + Math.max(8, (o.size || 12) * sc) + 'px ' + (o.mono ? MONO : FONT); } }
    if (!o.plain) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(6,17,26,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = col; c.fillText(text, x, y); c.restore();
  }
  function textW(c, text, size, bold) { c.save(); c.font = (bold ? '600 ' : '') + (size || 12) + 'px ' + FONT; var w = c.measureText(text).width; c.restore(); return w; }
  function rrect(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function bg(c, w, h) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1c2a'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  function panelBox(c, x, y, w, h, title, col) {
    c.fillStyle = 'rgba(255,255,255,.035)'; c.strokeStyle = 'rgba(120,170,200,.16)'; c.lineWidth = 1; rrect(c, x, y, w, h, 10); c.fill(); c.stroke();
    if (title) label(c, title, x + 10, y + 13, col || C.muted, { size: 10.5, bold: true, max: w - 20 });
  }
  function dot(c, x, y, r, col, o) {
    o = o || {}; c.save(); if (o.glow) { c.shadowColor = col; c.shadowBlur = o.glow; }
    c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fillStyle = col; c.fill();
    if (o.ring) { c.shadowBlur = 0; c.lineWidth = o.lw || 2; c.strokeStyle = o.ring; c.stroke(); }
    c.restore();
  }
  function line(c, pts, col, lw, dash) {
    if (pts.length < 2) return; c.save(); c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.lineCap = 'round'; if (dash) c.setLineDash(dash);
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); c.restore();
  }
  function arrow(c, x, y, x2, y2, col, o) {
    o = o || {}; var dx = x2 - x, dy = y2 - y, len = Math.hypot(dx, dy); if (len < 2) return;
    var ux = dx / len, uy = dy / len, hw = o.head || 6, lw = o.width || 2;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2 - ux * hw * 1.2, y2 - uy * hw * 1.2); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - ux * hw * 1.9 - uy * hw * 0.8, y2 - uy * hw * 1.9 + ux * hw * 0.8); c.lineTo(x2 - ux * hw * 1.9 + uy * hw * 0.8, y2 - uy * hw * 1.9 - ux * hw * 0.8); c.closePath(); c.fill(); c.restore();
  }
  /* a plot area: box {x,y,w,h}, ranges [lo,hi]; draws grid, axes, ticks and titles; returns {X, Y, ix, iy} */
  function plot(c, b, xr, yr, o) {
    o = o || {};
    var X = function (v) { return b.x + (v - xr[0]) / (xr[1] - xr[0]) * b.w; }, Y = function (v) { return b.y + b.h - (v - yr[0]) / (yr[1] - yr[0]) * b.h; };
    var ix = function (px) { return xr[0] + (px - b.x) / b.w * (xr[1] - xr[0]); }, iy = function (py) { return yr[0] + (b.y + b.h - py) / b.h * (yr[1] - yr[0]); };
    c.save(); c.lineWidth = 1;
    var xt = o.xt || nice(xr, o.nx || 5), yt = o.yt || nice(yr, o.ny || 4);
    c.strokeStyle = C.grid; c.beginPath();
    xt.forEach(function (t) { c.moveTo(X(t), b.y); c.lineTo(X(t), b.y + b.h); }); yt.forEach(function (t) { c.moveTo(b.x, Y(t)); c.lineTo(b.x + b.w, Y(t)); }); c.stroke();
    c.strokeStyle = 'rgba(143,179,198,.55)'; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x, b.y + b.h); c.lineTo(b.x + b.w, b.y + b.h); c.stroke(); c.restore();
    var df = function (t) { return fmt(t, Math.abs(t - Math.round(t)) > 1e-9 ? (Math.abs(t * 10 - Math.round(t * 10)) > 1e-9 ? 2 : 1) : 0); }, xf = o.xf || df, yf = o.yf || df;
    if (!o.noXLabels) xt.forEach(function (t) { label(c, xf(t), X(t), b.y + b.h + 9, C.muted, { size: 10, align: 'center', plain: true }); });
    if (!o.noYLabels) yt.forEach(function (t) { label(c, yf(t), b.x - 5, Y(t), C.muted, { size: 10, align: 'right', plain: true }); });
    if (o.xl) label(c, o.xl, b.x + b.w - 2, b.y + b.h - 9, C.muted, { size: 10.5, align: 'right' });
    if (o.yl) label(c, o.yl, b.x + 2, b.y - 9, C.muted, { size: 10.5, plain: true });
    return { X: X, Y: Y, ix: ix, iy: iy, b: b };
  }
  function nice(r, n) {
    var span = r[1] - r[0], raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag, st = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag, out = [];
    for (var t = Math.ceil(r[0] / st - 1e-9) * st; t <= r[1] + st * 1e-6; t += st) out.push(+t.toFixed(10));
    return out;
  }
  function seg(groupEl, attr, val) { groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val))); }); }
  function readout(dl, rows) { dl.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd' + (r[2] ? ' style="color:' + r[2] + '"' : '') + '>' + r[1] + '</dd>'; }).join(''); }
  /* pointer dragging on a canvas: pick(x,y) returns a target or null; move(target,x,y); up(target) */
  function drag(cv, pick, move, up, hover) {
    var cur = null, id = null;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { var p = pos(e); cur = pick(p[0], p[1], e); if (cur === null || cur === undefined) return; id = e.pointerId; try { cv.setPointerCapture(id); } catch (er) { } e.preventDefault(); move(cur, p[0], p[1], e); });
    cv.addEventListener('pointermove', function (e) { var p = pos(e); if (cur !== null && cur !== undefined && e.pointerId === id) { move(cur, p[0], p[1], e); e.preventDefault(); } else if (hover) hover(p[0], p[1]); });
    function end(e) { if (cur !== null && cur !== undefined && e.pointerId === id) { var t = cur; cur = null; if (up) up(t); } }
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  }
  function celebrate(view, text) { L.toast(view, text); if (!reduced) { view.classList.remove('gt8-win'); void view.offsetWidth; view.classList.add('gt8-win'); } }
  /* seeded random numbers, so a "new round" button can be replayed in tests */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }


  function qColor(q, a) { var h = 4 + 128 * clamp(q / 10000, 0, 1); return 'hsla(' + h.toFixed(0) + ',78%,' + (60 + 4 * Math.sin(q / 10000 * 3)).toFixed(0) + '%,' + (a === undefined ? 1 : a) + ')'; }
  function drawCar(c, x, y, w, col, alpha, o) {
    o = o || {}; var h = w * 0.5;
    c.save(); c.globalAlpha = alpha; c.translate(x, y);
    // cabin
    c.fillStyle = col; c.beginPath(); c.moveTo(w * 0.24, h * 0.42); c.lineTo(w * 0.36, h * 0.1); c.lineTo(w * 0.68, h * 0.1); c.lineTo(w * 0.82, h * 0.42); c.closePath(); c.fill();
    c.fillStyle = 'rgba(6,17,26,.55)'; c.beginPath(); c.moveTo(w * 0.33, h * 0.4); c.lineTo(w * 0.4, h * 0.18); c.lineTo(w * 0.51, h * 0.18); c.lineTo(w * 0.51, h * 0.4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(w * 0.55, h * 0.4); c.lineTo(w * 0.55, h * 0.18); c.lineTo(w * 0.65, h * 0.18); c.lineTo(w * 0.74, h * 0.4); c.closePath(); c.fill();
    // body
    c.fillStyle = col; rrect(c, 0, h * 0.38, w, h * 0.4, h * 0.14); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(w * 0.06, h * 0.47, w * 0.1, h * 0.06);
    // wheels
    c.fillStyle = '#0b1520'; c.beginPath(); c.arc(w * 0.24, h * 0.8, h * 0.17, 0, 7); c.arc(w * 0.76, h * 0.8, h * 0.17, 0, 7); c.fill();
    c.fillStyle = '#9fb4c2'; c.beginPath(); c.arc(w * 0.24, h * 0.8, h * 0.07, 0, 7); c.arc(w * 0.76, h * 0.8, h * 0.07, 0, 7); c.fill();
    if (o.ring) { c.strokeStyle = o.ring; c.lineWidth = 2; rrect(c, -3, -2, w + 6, h + 4, 7); c.stroke(); }
    if (o.badge) { dot(c, w * 0.92, h * 0.12, Math.max(5, h * 0.2), C.gold); label(c, '✓', w * 0.92, h * 0.13, '#3b2a00', { size: Math.max(8, h * 0.3), bold: true, align: 'center', plain: true }); }
    if (o.home) { label(c, '⌂', w * 0.5, h * 0.62, C.ink, { size: Math.max(10, h * 0.6), align: 'center', plain: true }); }
    c.restore();
  }

  /* =====================================================================================
     1. THE MARKET FOR LEMONS
     ===================================================================================== */
  (function () {
    var view = $('gt8-view'), cv = $('gt8-cv'), hud = $('gt8-hud'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var N = 40, HI = 10000, DAY = 1.25;
    var el = { pre: $('gt8-pre'), b: $('gt8-b'), bO: $('gt8-b-o'), lo: $('gt8-lo'), loO: $('gt8-lo-o'), w: $('gt8-w'), wO: $('gt8-w-o'), insp: $('gt8-insp'), f: $('gt8-f'), fO: $('gt8-f-o'),
      next: $('gt8-next'), run: $('gt8-run'), read: $('gt8-read'), pause: $('gt8-pause'), step: $('gt8-step'), reset: $('gt8-reset'), fRow: $('gt8-f-row') };
    var PRE = { akerlof: { b: 1.5, lo: 0, w: 0, inspect: false, f: 500 }, floor: { b: 1.5, lo: 2000, w: 0, inspect: false, f: 500 }, lovers: { b: 2.1, lo: 0, w: 0, inspect: false, f: 500 },
      warranty: { b: 1.5, lo: 0, w: 0.5, inspect: false, f: 500 }, inspect: { b: 1.5, lo: 0, w: 0, inspect: true, f: 300 } };
    var P = { b: 1.5, lo: 0, w: 0, inspect: false, f: 500 };
    var S = { m: null, t: 0, paused: false, fast: false, cars: [], hover: -1, wmin: NaN, msg: '', hudTxt: '' };

    function restart() {
      S.m = new M.Lemons({ n: N, lo: P.lo, hi: HI, b: P.b, w: P.w, inspect: P.inspect, f: P.f });
      S.t = 0; S.fast = false;
      S.cars = S.m.q.map(function (q, i) { var o = S.cars[i] || {}; return { a: o.a === undefined ? 1 : o.a, dx: o.dx || 0, st: S.m.st[i], pop: 0 }; });
      S.cars.forEach(function (k, i) { k.st = S.m.st[i]; });
      S.wmin = P.inspect ? NaN : M.minWarranty({ n: N, lo: P.lo, hi: HI, b: P.b });
      check(); readouts();
    }
    function nextDay() {
      if (S.m.stable) return false;
      var before = S.m.st.slice(); S.m.step();
      S.m.st.forEach(function (s, i) { if (s !== before[i]) S.cars[i].pop = 1; S.cars[i].st = s; });
      check(); readouts(); return true;
    }
    function sync() {
      el.b.value = P.b; el.bO.textContent = fmt(P.b, 2);
      el.lo.value = P.lo; el.loO.textContent = money(P.lo);
      el.w.value = Math.round(P.w * 100); el.wO.textContent = Math.round(P.w * 100) + '% of the shortfall';
      el.insp.checked = P.inspect; el.f.value = P.f; el.fO.textContent = money(P.f); el.f.disabled = !P.inspect; el.fRow.classList.toggle('gt8-off', !P.inspect);
      var k = null; Object.keys(PRE).forEach(function (n) { var q = PRE[n]; if (q.b === P.b && q.lo === P.lo && Math.abs(q.w - P.w) < 1e-9 && q.inspect === P.inspect && (!q.inspect || q.f === P.f)) k = n; });
      seg(el.pre, 'data-pre', k);
    }
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre]; P = { b: q.b, lo: q.lo, w: q.w, inspect: q.inspect, f: q.f }; sync(); restart(); setPause(false); });
    el.b.addEventListener('input', function () { P.b = +el.b.value; sync(); restart(); });
    el.lo.addEventListener('input', function () { P.lo = +el.lo.value; sync(); restart(); });
    el.w.addEventListener('input', function () { P.w = +el.w.value / 100; sync(); restart(); });
    el.insp.addEventListener('change', function () { P.inspect = el.insp.checked; sync(); restart(); });
    el.f.addEventListener('input', function () { P.f = +el.f.value; sync(); restart(); });
    function setPause(p) { S.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
    el.pause.addEventListener('click', function () { setPause(!S.paused); });
    el.step.addEventListener('click', function () { setPause(true); nextDay(); });
    el.next.addEventListener('click', function () { setPause(true); nextDay(); });
    el.run.addEventListener('click', function () { setPause(false); S.fast = true; });
    el.reset.addEventListener('click', function () { restart(); setPause(false); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === ' ') setPause(!S.paused); else if (k === 'n' || k === 'N' || k === 'ArrowRight') { setPause(true); nextDay(); } else if (k === 'r' || k === 'R') { restart(); setPause(false); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'ArrowDown') { S.hover = S.hover < 0 ? 0 : clamp(S.hover + (k === 'ArrowLeft' ? -1 : k === 'ArrowUp' ? -lay.cols : lay.cols), 0, N - 1); } else used = false;
      if (used) e.preventDefault();
    });

    /* missions */
    var MIS = [
      { id: 'unravel', title: 'Watch it unravel', goal: 'No warranty, no inspection: let the market run until 4 or fewer of the 40 cars are still for sale.' },
      { id: 'lovers', title: 'Buyers who love cars', goal: 'No warranty, no inspection: find buyers keen enough that all 40 cars keep trading, every day.' },
      { id: 'floor', title: 'A floor under prices', goal: 'No fixes: find a market that settles with between a quarter and three quarters of the cars still trading.' },
      { id: 'warranty', title: 'Just enough warranty', goal: 'Keep every car trading with a warranty no more than 5 points above the smallest one that works.' },
      { id: 'inspect', title: 'Certified peaches', goal: 'Turn on inspection and reach a settled market that keeps at least 90% of the possible gains from trade.' },
      { id: 'tiers', title: 'A market in three tiers', goal: 'With inspection on, settle where some cars are certified, some sell uncertified and some stay home.' }
    ];
    var mis = L.missions($('gt8-missions'), 'gt8', MIS, function (id) {
      var q = id === 'inspect' || id === 'tiers' ? PRE.inspect : PRE.akerlof;
      P = { b: q.b, lo: q.lo, w: q.w, inspect: q.inspect, f: id === 'tiers' ? 300 : q.f }; sync(); restart(); setPause(false);
      L.toast(view, MIS.filter(function (m) { return m.id === id; })[0].goal);
    });
    function win(id, text) { if (mis.done(id)) celebrate(view, '✓ ' + text); }
    function check() {
      var m = S.m, fix = P.w > 0 || P.inspect;
      if (!fix && m.nSell <= 4) win('unravel', 'Unraveled: only lemons are left. Each price drop drove out the best cars still on the lot.');
      if (!fix && m.stable && m.hist.every(function (h) { return h.nSell === N; })) win('lovers', 'Buyers value cars so much that even the average car is worth the best owner’s price.');
      if (!fix && m.stable && m.nSell >= N / 4 && m.nSell <= 3 * N / 4) win('floor', 'A floor: the worst car is decent, so the slide stops partway.');
      if (!P.inspect && P.w > 0 && m.stable && m.nSell === N && P.w <= S.wmin + 0.05 + 1e-9) win('warranty', 'Just enough: the warranty makes lemons costly to sell, so good cars stay.');
      if (P.inspect && m.stable && m.eff() >= 0.9) win('inspect', 'Certified! Good cars prove their quality and sell for what they’re worth.');
      if (P.inspect && m.stable && m.nCert > 0 && m.nSell > 0 && m.nKeep > 0) win('tiers', 'Three tiers: certify, sell as is, or keep. Each owner sorts by quality.');
    }
    function readouts() {
      var m = S.m;
      readout(el.read, [
        ['Day', m.day + (m.stable ? ' (settled)' : '')],
        ['Price, uncertified car', money(m.p)],
        ['For sale uncertified', m.nSell + ' of ' + N],
        ['Certified and sold', P.inspect ? String(m.nCert) : '—'],
        ['Kept at home', String(m.nKeep)],
        ['Gains from trade kept', pct(m.eff())],
        ['Smallest warranty that saves every car', P.inspect ? '—' : isFinite(S.wmin) ? Math.round(S.wmin * 100) + '%' : 'none']
      ]);
      var t = 'Day <b>' + m.day + '</b> · buyers pay <b>' + money(m.p) + '</b> for an uncertified car<br>' + m.nSell + ' for sale' + (P.inspect ? ' · ' + m.nCert + ' certified' : '') + ' · ' + m.nKeep + ' kept at home · gains kept ' + pct(m.eff());
      if (t !== S.hudTxt) { hud.innerHTML = t; S.hudTxt = t; }
    }

    /* layout */
    var lay = { cols: 10 };
    function layout() {
      var w = G.w, h = G.h, narrow = w < 600, cols = narrow ? 8 : 10, rows = Math.ceil(N / cols);
      var lx = 10, lw = w - 20, ly = narrow ? 96 : 58, cell = (lw - 16) / cols, ch = Math.min(cell * 0.62, narrow ? 34 : 60), lh = rows * ch + 40;
      lay = { narrow: narrow, cols: cols, rows: rows, lot: { x: lx, y: ly, w: lw, h: lh }, cell: cell, ch: ch };
      var top = ly + lh + 10;
      if (narrow) { var hh = (h - top - 16) / 2; lay.a = { x: 10, y: top, w: lw, h: hh }; lay.bx = { x: 10, y: top + hh + 8, w: lw, h: hh }; }
      else { var hw = (lw - 10) / 2; lay.a = { x: 10, y: top, w: hw, h: h - top - 10 }; lay.bx = { x: 20 + hw, y: top, w: hw, h: h - top - 10 }; }
    }
    function carPos(i) { var r = Math.floor(i / lay.cols), k = i % lay.cols; return [lay.lot.x + 8 + k * lay.cell + lay.cell * 0.11, lay.lot.y + 26 + r * lay.ch + 2]; }
    function hit(x, y) {
      for (var i = 0; i < N; i++) { var p = carPos(i); if (x >= p[0] - 4 && x <= p[0] + lay.cell * 0.78 + 4 && y >= p[1] - 4 && y <= p[1] + lay.ch) return i; }
      return -1;
    }
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); S.hover = hit(e.clientX - r.left, e.clientY - r.top); });
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); S.hover = hit(e.clientX - r.left, e.clientY - r.top); });
    cv.addEventListener('pointerleave', function () { S.hover = -1; });

    function drawLot() {
      var b = lay.lot, m = S.m;
      panelBox(c, b.x, b.y, b.w, b.h, 'THE LOT · 40 CARS · COLOR = TRUE QUALITY (ONLY THE OWNER KNOWS IT)');
      for (var i = 0; i < N; i++) {
        var k = S.cars[i], p = carPos(i), q = m.q[i], cw = lay.cell * 0.78;
        var ta = k.st === 'keep' ? 0.2 : 1, tdx = k.st === 'keep' ? lay.cell * 0.1 : 0;
        k.a += (ta - k.a) * (reduced ? 1 : 0.12); k.dx += (tdx - k.dx) * (reduced ? 1 : 0.12); k.pop = Math.max(0, k.pop - 0.04);
        var s = 1 + (reduced ? 0 : 0.15 * Math.sin(k.pop * Math.PI));
        c.save(); c.translate(p[0] + k.dx + cw / 2, p[1] + cw * 0.25); c.scale(s, s);
        drawCar(c, -cw / 2, -cw * 0.25, cw, qColor(q), k.a, { badge: k.st === 'cert', ring: i === S.hover ? '#fff' : null, home: k.st === 'keep' && lay.cell > 50 });
        c.restore();
      }
      var info;
      if (S.hover >= 0) {
        var q2 = m.q[S.hover], st = m.st[S.hover], sell = m.p - P.w * (HI - q2);
        info = 'Car ' + (S.hover + 1) + ': worth ' + money(q2) + ' to its owner, ' + money(M.buyerValue(q2, { b: P.b, w: 0, hi: HI })) + ' to a buyer. ' + (st === 'sell' ? 'For sale: the owner nets ' + money(sell) + '.' : st === 'cert' ? 'Certified and sold: the owner nets ' + money(P.b * q2 - P.f) + '.' : 'Kept at home: selling would net only ' + money(sell) + '.');
      } else info = m.stable ? (m.nSell + m.nCert === N ? 'Settled: every car trades.' : m.nSell + m.nCert === 0 ? 'Settled: no car trades at all.' : 'Settled: no owner wants to change their mind at this price.') : 'Red cars are lemons, green ones are peaches. Tap a car to see its numbers.';
      label(c, info, b.x + 10, b.y + b.h - 11, m.stable ? C.green : C.muted, { size: lay.narrow ? 10.5 : 11.5, max: b.w - 20 });
    }
    function drawPrice() {
      var b = lay.a, m = S.m, H = m.hist, days = Math.max(8, H.length);
      panelBox(c, b.x, b.y, b.w, b.h, 'PRICE BUYERS PAY, DAY BY DAY');
      var ymax = 0; H.forEach(function (h) { ymax = Math.max(ymax, h.p, isFinite(h.avg) ? h.avg : 0); }); ymax = Math.max(2000, Math.ceil(ymax * 1.1 / 2000) * 2000);
      var pb = { x: b.x + 46, y: b.y + 34, w: b.w - 62, h: b.h - 70 };
      var pl = plot(c, pb, [0, days], [0, ymax], { nx: lay.narrow ? 4 : 6, ny: 4, yf: function (v) { return v >= 1000 ? '$' + fmt(v / 1000, 0) + 'k' : '$' + fmt(v, 0); }, xl: 'day' });
      var pa = [], pp = []; H.forEach(function (h, i) { pp.push([pl.X(i), pl.Y(h.p)]); if (isFinite(h.avg)) pa.push([pl.X(i), pl.Y(h.avg)]); });
      line(c, pa, C.green, 2, [5, 4]); line(c, pp, C.gold, 2.5);
      H.forEach(function (h, i) { dot(c, pl.X(i), pl.Y(h.p), 3.2, C.gold); });
      var y0 = b.y + b.h - 13;
      label(c, '— price paid for an uncertified car', b.x + 10, y0, C.gold, { size: 10.5, max: b.w / 2 - 12 });
      label(c, '- - its worth to buyers, on average', b.x + b.w / 2 + 4, y0, C.green, { size: 10.5, max: b.w / 2 - 12 });
    }
    function drawChoice() {
      var b = lay.bx, m = S.m, ymax = Math.max(HI, P.b * HI) * 1.02;
      panelBox(c, b.x, b.y, b.w, b.h, 'EACH OWNER’S CHOICE: THE BEST OF THREE');
      var pb = { x: b.x + 46, y: b.y + 34, w: b.w - 62, h: b.h - 70 };
      var pl = plot(c, pb, [0, HI], [0, ymax], { nx: lay.narrow ? 4 : 5, ny: 4, xf: function (v) { return '$' + fmt(v / 1000, 0) + 'k'; }, yf: function (v) { return '$' + fmt(v / 1000, 0) + 'k'; }, xl: 'car’s true quality' });
      c.save(); c.beginPath(); c.rect(pb.x, pb.y - 2, pb.w, pb.h + 4); c.clip();
      line(c, [[pl.X(0), pl.Y(0)], [pl.X(HI), pl.Y(HI)]], C.blue, 2);
      line(c, [[pl.X(0), pl.Y(m.p - P.w * HI)], [pl.X(HI), pl.Y(m.p)]], C.gold, 2.5);
      if (P.inspect) line(c, [[pl.X(0), pl.Y(-P.f)], [pl.X(HI), pl.Y(P.b * HI - P.f)]], C.pink, 2);
      c.restore();
      for (var i = 0; i < N; i++) {
        var q = m.q[i], st = m.st[i], y = st === 'keep' ? q : st === 'sell' ? m.p - P.w * (HI - q) : P.b * q - P.f;
        dot(c, pl.X(q), pl.Y(y), i === S.hover ? 5 : 3.3, st === 'keep' ? C.blue : st === 'sell' ? C.gold : C.pink, { ring: i === S.hover ? '#fff' : null });
      }
      var y0 = b.y + b.h - 13, th = b.w / 3;
      label(c, '— keep it (= quality)', b.x + 10, y0, C.blue, { size: 10.5, max: th - 8 });
      label(c, '— sell as is', b.x + 10 + th, y0, C.gold, { size: 10.5, max: th - 8 });
      label(c, P.inspect ? '— certify, then sell' : '(inspection off)', b.x + 10 + 2 * th, y0, P.inspect ? C.pink : C.muted, { size: 10.5, max: th - 12 });
    }
    function frame(dt) {
      G.fit(); layout(); bg(c, G.w, G.h);
      if (!S.paused && !S.m.stable) { S.t += dt * (S.fast ? 5 : 1); if (S.t >= DAY) { S.t = 0; nextDay(); } }
      drawLot(); drawPrice(); drawChoice();
    }
    sync(); restart();
    L.loop(frame, cv);
  })();

  /* =====================================================================================
     2. BAYES' RULE WITH 1,000 CARS
     ===================================================================================== */
  (function () {
    var cv = $('gt8-bc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, NP = 1000;
    var el = { pre: $('gt8-bpre'), pr: $('gt8-prior'), prO: $('gt8-prior-o'), se: $('gt8-sens'), seO: $('gt8-sens-o'), fa: $('gt8-fa'), faO: $('gt8-fa-o'), test: $('gt8-test'), read: $('gt8-bread'), f: $('gt8-bf') };
    var PRE = { mech: { pr: 0.2, se: 0.9, fa: 0.1 }, disease: { pr: 0.01, se: 0.9, fa: 0.09 }, even: { pr: 0.5, se: 0.8, fa: 0.2 } };
    var P = { pr: 0.2, se: 0.9, fa: 0.1 }, S = { tested: false, dots: [], order: [] };
    var R = rng(8128); for (var i = 0; i < NP; i++) S.order.push(i);
    for (i = NP - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = S.order[i]; S.order[i] = S.order[j]; S.order[j] = t; }
    for (i = 0; i < NP; i++) S.dots.push({ x: 0, y: 0, init: false });
    function sync() {
      el.pr.value = Math.round(P.pr * 100); el.prO.textContent = Math.round(P.pr * 100) + '%';
      el.se.value = Math.round(P.se * 100); el.seO.textContent = Math.round(P.se * 100) + '%';
      el.fa.value = Math.round(P.fa * 100); el.faO.textContent = Math.round(P.fa * 100) + '%';
      var k = null; Object.keys(PRE).forEach(function (n) { var q = PRE[n]; if (Math.abs(q.pr - P.pr) < 1e-9 && Math.abs(q.se - P.se) < 1e-9 && Math.abs(q.fa - P.fa) < 1e-9) k = n; }); seg(el.pre, 'data-pre', k);
      el.test.textContent = S.tested ? 'Mix them back' : 'Run the test on all 1,000';
      var r = M.bayes(P.pr, P.se, P.fa), k2 = M.counts(NP, P.pr, P.se, P.fa);
      readout(el.read, [['P(lemon), before the test', pct(P.pr, 1)], ['P(test flags a car)', pct(r.pFlag, 1)], ['P(lemon | flagged)', pct(r.postFlag, 1)], ['P(lemon | passed)', pct(r.postPass, 1)], ['Flagged cars: lemons / all', k2.tp + ' / ' + (k2.tp + k2.fp)]]);
      el.f.innerHTML = 'P(lemon | flagged) = <span>' + fmt(P.pr, 2) + ' × ' + fmt(P.se, 2) + '</span> ÷ (<span>' + fmt(P.pr, 2) + ' × ' + fmt(P.se, 2) + '</span> + ' + fmt(1 - P.pr, 2) + ' × ' + fmt(P.fa, 2) + ') = <b>' + fmt(r.postFlag, 3) + '</b>';
    }
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre]; P = { pr: q.pr, se: q.se, fa: q.fa }; sync(); });
    el.pr.addEventListener('input', function () { P.pr = +el.pr.value / 100; sync(); });
    el.se.addEventListener('input', function () { P.se = +el.se.value / 100; sync(); });
    el.fa.addEventListener('input', function () { P.fa = +el.fa.value / 100; sync(); });
    el.test.addEventListener('click', function () { S.tested = !S.tested; sync(); });
    function frame() {
      G.fit(); var w = G.w, h = G.h, c2 = c; bg(c2, w, h);
      var k = M.counts(NP, P.pr, P.se, P.fa), narrow = w < 640;
      var A = narrow ? { x: 10, y: 30, w: w - 20, h: h * 0.42 } : { x: 12, y: 34, w: w * 0.48 - 12, h: h - 46 };
      var B = narrow ? { x: 10, y: A.y + A.h + 30, w: w - 20, h: h - A.y - A.h - 40 } : { x: w * 0.52, y: 34, w: w * 0.48 - 12, h: h - 46 };
      var cols = 40, rows = 25, s = Math.min(A.w / cols, A.h / rows), r = Math.max(1.6, s * 0.36);
      label(c2, 'ALL 1,000 CARS', A.x, A.y - 14, C.muted, { size: 10.5, bold: true });
      label(c2, '● lemon  ', A.x + A.w, A.y - 14, C.red, { size: 10.5, align: 'right', plain: true });
      label(c2, '● good car', A.x + A.w - 58, A.y - 14, C.green, { size: 10.5, align: 'right', plain: true });
      // which dots are lemons and which get flagged: index by rank
      var isLem = function (i) { return i < k.lem; }, flagged = function (i) { return i < k.lem ? i < k.tp : i - k.lem < k.fp; };
      var nf = k.tp + k.fp, np = NP - nf, pc = Math.max(10, Math.floor(B.w / s)), ps = s;
      var rowsNeed = Math.ceil(nf / pc) + Math.ceil(np / pc); if (rowsNeed * ps + 46 > B.h) { ps = (B.h - 46) / Math.max(1, rowsNeed); pc = Math.max(10, Math.floor(B.w / ps)); ps = Math.min(s, B.w / pc); rowsNeed = Math.ceil(nf / pc) + Math.ceil(np / pc); if (rowsNeed * ps + 46 > B.h) ps = (B.h - 46) / rowsNeed; }
      var fy = B.y + 4, py = fy + Math.ceil(nf / pc) * ps + 34;
      if (S.tested) {
        label(c2, 'FLAGGED BY THE MECHANIC: ' + nf + ' cars, ' + k.tp + ' lemons (' + (nf ? pct(k.tp / nf, 0) : '—') + ')', B.x, B.y - 14, C.gold, { size: 10.5, bold: true, max: B.w });
        label(c2, 'PASSED: ' + np + ' cars, ' + k.fn + ' lemons (' + (np ? pct(k.fn / np, 1) : '—') + ')', B.x, py - 16, C.muted, { size: 10.5, bold: true, max: B.w });
      } else label(c2, 'Press “Run the test” to sort the cars by what the mechanic says.', B.x, B.y + 10, C.muted, { size: 11.5, max: B.w });
      var fi = 0, pi = 0, lemR = 0;
      for (var i = 0; i < NP; i++) {
        var d = S.dots[i], slot = S.order[i], tx, ty, fl = flagged(i);
        if (!S.tested) { tx = A.x + (slot % cols + 0.5) * s; ty = A.y + (Math.floor(slot / cols) + 0.5) * s; }
        else if (fl) { tx = B.x + (fi % pc + 0.5) * ps; ty = fy + (Math.floor(fi / pc) + 0.5) * ps; fi++; }
        else { tx = B.x + (pi % pc + 0.5) * ps; ty = py + (Math.floor(pi / pc) + 0.5) * ps; pi++; }
        if (!d.init || reduced) { d.x = tx; d.y = ty; d.init = true; } else { var sp = 0.08 + (i % 7) * 0.012; d.x += (tx - d.x) * sp; d.y += (ty - d.y) * sp; }
        var rr = S.tested ? Math.max(1.4, Math.min(r, ps * 0.36)) : r;
        c2.beginPath(); c2.arc(d.x, d.y, rr, 0, 7); c2.fillStyle = isLem(i) ? C.red : 'rgba(99,230,190,.75)'; c2.fill();
        if (S.tested && fl) { c2.lineWidth = 1.2; c2.strokeStyle = C.gold; c2.stroke(); }
        if (isLem(i)) lemR++;
      }
    }
    sync(); L.loop(frame, cv);
  })();

  /* =====================================================================================
     3. COURNOT WITH A PRIVATE COST
     ===================================================================================== */
  (function () {
    var cv = $('gt8-cc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, A = 120, C1 = 30;
    var el = { th: $('gt8-th'), thO: $('gt8-th-o'), ch: $('gt8-ch'), chO: $('gt8-ch-o'), cl: $('gt8-cl'), clO: $('gt8-cl-o'), read: $('gt8-cread'), best: $('gt8-cbest') };
    var P = { th: 0.5, cH: 40, cL: 20 }, S = { q1: 22, plots: null };
    function sync() {
      el.th.value = Math.round(P.th * 100); el.thO.textContent = Math.round(P.th * 100) + '%';
      el.ch.value = P.cH; el.chO.textContent = money(P.cH); el.cl.value = P.cL; el.clO.textContent = money(P.cL);
      var e = M.cournotBNE(A, C1, P.cH, P.cL, P.th), mine = M.profit1(S.q1, A, C1, e.qH, e.qL, P.th), best = M.profit1(e.q1, A, C1, e.qH, e.qL, P.th);
      var fH = M.cournotFull(A, C1, P.cH), fL = M.cournotFull(A, C1, P.cL);
      readout(el.read, [['Equilibrium: firm 1 makes', fmt(e.q1, 2)], ['Firm 2 if its cost is high', fmt(e.qH, 2)], ['Firm 2 if its cost is low', fmt(e.qL, 2)], ['Your quantity, firm 1', fmt(S.q1, 1)],
        ['Your expected profit', money(mine, 0) + ' (best ' + money(best, 0) + ')'], ['If firm 1 knew the cost: high / low', fmt(fH.q1, 1) + ' / ' + fmt(fL.q1, 1)]]);
    }
    el.th.addEventListener('input', function () { P.th = +el.th.value / 100; sync(); });
    el.ch.addEventListener('input', function () { P.cH = +el.ch.value; if (P.cL > P.cH) { P.cL = P.cH; } sync(); });
    el.cl.addEventListener('input', function () { P.cL = +el.cl.value; if (P.cL > P.cH) { P.cH = P.cL; } sync(); });
    el.best.addEventListener('click', function () { S.q1 = M.cournotBNE(A, C1, P.cH, P.cL, P.th).q1; sync(); });
    drag(cv, function (x, y) { if (!S.plots) return null; for (var i = 0; i < S.plots.length; i++) { var b = S.plots[i].b; if (x > b.x - 10 && x < b.x + b.w + 10 && y > b.y - 10 && y < b.y + b.h + 10) return i; } return null; },
      function (i, x) { S.q1 = clamp(Math.round(S.plots[i].ix(x) * 2) / 2, 0, A - C1); sync(); });
    cv.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { S.q1 = clamp(S.q1 + (e.key === 'ArrowRight' ? 0.5 : -0.5), 0, A - C1); sync(); e.preventDefault(); } });
    function frame() {
      G.fit(); var w = G.w, h = G.h; bg(c, w, h);
      var e = M.cournotBNE(A, C1, P.cH, P.cL, P.th), narrow = w < 640, X0 = A - C1;
      var b1 = narrow ? { x: 10, y: 10, w: w - 20, h: (h - 30) / 2 } : { x: 12, y: 12, w: w / 2 - 18, h: h - 24 };
      var b2 = narrow ? { x: 10, y: b1.y + b1.h + 10, w: w - 20, h: (h - 30) / 2 } : { x: w / 2 + 6, y: 12, w: w / 2 - 18, h: h - 24 };
      panelBox(c, b1.x, b1.y, b1.w, b1.h, 'BEST RESPONSES  (q₁ across, q₂ up)');
      var yTop = Math.ceil(((A - Math.min(P.cL, P.cH)) / 2 + 6) / 10) * 10;
      var p1 = plot(c, { x: b1.x + 40, y: b1.y + 32, w: b1.w - 56, h: b1.h - 74 }, [0, X0], [0, yTop], { nx: 5, ny: 4, xl: 'q₁, firm 1 (you)' });
      function brLine(cc, col, lab) { var pts = []; for (var q = 0; q <= X0; q += 1) pts.push([p1.X(q), p1.Y(M.br2(q, A, cc))]); line(c, pts, col, 2); var lx = 4; label(c, lab, p1.X(lx), p1.Y(M.br2(lx, A, cc)) - 9, col, { size: 10.5 }); }
      brLine(P.cH, C.red, 'firm 2, high cost'); brLine(P.cL, C.green, 'firm 2, low cost');
      var pts = []; for (var y = 0; y <= yTop; y += 1) pts.push([p1.X(M.br1(y, A, C1)), p1.Y(y)]); line(c, pts, C.blue, 2);
      label(c, 'firm 1 vs the average', p1.X(M.br1(yTop * 0.9, A, C1)) + 6, p1.Y(yTop * 0.9), C.blue, { size: 10.5 });
      var fH = M.cournotFull(A, C1, P.cH), fL = M.cournotFull(A, C1, P.cL);
      dot(c, p1.X(fH.q1), p1.Y(fH.q2), 5, 'rgba(0,0,0,0)', { ring: C.red, lw: 1.5 }); dot(c, p1.X(fL.q1), p1.Y(fL.q2), 5, 'rgba(0,0,0,0)', { ring: C.green, lw: 1.5 });
      line(c, [[p1.X(e.q1), p1.Y(e.qH)], [p1.X(e.q1), p1.Y(e.qL)]], 'rgba(255,255,255,.4)', 1.5, [3, 3]);
      dot(c, p1.X(e.q1), p1.Y(e.qH), 5.5, C.red, { glow: 8 }); dot(c, p1.X(e.q1), p1.Y(e.qL), 5.5, C.green, { glow: 8 }); dot(c, p1.X(e.q1), p1.Y(e.eq2), 5.5, C.blue, { glow: 8 });
      line(c, [[p1.X(S.q1), p1.b.y], [p1.X(S.q1), p1.b.y + p1.b.h]], C.gold, 2);
      label(c, 'you: ' + fmt(S.q1, 1), p1.X(S.q1) + 5, p1.b.y + 8, C.gold, { size: 11, bold: true });
      label(c, '● Bayesian equilibrium   ○ if firm 1 knew the cost', b1.x + 10, b1.y + b1.h - 12, C.muted, { size: 10.5, max: b1.w - 20 });
      panelBox(c, b2.x, b2.y, b2.w, b2.h, 'FIRM 1’S PROFIT AGAINST FIRM 2’S EQUILIBRIUM PLAY');
      var pm = M.profit1(e.q1, A, C1, e.qH, e.qL, P.th), top = Math.max(pm, M.profit1(M.br1(e.qL, A, C1), A, C1, e.qL, e.qL, 1), M.profit1(M.br1(e.qH, A, C1), A, C1, e.qH, e.qH, 1)) * 1.15 || 1;
      var p2 = plot(c, { x: b2.x + 52, y: b2.y + 32, w: b2.w - 68, h: b2.h - 74 }, [0, X0], [0, Math.ceil(top / 200) * 200], { nx: 5, ny: 4, xl: 'q₁', yf: function (v) { return '$' + grp(v); } });
      function curve(fn, col, lw, dash) { var pts = []; for (var q = 0; q <= X0; q += 0.5) { var v = fn(q); if (v >= -1) pts.push([p2.X(q), p2.Y(Math.max(0, v))]); } line(c, pts, col, lw, dash); }
      curve(function (q) { return M.profit1(q, A, C1, e.qH, e.qH, 1); }, 'rgba(255,135,135,.6)', 1.5, [4, 4]);
      curve(function (q) { return M.profit1(q, A, C1, e.qL, e.qL, 1); }, 'rgba(99,230,190,.6)', 1.5, [4, 4]);
      curve(function (q) { return M.profit1(q, A, C1, e.qH, e.qL, P.th); }, C.gold, 2.5);
      var my = M.profit1(S.q1, A, C1, e.qH, e.qL, P.th);
      line(c, [[p2.X(S.q1), p2.b.y], [p2.X(S.q1), p2.b.y + p2.b.h]], 'rgba(255,212,121,.5)', 1.5);
      dot(c, p2.X(e.q1), p2.Y(pm), 5, C.blue, { glow: 8 }); dot(c, p2.X(S.q1), p2.Y(Math.max(0, my)), 6, C.gold, { ring: '#fff', lw: 1.5 });
      var lx2 = b2.x + 10, ly2 = b2.y + b2.h - 12, sp2 = (b2.w - 20) / 3; label(c, '— expected', lx2, ly2, C.gold, { size: 10.5, max: sp2 - 6 }); label(c, '- - rival’s cost high', lx2 + sp2, ly2, C.red, { size: 10.5, max: sp2 - 6 }); label(c, '- - rival’s cost low', lx2 + 2 * sp2, ly2, C.green, { size: 10.5, max: sp2 - 6 });
      S.plots = [p1, p2];
    }
    sync(); L.loop(frame, cv);
  })();
})(window, document);
