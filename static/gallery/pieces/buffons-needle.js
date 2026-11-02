/* Math Gallery: Buffon's needle. Needles of length l are dropped on a floor with lines d apart (l <= d). The share that
   cross a line is 2l / (pi d), so pi is about 2 l n / (d h). The strip at the bottom tracks the estimate as you drop more.
   Only the last 1,500 needles are drawn; all are counted. */
Gallery.piece('buffons-needle', function (g) {
  var c = g.canvas({ aspect: 0.75, max: 560, min: 360, label: 'Needles dropped on a striped floor. Needles that cross a line are highlighted.' });
  var ratio = 0.8, n = 0, hit = 0, nd = [], hist = [], rnd = g.rng(314159), rate = 30, acc = 0;
  function reset() { n = 0; hit = 0; nd = []; hist = []; g.redraw(); }
  // a needle: center (u, v) in floor units where lines are at v = 0, 1, 2 ... (d = 1), angle a
  function one() {
    var u = rnd(), v = rnd() * 6, a = rnd() * Math.PI, h = ratio / 2 * Math.abs(Math.sin(a));
    var cross = Math.floor(v - h) !== Math.floor(v + h);
    n++; if (cross) hit++;
    nd.push([u, v, a, cross]); if (nd.length > 1500) nd.shift();
    if (n < 50 || n % Math.max(1, Math.floor(n / 200)) === 0) hist.push([n, est()]);
  }
  function est() { return hit ? 2 * ratio * n / hit : 0; }
  function drop(k) { for (var i = 0; i < k; i++) one(); g.redraw(); say(); }
  function say() { g.say(n + ' needles, ' + hit + ' cross a line, estimate of pi ' + (hit ? est().toFixed(4) : 'not yet') + '.'); }
  var L = g.loop(function (dt) { acc += dt * rate; var k = Math.floor(acc); acc -= k; for (var i = 0; i < k; i++) one(); g.redraw(); }, { auto: false, stepSize: 1 / 30 });
  g.button('Drop 1', function () { drop(1); });
  g.button('Drop 100', function () { drop(100); });
  g.button('Drop 10,000', function () { drop(10000); });
  g.button('Clear', function () { reset(); g.say('Cleared.'); });
  g.slider({ label: 'Needle length ÷ line gap', min: 0.2, max: 1, step: 0.05, value: ratio, fmt: function (v) { return v.toFixed(2); }, input: function (v) { ratio = v; reset(); } });
  var st = g.out();

  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, ch = Math.max(80, H * 0.22), fh = H - ch - 6, gap = fh / 6;
    c.clear(col.bg);
    x.fillStyle = col.panel; x.fillRect(0, 0, W, fh);
    x.strokeStyle = col.axis; x.lineWidth = 1.5;
    for (var i = 0; i <= 6; i++) { var y = i * gap; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
    var len = ratio * gap / 2;
    x.lineCap = 'round';
    for (i = 0; i < nd.length; i++) {
      var q = nd[i], cx = q[0] * W, cy = q[1] * gap, dx = Math.cos(q[2]) * len, dy = Math.sin(q[2]) * len;
      x.strokeStyle = q[3] ? col.red : col.a(col.accent, 0.55); x.lineWidth = q[3] ? 2 : 1.5;
      x.beginPath(); x.moveTo(cx - dx, cy - dy); x.lineTo(cx + dx, cy + dy); x.stroke();
    }
    // the estimate strip: pi +/- 0.5, number of needles on a log scale
    var y0 = fh + 6, cl = 40, cw = W - cl - 10;
    x.fillStyle = col.panel; x.fillRect(0, y0, W, ch);
    function Y(v) { return y0 + 6 + (1 - (v - (Math.PI - 0.5))) * (ch - 26); }
    function X(k) { return cl + Math.log(k) / Math.log(Math.max(1000, n)) * cw; }
    x.strokeStyle = col.gold; x.lineWidth = 1; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(cl, Y(Math.PI)); x.lineTo(W - 10, Y(Math.PI)); x.stroke(); x.setLineDash([]);
    x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'right'; x.textBaseline = 'middle';
    x.fillText('π', cl - 6, Y(Math.PI)); x.fillText('3.6', cl - 6, Y(3.6)); x.fillText('2.7', cl - 6, Y(2.7));
    x.textAlign = 'left'; x.fillText('Estimate as needles are added (log scale)', cl, y0 + ch - 9);
    x.save(); x.beginPath(); x.rect(cl, y0, cw, ch); x.clip();
    x.strokeStyle = col.red; x.lineWidth = 2; x.beginPath(); var on = false;
    for (i = 0; i < hist.length; i++) { if (!hist[i][1]) continue; var px = X(hist[i][0]), py = Y(hist[i][1]); if (on) x.lineTo(px, py); else { x.moveTo(px, py); on = true; } }
    x.stroke(); x.restore();
    st.innerHTML = '<b>' + g.fmt(n) + '</b> needles · <b>' + g.fmt(hit) + '</b> cross a line · π ≈ <b>' + (hit ? est().toFixed(4) : '…') + '</b>' + (hit ? ' (off by ' + Math.abs(est() - Math.PI).toFixed(4) + ')' : '');
  });
  reset(); drop(g.reduced ? 200 : 40);
});
