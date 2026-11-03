#!/usr/bin/env node
/* Great Books Ladder: recompute the answers of the computed science problems for the rungs Copernicus, Kepler (Epitome,
   Harmonies), Gilbert, Galileo, Harvey (heart and blood, generation), Bacon (Novum Organum, New Atlantis) and Descartes
   (Discourse, Geometry), independently of the generators' own arithmetic.
   Each computed problem carries p.chk = { f: <formula key>, ...inputs }; this script recomputes the value from the inputs
   with its own formulas and compares it with the problem's answer (within the answer's tolerance, or 0.5%).
   Problems without chk (bank questions, orders, choices) are counted; mc answers must have a valid index and distinct choices.

   node scripts/greatbooks/verify-science-b.js [-n 400]        (run python3 scripts/greatbooks/build.py first) */
'use strict';
var path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
var N = +(process.argv[process.argv.indexOf('-n') + 1] || 0) || 400;
global.window = global;
global.CAS = require(path.join(ROOT, 'static/homeschool/calc/cas.js'));
require(path.join(ROOT, 'static/math/core/gen.js'));
require(path.join(ROOT, 'static/math/core/tex.js'));
require(path.join(ROOT, 'static/math/core/check.js'));
['gbren', 'gb17'].forEach(function (c) { require(path.join(ROOT, 'static/greatbooks/gen', c + '.js')); });
var ML = global.MathLadder, M = Math, D = M.PI / 180;
var F = {
  syn: function (q) { return 365.25 / M.abs(1 - 1 / q.P); },
  asin: function (q) { return M.asin(q.x) / D; },
  sin: function (q) { return M.sin(q.x * D); },
  peri: function (q) { return q.a - q.a * q.e; },
  aph: function (q) { return q.a + q.a * q.e; },
  ecc: function (q) { return (q.Q - q.q) / (q.Q + q.q); },
  semi: function (q) { return (q.Q + q.q) / 2; },
  spd: function (q) { return (1 + q.e) / (1 - q.e); },
  mul: function (q) { return q.a * q.b; },
  div: function (q) { return q.a / q.b; },
  diff: function (q) { return q.a - q.b; },
  adiff: function (q) { return M.abs(q.a - q.b); },
  same: function (q) { return q.a; },
  pctr: function (q) { return M.round(100 * q.a / q.b); },
  k3T: function (q) { return M.pow(q.a, 1.5); },
  k3a: function (q) { return M.pow(q.T, 2 / 3); },
  pw15: function (q) { return M.sqrt(q.x * q.x * q.x); },
  ang: function (q) { var r = (1 + q.e) / (1 - q.e); return r * r; },
  frac: function (q) { return q.x * q.n / q.d; },
  dip: function (q) { return q.L >= 90 ? 90 : M.atan(2 * M.tan(q.L * D)) / D; },
  lat: function (q) { return M.atan(0.5 * M.tan(q.I * D)) / D; },
  odd: function (q) { var s = 0; for (var k = 1; k <= q.n; k++) s += (2 * k - 1) * q.d; return q.total ? s : (2 * q.n - 1) * q.d; },
  tfall: function (q) { return M.sqrt(2 * q.d / 9.8); },
  dfall: function (q) { return 9.8 * q.t * q.t / 2; },
  sq: function (q) { return q.x * q.x; },
  sqrt: function (q) { return M.sqrt(q.x); },
  scale: function (q) { return M.pow(q.k, q.p); },
  pendL: function (q) { return q.L * q.k * q.k; },
  harv: function (q) { return q.hold * q.beats / q.fr; },
  harvLb: function (q) { return M.floor(q.hold * q.beats / q.fr / 12 + 1e-9); },
  cout: function (q) { return q.sv * q.hr / 1000; },
  circ: function (q) { return q.vol * 1000 / (q.sv * q.hr); },
  fellows: function (q) { return q.m + q.k * q.e; },
  snell: function (q) { return M.asin(M.sin(q.i * D) / q.n) / D; },
  bow: function (q) { var r = M.asin(M.sin(q.i * D) / q.n) / D; return 4 * r - 2 * q.i; },
  quadz: function (q) { return q.a / 2 + M.sqrt(q.a * q.a / 4 + q.b2); },
  signs: function (q) { var n = 0, c = q.c.filter(function (x) { return x !== 0; }); for (var i = 1; i < c.length; i++) if (M.sign(c[i]) !== M.sign(c[i - 1])) n++; return n; }
};
var IDS = ['gbren.copernicus-on-the-revolutions', 'gb17.kepler-epitome', 'gb17.kepler-harmonies', 'gb17.gilbert-on-the-loadstone', 'gb17.galileo-two-new-sciences',
  'gb17.harvey-motion-of-the-heart', 'gb17.harvey-generation-of-animals', 'gb17.bacon-novum-organum', 'gb17.bacon-new-atlantis', 'gb17.descartes-discourse-on-method', 'gb17.descartes-geometry'];
var bad = 0, total = 0;
IDS.forEach(function (id) {
  if (ML.genIds().indexOf(id) < 0) { console.log('MISSING generator ' + id); bad++; return; }
  var n = 0, chk = 0, fails = [];
  for (var s = 1; s <= N; s++) {
    var lv = (s % 3) + 1, p = ML.makeProblem(id, 'vb' + s, { level: lv, mode: 'learn' });
    if (!p) continue; n++;
    if (p.a.t === 'mc') {
      var ch = p.a.choices, v = [].concat(p.a.v);
      if (!v.every(function (i) { return i >= 0 && i < ch.length; })) fails.push('mc index out of range: ' + p.q);
      if (ch.map(String).filter(function (x, i, a) { return a.indexOf(x) !== i; }).length) fails.push('duplicate choices: ' + p.q);
      continue;
    }
    if (!p.chk) continue;
    var f = F[p.chk.f]; if (!f) { fails.push('no formula for ' + p.chk.f); continue; }
    chk++;
    var want = f(p.chk), got = +p.a.v, tol = p.a.tol != null ? +p.a.tol : p.a.rtol ? p.a.rtol * M.abs(want) : 0.005 * M.max(1, M.abs(want));
    if (p.a.form === 'int' && !p.a.rtol && p.a.tol == null) tol = 0.5;
    if (!(M.abs(got - want) <= tol + 1e-9)) fails.push(p.chk.f + ' ' + JSON.stringify(p.chk) + ': answer ' + got + ', recomputed ' + want);
  }
  total += chk;
  console.log((fails.length ? '✗  ' : 'ok ') + id + ': ' + n + ' problems, ' + chk + ' recomputed' + (fails.length ? ', ' + fails.length + ' FAIL' : ''));
  fails.slice(0, 4).forEach(function (x) { console.log('     ' + x); });
  bad += fails.length;
});
console.log(bad ? 'FAIL: ' + bad + ' problem(s)' : 'PASS: ' + total + ' computed answers recomputed and matched');
process.exit(bad ? 1 : 0);
