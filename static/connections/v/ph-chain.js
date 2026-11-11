/* Music ∩ Patterns ∩ Chemistry ∩ Physics: a row of N equal atoms on springs, fixed at both ends. Mode m has the shape
   sin(m π j /(N+1)) and frequency proportional to sin(m π / (2(N+1))): the pitches crowd toward a highest note. Our own drawing. */
Cx.viz('ph-chain', function (v) {
  var N = 12, m = 1, t = 0, F0 = 880;   // the highest possible pitch is F0
  var cv = v.canvas({ aspect: 0.5, max: 320, min: 230, label: 'A row of atoms joined by springs, vibrating in one of its standing waves, and a ladder of the pitches of all its standing waves.' });
  var ro = v.readout();
  function f(mm) { return F0 * Math.sin(mm * Math.PI / (2 * (N + 1))); }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, x0 = 20, x1 = w - 20, y = h * 0.36, j, px = [], amp = Math.min(22, (x1 - x0) / (N + 1) * 0.42);
    cv.clear(c.bg);
    for (j = 0; j <= N + 1; j++) px.push(x0 + j * (x1 - x0) / (N + 1) + (j === 0 || j === N + 1 ? 0 : amp * Math.sin(m * Math.PI * j / (N + 1)) * Math.cos(t * (2 + 6 * Math.sin(m * Math.PI / (2 * (N + 1)))))));
    for (j = 0; j <= N; j++) {   /* springs */
      x.strokeStyle = c.muted; x.lineWidth = 1.2; x.beginPath(); var a = px[j], b = px[j + 1], s;
      for (s = 0; s <= 12; s++) x.lineTo(a + (b - a) * s / 12, y + (s === 0 || s === 12 ? 0 : (s % 2 ? -5 : 5)));
      x.stroke();
    }
    x.fillStyle = c.ink; x.fillRect(x0 - 4, y - 16, 4, 32); x.fillRect(x1, y - 16, 4, 32);
    for (j = 1; j <= N; j++) { x.fillStyle = c.chemistry; x.beginPath(); x.arc(px[j], y, 7, 0, 7); x.fill(); }
    /* the ladder of pitches */
    var by = h * 0.92, bh = h * 0.36;
    for (j = 1; j <= N; j++) { var X = x0 + (j - 0.5) * (x1 - x0) / N, hh = bh * f(j) / F0; x.fillStyle = j === m ? c.physics : c.a(c.music, 0.45); x.fillRect(X - 6, by - hh, 12, hh); }
    x.strokeStyle = c.muted; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(x0, by - bh); x.lineTo(x1, by - bh); x.stroke(); x.setLineDash([]);
    x.fillStyle = c.muted; x.font = '11px system-ui,sans-serif'; x.fillText('the highest note a row of atoms can have', x0, by - bh - 4);
    ro.textContent = 'Standing wave ' + m + ' of ' + N + ' · played at ' + Math.round(f(m)) + ' Hz · a plain string would give ' + Math.round(f(1) * m) + ' Hz';
  });
  v.slider('Standing wave', 1, 12, 1, 1, function (q) { m = q; v.redraw(); }, { fmt: function (q) { return 'number ' + q; } });
  v.button('♪ Hear it', function () { Cx.tone(f(m), 1.1, { gain: 0.2 }); }, { pri: true });
  v.button('♪ Climb all twelve', function () { for (var j = 1; j <= N; j++) Cx.tone(f(j), 0.3, { gain: 0.18, when: (j - 1) * 0.28 }); });
  v.loop(function (dt) { t += dt; v.redraw(); }, { label: 'Vibrate' });
});
