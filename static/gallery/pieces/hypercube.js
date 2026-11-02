/* The 4D hypercube (tesseract): 16 corners, 32 edges, turned in a 4D plane and projected 4D -> 3D -> 2D, beside a 3D cube
   turned and projected 3D -> 2D (the same idea one step down). Our own drawing. */
Gallery.piece('hypercube', function (g) {
  var M = Math, a4 = { xw: 0.5, yw: 0, zw: 0 }, spin = 0.35, view = 0.45, sp = { xw: 1, yw: 0, zw: 0 };
  var split = g.el('div', 'gx-split'); g.stage.appendChild(split);
  var p1 = g.el('div'), p2 = g.el('div'); split.appendChild(p1); split.appendChild(p2);
  var c3 = g.canvas({ parent: p1, aspect: 0.9, max: 420, min: 240, label: 'A cube turning, drawn flat: its shadow is a square inside a square' });
  var c4 = g.canvas({ parent: p2, aspect: 0.9, max: 420, min: 240, label: 'A 4D hypercube turning, drawn flat: a cube inside a cube, joined corner to corner' });
  p1.appendChild(g.el('span', 'gx-cap', '3D cube → flat page')); p2.appendChild(g.el('span', 'gx-cap', '4D hypercube → 3D → flat page'));

  function corners(d) { var v = [], i, k; for (i = 0; i < (1 << d); i++) { var p = []; for (k = 0; k < d; k++) p.push(i >> k & 1 ? 1 : -1); v.push(p); } return v; }
  function edges(d) { var e = [], i, k; for (i = 0; i < (1 << d); i++) for (k = 0; k < d; k++) if (!(i >> k & 1)) e.push([i, i | 1 << k, k]); return e; }
  var V3 = corners(3), E3 = edges(3), V4 = corners(4), E4 = edges(4);
  function rot(p, i, j, t) { var c = M.cos(t), s = M.sin(t), a = p[i], b = p[j]; p[i] = a * c - b * s; p[j] = a * s + b * c; }
  // perspective from dimension d to d-1: divide by (dist - last coordinate)
  function persp(p, dist) { var f = 1 / (dist - p[p.length - 1]); return p.slice(0, -1).map(function (v) { return v * f; }); }

  function scene(c, col, V, E, d, ang) {
    var x = c.ctx, W = c.w, H = c.h, s = M.min(W, H) * (d === 4 ? 1.35 : 0.8), P = [], Z = [];
    c.clear(col.bg);
    V.forEach(function (v) {
      var p = v.slice();
      if (d === 4) { rot(p, 0, 3, a4.xw); rot(p, 1, 3, a4.yw); rot(p, 2, 3, a4.zw); p = persp(p, 3); Z.push(v[3]); }
      else { rot(p, 0, 2, ang); Z.push(v[2]); }
      rot(p, 1, 2, view); rot(p, 0, 2, 0.35);  // a fixed 3D viewing angle
      var q = persp(p, d === 4 ? 2.2 : 4);
      P.push([W / 2 + q[0] * s * (d === 4 ? 0.62 : 0.85), H / 2 + 8 - q[1] * s * (d === 4 ? 0.62 : 0.85)]);
    });
    var cl = [col.green, col.blue, col.gold, col.red];
    x.lineCap = 'round';
    E.forEach(function (e) {
      x.strokeStyle = cl[e[2]]; x.lineWidth = e[2] === d - 1 ? 1.6 : 2.4; x.globalAlpha = e[2] === d - 1 ? 0.8 : 1;
      x.beginPath(); x.moveTo(P[e[0]][0], P[e[0]][1]); x.lineTo(P[e[1]][0], P[e[1]][1]); x.stroke();
    });
    x.globalAlpha = 1;
    P.forEach(function (p, i) { x.fillStyle = Z[i] > 0 ? col.ink : col.muted; x.beginPath(); x.arc(p[0], p[1], 3.2, 0, 7); x.fill(); });
  }
  var a3 = 0.5;
  g.draw(function (col) { scene(c3, col, V3, E3, 3, a3); scene(c4, col, V4, E4, 4); });

  var row = g.group();
  var PL = { xw: 'x–w', yw: 'y–w', zw: 'z–w' };
  ['xw', 'yw', 'zw'].forEach(function (k) {
    g.toggle('Turn in the ' + PL[k] + ' plane', sp[k], function (v) { sp[k] = v; }, { parent: row });
  });
  var row2 = g.group();
  g.slider({ label: 'Speed', min: 0, max: 1, step: 0.05, value: spin, parent: row2, fmt: function (v) { return v.toFixed(2); }, input: function (v) { spin = v; } });
  g.slider({ label: 'Tilt', min: -1.2, max: 1.2, step: 0.05, value: view, parent: row2, fmt: function (v) { return M.round(v * 57.3) + '°'; }, input: function (v) { view = v; g.redraw(); } });
  var L = g.loop(function (dt) {
    var t = dt * spin * 2;
    a3 += t; for (var k in sp) if (sp[k]) a4[k] += t;
    g.redraw();
  }, { stepSize: 0.25, parent: g.group() });
  var o1 = g.out(), o2 = g.out();
  o1.innerHTML = 'Cube: <b>8</b> corners, <b>12</b> edges, <b>6</b> square faces';
  o2.innerHTML = 'Hypercube: <b>16</b> corners, <b>32</b> edges, <b>24</b> squares, <b>8</b> cubes';
  function nudge(k, d) { a4[k] += d; a3 += d; g.redraw(); }
  g.keys(c4.el, { ArrowLeft: function () { nudge('xw', -0.1); }, ArrowRight: function () { nudge('xw', 0.1); }, ArrowUp: function () { nudge('yw', 0.1); }, ArrowDown: function () { nudge('yw', -0.1); } });
  var last = null;
  g.drag(c4.el, { down: function (x, y) { last = [x, y]; L.pause(); }, move: function (x, y) { if (!last) return; a4.xw += (x - last[0]) * 0.01; a4.yw += (y - last[1]) * 0.01; a3 += (x - last[0]) * 0.01; last = [x, y]; g.redraw(); }, up: function () { last = null; } });
  c4.el.setAttribute('aria-label', c4.el.getAttribute('aria-label') + '. Drag or use the arrow keys to turn it.');
});
