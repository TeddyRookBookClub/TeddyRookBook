/* Music ∩ Math ∩ Chemistry ∩ Physics: Sommerfeld's ellipses (1916). Level n has n orbits with the same long axis;
   the short axis is k/n of the long one, k = 1..n, and the nucleus sits at a focus. Our own drawing; the chord is art. */
Cx.viz('ph-sommerfeld', function (v) {
  var n = 3, t = 0;
  var cv = v.canvas({ aspect: 0.62, max: 400, min: 280, label: 'The allowed elliptical orbits of one level of Sommerfeld’s atom, all with the same long axis and the nucleus at one focus.' });
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, a = Math.min(w * 0.36, h * 0.44), cy = h / 2, fx = w * 0.5, cols = [c.red, c.blue, c.green, c.purple, c.orange], k;
    cv.clear(c.bg);
    for (k = 1; k <= n; k++) {
      var b = a * k / n, e = Math.sqrt(1 - k * k / (n * n)), cx = fx - a * e;
      x.strokeStyle = cols[k - 1]; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, a, b, 0, 0, 7); x.stroke();
      /* the electron, by Kepler's equation */
      var M = t * (1 + 0.13 * k), E = M, i; for (i = 0; i < 10; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      x.fillStyle = cols[k - 1]; x.beginPath(); x.arc(cx + a * Math.cos(E), cy - b * Math.sin(E), 5, 0, 7); x.fill();
      x.font = '600 12px system-ui,sans-serif'; x.fillText('short axis ' + (k === n ? 'equal: a circle' : k + '/' + n), 8, 16 + (k - 1) * 16);
    }
    x.fillStyle = c.ink; x.beginPath(); x.arc(fx, cy, 5, 0, 7); x.fill();
    ro.textContent = 'Level ' + n + ': ' + n + (n === 1 ? ' orbit' : ' orbits') + ' with the same energy. Short axis over long axis = ' + Array.apply(null, Array(n)).map(function (_, i) { return (i + 1) + '/' + n; }).join(', ');
  });
  v.slider('Level', 1, 5, 1, 3, function (q) { n = q; v.redraw(); }, { fmt: function (q) { return 'n = ' + q; } });
  v.button('♪ Hear the fractions as a chord', function () { for (var k = 1; k <= n; k++) Cx.tone(220 * n / k, 1.6, { gain: 0.16 / Math.sqrt(n), when: (n - k) * 0.25 }); }, { pri: true });
  v.loop(function (dt) { t += dt * 1.4; v.redraw(); }, { label: 'Orbit' });
});
