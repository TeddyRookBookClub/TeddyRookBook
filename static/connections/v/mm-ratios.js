/* Music ∩ Math: two strings whose lengths make a simple ratio. Our own drawing. */
Cx.viz('mm-ratios', function (v) {
  var R = [[1, 1, 'Unison'], [2, 1, 'Octave'], [3, 2, 'Fifth'], [4, 3, 'Fourth'], [5, 4, 'Major third'], [6, 5, 'Minor third'], [45, 32, 'Tritone (45:32)']];
  var pick = 2, base = 196, ph = 0;
  var cv = v.canvas({ aspect: 0.42, max: 300, min: 190, label: 'Two strings. The lower string is shorter by the chosen ratio, so it vibrates faster.' });
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, r = R[pick], L = w - 70, x0 = 35;
    cv.clear(c.bg);
    var rows = [[1, h * 0.32, c.music, 'Whole string'], [r[1] / r[0], h * 0.72, c.math, r[2] + ': ' + r[1] + '/' + r[0] + ' of the length']];
    rows.forEach(function (row, k) {
      var len = L * row[0], y = row[1], f = k ? r[0] / r[1] : 1, a = M(h) * Math.sin(ph * f * 2 * Math.PI);
      x.strokeStyle = c.muted; x.lineWidth = 3; x.beginPath(); x.moveTo(x0, y - 14); x.lineTo(x0, y + 14); x.moveTo(x0 + len, y - 14); x.lineTo(x0 + len, y + 14); x.stroke();
      if (k && len < L - 1) { x.setLineDash([4, 5]); x.strokeStyle = c.grid; x.lineWidth = 1.5; x.beginPath(); x.moveTo(x0 + len, y); x.lineTo(x0 + L, y); x.stroke(); x.setLineDash([]); }
      x.strokeStyle = row[2]; x.lineWidth = 2.5; x.beginPath();
      for (var i = 0; i <= 60; i++) { var t = i / 60; x.lineTo(x0 + t * len, y + a * Math.sin(Math.PI * t)); }
      x.stroke();
      x.fillStyle = c.ink; x.font = '600 13px system-ui,sans-serif'; x.fillText(row[3] + '  ·  ' + Math.round(base * f * 10) / 10 + ' Hz', x0, y - 22);
    });
  });
  function M(h) { return h * 0.08; }
  v.select('Interval', R.map(function (r, i) { return [String(i), r[2] + ' ' + r[0] + ':' + r[1]]; }), '2', function (s) { pick = +s; v.redraw(); v.say(R[pick][2] + ': frequencies in the ratio ' + R[pick][0] + ' to ' + R[pick][1]); });
  v.button('♪ Play together', function () { var r = R[pick]; Cx.tone(base, 2, { type: 'triangle', gain: 0.18 }); Cx.tone(base * r[0] / r[1], 2, { type: 'triangle', gain: 0.18 }); }, { pri: true });
  v.button('One after the other', function () { var r = R[pick]; Cx.tone(base, 0.8, { type: 'triangle', gain: 0.2 }); Cx.tone(base * r[0] / r[1], 0.8, { type: 'triangle', gain: 0.2, when: 0.85 }); });
  v.loop(function (dt) { ph += dt * 0.6; v.redraw(); }, { label: 'Vibrate' });
});
