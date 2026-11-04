/* gb-beckett-tree: the stage of Waiting for Godot in Act I and Act II: a country road, a tree that sprouts a few leaves, the two
   friends, the visitors and the moon (our own drawing and summaries; the play is under copyright, so nothing here quotes it). */
ML.viz.register('gb-beckett-tree', function (el, opts, V) {
  var K = ML.gb20kit, W = 400, H = 220, act = opts.act || '1', cur = 0;
  var parts = [
    { t: 'The tree', a: 'Bare. The two friends wonder whether it is even the right tree, and whether this is the right day.', b: 'The next day it has a few leaves, the only sign that any time has passed.' },
    { t: 'Vladimir and Estragon', a: 'Two shabby old friends wait for Mr. Godot. They talk, quarrel, make up, eat a carrot, and fill the time with games.', b: 'They wait again. Estragon forgets most of yesterday; Vladimir remembers and worries about it.' },
    { t: 'Pozzo and Lucky', a: 'A loud, grand traveler drives his servant on a rope. Ordered to "think," Lucky pours out a long tumble of words.', b: 'They return changed: Pozzo is blind and helpless, Lucky can no longer speak. Pozzo remembers nothing of yesterday.' },
    { t: 'The boy', a: 'A boy brings word that Mr. Godot will not come this evening, but surely tomorrow.', b: 'A boy brings the same message, and says he has never seen them before.' },
    { t: 'The moon', a: 'Night falls suddenly and the moon rises. They agree to go, and do not move.', b: 'The moon rises again. They agree to go, and do not move.' }
  ];
  var F = K.frame(el, W, H, 'The stage of Waiting for Godot: a road, a tree, two friends, two visitors, a boy and the moon'), sv = F.svg, ro = V.readout(el);
  function hit(i, x, y, w, h) { var g = K.S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') }, sv); K.S('rect', { x: x, y: y, width: w, height: h, 'class': 'gb20-hit' }, g); K.clickable(g, function () { cur = i; draw(); }, parts[i].t); return g; }
  function draw() {
    K.clear(sv);
    K.S('rect', { x: 0, y: 0, width: W, height: H, 'class': 'gbl-dusk' }, sv);
    K.S('rect', { x: 0, y: 170, width: W, height: 50, 'class': 'gb20-land' }, sv);
    K.S('path', { d: 'M0,190 Q200,176 400,188', 'class': 'gbl-road' }, sv);
    var g0 = hit(0, 60, 60, 70, 115);
    K.S('path', { d: 'M95,172 L95,110 M95,128 L72,98 M95,118 L118,88 M95,110 L100,78', 'class': 'gbl-trunk' }, g0);
    if (act === '2') [[72, 98], [118, 88], [100, 78], [84, 108]].forEach(function (p) { K.S('ellipse', { cx: p[0], cy: p[1], rx: 6, ry: 3.5, 'class': 'gbl-leaf' }, g0); });
    var g1 = hit(1, 140, 100, 90, 80); K.person(g1, 162, 138, 1.6, 'gb20-robe'); K.person(g1, 204, 140, 1.5, 'gb20-robe2');
    var g2 = hit(2, 236, 100, 100, 80); K.person(g2, 254, 140, 1.5, 'gb20-robe'); K.person(g2, 314, 136, 1.7, 'gb20-robe2');
    K.S('path', { d: 'M266,146 Q284,' + (act === '2' ? 136 : 156) + ' 302,146', 'class': 'gbl-rope' }, g2);
    var g3 = hit(3, 342, 120, 50, 60); K.person(g3, 368, 152, 1.05, 'gb20-robe');
    var g4 = hit(4, 290, 14, 60, 50); K.S('circle', { cx: 320, cy: 38, r: 14, 'class': 'gbl-moon' }, g4);
    K.T(sv, 120, 22, act === '1' ? 'Act I: evening' : 'Act II: the next evening', 'gb20-t gb20-halo');
    var p = parts[cur]; ro.set('<b>' + p.t + ' (Act ' + (act === '1' ? 'I' : 'II') + ').</b> ' + (act === '1' ? p.a : p.b));
  }
  V.seg(F.ctl, { label: 'Act', items: [['1', 'Act I'], ['2', 'Act II']], value: act, change: function (v) { act = v; draw(); } });
  draw();
});
