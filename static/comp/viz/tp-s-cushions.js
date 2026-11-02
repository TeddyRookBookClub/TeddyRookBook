/* Our own animation for the 1811 Tripos problem: a two-cushion shot, aimed at the point opposite B through the corner. */
(window.CompViz = window.CompViz || {})['tp-s-cushions'] = function (el, api) {
  var T = TP.s, M = Math, A = [3.6, 1.2], B = [1.4, 2.8], s = 0, SC = 40, O = [250, 150];
  function S(p) { return [O[0] + SC * p[0], O[1] - SC * p[1]]; }
  var d0 = [-B[0] - A[0], -B[1] - A[1]], Ld = M.hypot(d0[0], d0[1]), u = [d0[0] / Ld, d0[1] / Ld];
  function at(len) { // straight line in the unfolded plane, folded back by |x|, |y|
    return [M.abs(A[0] + u[0] * len), M.abs(A[1] + u[1] * len)];
  }
  TP.run(el, api, {
    H: 330, aria: 'A billiard ball bounces off two cushions meeting at a corner and hits the other ball. It was aimed at the point opposite the target through the corner.',
    reset: function () { s = 0; }, advance: function (dt) { s += dt * 2.2; if (s >= Ld) { s = Ld; return false; } }, final: function () { s = Ld; }, done: function () { return s >= Ld; },
    draw: function (c, L) {
      var o = T.rc(O[0], O[1] - SC * 3.4, SC * 6.5, SC * 3.4, c.greenSoft) + T.ln(O[0], O[1], O[0] + SC * 6.5, O[1], c.ink, 4) + T.ln(O[0], O[1], O[0], O[1] - SC * 3.4, c.ink, 4);
      var bs = S([-B[0], -B[1]]), a = S(A), b = S(B);
      o += T.ln(a[0], a[1], bs[0], bs[1], c.muted, 1, '4 4') + T.ci(bs[0], bs[1], 8, 'none', c.muted, 2) + T.ln(b[0], b[1], bs[0], bs[1], c.gold, 1, '2 4');
      var pts = []; for (var i = 0; i <= 80; i++) pts.push(S(at(s * i / 80)));
      o += T.pa(T.poly(pts), c.red, 2.5) + T.ci(b[0], b[1], 9, c.blue);
      var p = S(at(s)); o += T.ci(p[0], p[1], 9, c.panel, c.red, 3) + T.ci(O[0], O[1], 4, c.gold);
      L('A', a[0] + 14, a[1] - 14, 'A', c.red, 'l'); L('B', b[0] + 14, b[1] - 14, 'B', c.blue, 'l'); L('s', bs[0] + 14, bs[1], 'B^{*}', c.muted, 'l'); L('O', O[0] - 14, O[1] + 14, 'O', c.gold, 'r');
      return o;
    },
    cap: function () { return 'Aim A straight at B*, the point opposite B through the corner O. After two bounces the ball runs into B, travelling exactly opposite to its first direction.'; }
  });
};
