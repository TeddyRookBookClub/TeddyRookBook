/* gb-keynes-multiplier: the simple spending multiplier. $100 of new spending; each round people spend the fraction c
   (the marginal propensity to consume) and save the rest. Bars show each round; the total approaches 100 / (1 - c). */
ML.viz.register('gb-keynes-multiplier', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 220, 'Spending round by round'), sv = F.svg, ro = V.readout(el), c = opts.c || 0.75, n = 12;
  function draw() {
    K.clear(sv);
    var tot = 0, sav = 0, bw = 340 / n;
    for (var i = 0; i < n; i++) {
      var amt = 100 * Math.pow(c, i), h = amt * 1.6; tot += amt; sav += amt * (1 - c);
      K.S('rect', { x: 40 + i * bw, y: 180 - h, width: bw - 4, height: h, rx: 2, 'class': 'gb20-accf' }, sv);
      K.S('rect', { x: 40 + i * bw, y: 180 - h, width: bw - 4, height: h * (1 - c), rx: 2, 'class': 'gb20-mutf' }, sv);
      if (i < 6) K.T(sv, 40 + i * bw + bw / 2 - 2, 176 - h, String(Math.round(amt)), 'gb20-s');
    }
    K.S('line', { x1: 36, y1: 180, x2: 384, y2: 180, 'class': 'gb20-ink' }, sv);
    K.T(sv, 210, 198, 'rounds of spending →', 'gb20-s');
    K.S('rect', { x: 60, y: 206, width: 10, height: 10, 'class': 'gb20-accf' }, sv); K.T(sv, 74, 215, 'income received', 'gb20-s', 'start');
    K.S('rect', { x: 200, y: 206, width: 10, height: 10, 'class': 'gb20-mutf' }, sv); K.T(sv, 214, 215, 'part saved', 'gb20-s', 'start');
    var m = 1 / (1 - c);
    ro.set('With an MPC of <b>' + c.toFixed(2) + '</b>, each person spends ' + Math.round(c * 100) + '¢ of every new dollar. After ' + n + ' rounds, total income has risen by about <b>\\$' + Math.round(tot) + '</b>; in the limit it reaches \\$100 × 1 ÷ (1 − ' + c.toFixed(2) + ') = <b>\\$' + Math.round(100 * m) + '</b>, a multiplier of ' + (Math.round(m * 100) / 100) + '. The leaks into saving end the chain. Economists still argue about how big real multipliers are.');
  }
  V.slider(F.ctl, { label: 'Marginal propensity to consume (MPC)', min: 0.5, max: 0.9, step: 0.05, value: c, fmt: function (v) { return v.toFixed(2); }, input: function (v) { c = v; draw(); } });
  draw();
});
