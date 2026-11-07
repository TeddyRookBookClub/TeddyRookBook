/* Math Gallery: Buffon's needle. Needles of length l are dropped on a floor with lines d apart (l <= d). The share that
   cross a line is 2l / (pi d), so pi is about 2 l n / (d h). The strip at the bottom tracks the estimate as you drop more.
   Only the last 1,500 needles are drawn; all are counted. The shaded funnel on the strip is where a fair run lands 95% of
   the time (two standard errors, pi * sqrt((1 - p) / (n p)) each, p = 2l / (pi d)). The Angles view sorts every needle by
   its angle: all needles fill the bins evenly, the crossing ones pile up like (l / d) sin(angle), and the empty part above
   them (the needles that missed) is 1 - 2l / (pi d) of the total. */
Gallery.piece('buffons-needle', function (g) {
  var c = g.canvas({ aspect: 0.75, max: 560, min: 360, label: 'Needles dropped on a striped floor. Needles that cross a line are highlighted.' });
  var ratio = 0.8, n = 0, hit = 0, nd = [], hist = [], rnd = g.rng(314159), rate = 30, acc = 0, NB = 18, bAll = [], bHit = [], view = 'floor';
  function reset() { n = 0; hit = 0; nd = []; hist = []; for (var b = 0; b < NB; b++) { bAll[b] = 0; bHit[b] = 0; } g.redraw(); }
  // a needle: center (u, v) in floor units where lines are at v = 0, 1, 2 ... (d = 1), angle a
  function one() {
    var u = rnd(), v = rnd() * 6, a = rnd() * Math.PI, h = ratio / 2 * Math.abs(Math.sin(a));
    var cross = Math.floor(v - h) !== Math.floor(v + h);
    n++; if (cross) hit++;
    var bi = Math.min(NB - 1, Math.floor(a / Math.PI * NB)); bAll[bi]++; if (cross) bHit[bi]++;
    nd.push([u, v, a, cross]); if (nd.length > 1500) nd.shift();
    if (n < 50 || n % Math.max(1, Math.floor(n / 200)) === 0) hist.push([n, est()]);
  }
  function est() { return hit ? 2 * ratio * n / hit : 0; }
  function drop(k) { for (var i = 0; i < k; i++) one(); g.redraw(); say(); }
  function say() { g.say(n + ' needles, ' + hit + ' cross a line, estimate of pi ' + (hit ? est().toFixed(4) : 'not yet') + '.'); }
  var L = g.loop(function (dt) { acc += dt * rate; var k = Math.floor(acc); acc -= k; for (var i = 0; i < k; i++) one(); g.redraw(); }, { auto: false, stepSize: 1 / 30 });
  g.button('Drop 1', function () { drop(1); });
  g.button('Drop 10', function () { drop(10); });
  g.button('Drop 100', function () { drop(100); });
  g.button('Drop 1,000', function () { drop(1000); });
  g.button('Drop 10,000', function () { drop(10000); });
  g.button('Clear', function () { reset(); g.say('Cleared.'); });
  g.slider({ label: 'Needle length ÷ line gap', min: 0.2, max: 1, step: 0.05, value: ratio, fmt: function (v) { return v.toFixed(2); }, input: function (v) { ratio = v; reset(); } });
  g.select({ label: 'View', value: 'floor', options: [['floor', 'The floor'], ['angles', 'The angles']], change: function (v) { view = v; g.redraw(); } });
  var st = g.out();
  g.est = est; // for the tests

  // the Angles view: one bar per 10 degrees. Light: all needles at that angle. Red: the ones that crossed. Line: the
  // expected red height, (l / d) sin(angle) times the bar. The empty part above the red is the needles that missed.
  function angles(col, x, W, fh) {
    var l = 42, r = 12, t = 30, b = 34, pw = W - l - r, ph = fh - t - b, mx = 1, k;
    for (k = 0; k < NB; k++) mx = Math.max(mx, bAll[k]);
    mx *= 1.1; var bw = pw / NB;
    function BY(v) { return t + ph - v / mx * ph; }
    x.strokeStyle = col.axis; x.lineWidth = 1; x.beginPath(); x.moveTo(l, t); x.lineTo(l, t + ph); x.lineTo(l + pw, t + ph); x.stroke();
    for (k = 0; k < NB; k++) {
      var x0 = l + k * bw + 1, w = bw - 2;
      x.fillStyle = col.a(col.accent, 0.18); x.fillRect(x0, BY(bAll[k]), w, t + ph - BY(bAll[k]));
      x.fillStyle = col.red; x.fillRect(x0, BY(bHit[k]), w, t + ph - BY(bHit[k]));
    }
    x.strokeStyle = col.gold; x.lineWidth = 2; x.beginPath();
    for (k = 0; k <= 90; k++) { var a = k / 90 * Math.PI, avg = n / NB, px = l + k / 90 * pw, py = BY(avg * ratio * Math.sin(a)); if (k) x.lineTo(px, py); else x.moveTo(px, py); }
    if (n) x.stroke();
    x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif'; x.textBaseline = 'top'; x.textAlign = 'center';
    for (k = 0; k <= 180; k += 45) x.fillText(k + '°', l + k / 180 * pw, t + ph + 5);
    x.fillText('angle between the needle and the lines', l + pw / 2, t + ph + 19);
    x.textAlign = 'left'; x.fillStyle = col.ink;
    var miss = n ? (1 - hit / n) : 0;
    x.fillText(W < 480 ? 'Red: crossed. Pale: missed (what\u2019s not there).' : 'Red: needles that crossed. Pale space above: the ones that missed, what\u2019s not there.', l, 8);
    x.textAlign = 'right'; x.fillStyle = col.muted;
    if (n) x.fillText('missing: ' + (100 * miss).toFixed(1) + '% (expected ' + (100 * (1 - 2 * ratio / Math.PI)).toFixed(1) + '%)', l + pw, t + 4);
  }
  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, ch = Math.max(80, H * 0.22), fh = H - ch - 6, gap = fh / 6;
    c.clear(col.bg);
    x.fillStyle = col.panel; x.fillRect(0, 0, W, fh);
    var i;
    if (view === 'angles') angles(col, x, W, fh); else {
      x.strokeStyle = col.axis; x.lineWidth = 1.5;
      for (i = 0; i <= 6; i++) { var y = i * gap; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
      var len = ratio * gap / 2;
      x.lineCap = 'round';
      for (i = 0; i < nd.length; i++) {
        var q = nd[i], cx = q[0] * W, cy = q[1] * gap, dx = Math.cos(q[2]) * len, dy = Math.sin(q[2]) * len;
        x.strokeStyle = q[3] ? col.red : col.a(col.accent, 0.55); x.lineWidth = q[3] ? 2 : 1.5;
        x.beginPath(); x.moveTo(cx - dx, cy - dy); x.lineTo(cx + dx, cy + dy); x.stroke();
      }
    }
    // the estimate strip: pi +/- 0.5, number of needles on a log scale
    var y0 = fh + 6, cl = 40, cw = W - cl - 10;
    x.fillStyle = col.panel; x.fillRect(0, y0, W, ch);
    function Y(v) { return y0 + 6 + (1 - (v - (Math.PI - 0.5))) * (ch - 26); }
    function X(k) { return cl + Math.log(k) / Math.log(Math.max(1000, n)) * cw; }
    x.strokeStyle = col.gold; x.lineWidth = 1; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(cl, Y(Math.PI)); x.lineTo(W - 10, Y(Math.PI)); x.stroke(); x.setLineDash([]);
    x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'right'; x.textBaseline = 'middle';
    x.fillText('π', cl - 6, Y(Math.PI)); x.fillText('3.6', cl - 6, Y(3.6)); x.fillText('2.7', cl - 6, Y(2.7));
    var lbl = W < 480 ? 'Estimate (log scale); shading: 95% of fair runs' : 'Estimate as needles are added (log scale). Shading: where 95% of fair runs land';
    x.save(); x.beginPath(); x.rect(cl, y0, cw, ch); x.clip();
    var pp = 2 * ratio / Math.PI, top = Math.max(1000, n);
    x.fillStyle = col.a(col.gold, 0.16); x.beginPath();
    for (var s1 = 0; s1 <= 60; s1++) { var k1 = Math.pow(top, s1 / 60); x.lineTo(X(k1), Y(Math.PI + 2 * Math.PI * Math.sqrt((1 - pp) / (k1 * pp)))); }
    for (s1 = 60; s1 >= 0; s1--) { k1 = Math.pow(top, s1 / 60); x.lineTo(X(k1), Y(Math.PI - 2 * Math.PI * Math.sqrt((1 - pp) / (k1 * pp)))); }
    x.closePath(); x.fill();
    x.strokeStyle = col.red; x.lineWidth = 2; x.beginPath(); var on = false;
    for (i = 0; i < hist.length; i++) { if (!hist[i][1]) continue; var px = X(hist[i][0]), py = Y(hist[i][1]); if (on) x.lineTo(px, py); else { x.moveTo(px, py); on = true; } }
    x.stroke(); x.restore();
    x.textAlign = 'left'; x.fillStyle = col.a(col.panel, 0.85); x.fillRect(cl - 2, y0 + ch - 18, x.measureText(lbl).width + 6, 16); x.fillStyle = col.muted; x.fillText(lbl, cl + 1, y0 + ch - 9);
    st.innerHTML = '<b>' + g.fmt(n) + '</b> needles · <b>' + g.fmt(hit) + '</b> cross a line · π ≈ <b>' + (hit ? est().toFixed(4) : '…') + '</b>' + (hit ? ' (off by ' + Math.abs(est() - Math.PI).toFixed(4) + ')' : '');
  });
  reset(); drop(g.reduced ? 200 : 40);
});
