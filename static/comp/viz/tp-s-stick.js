/* Our own animation for the 1854 Tripos problem 7 (January 18): random breaks of a rod, and how often a triangle forms. */
(window.CompViz = window.CompViz || {})['tp-s-stick'] = function (el, api) {
  var T = TP.s, M = Math, pts = [], hit = 0, acc = 0, seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function add() { var u = rnd(), w = rnd(), a = M.min(u, w), b = M.max(u, w), ok = a < 0.5 && b > 0.5 && b - a < 0.5; pts.push([u, w, ok]); if (ok) hit++; }
  TP.run(el, api, {
    H: 320, split: 340, aria: 'Random pairs of marks on a rod are plotted as points in a square. Points in the two shaded triangles give pieces that form a triangle: one quarter of the square.',
    reset: function () { pts = []; hit = 0; seed = 7; }, advance: function (dt) { acc += dt; while (acc > 0.01 && pts.length < 2000) { acc -= 0.01; add(); } if (pts.length >= 2000) return false; },
    final: function () { while (pts.length < 2000) add(); }, done: function () { return pts.length >= 2000; },
    draw: function (c, L) {
      var X = 30, Y = 20, S = 280, o = T.rc(X, Y, S, S, 'none', c.axis, 1.5);
      o += T.pa(T.poly([[X, Y + S / 2], [X + S / 2, Y + S / 2], [X + S / 2, Y]], true), null, 0, c.greenSoft) + T.pa(T.poly([[X + S / 2, Y + S], [X + S / 2, Y + S / 2], [X + S, Y + S / 2]], true), null, 0, c.greenSoft);
      for (var i = 0; i < pts.length; i++) o += '<circle cx="' + (X + S * pts[i][0]).toFixed(1) + '" cy="' + (Y + S * (1 - pts[i][1])).toFixed(1) + '" r="1.8" fill="' + (pts[i][2] ? c.green : c.red) + '"/>';
      var f = pts.length ? hit / pts.length : 0;
      L('n', 360, 80, pts.length + '\\text{ rods}', c.ink, 'l'); L('f', 360, 120, '\\text{triangle: } ' + f.toFixed(3), c.green, 'l'); L('q', 360, 160, '\\text{exact: } \\tfrac14', c.ink, 'l');
      return o;
    },
    cap: function () { return 'Each dot is one rod: its two marks are the dot\'s coordinates. Green dots make a triangle.'; }
  });
};
