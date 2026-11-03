#!/usr/bin/env node
/* Great Books Ladder: recompute the answers of the computed science problems for the rungs Pascal, Newton (Principia,
   Optics), Huygens, Lavoisier and Faraday, independently of the generators' own arithmetic.
   Each computed problem carries p.chk = { f: <formula key>, ...inputs }; this script recomputes the value from the inputs
   with its own formulas and compares it with the problem's answer (within the answer's tolerance, or 0.5%).
   Problems without chk (bank questions, orders) are counted but not recomputed; mc answers must have a valid index.

   node scripts/greatbooks/verify-science-c.js [-n 400]        (run python3 scripts/greatbooks/build.py first) */
'use strict';
var fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
var N = +(process.argv[process.argv.indexOf('-n') + 1] || 0) || 400;
global.window = global;
global.CAS = require(path.join(ROOT, 'static/homeschool/calc/cas.js'));
require(path.join(ROOT, 'static/math/core/gen.js'));
require(path.join(ROOT, 'static/math/core/tex.js'));
require(path.join(ROOT, 'static/math/core/check.js'));
['gb17', 'gb18', 'gb19'].forEach(function (c) { require(path.join(ROOT, 'static/greatbooks/gen', c + '.js')); });
var ML = global.MathLadder, M = Math, D = M.PI / 180;
function C(n, k) { var r = 1; for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1); return r; }
var F = {
  C: function (q) { return C(q.n, q.k); },
  pow2: function (q) { var s = 0; for (var k = 0; k <= q.n; k++) s += C(q.n, k); return s; },
  diag: function (q) { var s = 0; for (var i = q.k; i <= q.n; i++) s += C(i, q.k); return s; },
  points: function (q) { // brute force: every sequence of a+b-1 fair rounds
    var n = q.a + q.b - 1, win = 0; for (var m = 0; m < (1 << n); m++) { var w = 0; for (var j = 0; j < n; j++) if (m >> j & 1) w++; if (w >= q.a) win++; }
    return q.stake * win / (1 << n); },
  P: function (q) { return q.rho * 9.8 * q.h / 1000; },
  ratio: function (q) { return q.x !== undefined ? q.x * q.b / q.a : q.r1 * q.h1 / q.r2; },
  ratioSum: function (q) { return q.x + q.x * q.b / q.a; },
  press: function (q) { return q.F * q.A2 / q.A1; },
  grav: function (q) { return 9.8 / (q.r * q.r); },
  cent: function (q) { return 4 * M.PI * M.PI * q.r / (q.T * q.T); },
  vcirc: function (q) { return M.sqrt(q.g * q.R) / 1000; },
  k3T: function (q) { return M.sqrt(q.a * q.a * q.a); },
  k3a: function (q) { return M.cbrt(q.T * q.T); },
  imp: function (q) { return q.F * q.t / q.m; },
  mom: function (q) { return q.m1 * q.v1 / q.m2; },
  ug: function (q) { return 6.67e-11 * q.m1 * q.m2 / (q.r * q.r); },
  fall: function (q) { return 0.5 * 9.8 / (q.r * q.r) * q.t * q.t; },
  snell: function (q) { return M.asin(q.n1 * M.sin(q.i * D) / q.n2) / D; },
  disp: function (q) { return (M.asin(M.sin(q.i * D) / q.nr) - M.asin(M.sin(q.i * D) / q.nv)) / D; },
  md: function (q) { return 2 * M.asin(q.n * M.sin(q.A / 2 * D)) / D - q.A; },
  mdn: function (q) { return M.sin((q.A + q.D) / 2 * D) / M.sin(q.A / 2 * D); },
  mag: function (q) { return q.fo / q.fe; },
  ring: function (q) { return M.sqrt(q.m * q.lam * 1e-9 * q.R) * 1000; },
  hsnell: function (q) { return M.asin(q.v2 / q.v1 * M.sin(q.i * D)) / D; },
  vn: function (q) { return 299792 / q.n; },
  vang: function (q) { return 299792 * M.sin(q.r * D) / M.sin(q.i * D); },
  romer1: function (q) { return q.D / (q.m * 60); },
  romer2: function (q) { return q.d / (q.t * 60); },
  wl: function (q) { return q.v * q.t * 1e-6; },
  crit: function (q) { return M.asin(1 / q.n) / D; },
  pend: function (q) { return 2 * M.PI * M.sqrt(q.L / 9.81); },
  pendL: function (q) { return 9.81 * q.T * q.T / (4 * M.PI * M.PI); },
  sum: function (q) { return q.a + q.b; },
  diff: function (q) { return q.a - q.b; },
  same: function (q) { return q.a; },
  pct: function (q) { return q.x * q.p; },
  hgo: function (q) { var f = 16.00 / (200.59 + 16.00); return q.part === 'O' ? q.m * f : q.m * (1 - f); },
  gain: function (q) { var g = q.m / q.M * q.b / q.a * 16.00; return q.prod ? q.m + g : g; },
  pc: function (q) { return 100 * q.a / q.b; },
  emf: function (q) { return q.N * q.dPhi / q.t; },
  emfBA: function (q) { return q.N * q.B * q.A / q.t; },
  scale: function (q) { return q.E0 * q.k; },
  tV: function (q) { return q.V1 * q.N2 / q.N1; },
  tN: function (q) { return q.N1 * q.V2 / q.V1; },
  Q: function (q) { return q.I * q.t; },
  elec: function (q) { return q.I * q.t / 96485 / q.z * q.M; }
};
var IDS = ['gb17.pascal-scientific-treatises', 'gb17.newton-principia', 'gb17.newton-optics', 'gb17.huygens-treatise-on-light',
  'gb18.lavoisier-elements-of-chemistry', 'gb19.faraday-experimental-researches'];
var bad = 0;
IDS.forEach(function (id) {
  var n = 0, rec = 0, fails = [], kinds = {};
  for (var s = 0; s < N; s++) {
    var lv = 1 + s % 3, p = ML.makeProblem(id, 'v' + s, { level: lv, mode: 'learn' }); n++;
    if (p.a.t === 'mc') { var v = [].concat(p.a.v); if (!v.every(function (i) { return i >= 0 && i < p.a.choices.length; })) fails.push('mc index ' + JSON.stringify(p.a)); continue; }
    if (!p.chk) continue;
    var f = F[p.chk.f]; if (!f) { fails.push('no formula for ' + p.chk.f); continue; }
    var want = f(p.chk), got = parseFloat(p.a.v), tol = p.a.tol !== undefined ? +p.a.tol : p.a.rtol !== undefined ? +p.a.rtol * M.abs(want) : 1e-9 + 0.005 * M.abs(want);
    if (p.a.form === 'int') tol = M.max(tol, 1e-9);
    rec++; kinds[p.chk.f] = (kinds[p.chk.f] || 0) + 1;
    if (!(M.abs(got - want) <= M.max(tol, 1e-12))) fails.push(p.chk.f + ': answer ' + p.a.v + ', recomputed ' + want + ' (' + JSON.stringify(p.chk) + ')');
  }
  bad += fails.length;
  console.log((fails.length ? 'FAIL ' : 'ok   ') + id + ': ' + n + ' problems, ' + rec + ' recomputed (' + Object.keys(kinds).length + ' formulas)' + (fails.length ? ', ' + fails.length + ' mismatches' : ''));
  fails.slice(0, 5).forEach(function (m) { console.log('       ' + m); });
});
process.exit(bad ? 1 : 0);
