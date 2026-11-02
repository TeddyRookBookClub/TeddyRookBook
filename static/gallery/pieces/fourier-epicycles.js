/* Fourier epicycles: any closed drawing is a sum of circles turning at whole-number speeds. Draw a shape (or pick one);
   the page measures it at 256 points, finds the circles with a discrete Fourier transform, and lets you keep only the
   biggest few. Our own drawing. */
Gallery.piece('fourier-epicycles', function (g) {
  var M = Math, NP = 256, raw = [], coef = [], K = 24, t = 0, trail = [], drawing = false, circles = true;
  var c = g.canvas({ aspect: 0.75, max: 520, min: 280, label: 'Circles on circles tracing a shape' });
  var SH = {
    rook: [[-3, -4], [3, -4], [3, -3], [2, -3], [1.6, 1], [2.4, 1.6], [2.4, 3.5], [1.5, 3.5], [1.5, 2.8], [0.6, 2.8], [0.6, 3.5], [-0.6, 3.5], [-0.6, 2.8], [-1.5, 2.8], [-1.5, 3.5], [-2.4, 3.5], [-2.4, 1.6], [-1.6, 1], [-2, -3], [-3, -3]],
    star: (function () { var p = [], i; for (i = 0; i < 10; i++) { var r = i % 2 ? 1.7 : 4, a = M.PI / 2 + i * M.PI / 5; p.push([r * M.cos(a), r * M.sin(a)]); } return p; })(),
    square: [[-3, -3], [3, -3], [3, 3], [-3, 3]]
  };
  function resample(P, closed) { // NP points evenly spaced along the outline
    var Q = closed ? P.concat([P[0]]) : P, seg = [], tot = 0, i, out = [];
    for (i = 1; i < Q.length; i++) { var l = M.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]); seg.push(l); tot += l; }
    if (tot === 0) return null;
    var j = 0, acc = 0;
    for (i = 0; i < NP; i++) {
      var s = tot * i / NP;
      while (j < seg.length - 1 && acc + seg[j] < s) { acc += seg[j]; j++; }
      var f = seg[j] ? (s - acc) / seg[j] : 0;
      out.push([Q[j][0] + (Q[j + 1][0] - Q[j][0]) * f, Q[j][1] + (Q[j + 1][1] - Q[j][1]) * f]);
    }
    return out;
  }
  function dft(P) { // c_k = (1/N) Σ z_n e^{-2πikn/N}, k from -N/2 to N/2-1
    var out = [], N = P.length, k, n;
    for (k = -N / 2; k < N / 2; k++) {
      var re = 0, im = 0;
      for (n = 0; n < N; n++) { var a = -2 * M.PI * k * n / N, cs = M.cos(a), sn = M.sin(a); re += P[n][0] * cs - P[n][1] * sn; im += P[n][0] * sn + P[n][1] * cs; }
      out.push({ k: k, re: re / N, im: im / N, r: M.hypot(re, im) / N });
    }
    out.sort(function (a, b) { return b.r - a.r; });
    return out;
  }
  function use(P, closed) {
    var R = resample(P, closed); if (!R) return;
    raw = R; coef = dft(R); t = 0; trail = []; g.redraw();
    g.say('Shape ready: ' + K + ' circles are drawing it.');
  }
  function sum(tt, k) { var x = 0, y = 0, i, pts = [[0, 0]]; for (i = 0; i < k; i++) { var q = coef[i], a = 2 * M.PI * q.k * tt, cs = M.cos(a), sn = M.sin(a); x += q.re * cs - q.im * sn; y += q.re * sn + q.im * cs; pts.push([x, y]); } return pts; }
  function scale() { return M.min(c.w, c.h) / 10; }
  function S(p) { var s = scale(); return [c.w / 2 + p[0] * s, c.h / 2 - p[1] * s]; }
  g.draw(function (col) {
    var x = c.ctx; c.clear(col.bg); x.lineJoin = 'round'; x.lineCap = 'round';
    if (raw.length) { x.strokeStyle = col.grid; x.lineWidth = 3; x.beginPath(); raw.forEach(function (p, i) { var q = S(p); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }); if (!drawing) x.closePath(); x.stroke(); }
    if (drawing || !coef.length) return;
    // the full curve with K circles (dim), then the part traced so far (bright)
    x.strokeStyle = col.a(col.green, 0.25); x.lineWidth = 1.5; x.beginPath();
    for (var i = 0; i <= 200; i++) { var e = sum(i / 200, K), q = S(e[e.length - 1]); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }
    x.stroke();
    x.strokeStyle = col.green; x.lineWidth = 2.5; x.beginPath(); trail.forEach(function (p, i) { var q = S(p); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }); x.stroke();
    var pts = sum(t, K), s = scale();
    if (circles) {
      x.lineWidth = 1;
      for (i = 1; i < pts.length; i++) {
        var a = S(pts[i - 1]), b = S(pts[i]), r = coef[i - 1].r * s;
        if (r > 0.6) { x.strokeStyle = col.a(col.ink, 0.22); x.beginPath(); x.arc(a[0], a[1], r, 0, 7); x.stroke(); }
        x.strokeStyle = col.a(col.gold, 0.9); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      }
    }
    var tip = S(pts[pts.length - 1]); x.fillStyle = col.red; x.beginPath(); x.arc(tip[0], tip[1], 4, 0, 7); x.fill();
  });
  var row = g.group();
  var ks = g.slider({ label: 'Circles', min: 1, max: 128, value: K, parent: row, input: function (v) { K = v; trail = []; t = 0; info(); g.redraw(); } });
  g.toggle('Show circles', circles, function (v) { circles = v; g.redraw(); }, { parent: row });
  var row2 = g.group();
  [['rook', 'Rook'], ['star', 'Star'], ['square', 'Square']].forEach(function (p) { g.button(p[1], function () { use(SH[p[0]], true); info(); }, { parent: row2 }); });
  g.button('Clear and draw', function () { raw = []; coef = []; trail = []; g.redraw(); g.say('Draw a closed shape on the picture with your finger or mouse.'); hint.textContent = 'Draw one loop on the picture, then let go.'; }, { parent: row2 });
  g.loop(function (dt) {
    if (!coef.length || drawing) return;
    t += dt / 8; if (t >= 1) { t -= 1; trail = []; }
    var p = sum(t, K); trail.push(p[p.length - 1]); g.redraw();
  }, { stepSize: 0.25, parent: g.group() });
  var o = g.out(), hint = g.out();
  function info() { // how far the K-circle copy is from the shape, on average, as a share of the shape's width
    var e = 0, lo = 1e9, hi = -1e9;
    raw.forEach(function (p, i) { var q = sum(i / NP, K), z = q[q.length - 1]; e += M.hypot(z[0] - p[0], z[1] - p[1]); lo = M.min(lo, p[0]); hi = M.max(hi, p[0]); });
    var pc = raw.length ? 100 * e / raw.length / ((hi - lo) || 1) : 0;
    o.innerHTML = 'Using the <b>' + K + '</b> biggest of ' + NP + ' circles · average miss <b>' + (pc < 0.1 ? '< 0.1' : pc.toFixed(1)) + '%</b> of the width';
  }
  var pts = [];
  g.drag(c.el, {
    down: function (X, Y) { drawing = true; pts = []; raw = []; coef = []; trail = []; hint.textContent = ''; add(X, Y); },
    move: function (X, Y) { add(X, Y); },
    up: function () { drawing = false; if (pts.length > 8) { use(pts, true); info(); } else { use(SH.rook, true); info(); } }
  });
  function add(X, Y) { var s = scale(), p = [(X - c.w / 2) / s, (c.h / 2 - Y) / s]; pts.push(p); raw = pts.slice(); g.redraw(); }
  g.keys(c.el, { '+': function () { ks.set(M.min(128, K + 1)); K = ks.value(); info(); trail = []; }, '-': function () { ks.set(M.max(1, K - 1)); K = ks.value(); info(); trail = []; } });
  c.el.setAttribute('aria-label', 'Circles on circles tracing a shape. Draw a loop with a finger or mouse, or pick a shape below.');
  c.onresize = function () { trail = []; g.redraw(); };
  use(SH.rook, true); info();
  if (g.reduced) { t = 0.999; trail = []; }
});
