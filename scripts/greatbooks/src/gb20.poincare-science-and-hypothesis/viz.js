/* gb-geometries: one triangle, three worlds. An equilateral triangle with sides of a chosen length is drawn on a flat
   plane, on a sphere (sides bow outward, angles add to more than 180°) and on a saddle-shaped surface (sides bow
   inward, angles add to less than 180°). The angles are computed exactly:
     sphere   cos A = cos a / (1 + cos a)      saddle   cos A = cosh a / (1 + cosh a)      (a = side / radius of the world)
   Poincaré's point: experiments on small triangles can't tell these apart, and choosing one is a matter of convenience.
   Our own design. opts: world: 'flat' | 'sphere' | 'saddle'; side: 0.2–1.9; quiet: true hides the readout. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, DEG = 180 / M.PI;
  function angle(world, a) {
    if (world === 'sphere') return M.acos(M.cos(a) / (1 + M.cos(a))) * DEG;
    if (world === 'saddle') { var ch = (M.exp(a) + M.exp(-a)) / 2; return M.acos(ch / (1 + ch)) * DEG; }
    return 60;
  }
  V.register('gb-geometries', function (el, o) {
    o = o || {};
    var world = o.world || 'sphere', side = o.side == null ? 1.0 : +o.side;
    var c = V.canvas(el, { aspect: 1.7, min: 230, max: 340 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'World', items: [['flat', 'Flat'], ['sphere', 'Sphere'], ['saddle', 'Saddle']], value: world, change: function (v) { world = v; draw(); } });
    V.slider(ctl, { label: 'Side of the triangle, compared with the size of the world', min: 0.1, max: 1.9, step: 0.05, value: side, fmt: function (v) { return V.fmt(v, 2); }, input: function (v) { side = v; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h;
      g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, w, h); g.restore();
      var A = angle(world, side), sum = 3 * A, cx = w / 2, cy = h * 0.5, r = M.min(w * 0.3, h * 0.36);
      // the world's backdrop
      if (world === 'sphere') { g.fillStyle = k.blueSoft; g.beginPath(); g.arc(cx, cy, r * 1.35, 0, 2 * M.PI); g.fill(); }
      else if (world === 'saddle') {
        g.strokeStyle = k.grid; g.lineWidth = 1;
        for (var i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(cx - r * 1.6, cy + i * r * 0.28 - r * 0.25); g.quadraticCurveTo(cx, cy + i * r * 0.28 + r * 0.25, cx + r * 1.6, cy + i * r * 0.28 - r * 0.25); g.stroke(); }
      } else { g.strokeStyle = k.grid; g.lineWidth = 1; for (var j = -4; j <= 4; j++) { g.beginPath(); g.moveTo(cx + j * r * 0.35, cy - r * 1.2); g.lineTo(cx + j * r * 0.35, cy + r * 0.9); g.stroke(); g.beginPath(); g.moveTo(cx - r * 1.5, cy + j * r * 0.25); g.lineTo(cx + r * 1.5, cy + j * r * 0.25); g.stroke(); } }
      var P = [0, 1, 2].map(function (i) { var t = -M.PI / 2 + i * 2 * M.PI / 3; return [cx + r * M.cos(t), cy + r * M.sin(t)]; });
      var bow = (sum - 180) / 180 * r * 0.55; // outward for > 180, inward for < 180
      g.fillStyle = k.goldSoft; g.strokeStyle = k.green; g.lineWidth = 3; g.beginPath();
      P.forEach(function (p, i) {
        var q = P[(i + 1) % 3], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, nx = mx - cx, ny = my - cy, L = M.sqrt(nx * nx + ny * ny) || 1;
        if (i === 0) g.moveTo(p[0], p[1]);
        g.quadraticCurveTo(mx + nx / L * bow * 2, my + ny / L * bow * 2, q[0], q[1]);
      });
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = k.ink; g.font = '700 13px system-ui,sans-serif'; g.textAlign = 'center';
      P.forEach(function (p) { var dx = p[0] - cx, dy = p[1] - cy, L = M.sqrt(dx * dx + dy * dy); g.fillText(V.fmt(A, 1) + '°', p[0] + dx / L * 22, p[1] + dy / L * 22 + 4); });
      g.fillStyle = sum > 180.05 ? k.red : sum < 179.95 ? k.blue : k.green; g.font = '700 15px system-ui,sans-serif';
      g.fillText('Angles add to ' + V.fmt(sum, 1) + '°', cx, h - 10);
      c.cv.setAttribute('aria-label', 'An equilateral triangle in a ' + world + ' world; its angles add to ' + V.fmt(sum, 1) + ' degrees');
      var msg = world === 'flat' ? 'On a flat plane every triangle’s angles add to exactly 180°, however big it is. That is Euclid’s geometry.' :
        world === 'sphere' ? 'On a sphere the sides bow outward and the angles add to <b>more</b> than 180°. The extra, ' + V.fmt(sum - 180, 1) + '°, grows with the triangle’s area.' + (M.abs(side - 1.57) < 0.04 ? ' At this size each angle is 90°: the triangle covers one eighth of the sphere.' : '') :
        'On a saddle-shaped (hyperbolic) world the sides bow inward and the angles add to <b>less</b> than 180°: ' + V.fmt(180 - sum, 1) + '° short.';
      out.set(msg + ' Make the triangle small and all three worlds give nearly 180°, which is why, as Poincaré argued, measuring cannot force one geometry on us.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
