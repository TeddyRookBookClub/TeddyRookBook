/* Game Theory, Chapter 2: the models behind the interactives (node-testable).
   1. Puzzles for iterated elimination of strictly dominated actions (IESDS), built backward so they always solve.
   2. Prisoner's dilemma bots.
   3. A public-goods game in groups of four, with and without punishment (in the spirit of Fehr and Gächter 2000). */
(function (root) {
  'use strict';
  var GT = root.GT || (typeof require === 'function' ? require('../hub.js') : null);
  var M = {};
  function ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  M.NAMES = { 3: { rows: ['T', 'M', 'B'], cols: ['L', 'C', 'R'] }, 4: { rows: ['A', 'B', 'C', 'D'], cols: ['W', 'X', 'Y', 'Z'] } };

  /* A dominance-solvable n×n game. Built in reverse: start from the surviving cell and add actions one at a time,
     each strictly dominated (against the opponent actions present when it is added) by an action already there.
     Removing them in the opposite order is a valid elimination sequence that ends at one cell, and strict IESDS gives
     the same result in any order. Payoffs stay in 0..9. */
  M.genSolvable = function (n, r) {
    for (var tries = 0; tries < 500; tries++) {
      var A = [[ri(r, 2, 7)]], B = [[ri(r, 2, 7)]], R = 1, Cn = 1, ok = true;
      var order = []; for (var k = 0; k < n - 1; k++) { order.push(1); order.push(2); }
      shuffle(order, r);
      for (var s = 0; s < order.length && ok; s++) {
        if (order[s] === 1) { // add a row dominated by an existing row
          var cand = []; for (var d = 0; d < R; d++) if (Math.min.apply(null, A[d]) >= 1) cand.push(d);
          if (!cand.length) { ok = false; break; }
          var dd = cand[Math.floor(r() * cand.length)];
          A.push(A[dd].map(function (v) { return ri(r, Math.max(0, v - 4), v - 1); }));
          B.push(A[0].map(function () { return ri(r, 0, 9); }));
          R++;
        } else { // add a column dominated by an existing column
          var cc = []; for (var e = 0; e < Cn; e++) { var mn = Infinity; for (var i = 0; i < R; i++) mn = Math.min(mn, B[i][e]); if (mn >= 1) cc.push(e); }
          if (!cc.length) { ok = false; break; }
          var de = cc[Math.floor(r() * cc.length)];
          for (i = 0; i < R; i++) { B[i].push(ri(r, Math.max(0, B[i][de] - 4), B[i][de] - 1)); A[i].push(ri(r, 0, 9)); }
          Cn++;
        }
      }
      if (!ok) continue;
      // shuffle the display order of rows and columns
      var pr = shuffle(GT.range(n), r), pc = shuffle(GT.range(n), r);
      var g = { rows: M.NAMES[n].rows.slice(), cols: M.NAMES[n].cols.slice(), A: [], B: [], p1: 'Row', p2: 'Column' };
      for (i = 0; i < n; i++) { g.A.push([]); g.B.push([]); for (var j = 0; j < n; j++) { g.A[i].push(A[pr[i]][pc[j]]); g.B[i].push(B[pr[i]][pc[j]]); } }
      var res = GT.iesds(g);
      if (res.solved && res.steps.length === 2 * (n - 1)) return g;
    }
    return null;
  };
  /* a random game with payoffs 0..9: may or may not be solvable by dominance */
  M.genRandom = function (n, r) {
    var g = { rows: M.NAMES[n].rows.slice(), cols: M.NAMES[n].cols.slice(), A: [], B: [], p1: 'Row', p2: 'Column' };
    for (var i = 0; i < n; i++) { g.A.push([]); g.B.push([]); for (var j = 0; j < n; j++) { g.A[i].push(ri(r, 0, 9)); g.B[i].push(ri(r, 0, 9)); } }
    return g;
  };
  /* why action b of player pl is NOT strictly dominated now: for each other alive action a, an opponent action where a fails to beat b */
  M.counterexamples = function (g, pl, b, alive) {
    var own = pl === 1 ? alive.rows : alive.cols, opp = pl === 1 ? alive.cols : alive.rows, out = [];
    own.forEach(function (a) {
      if (a === b) return;
      for (var k = 0; k < opp.length; k++) {
        var o = opp[k], ua = pl === 1 ? g.A[a][o] : g.B[o][a], ub = pl === 1 ? g.A[b][o] : g.B[o][b];
        if (ua <= ub) { out.push({ a: a, o: o, ua: ua, ub: ub }); return; }
      }
    });
    return out;
  };

  /* ---------- 2. prisoner's dilemma bots (Osborne's payoffs) ---------- */
  M.PD = { rows: ['Quiet', 'Fink'], cols: ['Quiet', 'Fink'], A: [[2, 0], [3, 1]], B: [[2, 3], [0, 1]], p1: 'You', p2: 'Bot' };
  M.PDBOTS = {
    saint: { name: 'Saint', blurb: 'Always stays quiet, whatever you do.' },
    shark: { name: 'Shark', blurb: 'Always finks.' },
    mirror: { name: 'Mirror', blurb: 'Stays quiet in round 1, then copies your previous move (tit for tat).' },
    grudger: { name: 'Grudger', blurb: 'Stays quiet until you fink once, then finks forever.' },
    coin: { name: 'Coin', blurb: 'Flips a fair coin every round.' }
  };
  M.pdMove = function (kind, hist, r) { // hist: [{you, bot}] with 0 = Quiet, 1 = Fink; returns the bot's action
    var n = hist.length;
    switch (kind) {
      case 'saint': return 0;
      case 'shark': return 1;
      case 'mirror': return n ? hist[n - 1].you : 0;
      case 'grudger': return hist.some(function (h) { return h.you === 1; }) ? 1 : 0;
      default: return r() < 0.5 ? 0 : 1;
    }
  };

  /* ---------- 3. the public-goods game ----------
     Groups of 4, 20 tokens each round. Tokens put in the project are multiplied by 1.6 and shared equally, so each token
     you contribute returns 0.4 to you (and 0.4 to each of the other three). Earnings = 20 − c_i + 0.4 × Σ c.
     With punishment: after seeing contributions, each member may assign up to 5 points to each other member; a point
     costs the punisher 1 token and the target 3 tokens.
     Behavior (simplified, with the types found by Fischbacher, Gächter and Fehr 2001):
       conditional cooperators contribute about 85% of what the others gave last round (plus noise);
       free riders contribute 0; altruists contribute 16 to 20.
     With punishment, cooperators punish members who gave less than they did. Being punished makes a member afraid
     (fear grows with the points received and fades by 10% a round): a free rider then gives fear × the others' average,
     and a conditional cooperator stops drifting down and matches the group, plus a little more. */
  M.E = 20; M.MPCR = 0.4;
  M.earn = function (cs, i) { var tot = cs.reduce(function (a, b) { return a + b; }, 0); return M.E - cs[i] + M.MPCR * tot; };
  M.TYPES = ['cc', 'fr', 'alt'];
  M.makeAgent = function (type, r) { return { type: type, c: 0, fear: 0 }; };
  /* a bot's contribution this round. fear (0 to 1) grows when a member is punished and fades slowly */
  M.botContribution = function (ag, round, othersAvgLast, punishOn, r) {
    var c, noise = (r() - 0.5) * 3;
    if (ag.type === 'alt') c = 16 + 4 * r();
    else if (ag.type === 'fr') c = punishOn && round > 0 ? ag.fear * othersAvgLast : 0;
    else if (round === 0) c = 8 + 8 * r();
    else c = punishOn ? Math.max(othersAvgLast, ag.c) + 1.5 * ag.fear + noise : 0.85 * othersAvgLast + noise;
    return Math.round(Math.max(0, Math.min(M.E, c)));
  };
  /* punishment points that bot `i` assigns to each member, given this round's contributions */
  M.botPunish = function (ag, i, cs, r) {
    return cs.map(function (cj, j) {
      if (j === i || ag.type === 'fr') return 0;
      var gap = cs[i] - cj; if (gap < 4) return 0;
      return Math.min(5, Math.round(gap / 4 + r() * 0.8));
    });
  };
  /* a round in two steps, so a human can see the contributions before punishing.
     contribute: everyone's contribution (human: the number humanC at index of the null agent) */
  M.contribute = function (agents, round, last, punishOn, r, humanC) {
    var n = agents.length;
    return agents.map(function (ag, i) {
      if (!ag) return humanC;
      var others = last ? (last.c.reduce(function (a, b) { return a + b; }, 0) - last.c[i]) / (n - 1) : 10;
      return M.botContribution(ag, round, others, punishOn, r);
    });
  };
  /* settle: punishment (bots by rule, the human by humanP, points per member) and payoffs; updates the bots' memory */
  M.settle = function (agents, cs, punishOn, r, humanP) {
    var base = cs.map(function (c, i) { return M.earn(cs, i); }), pts = [], recv = cs.map(function () { return 0; }), spent = cs.map(function () { return 0; });
    if (punishOn) {
      agents.forEach(function (ag, i) {
        var row = ag ? M.botPunish(ag, i, cs, r) : (humanP || cs.map(function () { return 0; }));
        pts.push(row); row.forEach(function (q, j) { spent[i] += q; recv[j] += q; });
      });
    }
    var pay = base.map(function (b, i) { return b - spent[i] - 3 * recv[i]; });
    agents.forEach(function (ag, i) { if (ag) { ag.c = cs[i]; ag.fear = punishOn ? Math.min(1, ag.fear * 0.9 + 0.12 * recv[i]) : 0; } });
    return { c: cs, base: base, pts: pts, recv: recv, spent: spent, pay: pay };
  };
  M.round = function (agents, round, last, punishOn, r, human) {
    var cs = M.contribute(agents, round, last, punishOn, r, human ? human.c : 0);
    return M.settle(agents, cs, punishOn, r, human ? human.p : null);
  };
  /* a whole session of bots: g groups of 4 with a share of free riders, T rounds; returns average contribution per round */
  M.session = function (groups, frShare, punishOn, T, r) {
    var gs = [], avg = [];
    for (var k = 0; k < groups; k++) {
      var ags = []; for (var m = 0; m < 4; m++) { var u = (k * 4 + m + 0.5) / (groups * 4); ags.push(M.makeAgent(u < frShare ? 'fr' : u < frShare + 0.12 ? 'alt' : 'cc', r)); }
      shuffle(ags, r); gs.push({ ags: ags, last: null });
    }
    for (var t = 0; t < T; t++) {
      var s = 0; gs.forEach(function (G) { G.last = M.round(G.ags, t, G.last, punishOn, r); s += G.last.c.reduce(function (a, b) { return a + b; }, 0); });
      avg.push(s / (groups * 4));
    }
    return avg;
  };

  if (typeof module === 'object' && module.exports) module.exports = M;
  root.GT2M = M;
})(typeof window !== 'undefined' ? window : this);
