/* Math Ladder visuals made for Precalculus (course key "pre"). Load after viz/core.js (and the CAS for pre-param).
   Each visual follows the site theme, works with mouse, touch and keyboard, and keeps a live text readout.

   pre-radian   An angle measured in radii: the arc is cut into pieces one radius long.
     opts: theta: 1          starting angle in radians (a number or a CAS string such as "pi/3")
           r: 2              radius (shown as a length; a slider lets learners change it when rslider is true)
           rslider: false    add a radius slider
           sector: false     shade the sector and report its area ½r²θ
           snap: 0.01        the angle snaps to multiples of this (radians); 0 for none
           task, target      a goal: an angle in radians to reach (within 0.03)
   pre-bearing  A compass: a direction as a bearing (clockwise from north), in N/S … E/W form, and as a standard angle.
     opts: bearing: 40       starting bearing in degrees
           snap: 5           degrees per step
           task, target      a bearing to reach (degrees)
   pre-param    A parametric curve x(t), y(t) traced by a moving point, with arrows for the direction of motion.
     opts: x: "3cos(t)", y: "2sin(t)"   the coordinates in t (CAS syntax; other letters are parameters)
           t0: 0, t1: "2pi"            the range of t
           t: 0                         the starting t
           params: {"v": [20, 80, 48, 4]}  sliders for parameters ([min, max, value, step], or {min, max, value, step, label})
           land: false                  stop the path where y comes back down to 0 (projectiles); t1 is then the latest end
           xmin, xmax, ymin, ymax       the window (default: fit the curve); equal: true keeps circles round
           vel: false                   draw the velocity vector at the point, with its x and y parts
           ground: false                shade below y = 0 (for projectiles)
           tunit: ""                    a unit for t in the readout, such as "s"
   pre-conic    Conics by distances: drag P along an ellipse, hyperbola or parabola and compare its distances.
     opts: type: "ellipse"             "ellipse", "hyperbola" or "parabola"; types: [...] offers a choice
           a: 5, b: 3                   semi-axes (ellipse, hyperbola); p: 1 for the parabola x² = 4py (or y² = 4px)
           vertical: false              major axis (or opening) along y
           sliders: true                sliders for a and b (or p)
           s: 0.8                       where P starts on the curve (a curve parameter)                                  */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, PI = M.PI, TAU = 2 * PI, fm = V.fmt;

  // ---------- styles (injected once) ----------
  if (!D.getElementById('mlpre-css')) {
    var st = D.createElement('style'); st.id = 'mlpre-css';
    st.textContent = '.mlpre-task{display:flex;gap:.55rem;align-items:flex-start;margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}' +
      '.mlpre-tk{flex:0 0 auto;width:1.25rem;height:1.25rem;margin-top:.1rem;border-radius:50%;border:2px solid #b8963e;box-sizing:border-box;position:relative}' +
      '.mlpre-task.ok{border-left-color:#2b8a3e}.mlpre-task.ok .mlpre-tk{background:#2b8a3e;border-color:#2b8a3e}' +
      'html[data-theme="dark"] .mlpre-task.ok{border-left-color:#6cc79a}html[data-theme="dark"] .mlpre-task.ok .mlpre-tk{background:#6cc79a;border-color:#6cc79a}' +
      '.mlpre-task.ok .mlpre-tk::after{content:"";position:absolute;left:.33rem;top:.12rem;width:.28rem;height:.55rem;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}' +
      '.mlpre-b{font-weight:700;color:#1c6fd6}.mlpre-r{font-weight:700;color:#d6336c}.mlpre-g{font-weight:700;color:#00703c}.mlpre-o{font-weight:700;color:#b8860b}' +
      'html[data-theme="dark"] .mlpre-b{color:#74c0fc}html[data-theme="dark"] .mlpre-r{color:#ff8787}html[data-theme="dark"] .mlpre-g{color:#6cc79a}html[data-theme="dark"] .mlpre-o{color:#ffd479}';
    D.head.appendChild(st);
  }

  // ---------- helpers ----------
  function num(v, d) { // a number from a number or a CAS string ("pi/3", "2pi")
    if (typeof v === 'number') return isFinite(v) ? v : d;
    if (v == null || v === '') return d;
    var x = +v; if (!isNaN(x)) return x;
    try { var C = W.CAS; var y = C.evalNum(C.parse(String(v)), {}); if (typeof y === 'number' && isFinite(y)) return y; } catch (e) { }
    return d;
  }
  function frame(el, o, label) {
    el.setAttribute('role', 'group'); if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = V.el('p', 'mlpre-task', '<span class="mlpre-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = V.el('div', ''); el.appendChild(F.box);
    F.ctl = V.el('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    F.done = function (ok) { if (F.task) F.task.classList.toggle('ok', !!ok); };
    return F;
  }
  function knob(ctx, x, y, col, r) { var k = V.colors(); r = r || 8; ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, TAU); ctx.fill(); ctx.restore(); }
  function ring(ctx, x, y) { var k = V.colors(); ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.stroke(); ctx.restore(); }
  function pill(ctx, s, x, y, col, w, h) { var k = V.colors(); ctx.save(); ctx.font = '600 13px system-ui,sans-serif'; var tw = ctx.measureText(s).width; var bx = M.max(2, M.min(x - tw / 2 - 5, (w || 1e4) - tw - 12)), by = M.max(2, M.min(y - 10, (h || 1e4) - 22)); ctx.fillStyle = k.bg; ctx.globalAlpha = 0.88; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, tw + 10, 20, 6); else ctx.rect(bx, by, tw + 10, 20); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = col || k.ink; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 5, by + 10.5); ctx.restore(); }
  function keys(cv, step) { // arrow keys -> step(+1/-1, big)
    cv.tabIndex = 0;
    cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (!d) return; step(d, e.shiftKey); e.preventDefault(); });
  }
  function focusRing(cv, fn) { var f = false; cv.addEventListener('focus', function () { f = true; fn(); }); cv.addEventListener('blur', function () { f = false; fn(); }); return function () { return f; }; }
  function piText(x) { // a multiple of pi when it is one (denominators up to 12), else a decimal
    if (M.abs(x) < 1e-9) return '0';
    for (var d = 1; d <= 12; d++) { var n = M.round(x * d / PI); if (n && M.abs(n * PI / d - x) < 1e-9) return (n < 0 ? '−' : '') + (M.abs(n) === 1 ? '' : M.abs(n)) + 'π' + (d === 1 ? '' : '/' + d); }
    return fm(x, 2);
  }

  // ===================================================================== pre-radian
  V.register('pre-radian', function (el, o) {
    var th = num(o.theta, 1), r = num(o.r, 2), snap = o.snap == null ? 0.01 : +o.snap, tgt = o.target != null ? num(o.target, null) : null;
    var F = frame(el, o, 'An angle measured in radii: the arc is marked in pieces one radius long');
    var c = V.canvas(F.box, { aspect: 1.25, min: 260, max: 420 }), P = V.plane(c, { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, equal: true });
    var sTh = V.slider(F.ctl, { label: 'Angle θ (radians)', min: 0, max: 6.28, step: snap || 0.01, value: th, fmt: function (v) { return fm(v, 2); }, input: function (v) { th = v; draw(); } });
    var sR = o.rslider ? V.slider(F.ctl, { label: 'Radius r', min: 1, max: 6, step: 0.5, value: r, input: function (v) { r = v; draw(); } }) : null;
    var focused = focusRing(c.cv, draw);
    function setTh(v) { th = M.max(0, M.min(TAU, snap ? M.round(v / snap) * snap : v)); sTh.set(th); draw(); }
    V.drag(c.cv, { hit: function (px, py) { return M.hypot(px - P.X(M.cos(th)), py - P.Y(M.sin(th))) < 26 ? 1 : null; }, move: function (h, px, py) { var a = M.atan2(P.y(py), P.x(px)); if (a < 0) a += TAU; if (th > 5.5 && a < 0.8) a = TAU; setTh(a); } });
    c.cv.style.touchAction = 'pan-y';
    keys(c.cv, function (d, big) { setTh(th + d * (big ? 0.25 : (snap || 0.01) * 5)); });
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear();
      // sector
      if (o.sector) { ctx.save(); ctx.fillStyle = k.goldSoft; ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(0)); for (var i = 0; i <= 120; i++) { var a0 = th * i / 120; ctx.lineTo(P.X(M.cos(a0)), P.Y(M.sin(a0))); } ctx.closePath(); ctx.fill(); ctx.restore(); }
      P.circle(0, 0, 1, { color: 'muted', width: 1.5 });
      P.seg(-1.2, 0, 1.2, 0, { color: 'grid', width: 1 }); P.seg(0, -1.2, 0, 1.2, { color: 'grid', width: 1 });
      // arc colored in one-radius pieces
      var cols = [k.blue, k.red];
      for (var j = 0; j < M.ceil(th); j++) { var a1 = j, a2 = M.min(th, j + 1); ctx.save(); ctx.strokeStyle = cols[j % 2]; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.beginPath(); for (var q = 0; q <= 40; q++) { var aa = a1 + (a2 - a1) * q / 40; var X = P.X(M.cos(aa)), Y = P.Y(M.sin(aa)); if (q) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.stroke(); ctx.restore(); }
      // tick marks at whole radians, labelled
      for (var t = 1; t <= 6; t++) { var cx = M.cos(t), sy = M.sin(t); P.seg(cx * 0.94, sy * 0.94, cx * 1.06, sy * 1.06, { color: t <= th + 1e-9 ? 'ink' : 'muted', width: 2 }); P.text(String(t), cx * 1.15, sy * 1.15, { align: 'center', size: 13, bold: true, color: t <= th + 1e-9 ? 'ink' : 'muted' }); }
      P.text('2π ≈ 6.28', 1.0, -0.12, { align: 'right', size: 11, color: 'muted' });
      // the radius, copied along the start ray, and the terminal ray
      P.seg(0, 0, 1, 0, { color: 'blue', width: 4 }); P.text('r', 0.5, 0.08, { align: 'center', italic: true, color: 'blue', size: 15 });
      P.seg(0, 0, M.cos(th), M.sin(th), { color: 'ink', width: 2.5 });
      // angle mark
      ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.beginPath(); for (var m = 0; m <= 60; m++) { var am = th * m / 60; var X2 = P.X(0.18 * M.cos(am)), Y2 = P.Y(0.18 * M.sin(am)); if (m) ctx.lineTo(X2, Y2); else ctx.moveTo(X2, Y2); } ctx.stroke(); ctx.restore();
      knob(ctx, P.X(M.cos(th)), P.Y(M.sin(th)), k.red); if (focused()) ring(ctx, P.X(M.cos(th)), P.Y(M.sin(th)));
      var deg = th * 180 / PI, s = r * th;
      var html = 'θ = <span class="mlpre-b">' + fm(th, 2) + '</span> radians' + (piText(th).indexOf('π') >= 0 ? ' (' + piText(th) + ')' : '') + ' ≈ ' + fm(deg, 1) + '°. The arc is <b>' + fm(th, 2) + (fm(th, 2) === '1' ? ' radius' : ' radii') + '</b> long' + ', so with r = ' + fm(r) + ': arc length s = rθ = ' + fm(r) + ' × ' + fm(th, 2) + ' = <span class="mlpre-r">' + fm(s, 2) + '</span>.';
      if (o.sector) html += ' Sector area = ½r²θ = ½ × ' + fm(r * r) + ' × ' + fm(th, 2) + ' = <span class="mlpre-o">' + fm(0.5 * r * r * th, 2) + '</span>.';
      F.out.set(html);
      if (tgt != null) F.done(M.abs(th - tgt) < 0.03);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ===================================================================== pre-bearing
  V.register('pre-bearing', function (el, o) {
    var b = num(o.bearing, 40), snap = o.snap == null ? 5 : +o.snap, tgt = o.target != null ? num(o.target, null) : null;
    var F = frame(el, o, 'A compass: a direction as a bearing and as a standard-position angle');
    var c = V.canvas(F.box, { aspect: 1.3, min: 260, max: 400 }), P = V.plane(c, { xmin: -1.4, xmax: 1.4, ymin: -1.3, ymax: 1.3, equal: true });
    var sB = V.slider(F.ctl, { label: 'Bearing (degrees clockwise from north)', min: 0, max: 359, step: snap || 1, value: b, fmt: function (v) { return fm(v, 0) + '°'; }, input: function (v) { b = v; draw(); } });
    var focused = focusRing(c.cv, draw);
    function dir(bb) { var a = (90 - bb) * PI / 180; return [M.cos(a), M.sin(a)]; }
    function setB(v) { v = ((v % 360) + 360) % 360; b = snap ? M.round(v / snap) * snap % 360 : v; sB.set(b); draw(); }
    V.drag(c.cv, { hit: function (px, py) { var d = dir(b); return M.hypot(px - P.X(d[0]), py - P.Y(d[1])) < 28 ? 1 : null; }, move: function (h, px, py) { var a = M.atan2(P.y(py), P.x(px)) * 180 / PI; setB(90 - a); } });
    c.cv.style.touchAction = 'pan-y';
    keys(c.cv, function (d, big) { setB(b + d * (big ? 30 : snap || 1)); });
    function compass(bb) { bb = M.round(bb); if (bb % 90 === 0) return 'due ' + ['north', 'east', 'south', 'west'][bb / 90 % 4]; if (bb < 90) return 'N ' + bb + '° E'; if (bb < 180) return 'S ' + (180 - bb) + '° E'; if (bb < 270) return 'S ' + (bb - 180) + '° W'; return 'N ' + (360 - bb) + '° W'; }
    function arc(ctx, r, a0, a1, col, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash(dash || []); ctx.beginPath(); for (var i = 0; i <= 80; i++) { var a = a0 + (a1 - a0) * i / 80; var X = P.X(r * M.cos(a)), Y = P.Y(r * M.sin(a)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.stroke(); ctx.restore(); }
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear();
      P.circle(0, 0, 1, { color: 'grid', width: 1.5 });
      for (var t = 0; t < 360; t += 30) { var d0 = dir(t); P.seg(d0[0] * 0.93, d0[1] * 0.93, d0[0], d0[1], { color: 'muted', width: 1.5 }); }
      P.seg(0, -1, 0, 1, { color: 'grid', width: 1 }); P.seg(-1, 0, 1, 0, { color: 'grid', width: 1 });
      P.text('N', 0, 1.15, { align: 'center', bold: true, size: 15 }); P.text('S', 0, -1.15, { align: 'center', bold: true, size: 15 }); P.text('E', 1.15, 0, { align: 'center', bold: true, size: 15 }); P.text('W', -1.15, 0, { align: 'center', bold: true, size: 15 });
      var std = ((90 - b) % 360 + 360) % 360;
      arc(ctx, 0.45, PI / 2, PI / 2 - b * PI / 180, k.gold);
      arc(ctx, 0.3, 0, std * PI / 180, k.blue, [5, 4]);
      var d = dir(b); P.arrow(0, 0, d[0], d[1], { color: 'red', width: 3, head: 14 });
      knob(ctx, P.X(d[0]), P.Y(d[1]), k.red); if (focused()) ring(ctx, P.X(d[0]), P.Y(d[1]));
      F.out.set('Bearing <span class="mlpre-o">' + fm(b, 0) + '°</span> (gold, clockwise from north) = <b>' + compass(b) + '</b>. As a standard-position angle (blue, counterclockwise from east): <span class="mlpre-b">' + fm(std, 0) + '°</span> = 90° − ' + fm(b, 0) + '°' + (90 - b < 0 ? ' + 360°' : '') + '.');
      if (tgt != null) F.done(M.abs(b - tgt) < 0.5);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ===================================================================== pre-param
  V.register('pre-param', function (el, o) {
    var C = W.CAS; if (!C) throw new Error('pre-param needs the CAS');
    var t0 = num(o.t0, 0), t1max = num(o.t1, TAU), t1 = t1max, t = num(o.t, t0), Pm = {}, names = [];
    Object.keys(o.params || {}).forEach(function (k2) { var s = o.params[k2]; names.push(k2); Pm[k2] = Array.isArray(s) ? num(s[2], 1) : s && typeof s === 'object' ? num(s.value, 1) : num(s, 1); });
    function comp(src) { var tr = C.parse(String(src)), vars = ['t'].concat(names); var g = C.compile(tr, vars); return function (tt) { try { return +g.apply(null, [tt].concat(names.map(function (n2) { return Pm[n2]; }))); } catch (e) { return NaN; } }; }
    var fx = comp(o.x || 'cos(t)'), fy = comp(o.y || 'sin(t)');
    function ends() { // with land: stop the path when y comes back down to 0
      t1 = t1max; if (!o.land) return;
      for (var i = 1; i <= 800; i++) { var tt = t0 + (t1max - t0) * i / 800; if (fy(tt) < 0 && tt > t0 + 1e-6) { var a = t0 + (t1max - t0) * (i - 1) / 800, b = tt; for (var k = 0; k < 40; k++) { var m = (a + b) / 2; if (fy(m) >= 0) a = m; else b = m; } t1 = a; break; } }
      if (sT) { sT.input.max = t1; sT.input.step = (t1 - t0) / 400; if (t > t1) { t = t1; } sT.set(t); }
    }
    var sT = null;
    var F = frame(el, o, 'A parametric curve traced by a moving point');
    var c = V.canvas(F.box, { aspect: 1.5, min: 260, max: 440 }), P = V.plane(c, { xmin: -5, xmax: 5, ymin: -5, ymax: 5, equal: o.equal !== false });
    function fit() {
      if (o.xmin != null) { P.set({ xmin: num(o.xmin, -5), xmax: num(o.xmax, 5), ymin: num(o.ymin, -5), ymax: num(o.ymax, 5) }); return; }
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (var i = 0; i <= 200; i++) { var tt = t0 + (t1 - t0) * i / 200, X = fx(tt), Y = fy(tt); if (!isFinite(X) || !isFinite(Y)) continue; x0 = M.min(x0, X); x1 = M.max(x1, X); y0 = M.min(y0, Y); y1 = M.max(y1, Y); }
      var px = M.max(0.5, (x1 - x0) * 0.12), py = M.max(0.5, (y1 - y0) * 0.12); P.set({ xmin: M.min(x0 - px, o.ground ? -px : x0 - px), xmax: x1 + px, ymin: M.min(y0 - py, o.ground ? -py : y0 - py), ymax: y1 + py });
    }
    ends(); t = M.min(t, t1);
    sT = V.slider(F.ctl, { label: 't', min: t0, max: t1, step: (t1 - t0) / 400, value: t, fmt: function (v) { return (piText(v).indexOf('π') >= 0 ? piText(v) : fm(v, 2)) + (o.tunit ? ' ' + o.tunit : ''); }, input: function (v) { t = v; draw(); } });
    names.forEach(function (n2) { var s = o.params[n2], ob = s && typeof s === 'object' && !Array.isArray(s); var lo = Array.isArray(s) ? num(s[0], 0) : ob ? num(s.min, 0) : -5, hi = Array.isArray(s) ? num(s[1], 10) : ob ? num(s.max, 10) : 5, stp = Array.isArray(s) && s[3] != null ? num(s[3], 0.1) : ob && s.step != null ? num(s.step, 0.1) : (hi - lo) / 100; V.slider(F.ctl, { label: ob && s.label ? s.label : n2, min: lo, max: hi, step: stp, value: Pm[n2], input: function (v) { Pm[n2] = v; ends(); fit(); draw(); } }); });
    var play = V.button(F.ctl, '▶ Play', function () { if (V.reduced) { t = t1; sT.set(t); draw(); return; } if (run) { run = false; play.textContent = '▶ Play'; return; } if (t >= t1 - 1e-9) t = t0; run = true; play.textContent = '❚❚ Pause'; lp.start(); });
    play.setAttribute('aria-label', 'Play: move the point along the curve');
    var run = false, lp = V.loop(el, function (dt) { if (!run) { lp.stop(); return; } t = M.min(t1, t + dt * (t1 - t0) / 6); sT.set(t); draw(); if (t >= t1) { run = false; play.textContent = '▶ Play'; lp.stop(); } });
    lp.stop();
    var focused = focusRing(c.cv, draw);
    V.drag(c.cv, { hit: function (px, py) { return M.hypot(px - P.X(fx(t)), py - P.Y(fy(t))) < 26 ? 1 : null; }, move: function (h, px, py) { var best = t, bd = 1e9; for (var i = 0; i <= 400; i++) { var tt = t0 + (t1 - t0) * i / 400, d = M.hypot(P.X(fx(tt)) - px, P.Y(fy(tt)) - py) + M.abs(tt - t) * 0.5; if (d < bd) { bd = d; best = tt; } } t = best; sT.set(t); draw(); } });
    c.cv.style.touchAction = 'pan-y';
    keys(c.cv, function (d, big) { t = M.max(t0, M.min(t1, t + d * (t1 - t0) / (big ? 20 : 100))); sT.set(t); draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear(); P.grid(); P.axes({ x: 'x', y: 'y' });
      if (o.ground) { var v = P.view(); P.poly([[v.xmin, 0], [v.xmax, 0], [v.xmax, v.ymin], [v.xmin, v.ymin]], { fill: 'greenSoft', stroke: false }); }
      P.param(fx, fy, t0, t1, { color: 'muted', width: 1.5, dash: [5, 5], n: 500 });
      if (t > t0) P.param(fx, fy, t0, t, { color: 'blue', width: 3.5, n: 400 });
      // direction arrows along the curve
      for (var i = 1; i <= 5; i++) { var ta = t0 + (t1 - t0) * (i - 0.5) / 5, tb = ta + (t1 - t0) / 400, xa = fx(ta), ya = fy(ta), xb = fx(tb), yb = fy(tb); if (![xa, ya, xb, yb].every(isFinite)) continue; var L = M.hypot(P.X(xb) - P.X(xa), P.Y(yb) - P.Y(ya)); if (L < 1e-6) continue; var ux = (P.X(xb) - P.X(xa)) / L, uy = (P.Y(yb) - P.Y(ya)) / L, X = P.X(xa), Y = P.Y(ya); ctx.save(); ctx.fillStyle = k.green; ctx.beginPath(); ctx.moveTo(X + ux * 9, Y + uy * 9); ctx.lineTo(X - ux * 6 - uy * 6, Y - uy * 6 + ux * 6); ctx.lineTo(X - ux * 6 + uy * 6, Y - uy * 6 - ux * 6); ctx.closePath(); ctx.fill(); ctx.restore(); }
      var X0 = fx(t), Y0 = fy(t);
      if (o.vel) { var h = 1e-4, vx = (fx(t + h) - fx(t - h)) / (2 * h), vy = (fy(t + h) - fy(t - h)) / (2 * h), pxu = P.X(1) - P.X(0), pyu = P.Y(0) - P.Y(1), sc = 70 / M.max(1e-9, M.hypot(vx * pxu, vy * pyu)); P.arrow(X0, Y0, X0 + vx * sc, Y0, { color: 'orange', width: 2.5, head: 9 }); P.arrow(X0, Y0, X0, Y0 + vy * sc, { color: 'purple', width: 2.5, head: 9 }); P.arrow(X0, Y0, X0 + vx * sc, Y0 + vy * sc, { color: 'red', width: 3, head: 11 }); }
      if (isFinite(X0) && isFinite(Y0)) { knob(ctx, P.X(X0), P.Y(Y0), k.red); if (focused()) ring(ctx, P.X(X0), P.Y(Y0)); }
      var tl = (piText(t).indexOf('π') >= 0 ? piText(t) : fm(t, 2)) + (o.tunit ? ' ' + o.tunit : '');
      var s = 't = ' + tl + ': (x, y) = (<span class="mlpre-b">' + fm(X0, 2) + '</span>, <span class="mlpre-r">' + fm(Y0, 2) + '</span>). The green arrowheads show the direction of motion as t increases.';
      if (o.vel) { var hh = 1e-4, vxx = (fx(t + hh) - fx(t - hh)) / (2 * hh), vyy = (fy(t + hh) - fy(t - hh)) / (2 * hh); s += ' Velocity: horizontal ' + fm(vxx, 1) + ', vertical ' + fm(vyy, 1) + ' (speed ' + fm(M.hypot(vxx, vyy), 1) + ').'; }
      F.out.set(s);
    }
    fit(); c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ===================================================================== pre-conic
  V.register('pre-conic', function (el, o) {
    var S = { type: o.type || 'ellipse', a: num(o.a, 5), b: num(o.b, 3), p: num(o.p, 1), s: num(o.s, 0.8), vert: !!o.vertical };
    var F = frame(el, o, 'A conic section with its foci and the distances that define it');
    if (o.types && o.types.length > 1) V.seg(F.ctl, { label: 'Conic', items: o.types.map(function (x) { return [x, x[0].toUpperCase() + x.slice(1)]; }), value: S.type, change: function (v) { S.type = v; S.s = 0.8; sliders(); draw(); } });
    var c = V.canvas(F.box, { aspect: 1.45, min: 260, max: 440 }), P = V.plane(c, { xmin: -10, xmax: 10, ymin: -7, ymax: 7, equal: true });
    var sl = V.el('div', 'ml-ctl'); el.insertBefore(sl, F.out.el);
    function sliders() {
      sl.innerHTML = ''; if (o.sliders === false) return;
      if (S.type === 'parabola') V.slider(sl, { label: 'p (vertex to focus)', min: 0.5, max: 4, step: 0.25, value: S.p, input: function (v) { S.p = v; draw(); } });
      else { V.slider(sl, { label: 'a', min: 1, max: 8, step: 0.5, value: S.a, input: function (v) { S.a = v; draw(); } }); V.slider(sl, { label: 'b', min: 1, max: 8, step: 0.5, value: S.b, input: function (v) { S.b = v; draw(); } }); }
    }
    sliders();
    function pt(s) { // a point on the curve for parameter s (local coordinates, horizontal orientation)
      if (S.type === 'ellipse') { var A = M.max(S.a, S.b), B = M.min(S.a, S.b); return [A * M.cos(s), B * M.sin(s)]; }
      if (S.type === 'hyperbola') { var br = M.cos(s) >= 0 ? 1 : -1; var sh = M.max(-2.2, M.min(2.2, M.sin(s) * 2.2)); return [br * S.a * Math.cosh(sh), S.b * Math.sinh(sh)]; }
      var y = M.max(-3, M.min(3, M.tan(s / 2.2))) * 2; return [y * y / (4 * S.p), y]; // parabola y^2 = 4px
    }
    function rot(q) { return S.vert ? [q[1], q[0]] : q; }
    function foci() { if (S.type === 'ellipse') { var A = M.max(S.a, S.b), B = M.min(S.a, S.b), cc = M.sqrt(A * A - B * B); return [[cc, 0], [-cc, 0]]; } if (S.type === 'hyperbola') { var c2 = M.sqrt(S.a * S.a + S.b * S.b); return [[c2, 0], [-c2, 0]]; } return [[S.p, 0]]; }
    var focused = focusRing(c.cv, draw);
    V.drag(c.cv, { hit: function (px, py) { var q = rot(pt(S.s)); return M.hypot(px - P.X(q[0]), py - P.Y(q[1])) < 28 ? 1 : null; }, move: function (h, px, py) { var best = S.s, bd = 1e9; for (var i = 0; i <= 720; i++) { var ss = -PI + TAU * i / 720, q = rot(pt(ss)), d = M.hypot(P.X(q[0]) - px, P.Y(q[1]) - py); if (d < bd) { bd = d; best = ss; } } S.s = best; draw(); } });
    c.cv.style.touchAction = 'pan-y';
    keys(c.cv, function (d, big) { S.s += d * (big ? 0.3 : 0.06); if (S.s > PI) S.s -= TAU; if (S.s < -PI) S.s += TAU; draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear(); P.grid(); P.axes();
      var fx = function (s) { return rot(pt(s))[0]; }, fy = function (s) { return rot(pt(s))[1]; };
      if (S.type === 'hyperbola') { P.param(fx, fy, -PI / 2 + 0.001, PI / 2 - 0.001, { color: 'blue', width: 3, n: 400 }); P.param(fx, fy, PI / 2 + 0.001, 3 * PI / 2 - 0.001, { color: 'blue', width: 3, n: 400 }); var v = P.view(), m = S.b / S.a; [1, -1].forEach(function (sg) { if (S.vert) P.plot(function (x) { return sg * x / m; }, { color: 'muted', width: 1.2, dash: [6, 6] }); else P.plot(function (x) { return sg * m * x; }, { color: 'muted', width: 1.2, dash: [6, 6] }); }); }
      else if (S.type === 'ellipse') P.param(fx, fy, -PI, PI, { color: 'blue', width: 3, n: 400 });
      else { P.param(fx, fy, -PI * 0.999, PI * 0.999, { color: 'blue', width: 3, n: 400 }); var dv = P.view(); if (S.vert) P.seg(dv.xmin, -S.p, dv.xmax, -S.p, { color: 'purple', width: 2, dash: [7, 5] }); else P.seg(-S.p, dv.ymin, -S.p, dv.ymax, { color: 'purple', width: 2, dash: [7, 5] }); }
      var fs = foci().map(rot), q = rot(pt(S.s)), d1 = M.hypot(q[0] - fs[0][0], q[1] - fs[0][1]);
      P.seg(q[0], q[1], fs[0][0], fs[0][1], { color: 'red', width: 2.5 });
      if (fs[1]) P.seg(q[0], q[1], fs[1][0], fs[1][1], { color: 'green', width: 2.5 });
      var dd = 0; if (S.type === 'parabola') { var foot = S.vert ? [q[0], -S.p] : [-S.p, q[1]]; dd = M.hypot(q[0] - foot[0], q[1] - foot[1]); P.seg(q[0], q[1], foot[0], foot[1], { color: 'green', width: 2.5 }); }
      fs.forEach(function (f, i) { P.point(f[0], f[1], { color: 'gold', r: 6 }); P.text('F' + (fs.length > 1 ? (i + 1 === 1 ? '₁' : '₂') : ''), f[0], f[1] - 0.6, { align: 'center', bold: true, size: 13 }); });
      knob(ctx, P.X(q[0]), P.Y(q[1]), k.red); if (focused()) ring(ctx, P.X(q[0]), P.Y(q[1]));
      var vw = P.view(), up = q[1] + 0.9 < vw.ymax; P.text('P', M.min(q[0] + 0.45, vw.xmax - 0.6), up ? q[1] + 0.55 : q[1] - 0.55, { bold: true, size: 14 });
      var s;
      if (S.type === 'ellipse') { var A = M.max(S.a, S.b), B = M.min(S.a, S.b), d2 = M.hypot(q[0] - fs[1][0], q[1] - fs[1][1]); s = 'Ellipse with a = ' + fm(A) + ', b = ' + fm(B) + ', c = √(a² − b²) = ' + fm(M.sqrt(A * A - B * B)) + '. <span class="mlpre-r">PF₁ = ' + fm(d1) + '</span> and <span class="mlpre-g">PF₂ = ' + fm(d2) + '</span> add to <b>' + fm(d1 + d2) + '</b> = 2a, wherever P is.'; }
      else if (S.type === 'hyperbola') { var d3 = M.hypot(q[0] - fs[1][0], q[1] - fs[1][1]); s = 'Hyperbola with a = ' + fm(S.a) + ', b = ' + fm(S.b) + ', c = √(a² + b²) = ' + fm(M.sqrt(S.a * S.a + S.b * S.b)) + '. <span class="mlpre-r">PF₁ = ' + fm(d1) + '</span> and <span class="mlpre-g">PF₂ = ' + fm(d3) + '</span> differ by <b>' + fm(M.abs(d1 - d3)) + '</b> = 2a, wherever P is. The dashed lines are the asymptotes.'; }
      else s = 'Parabola with p = ' + fm(S.p) + ' (vertex to focus). <span class="mlpre-r">PF = ' + fm(d1) + '</span> and the distance to the directrix (dashed) is <span class="mlpre-g">' + fm(dd) + '</span>: always equal.';
      F.out.set(s);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });
})(window, document);
