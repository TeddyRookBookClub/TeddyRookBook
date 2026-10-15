/* Binary Outcomes: Logit, Probit and Maximum Likelihood (/business/econometrics/binary-outcomes/): the models.
   window.Ec14Model in the browser, module.exports in Node (tested in /tmp/work_ec3/test/ec14.test.js).

   PRESETS            three stories with a yes/no outcome and one x
   gen(p, seed)       data from the latent-variable model y* = b0 + b1 x + e, y = 1[y* > 0], e logistic or normal
   separated(x, y)    true when one x value splits all the 0s from all the 1s (the MLE then does not exist)
   fitAll(x, y)       LPM (HC1), logit and probit by maximum likelihood, partial effects, LR test, fit measures
   ll / grad / hess   the logit log-likelihood surface over (b0, b1), for the climbing simulation
   newton / ascent    one Newton step (with step halving) and one gradient-ascent step                      */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('../stats.js'));
  else root.Ec14Model = factory(root.EconStats);
})(typeof window !== 'undefined' ? window : this, function (S) {
  'use strict';
  var PRESETS = {
    study: { x: 'Hours of practice', y: 'Passed the exam', lo: 0, hi: 12, mid: 5, scale: 1.4, unit: 'hour', fmtd: 1 },
    discount: { x: 'Discount offered (%)', y: 'Bought the upgrade', lo: 0, hi: 40, mid: 18, scale: 5, unit: 'point', fmtd: 0 },
    credit: { x: 'Credit score (hundreds)', y: 'Loan approved', lo: 5.2, hi: 8.2, mid: 6.6, scale: 0.3, unit: '100 points', fmtd: 2 }
  };
  function Lam(z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
  // p: preset key, steep (multiplies the true slope), link 'logit' | 'probit', n
  function truth(p) {
    var P = PRESETS[p.preset], b1 = p.steep / P.scale;
    // the probit truth uses a normal error with the same spread as the logistic one (sd pi/sqrt(3))
    return { b0: -b1 * P.mid, b1: b1, prob: function (x) { var z = -b1 * P.mid + b1 * x; return p.link === 'probit' ? S.normCdf(z / (Math.PI / Math.sqrt(3))) : Lam(z); } };
  }
  function gen(p, seed) {
    var r = S.rng(seed), P = PRESETS[p.preset], T = truth(p), xs = [], ys = [], js = [];
    for (var i = 0; i < p.n; i++) {
      var x = P.lo + (P.hi - P.lo) * (0.08 + 0.84 * r.u());
      xs.push(x); ys.push(r.u() < T.prob(x) ? 1 : 0); js.push(r.u());
    }
    return { x: xs, y: ys, j: js };
  }
  function separated(xs, ys) {
    var max0 = -Infinity, min0 = Infinity, max1 = -Infinity, min1 = Infinity;
    for (var i = 0; i < xs.length; i++) { if (ys[i]) { max1 = Math.max(max1, xs[i]); min1 = Math.min(min1, xs[i]); } else { max0 = Math.max(max0, xs[i]); min0 = Math.min(min0, xs[i]); } }
    if (!isFinite(max0) || !isFinite(max1)) return 'all';
    if (max0 < min1 || max1 < min0) return 'complete';
    if (max0 === min1 || max1 === min0) return 'quasi';
    return '';
  }
  function fitAll(xs, ys) {
    var n = xs.length, X = xs.map(function (v) { return [v]; }), out = { n: n, sep: separated(xs, ys) }, xbar = S.mean(xs), ybar = S.mean(ys);
    out.ybar = ybar; out.xbar = xbar;
    try {
      var o = S.ols(ys, X, { intercept: true, se: 'HC1' });
      var outside = 0; o.fit.forEach(function (f) { if (f < 0 || f > 1) outside++; });
      out.lpm = { b: o.b, se: o.se, ape: o.b[1], pea: o.b[1], outside: outside, pcp: pcp(o.fit, ys), r2: o.r2 };
    } catch (e) { out.lpm = null; }
    if (out.sep) return out; // logit and probit have no finite maximum
    ['logit', 'probit'].forEach(function (k) {
      try {
        var m = S[k](ys, X, { intercept: true });
        var dens = function (z) { if (k === 'logit') { var q = Lam(z); return q * (1 - q); } return S.normPdf(z); };
        var ape = 0, ps = [];
        for (var i = 0; i < n; i++) { var z = m.b[0] + m.b[1] * xs[i]; ape += dens(z) * m.b[1]; ps.push(k === 'logit' ? Lam(z) : S.normCdf(z)); }
        ape /= n;
        var LR = 2 * (m.ll - m.ll0);
        out[k] = { b: m.b, se: m.se, ll: m.ll, ll0: m.ll0, r2: m.pseudoR2, iter: m.iter, ape: ape, pea: dens(m.b[0] + m.b[1] * xbar) * m.b[1], LR: LR, LRp: 1 - S.chi2Cdf(LR, 1), pcp: pcp(ps, ys), or: Math.exp(m.b[1]), prob: m.prob };
      } catch (e) { out[k] = null; }
    });
    return out;
  }
  function pcp(ps, ys) { var c = 0; for (var i = 0; i < ys.length; i++) if ((ps[i] >= 0.5 ? 1 : 0) === ys[i]) c++; return c / ys.length; }

  /* ---------- the logit log-likelihood surface ---------- */
  function lsig(z) { return z >= 0 ? -Math.log1p(Math.exp(-z)) : z - Math.log1p(Math.exp(z)); } // ln Λ(z), stable
  function ll(b0, b1, xs, ys) {
    var s = 0;
    for (var i = 0; i < xs.length; i++) { var z = b0 + b1 * xs[i]; s += ys[i] ? lsig(z) : lsig(-z); }
    return s;
  }
  function grad(b0, b1, xs, ys) { var g0 = 0, g1 = 0; for (var i = 0; i < xs.length; i++) { var e = ys[i] - Lam(b0 + b1 * xs[i]); g0 += e; g1 += e * xs[i]; } return [g0, g1]; }
  function info(b0, b1, xs) { var a = 0, b = 0, c = 0; for (var i = 0; i < xs.length; i++) { var p = Lam(b0 + b1 * xs[i]), w = p * (1 - p); a += w; b += w * xs[i]; c += w * xs[i] * xs[i]; } return [[a, b], [b, c]]; }
  // one Newton step: theta + I^-1 g, halved until the log-likelihood rises
  function newton(b0, b1, xs, ys) {
    var g = grad(b0, b1, xs, ys), I = info(b0, b1, xs), det = I[0][0] * I[1][1] - I[0][1] * I[1][0];
    if (!(det > 1e-300)) return { b0: b0, b1: b1, halved: 0, ok: false };
    var d0 = (I[1][1] * g[0] - I[0][1] * g[1]) / det, d1 = (-I[1][0] * g[0] + I[0][0] * g[1]) / det;
    var L0 = ll(b0, b1, xs, ys), t = 1, h = 0;
    while (h < 30 && !(ll(b0 + t * d0, b1 + t * d1, xs, ys) >= L0 - 1e-12)) { t /= 2; h++; }
    return { b0: b0 + t * d0, b1: b1 + t * d1, halved: h, ok: true };
  }
  function ascent(b0, b1, xs, ys, rate) { var g = grad(b0, b1, xs, ys); return { b0: b0 + rate * g[0], b1: b1 + rate * g[1] }; }
  // a safe fixed step for gradient ascent: 1 / (largest eigenvalue of the information at the maximum)
  function safeRate(I) { var tr = I[0][0] + I[1][1], det = I[0][0] * I[1][1] - I[0][1] * I[1][0], lmax = tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - det)); return 1 / lmax; }
  return { PRESETS: PRESETS, Lam: Lam, truth: truth, gen: gen, separated: separated, fitAll: fitAll, ll: ll, grad: grad, info: info, newton: newton, ascent: ascent, safeRate: safeRate };
});
