/* Game Theory, Chapter 1: the models behind the interactives, kept apart from the drawing so node can test them.
   1. "Guess p × the average": a simulated crowd of level-k reasoners.
   2. Computer opponents with personalities for any small matrix game (you are the row player). */
(function (root) {
  'use strict';
  var GT = root.GT || (typeof require === 'function' ? require('../hub.js') : null);
  var M = {};

  /* ---------- 1. the guessing game ----------
     Everyone picks a number in [0, 100]. The target is p × (the average of all guesses, yours included).
     Closest to the target wins (ties share). The crowd reasons in levels:
       level 0 picks at random around an anchor (50 in the first round: uniform on [0, 100]);
       level k picks p^k × anchor (the best reply to a crowd of level k−1, ignoring its own effect on the average);
       "equilibrium" players pick the Nash equilibrium (0 if p < 1, 100 if p > 1).
     With learning on, the anchor in later rounds is the previous round's average (Nagel 1995 found that later
     guesses were best explained as a few steps of reasoning starting from the previous average). */
  M.LEVELS = ['L0', 'L1', 'L2', 'L3', 'L4', 'Eq'];
  M.CROWDS = {
    beginners: { name: 'Beginners', mix: [0.55, 0.32, 0.1, 0.03, 0, 0] },
    typical: { name: 'Typical crowd', mix: [0.3, 0.35, 0.22, 0.08, 0.03, 0.02] },
    experts: { name: 'Game theorists', mix: [0.04, 0.14, 0.24, 0.24, 0.16, 0.18] },
    rational: { name: 'All rational', mix: [0, 0, 0, 0, 0, 1] }
  };
  M.eq = function (p) { return p < 1 ? 0 : p > 1 ? 100 : 50; };
  M.levelGuess = function (k, p, anchor) { return Math.max(0, Math.min(100, anchor * Math.pow(p, k))); };
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  /* build a crowd of n players: their levels (deterministic shares, so a preset always has the same mix) */
  M.makeCrowd = function (n, mix) {
    var out = [], tot = mix.reduce(function (a, b) { return a + b; }, 0), acc = 0, k = 0;
    for (var i = 0; i < n; i++) {
      var pos = (i + 0.5) / n * tot; acc = 0;
      for (k = 0; k < mix.length; k++) { acc += mix[k]; if (pos < acc) break; }
      out.push(Math.min(k, mix.length - 1));
    }
    return out;
  };
  /* the crowd's guesses for one round */
  M.guesses = function (levels, p, anchor, noise, r) {
    var lo = Math.max(0, 2 * anchor - 100), hi = Math.min(100, 2 * anchor); // level 0: uniform, centered on the anchor
    return levels.map(function (L) {
      var g;
      if (L === 0) g = lo + (hi - lo) * r();
      else if (L === 5) g = M.eq(p) + (noise > 0 ? Math.abs(gauss(r)) * noise * 0.15 * (p < 1 ? 1 : -1) : 0);
      else g = M.levelGuess(L, p, anchor) + gauss(r) * noise;
      return Math.round(Math.max(0, Math.min(100, g)) * 10) / 10;
    });
  };
  /* score a round. all = every guess (yours last). Returns average, target, winners (indices), distances, your place. */
  M.score = function (all, p) {
    var n = all.length, avg = all.reduce(function (a, b) { return a + b; }, 0) / n, t = p * avg;
    var d = all.map(function (g) { return Math.abs(g - t); }), best = Math.min.apply(null, d);
    var winners = []; d.forEach(function (x, i) { if (x <= best + 1e-9) winners.push(i); });
    var you = n - 1, place = 1 + d.filter(function (x) { return x < d[you] - 1e-9; }).length;
    return { avg: avg, target: t, winners: winners, dist: d, best: best, place: place, youWin: winners.indexOf(you) >= 0, n: n };
  };

  /* ---------- 2. computer opponents ----------
     Each takes the game g (row = you, column = it) and the history [{i, j}] and returns {j, why}. */
  function argmaxAll(v) { var b = -Infinity, o = []; v.forEach(function (x, k) { if (x > b + 1e-9) { b = x; o = [k]; } else if (Math.abs(x - b) <= 1e-9) o.push(k); }); return o; }
  function pick(list, r) { return list[Math.floor(r() * list.length) % list.length]; }
  function colPay(g, i, j) { return g.B[i][j]; }
  function nm(g, j) { return g.cols[j]; }
  M.BOTS = {
    copycat: { name: 'Copycat', blurb: 'Plays the column that matches the row you played last time (first, second or third).' },
    greedy: { name: 'Greedy', blurb: 'Assumes you’ll repeat your last move and plays its best reply to it.' },
    cautious: { name: 'Cautious', blurb: 'Plays it safe: picks the column whose worst possible payoff is highest (maximin).' },
    hopeful: { name: 'Hopeful', blurb: 'Chases the jackpot: picks the column with the biggest possible payoff.' },
    learner: { name: 'Learner', blurb: 'Counts how often you’ve played each row and best replies to those odds.' },
    rational: { name: 'Rational', blurb: 'Uses a dominant action if it has one; if you have one, expects you to use it; otherwise looks for an equilibrium.' },
    wild: { name: 'Wild card', blurb: 'Picks a column at random, every time.' }
  };
  M.botMove = function (kind, g, hist, r) {
    var nr = g.rows.length, nc = g.cols.length, last = hist.length ? hist[hist.length - 1] : null, j, vals, k;
    function brTo(i) { vals = []; for (var jj = 0; jj < nc; jj++) vals.push(colPay(g, i, jj)); return argmaxAll(vals); }
    function brToMix(x) { vals = []; for (var jj = 0; jj < nc; jj++) { var s = 0; for (var ii = 0; ii < nr; ii++) s += x[ii] * g.B[ii][jj]; vals.push(s); } return argmaxAll(vals); }
    switch (kind) {
      case 'copycat':
        if (!last) { j = Math.floor(r() * nc); return { j: j, why: 'First round: nothing to copy yet, so it picks ' + nm(g, j) + ' at random.' }; }
        j = Math.min(last.i, nc - 1); return { j: j, why: 'You played ' + g.rows[last.i] + ' last time, so it plays the matching column, ' + nm(g, j) + '.' };
      case 'greedy':
        if (!last) { j = Math.floor(r() * nc); return { j: j, why: 'First round: it has no idea what you’ll do, so it guesses ' + nm(g, j) + '.' }; }
        var b = brTo(last.i); j = pick(b, r);
        return { j: j, why: 'You played ' + g.rows[last.i] + ' last time. If you do it again, ' + nm(g, j) + ' pays it ' + GT.num(g.B[last.i][j]) + ', its best.' };
      case 'cautious':
        vals = []; for (j = 0; j < nc; j++) { var m = Infinity; for (k = 0; k < nr; k++) m = Math.min(m, g.B[k][j]); vals.push(m); }
        var c = argmaxAll(vals); j = pick(c, r);
        return { j: j, why: 'The worst it can get from ' + nm(g, j) + ' is ' + GT.num(vals[j]) + ', better than the worst case of any other column.' };
      case 'hopeful':
        vals = []; for (j = 0; j < nc; j++) { var mx = -Infinity; for (k = 0; k < nr; k++) mx = Math.max(mx, g.B[k][j]); vals.push(mx); }
        var h = argmaxAll(vals); j = pick(h, r);
        return { j: j, why: nm(g, j) + ' could pay it ' + GT.num(vals[j]) + ', the biggest number in its column of the table.' };
      case 'learner':
        var cnt = []; for (k = 0; k < nr; k++) cnt.push(1); hist.forEach(function (e) { cnt[e.i]++; });
        var tot = cnt.reduce(function (a, b2) { return a + b2; }, 0), x = cnt.map(function (q) { return q / tot; });
        var bl = brToMix(x); j = pick(bl, r);
        return { j: j, why: 'It thinks you play ' + g.rows.map(function (rw, ii) { return rw + ' ' + Math.round(x[ii] * 100) + '%'; }).join(', ') + '. Against that, ' + nm(g, j) + ' pays it most on average.' };
      case 'rational':
        var al = GT.aliveOf(g);
        for (j = 0; j < nc; j++) { var dom = true; for (k = 0; k < nc; k++) if (k !== j && !GT.dominates(g, 2, j, k, al)) dom = false; if (dom && nc > 1) return { j: j, why: nm(g, j) + ' strictly dominates its other columns: it pays more whatever you do.' }; }
        for (var i = 0; i < nr; i++) { var d1 = true; for (k = 0; k < nr; k++) if (k !== i && !GT.dominates(g, 1, i, k, al)) d1 = false; if (d1 && nr > 1) { var bb = brTo(i); j = pick(bb, r); return { j: j, why: 'Your ' + g.rows[i] + ' dominates your other rows, so it expects ' + g.rows[i] + ' and replies ' + nm(g, j) + '.' }; } }
        var it = GT.iesds(g);
        if (it.solved) { j = it.alive.cols[0]; return { j: j, why: 'Crossing out dominated actions one by one leaves only ' + g.rows[it.alive.rows[0]] + ' and ' + nm(g, j) + '.' }; }
        var ne = GT.pureNE(g);
        if (ne.length === 1) { j = ne[0][1]; return { j: j, why: 'The game has one Nash equilibrium, (' + g.rows[ne[0][0]] + ', ' + nm(g, j) + '), so it plays its part.' }; }
        var cnt2 = []; for (k = 0; k < nr; k++) cnt2.push(1); hist.forEach(function (e) { cnt2[e.i]++; });
        var t2 = cnt2.reduce(function (a, b2) { return a + b2; }, 0), x2 = cnt2.map(function (q) { return q / t2; });
        var br2 = brToMix(x2); j = pick(br2, r);
        return { j: j, why: (ne.length ? 'Several equilibria and no way to agree, ' : 'No pure equilibrium, ') + 'so it best replies to how you have played so far: ' + nm(g, j) + '.' };
      default:
        j = Math.floor(r() * nc); return { j: j, why: 'A coin flip (or a die roll) says ' + nm(g, j) + '.' };
    }
  };

  /* preset games for the editor. Payoffs: row (you) first. */
  M.GAMES = {
    pd: { name: 'Prisoner’s dilemma', rows: ['Quiet', 'Fink'], cols: ['Quiet', 'Fink'], A: [[2, 0], [3, 1]], B: [[2, 3], [0, 1]] },
    bos: { name: 'Bach or Stravinsky', rows: ['Bach', 'Stravinsky'], cols: ['Bach', 'Stravinsky'], A: [[2, 0], [0, 1]], B: [[1, 0], [0, 2]] },
    stag: { name: 'Stag hunt', rows: ['Stag', 'Hare'], cols: ['Stag', 'Hare'], A: [[4, 0], [3, 3]], B: [[4, 3], [0, 3]] },
    pennies: { name: 'Matching pennies', rows: ['Heads', 'Tails'], cols: ['Heads', 'Tails'], A: [[1, -1], [-1, 1]], B: [[-1, 1], [1, -1]] },
    rps: { name: 'Rock, paper, scissors', rows: ['Rock', 'Paper', 'Scissors'], cols: ['Rock', 'Paper', 'Scissors'], A: [[0, -1, 1], [1, 0, -1], [-1, 1, 0]], B: [[0, 1, -1], [-1, 0, 1], [1, -1, 0]] },
    three: { name: 'A 3×3 to explore', rows: ['Top', 'Middle', 'Bottom'], cols: ['Left', 'Center', 'Right'], A: [[4, 1, 2], [3, 3, 1], [1, 0, 5]], B: [[2, 3, 1], [1, 4, 0], [3, 1, 2]] }
  };

  if (typeof module === 'object' && module.exports) module.exports = M;
  root.GT1M = M;
})(typeof window !== 'undefined' ? window : this);
