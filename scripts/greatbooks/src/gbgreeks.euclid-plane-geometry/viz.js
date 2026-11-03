/* gbgreeks.euclid-plane-geometry: visuals gb-euclid-i1, gb-euclid-i47 (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

/* ---------- I.1: an equilateral triangle on a given line ---------- */
ML.viz.register('gb-euclid-i1', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.2, max: 420 }), ro = V.readout(el);
  var P = V.plane(c, { xmin: -3.2, xmax: 3.2, ymin: -2.3, ymax: 2.9, equal: true });
  var A = [-0.9, -0.2], Bp = [0.9, -0.2], step = 0, grow = 1, anim = null;
  var TXT = [
    '<b>Given:</b> a finite straight line AB. Drag A or B to make it any length.',
    '<b>Step 1.</b> With centre A and distance AB, draw a circle. <em>(Postulate 3)</em>',
    '<b>Step 2.</b> With centre B and distance BA, draw a second circle. <em>(Postulate 3)</em>',
    '<b>Step 3.</b> From C, where the circles cut one another, join CA and CB. <em>(Postulate 1)</em>',
    '<b>Step 4.</b> CA = AB and CB = BA, since each is a radius of a circle <em>(Definition 15)</em>. Things equal to the same thing are equal to one another <em>(Common Notion 1)</em>, so CA = CB. All three sides are equal: the triangle is equilateral.'
  ];
  function Cpt() { var mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2, dx = Bp[0] - A[0], dy = Bp[1] - A[1], k = Math.sqrt(3) / 2; return [mx - dy * k, my + dx * k]; }
  function dist(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }
  function arc(cx, cy, r, f, col) {
    var ctx = c.ctx, a0 = Math.atan2(0, 1); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
    ctx.arc(P.X(cx), P.Y(cy), r * (P.X(1) - P.X(0)), -a0, -a0 - f * 2 * Math.PI, true); ctx.stroke(); ctx.restore();
  }
  function tick(p, q, n, col) {
    var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    for (var i = 0; i < n; i++) { var o = (i - (n - 1) / 2) * 0.09; P.seg(mx + ux * o - uy * 0.1, my + uy * o + ux * 0.1, mx + ux * o + uy * 0.1, my + uy * o - ux * 0.1, { color: col, width: 2.2 }); }
  }
  function draw() {
    var k = V.colors(), r = dist(A, Bp), C = Cpt(); P.clear();
    if (step >= 1) arc(A[0], A[1], r, step === 1 ? grow : 1, k.blue);
    if (step >= 2) arc(Bp[0], Bp[1], r, step === 2 ? grow : 1, k.gold);
    if (step >= 3) { P.seg(C[0], C[1], A[0], A[1], { color: k.green, width: 3 }); P.seg(C[0], C[1], Bp[0], Bp[1], { color: k.green, width: 3 }); P.point(C[0], C[1], { color: 'green', r: 5 }); P.text('C', C[0], C[1], { dy: -16, bold: true, align: 'center', serif: true }); }
    P.seg(A[0], A[1], Bp[0], Bp[1], { color: k.ink, width: 3 });
    if (step >= 4) { tick(A, Bp, 1, k.red); tick(A, C, 1, k.red); tick(Bp, C, 1, k.red); }
    P.point(A[0], A[1], { color: 'red', r: 7 }); P.point(Bp[0], Bp[1], { color: 'red', r: 7 });
    P.text('A', A[0], A[1], { dx: -12, dy: 16, bold: true, serif: true, align: 'center' }); P.text('B', Bp[0], Bp[1], { dx: 12, dy: 16, bold: true, serif: true, align: 'center' });
    ro.set(TXT[step]);
  }
  function go(s) {
    step = Math.max(0, Math.min(4, s)); prev.disabled = step === 0; next.disabled = step === 4;
    if (anim) { anim.stop(); anim = null; }
    if (!RM && (step === 1 || step === 2)) { grow = 0; anim = V.loop(el, function (dt) { grow = Math.min(1, grow + dt * 1.2); draw(); if (grow >= 1 && anim) { anim.stop(); anim = null; } }); }
    else grow = 1;
    draw();
  }
  var prev = V.button(B.ctl, '◀ Back', function () { go(step - 1); });
  var next = V.button(B.ctl, 'Next step ▶', function () { go(step + 1); }, 'pri');
  V.button(B.ctl, 'Start over', function () { go(0); });
  V.drag(c.cv, {
    hit: function (px, py) { if (Math.hypot(px - P.X(A[0]), py - P.Y(A[1])) < 22) return 'A'; if (Math.hypot(px - P.X(Bp[0]), py - P.Y(Bp[1])) < 22) return 'B'; return null; },
    move: function (h, px, py) {
      var x = Math.max(-2.6, Math.min(2.6, P.x(px))), y = Math.max(-2, Math.min(0.6, P.y(py))), p = h === 'A' ? A : Bp, q = h === 'A' ? Bp : A;
      if (Math.hypot(x - q[0], y - q[1]) < 0.6) return; p[0] = x; p[1] = y; draw();
    }
  });
  c.onResize(function () { P.set({}); draw(); }); V.onTheme(draw); go(0);
});

