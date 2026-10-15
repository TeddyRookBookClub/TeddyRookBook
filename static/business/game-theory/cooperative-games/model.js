/* Game Theory, Chapter 13 (Coalitions, the Core and the Shapley Value): characteristic functions, the Shapley value
   by orders of arrival and by formula, the core of a three-player game as a polygon, and voting power.
   window.GT13M in the browser, module.exports in node (tested in /tmp/work_gt2/test/gt13.test.js).
   A game is {n, v: [...]} with v[mask] the worth of the coalition whose members are the bits of mask (v[0] = 0). */
(function (root) {
  'use strict';
  function bits(m) { var c = 0; while (m) { c += m & 1; m >>= 1; } return c; }
  function fact(k) { var f = 1; for (var i = 2; i <= k; i++) f *= i; return f; }
  function orders(n) { var out = []; (function rec(p, used) { if (p.length === n) { out.push(p.slice()); return; } for (var i = 0; i < n; i++) if (!(used & (1 << i))) { p.push(i); rec(p, used | (1 << i)); p.pop(); } })([], 0); return out; }
  /* marginal contributions along one order of arrival */
  function marginals(g, order) { var S = 0, mc = []; order.forEach(function (i) { mc[i] = g.v[S | (1 << i)] - g.v[S]; S |= 1 << i; }); return mc; }
  /* Shapley value by the formula: sum over coalitions S without i of |S|!(n−|S|−1)!/n! · (v(S ∪ i) − v(S)) */
  function shapley(g) {
    var n = g.n, phi = [], N = fact(n);
    for (var i = 0; i < n; i++) { var s = 0; for (var S = 0; S < (1 << n); S++) { if (S & (1 << i)) continue; var k = bits(S); s += fact(k) * fact(n - k - 1) / N * (g.v[S | (1 << i)] - g.v[S]); } phi.push(s); }
    return phi;
  }
  function shapleyByOrders(g) { var os = orders(g.n), sum = []; for (var i = 0; i < g.n; i++) sum[i] = 0; os.forEach(function (o) { var mc = marginals(g, o); mc.forEach(function (x, i) { sum[i] += x; }); }); return sum.map(function (s) { return s / os.length; }); }
  function inCore(g, x, tol) { tol = tol || 1e-9; var n = g.n, full = (1 << n) - 1, tot = 0; x.forEach(function (a) { tot += a; }); if (Math.abs(tot - g.v[full]) > 1e-6) return false; for (var S = 1; S < full; S++) { var s = 0; for (var i = 0; i < n; i++) if (S & (1 << i)) s += x[i]; if (s < g.v[S] - tol) return false; } return true; }
  function objections(g, x) { var n = g.n, full = (1 << n) - 1, out = []; for (var S = 1; S < full; S++) { var s = 0; for (var i = 0; i < n; i++) if (S & (1 << i)) s += x[i]; if (s < g.v[S] - 1e-9) out.push({ S: S, gets: s, could: g.v[S] }); } return out; }
  function superadditive(g) { var n = g.n; for (var A = 1; A < (1 << n); A++) for (var B = 1; B < (1 << n); B++) if (!(A & B) && g.v[A | B] < g.v[A] + g.v[B] - 1e-9) return false; return true; }
  function convex(g) { var n = g.n; for (var A = 0; A < (1 << n); A++) for (var B = 0; B < (1 << n); B++) if (g.v[A | B] + g.v[A & B] < g.v[A] + g.v[B] - 1e-9) return false; return true; }
  function nullPlayers(g) { var n = g.n, out = []; for (var i = 0; i < n; i++) { var z = true; for (var S = 0; S < (1 << n); S++) if (!(S & (1 << i)) && Math.abs(g.v[S | (1 << i)] - g.v[S]) > 1e-9) z = false; if (z) out.push(i); } return out; }
  function symmetricPairs(g) { var n = g.n, out = []; for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) { var ok = true; for (var S = 0; S < (1 << n); S++) if (!(S & (1 << i)) && !(S & (1 << j)) && Math.abs(g.v[S | (1 << i)] - g.v[S | (1 << j)]) > 1e-9) ok = false; if (ok) out.push([i, j]); } return out; }

  /* ---------- the core of a three-player game, in the triangle of imputations ----------
     Imputations: x_i ≥ v(i), x1 + x2 + x3 = v(N). With E = v(N) − Σ v(i) > 0, write x_i = v(i) + E·l_i (l on the simplex).
     The pair constraint x_i + x_j ≥ v(ij) becomes l_k ≤ 1 − (v(ij) − v(i) − v(j))/E. The core is the triangle cut by these. */
  function core3(g) {
    var v = g.v, E = v[7] - v[1] - v[2] - v[4];
    if (!(E > 1e-12)) return { E: E, poly: [], empty: !(Math.abs(E) < 1e-12 && v[3] <= v[1] + v[2] + 1e-9 && v[5] <= v[1] + v[4] + 1e-9 && v[6] <= v[2] + v[4] + 1e-9) };
    var cap = [1 - (v[6] - v[2] - v[4]) / E, 1 - (v[5] - v[1] - v[4]) / E, 1 - (v[3] - v[1] - v[2]) / E]; // l1 ≤ cap0 (from pair 23), l2 ≤ cap1 (pair 13), l3 ≤ cap2 (pair 12)
    var poly = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (var k = 0; k < 3; k++) {
      var out = [];
      for (var a = 0; a < poly.length; a++) {
        var P = poly[a], Q = poly[(a + 1) % poly.length], inP = P[k] <= cap[k] + 1e-12, inQ = Q[k] <= cap[k] + 1e-12;
        if (inP) out.push(P);
        if (inP !== inQ) { var t = (cap[k] - P[k]) / (Q[k] - P[k]); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1]), P[2] + t * (Q[2] - P[2])]); }
      }
      poly = out; if (!poly.length) break;
    }
    var ded = []; poly.forEach(function (p) { var q = ded[ded.length - 1]; if (!q || Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) > 1e-9) ded.push(p); });
    if (ded.length > 1) { var f = ded[0], l = ded[ded.length - 1]; if (Math.abs(f[0] - l[0]) + Math.abs(f[1] - l[1]) + Math.abs(f[2] - l[2]) <= 1e-9) ded.pop(); }
    return { E: E, cap: cap, poly: ded, empty: ded.length === 0 };
  }
  function toImputation(g, l) { var E = g.v[7] - g.v[1] - g.v[2] - g.v[4]; return [g.v[1] + E * l[0], g.v[2] + E * l[1], g.v[4] + E * l[2]]; }
  function toBary(g, x) { var E = g.v[7] - g.v[1] - g.v[2] - g.v[4]; return [(x[0] - g.v[1]) / E, (x[1] - g.v[2]) / E, (x[2] - g.v[4]) / E]; }

  /* ---------- weighted voting [q; w1, ..., wn] ---------- */
  function winning(w, q, S) { var s = 0; for (var i = 0; i < w.length; i++) if (S & (1 << i)) s += w[i]; return s >= q; }
  function shapleyShubik(w, q) { // fraction of orders in which each member is pivotal (turns a losing coalition into a winning one)
    var n = w.length, piv = []; for (var i = 0; i < n; i++) piv[i] = 0; var os = orders(n);
    os.forEach(function (o) { var s = 0; for (var k = 0; k < n; k++) { s += w[o[k]]; if (s >= q) { piv[o[k]]++; break; } } });
    return piv.map(function (p) { return p / os.length; });
  }
  function banzhaf(w, q) { // swings: winning coalitions that lose when i leaves; normalized to add to 1
    var n = w.length, sw = []; for (var i = 0; i < n; i++) sw[i] = 0;
    for (var S = 0; S < (1 << n); S++) if (winning(w, q, S)) for (i = 0; i < n; i++) if ((S & (1 << i)) && !winning(w, q, S & ~(1 << i))) sw[i]++;
    var tot = sw.reduce(function (a, b) { return a + b; }, 0); return { raw: sw, norm: sw.map(function (s) { return tot ? s / tot : 0; }), total: tot };
  }
  /* a game from a list of worths in the order v1, v2, v3, v12, v13, v23, v123 */
  function game3(a) { var v = [0, a[0], a[1], a[3], a[2], a[4], a[5], a[6]]; return { n: 3, v: v }; }
  function gameFrom(n, fn) { var v = []; for (var S = 0; S < (1 << n); S++) v[S] = S ? fn(S) : 0; return { n: n, v: v }; }

  var api = { bits: bits, orders: orders, marginals: marginals, shapley: shapley, shapleyByOrders: shapleyByOrders, inCore: inCore, objections: objections, superadditive: superadditive, convex: convex,
    nullPlayers: nullPlayers, symmetricPairs: symmetricPairs, core3: core3, toImputation: toImputation, toBary: toBary, winning: winning, shapleyShubik: shapleyShubik, banzhaf: banzhaf, game3: game3, gameFrom: gameFrom };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GT13M = api;
})(this);
