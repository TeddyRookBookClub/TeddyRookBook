/* Our own animation for the 1854 Tripos problem 20: the patch of light from a disk through a rectangular opening. */
(window.CompViz = window.CompViz || {})['tp-1854-20'] = function (el, api) {
  var T = TP.s, M = Math, t = 0, k = 0.8, a = 150, b = 80, r = 45;
  TP.run(el, api, {
    H: 330, aria: 'Seen from above: the opening, and the patch of light on the floor below, a rectangle with rounded corners that slides but keeps its shape as the disk moves across the ceiling.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt; if (t > 12) { t = 12; return false; } }, final: function () { t = 0; }, done: function () { return t >= 12; },
    draw: function (c, L) {
      var dx = 60 * M.sin(t * 0.9), dy = 25 * M.sin(t * 0.6);
      var ox = 120, oy = 170, s = 0.55, o = '';
      // patch: (1+k) rect scaled about origin shifted by -k * disk position
      var px = ox - k * dx * 1.0, py = oy - k * dy, W1 = (1 + k) * a * s, H1 = (1 + k) * b * s, rr = k * r * s;
      o += '<rect x="' + (px - rr).toFixed(1) + '" y="' + (py - rr).toFixed(1) + '" width="' + (W1 + 2 * rr).toFixed(1) + '" height="' + (H1 + 2 * rr).toFixed(1) + '" rx="' + rr.toFixed(1) + '" fill="' + c.goldSoft + '" stroke="' + c.gold + '" stroke-width="2"/>';
      o += T.rc(ox, oy, a * s, b * s, 'none', c.ink, 2);
      o += T.ci(470 + dx, 120 + dy, r * 0.6, c.goldSoft, c.gold, 2) + T.rc(390, 60, 160, 120, 'none', c.muted, 1);
      L('o', ox + a * s / 2, oy + b * s / 2, '\\text{opening}', c.ink); L('d', 470, 205, '\\text{disk on the ceiling}', c.muted);
      L('f', 320, 300, '\\text{area} = (1+k)^2ab + 2kr(1+k)(a+b) + \\pi k^2r^2', c.ink);
      return o;
    },
    cap: function () { return 'As the disk moves across the ceiling (right), the bright patch on the floor below (left, gold) slides the other way but keeps its shape and size.'; }
  });
};
