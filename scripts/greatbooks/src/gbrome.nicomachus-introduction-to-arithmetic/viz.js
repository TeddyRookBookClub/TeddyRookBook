/* gbrome.nicomachus-introduction-to-arithmetic: visuals gb-figurate, gb-perfect (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

ML.viz.register('gb-figurate', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.6, max: 340, min: 220 }), ro = V.readout(el);
  var kind = opts.kind || 'tri', n = opts.n || 4;
  function val(kd, m) { return kd === 'tri' ? m * (m + 1) / 2 : kd === 'sq' ? m * m : kd === 'pent' ? m * (3 * m - 1) / 2 : kd === 'obl' ? m * (m + 1) : m * m * m; }
  function draw() {
    var k = V.colors(), ctx = c.ctx; ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    var pts = [], cols = [k.green, k.gold, k.blue, k.purple, k.orange, k.teal, k.red, k.pink, k.green, k.gold];
    if (kind === 'tri') { for (var r = 0; r < n; r++) for (var j = 0; j <= r; j++) pts.push([j - r / 2, r, r]); }
    else if (kind === 'sq') { for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) pts.push([b, a, Math.max(a, b)]); }
    else if (kind === 'obl') { for (a = 0; a < n; a++) for (b = 0; b <= n; b++) pts.push([b, a, Math.max(a, b - 1)]); }
    else if (kind === 'pent') { // nested pentagons sharing one corner
      for (var m = 1; m <= n; m++) {
        var side = m - 1, cs = [[0, 0]]; if (!side) { pts.push([0, 0, 0]); continue; }
        for (var q = 0; q < 4; q++) { var an = q * 2 * Math.PI / 5, pr = cs[q]; cs.push([pr[0] + side * Math.cos(an), pr[1] + side * Math.sin(an)]); }
        for (q = 0; q < 5; q++) { var p0 = cs[q], p1 = cs[(q + 1) % 5];
          for (var t = 0; t < side; t++) { var x = p0[0] + (p1[0] - p0[0]) * t / side, y = p0[1] + (p1[1] - p0[1]) * t / side;
            if (!pts.some(function (p) { return Math.hypot(p[0] - x, p[1] - y) < 0.2; })) pts.push([x, y, m - 1]); } }
      }
    }
    if (kind === 'cube') {
      var rows = [], start = n * n - n + 1, odds = []; for (var i = 0; i < n; i++) odds.push(start + 2 * i);
      ctx.font = '600 15px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      var lh = Math.min(28, (c.h - 20) / 10), y0 = 18;
      for (var mm = 1; mm <= Math.min(n, 10); mm++) { var st = mm * mm - mm + 1, terms = []; for (i = 0; i < mm; i++) terms.push(st + 2 * i);
        ctx.fillStyle = mm === n ? k.green : k.muted; var line = terms.join(' + ') + ' = ' + (mm * mm * mm) + ' = ' + mm + '³';
        var fs = Math.min(15, (c.w - 24) / (line.length * 0.58)); ctx.font = (mm === n ? '700 ' : '500 ') + fs + 'px system-ui,sans-serif'; ctx.fillText(line, 12, y0 + (mm - 1) * lh); }
      ro.set('Write the odd numbers in order: 1 | 3, 5 | 7, 9, 11 | … Taking one, then two, then three of them gives 1, 8, 27: the cubes. Row <b>' + n + '</b>: ' + odds.join(' + ') + ' = <b>' + (n * n * n) + '</b> (Introduction to Arithmetic II.20).');
      return;
    }
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs), miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    var s = Math.min((c.w - 40) / Math.max(1, maxx - minx), (c.h - 40) / Math.max(1, maxy - miny), 46), ox = c.w / 2 - (minx + maxx) / 2 * s, oy = c.h / 2 + (kind === 'pent' ? 1 : -1) * (miny + maxy) / 2 * s;
    var rr = Math.max(3, Math.min(11, s * 0.3));
    pts.forEach(function (p) { ctx.fillStyle = cols[p[2] % cols.length]; ctx.beginPath(); ctx.arc(ox + p[0] * s, kind === 'pent' ? oy - p[1] * s : oy + p[1] * s, rr, 0, 7); ctx.fill(); });
    var v = val(kind, n), names = { tri: 'triangular', sq: 'square', pent: 'pentagonal', obl: 'oblong (heteromecic)' };
    var seq = []; for (i = 1; i <= Math.min(n, 8); i++) seq.push(val(kind, i));
    var why = kind === 'tri' ? 'Each new row is one longer: 1 + 2 + … + ' + n + '.' : kind === 'sq' ? 'Each new colored band is the next odd number: 1 + 3 + 5 + … + ' + (2 * n - 1) + '.' : kind === 'obl' ? 'The sides differ by one: ' + n + ' × ' + (n + 1) + '. Each is twice a triangular number.' : 'Each new pentagon adds a band of 3 more dots than the last: 1, 4, 7, 10, …';
    ro.set('The ' + n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th') + ' ' + names[kind] + ' number is <b>' + v + '</b>. ' + why + ' The first few: ' + seq.join(', ') + '.');
  }
  V.seg(B.ctl, { label: 'Kind', items: [['tri', 'Triangular'], ['sq', 'Square'], ['pent', 'Pentagonal'], ['obl', 'Oblong'], ['cube', 'Cubes from odds']], value: kind, change: function (v) { kind = v; draw(); } });
  V.slider(B.ctl, { label: 'Which one (n)', min: 1, max: 10, step: 1, value: n, input: function (v) { n = v; draw(); } });
  c.onResize(draw); V.onTheme(draw); draw();
});

ML.viz.register('gb-perfect', function (el, opts, V) {
  var stage = document.createElement('div'); stage.className = 'gb-stage gb-perf'; el.appendChild(stage);
  var grid = document.createElement('div'); grid.className = 'gb-perf-grid'; grid.setAttribute('role', 'group'); grid.setAttribute('aria-label', 'Numbers 1 to 60'); stage.appendChild(grid);
  var key = document.createElement('p'); key.className = 'gb-perf-key'; key.innerHTML = '<span class="gb-k gb-def"></span>deficient <span class="gb-k gb-per"></span>perfect <span class="gb-k gb-ab"></span>superabundant'; stage.appendChild(key);
  var ro = V.readout(el), N = opts.max || 60;
  function parts(n) { var o = []; for (var d = 1; d < n; d++) if (n % d === 0) o.push(d); return o; }
  function show(n, btn) {
    grid.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); if (btn) btn.setAttribute('aria-pressed', 'true');
    var p = parts(n), s = p.reduce(function (a, b) { return a + b; }, 0);
    ro.set(n === 1 ? 'The unit is the beginning of number. Nicomachus does not sort it with the others.' : '<b>' + n + '</b>: its parts are ' + p.join(', ') + '. They add to <b>' + s + '</b>, ' + (s < n ? 'less than ' + n + ': <b>deficient</b>.' : s === n ? 'exactly ' + n + ': <b>perfect</b>.' : 'more than ' + n + ': <b>superabundant</b>.'));
  }
  for (var i = 1; i <= N; i++) (function (n) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = n; var s = parts(n).reduce(function (a, x) { return a + x; }, 0);
    b.className = n === 1 ? 'gb-one' : s < n ? 'gb-def' : s === n ? 'gb-per' : 'gb-ab'; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { show(n, b); }); grid.appendChild(b);
  })(i);
  ro.set('Press a number to add up its parts (the numbers smaller than it that divide it exactly).');
});
