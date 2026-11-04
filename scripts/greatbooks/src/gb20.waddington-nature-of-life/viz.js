/* gb-landscape: Waddington's "epigenetic landscape", seen from above. A cell (the ball) rolls downhill through
   branching valleys; each valley floor it ends in is a kind of cell. Signals tip it one way at each fork. Deep valleys
   (strong canalization) keep it on course despite random jiggles; shallow ones let chance send it astray. Roll 20
   cells to see how reliable development is. Our own design, seeded. opts: depth: 0–1. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, FATES = ['nerve cell', 'skin cell', 'muscle cell', 'blood cell'];
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  V.register('gb-landscape', function (el, o) {
    o = o || {};
    var depth = o.depth == null ? 0.8 : +o.depth, s1 = 'L', s2 = 'R', path = null, t = 1, playing = false, tally = null, seed = 5;
    var c = V.canvas(el, { aspect: 1.6, min: 260, max: 340 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'Signal at the first fork', items: [['L', 'First fork: left'], ['R', 'First fork: right']], value: s1, change: function (v) { s1 = v; tally = null; path = null; draw(); } });
    V.seg(ctl, { label: 'Signal at the second fork', items: [['L', 'Second fork: left'], ['R', 'Second fork: right']], value: s2, change: function (v) { s2 = v; tally = null; path = null; draw(); } });
    V.slider(ctl, { label: 'Depth of the valleys (canalization)', min: 0, max: 1, step: 0.05, value: depth, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { depth = v; tally = null; draw(); } });
    V.button(ctl, 'Roll one cell', function () { var R = rng(seed = (seed * 41 + 7) % 99991); path = roll(R); tally = null; t = 0; playing = true; lp.start(); if (V.reduced) { t = 1; playing = false; draw(); } });
    V.button(ctl, 'Roll 20 cells', function () { var R = rng(seed = (seed * 41 + 7) % 99991); tally = [0, 0, 0, 0]; for (var i = 0; i < 20; i++) { var p = roll(R); tally[p[0] * 2 + p[1]]++; } path = null; draw(); });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    var lp = V.loop(el, function (dt) { if (!playing) return; t = M.min(1, t + dt * 0.6); draw(); if (t >= 1) playing = false; });
    function follow(R, sig) { var keep = 0.5 + 0.5 * depth; if (keep > 0.99) keep = 0.99; return (R() < keep) ? sig : (sig === 'L' ? 'R' : 'L'); }
    function roll(R) { var a = follow(R, s1) === 'L' ? 0 : 1, b = follow(R, s2) === 'L' ? 0 : 1; return [a, b]; }
    function pts(w, h) { // key points: start, fork 1, two forks 2, four ends
      var top = 26, f1 = h * 0.32, f2 = h * 0.6, end = h - 46;
      return { S: [w / 2, top], F1: [w / 2, f1], F2: [[w * 0.3, f2], [w * 0.7, f2]], E: [[w * 0.14, end], [w * 0.4, end], [w * 0.6, end], [w * 0.86, end]] };
    }
    function valley(g, k, a, b, wd) {
      g.lineCap = 'round';
      g.strokeStyle = k.greenSoft; g.lineWidth = wd; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = k.green; g.lineWidth = 1 + 3 * depth; g.globalAlpha = 0.35 + 0.65 * depth; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.globalAlpha = 1;
    }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, P = pts(w, h), wd = 14 + 16 * depth;
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, h); g.restore();
      valley(g, k, P.S, P.F1, wd);
      P.F2.forEach(function (f, i) { valley(g, k, P.F1, f, wd); valley(g, k, f, P.E[i * 2], wd); valley(g, k, f, P.E[i * 2 + 1], wd); });
      g.fillStyle = k.ink; g.font = '600 12px system-ui,sans-serif'; g.textAlign = 'center';
      P.E.forEach(function (e, i) { var lab = FATES[i].split(' '); g.fillText(lab[0], e[0], e[1] + 26); if (tally) { g.fillStyle = k.red; g.font = '700 13px system-ui,sans-serif'; g.fillText(String(tally[i]), e[0], e[1] + 4); g.fillStyle = k.ink; g.font = '600 12px system-ui,sans-serif'; } });
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.fillText('egg cell', P.S[0], P.S[1] - 10);
      var want = (s1 === 'L' ? 0 : 1) * 2 + (s2 === 'L' ? 0 : 1);
      g.strokeStyle = k.gold; g.lineWidth = 2; g.beginPath(); g.arc(P.E[want][0], P.E[want][1], 12, 0, 2 * M.PI); g.stroke();
      if (path) { // the ball along its route
        var route = [P.S, P.F1, P.F2[path[0]], P.E[path[0] * 2 + path[1]]], seg = M.min(2.999, t * 3), i = M.floor(seg), f = seg - i;
        var x = route[i][0] + (route[i + 1][0] - route[i][0]) * f, y = route[i][1] + (route[i + 1][1] - route[i][1]) * f;
        g.fillStyle = k.blue; g.beginPath(); g.arc(x, y, 8, 0, 2 * M.PI); g.fill(); g.strokeStyle = k.ink; g.lineWidth = 1.5; g.stroke();
      }
      c.cv.setAttribute('aria-label', 'Branching valleys leading to four kinds of cell; valley depth ' + M.round(depth * 100) + ' percent');
      var msg;
      if (tally) msg = 'Of 20 cells given the same signals, <b>' + tally[want] + '</b> became ' + FATES[want] + 's (the gold ring) and ' + (20 - tally[want]) + ' went astray. ';
      else if (path && t >= 1) { var got = path[0] * 2 + path[1]; msg = got === want ? 'This cell followed the signals and became a <b>' + FATES[got] + '</b>. ' : 'A random jiggle sent this cell down the wrong valley: it became a <b>' + FATES[got] + '</b>. '; }
      else msg = 'The signals point the cell toward the gold ring: a <b>' + FATES[want] + '</b>. ';
      out.set(msg + (depth > 0.7 ? 'Deep valleys: development is well canalized, so small upsets rarely change the outcome.' : depth < 0.3 ? 'Shallow valleys: chance often wins, and development is unreliable.' : 'Medium valleys: most cells stay on course, some do not.'));
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
