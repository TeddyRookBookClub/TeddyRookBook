/* Game Theory, Chapter 6: the models behind the interactives (node-testable).
   1. Game trees (extensive games with perfect information): backward induction, strategies, the strategic form,
      and which Nash equilibria are subgame perfect.
   2. The ultimatum and centipede games against bots modeled loosely on experimental behavior.
   3. Stackelberg leadership versus Cournot (linear demand, as in Chapter 5). */
(function (root) {
  'use strict';
  var GT = root.GT || (typeof require === 'function' ? require('../hub.js') : null);
  var M = {};
  /* A node: { id, pl: 1 | 2 (decision) or 0 (terminal), act: label of the action leading here, kids: [], pay: [u1, u2] } */
  var uid = 0;
  M.node = function (pl, act, kids, pay) { return { id: 'n' + (uid++), pl: pl, act: act || '', kids: kids || [], pay: pay || null }; };
  M.leaf = function (act, u1, u2) { return M.node(0, act, [], [u1, u2]); };
  M.clone = function (t) { return JSON.parse(JSON.stringify(t)); };
  M.walk = function (t, f, parent) { f(t, parent); t.kids.forEach(function (k) { M.walk(k, f, t); }); };
  M.find = function (t, id) { var out = null; M.walk(t, function (n) { if (n.id === id) out = n; }); return out; };
  M.parentOf = function (t, id) { var out = null; M.walk(t, function (n, p) { if (n.id === id) out = p; }); return out; };
  M.depth = function (t) { return t.kids.length ? 1 + Math.max.apply(null, t.kids.map(M.depth)) : 0; };
  /* backward induction: for every decision node, the index of the chosen child and the payoff vector it leads to.
     Ties are broken toward the first action listed (and reported). Returns {choice: {id: k}, value: {id: [u1,u2]}, order: [ids], ties: [ids]} */
  M.solve = function (t) {
    var choice = {}, value = {}, order = [], ties = [];
    (function rec(n) {
      if (!n.kids.length) { value[n.id] = n.pay.slice(); return; }
      n.kids.forEach(rec);
      var i = n.pl - 1, best = -Infinity, bk = 0, tie = false;
      n.kids.forEach(function (k, j) { var v = value[k.id][i]; if (v > best + 1e-9) { best = v; bk = j; tie = false; } else if (Math.abs(v - best) <= 1e-9) tie = true; });
      choice[n.id] = bk; value[n.id] = value[n.kids[bk].id].slice(); order.push(n.id); if (tie) ties.push(n.id);
    })(t);
    return { choice: choice, value: value, order: order, ties: ties };
  };
  /* the path of play implied by a choice map */
  M.path = function (t, choice) { var p = [t.id], n = t; while (n.kids.length) { n = n.kids[choice[n.id]]; p.push(n.id); } return p; };
  /* each player's decision nodes, in a fixed order */
  M.nodesOf = function (t, pl) { var out = []; M.walk(t, function (n) { if (n.pl === pl) out.push(n); }); return out; };
  /* all pure strategies of a player: an action at EVERY one of their decision nodes, reached or not */
  M.strategies = function (t, pl) {
    var ns = M.nodesOf(t, pl), out = [[]];
    ns.forEach(function (n) { var nx = []; out.forEach(function (s) { n.kids.forEach(function (k, j) { nx.push(s.concat([j])); }); }); out = nx; });
    return { nodes: ns, list: out };
  };
  M.stratName = function (S, s) { return s.map(function (j, k) { return S.nodes[k].kids[j].act; }).join(' · ') || '—'; };
  /* the strategic form: payoffs for every pair of strategies (play the tree out with both plans) */
  M.strategicForm = function (t) {
    var S1 = M.strategies(t, 1), S2 = M.strategies(t, 2);
    function outcome(s1, s2) {
      var ch = {}; S1.nodes.forEach(function (n, k) { ch[n.id] = s1[k]; }); S2.nodes.forEach(function (n, k) { ch[n.id] = s2[k]; });
      var n = t; while (n.kids.length) n = n.kids[ch[n.id]]; return n.pay;
    }
    var g = { rows: S1.list.map(function (s) { return M.stratName(S1, s); }), cols: S2.list.map(function (s) { return M.stratName(S2, s); }), A: [], B: [], S1: S1, S2: S2 };
    S1.list.forEach(function (s1, i) { g.A.push([]); g.B.push([]); S2.list.forEach(function (s2) { var u = outcome(s1, s2); g.A[i].push(u[0]); g.B[i].push(u[1]); }); });
    return g;
  };
  /* index of the subgame-perfect strategy profile in the strategic form */
  M.spIndex = function (t, g) {
    var sol = M.solve(t), f = function (S) { return S.list.findIndex(function (s) { return s.every(function (j, k) { return sol.choice[S.nodes[k].id] === j; }); }); };
    return [f(g.S1), f(g.S2)];
  };

  /* ---------- preset trees ---------- */
  M.PRESETS = {
    entry: function () { return M.node(1, '', [M.leaf('Out', 0, 4), M.node(2, 'In', [M.leaf('Fight', -1, 1), M.leaf('Accommodate', 1, 2)])]); },
    commit: function () { // the incumbent (player 2 here moves first? no: keep the entrant as player 1 and the incumbent as player 2)
      return M.node(2, '', [
        M.node(1, 'Invest', [M.leaf('Out', 0, 3), M.node(2, 'In', [M.leaf('Fight', -1, 1.5), M.leaf('Accommodate', 1, 1)])]),
        M.node(1, 'Don’t', [M.leaf('Out', 0, 4), M.node(2, 'In', [M.leaf('Fight', -1, 1), M.leaf('Accommodate', 1, 2)])])
      ]);
    },
    ultimatum: function () { return M.node(1, '', [1, 3, 5].map(function (x) { return M.node(2, 'Offer $' + x, [M.leaf('Accept', 10 - x, x), M.leaf('Reject', 0, 0)]); })); },
    centipede: function () { return M.node(1, '', [M.leaf('Take', 1, 0), M.node(2, 'Pass', [M.leaf('Take', 0, 2), M.node(1, 'Pass', [M.leaf('Take', 3, 1), M.node(2, 'Pass', [M.leaf('Take', 2, 4), M.leaf('Pass', 5, 3)])])])]); },
    stack: function () { // leader chooses 22.5, 30 or 45; follower 15, 22.5 or 30; profits from P = 100 − Q, cost 10, rounded
      return M.node(1, '', [22.5, 30, 45].map(function (q1) { return M.node(2, 'q₁ = ' + q1, [15, 22.5, 30].map(function (q2) { var p = 100 - q1 - q2; return M.leaf('q₂ = ' + q2, Math.round((p - 10) * q1), Math.round((p - 10) * q2)); })); }));
    }
  };
  /* a random tree of depth 2 or 3 with payoffs 0..9 */
  M.randomTree = function (r) {
    function ri(a, b) { return a + Math.floor(r() * (b - a + 1)); }
    var names = { 1: ['L', 'R', 'M'], 2: ['l', 'r', 'm'] };
    function build(pl, depth, act) {
      if (depth === 0 || (depth < 3 && r() < 0.18)) return M.leaf(act, ri(0, 9), ri(0, 9));
      var k = r() < 0.75 ? 2 : 3, kids = []; for (var i = 0; i < k; i++) kids.push(build(pl === 1 ? 2 : 1, depth - 1, names[pl][i]));
      return M.node(pl, act, kids);
    }
    for (var t = 0; t < 50; t++) { var tr = build(1, 3, ''); var s = M.solve(tr); if (!s.ties.length && M.depth(tr) >= 2) return tr; }
    return build(1, 2, '');
  };

  /* ---------- 2. ultimatum and centipede bots ----------
     Experimental regularities (Güth, Schmittberger and Schwarze 1982 and many studies since, reviewed by Camerer 2003):
     proposers most often offer 40 to 50 percent, and offers below about 20 to 30 percent are often rejected.
     The bots below are simple curves with that shape; they are not fitted to any one data set. */
  M.acceptProb = function (share) { // a "typical" responder: chance of accepting an offer that is `share` of the pie
    if (share <= 0) return 0.03;
    return 1 / (1 + Math.exp(-(share - 0.2) * 22)) * 0.97 + 0.02;
  };
  M.typicalOffer = function (r) { // a "typical" proposer's offer out of $10
    var u = r(); return u < 0.08 ? 1 + Math.floor(r() * 2) : u < 0.25 ? 3 : u < 0.6 ? 4 : 5;
  };
  /* the centipede bot passes early and takes later: probability it takes at its k-th turn (k = 1, 2, …) */
  M.centTakeProb = function (k, last) { return last ? 0.75 : [0.08, 0.35, 0.6, 0.8][Math.min(3, k - 1)]; };
  /* centipede piles: at decision t (0-based) the mover can take the big pile; piles double each turn (McKelvey–Palfrey style) */
  M.centPiles = function (t) { return { big: 4 * Math.pow(2, t), small: Math.pow(2, t) }; };

  /* ---------- 3. Stackelberg ---------- */
  M.SP = { a: 100, c: 10 };
  M.follow = function (q1) { return Math.max(0, (M.SP.a - M.SP.c - q1) / 2); };
  M.lprofit = function (q1) { var q2 = M.follow(q1), p = Math.max(0, M.SP.a - q1 - q2); return (p - M.SP.c) * q1; };
  M.fprofit = function (q1) { var q2 = M.follow(q1), p = Math.max(0, M.SP.a - q1 - q2); return (p - M.SP.c) * q2; };
  M.stackelberg = function () { var q1 = (M.SP.a - M.SP.c) / 2; return { q1: q1, q2: M.follow(q1) }; };

  if (typeof module === 'object' && module.exports) module.exports = M;
  root.GT6M = M;
})(typeof window !== 'undefined' ? window : this);
