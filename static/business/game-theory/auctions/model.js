/* Game Theory, Chapter 9 (Auctions): equilibrium bids, expected payoffs, revenue simulations and the winner's curse.
   window.GT9M in the browser, module.exports in node (tested in /tmp/work_gt2/test/gt9.test.js).
   Private values are independent and uniform on [0, V]. */
(function (root) {
  'use strict';
  /* first-price equilibrium bid with n bidders, values U[0, V], CRRA utility u(x) = x^a (a = 1: risk neutral),
     reserve price r: beta(v) = k v/(k+1) + r^(k+1) / ((k+1) v^k) for v >= r, where k = (n-1)/a.
     With a = 1 and r = 0 this is the familiar (n-1)/n * v. Values are scaled to [0,1] inside. */
  function fpaBid(v, n, V, a, r) {
    V = V || 1; a = a || 1; r = r || 0; var x = v / V, rr = r / V, k = (n - 1) / a;
    if (x < rr) return NaN; if (x <= 0) return 0;
    return V * (k * x / (k + 1) + Math.pow(rr, k + 1) / ((k + 1) * Math.pow(x, k)));
  }
  /* all-pay equilibrium bid (risk neutral, no reserve): (n-1)/n * v^n / V^(n-1) */
  function allPayBid(v, n, V) { V = V || 1; return V * (n - 1) / n * Math.pow(v / V, n); }
  /* chance that a bid b beats n-1 rivals who bid (n-1)/n * value, values U[0, V] */
  function fpaWinProb(b, n, V) { var x = Math.max(0, Math.min(1, b * n / ((n - 1) * V))); return Math.pow(x, n - 1); }
  function fpaPayoff(b, v, n, V) { return (v - b) * fpaWinProb(b, n, V); }
  /* expected payoff of bidding b in a second-price auction with value v against n-1 truthful rivals:
     E[(v - Y) 1{Y < b}] with Y the highest rival value = (v B^(n-1) - (n-1)/n B^n) / V^(n-1), B = min(b, V) */
  function spaPayoff(b, v, n, V) { var B = Math.max(0, Math.min(b, V)); return (v * Math.pow(B, n - 1) - (n - 1) / n * Math.pow(B, n)) / Math.pow(V, n - 1); }
  function spaWinProb(b, n, V) { var B = Math.max(0, Math.min(b, V)); return Math.pow(B / V, n - 1); }

  /* expected revenue, values U[0,1] (multiply by V) */
  function revTheorySPA(n, r) { r = r || 0; return 2 * n * (1 - Math.pow(r, n + 1)) / (n + 1) - (1 - Math.pow(r, n)); }
  function revTheoryFPA(n, a, r) { // integral of beta(v) times the density of the top value, n v^(n-1), from r to 1 (Simpson's rule)
    a = a || 1; r = r || 0; var m = 2000, h = (1 - r) / m, s = 0;
    for (var i = 0; i <= m; i++) { var v = r + i * h, f = (v > 0 ? fpaBid(v, n, 1, a, r) : 0) * n * Math.pow(v, n - 1); s += f * (i === 0 || i === m ? 1 : i % 2 ? 4 : 2); }
    return s * h / 3;
  }
  /* one auction with n bidders, values U[0, V]; returns revenues of each format (NaN where not defined) */
  function simulate(n, V, a, r, R) {
    var v1 = -1, v2 = -1, ap = 0;
    for (var i = 0; i < n; i++) { var v = R() * V; if (v > v1) { v2 = v1; v1 = v; } else if (v > v2) v2 = v; if (a === 1 && !r) ap += allPayBid(v, n, V); }
    var sold = v1 >= r;
    return { fpa: sold ? fpaBid(v1, n, V, a, r) : 0, spa: sold ? Math.max(v2, r) : 0, ap: a === 1 && !r ? ap : NaN, sold: sold, v1: v1, v2: v2 };
  }

  /* the winner's curse: common value X, each of n bidders sees X + e with e ~ U[-E, E] and bids estimate - m (first price).
     The highest estimate wins, so the winner's profit is m - max(e). Its average is m - E (n-1)/(n+1). */
  function curseRound(n, X, E, m, R) {
    var est = [], best = -Infinity, wi = 0;
    for (var i = 0; i < n; i++) { var s = X + (2 * R() - 1) * E; est.push(s); if (s > best) { best = s; wi = i; } }
    return { est: est, win: wi, bid: best - m, profit: X - (best - m) };
  }
  function breakEvenShade(n, E) { return E * (n - 1) / (n + 1); }

  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  var api = { fpaBid: fpaBid, allPayBid: allPayBid, fpaWinProb: fpaWinProb, fpaPayoff: fpaPayoff, spaPayoff: spaPayoff, spaWinProb: spaWinProb,
    revTheorySPA: revTheorySPA, revTheoryFPA: revTheoryFPA, simulate: simulate, curseRound: curseRound, breakEvenShade: breakEvenShade, rng: rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GT9M = api;
})(this);
