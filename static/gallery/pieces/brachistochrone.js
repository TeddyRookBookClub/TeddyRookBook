/* The brachistochrone: three beads slide without friction from A to B along a straight line, a parabola and a cycloid.
   Times come from the physics (speed = √(2 g · drop)), worked out along each track. Our own drawing. */
Gallery.piece('brachistochrone', function (g) {
  var M = Math, G = 9.81, H = 1, ratio = 2, T = 0, tracks = [], slow = 4, done = false;
  var c = g.canvas({ aspect: 0.55, max: 400, min: 230, label: 'Three tracks from A down to B, with a bead racing on each' });
  function cyc(bx, by) { // θ with (θ - sin θ)/(1 - cos θ) = bx/by, by bisection
    var lo = 1e-6, hi = 2 * M.PI - 1e-6, k = bx / by;
    for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2, f = (m - M.sin(m)) / (1 - M.cos(m)); if (f < k) lo = m; else hi = m; }
    var th = (lo + hi) / 2; return { th: th, r: by / (1 - M.cos(th)) };
  }
  function table(fn, n) { // points along the track, with the time to reach each one
    var P = [], i, t = 0;
    for (i = 0; i <= n; i++) P.push(fn(i / n));
    var out = [{ x: P[0][0], y: P[0][1], t: 0 }];
    for (i = 1; i <= n; i++) {
      var ds = M.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]), dt;
      if (i === 1) dt = 2 * ds / M.sqrt(2 * G * M.max(1e-12, P[1][1]));          // first piece: the speed grows like √s
      else dt = ds / M.sqrt(2 * G * M.max(1e-12, (P[i][1] + P[i - 1][1]) / 2));
      t += dt; out.push({ x: P[i][0], y: P[i][1], t: t });
    }
    return out;
  }
  function build() {
    var bx = H * ratio, by = H, cy = cyc(bx, by);
    tracks = [
      { name: 'Straight line', key: 'blue', tb: table(function (u) { return [bx * u, by * u]; }, 1200) },
      { name: 'Parabola', key: 'gold', tb: table(function (u) { return [bx * u, by * (1 - (1 - u) * (1 - u))]; }, 1200) },
      { name: 'Cycloid', key: 'green', tb: table(function (u) { var th = cy.th * u; return [cy.r * (th - M.sin(th)), cy.r * (1 - M.cos(th))]; }, 1200), exact: cy.th * M.sqrt(cy.r / G) }
    ];
    tracks[0].exact = M.hypot(bx, by) * M.sqrt(2 / (G * by));
    var best = tracks.reduce(function (a, b) { return last(b).t < last(a).t ? b : a; });
    tracks.forEach(function (k, i) { outs[i].innerHTML = k.name + ': <b>' + g.fmt(k.exact || last(k).t, 3) + ' s</b>' + (k === best ? ' ★' : ''); });
    T = 0; done = false; g.redraw();
  }
  function last(k) { return k.tb[k.tb.length - 1]; }
  function at(k, t) { // position along the track at time t (binary search in the time table)
    var tb = k.tb, lo = 0, hi = tb.length - 1;
    if (t >= tb[hi].t) return tb[hi];
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (tb[m].t <= t) lo = m; else hi = m; }
    var a = tb[lo], b = tb[hi], f = (t - a.t) / (b.t - a.t || 1); return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }
  function frame() { // fit every track (the cycloid can dip below B) into the canvas
    var mx = H * ratio, my = H; tracks.forEach(function (k) { k.tb.forEach(function (p) { if (p.y > my) my = p.y; }); });
    var pad = 30, s = M.min((c.w - 2 * pad) / mx, (c.h - 2 * pad) / my); return { s: s, ox: (c.w - mx * s) / 2, oy: pad };
  }
  g.draw(function (col) {
    var x = c.ctx, F = frame(); c.clear(col.bg);
    function P(p) { return [F.ox + p.x * F.s, F.oy + p.y * F.s]; }
    tracks.forEach(function (k) {
      x.strokeStyle = col[k.key]; x.lineWidth = 3; x.beginPath();
      k.tb.forEach(function (p, i) { if (i % 6 && i !== k.tb.length - 1) return; var q = P(p); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); });
      x.stroke();
    });
    var A = P({ x: 0, y: 0 }), B = P({ x: H * ratio, y: H });
    x.fillStyle = col.ink; x.font = '600 14px system-ui'; x.textBaseline = 'middle';
    x.beginPath(); x.arc(A[0], A[1], 5, 0, 7); x.fill(); x.fillText('A', A[0] + 9, A[1] - 8);
    x.beginPath(); x.arc(B[0], B[1], 5, 0, 7); x.fill(); x.fillText('B', B[0] + 9, B[1] - 4);
    tracks.forEach(function (k) {
      var q = P(at(k, T)); x.fillStyle = col[k.key]; x.strokeStyle = col.bg; x.lineWidth = 2;
      x.beginPath(); x.arc(q[0], q[1], 8, 0, 7); x.fill(); x.stroke();
    });
    x.fillStyle = col.muted; x.font = '12px system-ui'; x.textAlign = 'right';
    x.fillText('drop 1 m · time ' + g.fmt(T, 2) + ' s' + (slow > 1 ? ' (shown ' + slow + '× slower)' : ''), c.w - 10, c.h - 12);
    x.textAlign = 'left';
  });
  var row = g.group();
  g.slider({ label: 'B is how far across', min: 0.5, max: 4, step: 0.1, value: ratio, parent: row, fmt: function (v) { return v.toFixed(1) + ' m'; }, input: function (v) { ratio = v; build(); } });
  g.button('Race again', function () { T = 0; done = false; L.play(); }, { parent: row, pri: true });
  var L = g.loop(function (dt) {
    if (done) { T = 0; done = false; }
    var end = M.max.apply(null, tracks.map(function (k) { return last(k).t; }));
    T = M.min(end, T + dt / slow); g.redraw();
    if (T >= end) { done = true; var w = tracks.reduce(function (a, b) { return last(b).t < last(a).t ? b : a; }); g.say('The ' + w.name.toLowerCase() + ' wins in ' + g.fmt(w.exact || last(w).t, 3) + ' seconds.'); return false; }
  }, { stepSize: 0.12, parent: row });
  var outs = [g.out(), g.out(), g.out()];
  c.onresize = function () { g.redraw(); };
  build();
  if (g.reduced) { T = 0.25; g.redraw(); }
});
