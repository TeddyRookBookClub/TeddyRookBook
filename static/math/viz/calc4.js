/* Math Ladder visuals for Calculus 4 (registered on window.MathLadder.viz; names start with "calc4-").
   Load after math/viz/core.js (and homeschool/calc/cas.js for function strings). Uses the "mla" frame styles of adv.css.
   Every visual: light and dark themes, mouse, touch and keyboard, a live text readout, no horizontal overflow.
   Numbers in options may be CAS strings such as "pi/3".

   calc4-green   Green's theorem as cancellation: a rectangle cut into n × n cells, each traced counterclockwise.
     opts: P: "-y", Q: "x*y"          the field F = ⟨P, Q⟩ in x and y
           box: [0, 2, 0, 1.5]          the rectangle [a, b] × [c, d]
           n: 3                          cells per side (slider 1 … 10)
           mode: "circ" | "flux"         circulation (∮ F · T ds, curl inside) or outward flux (∮ F · n ds, divergence inside)
           cell: [0, 0]                  the highlighted cell (click a cell or use the arrow keys)
           xmin…ymax                     the window (default: the box with a margin)
           target: {n: 6}                with task: a check mark once n reaches that value
   calc4-loop    a closed curve you drag through a field made of point sources and vortices (or any ⟨P, Q⟩),
                 with the tangent T and outward normal n at a marked point and both line integrals.
     opts: sources: [{x: 0, y: 0, q: 1, kind: "vortex" | "source"}]   strength q: a vortex adds q to the circulation of any
                                     counterclockwise loop around it, a source adds q to the outward flux
           P, Q                      a field given by formulas instead (used when sources is absent)
           center: [0.5, 0], r: 1.2  the circle (drag its center, drag its rim to resize; arrow keys move, + and − resize)
           shape: "circle" | "square"   (a square of half-side r)
           show: "both" | "circ" | "flux"   which integral(s) to report
           t: 0.6                    where the marked point sits (fraction of the way around)
           xmin…ymax (−3…3)
           target: {circ: 1} or {flux: 2} (tol 0.05)   with task: a check mark when the readout matches            */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/calc4.js: load viz/core.js first'); return; }
  var M = Math, PI = M.PI, TAU = 2 * PI, fm = V.fmt;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function rgba(hex, a) { if (!/^#/.test(hex)) return hex; var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function nv(v, d) {
    if (typeof v === 'number') return isFinite(v) ? v : d;
    if (v == null || v === '') return d;
    var x = +v; if (!isNaN(x)) return x;
    try { var C = W.CAS, y = +C.compile(C.parse(String(v)), [])(); if (isFinite(y)) return y; } catch (e) { }
    return d;
  }
  function cf(src, vars) {
    var C = W.CAS; if (!C) throw new Error('viz/calc4.js needs the CAS');
    var g = C.compile(C.parse(String(src)), vars);
    return function () { try { var v = g.apply(null, arguments); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } };
  }
  function mk(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function frame(el, o, label) {
    el.classList.add('mla'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'mla-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    F.done = function (ok) { if (F.task) F.task.classList.toggle('ok', !!ok); };
    return F;
  }
  function pill(ctx, s, x, y, color, cw, ch) {
    var k = V.colors(); ctx.save(); ctx.font = '700 13px system-ui,sans-serif'; var w = ctx.measureText(s).width + 10, h = 20;
    x = clamp(x, 2, (cw || 9999) - w - 2); y = clamp(y, h / 2 + 2, (ch || 9999) - h / 2 - 2);
    ctx.fillStyle = rgba(k.bg, 0.85); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y - h / 2, w, h, 6); else ctx.rect(x, y - h / 2, w, h); ctx.fill();
    ctx.fillStyle = color || k.ink; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 5, y + 1); ctx.restore();
  }
  function arrowPx(ctx, x1, y1, x2, y2, color, w, head) {
    var ang = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(head || 10, L * 0.45);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = w || 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.6 * M.cos(ang), y2 - hs * 0.6 * M.sin(ang)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(ang - 0.42), y2 - hs * M.sin(ang - 0.42)); ctx.lineTo(x2 - hs * M.cos(ang + 0.42), y2 - hs * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // 8-point Gauss–Legendre on [a, b]
  var GX = [-0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498, 0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363],
    GW = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620, 0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];
  function gauss(f, a, b) { var h = (b - a) / 2, m = (a + b) / 2, s = 0; for (var i = 0; i < 8; i++) s += GW[i] * f(m + h * GX[i]); return s * h; }
  // ∫ over the segment A→B of F·T ds (circulation) and F·n ds with n to the right of travel (outward for a counterclockwise loop)
  function segInts(Fx, Fy, A, B, m) {
    var dx = B[0] - A[0], dy = B[1] - A[1], c = 0, f = 0; m = m || 1;
    for (var k = 0; k < m; k++) {
      c += gauss(function (t) { var x = A[0] + t * dx, y = A[1] + t * dy; return Fx(x, y) * dx + Fy(x, y) * dy; }, k / m, (k + 1) / m);
      f += gauss(function (t) { var x = A[0] + t * dx, y = A[1] + t * dy; return Fx(x, y) * dy - Fy(x, y) * dx; }, k / m, (k + 1) / m);
    }
    return [c, f];
  }
  function fieldArrows(ctx, P, Fx, Fy, v, color, nx) { // a light grid of field arrows, lengths scaled (and capped)
    var ny = M.round(nx * (v.ymax - v.ymin) / (v.xmax - v.xmin)), hx = (v.xmax - v.xmin) / nx, hy = (v.ymax - v.ymin) / ny, pts = [], mx = 0;
    for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) { var x = v.xmin + (i + 0.5) * hx, y = v.ymin + (j + 0.5) * hy, a = Fx(x, y), b = Fy(x, y); if (!isFinite(a) || !isFinite(b)) continue; var L = M.hypot(a, b); pts.push([x, y, a, b, L]); }
    var Ls = pts.map(function (p) { return p[4]; }).sort(function (a, b) { return a - b; }); mx = Ls[M.floor(Ls.length * 0.9)] || 1;
    pts.forEach(function (p) { if (p[4] < 1e-12) return; var s = M.min(p[4], mx) / mx * 0.42 * M.min(hx, hy) / p[4]; arrowPx(ctx, P.X(p[0] - p[2] * s), P.Y(p[1] - p[3] * s), P.X(p[0] + p[2] * s), P.Y(p[1] + p[3] * s), color, 1.4, 6); });
  }

  // =============================================================== calc4-green
  V.register('calc4-green', function (el, o) {
    var Fx = cf(o.P || '-y', ['x', 'y']), Fy = cf(o.Q || 'x*y', ['x', 'y']), bx = (o.box || [0, 2, 0, 1.5]).map(function (x) { return nv(x, 0); });
    var a = bx[0], b = bx[1], c0 = bx[2], d = bx[3], flux = o.mode === 'flux', S = { n: clamp(M.round(nv(o.n, 3)), 1, 10), cell: (o.cell || [0, 0]).slice(), split: true };
    var mx = (b - a) * 0.18 + 0.2, my = (d - c0) * 0.18 + 0.2;
    var F = frame(el, o, flux ? 'Green\'s theorem, flux form: a rectangle cut into cells' : 'Green\'s theorem: a rectangle cut into cells');
    var c = V.canvas(F.box, { aspect: 1.35, max: 470, min: 280 });
    var P = V.plane(c, { xmin: nv(o.xmin, a - mx), xmax: nv(o.xmax, b + mx), ymin: nv(o.ymin, c0 - my), ymax: nv(o.ymax, d + my), equal: true });
    c.cv.setAttribute('aria-label', 'Rectangle cut into cells. Arrow keys choose the highlighted cell; click a cell to choose it.');
    var nsl = V.slider(F.ctl, { label: 'cells per side n', min: 1, max: 10, step: 1, value: S.n, input: function (v) { S.n = v; S.cell = [M.min(S.cell[0], v - 1), M.min(S.cell[1], v - 1)]; draw(); } });
    V.seg(F.ctl, { label: 'Inside edges', items: [['on', 'Show inside edges'], ['off', 'Outer boundary only']], value: 'on', change: function (v) { S.split = v === 'on'; draw(); } });
    V.drag(c.cv, { hit: function (px, py) { var x = P.x(px), y = P.y(py); if (x < a || x > b || y < c0 || y > d) return null; return [M.min(S.n - 1, M.floor((x - a) / (b - a) * S.n)), M.min(S.n - 1, M.floor((y - c0) / (d - c0) * S.n))]; }, start: function (h) { S.cell = h; draw(); }, move: function () { } });
    c.cv.tabIndex = 0; c.cv.addEventListener('keydown', function (e) { var dd = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!dd) return; S.cell = [clamp(S.cell[0] + dd[0], 0, S.n - 1), clamp(S.cell[1] + dd[1], 0, S.n - 1)]; draw(); e.preventDefault(); });
    function cellInt(i, j) { var n = S.n, hx = (b - a) / n, hy = (d - c0) / n, x0 = a + i * hx, y0 = c0 + j * hy, Q4 = [[x0, y0], [x0 + hx, y0], [x0 + hx, y0 + hy], [x0, y0 + hy]], s = 0; for (var e = 0; e < 4; e++) s += segInts(Fx, Fy, Q4[e], Q4[(e + 1) % 4], 2)[flux ? 1 : 0]; return s; }
    function dens(x, y) { var h = 1e-4; return flux ? (Fx(x + h, y) - Fx(x - h, y)) / (2 * h) + (Fy(x, y + h) - Fy(x, y - h)) / (2 * h) : (Fy(x + h, y) - Fy(x - h, y)) / (2 * h) - (Fx(x, y + h) - Fx(x, y - h)) / (2 * h); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, n = S.n, hx = (b - a) / n, hy = (d - c0) / n, vals = [], tot = 0, big = 1e-9;
      P.clear(); P.grid({ minor: false }); P.axes();
      fieldArrows(ctx, P, Fx, Fy, P.view(), rgba(k.muted, 0.55), 15);
      for (var i = 0; i < n; i++) { vals.push([]); for (var j = 0; j < n; j++) { var v = cellInt(i, j); vals[i].push(v); tot += v; big = M.max(big, M.abs(v)); } }
      for (i = 0; i < n; i++) for (j = 0; j < n; j++) { var x0 = a + i * hx, y0 = c0 + j * hy, t = vals[i][j] / big; ctx.fillStyle = rgba(t >= 0 ? k.blue : k.red, (isDark() ? 0.12 : 0.08) + 0.32 * M.abs(t)); ctx.fillRect(P.X(x0), P.Y(y0 + hy), P.X(x0 + hx) - P.X(x0), P.Y(y0) - P.Y(y0 + hy)); }
      // inside edges: each is traced twice, once in each direction
      if (S.split && n > 1) {
        ctx.save(); ctx.strokeStyle = rgba(k.ink, 0.45); ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]); ctx.beginPath();
        for (i = 1; i < n; i++) { ctx.moveTo(P.X(a + i * hx), P.Y(c0)); ctx.lineTo(P.X(a + i * hx), P.Y(d)); ctx.moveTo(P.X(a), P.Y(c0 + i * hy)); ctx.lineTo(P.X(b), P.Y(c0 + i * hy)); }
        ctx.stroke(); ctx.restore();
        if (n <= 6) for (i = 1; i < n; i++) for (j = 0; j < n; j++) { var xm = P.X(a + i * hx), ym = P.Y(c0 + (j + 0.5) * hy); arrowPx(ctx, xm - 4, ym + 7, xm - 4, ym - 7, rgba(k.purple, 0.8), 1.4, 5); arrowPx(ctx, xm + 4, ym - 7, xm + 4, ym + 7, rgba(k.purple, 0.8), 1.4, 5); }
      }
      // outer boundary, counterclockwise
      ctx.save(); ctx.strokeStyle = k.green; ctx.lineWidth = 3; ctx.strokeRect(P.X(a), P.Y(d), P.X(b) - P.X(a), P.Y(c0) - P.Y(d)); ctx.restore();
      [[[a, c0], [b, c0]], [[b, c0], [b, d]], [[b, d], [a, d]], [[a, d], [a, c0]]].forEach(function (e) { var mxp = (e[0][0] + e[1][0]) / 2, myp = (e[0][1] + e[1][1]) / 2, ux = (e[1][0] - e[0][0]), uy = (e[1][1] - e[0][1]), L = M.hypot(ux, uy); arrowPx(ctx, P.X(mxp - ux / L * 0.12), P.Y(myp - uy / L * 0.12), P.X(mxp + ux / L * 0.12), P.Y(myp + uy / L * 0.12), k.green, 3, 12); });
      // highlighted cell
      var ci = S.cell[0], cj = S.cell[1], X0 = a + ci * hx, Y0 = c0 + cj * hy;
      ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 3; ctx.strokeRect(P.X(X0), P.Y(Y0 + hy), P.X(X0 + hx) - P.X(X0), P.Y(Y0) - P.Y(Y0 + hy)); ctx.restore();
      var cx = X0 + hx / 2, cy = Y0 + hy / 2, rr = M.min(hx, hy) * 0.28;
      if (!flux) { var cxp = P.X(cx), cyp = P.Y(cy), Rp = rr * P.unit, a0 = 0.5, a1 = a0 - 4.9, ap = function (a) { return [cxp + Rp * M.cos(a), cyp + Rp * M.sin(a)]; }; ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cxp, cyp, Rp, a0, a1 + 0.25, true); ctx.stroke(); ctx.restore(); var e0 = ap(a1 + 0.45), e1 = ap(a1); arrowPx(ctx, e0[0], e0[1], e1[0], e1[1], k.gold, 2, 8); }
      // outer boundary integral, computed directly
      var outer = 0; [[[a, c0], [b, c0]], [[b, c0], [b, d]], [[b, d], [a, d]], [[a, d], [a, c0]]].forEach(function (e) { outer += segInts(Fx, Fy, e[0], e[1], 8)[flux ? 1 : 0]; });
      var cv = vals[ci][cj], dn = dens(cx, cy), name = flux ? 'outward flux' : 'circulation', dname = flux ? 'divergence P<sub>x</sub> + Q<sub>y</sub>' : 'scalar curl Q<sub>x</sub> − P<sub>y</sub>';
      F.out.set(n * n + (n === 1 ? ' cell' : ' cells') + ', each traced counterclockwise. <span class="mla-g">Outer boundary</span> ' + name + ': <b>' + fm(outer, 4) + '</b>. Sum of the ' + n * n + ' cell ' + name + 's: <b>' + fm(tot, 4) + '</b>' + (n > 1 ? ' (the same: every inside edge (dashed) is traced twice, in opposite directions, and cancels).' : '.') +
        '<br>Highlighted cell: ' + name + ' ' + fm(cv, 4) + ', and ' + dname + ' at its center × its area = ' + fm(dn, 3) + ' × ' + fm(hx * hy, 4) + ' = ' + fm(dn * hx * hy, 4) + '. As n grows these agree better and better, which is why the total is ∬ (' + (flux ? 'P<sub>x</sub> + Q<sub>y</sub>' : 'Q<sub>x</sub> − P<sub>y</sub>') + ') dA.');
      if (F.task && o.target) F.done(S.n >= nv(o.target.n, 99));
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw, setN: function (v) { S.n = v; nsl.set(v); draw(); } };
  });

  // =============================================================== calc4-loop
  V.register('calc4-loop', function (el, o) {
    var srcs = (o.sources || []).map(function (s) { return { x: nv(s.x, 0), y: nv(s.y, 0), q: nv(s.q, 1), kind: s.kind === 'source' ? 'source' : 'vortex' }; }), Fx, Fy;
    if (srcs.length) {
      Fx = function (x, y) { var s = 0; srcs.forEach(function (p) { var dx = x - p.x, dy = y - p.y, r2 = dx * dx + dy * dy; s += p.q / TAU * (p.kind === 'source' ? dx : -dy) / r2; }); return s; };
      Fy = function (x, y) { var s = 0; srcs.forEach(function (p) { var dx = x - p.x, dy = y - p.y, r2 = dx * dx + dy * dy; s += p.q / TAU * (p.kind === 'source' ? dy : dx) / r2; }); return s; };
    } else { Fx = cf(o.P || '-y', ['x', 'y']); Fy = cf(o.Q || 'x', ['x', 'y']); }
    var ctr = (o.center || [0.5, 0]).map(function (x) { return nv(x, 0); }), S = { cx: ctr[0], cy: ctr[1], r: nv(o.r, 1.2), t: nv(o.t, 0.6), shape: o.shape === 'square' ? 'square' : 'circle' }, show = o.show || 'both';
    var F = frame(el, o, 'A closed curve in a vector field, with its circulation and flux');
    var c = V.canvas(F.box, { aspect: 1.25, max: 470, min: 280 });
    var P = V.plane(c, { xmin: nv(o.xmin, -3), xmax: nv(o.xmax, 3), ymin: nv(o.ymin, -3), ymax: nv(o.ymax, 3), equal: true });
    c.cv.setAttribute('aria-label', 'A closed curve in a vector field. Drag the center to move it and the rim to resize it; arrow keys move it, plus and minus resize it.');
    var rsl = V.slider(F.ctl, { label: S.shape === 'circle' ? 'radius' : 'half-side', min: 0.2, max: 2.8, step: 0.05, value: S.r, input: function (v) { S.r = v; draw(); } });
    var tsl = V.slider(F.ctl, { label: 'marked point', min: 0, max: 1, step: 0.01, value: S.t, input: function (v) { S.t = v; draw(); } });
    V.seg(F.ctl, { label: 'Shape', items: [['circle', 'Circle'], ['square', 'Square']], value: S.shape, change: function (v) { S.shape = v; draw(); } });
    function pt(u) { // point and unit tangent at fraction u of the way around (counterclockwise from the right)
      if (S.shape === 'circle') { var th = u * TAU; return { p: [S.cx + S.r * M.cos(th), S.cy + S.r * M.sin(th)], T: [-M.sin(th), M.cos(th)] }; }
      var s = (((u % 1) + 1) % 1) * 8, r = S.r, p, T;
      if (s < 1) { p = [r, s * r]; T = [0, 1]; } else if (s < 3) { p = [r - (s - 1) * r, r]; T = [-1, 0]; } else if (s < 5) { p = [-r, r - (s - 3) * r]; T = [0, -1]; } else if (s < 7) { p = [-r + (s - 5) * r, -r]; T = [1, 0]; } else { p = [r, -r + (s - 7) * r]; T = [0, 1]; }
      return { p: [S.cx + p[0], S.cy + p[1]], T: T };
    }
    function loopInts() {
      var circ = 0, fl = 0;
      if (S.shape === 'circle') { var m = 64; for (var k = 0; k < m; k++) { var g = function (which) { return gauss(function (th) { var x = S.cx + S.r * M.cos(th), y = S.cy + S.r * M.sin(th), dx = -S.r * M.sin(th), dy = S.r * M.cos(th); return which ? Fx(x, y) * dy - Fy(x, y) * dx : Fx(x, y) * dx + Fy(x, y) * dy; }, k * TAU / m, (k + 1) * TAU / m); }; circ += g(0); fl += g(1); } }
      else { var r = S.r, C = [[r, -r], [r, r], [-r, r], [-r, -r]].map(function (q) { return [S.cx + q[0], S.cy + q[1]]; }); for (var e = 0; e < 4; e++) { var v = segInts(Fx, Fy, C[e], C[(e + 1) % 4], 24); circ += v[0]; fl += v[1]; } }
      return [circ, fl];
    }
    function inside(x, y) { return S.shape === 'circle' ? M.hypot(x - S.cx, y - S.cy) < S.r : M.abs(x - S.cx) < S.r && M.abs(y - S.cy) < S.r; }
    V.drag(c.cv, {
      hit: function (px, py) { var x = P.x(px), y = P.y(py), dC = M.hypot(px - P.X(S.cx), py - P.Y(S.cy)); if (dC < 26) return 'c'; var rim = S.shape === 'circle' ? M.abs(M.hypot(x - S.cx, y - S.cy) - S.r) : M.abs(M.max(M.abs(x - S.cx), M.abs(y - S.cy)) - S.r); return rim * P.unit < 16 ? 'r' : null; },
      start: function () { }, move: function (h, px, py) { var x = P.x(px), y = P.y(py), v = P.view(); if (h === 'c') { S.cx = clamp(x, v.xmin, v.xmax); S.cy = clamp(y, v.ymin, v.ymax); } else { S.r = clamp(S.shape === 'circle' ? M.hypot(x - S.cx, y - S.cy) : M.max(M.abs(x - S.cx), M.abs(y - S.cy)), 0.2, 2.8); rsl.set(S.r); } draw(); }
    });
    c.cv.tabIndex = 0; c.cv.addEventListener('keydown', function (e) { var dd = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }[e.key]; if (dd) { S.cx += dd[0]; S.cy += dd[1]; } else if (e.key === '+' || e.key === '=') S.r = M.min(2.8, S.r + 0.1); else if (e.key === '-') S.r = M.max(0.2, S.r - 0.1); else return; rsl.set(S.r); draw(); e.preventDefault(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx;
      P.clear(); P.grid({ minor: false }); P.axes();
      fieldArrows(ctx, P, Fx, Fy, P.view(), rgba(k.muted, 0.6), 17);
      // the curve, with direction marks
      ctx.save(); ctx.strokeStyle = k.green; ctx.lineWidth = 3; ctx.fillStyle = rgba(k.green, isDark() ? 0.12 : 0.07); ctx.beginPath();
      if (S.shape === 'circle') ctx.arc(P.X(S.cx), P.Y(S.cy), S.r * P.unit, 0, TAU); else ctx.rect(P.X(S.cx - S.r), P.Y(S.cy + S.r), 2 * S.r * P.unit, 2 * S.r * P.unit);
      ctx.fill(); ctx.stroke(); ctx.restore();
      [0.125, 0.375, 0.625, 0.875].forEach(function (u) { var q = pt(u); arrowPx(ctx, P.X(q.p[0] - q.T[0] * 0.1), P.Y(q.p[1] - q.T[1] * 0.1), P.X(q.p[0] + q.T[0] * 0.1), P.Y(q.p[1] + q.T[1] * 0.1), k.green, 3, 11); });
      ctx.save(); ctx.fillStyle = k.green; ctx.beginPath(); ctx.arc(P.X(S.cx), P.Y(S.cy), 4, 0, TAU); ctx.fill(); ctx.restore();
      // sources and vortices
      srcs.forEach(function (s) { var X = P.X(s.x), Y = P.Y(s.y), col = s.q > 0 ? k.blue : k.red; ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = k.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, 8, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); pill(ctx, (s.kind === 'source' ? 'q = ' : 'Γ = ') + fm(s.q, 2), X + 9, Y - 14, col, c.w, c.h); });
      // marked point: F, T and n
      var q = pt(S.t), x = q.p[0], y = q.p[1], f = [Fx(x, y), Fy(x, y)], T = q.T, n = [T[1], -T[0]], ft = f[0] * T[0] + f[1] * T[1], fnn = f[0] * n[0] + f[1] * n[1], L = M.hypot(f[0], f[1]), sc = L > 1e-12 ? M.min(1, 1.1 / L) : 1;
      arrowPx(ctx, P.X(x), P.Y(y), P.X(x + T[0] * 0.8), P.Y(y + T[1] * 0.8), k.blue, 2.5, 10);
      arrowPx(ctx, P.X(x), P.Y(y), P.X(x + n[0] * 0.8), P.Y(y + n[1] * 0.8), k.red, 2.5, 10);
      if (L > 1e-12) arrowPx(ctx, P.X(x), P.Y(y), P.X(x + f[0] * sc), P.Y(y + f[1] * sc), k.ink, 3.2, 12);
      pill(ctx, 'T', P.X(x + T[0] * 0.8) + 4, P.Y(y + T[1] * 0.8) - 10, k.blue, c.w, c.h); pill(ctx, 'n', P.X(x + n[0] * 0.8) + 4, P.Y(y + n[1] * 0.8) + 10, k.red, c.w, c.h); if (L > 1e-12) pill(ctx, 'F', P.X(x + f[0] * sc) + 6, P.Y(y + f[1] * sc), k.ink, c.w, c.h);
      ctx.save(); ctx.fillStyle = k.ink; ctx.beginPath(); ctx.arc(P.X(x), P.Y(y), 5.5, 0, TAU); ctx.fill(); ctx.restore();
      var I = loopInts(), inV = 0, inS = 0, names = []; srcs.forEach(function (s) { if (inside(s.x, s.y)) { if (s.kind === 'vortex') inV += s.q; else inS += s.q; names.push((s.kind === 'source' ? 'source ' : 'vortex ') + fm(s.q, 2)); } });
      var parts = [];
      if (show !== 'flux') parts.push('<span class="mla-b">Circulation</span> ∮ F · T ds = <b>' + fm(I[0], 3) + '</b>');
      if (show !== 'circ') parts.push('<span class="mla-r">outward flux</span> ∮ F · n ds = <b>' + fm(I[1], 3) + '</b>');
      F.out.set('At the marked point, F · T = ' + fm(ft, 3) + ' (along the curve) and F · n = ' + fm(fnn, 3) + ' (out across it). ' + parts.join('; ') + '.' + (srcs.length ? '<br>Inside the curve: ' + (names.length ? names.join(', ') : 'nothing') + '. ' + (show !== 'flux' && srcs.some(function (s) { return s.kind === 'vortex'; }) ? 'Vortex strengths inside add up to ' + fm(inV, 3) + '. ' : '') + (show !== 'circ' && srcs.some(function (s) { return s.kind === 'source'; }) ? 'Source strengths inside add up to ' + fm(inS, 3) + '.' : '') : ''));
      if (F.task && o.target) { var tol = nv(o.target.tol, 0.05), okc = o.target.circ == null || M.abs(I[0] - nv(o.target.circ, 0)) < tol, okf = o.target.flux == null || M.abs(I[1] - nv(o.target.flux, 0)) < tol; F.done(okc && okf); }
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw, ints: loopInts };
  });
})(window, document);
