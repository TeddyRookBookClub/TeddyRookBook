/* gb-woolf-time: the three parts of To the Lighthouse, comparing the share of pages each takes with the time each covers
   (page shares are rough, about 60%, 10% and 30%; time on a log scale). Our own design. */
ML.viz.register('gb-woolf-time', function (el, opts, V) {
  var K = ML.gb20kit, W = 400, H = 200;
  var parts = [
    { t: 'I. The Window', pages: 0.6, hours: 8, tl: 'one afternoon and evening', html: 'One September afternoon and evening on the Isle of Skye: James\'s hope of the lighthouse, Lily\'s painting, and Mrs. Ramsay\'s dinner party, all told from inside many minds.' },
    { t: 'II. Time Passes', pages: 0.1, hours: 87600, tl: 'ten years', html: 'The house stands empty for ten years. In a few bracketed sentences, three members of the family die, one in the war. Mrs. McNab, the cleaner, saves the house from ruin.' },
    { t: 'III. The Lighthouse', pages: 0.3, hours: 4, tl: 'one morning', html: 'Ten years later, Mr. Ramsay sails to the lighthouse with James and Cam, while Lily Briscoe finishes her painting on the lawn.' }
  ];
  var mode = opts.mode || 'pages', cur = 0;
  var F = K.frame(el, W, H, 'Bar chart comparing the pages and the time covered by each part of To the Lighthouse'), sv = F.svg, ro = V.readout(el);
  function val(p) { return mode === 'pages' ? p.pages / 0.6 : Math.log(p.hours) / Math.log(87600); }
  function draw() {
    K.clear(sv);
    K.T(sv, W / 2, 16, mode === 'pages' ? 'Share of the book\'s pages (rough)' : 'Time each part covers (log scale)', 'gb20-s');
    parts.forEach(function (p, i) {
      var y = 34 + i * 54, bw = Math.max(6, 250 * val(p)), g = K.S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') }, sv);
      K.S('rect', { x: 0, y: y - 6, width: W, height: 48, 'class': 'gb20-hit' }, g);
      K.T(g, 8, y + 8, p.t, 'gb20-t', 'start');
      K.S('rect', { x: 8, y: y + 16, width: bw, height: 18, rx: 4, 'class': i === cur ? 'gbl-bar gbl-bar-on' : 'gbl-bar' }, g);
      K.T(g, 14 + bw, y + 30, mode === 'pages' ? 'about ' + Math.round(p.pages * 100) + '%' : p.tl, 'gb20-s', 'start');
      K.clickable(g, function () { cur = i; draw(); }, p.t);
    });
    var p = parts[cur];
    ro.set('<b>' + p.t + '</b> (' + p.tl + ', about ' + Math.round(p.pages * 100) + '% of the pages). ' + p.html);
  }
  V.seg(F.ctl, { label: 'Measure', items: [['pages', 'Pages'], ['time', 'Time covered']], value: mode, change: function (v) { mode = v; draw(); } });
  draw();
});
