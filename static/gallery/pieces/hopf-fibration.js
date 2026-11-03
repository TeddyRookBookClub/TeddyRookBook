/* Hopf fibration, our own design: fibers q0·e^{it} over points of S², projected from S³ by (x1,x2,x3)/(1−x4). */
Gallery.piece('hopf-fibration', function (g) {
var M = Math, cos = M.cos, sin = M.sin, PI = M.PI, TAU = 2 * PI, D = PI / 180, SEG = 120, NB = 7, MAXF = 48;
var items = [], F = [], mesh = [], gy = 0.6, gp = 0.45, vy = 0.5, vp = 0.9, T = 0, spin = !g.reduced, flow = true, vill = false, mode = 'pt', dk = null, ver = 0, pk = '';
var wrap = g.el('div'), pa = g.el('div'), pb = g.el('div'), st = ';position:relative;min-width:0';
wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:.5rem';
pa.style.cssText = 'flex:1 1 220px' + st; pb.style.cssText = 'flex:3 1 320px' + st;
wrap.appendChild(pa); wrap.appendChild(pb); g.stage.appendChild(wrap);
var c1 = g.canvas({ aspect: 0.9, max: 250, min: 200, parent: pa });
var c2 = g.canvas({ aspect: 0.8, max: 460, min: 300, parent: pb });
pa.appendChild(g.el('span', 'gx-cap', 'Pick on the sphere S²')); pb.appendChild(g.el('span', 'gx-cap', 'Their fibers, from S³'));
function top() { return items[items.length - 1]; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function sph(th, ph) { return [sin(th) * cos(ph), sin(th) * sin(ph), cos(th)]; }
function polar(p) { return [M.acos(clamp(p[2], -1, 1)), M.atan2(p[1], p[0])]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function ang(a, b) { return M.acos(clamp(dot(a, b), -1, 1)); }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
// a point q0 = (a,b,c,d) of S³ (z1 = a+bi, z2 = c+di) whose Hopf image is the point with polar angle th, azimuth ph
function sec(th, ph) { var h = th / 2; return [cos(h), 0, -sin(h) * sin(ph), sin(h) * cos(ph)]; }
function at(q, t) { var C = cos(t), S = sin(t); return [q[0] * C - q[1] * S, q[0] * S + q[1] * C, q[2] * C + q[3] * S, q[3] * C - q[2] * S]; }
function far(p) { return dot(p, p) > 81; }
function proj(q) { var k = 1 / M.max(1e-4, 1 - q[3]); return [q[0] * k, q[1] * k, q[2] * k]; }
function circ(it, s) {
  if (!it.r) return it.c;
  var P = polar(it.c), t = P[0], f = P[1], e1 = [cos(t) * cos(f), cos(t) * sin(f), -sin(t)], e2 = [-sin(f), cos(f), 0], C = cos(it.r), S = sin(it.r);
  return [0, 1, 2].map(function (i) { return it.c[i] * C + S * (e1[i] * cos(s) + e2[i] * sin(s)); });
}
function q0(p) { var P = polar(p); return sec(M.min(P[0], 175 * D), P[1]); }
function build() {
  var n = 0, i; for (i = items.length - 1; i >= 0; i--) { n += items[i].n; if (n > MAXF) { items.splice(0, i + 1); break; } }
  F = []; mesh = [];
  items.forEach(function (it) {
    for (var k = 0; k < it.n; k++) {
      var p = circ(it, TAU * k / it.n), q = q0(p), pts = [];
      for (var j = 0; j <= SEG; j++) pts.push(proj(at(q, TAU * j / SEG)));
      F.push({ q: q, p: p, pts: pts, it: it, k: k });
    }
    if (!it.r || it !== top()) return;
    for (var m = 0; m < 12; m++) { var L = []; for (var s = 0; s <= 72; s++) L.push(proj(at(q0(circ(it, TAU * s / 72)), TAU * m / 12))); mesh.push(L); }
    if (it.c[2] > 0.999) { var h = M.min(it.r, 175 * D) / 2; for (var b = 0; b < 6; b++) { L = []; for (s = 0; s <= 60; s++) L.push(proj([cos(h) * cos(TAU * s / 60), cos(h) * sin(TAU * s / 60), sin(h) * cos(TAU * b / 6), sin(h) * sin(TAU * b / 6)])); mesh.push(L); } }
  });
  dk = null; ver++; stats(); g.redraw();
}
function paint(dark) { dk = dark; F.forEach(function (f) { var L = (dark ? 58 : 38) - 12 * f.p[2], hs = 'hsla(' + M.round(M.atan2(f.p[1], f.p[0]) / D) + ',70%,' + L.toFixed(0) + '%,'; f.cs = []; for (var b = 0; b < NB; b++) f.cs.push(hs + (0.4 + 0.6 * b / (NB - 1)).toFixed(2) + ')'); f.solid = hs + '1)'; }); }
function rot(v, y, p) { var x1 = v[0] * cos(y) - v[1] * sin(y), y1 = v[0] * sin(y) + v[1] * cos(y), cp = cos(p), sp = sin(p); return [x1, v[2] * cp + y1 * sp, v[2] * sp - y1 * cp]; }
function unrot(v, y, p) { var cp = cos(p), sp = sin(p), up = v[1] * cp + v[2] * sp, y1 = v[1] * sp - v[2] * cp; return [v[0] * cos(y) + y1 * sin(y), -v[0] * sin(y) + y1 * cos(y), up]; }
function link(A, B) { // Gauss's linking integral over the two polygons
  var s = 0, i, j, k; for (i = 0; i < SEG; i++) for (j = 0; j < SEG; j++) { var a = A[i], a2 = A[i + 1], b = B[j], b2 = B[j + 1], d = [], e = [], r = [];
    for (k = 0; k < 3; k++) { d.push(a2[k] - a[k]); e.push(b2[k] - b[k]); r.push((a[k] + a2[k] - b[k] - b2[k]) / 2); }
    var l = M.hypot(r[0], r[1], r[2]); s += dot(r, cross(d, e)) / (l * l * l); }
  return s / (4 * PI);
}
function bead(x, X, Y, r, f, s) { x.fillStyle = f; x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fill(); if (s) { x.strokeStyle = s; x.lineWidth = 1.5; x.stroke(); } }
function rnd(r) { return sph(M.acos(clamp(1 - 2 * r(), -0.94, 1)), TAU * r()); }
g.draw(function (col) {
  if (dk !== col.dark) paint(col.dark);
  var x = c1.ctx, W = c1.w, H = c1.h, R = M.min(W, H) * 0.42, cx = W / 2, cy = H / 2 + 6, i, key = [gy, gp, W, H, col.dark, ver].join();
  if (key !== pk) { pk = key;
  c1.clear(col.bg);
  x.fillStyle = col.a(col.green, 0.07); x.strokeStyle = col.muted; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, R, 0, TAU); x.fill(); x.stroke();
  var curve = function (fn, n, front, back) { var A = new Path2D(), B = new Path2D(), o = null; for (var j = 0; j <= n; j++) { var v = rot(fn(j / n), gy, gp), on = v[2] >= 0, X = cx + v[0] * R, Y = cy - v[1] * R;
    if (o === on) (on ? A : B).lineTo(X, Y); else (on ? A : B).moveTo(X, Y); o = on; } x.strokeStyle = front; x.stroke(A); if (back) { x.strokeStyle = back; x.stroke(B); } }
  x.lineWidth = 1;
  for (i = 1; i < 6; i++) curve(function (u) { return sph(i * 30 * D, u * TAU); }, 48, col.a(col.muted, 0.35), null);
  for (i = 0; i < 6; i++) curve(function (u) { return sph(u * PI, i * 30 * D); }, 24, col.a(col.muted, 0.35), null);
  var v = rot(N, gy, gp); if (v[2] > 0) { x.fillStyle = col.ink; x.font = '600 12px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText('N', cx + v[0] * R, cy - v[1] * R + 16); }
  items.forEach(function (it) { if (it.r) { x.lineWidth = 2.5; curve(function (u) { return circ(it, u * TAU); }, 72, col.ink, col.a(col.ink, 0.25)); } });
  F.forEach(function (f) { var v = rot(f.p, gy, gp), on = v[2] >= 0; bead(x, cx + v[0] * R, cy - v[1] * R, f.it.r ? 3.5 : 6, on ? f.solid : f.cs[0], on && col.bg); });
  }
  // 3D view
  x = c2.ctx; W = c2.w; H = c2.h; var k = M.min(W, H) * 0.19, ox = W / 2, oy = H / 2;
  c2.clear(col.bg);
  function scr(p) { var v = rot(p, vy, vp); return [ox + v[0] * k, oy - v[1] * k, v[2]]; }
  if (vill) { x.strokeStyle = col.a(col.muted, 0.3); x.lineWidth = 1; mesh.forEach(function (L) { x.beginPath(); var o = 0; L.forEach(function (p) { if (far(p)) { o = 0; return; } var v = scr(p); if (o) x.lineTo(v[0], v[1]); else x.moveTo(v[0], v[1]); o = 1; }); x.stroke(); }); }
  var paths = F.map(function (f) {
    var P = [], j, prev = null, pb2 = -1; for (j = 0; j < NB; j++) P.push(null);
    for (j = 0; j <= SEG; j++) { var p = f.pts[j], v = far(p) ? null : scr(p);
      if (v && prev) { var b = clamp(M.floor(((v[2] + prev[2]) / 2 + 2.2) / 4.4 * NB), 0, NB - 1); if (!P[b]) P[b] = new Path2D();
        if (b !== pb2) P[b].moveTo(prev[0], prev[1]); P[b].lineTo(v[0], v[1]); pb2 = b; } else pb2 = -1;
      prev = v; }
    return P; });
  for (var b = 0; b < NB; b++) F.forEach(function (f, n) { var P = paths[n][b]; if (!P) return; var hi = vill && f.it.r && f.it === top() && f.k === 0;
    x.globalAlpha = vill && !hi ? 0.3 : 1; x.strokeStyle = f.cs[b]; x.lineWidth = (hi ? 2.2 : 0.9) + 1.5 * b / (NB - 1); x.stroke(P); });
  x.globalAlpha = 1;
  if (flow) F.forEach(function (f) { var p = proj(at(f.q, T * 0.9 + f.k * 2.4)); if (far(p)) return; var v = scr(p); bead(x, v[0], v[1], 3.5, f.solid, col.bg); });
});
var o1 = g.out(), o2 = g.out();
function stats() {
  o1.innerHTML = 'Fibers drawn: <b>' + F.length + '</b>';
  var A = null, B = null; F.forEach(function (f) { if (!A) A = f; else if (!B && ang(A.p, f.p) > 0.05) B = f; });
  o2.innerHTML = B ? 'Linking number of two of them, computed: <b>' + g.fmt(M.abs(link(A.pts, B.pts)), 2) + '</b>' : 'Pick a second point.';
  var it = top(); if (it) sl.set(M.round((it.r || polar(it.c)[0]) / D));
}
function add(p, circle) {
  items.push(circle ? I(N, M.max(5, polar(p)[0] / D), 12) : I(p));
  build(); g.say(circle ? 'Added a latitude circle: its fibers make a torus.' : 'Added a point and its fiber.');
}
function I(c, r, n) { return { c: c, r: (r || 0) * D, n: n || 1 }; }
var N = [0, 0, 1], PRE = {
  two: function () { return [I(sph(50 * D, 0)), I(sph(115 * D, 140 * D))]; },
  lat: function () { return [I(N, 70, 16)]; },
  nest: function () { return [I(N, 30, 10), I(N, 62, 10), I(N, 95, 10)]; },
  great: function () { return [I(sph(40 * D, 30 * D), 90, 16)]; },
  rand: function () { for (var i = 0, L = []; i < 10; i++) L.push(I(rnd(M.random))); return L; }
};
var r1 = g.group(), r2 = g.group();
var sel = g.select({ label: 'Show', parent: r1, value: 'nest', options: [['two', 'Two points (a linked pair)'], ['lat', 'A latitude (one torus)'], ['nest', 'Nested tori'], ['great', 'A tilted great circle'], ['rand', 'Random points']],
  change: function (v) { items = PRE[v](); build(); g.say('Showing: ' + sel.options[sel.selectedIndex].text); } });
g.select({ label: 'Tapping the sphere adds', parent: r1, value: 'pt', options: [['pt', 'a point'], ['lat', 'a latitude circle']], change: function (v) { mode = v; } });
g.button('Add a random point', function () { add(rnd(M.random), false); }, { parent: r1 });
g.button('Clear', function () { items = []; build(); g.say('Cleared.'); }, { parent: r1 });
var sl = g.slider({ label: 'Last pick, from north', min: 0, max: 175, step: 1, value: 90, fmt: function (v) { return v + '°'; }, parent: r2,
  input: function (v) { var it = top(); if (!it) return; if (it.r) it.r = M.max(2, v) * D; else { var P = polar(it.c); it.c = sph(v * D, P[1]); } build(); } });
g.toggle('Villarceau view', vill, function (v) { vill = v; g.say(v ? 'Grid on. The bold fiber goes once around the hole and once through it.' : 'Grid off.'); g.redraw(); }, { parent: r2 });
g.toggle('Beads flow along the fibers', flow, function (v) { flow = v; g.redraw(); }, { parent: r2 });
g.toggle('Keep turning', spin, function (v) { spin = v; }, { parent: r2 });
g.loop(function (dt) { T += dt; if (spin) vy += dt * 0.15; g.redraw(); }, { stepSize: 0.2, parent: r2 });
var dr = null;
function hit(X, Y) { var R = M.min(c1.w, c1.h) * 0.42, u = (X - c1.w / 2) / R, v = (c1.h / 2 + 6 - Y) / R, d = u * u + v * v; return d > 1 ? null : unrot([u, v, M.sqrt(1 - d)], gy, gp); }
function grab(X, Y) { var p = hit(X, Y), best = null; if (!p) return null; items.forEach(function (it) { var e = it.r ? M.abs(ang(it.c, p) - it.r) : ang(it.c, p); if (e < 0.1) best = it; }); return best; }
g.drag(c1.el, {
  down: function (X, Y) { dr = { x: X, y: Y, m: false, it: grab(X, Y) }; },
  move: function (X, Y) { if (!dr) return; var dx = X - dr.x, dy = Y - dr.y; if (!dr.m && dx * dx + dy * dy < 40) return; dr.m = true;
    if (dr.it) { var p = hit(X, Y); if (p) { if (dr.it.r) dr.it.r = clamp(ang(dr.it.c, p), 2 * D, 175 * D); else dr.it.c = p; build(); } }
    else tg(dx * 0.01, -dy * 0.01);
    dr.x = X; dr.y = Y; },
  up: function (X, Y) { if (dr && !dr.m) { if (dr.it) { items.splice(items.indexOf(dr.it), 1); items.push(dr.it); build(); } else { var p = hit(X, Y); if (p) add(p, mode === 'lat'); } } dr = null; }
});
function keys(el, fn) { g.keys(el, { ArrowLeft: function () { fn(-0.15, 0); }, ArrowRight: function () { fn(0.15, 0); }, ArrowUp: function () { fn(0, -0.15); }, ArrowDown: function () { fn(0, 0.15); } }); }
function tg(a, b) { gy += a; gp = clamp(gp - b, -1.5, 1.5); g.redraw(); }
function tv(a, b) { vy += a; vp = clamp(vp - b, -1.5, 1.5); g.redraw(); }
keys(c1.el, tg);
var lv = null;
g.drag(c2.el, { down: function (X, Y) { lv = [X, Y]; }, move: function (X, Y) { tv((X - lv[0]) * 0.01, (lv[1] - Y) * 0.01); lv = [X, Y]; }, up: function () { lv = null; } });
keys(c2.el, tv);
c1.el.setAttribute('aria-label', 'The sphere S2. Tap to add a point, drag a point to move it, drag elsewhere or use arrow keys to turn it.');
c2.el.setAttribute('aria-label', 'The fibers of your points: circles in 3D space. Drag or use arrow keys to turn it.');
items = PRE.nest(); build();
});
