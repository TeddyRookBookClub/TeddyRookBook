/* Music ∩ Math: the first eight modes of a string, and the harmonic series they make. Our own drawing. */
Cx.viz('mm-harmonics', function (v) {
  var N = 8, f1 = 110, on = [true, false, false, false, false, false, false, false], t = 0, hot = -1;
  var cv = v.canvas({ aspect: 0.62, max: 440, min: 300, label: 'A string vibrating in its first eight modes. Mode n has n equal loops and n times the frequency.' });
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, rh = h / N, x0 = 92, L = w - x0 - 18;
    cv.clear(c.bg);
    for (var n = 1; n <= N; n++) {
      var y = (n - 0.5) * rh, a = rh * 0.32 * Math.cos(t * 2 * Math.PI * 0.3 * n), col = on[n - 1] ? c.music : c.muted;
      if (n - 1 === hot) { x.fillStyle = c.a(c.gold, 0.18); x.fillRect(0, y - rh / 2, w, rh); }
      x.fillStyle = col; x.font = (on[n - 1] ? '700 ' : '500 ') + '13px system-ui,sans-serif';
      x.fillText(n + ' × ' + f1 + ' = ' + n * f1, 8, y + 4);
      x.strokeStyle = col; x.lineWidth = on[n - 1] ? 2.5 : 1.3; x.beginPath();
      for (var i = 0; i <= 120; i++) { var s = i / 120; x.lineTo(x0 + s * L, y + a * Math.sin(n * Math.PI * s)); }
      x.stroke();
      x.fillStyle = c.ink; for (var k = 0; k <= n; k++) { x.beginPath(); x.arc(x0 + k / n * L, y, 2.5, 0, 7); x.fill(); }
    }
  });
  function play(n) { Cx.tone(f1 * n, 1.2, { gain: 0.22 / Math.sqrt(n) }); hot = n - 1; v.redraw(); setTimeout(function () { hot = -1; v.redraw(); }, 900); }
  cv.el.addEventListener('click', function (e) { var r = cv.el.getBoundingClientRect(), n = Math.floor((e.clientY - r.top) / r.height * N) + 1; on[n - 1] = !on[n - 1]; play(n); v.redraw(); });
  cv.el.tabIndex = 0;
  cv.el.addEventListener('keydown', function (e) { var n = +e.key; if (n >= 1 && n <= 8) { on[n - 1] = !on[n - 1]; play(n); } });
  v.button('▶ Climb the series', function () { for (var n = 1; n <= N; n++) (function (n) { Cx.tone(f1 * n, 0.55, { gain: 0.2 / Math.sqrt(n), when: (n - 1) * 0.5 }); setTimeout(function () { hot = n - 1; v.redraw(); }, (n - 1) * 500); })(n); setTimeout(function () { hot = -1; v.redraw(); }, N * 500); }, { pri: true });
  v.button('♪ Play the lit modes together', function () { on.forEach(function (o, i) { if (o) Cx.tone(f1 * (i + 1), 2, { gain: 0.2 / (i + 1) }); }); });
  v.loop(function (dt) { t += dt; v.redraw(); }, { label: 'Vibrate' });
  v.say('Tap a row, or press 1 to 8, to light a mode and hear it.');
});
