/* Econometrics, Chapter 10 (Instrumental Variables and 2SLS): the simulated world and the estimators.
   window.EC10M in the browser, module.exports in Node. Uses EconStats (static/business/econometrics/stats.js).

   World (in the spirit of Card's college-proximity study, simulated with a known truth):
     Z ~ Bernoulli(0.5)           grew up near a four-year college
     a ~ N(0, 1)                  ability, never observed
     S = 12.5 + π Z + γ a + 1.5 v years of schooling
     y = 1.2 + 0.08 S + 0.15 a + δ Z + 0.25 u   log hourly wage; the true return to a year of school is β₁ = 0.08
   OLS of y on S:  plim = 0.08 + 0.15 γ / Var(S), with Var(S) = π²/4 + γ² + 1.5².
   IV with Z:      plim = 0.08 + δ / π   (δ ≠ 0 breaks the exclusion restriction; a weak π magnifies it).
   With one binary instrument, 2SLS equals the Wald estimator (ȳ₁ − ȳ₀)/(S̄₁ − S̄₀).                              */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require !== 'undefined' ? require('../stats.js') : null);
  var M = Math, B1 = 0.08, B2 = 0.15, SV = 1.5, SU = 0.25;

  function gen(p, seed) {
    var r = ES.rng(seed), n = p.n, Z = new Array(n), S = new Array(n), Y = new Array(n), A = new Array(n);
    for (var i = 0; i < n; i++) {
      var z = r.u() < 0.5 ? 1 : 0, a = r.n(), s = 12.5 + p.pi * z + p.gam * a + SV * r.n();
      Z[i] = z; A[i] = a; S[i] = s; Y[i] = 1.2 + B1 * s + B2 * a + p.del * z + SU * r.n();
    }
    return { Z: Z, S: S, Y: Y, A: A, n: n };
  }
  function plims(p) { var vs = p.pi * p.pi / 4 + p.gam * p.gam + SV * SV; return { ols: B1 + B2 * p.gam / vs, iv: p.pi !== 0 ? B1 + p.del / p.pi : NaN, Fexp: 1 + p.n * p.pi * p.pi * 0.25 / (p.gam * p.gam + SV * SV) }; }
  // closed-form OLS, IV (= 2SLS = Wald) and first-stage statistics, homoskedastic standard errors
  function estimate(d) {
    var n = d.n, mz = 0, ms = 0, my = 0, i;
    for (i = 0; i < n; i++) { mz += d.Z[i]; ms += d.S[i]; my += d.Y[i]; } mz /= n; ms /= n; my /= n;
    var szz = 0, sss = 0, szs = 0, szy = 0, ssy = 0;
    for (i = 0; i < n; i++) { var z = d.Z[i] - mz, s = d.S[i] - ms, y = d.Y[i] - my; szz += z * z; sss += s * s; szs += z * s; szy += z * y; ssy += s * y; }
    var bo = ssy / sss, ao = my - bo * ms, biv = szy / szs, aiv = my - biv * ms, pi = szs / szz, ssrO = 0, ssrI = 0, ssrF = 0;
    for (i = 0; i < n; i++) {
      var eo = d.Y[i] - ao - bo * d.S[i], ei = d.Y[i] - aiv - biv * d.S[i], ef = d.S[i] - (ms - pi * mz) - pi * d.Z[i];
      ssrO += eo * eo; ssrI += ei * ei; ssrF += ef * ef;
    }
    var seO = M.sqrt(ssrO / (n - 2) / sss), r2sz = szs * szs / (szz * sss), seI = M.sqrt(ssrI / (n - 2) / (sss * r2sz)), sePi = M.sqrt(ssrF / (n - 2) / szz);
    return { ols: bo, seO: seO, iv: biv, seI: seI, pi: pi, sePi: sePi, F: (pi / sePi) * (pi / sePi), a0: aiv, ao: ao };
  }
  // the four group means behind the Wald estimator
  function wald(d) {
    var s = [0, 0], y = [0, 0], c = [0, 0];
    for (var i = 0; i < d.n; i++) { var z = d.Z[i]; s[z] += d.S[i]; y[z] += d.Y[i]; c[z]++; }
    var S0 = s[0] / c[0], S1 = s[1] / c[1], Y0 = y[0] / c[0], Y1 = y[1] / c[1];
    return { S0: S0, S1: S1, Y0: Y0, Y1: Y1, n0: c[0], n1: c[1], b: (Y1 - Y0) / (S1 - S0) };
  }
  // 2SLS done by hand in two OLS steps (to show why the second-step standard errors are wrong)
  function twoStep(d) {
    var Zc = d.Z.map(function (z) { return [z]; }), fs = ES.ols(d.S, Zc, { intercept: true }), Sh = fs.fit;
    var ss = ES.ols(d.Y, Sh.map(function (v) { return [v]; }), { intercept: true });
    var b0 = ss.b[0], b1 = ss.b[1], ssr = 0, sst = 0, mh = ES.mean(Sh);
    for (var i = 0; i < d.n; i++) { var e = d.Y[i] - b0 - b1 * d.S[i]; ssr += e * e; sst += (Sh[i] - mh) * (Sh[i] - mh); }
    var seRight = M.sqrt(ssr / (d.n - 2) / sst);
    return { fs: fs, Sh: Sh, ss: ss, b0: b0, b1: b1, seNaive: ss.se[1], seRight: seRight, F: fs.t[1] * fs.t[1] };
  }

  var API = { B1: B1, B2: B2, SV: SV, SU: SU, gen: gen, plims: plims, estimate: estimate, wald: wald, twoStep: twoStep };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC10M = API;
})(typeof window !== 'undefined' ? window : this);
