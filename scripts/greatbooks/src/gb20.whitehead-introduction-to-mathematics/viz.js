/* gb-waves: Whitehead's chapters on periodicity and series. Add sine waves one at a time and watch them build a
   square wave or a sawtooth (a Fourier series):
     square    (4/π) [ sin x + sin 3x / 3 + sin 5x / 5 + … ]
     sawtooth  (2/π) [ sin x − sin 2x / 2 + sin 3x / 3 − … ]
   The faint curve is the newest wave added. Our own design. opts: shape: 'square' | 'saw'; terms: 1–25. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math;
  V.register('gb-waves', function (el, o) {
    o = o || {};
    var shape = o.shape || 'square', terms = o.terms == null ? 3 : +o.terms;
    var c = V.canvas(el, { aspect: 2, min: 200, max: 300 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'Target shape', items: [['square', 'Square wave'], ['saw', 'Sawtooth']], value: shape, change: function (v) { shape = v; draw(); } });
    V.slider(ctl, { label: 'Number of sine waves added', min: 1, max: 25, step: 1, value: terms, input: function (v) { terms = v; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function term(n, x) { // the n-th wave of the chosen series (n = 1, 2, 3 …)
      if (shape === 'square') { var m = 2 * n - 1; return 4 / M.PI * M.sin(m * x) / m; }
      return 2 / M.PI * (n % 2 ? 1 : -1) * M.sin(n * x) / n;
    }
    function target(x) { var t = ((x % (2 * M.PI)) + 2 * M.PI) % (2 * M.PI); return shape === 'square' ? (t < M.PI ? 1 : -1) : (t < M.PI ? t / M.PI : t / M.PI - 2); }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, x0 = 12, x1 = w - 12, mid = h / 2, A = h * 0.33;
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, h); g.restore();
      g.strokeStyle = k.grid; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, mid); g.lineTo(x1, mid); g.stroke();
      var X = function (x) { return x0 + (x1 - x0) * x / (4 * M.PI); }, Y = function (y) { return mid - y * A; };
      function curve(f, col, lw, dash) {
        g.strokeStyle = col; g.lineWidth = lw; g.setLineDash(dash || []); g.beginPath();
        for (var i = 0; i <= 600; i++) { var x = 4 * M.PI * i / 600, y = f(x); if (i) g.lineTo(X(x), Y(y)); else g.moveTo(X(x), Y(y)); }
        g.stroke(); g.setLineDash([]);
      }
      curve(target, k.muted, 1.5, [5, 4]);
      curve(function (x) { return term(terms, x); }, k.goldSoft, 2);
      curve(function (x) { var s = 0; for (var n = 1; n <= terms; n++) s += term(n, x); return s; }, k.green, 2.5);
      g.fillStyle = k.ink; g.font = '600 13px system-ui,sans-serif'; g.textAlign = 'left';
      g.fillText(terms + (terms === 1 ? ' wave' : ' waves') + ' added', x0 + 4, 18);
      var list = []; for (var n = 1; n <= M.min(terms, 4); n++) list.push(shape === 'square' ? 'sin ' + (2 * n - 1 === 1 ? '' : (2 * n - 1)) + 'x' + (n > 1 ? '/' + (2 * n - 1) : '') : (n > 1 && n % 2 === 0 ? '− ' : n > 1 ? '+ ' : '') + 'sin ' + (n === 1 ? '' : n) + 'x' + (n > 1 ? '/' + n : ''));
      c.cv.setAttribute('aria-label', 'A ' + (shape === 'square' ? 'square wave' : 'sawtooth') + ' built from ' + terms + ' sine waves');
      out.set('Adding ' + list.join(shape === 'square' ? ' + ' : ' ') + (terms > 4 ? ' …' : '') + '. Each wave is smooth and repeats, yet together they make corners. Whitehead’s chapters on periodicity and series lead up to this: many repeating things in nature, from sound to tides, can be built from simple waves.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
