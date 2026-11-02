/* Math Gallery: the Lorenz attractor. Two points start 0.001 apart and follow the Lorenz equations (RK4, step 0.004);
   each leaves a trail. Drag (or arrow keys on the picture) to turn the view; it turns slowly by itself while playing. */
Gallery.piece('lorenz', function (g) {
  var c = g.canvas({ aspect: 0.72, max: 560, min: 300, label: 'The Lorenz attractor drawn in 3D. Drag or use the arrow keys to turn it.' });
  var S = 10, R = 28, B = 8 / 3, H = 0.004, N = 5000, yaw = 0.6, pitch = 0.25, spin = true, P, tr, t;
  function f(p) { return [S * (p[1] - p[0]), p[0] * (R - p[2]) - p[1], p[0] * p[1] - B * p[2]]; }
  function step(p) {
    var a = f(p), b = f([p[0] + a[0] * H / 2, p[1] + a[1] * H / 2, p[2] + a[2] * H / 2]), q = f([p[0] + b[0] * H / 2, p[1] + b[1] * H / 2, p[2] + b[2] * H / 2]), d = f([p[0] + q[0] * H, p[1] + q[1] * H, p[2] + q[2] * H]);
    for (var i = 0; i < 3; i++) p[i] += H / 6 * (a[i] + 2 * b[i] + 2 * q[i] + d[i]);
  }
  function reset() { P = [[1, 1, 20], [1.001, 1, 20]]; tr = [[], []]; t = 0; for (var i = 0; i < 2; i++) tr[i].push(P[i].slice()); g.redraw(); }
  function adv(n) { for (var k = 0; k < n; k++) { for (var i = 0; i < 2; i++) { step(P[i]); tr[i].push(P[i].slice()); if (tr[i].length > N) tr[i].shift(); } t += H; } }
  var L = g.loop(function (dt) { adv(Math.max(1, Math.round(dt / H * 0.6))); if (spin && !drag) yaw += dt * 0.15; g.redraw(); }, { stepSize: 0.25 });
  g.button('↺ Restart', function () { reset(); g.say('Restarted.'); });
  g.slider({ label: 'ρ (rho)', min: 10, max: 40, step: 1, value: R, input: function (v) { R = v; reset(); g.say('rho is ' + v + '.'); } });
  g.toggle('Turn slowly', true, function (v) { spin = v; });
  var st = g.out();
  g.bar.appendChild(g.el('p', 'gx-hint', 'Drag the picture to turn it, or focus it and use the arrow keys.'));
  var drag = null;
  g.drag(c.el, { down: function (x, y) { drag = [x, y, yaw, pitch]; }, move: function (x, y) { if (!drag) return; yaw = drag[2] + (x - drag[0]) * 0.01; pitch = Math.max(-1.4, Math.min(1.4, drag[3] + (y - drag[1]) * 0.01)); g.redraw(); }, up: function () { drag = null; } });
  function turn(dy, dp) { yaw += dy; pitch = Math.max(-1.4, Math.min(1.4, pitch + dp)); g.redraw(); }
  g.keys(c.el, { ArrowLeft: function () { turn(-0.12, 0); }, ArrowRight: function () { turn(0.12, 0); }, ArrowUp: function () { turn(0, -0.12); }, ArrowDown: function () { turn(0, 0.12); } });

  g.draw(function (col) {
    var x = c.ctx, W = c.w, Hh = c.h, sc = Math.min(W, Hh * 1.25) / 52, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    function pr(p) { var X = p[0], Y = p[1], Z = p[2] - 25, x1 = X * cy - Y * sy, y1 = X * sy + Y * cy; return [W / 2 + x1 * sc, Hh / 2 - (Z * cp - y1 * sp) * sc]; }
    c.clear(col.bg);
    // axes from the origin of the picture, short
    x.lineWidth = 1; x.font = '12px system-ui,sans-serif'; x.fillStyle = col.muted;
    [[[12, 0, 25], 'x'], [[0, 12, 25], 'y'], [[0, 0, 37], 'z']].forEach(function (a) { var o = pr([0, 0, 25]), e = pr(a[0]); x.strokeStyle = col.grid; x.beginPath(); x.moveTo(o[0], o[1]); x.lineTo(e[0], e[1]); x.stroke(); x.fillText(a[1], e[0] + 3, e[1]); });
    // the two centers C± (unstable when rho > 24.74)
    if (R > 1) { var q = Math.sqrt(B * (R - 1)); [[q, q, R - 1], [-q, -q, R - 1]].forEach(function (p) { var s = pr(p); x.strokeStyle = col.muted; x.beginPath(); x.moveTo(s[0] - 5, s[1]); x.lineTo(s[0] + 5, s[1]); x.moveTo(s[0], s[1] - 5); x.lineTo(s[0], s[1] + 5); x.stroke(); }); }
    var cols = [col.accent, col.orange];
    for (var k = 0; k < 2; k++) {
      var T = tr[k], n = T.length, seg = 25;
      x.lineWidth = k ? 1.4 : 1.8;
      for (var i = 1; i < n; i += seg) {
        x.strokeStyle = col.a(cols[k], 0.15 + 0.85 * i / n); x.beginPath(); var a = pr(T[i - 1]); x.moveTo(a[0], a[1]);
        for (var j = i; j < Math.min(n, i + seg); j++) { var b = pr(T[j]); x.lineTo(b[0], b[1]); }
        x.stroke();
      }
      var h = pr(T[n - 1]); x.fillStyle = cols[k]; x.beginPath(); x.arc(h[0], h[1], 5, 0, 7); x.fill();
    }
    var d = Math.hypot(P[0][0] - P[1][0], P[0][1] - P[1][1], P[0][2] - P[1][2]);
    st.innerHTML = 'Time <b>' + t.toFixed(1) + '</b> · the two points are <b>' + (d < 0.01 ? d.toFixed(5) : d.toFixed(2)) + '</b> apart';
    x.fillStyle = col.ink; x.font = '13px system-ui,sans-serif';
    x.fillStyle = cols[0]; x.fillRect(10, 12, 14, 4); x.fillStyle = col.ink; x.fillText('Start (1, 1, 20)', 30, 18);
    x.fillStyle = cols[1]; x.fillRect(10, 30, 14, 4); x.fillStyle = col.ink; x.fillText('Start (1.001, 1, 20)', 30, 36);
  });
  reset(); if (g.reduced) adv(3000);
});
