/* gb-pirandello-stage: the stage of Six Characters in Search of an Author, with the acting company on one side and the six
   characters on the other (our own drawing and summaries; generic figures in the site's cartoon skin color). */
ML.viz.register('gb-pirandello-stage', function (el, opts, V) {
  var K = ML.gb20kit, W = 420, H = 230;
  var who = [
    { g: 'co', t: 'The Manager', html: 'The director of the company. He is irritated at first, then curious, and finally tries to stage the characters\' story himself, with his own actors.' },
    { g: 'co', t: 'The Leading Lady', html: 'An actress who is asked to play the Stepdaughter. The Stepdaughter laughs at her: no actress can be her.' },
    { g: 'co', t: 'The Leading Man', html: 'The actor asked to play the Father. His elegant acting looks false beside the real Father.' },
    { g: 'ch', t: 'The Father', html: 'The characters\' spokesman. He argues that a character is more alive than an actor, because a character is always "somebody" and never changes.' },
    { g: 'ch', t: 'The Mother', html: 'Dressed in mourning, she barely speaks. She suffers through the story again each time it is told.' },
    { g: 'ch', t: 'The Stepdaughter', html: 'Proud and angry, she wants their painful story played out in full, so that everyone can see the Father\'s part in it.' },
    { g: 'ch', t: 'The Son', html: 'He refuses to take part. He says he is a character who has not been "realized" and wants nothing to do with the drama.' },
    { g: 'ch', t: 'The Boy', html: 'A silent teenager who hardly speaks. He is part of the double tragedy at the end.' },
    { g: 'ch', t: 'The Child', html: 'A little girl of four. She is part of the double tragedy at the end, which leaves the actors unsure whether it was real.' }
  ];
  var F = K.frame(el, W, H, 'The stage, with the acting company on the left and the six characters on the right'), sv = F.svg, ro = V.readout(el), cur = -1, side = 'all';
  function draw() {
    K.clear(sv);
    K.S('rect', { x: 0, y: 0, width: W, height: H, 'class': 'gb20-paperbg' }, sv);
    K.S('path', { d: 'M10,190 L410,190 L380,214 L40,214 Z', 'class': 'gbl-stage' }, sv);
    K.S('path', { d: 'M0,0 L60,0 Q40,90 52,186 L0,186 Z', 'class': 'gbl-curtain' }, sv);
    K.S('path', { d: 'M420,0 L360,0 Q380,90 368,186 L420,186 Z', 'class': 'gbl-curtain' }, sv);
    K.T(sv, 120, 30, 'The acting company', 'gb20-s');
    K.T(sv, 285, 30, 'The six characters', 'gb20-s');
    K.S('line', { x1: 205, y1: 46, x2: 205, y2: 186, 'class': 'gbl-divide' }, sv);
    var xs = { co: [84, 128, 172], ch: [222, 251, 280, 309, 333, 351] }, n = { co: 0, ch: 0 };
    who.forEach(function (p, i) {
      var x = xs[p.g][n[p.g]++], small = p.t === 'The Child' ? 0.85 : p.t === 'The Boy' ? 1.05 : 1.3;
      var y = 186 - 26 * small, g = K.S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') + (side !== 'all' && side !== p.g ? ' gbl-dim' : '') }, sv);
      K.S('rect', { x: x - 16, y: y - 26 * small, width: 32, height: 30 + 40 * small, rx: 6, 'class': 'gb20-hit' }, g);
      K.person(g, x, y, small * 1.2, p.g === 'co' ? 'gb20-robe' : 'gb20-robe2');
      if (i === cur) K.S('circle', { cx: x, cy: y - 34 * small, r: 3, 'class': 'gb20-accf' }, g);
      K.clickable(g, function () { cur = i; draw(); }, p.t);
    });
    ro.set(cur >= 0 ? '<b>' + who[cur].t + '.</b> ' + who[cur].html : 'Actors are rehearsing a play when six people walk in, saying they are characters their author left unfinished. Tap anyone on stage.');
  }
  V.seg(F.ctl, { label: 'Show', items: [['all', 'Everyone'], ['co', 'The actors'], ['ch', 'The characters']], value: side, change: function (v) { side = v; draw(); } });
  draw();
});
