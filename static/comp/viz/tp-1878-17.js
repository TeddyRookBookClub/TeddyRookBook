/* Our own animation for the 1878 Tripos problem xvii: sectors of a submerged semicircle that carry equal thrust. */
(window.CompViz = window.CompViz || {})['tp-1878-17'] = function (el, api) {
  var T = TP.s, M = Math, n = 5, R = 200, CX = 320, CY = 40;
  TP.run(el, api, {
    H: 280, aria: 'A semicircle hangs below the water surface. Equal steps along the diameter, carried straight down to the arc, divide it into sectors that feel equal force.',
    buttons: [['Fewer sectors', function () { n = M.max(2, n - 1); }], ['More sectors', function () { n = M.min(10, n + 1); }]],
    draw: function (c, L) {
      var o = T.rc(0, 0, 640, CY, c.blueSoft) + T.ln(0, CY, 640, CY, c.blue, 2);
      var cols = [c.greenSoft, c.goldSoft];
      for (var i = 0; i < n; i++) {
        var x1 = -1 + 2 * i / n, x2 = -1 + 2 * (i + 1) / n, t1 = M.acos(-x1), t2 = M.acos(-x2);
        var p1 = [CX + R * x1, CY + R * M.sin(t1)], p2 = [CX + R * x2, CY + R * M.sin(t2)];
        o += T.pa('M' + CX + ' ' + CY + 'L' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + 'A' + R + ' ' + R + ' 0 0 0 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + 'Z', c.ink, 1.5, cols[i % 2]);
        o += T.ln(p2[0], CY, p2[0], p2[1], c.muted, 1, '3 3');
      }
      L('f', 320, 262, '\\text{force on a sector} = \\tfrac13\\rho g r^3(\\cos\\theta_1 - \\cos\\theta_2)', c.ink);
      return o;
    },
    cap: function () { return n + ' sectors. The dotted lines split the diameter into equal parts; each sector carries the same total force from the water.'; }
  });
};
