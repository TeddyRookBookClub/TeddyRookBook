/* Game Theory, Chapter 3: the models behind the interactives (node-testable).
   1. Named games and random games for finding pure-strategy Nash equilibria with the underline method.
   2. Equilibrium selection in 2×2 games: Pareto ranking and risk dominance (Harsanyi and Selten 1988).
   3. Focal-point puzzles (Schelling 1960) with simulated partners. */
(function (root) {
  'use strict';
  var GT = root.GT || (typeof require === 'function' ? require('../hub.js') : null);
  var M = {};
  M.GAMES = {
    coord: { name: 'Coordination', story: 'Two friends pick a café without being able to call. Both like café A better, but meeting matters most.', rows: ['Café A', 'Café B'], cols: ['Café A', 'Café B'], A: [[2, 0], [0, 1]], B: [[2, 0], [0, 1]] },
    bos: { name: 'Bach or Stravinsky', story: 'Two friends want to go to a concert together; player 1 prefers Bach, player 2 Stravinsky (Osborne’s “battle of the sexes”).', rows: ['Bach', 'Stravinsky'], cols: ['Bach', 'Stravinsky'], A: [[2, 0], [0, 1]], B: [[1, 0], [0, 2]] },
    chicken: { name: 'Chicken', story: 'Two drivers race toward each other. Swerving alone is embarrassing; both going straight is a disaster.', rows: ['Swerve', 'Straight'], cols: ['Swerve', 'Straight'], A: [[2, 1], [3, 0]], B: [[2, 3], [1, 0]] },
    stag: { name: 'Stag hunt', story: 'Two hunters can catch a stag only together; either can catch a hare alone. A stag is worth more, but the hare is safe.', rows: ['Stag', 'Hare'], cols: ['Stag', 'Hare'], A: [[4, 0], [3, 3]], B: [[4, 3], [0, 3]] },
    pennies: { name: 'Matching pennies', story: 'Player 1 wins if the coins match, player 2 wins if they differ. Whatever happens, someone wants to switch.', rows: ['Heads', 'Tails'], cols: ['Heads', 'Tails'], A: [[1, -1], [-1, 1]], B: [[-1, 1], [1, -1]] },
    pd: { name: 'Prisoner’s dilemma', story: 'The game from Chapter 2. Its only equilibrium is the dominant-strategy one.', rows: ['Quiet', 'Fink'], cols: ['Quiet', 'Fink'], A: [[2, 0], [3, 1]], B: [[2, 3], [0, 1]] }
  };
  M.NAMES = { 2: { rows: ['T', 'B'], cols: ['L', 'R'] }, 3: { rows: ['T', 'M', 'B'], cols: ['L', 'C', 'R'] }, 4: { rows: ['A', 'B', 'C', 'D'], cols: ['W', 'X', 'Y', 'Z'] } };
  function ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  /* a random n×n game with payoffs 0..9. want: 'any', 'some' (at least one pure NE) or 'none' (no pure NE) */
  M.genRandom = function (n, r, want) {
    for (var t = 0; t < 4000; t++) {
      var g = { rows: M.NAMES[n].rows.slice(), cols: M.NAMES[n].cols.slice(), A: [], B: [], p1: 'Row', p2: 'Column' };
      for (var i = 0; i < n; i++) { g.A.push([]); g.B.push([]); for (var j = 0; j < n; j++) { g.A[i].push(ri(r, 0, 9)); g.B[i].push(ri(r, 0, 9)); } }
      var k = GT.pureNE(g).length;
      if (want === 'some' && k === 0) continue;
      if (want === 'none' && k > 0) continue;
      return g;
    }
    return null;
  };
  /* every best-response mark: u1 marks [i,j] where row i is a best response to column j; u2 likewise */
  M.marks = function (g) {
    var u1 = [], u2 = [];
    g.cols.forEach(function (c, j) { GT.br1(g, j).forEach(function (i) { u1.push(i + ',' + j); }); });
    g.rows.forEach(function (r, i) { GT.br2(g, i).forEach(function (j) { u2.push(i + ',' + j); }); });
    return { u1: u1, u2: u2 };
  };
  /* where each player would rather be, from cell (i, j): the best row in column j and the best column in row i (or -1 if staying is best) */
  M.deviation = function (g, i, j) {
    var b1 = GT.br1(g, j), b2 = GT.br2(g, i);
    return { row: b1.indexOf(i) >= 0 ? -1 : b1[0], col: b2.indexOf(j) >= 0 ? -1 : b2[0], gain1: b1.indexOf(i) >= 0 ? 0 : g.A[b1[0]][j] - g.A[i][j], gain2: b2.indexOf(j) >= 0 ? 0 : g.B[i][b2[0]] - g.B[i][j] };
  };
  /* a 2×2 game with two strict equilibria on a diagonal: which is Pareto-better, and which risk-dominant?
     Risk dominance (Harsanyi and Selten): compare the products of the losses from deviating. */
  M.selection = function (g) {
    var ne = GT.pureNE(g); if (g.rows.length !== 2 || ne.length !== 2) return null;
    var e = ne.map(function (x) {
      var i = x[0], j = x[1];
      return { cell: x, u: [g.A[i][j], g.B[i][j]], loss: (g.A[i][j] - g.A[1 - i][j]) * (g.B[i][j] - g.B[i][1 - j]) };
    });
    var pareto = null;
    if (e[0].u[0] >= e[1].u[0] && e[0].u[1] >= e[1].u[1] && (e[0].u[0] > e[1].u[0] || e[0].u[1] > e[1].u[1])) pareto = 0;
    else if (e[1].u[0] >= e[0].u[0] && e[1].u[1] >= e[0].u[1] && (e[1].u[0] > e[0].u[0] || e[1].u[1] > e[0].u[1])) pareto = 1;
    var risk = e[0].loss > e[1].loss ? 0 : e[1].loss > e[0].loss ? 1 : null;
    return { eq: e, pareto: pareto, risk: risk };
  };
  /* in the stag hunt: the smallest probability q that the partner hunts stag for which Stag is a best response */
  M.stagThreshold = function (g) { // row payoffs: Stag row 0, Hare row 1; partner's Stag is column 0
    var a = g.A[0][0], b = g.A[0][1], c = g.A[1][0], d = g.A[1][1]; // q a + (1-q) b >= q c + (1-q) d
    return (d - b) / ((a - c) + (d - b));
  };

  /* ---------- 3. focal points ----------
     Partners are simulated. Where Schelling reported his students' answers (The Strategy of Conflict, 1960, ch. 3,
     as summarized on Wikipedia), the weights follow them; the other puzzles use plain guesses about salience. */
  M.FOCAL = [
    { id: 'coin', q: 'Name “heads” or “tails”. You both win if you name the same.', opts: ['Heads', 'Tails'], w: [0.7, 0.3], note: 'In Schelling’s informal survey, 16 of 22 people in one group and 15 of 22 in another chose heads.', real: true },
    { id: 'money', q: 'Split $100: each of you writes a claim. If the claims add up to $100 or less, each gets their claim; if more, both get nothing.', opts: ['$30', '$40', '$49', '$50', '$51', '$60', '$70'], w: [0.02, 0.03, 0.03, 0.86, 0.02, 0.03, 0.01], pay: 'claim', note: 'Schelling reports that 36 of 40 people claimed exactly $50. Every pair of claims adding up to $100 is an equilibrium; 50–50 is the one that stands out.', real: true },
    { id: 'nyc', q: 'You must meet a stranger in New York City tomorrow. You can’t communicate. Where do you go?', opts: ['Grand Central Terminal', 'Empire State Building', 'Times Square', 'Statue of Liberty', 'Central Park', 'Penn Station'], w: [0.42, 0.22, 0.16, 0.05, 0.1, 0.05], note: 'Schelling’s students, mostly from New Haven, most often chose the information booth at Grand Central Terminal (where their trains arrived), at noon.', real: true },
    { id: 'time', q: 'Same meeting, but you’ve agreed on the place. What time do you show up?', opts: ['9:00 am', '10:00 am', '12:00 noon', '1:00 pm', '3:00 pm', '6:00 pm'], w: [0.06, 0.06, 0.74, 0.05, 0.05, 0.04], note: 'Noon was by far the most common answer in Schelling’s survey.', real: true },
    { id: 'grid', q: 'Click a square. You win if your partner clicks the same square.', opts: ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15'], w: [0.06, 0.02, 0.02, 0.03, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.62, 0.02, 0.03, 0.02, 0.02, 0.04], grid: 10, note: 'There is no data here, only a guess: most people pick the one square that is different. That is what a focal point is.', real: false },
    { id: 'number', q: 'Write a positive whole number. You win if your partner writes the same number.', opts: ['1', '2', '3', '7', '10', '13', '42', '100'], w: [0.45, 0.06, 0.07, 0.12, 0.12, 0.04, 0.06, 0.08], note: 'A guess, not data: 1 is the first positive number, so it tends to stand out. Your own answer is evidence about what others will say.', real: false }
  ];
  M.focalPartner = function (puz, r) { var u = r(), s = 0; for (var k = 0; k < puz.w.length; k++) { s += puz.w[k]; if (u < s) return k; } return puz.w.length - 1; };

  if (typeof module === 'object' && module.exports) module.exports = M;
  root.GT3M = M;
})(typeof window !== 'undefined' ? window : this);
