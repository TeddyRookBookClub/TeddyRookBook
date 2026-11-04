/* gb-orwell-barn: the rules painted on the barn wall in Animal Farm, at the start and later on, in OUR OWN WORDS (the novel is
   under copyright, so nothing here quotes it). Toggle the time; tap a rule to see how it changed. */
ML.viz.register('gb-orwell-barn', function (el, opts, V) {
  var K = ML.gb20kit, W = 400, H = 250;
  var R = [
    { a: 'Two-legged creatures are enemies.', b: 'Two-legged creatures are enemies.', html: 'Unchanged in words, but by the end the pigs trade, dine and play cards with the human farmers.' },
    { a: 'Four legs or wings make a friend.', b: 'Four legs or wings make a friend.', html: 'Unchanged in words. The sheep are later taught a new chant that praises two legs instead of four.' },
    { a: 'No animal may wear clothes.', b: 'No animal may wear clothes.', html: 'Unchanged in words, yet at the end the pigs wear the farmer\'s clothes.' },
    { a: 'No animal may sleep in a bed.', b: 'No animal may sleep in a bed with sheets.', html: 'Changed when the pigs move into the farmhouse beds. Squealer says the rule was only ever about sheets.' },
    { a: 'No animal may drink alcohol.', b: 'No animal may drink too much alcohol.', html: 'Changed after the pigs find the farmer\'s whisky.' },
    { a: 'No animal may kill another.', b: 'No animal may kill another without a reason.', html: 'Changed after Napoleon has animals executed for "confessing" to plots.' },
    { a: 'All animals are equal.', b: 'All are equal, but some count for more.', html: 'At the end the whole list is painted out and replaced by one slogan that keeps the word "equal" and empties it of meaning.' }
  ];
  var when = opts.when || 'a', cur = -1;
  var F = K.frame(el, W, H, 'The barn wall with the farm\'s seven rules, early and late in the story'), sv = F.svg, ro = V.readout(el);
  function draw() {
    K.clear(sv);
    K.S('rect', { x: 10, y: 8, width: W - 20, height: H - 16, rx: 6, 'class': 'gbl-barn' }, sv);
    for (var i = 1; i < 8; i++) K.S('line', { x1: 10, y1: 8 + i * 29, x2: W - 10, y2: 8 + i * 29, 'class': 'gbl-plank' }, sv);
    K.T(sv, W / 2, 30, when === 'a' ? 'The rules, just after the Rebellion' : 'The rules, years later', 'gbl-paint gbl-paint-h');
    R.forEach(function (r, i) {
      var y = 60 + i * 26, changed = r.a !== r.b, g = K.S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') }, sv);
      K.S('rect', { x: 14, y: y - 15, width: W - 28, height: 22, 'class': 'gb20-hit' }, g);
      K.T(g, 28, y, (i + 1) + '. ' + (when === 'a' ? r.a : r.b), 'gbl-paint' + (when === 'b' && changed ? ' gbl-paint-new' : '') + (i === cur ? ' gbl-paint-on' : ''), 'start');
      K.clickable(g, function () { cur = i; draw(); }, 'Rule ' + (i + 1));
    });
    if (cur >= 0) { var r = R[cur]; ro.set('<b>Rule ' + (cur + 1) + '.</b> At first: <i>' + r.a + '</i> Later: <i>' + r.b + '</i> ' + r.html); }
    else ro.set('Switch between early and late, then tap a rule. The changed ones are marked. (Our own wording, not Orwell\'s.)');
  }
  V.seg(F.ctl, { label: 'When', items: [['a', 'Early'], ['b', 'Later']], value: when, change: function (v) { when = v; draw(); } });
  draw();
});
