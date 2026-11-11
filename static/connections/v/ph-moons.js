/* Music ∩ Math ∩ Physics: Io, Europa and Ganymede round Jupiter, periods 1.769138, 3.551181 and 7.154553 days
   (NASA planetary fact sheets). A note sounds when a moon passes the top. Our own drawing. */
Cx.viz('ph-moons', function (v) {
  var T = [1.769138, 3.551181, 7.154553], NM = ['Io', 'Europa', 'Ganymede'], R = [0.42, 0.67, 1], F = [523.25, 392, 261.63], day = 0, sound = false, laps = [0, 0, 0], flash = [0, 0, 0];
  var cv = v.canvas({ aspect: 0.7, max: 420, min: 280, label: 'Jupiter with Io, Europa and Ganymede on circular orbits. Io goes round four times and Europa twice for each turn of Ganymede.' });
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, cx = w / 2, cy = h / 2, S = Math.min(w, h) / 2 - 16, cols = [c.red, c.blue, c.green], i;
    cv.clear(c.bg);
    x.strokeStyle = c.muted; x.lineWidth = 1; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx, cy - S - 8); x.stroke(); x.setLineDash([]);
    x.fillStyle = c.gold; x.beginPath(); x.arc(cx, cy, 12, 0, 7); x.fill();
    for (i = 0; i < 3; i++) {
      x.strokeStyle = c.grid; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, S * R[i], 0, 7); x.stroke();
      var a = 2 * Math.PI * day / T[i] - Math.PI / 2;
      x.fillStyle = cols[i]; x.beginPath(); x.arc(cx + S * R[i] * Math.cos(a), cy + S * R[i] * Math.sin(a), flash[i] > 0 ? 10 : 6.5, 0, 7); x.fill();
      x.font = '600 12px system-ui,sans-serif'; x.fillText(NM[i] + ': ' + Math.floor(day / T[i]) + ' turns', 8, 16 + i * 16);
    }
    ro.textContent = 'Day ' + day.toFixed(1) + ' · Europa/Io = ' + (T[1] / T[0]).toFixed(4) + ', Ganymede/Europa = ' + (T[2] / T[1]).toFixed(4);
  });
  v.loop(function (dt) {
    var before = day; day += dt * 1.2;
    for (var i = 0; i < 3; i++) { if (Math.floor(day / T[i]) > Math.floor(before / T[i])) { flash[i] = 0.18; if (sound) Cx.tone(F[i], 0.35, { gain: 0.18, type: 'triangle' }); } flash[i] -= dt; }
    v.redraw();
  }, { label: 'Orbit' });
  v.toggle('Sound', false, function (on) { sound = on; if (on) Cx.audio(); });
  v.button('Start again', function () { day = 0; v.redraw(); });
});
