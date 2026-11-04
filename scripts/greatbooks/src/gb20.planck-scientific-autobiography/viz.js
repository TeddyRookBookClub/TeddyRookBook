/* gb-blackbody: the glow of a hot body, the problem Planck solved in 1900. The solid curve is Planck's law,
     B(λ, T) = (2hc² / λ⁵) · 1 / (e^(hc/λkT) − 1),
   the brightness at each wavelength λ for temperature T. The dashed curve is the older Rayleigh–Jeans formula,
   2ckT / λ⁴, which fits at long wavelengths but runs off to infinity at short ones (the "ultraviolet catastrophe").
   Planck's fix needed energy to come in packets E = hf. The curve is scaled to fit; the readout gives the peak
   (Wien's law, λ_peak = 2.898 × 10⁶ nm·K / T) and the total glow compared with the Sun (Stefan–Boltzmann, ∝ T⁴).
   Our own design. opts: T: 1000–12000; rj: true shows the old formula. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, h = 6.62607e-34, c0 = 2.99792e8, kB = 1.380649e-23;
  function planck(l, T) { var x = h * c0 / (l * kB * T); return x > 700 ? 0 : 2 * h * c0 * c0 / M.pow(l, 5) / (M.exp(x) - 1); }
  function rj(l, T) { return 2 * c0 * kB * T / M.pow(l, 4); }
  function rgb(l) { var r = 0, g = 0, b = 0; if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1; return 'rgb(' + M.round(r * 255) + ',' + M.round(g * 255) + ',' + M.round(b * 255) + ')'; }
  V.register('gb-blackbody', function (el, o) {
    o = o || {};
    var T = o.T == null ? 5800 : +o.T, showRJ = o.rj !== false;
    var c = V.canvas(el, { aspect: 1.9, min: 220, max: 320 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'Temperature', min: 1000, max: 12000, step: 100, value: T, fmt: function (v) { return v.toLocaleString('en-US') + ' K'; }, input: function (v) { T = v; draw(); } });
    V.seg(ctl, { label: 'Old formula', items: [['1', 'Show the old formula'], ['0', 'Hide it']], value: showRJ ? '1' : '0', change: function (v) { showRJ = v === '1'; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, hh = c.h, x0 = 16, x1 = w - 12, y0 = 22, y1 = hh - 36, LMAX = 3000;
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, hh); g.restore();
      var X = function (nm) { return x0 + (x1 - x0) * nm / LMAX; }, peak = 2.898e6 / T, top = planck(peak * 1e-9, T) * 1.15;
      var Y = function (b) { return y1 - (y1 - y0) * b / top; };
      // the visible band
      for (var l = 380; l < 750; l += 5) { g.fillStyle = rgb(l); g.globalAlpha = 0.25; g.fillRect(X(l), y0, X(l + 5) - X(l) + 0.5, y1 - y0); }
      g.globalAlpha = 1;
      g.strokeStyle = k.axis; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.lineTo(x1, y1); g.stroke();
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.textAlign = 'center';
      [0, 500, 1000, 1500, 2000, 2500, 3000].forEach(function (nm) { if (w > 420 || nm % 1000 === 0) g.fillText(String(nm), X(nm), y1 + 14); });
      g.fillText('wavelength (nm)', (x0 + x1) / 2, hh - 6);
      if (showRJ) {
        g.strokeStyle = k.red; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath(); var st = false;
        for (var n = 60; n <= LMAX; n += 10) { var y = Y(rj(n * 1e-9, T)); if (y < y0) { st = false; continue; } if (st) g.lineTo(X(n), y); else { g.moveTo(X(n), y); st = true; } }
        g.stroke(); g.setLineDash([]);
      }
      g.strokeStyle = k.green; g.lineWidth = 3; g.beginPath();
      for (var m = 20; m <= LMAX; m += 5) { var yy = Y(planck(m * 1e-9, T)); if (m === 20) g.moveTo(X(m), yy); else g.lineTo(X(m), yy); }
      g.stroke();
      g.strokeStyle = k.gold; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(peak), y1); g.lineTo(X(peak), Y(planck(peak * 1e-9, T))); g.stroke();
      g.fillStyle = k.ink; g.textAlign = 'left'; g.font = '600 12px system-ui,sans-serif';
      g.fillText('peak ' + M.round(peak) + ' nm', M.min(X(peak) + 6, x1 - 90), y0 + 4);
      c.cv.setAttribute('aria-label', 'Planck curve for ' + T + ' kelvin, peaking at ' + M.round(peak) + ' nanometers');
      var glow = peak < 380 ? 'bluish white' : peak < 750 ? 'white to yellow-white' : peak < 1500 ? 'orange to yellow' : 'dull red';
      out.set('At <b>' + T.toLocaleString('en-US') + ' K</b> the curve peaks at λ = 2,898,000 ÷ ' + T.toLocaleString('en-US') + ' ≈ <b>' + M.round(peak) + ' nm</b>' + (peak > 750 ? ', in the infrared' : peak < 380 ? ', in the ultraviolet' : ', in visible light') + '; such a body looks ' + glow + '. Each square meter gives off ' + V.fmt(M.pow(T / 5772, 4), 2) + ' times as much as the Sun’s surface (∝ T⁴).' + (showRJ ? ' The dashed old formula agrees far to the right but shoots upward at short wavelengths. Planck’s quanta tame it.' : ''));
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
