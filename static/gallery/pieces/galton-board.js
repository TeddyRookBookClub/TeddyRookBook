/* Math Gallery: the Galton board. Balls fall through rows of pegs, bouncing left or right with chance 1/2 (or a chosen
   lean), and pile up in bins. The curve is the bell curve with the same mean and spread (the normal approximation to the
   binomial distribution). Balls in flight are animated; "Add 1,000" drops them straight into the bins. */
Gallery.piece('galton-board', function (g) {
  var c = g.canvas({ aspect: 0.82, max: 600, min: 380, label: 'A Galton board: balls fall through pegs and pile up in bins' });
  var N = 12, p = 0.5, bins, fly = [], total = 0, rnd = g.rng(20261101), curve = true, rate = 8, acc = 0;
  function reset() { bins = []; for (var i = 0; i <= N; i++) bins.push(0); fly = []; total = 0; g.redraw(); }
  function path() { var k = [], s = 0; for (var i = 0; i < N; i++) { var r = rnd() < p ? 1 : 0; k.push(r); s += r; } return { k: k, s: s, t: 0 }; }
  function addNow(n) { for (var i = 0; i < n; i++) { bins[path().s]++; total++; } g.redraw(); tell(); }
  function tell() { g.say(total + ' balls in the bins.'); }
  var L = g.loop(function (dt) {
    acc += dt * rate; while (acc >= 1 && fly.length < 400) { fly.push(path()); acc -= 1; } if (acc > 1) acc = 1;
    for (var i = fly.length - 1; i >= 0; i--) { fly[i].t += dt * 7; if (fly[i].t >= N + 1) { bins[fly[i].s]++; total++; fly.splice(i, 1); } }
    g.redraw();
  }, { stepSize: 1 / 8 });
  g.button('Add 1,000 now', function () { addNow(1000); });
  g.button('Empty', function () { reset(); g.say('Emptied.'); });
  g.slider({ label: 'Rows', min: 4, max: 20, value: N, input: function (v) { N = v; reset(); } });
  g.slider({ label: 'Balls per second', min: 1, max: 40, value: rate, input: function (v) { rate = v; } });
  g.slider({ label: 'Chance of bouncing right', min: 0.1, max: 0.9, step: 0.05, value: p, fmt: function (v) { return v.toFixed(2); }, input: function (v) { p = v; reset(); } });
  g.toggle('Show the bell curve', true, function (v) { curve = v; g.redraw(); });
  var st = g.out();

  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, top = 18, boardH = H * 0.46, gap = Math.min((W - 30) / (N + 1), boardH / N), cx = W / 2;
    var binTop = top + gap * N + 10, binBot = H - 22, bw = gap;
    c.clear(col.bg);
    function pos(b) { // position of a ball part-way down its path
      var row = Math.min(N, Math.floor(b.t)), f = b.t - row, s = 0; for (var i = 0; i < row; i++) s += b.k[i];
      var x0 = cx + (s - row / 2) * gap, y0 = top + row * gap;
      if (row >= N) return [x0, y0 + f * (binBot - y0)];
      var dir = b.k[row] ? 1 : -1, x1 = x0 + dir * gap / 2, y1 = y0 + gap;
      return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f - Math.sin(f * Math.PI) * gap * 0.25];
    }
    // pegs
    x.fillStyle = col.muted;
    for (var r = 0; r < N; r++) for (var j = 0; j <= r; j++) { x.beginPath(); x.arc(cx + (j - r / 2) * gap, top + r * gap + gap * 0.5, Math.max(1.6, gap * 0.08), 0, 7); x.fill(); }
    // bins
    var mx = 1; bins.forEach(function (v) { if (v > mx) mx = v; });
    var mean = N * p, sd = Math.sqrt(N * p * (1 - p)), peak = total / (sd * Math.sqrt(2 * Math.PI));
    if (curve && total) mx = Math.max(mx, peak);
    var hgt = binBot - binTop;
    x.strokeStyle = col.grid; x.lineWidth = 1;
    for (var k = 0; k <= N; k++) {
      var bx = cx + (k - N / 2) * gap, h = bins[k] / mx * hgt;
      x.fillStyle = col.a(col.accent, 0.75); x.fillRect(bx - bw / 2 + 1, binBot - h, bw - 2, h);
      x.beginPath(); x.moveTo(bx - bw / 2, binTop); x.lineTo(bx - bw / 2, binBot); x.stroke();
    }
    x.beginPath(); x.moveTo(cx + (N + 1) / 2 * gap, binTop); x.lineTo(cx + (N + 1) / 2 * gap, binBot); x.stroke();
    x.strokeStyle = col.axis; x.beginPath(); x.moveTo(cx - (N + 1) / 2 * gap, binBot); x.lineTo(cx + (N + 1) / 2 * gap, binBot); x.stroke();
    if (curve && total) {
      x.strokeStyle = col.red; x.lineWidth = 2.2; x.beginPath();
      for (var u = -0.5; u <= N + 0.5; u += 0.05) { var y = peak * Math.exp(-(u - mean) * (u - mean) / (2 * sd * sd)) / mx * hgt, px = cx + (u - N / 2) * gap; if (u === -0.5) x.moveTo(px, binBot - y); else x.lineTo(px, binBot - y); }
      x.stroke();
    }
    x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'center';
    var lab = N > 12 ? 2 : 1; for (k = 0; k <= N; k += lab) x.fillText(String(k), cx + (k - N / 2) * gap, binBot + 15);
    x.textAlign = 'left';
    // balls
    x.fillStyle = col.gold; var rr = Math.max(2.5, gap * 0.16);
    for (var i = 0; i < fly.length; i++) { var q = pos(fly[i]); x.beginPath(); x.arc(q[0], q[1], rr, 0, 7); x.fill(); }
    var m = 0, v = 0; bins.forEach(function (b, kk) { m += b * kk; }); m = total ? m / total : 0; bins.forEach(function (b, kk) { v += b * (kk - m) * (kk - m); }); v = total ? Math.sqrt(v / total) : 0;
    st.innerHTML = '<b>' + g.fmt(total) + '</b> balls · average bin <b>' + m.toFixed(2) + '</b> (theory ' + mean.toFixed(2) + ') · spread <b>' + v.toFixed(2) + '</b> (theory ' + sd.toFixed(2) + ')';
  });
  reset(); if (g.reduced) addNow(300);
});
