/* Game Theory, Chapter 10: Signaling and Screening. Three interactive pieces:
   1. Spence's job-market signaling (main simulation, with missions), 2. cheap talk (Crawford and Sobel),
   3. a screening menu. The models are in model.js (window.GT10M), tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, M = W.GT10M, root = D.getElementById('gt10-lab');
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
  function celebrate(view, text) { L.toast(view, text); if (!reduced) { view.classList.remove('gt10-win'); void view.offsetWidth; view.classList.add('gt10-win'); } }
  /* seeded random numbers, so a "new round" button can be replayed in tests */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }


  function person(c, x, y, s, col, alpha) {
    c.save(); c.globalAlpha = alpha === undefined ? 1 : alpha; c.fillStyle = col;
    c.beginPath(); c.arc(x, y - s * 0.56, s * 0.22, 0, 7); c.fill();
    c.beginPath(); c.moveTo(x - s * 0.3, y + s * 0.38); c.lineTo(x - s * 0.3, y - s * 0.08); c.quadraticCurveTo(x - s * 0.3, y - s * 0.27, x, y - s * 0.27); c.quadraticCurveTo(x + s * 0.3, y - s * 0.27, x + s * 0.3, y - s * 0.08); c.lineTo(x + s * 0.3, y + s * 0.38); c.closePath(); c.fill(); c.restore();
  }

  /* =====================================================================================
     1. SPENCE'S JOB MARKET
     ===================================================================================== */
  (function () {
    var view = $('gt10-view'), cv = $('gt10-cv'), hud = $('gt10-hud'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, NW = 20, EMAX = 4, WLO = 30, WHI = 80;
    var el = { mode: $('gt10-mode'), es: $('gt10-es'), esO: $('gt10-es-o'), lam: $('gt10-lam'), lamO: $('gt10-lam-o'), cl: $('gt10-cl'), clO: $('gt10-cl-o'), ch: $('gt10-ch'), chO: $('gt10-ch-o'), read: $('gt10-read'), reset: $('gt10-reset') };
    var P = { thL: 40, thH: 70, lam: 0.5, cL: 20, cH: 10 }, S = { mode: 'sep', es: 1, r: null, workers: [], hudTxt: '', handle: null };
    for (var i = 0; i < NW; i++) S.workers.push({ x: 0, y: 0, init: false, hi: false, at: 0 });
    function wage(e) { return e >= S.es - 1e-9 ? S.r.wHi : P.thL; }
    function compute() {
      S.r = M.spence(P, S.mode, S.es);
      // each type's best reply to the posted wages (ties: the equilibrium choice for that mode)
      var r = S.r, lowSchool, highSchool;
      if (S.mode === 'semi') lowSchool = r.eq ? 'mix' : (r.uLs > r.uL0 + 1e-9);
      else lowSchool = S.mode === 'pool' ? r.uLs >= r.uL0 - 1e-9 : r.uLs > r.uL0 + 1e-9;
      highSchool = r.uHs >= r.uH0 - 1e-9;
      var nH = Math.round(NW * P.lam), nL = NW - nH, piN = lowSchool === 'mix' ? Math.round(nL * r.pi) : lowSchool ? nL : 0;
      S.nH = nH; S.nL = nL; S.lowAt = piN; S.highSchool = highSchool;
      var k = 0; S.workers.forEach(function (w, j) { w.hi = j < nH; w.at = w.hi ? (highSchool ? 1 : 0) : ((j - nH) < piN ? 1 : 0); });
      // what employers see in each room
      var room = [{ n: 0, s: 0, hi: 0 }, { n: 0, s: 0, hi: 0 }];
      S.workers.forEach(function (w) { var R = room[w.at]; R.n++; R.s += w.hi ? P.thH : P.thL; if (w.hi) R.hi++; });
      S.room = room; S.rooms = room.map(function (R, j) { var pay = j ? r.wHi : P.thL, avg = R.n ? R.s / R.n : NaN; return { n: R.n, hi: R.hi, pay: pay, avg: avg, ok: !R.n || Math.abs(avg - pay) < 0.75 }; });
      void k;
    }
    function sync() {
      seg(el.mode, 'data-m', S.mode);
      el.es.value = S.es; el.esO.textContent = fmt(S.es, 2) + ' years';
      el.lam.value = Math.round(P.lam * 100); el.lamO.textContent = Math.round(P.lam * 100) + '%';
      el.cl.value = P.cL; el.clO.textContent = money(P.cL) + 'k a year'; el.ch.value = P.cH; el.chO.textContent = money(P.cH) + 'k a year';
      compute(); var r = S.r, sr = M.sepRange(P);
      readout(el.read, [['Wage with the degree', money(r.wHi, 1) + 'k'], ['Wage without it', money(P.thL) + 'k'],
        ['Low type: none / degree', money(r.uL0, 1) + 'k / ' + money(r.uLs, 1) + 'k'], ['High type: none / degree', money(r.uH0, 1) + 'k / ' + money(r.uHs, 1) + 'k'],
        ['Separating needs', P.cH < P.cL ? fmt(sr[0], 2) + ' to ' + fmt(sr[1], 2) + ' years' : P.cH === P.cL ? 'a tie at ' + fmt(sr[0], 2) + ' years' : 'impossible'], ['Pooling works up to', fmt(M.poolMax(P), 2) + ' years'],
        ['Share of low types in school', S.mode === 'semi' ? (isFinite(r.pi) && r.eq ? pct(r.pi) : '—') : S.nL ? pct(S.lowAt / S.nL) : '—'],
        ['Equilibrium?', r.eq ? (r.ic.passes ? 'yes, and intuitive' : 'yes') : 'no', r.eq ? '' : '']]);
      var name = { sep: 'Separating', pool: 'Pooling', semi: 'Semi-separating' }[S.mode];
      var t = '<b>' + name + '</b> · degree means ' + fmt(S.es, 2) + ' years of school<br>' + (r.eq ? '✓ an equilibrium' + (r.ic.passes ? ', and it passes the intuitive criterion' : '') : '✗ not an equilibrium');
      if (t !== S.hudTxt) { hud.innerHTML = t; S.hudTxt = t; }
      check();
    }
    el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; S.mode = b.dataset.m; sync(); });
    el.es.addEventListener('input', function () { S.es = +el.es.value; sync(); });
    el.lam.addEventListener('input', function () { P.lam = +el.lam.value / 100; sync(); });
    el.cl.addEventListener('input', function () { P.cL = +el.cl.value; sync(); });
    el.ch.addEventListener('input', function () { P.cH = +el.ch.value; sync(); });
    el.reset.addEventListener('click', function () { P = { thL: 40, thH: 70, lam: 0.5, cL: 20, cH: 10 }; S.mode = 'sep'; S.es = 1; sync(); });
    cv.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { S.es = clamp(Math.round((S.es + (e.key === 'ArrowRight' ? 0.05 : -0.05)) * 100) / 100, 0, EMAX); sync(); e.preventDefault(); } });
    var plotRef = null;
    drag(cv, function (x, y) { if (!plotRef) return null; var b = plotRef.b; return x > b.x - 10 && x < b.x + b.w + 10 && y > b.y - 10 && y < b.y + b.h + 20 ? 1 : null; },
      function (t, x) { S.es = clamp(Math.round(plotRef.ix(x) * 20) / 20, 0, EMAX); sync(); });

    /* missions */
    var MIS = [
      { id: 'sep', title: 'Separate the types', goal: 'Find a separating equilibrium: only high types get the degree, and it pays.' },
      { id: 'fake', title: 'Too easy to fake', goal: 'Separating mode: require so little school that low types copy the high types.' },
      { id: 'quit', title: 'Too hard to prove', goal: 'Separating mode: require so much school that high types skip it.' },
      { id: 'pool', title: 'Everyone in school', goal: 'Find a pooling equilibrium in which everyone gets some education.' },
      { id: 'riley', title: 'The cheapest proof', goal: 'Find the least-cost separating equilibrium, the only one that passes the intuitive criterion.' },
      { id: 'semi', title: 'Some fake it', goal: 'Find a semi-separating equilibrium where between 20% and 80% of low types go to school.' },
      { id: 'same', title: 'A signal anyone can send', goal: 'Make school no harder for low types than for high types, and see separation fail.' }
    ];
    var mis = L.missions($('gt10-missions'), 'gt10', MIS, function (id) {
      S.mode = id === 'pool' ? 'pool' : id === 'semi' ? 'semi' : 'sep'; if (id === 'same') { P.cH = 10; P.cL = 20; } sync();
      L.toast(view, MIS.filter(function (m) { return m.id === id; })[0].goal);
    });
    function win(id, text) { if (mis.done(id)) celebrate(view, '✓ ' + text); }
    function check() {
      var r = S.r;
      if (S.mode === 'sep' && r.eq) win('sep', 'Separated! The degree costs low types too much to fake.');
      if (S.mode === 'sep' && !r.icL && P.cH < P.cL) win('fake', 'Faked: low types copy the degree, so it no longer proves anything.');
      if (S.mode === 'sep' && !r.icH) win('quit', 'Too costly: even high types would rather skip school.');
      if (S.mode === 'pool' && r.eq && S.es > 0.04) win('pool', 'Pooling: everyone spends years in school that tells employers nothing.');
      if (S.mode === 'sep' && r.eq && Math.abs(S.es - r.D / P.cL) <= 0.05 && P.cH < P.cL) win('riley', 'The cheapest separating signal: just enough to stop the low types.');
      if (S.mode === 'semi' && r.eq && r.pi >= 0.2 && r.pi <= 0.8) win('semi', 'Some low types gamble on school; the degree’s wage reflects the mix.');
      if (S.mode === 'sep' && P.cH >= P.cL) win('same', 'With equal costs, whatever a high type can afford, a low type can copy.');
    }

    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 620; bg(c, w, h);
      var r = S.r, top = narrow ? 92 : 62;
      var A = narrow ? { x: 10, y: top, w: w - 20, h: 300 } : { x: 10, y: top, w: w * 0.58 - 15, h: h - top - 118 };
      var B = narrow ? { x: 10, y: A.y + A.h + 8, w: w - 20, h: 170 } : { x: w * 0.58 + 5, y: top, w: w * 0.42 - 15, h: h - top - 118 };
      var Cb = narrow ? { x: 10, y: B.y + B.h + 8, w: w - 20, h: h - B.y - B.h - 18 } : { x: 10, y: h - 108, w: w - 20, h: 98 };
      panelBox(c, A.x, A.y, A.w, A.h, 'WAGES AND EACH TYPE’S INDIFFERENCE LINE');
      var pl = plot(c, { x: A.x + 44, y: A.y + 34, w: A.w - 60, h: A.h - 62 }, [0, EMAX], [WLO, WHI], { nx: 4, ny: 5, xl: 'years of school, e', yf: function (t) { return '$' + t + 'k'; } });
      plotRef = pl;
      // equilibrium range shading
      var rng2 = S.mode === 'sep' ? (P.cH < P.cL ? M.sepRange(P) : null) : S.mode === 'pool' ? [0, M.poolMax(P)] : [M.poolMax(P), r.D / P.cL];
      if (rng2) { var x0 = pl.X(clamp(rng2[0], 0, EMAX)), x1 = pl.X(clamp(rng2[1], 0, EMAX)); c.fillStyle = 'rgba(99,230,190,.10)'; c.fillRect(x0, pl.b.y, Math.max(2, x1 - x0), pl.b.h); label(c, 'equilibria here', (x0 + x1) / 2, pl.b.y + 10, C.green, { size: 10, align: 'center' }); }
      // indifference lines through each type's chosen point
      var uL = S.lowAt > 0 && S.lowAt === S.nL ? r.uLs : r.uL0, uH = S.highSchool ? r.uHs : r.uH0;
      c.save(); c.beginPath(); c.rect(pl.b.x, pl.b.y, pl.b.w, pl.b.h); c.clip();
      line(c, [[pl.X(0), pl.Y(uL)], [pl.X(EMAX), pl.Y(uL + P.cL * EMAX)]], C.red, 1.8, [6, 4]);
      line(c, [[pl.X(0), pl.Y(uH)], [pl.X(EMAX), pl.Y(uH + P.cH * EMAX)]], C.green, 1.8, [6, 4]);
      // the wage schedule
      line(c, [[pl.X(0), pl.Y(P.thL)], [pl.X(S.es), pl.Y(P.thL)]], C.gold, 3); line(c, [[pl.X(S.es), pl.Y(r.wHi)], [pl.X(EMAX), pl.Y(r.wHi)]], C.gold, 3);
      line(c, [[pl.X(S.es), pl.Y(P.thL)], [pl.X(S.es), pl.Y(r.wHi)]], 'rgba(255,212,121,.4)', 1.5, [2, 3]);
      c.restore();
      [P.thL, P.thH].forEach(function (v, k) { label(c, k ? 'high productivity' : 'low productivity', pl.b.x + pl.b.w - 4, pl.Y(v) + (k ? -9 : 10), C.muted, { size: 10, align: 'right' }); line(c, [[pl.b.x, pl.Y(v)], [pl.b.x + pl.b.w, pl.Y(v)]], 'rgba(143,179,198,.25)', 1, [2, 4]); });
      // handle
      dot(c, pl.X(S.es), pl.Y(r.wHi), 8, C.gold, { ring: '#fff', lw: 2, glow: 12 }); label(c, '↔ drag', pl.X(S.es) + 12, pl.Y(r.wHi) - 12, C.gold, { size: 10.5, bold: true });
      // the two types' choices
      dot(c, pl.X(S.highSchool ? S.es : 0), pl.Y(S.highSchool ? r.wHi : P.thL), 6.5, C.green, { ring: '#06111a', lw: 2 });
      if (S.lowAt < S.nL) dot(c, pl.X(0), pl.Y(P.thL), 6.5, C.red, { ring: '#06111a', lw: 2 });
      if (S.lowAt > 0) dot(c, pl.X(S.es) - 3, pl.Y(r.wHi) + 3, 6.5, C.red, { ring: '#06111a', lw: 2 });
      var lx = A.x + 10, ly = A.y + A.h - 13, sp = (A.w - 20) / 3;
      label(c, '— wage paid', lx, ly, C.gold, { size: 10.5, max: sp - 6 }); label(c, '- - low type, same payoff', lx + sp, ly, C.red, { size: 10.5, max: sp - 6 }); label(c, '- - high type, same payoff', lx + 2 * sp, ly, C.green, { size: 10.5, max: sp - 6 });
      // rooms with workers
      panelBox(c, B.x, B.y, B.w, B.h, 'WHO CHOOSES WHAT (20 WORKERS)');
      var rw = (B.w - 30) / 2, rh = B.h - 40;
      [0, 1].forEach(function (j) {
        var rx = B.x + 10 + j * (rw + 10), ry = B.y + 28, R = S.rooms[j];
        c.fillStyle = 'rgba(255,255,255,.03)'; c.strokeStyle = R.ok ? 'rgba(99,230,190,.45)' : 'rgba(255,135,135,.8)'; c.lineWidth = 1.5; rrect(c, rx, ry, rw, rh, 10); c.fill(); c.stroke();
        label(c, j ? '🎓 Degree (' + fmt(S.es, 2) + ' yrs)' : 'No degree', rx + rw / 2, ry + 13, C.ink, { size: 11, bold: true, align: 'center', max: rw - 8 });
        label(c, 'paid ' + money(R.pay, 1) + 'k', rx + rw / 2, ry + rh - 30, C.gold, { size: 10.5, align: 'center', max: rw - 8 });
        label(c, R.n ? 'worth ' + money(R.avg, 1) + 'k ' + (R.ok ? '✓' : '✗') : 'empty', rx + rw / 2, ry + rh - 14, R.n ? (R.ok ? C.green : C.red) : C.muted, { size: 10.5, align: 'center', max: rw - 8 });
        S.rooms[j].box = { x: rx, y: ry + 24, w: rw, h: rh - 62 };
      });
      var cnt = [0, 0], bx0 = S.rooms[0].box, s = 30;
      while (s > 10) { var per0 = Math.floor((bx0.w - 12) / (s * 1.05)); if (per0 >= 1 && Math.ceil(NW / per0) * s * 1.2 <= bx0.h) break; s -= 1; }
      S.workers.forEach(function (wk) {
        var bx = S.rooms[wk.at].box, per = Math.max(1, Math.floor((bx.w - 12) / (s * 1.05))), k = cnt[wk.at]++, tx = bx.x + 6 + (k % per + 0.5) * (bx.w - 12) / per, ty = bx.y + s * 0.95 + Math.floor(k / per) * s * 1.2;
        if (!wk.init || reduced) { wk.x = tx; wk.y = ty; wk.init = true; } else { wk.x += (tx - wk.x) * Math.min(1, dt * 5); wk.y += (ty - wk.y) * Math.min(1, dt * 5); }
        person(c, wk.x, wk.y, s, wk.hi ? C.green : C.red);
      });
      // checklist
      panelBox(c, Cb.x, Cb.y, Cb.w, Cb.h, 'THE EQUILIBRIUM CHECKLIST');
      var lines = [];
      var lowChoice = S.mode === 'semi' && r.eq ? 'is indifferent: ' + money(r.uL0, 1) + 'k either way, so some go' : S.lowAt ? 'goes to school: ' + money(r.uLs, 1) + 'k beats ' + money(r.uL0, 1) + 'k' : 'skips school: ' + money(r.uL0, 1) + 'k beats ' + money(r.uLs, 1) + 'k';
      var lowWant = S.mode === 'sep' ? S.lowAt === 0 : S.mode === 'pool' ? S.lowAt === S.nL : r.eq;
      lines.push([lowWant, 'Low type ' + lowChoice + (S.mode === 'sep' ? ' (should skip)' : S.mode === 'pool' ? ' (should go)' : '')]);
      lines.push([S.highSchool, 'High type ' + (S.highSchool ? 'goes to school: ' + money(r.uHs, 1) + 'k vs ' + money(r.uH0, 1) + 'k' : 'skips school: ' + money(r.uH0, 1) + 'k beats ' + money(r.uHs, 1) + 'k')]);
      var bel = S.rooms[0].ok && S.rooms[1].ok; lines.push([bel, bel ? 'Employers pay each worker what they expect them to be worth' : (narrow ? 'A wage doesn’t match the workers who get it' : 'Employers misjudge someone: a wage doesn’t match the workers who get it')]);
      if (r.eq) lines.push([r.ic.passes, r.ic.passes ? 'Intuitive criterion: no off-path level of school could only be worth it to a high type' : 'Intuitive criterion fails: ' + fmt(Math.max(0, r.ic.lo), 2) + ' to ' + fmt(r.ic.hi, 2) + ' years would convince employers']);
      var lh2 = narrow ? 17 : 17;
      lines.forEach(function (ln, k) { var yy = Cb.y + 32 + k * lh2; label(c, ln[0] ? '✓' : '✗', Cb.x + 14, yy, ln[0] ? C.green : C.red, { size: 12, bold: true }); label(c, ln[1], Cb.x + 30, yy, k === 3 ? C.muted : C.ink, { size: narrow ? 10.5 : 11.5, max: Cb.w - 44 }); });
    }
    sync(); L.loop(frame, cv);
  })();

  /* =====================================================================================
     2. CHEAP TALK
     ===================================================================================== */
  (function () {
    var cv = $('gt10-tc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, R = rng(2024);
    var el = { b: $('gt10-tb'), bO: $('gt10-tb-o'), n: $('gt10-tn'), ask: $('gt10-ask'), read: $('gt10-tread') };
    var S = { b: 0.05, N: 3, th: null, t: 1, hist: [] };
    function nmax() { return Math.min(12, M.csMaxN(S.b)); }
    function buttons() { var m = nmax(), h = ''; for (var k = 1; k <= Math.min(m, 8); k++) h += '<button type="button" data-n="' + k + '">' + k + (k === 1 ? ' (babble)' : '') + '</button>'; el.n.innerHTML = h; }
    function sync() {
      var m = nmax(); if (S.N > m) S.N = m; buttons(); seg(el.n, 'data-n', S.N);
      el.b.value = Math.round(S.b * 1000); el.bO.textContent = fmt(S.b * 100, 1);
      var a = M.csPartition(S.b, S.N), lo = M.csLoss(a, S.b), best = M.csLoss(M.csPartition(S.b, m), S.b);
      readout(el.read, [['Most zones the advisor can credibly use', m > 12 ? 'more than 12' : String(m)], ['Zones in use', String(S.N)], ['Your average loss (squared miss)', fmt(lo.R * 1e4, 1)], ['…with the most zones', fmt(best.R * 1e4, 1)], ['…if she said nothing useful', fmt(1e4 / 12, 1)], ['Advisor’s average loss', fmt(lo.S * 1e4, 1)]]);
    }
    el.b.addEventListener('input', function () { S.b = +el.b.value / 1000; S.N = nmax(); sync(); });
    el.n.addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (!b) return; S.N = +b.dataset.n; sync(); });
    el.ask.addEventListener('click', function () { S.th = R(); S.t = 0; var a = M.csPartition(S.b, S.N), i = 1; while (S.th > a[i]) i++; S.hist.unshift({ th: S.th, zone: i, y: (a[i - 1] + a[i]) / 2 }); if (S.hist.length > 5) S.hist.pop(); });
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 640; bg(c, w, h); S.t = Math.min(1, S.t + dt * (reduced ? 10 : 1.2));
      var a = M.csPartition(S.b, S.N), x0 = 40, x1 = w - 40, X = function (v) { return x0 + v * (x1 - x0); }, ly = narrow ? 150 : 140;
      panelBox(c, 10, 10, w - 20, h - 20, narrow ? 'THE ADVISOR NAMES A ZONE; YOU PICK ITS MIDDLE' : 'THE ADVISOR KNOWS THE BEST CHOICE (0 TO 100) AND NAMES A ZONE; YOU PICK THE MIDDLE OF IT');
      var cols = ['rgba(116,192,252,.22)', 'rgba(177,151,252,.22)'];
      for (var i = 1; i < a.length; i++) {
        c.fillStyle = cols[i % 2]; c.fillRect(X(a[i - 1]), ly - 26, X(a[i]) - X(a[i - 1]), 52);
        var mx = X((a[i - 1] + a[i]) / 2); c.fillStyle = C.green; c.beginPath(); c.moveTo(mx, ly + 30); c.lineTo(mx - 6, ly + 40); c.lineTo(mx + 6, ly + 40); c.closePath(); c.fill();
        if (X(a[i]) - X(a[i - 1]) > 26) label(c, 'zone ' + i, (X(a[i - 1]) + X(a[i])) / 2, ly - 34, C.muted, { size: 10, align: 'center' });
      }
      line(c, [[x0, ly], [x1, ly]], 'rgba(219,231,239,.6)', 1.5);
      a.forEach(function (v) { line(c, [[X(v), ly - 26], [X(v), ly + 26]], 'rgba(219,231,239,.5)', 1); });
      [0, 25, 50, 75, 100].forEach(function (t) { label(c, String(t), X(t / 100), ly + 52, C.muted, { size: 10, align: 'center', plain: true }); });
      label(c, '▲ your choice when you hear that zone', x0, ly + 70, C.green, { size: 10.5 });
      if (S.th !== null) {
        var q = S.hist[0], k = ease(S.t), yb = ly - 70 + 70 * k;
        dot(c, X(q.th), yb, 7, '#fff', { glow: 10 }); label(c, 'best for you: ' + fmt(q.th * 100, 1), X(q.th), ly - 82, '#fff', { size: 11, bold: true, align: 'center' });
        if (S.t > 0.7) {
          var sx = X(Math.min(1.3, q.th + S.b)); dot(c, sx, ly, 5, C.pink); label(c, 'advisor’s favorite: ' + fmt((q.th + S.b) * 100, 1), sx, ly - 60, C.pink, { size: 10.5, align: 'center' });
          arrow(c, X(q.th), ly + 6, X(q.y), ly + 22, C.green, { width: 2 });
          label(c, '“It’s in zone ' + q.zone + '.” You choose ' + fmt(q.y * 100, 1) + ', missing by ' + fmt(Math.abs(q.y - q.th) * 100, 1) + '.', w / 2, ly + 96, C.ink, { size: 12, bold: true, align: 'center', max: w - 40 });
        }
      } else label(c, 'Press “Ask the advisor” to draw a situation.', w / 2, ly + 96, C.muted, { size: 12, align: 'center' });
      // losses by number of zones
      var m = nmax(), by = ly + 120, bh = h - by - 34, bw = Math.min(60, (w - 100) / Math.max(4, Math.min(m, 8) + 1));
      if (bh > 40) {
        label(c, 'Your average loss with 1, 2, … zones (babbling = 1 zone)', 30, by, C.muted, { size: 10.5, bold: true });
        var maxL = 1 / 12, nShow = Math.min(m, 8);
        for (var n = 1; n <= nShow; n++) { var ls = M.csLoss(M.csPartition(S.b, n), S.b).R, hh = ls / maxL * (bh - 30), xx = 40 + (n - 1) * (bw + 8); c.fillStyle = n === S.N ? C.gold : 'rgba(116,192,252,.6)'; c.fillRect(xx, by + bh - hh, bw, hh); label(c, String(n), xx + bw / 2, by + bh + 10, C.muted, { size: 10, align: 'center', plain: true }); label(c, fmt(ls * 1e4, 0), xx + bw / 2, by + bh - hh - 8, C.ink, { size: 10, align: 'center' }); }
      }
    }
    sync(); L.loop(frame, cv);
  })();

  /* =====================================================================================
     3. A SCREENING MENU
     ===================================================================================== */
  (function () {
    var cv = $('gt10-sc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, TL = 1, TH = 2, QM = 3, TM = 6;
    var el = { mu: $('gt10-mu'), muO: $('gt10-mu-o'), show: $('gt10-ghost'), snap: $('gt10-snap'), read: $('gt10-sread') };
    var S = { mu: 0.3, menu: [{ q: 1, t: 0.8 }, { q: 1.8, t: 2.6 }], ghost: false, pl: null };
    function sync() {
      el.mu.value = Math.round(S.mu * 100); el.muO.textContent = Math.round(S.mu * 100) + '%'; el.show.checked = S.ghost;
      var r = M.menuProfit(S.menu, TL, TH, S.mu), B = M.bestMenu(TL, TH, S.mu), nm = ['Economy', 'Business'];
      readout(el.read, [['Low-value traveler buys', r.iL < 0 ? 'nothing' : nm[r.iL]], ['High-value traveler buys', r.iH < 0 ? 'nothing' : nm[r.iH]], ['Your profit per traveler', money(r.profit * 100, 0)], ['Best possible menu earns', money(B.profit * 100, 0)],
        ['If you could tell them apart', money(M.firstBest(TL, TH, S.mu) * 100, 0)], ['High type’s surplus (her “information rent”)', r.iH < 0 ? '$0' : money((TH * S.menu[r.iH].q - S.menu[r.iH].t) * 100, 0)]]);
    }
    el.mu.addEventListener('input', function () { S.mu = +el.mu.value / 100; sync(); });
    el.show.addEventListener('change', function () { S.ghost = el.show.checked; });
    el.snap.addEventListener('click', function () { var B = M.bestMenu(TL, TH, S.mu); S.menu = [{ q: B.L.q, t: B.L.t }, { q: B.H.q, t: B.H.t }]; sync(); });
    drag(cv, function (x, y) { if (!S.pl) return null; var best = -1, bd = 30; S.menu.forEach(function (m, i) { var d = Math.hypot(S.pl.X(m.q) - x, S.pl.Y(m.t) - y); if (d < bd) { bd = d; best = i; } }); return best < 0 ? null : best; },
      function (i, x, y) { S.menu[i] = { q: clamp(Math.round(S.pl.ix(x) * 50) / 50, 0, QM), t: clamp(Math.round(S.pl.iy(y) * 50) / 50, 0, TM) }; sync(); });
    var kSel = 0;
    cv.addEventListener('keydown', function (e) {
      var k = e.key, m = S.menu[kSel], used = true;
      if (k === 'Tab') return; if (k === '1' || k === 'e' || k === 'E') kSel = 0; else if (k === '2' || k === 'b' || k === 'B') kSel = 1;
      else if (k === 'ArrowRight') m.q = clamp(m.q + 0.02, 0, QM); else if (k === 'ArrowLeft') m.q = clamp(m.q - 0.02, 0, QM); else if (k === 'ArrowUp') m.t = clamp(m.t + 0.02, 0, TM); else if (k === 'ArrowDown') m.t = clamp(m.t - 0.02, 0, TM); else used = false;
      if (used) { e.preventDefault(); sync(); }
    });
    function frame() {
      G.fit(); var w = G.w, h = G.h; bg(c, w, h);
      panelBox(c, 10, 10, w - 20, h - 20, 'DESIGN TWO TICKETS: COMFORT ACROSS, PRICE UP. DRAG THEM.');
      var pl = plot(c, { x: 58, y: 44, w: w - 84, h: h - 92 }, [0, QM], [0, TM], { nx: 6, ny: 6, xl: 'comfort, q', yf: function (t) { return '$' + fmt(t * 100, 0); } }); S.pl = pl;
      c.save(); c.beginPath(); c.rect(pl.b.x, pl.b.y, pl.b.w, pl.b.h); c.clip();
      var cost = []; for (var q = 0; q <= QM; q += 0.05) cost.push([pl.X(q), pl.Y(q * q / 2)]); line(c, cost, 'rgba(219,231,239,.45)', 1.5, [3, 4]);
      var r = M.menuProfit(S.menu, TL, TH, S.mu);
      [[TL, r.iL, C.red], [TH, r.iH, C.green]].forEach(function (z) { var th = z[0], i = z[1], u = i < 0 ? 0 : th * S.menu[i].q - S.menu[i].t; line(c, [[pl.X(0), pl.Y(-u)], [pl.X(QM), pl.Y(th * QM - u)]], z[2], 1.8, [6, 4]); });
      if (S.ghost) { var B = M.bestMenu(TL, TH, S.mu); [B.L, B.H].forEach(function (m) { dot(c, pl.X(m.q), pl.Y(m.t), 9, 'rgba(255,255,255,.12)', { ring: 'rgba(255,255,255,.6)', lw: 1.5 }); }); }
      c.restore();
      label(c, '- - cost of comfort', pl.X(QM) - 4, pl.Y(QM * QM / 2 > TM ? TM : QM * QM / 2) + 12, C.muted, { size: 10, align: 'right' });
      ['E', 'B'].forEach(function (nm, i) { var m = S.menu[i]; dot(c, pl.X(m.q), pl.Y(m.t), 11, i ? C.blue : C.gold, { ring: kSel === i ? '#fff' : '#06111a', lw: 2, glow: 10 }); label(c, nm, pl.X(m.q), pl.Y(m.t) + 1, '#06111a', { size: 12, bold: true, align: 'center', plain: true }); });
      var lx = 20, ly = h - 22;
      label(c, '- - low-value traveler: same happiness', lx, ly, C.red, { size: 10.5, max: (w - 40) / 2 - 6 }); label(c, '- - high-value traveler: same happiness', lx + (w - 40) / 2, ly, C.green, { size: 10.5, max: (w - 40) / 2 - 6 });
    }
    sync(); L.loop(frame, cv);
  })();
})(window, document);
