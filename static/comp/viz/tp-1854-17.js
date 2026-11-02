/* Our own animation for the 1854 Tripos problem 17: two parallel rays reflecting inside a circular mirror. */
(window.CompViz = window.CompViz || {})['tp-1854-17'] = function (el, api) {
  var T = TP.s, M = Math, n = 0, acc = 0, N = 36, R = 120, CX = 170, CY = 160;
  function chord(arc, k) { // k-th chord of a ray whose chords cut off arc `arc`, starting symmetric about angle 0
    var a = -arc / 2 + k * arc; return [[CX + R * M.cos(a), CY - R * M.sin(a)], [CX + R * M.cos(a + arc), CY - R * M.sin(a + arc)]];
  }
  TP.run(el, api, {
    H: 320, split: 345, aria: 'Two rays bounce around inside a circular mirror. Each reflection turns one ray by 90 degrees and the other by 40 degrees, so after 18 reflections the rays are parallel again.',
    reset: function () { n = 0; acc = 0; }, advance: function (dt) { acc += dt; if (acc > 0.45) { acc = 0; n++; } if (n >= N) { n = N; return false; } },
    step: function () { n = M.min(N, n + 1); }, final: function () { n = 18; }, done: function () { return n >= N; },
    draw: function (c, L) {
      var o = T.ci(CX, CY, R, 'none', c.muted, 3), i, k;
      [[M.PI / 2, c.red], [2 * M.PI / 9, c.blue]].forEach(function (r, j) {
        for (k = M.max(0, n - 3); k <= n; k++) { var ch = chord(r[0], k), last = k === n; o += last ? T.arr(ch[0][0], ch[0][1], ch[1][0], ch[1][1], r[1], 3) : T.ln(ch[0][0], ch[0][1], ch[1][0], ch[1][1], r[1], 1.5, '4 4'); }
      });
      var d = (50 * n) % 360, par = (50 * n) % 180 === 0;
      L('n', 360, 70, 'n = ' + n, c.ink, 'l');
      L('d', 360, 110, '\\text{turned: } 90n^\\circ \\text{ and } 40n^\\circ', c.ink, 'l');
      L('e', 360, 150, '\\text{difference} \\equiv ' + d + '^\\circ', par ? c.green : c.ink, 'l');
      L('p', 360, 190, par && n > 0 ? (d === 0 ? '\\text{parallel, same way}' : '\\text{parallel, opposite ways}') : '', c.green, 'l');
      return o;
    },
    cap: function () { return 'Arrows show the latest chord of each ray. The red ray cuts off a quarter of the circle, the blue one a ninth. After ' + n + ' reflections their directions differ by ' + ((50 * n) % 360) + '°.'; }
  });
};
