/* gb-drift: gene frequencies in populations, the raw material of Dobzhansky's synthesis. Eight separate populations
   start with a gene version (allele) A at 50%. Each generation the next one is drawn at random from the last
   (the Wright–Fisher model), with an optional advantage s for A. Small populations wander and often lose or fix A
   by chance (genetic drift); large ones hold steady unless selection pushes them. Our own design, seeded so the first
   picture is the same each time. opts: N: 10–1000; s: 0–0.1; gens: 100. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math;
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function binom(n, p, R) { // exact for small n, normal approximation for large n
    if (n <= 60) { var x = 0; for (var i = 0; i < n; i++) if (R() < p) x++; return x; }
    var u = M.max(1e-12, R()), v = R(), z = M.sqrt(-2 * M.log(u)) * M.cos(2 * M.PI * v);
    return M.max(0, M.min(n, M.round(n * p + z * M.sqrt(n * p * (1 - p)))));
  }
  V.register('gb-drift', function (el, o) {
    o = o || {};
    var N = o.N == null ? 20 : +o.N, s = o.s == null ? 0 : +o.s, G = o.gens || 100, seed = 7, runs = [];
    var c = V.canvas(el, { aspect: 1.8, min: 220, max: 320 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    var Ns = [10, 20, 50, 100, 200, 500, 1000];
    V.slider(ctl, { label: 'Population size', min: 0, max: Ns.length - 1, step: 1, value: M.max(0, Ns.indexOf(N)), fmt: function (v) { return String(Ns[v]); }, input: function (v) { N = Ns[v]; run(); } });
    V.slider(ctl, { label: 'Advantage for A (selection)', min: 0, max: 0.1, step: 0.01, value: s, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { s = v; run(); } });
    V.button(ctl, 'New random history', function () { seed = (seed * 31 + 17) % 100000; run(); });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function run() {
      var R = rng(seed + N); runs = [];
      for (var r = 0; r < 8; r++) {
        var p = 0.5, path = [p];
        for (var t = 0; t < G; t++) { var q = p * (1 + s) / (p * (1 + s) + (1 - p)); p = binom(2 * N, q, R) / (2 * N); path.push(p); }
        runs.push(path);
      }
      draw();
    }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, x0 = 38, x1 = w - 12, y0 = 14, y1 = h - 30;
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, h); g.restore();
      g.strokeStyle = k.grid; g.lineWidth = 1;
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) { var y = y1 - (y1 - y0) * f; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); });
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.textAlign = 'right';
      g.fillText('100%', x0 - 4, y0 + 4); g.fillText('50%', x0 - 4, (y0 + y1) / 2 + 4); g.fillText('0%', x0 - 4, y1 + 4);
      g.textAlign = 'center'; g.fillText('generations (0 to ' + G + ')', (x0 + x1) / 2, h - 10);
      var cols = [k.green, k.blue, k.red, k.gold, k.purple, k.orange, k.teal, k.pink], lost = 0, fixed = 0;
      runs.forEach(function (path, i) {
        g.strokeStyle = cols[i]; g.lineWidth = 2; g.beginPath();
        path.forEach(function (p, t) { var x = x0 + (x1 - x0) * t / G, y = y1 - (y1 - y0) * p; if (t) g.lineTo(x, y); else g.moveTo(x, y); });
        g.stroke(); var e = path[path.length - 1]; if (e === 0) lost++; if (e === 1) fixed++;
      });
      c.cv.setAttribute('aria-label', 'Eight populations of ' + N + ' showing the share of allele A over ' + G + ' generations');
      out.set('Population of <b>' + N + '</b>' + (s ? ', with A favored by ' + M.round(s * 100) + '%' : ', no selection') + '. After ' + G + ' generations, A was lost in ' + lost + ' and took over in ' + fixed + ' of the 8 populations. ' +
        (s === 0 ? (N <= 50 ? 'Small populations drift: chance alone pulls them apart.' : 'Large populations drift slowly; their lines stay closer to 50%.') : (N <= 20 ? 'Even with an advantage, chance can still win in a very small group.' : 'Selection pushes A upward fairly steadily.')) +
        ' Each line is a separate population of one species: by chance and by selection their gene pools grow apart, the first step in Dobzhansky’s picture of how new species begin.');
    }
    c.onResize(draw); V.onTheme(draw); run();
    return {};
  });
})();
