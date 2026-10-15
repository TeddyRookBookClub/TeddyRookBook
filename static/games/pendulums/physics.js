/* Pendulums and Resonance: the physics, in SI units (meters, seconds, kilograms, radians). No drawing here.
   In the browser it is window.PendModel; in node, require() it for the tests.
   Every pendulum obeys the full equation  θ'' = −(g/L)·sin θ  (no small-angle shortcut), stepped with
   4th-order Runge–Kutta. The exact period of a free swing, T = 4·√(L/g)·K(sin(θ₀/2)), is used only to
   check the steps and to label things, never to move the pendulums. */
(function (root) {
  'use strict';
  var TAU = 2 * Math.PI;
  var GRAV = { earth: 9.80665, moon: 1.62, mars: 3.73 };   // m/s²: standard gravity (NIST, exact); Moon and Mars (NASA fact sheets)

  // complete elliptic integral of the first kind K(k), by the arithmetic–geometric mean
  function agm(a, b) {
    for (var i = 0; i < 60 && Math.abs(a - b) > 1e-15 * a; i++) { var t = 0.5 * (a + b); b = Math.sqrt(a * b); a = t; }
    return 0.5 * (a + b);
  }
  function ellipK(k) { return Math.PI / (2 * agm(1, Math.sqrt(1 - k * k))); }
  // how much longer a swing from θ₀ takes than the small-swing formula says: T(θ₀) / (2π√(L/g))
  function periodFactor(th0) { th0 = Math.abs(th0); if (th0 >= Math.PI) return Infinity; if (th0 < 1e-9) return 1; return 2 * ellipK(Math.sin(th0 / 2)) / Math.PI; }
  function smallPeriod(L, g) { return TAU * Math.sqrt(L / g); }
  function exactPeriod(L, g, th0) { return smallPeriod(L, g) * periodFactor(th0); }
  function lengthFor(T, g) { return g * (T / TAU) * (T / TAU); }   // small-swing formula turned around: L = g·(T/2π)²

  // one RK4 step of a single free pendulum θ'' = −(g/L) sin θ; s = [θ, ω] (in place)
  function rk4Free(s, wn2, dt) {
    var th = s[0], w = s[1], h = dt / 2;
    var k1t = w, k1w = -wn2 * Math.sin(th);
    var k2t = w + h * k1w, k2w = -wn2 * Math.sin(th + h * k1t);
    var k3t = w + h * k2w, k3w = -wn2 * Math.sin(th + h * k2t);
    var k4t = w + dt * k3w, k4w = -wn2 * Math.sin(th + dt * k3t);
    s[0] = th + dt / 6 * (k1t + 2 * k2t + 2 * k3t + k4t);
    s[1] = w + dt / 6 * (k1w + 2 * k2w + 2 * k3w + k4w);
  }

  /* ---------- Scene 1: the pendulum wave ----------
     count pendulums; pendulum k makes n0 + k swings (full back-and-forth periods) in `cycle` seconds,
     by the small-swing formula with the gravity it was built for: L_k = g·(cycle / (2π(n0 + k)))². */
  function Wave(o) {
    o = o || {};
    this.n0 = o.n0 || 51; this.count = o.count || 15; this.cycle = o.cycle || 60;
    this.gBuilt = o.gBuilt || GRAV.earth; this.g = o.g || GRAV.earth; this.th0 = o.th0 === undefined ? 0.2 : o.th0;
    this.L = new Float64Array(this.count); this.n = new Int32Array(this.count);
    for (var k = 0; k < this.count; k++) { this.n[k] = this.n0 + k; this.L[k] = lengthFor(this.cycle / this.n[k], this.gBuilt); }
    this.reset();
  }
  Wave.prototype.reset = function () {
    this.t = 0; this.s = [];
    for (var k = 0; k < this.count; k++) this.s.push([this.th0, 0]);
  };
  Wave.prototype.step = function (dt) {
    for (var k = 0; k < this.count; k++) rk4Free(this.s[k], this.g / this.L[k], dt);
    this.t += dt;
  };
  // when they all line up again: the small-swing cycle, stretched by gravity and by the size of the swing
  Wave.prototype.realignTime = function () { return this.cycle * Math.sqrt(this.gBuilt / this.g) * periodFactor(this.th0); };
  // energy per kilogram of pendulum k (J/kg), for the checks
  Wave.prototype.energy = function (k) { var L = this.L[k], s = this.s[k]; return 0.5 * L * L * s[1] * s[1] + this.g * L * (1 - Math.cos(s[0])); };
  // the smallest value of θ_k/θ₀ over all pendulums: 1 when every pendulum is back at its release point together
  Wave.prototype.lineup = function () {
    var m = 1, a = this.th0;
    for (var k = 0; k < this.count; k++) { var r = this.s[k][0] / a; if (r < m) m = r; }
    return m;
  };

  /* ---------- Scene 2: two pendulums joined by a spring ----------
     Pivots D apart; the spring joins the two bobs and has its natural length D, so it is slack when the
     pendulums hang straight down or swing exactly together. θ > 0 swings a bob toward +x (to the right). */
  function Coupled(o) {
    o = o || {};
    this.L = o.L || 1; this.D = o.D || 1.6 * this.L; this.k = o.k === undefined ? 1 : o.k;
    this.mA = o.mA || 1; this.mB = o.mB || 1; this.g = o.g || GRAV.earth;
    this.s = new Float64Array(4); this.d = [new Float64Array(4), new Float64Array(4), new Float64Array(4), new Float64Array(4)]; this.tmp = new Float64Array(4);
    this.start(o.thA === undefined ? 0.26 : o.thA, o.thB || 0);
  }
  Coupled.prototype.start = function (thA, thB) { this.s[0] = thA; this.s[1] = thB; this.s[2] = 0; this.s[3] = 0; this.t = 0; };
  Coupled.prototype.deriv = function (s, out) {
    var L = this.L, g = this.g, sa = Math.sin(s[0]), ca = Math.cos(s[0]), sb = Math.sin(s[1]), cb = Math.cos(s[1]);
    var QA = -this.mA * g * L * sa, QB = -this.mB * g * L * sb;
    if (this.k > 0) {
      var dx = this.D + L * (sb - sa), dy = L * (ca - cb), l = Math.sqrt(dx * dx + dy * dy);
      var f = this.k * (l - this.D) / l;           // spring force on A is f·(dx, dy); on B it is −f·(dx, dy)
      QA += f * (dx * L * ca + dy * L * sa);       // generalized force = F · ∂r/∂θ, with ∂r/∂θ = (L cos θ, L sin θ)
      QB -= f * (dx * L * cb + dy * L * sb);
    }
    out[0] = s[2]; out[1] = s[3]; out[2] = QA / (this.mA * L * L); out[3] = QB / (this.mB * L * L);
  };
  Coupled.prototype.step = function (dt) {
    var s = this.s, d = this.d, t = this.tmp, i;
    this.deriv(s, d[0]);
    for (i = 0; i < 4; i++) t[i] = s[i] + dt / 2 * d[0][i];
    this.deriv(t, d[1]);
    for (i = 0; i < 4; i++) t[i] = s[i] + dt / 2 * d[1][i];
    this.deriv(t, d[2]);
    for (i = 0; i < 4; i++) t[i] = s[i] + dt * d[2][i];
    this.deriv(t, d[3]);
    for (i = 0; i < 4; i++) s[i] += dt / 6 * (d[0][i] + 2 * d[1][i] + 2 * d[2][i] + d[3][i]);
    this.t += dt;
  };
  Coupled.prototype.springStretch = function () {
    var L = this.L, s = this.s, dx = this.D + L * (Math.sin(s[1]) - Math.sin(s[0])), dy = L * (Math.cos(s[0]) - Math.cos(s[1]));
    return Math.sqrt(dx * dx + dy * dy) - this.D;
  };
  // energy of each pendulum (its motion + its height) and of the spring, in joules
  Coupled.prototype.energies = function () {
    var L = this.L, g = this.g, s = this.s, e = this.springStretch();
    var A = 0.5 * this.mA * L * L * s[2] * s[2] + this.mA * g * L * (1 - Math.cos(s[0]));
    var B = 0.5 * this.mB * L * L * s[3] * s[3] + this.mB * g * L * (1 - Math.cos(s[1]));
    var S = 0.5 * this.k * e * e;
    return { A: A, B: B, spring: S, total: A + B + S };
  };
  // small-swing normal modes: together (ω₁² = g/L) and against each other (ω₂² = g/L + k(1/mA + 1/mB))
  Coupled.prototype.modes = function () {
    var w1 = Math.sqrt(this.g / this.L), w2 = Math.sqrt(this.g / this.L + this.k * (1 / this.mA + 1 / this.mB));
    return { w1: w1, w2: w2, handoff: this.k > 0 ? Math.PI / (w2 - w1) : Infinity };
  };

  /* ---------- Scene 3: a swing pushed by a motor and by hand ----------
     θ'' = −(g/L) sin θ − γ θ' + F(t)/(m L), with F along the swing's path:
     the motor's push F₀ cos(ψ), ψ' = 2π f, plus a hand push of pushF newtons lasting pushT seconds. */
  function Driven(o) {
    o = o || {};
    this.L = o.L || 2; this.g = o.g || GRAV.earth; this.m = o.m || 20; this.gamma = o.gamma === undefined ? 0.15 : o.gamma;
    this.F0 = o.F0 === undefined ? 3 : o.F0; this.f = o.f || 0.25; this.motor = o.motor === undefined ? true : !!o.motor;
    this.pushF = o.pushF || 40; this.pushLen = o.pushLen || 0.3; this.pushT = 0;
    this.s = new Float64Array(2); this.reset();
  }
  Driven.prototype.reset = function () {
    this.s[0] = 0; this.s[1] = 0; this.t = 0; this.psi = 0; this.pushT = 0;
    this.peaks = []; this.since = 0; this.prevW = 0; this.lastPos = 0; this.lastNeg = 0;
  };
  Driven.prototype.force = function (psi) { return (this.motor ? this.F0 * Math.cos(psi) : 0) + (this.pushT > 0 ? this.pushF : 0); };
  Driven.prototype._rk = function (dt) {
    var s = this.s, th = s[0], w = s[1], h = dt / 2, wn2 = this.g / this.L, gm = this.gamma, c = 1 / (this.m * this.L), om = TAU * this.f, p = this.psi;
    var F0 = this.force(p), F1 = this.force(p + om * h), F2 = this.force(p + om * dt);
    var k1t = w, k1w = -wn2 * Math.sin(th) - gm * w + c * F0;
    var k2t = w + h * k1w, k2w = -wn2 * Math.sin(th + h * k1t) - gm * k2t + c * F1;
    var k3t = w + h * k2w, k3w = -wn2 * Math.sin(th + h * k2t) - gm * k3t + c * F1;
    var k4t = w + dt * k3w, k4w = -wn2 * Math.sin(th + dt * k3t) - gm * k4t + c * F2;
    s[0] = th + dt / 6 * (k1t + 2 * k2t + 2 * k3t + k4t);
    s[1] = w + dt / 6 * (k1w + 2 * k2w + 2 * k3w + k4w);
    this.psi = (p + om * dt) % TAU; this.t += dt; this.since += dt;
    if (this.pushT > 0) this.pushT = Math.max(0, this.pushT - dt);
    // turning points: the size of the swing, measured the way you would measure it, from the highest points
    var wNew = s[1];
    if (this.prevW > 0 && wNew <= 0) { this.lastPos = s[0]; this.peaks.push(this.t, s[0]); if (this.peaks.length > 64) this.peaks.splice(0, 2); }
    else if (this.prevW < 0 && wNew >= 0) this.lastNeg = s[0];
    this.prevW = wNew;
  };
  Driven.prototype.step = function (dt) {
    if (this.pushT > 0 && this.pushT < dt) { var a = this.pushT; this._rk(a); this._rk(dt - a); }   // the push ends inside this step: split it there
    else this._rk(dt);
  };
  Driven.prototype.push = function () { this.pushT = this.pushLen; this.changed(); };
  Driven.prototype.changed = function () { this.peaks = []; this.since = 0; };   // forget the old turning points after any change
  Driven.prototype.energy = function () { var L = this.L, s = this.s; return 0.5 * this.m * L * L * s[1] * s[1] + this.m * this.g * L * (1 - Math.cos(s[0])); };
  Driven.prototype.amplitude = function () { return Math.max(Math.abs(this.lastPos), Math.abs(this.lastNeg)); };
  // has the swing settled into a steady size at this driving frequency? Returns that size (radians) or 0.
  // The last 7 high points must agree within a tolerance that shrinks with the time they span, so a swing
  // still growing slowly (little damping) is not mistaken for a steady one.
  Driven.prototype.settled = function () {
    var p = this.peaks, n = p.length / 2;
    if (!this.motor || n < 7 || this.since < 3 / this.f) return 0;
    var lo = Infinity, hi = -Infinity, sum = 0;
    for (var i = n - 7; i < n; i++) { var v = p[2 * i + 1]; if (v < lo) lo = v; if (v > hi) hi = v; sum += v; }
    var mean = sum / 7; if (mean <= 0) return 0;
    var span = p[2 * (n - 1)] - p[2 * (n - 7)], spread = (hi - lo) / mean;
    return spread < Math.min(0.005, 0.01 * this.gamma * span / 2) ? mean : 0;
  };
  // how far the swing lags behind the motor's push, from the latest high point (radians, 0 to 2π)
  Driven.prototype.lag = function () {
    var p = this.peaks, n = p.length / 2; if (n < 1) return NaN;
    var ago = this.t - p[2 * (n - 1)];
    var ph = (this.psi - TAU * this.f * ago) % TAU; if (ph < 0) ph += TAU;
    return ph;
  };
  function naturalFreq(L, g) { return Math.sqrt(g / L) / TAU; }
  // the textbook steady-state answer for small swings: A = (F₀/mL) / √((ω₀² − ω²)² + (γω)²)
  function ampTheory(o, f) {
    var w0s = o.g / o.L, w = TAU * f;
    return (o.F0 / (o.m * o.L)) / Math.sqrt((w0s - w * w) * (w0s - w * w) + o.gamma * o.gamma * w * w);
  }
  function lagTheory(o, f) { var w0s = o.g / o.L, w = TAU * f; return Math.atan2(o.gamma * w, w0s - w * w); }

  /* A fast, hidden run that measures the whole resonance curve: it steps the driving frequency up through
     a list, waits for the swing to settle at each one (continuing from the last), then measures the swing.
     run(maxSteps) does a slice of the work so the curve can be drawn point by point. */
  function Sweep(o) {
    this.o = { L: o.L, g: o.g, m: o.m, gamma: o.gamma, F0: o.F0 };
    var f0 = naturalFreq(o.L, o.g), list = [], i, half = Math.max(0.0015, o.gamma / TAU);   // half-width of the peak in Hz
    var fr = Math.sqrt(Math.max(0.01, o.g / o.L - o.gamma * o.gamma / 2)) / TAU;
    for (i = 0; i <= 30; i++) list.push(f0 * (0.45 + 1.1 * i / 30));
    for (i = -14; i <= 14; i++) list.push(fr + half * 4 * i / 14);
    list = list.filter(function (f) { return f > f0 * 0.44 && f < f0 * 1.56; }).sort(function (a, b) { return a - b; });
    this.list = list.filter(function (f, j) { return j === 0 || f - list[j - 1] > 1e-5; });
    this.i = 0; this.points = []; this.done = false;
    this.sim = new Driven({ L: o.L, g: o.g, m: o.m, gamma: o.gamma, F0: o.F0, f: this.list[0], motor: true });
    this.dt = Math.min(0.005, 1 / (this.list[this.list.length - 1] * 200));
    this._begin();
  }
  Sweep.prototype._begin = function () {
    var f = this.list[this.i], T = 1 / f;
    this.sim.f = f; this.tIn = 0;
    this.settle = Math.max(12 * T, 7 / this.o.gamma); this.win = 2 * T; this.hi = 0; this.lo = 0;
  };
  Sweep.prototype.run = function (maxSteps) {
    var made = 0;
    for (var n = 0; n < maxSteps && !this.done; n++) {
      this.sim.step(this.dt); this.tIn += this.dt;
      if (this.tIn > this.settle) { var th = this.sim.s[0]; if (th > this.hi) this.hi = th; if (th < this.lo) this.lo = th; }
      if (this.tIn >= this.settle + this.win) {
        this.points.push({ f: this.list[this.i], a: 0.5 * (this.hi - this.lo) }); made++;
        this.i++;
        if (this.i >= this.list.length) this.done = true; else this._begin();
      }
    }
    return made;
  };

  var M = {
    TAU: TAU, GRAV: GRAV, ellipK: ellipK, periodFactor: periodFactor, smallPeriod: smallPeriod, exactPeriod: exactPeriod, lengthFor: lengthFor,
    rk4Free: rk4Free, Wave: Wave, Coupled: Coupled, Driven: Driven, Sweep: Sweep, naturalFreq: naturalFreq, ampTheory: ampTheory, lagTheory: lagTheory
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.PendModel = M;
})(this);
