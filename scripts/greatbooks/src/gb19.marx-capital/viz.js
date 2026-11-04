/* gb-workday: Marx's working day, split into "necessary" and "surplus" labor, with his rate of surplus value.
   His terms, our own design (uses ML.gb19kit). The lesson notes that most economists today do not accept this theory of value. */
ML.viz.register('gb-workday', function (el, opts, V) {
  var K = ML.gb19kit, F = K.frame(el, 400, 150, 'Marx\'s working day: necessary and surplus labor'), sv = F.svg, ro = V.readout(el);
  var day = opts.day || 12, nec = opts.nec || 6, sDay, sNec;
  function draw() {
    if (nec > day - 1) nec = day - 1;
    K.clear(sv); var x0 = 20, W = 360, u = W / 16, sur = day - nec, rate = Math.round(sur / nec * 100);
    K.T(sv, 200, 18, 'A ' + day + '-hour working day, in Marx\'s terms', 'gb19-t');
    K.S('rect', { x: x0, y: 40, width: nec * u, height: 36, rx: 4, 'class': 'gb19-mutf' }, sv);
    K.S('rect', { x: x0 + nec * u, y: 40, width: sur * u, height: 36, rx: 4, 'class': 'gb19-accf' }, sv);
    for (var h = 0; h <= 16; h++) { K.S('line', { x1: x0 + h * u, y1: 80, x2: x0 + h * u, y2: h % 2 ? 84 : 88, 'class': 'gb19-ink' }, sv); if (h % 2 === 0) K.T(sv, x0 + h * u, 100, h + 'h', 'gb19-s'); }
    K.T(sv, x0 + nec * u / 2, 63, nec + 'h necessary', 'gb19-onbar');
    if (sur > 0) K.T(sv, x0 + nec * u + sur * u / 2, 63, sur + 'h surplus', 'gb19-onbar');
    K.T(sv, 200, 130, 'rate of surplus value = ' + sur + ' ÷ ' + nec + ' = ' + rate + '%', 'gb19-t');
    ro.set('Marx\'s claim: in the first <b>' + nec + ' hours</b> the worker produces value equal to his wage ("necessary labor"); in the remaining <b>' + sur + ' hours</b> he produces "surplus value" that goes to the owner. Marx\'s rate of surplus value is ' + sur + '/' + nec + ' = <b>' + rate + '%</b>. Factory laws limiting the working day, he argued, cut into this surplus. Most economists since the 1870s explain wages and profits differently, through supply, demand and the marginal value of labor and capital.');
  }
  sDay = V.slider(F.ctl, { label: 'Working day', min: 8, max: 16, step: 1, value: day, fmt: function (v) { return v + 'h'; }, input: function (v) { day = v; if (nec > day - 1) { nec = day - 1; sNec.set(nec); } draw(); } });
  sNec = V.slider(F.ctl, { label: 'Necessary labor', min: 2, max: 10, step: 1, value: nec, fmt: function (v) { return v + 'h'; }, input: function (v) { nec = Math.min(v, day - 1); draw(); } });
  draw();
});
