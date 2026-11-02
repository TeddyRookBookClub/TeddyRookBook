/* Our own animation for the 1878 Tripos problem 13: a moving platform keeps a projectile in its telescope. */
(window.CompViz = window.CompViz || {})['tp-1878-13'] = function (el, api) {
  var T = TP.s, M = Math, V = 20, be = 1.1, al = 0.8, g = 9.8, t = 0, tf = 2 * V * M.sin(be) / g;
  var SC = 12, O = [60, 270];
  function S(x, y) { return [O[0] + SC * x, O[1] - SC * y]; }
  TP.run(el, api, {
    H: 300, aria: 'A particle flies in a parabola while a platform below moves along the ground so that its telescope, fixed at one angle, always points at the particle.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt * 0.7; if (t >= tf) { t = tf; return false; } }, final: function () { t = tf * 0.6; }, done: function () { return t >= tf; },
    draw: function (c, L) {
      var o = T.ln(0, O[1], 640, O[1], c.axis, 2), pts = [];
      for (var i = 0; i <= 60; i++) { var s = tf * i / 60; pts.push(S(V * M.cos(be) * s, V * M.sin(be) * s - g * s * s / 2)); }
      o += T.pa(T.poly(pts), c.blue, 1.5, null, '5 4');
      var x = V * M.cos(be) * t, y = V * M.sin(be) * t - g * t * t / 2, X = x - y / M.tan(al), p = S(x, y), q = S(X, 0);
      o += T.ln(q[0], q[1], p[0], p[1], c.gold, 2, '6 4') + T.rc(q[0] - 26, q[1] - 8, 52, 8, c.green) + T.ln(q[0], q[1] - 8, q[0] + 26 * M.cos(al), q[1] - 8 - 26 * M.sin(al), c.ink, 5);
      o += T.ci(p[0], p[1], 7, c.red);
      L('f', 450, 40, '\\dot X(0) = V\\,\\dfrac{\\sin(\\alpha-\\beta)}{\\sin\\alpha},\\quad \\ddot X = g\\cot\\alpha', c.ink);
      L('a', q[0] + 34, q[1] - 22, '\\alpha', c.ink, 'l');
      return o;
    },
    cap: function () { return 'The gold line is the telescope\'s line of sight, always at the same elevation. The platform starts slowly backwards here (β > α) and speeds up steadily.'; }
  });
};
