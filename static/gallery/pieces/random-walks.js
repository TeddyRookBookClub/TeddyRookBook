/* Math Gallery: random walks. 1D: four walkers step left or right by coin flip; their positions are plotted over time.
   2D: one walker steps north, south, east or west on a grid; the view zooms out to fit its path. Returns to the start
   are counted. "Test 600 walkers" compares how many return within 4,000 steps on a line, a grid and in 3D space. */
Gallery.piece('random-walks', function (g) {
  var c = g.canvas({ aspect: 0.66, max: 520, min: 300, label: 'Random walks. Returns to the start are marked.' });
  var mode = '1', rnd = g.rng(1921), speed = 60, acc = 0, W1, P2, test = null;
  var cols = function (col) { return [col.accent, col.orange, col.blue, col.purple]; };
  function reset() {
    W1 = []; for (var i = 0; i < 4; i++) W1.push({ x: 0, h: [0], ret: 0 });
    P2 = { x: 0, y: 0, pts: [[0, 0]], ret: 0, R: 4, n: 0 }; g.redraw();
  }
  function step1() { W1.forEach(function (w) { w.x += rnd() < 0.5 ? -1 : 1; w.h.push(w.x); if (!w.x) w.ret++; }); }
  function step2() { var r = rnd() * 4 | 0; P2.x += r === 0 ? 1 : r === 1 ? -1 : 0; P2.y += r === 2 ? 1 : r === 3 ? -1 : 0; P2.n++; P2.pts.push([P2.x, P2.y]); if (!P2.x && !P2.y) P2.ret++; P2.R = Math.max(P2.R, Math.abs(P2.x) + 2, Math.abs(P2.y) + 2); }
  var L = g.loop(function (dt) {
    acc += dt * speed; var k = Math.floor(acc); acc -= k;
    for (var i = 0; i < k; i++) { if (mode === '1') { if (W1[0].h.length > 20000) return false; step1(); } else { if (P2.n > 200000) return false; step2(); } }
    g.redraw();
  }, { stepSize: 1 / 6 });
  g.button('↺ Start over', function () { reset(); g.say('Started over.'); });
  g.select({ label: 'Walk', options: [['1', 'On a line (1D)'], ['2', 'On a grid (2D)']], value: '1', change: function (v) { mode = v; reset(); } });
  g.slider({ label: 'Speed', min: 5, max: 2000, step: 5, value: speed, fmt: function (v) { return v + ' steps/s'; }, input: function (v) { speed = v; } });
  var r2 = g.group();
  g.button('Test 600 walkers in 1D, 2D and 3D', runTest, { parent: r2 });
  var st = g.out(), tst = g.out();

  function runTest() {
    // each walker: does it come home within 4,000 steps? (same coin for all three spaces)
    var n = 600, T = 4000, res = [0, 0, 0];
    for (var d = 1; d <= 3; d++) for (var w = 0; w < n; w++) {
      var p = [0, 0, 0];
      for (var s = 0; s < T; s++) { var a = rnd() * d | 0; p[a] += rnd() < 0.5 ? -1 : 1; if (!p[0] && !p[1] && !p[2]) { res[d - 1]++; break; } }
    }
    test = res.map(function (v) { return v / n; });
    tst.innerHTML = 'Came home within 4,000 steps: 1D <b>' + pc(test[0]) + '</b> · 2D <b>' + pc(test[1]) + '</b> · 3D <b>' + pc(test[2]) + '</b>';
    g.say(tst.textContent);
  }
  function pc(v) { return Math.round(v * 100) + '%'; }

  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, K = cols(col);
    c.clear(col.bg); x.font = '12px system-ui,sans-serif'; x.lineJoin = 'round';
    if (mode === '1') {
      var n = W1[0].h.length, T = Math.max(200, n), mx = 10, l = 34;
      W1.forEach(function (w) { for (var i = 0; i < w.h.length; i += Math.max(1, (w.h.length / 400) | 0)) mx = Math.max(mx, Math.abs(w.h[i])); mx = Math.max(mx, Math.abs(w.x)); });
      mx = Math.ceil(mx * 1.15);
      function Y(v) { return H / 2 - v / mx * (H / 2 - 14); }
      x.strokeStyle = col.axis; x.lineWidth = 1.2; x.beginPath(); x.moveTo(l, Y(0)); x.lineTo(W, Y(0)); x.stroke();
      x.fillStyle = col.muted; x.textAlign = 'right'; x.textBaseline = 'middle';
      x.fillText('home', l - 3, Y(0)); x.fillText('+' + mx, l - 3, Y(mx) + 4); x.fillText('−' + mx, l - 3, Y(-mx) - 4);
      W1.forEach(function (w, k) {
        x.strokeStyle = K[k]; x.lineWidth = 1.5; x.beginPath(); var sk = Math.max(1, Math.floor(w.h.length / (W * 1.5)));
        for (var i = 0; i < w.h.length; i += sk) { var px = l + i / T * (W - l - 6), py = Y(w.h[i]); if (i) x.lineTo(px, py); else x.moveTo(px, py); }
        x.stroke();
      });
      x.textAlign = 'left'; x.fillStyle = col.muted; x.fillText('Steps: 0 to ' + g.fmt(T), l + 4, H - 10);
      st.innerHTML = 'Step <b>' + g.fmt(n - 1) + '</b> · returns home: ' + W1.map(function (w, k) { return '<b style="color:' + K[k] + '">' + w.ret + '</b>'; }).join(' · ') + ' · typical distance √n ≈ <b>' + Math.sqrt(n - 1).toFixed(1) + '</b>';
    } else {
      var R = P2.R, s = Math.min(W, H) / (2 * R + 1), cx = W / 2, cy = H / 2;
      if (s > 6) { x.strokeStyle = col.grid; x.lineWidth = 1; x.beginPath(); for (var g1 = -R; g1 <= R; g1++) { x.moveTo(cx + g1 * s, 0); x.lineTo(cx + g1 * s, H); x.moveTo(0, cy + g1 * s); x.lineTo(W, cy + g1 * s); } x.stroke(); }
      var pts = P2.pts, m = pts.length, sk2 = Math.max(1, Math.floor(m / 30000));
      x.lineWidth = Math.max(1, Math.min(3, s / 4));
      for (var i = 1; i < m; i += 400) {
        x.strokeStyle = col.a(col.accent, 0.25 + 0.75 * i / m); x.beginPath(); x.moveTo(cx + pts[i - 1][0] * s, cy - pts[i - 1][1] * s);
        for (var j = i; j < Math.min(m, i + 400); j += sk2) x.lineTo(cx + pts[j][0] * s, cy - pts[j][1] * s);
        x.stroke();
      }
      x.fillStyle = col.gold; x.beginPath(); x.arc(cx, cy, 6, 0, 7); x.fill();
      x.fillStyle = col.red; x.beginPath(); x.arc(cx + P2.x * s, cy - P2.y * s, 5, 0, 7); x.fill();
      x.fillStyle = col.ink; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText('● home', 10, 18); x.fillStyle = col.gold; x.fillText('●', 10, 18);
      st.innerHTML = 'Step <b>' + g.fmt(P2.n) + '</b> · returns home <b>' + P2.ret + '</b> · now at (' + P2.x + ', ' + P2.y + ')';
    }
    x.textAlign = 'left';
  });
  reset(); if (g.reduced) { for (var i = 0; i < 600; i++) step1(); }
});
