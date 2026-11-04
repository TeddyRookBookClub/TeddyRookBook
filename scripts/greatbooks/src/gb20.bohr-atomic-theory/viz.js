/* gb-bohr-levels: Bohr's 1913 hydrogen atom. The electron may sit only on certain levels, E_n = −13.6 eV / n².
   Pick a jump from a higher level down to a lower one; the atom gives off one photon carrying the difference,
   with wavelength λ = 1240 nm·eV / ΔE. Jumps down to level 2 give the visible Balmer lines; to level 1, ultraviolet
   (Lyman); to level 3, infrared (Paschen). Our own design. opts: from: 2–6, to: 1–5. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math;
  function E(n) { return -13.6 / (n * n); }
  function rgb(l) { // rough visible color of a wavelength in nm
    var r = 0, g = 0, b = 0;
    if (l >= 380 && l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else if (l <= 750) { r = 1; }
    return 'rgb(' + M.round(r * 255) + ',' + M.round(g * 255) + ',' + M.round(b * 255) + ')';
  }
  var SERIES = { 1: 'Lyman series (ultraviolet)', 2: 'Balmer series (visible)', 3: 'Paschen series (infrared)', 4: 'Brackett series (infrared)', 5: 'Pfund series (infrared)' };
  V.register('gb-bohr-levels', function (el, o) {
    o = o || {};
    var hi = o.from == null ? 3 : +o.from, lo = o.to == null ? 2 : +o.to, t = 1, playing = false;
    var c = V.canvas(el, { aspect: 1.6, min: 260, max: 360 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    var sh = V.slider(ctl, { label: 'Start on level', min: 2, max: 6, step: 1, value: hi, input: function (v) { hi = v; if (lo >= hi) { lo = hi - 1; sl.set(lo); } t = 1; draw(); } });
    var sl = V.slider(ctl, { label: 'Fall to level', min: 1, max: 5, step: 1, value: lo, input: function (v) { lo = v; if (lo >= hi) { hi = lo + 1; sh.set(hi); } t = 1; draw(); } });
    V.button(ctl, 'Jump', function () { t = 0; playing = true; lp.start(); if (V.reduced) { t = 1; playing = false; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    var lp = V.loop(el, function (dt) { if (!playing) return; t = M.min(1, t + dt * 0.9); draw(); if (t >= 1) playing = false; });
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h;
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, h); g.restore();
      var top = 22, bot = h - 62, x0 = 52, x1 = w * 0.62, Y = function (e) { return top + (bot - top) * (e / -13.6); };
      g.font = '11px system-ui,sans-serif';
      for (var n = 1; n <= 6; n++) {
        var y = Y(E(n)), on = n === hi || n === lo;
        g.strokeStyle = on ? k.green : k.axis; g.lineWidth = on ? 3 : 1.5; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
        g.fillStyle = k.muted; g.textAlign = 'right'; if (n <= 3) g.fillText('n=' + n, x0 - 6, y + 4); else if (n === 5) g.fillText('n=4–6', x0 - 6, Y(0) + 4);
        g.textAlign = 'left'; if (n <= 3) g.fillText(V.fmt(E(n), 2) + ' eV', x1 + 6, y + 4);
      }
      g.strokeStyle = k.muted; g.setLineDash([3, 3]); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x1, Y(0)); g.stroke(); g.setLineDash([]);
      g.fillStyle = k.muted; g.textAlign = 'left'; g.fillText('0 eV: free electron', x1 + 6, Y(0) + 4);
      var dE = E(hi) - E(lo), lam = 1239.84 / dE, vis = lam >= 380 && lam <= 750, col = vis ? rgb(lam) : (lam < 380 ? k.purple : k.red);
      // the electron falling, and the photon leaving
      var ex = x0 + (x1 - x0) * 0.3, ey = Y(E(hi)) + (Y(E(lo)) - Y(E(hi))) * M.min(1, t * 1.6);
      g.strokeStyle = k.ink; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ex, Y(E(hi))); g.lineTo(ex, ey); g.stroke();
      g.fillStyle = k.blue; g.beginPath(); g.arc(ex, ey, 6, 0, 2 * M.PI); g.fill();
      if (t > 0.6) {
        var px = ex + 10 + (x1 - ex) * (t - 0.6) * 2.2, py = Y(E(lo)) - 6;
        g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath();
        for (var s = 0; s <= 60; s++) { var xx = ex + 10 + (px - ex - 10) * s / 60; g[s ? 'lineTo' : 'moveTo'](xx, py - 6 * M.sin(s / 3)); }
        g.stroke();
      }
      // the spectrum strip
      var sx = 20, sw = w - 40, sy = h - 34;
      var grad = g.createLinearGradient(sx + sw * 0.2, 0, sx + sw * 0.8, 0);
      [380, 440, 490, 510, 580, 645, 750].forEach(function (l) { grad.addColorStop((l - 380) / 370, rgb(l)); });
      g.globalAlpha = 0.35; g.fillStyle = grad; g.fillRect(sx + sw * 0.2, sy, sw * 0.6, 14); g.globalAlpha = 1;
      g.fillStyle = k.muted; g.textAlign = 'center'; g.fillText('ultraviolet', sx + sw * 0.1, sy + 11); g.fillText('infrared', sx + sw * 0.9, sy + 11); g.fillText('visible light', sx + sw * 0.5, sy + 28);
      var lx = lam < 380 ? sx + sw * 0.2 * (lam - 80) / 300 : lam > 750 ? sx + sw * 0.8 + sw * 0.2 * M.min(1, (lam - 750) / 7000) : sx + sw * 0.2 + sw * 0.6 * (lam - 380) / 370;
      g.fillStyle = col; g.fillRect(lx - 2, sy - 4, 4, 22);
      c.cv.setAttribute('aria-label', 'Hydrogen energy levels; a jump from level ' + hi + ' to level ' + lo + ' gives light of ' + M.round(lam) + ' nanometers');
      out.set('From n = ' + hi + ' to n = ' + lo + ': ΔE = ' + V.fmt(E(hi), 3) + ' − (' + V.fmt(E(lo), 3) + ') = <b>' + V.fmt(dE, 3) + ' eV</b>, so λ = 1240 ÷ ' + V.fmt(dE, 3) + ' ≈ <b>' + M.round(lam) + ' nm</b>, in the ' + SERIES[lo] + '. Only these jumps are allowed, which is why hydrogen glows in a few sharp colors instead of a smear.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
