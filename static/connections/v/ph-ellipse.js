/* Math ∩ Physics: Kepler's first and second laws. The planet's place comes from Kepler's equation M = E − e sin E,
   solved by Newton's method; wedges swept in equal times have equal areas. Our own drawing. */
Cx.viz('ph-ellipse', function (v) {
  var e = 0.5, M = 0, NW = 8;
  var cv = v.canvas({ aspect: 0.62, max: 430, min: 280, label: 'A planet on an ellipse with the Sun at one focus. Wedges swept in equal times have equal areas.' });
  function ecc(Mm) { var E = Mm, i; for (i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - Mm) / (1 - e * Math.cos(E)); return E; }
  function pos(Mm, a, b, cx, cy) { var E = ecc(Mm); return [cx + a * Math.cos(E), cy - b * Math.sin(E)]; }
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, a = w * 0.42, b = a * Math.sqrt(1 - e * e), cx = w / 2, cy = h / 2, fx = cx + a * e, k, i;
    if (b > h * 0.46) { a *= h * 0.46 / b; b = h * 0.46; fx = cx + a * e; }
    cv.clear(c.bg);
    var cols = [c.blue, c.orange, c.teal, c.purple, c.red, c.gold, c.green, c.music];
    for (k = 0; k < NW; k++) {
      x.fillStyle = c.a(cols[k], 0.28); x.beginPath(); x.moveTo(fx, cy);
      for (i = 0; i <= 24; i++) { var p = pos((k + i / 24) / NW * 2 * Math.PI, a, b, cx, cy); x.lineTo(p[0], p[1]); }
      x.closePath(); x.fill();
    }
    x.strokeStyle = c.ink; x.lineWidth = 1.5; x.beginPath(); x.ellipse(cx, cy, a, b, 0, 0, 7); x.stroke();
    x.fillStyle = c.gold; x.beginPath(); x.arc(fx, cy, 9, 0, 7); x.fill();
    x.fillStyle = c.muted; x.beginPath(); x.arc(cx - a * e, cy, 2.5, 0, 7); x.fill();
    var P = pos(M, a, b, cx, cy);
    x.strokeStyle = c.muted; x.lineWidth = 1; x.beginPath(); x.moveTo(fx, cy); x.lineTo(P[0], P[1]); x.stroke();
    x.fillStyle = c.physics; x.beginPath(); x.arc(P[0], P[1], 7, 0, 7); x.fill();
    var E = ecc(M), r = 1 - e * Math.cos(E), sp = Math.sqrt(2 / r - 1);
    ro.textContent = 'Eccentricity ' + e.toFixed(2) + ' · distance from the Sun ' + r.toFixed(2) + ' · speed ' + sp.toFixed(2) + ' (both in units of the average orbit)';
  });
  v.loop(function (dt) { M = (M + dt * 0.7) % (2 * Math.PI); v.redraw(); }, { label: 'Orbit' });
  var sl = v.slider('How stretched', 0, 0.85, 0.01, 0.5, function (q) { e = q; v.redraw(); }, { fmt: function (q) { return q.toFixed(2); } });
  v.select('Like', [['', 'choose a planet'], ['0.017', 'Earth, 0.017'], ['0.093', 'Mars, 0.093'], ['0.206', 'Mercury, 0.206'], ['0.249', 'Pluto, 0.249']], '', function (s) { if (s) { e = +s; sl.value = e; sl.show(); v.redraw(); } });
});
