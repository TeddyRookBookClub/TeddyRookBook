/* Penrose tiling (thin and thick rhombs) made by deflation: every tile is cut into smaller tiles by a fixed rule, again and
   again. Each rhomb is kept as two "Robinson" half-triangles, which makes the rule short. Our own drawing and colors. */
Gallery.piece('penrose-tiling', function (g) {
  var M = Math, PHI = (1 + M.sqrt(5)) / 2, level = 0, fade = 1, prev = null, cur = null, MAXL = 8, hold = 0, edges = true;
  var c = g.canvas({ aspect: 0.62, max: 520, min: 280, label: 'A Penrose tiling of thin and thick diamond-shaped tiles' });
  // a triangle: [type, A, B, C] (points as [x, y]); type 0 = half of a thin rhomb (36° at A), 1 = half of a thick rhomb (108° at A)
  function start() {
    var t = [], R = 1, i;
    for (i = 0; i < 10; i++) {
      var b = [R * M.cos((2 * i - 1) * M.PI / 10), R * M.sin((2 * i - 1) * M.PI / 10)], cc = [R * M.cos((2 * i + 1) * M.PI / 10), R * M.sin((2 * i + 1) * M.PI / 10)];
      if (i % 2) { var q = b; b = cc; cc = q; }   // mirror every other one so the halves meet properly
      t.push([0, [0, 0], b, cc]);
    }
    return t;
  }
  function mix(p, q, f) { return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]; }
  function deflate(T) {
    var out = [];
    T.forEach(function (t) {
      var A = t[1], B = t[2], C = t[3];
      if (t[0] === 0) { var P = mix(A, B, 1 / PHI); out.push([0, C, P, B], [1, P, C, A]); }
      else { var Q = mix(B, A, 1 / PHI), R = mix(B, C, 1 / PHI); out.push([1, R, C, A], [1, Q, R, B], [0, R, Q, A]); }
    });
    return out;
  }
  var cache = [start()];
  function tiles(n) { while (cache.length <= n) cache.push(deflate(cache[cache.length - 1])); return cache[n]; }
  function setLevel(n, animate) {
    n = M.max(0, M.min(MAXL, n)); if (n === level && cur) return;
    prev = animate && !g.reduced ? cur : null; level = n; cur = tiles(n); fade = prev ? 0 : 1;
    var thin = 0, thick = 0; cur.forEach(function (t) { if (t[0]) thick++; else thin++; });
    cnt.innerHTML = 'Level <b>' + n + '</b> · thin <b>' + g.fmt(thin / 2) + '</b> · thick <b>' + g.fmt(thick / 2) + '</b>';
    rat.innerHTML = 'Thick ÷ thin: <b>' + (thin ? g.fmt(thick / thin, 4) : '—') + '</b> (φ ≈ 1.6180)';
    lv.set(n); g.say('Level ' + n + ': ' + thin / 2 + ' thin and ' + thick / 2 + ' thick tiles (counting halves at the rim)');
    g.redraw();
  }
  function paint(T, col, alpha) {
    var x = c.ctx, W = c.w, H = c.h, k = M.sqrt(W * W + H * H) / 2 * 1.02;
    var f0 = col.dark ? '#2f6b4f' : '#8fcaa9', f1 = col.dark ? '#7a6630' : '#e6cf8f';
    x.globalAlpha = alpha;
    [0, 1].forEach(function (ty) {
      x.fillStyle = ty ? f1 : f0; x.beginPath();
      T.forEach(function (t) { if (t[0] !== ty) return; x.moveTo(W / 2 + t[1][0] * k, H / 2 + t[1][1] * k); x.lineTo(W / 2 + t[2][0] * k, H / 2 + t[2][1] * k); x.lineTo(W / 2 + t[3][0] * k, H / 2 + t[3][1] * k); x.closePath(); });
      x.fill();
    });
    if (edges) { // outline the rhomb sides (C-A-B), not the line that joins the two halves
      x.strokeStyle = col.dark ? '#0d1611' : '#24392d'; x.lineWidth = M.max(0.5, M.min(2, 16 / M.pow(PHI, level + 1.5))); x.lineJoin = 'round'; x.beginPath();
      T.forEach(function (t) { x.moveTo(W / 2 + t[3][0] * k, H / 2 + t[3][1] * k); x.lineTo(W / 2 + t[1][0] * k, H / 2 + t[1][1] * k); x.lineTo(W / 2 + t[2][0] * k, H / 2 + t[2][1] * k); });
      x.stroke();
    }
    x.globalAlpha = 1;
  }
  g.draw(function (col) {
    c.clear(col.bg);
    if (prev && fade < 1) paint(prev, col, 1);
    paint(cur, col, fade);
  });
  var row = g.group();
  var lv = g.slider({ label: 'Level', min: 0, max: MAXL, value: 0, parent: row, input: function (v) { setLevel(v, false); } });
  g.button('Cut once more', function () { setLevel(level < MAXL ? level + 1 : 0, true); }, { parent: row });
  g.toggle('Outline tiles', edges, function (v) { edges = v; g.redraw(); }, { parent: row });
  g.loop(function (dt) {
    if (fade < 1) { fade = M.min(1, fade + dt * 1.4); if (fade >= 1) prev = null; g.redraw(); return; }
    hold += dt; if (hold > 1.4) { hold = 0; setLevel(level < 6 ? level + 1 : 0, true); }
  }, { stepSize: 1.5, parent: row });
  var cnt = g.out(), rat = g.out();
  c.onresize = function () { g.redraw(); };
  setLevel(g.reduced ? 5 : 0, false);
});
