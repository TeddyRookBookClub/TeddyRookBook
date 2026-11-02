/* Our own animation for the 1854 Tripos problem 11: one bounce on an inclined plane and back to the start. */
(window.CompViz = window.CompViz || {})['tp-1854-11'] = function (el, api) {
  var T = TP.s, M = Math, al = 0.42, e = 0.6, g = 9.8, u = 7, t = 0;
  function be() { return M.atan(1 / ((1 + e) * M.tan(al))); }
  function pos(tt) { // along (x) and across (y) the plane
    var b = be(), k = 2 * u * M.sin(b) / (g * M.cos(al)), gx = g * M.sin(al), gy = g * M.cos(al);
    var x = u * M.cos(b) * tt - 0.5 * gx * tt * tt, y;
    if (tt <= k) y = u * M.sin(b) * tt - 0.5 * gy * tt * tt; else { var s = tt - k; y = e * u * M.sin(b) * s - 0.5 * gy * s * s; }
    return [x, M.max(0, y)];
  }
  function total() { return (1 + e) * 2 * u * M.sin(be()) / (g * M.cos(al)); }
  var O = [90, 280], SC = 75;
  function scr(p) { var ca = M.cos(al), sa = M.sin(al); return [O[0] + SC * (p[0] * ca - p[1] * sa), O[1] - SC * (p[0] * sa + p[1] * ca)]; }
  TP.run(el, api, {
    H: 320, aria: 'A ball thrown up an inclined plane bounces once and lands back at its starting point. The angles satisfy cot alpha cot beta = 1 + e.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt * 0.6; if (t >= total()) { t = total(); return false; } },
    final: function () { t = total(); }, done: function () { return t >= total(); },
    sliders: [{ label: 'e', min: 0.2, max: 1, step: 0.05, value: e, set: function (v) { e = v; t = 0; } }],
    draw: function (c, L) {
      var o = '', end = scr([7, 0]); o += T.pa('M' + O[0] + ' ' + O[1] + 'L' + end[0].toFixed(1) + ' ' + end[1].toFixed(1) + 'L' + end[0].toFixed(1) + ' ' + O[1] + 'Z', c.muted, 1.5, c.greenSoft);
      var pts = [], TT = total(); for (var i = 0; i <= 120; i++) pts.push(scr(pos(TT * i / 120)));
      o += T.pa(T.poly(pts), c.blue, 1.5, null, '5 4');
      var tr = []; for (i = 0; i <= 80; i++) tr.push(scr(pos(t * i / 80)));
      o += T.pa(T.poly(tr), c.blue, 2.5); var p = scr(pos(t)); o += T.ci(p[0], p[1], 7, c.red);
      o += T.ci(O[0], O[1], 4, c.ink);
      L('a', O[0] + 70, O[1] - 12, '\\alpha', c.ink); L('f', 470, 40, '\\cot\\alpha\\,\\cot\\beta = 1 + e = ' + (1 + e).toFixed(2), c.ink);
      L('b', 470, 72, '\\beta = ' + (be() * 180 / M.PI).toFixed(1) + '^\\circ', c.blue);
      return o;
    },
    cap: function () { return 'Elasticity e = ' + e.toFixed(2) + '. Thrown at the angle β from the formula, the ball bounces once and returns to the point it was thrown from.'; }
  });
};
