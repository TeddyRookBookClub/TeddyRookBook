/* Newton's Laws, Chapter 4 (Forces at Work): the models behind the ramp lab, the elevator scale and the Atwood machine.
   window.NL4Phys in the browser, module.exports in node (tested in /tmp/work_nl2/test_forces.js).
   Units: SI throughout (kg, m, s, N). Angles in radians unless a name ends in Deg. */
(function (root) {
  'use strict';
  var G = 9.80665; // standard gravity, m/s² (exact, by definition)

  /* Friction coefficients from OpenStax University Physics Volume 1, Table 6.1 (approximate values).
     Where the table gives a range (rubber on wet concrete), the middle of the range is used. */
  var MATERIALS = [
    { id: 'rubber', name: 'Rubber on dry concrete', us: 1.0, uk: 0.7, look: 'rubber' },
    { id: 'rubberwet', name: 'Rubber on wet concrete', us: 0.6, uk: 0.4, look: 'rubber', range: true },
    { id: 'shoes', name: 'Shoes on wood', us: 0.9, uk: 0.7, look: 'shoe' },
    { id: 'steel', name: 'Steel on steel (dry)', us: 0.6, uk: 0.3, look: 'steel' },
    { id: 'wood', name: 'Wood on wood', us: 0.5, uk: 0.3, look: 'wood' },
    { id: 'metalwood', name: 'Metal on wood', us: 0.5, uk: 0.3, look: 'steel' },
    { id: 'snow', name: 'Waxed wood on wet snow', us: 0.14, uk: 0.1, look: 'ski' },
    { id: 'shoesice', name: 'Shoes on ice', us: 0.1, uk: 0.05, look: 'shoe' },
    { id: 'oiled', name: 'Steel on steel (oiled)', us: 0.05, uk: 0.03, look: 'steel' },
    { id: 'steelice', name: 'Steel on ice', us: 0.04, uk: 0.02, look: 'steel' },
    { id: 'teflon', name: 'Teflon on steel', us: 0.04, uk: 0.04, look: 'teflon' }
  ];
  function material(id) { for (var i = 0; i < MATERIALS.length; i++) if (MATERIALS[i].id === id) return MATERIALS[i]; return MATERIALS[4]; }

  /* ---------- the ramp ----------
     A block of mass m on a ramp tilted by theta. x is measured along the ramp from the bottom, uphill positive; v likewise.
     The push P acts along the ramp (uphill positive), so it does not change the normal force.
     p = { m, theta, us, uk, P, g } */
  function rampForces(v, p) {
    var g = p.g === undefined ? G : p.g, m = p.m, th = p.theta;
    var W = m * g, Wpar = W * Math.sin(th), Wperp = W * Math.cos(th);
    var N = Wperp;                       // nothing else pushes across the ramp
    var drive = p.P - Wpar;              // everything along the ramp except friction (uphill positive)
    var fmaxS = p.us * N, fK = p.uk * N, f, kind, a;
    if (v === 0) {
      if (Math.abs(drive) <= fmaxS * (1 + 1e-12)) { f = -drive; kind = 'static'; a = 0; }
      else { f = -Math.sign(drive) * fK; kind = 'kinetic'; a = (drive + f) / m; }
    } else { f = -Math.sign(v) * fK; kind = 'kinetic'; a = (drive + f) / m; }
    if (Math.abs(f) < 1e-12) f = 0;
    return { W: W, Wpar: Wpar, Wperp: Wperp, N: N, P: p.P, f: f, fmaxS: fmaxS, fK: fK, kind: kind, drive: drive, net: drive + f, a: a };
  }
  /* Advance the block by dt. While the block slides one way, every force is constant, so the motion is exact uniform acceleration;
     the only event is the block coming to rest, found exactly, after which static friction decides whether it stays. */
  function rampStep(s, p, dt) {
    var left = dt, guard = 0, slid = 0;
    while (left > 1e-15 && guard++ < 6) {
      var F = rampForces(s.v, p), a = F.a;
      if (s.v === 0 && a === 0) break;   // held by static friction
      if (s.v !== 0 && a !== 0 && Math.sign(a) !== Math.sign(s.v)) {
        var tStop = -s.v / a;
        if (tStop <= left) {
          var dx = s.v * tStop + 0.5 * a * tStop * tStop;
          s.x += dx; slid += Math.abs(dx); s.v = 0; left -= tStop; continue;
        }
      }
      var d = s.v * left + 0.5 * a * left * left;
      s.x += d; slid += Math.abs(d); s.v += a * left; left = 0;
      if (Math.abs(s.v) < 1e-13) s.v = 0;
    }
    s.t = (s.t || 0) + dt;
    return slid;                          // distance slid in this step (for the friction work)
  }
  /* useful closed forms */
  function slipAngle(us) { return Math.atan(us); }                 // a resting block starts to slide when tan θ > μs
  function steadyAngle(uk) { return Math.atan(uk); }               // a sliding block keeps its speed when tan θ = μk
  function holdMin(p) { var g = p.g === undefined ? G : p.g; return Math.max(0, p.m * g * (Math.sin(p.theta) - p.us * Math.cos(p.theta))); }
  function holdMax(p) { var g = p.g === undefined ? G : p.g; return p.m * g * (Math.sin(p.theta) + p.us * Math.cos(p.theta)); } // more than this and it starts uphill
  function steadyPushUp(p) { var g = p.g === undefined ? G : p.g; return p.m * g * (Math.sin(p.theta) + p.uk * Math.cos(p.theta)); }

  /* ---------- the elevator ----------
     A ride is a list of phases {a, t} (acceleration in m/s², up positive; duration in s). The scale pushes up on the rider with
     N = m (g + a): Newton's second law for the rider, N − m g = m a. In free fall (a = −g) it reads zero. */
  var RIDES = {
    up:   { name: 'Ride up', phases: [{ a: 0, t: 1 }, { a: 1.2, t: 2.5 }, { a: 0, t: 5 }, { a: -1.2, t: 2.5 }, { a: 0, t: 1.5 }] },
    down: { name: 'Ride down', phases: [{ a: 0, t: 1 }, { a: -1.2, t: 2.5 }, { a: 0, t: 5 }, { a: 1.2, t: 2.5 }, { a: 0, t: 1.5 }] },
    drop: { name: 'Drop tower', phases: [{ a: 0, t: 1.5 }, { a: -G, t: 2 }, { a: 2 * G, t: 1 }, { a: 0, t: 1.5 }] }
  };
  function rideDuration(r) { var T = 0; r.phases.forEach(function (ph) { T += ph.t; }); return T; }
  /* exact position, velocity and acceleration at time t (piecewise-constant acceleration) */
  function rideAt(r, t) {
    var y = 0, v = 0, T = 0, i, ph, a = 0;
    for (i = 0; i < r.phases.length; i++) {
      ph = r.phases[i];
      var dt = Math.min(ph.t, Math.max(0, t - T));
      a = ph.a;
      y += v * dt + 0.5 * a * dt * dt; v += a * dt;
      if (t < T + ph.t) return { y: y, v: v, a: a, phase: i };
      T += ph.t;
    }
    return { y: y, v: v, a: 0, phase: r.phases.length - 1, done: true };
  }
  function scale(m, a, g) { return m * ((g === undefined ? G : g) + a); }

  /* ---------- the Atwood machine ----------
     Two masses on a light rope over a light, frictionless pulley. m1 on the left, m2 on the right; a is the acceleration of m1 downward. */
  function atwood(m1, m2, g) {
    g = g === undefined ? G : g;
    var a = (m1 - m2) * g / (m1 + m2), T = 2 * m1 * m2 * g / (m1 + m2);
    return { a: a, T: T, w1: m1 * g, w2: m2 * g };
  }

  var API = { G: G, MATERIALS: MATERIALS, material: material, rampForces: rampForces, rampStep: rampStep, slipAngle: slipAngle,
    steadyAngle: steadyAngle, holdMin: holdMin, holdMax: holdMax, steadyPushUp: steadyPushUp,
    RIDES: RIDES, rideDuration: rideDuration, rideAt: rideAt, scale: scale, atwood: atwood };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.NL4Phys = API;
})(this);
