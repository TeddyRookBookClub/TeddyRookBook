/* gb-freud-mind: Freud's id, ego and superego as three voices in everyday situations (our own examples and drawing).
   Uses ML.gb20kit (defined by gb20.freud-interpretation-of-dreams). */
ML.viz.register('gb-freud-mind', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 200, 'Three voices in Freud\'s picture of the mind'), sv = F.svg, ro = V.readout(el);
  var SC = {
    cookie: ['One cookie left, and your sister has not had one', 'I want it. Eat it now!', 'Taking it would be selfish. Shame on you.', 'Split it in half, or ask first.'],
    homework: ['Homework is due, and a friend asks you to play', 'Play! Homework is boring.', 'You must never put fun before duty.', 'Finish the math first, then play for an hour.'],
    angry: ['Someone knocks over your block tower', 'Knock theirs down too!', 'Good children never feel angry.', 'Say "That made me mad," and build it again.']
  };
  var key = opts.s || 'cookie', cur = 2;
  var P = [['Id', 'the "It": wants it now', 70, 120], ['Superego', 'the "Over-I": the inner judge', 330, 120], ['Ego', 'the "I": finds a way', 200, 60]];
  function draw() {
    K.clear(sv); var s = SC[key];
    K.T(sv, 200, 190, s[0], 'gb20-s');
    K.arrow(sv, 112, 112, 160, 80); K.arrow(sv, 288, 112, 240, 80);
    P.forEach(function (p, i) {
      var g = K.S('g', { 'class': 'gb20-it' + (i === cur ? ' gb20-on' : '') }, sv);
      K.S('rect', { x: p[2] - 62, y: p[3] - 26, width: 124, height: 52, rx: 10, 'class': 'gb20-box' }, g);
      K.person(g, p[2] - 44, p[3] + 2, 1.4, i === 2 ? 'gb20-robe2' : 'gb20-robe');
      K.T(g, p[2] + 10, p[3] - 4, p[0], 'gb20-t'); K.T(g, p[2] + 10, p[3] + 12, p[1].split(':')[1].trim(), 'gb20-s');
      K.clickable(g, function () { cur = i; draw(); }, p[0]);
    });
    var who = P[cur];
    ro.set('<b>' + who[0] + ' (' + who[1] + ') says:</b> "' + s[cur + 1] + '" ' + (cur === 2 ? 'In Freud\'s picture the ego must answer both the id and the superego, and the real world too.' : 'Tap the other voices to hear them.'));
  }
  V.seg(F.ctl, { label: 'Situation', items: [['cookie', 'Last cookie'], ['homework', 'Homework'], ['angry', 'Angry']], value: key, change: function (v) { key = v; draw(); } });
  draw();
});
