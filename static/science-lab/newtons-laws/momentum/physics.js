/* Newton's Laws, Chapter 5 (Momentum and Collisions): the models behind the air track, the crash-safety graphs and the pool table.
   window.NL5Phys in the browser, module.exports in node (tested in /tmp/work_nl2/test_momentum.js). SI units. */
(function (root) {
  'use strict';
  var G = 9.80665;

  /* ---------- a 1-D collision with coefficient of restitution e ----------
     e = (speed of separation) / (speed of approach): 0 = they stick, 1 = perfectly elastic.
     J is the impulse on body 2 (and −J on body 1). Momentum is conserved for every e. */
  function collide(m1, v1, m2, v2, e) {
    var M = m1 + m2, mu = m1 * m2 / M, J = (1 + e) * mu * (v1 - v2);
    return { v1: v1 - J / m1, v2: v2 + J / m2, J: J, vcm: (m1 * v1 + m2 * v2) / M };
  }
  function ke(m, v) { return 0.5 * m * v * v; }

  /* ---------- the air track ----------
     Two gliders on a frictionless track. Each has a length (m). Glider 1 starts on the left.
     The contact is a smooth force pulse: F(s) = (π J / 2τ) sin(π s / τ) for 0 ≤ s ≤ τ, pushing the gliders apart.
     Its area is exactly J, so the gliders leave the contact with exactly the velocities collide() gives,
     and because the force on one is minus the force on the other, total momentum is the same at every instant.
     During contact the bumpers squeeze together (the gliders overlap a little), which the drawing shows as springs. */
  function Track(o) {
    this.m1 = o.m1; this.m2 = o.m2; this.e = o.e; this.tau = o.tau || 0.06;
    this.l1 = o.l1 || 0.2; this.l2 = o.l2 || 0.2; this.len = o.len || 2.0;
    this.x1 = o.x1; this.x2 = o.x2; this.v1 = o.v1; this.v2 = o.v2;
    this.t = 0; this.phase = 'before'; this.c = null; this.stuck = false; this.F = 0; this.done = false; this.why = '';
    this.before = null; this.after = null;
  }
  Track.prototype.gap = function () { return (this.x2 - this.l2 / 2) - (this.x1 + this.l1 / 2); };
  Track.prototype.p = function () { return this.m1 * this.v1 + this.m2 * this.v2; };
  Track.prototype.K = function () { return ke(this.m1, this.v1) + ke(this.m2, this.v2); };
  Track.prototype.snapshot = function () { return { v1: this.v1, v2: this.v2, p1: this.m1 * this.v1, p2: this.m2 * this.v2, K1: ke(this.m1, this.v1), K2: ke(this.m2, this.v2) }; };
  /* advance by dt (exact for straight-line motion and for the force pulse, which has a closed-form integral) */
  Track.prototype.step = function (dt) {
    var left = dt, guard = 0;
    while (left > 1e-15 && guard++ < 8 && !this.done) {
      if (this.phase === 'contact') {
        var s0 = this.t - this.c.t0, s1 = Math.min(this.c.tau, s0 + left), h = s1 - s0;
        this._pulse(s1); left -= h; this.t += h;
        if (s1 >= this.c.tau - 1e-15) this._endContact();
        continue;
      }
      // free flight: find the time to contact (only before the collision) and to an end of the track
      var tHit = Infinity;
      if (this.phase === 'before' && this.v1 > this.v2) { var gp = this.gap(); tHit = Math.max(0, gp / (this.v1 - this.v2)); }
      var tEnd = this._tEnd();
      var hh = Math.min(left, tHit, tEnd);
      this.x1 += this.v1 * hh; this.x2 += this.v2 * hh; this.t += hh; left -= hh;
      if (hh === tHit && tHit <= tEnd) this._startContact();
      else if (hh === tEnd) { this.done = true; this.why = this.phase === 'before' ? 'miss' : 'end'; }
    }
  };
  Track.prototype._tEnd = function () {
    var t = Infinity, a = this.x1 - this.l1 / 2, b = this.x2 + this.l2 / 2;
    if (this.v1 < 0) t = Math.min(t, a / -this.v1);
    if (this.v2 > 0) t = Math.min(t, (this.len - b) / this.v2);
    return Math.max(0, t); // glider 1 can never pass glider 2, so these two ends are the only ones to watch
  };
  Track.prototype._startContact = function () {
    var r = collide(this.m1, this.v1, this.m2, this.v2, this.e);
    this.before = this.snapshot();
    this.c = { t0: this.t, tau: this.tau, J: r.J, x1: this.x1, x2: this.x2, v1: this.v1, v2: this.v2, peak: Math.PI * r.J / (2 * this.tau) };
    this.phase = 'contact';
  };
  Track.prototype._pulse = function (s) { // state at time s into the contact, from the start-of-contact values
    var c = this.c, tau = c.tau, k = Math.PI / tau, J = c.J;
    var I = J * (1 - Math.cos(k * s)) / 2;                       // impulse delivered so far
    var X = J * (s - Math.sin(k * s) / k) / 2;                    // its time integral
    this.v1 = c.v1 - I / this.m1; this.v2 = c.v2 + I / this.m2;
    this.x1 = c.x1 + c.v1 * s - X / this.m1; this.x2 = c.x2 + c.v2 * s + X / this.m2;
    this.F = J * k / 2 * Math.sin(k * s);
  };
  Track.prototype._endContact = function () {
    var r = collide(this.m1, this.c.v1, this.m2, this.c.v2, this.e);
    this.v1 = r.v1; this.v2 = r.v2; this.F = 0;              // exact values (removes round-off)
    this.phase = 'after'; this.stuck = this.e === 0;
    this.after = this.snapshot();
  };
  /* the most squeeze of the bumpers during contact (m), for the drawing and tests */
  function maxSqueeze(m1, v1, m2, v2, e, tau) {
    var r = collide(m1, v1, m2, v2, e), mu = m1 * m2 / (m1 + m2), u = v1 - v2, best = 0, n = 400;
    for (var i = 0; i <= n; i++) { var s = tau * i / n, k = Math.PI / tau; var X = r.J * (s - Math.sin(k * s) / k) / 2; var sq = u * s - X / mu; if (sq > best) best = sq; }
    return best;
  }

  /* ---------- impulse: stopping something over a time Δt ----------
     A half-sine force pulse that stops mass m from speed v. The stopping distance d fixes Δt = 2d / v
     (the same as for a steady force); the average force is m v / Δt and the peak is π/2 times that. */
  function stop(m, v, d) {
    var dt = 2 * d / v, J = m * v, Favg = J / dt;
    return { J: J, dt: dt, Favg: Favg, Fpeak: Math.PI / 2 * Favg, g: Favg / (m * G) };
  }
  function pulseF(J, dt, t) { return (t < 0 || t > dt) ? 0 : Math.PI * J / (2 * dt) * Math.sin(Math.PI * t / dt); }

  /* ---------- 2-D pool: two equal balls, frictionless table except a gentle rolling slowdown ----------
     Balls are discs of radius r. Collisions are instant, along the line of centers, with restitution e. */
  function hit2D(a, b, e) { // a, b: {x, y, vx, vy, m}
    var nx = b.x - a.x, ny = b.y - a.y, d = Math.hypot(nx, ny); nx /= d; ny /= d;
    var vrel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;   // closing speed along the line of centers
    if (vrel <= 0) return 0;
    var mu = a.m * b.m / (a.m + b.m), J = (1 + e) * mu * vrel;
    a.vx -= J / a.m * nx; a.vy -= J / a.m * ny; b.vx += J / b.m * nx; b.vy += J / b.m * ny;
    return J;
  }
  /* time until two moving discs (radius r each) touch, or Infinity */
  function tContact(a, b, r) {
    var dx = b.x - a.x, dy = b.y - a.y, dvx = b.vx - a.vx, dvy = b.vy - a.vy, R = 2 * r;
    var A = dvx * dvx + dvy * dvy, B = 2 * (dx * dvx + dy * dvy), Cc = dx * dx + dy * dy - R * R;
    if (A < 1e-18 || B >= 0) return Infinity;
    var disc = B * B - 4 * A * Cc; if (disc < 0) return Infinity;
    var t = (-B - Math.sqrt(disc)) / (2 * A); return t < 0 ? (Cc <= 0 ? 0 : Infinity) : t;
  }

  var API = { G: G, collide: collide, ke: ke, Track: Track, maxSqueeze: maxSqueeze, stop: stop, pulseF: pulseF, hit2D: hit2D, tContact: tContact };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.NL5Phys = API;
})(this);
