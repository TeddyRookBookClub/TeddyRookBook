/* Space-filling curves: Hilbert (1891) and Peano (1890), level by level. Our own drawing: the path is drawn in order,
   its color moving from green to gold so you can see where it has been. */
Gallery.piece('space-filling-curves', function (g) {
  var M = Math, kind = 'hilbert', level = 3, pts = [], prog = 1, showCells = true;
  var MAX = { hilbert: 7, peano: 4 };
  var c = g.canvas({ aspect: 1, max: 540, min: 280, label: 'A curve that winds through every cell of a square grid' });

  // Hilbert: index d -> cell (x, y) on a 2^n grid (the classic rotate-and-flip method)
  function hilbert(n) {
    var N = 1 << n, out = [], d, x, y, s, rx, ry, t, q;
    for (d = 0; d < N * N; d++) {
      x = 0; y = 0; t = d;
      for (s = 1; s < N; s *= 2) {
        rx = 1 & (t / 2); ry = 1 & (t ^ rx);
        if (ry === 0) { if (rx === 1) { x = s - 1 - x; y = s - 1 - y; } q = x; x = y; y = q; }
        x += s * rx; y += s * ry; t = M.floor(t / 4);
      }
      out.push([x, y, N]);
    }
    return out;
  }
  // Peano: write the index in base 3 (2n digits); a digit flips (k -> 2 - k) when the digits it depends on add up odd
  function peano(n) {
    var N = M.pow(3, n), out = [], i, j, dg = [], v, x, y, se, so;
    for (i = 0; i < N * N; i++) {
      v = i; for (j = 2 * n - 1; j >= 0; j--) { dg[j] = v % 3; v = (v - dg[j]) / 3; }
      x = 0; y = 0; se = 0; so = 0;
      for (j = 0; j < n; j++) {
        var a = dg[2 * j], b = dg[2 * j + 1];
        x = x * 3 + (se % 2 ? 2 - a : a); so += a;
        y = y * 3 + (so % 2 ? 2 - b : b); se += b;
      }
      out.push([x, y, N]);
    }
    return out;
  }
  function build() {
    pts = kind === 'hilbert' ? hilbert(level) : peano(level);
    var N = pts[0][2], L = N - 1 / N;
    cells.innerHTML = 'Level <b>' + level + '</b> · <b>' + g.fmt(N * N) + '</b> cells';
    len.innerHTML = 'Length in a 1 × 1 square: <b>' + g.fmt(L, L < 10 ? 3 : 2) + '</b>';
    g.say((kind === 'hilbert' ? 'Hilbert' : 'Peano') + ' curve, level ' + level + ', ' + N * N + ' cells, length ' + g.fmt(L, 2));
    lv.set(level); lv.input.max = MAX[kind];
    g.redraw();
  }
  function hue(t, col) { // green to gold along the path
    var a = col.dark ? [108, 199, 154] : [0, 110, 60], b = col.dark ? [226, 192, 114] : [184, 140, 40];
    return 'rgb(' + M.round(a[0] + (b[0] - a[0]) * t) + ',' + M.round(a[1] + (b[1] - a[1]) * t) + ',' + M.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, S = M.min(W, H) - 24, ox = (W - S) / 2, oy = (H - S) / 2, N = pts[0][2], cs = S / N;
    c.clear(col.bg);
    x.strokeStyle = col.grid; x.lineWidth = 1; x.strokeRect(ox, oy, S, S);
    if (showCells && N <= 32) {
      x.beginPath();
      for (var i = 1; i < N; i++) { x.moveTo(ox + i * cs, oy); x.lineTo(ox + i * cs, oy + S); x.moveTo(ox, oy + i * cs); x.lineTo(ox + S, oy + i * cs); }
      x.stroke();
    }
    var n = pts.length, upto = M.max(1, M.floor(prog * (n - 1))), seg = 24, lw = M.max(1, M.min(4, cs * 0.28));
    x.lineWidth = lw; x.lineJoin = 'round'; x.lineCap = 'round';
    function P(k) { return [ox + (pts[k][0] + 0.5) * cs, oy + S - (pts[k][1] + 0.5) * cs]; }
    for (var s = 0; s < seg; s++) {
      var a = M.floor(s * (n - 1) / seg), b = M.min(upto, M.floor((s + 1) * (n - 1) / seg));
      if (a >= upto) break;
      x.strokeStyle = hue(s / (seg - 1), col); x.beginPath();
      var p = P(a); x.moveTo(p[0], p[1]);
      for (var k = a + 1; k <= b; k++) { p = P(k); x.lineTo(p[0], p[1]); }
      x.stroke();
    }
    var e = P(upto), st = P(0);
    x.fillStyle = col.green; x.beginPath(); x.arc(st[0], st[1], M.max(3, lw * 1.2), 0, 7); x.fill();
    if (prog < 1) { x.fillStyle = col.red; x.beginPath(); x.arc(e[0], e[1], M.max(3.5, lw * 1.4), 0, 7); x.fill(); }
  });

  var row = g.group();
  g.select({ label: 'Curve', parent: row, options: [['hilbert', 'Hilbert (2 × 2 blocks)'], ['peano', 'Peano (3 × 3 blocks)']], value: kind,
    change: function (v) { kind = v; level = M.min(level, MAX[v]); prog = 1; build(); } });
  var lv = g.slider({ label: 'Level', min: 1, max: MAX[kind], value: level, parent: row, input: function (v) { level = v; prog = 1; build(); } });
  var row2 = g.group();
  g.button('Level −', function () { if (level > 1) { level--; prog = 1; build(); } }, { parent: row2 });
  g.button('Level +', function () { if (level < MAX[kind]) { level++; prog = 1; build(); } }, { parent: row2 });
  g.button('Trace it', function () { prog = 0; L.play(); }, { parent: row2 });
  g.toggle('Show the cells', showCells, function (v) { showCells = v; g.redraw(); }, { parent: row2 });
  var L = g.loop(function (dt) {
    if (prog >= 1) prog = 0;
    prog = M.min(1, prog + dt / (2 + level * 0.8)); g.redraw();
    if (prog >= 1) return false;
  }, { auto: false, stepSize: 0.25, parent: row2 });
  var cells = g.out(), len = g.out();
  c.onresize = function () { g.redraw(); };
  build();
  if (!g.reduced) { prog = 0; L.play(); }
});
