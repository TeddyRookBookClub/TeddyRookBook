/* Math ∩ Patterns ∩ Chemistry ∩ Physics: the whole number in each gap of Harper's spectrum at flux p/q.
   With r bands below the gap, r = q s + p t has exactly one solution with |t| <= q/2 (Thouless, Kohmoto, Nightingale
   and den Nijs, 1982); t is the Hall conductance in units of e²/h. Our own drawing. */
Cx.viz('ph-hall', function (v) {
  var F = [[1, 3], [2, 5], [1, 7], [3, 8], [5, 13], [7, 12], [16, 113]], k = 2;
  var cv = v.canvas({ aspect: 0.5, max: 320, min: 230, label: 'A staircase: the whole number carried by each gap between energy bands, for the chosen fraction.' });
  var ro = v.readout();
  function hall(p, q, r) { for (var t = -Math.floor(q / 2); t <= Math.floor(q / 2); t++) if ((((r - p * t) % q) + q) % q === 0) return t; return 0; }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, p = F[k][0], q = F[k][1], x0 = 34, x1 = w - 12, y0 = h / 2, r, T = [], mx = 1;
    for (r = 1; r < q; r++) { T.push(hall(p, q, r)); mx = Math.max(mx, Math.abs(T[r - 1])); }
    cv.clear(c.bg);
    var sc = (h / 2 - 22) / mx, bw = (x1 - x0) / (q - 1);
    x.strokeStyle = c.axis; x.lineWidth = 1; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y0); x.stroke();
    x.fillStyle = c.muted; x.font = '11px system-ui,sans-serif'; x.fillText('+' + mx, 6, y0 - mx * sc + 4); x.fillText('−' + mx, 6, y0 + mx * sc + 4); x.fillText('0', 14, y0 + 4);
    T.forEach(function (t, i) {
      x.fillStyle = t > 0 ? c.physics : c.blue; var hh = Math.abs(t) * sc; x.fillRect(x0 + i * bw + 0.5, t > 0 ? y0 - hh : y0, Math.max(1, bw - 1), hh);
      if (q <= 13) { x.fillStyle = c.ink; x.font = '600 12px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText((t > 0 ? '+' : '') + t, x0 + (i + 0.5) * bw, t > 0 ? y0 - hh - 4 : y0 + hh + 13); x.textAlign = 'left'; }
    });
    x.fillStyle = c.muted; x.fillText('gaps, from the lowest energy to the highest →', x0, h - 6);
    ro.textContent = 'Flux ' + p + '/' + q + ': ' + q + ' bands, ' + (q - 1) + ' gaps' + (q % 2 === 0 ? ' (the middle two bands touch, so the middle gap is closed)' : '') + (q <= 13 ? ' · whole numbers ' + T.map(function (t) { return t < 0 ? '−' + (-t) : String(t); }).join(', ') : ' · for the six widest gaps: 1, 2, 3, −3, −2, −1');
  });
  v.select('Fraction p/q', F.map(function (f, i) { return [String(i), f[0] + '/' + f[1] + (f[1] === 113 ? ' (from pi)' : f[1] === 13 ? ' (golden ratio)' : f[1] === 12 ? ' (the musical fifth)' : '')]; }), '2', function (s) { k = +s; v.redraw(); });
});
