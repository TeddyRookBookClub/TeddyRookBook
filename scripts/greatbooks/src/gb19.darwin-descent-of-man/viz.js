/* gb-homology: the same bones in four forelimbs (human arm, bat wing, whale flipper, bird wing), schematic, our own drawing.
   Tap a bone group to light it up in all four. Uses ML.gb19kit. */
ML.viz.register('gb-homology', function (el, opts, V) {
  var K = ML.gb19kit, F = K.frame(el, 400, 210, 'Four forelimbs built from the same bones'), sv = F.svg, ro = V.readout(el), on = opts.group || 'up';
  var G = { up: ['Upper arm', 'one bone (the humerus)'], fore: ['Forearm', 'two bones (radius and ulna)'], wrist: ['Wrist', 'a cluster of small bones'], hand: ['Hand', 'finger bones']};
  // each limb: [label, outline path or null, segments [group, x1, y1, x2, y2, width]]
  var L = [
    ['Human arm', 'M41,8 L59,8 L61,64 L64,112 L68,122 L66,162 L34,162 L28,134 L36,116 L39,64 Z', [['up', 50, 14, 50, 62, 7], ['fore', 46, 66, 44, 110, 4], ['fore', 54, 66, 56, 110, 4], ['wrist', 50, 116, 50, 116, 9], ['hand', 42, 122, 38, 150, 3], ['hand', 47, 124, 46, 156, 3], ['hand', 52, 124, 53, 158, 3], ['hand', 57, 122, 60, 154, 3], ['hand', 41, 117, 30, 132, 3]]],
    ['Bat wing', 'M18,12 L62,58 L96,24 L98,64 L88,104 L68,128 L40,150 Z', [['up', 18, 12, 36, 42, 6], ['fore', 36, 44, 62, 58, 3], ['fore', 37, 47, 61, 61, 2], ['wrist', 64, 60, 64, 60, 6], ['hand', 66, 58, 96, 24, 2], ['hand', 67, 61, 98, 64, 2], ['hand', 66, 64, 88, 104, 2], ['hand', 64, 66, 68, 128, 2], ['hand', 62, 57, 66, 48, 2]]],
    ['Whale flipper', 'M40,10 C18,40 22,110 46,170 C70,110 74,40 52,10 Z', [['up', 46, 14, 46, 38, 11], ['fore', 41, 42, 39, 62, 7], ['fore', 51, 42, 53, 62, 7], ['wrist', 46, 70, 46, 70, 10], ['hand', 36, 80, 32, 138, 3], ['hand', 43, 82, 42, 158, 3], ['hand', 50, 82, 51, 160, 3], ['hand', 57, 80, 60, 140, 3]]],
    ['Bird wing', 'M16,12 C60,30 96,60 98,104 C80,116 50,104 40,70 Z', [['up', 16, 12, 40, 48, 6], ['fore', 41, 50, 72, 70, 3], ['fore', 43, 53, 70, 74, 2], ['wrist', 75, 74, 75, 74, 6], ['hand', 77, 76, 96, 98, 4], ['hand', 76, 72, 82, 66, 2]]]
  ];
  function draw() {
    K.clear(sv); var S = K.S;
    L.forEach(function (lb, i) {
      var g = S('g', { transform: 'translate(' + (i * 100) + ',0)' }, sv);
      if (lb[1]) S('path', { d: lb[1], 'class': i === 0 ? 'gb19-skin' : 'gb19-membrane' }, g);
      lb[2].forEach(function (s) {
        var c = 'gb19-bone' + (s[0] === on ? ' gb19-bone-on' : '');
        if (s[1] === s[3] && s[2] === s[4]) S('circle', { cx: s[1], cy: s[2], r: s[5] / 1.4, 'class': c + ' gb19-bonef' }, g);
        else S('line', { x1: s[1], y1: s[2], x2: s[3], y2: s[4], 'stroke-width': s[5], 'class': c }, g);
      });
      K.T(g, 50, 196, lb[0], 'gb19-t');
    });
    ro.set('<b>' + G[on][0] + ':</b> ' + G[on][1] + ', highlighted in all four. A human arm, a bat\'s wing, a whale\'s flipper and a bird\'s wing do very different jobs, yet they are built on the same plan of bones. Darwin argued that such shared plans, called <b>homologies</b>, are best explained by descent from a common ancestor.');
  }
  V.seg(F.ctl, { label: 'Light up', items: Object.keys(G).map(function (k) { return [k, G[k][0]]; }), value: on, change: function (v) { on = v; draw(); } });
  draw();
});
