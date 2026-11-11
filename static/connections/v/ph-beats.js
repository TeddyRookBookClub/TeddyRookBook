/* Music ∩ Physics: two notes close in pitch and their sum, which swells and fades (beats). Our own drawing. */
Cx.viz('ph-beats', function (v) {
  var f1 = 440, f2 = 443, t = 0, stop = [];
  var cv = v.canvas({ aspect: 0.5, max: 360, min: 250, label: 'Two sound waves and their sum. The sum swells and fades at the difference of the two frequencies.' });
  var ro = v.readout();
  function info() { var d = Math.abs(f2 - f1); ro.textContent = f1 + ' Hz and ' + f2 + ' Hz: ' + (d ? d + (d === 1 ? ' beat' : ' beats') + ' a second' : 'the same note, no beats'); }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, rows = [[c.music, 1, 0], [c.physics, 0, 1], [c.ink, 1, 1]], rh = h / 3, span = 1.0;
    cv.clear(c.bg);
    rows.forEach(function (r, k) {
      var y0 = (k + 0.5) * rh, amp = rh * (k === 2 ? 0.22 : 0.3);
      x.strokeStyle = r[0]; x.lineWidth = k === 2 ? 1.6 : 1.1; x.beginPath();
      for (var i = 0; i <= w; i++) {
        var tt = t + i / w * span, y;
        /* drawn slowed down: each wave is shown at 1/20 of its true frequency so the shape is visible; the beat rate is true */
        y = r[1] * Math.sin(2 * Math.PI * (f1 / 20) * tt) + r[2] * Math.sin(2 * Math.PI * (f1 / 20 + (f2 - f1)) * tt);
        x.lineTo(i, y0 - amp * y);
      }
      x.stroke();
      x.fillStyle = r[0]; x.font = '600 12px system-ui,sans-serif'; x.fillText(k === 0 ? 'Note 1' : k === 1 ? 'Note 2' : 'Both together', 6, k * rh + 14);
    });
  });
  function hush() { stop.forEach(function (s) { try { s(); } catch (e) { } }); stop = []; }
  v.slider('Note 2', 430, 450, 1, 443, function (f) { f2 = f; info(); v.redraw(); }, { fmt: function (f) { return f + ' Hz'; } });
  v.button('♪ Play both for 4 seconds', function () { hush(); stop.push(Cx.tone(f1, 4, { gain: 0.16 })); stop.push(Cx.tone(f2, 4, { gain: 0.16 })); }, { pri: true });
  v.button('♪ Note 1 alone', function () { hush(); stop.push(Cx.tone(f1, 1.5, { gain: 0.18 })); });
  v.loop(function (dt) { t += dt * 0.25; v.redraw(); }, { label: 'Move' });
  Cx.onStop(function () { stop = []; });
  info();
});
