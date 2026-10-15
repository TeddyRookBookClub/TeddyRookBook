/* Time Series: Trends, Autocorrelation and Forecasting (/business/econometrics/time-series/): the models.
   window.Ec15Model in the browser, module.exports in Node (tested in /tmp/work_ec3/test/ec15.test.js).

   Arma(phi, theta, seed)        a stream y_t = phi y_{t-1} + e_t + theta e_{t-1}; .next(), .burn(n); phi = 1 is a random walk
   acfTheory(phi, theta, K)      population autocorrelations of a stationary ARMA(1,1)
   pacf(r)                       partial autocorrelations from autocorrelations (Durbin-Levinson)
   df(y)                         Dickey-Fuller regression dy_t = a + th y_{t-1} + e: t statistic on th
   newey(y, X, lags)             OLS with Newey-West standard errors
   spurious(T, phi, opt, seed)   regress one independent AR(phi) (or random walk) series on another
   fitAR(y, p), forecast(...)    AR(p) by OLS and h-step forecasts with intervals from the psi weights
   coint(p, seed), engleGranger  y = a + b x + u with u an AR(rho); Engle-Granger test and error-correction model  */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('../stats.js'));
  else root.Ec15Model = factory(root.EconStats);
})(typeof window !== 'undefined' ? window : this, function (S) {
  'use strict';
  var DF_CV = { '1%': -3.43, '5%': -2.86, '10%': -2.57 }, EG_CV = { '1%': -3.90, '5%': -3.34, '10%': -3.04 };
  function Arma(phi, theta, seed, sd) {
    var r = S.rng(seed), y = 0, e1 = 0; sd = sd || 1;
    var o = { phi: phi, theta: theta, r: r };
    o.next = function () { var e = sd * r.n(); y = o.phi * y + e + o.theta * e1; e1 = e; return y; };
    o.burn = function (n) { for (var i = 0; i < n; i++) o.next(); return o; };
    o.set = function (v) { y = v; };
    return o;
  }
  function series(phi, theta, T, seed, burn) { var a = Arma(phi, theta, seed); if (Math.abs(phi) < 1) a.burn(burn === undefined ? 200 : burn); var out = []; for (var i = 0; i < T; i++) out.push(a.next()); return out; }
  function acfTheory(phi, theta, K) {
    var out = []; if (Math.abs(phi) >= 1) return null;
    var r1 = (1 + phi * theta) * (phi + theta) / (1 + 2 * phi * theta + theta * theta);
    for (var k = 1; k <= K; k++) out.push(k === 1 ? r1 : out[k - 2] * phi);
    return out;
  }
  function varTheory(phi, theta) { return Math.abs(phi) < 1 ? (1 + 2 * phi * theta + theta * theta) / (1 - phi * phi) : Infinity; }
  function pacf(r) { // Durbin-Levinson
    var K = r.length, out = [], prev = [];
    for (var k = 1; k <= K; k++) {
      var num = r[k - 1], den = 1;
      for (var j = 1; j < k; j++) { num -= prev[j - 1] * r[k - j - 1]; den -= prev[j - 1] * r[j - 1]; }
      var a = num / den, cur = [];
      for (j = 1; j < k; j++) cur.push(prev[j - 1] - a * prev[k - j - 1]);
      cur.push(a); prev = cur; out.push(a);
    }
    return out;
  }
  function df(y) {
    var dy = [], X = [];
    for (var t = 1; t < y.length; t++) { dy.push(y[t] - y[t - 1]); X.push([1, y[t - 1]]); }
    var o = S.ols(dy, X); return { t: o.t[1], theta: o.b[1], rho: 1 + o.b[1] };
  }
  // OLS with Newey-West (Bartlett kernel) standard errors, X rows include the constant
  function newey(y, X, lags) {
    var o = S.ols(y, X), n = y.length, k = X[0].length, e = o.resid, XtXi = S.inv(S.mul(S.T(X), X)), Sm = [];
    for (var a = 0; a < k; a++) Sm.push(new Array(k).fill(0));
    for (var t = 0; t < n; t++) for (a = 0; a < k; a++) for (var b = 0; b < k; b++) Sm[a][b] += e[t] * e[t] * X[t][a] * X[t][b];
    for (var l = 1; l <= lags; l++) {
      var w = 1 - l / (lags + 1);
      for (t = l; t < n; t++) { var q = w * e[t] * e[t - l]; for (a = 0; a < k; a++) for (b = 0; b < k; b++) Sm[a][b] += q * (X[t][a] * X[t - l][b] + X[t - l][a] * X[t][b]); }
    }
    var V = S.mul(S.mul(XtXi, Sm), XtXi), se = V.map(function (r, j) { return Math.sqrt(r[j]); });
    return { b: o.b, se: se, t: o.b.map(function (v, j) { return v / se[j]; }), ols: o, lags: lags };
  }
  function nwLags(n) { return Math.max(1, Math.floor(4 * Math.pow(n / 100, 2 / 9))); } // Wooldridge's rule of thumb
  // regress y on x, two independent series; opt.diff = difference both first; opt.nw = Newey-West SEs
  function spurious(T, phi, opt, seed) {
    var y = series(phi, 0, T + 1, seed), x = series(phi, 0, T + 1, seed + 7777);
    var Y = [], X = [];
    for (var t = 1; t <= T; t++) { if (opt.diff) { Y.push(y[t] - y[t - 1]); X.push([1, x[t] - x[t - 1]]); } else { Y.push(y[t]); X.push([1, x[t]]); } }
    var o = S.ols(Y, X), tt = o.t[1], se = o.se[1];
    if (opt.nw) { var nw = newey(Y, X, nwLags(T)); tt = nw.t[1]; se = nw.se[1]; }
    var dw = 0, ss = 0; for (t = 0; t < o.resid.length; t++) { ss += o.resid[t] * o.resid[t]; if (t) dw += Math.pow(o.resid[t] - o.resid[t - 1], 2); }
    return { y: y.slice(1), x: x.slice(1), b: o.b, t: tt, se: se, r2: o.r2, dw: dw / ss, p: 2 * (1 - S.tCdf(Math.abs(tt), o.df)), df: o.df, Y: Y, Xv: X.map(function (r) { return r[1]; }) };
  }
  // AR(p) with a constant, by OLS
  function fitAR(y, p) {
    var Y = [], X = [];
    for (var t = p; t < y.length; t++) { Y.push(y[t]); var row = [1]; for (var j = 1; j <= p; j++) row.push(y[t - j]); X.push(row); }
    var o = S.ols(Y, X); return { c: o.b[0], phi: o.b.slice(1), sigma: o.sigma, se: o.se, p: p };
  }
  // h-step forecasts: point forecasts by the recursion, intervals from psi weights (ignoring estimation error)
  function forecast(y, m, H) {
    var hist = y.slice(-Math.max(1, m.p)), f = [], psi = [1], v = [];
    for (var h = 1; h <= H; h++) {
      var s = m.c; for (var j = 1; j <= m.p; j++) { var idx = hist.length - j; s += m.phi[j - 1] * hist[idx]; }
      hist.push(s); f.push(s);
      if (h > 1) { var ps = 0; for (j = 1; j <= Math.min(m.p, h - 1); j++) ps += m.phi[j - 1] * psi[h - 1 - j]; psi.push(ps); }
      var acc = 0; for (j = 0; j < h; j++) acc += psi[j] * psi[j]; v.push(m.sigma * m.sigma * acc);
    }
    return { f: f, se: v.map(Math.sqrt), psi: psi };
  }
  function rwForecast(y, H) { // random walk: forecast = last value, variance h sigma^2 (sigma from the differences)
    var d = []; for (var t = 1; t < y.length; t++) d.push(y[t] - y[t - 1]); var s = Math.sqrt(S.mean(d.map(function (v) { return v * v; })));
    var f = [], se = []; for (var h = 1; h <= H; h++) { f.push(y[y.length - 1]); se.push(s * Math.sqrt(h)); } return { f: f, se: se };
  }
  // generator for the forecasting simulation: truth = {phi: [..], c, sd}; returns T + H values
  function arPath(truth, n, seed) {
    var r = S.rng(seed), p = truth.phi.length, y = [], burn = truth.rw ? 0 : 300, hist = new Array(p).fill(truth.rw ? 0 : truth.c / (1 - truth.phi.reduce(function (a, b) { return a + b; }, 0)));
    for (var t = 0; t < n + burn; t++) {
      var s = truth.c; for (var j = 0; j < p; j++) s += truth.phi[j] * hist[hist.length - 1 - j];
      s += truth.sd * r.n(); hist.push(s); if (hist.length > 10) hist.shift(); if (t >= burn) y.push(s);
    }
    return y;
  }
  // cointegration: x a random walk, y = a + b x + u, u_t = rho u_{t-1} + e_t
  function coint(p, seed) {
    var r = S.rng(seed), x = [], y = [], u = 0, xv = 0;
    for (var t = 0; t < p.T; t++) { xv += r.n(); u = p.rho * u + 0.8 * r.n(); x.push(xv); y.push(p.a + p.b * xv + u); }
    return { x: x, y: y };
  }
  function engleGranger(x, y) {
    var o = S.ols(y, x.map(function (v) { return [1, v]; })), u = o.resid, du = [], ul = [];
    for (var t = 1; t < u.length; t++) { du.push(u[t] - u[t - 1]); ul.push([u[t - 1]]); }
    var d = S.ols(du, ul); // no constant: the residuals already average zero
    // error-correction model: dy_t = a0 + g dx_t + d u_{t-1} + e
    var dy = [], X = []; for (t = 1; t < u.length; t++) { dy.push(y[t] - y[t - 1]); X.push([1, x[t] - x[t - 1], u[t - 1]]); }
    var e = S.ols(dy, X);
    return { a: o.b[0], b: o.b[1], u: u, t: d.t[0], rhoHat: 1 + d.b[0], ecm: { g: e.b[1], d: e.b[2], seD: e.se[2], tD: e.t[2] } };
  }
  return { DF_CV: DF_CV, EG_CV: EG_CV, Arma: Arma, series: series, acfTheory: acfTheory, varTheory: varTheory, pacf: pacf, df: df, newey: newey, nwLags: nwLags, spurious: spurious, fitAR: fitAR, forecast: forecast, rwForecast: rwForecast, arPath: arPath, coint: coint, engleGranger: engleGranger };
});
