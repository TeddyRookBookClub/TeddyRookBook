/* The Ulam spiral (Stanislaw Ulam, 1963): write 1, 2, 3, … in a square spiral and mark the primes. Diagonal streaks
   appear. A "random" twin with the same thinning-out shows which patterns are real. Our own drawing. */
Gallery.piece('ulam-spiral', function (g) {
  var M = Math, N = 101, start = 1, mode = 'primes', pos = [], idx = null, isP = null, rnd = null, cur = null, hl = false;
  var c = g.canvas({ aspect: 1, max: 560, min: 280, label: 'Numbers in a square spiral, primes marked' });
  function sieve(n) { var a = new Uint8Array(n + 1), i, j; a.fill(1); a[0] = a[1] = 0; for (i = 2; i * i <= n; i++) if (a[i]) for (j = i * i; j <= n; j += i) a[j] = 0; return a; }
  function spiral(n) { // cell for the k-th number (k = 0 is the center)
    var p = [], x = 0, y = 0, dx = 1, dy = 0, len = 1, k = 0, t, q;
    while (k < n * n) {
      for (t = 0; t < 2 && k < n * n; t++) { for (q = 0; q < len && k < n * n; q++) { p.push([x, y]); k++; x += dx; y += dy; } var d = dx; dx = -dy; dy = d; }
      len++;
    }
    return p;
  }
  function build() {
    pos = spiral(N); var h0 = (N - 1) / 2; idx = new Int32Array(N * N); pos.forEach(function (p, k) { idx[(p[0] + h0) * N + (h0 - p[1])] = k; }); var top = start + N * N; isP = sieve(top);
    var r = g.rng(7); rnd = new Uint8Array(top + 1);
    for (var n = 3; n <= top; n += 2) if (r() < 2 / M.log(n)) rnd[n] = 1;   // odd numbers kept with chance about 2 / ln n
    if (top >= 2) rnd[2] = 1;
    var cn = 0; for (var k = start; k < top; k++) if (isP[k]) cn++;
    info.innerHTML = 'Numbers <b>' + g.fmt(start) + '</b> to <b>' + g.fmt(top - 1) + '</b> · primes <b>' + g.fmt(cn) + '</b>';
    g.redraw();
  }
  function factor(n) { var f = [], p; for (p = 2; p * p <= n; p++) while (n % p === 0) { f.push(p); n /= p; } if (n > 1) f.push(n); return f; }
  function geo() { var S = M.min(c.w, c.h) - 12, cs = S / N; return { cs: cs, ox: (c.w - S) / 2, oy: (c.h - S) / 2, h: (N - 1) / 2 }; }
  g.draw(function (col) {
    var x = c.ctx, G = geo(), cs = G.cs, m = mode === 'random' ? rnd : isP, sz = M.max(1, cs * (cs > 4 ? 0.8 : 1));
    c.clear(col.bg);
    x.fillStyle = col.grid; x.fillRect(G.ox, G.oy, cs * N, cs * N);
    x.fillStyle = col.bg; x.fillRect(G.ox + 1, G.oy + 1, cs * N - 2, cs * N - 2);
    x.fillStyle = mode === 'random' ? col.blue : col.green;
    for (var k = 0; k < pos.length; k++) {
      var n = start + k; if (!m[n]) continue;
      var X = G.ox + (pos[k][0] + G.h) * cs, Y = G.oy + (G.h - pos[k][1]) * cs;
      if (hl && mode !== 'random' && euler(n)) continue;
      x.fillRect(X + (cs - sz) / 2, Y + (cs - sz) / 2, sz, sz);
    }
    if (hl && mode !== 'random') {
      x.fillStyle = col.red;
      for (k = 0; k < pos.length; k++) { n = start + k; if (m[n] && euler(n)) { X = G.ox + (pos[k][0] + G.h) * cs; Y = G.oy + (G.h - pos[k][1]) * cs; x.fillRect(X + (cs - sz) / 2 - 0.5, Y + (cs - sz) / 2 - 0.5, sz + 1, sz + 1); } }
    }
    if (cur != null) {
      var p = pos[cur]; x.strokeStyle = col.gold; x.lineWidth = 2;
      x.strokeRect(G.ox + (p[0] + G.h) * cs - 2, G.oy + (G.h - p[1]) * cs - 2, cs + 4, cs + 4);
    }
  });
  var EU = {}; function euler(n) { return EU[n]; }
  function mkEuler() { EU = {}; for (var t = 0; t * t + t + 41 < start + N * N; t++) EU[t * t + t + 41] = 1; }
  function pick(k) {
    cur = k; var n = start + k, f = factor(n);
    here.innerHTML = 'Square: <b>' + g.fmt(n) + '</b> ' + (n < 2 ? '(not prime)' : isP[n] ? '<b>is prime</b>' : '= ' + f.join(' × '));
    g.say(n + (isP[n] ? ' is prime' : n < 2 ? ' is not prime' : ' equals ' + f.join(' times ')));
    g.redraw();
  }
  function at(X, Y) {
    var G = geo(), i = M.floor((X - G.ox) / G.cs) - G.h, j = G.h - M.floor((Y - G.oy) / G.cs);
    if (M.abs(i) > G.h || M.abs(j) > G.h) return null;
    return idx[(i + G.h) * N + (G.h - j)];
  }
  g.drag(c.el, { touch: 'pan-y', down: function (X, Y) { var k = at(X, Y); if (k != null) pick(k); }, hover: function (X, Y) { var k = at(X, Y); if (k != null && k !== cur) pick(k); } });
  function mv(dx, dy) {
    var p = cur == null ? [0, 0] : pos[cur], i = p[0] + dx, j = p[1] + dy, h = (N - 1) / 2;
    if (M.abs(i) > h || M.abs(j) > h) return;
    pick(idx[(i + h) * N + (h - j)]);
  }
  g.keys(c.el, { ArrowLeft: function () { mv(-1, 0); }, ArrowRight: function () { mv(1, 0); }, ArrowUp: function () { mv(0, 1); }, ArrowDown: function () { mv(0, -1); } });
  c.el.setAttribute('aria-label', 'Numbers in a square spiral, primes marked. Tap a square, or use the arrow keys, to read its number.');
  var row = g.group();
  g.slider({ label: 'Size', min: 11, max: 301, step: 10, value: N, parent: row, fmt: function (v) { return v + ' × ' + v; }, input: function (v) { N = v; cur = null; mkEuler(); build(); } });
  g.select({ label: 'Start at', parent: row, value: '1', options: [['1', '1 (Ulam)'], ['41', '41 (see Euler’s formula)']], change: function (v) { start = +v; cur = null; mkEuler(); build(); } });
  var row2 = g.group();
  g.select({ label: 'Show', parent: row2, value: mode, options: [['primes', 'the primes'], ['random', 'a random look-alike']], change: function (v) { mode = v; g.redraw(); g.say(v === 'random' ? 'Showing odd numbers picked at random, as often as primes occur' : 'Showing the primes'); } });
  g.toggle('Mark n² + n + 41', hl, function (v) { hl = v; g.redraw(); }, { parent: row2 });
  var info = g.out(), here = g.out();
  here.textContent = 'Tap a square to read its number.';
  c.onresize = function () { g.redraw(); };
  mkEuler(); build();
});
