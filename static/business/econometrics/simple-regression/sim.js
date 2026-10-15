/* Econometrics, Chapter 4: Simple Regression. Two interactives:
   1. Drag points and watch the least-squares line refit, with every residual drawn as a square whose total area
      OLS makes as small as possible; draw your own line and try to beat it; the "bowl" of sums of squares.
   2. Galton's regression to the mean, with simulated heights of parents and children.
   Models in model.js (EC4Model); numbers from EconStats. */
(function () {
  'use strict';
  var L = window.TRBLab, ES = window.EconStats, MOD = window.EC4Model, root = document.getElementById('ec4-lab');
  if (!L || !ES || !MOD || !root) return;
  function $(id) { return document.getElementById(id); }
  var M = Math, fmt = ES.fmt, reduced = L.reduced;
  var C = { bg: '#06111a', bg2: '#0b1b27', grid: 'rgba(120,170,200,.13)', axis: 'rgba(143,179,198,.55)', text: '#8fb3c6', ink: '#dbe7ef', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sgn(v, d) { return (v < 0 ? '−' : '+') + ' ' + fmt(M.abs(v), d); }
  function nfmt(v) { var a = M.abs(v); return a >= 1000 ? M.round(v).toLocaleString('en-US') : a >= 100 ? fmt(v, 0) : a >= 10 ? fmt(v, 1) : fmt(v, 2); }
  function frame(x0, y0, w, h, xlo, xhi, ylo, yhi) {
    return { x0: x0, y0: y0, w: w, h: h, xlo: xlo, xhi: xhi, ylo: ylo, yhi: yhi,
      X: function (v) { return x0 + (v - xlo) / (xhi - xlo) * w; }, Y: function (v) { return y0 + h - (v - ylo) / (yhi - ylo) * h; },
      iX: function (p) { return xlo + (p - x0) / w * (xhi - xlo); }, iY: function (p) { return ylo + (y0 + h - p) / h * (yhi - ylo); } };
  }
  function axes(c, F, o) {
    o = o || {};
    var xt = ES.niceTicks(F.xlo, F.xhi, o.nx || 6), yt = ES.niceTicks(F.ylo, F.yhi, o.ny || 5), dx = M.max(0, -M.floor(M.log10(xt.step) + 1e-9)), dy = M.max(0, -M.floor(M.log10(yt.step) + 1e-9));
    c.save(); c.lineWidth = 1; c.font = '11px system-ui,sans-serif'; c.fillStyle = C.text;
    xt.ticks.forEach(function (v) { if (v < F.xlo - 1e-9 || v > F.xhi + 1e-9) return; var x = M.round(F.X(v)) + 0.5; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, F.y0); c.lineTo(x, F.y0 + F.h); c.stroke(); c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(fmt(v, dx), x, F.y0 + F.h + 4); });
    yt.ticks.forEach(function (v) { if (v < F.ylo - 1e-9 || v > F.yhi + 1e-9) return; var y = M.round(F.Y(v)) + 0.5; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(F.x0, y); c.lineTo(F.x0 + F.w, y); c.stroke(); c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(fmt(v, dy), F.x0 - 5, y); });
    c.strokeStyle = C.axis; c.beginPath(); c.moveTo(F.x0 + 0.5, F.y0); c.lineTo(F.x0 + 0.5, F.y0 + F.h + 0.5); c.lineTo(F.x0 + F.w, F.y0 + F.h + 0.5); c.stroke();
    c.font = '600 11px system-ui,sans-serif'; c.fillStyle = C.ink;
    if (o.xl) { c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText(o.xl + ' →', F.x0 + F.w, F.y0 + F.h + 18); }
    if (o.yl) { c.save(); c.translate(F.x0 - (o.ylOff || 40), F.y0 + F.h / 2); c.rotate(-M.PI / 2); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.yl + ' →', 0, 0); c.restore(); }
    c.restore();
  }
  function seg(el, attr, cur, fn) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); fn(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''); }
  function celebrate(el) { if (reduced || !el) return; el.classList.remove('ec4-win'); void el.offsetWidth; el.classList.add('ec4-win'); setTimeout(function () { el.classList.remove('ec4-win'); }, 1300); }
  function bringIntoView(el) { if (!el) return; var r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > (window.innerHeight || 800)) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
  var SLUG = 'econ-simple-regression';

  /* =========================================================================================
     1. Least squares you can drag
     ========================================================================================= */
  var view = $('ec4-view'), cv = $('ec4-cv'), G = L.canvas(cv), c = G.c, hud = $('ec4-hud'), readEl = $('ec4-read');
  var S = { key: 'study', P: null, pts: [], user: null, showUser: true, sq: 'ols', sel: -1, drag: null, F: null, lay: null, dragStart: null };
  var markPre = seg($('ec4-pre'), 'data-p', S.key, function (k) { load(k); });
  var markSq = seg($('ec4-sq'), 'data-s', S.sq, function (s) { S.sq = s; draw(); });
  var userBox = $('ec4-user');
  userBox.addEventListener('change', function () { S.showUser = userBox.checked; up(); });
  function load(k) {
    S.key = k; S.P = MOD.PRESETS[k]; S.pts = S.P.pts.map(function (p) { return p.slice(); }); S.sel = -1; S.moved = false; markPre(k);
    var F = MOD.fit(S.pts), x1 = S.P.x[0] + 0.15 * (S.P.x[1] - S.P.x[0]), x2 = S.P.x[1] - 0.15 * (S.P.x[1] - S.P.x[0]);
    S.user = { x1: x1, x2: x2, y1: F.ybar, y2: F.ybar };   // start your line flat, at the average of y
    up();
  }
  $('ec4-add').addEventListener('click', function () { addRandom(); });
  $('ec4-del').addEventListener('click', function () { if (S.pts.length > 2) { S.pts.splice(S.sel >= 0 ? S.sel : S.pts.length - 1, 1); S.sel = -1; up(); } });
  $('ec4-reset').addEventListener('click', function () { load(S.key); });
  $('ec4-snap').addEventListener('click', function () { var F = S.F; if (F && isFinite(F.b1)) { S.user.y1 = F.b0 + F.b1 * S.user.x1; S.user.y2 = F.b0 + F.b1 * S.user.x2; S.showUser = true; userBox.checked = true; up(); } });
  var rr = ES.rng(9);
  function addRandom() {
    if (S.pts.length >= 40) return; var P = S.P, F = S.F, x = P.x[0] + (0.08 + 0.84 * rr.u()) * (P.x[1] - P.x[0]);
    var y = F && isFinite(F.b1) ? F.b0 + F.b1 * x + rr.norm(0, 0.08 * (P.y[1] - P.y[0])) : P.y[0] + rr.u() * (P.y[1] - P.y[0]);
    S.pts.push([x, clamp(y, P.y[0], P.y[1])]); S.sel = S.pts.length - 1; S.moved = true; up();
  }
  function userLine() { var u = S.user, b = (u.y2 - u.y1) / (u.x2 - u.x1); return { b: b, a: u.y1 - b * u.x1 }; }
  function up() {
    S.F = MOD.fit(S.pts); var F = S.F, P = S.P, U = userLine(), su = MOD.ssr(S.pts, U.a, U.b), rows = [];
    var ok = isFinite(F.b1);
    rows.push(['Points', String(S.pts.length)]);
    rows.push(['Means (x̄, ȳ)', F.n ? '(' + nfmt(F.xbar) + ', ' + nfmt(F.ybar) + ')' : '—']);
    rows.push(['Slope β̂₁ = Cov ÷ Var', ok ? nfmt(F.cov) + ' ÷ ' + nfmt(F.varx) + ' = ' + fmt(F.b1, 3) : 'no variation in x']);
    rows.push(['Intercept β̂₀ = ȳ − β̂₁x̄', ok ? fmt(F.b0, 2) : '—']);
    rows.push(['R²', ok ? fmt(F.r2, 3) : '—']);
    rows.push(['Sum of squares, OLS', ok ? nfmt(F.ssr) : '—']);
    if (S.showUser) rows.push(['Sum of squares, your line', nfmt(su) + (ok && F.ssr > 0 ? ' (' + (su / F.ssr >= 1.0005 ? '+' + fmt(100 * (su / F.ssr - 1), 1) + '%' : 'tied') + ')' : '')]);
    dl(readEl, rows);
    hud.innerHTML = ok ? 'OLS: <b>ŷ = ' + fmt(F.b0, 2) + ' ' + sgn(F.b1, 3) + 'x</b><br>R² = <b>' + fmt(F.r2, 3) + '</b>' + (S.showUser ? ' · yours: ŷ = ' + fmt(U.a, 1) + ' ' + sgn(U.b, 2) + 'x' : '') : 'Spread the points out in x';
    cv.setAttribute('aria-description', ok ? 'Fitted line: y-hat = ' + fmt(F.b0, 2) + ' plus ' + fmt(F.b1, 3) + ' times x, R squared ' + fmt(F.r2, 3) + ', ' + S.pts.length + ' points.' : '');
    draw(); check(su);
  }
  function draw() {
    G.fit(); var W = G.w, H = G.h, small = W < 560, P = S.P, F = S.F; c.clearRect(0, 0, W, H); c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
    var bh = small ? 96 : 116, left = small ? 50 : 62, Fr = frame(left, 14, W - left - 14, H - 14 - bh - 52, P.x[0], P.x[1], P.y[0], P.y[1]);
    axes(c, Fr, { xl: P.xl, yl: P.yl, ylOff: small ? 38 : 46 });
    var ok = F && isFinite(F.b1), U = userLine();
    c.save(); c.beginPath(); c.rect(Fr.x0, Fr.y0, Fr.w, Fr.h); c.clip();
    // residual squares: each side = the residual, so total area = the sum of squared residuals
    function squares(a, b, fill, stroke) {
      S.pts.forEach(function (p) {
        var yh = a + b * p[0], py = Fr.Y(p[1]), ly = Fr.Y(yh), s = M.abs(py - ly), x = Fr.X(p[0]);
        var right = x + s <= Fr.x0 + Fr.w || x - s < Fr.x0, sx = right ? x : x - s, sy = M.min(py, ly);
        c.fillStyle = fill; c.fillRect(sx, sy, s, s); c.strokeStyle = stroke; c.lineWidth = 1; c.strokeRect(sx + 0.5, sy + 0.5, s, s);
      });
    }
    if (ok && (S.sq === 'ols' || S.sq === 'both')) squares(F.b0, F.b1, 'rgba(249,168,212,.26)', 'rgba(249,168,212,.9)');
    if (S.showUser && (S.sq === 'yours' || S.sq === 'both')) squares(U.a, U.b, 'rgba(255,212,121,.2)', 'rgba(255,212,121,.85)');
    if (S.sq === 'none' && ok) S.pts.forEach(function (p) { c.strokeStyle = 'rgba(249,168,212,.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(Fr.X(p[0]), Fr.Y(p[1])); c.lineTo(Fr.X(p[0]), Fr.Y(F.b0 + F.b1 * p[0])); c.stroke(); });
    // lines
    function line(a, b, col, w, dash) { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); c.moveTo(Fr.X(P.x[0]), Fr.Y(a + b * P.x[0])); c.lineTo(Fr.X(P.x[1]), Fr.Y(a + b * P.x[1])); c.stroke(); c.setLineDash([]); }
    if (ok) line(F.b0, F.b1, C.pink, 3);
    if (S.showUser) line(U.a, U.b, C.gold, 2.2, [8, 5]);
    // the point of means
    if (ok) { var mx = Fr.X(F.xbar), my = Fr.Y(F.ybar); c.strokeStyle = C.ink; c.lineWidth = 1; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(mx, Fr.y0 + Fr.h); c.lineTo(mx, my); c.lineTo(Fr.x0, my); c.stroke(); c.setLineDash([]); c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.moveTo(mx - 7, my); c.lineTo(mx + 7, my); c.moveTo(mx, my - 7); c.lineTo(mx, my + 7); c.stroke(); c.fillStyle = C.gold; c.font = '600 10px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('(x̄, ȳ)', mx + 6, my + 5); }
    // points
    S.pts.forEach(function (p, i) {
      var x = Fr.X(p[0]), y = Fr.Y(p[1]), del = S.drag && S.drag.kind === 'pt' && S.drag.i === i && S.drag.out;
      c.fillStyle = del ? C.red : '#e8f1f7'; c.beginPath(); c.arc(x, y, i === S.sel ? 7.5 : 6, 0, 6.2832); c.fill();
      c.strokeStyle = i === S.sel ? C.green : 'rgba(6,17,26,.9)'; c.lineWidth = i === S.sel ? 3 : 1.5; c.stroke();
    });
    c.restore();
    // a point being dragged off the chart
    if (S.drag && S.drag.kind === 'pt' && S.drag.out) { c.fillStyle = C.red; c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('let go to delete', S.drag.px, S.drag.py - 10); c.beginPath(); c.arc(S.drag.px, S.drag.py, 7, 0, 6.2832); c.fill(); }
    // your line's handles
    if (S.showUser) [[S.user.x1, S.user.y1], [S.user.x2, S.user.y2]].forEach(function (h) { var x = Fr.X(h[0]), y = Fr.Y(clamp(h[1], P.y[0], P.y[1])); c.fillStyle = C.bg; c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, 9, 0, 6.2832); c.fill(); c.stroke(); c.fillStyle = C.gold; c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x - 3.5, y - 1); c.lineTo(x + 3.5, y - 1); c.moveTo(x, y + 5); c.lineTo(x - 3.5, y + 1); c.lineTo(x + 3.5, y + 1); c.fill(); });
    // the bowl: SSR for lines through (x̄, ȳ), against the slope
    var by0 = H - bh + 6, Fb = null;
    if (ok && F.sxx > 0) {
      var span = M.max(M.abs(F.b1) * 1.2, (P.y[1] - P.y[0]) / (P.x[1] - P.x[0]) * 0.8), blo = F.b1 - span, bhi = F.b1 + span;
      var top = M.max(MOD.bowl(F, blo), MOD.bowl(F, bhi)), su = MOD.ssr(S.pts, U.a, U.b);
      Fb = frame(left, by0 + 16, W - left - 14, bh - 40, blo, bhi, 0, top * 1.05);
      c.fillStyle = C.ink; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(small ? 'Sum of squares vs slope (lines through x̄, ȳ)' : 'The bowl: sum of squared residuals for every slope (lines through the means)', left, by0 - 2);
      c.fillStyle = 'rgba(11,27,39,.95)'; c.fillRect(Fb.x0, Fb.y0, Fb.w, Fb.h);
      c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath(); for (var i = 0; i <= 120; i++) { var b = blo + (bhi - blo) * i / 120, v = MOD.bowl(F, b); if (i) c.lineTo(Fb.X(b), Fb.Y(v)); else c.moveTo(Fb.X(b), Fb.Y(v)); } c.stroke();
      c.fillStyle = C.pink; c.beginPath(); c.arc(Fb.X(F.b1), Fb.Y(F.ssr), 5, 0, 6.2832); c.fill();
      c.fillStyle = C.text; c.font = '10px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
      c.fillText('slope ' + fmt(blo, 2), Fb.x0 + 30, Fb.y0 + Fb.h + 3); c.fillText(fmt(bhi, 2), Fb.x0 + Fb.w - 14, Fb.y0 + Fb.h + 3); c.fillStyle = C.pink; c.fillText('OLS ' + fmt(F.b1, 2), Fb.X(F.b1), Fb.y0 + Fb.h + 3);
      if (S.showUser && U.b >= blo && U.b <= bhi) { var uy = Fb.Y(M.min(su, top * 1.05)); c.fillStyle = C.gold; c.beginPath(); c.arc(Fb.X(U.b), uy, 5, 0, 6.2832); c.fill(); c.strokeStyle = 'rgba(255,212,121,.5)'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(Fb.X(U.b), uy); c.lineTo(Fb.X(U.b), Fb.Y(MOD.bowl(F, U.b))); c.stroke(); c.setLineDash([]); }
    }
    S.lay = { Fr: Fr, Fb: Fb };
  }
  // ---------- input ----------
  function pos(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
  function hit(p) {
    var Fr = S.lay.Fr, P = S.P;
    if (S.showUser) { var hs = [[S.user.x1, S.user.y1], [S.user.x2, S.user.y2]]; for (var j = 0; j < 2; j++) { var hx = Fr.X(hs[j][0]), hy = Fr.Y(clamp(hs[j][1], P.y[0], P.y[1])); if ((hx - p.x) * (hx - p.x) + (hy - p.y) * (hy - p.y) < 18 * 18) return { kind: 'h', j: j }; } }
    var best = -1, bd = 16 * 16; S.pts.forEach(function (q, i) { var dx = Fr.X(q[0]) - p.x, dy = Fr.Y(q[1]) - p.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
    if (best >= 0) return { kind: 'pt', i: best };
    if (p.x >= Fr.x0 && p.x <= Fr.x0 + Fr.w && p.y >= Fr.y0 && p.y <= Fr.y0 + Fr.h) return { kind: 'empty' };
    return null;
  }
  cv.addEventListener('pointerdown', function (ev) {
    if (!S.lay) return; var p = pos(ev), h = hit(p), Fr = S.lay.Fr; if (!h) return;
    if (h.kind === 'empty') { if (S.pts.length >= 40) return; S.pts.push([Fr.iX(p.x), Fr.iY(p.y)]); h = { kind: 'pt', i: S.pts.length - 1 }; }
    S.drag = h; if (h.kind === 'pt') { S.sel = h.i; S.moved = true; } S.dragStart = S.F && isFinite(S.F.b1) ? S.F.b1 : NaN;
    cv.setPointerCapture(ev.pointerId); ev.preventDefault(); up();
  });
  cv.addEventListener('pointermove', function (ev) {
    if (!S.lay) return; var p = pos(ev), Fr = S.lay.Fr, P = S.P;
    if (!S.drag) { var h = hit(p); cv.style.cursor = h ? (h.kind === 'empty' ? 'crosshair' : h.kind === 'h' ? 'ns-resize' : 'grab') : 'default'; return; }
    if (S.drag.kind === 'h') { var y = clamp(Fr.iY(p.y), P.y[0], P.y[1]); if (S.drag.j) S.user.y2 = y; else S.user.y1 = y; }
    else {
      var out = p.x < Fr.x0 - 24 || p.x > Fr.x0 + Fr.w + 24 || p.y < Fr.y0 - 24 || p.y > Fr.y0 + Fr.h + 24;
      S.drag.out = out && S.pts.length > 2; S.drag.px = p.x; S.drag.py = p.y;
      S.pts[S.drag.i] = [clamp(Fr.iX(p.x), P.x[0], P.x[1]), clamp(Fr.iY(p.y), P.y[0], P.y[1])];
    }
    up(); leverCheck();
  });
  function endDrag() { if (!S.drag) return; if (S.drag.kind === 'pt' && S.drag.out) { S.pts.splice(S.drag.i, 1); S.sel = -1; } S.drag = null; up(); }
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('keydown', function (e) {
    var P = S.P, k = e.key, dx = (P.x[1] - P.x[0]) / 100, dy = (P.y[1] - P.y[0]) / 100;
    if (k === 'n' || k === 'N' || k === ']') { S.sel = (S.sel + 1) % S.pts.length; up(); }
    else if (k === 'p' || k === 'P' || k === '[') { S.sel = (S.sel - 1 + S.pts.length) % S.pts.length; up(); }
    else if (k.indexOf('Arrow') === 0 && S.sel >= 0) { e.preventDefault(); S.moved = true; S.dragStart = isFinite(S.dragStart) ? S.dragStart : S.F.b1; var q = S.pts[S.sel], m = e.shiftKey ? 5 : 1; if (k === 'ArrowLeft') q[0] = clamp(q[0] - dx * m, P.x[0], P.x[1]); if (k === 'ArrowRight') q[0] = clamp(q[0] + dx * m, P.x[0], P.x[1]); if (k === 'ArrowUp') q[1] = clamp(q[1] + dy * m, P.y[0], P.y[1]); if (k === 'ArrowDown') q[1] = clamp(q[1] - dy * m, P.y[0], P.y[1]); up(); leverCheck(); }
    else if ((k === 'Delete' || k === 'Backspace') && S.sel >= 0 && S.pts.length > 2) { e.preventDefault(); S.pts.splice(S.sel, 1); S.sel = -1; up(); }
    else if (k === 'a' || k === 'A') addRandom();
    else if (k === 'y' || k === 'Y') { S.showUser = !S.showUser; userBox.checked = S.showUser; up(); }
  });
  // ---------- missions ----------
  var MIS = [
    { id: 'close', title: 'Almost as good', goal: 'Drag the two gold handles to make your own line. Get its sum of squares within 5% of the OLS line’s.' },
    { id: 'bowl', title: 'The bottom of the bowl', goal: 'Get within 0.5%. Your gold dot in the bowl sits at the pink minimum, and your line lands on the pink one.' },
    { id: 'flip', title: 'Flip the slope', goal: 'Starting from “Study time”, drag points until the OLS slope turns negative (keep at least 6 points).' },
    { id: 'lever', title: 'One point’s pull', goal: 'Change the OLS slope by half or more by dragging a single point. Points far out on the x-axis pull hardest. Try “An outlier”.' },
    { id: 'perfect', title: 'A perfect fit', goal: 'Arrange at least 6 points so that R² reaches 0.99 or more. Every square shrinks to nothing.' },
    { id: 'none', title: 'Nothing to explain', goal: 'Arrange at least 8 points so that R² is 0.02 or less, with the line nearly flat.' }
  ];
  var mis = L.missions($('ec4-missions'), SLUG, MIS, function (id) {
    bringIntoView(view);
    if (id === 'lever') load('outlier'); else if (id === 'flip' || id === 'close' || id === 'bowl') load('study'); else if (id === 'none') load('none'); else if (id === 'perfect') load('study');
    if (id === 'close' || id === 'bowl') { S.showUser = true; userBox.checked = true; S.sq = 'both'; markSq('both'); up(); }
  });
  function win(id, text) { if (mis.done(id)) { L.toast(view, '✓ ' + text); celebrate(view); } }
  function check(su) {
    var F = S.F; if (!F || !isFinite(F.b1)) return;
    if (S.showUser && F.ssr > 0 && su <= F.ssr * 1.05) win('close', 'Within ' + fmt(100 * (su / F.ssr - 1), 1) + '% of OLS. Now try to go lower…');
    if (S.showUser && F.ssr > 0 && su <= F.ssr * 1.005) win('bowl', 'You found it, and you can’t get below it: OLS is the minimum.');
    if (S.key === 'study' && S.pts.length >= 6 && F.b1 < 0) win('flip', 'Slope ' + fmt(F.b1, 2) + '. A few points can turn the story around.');
    if (S.moved && S.pts.length >= 6 && F.r2 >= 0.99) win('perfect', 'R² = ' + fmt(F.r2, 3) + '. x explains almost all the variation in y.');
    if (S.moved && S.pts.length >= 8 && F.r2 <= 0.02) win('none', 'R² = ' + fmt(F.r2, 3) + '. The best line is nearly flat at ȳ.');
  }
  function leverCheck() { var F = S.F; if (F && isFinite(F.b1) && isFinite(S.dragStart) && M.abs(S.dragStart) > 1e-6 && M.abs(F.b1 - S.dragStart) >= 0.5 * M.abs(S.dragStart)) win('lever', 'Slope moved from ' + fmt(S.dragStart, 2) + ' to ' + fmt(F.b1, 2) + ' with one point.'); }
  window.addEventListener('resize', function () { G.fit(); draw(); });
  if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(cv);
  load('study');

  /* =========================================================================================
     2. Galton and regression to the mean
     ========================================================================================= */
  (function () {
    var v2 = $('ec4g-view'), cv2 = $('ec4g-cv'); if (!v2) return;
    var G2 = L.canvas(cv2), c2 = G2.c, read2 = $('ec4g-read');
    var Gs = { key: 'fs', axis: 0, c: 68.5, w: 2, rev: false, seed: 5, P: null, F: null, R: null };
    function regen() { Gs.P = MOD.heights(Gs.key, 900, Gs.seed); Gs.F = MOD.fit(Gs.P); Gs.R = MOD.fit(Gs.P.map(function (p) { return [p[1], p[0]]; })); up2(); }
    seg($('ec4g-set'), 'data-k', Gs.key, function (k) { Gs.key = k; regen(); });
    seg($('ec4g-ax'), 'data-a', '0', function (a) { Gs.axis = +a; up2(); });
    $('ec4g-c').addEventListener('input', function (e) { Gs.c = +e.target.value; up2(); });
    $('ec4g-rev').addEventListener('change', function (e) { Gs.rev = e.target.checked; up2(); });
    $('ec4g-new').addEventListener('click', function () { Gs.seed++; regen(); });
    var MIS2 = [
      { id: 'tall', title: 'Tall parents', goal: 'Pick parents in a band centered at 71 inches or more. Are their children as tall as they are?' },
      { id: 'short', title: 'Short parents', goal: 'Pick parents in a band centered at 66 inches or less. Which way do their children regress?' },
      { id: 'rev', title: 'It works backward too', goal: 'Switch to “Pick children” and choose tall children (71 inches or more). Their parents are closer to average than they are.' }
    ];
    var mis2 = L.missions($('ec4g-missions'), SLUG + '-galton', MIS2);
    function win2(id, text) { if (mis2.done(id)) { L.toast(v2, '✓ ' + text); celebrate(v2); } }
    function up2() {
      var H = MOD.HSETS[Gs.key], B = MOD.band(Gs.P, Gs.c - Gs.w / 2, Gs.c + Gs.w / 2, Gs.axis), F = Gs.F, rows = [], who = Gs.axis ? 'children' : 'parents', other = Gs.axis ? 'their parents' : 'their children';
      $('ec4g-c-o').textContent = fmt(Gs.c - Gs.w / 2, 0) + '–' + fmt(Gs.c + Gs.w / 2, 0) + ' in';
      rows.push(['Families in the band', String(B.k || 0)]);
      rows.push(['Average of the ' + who, B.k ? fmt(B.own, 2) + ' in' : '—']);
      rows.push(['Average of ' + other, B.k ? fmt(B.other, 2) + ' in' : '—']);
      rows.push(['Overall average', fmt(H.mx, 1) + ' in']);
      rows.push(['Slope, child on parent', fmt(F.b1, 3)]);
      rows.push(['Slope, parent on child', fmt(Gs.R.b1, 3)]);
      rows.push(['Correlation r', fmt(F.r, 3)]);
      rows.push(['Spread (sd): parents, children', fmt(M.sqrt(F.varx), 2) + ', ' + fmt(M.sqrt(F.sst / (F.n - 1)), 2) + ' in']);
      dl(read2, rows);
      if (B.k >= 10) {
        var m = H.mx, closer = M.abs(B.other - m) < M.abs(B.own - m);
        if (!Gs.axis && Gs.c >= 71 && closer) win2('tall', 'Parents average ' + fmt(B.own, 1) + ' in; their children ' + fmt(B.other, 1) + ' in. Taller than average, but less so.');
        if (!Gs.axis && Gs.c <= 66 && closer) win2('short', 'Parents ' + fmt(B.own, 1) + ' in, children ' + fmt(B.other, 1) + ' in: back up toward the average.');
        if (Gs.axis && Gs.c >= 71 && closer) win2('rev', 'Tall children (' + fmt(B.own, 1) + ' in) have parents averaging ' + fmt(B.other, 1) + ' in. Regression runs both ways.');
      }
      draw2(B);
    }
    function draw2(B) {
      G2.fit(); var W = G2.w, Hh = G2.h, small = W < 560, H = MOD.HSETS[Gs.key], F = Gs.F; c2.clearRect(0, 0, W, Hh); c2.fillStyle = C.bg; c2.fillRect(0, 0, W, Hh);
      var left = small ? 50 : 60, mh = 34, Fr = frame(left, 14 + mh, W - left - 14 - mh, Hh - 14 - mh - 48, 60, 78, 60, 78);
      axes(c2, Fr, { xl: H.xl, yl: H.yl, ylOff: small ? 36 : 42 });
      // marginal histograms: parents on top, children at the right
      function hist(vals, horiz) {
        var bins = new Array(36).fill(0); vals.forEach(function (v) { var b = M.floor((v - 60) * 2); if (b >= 0 && b < 36) bins[b]++; }); var mxb = M.max.apply(null, bins) || 1;
        bins.forEach(function (b, i) { if (!b) return; var h = b / mxb * (mh - 6); c2.fillStyle = horiz ? 'rgba(116,192,252,.55)' : 'rgba(249,168,212,.55)'; if (horiz) c2.fillRect(Fr.X(60 + i / 2) + 0.5, Fr.y0 - 3 - h, Fr.w / 36 - 1, h); else c2.fillRect(Fr.x0 + Fr.w + 3, Fr.Y(60 + (i + 1) / 2) + 0.5, h, Fr.h / 36 - 1); });
      }
      hist(Gs.P.map(function (p) { return p[0]; }), true); hist(Gs.P.map(function (p) { return p[1]; }), false);
      c2.save(); c2.beginPath(); c2.rect(Fr.x0, Fr.y0, Fr.w, Fr.h); c2.clip();
      // band
      var lo = Gs.c - Gs.w / 2, hi = Gs.c + Gs.w / 2;
      c2.fillStyle = 'rgba(99,230,190,.1)';
      if (!Gs.axis) c2.fillRect(Fr.X(lo), Fr.y0, Fr.X(hi) - Fr.X(lo), Fr.h); else c2.fillRect(Fr.x0, Fr.Y(hi), Fr.w, Fr.Y(lo) - Fr.Y(hi));
      Gs.P.forEach(function (p) { var inb = (Gs.axis ? p[1] : p[0]) >= lo && (Gs.axis ? p[1] : p[0]) <= hi; c2.fillStyle = inb ? 'rgba(99,230,190,.9)' : 'rgba(219,231,239,.3)'; c2.beginPath(); c2.arc(Fr.X(p[0]), Fr.Y(p[1]), inb ? 2.6 : 2, 0, 6.2832); c2.fill(); });
      // 45° line, regression line, reverse regression
      c2.strokeStyle = C.gold; c2.lineWidth = 1.8; c2.setLineDash([7, 5]); c2.beginPath(); c2.moveTo(Fr.X(60), Fr.Y(60)); c2.lineTo(Fr.X(78), Fr.Y(78)); c2.stroke(); c2.setLineDash([]);
      c2.strokeStyle = C.pink; c2.lineWidth = 2.8; c2.beginPath(); c2.moveTo(Fr.X(60), Fr.Y(F.b0 + F.b1 * 60)); c2.lineTo(Fr.X(78), Fr.Y(F.b0 + F.b1 * 78)); c2.stroke();
      if (Gs.rev) { var R = Gs.R; c2.strokeStyle = C.blue; c2.lineWidth = 2.5; c2.beginPath(); c2.moveTo(Fr.X(R.b0 + R.b1 * 60), Fr.Y(60)); c2.lineTo(Fr.X(R.b0 + R.b1 * 78), Fr.Y(78)); c2.stroke(); }
      // the band's averages
      if (B.k) {
        var ax = Gs.axis ? B.other : B.own, ay = Gs.axis ? B.own : B.other, X = Fr.X(ax), Y = Fr.Y(ay);
        c2.strokeStyle = '#fff'; c2.lineWidth = 2; c2.setLineDash([3, 3]); c2.beginPath();
        if (!Gs.axis) { c2.moveTo(X, Y); c2.lineTo(X, Fr.Y(ax)); } else { c2.moveTo(X, Y); c2.lineTo(Fr.X(ay), Y); }
        c2.stroke(); c2.setLineDash([]);
        c2.fillStyle = '#fff'; c2.beginPath(); c2.arc(X, Y, 7, 0, 6.2832); c2.fill(); c2.strokeStyle = C.bg; c2.lineWidth = 2; c2.stroke();
        c2.fillStyle = C.ink; c2.font = '600 11px system-ui,sans-serif'; c2.textAlign = 'left'; c2.textBaseline = 'middle';
        var gap = (B.other - B.own), txt = (Gs.axis ? 'their parents: ' : 'their children: ') + fmt(B.other, 1) + ' in (' + (gap < 0 ? '−' : '+') + fmt(M.abs(gap), 1) + ')', tw = c2.measureText(txt).width;
        var tx = clamp(X + 12, Fr.x0 + 4, Fr.x0 + Fr.w - tw - 8), ty = clamp(Y + (Gs.axis ? -16 : 18), Fr.y0 + 12, Fr.y0 + Fr.h - 12);
        c2.fillStyle = 'rgba(6,17,26,.85)'; c2.fillRect(tx - 4, ty - 9, tw + 8, 18); c2.fillStyle = '#fff'; c2.fillText(txt, tx, ty);
      }
      c2.restore();
      // legend
      c2.font = '600 11px system-ui,sans-serif'; c2.textBaseline = 'middle'; c2.textAlign = 'left';
      var lx = Fr.x0 + 8, ly = Fr.y0 + 12;
      [['child = parent', C.gold], ['regression: child on parent', C.pink]].concat(Gs.rev ? [['parent on child', C.blue]] : []).forEach(function (it) { c2.fillStyle = it[1]; c2.fillRect(lx, ly - 2, 14, 3); c2.fillStyle = C.ink; c2.fillText(it[0], lx + 19, ly); ly += 16; });
    }
    cv2.addEventListener('pointerdown', function (ev) { drag(ev); cv2.setPointerCapture(ev.pointerId); cv2._d = true; });
    cv2.addEventListener('pointermove', function (ev) { if (cv2._d) drag(ev); });
    cv2.addEventListener('pointerup', function () { cv2._d = false; });
    function drag(ev) {
      var r = cv2.getBoundingClientRect(), W = G2.w, Hh = G2.h, left = W < 560 ? 50 : 60, mh = 34, w = W - left - 14 - mh, h = Hh - 14 - mh - 48;
      var v = Gs.axis ? 60 + (14 + mh + h - (ev.clientY - r.top)) / h * 18 : 60 + (ev.clientX - r.left - left) / w * 18;
      Gs.c = clamp(M.round(v * 2) / 2, 62, 76); $('ec4g-c').value = Gs.c; up2();
    }
    window.addEventListener('resize', function () { G2.fit(); up2(); });
    if (window.ResizeObserver) new ResizeObserver(function () { up2(); }).observe(cv2);
    regen();
  })();
})();
