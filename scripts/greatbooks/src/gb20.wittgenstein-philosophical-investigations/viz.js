/* gb-witt-builders: Wittgenstein's builders (Investigations, section 2): four words, four stones. Our own drawing.
   gb-witt-games: family resemblance. Our own list of games and features: overlapping likenesses, none shared by all. */
ML.viz.register('gb-witt-builders', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 170, 'Two builders and their four-word language'), sv = F.svg, ro = V.readout(el), got = [];
  var ST = { block: [26, 22], pillar: [14, 50], slab: [46, 10], beam: [64, 12] };
  function draw(last) {
    K.clear(sv);
    K.S('line', { x1: 10, y1: 140, x2: 390, y2: 140, 'class': 'gb20-ink' }, sv);
    K.person(sv, 60, 88, 2.4); K.person(sv, 330, 88, 2.4, 'gb20-robe2');
    K.T(sv, 60, 162, 'builder', 'gb20-s'); K.T(sv, 330, 162, 'helper', 'gb20-s');
    if (last) K.T(sv, 110, 70, '"' + last.charAt(0).toUpperCase() + last.slice(1) + '!"', 'gb20-t', 'start');
    var x = 100;
    got.forEach(function (w) { var d = ST[w]; K.S('rect', { x: x, y: 140 - d[1], width: d[0], height: d[1], rx: 2, 'class': 'gb20-gold' }, sv); x += d[0] + 6; });
  }
  ['block', 'pillar', 'slab', 'beam'].forEach(function (w) {
    V.button(F.ctl, w.charAt(0).toUpperCase() + w.slice(1) + '!', function () { if (got.length > 6) got = []; got.push(w); draw(w); ro.set('The builder calls "' + w + '!", and the helper brings a ' + w + '. In this game the word is not just a label: it works like an order. That is its <b>use</b>. For these two people, this is a complete language, a <b>language game</b>.'); });
  });
  draw(); ro.set('Tap a word to call it out.');
});
ML.viz.register('gb-witt-games', function (el, opts, V) {
  var K = ML.gb20kit;
  var FE = ['winning and losing', 'skill', 'luck', 'more than one player', 'a board', 'a ball', 'just for fun'];
  var GM = [['Chess', [0, 1, 3, 4]], ['Solitaire', [0, 1, 2]], ['Tennis', [0, 1, 3, 5]], ['Ring-around-the-rosy', [3, 6]], ['Ball against a wall', [5, 6, 1]], ['Snakes and ladders', [0, 2, 3, 4, 6]], ['Peekaboo', [3, 6]]];
  var F = K.frame(el, 400, 250, 'Games and their overlapping features'), sv = F.svg, ro = V.readout(el), cur = 0, all = false;
  function draw() {
    K.clear(sv);
    FE.forEach(function (f, j) { var t = K.T(sv, 140 + j * 34, 70, f, 'gb20-s', 'start'); t.setAttribute('transform', 'rotate(-40 ' + (140 + j * 34) + ' 70)'); });
    GM.forEach(function (g, i) {
      var y = 92 + i * 22, gg = K.S('g', { 'class': 'gb20-it' + (i === cur && !all ? ' gb20-on' : '') }, sv);
      K.S('rect', { x: 4, y: y - 13, width: 392, height: 20, rx: 6, 'class': i === cur && !all ? 'gb20-box' : 'gb20-hit' }, gg);
      K.T(gg, 130, y + 1, g[0], 'gb20-t', 'end');
      FE.forEach(function (_, j) { var on = g[1].indexOf(j) >= 0; K.S('circle', { cx: 140 + j * 34, cy: y - 3, r: on ? 6 : 3, 'class': on ? (all || i === cur ? 'gb20-dot gb20-dot-on' : 'gb20-dot') : 'gb20-mutf' }, gg); });
      K.clickable(gg, function () { cur = i; all = false; draw(); }, g[0]);
    });
    if (all) {
      var shared = FE.filter(function (_, j) { return GM.every(function (g) { return g[1].indexOf(j) >= 0; }); });
      ro.set(shared.length ? 'Shared by all: ' + shared.join(', ') : '<b>No feature is shared by every game.</b> Chess and tennis share winning, skill and players; peekaboo shares only "more than one player" and "just for fun" with ring-around-the-rosy. The likenesses overlap like the threads of a rope, with no single thread running the whole length. Wittgenstein\'s name for this: <b>family resemblance</b>.');
    } else {
      var g = GM[cur]; ro.set('<b>' + g[0] + ':</b> ' + g[1].map(function (j) { return FE[j]; }).join(', ') + '. Tap another game, or look for one feature all of them share.');
    }
  }
  V.button(F.ctl, 'Is any feature shared by all?', function () { all = true; draw(); });
  draw();
});
