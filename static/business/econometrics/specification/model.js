/* Econometrics, Chapter 9 (Specification, Measurement Error and Outliers): the simulated worlds and the diagnostics.
   window.EC9M in the browser, module.exports in Node. Uses EconStats (static/business/econometrics/stats.js).

   1. Measurement error (Friedman's permanent income): true income x* ~ N(60, 15²) ($ thousands),
      consumption y* = 8 + 0.9 x* + 4u; we observe x = x* + σe·e and y = y* + σv·v.
      plim of the OLS slope = λβ₁ with reliability λ = 15² / (15² + σe²); noise in y leaves the slope unbiased.
   2. Outliers: leverage, studentized residuals, Cook's distance, and least absolute deviations (LAD).
   3. Overfitting: polynomials of degree 1–12 on 20 training points (one in each twentieth of [0, 4]) from a smooth curve,
      judged on 300 test points. */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require !== 'undefined' ? require('../stats.js') : null);
  var M = Math;

  var ME = { mu: 60, sx: 15, b0: 8, b1: 0.9, su: 4 };
  // a sample keeps its standard-normal draws, so moving a noise slider scales the same errors smoothly
  function drawME(n, seed) {
    var r = ES.rng(seed), o = { n: n, xs: [], u: [], e: [], v: [] };
    for (var i = 0; i < n; i++) { o.xs.push(ME.mu + ME.sx * r.n()); o.u.push(r.n()); o.e.push(r.n()); o.v.push(r.n()); }
    return o;
  }
  function observe(o, se, sv) {
    var x = [], y = [], yt = [];
    for (var i = 0; i < o.n; i++) { var ys = ME.b0 + ME.b1 * o.xs[i] + ME.su * o.u[i]; yt.push(ys); x.push(o.xs[i] + se * o.e[i]); y.push(ys + sv * o.v[i]); }
    return { x: x, y: y, yt: yt, xs: o.xs };
  }
  function lambda(se) { return ME.sx * ME.sx / (ME.sx * ME.sx + se * se); }
  function slopeOf(x, y) { var n = x.length, mx = 0, my = 0, i; for (i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n; var sxy = 0, sxx = 0; for (i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); } return { b1: sxy / sxx, b0: my - sxy / sxx * mx }; }

  // influence diagnostics for simple regression; k = 2 parameters
  function influence(x, y) {
    var n = x.length, f = slopeOf(x, y), mx = ES.mean(x), sxx = 0, ssr = 0, i, e = [], h = [];
    for (i = 0; i < n; i++) sxx += (x[i] - mx) * (x[i] - mx);
    for (i = 0; i < n; i++) { var ei = y[i] - f.b0 - f.b1 * x[i]; e.push(ei); ssr += ei * ei; h.push(1 / n + (x[i] - mx) * (x[i] - mx) / sxx); }
    var s2 = ssr / (n - 2), r = [], D = [];
    for (i = 0; i < n; i++) { var ri = e[i] / M.sqrt(s2 * (1 - h[i])); r.push(ri); D.push(ri * ri * h[i] / (2 * (1 - h[i]))); }
    return { b0: f.b0, b1: f.b1, e: e, h: h, r: r, D: D, s2: s2 };
  }
  // least absolute deviations: the best line passes through two data points, so try every pair
  function lad(x, y) {
    var n = x.length, best = null, bs = Infinity;
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
      if (M.abs(x[j] - x[i]) < 1e-12) continue;
      var b1 = (y[j] - y[i]) / (x[j] - x[i]), b0 = y[i] - b1 * x[i], s = 0;
      for (var k = 0; k < n; k++) s += M.abs(y[k] - b0 - b1 * x[k]);
      if (s < bs - 1e-12) { bs = s; best = { b0: b0, b1: b1, sad: s }; }
    }
    return best;
  }
  function genOutlier(seed) { var r = ES.rng(seed), x = [], y = []; for (var i = 0; i < 16; i++) { var xi = 1 + 9 * (i + 0.2 + 0.6 * r.u()) / 16; x.push(xi); y.push(2 + 0.8 * xi + 0.8 * r.n()); } return { x: x, y: y }; }

  // overfitting: f(x) = 2 + 1.2 sin(1.8x) − 0.25x on [0, 4]
  function truth(x) { return 2 + 1.2 * M.sin(1.8 * x) - 0.25 * x; }
  function genCurve(n, sd, seed, spread) { var r = ES.rng(seed), x = [], y = []; for (var i = 0; i < n; i++) { var xi = spread ? 4 * (i + r.u()) / n : 4 * r.u(); x.push(xi); y.push(truth(xi) + sd * r.n()); } return { x: x, y: y }; } // spread: one point in each of n equal slices
  function legendre(t, d) { var p = [1, t]; for (var k = 2; k <= d; k++) p.push(((2 * k - 1) * t * p[k - 1] - (k - 1) * p[k - 2]) / k); return p.slice(1, d + 1); }
  function basis(x, d) { return legendre((x - 2) / 2, d); }
  function polyFit(tr, d) {
    var o = ES.ols(tr.y, tr.x.map(function (v) { return basis(v, d); }), { intercept: true });
    return { o: o, d: d, pred: function (x) { var b = basis(x, d), s = o.b[0]; for (var j = 0; j < d; j++) s += o.b[j + 1] * b[j]; return s; } };
  }
  function mse(f, data) { var s = 0; for (var i = 0; i < data.x.length; i++) { var e = data.y[i] - f.pred(data.x[i]); s += e * e; } return s / data.x.length; }
  function sweep(tr, te, maxD) {
    var out = [], n = tr.x.length;
    for (var d = 1; d <= maxD; d++) {
      var f = polyFit(tr, d), k = d + 1, ssr = f.o.ssr;
      out.push({ d: d, f: f, train: ssr / n, test: mse(f, te), r2: f.o.r2, adj: f.o.adjR2, aic: n * M.log(ssr / n) + 2 * k, bic: n * M.log(ssr / n) + k * M.log(n) });
    }
    function arg(key, max) { var b = 0; for (var i = 1; i < out.length; i++) if (max ? out[i][key] > out[b][key] : out[i][key] < out[b][key]) b = i; return out[b].d; }
    return { rows: out, best: { test: arg('test'), aic: arg('aic'), bic: arg('bic'), adj: arg('adj', true) } };
  }
  // Ramsey's RESET: add ŷ² and ŷ³ to the regression and F-test them
  function reset(x, y, fitted, d) {
    var X1 = x.map(function (v) { return basis(v, d); }), base = ES.ols(y, X1, { intercept: true });
    var sc = ES.sd(fitted) || 1, m = ES.mean(fitted), X2 = x.map(function (v, i) { var z = (fitted[i] - m) / sc; return X1[i].concat([z * z, z * z * z]); });
    var full = ES.ols(y, X2, { intercept: true }), n = y.length, k2 = d + 3, F = ((base.ssr - full.ssr) / 2) / (full.ssr / (n - k2 - 1));
    return { F: F, p: 1 - ES.fCdf(F, 2, n - k2 - 1), df2: n - k2 - 1 };
  }
  // variance inflation factor of column j in X (rows)
  function vif(X, j) { var xj = X.map(function (r) { return r[j]; }), rest = X.map(function (r) { return r.filter(function (v, k) { return k !== j; }); }); return 1 / (1 - ES.ols(xj, rest, { intercept: true }).r2); }

  var API = { ME: ME, drawME: drawME, observe: observe, lambda: lambda, slopeOf: slopeOf, influence: influence, lad: lad, genOutlier: genOutlier,
    truth: truth, genCurve: genCurve, basis: basis, polyFit: polyFit, mse: mse, sweep: sweep, reset: reset, vif: vif };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC9M = API;
})(typeof window !== 'undefined' ? window : this);