/* ---------- I.47: the squares on the legs equal the square on the hypotenuse ---------- */
ML.viz.register('gb-euclid-i47', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 0.85, max: 520 }), ro = V.readout(el);
  var P = V.plane(c, { xmin: -1.25, xmax: 3.25, ymin: -2.2, ymax: 3.15, equal: true });
  var cl = 2, ang = 0.62, t = 0, ply = null; // BC = 2; ang = angle ABC; t in [0,3]: shear, shear, slide
  function geo() { var d = cl * Math.cos(ang) * Math.cos(ang), h = cl * Math.cos(ang) * Math.sin(ang); return { d: d, h: h }; }
  function lerp(a, b, u) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; }
  function left(g) { // square on AB carried through the three moves
    var d = g.d, h = g.h, s = Math.min(1, t), s2 = Math.max(0, Math.min(1, t - 1)), s3 = Math.max(0, Math.min(1, t - 2));
    var b0 = [0, 0], a0 = [d, h], v = [d, h], n = [-h, d], sh = (h / d) * s;
    var p3 = [n[0] + sh * v[0], n[1] + sh * v[1]], p4 = [d + n[0] + sh * v[0], h + n[1] + sh * v[1]];
    var pts = [b0, a0, p4, p3].map(function (p) { return [p[0], p[1] - (h / d) * p[0] * s2 * (t > 1 ? 1 : 0) - cl * s3]; });
    return pts;
  }
  function right(g) {
    var d = g.d, h = g.h, s = Math.min(1, t), s2 = Math.max(0, Math.min(1, t - 1)), s3 = Math.max(0, Math.min(1, t - 2));
    var C0 = [cl, 0], a0 = [d, h], w = [d - cl, h], m = [h, cl - d], sh = (h / (cl - d)) * s;
    var p3 = [cl + m[0] + sh * w[0], m[1] + sh * w[1]], p4 = [d + m[0] + sh * w[0], h + m[1] + sh * w[1]];
    return [C0, a0, p4, p3].map(function (p) { return [p[0], p[1] - (h / (cl - d)) * (cl - p[0]) * s2 * (t > 1 ? 1 : 0) - cl * s3]; });
  }
  function draw() {
    var k = V.colors(), g = geo(), A = [g.d, g.h]; P.clear();
    P.poly([[0, 0], [cl, 0], [cl, -cl], [0, -cl]], { color: k.ink, width: 2, fill: 'rgba(0,0,0,0)' });
    P.seg(g.d, g.h, g.d, -cl, { color: k.muted, width: 1.5, dash: [6, 5] });
    P.poly(left(g), { color: k.blue, width: 2, fill: k.blueSoft });
    P.poly(right(g), { color: k.gold, width: 2, fill: k.goldSoft });
    P.poly([[0, 0], [cl, 0], A], { color: k.ink, width: 3, fill: k.panel });
    var q = 0.13, ux = -g.d, uy = -g.h, L1 = Math.hypot(ux, uy), vx = cl - g.d, vy = -g.h, L2 = Math.hypot(vx, vy);
    ux /= L1; uy /= L1; vx /= L2; vy /= L2;
    P.poly([[A[0] + ux * q, A[1] + uy * q], [A[0] + (ux + vx) * q, A[1] + (uy + vy) * q], [A[0] + vx * q, A[1] + vy * q]], { color: k.ink, width: 1.5, close: false });
    P.text('B', 0, 0, { dx: -13, dy: -4, bold: true, serif: true, align: 'center' }); P.text('C', cl, 0, { dx: 13, dy: -4, bold: true, serif: true, align: 'center' });
    P.text('A', A[0], A[1], { dy: -16, bold: true, serif: true, align: 'center' }); P.point(A[0], A[1], { color: 'red', r: 7 });
    var ab = Math.hypot(g.d, g.h), ac = Math.hypot(cl - g.d, g.h), sc = 5 / cl; // read BC as 5 units
    var a2 = (ab * sc) * (ab * sc), b2 = (ac * sc) * (ac * sc);
    var stage = t <= 0 ? 'Drag A along the half circle: the angle at A stays right (that is III.31).' : t < 1 ? 'First move: each square leans over into a parallelogram on the same base and between the same parallels, so its area does not change (I.35, I.41).' : t < 2 ? 'Second move: each parallelogram leans again, keeping its upright sides, until it is a rectangle standing on BC. Same base, same parallels, same area.' : t < 3 ? 'Third move: each figure slides straight down, unchanged.' : 'The two squares exactly fill the square on BC: the blue one makes the rectangle on the left of the dotted line, the gold one the rectangle on the right.';
    ro.set(stage + ' <br>With BC = 5: AB² ≈ <b style="color:' + k.blue + '">' + V.fmt(a2, 2) + '</b>, AC² ≈ <b style="color:' + k.gold + '">' + V.fmt(b2, 2) + '</b>, sum = <b>' + V.fmt(a2 + b2, 2) + '</b> = BC² = 25.');
  }
  var sl = V.slider(B.ctl, { label: 'Move the squares', min: 0, max: 3, step: 0.01, value: 0, fmt: function (v) { return v < 0.01 ? 'start' : v > 2.99 ? 'done' : Math.round(v / 3 * 100) + '%'; }, input: function (v) { t = v; if (ply) { ply.stop(); ply = null; } draw(); } });
  V.button(B.ctl, RM ? 'Show the end' : 'Play', function () {
    if (RM) { t = 3; sl.set(3); draw(); return; }
    if (ply) { ply.stop(); ply = null; return; } if (t >= 3) t = 0;
    ply = V.loop(el, function (dt) { t = Math.min(3, t + dt * 0.6); sl.set(t); draw(); if (t >= 3 && ply) { ply.stop(); ply = null; } });
  }, 'pri');
  V.button(B.ctl, 'Reset', function () { if (ply) { ply.stop(); ply = null; } t = 0; sl.set(0); draw(); });
  V.drag(c.cv, {
    hit: function (px, py) { var g = geo(); return Math.hypot(px - P.X(g.d), py - P.Y(g.h)) < 24 ? 1 : null; },
    move: function (h, px, py) { var x = P.x(px) - cl / 2, y = Math.max(0.05, P.y(py)), a = Math.atan2(y, x); var th = Math.max(0.5, Math.min(Math.PI - 0.5, a)); ang = th / 2; draw(); }
  });
  c.onResize(function () { P.set({}); draw(); }); V.onTheme(draw); draw();
});
