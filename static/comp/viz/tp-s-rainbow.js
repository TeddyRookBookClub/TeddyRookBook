/* Our own animation for the 1830 Tripos problem: light through a raindrop and the angle of the primary bow. */
(window.CompViz = window.CompViz || {})['tp-s-rainbow'] = function (el, api) {
  var T = TP.s, M = Math, mu = 1.333, i = 0.2, dir = 1, R = 110, CX = 170, CY = 165;
  function dev(ii) { var r = M.asin(M.sin(ii) / mu); return M.PI + 2 * ii - 4 * r; }
  TP.run(el, api, {
    H: 330, split: 345, aria: 'A ray enters a raindrop, reflects once inside and leaves. As the point of entry changes, the deviation dips to a minimum near 138 degrees, so the bow appears 42 degrees from the point opposite the Sun.',
    reset: function () { i = 0.2; dir = 1; }, advance: function (dt) { i += dir * dt * 0.35; if (i > 1.5) dir = -1; if (i < 0.15) dir = 1; },
    final: function () { i = M.acos(M.sqrt((mu * mu - 1) / 3)); }, done: function () { return false; },
    draw: function (c, L) {
      var o = T.ci(CX, CY, R, c.blueSoft, c.blue, 2), r = M.asin(M.sin(i) / mu);
      var a0 = M.PI - i, p0 = [CX + R * M.cos(a0), CY - R * M.sin(a0)];
      var a1 = a0 - (M.PI - 2 * r), p1 = [CX + R * M.cos(a1), CY - R * M.sin(a1)];
      var a2 = a1 - (M.PI - 2 * r), p2 = [CX + R * M.cos(a2), CY - R * M.sin(a2)];
      o += T.ln(p0[0] - 120, p0[1], p0[0], p0[1], c.gold, 2.5) + T.ln(p0[0], p0[1], p1[0], p1[1], c.gold, 2) + T.ln(p1[0], p1[1], p2[0], p2[1], c.gold, 2);
      var D = dev(i), od = M.PI - D, out = [M.cos(M.PI - od), M.sin(M.PI - od)];
      o += T.arr(p2[0], p2[1], p2[0] - 90 * M.cos(od), p2[1] + 90 * M.sin(od), c.red, 2.5);
      // deviation graph
      var gx = 360, gy = 280, gw = 250, gh = 200, pts = [];
      for (var k = 0; k <= 60; k++) { var ii = 0.02 + 1.53 * k / 60; pts.push([gx + gw * ii / 1.57, gy - gh * (dev(ii) * 180 / M.PI - 135) / 45]); }
      o += T.ln(gx, gy, gx + gw, gy, c.axis, 1.5) + T.pa(T.poly(pts), c.ink, 2) + T.ci(gx + gw * i / 1.57, gy - gh * (D * 180 / M.PI - 135) / 45, 6, c.red);
      L('d', 480, 40, 'D = 180^\\circ + 2i - 4r = ' + (D * 180 / M.PI).toFixed(1) + '^\\circ', c.ink); L('m', 480, 300, '\\text{deviation vs. angle of incidence}', c.muted);
      return o;
    },
    cap: function () { return 'Incidence ' + (i * 180 / M.PI).toFixed(0) + '°. The deviation is least, about 138°, near 59°; light bunches up there, 42° from the point opposite the Sun.'; }
  });
};
