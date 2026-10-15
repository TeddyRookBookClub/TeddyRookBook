/* Rocket Builder physics (window.RKPhys, or module.exports in node).
   A rocket of up to three stages flies in the plane of Earth's equator. Earth is a round ball of mean radius 6371 km with
   inverse-square gravity, and it can spin (then the launch pad and the air move east at about 465 m/s). The air is an
   exponential atmosphere (NASA Earth fact sheet: 1.217 kg/m³ at the surface, scale height 8.5 km), and drag is
   ½·ρ·v²·Cd·A with the speed measured against the moving air. Engine thrust changes with air pressure: the mass flow stays
   the same and the specific impulse slides from its sea-level value to its vacuum value as the pressure drops.
   State: position and velocity in an inertial frame centered on Earth (meters, m/s), mass (kg). Powered or in-air flight is
   integrated with fourth-order Runge–Kutta (0.04 s steps, cut short to land exactly on a burnout); coasting above the air
   uses the symplectic leapfrog (kick–drift–kick) with steps of 0.3 % of r/v, so orbits keep their energy for many laps.
   SI units throughout. */
(function (root) {
  'use strict';
  var G0 = 9.80665;            // standard gravity, m/s² (exact, NIST)
  var MU = 3.986004418e14;     // Earth's GM, m³/s² (WGS 84 / IERS)
  var RE = 6371000;            // Earth's volumetric mean radius, m (NASA Earth fact sheet)
  var OMEGA = 2 * Math.PI / 86164.0905; // Earth's spin, rad/s: one turn per sidereal day (JPL), 7.2921e-5
  var RHO0 = 1.217, HS = 8500; // surface air density kg/m³ and scale height m (NASA Earth fact sheet)
  var P0 = 101325;             // one standard atmosphere, Pa: sea-level Isp is quoted at this pressure
  var ATM_TOP = 200000;        // above 200 km the model's air (under 1e-10 kg/m³) is left out
  var CD = 0.5;                // drag coefficient of a slender rocket, held constant (real ones peak near Mach 1)
  var DEG = Math.PI / 180;

  // Parts. Engine figures are typical, rounded values for each kind of propellant (compare: F-1 kerosene/oxygen 263 s / 304 s,
  // RS-25 hydrogen/oxygen 366 s / 452 s, Shuttle solid booster 242 s / 268 s). A tank holds 10 t of propellant; its own mass is
  // set close to real stages (kerosene/oxygen tanks ≈ 6 % of the propellant, bulky hydrogen tanks ≈ 10 %, solid casings ≈ 12 %).
  var ENG = {
    kerolox: { name: 'Kerosene + oxygen', short: 'RP-1/LOX', ispSL: 280, ispVac: 310, Fvac: 1.0e6, mass: 1000, tankProp: 10000, tankDry: 600, bulk: 1030, bellD: 1.1, bell: 2.4 },
    hydrolox: { name: 'Hydrogen + oxygen', short: 'LH₂/LOX', ispSL: 360, ispVac: 450, Fvac: 0.5e6, mass: 800, tankProp: 10000, tankDry: 1000, bulk: 360, bellD: 1.3, bell: 2.8 },
    solid: { name: 'Solid motor', short: 'Solid', ispSL: 242, ispVac: 268, solid: true, segProp: 10000, segDry: 1200, nozzle: 500, burn: 100, bulk: 1800, motorD: 1.2, bellD: 0.8, bell: 1.6 }
  };
  // payloads (mass in kg, size of the nose fairing in meters)
  var PAYLOADS = {
    probe: { name: 'Science instruments', mass: 100, len: 2.4, D: 0.6 },
    small: { name: 'Small satellite', mass: 1000, len: 4.5, D: 1.6 },
    sat: { name: 'Large satellite', mass: 5000, len: 8, D: 3.2 },
    capsule: { name: 'Crew capsule', mass: 10000, len: 8, D: 3.9 },
    module: { name: 'Station module', mass: 20000, len: 13, D: 4.4 }
  };

  function density(h) { return h > ATM_TOP ? 0 : RHO0 * Math.exp(-Math.max(h, -2000) / HS); }
  function pressure(h) { return h > ATM_TOP ? 0 : P0 * Math.exp(-Math.max(h, -2000) / HS); }
  function isp(E, p) { return E.ispVac - (E.ispVac - E.ispSL) * p / P0; }

  // One stage's numbers from its parts: {type, engines, tanks}. For a solid stage, engines = motors and tanks = segments per motor.
  // Its width comes from the propellant's volume (tanks about six times as long as they are wide) or from the engines it must hold.
  function stageInfo(s) {
    var E = ENG[s.type], o = { type: s.type, E: E, engines: s.engines, tanks: s.tanks, solid: !!E.solid };
    if (E.solid) {
      o.prop = s.engines * s.tanks * E.segProp; o.dry = s.engines * (s.tanks * E.segDry + E.nozzle); o.mdot = o.prop / E.burn;
      o.D = E.motorD * (1 + 1.25 * (Math.sqrt(s.engines) - 1)); o.len = s.tanks * E.segProp / E.bulk / (Math.PI * E.motorD * E.motorD / 4);
    } else {
      o.prop = s.tanks * E.tankProp; o.dry = s.tanks * E.tankDry + s.engines * E.mass; o.mdot = s.engines * E.Fvac / (E.ispVac * G0);
      var V = o.prop / E.bulk; o.D = Math.max(Math.cbrt(4 * V / (6 * Math.PI)), E.bellD * (1.2 + 0.9 * (Math.sqrt(s.engines) - 1)), 1);
      o.len = V / (Math.PI * o.D * o.D / 4);
    }
    o.Fvac = o.mdot * E.ispVac * G0; o.Fsl = o.mdot * E.ispSL * G0; o.burn = o.prop / o.mdot; o.mass = o.dry + o.prop;
    return o;
  }
  // The whole design: {payload, stages:[bottom … top]}
  function analyze(d) {
    var pl = PAYLOADS[d.payload] || PAYLOADS.small, st = d.stages.map(stageInfo), n = st.length, i, above = pl.mass;
    for (i = n - 1; i >= 0; i--) {
      var s = st[i]; s.m0 = above + s.mass; s.mf = s.m0 - s.prop;
      s.dvVac = s.E.ispVac * G0 * Math.log(s.m0 / s.mf); s.dvSL = s.E.ispSL * G0 * Math.log(s.m0 / s.mf);
      s.twr = (i === 0 ? s.Fsl : s.Fvac) / (s.m0 * G0); above = s.m0;
    }
    var o = { stages: st, payload: pl, m0: above, n: n, dvVac: 0, prop: 0, dry: 0 };
    st.forEach(function (s) { o.dvVac += s.dvVac; o.prop += s.prop; o.dry += s.dry; });
    o.twr = st.length ? st[0].twr : 0;
    // the same parts flown as a single stage: every engine fires together and nothing is dropped
    var md = 0, fv = 0, fs = 0; st.forEach(function (s) { md += s.mdot; fv += s.Fvac; fs += s.Fsl; });
    o.mergedIsp = fv / (md * G0); o.dvMerged = o.mergedIsp * G0 * Math.log(o.m0 / (o.m0 - o.prop)); o.twrMerged = fs / (o.m0 * G0);
    o.signature = signature(d);
    o.D = pl.D; st.forEach(function (s) { o.D = Math.max(o.D, s.D); });
    o.cda = CD * Math.PI * o.D * o.D / 4;
    return o;
  }
  function signature(d) {
    var tot = {};
    d.stages.forEach(function (s) {
      var k = s.type, t = tot[k] || (tot[k] = { e: 0, t: 0 });
      if (ENG[k].solid) { t.e += s.engines; t.t += s.engines * s.tanks; } else { t.e += s.engines; t.t += s.tanks; }
    });
    return d.payload + '|' + Object.keys(tot).sort().map(function (k) { return k + ':' + tot[k].e + 'x' + tot[k].t; }).join(',');
  }

  // Orbit elements from a state (2-D): energy, angular momentum, eccentricity vector, periapsis and apoapsis radii, period.
  function elements(x, y, vx, vy) {
    var r = Math.hypot(x, y), v2 = vx * vx + vy * vy, eps = v2 / 2 - MU / r, h = x * vy - y * vx, rv = x * vx + y * vy;
    var ex = ((v2 - MU / r) * x - rv * vx) / MU, ey = ((v2 - MU / r) * y - rv * vy) / MU, e = Math.hypot(ex, ey);
    var p = h * h / MU, a = -MU / (2 * eps), rp = p / (1 + e), ra = eps < 0 ? a * (1 + e) : Infinity;
    return { r: r, v: Math.sqrt(v2), eps: eps, h: h, e: e, ex: ex, ey: ey, p: p, rp: rp, ra: ra, a: a, argp: Math.atan2(ey, ex),
      T: eps < 0 ? 2 * Math.PI * Math.sqrt(a * a * a / MU) : NaN, bound: eps < 0 };
  }

  // seconds until the next apoapsis of a bound orbit (vr: radial speed, to know which half of the orbit we are on)
  function timeToApo(el, vr) {
    if (!el.bound || el.e < 1e-4) return 0;
    var a = el.a, e = el.e, n = Math.sqrt(MU / (a * a * a)), cE = Math.max(-1, Math.min(1, (1 - el.r / a) / e)), E = Math.acos(cE);
    if (vr < 0) E = 2 * Math.PI - E;
    var M = E - e * Math.sin(E); return (Math.PI - M) / n + (M > Math.PI ? 2 * Math.PI / n : 0);
  }

  /* A flight. opts: {spin, drag, autoStage, target (m), kick (rad), mode ('auto'|'up'|'pro'|'man'), manPitch (rad), throttle (0–1)} */
  function Flight(design, opts) {
    opts = opts || {};
    var F = this, A = analyze(design);
    F.design = design; F.A = A; F.st = 0; F.n = A.n; F.payload = A.payload.mass; F.cda = A.cda;
    F.prop = A.stages.map(function (s) { return s.prop; });
    F.spin = opts.spin !== false; F.drag = opts.drag !== false; F.autoStage = opts.autoStage !== false;
    F.target = opts.target || 250000; F.turnH = opts.turnH || 90000; F.dtBurn = opts.dtBurn || 0.04; F.kick = opts.kick === undefined ? 5 * DEG : opts.kick;
    F.mode = opts.mode || 'auto'; F.manPitch = opts.manPitch === undefined ? 90 * DEG : opts.manPitch;
    F.throttle = opts.throttle === undefined ? 1 : opts.throttle;
    F.mu = opts.mu === undefined ? MU : opts.mu; // tests can switch gravity off
    F.t = 0; F.x = 0; F.y = RE; F.phi0 = Math.PI / 2;
    F.vx = F.spin ? OMEGA * RE : 0; F.vy = 0;
    F.m = A.m0; F.pitch = 90 * DEG; F.cmd = 90 * DEG; F.ap = 'vert';
    F.onPad = true; F.ignited = false; F.solidLit = false; F.ended = null;
    F.dv = 0; F.lossG = 0; F.lossD = 0; F.lossS = 0; F.padBurn = 0;
    F.maxQ = 0; F.maxAlt = 0; F.maxV = 0; F.q = 0; F.T = 0; F.mdot = 0; F.escaped = false;
    F.events = []; F.debris = []; F.liftoffMass = A.m0;
    F.s = new Float64Array(9); F.k = [new Float64Array(9), new Float64Array(9), new Float64Array(9), new Float64Array(9)]; F.tmp = new Float64Array(9);
  }
  var FP = Flight.prototype;
  FP.mass = function () { var m = this.payload; for (var i = this.st; i < this.n; i++) m += this.A.stages[i].dry + this.prop[i]; return m; };
  FP.alt = function () { return Math.hypot(this.x, this.y) - RE; };
  FP.stage = function () { return this.A.stages[this.st]; };
  // air velocity at (x, y): Earth's spin drags the air east, v_air = Ω × r with Ω pointing south (we look along it)
  FP.airVel = function (x, y) { return this.spin ? [OMEGA * y, -OMEGA * x] : [0, 0]; };
  FP.elements = function () { return elements(this.x, this.y, this.vx, this.vy); };
  // local frame: up (radial) and east
  FP.frame = function () { var r = Math.hypot(this.x, this.y), ux = this.x / r, uy = this.y / r; return { r: r, ux: ux, uy: uy, ex: uy, ey: -ux }; };
  FP.gammas = function () {
    var f = this.frame(), a = this.airVel(this.x, this.y), rx = this.vx - a[0], ry = this.vy - a[1];
    return { air: Math.atan2(rx * f.ux + ry * f.uy, rx * f.ex + ry * f.ey), inert: Math.atan2(this.vx * f.ux + this.vy * f.uy, this.vx * f.ex + this.vy * f.ey),
      vAir: Math.hypot(rx, ry), vr: this.vx * f.ux + this.vy * f.uy, vh: this.vx * f.ex + this.vy * f.ey, f: f };
  };
  // engine output now: thrust (N) and mass flow (kg/s) at altitude h
  FP.engine = function (h) {
    var s = this.stage(); if (!s || !this.ignited || this.prop[this.st] <= 0) return { T: 0, mdot: 0 };
    var thr = s.solid ? (this.solidLit ? 1 : 0) : Math.max(0, Math.min(1, this.throttle));
    if (thr <= 0) return { T: 0, mdot: 0 };
    var md = s.mdot * thr; return { T: md * G0 * isp(s.E, pressure(h)), mdot: md };
  };
  FP.ignite = function () {
    if (this.ended) return;
    if (this.onPad && !this.ignited && this.mode === 'auto' && !this.noPlan) this.plan();
    this.ignited = true; var s = this.stage();
    if (s && s.solid && this.throttle > 0) this.solidLit = true;
  };
  // Before launch the autopilot flies a few quick test flights with gentler or sharper pitch programs and keeps the one that
  // reaches orbit with the most propellant left and no very long coast (or, if none can, the one that gets the most orbital energy).
  FP.plan = function () {
    var best = null, cands = [35000, 50000, 70000, 95000, 125000, 165000, 220000];
    for (var i = 0; i < cands.length; i++) {
      var T = new Flight(this.design, { spin: this.spin, drag: this.drag, autoStage: true, target: this.target, turnH: cands[i], mode: 'auto', throttle: this.throttle, mu: this.mu, dtBurn: 0.1 });
      T.noPlan = true; T.ignite(); var guard = 0, eps = -1e99;
      while (!T.ended && T.ap !== 'done' && T.t < 3000 && guard++ < 2000) {
        T.advance(2); T.events.length = 0; T.debris.length = 0;
        var el = T.elements(); if (el.eps > eps) eps = el.eps;
        if (T.prop[T.st] <= 0 && T.st === T.n - 1) break;
      }
      var el2 = T.elements(), ok = T.ap === 'done' && el2.rp - RE > 140000, left = 0;
      for (var j = 0; j < T.n; j++) left += T.prop[j] * (j + 1);
      // prefer fuel left, but not at the price of a very long coast (2 kg for each second, per 100 t of rocket)
      var score = ok ? 1e12 + left - T.t * this.A.m0 * 1.5e-5 : eps;
      if (!best || score > best.score) best = { score: score, turnH: cands[i], ok: ok };
    }
    this.turnH = best.turnH; this.planOk = best.ok;
    return best;
  };

  // derivatives of s = [x, y, vx, vy, m, Δv used, gravity loss, drag loss, steering loss]. The losses are counted against the
  // speed relative to the ground (the frame that turns with Earth), so that while the engines burn
  //   Δv used = speed gained over the ground + gravity loss + drag loss + steering loss   (exactly: the Coriolis push does no work).
  FP.deriv = function (s, out, c) {
    var x = s[0], y = s[1], vx = s[2], vy = s[3], m = s[4], r = Math.hypot(x, y), ux = x / r, uy = y / r, ex = uy, ey = -ux;
    var g = this.mu / (r * r), gx = -g * ux, gy = -g * uy, h = r - RE;
    var ct = Math.cos(c.th), sn = Math.sin(c.th), tx = ct * ex + sn * ux, ty = ct * ey + sn * uy;
    var T = c.mdot > 0 ? c.mdot * G0 * isp(c.E, pressure(h)) : 0, aT = T / m;
    var w = this.spin ? OMEGA : 0, rx = vx - w * y, ry = vy + w * x, vrel = Math.hypot(rx, ry), Dm = 0;
    if (this.drag && h < ATM_TOP) Dm = 0.5 * density(h) * vrel * vrel * this.cda / m;
    var Dx = vrel > 0 ? -Dm * rx / vrel : 0, Dy = vrel > 0 ? -Dm * ry / vrel : 0;
    out[0] = vx; out[1] = vy; out[2] = aT * tx + Dx + gx; out[3] = aT * ty + Dy + gy; out[4] = -c.mdot;
    if (T > 0) {
      var hx, hy; if (vrel > 1e-6) { hx = rx / vrel; hy = ry / vrel; } else { hx = tx; hy = ty; }
      out[5] = aT; out[6] = (g - w * w * r) * (ux * hx + uy * hy); out[7] = Dm; out[8] = aT * (1 - (tx * hx + ty * hy));
    } else { out[5] = out[6] = out[7] = out[8] = 0; }
  };
  FP.rk4 = function (dt, c) {
    var s = this.s, k = this.k, t = this.tmp, i;
    s[0] = this.x; s[1] = this.y; s[2] = this.vx; s[3] = this.vy; s[4] = this.m; s[5] = this.dv; s[6] = this.lossG; s[7] = this.lossD; s[8] = this.lossS;
    this.deriv(s, k[0], c);
    for (i = 0; i < 9; i++) t[i] = s[i] + 0.5 * dt * k[0][i]; this.deriv(t, k[1], c);
    for (i = 0; i < 9; i++) t[i] = s[i] + 0.5 * dt * k[1][i]; this.deriv(t, k[2], c);
    for (i = 0; i < 9; i++) t[i] = s[i] + dt * k[2][i]; this.deriv(t, k[3], c);
    for (i = 0; i < 9; i++) s[i] += dt / 6 * (k[0][i] + 2 * k[1][i] + 2 * k[2][i] + k[3][i]);
    this.x = s[0]; this.y = s[1]; this.vx = s[2]; this.vy = s[3]; this.m = s[4]; this.dv = s[5]; this.lossG = s[6]; this.lossD = s[7]; this.lossS = s[8];
  };
  // leapfrog (kick–drift–kick) for coasting in vacuum
  FP.leap = function (dt) {
    var r = Math.hypot(this.x, this.y), g = this.mu / (r * r * r);
    this.vx -= 0.5 * dt * g * this.x; this.vy -= 0.5 * dt * g * this.y;
    this.x += dt * this.vx; this.y += dt * this.vy;
    r = Math.hypot(this.x, this.y); g = this.mu / (r * r * r);
    this.vx -= 0.5 * dt * g * this.x; this.vy -= 0.5 * dt * g * this.y;
  };

  // steering: where the nose should point, as an angle above the local horizon (towards east)
  FP.steer = function () {
    var F = this, G = F.gammas(), h = G.f.r - RE, mode = F.mode;
    if (F.onPad) return 90 * DEG;
    if (mode === 'up') return 90 * DEG;
    if (mode === 'man') return F.manPitch;
    if (mode === 'pro') return h < 50000 ? G.air : G.inert;
    // Automatic ascent, in four parts. 1: rise straight up. 2: tip over and follow a pitch program that lowers the nose with height,
    // never more than a few degrees from the direction of travel through the thick air (a gravity turn); cut the engines once the top
    // of the path (apoapsis) reaches the target height. 3: coast up to it. 4: burn sideways there until the orbit is round.
    var el, e, aT, r = G.f.r, geff;
    if (F.ap === 'vert') { if (G.vAir > 50 && h > 300) F.ap = 'turn'; else return 90 * DEG; }
    if (F.ap === 'turn') {
      el = F.elements();
      if (el.ra - RE >= F.target && !(F.stage() && F.stage().solid)) { F.ap = 'coast'; F.throttle = 0; F.events.push({ type: 'cutoff', phase: 'coast' }); return G.inert; }
      var ref = 90 * DEG * (1 - Math.sqrt(Math.min(1, Math.max(0, h - 300) / F.turnH))), lim = (3 + 12 * Math.exp(-F.q / 4000)) * DEG;
      var cmd = Math.max(G.air - lim, Math.min(G.air + lim, ref));
      e = F.engine(h); aT = e.T / F.m;
      if (h > 50000 && aT > 0) { // high up and still short of the target: don't let the path sag back into the air
        geff = F.mu / (r * r) - G.vh * G.vh / r;
        var hold = Math.asin(Math.max(-0.5, Math.min(0.9, (geff + 0.02 * (100 - G.vr)) / aT)));
        if (G.vr < 100) cmd = Math.max(cmd, hold);
      }
      return cmd;
    }
    if (F.ap === 'coast') {
      el = F.elements();
      if (!el.bound) { F.ap = 'done'; return G.inert; }
      var s0 = F.stage(); e = { mdot: s0 ? s0.mdot : 0 };
      if (h < ATM_TOP && el.ra - RE < F.target - 5000 && F.throttle === 0 && G.vr > 0) { F.throttle = 1; F.ap = 'turn'; return G.inert; }
      // start the circularizing burn half its length before apoapsis
      var vAp = Math.abs(el.h) / el.ra, dvc = Math.sqrt(F.mu / el.ra) - vAp, s1 = F.stage(), ve = s1 ? s1.E.ispVac * G0 : 3000;
      var tb = s1 ? F.m * (1 - Math.exp(-dvc / ve)) / s1.mdot : 0;
      if (timeToApo(el, G.vr) <= tb / 2 + 1) { F.ap = 'circ'; F.throttle = 1; F.events.push({ type: 'circ' }); }
      return G.inert;
    }
    if (F.ap === 'circ') {
      el = F.elements(); var rpAlt = el.rp - RE, need = Math.max(140000, Math.min(F.target, h) - 8000);
      if (el.bound && (rpAlt >= need || (rpAlt > 140000 && el.a >= RE + F.target + 30000))) { F.ap = 'done'; F.throttle = 0; F.events.push({ type: 'cutoff', phase: 'done' }); return G.inert; }
      e = F.engine(h); aT = e.T / F.m; if (aT <= 0) return F.cmd;
      geff = F.mu / (r * r) - G.vh * G.vh / r;
      return Math.asin(Math.max(-0.4, Math.min(0.8, (geff - 0.03 * G.vr) / aT)));
    }
    return G.inert; // 'done': hold prograde, ready for another burn
  };

  // drop the bottom stage
  FP.doStage = function () {
    var F = this; if (F.st >= F.n - 1 || F.ended) return false;
    var s = F.stage(), dm = s.dry + F.prop[F.st];
    F.debris.push({ x: F.x, y: F.y, vx: F.vx, vy: F.vy, m: dm, cda: 1.0 * s.D * (s.len + 2), age: 0, idx: F.st, rot: 0, pitch: F.pitch, spin: (Math.random() - 0.5) * 0.4 });
    F.m -= dm; F.prop[F.st] = 0; F.st++; F.solidLit = false;
    if (F.ignited) { var n = F.stage(); if (n.solid && F.throttle > 0) F.solidLit = true; }
    F.events.push({ type: 'stage', stage: F.st + 1 });
    return true;
  };

  // advance the flight by `total` seconds of simulated time
  FP.advance = function (total) {
    var F = this, guard = 0;
    while (total > 1e-9 && !F.ended && guard++ < 20000) {
      var r = Math.hypot(F.x, F.y), h = r - RE;
      // steering, with a pitch rate limit
      F.cmd = F.steer();
      var e = F.engine(h), burning = e.mdot > 0, dt;
      if (F.onPad) {
        dt = Math.min(total, 0.05);
        var g = F.mu / (r * r) - (F.spin ? OMEGA * OMEGA * r : 0);
        if (burning && e.T / F.m > g) { F.onPad = false; F.liftoffMass = F.m; F.events.push({ type: 'liftoff', padBurn: F.padBurn, twr: e.T / (F.m * G0) }); continue; }
        if (burning) {
          var dtb = Math.min(dt, F.prop[F.st] / e.mdot);
          F.m -= e.mdot * dtb; F.prop[F.st] -= e.mdot * dtb; F.padBurn += e.mdot * dtb; F.dv += e.T / F.m * dtb; F.lossG += e.T / F.m * dtb;
          if (F.prop[F.st] <= 1e-6) { F.prop[F.st] = 0; F.events.push({ type: 'burnout', stage: F.st + 1 }); if (F.autoStage) F.doStage(); }
        }
        F.t += dt; total -= dt;
        var ph = F.phi0 - (F.spin ? OMEGA * F.t : 0); F.x = RE * Math.cos(ph); F.y = RE * Math.sin(ph);
        F.vx = F.spin ? OMEGA * F.y : 0; F.vy = F.spin ? -OMEGA * F.x : 0;
        continue;
      }
      var rate = (h < 60000 ? 3 : 8) * DEG, coast = !burning && (h > ATM_TOP || !F.drag);
      if (coast) {
        var v = Math.hypot(F.vx, F.vy); dt = Math.min(total, Math.max(0.05, Math.min(60, 0.003 * r / Math.max(v, 1))));
        if (!F.drag && h < 5000) dt = Math.min(dt, 0.25);
        F.leap(dt);
      } else {
        dt = Math.min(total, burning ? F.dtBurn : (h > 100000 ? 0.5 : 0.1));
        if (burning && e.mdot * dt > F.prop[F.st]) dt = F.prop[F.st] / e.mdot;
        var s = F.stage();
        F.rk4(dt, { th: F.pitch, mdot: e.mdot, E: s ? s.E : null });
        if (burning) { F.prop[F.st] -= e.mdot * dt; if (F.prop[F.st] <= 1e-6) { F.prop[F.st] = 0; F.m = F.mass(); F.events.push({ type: 'burnout', stage: F.st + 1 }); if (F.autoStage) F.doStage(); } }
      }
      var dp = F.cmd - F.pitch, mx = rate * dt; F.pitch += Math.max(-mx, Math.min(mx, dp));
      F.t += dt; total -= dt;
      F.post(dt);
    }
  };
  FP.post = function () {
    var F = this, r = Math.hypot(F.x, F.y), h = r - RE, a = F.airVel(F.x, F.y), rx = F.vx - a[0], ry = F.vy - a[1], va = Math.hypot(rx, ry);
    F.q = F.drag ? 0.5 * density(h) * va * va : 0; if (F.q > F.maxQ) F.maxQ = F.q;
    if (h > F.maxAlt) F.maxAlt = h;
    var v = Math.hypot(F.vx, F.vy); if (v > F.maxV) F.maxV = v;
    if (!F.escaped && v * v / 2 - F.mu / r >= 0 && F.mu > 0) { F.escaped = true; F.events.push({ type: 'escape' }); }
    if (h < 0) {
      var vr = (F.vx * F.x + F.vy * F.y) / r;
      if (vr < 0) { F.ended = 'ground'; F.impact = va; F.events.push({ type: 'ground', speed: va }); var k = RE / r; F.x *= k; F.y *= k; }
    }
  };
  // the spent stages fall on their own (semi-implicit Euler, for the picture only); the page calls this each frame
  FP.debrisStep = function (dt) {
    var F = this;
    for (var i = F.debris.length - 1; i >= 0; i--) {
      var d = F.debris[i], left = dt;
      while (left > 0) {
        var h0 = Math.hypot(d.x, d.y) - RE, sdt = Math.min(left, h0 < ATM_TOP ? 0.1 : 2);
        var r = Math.hypot(d.x, d.y), g = F.mu / (r * r * r), h = r - RE, ax = -g * d.x, ay = -g * d.y;
        if (F.drag && h < ATM_TOP) { var a = F.airVel(d.x, d.y), rx = d.vx - a[0], ry = d.vy - a[1], vr = Math.hypot(rx, ry), D = 0.5 * density(h) * vr * d.cda / d.m; ax -= D * rx; ay -= D * ry; }
        d.vx += ax * sdt; d.vy += ay * sdt; d.x += d.vx * sdt; d.y += d.vy * sdt; left -= sdt;
      }
      d.age += dt; d.rot += d.spin * dt;
      if (Math.hypot(d.x, d.y) < RE) { F.events.push({ type: 'splash', x: d.x, y: d.y }); F.debris.splice(i, 1); }
      else if (d.age > 900) F.debris.splice(i, 1);
    }
  };

  var api = { G0: G0, MU: MU, RE: RE, OMEGA: OMEGA, RHO0: RHO0, HS: HS, P0: P0, ATM_TOP: ATM_TOP, CD: CD, DEG: DEG,
    ENG: ENG, PAYLOADS: PAYLOADS, density: density, pressure: pressure, isp: isp, stageInfo: stageInfo, analyze: analyze, elements: elements, timeToApo: timeToApo, Flight: Flight };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.RKPhys = api;
})(typeof window !== 'undefined' ? window : this);
