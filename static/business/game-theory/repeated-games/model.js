/* Game Theory, Chapter 7: the models behind the interactives (node-testable).
   1. The repeated prisoner's dilemma: classic strategies, matches with noise and fixed or uncertain length,
      an Axelrod-style round-robin tournament, and "ecological" evolution of the population (discrete replicator dynamics).
   2. The grim-trigger condition δ ≥ (T − R)/(T − P). */
(function (root) {
  'use strict';
  var M = {};
  /* Axelrod's payoffs: temptation T, reward R, punishment P, sucker S. Moves: 0 = cooperate (C), 1 = defect (D). */
  M.PAY = { T: 5, R: 3, P: 1, S: 0 };
  M.payoff = function (a, b, P) { P = P || M.PAY; return a === 0 ? (b === 0 ? P.R : P.S) : (b === 0 ? P.T : P.P); };
  /* strategies: move(me, them, r) gets the two move histories (what was actually played) and returns 0 or 1 */
  M.STRATS = {
    allc: { name: 'Always cooperate', short: 'ALLC', col: '#63e6be', move: function () { return 0; } },
    alld: { name: 'Always defect', short: 'ALLD', col: '#ff8787', move: function () { return 1; } },
    tft: { name: 'Tit for tat', short: 'TFT', col: '#74c0fc', move: function (me, th) { return th.length ? th[th.length - 1] : 0; } },
    grim: { name: 'Grim trigger', short: 'GRIM', col: '#b197fc', move: function (me, th) { return th.indexOf(1) >= 0 ? 1 : 0; } },
    wsls: { name: 'Win-stay, lose-shift', short: 'WSLS', col: '#ffd479', move: function (me, th) { var n = me.length; if (!n) return 0; return th[n - 1] === 0 ? me[n - 1] : 1 - me[n - 1]; } },
    gtft: { name: 'Generous tit for tat', short: 'GTFT', col: '#38d9a9', move: function (me, th, r) { if (!th.length || th[th.length - 1] === 0) return 0; return r() < 1 / 3 ? 0 : 1; } },
    tf2t: { name: 'Tit for two tats', short: 'TF2T', col: '#a5d8ff', move: function (me, th) { var n = th.length; return n >= 2 && th[n - 1] === 1 && th[n - 2] === 1 ? 1 : 0; } },
    rand: { name: 'Random', short: 'RAND', col: '#adb5bd', move: function (me, th, r) { return r() < 0.5 ? 0 : 1; } },
    yours: { name: 'Your strategy', short: 'YOURS', col: '#f9a8d4', move: null }
  };
  M.ORDER = ['allc', 'alld', 'tft', 'grim', 'wsls', 'gtft', 'tf2t', 'rand', 'yours'];
  /* your strategy: first move, then a reply to each outcome of the last round (my move, their move): CC, CD, DC, DD;
     optionally "never forgive": once they defect, defect forever */
  M.makeYours = function (rule) {
    return function (me, th) {
      var n = me.length; if (!n) return rule.first;
      if (rule.grudge && th.indexOf(1) >= 0) return 1;
      return rule.after[me[n - 1] * 2 + th[n - 1]];
    };
  };
  M.DEFAULT_RULE = { first: 0, after: [0, 1, 0, 1], grudge: false }; // the same as tit for tat
  function moveOf(k, rule) { return k === 'yours' ? M.makeYours(rule) : M.STRATS[k].move; }
  /* one match. opts: {rounds (fixed) or w (continuation probability), noise, rule, maxRounds}. Returns per-round payoffs and the moves. */
  M.match = function (a, b, opts, r) {
    var fa = moveOf(a, opts.rule), fb = moveOf(b, opts.rule), ma = [], mb = [], sa = 0, sb = 0, n = 0, max = opts.maxRounds || 2000;
    for (;;) {
      var x = fa(ma, mb, r), y = fb(mb, ma, r);
      if (opts.noise && r() < opts.noise) x = 1 - x;
      if (opts.noise && r() < opts.noise) y = 1 - y;
      ma.push(x); mb.push(y); sa += M.payoff(x, y, opts.pay); sb += M.payoff(y, x, opts.pay); n++;
      if (opts.rounds ? n >= opts.rounds : (r() > opts.w || n >= max)) break;
    }
    return { a: ma, b: mb, sa: sa, sb: sb, n: n };
  };
  /* round robin, including each strategy against itself (as in Axelrod's tournaments). reps matches per pair.
     Returns the matrix of average payoffs per round (row against column) and each strategy's average score. */
  M.tournament = function (list, opts, r, reps) {
    reps = reps || 1; var k = list.length, S = [], i, j;
    for (i = 0; i < k; i++) { S.push([]); for (j = 0; j < k; j++) S[i].push(0); }
    for (i = 0; i < k; i++) for (j = i; j < k; j++) {
      var ta = 0, tb = 0, tn = 0;
      for (var q = 0; q < reps; q++) { var m = M.match(list[i], list[j], opts, r); ta += m.sa; tb += m.sb; tn += m.n; }
      S[i][j] = ta / tn; S[j][i] = tb / tn;
      if (i === j) S[i][i] = (ta + tb) / (2 * tn);
    }
    var score = S.map(function (row) { return row.reduce(function (a, b) { return a + b; }, 0) / k; });
    return { list: list, S: S, score: score };
  };
  /* ecological evolution: shares grow in proportion to their average payoff against the current population */
  M.evolve = function (S, x0, gens) {
    var x = x0.slice(), hist = [x.slice()];
    for (var g = 0; g < gens; g++) {
      var f = x.map(function (xi, i) { return S[i].reduce(function (s, v, j) { return s + v * x[j]; }, 0); });
      var avg = x.reduce(function (s, xi, i) { return s + xi * f[i]; }, 0);
      x = x.map(function (xi, i) { return xi * f[i] / avg; });
      hist.push(x.slice());
    }
    return hist;
  };
  /* ---------- 2. grim trigger ---------- */
  M.threshold = function (P) { return (P.T - P.R) / (P.T - P.P); };
  M.coopValue = function (P, d) { return P.R / (1 - d); };
  M.devValue = function (P, d) { return P.T + d * P.P / (1 - d); };

  if (typeof module === 'object' && module.exports) module.exports = M;
  root.GT7M = M;
})(typeof window !== 'undefined' ? window : this);
