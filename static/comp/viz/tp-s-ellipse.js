/* Our own animation for the 1815 Tripos problem: an elliptic billiard table struck from a focus. */
(window.CompViz = window.CompViz || {})['tp-s-ellipse'] = function (el, api) {
  var T = TP.s, M = Math, a = 2.6, b = 1.6, f = M.sqrt(a * a - b * b), s = 0, k = 0, SC = 100, CX = 320, CY = 165;
  var dirs = [0.9, 2.3, -0.6, 4.0, 1.6];
  function S(p) { return [CX + SC * p[0], CY - SC * p[1]]; }
  function hit(p, d) { // ray from p in direction d meets the ellipse
    var A = d[0] * d[0] / (a * a) + d[1] * d[1] / (b * b), B = 2 * (p[0] * d[0] / (a * a) + p[1] * d[1] / (b * b)), C = p[0] * p[0] / (a * a) + p[1] * p[1] / (b * b) - 1;
    var t = (-B + M.sqrt(B * B - 4 * A * C)) / (2 * A); return [p[0] + t * d[0], p[1] + t * d[1]];
  }
  function path() { var p = [f, 0], d = [M.cos(dirs[k]), M.sin(dirs[k])], out = [p]; for (var i = 0; i < 2; i++) { var q = hit(p, d), n = [q[0] / (a * a), q[1] / (b * b)], nn = M.hypot(n[0], n[1]); n = [n[0] / nn, n[1] / nn]; var dd = d[0] * n[0] + d[1] * n[1]; d = [d[0] - 2 * dd * n[0], d[1] - 2 * dd * n[1]]; out.push(q); p = q; } var e = [f, 0]; out.push(e); return out; }
  function len(P) { var L = 0; for (var i = 1; i < P.length; i++) L += M.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; }
  TP.run(el, api, {
    H: 330, aria: 'A ball struck from one focus of an elliptic table bounces through the other focus and comes back to where it started after two bounces, whatever the direction.',
    reset: function () { s = 0; }, advance: function (dt) { s += dt * 2.4; var P = path(); if (s >= len(P)) { s = 0; k++; if (k >= dirs.length) { k = dirs.length - 1; s = len(P); return false; } } },
    final: function () { k = 0; s = len(path()); }, done: function () { return k >= dirs.length - 1 && s >= len(path()); },
    draw: function (c, L) {
      var o = '<ellipse cx="' + CX + '" cy="' + CY + '" rx="' + SC * a + '" ry="' + SC * b + '" fill="' + c.greenSoft + '" stroke="' + c.ink + '" stroke-width="4"/>';
      var P = path(), pts = [S(P[0])], left = s, cur = P[0];
      for (var i = 1; i < P.length && left > 0; i++) { var d = M.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]), r = M.min(1, left / d); cur = [P[i - 1][0] + r * (P[i][0] - P[i - 1][0]), P[i - 1][1] + r * (P[i][1] - P[i - 1][1])]; pts.push(S(cur)); left -= d; }
      o += T.pa(T.poly(pts), c.red, 2.5); var q = S(cur); o += T.ci(q[0], q[1], 8, c.panel, c.red, 3);
      var s1 = S([f, 0]), h1 = S([-f, 0]); o += T.ci(s1[0], s1[1], 5, c.gold) + T.ci(h1[0], h1[1], 5, c.gold);
      L('S', s1[0], s1[1] + 18, 'S', c.gold); L('H', h1[0], h1[1] + 18, 'H', c.gold);
      return o;
    },
    cap: function () { return 'Shot ' + (k + 1) + ' of ' + dirs.length + ': struck from the focus S, the ball passes through the other focus H and returns to S after two bounces.'; }
  });
};
