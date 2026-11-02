/* Our own animation for the 1830 Tripos problem: the images of an object between two mirrors. */
(window.CompViz = window.CompViz || {})['tp-s-mirrors'] = function (el, api) {
  var T = TP.s, M = Math, opts = [90, 72, 60, 50, 45], oi = 2, ph = 0.35, k = 99, R = 120, CX = 320, CY = 165;
  function imgs(th) {
    var out = [];
    [0, 1].forEach(function (first) { var ang = ph * th, mir = first, n = 0; for (; ;) { var front = mir === 0 ? M.sin(ang) > 1e-9 : M.sin(th - ang) > 1e-9; if (!front) break; ang = mir === 0 ? -ang : 2 * th - ang; n++; out.push([ang, first, n]); mir = 1 - mir; } });
    return out;
  }
  function P(a) { return [CX + R * M.cos(a), CY - R * M.sin(a)]; }
  TP.run(el, api, {
    H: 330, aria: 'Two mirrors meet at an angle. The images of an object lie on a circle around the hinge; the count depends on the angle.',
    buttons: [['Change angle', function () { oi = (oi + 1) % opts.length; }], ['Move object', function () { ph = ph > 0.45 ? 0.2 : ph + 0.15; }]],
    draw: function (c, L) {
      var th = opts[oi] * M.PI / 180, o = T.ci(CX, CY, R, 'none', c.grid, 1.5, '4 4'), list = imgs(th), seen = {}, n = 0;
      o += T.ln(CX, CY, CX + 180, CY, c.ink, 4) + T.ln(CX, CY, CX + 180 * M.cos(th), CY - 180 * M.sin(th), c.ink, 4);
      list.forEach(function (im) { var key = ((im[0] % (2 * M.PI)) + 2 * M.PI) % (2 * M.PI); key = key.toFixed(5); if (seen[key]) return; seen[key] = 1; n++; var p = P(im[0]); o += T.ci(p[0], p[1], 8, im[1] ? c.blueSoft : c.redSoft, im[1] ? c.blue : c.red, 2); });
      var q = P(ph * th); o += T.ci(q[0], q[1], 9, c.gold);
      L('a', 520, 60, '\\theta = ' + opts[oi] + '^\\circ', c.ink); L('n', 520, 100, n + '\\text{ images}', c.ink);
      return o;
    },
    cap: function () { return 'Gold: the object. Red images start with a reflection in the lower mirror, blue ones in the upper. All lie on one circle about the hinge.'; }
  });
};
