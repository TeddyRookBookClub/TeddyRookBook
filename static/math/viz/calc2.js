/* Math Ladder visuals made for Calculus 2 (calc2). Registered on window.MathLadder.viz; loaded on calc2 topic pages
   after viz/core.js and viz/adv.js. Functions are CAS strings (window.CAS), like the shared visuals.

   calc2-param: a parametric curve x(t), y(t) with the moving point, its velocity arrow and the rise/run legs.
     opts:
       x: "t^2", y: "t^3-3t"        the coordinates as functions of t (always write t, even for polar angles)
       t0: -2, t1: 2, t: 1          the parameter interval and the starting value (CAS strings like "2pi" are fine)
       tname: "t"                   the name shown for the parameter (for example "θ" when the curve is polar)
       tangent: true                draw the velocity arrow with its horizontal (dx/dt) and vertical (dy/dt) legs
       length: false                also add up the arc length from t0 to the current t in the readout
       xmin, xmax, ymin, ymax        the window (default: fit the curve, same scale on both axes)
       task, label                  a task line above the picture and the aria-label

   calc2-arclength: a curve y = f(x) on [a, b] approximated by n straight chords; the total chord length approaches
   the integral of sqrt(1 + f'(x)^2).
     opts:
       f: "x^2/2", a: 0, b: 2       the curve and the interval
       n: 2, maxN: 64               starting number of chords and the most offered (slider)
       xmin, xmax, ymin, ymax        the window (default: fit)
       task, label

   calc2-tank: pumping water out of a tank, one thin horizontal layer at a time (a side view).
     opts:
       shape: "cylinder"            "cylinder" (radius R), "cone" (point down, top radius R) or "box" (half-width R, length L)
       H: 4, R: 2, L: 3             height, radius (or half-width) and box length, in meters
       spout: 0                     how far above the top the water must be lifted
       depth: null                  water depth (default: full, H)
       y: null                      height of the highlighted layer (default: a third of the depth)
       rho: 9800                    weight density in N/m³
       task, label
   Every visual: light and dark themes, keyboard (all controls are sliders and buttons), a live text readout,
   no horizontal overflow, and touch scrolling stays possible over the picture. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/calc2.js: load viz/core.js first'); return; }
  var M = Math, fm = V.fmt;

  (function css() {
    if (D.getElementById('c2-viz-css')) return;
    var s = D.createElement('style'); s.id = 'c2-viz-css';
    s.textContent = '.c2v .c2-task{margin:0 0 .5rem;font-size:.95rem;line-height:1.45}.c2v .c2-box{position:relative}' +
      '.c2v .ml-readout b{font-variant-numeric:tabular-nums}.c2v .c2-key{display:inline-block;width:.8em;height:.8em;border-radius:2px;margin:0 .25em 0 .1em;vertical-align:-.05em}';
    D.head.appendChild(s);
  })();

  function compile(src, v) {
    var C = W.CAS; if (!C) throw new Error('viz/calc2.js needs the CAS');
    var f = C.compile(C.parse(String(src)), [v]);
    return function (t) { try { var y = +f(t); return isFinite(y) ? y : NaN; } catch (e) { return NaN; } };
  }
  function nv(x, d) {
    if (typeof x === 'number' && isFinite(x)) return x;
    if (x == null || x === '') return d;
    try { var y = +W.CAS.evalNum(W.CAS.parse(String(x))); return isFinite(y) ? y : d; } catch (e) { return d; }
  }
  function frame(el, o, label) {
    el.classList.add('c2v'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = V.el('p', 'c2-task', o.task); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = V.el('div', 'c2-box'); el.appendChild(F.box);
    F.ctl = V.el('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    return F;
  }
  function canvasIn(F, aspect, label) {
    var c = V.canvas(F.box, { aspect: aspect, min: 260, max: 460 });
    c.cv.style.touchAction = 'pan-y';
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', label);
    return c;
  }
  function fitWindow(pts, o, pad) {
    var xs = pts.map(function (p) { return p[0]; }).filter(isFinite), ys = pts.map(function (p) { return p[1]; }).filter(isFinite);
    var x0 = M.min.apply(null, xs), x1 = M.max.apply(null, xs), y0 = M.min.apply(null, ys), y1 = M.max.apply(null, ys);
    var px = (x1 - x0) * pad || 1, py = (y1 - y0) * pad || 1;
    return { xmin: o.xmin != null ? nv(o.xmin, x0 - px) : x0 - px, xmax: o.xmax != null ? nv(o.xmax, x1 + px) : x1 + px, ymin: o.ymin != null ? nv(o.ymin, y0 - py) : y0 - py, ymax: o.ymax != null ? nv(o.ymax, y1 + py) : y1 + py };
  }
  function simpson(f, a, b, n) { n = n || 400; if (n % 2) n++; var h = (b - a) / n, s = f(a) + f(b); for (var i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; }
  function sub(v) { return '<sub>' + v + '</sub>'; }

  // ------------------------------------------------------------------ calc2-param
  V.register('calc2-param', function (el, o) {
    o = Object.assign({ x: 'cos(t)', y: 'sin(t)', t0: 0, t1: '2pi', t: 1, tname: 't', tangent: true, length: false }, o || {});
    var X = compile(o.x, 't'), Y = compile(o.y, 't'), t0 = nv(o.t0, 0), t1 = nv(o.t1, 2 * M.PI), S = { t: M.min(t1, M.max(t0, nv(o.t, (t0 + t1) / 2))) }, tn = o.tname || 't';
    var h = (t1 - t0) * 1e-5 || 1e-5;
    function dX(t) { return (X(t + h) - X(t - h)) / (2 * h); }
    function dY(t) { return (Y(t + h) - Y(t - h)) / (2 * h); }
    var pts = []; for (var i = 0; i <= 300; i++) { var t = t0 + (t1 - t0) * i / 300; pts.push([X(t), Y(t)]); }
    var F = frame(el, o, 'Parametric curve x = ' + o.x + ', y = ' + o.y), c = canvasIn(F, 1.35, 'A parametric curve with a moving point and its velocity arrow. Use the slider to move the point.');
    var P = V.plane(c, Object.assign(fitWindow(pts, o, 0.12), { equal: true }));
    var rng = t1 - t0, TST = rng <= 4 ? 0.01 : rng <= 10 ? 0.02 : 0.05;
    S.t = M.min(t1, M.max(t0, t0 + M.round((S.t - t0) / TST) * TST));
    var sl = V.slider(F.ctl, { label: tn, min: t0, max: t1, step: TST, value: S.t, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.t = v; draw(); } });
    var anim = null, playBtn = V.button(F.ctl, '▶ Move along', function () {
      if (anim) { anim.stop(); anim = null; playBtn.textContent = '▶ Move along'; return; }
      if (V.reduced) { S.t = t1; sl.set(S.t); draw(); return; }
      if (S.t >= t1 - 1e-9) S.t = t0;
      playBtn.textContent = '❚❚ Pause';
      var tc = S.t, st = TST;
      anim = V.loop(el, function (dt) { tc = M.min(t1, tc + (t1 - t0) * dt / 5); S.t = M.min(t1, t0 + M.round((tc - t0) / st) * st); sl.set(S.t); draw(); if (tc >= t1) { anim.stop(); anim = null; playBtn.textContent = '▶ Move along'; } });
    });
    function draw() {
      var k = V.colors(), ctx = c.ctx, t = S.t, x = X(t), y = Y(t), vx = dX(t), vy = dY(t), sp = M.hypot(vx, vy);
      P.clear(); P.grid(); P.axes({ x: 'x', y: 'y' });
      P.param(X, Y, t0, t1, { color: 'blue', width: 2.5 });
      if (o.length && t > t0) P.param(X, Y, t0, t, { color: 'purple', width: 4.5 });
      if (o.tangent && sp > 1e-9) {
        var s = 70 / (P.unit * sp), ex = x + vx * s, ey = y + vy * s;
        P.seg(x, y, ex, y, { color: 'orange', width: 2, dash: [5, 4] });
        P.seg(ex, y, ex, ey, { color: 'green', width: 2, dash: [5, 4] });
        P.arrow(x, y, ex, ey, { color: 'red', width: 2.5 });
      }
      P.point(x, y, { color: 'red', r: 6 });
      var parts = [tn + ' = <b>' + fm(t, 2) + '</b>: (<i>x</i>, <i>y</i>) = (' + fm(x, 2) + ', ' + fm(y, 2) + ').',
        '<span class="c2-key" style="background:' + k.orange + '"></span>run d<i>x</i>/d' + tn + ' = <b>' + fm(vx, 3) + '</b>, <span class="c2-key" style="background:' + k.green + '"></span>rise d<i>y</i>/d' + tn + ' = <b>' + fm(vy, 3) + '</b>.'];
      if (M.abs(vx) < 1e-6 * M.max(1, sp) && sp > 1e-9) parts.push('d<i>x</i>/d' + tn + ' = 0 here: the tangent line is <b>vertical</b>.');
      else if (M.abs(vy) < 1e-6 * M.max(1, sp)) parts.push('Slope d<i>y</i>/d<i>x</i> = (d<i>y</i>/d' + tn + ') ÷ (d<i>x</i>/d' + tn + ') = <b>0</b>: a horizontal tangent.');
      else parts.push('Slope d<i>y</i>/d<i>x</i> = (d<i>y</i>/d' + tn + ') ÷ (d<i>x</i>/d' + tn + ') = ' + fm(vy, 3) + ' ÷ ' + fm(vx, 3) + ' = <b>' + fm(vy / vx, 3) + '</b>.');
      if (o.length) { var Lg = t > t0 ? simpson(function (u) { return M.hypot(dX(u), dY(u)); }, t0, t, 600) : 0; parts.push('Length traced so far: ∫ √((d<i>x</i>/d' + tn + ')² + (d<i>y</i>/d' + tn + ')²) d' + tn + ' ≈ <b>' + fm(Lg, 4) + '</b>.'); }
      F.out.set(parts.join(' '));
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  // ------------------------------------------------------------------ calc2-arclength
  V.register('calc2-arclength', function (el, o) {
    o = Object.assign({ f: 'x^2/2', a: 0, b: 2, n: 2, maxN: 64 }, o || {});
    var f = compile(o.f, 'x'), a = nv(o.a, 0), b = nv(o.b, 2), S = { n: M.max(1, M.round(nv(o.n, 2))) };
    var hh = (b - a) * 1e-5, df = function (x) { return (f(x + hh) - f(x - hh)) / (2 * hh); };
    var exact = simpson(function (x) { return M.sqrt(1 + df(x) * df(x)); }, a, b, 1000);
    var pts = []; for (var i = 0; i <= 200; i++) { var x = a + (b - a) * i / 200; pts.push([x, f(x)]); }
    pts.push([a, 0]);
    var F = frame(el, o, 'Arc length of y = ' + o.f + ' by chords'), c = canvasIn(F, 1.5, 'A curve with straight chords whose total length approximates the arc length. Use the slider to change the number of chords.');
    var P = V.plane(c, fitWindow(pts, o, 0.1));
    V.slider(F.ctl, { label: 'chords n', min: 1, max: o.maxN, step: 1, value: S.n, input: function (v) { S.n = v; draw(); } });
    function draw() {
      var k = V.colors(), n = S.n, dx = (b - a) / n, total = 0, verts = [];
      P.clear(); P.grid(); P.axes({ x: 'x', y: 'y' });
      P.plot(f, { color: 'blue', width: 2.5, from: a, to: b });
      for (var i = 0; i <= n; i++) { var x = a + i * dx; verts.push([x, f(x)]); }
      for (i = 0; i < n; i++) total += M.hypot(dx, verts[i + 1][1] - verts[i][1]);
      P.poly(verts, { close: false, color: 'red', width: 2 });
      if (n <= 40) verts.forEach(function (p) { P.point(p[0], p[1], { color: 'red', r: 3.5 }); });
      var j = M.floor(n / 2), A = verts[j], B = verts[j + 1], dy = B[1] - A[1];
      P.seg(A[0], A[1], B[0], A[1], { color: 'orange', width: 2, dash: [5, 4] });
      P.seg(B[0], A[1], B[0], B[1], { color: 'green', width: 2, dash: [5, 4] });
      P.seg(A[0], A[1], B[0], B[1], { color: 'gold', width: 4 });
      F.out.set('<b>' + n + '</b> chord' + (n === 1 ? '' : 's') + ': total length = Σ √(Δ<i>x</i>² + Δ<i>y</i>²) = <b>' + fm(total, 5) + '</b>. ' +
        'The highlighted chord: <span class="c2-key" style="background:' + k.orange + '"></span>Δ<i>x</i> = ' + fm(dx, 3) + ', <span class="c2-key" style="background:' + k.green + '"></span>Δ<i>y</i> = ' + fm(dy, 3) + ', length = Δ<i>x</i>·√(1 + (Δ<i>y</i>/Δ<i>x</i>)²) = ' + fm(M.hypot(dx, dy), 4) + '. ' +
        'Exact length ∫ √(1 + <i>f</i>′(<i>x</i>)²) d<i>x</i> ≈ <b>' + fm(exact, 5) + '</b> (still to go: ' + fm(exact - total, 5) + ').');
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw, exact: function () { return exact; } };
  });

  // ------------------------------------------------------------------ calc2-tank
  V.register('calc2-tank', function (el, o) {
    o = Object.assign({ shape: 'cylinder', H: 4, R: 2, L: 3, spout: 0, depth: null, y: null, rho: 9800 }, o || {});
    var H = nv(o.H, 4), Rr = nv(o.R, 2), Lb = nv(o.L, 3), sp = nv(o.spout, 0), Dp = o.depth != null ? M.min(H, nv(o.depth, H)) : H, rho = nv(o.rho, 9800), shape = o.shape;
    var S = { y: o.y != null ? nv(o.y, Dp / 3) : Dp / 3 };
    function halfW(y) { return shape === 'cone' ? Rr * y / H : Rr; }          // half-width of the side view at height y
    function area(y) { return shape === 'box' ? 2 * Rr * Lb : M.PI * halfW(y) * halfW(y); }
    var top = H + sp, Wtot = simpson(function (y) { return rho * area(y) * (top - y); }, 0, Dp, 600), Wwrong = rho * simpson(area, 0, Dp, 600) * top;
    var F = frame(el, o, 'Pumping water out of a tank, one layer at a time'), c = canvasIn(F, 1.25, 'Side view of a tank of water with one thin layer highlighted and the distance it must be lifted. Use the slider to choose the layer.');
    var P = V.plane(c, { xmin: -Rr * 1.9, xmax: Rr * 1.9, ymin: -0.15 * H, ymax: top + 0.35 * H, equal: true });
    V.slider(F.ctl, { label: 'layer height y (m)', min: 0, max: Dp, step: Dp / 100, value: S.y, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.y = v; draw(); } });
    function draw() {
      var k = V.colors(), ctx = c.ctx, y = S.y, nL = 14;
      P.clear(); P.grid({ minor: false });
      // water, drawn as layers shaded by how far they travel
      for (var i = 0; i < nL; i++) {
        var ya = Dp * i / nL, yb = Dp * (i + 1) / nL, dist = top - (ya + yb) / 2, al = 0.18 + 0.5 * dist / top;
        P.poly([[-halfW(ya), ya], [halfW(ya), ya], [halfW(yb), yb], [-halfW(yb), yb]], { fill: 'rgba(28,111,214,' + al.toFixed(3) + ')', stroke: false });
      }
      // tank outline
      var outline = shape === 'cone' ? [[-Rr, H], [0, 0], [Rr, H]] : [[-Rr, H], [-Rr, 0], [Rr, 0], [Rr, H]];
      P.poly(outline, { close: false, color: k.ink, width: 2.5 });
      if (sp > 0) { P.seg(-0.12 * Rr, H, -0.12 * Rr, top, { color: k.ink, width: 2 }); P.seg(0.12 * Rr, H, 0.12 * Rr, top, { color: k.ink, width: 2 }); }
      // the chosen layer and its trip
      var hw = halfW(y), th = M.max(Dp / 60, 0.02);
      P.poly([[-hw, y - th], [hw, y - th], [hw, y + th], [-hw, y + th]], { fill: k.gold, color: k.gold, width: 1 });
      P.arrow(hw * 0.55 + 0.05 * Rr, y, hw * 0.55 + 0.05 * Rr, top, { color: 'red', width: 2.5 });
      P.text('lift ' + fm(top - y, 2) + ' m', hw * 0.55 + 0.12 * Rr, (y + top) / 2, { color: 'red', size: 13, bold: true });
      P.seg(-Rr * 1.6, top, Rr * 1.6, top, { color: 'muted', width: 1, dash: [4, 4] });
      P.text(sp > 0 ? 'outlet (spout)' : 'outlet (top)', -Rr * 1.85, top, { color: 'muted', size: 12, base: 'bottom', dy: -3 });
      var A = area(y), wl = rho * A;
      F.out.set('Layer at height <i>y</i> = <b>' + fm(y, 2) + '</b> m: cross-section area <i>A</i>(<i>y</i>) = ' + fm(A, 3) + ' m², so it weighs about ' + fm(wl, 0) + '·Δ<i>y</i> N, and it must rise <b>' + fm(top - y, 2) + '</b> m. Its work ≈ ' + fm(wl * (top - y), 0) + '·Δ<i>y</i> J. ' +
        'Darker layers travel farther. Adding every layer: <i>W</i> = ∫ ' + rho + '·<i>A</i>(<i>y</i>)·(' + fm(top, 2) + ' − <i>y</i>) d<i>y</i> ≈ <b>' + fm(Wtot, 0) + '</b> J. ' +
        'Lifting all the water the full ' + fm(top, 2) + ' m would wrongly give ' + fm(Wwrong, 0) + ' J.');
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw, work: function () { return Wtot; } };
  });
})(window, document);
