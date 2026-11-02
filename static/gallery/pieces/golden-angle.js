/* Math Gallery: the golden angle and sunflower seeds (Vogel's model). Seed k sits at angle k × (turn angle) and
   distance proportional to √k from the center, so every seed gets the same share of area. Change the turn angle and
   watch gaps or spokes appear. Coloring seeds by k mod a Fibonacci number shows the spirals. Play grows the head. */
Gallery.piece('golden-angle', function (g) {
  var c = g.canvas({ aspect: 0.86, max: 540, min: 320, label: 'A sunflower head of seeds placed by a fixed turn angle' });
  var GA = 360 * (1 - 2 / (1 + Math.sqrt(5))), ang = GA, N = 600, shown = N, modK = 0;
  var st = g.out();
  // Play grows the head from the center; once full, the next Play or Step starts again from the center
  g.loop(function (dt) { if (shown >= N) shown = 0; shown = Math.min(N, shown + Math.max(1, Math.round(dt * N / 4))); g.redraw(); if (shown >= N) return false; }, { auto: false, stepSize: 1 / 4, stepText: 'Grow a step' });
  var sa = g.slider({ label: 'Turn angle', min: 90, max: 180, step: 0.01, value: ang, fmt: function (v) { return v.toFixed(2) + '°'; }, input: function (v) { ang = v; pre.value = ''; g.redraw(); } });
  var PRE = [['', 'Pick an angle…'], ['g', 'The golden angle, 137.51°'], ['137.3', '137.30° (a bit less)'], ['137.7', '137.70° (a bit more)'], ['120', '120° (1/3 turn)'], ['144', '144° (2/5 turn)'], ['137.5', '137.50° (close to golden)'], ['135', '135° (3/8 turn)']];
  var pre = g.select({ label: 'Try', options: PRE, value: 'g', change: function (v) { if (!v) return; ang = v === 'g' ? GA : +v; sa.set(ang); g.redraw(); } });
  g.slider({ label: 'Seeds', min: 50, max: 2000, step: 50, value: N, input: function (v) { N = v; shown = v; g.redraw(); } });
  g.select({ label: 'Color', options: [['0', 'All the same'], ['13', 'Every 13th seed'], ['21', 'Every 21st seed'], ['34', 'Every 34th seed'], ['55', 'Every 55th seed']], value: '0', change: function (v) { modK = +v; g.redraw(); } });

  // best rational approximations p/q of the turn fraction, to describe it in words
  function frac(t) { for (var q = 1; q <= 400; q++) { var p = Math.round(t * q), d = Math.abs(t - p / q); if (d < 1e-6) return [p, q, true]; if (d < 0.001) return [p, q, false]; } return null; }

  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 10, s = R / Math.sqrt(N), dot = Math.max(1.6, s * 0.48), rad = ang * Math.PI / 180;
    c.clear(col.bg);
    for (var k = 1; k <= shown; k++) {
      var r = s * Math.sqrt(k), t = k * rad;
      x.fillStyle = modK ? (k % modK === 0 ? col.red : col.a(col.accent, 0.55)) : (col.dark ? '#e2c072' : '#7a5a1c');
      if (!modK && k > N * 0.7) x.fillStyle = col.dark ? '#c9a24f' : '#5b4214';
      x.beginPath(); x.arc(cx + r * Math.cos(t), cy + r * Math.sin(t), dot * (0.75 + 0.25 * Math.sqrt(k / N)), 0, 7); x.fill();
    }
    var f = ang / 360, q = frac(f);
    st.innerHTML = 'Turn: <b>' + ang.toFixed(2) + '°</b> = <b>' + f.toFixed(4) + '</b> of a full turn · ' + (Math.abs(ang - GA) < 0.006 ? 'the golden angle: no fraction fits it well' : !q ? 'no small fraction fits it closely' : q[2] ? 'exactly <b>' + q[0] + '/' + q[1] + '</b> of a turn, so seeds line up in ' + q[1] + ' straight spokes' : 'close to <b>' + q[0] + '/' + q[1] + '</b> of a turn, so you see about ' + q[1] + ' spiral arms');
  });
});
