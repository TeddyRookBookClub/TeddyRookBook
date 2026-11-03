/* gbgreeks.euclid-solid-geometry: visuals gb-platonic (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

/* ---------- XIII: the five regular solids ---------- */
ML.viz.register('gb-platonic', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.5, max: 360 }), ro = V.readout(el);
  var phi = (1 + Math.sqrt(5)) / 2, S = {};
  function perms(list) { return list; }
  S.tetra = { name: 'Pyramid (tetrahedron)', F: 4, face: 'triangles', at: 3, fa: 60, v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] };
  S.cube = { name: 'Cube', F: 6, face: 'squares', at: 3, fa: 90, v: [] };
  [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [-1, 1].forEach(function (z) { S.cube.v.push([x, y, z]); }); }); });
  S.octa = { name: 'Octahedron', F: 8, face: 'triangles', at: 4, fa: 60, v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] };
  S.icosa = { name: 'Icosahedron', F: 20, face: 'triangles', at: 5, fa: 60, v: [] };
  [-1, 1].forEach(function (a) { [-phi, phi].forEach(function (b) { S.icosa.v.push([0, a, b], [a, b, 0], [b, 0, a]); }); });
  S.dodeca = { name: 'Dodecahedron', F: 12, face: 'pentagons', at: 3, fa: 108, v: S.cube.v.slice() };
  [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { S.dodeca.v.push([0, a / phi, b * phi], [a / phi, b * phi, 0], [b * phi, 0, a / phi]); }); });
  Object.keys(S).forEach(function (key) { // edges = pairs at the smallest distance
    var v = S[key].v, m = 1e9, e = [];
    for (var i = 0; i < v.length; i++) for (var j = i + 1; j < v.length; j++) { var d = Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2]); if (d < m - 1e-6) m = d; }
    for (i = 0; i < v.length; i++) for (j = i + 1; j < v.length; j++) { d = Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2]); if (Math.abs(d - m) < 1e-6) e.push([i, j]); }
    var R = Math.max.apply(null, v.map(function (p) { return Math.hypot(p[0], p[1], p[2]); }));
    S[key].v = v.map(function (p) { return [p[0] / R, p[1] / R, p[2] / R]; }); S[key].e = e;
  });
  var cur = opts.solid || 'cube', rx = 0.5, ry = 0.6, spin = null, drag0 = null;
  function draw() {
    var k = V.colors(), ctx = c.ctx, s = S[cur], cx = c.w / 2, cy = c.h / 2, R = Math.min(c.w, c.h) * 0.38;
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    var cxr = Math.cos(rx), sxr = Math.sin(rx), cyr = Math.cos(ry), syr = Math.sin(ry);
    var pts = s.v.map(function (p) { var x = p[0] * cyr + p[2] * syr, z = -p[0] * syr + p[2] * cyr, y = p[1] * cxr - z * sxr, z2 = p[1] * sxr + z * cxr; var f = 3.2 / (3.2 - z2); return [cx + x * R * f, cy - y * R * f, z2]; });
    var es = s.e.slice().sort(function (a, b) { return (pts[a[0]][2] + pts[a[1]][2]) - (pts[b[0]][2] + pts[b[1]][2]); });
    es.forEach(function (e) { var z = (pts[e[0]][2] + pts[e[1]][2]) / 2, front = z > -0.15; ctx.strokeStyle = front ? k.green : k.muted; ctx.globalAlpha = front ? 1 : 0.45; ctx.lineWidth = front ? 2.6 : 1.4; ctx.setLineDash(front ? [] : [4, 4]); ctx.beginPath(); ctx.moveTo(pts[e[0]][0], pts[e[0]][1]); ctx.lineTo(pts[e[1]][0], pts[e[1]][1]); ctx.stroke(); });
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    pts.forEach(function (p) { ctx.fillStyle = p[2] > -0.15 ? k.gold : k.muted; ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, 7); ctx.fill(); });
    var V0 = s.v.length, E = s.e.length, sum = s.at * s.fa;
    ro.set('<b>' + s.name + '</b>: ' + s.F + ' faces (' + s.face + '), ' + E + ' edges, ' + V0 + ' corners. At each corner ' + s.at + ' faces meet: ' + s.at + ' × ' + s.fa + '° = <b>' + sum + '°</b>, less than 360°, so the corner folds up into a solid. Corners − edges + faces = ' + V0 + ' − ' + E + ' + ' + s.F + ' = <b>' + (V0 - E + s.F) + '</b>.');
  }
  V.seg(B.ctl, { label: 'Solid', items: [['tetra', 'Pyramid'], ['cube', 'Cube'], ['octa', 'Octahedron'], ['dodeca', 'Dodecahedron'], ['icosa', 'Icosahedron']], value: cur, change: function (v) { cur = v; draw(); } });
  if (!RM) { spin = V.loop(el, function (dt) { if (drag0) return; ry += dt * 0.5; rx += dt * 0.13; draw(); }); V.button(B.ctl, 'Pause', function () { if (spin.running()) { spin.stop(); this.textContent = 'Spin'; } else { spin.start(); this.textContent = 'Pause'; } }); }
  V.drag(c.cv, { touchAction: 'pan-y', hit: function () { return 1; }, start: function (h, px, py) { drag0 = [px, py, rx, ry]; }, move: function (h, px, py) { ry = drag0[3] + (px - drag0[0]) / 90; rx = drag0[2] + (py - drag0[1]) / 90; draw(); }, end: function () { drag0 = null; } });
  c.onResize(draw); V.onTheme(draw); draw();
});
