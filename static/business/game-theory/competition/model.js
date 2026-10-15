/* Game Theory, Chapter 5: the models behind the interactives (node-testable).
   1. Cournot: firms choose quantities; linear inverse demand P = a − b Q, constant marginal costs.
   2. Bertrand: firms choose prices; identical goods (with or without capacity limits) or differentiated goods.
   3. Hotelling: two or three sellers (or candidates) choose locations on a line; customers go to the nearest. */
(function (root) {
  'use strict';
  var M = {};
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  /* ---------- 1. Cournot ---------- */
  M.price = function (P, Q) { return Math.max(0, P.a - P.b * Q); };
  M.profit = function (P, qi, qj, ci) { return (M.price(P, qi + qj) - ci) * qi; };
  /* best response: maximize (a − b(qi + qj) − ci) qi  ⇒  qi = (a − ci − b qj) / (2b), not below 0 */
  M.br = function (P, qj, ci) { return Math.max(0, (P.a - ci - P.b * qj) / (2 * P.b)); };
  /* the Nash equilibrium with costs c1, c2 (handles one firm being priced out) */
  M.cournot = function (P) {
    var q1 = (P.a - 2 * P.c1 + P.c2) / (3 * P.b), q2 = (P.a - 2 * P.c2 + P.c1) / (3 * P.b);
    if (q1 < 0) { q1 = 0; q2 = Math.max(0, (P.a - P.c2) / (2 * P.b)); }
    if (q2 < 0) { q2 = 0; q1 = Math.max(0, (P.a - P.c1) / (2 * P.b)); }
    return { q1: q1, q2: q2 };
  };
  /* benchmarks with a common cost c and n firms */
  M.monopoly = function (P, c) { var Q = Math.max(0, (P.a - c) / (2 * P.b)); return { Q: Q, p: M.price(P, Q), profit: (M.price(P, Q) - c) * Q }; };
  M.competitive = function (P, c) { var Q = Math.max(0, (P.a - c) / P.b); return { Q: Q, p: c, profit: 0 }; };
  M.cournotN = function (P, c, n) { var q = Math.max(0, (P.a - c) / ((n + 1) * P.b)), Q = n * q, p = M.price(P, Q); return { q: q, Q: Q, p: p, profit: (p - c) * Q, each: (p - c) * q }; };
  M.consumerSurplus = function (P, Q) { return 0.5 * P.b * Q * Q; }; // the triangle under linear demand
  /* one round of best-response adjustment, simultaneous or alternating (alternating: firm 1 moves on even steps) */
  M.adjust = function (P, q, mode, k) {
    if (mode === 'sim') return { q1: M.br(P, q.q2, P.c1), q2: M.br(P, q.q1, P.c2) };
    return k % 2 === 0 ? { q1: M.br(P, q.q2, P.c1), q2: q.q2 } : { q1: q.q1, q2: M.br(P, q.q1, P.c2) };
  };

  /* ---------- 2. Bertrand ----------
     Demand D(p) = A − p for the cheapest firm (split evenly if prices tie). Marginal cost c. Prices in whole dollars. */
  M.BT = { A: 100, c: 10, tick: 1, k: 50, kTight: 30 };
  M.D = function (p) { return Math.max(0, M.BT.A - p); };
  /* sales and profits for prices p1, p2. cap: capacity per firm or Infinity; rationing is efficient: the cheaper firm
     serves the customers who value the good most, and the other firm faces what is left */
  M.sales = function (p1, p2, cap) {
    var s1, s2, c = M.BT.c;
    if (p1 < p2) { s1 = Math.min(cap, M.D(p1)); s2 = Math.min(cap, Math.max(0, M.D(p2) - s1)); }
    else if (p2 < p1) { s2 = Math.min(cap, M.D(p2)); s1 = Math.min(cap, Math.max(0, M.D(p1) - s2)); }
    else { var d = M.D(p1); s1 = Math.min(cap, d / 2); s2 = Math.min(cap, d / 2); var rest = d - s1 - s2; if (rest > 0) { var x = Math.min(rest, cap - s1); s1 += x; rest -= x; s2 += Math.min(rest, cap - s2); } }
    return { s1: s1, s2: s2, pi1: (p1 - c) * s1, pi2: (p2 - c) * s2 };
  };
  /* best reply on the price grid to a rival price pj (search; with ties prefer the higher price) */
  M.bertrandBR = function (pj, cap) {
    var best = -Infinity, bp = M.BT.c, c = M.BT.c;
    for (var p = c; p <= M.BT.A; p += M.BT.tick) { var pi = M.sales(p, pj, cap).pi1; if (pi > best + 1e-9) { best = pi; bp = p; } }
    return bp;
  };
  /* differentiated products: q_i = α − β p_i + γ p_j; best reply p_i = (α + β c + γ p_j) / (2β); equilibrium (α + β c)/(2β − γ) */
  M.DIF = { alpha: 60, beta: 1, gamma: 0.5 };
  M.difBR = function (pj) { var d = M.DIF; return (d.alpha + d.beta * M.BT.c + d.gamma * pj) / (2 * d.beta); };
  M.difEq = function () { var d = M.DIF; return (d.alpha + d.beta * M.BT.c) / (2 * d.beta - d.gamma); };
  M.difProfit = function (pi, pj) { var d = M.DIF; return (pi - M.BT.c) * Math.max(0, d.alpha - d.beta * pi + d.gamma * pj); };

  /* ---------- 3. Hotelling ----------
     Customers on [0, 1] with a density given on a grid of N cells; each goes to the nearest seller (ties split).
     Shares are computed exactly on the grid. Positions are on a grid of steps of 0.01. */
  M.DENS = {
    uniform: function (x) { return 1; },
    skewed: function (x) { return Math.pow(x, 1.2) * Math.pow(1 - x, 3.2) * 40; }, // more people toward the left
    twotowns: function (x) { return Math.exp(-Math.pow((x - 0.22) / 0.09, 2)) + 0.75 * Math.exp(-Math.pow((x - 0.74) / 0.12, 2)) + 0.03; }
  };
  M.grid = function (kind, N) { var f = M.DENS[kind], w = [], s = 0; for (var i = 0; i < N; i++) { var v = f((i + 0.5) / N); w.push(v); s += v; } return w.map(function (v) { return v / s; }); };
  M.median = function (w) { var s = 0; for (var i = 0; i < w.length; i++) { s += w[i]; if (s >= 0.5) return (i + 0.5) / w.length; } return 0.5; };
  M.shares = function (w, xs) {
    var N = w.length, sh = xs.map(function () { return 0; });
    for (var i = 0; i < N; i++) {
      var x = (i + 0.5) / N, best = Infinity, who = [];
      xs.forEach(function (p, k) { var d = Math.abs(p - x); if (d < best - 1e-12) { best = d; who = [k]; } else if (Math.abs(d - best) <= 1e-12) who.push(k); });
      who.forEach(function (k) { sh[k] += w[i] / who.length; });
    }
    return sh;
  };
  /* best location for seller k given the others, on the 0.01 grid (ties: closest to its current spot) */
  M.hotBR = function (w, xs, k) {
    var best = -1, bx = xs[k];
    for (var t = 0; t <= 100; t++) {
      var x = t / 100, ys = xs.slice(); ys[k] = x; var s = M.shares(w, ys)[k];
      if (s > best + 1e-9 || (Math.abs(s - best) <= 1e-9 && Math.abs(x - xs[k]) < Math.abs(bx - xs[k]))) { best = s; bx = x; }
    }
    return bx;
  };

  if (typeof module === 'object' && module.exports) module.exports = M;
  root.GT5M = M;
})(typeof window !== 'undefined' ? window : this);
