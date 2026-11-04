/* gb-weber-authority: Weber's three pure types of legitimate authority as the corners of a triangle; historical
   examples (our choices) placed inside it, nearer the type they mostly show. Our own design. */
ML.viz.register('gb-weber-authority', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 250, 'Weber\'s three kinds of authority'), sv = F.svg, ro = V.readout(el), k = opts.k || 0;
  var C = [[200, 34, 'Charismatic', 'extraordinary personal gifts'], [70, 200, 'Traditional', 'custom and inheritance'], [330, 200, 'Legal-rational', 'rules and offices']];
  var EX = [
    ['A hereditary medieval king', [0.1, 0.8, 0.1], 'Mostly <b>traditional</b>: he rules because his fathers ruled, by custom and inheritance.'],
    ['A village elder', [0.1, 0.85, 0.05], 'Mostly <b>traditional</b>: respect comes from age and long custom.'],
    ['Joan of Arc leading the French army', [0.8, 0.15, 0.05], 'Mostly <b>charismatic</b>: soldiers followed a farm girl because they believed she had an extraordinary calling.'],
    ['A judge applying the written law', [0.05, 0.1, 0.85], '<b>Legal-rational</b>: people obey the office and the rules it applies, not the person.'],
    ['A town clerk issuing a license', [0, 0.05, 0.95], 'Pure <b>legal-rational</b> authority, the everyday face of bureaucracy.'],
    ['George Washington as first president', [0.35, 0.05, 0.6], 'A mixture: an office defined by a written constitution, filled by a man whose personal standing was immense. Weber\'s types are pure; real cases mix them.'],
    ['A founder\'s movement after the founder dies', [0.4, 0.3, 0.3], 'Charisma must be "routinized": followers turn it into traditions or rules, or the movement fades.']
  ];
  function pos(w) { return [w[0] * C[0][0] + w[1] * C[1][0] + w[2] * C[2][0], w[0] * C[0][1] + w[1] * C[1][1] + w[2] * C[2][1]]; }
  function draw() {
    K.clear(sv);
    K.S('path', { d: 'M' + C[0][0] + ',' + C[0][1] + ' L' + C[1][0] + ',' + C[1][1] + ' L' + C[2][0] + ',' + C[2][1] + ' Z', 'class': 'gb20-box' }, sv);
    C.forEach(function (c, i) { K.T(sv, c[0], i ? c[1] + 22 : c[1] - 22, c[2], 'gb20-t'); K.T(sv, c[0], i ? c[1] + 36 : c[1] - 9, c[3], 'gb20-s'); });
    EX.forEach(function (e, i) {
      var p = pos(e[1]), g = K.S('g', { 'class': 'gb20-it' }, sv);
      K.S('circle', { cx: p[0], cy: p[1], r: 12, 'class': 'gb20-hit' }, g);
      K.S('circle', { cx: p[0], cy: p[1], r: i === k ? 8 : 5, 'class': i === k ? 'gb20-dot gb20-dot-on' : 'gb20-dot' }, g);
      K.T(g, p[0], p[1] + 4 - (i === k ? 14 : 10), String(i + 1), 'gb20-s');
      K.clickable(g, function () { k = i; draw(); }, e[0]);
    });
    ro.set('<b>' + (k + 1) + '. ' + EX[k][0] + '.</b> ' + EX[k][2]);
  }
  V.button(F.ctl, '← Back', function () { k = (k + EX.length - 1) % EX.length; draw(); });
  V.button(F.ctl, 'Next →', function () { k = (k + 1) % EX.length; draw(); });
  draw();
});
