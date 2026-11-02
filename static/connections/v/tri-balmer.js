/* Music ∩ Math ∩ Chemistry: Balmer's formula (1885) for hydrogen's visible lines, λ = B·n²/(n² − 4), B = 364.56 nm,
   compared with the harmonic series. The sound is an artistic sonification: light frequencies divided by 2^40. Our own drawing. */
Cx.viz('tri-balmer', function (v) {
  var B = 364.56, top = 7, C = 2.99792458e17, DIV = Math.pow(2, 40), hot = -1;
  function lam(n) { return B * n * n / (n * n - 4); }
  function rgb(l) { var r = 0, g = 0, b = 0; if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1; var f = l < 420 ? 0.35 + 0.65 * (l - 380) / 40 : l > 680 ? 0.35 + 0.65 * (750 - l) / 70 : 1; f = Math.max(0.25, Math.min(1, f)); return 'rgb(' + [r, g, b].map(function (q) { return Math.round(255 * Math.pow(q * f, 0.8)); }).join(',') + ')'; }
  var cv = v.canvas({ aspect: 0.6, max: 420, min: 330, label: "Hydrogen's lines on a strip of the visible spectrum, and below, the lines and the harmonic series side by side." });
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, x0 = 16, x1 = w - 16, n;
    cv.clear(c.bg);
    // 1. the spectrum strip: 360 to 700 nm
    var y0 = 26, sh = h * 0.24;
    function X(l) { return x0 + (l - 360) / 340 * (x1 - x0); }
    x.fillStyle = '#05070a'; x.fillRect(x0, y0, x1 - x0, sh);
    for (n = 3; n <= top; n++) { var l = lam(n); x.fillStyle = rgb(l); x.globalAlpha = n === hot ? 1 : 0.9; x.fillRect(X(l) - (n === 3 ? 2.5 : 1.5), y0, n === 3 ? 5 : 3, sh); }
    x.globalAlpha = 1; x.strokeStyle = '#bbb'; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(X(B), y0); x.lineTo(X(B), y0 + sh); x.stroke(); x.setLineDash([]);
    x.fillStyle = c.muted; x.font = '12px system-ui,sans-serif';
    x.fillText('Hydrogen, visible light (wavelength in nm)', x0, 16);
    [400, 500, 600, 700].forEach(function (l) { x.fillText(String(l), X(l) - 10, y0 + sh + 15); });
    x.fillText('limit 364.6', X(B) + 3, y0 + sh + 15 + (w < 500 ? 13 : 0));
    // 2. frequency comparison
    var ya = h * 0.62, yb = h * 0.86, L = x1 - x0;
    x.fillStyle = c.ink; x.font = '600 13px system-ui,sans-serif';
    x.fillText('Harmonics: 1, 2, 3, 4 … evenly spaced, no end', x0, ya - 22);
    x.fillText("Hydrogen: 1/4 − 1/n², crowding toward a limit", x0, yb - 22);
    x.strokeStyle = c.grid; x.lineWidth = 1.5; [ya, yb].forEach(function (y) { x.beginPath(); x.moveTo(x0, y); x.lineTo(x1, y); x.stroke(); });
    for (n = 1; n <= 12; n++) { var px = x0 + n / 12 * L * 0.96; x.fillStyle = c.music; x.fillRect(px - 1.5, ya - 14, 3, 14); }
    for (n = 3; n <= 40; n++) { var q = (0.25 - 1 / (n * n)) / 0.25, p2 = x0 + q * L * 0.96; x.fillStyle = n <= top ? c.chemistry : c.a(c.chemistry, 0.35); x.fillRect(p2 - 1.5, yb - 14, 3, 14); if (n <= 5) { x.fillStyle = c.muted; x.font = '11px system-ui,sans-serif'; x.fillText('n=' + n, p2 - 10, yb + 14); } }
    x.strokeStyle = c.chemistry; x.setLineDash([3, 3]); x.beginPath(); x.moveTo(x0 + L * 0.96, yb - 18); x.lineTo(x0 + L * 0.96, yb + 4); x.stroke(); x.setLineDash([]);
  });
  function table() { var a = []; for (var n = 3; n <= top; n++) a.push('n=' + n + ': ' + lam(n).toFixed(1) + ' nm'); ro.textContent = a.join(' · '); }
  v.slider('Lines shown', 3, 12, 1, top, function (k) { top = k; table(); v.redraw(); });
  var tm = [];
  v.button('♪ Play hydrogen (art)', function () {
    tm.forEach(clearTimeout); tm = [];
    for (var n = 3; n <= top; n++) (function (n, i) { Cx.tone(C / lam(n) / DIV, 0.6, { gain: 0.18, when: i * 0.45 }); tm.push(setTimeout(function () { hot = n; v.redraw(); }, i * 450)); })(n, n - 3);
    tm.push(setTimeout(function () { hot = -1; v.redraw(); }, (top - 2) * 450));
  }, { pri: true });
  v.button('♪ Play harmonics', function () { for (var n = 1; n <= 8; n++) Cx.tone(110 * n, 0.5, { type: 'triangle', gain: 0.16, when: (n - 1) * 0.42 }); });
  Cx.onStop(function () { tm.forEach(clearTimeout); hot = -1; v.redraw(); });
  table();
});
