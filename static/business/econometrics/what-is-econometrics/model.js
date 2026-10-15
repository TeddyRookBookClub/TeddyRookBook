/* Econometrics, Chapter 1: the models behind the two interactives (window.EC1Model in the browser, module.exports in
   Node, where it is unit-tested). Needs EconStats (static/business/econometrics/stats.js).

   1. The beach town. Each day d has a temperature T (°C), ice-cream cones sold S and lifeguard calls R:
        T = 22 + A·(sin(π·s) − 0.6) + (0.35·A + 0.6)·z,   s = position of the day within a 92-day summer; T kept in [10, 40]
        S = round(max(0, 120 + bS·(T − 15) + 40·e))                       e, z standard normal
        R ~ Poisson(λ),  λ = 1 + bR·(T − 10) + θ·S/100                     (so λ ≥ 1, since T ≥ 10, bR ≥ 0, θ ≥ 0)
      Heat drives both S and R; θ is the real effect of ice cream on calls (0 in the real town).
      Because E[R | S, T] = 1 + bR(T − 10) + θS/100 exactly, a regression of R on S and T is correctly specified.
   2. The tutoring class. Sixteen students, each with a score without tutoring (Y0) and with it (Y1).              */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require === 'function' ? require('../stats.js') : null);
  var M = Math, SUMMER = 92;

  function poisson(r, lam) {
    var k = 0;
    while (lam > 20) { k += poisson(r, 20); lam -= 20; }
    var L = M.exp(-lam), p = 1;
    do { k++; p *= r.u(); } while (p > L);
    return k - 1;
  }

  function poissonInv(u, lam) { // inverse CDF: one uniform per draw, so a draw moves smoothly as λ changes
    var k = 0, p = M.exp(-lam), F = p;
    while (u > F && k < 1000) { k++; p *= lam / k; F += p; }
    return k;
  }
  // P: {n, amp, bS, bR, theta}. Three separate random streams (weather, sales, calls), so moving a slider
  // changes each day smoothly instead of reshuffling the whole summer.
  function town(P, seed) {
    var rT = ES.rng(seed), rS = ES.rng(seed + 101), rR = ES.rng(seed + 202), T = [], S = [], R = [], day = [];
    for (var d = 0; d < P.n; d++) {
      var s = (d % SUMMER) / (SUMMER - 1);
      var t = 22 + P.amp * (M.sin(M.PI * s) - 0.6) + (0.35 * P.amp + 0.6) * rT.n();
      t = M.min(40, M.max(10, t));
      var cones = M.round(M.max(0, 120 + P.bS * (t - 15) + 40 * rS.n()));
      var lam = 1 + P.bR * (t - 10) + P.theta * cones / 100;
      T.push(+t.toFixed(1)); S.push(cones); R.push(poissonInv(rR.u(), lam)); day.push(d);
    }
    return { T: T, S: S, R: R, day: day };
  }

  function safeCorr(x, y) { if (x.length < 3) return NaN; var vx = ES.variance(x), vy = ES.variance(y); return vx > 0 && vy > 0 ? ES.cov(x, y) / M.sqrt(vx * vy) : NaN; }
  function slope(y, x) { // simple OLS of y on x: {b0, b1, se1}
    var n = x.length; if (n < 3) return null;
    var mx = ES.mean(x), my = ES.mean(y), sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) { sxx += (x[i] - mx) * (x[i] - mx); sxy += (x[i] - mx) * (y[i] - my); }
    if (!(sxx > 0)) return null;
    var b1 = sxy / sxx, b0 = my - b1 * mx, ssr = 0;
    for (i = 0; i < n; i++) { var e = y[i] - b0 - b1 * x[i]; ssr += e * e; }
    return { b0: b0, b1: b1, se1: M.sqrt(ssr / (n - 2) / sxx) };
  }

  // Everything the readouts need. band = [lo, hi] temperatures for "hold fixed".
  function analyze(D, k, band) {
    k = k === undefined ? D.S.length : k;
    var S = D.S.slice(0, k), R = D.R.slice(0, k), T = D.T.slice(0, k), out = { n: k };
    out.r = safeCorr(S, R);
    out.naive = slope(R, S);
    var bs = [], br = [];
    if (band) for (var i = 0; i < k; i++) if (T[i] >= band[0] && T[i] <= band[1]) { bs.push(S[i]); br.push(R[i]); }
    out.bandN = bs.length; out.bandR = safeCorr(bs, br); out.band = slope(br, bs);
    out.ctrl = null;
    if (k >= 5 && ES.variance(T) > 0) {
      try {
        var X = S.map(function (s, j) { return [1, s, T[j]]; }), f = ES.ols(R, X);
        out.ctrl = { b: f.b, se: f.se, t: f.t };
        // Frisch–Waugh: residualize S and R on T; the slope of those residuals equals the coefficient on S
        var sT = slope(S, T), rT = slope(R, T);
        out.resS = S.map(function (s, j) { return s - sT.b0 - sT.b1 * T[j]; });
        out.resR = R.map(function (v, j) { return v - rT.b0 - rT.b1 * T[j]; });
      } catch (e) { out.ctrl = null; }
    }
    return out;
  }

  // ---------- the tutoring class (potential outcomes) ----------
  var NAMES = ['Ava', 'Ben', 'Cara', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ivan', 'Jo', 'Kai', 'Lena', 'Max', 'Nia', 'Omar', 'Pia'];
  function makeClass(seed) {
    var r = ES.rng(seed), kids = [];
    for (var i = 0; i < NAMES.length; i++) {
      var y0 = M.round(M.min(95, M.max(45, 70 + 11 * r.n())));
      var gain = M.round(M.max(0, 3 + 0.4 * (80 - y0) + 2 * r.n()));   // students who are behind gain more
      kids.push({ name: NAMES[i], y0: y0, y1: M.min(100, y0 + gain) });
    }
    return kids;
  }
  function ate(K) { return ES.mean(K.map(function (k) { return k.y1 - k.y0; })); }
  function rankAssign(K, key) { // the 8 students with the highest key sign up
    var idx = K.map(function (k, i) { return i; }).sort(function (a, b) { return key(K[b]) - key(K[a]) || a - b; }), D = K.map(function () { return 0; });
    for (var i = 0; i < K.length / 2; i++) D[idx[i]] = 1;
    return D;
  }
  function assign(K, mode, r) {
    if (mode === 'gain') return rankAssign(K, function (k) { return k.y1 - k.y0; });
    if (mode === 'keen') return rankAssign(K, function (k) { return k.y0; });
    var D;
    do { D = K.map(function () { return r.bern(0.5); }); } while (ES.sum(D) === 0 || ES.sum(D) === K.length);
    return D;
  }
  function estimates(K, D) {
    var y1t = [], y0c = [], y0t = [], gt = [];
    K.forEach(function (k, i) { if (D[i]) { y1t.push(k.y1); y0t.push(k.y0); gt.push(k.y1 - k.y0); } else y0c.push(k.y0); });
    var naive = ES.mean(y1t) - ES.mean(y0c), att = ES.mean(gt), sel = ES.mean(y0t) - ES.mean(y0c);
    return { naive: naive, att: att, sel: sel, ate: ate(K), meanT: ES.mean(y1t), meanC: ES.mean(y0c), nT: y1t.length };
  }
  function flips(K, k, r) { var out = []; for (var i = 0; i < k; i++) out.push(estimates(K, assign(K, 'coin', r)).naive); return out; }

  var API = { SUMMER: SUMMER, poisson: poisson, poissonInv: poissonInv, town: town, analyze: analyze, slope: slope, corr: safeCorr, makeClass: makeClass, ate: ate, assign: assign, estimates: estimates, flips: flips };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC1Model = API;
})(typeof window !== 'undefined' ? window : this);
