/* gb-balloon: the expanding universe as dots on a balloon (drawn as a circle, the balloon's outline). The balloon
   grows; no dot moves across the rubber, yet every dot sees every other dot moving away, and twice as far means
   twice as fast (Hubble's law, v = H d). Tap a dot to stand on it. The small chart plots speed against distance
   from your dot. Our own design. opts: home: 0–11. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, N = 12;
  V.register('gb-balloon', function (el, o) {
    o = o || {};
    var home = o.home == null ? 0 : +o.home, R0 = 1, t = 0.4, playing = false;
    var ang = []; for (var i = 0; i < N; i++) ang.push(-M.PI / 2 + i * 2 * M.PI / N + ((i * 7) % 5 - 2) * 0.06);
    var c = V.canvas(el, { aspect: 1.7, min: 290, max: 340 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    var sl = V.slider(ctl, { label: 'Time', min: 0, max: 1, step: 0.01, value: t, fmt: function (v) { return V.fmt(v, 2); }, input: function (v) { t = v; draw(); } });
    V.button(ctl, 'Inflate', function () { t = 0; playing = true; lp.start(); if (V.reduced) { t = 1; playing = false; sl.set(t); draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    var lp = V.loop(el, function (dt) { if (!playing) return; t = M.min(1, t + dt * 0.25); sl.set(t); draw(); if (t >= 1) playing = false; });
    var geo = {};
    function R() { return R0 * (1 + 1.6 * t); } // radius grows steadily, so dR/dt = 1.6
    function arc(i, j) { var d = M.abs(ang[i] - ang[j]) % (2 * M.PI); return M.min(d, 2 * M.PI - d); }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, wide = w > 460;
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, h); g.restore();
      var cx = wide ? w * 0.3 : w * 0.5, cy = wide ? h * 0.5 : h * 0.36, maxR = wide ? M.min(w * 0.26, h * 0.44) : M.min(w * 0.34, h * 0.3);
      var scale = maxR / (R0 * 2.6), r = R() * scale;
      g.fillStyle = k.redSoft; g.strokeStyle = k.red; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r, 0, 2 * M.PI); g.fill(); g.stroke();
      geo = { cx: cx, cy: cy, r: r };
      ang.forEach(function (a, i) {
        var x = cx + r * M.cos(a), y = cy + r * M.sin(a);
        g.fillStyle = i === home ? k.gold : k.ink; g.beginPath(); g.arc(x, y, i === home ? 8 : 5, 0, 2 * M.PI); g.fill();
        if (i === home) { g.strokeStyle = k.ink; g.lineWidth = 1.5; g.stroke(); }
      });
      // speed against distance, measured along the surface from home
      var bx = wide ? w * 0.6 : 34, by = wide ? 30 : h * 0.7, bw = wide ? w * 0.36 : w - 50, bh = wide ? h - 70 : h * 0.24;
      g.strokeStyle = k.axis; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by + bh); g.lineTo(bx + bw, by + bh); g.stroke();
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText('speed away', bx + 4, by + 8);
      g.textAlign = 'right'; g.fillText('distance from your dot', bx + bw, by + bh + 14);
      var dmax = M.PI * R0 * 2.6, vmax = M.PI * 1.6;
      ang.forEach(function (a, i) {
        if (i === home) return; var th = arc(i, home), d = th * R(), v = th * 1.6;
        g.fillStyle = k.blue; g.beginPath(); g.arc(bx + bw * d / dmax, by + bh - bh * v / vmax, 3.5, 0, 2 * M.PI); g.fill();
      });
      c.cv.setAttribute('aria-label', 'Twelve galaxies on an inflating balloon, with a chart of speed against distance from the chosen galaxy');
      var far = 0, near = 9; ang.forEach(function (a, i) { if (i !== home) { var th = arc(i, home); far = M.max(far, th); near = M.min(near, th); } });
      out.set('The balloon is ' + V.fmt(R() / R0, 2) + ' times its starting size. From your gold dot, the nearest galaxy is ' + V.fmt(near * R(), 2) + ' units away and receding at ' + V.fmt(near * 1.6, 2) + '; the farthest is ' + V.fmt(far * R(), 2) + ' away at ' + V.fmt(far * 1.6, 2) + '. Speed ÷ distance is the same for every dot: ' + V.fmt(1.6 / R(), 3) + '. That ratio is the Hubble constant (for this moment). Tap another dot: the pattern looks the same from everywhere.');
    }
    c.cv.addEventListener('click', function (e) {
      var b = c.cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, best = -1, bd = 400;
      ang.forEach(function (a, i) { var dx = x - (geo.cx + geo.r * M.cos(a)), dy = y - (geo.cy + geo.r * M.sin(a)), d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
      if (best >= 0) { home = best; draw(); }
    });
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
