/* gb-gatsby-map: the places of The Great Gatsby on a sketch map of Long Island and New York, stop by stop (not to scale;
   our own summaries). A green light blinks at the end of Daisy's dock unless reduced motion is on. Uses ML.gb20kit.route. */
ML.viz.register('gb-gatsby-map', function (el, opts, V) {
  var K = ML.gb20kit;
  K.route(el, V, { label: 'Sketch map of West Egg, East Egg, the valley of ashes and New York in The Great Gatsby', w: 400, h: 260,
    bg: [
      { pts: [[0, 150], [60, 140], [120, 150], [160, 120], [200, 130], [250, 115], [330, 120], [400, 110], [400, 260], [0, 260]] },
      { pts: [[110, 30], [170, 26], [205, 60], [170, 92], [118, 90], [100, 60]] },
      { pts: [[230, 40], [300, 30], [330, 62], [300, 96], [240, 94], [222, 64]] },
      { pts: [[0, 0], [70, 0], [72, 120], [0, 130]] },
      { pts: [[130, 170], [210, 168], [212, 200], [128, 204]], cls: 'gbl-ash' }
    ],
    labels: [[[200, 108], 'the bay'], [[150, 40], 'West Egg'], [[276, 46], 'East Egg'], [[34, 40], 'New York'], [[170, 222], 'valley of ashes']],
    stops: [
      { p: [150, 70], t: 'West Egg, 1922', n: 'West Egg', html: 'Nick Carraway rents a small house next to Gatsby\'s enormous mansion. West Egg is the less fashionable side, home to "new money."', dx: -10, dy: -14 },
      { p: [268, 66], t: 'East Egg', n: 'East Egg', html: 'Nick dines with his cousin Daisy and her husband Tom Buchanan in their grand house. At the end of their dock shines a green light.', dx: 10, dy: -14 },
      { p: [170, 186], t: 'The valley of ashes', n: 'Valley of ashes', html: 'On the way to the city lies a gray dumping ground watched over by the huge eyes of an old billboard. Here lives George Wilson, a garage owner whose wife, Myrtle, Tom secretly sees.', dx: 10, dy: 22 },
      { p: [154, 60], t: 'Gatsby\'s parties', n: 'The parties', html: 'Hundreds of strangers come to Gatsby\'s weekend parties. Few have met their host, and rumors fly about who he is.', dx: -10, dy: -10 },
      { p: [140, 76], t: 'The reunion', n: 'Tea at Nick\'s', html: 'Nick invites Daisy to tea, and Gatsby appears. He shows her his house and his shirts, and for a while the five years since 1917 seem to melt away.', dx: -10, dy: 18 },
      { p: [40, 70], t: 'The Plaza Hotel', n: 'The Plaza', html: 'On the hottest day of summer, the group quarrels in a hotel suite in New York. Tom exposes Gatsby\'s shady fortune, and Daisy draws back.', dx: 10, dy: 0 },
      { p: [176, 182], t: 'The drive home', n: 'The accident', html: 'Driving back through the valley of ashes, Gatsby\'s car, with Daisy at the wheel, strikes and kills Myrtle Wilson. Gatsby decides to take the blame.', dx: 10, dy: -10 },
      { p: [150, 70], t: 'The end of summer', n: 'Gatsby alone', html: 'Myrtle\'s grieving husband shoots Gatsby at his pool. Almost no one comes to the funeral. Nick, sickened by the careless rich, goes home to the Midwest.', dx: -10, dy: -14 }
    ] });
  var sv = el.querySelector('svg'); if (!sv) return;
  var dot = K.S('circle', { cx: 298, cy: 58, r: 4, 'class': 'gbl-green' }, sv), on = true;
  function keep() { if (dot.parentNode !== sv) sv.appendChild(dot); }   // the route redraws its svg on every step
  el.addEventListener('click', function () { setTimeout(keep, 0); });
  el.addEventListener('keydown', function () { setTimeout(keep, 0); });
  if (!(typeof V.reduced === 'function' ? V.reduced() : V.reduced)) {
    var iv = setInterval(function () { if (!el.isConnected) { clearInterval(iv); return; } on = !on; dot.setAttribute('opacity', on ? '1' : '0.3'); }, 900);
  }
});
