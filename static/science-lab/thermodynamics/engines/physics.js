/* Engines, Refrigerators and Heat Pumps (/science-lab/thermodynamics/engines/): the models, kept apart from the drawing so
   they can be tested in Node. window.Th4Phys (or module.exports):
   Carnot(p)    an ideal-gas Carnot cycle: corners, heats, work, and any point along the way
   Stirling(p)  a low-temperature-difference Stirling engine (ideal isothermal "Schmidt" model) with a flywheel and friction
   cop(...)     Carnot limits for refrigerators and heat pumps; otto(r, γ) the ideal Otto-cycle efficiency */
(function (root) {
  'use strict';
  var R = 8.314462618;          // J/(mol·K), exact (N_A × k)

  /* ---------- the Carnot cycle ----------
     Corners: 1 (V1, Th) → isothermal expansion → 2 (V2 = r V1, Th) → adiabatic expansion → 3 (V3, Tc)
              → isothermal compression → 4 (V4, Tc) → adiabatic compression → back to 1.
     On the adiabats T V^(γ−1) stays the same, so V3/V2 = V4/V1 = (Th/Tc)^(1/(γ−1)). */
  function Carnot(p) {
    var n = p.n || 0.04, g = p.gamma || 5 / 3, Th = p.Th, Tc = p.Tc, V1 = p.V1 || 1e-3, r = p.r || 2;
    var a = Math.pow(Th / Tc, 1 / (g - 1)), V2 = r * V1, V3 = V2 * a, V4 = V1 * a, Cv = R / (g - 1);
    this.n = n; this.gamma = g; this.Th = Th; this.Tc = Tc; this.V = [V1, V2, V3, V4]; this.adRatio = a; this.Cv = Cv;
    this.Qh = n * R * Th * Math.log(r); this.Qc = n * R * Tc * Math.log(r); this.W = this.Qh - this.Qc;
    this.eff = 1 - Tc / Th; this.copR = Tc / (Th - Tc); this.copP = Th / (Th - Tc);
    this.Wad = n * Cv * (Th - Tc);
  }
  /* state at a point along the cycle: stage k = 0..3 and fraction f in [0, 1]; heat and work counted from corner 1 */
  Carnot.prototype.at = function (k, f) {
    var V = this.V, n = this.n, g = this.gamma, Th = this.Th, Tc = this.Tc, o = { k: k, f: f };
    if (k === 0) { o.V = V[0] * Math.pow(V[1] / V[0], f); o.T = Th; o.Qin = n * R * Th * Math.log(o.V / V[0]); o.Qout = 0; o.W = o.Qin; }
    else if (k === 1) { o.V = V[1] * Math.pow(V[2] / V[1], f); o.T = Th * Math.pow(V[1] / o.V, g - 1); o.Qin = this.Qh; o.Qout = 0; o.W = this.Qh + n * this.Cv * (Th - o.T); }
    else if (k === 2) { o.V = V[2] * Math.pow(V[3] / V[2], f); o.T = Tc; o.Qin = this.Qh; o.Qout = n * R * Tc * Math.log(V[2] / o.V); o.W = this.Qh + this.Wad - o.Qout; }
    else { o.V = V[3] * Math.pow(V[0] / V[3], f); o.T = Tc * Math.pow(V[3] / o.V, g - 1); o.Qin = this.Qh; o.Qout = this.Qc; o.W = this.Qh + this.Wad - this.Qc - n * this.Cv * (o.T - Tc); }
    o.P = n * R * o.T / o.V;
    return o;
  };
  /* entropy of the gas relative to corner 1: S = n Cv ln(T/Th) + n R ln(V/V1) */
  Carnot.prototype.entropy = function (o) { return this.n * this.Cv * Math.log(o.T / this.Th) + this.n * R * Math.log(o.V / this.V[0]); };

  /* ---------- the Stirling engine ----------
     A flat displacer chamber sits on a hot plate (bottom, T_h) under a cool top plate (T_c). A loose foam displacer moves the
     air between the hot and cold spaces; a small power piston on top turns the flywheel. The displacer is a quarter turn
     ahead of the piston. Ideal isothermal model: the air in each space is at that space's temperature, the pressure is the
     same everywhere: P = n R / (V_h/T_h + V_c/T_c). SI units. */
  function Stirling(p) {
    p = p || {};
    this.VD = p.VD || 3.1e-5;      // displacer swept volume, m³ (10 cm across, 4 mm stroke)
    this.Vdead = p.Vdead || 1.6e-5; // air that is always there (gaps around the displacer), m³
    this.Ap = p.Ap || 2.0e-4;      // power piston area, m² (16 mm across)
    this.sp = p.sp || 0.012;       // power piston stroke, m
    this.I = p.I || 1.0e-4;        // flywheel moment of inertia, kg·m²
    this.tf = p.tf || 0.5e-3;      // dry friction torque, N·m
    this.b = p.b || 1.0e-4;        // viscous friction, N·m·s
    this.P0 = 101325; this.Troom = p.Troom || 295;
    this.Th = p.Th || 295; this.Tc = p.Tc || 295;
    var Vmean = this.Vdead + this.VD + this.Ap * this.sp / 2;
    this.nR = this.P0 * Vmean / this.Troom;   // n R: sealed at room temperature and air pressure
    this.th = 0; this.w = 0; this.work = 0; this.fric = 0; this.revs = 0;
  }
  Stirling.prototype.vols = function (th) {
    var zp = (1 - Math.cos(th)) / 2, zd = (1 + Math.sin(th)) / 2;   // displacer leads the piston by 90°
    var Vh = this.Vdead / 2 + this.VD * zd, Vc = this.Vdead / 2 + this.VD * (1 - zd) + this.Ap * this.sp * zp;
    return { zp: zp, zd: zd, Vh: Vh, Vc: Vc, V: Vh + Vc };
  };
  Stirling.prototype.pressure = function (th) { var v = this.vols(th); return this.nR / (v.Vh / this.Th + v.Vc / this.Tc); };
  /* torque from the air on the crank: (P − P_atm) × piston area × d(piston height)/dθ */
  Stirling.prototype.torque = function (th) { return (this.pressure(th) - this.P0) * this.Ap * (this.sp / 2) * Math.sin(th); };
  Stirling.prototype.step = function (dt) {
    var tg = this.torque(this.th), w = this.w;
    if (Math.abs(w) < 1e-3 && Math.abs(tg) <= this.tf) { this.w = 0; return; }   // stuck: dry friction holds it
    var tfr = -(w !== 0 ? Math.sign(w) : Math.sign(tg)) * this.tf - this.b * w;
    var a = (tg + tfr) / this.I, w1 = w + a * dt;
    if (w !== 0 && Math.sign(w1) !== Math.sign(w) && Math.abs(tg) <= this.tf) w1 = 0;   // friction stops it, never reverses it
    var dth = w1 * dt, tg1 = this.torque(this.th + dth);
    this.work += 0.5 * (tg + tg1) * dth; this.fric += -tfr * dth;
    this.th += dth; this.w = w1;
    this.revs += dth / (2 * Math.PI);
  };
  /* net work by the air in one turn (forward direction), by Simpson's rule: W = ∮ P dV */
  Stirling.prototype.cycleWork = function (m) {
    m = m || 720; var s = 0, h = 2 * Math.PI / m;
    for (var i = 0; i <= m; i++) { var t = i * h, wgt = i === 0 || i === m ? 1 : i % 2 ? 4 : 2; s += wgt * this.torque(t); }
    return s * h / 3;
  };

  /* ---------- refrigerators, heat pumps, and the Otto cycle ---------- */
  function copHeat(Th, Tc) { return Th / (Th - Tc); }
  function copCool(Th, Tc) { return Tc / (Th - Tc); }
  function otto(r, g) { return 1 - Math.pow(r, 1 - g); }
  var C2K = 273.15;

  var API = { R: R, Carnot: Carnot, Stirling: Stirling, copHeat: copHeat, copCool: copCool, otto: otto, C2K: C2K, BTU_PER_KWH: 3412 };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Th4Phys = API;
})(this);
