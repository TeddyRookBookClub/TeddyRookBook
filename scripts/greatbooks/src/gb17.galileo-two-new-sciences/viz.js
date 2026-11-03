/* gb-incline: Galileo's grooved board. A ball rolls down a gentle slope; a mark is made at every equal beat of time
   (Galileo timed with a water clock). The marks sit at 1, 4, 9, 16 … units from the start, so the gaps grow
   1, 3, 5, 7: the odd numbers. Change the slope: everything speeds up or slows down, but the pattern stays.
   Second view: two balls, one heavy and one light, dropped together with and without air.
   opts: deg: 6; beats: 5; view: "incline" | "drop"; quiet: true hides the readout. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, TAU = 2 * M.PI;
  V.register('gb-incline', function (el, o) {
    o = o || {};
    var deg = o.deg == null ? 6 : +o.deg, beats = o.beats == null ? 5 : +o.beats, view = o.view || 'incline', t = 0, playing = false, air = false;
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.9, min: 220, max: 360 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'View', items: [['incline', 'The grooved board'], ['drop', 'Heavy and light']], value: view, change: function (v) { view = v; t = 0; showCtl(); draw(); } });
    var sd = V.slider(ctl, { label: 'Slope of the board', min: 2, max: 30, step: 1, value: deg, fmt: function (v) { return v + '°'; }, input: function (v) { deg = v; t = 0; draw(); } });
    var sb = V.slider(ctl, { label: 'Beats of the water clock', min: 2, max: 6, step: 1, value: beats, input: function (v) { beats = v; t = 0; draw(); } });
    var sa = V.seg(ctl, { label: 'Air', items: [['0', 'No air'], ['1', 'With air']], value: '0', change: function (v) { air = v === '1'; t = 0; draw(); } });
    var pb = V.button(ctl, 'Roll', function () { t = 0; playing = true; lp.start(); if (V.reduced) { t = 1e9; playing = false; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function showCtl() { var inc = view === 'incline'; sd.el.hidden = !inc; sb.el.hidden = !inc; sa.el.hidden = inc; pb.textContent = inc ? 'Roll' : 'Drop'; }
    showCtl();
    var lp = V.loop(el, function (dt) { if (!playing) return; t += dt; draw(); if (t > tEnd()) { playing = false; t = tEnd(); draw(); } });
    function tEnd() { return view === 'incline' ? beats * 0.6 : 2.2; }
    function clear(k) { var x = c.ctx; x.save(); x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.fillStyle = k.bg; x.fillRect(0, 0, c.w, c.h); x.restore(); }
    function draw() { var k = V.colors(); clear(k); if (view === 'incline') incline(k); else drop(k); }
    function incline(k) {
      var g = c.ctx, w = c.w, h = c.h, a = deg * M.PI / 180, L0 = 20, top = 30;
      // the drawn board: length fixed on screen; the drawn tilt is exaggerated a little so small slopes are visible
      var shown = M.max(a, 0.08) * 1.0, len = M.min((w - 2 * L0) / M.cos(shown), (h - top - 50) / M.sin(shown));
      var x0 = L0, y0 = top, x1 = x0 + len * M.cos(shown), y1 = y0 + len * M.sin(shown);
      g.strokeStyle = k.ink; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0 + 8); g.lineTo(x1, y1 + 8); g.stroke();
      g.strokeStyle = k.gold; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0 + 4); g.lineTo(x1, y1 + 4); g.stroke();
      // marks at each beat: distance proportional to n^2, scaled so the last beat reaches the end
      var n2 = beats * beats, tb = 0.6, done = M.min(beats, t / tb);
      for (var n = 1; n <= beats; n++) {
        var f = n * n / n2, mx = x0 + f * (x1 - x0), my = y0 + f * (y1 - y0), on = n <= done + 1e-9;
        g.strokeStyle = on ? k.red : k.grid; g.lineWidth = 2; g.beginPath(); g.moveTo(mx, my - 6); g.lineTo(mx, my + 16); g.stroke();
        if (on) { g.fillStyle = k.red; g.font = '700 12px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(String(n * n), mx, my + 30); }
        if (on && n > 1) { var pf = (n - 1) * (n - 1) / n2, px = x0 + pf * (x1 - x0), py = y0 + pf * (y1 - y0); g.fillStyle = k.green; g.font = '600 11px system-ui,sans-serif'; g.fillText('+' + (2 * n - 1), (px + mx) / 2, (py + my) / 2 - 12); }
      }
      var ft = M.min(1, (t / tb) * (t / tb) / n2), bx = x0 + ft * (x1 - x0), by = y0 + ft * (y1 - y0);
      g.fillStyle = k.blue; g.beginPath(); g.arc(bx, by - 2, 7, 0, TAU); g.fill();
      // water clock: a jar that fills one cup per beat
      var jx = w - 70, jy = h - 52, cups = M.min(beats, t / tb);
      g.strokeStyle = k.muted; g.lineWidth = 1.5; g.strokeRect(jx, jy, 50, 40);
      g.fillStyle = k.blueSoft; var fh = 40 * cups / beats; g.fillRect(jx + 1, jy + 40 - fh, 48, fh);
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('water = time', jx + 25, jy - 6);
      var g98 = 9.8 * M.sin(a) * 5 / 7, d1 = 0.5 * g98 * 1; // rolling ball: a = (5/7) g sin(slope)
      c.cv.setAttribute('aria-label', 'A ball rolling down a board sloped ' + deg + ' degrees, with marks at 1, 4, 9, 16 and so on at equal beats');
      out.set('Distances from the start after 1, 2, 3 … beats: ' + Array.apply(null, Array(beats)).map(function (_, i) { return (i + 1) * (i + 1); }).join(', ') +
        ' units. The gaps are ' + Array.apply(null, Array(beats)).map(function (_, i) { return 2 * i + 1; }).join(', ') + ': distance grows as the <b>square</b> of the time. At ' + deg + '° a rolling ball goes about ' + V.fmt(d1, 2) + ' m in the first second (a steeper board only changes the scale).');
    }
    function drop(k) {
      var g = c.ctx, w = c.w, h = c.h, top = 24, H = h - top - 30, tt = M.min(t, 2), gA = 9.8;
      // tower 20 m tall; heavy iron ball and light cork-sized ball; with air the light one lags (simple drag model)
      var Hm = 20;
      function fallNoAir(s) { return M.min(Hm, 0.5 * gA * s * s); }
      function fallAir(s, vt) { return M.min(Hm, vt * vt / gA * M.log(M.cosh(gA * s / vt))); }
      var heavy = air ? fallAir(tt, 140) : fallNoAir(tt), light = air ? fallAir(tt, 6) : fallNoAir(tt);
      var tx = w * 0.18; g.fillStyle = k.panel; g.fillRect(tx - 30, top, 30, H + 6); g.strokeStyle = k.muted; g.strokeRect(tx - 30, top, 30, H + 6);
      g.strokeStyle = k.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(0, top + H + 6); g.lineTo(w, top + H + 6); g.stroke();
      var xs = [w * 0.42, w * 0.7];
      [[heavy, 11, k.ink, 'heavy'], [light, 6, k.orange, 'light']].forEach(function (b, i) {
        var y = top + 6 + H * b[0] / Hm; g.fillStyle = b[2]; g.beginPath(); g.arc(xs[i], y, b[1], 0, TAU); g.fill();
        g.fillStyle = k.muted; g.font = '12px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(b[3], xs[i], top - 8 < 10 ? 12 : top - 8);
      });
      c.cv.setAttribute('aria-label', 'Two balls dropped together from a 20 meter tower, ' + (air ? 'with air' : 'without air'));
      out.set(air ? 'With air, the light ball lags: air pushes back harder on it for its weight. The heavy ball still lands only a little ahead, not ten times sooner, as Aristotle’s rule would say.' :
        'With no air, both land together, after about ' + V.fmt(M.sqrt(2 * Hm / gA), 1) + ' s from 20 m. Galileo argued this by reasoning (two stones tied together) and by experiment.');
    }
    c.onResize(draw); V.onTheme(draw); t = 1e9; draw(); t = 0;
    return {};
  });
})();
