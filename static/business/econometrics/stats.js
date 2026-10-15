/* Econometrics course: the shared statistics library (window.EconStats in the browser, module.exports in Node).
   No outside libraries. Tested against NumPy/SciPy in /tmp/work_stats (OLS, robust and clustered standard errors,
   2SLS, logit, probit and the t, F, chi-square and normal distributions).

   rng(seed)                      seeded random numbers: .u() uniform [0,1), .n() standard normal, .norm(mu, sd),
                                  .int(a, b) inclusive, .pick(arr), .shuffle(arr), .t(df), .chi2(df), .bern(p)
   mean, variance(x, ddof=1), sd, cov(x, y, ddof=1), corr, quantile(x, p), sum
   normal: normPdf, normCdf, normInv;  t: tCdf(t, df), tInv(p, df), tPdf;  chi2Cdf(x, k);  fCdf(x, d1, d2)
   linear algebra (arrays of rows): T, mul, inv, solve(A, b), eye(n), col(x)
   ols(y, X, opt)                 X = array of rows (add a column of 1s yourself, or opt.intercept = true);
                                  opt.se = 'classic' (default) | 'HC1' | 'cluster' with opt.cluster = group ids.
                                  Returns {b, se, t, p, vcov, resid, fit, r2, adjR2, n, k, s2, sigma, df, F, Fp, ci(level)}
   tsls(y, X, Z, opt)             two-stage least squares: X = all regressors (rows), Z = all instruments incl. exogenous
                                  regressors (rows); opt.se as in ols. Returns ols-like fields plus firstF (per endogenous
                                  column when opt.endog lists their indexes).
   logit(y, X), probit(y, X)      maximum likelihood by Newton's method: {b, se, t, p, ll, ll0, pseudoR2, iter, prob(xrow)}
   demean(x, groups)              subtract each group's mean (the fixed-effects "within" transform)
   acf(x, lags)                   sample autocorrelations 1..lags
   niceTicks(lo, hi, n)           round axis ticks: {lo, hi, step, ticks}
   fmt(v, d)                      number with d decimals and a real minus sign                                      */
