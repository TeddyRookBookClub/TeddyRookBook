/* gb-james-squirrel: James's camping-trip puzzle (Pragmatism, Lecture II). The man walks round the tree; the squirrel
   keeps to the far side, always facing him. Two meanings of "go round" give two answers. Our own drawing. */
ML.viz.register('gb-james-squirrel', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 230, 'A man walking round a tree with a squirrel on it'), sv = F.svg, ro = V.readout(el);
  var m = opts.m || 'compass', a = 0, maxA = 0, cx = 200, cy = 112;
  var DIRS = ['south', 'east', 'north', 'west'], SIDES = ['front'];
  function pt(r, ang) { return [cx + r * Math.sin(ang), cy + r * Math.cos(ang)]; }
  function draw() {
    K.clear(sv); var rad = a * Math.PI / 180;
    K.S('circle', { cx: cx, cy: cy, r: 84, 'class': 'gb20-route-todo' }, sv);
    if (maxA > 0) { var d = ''; for (var t = 0; t <= maxA; t += 3) { var p = pt(84, t * Math.PI / 180); d += (t ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); } K.S('path', { d: d, 'class': 'gb20-route' }, sv); }
    K.S('circle', { cx: cx, cy: cy, r: 26, 'class': 'gb20-ground-l' }, sv);
    K.S('circle', { cx: cx, cy: cy, r: 26, 'class': 'gb20-ink' }, sv);
    K.T(sv, cx, cy + 4, 'tree', 'gb20-s');
    ['N', 'E', 'S', 'W'].forEach(function (c, i) { var p = [[cx, 12], [cx + 110, cy + 4], [cx, 218], [cx - 110, cy + 4]][i]; K.T(sv, p[0], p[1], c, 'gb20-t'); });
    var man = pt(84, rad), sq = pt(33, rad + Math.PI);
    K.person(sv, man[0], man[1] - 8, 1.6);
    var g = K.S('g', {}, sv);
    K.S('ellipse', { cx: sq[0], cy: sq[1], rx: 7, ry: 5, 'class': 'gb20-gold' }, g);
    K.S('circle', { cx: sq[0] + 10 * Math.sin(rad + Math.PI), cy: sq[1] + 10 * Math.cos(rad + Math.PI), r: 5, 'class': 'gb20-gold' }, g);
    var full = maxA >= 359, msg;
    if (m === 'compass') {
      var seen = []; for (var t2 = 0; t2 <= maxA; t2 += 90) seen.push(DIRS[(t2 / 90) % 4]);
      msg = 'Meaning 1: being first <b>north, then east, then south, then west</b> of the squirrel. So far the man has been ' + seen.join(', ') + ' of it. ' + (full ? '<b>Yes: he has gone round the squirrel.</b>' : 'Keep walking.');
    } else {
      msg = 'Meaning 2: being first <b>in front of the squirrel, then to its side, then behind it</b>. The squirrel turns as he walks, so its belly always faces him: he is always <b>in front</b>. ' + (full ? '<b>No: he never went round the squirrel.</b>' : 'Keep walking: does he ever get behind it?');
    }
    ro.set('Walked ' + Math.round(maxA) + '° of the circle. ' + msg + (full ? ' James: both sides are right, once you say which meaning you mean.' : ''));
  }
  V.seg(F.ctl, { label: 'Meaning of "go round"', items: [['compass', 'N, E, S, W'], ['sides', 'front, side, back']], value: m, change: function (v) { m = v; draw(); } });
  V.slider(F.ctl, { label: 'Walk', min: 0, max: 360, step: 5, value: 0, fmt: function (v) { return v + '°'; }, input: function (v) { a = v; maxA = Math.max(maxA, v); draw(); } });
  draw();
});
