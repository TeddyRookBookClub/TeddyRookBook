/* Math ∩ Patterns ∩ Physics: the standard map (kicked rotor): p' = p + (K/2π) sin(2πx), x' = x + p' (mod 1).
   Curves with hard-to-approximate winding numbers survive longest; the golden one breaks near K = 0.9716. Our own drawing. */
Cx.viz('ph-kam', function (v) {
  var K = 0.5, NO = 34, NI = 420;
  var cv = v.canvas({ aspect: 0.72, max: 460, min: 300, label: 'Position against speed for a kicked wheel. Smooth curves are regular motion; scattered dots are chaos.' });
  var ro = v.readout();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, o, i, cols = [c.blue, c.red, c.green, c.purple, c.orange, c.teal, c.gold, c.music];
    cv.clear(c.bg);
    for (o = 0; o < NO; o++) {
      var X = 0.31 + 0.013 * o, P = o / (NO - 1), golden = false;
      if (o === NO - 1) { X = 0.5; P = 0.6180339887; golden = true; }
      x.fillStyle = golden ? c.ink : c.a(cols[o % cols.length], 0.85);
      for (i = 0; i < NI * (golden ? 3 : 1); i++) {
        P = P + K / (2 * Math.PI) * Math.sin(2 * Math.PI * X); X = X + P; X -= Math.floor(X); var pp = P - Math.floor(P);
        x.fillRect(X * w, (1 - pp) * h, golden ? 1.8 : 1.3, golden ? 1.8 : 1.3);
      }
    }
    x.fillStyle = c.muted; x.font = '11px system-ui,sans-serif'; x.fillText('position →', w - 70, h - 6); x.save(); x.translate(12, 70); x.rotate(-Math.PI / 2); x.fillText('speed →', 0, 0); x.restore();
    ro.textContent = 'Kick strength K = ' + K.toFixed(2) + (K < 0.9716 ? ' · the black curve (golden ratio) still spans the picture' : ' · past 0.97 the golden curve has broken, and chaos can cross from bottom to top');
  });
  var sl = v.slider('Kick strength', 0, 2.5, 0.01, 0.5, function (q) { K = q; v.redraw(); }, { fmt: function (q) { return q.toFixed(2); } });
  v.button('No kick', function () { set(0); }); v.button('Just before the last curve breaks', function () { set(0.95); }); v.button('Chaos', function () { set(1.6); });
  function set(q) { K = q; sl.value = q; sl.show(); v.redraw(); }
});
