/* Econometrics, Chapter 5: the Monte Carlo lab (window.EC5Model in the browser, module.exports in Node, where it is
   unit-tested against EconStats.ols). Needs EconStats (../stats.js).

   The population model, with the true slope β₁ = 4 (exam points per hour of study):
     score = 50 + 4·hours + u,   hours spread evenly over [5 − s, 5 + s],   u = σ·e with E(e) = 0, Var(e) = 1
   and four ways to break it, each a switch:
     curve    the truth bends: score = 50 + 4·hours − 0.1·hours² + u (diminishing returns); we still fit a line
     hetero   the noise grows with hours: sd(u | x) ∝ (0.1 + t)², t = (x − x_min)/(x_max − x_min), scaled so the average
              variance stays σ²
     omitted  ability z = 0.5·(hours − 5) + v also raises scores by 2 points per unit, and we leave it out
     cluster  students come in classrooms of 10 (5 when n < 50) that share part of their hours and part of their luck
   Each sample is fitted by OLS with closed-form formulas; standard errors are classic, robust (HC1) or clustered,
   with the same degrees-of-freedom rules as EconStats.ols.                                                      */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require === 'function' ? require('../stats.js') : null);
  var M = Math, B0 = 50, B1 = 4, B2 = -0.1, GAMMA = 2, DELTA = 0.5, RHO = 0.5;
  // average of (0.1 + t)^4 over t in [0, 1], so the heteroskedastic noise has average variance σ²
  var H4 = (M.pow(1.1, 5) - M.pow(0.1, 5)) / 5;

  function errDraw(r, shape) {
    if (shape === 'skew') return -M.log(1 - r.u()) - 1;                 // centered exponential: skewness 2
    if (shape === 'fat') { var t = r.t(3); return t / M.sqrt(3); }         // t with 3 degrees of freedom, variance 1
    return r.n();
  }
  // one sample. P: {n, s, sigma, shape, curve, hetero, omitted, cluster}
  function sample(P, r) {
    var n = P.n, x = new Array(n), y = new Array(n), g = new Array(n), lo = 5 - P.s, hi = 5 + P.s, m = n >= 50 ? 10 : 5;
    var gx = 0, gu = 0;
    for (var i = 0; i < n; i++) {
      var gi = M.floor(i / m); g[i] = gi;
      var xi;
      if (P.cluster) {
        if (i % m === 0) { gx = r.u(); gu = r.n(); }                    // the classroom's shared part
        xi = lo + (hi - lo) * (0.7 * gx + 0.3 * r.u());
      } else xi = lo + (hi - lo) * r.u();
      var e = errDraw(r, P.shape);
      if (P.cluster) e = M.sqrt(RHO) * gu + M.sqrt(1 - RHO) * e;           // correlation RHO within a classroom
      if (P.hetero) { var t = (xi - lo) / (hi - lo); e *= (0.1 + t) * (0.1 + t) / M.sqrt(H4); }
      var yi = B0 + B1 * xi + P.sigma * e;
      if (P.curve) yi += B2 * xi * xi;
      if (P.omitted) yi += GAMMA * (DELTA * (xi - 5) + r.n());
      x[i] = xi; y[i] = yi;
    }
    return { x: x, y: y, g: g };
  }
  // OLS of y on x with an intercept, and the slope's standard error. se: 'classic' | 'HC1' | 'cluster'
  function fit(D, se) {
    var x = D.x, y = D.y, n = x.length, mx = 0, my = 0, i;
    for (i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n;
    var sxx = 0, sxy = 0; for (i = 0; i < n; i++) { var dx = x[i] - mx; sxx += dx * dx; sxy += dx * (y[i] - my); }
    var b1 = sxy / sxx, b0 = my - b1 * mx, ssr = 0, meat = 0, df = n - 2, G = 0;
    var sums = {};
    for (i = 0; i < n; i++) {
      var e = y[i] - b0 - b1 * x[i], dxe = (x[i] - mx) * e; ssr += e * e;
      if (se === 'HC1') meat += dxe * dxe;
      else if (se === 'cluster') { if (sums[D.g[i]] === undefined) { sums[D.g[i]] = 0; G++; } sums[D.g[i]] += dxe; }
    }
    var v;
    if (se === 'HC1') v = meat / (sxx * sxx) * n / (n - 2);
    else if (se === 'cluster') { var s = 0; for (var k in sums) s += sums[k] * sums[k]; v = s / (sxx * sxx) * (G / (G - 1)) * ((n - 1) / (n - 2)); df = G - 1; }
    else v = ssr / (n - 2) / sxx;
    return { b0: b0, b1: b1, se: M.sqrt(v), df: df, mx: mx, sxx: sxx, sigmaHat: M.sqrt(ssr / (n - 2)) };
  }
  // what the slope estimates on average: β₁, plus the bias from each switch
  function target(P) { var t = B1; if (P.curve) t += B2 * 2 * 5; if (P.omitted) t += GAMMA * DELTA; return t; }
  // the textbook standard deviation of β̂₁ under the ideal assumptions: σ/√(n·Var(x)), Var(x) = (2s)²/12
  function idealSD(P) { return P.sigma / M.sqrt(P.n * (4 * P.s * P.s) / 12); }

  // ---------- the Gauss–Markov race: linear unbiased estimators of the slope ----------
  // OLS; Wald's grouping estimator (difference of the means of the top and bottom halves by x, over the difference in
  // x); the endpoints (the two points with the smallest and largest x); and weighted least squares with the true
  // weights 1/Var(u | x), which is the best linear unbiased estimator when the noise is heteroskedastic.
  function race(P, r) {
    var D = sample(P, r), n = D.x.length, idx = D.x.map(function (v, i) { return i; }).sort(function (a, b) { return D.x[a] - D.x[b]; });
    var ols = fit(D, 'classic').b1, h = M.floor(n / 2), xl = 0, yl = 0, xu = 0, yu = 0, i;
    for (i = 0; i < h; i++) { xl += D.x[idx[i]]; yl += D.y[idx[i]]; xu += D.x[idx[n - 1 - i]]; yu += D.y[idx[n - 1 - i]]; }
    var group = (yu - yl) / (xu - xl), a = idx[0], b = idx[n - 1], ends = (D.y[b] - D.y[a]) / (D.x[b] - D.x[a]);
    var lo = 5 - P.s, hi = 5 + P.s, sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (i = 0; i < n; i++) { var t = (D.x[i] - lo) / (hi - lo), v = P.hetero ? M.pow(0.1 + t, 4) : 1, w = 1 / v; sw += w; sx += w * D.x[i]; sy += w * D.y[i]; }
    var mx = sx / sw, my = sy / sw;
    for (i = 0; i < n; i++) { var t2 = (D.x[i] - lo) / (hi - lo), w2 = 1 / (P.hetero ? M.pow(0.1 + t2, 4) : 1); sxx += w2 * (D.x[i] - mx) * (D.x[i] - mx); sxy += w2 * (D.x[i] - mx) * (D.y[i] - my); }
    return { ols: ols, group: group, ends: ends, wls: sxy / sxx };
  }

  var API = { race: race, B0: B0, B1: B1, B2: B2, GAMMA: GAMMA, DELTA: DELTA, RHO: RHO, sample: sample, fit: fit, target: target, idealSD: idealSD, errDraw: errDraw };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC5Model = API;
})(typeof window !== 'undefined' ? window : this);
