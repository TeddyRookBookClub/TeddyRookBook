/* gb-hemingway-iceberg: Hemingway's "iceberg" idea applied to "The Short Happy Life of Francis Macomber": a little shown above
   the water, much more implied below (our own drawing and summaries). Tap a layer. */
ML.viz.register('gb-hemingway-iceberg', function (el, opts, V) {
  var K = ML.gb20kit, W = 400, H = 280, sea = 92;
  var layers = [
    { t: 'What is said', y0: 34, y1: 92, html: 'Above the water: polite lunch talk under a tent, cold drinks, short sentences about the hunt. Nobody says "I am ashamed" or "I despise you."' },
    { t: 'The shame', y0: 92, y1: 150, html: 'Below: the day before, Macomber ran from a charging lion. Everyone knows, and the shame sits under every line of the lunch talk.' },
    { t: 'The marriage', y0: 150, y1: 208, html: 'Deeper: a long struggle for power between Francis and Margot. His fear gives her the upper hand, and his new courage threatens it.' },
    { t: 'The open question', y0: 208, y1: 266, html: 'Deepest: when Margot fires at the charging buffalo and the shot kills her husband, did she mean it? Hemingway never says. The hunter Wilson suspects she did; readers still argue.' }
  ];
  var F = K.frame(el, W, H, 'An iceberg: a small tip above the water and a large mass below, with four layers to tap'), sv = F.svg, ro = V.readout(el), cur = 0;
  var WID = [[0, 40], [40, 72], [72, 84], [84, 30]];   // half-widths at the top and bottom of each layer
  function draw() {
    K.clear(sv);
    K.S('rect', { x: 0, y: 0, width: W, height: sea, 'class': 'gb20-paperbg' }, sv);
    K.S('rect', { x: 0, y: sea, width: W, height: H - sea, 'class': 'gb20-sea' }, sv);
    K.S('line', { x1: 0, y1: sea, x2: W, y2: sea, 'class': 'gbl-water' }, sv);
    layers.forEach(function (L, i) {
      var g = K.S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') }, sv), cx = 150, wa = WID[i][0], wb = WID[i][1];
      var top = 'M' + (cx - wa) + ',' + L.y0 + ' L' + (cx + wa) + ',' + L.y0 + ' L' + (cx + wb) + ',' + L.y1 + ' L' + (cx - wb) + ',' + L.y1 + ' Z';
      K.S('path', { d: top, 'class': i === cur ? 'gbl-ice gbl-ice-on' : 'gbl-ice' }, g);
      K.S('rect', { x: 0, y: L.y0, width: W, height: L.y1 - L.y0, 'class': 'gb20-hit' }, g);
      K.T(g, 260, (L.y0 + L.y1) / 2 + 4, L.t, i === cur ? 'gb20-t gb20-halo' : 'gb20-s gb20-halo', 'start');
      K.clickable(g, function () { cur = i; draw(); }, L.t);
    });
    K.T(sv, 40, sea - 6, 'the surface', 'gb20-s gb20-halo', 'start');
    ro.set('<b>' + layers[cur].t + '.</b> ' + layers[cur].html);
  }
  V.button(F.ctl, '↑ Up', function () { cur = Math.max(0, cur - 1); draw(); });
  V.button(F.ctl, 'Deeper ↓', function () { cur = Math.min(layers.length - 1, cur + 1); draw(); });
  draw();
});
