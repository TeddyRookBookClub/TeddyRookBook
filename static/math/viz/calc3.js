/* Math Ladder visuals for Calculus 3 (registered on window.MathLadder.viz; names start with "calc3-").
   Load after math/viz/core.js (and homeschool/calc/cas.js for function strings). Uses the "mla" frame styles of adv.css.
   Every visual: light and dark themes, mouse, touch and keyboard (3-D pictures: drag or arrow keys to turn the view),
   a live text readout, no horizontal overflow. Numbers in options may be CAS strings such as "pi/3".

   calc3-scene      points, vectors, lines and planes in space.
     opts: points: [{p: [x, y, z], label: "P", color: "red", box: true}]      box: dashed legs showing the coordinates
           vectors: [{from: [0, 0, 0], v: [1, 2, 2], label: "v", color: "blue"}]
           lines: [{p: [x, y, z], v: [a, b, c], label: "L1", color: "purple"}]   drawn across the whole box
           planes: [{n: [a, b, c], d: 4, label: "", color: "green"}]           the plane n · X = d, clipped to the box
           segs: [{a: [..], b: [..], color, dash: true}], polys: [{pts: [[..], ..], color, alpha}]
           show: "coords" | "distance" (points 0 and 1, with the three legs) | "foot" (point 0 dropped onto plane 0)
                 | "skew" (lines 0 and 1 with their common perpendicular)
           move: true      sliders for the x, y, z of point 0 (and the readout follows)
           range: 4, yaw, pitch, task
   calc3-coords     a point in cylindrical or spherical coordinates, with sliders.
     opts: mode: "sph" | "cyl", rho or r, theta (degrees), phi (degrees, sph) or z (cyl), range: 3,
           target: [rho, theta, phi] (sph) or [r, theta, z] (cyl): with task, a check mark when the sliders match
   calc3-tangent    z = f(x, y) with its tangent plane and the two traces through a point you move.
     opts: f: "4 - x^2 - y^2", a: 1, b: 0.5, xmin..ymax (-2..2), plane: true, traces: true, h: 0.4 (half-size of the plane patch)
   calc3-lagrange   a contour map of f, a constraint curve, and the gradients of f and g at a point on the curve.
     opts: f: "x*y", g: "x^2 + y^2", curve: {x: "2cos(t)", y: "2sin(t)", t0: 0, t1: "2pi"}, t: 0.3,
           xmin..ymax (-3..3), levels: 14, task (checked when the two gradients line up at a maximum or minimum)
   calc3-region     a region of integration with a moving slice, in either order (or polar).
     opts: I: {lo: "x^2", hi: "x", a: 0, b: 1, loT: "y = x^2", hiT: "y = x"}      y between two curves of x
           II: {lo: "y", hi: "sqrt(y)", c: 0, d: 1, loT: "x = y", hiT: "x = √y"}  x between two curves of y
           order: "dydx" | "dxdy" (both offered when I and II are given), at: 0.5 (slice position)
           polar: {lo: "0", hi: "2", a: 0, b: "pi/2"} (r between two curves of θ; the slice is a wedge), xmin..ymax
   calc3-jacobian   a grid in the uv-plane and its image in the xy-plane; one small cell and its image, with |J|.
     opts: map: "polar" | "linear" | {x: "u^2 - v^2", y: "2u*v"}, m: [[2, 1], [1, 1]] (linear), u: [0, 2], v: [0, "pi/2"],
           cell: [1, 0.5] (lower corner of the highlighted cell), du: 0.25, dv: 0.25
   calc3-boxes      a double integral as a sum of boxes under z = f(x, y) over a rectangle.
     opts: f: "4 - x^2/2 - y^2/4", a: 0, b: 2, c: 0, d: 2, n: 4, sample: "mid" | "corner", surface: true      */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/calc3.js: load viz/core.js first'); return; }
  var M = Math, PI = M.PI, TAU = 2 * PI, fm = V.fmt;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function rgb(hex) { var v = parseInt(String(hex).slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function rgba(hex, a) { if (!/^#/.test(hex)) return hex; var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function col(name, k) { k = k || V.colors(); return k[name] || name || k.blue; }
  function nv(v, d) { // number from a number or a CAS string
    if (typeof v === 'number') return isFinite(v) ? v : d;
    if (v == null || v === '') return d;
    var x = +v; if (!isNaN(x)) return x;
    try { var C = W.CAS, y = +C.compile(C.parse(String(v)), [])(); if (isFinite(y)) return y; } catch (e) { }
    return d;
  }
  function cf(src, vars) { // compile a CAS string to a JS function of vars (NaN on failure)
    var C = W.CAS; if (!C) throw new Error('viz/calc3.js needs the CAS');
    var g = C.compile(C.parse(String(src)), vars);
    return function () { try { var v = g.apply(null, arguments); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } };
  }
  function nd(f, x, h) { h = h || 1e-5; return (f(x + h) - f(x - h)) / (2 * h); }
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
    F.row = function () { var r = mk('div', 'ml-ctl'); el.insertBefore(r, F.out.el); return r; };
    return F;
  }
  function txt(ctx, s, x, y, o) { o = o || {}; var k = V.colors(); ctx.save(); ctx.font = (o.italic ? 'italic ' : '') + (o.bold ? '700 ' : '600 ') + (o.size || 13) + 'px ' + (o.italic ? 'Georgia,serif' : 'system-ui,sans-serif'); ctx.fillStyle = o.color || k.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y); ctx.restore(); }
  function pill(ctx, s, x, y, color, cw, ch) { // label with a soft background, kept inside the canvas
    var k = V.colors(); ctx.save(); ctx.font = '700 13px system-ui,sans-serif'; var w = ctx.measureText(s).width + 10, h = 20;
    x = clamp(x, 2, (cw || 9999) - w - 2); y = clamp(y, h / 2 + 2, (ch || 9999) - h / 2 - 2);
    ctx.fillStyle = rgba(k.bg, 0.82); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y - h / 2, w, h, 6); else ctx.rect(x, y - h / 2, w, h); ctx.fill();
    ctx.fillStyle = color || k.ink; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 5, y + 1); ctx.restore();
  }
  function arrowPx(ctx, x1, y1, x2, y2, color, w, head) {
    var ang = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(head || 10, L * 0.45);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = w || 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.6 * M.cos(ang), y2 - hs * 0.6 * M.sin(ang)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(ang - 0.42), y2 - hs * M.sin(ang - 0.42)); ctx.lineTo(x2 - hs * M.cos(ang + 0.42), y2 - hs * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function v3(a, b, f) { return [a[0] + f * b[0], a[1] + f * b[1], a[2] + f * b[2]]; }
  function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len3(a) { return M.sqrt(dot3(a, a)); }
  function vstr(a, d) { return '⟨' + a.map(function (x) { return fm(x, d == null ? 2 : d); }).join(', ') + '⟩'; }
  function linStr(cs, vs, c0) { // "2x − y + 3", coefficients rounded to 3 places
    var out = ''; cs.forEach(function (c, i) { c = +(+c).toFixed(3); if (!c) return; var a = M.abs(c), body = (a === 1 ? '' : fm(a, 3)) + vs[i]; out += out ? (c < 0 ? ' − ' : ' + ') + body : (c < 0 ? '−' : '') + body; });
    if (c0 != null && +(+c0).toFixed(3)) { var b = +(+c0).toFixed(3); out += out ? (b < 0 ? ' − ' : ' + ') + fm(M.abs(b), 3) : fm(b, 3); }
    return out || '0';
  }
  function shift(v, x) { x = +(+x).toFixed(2); return x ? '(' + v + (x < 0 ? ' + ' : ' − ') + fm(M.abs(x), 2) + ')' : v; }
  function tplane(z0, fx, fy, a, b) { var out = fm(z0, 3); [[fx, shift('x', a)], [fy, shift('y', b)]].forEach(function (t) { var c = +(+t[0]).toFixed(3); if (!c) return; out += (c < 0 ? ' − ' : ' + ') + (M.abs(c) === 1 ? '' : fm(M.abs(c), 3)) + t[1]; }); return out; }
  function pstr(a, d) { return '(' + a.map(function (x) { return fm(x, d == null ? 2 : d); }).join(', ') + ')'; }

  // ---------- a small orthographic 3-D camera (z up); drag or arrow keys turn it ----------
  function cam(c, o) {
    var S = { yaw: nv(o.yaw, -2.3), pitch: nv(o.pitch, 0.45), r: o.r || 4, ctr: o.center || [0, 0, 0] }, cy, sy, cp, sp, s, ox, oy;
    S.calc = function () { cy = M.cos(S.yaw); sy = M.sin(S.yaw); cp = M.cos(S.pitch); sp = M.sin(S.pitch); s = M.min(c.w, c.h) * 0.46 / S.r; ox = c.w / 2; oy = c.h / 2 + (o.dy || 0); S.s = s; };
    S.p = function (x, y, z) { x -= S.ctr[0]; y -= S.ctr[1]; z -= S.ctr[2]; var x1 = x * cy - y * sy, y1 = x * sy + y * cy; return [ox + s * x1, oy - s * (y1 * sp + z * cp), -y1 * cp + z * sp]; };
    S.P = function (q) { return S.p(q[0], q[1], q[2]); };
    S.depth = function (q) { return S.P(q)[2]; };
    S.light = function (n) { var x1 = n[0] * cy - n[1] * sy, y1 = n[0] * sy + n[1] * cy, q = [x1, y1 * sp + n[2] * cp, -y1 * cp + n[2] * sp], L = [-0.45, 0.6, 0.66]; return M.abs((q[0] * L[0] + q[1] * L[1] + q[2] * L[2]) / (M.hypot(q[0], q[1], q[2]) || 1)); };
    var dr = null;
    V.drag(c.cv, {
      hit: function (px, py) { if (o.hit) { var h = o.hit(px, py); if (h != null) return h; } return 'cam'; },
      start: function (h, px, py) { if (h === 'cam') dr = [px, py, S.yaw, S.pitch]; else if (o.start) o.start(h, px, py); },
      move: function (h, px, py) { if (h !== 'cam') { if (o.move) o.move(h, px, py); return; } S.yaw = dr[2] - (px - dr[0]) * 0.01; S.pitch = clamp(dr[3] + (py - dr[1]) * 0.01, -1.45, 1.45); S.calc(); o.change(); },
      end: function () { dr = null; }
    });
    c.cv.tabIndex = 0;
    c.cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
      if (d) { S.yaw += d[0]; S.pitch = clamp(S.pitch + d[1], -1.45, 1.45); S.calc(); o.change(); e.preventDefault(); }
    });
    c.onResize(function () { S.calc(); o.change(); }); S.calc();
    S.line = function (ctx, pts, color, w, dash) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.lineJoin = ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(function (q, i) { var p = S.P(q); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore(); };
    S.arrow = function (ctx, a, b, color, w) { var p = S.P(a), q = S.P(b); arrowPx(ctx, p[0], p[1], q[0], q[1], color, w || 3, 11); return q; };
    S.dot = function (ctx, q, color, r) { var p = S.P(q); ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p[0], p[1], r || 5, 0, TAU); ctx.fill(); ctx.strokeStyle = V.colors().bg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); return p; };
    S.poly = function (ctx, pts, fill, stroke, lw) { ctx.save(); ctx.beginPath(); pts.forEach(function (q, i) { var p = S.P(q); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } ctx.restore(); };
    S.faces = function (ctx, fs) { fs.forEach(function (f) { f.d = f.q.reduce(function (s, q) { return s + S.depth(q); }, 0) / f.q.length + (f.bias || 0); }); fs.sort(function (a, b) { return a.d - b.d; }); fs.forEach(function (f) { S.poly(ctx, f.q, f.fill, f.stroke, f.lw); if (f.after) f.after(ctx); }); };
    S.axes = function (ctx, L, opt) {
      opt = opt || {}; var k = V.colors();
      if (opt.floor !== false) { ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; var g = M.max(1, M.round(L)); for (var i = -g; i <= g; i++) { var a = S.p(i * L / g, -L, 0), b = S.p(i * L / g, L, 0), c2 = S.p(-L, i * L / g, 0), d2 = S.p(L, i * L / g, 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c2[0], c2[1]); ctx.lineTo(d2[0], d2[1]); ctx.stroke(); } ctx.restore(); }
      [[1, 0, 0, 'x'], [0, 1, 0, 'y'], [0, 0, 1, 'z']].forEach(function (e) {
        var a = S.p(-e[0] * L, -e[1] * L, -e[2] * L), b = S.p(e[0] * L * 1.12, e[1] * L * 1.12, e[2] * L * 1.12);
        ctx.save(); ctx.strokeStyle = k.axis; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
        arrowPx(ctx, a[0] + (b[0] - a[0]) * 0.97, a[1] + (b[1] - a[1]) * 0.97, b[0], b[1], k.axis, 1.4, 8);
        var ang = M.atan2(b[1] - a[1], b[0] - a[0]); txt(ctx, e[3], b[0] + 12 * M.cos(ang), b[1] + 12 * M.sin(ang), { italic: true, size: 16, align: 'center', color: k.ink });
      });
    };
    return S;
  }
  // the polygon where the plane n·X = d cuts the cube [-L, L]^3 (in order around the plane)
  function planePoly(n, d, L) {
    var pts = [], cs = [-L, L];
    for (var ax = 0; ax < 3; ax++) { var o1 = (ax + 1) % 3, o2 = (ax + 2) % 3; cs.forEach(function (u) { cs.forEach(function (w) { if (M.abs(n[ax]) < 1e-12) return; var p = [0, 0, 0]; p[o1] = u; p[o2] = w; p[ax] = (d - n[o1] * u - n[o2] * w) / n[ax]; if (p[ax] >= -L - 1e-9 && p[ax] <= L + 1e-9) pts.push(p); }); }); }
    if (pts.length < 3) return [];
    var c = [0, 0, 0]; pts.forEach(function (p) { c = v3(c, p, 1 / pts.length); });
    var e1 = cross3(n, M.abs(n[0]) < 0.9 * len3(n) ? [1, 0, 0] : [0, 1, 0]), e2 = cross3(n, e1);
    pts.sort(function (a, b) { var A = sub3(a, c), B = sub3(b, c); return M.atan2(dot3(A, e2), dot3(A, e1)) - M.atan2(dot3(B, e2), dot3(B, e1)); });
    return pts.filter(function (p, i) { return !i || len3(sub3(p, pts[i - 1])) > 1e-9; });
  }
  function clipLine(p, v, L) { // t range where p + t v stays in the cube
    var t0 = -1e9, t1 = 1e9;
    for (var i = 0; i < 3; i++) { if (M.abs(v[i]) < 1e-12) { if (p[i] < -L || p[i] > L) return null; continue; } var a = (-L - p[i]) / v[i], b = (L - p[i]) / v[i]; t0 = M.max(t0, M.min(a, b)); t1 = M.min(t1, M.max(a, b)); }
    return t1 > t0 ? [t0, t1] : null;
  }

  // =============================================================== calc3-scene
  V.register('calc3-scene', function (el, o) {
    var L = nv(o.range, 4), F = frame(el, o, 'Points, lines and planes in space'), c = V.canvas(F.box, { aspect: 1.25, max: 480, min: 300 });
    var pts = (o.points || []).map(function (q) { return { p: q.p.map(function (x) { return nv(x, 0); }), label: q.label || '', color: q.color || 'red', box: q.box }; });
    var vecs = (o.vectors || []).map(function (q) { var a = (q.from || [0, 0, 0]).map(function (x) { return nv(x, 0); }), b = q.to ? q.to.map(function (x) { return nv(x, 0); }) : v3(a, q.v.map(function (x) { return nv(x, 0); }), 1); return { a: a, b: b, label: q.label || '', color: q.color || 'blue' }; });
    var lines = (o.lines || []).map(function (q) { return { p: q.p.map(function (x) { return nv(x, 0); }), v: q.v.map(function (x) { return nv(x, 0); }), label: q.label || '', color: q.color || 'purple' }; });
    var planes = (o.planes || []).map(function (q) { return { n: q.n.map(function (x) { return nv(x, 0); }), d: nv(q.d, 0), label: q.label || '', color: q.color || 'green' }; });
    var C3 = cam(c, { r: L * 1.35, yaw: o.yaw, pitch: o.pitch, change: draw });
    c.cv.setAttribute('aria-label', (o.label || 'A three-dimensional picture') + '. Drag or use the arrow keys to turn it.');
    if (o.move && pts.length) {
      var row = F.ctl; ['x', 'y', 'z'].forEach(function (nm, i) { V.slider(row, { label: (pts[0].label || 'P') + ': ' + nm, min: -L, max: L, step: 0.5, value: pts[0].p[i], input: function (v) { pts[0].p[i] = v; draw(); } }); });
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, s = '';
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      C3.axes(ctx, L);
      planes.forEach(function (pl) { var poly = planePoly(pl.n, pl.d, L); if (poly.length > 2) C3.poly(ctx, poly, rgba(col(pl.color, k), isDark() ? 0.26 : 0.18), rgba(col(pl.color, k), 0.75), 1.5); });
      (o.polys || []).forEach(function (pg) { C3.poly(ctx, pg.pts.map(function (q) { return q.map(function (x) { return nv(x, 0); }); }), rgba(col(pg.color || 'gold', k), pg.alpha || 0.22), rgba(col(pg.color || 'gold', k), 0.8), 1.5); });
      (o.segs || []).forEach(function (sg) { C3.line(ctx, [sg.a.map(function (x) { return nv(x, 0); }), sg.b.map(function (x) { return nv(x, 0); })], col(sg.color || 'muted', k), 2, sg.dash ? [6, 5] : null); });
      lines.forEach(function (ln) { var tr = clipLine(ln.p, ln.v, L); if (!tr) return; C3.line(ctx, [v3(ln.p, ln.v, tr[0]), v3(ln.p, ln.v, tr[1])], col(ln.color, k), 2.8); if (ln.label) { var q = C3.P(v3(ln.p, ln.v, tr[1] * 0.85 + tr[0] * 0.15)); pill(ctx, ln.label, q[0] + 6, q[1] - 12, col(ln.color, k), c.w, c.h); } });
      vecs.forEach(function (vc) { var q = C3.arrow(ctx, vc.a, vc.b, col(vc.color, k)); if (vc.label) pill(ctx, vc.label, q[0] + 6, q[1] - 12, col(vc.color, k), c.w, c.h); });
      if (o.show === 'distance' && pts.length > 1) {
        var A = pts[0].p, B = pts[1].p, c1 = [B[0], A[1], A[2]], c2 = [B[0], B[1], A[2]];
        C3.line(ctx, [A, c1], k.red, 2.5, [5, 4]); C3.line(ctx, [c1, c2], k.green, 2.5, [5, 4]); C3.line(ctx, [c2, B], k.blue, 2.5, [5, 4]); C3.line(ctx, [A, B], k.ink, 3);
        var dd = sub3(B, A); s += 'Distance from ' + (pts[0].label || 'P') + ' to ' + (pts[1].label || 'Q') + ': legs <span class="mla-r">Δx = ' + fm(dd[0]) + '</span>, <span class="mla-g">Δy = ' + fm(dd[1]) + '</span>, <span class="mla-b">Δz = ' + fm(dd[2]) + '</span>; d = √(' + fm(dd[0] * dd[0]) + ' + ' + fm(dd[1] * dd[1]) + ' + ' + fm(dd[2] * dd[2]) + ') = <b>' + fm(len3(dd), 3) + '</b>. ';
      }
      if (o.show === 'foot' && pts.length && planes.length) {
        var pl = planes[0], P0 = pts[0].p, nn = len3(pl.n), sd = (dot3(pl.n, P0) - pl.d) / nn, foot = v3(P0, pl.n, -sd / nn);
        C3.line(ctx, [P0, foot], k.red, 3, [6, 4]); C3.dot(ctx, foot, k.red, 4.5);
        s += 'Point ' + pstr(P0) + '. Plane ' + linStr(pl.n, ['x', 'y', 'z']) + ' = ' + fm(pl.d) + ' (normal n = ' + vstr(pl.n) + '). The shortest path runs along n: <span class="mla-r">distance = |n · P − d| / |n| = ' + fm(M.abs(sd), 3) + '</span>, foot ' + pstr(foot) + '. ';
      }
      if (o.show === 'skew' && lines.length > 1) {
        var l1 = lines[0], l2 = lines[1], n2 = cross3(l1.v, l2.v);
        if (len3(n2) < 1e-9) s += 'The lines are parallel (their directions are multiples). ';
        else {
          var r = sub3(l1.p, l2.p), a11 = dot3(l1.v, l1.v), a12 = -dot3(l1.v, l2.v), a22 = dot3(l2.v, l2.v), b1 = -dot3(r, l1.v), b2 = dot3(r, l2.v), det = a11 * a22 - a12 * a12, t = (b1 * a22 - a12 * b2) / det, u = (a11 * b2 - a12 * b1) / det;
          var X = v3(l1.p, l1.v, t), Y = v3(l2.p, l2.v, u), dist = len3(sub3(X, Y));
          C3.line(ctx, [X, Y], k.red, 3, [5, 4]); C3.dot(ctx, X, k.red, 4); C3.dot(ctx, Y, k.red, 4);
          s += dist < 1e-6 ? 'The lines meet at ' + pstr(X) + ': they intersect. ' : 'Not parallel (n = v₁ × v₂ = ' + vstr(n2) + ') and they never meet: <b>skew</b>. The red segment is the shortest connection, along n; its length is <b>' + fm(dist, 3) + '</b>. ';
        }
      }
      pts.forEach(function (pt) {
        var p = pt.p, cc = col(pt.color, k);
        if (pt.box) { var fl = [p[0], p[1], 0]; C3.line(ctx, [[p[0], 0, 0], [p[0], p[1], 0], [0, p[1], 0]], rgba(k.muted, 0.9), 1.5, [4, 4]); C3.line(ctx, [fl, p], rgba(k.muted, 0.9), 1.5, [4, 4]); C3.dot(ctx, fl, rgba(k.muted, 0.8), 3); }
        var q = C3.dot(ctx, p, cc, 6); if (pt.label) pill(ctx, pt.label + ' ' + pstr(p, 2), q[0] + 8, q[1] - 14, cc, c.w, c.h);
      });
      if (o.show === 'coords' || (!s && pts.length)) s += pts.map(function (pt) { return (pt.label || 'Point') + ' = ' + pstr(pt.p) + (pt.box ? ': ' + fm(pt.p[0]) + ' along x, ' + fm(pt.p[1]) + ' along y, then ' + fm(pt.p[2]) + ' up' : ''); }).join('; ') + '. ';
      if (!s) s = 'Drag to turn the picture and see it from another side.';
      if (planes.length && o.show !== 'foot') s += planes.map(function (pl) { return 'Plane ' + (pl.label ? pl.label + ': ' : '') + 'normal ' + vstr(pl.n) + ' sticks straight out of it.'; }).join(' ');
      F.out.set(s);
    }
    V.onTheme(draw); draw();
    return { draw: draw };
  });

  // =============================================================== calc3-coords
  V.register('calc3-coords', function (el, o) {
    var sph = o.mode !== 'cyl', L = nv(o.range, 3), S = sph ? { a: nv(o.rho, 2.5), th: nv(o.theta, 40), b: nv(o.phi, 50) } : { a: nv(o.r, 2), th: nv(o.theta, 40), b: nv(o.z, 1.5) };
    var F = frame(el, o, sph ? 'A point in spherical coordinates' : 'A point in cylindrical coordinates'), c = V.canvas(F.box, { aspect: 1.25, max: 470, min: 300 });
    var C3 = cam(c, { r: L * 1.3, yaw: o.yaw != null ? o.yaw : -S.th * PI / 180 - 0.7, pitch: o.pitch, change: draw });
    c.cv.setAttribute('aria-label', (sph ? 'Spherical' : 'Cylindrical') + ' coordinates of a point. Drag or use the arrow keys to turn the view; use the sliders to move the point.');
    V.slider(F.ctl, { label: sph ? 'ρ (distance from the origin)' : 'r (distance from the z-axis)', min: 0, max: L, step: 0.1, value: S.a, input: function (v) { S.a = v; draw(); } });
    V.slider(F.ctl, { label: 'θ (around the z-axis)', min: 0, max: 360, step: 5, value: S.th, fmt: function (v) { return v + '°'; }, input: function (v) { S.th = v; draw(); } });
    V.slider(F.ctl, sph ? { label: 'φ (down from the +z-axis)', min: 0, max: 180, step: 5, value: S.b, fmt: function (v) { return v + '°'; }, input: function (v) { S.b = v; draw(); } } : { label: 'z (height)', min: -L, max: L, step: 0.1, value: S.b, input: function (v) { S.b = v; draw(); } });
    function draw() {
      var k = V.colors(), ctx = c.ctx, th = S.th * PI / 180, ph = sph ? S.b * PI / 180 : 0, r = sph ? S.a * M.sin(ph) : S.a, z = sph ? S.a * M.cos(ph) : S.b, P = [r * M.cos(th), r * M.sin(th), z], fl = [P[0], P[1], 0];
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h); C3.axes(ctx, L);
      // θ arc in the xy-plane
      var arc = []; for (var i = 0; i <= 40; i++) { var t = th * i / 40; arc.push([0.7 * M.cos(t), 0.7 * M.sin(t), 0]); } if (th > 0.01) C3.line(ctx, arc, k.gold, 3);
      var ta = C3.P([0.95 * M.cos(th / 2), 0.95 * M.sin(th / 2), 0]); txt(ctx, 'θ', ta[0], ta[1], { italic: true, bold: true, size: 15, color: k.gold, align: 'center' });
      C3.line(ctx, [[0, 0, 0], fl], k.teal, 2.5); C3.line(ctx, [fl, P], rgba(k.muted, 0.9), 2, [5, 4]);
      if (sph) {
        C3.line(ctx, [[0, 0, 0], P], k.red, 3.2);
        var pa = [], dirH = [M.cos(th), M.sin(th), 0], R0 = M.min(0.9, 0.55 * S.a + 0.3); for (var j = 0; j <= 40; j++) { var a = ph * j / 40; pa.push([R0 * M.sin(a) * dirH[0], R0 * M.sin(a) * dirH[1], R0 * M.cos(a)]); } if (ph > 0.01) C3.line(ctx, pa, k.purple, 3);
        var pp = C3.P([1.2 * R0 * M.sin(ph / 2) * dirH[0], 1.2 * R0 * M.sin(ph / 2) * dirH[1], 1.2 * R0 * M.cos(ph / 2)]); txt(ctx, 'φ', pp[0], pp[1], { italic: true, bold: true, size: 15, color: k.purple, align: 'center' });
        var rm = C3.P(v3([0, 0, 0], P, 0.55)); pill(ctx, 'ρ', rm[0] + 6, rm[1] - 10, k.red, c.w, c.h);
      } else { C3.line(ctx, [[0, 0, 0], [0, 0, z]], rgba(k.blue, 0.6), 2, [3, 4]); var rm2 = C3.P(v3([0, 0, 0], fl, 0.5)); pill(ctx, 'r', rm2[0] + 4, rm2[1] + 12, k.teal, c.w, c.h); }
      C3.dot(ctx, fl, rgba(k.muted, 0.8), 3.5); var q = C3.dot(ctx, P, k.red, 6.5); pill(ctx, 'P', q[0] + 8, q[1] - 14, k.red, c.w, c.h);
      var rho = M.sqrt(r * r + z * z), phi = rho ? M.acos(clamp(z / rho, -1, 1)) * 180 / PI : 0;
      var s = 'Rectangular <b>(' + fm(P[0], 2) + ', ' + fm(P[1], 2) + ', ' + fm(z, 2) + ')</b>. Cylindrical (r, θ, z) = (' + fm(r, 2) + ', ' + fm(S.th, 0) + '°, ' + fm(z, 2) + '). Spherical (ρ, θ, φ) = (' + fm(rho, 2) + ', ' + fm(S.th, 0) + '°, ' + fm(phi, 0) + '°).<br>';
      s += sph ? '<span class="mla-r">ρ</span> is the distance from the origin; <span style="color:' + k.purple + ';font-weight:700">φ</span> is measured <b>down from the positive z-axis</b> (0° straight up, 90° flat, 180° straight down), so z = ρ cos φ and r = ρ sin φ.' : '<span style="color:' + k.teal + ';font-weight:700">r</span> is the distance from the z-axis (polar coordinates in the floor), and z is the ordinary height: x = r cos θ, y = r sin θ.';
      F.out.set(s);
      if (o.target && F.task) { var tg = o.target.map(function (x) { return nv(x, 0); }); F.done(M.abs(S.a - tg[0]) < 0.06 && M.abs(((S.th - tg[1]) % 360 + 360) % 360) < 3 && M.abs(S.b - tg[2]) < (sph ? 3 : 0.06)); }
    }
    V.onTheme(draw); draw();
    return { draw: draw };
  });

  // a sampled surface grid: {z[i][j], zmin, zmax}
  function grid(f, x0, x1, y0, y1, n) { var z = [], lo = 1e9, hi = -1e9; for (var i = 0; i <= n; i++) { z.push([]); for (var j = 0; j <= n; j++) { var v = f(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * j / n); z[i].push(v); if (isFinite(v)) { lo = M.min(lo, v); hi = M.max(hi, v); } } } return { z: z, zmin: lo, zmax: hi }; }
  function ramp(k, t) { // a blue -> green -> gold ramp for heights
    var A = isDark() ? [[50, 90, 160], [40, 130, 90], [170, 140, 60]] : [[120, 170, 230], [90, 180, 130], [230, 200, 110]];
    t = clamp(t, 0, 1); var i = t < 0.5 ? 0 : 1, u = t < 0.5 ? t * 2 : (t - 0.5) * 2, a = A[i], b = A[i + 1];
    return [0, 1, 2].map(function (j) { return M.round(a[j] + (b[j] - a[j]) * u); });
  }
  function shade(rgbv, L, a) { return 'rgba(' + rgbv.map(function (x) { return M.round(clamp(x * L, 0, 255)); }).join(',') + ',' + (a == null ? 1 : a) + ')'; }
  function surfaceFaces(C3, f, x0, x1, y0, y1, n, Z, alpha) {
    var G = grid(f, x0, x1, y0, y1, n), fs = [], k = V.colors();
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      var xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, ya = y0 + (y1 - y0) * j / n, yb = y0 + (y1 - y0) * (j + 1) / n, zz = [G.z[i][j], G.z[i + 1][j], G.z[i + 1][j + 1], G.z[i][j + 1]];
      if (!zz.every(isFinite)) continue;
      var q = [[xa, ya, Z(zz[0])], [xb, ya, Z(zz[1])], [xb, yb, Z(zz[2])], [xa, yb, Z(zz[3])]], nrm = cross3(sub3(q[1], q[0]), sub3(q[2], q[0])), t = ((zz[0] + zz[1] + zz[2] + zz[3]) / 4 - G.zmin) / (G.zmax - G.zmin || 1);
      fs.push({ q: q, fill: shade(ramp(k, t), 0.62 + 0.5 * C3.light(nrm), alpha == null ? 0.95 : alpha), stroke: rgba(isDark() ? '#000000' : '#ffffff', 0.3), lw: 0.5 });
    }
    return { faces: fs, G: G };
  }

  // =============================================================== calc3-tangent
  V.register('calc3-tangent', function (el, o) {
    var x0 = nv(o.xmin, -2), x1 = nv(o.xmax, 2), y0 = nv(o.ymin, -2), y1 = nv(o.ymax, 2), f = cf(o.f || '4 - x^2 - y^2', ['x', 'y']), S = { a: nv(o.a, 1), b: nv(o.b, 0.5) }, h = nv(o.h, 0.45 * (x1 - x0) / 4);
    var F = frame(el, o, 'A surface and its tangent plane'), c = V.canvas(F.box, { aspect: 1.25, max: 480, min: 300 });
    var G0 = grid(f, x0, x1, y0, y1, 24), span = M.max(x1 - x0, y1 - y0), zs = span * 0.7 / ((G0.zmax - G0.zmin) || 1), zc = (G0.zmax + G0.zmin) / 2;
    function Z(z) { return (z - zc) * zs; }
    var C3 = cam(c, { r: span * 0.85, center: [(x0 + x1) / 2, (y0 + y1) / 2, 0], yaw: o.yaw, pitch: o.pitch != null ? o.pitch : 0.5, change: draw });
    c.cv.setAttribute('aria-label', 'Surface z = ' + (o.f || '') + ' with its tangent plane. Drag or use the arrow keys to turn it; the sliders move the point.');
    V.slider(F.ctl, { label: 'a (x of the point)', min: x0, max: x1, step: (x1 - x0) / 40, value: S.a, input: function (v) { S.a = v; draw(); } });
    V.slider(F.ctl, { label: 'b (y of the point)', min: y0, max: y1, step: (y1 - y0) / 40, value: S.b, input: function (v) { S.b = v; draw(); } });
    var surf = surfaceFaces(C3, f, x0, x1, y0, y1, 24, Z, 0.92);
    function draw() {
      var k = V.colors(), ctx = c.ctx, a = S.a, b = S.b, z0 = f(a, b), fx = nd(function (x) { return f(x, b); }, a), fy = nd(function (y) { return f(a, y); }, b);
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var zb = Z(G0.zmin) - span * 0.1; C3.line(ctx, [[x0, y0, zb], [x1, y0, zb], [x1, y1, zb], [x0, y1, zb], [x0, y0, zb]], rgba(k.axis, 0.6), 1);
      surf = surfaceFaces(C3, f, x0, x1, y0, y1, 24, Z, 0.92); C3.faces(ctx, surf.faces);
      if (o.plane !== false) { var pq = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (s) { var x = a + s[0] * h, y = b + s[1] * h; return [x, y, Z(z0 + fx * (x - a) + fy * (y - b))]; }); C3.poly(ctx, pq, rgba(k.red, isDark() ? 0.38 : 0.3), k.red, 2); }
      if (o.traces !== false) {
        var tx = [], ty = []; for (var i = 0; i <= 60; i++) { var x = x0 + (x1 - x0) * i / 60, y = y0 + (y1 - y0) * i / 60; tx.push([x, b, Z(f(x, b))]); ty.push([a, y, Z(f(a, y))]); }
        C3.line(ctx, tx, k.orange, 2.6); C3.line(ctx, ty, k.purple, 2.6);
        C3.line(ctx, [[a - h * 1.4, b, Z(z0 - fx * h * 1.4)], [a + h * 1.4, b, Z(z0 + fx * h * 1.4)]], k.orange, 4); C3.line(ctx, [[a, b - h * 1.4, Z(z0 - fy * h * 1.4)], [a, b + h * 1.4, Z(z0 + fy * h * 1.4)]], k.purple, 4);
      }
      C3.dot(ctx, [a, b, Z(z0)], k.ink, 6);
      F.out.set('At (a, b) = (' + fm(a, 2) + ', ' + fm(b, 2) + '): f = ' + fm(z0, 3) + ', <span style="color:' + k.orange + ';font-weight:700">f<sub>x</sub> = ' + fm(fx, 3) + '</span> (slope of the trace in the plane y = ' + fm(b, 2) + '), <span style="color:' + k.purple + ';font-weight:700">f<sub>y</sub> = ' + fm(fy, 3) + '</span> (slope of the trace in x = ' + fm(a, 2) + ').<br><span class="mla-r">Tangent plane</span>: z = ' + tplane(z0, fx, fy, a, b) + '. It contains both tangent lines; close to the point it hugs the surface, which is why it makes a good approximation.');
    }
    V.onTheme(draw); draw();
    return { draw: draw };
  });

  // marching squares contour segments for level L on an n×n grid
  function contours(f, v, n, lv) {
    var x0 = v.xmin, x1 = v.xmax, y0 = v.ymin, y1 = v.ymax, G = [], i, j;
    for (i = 0; i <= n; i++) { G.push([]); for (j = 0; j <= n; j++) G[i].push(f(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * j / n)); }
    var segs = [];
    lv.forEach(function (L) {
      for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
        var c = [G[i][j], G[i + 1][j], G[i + 1][j + 1], G[i][j + 1]], P = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], cut = [];
        if (!c.every(isFinite)) continue;
        for (var e = 0; e < 4; e++) { var a = c[e], b = c[(e + 1) % 4]; if ((a - L) * (b - L) < 0) { var t = (L - a) / (b - a), pa = P[e], pb = P[(e + 1) % 4]; cut.push([x0 + (x1 - x0) * (pa[0] + (pb[0] - pa[0]) * t) / n, y0 + (y1 - y0) * (pa[1] + (pb[1] - pa[1]) * t) / n]); } }
        if (cut.length === 2) segs.push([cut[0], cut[1], L]); else if (cut.length === 4) { segs.push([cut[0], cut[1], L]); segs.push([cut[2], cut[3], L]); }
      }
    });
    return segs;
  }
  function niceLevels(lo, hi, n) { var raw = (hi - lo) / n, m = M.pow(10, M.floor(M.log10(raw || 1))), f = raw / m, st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m, out = []; for (var v = M.ceil(lo / st) * st; v <= hi; v += st) out.push(M.abs(v) < st * 1e-9 ? 0 : v); return out; }

  // =============================================================== calc3-lagrange
  V.register('calc3-lagrange', function (el, o) {
    var f = cf(o.f || 'x*y', ['x', 'y']), g = cf(o.g || 'x^2+y^2', ['x', 'y']), cu = o.curve || { x: '2cos(t)', y: '2sin(t)', t0: 0, t1: '2pi' }, X = cf(cu.x, ['t']), Y = cf(cu.y, ['t']), t0 = nv(cu.t0, 0), t1 = nv(cu.t1, TAU), S = { t: nv(o.t, t0 + (t1 - t0) * 0.1) };
    var F = frame(el, o, 'Lagrange multipliers: level curves of f and a constraint curve'), c = V.canvas(F.box, { aspect: 1.25, max: 480, min: 300 });
    var P = V.plane(c, { xmin: nv(o.xmin, -3), xmax: nv(o.xmax, 3), ymin: nv(o.ymin, -3), ymax: nv(o.ymax, 3), equal: true });
    c.cv.setAttribute('aria-label', 'Contour map of f with a constraint curve. Left and right arrow keys move the point along the curve.');
    var tsl = V.slider(F.ctl, { label: 'position on the constraint curve', min: t0, max: t1, step: (t1 - t0) / 300, value: S.t, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.t = v; draw(); } });
    V.drag(c.cv, { hit: function (px, py) { return M.hypot(px - P.X(X(S.t)), py - P.Y(Y(S.t))) < 32 ? 1 : null; }, move: function (hh, px, py) { var best = S.t, bd = 1e9; for (var i = 0; i <= 600; i++) { var t = t0 + (t1 - t0) * i / 600, d = M.hypot(P.X(X(t)) - px, P.Y(Y(t)) - py); if (d < bd) { bd = d; best = t; } } S.t = best; tsl.set(S.t); draw(); } });
    c.cv.tabIndex = 0; c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1 }[e.key]; if (!d) return; S.t = clamp(S.t + d * (t1 - t0) / 200, t0, t1); tsl.set(S.t); draw(); e.preventDefault(); });
    var fvals = []; for (var i = 0; i <= 600; i++) { var tt = t0 + (t1 - t0) * i / 600; fvals.push(f(X(tt), Y(tt))); } var fmax = M.max.apply(null, fvals), fmin = M.min.apply(null, fvals);
    function grad(h, x, y) { return [nd(function (u) { return h(u, y); }, x), nd(function (u) { return h(x, u); }, y)]; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view();
      P.clear(); P.grid({ minor: false });
      var lo = 1e9, hi = -1e9; for (var a = 0; a <= 20; a++) for (var b = 0; b <= 20; b++) { var z = f(v.xmin + (v.xmax - v.xmin) * a / 20, v.ymin + (v.ymax - v.ymin) * b / 20); if (isFinite(z)) { lo = M.min(lo, z); hi = M.max(hi, z); } }
      var segs = contours(f, v, 70, niceLevels(lo, hi, o.levels || 14));
      ctx.save(); ctx.lineWidth = 1.2; segs.forEach(function (sg) { var t = (sg[2] - lo) / (hi - lo || 1); ctx.strokeStyle = 'rgb(' + ramp(k, t).join(',') + ')'; ctx.beginPath(); ctx.moveTo(P.X(sg[0][0]), P.Y(sg[0][1])); ctx.lineTo(P.X(sg[1][0]), P.Y(sg[1][1])); ctx.stroke(); }); ctx.restore();
      P.axes();
      P.param(X, Y, t0, t1, { color: 'blue', width: 3.5 });
      var x = X(S.t), y = Y(S.t), fv = f(x, y), gf = grad(f, x, y), gg = grad(g, x, y), lf = M.hypot(gf[0], gf[1]), lg = M.hypot(gg[0], gg[1]);
      var lc = contours(f, v, 90, [fv]); ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2.6; lc.forEach(function (sg) { ctx.beginPath(); ctx.moveTo(P.X(sg[0][0]), P.Y(sg[0][1])); ctx.lineTo(P.X(sg[1][0]), P.Y(sg[1][1])); ctx.stroke(); }); ctx.restore();
      var sc = 1.1 / M.max(lf, lg, 1e-9);
      if (lf > 1e-9) P.arrow(x, y, x + gf[0] * sc, y + gf[1] * sc, { color: 'red', width: 3.5, head: 12 });
      if (lg > 1e-9) P.arrow(x, y, x + gg[0] * sc, y + gg[1] * sc, { color: 'blue', width: 3, head: 11 });
      if (lf > 1e-9) pill(ctx, '∇f', P.X(x + gf[0] * sc) + 6, P.Y(y + gf[1] * sc) - 12, k.red, c.w, c.h);
      if (lg > 1e-9) pill(ctx, '∇g', P.X(x + gg[0] * sc) + 6, P.Y(y + gg[1] * sc) + 12, k.blue, c.w, c.h);
      ctx.save(); ctx.fillStyle = k.ink; ctx.beginPath(); ctx.arc(P.X(x), P.Y(y), 6.5, 0, TAU); ctx.fill(); ctx.strokeStyle = k.bg; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      var cosA = lf > 1e-9 && lg > 1e-9 ? (gf[0] * gg[0] + gf[1] * gg[1]) / (lf * lg) : 1, ang = M.acos(clamp(M.abs(cosA), 0, 1)) * 180 / PI, par = ang < 2, lam = lg > 1e-9 ? M.sign(cosA) * lf / lg : 0;
      var ext = M.abs(fv - fmax) < 1e-3 * (1 + M.abs(fmax)) ? ' This is the largest value of f on the curve.' : M.abs(fv - fmin) < 1e-3 * (1 + M.abs(fmin)) ? ' This is the smallest value of f on the curve.' : '';
      F.out.set('Point (' + fm(x, 2) + ', ' + fm(y, 2) + ') on the <span class="mla-b">constraint curve</span>: f = <b>' + fm(fv, 3) + '</b>. The bold curve is the level curve of f through the point.<br>Angle between <span class="mla-r">∇f</span> and <span class="mla-b">∇g</span>: ' + fm(ang, 1) + '°. ' + (par ? '<b>They line up</b>: the level curve of f just touches the constraint, and ∇f = λ∇g with λ ≈ ' + fm(lam, 3) + '.' + ext : 'The level curve crosses the constraint, so sliding along the curve still changes f.'));
      if (F.task) F.done(par && ext);
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  // =============================================================== calc3-region
  V.register('calc3-region', function (el, o) {
    var pol = o.polar, ord = o.order || (o.I ? 'dydx' : 'dxdy'), S = { at: o.at };
    var F = frame(el, o, 'A region of integration with a slice'), c = V.canvas(F.box, { aspect: 1.3, max: 460, min: 280 });
    var P = V.plane(c, { xmin: nv(o.xmin, -0.5), xmax: nv(o.xmax, 2), ymin: nv(o.ymin, -0.5), ymax: nv(o.ymax, 2), equal: o.equal !== false });
    var I = o.I && { lo: cf(o.I.lo, ['x']), hi: cf(o.I.hi, ['x']), a: nv(o.I.a, 0), b: nv(o.I.b, 1), loT: o.I.loT || 'y = ' + o.I.lo, hiT: o.I.hiT || 'y = ' + o.I.hi };
    var II = o.II && { lo: cf(o.II.lo, ['y']), hi: cf(o.II.hi, ['y']), c: nv(o.II.c, 0), d: nv(o.II.d, 1), loT: o.II.loT || 'x = ' + o.II.lo, hiT: o.II.hiT || 'x = ' + o.II.hi };
    var Pl = pol && { lo: cf(pol.lo, ['theta']), hi: cf(pol.hi, ['theta']), a: nv(pol.a, 0), b: nv(pol.b, PI / 2), loT: pol.loT || 'r = ' + pol.lo, hiT: pol.hiT || 'r = ' + pol.hi };
    if (pol) ord = 'polar';
    function rng() { return ord === 'dydx' ? [I.a, I.b] : ord === 'dxdy' ? [II.c, II.d] : [Pl.a, Pl.b]; }
    if (S.at == null) S.at = (rng()[0] + rng()[1]) / 2 * 0.9 + rng()[0] * 0.1;
    c.cv.setAttribute('aria-label', 'Region of integration. Left and right arrow keys move the slice.');
    if (I && II) V.seg(F.ctl, { label: 'Order', items: [['dydx', 'dy dx (vertical slices)'], ['dxdy', 'dx dy (horizontal slices)']], value: ord, change: function (v) { ord = v; var r = rng(); S.at = (r[0] + r[1]) / 2; sl.input.min = r[0]; sl.input.max = r[1]; sl.input.step = (r[1] - r[0]) / 100; sl.set(S.at); draw(); } });
    var r0 = rng(), sl = V.slider(F.ctl, { label: 'slice position', min: r0[0], max: r0[1], step: (r0[1] - r0[0]) / 100, value: S.at, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.at = v; draw(); } });
    c.cv.tabIndex = 0; c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1 }[e.key]; if (!d) return; var r = rng(); S.at = clamp(S.at + d * (r[1] - r[0]) / 40, r[0], r[1]); sl.set(S.at); draw(); e.preventDefault(); });
    function outline() { // region boundary polygon
      var pts = [], i, N = 120;
      if (Pl) { for (i = 0; i <= N; i++) { var t = Pl.a + (Pl.b - Pl.a) * i / N, r = Pl.hi(t); pts.push([r * M.cos(t), r * M.sin(t)]); } for (i = N; i >= 0; i--) { var t2 = Pl.a + (Pl.b - Pl.a) * i / N, r2 = Pl.lo(t2); pts.push([r2 * M.cos(t2), r2 * M.sin(t2)]); } return pts; }
      if (I) { for (i = 0; i <= N; i++) { var x = I.a + (I.b - I.a) * i / N; pts.push([x, I.lo(x)]); } for (i = N; i >= 0; i--) { var x2 = I.a + (I.b - I.a) * i / N; pts.push([x2, I.hi(x2)]); } return pts; }
      for (i = 0; i <= N; i++) { var y = II.c + (II.d - II.c) * i / N; pts.push([II.lo(y), y]); } for (i = N; i >= 0; i--) { var y2 = II.c + (II.d - II.c) * i / N; pts.push([II.hi(y2), y2]); } return pts;
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear(); P.grid(); P.axes({ x: 'x', y: 'y' });
      var pts = outline(); ctx.save(); ctx.fillStyle = rgba(k.green, isDark() ? 0.25 : 0.16); ctx.strokeStyle = k.green; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(P.X(p[0]), P.Y(p[1])); else ctx.moveTo(P.X(p[0]), P.Y(p[1])); }); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      var s = '', w = (rng()[1] - rng()[0]) / 40;
      if (ord === 'dydx') {
        var x = S.at, ylo = I.lo(x), yhi = I.hi(x);
        P.plot(I.lo, { from: I.a, to: I.b, color: 'blue', width: 3 }); P.plot(I.hi, { from: I.a, to: I.b, color: 'red', width: 3 });
        ctx.save(); ctx.fillStyle = rgba(k.gold, 0.55); ctx.fillRect(P.X(x - w / 2), P.Y(yhi), M.max(3, P.X(x + w / 2) - P.X(x - w / 2)), P.Y(ylo) - P.Y(yhi)); ctx.restore();
        P.point(x, ylo, { color: 'blue' }); P.point(x, yhi, { color: 'red' });
        s = '<b>dy dx</b>: a vertical slice at x = ' + fm(x, 2) + ' runs from y = <span class="mla-b">' + fm(ylo, 3) + '</span> (on the lower curve, <span class="mla-b">' + I.loT + '</span>) up to y = <span class="mla-r">' + fm(yhi, 3) + '</span> (on <span class="mla-r">' + I.hiT + '</span>). Those curves are the inner limits; the slices sweep from x = ' + fm(I.a, 2) + ' to x = ' + fm(I.b, 2) + ', the outer limits (numbers).';
      } else if (ord === 'dxdy') {
        var y = S.at, xlo = II.lo(y), xhi = II.hi(y);
        var N2 = 120, lc = [], hc = []; for (var i = 0; i <= N2; i++) { var yy = II.c + (II.d - II.c) * i / N2; lc.push([II.lo(yy), yy]); hc.push([II.hi(yy), yy]); }
        P.poly(lc, { close: false, color: 'blue', width: 3 }); P.poly(hc, { close: false, color: 'red', width: 3 });
        ctx.save(); ctx.fillStyle = rgba(k.gold, 0.55); var hh = M.max(3, P.Y(y - w / 2) - P.Y(y + w / 2)); ctx.fillRect(P.X(xlo), P.Y(y + w / 2), P.X(xhi) - P.X(xlo), hh); ctx.restore();
        P.point(xlo, y, { color: 'blue' }); P.point(xhi, y, { color: 'red' });
        s = '<b>dx dy</b>: a horizontal slice at y = ' + fm(y, 2) + ' runs from x = <span class="mla-b">' + fm(xlo, 3) + '</span> (on the left curve, <span class="mla-b">' + II.loT + '</span>) to x = <span class="mla-r">' + fm(xhi, 3) + '</span> (on <span class="mla-r">' + II.hiT + '</span>). Outer limits: y from ' + fm(II.c, 2) + ' to ' + fm(II.d, 2) + '.';
      } else {
        var th = S.at, rlo = Pl.lo(th), rhi = Pl.hi(th), dth = (Pl.b - Pl.a) / 30, wedge = [];
        for (var j = 0; j <= 10; j++) { var t = th - dth / 2 + dth * j / 10; wedge.push([rhi * M.cos(t), rhi * M.sin(t)]); } for (j = 10; j >= 0; j--) { var t2 = th - dth / 2 + dth * j / 10; wedge.push([rlo * M.cos(t2), rlo * M.sin(t2)]); }
        P.poly(wedge, { close: true, color: 'gold', width: 2, fill: rgba(k.gold, 0.55) });
        var rm = (rlo + rhi) / 2, dr = (rhi - rlo) / 8, box = []; for (j = 0; j <= 8; j++) { var t3 = th - dth / 2 + dth * j / 8; box.push([(rm + dr / 2) * M.cos(t3), (rm + dr / 2) * M.sin(t3)]); } for (j = 8; j >= 0; j--) { var t4 = th - dth / 2 + dth * j / 8; box.push([(rm - dr / 2) * M.cos(t4), (rm - dr / 2) * M.sin(t4)]); }
        P.poly(box, { close: true, color: 'red', width: 2.5, fill: rgba(k.red, 0.5) });
        s = '<b>Polar</b>: the ray at θ = ' + fm(th, 2) + ' (' + fm(th * 180 / PI, 0) + '°) crosses the region from r = ' + fm(rlo, 2) + ' (' + Pl.loT + ') to r = ' + fm(rhi, 2) + ' (' + Pl.hiT + '). The <span class="mla-r">small polar box</span> at r = ' + fm(rm, 2) + ' is Δr wide and <b>r Δθ</b> long (its arc grows with r), so its area is about <b>r Δr Δθ</b>: that is why dA = r dr dθ.';
      }
      F.out.set(s);
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  // =============================================================== calc3-jacobian
  V.register('calc3-jacobian', function (el, o) {
    var mp = o.map || 'polar', fx, fy, nm;
    if (mp === 'polar') { fx = function (u, v) { return u * M.cos(v); }; fy = function (u, v) { return u * M.sin(v); }; nm = 'x = r cos θ, y = r sin θ'; }
    else if (mp === 'linear') { var m = (o.m || [[2, 1], [1, 1]]).map(function (r) { return r.map(function (x) { return nv(x, 0); }); }); fx = function (u, v) { return m[0][0] * u + m[0][1] * v; }; fy = function (u, v) { return m[1][0] * u + m[1][1] * v; }; nm = 'x = ' + linStr(m[0], ['u', 'v']) + ', y = ' + linStr(m[1], ['u', 'v']); }
    else { var gx = cf(mp.x, ['u', 'v']), gy = cf(mp.y, ['u', 'v']); fx = gx; fy = gy; nm = 'x = ' + mp.x + ', y = ' + mp.y; }
    var polar = mp === 'polar', U = (o.u || [0, 2]).map(function (x) { return nv(x, 0); }), Vv = (o.v || [0, polar ? PI / 2 : 2]).map(function (x) { return nv(x, 0); }), du = nv(o.du, (U[1] - U[0]) / 8), dv = nv(o.dv, (Vv[1] - Vv[0]) / 8);
    var S = { u: nv((o.cell || [])[0], U[0] + (U[1] - U[0]) * 0.5), v: nv((o.cell || [])[1], Vv[0] + (Vv[1] - Vv[0]) * 0.4) };
    var narrow = (el.clientWidth || 600) < 520, F = frame(el, o, 'A change of variables and its Jacobian'), c = V.canvas(F.box, narrow ? { aspect: 0.62, max: 640, min: 420 } : { aspect: 2, max: 380, min: 300 });
    c.cv.setAttribute('aria-label', 'Left: a grid in the ' + (polar ? 'r θ' : 'u v') + ' plane. Right: its image. Sliders move the highlighted cell.');
    var un = polar ? 'r' : 'u', vn = polar ? 'θ' : 'v';
    V.slider(F.ctl, { label: un + ' of the cell', min: U[0], max: U[1] - du, step: (U[1] - U[0]) / 80, value: S.u, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.u = v; draw(); } });
    V.slider(F.ctl, { label: vn + ' of the cell', min: Vv[0], max: Vv[1] - dv, step: (Vv[1] - Vv[0]) / 80, value: S.v, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.v = v; draw(); } });
    // bounding box of the image
    var bx = [1e9, -1e9, 1e9, -1e9]; for (var i = 0; i <= 20; i++) for (var j = 0; j <= 20; j++) { var uu = U[0] + (U[1] - U[0]) * i / 20, vv = Vv[0] + (Vv[1] - Vv[0]) * j / 20, X = fx(uu, vv), Y = fy(uu, vv); bx = [M.min(bx[0], X), M.max(bx[1], X), M.min(bx[2], Y), M.max(bx[3], Y)]; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, wide = c.w >= 520, W2 = wide ? c.w / 2 : c.w, H2 = wide ? c.h : c.h / 2;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      function panel(ox, oy, w, h, xr, yr) { var pad = 30, sx = (w - 2 * pad) / (xr[1] - xr[0] || 1), sy = (h - 2 * pad) / (yr[1] - yr[0] || 1), s = M.min(sx, sy); return { X: function (x) { return ox + pad + (x - xr[0]) * s + ((w - 2 * pad) - (xr[1] - xr[0]) * s) / 2; }, Y: function (y) { return oy + h - pad - (y - yr[0]) * s - ((h - 2 * pad) - (yr[1] - yr[0]) * s) / 2; } }; }
      var mx = (bx[1] - bx[0]) * 0.08 + 0.1, my = (bx[3] - bx[2]) * 0.08 + 0.1;
      var A = panel(0, 0, W2, H2, [U[0], U[1]], [Vv[0], Vv[1]]), B = panel(wide ? W2 : 0, wide ? 0 : H2, W2, H2, [M.min(0, bx[0] - mx), bx[1] + mx], [M.min(0, bx[2] - my), bx[3] + my]);
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; if (wide) { ctx.beginPath(); ctx.moveTo(W2 + 0.5, 8); ctx.lineTo(W2 + 0.5, c.h - 8); ctx.stroke(); } else { ctx.beginPath(); ctx.moveTo(8, H2 + 0.5); ctx.lineTo(c.w - 8, H2 + 0.5); ctx.stroke(); } ctx.restore();
      // axes of the image panel
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(B.X(M.min(0, bx[0] - mx)), B.Y(0)); ctx.lineTo(B.X(bx[1] + mx), B.Y(0)); ctx.moveTo(B.X(0), B.Y(M.min(0, bx[2] - my))); ctx.lineTo(B.X(0), B.Y(bx[3] + my)); ctx.stroke(); ctx.restore();
      var nU = 8, nV = 8;
      ctx.save(); ctx.strokeStyle = rgba(k.blue, 0.7); ctx.lineWidth = 1.2;
      for (var i = 0; i <= nU; i++) { var u = U[0] + (U[1] - U[0]) * i / nU; ctx.beginPath(); ctx.moveTo(A.X(u), A.Y(Vv[0])); ctx.lineTo(A.X(u), A.Y(Vv[1])); ctx.stroke(); ctx.beginPath(); for (var j = 0; j <= 40; j++) { var v = Vv[0] + (Vv[1] - Vv[0]) * j / 40; if (j) ctx.lineTo(B.X(fx(u, v)), B.Y(fy(u, v))); else ctx.moveTo(B.X(fx(u, v)), B.Y(fy(u, v))); } ctx.stroke(); }
      ctx.strokeStyle = rgba(k.green, 0.75);
      for (j = 0; j <= nV; j++) { var v2 = Vv[0] + (Vv[1] - Vv[0]) * j / nV; ctx.beginPath(); ctx.moveTo(A.X(U[0]), A.Y(v2)); ctx.lineTo(A.X(U[1]), A.Y(v2)); ctx.stroke(); ctx.beginPath(); for (i = 0; i <= 40; i++) { var u2 = U[0] + (U[1] - U[0]) * i / 40; if (i) ctx.lineTo(B.X(fx(u2, v2)), B.Y(fy(u2, v2))); else ctx.moveTo(B.X(fx(u2, v2)), B.Y(fy(u2, v2))); } ctx.stroke(); }
      ctx.restore();
      // the highlighted cell and its image
      var cell = [[S.u, S.v], [S.u + du, S.v], [S.u + du, S.v + dv], [S.u, S.v + dv]], img = [];
      [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(function (e) { for (var q = 0; q < 10; q++) { var a = cell[e[0]], b = cell[e[1]], t = q / 10, uu = a[0] + (b[0] - a[0]) * t, vv = a[1] + (b[1] - a[1]) * t; img.push([fx(uu, vv), fy(uu, vv)]); } });
      ctx.save(); ctx.fillStyle = rgba(k.red, 0.55); ctx.strokeStyle = k.red; ctx.lineWidth = 2;
      ctx.beginPath(); cell.forEach(function (p, i) { if (i) ctx.lineTo(A.X(p[0]), A.Y(p[1])); else ctx.moveTo(A.X(p[0]), A.Y(p[1])); }); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); img.forEach(function (p, i) { if (i) ctx.lineTo(B.X(p[0]), B.Y(p[1])); else ctx.moveTo(B.X(p[0]), B.Y(p[1])); }); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      txt(ctx, (polar ? 'rθ' : 'uv') + '-plane', 10, 14, { color: k.muted, size: 12 }); txt(ctx, 'xy-plane', (wide ? W2 : 0) + 10, (wide ? 0 : H2) + 14, { color: k.muted, size: 12 });
      txt(ctx, un, A.X(U[1]) - 4, A.Y(Vv[0]) + 16, { italic: true, size: 14, color: k.ink, align: 'right' }); txt(ctx, vn, A.X(U[0]) - 14, A.Y(Vv[1]) + 4, { italic: true, size: 14, color: k.ink });
      // areas: the image polygon (shoelace) and |J| du dv at the cell's corner
      var area = 0; for (var q2 = 0; q2 < img.length; q2++) { var p1 = img[q2], p2 = img[(q2 + 1) % img.length]; area += p1[0] * p2[1] - p2[0] * p1[1]; } area = M.abs(area) / 2;
      var uc = S.u + du / 2, vc = S.v + dv / 2, J = nd(function (s) { return fx(s, vc); }, uc) * nd(function (s) { return fy(uc, s); }, vc) - nd(function (s) { return fx(uc, s); }, vc) * nd(function (s) { return fy(s, vc); }, uc);
      F.out.set('Map: ' + nm + '. The <span class="mla-r">red cell</span> has area Δ' + un + ' Δ' + vn + ' = ' + fm(du * dv, 4) + ' on the left; its image has area ≈ <b>' + fm(area, 4) + '</b>.<br>Jacobian at the cell: ∂(x, y)/∂(' + un + ', ' + vn + ') = <b>' + fm(J, 3) + '</b>' + (polar ? ' (= r)' : '') + ', and |J| Δ' + un + ' Δ' + vn + ' = ' + fm(M.abs(J) * du * dv, 4) + ': the stretch factor for area. ' + (polar ? 'Cells farther out (bigger r) get stretched more.' : ''));
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  // =============================================================== calc3-boxes
  V.register('calc3-boxes', function (el, o) {
    var f = cf(o.f || '4 - x^2/2 - y^2/4', ['x', 'y']), a = nv(o.a, 0), b = nv(o.b, 2), cc = nv(o.c, 0), d = nv(o.d, 2), S = { n: o.n || 4, sample: o.sample || 'mid', surf: o.surface !== false };
    var F = frame(el, o, 'A double integral as a sum of boxes'), c = V.canvas(F.box, { aspect: 1.25, max: 470, min: 300 });
    var G0 = grid(f, a, b, cc, d, 20), top = M.max(G0.zmax, 0.1), span = M.max(b - a, d - cc), zs = span * 0.75 / top;
    var C3 = cam(c, { r: span * 0.95, center: [(a + b) / 2, (cc + d) / 2, top * zs * 0.35], yaw: o.yaw, pitch: o.pitch != null ? o.pitch : 0.42, change: draw });
    c.cv.setAttribute('aria-label', 'Boxes under the surface z = ' + (o.f || '') + '. Drag or use the arrow keys to turn the view.');
    V.slider(F.ctl, { label: 'boxes per side n', min: 1, max: 16, step: 1, value: S.n, input: function (v) { S.n = v; draw(); } });
    V.seg(F.ctl, { label: 'Sample point', items: [['mid', 'Midpoints'], ['corner', 'Upper right corners']], value: S.sample, change: function (v) { S.sample = v; draw(); } });
    var exact = 0; (function () { var N = 60, hx = (b - a) / N, hy = (d - cc) / N; for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) exact += f(a + (i + 0.5) * hx, cc + (j + 0.5) * hy) * hx * hy; })();
    function draw() {
      var k = V.colors(), ctx = c.ctx, n = S.n, dx = (b - a) / n, dy = (d - cc) / n, faces = [], sum = 0, off = S.sample === 'mid' ? 0.5 : 1;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      C3.line(ctx, [[a, cc, 0], [b, cc, 0], [b, d, 0], [a, d, 0], [a, cc, 0]], k.axis, 1.5);
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
        var x0 = a + i * dx, y0 = cc + j * dy, h = f(x0 + off * dx, y0 + off * dy); if (!isFinite(h)) continue; sum += h * dx * dy; var H = h * zs;
        var base = isDark() ? [70, 140, 200] : [110, 165, 225], cols = function (L) { return shade(base, L, 0.95); };
        var c0 = [x0, y0], c1 = [x0 + dx, y0], c2 = [x0 + dx, y0 + dy], c3 = [x0, y0 + dy], z0 = M.min(0, H), z1 = M.max(0, H);
        var corners = [c0, c1, c2, c3];
        faces.push({ q: corners.map(function (p) { return [p[0], p[1], z1]; }), fill: cols(1.05), stroke: rgba(k.ink, 0.35), lw: 0.8 });
        [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(function (e, ei) { var p = corners[e[0]], q2 = corners[e[1]]; faces.push({ q: [[p[0], p[1], z0], [q2[0], q2[1], z0], [q2[0], q2[1], z1], [p[0], p[1], z1]], fill: cols(0.7 + 0.12 * ei), stroke: rgba(k.ink, 0.35), lw: 0.8 }); });
      }
      C3.faces(ctx, faces);
      if (S.surf) { ctx.save(); ctx.globalAlpha = 0.85; for (var t = 0; t <= 8; t++) { var xs = [], ys = []; for (var s2 = 0; s2 <= 30; s2++) { var xx = a + (b - a) * t / 8, yy = cc + (d - cc) * s2 / 30; xs.push([xx, yy, f(xx, yy) * zs]); var x3 = a + (b - a) * s2 / 30, y3 = cc + (d - cc) * t / 8; ys.push([x3, y3, f(x3, y3) * zs]); } C3.line(ctx, xs, k.red, 1.4); C3.line(ctx, ys, k.red, 1.4); } ctx.restore(); }
      [[b + span * 0.08, cc, 0, 'x'], [a, d + span * 0.08, 0, 'y'], [a, cc, top * zs * 1.15, 'z']].forEach(function (e) { var p = C3.p(e[0], e[1], e[2]), o0 = C3.p(a, cc, 0); ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(o0[0], o0[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.restore(); txt(ctx, e[3], p[0] + 6, p[1], { italic: true, size: 15 }); });
      F.out.set(n * n + ' boxes, each with base ΔA = ' + fm(dx * dy, 4) + ' and height f at its ' + (S.sample === 'mid' ? 'center' : 'upper right corner') + '. Sum of their volumes: <b>' + fm(sum, 4) + '</b>. The volume under the <span class="mla-r">surface</span> (the double integral) is ' + fm(exact, 4) + '; the error is ' + fm(sum - exact, 4) + '. More, thinner boxes make the sum close in on the integral.');
    }
    V.onTheme(draw); draw();
    return { draw: draw };
  });
})(window, document);
