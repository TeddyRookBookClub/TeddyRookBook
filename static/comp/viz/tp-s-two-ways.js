/* Our own animation for the 1854 Tripos problem 13 (January 17): the two aims that hit the same mark. */
(window.CompViz = window.CompViz || {})['tp-s-two-ways'] = function (el, api) {
  var T = TP.s, M = Math, v = 12, g = 9.8, R = 9, th = 0.35, t = 0;
  var x = R * M.cos(th), y = R * M.sin(th), kk = g * x * x / (2 * v * v), d = M.sqrt(x * x - 4 * kk * (y + kk));
  var f1 = M.atan((x + d) / (2 * kk)), f2 = M.atan((x - d) / (2 * kk));
  var SC = 40, O = [60, 290];
  function S(px, py) { return [O[0] + SC * px, O[1] - SC * py]; }
  function tf(f) { return x / (v * M.cos(f)); }
  TP.run(el, api, {
    H: 320, aria: 'Two throws at the same speed reach the mark B. The steep one makes the same angle with the vertical as the shallow one makes with the line AB.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt * 0.6; if (t >= tf(f1)) { t = tf(f1); return false; } }, final: function () { t = tf(f1); }, done: function () { return t >= tf(f1); },
    draw: function (c, L) {
      var o = T.ln(0, O[1], 640, O[1], c.axis, 1.5), b = S(x, y);
      o += T.ln(O[0], O[1], b[0], b[1], c.muted, 1.5, '5 4') + T.ln(O[0], O[1], O[0], O[1] - 240, c.muted, 1.5, '5 4');
      [[f1, c.red], [f2, c.blue]].forEach(function (q) {
        var p = [], T1 = tf(q[0]); for (var i = 0; i <= 50; i++) { var s = T1 * i / 50; p.push(S(v * M.cos(q[0]) * s, v * M.sin(q[0]) * s - g * s * s / 2)); }
        o += T.pa(T.poly(p), q[1], 2) + T.arr(O[0], O[1], O[0] + 70 * M.cos(q[0]), O[1] - 70 * M.sin(q[0]), q[1], 2.5);
        var s2 = M.min(t, T1), pp = S(v * M.cos(q[0]) * s2, v * M.sin(q[0]) * s2 - g * s2 * s2 / 2); o += T.ci(pp[0], pp[1], 6, q[1]);
      });
      o += T.ci(b[0], b[1], 6, c.gold);
      var a1 = 90 - f1 * 180 / M.PI, a2 = (f2 - th) * 180 / M.PI;
      L('B', b[0] + 12, b[1], 'B', c.gold, 'l'); L('A', O[0] - 10, O[1] + 14, 'A', c.ink, 'r');
      L('r', 470, 40, '\\text{red to vertical: } ' + a1.toFixed(1) + '^\\circ', c.red); L('b', 470, 75, '\\text{blue to } AB\\text{: } ' + a2.toFixed(1) + '^\\circ', c.blue);
      return o;
    },
    cap: function () { return 'The two launch directions are mirror images in the line halfway between the vertical and AB.'; }
  });
};
