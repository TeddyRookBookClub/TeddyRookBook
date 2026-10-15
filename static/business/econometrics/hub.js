/* Econometrics, the course hub: the hero animation. Two scenes that alternate:
   1. "Least squares, live": points rain in one by one, and the least-squares line refits and settles onto the
      true line as the sample grows. Tap to drop your own point into the fit.
   2. "A hidden third factor": a steep upward line through three clouds turns out to be three downward slopes once
      the hidden group is revealed (Simpson's paradox).
   With prefers-reduced-motion, each scene is a still frame. Uses TRBLab (lab.js) and EconStats (stats.js). */
(function () {
  'use strict';
  var L = window.TRBLab, ES = window.EconStats, root = document.getElementById('ech-lab');
  if (!L || !root) return;
  var cv = document.getElementById('ech-cv'); if (!cv) return;
  var M = Math, reduced = L.reduced, K = L.canvas(cv), c = K.c;
  var C = { bg: '#06111a', grid: 'rgba(120,170,200,.10)', text: '#8fb3c6', ink: '#dbe7ef', pink: '#f9a8d4', gold: '#ffd479', green: '#63e6be', blue: '#74c0fc', red: '#ff8787' };
  var r = ES ? ES.rng(1886) : { u: Math.random, n: function () { var u = 1 - Math.random(), v = Math.random(); return M.sqrt(-2 * M.log(u)) * M.cos(2 * M.PI * v); } };
  var GROUPS = [{ cx: 0.24, cy: 0.27, col: C.blue, name: 'cool days' }, { cx: 0.5, cy: 0.52, col: C.gold, name: 'warm days' }, { cx: 0.76, cy: 0.77, col: C.red, name: 'hot days' }];
  var S = { scene: 'fit', pts: [], t: 0, next: 0, line: null, truth: null, phase: 'grow', hold: 0, fade: 1, reveal: 0, flash: [] };

  function fitLine(P) {
    var n = P.length; if (n < 2) return null; var mx = 0, my = 0, i; for (i = 0; i < n; i++) { mx += P[i].x; my += P[i].y; } mx /= n; my /= n;
    var sxx = 0, sxy = 0; for (i = 0; i < n; i++) { sxx += (P[i].x - mx) * (P[i].x - mx); sxy += (P[i].x - mx) * (P[i].y - my); }
    if (sxx < 1e-9) return null; var b = sxy / sxx; return { a: my - b * mx, b: b };
  }
  function newPoint() {
    if (S.scene === 'fit') { var x = 0.06 + 0.88 * r.u(); return { x: x, y: S.truth.a + S.truth.b * x + 0.085 * r.n(), g: -1, age: 0 }; }
    var g = S.pts.length % 3, G = GROUPS[g], x2 = G.cx + 0.1 * (r.u() - 0.5) * 2;
    return { x: x2, y: G.cy - 0.7 * (x2 - G.cx) + 0.035 * r.n(), g: g, age: 0 };
  }
  function start(scene) {
    S.scene = scene; S.pts = []; S.t = 0; S.next = 0; S.line = null; S.phase = 'grow'; S.hold = 0; S.fade = 1; S.reveal = 0; S.flash = [];
    var b = 0.45 + 0.6 * r.u(); S.truth = { b: b, a: 0.5 - b * 0.5 + 0.06 * (r.u() - 0.5) };
    markScene();
    if (reduced) { var n = scene === 'fit' ? 60 : 45; for (var i = 0; i < n; i++) { var p = newPoint(); p.age = 9; S.pts.push(p); } S.line = fitLine(S.pts); S.phase = 'hold'; S.reveal = 1; draw(); }
  }
  var btns = document.querySelectorAll('[data-scene]');
  function markScene() { btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.scene === S.scene)); }); }
  btns.forEach(function (b) { b.addEventListener('click', function () { start(b.dataset.scene); }); });

  // geometry: plot area inside the canvas
  function geo() { var W = K.w, H = K.h, pad = 18; return { x0: pad, y0: 34, w: W - 2 * pad, h: H - 34 - 40 }; }
  function X(g, v) { return g.x0 + v * g.w; } function Y(g, v) { return g.y0 + g.h - v * g.h; }

  function draw() {
    K.fit(); var W = K.w, H = K.h, g = geo(); c.clearRect(0, 0, W, H);
    var bgG = c.createRadialGradient(W * 0.7, H * 0.2, 10, W * 0.5, H * 0.5, M.max(W, H)); bgG.addColorStop(0, '#0d2233'); bgG.addColorStop(1, C.bg); c.fillStyle = bgG; c.fillRect(0, 0, W, H);
    c.strokeStyle = C.grid; c.lineWidth = 1;
    for (var i = 0; i <= 5; i++) { var x = M.round(X(g, i / 5)) + 0.5, y = M.round(Y(g, i / 5)) + 0.5; c.beginPath(); c.moveTo(x, g.y0); c.lineTo(x, g.y0 + g.h); c.stroke(); c.beginPath(); c.moveTo(g.x0, y); c.lineTo(g.x0 + g.w, y); c.stroke(); }
    c.globalAlpha = S.fade;
    var fit = S.scene === 'fit', rv = S.reveal;
    // the truth (fit scene), fading in once the sample is decent
    if (fit && S.truth && S.pts.length > 12) {
      c.globalAlpha = S.fade * M.min(1, (S.pts.length - 12) / 15) * 0.9; c.strokeStyle = C.gold; c.setLineDash([7, 6]); c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(X(g, 0), Y(g, S.truth.a)); c.lineTo(X(g, 1), Y(g, S.truth.a + S.truth.b)); c.stroke(); c.setLineDash([]); c.globalAlpha = S.fade;
    }
    // residual flashes for newly landed points
    S.flash.forEach(function (f) { if (!S.line) return; c.strokeStyle = 'rgba(249,168,212,' + (0.8 * f.a) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(g, f.x), Y(g, f.y)); c.lineTo(X(g, f.x), Y(g, S.line.a + S.line.b * f.x)); c.stroke(); });
    // points (clipped to the plot)
    c.save(); c.beginPath(); c.rect(g.x0 - 6, 0, g.w + 12, g.y0 + g.h + 6); c.clip();
    S.pts.forEach(function (p) {
      var land = M.min(1, p.age / 0.45), e = 1 - M.pow(1 - land, 3), py = -0.12 + (p.y + 0.12) * e, col = p.g >= 0 && rv > 0 ? GROUPS[p.g].col : '#e4eef5';
      if (land < 1) { c.strokeStyle = 'rgba(219,231,239,' + (0.35 * (1 - land)) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(g, p.x), Y(g, py + 0.12)); c.lineTo(X(g, p.x), Y(g, py)); c.stroke(); }
      c.shadowColor = col; c.shadowBlur = 8; c.fillStyle = col; c.beginPath(); c.arc(X(g, p.x), Y(g, py), 3.4, 0, 6.2832); c.fill(); c.shadowBlur = 0;
      if (land >= 1 && p.age < 0.9) { var rr = (p.age - 0.45) / 0.45; c.strokeStyle = 'rgba(99,230,190,' + (0.7 * (1 - rr)) + ')'; c.lineWidth = 1.5; c.beginPath(); c.arc(X(g, p.x), Y(g, p.y), 4 + 14 * rr, 0, 6.2832); c.stroke(); }
    });
    c.restore();
    // the pooled least-squares line, with a glow
    if (S.line) {
      c.shadowColor = C.pink; c.shadowBlur = 12; c.strokeStyle = fit ? C.pink : 'rgba(249,168,212,' + (1 - 0.55 * rv) + ')'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(X(g, 0), Y(g, S.line.a)); c.lineTo(X(g, 1), Y(g, S.line.a + S.line.b)); c.stroke(); c.shadowBlur = 0;
    }
    // within-group lines in the confounder scene
    if (!fit && rv > 0) {
      GROUPS.forEach(function (G, k) {
        var P = S.pts.filter(function (p) { return p.g === k; }), f = fitLine(P); if (!f) return;
        var x1 = G.cx - 0.15, x2 = G.cx + 0.15, xm = G.cx, half = 0.15 * rv;
        c.shadowColor = G.col; c.shadowBlur = 10; c.strokeStyle = G.col; c.lineWidth = 3; c.beginPath(); c.moveTo(X(g, xm - half), Y(g, f.a + f.b * (xm - half))); c.lineTo(X(g, xm + half), Y(g, f.a + f.b * (xm + half))); c.stroke(); c.shadowBlur = 0;
      });
    }
    c.globalAlpha = 1;
    // captions
    c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = C.ink;
    c.fillText(fit ? 'Least squares, live' : 'A hidden third factor', 14, 10);
    c.font = '12px ui-monospace,Menlo,Consolas,monospace'; c.textBaseline = 'bottom';
    var n = S.pts.length;
    if (fit) {
      c.fillStyle = C.text; c.fillText('n = ' + n, 14, H - 12);
      if (S.line) { c.fillStyle = C.pink; c.fillText('slope ' + (S.line.b >= 0 ? '' : '−') + M.abs(S.line.b).toFixed(2), 74, H - 12); }
      if (S.truth && n > 12) { c.fillStyle = C.gold; c.fillText('truth ' + S.truth.b.toFixed(2), 172, H - 12); }
    } else {
      if (S.line) { c.fillStyle = C.pink; c.fillText('all days: slope +' + M.abs(S.line.b).toFixed(2), 14, H - 12); }
      if (rv > 0.5) { c.fillStyle = C.green; c.textAlign = 'right'; c.fillText('within each group: slope ≈ −0.7', W - 14, H - 12); }
    }
    if (!fit && rv > 0) {
      c.globalAlpha = rv; c.font = '600 11px system-ui,sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'center';
      GROUPS.forEach(function (G) { c.fillStyle = G.col; c.fillText(G.name, X(g, G.cx), Y(g, G.cy + 0.2)); }); c.globalAlpha = 1;
    }
  }

  function step(dt) {
    if (reduced) return;
    S.t += dt; var target = S.scene === 'fit' ? 70 : 54, spacing = S.scene === 'fit' ? 0.11 : 0.06;
    if (S.phase === 'grow') {
      S.next -= dt;
      if (S.next <= 0 && S.pts.length < target) { S.pts.push(newPoint()); S.next = spacing; }
      if (S.pts.length >= target && S.pts.every(function (p) { return p.age > 0.5; })) { S.phase = S.scene === 'fit' ? 'hold' : 'reveal'; S.hold = 0; }
    } else if (S.phase === 'reveal') { S.reveal = M.min(1, S.reveal + dt / 1.2); if (S.reveal >= 1) { S.phase = 'hold'; S.hold = 0; } }
    else if (S.phase === 'hold') { S.hold += dt; if (S.hold > 3.6) S.phase = 'fade'; }
    else if (S.phase === 'fade') { S.fade -= dt / 0.7; if (S.fade <= 0) { start(S.scene === 'fit' ? 'confound' : 'fit'); return; } }
    S.pts.forEach(function (p) { var was = p.age; p.age += dt; if (was < 0.45 && p.age >= 0.45) S.flash.push({ x: p.x, y: p.y, a: 1 }); });
    S.flash.forEach(function (f) { f.a -= dt / 0.8; }); S.flash = S.flash.filter(function (f) { return f.a > 0; });
    // the line eases toward the current least-squares fit of the landed points
    var landed = S.pts.filter(function (p) { return p.age >= 0.45; }), T = fitLine(landed);
    if (T) { if (!S.line) S.line = { a: T.a, b: T.b }; var k = M.min(1, dt * 5); S.line.a += (T.a - S.line.a) * k; S.line.b += (T.b - S.line.b) * k; }
  }
  L.loop(function (dt) { step(dt); if (!reduced) draw(); }, cv);
  // tap or click to drop your own point into the fit
  cv.addEventListener('pointerdown', function (ev) {
    var b = cv.getBoundingClientRect(), g = geo(), x = (ev.clientX - b.left - g.x0) / g.w, y = (g.y0 + g.h - (ev.clientY - b.top)) / g.h;
    if (x < 0 || x > 1 || y < -0.05 || y > 1.05) return;
    if (S.scene !== 'fit') start('fit');
    S.pts.push({ x: x, y: y, g: -1, age: reduced ? 9 : 0.45 }); if (S.phase === 'hold' || S.phase === 'fade') { S.phase = 'hold'; S.hold = 0; S.fade = 1; }
    if (reduced) { S.line = fitLine(S.pts); draw(); }
  });
  cv.addEventListener('keydown', function (e) {
    if (e.key === ' ') { e.preventDefault(); start(S.scene === 'fit' ? 'confound' : 'fit'); }
    else if (e.key === 'Enter') { if (S.scene !== 'fit') start('fit'); var p = newPoint(); p.age = reduced ? 9 : 0; S.pts.push(p); if (reduced) { S.line = fitLine(S.pts); draw(); } }
  });
  window.addEventListener('resize', function () { K.fit(); draw(); });
  if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(cv);
  start('fit'); draw();
})();
