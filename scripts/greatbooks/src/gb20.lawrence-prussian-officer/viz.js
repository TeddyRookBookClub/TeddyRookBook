/* gb-lawrence-heat: the movement of "The Prussian Officer" as a march across a landscape, from the hot road to the cool,
   distant mountains (our own drawing and summaries, without violent detail). A heat bar rises as the story goes on. */
ML.viz.register('gb-lawrence-heat', function (el, opts, V) {
  var K = ML.gb20kit, W = 400, H = 170;
  var steps = [
    { t: 'The march', heat: 0.55, x: 40, html: 'Soldiers march thirty kilometers along a white, hot road through a shining valley. The mountains stand far ahead, pale blue and still.' },
    { t: 'The captain', heat: 0.65, x: 100, html: 'We learn the story behind the march: a proud, cold captain and his young orderly, a simple country soldier whose ease and freedom the captain resents.' },
    { t: 'The torment', heat: 0.8, x: 160, html: 'The captain\'s resentment turns to cruelty. The orderly is bewildered and ashamed, and can tell no one.' },
    { t: 'The breaking point', heat: 1, x: 220, html: 'In the heat of the next day\'s march, the tension breaks in a sudden act of violence in a forest clearing.' },
    { t: 'Toward the mountains', heat: 0.9, x: 290, html: 'The orderly wanders alone, feverish and lost in the hot woods, longing for the cool snow of the mountains he can see.' },
    { t: 'The end', heat: 0.3, x: 350, html: 'Both men are dead. The story closes on the image of the far mountains, cool and untouched.' }
  ];
  var F = K.frame(el, W, H, 'The story\'s movement from the hot road to the distant mountains'), sv = F.svg, ro = V.readout(el), cur = 0;
  function draw() {
    K.clear(sv);
    var st = steps[cur];
    K.S('rect', { x: 0, y: 0, width: W, height: H, 'class': 'gb20-paperbg' }, sv);
    K.S('rect', { x: 0, y: 0, width: W, height: 120, 'class': 'gbl-glare', opacity: (0.15 + 0.5 * st.heat).toFixed(2) }, sv);
    K.S('path', { d: 'M180,80 L230,34 L262,62 L300,22 L346,66 L380,40 L400,56 L400,80 Z', 'class': 'gbl-mtn' }, sv);
    K.S('path', { d: 'M290,32 L300,22 L311,33 Z M222,42 L230,34 L238,42 Z M372,46 L380,40 L387,46 Z', 'class': 'gbl-snow' }, sv);
    K.S('rect', { x: 0, y: 80, width: W, height: 90, 'class': 'gb20-land' }, sv);
    K.S('path', { d: 'M0,150 Q120,128 220,118 T400,96', 'class': 'gbl-road' }, sv);
    for (var i = 0; i < 6; i++) { var tx = 60 + i * 56; K.S('circle', { cx: tx, cy: 100 + (i % 2) * 6, r: 9, 'class': 'gbl-pine' }, sv); }
    K.person(sv, st.x, 128 - st.x * 0.07, 1.1, 'gb20-robe');
    K.S('rect', { x: 14, y: 14, width: 10, height: 60, rx: 4, 'class': 'gb20-box' }, sv);
    K.S('rect', { x: 14, y: 14 + 60 * (1 - st.heat), width: 10, height: 60 * st.heat, rx: 4, 'class': 'gbl-heat' }, sv);
    K.T(sv, 19, 88, 'heat', 'gb20-s');
    K.T(sv, W / 2, 16, (cur + 1) + '. ' + st.t, 'gb20-t gb20-halo');
    ro.set('<b>' + (cur + 1) + '. ' + st.t + '.</b> ' + st.html);
  }
  V.button(F.ctl, '← Back', function () { cur = Math.max(0, cur - 1); draw(); });
  V.button(F.ctl, 'Next →', function () { cur = Math.min(steps.length - 1, cur + 1); draw(); });
  draw();
});
