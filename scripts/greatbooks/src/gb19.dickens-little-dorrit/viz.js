/* gb-circumlocution: Dickens's Circumlocution Office as a game that never ends: every form sends you to another department.
   Our own design (uses ML.gb19kit). */
ML.viz.register('gb-circumlocution', function (el, opts, V) {
  var K = ML.gb19kit, F = K.frame(el, 400, 250, 'The Circumlocution Office: a loop of departments'), sv = F.svg, ro = V.readout(el);
  var OF = ['Front desk', 'Department of Forms', 'Barnacle Junior', 'Records Room', 'Secretary\'s Office', 'Mr. Tite Barnacle'];
  var SAY = ['Have you an appointment? Fill in this form and take it upstairs.', 'This form is the wrong form. Take the right form to Barnacle Junior.', '"Upon my soul you mustn\'t come into the place saying you want to know, you know!" (Dickens\'s own words.) Try the Records Room.', 'That file has been sent to the Secretary. Ask there.', 'The Secretary is engaged. Leave your name and apply to Mr. Tite Barnacle.', 'Mr. Barnacle is not at liberty. Kindly call again, beginning at the front desk.'];
  var cur = 0, visits = 0;
  function draw() {
    K.clear(sv); var cx = 200, cy = 125, R = 88;
    K.S('circle', { cx: cx, cy: cy, r: R, 'class': 'gb19-route-todo' }, sv);
    OF.forEach(function (o, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / OF.length, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      var g = K.S('g', { 'class': 'gb19-it' + (i === cur ? ' gb19-on' : '') }, sv), w = o.length * 6.4 + 14;
      K.S('rect', { x: x - w / 2, y: y - 12, width: w, height: 24, rx: 7, 'class': 'gb19-box' }, g);
      K.T(g, x, y + 4, o, 'gb19-t');
    });
    K.T(sv, cx, cy - 6, 'Forms filed: ' + visits, 'gb19-t');
    K.T(sv, cx, cy + 12, 'Answers received: 0', 'gb19-s');
    ro.set('<b>' + OF[cur] + ':</b> ' + SAY[cur] + ' <span class="gb19-s">(Lines in our words except where marked.)</span>' + (visits >= OF.length ? ' <i>You have been all the way round ' + Math.floor(visits / OF.length) + ' time' + (visits >= 2 * OF.length ? 's' : '') + '. Dickens: the Office had mastered "the art of perceiving—HOW NOT TO DO IT."</i>' : ''));
  }
  V.button(F.ctl, 'File the form', function () { visits++; cur = (cur + 1) % OF.length; draw(); });
  V.button(F.ctl, 'Start again', function () { visits = 0; cur = 0; draw(); });
  draw();
});
