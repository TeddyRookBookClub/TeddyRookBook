/* Econometrics, Chapter 8 (Heteroskedasticity and Robust Standard Errors): the simulated world and the estimators.
   window.EC8M in the browser, module.exports in Node. Uses EconStats (static/business/econometrics/stats.js).

   World: annual household income x ~ U(20, 160) ($ thousands); annual saving y = −2 + 0.12 x + u ($ thousands),
   sd(u | x) = 3 · g(z) with z = (x − 90)/70 in [−1, 1] and
     fan:    g = exp(γ z)                  (noise grows with income)
     edges:  g = exp(γ (1.5 z² − 0.5))     (noisy at both ends, a bow tie)
     middle: g = exp(γ (0.5 − 1.5 z²))     (noisy in the middle, a football)
   γ = 0 is homoskedastic. OLS stays unbiased for every γ; only the variance of the estimates changes.          */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require !== 'undefined' ? require('../stats.js') : null);
  var M = Math, B0 = -2, B1 = 0.12, SIG = 3;

  function g(shape, gam, x) {
    var z = (x - 90) / 70;
    return shape === 'edges' ? M.exp(gam * (1.5 * z * z - 0.5)) : shape === 'middle' ? M.exp(gam * (0.5 - 1.5 * z * z)) : M.exp(gam * z);
  }
  function sdAt(p, x) { return SIG * g(p.shape, p.g, x); }
  function gen(p, seed) {
    var r = ES.rng(seed), x = [], y = [];
    for (var i = 0; i < p.n; i++) { var xi = 20 + 140 * r.u(); x.push(xi); y.push(B0 + B1 * xi + sdAt(p, xi) * r.n()); }
    return { x: x, y: y, n: p.n };
  }
  // closed-form simple regression with classic and HC1 standard errors (same numbers as EconStats.ols; see the tests)
  function simple(x, y) {
    var n = x.length, mx = 0, my = 0, i; for (i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n;
    var sxx = 0, sxy = 0; for (i = 0; i < n; i++) { sxx += (x[i] - mx) * (x[i] - mx); sxy += (x[i] - mx) * (y[i] - my); }
    var b1 = sxy / sxx, b0 = my - b1 * mx, ssr = 0, meat = 0, res = new Array(n);
    for (i = 0; i < n; i++) { var e = y[i] - b0 - b1 * x[i]; res[i] = e; ssr += e * e; meat += (x[i] - mx) * (x[i] - mx) * e * e; }
    return { b0: b0, b1: b1, seC: M.sqrt(ssr / (n - 2) / sxx), seH: M.sqrt(n / (n - 2) * meat) / sxx, resid: res, ssr: ssr };
  }
  // one Monte Carlo draw: the slope, both standard errors, and whether each 95% interval covers the truth
  function draw(p, seed, crit) {
    var d = gen(p, seed), f = simple(d.x, d.y);
    return { b1: f.b1, seC: f.seC, seH: f.seH, inC: M.abs(f.b1 - B1) <= crit * f.seC, inH: M.abs(f.b1 - B1) <= crit * f.seH };
  }
  // the true sampling sd of the OLS slope given x: sqrt(Σ (x − x̄)² σᵢ²) / SSTx, averaged over x draws in the tests
  function trueSd(p, x) { var n = x.length, mx = ES.mean(x), s = 0, sxx = 0; for (var i = 0; i < n; i++) { var dx = x[i] - mx, v = sdAt(p, x[i]); s += dx * dx * v * v; sxx += dx * dx; } return M.sqrt(s) / sxx; }

  // Breusch–Pagan: regress û² on x; LM = n R² ~ χ²(1); F version too. White (special form): û² on ŷ and ŷ², LM ~ χ²(2)
  function bp(x, res) {
    var u2 = res.map(function (e) { return e * e; }), a = ES.ols(u2, x.map(function (v) { return [v]; }), { intercept: true }), n = x.length, LM = n * a.r2;
    return { LM: LM, p: 1 - ES.chi2Cdf(LM, 1), F: a.F, Fp: a.Fp, aux: a, u2: u2 };
  }
  function white(yh, res) {
    var u2 = res.map(function (e) { return e * e; }), a = ES.ols(u2, yh.map(function (v) { return [v, v * v / 100]; }), { intercept: true }), LM = yh.length * a.r2;
    return { LM: LM, p: 1 - ES.chi2Cdf(LM, 2) };
  }
  // weighted least squares with variance function h(x): OLS of y/√h on 1/√h and x/√h (no separate intercept)
  function wls(x, y, h) {
    var Y = y.map(function (v, i) { return v / M.sqrt(h[i]); }), X = x.map(function (v, i) { var s = M.sqrt(h[i]); return [1 / s, v / s]; });
    var o = ES.ols(Y, X, {}); return { b0: o.b[0], b1: o.b[1], se: o.se[1], o: o };
  }
  function wlsTrue(p, d) { return wls(d.x, d.y, d.x.map(function (v) { var s = g(p.shape, p.g, v); return s * s; })); }
  // feasible GLS: regress log(û²) on x and x², ĥ = exp(fitted), then WLS with ĥ
  function fgls(d, res) {
    var lu = res.map(function (e) { return M.log(e * e + 1e-12); }), a = ES.ols(lu, d.x.map(function (v) { var z = (v - 90) / 70; return [z, z * z]; }), { intercept: true });
    var h = a.fit.map(function (v) { return M.exp(v); }); return wls(d.x, d.y, h);
  }
  var API = { B0: B0, B1: B1, SIG: SIG, g: g, sdAt: sdAt, gen: gen, simple: simple, draw: draw, trueSd: trueSd, bp: bp, white: white, wls: wls, wlsTrue: wlsTrue, fgls: fgls };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC8M = API;
})(typeof window !== 'undefined' ? window : this);
