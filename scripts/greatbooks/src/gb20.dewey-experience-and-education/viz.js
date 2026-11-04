/* gb-dewey-grid: Dewey's two principles of experience, continuity and interaction, as two axes. Example experiences
   (our own, not Dewey's) are placed by our judgment to illustrate his idea. */
ML.viz.register('gb-dewey-grid', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 250, 'Experiences placed on continuity and interaction'), sv = F.svg, ro = V.readout(el), k = opts.k || 0;
  var EX = [
    ['Cooking pancakes, then doubling the recipe', 0.85, 0.85, 'It meets the child\'s interest and the real kitchen (interaction), and it leads on to fractions, measuring and planning (continuity). Educative.'],
    ['Copying a list of dates for a test, then forgetting it', 0.15, 0.3, 'Little connects it to the learner, and it leaves behind no new power, perhaps only a dislike of history. Mis-educative, in Dewey\'s word.'],
    ['A garden club that sparks questions about seeds', 0.8, 0.7, 'Each week builds on the last and opens new questions. High continuity.'],
    ['A lecture far above the students\' level', 0.35, 0.1, 'The outer material is fine, but it does not meet what the learners bring, so there is little interaction.'],
    ['Free play with no guidance that goes nowhere', 0.2, 0.65, 'It may fit the child\'s mood (interaction), but it does not lead anywhere (continuity). Dewey warned that activity is not enough.'],
    ['A thrilling game that teaches a habit of cheating', 0.3, 0.8, 'Lively and engaging, yet it builds a bad habit for the future: an experience can be enjoyable and still mis-educative.']
  ];
  function X(c) { return 60 + c * 320; } function Y(i) { return 210 - i * 180; }
  function draw() {
    K.clear(sv);
    K.S('rect', { x: X(0.5), y: Y(1), width: 160, height: 90, 'class': 'gb20-chip-on' }, sv);
    K.T(sv, X(0.75), Y(1) + 84, 'educative', 'gb20-t');
    K.arrow(sv, 60, 210, 386, 210); K.arrow(sv, 60, 210, 60, 24);
    K.T(sv, 225, 238, 'continuity: leads to further growth →', 'gb20-s');
    var t = K.T(sv, 20, 120, 'interaction: fits learner and situation →', 'gb20-s'); t.setAttribute('transform', 'rotate(-90 20 120)');
    EX.forEach(function (e, i) {
      var g = K.S('g', { 'class': 'gb20-it' }, sv);
      K.S('circle', { cx: X(e[1]), cy: Y(e[2]), r: 12, 'class': 'gb20-hit' }, g);
      K.S('circle', { cx: X(e[1]), cy: Y(e[2]), r: i === k ? 8 : 5, 'class': i === k ? 'gb20-dot gb20-dot-on' : 'gb20-dot' }, g);
      K.T(g, X(e[1]), Y(e[2]) - 12, String(i + 1), 'gb20-s');
      K.clickable(g, function () { k = i; draw(); }, e[0]);
    });
    ro.set('<b>' + (k + 1) + '. ' + EX[k][0] + '.</b> ' + EX[k][3]);
  }
  V.button(F.ctl, '← Back', function () { k = (k + EX.length - 1) % EX.length; draw(); });
  V.button(F.ctl, 'Next →', function () { k = (k + 1) % EX.length; draw(); });
  draw();
});
