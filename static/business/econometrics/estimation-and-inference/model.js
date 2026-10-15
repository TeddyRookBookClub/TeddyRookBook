/* Econometrics, Chapter 3: the models behind the interactives (window.EC3Model in the browser, module.exports in Node,
   where it is unit-tested). Needs EconStats (../stats.js).
   1. Confidence intervals for a population mean μ = 30 with standard deviation σ, from three population shapes.
   2. Four estimators of a two-dimensional mean (the dartboard).
   3. The one-sample z test: p-values, power and type I and II errors.                                          */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require === 'function' ? require('../stats.js') : null);
  var M = Math, MU = 30;

  // ---------- 1. populations with mean MU and standard deviation sigma ----------
  var POPS = {
    normal: { name: 'Normal', draw: function (r, s) { return MU + s * r.n(); } },
    skewed: { name: 'Skewed', draw: function (r, s) { return MU - s + s * -M.log(1 - r.u()); } },          // shifted exponential: skewness 2
    humps: { name: 'Two humps', draw: function (r, s) { return MU + s * ((r.u() < 0.5 ? -0.8 : 0.8) + 0.6 * r.n()); } } // variance 0.64 + 0.36 = 1
  };
  function crit(level, method, n) { var p = 1 - (1 - level) / 2; return method === 't' ? ES.tInv(p, n - 1) : ES.normInv(p); }
  // one interval: method 't' (x̄ ± t·s/√n), 'zs' (x̄ ± z·s/√n, too narrow in small samples), 'zk' (x̄ ± z·σ/√n, σ known)
  function interval(xs, level, method, sigma) {
    var n = xs.length, m = ES.mean(xs), s = n > 1 ? ES.sd(xs) : NaN, se = (method === 'zk' ? sigma : s) / M.sqrt(n), h = crit(level, method, n) * se;
    return { mean: m, lo: m - h, hi: m + h, half: h, covers: m - h <= MU && MU <= m + h };
  }
  function draw(kind, n, sigma, r) { var xs = [], P = POPS[kind]; for (var i = 0; i < n; i++) xs.push(P.draw(r, sigma)); return xs; }

  // ---------- 2. the dartboard: estimating a 2-D mean (0, 0) with σ = 1 in each direction ----------
  var GUESS = [0.55, 0.45];
  function volunteer(r) { // people with a larger first coordinate are more likely to volunteer
    for (;;) { var x = r.n(), y = r.n(); if (r.u() < 1 / (1 + M.exp(-2 * x))) return [x, y]; }
  }
  var ESTS = [
    { key: 'mean', name: 'Sample mean', est: function (r, n) { var a = 0, b = 0; for (var i = 0; i < n; i++) { a += r.n(); b += r.n(); } return [a / n, b / n]; } },
    { key: 'first', name: 'First person only', est: function (r) { return [r.n(), r.n()]; } },
    { key: 'shrink', name: 'Shrunk toward a guess', est: function (r, n, lam) { var a = 0, b = 0; for (var i = 0; i < n; i++) { a += r.n(); b += r.n(); } return [lam * a / n + (1 - lam) * GUESS[0], lam * b / n + (1 - lam) * GUESS[1]]; } },
    { key: 'vol', name: 'Volunteers only', est: function (r, n) { var a = 0, b = 0; for (var i = 0; i < n; i++) { var v = volunteer(r); a += v[0]; b += v[1]; } return [a / n, b / n]; } }
  ];
  function dartStats(ds) { // bias (distance of the average dart from the bullseye), sd (root mean squared spread), rmse
    var k = ds.length; if (!k) return null; var mx = 0, my = 0, s = 0, e = 0;
    ds.forEach(function (d) { mx += d[0]; my += d[1]; }); mx /= k; my /= k;
    ds.forEach(function (d) { s += (d[0] - mx) * (d[0] - mx) + (d[1] - my) * (d[1] - my); e += d[0] * d[0] + d[1] * d[1]; });
    return { mx: mx, my: my, bias: M.sqrt(mx * mx + my * my), sd: M.sqrt(s / k), rmse: M.sqrt(e / k) };
  }

  // ---------- 3. the z test of H0: μ = μ0 with effect size d = (μ − μ0)/σ ----------
  function zcrit(alpha, sided) { return ES.normInv(1 - (sided === 2 ? alpha / 2 : alpha)); }
  function power(d, n, alpha, sided) {
    var del = d * M.sqrt(n), z = zcrit(alpha, sided);
    return sided === 2 ? ES.normCdf(del - z) + ES.normCdf(-del - z) : ES.normCdf(del - z);
  }
  function pvalue(z, sided) { return sided === 2 ? 2 * (1 - ES.normCdf(M.abs(z))) : 1 - ES.normCdf(z); }
  function nFor(d, alpha, sided, target) { for (var n = 2; n < 100000; n++) if (power(d, n, alpha, sided) >= target) return n; return NaN; }

  var API = { MU: MU, POPS: POPS, crit: crit, interval: interval, draw: draw, GUESS: GUESS, ESTS: ESTS, volunteer: volunteer, dartStats: dartStats, zcrit: zcrit, power: power, pvalue: pvalue, nFor: nFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC3Model = API;
})(typeof window !== 'undefined' ? window : this);
