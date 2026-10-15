/* Game Theory, Chapter 12 (Mechanism Design and Matching): Gale–Shapley deferred acceptance with a step-by-step log,
   stability checks, all stable matchings by brute force, and the Clarke (VCG) mechanism for a public project.
   window.GT12M in the browser, module.exports in node (tested in /tmp/work_gt2/test/gt12.test.js). */
(function (root) {
  'use strict';
  /* ---------- deferred acceptance (Gale and Shapley 1962), one-to-one ----------
     prop[i] = proposer i's list of acceptable receivers, best first; recv[j] = receiver j's list of acceptable proposers.
     The first free proposer (lowest number) with someone left on its list proposes to the next one on it.
     The receiver holds the better of the new proposer and the one it holds (if acceptable) and rejects the other.
     Returns {match: proposer -> receiver (−1 = none), log: [{p, r, kind: 'hold'|'reject', dropped}]} */
  function da(prop, recv) {
    var n = prop.length, m = recv.length, next = [], holdBy = [], matchP = [], log = [], rank = recv.map(function (l) { var r = {}; l.forEach(function (p, k) { r[p] = k; }); return r; });
    for (var i = 0; i < n; i++) { next[i] = 0; matchP[i] = -1; } for (var j = 0; j < m; j++) holdBy[j] = -1;
    for (var guard = 0; guard < 10000; guard++) {
      var p = -1; for (i = 0; i < n; i++) if (matchP[i] < 0 && next[i] < prop[i].length) { p = i; break; }
      if (p < 0) break;
      var r = prop[p][next[p]++], rk = rank[r];
      if (!(p in rk)) { log.push({ p: p, r: r, kind: 'reject', why: 'unacceptable' }); continue; }
      var cur = holdBy[r];
      if (cur < 0) { holdBy[r] = p; matchP[p] = r; log.push({ p: p, r: r, kind: 'hold' }); }
      else if (rk[p] < rk[cur]) { holdBy[r] = p; matchP[p] = r; matchP[cur] = -1; log.push({ p: p, r: r, kind: 'hold', dropped: cur }); }
      else log.push({ p: p, r: r, kind: 'reject', why: 'prefers ' + cur, holder: cur });
    }
    return { match: matchP, log: log };
  }
  function prefers(list, a, b) { // does the owner of list prefer a to b? b = −1 means unmatched
    var ia = list.indexOf(a); if (ia < 0) return false; if (b < 0) return true; var ib = list.indexOf(b); return ib < 0 || ia < ib;
  }
  /* blocking pairs of a matching mS: student i -> school (−1 none). Students are S, schools are T (preference lists). */
  function blocking(S, T, mS) {
    var mT = T.map(function () { return -1; }), out = [];
    mS.forEach(function (j, i) { if (j >= 0) mT[j] = i; });
    for (var i = 0; i < S.length; i++) for (var j = 0; j < T.length; j++) {
      if (mS[i] === j) continue;
      if (prefers(S[i], j, mS[i]) && prefers(T[j], i, mT[j])) out.push([i, j]);
    }
    return out;
  }
  function individuallyRational(S, T, mS) { return mS.every(function (j, i) { return j < 0 || (S[i].indexOf(j) >= 0 && T[j].indexOf(i) >= 0); }); }
  function stable(S, T, mS) { return individuallyRational(S, T, mS) && blocking(S, T, mS).length === 0; }
  /* every stable matching (brute force over injections, fine for up to 5 a side) */
  function allStable(S, T) {
    var n = S.length, m = T.length, out = [], cur = [], used = [];
    (function rec(i) {
      if (i === n) { if (stable(S, T, cur)) out.push(cur.slice()); return; }
      for (var j = -1; j < m; j++) { if (j >= 0 && used[j]) continue; cur[i] = j; if (j >= 0) used[j] = true; rec(i + 1); if (j >= 0) used[j] = false; }
    })(0);
    return out;
  }
  /* run DA with students (S) or schools (T) proposing; always returns student -> school */
  function run(S, T, side) {
    if (side === 'S') return da(S, T).match;
    var r = da(T, S).match, mS = S.map(function () { return -1; }); r.forEach(function (i, j) { if (i >= 0) mS[i] = j; }); return mS;
  }
  function rankOf(list, x) { var k = list.indexOf(x); return k < 0 ? Infinity : k; }

  /* ---------- the Clarke (pivot) mechanism for a public project ----------
     Each person i reports a value r_i for the project; it costs C, shared equally. Net report n_i = r_i − C/N.
     Build if the sum of net reports is ≥ 0. Person i pays a tax if pivotal: |sum of the others' net reports|. */
  function clarke(reports, C) {
    var N = reports.length, share = C / N, net = reports.map(function (r) { return r - share; }), tot = net.reduce(function (a, b) { return a + b; }, 0), build = tot >= 0;
    var tax = net.map(function (x) { var o = tot - x, b2 = o >= 0; return b2 !== build ? Math.abs(o) : 0; });
    return { build: build, tax: tax, net: net, total: tot };
  }
  function clarkeUtility(i, truth, reports, C) { var o = clarke(reports, C), share = C / reports.length; return (o.build ? truth - share : 0) - o.tax[i]; }
  /* a naive rule for comparison: build if reports add up to the cost; each pays in proportion to their report */
  function proportional(reports, C) { var s = reports.reduce(function (a, b) { return a + b; }, 0), build = s >= C - 1e-9; return { build: build, pay: reports.map(function (r) { return build && s > 0 ? C * r / s : 0; }) }; }
  function proportionalUtility(i, truth, reports, C) { var o = proportional(reports, C); return o.build ? truth - o.pay[i] : 0; }

  var api = { da: da, prefers: prefers, blocking: blocking, stable: stable, allStable: allStable, run: run, rankOf: rankOf, clarke: clarke, clarkeUtility: clarkeUtility, proportional: proportional, proportionalUtility: proportionalUtility };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GT12M = api;
})(this);
