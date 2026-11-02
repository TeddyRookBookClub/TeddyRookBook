/* Our own animation for the 1854 Tripos problem 9 (January 18): moving half way to A, B, C in turn. */
(window.CompViz = window.CompViz || {})['tp-s-halfway'] = function (el, api) {
  var T = TP.s, M = Math, A = [90, 290], B = [560, 270], C = [250, 30], P, trail, k, acc = 0;
  var V = [A, B, C], X = [[4, 1, 2], [2, 4, 1], [1, 2, 4]].map(function (w) { return [(w[0] * A[0] + w[1] * B[0] + w[2] * C[0]) / 7, (w[0] * A[1] + w[1] * B[1] + w[2] * C[1]) / 7]; });
  TP.run(el, api, {
    H: 320, aria: 'A point jumps half way to A, then B, then C, over and over. Its path settles onto a small triangle with one seventh of the area of ABC.',
    reset: function () { P = [600, 30]; trail = [P]; k = 0; }, advance: function (dt) { acc += dt; if (acc > 0.5) { acc = 0; var v = V[k % 3]; P = [(P[0] + v[0]) / 2, (P[1] + v[1]) / 2]; trail.push(P); k++; } if (k > 24) return false; },
    step: function () { var v = V[k % 3]; P = [(P[0] + v[0]) / 2, (P[1] + v[1]) / 2]; trail.push(P); k++; }, final: function () { for (var i = 0; i < 24; i++) this.step(); }, done: function () { return k > 24; },
    draw: function (c, L) {
      var o = T.pa(T.poly(V, true), c.ink, 2) + T.pa(T.poly(X, true), c.green, 2, c.greenSoft);
      for (var i = 1; i < trail.length; i++) o += T.ln(trail[i - 1][0], trail[i - 1][1], trail[i][0], trail[i][1], c.red, 1.5);
      o += T.ci(P[0], P[1], 6, c.red);
      L('A', A[0] - 14, A[1], 'A', c.ink, 'r'); L('B', B[0] + 14, B[1], 'B', c.ink, 'l'); L('C', C[0], C[1] - 14, 'C', c.ink);
      L('f', 140, 60, '\\text{green area} = \\tfrac17\\,[ABC]', c.green);
      return o;
    },
    cap: function () { return 'Move ' + k + '. Each move halves the distance to the green triangle\'s path, so any start ends up running round it.'; }
  });
};
