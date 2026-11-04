/* gb-perspective: one object, many views. A cylinder seen from the side, from above and in between, for Nietzsche's
   claim that all seeing is from a perspective. Our own design (uses ML.gb19kit). */
ML.viz.register('gb-perspective', function (el, opts, V) {
  var K = ML.gb19kit, F = K.frame(el, 400, 230, 'A cylinder seen from different angles'), sv = F.svg, ro = V.readout(el), th = opts.angle === undefined ? 30 : opts.angle;
  function draw() {
    K.clear(sv);
    var r = 60, hgt = 110, s = Math.sin(th * Math.PI / 180), c = Math.cos(th * Math.PI / 180), cx = 140, ry = Math.max(0.5, r * s), bh = hgt * c, top = 115 - bh / 2;
    var S = K.S;
    S('path', { d: 'M' + (cx - r) + ',' + top + ' L' + (cx - r) + ',' + (top + bh) + ' A' + r + ',' + ry + ' 0 0 0 ' + (cx + r) + ',' + (top + bh) + ' L' + (cx + r) + ',' + top + ' Z', 'class': 'gb19-box' }, sv);
    S('ellipse', { cx: cx, cy: top, rx: r, ry: ry, 'class': 'gb19-box gb19-top' }, sv);
    // the viewer, a small generic figure on an arc
    S('path', { d: 'M260,200 A150,150 0 0 1 310,50', 'class': 'gb19-route-todo' }, sv);
    K.person(sv, 300 + 10 * c, 190 - 140 * s, 0.9);
    K.T(sv, 300, 222, 'your view: ' + Math.round(th) + '° above the side', 'gb19-s');
    var shape = th < 8 ? 'a rectangle' : th > 82 ? 'a circle' : 'a can, with an oval on top';
    K.T(sv, cx, 222, 'You see ' + shape, 'gb19-t');
    ro.set('From here the object looks like <b>' + shape + '</b>. From the side it is a rectangle; from straight above, a circle. Each view is a true view, and none is the whole. Nietzsche argued that all knowing is like this: there is no view "from nowhere," only perspectives, and philosophers forget theirs. Critics reply that if every view is only a perspective, that claim is a perspective too.');
  }
  var sl = V.slider(F.ctl, { label: 'Viewing angle', min: 0, max: 90, step: 1, value: th, fmt: function (v) { return v + '°'; }, input: function (v) { th = v; draw(); } });
  V.seg(F.ctl, { label: 'Jump to', items: [['0', 'Side'], ['35', 'Between'], ['90', 'Above']], value: '', change: function (v) { th = +v; sl.set(th); draw(); } });
  draw();
});
