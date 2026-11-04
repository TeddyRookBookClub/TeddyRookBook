/* gb-selection: natural selection in a few generations. Beetles of two colors on light or dark ground; birds catch the
   easy-to-see ones more often. Deterministic: 90% of hidden beetles and 50% of visible ones survive, and survivors
   breed back to 40. Our own design (uses ML.gb19kit). */
ML.viz.register('gb-selection', function (el, opts, V) {
  var K = ML.gb19kit, F = K.frame(el, 400, 250, 'Beetles on light or dark ground, generation by generation'), sv = F.svg, ro = V.readout(el);
  var N = 40, ground = opts.ground || 'dark', frac = 0.1, gen = 0, hist = [0.1];
  function step() {
    var dark = frac * N, light = N - dark, sd = ground === 'dark' ? 0.9 : 0.5, sl = ground === 'dark' ? 0.5 : 0.9;
    var a = dark * sd, b = light * sl; frac = a / (a + b); gen++; hist.push(frac); if (hist.length > 13) hist.shift();
  }
  function draw() {
    K.clear(sv); var S = K.S;
    S('rect', { x: 10, y: 10, width: 230, height: 230, rx: 10, 'class': ground === 'dark' ? 'gb19-ground-d' : 'gb19-ground-l' }, sv);
    var nd = Math.round(frac * N);
    for (var i = 0; i < N; i++) {
      var col = i % 8, row = Math.floor(i / 8), x = 30 + col * 27 + (row % 2) * 8, y = 34 + row * 44 + ((i * 37) % 11);
      var isD = ((i * 17) % N) < nd;
      S('ellipse', { cx: x, cy: y, rx: 7, ry: 9, 'class': isD ? 'gb19-beetle-d' : 'gb19-beetle-l' }, sv);
      S('line', { x1: x, y1: y - 9, x2: x, y2: y + 9, 'class': 'gb19-beetle-line' }, sv);
    }
    K.T(sv, 320, 24, 'Share of dark beetles', 'gb19-s');
    S('rect', { x: 255, y: 34, width: 135, height: 120, 'class': 'gb19-box' }, sv);
    var pts = hist.map(function (f, j) { return (262 + j * 10) + ',' + (150 - f * 110); }).join(' ');
    S('polyline', { points: pts, 'class': 'gb19-route' }, sv);
    hist.forEach(function (f, j) { S('circle', { cx: 262 + j * 10, cy: 150 - f * 110, r: 2.5, 'class': 'gb19-dot gb19-dot-on' }, sv); });
    K.T(sv, 386, 48, '100%', 'gb19-s', 'end'); K.T(sv, 386, 150, '0%', 'gb19-s', 'end');
    K.T(sv, 320, 172, 'generation ' + gen, 'gb19-t');
    K.T(sv, 320, 192, Math.round(frac * 100) + '% dark', 'gb19-t');
    K.T(sv, 320, 214, ground === 'dark' ? 'dark beetles hide' : 'light beetles hide', 'gb19-s');
    ro.set('Generation ' + gen + ': <b>' + Math.round(frac * 100) + '%</b> of the beetles are dark. On ' + ground + ' ground, birds spot the ' + (ground === 'dark' ? 'light' : 'dark') + ' beetles more easily, so fewer of them live to have young. No beetle changes color; the <b>population</b> changes, because some kinds survive and breed more. That is natural selection.');
  }
  V.seg(F.ctl, { label: 'Ground', items: [['dark', 'Dark ground'], ['light', 'Light ground']], value: ground, change: function (v) { ground = v; draw(); } });
  V.button(F.ctl, 'Next generation', function () { step(); draw(); });
  V.button(F.ctl, 'Start over', function () { frac = ground === 'dark' ? 0.1 : 0.9; gen = 0; hist = [frac]; draw(); });
  draw();
});
