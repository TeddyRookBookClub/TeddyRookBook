/* gb-veblen-spoons: Veblen's two spoons (Chapter VI), through ML.gb20kit.cards.
   gb-veblen-demand: an ordinary demand curve against a "Veblen effect" curve, with a price slider. Illustrative numbers. */
ML.viz.register('gb-veblen-spoons', function (el, opts, V) {
  ML.gb20kit.cards(el, V, { label: 'Two spoons', layout: 'row', h: 150, items: [
    { t: 'Handmade silver spoon', s: '10 to 20 dollars in 1899', html: 'Wrought by hand. It stirs and serves well. Its price shows that its owner can afford to pay far more than usefulness requires.' },
    { t: 'Machine-made spoon', s: 'a fraction of the price', html: 'Made in a factory of the same silver, or of aluminum. It does the job just as well. Veblen: "not ordinarily more serviceable" is the handmade one.' },
    { t: 'What the difference shows', s: 'Veblen\'s claim', html: 'The extra cost buys mostly <b>honor</b>, not use: the spoon displays wealth. Critics answer that craftsmanship, durability and beauty are real reasons too.' }
  ] });
});
ML.viz.register('gb-veblen-demand', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 240, 'Price and quantity: an ordinary good and a status good'), sv = F.svg, ro = V.readout(el);
  var g = opts.g || 'veblen', p = opts.p || 40;
  function qOrd(pr) { return 100 - pr; } function qVeb(pr) { return pr < 60 ? 20 + pr * 0.8 : 68 - (pr - 60) * 1.2; }
  function X(q) { return 50 + q * 3.2; } function Y(pr) { return 210 - pr * 1.9; }
  function draw() {
    K.clear(sv);
    K.arrow(sv, 50, 210, 386, 210); K.arrow(sv, 50, 210, 50, 14);
    K.T(sv, 220, 234, 'quantity bought per week', 'gb20-s'); var t = K.T(sv, 18, 110, 'price', 'gb20-s'); t.setAttribute('transform', 'rotate(-90 18 110)');
    ['ord', 'veblen'].forEach(function (k) {
      var d = '', f = k === 'ord' ? qOrd : qVeb; for (var pr = 5; pr <= 95; pr += 5) d += (pr === 5 ? 'M' : 'L') + X(f(pr)).toFixed(1) + ',' + Y(pr).toFixed(1);
      K.S('path', { d: d, 'class': k === g ? 'gb20-route' : 'gb20-route-todo' }, sv);
    });
    var f = g === 'ord' ? qOrd : qVeb, q = f(p);
    K.S('line', { x1: 50, y1: Y(p), x2: X(q), y2: Y(p), 'class': 'gb20-edge gb20-dash' }, sv);
    K.S('circle', { cx: X(q), cy: Y(p), r: 6, 'class': 'gb20-dot gb20-dot-on' }, sv);
    var up = g === 'veblen' && p < 60;
    ro.set('At a price of <b>\\$' + p + '</b>, about <b>' + Math.round(q) + '</b> sold a week. ' + (g === 'ord' ? 'An <b>ordinary good</b>: as the price rises, people buy less. This is the usual law of demand.' :
      (up ? 'A <b>status good</b> showing the "Veblen effect": here a higher price makes it <i>more</i> wanted, because the price itself is part of what it displays.' : 'Even a status good has limits: at very high prices, fewer people can or will pay, and sales fall.')) + ' (Illustrative numbers, not data.)');
  }
  V.seg(F.ctl, { label: 'Good', items: [['ord', 'Ordinary good'], ['veblen', 'Status good']], value: g, change: function (v) { g = v; draw(); } });
  V.slider(F.ctl, { label: 'Price', min: 5, max: 95, step: 5, value: p, fmt: function (v) { return v + ' dollars'; }, input: function (v) { p = v; draw(); } });
  draw();
});
