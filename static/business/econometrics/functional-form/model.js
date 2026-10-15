/* Econometrics, Chapter 7 (Logs, Dummies and Interactions): simulated data sets with a known functional form,
   the four log/level models, the quadratic experience profile, and dummy variables with interactions.
   window.EC7M in the browser, module.exports in Node. Uses EconStats (static/business/econometrics/stats.js). */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require !== 'undefined' ? require('../stats.js') : null);
  var M = Math, LN2 = M.log(2);

  // form: 'll' level-level, 'lg' log-level (log y on x), 'gl' level-log (y on log x), 'gg' log-log
  var FORMS = ['ll', 'lg', 'gl', 'gg'];
  var SETS = {
    taxi: { form: 'll', n: 120, eff: [1, 4, 2.5], gen: function (r, e) { var x = 0.5 + 19.5 * r.u(); return [x, M.max(0.5, 3.5 + e * x + 1.6 * r.n())]; }, truth: function (x, e) { return 3.5 + e * x; } },
    wage: { form: 'lg', n: 120, eff: [0.02, 0.3, 0.08], gen: function (r, e) { var x = 8 + r.int(0, 12); return [x, 20 * M.exp(e * (x - 12) + 0.3 * r.n())]; }, truth: function (x, e) { return 20 * M.exp(e * (x - 12)); } },
    ads: { form: 'gl', n: 120, eff: [10, 80, 40], gen: function (r, e) { var x = M.exp(M.log(100) * r.u()); return [x, 150 + e * M.log(x) + 15 * r.n()]; }, truth: function (x, e) { return 150 + e * M.log(x); } },
    demand: { form: 'gg', n: 120, eff: [-3, -0.3, -1.4], gen: function (r, e) { var x = M.exp(M.log(6) + M.log(5) * r.u()); return [x, 300 * M.pow(x / 12, e) * M.exp(0.2 * r.n())]; }, truth: function (x, e) { return 300 * M.pow(x / 12, e); } }
  };
  function genSet(key, eff, seed) {
    var D = SETS[key], r = ES.rng(seed), x = [], y = [];
    for (var i = 0; i < D.n; i++) { var p = D.gen(r, eff); x.push(p[0]); y.push(p[1]); }
    return { x: x, y: y, form: D.form, eff: eff, key: key };
  }
  // a mystery: one of the four forms with random parameters, x uniform on [1, 20]
  function genMystery(seed) {
    var r = ES.rng(seed), form = FORMS[r.int(0, 3)], x = [], y = [], a;
    if (form === 'll') a = 2 + 4 * r.u(); else if (form === 'lg') a = 0.07 + 0.08 * r.u(); else if (form === 'gl') a = 15 + 15 * r.u(); else a = -(0.6 + 0.8 * r.u());
    for (var i = 0; i < 120; i++) {
      var xi = 1 + 19 * r.u(), yi;
      if (form === 'll') yi = 30 + a * xi + 7 * r.n();
      else if (form === 'lg') yi = 20 * M.exp(a * (xi - 10) + 0.15 * r.n());
      else if (form === 'gl') yi = 40 + a * M.log(xi) + 4 * r.n();
      else yi = 30 * M.pow(xi / 5, a) * M.exp(0.15 * r.n());
      x.push(xi); y.push(M.max(0.3, yi));
    }
    return { x: x, y: y, form: form, eff: a, key: 'mystery' };
  }
  function tx(form, v) { return form === 'gl' || form === 'gg' ? M.log(v) : v; }
  function ty(form, v) { return form === 'lg' || form === 'gg' ? M.log(v) : v; }
  function logY(form) { return form === 'lg' || form === 'gg'; }
  function logX(form) { return form === 'gl' || form === 'gg'; }
  function fit(d, form) {
    var X = d.x.map(function (v) { return [tx(form, v)]; }), Y = d.y.map(function (v) { return ty(form, v); });
    var o = ES.ols(Y, X, { intercept: true }), a = o.b[0], b = o.b[1];
    var pred = function (x) { var v = a + b * tx(form, x); return logY(form) ? M.exp(v) : v; };
    var yh = d.x.map(pred), r2lev = M.pow(ES.corr(d.y, yh), 2);
    return { form: form, a: a, b: b, se: o.se[1], r2: o.r2, r2lev: r2lev, pred: pred, resid: o.resid, ols: o };
  }
  function fitAll(d) { var out = {}; FORMS.forEach(function (f) { out[f] = fit(d, f); }); return out; }
  // what a one-unit or one-percent change means in each model
  function effects(form, b) {
    if (form === 'll') return { unit: b };
    if (form === 'lg') return { approxPct: 100 * b, exactPct: 100 * (M.exp(b) - 1) };
    if (form === 'gl') return { perPct: b / 100, perDouble: b * LN2 };
    return { elasticity: b, exactPctFor10: 100 * (M.pow(1.1, b) - 1) };
  }
  // residual pattern: mean residual in bins of x (sorted), for the residual strip
  function binMeans(x, res, nb) {
    var idx = x.map(function (v, i) { return i; }).sort(function (i, j) { return x[i] - x[j]; }), out = [], per = M.ceil(idx.length / nb);
    for (var k = 0; k < nb; k++) { var s = 0, sx = 0, c = 0; for (var j = k * per; j < M.min(idx.length, (k + 1) * per); j++) { s += res[idx[j]]; sx += x[idx[j]]; c++; } if (c) out.push([sx / c, s / c]); }
    return out;
  }

  // experience profile: wage = 14 + G (2 e/P − e²/P²) + 3.5 u, e ~ U(0, 40); peak at P with gain G
  function genExper(P, seed, n) {
    var r = ES.rng(seed), G = 14, e = [], w = []; n = n || 150;
    for (var i = 0; i < n; i++) { var x = 40 * r.u(); e.push(x); w.push(14 + G * (2 * x / P - x * x / (P * P)) + 3.5 * r.n()); }
    return { e: e, w: w, P: P, G: G };
  }
  function fitQuad(d) {
    var q = ES.ols(d.w, d.e.map(function (v) { return [v, v * v]; }), { intercept: true }), lin = ES.ols(d.w, d.e.map(function (v) { return [v]; }), { intercept: true });
    var b1 = q.b[1], b2 = q.b[2];
    return { q: q, lin: lin, b0: q.b[0], b1: b1, b2: b2, turn: b2 !== 0 ? -b1 / (2 * b2) : NaN, slopeAt: function (x) { return b1 + 2 * b2 * x; }, at: function (x) { return q.b[0] + b1 * x + b2 * x * x; } };
  }

  // dummies and interactions: wage = 15 + 0.40 exper + d0 union + d1 union*exper + 2.5 u
  function genUnion(d0, d1, seed, n) {
    var r = ES.rng(seed), e = [], g = [], w = []; n = n || 140;
    for (var i = 0; i < n; i++) { var x = 30 * r.u(), un = i % 2; e.push(x); g.push(un); w.push(15 + 0.4 * x + d0 * un + d1 * un * x + 2.5 * r.n()); }
    return { e: e, g: g, w: w, n: n };
  }
  function fitUnion(d, trap) {
    var pooled = ES.ols(d.w, d.e.map(function (v) { return [v]; }), { intercept: true });
    var dummy = ES.ols(d.w, d.e.map(function (v, i) { return [v, d.g[i]]; }), { intercept: true });
    var inter = ES.ols(d.w, d.e.map(function (v, i) { return [v, d.g[i], d.g[i] * v]; }), { intercept: true });
    // Chow test: pooled (restricted) against separate lines (= the fully interacted model)
    var k1 = 2, chow = ((pooled.ssr - inter.ssr) / k1) / (inter.ssr / (d.n - 2 * k1)), chowP = 1 - ES.fCdf(chow, k1, d.n - 2 * k1);
    // the same F computed from two separate regressions
    var sep = [0, 1].map(function (gv) { var ix = []; d.g.forEach(function (v, i) { if (v === gv) ix.push(i); }); return ES.ols(ix.map(function (i) { return d.w[i]; }), ix.map(function (i) { return [d.e[i]]; }), { intercept: true }); });
    var chow2 = ((pooled.ssr - sep[0].ssr - sep[1].ssr) / k1) / ((sep[0].ssr + sep[1].ssr) / (d.n - 2 * k1));
    var trapErr = null;
    if (trap) { try { ES.ols(d.w, d.e.map(function (v, i) { return [v, d.g[i], 1 - d.g[i]]; }), { intercept: true }); } catch (err) { trapErr = err.message; } }
    return { pooled: pooled, dummy: dummy, inter: inter, chow: chow, chowP: chowP, chow2: chow2, sep: sep, trapErr: trapErr, cross: inter.b[3] !== 0 ? -inter.b[2] / inter.b[3] : NaN };
  }

  var API = { FORMS: FORMS, SETS: SETS, genSet: genSet, genMystery: genMystery, tx: tx, ty: ty, logX: logX, logY: logY, fit: fit, fitAll: fitAll, effects: effects, binMeans: binMeans,
    genExper: genExper, fitQuad: fitQuad, genUnion: genUnion, fitUnion: fitUnion };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC7M = API;
})(typeof window !== 'undefined' ? window : this);
