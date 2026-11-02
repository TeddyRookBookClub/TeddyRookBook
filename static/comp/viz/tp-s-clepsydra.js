/* Our own animation for the 1821 Tripos problem: a water clock shaped so that the level falls at a steady rate. */
(window.CompViz = window.CompViz || {})['tp-s-clepsydra'] = function (el, api) {
  var T = TP.s, M = Math, t = 0, H = 1, Tend = 10;
  function prof(x, k) { return k === 0 ? 70 * M.pow(x, 0.25) : 55; } // half-width at height x (0..1)
  function level(k) { if (k === 0) return M.max(0, 1 - t / Tend); var s = M.sqrt(1) - t / Tend * 1; return M.max(0, s * s); } // quartic: linear; cylinder: (1 - t/T)^2 (same total time)
  TP.run(el, api, {
    H: 330, aria: 'Two water clocks drain through a hole at the bottom. In the quartic-shaped bowl the level falls evenly past equal marks; in the plain cylinder it falls fast at first and slowly at the end.',
    reset: function () { t = 0; }, advance: function (dt) { t += dt; if (t >= Tend) { t = Tend; return false; } }, final: function () { t = 4; }, done: function () { return t >= Tend; },
    draw: function (c, L) {
      var o = '', Y0 = 290, HH = 240;
      [[180, 0, 'y^4 = ax'], [460, 1, '\\text{cylinder}']].forEach(function (v) {
        var cx = v[0], k = v[1], lv = level(k), L1 = [], R1 = [], W = [];
        for (var i = 0; i <= 40; i++) { var x = i / 40, w = prof(x, k); L1.push([cx - w, Y0 - HH * x]); R1.push([cx + w, Y0 - HH * x]); }
        for (i = 0; i <= 40; i++) { var xx = lv * i / 40, ww = prof(xx, k); W.push([cx - ww, Y0 - HH * xx]); }
        for (i = 40; i >= 0; i--) { xx = lv * i / 40; ww = prof(xx, k); W.push([cx + ww, Y0 - HH * xx]); }
        o += T.pa(T.poly(W, true), null, 0, c.blueSoft) + T.pa(T.poly(L1.reverse().concat(R1)), c.ink, 3);
        for (i = 0; i <= 10; i++) { var yy = Y0 - HH * (1 - i / 10); o += T.ln(cx + prof(1, k) + 8, yy, cx + prof(1, k) + 18, yy, c.muted, 1.5); }
        o += T.ln(cx - prof(lv, k), Y0 - HH * lv, cx + prof(lv, k), Y0 - HH * lv, c.blue, 2.5);
        L('n' + k, cx, Y0 + 20, v[2], c.ink);
      });
      L('t', 320, 20, 't = ' + t.toFixed(1), c.ink);
      return o;
    },
    cap: function () { return 'Both vessels empty in the same time. Ticks mark equal tenths of the height: the left level passes one tick per second, the right one does not.'; }
  });
};
