/* Newton's Laws, Chapter 2 (F = ma): the models behind the page, in SI units. window.NL2Phys in the browser,
   module.exports in node (tests in the build notes).
   - Cart: a cart on a level track, pushed by a force you choose, with optional sliding friction (static and kinetic).
   - Faller: something falling with air drag F = k v² (k = ½ ρ C A), stepped with RK4, and the exact formulas to check it.
   - Sled: a crate on ice pulled by two teams (the net-force builder). */
(function (root) {
  'use strict';
  var G = 9.80665;   // standard gravity, m/s² (exact; NIST SP 811)
  function sgn(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

  // ---------- a cart on a level track ----------
  // o.m: mass (kg); o.muS, o.muK: friction coefficients (0 = none); o.x, o.v: start; o.xMin, o.xMax: the bumpers (m).
  function Cart(o) {
    o = o || {};
    this.m = o.m || 1; this.muS = o.muS || 0; this.muK = o.muK || 0; this.g = o.g || G;
    this.x = o.x || 0; this.v = o.v || 0; this.t = 0; this.xMin = o.xMin === undefined ? -Infinity : o.xMin; this.xMax = o.xMax === undefined ? Infinity : o.xMax;
    this.a = 0; this.f = 0; this.F = 0; this.Fnet = 0;
  }
  // The friction force (N) for a push F, given the present velocity. Static friction holds a cart at rest up to μs m g.
  Cart.prototype.friction = function (F) {
    var N = this.m * this.g;
    if (this.v !== 0) return -sgn(this.v) * this.muK * N;
    if (Math.abs(F) <= this.muS * N) return -F;                // stuck: static friction matches the push exactly
    return -sgn(F) * this.muK * N;                               // breaks free: kinetic friction from the start
  };
  // One step of h seconds with the applied force F (N). Returns '' or 'bump' when the cart hits an end of the track.
  Cart.prototype.step = function (h, F) {
    var f = this.friction(F), a = (F + f) / this.m, v0 = this.v, v1 = v0 + a * h, dt = h, ev = '';
    // friction can stop the cart part-way through a step; it then stays put unless the push beats static friction
    if (this.muK > 0 && v0 !== 0 && sgn(v1) !== sgn(v0)) {
      dt = -v0 / a;                                              // time until v = 0
      this.x += v0 * dt + 0.5 * a * dt * dt; this.v = 0;
      var rest = h - dt, f2 = this.friction(F), a2 = (F + f2) / this.m;
      if (a2 !== 0) { this.x += 0.5 * a2 * rest * rest; this.v = a2 * rest; }
      a = (a * dt + a2 * rest) / h; f = f2;
    } else {
      this.x += v0 * h + 0.5 * a * h * h; this.v = v1;
    }
    if (this.x < this.xMin) { this.x = this.xMin; this.v = 0; ev = 'bump'; }
    if (this.x > this.xMax) { this.x = this.xMax; this.v = 0; ev = 'bump'; }
    this.t += h; this.a = a; this.f = f; this.F = F; this.Fnet = F + f;
    return ev;
  };

  // ---------- falling with air drag ----------
  // m: mass (kg); k: drag constant (kg/m), F_drag = k v²; g: gravity. y is the distance fallen (down is positive).
  function Faller(m, k, g) { this.m = m; this.k = k; this.g = g === undefined ? G : g; this.y = 0; this.v = 0; this.t = 0; }
  Faller.prototype.acc = function (v) { return this.g - this.k / this.m * v * Math.abs(v); };
  Faller.prototype.step = function (h) {
    var v = this.v, self = this;
    var k1v = self.acc(v), k1y = v;
    var k2v = self.acc(v + 0.5 * h * k1v), k2y = v + 0.5 * h * k1v;
    var k3v = self.acc(v + 0.5 * h * k2v), k3y = v + 0.5 * h * k2v;
    var k4v = self.acc(v + h * k3v), k4y = v + h * k3v;
    this.y += h * (k1y + 2 * k2y + 2 * k3y + k4y) / 6; this.v += h * (k1v + 2 * k2v + 2 * k3v + k4v) / 6; this.t += h;
  };
  Faller.prototype.vT = function () { return this.k > 0 ? Math.sqrt(this.m * this.g / this.k) : Infinity; };
  Faller.prototype.drag = function () { return this.k * this.v * Math.abs(this.v); };
  // exact formulas for a fall from rest: speed and distance after t seconds
  function dragExact(m, k, g, t) {
    if (k === 0) return { v: g * t, y: 0.5 * g * t * t };
    var vT = Math.sqrt(m * g / k), u = g * t / vT;
    return { v: vT * Math.tanh(u), y: vT * vT / g * Math.log(Math.cosh(u)) };
  }
  // the time to fall a height H from rest (exact)
  function fallTime(m, k, g, H) {
    if (k === 0) return Math.sqrt(2 * H / g);
    var vT = Math.sqrt(m * g / k);
    return vT / g * acosh(Math.exp(H * g / (vT * vT)));
  }
  function acosh(x) { return Math.log(x + Math.sqrt(x * x - 1)); }
  function dragK(rho, C, A) { return 0.5 * rho * C * A; }

  // ---------- a crate on ice pulled by two teams ----------
  function Sled(o) { o = o || {}; this.cart = new Cart({ m: o.m || 200, muS: o.muS || 0, muK: o.muK || 0, x: 0, xMin: o.xMin, xMax: o.xMax }); }
  Sled.prototype.step = function (h, left, right) { return this.cart.step(h, right - left); };

  // A piecewise-linear velocity graph through points (t_i, v_i): the slope of each piece and the area under it.
  function vtPieces(pts) {
    var out = [];
    for (var i = 0; i + 1 < pts.length; i++) {
      var t0 = pts[i][0], v0 = pts[i][1], t1 = pts[i + 1][0], v1 = pts[i + 1][1];
      out.push({ t0: t0, t1: t1, a: (v1 - v0) / (t1 - t0), area: 0.5 * (v0 + v1) * (t1 - t0) });
    }
    return out;
  }
  // distance actually traveled (counting backward motion as distance too)
  function vtDistance(pts) {
    var d = 0;
    for (var i = 0; i + 1 < pts.length; i++) {
      var t0 = pts[i][0], v0 = pts[i][1], t1 = pts[i + 1][0], v1 = pts[i + 1][1], T = t1 - t0;
      if (v0 * v1 >= 0) d += 0.5 * Math.abs(v0 + v1) * T;
      else { var tc = T * v0 / (v0 - v1); d += 0.5 * Math.abs(v0) * tc + 0.5 * Math.abs(v1) * (T - tc); }
    }
    return d;
  }

  var api = { G: G, Cart: Cart, Faller: Faller, dragExact: dragExact, fallTime: fallTime, dragK: dragK, Sled: Sled, vtPieces: vtPieces, vtDistance: vtDistance, MPH: 0.44704, LBF: 4.448222 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NL2Phys = api;
})(this);
