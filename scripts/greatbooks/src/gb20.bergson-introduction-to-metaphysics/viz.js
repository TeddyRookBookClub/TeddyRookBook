/* gb-bergson-views: Bergson's two ways of knowing. "Town": snapshots from points of view around a town never add up
   to walking in it. "Melody": a tune sampled at points, against the tune heard as one flowing line. Our own drawing. */
ML.viz.register('gb-bergson-views', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 220, 'Knowing from outside and from inside'), sv = F.svg, ro = V.readout(el);
  var m = opts.m || 'town', n = opts.n || 4, inside = false, cx = 200, cy = 112;
  function tune(x) { return cy - 40 * Math.sin(x / 38) - 18 * Math.sin(x / 13 + 1); }
  function draw() {
    K.clear(sv);
    if (m === 'town') {
      K.S('circle', { cx: cx, cy: cy, r: 52, 'class': 'gb20-land' }, sv);
      [[-22, -14], [6, -20], [18, 8], [-14, 14], [-2, -2]].forEach(function (b, i) { K.S('rect', { x: cx + b[0] - 7, y: cy + b[1] - 9, width: 14 + (i % 2) * 6, height: 16, rx: 2, 'class': 'gb20-box' }, sv); });
      for (var i = 0; i < n; i++) {
        var a = i / n * 2 * Math.PI, x = cx + 92 * Math.cos(a), y = cy + 92 * Math.sin(a);
        K.S('line', { x1: x, y1: y, x2: cx + 56 * Math.cos(a), y2: cy + 56 * Math.sin(a), 'class': 'gb20-edge gb20-dash' }, sv);
        K.S('rect', { x: x - 7, y: y - 5, width: 14, height: 10, rx: 2, 'class': 'gb20-gold' }, sv);
      }
      if (inside) K.person(sv, cx + 4, cy + 22, 1.5, 'gb20-robe2');
      ro.set(inside ? '<b>Inside: walking in the town.</b> No point of view and no symbol: you are in it. Bergson calls this kind of knowing <b>intuition</b>; it reaches what is unique in the thing.' :
        '<b>' + n + ' snapshot' + (n > 1 ? 's' : '') + ' from outside.</b> Each view adds detail, but each is taken from a place, and together "they would never be equivalent to the solid town in which we walk about." This is <b>analysis</b>.');
    } else {
      var d = '';
      if (inside) { for (var x2 = 30; x2 <= 370; x2 += 4) d += (x2 === 30 ? 'M' : 'L') + x2 + ',' + tune(x2).toFixed(1); K.S('path', { d: d, 'class': 'gb20-route' }, sv); }
      for (var j = 0; j < n; j++) { var xx = 30 + j * 340 / Math.max(1, n - 1); K.S('circle', { cx: xx, cy: tune(xx), r: 4, 'class': 'gb20-dot' + (inside ? '' : ' gb20-dot-on') }, sv); }
      K.T(sv, 200, 206, inside ? 'the tune heard as one flowing whole' : n + ' separate notes, measured one by one', 'gb20-s');
      ro.set(inside ? '<b>Heard from inside.</b> Each note is colored by the ones before it: the melody is one flowing whole. Bergson thought our own life in time, which he called <b>duration</b>, is known like this.' :
        '<b>' + n + ' measured points.</b> More points give a better outline, but a list of notes is still not the melody. Clock time works like this: equal, separate moments.');
    }
  }
  V.seg(F.ctl, { label: 'Example', items: [['town', 'A town'], ['melody', 'A melody']], value: m, change: function (v) { m = v; draw(); } });
  V.slider(F.ctl, { label: 'Views from outside', min: 1, max: 24, step: 1, value: n, input: function (v) { n = v; inside = false; draw(); } });
  V.button(F.ctl, 'Step inside', function () { inside = !inside; draw(); });
  draw();
});
