/* Our own animation for the 1827 Tripos problem: a parabola rolling on an equal parabola. */
(window.CompViz = window.CompViz || {})['tp-s-rolling-parabola'] = function (el, api) {
  var T = TP.s, M = Math, a = 1, u = 0, dir = 1, SC = 42, CX = 300, CY = 165;
  function S(p) { return [CX + SC * p[0], CY - SC * p[1]]; }
  function refl(p, t) { var d = p[0] - t * p[1] + a * t * t, n = 1 + t * t; return [p[0] - 2 * d / n, p[1] + 2 * d * t / n]; }
  TP.run(el, api, {
    H: 330, aria: 'A parabola rolls on a fixed equal parabola. Its focus slides along the fixed directrix, and its vertex traces a cissoid curve with a cusp.',
    reset: function () { u = 0; dir = 1; }, advance: function (dt) { u += dir * dt * 0.5; if (u > 1.6) dir = -1; if (u < -1.6) dir = 1; },
    final: function () { u = 1.1; }, done: function () { return false; },
    draw: function (c, L) {
      var o = '', i, fx = [], rv = [], tr = [];
      for (i = -40; i <= 40; i++) { var s = i / 40 * 2.4; fx.push(S([a * s * s, 2 * a * s])); }
      o += T.ln(CX - SC * a, 0, CX - SC * a, 330, c.gold, 1.5, '6 4') + T.pa(T.poly(fx), c.ink, 3);
      for (i = -40; i <= 40; i++) { s = i / 40 * 2.4; rv.push(S(refl([a * s * s, 2 * a * s], u))); }
      o += T.pa(T.poly(rv), c.blue, 2.5);
      for (i = 0; i <= 60; i++) { var tt = -1.6 + 3.2 * i / 60; tr.push(S(refl([0, 0], tt))); }
      o += T.pa(T.poly(tr), c.red, 1.5, null, '3 3');
      var F = S(refl([a, 0], u)), V = S(refl([0, 0], u)), P = S([a * u * u, 2 * a * u]);
      o += T.ci(P[0], P[1], 5, c.ink) + T.ci(F[0], F[1], 7, c.gold) + T.ci(V[0], V[1], 7, c.red);
      L('d', CX - SC * a - 8, 20, '\\text{directrix}', c.gold, 'r'); L('c', 120, 300, '\\text{cissoid } y^2(2a + x) = -x^3', c.red, 'l');
      return o;
    },
    cap: function () { return 'Blue: the rolling parabola, the mirror image of the black one in their common tangent. Gold: its focus, on the directrix. Red: its vertex, tracing the cissoid.'; }
  });
};
