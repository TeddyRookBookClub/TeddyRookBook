/* Patterns ∩ Chemistry ∩ Physics: Bragg's law, 2 d sinθ = n λ. Two rays reflect from neighboring layers of atoms;
   the lower one travels 2 d sinθ further. Our own drawing. */
Cx.viz('ph-bragg', function (v) {
  var th = 20, d = 2.82, lam = 1.54;   // degrees; ångströms (table salt layers; copper K-alpha X-rays)
  var cv = v.canvas({ aspect: 0.6, max: 400, min: 280, label: 'Two X-rays reflecting from two layers of atoms in a crystal, and a meter showing how bright the reflection is.' });
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, t = th * Math.PI / 180, cx = w * 0.45, y1 = h * 0.52, gap = h * 0.2, y2 = y1 + gap, i, k;
    var path = 2 * d * Math.sin(t), ph = path / lam, I = Math.pow(Math.cos(Math.PI * ph), 2);
    cv.clear(c.bg);
    for (k = 0; k < 3; k++) for (i = -6; i <= 6; i++) { x.fillStyle = c.chemistry; x.beginPath(); x.arc(cx + i * 30, y1 + k * gap, 5, 0, 7); x.fill(); }
    function ray(y, col, shift) {
      var Lr = Math.min(h * 0.85, w * 0.5), px = 26, n = 110, s, u, wv;
      x.strokeStyle = col; x.lineWidth = 1.6;
      x.beginPath();   /* coming in from the upper left */
      for (s = 0; s <= n; s++) { u = s / n * Lr; wv = 5 * Math.sin(2 * Math.PI * u / px); x.lineTo(cx - (Lr - u) * Math.cos(t) - wv * Math.sin(t), y - (Lr - u) * Math.sin(t) + wv * Math.cos(t)); }
      x.stroke();
      x.beginPath();   /* going out to the upper right; the lower ray is behind by its extra path */
      for (s = 0; s <= n; s++) { u = s / n * Lr; wv = 5 * Math.sin(2 * Math.PI * ((Lr + u) / px - shift)); x.lineTo(cx + u * Math.cos(t) + wv * Math.sin(t), y - u * Math.sin(t) + wv * Math.cos(t)); }
      x.stroke();
    }
    ray(y1, c.blue, 0); ray(y2, c.red, ph);
    x.fillStyle = c.muted; x.font = '11px system-ui,sans-serif'; x.fillText('layer gap d = ' + d.toFixed(2) + ' Å', cx + 150 < w - 90 ? cx + 150 : 8, y1 + gap / 2 + 4);
    /* brightness meter */
    x.fillStyle = c.grid; x.fillRect(w - 26, 14, 14, h - 28); x.fillStyle = c.gold; x.fillRect(w - 26, 14 + (h - 28) * (1 - I), 14, (h - 28) * I);
    x.fillStyle = c.ink; x.font = '600 11px system-ui,sans-serif'; x.fillText('bright', w - 62, 22);
    ro.textContent = 'Angle ' + th.toFixed(1) + '° · the lower ray travels ' + path.toFixed(2) + ' Å further = ' + ph.toFixed(2) + ' wavelengths' + (Math.abs(ph - Math.round(ph)) < 0.04 && Math.round(ph) > 0 ? ' · in step: a bright spot (n = ' + Math.round(ph) + ')' : '');
  });
  var sl = v.slider('Angle of the beam', 5, 60, 0.1, 20, function (q) { th = q; v.redraw(); }, { fmt: function (q) { return q.toFixed(1) + '°'; } });
  [1, 2, 3].forEach(function (n) { var a = Math.asin(n * lam / (2 * d)) * 180 / Math.PI; v.button('Bright spot ' + n, function () { th = a; sl.value = a; sl.show(); v.redraw(); }); });
  v.say('Table salt, layer gap 2.82 ångströms, with X-rays of 1.54 ångströms. Bright spots near 15.9, 33.1 and 55.0 degrees.');
});
