/* Our own animation for the 1878 Tripos problem vi: alternating means that close in on 2/pi. */
(window.CompViz = window.CompViz || {})['tp-1878-6'] = function (el, api) {
  var T = TP.s, M = Math, k = 0, acc = 0, seq = [[0, 1]];
  for (var i = 0; i < 12; i++) { var a = (seq[i][0] + seq[i][1]) / 2; seq.push([a, M.sqrt(a * seq[i][1])]); }
  var X0 = 40, X1 = 600, lim = 2 / M.PI;
  function X(v) { return X0 + (X1 - X0) * v; }
  TP.run(el, api, {
    H: 260, aria: 'Starting from 0 and 1, the alternating averages close in on 2 over pi, about 0.6366.',
    reset: function () { k = 0; acc = 0; }, advance: function (dt) { acc += dt; if (acc > 0.8) { acc = 0; k++; } if (k >= 12) { k = 12; return false; } },
    step: function () { k = M.min(12, k + 1); }, final: function () { k = 12; }, done: function () { return k >= 12; },
    draw: function (c, L) {
      var o = T.ln(X0, 120, X1, 120, c.axis, 2), s = seq[k];
      for (var j = 0; j <= 10; j++) o += T.ln(X(j / 10), 114, X(j / 10), 126, c.axis, 1);
      o += T.ln(X(lim), 80, X(lim), 160, c.green, 2, '5 4');
      o += T.ci(X(s[0]), 120, 7, c.blue) + T.ci(X(s[1]), 120, 7, c.red);
      L('0', X0, 140, '0', c.muted); L('1', X1, 140, '1', c.muted); L('l', X(lim), 70, '2/\\pi', c.green);
      L('n', 320, 190, 'a_{' + k + '} = ' + s[0].toFixed(10) + ',\\quad b_{' + k + '} = ' + s[1].toFixed(10), c.ink);
      L('p', 320, 225, '\\pi \\approx 2 / b_{' + k + '} = ' + (2 / s[1]).toFixed(10), c.ink);
      return o;
    },
    cap: function () { return 'Step ' + k + ': the blue point is a, the red point b. Each step shrinks the gap between them about four times.'; }
  });
};
