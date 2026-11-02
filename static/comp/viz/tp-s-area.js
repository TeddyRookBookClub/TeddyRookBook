/* Our own animation for the 1806 Tripos problem: the launch angle whose arch encloses the most area. */
(window.CompViz = window.CompViz || {})['tp-s-area'] = function (el, api) {
  var T = TP.s, M = Math, th = 0.3, dir = 1;
  var X0 = 40, Y0 = 270, SC = 260;
  function area(a) { return M.pow(M.sin(a), 3) * M.cos(a); }
  TP.run(el, api, {
    H: 300, split: 360, aria: 'As the launch angle changes, the shaded area under the arch grows and then shrinks. It is largest at 60 degrees.',
    reset: function () { th = 0.3; dir = 1; }, advance: function (dt) { th += dir * dt * 0.35; if (th > 1.45) dir = -1; if (th < 0.3 && dir < 0) { th = M.PI / 3; return false; } },
    final: function () { th = M.PI / 3; }, done: function () { return false; },
    draw: function (c, L) {
      var o = T.ln(X0, Y0, 350, Y0, c.axis, 2), p = [[X0, Y0]];
      for (var i = 0; i <= 50; i++) { var x = i / 50 * M.sin(2 * th); p.push([X0 + SC * x, Y0 - SC * (x * M.tan(th) - x * x / (2 * M.cos(th) * M.cos(th)))]); }
      o += T.pa(T.poly(p, true), c.blue, 2, c.blueSoft);
      // graph of area against angle
      var gx = 400, gy = 250, gw = 220, gh = 150, q = [];
      for (i = 0; i <= 60; i++) { var a = i / 60 * M.PI / 2; q.push([gx + gw * a / (M.PI / 2), gy - gh * area(a) / 0.33]); }
      o += T.ln(gx, gy, gx + gw, gy, c.axis, 1.5) + T.pa(T.poly(q), c.ink, 2) + T.ln(gx + gw * (2 / 3), gy, gx + gw * (2 / 3), gy - gh, c.green, 1, '4 4');
      o += T.ci(gx + gw * th / (M.PI / 2), gy - gh * area(th) / 0.33, 6, c.red);
      L('a', 200, 40, '\\theta = ' + (th * 180 / M.PI).toFixed(0) + '^\\circ', c.ink); L('g', gx + gw * 2 / 3, gy + 16, '60^\\circ', c.green);
      L('f', 510, 70, 'A \\propto \\sin^3\\theta\\cos\\theta', c.ink);
      return o;
    },
    cap: function () { return 'Launch angle ' + (th * 180 / M.PI).toFixed(0) + '°. Right: the area under the arch for every angle; the peak is at 60°.'; }
  });
};
