/* Our own animation for the 1860 Tripos problem 16: a bead on a circular wire, pulled by an inverse-fifth-power force. */
(window.CompViz = window.CompViz || {})['tp-s-bead'] = function (el, api) {
  var T = TP.s, M = Math, a = 1, mu = 0.6, E = 1.2, phi, t = 0, R = 120, CX = 300, CY = 160;
  // the bead is at angle phi on the circle (center C = origin); O is the point at angle pi
  function rOP(p) { return 2 * a * M.cos(p / 2); }
  function speed(p) { var r = rOP(p); return M.sqrt(2 * E + mu / (2 * M.pow(r, 4))); }
  TP.run(el, api, {
    H: 320, split: 470, aria: 'A bead slides round a circular wire, attracted to a point on the wire with a force that grows as the inverse fifth power of distance. It speeds up near that point, yet the push on the wire stays the same.',
    reset: function () { phi = -2.6; t = 0; }, advance: function (dt) { phi += dt * speed(phi) / a * 0.35; t += dt; if (phi > 2.6) phi = -2.6; if (t > 40) return false; },
    final: function () { phi = 1.2; }, done: function () { return t > 40; },
    draw: function (c, L) {
      var o = T.ci(CX, CY, R, 'none', c.ink, 3), P = [CX + R * M.cos(phi), CY - R * M.sin(phi)], O = [CX - R, CY];
      var r = rOP(phi), F = mu / M.pow(r, 5), N = 2 * E / a, sF = M.min(110, 16 * F), sN = 16 * N;
      var u = [(O[0] - P[0]), (O[1] - P[1])], ul = M.hypot(u[0], u[1]); u = [u[0] / ul, u[1] / ul];
      var w = [(CX - P[0]) / R, (CY - P[1]) / R];
      o += T.arr(P[0], P[1], P[0] + sF * u[0], P[1] + sF * u[1], c.red, 2.5) + T.arr(P[0], P[1], P[0] + sN * w[0], P[1] + sN * w[1], c.green, 2.5);
      o += T.ci(P[0], P[1], 8, c.blue) + T.ci(O[0], O[1], 6, c.gold);
      L('O', O[0] - 12, O[1], 'O', c.gold, 'r'); L('v', 480, 80, 'v = ' + speed(phi).toFixed(2), c.blue, 'l'); L('N', 480, 120, 'N = \\dfrac{2E}{a} = ' + N.toFixed(2), c.green, 'l'); L('F', 480, 160, '\\text{pull} = ' + F.toFixed(2), c.red, 'l');
      return o;
    },
    cap: function () { return 'Red: the pull towards O, which grows fast near O. Green: the push of the wire, which never changes.'; }
  });
};
