/* A small 2D rigid-body engine for the Siege game: boxes and circles, with friction, stacking and
   warm starting. The box-box collision and the sequential-impulse solver follow the design of
   Box2D-Lite by Erin Catto (zlib licence). y points up; units are metres, kilograms and seconds. */
(function (root) {
  'use strict';
  function V(x, y) { return { x: x, y: y }; }
  function dot(a, b) { return a.x * b.x + a.y * b.y; }
  function cross(a, b) { return a.x * b.y - a.y * b.x; }

  var nextId = 1;
  function Body(o) {
    this.id = nextId++;
    this.shape = o.r ? 'c' : 'b';
    this.r = o.r || 0;
    this.w = o.w || 0; this.h = o.h || 0;
    this.p = V(o.x || 0, o.y || 0); this.a = o.a || 0;
    this.v = V(o.vx || 0, o.vy || 0); this.w0 = o.av || 0; // angular velocity
    this.f = o.friction == null ? 0.6 : o.friction;
    var m = o.static ? 0 : (o.mass || (this.shape === 'c' ? Math.PI * this.r * this.r : this.w * this.h) * (o.density || 1));
    this.m = m; this.im = m ? 1 / m : 0;
    var I = m ? (this.shape === 'c' ? 0.5 * m * this.r * this.r : m * (this.w * this.w + this.h * this.h) / 12) : 0;
    this.I = I; this.iI = I ? 1 / I : 0;
    this.data = o.data || {};
    this.sleep = 0; this.dead = false;
  }
  Body.prototype.rot = function () { var c = Math.cos(this.a), s = Math.sin(this.a); return { c: c, s: s }; };
  Body.prototype.aabb = function () {
    if (this.shape === 'c') return [this.p.x - this.r, this.p.y - this.r, this.p.x + this.r, this.p.y + this.r];
    var R = this.rot(), hx = this.w / 2, hy = this.h / 2, ex = Math.abs(R.c) * hx + Math.abs(R.s) * hy, ey = Math.abs(R.s) * hx + Math.abs(R.c) * hy;
    return [this.p.x - ex, this.p.y - ey, this.p.x + ex, this.p.y + ey];
  };
  // local <-> world
  function mulR(R, v) { return V(R.c * v.x - R.s * v.y, R.s * v.x + R.c * v.y); }
  function mulRT(R, v) { return V(R.c * v.x + R.s * v.y, -R.s * v.x + R.c * v.y); }

  // ---------- box vs box (clipping), after Box2D-Lite ----------
  function incidentEdge(h, pos, R, n) {
    var nl = mulRT(R, n); nl = V(-nl.x, -nl.y);
    var c0, c1;
    if (Math.abs(nl.x) > Math.abs(nl.y)) {
      if (nl.x > 0) { c0 = V(h.x, -h.y); c1 = V(h.x, h.y); } else { c0 = V(-h.x, h.y); c1 = V(-h.x, -h.y); }
    } else {
      if (nl.y > 0) { c0 = V(h.x, h.y); c1 = V(-h.x, h.y); } else { c0 = V(-h.x, -h.y); c1 = V(h.x, -h.y); }
    }
    var a = mulR(R, c0), b = mulR(R, c1);
    return [V(pos.x + a.x, pos.y + a.y), V(pos.x + b.x, pos.y + b.y)];
  }
  function clip(vIn, n, off) {
    var out = [], d0 = dot(n, vIn[0]) - off, d1 = dot(n, vIn[1]) - off;
    if (d0 <= 0) out.push(vIn[0]); if (d1 <= 0) out.push(vIn[1]);
    if (d0 * d1 < 0) { var t = d0 / (d0 - d1); out.push(V(vIn[0].x + t * (vIn[1].x - vIn[0].x), vIn[0].y + t * (vIn[1].y - vIn[0].y))); }
    return out;
  }
  function boxBox(A, B) {
    var hA = V(A.w / 2, A.h / 2), hB = V(B.w / 2, B.h / 2), RA = A.rot(), RB = B.rot();
    var dp = V(B.p.x - A.p.x, B.p.y - A.p.y), dA = mulRT(RA, dp), dB = mulRT(RB, dp);
    // C = RA^T * RB
    var c11 = RA.c * RB.c + RA.s * RB.s, c12 = -RA.c * RB.s + RA.s * RB.c, c21 = -RA.s * RB.c + RA.c * RB.s, c22 = RA.s * RB.s + RA.c * RB.c;
    var a11 = Math.abs(c11), a12 = Math.abs(c12), a21 = Math.abs(c21), a22 = Math.abs(c22);
    var fAx = Math.abs(dA.x) - hA.x - (a11 * hB.x + a12 * hB.y), fAy = Math.abs(dA.y) - hA.y - (a21 * hB.x + a22 * hB.y);
    if (fAx > 0 || fAy > 0) return null;
    var fBx = Math.abs(dB.x) - (a11 * hA.x + a21 * hA.y) - hB.x, fBy = Math.abs(dB.y) - (a12 * hA.x + a22 * hA.y) - hB.y;
    if (fBx > 0 || fBy > 0) return null;
    var colA1 = V(RA.c, RA.s), colA2 = V(-RA.s, RA.c), colB1 = V(RB.c, RB.s), colB2 = V(-RB.s, RB.c);
    var axis = 0, sep = fAx, n = dA.x > 0 ? colA1 : V(-colA1.x, -colA1.y), relTol = 0.95, absTol = 0.01;
    if (fAy > relTol * sep + absTol * hA.y) { axis = 1; sep = fAy; n = dA.y > 0 ? colA2 : V(-colA2.x, -colA2.y); }
    if (fBx > relTol * sep + absTol * hB.x) { axis = 2; sep = fBx; n = dB.x > 0 ? colB1 : V(-colB1.x, -colB1.y); }
    if (fBy > relTol * sep + absTol * hB.y) { axis = 3; sep = fBy; n = dB.y > 0 ? colB2 : V(-colB2.x, -colB2.y); }
    var fn, front, sn, side, negSide, posSide, inc;
    if (axis === 0) { fn = n; front = dot(A.p, fn) + hA.x; sn = colA2; side = dot(A.p, sn); negSide = -side + hA.y; posSide = side + hA.y; inc = incidentEdge(hB, B.p, RB, fn); }
    else if (axis === 1) { fn = n; front = dot(A.p, fn) + hA.y; sn = colA1; side = dot(A.p, sn); negSide = -side + hA.x; posSide = side + hA.x; inc = incidentEdge(hB, B.p, RB, fn); }
    else if (axis === 2) { fn = V(-n.x, -n.y); front = dot(B.p, fn) + hB.x; sn = colB2; side = dot(B.p, sn); negSide = -side + hB.y; posSide = side + hB.y; inc = incidentEdge(hA, A.p, RA, fn); }
    else { fn = V(-n.x, -n.y); front = dot(B.p, fn) + hB.y; sn = colB1; side = dot(B.p, sn); negSide = -side + hB.x; posSide = side + hB.x; inc = incidentEdge(hA, A.p, RA, fn); }
    var c1 = clip(inc, V(-sn.x, -sn.y), negSide); if (c1.length < 2) return null;
    var c2 = clip(c1, sn, posSide); if (c2.length < 2) return null;
    var out = [];
    for (var i = 0; i < 2; i++) {
      var s = dot(fn, c2[i]) - front;
      if (s <= 0) out.push({ n: n, s: s, p: V(c2[i].x - s * fn.x, c2[i].y - s * fn.y) });
    }
    return out.length ? out : null;
  }
  // ---------- circles ----------
  function circleCircle(A, B) {
    var dx = B.p.x - A.p.x, dy = B.p.y - A.p.y, d = Math.hypot(dx, dy), s = d - A.r - B.r;
    if (s > 0) return null;
    var n = d > 1e-9 ? V(dx / d, dy / d) : V(0, 1);
    return [{ n: n, s: s, p: V(A.p.x + n.x * (A.r + s / 2), A.p.y + n.y * (A.r + s / 2)) }];
  }
  function boxCircle(Bx, C, flip) { // normal from the box to the circle (or the reverse when flip)
    var R = Bx.rot(), d = mulRT(R, V(C.p.x - Bx.p.x, C.p.y - Bx.p.y)), hx = Bx.w / 2, hy = Bx.h / 2;
    var cx = Math.max(-hx, Math.min(hx, d.x)), cy = Math.max(-hy, Math.min(hy, d.y)), nl, s, pt;
    if (cx === d.x && cy === d.y) { // centre inside the box
      var px = hx - Math.abs(d.x), py = hy - Math.abs(d.y);
      if (px < py) { nl = V(d.x < 0 ? -1 : 1, 0); pt = V(nl.x * hx, d.y); s = -px - C.r; }
      else { nl = V(0, d.y < 0 ? -1 : 1); pt = V(d.x, nl.y * hy); s = -py - C.r; }
    } else {
      var ex = d.x - cx, ey = d.y - cy, dist = Math.hypot(ex, ey);
      s = dist - C.r; if (s > 0) return null;
      nl = V(ex / dist, ey / dist); pt = V(cx, cy);
    }
    var n = mulR(R, nl), wp = mulR(R, pt);
    var p = V(Bx.p.x + wp.x, Bx.p.y + wp.y);
    return [{ n: flip ? V(-n.x, -n.y) : n, s: s, p: p }];
  }
  function collide(A, B) {
    if (A.shape === 'b' && B.shape === 'b') return boxBox(A, B);
    if (A.shape === 'c' && B.shape === 'c') return circleCircle(A, B);
    if (A.shape === 'b') return boxCircle(A, B, false);
    return boxCircle(B, A, true);
  }

  // ---------- the world ----------
  function World(o) {
    o = o || {};
    this.g = V(0, o.gravity == null ? -10 : o.gravity);
    this.bodies = []; this.arb = {}; this.iters = o.iterations || 12;
    this.onImpulse = null; // function (bodyA, bodyB, normalImpulse)
  }
  World.prototype.add = function (o) { var b = o instanceof Body ? o : new Body(o); this.bodies.push(b); return b; };
  World.prototype.remove = function (b) { b.dead = true; };
  World.prototype.step = function (dt) {
    var B = this.bodies, i, j, a, b, k, idt = 1 / dt, seen = {};
    B = this.bodies = B.filter(function (x) { return !x.dead; });
    // broad phase and narrow phase
    var boxes = B.map(function (x) { return x.aabb(); });
    for (i = 0; i < B.length; i++) for (j = i + 1; j < B.length; j++) {
      a = B[i]; b = B[j];
      if (!a.im && !b.im) continue;
      var ba = boxes[i], bb = boxes[j];
      if (ba[0] > bb[2] || bb[0] > ba[2] || ba[1] > bb[3] || bb[1] > ba[3]) continue;
      if (a.data.ghost && b.data.ghost) continue;
      var cs = collide(a, b);
      k = a.id + ':' + b.id;
      if (!cs) continue;
      seen[k] = 1;
      var old = this.arb[k];
      cs.forEach(function (c) { c.Pn = 0; c.Pt = 0; if (old) old.c.forEach(function (o) { if (Math.abs(o.p.x - c.p.x) + Math.abs(o.p.y - c.p.y) < 0.08) { c.Pn = o.Pn; c.Pt = o.Pt; } }); });
      this.arb[k] = { a: a, b: b, c: cs, f: Math.sqrt(a.f * b.f) };
    }
    for (k in this.arb) if (!seen[k]) delete this.arb[k];
    // forces
    var g = this.g;
    B.forEach(function (x) { if (!x.im) return; x.v.x += dt * g.x; x.v.y += dt * g.y; x.v.x *= 0.9995; x.w0 *= 0.995; });
    // pre-step
    var arbs = []; for (k in this.arb) arbs.push(this.arb[k]);
    // the closing speed at each contact before any impulse is applied (for damage)
    arbs.forEach(function (A) {
      var a = A.a, b = A.b;
      A.c.forEach(function (c) {
        var r1x = c.p.x - a.p.x, r1y = c.p.y - a.p.y, r2x = c.p.x - b.p.x, r2y = c.p.y - b.p.y;
        var ux = b.v.x - b.w0 * r2y - a.v.x + a.w0 * r1y, uy = b.v.y + b.w0 * r2x - a.v.y - a.w0 * r1x;
        c.vn0 = ux * c.n.x + uy * c.n.y;
      });
    });
    arbs.forEach(function (A) {
      var a = A.a, b = A.b;
      A.c.forEach(function (c) {
        var r1 = V(c.p.x - a.p.x, c.p.y - a.p.y), r2 = V(c.p.x - b.p.x, c.p.y - b.p.y), n = c.n;
        var rn1 = dot(r1, n), rn2 = dot(r2, n);
        c.mn = 1 / (a.im + b.im + a.iI * (dot(r1, r1) - rn1 * rn1) + b.iI * (dot(r2, r2) - rn2 * rn2));
        var t = V(n.y, -n.x), rt1 = dot(r1, t), rt2 = dot(r2, t);
        c.mt = 1 / (a.im + b.im + a.iI * (dot(r1, r1) - rt1 * rt1) + b.iI * (dot(r2, r2) - rt2 * rt2));
        c.bias = -0.2 * idt * Math.min(0, c.s + 0.01);
        c.P0 = 0;
        var P = V(c.Pn * n.x + c.Pt * t.x, c.Pn * n.y + c.Pt * t.y);
        a.v.x -= a.im * P.x; a.v.y -= a.im * P.y; a.w0 -= a.iI * cross(r1, P);
        b.v.x += b.im * P.x; b.v.y += b.im * P.y; b.w0 += b.iI * cross(r2, P);
        c.r1 = r1; c.r2 = r2; c.t = t;
      });
    });
    // iterations
    for (var it = 0; it < this.iters; it++) arbs.forEach(function (A) {
      var a = A.a, b = A.b;
      A.c.forEach(function (c) {
        var r1 = c.r1, r2 = c.r2, n = c.n, t = c.t;
        var dvx = b.v.x - b.w0 * r2.y - a.v.x + a.w0 * r1.y, dvy = b.v.y + b.w0 * r2.x - a.v.y - a.w0 * r1.x;
        var vn = dvx * n.x + dvy * n.y, dPn = c.mn * (-vn + c.bias), P0 = c.Pn;
        c.Pn = Math.max(P0 + dPn, 0); dPn = c.Pn - P0;
        var Px = dPn * n.x, Py = dPn * n.y;
        a.v.x -= a.im * Px; a.v.y -= a.im * Py; a.w0 -= a.iI * (r1.x * Py - r1.y * Px);
        b.v.x += b.im * Px; b.v.y += b.im * Py; b.w0 += b.iI * (r2.x * Py - r2.y * Px);
        dvx = b.v.x - b.w0 * r2.y - a.v.x + a.w0 * r1.y; dvy = b.v.y + b.w0 * r2.x - a.v.y - a.w0 * r1.x;
        var vt = dvx * t.x + dvy * t.y, dPt = c.mt * (-vt), mx = A.f * c.Pn, T0 = c.Pt;
        c.Pt = Math.max(-mx, Math.min(mx, T0 + dPt)); dPt = c.Pt - T0;
        Px = dPt * t.x; Py = dPt * t.y;
        a.v.x -= a.im * Px; a.v.y -= a.im * Py; a.w0 -= a.iI * (r1.x * Py - r1.y * Px);
        b.v.x += b.im * Px; b.v.y += b.im * Py; b.w0 += b.iI * (r2.x * Py - r2.y * Px);
      });
    });
    // integrate
    B.forEach(function (x) { if (!x.im) return; x.p.x += dt * x.v.x; x.p.y += dt * x.v.y; x.a += dt * x.w0; });
    // report hard hits: the closing speed at first touch, weighted by the lighter body
    if (this.onImpulse) { var cb = this.onImpulse; arbs.forEach(function (A) { var mx = 0; A.c.forEach(function (c) { if (-c.vn0 > mx) mx = -c.vn0; }); if (mx > 0.5) cb(A.a, A.b, mx); }); }
  };
  World.prototype.query = function (x, y) { // the body under a point
    for (var i = this.bodies.length - 1; i >= 0; i--) {
      var b = this.bodies[i]; if (b.dead) continue;
      if (b.shape === 'c') { if (Math.hypot(x - b.p.x, y - b.p.y) <= b.r) return b; continue; }
      var d = mulRT(b.rot(), V(x - b.p.x, y - b.p.y)); if (Math.abs(d.x) <= b.w / 2 && Math.abs(d.y) <= b.h / 2) return b;
    }
    return null;
  };
  root.SiegePhysics = { World: World, Body: Body };
  if (typeof module !== 'undefined') module.exports = root.SiegePhysics;
})(typeof window !== 'undefined' ? window : this);
