/* Our own animation for the 1807 Tripos problem: two one-pound weights and a one-ounce rider. */
(window.CompViz = window.CompViz || {})['tp-s-atwood'] = function (el, api) {
  var T = TP.s, M = Math, g = 32.2, a = g / 33, t = 0, tf = M.sqrt(24 / a);
  TP.run(el, api, {
    H: 330, aria: 'An Atwood machine: equal weights over a pulley, with a small rider on one side. The heavier side sinks slowly, 12 feet in about 5 seconds.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt; if (t >= tf) { t = tf; return false; } }, final: function () { t = tf; }, done: function () { return t >= tf; },
    draw: function (c, L) {
      var s = a * t * t / 2, px = 200, R = 30, y0 = 190, k = 8, o = "";
      o += T.ln(px, 10, px, 40, c.muted, 3) + T.ci(px, 40 + R, R, c.panel, c.ink, 3);
      var yP = y0 + k * s, yQ = y0 - k * s;
      o += T.ln(px - R, 40 + R, px - R, yP, c.ink, 1.5) + T.ln(px + R, 40 + R, px + R, yQ, c.ink, 1.5);
      o += T.rc(px - R - 16, yP, 32, 34, c.blue) + T.rc(px - R - 8, yP - 8, 16, 8, c.red) + T.rc(px + R - 16, yQ, 32, 34, c.green);
      o += T.ln(px - R - 30, y0 + k * 12 + 34, px - R + 30, y0 + k * 12 + 34, c.muted, 1, '4 3');
      L('P', px - R - 50, yP + 17, 'P', c.blue); L('Q', px + R + 50, yQ + 17, 'Q', c.green);
      L('a', 460, 70, 'a = \\dfrac{g}{33}', c.ink); L('t', 460, 140, 't = ' + t.toFixed(2) + '\\text{ s}', c.ink);
      L('s', 460, 180, '\\text{fallen } ' + s.toFixed(2) + '\\text{ ft}', c.ink); L('v', 460, 220, 'v = ' + (a * t).toFixed(2) + '\\text{ ft/s}', c.ink);
      return o;
    },
    cap: function () { return 'The one-ounce rider (red) pulls 33 ounces in all, so everything moves at one thirty-third of free fall. The dashed line is 12 feet down (not to scale).'; }
  });
};
