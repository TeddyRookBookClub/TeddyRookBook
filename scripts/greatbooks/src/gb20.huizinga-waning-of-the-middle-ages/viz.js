/* gb-huizinga-day: a day in a 15th-century town on a 24-hour dial, with the canonical hours of prayer that church bells
   rang (typical times; they shifted with the seasons and the place) and the darkness of night. Our own design. */
ML.viz.register('gb-huizinga-day', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 230, 'A day in a 15th-century town'), sv = F.svg, ro = V.readout(el), h = opts.h === undefined ? 12 : opts.h;
  var BELLS = [[2, 'Matins', 'the night office: monks and nuns rise in the dark to pray'], [5, 'Lauds', 'dawn praise'], [6, 'Prime', 'the first hour: the working day begins, shops open'], [9, 'Terce', 'mid-morning'], [12, 'Sext', 'noon: the main meal for many'], [15, 'None', 'mid-afternoon'], [18, 'Vespers', 'evening prayer at sunset'], [20.5, 'Compline', 'the last prayer before sleep; town gates and taverns close']];
  var cx = 138, cy = 115, r = 86;
  function ang(t) { return (t / 24) * 2 * Math.PI - Math.PI / 2; }
  function draw() {
    K.clear(sv);
    var night = h < 5.5 || h > 19.5;
    K.S('circle', { cx: cx, cy: cy, r: r, 'class': 'gb20-box' }, sv);
    var a0 = ang(19.5), a1 = ang(29.5), big = 1;
    K.S('path', { d: 'M' + cx + ',' + cy + ' L' + (cx + r * Math.cos(a0)) + ',' + (cy + r * Math.sin(a0)) + ' A' + r + ',' + r + ' 0 0 1 ' + (cx + r * Math.cos(a1)) + ',' + (cy + r * Math.sin(a1)) + ' Z', 'class': 'gb20-night' }, sv);
    [0, 6, 12, 18].forEach(function (t) { var a = ang(t); K.T(sv, cx + (r + 22) * Math.cos(a), cy + (r + 14) * Math.sin(a) + 4, t === 0 ? 'midnight' : t === 12 ? 'noon' : t + ':00', 'gb20-s'); });
    BELLS.forEach(function (b) { var a = ang(b[0]); K.S('circle', { cx: cx + (r - 12) * Math.cos(a), cy: cy + (r - 12) * Math.sin(a), r: 5, 'class': 'gb20-gold' }, sv); });
    var a = ang(h);
    K.S('line', { x1: cx, y1: cy, x2: cx + (r - 20) * Math.cos(a), y2: cy + (r - 20) * Math.sin(a), 'class': 'gb20-ink' }, sv);
    K.S('circle', { cx: cx, cy: cy, r: 4, 'class': 'gb20-accf' }, sv);
    var near = null; BELLS.forEach(function (b) { if (Math.abs(b[0] - h) <= 0.5) near = b; });
    K.S('path', { d: 'M300,70 q20,0 20,30 l6,30 h-52 l6,-30 q0,-30 20,-30 Z', 'class': near ? 'gb20-gold' : 'gb20-box' }, sv);
    K.S('circle', { cx: 300, cy: 136, r: 5, 'class': 'gb20-ink' }, sv);
    if (near) { [0, 1, 2].forEach(function (i) { K.S('path', { d: 'M' + (334 + i * 9) + ',' + (90 - i * 4) + ' q8,15 0,30', 'class': 'gb20-ink' }, sv); }); K.T(sv, 300, 165, near[1], 'gb20-t'); }
    K.T(sv, 300, 190, night ? 'night: dark streets, no lamps' : 'daylight', 'gb20-s');
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    ro.set('<b>' + hh + ':' + (mm < 10 ? '0' : '') + mm + '.</b> ' + (near ? 'The bells ring for <b>' + near[1] + '</b>, ' + near[2] + '.' : 'Between the bells. ' + (night ? 'After dark the streets were black and mostly silent; Huizinga stresses how sharply night differed from day.' : 'Markets, workshops and processions fill the streets; feasts and fasts, rich and poor, are all on show.')));
  }
  V.slider(F.ctl, { label: 'Time of day', min: 0, max: 23.5, step: 0.5, value: h, fmt: function (v) { var hh = Math.floor(v); return hh + ':' + (v % 1 ? '30' : '00'); }, input: function (v) { h = v; draw(); } });
  draw();
});
