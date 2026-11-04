/* gbrome.augustine-city-of-god: visual gb-two-cities (gbe3, our own design). Augustine's two cities as two strands
   running, intertwined, through the six ages of history he lists at the end of the City of God (XXII.30), to the
   seventh, the eternal rest. Tap an age. Summaries are ours; book numbers point to where Augustine discusses them. */
var AGES = [
  ['Adam to the Flood', 'Cain builds a city; Abel, a pilgrim on earth, builds none. From here on Augustine follows two lines of people, two cities. (Book XV)'],
  ['The Flood to Abraham', 'Noah’s ark is, for Augustine, a figure of the city of God. The tower of Babel shows the earthly city’s pride. (Books XV–XVI)'],
  ['Abraham to David', 'God’s promise to Abraham begins a people. In the earthly city, the great empire of Assyria rises. (Books XVI, XVIII)'],
  ['David to the exile', 'Jerusalem, its kings and prophets. Rome is founded, which Augustine calls a second Babylon in the West. (Books XVII–XVIII)'],
  ['The exile to Christ', 'Return from Babylon; the last prophets. Rome grows into an empire. (Book XVIII)'],
  ['From Christ to the end', 'The age we live in, says Augustine: the Church spreads among the nations, and the two cities are mixed together until the last judgment. (Books XVIII–XX)'],
  ['The seventh day', 'Not an age of history but its end: the eternal rest and peace of the city of God, “where we shall rest and see, see and love, love and praise.” (Book XXII)']
];
ML.viz.register('gb-two-cities', function (el, opts, V) {
  var cur = opts.start == null ? 5 : opts.start, W = 460, H = 190, x0 = 12, cw = (W - 2 * x0) / 7;
  var stage = document.createElement('div'); stage.className = 'gb-stage gbtc'; el.appendChild(stage);
  var ro = V.readout(el);
  function strand(ph, cls) {
    var d = '', end = x0 + cw * 6;
    for (var x = x0; x <= end; x += 4) { var y = 92 + 26 * Math.sin((x - x0) / cw * Math.PI + ph); d += (x === x0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1); }
    return '<path class="gbtc-s ' + cls + '" d="' + d + '"/>';
  }
  function draw() {
    var h = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="The two cities through the seven ages, after Augustine">';
    for (var i = 0; i < 7; i++) {
      var x = x0 + i * cw;
      h += '<rect class="gbtc-col' + (i === cur ? ' on' : '') + (i === 6 ? ' rest' : '') + '" data-i="' + i + '" x="' + (x + 1) + '" y="28" width="' + (cw - 2) + '" height="128" rx="8" tabindex="0" role="button" aria-label="Age ' + (i + 1) + ': ' + AGES[i][0] + '"/>';
      h += '<text class="gbtc-n' + (i === cur ? ' on' : '') + '" x="' + (x + cw / 2) + '" y="20">' + (i + 1) + '</text>';
    }
    h += strand(0, 'god') + strand(Math.PI, 'earth');
    h += '<circle cx="' + (x0 + cw * 6.5) + '" cy="92" r="16" class="gbtc-rest"/>';
    h += '<g class="gbtc-key"><line x1="' + x0 + '" y1="176" x2="' + (x0 + 22) + '" y2="176" class="gbtc-s god"/><text x="' + (x0 + 28) + '" y="180">city of God: love of God</text><line x1="' + (x0 + 210) + '" y1="176" x2="' + (x0 + 232) + '" y2="176" class="gbtc-s earth"/><text x="' + (x0 + 238) + '" y="180">earthly city: love of self</text></g>';
    stage.innerHTML = h + '</svg>';
    Array.prototype.forEach.call(stage.querySelectorAll('.gbtc-col'), function (r) {
      var f = function () { cur = +r.getAttribute('data-i'); draw(); var n = stage.querySelector('.gbtc-col[data-i="' + cur + '"]'); if (n) n.focus(); };
      r.addEventListener('click', f); r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
    });
    ro.set('<b>' + (cur < 6 ? 'Age ' + (cur + 1) : 'The end') + ': ' + AGES[cur][0] + '.</b> ' + AGES[cur][1]);
  }
  draw();
});
