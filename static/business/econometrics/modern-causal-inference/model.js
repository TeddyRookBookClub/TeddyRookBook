/* Modern Causal Inference (/business/econometrics/modern-causal-inference/): the models.
   window.Ec17Model in the browser, module.exports in Node (tested in /tmp/work_ec3/test/ec17.test.js).

   DAGs:       PRESETS; paths(g) all paths between D and Y; blocked(g, path, Z); backdoorOK(g, Z); adjustmentSets(g);
               totalEffect(g); simulateSEM(g, n, seed); plim(g, Z) the large-sample regression coefficient on D
   Matching:   matchData(p, seed); matchEst(d): propensity scores, nearest-neighbor matching (ATT), IPW, balance
   Synthetic:  synthData(p, seed); synthFit(Y, j, T0, w0, iters) weights on the simplex; placebos
   ML:         lasso(X, y, lam, opt) coordinate descent; lassoPath; dmlData(p, seed); dml / naiveSelect     */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('../stats.js'));
  else root.Ec17Model = factory(root.EconStats);
})(typeof window !== 'undefined' ? window : this, function (S) {
  'use strict';

  /* ---------- 1. causal diagrams ---------- */
  // a graph: nodes [{id, label, obs, x, y}], edges [{from, to, b}] (b = coefficient in the linear simulation)
  var PRESETS = {
    confound: { name: 'Confounder', nodes: [['D', 'Training', 1, 0.2, 0.62], ['Y', 'Wage', 1, 0.8, 0.62], ['X', 'Motivation', 1, 0.5, 0.2]], edges: [['X', 'D', 0.8], ['X', 'Y', 0.8], ['D', 'Y', 1]] },
    mediator: { name: 'Mediator', nodes: [['D', 'Training', 1, 0.15, 0.6], ['Y', 'Wage', 1, 0.85, 0.6], ['M', 'Skills', 1, 0.5, 0.25]], edges: [['D', 'M', 0.8], ['M', 'Y', 0.8], ['D', 'Y', 0.5]] },
    collider: { name: 'Collider', nodes: [['D', 'Training', 1, 0.2, 0.35], ['Y', 'Wage', 1, 0.8, 0.35], ['C', 'Promoted', 1, 0.5, 0.78]], edges: [['D', 'C', 0.8], ['Y', 'C', 0.8], ['D', 'Y', 1]] },
    mbias: { name: 'M-bias', nodes: [['D', 'Training', 1, 0.15, 0.78], ['Y', 'Wage', 1, 0.85, 0.78], ['C', 'Survey answer', 1, 0.5, 0.45], ['U1', 'Family support', 0, 0.2, 0.15], ['U2', 'Local economy', 0, 0.8, 0.15]], edges: [['U1', 'D', 0.8], ['U1', 'C', 0.8], ['U2', 'C', 0.8], ['U2', 'Y', 0.8], ['D', 'Y', 1]] },
    instrument: { name: 'Hidden confounder', nodes: [['D', 'Training', 1, 0.35, 0.65], ['Y', 'Wage', 1, 0.85, 0.65], ['U', 'Ability', 0, 0.6, 0.2], ['Z', 'Lottery', 1, 0.1, 0.25]], edges: [['Z', 'D', 0.8], ['U', 'D', 0.8], ['U', 'Y', 0.8], ['D', 'Y', 1]] },
    build: { name: 'Build your own', nodes: [['D', 'Treatment', 1, 0.2, 0.62], ['Y', 'Outcome', 1, 0.8, 0.62], ['A', 'A', 1, 0.2, 0.18], ['B', 'B', 1, 0.5, 0.88], ['E', 'E', 1, 0.8, 0.18]], edges: [['D', 'Y', 1]] }
  };
  function makeGraph(key) {
    var p = PRESETS[key];
    return { key: key, nodes: p.nodes.map(function (n) { return { id: n[0], label: n[1], obs: !!n[2], x: n[3], y: n[4] }; }), edges: p.edges.map(function (e) { return { from: e[0], to: e[1], b: e[2] }; }) };
  }
  function ids(g) { return g.nodes.map(function (n) { return n.id; }); }
  function has(g, a, b) { return g.edges.some(function (e) { return e.from === a && e.to === b; }); }
  function children(g, a) { return g.edges.filter(function (e) { return e.from === a; }).map(function (e) { return e.to; }); }
  function descendants(g, a) { var out = {}, st = [a]; while (st.length) { var v = st.pop(); children(g, v).forEach(function (c) { if (!out[c]) { out[c] = 1; st.push(c); } }); } return out; }
  function acyclicWith(g, a, b) { return a !== b && !descendants(g, b)[a]; } // adding a -> b keeps the graph acyclic
  function topo(g) { var indeg = {}, order = [], q = []; ids(g).forEach(function (v) { indeg[v] = 0; }); g.edges.forEach(function (e) { indeg[e.to]++; }); ids(g).forEach(function (v) { if (!indeg[v]) q.push(v); }); while (q.length) { var v = q.shift(); order.push(v); children(g, v).forEach(function (c) { if (!--indeg[c]) q.push(c); }); } return order; }
  // every simple path between D and Y in the skeleton; each step records whether the arrow points forward along the path
  function paths(g) {
    var out = [];
    (function walk(v, seen, steps) {
      if (v === 'Y') { out.push(steps.slice()); return; }
      g.edges.forEach(function (e) {
        var nxt = e.from === v ? e.to : e.to === v ? e.from : null; if (!nxt || seen[nxt]) return;
        seen[nxt] = 1; steps.push({ from: v, to: nxt, fwd: e.from === v }); walk(nxt, seen, steps); steps.pop(); seen[nxt] = 0;
      });
    })('D', { D: 1 }, []);
    return out.map(function (st) {
      var nodesOn = ['D'].concat(st.map(function (s) { return s.to; }));
      return { steps: st, nodes: nodesOn, causal: st.every(function (s) { return s.fwd; }), backdoor: !st[0].fwd };
    });
  }
  function blocked(g, path, Z) {
    for (var i = 1; i < path.nodes.length - 1; i++) {
      // v is a collider on this path when both neighboring arrows point into it
      var v = path.nodes[i], collider = path.steps[i - 1].fwd && !path.steps[i].fwd;
      if (collider) { var de = descendants(g, v); var opened = Z[v] || Object.keys(de).some(function (d) { return Z[d]; }); if (!opened) return { blocked: true, at: v, why: 'collider' }; }
      else if (Z[v]) return { blocked: true, at: v, why: 'controlled' };
    }
    return { blocked: false };
  }
  function backdoorOK(g, Z) {
    var de = descendants(g, 'D'), bad = Object.keys(Z).filter(function (v) { return Z[v] && de[v]; });
    var open = paths(g).filter(function (p) { return p.backdoor && !blocked(g, p, Z).blocked; });
    return { ok: !bad.length && !open.length, descendantsControlled: bad, openBackdoors: open };
  }
  function adjustmentSets(g) { // minimal sets of observed nodes that satisfy the backdoor criterion
    var cand = g.nodes.filter(function (n) { return n.obs && n.id !== 'D' && n.id !== 'Y'; }).map(function (n) { return n.id; }), ok = [];
    for (var mask = 0; mask < (1 << cand.length); mask++) {
      var Z = {}; cand.forEach(function (c, i) { if (mask & (1 << i)) Z[c] = 1; });
      if (backdoorOK(g, Z).ok) ok.push(Object.keys(Z));
    }
    return ok.filter(function (a) { return !ok.some(function (b) { return b.length < a.length && b.every(function (x) { return a.indexOf(x) >= 0; }); }); });
  }
  function totalEffect(g) { var s = 0; paths(g).forEach(function (p) { if (p.causal) { var prod = 1; p.steps.forEach(function (st) { g.edges.forEach(function (e) { if (e.from === st.from && e.to === st.to) prod *= e.b; }); }); s += prod; } }); return s; }
  function simulateSEM(g, n, seed) {
    var r = S.rng(seed), order = topo(g), data = {};
    order.forEach(function (v) { data[v] = new Array(n); });
    for (var i = 0; i < n; i++) order.forEach(function (v) { var s = r.n(); g.edges.forEach(function (e) { if (e.to === v) s += e.b * data[e.from][i]; }); data[v][i] = s; });
    return data;
  }
  // the large-sample coefficient on D in a regression of Y on D and Z: from the model's covariance matrix (I - B)^-1 (I - B)^-T
  function plim(g, Zlist) {
    var V = ids(g), k = V.length, idx = {}; V.forEach(function (v, i) { idx[v] = i; });
    var IB = S.eye(k); g.edges.forEach(function (e) { IB[idx[e.to]][idx[e.from]] -= e.b; });
    var A = S.inv(IB), Sig = S.mul(A, S.T(A)), R = ['D'].concat(Zlist), Sxx = R.map(function (a) { return R.map(function (b) { return Sig[idx[a]][idx[b]]; }); }), Sxy = R.map(function (a) { return Sig[idx[a]][idx.Y]; });
    return S.solve(Sxx, Sxy)[0];
  }

  // just-identified IV with an intercept: slope = cov(z, y) / cov(z, x), with a heteroskedasticity-robust standard error
  // (computed directly; the shared tsls forms an n x n matrix, too big for large simulated samples)
  function ivSimple(y, x, z) {
    var n = y.length, my = S.mean(y), mx = S.mean(x), mz = S.mean(z), szy = 0, szx = 0, szz = 0;
    for (var i = 0; i < n; i++) { szy += (z[i] - mz) * (y[i] - my); szx += (z[i] - mz) * (x[i] - mx); szz += (z[i] - mz) * (z[i] - mz); }
    var b = szy / szx, a = my - b * mx, m = 0;
    for (i = 0; i < n; i++) { var u = y[i] - a - b * x[i]; m += Math.pow((z[i] - mz) * u, 2); }
    return { b: b, se: Math.sqrt(m) / Math.abs(szx), firstF: Math.pow(szx, 2) / szz / (function () { var r = 0, bb = szx / szz; for (var k = 0; k < n; k++) r += Math.pow(x[k] - mx - bb * (z[k] - mz), 2); return r / (n - 2); })() };
  }

  /* ---------- 2. matching and weighting ---------- */
  // two covariates; treatment more likely with higher x1 and x2 (strength s); the effect grows with x1, so ATT differs from ATE
  function matchData(p, seed) {
    var r = S.rng(seed), d = { x1: [], x2: [], D: [], y: [], tau: [] };
    for (var i = 0; i < p.n; i++) {
      var x1 = r.n(), x2 = r.n(), pr = 1 / (1 + Math.exp(-(-0.6 + p.s * (0.9 * x1 + 0.6 * x2)))), D = r.u() < pr ? 1 : 0, tau = 1 + 0.8 * x1;
      d.x1.push(x1); d.x2.push(x2); d.D.push(D); d.tau.push(tau); d.y.push(2 + 1.5 * x1 + 1.0 * x2 + D * tau + r.n());
    }
    return d;
  }
  function smd(a, b) { var sa = S.variance(a), sb = S.variance(b); return (S.mean(a) - S.mean(b)) / Math.sqrt((sa + sb) / 2); }
  function wmean(v, w) { var s = 0, t = 0; for (var i = 0; i < v.length; i++) { s += v[i] * w[i]; t += w[i]; } return s / t; }
  function matchEst(d, opt) {
    opt = opt || {};
    var n = d.y.length, lg = S.logit(d.D, d.x1.map(function (v, i) { return [v, d.x2[i]]; }), { intercept: true });
    var ps = d.x1.map(function (v, i) { return lg.prob([v, d.x2[i]]); });
    var T = [], Cn = []; for (var i = 0; i < n; i++) (d.D[i] ? T : Cn).push(i);
    // nearest neighbor on the propensity score, with replacement, optional caliper on the score
    var sortedC = Cn.slice().sort(function (a, b) { return ps[a] - ps[b]; }), cps = sortedC.map(function (j) { return ps[j]; });
    var pairs = [], used = {}, dropped = 0;
    T.forEach(function (t) {
      var lo = 0, hi = cps.length - 1, x = ps[t]; while (lo < hi) { var mid = (lo + hi) >> 1; if (cps[mid] < x) lo = mid + 1; else hi = mid; }
      var best = lo; if (lo > 0 && Math.abs(cps[lo - 1] - x) <= Math.abs(cps[lo] - x)) best = lo - 1;
      var j = sortedC[best]; if (opt.caliper && Math.abs(ps[j] - x) > opt.caliper) { dropped++; return; }
      pairs.push([t, j]); used[j] = (used[j] || 0) + 1;
    });
    var att = S.mean(pairs.map(function (p) { return d.y[p[0]] - d.y[p[1]]; }));
    // balance before and after matching (after: treated kept vs their matches, counting repeats)
    var cov = { x1: d.x1, x2: d.x2, 'x1²': d.x1.map(function (v) { return v * v; }) }, bal = {};
    Object.keys(cov).forEach(function (k) {
      var v = cov[k], tv = T.map(function (i) { return v[i]; }), cv = Cn.map(function (i) { return v[i]; });
      var mt = pairs.map(function (p) { return v[p[0]]; }), mc = pairs.map(function (p) { return v[p[1]]; });
      var sd = Math.sqrt((S.variance(tv) + S.variance(cv)) / 2);
      bal[k] = { before: (S.mean(tv) - S.mean(cv)) / sd, after: (S.mean(mt) - S.mean(mc)) / sd };
    });
    // inverse probability weighting (normalized): ATE and ATT
    var w1 = [], w0 = [], y1 = [], y0 = [], wt0 = [];
    for (i = 0; i < n; i++) { if (d.D[i]) { w1.push(1 / ps[i]); y1.push(d.y[i]); } else { w0.push(1 / (1 - ps[i])); y0.push(d.y[i]); wt0.push(ps[i] / (1 - ps[i])); } }
    var ipwATE = wmean(y1, w1) - wmean(y0, w0), ipwATT = S.mean(y1) - wmean(y0, wt0);
    var reg = S.ols(d.y, d.D.map(function (v, k) { return [v, d.x1[k], d.x2[k]]; }), { intercept: true });
    var naive = S.mean(y1) - S.mean(y0);
    var trueATT = S.mean(T.map(function (k) { return d.tau[k]; })), trueATE = S.mean(d.tau);
    return { ps: ps, T: T, C: Cn, pairs: pairs, nUsed: Object.keys(used).length, dropped: dropped, att: att, ipwATE: ipwATE, ipwATT: ipwATT, reg: reg.b[1], naive: naive, bal: bal, trueATT: trueATT, trueATE: trueATE, maxW: Math.max.apply(null, w1.concat(w0)) };
  }

  /* ---------- 3. synthetic control ---------- */
  // J donors + 1 treated unit (index 0), T periods, policy from period T0 (0-based index T0); two latent factors
  function synthData(p, seed) {
    var r = S.rng(seed), J = p.J, T = p.T, f1 = [], f2 = [], dl = [], Y = [];
    for (var t = 0; t < T; t++) { dl.push(60 + 0.4 * t + 1.2 * r.n() * 0.3); f1.push(Math.sin(t / 4) + 0.08 * t); f2.push(Math.cos(t / 6) - 0.05 * t); }
    var mu = [];
    for (var j = 0; j <= J; j++) mu.push([r.norm(0, 3), r.norm(0, 3)]);
    var w = p.trueW; mu[0] = [0, 0]; Object.keys(w).forEach(function (k) { mu[0][0] += w[k] * mu[+k][0]; mu[0][1] += w[k] * mu[+k][1]; });
    var eff = [];
    for (j = 0; j <= J; j++) { Y.push([]); for (t = 0; t < T; t++) { var e = j === 0 && t >= p.T0 ? p.effect(t - p.T0) : 0; if (j === 0) eff.push(e); Y[j].push(dl[t] + f1[t] * mu[j][0] * 2 + f2[t] * mu[j][1] * 2 + p.sd * r.n() + e); } }
    return { Y: Y, eff: eff, J: J, T: T, T0: p.T0 };
  }
  function projSimplex(v) { // Euclidean projection onto {w >= 0, sum w = 1} (Duchi et al. 2008)
    var u = v.slice().sort(function (a, b) { return b - a; }), cs = 0, rho = 0, th = 0;
    for (var i = 0; i < u.length; i++) { cs += u[i]; var t = (cs - 1) / (i + 1); if (u[i] - t > 0) { rho = i; th = t; } }
    return v.map(function (x) { return Math.max(0, x - th); });
  }
  // weights for unit k from the other units, matching periods 0..T0-1. Because the weights add to 1, subtracting the same number
  // from every unit in a period doesn't change the fit, so the common level is removed first (much better conditioning);
  // then accelerated projected gradient (FISTA) with step 1/L, L = largest eigenvalue of X'X by power iteration
  function synthFit(Y, k, T0, w0, iters) {
    var donors = []; for (var j = 0; j < Y.length; j++) if (j !== k) donors.push(j);
    var m = donors.length, ct = [], t, a;
    for (t = 0; t < T0; t++) { var sm = 0; for (j = 0; j < Y.length; j++) sm += Y[j][t]; ct.push(sm / Y.length); }
    var X = donors.map(function (dj) { return Y[dj].slice(0, T0).map(function (v, tt) { return v - ct[tt]; }); }), y = Y[k].slice(0, T0).map(function (v, tt) { return v - ct[tt]; });
    var v = new Array(m).fill(1), Lc = 1;
    for (var it = 0; it < 50; it++) { var Xv = new Array(T0).fill(0); for (a = 0; a < m; a++) for (t = 0; t < T0; t++) Xv[t] += X[a][t] * v[a]; var nv = new Array(m).fill(0); for (a = 0; a < m; a++) for (t = 0; t < T0; t++) nv[a] += X[a][t] * Xv[t]; var nr = Math.sqrt(nv.reduce(function (q, x) { return q + x * x; }, 0)) || 1; Lc = nr / (Math.sqrt(v.reduce(function (q, x) { return q + x * x; }, 0)) || 1); v = nv.map(function (x) { return x / nr; }); }
    Lc *= 1.05;
    function grad(w) { var r = y.map(function (yy) { return -yy; }); for (a = 0; a < m; a++) for (t = 0; t < T0; t++) r[t] += w[a] * X[a][t]; var g = new Array(m).fill(0); for (a = 0; a < m; a++) for (t = 0; t < T0; t++) g[a] += r[t] * X[a][t]; return g; }
    var w = w0 ? projSimplex(w0) : new Array(m).fill(1 / m), z = w.slice(), tk = 1;
    for (it = 0; it < (iters || 3000); it++) {
      var g = grad(z), wn = projSimplex(z.map(function (x, a2) { return x - g[a2] / Lc; })), tn = (1 + Math.sqrt(1 + 4 * tk * tk)) / 2;
      z = wn.map(function (x, a2) { return x + (tk - 1) / tn * (x - w[a2]); }); w = wn; tk = tn;
    }
    return { w: w, donors: donors, rmspe: rmspe(Y, k, donors, w, 0, T0) };
  }
  function synthPath(Y, donors, w) { var T = Y[0].length, out = []; for (var t = 0; t < T; t++) { var s = 0; donors.forEach(function (j, a) { s += w[a] * Y[j][t]; }); out.push(s); } return out; }
  function rmspe(Y, k, donors, w, a, b) { var sp = synthPath(Y, donors, w), s = 0; for (var t = a; t < b; t++) s += Math.pow(Y[k][t] - sp[t], 2); return Math.sqrt(s / (b - a)); }

  /* ---------- 4. LASSO and double/debiased machine learning ---------- */
  // standardize columns; returns {Z, mu, sd}
  function standardize(X) { var n = X.length, p = X[0].length, mu = [], sd = [], Z = X.map(function (r) { return r.slice(); }); for (var j = 0; j < p; j++) { var m = 0, s = 0; for (var i = 0; i < n; i++) m += X[i][j] / n; for (i = 0; i < n; i++) s += Math.pow(X[i][j] - m, 2) / n; s = Math.sqrt(s) || 1; mu.push(m); sd.push(s); for (i = 0; i < n; i++) Z[i][j] = (X[i][j] - m) / s; } return { Z: Z, mu: mu, sd: sd }; }
  // minimize (1/2n)||y - a - Zb||^2 + lam * sum_j pen_j |b_j| on standardized Z (columns centered, variance 1); returns b on the standardized scale
  function lassoStd(Z, y, lam, b0, pen, tol) {
    var n = Z.length, p = Z[0].length, b = b0 ? b0.slice() : new Array(p).fill(0), ym = 0, i, j;
    for (i = 0; i < n; i++) ym += y[i] / n;
    var r = y.map(function (v, k) { var s = v - ym; for (j = 0; j < p; j++) s -= Z[k][j] * b[j]; return s; });
    for (var it = 0; it < 500; it++) {
      var maxd = 0;
      for (j = 0; j < p; j++) {
        var rho = 0; for (i = 0; i < n; i++) rho += Z[i][j] * r[i]; rho = rho / n + b[j];
        var l = lam * (pen ? pen[j] : 1), nb = rho > l ? rho - l : rho < -l ? rho + l : 0, d = nb - b[j];
        if (d !== 0) { for (i = 0; i < n; i++) r[i] -= Z[i][j] * d; b[j] = nb; maxd = Math.max(maxd, Math.abs(d)); }
      }
      if (maxd < (tol || 1e-7)) break;
    }
    return { b: b, a: ym, it: it };
  }
  function lasso(X, y, lam, opt) { // on the original scale
    opt = opt || {}; var s = standardize(X), f = lassoStd(s.Z, y, lam, opt.b0, opt.pen, opt.tol);
    var beta = f.b.map(function (v, j) { return v / s.sd[j]; }), a = f.a; beta.forEach(function (v, j) { a -= v * s.mu[j]; });
    return { b: beta, a: a, bStd: f.b, predict: function (row) { var q = a; for (var j = 0; j < row.length; j++) q += row[j] * beta[j]; return q; } };
  }
  function lambdaMax(X, y) { var s = standardize(X), n = y.length, ym = S.mean(y), m = 0; for (var j = 0; j < s.Z[0].length; j++) { var c = 0; for (var i = 0; i < n; i++) c += s.Z[i][j] * (y[i] - ym); m = Math.max(m, Math.abs(c) / n); } return m; }
  function lassoPath(X, y, lams) { var s = standardize(X), b = null; return lams.map(function (l) { var f = lassoStd(s.Z, y, l, b, null, 1e-6); b = f.b; return f.b.slice(); }); }
  // data for DML: controls x (Toeplitz correlation 0.5^|j-k|), treatment d, outcome y = theta d + ...
  function dmlData(p, seed) {
    var r = S.rng(seed), X = [], d = [], y = [];
    for (var i = 0; i < p.n; i++) {
      var row = [], prev = 0; for (var j = 0; j < p.p; j++) { var e = r.n(); prev = j ? 0.5 * prev + Math.sqrt(0.75) * e : e; row.push(prev); }
      var m = 0.8 * (row[0] + row[1] + row[2]), g = 0.25 * (row[0] + row[1] + row[2]) + 1.0 * (row[3] + row[4] + row[5]);
      var dv = m + r.n(); X.push(row); d.push(dv); y.push(p.theta * dv + g + r.n());
    }
    return { X: X, d: d, y: y };
  }
  function sigmaLasso(X, y) { // a plug-in penalty: sigma * sqrt(2 log p / n), with sigma refined once from the residuals
    var n = y.length, p = X[0].length, sig = S.sd(y), lam = sig * Math.sqrt(2 * Math.log(p) / n), f = lasso(X, y, lam);
    var res = y.map(function (v, i) { return v - f.predict(X[i]); }); sig = Math.sqrt(S.mean(res.map(function (v) { return v * v; })));
    lam = 1.1 * sig * Math.sqrt(2 * Math.log(p) / n); return lasso(X, y, lam);
  }
  function naiveSelect(D) { // "single selection": LASSO of y on (d, x) with d unpenalized, then OLS on d and the selected x's
    var p = D.X[0].length, Xd = D.X.map(function (r, i) { return [D.d[i]].concat(r); }), pen = [0].concat(new Array(p).fill(1));
    var n = D.y.length, sig = S.sd(D.y), lam = 1.1 * sig * Math.sqrt(2 * Math.log(p) / n), s = standardize(Xd), f = lassoStd(s.Z, D.y, lam, null, pen);
    var res = D.y.map(function (v, i) { var q = f.a; for (var j = 0; j <= p; j++) q += s.Z[i][j] * f.b[j]; return v - q; }); sig = Math.sqrt(S.mean(res.map(function (v) { return v * v; }))); lam = 1.1 * sig * Math.sqrt(2 * Math.log(p) / n);
    f = lassoStd(s.Z, D.y, lam, f.b, pen);
    var sel = []; for (var j = 1; j <= p; j++) if (f.b[j] !== 0) sel.push(j - 1);
    var o = S.ols(D.y, D.X.map(function (r, i) { return [D.d[i]].concat(sel.map(function (k) { return r[k]; })); }), { intercept: true, se: 'HC1' });
    return { theta: o.b[1], se: o.se[1], selected: sel };
  }
  function postLasso(X, y) { // LASSO to choose the controls, then OLS on the chosen ones (reduces the shrinkage bias)
    var f = sigmaLasso(X, y), sel = []; f.b.forEach(function (v, j) { if (v !== 0) sel.push(j); });
    if (!sel.length) { var m = S.mean(y); return { predict: function () { return m; }, sel: sel }; }
    var o = S.ols(y, X.map(function (r) { return sel.map(function (j) { return r[j]; }); }), { intercept: true });
    return { predict: function (row) { var q = o.b[0]; sel.forEach(function (j, a) { q += o.b[a + 1] * row[j]; }); return q; }, sel: sel };
  }
  function dml(D, K, seed, plain) { // partialling out with K-fold cross-fitting, post-LASSO (or plain LASSO) for both nuisance functions
    var n = D.y.length, r = S.rng(seed), idx = []; for (var i = 0; i < n; i++) idx.push(i); r.shuffle(idx);
    var fold = new Array(n); idx.forEach(function (v, k) { fold[v] = k % K; });
    var u = new Array(n), v = new Array(n);
    for (var k = 0; k < K; k++) {
      var tr = [], te = []; for (i = 0; i < n; i++) (fold[i] === k ? te : tr).push(i);
      var Xt = tr.map(function (q) { return D.X[q]; }), fit = plain ? sigmaLasso : postLasso, fy = fit(Xt, tr.map(function (q) { return D.y[q]; })), fd = fit(Xt, tr.map(function (q) { return D.d[q]; }));
      te.forEach(function (q) { u[q] = D.y[q] - fy.predict(D.X[q]); v[q] = D.d[q] - fd.predict(D.X[q]); });
    }
    var svv = 0, svu = 0; for (i = 0; i < n; i++) { svv += v[i] * v[i]; svu += v[i] * u[i]; }
    var th = svu / svv, psi = 0; for (i = 0; i < n; i++) psi += Math.pow(v[i] * (u[i] - th * v[i]), 2);
    var se = Math.sqrt(psi / n) / (svv / n) / Math.sqrt(n);
    return { theta: th, se: se };
  }
  return { PRESETS: PRESETS, makeGraph: makeGraph, has: has, descendants: descendants, acyclicWith: acyclicWith, topo: topo, paths: paths, blocked: blocked, backdoorOK: backdoorOK, adjustmentSets: adjustmentSets, totalEffect: totalEffect, simulateSEM: simulateSEM, plim: plim, ivSimple: ivSimple,
    matchData: matchData, matchEst: matchEst, smd: smd, synthData: synthData, projSimplex: projSimplex, synthFit: synthFit, synthPath: synthPath, rmspe: rmspe,
    standardize: standardize, lasso: lasso, lassoStd: lassoStd, lambdaMax: lambdaMax, lassoPath: lassoPath, dmlData: dmlData, sigmaLasso: sigmaLasso, naiveSelect: naiveSelect, postLasso: postLasso, dml: dml };
});
