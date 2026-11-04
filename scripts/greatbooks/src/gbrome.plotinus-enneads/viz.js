/* gbrome.plotinus-enneads: visual gb-emanation (gbe3, our own design). Plotinus's picture of reality as light spreading
   from a source: the One, Intellect, Soul, the world of bodies, and matter at the dim edge. Toggle "going out"
   (procession) and "coming back" (return); tap a ring to read about it. */
var LEVELS = [
  ['The One', 'Also called the Good. The first source of everything, beyond all names and beyond being. It gives without losing anything, as the sun gives light. (Ennead VI; V.1)'],
  ['Intellect', 'Greek <em>nous</em>: the divine Mind, which holds all the Forms, the perfect patterns Plato wrote of. Here knowing and being are one. (Ennead V)'],
  ['Soul', 'The World-Soul and every individual soul. Soul looks up to Intellect and gives life and order to bodies below it. (Ennead IV)'],
  ['Nature and bodies', 'The visible world, alive and beautiful because Soul shapes it. Its beauty is a trace of the beauty above. (Ennead III; I.6)'],
  ['Matter', 'The dimmest edge, where the light gives out. Plotinus calls matter a kind of absence: formless, receiving shape but having none of its own. (Ennead II.4; I.8)']
];
ML.viz.register('gb-emanation', function (el, opts, V) {
  var cur = opts.start == null ? 0 : opts.start, dir = 'out', S = 320, C = S / 2, RR = [24, 58, 92, 124, 152];
  var pid = V.uid('gbe');
  var stage = document.createElement('div'); stage.className = 'gb-stage gbe'; el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  V.seg(ctl, { label: 'Direction', items: [['out', 'Going out (procession)'], ['back', 'Coming back (return)']], value: dir, change: function (v) { dir = v; draw(); } });
  var ro = V.readout(el);
  function draw() {
    var h = '<svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="Plotinus: the One at the center, then Intellect, Soul, bodies and matter in rings"><defs><radialGradient id="' + pid + '"><stop offset="0" class="gbe-s0"/><stop offset="0.5" class="gbe-s1"/><stop offset="1" class="gbe-s2"/></radialGradient></defs>';
    h += '<rect width="' + S + '" height="' + S + '" class="gbe-bg"/><circle cx="' + C + '" cy="' + C + '" r="' + RR[4] + '" fill="url(#' + pid + ')"/>';
    for (var k = 4; k >= 0; k--) h += '<circle data-k="' + k + '" cx="' + C + '" cy="' + C + '" r="' + RR[k] + '" class="gbe-ring' + (k === cur ? ' on' : '') + '" tabindex="0" role="button" aria-label="' + LEVELS[k][0] + '"/>';
    for (k = 0; k < 5; k++) { var y = k === 0 ? C + 4 : C - (RR[k - 1] + RR[k]) / 2 + 4; h += '<text x="' + C + '" y="' + y + '" class="gbe-lab' + (k === cur ? ' on' : '') + (k === 0 ? ' one' : '') + '">' + LEVELS[k][0] + '</text>'; }
    [30, 150, 90].forEach(function (a) {
      var t = a * Math.PI / 180, r1 = 34, r2 = 146, x1 = C + r1 * Math.cos(t), y1 = C + r1 * Math.sin(t), x2 = C + r2 * Math.cos(t), y2 = C + r2 * Math.sin(t);
      if (dir === 'back') { var tx = x1, ty = y1; x1 = x2; y1 = y2; x2 = tx; y2 = ty; }
      var ang = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 9 * Math.cos(ang - 0.45), hy = y2 - 9 * Math.sin(ang - 0.45), jx = x2 - 9 * Math.cos(ang + 0.45), jy = y2 - 9 * Math.sin(ang + 0.45);
      h += '<path class="gbe-arrow ' + dir + '" d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + 'M' + hx.toFixed(1) + ' ' + hy.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + 'L' + jx.toFixed(1) + ' ' + jy.toFixed(1) + '"/>';
    });
    stage.innerHTML = h + '</svg>';
    Array.prototype.forEach.call(stage.querySelectorAll('.gbe-ring'), function (c) {
      var f = function () { cur = +c.getAttribute('data-k'); draw(); };
      c.addEventListener('click', f); c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
    });
    ro.set('<b>' + LEVELS[cur][0] + '.</b> ' + LEVELS[cur][1] + '<br><i>' + (dir === 'out' ? 'Going out: each level flows from the one above, like light from the sun, growing fainter with distance.' : 'Coming back: the soul turns inward and climbs, through virtue, beauty and contemplation, toward Intellect and the One.') + '</i>');
  }
  draw();
});
