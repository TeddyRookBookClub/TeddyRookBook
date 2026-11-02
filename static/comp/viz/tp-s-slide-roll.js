/* Our own animation for the 1825 Tripos problem: a sliding sphere races a rolling one. */
(window.CompViz = window.CompViz || {})['tp-s-slide-roll'] = function (el, api) {
  var T = TP.s, M = Math, al = 0.35, g = 9.8, Lp = 8, t = 0, aS = g * M.sin(al), aR = aS * 5 / 7, tR = M.sqrt(2 * Lp / aR);
  var SC = 36, r = 0.45;
  TP.run(el, api, {
    H: 300, aria: 'Two spheres start together down equal slopes. The one on the smooth slope slides and wins; the one on the rough slope rolls and takes about 18 percent longer.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt * 0.8; if (t >= tR) { t = tR; return false; } }, final: function () { t = tR; }, done: function () { return t >= tR; },
    draw: function (c, L) {
      var o = '';
      [[20, 80, aS, c.blue, 0, "\\text{smooth: sliding}"], [330, 80, aR, c.red, 1, "\\text{rough: rolling}"]].forEach(function (v) {
        var x0 = v[0], y0 = v[1], acc = v[2], s = M.min(Lp, acc * t * t / 2), ca = M.cos(al), sa = M.sin(al);
        o += T.ln(x0, y0 + SC * 0, x0 + SC * Lp * ca, y0 + SC * Lp * sa, c.ink, 3);
        var cx = x0 + SC * (s * ca + r * sa), cy = y0 + SC * (s * sa - r * ca);
        o += T.ci(cx, cy, SC * r, v[3]);
        if (v[4]) { var ph = s / r; o += T.ln(cx, cy, cx + SC * r * M.cos(ph), cy + SC * r * M.sin(ph), c.panel, 3); }
        else o += T.ln(cx, cy, cx, cy - SC * r, c.panel, 3);
        L("l" + v[4], x0 + 140, y0 - 50, v[5], v[3]);
      });
      L('f', 470, 260, 't_{\\text{slide}} : t_{\\text{roll}} = \\sqrt5 : \\sqrt7', c.ink);
      return o;
    },
    cap: function () { return 'The white stripe shows spin: the sliding sphere does not turn, the rolling one does. Part of its energy goes into spinning, so it accelerates at 5/7 of the sliding rate.'; }
  });
};
