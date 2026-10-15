/* Econometrics, Chapter 11 (Panel Data: Fixed and Random Effects): the simulated panel and the estimators.
   window.EC11M in the browser, module.exports in Node. Uses EconStats (static/business/econometrics/stats.js).

   Panel: N cities observed for T years. Each city has a hidden baseline a_i ~ N(0, σa²).
     police   x_it = 25 + 3κ·(a_i/σa) + 2ξ_it (+ 0.6 t with a nationwide trend)
     crime    y_it = 40 − 0.8 x_it + a_i (− 1.5 t with a nationwide trend) + 2u_it
   κ links the hidden baseline to police hiring; with κ > 0 pooled OLS is biased upward (it can even flip the sign).
   Estimators: pooled OLS, between, fixed effects (within = LSDV), first differences, random effects (Swamy–Arora),
   the Hausman test, and (second simulation) classic, robust and cluster-robust standard errors.            */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require !== 'undefined' ? require('../stats.js') : null);
  var M = Math, B1 = -0.8;

  function gen(p, seed) {
    var r = ES.rng(seed), N = p.N, T = p.T, id = [], t = [], x = [], y = [], a = [];
    for (var i = 0; i < N; i++) a.push(p.sa * r.n());
    for (i = 0; i < N; i++) for (var s = 0; s < T; s++) {
      var xi = 25 + 3 * p.k * a[i] / p.sa + 2 * r.n() + (p.trend ? 0.6 * s : 0);
      id.push(i); t.push(s); x.push(xi); y.push(40 + B1 * xi + a[i] + (p.trend ? -1.5 * s : 0) + 2 * r.n());
    }
    return { id: id, t: t, x: x, y: y, a: a, N: N, T: T, n: N * T };
  }
  function groupMeans(v, g, G) { var s = new Array(G).fill(0), c = new Array(G).fill(0); for (var i = 0; i < v.length; i++) { s[g[i]] += v[i]; c[g[i]]++; } return s.map(function (q, k) { return q / c[k]; }); }
  function within(d, twoWay) {
    var xm = groupMeans(d.x, d.id, d.N), ym = groupMeans(d.y, d.id, d.N), xt = groupMeans(d.x, d.t, d.T), yt = groupMeans(d.y, d.t, d.T), X = ES.mean(d.x), Y = ES.mean(d.y);
    var xd = d.x.map(function (v, i) { return v - xm[d.id[i]] - (twoWay ? xt[d.t[i]] - X : 0); }), yd = d.y.map(function (v, i) { return v - ym[d.id[i]] - (twoWay ? yt[d.t[i]] - Y : 0); });
    var sxy = 0, sxx = 0; for (var i = 0; i < xd.length; i++) { sxy += xd[i] * yd[i]; sxx += xd[i] * xd[i]; }
    return { b: sxy / sxx, xd: xd, yd: yd, xm: xm, ym: ym };
  }
  function dummies(d, twoWay) { return d.x.map(function (v, i) { var r = [v]; for (var g = 1; g < d.N; g++) r.push(d.id[i] === g ? 1 : 0); if (twoWay) for (var s = 1; s < d.T; s++) r.push(d.t[i] === s ? 1 : 0); return r; }); }
  function lsdv(d, twoWay) { var o = ES.ols(d.y, dummies(d, twoWay), { intercept: true }); return { b: o.b[1], se: o.se[1], o: o }; }
  function firstDiff(d, twoWay) {
    var dx = [], dy = [], tt = [];
    for (var i = 0; i < d.n; i++) if (d.t[i] > 0) { dx.push(d.x[i] - d.x[i - 1]); dy.push(d.y[i] - d.y[i - 1]); tt.push(d.t[i]); }
    var X = dx.map(function (v, k) { var r = [v]; if (twoWay) for (var s = 2; s < d.T; s++) r.push(tt[k] === s ? 1 : 0); return r; });
    var o = ES.ols(dy, X, { intercept: !!twoWay });
    return { b: twoWay ? o.b[1] : o.b[0], se: twoWay ? o.se[1] : o.se[0], dx: dx, dy: dy };
  }
  function pooled(d) { var o = ES.ols(d.y, d.x.map(function (v) { return [v]; }), { intercept: true }); return { b: o.b[1], se: o.se[1], b0: o.b[0], o: o }; }
  function between(d) { var xm = groupMeans(d.x, d.id, d.N), ym = groupMeans(d.y, d.id, d.N), o = ES.ols(ym, xm.map(function (v) { return [v]; }), { intercept: true }); return { b: o.b[1], se: o.se[1], b0: o.b[0], xm: xm, ym: ym, o: o }; }
  // random effects by quasi-demeaning with Swamy–Arora variance components (one-way; year dummies when twoWay)
  function randomEffects(d, twoWay, feIn) {
    var fe = feIn || lsdv(d, twoWay), K = 1, su2 = fe.o.ssr / (d.n - d.N - K - (twoWay ? d.T - 1 : 0));
    var bt = between(d), sb2 = bt.o.ssr / (d.N - K - 1), sa2 = M.max(0, sb2 - su2 / d.T), theta = 1 - M.sqrt(su2 / (su2 + d.T * sa2));
    var xm = bt.xm, ym = bt.ym, Y = [], X = [];
    for (var i = 0; i < d.n; i++) {
      var g = d.id[i], r = [1 - theta, d.x[i] - theta * xm[g]];
      if (twoWay) for (var s = 1; s < d.T; s++) r.push((d.t[i] === s ? 1 : 0) - theta / d.T);
      X.push(r); Y.push(d.y[i] - theta * ym[g]);
    }
    var o = ES.ols(Y, X, {});
    // GLS variance with the estimated components: σ̂u² (X̃'X̃)⁻¹, the same σ̂u² the fixed-effects variance uses
    return { b: o.b[1], se: M.sqrt(o.vcov[1][1] * su2 / o.s2), theta: theta, su2: su2, sa2: sa2, o: o };
  }
  function hausman(fe, re) { var dv = fe.se * fe.se - re.se * re.se, H = dv > 0 ? (fe.b - re.b) * (fe.b - re.b) / dv : NaN; return { H: H, p: isFinite(H) ? 1 - ES.chi2Cdf(H, 1) : NaN }; }
  function all(d, twoWay, light) { // light: skip what only the live display needs (used by the Monte Carlo)
    var fe = lsdv(d, twoWay), re = randomEffects(d, twoWay, fe), out = { pooled: pooled(d), between: between(d), fe: fe, fd: firstDiff(d, twoWay), re: re, haus: hausman(fe, re) };
    if (!light) { out.w1 = within(d, false); out.w2 = within(d, true); out.fe1 = twoWay ? within(d, false).b : fe.b; out.fe2 = twoWay ? fe.b : within(d, true).b; }
    return out;
  }

  // clustered errors: G clusters of m; x and u each share a cluster component (intra-cluster correlations rx, ru)
  function genCl(p, seed) {
    var r = ES.rng(seed), x = [], y = [], g = [];
    for (var c = 0; c < p.G; c++) { var cx = r.n(), cu = r.n(); for (var j = 0; j < p.m; j++) { var xi = M.sqrt(p.rx) * cx + M.sqrt(1 - p.rx) * r.n(), ui = M.sqrt(p.ru) * cu + M.sqrt(1 - p.ru) * r.n(); x.push(xi); y.push(1 + 0.5 * xi + ui); g.push(c); } }
    return { x: x, y: y, g: g, G: p.G };
  }
  // slope with classic, HC1 and cluster-robust standard errors (same formulas as EconStats.ols; checked in the tests)
  function clFit(d) {
    var n = d.x.length, mx = 0, my = 0, i; for (i = 0; i < n; i++) { mx += d.x[i]; my += d.y[i]; } mx /= n; my /= n;
    var sxx = 0, sxy = 0; for (i = 0; i < n; i++) { sxx += (d.x[i] - mx) * (d.x[i] - mx); sxy += (d.x[i] - mx) * (d.y[i] - my); }
    var b = sxy / sxx, a = my - b * mx, ssr = 0, hc = 0, sum = new Array(d.G).fill(0), sum0 = new Array(d.G).fill(0);
    // the cluster meat needs both columns (intercept and x); for the slope's variance we use the full sandwich
    var XtXi = ES.inv([[n, n * mx], [n * mx, sxx + n * mx * mx]]);
    for (i = 0; i < n; i++) { var e = d.y[i] - a - b * d.x[i]; ssr += e * e; hc += (d.x[i] - mx) * (d.x[i] - mx) * e * e; sum0[d.g[i]] += e; sum[d.g[i]] += d.x[i] * e; }
    var m00 = 0, m01 = 0, m11 = 0; for (var c = 0; c < d.G; c++) { m00 += sum0[c] * sum0[c]; m01 += sum0[c] * sum[c]; m11 += sum[c] * sum[c]; }
    var A = XtXi, V11 = A[1][0] * (m00 * A[0][1] + m01 * A[1][1]) + A[1][1] * (m01 * A[0][1] + m11 * A[1][1]), G = d.G;
    return { b: b, seC: M.sqrt(ssr / (n - 2) / sxx), seH: M.sqrt(n / (n - 2) * hc) / sxx, seCl: M.sqrt(V11 * (G / (G - 1)) * ((n - 1) / (n - 2))) };
  }
  function moulton(p) { return 1 + (p.m - 1) * p.rx * p.ru; }

  var API = { B1: B1, gen: gen, groupMeans: groupMeans, within: within, lsdv: lsdv, firstDiff: firstDiff, pooled: pooled, between: between, randomEffects: randomEffects, hausman: hausman, all: all,
    genCl: genCl, clFit: clFit, moulton: moulton };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC11M = API;
})(typeof window !== 'undefined' ? window : this);
