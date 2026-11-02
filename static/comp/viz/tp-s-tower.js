/* Our own animation for the 1802 Tripos problem: the farthest throw from the top of a tower. */
(window.CompViz = window.CompViz || {})['tp-s-tower'] = function (el, api) {
  var T = TP.s, M = Math, v = 14, h = 15, g = 9.8, k = 0, acc = 0;
  var best = M.atan(v / M.sqrt(v * v + 2 * g * h)), angs = [], i;
  for (i = -6; i <= 6; i++) angs.push(best + i * 0.12);
  var SC = 14, O = [50, 70];
  function S(x, y) { return [O[0] + SC * x, O[1] + SC * (h - y)]; }
  function tr(a) { var vx = v * M.cos(a), vy = v * M.sin(a), tf = (vy + M.sqrt(vy * vy + 2 * g * h)) / g, p = []; for (var j = 0; j <= 40; j++) { var s = tf * j / 40; p.push(S(vx * s, h + vy * s - g * s * s / 2)); } return [p, vx * tf]; }
  TP.run(el, api, {
    H: 320, split: 420, aria: 'From the top of a tower, throws at the same speed land at different distances; the farthest one leaves at an angle below 45 degrees.',
    reset: function () { k = 0; acc = 0; }, advance: function (dt) { acc += dt; if (acc > 0.35) { acc = 0; k++; } if (k >= angs.length) { k = angs.length; return false; } },
    final: function () { k = angs.length; }, done: function () { return k >= angs.length; },
    draw: function (c, L) {
      var o = T.rc(O[0] - 18, O[1], 18, SC * h, c.muted) + T.ln(0, O[1] + SC * h, 640, O[1] + SC * h, c.axis, 2);
      for (var j = 0; j < k; j++) { var r = tr(angs[j]); o += T.pa(T.poly(r[0]), j === 6 ? c.red : c.blue, j === 6 ? 3 : 1.2, null, j === 6 ? null : '3 3'); }
      var rb = tr(best);
      L('f', 470, 50, '\\tan\\theta = \\dfrac{v}{\\sqrt{v^2 + 2gh}}', c.ink, 'l');
      L('r', 470, 100, k > 6 ? 'R_{\\max} = ' + rb[1].toFixed(1) + '\\text{ m at } ' + (best * 180 / M.PI).toFixed(1) + '^\\circ' : '', c.red, 'l');
      return o;
    },
    cap: function () { return 'Same speed, angles a few degrees apart. The red path, at ' + (best * 180 / M.PI).toFixed(1) + '°, lands farthest; on level ground it would be 45°.'; }
  });
};
