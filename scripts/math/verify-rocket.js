#!/usr/bin/env node
/* Second-method check for static/physics/gen/rocket.js: for every topic, makes problems at levels 1-3 and recomputes
   each answer from p.d by a DIFFERENT method (numerical simulation, integration, the law of sines, energy instead of
   kinematics, vis-viva instead of Kepler's second law, ...). The recomputed value must pass ML.check against the
   problem's own answer spec.   node scripts/math/verify-rocket.js [n per level]   */
'use strict';
var path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
global.window = global;
global.CAS = require(path.join(ROOT, 'static/homeschool/calc/cas.js'));
require(path.join(ROOT, 'static/math/core/gen.js'));
require(path.join(ROOT, 'static/math/core/tex.js'));
require(path.join(ROOT, 'static/math/core/check.js'));
require(path.join(ROOT, 'static/physics/gen/rocket.js'));
var ML = global.MathLadder, N = +process.argv[2] || 120;
var g = 9.8, G = 6.674e-11, D = Math.PI / 180, ME = 5.972e24, RE = 6.371e6;

function simUp(v0, h0, accFn, dt) { // integrate until v <= 0, returns {h, t}
  var v = v0, h = h0, t = 0; dt = dt || 1e-4;
  while (v > 0) { var a1 = accFn(v), vm = v + a1 * dt / 2, a2 = accFn(vm); h += vm * dt; v += a2 * dt; t += dt; }
  return { h: h, t: t };
}
function simpson(f, a, b, n) { n = n || 2000; var hh = (b - a) / n, s = f(a) + f(b); for (var i = 1; i < n; i++) s += f(a + i * hh) * (i % 2 ? 4 : 2); return s * hh / 3; }
function lawSinesHeight(base, A, B) { return base * Math.sin(B * D) / Math.sin((A + B) * D) * Math.sin(A * D); }
function rocketSim(ve, m0, mf, tb, grav) { // burn in many small parcels, momentum conservation per parcel
  var n = 20000, dm = (m0 - mf) / n, m = m0, v = 0, dt = (tb || 1) / n;
  for (var i = 0; i < n; i++) { v += ve * dm / (m - dm / 2); m -= dm; if (grav) v -= g * dt; }
  return v;
}
function sigfigs(s) { s = s.replace(/,/g, ''); var hasDot = s.indexOf('.') >= 0, d = s.replace('.', '').replace(/^0+/, ''); if (!hasDot) d = d.replace(/0+$/, ''); return d.length; }

