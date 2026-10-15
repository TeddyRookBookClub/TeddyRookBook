/* Econometrics, Chapter 6 (Multiple Regression and Omitted Variables): the simulated worlds and estimators.
   window.EC6M in the browser, module.exports in Node (tested in node against closed forms and the OVB identity).
   Uses the shared library EconStats (static/business/econometrics/stats.js).

   World 1 (omitted ability): ability a ~ N(0, 1); schooling S = 13 + sdS (r a + sqrt(1 − r²) e), so corr(S, a) = r;
     wage = b0 + b1 S + b2 a + u, u ~ N(0, sdU²). The short regression leaves a out.
     Population bias of the short slope: b2 · cov(S, a) / var(S) = b2 r / sdS.
   World 2 (partialling out and the 3-D plane): educ = 13 + 2.5 z1, exper = 16 + 7 (c z1 + sqrt(1 − c²) z2) (kept ≥ 0),
     wage = 2 + 1.8 educ + 0.5 exper + 4 u.                                                                        */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require !== 'undefined' ? require('../stats.js') : null);
  var M = Math;

  var W1 = { b0: 8, b1: 2, sdS: 2.5, sdU: 5 };
  function genAbility(p, seed) {
    var r = ES.rng(seed), n = p.n, S = [], A = [], Y = [], rho = M.max(-0.999, M.min(0.999, p.r)), q = M.sqrt(1 - rho * rho);
    for (var i = 0; i < n; i++) {
      var a = r.n(), e = r.n(), u = r.n(), s = 13 + W1.sdS * (rho * a + q * e);
      S.push(s); A.push(a); Y.push(W1.b0 + W1.b1 * s + p.b2 * a + W1.sdU * u);
    }
    return { S: S, A: A, Y: Y, n: n };
  }
  function popBias(p) { return p.b2 * p.r / W1.sdS; }
  function fitAbility(d) {
    var X1 = d.S.map(function (s) { return [s]; }), X2 = d.S.map(function (s, i) { return [s, d.A[i]]; });
    var sh = ES.ols(d.Y, X1, { intercept: true }), lo = ES.ols(d.Y, X2, { intercept: true }), aux = ES.ols(d.A, X1, { intercept: true });
    return {
      short: sh, long: lo, aux: aux, bShort: sh.b[1], bLong: lo.b[1], bAbil: lo.b[2], delta: aux.b[1],
      gap: sh.b[1] - lo.b[1], formula: lo.b[2] * aux.b[1], identityErr: sh.b[1] - (lo.b[1] + lo.b[2] * aux.b[1])
    };
  }
  // fast slopes for the Monte Carlo (same numbers as ES.ols; checked in the tests)
  function slopes(d) {
    var n = d.n, ms = 0, ma = 0, my = 0, i;
    for (i = 0; i < n; i++) { ms += d.S[i]; ma += d.A[i]; my += d.Y[i]; } ms /= n; ma /= n; my /= n;
    var sss = 0, saa = 0, ssa = 0, ssy = 0, say = 0;
    for (i = 0; i < n; i++) { var s = d.S[i] - ms, a = d.A[i] - ma, y = d.Y[i] - my; sss += s * s; saa += a * a; ssa += s * a; ssy += s * y; say += a * y; }
    var det = sss * saa - ssa * ssa;
    return { short: ssy / sss, long: (saa * ssy - ssa * say) / det, abil: (sss * say - ssa * ssy) / det };
  }

  var W2 = { b0: 2, b1: 1.8, b2: 0.5, sdU: 4 };
  function genWorkers(p, seed) {
    var r = ES.rng(seed), n = p.n || 60, c = M.max(-0.95, M.min(0.95, p.c)), q = M.sqrt(1 - c * c), E = [], X = [], Y = [];
    for (var i = 0; i < n; i++) {
      var z1 = r.n(), z2 = r.n(), u = r.n(), ed = 13 + 2.5 * z1, ex = M.max(0, 16 + 7 * (c * z1 + q * z2));
      E.push(ed); X.push(ex); Y.push(W2.b0 + W2.b1 * ed + W2.b2 * ex + W2.sdU * u);
    }
    return { E: E, X: X, Y: Y, n: n };
  }
  // Frisch–Waugh–Lovell: residualize educ on exper, then regress wage on the residual
  function fwl(d) {
    var ex = d.X.map(function (v) { return [v]; });
    var step1 = ES.ols(d.E, ex, { intercept: true }), rr = step1.resid;
    var step3 = ES.ols(d.Y, rr.map(function (v) { return [v]; }), { intercept: true });
    var full = ES.ols(d.Y, d.E.map(function (v, i) { return [v, d.X[i]]; }), { intercept: true });
    var simple = ES.ols(d.Y, d.E.map(function (v) { return [v]; }), { intercept: true });
    // the same slope without an intercept in step 3 (the residuals have mean zero)
    var sxy = 0, sxx = 0; for (var i = 0; i < rr.length; i++) { sxy += rr[i] * d.Y[i]; sxx += rr[i] * rr[i]; }
    return { step1: step1, resid: rr, step3: step3, full: full, simple: simple, slope3: step3.b[1], slopeFull: full.b[1], slopeNoConst: sxy / sxx, r2aux: step1.r2 };
  }

  var API = { W1: W1, W2: W2, genAbility: genAbility, popBias: popBias, fitAbility: fitAbility, slopes: slopes, genWorkers: genWorkers, fwl: fwl };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC6M = API;
})(typeof window !== 'undefined' ? window : this);
