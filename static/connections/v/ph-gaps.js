/* Music ∩ Patterns ∩ Physics: orbits that keep simple time with Jupiter. For an asteroid that goes round p times
   while Jupiter goes round q times, Kepler's third law gives a = 5.2026 AU × (q/p)^(2/3). Our own drawing; the clicks are art. */
Cx.viz('ph-gaps', function (v) {
  var AJ = 5.2026, R = [[3, 1, true], [5, 2, true], [7, 3, true], [2, 1, true], [3, 2, false], [4, 3, false], [1, 1, false]], k = 0, t = 0, sound = false, lastA = -1, lastJ = -1;
  var cv = v.canvas({ aspect: 0.5, max: 340, min: 240, label: 'A line of distances from the Sun, with the orbits that keep simple time with Jupiter marked.' });
  var ro = v.readout();
  function au(p, q) { return AJ * Math.pow(q / p, 2 / 3); }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, x0 = 30, x1 = w - 20, lo = 1.8, hi = 5.5, y = h * 0.68, i;
    function X(a) { return x0 + (a - lo) / (hi - lo) * (x1 - x0); }
    cv.clear(c.bg);
    x.strokeStyle = c.axis; x.lineWidth = 1.5; x.beginPath(); x.moveTo(x0, y); x.lineTo(x1, y); x.stroke();
    x.fillStyle = c.muted; x.font = '11px system-ui,sans-serif'; x.textAlign = 'center';
    for (i = 2; i <= 5; i++) { x.fillRect(X(i), y, 1, 6); x.fillText(i + ' AU', X(i), y + 19); }
    x.fillStyle = c.a(c.patterns, 0.18); x.fillRect(X(2.06), y - 26, X(3.28) - X(2.06), 26);
    x.fillStyle = c.muted; x.fillText('main asteroid belt', (X(2.06) + X(3.28)) / 2, y + 34);
    R.forEach(function (r, j) {
      var a = au(r[0], r[1]), on = j === k;
      x.strokeStyle = on ? c.physics : r[2] ? c.ink : c.muted; x.lineWidth = on ? 3 : 1.4; x.beginPath(); x.moveTo(X(a), y - (on ? 46 : 30)); x.lineTo(X(a), y); x.stroke();
      x.fillStyle = on ? c.physics : c.ink; x.font = (on ? '700 ' : '500 ') + '12px system-ui,sans-serif'; x.fillText(r[0] + ':' + r[1], X(a), y - (on ? 52 : 35));
    });
    x.fillStyle = c.gold; x.beginPath(); x.arc(X(AJ), y, 8, 0, 7); x.fill(); x.fillStyle = c.muted; x.fillText('Jupiter', X(AJ), y + 34);
    /* the two rhythms as dots going round */
    var r = R[k], cyc = (t * 0.25) % 1, bx = 40, by = 26;
    [[r[0], c.physics, 'asteroid'], [r[1], c.gold, 'Jupiter']].forEach(function (q, j) {
      var ang = 2 * Math.PI * cyc * q[0] - Math.PI / 2, X0 = bx + j * 64;
      x.strokeStyle = c.grid; x.lineWidth = 1.2; x.beginPath(); x.arc(X0, by + 4, 16, 0, 7); x.stroke();
      x.fillStyle = q[1]; x.beginPath(); x.arc(X0 + 16 * Math.cos(ang), by + 4 + 16 * Math.sin(ang), 4.5, 0, 7); x.fill();
    });
    x.textAlign = 'left';
    ro.textContent = r[0] + ' turns to Jupiter’s ' + r[1] + ': ' + au(r[0], r[1]).toFixed(2) + ' AU from the Sun' + (r[2] ? ' · a Kirkwood gap' : r[0] === 1 ? ' · Jupiter’s own orbit' : ' · asteroids gather here instead (a locked group)');
  });
  v.select('Ratio', R.map(function (r, j) { return [String(j), r[0] + ' to ' + r[1]]; }), '0', function (s) { k = +s; t = 0; lastA = lastJ = -1; v.redraw(); });
  v.toggle('Sound', false, function (on) { sound = on; if (on) Cx.audio(); });
  v.loop(function (dt) {
    t += dt; var r = R[k], cyc = t * 0.25, a = Math.floor(cyc * r[0]), j = Math.floor(cyc * r[1]);
    if (sound) { if (a !== lastA) Cx.tone(880, 0.06, { gain: 0.16, type: 'square' }); if (j !== lastJ) Cx.tone(220, 0.12, { gain: 0.22, type: 'triangle' }); }
    lastA = a; lastJ = j; v.redraw();
  }, { label: 'Play' });
});
