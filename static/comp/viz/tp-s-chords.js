/* Our own animation for the 1860 Tripos problem 12: chords from one end of a diameter, all taking the same time. */
(window.CompViz = window.CompViz || {})['tp-s-chords'] = function (el, api) {
  var T = TP.s, M = Math, R = 130, CX = 300, CY = 160, o_ = 0.4, k = 1, t = 0, angs = [0.5, 1.2, 1.9, 2.6, -0.9, -2.0];
  var D = [-1, 0], O = [o_, 0], tEnd = M.acos(-(1 - o_) / (1 + o_)) / k;
  function S(p) { return [CX + R * p[0], CY - R * p[1]]; }
  function pos(an, tt) {
    var A = [M.cos(an), M.sin(an)], d = [A[0] - D[0], A[1] - D[1]], Lc = M.hypot(d[0], d[1]), u = [d[0] / Lc, d[1] / Lc];
    var sN = (O[0] - D[0]) * u[0] + (O[1] - D[1]) * u[1], x = -sN * M.cos(k * tt); // distance from N along u, start at D
    return [D[0] + (sN + x) * u[0], D[1] + (sN + x) * u[1]];
  }
  TP.run(el, api, {
    H: 320, aria: 'Beads start together at one end of a diameter and slide along different chords, pulled toward a point O by a force proportional to distance. They all reach the circle at the same moment.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt * 0.5; if (t >= tEnd) { t = tEnd; return false; } }, final: function () { t = tEnd; }, done: function () { return t >= tEnd; },
    draw: function (c, L) {
      var o = T.ci(CX, CY, R, 'none', c.ink, 2.5), d = S(D), e = S([1, 0]), oo = S(O), cols = [c.red, c.blue, c.green, c.purple, c.orange, c.teal];
      o += T.ln(d[0], d[1], e[0], e[1], c.muted, 1, '4 4');
      angs.forEach(function (an, j) { var a = S([M.cos(an), M.sin(an)]), p = S(pos(an, t)); o += T.ln(d[0], d[1], a[0], a[1], cols[j], 1.5) + T.ci(p[0], p[1], 6, cols[j]); });
      o += T.ci(oo[0], oo[1], 6, c.gold) + T.ci(d[0], d[1], 4, c.ink);
      L('O', oo[0], oo[1] + 16, 'O', c.gold); L('D', d[0] - 12, d[1], 'D', c.ink, 'r');
      L('f', 540, 40, 't = \\tfrac1k\\cos^{-1}\\!\\left(-\\tfrac{OE}{DO}\\right)', c.ink);
      return o;
    },
    cap: function () { return t >= tEnd ? 'All the beads reach the circle together.' : 'Each bead does simple harmonic motion along its own chord, with the same period.'; }
  });
};
