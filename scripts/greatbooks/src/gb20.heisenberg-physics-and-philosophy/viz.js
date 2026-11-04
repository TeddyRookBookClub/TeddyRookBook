/* gb-uncertainty: Heisenberg's trade-off, drawn as a wave packet. On top, a particle's wave squeezed into a region
   of width Δx; below, the spread of momenta that wave contains. Squeeze one and the other spreads, so that
   Δx · Δp never drops below ħ/2 (for these Gaussian packets it equals ħ/2 exactly). The numbers are for an electron.
   Our own design. opts: dx: 0.2–3 (in units of 0.1 nm). */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, HB = 1.0546e-34, ME = 9.109e-31;
  function sci(x) { var e = M.floor(M.log10(x)), m = x / M.pow(10, e); return V.fmt(m, 2) + ' × 10<sup>' + String(e).replace('-', '−') + '</sup>'; }
  V.register('gb-uncertainty', function (el, o) {
    o = o || {};
    var dx = o.dx == null ? 1 : +o.dx;
    var c = V.canvas(el, { aspect: 1.7, min: 260, max: 340 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'How tightly we pin down the position (Δx)', min: 0.2, max: 3, step: 0.05, value: dx, fmt: function (v) { return V.fmt(v * 0.1, 3) + ' nm'; }, input: function (v) { dx = v; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function panel(k, top, H, label, f, col, fill) {
      var g = c.ctx, x0 = 14, x1 = c.w - 14, mid = (x0 + x1) / 2;
      g.strokeStyle = k.axis; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, top + H); g.lineTo(x1, top + H); g.stroke();
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText(label, x0, top - 4);
      g.beginPath();
      for (var i = 0; i <= 400; i++) { var u = -4 + 8 * i / 400, x = mid + (x1 - x0) / 8 * u, y = top + H - H * f(u); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      if (fill) { g.lineTo(x1, top + H); g.lineTo(x0, top + H); g.closePath(); g.fillStyle = fill; g.fill(); }
      else { g.strokeStyle = col; g.lineWidth = 2; g.stroke(); }
    }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, H = (h - 70) / 2, dp = 0.5 / dx; // in the drawing's units, Δx·Δp = 1/2
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, h); g.restore();
      var kw = 5; // wave number of the carrier, for the picture
      panel(k, 22, H, 'where the particle might be found', function (u) { return M.exp(-u * u / (2 * dx * dx)) * (0.5 + 0.5 * M.cos(kw * u)) * 0.95; }, k.blue);
      panel(k, 22, H, '', function (u) { return M.exp(-u * u / (2 * dx * dx)) * 0.95; }, k.blueSoft, k.blueSoft);
      panel(k, 44 + H + 8, H, 'what momentum it might have', function (u) { return M.exp(-u * u / (2 * dp * dp)) * 0.95; }, k.red, k.redSoft);
      // real numbers for an electron: Δx in meters
      var DXm = dx * 0.1e-9, DP = HB / (2 * DXm), DV = DP / ME;
      c.cv.setAttribute('aria-label', 'A wave packet of width ' + V.fmt(dx * 0.1, 3) + ' nanometers and its spread of momenta');
      out.set('Δx = ' + V.fmt(dx * 0.1, 3) + ' nm, so Δp ≥ ħ/(2Δx) = <b>' + sci(DP) + ' kg·m/s</b>. For an electron that is a spread in speed of about <b>' + M.round(DV / 1000).toLocaleString('en-US') + ' km/s</b>. Narrow the top curve and the bottom one widens: the product Δx·Δp stays at ħ/2. Heisenberg argued this is not clumsy measuring but a limit built into nature’s description.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
