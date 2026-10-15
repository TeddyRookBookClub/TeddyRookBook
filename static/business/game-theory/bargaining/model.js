/* Game Theory, Chapter 11 (Bargaining): Rubinstein's alternating offers (infinite and finite horizon) and the Nash
   bargaining solution on a curved frontier. window.GT11M in the browser, module.exports in node
   (tested in /tmp/work_gt2/test/gt11.test.js). Shares are fractions of a pie of size 1. */
(function (root) {
  'use strict';
  /* ---------- Rubinstein (1982) ----------
     Players take turns proposing a split of a pie of 1; a rejected offer costs a round, and player i values a share
     received t rounds later at di^t of its value now. In the unique subgame perfect equilibrium the proposer i keeps
     (1 − dj)/(1 − di·dj) and the responder j accepts at once. */
  function rubinstein(di, dj) { return (1 - dj) / (1 - di * dj); }
  /* finite horizon: T rounds; if the last offer is rejected both get 0. first = 1 or 2, the round-1 proposer.
     Returns {proposer: [..], share: [..]} for rounds 1..T: share[t] is what the round-t proposer keeps in equilibrium. */
  function finite(T, d1, d2, first) {
    var prop = [], share = [];
    for (var t = 1; t <= T; t++) prop[t] = (t % 2 === 1) ? first : 3 - first;
    share[T] = 1;
    for (t = T - 1; t >= 1; t--) { var resp = prop[t + 1], dr = resp === 1 ? d1 : d2; share[t] = 1 - dr * share[t + 1]; }
    return { proposer: prop, share: share };
  }
  /* what the round-t proposer keeps in equilibrium, for a horizon T (Infinity allowed) */
  function proposerShare(t, T, d1, d2, first) {
    var p = (t % 2 === 1) ? first : 3 - first, di = p === 1 ? d1 : d2, dj = p === 1 ? d2 : d1;
    if (!isFinite(T)) return rubinstein(di, dj);
    return finite(T, d1, d2, first).share[t];
  }
  /* the least a responder (player j) accepts in round t: the discounted value of proposing next round (0 after the last round) */
  function reservation(t, T, d1, d2, first) {
    var p = (t % 2 === 1) ? first : 3 - first, j = 3 - p, dj = j === 1 ? d1 : d2;
    if (isFinite(T) && t >= T) return 0;
    return dj * proposerShare(t + 1, T, d1, d2, first);
  }
  /* the limit as the time between offers shrinks: di = exp(−ri·D) with D → 0 gives player 1 the share r2/(r1 + r2) */
  function limitShare(r1, r2) { return r2 / (r1 + r2); }

  /* ---------- the Nash bargaining solution ----------
     A frontier is a decreasing function u2 = f(u1) on [0, m]. With disagreement point (d1, d2), the (generalized)
     Nash solution maximizes (u1 − d1)^b (u2 − d2)^(1 − b) over frontier points with u1 > d1 and u2 > d2. */
  var FRONTIERS = {
    split: { name: 'Split $100', m: 100, f: function (u) { return 100 - u; } },
    risk: { name: 'A risk-averse partner', m: 100, f: function (u) { return 100 * Math.sqrt(Math.max(0, 1 - u / 100)); } },
    curve: { name: 'A curved deal set', m: 100, f: function (u) { return 80 * Math.sqrt(Math.max(0, 1 - (u / 100) * (u / 100))); } }
  };
  function nash(fr, d1, d2, b) {
    if (b === undefined) b = 0.5;
    var lo = Math.max(0, d1), hi = fr.m; // u1 range where u1 > d1; u2 > d2 needs f(u1) > d2
    function obj(u) { var v = fr.f(u) - d2, w = u - d1; return v > 0 && w > 0 ? b * Math.log(w) + (1 - b) * Math.log(v) : -Infinity; }
    // the objective is concave in u1 on the frontiers used here; ternary search after a coarse scan
    var best = lo, bv = -Infinity, N = 2000;
    for (var i = 0; i <= N; i++) { var u = lo + (hi - lo) * i / N, o = obj(u); if (o > bv) { bv = o; best = u; } }
    if (bv === -Infinity) return null;
    var a = Math.max(lo, best - (hi - lo) / N), z = Math.min(hi, best + (hi - lo) / N);
    for (var k = 0; k < 100; k++) { var m1 = a + (z - a) / 3, m2 = z - (z - a) / 3; if (obj(m1) < obj(m2)) a = m1; else z = m2; }
    var u1 = (a + z) / 2; return { u1: u1, u2: fr.f(u1), prod: (u1 - d1) * (fr.f(u1) - d2) };
  }
  /* Kalai–Smorodinsky: the frontier point on the line from d to the ideal point (best u1 given u2 ≥ d2, best u2 given u1 ≥ d1) */
  function ks(fr, d1, d2) {
    var i2 = fr.f(Math.max(0, d1)), lo = 0, hi = fr.m, i1;
    for (var k = 0; k < 100; k++) { var mid = (lo + hi) / 2; if (fr.f(mid) >= d2) lo = mid; else hi = mid; } i1 = lo;
    if (i1 <= d1 || i2 <= d2) return null;
    // find s in [0,1] with d + s(ideal − d) on the frontier
    var a = 0, z = 1;
    for (k = 0; k < 100; k++) { var s = (a + z) / 2, x = d1 + s * (i1 - d1), y = d2 + s * (i2 - d2); if (y < fr.f(x)) a = s; else z = s; }
    var sx = d1 + a * (i1 - d1); return { u1: sx, u2: fr.f(sx), ideal: [i1, i2] };
  }

  var api = { rubinstein: rubinstein, finite: finite, proposerShare: proposerShare, reservation: reservation, limitShare: limitShare, FRONTIERS: FRONTIERS, nash: nash, ks: ks };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GT11M = api;
})(this);
