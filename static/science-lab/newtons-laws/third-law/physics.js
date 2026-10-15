/* Newton's Laws, Chapter 3 (Action and Reaction): the models behind the page, in SI units. window.NL3Phys in the browser,
   module.exports in node (tests in the build notes).
   - Skaters: two skaters (or a skater and a wall) push off each other with equal and opposite forces.
   - horseCart: the forces on a horse pulling a cart along level ground.
   - walk: how fast a person can speed up when the ground can only push so hard (friction).
   - Balloon: a balloon rocket on a string. */
(function (root) {
  'use strict';
  var G = 9.80665;   // standard gravity, m/s² (exact; NIST SP 811)

  // ---------- two skaters ----------
  // o.mA, o.mB: masses (kg; mB = Infinity is a wall); o.F: peak force of the push (N); o.T: how long the push lasts (s);
  // o.mu: ice friction (0 = none). Skater A is on the left and is pushed left; B is pushed right.
  // During the push both feel F(t) = F sin(π t / T), equal and opposite.
  function Skaters(o) {
    this.mA = o.mA; this.mB = o.mB; this.F = o.F; this.T = o.T; this.mu = o.mu || 0; this.g = G;
    this.xA = -(o.gap || 0) / 2; this.xB = (o.gap || 0) / 2; this.vA = 0; this.vB = 0; this.t = 0; this.J = 0; this.f = 0;
  }
  Skaters.prototype.force = function (t) { return t >= 0 && t <= this.T ? this.F * Math.sin(Math.PI * t / this.T) : 0; };
  // the push given between t0 and t1 (exact integral of the force)
  Skaters.prototype.impulse = function (t0, t1) {
    var a = Math.max(0, Math.min(this.T, t0)), b = Math.max(0, Math.min(this.T, t1));
    return this.F * this.T / Math.PI * (Math.cos(Math.PI * a / this.T) - Math.cos(Math.PI * b / this.T));
  };
  Skaters.prototype.step = function (h) {
    var dJ = this.impulse(this.t, this.t + h), vA0 = this.vA, vB0 = this.vB;
    var vA = vA0 - dJ / this.mA, vB = isFinite(this.mB) ? vB0 + dJ / this.mB : 0;
    if (this.mu > 0) {               // ice friction slows each moving skater by μ g every second
      var dv = this.mu * this.g * h;
      vA = Math.abs(vA) <= dv ? 0 : vA - dv * Math.sign(vA);
      if (isFinite(this.mB)) vB = Math.abs(vB) <= dv ? 0 : vB - dv * Math.sign(vB);
    }
    this.xA += 0.5 * (vA0 + vA) * h; this.xB += 0.5 * (vB0 + vB) * h; this.vA = vA; this.vB = vB;
    this.J += dJ; this.t += h; this.f = this.force(this.t);
  };
  Skaters.prototype.momentum = function () { return this.mA * this.vA + (isFinite(this.mB) ? this.mB * this.vB : 0); };
  // what the push gives each skater, and (with friction) how far each one glides after the push
  function skaterPrediction(mA, mB, F, T, mu) {
    var J = 2 * F * T / Math.PI, vA = J / mA, vB = isFinite(mB) ? J / mB : 0;
    return { J: J, vA: vA, vB: vB, glideA: mu > 0 ? vA * vA / (2 * mu * G) : Infinity, glideB: mu > 0 ? vB * vB / (2 * mu * G) : Infinity };
  }

  // ---------- the horse and the cart ----------
  // mh, mc: masses (kg); Fg: how hard the ground pushes the horse forward (equal to how hard the horse pushes back on it);
  // fr: the cart's rolling resistance (N). Returns the acceleration and the pull in the rope.
  function horseCart(mh, mc, Fg, fr) {
    if (Fg <= fr) return { a: 0, T: Fg, moving: false };          // not enough: everything stays put, rope tension = push
    var a = (Fg - fr) / (mh + mc);
    return { a: a, T: mc * a + fr, moving: true };
  }

  // ---------- walking ----------
  // m: mass; want: the acceleration the walker tries for (m/s²); muS, muK: shoe on floor.
  function walk(m, want, muS, muK) {
    var need = m * want, maxS = muS * m * G;
    if (need <= maxS) return { a: want, F: need, slip: false };
    return { a: muK * G, F: muK * m * G, slip: true };
  }

  // ---------- a balloon rocket on a string ----------
  // The balloon pushes air out the back with a thrust that falls from F0 to 0 over Tb seconds; air drag k v².
  function Balloon(o) { this.m = o.m; this.F0 = o.F0; this.Tb = o.Tb; this.k = o.k; this.x = 0; this.v = 0; this.t = 0; this.pAir = 0; }
  Balloon.prototype.thrust = function (t) { return t < this.Tb ? this.F0 * (1 - t / this.Tb) : 0; };
  Balloon.prototype.step = function (h) {
    var F = this.thrust(this.t + h / 2), a = (F - this.k * this.v * Math.abs(this.v)) / this.m;
    this.pAir -= F * h;                      // the air gets the same push backward
    this.x += this.v * h + 0.5 * a * h * h; this.v += a * h; this.t += h;
    return F;
  };

  var api = { G: G, Skaters: Skaters, skaterPrediction: skaterPrediction, horseCart: horseCart, walk: walk, Balloon: Balloon };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NL3Phys = api;
})(this);
