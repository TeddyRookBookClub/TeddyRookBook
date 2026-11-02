/* Our own animation for the 1860 Tripos problem xv: a light ray in a medium whose index is inversely as the distance from a plane. */
(window.CompViz = window.CompViz || {})['tp-s-ray'] = function (el, api) {
  var T = TP.s, M = Math, s = 0, x0 = 3, R = 2.4, SC = 90, BX = 20, BY = 290, th0 = 0.35;
  function S(x, y) { return [BX + SC * x, BY - SC * y]; }
  TP.run(el, api, {
    H: 310, aria: 'The medium is denser near the bottom plane. A ray of light curves along a circular arc whose center lies on that plane.',
    reset: function () { s = 0; }, advance: function (dt) { s += dt * 0.5; if (s >= M.PI - 2 * th0) { s = M.PI - 2 * th0; return false; } }, final: function () { s = M.PI - 2 * th0; }, done: function () { return s >= M.PI - 2 * th0; },
    draw: function (c, L) {
      var o = '';
      for (var i = 0; i < 12; i++) o += T.rc(0, BY - SC * 0.25 * (i + 1), 640, SC * 0.25, c.blue, 0).replace('fill="' + c.blue + '"', 'fill="' + c.blue + '" fill-opacity="' + (0.35 / (i + 1)).toFixed(3) + '"');
      o += T.ln(0, BY, 640, BY, c.ink, 3);
      var pts = []; for (i = 0; i <= 60; i++) { var a = M.PI - th0 - s * i / 60; pts.push(S(x0 + R * M.cos(a), R * M.sin(a))); }
      o += T.pa(T.poly(pts), c.gold, 3);
      var full = []; for (i = 0; i <= 60; i++) { a = th0 + (M.PI - 2 * th0) * i / 60; full.push(S(x0 + R * M.cos(a), R * M.sin(a))); }
      o += T.pa(T.poly(full), c.muted, 1, null, '3 4');
      var cc = S(x0, 0); o += T.ci(cc[0], cc[1], 5, c.red);
      L('c', cc[0], cc[1] + 14, '\\text{center on the plane}', c.red); L('f', 520, 40, '\\mu = \\dfrac{c}{y},\\quad \\mu\\cos\\theta = \\text{const}', c.ink);
      return o;
    },
    cap: function () { return 'Shading shows the refractive index, highest near the plane. Snell\'s law layer by layer bends the ray along a circle centered on the plane.'; }
  });
};