var V = {
  'units-sig-figs': function (d) {
    switch (d.k) {
      case 'ft-m': return d.ft * 12 * 2.54 / 100; case 'm-ft': return d.m * 100 / 2.54 / 12;
      case 'mi-ft': return d.mi * 1760 * 3; case 'mi-m': return d.mi * 1760 * 0.9144;
      case 'mph': return d.s * 0.44704; case 'kmh': return d.s * 1000 / 3600;
      case 'sf': return sigfigs(d.s); case 'sfmul': return +(d.b * d.t).toPrecision(3);
    }
  },
  'flight-graphs': function (d) {
    var a = d.vb / d.tb, v = function (t) { return t < d.tb ? a * t : d.vb - g * (t - d.tb); };
    var tz = d.tb + 0.0, lo = d.tb, hi = d.tb + 100; for (var i = 0; i < 80; i++) { var mid = (lo + hi) / 2; if (v(mid) > 0) lo = mid; else hi = mid; } tz = lo;
    switch (d.k) { case 'aboost': return (v(d.tb * 0.75) - v(d.tb * 0.25)) / (d.tb * 0.5); case 'tap': return tz;
      case 'hb': return simpson(v, 0, d.tb); case 'hap': return simpson(v, 0, d.tb) + simpson(v, d.tb, tz); case 'vat': return v(d.t1); }
  },
  'launch-statistics': function (d) {
    var x = d.xs, n = x.length, s = 0, s2 = 0; x.forEach(function (y) { s += y; s2 += y * y; });
    var sorted = x.slice().sort(function (a, b) { return a - b; });
    switch (d.k) { case 'mean': return s / n; case 'range': return sorted[n - 1] - sorted[0];
      case 'median': return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      case 'sd': return Math.sqrt((s2 - s * s / n) / (n - 1)); }
  },
  'newtons-laws-thrust': function (d) {
    switch (d.k) { case 'law': return { mc: d.ans }; case 'acc': return d.T / d.m - g; case 'net': return d.m * (d.T / d.m - g);
      case 'thrust': return d.m * d.a + d.m * g; case 'mass': return 1000 * d.T / (d.a + g); }
  },
  'thrust-to-weight': function (d) {
    switch (d.k) { case 'twr': return (d.T / d.m) / g; case 'lift': return { mc: d.T / d.m > g ? 'Yes: thrust is more than its weight' : 'No: thrust is less than its weight' };
      case 'minT': return d.r * d.m * g; case 'rod': return Math.sqrt(2 * (d.T - d.m * g) * d.L / d.m); // work-energy
      case 'rodv': return d.m * g + 0.5 * d.m * d.v * d.v / d.L; }
  },
  'impulse-momentum': function (d) {
    var CL = [['A', 2.5], ['B', 5], ['C', 10], ['D', 20], ['E', 40], ['F', 80]];
    switch (d.k) { case 'avg': return simpson(function () { return d.F; }, 0, d.t);
      case 'class': for (var i = 0; i < CL.length; i++) if (d.J <= CL[i][1]) return { mc: CL[i][0] }; return null;
      case 'tri': return simpson(function (t) { return t < d.te / 2 ? 2 * d.Fp * t / d.te : 2 * d.Fp * (d.te - t) / d.te; }, 0, d.te);
      case 'trap': return simpson(function (t) { return d.Fp * t / d.tp; }, 0, d.tp) + simpson(function () { return d.Fs; }, d.tp, d.te);
      case 'dv': return d.J / d.m;
      case 'dvg': var v = 0, n = 10000, dt = d.t / n; for (var j = 0; j < n; j++) v += (d.F / d.m - g) * dt; return v; }
  },
  'rocket-equation': function (d) {
    switch (d.k) { case 'dv': return rocketSim(d.ve, d.m0, d.mf); case 'mr': var lo = 1, hi = 1e6; for (var i = 0; i < 200; i++) { var mid = Math.sqrt(lo * hi); if (rocketSim(d.ve, mid, 1) < d.dv) lo = mid; else hi = mid; } return lo;
      case 'frac': return 100 * (1 - Math.pow(Math.E, -d.dv / d.ve));
      case 've': return d.dv / rocketSim(1, d.m0, d.mf); case 'thrust': return d.md * d.ve;
      case 'grav': return rocketSim(d.ve, d.m0, d.mf, d.tb, true); }
  },
  'nozzles-concept': function (d) {
    switch (d.k) { case 'idea': return { mc: d.ans }; case 'thrust': return d.ve * d.md; case 've': return d.T / d.md; case 'press': return d.md * d.ve + d.pe * d.Ae - d.pa * d.Ae; }
  },
  'calculus-of-motion': function (d) {
    var e = 1e-5;
    switch (d.k) { case 'deriv': var h = function (t) { return d.b * t - 4.9 * t * t; }; return (h(d.t + e) - h(d.t - e)) / (2 * e);
      case 'deriv2': var x = function (t) { return d.c * Math.pow(t, d.p); }; return (x(d.t + e) - x(d.t - e)) / (2 * e);
      case 'area': return simpson(function () { return d.a; }, 0, d.t);
      case 'integ': return simpson(function (t) { return d.c + d.p * t; }, 0, d.T);
      case 'apogee': return simUp(d.b, d.h0, function () { return -g; }).h; }
  },
  'powered-flight': function (d) {
    var a = d.a != null ? d.a : (d.T - d.m * g) / d.m, v = 0, h = 0, t = 0, dt = 1e-5;
    if (d.k === 'tb') { while (v < d.v) { v += a * dt; t += dt; } return t; }
    var T_ = d.t; var n = Math.round(T_ / dt); for (var i = 0; i < n; i++) { h += (v + a * dt / 2) * dt; v += a * dt; }
    return (d.k === 'vb' || d.k === 'fromT') ? v : h;
  },
  'coasting-apogee': function (d) {
    var s = simUp(d.vb, d.hb || 0, function () { return -g; });
    switch (d.k) { case 'tc': return s.t; case 'rise': return s.h; case 'apogee': return s.h;
      case 'fall': var y = s.h, v = 0, t = 0, dt = 1e-4; while (y > 0) { v += g * dt; y -= v * dt; t += dt; } return t;
      case 'total': return d.tb + s.t;
      case 'delay': var best = 3; [3, 4, 5, 6, 7, 8].forEach(function (x) { if (Math.abs(x - s.t) < Math.abs(best - s.t)) best = x; }); return { mc: best + ' s' }; }
  },
  'energy-burnout-apogee': function (d) {
    switch (d.k) { case 'ke': return d.m * d.v * d.v / 2; case 'pe': return d.m * g * d.h;
      case 'rise': var t = d.v / g; return d.hb + d.v * t - 0.5 * g * t * t; // kinematics
      case 'vfromh': return g * Math.sqrt(2 * d.dh / g);                 // v = g t, t from the fall time
      case 'lost': var t2 = d.v / g, ideal = d.v * t2 - 0.5 * g * t2 * t2; return d.m * g * (ideal - (d.H - d.hb)); }
  },
  'drag': function (d) {
    switch (d.k) { case 'idea': return { mc: d.ans }; case 'force': var r = d.d / 200; return 0.6 * d.Cd * Math.PI * r * r * d.v * d.v;
      case 'scale': return d.F * d.f * d.f; case 'decel': return (d.m * g + d.F) / d.m;
      case 'step': case 'step2':
        var v = d.v, h = d.h; for (var i = 0; i < (d.k === 'step' ? 1 : 2); i++) { var a = -(d.m * g + d.k2 * v * v) / d.m, vn = v + a * d.dt; h = h + v * d.dt; v = vn; }
        return d.k === 'step' ? v : h; }
  },
  'stability': function (d) {
    switch (d.k) { case 'stable': return { mc: d.cp > d.cm ? 'Yes: the center of mass is ahead of the center of pressure' : 'No: the center of pressure is ahead of the center of mass' };
      case 'cm': case 'cm3': // balance point: where the torques about it sum to zero (bisection)
        var lo = 0, hi = 200; for (var i = 0; i < 80; i++) { var mid = (lo + hi) / 2, tq = 0; d.parts.forEach(function (p) { tq += p[1] * (p[2] - mid); }); if (tq > 0) lo = mid; else hi = mid; } return lo;
      case 'margin': return (d.cp - d.cm) / d.d;
      case 'nose': return d.X - d.add * (d.X - 1) / (d.M + d.add); }
  },
  'range-angle': function (d) {
    function fly(v, th) { var vx = v * Math.cos(th * D), vy = v * Math.sin(th * D), x = 0, y = 0, t = 0, top = 0, dt = 1e-4; do { x += vx * dt; y += vy * dt - g * dt * dt / 2; vy -= g * dt; t += dt; top = Math.max(top, y); } while (y > 0); return { R: x, H: top, t: t }; }
    switch (d.k) { case 'range': return fly(d.v, d.th).R; case 'best': return { mc: '$45^\\circ$' }; case 'height': return fly(d.v, d.th).H; case 'time': return fly(d.v, d.th).t;
      case 'twin': var r1 = fly(20, d.th).R, lo = 45, hi = 90; if (d.th > 45) { lo = 0; hi = 45; } for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2, rm = fly(20, mid).R; if ((rm > r1) === (d.th < 45)) lo = mid; else hi = mid; } return (lo + hi) / 2;
      case 'speed': var a = 1, b = 200; for (var j = 0; j < 40; j++) { var m = (a + b) / 2; if (fly(m, d.th).R < d.R) a = m; else b = m; } return (a + b) / 2; }
  },
  'altitude-tangent': function (d) {
    switch (d.k) { case 'h': return lawSinesHeight(d.b, d.th, 90); case 'heye': return lawSinesHeight(d.b, d.th, 90) + d.e;
      case 'angle': return Math.atan2(d.h, d.b) / D; case 'base': return d.h * Math.sin((90 - d.th) * D) / Math.sin(d.th * D);
      case 'ft': return lawSinesHeight(d.b, d.th, 90); }
  },
  'angle-error': function (d) {
    var H = function (a) { return lawSinesHeight(d.b, a, 90); };
    switch (d.k) { case 'hi': return H(d.th + d.dth); case 'lo': return H(d.th - d.dth); case 'spread': return H(d.th + d.dth) - H(d.th - d.dth);
      case 'pct': return 100 * (H(d.th + d.dth) / H(d.th) - 1); case 'avg': return (H(d.th) + H(d.th2)) / 2; }
  },
  'triangulation': function (d) {
    switch (d.k) { case 'opp': return lawSinesHeight(d.d, d.a, d.b);
      case 'same': case 'dist': var NP = d.d * Math.sin(d.far * D) / Math.sin((d.near - d.far) * D); return d.k === 'same' ? NP * Math.sin(d.near * D) : NP * Math.cos(d.near * D); }
  },
  'gravity-orbits': function (d) {
    if (d.k === 'idea') return { mc: d.ans };
    if (d.k === 'alt') { var lo = 6.4e6, hi = 9e6; for (var i = 0; i < 100; i++) { var mid = (lo + hi) / 2; if (2 * Math.PI * Math.pow(mid, 1.5) / Math.sqrt(G * ME) < d.P * 60) lo = mid; else hi = mid; } return (lo - RE) / 1000; }
    var r = d.R + d.alt * 1000, gl = G * d.M / (r * r);
    switch (d.k) { case 'v': return Math.sqrt(gl * r); case 'period': return 2 * Math.PI * Math.sqrt(r / gl) / 60; case 'g': return gl; }
  },
  'escape-velocity': function (d) {
    switch (d.k) { case 'ratio': return Math.sqrt(2 * d.vo * d.vo);
      case 'esc': case 'alt': var r = d.R + d.alt * 1000; return Math.sqrt(2 * (G * d.M / (r * r)) * r);
      case 'energy': return simpson(function (x) { return G * d.M * d.m / (x * x); }, d.R, d.R * 2000, 200000) + G * d.M * d.m / (d.R * 2000); }
  },
  'kepler-ellipses': function (d) {
    var rp = (6371 + d.hp) * 1000, ra = (6371 + d.ha) * 1000, a = (rp + ra) / 2;
    switch (d.k) { case 'a': return (2 * 6371 + d.hp + d.ha) / 2; case 'e': return 1 - rp / a;
      case 'speed': var GM = G * ME, vpv = Math.sqrt(GM * (2 / rp - 1 / a)), vav = Math.sqrt(GM * (2 / ra - 1 / a)); return d.vp * vav / vpv;
      case 'period': // integrate the orbit (leapfrog) from perigee, time until it is back at perigee (half orbit x 2)
        var GM2 = G * ME, x = rp, y = 0, vx = 0, vy = Math.sqrt(GM2 * (2 / rp - 1 / a)), t = 0, dt = 0.5, rr, ax, ay;
        rr = Math.hypot(x, y); ax = -GM2 * x / (rr * rr * rr); ay = -GM2 * y / (rr * rr * rr);
        while (true) { vx += ax * dt / 2; vy += ay * dt / 2; x += vx * dt; var y0 = y; y += vy * dt; rr = Math.hypot(x, y); ax = -GM2 * x / (rr * rr * rr); ay = -GM2 * y / (rr * rr * rr); vx += ax * dt / 2; vy += ay * dt / 2; t += dt; if (y0 > 0 && y <= 0) { t -= dt * y / (y - y0); break; } }
        return 2 * t / 60;
      case 'third': return d.P * Math.sqrt(d.f * d.f * d.f); }
  }
};

