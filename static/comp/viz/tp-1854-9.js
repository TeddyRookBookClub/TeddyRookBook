/* Our own animation for the 1854 Tripos problem 9: a bent wire hung from A, then from B. */
(window.CompViz = window.CompViz || {})['tp-1854-9'] = function (el, api) {
  var T = TP.s, M = Math, t = 0;
  var P = { A: [0, 1], B: [0, 0], C: [1, 0], D: [1, 1] }, G = [0.5, 1 / 3];
  function hang(pk, cx, cy, sw, c, L, tag) {
    var p = P[pk], gx = G[0] - p[0], gy = G[1] - p[1];
    var rest = -M.PI / 2 - M.atan2(gy, gx), a = rest + sw, s = 110, ca = M.cos(a), sa = M.sin(a);
    function S(q) { var x = q[0] - p[0], y = q[1] - p[1]; return [cx + s * (x * ca - y * sa), cy - s * (x * sa + y * ca)]; }
    var a1 = S(P.A), b = S(P.B), cc = S(P.C), d = S(P.D), g = S(G), o = '';
    o += T.ln(cx - 40, cy, cx + 40, cy, c.muted, 3) + T.pa(T.poly([a1, b, cc, d]), c.ink, 4);
    o += T.ln(b[0], b[1], cc[0], cc[1], c.red, 6) + T.ln(cx, cy, cx, cy + 190, c.muted, 1, '4 4') + T.ci(g[0], g[1], 5, c.gold) + T.ci(cx, cy, 5, c.green);
    L(tag + 'p', cx, cy - 16, pk, c.green); L(tag + 'g', g[0] + 14, g[1], 'G', c.gold, 'l');
    return [M.atan2(cc[1] - b[1], cc[0] - b[0]), o];
  }
  TP.run(el, api, {
    H: 330, aria: 'Three sides of a square hang first from corner A, then from corner B. The red side BC turns through an angle whose tangent is 18.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt; if (t > 6) { t = 6; return false; } },
    final: function () { t = 6; }, done: function () { return t >= 6; },
    draw: function (c, L) {
      var sw = 0.7 * M.exp(-0.8 * t) * M.cos(3 * t);
      var h1 = hang('A', 170, 50, sw, c, L, 'a'), h2 = hang('B', 470, 50, -sw, c, L, 'b');
      L('f', 320, 305, t >= 6 ? '\\text{angle between the red sides} = \\tan^{-1}18 \\approx 86.8^\\circ' : '\\text{swinging}\\ldots', c.ink);
      return h1[1] + h2[1];
    },
    cap: function () { return t >= 6 ? 'At rest, the center of gravity G hangs straight below the support. The red side BC has turned through about 86.8°.' : 'Each wire swings and settles with G below the point it hangs from.'; }
  });
};
