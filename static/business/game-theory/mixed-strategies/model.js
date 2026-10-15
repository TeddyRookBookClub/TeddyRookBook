/* Game Theory, Chapter 4: the models behind the interactives (node-testable).
   1. Rock, paper, scissors against "the Reader", a bot that learns your patterns, or against the equilibrium mix.
   2. Mixed equilibria of 2×2 games by the indifference principle (the math is GT.mixed2x2 in ../hub.js).
   3. Penalty kicks as a zero-sum game, with illustrative scoring probabilities. */
(function (root) {
  'use strict';
  var GT = root.GT || (typeof require === 'function' ? require('../hub.js') : null);
  var M = {};
  /* ---------- 1. rock, paper, scissors ----------
     Moves 0 = Rock, 1 = Paper, 2 = Scissors. beats(m) is the move that beats m. Payoff to you: +1 win, 0 draw, −1 loss. */
  M.MOVES = ['Rock', 'Paper', 'Scissors'];
  M.beats = function (m) { return (m + 1) % 3; };
  M.result = function (you, it) { return you === it ? 0 : M.beats(it) === you ? 1 : -1; };
  /* The Reader keeps several simple theories of how you play. Each turns the history into a forecast of your next move.
     A theory's score rises when its forecast was right and fades over time (×0.8 each round). The Reader believes the
     best-scoring theory and plays the move with the highest expected payoff against its forecast. */
  M.THEORIES = [
    { id: 'freq', name: 'you favor some moves', key: function (h) { return ''; } },
    { id: 'after1', name: 'your next move depends on your last one', key: function (h) { return h.length ? 'a' + h[h.length - 1].you : null; } },
    { id: 'after2', name: 'you follow two-move patterns', key: function (h) { return h.length > 1 ? 'b' + h[h.length - 2].you + h[h.length - 1].you : null; } },
    { id: 'outcome', name: 'you react to winning or losing', key: function (h) { if (!h.length) return null; var e = h[h.length - 1]; return 'c' + e.you + (M.result(e.you, e.it) + 1); } },
    { id: 'counter', name: 'you react to its last move', key: function (h) { return h.length ? 'd' + h[h.length - 1].it : null; } }
  ];
  M.newReader = function () { return { counts: {}, scores: M.THEORIES.map(function () { return 0; }), last: null }; };
  function dist(rd, key) {
    var c = rd.counts[key] || [0, 0, 0], tot = c[0] + c[1] + c[2];
    return [0, 1, 2].map(function (m) { return (c[m] + 0.5) / (tot + 1.5); });
  }
  /* the Reader's forecast of your next move: {p: [3], theory: index, conf} */
  M.forecast = function (rd, h) {
    var best = -1, bi = 0, fs = M.THEORIES.map(function (T, k) {
      var key = T.key(h); if (key === null) return null;
      var d = dist(rd, T.id + key); if (rd.scores[k] > best) { best = rd.scores[k]; bi = k; } return d;
    });
    if (!fs[bi]) bi = 0;
    var p = fs[bi] || [1 / 3, 1 / 3, 1 / 3];
    return { p: p, theory: bi, conf: Math.max(p[0], p[1], p[2]), all: fs };
  };
  /* the Reader's move: the best reply to its forecast (ties broken by r) */
  M.readerMove = function (rd, h, r) {
    var f = M.forecast(rd, h), ev = [0, 1, 2].map(function (m) { return f.p.reduce(function (s, q, y) { return s + q * M.result(m, y); }, 0); });
    var mx = Math.max.apply(null, ev), opts = [0, 1, 2].filter(function (m) { return ev[m] >= mx - 1e-9; });
    rd.last = f;
    return opts[Math.floor(r() * opts.length) % opts.length];
  };
  /* after the round: score the theories on what you actually played, then learn from it */
  M.readerLearn = function (rd, h, you) {
    M.THEORIES.forEach(function (T, k) {
      var key = T.key(h); if (key === null) { rd.scores[k] *= 0.8; return; }
      var d = dist(rd, T.id + key), top = d.indexOf(Math.max.apply(null, d));
      rd.scores[k] = rd.scores[k] * 0.8 + (top === you ? 1 : 0);
      var c = rd.counts[T.id + key] || [0, 0, 0]; c[you]++; rd.counts[T.id + key] = c;
    });
  };

  /* ---------- 2. 2×2 games for the indifference principle ---------- */
  M.GAMES = {
    pennies: { name: 'Matching pennies', rows: ['Heads', 'Tails'], cols: ['Heads', 'Tails'], A: [[1, -1], [-1, 1]], B: [[-1, 1], [1, -1]] },
    bos: { name: 'Bach or Stravinsky', rows: ['Bach', 'Stravinsky'], cols: ['Bach', 'Stravinsky'], A: [[2, 0], [0, 1]], B: [[1, 0], [0, 2]] },
    chicken: { name: 'Chicken', rows: ['Swerve', 'Straight'], cols: ['Swerve', 'Straight'], A: [[2, 1], [3, 0]], B: [[2, 3], [1, 0]] },
    inspect: { name: 'Inspection', rows: ['Inspect', 'Trust'], cols: ['Cheat', 'Work'], A: [[2, -1], [-4, 0]], B: [[-3, 0], [2, 0]] },
    tilted: { name: 'Up or down', rows: ['Up', 'Down'], cols: ['Left', 'Right'], A: [[5, 1], [4, 2]], B: [[1, 4], [3, 2]] }
  };
  M.randomGame = function (r) {
    var ri = function () { return Math.floor(r() * 10) - 2; };
    return { name: 'Random game', rows: ['Up', 'Down'], cols: ['Left', 'Right'], A: [[ri(), ri()], [ri(), ri()]], B: [[ri(), ri()], [ri(), ri()]] };
  };
  /* expected payoffs: player 2's from Left and Right when player 1 plays row 0 with prob p; player 1's from Up and Down when player 2 plays column 0 with prob q */
  M.u2Lines = function (g, p) { return [p * g.B[0][0] + (1 - p) * g.B[1][0], p * g.B[0][1] + (1 - p) * g.B[1][1]]; };
  M.u1Lines = function (g, q) { return [q * g.A[0][0] + (1 - q) * g.A[0][1], q * g.A[1][0] + (1 - q) * g.A[1][1]]; };

  /* ---------- 3. penalty kicks ----------
     Kicker: Natural side (N) or Other side (O). Keeper: dives N or O. Entries are the probability of a goal (the kicker's
     payoff; the keeper's is one minus it). The numbers are illustrative, in the range studies report: most penalties go
     in, and a correct guess by the keeper cuts the chance a lot. */
  M.PK = { rows: ['Natural', 'Other'], cols: ['Dive natural', 'Dive other'], A: [[0.70, 0.95], [0.92, 0.58]] };
  M.pkMinimax = function () { return GT.maximin2(M.PK.A); }; // kicker's p = P(Natural) and the value
  M.pkKeeper = function () { // the keeper's minimax mix g = P(dive natural): makes the kicker indifferent
    var A = M.PK.A; return (A[1][1] - A[0][1]) / ((A[0][0] - A[0][1]) - (A[1][0] - A[1][1]));
  };
  M.pkScore = function (p, g) { return GT.expected(M.PK.A, [p, 1 - p], [g, 1 - g]); };

  if (typeof module === 'object' && module.exports) module.exports = M;
  root.GT4M = M;
})(typeof window !== 'undefined' ? window : this);
