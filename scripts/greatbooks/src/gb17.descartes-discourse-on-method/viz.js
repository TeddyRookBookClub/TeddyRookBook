/* gb-rainbow: Descartes's rainbow (Meteors, discourse 8, one of the three essays published with the Discourse).
   Parallel sunlight enters a round raindrop, bends (refracts), reflects once off the back, and bends again on the way
   out. Descartes traced ray after ray by calculation and found that the rays leaving at about 42 degrees from the
   direction opposite the sun pile up: that bright pile-up is the bow. Slider: where the ray strikes the drop (its height,
   as a fraction of the radius). The bar chart counts many evenly spaced rays by the angle at which they leave.
   opts: b: 0.86; color: "red" | "violet"; quiet: true hides the readout. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, TAU = 2 * M.PI, DEG = 180 / M.PI;
  V.register('gb-rainbow', function (el, o) {
    o = o || {};
    var b = o.b == null ? 0.86 : +o.b, col = o.color === 'violet' ? 'violet' : 'red';
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.7, min: 240, max: 400 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'Where the ray hits (height in the drop)', min: 0.02, max: 0.99, step: 0.01, value: b, input: function (v) { b = v; draw(); } });
    V.seg(ctl, { label: 'Color of light', items: [['red', 'Red light'], ['violet', 'Violet light']], value: col, change: function (v) { col = v; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function nIdx() { return col === 'red' ? 1.331 : 1.343; }
    function bow(bb, n) { var i = M.asin(bb), r = M.asin(bb / n); return { i: i, r: r, A: 4 * r - 2 * i }; } // A = angle from the antisolar direction
    function clear(k) { var x = c.ctx; x.save(); x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.fillStyle = k.bg; x.fillRect(0, 0, c.w, c.h); x.restore(); }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, n = nIdx(), narrow = w < 520;
      clear(k);
      var dropW = narrow ? w : w * 0.6, R = M.min(dropW * 0.3, h * 0.36), cx = narrow ? w * 0.6 : dropW * 0.58, cy = h * (narrow ? 0.42 : 0.5);
      var histTop = narrow ? h * 0.8 : 30;
      g.fillStyle = k.blueSoft; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill(); g.strokeStyle = k.blue; g.lineWidth = 1.5; g.stroke();
      function P(th) { return [cx + R * M.cos(th), cy - R * M.sin(th)]; }
      function trace(bb, strong) {
        var q = bow(bb, n), th0 = M.PI - q.i, th1 = th0 - (M.PI - 2 * q.r), th2 = th1 - (M.PI - 2 * q.r);
        var p0 = P(th0), p1 = P(th1), p2 = P(th2), ex = M.PI + q.A, L = R * 2.2;
        g.strokeStyle = strong ? (col === 'red' ? k.red : k.purple) : k.muted; g.lineWidth = strong ? 2.6 : 1; g.globalAlpha = strong ? 1 : 0.55;
        g.beginPath(); g.moveTo(M.max(0, cx - R * 2.2), p0[1]); g.lineTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.lineTo(p2[0] + L * M.cos(ex), p2[1] - L * M.sin(ex)); g.stroke();
        g.globalAlpha = 1; return q;
      }
      g.save(); if (narrow) { g.beginPath(); g.rect(0, 0, w, histTop - 8); g.clip(); }
      for (var s = 0.1; s < 0.99; s += 0.1) trace(s, false);
      var q = trace(b, true);
      g.restore();
      g.fillStyle = k.gold; g.font = '600 12px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText('sunlight →', 6, 16);
      // histogram of leaving angles for 2000 evenly spaced rays
      var bins = new Array(46).fill(0), N = 2000;
      for (var j = 0; j < N; j++) { var a = bow((j + 0.5) / N, n).A * DEG; bins[M.min(45, M.max(0, M.floor(a)))]++; }
      var hx = narrow ? 14 : dropW + 10, hw = narrow ? w - 28 : w - dropW - 22, hh = narrow ? h - histTop - 22 : h - 70, base = histTop + hh, mx = M.max.apply(null, bins);
      g.strokeStyle = k.axis; g.lineWidth = 1; g.beginPath(); g.moveTo(hx, base); g.lineTo(hx + hw, base); g.stroke();
      bins.forEach(function (v, d) { var bh = hh * v / mx, x = hx + hw * d / 46; g.fillStyle = M.abs(d - q.A * DEG) < 1 ? (col === 'red' ? k.red : k.purple) : k.grid; g.fillRect(x, base - bh, M.max(1, hw / 46 - 1), bh); });
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.textAlign = 'center';
      [0, 10, 20, 30, 40].forEach(function (d) { g.fillText(d + '°', hx + hw * (d + 0.5) / 46, base + 13); });
      if (!narrow) { g.textAlign = 'left'; g.fillText('rays counted by leaving angle', hx, histTop - 10); }
      var peak = 0; bins.forEach(function (v, d) { if (v > bins[peak]) peak = d; });
      c.cv.setAttribute('aria-label', 'A raindrop with light rays. This ray leaves at ' + V.fmt(q.A * DEG, 1) + ' degrees; the rays pile up near ' + peak + ' degrees');
      out.set('This ray enters at ' + V.fmt(q.i * DEG, 1) + '°, bends to ' + V.fmt(q.r * DEG, 1) + '° inside, and leaves at <b>' + V.fmt(q.A * DEG, 1) + '°</b> from the point opposite the sun. Most rays leave near ' + peak + '° (the tall bar), so drops at that angle look bright: the bow. Violet light bends a little more, so its bow is slightly smaller.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
