/* gb-mill-happy: a "greatest happiness" calculator: two choices, how many people each affects and by how much.
   Our own design; it also shows the classic worry, a small gain for many against a large loss for one. */
ML.viz.register('gb-mill-happy', function (el, opts, V) {
  var K = ML.gb19kit, F = K.frame(el, 400, 170, 'Two choices compared by total happiness'), sv = F.svg, ro = V.readout(el);
  var P = {
    snack: ['Class snack: pizza or fruit?', { n: 18, d: 3, lab: 'Pizza' }, { n: 6, d: 4, lab: 'Fruit' }],
    music: ['Loud music late at night', { n: 12, d: 2, lab: 'Party goes on' }, { n: 1, d: 9, lab: 'Neighbor sleeps' }],
    park: ['Spend town money on a park or a library', { n: 20, d: 2, lab: 'Park' }, { n: 15, d: 3, lab: 'Library' }]
  };
  var key = opts.preset || 'snack', a = {}, b = {}, sl = [];
  function load() { var p = P[key]; a = { n: p[1].n, d: p[1].d, lab: p[1].lab }; b = { n: p[2].n, d: p[2].d, lab: p[2].lab }; sl.forEach(function (s) { s.s.set(s.o[s.k]); }); }
  function bar(y, o, tot, max) {
    var w = Math.max(2, tot / max * 190);
    K.T(sv, 8, y + 14, o.lab, 'gb19-t', 'start');
    S('rect', { x: 110, y: y, width: w, height: 20, rx: 4, 'class': tot >= 0 ? 'gb19-accf' : 'gb19-mutf' }, sv);
    K.T(sv, 116 + w, y + 14, o.n + ' × ' + o.d + ' = ' + tot, 'gb19-s', 'start');
  }
  var S = K.S;
  function draw() {
    K.clear(sv); var ta = a.n * a.d, tb = b.n * b.d, mx = Math.max(ta, tb, 1);
    K.T(sv, 200, 18, P[key][0], 'gb19-t');
    K.T(sv, 200, 36, 'people × happiness each = total', 'gb19-s');
    bar(56, a, ta, mx); bar(100, b, tb, mx);
    var win = ta === tb ? 'a tie' : (ta > tb ? a.lab : b.lab);
    K.T(sv, 200, 156, 'Greatest total: ' + win, 'gb19-t');
    var warn = (Math.max(a.n, b.n) > 8 && Math.min(a.n, b.n) === 1 && Math.max(a.d, b.d) >= 8) ? ' Notice the worry critics raise: one person\'s large loss can be outweighed by many small gains. Mill answered that rules protecting everyone\'s security, which he called justice, matter most of all to happiness in the long run.' : '';
    ro.set(a.lab + ': ' + a.n + ' people, ' + a.d + ' each, total <b>' + ta + '</b>. ' + b.lab + ': ' + b.n + ' people, ' + b.d + ' each, total <b>' + tb + '</b>. A simple sum favors <b>' + win + '</b>. Mill would add: pleasures also differ in <i>quality</i>, not only amount.' + warn);
  }
  V.seg(F.ctl, { label: 'Example', items: [['snack', 'Snack'], ['music', 'Late music'], ['park', 'Park or library']], value: key, change: function (v) { key = v; load(); draw(); } });
  [[a, 'n', 'people'], [a, 'd', 'happiness each'], [b, 'n', 'people'], [b, 'd', 'happiness each']].forEach(function (q, i) {
    var o = i < 2 ? 'a' : 'b';
    var s = V.slider(F.ctl, { label: (i < 2 ? 'Choice 1: ' : 'Choice 2: ') + q[2], min: 1, max: q[1] === 'n' ? 30 : 10, step: 1, value: (o === 'a' ? a : b)[q[1]], input: function (v) { (o === 'a' ? a : b)[q[1]] = v; draw(); } });
    sl.push({ s: s, k: q[1], get o() { return o === 'a' ? a : b; } });
  });
  load(); draw();
});
