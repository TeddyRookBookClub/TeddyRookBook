/* Newton's Laws of Motion, the unit hub: a Newton's cradle in the hero that you can pull and let go, and a small
   "how wrong is Newton?" calculator for speeds up to nearly the speed of light. SI units. */
(function () {
  'use strict';
  var LAB = window.TRBLab, root = document.getElementById('nlh-lab');
  if (!root || !LAB) return;
  function $(id) { return document.getElementById(id); }
  var fmt = LAB.fmt, reduced = LAB.reduced;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ---------- Newton's cradle ----------
  // Five equal steel balls on strings of length L. Between collisions each swings as a pendulum,
  // θ'' = −(g/L) sin θ − c θ'. Touching balls that move toward each other swap velocities (an elastic collision of
  // equal masses); repeating that along the row sends the push through the middle balls to the far end.
  var cv = $('nlh-cv');
  if (cv) {
    var K = LAB.canvas(cv), c = K.c, N = 5, L = 0.30, R = 0.046, g = 9.81, DAMP = 0.035, REST = 0.9985;
    var th = [], om = [], trail = [], flash = [], drag = null, idle = 0, auto = 0, showP = false;
    for (var i = 0; i < N; i++) { th.push(0); om.push(0); trail.push([]); flash.push(0); }
    function startPose(k) { for (var i = 0; i < N; i++) { th[i] = 0; om[i] = 0; } for (i = 0; i < k; i++) th[i] = -0.62; }
    startPose(1);
    function hx(i) { return (i - (N - 1) / 2) * 2 * R + L * Math.sin(th[i]); }   // horizontal position of ball i (m)
    function vx(i) { return L * om[i] * Math.cos(th[i]); }
    function collide() {
      for (var pass = 0; pass < 2 * N; pass++) {
        var any = false;
        for (var k = 0; k < N - 1; k++) {
          var a = pass % 2 ? N - 2 - k : k, b = a + 1;
          if (hx(b) - hx(a) <= 2 * R + 1e-6 && vx(a) - vx(b) > 1e-9) {
            var va = om[a], vb = om[b];
            om[a] = vb * REST + va * (1 - REST); om[b] = va * REST + vb * (1 - REST); any = true;
            flash[a] = flash[b] = 1;
          }
        }
        if (!any) break;
      }
      for (var k2 = 0; k2 < N - 1; k2++) {           // keep balls from sinking into each other
        var gap = hx(k2 + 1) - hx(k2) - 2 * R;
        if (gap < 0) { th[k2] += gap / 2 / L; th[k2 + 1] -= gap / 2 / L; }
      }
    }
    function step(dt) {
      var h = 1 / 1500, n = Math.round(dt / h);
      for (var s = 0; s < n; s++) {
        for (var i = 0; i < N; i++) {
          if (drag && drag.set.indexOf(i) >= 0) { om[i] = 0; continue; }
          om[i] += (-(g / L) * Math.sin(th[i]) - DAMP * om[i]) * h; th[i] += om[i] * h;
        }
        collide();
      }
    }
    function energy() { var e = 0; for (var i = 0; i < N; i++) e += 0.5 * L * L * om[i] * om[i] + g * L * (1 - Math.cos(th[i])); return e; }
    // drawing
    var G = {};
    function geo() {
      var W = K.w, H = K.h, hw = N * R + L * Math.sin(0.8) + 1.4 * R, S = Math.min(W / (2 * hw * 1.06), (H - 56) / (L + 2.4 * R));
      G = { W: W, H: H, S: S, hw: hw, px: W / 2, py: Math.max(26, (H - (L + 2.4 * R) * S) / 2 - 10) };
    }
    function bx(i) { return G.px + hx(i) * G.S; }
    function by(i) { return G.py + L * Math.cos(th[i]) * G.S; }
    function draw(dt) {
      K.fit(); geo();
      var W = G.W, H = G.H, S = G.S, r = R * S;
      c.clearRect(0, 0, W, H);
      var bgG = c.createRadialGradient(W / 2, H * 0.55, 10, W / 2, H * 0.55, Math.max(W, H) * 0.7);
      bgG.addColorStop(0, '#12314a'); bgG.addColorStop(1, '#06111a'); c.fillStyle = bgG; c.fillRect(0, 0, W, H);
      // frame: two top bars and posts
      var fw = 2 * G.hw * S, top = G.py, base = G.py + (L + 1.6 * R) * S;
      var spot = c.createRadialGradient(W / 2, top, 4, W / 2, top + (base - top) * 0.6, (base - top) * 1.1); spot.addColorStop(0, 'rgba(255,240,200,.10)'); spot.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = spot; c.fillRect(0, 0, W, H);
      var chrome = c.createLinearGradient(0, top - 10, 0, base); chrome.addColorStop(0, '#dbe7ef'); chrome.addColorStop(1, '#5d7d93');
      c.strokeStyle = chrome; c.lineWidth = 3.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(W / 2 - fw / 2, top - 8); c.lineTo(W / 2 + fw / 2, top - 8); c.moveTo(W / 2 - fw / 2 + 10, top + 4); c.lineTo(W / 2 + fw / 2 - 10, top + 4); c.stroke();
      c.lineWidth = 2.5; c.beginPath(); c.moveTo(W / 2 - fw / 2, top - 8); c.lineTo(W / 2 - fw / 2 - 6, base + 10); c.moveTo(W / 2 + fw / 2, top - 8); c.lineTo(W / 2 + fw / 2 + 6, base + 10); c.stroke();
      var bg2 = c.createLinearGradient(0, base + 6, 0, base + 24); bg2.addColorStop(0, '#24577a'); bg2.addColorStop(1, '#0b1d2d');
      c.fillStyle = bg2; c.beginPath(); c.moveTo(W / 2 - fw / 2 - 18, base + 10); c.lineTo(W / 2 + fw / 2 + 18, base + 10); c.lineTo(W / 2 + fw / 2 + 4, base + 26); c.lineTo(W / 2 - fw / 2 - 4, base + 26); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,212,121,.35)'; c.fillRect(W / 2 - fw / 2 - 18, base + 10, fw + 36, 1.5);
      for (var i = 0; i < N; i++) {
        var pxp = G.px + (i - (N - 1) / 2) * 2 * R * S, X = bx(i), Y = by(i);
        // shadow on the base
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(X, base + 15, r * 0.9, r * 0.2, 0, 0, 7); c.fill();
        var rf = c.createRadialGradient(X, base + 15, 1, X, base + 15, r * 1.1); rf.addColorStop(0, 'rgba(219,231,239,' + (0.18 * Math.max(0, 1 - (base - Y) / (3 * r))) + ')'); rf.addColorStop(1, 'rgba(219,231,239,0)'); c.fillStyle = rf; c.fillRect(X - r * 1.2, base + 8, r * 2.4, 14);
        // strings in a V, from the front and back bars
        c.strokeStyle = 'rgba(219,231,239,.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(pxp - 4, top - 8); c.lineTo(X, Y - r * 0.8); c.moveTo(pxp + 4, top + 4); c.lineTo(X, Y - r * 0.8); c.stroke();
        // a short motion trail
        var tr = trail[i]; tr.push([X, Y]); if (tr.length > 7) tr.shift();
        if (!reduced) for (var k = 0; k < tr.length - 1; k++) { var a = (k + 1) / tr.length; c.fillStyle = 'rgba(255,212,121,' + (0.06 * a) + ')'; c.beginPath(); c.arc(tr[k][0], tr[k][1], r * (0.7 + 0.3 * a), 0, 7); c.fill(); }
        // the ball
        if (!reduced && flash[i] > 0.05) { c.save(); c.shadowColor = '#ffd479'; c.shadowBlur = 24 * flash[i]; }
        var bgr = c.createRadialGradient(X - r * 0.4, Y - r * 0.45, r * 0.08, X, Y, r);
        bgr.addColorStop(0, '#ffffff'); bgr.addColorStop(0.25, '#e9f1f6'); bgr.addColorStop(0.65, '#8fa9bb'); bgr.addColorStop(1, '#2c4a60');
        c.fillStyle = bgr; c.beginPath(); c.arc(X, Y, r, 0, 7); c.fill();
        if (!reduced && flash[i] > 0.05) c.restore();
        c.fillStyle = 'rgba(255,212,121,.35)'; c.beginPath(); c.ellipse(X + r * 0.3, Y + r * 0.45, r * 0.35, r * 0.12, -0.4, 0, 7); c.fill();
        flash[i] = Math.max(0, flash[i] - dt * 4);
        if (showP) { var v = vx(i); if (Math.abs(v) > 0.03) { var Lp = v * S * 0.13; c.strokeStyle = '#63e6be'; c.fillStyle = '#63e6be'; c.lineWidth = 3; c.beginPath(); c.moveTo(X, Y + r + 10); c.lineTo(X + Lp, Y + r + 10); c.stroke(); c.beginPath(); c.moveTo(X + Lp + Math.sign(Lp) * 7, Y + r + 10); c.lineTo(X + Lp, Y + r + 5); c.lineTo(X + Lp, Y + r + 15); c.fill(); } }
      }
    }
    // pointer: pick up a ball (and any balls beyond it on that side) and let go
    function ptr(e) { var rc = cv.getBoundingClientRect(); return { x: e.clientX - rc.left, y: e.clientY - rc.top }; }
    function angleAt(p) { return clamp(Math.atan2(p.x - G.px - 0, Math.max(10, p.y - G.py)), -1.1, 1.1); }
    cv.addEventListener('pointerdown', function (e) {
      var p = ptr(e), best = -1, bd = 60;
      for (var i = 0; i < N; i++) { var d = Math.hypot(p.x - bx(i), p.y - by(i)); if (d < bd) { bd = d; best = i; } }
      if (best < 0) return;
      drag = { i: best, set: [] }; cv.setPointerCapture(e.pointerId); e.preventDefault(); idle = 0; moveDrag(p);
    });
    function moveDrag(p) {
      var i = drag.i, pivot = G.px + (i - (N - 1) / 2) * 2 * R * G.S, a = clamp(Math.atan2(p.x - pivot, Math.max(10, p.y - G.py)), -1.1, 1.1), j;
      drag.set = [];
      if (a < 0) { for (j = 0; j <= i; j++) { th[j] = a; om[j] = 0; drag.set.push(j); } for (j = i + 1; j < N; j++) if (th[j] < 0) { th[j] = 0; om[j] = 0; } }
      else { for (j = i; j < N; j++) { th[j] = a; om[j] = 0; drag.set.push(j); } for (j = 0; j < i; j++) if (th[j] > 0) { th[j] = 0; om[j] = 0; } }
      collide();
    }
    cv.addEventListener('pointermove', function (e) { if (drag) moveDrag(ptr(e)); else { var p = ptr(e), near = false; for (var i = 0; i < N; i++) if (Math.hypot(p.x - bx(i), p.y - by(i)) < 40) near = true; cv.style.cursor = near ? 'grab' : 'default'; } });
    function up() { drag = null; idle = 0; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k >= '1' && k <= '4') { startPose(+k); idle = 0; e.preventDefault(); if (reduced) cv.dispatchEvent(new Event('pointerdown')); }
      else if (k === 'm' || k === 'M') { showP = !showP; e.preventDefault(); }
    });
    var pBtn = $('nlh-p'), cap = $('nlh-cap');
    if (pBtn) pBtn.addEventListener('click', function () { showP = !showP; pBtn.setAttribute('aria-pressed', String(showP)); });
    root.querySelectorAll('[data-lift]').forEach(function (b) { b.addEventListener('click', function () { startPose(+b.dataset.lift); idle = 0; }); });
    // with reduced motion, the cradle waits as a still picture until you pick up a ball or press a button
    if (reduced) { var started = false; cv.addEventListener('pointerdown', function () { started = true; }); root.querySelectorAll('[data-lift]').forEach(function (b) { b.addEventListener('click', function () { started = true; }); }); LAB.loop(function () { if (started) step(1 / 60); draw(1 / 60); }, cv); }
    else LAB.loop(function (dt) {
      step(dt); draw(dt);
      // when it has almost stopped, lift one, two or three balls again on its own
      if (!drag) { idle = energy() < 0.002 ? idle + dt : 0; if (idle > 2.5) { auto = (auto % 3) + 1; startPose(auto); idle = 0; } }
    }, cv);
  }

  // ---------- how wrong is Newton? ----------
  var sp = $('nlh-v'), out = $('nlh-gamma');
  if (sp && out) {
    var CL = 299792458;   // speed of light, m/s (exact)
    var PRESETS = { walk: 1.4, car: 30, jet: 250, voyager: 16900, c10: 0.1 * CL, c50: 0.5 * CL, c90: 0.9 * CL, c99: 0.99 * CL };
    function vFromSlider(x) { return Math.pow(10, x); }           // slider is log10 of the speed in m/s
    function sci(x) {
      if (x === 0) return '0';
      if (x >= 0.01) return fmt(x, x >= 10 ? 1 : 2);
      var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
      return fmt(m, 1) + ' × 10' + String(e).replace('-', '⁻').replace(/[0-9]/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]; });
    }
    function show(v) {
      var b = v / CL, g2;
      var gm1 = b < 1e-4 ? 0.5 * b * b + 0.375 * b * b * b * b : 1 / Math.sqrt(1 - b * b) - 1;   // γ − 1, without rounding trouble
      g2 = 1 + gm1;
      var err = gm1 / g2 * 100;                                     // how far mv falls short of the true momentum, in percent
      var speed = v < 1000 ? fmt(v, v < 10 ? 1 : 0) + ' m/s (' + fmt(v * 3.6, 0) + ' km/h)' : v < 1e6 ? fmt(v / 1000, 1) + ' km/s' : fmt(b * 100, b > 0.989 ? 1 : 0) + '% of the speed of light';
      out.innerHTML = '<dt>Speed</dt><dd>' + speed + '</dd><dt>Relativity factor γ</dt><dd>' + (gm1 < 1e-6 ? '1 + ' + sci(gm1) : fmt(g2, 4)) + '</dd><dt>Newton’s momentum <var>mv</var> is too small by</dt><dd>' + sci(err) + '%</dd>';
      var bar = $('nlh-bar'); if (bar) bar.style.width = clamp(err, 0, 100) + '%';
    }
    sp.addEventListener('input', function () { show(vFromSlider(+sp.value)); root.querySelectorAll('[data-v]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); });
    root.querySelectorAll('[data-v]').forEach(function (b) {
      b.addEventListener('click', function () { var v = PRESETS[b.dataset.v]; sp.value = Math.log10(v); show(v); root.querySelectorAll('[data-v]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
    });
    show(30);
  }
})();
