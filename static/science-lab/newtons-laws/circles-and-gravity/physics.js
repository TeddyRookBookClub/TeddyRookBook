/* Newton's Laws, Chapter 6 (Circles and Gravity): the models behind the whirled ball, the car on a curve, Newton's Moon test
   and the Cavendish torsion balance. window.NL6Phys in the browser, module.exports in node (tested in /tmp/work_nl2/test_circles.js).
   SI units throughout. */
(function (root) {
  'use strict';
  var G0 = 9.80665;                    // standard gravity, m/s² (exact)
  var K = {
    G: 6.67430e-11,                    // Newtonian constant of gravitation, m³ kg⁻¹ s⁻² (CODATA 2022, NIST), ±0.00015e-11
    GM_EARTH: 3.98600e14,              // m³/s² (NASA Earth Fact Sheet: 0.39860 × 10⁶ km³/s²)
    R_EARTH: 6.371e6,                  // volumetric mean radius, m (NASA Earth Fact Sheet)
    M_EARTH: 5.9722e24,                // kg (NASA Earth Fact Sheet)
    MOON_A: 3.844e8,                   // semimajor axis of the Moon's orbit, m (NASA Moon Fact Sheet)
    MOON_T: 27.3217 * 86400            // sidereal orbit period, s (NASA Moon Fact Sheet)
  };
  var TAU = 2 * Math.PI;

  /* ---------- the whirled ball ----------
     The ball moves counterclockwise on a circle of radius r about the origin at speed v. Angle phi from the +x axis. */
  function onCircle(r, v, phi) { return { x: r * Math.cos(phi), y: r * Math.sin(phi), vx: -v * Math.sin(phi), vy: v * Math.cos(phi) }; }
  function tension(m, v, r) { return m * v * v / r; }         // the string must pull inward with m v² / r
  /* After the string is cut at angle phi, no horizontal force acts: straight-line motion along the tangent. */
  function flight(r, v, phi, t) { var p = onCircle(r, v, phi); return { x: p.x + p.vx * t, y: p.y + p.vy * t }; }
  /* time at which a ray from (x, y) with velocity (vx, vy) first comes within R of (cx, cy), or null */
  function rayHit(x, y, vx, vy, cx, cy, R) {
    var dx = x - cx, dy = y - cy, A = vx * vx + vy * vy, B = 2 * (dx * vx + dy * vy), C = dx * dx + dy * dy - R * R;
    if (C <= 0) return 0;
    var disc = B * B - 4 * A * C; if (disc < 0 || A === 0) return null;
    var t = (-B - Math.sqrt(disc)) / (2 * A); return t >= 0 ? t : null;
  }
  /* the release angle that sends a counterclockwise ball straight at a target (tx, ty) outside the circle */
  function aimAngle(r, tx, ty) { var D = Math.hypot(tx, ty); return Math.atan2(ty, tx) - Math.acos(r / D); }

  /* ---------- a car on a banked curve ----------
     Bank angle th (0 = flat), radius r, speed v. Friction f is positive when it points down the slope (toward the inside).
     Horizontal: N sin th + f cos th = m v²/r.  Vertical: N cos th − f sin th = m g. */
  function curve(m, v, r, th, g) {
    g = g === undefined ? G0 : g;
    var ac = v * v / r, N = m * (g * Math.cos(th) + ac * Math.sin(th)), f = m * (ac * Math.cos(th) - g * Math.sin(th));
    return { ac: ac, N: N, f: f, W: m * g, Fc: m * ac };
  }
  function vIdeal(r, th, g) { g = g === undefined ? G0 : g; return Math.sqrt(r * g * Math.tan(th)); }
  function vMax(r, th, mu, g) {
    g = g === undefined ? G0 : g;
    var den = Math.cos(th) - mu * Math.sin(th); if (den <= 0) return Infinity;
    return Math.sqrt(r * g * (Math.sin(th) + mu * Math.cos(th)) / den);
  }
  function vMin(r, th, mu, g) {
    g = g === undefined ? G0 : g;
    var num = Math.sin(th) - mu * Math.cos(th); if (num <= 0) return 0;
    return Math.sqrt(r * g * num / (Math.cos(th) + mu * Math.sin(th)));
  }
  /* while skidding, kinetic friction gives the most sideways acceleration it can */
  function skidAccel(th, muk, outward, g) {
    g = g === undefined ? G0 : g;
    if (outward) { var den = Math.cos(th) - muk * Math.sin(th); return den <= 0 ? Infinity : g * (Math.sin(th) + muk * Math.cos(th)) / den; }
    return Math.max(0, g * (Math.sin(th) - muk * Math.cos(th)) / (Math.cos(th) + muk * Math.sin(th)));
  }
  /* loop-the-loop: at the top, N + m g = m v²/r, so the track can push only if v² ≥ g r */
  function loopTop(m, v, r, g) { g = g === undefined ? G0 : g; return { N: m * v * v / r - m * g, vmin: Math.sqrt(g * r) }; }

  /* ---------- Newton's Moon test ---------- */
  function moonTest() {
    var r = K.MOON_A, T = K.MOON_T, a = 4 * Math.PI * Math.PI * r / (T * T), v = TAU * r / T, d = r / K.R_EARTH;
    return { r: r, T: T, v: v, a: a, ratio: d, gOver3600: G0 / 3600, gOverD2: G0 / (d * d), fall1s: a / 2, fall60s: a * 3600 / 2, apple1s: G0 / 2 };
  }
  /* how far an orbiting body drops below its straight-line (tangent) path after time t: exact geometry for a circle */
  function dropBelowTangent(r, T, t) { var a = TAU * t / T, h = Math.sin(a / 2); return r * 2 * h * h / Math.cos(a); } // r (sec a − 1), written to avoid round-off

  /* ---------- the Cavendish torsion balance ----------
     Two small balls m on a rod of length L (each L/2 from the fiber), two big balls M at center distance d.
     A fiber of torsion constant kappa; free period T0 = 2π √(I/κ) with I = 2 m (L/2)². */
  var CAV = { M: 158, m: 0.73, L: 1.8, d: 0.225, T0: 450 };    // Cavendish's apparatus (rounded): 348 lb, 1.61 lb, 6 ft, 8.85 in, 7.5 min
  function cavendish(o) {
    o = o || CAV; var G = o.G || K.G;
    var I = 2 * o.m * (o.L / 2) * (o.L / 2), kappa = 4 * Math.PI * Math.PI * I / (o.T0 * o.T0);
    var F = G * o.M * o.m / (o.d * o.d), torque = F * o.L, theta = torque / kappa;
    return { I: I, kappa: kappa, F: F, torque: torque, theta: theta, tip: theta * o.L / 2 };
  }
  /* G from what Cavendish could measure: the period and the deflection (equilibrium shift from zero) */
  function gFromSwing(o, T, theta) { return 2 * Math.PI * Math.PI * o.L * o.d * o.d * theta / (o.M * T * T); }
  /* damped swing: I θ'' + c θ' + κ (θ − θeq(t)) = 0, advanced with RK4 */
  function swingStep(s, p, dt) {
    function acc(th, om) { return (-p.kappa * (th - p.eq) - p.c * om) / p.I; }
    var k1t = s.om, k1o = acc(s.th, s.om);
    var k2t = s.om + 0.5 * dt * k1o, k2o = acc(s.th + 0.5 * dt * k1t, s.om + 0.5 * dt * k1o);
    var k3t = s.om + 0.5 * dt * k2o, k3o = acc(s.th + 0.5 * dt * k2t, s.om + 0.5 * dt * k2o);
    var k4t = s.om + dt * k3o, k4o = acc(s.th + dt * k3t, s.om + dt * k3o);
    s.th += dt / 6 * (k1t + 2 * k2t + 2 * k3t + k4t); s.om += dt / 6 * (k1o + 2 * k2o + 2 * k3o + k4o); s.t += dt;
  }
  /* weighing the Earth: from g = G M / R² */
  function earthMass(G, g, R) { return g * R * R / G; }

  var API = { G0: G0, K: K, onCircle: onCircle, tension: tension, flight: flight, rayHit: rayHit, aimAngle: aimAngle,
    curve: curve, vIdeal: vIdeal, vMax: vMax, vMin: vMin, skidAccel: skidAccel, loopTop: loopTop,
    moonTest: moonTest, dropBelowTangent: dropBelowTangent, CAV: CAV, cavendish: cavendish, gFromSwing: gFromSwing, swingStep: swingStep, earthMass: earthMass };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.NL6Phys = API;
})(this);
