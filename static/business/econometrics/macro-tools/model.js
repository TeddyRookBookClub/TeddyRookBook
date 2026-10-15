/* VARs and GMM (/business/econometrics/macro-tools/): the models.
   window.Ec16Model in the browser, module.exports in Node (tested in /tmp/work_ec3/test/ec16.test.js).

   WORLDS                      two-variable economies (inflation gap, interest-rate gap) with structural shocks ordered
                               inflation first: the rate can react to an inflation shock within the period, not the reverse
   Economy(w, rho, seed)       a live simulation: .step(shock) returns [pi, i]
   simulate(w, rho, T, seed)   T periods of data
   fitVAR(Y)                   VAR(1) by OLS equation by equation: A, c, Sigma, Granger F tests
   chol2, irf(A, P, H)         Cholesky factor of a 2x2 covariance; impulse responses Theta_h = A^h P
   cholOrder(Sig, order)       impact matrix for ordering 'pi' (inflation first) or 'i' (rate first)
   fevd(Th, h)                 forecast-error variance shares
   Method of moments: momA, gmmA (mean and variance, optionally the third moment)
   Linear IV-GMM: ivData, ivGMM (2SLS, identity and efficient weights, Hansen's J)                        */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('../stats.js'));
  else root.Ec16Model = factory(root.EconStats);
})(typeof window !== 'undefined' ? window : this, function (S) {
  'use strict';
  var WORLDS = {
    taylor: { name: 'Rate reacts to inflation', A: [[0.7, -0.15], [0.35, 0.75]], s: [0.5, 0.4] },
    nofeed: { name: 'Rate has no effect', A: [[0.8, 0], [0.4, 0.7]], s: [0.5, 0.4] },
    news: { name: 'Rate sees the future', A: [[0.6, 0], [0, 0.5]], s: [0.4, 0.3], news: true }
  };
  function chol2(S2) { var a = Math.sqrt(S2[0][0]), b = S2[1][0] / a, c = Math.sqrt(Math.max(1e-12, S2[1][1] - b * b)); return [[a, 0], [b, c]]; }
  function trueP(w, rho) { var s = w.s; return chol2([[s[0] * s[0], rho * s[0] * s[1]], [rho * s[0] * s[1], s[1] * s[1]]]); }
  function Economy(w, rho, seed) {
    var r = S.rng(seed), y = [0, 0], n1 = 0, P = trueP(w, rho);
    return {
      y: function () { return y.slice(); },
      step: function (shock) { // shock = [extra eps_pi, extra eps_i] in standard deviations
        var e1 = r.n() + (shock ? shock[0] : 0), e2 = r.n() + (shock ? shock[1] : 0), u = [P[0][0] * e1, P[1][0] * e1 + P[1][1] * e2];
        var A = w.A, ny = [A[0][0] * y[0] + A[0][1] * y[1] + u[0], A[1][0] * y[0] + A[1][1] * y[1] + u[1]];
        if (w.news) { var n = r.n(); ny[0] += 0.8 * n1; ny[1] += 0.7 * n; n1 = n; } // the rate reacts to news about next period's inflation
        y = ny; return y.slice();
      }
    };
  }
  function simulate(w, rho, T, seed) { var e = Economy(w, rho, seed), out = []; for (var t = 0; t < 100; t++) e.step(); for (t = 0; t < T; t++) out.push(e.step()); return out; }
  function fitVAR(Y) {
    var X = [], y1 = [], y2 = [];
    for (var t = 1; t < Y.length; t++) { X.push([1, Y[t - 1][0], Y[t - 1][1]]); y1.push(Y[t][0]); y2.push(Y[t][1]); }
    var o1 = S.ols(y1, X), o2 = S.ols(y2, X), T = y1.length, k = 3;
    var Sg = [[0, 0], [0, 0]];
    for (t = 0; t < T; t++) { var a = o1.resid[t], b = o2.resid[t]; Sg[0][0] += a * a; Sg[0][1] += a * b; Sg[1][1] += b * b; }
    Sg[0][0] /= T - k; Sg[0][1] /= T - k; Sg[1][1] /= T - k; Sg[1][0] = Sg[0][1];
    // Granger: with one lag, the F test of one exclusion is the squared t statistic
    var F12 = o1.t[2] * o1.t[2], F21 = o2.t[1] * o2.t[1];
    return { A: [[o1.b[1], o1.b[2]], [o2.b[1], o2.b[2]]], c: [o1.b[0], o2.b[0]], Sig: Sg, se: [[o1.se[1], o1.se[2]], [o2.se[1], o2.se[2]]], T: T,
      granger: { iToPi: { F: F12, p: 1 - S.fCdf(F12, 1, T - k) }, piToI: { F: F21, p: 1 - S.fCdf(F21, 1, T - k) } }, corr: Sg[0][1] / Math.sqrt(Sg[0][0] * Sg[1][1]) };
  }
  function cholOrder(Sg, order) {
    if (order === 'pi') return chol2(Sg);
    var Ls = chol2([[Sg[1][1], Sg[1][0]], [Sg[0][1], Sg[0][0]]]); // rate first, then swap back
    return [[Ls[1][1], Ls[1][0]], [Ls[0][1], Ls[0][0]]];
  }
  function mm(A, B) { return [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]]; }
  function irf(A, P, H) { var out = [P], M = P; for (var h = 1; h <= H; h++) { M = mm(A, M); out.push(M); } return out; } // out[h][var][shock]
  function fevd(Th, h) {
    var s = [[0, 0], [0, 0]];
    for (var q = 0; q < h; q++) for (var j = 0; j < 2; j++) for (var k = 0; k < 2; k++) s[j][k] += Th[q][j][k] * Th[q][j][k];
    return s.map(function (r) { var t = r[0] + r[1]; return [r[0] / t, r[1] / t]; });
  }
  // true structural responses for the "news" world are not a VAR(1); return the VAR(1) part only
  function trueIRF(w, rho, H) { return irf(w.A, trueP(w, rho), H); }
  // residual bootstrap bands for the estimated IRFs
  function bootIRF(Y, fit, order, H, R, seed) { return bandsOf(bootDraws(Y, fit, order, H, R, seed), H); }
  function bandsOf(draws, H) {
    var lo = [], hi = [];
    for (var h = 0; h <= H; h++) {
      lo.push([[0, 0], [0, 0]]); hi.push([[0, 0], [0, 0]]);
      for (var j = 0; j < 2; j++) for (var k = 0; k < 2; k++) { var v = draws.map(function (d) { return d[h][j][k]; }); lo[h][j][k] = S.quantile(v, 0.05); hi[h][j][k] = S.quantile(v, 0.95); }
    }
    return { lo: lo, hi: hi };
  }
  function bootDraws(Y, fit, order, H, R, seed) {
    var r = S.rng(seed), T = Y.length, res = [], X = [];
    for (var t = 1; t < T; t++) { var e1 = Y[t][0] - fit.c[0] - fit.A[0][0] * Y[t - 1][0] - fit.A[0][1] * Y[t - 1][1], e2 = Y[t][1] - fit.c[1] - fit.A[1][0] * Y[t - 1][0] - fit.A[1][1] * Y[t - 1][1]; res.push([e1, e2]); }
    var draws = [];
    for (var b = 0; b < R; b++) {
      var y = [Y[0].slice()];
      for (t = 1; t < T; t++) { var e = res[Math.floor(r.u() * res.length)], p = y[t - 1]; y.push([fit.c[0] + fit.A[0][0] * p[0] + fit.A[0][1] * p[1] + e[0], fit.c[1] + fit.A[1][0] * p[0] + fit.A[1][1] * p[1] + e[1]]); }
      var f = fitVAR(y); draws.push(irf(f.A, cholOrder(f.Sig, order), H));
    }
    return draws;
  }

  /* ---------- method of moments: a mean and a variance ---------- */
  function momData(kind, n, seed) {
    var r = S.rng(seed), x = [];
    for (var i = 0; i < n; i++) {
      if (kind === 'skew') { var z = r.n(), s = 0.55, m = Math.log(3) - s * s / 2; x.push(Math.exp(m + s * z)); } // log-normal with mean 3
      else x.push(3 + 1.2 * r.n());
    }
    return x;
  }
  function momG(x, mu, s2, k) { // moment functions for each observation: x - mu, (x - mu)^2 - s2, (x - mu)^3
    return x.map(function (v) { var d = v - mu, row = [d, d * d - s2]; if (k === 3) row.push(d * d * d); return row; });
  }
  function gbar(x, mu, s2, k) { var H = momG(x, mu, s2, k), g = new Array(k).fill(0); H.forEach(function (h) { for (var j = 0; j < k; j++) g[j] += h[j] / x.length; }); return g; }
  function quad(g, W) { var s = 0; for (var a = 0; a < g.length; a++) for (var b = 0; b < g.length; b++) s += g[a] * W[a][b] * g[b]; return s; }
  function Shat(x, mu, s2, k) { // centered covariance of the moment functions
    var H = momG(x, mu, s2, k), n = x.length, m = new Array(k).fill(0), Sm = [];
    H.forEach(function (h) { for (var j = 0; j < k; j++) m[j] += h[j] / n; });
    for (var a = 0; a < k; a++) { Sm.push(new Array(k).fill(0)); }
    H.forEach(function (h) { for (var a = 0; a < k; a++) for (var b = 0; b < k; b++) Sm[a][b] += (h[a] - m[a]) * (h[b] - m[b]) / n; });
    return Sm;
  }
  // minimize gbar' W gbar over (mu, s2) by Gauss-Newton (the Jacobian is known: d/dmu = [-1, -2(mean(x)-mu), -3 mean((x-mu)^2)], d/ds2 = [0, -1, 0])
  function minimize(x, k, W, start) {
    var th = start.slice();
    for (var it = 0; it < 60; it++) {
      var g = gbar(x, th[0], th[1], k), mx = 0, m2 = 0;
      x.forEach(function (v) { mx += (v - th[0]) / x.length; m2 += (v - th[0]) * (v - th[0]) / x.length; });
      var Gm = [[-1, 0], [-2 * mx, -1]]; if (k === 3) Gm.push([-3 * m2, 0]);
      var GtW = [[0, 0, 0], [0, 0, 0]], A = [[0, 0], [0, 0]], b = [0, 0];
      for (var p = 0; p < 2; p++) for (var j = 0; j < k; j++) { var s = 0; for (var l = 0; l < k; l++) s += Gm[l][p] * W[l][j]; GtW[p][j] = s; }
      for (p = 0; p < 2; p++) { for (var q = 0; q < 2; q++) { var t = 0; for (j = 0; j < k; j++) t += GtW[p][j] * Gm[j][q]; A[p][q] = t; } var u = 0; for (j = 0; j < k; j++) u += GtW[p][j] * g[j]; b[p] = u; }
      var det = A[0][0] * A[1][1] - A[0][1] * A[1][0], d0 = -(A[1][1] * b[0] - A[0][1] * b[1]) / det, d1 = -(-A[1][0] * b[0] + A[0][0] * b[1]) / det;
      var Q0 = quad(g, W), tt = 1;
      while (tt > 1e-6 && !(quad(gbar(x, th[0] + tt * d0, th[1] + tt * d1, k), W) <= Q0)) tt /= 2;
      th = [th[0] + tt * d0, th[1] + tt * d1];
      if (Math.abs(tt * d0) + Math.abs(tt * d1) < 1e-12) break;
    }
    return th;
  }
  function eye(k) { return S.eye(k); }
  function gmmA(x, k, weight) {
    var n = x.length, xb = S.mean(x), start = [xb, S.variance(x, 0)];
    var t1 = minimize(x, k, eye(k), start);
    if (weight === 'identity') { var Si = Shat(x, t1[0], t1[1], k); return { th: t1, Q: quad(gbar(x, t1[0], t1[1], k), eye(k)), J: n * quad(gbar(x, t1[0], t1[1], k), S.inv(Si)), W: eye(k) }; }
    var Sm = Shat(x, t1[0], t1[1], k), W = S.inv(Sm), t2 = minimize(x, k, W, t1), g = gbar(x, t2[0], t2[1], k), J = n * quad(g, W);
    return { th: t2, th1: t1, W: W, Q: quad(g, W), J: J, df: k - 2, p: k > 2 ? 1 - S.chi2Cdf(J, k - 2) : NaN };
  }

  /* ---------- linear IV as GMM ---------- */
  // y = beta x + u (all mean zero), x = pi . z + v; u = 0.6 v + e (endogeneity) + gamma z3 (an invalid third instrument)
  // het: the error spreads out with |z1| (heteroskedasticity), which makes the first moment condition noisy
  function ivData(p, seed) {
    var r = S.rng(seed), d = { y: [], x: [], Z: [] };
    for (var i = 0; i < p.n; i++) {
      var z = [r.n(), r.n(), r.n()], v = r.n(), sc = p.het ? 0.3 + 1.4 * z[0] * z[0] : 1;
      var u = (0.6 * v + 0.8 * r.n()) * sc + p.gamma * z[2];
      var x = p.pi[0] * z[0] + p.pi[1] * z[1] + p.pi[2] * z[2] + v;
      d.y.push(p.beta * x + u); d.x.push(x); d.Z.push(z);
    }
    return d;
  }
  function ivGMM(d, weight) {
    var n = d.y.length, L = 3, Zx = [0, 0, 0], Zy = [0, 0, 0], ZZ = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i = 0; i < n; i++) for (var a = 0; a < L; a++) { Zx[a] += d.Z[i][a] * d.x[i] / n; Zy[a] += d.Z[i][a] * d.y[i] / n; for (var b = 0; b < L; b++) ZZ[a][b] += d.Z[i][a] * d.Z[i][b] / n; }
    function est(W) { var num = 0, den = 0; for (var a = 0; a < L; a++) for (var b = 0; b < L; b++) { num += Zx[a] * W[a][b] * Zy[b]; den += Zx[a] * W[a][b] * Zx[b]; } return num / den; }
    function g(beta) { return Zy.map(function (v, a) { return v - beta * Zx[a]; }); }
    function Sh(beta) { var Sm = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (var i = 0; i < n; i++) { var u = d.y[i] - beta * d.x[i]; for (var a = 0; a < L; a++) for (var b = 0; b < L; b++) Sm[a][b] += u * u * d.Z[i][a] * d.Z[i][b] / n; } return Sm; }
    var W2 = S.inv(ZZ), b2 = est(W2), Sm = Sh(b2), We = S.inv(Sm), W = weight === 'identity' ? S.eye(3) : weight === '2sls' ? W2 : We;
    var b = est(W), gb = g(b), Q = quad(gb, W);
    // robust standard error: (G'WG)^-1 G'W S W G (G'WG)^-1 with G = -E[z x]
    var GWG = 0, GWSWG = 0, WG = [0, 0, 0];
    for (var r1 = 0; r1 < L; r1++) for (var r2 = 0; r2 < L; r2++) { GWG += Zx[r1] * W[r1][r2] * Zx[r2]; WG[r1] += W[r1][r2] * Zx[r2]; }
    for (r1 = 0; r1 < L; r1++) for (r2 = 0; r2 < L; r2++) GWSWG += WG[r1] * Sm[r1][r2] * WG[r2];
    var se = Math.sqrt(GWSWG / (GWG * GWG) / n);
    // Hansen's J at the efficient estimate (always reported with the efficient weight)
    var be = est(We), J = n * quad(g(be), We);
    var single = Zy.map(function (v, a2) { return v / Zx[a2]; }); // just-identified IV with each instrument alone
    return { b: b, se: se, Q: Q, W: W, We: We, g: g, J: J, Jp: 1 - S.chi2Cdf(J, L - 1), single: single, b2sls: b2, beff: be, Zx: Zx, Zy: Zy, n: n, sdG: Sm.map(function (r, j) { return Math.sqrt(r[j]); }) };
  }
  return { WORLDS: WORLDS, chol2: chol2, trueP: trueP, Economy: Economy, simulate: simulate, fitVAR: fitVAR, cholOrder: cholOrder, irf: irf, fevd: fevd, trueIRF: trueIRF, bootIRF: bootIRF, bootDraws: bootDraws, bandsOf: bandsOf,
    momData: momData, gbar: gbar, quad: quad, Shat: Shat, minimize: minimize, gmmA: gmmA, ivData: ivData, ivGMM: ivGMM };
});
