/* Math Ladder visuals for Grade 7 (course key g7): static/math/viz/g7.js. Built from /tmp/work_mlp7/viz/*.js.
   Registered with MathLadder.viz.register; styles are injected from this file. Every visual follows the site's light and
   dark theme, has an aria-label, works with mouse, touch and keyboard (sliders and buttons are native controls), and fits
   a 360 px wide screen.

   g7-plot        a first-quadrant graph for problems (no formula shown): lines, a curve, dots and point labels
                  opts: xmax 8, ymax 40, xstep 1, ystep 5, xlabel "hours", ylabel "miles",
                        lines [[x0, y0, x1, y1]], curve [[x, y], …], dots [[x, y]], labels [{x, y, text}]
   g7-angles      an angle diagram with labels such as "(2x + 10)°", drawn to scale
                  opts: mode "line" (angles on a straight line, parts add to 180) | "right" (parts add to 90) |
                        "vertical" (two crossing lines; deg = the angle between the rays at 0° and deg) |
                        "point" (parts add to 360); parts [deg, …]; labels ["35°", "x°", …] ("" leaves an angle unlabeled)
   g7-figure      a labeled figure for area, surface area and volume
                  opts: kind "2d": shapes [{pts: [[x, y], …], hole: false}], lines [[[x, y], [x, y]]] (dashed),
                                   dims [{a: [x, y], b: [x, y], text: "8 cm", inside: false}]
                        kind "prism": base [[x, y], …] (the front face), depth (real length), dscale 0.6 (drawn depth),
                                   dims [{a: [x, y, z], b: [x, y, z], text}] with z 0 (front) or 1 (back),
                                   heightLine [[x, y], [x, y]] (dashed, on the front face)
   g7-rateline    a double number line for rates with fractions: a of the top quantity goes with b of the bottom one.
                  Step along in equal batches, jump to "1 of the bottom" (the unit rate) or "1 of the top" (the other
                  unit rate) and see the division that gives it.
                  opts: a "1/2", b "1/4", names ["miles", "hours"], one ["mile", "hour"], max 4 (batches shown)
   g7-signpattern why a negative times a negative is positive: the rows a × b for a = 3, 2, 1, 0, −1, … with the products
                  on a number line. Each step down in a adds |b| when b is negative.
                  opts: b -3 (the fixed factor), rows 3 (rows shown at the start), edit true (a slider for b)
   g7-longdiv     long division of n ÷ d one digit at a time, with the remainders listed. When a remainder comes back,
                  the digits repeat, and the bar goes over them.
                  opts: n 2, d 3, edit true (choose n and d), show 0 (digits shown at the start)
   g7-scalegrid   a figure and its scaled copy on grids: lengths × k, area × k² (the copy holds k² copies of the original)
                  opts: w 3, h 2 (the original, in units), k 2 (scale factor 1 to 4), copies true
   g7-sticks      can three lengths make a triangle? The longest stick is the base; the other two swing up from its ends.
                  opts: a 4, b 5, c 8 (lengths 1 to 15), edit true
   g7-bias        a town of 200 people, most "yes" answers clustered near one place. Compare random samples with samples
                  taken only near that place: random samples vary around the truth; the convenient ones stay biased, however big.
                  opts: near 4 (columns near the place), yesNear 0.8, yesFar 0.2, size 20, place "the skate shop"
   g7-slice       slice a right rectangular prism or a square pyramid with a plane and see the cross-section's shape.
                  opts: solid "prism" | "pyramid" | "cube", l 4, w 3, h 3, cut "base" (parallel to the base) | "side"
                        (perpendicular to the base) | "tilt" (tilted) | "corner" (cuts off a corner), pos 0.5, tilt 30,
                        pick true (buttons to change solid and cut)                                                   */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/g7.js: load viz/core.js first'); return; }
  var M = Math, PI = M.PI;

  /* ------------------------------------------------------------ styles */
  if (!D.getElementById('g7-viz-css')) {
    var st = D.createElement('style'); st.id = 'g7-viz-css';
    st.textContent = [
      '.g7v-title{margin:0 0 .45rem;font-weight:700;font-size:1rem}',
      '.g7v-stage{position:relative}',
      '.g7v-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.55rem 0 0}',
      '.g7v-tab{border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:.95rem;margin:.5rem 0 0}',
      '.g7v-tab td,.g7v-tab th{border:1px solid var(--mv-line);padding:.25rem .55rem;text-align:center;background:var(--mv-card)}',
      '.g7v-tab th{font-weight:600;color:var(--mv-muted)}',
      '.g7v-tab tr.g7v-now td{background:rgba(184,150,62,.18)}',
      '.g7v-tab tr.g7v-neg td:last-child{color:#00703c;font-weight:700}',
      'html[data-theme="dark"] .g7v-tab tr.g7v-neg td:last-child{color:#6cc79a}',
      '.g7v-tabwrap{overflow-x:auto;max-width:100%}',
      '.g7v-ld{display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start;margin-top:.4rem}',
      '.g7v-ld ol{margin:0;padding-left:1.4rem;font-size:.92rem;line-height:1.6;font-variant-numeric:tabular-nums}',
      '.g7v-ld li.g7v-rep{background:rgba(184,150,62,.22);border-radius:6px}',
      '.g7v-big{font-size:1.35rem;font-weight:700;font-variant-numeric:tabular-nums;margin:.2rem 0;letter-spacing:.02em}',
      '.g7v-big .g7v-bar{text-decoration:overline;text-decoration-thickness:2px}',
      '.g7v-num{width:4.2rem;min-height:36px;font:inherit;padding:.2rem .4rem;border:1px solid var(--mv-line);border-radius:8px;background:var(--mv-card);color:var(--mv-ink)}',
      '.g7v-lab{font-size:.85rem;color:var(--mv-muted);display:inline-flex;align-items:center;gap:.35rem}',
      '.g7v-ok{color:#00703c;font-weight:700}html[data-theme="dark"] .g7v-ok{color:#6cc79a}',
      '.g7v-no{color:#c2255c;font-weight:700}html[data-theme="dark"] .g7v-no{color:#f783ac}'
    ].join('\n');
    (D.head || D.documentElement).appendChild(st);
  }

  /* ------------------------------------------------------------ helpers */
  function el(tag, cls, html) { return V.el(tag, cls, html); }
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function rat(n, d) { d = d === undefined ? 1 : d; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; return { n: n / g, d: d / g, v: n / d }; }
  function parseQ(s, dflt) {
    if (typeof s === 'number') { if (s === M.round(s)) return rat(s, 1); var p = 1; while (M.abs(s * p - M.round(s * p)) > 1e-9 && p < 1e6) p *= 10; return rat(M.round(s * p), p); }
    var m = /^\s*(-?)(\d+)\s*\/\s*(\d+)\s*$/.exec(String(s == null ? '' : s));
    if (m && +m[3]) return rat((m[1] ? -1 : 1) * +m[2], +m[3]);
    var x = parseFloat(s); return isFinite(x) ? parseQ(x) : dflt;
  }
  function qmul(a, b) { return rat(a.n * b.n, a.d * b.d); }
  function qdiv(a, b) { return rat(a.n * b.d, a.d * b.n); }
  function qtxt(q) { // plain text: "1/2", "2 1/4", "3", "−1/3"
    if (q.d === 1) return minus(String(q.n));
    var s = q.n < 0 ? '−' : '', n = M.abs(q.n), w = M.floor(n / q.d), r = n % q.d;
    return s + (w ? w + ' ' : '') + r + '/' + q.d;
  }
  function minus(s) { return String(s).replace(/-/g, '−'); }
  function fmt(v, d) { return V.fmt(v, d); }
  function font(ctx, px, wt) { ctx.font = (wt || 400) + ' ' + px + 'px system-ui, -apple-system, "Segoe UI", sans-serif'; }
  function text(ctx, s, x, y, o) {
    o = o || {}; font(ctx, o.size || 13, o.wt); ctx.textAlign = o.al || 'center'; ctx.textBaseline = o.bl || 'middle';
    if (o.box) { var tw = ctx.measureText(s).width, sz = o.size || 13, bx = o.al === 'left' ? x : o.al === 'right' ? x - tw : x - tw / 2; ctx.fillStyle = o.box; ctx.fillRect(bx - 4, y - sz * 0.75, tw + 8, sz * 1.5); }
    if (o.halo) { ctx.lineWidth = 4; ctx.strokeStyle = o.halo; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.col || V.colors().ink; ctx.fillText(s, x, y);
  }
  function line(ctx, x1, y1, x2, y2, col, w, dash) { ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.restore(); }
  function dot(ctx, x, y, r, fill, stroke) { ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * PI); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke(); } }
  function poly(ctx, pts, fill, stroke, w, dash) {
    ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w || 2; if (dash) ctx.setLineDash(dash); ctx.stroke(); }
    ctx.restore();
  }
  function arrow(ctx, x1, y1, x2, y2, col, w) {
    line(ctx, x1, y1, x2, y2, col, w || 2); var a = M.atan2(y2 - y1, x2 - x1), s = 8;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * M.cos(a - 0.45), y2 - s * M.sin(a - 0.45)); ctx.lineTo(x2 - s * M.cos(a + 0.45), y2 - s * M.sin(a + 0.45)); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  /* the frame every g7 visual uses: optional title, a canvas host, a control row and a readout */
  function frame(el0, o, label, co) {
    el0.classList.add('g7v');
    if (o.title) el0.appendChild(el('p', 'g7v-title', o.title));
    var stage = el('div', 'g7v-stage'); el0.appendChild(stage);
    var c = V.canvas(stage, co || { aspect: 1.6, max: 340 });
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || label);
    return { el: el0, stage: stage, c: c, ctx: c.ctx };
  }
  function controls(F) { var r = el('div', 'ml-ctl'); F.el.appendChild(r); return r; }
  function readout(F) { return V.readout(F.el); }
  function redrawOn(F, fn) { F.c.onResize(fn); V.onTheme(fn); }
  /* ============================================================ g7-plot */
  V.register('g7-plot', function (el0, o) {
    var xmax = +o.xmax || 8, ymax = +o.ymax || 40, xs = +o.xstep || 1, ys = +o.ystep || M.max(1, M.round(ymax / 8));
    var F = frame(el0, o, 'A graph with ' + (o.xlabel || 'x') + ' across and ' + (o.ylabel || 'y') + ' up.', { aspect: 1.45, max: 330, min: 230 });
    function draw() {
      var c = F.c, ctx = F.ctx, k = V.colors(), w = c.w, h = c.h;
      var L = 52, B = 44, Tp = 16, Rt = 22, X = function (x) { return L + x / xmax * (w - L - Rt); }, Y = function (y) { return h - B - y / ymax * (h - B - Tp); };
      ctx.clearRect(0, 0, w, h);
      var everyX = M.max(1, M.ceil(28 / (X(xs) - X(0)))), everyY = M.max(1, M.ceil(20 / (Y(0) - Y(ys))));
      for (var i = 0, x = 0; x <= xmax + 1e-9; i++, x = i * xs) { line(ctx, X(x), Y(0), X(x), Y(ymax), k.grid, 1); if (i % everyX === 0) text(ctx, fmt(x), X(x), Y(0) + 14, { size: 12, col: k.muted }); }
      for (var j = 0, y = 0; y <= ymax + 1e-9; j++, y = j * ys) { line(ctx, X(0), Y(y), X(xmax), Y(y), k.grid, 1); if (j % everyY === 0) text(ctx, fmt(y), X(0) - 7, Y(y), { size: 12, col: k.muted, al: 'right' }); }
      line(ctx, X(0), Y(0), X(xmax) + 8, Y(0), k.axis, 2); line(ctx, X(0), Y(0), X(0), Y(ymax) - 6, k.axis, 2);
      text(ctx, o.xlabel || 'x', (X(0) + X(xmax)) / 2, h - 10, { size: 13, wt: 600, col: k.ink });
      ctx.save(); ctx.translate(13, (Y(0) + Y(ymax)) / 2); ctx.rotate(-PI / 2); text(ctx, o.ylabel || 'y', 0, 0, { size: 13, wt: 600, col: k.ink }); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(X(0) - 1, Y(ymax) - 1, X(xmax) - X(0) + 2, Y(0) - Y(ymax) + 2); ctx.clip();
      (o.lines || []).forEach(function (s) { line(ctx, X(s[0]), Y(s[1]), X(s[2]), Y(s[3]), k.blue, 3); });
      if (o.curve && o.curve.length) { ctx.beginPath(); o.curve.forEach(function (p, n) { if (n) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); }); ctx.strokeStyle = k.blue; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.restore();
      (o.dots || []).forEach(function (p) { if (p[1] <= ymax + 1e-9) dot(ctx, X(p[0]), Y(p[1]), 5.5, k.red, k.bg); });
      (o.labels || []).forEach(function (p) { var left = X(p.x) > L + 80; text(ctx, p.text, X(p.x) + (left ? -10 : 10), Y(p.y) - 15, { size: 13, wt: 700, col: k.red, al: left ? 'right' : 'left', box: k.bg }); });
    }
    redrawOn(F, draw); draw();
    return { draw: draw };
  });

  /* ============================================================ g7-angles */
  V.register('g7-angles', function (el0, o) {
    var mode = o.mode || 'line', labels = o.labels || [], parts = (o.parts || []).map(Number);
    if (mode === 'vertical') { var d0 = +o.deg || 50; parts = [d0, 180 - d0, d0, 180 - d0]; }
    if (!parts.length) parts = mode === 'right' ? [35, 55] : mode === 'point' ? [90, 120, 150] : [70, 110];
    var desc = { line: 'Angles on a straight line', right: 'A right angle split into parts', vertical: 'Two lines crossing', point: 'Angles around a point' }[mode] || 'Angles';
    var F = frame(el0, o, desc + (labels.length ? ': ' + labels.filter(Boolean).join(', ') : '') + '.', { aspect: mode === 'line' ? 2 : 1.5, max: mode === 'line' ? 230 : 300, min: 180 });
    var COLS = ['red', 'blue', 'green', 'purple', 'orange', 'teal'];
    function draw() {
      var c = F.c, ctx = F.ctx, k = V.colors(), w = c.w, h = c.h, cx, cy, R0;
      ctx.clearRect(0, 0, w, h);
      if (mode === 'line') { cx = w / 2; cy = h - 34; R0 = M.min(w / 2 - 20, h - 50); }
      else if (mode === 'right') { cx = M.max(40, w / 2 - (h - 60) / 2); cy = h - 30; R0 = M.min(w - cx - 20, h - 50); }
      else { cx = w / 2; cy = h / 2; R0 = M.min(w / 2, h / 2) - 14; }
      var start = 0, rays = [], arcs = [];
      parts.forEach(function (p, i) { arcs.push([start, start + p, i]); start += p; });
      // rays (directions in degrees, counterclockwise from the right)
      if (mode === 'line') { line(ctx, cx - R0, cy, cx + R0, cy, k.ink, 2.5); arcs.slice(0, -1).forEach(function (a) { rays.push(a[1]); }); }
      else if (mode === 'right') { rays = [0, 90]; arcs.slice(0, -1).forEach(function (a) { rays.push(a[1]); }); }
      else if (mode === 'vertical') { line(ctx, cx - R0, cy, cx + R0, cy, k.ink, 2.5); var t = parts[0] * PI / 180; line(ctx, cx - R0 * M.cos(t), cy + R0 * M.sin(t), cx + R0 * M.cos(t), cy - R0 * M.sin(t), k.ink, 2.5); }
      else { arcs.forEach(function (a) { rays.push(a[0]); }); }
      rays.forEach(function (dg) { var t = dg * PI / 180; line(ctx, cx, cy, cx + R0 * M.cos(t), cy - R0 * M.sin(t), k.ink, 2.5); });
      if (mode === 'right') { var s = 13; poly(ctx, [[cx, cy], [cx + s, cy], [cx + s, cy - s], [cx, cy - s]], null, k.muted, 1.5); }
      // arcs and labels
      arcs.forEach(function (a) {
        var lab = labels[a[2]]; if (lab === undefined) lab = mode === 'vertical' ? '' : a[1] - a[0] + '°';
        var span = a[1] - a[0], r = span < 25 ? R0 * 0.62 : span < 50 ? R0 * 0.45 : R0 * 0.3, col = k[COLS[a[2] % COLS.length]];
        if (mode === 'right' && r < 26) r = 26;
        if (!lab) return;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -a[0] * PI / 180, -a[1] * PI / 180, true); ctx.closePath();
        ctx.fillStyle = k[COLS[a[2] % COLS.length] + 'Soft']; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, r, -a[0] * PI / 180, -a[1] * PI / 180, true); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
        var mid = (a[0] + a[1]) / 2 * PI / 180, lr = r + (span < 30 ? 26 : 22) + M.min(30, lab.length * 2.2);
        var lx = cx + lr * M.cos(mid), ly = cy - lr * M.sin(mid);
        lx = M.max(8 + lab.length * 4, M.min(w - 8 - lab.length * 4, lx)); ly = M.max(12, M.min(h - 10, ly));
        text(ctx, lab, lx, ly, { size: 14, wt: 700, col: col, halo: k.bg });
      });
      dot(ctx, cx, cy, 3.5, k.ink);
    }
    redrawOn(F, draw); draw();
    return { draw: draw };
  });

  /* ============================================================ g7-figure */
  V.register('g7-figure', function (el0, o) {
    var kind = o.kind || '2d', isPrism = kind === 'prism';
    var F = frame(el0, o, isPrism ? 'A prism with its measurements labeled.' : 'A figure with its measurements labeled.', { aspect: 1.5, max: 300, min: 200 });
    function prismPts() { // 3D points -> drawing units (oblique: depth goes up and to the right)
      var dsc = o.dscale || 0.6, dep = (+o.depth || 3) * dsc, ang = PI / 6;
      return function (p) { var z = p[2] || 0; return [p[0] + z * dep * M.cos(ang), p[1] + z * dep * M.sin(ang)]; };
    }
    function hull(pts) {
      var P = pts.map(function (p, i) { return [p[0], p[1], i]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
      function cr(O, A, B) { return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]); }
      var lo = [], up = [];
      P.forEach(function (p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 1e-9) lo.pop(); lo.push(p); });
      P.slice().reverse().forEach(function (p) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 1e-9) up.pop(); up.push(p); });
      return lo.slice(0, -1).concat(up.slice(0, -1));
    }
    function draw() {
      var c = F.c, ctx = F.ctx, k = V.colors(), w = c.w, h = c.h, pr = isPrism ? prismPts() : null;
      ctx.clearRect(0, 0, w, h);
      var all = [];
      if (isPrism) (o.base || []).forEach(function (p) { all.push(pr([p[0], p[1], 0])); all.push(pr([p[0], p[1], 1])); });
      else (o.shapes || []).forEach(function (s) { s.pts.forEach(function (p) { all.push(p); }); });
      if (!all.length) return;
      var x0 = M.min.apply(null, all.map(function (p) { return p[0]; })), x1 = M.max.apply(null, all.map(function (p) { return p[0]; }));
      var y0 = M.min.apply(null, all.map(function (p) { return p[1]; })), y1 = M.max.apply(null, all.map(function (p) { return p[1]; }));
      var pad = 46, sc = M.min((w - 2 * pad) / M.max(1e-6, x1 - x0), (h - 2 * pad + 10) / M.max(1e-6, y1 - y0));
      var ox = (w - (x1 - x0) * sc) / 2, oy = (h + (y1 - y0) * sc) / 2;
      function S(p) { return [ox + (p[0] - x0) * sc, oy - (p[1] - y0) * sc]; }
      var cen = S([(x0 + x1) / 2, (y0 + y1) / 2]);
      function label(a, b, txt, inside) {
        var A = S(a), Bp = S(b), mx2 = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2, dx = Bp[0] - A[0], dy = Bp[1] - A[1], L2 = M.hypot(dx, dy) || 1;
        var nx = -dy / L2, ny = dx / L2;
        if ((mx2 - cen[0]) * nx + (my - cen[1]) * ny < 0) { nx = -nx; ny = -ny; }
        if (inside) { nx = -nx; ny = -ny; }
        var off = 8 + 3.2 * txt.length * M.abs(nx) + 7 * M.abs(ny);
        text(ctx, txt, mx2 + nx * off, my + ny * off, { size: 13, wt: 700, col: k.ink, halo: k.bg });
      }
      if (!isPrism) {
        (o.shapes || []).forEach(function (s) { poly(ctx, s.pts.map(S), s.hole ? k.bg : k.greenSoft, k.green, 2.5); });
        (o.lines || []).forEach(function (ln) { var A = S(ln[0]), Bq = S(ln[1]); line(ctx, A[0], A[1], Bq[0], Bq[1], k.muted, 1.5, [6, 5]); });
        (o.dims || []).forEach(function (d) { if (d.inside) { var A = S(d.a), Bq = S(d.b); line(ctx, A[0], A[1], Bq[0], Bq[1], k.muted, 1.5, [6, 5]); } label(d.a, d.b, d.text, d.inside); });
        return;
      }
      var base = o.base || [], n = base.length, front = base.map(function (p) { return S(pr([p[0], p[1], 0])); }), back = base.map(function (p) { return S(pr([p[0], p[1], 1])); });
      var H = hull(front.concat(back)), onHull = {}; H.forEach(function (p) { onHull[p[2]] = 1; });
      function hidden(i) { return !onHull[n + i]; } // a back vertex inside the outline is hidden
      poly(ctx, H.map(function (p) { return [p[0], p[1]]; }), k.blueSoft, null);
      poly(ctx, front, k.greenSoft, null);
      for (var i = 0; i < n; i++) {
        var j = (i + 1) % n, dsh = hidden(i) || hidden(j) ? [6, 5] : null;
        line(ctx, back[i][0], back[i][1], back[j][0], back[j][1], dsh ? k.muted : k.blue, dsh ? 1.5 : 2.2, dsh);
        var d2 = hidden(i) ? [6, 5] : null; line(ctx, front[i][0], front[i][1], back[i][0], back[i][1], d2 ? k.muted : k.blue, d2 ? 1.5 : 2.2, d2);
      }
      poly(ctx, front, null, k.green, 2.5);
      if (o.heightLine) { var A1 = S(pr([o.heightLine[0][0], o.heightLine[0][1], 0])), B1 = S(pr([o.heightLine[1][0], o.heightLine[1][1], 0])); line(ctx, A1[0], A1[1], B1[0], B1[1], k.red, 1.8, [5, 4]); var s2 = 9; poly(ctx, [[B1[0], B1[1]], [B1[0] + s2, B1[1]], [B1[0] + s2, B1[1] - s2], [B1[0], B1[1] - s2]], null, k.red, 1.2); }
      (o.dims || []).forEach(function (d) { label(pr(d.a), pr(d.b), d.text, d.inside); });
    }
    redrawOn(F, draw); draw();
    return { draw: draw };
  });
  /* ============================================================ g7-rateline */
  V.register('g7-rateline', function (el0, o) {
    var a = parseQ(o.a, rat(1, 2)), b = parseQ(o.b, rat(1, 4)), names = o.names || ['miles', 'hours'], one = o.one || ['mile', 'hour'];
    var nmax = M.max(+o.max || 4, M.ceil(1 / b.v), M.ceil(1 / a.v)) + 0.5;
    var F = frame(el0, o, 'A double number line: ' + qtxt(a) + ' ' + names[0] + ' for every ' + qtxt(b) + ' ' + names[1] + '.', { aspect: 2.6, max: 190, min: 150 });
    var kq = rat(1); // how many batches the marker is at
    function draw() {
      var c = F.c, ctx = F.ctx, k = V.colors(), w = c.w, h = c.h, L = M.min(90, w * 0.2), R = w - 20, y1 = 52, y2 = h - 44;
      function X(t) { return L + t / nmax * (R - L); }
      ctx.clearRect(0, 0, w, h);
      text(ctx, names[0], L - 12, y1, { al: 'right', wt: 700, col: k.green, size: 13 }); text(ctx, names[1], L - 12, y2, { al: 'right', wt: 700, col: k.blue, size: 13 });
      line(ctx, L, y1, R + 6, y1, k.ink, 2); line(ctx, L, y2, R + 6, y2, k.ink, 2);
      var minGap = 34, every = M.max(1, M.ceil(minGap / (X(1) - X(0))));
      for (var i = 0; i <= nmax; i++) {
        line(ctx, X(i), y1 - 7, X(i), y1 + 7, k.ink, 1.5); line(ctx, X(i), y2 - 7, X(i), y2 + 7, k.ink, 1.5);
        if (i % every === 0 && M.abs(i - kq.v) > 1e-9) { text(ctx, qtxt(qmul(rat(i), a)), X(i), y1 - 18, { size: 12, col: k.muted }); text(ctx, qtxt(qmul(rat(i), b)), X(i), y2 + 19, { size: 12, col: k.muted }); }
      }
      // "1" marks on each line
      var tB = 1 / b.v, tA = 1 / a.v;
      if (tB <= nmax) { line(ctx, X(tB), y2 - 11, X(tB), y2 + 11, k.blue, 2.5); }
      if (tA <= nmax) { line(ctx, X(tA), y1 - 11, X(tA), y1 + 11, k.green, 2.5); }
      var x = X(kq.v);
      line(ctx, x, y1, x, y2, k.gold, 3);
      dot(ctx, x, y1, 8, k.green, k.bg); dot(ctx, x, y2, 8, k.blue, k.bg);
      text(ctx, qtxt(qmul(kq, a)), x, y1 - 19, { size: 14, wt: 800, col: k.green, box: k.bg });
      text(ctx, qtxt(qmul(kq, b)), x, y2 + 20, { size: 14, wt: 800, col: k.blue, box: k.bg });
      say();
    }
    var out = readout(F);
    function say() {
      var A = qmul(kq, a), B = qmul(kq, b), s = '<b>' + qtxt(A) + ' ' + (A.v <= 1 && A.v > 0 ? one[0] : names[0]) + '</b> for <b>' + qtxt(B) + ' ' + (B.v <= 1 && B.v > 0 ? one[1] : names[1]) + '</b>.';
      if (M.abs(B.v - 1) < 1e-9) s += ' This is the unit rate: ' + qtxt(a) + ' ÷ ' + qtxt(b) + ' = <b>' + qtxt(qdiv(a, b)) + ' ' + names[0] + ' per ' + one[1] + '</b>. (' + qtxt(b) + ' fits into 1 exactly ' + qtxt(rat(b.d, b.n)) + ' times, so the ' + names[0] + ' are multiplied by ' + qtxt(rat(b.d, b.n)) + ' too.)';
      else if (M.abs(A.v - 1) < 1e-9) s += ' The other unit rate: ' + qtxt(b) + ' ÷ ' + qtxt(a) + ' = <b>' + qtxt(qdiv(b, a)) + ' ' + names[1] + ' per ' + one[0] + '</b>.';
      else if (kq.v === 0) s += ' None of one goes with none of the other.';
      else if (kq.v === 1) s += ' This is the pair we started with. Step along: both amounts grow together.';
      else s += ' Both amounts are ' + qtxt(kq) + ' times the first pair, so the rate is the same.';
      out.set(s);
    }
    var row = controls(F);
    V.button(row, '− batch', function () { kq = rat(M.max(0, M.ceil(kq.v - 1 - 1e-9))); draw(); });
    V.button(row, '+ batch', function () { kq = rat(M.min(M.floor(nmax), M.floor(kq.v + 1 + 1e-9))); draw(); });
    V.button(row, '1 ' + one[1], function () { kq = rat(b.d, b.n); draw(); }, 'pri');
    V.button(row, '1 ' + one[0], function () { kq = rat(a.d, a.n); draw(); });
    redrawOn(F, draw); draw();
    return { draw: draw };
  });

  /* ============================================================ g7-signpattern */
  V.register('g7-signpattern', function (el0, o) {
    var b = parseInt(o.b, 10) || -3, shown = M.max(1, M.min(7, parseInt(o.rows, 10) || 3)), TOP = 3, BOT = -3;
    var F = frame(el0, o, 'The products a times ' + b + ' for a from 3 down to −3, on a number line.', { aspect: 3.4, max: 150, min: 110 });
    var tw = el('div', 'g7v-tabwrap'); F.el.insertBefore(tw, null);
    var out = readout(F);
    function rows() { var r = []; for (var a = TOP; a >= TOP - shown + 1; a--) r.push(a); return r; }
    function draw() {
      var c = F.c, ctx = F.ctx, k = V.colors(), w = c.w, h = c.h, lim = M.max(9, M.abs(b) * 3), L = 18, R = w - 18, y = h * 0.62;
      function X(v) { return L + (v + lim) / (2 * lim) * (R - L); }
      ctx.clearRect(0, 0, w, h);
      line(ctx, L - 6, y, R + 6, y, k.ink, 2);
      var step = lim > 12 ? 3 : 1, every = M.max(1, M.ceil(26 / (X(step) - X(0))));
      for (var v = -lim, n = 0; v <= lim; v += step, n++) { line(ctx, X(v), y - 5, X(v), y + 5, k.ink, 1); if (n % every === 0 || v === 0) text(ctx, minus(v), X(v), y + 17, { size: 11, col: v < 0 ? k.red : v > 0 ? k.blue : k.ink, wt: v === 0 ? 700 : 400 }); }
      var rs = rows();
      rs.forEach(function (a, i) {
        var p = a * b; dot(ctx, X(p), y, i === rs.length - 1 ? 7 : 5, i === rs.length - 1 ? k.gold : k.muted, k.bg);
        if (i > 0) { var q0 = (a + 1) * b; var yy = y - 16 - (i % 2) * 10; ctx.beginPath(); ctx.moveTo(X(q0), y - 6); ctx.quadraticCurveTo((X(q0) + X(p)) / 2, yy - 22, X(p), y - 8); ctx.strokeStyle = k.purple; ctx.lineWidth = 1.8; ctx.stroke(); }
      });
      var last = rs[rs.length - 1];
      text(ctx, minus(last + ' × (' + b + ') = ' + last * b), X(last * b), 14, { size: 13, wt: 800, col: k.ink, halo: k.bg });
      table(); say();
    }
    function table() {
      var h = '<table class="g7v-tab"><thead><tr><th scope="col">a</th><th scope="col">×</th><th scope="col">b</th><th scope="col">=</th></tr></thead><tbody>';
      rows().forEach(function (a, i, arr) { h += '<tr class="' + (i === arr.length - 1 ? 'g7v-now ' : '') + (a < 0 && b < 0 ? 'g7v-neg' : '') + '"><td>' + minus(a) + '</td><td>×</td><td>' + minus(b) + '</td><td>' + minus(a * b) + '</td></tr>'; });
      tw.innerHTML = h + '</tbody></table>';
    }
    function say() {
      var last = rows()[rows().length - 1], s = 'Each time a goes down by 1, we take away one group of ' + minus(b) + ', so the product goes ' + (b < 0 ? '<b>up</b> by ' + (-b) : '<b>down</b> by ' + b) + '.';
      if (last < 0 && b < 0) s += ' Keep the pattern going past 0: ' + minus(last) + ' × (' + minus(b) + ') = <b>' + (last * b) + '</b>. A negative times a negative is positive.';
      else if (last < 0) s += ' Past 0 the products are negative: ' + minus(last) + ' × ' + b + ' = ' + minus(last * b) + '.';
      out.set(s);
    }
    var row = controls(F);
    V.button(row, 'Next row', function () { if (TOP - shown + 1 > BOT) { shown++; draw(); } }, 'pri');
    V.button(row, 'Start over', function () { shown = 1; draw(); });
    if (o.edit !== false) V.slider(row, { label: 'b (the fixed factor)', min: -5, max: 5, step: 1, value: b, fmt: function (v) { return minus(v); }, input: function (v) { if (v === 0) v = -1; b = v; draw(); } });
    redrawOn(F, draw); draw();
    return { draw: draw };
  });

  /* ============================================================ g7-longdiv */
  V.register('g7-longdiv', function (el0, o) {
    var n = M.max(1, parseInt(o.n, 10) || 2), d = M.max(2, parseInt(o.d, 10) || 3), shown = M.max(0, parseInt(o.show, 10) || 0);
    el0.classList.add('g7v');
    if (o.title) el0.appendChild(el('p', 'g7v-title', o.title));
    var big = el('p', 'g7v-big'); big.setAttribute('aria-live', 'polite'); el0.appendChild(big);
    var box = el('div', 'g7v-ld'); el0.appendChild(box);
    var list = el('ol'); box.appendChild(list);
    var out = V.readout(el0);
    function steps() { // [{r (remainder before), digit, r2}], cycle start index or -1, terminates
      var ip = M.floor(n / d), r = n % d, res = [], seen = {}, cyc = -1;
      for (var i = 0; i < 40 && r !== 0; i++) { if (seen[r] !== undefined) { cyc = seen[r]; break; } seen[r] = i; var dig = M.floor(r * 10 / d), r2 = (r * 10) % d; res.push({ r: r, dig: dig, r2: r2 }); r = r2; }
      return { ip: ip, list: res, cyc: cyc, ends: r === 0 };
    }
    function draw() {
      var S = steps(), m = M.min(shown, S.list.length), digits = S.list.slice(0, m).map(function (s) { return s.dig; }).join('');
      var complete = m === S.list.length, hb = n + ' ÷ ' + d + ' = ' + S.ip + (m ? '.' : '');
      if (complete && S.cyc >= 0) big.innerHTML = hb + digits.slice(0, S.cyc) + '<span class="g7v-bar">' + digits.slice(S.cyc) + '</span>';
      else big.textContent = hb + digits + (complete ? '' : '…');
      var h = '<li>' + n + ' ÷ ' + d + ' = ' + S.ip + ' remainder ' + (n % d) + '. Write ' + S.ip + ' and a decimal point.</li>';
      S.list.slice(0, m).forEach(function (s, i) { h += '<li' + (complete && S.cyc >= 0 && i >= S.cyc ? ' class="g7v-rep"' : '') + '>Remainder ' + s.r + ' → bring down a 0: ' + s.r * 10 + ' ÷ ' + d + ' = <b>' + s.dig + '</b> remainder ' + s.r2 + '.</li>'; });
      list.innerHTML = h;
      var msg;
      if (!complete) msg = 'Press "Next digit". Watch the remainders: there are only ' + (d - 1) + ' possible nonzero remainders when dividing by ' + d + '.';
      else if (S.ends) msg = 'The remainder reached 0, so the decimal <b>terminates</b>: ' + n + '/' + d + ' = ' + S.ip + (digits ? '.' + digits : '') + '.';
      else msg = 'Remainder ' + S.list[S.cyc].r + ' came back, so from here the same digits repeat forever. The bar goes over the repeating part: <b>' + digits.slice(S.cyc) + '</b>.';
      out.set(msg);
    }
    var row = el('div', 'ml-ctl'); el0.appendChild(row);
    V.button(row, 'Next digit', function () { if (shown < steps().list.length) shown++; draw(); }, 'pri');
    V.button(row, 'Show all', function () { shown = steps().list.length; draw(); });
    V.button(row, 'Start over', function () { shown = 0; draw(); });
    if (o.edit !== false) {
      [['Numerator', 'n'], ['Denominator', 'd']].forEach(function (f) {
        var lab = el('label', 'g7v-lab', f[0] + ' '), inp = D.createElement('input'); inp.type = 'number'; inp.className = 'g7v-num'; inp.min = f[1] === 'd' ? 2 : 1; inp.max = 99; inp.value = f[1] === 'd' ? d : n;
        inp.addEventListener('change', function () { var v = parseInt(inp.value, 10); if (!isFinite(v)) return; v = M.max(+inp.min, M.min(99, v)); inp.value = v; if (f[1] === 'd') d = v; else n = v; shown = 0; draw(); });
        lab.appendChild(inp); row.appendChild(lab);
      });
    }
    draw();
    return { draw: draw };
  });

  /* ============================================================ g7-scalegrid */
  V.register('g7-scalegrid', function (el0, o) {
    var w0 = M.max(1, M.min(4, parseInt(o.w, 10) || 3)), h0 = M.max(1, M.min(3, parseInt(o.h, 10) || 2)), kf = M.max(1, M.min(4, parseInt(o.k, 10) || 2)), copies = o.copies !== false;
    var F = frame(el0, o, 'A ' + w0 + ' by ' + h0 + ' rectangle and a copy scaled by a factor.', { aspect: 1.9, max: 280, min: 190 });
    var out = readout(F);
    function draw() {
      var c = F.c, ctx = F.ctx, k = V.colors(), w = c.w, h = c.h, cols = w0 + 1 + w0 * 4, rowsN = h0 * 4, u = M.min((w - 30) / (w0 * (1 + kf) + 1.5), (h - 40) / (h0 * kf));
      u = M.min(u, (w - 30) / cols * 1.6);
      ctx.clearRect(0, 0, w, h);
      var ox = 12, oy = h - 22;
      function rect(x, y, ww, hh, fill, stroke, lw) { ctx.fillStyle = fill; ctx.fillRect(x, y, ww, hh); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.strokeRect(x, y, ww, hh); } }
      // original
      for (var i = 0; i < w0; i++) for (var j = 0; j < h0; j++) rect(ox + i * u, oy - (j + 1) * u, u, u, k.greenSoft, k.green, 1);
      ctx.strokeStyle = k.green; ctx.lineWidth = 2.5; ctx.strokeRect(ox, oy - h0 * u, w0 * u, h0 * u);
      text(ctx, 'original', ox + w0 * u / 2, oy + 12, { size: 12, col: k.muted });
      // scaled copy
      var sx = ox + w0 * u + 1.2 * u + 6;
      var tints = [k.blueSoft, k.goldSoft];
      for (var bi = 0; bi < kf; bi++) for (var bj = 0; bj < kf; bj++) rect(sx + bi * w0 * u, oy - (bj + 1) * h0 * u, w0 * u, h0 * u, copies ? tints[(bi + bj) % 2] : k.blueSoft, null);
      for (var gi = 0; gi <= w0 * kf; gi++) line(ctx, sx + gi * u, oy, sx + gi * u, oy - h0 * kf * u, k.grid, 1);
      for (var gj = 0; gj <= h0 * kf; gj++) line(ctx, sx, oy - gj * u, sx + w0 * kf * u, oy - gj * u, k.grid, 1);
      if (copies) for (var ci = 0; ci < kf; ci++) for (var cj = 0; cj < kf; cj++) { ctx.strokeStyle = k.blue; ctx.lineWidth = 1.6; ctx.strokeRect(sx + ci * w0 * u, oy - (cj + 1) * h0 * u, w0 * u, h0 * u); }
      ctx.strokeStyle = k.blue; ctx.lineWidth = 2.5; ctx.strokeRect(sx, oy - h0 * kf * u, w0 * kf * u, h0 * kf * u);
      text(ctx, 'scaled by ' + kf, sx + w0 * kf * u / 2, oy + 12, { size: 12, col: k.muted });
      var A0 = w0 * h0, A1 = A0 * kf * kf;
      out.set('Original: ' + w0 + ' by ' + h0 + ', area <b>' + A0 + '</b> square units. Scaled by ' + kf + ': ' + w0 * kf + ' by ' + h0 * kf + ', area <b>' + A1 + '</b> square units.<br>Each length is ' + kf + ' times as long, but the area is ' + kf + ' × ' + kf + ' = <b>' + kf * kf + '</b> times as big' + (copies && kf > 1 ? ': ' + kf * kf + ' copies of the original fit inside.' : '.'));
    }
    var row = controls(F);
    V.slider(row, { label: 'Scale factor', min: 1, max: 4, step: 1, value: kf, input: function (v) { kf = v; draw(); } });
    V.button(row, copies ? 'Hide the copies' : 'Show the copies', function (e) { copies = !copies; e.target.textContent = copies ? 'Hide the copies' : 'Show the copies'; draw(); });
    redrawOn(F, draw); draw();
    return { draw: draw };
  });

  /* ============================================================ g7-sticks */
  V.register('g7-sticks', function (el0, o) {
    var L3 = [parseInt(o.a, 10) || 4, parseInt(o.b, 10) || 5, parseInt(o.c, 10) || 8].map(function (v) { return M.max(1, M.min(15, v)); });
    var F = frame(el0, o, 'Three sticks: can they make a triangle?', { aspect: 1.9, max: 260, min: 180 });
    var out = readout(F), COL = ['red', 'blue', 'green'];
    function draw() {
      var c = F.c, ctx = F.ctx, k = V.colors(), w = c.w, h = c.h;
      ctx.clearRect(0, 0, w, h);
      var idx = [0, 1, 2].sort(function (i, j) { return L3[j] - L3[i]; }), big = idx[0], p = idx[1], q2 = idx[2];
      var base = L3[big], s1 = L3[p], s2 = L3[q2], sc = M.min((w - 50) / base, (h - 46) / M.max(s1, s2, 1) * 1.1, 40);
      var x0 = (w - base * sc) / 2, y0 = h - 30, x1 = x0 + base * sc;
      var ok = s1 + s2 > base, flat = s1 + s2 === base;
      // swing arcs
      ctx.save(); ctx.setLineDash([4, 5]); ctx.strokeStyle = k.grid; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x0, y0, s1 * sc, PI, 2 * PI); ctx.stroke(); ctx.beginPath(); ctx.arc(x1, y0, s2 * sc, PI, 2 * PI); ctx.stroke(); ctx.restore();
      line(ctx, x0, y0, x1, y0, k[COL[big]], 6);
      if (ok) {
        var d = base, xa = (d * d + s1 * s1 - s2 * s2) / (2 * d), ya = M.sqrt(M.max(0, s1 * s1 - xa * xa)), ax = x0 + xa * sc, ay = y0 - ya * sc;
        poly(ctx, [[x0, y0], [x1, y0], [ax, ay]], k.greenSoft, null);
        line(ctx, x0, y0, ax, ay, k[COL[p]], 6); line(ctx, x1, y0, ax, ay, k[COL[q2]], 6); dot(ctx, ax, ay, 5, k.ink);
      } else {
        line(ctx, x0, y0 - 9, x0 + s1 * sc, y0 - 9, k[COL[p]], 6); line(ctx, x1, y0 - 18, x1 - s2 * sc, y0 - 18, k[COL[q2]], 6);
        if (!flat) { var gx = x0 + s1 * sc, gx2 = x1 - s2 * sc; text(ctx, 'gap ' + (base - s1 - s2), (gx + gx2) / 2, y0 - 34, { size: 13, wt: 700, col: k.red, halo: k.bg }); }
        else text(ctx, 'they meet only lying flat', (x0 + x1) / 2, y0 - 36, { size: 13, wt: 700, col: k.red, halo: k.bg });
      }
      dot(ctx, x0, y0, 4, k.ink); dot(ctx, x1, y0, 4, k.ink);
      var s = 'Shortest two: ' + s1 + ' + ' + s2 + ' = <b>' + (s1 + s2) + '</b>; longest: <b>' + base + '</b>. ';
      s += ok ? '<span class="g7v-ok">' + (s1 + s2) + ' > ' + base + ': the two short sticks reach each other, so these lengths make exactly one triangle.</span>' : flat ? '<span class="g7v-no">They add to exactly ' + base + ', so they lie flat on the longest stick. No triangle.</span>' : '<span class="g7v-no">' + (s1 + s2) + ' < ' + base + ': the short sticks cannot reach each other. No triangle.</span>';
      out.set(s);
    }
    var row = controls(F);
    ['a', 'b', 'c'].forEach(function (nm, i) { V.slider(row, { label: 'Stick ' + (i + 1), min: 1, max: 15, step: 1, value: L3[i], input: function (v) { L3[i] = v; draw(); } }); });
    redrawOn(F, draw); draw();
    return { draw: draw };
  });
  /* ============================================================ g7-slice */
  V.register('g7-slice', function (el0, o) {
    var solid = o.solid || 'prism', cut = o.cut || 'base', pos = o.pos != null ? +o.pos : 0.5, tilt = o.tilt != null ? +o.tilt : 30;
    var dims = { l: +o.l || 4, w: +o.w || 3, h: +o.h || 3 };
    var yaw = cut === 'corner' ? 3.75 : -0.6, pitch = 0.42;
    var F = frame(el0, o, 'A solid sliced by a plane, with the shape of the cross-section.', { aspect: 1.75, max: 330, min: 300 });
    F.c.cv.tabIndex = 0;
    var out = readout(F);
    function build() {
      var V3 = [], E = [], Fc = [];
      if (solid === 'pyramid') {
        var s = dims.l, H = dims.h * 1.25;
        V3 = [[-s / 2, -s / 2, 0], [s / 2, -s / 2, 0], [s / 2, s / 2, 0], [-s / 2, s / 2, 0], [0, 0, H]];
        Fc = [[0, 3, 2, 1], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
      } else {
        var l = solid === 'cube' ? dims.h : dims.l, w = solid === 'cube' ? dims.h : dims.w, h = dims.h;
        V3 = [[-l / 2, -w / 2, 0], [l / 2, -w / 2, 0], [l / 2, w / 2, 0], [-l / 2, w / 2, 0], [-l / 2, -w / 2, h], [l / 2, -w / 2, h], [l / 2, w / 2, h], [-l / 2, w / 2, h]];
        Fc = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
      }
      Fc.forEach(function (f) { for (var i = 0; i < f.length; i++) { var a = f[i], b = f[(i + 1) % f.length], key = M.min(a, b) + '-' + M.max(a, b); if (!E.some(function (e) { return e.k === key; })) E.push({ k: key, a: M.min(a, b), b: M.max(a, b) }); } });
      return { V: V3, E: E, F: Fc };
    }
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    function norm(a) { var L = M.hypot(a[0], a[1], a[2]) || 1; return [a[0] / L, a[1] / L, a[2] / L]; }
    function plane(S) {
      var zs = S.V.map(function (p) { return p[2]; }), top = M.max.apply(null, zs), xs = S.V.map(function (p) { return p[0]; }), xmax = M.max.apply(null, xs);
      var p = M.max(0.04, M.min(0.96, pos));
      if (cut === 'side') return { n: [1, 0, 0], c: (p - 0.5) * 2 * xmax * 0.999 };
      if (cut === 'tilt') { var t = tilt * PI / 180, n = [M.sin(t), 0, M.cos(t)]; return { n: n, c: dot3(n, [0, 0, p * top]) }; }
      if (cut === 'corner') { var n2 = norm([1, 1, 1]), ds = S.V.map(function (q) { return dot3(n2, q); }), hi = M.max.apply(null, ds), lo = M.min.apply(null, ds); return { n: n2, c: hi - p * (hi - lo) }; }
      return { n: [0, 0, 1], c: p * top };
    }
    function section(S, P) {
      var pts = [];
      function add(q) { if (!pts.some(function (r) { return M.hypot(r[0] - q[0], r[1] - q[1], r[2] - q[2]) < 1e-7; })) pts.push(q); }
      S.E.forEach(function (e) {
        var A = S.V[e.a], B = S.V[e.b], dA = dot3(P.n, A) - P.c, dB = dot3(P.n, B) - P.c;
        if (M.abs(dA) < 1e-9) add(A); if (M.abs(dB) < 1e-9) add(B);
        if (dA * dB < 0) { var t = dA / (dA - dB); add([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1]), A[2] + t * (B[2] - A[2])]); }
      });
      if (pts.length < 3) return [];
      var cen = [0, 0, 0]; pts.forEach(function (q) { cen[0] += q[0] / pts.length; cen[1] += q[1] / pts.length; cen[2] += q[2] / pts.length; });
      var u = norm(M.abs(P.n[2]) > 0.9 ? cross(P.n, [0, 1, 0]) : cross(P.n, [0, 0, 1])), v = cross(P.n, u);
      if (v[2] < -1e-9) v = [-v[0], -v[1], -v[2]]; // keep "up" in the solid as up in the face-on picture
      var two = pts.map(function (q) { var d = sub(q, cen); return { p: q, x: dot3(d, u), y: dot3(d, v) }; });
      two.sort(function (a, b) { return M.atan2(a.y, a.x) - M.atan2(b.y, b.x); });
      return two;
    }
    function name(two) {
      var n = two.length; if (n < 3) return '';
      var sides = two.map(function (p, i) { var q = two[(i + 1) % n]; return [q.x - p.x, q.y - p.y]; }), lens = sides.map(function (s) { return M.hypot(s[0], s[1]); });
      var eq = function (a, b) { return M.abs(a - b) < 1e-6 * M.max(1, a, b); };
      if (n === 3) return lens.every(function (L) { return eq(L, lens[0]); }) ? 'an equilateral triangle' : eq(lens[0], lens[1]) || eq(lens[1], lens[2]) || eq(lens[0], lens[2]) ? 'an isosceles triangle' : 'a triangle';
      if (n === 4) {
        var par = function (a, b) { return M.abs(a[0] * b[1] - a[1] * b[0]) < 1e-6 * M.hypot(a[0], a[1]) * M.hypot(b[0], b[1]); };
        var p1 = par(sides[0], sides[2]), p2 = par(sides[1], sides[3]), right = M.abs(sides[0][0] * sides[1][0] + sides[0][1] * sides[1][1]) < 1e-6 * lens[0] * lens[1];
        if (p1 && p2 && right) return eq(lens[0], lens[1]) ? 'a square' : 'a rectangle';
        if (p1 && p2) return 'a parallelogram';
        if (p1 || p2) return 'a trapezoid';
        return 'a quadrilateral';
      }
      return n === 5 ? 'a pentagon' : n === 6 ? 'a hexagon' : 'a polygon with ' + n + ' sides';
    }
    function draw() {
      var c = F.c, ctx = F.ctx, k = V.colors(), w = c.w, h = c.h, S = build(), P = plane(S), sec = section(S, P);
      ctx.clearRect(0, 0, w, h);
      var wide = w >= 420, solW = wide ? w * 0.6 : w, solH = wide ? h : h * 0.68;
      var cy0 = M.cos(yaw), sy0 = M.sin(yaw), cp = M.cos(pitch), sp2 = M.sin(pitch);
      function rot(p) { var x1 = p[0] * cy0 - p[1] * sy0, y1 = p[0] * sy0 + p[1] * cy0; return [x1, p[2] * cp + y1 * sp2, y1 * cp - p[2] * sp2]; }
      var R3 = S.V.map(rot), ex = R3.map(function (p) { return p[0]; }), ey = R3.map(function (p) { return p[1]; });
      var span = M.max(M.max.apply(null, ex) - M.min.apply(null, ex), M.max.apply(null, ey) - M.min.apply(null, ey)), sc = M.min(solW, solH) * 0.78 / span;
      var mxv = (M.max.apply(null, ex) + M.min.apply(null, ex)) / 2, myv = (M.max.apply(null, ey) + M.min.apply(null, ey)) / 2;
      function scr(p) { var r = rot(p); return [solW / 2 + (r[0] - mxv) * sc, solH / 2 - (r[1] - myv) * sc]; }
      // a face is toward the viewer when its outward normal, turned like the solid, points out of the screen (negative depth)
      var front = S.F.map(function (f) { var a = S.V[f[0]], b = S.V[f[1]], cc = S.V[f[2]]; return rot(cross(sub(b, a), sub(cc, a)))[2] < 0; });
      // faces: back ones first, faint
      S.F.forEach(function (f, i) { if (!front[i]) poly(ctx, f.map(function (j) { return scr(S.V[j]); }), k.blueSoft, null); });
      // edges: hidden ones dashed
      S.E.forEach(function (e) {
        var vis = S.F.some(function (f, i) { return front[i] && f.indexOf(e.a) >= 0 && f.indexOf(e.b) >= 0; });
        var A = scr(S.V[e.a]), B = scr(S.V[e.b]); line(ctx, A[0], A[1], B[0], B[1], vis ? k.blue : k.muted, vis ? 2 : 1.2, vis ? null : [5, 5]);
      });
      if (sec.length >= 3) { poly(ctx, sec.map(function (q) { return scr(q.p); }), 'rgba(184,150,62,.55)', k.gold, 2.5); }
      S.F.forEach(function (f, i) { if (front[i]) poly(ctx, f.map(function (j) { return scr(S.V[j]); }), 'rgba(28,111,214,.06)', null); });
      // the true shape
      var nm = name(sec);
      if (sec.length >= 3) {
        var bx = wide ? solW : 0, by = wide ? 0 : solH, bw = wide ? w - solW : w, bh = wide ? h : h - solH;
        var xs = sec.map(function (q) { return q.x; }), ys = sec.map(function (q) { return q.y; }), sp = M.max(M.max.apply(null, xs) - M.min.apply(null, xs), M.max.apply(null, ys) - M.min.apply(null, ys), 1e-6);
        var s2 = M.min(bw * 0.7, bh * 0.62) / sp, cx = bx + bw / 2, cy = by + bh / 2 + 6, mx2 = (M.max.apply(null, xs) + M.min.apply(null, xs)) / 2, my2 = (M.max.apply(null, ys) + M.min.apply(null, ys)) / 2;
        poly(ctx, sec.map(function (q) { return [cx + (q.x - mx2) * s2, cy - (q.y - my2) * s2]; }), 'rgba(184,150,62,.45)', k.gold, 2.5);
        text(ctx, 'cross-section, face on', cx, by + 14, { size: 12, col: k.muted });
      }
      var cutTxt = { base: 'parallel to the base', side: 'straight down, perpendicular to the base', tilt: 'tilted at ' + tilt + '°', corner: 'across a corner' }[cut];
      out.set('A ' + (solid === 'pyramid' ? 'square pyramid' : solid === 'cube' ? 'cube' : 'right rectangular prism') + ' sliced ' + cutTxt + '. The cross-section is <b>' + (nm || 'not there: the plane misses the solid') + '</b>.' + (sec.length >= 3 ? ' It has ' + sec.length + ' sides, one for each face the plane cuts.' : '') + ' Drag the picture to turn it.');
    }
    // turning
    var last = null;
    F.c.cv.addEventListener('pointerdown', function (e) { last = [e.clientX, e.clientY]; try { F.c.cv.setPointerCapture(e.pointerId); } catch (er) { } });
    F.c.cv.addEventListener('pointermove', function (e) { if (!last) return; yaw += (e.clientX - last[0]) * 0.01; pitch = M.max(0.08, M.min(1.3, pitch + (e.clientY - last[1]) * 0.008)); last = [e.clientX, e.clientY]; draw(); });
    ['pointerup', 'pointercancel'].forEach(function (t) { F.c.cv.addEventListener(t, function () { last = null; }); });
    F.c.cv.style.touchAction = 'pan-y';
    F.c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] }[e.key]; if (!d) return; e.preventDefault(); yaw += d[0]; pitch = M.max(0.08, M.min(1.3, pitch + d[1])); draw(); });
    var row = controls(F);
    if (o.pick !== false) {
      V.seg(row, { label: 'Solid', items: [['prism', 'Box'], ['cube', 'Cube'], ['pyramid', 'Pyramid']], value: solid, change: function (v) { solid = v; draw(); } });
      V.seg(row, { label: 'Cut', items: [['base', 'Parallel to base'], ['side', 'Straight down'], ['tilt', 'Tilted'], ['corner', 'Corner']], value: cut, change: function (v) { cut = v; tiltS.el.hidden = cut !== 'tilt'; if (cut === 'corner') yaw = 3.75; draw(); } });
    }
    V.slider(row, { label: 'Where the plane cuts', min: 0.05, max: 0.95, step: 0.05, value: pos, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { pos = v; draw(); } });
    var tiltS = V.slider(row, { label: 'Tilt', min: 5, max: 80, step: 5, value: tilt, fmt: function (v) { return v + '°'; }, input: function (v) { tilt = v; draw(); } });
    tiltS.el.hidden = cut !== 'tilt';
    redrawOn(F, draw); draw();
    return { draw: draw };
  });

  /* ============================================================ g7-bias */
  V.register('g7-bias', function (el0, o) {
    var cols = 20, rows = 10, near = M.max(1, M.min(8, parseInt(o.near, 10) || 4)), size = parseInt(o.size, 10) || 20;
    var yesNear = o.yesNear != null ? +o.yesNear : 0.8, yesFar = o.yesFar != null ? +o.yesFar : 0.2, place = o.place || 'the skate shop';
    var seed = 12345; function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    var people = [];
    for (var c = 0; c < cols; c++) for (var r = 0; r < rows; r++) people.push({ c: c, r: r, near: c < near });
    // exact shares: shuffle within each group, then mark the first share as "yes"
    [true, false].forEach(function (g) { var grp = people.filter(function (p) { return p.near === g; }); grp.forEach(function (p) { p.k = rnd(); }); grp.sort(function (a, b) { return a.k - b.k; }); var n = M.round(grp.length * (g ? yesNear : yesFar)); grp.forEach(function (p, i) { p.yes = i < n; }); });
    var popYes = people.filter(function (p) { return p.yes; }).length, picked = [], hist = { rand: [], conv: [] }, last = '';
    var F = frame(el0, o, 'A town of ' + people.length + ' people. Each dot is one person; green dots answer yes.', { aspect: 2, max: 260, min: 190 });
    var out = readout(F);
    function draw() {
      var cv = F.c, ctx = F.ctx, k = V.colors(), w = cv.w, h = cv.h, top = 22, cell = M.min((w - 20) / cols, (h - top - 8) / rows), x0 = (w - cell * cols) / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = k.goldSoft; ctx.fillRect(x0 - 2, top - 2, cell * near + 4, cell * rows + 4);
      text(ctx, 'near ' + place, x0, 10, { size: 11, wt: 700, col: k.gold, al: 'left' });
      text(ctx, '● yes   ○ no', x0 + cell * cols, 10, { size: 11, wt: 600, col: k.muted, al: 'right' });
      people.forEach(function (p) {
        var cx = x0 + (p.c + 0.5) * cell, cy = top + (p.r + 0.5) * cell;
        if (p.yes) dot(ctx, cx, cy, cell * 0.3, k.green);
        else { ctx.beginPath(); ctx.arc(cx, cy, cell * 0.26, 0, 2 * PI); ctx.strokeStyle = k.muted; ctx.lineWidth = 1.2; ctx.stroke(); }
      });
      picked.forEach(function (p) { var cx = x0 + (p.c + 0.5) * cell, cy = top + (p.r + 0.5) * cell; ctx.beginPath(); ctx.arc(cx, cy, cell * 0.44, 0, 2 * PI); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.stroke(); });
      var s = 'In the whole town, <b>' + M.round(popYes / people.length * 100) + '%</b> say yes.';
      if (picked.length) { var y = picked.filter(function (p) { return p.yes; }).length; s += ' This sample: ' + y + ' of ' + picked.length + ' say yes, <b>' + M.round(y / picked.length * 100) + '%</b> (' + last + ').'; }
      if (hist.rand.length) s += '<br>Random samples so far: ' + hist.rand.slice(-8).join('%, ') + '%.';
      if (hist.conv.length) s += '<br>Samples near ' + place + ': ' + hist.conv.slice(-8).join('%, ') + '%.';
      out.set(s);
    }
    function record(kind) { var y = picked.filter(function (p) { return p.yes; }).length; hist[kind].push(M.round(y / picked.length * 100)); }
    var row = controls(F);
    V.button(row, 'Random sample', function () { var pool = people.slice(); picked = []; for (var i = 0; i < size; i++) { var j = M.floor(M.random() * pool.length); picked.push(pool.splice(j, 1)[0]); } last = 'random'; record('rand'); draw(); }, 'pri');
    V.button(row, 'Ask near ' + place, function () { picked = people.slice(0, size); last = 'only people near ' + place; record('conv'); draw(); });
    V.slider(row, { label: 'Sample size', min: 10, max: 80, step: 10, value: size, input: function (v) { size = v; } });
    redrawOn(F, draw); draw();
    return { draw: draw };
  });

  /* ------------------------------------------------------------ test hooks (node) */
  ML.__g7viz = { rat: rat, qtxt: qtxt };
})(window, document);
