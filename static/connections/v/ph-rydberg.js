/* Music ∩ Chemistry ∩ Physics: an atom with its electron at level n. Bohr radius 5.29177e-11 m × n²; orbital frequency
   6.5797e15 Hz / n³; a drop of k levels gives 3.28984e15 Hz × (1/(n−k)² − 1/n²). Our own drawing; the tones are art. */
Cx.viz('ph-rydberg', function (v) {
  var n = 30, A0 = 5.29177e-11, FO = 6.5797e15, RY = 3.28984e15;
  var cv = v.canvas({ aspect: 0.5, max: 340, min: 240, label: 'Bars comparing the frequencies given off when the electron drops one to four levels with whole multiples of its orbital frequency.' });
  var ro = v.readout();
  function size(m) { return m >= 1e-3 ? (m * 1e3).toPrecision(2) + ' mm' : m >= 1e-6 ? (m * 1e6).toPrecision(2) + ' micrometers' : (m * 1e9).toPrecision(2) + ' nanometers'; }
  function hz(f) { return f >= 1e12 ? (f / 1e12).toPrecision(3) + ' THz' : f >= 1e9 ? (f / 1e9).toPrecision(3) + ' GHz' : f >= 1e6 ? (f / 1e6).toPrecision(3) + ' MHz' : (f / 1e3).toPrecision(3) + ' kHz'; }
  function drop(k) { return RY * (1 / ((n - k) * (n - k)) - 1 / (n * n)); }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, f0 = FO / Math.pow(n, 3), k, x0 = 70, W = w - x0 - 20, top = Math.max(drop(4) / f0, 4.4);
    cv.clear(c.bg);
    for (k = 1; k <= 4; k++) {
      if (n - k < 1) continue;
      var y = 16 + (k - 1) * (h - 30) / 4, bh = (h - 30) / 4 - 14, r = drop(k) / f0;
      x.fillStyle = c.ink; x.font = '600 12px system-ui,sans-serif'; x.fillText('drop ' + k, 8, y + bh / 2 + 4);
      x.fillStyle = c.a(c.music, 0.25); x.fillRect(x0, y, W * k / top, bh / 2 - 1);
      x.fillStyle = c.physics; x.fillRect(x0, y + bh / 2 + 1, W * Math.min(r, top) / top, bh / 2 - 1);
      x.fillStyle = c.muted; x.font = '11px system-ui,sans-serif'; x.fillText('harmonic ' + k + ' · the atom: ' + r.toFixed(r < 10 ? 3 : 1) + ' × orbit', x0 + 6, y + bh + 11);
    }
    ro.textContent = 'Level ' + n + ': atom about ' + size(2 * A0 * n * n) + ' across · the electron goes round ' + hz(f0) + ' · a drop of 4 levels gives ' + hz(drop(4));
  });
  var sl = v.slider('Level n', 5, 1100, 1, 30, function (q) { n = q; v.redraw(); }, { fmt: function (q) { return 'n = ' + q; } });
  v.button('n = 1,009 (seen in space)', function () { n = 1009; sl.value = 1009; sl.show(); v.redraw(); });
  v.button('♪ Hear the four drops', function () { var f0 = FO / Math.pow(n, 3); for (var k = 1; k <= 4; k++) if (n - k >= 1) Cx.tone(110 * drop(k) / f0, 0.6, { gain: 0.18, when: (k - 1) * 0.55 }); }, { pri: true });
});
