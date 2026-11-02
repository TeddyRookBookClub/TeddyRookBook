/* Our own animation for the 1829 Tripos problem: a ball rolls down a roof and flies off the eaves. */
(window.CompViz = window.CompViz || {})['tp-s-roof'] = function (el, api) {
  var T = TP.s, M = Math, g = 32, Hr = 40, h = 30, th = M.PI / 6, t = 0;
  var aR = 5 / 14 * g, Lr = 2 * (Hr - h), t1 = M.sqrt(2 * Lr / aR), v = aR * t1, t2 = (M.sqrt(v * v / 4 + 2 * g * h) - v / 2) / g;
  var SC = 6.5, O = [60, 300], ex = (Hr - h) / M.tan(th);
  function S(x, y) { return [O[0] + SC * x, O[1] - SC * y]; }
  function pos(tt) { if (tt <= t1) { var s = aR * tt * tt / 2; return [s * M.cos(th), Hr - s * M.sin(th)]; } var q = tt - t1; return [ex + v * M.cos(th) * q, h - v * M.sin(th) * q - g * q * q / 2]; }
  TP.run(el, api, {
    H: 330, aria: 'A small ball rolls from the ridge of a roof down to the eaves, then flies off in a parabola to the ground.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt * 0.6; if (t >= t1 + t2) { t = t1 + t2; return false; } }, final: function () { t = t1 + t2; }, done: function () { return t >= t1 + t2; },
    draw: function (c, L) {
      var o = T.ln(0, O[1], 640, O[1], c.axis, 2), r = S(0, Hr), e = S(ex, h), w = S(ex - 2, 0);
      o += T.pa(T.poly([S(-6, 0), S(-6, h), S(0, Hr), e, S(ex - 2, h), w]), c.ink, 2, c.goldSoft);
      var pts = []; for (var i = 0; i <= 80; i++) pts.push(S.apply(null, pos(M.min(t, (t1 + t2) * i / 80))));
      o += T.pa(T.poly(pts), c.blue, 1.5, null, '4 4'); var p = S.apply(null, pos(t)); o += T.ci(p[0], p[1] - 5, 6, c.red);
      L('H', r[0] - 12, r[1], 'H', c.ink, 'r'); L('h', e[0] + 10, e[1] - 12, 'h', c.ink, 'l');
      L('f', 450, 50, 'v^2 = \\tfrac{10}{7}g(H - h)', c.ink); L('t', 450, 90, t > t1 ? '\\text{in flight } ' + (t - t1).toFixed(2) + '\\text{ s}' : '\\text{rolling}', c.ink);
      return o;
    },
    cap: function () { return 'H = 40 ft, h = 30 ft: the ball reaches the eaves at about 21.4 ft/s and lands about 1.08 s later, some 19.9 ft out.'; }
  });
};