(function (root) {
  'use strict';
  var M = Math;

  // ---------- random numbers ----------
  function rng(seed) {
    var a = (seed >>> 0) || 1, spare = null;
    function u() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = M.imul(a ^ a >>> 15, 1 | a); t = t + M.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    function n() {
      if (spare !== null) { var s = spare; spare = null; return s; }
      var x, y, r; do { x = 2 * u() - 1; y = 2 * u() - 1; r = x * x + y * y; } while (r >= 1 || r === 0);
      var f = M.sqrt(-2 * M.log(r) / r); spare = y * f; return x * f;
    }
    function chi2(df) { var s = 0; for (var i = 0; i < df; i++) { var z = n(); s += z * z; } return s; }
    return {
      u: u, n: n, norm: function (mu, sd) { return mu + sd * n(); }, int: function (lo, hi) { return lo + M.floor(u() * (hi - lo + 1)); },
      pick: function (arr) { return arr[M.floor(u() * arr.length)]; }, bern: function (p) { return u() < p ? 1 : 0; },
      shuffle: function (arr) { for (var i = arr.length - 1; i > 0; i--) { var j = M.floor(u() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; },
      chi2: chi2, t: function (df) { return n() / M.sqrt(chi2(df) / df); }
    };
  }

  // ---------- descriptive ----------
  function sum(x) { var s = 0; for (var i = 0; i < x.length; i++) s += x[i]; return s; }
  function mean(x) { return sum(x) / x.length; }
  function cov(x, y, ddof) { ddof = ddof === undefined ? 1 : ddof; var mx = mean(x), my = mean(y), s = 0; for (var i = 0; i < x.length; i++) s += (x[i] - mx) * (y[i] - my); return s / (x.length - ddof); }
  function variance(x, ddof) { return cov(x, x, ddof); }
  function sd(x, ddof) { return M.sqrt(variance(x, ddof)); }
  function corr(x, y) { return cov(x, y) / M.sqrt(variance(x) * variance(y)); }
  function quantile(x, p) { var s = x.slice().sort(function (a, b) { return a - b; }), h = (s.length - 1) * p, lo = M.floor(h); return lo + 1 < s.length ? s[lo] + (h - lo) * (s[lo + 1] - s[lo]) : s[lo]; }

  // ---------- special functions ----------
  function lgamma(z) { // Lanczos, g = 7
    var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return M.log(M.PI / M.abs(M.sin(M.PI * z))) - lgamma(1 - z);
    z -= 1; var x = c[0]; for (var i = 1; i < 9; i++) x += c[i] / (z + i);
    var t = z + 7.5; return 0.5 * M.log(2 * M.PI) + (z + 0.5) * M.log(t) - t + M.log(x);
  }
  function betacf(a, b, x) { // continued fraction for the incomplete beta (Numerical Recipes)
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap; if (M.abs(d) < 1e-300) d = 1e-300; d = 1 / d; var h = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (M.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (M.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (M.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (M.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
      var del = d * c; h *= del; if (M.abs(del - 1) < 3e-16) break;
    }
    return h;
  }
  function ibeta(x, a, b) { // regularized incomplete beta I_x(a, b)
    if (x <= 0) return 0; if (x >= 1) return 1;
    var bt = M.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * M.log(x) + b * M.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function igammaParts(a, x) { // regularized incomplete gamma: [P(a, x), Q(a, x)], each computed where it is accurate
    if (x <= 0) return [0, 1];
    var gln = lgamma(a), pre = M.exp(-x + a * M.log(x) - gln);
    if (x < a + 1) { var ap = a, s = 1 / a, del = s; for (var n = 0; n < 1000; n++) { ap += 1; del *= x / ap; s += del; if (M.abs(del) < M.abs(s) * 3e-16) break; } var P = s * pre; return [P, 1 - P]; }
    var b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (var i = 1; i < 1000; i++) { var an = -i * (i - a); b += 2; d = an * d + b; if (M.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (M.abs(c) < 1e-300) c = 1e-300; d = 1 / d; var dl = d * c; h *= dl; if (M.abs(dl - 1) < 3e-16) break; }
    var Q = pre * h; return [1 - Q, Q];
  }
  function igamma(a, x) { return igammaParts(a, x)[0]; }
  function erf(x) { var v = igamma(0.5, x * x); return x < 0 ? -v : v; }
  function normPdf(x) { return M.exp(-0.5 * x * x) / M.sqrt(2 * M.PI); }
  function normCdf(x) { var q = 0.5 * igammaParts(0.5, x * x / 2)[1]; return x < 0 ? q : 1 - q; }
  function normInv(p) { // Acklam's rational approximation, refined with one Halley step
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
      b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
      c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
      d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00], q, r, x;
    if (p < 0.02425) { q = M.sqrt(-2 * M.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - 0.02425) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = M.sqrt(-2 * M.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    var e = normCdf(x) - p, u = e * M.sqrt(2 * M.PI) * M.exp(x * x / 2); return x - u / (1 + x * u / 2);
  }
  function tPdf(t, df) { return M.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * M.log(df * M.PI) - (df + 1) / 2 * M.log(1 + t * t / df)); }
  function tCdf(t, df) { if (!isFinite(df) || df > 1e7) return normCdf(t); var x = df / (df + t * t), p = 0.5 * ibeta(x, df / 2, 0.5); return t > 0 ? 1 - p : p; }
  function tInv(p, df) {
    if (!isFinite(df) || df > 1e7) return normInv(p);
    var lo = -1e3, hi = 1e3; for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (tCdf(mid, df) < p) lo = mid; else hi = mid; if (hi - lo < 1e-13) break; } return (lo + hi) / 2;
  }
  function chi2Cdf(x, k) { return igamma(k / 2, x / 2); }
  function fCdf(x, d1, d2) { return x <= 0 ? 0 : ibeta(d1 * x / (d1 * x + d2), d1 / 2, d2 / 2); }

  // ---------- linear algebra (matrices are arrays of rows) ----------
  function T(A) { var r = A.length, c = A[0].length, B = []; for (var j = 0; j < c; j++) { B.push(new Array(r)); for (var i = 0; i < r; i++) B[j][i] = A[i][j]; } return B; }
  function mul(A, B) {
    var n = A.length, m = B[0].length, k = B.length, C = [];
    for (var i = 0; i < n; i++) { var row = new Array(m).fill(0), Ai = A[i]; for (var t = 0; t < k; t++) { var a = Ai[t], Bt = B[t]; if (a) for (var j = 0; j < m; j++) row[j] += a * Bt[j]; } C.push(row); }
    return C;
  }
  function eye(n) { var I = []; for (var i = 0; i < n; i++) { I.push(new Array(n).fill(0)); I[i][i] = 1; } return I; }
  function inv(A) {
    var n = A.length, a = A.map(function (r) { return r.slice(); }), I = eye(n);
    for (var c = 0; c < n; c++) {
      var p = c; for (var r = c + 1; r < n; r++) if (M.abs(a[r][c]) > M.abs(a[p][c])) p = r;
      if (M.abs(a[p][c]) < 1e-12 * (1 + M.abs(a[c][c]))) throw new Error('Singular matrix (perfect multicollinearity?)');
      var t = a[c]; a[c] = a[p]; a[p] = t; t = I[c]; I[c] = I[p]; I[p] = t;
      var d = a[c][c]; for (var j = 0; j < n; j++) { a[c][j] /= d; I[c][j] /= d; }
      for (r = 0; r < n; r++) if (r !== c) { var f = a[r][c]; if (f) for (j = 0; j < n; j++) { a[r][j] -= f * a[c][j]; I[r][j] -= f * I[c][j]; } }
    }
    return I;
  }
  function col(x) { return x.map(function (v) { return [v]; }); }
  function solve(A, b) { return mul(inv(A), col(b)).map(function (r) { return r[0]; }); }

  // ---------- regression ----------
  function design(X, intercept) { return intercept ? X.map(function (r) { return [1].concat(Array.isArray(r) ? r : [r]); }) : X.map(function (r) { return Array.isArray(r) ? r : [r]; }); }
  function finish(y, X, b, XtXi, opt, extraResid) {
    var n = y.length, k = b.length, fit = X.map(function (r) { var s = 0; for (var j = 0; j < k; j++) s += r[j] * b[j]; return s; });
    var resid = (extraResid || y.map(function (v, i) { return v - fit[i]; })), ssr = 0, ybar = mean(y), sst = 0;
    for (var i = 0; i < n; i++) { ssr += resid[i] * resid[i]; sst += (y[i] - ybar) * (y[i] - ybar); }
    var df = n - k, s2 = ssr / df, vcov, se = opt && opt.se || 'classic';
    if (se === 'HC1' || se === 'HC0' || se === 'robust') {
      var meat = []; for (var a = 0; a < k; a++) meat.push(new Array(k).fill(0));
      for (i = 0; i < n; i++) { var e2 = resid[i] * resid[i], r = X[i]; for (a = 0; a < k; a++) for (var c = 0; c < k; c++) meat[a][c] += e2 * r[a] * r[c]; }
      vcov = mul(mul(XtXi, meat), XtXi); var sc = se === 'HC0' ? 1 : n / df; vcov = vcov.map(function (row) { return row.map(function (v) { return v * sc; }); });
    } else if (se === 'cluster') {
      var g = opt.cluster, sums = {}, G = 0;
      for (i = 0; i < n; i++) { var key = g[i]; if (!sums[key]) { sums[key] = new Array(k).fill(0); G++; } for (a = 0; a < k; a++) sums[key][a] += X[i][a] * resid[i]; }
      var meat2 = []; for (a = 0; a < k; a++) meat2.push(new Array(k).fill(0));
      Object.keys(sums).forEach(function (key) { var u = sums[key]; for (var a = 0; a < k; a++) for (var c = 0; c < k; c++) meat2[a][c] += u[a] * u[c]; });
      var scc = (G / (G - 1)) * ((n - 1) / (n - k));
      vcov = mul(mul(XtXi, meat2), XtXi).map(function (row) { return row.map(function (v) { return v * scc; }); }); df = G - 1;
    } else vcov = XtXi.map(function (row) { return row.map(function (v) { return v * s2; }); });
    var seV = vcov.map(function (row, j) { return M.sqrt(row[j]); }), t = b.map(function (v, j) { return v / seV[j]; });
    var p = t.map(function (v) { return 2 * (1 - tCdf(M.abs(v), df)); });
    var r2 = sst > 0 ? 1 - ssr / sst : NaN, hasConst = X.every(function (r) { return r[0] === 1; });
    var q = hasConst ? k - 1 : k, F = q > 0 ? ((sst - ssr) / q) / s2 : NaN;
    return {
      b: b, se: seV, t: t, p: p, vcov: vcov, resid: resid, fit: fit, r2: r2, adjR2: 1 - (1 - r2) * (n - 1) / (n - k), n: n, k: k, ssr: ssr, s2: s2, sigma: M.sqrt(s2), df: df,
      F: F, Fp: q > 0 ? 1 - fCdf(F, q, n - k) : NaN,
      ci: function (level) { var z = tInv(1 - (1 - (level || 0.95)) / 2, df); return b.map(function (v, j) { return [v - z * seV[j], v + z * seV[j]]; }); }
    };
  }
  function ols(y, X, opt) {
    opt = opt || {}; X = design(X, opt.intercept);
    var Xt = T(X), XtXi = inv(mul(Xt, X)), b = mul(XtXi, mul(Xt, col(y))).map(function (r) { return r[0]; });
    return finish(y, X, b, XtXi, opt);
  }
  function tsls(y, X, Z, opt) {
    opt = opt || {}; X = design(X, opt.intercept); Z = design(Z, opt.intercept);
    var Zt = T(Z), ZtZi = inv(mul(Zt, Z)); // fitted first stages without forming the n x n projection matrix
    var Xh = mul(Z, mul(ZtZi, mul(Zt, X))), Xht = T(Xh), XhXi = inv(mul(Xht, X)), b = mul(XhXi, mul(Xht, col(y))).map(function (r) { return r[0]; });
    // residuals use the real X, standard errors use the projected X
    var resid = y.map(function (v, i) { var s = 0; for (var j = 0; j < b.length; j++) s += X[i][j] * b[j]; return v - s; });
    var out = finish(y, Xh, b, inv(mul(Xht, Xh)), opt, resid);
    out.firstF = (opt.endog || []).map(function (j) { // F test of the excluded instruments in each first stage
      var xj = X.map(function (r) { return r[j]; }), full = ols(xj, Z, {}), exo = [];
      var exoCols = []; for (var c = 0; c < X[0].length; c++) if ((opt.endog || []).indexOf(c) < 0) exoCols.push(c);
      var Zr = X.map(function (r) { return exoCols.map(function (c) { return r[c]; }); }), red = ols(xj, Zr, {});
      var qq = Z[0].length - exoCols.length; return ((red.ssr - full.ssr) / qq) / (full.ssr / (xj.length - Z[0].length));
    });
    return out;
  }
  function mle(y, X, opt, kind) {
    opt = opt || {}; X = design(X, opt.intercept); var n = y.length, k = X[0].length, b = new Array(k).fill(0), ll = -Infinity, it = 0, H;
    function linp(r) { var s = 0; for (var j = 0; j < k; j++) s += r[j] * b[j]; return s; }
    function evalAt() {
      var g = new Array(k).fill(0), h = []; for (var a = 0; a < k; a++) h.push(new Array(k).fill(0)); var L = 0;
      for (var i = 0; i < n; i++) {
        var z = linp(X[i]), p, w, sc;
        if (kind === 'logit') { p = 1 / (1 + M.exp(-z)); p = M.min(M.max(p, 1e-15), 1 - 1e-15); sc = y[i] - p; w = p * (1 - p); }
        else { p = normCdf(z); p = M.min(M.max(p, 1e-15), 1 - 1e-15); var f = normPdf(z); sc = f * (y[i] - p) / (p * (1 - p)); var lam = y[i] ? f / p : -f / (1 - p); w = lam * (lam + z); }
        L += y[i] ? M.log(p) : M.log(1 - p);
        for (a = 0; a < k; a++) { g[a] += sc * X[i][a]; for (var c = 0; c < k; c++) h[a][c] += w * X[i][a] * X[i][c]; }
      }
      return { L: L, g: g, h: h };
    }
    for (it = 1; it <= 100; it++) {
      var e = evalAt(); H = e.h; var step = solve(e.h, e.g), nb = b.map(function (v, j) { return v + step[j]; });
      var conv = M.max.apply(null, step.map(M.abs)) < 1e-10; b = nb; ll = e.L; if (conv) break;
    }
    var fin = evalAt(); ll = fin.L; var V = inv(fin.h), se = V.map(function (r, j) { return M.sqrt(r[j]); }), t = b.map(function (v, j) { return v / se[j]; });
    var ybar = mean(y), ll0 = n * (ybar * M.log(ybar) + (1 - ybar) * M.log(1 - ybar));
    return {
      b: b, se: se, t: t, p: t.map(function (v) { return 2 * (1 - normCdf(M.abs(v))); }), vcov: V, ll: ll, ll0: ll0, pseudoR2: 1 - ll / ll0, iter: it, n: n, k: k,
      prob: function (xrow) { var r = opt.intercept ? [1].concat(xrow) : xrow, s = 0; for (var j = 0; j < k; j++) s += r[j] * b[j]; return kind === 'logit' ? 1 / (1 + M.exp(-s)) : normCdf(s); }
    };
  }
  function logit(y, X, opt) { return mle(y, X, opt, 'logit'); }
  function probit(y, X, opt) { return mle(y, X, opt, 'probit'); }
  function demean(x, groups) { var s = {}, c = {}; x.forEach(function (v, i) { var g = groups[i]; s[g] = (s[g] || 0) + v; c[g] = (c[g] || 0) + 1; }); return x.map(function (v, i) { return v - s[groups[i]] / c[groups[i]]; }); }
  function acf(x, lags) { var m = mean(x), d = 0, out = []; x.forEach(function (v) { d += (v - m) * (v - m); }); for (var L = 1; L <= lags; L++) { var s = 0; for (var i = L; i < x.length; i++) s += (x[i] - m) * (x[i - L] - m); out.push(s / d); } return out; }
  function niceTicks(lo, hi, n) {
    if (!(hi > lo)) { hi = lo + 1; } var span = hi - lo, raw = span / M.max(1, n || 5), mag = M.pow(10, M.floor(M.log10(raw))), f = raw / mag;
    var step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag, a = M.floor(lo / step) * step, b = M.ceil(hi / step) * step, ticks = [];
    for (var v = a; v <= b + step / 2; v += step) ticks.push(M.abs(v) < step / 1e9 ? 0 : +v.toPrecision(12));
    return { lo: a, hi: b, step: step, ticks: ticks };
  }
  function fmt(v, d) { if (!isFinite(v)) return '—'; var s = M.abs(v).toFixed(d === undefined ? 2 : d); return (v < 0 && +s !== 0 ? '−' : '') + s; }

  var API = {
    rng: rng, sum: sum, mean: mean, variance: variance, sd: sd, cov: cov, corr: corr, quantile: quantile,
    lgamma: lgamma, ibeta: ibeta, igamma: igamma, erf: erf, normPdf: normPdf, normCdf: normCdf, normInv: normInv,
    tPdf: tPdf, tCdf: tCdf, tInv: tInv, chi2Cdf: chi2Cdf, fCdf: fCdf,
    T: T, mul: mul, inv: inv, eye: eye, col: col, solve: solve,
    ols: ols, tsls: tsls, logit: logit, probit: probit, demean: demean, acf: acf, niceTicks: niceTicks, fmt: fmt
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EconStats = API;
})(typeof window !== 'undefined' ? window : this);
