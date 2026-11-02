/* Our own animation for the 1854 Tripos problem 20 (January 17): a bead in a ring that slides on a smooth table. */
(window.CompViz = window.CompViz || {})['tp-s-ring'] = function (el, api) {
  var T = TP.s, M = Math, mu = 3, m = 1, a = 1, g = 9.8, th0 = 0.5, X, Xd, th, thd, t;
  function deriv() { var s = M.sin(th), c = M.cos(th), A11 = mu + m, A12 = m * a * c, b1 = m * a * thd * thd * s, A22 = m * a * a, b2 = -m * g * a * s, det = A11 * A22 - A12 * A12; return [(b1 * A22 - A12 * b2) / det, (A11 * b2 - A12 * b1) / det]; }
  TP.run(el, api, {
    H: 300, aria: 'A heavy ring stands on a smooth table with a bead inside. As the bead swings, the ring slides the other way, and the bead swings faster than it would in a fixed ring.',
    reset: function () { X = 0; Xd = 0; th = th0; thd = 0; t = 0; }, advance: function (dt) { for (var i = 0; i < 20; i++) { var h = dt / 20, d = deriv(); Xd += d[0] * h; thd += d[1] * h; X += Xd * h; th += thd * h; } t += dt; if (t > 30) return false; },
    final: function () { }, done: function () { return t > 30; },
    sliders: [{ label: 'ring mass', min: 0.5, max: 8, step: 0.5, value: mu, set: function (v) { mu = v; X = 0; Xd = 0; th = th0; thd = 0; } }],
    draw: function (c, L) {
      var SC = 110, cx = 230 + SC * X, cy = 140, o = T.ln(0, cy + SC + 6, 640, cy + SC + 6, c.axis, 2);
      o += T.ci(cx, cy, SC, 'none', c.ink, 6) + T.ci(cx + SC * M.sin(th), cy + SC * M.cos(th), 9, c.red);
      L('f', 520, 80, 'L = \\dfrac{\\mu a}{m + \\mu} = ' + (mu * a / (m + mu)).toFixed(2) + 'a', c.ink);
      return o;
    },
    cap: function () { return 'Ring mass μ = ' + mu + ' times the bead\'s. Its period equals that of a simple pendulum of length ' + (mu / (1 + mu)).toFixed(2) + ' times the radius (for small swings).'; }
  });
};
