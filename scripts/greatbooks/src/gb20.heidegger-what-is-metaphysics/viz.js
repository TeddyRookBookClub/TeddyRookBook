/* gb-heidegger-rings: the sciences each study a region of beings; Heidegger asks about beings as a whole and the
   nothing; Carnap's reply treats that question as a misuse of language. Our own summary and drawing. */
ML.viz.register('gb-heidegger-rings', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 230, 'The sciences, beings as a whole, and the question of the nothing'), sv = F.svg, ro = V.readout(el), s = opts.s || 'h', cur = -1;
  var SCI = [['Physics', 'matter and energy', 135, 96], ['Biology', 'living things', 265, 96], ['History', 'the human past', 135, 152], ['Mathematics', 'number and form', 265, 152]];
  var NOTE = {
    h: ['<b>The nothing.</b> Science studies beings "and nothing else." Heidegger asks about that nothing, which no science can study. He thought moods like deep boredom and anxiety bring us before it, and so let us wonder that beings exist at all.',
        '<b>Beings as a whole.</b> No single science studies everything that is. Metaphysics, for Heidegger, asks about beings as a whole, and it can do so only because we are "held out into the nothing."'],
    c: ['<b>Carnap\'s reply (1932).</b> "Nothing" is not the name of anything. "There is nothing outside" means only "there is not anything outside." Treating "the nothing" as a thing, Carnap argued, produces sentences that sound deep but cannot be true or false.',
        '<b>Beings as a whole.</b> For Carnap and the logical positivists, questions about the world are answered by the sciences and by logic; there is no further "metaphysical" question left over.']
  };
  function draw() {
    K.clear(sv);
    var g0 = K.S('g', { 'class': 'gb20-it' + (cur === 9 ? ' gb20-on' : '') }, sv);
    K.S('rect', { x: 4, y: 4, width: 392, height: 222, rx: 14, 'class': s === 'h' ? 'gb20-void' : 'gb20-paperbg' }, g0);
    K.T(g0, 200, 24, s === 'h' ? 'the nothing?' : '"nothing": not a thing at all', 'gb20-s');
    K.clickable(g0, function () { cur = 9; draw(); }, 'The nothing');
    var g1 = K.S('g', { 'class': 'gb20-it' + (cur === 8 ? ' gb20-on' : '') }, sv);
    K.S('ellipse', { cx: 200, cy: 124, rx: 180, ry: 92, 'class': 'gb20-box' }, g1);
    K.T(g1, 200, 52, 'beings as a whole', 'gb20-t');
    K.clickable(g1, function () { cur = 8; draw(); }, 'Beings as a whole');
    SCI.forEach(function (c, i) {
      var g = K.S('g', { 'class': 'gb20-it' + (cur === i ? ' gb20-on' : '') }, sv);
      K.S('ellipse', { cx: c[2], cy: c[3], rx: 60, ry: 24, 'class': 'gb20-box' }, g);
      K.T(g, c[2], c[3] - 1, c[0], 'gb20-t'); K.T(g, c[2], c[3] + 12, c[1], 'gb20-s');
      K.clickable(g, function () { cur = i; draw(); }, c[0]);
    });
    if (cur === 9) ro.set(NOTE[s][0]); else if (cur === 8) ro.set(NOTE[s][1]);
    else if (cur >= 0) ro.set('<b>' + SCI[cur][0] + '</b> studies one region of beings: ' + SCI[cur][1] + ', "and nothing else." Each science, Heidegger says, has its own field and its own method.');
    else ro.set('Tap a science, the big ring, or the space outside it.');
  }
  V.seg(F.ctl, { label: 'View', items: [['h', 'Heidegger'], ['c', 'Carnap\'s reply']], value: s, change: function (v) { s = v; draw(); } });
  draw();
});
