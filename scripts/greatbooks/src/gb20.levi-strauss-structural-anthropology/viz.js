/* gb-ls-pairs: simple pairs of opposites with an "in-between" (our examples, for young readers).
   gb-ls-mediation: Lévi-Strauss's scheme of mediation from "The Structural Study of Myth": life/death softened by
   agriculture/war and hunting, then herbivores/beasts of prey by carrion-eaters (raven, coyote). Our drawing. */
ML.viz.register('gb-ls-pairs', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 150, 'Pairs of opposites and what joins them'), sv = F.svg, ro = V.readout(el), k = 0, show = false;
  var P = [['Day', 'Night', 'Dawn and dusk'], ['Raw', 'Cooked', 'Fire, which turns one into the other'], ['Sky', 'Earth', 'A tall tree or a mountain'], ['Water', 'Land', 'A shore, or a frog that lives on both'], ['Winter', 'Summer', 'Spring and autumn']];
  function draw() {
    K.clear(sv); var p = P[k];
    K.S('rect', { x: 20, y: 40, width: 110, height: 50, rx: 10, 'class': 'gb20-box' }, sv); K.T(sv, 75, 70, p[0], 'gb20-t');
    K.S('rect', { x: 270, y: 40, width: 110, height: 50, rx: 10, 'class': 'gb20-box' }, sv); K.T(sv, 325, 70, p[1], 'gb20-t');
    if (show) { K.S('path', { d: 'M130,65 Q200,10 270,65', 'class': 'gb20-route' }, sv); K.T(sv, 200, 120, p[2], 'gb20-t', 'middle'); }
    else K.T(sv, 200, 70, '?', 'gb20-t');
    ro.set(show ? '<b>' + p[0] + '</b> and <b>' + p[1] + '</b> are joined by <b>' + p[2].toLowerCase() + '</b>. Lévi-Strauss thought myths often work like this: they find a go-between for two opposites.' : 'What lies between <b>' + p[0].toLowerCase() + '</b> and <b>' + p[1].toLowerCase() + '</b>? Think, then tap "Show the bridge."');
  }
  V.button(F.ctl, 'Show the bridge', function () { show = true; draw(); });
  V.button(F.ctl, 'Next pair →', function () { k = (k + 1) % P.length; show = false; draw(); });
  draw();
});
ML.viz.register('gb-ls-mediation', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 230, 'Mediation in myth'), sv = F.svg, ro = V.readout(el), k = opts.k || 0;
  var ROWS = [
    [['Life', 30], ['Death', 370], null, 'The first, hardest opposition: life against death. Nothing in experience seems to join them.'],
    [['Agriculture', 70], ['War', 330], ['Hunting', 200], 'Farming gives life; war brings death. Hunting stands between: it takes life in order to sustain life.'],
    [['Plant-eaters', 70], ['Beasts of prey', 330], ['Carrion-eaters (raven, coyote)', 200], 'Among animals: plant-eaters kill nothing; beasts of prey kill. Carrion-eaters eat meat but do not kill, so they stand between. Lévi-Strauss suggested this is why raven and coyote so often play the trickster, the go-between, in North American myths.']
  ];
  function draw() {
    K.clear(sv);
    ROWS.forEach(function (r, i) {
      if (i > k) return;
      var y = 30 + i * 72, on = i === k;
      [r[0], r[1]].forEach(function (b) { var w = b[0].length * 7 + 22; K.S('rect', { x: b[1] - w / 2, y: y - 14, width: w, height: 28, rx: 8, 'class': 'gb20-box' + (on ? ' gb20-on' : '') }, sv); K.T(sv, b[1], y + 4, b[0], 'gb20-t'); });
      if (r[2]) { var w2 = r[2][0].length * 6.4 + 22; K.S('rect', { x: 200 - w2 / 2, y: y + 14, width: w2, height: 26, rx: 13, 'class': 'gb20-chip-on' }, sv); K.T(sv, 200, y + 31, r[2][0], 'gb20-t'); }
      if (i < k) { K.arrow(sv, 60 + i * 0, y + 16, 70, y + 56); K.arrow(sv, 340, y + 16, 330, y + 56); }
    });
    ro.set('<b>Step ' + (k + 1) + ' of 3.</b> ' + ROWS[k][3]);
  }
  V.button(F.ctl, '← Back', function () { k = Math.max(0, k - 1); draw(); });
  V.button(F.ctl, 'Mediate →', function () { k = Math.min(2, k + 1); draw(); });
  draw();
});
