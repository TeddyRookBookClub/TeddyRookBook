/* Course visuals for draw, merged from part files by /tmp/merge_parts.js. */
/* ---- part A ---- */
/* Drawing Basics (draw), part A: one course visual on top of the Art kit (static/art/viz/art.js + art.css).
   draw-pics   small pencil-on-paper pictures in lettered cards, for the mistakes the kit has no picture of. The paper stays
               cream in both themes (graphite on paper), the cards follow the theme. Every card is lettered A, B, C… in the
               order of `items`; a generator's answer index matches that order. Options:
     kind: 'xcontour'  items: [{ form: 'sphere' | 'cylinder' | 'cone', lines: 'wrap' | 'flat' }]  cross-contour lines that curve
                       with the surface, or straight lines across (the mistake)
           'box'       items: [{ v: 'parallel' | 'converge' | 'diverge', p: 0 | 1 | 2 (a cube-like box, a tall box,
                       a flat slab) }]  a box whose back edges stay parallel, come together, or spread apart (the warped mistake)
           'cup'       items: [{ v: 'good' | 'flat' | 'pointed' }]  a cup below eye level: good ellipses, a flat bottom, or an
                       ellipse with pointed ends
           'plates'    items: [{ y: 0–1 }] plates (circles seen at an angle) at heights; horizon: 0–1; showHorizon: true
           'neg'       object: 'chair' | 'mug' | 'stool'; spots: [[x, y], …] lettered dots (in the 200 × 160 picture)
           'scale'     rows: [[hex | '?', …], …] value strips, lettered when there are several; choices: [hex, …] (lettered
                       swatches under a single strip with a "?")
           'marks'     items: [{ k: 'hatch' | 'cross' | 'stipple' | 'dash' | 'messy' | 'smooth', d: 0–1 (density; for 'cross'
                       the spacing of each layer), layers: 1–3 }]
           'lit'       items: [{ form: 'sphere' | 'cube' | 'cylinder', light: degrees (0 right, 90 above, 180 left), cast:
                       'ok' | 'wrong' (toward the light) | 'gap' (the object floats) | 'none', ring: true (a dark ring all
                       around: the flat-disc mistake) }]; sun: true draws the light
           'planes'    items: [{ v: 'flat' | 'blend' }]  a box with one even value per plane, or tone blended across the edges
           'angle'     deg (the edge's tilt from horizontal, 5–85); ref: false hides the dashed level line
           'plumb'     dots: [[x, y], …] lettered points on a still life (240 × 170 picture); ref: [x, y] (point P);
                       line: true draws the plumb line through P
     caps: ['…', …] short captions under the cards (not in quiet mode); quiet: letters only; label: aria-label; caption.  */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, V = ML && ML.viz; if (!D || !V || !V.register) return;
  var NS = 'http://www.w3.org/2000/svg', M = Math, INK = '#2a2724', PAPER = '#fbf8f1', ACC = '#b8197f';
  if (!D.getElementById('draw-a-css')) {
    var st = D.createElement('style'); st.id = 'draw-a-css';
    st.textContent = '.arv-dpics .dp-grid{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:.55rem}' +
      '@media (max-width:560px){.arv-dpics .dp-grid{grid-template-columns:repeat(min(var(--n,3),2),minmax(0,1fr))}.arv-dpics .dp-grid.dp-one{grid-template-columns:1fr}}' +
      '.arv-dpics .dp-grid.dp-one{grid-template-columns:1fr;max-width:460px;margin:0 auto}' +
      '.arv-dpics svg{width:100%;height:auto;display:block;border-radius:8px}' +
      '.arv-dpics .dp-cap{font:400 .8rem system-ui,sans-serif;color:var(--mv-muted);text-align:center;line-height:1.3}';
    D.head.appendChild(st);
  }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, p) { var e = D.createElementNS(NS, tag); for (var k in at) if (at[k] != null) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; }
  function root(w, h, label) { var s = sv('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': label, focusable: 'false' }); sv('rect', { x: 0, y: 0, width: w, height: h, rx: 8, fill: PAPER }, s); return s; }
  function letter(i) { return String.fromCharCode(65 + i); }
  function seeded(n) { var x = (n * 2654435761) >>> 0 || 1; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  var uid = 0;
  function grad(s, kind, at, stops) { var defs = s.querySelector('defs') || sv('defs', {}, s), id = 'dpg' + (++uid), g = sv(kind, Object.assign({ id: id }, at), defs); stops.forEach(function (q) { sv('stop', { offset: q[0], 'stop-color': q[1] }, g); }); return 'url(#' + id + ')'; }
  function line(s, x1, y1, x2, y2, w, col, extra) { return sv('line', Object.assign({ x1: x1, y1: y1, x2: x2, y2: y2, stroke: col || INK, 'stroke-width': w || 1.6, 'stroke-linecap': 'round' }, extra || {}), s); }
  function path(s, d, at) { return sv('path', Object.assign({ d: d, fill: 'none', stroke: INK, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, at || {}), s); }
  function badge(s, x, y, t, col) { sv('circle', { cx: x, cy: y, r: 9, fill: col || ACC, stroke: '#fff', 'stroke-width': 1.5 }, s); var tx = sv('text', { x: x, y: y + 4, 'text-anchor': 'middle', fill: '#fff', 'font-size': 11, 'font-weight': 700, 'font-family': 'system-ui,sans-serif' }, s); tx.textContent = t; }
  function gray(v) { var g = M.round(255 * (1 - v)); return 'rgb(' + g + ',' + (g - 3 < 0 ? 0 : g - 3) + ',' + (g - 8 < 0 ? 0 : g - 8) + ')'; }

  // ------------------------------------------------------------------ the pictures (each draws into a 200 × 160 card)
  function xcontour(s, it) {
    var wrap = it.lines !== 'flat', f = it.form || 'sphere', c = M.cos, i;
    if (f === 'sphere') {
      sv('circle', { cx: 100, cy: 80, r: 58, fill: '#f1ece2', stroke: INK, 'stroke-width': 2 }, s);
      [-0.62, -0.31, 0, 0.31, 0.62].forEach(function (t) { var y = 80 + t * 58, hw = 58 * M.sqrt(1 - t * t); path(s, wrap ? 'M' + (100 - hw) + ',' + y + ' A' + hw + ',' + (hw * 0.3) + ' 0 0 0 ' + (100 + hw) + ',' + y : 'M' + (100 - hw) + ',' + y + ' L' + (100 + hw) + ',' + y, { 'stroke-width': 1.4 }); });
      [0.45, -0.45].forEach(function (k) { path(s, wrap ? 'M100,22 A' + M.abs(58 * k) + ',58 0 0 ' + (k > 0 ? 1 : 0) + ' 100,138' : 'M' + (100 + k * 40) + ',' + (80 - 58 * M.sqrt(1 - k * k * 0.48)) + ' L' + (100 + k * 40) + ',' + (80 + 58 * M.sqrt(1 - k * k * 0.48)), { 'stroke-width': 1.4 }); });
      path(s, wrap ? 'M100,22 L100,138' : 'M100,22 L100,138', { 'stroke-width': 1.4 });
    } else if (f === 'cylinder') {
      sv('rect', { x: 55, y: 28, width: 90, height: 104, fill: '#f1ece2' }, s);
      sv('ellipse', { cx: 100, cy: 28, rx: 45, ry: 12, fill: '#f6f2ea', stroke: INK, 'stroke-width': 2 }, s);
      line(s, 55, 28, 55, 132, 2); line(s, 145, 28, 145, 132, 2); path(s, 'M55,132 A45,12 0 0 0 145,132', { 'stroke-width': 2 });
      for (i = 0; i < 4; i++) { var y = 50 + i * 21; path(s, wrap ? 'M55,' + y + ' A45,12 0 0 0 145,' + y : 'M55,' + y + ' L145,' + y, { 'stroke-width': 1.4 }); }
    } else { // cone
      sv('path', { d: 'M100,18 L50,128 A50,13 0 0 0 150,128 Z', fill: '#f1ece2', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, s);
      for (i = 1; i <= 4; i++) { var t = i / 5, y2 = 18 + 110 * t, r = 50 * t; path(s, wrap ? 'M' + (100 - r) + ',' + y2 + ' A' + r + ',' + (13 * t) + ' 0 0 0 ' + (100 + r) + ',' + y2 : 'M' + (100 - r) + ',' + y2 + ' L' + (100 + r) + ',' + y2, { 'stroke-width': 1.4 }); }
    }
  }
  function box(s, it) {
    var k = it.v === 'converge' ? 0.74 : it.v === 'diverge' ? 1.42 : 1, P = [[34, 66, 82, 70, 46, -36], [52, 52, 56, 92, 40, -30], [26, 92, 104, 36, 44, -40]][it.p || 0], fx = P[0], fy = P[1], fw = P[2], fh = P[3], dx = P[4], dy = P[5];
    var cx = fx + fw / 2 + dx, cy = fy + fh / 2 + dy, bw = fw * k, bh = fh * k;
    var F = [[fx, fy], [fx + fw, fy], [fx + fw, fy + fh], [fx, fy + fh]], B = [[cx - bw / 2, cy - bh / 2], [cx + bw / 2, cy - bh / 2], [cx + bw / 2, cy + bh / 2], [cx - bw / 2, cy + bh / 2]];
    function poly(pts, fill) { sv('polygon', { points: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: fill, stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, s); }
    poly([F[0], F[1], B[1], B[0]], '#ece6da'); poly([F[1], B[1], B[2], F[2]], '#bdb4a5'); poly(F, '#d8d0c2');
  }
  function cup(s, it) {
    var v = it.v || 'good';
    sv('path', { d: 'M55,40 L64,130 A36,14 0 0 0 136,130 L145,40 Z', fill: '#efe9de' }, s);
    line(s, 55, 40, 64, 130, 2); line(s, 145, 40, 136, 130, 2);
    if (v === 'flat') line(s, 64, 130, 136, 130, 2); else path(s, 'M64,130 A36,14 0 0 0 136,130', { 'stroke-width': 2 });
    if (v === 'pointed') sv('path', { d: 'M55,40 Q100,22 145,40 Q100,58 55,40 Z', fill: '#f7f3eb', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'miter' }, s);
    else sv('ellipse', { cx: 100, cy: 40, rx: 45, ry: 9, fill: '#f7f3eb', stroke: INK, 'stroke-width': 2 }, s);
    path(s, 'M143,58 C172,58 172,100 139,102', { 'stroke-width': 6, stroke: '#cfc6b6' }); path(s, 'M143,58 C172,58 172,100 139,102', { 'stroke-width': 1.6 });
  }
  function plates(s, o, w, h) {
    var hz = o.horizon === undefined ? 0.5 : o.horizon, items = o.items || [], n = items.length;
    if (o.showHorizon) { line(s, 6, 16 + hz * (h - 32), w - 6, 16 + hz * (h - 32), 1.5, ACC, { 'stroke-dasharray': '6 5' }); var t = sv('text', { x: w - 8, 'text-anchor': 'end', y: 11 + hz * (h - 32), fill: ACC, 'font-size': 11, 'font-family': 'system-ui,sans-serif', 'font-weight': 600 }, s); t.textContent = 'eye level'; }
    items.forEach(function (it, i) {
      var cx = (i + 0.5) * w / n + 8, cy = 16 + it.y * (h - 32), rx = M.min(34, w / n / 2 - 18), ry = rx * ratio(it.y, hz);
      sv('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: '#f1ece2', stroke: INK, 'stroke-width': 2 }, s);
      badge(s, cx - rx - 11, cy, letter(i));
    });
  }
  function ratio(y, hz) { return M.min(0.92, 0.05 + 1.25 * M.abs(y - hz)); }
  var OBJ = {
    chair: function (s) { var g = '#8d939b', g2 = '#a9aeb5'; [[57, 94, 7, 38, g2], [136, 94, 7, 38, g2], [56, 10, 9, 70, g], [135, 10, 9, 70, g], [65, 10, 70, 13, g], [65, 44, 70, 9, g], [40, 94, 10, 52, g], [150, 94, 10, 52, g], [50, 124, 100, 5, g]].forEach(function (r) { sv('rect', { x: r[0], y: r[1], width: r[2], height: r[3], rx: 2, fill: r[4] }, s); }); sv('polygon', { points: '40,94 160,94 146,78 54,78', fill: '#7d838b' }, s); },
    mug: function (s) { var g = '#8d939b'; sv('rect', { x: 46, y: 36, width: 82, height: 100, rx: 8, fill: g }, s); sv('path', { d: 'M126,58 C176,52 176,122 126,114', fill: 'none', stroke: g, 'stroke-width': 13 }, s); },
    stool: function (s) { var g = '#8d939b'; sv('rect', { x: 40, y: 26, width: 120, height: 16, rx: 4, fill: g }, s); sv('polygon', { points: '52,42 64,42 46,146 34,146', fill: g }, s); sv('polygon', { points: '136,42 148,42 166,146 154,146', fill: g }, s); sv('rect', { x: 52, y: 100, width: 96, height: 7, fill: g }, s); }
  };
  function neg(s, o) { (OBJ[o.object] || OBJ.chair)(s); (o.spots || []).forEach(function (p, i) { badge(s, p[0], p[1], letter(i)); }); }
  function scale(s, o, w) {
    var rows = o.rows || [], cw = (w - 40) / M.max.apply(null, rows.map(function (r) { return r.length; }).concat([1])), y = 10, multi = rows.length > 1;
    rows.forEach(function (r, ri) {
      r.forEach(function (c, i) { var x = (multi ? 30 : 20) + i * cw * (multi ? (w - 50) / (w - 40) : 1); if (c === '?') { sv('rect', { x: x, y: y, width: cw - 2, height: 36, fill: '#fff', stroke: INK, 'stroke-dasharray': '4 3' }, s); var t = sv('text', { x: x + cw / 2 - 1, y: y + 24, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: INK, 'font-family': 'system-ui,sans-serif' }, s); t.textContent = '?'; } else sv('rect', { x: x, y: y, width: cw - 2, height: 36, fill: c, stroke: '#b9b2a6', 'stroke-width': 0.8 }, s); });
      if (multi) badge(s, 15, y + 18, letter(ri));
      y += 48;
    });
    if (o.choices) { y += 6; var n = o.choices.length, sw = M.min(56, (w - 40) / n); o.choices.forEach(function (c, i) { var x = w / 2 - n * sw / 2 + i * sw + 6; sv('rect', { x: x, y: y, width: sw - 12, height: 34, fill: c, stroke: '#b9b2a6', 'stroke-width': 0.8 }, s); badge(s, x + (sw - 12) / 2, y + 48, letter(i)); }); }
  }
  function scaleH(o) { return 10 + (o.rows || []).length * 48 + (o.choices ? 70 : 0); }
  function marks(s, it, idx) {
    var R = seeded(idx * 977 + M.round((it.d || 0.5) * 100) + (it.layers || 1) * 31 + (it.k || '').length * 7), d = it.d === undefined ? 0.5 : it.d, k = it.k || 'hatch', i;
    var cl = 'dpc' + (++uid); sv('rect', { x: 14, y: 14, width: 172, height: 132, fill: 'none', stroke: '#c9c2b4' }, s); var clip = sv('clipPath', { id: cl }, sv('defs', {}, s)); sv('rect', { x: 14, y: 14, width: 172, height: 132 }, clip);
    var g = sv('g', { 'clip-path': 'url(#' + cl + ')' }, s);
    function hatch(ang, sp) { var c = M.cos(ang), sn = M.sin(ang); for (var t = -260; t < 260; t += sp) { var j = (R() - 0.5) * 1.4; line(g, 100 - sn * t - c * 200 + j, 80 + c * t - sn * 200, 100 - sn * t + c * 200 + j, 80 + c * t + sn * 200, 1.3); } }
    var sp = 15 - d * 11;
    if (k === 'hatch') hatch(-M.PI / 4, sp);
    else if (k === 'cross') { var L = it.layers || 2, angs = [-M.PI / 4, M.PI / 4, 0]; for (i = 0; i < L; i++) hatch(angs[i], it.d === undefined ? 9 : 12 - it.d * 6); }
    else if (k === 'stipple') { var n = M.round(60 + d * 900); for (i = 0; i < n; i++) sv('circle', { cx: 14 + R() * 172, cy: 14 + R() * 132, r: 1.25, fill: INK }, g); }
    else if (k === 'dash') { for (i = 0; i < 260; i++) { var x = 14 + R() * 172, y = 14 + R() * 132, a = R() * 6.28; line(g, x, y, x + M.cos(a) * 6, y + M.sin(a) * 6, 1.3); } }
    else if (k === 'messy') { for (i = 0; i < 70; i++) { var x2 = 14 + R() * 172, y2 = 14 + R() * 132, a2 = R() * 6.28, l = 18 + R() * 26; line(g, x2, y2, x2 + M.cos(a2) * l, y2 + M.sin(a2) * l, 1.3); } }
    else if (k === 'smooth') sv('rect', { x: 14, y: 14, width: 172, height: 132, fill: grad(s, 'linearGradient', { x1: 0, x2: 1, y1: 0, y2: 0 }, [[0, gray(0.05)], [1, gray(0.75)]]) }, g);
  }
  function lit(s, it, o) {
    var a = (it.light === undefined ? 135 : it.light) * M.PI / 180, lx = M.cos(a), ly = -M.sin(a), f = it.form || 'sphere', gy = 120, cast = it.cast || 'ok';
    sv('rect', { x: 0, y: gy, width: 200, height: 40, fill: '#e6dfd1' }, s);
    var lift = cast === 'gap' ? 22 : 0, r = 40, cx = 100, cy = gy - r - lift;
    if (cast !== 'none') { var away = (cast === 'wrong' ? 1 : -1) * (lx >= 0 ? 1 : -1), len = r * (1.05 + 0.8 * M.max(0, 1 - M.abs(ly))), sx = cx + away * len * 0.7; sv('ellipse', { cx: sx, cy: gy + 4, rx: len, ry: 7, fill: grad(s, 'radialGradient', { cx: away > 0 ? 0.2 : 0.8, cy: 0.5, r: 0.85 }, [[0, 'rgba(30,25,20,.75)'], [1, 'rgba(30,25,20,0)']]) }, s); }
    if (f === 'sphere') {
      if (it.ring) { sv('circle', { cx: cx, cy: cy, r: r, fill: '#cfc8ba', stroke: '#3b3630', 'stroke-width': 8 }, s); }
      else {
        sv('circle', { cx: cx, cy: cy, r: r, fill: grad(s, 'radialGradient', { cx: 0.5 - lx * 0.12, cy: 0.5 - ly * 0.12, fx: 0.5 + lx * 0.28, fy: 0.5 + ly * 0.28, r: 0.62 }, [[0, '#fdfcf8'], [0.32, '#d8d1c3'], [0.72, '#6a6358'], [0.86, '#4a443c'], [1, '#7a7368']]) }, s);
        sv('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: 'rgba(40,35,30,.35)' }, s);
      }
    } else if (f === 'cube') {
      var sz = 62, x0 = cx - sz * 0.62, y0 = gy - sz - lift, dx = sz * 0.5, dy = sz * 0.32, V3 = cubeValues(it.light);
      function q(pts, v) { sv('polygon', { points: pts.map(function (p) { return p.join(','); }).join(' '), fill: gray(v), stroke: 'rgba(40,35,30,.5)', 'stroke-linejoin': 'round' }, s); }
      q([[x0, y0], [x0 + sz, y0], [x0 + sz, y0 + sz], [x0, y0 + sz]], V3.front); q([[x0 + sz, y0], [x0 + sz + dx, y0 - dy], [x0 + sz + dx, y0 - dy + sz], [x0 + sz, y0 + sz]], V3.side); q([[x0, y0], [x0 + dx, y0 - dy], [x0 + sz + dx, y0 - dy], [x0 + sz, y0]], V3.top);
    } else {
      var rw = 30, top = gy - 92 - lift, lit2 = lx >= 0, gr = grad(s, 'linearGradient', { x1: 0, x2: 1, y1: 0, y2: 0 }, lit2 ? [[0, '#6a6359'], [0.18, '#4d473f'], [0.5, '#a39b8e'], [0.8, '#f3f0e9'], [1, '#cfc8ba']] : [[0, '#cfc8ba'], [0.2, '#f3f0e9'], [0.5, '#a39b8e'], [0.82, '#4d473f'], [1, '#6a6359']]);
      sv('path', { d: 'M' + (cx - rw) + ',' + top + ' L' + (cx - rw) + ',' + (gy - lift) + ' A' + rw + ',8 0 0 0 ' + (cx + rw) + ',' + (gy - lift) + ' L' + (cx + rw) + ',' + top + ' Z', fill: gr }, s);
      sv('ellipse', { cx: cx, cy: top, rx: rw, ry: 8, fill: '#ece7dd', stroke: 'rgba(40,35,30,.4)' }, s);
    }
    if (o.sun) { var sx2 = M.max(14, M.min(186, cx + lx * 82)), sy2 = M.max(14, cy + ly * 60); sv('circle', { cx: sx2, cy: sy2, r: 8, fill: '#f6c445' }, s); }
  }
  // one even value per face: the face turned most toward the light is lightest (same rule the generators use)
  // (the front face faces the viewer, the side face faces right). Light from 0–180 degrees.
  function cubeValues(deg) {
    var d = deg === undefined ? 135 : deg;
    if (d >= 165) return { front: 0.12, top: 0.42, side: 0.75 };   // low from the left
    if (d <= 15) return { side: 0.12, top: 0.42, front: 0.75 };    // low from the right
    if (d > 90) return { top: 0.12, front: 0.38, side: 0.72 };     // upper left
    return { top: 0.12, side: 0.38, front: 0.72 };                 // upper right
  }
  function planes(s, it) {
    var x0 = 46, y0 = 58, sz = 70, dx = 36, dy = 24, blend = it.v === 'blend';
    var F = [[x0, y0], [x0 + sz, y0], [x0 + sz, y0 + sz], [x0, y0 + sz]], S = [[x0 + sz, y0], [x0 + sz + dx, y0 - dy], [x0 + sz + dx, y0 - dy + sz], [x0 + sz, y0 + sz]], T = [[x0, y0], [x0 + dx, y0 - dy], [x0 + sz + dx, y0 - dy], [x0 + sz, y0]];
    sv('ellipse', { cx: x0 + sz + 20, cy: y0 + sz + 6, rx: 60, ry: 8, fill: 'rgba(30,25,20,.35)' }, s);
    var g = blend ? grad(s, 'linearGradient', { x1: 0, y1: 0, x2: 1, y2: 1 }, [[0, '#f4f1ea'], [0.45, '#a8a092'], [1, '#4e483f']]) : null;
    [[T, '#efebe3'], [F, '#a9a194'], [S, '#57514a']].forEach(function (pv) { sv('polygon', { points: pv[0].map(function (p) { return p.join(','); }).join(' '), fill: blend ? g : pv[1], stroke: blend ? 'none' : 'rgba(40,35,30,.45)', 'stroke-linejoin': 'round' }, s); });
    if (blend) sv('polygon', { points: [T[0], T[1], T[2], S[2], S[3], F[3]].map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: 'rgba(40,35,30,.35)' }, s);
  }
  function angle(s, o) {
    var deg = o.deg || 30, a = deg * M.PI / 180, x0 = 40, y0 = 140, L = M.min(180, (y0 - 12) / M.sin(a));
    if (o.ref !== false) line(s, 20, y0, 228, y0, 1.4, ACC, { 'stroke-dasharray': '6 5' });
    sv('polygon', { points: x0 + ',' + y0 + ' ' + (x0 + L * M.cos(a)).toFixed(1) + ',' + (y0 - L * M.sin(a)).toFixed(1) + ' ' + (x0 + L * M.cos(a)).toFixed(1) + ',' + y0, fill: 'rgba(120,110,95,.12)' }, s);
    line(s, x0, y0, x0 + L * M.cos(a), y0 - L * M.sin(a), 3);
  }
  function plumb(s, o) {
    var g = '#cfc6b6';
    sv('rect', { x: 0, y: 140, width: 240, height: 30, fill: '#e6dfd1' }, s);
    sv('path', { d: 'M52,22 L68,22 L68,52 C80,56 80,62 80,70 L80,140 L40,140 L40,70 C40,62 40,56 52,52 Z', fill: g, stroke: INK, 'stroke-width': 1.6 }, s);
    sv('circle', { cx: 110, cy: 125, r: 15, fill: '#d9a39a', stroke: INK, 'stroke-width': 1.6 }, s); line(s, 110, 110, 112, 104, 2);
    sv('path', { d: 'M130,95 L130,140 L170,140 L170,95', fill: g, stroke: INK, 'stroke-width': 1.6 }, s); sv('ellipse', { cx: 150, cy: 95, rx: 20, ry: 5, fill: '#efe9de', stroke: INK, 'stroke-width': 1.6 }, s);
    path(s, 'M170,103 C192,103 192,128 170,128', { 'stroke-width': 5, stroke: g }); path(s, 'M170,103 C192,103 192,128 170,128', { 'stroke-width': 1.4 });
    if (o.ref) { if (o.line) line(s, o.ref[0], 4, o.ref[0], 166, 1.4, ACC, { 'stroke-dasharray': '5 4' }); badge(s, o.ref[0], o.ref[1], 'P', '#2160b8'); }
    (o.dots || []).forEach(function (p, i) { badge(s, p[0], p[1], letter(i)); });
  }

  V.register('draw-pics', function (host, o) {
    host.classList.add('arv', 'arv-dpics');
    var k = o.kind || 'box', quiet = !!o.quiet, label = o.label || 'Drawings, lettered';
    host.setAttribute('aria-label', label);
    if (o.task) host.appendChild(el('p', 'arv-task', o.task));
    var single = { plates: [320, 170], scale: [320, 0], angle: [240, 160], plumb: [240, 170], neg: [200, 160] }[k];
    var grid = el('div', 'dp-grid' + (single ? ' dp-one' : '')); host.appendChild(grid);
    if (single) {
      var w = single[0], h = k === 'scale' ? scaleH(o) : single[1], s = root(w, h, label), card = el('div', 'arl-card');
      ({ plates: plates, scale: scale, angle: angle, plumb: plumb, neg: neg })[k](s, o, w, h);
      card.appendChild(s); grid.appendChild(card);
    } else {
      var items = o.items || [{}]; grid.style.setProperty('--n', M.min(items.length, o.columns || 3)); if (items.length === 1) grid.classList.add('dp-one');
      items.forEach(function (it, i) {
        var card = el('div', 'arl-card'), s2 = root(200, 160, (quiet || items.length > 1 ? 'Drawing ' + letter(i) : 'A drawing'));
        ({ xcontour: xcontour, box: box, cup: cup, marks: marks, lit: lit, planes: planes })[k](s2, it, k === 'marks' ? i : o);
        card.appendChild(s2);
        if (items.length > 1) card.appendChild(el('span', 'arl-lab arl-letter', letter(i)));
        if (!quiet && o.caps && o.caps[i]) card.appendChild(el('span', 'dp-cap', o.caps[i]));
        grid.appendChild(card);
      });
    }
    if (o.caption) host.appendChild(el('p', 'ml-cap', o.caption));
    return {};
  });
})(window, typeof document !== 'undefined' ? document : null);

/* ---- part B ---- */
/* Drawing Basics (draw), part B (units 7 to 12): course visuals, prefixed draw-. They add what the kit (static/art/viz/art.js)
   cannot show: a clothed mannequin built from forms, cloth folds, still-life setups, shiny and see-through surfaces, leading
   lines, focal points, hands and noses. Built on math/viz/core.js; styles are injected here (classes drwb-*) and reuse the kit's
   art.css frame classes (arv, arl-grid, arl-card, arl-lab, arl-letter, arv-hint). Light and dark; no overflow at 360 px.
   Drawn people use the cartoon skin color (#ffcc4d, outline #e8a93a) and are always clothed.

   COMMON OPTIONS: quiet: true (letters instead of names, no hints that give an answer away), interactive: false, task, caption,
   label (aria-label).

   draw-pose     a clothed mannequin made of simple forms (egg head, box chest and hips, cylinder limbs, ball joints).
                 pose: 'stiff' | 'stand' | 'lean' | 'reach' | 'walk' | 'run' | 'throw' (or poses: [..] side by side, lettered
                 in quiet mode); loa: true draws the line of action (dashed); forms: true labels the forms (not in quiet);
                 wrong: index or [indexes] of figures drawn with the mistake: arms and legs bending between the joints like
                 rubber hoses, with no elbow or knee; colors vary by figure. POSES lists the poses with their line of action
                 ('straight' | 'C' | 'S') so generators and pictures agree: MathLadder.drawPoses.
   draw-cloth    cloth hanging from supports. kinds: ['one' (one pin: folds fan out from it) | 'two' (two pins: U-shaped folds
                 sag between them) | 'random' (the mistake: lines going nowhere) | 'sleeve' (a bent sleeve: folds on the inside of
                 the elbow)], lettered when there are several or in quiet mode; pin (0–1, where the one pin is); color.
   draw-still    still-life setups on a table. setups: ['good' | 'row' (lined up, evenly spaced, no overlap) | 'same' (all one
                 height) | 'top' (lit from straight above)], lettered when several; light: 'left' | 'right' for side light.
                 MathLadder.drawStill names each setup's problem.
   draw-surface  kinds: ['matte' | 'shiny' | 'glass' | 'glassgray' (the mistake: outlined and filled gray)], lettered when several;
                 color: the balls' hex color (default red).
   draw-lead     landscape thumbnails with a leading line. items: [{ line: 'road' | 'river' | 'fence', to: 'subject' | 'edge',
                 sx (house position 0–1) }], lettered.
   draw-focal    a field of shapes with one made the focal point. kind: 'contrast' | 'isolation' | 'detail' | 'lines';
                 seed; cands: 3 (lettered candidates; the target is one of them); target: index among the candidates (0–2).
   draw-hands    hands A and B: one built from the mitten with fingers of different lengths on a knuckle arc, one with five
                 equal sausages; good: 'A' | 'B'; flip: true (left hands); cuff: a sleeve color.
   draw-nose     noses A and B: one drawn with planes and shadows, one outlined all around; good: 'A' | 'B'; hair (a color);
                 glasses: true.          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math;
  // ------------------------------------------------------------------ data generators share (works in node)
  var POSES = {
    stiff: { name: 'standing stiff and straight', loa: 'straight', sup: 'both' },
    stand: { name: 'standing with the weight on one leg', loa: 'C', sup: 'L' },
    lean: { name: 'leaning to one side', loa: 'C', sup: 'L' },
    reach: { name: 'reaching up high', loa: 'C', sup: 'R' },
    wave: { name: 'waving', loa: 'C', sup: 'L' },
    dance: { name: 'dancing on one leg', loa: 'C', sup: 'L' },
    throw: { name: 'about to throw', loa: 'S', sup: 'L' }
  };
  ML.drawPoses = POSES;
  ML.drawStill = { good: '', row: 'The objects stand in a row, evenly spaced, with no overlap.', same: 'All the objects are the same height.', top: 'The light comes from straight above, so the forms look flat.' };
  if (!ML.viz || !D) return;
  var V = ML.viz, NS = 'http://www.w3.org/2000/svg', SKIN = '#ffcc4d', SKIN_LINE = '#e8a93a', uid = 0;
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function svgRoot(w, hh, label) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'arv-svg drwb-svg', role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  function txt(p, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), p); t.textContent = s; return t; }
  function letter(i) { return String.fromCharCode(65 + i); }
  function f1(v) { return (M.round(v * 10) / 10).toString(); }
  function pt(p) { return f1(p[0]) + ',' + f1(p[1]); }
  function seeded(str) { var x = 0; str = String(str); for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function hexMix(a, b, t) { var p = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), q = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); }); return '#' + p.map(function (v, i) { var c = M.round(v + (q[i] - v) * t); return (c < 16 ? '0' : '') + c.toString(16); }).join(''); }
  var CSS = '.drwb-svg text{font-family:system-ui,sans-serif}' +
    '.drwb-lab{font:600 11px system-ui,sans-serif;fill:var(--ar-ink,#26221e)}' +
    '.drwb-lead{stroke:var(--ar-ink,#26221e);stroke-width:1;opacity:.7}' +
    '.drwb-paper{fill:var(--ar-paper,#fffdf7)}' +
    '.drwb-ground{stroke:var(--ar-line,#ddd6cc);stroke-width:2}' +
    '.drwb-loa{fill:none;stroke:var(--ar-acc,#b8197f);stroke-width:3;stroke-dasharray:8 6;stroke-linecap:round}' +
    '.drwb-badge{fill:var(--ar-acc,#b8197f)}.drwb-badget{font:700 12px system-ui,sans-serif;fill:#fff;text-anchor:middle}' +
    'html[data-theme="dark"] .drwb-badget{fill:#2a0b1e}' +
    '.drwb-rail{stroke:#7a6a58;stroke-width:4;stroke-linecap:round}' +
    '.drwb-row{display:flex;flex-wrap:wrap;gap:.55rem;justify-content:center}.drwb-row>.arl-card{flex:1 1 140px;max-width:300px}';
  function injectCss() { if (D.getElementById('drwb-css')) return; var s = D.createElement('style'); s.id = 'drwb-css'; s.textContent = CSS; D.head.appendChild(s); }
  function frame(el, o, name, label) {
    injectCss(); el.classList.add('arv', 'drwb-' + name);
    if (!el.getAttribute('aria-label') || o.label) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.task) el.appendChild(h('p', 'arv-task', o.task));
    F.body = h('div', 'arv-body'); el.appendChild(F.body);
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return F;
  }
  // a row of cards (one svg each) with a letter or a name under each
  function cards(F, n, w, hh, labelOf, nameOf, draw, maxW) {
    var row = h('div', n > 1 ? 'drwb-row' : ''); F.body.appendChild(row);
    for (var i = 0; i < n; i++) {
      var c = h('div', 'arl-card'), s = svgRoot(w, hh, labelOf(i)); c.appendChild(s); draw(s, i); if (maxW && n > 1) c.style.maxWidth = maxW + 'px';
      if (n > 1 || !F.quiet) { var nm = nameOf(i); if (nm !== null) c.appendChild(h('span', 'arl-lab' + (F.quiet || nm === '' ? ' arl-letter' : ''), F.quiet || nm === '' ? letter(i) : nm)); }
      row.appendChild(c);
    }
    if (n === 1) { row.style.maxWidth = '420px'; row.style.margin = '0 auto'; }
    return row;
  }
  function badge(g, x, y, s) { sv('circle', { cx: x, cy: y, r: 10, class: 'drwb-badge' }, g); txt(g, x, y + 4, s, { class: 'drwb-badget' }); }

  /* ================================================================ draw-pose: the clothed mannequin */
  // angles in degrees: limbs from straight down (+ toward the right of the picture); spine parts from straight up (+ right)
  var POSE_ANG = {
    stiff: { tp: 0, tc: 0, tn: 0, th: 0, aL: [-7, -5], aR: [7, 5], lL: [-3, -2], lR: [3, 2] },
    stand: { tp: 7, tc: -5, tn: -6, th: -8, aL: [-12, -6], aR: [14, 20], lL: [6, 1], lR: [16, 4] },
    lean: { tp: 10, tc: 22, tn: 26, th: 30, aL: [-28, -18], aR: [150, 168], lL: [-14, -8], lR: [10, 14] },
    reach: { tp: -6, tc: -16, tn: -20, th: -22, aL: [-168, -175], aR: [30, 12], lL: [-22, -16], lR: [6, 4] },
    wave: { tp: 5, tc: -7, tn: -6, th: -8, aL: [-10, -5], aR: [118, 172], lL: [4, 2], lR: [15, 7] },
    dance: { tp: -9, tc: -15, tn: -14, th: -16, aL: [-118, -138], aR: [108, 126], lL: [5, 2], lR: [62, 38] },
    throw: { tp: -22, tc: 26, tn: 14, th: 8, aL: [-62, -40], aR: [128, 178], lL: [8, -6], lR: [36, 26] }
  };
  var LEN = { pw: 0.9, ws: 1.4, neck: 0.32, sh: 0.92, hip: 0.46, ua: 1.45, fa: 1.2, hand: 0.42, th: 1.85, sk: 1.75, foot: 0.5 };
  function dirDown(a) { a *= M.PI / 180; return [M.sin(a), M.cos(a)]; }
  function dirUp(a) { a *= M.PI / 180; return [M.sin(a), -M.cos(a)]; }
  function add(p, d, k) { return [p[0] + d[0] * k, p[1] + d[1] * k]; }
  function skeleton(key) {
    var P = POSE_ANG[key] || POSE_ANG.stand, S = {};
    S.pel = [0, 0]; var dp = dirUp(P.tp), dc = dirUp(P.tc), dn = dirUp(P.tn), dh = dirUp(P.th);
    S.waist = add(S.pel, dp, LEN.pw); S.neck = add(S.waist, dc, LEN.ws); S.chin = add(S.neck, dn, LEN.neck);
    S.headC = add(S.chin, dh, 0.5); S.top = add(S.chin, dh, 1); S.th = P.th;
    var perpC = [-dc[1], dc[0]], perpP = [-dp[1], dp[0]]; // to the right of each part
    S.shL = add(S.neck, perpC, -LEN.sh); S.shR = add(S.neck, perpC, LEN.sh); S.hipL = add(S.pel, perpP, -LEN.hip); S.hipR = add(S.pel, perpP, LEN.hip);
    S.shL = add(S.shL, dc, -0.12); S.shR = add(S.shR, dc, -0.12);
    S.elL = add(S.shL, dirDown(P.aL[0]), LEN.ua); S.wrL = add(S.elL, dirDown(P.aL[1]), LEN.fa);
    S.elR = add(S.shR, dirDown(P.aR[0]), LEN.ua); S.wrR = add(S.elR, dirDown(P.aR[1]), LEN.fa);
    S.knL = add(S.hipL, dirDown(P.lL[0]), LEN.th); S.anL = add(S.knL, dirDown(P.lL[1]), LEN.sk);
    S.knR = add(S.hipR, dirDown(P.lR[0]), LEN.th); S.anR = add(S.knR, dirDown(P.lR[1]), LEN.sk);
    S.dc = dc; S.dp = dp; S.perpC = perpC; S.perpP = perpP; S.ang = P;
    return S;
  }
  var OUTFITS = [['#4a8fe0', '#3c4d6b', '#5b3a1e'], ['#e8574f', '#4a3a6b', '#1d1714'], ['#58b368', '#5a4a2c', '#c4542b'], ['#f39a3d', '#3c5a4d', '#d9b25c'], ['#9a6ad6', '#34495e', '#7a7a7a']];
  function drawFigure(g, key, x0, ground, height, o) {
    var S = skeleton(key), pose = POSES[key] || POSES.stand, out = OUTFITS[(o.outfit || 0) % OUTFITS.length], shirt = out[0], pants = out[1], hair = out[2];
    // fit: the lowest ankle stands on the ground; scale so the figure is about `height` tall when standing
    var pts = ['top', 'anL', 'anR', 'wrL', 'wrR', 'elL', 'elR', 'knL', 'knR', 'shL', 'shR'].map(function (k) { return S[k]; });
    ['L', 'R'].forEach(function (sd) { var e = S['el' + sd], w = S['wr' + sd], d = [w[0] - e[0], w[1] - e[1]], L0 = M.hypot(d[0], d[1]) || 1; pts.push([w[0] + d[0] / L0 * 0.65, w[1] + d[1] / L0 * 0.65]); });
    var minX = M.min.apply(null, pts.map(function (p) { return p[0] - 0.3; })), maxX = M.max.apply(null, pts.map(function (p) { return p[0] + 0.3; })), minY = M.min.apply(null, pts.map(function (p) { return p[1] - 0.25; }));
    var low = M.max(S.anL[1], S.anR[1]) + 0.15, cx = (minX + maxX) / 2, availW = o.availW || height * 0.8;
    var u = M.min(height / 7.6, (ground - 6) / (low - minY), availW / (maxX - minX));
    function T(p) { return [x0 + (p[0] - cx) * u, ground - (low - p[1]) * u]; }
    var Q = {}; Object.keys(S).forEach(function (k) { if (Array.isArray(S[k]) && S[k].length === 2 && typeof S[k][0] === 'number') Q[k] = T(S[k]); });
    var jt = hexMix(shirt, '#000000', 0.22), jp = hexMix(pants, '#000000', 0.25), wrong = !!o.wrong;
    function limb(a, b, w, col) { sv('line', { x1: f1(a[0]), y1: f1(a[1]), x2: f1(b[0]), y2: f1(b[1]), stroke: hexMix(col, '#000000', 0.35), 'stroke-width': f1(w + 2), 'stroke-linecap': 'round' }, g); sv('line', { x1: f1(a[0]), y1: f1(a[1]), x2: f1(b[0]), y2: f1(b[1]), stroke: col, 'stroke-width': f1(w), 'stroke-linecap': 'round' }, g); }
    function hose(a, m, b, w, col) { // the mistake: one smooth curve through the joint, no joint ball (bends between the joints)
      var c = [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2], d = 'M' + pt(a) + ' Q' + pt(c) + ' ' + pt(b);
      sv('path', { d: d, fill: 'none', stroke: hexMix(col, '#000000', 0.35), 'stroke-width': f1(w + 2), 'stroke-linecap': 'round' }, g); sv('path', { d: d, fill: 'none', stroke: col, 'stroke-width': f1(w), 'stroke-linecap': 'round' }, g);
    }
    function ball(p, r, col) { sv('circle', { cx: f1(p[0]), cy: f1(p[1]), r: f1(r), fill: col, stroke: hexMix(col, '#000000', 0.35), 'stroke-width': 1 }, g); }
    function quad(a, b, c, d, col) { sv('polygon', { points: [a, b, c, d].map(pt).join(' '), fill: col, stroke: hexMix(col, '#000000', 0.35), 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, g); }
    function leg(side) {
      var hp = Q['hip' + side], kn = Q['kn' + side], an = Q['an' + side], dirF = side === 'L' ? -1 : 1;
      if (wrong) hose(hp, kn, an, u * 0.42, pants); else { limb(hp, kn, u * 0.46, pants); limb(kn, an, u * 0.38, pants); ball(kn, u * 0.25, jp); }
      sv('path', { d: 'M' + pt([an[0] - u * 0.18, an[1] - u * 0.05]) + ' L' + pt([an[0] + dirF * u * 0.5, an[1] + u * 0.12]) + ' L' + pt([an[0] - dirF * u * 0.12, an[1] + u * 0.14]) + ' Z', fill: '#4a3a2c', stroke: '#2e241b', 'stroke-width': 1, 'stroke-linejoin': 'round' }, g);
    }
    function arm(side) {
      var sh = Q['sh' + side], el = Q['el' + side], wr = Q['wr' + side];
      if (wrong) hose(sh, el, wr, u * 0.34, shirt); else { limb(sh, el, u * 0.36, shirt); limb(el, wr, u * 0.3, shirt); ball(el, u * 0.2, jt); }
      ball(sh, u * 0.26, jt);
      var d = [wr[0] - el[0], wr[1] - el[1]], L = M.hypot(d[0], d[1]) || 1; d = [d[0] / L, d[1] / L];
      sv('ellipse', { cx: f1(wr[0] + d[0] * u * 0.28), cy: f1(wr[1] + d[1] * u * 0.28), rx: f1(u * 0.18), ry: f1(u * 0.3), transform: 'rotate(' + f1(M.atan2(d[1], d[0]) * 180 / M.PI - 90) + ' ' + f1(wr[0] + d[0] * u * 0.28) + ' ' + f1(wr[1] + d[1] * u * 0.28) + ')', fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 1.5 }, g);
    }
    // back to front: legs, hips box, chest box, arms, neck, head
    leg('L'); leg('R');
    var pp = S.perpP, dp = S.dp, pc = S.perpC, dc = S.dc;
    var hipBox = [add(S.pel, pp, -0.62), add(S.pel, pp, 0.62), add(add(S.pel, pp, 0.7), dp, 0.75), add(add(S.pel, pp, -0.7), dp, 0.75)];
    quad.apply(null, hipBox.map(T).concat([pants]));
    var ch = [add(add(S.waist, pc, -0.62), dc, -0.05), add(add(S.waist, pc, 0.62), dc, -0.05), add(add(S.neck, pc, 0.95), dc, -0.05), add(add(S.neck, pc, -0.95), dc, -0.05)];
    quad.apply(null, ch.map(T).concat([shirt]));
    sv('line', { x1: f1(T(add(S.waist, pc, -0.6))[0]), y1: f1(T(add(S.waist, pc, -0.6))[1]), x2: f1(T(add(S.waist, pc, 0.6))[0]), y2: f1(T(add(S.waist, pc, 0.6))[1]), stroke: jt, 'stroke-width': f1(u * 0.12), 'stroke-linecap': 'round' }, g);
    arm('L'); arm('R');
    var nk = T(S.neck), cn = T(S.chin);
    sv('line', { x1: f1(nk[0]), y1: f1(nk[1]), x2: f1(cn[0]), y2: f1(cn[1]), stroke: SKIN_LINE, 'stroke-width': f1(u * 0.36), 'stroke-linecap': 'round' }, g);
    sv('line', { x1: f1(nk[0]), y1: f1(nk[1]), x2: f1(cn[0]), y2: f1(cn[1]), stroke: SKIN, 'stroke-width': f1(u * 0.3), 'stroke-linecap': 'round' }, g);
    var hc = Q.headC, rot = 'rotate(' + f1(S.th) + ' ' + f1(hc[0]) + ' ' + f1(hc[1]) + ')';
    sv('ellipse', { cx: f1(hc[0]), cy: f1(hc[1]), rx: f1(u * 0.37), ry: f1(u * 0.5), transform: rot, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 1.5 }, g);
    sv('path', { d: 'M' + f1(hc[0] - u * 0.38) + ',' + f1(hc[1] - u * 0.06) + ' Q' + f1(hc[0]) + ',' + f1(hc[1] - u * 0.72) + ' ' + f1(hc[0] + u * 0.38) + ',' + f1(hc[1] - u * 0.06) + ' Q' + f1(hc[0]) + ',' + f1(hc[1] - u * 0.32) + ' ' + f1(hc[0] - u * 0.38) + ',' + f1(hc[1] - u * 0.06) + ' Z', transform: rot, fill: hair }, g);
    if (o.loa) { // one smooth curve (Catmull-Rom) from the top of the head through the neck and the hips to the foot that carries the weight
      var E = pose.sup === 'L' ? Q.anL : pose.sup === 'R' ? Q.anR : [(Q.anL[0] + Q.anR[0]) / 2, (Q.anL[1] + Q.anR[1]) / 2];
      var CP = [Q.top, T(S.neck), Q.pel, E], d = 'M' + pt(CP[0]);
      for (var ci = 0; ci < CP.length - 1; ci++) { var p0 = CP[M.max(0, ci - 1)], p1 = CP[ci], p2 = CP[ci + 1], p3 = CP[M.min(CP.length - 1, ci + 2)];
        d += ' C' + pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pt(p2); }
      sv('path', { d: d, class: 'drwb-loa' }, g);
    }
    if (o.forms) {
      var labs = [['head: an egg', Q.headC, -1], ['chest: a box', T(add(S.waist, S.dc, 0.9)), 1], ['joints: balls', Q.elR, 1], ['hips: a box', T(add(S.pel, S.dp, 0.35)), -1], ['limbs: cylinders', T([(S.knL[0] + S.anL[0]) / 2, (S.knL[1] + S.anL[1]) / 2]), -1]];
      labs.forEach(function (L2) { var p = L2[1], left = L2[2] < 0, tx = left ? 8 : 2 * x0 - 8, ex = left ? x0 - height * 0.2 : x0 + height * 0.2; sv('line', { x1: f1(p[0]), y1: f1(p[1]), x2: f1(ex), y2: f1(p[1]), class: 'drwb-lead' }, g); txt(g, tx, p[1] + 4, L2[0], { class: 'drwb-lab', 'text-anchor': left ? 'start' : 'end' }); });
    }
    return Q;
  }
  V.register('draw-pose', function (el, o) {
    var list = o.poses || [o.pose || 'stand'], F = frame(el, o, 'pose', 'Mannequin figures'), wrong = [].concat(o.wrong === undefined ? [] : o.wrong);
    var one = list.length === 1, W0 = one ? (o.forms ? 360 : 220) : 170, H0 = 250;
    cards(F, list.length, W0, H0, function (i) { var p = POSES[list[i]] || POSES.stand; return F.quiet ? 'Figure ' + letter(i) : 'A clothed mannequin figure ' + p.name + (wrong.indexOf(i) >= 0 ? ', with arms and legs bending between the joints' : '') + (o.loa ? ', with its line of action' : ''); },
      function (i) { return one && !F.quiet ? null : (F.quiet || wrong.length || o.letters ? '' : (POSES[list[i]] || POSES.stand).name.replace(/^./, function (c) { return c.toUpperCase(); })); },
      function (s, i) { sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'drwb-paper' }, s); sv('line', { x1: 8, y1: 236, x2: W0 - 8, y2: 236, class: 'drwb-ground' }, s); drawFigure(sv('g', null, s), list[i], W0 / 2, 236, 212, { availW: W0 - (one && o.forms ? 200 : 14), outfit: (o.outfit || 0) + i, wrong: wrong.indexOf(i) >= 0, loa: !!o.loa, forms: !!o.forms && !F.quiet && one }); }, 210);
    if (!F.quiet && o.loa) F.body.appendChild(h('p', 'arv-hint', 'The dashed line is the line of action: one curve from the head, through the body, to the foot that carries the weight.'));
    return {};
  });

  /* ================================================================ draw-cloth: folds come from the supports */
  function cloth(g, kind, o, W0, H0, colIdx) {
    var base = o.color || ['#4a8fe0', '#e8574f', '#58b368', '#9a6ad6'][colIdx % 4], lit = hexMix(base, '#ffffff', 0.45), mid = base, dk = hexMix(base, '#000000', 0.38), rail = 26, hem = H0 - 22;
    var tones = [lit, mid, dk, mid];
    function tri(a, b, c, col) { sv('polygon', { points: [a, b, c].map(pt).join(' '), fill: col, stroke: col, 'stroke-width': 0.6, 'stroke-linejoin': 'round' }, g); }
    function line(a, b, cls, at) { sv('line', Object.assign({ x1: f1(a[0]), y1: f1(a[1]), x2: f1(b[0]), y2: f1(b[1]) }, at || {}, cls ? { class: cls } : {}), g); }
    function pin(x) { sv('circle', { cx: f1(x), cy: rail, r: 5, fill: '#c0392b', stroke: '#7a1f15', 'stroke-width': 1.5 }, g); }
    if (kind === 'sleeve') { // a bent arm in a sleeve: folds bunch up on the inside of the elbow and fan out from it
      var sh = [50, 34], elb = [W0 / 2 - 4, H0 - 48], wr = [W0 - 46, 40], wa = 36;
      [[sh, elb], [elb, wr]].forEach(function (sg) { sv('line', { x1: f1(sg[0][0]), y1: f1(sg[0][1]), x2: f1(sg[1][0]), y2: f1(sg[1][1]), stroke: dk, 'stroke-width': wa + 3, 'stroke-linecap': 'round' }, g); });
      [[sh, elb], [elb, wr]].forEach(function (sg) { sv('line', { x1: f1(sg[0][0]), y1: f1(sg[0][1]), x2: f1(sg[1][0]), y2: f1(sg[1][1]), stroke: mid, 'stroke-width': wa, 'stroke-linecap': 'round' }, g); });
      sv('line', { x1: f1(sh[0] - 8), y1: f1(sh[1] + 4), x2: f1(elb[0] - 14), y2: f1(elb[1] + 4), stroke: lit, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      // the inside of the bend: a shadow wedge and folds fanning out from it
      var ic = [elb[0] + 1, elb[1] - 20];
      sv('path', { d: 'M' + pt([ic[0] - 16, ic[1] - 18]) + ' L' + pt([ic[0], ic[1] + 4]) + ' L' + pt([ic[0] + 16, ic[1] - 18]) + ' Z', fill: dk, opacity: 0.55 }, g);
      [[-30, -40, -6], [-20, -46, 4], [22, -44, -4], [32, -34, 6]].forEach(function (f) { sv('path', { d: 'M' + pt([ic[0] + f[0] * 0.25, ic[1] - 4]) + ' Q' + pt([ic[0] + f[0] * 0.6 + f[2], ic[1] + f[1] * 0.45]) + ' ' + pt([ic[0] + f[0], ic[1] + f[1]]), fill: 'none', stroke: dk, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g); });
      var cuff = [wr[0] + 8, wr[1] - 10];
      sv('ellipse', { cx: f1(cuff[0] + 6), cy: f1(cuff[1] - 6), rx: 12, ry: 15, transform: 'rotate(35 ' + f1(cuff[0] + 6) + ' ' + f1(cuff[1] - 6) + ')', fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 1.5 }, g);
      return;
    }
    line([12, rail], [W0 - 12, rail], 'drwb-rail');
    if (kind === 'one') {
      var px = 30 + (o.pin === undefined ? 0.5 : o.pin) * (W0 - 60), half = M.min(78, W0 * 0.38), x0 = M.max(8, M.min(W0 - 8 - 2 * half, px - half)), n = 7, P0 = [px, rail + 2], hemPts = [];
      for (var i = 0; i <= n; i++) hemPts.push([x0 + i * 2 * half / n, hem + (i % 2 ? 9 : -3)]);
      for (i = 0; i < n; i++) tri(P0, hemPts[i], hemPts[i + 1], tones[i % 4]);
      for (i = 1; i < n; i++) line(P0, hemPts[i], null, { stroke: dk, 'stroke-width': 1, opacity: 0.55 });
      sv('polyline', { points: hemPts.map(pt).join(' '), fill: 'none', stroke: dk, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g);
      line(P0, hemPts[0], null, { stroke: dk, 'stroke-width': 1.5 }); line(P0, hemPts[n], null, { stroke: dk, 'stroke-width': 1.5 });
      pin(px);
    } else if (kind === 'two') {
      var x1 = W0 * 0.24, x2 = W0 * 0.76, sag = 46, fan = 6;
      function U(t, d) { return [x1 + (x2 - x1) * t, rail + 2 + d * 4 * t * (1 - t)]; }
      // the sagging front panel: nested U-folds between the pins
      var depths = [0, sag * 0.45, sag * 0.8, sag * 1.15, sag * 1.5];
      for (var j = 0; j < depths.length - 1; j++) {
        var top = [], bot = []; for (var t = 0; t <= 1.0001; t += 0.05) { top.push(U(t, depths[j])); bot.push(U(t, depths[j + 1])); }
        sv('polygon', { points: top.concat(bot.reverse()).map(pt).join(' '), fill: tones[j % 4], stroke: dk, 'stroke-width': 0.8, 'stroke-linejoin': 'round' }, g);
      }
      // the sides fall from each pin in fans
      [[x1, -1], [x2, 1]].forEach(function (q) {
        var P1 = [q[0], rail + 2], hp = []; for (var i2 = 0; i2 <= fan; i2++) { var xx = q[1] < 0 ? M.max(10, q[0] - 44) + i2 * 60 / fan : q[0] - 16 + i2 * 60 / fan; hp.push([M.min(W0 - 10, xx), hem + (i2 % 2 ? 8 : -3)]); }
        for (var i3 = 0; i3 < fan; i3++) tri(P1, hp[i3], hp[i3 + 1], tones[(i3 + (q[1] > 0 ? 1 : 0)) % 4]);
        sv('polyline', { points: hp.map(pt).join(' '), fill: 'none', stroke: dk, 'stroke-width': 1.4 }, g);
      });
      pin(x1); pin(x2);
    } else { // random lines that start and end nowhere: the mistake
      var R = seeded('cloth' + (o.seed || 1)), L = W0 * 0.2, Rr = W0 * 0.8;
      sv('rect', { x: f1(L), y: rail + 2, width: f1(Rr - L), height: hem - rail, fill: mid, stroke: dk, 'stroke-width': 1.5 }, g);
      for (var k2 = 0; k2 < 9; k2++) { var ax = L + 10 + R() * (Rr - L - 20), ay = rail + 18 + R() * (hem - rail - 36), bx = ax + (R() - 0.5) * 50, by = ay + (R() - 0.5) * 50, cx = ax + (R() - 0.5) * 60, cy = ay + (R() - 0.5) * 30; sv('path', { d: 'M' + pt([ax, ay]) + ' Q' + pt([cx, cy]) + ' ' + pt([M.max(L + 6, M.min(Rr - 6, bx)), M.max(rail + 8, M.min(hem - 6, by))]), fill: 'none', stroke: dk, 'stroke-width': 2, 'stroke-linecap': 'round' }, g); }
      pin(L + 4); pin(Rr - 4);
    }
  }
  var CLOTH_NAME = { one: 'Hanging from one pin', two: 'Hanging from two pins', random: 'Random lines (the mistake)', sleeve: 'A bent sleeve' };
  V.register('draw-cloth', function (el, o) {
    var kinds = o.kinds || [o.kind || 'one'], F = frame(el, o, 'cloth', 'Cloth and its folds'), W0 = 220, H0 = 200;
    cards(F, kinds.length, W0, H0, function (i) { return F.quiet ? 'Cloth ' + letter(i) : CLOTH_NAME[kinds[i]]; }, function (i) { return F.quiet ? '' : CLOTH_NAME[kinds[i]]; },
      function (s, i) { sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'drwb-paper' }, s); cloth(sv('g', null, s), kinds[i], o, W0, H0, (o.colorShift || 0) + i); }, 240);
    if (!F.quiet && kinds.indexOf('random') < 0 && kinds.indexOf('sleeve') < 0) F.body.appendChild(h('p', 'arv-hint', 'Every fold starts at a pin and spreads away from it. Each fold has a light side and a shadow side, like a small cylinder.'));
    return {};
  });

  /* ================================================================ draw-still: still-life setups */
  function stillLife(g, setup, o, W0, H0, id) {
    var side = o.light === 'right' ? 1 : -1, top = setup === 'top', tableY = 118;
    sv('rect', { x: 0, y: 0, width: W0, height: tableY, fill: '#e9e2d4' }, g); sv('rect', { x: 0, y: tableY, width: W0, height: H0 - tableY, fill: '#c9a87c' }, g);
    sv('line', { x1: 0, y1: tableY, x2: W0, y2: tableY, stroke: '#a88a60', 'stroke-width': 2 }, g);
    // the lamp
    var lx = top ? W0 / 2 : (side < 0 ? 18 : W0 - 18), ly = top ? 12 : 26;
    sv('circle', { cx: lx, cy: ly, r: 8, fill: '#f6c445', stroke: '#c99a1c' }, g);
    for (var q = 0; q < 8; q++) { var a = q * M.PI / 4; sv('line', { x1: f1(lx + M.cos(a) * 11), y1: f1(ly + M.sin(a) * 11), x2: f1(lx + M.cos(a) * 15), y2: f1(ly + M.sin(a) * 15), stroke: '#f6c445', 'stroke-width': 2 }, g); }
    var gid = 'drwbg' + id;
    function grad(col) { // light side to shadow side across a form
      var k = gid + '_' + (++uid), lg = sv('linearGradient', { id: k, x1: '0', x2: '1', y1: '0', y2: '0' }, sv('defs', null, g)), litC = hexMix(col, '#ffffff', 0.35), dkC = hexMix(col, '#000000', 0.45);
      var st = top ? [[0, hexMix(col, '#000000', 0.25)], [0.5, col], [1, hexMix(col, '#000000', 0.25)]] : side < 0 ? [[0, litC], [0.35, col], [0.82, dkC], [1, hexMix(col, '#000000', 0.3)]] : [[0, hexMix(col, '#000000', 0.3)], [0.18, dkC], [0.65, col], [1, litC]];
      st.forEach(function (s) { sv('stop', { offset: s[0], 'stop-color': s[1] }, lg); }); return 'url(#' + k + ')';
    }
    function shadow(x, y, w) { if (top) sv('ellipse', { cx: f1(x), cy: f1(y), rx: f1(w * 0.58), ry: 4, fill: 'rgba(40,25,10,.45)' }, g); else sv('ellipse', { cx: f1(x - side * w * 0.75), cy: f1(y + 1), rx: f1(w * 1.05), ry: 5, fill: 'rgba(40,25,10,.38)' }, g); }
    function bottle(x, y, hgt, col) { var w = hgt * 0.3; shadow(x, y, w); sv('path', { d: 'M' + f1(x - w / 2) + ',' + f1(y) + ' L' + f1(x - w / 2) + ',' + f1(y - hgt * 0.62) + ' Q' + f1(x - w / 2) + ',' + f1(y - hgt * 0.74) + ' ' + f1(x - w * 0.18) + ',' + f1(y - hgt * 0.8) + ' L' + f1(x - w * 0.18) + ',' + f1(y - hgt) + ' L' + f1(x + w * 0.18) + ',' + f1(y - hgt) + ' L' + f1(x + w * 0.18) + ',' + f1(y - hgt * 0.8) + ' Q' + f1(x + w / 2) + ',' + f1(y - hgt * 0.74) + ' ' + f1(x + w / 2) + ',' + f1(y - hgt * 0.62) + ' L' + f1(x + w / 2) + ',' + f1(y) + ' Z', fill: grad(col), stroke: 'rgba(0,0,0,.35)' }, g); }
    function vase(x, y, hgt, col) { var w = hgt * 0.55; shadow(x, y, w * 0.8); sv('path', { d: 'M' + f1(x - w * 0.3) + ',' + f1(y) + ' Q' + f1(x - w * 0.75) + ',' + f1(y - hgt * 0.45) + ' ' + f1(x - w * 0.22) + ',' + f1(y - hgt * 0.85) + ' L' + f1(x - w * 0.3) + ',' + f1(y - hgt) + ' L' + f1(x + w * 0.3) + ',' + f1(y - hgt) + ' L' + f1(x + w * 0.22) + ',' + f1(y - hgt * 0.85) + ' Q' + f1(x + w * 0.75) + ',' + f1(y - hgt * 0.45) + ' ' + f1(x + w * 0.3) + ',' + f1(y) + ' Z', fill: grad(col), stroke: 'rgba(0,0,0,.35)' }, g); }
    function apple(x, y, r, col) { shadow(x, y, r); sv('circle', { cx: f1(x), cy: f1(y - r), r: f1(r), fill: grad(col), stroke: 'rgba(0,0,0,.3)' }, g); sv('line', { x1: f1(x), y1: f1(y - 2 * r), x2: f1(x + 2), y2: f1(y - 2 * r - 6), stroke: '#5a3a1a', 'stroke-width': 2 }, g); }
    function cup(x, y, hgt, col) { var w = hgt * 0.9; shadow(x, y, w / 2); sv('rect', { x: f1(x - w / 2), y: f1(y - hgt), width: f1(w), height: f1(hgt), fill: grad(col), stroke: 'rgba(0,0,0,.35)' }, g); sv('ellipse', { cx: f1(x), cy: f1(y - hgt), rx: f1(w / 2), ry: f1(w * 0.14), fill: hexMix(col, '#ffffff', 0.2), stroke: 'rgba(0,0,0,.35)' }, g); sv('path', { d: 'M' + f1(x + w / 2) + ',' + f1(y - hgt * 0.75) + ' q' + f1(hgt * 0.35) + ',' + f1(hgt * 0.25) + ' 0,' + f1(hgt * 0.5), fill: 'none', stroke: hexMix(col, '#000000', 0.3), 'stroke-width': 3 }, g); }
    function box(x, y, s, col) { shadow(x, y, s / 2); var d = s * 0.28; sv('rect', { x: f1(x - s / 2), y: f1(y - s), width: f1(s), height: f1(s), fill: top ? hexMix(col, '#000000', 0.15) : side < 0 ? hexMix(col, '#ffffff', 0.15) : hexMix(col, '#000000', 0.3), stroke: 'rgba(0,0,0,.35)' }, g); sv('polygon', { points: [[x + s / 2, y - s], [x + s / 2 + d, y - s - d * 0.6], [x + s / 2 + d, y - d * 0.6], [x + s / 2, y]].map(pt).join(' '), fill: top ? hexMix(col, '#000000', 0.3) : side < 0 ? hexMix(col, '#000000', 0.4) : hexMix(col, '#ffffff', 0.1), stroke: 'rgba(0,0,0,.35)' }, g); sv('polygon', { points: [[x - s / 2, y - s], [x - s / 2 + d, y - s - d * 0.6], [x + s / 2 + d, y - s - d * 0.6], [x + s / 2, y - s]].map(pt).join(' '), fill: hexMix(col, '#ffffff', top ? 0.5 : 0.3), stroke: 'rgba(0,0,0,.35)' }, g); }
    var items;
    if (setup === 'row') items = [['bottle', 40, 150, 84], ['cup', 98, 150, 34], ['apple', 152, 150, 15], ['vase', 206, 150, 62], ['box', 260, 150, 36]];
    else if (setup === 'same') items = [['cup', 120, 132, 46], ['box', 176, 140, 46], ['cup', 96, 160, 46], ['vase', 150, 170, 46], ['cup', 222, 158, 46]];
    else items = [['bottle', 112, 132, 92], ['vase', 160, 138, 66], ['box', 214, 146, 40], ['apple', 136, 162, 16], ['cup', 190, 174, 32]];
    var cols = { bottle: '#3f7f5a', vase: '#4a6fb0', box: '#d08a3c', apple: '#c8372d', cup: '#e8e2d2' };
    items.sort(function (a, b) { return a[2] - b[2]; }).forEach(function (it) { var f = { bottle: bottle, vase: vase, apple: apple, cup: cup, box: box }[it[0]]; f(it[1], it[2], it[3], cols[it[0]] === '#e8e2d2' && setup === 'same' ? '#9a6ad6' : cols[it[0]]); });
  }
  V.register('draw-still', function (el, o) {
    var setups = o.setups || [o.setup || 'good'], F = frame(el, o, 'still', 'Still-life setups'), W0 = 300, H0 = 190, NAMES = { good: 'Grouped, overlapping, lit from one side', row: 'Lined up in a row', same: 'All one height', top: 'Lit from straight above' };
    var id = ++uid;
    cards(F, setups.length, W0, H0, function (i) { return F.quiet ? 'Setup ' + letter(i) : 'A still-life setup: ' + NAMES[setups[i]]; }, function (i) { return F.quiet ? '' : NAMES[setups[i]]; }, function (s, i) { stillLife(sv('g', null, s), setups[i], o, W0, H0, id + '_' + i); });
    return {};
  });

  /* ================================================================ draw-surface: matte, shiny, glass */
  function surface(g, kind, W0, H0, id, col) {
    var defs = sv('defs', null, g), cx = W0 / 2, cy = H0 / 2 + 4;
    if (kind === 'matte' || kind === 'shiny') {
      sv('rect', { x: 0, y: 0, width: W0, height: H0, fill: '#ece6da' }, g); sv('rect', { x: 0, y: H0 * 0.72, width: W0, height: H0 * 0.28, fill: '#cdbf9f' }, g);
      var r = 40, k = 'drwbs' + id, rg = sv('radialGradient', { id: k, cx: '0.36', cy: '0.32', r: '0.75' }, defs);
      var bc = col || '#b83a3a', stops = kind === 'matte' ? [[0, hexMix(bc, '#ffffff', 0.5)], [0.45, hexMix(bc, '#ffffff', 0.15)], [0.85, hexMix(bc, '#000000', 0.45)], [1, hexMix(bc, '#000000', 0.3)]] : [[0, hexMix(bc, '#ffffff', 0.1)], [0.25, hexMix(bc, '#000000', 0.12)], [0.6, hexMix(bc, '#000000', 0.6)], [0.9, hexMix(bc, '#000000', 0.82)], [1, hexMix(bc, '#000000', 0.45)]];
      stops.forEach(function (s) { sv('stop', { offset: s[0], 'stop-color': s[1] }, rg); });
      sv('ellipse', { cx: cx + 18, cy: H0 * 0.72 + 30 - r * 0.2 + 2, rx: r * 1.1, ry: 7, fill: 'rgba(40,25,10,.4)' }, g);
      sv('circle', { cx: cx, cy: H0 * 0.72 + 30 - r - 6, r: r, fill: 'url(#' + k + ')' }, g);
      var by = H0 * 0.72 + 30 - r - 6;
      if (kind === 'matte') sv('ellipse', { cx: cx - 14, cy: by - 15, rx: 12, ry: 9, fill: 'rgba(255,240,235,.35)' }, g);
      else {
        sv('path', { d: 'M' + f1(cx - r * 0.93) + ',' + f1(by + 8) + ' Q' + cx + ',' + f1(by + 22) + ' ' + f1(cx + r * 0.93) + ',' + f1(by + 8) + ' L' + f1(cx + r * 0.7) + ',' + f1(by + r * 0.72) + ' Q' + cx + ',' + f1(by + r * 1.02) + ' ' + f1(cx - r * 0.7) + ',' + f1(by + r * 0.72) + ' Z', fill: 'rgba(214,190,150,.35)' }, g); // the table reflected
        sv('rect', { x: f1(cx - 22), y: f1(by - 27), width: 13, height: 16, rx: 2, fill: '#ffffff', opacity: 0.95, transform: 'rotate(-14 ' + f1(cx - 16) + ' ' + f1(by - 19) + ')' }, g); // a window, reflected sharply
        sv('circle', { cx: f1(cx - 4), cy: f1(by - 24), r: 3, fill: '#ffffff' }, g);
      }
      return;
    }
    // glass: stripes behind, seen through the glass shifted and enlarged
    sv('rect', { x: 0, y: 0, width: W0, height: H0, fill: '#f3efe6' }, g);
    var stripes = sv('g', null, g); for (var x = -6; x < W0; x += 22) sv('rect', { x: x, y: 0, width: 10, height: H0 * 0.74, fill: '#3d7fc8', opacity: 0.85 }, stripes);
    sv('rect', { x: 0, y: H0 * 0.74, width: W0, height: H0 * 0.26, fill: '#cdbf9f' }, g);
    var gw = 58, gt = 40, gb = H0 * 0.74 + 18, gl = cx - gw / 2, gr2 = cx + gw / 2, shape = 'M' + f1(gl) + ',' + gt + ' L' + f1(gl + 6) + ',' + f1(gb) + ' Q' + cx + ',' + f1(gb + 8) + ' ' + f1(gr2 - 6) + ',' + f1(gb) + ' L' + f1(gr2) + ',' + gt + ' Z';
    if (kind === 'glassgray') {
      sv('path', { d: shape, fill: '#9a9a9a', stroke: '#1d1d1d', 'stroke-width': 3 }, g);
      sv('ellipse', { cx: cx, cy: gt, rx: gw / 2, ry: 6, fill: '#b5b5b5', stroke: '#1d1d1d', 'stroke-width': 3 }, g);
      return;
    }
    var cp = 'drwbc' + id; sv('path', { d: shape }, sv('clipPath', { id: cp }, defs));
    var inside = sv('g', { 'clip-path': 'url(#' + cp + ')' }, g);
    sv('rect', { x: 0, y: 0, width: W0, height: H0, fill: '#f6f3ec' }, inside);
    for (var x2 = gl - 30; x2 < gr2 + 30; x2 += 22) sv('rect', { x: f1(cx + (x2 - cx) * 1.35 + 7), y: 0, width: 13, height: H0 * 0.74 + 8, fill: '#3d7fc8', opacity: 0.75 }, inside); // bent and enlarged
    sv('rect', { x: 0, y: H0 * 0.74 + 8, width: W0, height: H0, fill: '#d8ccb0' }, inside);
    sv('rect', { x: f1(gl + 2), y: gt, width: 5, height: f1(gb - gt), fill: 'rgba(30,40,50,.55)' }, inside);
    sv('rect', { x: f1(gr2 - 9), y: gt, width: 6, height: f1(gb - gt), fill: 'rgba(30,40,50,.45)' }, inside);
    sv('rect', { x: f1(gl + 11), y: gt + 8, width: 5, height: f1(gb - gt - 22), rx: 2, fill: '#ffffff', opacity: 0.9 }, inside); // a crisp highlight
    sv('path', { d: 'M' + f1(gl + 8) + ',' + f1(gb - 8) + ' Q' + cx + ',' + f1(gb + 2) + ' ' + f1(gr2 - 8) + ',' + f1(gb - 8), fill: 'none', stroke: '#ffffff', 'stroke-width': 2.5, opacity: 0.9 }, inside);
    sv('ellipse', { cx: cx, cy: gt, rx: gw / 2, ry: 6, fill: 'none', stroke: 'rgba(30,40,50,.6)', 'stroke-width': 1.5 }, g);
    sv('path', { d: 'M' + f1(gl + 6) + ',' + f1(gt + 3) + ' Q' + f1(cx - 8) + ',' + f1(gt + 7) + ' ' + f1(cx + 6) + ',' + f1(gt + 6), fill: 'none', stroke: '#ffffff', 'stroke-width': 2 }, g);
  }
  var SURF_NAME = { matte: 'Matte (dull)', shiny: 'Shiny', glass: 'Glass, drawn as seen', glassgray: 'Glass outlined and filled gray' };
  V.register('draw-surface', function (el, o) {
    var kinds = o.kinds || ['matte', 'shiny'], F = frame(el, o, 'surface', 'Surfaces'), W0 = 160, H0 = 160, id = ++uid;
    cards(F, kinds.length, W0, H0, function (i) { return F.quiet ? 'Picture ' + letter(i) : SURF_NAME[kinds[i]]; }, function (i) { return F.quiet ? '' : SURF_NAME[kinds[i]]; }, function (s, i) { surface(sv('g', null, s), kinds[i], W0, H0, id + '_' + i, o.color); }, 200);
    return {};
  });

  /* ================================================================ draw-lead: leading lines in thumbnails */
  function leadScene(g, it, W0, H0) {
    var hy = H0 * 0.42, sx = (it.sx === undefined ? 0.66 : it.sx) * W0, sy = hy + 8, line = it.line || 'road', toS = it.to !== 'edge';
    sv('rect', { x: 0, y: 0, width: W0, height: hy, fill: '#bcd9ef' }, g); sv('rect', { x: 0, y: hy, width: W0, height: H0 - hy, fill: '#9cc58a' }, g);
    sv('path', { d: 'M0,' + hy + ' Q' + f1(W0 * 0.3) + ',' + f1(hy - 14) + ' ' + f1(W0 * 0.55) + ',' + hy + ' T' + W0 + ',' + f1(hy - 5) + ' L' + W0 + ',' + hy + ' Z', fill: '#86b277' }, g);
    var start = toS ? [W0 * 0.2, H0] : [W0 * 0.12, H0], end = toS ? [sx - 2, sy + 4] : [W0 + 4, H0 * 0.66], ctrl = toS ? [W0 * 0.2, hy + (H0 - hy) * 0.35] : [W0 * 0.55, H0 * 0.98];
    if (!toS) sx = W0 * 0.3;
    if (line === 'road' || line === 'river') {
      var wB = line === 'road' ? 34 : 28, wE = 4, col = line === 'road' ? '#d9c9a3' : '#5f93b8';
      var a1 = [start[0] - wB / 2, start[1]], a2 = [start[0] + wB / 2, start[1]];
      sv('path', { d: 'M' + pt(a1) + ' Q' + pt([ctrl[0] - wB * 0.3, ctrl[1]]) + ' ' + pt([end[0] - wE, end[1]]) + ' L' + pt([end[0] + wE, end[1] + (toS ? 0 : 6)]) + ' Q' + pt([ctrl[0] + wB * 0.3, ctrl[1]]) + ' ' + pt(a2) + ' Z', fill: col }, g);
    } else { // a fence: posts getting smaller along a curve
      for (var i = 0; i <= 8; i++) { var t = i / 8, x = (1 - t) * (1 - t) * start[0] + 2 * t * (1 - t) * ctrl[0] + t * t * end[0], y = (1 - t) * (1 - t) * start[1] + 2 * t * (1 - t) * ctrl[1] + t * t * end[1], hgt = 30 * (1 - t * 0.78); sv('line', { x1: f1(x), y1: f1(y), x2: f1(x), y2: f1(y - hgt), stroke: '#5a3a1e', 'stroke-width': f1(5 - t * 3.4) }, g); }
      [[0.75, 0.6], [0.4, 0.3]].forEach(function (rr) { sv('path', { d: 'M' + pt([start[0], start[1] - 30 * rr[0]]) + ' Q' + pt([ctrl[0], ctrl[1] - 22 * rr[0]]) + ' ' + pt([end[0], end[1] - 7 * rr[1]]), fill: 'none', stroke: '#5a3a1e', 'stroke-width': 2.4 }, g); });
    }
    sv('rect', { x: f1(sx - 13), y: f1(sy - 12), width: 26, height: 18, fill: '#e8c66a' }, g); sv('polygon', { points: f1(sx - 17) + ',' + f1(sy - 12) + ' ' + f1(sx + 17) + ',' + f1(sy - 12) + ' ' + f1(sx) + ',' + f1(sy - 27), fill: '#b5473a' }, g); sv('rect', { x: f1(sx - 3), y: f1(sy - 4), width: 6, height: 10, fill: '#6b4a2a' }, g);
  }
  V.register('draw-lead', function (el, o) {
    var items = o.items || [{ line: 'road', to: 'subject' }, { line: 'road', to: 'edge' }], F = frame(el, o, 'lead', 'Leading lines'), W0 = 200, H0 = 130;
    cards(F, items.length, W0, H0, function (i) { return F.quiet ? 'Picture ' + letter(i) : 'A ' + (items[i].line || 'road') + (items[i].to === 'edge' ? ' running out of the picture' : ' leading to the house'); }, function (i) { return F.quiet ? '' : (items[i].to === 'edge' ? 'Leads out of the picture' : 'Leads to the house'); }, function (s, i) { leadScene(sv('g', null, s), items[i], W0, H0); }, 230);
    return {};
  });

  /* ================================================================ draw-focal: one shape made the focal point */
  V.register('draw-focal', function (el, o) {
    var kind = o.kind || 'contrast', F = frame(el, o, 'focal', 'A focal point among shapes'), W0 = 300, H0 = 190, R = seeded('focal' + (o.seed || 1) + kind), n = 11, pts = [];
    var s = svgRoot(W0, H0, F.quiet ? 'Shapes with three lettered candidates' : 'Shapes; one is the focal point by ' + kind); var wrap = h('div', ''); wrap.style.maxWidth = '460px'; wrap.style.margin = '0 auto'; wrap.appendChild(s); F.body.appendChild(wrap);
    sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'drwb-paper' }, s);
    function far(p) { return pts.every(function (q) { return M.hypot(q[0] - p[0], q[1] - p[1]) > 36; }); }
    var zone = kind === 'isolation' ? [20, 20, W0 * 0.46, H0 - 40] : [24, 24, W0 - 48, H0 - 48];
    for (var t = 0; pts.length < n && t < 500; t++) { var p = [zone[0] + R() * zone[2], zone[1] + R() * zone[3]]; if (far(p)) pts.push(p); }
    var cands = [0, 1, 2], tgt = o.target === undefined ? 0 : o.target;
    if (kind === 'isolation') pts[tgt] = [W0 * 0.86, H0 * (0.3 + R() * 0.4)];
    var g = sv('g', null, s), fillL = '#c9c3b8', ink = '#5a5248';
    if (kind === 'lines') for (var k = 0; k < 6; k++) { var a = k * M.PI / 3 + 0.3, ex = pts[tgt][0] + M.cos(a) * 400, ey = pts[tgt][1] + M.sin(a) * 400; sv('line', { x1: f1(ex), y1: f1(ey), x2: f1(pts[tgt][0] + M.cos(a) * 18), y2: f1(pts[tgt][1] + M.sin(a) * 18), stroke: '#8a8378', 'stroke-width': 2 }, g); }
    pts.forEach(function (p, i) {
      var isT = i === tgt, fill = kind === 'contrast' && isT ? '#1d1a17' : fillL;
      sv('circle', { cx: f1(p[0]), cy: f1(p[1]), r: 13, fill: fill, stroke: ink, 'stroke-width': 1 }, g);
      if (kind === 'detail' && isT) { for (var j = -3; j <= 3; j++) sv('line', { x1: f1(p[0] - 10), y1: f1(p[1] + j * 3.4), x2: f1(p[0] + 10), y2: f1(p[1] + j * 3.4), stroke: '#2a2622', 'stroke-width': 1 }, g); sv('circle', { cx: f1(p[0]), cy: f1(p[1]), r: 6, fill: '#e8c66a', stroke: '#2a2622' }, g); sv('circle', { cx: f1(p[0]), cy: f1(p[1]), r: 13, fill: 'none', stroke: '#2a2622', 'stroke-width': 2 }, g); }
    });
    cands.forEach(function (c, i) { var p = pts[c], bx = p[0] + 18, by = p[1] - 16; if (bx > W0 - 12) bx = p[0] - 18; if (by < 12) by = p[1] + 18; badge(g, bx, by, letter(i)); });
    if (!F.quiet) F.body.appendChild(h('p', 'arv-hint', 'The focal point here is ' + letter(tgt) + ', made by ' + ({ contrast: 'the strongest contrast', isolation: 'isolation: it stands apart', detail: 'the most detail', lines: 'lines that lead to it' })[kind] + '.'));
    return {};
  });

  /* ================================================================ draw-hands and draw-nose: right and wrong side by side */
  function hand(g, good, cx, by) {
    var line = { fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2, 'stroke-linejoin': 'round' };
    if (good) {
      var pw = 64, ph = 70, px = cx - pw / 2, py = by - ph, lens = [0.86, 1.0, 0.94, 0.74], lift = [6, 0, 3, 13];
      for (var i = 0; i < 4; i++) { var fx = px + 3 + i * 15.5, top = py + lift[i] - ph * lens[i]; sv('rect', Object.assign({ x: f1(fx), y: f1(top), width: 13.5, height: f1(py + lift[i] - top + 12), rx: 6.5 }, line), g); }
      sv('path', Object.assign({ d: 'M' + f1(px) + ',' + f1(py + 4) + ' Q' + f1(cx) + ',' + f1(py - 6) + ' ' + f1(px + pw) + ',' + f1(py + 8) + ' L' + f1(px + pw - 3) + ',' + f1(by) + ' Q' + f1(cx) + ',' + f1(by + 12) + ' ' + f1(px + 4) + ',' + f1(by) + ' Z' }, line), g);
      sv('path', Object.assign({ d: 'M' + f1(px + 4) + ',' + f1(by - 26) + ' Q' + f1(px - 24) + ',' + f1(by - 36) + ' ' + f1(px - 30) + ',' + f1(by - 62) + ' Q' + f1(px - 22) + ',' + f1(by - 70) + ' ' + f1(px - 14) + ',' + f1(by - 58) + ' Q' + f1(px - 6) + ',' + f1(by - 46) + ' ' + f1(px + 6) + ',' + f1(by - 50) + ' Z' }, line), g);
      sv('path', { d: 'M' + f1(px + 6) + ',' + f1(py + 6) + ' Q' + f1(cx) + ',' + f1(py - 3) + ' ' + f1(px + pw - 4) + ',' + f1(py + 9), fill: 'none', stroke: '#c98a2a', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, g);
      for (i = 0; i < 4; i++) { var kx = px + 3 + i * 15.5, ky = py + lift[i] - ph * lens[i] * 0.45; sv('line', { x1: f1(kx + 3), y1: f1(ky), x2: f1(kx + 10.5), y2: f1(ky), stroke: '#c98a2a', 'stroke-width': 1.2 }, g); }
    } else {
      var w = 72, h2 = 66, x0 = cx - w / 2, y0 = by - h2;
      sv('rect', Object.assign({ x: f1(x0), y: f1(y0), width: w, height: h2, rx: 4 }, line), g);
      for (var j = 0; j < 5; j++) sv('rect', Object.assign({ x: f1(x0 - 14 + j * 20), y: f1(y0 - 52), width: 15, height: 58, rx: 7.5 }, line), g);
      sv('line', { x1: f1(x0 - 12), y1: f1(y0), x2: f1(x0 + w + 12), y2: f1(y0), stroke: '#c98a2a', 'stroke-width': 1.5 }, g);
    }
  }
  function nose(g, good, cx, cy, o) {
    o = o || {};
    sv('ellipse', { cx: cx, cy: cy, rx: 70, ry: 92, fill: SKIN, stroke: SKIN_LINE, 'stroke-width': 2 }, g);
    sv('path', { d: 'M' + (cx - 72) + ',' + (cy - 30) + ' Q' + (cx - 76) + ',' + (cy - 100) + ' ' + cx + ',' + (cy - 96) + ' Q' + (cx + 76) + ',' + (cy - 100) + ' ' + (cx + 72) + ',' + (cy - 30) + ' Q' + (cx + 60) + ',' + (cy - 70) + ' ' + (cx + 10) + ',' + (cy - 72) + ' Q' + (cx - 50) + ',' + (cy - 74) + ' ' + (cx - 72) + ',' + (cy - 30) + ' Z', fill: o.hair || '#5b3a1e' }, g);
    [-1, 1].forEach(function (sd) { sv('ellipse', { cx: cx + sd * 27, cy: cy - 40, rx: 12, ry: 6, fill: '#fff', stroke: '#6b5a3a', 'stroke-width': 1.5 }, g); sv('circle', { cx: cx + sd * 27, cy: cy - 40, r: 4.5, fill: '#3a2a1a' }, g); sv('path', { d: 'M' + (cx + sd * 15) + ',' + (cy - 53) + ' Q' + (cx + sd * 27) + ',' + (cy - 60) + ' ' + (cx + sd * 40) + ',' + (cy - 52), fill: 'none', stroke: '#5b3a1e', 'stroke-width': 3, 'stroke-linecap': 'round' }, g); });
    if (o.glasses) { [-1, 1].forEach(function (sd) { sv('circle', { cx: cx + sd * 27, cy: cy - 40, r: 17, fill: 'none', stroke: '#3a3a3a', 'stroke-width': 2.5 }, g); }); sv('path', { d: 'M' + (cx - 10) + ',' + (cy - 42) + ' Q' + cx + ',' + (cy - 48) + ' ' + (cx + 10) + ',' + (cy - 42), fill: 'none', stroke: '#3a3a3a', 'stroke-width': 2.5 }, g); }
    var ny = cy + 12;
    if (good) {
      sv('path', { d: 'M' + (cx + 4) + ',' + (cy - 30) + ' Q' + (cx + 12) + ',' + (cy - 5) + ' ' + (cx + 14) + ',' + (ny - 4) + ' Q' + (cx + 8) + ',' + (ny + 2) + ' ' + (cx + 2) + ',' + (ny - 2) + ' Q' + (cx + 4) + ',' + (cy - 8) + ' ' + (cx + 4) + ',' + (cy - 30) + ' Z', fill: 'rgba(201,138,42,.45)' }, g); // the shadow side plane
      sv('path', { d: 'M' + (cx - 14) + ',' + (ny + 2) + ' Q' + cx + ',' + (ny + 10) + ' ' + (cx + 15) + ',' + (ny + 2) + ' Q' + cx + ',' + (ny + 6) + ' ' + (cx - 14) + ',' + (ny + 2) + ' Z', fill: 'rgba(160,100,30,.55)' }, g); // shadow under the tip
      sv('ellipse', { cx: cx - 7, cy: ny + 1, rx: 4, ry: 2.4, fill: '#7a4a1a' }, g); sv('ellipse', { cx: cx + 7, cy: ny + 1, rx: 4, ry: 2.4, fill: '#7a4a1a' }, g);
      sv('ellipse', { cx: cx - 2, cy: ny - 9, rx: 3, ry: 2, fill: '#fff4cf' }, g);
      sv('path', { d: 'M' + (cx - 17) + ',' + (ny - 3) + ' q-3,5 2,8', fill: 'none', stroke: '#c98a2a', 'stroke-width': 1.5 }, g); sv('path', { d: 'M' + (cx + 17) + ',' + (ny - 3) + ' q3,5 -2,8', fill: 'none', stroke: '#c98a2a', 'stroke-width': 1.5 }, g);
    } else {
      sv('path', { d: 'M' + (cx - 8) + ',' + (cy - 46) + ' L' + (cx - 13) + ',' + (ny - 2) + ' Q' + (cx - 22) + ',' + (ny + 2) + ' ' + (cx - 14) + ',' + (ny + 8) + ' Q' + cx + ',' + (ny + 16) + ' ' + (cx + 14) + ',' + (ny + 8) + ' Q' + (cx + 22) + ',' + (ny + 2) + ' ' + (cx + 13) + ',' + (ny - 2) + ' L' + (cx + 8) + ',' + (cy - 46), fill: 'none', stroke: '#5a4630', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
      sv('circle', { cx: cx - 7, cy: ny + 4, r: 3, fill: 'none', stroke: '#5a4630', 'stroke-width': 2 }, g); sv('circle', { cx: cx + 7, cy: ny + 4, r: 3, fill: 'none', stroke: '#5a4630', 'stroke-width': 2 }, g);
    }
    sv('path', { d: 'M' + (cx - 27) + ',' + (cy + 40) + ' Q' + cx + ',' + (cy + 46) + ' ' + (cx + 27) + ',' + (cy + 40), fill: 'none', stroke: '#8a3b2b', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    if (good) sv('path', { d: 'M' + (cx - 20) + ',' + (cy + 48) + ' Q' + cx + ',' + (cy + 54) + ' ' + (cx + 20) + ',' + (cy + 48), fill: 'none', stroke: 'rgba(201,138,42,.5)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
  }
  function pair(name, label, drawOne, W0, H0, hintGood, hintBad) {
    V.register(name, function (el, o) {
      var good = o.good === 'A' ? 0 : 1, F = frame(el, o, name.replace('draw-', ''), label);
      cards(F, 2, W0, H0, function (i) { return label + ' ' + letter(i); }, function () { return ''; }, function (s, i) { sv('rect', { x: 0, y: 0, width: W0, height: H0, class: 'drwb-paper' }, s); drawOne(sv('g', null, s), i === good, W0, H0, o); });
      if (!F.quiet) F.body.appendChild(h('p', 'arv-hint', letter(good) + ': ' + hintGood + ' ' + letter(1 - good) + ': ' + hintBad));
      return {};
    });
  }
  pair('draw-hands', 'Hand', function (g, good, W0, H0, o) { var gg = o.flip ? sv('g', { transform: 'translate(' + W0 + ',0) scale(-1,1)' }, g) : g; hand(gg, good, W0 / 2 + 10, H0 - 22); if (o.cuff) sv('rect', { x: W0 / 2 - 34, y: H0 - 16, width: 88, height: 16, rx: 4, fill: o.cuff, stroke: 'rgba(0,0,0,.3)' }, gg); }, 200, 200, 'the mitten shape first; the middle finger is longest, the little finger shortest, and the knuckles make an arc (dashed).', 'five equal sausages in a straight row.');
  pair('draw-nose', 'Nose', function (g, good, W0, H0, o) { nose(g, good, W0 / 2, H0 / 2 + 4, o); }, 200, 210, 'the nose comes from its shadow side, the shadow under the tip and the nostrils; no outline.', 'an outline all the way around makes it look flat and pasted on.');
})(window, typeof document !== 'undefined' ? document : null);
