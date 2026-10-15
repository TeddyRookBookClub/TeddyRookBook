/* Difference-in-Differences and Event Studies (/business/econometrics/difference-in-differences/): the models.
   window.Ec12Model in the browser, module.exports in Node (tested in /tmp/work_ec3/test/ec12.test.js).
   Uses the shared statistics library (window.EconStats, static/business/econometrics/stats.js).

   gen2x2(p, seed)      two groups of units, each seen once before and once after a policy
   est2x2(d)            the four cell means, the naive comparisons, the DiD and its regression (clustered by unit)
   genEvent(p, seed)    a panel with one adoption date for the treated group and a never-treated control group
   estEvent(d)          event-study regression with unit and period fixed effects, clustered by unit, plus a joint pre-trend test
   stagger(p)           staggered adoption: TWFE, its Goodman-Bacon decomposition, the weights on each treated cell
                        (de Chaisemartin and D'Haultfoeuille) and the Callaway-Sant'Anna group-time estimates      */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('../stats.js'));
  else root.Ec12Model = factory(root.EconStats);
})(typeof window !== 'undefined' ? window : this, function (S) {
  'use strict';

  /* ---------- 1. the 2x2 ---------- */
  // p: nT, nC units; tau = true effect; delta = extra change the treated group would have had anyway (breaks parallel trends);
  // g = common change for everyone; gap = treated minus control level before; sdU = spread of unit levels; sd = noise
  function gen2x2(p, seed) {
    var r = S.rng(seed), units = [];
    for (var i = 0; i < p.nT + p.nC; i++) {
      var tr = i < p.nT ? 1 : 0, a = p.base + (tr ? p.gap : 0) + p.sdU * r.n();
      var y0 = a + p.sd * r.n(), cf = a + p.g + (tr ? p.delta : 0) + p.sd * r.n();
      units.push({ id: i, treat: tr, y0: y0, cf: cf, y1: cf + (tr ? p.tau : 0), j0: r.u(), j1: r.u() });
    }
    return units;
  }
  function est2x2(units, noReg) {
    var s = { T0: 0, T1: 0, C0: 0, C1: 0, CF: 0 }, nT = 0, nC = 0;
    units.forEach(function (u) { if (u.treat) { s.T0 += u.y0; s.T1 += u.y1; s.CF += u.cf; nT++; } else { s.C0 += u.y0; s.C1 += u.y1; nC++; } });
    var m = { T0: s.T0 / nT, T1: s.T1 / nT, C0: s.C0 / nC, C1: s.C1 / nC, CF: s.CF / nT };
    var out = { m: m, did: (m.T1 - m.T0) - (m.C1 - m.C0), ba: m.T1 - m.T0, cs: m.T1 - m.C1, cfDid: m.T0 + (m.C1 - m.C0) };
    if (noReg) return out;
    // the regression y = b0 + b1 treat + b2 post + b3 treat*post + u, two rows per unit, clustered by unit
    var y = [], X = [], g = [];
    units.forEach(function (u) { y.push(u.y0); X.push([1, u.treat, 0, 0]); g.push(u.id); y.push(u.y1); X.push([1, u.treat, 1, u.treat]); g.push(u.id); });
    out.reg = S.ols(y, X, { se: 'cluster', cluster: g });
    out.regClassic = S.ols(y, X);
    return out;
  }
  // fast DiD and its clustered standard error for Monte Carlo runs: the same numbers as est2x2's regression
  // (with two periods, the cluster-robust variance of b3 is the robust variance of a difference in mean changes)
  function quick2x2(units) {
    var dT = [], dC = [];
    units.forEach(function (u) { (u.treat ? dT : dC).push(u.y1 - u.y0); });
    var nT = dT.length, nC = dC.length, G = nT + nC, mT = S.mean(dT), mC = S.mean(dC), sT = 0, sC = 0;
    dT.forEach(function (v) { sT += (v - mT) * (v - mT); }); dC.forEach(function (v) { sC += (v - mC) * (v - mC); });
    // CR1 small-sample factor G/(G-1) * (n-1)/(n-k) with n = 2G rows and k = 4 columns
    var f = (G / (G - 1)) * ((2 * G - 1) / (2 * G - 4)), v = f * (sT / (nT * nT) + sC / (nC * nC));
    return { did: mT - mC, se: Math.sqrt(v), df: G - 1 };
  }

  /* ---------- 2. event study ---------- */
  // p: nT, nC units; pre, post = number of periods before (event times -pre..-1) and after (0..post);
  // shape: 'jump' | 'grow' | 'fade' | 'antic'; size; pretrend = extra slope per period for the treated group (whole time);
  // rho = AR(1) correlation of each unit's errors; sd; sdU
  function effectAt(shape, size, k, post) {
    if (shape === 'antic') return k >= -2 ? size * (k === -2 ? 0.35 : k === -1 ? 0.7 : 1) : 0;
    if (k < 0) return 0;
    if (shape === 'grow') return size * Math.min(1, (k + 1) / (post + 1)) * 1.6;
    if (shape === 'fade') return size * 1.6 * Math.pow(0.7, k);
    return size;
  }
  function genEvent(p, seed) {
    var r = S.rng(seed), T = p.pre + p.post + 1, rows = [], N = p.nT + p.nC, lam = [];
    for (var t = 0; t < T; t++) lam.push(0.35 * t + 0.6 * Math.sin(t * 0.9) + 0.4 * r.n());
    for (var i = 0; i < N; i++) {
      var tr = i < p.nT ? 1 : 0, a = p.sdU * r.n() + (tr ? 1 : 0), e = 0;
      for (t = 0; t < T; t++) {
        var k = t - p.pre; // event time
        e = t === 0 ? p.sd * r.n() / Math.sqrt(1 - p.rho * p.rho) : p.rho * e + p.sd * r.n(); // stationary AR(1) errors
        var eff = tr ? effectAt(p.shape, p.size, k, p.post) : 0;
        rows.push({ i: i, t: t, k: k, treat: tr, y: a + lam[t] + (tr ? p.pretrend * k : 0) + eff + e, eff: eff });
      }
    }
    // what each event-study coefficient estimates: the treated-minus-control change relative to period -1
    var truth = [], e1 = effectAt(p.shape, p.size, -1, p.post);
    for (var kk = -p.pre; kk <= p.post; kk++) truth.push(effectAt(p.shape, p.size, kk, p.post) - e1 + p.pretrend * (kk + 1));
    return { rows: rows, N: N, T: T, pre: p.pre, post: p.post, truth: truth };
  }
  // two-way demeaning of a balanced panel: x_it - xbar_i - xbar_t + xbar
  function demean2(vals, ids, ts, N, T) {
    var mi = new Array(N).fill(0), mt = new Array(T).fill(0), m = 0;
    for (var j = 0; j < vals.length; j++) { mi[ids[j]] += vals[j] / T; mt[ts[j]] += vals[j] / N; m += vals[j]; }
    m /= vals.length;
    return vals.map(function (v, j) { return v - mi[ids[j]] - mt[ts[j]] + m; });
  }
  function estEvent(d) {
    var rows = d.rows, ids = rows.map(function (r) { return r.i; }), ts = rows.map(function (r) { return r.t; });
    var ks = []; for (var k = -d.pre; k <= d.post; k++) if (k !== -1) ks.push(k);
    var y = demean2(rows.map(function (r) { return r.y; }), ids, ts, d.N, d.T);
    var cols = ks.map(function (k) { return demean2(rows.map(function (r) { return r.treat && r.k === k ? 1 : 0; }), ids, ts, d.N, d.T); });
    var X = rows.map(function (r, j) { return cols.map(function (c) { return c[j]; }); });
    var fit = S.ols(y, X, { se: 'cluster', cluster: ids });
    var out = [], pre = [];
    for (var a = 0; a < ks.length; a++) { out.push({ k: ks[a], b: fit.b[a], se: fit.se[a] }); if (ks[a] < -1) pre.push(a); }
    out.splice(d.pre - 1, 0, { k: -1, b: 0, se: 0 });
    // joint test that all the leads (k <= -2) are zero: Wald with the clustered covariance, as an F with (q, G - 1) df
    var q = pre.length, W = NaN, Fp = NaN;
    if (q > 0) {
      var bq = pre.map(function (a) { return fit.b[a]; }), V = pre.map(function (a) { return pre.map(function (c) { return fit.vcov[a][c]; }); });
      var Vi = S.inv(V), s = 0; for (var u = 0; u < q; u++) for (var v = 0; v < q; v++) s += bq[u] * Vi[u][v] * bq[v];
      W = s; Fp = 1 - S.fCdf(W / q, q, fit.df);
    }
    var tc = S.tInv(0.975, fit.df);
    out.forEach(function (o) { o.lo = o.b - tc * o.se; o.hi = o.b + tc * o.se; });
    return { coef: out, W: W, q: q, p: Fp, df: fit.df, fit: fit };
  }

  /* ---------- 3. staggered adoption ---------- */
  // p: T periods (1..T); groups: [{name, n, start}] with start = first treated period (Infinity for never treated);
  // effect(g, t, e) = the true effect for group g in period t, e = periods since adoption (0 in the first treated period).
  // Units within a group are identical apart from optional noise, so everything runs on group-by-period means.
  function stagger(p) {
    var T = p.T, G = p.groups, Ntot = 0; G.forEach(function (g) { Ntot += g.n; });
    var Y = [], Dm = [], tau = [];
    G.forEach(function (g, gi) {
      Y.push([]); Dm.push([]); tau.push([]);
      for (var t = 1; t <= T; t++) {
        var D = t >= g.start ? 1 : 0, e = D ? p.effect(gi, t, t - g.start) : 0;
        Y[gi].push(g.alpha + p.lam(t) + e + (p.noise ? p.noise(gi, t) : 0)); Dm[gi].push(D); tau[gi].push(e);
      }
    });
    // TWFE by the within transform, weighting each group by its size (equivalent to the unit-level regression)
    function dd(M) {
      var gm = M.map(function (r) { return S.mean(r); }), tm = [], all = 0;
      for (var t = 0; t < T; t++) { var s = 0; G.forEach(function (g, gi) { s += g.n * M[gi][t]; }); tm.push(s / Ntot); all += s / Ntot / T; }
      return M.map(function (r, gi) { return r.map(function (v, t) { return v - gm[gi] - tm[t] + all; }); });
    }
    var Dt = dd(Dm), sxy = 0, sxx = 0, VD = 0, att = 0, natt = 0;
    G.forEach(function (g, gi) { for (var t = 0; t < T; t++) { sxy += g.n * Dt[gi][t] * Y[gi][t]; sxx += g.n * Dt[gi][t] * Dt[gi][t]; if (Dm[gi][t]) { att += g.n * tau[gi][t]; natt += g.n; } } });
    VD = sxx / (Ntot * T);
    var twfe = sxy / sxx; att /= natt;
    // weights on each treated cell (de Chaisemartin and D'Haultfoeuille 2020): beta = sum w_gt * tau_gt
    var W = G.map(function (g, gi) { return Dm[gi].map(function (D, t) { return D ? g.n * Dt[gi][t] / sxx : null; }); });
    var negW = 0; W.forEach(function (r) { r.forEach(function (w) { if (w !== null && w < 0) negW += w; }); });
    // Goodman-Bacon (2021) decomposition into 2x2 comparisons
    function mean(gi, a, b) { var s = 0, c = 0; for (var t = a; t <= b; t++) { s += Y[gi][t - 1]; c++; } return c ? s / c : NaN; }
    var comps = [], timed = [], U = -1;
    G.forEach(function (g, gi) { if (isFinite(g.start)) timed.push(gi); else U = gi; });
    var share = G.map(function (g) { return g.n / Ntot; }), Db = G.map(function (g) { return isFinite(g.start) ? (T - g.start + 1) / T : 0; });
    timed.forEach(function (k) {
      if (U >= 0) {
        var sk = G[k].start, b = (mean(k, sk, T) - mean(k, 1, sk - 1)) - (mean(U, sk, T) - mean(U, 1, sk - 1));
        var nkU = share[k] / (share[k] + share[U]);
        var w = Math.pow(share[k] + share[U], 2) * nkU * (1 - nkU) * Db[k] * (1 - Db[k]) / VD;
        comps.push({ type: 'never', tr: k, ctrl: U, b: b, w: w });
      }
    });
    timed.forEach(function (k) {
      timed.forEach(function (l) {
        if (!(G[k].start < G[l].start)) return; // k is the earlier group
        var sk = G[k].start, sl = G[l].start, nkl = share[k] / (share[k] + share[l]);
        var bk = (mean(k, sk, sl - 1) - mean(k, 1, sk - 1)) - (mean(l, sk, sl - 1) - mean(l, 1, sk - 1));
        var bl = (mean(l, sl, T) - mean(l, sk, sl - 1)) - (mean(k, sl, T) - mean(k, sk, sl - 1));
        var wk = Math.pow((share[k] + share[l]) * (1 - Db[l]), 2) * nkl * (1 - nkl) * ((Db[k] - Db[l]) / (1 - Db[l])) * ((1 - Db[k]) / (1 - Db[l])) / VD;
        var wl = Math.pow((share[k] + share[l]) * Db[k], 2) * nkl * (1 - nkl) * (Db[l] / Db[k]) * ((Db[k] - Db[l]) / Db[k]) / VD;
        comps.push({ type: 'early', tr: k, ctrl: l, b: bk, w: wk });
        comps.push({ type: 'late', tr: l, ctrl: k, b: bl, w: wl });
      });
    });
    // Callaway and Sant'Anna (2021): ATT(g, t) against never-treated units if there are any, otherwise not-yet-treated ones,
    // always comparing with period g - 1
    var cs = [], csSum = 0, csN = 0, truthSum = 0;
    timed.forEach(function (g) {
      var sg = G[g].start;
      for (var t = sg; t <= T; t++) {
        var ctrl = [];
        if (U >= 0 && !p.notYet) ctrl = [U];
        else G.forEach(function (h, hi) { if (hi !== g && h.start > t) ctrl.push(hi); });
        if (!ctrl.length) { cs.push({ g: g, t: t, att: NaN, truth: tau[g][t - 1] }); continue; }
        var cw = 0, cdy = 0; ctrl.forEach(function (c) { cw += G[c].n; cdy += G[c].n * (Y[c][t - 1] - Y[c][sg - 2]); });
        var a = (Y[g][t - 1] - Y[g][sg - 2]) - cdy / cw;
        cs.push({ g: g, t: t, att: a, truth: tau[g][t - 1] });
        csSum += G[g].n * a; truthSum += G[g].n * tau[g][t - 1]; csN += G[g].n;
      }
    });
    return { Y: Y, D: Dm, tau: tau, twfe: twfe, att: att, W: W, negW: negW, comps: comps, VD: VD, cs: cs, csAtt: csN ? csSum / csN : NaN, csTruth: csN ? truthSum / csN : NaN, csCover: natt ? csN / natt : 0 };
  }

  return { gen2x2: gen2x2, est2x2: est2x2, quick2x2: quick2x2, effectAt: effectAt, genEvent: genEvent, demean2: demean2, estEvent: estEvent, stagger: stagger };
});
