/* Music ∩ Math ∩ Patterns ∩ Physics: conjunction figures. Two bodies on circular orbits with periods T1 < T2 meet every
   T1·T2/(T2 − T1), each meeting 1/(T2/T1 − 1) of a turn beyond the last (Proposition 18.6 of the paper). Periods in days:
   JPL long-term means for the planets, NASA fact sheets for the moons. Our own drawing; the full version is Kepler’s Figures. */
Cx.viz('ph-trigon', function (v) {
  var P = [['Jupiter and Saturn', 4332.5921, 10759.2171, 3], ['Venus and the Earth', 224.7008, 365.2564, 5], ['The Earth and Mars', 365.2564, 686.9799, 7], ['Io and Europa', 1.769138, 3.551181, 1]], k = 0, n = 3, acc = 0, sound = false;
  var cv = v.canvas({ aspect: 0.8, max: 440, min: 300, label: 'A circle with the meeting places of two bodies marked and joined in order.' });
  var ro = v.readout();
  function step() { return 1 / (P[k][2] / P[k][1] - 1); }
  function syn() { return P[k][1] * P[k][2] / (P[k][2] - P[k][1]); }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 18, a = step(), i, q = P[k][3];
    cv.clear(c.bg);
    x.strokeStyle = c.grid; x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    x.fillStyle = c.gold; x.beginPath(); x.arc(cx, cy, 7, 0, 7); x.fill();
    var from = Math.max(0, n - 60);
    for (i = from + 1; i <= n; i++) {
      var a0 = 2 * Math.PI * a * (i - 1) - Math.PI / 2, a1 = 2 * Math.PI * a * i - Math.PI / 2, round = Math.floor((i - 1) / q) === Math.floor((n - 1) / q);
      x.strokeStyle = round ? c.gold : c.a(c.math, 0.25 + 0.6 * (i - from) / (n - from + 1)); x.lineWidth = round ? 2.4 : 1.1;
      x.beginPath(); x.moveTo(cx + R * Math.cos(a0), cy + R * Math.sin(a0)); x.lineTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1)); x.stroke();
    }
    for (i = from; i <= n; i++) { var aa = 2 * Math.PI * a * i - Math.PI / 2; x.fillStyle = i === n ? c.physics : c.ink; x.beginPath(); x.arc(cx + R * Math.cos(aa), cy + R * Math.sin(aa), i === n ? 6 : 3, 0, 7); x.fill(); }
    var yrs = n * syn() / 365.25, drift = ((q * a) - Math.round(q * a)) * 360;
    ro.textContent = n + ' meetings in ' + (yrs >= 3 ? yrs.toFixed(1) + ' years' : (n * syn()).toFixed(1) + ' days') + ' · each ' + (a % 1).toFixed(4) + ' of a turn beyond the last' + (q > 1 ? ' · a figure of ' + q + ' points that turns ' + Math.abs(drift).toFixed(1) + '° each time round' : ' · the meeting place creeps slowly backward');
  });
  function next() { n++; if (sound) Cx.tone([261.63, 329.63, 392, 493.88, 587.33, 659.25, 783.99][(n - 1) % P[k][3]], 0.4, { gain: 0.18, type: 'triangle' }); v.redraw(); }
  v.select('Pair', P.map(function (p, i) { return [String(i), p[0]]; }), '0', function (s) { k = +s; n = P[k][3]; v.redraw(); });
  v.button('Next meeting', next, { pri: true });
  v.toggle('Sound', false, function (on) { sound = on; if (on) Cx.audio(); });
  v.button('Start again', function () { n = 0; v.redraw(); });
  v.loop(function (dt) { acc += dt; if (acc > 0.55) { acc = 0; next(); } }, { label: 'Draw', auto: false });
});
