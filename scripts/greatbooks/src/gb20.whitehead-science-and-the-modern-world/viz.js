/* gb-whitehead-abstraction: a ladder of abstraction for one evening by the sea. Each step up keeps fewer features
   and is more useful for calculation; Whitehead's "fallacy of misplaced concreteness" is to treat the top as more real
   than the bottom. Our own example and drawing. */
ML.viz.register('gb-whitehead-abstraction', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 230, 'A ladder of abstraction'), sv = F.svg, ro = V.readout(el), k = opts.k || 0;
  var FEAT = ['warmth of the air', 'sound of waves', 'beauty', 'colours', 'the sun and sea as things', 'shapes and sizes', 'positions and speeds', 'masses', 'wavelengths of light'];
  var LV = [
    ['An evening by the sea', 'as you live it', 0, 'Everything at once: colour, sound, warmth, beauty, and you in the middle of it. This is the <b>concrete</b> fact, Whitehead says.'],
    ['Things in a scene', 'objects and their looks', 3, 'We pick out things: the sun, the sea, the sky, with their colours. Already some of the whole is left behind.'],
    ['Matter in motion', 'the 17th-century picture', 5, 'Bodies with shapes, sizes, positions and speeds. Colours and sounds have been moved "into the mind." Very useful for physics.'],
    ['Equations', 'numbers for the physicist', 6, 'Masses, positions and wavelengths in formulas. Powerful for prediction, and very thin. To call this the "real" evening and the rest mere appearance is the <b>fallacy of misplaced concreteness</b>.']
  ];
  var KEEP = [[0, 1, 2, 3, 4, 5, 6, 7, 8], [3, 4, 5, 6], [5, 6, 7], [6, 7, 8]];
  function draw() {
    K.clear(sv);
    LV.forEach(function (L, i) {
      var y = 188 - i * 50, g = K.S('g', { 'class': 'gb20-it' + (i === k ? ' gb20-on' : '') }, sv);
      K.S('rect', { x: 10, y: y, width: 150, height: 40, rx: 8, 'class': 'gb20-box' }, g);
      K.T(g, 85, y + 17, L[0], 'gb20-t'); K.T(g, 85, y + 32, L[1], 'gb20-s');
      K.clickable(g, function () { k = i; draw(); }, L[0]);
    });
    FEAT.forEach(function (f, j) {
      var on = KEEP[k].indexOf(j) >= 0, y = 18 + j * 23;
      K.S('rect', { x: 180, y: y - 12, width: 210, height: 19, rx: 9, 'class': on ? 'gb20-chip-on' : 'gb20-chip-off' }, sv);
      K.T(sv, 285, y + 2, f, on ? 'gb20-t' : 'gb20-s');
    });
    var L = LV[k];
    ro.set('<b>' + L[0] + ':</b> keeps ' + KEEP[k].length + ' of the ' + FEAT.length + ' features listed. ' + L[3]);
  }
  V.slider(F.ctl, { label: 'Level of abstraction', min: 0, max: 3, step: 1, value: k, input: function (v) { k = v; draw(); } });
  draw();
});
