/* Our own animation for the 1801 Tripos problem: the gentlest throw from the top of a slope to its foot. */
(window.CompViz = window.CompViz || {})['tp-s-incline'] = function (el, api) {
  var T = TP.s, M = Math, al = 0.5, Lp = 10, g = 9.8, t = 0;
  var phi = M.PI / 4 - al / 2, v = M.sqrt(g * Lp * (1 - M.sin(al))), tf = Lp * M.cos(al) / (v * M.cos(phi));
  var SC = 40, O = [70, 110];
  function S(x, y) { return [O[0] + SC * x, O[1] - SC * y]; }
  function path(ph) { var vv = M.sqrt(g * Lp * M.cos(al) * M.cos(al) / (2 * M.cos(ph) * M.sin(ph + al))), tt = Lp * M.cos(al) / (vv * M.cos(ph)), p = []; for (var i = 0; i <= 50; i++) { var s = tt * i / 50; p.push(S(vv * M.cos(ph) * s, vv * M.sin(ph) * s - g * s * s / 2)); } return [p, vv]; }
  TP.run(el, api, {
    H: 330, aria: 'From the top of a slope, three throws reach the foot. The one aimed halfway between straight up and the slope needs the least speed.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt * 0.8; if (t >= tf) { t = tf; return false; } }, final: function () { t = tf; }, done: function () { return t >= tf; },
    draw: function (c, L) {
      var f = S(Lp * M.cos(al), -Lp * M.sin(al)), o = T.pa('M' + O[0] + ' ' + O[1] + 'L' + f[0].toFixed(1) + ' ' + f[1].toFixed(1) + 'L' + O[0] + ' ' + f[1].toFixed(1) + 'Z', c.muted, 1.5, c.greenSoft);
      [phi - 0.45, phi + 0.45].forEach(function (ph) { var r = path(ph); o += T.pa(T.poly(r[0]), c.muted, 1.5, null, '4 4'); });
      var best = path(phi); o += T.pa(T.poly(best[0]), c.blue, 2.5);
      o += T.ln(O[0], O[1], O[0], O[1] - 60, c.muted, 1, '3 3') + T.arr(O[0], O[1], O[0] + 60 * M.cos(phi), O[1] - 60 * M.sin(phi), c.red, 2.5);
      var p = S(v * M.cos(phi) * t, v * M.sin(phi) * t - g * t * t / 2); o += T.ci(p[0], p[1], 7, c.red);
      L('f', 430, 60, 'v_{\\min}^2 = gL(1 - \\sin\\alpha),\\quad \\phi = 45^\\circ - \\tfrac12\\alpha', c.ink);
      return o;
    },
    cap: function () { return 'The blue path uses the least speed. The dashed paths, aimed higher or lower, need more speed to reach the same point.'; }
  });
};
