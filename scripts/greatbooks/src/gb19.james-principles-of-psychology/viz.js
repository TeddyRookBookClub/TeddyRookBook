/* gb-james-emotion: the order of events in an emotion, common sense versus James (and Lange). Uses ML.gb19kit.cards.
   gb-james-habit: an illustration (not data) of James's picture of habit: each repetition wears the path deeper and
   the act takes less effort and attention. Our own designs. */
ML.viz.register('gb-james-emotion', function (el, opts, V) {
  ML.gb19kit.cards(el, V, { label: 'Two orders of an emotion', layout: 'row', h: 160, set: opts.set || 'common', setLabel: 'Order', sets: [
    ['common', 'Common sense', [
      { t: 'You see a bear', s: 'something happens', html: 'Something frightening happens.' },
      { t: 'You feel afraid', s: 'the feeling', html: 'Common sense says the feeling of fear comes first...' },
      { t: 'You tremble and run', s: 'the body', html: '...and then the body reacts. James thought this order was wrong.' }
    ]],
    ['james', 'James\'s order', [
      { t: 'You see a bear', s: 'something happens', html: 'Something frightening happens.' },
      { t: 'You tremble and run', s: 'the body reacts', html: 'James: the body reacts at once, heart pounding, muscles tense, before you have time to think.' },
      { t: 'You feel afraid', s: 'feeling the body', html: 'The emotion is your feeling of those bodily changes. "We feel sorry because we cry, angry because we strike, afraid because we tremble," in his famous summary. Later research found that the body\'s state does shape emotion, but that how we read the situation matters too.' }
    ]]
  ] });
});
ML.viz.register('gb-james-habit', function (el, opts, V) {
  var K = ML.gb19kit, F = K.frame(el, 400, 170, 'A path worn deeper by repetition'), sv = F.svg, ro = V.readout(el), n = opts.n || 1;
  function draw() {
    K.clear(sv); var d = Math.min(40, 6 * Math.log(1 + n) * 2.2), eff = Math.round(100 / (1 + n / 6));
    K.S('rect', { x: 10, y: 20, width: 380, height: 90, rx: 10, 'class': 'gb19-ground-l' }, sv);
    K.S('path', { d: 'M20,' + (60) + ' C120,' + (60 - d) + ' 280,' + (60 + d) + ' 380,60', 'class': 'gb19-groove', 'stroke-width': 2 + d / 2.5 }, sv);
    K.person(sv, 20 + Math.min(360, n * 6), 52, 0.9);
    K.T(sv, 200, 130, 'times repeated: ' + n, 'gb19-t');
    K.S('rect', { x: 100, y: 140, width: 200, height: 10, rx: 3, 'class': 'gb19-box' }, sv);
    K.S('rect', { x: 100, y: 140, width: 2 * eff, height: 10, rx: 3, 'class': 'gb19-accf' }, sv);
    K.T(sv, 200, 165, 'effort and attention needed', 'gb19-s');
    ro.set('After <b>' + n + '</b> repetition' + (n > 1 ? 's' : '') + ', the path is worn deeper and the act needs less effort and attention (an illustration, not a measurement). James compared habit to a path or a fold in paper: "make our nervous system our ally instead of our enemy," he urged, by making useful actions automatic early.');
  }
  V.slider(F.ctl, { label: 'Repetitions', min: 1, max: 60, step: 1, value: n, input: function (v) { n = v; draw(); } });
  draw();
});
