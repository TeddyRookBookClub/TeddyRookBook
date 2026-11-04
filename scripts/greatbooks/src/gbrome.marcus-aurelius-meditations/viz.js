/* gbrome.marcus-aurelius-meditations: visual gb-view-from-above (gbe3, our own design). Marcus's exercise of seeing
   things from far above: zoom out from one person to the camp, the empire, the Earth and all of time. The person is a
   generic figure in the site's cartoon skin color. Thoughts are paraphrased from the Meditations, with book and section. */
var LV = [
  ['You', 'Within yourself', 'You can retire into yourself whenever you choose; nowhere is quieter than your own mind. (IV.3)'],
  ['Your tent', 'The start of the day', 'Begin the morning expecting to meet difficult people, and remember they are your kin: we are made to work together, like hands and feet. (II.1)'],
  ['The camp', 'Among the soldiers on the Danube', 'Do each task as if it were the last of your life, without carelessness, pretending or complaint. Marcus wrote parts of his notebook in army camps on the Danube. (II.5)'],
  ['The empire', 'Rome’s whole world', 'Asia and Europe are corners of the universe; the whole sea is a drop; a great mountain is a little clod. (VI.36)'],
  ['The Earth', 'A point in the universe', 'The whole earth is a point, and how small a nook of it is where you live, and how few will praise you. (IV.3)'],
  ['All of time', 'Ages before and after', 'Think of the times of Vespasian: people marrying, farming, flattering, quarreling, wishing for power. Their life is gone, and so will ours be. (IV.32)']
];
var K = 2.7;
ML.viz.register('gb-view-from-above', function (el, opts, V) {
  var lv = opts.level || 0, S = 300, C = S / 2;
  var stage = document.createElement('div'); stage.className = 'gb-stage gbva'; el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var ro = V.readout(el);
  V.slider(ctl, { label: 'Zoom out', min: 0, max: 5, step: 1, value: lv, fmt: function (v) { return LV[v][0]; }, input: function (v) { lv = v; draw(); } });
  function person(r) {
    var s = r / 40;
    return '<g transform="translate(' + C + ' ' + C + ') scale(' + s + ')"><path d="M-14 34 Q-14 6 0 6 Q14 6 14 34 Z" class="gbva-robe"/><circle cx="0" cy="-8" r="11" class="gbva-skin"/><path d="M-11 -11 Q0 -24 11 -11" class="gbva-hair"/></g>';
  }
  function draw() {
    var h = '<svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="The view from above, zoomed out to: ' + LV[lv][0] + '"><rect width="' + S + '" height="' + S + '" class="gbva-bg"/>';
    for (var k = 5; k >= 0; k--) {
      var r = 130 * Math.pow(K, k - lv);
      if (r > 220 || r < 1.2) continue;
      h += '<circle cx="' + C + '" cy="' + C + '" r="' + r.toFixed(1) + '" class="gbva-ring k' + k + (k === lv ? ' on' : '') + '"/>';
      if (r > 18 && k > 0) h += '<text x="' + C + '" y="' + (C - r + 14).toFixed(1) + '" class="gbva-lab' + (k === lv ? ' on' : '') + '">' + LV[k][0] + '</text>';
    }
    var r0 = 130 * Math.pow(K, -lv);
    if (r0 >= 2) h += person(r0); else h += '<circle cx="' + C + '" cy="' + C + '" r="1.6" class="gbva-dot"/>';
    if (lv > 0) h += '<text x="' + C + '" y="' + (C + Math.max(r0, 3) + 12).toFixed(1) + '" class="gbva-you">you</text>';
    stage.innerHTML = h + '</svg>';
    ro.set('<b>' + LV[lv][0] + ': ' + LV[lv][1] + '.</b> ' + LV[lv][2]);
  }
  draw();
});
