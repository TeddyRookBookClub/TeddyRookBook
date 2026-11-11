/* All five: one standing wave with n half-waves, shown as a string (music), its still points (patterns), an electron in a
   box with energy n² (chemistry, physics) and a wave wrapped n times round an orbit (physics). Our own drawing. */
Cx.viz('ph-wave', function (v) {
  var n = 3, mode = 'string', t = 0;
  var cv = v.canvas({ aspect: 0.56, max: 380, min: 260, label: 'A standing wave with a chosen number of half-waves, drawn as a string, as still points, as an electron in a box or as a wave round a circle.' });
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, x0 = 26, L = w - 52, y = h / 2, i, s, osc = Math.cos(t * 2 * Math.PI * 0.35 * Math.min(n, 4));
    cv.clear(c.bg);
    if (mode === 'ring') {
      var cx = w / 2, R = Math.min(w, h) * 0.3;
      x.strokeStyle = c.grid; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, y, R, 0, 7); x.stroke();
      x.strokeStyle = c.physics; x.lineWidth = 2.4; x.beginPath();
      for (i = 0; i <= 360; i++) { var a = i * Math.PI / 180, r = R + R * 0.24 * Math.sin(n * a) * osc; x.lineTo(cx + r * Math.cos(a), y + r * Math.sin(a)); }
      x.closePath(); x.stroke(); x.fillStyle = c.gold; x.beginPath(); x.arc(cx, y, 6, 0, 7); x.fill();
      ro.textContent = n + ' whole waves fit round the orbit, so the wave joins up with itself: Bohr’s level ' + n; return;
    }
    x.fillStyle = c.ink; x.fillRect(x0 - 4, y - 46, 4, 92); x.fillRect(x0 + L, y - 46, 4, 92);
    if (mode === 'box') {   /* probability: the wave squared */
      x.fillStyle = c.a(c.chemistry, 0.5); x.beginPath(); x.moveTo(x0, y + 40);
      for (i = 0; i <= 200; i++) { s = i / 200; x.lineTo(x0 + s * L, y + 40 - 80 * Math.pow(Math.sin(n * Math.PI * s), 2)); }
      x.lineTo(x0 + L, y + 40); x.fill();
      ro.textContent = 'An electron shut in a box: wave ' + n + ' has energy ' + n * n + ' times the lowest. The shading shows where the electron is likely to be found'; return;
    }
    x.strokeStyle = mode === 'string' ? c.music : c.patterns; x.lineWidth = 2.6; x.beginPath();
    for (i = 0; i <= 200; i++) { s = i / 200; x.lineTo(x0 + s * L, y - 42 * Math.sin(n * Math.PI * s) * osc); }
    x.stroke();
    if (mode === 'nodes') {
      for (i = 0; i <= n; i++) { x.fillStyle = c.ink; x.beginPath(); x.arc(x0 + i / n * L, y, 6, 0, 7); x.fill(); }
      ro.textContent = n + ' half-waves leave ' + (n + 1) + ' points that never move (counting the two ends). On a plate these become the lines where sand collects';
    } else ro.textContent = n + ' half-waves fit on the string: harmonic ' + n + ', ' + 110 * n + ' Hz';
  });
  v.slider('Half-waves that fit', 1, 8, 1, 3, function (q) { n = q; v.redraw(); }, { fmt: String });
  v.select('Show it as', [['string', 'a string (music)'], ['nodes', 'still points (patterns)'], ['box', 'an electron in a box (chemistry)'], ['ring', 'a wave round an orbit (physics)']], 'string', function (s) { mode = s; v.redraw(); });
  v.button('♪ Hear the string', function () { Cx.tone(110 * n, 1.2, { gain: 0.2 / Math.sqrt(n) }); }, { pri: true });
  v.loop(function (dt) { t += dt; v.redraw(); }, { label: 'Vibrate' });
});
