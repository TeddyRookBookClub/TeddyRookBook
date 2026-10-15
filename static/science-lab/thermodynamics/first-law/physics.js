/* Energy and the First Law: the models behind the page. Works in the browser (window.ThermoFirst) and in node
   (module.exports) for the tests in /tmp/work_th.

   1. Piston: n moles of helium (an ideal monatomic gas, U = 3/2 n R T, γ = 5/3) in a cylinder under a light piston, with
      the air outside at 101.325 kPa. Every process is quasi-static: the gas is always in balance, so it has one pressure,
      P = nRT/V. Each small step is split in two exact parts:
        (a) heat: at fixed volume, the gas trades heat with whatever touches the cylinder (a flame, ice, a water bath, or
            nothing when insulated). Newton cooling toward that temperature is solved exactly: T → Tr + (T − Tr)·e^(−G h / C_V).
            Q = C_V ΔT.
        (b) work: the piston moves to its new volume along an adiabat, T V^(γ−1) = constant, and the work done by the gas
            is W = −ΔU = C_V (T_before − T_after), which is exactly ∫ P dV along that curve.
      So ΔU = Q − W holds in every step to rounding, and the path on the P–V diagram is the real one.
   2. Joule: weights fall and turn paddles in an insulated tank of water. All of the weights' lost potential energy M g h
      ends up as internal energy of the water (the paddles keep the weights falling slowly, so very little goes into motion).

   Constants: R = N_A k = 8.314462618 J/(mol·K) (exact since 2019, NIST); g = 9.80665 m/s² (standard gravity). */
(function (root) {
  'use strict';
  var R = 8.314462618;
  var G0 = 9.80665;
  var GAMMA = 5 / 3;
  var P_ATM = 101325;           // Pa
  var AREA = 0.01;              // m², a piston 10 cm × 10 cm
  var VMIN = 0.4e-3, VMAX = 5e-3;  // m³: the stops
  var WEIGHT = 20;              // kg each
  var C_WATER = 4186;           // J/(kg·K), OpenStax
  // what can touch the cylinder: a temperature (K) and a thermal conductance (W/K)
  var CONTACT = {
    insulated: null,
    flame: { T: 1800, G: 0.04 },   // a gas flame: about 60 W into the gas at room temperature
    ice: { T: 273.15, G: 0.45 },   // melting ice
    bath: { T: 300, G: 40 }        // a big stirred water bath: holds the gas near its own temperature
  };

  function Piston(o) {
    o = o || {};
    this.n = o.n || 0.1; this.Cv = 1.5 * R * this.n;
    this.T = o.T || 300; this.V = o.V || this.n * R * this.T / P_ATM;
    this.heat = o.heat || 'insulated'; this.mode = o.mode || 'hand';  // piston: 'locked', 'weights', 'hand'
    this.weights = o.weights || 0; this.pExt = this.targetPExt();
    this.handV = this.V; this.rate = o.rate || 2.5e-3;               // fastest the piston moves, m³/s (2.5 L/s)
    this.bathT = o.bathT || 300;
    this.Q = 0; this.W = 0; this.U0 = this.U(); this.time = 0;
  }
  Piston.prototype.P = function () { return this.n * R * this.T / this.V; };
  Piston.prototype.U = function () { return this.Cv * this.T; };
  Piston.prototype.dU = function () { return this.U() - this.U0; };
  Piston.prototype.targetPExt = function () { return P_ATM + this.weights * WEIGHT * G0 / AREA; };
  Piston.prototype.zero = function () { this.Q = 0; this.W = 0; this.U0 = this.U(); };
  Piston.prototype.contact = function () {
    var c = CONTACT[this.heat]; if (!c) return null;
    return this.heat === 'bath' ? { T: this.bathT, G: c.G } : c;
  };
  // the volume the piston wants to reach now
  Piston.prototype.goal = function () {
    if (this.mode === 'locked') return this.V;
    if (this.mode === 'hand') return clamp(this.handV, VMIN, VMAX);
    // weights: the volume where the gas pressure, after an adiabatic move, equals the outside pressure
    return clamp(this.V * Math.pow(this.P() / this.pExt, 1 / GAMMA), VMIN, VMAX);
  };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // advance by dt seconds; returns the heat and work of this call
  Piston.prototype.step = function (dt) {
    var nsub = Math.max(1, Math.ceil(dt / 0.002)), h = dt / nsub, q = 0, w = 0;
    var pT = this.targetPExt();
    for (var s = 0; s < nsub; s++) {
      // the weights go on or off gently, like pouring sand
      this.pExt += (pT - this.pExt) * (1 - Math.exp(-h / 0.35));
      // (a) heat at fixed volume
      var c = this.contact();
      if (c) { var T1 = c.T + (this.T - c.T) * Math.exp(-c.G * h / this.Cv), dq = this.Cv * (T1 - this.T); this.T = T1; q += dq; }
      // (b) the piston moves along an adiabat
      var Vg = this.goal(), dV = clamp(Vg - this.V, -this.rate * h, this.rate * h);
      if (dV !== 0) {
        var V2 = this.V + dV, T2 = this.T * Math.pow(this.V / V2, GAMMA - 1);
        w += this.Cv * (this.T - T2); this.T = T2; this.V = V2;
      }
    }
    this.Q += q; this.W += w; this.time += dt;
    return { q: q, w: w };
  };
  // an adiabat or isotherm through a point, for drawing: P at volume V
  function isothermP(n, T, V) { return n * R * T / V; }
  function adiabatP(P0, V0, V) { return P0 * Math.pow(V0 / V, GAMMA); }
  // the signed area inside a closed path of [V, P] points (positive when it runs clockwise on a P–V diagram)
  function loopArea(pts) {
    var a = 0; for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; a += (q[0] - p[0]) * (q[1] + p[1]) / 2; }
    return a;
  }

  // ------------------------------------------------------------ 2. Joule's paddle wheel
  // M: each of the two weights, kg; h: how far they fall, m; mw: water, kg. Returns the rise in temperature for one drop.
  function jouleRise(M, h, mw) { return 2 * M * G0 * h / (mw * C_WATER); }
  function jouleHeight(M, mw, dT) { return mw * C_WATER * dT / (2 * M * G0); }

  var api = { R: R, G0: G0, GAMMA: GAMMA, P_ATM: P_ATM, AREA: AREA, VMIN: VMIN, VMAX: VMAX, WEIGHT: WEIGHT, C_WATER: C_WATER, CONTACT: CONTACT,
    Piston: Piston, isothermP: isothermP, adiabatP: adiabatP, loopArea: loopArea, jouleRise: jouleRise, jouleHeight: jouleHeight };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ThermoFirst = api;
})(this);
