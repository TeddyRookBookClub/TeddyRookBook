/* gb-root-n: Schrödinger's "√n law", his answer to "Why are atoms so small?". Physical laws are averages over huge
   numbers of molecules, and an average over n molecules is off by roughly √n of them, a share of about 1/√n.
   Each dot is one trial: n molecules, each equally likely to be on the left or right half of a box; the dot shows
   the share on the left. With few molecules the dots scatter widely; with many they crowd onto 50%. The band shows
   a strip 1/√n wide around 50%. Our own design, seeded. opts: n index 0–6 (10 … 10,000,000). */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, NS = [10, 100, 1000, 10000, 100000, 1000000, 10000000];
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  V.register('gb-root-n', function (el, o) {
    o = o || {};
    var ni = o.n == null ? 1 : +o.n, seed = 3, pts = [];
    var c = V.canvas(el, { aspect: 2, min: 200, max: 280 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'Molecules in each trial', min: 0, max: NS.length - 1, step: 1, value: ni, fmt: function (v) { return NS[v].toLocaleString('en-US'); }, input: function (v) { ni = v; run(); } });
    V.button(ctl, 'Run 40 new trials', function () { seed = (seed * 37 + 11) % 99991; run(); });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function run() {
      var R = rng(seed + ni * 101), n = NS[ni]; pts = [];
      for (var i = 0; i < 40; i++) {
        var left;
        if (n <= 100) { left = 0; for (var j = 0; j < n; j++) if (R() < 0.5) left++; }
        else { var u = M.max(1e-12, R()), v = R(); left = n / 2 + M.sqrt(-2 * M.log(u)) * M.cos(2 * M.PI * v) * M.sqrt(n) / 2; }
        pts.push(left / n);
      }
      draw();
    }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, x0 = 20, x1 = w - 20, mid = h * 0.5, n = NS[ni];
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, h); g.restore();
      var X = function (f) { return x0 + (x1 - x0) * f; }, band = 1 / M.sqrt(n);
      g.fillStyle = k.goldSoft; g.fillRect(X(0.5 - band / 2), 26, X(0.5 + band / 2) - X(0.5 - band / 2), h - 70);
      g.strokeStyle = k.axis; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, h - 40); g.lineTo(x1, h - 40); g.stroke();
      g.strokeStyle = k.green; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(X(0.5), 22); g.lineTo(X(0.5), h - 40); g.stroke(); g.setLineDash([]);
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.textAlign = 'center';
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) { g.fillText(M.round(f * 100) + '%', X(f), h - 26); });
      g.fillText('share of the molecules in the left half', (x0 + x1) / 2, h - 10);
      g.fillStyle = k.blue;
      pts.forEach(function (f, i) { g.beginPath(); g.arc(X(f), 34 + (i % 10) * ((h - 84) / 10), 4, 0, 2 * M.PI); g.fill(); });
      var lo = M.min.apply(null, pts), hi = M.max.apply(null, pts);
      c.cv.setAttribute('aria-label', '40 trials of ' + n + ' molecules; shares range from ' + V.fmt(lo * 100, 1) + ' to ' + V.fmt(hi * 100, 1) + ' percent');
      out.set('With <b>' + n.toLocaleString('en-US') + '</b> molecules, √n ≈ ' + M.round(M.sqrt(n)).toLocaleString('en-US') + ', so a trial is typically off by about 1/√n ≈ <b>' + V.fmt(100 / M.sqrt(n), n >= 100000 ? 3 : 1) + '%</b>. These 40 trials ran from ' + V.fmt(lo * 100, 2) + '% to ' + V.fmt(hi * 100, 2) + '%. Schrödinger’s point: a living body must be large compared with atoms for its laws to be exact, which made the tiny, steady gene a puzzle.');
    }
    c.onResize(draw); V.onTheme(draw); run();
    return {};
  });
})();
