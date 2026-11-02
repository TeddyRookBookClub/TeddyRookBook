/* Math Gallery: the Koch snowflake and the Sierpinski triangle. Choose a shape and a level; the stats line gives the
   number of pieces, the perimeter and the area compared with level 0. Play steps up one level every 1.2 s, then starts
   over. The previous level is drawn faintly underneath so you can see what each step adds or removes. */
Gallery.piece('koch-sierpinski', function (g) {
  var c = g.canvas({ aspect: 0.86, max: 520, min: 320, label: 'A fractal shape at the chosen level' });
  var shape = 'koch', lev = 2, acc = 0;
  var MAX = { koch: 7, sier: 8 };
  function koch(n) {
    var r3 = Math.sqrt(3), pts = [[0, -1], [r3 / 2, 0.5], [-r3 / 2, 0.5]], k;
    for (k = 0; k < n; k++) {
      var q = [];
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length], dx = (b[0] - a[0]) / 3, dy = (b[1] - a[1]) / 3;
        var p1 = [a[0] + dx, a[1] + dy], p2 = [a[0] + 2 * dx, a[1] + 2 * dy];
        // the bump points outward: rotate (dx, dy) by -60 degrees (shape is drawn clockwise on screen)
        var tip = [p1[0] + dx * 0.5 + dy * r3 / 2, p1[1] + dy * 0.5 - dx * r3 / 2];
        q.push(a, p1, tip, p2);
      }
      pts = q;
    }
    return pts;
  }
  function stats() {
    var s;
    if (shape === 'koch') s = { pieces: 3 * Math.pow(4, lev), per: Math.pow(4 / 3, lev), area: 1 + 3 / 5 * (1 - Math.pow(4 / 9, lev)), what: 'sides' };
    else s = { pieces: Math.pow(3, lev), per: Math.pow(3 / 2, lev), area: Math.pow(3 / 4, lev), what: 'triangles' };
    st.innerHTML = 'Level <b>' + lev + '</b> · <b>' + g.fmt(s.pieces) + '</b> ' + s.what + ' · perimeter <b>× ' + s.per.toFixed(3) + '</b> · area <b>× ' + s.area.toFixed(4) + '</b>' +
      (shape === 'koch' ? ' (the limit is × 1.6)' : ' (the limit is 0)');
    return 'Level ' + lev + ': perimeter ' + s.per.toFixed(3) + ' times the start, area ' + s.area.toFixed(4) + ' times the start.';
  }
  var st = g.out();
  var L = g.loop(function (dt) { acc += dt; if (acc < 1.2) return; acc = 0; setLev(lev >= MAX[shape] ? 0 : lev + 1); }, { auto: false, stepSize: 1.2, stepText: 'Next level' });
  g.select({ label: 'Shape', options: [['koch', 'Koch snowflake'], ['sier', 'Sierpinski triangle']], value: shape, change: function (v) { shape = v; lv.input.max = MAX[v]; setLev(Math.min(lev, MAX[v])); } });
  var lv = g.slider({ label: 'Level', min: 0, max: MAX.koch, value: lev, input: setLev });
  function setLev(v) { lev = v; lv.set(v); g.redraw(); g.say(stats()); }

  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, R = Math.min(W, H) * 0.47, cx = W / 2, cy = H / 2 + R * (shape === 'koch' ? 0.02 : 0.12);
    c.clear(col.bg);
    function P(p) { return [cx + p[0] * R, cy + p[1] * R]; }
    if (shape === 'koch') {
      [lev ? lev - 1 : -1, lev].forEach(function (n, k) {
        if (n < 0) return; var pts = koch(n);
        x.beginPath(); pts.forEach(function (p, i) { var q = P(p); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }); x.closePath();
        if (k) { x.fillStyle = col.a(col.accent, 0.22); x.fill(); x.strokeStyle = col.accent; x.lineWidth = lev > 4 ? 1 : 2; x.stroke(); }
        else { x.strokeStyle = col.a(col.gold, 0.9); x.setLineDash([4, 4]); x.lineWidth = 1.2; x.stroke(); x.setLineDash([]); }
      });
    } else {
      var r3 = Math.sqrt(3), A = [0, -1], B = [r3 / 2, 0.5], C = [-r3 / 2, 0.5];
      var pa = P(A), pb = P(B), pc = P(C);
      x.fillStyle = col.a(col.gold, 0.18); x.beginPath(); x.moveTo(pa[0], pa[1]); x.lineTo(pb[0], pb[1]); x.lineTo(pc[0], pc[1]); x.closePath(); x.fill();
      x.fillStyle = col.accent; x.beginPath();
      (function tri(a, b, c3, n) {
        if (!n) { x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c3[0], c3[1]); x.closePath(); return; }
        var ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], bc = [(b[0] + c3[0]) / 2, (b[1] + c3[1]) / 2], ca = [(c3[0] + a[0]) / 2, (c3[1] + a[1]) / 2];
        tri(a, ab, ca, n - 1); tri(ab, b, bc, n - 1); tri(ca, bc, c3, n - 1);
      })(pa, pb, pc, lev);
      x.fill();
    }
    x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif';
    x.fillText(shape === 'koch' ? (lev ? 'Dashed: level ' + (lev - 1) : 'Level 0: a triangle') : 'Faint: the area removed so far', 10, 18);
  });
  stats();
});
