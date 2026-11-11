/* Patterns ∩ Physics: two-slit interference. Left: the two circular waves added. Right: the brightness on the screen,
   cos²(π d sinθ / λ). Our own drawing. */
Cx.viz('ph-slits', function (v) {
  var lam = 550, d = 6, t = 0;   // wavelength in nm (color), slit gap in units of the drawn wavelength
  var cv = v.canvas({ aspect: 0.6, max: 420, min: 280, label: 'Waves from two slits overlapping, and the bright and dark stripes they make on a screen.' });
  function rgb(nm) { var r = 0, g = 0, b = 0; if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = (510 - nm) / 20; } else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = (645 - nm) / 65; } else r = 1; return [Math.round(255 * r), Math.round(255 * g), Math.round(255 * b)]; }
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, W = Math.floor(w * 0.8), col = rgb(lam), px = 13 * lam / 550, gap = d * px / 2, step = 3, i, j;
    cv.clear(c.dark ? '#0b0f0d' : '#101512');
    for (i = 8; i < W; i += step) for (j = 0; j < h; j += step) {
      var r1 = Math.hypot(i - 8, j - (h / 2 - gap)), r2 = Math.hypot(i - 8, j - (h / 2 + gap));
      var a = Math.cos(2 * Math.PI * (r1 / px - t)) + Math.cos(2 * Math.PI * (r2 / px - t)), s = Math.max(0, a / 2);
      x.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (s * 0.9).toFixed(2) + ')'; x.fillRect(i, j, step, step);
    }
    x.fillStyle = c.muted; x.fillRect(4, 0, 4, h / 2 - gap - 3); x.fillRect(4, h / 2 - gap + 3, 4, 2 * gap - 6); x.fillRect(4, h / 2 + gap + 3, 4, h);
    for (j = 0; j < h; j++) {
      var D = W - 8, y = j - h / 2, sn = y / Math.hypot(D, y), I = Math.pow(Math.cos(Math.PI * (2 * gap) * sn / px), 2);
      x.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + I.toFixed(2) + ')'; x.fillRect(W + 6, j, w - W - 6, 1);
    }
    x.fillStyle = '#fff'; x.font = '600 12px system-ui,sans-serif'; x.fillText('screen', W + 10, 14);
    ro.textContent = 'Light of ' + lam + ' nm · slits ' + d + ' wavelengths apart · stripes closer together when the slits are further apart';
  });
  v.slider('Color (wavelength)', 420, 680, 10, 550, function (q) { lam = q; v.redraw(); }, { fmt: function (q) { return q + ' nm'; } });
  v.slider('Gap between the slits', 2, 14, 1, 6, function (q) { d = q; v.redraw(); }, { fmt: function (q) { return q + ' wavelengths'; } });
  v.loop(function (dt) { t += dt * 0.6; v.redraw(); }, { label: 'Waves' });
});
