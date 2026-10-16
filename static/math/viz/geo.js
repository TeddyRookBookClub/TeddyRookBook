/* Math Ladder: extra visuals for the Geometry course (static/math/viz/geo.js). Built on static/math/viz/core.js
   (window.MathLadder.viz); the styles are injected from this file. Every visual follows the light or dark theme, works
   with mouse, touch and keyboard, and keeps a text readout for screen readers.

   geo-fig        a still, labeled diagram (used inside problems and worked examples)
     pts: {"A": [0, 0], "B": [4, 0]}      named points (math units, y up)
     segs: [["A", "B", {lab: "5", tick: 1, arrow: 1, color: "blue", dash: 1, w: 3, side: 1}]]
                                          tick: congruence ticks; arrow: parallel arrowheads (pointing A to B); lab: a side label
                                          (placed outside the figure; side 1 or -1 forces the left or right of A→B)
     lines: [["A", "B", {...}]]           whole lines through A and B;  rays: [["A", "B"]] from A through B
     polys: [["A", "B", "C", {fill: "blue"}]]   outlined, softly filled
     circles: [["O", 3, {...}]] or [["O", "A"]]  center and radius, or center and a point on the circle
     arcs: [["O", "A", "B", {lab: "80°", color: "red"}]]   the arc of the circle centered O from A counterclockwise to B
     angs: [["B", "A", "C", {lab: "x°", right: 1, n: 2, color: "red", r: 24, fill: 1}]]   the angle at A between rays AB and AC
     texts: [[x, y, "text", {color, size, it}]]   free labels
     groups: [["A","B","C"], ["D","E","F"]]   place each group's names away from that group's own center (two figures)
     hide: ["P"] points not drawn;  nolab: ["Q"] points drawn without a name;  labpos: {"A": "sw"} (n ne e se s sw w nw)
     dots: false                          draw no points at all (names still shown unless nolab)
     axes: false, grid: false, step: 1    coordinate axes and grid (for coordinate problems); coords: true writes A(1, 2)
     win: [xmin, xmax, ymin, ymax]        the window (default: fitted to the figure);  height: 280 (max px)
     label: "words"                       the aria-label (describe the given facts)

   geo-construct  compass-and-straightedge constructions, one step at a time (Back, Next, Start over)
     kind: "copy-segment" | "copy-angle" | "bisect-angle" | "perp-bisector" | "perp-from-point" | "perp-at-point" |
           "parallel" | "equilateral" | "hexagon" | "triangle" | "square"
     wrong: false        bisect-angle and perp-bisector only: change the compass width partway and see what goes wrong
     step: 0             the step to start on ("last" for the finished construction)

   geo-circle     circle theorems with points you drag around the circle
     mode: "central" (central angle = its arc), "inscribed" (inscribed angle = half its arc), "semicircle" (an angle
           inscribed in a semicircle is 90°), "cyclic" (opposite angles of an inscribed quadrilateral add to 180°),
           "tangent" (tangents from an outside point: equal lengths, perpendicular to the radii), "sector" (arc length and
           sector area, with sliders for r and the angle; also radians)
     a, b, p: angles in degrees for the points (central, inscribed); pts: [a, b, c, d] (cyclic); d: 1.9 (tangent: the
     distance OP in radii); r: 6, deg: 90 (sector); central: true (inscribed: also show the central angle); snap: 1
     nums: true (sector: false hides the computed arc length and area, for practice problems)

   geo-trig       a right triangle whose angle and size you change: opposite, adjacent and hypotenuse, and the ratios
     angle: 35, size: 8 (the hypotenuse), ref: "A" ("A" or "B": the angle you look from), show: ["sin", "cos", "tan"],
     compl: false (also show sin A = cos B), sliders: true

   geo-cavalieri  Cavalieri's principle: two stacks of thin slices with equal areas at every height have equal volume
     shape: "coins" (cylinders) | "cards" (square prisms) | "cone" (a cone and a pyramid with equal slice areas)
     r: 3, h: 8, lean: 0.6 (how far the right stack leans), slices: 12
     nums: true (false hides the numbers: "height h" and no computed areas, for practice problems)                                                   */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math, PI = M.PI, TAU = 2 * PI;
  var CSS = [
    '.geo-viz{--gv-gold:#b8963e}',
    '.geo-viz .geo-stage{position:relative;max-width:100%}',
    '.geo-viz .geo-cap{margin:.5rem 0 0;font-size:.95rem;line-height:1.5;min-height:1.5em}',
    '.geo-viz .geo-step{font-weight:700;color:var(--mv-acc);margin-right:.35rem}',
    '.geo-viz .geo-row{display:flex;flex-wrap:wrap;gap:.45rem .6rem;align-items:center;margin-top:.55rem}',
    '.geo-viz .geo-row .ml-sl{flex:1 1 160px;max-width:340px}',
    '.geo-viz .geo-ro{margin:.5rem 0 0;font-size:.95rem;line-height:1.55;min-height:1.5em}',
    '.geo-viz .geo-ro b{font-variant-numeric:tabular-nums}',
    '.geo-viz .ml-btn[disabled]{opacity:.45;cursor:default}',
    '.geo-viz .geo-cv:focus-visible{outline:3px solid #b8963e;outline-offset:2px}',
    '.geo-viz.geo-fig-v{padding:.4rem}',
    '.geo-viz .geo-hint{margin:.35rem 0 0;font-size:.82rem;color:var(--mv-muted)}'
  ].join('\n');
  function css() { if (D.getElementById('geo-viz-css')) return; var s = D.createElement('style'); s.id = 'geo-viz-css'; s.textContent = CSS; (D.head || D.documentElement).appendChild(s); }

  /* ------------------------------------------------------------ small helpers */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hyp(x, y) { return M.sqrt(x * x + y * y); }
  function f1(v, d) { var s = (+v).toFixed(d === undefined ? 1 : d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); if (s === '-0') s = '0'; return s.replace('-', '−'); }
  function rad(d) { return d * PI / 180; }
  function deg(r) { return r * 180 / PI; }
  function norm360(a) { a %= 360; if (a < 0) a += 360; return a; }
  function colOf(k, c, def) { return c ? (k[c] || c) : def; }
  function font(o) { return (o.it ? 'italic ' : '') + (o.wt || 600) + ' ' + (o.size || 14) + 'px ' + (o.it ? 'Georgia,"Times New Roman",serif' : 'system-ui,-apple-system,"Segoe UI",sans-serif'); }
  function text(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = font(o); ctx.textAlign = o.al || 'center'; ctx.textBaseline = 'middle';
    if (o.halo) { ctx.lineJoin = 'round'; ctx.lineWidth = o.haloW || 4; ctx.strokeStyle = o.halo; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.col || '#000'; ctx.fillText(s, x, y); ctx.restore();
  }
  function textW(ctx, s, o) { ctx.save(); ctx.font = font(o || {}); var w = ctx.measureText(s).width; ctx.restore(); return w; }
  function line(ctx, x1, y1, x2, y2, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.lineCap = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  function dot(ctx, x, y, r, fill, ring) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); if (ring) { ctx.lineWidth = 2; ctx.strokeStyle = ring; ctx.stroke(); } ctx.restore(); }
  /* pixel-space arc from screen angle t0 sweeping dt (radians, screen coordinates: y down) */
  function parc(ctx, cx, cy, r, t0, dt, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.arc(cx, cy, r, t0, t0 + dt, dt < 0); ctx.stroke(); ctx.restore(); }
  /* the angle mark at vertex v (pixels) between directions to p and q; returns the label point */
  function angMark(ctx, v, p, q, o, k) {
    var a1 = M.atan2(p[1] - v[1], p[0] - v[0]), a2 = M.atan2(q[1] - v[1], q[0] - v[0]), d = a2 - a1;
    while (d > PI) d -= TAU; while (d < -PI) d += TAU;
    var col = colOf(k, o.color, k.red), r = o.r || 22, mid = a1 + d / 2;
    if (o.right) {
      var s = o.r ? o.r * 0.55 : 12, e1 = [M.cos(a1), M.sin(a1)], e2 = [M.cos(a2), M.sin(a2)];
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(v[0] + e1[0] * s, v[1] + e1[1] * s); ctx.lineTo(v[0] + (e1[0] + e2[0]) * s, v[1] + (e1[1] + e2[1]) * s); ctx.lineTo(v[0] + e2[0] * s, v[1] + e2[1] * s);
      ctx.stroke(); ctx.restore(); r = s * 1.5;
    } else {
      if (o.fill) { ctx.save(); ctx.fillStyle = k[(o.color || 'red') + 'Soft'] || k.redSoft; ctx.beginPath(); ctx.moveTo(v[0], v[1]); ctx.arc(v[0], v[1], r, a1, a1 + d, d < 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
      var n = o.n || 1; for (var i = 0; i < n; i++) parc(ctx, v[0], v[1], r + i * 5, a1, d, col, 2);
      r += (n - 1) * 5;
    }
    return [v[0] + M.cos(mid) * (r + 13), v[1] + M.sin(mid) * (r + 13), mid];
  }
  function circInt(c1, r1, c2, r2) { // the two crossing points of two circles (math units), or null
    var dx = c2[0] - c1[0], dy = c2[1] - c1[1], d = hyp(dx, dy); if (d > r1 + r2 || d < M.abs(r1 - r2) || d === 0) return null;
    var a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = M.sqrt(M.max(0, r1 * r1 - a * a)), mx = c1[0] + a * dx / d, my = c1[1] + a * dy / d;
    return [[mx - h * dy / d, my + h * dx / d], [mx + h * dy / d, my - h * dx / d]];
  }
  function host(el, o, name, label) {
    el.classList.add('geo-viz', 'ml-notex'); el.setAttribute('role', 'group');
    var al = el.getAttribute('aria-label'); if (!al || al === name) el.setAttribute('aria-label', o.label || label);
    var st = D.createElement('div'); st.className = 'geo-stage'; el.appendChild(st); return st;
  }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ================================================================ geo-fig */
  function fig(elm, o, V) {
    elm.classList.add('geo-fig-v');
    var st = host(elm, o, 'geo-fig', 'A geometry diagram');
    var pts = {}, names = [];
    Object.keys(o.pts || {}).forEach(function (n) { var p = o.pts[n]; pts[n] = [+p[0], +p[1]]; names.push(n); });
    function P(n) { return typeof n === 'string' ? pts[n] : n; }
    var hide = o.hide || [], nolab = o.nolab || [], labpos = o.labpos || {};
    function rOf(c) { var C = P(c[0]); return typeof c[1] === 'string' || Array.isArray(c[1]) ? hyp(P(c[1])[0] - C[0], P(c[1])[1] - C[1]) : +c[1]; }
    var xmin, xmax, ymin, ymax;
    if (o.win) { xmin = o.win[0]; xmax = o.win[1]; ymin = o.win[2]; ymax = o.win[3]; }
    else {
      var xs = [], ys = [];
      names.forEach(function (n) { xs.push(pts[n][0]); ys.push(pts[n][1]); });
      (o.circles || []).forEach(function (c) { var C = P(c[0]), r = rOf(c); xs.push(C[0] - r, C[0] + r); ys.push(C[1] - r, C[1] + r); });
      (o.texts || []).forEach(function (t) { xs.push(t[0]); ys.push(t[1]); });
      if (!xs.length) { xs = [0, 1]; ys = [0, 1]; }
      xmin = M.min.apply(null, xs); xmax = M.max.apply(null, xs); ymin = M.min.apply(null, ys); ymax = M.max.apply(null, ys);
      var span = M.max(xmax - xmin, ymax - ymin, 1e-6), pad = span * 0.06;
      if (xmax - xmin < span * 0.35) { var cx = (xmin + xmax) / 2; xmin = cx - span * 0.175; xmax = cx + span * 0.175; }
      if (ymax - ymin < span * 0.2) { var cy = (ymin + ymax) / 2; ymin = cy - span * 0.1; ymax = cy + span * 0.1; }
      xmin -= pad; xmax += pad; ymin -= pad; ymax += pad;
      if (o.axes) { xmin = M.floor(M.min(xmin, -0.5)); xmax = M.ceil(M.max(xmax, 0.5)); ymin = M.floor(M.min(ymin, -0.5)); ymax = M.ceil(M.max(ymax, 0.5)); }
    }
    var asp = clamp((xmax - xmin) / (ymax - ymin), 1.05, 2.2), mh = o.height || 280;
    var box = el('div'); box.style.maxWidth = M.round(mh * M.max(asp, (xmax - xmin) / (ymax - ymin)) + (o.axes ? 28 : 52)) + 'px'; box.style.margin = '0 auto'; st.appendChild(box);
    var c = V.canvas(box, { aspect: asp, max: mh, min: 150 });
    c.cv.classList.add('geo-cv'); c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || elm.getAttribute('aria-label') || 'A geometry diagram');
    var pl = V.plane(c, { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, equal: true, pad: o.axes ? 14 : 26 });
    function X(p) { return [pl.X(p[0]), pl.Y(p[1])]; }
    function draw() {
      var k = V.colors(), ctx = c.ctx; pl.clear();
      if (o.axes || o.grid) pl.grid({ step: o.step || 1, minor: false });
      if (o.axes) pl.axes({ step: o.step || 1 });
      var vis = names.filter(function (n) { return hide.indexOf(n) < 0; });
      var cen = [0, 0]; vis.forEach(function (n) { cen[0] += pts[n][0] / vis.length; cen[1] += pts[n][1] / vis.length; });
      var C0 = X(cen), labels = [], grpC = {};
      (o.groups || []).forEach(function (g) { var gc = [0, 0], ns = g.filter(function (n) { return pts[n]; }); ns.forEach(function (n) { gc[0] += pts[n][0] / ns.length; gc[1] += pts[n][1] / ns.length; }); var gp = X(gc); ns.forEach(function (n) { grpC[n] = gp; }); });
      function cOf(a, b) { return grpC[a] && (b === undefined || grpC[b] === grpC[a]) ? grpC[a] : C0; }
      function sty(q, def) { return { col: colOf(k, q.color, def), w: q.w || 2.5, dash: q.dash ? [7, 5] : [] }; }
      (o.polys || []).forEach(function (pp) {
        var q = typeof pp[pp.length - 1] === 'object' && !Array.isArray(pp[pp.length - 1]) ? pp[pp.length - 1] : {}, ns = pp.filter(function (x) { return typeof x === 'string' || Array.isArray(x); });
        var fillC = q.fill ? (k[q.fill + 'Soft'] || q.fill) : k.blueSoft;
        ctx.save(); ctx.beginPath(); ns.forEach(function (n, i) { var p = X(P(n)); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath();
        if (q.fill !== false) { ctx.fillStyle = fillC; ctx.fill(); }
        var s = sty(q, k.ink); ctx.strokeStyle = s.col; ctx.lineWidth = s.w; ctx.lineJoin = 'round'; ctx.setLineDash(s.dash); ctx.stroke(); ctx.restore();
      });
      (o.circles || []).forEach(function (cc) {
        var q = cc[2] || {}, C = P(cc[0]), r = rOf(cc), p = X(C), s = sty(q, k.ink);
        ctx.save(); ctx.beginPath(); ctx.arc(p[0], p[1], r * pl.unit, 0, TAU);
        if (q.fill) { ctx.fillStyle = k[q.fill + 'Soft'] || q.fill; ctx.fill(); }
        ctx.strokeStyle = s.col; ctx.lineWidth = q.w || 2.2; ctx.setLineDash(s.dash); ctx.stroke(); ctx.restore();
      });
      function far(a, b, both) { var A = P(a), B = P(b), dx = B[0] - A[0], dy = B[1] - A[1], L = hyp(dx, dy) || 1, F = (xmax - xmin + ymax - ymin) * 3; return [both ? [A[0] - dx / L * F, A[1] - dy / L * F] : A, [A[0] + dx / L * F, A[1] + dy / L * F]]; }
      (o.lines || []).forEach(function (ln) { var q = ln[2] || {}, e = far(ln[0], ln[1], true), s = sty(q, k.ink), a = X(e[0]), b = X(e[1]); line(ctx, a[0], a[1], b[0], b[1], s.col, q.w || 2, s.dash); deco(ln, q); });
      (o.rays || []).forEach(function (ln) {
        var q = ln[2] || {}, e = far(ln[0], ln[1], false), s = sty(q, k.ink), a = X(e[0]), b = X(e[1]); line(ctx, a[0], a[1], b[0], b[1], s.col, q.w || 2, s.dash); deco(ln, q);
      });
      (o.segs || []).forEach(function (sg) { var q = sg[2] || {}, s = sty(q, k.ink), a = X(P(sg[0])), b = X(P(sg[1])); line(ctx, a[0], a[1], b[0], b[1], s.col, s.w, s.dash); deco(sg, q); });
      function deco(sg, q) { // ticks, parallel arrows and a side label at the middle of A→B
        var a = X(P(sg[0])), b = X(P(sg[1])), dx = b[0] - a[0], dy = b[1] - a[1], L = hyp(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        var col = colOf(k, q.color, k.ink), i;
        if (q.tick) for (i = 0; i < q.tick; i++) { var off = (i - (q.tick - 1) / 2) * 5; line(ctx, m[0] + ux * off - nx * 6, m[1] + uy * off - ny * 6, m[0] + ux * off + nx * 6, m[1] + uy * off + ny * 6, col, 2); }
        if (q.arrow) for (i = 0; i < q.arrow; i++) {
          var o2 = (i - (q.arrow - 1) / 2) * 7 + (q.tick ? 14 : 0), tip = [m[0] + ux * (o2 + 4), m[1] + uy * (o2 + 4)];
          ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(tip[0] - ux * 7 + nx * 5, tip[1] - uy * 7 + ny * 5); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(tip[0] - ux * 7 - nx * 5, tip[1] - uy * 7 - ny * 5); ctx.stroke(); ctx.restore();
        }
        if (q.lab != null && q.lab !== '') {
          var CC = typeof sg[0] === 'string' && typeof sg[1] === 'string' ? cOf(sg[0], sg[1]) : C0;
          var sd = q.side ? -q.side : ((m[0] - CC[0]) * nx + (m[1] - CC[1]) * ny >= 0 ? 1 : -1);
          if (!q.side && hyp(m[0] - CC[0], m[1] - CC[1]) < 4) sd = ny <= 0 ? 1 : -1;
          var tw = textW(ctx, String(q.lab), { size: 14 }), dd = 11 + M.abs(nx) * tw / 2 + M.abs(ny) * 6;
          labels.push([String(q.lab), m[0] + nx * sd * dd, m[1] + ny * sd * dd, colOf(k, q.lcolor || q.color, k.ink), false]);
        }
      }
      (o.arcs || []).forEach(function (ar) {
        var q = ar[3] || {}, C = P(ar[0]), A = P(ar[1]), B = P(ar[2]), r = hyp(A[0] - C[0], A[1] - C[1]), p = X(C);
        var t0 = M.atan2(A[1] - C[1], A[0] - C[0]), t1 = M.atan2(B[1] - C[1], B[0] - C[0]), sw = t1 - t0; while (sw <= 0) sw += TAU;
        parc(ctx, p[0], p[1], r * pl.unit, -t0, -sw, colOf(k, q.color, k.red), q.w || 4.5);
        if (q.lab) { var tm = t0 + sw / 2, tw2 = textW(ctx, q.lab, { size: 14 }); labels.push([q.lab, p[0] + M.cos(tm) * (r * pl.unit + 12 + tw2 * 0.45 * M.abs(M.cos(tm))), p[1] - M.sin(tm) * (r * pl.unit + 14), colOf(k, q.color, k.red), false]); }
      });
      (o.angs || []).forEach(function (an) {
        var q = an[3] || {}, v = X(P(an[1])), L = angMark(ctx, v, X(P(an[0])), X(P(an[2])), q, k);
        if (q.lab) { var tw3 = textW(ctx, q.lab, { size: 13 }); labels.push([q.lab, L[0] + M.cos(L[2]) * tw3 * 0.35, L[1] + M.sin(L[2]) * 4, colOf(k, q.color, k.red), false, 13]); }
      });
      // points and their names
      vis.forEach(function (n) {
        var p = X(pts[n]);
        if (o.dots !== false) dot(ctx, p[0], p[1], 3.6, k.ink);
        if (nolab.indexOf(n) >= 0) return;
        var dir = labpos[n], DIRS = { n: [0, -1], ne: [0.75, -0.75], e: [1, 0], se: [0.75, 0.75], s: [0, 1], sw: [-0.75, 0.75], w: [-1, 0], nw: [-0.75, -0.75] }, u;
        if (dir && DIRS[dir]) u = DIRS[dir];
        else { var CC = cOf(n), dx = p[0] - CC[0], dy = p[1] - CC[1], L = hyp(dx, dy); u = L < 3 ? [0.7, -0.7] : [dx / L, dy / L]; }
        var s = n + (o.coords ? ' (' + f1(pts[n][0], 2) + ', ' + f1(pts[n][1], 2) + ')' : ''), tw = textW(ctx, s, { size: 15, it: true });
        labels.push([s, p[0] + u[0] * (11 + tw / 2), p[1] + u[1] * 13, k.ink, true, 15]);
      });
      (o.texts || []).forEach(function (t) { var q = t[3] || {}, p = X([t[0], t[1]]); labels.push([String(t[2]), p[0], p[1], colOf(k, q.color, k.ink), !!q.it, q.size || 14]); });
      labels.forEach(function (L) { text(ctx, L[0], clamp(L[1], 4 + textW(ctx, L[0], { size: L[5] || 14 }) / 2, c.w - 4 - textW(ctx, L[0], { size: L[5] || 14 }) / 2), clamp(L[2], 9, c.h - 9), { col: L[3], it: L[4], size: L[5] || 14, wt: L[4] ? 600 : 650, halo: k.bg }); });
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: function () { draw(); } };
  }

  /* ================================================================ geo-construct */
  var R3 = M.sqrt(3);
  function constructions(kind, wrong) {
    // each: {win, given: [els], steps: [{cap, add: [els], tmp: [els]}], done: text}
    // elements: {t: 'pt', p, n} {t: 'seg'|'line'|'ray', a, b} {t: 'arc', c, r, a0, a1 (degrees)} {t: 'circ', c, r} {t: 'poly', p: []} {t: 'ang', v, a, b, lab}
    function arcAround(cn, r, target, half) { var t = deg(M.atan2(target[1] - cn[1], target[0] - cn[0])); return { t: 'arc', c: cn, r: r, a0: t - half, a1: t + half }; }
    function at(cn, r, d) { return [cn[0] + r * M.cos(rad(d)), cn[1] + r * M.sin(rad(d))]; }
    var K = {};
    K['copy-segment'] = function () {
      var A = [1, 5.4], B = [4.8, 6.3], C = [1.2, 2.2], L = hyp(B[0] - A[0], B[1] - A[1]), Dp = [C[0] + L, C[1]];
      return { win: [0, 10, 0.6, 7.2], given: [{ t: 'seg', a: A, b: B }, { t: 'pt', p: A, n: 'A' }, { t: 'pt', p: B, n: 'B' }, { t: 'ray', a: C, b: [9.6, C[1]] }, { t: 'pt', p: C, n: 'C' }],
        start: 'Copy segment AB onto the ray that starts at C.',
        steps: [
          { cap: 'Put the compass point on A and open the pencil to B. The compass now holds the length AB.', tmp: [{ t: 'seg', a: A, b: B, dash: 1 }], add: [arcAround(A, L, B, 14)] },
          { cap: 'Keep that width. Move the compass point to C and swing an arc across the ray.', add: [arcAround(C, L, Dp, 22)] },
          { cap: 'Mark D where the arc crosses the ray. CD = AB, because both equal the same compass width.', add: [{ t: 'pt', p: Dp, n: 'D' }, { t: 'seg', a: C, b: Dp, w: 4 }] }
        ] };
    };
    K['copy-angle'] = function () {
      var A = [0.8, 1.2], B = [4.6, 1.2], th = 42, Cc = at(A, 4.2, th), D0 = [5.4, 1.2], E = [9.6, 1.2], r = 2.2;
      var Pp = [A[0] + r, A[1]], Q = at(A, r, th), Rr = [D0[0] + r, D0[1]], S = at(D0, r, th), pq = hyp(Q[0] - Pp[0], Q[1] - Pp[1]);
      return { win: [0, 10, 0.2, 5.4], given: [{ t: 'ray', a: A, b: B }, { t: 'ray', a: A, b: Cc }, { t: 'pt', p: A, n: 'A' }, { t: 'ray', a: D0, b: E }, { t: 'pt', p: D0, n: 'D' }],
        start: 'Copy the angle at A so that it opens from the ray at D.',
        steps: [
          { cap: 'With the compass point on A, draw an arc that crosses both sides of the angle. Call the crossings P and Q.', add: [{ t: 'arc', c: A, r: r, a0: -8, a1: th + 10 }, { t: 'pt', p: Pp, n: 'P' }, { t: 'pt', p: Q, n: 'Q' }] },
          { cap: 'Do not change the width. Put the compass point on D and draw the same arc, crossing the ray at R.', add: [{ t: 'arc', c: D0, r: r, a0: -8, a1: th + 22 }, { t: 'pt', p: Rr, n: 'R' }] },
          { cap: 'Now set the compass to the distance from P to Q.', tmp: [{ t: 'seg', a: Pp, b: Q, dash: 1 }], add: [arcAround(Pp, pq, Q, 12)] },
          { cap: 'With that width, put the compass point on R and draw an arc that crosses the first arc at S.', add: [arcAround(Rr, pq, S, 16), { t: 'pt', p: S, n: 'S' }] },
          { cap: 'Draw the ray from D through S. The new angle at D matches the angle at A: triangles APQ and DRS are congruent by SSS.', add: [{ t: 'ray', a: D0, b: S, w: 3.5 }, { t: 'seg', a: Pp, b: Q, dash: 1, soft: 1 }, { t: 'seg', a: Rr, b: S, dash: 1, soft: 1 }] }
        ] };
    };
    K['bisect-angle'] = function () {
      var A = [1.2, 1.2], th = 64, B = [9.6, 1.2], Cc = at(A, 6.8, th), r = 3.2, Pp = [A[0] + r, A[1]], Q = at(A, r, th), rho = 2.7, rho2 = wrong ? 2.05 : rho;
      var Xs = circInt(Pp, rho, Q, rho2), Xp = Xs[0][0] + Xs[0][1] > Xs[1][0] + Xs[1][1] ? Xs[0] : Xs[1];
      var steps = [
        { cap: 'With the compass point on A, draw an arc that crosses both sides of the angle at P and Q.', add: [{ t: 'arc', c: A, r: r, a0: -8, a1: th + 8 }, { t: 'pt', p: Pp, n: 'P' }, { t: 'pt', p: Q, n: 'Q' }] },
        { cap: 'Open the compass a bit more than half of the way from P to Q. With the point on P, draw an arc inside the angle.', add: [arcAround(Pp, rho, Xp, 26)] },
        { cap: wrong ? 'Here the width changed before this arc (the mistake). With the point on Q, draw an arc that crosses the last one at X.' : 'Keep the same width. With the point on Q, draw an arc that crosses the last one at X.', add: [arcAround(Q, rho2, Xp, 26), { t: 'pt', p: Xp, n: 'X' }] },
        wrong ? { cap: 'Draw ray AX. The two angles are not equal, because PX ≠ QX: the triangles APX and AQX are no longer congruent.', add: [{ t: 'ray', a: A, b: Xp, w: 3.5 }, { t: 'ang', v: A, a: Pp, b: Xp, lab: 1, r: 52 }, { t: 'ang', v: A, a: Xp, b: Q, lab: 1, r: 66 }] }
          : { cap: 'Draw ray AX. It splits the angle into two equal angles: triangles APX and AQX are congruent by SSS (AP = AQ, PX = QX, AX is shared).', add: [{ t: 'ray', a: A, b: Xp, w: 3.5 }, { t: 'seg', a: Pp, b: Xp, dash: 1, soft: 1 }, { t: 'seg', a: Q, b: Xp, dash: 1, soft: 1 }, { t: 'ang', v: A, a: Pp, b: Xp, lab: 1, r: 52 }, { t: 'ang', v: A, a: Xp, b: Q, lab: 1, r: 66 }] }
      ];
      return { win: [0, 10, 0.4, 7.6], given: [{ t: 'ray', a: A, b: B }, { t: 'ray', a: A, b: Cc }, { t: 'pt', p: A, n: 'A' }], start: 'Bisect the angle at A: split it into two equal angles.', steps: steps };
    };
    K['perp-bisector'] = function () {
      var A = [2, 3.4], B = [8, 3.4], r1 = 3.9, r2 = wrong ? 3.1 : r1, I = circInt(A, r1, B, r2), Xp = I[0][1] > I[1][1] ? I[0] : I[1], Y = I[0][1] > I[1][1] ? I[1] : I[0], Mp = [Xp[0], A[1]];
      var tA = deg(M.atan2(Xp[1] - A[1], Xp[0] - A[0])), tB = deg(M.atan2(Xp[1] - B[1], Xp[0] - B[0]));
      return { win: [0.6, 9.4, 0, 6.8], given: [{ t: 'seg', a: A, b: B }, { t: 'pt', p: A, n: 'A' }, { t: 'pt', p: B, n: 'B' }], start: 'Construct the perpendicular bisector of AB.',
        steps: [
          { cap: 'Open the compass to more than half of AB. With the point on A, draw arcs above and below the segment.', add: [{ t: 'arc', c: A, r: r1, a0: tA - 20, a1: tA + 20 }, { t: 'arc', c: A, r: r1, a0: -tA - 20, a1: -tA + 20 }] },
          { cap: wrong ? 'Here the width changed (the mistake). With the point on B, draw arcs that cross the first ones at X and Y.' : 'Keep the same width. With the point on B, draw arcs that cross the first ones at X and Y.', add: [{ t: 'arc', c: B, r: r2, a0: tB - 20, a1: tB + 20 }, { t: 'arc', c: B, r: r2, a0: -tB - 20, a1: -tB + 20 }, { t: 'pt', p: Xp, n: 'X' }, { t: 'pt', p: Y, n: 'Y' }] },
          wrong ? { cap: 'Line XY is still perpendicular to AB, but it misses the midpoint: AM ≠ MB. X is not the same distance from A and B.', add: [{ t: 'line', a: Xp, b: Y, w: 3.5 }, { t: 'pt', p: Mp, n: 'M' }, { t: 'segmeas', a: A, b: Mp }, { t: 'segmeas', a: Mp, b: B }] }
            : { cap: 'Draw line XY. X and Y are each the same distance from A and from B, so line XY is the perpendicular bisector. It crosses AB at the midpoint M.', add: [{ t: 'line', a: Xp, b: Y, w: 3.5 }, { t: 'pt', p: Mp, n: 'M' }, { t: 'segmeas', a: A, b: Mp }, { t: 'segmeas', a: Mp, b: B }, { t: 'rt', v: Mp, a: B, b: Xp }] }
        ] };
    };
    K['perp-from-point'] = function () {
      var P0 = [5, 5.6], y = 2.4, r = 4.3, dx = M.sqrt(r * r - (P0[1] - y) * (P0[1] - y)), A = [P0[0] - dx, y], B = [P0[0] + dx, y], rho = 3.1, Xp = [5, y - M.sqrt(rho * rho - dx * dx)], F = [5, y];
      return { win: [0.2, 9.8, -0.2, 6.6], given: [{ t: 'line', a: [0, y], b: [10, y] }, { t: 'pt', p: P0, n: 'P' }], start: 'Construct the line through P that is perpendicular to the line below it.',
        steps: [
          { cap: 'With the compass point on P, draw an arc that crosses the line twice, at A and B.', add: [{ t: 'arc', c: P0, r: r, a0: -122, a1: -58 }, { t: 'pt', p: A, n: 'A' }, { t: 'pt', p: B, n: 'B' }] },
          { cap: 'Open the compass to more than half of AB. Draw an arc below the line from A, then, with the same width, from B. They cross at X.', add: [arcAround(A, rho, Xp, 18), arcAround(B, rho, Xp, 18), { t: 'pt', p: Xp, n: 'X' }] },
          { cap: 'Draw line PX. P and X are each equally far from A and B, so PX is the perpendicular bisector of AB, and it is perpendicular to the line.', add: [{ t: 'line', a: P0, b: Xp, w: 3.5 }, { t: 'rt', v: F, a: B, b: P0 }] }
        ] };
    };
    K['perp-at-point'] = function () {
      var y = 2, P0 = [5, y], r = 2.1, A = [P0[0] - r, y], B = [P0[0] + r, y], rho = 3.4, Xp = [5, y + M.sqrt(rho * rho - r * r)];
      return { win: [0.2, 9.8, 0.4, 5.6], given: [{ t: 'line', a: [0, y], b: [10, y] }, { t: 'pt', p: P0, n: 'P' }], start: 'Construct the line perpendicular to this line at the point P on it.',
        steps: [
          { cap: 'With the compass point on P, mark A and B on the line, the same distance from P on each side.', add: [{ t: 'arc', c: P0, r: r, a0: 160, a1: 200 }, { t: 'arc', c: P0, r: r, a0: -20, a1: 20 }, { t: 'pt', p: A, n: 'A' }, { t: 'pt', p: B, n: 'B' }] },
          { cap: 'Open the compass wider. From A and then from B (same width), draw arcs above the line that cross at X.', add: [arcAround(A, rho, Xp, 18), arcAround(B, rho, Xp, 18), { t: 'pt', p: Xp, n: 'X' }] },
          { cap: 'Draw line PX. It is the perpendicular bisector of AB, so it meets the line at a right angle at P.', add: [{ t: 'line', a: P0, b: Xp, w: 3.5 }, { t: 'rt', v: P0, a: B, b: Xp }] }
        ] };
    };
    K['parallel'] = function () {
      var y = 1.4, Q = [2.6, y], P0 = [4.6, 4.9], u = [P0[0] - Q[0], P0[1] - Q[1]], L = hyp(u[0], u[1]); u = [u[0] / L, u[1] / L];
      var r = 1.5, Rr = [Q[0] + r, y], S = [Q[0] + u[0] * r, Q[1] + u[1] * r], S2 = [P0[0] + u[0] * r, P0[1] + u[1] * r], R2 = [P0[0] + r, P0[1]], rs = hyp(S[0] - Rr[0], S[1] - Rr[1]), th = deg(M.atan2(u[1], u[0]));
      return { win: [0.2, 9.8, 0.2, 7.4], given: [{ t: 'line', a: [0, y], b: [10, y] }, { t: 'pt', p: P0, n: 'P' }], start: 'Construct the line through P that is parallel to the line below it.',
        steps: [
          { cap: 'Draw any line through P that crosses the given line. Call the crossing Q. This line is a transversal.', add: [{ t: 'line', a: Q, b: P0 }, { t: 'pt', p: Q, n: 'Q' }] },
          { cap: 'With the compass point on Q, draw an arc that crosses both lines (at R and S).', add: [{ t: 'arc', c: Q, r: r, a0: -10, a1: th + 12 }, { t: 'pt', p: Rr, n: 'R' }, { t: 'pt', p: S, n: 'S' }] },
          { cap: 'Same width: put the compass point on P and draw the same arc above P, crossing the transversal at T.', add: [{ t: 'arc', c: P0, r: r, a0: -12, a1: th + 12 }, { t: 'pt', p: S2, n: 'T' }] },
          { cap: 'Set the compass to the distance from S to R. With the point on T, mark where it crosses the arc: U.', tmp: [{ t: 'seg', a: S, b: Rr, dash: 1 }], add: [arcAround(S2, rs, R2, 14), { t: 'pt', p: R2, n: 'U' }] },
          { cap: 'Draw line PU. The angle at P copies the angle at Q in the same position (corresponding angles), so the lines are parallel.', add: [{ t: 'line', a: P0, b: R2, w: 3.5 }, { t: 'ang', v: Q, a: Rr, b: S }, { t: 'ang', v: P0, a: R2, b: S2 }] }
        ] };
    };
    K['equilateral'] = function () {
      var A = [3, 1.3], B = [7, 1.3], Cc = [5, 1.3 + 2 * R3];
      return { win: [-1.4, 11.4, -2.9, 6.9], given: [{ t: 'seg', a: A, b: B }, { t: 'pt', p: A, n: 'A' }, { t: 'pt', p: B, n: 'B' }], start: 'Build an equilateral triangle on segment AB.',
        steps: [
          { cap: 'Put the compass point on A and the pencil on B. Draw the circle.', add: [{ t: 'circ', c: A, r: 4 }] },
          { cap: 'Put the compass point on B and the pencil on A. Draw that circle too.', add: [{ t: 'circ', c: B, r: 4 }] },
          { cap: 'Mark C where the circles cross and draw the triangle. AC = AB (radii of the first circle) and BC = BA (radii of the second), so all three sides are equal.', add: [{ t: 'pt', p: Cc, n: 'C' }, { t: 'poly', p: [A, B, Cc] }] }
        ] };
    };
    function ring(n0) { var O = [5, 3.6], r = 2.8, P = []; for (var i = 0; i < 6; i++) P.push(at(O, r, i * 60 + (n0 || 0))); return { O: O, r: r, P: P }; }
    K['hexagon'] = function () {
      var g = ring(0), arcs = g.P.map(function (p, i) { return arcAround(p, g.r, g.P[(i + 1) % 6], 10); });
      return { win: [0.8, 9.2, 0.2, 7], given: [{ t: 'pt', p: g.O, n: 'O' }], start: 'Inscribe a regular hexagon in a circle.',
        steps: [
          { cap: 'Draw a circle with center O. Keep this compass width for the whole construction.', add: [{ t: 'circ', c: g.O, r: g.r }] },
          { cap: 'Mark any point A on the circle. With the compass point on A (same width), mark the next point on the circle.', add: [{ t: 'pt', p: g.P[0], n: 'A' }, arcs[0], { t: 'pt', p: g.P[1], n: 'B' }] },
          { cap: 'Keep stepping around the circle with the same width. Six steps bring you back to A.', add: arcs.slice(1).concat(g.P.slice(2).map(function (p, i) { return { t: 'pt', p: p, n: 'CDEF'[i] }; })) },
          { cap: 'Connect the points in order. Each side equals the radius, and each triangle from O is equilateral, so every central angle is 60°.', add: [{ t: 'poly', p: g.P }, { t: 'seg', a: g.O, b: g.P[0], dash: 1, soft: 1 }, { t: 'seg', a: g.O, b: g.P[1], dash: 1, soft: 1 }] }
        ] };
    };
    K['triangle'] = function () {
      var h = K.hexagon(); h.start = 'Inscribe an equilateral triangle in a circle.';
      h.steps[3] = { cap: 'Connect every other point: A, C and E. Each side skips one 60° step, so the three central angles are 120° each and the triangle is equilateral.', add: [{ t: 'poly', p: [h.steps[1].add[0].p, h.steps[2].add[5].p, h.steps[2].add[7].p] }] };
      return h;
    };
    K['square'] = function () {
      var O = [5, 3.6], r = 2.6, A = [O[0] - r, O[1]], Cc = [O[0] + r, O[1]], rho = 3.6, X1 = [5, O[1] + M.sqrt(rho * rho - r * r)], X2 = [5, O[1] - M.sqrt(rho * rho - r * r)], B = [5, O[1] + r], Dd = [5, O[1] - r];
      return { win: [0.6, 9.4, -0.3, 7.5], given: [{ t: 'pt', p: O, n: 'O' }], start: 'Inscribe a square in a circle.',
        steps: [
          { cap: 'Draw a circle with center O and a diameter AC through O.', add: [{ t: 'circ', c: O, r: r }, { t: 'seg', a: A, b: Cc }, { t: 'pt', p: A, n: 'A' }, { t: 'pt', p: Cc, n: 'C' }] },
          { cap: 'Construct the perpendicular bisector of AC: arcs from A and from C (same width, wider than the radius) cross above and below.', add: [arcAround(A, rho, X1, 14), arcAround(Cc, rho, X1, 14), arcAround(A, rho, X2, 14), arcAround(Cc, rho, X2, 14)] },
          { cap: 'The line through the crossings passes through O and is perpendicular to AC. It meets the circle at B and D.', add: [{ t: 'line', a: X1, b: X2 }, { t: 'pt', p: B, n: 'B' }, { t: 'pt', p: Dd, n: 'D' }, { t: 'rt', v: O, a: Cc, b: B }] },
          { cap: 'Connect A, B, C and D. The diagonals are equal (both diameters), bisect each other and are perpendicular, so ABCD is a square.', add: [{ t: 'poly', p: [A, B, Cc, Dd] }] }
        ] };
    };
    var out = (K[kind] || K['bisect-angle'])(), LD = {"copy-segment": {"A": "w", "B": "ne", "C": "w", "D": "se"}, "copy-angle": {"A": "sw", "P": "s", "Q": "nw", "D": "s", "R": "s", "S": "nw"}, "bisect-angle": {"A": "sw", "P": "s", "Q": "nw", "X": "ne"}, "perp-bisector": {"A": "w", "B": "e", "X": "e", "Y": "e", "M": "se"}, "perp-from-point": {"P": "e", "A": "nw", "B": "ne", "X": "e"}, "perp-at-point": {"P": "se", "A": "n", "B": "n", "X": "e"}, "parallel": {"P": "nw", "Q": "nw", "R": "s", "S": "nw", "T": "nw", "U": "se"}, "square": {"A": "w", "C": "e", "B": "ne", "D": "se", "O": "sw"}, "equilateral": {"A": "w", "B": "e", "C": "n"}}[kind] || {};
    function mark(list) { (list || []).forEach(function (e) { if (e.t === 'pt' && LD[e.n]) e.ld = LD[e.n]; }); }
    mark(out.given); out.steps.forEach(function (st) { mark(st.add); mark(st.tmp); });
    return out;
  }
  function construct(elm, o, V) {
    var st = host(elm, o, 'geo-construct', 'A compass and straightedge construction, one step at a time');
    var C = constructions(o.kind || 'bisect-angle', !!o.wrong), n = C.steps.length;
    var cur = o.step === 'last' ? n : clamp(+o.step || 0, 0, n), anim = 1;
    var c = V.canvas(st, { aspect: (C.win[1] - C.win[0]) / (C.win[3] - C.win[2]), max: 330, min: 200 });
    c.cv.classList.add('geo-cv'); c.cv.setAttribute('role', 'img');
    var pl = V.plane(c, { xmin: C.win[0], xmax: C.win[1], ymin: C.win[2], ymax: C.win[3], equal: true, pad: 8 });
    var cap = el('p', 'geo-cap'); cap.setAttribute('aria-live', 'polite'); elm.appendChild(cap);
    var row = el('div', 'geo-row'); elm.appendChild(row);
    var bBack = V.button(row, '◀ Back', function () { go(cur - 1); }), bNext = V.button(row, 'Next step ▶', function () { go(cur + 1); }, 'pri'), bAgain = V.button(row, 'Start over', function () { go(0); });
    bBack.setAttribute('aria-label', 'Back one step'); bNext.setAttribute('aria-label', 'Next step');
    function X(p) { return [pl.X(p[0]), pl.Y(p[1])]; }
    function drawEl(e, k, ctx, mode, frac) { // mode: 'given' | 'old' | 'new'
      var col = mode === 'given' ? k.ink : mode === 'old' ? (e.t === 'arc' || e.t === 'circ' ? k.muted : k.blue) : k.red;
      if (e.soft) col = k.muted;
      var w = e.w || (mode === 'new' ? 3 : 2.2), dash = e.dash ? [6, 5] : [];
      if (e.t === 'pt') { var p = X(e.p); dot(ctx, p[0], p[1], mode === 'new' ? 5 : 4, mode === 'given' ? k.ink : col); return; }
      if (e.t === 'seg') { var a = X(e.a), b = X(e.b); if (frac < 1) b = [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac]; line(ctx, a[0], a[1], b[0], b[1], col, w, dash); return; }
      if (e.t === 'line' || e.t === 'ray') { var A = e.a, B = e.b, dx = B[0] - A[0], dy = B[1] - A[1], L = hyp(dx, dy), F = 40 * frac; var p1 = e.t === 'line' ? X([A[0] - dx / L * F, A[1] - dy / L * F]) : X(A), p2 = X([A[0] + dx / L * F, A[1] + dy / L * F]); line(ctx, p1[0], p1[1], p2[0], p2[1], col, w, dash); return; }
      if (e.t === 'arc' || e.t === 'circ') { var cp = X(e.c), a0 = e.t === 'circ' ? 0 : e.a0, a1 = e.t === 'circ' ? 360 : e.a1; parc(ctx, cp[0], cp[1], e.r * pl.unit, -rad(a0), -rad((a1 - a0) * frac), col, w, dash); if (mode === 'new' && frac < 1) { var tip = rad(a0 + (a1 - a0) * frac); line(ctx, cp[0], cp[1], cp[0] + M.cos(tip) * e.r * pl.unit, cp[1] - M.sin(tip) * e.r * pl.unit, k.gold, 1.5, [4, 4]); dot(ctx, cp[0], cp[1], 4, k.gold); } return; }
      if (e.t === 'poly') { ctx.save(); ctx.beginPath(); e.p.forEach(function (q, i) { var s = X(q); if (i) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]); }); ctx.closePath(); ctx.fillStyle = k.greenSoft; if (frac >= 1) ctx.fill(); ctx.strokeStyle = mode === 'new' ? k.green : col; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); return; }
      if (e.t === 'ang' || e.t === 'rt') { var v = X(e.v), L2 = angMark(ctx, v, X(e.a), X(e.b), { r: e.r || 26, right: e.t === 'rt', color: 'gold', fill: e.t === 'ang' }, k); if (e.lab) { var d = M.abs(deg(M.atan2(e.a[1] - e.v[1], e.a[0] - e.v[0]) - M.atan2(e.b[1] - e.v[1], e.b[0] - e.v[0]))); if (d > 180) d = 360 - d; text(ctx, f1(d, 1) + '°', L2[0] + M.cos(L2[2]) * 10, L2[1], { col: k.gold, size: 13, wt: 700, halo: k.bg }); } return; }
      if (e.t === 'segmeas') { var m1 = X(e.a), m2 = X(e.b), L3 = hyp(e.b[0] - e.a[0], e.b[1] - e.a[1]); text(ctx, f1(L3, 2), (m1[0] + m2[0]) / 2, (m1[1] + m2[1]) / 2 + 14, { col: k.gold, size: 13, wt: 700, halo: k.bg }); }
    }
    function labelsOf(list) { return list.filter(function (e) { return e.t === 'pt' && e.n; }); }
    function draw() {
      var k = V.colors(), ctx = c.ctx; pl.clear();
      var all = [];
      C.given.forEach(function (e) { all.push([e, 'given', 1]); });
      for (var i = 0; i < cur; i++) {
        var s = C.steps[i], mode = i === cur - 1 ? 'new' : 'old';
        if (mode === 'new' && s.tmp) s.tmp.forEach(function (e) { all.push([e, 'new', 1]); });
        s.add.forEach(function (e) { all.push([e, mode, mode === 'new' ? anim : 1]); });
      }
      all.filter(function (x) { return x[0].t === 'poly'; }).forEach(function (x) { drawEl(x[0], k, ctx, x[1], x[2]); });
      all.filter(function (x) { return x[0].t !== 'poly' && x[0].t !== 'pt'; }).forEach(function (x) { drawEl(x[0], k, ctx, x[1], x[2]); });
      all.filter(function (x) { return x[0].t === 'pt'; }).forEach(function (x) { drawEl(x[0], k, ctx, x[1], 1); });
      var cen = [(C.win[0] + C.win[1]) / 2, (C.win[2] + C.win[3]) / 2];
      var DIRS = { n: [0, 1], ne: [0.75, 0.75], e: [1, 0], se: [0.75, -0.75], s: [0, -1], sw: [-0.75, -0.75], w: [-1, 0], nw: [-0.75, 0.75] }, seen = {};
      labelsOf(all.map(function (x) { return x[0]; })).forEach(function (e) {
        if (seen[e.n]) return; seen[e.n] = 1;
        var p = X(e.p), u = e.ld && DIRS[e.ld], dx, dy, L;
        if (u) { dx = u[0]; dy = u[1]; } else { dx = e.p[0] - cen[0]; dy = e.p[1] - cen[1]; L = hyp(dx, dy) || 1; dx /= L; dy /= L; }
        text(ctx, e.n, p[0] + dx * 15, p[1] - dy * 15, { it: true, size: 15, col: k.ink, halo: k.bg });
      });
      var desc = cur === 0 ? C.start : C.steps[cur - 1].cap;
      cap.innerHTML = '<span class="geo-step">' + (cur === 0 ? 'Start.' : 'Step ' + cur + ' of ' + n + '.') + '</span>' + desc;
      c.cv.setAttribute('aria-label', 'Construction picture. ' + desc);
      bBack.disabled = cur === 0; bNext.disabled = cur === n; bNext.textContent = cur === n ? 'Done ✓' : cur === 0 ? 'First step ▶' : 'Next step ▶';
    }
    var raf = 0;
    function go(s) {
      s = clamp(s, 0, n); var fwd = s === cur + 1; cur = s; if (raf) { W.cancelAnimationFrame(raf); raf = 0; }
      if (!fwd || V.reduced) { anim = 1; draw(); return; }
      var t0 = 0; anim = 0; draw();
      raf = W.requestAnimationFrame(function tk(t) { if (!t0) t0 = t; anim = M.min(1, (t - t0) / 650); draw(); raf = anim < 1 ? W.requestAnimationFrame(tk) : 0; });
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  }

  /* ================================================================ geo-circle */
  function circle(elm, o, V) {
    var mode = o.mode || 'inscribed';
    var st = host(elm, o, 'geo-circle', { central: 'A central angle and its arc', inscribed: 'An inscribed angle and the arc it cuts off', semicircle: 'An angle inscribed in a semicircle', cyclic: 'A quadrilateral inscribed in a circle', tangent: 'Two tangent segments from a point outside a circle', sector: 'A sector of a circle, its arc length and its area' }[mode] || 'A circle');
    var sector = mode === 'sector', tang = mode === 'tangent';
    var win = tang ? [-1.35, 3.45, -1.45, 1.45] : [-1.45, 1.45, -1.32, 1.32];
    var c = V.canvas(st, { aspect: tang ? 1.65 : 1.25, max: 360, min: 220 });
    c.cv.classList.add('geo-cv'); c.cv.tabIndex = 0; c.cv.setAttribute('role', 'img');
    var pl = V.plane(c, { xmin: win[0], xmax: win[1], ymin: win[2], ymax: win[3], equal: true, pad: 10 });
    var ro = el('p', 'geo-ro'); ro.setAttribute('aria-live', 'polite'); elm.appendChild(ro);
    var row = el('div', 'geo-row'); elm.appendChild(row);
    var snap = o.snap || 1;
    // the movable things: angles (degrees) of points on the unit circle, or the outside point (tangent)
    var H = [], sel = 0;
    if (mode === 'central') H = [{ n: 'A', a: o.a != null ? o.a : 20 }, { n: 'B', a: o.b != null ? o.b : 110 }];
    else if (mode === 'inscribed') H = [{ n: 'A', a: o.a != null ? o.a : 205 }, { n: 'B', a: o.b != null ? o.b : 335 }, { n: 'P', a: o.p != null ? o.p : 100 }];
    else if (mode === 'semicircle') H = [{ n: 'P', a: o.p != null ? o.p : 60 }];
    else if (mode === 'cyclic') H = (o.pts || [35, 150, 205, 300]).map(function (a, i) { return { n: 'ABCD'[i], a: a }; });
    else if (tang) H = [{ n: 'P', d: o.d || 2.1, a: 0 }];
    var rS = o.r || 6, dS = o.deg != null ? o.deg : 90;
    function U(a) { return [M.cos(rad(a)), M.sin(rad(a))]; }
    function X(p) { return [pl.X(p[0]), pl.Y(p[1])]; }
    function arcBetween(a, b, notIn) { // degrees of arc from a ccw to b, or the other one if it contains notIn
      var ccw = norm360(b - a); if (notIn == null) return { from: a, sw: ccw };
      var inside = norm360(notIn - a) < ccw; return inside ? { from: b, sw: 360 - ccw } : { from: a, sw: ccw };
    }
    function angAt(P, A, B) { var u = [A[0] - P[0], A[1] - P[1]], w = [B[0] - P[0], B[1] - P[1]]; return deg(M.abs(M.atan2(u[0] * w[1] - u[1] * w[0], u[0] * w[0] + u[1] * w[1]))); }
    function draw() {
      var k = V.colors(), ctx = c.ctx; pl.clear();
      var O = X([0, 0]), R = pl.unit, msg = '';
      if (sector) {
        var sw = rad(dS);
        ctx.save(); ctx.beginPath(); ctx.moveTo(O[0], O[1]); ctx.arc(O[0], O[1], R, 0, -sw, true); ctx.closePath(); ctx.fillStyle = k.blueSoft; ctx.fill(); ctx.restore();
        parc(ctx, O[0], O[1], R, 0, TAU, k.ink, 2);
        parc(ctx, O[0], O[1], R, 0, -sw, k.red, 5);
        line(ctx, O[0], O[1], O[0] + R, O[1], k.ink, 2); line(ctx, O[0], O[1], O[0] + R * M.cos(sw), O[1] - R * M.sin(sw), k.ink, 2);
        if (dS > 0 && dS < 360) angMark(ctx, O, [O[0] + 10, O[1]], [O[0] + M.cos(sw) * 10, O[1] - M.sin(sw) * 10], { r: 20, color: 'gold' }, k);
        text(ctx, 'r = ' + f1(rS), O[0] + R / 2, O[1] + 14, { col: k.ink, size: 13, halo: k.bg });
        dot(ctx, O[0], O[1], 3.5, k.ink);
        var frac = dS / 360, arcL = frac * 2 * PI * rS, area = frac * PI * rS * rS, g = gcd(dS, 360);
        msg = 'The sector is <b>' + dS + '/360' + (g > 1 && dS ? ' = ' + (dS / g) + '/' + (360 / g) : '') + '</b> of the circle. ' +
          '<span style="color:' + k.red + '">Arc length</span> = ' + (dS / g) + '/' + (360 / g) + ' · 2π · ' + f1(rS) + ' ≈ <b>' + f1(arcL, 2) + '</b> (a length). ' +
          '<span style="color:' + k.blue + '">Sector area</span> = ' + (dS / g) + '/' + (360 / g) + ' · π · ' + f1(rS) + '² ≈ <b>' + f1(area, 2) + '</b> (square units). ' +
          'In radians the angle is arc ÷ radius = ' + f1(arcL, 2) + ' ÷ ' + f1(rS) + ' ≈ <b>' + f1(rad(dS), 3) + '</b>.';
        if (o.nums === false) msg = 'The sector is <b>' + dS + '/360' + (g > 1 && dS ? ' = ' + (dS / g) + '/' + (360 / g) : '') + '</b> of the circle, so its <span style="color:' + k.red + '">arc</span> is that fraction of the circumference and its <span style="color:' + k.blue + '">area</span> is that fraction of the circle\'s area.';
      } else if (tang) {
        var d = H[0].d, Pp = [d, 0], t = M.acos(1 / d), A = U(deg(t)), B = U(-deg(t)), r6 = rS;
        parc(ctx, O[0], O[1], R, 0, TAU, k.ink, 2.2);
        line(ctx, O[0], O[1], X(Pp)[0], X(Pp)[1], k.muted, 1.5, [6, 5]);
        [A, B].forEach(function (T) { var tp = X(T); line(ctx, O[0], O[1], tp[0], tp[1], k.blue, 2.4); var e = X([T[0] + (T[0] - Pp[0]) * 0.35, T[1] + (T[1] - Pp[1]) * 0.35]), pp = X(Pp); line(ctx, e[0], e[1], pp[0], pp[1], k.red, 2.8); angMark(ctx, tp, O, pp, { right: true, color: 'gold' }, k); });
        dot(ctx, O[0], O[1], 3.5, k.ink); [A, B].forEach(function (T) { var tp = X(T); dot(ctx, tp[0], tp[1], 4, k.ink); });
        var pp2 = X(Pp); dot(ctx, pp2[0], pp2[1], 7.5, k.red, k.bg);
        text(ctx, 'O', O[0] - 12, O[1] + 4, { it: true, col: k.ink, halo: k.bg, size: 15 });
        text(ctx, 'A', X(A)[0] - 4, X(A)[1] - 14, { it: true, col: k.ink, halo: k.bg, size: 15 }); text(ctx, 'B', X(B)[0] - 4, X(B)[1] + 15, { it: true, col: k.ink, halo: k.bg, size: 15 });
        text(ctx, 'P', pp2[0] + 14, pp2[1] - 10, { it: true, col: k.ink, halo: k.bg, size: 15 });
        var tl = M.sqrt(d * d - 1) * r6;
        msg = 'Radius OA = OB = <b>' + f1(r6) + '</b>, OP = <b>' + f1(d * r6, 2) + '</b>. Each tangent meets its radius at 90°, so PA = PB = √(' + f1(d * r6, 2) + '² − ' + f1(r6) + '²) ≈ <b>' + f1(tl, 2) + '</b>. The two tangent segments from P are equal.';
      } else {
        parc(ctx, O[0], O[1], R, 0, TAU, k.ink, 2.2); dot(ctx, O[0], O[1], 3.5, k.ink); text(ctx, 'O', O[0] - 12, O[1] + 4, { it: true, col: k.ink, halo: k.bg, size: 15 });
        var pts = H.map(function (h) { return U(h.a); });
        if (mode === 'central') {
          var ar = arcBetween(H[0].a, H[1].a); var a2 = X(pts[0]), b2 = X(pts[1]);
          parc(ctx, O[0], O[1], R, -rad(ar.from), -rad(ar.sw), k.red, 5);
          line(ctx, O[0], O[1], a2[0], a2[1], k.blue, 2.6); line(ctx, O[0], O[1], b2[0], b2[1], k.blue, 2.6);
          ctx.save(); ctx.beginPath(); ctx.moveTo(O[0], O[1]); ctx.arc(O[0], O[1], 30, -rad(ar.from), -rad(ar.from + ar.sw), true); ctx.closePath(); ctx.fillStyle = k.goldSoft; ctx.fill(); ctx.restore();
          var mid = rad(ar.from + ar.sw / 2); text(ctx, f1(ar.sw, 0) + '°', O[0] + M.cos(mid) * 48, O[1] - M.sin(mid) * 48, { col: k.gold, wt: 700, halo: k.bg, size: 14 });
          text(ctx, f1(ar.sw, 0) + '° arc', O[0] + M.cos(mid) * (R + 30), O[1] - M.sin(mid) * (R + 20), { col: k.red, wt: 700, halo: k.bg, size: 14 });
          [['A', pts[0]], ['B', pts[1]]].forEach(function (q) { var p = X(q[1]); text(ctx, q[0], p[0] + q[1][0] * 18, p[1] - q[1][1] * 18, { it: true, col: k.ink, halo: k.bg, size: 15 }); });
          msg = 'Central angle ∠AOB = <b>' + f1(ar.sw, 0) + '°</b>, so the arc from A to B (red) measures <b>' + f1(ar.sw, 0) + '°</b>. The rest of the circle is 360° − ' + f1(ar.sw, 0) + '° = <b>' + f1(360 - ar.sw, 0) + '°</b>.';
        } else if (mode === 'inscribed' || mode === 'semicircle') {
          var Aa = mode === 'semicircle' ? 180 : H[0].a, Bb = mode === 'semicircle' ? 0 : H[1].a, Pa = mode === 'semicircle' ? H[0].a : H[2].a;
          var A3 = U(Aa), B3 = U(Bb), P3 = U(Pa), arc3 = arcBetween(Aa, Bb, Pa), ang = angAt(P3, A3, B3);
          parc(ctx, O[0], O[1], R, -rad(arc3.from), -rad(arc3.sw), k.red, 5);
          if (mode === 'semicircle') line(ctx, X(A3)[0], X(A3)[1], X(B3)[0], X(B3)[1], k.muted, 2);
          if (o.central && mode === 'inscribed' && arc3.sw < 180) { line(ctx, O[0], O[1], X(A3)[0], X(A3)[1], k.blue, 2, [6, 4]); line(ctx, O[0], O[1], X(B3)[0], X(B3)[1], k.blue, 2, [6, 4]); var mc = rad(arc3.from + arc3.sw / 2); text(ctx, f1(arc3.sw, 0) + '°', O[0] + M.cos(mc) * 34, O[1] - M.sin(mc) * 34, { col: k.blue, wt: 700, halo: k.bg, size: 13 }); }
          line(ctx, X(P3)[0], X(P3)[1], X(A3)[0], X(A3)[1], k.green, 2.8); line(ctx, X(P3)[0], X(P3)[1], X(B3)[0], X(B3)[1], k.green, 2.8);
          var L = angMark(ctx, X(P3), X(A3), X(B3), { r: 26, color: 'gold', fill: 1, right: M.abs(ang - 90) < 0.5 }, k);
          text(ctx, f1(ang, 0) + '°', L[0], L[1], { col: k.gold, wt: 700, halo: k.bg, size: 14 });
          var mid3 = rad(arc3.from + arc3.sw / 2); text(ctx, f1(arc3.sw, 0) + '°', O[0] + M.cos(mid3) * (R + 22), O[1] - M.sin(mid3) * (R + 18), { col: k.red, wt: 700, halo: k.bg, size: 14 });
          [['A', A3], ['B', B3], ['P', P3]].forEach(function (q) { var p = X(q[1]); text(ctx, q[0], p[0] + q[1][0] * 16, p[1] - q[1][1] * 16, { it: true, col: k.ink, halo: k.bg, size: 15 }); });
          msg = mode === 'semicircle' ? 'AB is a diameter, so the arc ∠APB cuts off is a semicircle, <b>180°</b>. Half of 180° is <b>90°</b>: ∠APB = <b>' + f1(ang, 0) + '°</b> wherever P is.'
            : 'Inscribed angle ∠APB = <b>' + f1(ang, 0) + '°</b>. It cuts off the red arc, <b>' + f1(arc3.sw, 0) + '°</b>, and ' + f1(ang, 0) + '° is half of ' + f1(arc3.sw, 0) + '°. Slide P: as long as it stays off the red arc, the angle stays the same.';
        } else if (mode === 'cyclic') {
          var Q = pts.map(X);
          ctx.save(); ctx.beginPath(); Q.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = k.greenSoft; ctx.fill(); ctx.strokeStyle = k.green; ctx.lineWidth = 2.6; ctx.stroke(); ctx.restore();
          var angs = pts.map(function (p, i) { return angAt(p, pts[(i + 3) % 4], pts[(i + 1) % 4]); }), cols = ['red', 'blue', 'red', 'blue'];
          Q.forEach(function (p, i) { var L4 = angMark(ctx, p, Q[(i + 3) % 4], Q[(i + 1) % 4], { r: 20, color: cols[i], fill: 1 }, k); text(ctx, f1(angs[i], 0) + '°', L4[0], L4[1], { col: k[cols[i]], wt: 700, size: 13, halo: k.bg }); var u = pts[i]; text(ctx, H[i].n, p[0] + u[0] * 16, p[1] - u[1] * 16, { it: true, col: k.ink, halo: k.bg, size: 15 }); });
          msg = '∠A + ∠C = ' + f1(angs[0], 0) + '° + ' + f1(angs[2], 0) + '° = <b>' + f1(angs[0] + angs[2], 0) + '°</b> and ∠B + ∠D = ' + f1(angs[1], 0) + '° + ' + f1(angs[3], 0) + '° = <b>' + f1(angs[1] + angs[3], 0) + '°</b>. Opposite angles cut off arcs that make the whole circle, so they add to 180°.';
        }
        H.forEach(function (h, i) { var p = X(U(h.a)); dot(ctx, p[0], p[1], i === sel ? 9 : 7.5, k.red, k.bg); if (i === sel && D.activeElement === c.cv) parc(ctx, p[0], p[1], 13, 0, TAU, k.gold, 2); });
      }
      ro.innerHTML = msg; c.cv.setAttribute('aria-label', ro.textContent);
    }
    function gcd(a, b) { a = M.abs(M.round(a)); b = M.abs(M.round(b)); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
    function setA(i, a) {
      a = M.round(a / snap) * snap; var h = H[i];
      if (tang) { h.d = clamp(M.round(a * 20) / 20, 1.15, 3.2); return; }
      if (mode === 'cyclic') { var lo = H[(i + 3) % 4].a, hi = H[(i + 1) % 4].a, span = norm360(hi - lo), off = norm360(a - lo); if (off < 10 || off > span - 10) return; }
      if (mode === 'inscribed') { for (var j = 0; j < H.length; j++) if (j !== i && M.abs(((a - H[j].a) % 360 + 540) % 360 - 180) < 6) return; }
      if (mode === 'semicircle' && (norm360(a) < 4 || norm360(a) > 356 || M.abs(norm360(a) - 180) < 4)) return;
      if (mode === 'central' && M.abs(((a - H[1 - i].a) % 360 + 540) % 360 - 180) < 4) return;
      h.a = norm360(a);
    }
    if (!sector) {
      V.drag(c.cv, {
        hit: function (x, y) { var best = -1, bd = 26; H.forEach(function (h, i) { var p = tang ? X([h.d, 0]) : X(U(h.a)), dd = hyp(p[0] - x, p[1] - y); if (dd < bd) { bd = dd; best = i; } }); return best < 0 ? null : best; },
        start: function (i) { sel = i; },
        move: function (i, x, y) { var mx = pl.x(x), my = pl.y(y); if (tang) setA(i, hyp(mx, my)); else setA(i, deg(M.atan2(my, mx))); draw(); }
      });
      c.cv.addEventListener('keydown', function (e) {
        var step = e.shiftKey ? 10 : 1, k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowLeft' || k === 'ArrowDown') { var s = k === 'ArrowRight' || k === 'ArrowUp' ? 1 : -1; e.preventDefault(); if (tang) setA(sel, H[sel].d + s * 0.05 * (e.shiftKey ? 4 : 1)); else setA(sel, H[sel].a + s * step * M.max(1, snap)); draw(); }
        else if ((k === 'Enter' || k === 'n' || k === 'N') && H.length > 1) { e.preventDefault(); sel = (sel + 1) % H.length; if (pick) pick.set(sel); draw(); }
      });
      c.cv.addEventListener('focus', draw); c.cv.addEventListener('blur', draw);
      var pick = null;
      if (H.length > 1) pick = V.seg(row, { label: 'Point to move', items: H.map(function (h, i) { return [i, 'Move ' + h.n]; }), value: 0, change: function (v) { sel = +v; draw(); } });
      V.button(row, tang ? '◀ Closer' : '◀ Turn', function () { if (tang) setA(sel, H[sel].d - 0.1); else setA(sel, H[sel].a - 5 * M.max(1, snap)); draw(); });
      V.button(row, tang ? 'Farther ▶' : 'Turn ▶', function () { if (tang) setA(sel, H[sel].d + 0.1); else setA(sel, H[sel].a + 5 * M.max(1, snap)); draw(); });
      var hint = el('p', 'geo-hint', 'Drag the red ' + (H.length > 1 ? 'points' : 'point') + (tang ? '' : ' around the circle') + ', or focus the picture and use the arrow keys' + (H.length > 1 ? ' (Enter picks the next point)' : '') + '.'); elm.appendChild(hint);
    } else {
      V.slider(row, { label: 'Radius r', min: 1, max: M.max(10, rS), step: 0.5, value: rS, fmt: function (v) { return f1(v); }, input: function (v) { rS = v; draw(); } });
      V.slider(row, { label: 'Central angle', min: 0, max: 360, step: 5, value: dS, fmt: function (v) { return v + '°'; }, input: function (v) { dS = v; draw(); } });
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  }

  /* ================================================================ geo-trig */
  function trig(elm, o, V) {
    var st = host(elm, o, 'geo-trig', 'A right triangle with its opposite, adjacent and hypotenuse sides');
    var th = clamp(+o.angle || 35, 5, 85), size = clamp(+o.size || 8, 2, 10), ref = o.ref === 'B' ? 'B' : 'A', show = o.show || ['sin', 'cos', 'tan'];
    var c = V.canvas(st, { aspect: 1.5, max: 340, min: 200 });
    c.cv.classList.add('geo-cv'); c.cv.setAttribute('role', 'img');
    var pl = V.plane(c, { xmin: -0.9, xmax: 11.4, ymin: -1, ymax: 9.6, equal: true, pad: 6 });
    var ro = el('p', 'geo-ro'); ro.setAttribute('aria-live', 'polite'); elm.appendChild(ro);
    var row = el('div', 'geo-row'); elm.appendChild(row);
    function X(p) { return [pl.X(p[0]), pl.Y(p[1])]; }
    function draw() {
      var k = V.colors(), ctx = c.ctx; pl.clear();
      var t = rad(th), adj = size * M.cos(t), opp = size * M.sin(t), sc = 1, bw = 10 * M.cos(t), bh = 10 * M.sin(t);
      pl.set({ xmin: -1.4, xmax: bw + 3.2, ymin: -1.1, ymax: bh + 0.9 });
      var A = [0, 0], Cc = [adj * sc, 0], B = [adj * sc, opp * sc], pA = X(A), pB = X(B), pC = X(Cc);
      ctx.save(); ctx.beginPath(); ctx.moveTo(pA[0], pA[1]); ctx.lineTo(pC[0], pC[1]); ctx.lineTo(pB[0], pB[1]); ctx.closePath(); ctx.fillStyle = k.greenSoft; ctx.fill(); ctx.restore();
      var hypC = k.purple, oppC = k.red, adjC = k.blue;
      var sideAC = ref === 'A' ? adjC : oppC, sideBC = ref === 'A' ? oppC : adjC;
      line(ctx, pA[0], pA[1], pB[0], pB[1], hypC, 4); line(ctx, pA[0], pA[1], pC[0], pC[1], sideAC, 4); line(ctx, pC[0], pC[1], pB[0], pB[1], sideBC, 4);
      angMark(ctx, pC, pA, pB, { right: true, color: 'ink' }, k);
      var LA = angMark(ctx, pA, pC, pB, { r: 30, color: 'gold', fill: ref === 'A' }, k), LB = angMark(ctx, pB, pA, pC, { r: 26, color: 'gold', fill: ref === 'B' }, k);
      text(ctx, f1(th, 0) + '°', LA[0] + 8, LA[1], { col: k.gold, wt: 700, size: 13, halo: k.bg }); text(ctx, f1(90 - th, 0) + '°', LB[0], LB[1] + 4, { col: k.gold, wt: 700, size: 13, halo: k.bg });
      text(ctx, 'A', pA[0] - 10, pA[1] + 10, { it: true, size: 16, col: k.ink, halo: k.bg }); text(ctx, 'B', pB[0] + 10, pB[1] - 8, { it: true, size: 16, col: k.ink, halo: k.bg }); text(ctx, 'C', pC[0] + 12, pC[1] + 10, { it: true, size: 16, col: k.ink, halo: k.bg });
      var nx = -(pB[1] - pA[1]), ny = pB[0] - pA[0], nl = hyp(nx, ny); nx /= nl; ny /= nl;
      var mH = [(pA[0] + pB[0]) / 2 + nx * 18, (pA[1] + pB[1]) / 2 + ny * 18];
      text(ctx, 'hypotenuse ' + f1(size), mH[0] - 20, mH[1] - 4, { col: hypC, wt: 700, size: 13, halo: k.bg, al: 'right' });
      text(ctx, (ref === 'A' ? 'adjacent ' : 'opposite ') + f1(adj), (pA[0] + pC[0]) / 2, pA[1] + 16, { col: sideAC, wt: 700, size: 13, halo: k.bg });
      text(ctx, (ref === 'A' ? 'opposite ' : 'adjacent ') + f1(opp), pC[0] + 8, (pC[1] + pB[1]) / 2, { col: sideBC, wt: 700, size: 13, halo: k.bg, al: 'left' });
      var a = ref === 'A' ? th : 90 - th, O = ref === 'A' ? opp : adj, Ad = ref === 'A' ? adj : opp, parts = [];
      if (show.indexOf('sin') >= 0) parts.push('sin ' + ref + ' = <span style="color:' + oppC + '">opp</span> / <span style="color:' + hypC + '">hyp</span> = ' + f1(O, 2) + ' / ' + f1(size, 2) + ' = <b>' + (O / size).toFixed(3) + '</b>');
      if (show.indexOf('cos') >= 0) parts.push('cos ' + ref + ' = <span style="color:' + adjC + '">adj</span> / <span style="color:' + hypC + '">hyp</span> = ' + f1(Ad, 2) + ' / ' + f1(size, 2) + ' = <b>' + (Ad / size).toFixed(3) + '</b>');
      if (show.indexOf('tan') >= 0) parts.push('tan ' + ref + ' = <span style="color:' + oppC + '">opp</span> / <span style="color:' + adjC + '">adj</span> = ' + f1(O, 2) + ' / ' + f1(Ad, 2) + ' = <b>' + (O / Ad).toFixed(3) + '</b>');
      var msg = 'Looking from angle ' + ref + ' (' + f1(a, 0) + '°): ' + parts.join('; ') + '.';
      if (o.compl) msg += ' The other acute angle is 90° − ' + f1(a, 0) + '° = ' + f1(90 - a, 0) + '°, and sin ' + ref + ' = cos ' + (ref === 'A' ? 'B' : 'A') + ' = <b>' + (O / size).toFixed(3) + '</b>: the same side is opposite one angle and adjacent to the other.';
      else msg += ' Change the size: the ratios stay the same.';
      ro.innerHTML = msg; c.cv.setAttribute('aria-label', 'Right triangle ABC with the right angle at C. ' + ro.textContent);
    }
    if (o.sliders !== false) {
      V.slider(row, { label: 'Angle A', min: 5, max: 85, step: 1, value: th, fmt: function (v) { return v + '°'; }, input: function (v) { th = v; draw(); } });
      V.slider(row, { label: 'Size (hypotenuse)', min: 2, max: 10, step: 0.5, value: size, fmt: function (v) { return f1(v); }, input: function (v) { size = v; draw(); } });
      V.seg(row, { label: 'Look from', items: [['A', 'From angle A'], ['B', 'From angle B']], value: ref, change: function (v) { ref = v; draw(); } });
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  }

  /* ================================================================ geo-cavalieri */
  function cavalieri(elm, o, V) {
    var shape = o.shape || 'coins';
    var st = host(elm, o, 'geo-cavalieri', 'Two stacks of slices with equal areas at every height');
    var r = +o.r || 3, h = +o.h || 8, lean = o.lean != null ? +o.lean : 0.6, N = +o.slices || 12;
    var c = V.canvas(st, { aspect: 1.7, max: 330, min: 200 });
    c.cv.classList.add('geo-cv'); c.cv.setAttribute('role', 'img');
    var ro = el('p', 'geo-ro'); ro.setAttribute('aria-live', 'polite'); elm.appendChild(ro);
    var row = el('div', 'geo-row'); elm.appendChild(row);
    function draw() {
      var k = V.colors(), ctx = c.ctx, W2 = c.w, H2 = c.h; ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, W2, H2); ctx.restore();
      var s = M.min((W2 / 2 - 30) / (2 * r + M.abs(lean) * h + 1), (H2 - 40) / (h + r * 0.7 + 1)), base = H2 - 24 - r * 0.35 * s;
      var dh = h / N;
      function stack(cx, ln, kind) {
        for (var i = 0; i < N; i++) {
          var y0 = i * dh, ym = y0 + dh / 2, rr = kind === 'cone' || kind === 'pyr' ? r * (1 - ym / h) : r;
          if (kind === 'pyr') rr *= M.sqrt(PI) / 2; // half the side of a square with the same area as the circle
          var x = cx + ln * y0 * s, yb = base - y0 * s, th2 = M.max(1.5, dh * s - (N <= 16 ? 1.2 : 0)), fill = i % 2 ? k.blueSoft : k.tealSoft;
          ctx.save(); ctx.lineWidth = 1.2; ctx.strokeStyle = kind === 'pyr' || kind === 'cards' ? k.purple : k.blue;
          if (kind === 'coins' || kind === 'cone') {
            var rx = rr * s, ry = rr * s * 0.32;
            ctx.beginPath(); ctx.moveTo(x - rx, yb); ctx.lineTo(x - rx, yb - th2); ctx.ellipse(x, yb - th2, rx, ry, 0, PI, 0, true); ctx.lineTo(x + rx, yb); ctx.ellipse(x, yb, rx, ry, 0, 0, PI, false); ctx.closePath();
            ctx.fillStyle = k.bg; ctx.fill(); ctx.fillStyle = fill; ctx.fill(); if (N <= 24) ctx.stroke();
            ctx.beginPath(); ctx.ellipse(x, yb - th2, rx, ry, 0, 0, TAU); ctx.fillStyle = k.bg; ctx.fill(); ctx.fillStyle = i % 2 ? k.blueSoft : k.tealSoft; ctx.fill(); ctx.stroke();
          } else {
            var hw = rr * s, dx = hw * 0.55, dy = hw * 0.32;
            var top = [[x - hw - dx / 2, yb - th2 + dy / 2], [x + hw - dx / 2, yb - th2 + dy / 2], [x + hw + dx / 2, yb - th2 - dy / 2], [x - hw + dx / 2, yb - th2 - dy / 2]];
            ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); ctx.lineTo(top[1][0], top[1][1]); ctx.lineTo(top[1][0], top[1][1] + th2); ctx.lineTo(top[0][0], top[0][1] + th2); ctx.closePath(); ctx.fillStyle = k.bg; ctx.fill(); ctx.fillStyle = i % 2 ? k.purpleSoft : k.pinkSoft; ctx.fill(); if (N <= 24) ctx.stroke();
            ctx.beginPath(); ctx.moveTo(top[1][0], top[1][1]); ctx.lineTo(top[2][0], top[2][1]); ctx.lineTo(top[2][0], top[2][1] + th2); ctx.lineTo(top[1][0], top[1][1] + th2); ctx.closePath(); ctx.fillStyle = k.bg; ctx.fill(); ctx.fillStyle = i % 2 ? k.purpleSoft : k.pinkSoft; ctx.fill(); if (N <= 24) ctx.stroke();
            ctx.beginPath(); top.forEach(function (p, j) { if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = k.bg; ctx.fill(); ctx.fillStyle = i % 2 ? k.purpleSoft : k.pinkSoft; ctx.fill(); ctx.stroke();
          }
          ctx.restore();
        }
      }
      var leftKind = shape === 'cards' ? 'cards' : shape === 'cone' ? 'cone' : 'coins', rightKind = shape === 'cone' ? 'pyr' : leftKind;
      var lx = W2 * 0.25, rx2 = W2 * 0.73 - lean * h * s / 2;
      line(ctx, 8, base + 2, W2 - 8, base + 2, k.muted, 1.5);
      line(ctx, 10, base - h * s, W2 - 10, base - h * s, k.muted, 1, [5, 5]);
      text(ctx, o.nums === false ? 'height h' : 'height ' + f1(h), 12, base - h * s - 10, { col: k.muted, size: 12, al: 'left', halo: k.bg });
      stack(lx, 0, leftKind); stack(rx2, lean, rightKind);
      var sliceA = shape === 'cards' ? (2 * r) * (2 * r) : PI * r * r, vol = shape === 'cone' ? PI * r * r * h / 3 : sliceA * h;
      var msg;
      if (shape === 'cone') msg = 'At every height, the round slice of the cone and the square slice of the pyramid have the same area (both start at π · ' + f1(r) + '² ≈ ' + f1(PI * r * r, 1) + ' at the bottom and shrink the same way). Same height, same slice areas, so the same volume: ⅓ · base · height ≈ <b>' + f1(vol, 1) + '</b>.';
      else msg = 'Every slice in both stacks has the same area, ' + (shape === 'cards' ? f1(2 * r) + ' × ' + f1(2 * r) + ' = ' + f1(sliceA, 1) : 'π · ' + f1(r) + '² ≈ ' + f1(sliceA, 1)) + ', and both stacks are ' + f1(h) + ' tall. Leaning the stack slides the slices but does not change them, so both volumes are base · height ≈ <b>' + f1(vol, 1) + '</b>.';
      if (o.nums === false) msg = shape === 'cone' ? 'At every height, the round slice of the cone and the square slice of the pyramid have the same area. Same height and same slice areas, so the same volume.' : 'Every slice in both stacks has the same area, and both stacks have the same height. Leaning the stack slides the slices but does not change them, so the two volumes are equal.';
      ro.innerHTML = msg; c.cv.setAttribute('aria-label', 'Two stacks of slices, one upright and one leaning. ' + ro.textContent);
    }
    V.slider(row, { label: 'Lean of the right stack', min: -1, max: 1, step: 0.05, value: lean, fmt: function (v) { return f1(v, 2); }, input: function (v) { lean = v; draw(); } });
    V.seg(row, { label: 'Number of slices', items: [[6, '6 slices'], [12, '12'], [48, '48']], value: N, change: function (v) { N = +v; draw(); } });
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  }

  function boot() {
    var V = ML.viz; if (!V || boot.done) return; boot.done = true; css();
    V.register('geo-fig', fig); V.register('geo-construct', construct); V.register('geo-circle', circle); V.register('geo-trig', trig); V.register('geo-cavalieri', cavalieri);
  }
  ML.geoViz = { circInt: circInt };
  if (ML.viz) boot(); else D.addEventListener('DOMContentLoaded', boot);
})(window, document);