var ids = ML.genIds().filter(function (id) { return id.indexOf('rocket.') === 0; }), bad = 0, total = 0;
ids.forEach(function (id) {
  var f = V[id.slice(7)], nb = 0, nk = 0;
  if (!f) { console.log('NO VERIFIER', id); bad++; return; }
  for (var L = 1; L <= 3; L++) for (var s = 0; s < N; s++) {
    var p = ML.makeProblem ? ML.makeProblem(id, id + ':' + L + ':' + s, { level: L }) : null;
    if (!p) { var R = ML.rand(id + ':' + L + ':' + s); p = ML.getGen(id)(R, { level: L }); }
    var y = f(p.d), ok;
    total++; nk++;
    if (y && typeof y === 'object' && 'mc' in y) ok = p.a.t === 'mc' && String(p.a.choices[p.a.v]) === String(y.mc);
    else { var r = ML.check(p.a, String(+(+y).toPrecision(8)), { q: p.q, unit: p.unit }); ok = r.ok; }
    if (!ok) { nb++; bad++; if (nb <= 3) console.log('  MISMATCH', id, JSON.stringify(p.d), 'spec', JSON.stringify(p.a).slice(0, 120), 'second method', y); }
  }
  console.log((nb ? 'FAIL' : 'ok  ') + ' ' + id + '  ' + nk + ' checked' + (nb ? ', ' + nb + ' mismatches' : ''));
});
console.log(bad ? 'FAILED: ' + bad + ' of ' + total : 'ALL ' + total + ' answers agree with a second method');
process.exit(bad ? 1 : 0);
