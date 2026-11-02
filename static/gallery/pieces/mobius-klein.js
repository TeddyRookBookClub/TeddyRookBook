/* The Möbius strip and the Klein bottle: a paint brush runs along the surface without lifting off or crossing an edge.
   On a plain ring it paints one side only; on a Möbius strip or a Klein bottle it ends up painting "both" sides, because
   there is only one. Our own drawing: the surface is cut into small patches, each lit, sorted back to front. */
Gallery.piece('mobius-klein', function (g) {
  var M = Math, PI = M.PI, kind = 'mobius', s = 0, yaw = 0.6, pitch = 0.9, auto = true, Q = [], NU, NV;
  var c = g.canvas({ aspect: 0.72, max: 480, min: 280, label: 'A surface with a paint brush moving around it' });
  var SURF = {
    ring: { nu: 64, nv: 6, v: [-1, 1], one: false, f: function (u, v) { return [M.cos(u), M.sin(u), v * 0.32]; } },
    mobius: { nu: 72, nv: 8, v: [-1, 1], one: true, f: function (u, v) { var r = 1 + 0.38 * v * M.cos(u / 2); return [r * M.cos(u), r * M.sin(u), 0.38 * v * M.sin(u / 2)]; } },
    klein: { nu: 64, nv: 22, v: [0, 2 * PI], one: true, f: function (u, v) { // the "figure 8" Klein bottle (it passes through itself in 3D)
      var h = M.cos(u / 2) * M.sin(v) - M.sin(u / 2) * M.sin(2 * v), r = 1.6 + 0.62 * h;
      return [r * M.cos(u) * 0.5, r * M.sin(u) * 0.5, 0.5 * 0.62 * (M.sin(u / 2) * M.sin(v) + M.cos(u / 2) * M.sin(2 * v))]; } }
  };
  function mesh() {
    var S = SURF[kind], i, j; NU = S.nu; NV = S.nv; Q = [];
    for (i = 0; i < NU; i++) for (j = 0; j < NV; j++) {
      var u0 = 2 * PI * i / NU, u1 = 2 * PI * (i + 1) / NU, v0 = S.v[0] + (S.v[1] - S.v[0]) * j / NV, v1 = S.v[0] + (S.v[1] - S.v[0]) * (j + 1) / NV;
      Q.push({ u: (u0 + u1) / 2, p: [S.f(u0, v0), S.f(u1, v0), S.f(u1, v1), S.f(u0, v1)] });
    }
  }
  function view(p) { // turn by yaw (about z) and pitch (about x)
    var cy = M.cos(yaw), sy = M.sin(yaw), cp = M.cos(pitch), sp = M.sin(pitch);
    var x = p[0] * cy - p[1] * sy, y = p[0] * sy + p[1] * cy, z = p[2];
    return [x, y * cp - z * sp, y * sp + z * cp];
  }
  function painted(q, front) { // the brush has passed this face?  front: side A; back: side B
    var S = SURF[kind], lap = 2 * PI;
    if (front) return q.u < s;
    return S.one ? q.u < s - lap : false;
  }
  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, k = M.min(W, H) * 0.34, L = [0.3, -0.5, 0.8], ln = M.sqrt(0.98);
    c.clear(col.bg);
    var list = Q.map(function (q) {
      var v = q.p.map(view), a = [v[2][0] - v[0][0], v[2][1] - v[0][1], v[2][2] - v[0][2]], b = [v[3][0] - v[1][0], v[3][1] - v[1][1], v[3][2] - v[1][2]];
      var n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nl = M.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1;
      var front = n[2] < 0, lit = M.abs(n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / nl / ln;
      return { v: v, z: (v[0][2] + v[1][2] + v[2][2] + v[3][2]) / 4, front: front, lit: lit, q: q };
    });
    list.sort(function (A, B) { return A.z - B.z; });
    var base = col.dark ? [150, 165, 156] : [205, 214, 208], pa = col.dark ? [108, 199, 154] : [0, 110, 60];
    list.forEach(function (o) {
      var on = painted(o.q, o.front), cc = on ? pa : base, f = 0.45 + 0.55 * o.lit;
      x.fillStyle = 'rgb(' + M.round(cc[0] * f) + ',' + M.round(cc[1] * f) + ',' + M.round(cc[2] * f) + ')';
      x.beginPath();
      o.v.forEach(function (p, i) { var X = W / 2 + p[0] * k, Y = H / 2 - p[1] * k; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); });
      x.closePath(); x.fill(); x.strokeStyle = x.fillStyle; x.lineWidth = 0.6; x.stroke();
    });
    // the brush: a dot on the middle line of the surface where it is now
    var S = SURF[kind], u = s % (2 * PI), bp = view(S.f(u, kind === 'klein' ? 0.001 : 0));
    if (s > 0 && s < (S.one ? 4 * PI : 2 * PI)) { x.fillStyle = col.red; x.strokeStyle = col.bg; x.lineWidth = 2; x.beginPath(); x.arc(W / 2 + bp[0] * k, H / 2 - bp[1] * k, 6, 0, 7); x.fill(); x.stroke(); }
  });
  function stats() {
    var tot = 2 * Q.length, n = 0;
    Q.forEach(function (q) { if (painted(q, true)) n++; if (painted(q, false)) n++; });
    laps.innerHTML = 'Brush laps: <b>' + g.fmt(s / (2 * PI), 2) + '</b>';
    pct.innerHTML = 'Surface painted: <b>' + M.round(100 * n / tot) + '%</b>';
  }
  function reset() { s = g.reduced ? M.min(SURF[kind].one ? 4 * PI : 2 * PI, 2 * PI * 1.3) : 0; mesh(); stats(); g.redraw(); }
  var row = g.group();
  g.select({ label: 'Surface', parent: row, value: kind, options: [['ring', 'A plain ring (two sides)'], ['mobius', 'Möbius strip'], ['klein', 'Klein bottle']], change: function (v) { kind = v; reset(); } });
  g.button('Start the brush again', reset, { parent: row });
  g.toggle('Keep turning', auto, function (v) { auto = v; }, { parent: row });
  var Lp = g.loop(function (dt) {
    var end = SURF[kind].one ? 4 * PI : 2 * PI;
    if (s < end) { s = M.min(end, s + dt * 1.1); stats(); if (s >= end) g.say(SURF[kind].one ? 'Done: the brush painted the whole surface. There was only one side.' : 'Done: one side is painted and the other side is still bare.'); }
    if (auto) yaw += dt * 0.25;
    g.redraw();
  }, { stepSize: 0.4, parent: g.group() });
  var laps = g.out(), pct = g.out();
  var last = null;
  g.drag(c.el, { down: function (X, Y) { last = [X, Y]; }, move: function (X, Y) { yaw += (X - last[0]) * 0.01; pitch = M.max(-1.5, M.min(1.5, pitch + (Y - last[1]) * 0.01)); last = [X, Y]; g.redraw(); }, up: function () { last = null; } });
  g.keys(c.el, { ArrowLeft: function () { yaw -= 0.15; g.redraw(); }, ArrowRight: function () { yaw += 0.15; g.redraw(); }, ArrowUp: function () { pitch = M.min(1.5, pitch + 0.15); g.redraw(); }, ArrowDown: function () { pitch = M.max(-1.5, pitch - 0.15); g.redraw(); } });
  c.el.setAttribute('aria-label', 'A surface with a paint brush moving around it. Drag or use the arrow keys to turn it.');
  reset();
});
