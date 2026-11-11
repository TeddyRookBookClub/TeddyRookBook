/* Chemistry ∩ Physics: Bohr's hydrogen atom. Orbit radii grow as n²; a jump from n to m gives light of
   wavelength 91.14 nm / (1/m² − 1/n²) (Balmer’s constant 364.56 nm divided by 4, so the visible lines match the Balmer region). Our own drawing; the tone is art (the light's frequency, 40 octaves down). */
Cx.viz('ph-bohr', function (v) {
  var hi = 3, lo = 2, flash = 0;
  var cv = v.canvas({ aspect: 0.62, max: 420, min: 280, label: 'The first six orbits of Bohr’s hydrogen atom, with one jump between two of them marked.' });
  function wl() { return 91.14 / (1 / (lo * lo) - 1 / (hi * hi)); }
  function rgb(nm) { var r = 0, g = 0, b = 0; if (nm < 380 || nm > 750) return null; if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = (510 - nm) / 20; } else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = (645 - nm) / 65; } else r = 1; return 'rgb(' + Math.round(255 * r) + ',' + Math.round(255 * g) + ',' + Math.round(255 * b) + ')'; }
  var ro = v.readout();
  function info() { var l = wl(), kind = l < 380 ? 'ultraviolet, not visible' : l > 750 ? 'infrared, not visible' : 'visible'; ro.textContent = 'Level ' + hi + ' to level ' + lo + ': light of ' + l.toFixed(1) + ' nm (' + kind + '), energy ' + (1239.84 / l).toFixed(2) + ' eV'; }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, cx = w * 0.42, cy = h / 2, R = Math.min(h / 2 - 8, w * 0.4), n;
    cv.clear(c.bg);
    for (n = 1; n <= 6; n++) {
      var r = R * n * n / 36;
      x.strokeStyle = n === hi || n === lo ? c.chemistry : c.grid; x.lineWidth = n === hi || n === lo ? 2.2 : 1.2; x.beginPath(); x.arc(cx, cy, Math.max(3, r), 0, 7); x.stroke();
      x.fillStyle = c.muted; x.font = '11px system-ui,sans-serif'; if (n > 2) x.fillText('n=' + n, cx + r * 0.71 + 3, cy - r * 0.71 - 2); else x.fillText('n=' + n, cx + 6 + (n - 1) * 26, cy + 14 + (n - 1) * 4);
    }
    x.fillStyle = c.physics; x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill();
    var rl = R * lo * lo / 36, rh = R * hi * hi / 36, col = rgb(wl()) || c.muted;
    x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - rh, cy); x.lineTo(cx - rl - 4, cy); x.stroke();
    x.fillStyle = col; x.beginPath(); x.moveTo(cx - rl - 2, cy); x.lineTo(cx - rl - 11, cy - 5); x.lineTo(cx - rl - 11, cy + 5); x.fill();
    x.fillStyle = c.ink; x.beginPath(); x.arc(cx - (flash > 0 ? rl : rh), cy, 5, 0, 7); x.fill();
    /* the color given off */
    x.fillStyle = col; x.fillRect(w * 0.86, h * 0.2, w * 0.1, h * 0.6); x.strokeStyle = c.muted; x.lineWidth = 1; x.strokeRect(w * 0.86, h * 0.2, w * 0.1, h * 0.6);
  });
  function jump() { flash = 1; v.redraw(); Cx.tone(299792458 / (wl() * 1e-9) / Math.pow(2, 40), 0.9, { gain: 0.2 }); setTimeout(function () { flash = 0; v.redraw(); }, 900); }
  var OPT = [[1, 'ends on level 1 (Lyman)'], [2, 'ends on level 2 (Balmer)'], [3, 'ends on level 3 (Paschen)']];
  v.select('Series', OPT.map(function (o) { return [String(o[0]), o[1]]; }), '2', function (s) { lo = +s; if (hi <= lo) hi = lo + 1; info(); v.redraw(); });
  v.slider('Start level', 2, 6, 1, 3, function (q) { hi = Math.max(q, lo + 1); info(); v.redraw(); }, { fmt: function (q) { return 'n = ' + Math.max(q, lo + 1); } });
  v.button('▶ Make the jump', jump, { pri: true });
  info();
});
