/* Econometrics, Chapter 2: the distributions and populations behind the interactives (window.EC2Model in the browser,
   module.exports in Node, where it is unit-tested). Needs EconStats (../stats.js).

   DISTS[key]: {name, discrete, params: [{k, label, min, max, step, def}], make(p) → {pdf(x), cdf(x), mean, variance,
                lo, hi (plot range), sample(r)}}. For discrete ones pdf is the probability mass at integer x.
   POPS[key]:  populations for the central limit theorem: {name, mean, sd, skew, lo, hi, pdf(x) or pmf, sample(r)}.  */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require === 'function' ? require('../stats.js') : null);
  var M = Math, LN2PI = M.log(2 * M.PI);

  function lfact(n) { return ES.lgamma(n + 1); }
  function poissonSample(r, lam) { // inverse CDF from one uniform
    var u = r.u(), k = 0, p = M.exp(-lam), F = p;
    while (u > F && k < 2000) { k++; p *= lam / k; F += p; }
    return k;
  }
  function discreteCdf(pmf, x, lo) { var s = 0, top = M.floor(x); for (var k = lo || 0; k <= top; k++) s += pmf(k); return M.min(1, s); }

  var DISTS = {
    normal: { name: 'Normal', discrete: false,
      params: [{ k: 'mu', label: 'Mean μ', min: -5, max: 5, step: 0.1, def: 0 }, { k: 'sigma', label: 'Standard deviation σ', min: 0.3, max: 3, step: 0.05, def: 1 }],
      make: function (p) {
        var mu = p.mu, s = p.sigma;
        return { pdf: function (x) { var z = (x - mu) / s; return M.exp(-0.5 * z * z) / (s * M.sqrt(2 * M.PI)); }, cdf: function (x) { return ES.normCdf((x - mu) / s); },
          mean: mu, variance: s * s, lo: mu - 4.2 * s, hi: mu + 4.2 * s, sample: function (r) { return mu + s * r.n(); } };
      } },
    uniform: { name: 'Uniform', discrete: false,
      params: [{ k: 'a', label: 'Lowest value a', min: -5, max: 5, step: 0.1, def: 0 }, { k: 'w', label: 'Width b − a', min: 0.5, max: 10, step: 0.1, def: 4 }],
      make: function (p) {
        var a = p.a, b = p.a + p.w, pad = 0.15 * p.w;
        return { pdf: function (x) { return x >= a && x <= b ? 1 / (b - a) : 0; }, cdf: function (x) { return x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a); },
          mean: (a + b) / 2, variance: (b - a) * (b - a) / 12, lo: a - pad, hi: b + pad, sample: function (r) { return a + (b - a) * r.u(); } };
      } },
    exponential: { name: 'Exponential', discrete: false,
      params: [{ k: 'lam', label: 'Rate λ', min: 0.2, max: 3, step: 0.05, def: 1 }],
      make: function (p) {
        var l = p.lam;
        return { pdf: function (x) { return x < 0 ? 0 : l * M.exp(-l * x); }, cdf: function (x) { return x <= 0 ? 0 : 1 - M.exp(-l * x); },
          mean: 1 / l, variance: 1 / (l * l), lo: 0, hi: M.log(1000) / l, sample: function (r) { return -M.log(1 - r.u()) / l; } };
      } },
    binomial: { name: 'Binomial', discrete: true,
      params: [{ k: 'n', label: 'Number of tries n', min: 1, max: 100, step: 1, def: 20 }, { k: 'p', label: 'Chance of success p', min: 0.01, max: 0.99, step: 0.01, def: 0.3 }],
      make: function (P) {
        var n = P.n, p = P.p, lp = M.log(p), lq = M.log(1 - p), m = n * p, v = n * p * (1 - p), sd = M.sqrt(v);
        function pmf(k) { k = M.round(k); if (k < 0 || k > n) return 0; return M.exp(lfact(n) - lfact(k) - lfact(n - k) + k * lp + (n - k) * lq); }
        return { pdf: pmf, cdf: function (x) { return x < 0 ? 0 : discreteCdf(pmf, M.min(x, n)); }, mean: m, variance: v,
          lo: M.max(0, M.floor(m - 5 * sd - 1)) - 0.5, hi: M.min(n, M.ceil(m + 5 * sd + 1)) + 0.5,
          sample: function (r) { var s = 0; for (var i = 0; i < n; i++) if (r.u() < p) s++; return s; } };
      } },
    poisson: { name: 'Poisson', discrete: true,
      params: [{ k: 'lam', label: 'Average count λ', min: 0.2, max: 30, step: 0.1, def: 3 }],
      make: function (p) {
        var l = p.lam;
        function pmf(k) { k = M.round(k); return k < 0 ? 0 : M.exp(-l + k * M.log(l) - lfact(k)); }
        return { pdf: pmf, cdf: function (x) { return x < 0 ? 0 : discreteCdf(pmf, x); }, mean: l, variance: l,
          lo: -0.5, hi: M.ceil(l + 5 * M.sqrt(l) + 3) + 0.5, sample: function (r) { return poissonSample(r, l); } };
      } },
    t: { name: 'Student’s t', discrete: false,
      params: [{ k: 'df', label: 'Degrees of freedom ν', min: 1, max: 60, step: 1, def: 3 }],
      make: function (p) {
        var df = p.df;
        return { pdf: function (x) { return ES.tPdf(x, df); }, cdf: function (x) { return ES.tCdf(x, df); },
          mean: df > 1 ? 0 : NaN, variance: df > 2 ? df / (df - 2) : Infinity, lo: -6, hi: 6, sample: function (r) { return r.t(df); } };
      } },
    chi2: { name: 'Chi-square', discrete: false,
      params: [{ k: 'k', label: 'Degrees of freedom k', min: 1, max: 40, step: 1, def: 4 }],
      make: function (p) {
        var k = p.k;
        function pdf(x) { if (x <= 0) return k === 1 ? 0 : (k === 2 ? 0.5 : 0); return M.exp((k / 2 - 1) * M.log(x) - x / 2 - (k / 2) * M.LN2 - ES.lgamma(k / 2)); }
        return { pdf: pdf, cdf: function (x) { return x <= 0 ? 0 : ES.chi2Cdf(x, k); }, mean: k, variance: 2 * k, lo: 0, hi: k + 6 * M.sqrt(2 * k) + 2, sample: function (r) { return r.chi2(k); } };
      } }
  };
  // P(a ≤ X ≤ b), exact
  function prob(d, discrete, a, b) {
    if (b < a) { var t = a; a = b; b = t; }
    if (discrete) return M.max(0, d.cdf(M.floor(b)) - d.cdf(M.ceil(a) - 1));
    return M.max(0, d.cdf(b) - d.cdf(a));
  }

  // ---------- populations for the central limit theorem ----------
  var LNS = 0.75, ELN = M.exp(LNS * LNS);
  var POPS = {
    expo: { name: 'waiting times (skewed)', mean: 1, sd: 1, skew: 2, lo: 0, hi: 6,
      pdf: function (x) { return x < 0 ? 0 : M.exp(-x); }, sample: function (r) { return -M.log(1 - r.u()); } },
    logn: { name: 'incomes (very skewed)', mean: M.exp(LNS * LNS / 2), sd: M.sqrt((ELN - 1) * ELN), skew: (ELN + 2) * M.sqrt(ELN - 1), lo: 0, hi: 7,
      pdf: function (x) { if (x <= 0) return 0; var z = M.log(x) / LNS; return M.exp(-0.5 * z * z) / (x * LNS * M.sqrt(2 * M.PI)); }, sample: function (r) { return M.exp(LNS * r.n()); } },
    unif: { name: 'flat (uniform)', mean: 0.5, sd: M.sqrt(1 / 12), skew: 0, lo: -0.1, hi: 1.1,
      pdf: function (x) { return x >= 0 && x <= 1 ? 1 : 0; }, sample: function (r) { return r.u(); } },
    bimodal: { name: 'two humps', mean: 0, sd: M.sqrt(0.36 + 4), skew: 0, lo: -4.5, hi: 4.5,
      pdf: function (x) { function g(m) { var z = (x - m) / 0.6; return M.exp(-0.5 * z * z) / (0.6 * M.sqrt(2 * M.PI)); } return 0.5 * g(-2) + 0.5 * g(2); },
      sample: function (r) { return (r.u() < 0.5 ? -2 : 2) + 0.6 * r.n(); } },
    bern: { name: 'yes or no, 10% yes', mean: 0.1, sd: 0.3, skew: 0.8 / 0.3, lo: -0.5, hi: 1.5, discrete: true,
      pdf: function (k) { return k === 0 ? 0.9 : k === 1 ? 0.1 : 0; }, sample: function (r) { return r.u() < 0.1 ? 1 : 0; } },
    die: { name: 'a fair die', mean: 3.5, sd: M.sqrt(35 / 12), skew: 0, lo: 0.5, hi: 6.5, discrete: true,
      pdf: function (k) { return k >= 1 && k <= 6 && k === M.round(k) ? 1 / 6 : 0; }, sample: function (r) { return 1 + M.floor(6 * r.u()); } }
  };
  function sampleMean(pop, n, r) { var s = 0; for (var i = 0; i < n; i++) s += pop.sample(r); return s / n; }
  function skewness(x) { var m = ES.mean(x), s2 = 0, s3 = 0; for (var i = 0; i < x.length; i++) { var d = x[i] - m; s2 += d * d; s3 += d * d * d; } s2 /= x.length; s3 /= x.length; return s2 > 0 ? s3 / M.pow(s2, 1.5) : 0; }

  // ---------- conditional expectation: hourly wage given years of schooling (simulated) ----------
  // log wage = 1.85 + 0.10·educ + 0.45·e, e ~ N(0, 1), so E[wage | educ] = exp(1.85 + 0.10·educ + 0.45²/2).
  var EDU = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], EW = [0.03, 0.03, 0.04, 0.05, 0.27, 0.09, 0.11, 0.05, 0.2, 0.03, 0.06, 0.02, 0.02];
  function cef(educ) { return M.exp(1.85 + 0.10 * educ + 0.45 * 0.45 / 2); }
  function wages(n, seed) {
    var r = ES.rng(seed), x = [], y = [];
    for (var i = 0; i < n; i++) {
      var u = r.u(), j = 0, cum = EW[0]; while (u > cum && j < EDU.length - 1) { j++; cum += EW[j]; }
      x.push(EDU[j]); y.push(M.exp(1.85 + 0.10 * EDU[j] + 0.45 * r.n()));
    }
    return { x: x, y: y };
  }

  var API = { DISTS: DISTS, prob: prob, POPS: POPS, sampleMean: sampleMean, skewness: skewness, poissonSample: poissonSample, EDU: EDU, cef: cef, wages: wages };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC2Model = API;
})(typeof window !== 'undefined' ? window : this);
