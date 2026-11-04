/* gb-russell-table: Russell's table (Problems of Philosophy, Chapter I). The viewer's height and the lamp's position
   change the table's apparent shape and colour; the table itself does not change. Our own drawing. */
ML.viz.register('gb-russell-table', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 210, 'A table seen from different places and in different light'), sv = F.svg, ro = V.readout(el);
  var v = opts.v === undefined ? 30 : opts.v, l = opts.l === undefined ? 50 : opts.l;
  function draw() {
    K.clear(sv);
    var s = Math.sin(v * Math.PI / 180), depth = Math.max(4, 110 * s), shrink = 0.35 * Math.cos(v * Math.PI / 180), W = 220, cx = 200, top = 100 - depth / 2;
    var fl = cx - W / 2 * (1 - shrink), fr = cx + W / 2 * (1 - shrink), nl = cx - W / 2, nr = cx + W / 2, bot = top + depth;
    var lx = 40 + l / 100 * 320;
    K.S('circle', { cx: lx, cy: 18, r: 9, 'class': 'gb20-gold' }, sv);
    K.S('line', { x1: nl + 12, y1: bot, x2: nl + 12, y2: bot + 70 - depth / 3, 'class': 'gb20-bone', 'stroke-width': 6 }, sv);
    K.S('line', { x1: nr - 12, y1: bot, x2: nr - 12, y2: bot + 70 - depth / 3, 'class': 'gb20-bone', 'stroke-width': 6 }, sv);
    K.S('path', { d: 'M' + fl + ',' + top + ' L' + fr + ',' + top + ' L' + nr + ',' + bot + ' L' + nl + ',' + bot + ' Z', 'class': 'gb20-table' }, sv);
    var hx = Math.max(nl + 20, Math.min(nr - 20, lx)), hy = top + depth * 0.45;
    K.S('ellipse', { cx: hx, cy: hy, rx: 34, ry: Math.max(2, depth * 0.18), 'class': 'gb20-shine' }, sv);
    K.S('ellipse', { cx: 400 - hx, cy: hy + depth * 0.2, rx: 40, ry: Math.max(2, depth * 0.2), 'class': 'gb20-shadow' }, sv);
    var shape = v > 84 ? 'a rectangle' : v < 6 ? 'almost a straight line' : 'a slanted, narrowing shape (a trapezoid)';
    ro.set('Seen from ' + (v > 84 ? 'straight above' : v < 6 ? 'level with the top' : v + '° above the table') + ', the top looks like <b>' + shape + '</b>. Near the lamp it looks pale and shiny, far from it dark. Yet everyone agrees the table has one shape and has not changed. Russell: the appearances are <b>sense-data</b>; the table itself is something we infer from them.');
  }
  V.slider(F.ctl, { label: 'Viewing height', min: 0, max: 90, step: 1, value: v, fmt: function (x) { return x + '°'; }, input: function (x) { v = x; draw(); } });
  V.slider(F.ctl, { label: 'Lamp', min: 0, max: 100, step: 1, value: l, fmt: function (x) { return x < 34 ? 'left' : x > 66 ? 'right' : 'middle'; }, input: function (x) { l = x; draw(); } });
  draw();
});
