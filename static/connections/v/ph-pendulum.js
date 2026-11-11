/* Physics: a pendulum and its two kinds of energy. Exact pendulum equation, stepped in small time steps. Our own drawing. */
Cx.viz('ph-pendulum', function (v) {
  var g = 9.81, L = 1, th = 1.0, om = 0, fr = 0, E0, lost = 0;
  function energy() { return 0.5 * L * L * om * om + g * L * (1 - Math.cos(th)); }
  function reset(a) { th = a; om = 0; lost = 0; E0 = energy(); }
  reset(1.0);
  var cv = v.canvas({ aspect: 0.6, max: 420, min: 280, label: 'A pendulum swinging, with bars for energy of height, energy of motion, heat and the total.' });
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, px = w * 0.33, py = 26, R = Math.min(h - 70, w * 0.3);
    cv.clear(c.bg);
    x.strokeStyle = c.muted; x.lineWidth = 3; x.beginPath(); x.moveTo(px - 50, py); x.lineTo(px + 50, py); x.stroke();
    x.setLineDash([4, 5]); x.lineWidth = 1; x.beginPath(); x.arc(px, py, R, Math.PI / 2 - 1.3, Math.PI / 2 + 1.3); x.stroke(); x.setLineDash([]);
    var bx = px + R * Math.sin(th), by = py + R * Math.cos(th);
    x.strokeStyle = c.ink; x.lineWidth = 2; x.beginPath(); x.moveTo(px, py); x.lineTo(bx, by); x.stroke();
    x.fillStyle = c.physics; x.beginPath(); x.arc(bx, by, 13, 0, 7); x.fill();
    var pe = g * L * (1 - Math.cos(th)), ke = 0.5 * L * L * om * om, bars = [['Height', pe, c.blue], ['Motion', ke, c.red], ['Heat', lost, c.orange], ['Total', pe + ke + lost, c.green]];
    var x0 = w * 0.64, bw = Math.min(44, (w - x0 - 12) / 4 - 8), H = h - 70;
    bars.forEach(function (b, i) {
      var X = x0 + i * (bw + 8), hh = Math.max(0, b[1] / E0) * H;
      x.fillStyle = c.a(b[2], 0.18); x.fillRect(X, 20, bw, H); x.fillStyle = b[2]; x.fillRect(X, 20 + H - hh, bw, hh);
      x.fillStyle = c.ink; x.font = '600 12px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(b[0], X + bw / 2, 38 + H);
    });
    x.textAlign = 'left';
  });
  v.loop(function (dt) {
    dt = Math.min(dt, 0.05); var n = 8, s = dt / n;
    for (var i = 0; i < n; i++) { var a = -g / L * Math.sin(th) - fr * om; lost += fr * om * om * L * L * s; om += a * s; th += om * s; }
    v.redraw();
  }, { label: 'Swing' });
  v.slider('Start angle', 10, 150, 5, 57, function (d) { reset(d * Math.PI / 180); v.redraw(); }, { fmt: function (d) { return d + '°'; } });
  v.toggle('Friction', false, function (on) { fr = on ? 0.25 : 0; reset(th); v.redraw(); });
  v.button('Let go again', function () { reset(1.0); v.redraw(); });
  v.say('A pendulum swings. Bars show energy of height and of motion; their total stays the same unless friction is on.');
});
