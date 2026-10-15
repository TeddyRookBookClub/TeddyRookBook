/* Regression Discontinuity (/business/econometrics/regression-discontinuity/): the models.
   window.Ec13Model in the browser, module.exports in Node (tested in /tmp/work_ec3/test/ec13.test.js).

   Running variable: an exam score s in [0, 100] with the cutoff at c = 50; x = s - c.
   gen(p, seed)            a sample: score, outcome, a placebo covariate, who manipulated
   locpoly(x, y, h, p, k)  local polynomial jump at x = 0: separate weighted fits on each side, HC1 standard error
   fitCurve(...)           the fitted curve on one side, for drawing
   mccrary(x, b, h)        McCrary's (2008) density test: log difference of the density at the cutoff
   fuzzyGen / fuzzyEst     fuzzy RD: take-up jumps at the cutoff; local linear IV (Wald) estimate               */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('../stats.js'));
  else root.Ec13Model = factory(root.EconStats);
})(typeof window !== 'undefined' ? window : this, function (S) {
  'use strict';
  var CUT = 50;
  // the untreated outcome as a function of x = score - 50 (next year's score)
  var SHAPES = {
    gentle: function (x) { return 55 + 0.45 * x + 0.003 * x * x; },
    scurve: function (x) { return 55 + 0.3 * x + 6 * Math.tanh(x / 9); },
    wiggly: function (x) { return 55 + 0.3 * x + 7 * Math.sin(x / 8); },
    kink: function (x) { return 55 + 0.15 * x + (x > 0 ? 0.75 * x : 0); },
    flat: function (x) { return 55 + 0.3 * x; }
  };
  function gen(p, seed) {
    var r = S.rng(seed), f = SHAPES[p.shape] || SHAPES.scurve, out = [];
    for (var i = 0; i < p.n; i++) {
      var s; do { s = 50 + 16 * r.n(); } while (s < 0 || s > 100);
      var u = r.n(), man = false;
      // manipulation: some students just below the cutoff find a way over it; more motivated ones (high u) more often
      if (p.manip > 0 && s >= CUT - 6 && s < CUT && r.u() < Math.min(1, 2 * p.manip * S.normCdf(u))) { s = CUT + 3 * r.u(); man = true; }
      var x = s - CUT, D = x >= 0 ? 1 : 0;
      var y0 = f(x) + 4 * u + p.sd * r.n();
      out.push({ s: s, x: x, D: D, y: y0 + p.tau * D, cov: 6 + 2.5 * u + 0.03 * x + r.n(), man: man, u: u });
    }
    return out;
  }
  function kern(t, k) { var a = Math.abs(t); return a >= 1 ? 0 : k === 'uni' ? 1 : 1 - a; }
  // weighted least squares of y on 1, x, ..., x^p using rows with positive weight; returns {b, meat-ready info}
  function wls(xs, ys, ws, p) {
    var k = p + 1, A = [], v = new Array(k).fill(0), n = 0, i, a, c;
    for (a = 0; a < k; a++) A.push(new Array(k).fill(0));
    var pow = new Array(k);
    for (i = 0; i < xs.length; i++) {
      var w = ws[i]; if (!(w > 0)) continue; n++;
      pow[0] = 1; for (a = 1; a < k; a++) pow[a] = pow[a - 1] * xs[i];
      for (a = 0; a < k; a++) { v[a] += w * pow[a] * ys[i]; for (c = 0; c < k; c++) A[a][c] += w * pow[a] * pow[c]; }
    }
    if (n <= k) return null;
    var Ai; try { Ai = S.inv(A); } catch (e) { return null; }
    var b = Ai.map(function (row) { var s = 0; for (var j = 0; j < k; j++) s += row[j] * v[j]; return s; });
    // sandwich: Ai * sum w^2 e^2 z z' * Ai
    var Mt = []; for (a = 0; a < k; a++) Mt.push(new Array(k).fill(0));
    for (i = 0; i < xs.length; i++) {
      var w2 = ws[i]; if (!(w2 > 0)) continue;
      pow[0] = 1; for (a = 1; a < k; a++) pow[a] = pow[a - 1] * xs[i];
      var fit = 0; for (a = 0; a < k; a++) fit += b[a] * pow[a];
      var e = ys[i] - fit, q = w2 * w2 * e * e;
      for (a = 0; a < k; a++) for (c = 0; c < k; c++) Mt[a][c] += q * pow[a] * pow[c];
    }
    var V = S.mul(S.mul(Ai, Mt), Ai);
    return { b: b, V: V, n: n, k: k };
  }
  // the jump at x = 0: fits on each side within bandwidth h; scale x by h for numerical stability
  function locpoly(xs, ys, h, p, k) {
    var lx = [], ly = [], lw = [], rx = [], ry = [], rw = [];
    for (var i = 0; i < xs.length; i++) {
      var w = kern(xs[i] / h, k); if (!(w > 0)) continue;
      if (xs[i] >= 0) { rx.push(xs[i] / h); ry.push(ys[i]); rw.push(w); } else { lx.push(xs[i] / h); ly.push(ys[i]); lw.push(w); }
    }
    var L = wls(lx, ly, lw, p), R = wls(rx, ry, rw, p);
    if (!L || !R) return null;
    var n = L.n + R.n, kk = L.k + R.k, f = n / (n - kk); // HC1, as in the pooled regression with all terms interacted
    var se = Math.sqrt(f * (L.V[0][0] + R.V[0][0]));
    return { tau: R.b[0] - L.b[0], se: se, nL: L.n, nR: R.n, bl: L.b, br: R.b, h: h, p: p, aL: L.b[0], aR: R.b[0] };
  }
  function curveAt(b, h, x) { var t = x / h, s = 0, pw = 1; for (var j = 0; j < b.length; j++) { s += b[j] * pw; pw *= t; } return s; }
  // McCrary (2008): histogram with bin width b (bins never straddle 0), local linear fits of the normalized counts on each side
  // with a triangular kernel and bandwidth h; theta = ln f+ - ln f-, se = sqrt((1/(n h)) (24/5) (1/f+ + 1/f-))
  function mccrary(xs, b, h, lo, hi) {
    var n = xs.length, jlo = Math.floor(lo / b), jhi = Math.ceil(hi / b) - 1, bins = [];
    for (var j = jlo; j <= jhi; j++) bins.push({ mid: (j + 0.5) * b, c: 0 });
    xs.forEach(function (x) { var j = Math.floor(x / b) - jlo; if (j >= 0 && j < bins.length) bins[j].c++; });
    bins.forEach(function (bn) { bn.y = bn.c / (n * b); });
    function side(sign) {
      var X = [], Y = [], W = [];
      bins.forEach(function (bn) { if ((sign > 0 ? bn.mid > 0 : bn.mid < 0)) { var w = kern(bn.mid / h, 'tri'); if (w > 0) { X.push(bn.mid / h); Y.push(bn.y); W.push(w); } } });
      return wls(X, Y, W, 1);
    }
    var R = side(1), L = side(-1);
    if (!R || !L || R.b[0] <= 0 || L.b[0] <= 0) return { bins: bins, theta: NaN, se: NaN, z: NaN, p: NaN };
    var fp = R.b[0], fm = L.b[0], theta = Math.log(fp) - Math.log(fm), se = Math.sqrt((1 / (n * h)) * (24 / 5) * (1 / fp + 1 / fm)), z = theta / se;
    return { bins: bins, fp: fp, fm: fm, bR: R.b, bL: L.b, theta: theta, se: se, z: z, p: 2 * (1 - S.normCdf(Math.abs(z))), h: h };
  }

  /* ---------- fuzzy RD ---------- */
  // p: n, p0 = take-up just below the cutoff, jump = rise in take-up at the cutoff, tau = effect of taking it up, sd
  function takeup(x, p) { return Math.min(0.97, Math.max(0.02, p.p0 + 0.002 * x + (x >= 0 ? p.jump : 0))); }
  function fuzzyGen(p, seed) {
    var r = S.rng(seed), out = [], g = 1.0, sc = Math.sqrt(1 + g * g), f = SHAPES.gentle;
    for (var i = 0; i < p.n; i++) {
      var s; do { s = 50 + 16 * r.n(); } while (s < 0 || s > 100);
      var x = s - CUT, u = r.n(), pr = takeup(x, p);
      // the more motivated (high u) take the program up more often, but the take-up rate at each score is exactly pr
      var D = sc * S.normInv(pr) + g * u + r.n() > 0 ? 1 : 0;
      out.push({ x: x, A: x >= 0 ? 1 : 0, D: D, y: f(x) + p.tau * D + 4 * u + p.sd * r.n() });
    }
    return out;
  }
  // local linear IV in the window |x| < h with triangular weights: y on [1, D, x, x*A] instrumented by [1, A, x, x*A]
  function fuzzyEst(d, h) {
    var Z = [], X = [], Y = [], xs = [], ys = [], ds = [];
    d.forEach(function (o) {
      var w = kern(o.x / h, 'tri'); if (!(w > 0)) return; var sw = Math.sqrt(w), t = o.x / h;
      Z.push([sw, sw * o.A, sw * t, sw * t * o.A]); X.push([sw, sw * o.D, sw * t, sw * t * o.A]); Y.push(sw * o.y);
      xs.push(o.x); ys.push(o.y); ds.push(o.D);
    });
    var n = Y.length, k = 4; if (n < 20) return null;
    var ZX = S.mul(S.T(Z), X), ZY = S.mul(S.T(Z), S.col(Y)), ZXi;
    try { ZXi = S.inv(ZX); } catch (e) { return null; }
    var b = S.mul(ZXi, ZY).map(function (r) { return r[0]; });
    var meat = []; for (var a = 0; a < k; a++) meat.push(new Array(k).fill(0));
    for (var i = 0; i < n; i++) { var e = Y[i]; for (a = 0; a < k; a++) e -= X[i][a] * b[a]; for (a = 0; a < k; a++) for (var c = 0; c < k; c++) meat[a][c] += e * e * Z[i][a] * Z[i][c]; }
    var V = S.mul(S.mul(ZXi, meat), S.T(ZXi)), se = Math.sqrt(V[1][1] * n / (n - k));
    var rf = locpoly(xs, ys, h, 1, 'tri'), fs = locpoly(xs, ds, h, 1, 'tri');
    // the naive comparison: everyone who took the program up vs everyone who didn't, in the same window
    var a1 = [], a0 = []; d.forEach(function (o) { if (Math.abs(o.x) < h) (o.D ? a1 : a0).push(o.y); });
    return { tau: b[1], se: se, n: n, rf: rf, fs: fs, naive: a1.length && a0.length ? S.mean(a1) - S.mean(a0) : NaN };
  }
  return { CUT: CUT, SHAPES: SHAPES, gen: gen, kern: kern, wls: wls, locpoly: locpoly, curveAt: curveAt, mccrary: mccrary, takeup: takeup, fuzzyGen: fuzzyGen, fuzzyEst: fuzzyEst };
});
