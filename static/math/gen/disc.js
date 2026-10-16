// ---- 00-head.js
/* Math Ladder problem generators for Discrete Math (course key disc). Built from /tmp/work_ug_disc/gen/*.js.
   Every answer is computed from the generated numbers (brute force where it is cheap: truth tables, relations,
   graphs, counts) and checked again independently by the tests in the work folder.
   Pictures in problems use the course visuals (static/math/viz/disc.js) with quiet: true and edit: false.        */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T, U = ML.util, M = Math;

  // ---------------------------------------------------------------- answers and small helpers
  function by(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function num(v, o) { return Object.assign({ t: 'num', v: String(v) }, o || {}); }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function mc(correct, wrongs) { var ch = [correct], seen = {}; seen[correct] = 1; wrongs.forEach(function (w) { if (!seen[w]) { seen[w] = 1; ch.push(w); } }); return { t: 'mc', choices: ch, v: 0 }; }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function setA(arr) { return { t: 'set', v: arr.map(String) }; }
  function expr(v, vars) { return { t: 'expr', v: v, vars: vars }; }
  function multi(parts) { return { t: 'multi', parts: parts }; }
  function part(label, a) { return { label: label, a: a }; }
  function seqText(arr) { // a sequence of labels typed many ways: "A, C, B", "ACB", "A C B", "A-C-B", "A → C → B"
    var j = [', ', '', ' ', ',', '-', ' - ', ' → ', '→', ' -> ', '->', '–', ' – '], out = [];
    j.forEach(function (s) { var t = arr.join(s); if (out.indexOf(t) < 0) out.push(t); });
    return { t: 'text', v: out };
  }
  function setText(arr) { // an unordered set of labels as a text answer: every order, typed many ways
    var vs = []; idxPerms(arr.length).forEach(function (p) { seqText(p.map(function (i) { return arr[i]; })).v.forEach(function (x) { if (vs.indexOf(x) < 0) vs.push(x); }); [p.map(function (i) { return arr[i]; })].forEach(function (q) { ['{' + q.join(', ') + '}', '{' + q.join(',') + '}', q.join(' and ')].forEach(function (x) { if (vs.indexOf(x) < 0) vs.push(x); }); }); });
    return { t: 'text', v: vs };
  }
  function plainTerms(ts) { // [[coef, 'x^2'], [coef, '']] -> "3*x^2 - x + 2" (CAS syntax, tidy signs)
    var out = ''; ts.forEach(function (t) { var c = t[0], x = t[1]; if (!c) return; var a = M.abs(c), s = x === '' ? String(a) : (a === 1 ? '' : a + '*') + x; out = out ? out + (c < 0 ? ' - ' : ' + ') + s : (c < 0 ? '-' : '') + s; });
    return out || '0';
  }
  function tfWord(b) { return b ? 'true' : 'false'; }
  function TF(b) { return b ? '\\mathrm{T}' : '\\mathrm{F}'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function C(n, k) { return U.nCr(n, k); }
  function P(n, k) { return U.nPr(n, k); }
  function fact(n) { return U.factorial(n); }
  function binom(n, k) { return '\\binom{' + n + '}{' + k + '}'; }
  function commas(n) { return T.commas(n); }
  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function setTex(arr) { return arr.length ? '\\{' + arr.join(', ') + '\\}' : '\\varnothing'; }
  function sortN(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function plural(n, w, ws) { return n + ' ' + (n === 1 ? w : (ws || w + 's')); }
  function isPrime(n) { return n >= 2 && U.isPrime(n); }

  // ---------------------------------------------------------------- propositional logic
  // formulas: {o:'v', v:'P'} | {o:'not', a} | {o:'and'|'or'|'imp'|'iff', a, b}
  function lparse(s) {
    var t = String(s).replace(/<->|↔/g, ' = ').replace(/->|→/g, ' > ').replace(/[~¬]/g, ' ~ ').replace(/[&∧]/g, ' & ').replace(/[|∨]/g, ' | ').replace(/[()]/g, ' $& ').trim().split(/\s+/), i = 0;
    function peek() { return t[i]; }
    function atom() { var x = t[i++]; if (x === '~') return { o: 'not', a: atom() }; if (x === '(') { var e = iff(); i++; return e; } return { o: 'v', v: x }; }
    function and() { var a = atom(); while (peek() === '&') { i++; a = { o: 'and', a: a, b: atom() }; } return a; }
    function or() { var a = and(); while (peek() === '|') { i++; a = { o: 'or', a: a, b: and() }; } return a; }
    function imp() { var a = or(); if (peek() === '>') { i++; return { o: 'imp', a: a, b: imp() }; } return a; }
    function iff() { var a = imp(); while (peek() === '=') { i++; a = { o: 'iff', a: a, b: imp() }; } return a; }
    return iff();
  }
  function lf(f) { return typeof f === 'string' ? lparse(f) : f; }
  function lev(f, env) {
    f = lf(f);
    switch (f.o) {
      case 'v': return !!env[f.v];
      case 'not': return !lev(f.a, env);
      case 'and': return lev(f.a, env) && lev(f.b, env);
      case 'or': return lev(f.a, env) || lev(f.b, env);
      case 'imp': return !lev(f.a, env) || lev(f.b, env);
      case 'iff': return lev(f.a, env) === lev(f.b, env);
    }
  }
  function lvars(f, acc) { f = lf(f); acc = acc || []; if (f.o === 'v') { if (acc.indexOf(f.v) < 0) acc.push(f.v); } else { lvars(f.a, acc); if (f.b) lvars(f.b, acc); } return acc; }
  function lsortVars(vs) { return vs.slice().sort(); }
  var OPT = { and: '\\wedge', or: '\\vee', imp: '\\to', iff: '\\leftrightarrow' };
  function ltex(f, parent) {
    f = lf(f);
    if (f.o === 'v') return f.v;
    if (f.o === 'not') return '\\neg ' + ltex(f.a, 'not');
    var s = ltex(f.a, f.o) + ' ' + OPT[f.o] + ' ' + ltex(f.b, f.o);
    if (parent && !(parent === f.o && (f.o === 'and' || f.o === 'or'))) s = '(' + s + ')';
    return s;
  }
  function lplain(f, parent) { // the ASCII form the disc-truth visual reads
    f = lf(f);
    if (f.o === 'v') return f.v;
    if (f.o === 'not') return '~' + lplain(f.a, 'not');
    var s = lplain(f.a, f.o) + ' ' + { and: '&', or: '|', imp: '->', iff: '<->' }[f.o] + ' ' + lplain(f.b, f.o);
    if (parent && !(parent === f.o && (f.o === 'and' || f.o === 'or'))) s = '(' + s + ')';
    return s;
  }
  function rows(vs) { // standard order: all true first (TT, TF, FT, FF)
    var n = vs.length, out = [];
    for (var r = 0; r < (1 << n); r++) { var env = {}; vs.forEach(function (v, j) { env[v] = !((r >> (n - 1 - j)) & 1); }); out.push(env); }
    return out;
  }
  function column(f, vs) { return rows(vs).map(function (e) { return lev(f, e); }); }
  function equivF(f, g) { var vs = lsortVars(lvars(f).concat(lvars(g)).filter(function (v, i, a) { return a.indexOf(v) === i; })); return rows(vs).every(function (e) { return lev(f, e) === lev(g, e); }); }
  function rowTex(env, vs) { return vs.map(function (v) { return v + ' = ' + TF(env[v]); }).join(',\\ '); }
  function rowWords(env, vs) { return vs.map(function (v) { return v + ' ' + (env[v] ? 'true' : 'false'); }).join(', '); }

  // ---------------------------------------------------------------- relations and graphs
  function pairsTex(ps) { return ps.length ? '\\{' + ps.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '\\}' : '\\varnothing'; }
  function relProps(A, R) {
    var has = {}; R.forEach(function (p) { has[p[0] + ',' + p[1]] = 1; });
    var h = function (a, b) { return !!has[a + ',' + b]; };
    var refl = A.every(function (a) { return h(a, a); });
    var sym = R.every(function (p) { return h(p[1], p[0]); });
    var anti = R.every(function (p) { return p[0] === p[1] || !h(p[1], p[0]); });
    var trans = true, why = null;
    R.forEach(function (p) { R.forEach(function (q) { if (p[1] === q[0] && !h(p[0], q[1])) { if (trans) why = [p, q]; trans = false; } }); });
    var missR = A.filter(function (a) { return !h(a, a); });
    var missS = R.filter(function (p) { return !h(p[1], p[0]); });
    var badA = R.filter(function (p) { return p[0] !== p[1] && h(p[1], p[0]); });
    return { refl: refl, sym: sym, anti: anti, trans: trans, transWhy: why, missR: missR, missS: missS, badA: badA };
  }
  // graphs: { v: ['A', …], e: [['A', 'B'], …] } simple, undirected unless stated
  function gAdj(g) { var a = {}; g.v.forEach(function (x) { a[x] = []; }); g.e.forEach(function (e) { a[e[0]].push(e[1]); a[e[1]].push(e[0]); }); return a; }
  function gDeg(g) { var d = {}; g.v.forEach(function (x) { d[x] = 0; }); g.e.forEach(function (e) { d[e[0]]++; d[e[1]]++; }); return d; }
  function gComps(g) {
    var adj = gAdj(g), seen = {}, comps = [];
    g.v.forEach(function (s) { if (seen[s]) return; var c = [], st = [s]; seen[s] = 1; while (st.length) { var x = st.pop(); c.push(x); adj[x].forEach(function (y) { if (!seen[y]) { seen[y] = 1; st.push(y); } }); } comps.push(c); });
    return comps;
  }
  function gConnected(g) { return gComps(g).length === 1; }
  function gDist(g, s) { var adj = gAdj(g), d = {}; d[s] = 0; var q = [s]; while (q.length) { var x = q.shift(); adj[x].forEach(function (y) { if (d[y] === undefined) { d[y] = d[x] + 1; q.push(y); } }); } return d; }
  function gHasEdge(g, a, b) { return g.e.some(function (e) { return (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a); }); }
  function gEdgesTex(g) { return '\\{' + g.e.map(function (e) { return e[0] + e[1]; }).join(', ') + '\\}'; }
  function gEdgeWords(g) { return g.e.map(function (e) { return e[0] + e[1]; }).join(', '); }
  var permCache = {};
  function idxPerms(n) { if (permCache[n]) return permCache[n]; var out = []; (function go(p, used) { if (p.length === n) { out.push(p.slice()); return; } for (var i = 0; i < n; i++) if (!used[i]) { used[i] = 1; p.push(i); go(p, used); p.pop(); used[i] = 0; } })([], []); return (permCache[n] = out); }
  function gPerms(arr) { return idxPerms(arr.length).map(function (p) { return p.map(function (i) { return arr[i]; }); }); }
  function gHamCycle(g) { // brute force (n <= 8): a Hamilton cycle as a list, or null
    var adj = gAdj(g), n = g.v.length, s = g.v[0], path = [s], used = {}; used[s] = 1;
    function go() { if (path.length === n) return adj[path[n - 1]].indexOf(s) >= 0; var x = path[path.length - 1]; for (var i = 0; i < adj[x].length; i++) { var y = adj[x][i]; if (used[y]) continue; used[y] = 1; path.push(y); if (go()) return true; path.pop(); delete used[y]; } return false; }
    return n >= 3 && go() ? path.slice() : null;
  }
  function gHamPath(g) {
    var adj = gAdj(g), n = g.v.length;
    for (var k = 0; k < n; k++) {
      var s = g.v[k], path = [s], used = {}; used[s] = 1;
      var go = function () { if (path.length === n) return true; var x = path[path.length - 1]; for (var i = 0; i < adj[x].length; i++) { var y = adj[x][i]; if (used[y]) continue; used[y] = 1; path.push(y); if (go()) return true; path.pop(); delete used[y]; } return false; };
      if (go()) return path.slice();
    }
    return null;
  }
  function gChromatic(g) { // smallest k with a proper coloring (n <= 9)
    var adj = gAdj(g), n = g.v.length, col = {};
    function ok(k, i) { if (i === n) return true; var x = g.v[i]; for (var c = 0; c < k; c++) { if (adj[x].some(function (y) { return col[y] === c; })) continue; col[x] = c; if (ok(k, i + 1)) return true; delete col[x]; } return false; }
    if (!g.e.length) return n ? 1 : 0;
    for (var k = 1; k <= n; k++) { col = {}; if (ok(k, 0)) return k; }
    return n;
  }
  function gGreedy(g, order) { var adj = gAdj(g), col = {}; order.forEach(function (x) { var c = 0; while (adj[x].some(function (y) { return col[y] === c; })) c++; col[x] = c; }); return col; }
  function gIso(g, h) { // brute force: a mapping g.v -> h.v or null
    if (g.v.length !== h.v.length || g.e.length !== h.e.length) return null;
    var dg = gDeg(g), dh = gDeg(h), sg = g.v.map(function (x) { return dg[x]; }).sort().join(), sh = h.v.map(function (x) { return dh[x]; }).sort().join();
    if (sg !== sh) return null;
    var hs = {}; h.e.forEach(function (e) { hs[e[0] + '|' + e[1]] = hs[e[1] + '|' + e[0]] = 1; });
    var ps = gPerms(h.v);
    for (var i = 0; i < ps.length; i++) { var m = {}; g.v.forEach(function (x, j) { m[x] = ps[i][j]; }); if (g.v.every(function (x) { return dg[x] === dh[m[x]]; }) && g.e.every(function (e) { return hs[m[e[0]] + '|' + m[e[1]]]; })) return m; }
    return null;
  }
  function gIsTree(g) { return gConnected(g) && g.e.length === g.v.length - 1; }
  function gHasCycle(g) { return g.e.length > g.v.length - gComps(g).length; }
  function gOddCycle(g) { // true if not bipartite
    var adj = gAdj(g), side = {};
    for (var i = 0; i < g.v.length; i++) { var s = g.v[i]; if (side[s] !== undefined) continue; side[s] = 0; var q = [s]; while (q.length) { var x = q.shift(); for (var j = 0; j < adj[x].length; j++) { var y = adj[x][j]; if (side[y] === undefined) { side[y] = 1 - side[x]; q.push(y); } else if (side[y] === side[x]) return true; } } }
    return false;
  }
  function gRandom(R, n, m, connected) { // a random simple graph on A, B, … with m edges (connected if asked)
    var V = 'ABCDEFGHIJ'.slice(0, n).split(''), all = [];
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) all.push([V[i], V[j]]);
    for (var t = 0; t < 200; t++) { var e = R.sample(all, m).map(function (x) { return x.slice(); }); e.sort(function (a, b) { return (a[0] + a[1]) < (b[0] + b[1]) ? -1 : 1; }); var g = { v: V, e: e }; if (!connected || gConnected(g)) return g; }
    return null;
  }
  function gViz(g, o) { var gr = { v: g.v, e: g.e }; if (g.pos) gr.pos = g.pos; return { name: 'disc-graph', opts: Object.assign({ graph: gr, mode: 'degrees', quiet: true, edit: false }, g.pos ? { layout: 'given' } : {}, o || {}) }; }
  // weighted graph templates with positions (x right, y down, 0…100) for Kruskal and Dijkstra
  var WG = [
    { v: ['A', 'B', 'C', 'D', 'E', 'F'], pos: { A: [8, 50], B: [36, 12], C: [36, 88], D: [66, 12], E: [66, 88], F: [94, 50] }, e: [['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'E'], ['B', 'E'], ['D', 'E'], ['D', 'F'], ['E', 'F']] },
    { v: ['A', 'B', 'C', 'D', 'E', 'F'], pos: { A: [10, 15], B: [50, 10], C: [90, 15], D: [10, 85], E: [50, 90], F: [90, 85] }, e: [['A', 'B'], ['B', 'C'], ['A', 'D'], ['B', 'E'], ['C', 'F'], ['D', 'E'], ['E', 'F'], ['A', 'E'], ['B', 'F']] },
    { v: ['A', 'B', 'C', 'D', 'E'], pos: { A: [10, 50], B: [45, 10], C: [45, 90], D: [90, 25], E: [90, 80] }, e: [['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'E'], ['C', 'D']] },
    { v: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], pos: { A: [6, 50], B: [30, 14], C: [30, 86], D: [55, 50], E: [78, 14], F: [78, 86], G: [96, 50] }, e: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['B', 'E'], ['D', 'E'], ['D', 'F'], ['C', 'F'], ['E', 'G'], ['F', 'G']] }
  ];
  function wgRandom(R, lvl) {
    var t = lvl === 1 ? R.pick([WG[2], WG[0]]) : R.pick(WG), m = t.e.length;
    var ws = R.sample(range(1, M.max(12, m + 4)), m); // distinct weights: one minimum spanning tree
    return { v: t.v.slice(), pos: t.pos, e: t.e.map(function (e, i) { return [e[0], e[1], ws[i]]; }) };
  }
  function kruskal(g) {
    var par = {}; g.v.forEach(function (x) { par[x] = x; });
    function f(x) { while (par[x] !== x) x = par[x] = par[par[x]]; return x; }
    var es = g.e.slice().sort(function (a, b) { return a[2] - b[2]; }), log = [], tree = [], total = 0;
    es.forEach(function (e) { var a = f(e[0]), b = f(e[1]); if (a === b) { log.push([e, false]); return; } if (tree.length < g.v.length - 1) { par[a] = b; tree.push(e); total += e[2]; log.push([e, true]); } });
    return { tree: tree, total: total, log: log, sorted: es };
  }
  function dijkstra(g, s) {
    var d = {}, done = {}, order = [], prev = {}; g.v.forEach(function (x) { d[x] = Infinity; }); d[s] = 0;
    for (var k = 0; k < g.v.length; k++) {
      var u = null; g.v.forEach(function (x) { if (!done[x] && (u === null || d[x] < d[u] || (d[x] === d[u] && x < u))) u = x; });
      if (u === null || d[u] === Infinity) break; done[u] = 1; order.push(u);
      g.e.forEach(function (e) { var o = e[0] === u ? e[1] : e[1] === u ? e[0] : null; if (o && !done[o] && d[u] + e[2] < d[o]) { d[o] = d[u] + e[2]; prev[o] = u; } });
    }
    return { d: d, order: order, prev: prev };
  }
  function wgViz(g, o) { return { name: 'disc-graphalgo', opts: Object.assign({ graph: { v: g.v, e: g.e, pos: g.pos }, algo: 'kruskal', quiet: true, edit: false }, o || {}) }; }

// ---- 01-logic.js
  // ================================================================ Unit 1: Logic
  // facts with a known truth value, for building compound statements
  var FACTS_T = ['$6$ is even', '$3 < 7$', '$9$ is a perfect square', '$13$ is prime', '$5 \\cdot 4 = 20$', '$\\frac{1}{2} > \\frac{1}{3}$', '$2^{5} = 32$', '$0$ is an integer'];
  var FACTS_F = ['$15$ is prime', '$8 < 2$', '$7$ is even', '$3^{2} = 6$', '$\\frac{1}{4} > \\frac{1}{2}$', '$10$ is odd', '$\\sqrt{16} = 8$', '$1$ is prime'];
  function factsFor(R, vals) { var t = R.shuffle(FACTS_T), f = R.shuffle(FACTS_F), it = 0, jf = 0; return vals.map(function (v) { return v ? t[it++] : f[jf++]; }); }
  function defLetters(vs, facts) { return vs.map(function (v, i) { return '$' + v + '$: “' + facts[i] + '”'; }).join('; '); }
  var F2 = ['~P | Q', 'P & ~Q', '~(P & Q)', '~(P | Q)', '(P | Q) & ~P', '(P & Q) | ~Q', '~P & ~Q', 'P | ~Q', '~P | ~Q', '(P | Q) & ~(P & Q)', '~P & Q', '(P & ~Q) | (~P & Q)', '~(~P | Q)', '(P | Q) & Q', '~(P & ~Q)', '(~P | Q) & P'];
  var F3 = ['(P | Q) & ~R', 'P & (Q | R)', '(P & Q) | R', '~P | (Q & R)', 'P & ~(Q | R)', '(P | ~Q) & (Q | R)', '(P & ~R) | (Q & R)', '~(P & Q) & R', '(P | Q) & (P | R)', '~P & (Q | ~R)', '(P & Q) | (~P & R)', '~(P | Q) | R', 'P | (~Q & ~R)', '(P | R) & ~Q'];
  var C2 = ['P -> Q', 'Q -> P', '~P -> Q', 'P -> ~Q', 'P <-> Q', '~P <-> Q', '(P -> Q) & P', '(P -> Q) & ~Q', 'P -> (P & Q)', '(P | Q) -> Q', '~(P -> Q)', '(P -> Q) | (Q -> P)'];
  var C3 = ['(P & Q) -> R', 'P -> (Q | R)', '(P -> Q) & (Q -> R)', '(P | Q) -> R', 'P -> (Q -> R)', '(P -> Q) -> R', '(P <-> Q) | R', 'P <-> (Q & R)', '~R -> (P & Q)', '(P -> R) & (Q -> R)'];

  G('disc.propositions', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['statement', 'eval', 'eval', 'orboth']), R.pick(['eval', 'translate', 'statement', 'orboth']), R.pick(['eval', 'translate']));
    if (shape === 'statement') {
      var pool = [['$17$ is a prime number.', 0, 'It makes a claim, and the claim is true.'], ['$2 + 2 = 5$.', 1, 'It makes a claim that is definitely false. A false claim is still a statement.'],
        ['Every square is a rectangle.', 0, 'It makes a claim, and every square has four right angles, so it is true.'], ['The number $91$ is prime.', 1, 'It makes a claim, and $91 = 7 \\cdot 13$, so the claim is false.'],
        ['$0$ is an even number.', 0, 'It makes a claim, and $0 = 2 \\cdot 0$, so it is true.'], ['There is a largest whole number.', 1, 'It makes a claim, and adding $1$ to any whole number gives a larger one, so it is false.'],
        ['Is $7$ a prime number?', 2, 'It is a question. A question asks; it does not claim anything, so it has no truth value.'], ['Add $3$ to both sides.', 2, 'It is a command. It tells you to do something and claims nothing.'],
        ['$x + 4 = 9$', 2, 'It contains a variable with no stated value, so it is true for $x = 5$ and false otherwise. Until $x$ is known, it is not a statement.'],
        ['$n$ is even.', 2, 'Its truth depends on $n$, which is not given. A sentence with a free variable is not a statement.'], ['Please close the door.', 2, 'It is a request. It has no truth value.'],
        ['$\\sqrt{2}$ is a whole number.', 1, 'It makes a claim, and $1^{2} = 1 < 2 < 4 = 2^{2}$, so $\\sqrt{2}$ is between $1$ and $2$: false.']];
      var it = R.pick(pool), ch = ['A true statement', 'A false statement', 'Not a statement'];
      return { q: 'Is this sentence a statement? If it is, is it true or false?<br>“' + it[0] + '”', a: mcKeep(ch, it[1]),
        steps: ['A statement is a sentence that is either true or false, but not both.', it[2], 'So the answer is: ' + ch[it[1]].toLowerCase() + '.'], hint: 'Ask: does this sentence make a claim that must be true or false?' };
    }
    if (shape === 'eval' || shape === 'orboth') {
      var vs = L === 3 ? ['P', 'Q', 'R'] : ['P', 'Q'], vals = vs.map(function () { return R.coin(); });
      var f;
      if (shape === 'orboth') { vals = [true, true]; f = R.pick(['P | Q', 'P | Q', '~P | Q']); }
      else if (L === 1) f = R.pick(['~P', 'P & Q', 'P | Q', 'P | Q', '~Q']);
      else if (L === 2) f = R.pick(F2);
      else f = R.pick(F3);
      var facts = factsFor(R, vals), env = {}; vs.forEach(function (v, i) { env[v] = vals[i]; });
      var val = lev(f, env), ff = lf(f), steps = [vs.map(function (v, i) { return '$' + v + '$ is ' + tfWord(vals[i]) + ' (“' + facts[i] + '”)'; }).join('; ') + '.'];
      (function walk(g) { if (g.o === 'v') return; walk(g.a); if (g.b) walk(g.b); steps.push('$' + ltex(g) + '$ is ' + tfWord(lev(g, env)) + (g.o === 'or' && lev(g.a, env) && lev(g.b, env) ? ': both parts are true, and “or” allows that.' : g.o === 'or' ? ': “or” needs at least one true part.' : g.o === 'and' ? ': “and” needs both parts true.' : g.o === 'not' ? ': $\\neg$ flips the truth value of $' + ltex(g.a) + '$.' : '.')); })(ff);
      return { q: 'Let ' + defLetters(vs, facts) + '. Is $' + ltex(f) + '$ true or false?', a: tf(val), steps: steps, hint: 'Decide each letter first. “And” needs both parts true; “or” needs at least one.' };
    }
    // translate English into symbols
    var stories = [['it is raining', 'the game is canceled', 'it is not raining', 'the game is not canceled'], ['the store is open', 'the lights are on', 'the store is not open', 'the lights are not on'],
      ['Ana studies', 'Ana passes', 'Ana does not study', 'Ana does not pass'], ['the number is even', 'the number is positive', 'the number is not even', 'the number is not positive']];
    var s = R.pick(stories);
    var forms = [['P & ~Q', cap(s[0]) + ', but ' + s[3] + '.'], ['~P | Q', cap(s[2]) + ', or ' + s[1] + '.'], ['~P & ~Q', cap(s[2]) + ', and ' + s[3] + '.'],
      ['~(P & Q)', 'It is not true that ' + s[0] + ' and ' + s[1] + '.'], ['P | ~Q', cap(s[0]) + ', or ' + s[3] + '.'], ['~P & Q', cap(s[2]) + ', but ' + s[1] + '.']];
    var pick = R.pick(forms), target = lparse(pick[0]);
    var cands = ['P & ~Q', '~P | Q', '~P & ~Q', '~(P & Q)', 'P | ~Q', '~P & Q', '~P | ~Q', 'P & Q', 'P | Q', '~(P | Q)'].filter(function (x) { return !equivF(x, target); });
    var wr = R.sample(cands, 3).map(function (x) { return '$' + ltex(x) + '$'; });
    return { q: 'Let $P$: “' + s[0] + '” and $Q$: “' + s[1] + '.” Which formula says: “' + pick[1] + '”', a: mc('$' + ltex(target) + '$', wr),
      steps: ['“Not” becomes $\\neg$, “and” and “but” become $\\wedge$, and “or” becomes $\\vee$.' + (pick[0] === '~(P & Q)' ? ' “It is not true that …” negates the whole “and” statement, so the $\\neg$ goes outside the parentheses.' : ''), 'So the sentence is $' + ltex(target) + '$.'],
      hint: '“But” means “and.” Translate one clause at a time.' };
  });

  G('disc.truth-tables', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['rows', 'column', 'column', 'row']), R.pick(['count', 'column', 'row']), R.pick(['count', 'which', 'count']));
    if (shape === 'rows') {
      var n = R.int(2, 5), fs3 = n === 3 ? R.pick(F3) : null;
      var q = fs3 ? 'How many rows does the truth table of $' + ltex(fs3) + '$ have?' : 'A compound statement uses ' + n + ' different letters. How many rows does its truth table need?';
      return { q: q, a: num(M.pow(2, n)), steps: [(fs3 ? 'The letters are $P$, $Q$ and $R$: ' : '') + 'Each of the ' + n + ' letters can be true or false.', 'By the product rule there are $' + Array(n + 1).join('2 \\cdot ').slice(0, -7) + ' = 2^{' + n + '} = ' + M.pow(2, n) + '$ combinations, one row each.'], hint: 'Each letter has 2 choices, and the choices multiply.' };
    }
    var f = L === 3 ? R.pick(F3) : R.pick(F2), vs = lsortVars(lvars(f)), col = column(f, vs), rs = rows(vs);
    if (shape === 'column') {
      return { q: 'Fill in the last column of the truth table for $' + ltex(f) + '$. Type it top to bottom as T’s and F’s (like TFFT).', a: seqText(col.map(function (b) { return b ? 'T' : 'F'; })),
        viz: { name: 'disc-truth', opts: { expr: lplain(f), quiet: true, edit: false } },
        steps: rs.map(function (e, i) { return 'Row ' + (i + 1) + ' (' + rowWords(e, vs) + '): ' + tfWord(col[i]) + '.'; }).concat(['Top to bottom: ' + col.map(function (b) { return b ? 'T' : 'F'; }).join('') + '.']),
        hint: 'Work out the inside parts first, one column at a time.' };
    }
    if (shape === 'row') {
      var r = R.int(0, rs.length - 1), e = rs[r], val = lev(f, e), steps = [];
      (function walk(g) { if (g.o === 'v') return; walk(g.a); if (g.b) walk(g.b); steps.push('$' + ltex(g) + '$ is ' + tfWord(lev(g, e)) + '.'); })(lf(f));
      return { q: 'In the row where $' + rowTex(e, vs) + '$, is $' + ltex(f) + '$ true or false?', a: tf(val), steps: steps, hint: 'Start with the innermost parts and work outward.' };
    }
    if (shape === 'count') {
      var k = col.filter(Boolean).length;
      return { q: 'In how many rows of its truth table is $' + ltex(f) + '$ true?', a: num(k),
        steps: ['There are ' + vs.length + ' letters, so $2^{' + vs.length + '} = ' + rs.length + '$ rows.'].concat(rs.map(function (e, i) { return rowWords(e, vs) + ': ' + (col[i] ? '<b>true</b>' : 'false') + '.'; })).concat(['True in ' + k + ' of the ' + rs.length + ' rows.']),
        hint: 'List all ' + rs.length + ' rows in order, then evaluate the statement in each one.' };
    }
    // which formula has this column
    var pool = ['P & Q', 'P | Q', '~P & Q', 'P & ~Q', '~P | Q', 'P | ~Q', '~(P & Q)', '~(P | Q)'], tgt = R.pick(pool), vs2 = ['P', 'Q'], c2 = column(tgt, vs2);
    var others = pool.filter(function (x) { return !equivF(x, tgt); });
    return { q: 'In the usual row order ($TT, TF, FT, FF$ for $P, Q$), which statement has the column $' + c2.map(TF).join('\\,') + '$?', a: mc('$' + ltex(tgt) + '$', R.sample(others, 3).map(function (x) { return '$' + ltex(x) + '$'; })),
      steps: rows(vs2).map(function (e, i) { return rowWords(e, vs2) + ': $' + ltex(tgt) + '$ is ' + tfWord(c2[i]) + '.'; }).concat(['That matches the column, so the answer is $' + ltex(tgt) + '$.']),
      hint: 'Look at the rows where the column says T. What do they have in common?' };
  });

  G('disc.conditional', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['value', 'value', 'promise', 'iffval']), R.pick(['row', 'promise', 'count', 'value']), R.pick(['count', 'onlyif', 'row', 'onlyif']));
    if (shape === 'value' || shape === 'iffval') {
      var p = R.chance(0.6) ? false : R.coin(), qv = R.coin(); if (shape === 'iffval') p = R.coin();
      var fa = factsFor(R, [p, qv]), iff = shape === 'iffval', val = iff ? p === qv : (!p || qv);
      var sent = iff ? cap(fa[0]) + ' if and only if ' + fa[1] + '.' : 'If ' + fa[0] + ', then ' + fa[1] + '.';
      return { q: 'Is this statement true or false?<br>“' + sent + '”', a: tf(val),
        steps: ['The first part, “' + fa[0] + ',” is ' + tfWord(p) + '. The second part, “' + fa[1] + ',” is ' + tfWord(qv) + '.',
          iff ? 'A biconditional is true exactly when both parts have the same truth value. Here they ' + (p === qv ? 'match' : 'differ') + ', so it is ' + tfWord(val) + '.'
            : (p ? (qv ? 'The hypothesis is true and so is the conclusion: the promise was kept, so the conditional is true.' : 'The hypothesis is true but the conclusion is false: this is the one case that makes a conditional false.')
              : 'The hypothesis is false, so the promise was never tested. A conditional with a false hypothesis is true.')],
        hint: iff ? '$P \\leftrightarrow Q$ is true when $P$ and $Q$ match.' : '$P \\to Q$ is false only when $P$ is true and $Q$ is false.' };
    }
    if (shape === 'promise') {
      var st = R.pick([['it is sunny on Saturday', 'Mia goes to the beach', 'it is sunny', 'it is not sunny', 'Mia goes to the beach', 'Mia does not go to the beach'],
        ['you finish your homework', 'you get a sticker', 'you finish', 'you do not finish', 'you get a sticker', 'you do not get a sticker'],
        ['the team wins', 'the coach buys pizza', 'the team wins', 'the team loses', 'the coach buys pizza', 'the coach does not buy pizza'],
        ['you score at least $90$', 'you get an A', 'you score $92$', 'you score $85$', 'you get an A', 'you do not get an A']]);
      var ask = R.pick(['broken', 'kept']);
      if (ask === 'broken') return { q: 'A promise: “If ' + st[0] + ', then ' + st[1] + '.” In which situation is the promise <b>broken</b>?', a: mc(cap(st[2]) + ', and ' + st[5] + '.', [cap(st[3]) + ', and ' + st[4] + '.', cap(st[3]) + ', and ' + st[5] + '.', cap(st[2]) + ', and ' + st[4] + '.']),
        steps: ['A conditional $P \\to Q$ is false only when $P$ is true and $Q$ is false.', 'So the promise is broken only when ' + st[2] + ' and ' + st[5] + '.', 'When ' + st[3] + ', the promise was never tested, so it was not broken, whatever happens next.'], hint: 'The promise is only about what happens when the condition is met.' };
      return { q: 'A promise: “If ' + st[0] + ', then ' + st[1] + '.” Suppose ' + st[3] + ', and ' + st[4] + '. Was the promise kept (is the conditional true)?', a: tf(true),
        steps: ['Here the hypothesis is false: ' + st[3] + '.', 'The promise says nothing about this case, so it was not broken. A conditional with a false hypothesis is true.'], hint: 'Ask: did the condition of the promise happen?' };
    }
    if (shape === 'row' || shape === 'count') {
      var f = L === 3 ? R.pick(C3) : R.pick(C2), vs = lsortVars(lvars(f)), rs = rows(vs), col = column(f, vs);
      if (shape === 'row') {
        var e = R.pick(rs), val2 = lev(f, e), steps = [];
        (function walk(g) { if (g.o === 'v') return; walk(g.a); if (g.b) walk(g.b); steps.push('$' + ltex(g) + '$ is ' + tfWord(lev(g, e)) + (g.o === 'imp' && !lev(g.a, e) ? ' (false hypothesis).' : g.o === 'imp' && !lev(g, e) ? ' (true hypothesis, false conclusion).' : '.')); })(lf(f));
        return { q: 'In the row where $' + rowTex(e, vs) + '$, is $' + ltex(f) + '$ true or false?', a: tf(val2), steps: steps, hint: 'An arrow is false only when the left side is true and the right side is false.' };
      }
      var kf = col.filter(function (b) { return !b; }).length;
      return { q: 'In how many rows of its truth table is $' + ltex(f) + '$ <b>false</b>?', a: num(kf),
        steps: ['There are $2^{' + vs.length + '} = ' + rs.length + '$ rows.'].concat(rs.map(function (e, i) { return rowWords(e, vs) + ': ' + (col[i] ? 'true' : '<b>false</b>') + '.'; })).concat(['False in ' + kf + ' row' + (kf === 1 ? '' : 's') + '.']),
        hint: 'For each arrow, look for a true left side with a false right side.' };
    }
    // "only if", "if", "sufficient", "necessary"
    var sc = R.pick([['you can vote', 'you are registered'], ['the alarm sounds', 'there is smoke'], ['$n$ is divisible by $6$', '$n$ is divisible by $3$'], ['the shape is a square', 'the shape is a rectangle'], ['you may enter', 'you have a ticket']]);
    var forms = [[cap(sc[0]) + ' only if ' + sc[1] + '.', 'P -> Q', '“$P$ only if $Q$” means $P$ cannot happen without $Q$: if $P$, then $Q$.', true],
      [cap(sc[1]) + ' if ' + sc[0] + '.', 'P -> Q', '“$Q$ if $P$” is “if $P$, then $Q$,” written in the other order.', true],
      ['$Q$ is a necessary condition for $P$.', 'P -> Q', 'A necessary condition must hold whenever $P$ holds: $P \\to Q$.', false],
      ['$P$ is a sufficient condition for $Q$.', 'P -> Q', 'A sufficient condition guarantees the other one: $P \\to Q$.', false],
      ['$P$ is a necessary condition for $Q$.', 'Q -> P', 'Here $P$ is the one that must hold whenever $Q$ holds: $Q \\to P$.', false],
      ['$P$ if $Q$.', 'Q -> P', '“$P$ if $Q$” is “if $Q$, then $P$.”', false],
      ['$Q$ only if $P$.', 'Q -> P', '“$Q$ only if $P$” means $Q$ cannot happen without $P$: $Q \\to P$.', false]];
    var fm = R.pick(forms), ans = fm[1] === 'P -> Q' ? '$P \\to Q$' : '$Q \\to P$';
    return { q: (fm[3] ? 'Let $P$: “' + sc[0] + '” and $Q$: “' + sc[1] + '.” ' : '') + 'Which formula says: “' + fm[0] + '”', a: mc(ans, ['$P \\to Q$', '$Q \\to P$', '$P \\leftrightarrow Q$', '$\\neg P \\to \\neg Q$'].filter(function (x) { return x !== ans; })),
      steps: [fm[2], 'So it is ' + ans + '. A conditional is not the same as its converse, and it is weaker than a biconditional.'], hint: 'Ask which part guarantees the other.' };
  });

  G('disc.logical-equivalence', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['demorgan', 'english', 'contra']), R.pick(['equiv', 'demorgan', 'english', 'contra']), R.pick(['equiv', 'differ', 'neg']));
    if (shape === 'demorgan' || shape === 'neg') {
      var pool = shape === 'neg' ? [['~(P -> Q)', ['P & ~Q'], ['~P -> ~Q', '~P & Q', '~P | ~Q', 'Q -> P']], ['~(P <-> Q)', ['P <-> ~Q'], ['~P <-> ~Q', '~P & ~Q', 'P & Q']], ['~(P -> ~Q)', ['P & Q'], ['~P -> Q', '~P & ~Q', 'P -> Q']]]
        : [['~(P & Q)', ['~P | ~Q'], ['~P & ~Q', '~P & Q', 'P | Q']], ['~(P | Q)', ['~P & ~Q'], ['~P | ~Q', 'P & Q', '~P | Q']], ['~(P & ~Q)', ['~P | Q'], ['~P & Q', '~P & ~Q', 'P | Q']], ['~(~P | Q)', ['P & ~Q'], ['P | ~Q', '~P & ~Q', 'P & Q']], ['~(P | ~Q)', ['~P & Q'], ['~P | Q', 'P & Q', '~P & ~Q']]];
      var it = R.pick(pool), right = it[1][0], wr = it[2].filter(function (x) { return !equivF(x, it[0]); });
      return { q: 'Which statement is logically equivalent to $' + ltex(it[0]) + '$?', a: mc('$' + ltex(right) + '$', wr.slice(0, 3).map(function (x) { return '$' + ltex(x) + '$'; })),
        steps: shape === 'neg' ? ['$P \\to Q$ is false exactly when $P$ is true and $Q$ is false.', 'So its negation is true exactly then: $' + ltex(it[0]) + ' \\equiv ' + ltex(right) + '$.']
          : ['De Morgan: $\\neg(A \\wedge B) \\equiv \\neg A \\vee \\neg B$ and $\\neg(A \\vee B) \\equiv \\neg A \\wedge \\neg B$. The negation moves inside and the connective flips.', 'A double negation cancels: $\\neg\\neg A \\equiv A$.', 'So $' + ltex(it[0]) + ' \\equiv ' + ltex(right) + '$.'],
        hint: shape === 'neg' ? 'When is $P \\to Q$ false?' : 'Push the $\\neg$ inside and flip $\\wedge$ and $\\vee$.' };
    }
    if (shape === 'equiv' || shape === 'differ') {
      var pairs = [['P -> Q', '~Q -> ~P'], ['P -> Q', 'Q -> P'], ['P -> Q', '~P -> ~Q'], ['P -> Q', '~P | Q'], ['~(P & Q)', '~P & ~Q'], ['~(P | Q)', '~P & ~Q'], ['P | (Q & R)', '(P | Q) & (P | R)'],
        ['P & (Q | R)', '(P & Q) | R'], ['P <-> Q', '(P -> Q) & (Q -> P)'], ['~(P -> Q)', '~P -> ~Q'], ['P -> (Q -> R)', '(P & Q) -> R'], ['(P -> Q) -> R', 'P -> (Q -> R)'], ['P -> (Q & R)', '(P -> Q) & (P -> R)'],
        ['(P | Q) -> R', '(P -> R) & (Q -> R)'], ['(P & Q) -> R', '(P -> R) & (Q -> R)'], ['P -> Q', 'P & ~Q'], ['P | Q', '~P -> Q'], ['P <-> Q', '~P <-> ~Q']];
      var pr = R.pick(pairs), vs = lsortVars(lvars(pr[0]).concat(lvars(pr[1])).filter(function (v, i, a) { return a.indexOf(v) === i; })), rs = rows(vs);
      var c1 = column(pr[0], vs), c2 = column(pr[1], vs), diff = c1.filter(function (b, i) { return b !== c2[i]; }).length;
      var stp = ['Compare the two columns row by row (' + rs.length + ' rows).'].concat(rs.map(function (e, i) { return rowWords(e, vs) + ': ' + tfWord(c1[i]) + ' and ' + tfWord(c2[i]) + (c1[i] !== c2[i] ? ' <b>(differ)</b>' : '') + '.'; }));
      if (shape === 'differ') return { q: 'In how many rows of the truth table do $' + ltex(pr[0]) + '$ and $' + ltex(pr[1]) + '$ have different truth values? (Type $0$ if they are equivalent.)', a: num(diff), steps: stp.concat([diff ? 'They differ in ' + diff + ' row' + (diff === 1 ? '' : 's') + ', so they are not equivalent.' : 'They never differ, so they are equivalent.']), hint: 'Make one table with a column for each statement.' };
      return { q: 'Are $' + ltex(pr[0]) + '$ and $' + ltex(pr[1]) + '$ logically equivalent?', a: tf(!diff), steps: stp.concat([diff ? 'One row with different values is enough: they are not equivalent.' : 'The columns match in every row, so they are equivalent.']), hint: 'Equivalent means the same truth value in every row.' };
    }
    if (shape === 'english') {
      var s = R.pick([['the store is open', 'the lights are on', 'the store is not open', 'the lights are not on'], ['Sam is at home', 'Sam is asleep', 'Sam is not at home', 'Sam is not asleep'],
        ['the number is even', 'the number is greater than $10$', 'the number is not even', 'the number is not greater than $10$'], ['the test is today', 'the test is hard', 'the test is not today', 'the test is not hard']]);
      var andCase = R.coin();
      var q2 = 'Which sentence means the same as “It is not true that ' + s[0] + (andCase ? ' and ' : ' or ') + s[1] + '”?';
      var right2 = andCase ? cap(s[2]) + ', or ' + s[3] + '.' : cap(s[2]) + ', and ' + s[3] + '.';
      var wr2 = andCase ? [cap(s[2]) + ', and ' + s[3] + '.', cap(s[0]) + ', or ' + s[1] + '.', cap(s[2]) + ', and ' + s[1] + '.'] : [cap(s[2]) + ', or ' + s[3] + '.', cap(s[0]) + ', and ' + s[1] + '.', cap(s[0]) + ', and ' + s[3] + '.'];
      return { q: q2, a: mc(right2, wr2), steps: ['Write it as $\\neg(P ' + (andCase ? '\\wedge' : '\\vee') + ' Q)$.', 'De Morgan: this is $\\neg P ' + (andCase ? '\\vee' : '\\wedge') + ' \\neg Q$. Negate each part and flip “' + (andCase ? 'and' : 'or') + '” to “' + (andCase ? 'or' : 'and') + '.”', 'So: “' + right2 + '”'], hint: 'Negate each part, and switch “and” with “or.”' };
    }
    var c = R.pick([['it rains', 'the ground is wet', 'it does not rain', 'the ground is not wet'], ['a shape is a square', 'it has four sides', 'a shape is not a square', 'it does not have four sides'],
      ['you live in Paris', 'you live in France', 'you do not live in Paris', 'you do not live in France'], ['$n$ is divisible by $4$', '$n$ is even', '$n$ is not divisible by $4$', '$n$ is odd']]);
    return { q: 'Which statement is logically equivalent to “If ' + c[0] + ', then ' + c[1] + '”?', a: mc('If ' + c[3] + ', then ' + c[2] + '.', ['If ' + c[1] + ', then ' + c[0] + '.', 'If ' + c[2] + ', then ' + c[3] + '.', cap(c[0]) + ', and ' + c[3] + '.']),
      steps: ['A conditional $P \\to Q$ is equivalent to its contrapositive $\\neg Q \\to \\neg P$.', 'The converse $Q \\to P$ and the inverse $\\neg P \\to \\neg Q$ are not equivalent to it.', 'So: “If ' + c[3] + ', then ' + c[2] + '.”'], hint: 'Swap the parts and negate both.' };
  });

  // ---------- quantifiers over small domains
  var PRED = [
    ['$x^{2} > 2x$', function (x) { return x * x > 2 * x; }], ['$x$ is prime', function (x) { return isPrime(x); }], ['$x^{2} - 5x + 6 = 0$', function (x) { return x * x - 5 * x + 6 === 0; }],
    ['$x + 3 > 2x$', function (x) { return x + 3 > 2 * x; }], ['$x$ is even', function (x) { return x % 2 === 0; }], ['$x^{3} > 20$', function (x) { return x * x * x > 20; }],
    ['$x^{2} \\ge x$', function (x) { return x * x >= x; }], ['$3x - 1 > 0$', function (x) { return 3 * x - 1 > 0; }], ['$x^{2} < 10$', function (x) { return x * x < 10; }], ['$2x + 1$ is prime', function (x) { return isPrime(2 * x + 1); }]
  ];
  function pVal(x) { return x < 0 ? '(' + x + ')' : String(x); }
  G('disc.quantifiers', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['finite', 'count', 'finite']), R.pick(['finite', 'domain', 'translate']), R.pick(['domain', 'finite', 'translate']));
    if (shape === 'finite' || shape === 'count') {
      var lo = R.int(-3, 1), D = range(lo, lo + R.int(4, 5)), pr = R.pick(PRED), tv = D.map(pr[1]), all = tv.every(Boolean), some = tv.some(Boolean);
      var Dt = setTex(D), list = D.map(function (x, i) { return '$x = ' + x + '$: ' + (tv[i] ? 'true' : 'false'); }).join('; ');
      if (shape === 'count') { var k = tv.filter(Boolean).length; return { q: 'The domain is $D = ' + Dt + '$ and $P(x)$ is “' + pr[0] + '.” For how many $x$ in $D$ is $P(x)$ true?', a: num(k), steps: ['Check each element: ' + list + '.', 'True for ' + k + ' of them.'], hint: 'Test every element of the domain.' }; }
      var useAll = R.coin(), val = useAll ? all : some, wit = useAll ? D[tv.indexOf(false)] : D[tv.indexOf(true)];
      return { q: 'The domain is $D = ' + Dt + '$ and $P(x)$ is “' + pr[0] + '.” Is $' + (useAll ? '\\forall x\\, P(x)' : '\\exists x\\, P(x)') + '$ true?', a: tf(val),
        steps: ['Check each element: ' + list + '.', useAll ? (all ? 'Every element works, so $\\forall x\\, P(x)$ is true.' : 'It fails at $x = ' + wit + '$, and one failure makes “for all” false.') : (some ? 'It works at $x = ' + wit + '$, and one example makes “there exists” true.' : 'No element works, so $\\exists x\\, P(x)$ is false.')],
        hint: useAll ? 'Look for one element where $P(x)$ fails.' : 'Look for one element where $P(x)$ holds.' };
    }
    if (shape === 'domain') {
      var items = [['\\exists x\\, (x^{2} = 2)', [0, 0, 0, 1], 'The only solutions are $\\pm\\sqrt{2}$, which are real but not rational.'], ['\\exists x\\, (2x = 1)', [0, 0, 1, 1], 'The only solution is $x = \\frac{1}{2}$: rational, not an integer.'],
        ['\\forall x\\, (x^{2} \\ge x)', [1, 1, 0, 0], 'For integers $x^{2} \\ge x$ always holds, but $x = \\frac{1}{2}$ gives $\\frac{1}{4} < \\frac{1}{2}$.'], ['\\exists x\\, (x + 5 = 2)', [0, 1, 1, 1], 'The solution $x = -3$ is an integer but not a positive integer.'],
        ['\\forall x\\, (x \\ge 1)', [1, 0, 0, 0], 'Every positive integer is at least $1$, but $0$ is an integer that is not.'], ['\\exists x\\, (x^{2} = 9 \\wedge x < 0)', [0, 1, 1, 1], 'The solution is $x = -3$, which is not a positive integer.'],
        ['\\exists x\\, (3x = 2)', [0, 0, 1, 1], 'The only solution is $x = \\frac{2}{3}$.'], ['\\exists x\\, (x^{2} = 5)', [0, 0, 0, 1], 'The solutions $\\pm\\sqrt{5}$ are irrational.']];
      var names = ['the positive integers', 'the integers', 'the rational numbers', 'the real numbers'], it = R.pick(items);
      var trueIdx = range(0, 3).filter(function (i) { return it[1][i]; }), falseIdx = range(0, 3).filter(function (i) { return !it[1][i]; });
      if (R.coin() && falseIdx.length >= 1 && trueIdx.length >= 1) {
        var ti = R.pick(trueIdx);
        return { q: 'Over which domain is $' + it[0] + '$ true?', a: mc(cap(names[ti]), falseIdx.map(function (i) { return cap(names[i]); })),
          steps: [it[2], 'So the statement is true over ' + names[ti] + ' and false over ' + falseIdx.map(function (i) { return names[i]; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.'], hint: 'Solve it first, then ask which number systems contain the solution.' };
      }
      var di = R.int(0, 3);
      return { q: 'Over ' + names[di] + ', is $' + it[0] + '$ true?', a: tf(!!it[1][di]), steps: [it[2], 'So over ' + names[di] + ' it is ' + tfWord(!!it[1][di]) + '.'], hint: 'The same formula can be true over one domain and false over another.' };
    }
    var t = R.pick([['student in the class', 'passed the test', 'P'], ['dog at the park', 'is on a leash', 'L'], ['light in the hall', 'is on', 'O'], ['number in the list', 'is positive', 'S']]);
    var f2 = R.pick([['Every ' + t[0] + ' ' + t[1] + '.', '\\forall x\\, ' + t[2] + '(x)'], ['Some ' + t[0] + ' ' + t[1] + '.', '\\exists x\\, ' + t[2] + '(x)'], ['Some ' + t[0] + ' ' + t[1].replace(/^is /, 'is not ').replace(/^passed/, 'did not pass') + '.', '\\exists x\\, \\neg ' + t[2] + '(x)'], ['No ' + t[0] + ' ' + t[1] + '.', '\\forall x\\, \\neg ' + t[2] + '(x)']]);
    var all4 = ['\\forall x\\, ' + t[2] + '(x)', '\\exists x\\, ' + t[2] + '(x)', '\\exists x\\, \\neg ' + t[2] + '(x)', '\\forall x\\, \\neg ' + t[2] + '(x)'];
    return { q: 'The domain is every ' + t[0] + ', and $' + t[2] + '(x)$ means “$x$ ' + t[1] + '.” Which formula says: “' + f2[0] + '”', a: mc('$' + f2[1] + '$', all4.filter(function (x) { return x !== f2[1]; }).map(function (x) { return '$' + x + '$'; })),
      steps: ['“Every” and “all” become $\\forall$; “some” and “there is” become $\\exists$ (at least one).', '“No ' + t[0] + ' ' + t[1] + '” means every one of them does not: $\\forall x\\, \\neg ' + t[2] + '(x)$.', 'So the answer is $' + f2[1] + '$.'], hint: 'Decide first: is it about all of them, or at least one?' };
  });

  G('disc.negating-quantifiers', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['english', 'english', 'symbolic']), R.pick(['symbolic', 'english', 'witness']), R.pick(['witness', 'symbolic']));
    if (shape === 'english') {
      var s = R.pick([['dog in the park', 'is on a leash', 'is not on a leash'], ['student', 'turned in the homework', 'did not turn in the homework'], ['prime number', 'is odd', 'is not odd'], ['bus today', 'was on time', 'was not on time'], ['light in the house', 'is off', 'is not off']]);
      var kind = R.pick(['all', 'some', 'none']);
      if (kind === 'all') return { q: 'Which sentence is the negation of “Every ' + s[0] + ' ' + s[1] + '”?', a: mc('At least one ' + s[0] + ' ' + s[2] + '.', ['No ' + s[0] + ' ' + s[1] + '.', 'Every ' + s[0] + ' ' + s[2] + '.', 'At least one ' + s[0] + ' ' + s[1] + '.']),
        steps: ['The statement is $\\forall x\\, P(x)$. Its negation is $\\exists x\\, \\neg P(x)$.', 'To show “every one does” is false, you need just one that does not.', 'So: “At least one ' + s[0] + ' ' + s[2] + '.” “None do” is too strong: it is not the negation.'], hint: 'What would it take to prove the statement wrong?' };
      if (kind === 'some') return { q: 'Which sentence is the negation of “Some ' + s[0] + ' ' + s[1] + '”?', a: mc('No ' + s[0] + ' ' + s[1] + '.', ['Some ' + s[0] + ' ' + s[2] + '.', 'Every ' + s[0] + ' ' + s[1] + '.', 'At least one ' + s[0] + ' ' + s[1] + '.']),
        steps: ['The statement is $\\exists x\\, P(x)$. Its negation is $\\forall x\\, \\neg P(x)$.', 'That says every one of them fails, which is the same as “none of them do.”', 'So: “No ' + s[0] + ' ' + s[1] + '.”'], hint: 'The negation of “at least one” is “not even one.”' };
      return { q: 'Which sentence is the negation of “No ' + s[0] + ' ' + s[1] + '”?', a: mc('At least one ' + s[0] + ' ' + s[1] + '.', ['Every ' + s[0] + ' ' + s[1] + '.', 'At least one ' + s[0] + ' ' + s[2] + '.', 'No ' + s[0] + ' ' + s[2] + '.']),
        steps: ['“No ' + s[0] + ' ' + s[1] + '” is $\\forall x\\, \\neg P(x)$.', 'Its negation is $\\exists x\\, \\neg\\neg P(x) \\equiv \\exists x\\, P(x)$.', 'So: “At least one ' + s[0] + ' ' + s[1] + '.”'], hint: 'One example is enough to break “none.”' };
    }
    if (shape === 'symbolic') {
      var pool = [['\\neg \\forall x\\, P(x)', '\\exists x\\, \\neg P(x)', ['\\forall x\\, \\neg P(x)', '\\exists x\\, P(x)', '\\neg \\exists x\\, P(x)']],
        ['\\neg \\exists x\\, P(x)', '\\forall x\\, \\neg P(x)', ['\\exists x\\, \\neg P(x)', '\\forall x\\, P(x)', '\\neg \\forall x\\, P(x)']],
        ['\\neg \\forall x\\, (P(x) \\to Q(x))', '\\exists x\\, (P(x) \\wedge \\neg Q(x))', ['\\exists x\\, (\\neg P(x) \\to \\neg Q(x))', '\\forall x\\, (P(x) \\wedge \\neg Q(x))', '\\exists x\\, (P(x) \\to \\neg Q(x))']],
        ['\\neg \\exists x\\, (P(x) \\wedge Q(x))', '\\forall x\\, (P(x) \\to \\neg Q(x))', ['\\forall x\\, (\\neg P(x) \\wedge \\neg Q(x))', '\\exists x\\, (\\neg P(x) \\wedge \\neg Q(x))', '\\forall x\\, (P(x) \\wedge \\neg Q(x))']],
        ['\\neg \\forall x\\, (x^{2} \\ge 0)', '\\exists x\\, (x^{2} < 0)', ['\\forall x\\, (x^{2} < 0)', '\\exists x\\, (x^{2} \\le 0)', '\\forall x\\, (x^{2} \\le 0)']],
        ['\\neg \\exists x\\, (x^{2} = 2)', '\\forall x\\, (x^{2} \\ne 2)', ['\\exists x\\, (x^{2} \\ne 2)', '\\forall x\\, (x^{2} = 2)', '\\exists x\\, (x^{2} = -2)']],
        ['\\neg \\forall x\\, (x > 0 \\to x^{2} > x)', '\\exists x\\, (x > 0 \\wedge x^{2} \\le x)', ['\\exists x\\, (x \\le 0 \\wedge x^{2} \\le x)', '\\forall x\\, (x > 0 \\to x^{2} \\le x)', '\\exists x\\, (x > 0 \\to x^{2} < x)']]];
      var it = R.pick(L === 1 ? pool.slice(0, 2) : pool);
      return { q: 'Which statement is equivalent to $' + it[0] + '$?', a: mc('$' + it[1] + '$', it[2].map(function (x) { return '$' + x + '$'; })),
        steps: ['Move the $\\neg$ past the quantifier and switch it: $\\neg\\forall \\equiv \\exists\\neg$ and $\\neg\\exists \\equiv \\forall\\neg$.', /\\to/.test(it[0]) ? 'Then negate the inside: $\\neg(P \\to Q) \\equiv P \\wedge \\neg Q$.' : /wedge/.test(it[0]) ? 'Then negate the inside: $\\neg(P \\wedge Q) \\equiv \\neg P \\vee \\neg Q \\equiv P \\to \\neg Q$.' : 'Then negate the inside: the negation of $\\ge$ is $<$, and the negation of $=$ is $\\ne$.', 'Result: $' + it[1] + '$.'],
        hint: 'Switch the quantifier, then negate what is inside.' };
    }
    // witnesses of the negation over {1, …, k}
    var fam = [['$n^{2} + 1$ is prime', function (n) { return isPrime(n * n + 1); }, function (n) { return n * n + 1; }], ['$2^{n} + 1$ is prime', function (n) { return isPrime(M.pow(2, n) + 1); }, function (n) { return M.pow(2, n) + 1; }],
      ['$n^{2} + n + 1$ is prime', function (n) { return isPrime(n * n + n + 1); }, function (n) { return n * n + n + 1; }], ['$3n + 2$ is prime', function (n) { return isPrime(3 * n + 2); }, function (n) { return 3 * n + 2; }],
      ['$n! + 1$ is prime', function (n) { return isPrime(fact(n) + 1); }, function (n) { return fact(n) + 1; }], ['$4n + 1$ is prime', function (n) { return isPrime(4 * n + 1); }, function (n) { return 4 * n + 1; }],
      ['$n^{2} + 4$ is prime', function (n) { return isPrime(n * n + 4); }, function (n) { return n * n + 4; }]];
    var fm = R.pick(fam), k = R.int(5, 7), Dn = range(1, k), bad = Dn.filter(function (n) { return !fm[1](n); });
    return { q: 'Let $D = ' + setTex(Dn) + '$ and consider “$\\forall n \\in D$, ' + fm[0] + '.” Its negation is “$\\exists n \\in D$ such that ' + fm[0].replace(/is prime/, 'is not prime') + '.” List every $n$ in $D$ that makes the negation true.', a: setA(bad),
      steps: ['Compute for each $n$: ' + Dn.map(function (n) { return '$n = ' + n + '$: $' + fm[2](n) + '$' + (fm[1](n) ? ' (prime)' : ' (<b>not prime</b>)'); }).join('; ') + '.', 'The witnesses are $' + setTex(bad) + '$. ' + (bad.length ? 'Any one of them shows the original “for all” statement is false.' : '')],
      hint: 'A witness for “there exists $n$ with … not prime” is an $n$ where the formula gives a composite number (or $1$).' };
  });

  G('disc.nested-quantifiers', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['grid', 'grid', 'negate']), R.pick(['grid', 'arith', 'negate']), R.pick(['arith', 'real', 'grid']));
    var QS = [['\\forall x\\, \\exists y', function (D, p) { return D.every(function (x) { return D.some(function (y) { return p(x, y); }); }); }, 'every $x$ has at least one partner $y$'],
      ['\\exists y\\, \\forall x', function (D, p) { return D.some(function (y) { return D.every(function (x) { return p(x, y); }); }); }, 'one single $y$ works for every $x$'],
      ['\\exists x\\, \\forall y', function (D, p) { return D.some(function (x) { return D.every(function (y) { return p(x, y); }); }); }, 'one single $x$ works with every $y$'],
      ['\\forall y\\, \\exists x', function (D, p) { return D.every(function (y) { return D.some(function (x) { return p(x, y); }); }); }, 'every $y$ has at least one partner $x$']];
    if (shape === 'grid') {
      var D = [1, 2, 3], g = [], qi = R.int(0, 3), tries = 0, Q4, val;
      do { g = D.map(function () { return D.map(function () { return R.chance(0.45); }); }); Q4 = QS[qi]; val = Q4[1](D, function (x, y) { return g[x - 1][y - 1]; }); tries++; } while (tries < 30 && (QS[0][1](D, function (x, y) { return g[x - 1][y - 1]; }) === QS[1][1](D, function (x, y) { return g[x - 1][y - 1]; })) && R.chance(0.8));
      var arr = '\\begin{array}{c|ccc} P(x, y) & y = 1 & y = 2 & y = 3 \\\\ \\hline ' + D.map(function (x) { return 'x = ' + x + ' & ' + g[x - 1].map(TF).join(' & '); }).join(' \\\\ ') + ' \\end{array}';
      var why = qi === 0 ? D.map(function (x) { var y = g[x - 1].indexOf(true); return 'row $x = ' + x + '$: ' + (y >= 0 ? 'a T at $y = ' + (y + 1) + '$' : 'no T'); }).join('; ')
        : qi === 3 ? D.map(function (y) { var x = D.filter(function (xx) { return g[xx - 1][y - 1]; })[0]; return 'column $y = ' + y + '$: ' + (x ? 'a T at $x = ' + x + '$' : 'no T'); }).join('; ')
          : qi === 1 ? D.map(function (y) { var ok = D.every(function (x) { return g[x - 1][y - 1]; }); return 'column $y = ' + y + '$: ' + (ok ? 'all T' : 'not all T'); }).join('; ')
            : D.map(function (x) { var ok = g[x - 1].every(Boolean); return 'row $x = ' + x + '$: ' + (ok ? 'all T' : 'not all T'); }).join('; ');
      return { q: 'The domain is $\\{1, 2, 3\\}$. The table shows when $P(x, y)$ is true (rows are $x$, columns are $y$). $$' + arr + '$$ Is $' + Q4[0] + '\\, P(x, y)$ true?', a: tf(val),
        steps: ['$' + Q4[0] + '\\, P(x, y)$ says ' + Q4[2] + '.', 'Check: ' + why + '.', 'So the statement is ' + tfWord(val) + '.'], hint: 'Read the quantifiers left to right: the first one is chosen first.' };
    }
    if (shape === 'arith') {
      var Ds = R.pick([[1, 2, 3, 4], [0, 1, 2, 3], [-1, 0, 1, 2], [1, 2, 3, 4, 5]]);
      var preds = [['x + y = 5', function (x, y) { return x + y === 5; }], ['x < y', function (x, y) { return x < y; }], ['x \\le y', function (x, y) { return x <= y; }], ['x + y \\text{ is even}', function (x, y) { return (x + y) % 2 === 0; }],
        ['xy = 0', function (x, y) { return x * y === 0; }], ['xy \\text{ is even}', function (x, y) { return (x * y) % 2 === 0; }], ['|x - y| = 1', function (x, y) { return M.abs(x - y) === 1; }], ['x \\ne y', function (x, y) { return x !== y; }]];
      var pr = R.pick(preds), qi2 = R.int(0, 3), v2 = QS[qi2][1](Ds, pr[1]);
      var detail;
      if (qi2 === 0 || qi2 === 3) {
        var outer = qi2 === 0 ? 'x' : 'y';
        detail = Ds.map(function (a) { var b = Ds.filter(function (bb) { return qi2 === 0 ? pr[1](a, bb) : pr[1](bb, a); }); return '$' + outer + ' = ' + a + '$: ' + (b.length ? 'partner ' + (qi2 === 0 ? '$y = ' : '$x = ') + b[0] + '$' : 'no partner'); }).join('; ');
      } else {
        var o2 = qi2 === 1 ? 'y' : 'x';
        detail = Ds.map(function (a) { var bad = Ds.filter(function (bb) { return qi2 === 1 ? !pr[1](bb, a) : !pr[1](a, bb); }); return '$' + o2 + ' = ' + a + '$: ' + (bad.length ? 'fails for ' + (qi2 === 1 ? '$x = ' : '$y = ') + bad[0] + '$' : 'works for all'); }).join('; ');
      }
      return { q: 'The domain is $' + setTex(Ds) + '$. Is $' + QS[qi2][0] + '\\, (' + pr[0] + ')$ true?', a: tf(v2), steps: ['The statement says ' + QS[qi2][2] + '.', 'Check: ' + detail + '.', 'So it is ' + tfWord(v2) + '.'], hint: 'Try each choice of the outer variable in turn.' };
    }
    if (shape === 'real') {
      var facts = [['\\forall x\\, \\exists y\\, (y > x)', true, 'Given $x$, take $y = x + 1$.'], ['\\exists y\\, \\forall x\\, (y > x)', false, 'No single $y$ is bigger than every $x$: the choice $x = y$ fails.'],
        ['\\forall x\\, \\exists y\\, (x + y = 0)', true, 'Given $x$, take $y = -x$.'], ['\\exists y\\, \\forall x\\, (x + y = x)', true, 'Take $y = 0$: it works for every $x$.'],
        ['\\forall x\\, \\exists y\\, (xy = 1)', false, 'At $x = 0$, $xy = 0$ for every $y$.'], ['\\forall x\\, \\exists y\\, (y^{2} = x)', false, 'At $x = -1$, no real $y$ has $y^{2} = -1$.'],
        ['\\exists x\\, \\forall y\\, (xy = 0)', true, 'Take $x = 0$.'], ['\\forall y\\, \\exists x\\, (x^{2} = y)', false, 'At $y = -4$, no real $x$ works.'], ['\\exists x\\, \\forall y\\, (x \\le y^{2})', true, 'Take $x = 0$: $0 \\le y^{2}$ for every $y$.'],
        ['\\forall x\\, \\exists y\\, (y < x)', true, 'Given $x$, take $y = x - 1$.'], ['\\exists x\\, \\forall y\\, (y < x)', false, 'Whatever $x$ is, $y = x$ is not less than $x$.']];
      var f3 = R.pick(facts);
      return { q: 'The domain is the real numbers. Is $' + f3[0] + '$ true?', a: tf(f3[1]), steps: ['Read left to right: the first quantifier is decided first, and the second may depend on it.', f3[2], 'So it is ' + tfWord(f3[1]) + '.'], hint: 'For $\\forall\\exists$, give a recipe for $y$ in terms of $x$. For $\\exists\\forall$, one value must work for everything.' };
    }
    var ng = R.pick([['\\forall x\\, \\exists y\\, P(x, y)', '\\exists x\\, \\forall y\\, \\neg P(x, y)', ['\\exists x\\, \\exists y\\, \\neg P(x, y)', '\\forall x\\, \\exists y\\, \\neg P(x, y)', '\\exists y\\, \\forall x\\, \\neg P(x, y)']],
      ['\\exists x\\, \\forall y\\, P(x, y)', '\\forall x\\, \\exists y\\, \\neg P(x, y)', ['\\forall x\\, \\forall y\\, \\neg P(x, y)', '\\exists x\\, \\exists y\\, \\neg P(x, y)', '\\forall y\\, \\exists x\\, \\neg P(x, y)']],
      ['\\forall x\\, \\forall y\\, P(x, y)', '\\exists x\\, \\exists y\\, \\neg P(x, y)', ['\\forall x\\, \\forall y\\, \\neg P(x, y)', '\\exists x\\, \\forall y\\, \\neg P(x, y)', '\\forall x\\, \\exists y\\, \\neg P(x, y)']]]);
    return { q: 'Which statement is the negation of $' + ng[0] + '$?', a: mc('$' + ng[1] + '$', ng[2].map(function (x) { return '$' + x + '$'; })),
      steps: ['Move $\\neg$ left to right through the quantifiers, switching each one: $\\forall$ becomes $\\exists$ and $\\exists$ becomes $\\forall$.', 'Keep the order of the variables.', 'Result: $' + ng[1] + '$.'], hint: 'Switch every quantifier, keep the order, and negate $P$.' };
  });

  G('disc.valid-arguments', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['name', 'valid']), R.pick(['name', 'conclude', 'valid']), R.pick(['conclude', 'counter', 'name']));
    var st = R.pick([['it snows', 'school is closed', 'it does not snow', 'school is not closed'], ['the battery is dead', 'the car will not start', 'the battery is not dead', 'the car starts'],
      ['you water the plant', 'it grows', 'you do not water the plant', 'it does not grow'], ['$n$ is divisible by $6$', '$n$ is even', '$n$ is not divisible by $6$', '$n$ is odd']]);
    var forms = [['mp', 'Modus ponens', true, 'P', 'Q', 'If $P$ then $Q$; $P$; so $Q$.'], ['mt', 'Modus tollens', true, '~Q', '~P', 'If $P$ then $Q$; not $Q$; so not $P$.'],
      ['ac', 'Affirming the consequent', false, 'Q', 'P', 'If $P$ then $Q$; $Q$; so $P$.'], ['da', 'Denying the antecedent', false, '~P', '~Q', 'If $P$ then $Q$; not $P$; so not $Q$.']];
    function sayL(x) { return x === 'P' ? st[0] : x === 'Q' ? st[1] : x === '~P' ? st[2] : st[3]; }
    if (shape === 'name' || shape === 'valid') {
      var fm = R.pick(forms), text = 'If ' + st[0] + ', then ' + st[1] + '. ' + cap(sayL(fm[3])) + '. Therefore, ' + sayL(fm[4]) + '.';
      var prem = ['P -> Q', fm[3]], con = fm[4], valid = rows(['P', 'Q']).every(function (e) { return !prem.every(function (p) { return lev(p, e); }) || lev(con, e); });
      if (valid !== fm[2]) throw new Error('validity table mismatch');
      var ce = rows(['P', 'Q']).filter(function (e) { return prem.every(function (p) { return lev(p, e); }) && !lev(con, e); })[0];
      var steps = ['In symbols: ' + fm[5], valid ? 'In every row where both premises are true, the conclusion is true too, so the form is valid.' : 'The row ' + rowWords(ce, ['P', 'Q']) + ' makes both premises true and the conclusion false, so the form is invalid.'];
      if (shape === 'valid') return { q: 'Is this argument valid?<br>“' + text + '”', a: tf(valid), steps: steps, hint: 'Look for a case where the premises are true and the conclusion is false.' };
      return { q: 'Which form does this argument have?<br>“' + text + '”', a: mc(fm[1] + (fm[2] ? ' (valid)' : ' (invalid)'), forms.filter(function (x) { return x !== fm; }).map(function (x) { return x[1] + (x[2] ? ' (valid)' : ' (invalid)'); })),
        steps: steps, hint: 'Write it with $P$ and $Q$. Which part is asserted in the second premise?' };
    }
    if (shape === 'conclude') {
      var pool = [[['P -> Q', 'Q -> R', '~R'], '~P', 'Two steps of modus tollens: not $R$ gives not $Q$, which gives not $P$.'], [['P | Q', '~P'], 'Q', 'Disjunctive syllogism: one of them is true, and it is not $P$.'],
        [['P -> Q', 'Q -> R', 'P'], 'R', 'Modus ponens twice: $P$ gives $Q$, which gives $R$.'], [['P | Q', 'P -> R', 'Q -> R'], 'R', 'Proof by cases: either way, $R$ follows.'],
        [['P -> Q', '~Q | R', 'P'], 'R', '$P$ gives $Q$; then $\\neg Q \\vee R$ with $Q$ true leaves $R$.'], [['~P -> Q', '~Q'], 'P', 'Modus tollens: not $Q$ gives not (not $P$), that is, $P$.']];
      var it = R.pick(pool), entails = function (c) { var vs = ['P', 'Q', 'R']; return rows(vs).every(function (e) { return !it[0].every(function (p) { return lev(p, e); }) || lev(c, e); }); };
      if (!entails(it[1])) throw new Error('bad conclusion');
      var cand = ['P', 'Q', 'R', '~P', '~Q', '~R', 'P & Q', '~P & R'].filter(function (c) { return !entails(c); });
      return { q: 'Premises: $' + it[0].map(ltex).join('$, $') + '$. Which conclusion follows validly?', a: mc('$' + ltex(it[1]) + '$', R.sample(cand, 3).map(function (c) { return '$' + ltex(c) + '$'; })),
        steps: [it[2], 'The other choices can be false while all the premises are true, so they do not follow.'], hint: 'Chain the premises together, starting from the one that is a single letter or its negation.' };
    }
    var fm2 = R.pick(forms.filter(function (f) { return !f[2]; })), prem2 = ['P -> Q', fm2[3]], ce2 = rows(['P', 'Q']).filter(function (e) { return prem2.every(function (p) { return lev(p, e); }) && !lev(fm2[4], e); })[0];
    var opts = rows(['P', 'Q']).map(function (e) { return '$' + rowTex(e, ['P', 'Q']) + '$'; }), right = '$' + rowTex(ce2, ['P', 'Q']) + '$';
    return { q: 'The argument “$P \\to Q$; $' + ltex(fm2[3]) + '$; therefore $' + ltex(fm2[4]) + '$” is invalid. Which row of the truth table shows this?', a: mc(right, opts.filter(function (o) { return o !== right; })),
      steps: ['We need a row where both premises are true and the conclusion is false.', 'With ' + rowWords(ce2, ['P', 'Q']) + ': $P \\to Q$ is true, $' + ltex(fm2[3]) + '$ is true, but $' + ltex(fm2[4]) + '$ is false.', 'That row is a counterexample, so the form is invalid (' + fm2[1].toLowerCase() + ').'], hint: 'Make the conclusion false first, then check the premises.' };
  });

// ---- 02-proofs.js
  // ================================================================ Unit 2: Proof Techniques
  var BOX = '\\boxed{\\;?\\;}';
  // integer polynomials in one variable, low -> high coefficients
  function pAdd(a, b) { var r = []; for (var i = 0; i < M.max(a.length, b.length); i++) r.push((a[i] || 0) + (b[i] || 0)); return r; }
  function pMul(a, b) { var r = []; a.forEach(function (x, i) { b.forEach(function (y, j) { r[i + j] = (r[i + j] || 0) + x * y; }); }); for (var k = 0; k < r.length; k++) r[k] = r[k] || 0; return r; }
  function pScale(a, s) { return a.map(function (x) { return x * s; }); }
  function pPow(a, n) { var r = [1]; for (var i = 0; i < n; i++) r = pMul(r, a); return r; }
  function pTrim(a) { a = a.slice(); while (a.length > 1 && !a[a.length - 1]) a.pop(); return a; }
  function pTex(a, v) { return T.poly(pTrim(a).slice().reverse(), v); }
  function pPlain(a, v) { a = pTrim(a); var t = []; for (var i = a.length - 1; i >= 0; i--) t.push([a[i], i ? v + (i > 1 ? '^' + i : '') : '']); return plainTerms(t); }
  function pEval(a, x) { return a.reduce(function (s, c, i) { return s + c * M.pow(x, i); }, 0); }

  // claims "for every positive integer n (or prime p), …" with their smallest counterexample, found by search
  var CLAIMS = [
    { t: '$n^{2} + 1$ is prime', f: function (n) { return isPrime(n * n + 1); }, v: function (n) { return n * n + 1; }, lv: 1 },
    { t: '$2n + 1$ is prime', f: function (n) { return isPrime(2 * n + 1); }, v: function (n) { return 2 * n + 1; }, lv: 1 },
    { t: '$6n + 1$ is prime', f: function (n) { return isPrime(6 * n + 1); }, v: function (n) { return 6 * n + 1; }, lv: 1 },
    { t: '$4n + 3$ is prime', f: function (n) { return isPrime(4 * n + 3); }, v: function (n) { return 4 * n + 3; }, lv: 1 },
    { t: '$2^{n} + 1$ is prime', f: function (n) { return isPrime(M.pow(2, n) + 1); }, v: function (n) { return M.pow(2, n) + 1; }, lv: 1 },
    { t: '$n! + 1$ is prime', f: function (n) { return isPrime(fact(n) + 1); }, v: function (n) { return fact(n) + 1; }, lv: 2 },
    { t: '$3 \\cdot 2^{n} - 1$ is prime', f: function (n) { return isPrime(3 * M.pow(2, n) - 1); }, v: function (n) { return 3 * M.pow(2, n) - 1; }, lv: 2 },
    { t: '$n^{2} + n + 1$ is prime', f: function (n) { return isPrime(n * n + n + 1); }, v: function (n) { return n * n + n + 1; }, lv: 2 },
    { t: '$6n - 1$ is prime', f: function (n) { return isPrime(6 * n - 1); }, v: function (n) { return 6 * n - 1; }, lv: 2 },
    { t: '$n^{2} + 3n + 1$ is prime', f: function (n) { return isPrime(n * n + 3 * n + 1); }, v: function (n) { return n * n + 3 * n + 1; }, lv: 2 },
    { t: '$2^{n} > n^{2}$', f: function (n) { return M.pow(2, n) > n * n; }, v: function (n) { return '2^{' + n + '} = ' + M.pow(2, n) + '$ and $' + n + '^{2} = ' + n * n; }, lv: 2, cmp: true },
    { t: '$n^{3} < 3^{n}$', f: function (n) { return n * n * n < M.pow(3, n); }, v: function (n) { return n + '^{3} = ' + n * n * n + '$ and $3^{' + n + '} = ' + M.pow(3, n); }, lv: 2, cmp: true },
    { t: '$n$ is a sum of at most three perfect squares (like $6 = 4 + 1 + 1$)', f: function (n) { for (var a = 0; a * a <= n; a++) for (var b = 0; a * a + b * b <= n; b++) { var c = n - a * a - b * b, r = M.round(M.sqrt(c)); if (r * r === c) return true; } return false; }, v: function (n) { return null; }, lv: 3, words: true },
    { t: '$n^{2} + n + 11$ is prime', f: function (n) { return isPrime(n * n + n + 11); }, v: function (n) { return n * n + n + 11; }, lv: 3 },
    { t: '$n^{2} + n + 17$ is prime', f: function (n) { return isPrime(n * n + n + 17); }, v: function (n) { return n * n + n + 17; }, lv: 3 },
    { t: '$n^{2} - n + 41$ is prime', f: function (n) { return isPrime(n * n - n + 41); }, v: function (n) { return n * n - n + 41; }, lv: 3 },
    { t: '$2^{p} - 1$ is prime', f: function (n) { return isPrime(M.pow(2, n) - 1); }, v: function (n) { return M.pow(2, n) - 1; }, lv: 3, prime: true },
    { t: '$2p + 1$ is prime', f: function (n) { return isPrime(2 * n + 1); }, v: function (n) { return 2 * n + 1; }, lv: 2, prime: true },
    { t: '$6p + 1$ is prime', f: function (n) { return isPrime(6 * n + 1); }, v: function (n) { return 6 * n + 1; }, lv: 3, prime: true }];
  function firstFail(c) { for (var n = c.prime ? 2 : 1; n < 200; n++) { if (c.prime && !isPrime(n)) continue; if (!c.f(n)) return n; } return null; }
  function failWhy(c, n) {
    var v = c.v(n);
    if (c.words) return '$' + n + '$ is not a sum of three squares: the squares below it are $0, 1, 4$, and no three of them add to $' + n + '$.';
    if (c.cmp) return 'At $n = ' + n + '$: $' + v + '$, so the inequality fails.';
    var fs = U.primeFactors(v);
    return 'At $' + (c.prime ? 'p' : 'n') + ' = ' + n + '$ the value is $' + v + (v < 2 ? '$, which is not prime.' : ' = ' + fs.join(' \\cdot ') + '$, which is not prime.');
  }
  function claimText(c) { return 'for every ' + (c.prime ? 'prime $p$' : 'positive integer $n$') + ', ' + c.t; }

  G('disc.counterexamples', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['smallest', 'smallest', 'agree']), R.pick(['smallest', 'which', 'which']), R.pick(['tfce', 'smallest', 'which']));
    if (shape === 'smallest' || shape === 'agree') {
      var pool = CLAIMS.filter(function (c) { return shape === 'agree' ? c.lv <= 2 && firstFail(c) > 3 : c.lv <= L; });
      var c = R.pick(pool), n0 = firstFail(c), x = c.prime ? 'p' : 'n';
      var checks = []; for (var k = c.prime ? 2 : 1; k < n0; k++) { if (c.prime && !isPrime(k)) continue; checks.push(k); }
      var stp = [checks.length ? 'Check in order: ' + (checks.length > 8 ? 'every ' + (c.prime ? 'prime' : 'value') + ' below $' + n0 + '$ works (' + checks.slice(0, 4).map(function (k) { return '$' + x + ' = ' + k + '$'; }).join(', ') + ', …).' : checks.map(function (k) { var v = c.v(k); return '$' + x + ' = ' + k + '$' + (c.cmp || c.words ? ' works' : ': $' + v + '$ is prime'); }).join('; ') + '.') : 'Start with the first ' + (c.prime ? 'prime' : 'value') + '.', failWhy(c, n0)];
      if (shape === 'agree') return { q: 'Claim: ' + claimText(c) + '. A student checks ' + checks.slice(0, 3).map(function (k) { return '$' + x + ' = ' + k + '$'; }).join(', ') + ' and finds that it works each time. Does this prove the claim?',
        a: mc('No. Examples can never prove a claim about every ' + (c.prime ? 'prime' : 'positive integer') + '.', ['Yes. Three examples that work are enough.', 'Yes, because the examples include both even and odd numbers.', 'No, but checking up to $' + x + ' = 10$ would prove it.']),
        steps: ['A “for every” claim needs an argument that covers every case. Examples that agree only show it is not yet disproved.', 'In fact it is false: ' + failWhy(c, n0)], hint: 'How many cases does a “for every” claim cover?' };
      return { q: 'Claim: ' + claimText(c) + '. Find the smallest counterexample.', a: num(n0), steps: stp.concat(['So the smallest counterexample is $' + x + ' = ' + n0 + '$.']), hint: 'Test ' + (c.prime ? 'the primes' : '$n = 1, 2, 3, \\ldots$') + ' in order until the claim fails.' };
    }
    if (shape === 'which') {
      var pool2 = [['If $x > 0$, then $x^{2} > x$.', ['$x = \\frac{1}{2}$'], ['$x = -2$', '$x = 3$', '$x = 2$'], 'At $x = \\frac{1}{2}$: $x > 0$ but $x^{2} = \\frac{1}{4}$ is not more than $\\frac{1}{2}$. The choice $x = -2$ does not satisfy $x > 0$, so it cannot be a counterexample.'],
        ['If $x > 0$, then $x^{3} > x$.', ['$x = \\frac{1}{2}$'], ['$x = -2$', '$x = 2$', '$x = 5$'], 'At $x = \\frac{1}{2}$: $x^{3} = \\frac{1}{8} < \\frac{1}{2}$. At $x = -2$ the conclusion fails ($-8 < -2$), but the hypothesis $x > 0$ fails too.'],
        ['If $n$ is odd, then $n^{2} - 1$ is divisible by $16$.', ['$n = 3$'], ['$n = 1$', '$n = 2$', '$n = 7$'], 'At $n = 3$: $n^{2} - 1 = 8$, which is not divisible by $16$. ($n = 1$ gives $0$ and $n = 7$ gives $48$, both divisible by $16$; $n = 2$ is not odd.)'],
        ['If $a^{2} = b^{2}$, then $a = b$.', ['$a = 2, b = -2$'], ['$a = 3, b = 3$', '$a = 2, b = 3$', '$a = -1, b = -1$'], 'With $a = 2, b = -2$: $a^{2} = b^{2} = 4$ but $a \\ne b$. ($a = 2, b = 3$ fails the hypothesis.)'],
        ['If $x < y$, then $x^{2} < y^{2}$.', ['$x = -3, y = 1$'], ['$x = 1, y = 2$', '$x = 2, y = 1$', '$x = 0, y = 5$'], 'With $x = -3, y = 1$: $x < y$, but $x^{2} = 9$ is not less than $y^{2} = 1$. ($x = 2, y = 1$ fails the hypothesis.)'],
        ['If $n$ is prime, then $n$ is odd.', ['$n = 2$'], ['$n = 9$', '$n = 3$', '$n = 15$'], '$2$ is prime and even. ($9$ and $15$ are odd but not prime, so they do not satisfy the hypothesis.)'],
        ['If $n$ is divisible by $4$ and by $6$, then $n$ is divisible by $24$.', ['$n = 12$'], ['$n = 24$', '$n = 8$', '$n = 48$'], '$12$ is divisible by $4$ and by $6$ but not by $24$. ($8$ is not divisible by $6$.)'],
        ['If $n^{2}$ is divisible by $4$, then $n$ is divisible by $4$.', ['$n = 2$'], ['$n = 4$', '$n = 3$', '$n = 8$'], '$2^{2} = 4$ is divisible by $4$, but $2$ is not. ($n = 3$ fails the hypothesis.)'],
        ['If $x \\ne 0$, then $\\frac{1}{x} < x$.', ['$x = \\frac{1}{3}$'], ['$x = 2$', '$x = 0$', '$x = 5$'], 'At $x = \\frac{1}{3}$: $\\frac{1}{x} = 3$, which is not less than $\\frac{1}{3}$. ($x = 0$ fails the hypothesis.)']];
      var it = R.pick(pool2);
      return { q: 'Which choice is a counterexample to this claim?<br>“' + it[0] + '”', a: mc(it[1][0], it[2]),
        steps: ['A counterexample must make the hypothesis true and the conclusion false.', it[3]], hint: 'Check the hypothesis first, then the conclusion.' };
    }
    // true or false, with the smallest counterexample
    var trues = [['$n^{2} + n$ is even', 'Either $n$ or $n + 1$ is even, so their product $n(n + 1) = n^{2} + n$ is even.'], ['$n^{3} - n$ is divisible by $6$', '$n^{3} - n = (n - 1)n(n + 1)$ is a product of three consecutive integers: one is even and one is a multiple of $3$.'],
      ['$2^{n} \\ge n + 1$', 'It holds at $n = 1$, and each step doubles the left side but adds only $1$ to the right.'], ['$(n + 1)^{2} - n^{2}$ is odd', '$(n + 1)^{2} - n^{2} = 2n + 1$, which is odd.'], ['$n^{2} + n + 1$ is odd', '$n^{2} + n$ is even, so adding $1$ gives an odd number.']];
    if (R.chance(0.35)) {
      var tr = R.pick(trues);
      return { q: 'True or false: for every positive integer $n$, ' + tr[0] + '. If it is false, give the smallest counterexample; if it is true, type $0$.', a: multi([part('The claim is', tf(true)), part('Smallest counterexample:', num(0))]),
        steps: ['It is true, so there is no counterexample.', tr[1], 'Answer: true, and $0$ in the second box.'], hint: 'Try a few values. If nothing fails, look for a reason.' };
    }
    var c3 = R.pick(CLAIMS.filter(function (c) { return !c.prime && c.lv >= 2; })), n3 = firstFail(c3);
    return { q: 'True or false: ' + claimText(c3) + '. If it is false, give the smallest counterexample; if it is true, type $0$.', a: multi([part('The claim is', tf(false)), part('Smallest counterexample:', num(n3))]),
      steps: ['Test $n = 1, 2, 3, \\ldots$ in order.', failWhy(c3, n3), 'So the claim is false, and the smallest counterexample is $n = ' + n3 + '$.'], hint: 'Test the values in order until one fails.' };
  });

  // m = c·a + r, n = c·b + s
  function residueWord(c, r) { return c === 2 ? (r ? 'odd' : 'even') : null; }
  G('disc.direct-proof', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['fill', 'fill', 'first']), R.pick(['fill', 'flaw', 'first']), R.pick(['fill', 'compute', 'flaw']));
    if (shape === 'fill') {
      var c = L === 1 ? 2 : R.pick([2, 3, 4, 5]), r = R.int(L === 1 ? 0 : 1, c - 1), s = R.int(L === 1 ? 0 : 1, c - 1), op = L === 1 ? 'sum' : R.pick(['sum', 'prod', 'prod']);
      if (c === 2 && L > 1) { r = 1; s = R.int(0, 1); }
      var blank, rem, blankTex, why;
      if (op === 'sum') { var q0 = M.floor((r + s) / c); rem = (r + s) % c; blank = plainTerms([[1, 'a'], [1, 'b'], [q0, '']]); blankTex = blank; why = '$m + n = ' + T.terms([[c, 'a'], [c, 'b'], [r + s, '']]) + ' = ' + c + '(' + blankTex + ')' + (rem ? ' + ' + rem : '') + '$.'; }
      else { var q1 = M.floor(r * s / c); rem = (r * s) % c; var terms = [[c, 'ab'], [s, 'a'], [r, 'b'], [q1, '']]; blankTex = T.terms(terms); blank = plainTerms([[c, 'a*b'], [s, 'a'], [r, 'b'], [q1, '']]);
        why = '$mn = (' + T.lin(c, 'a', r) + ')(' + T.lin(c, 'b', s) + ') = ' + T.terms([[c * c, 'ab'], [c * s, 'a'], [c * r, 'b'], [r * s, '']]) + ' = ' + c + '(' + blankTex + ')' + (rem ? ' + ' + rem : '') + '$.'; }
      var mT = T.lin(c, 'a', r), nT = T.lin(c, 'b', s), sym = op === 'sum' ? 'm + n' : 'mn';
      var intro = c === 2 ? 'Let $m = ' + mT + '$ and $n = ' + nT + '$ be ' + (r === s ? residueWord(2, r) + ' integers' : 'an ' + residueWord(2, r) + ' and an ' + residueWord(2, s) + ' integer') + ' ($a$ and $b$ are integers).' : 'Let $m = ' + mT + '$ and $n = ' + nT + '$ for integers $a$ and $b$.';
      return { q: intro + ' A direct proof writes $' + sym + ' = ' + c + '\\,' + BOX + (rem ? ' + ' + rem : '') + '$. What expression goes in the box?', a: expr(blank, ['a', 'b']),
        steps: [op === 'sum' ? 'Add: ' + why : 'Multiply and expand: ' + why, 'The box holds $' + blankTex + '$, an integer because $a$ and $b$ are integers.', c === 2 ? 'So $' + sym + '$ is ' + (rem ? 'odd' : 'even') + '.' : 'So $' + sym + '$ leaves remainder $' + rem + '$ when divided by $' + c + '$.'],
        hint: (op === 'sum' ? 'Add the two expressions' : 'Expand the product') + ', then factor $' + c + '$ out of every term you can.' };
    }
    if (shape === 'compute') {
      var a1 = R.pick([3, 5, 7, 9]), b1 = R.pick([1, 3, 5, 7, 9]), ev = R.coin();
      if (ev) { var blank2 = plainTerms([[a1, 'k'], [(a1 + b1) / 2, '']]); return { q: 'Claim: if $n$ is odd, then $' + T.lin(a1, 'n', b1) + '$ is even. Write $n = 2k + 1$. Then $' + T.lin(a1, 'n', b1) + ' = 2\\,' + BOX + '$. What goes in the box?', a: expr(blank2, ['k']),
        steps: ['Substitute: $' + a1 + '(2k + 1) + ' + b1 + ' = ' + (2 * a1) + 'k + ' + (a1 + b1) + '$.', 'Factor out $2$: $' + (2 * a1) + 'k + ' + (a1 + b1) + ' = 2(' + T.lin(a1, 'k', (a1 + b1) / 2) + ')$.', 'The box is $' + T.lin(a1, 'k', (a1 + b1) / 2) + '$, an integer, so the number is even.'], hint: 'Substitute $2k + 1$ for $n$ and expand.' }; }
      var b2 = R.pick([2, 4, 6, 8]); var blank3 = plainTerms([[a1, 'k'], [(a1 + b2 - 1) / 2, '']]);
      return { q: 'Claim: if $n$ is odd, then $' + T.lin(a1, 'n', b2) + '$ is odd. Write $n = 2k + 1$. Then $' + T.lin(a1, 'n', b2) + ' = 2\\,' + BOX + ' + 1$. What goes in the box?', a: expr(blank3, ['k']),
        steps: ['Substitute: $' + a1 + '(2k + 1) + ' + b2 + ' = ' + (2 * a1) + 'k + ' + (a1 + b2) + '$.', 'Split off $1$: $' + (2 * a1) + 'k + ' + (a1 + b2 - 1) + ' + 1 = 2(' + T.lin(a1, 'k', (a1 + b2 - 1) / 2) + ') + 1$.', 'The box is $' + T.lin(a1, 'k', (a1 + b2 - 1) / 2) + '$, so the number is odd.'], hint: 'Substitute $2k + 1$ for $n$, expand, and pull out a $2$.' };
    }
    if (shape === 'first') {
      var pool = [['if $n$ is odd, then $n^{2}$ is odd', 'Suppose $n$ is odd, so $n = 2k + 1$ for some integer $k$.', ['Suppose $n^{2}$ is odd.', 'Suppose $n = 1$; then $n^{2} = 1$ is odd.', 'Suppose $n$ is even, so $n = 2k$.']],
        ['if $m$ and $n$ are even, then $m + n$ is even', 'Suppose $m = 2a$ and $n = 2b$ for some integers $a$ and $b$.', ['Suppose $m = 2k$ and $n = 2k$ for some integer $k$.', 'Suppose $m + n$ is even.', 'Suppose $m = 2$ and $n = 4$.']],
        ['if $a \\mid b$ and $b \\mid c$, then $a \\mid c$ (here $a \\mid b$ means $b = ak$ for some integer $k$)', 'Suppose $b = ak$ and $c = bj$ for some integers $k$ and $j$.', ['Suppose $c = ak$ for some integer $k$.', 'Suppose $b = ak$ and $c = bk$ for the same integer $k$.', 'Suppose $a = 2$, $b = 4$ and $c = 8$.']],
        ['if $n$ is a multiple of $3$, then $n^{2}$ is a multiple of $9$', 'Suppose $n = 3k$ for some integer $k$.', ['Suppose $n^{2} = 9k$ for some integer $k$.', 'Suppose $n = 3$.', 'Suppose $n = 3k + 1$ for some integer $k$.']],
        ['if $x$ and $y$ are rational, then $x + y$ is rational', 'Suppose $x = \\frac{a}{b}$ and $y = \\frac{c}{d}$ with integers $a, b, c, d$ and $b, d \\ne 0$.', ['Suppose $x + y = \\frac{a}{b}$.', 'Suppose $x = \\frac{a}{b}$ and $y = \\frac{a}{b}$.', 'Suppose $x = \\frac{1}{2}$ and $y = \\frac{1}{3}$.']]];
      var it = R.pick(pool);
      return { q: 'Which line correctly begins a direct proof of this claim: ' + it[0] + '?', a: mc(it[1], it[2]),
        steps: ['A direct proof of “if $P$, then $Q$” assumes $P$ and rewrites it with a definition.', 'Each object gets its own letter, since the numbers may be different, and the letters stand for any value, not one example.', 'So it begins: ' + it[1]], hint: 'Start from the hypothesis, written with the definition, in full generality.' };
    }
    var fl = R.pick([['Claim: the sum of two even integers is a multiple of $4$. “Proof”: Let the even integers be $2k$ and $2k$. Their sum is $4k$, a multiple of $4$.', 'Using the same $k$ for both numbers assumes they are equal.', ['The sum $4k$ is not even.', 'Even integers should be written as $2k + 1$.', 'Nothing is wrong; the claim is true.'], 'With different numbers, $2a + 2b = 2(a + b)$, which need not be a multiple of $4$: $2 + 4 = 6$. The claim is false.'],
      ['Claim: $n^{2} + n$ is even for every integer $n$. “Proof”: For $n = 1, 2, 3, 4$ we get $2, 6, 12, 20$, all even.', 'Checking a few cases does not prove a statement about every integer.', ['The arithmetic is wrong.', 'It also needs $n = 0$; then it would be a proof.', 'Nothing is wrong.'], 'The claim happens to be true ($n^{2} + n = n(n + 1)$, and one of two consecutive integers is even), but examples are not a proof.'],
      ['Claim: if $n^{2}$ is even, then $n$ is even. “Proof”: Suppose $n$ is even, so $n = 2k$. Then $n^{2} = 4k^{2} = 2(2k^{2})$, which is even.', 'It proves the converse, “if $n$ is even, then $n^{2}$ is even.”', ['The algebra $(2k)^{2} = 4k^{2}$ is wrong.', 'It should check $n = 0$ separately.', 'Nothing is wrong.'], 'It started from the conclusion. A correct proof could use the contrapositive: if $n$ is odd, then $n^{2}$ is odd.'],
      ['Claim: if $x^{2} = 9$, then $x = 3$. “Proof”: Suppose $x = 3$. Then $x^{2} = 9$.', 'It proves the converse, and the claim itself is false.', ['The arithmetic $3^{2} = 9$ is wrong.', 'It should have used a two-column proof.', 'Nothing is wrong.'], 'Starting from $x = 3$ proves “if $x = 3$, then $x^{2} = 9$.” And $x = -3$ is a counterexample to the claim.']]);
    return { q: 'What is wrong with this argument?<br>' + fl[0], a: mc(fl[1], fl[2]), steps: [fl[1], fl[3]], hint: 'Compare what was assumed with what the claim says.' };
  });

  G('disc.contrapositive-proof', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['setup', 'tf', 'setup']), R.pick(['setup', 'fill', 'english']), R.pick(['fill', 'english', 'setup']));
    var pool = [['If $n^{2}$ is even, then $n$ is even.', 'Assume $n$ is odd, and prove $n^{2}$ is odd.', ['Assume $n$ is even, and prove $n^{2}$ is even.', 'Assume $n^{2}$ is odd, and prove $n$ is odd.', 'Assume $n^{2}$ is even, and prove $n$ is odd.'], 'If $n$ is odd, then $n^{2}$ is odd.'],
      ['If $3n + 5$ is odd, then $n$ is even.', 'Assume $n$ is odd, and prove $3n + 5$ is even.', ['Assume $n$ is even, and prove $3n + 5$ is odd.', 'Assume $3n + 5$ is even, and prove $n$ is odd.', 'Assume $3n + 5$ is odd, and prove $n$ is odd.'], 'If $n$ is odd, then $3n + 5$ is even.'],
      ['If $mn$ is even, then $m$ is even or $n$ is even.', 'Assume $m$ and $n$ are both odd, and prove $mn$ is odd.', ['Assume $m$ is odd or $n$ is odd, and prove $mn$ is odd.', 'Assume $m$ is even or $n$ is even, and prove $mn$ is even.', 'Assume $mn$ is odd, and prove $m$ and $n$ are both odd.'], 'If $m$ and $n$ are both odd, then $mn$ is odd.'],
      ['If $x + y \\ge 10$, then $x \\ge 5$ or $y \\ge 5$.', 'Assume $x < 5$ and $y < 5$, and prove $x + y < 10$.', ['Assume $x < 5$ or $y < 5$, and prove $x + y < 10$.', 'Assume $x \\ge 5$ or $y \\ge 5$, and prove $x + y \\ge 10$.', 'Assume $x + y < 10$, and prove $x < 5$ and $y < 5$.'], 'If $x < 5$ and $y < 5$, then $x + y < 10$.'],
      ['If $n^{2}$ is not a multiple of $3$, then $n$ is not a multiple of $3$.', 'Assume $n$ is a multiple of $3$, and prove $n^{2}$ is a multiple of $3$.', ['Assume $n^{2}$ is a multiple of $3$, and prove $n$ is a multiple of $3$.', 'Assume $n$ is not a multiple of $3$, and prove $n^{2}$ is not a multiple of $3$.', 'Assume $n^{2}$ is not a multiple of $3$, and prove $n$ is a multiple of $3$.'], 'If $n$ is a multiple of $3$, then $n^{2}$ is a multiple of $3$.']];
    if (shape === 'setup') {
      var it = R.pick(pool);
      return { q: 'To prove “' + it[0].replace(/\.$/, '') + '” by contrapositive, what do you assume and what do you prove?', a: mc(it[1], it[2]),
        steps: ['The contrapositive of $P \\to Q$ is $\\neg Q \\to \\neg P$, and it is logically equivalent.', 'Here it reads: “' + it[3] + '”', 'So: ' + it[1].charAt(0).toLowerCase() + it[1].slice(1)], hint: 'Negate both parts and swap them.' };
    }
    if (shape === 'english') {
      var it2 = R.pick(pool);
      var wr = it2[2].map(function (w) { var m = /^Assume (.*), and prove (.*)\.$/.exec(w); return 'If ' + m[1] + ', then ' + m[2] + '.'; });
      return { q: 'Which statement is the contrapositive of “' + it2[0].replace(/\.$/, '') + '”?', a: mc(it2[3], wr), steps: ['Swap the two parts and negate each one: $\\neg Q \\to \\neg P$.', /or/.test(it2[0]) ? 'Negating an “or” gives an “and” (De Morgan).' : 'Negating “even” gives “odd,” and so on.', 'Result: “' + it2[3] + '”'], hint: 'Negate the conclusion; it becomes the new hypothesis.' };
    }
    if (shape === 'tf') {
      var facts = [['A conditional and its contrapositive are always both true or both false.', true, 'They are logically equivalent: their truth tables match.'], ['A conditional and its converse are always both true or both false.', false, '“If $n = 2$, then $n$ is even” is true, but its converse “if $n$ is even, then $n = 2$” is false.'],
        ['Proving “if $Q$, then $P$” also proves “if $P$, then $Q$.”', false, 'That is the converse, a different statement.'], ['Proving “if not $Q$, then not $P$” proves “if $P$, then $Q$.”', true, 'That is the contrapositive, which is equivalent.'],
        ['The contrapositive of “if $P$, then $Q$” is “if not $P$, then not $Q$.”', false, '“If not $P$, then not $Q$” is the inverse. The contrapositive is “if not $Q$, then not $P$.”']];
      var f = R.pick(facts);
      return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'Compare $P \\to Q$, its converse $Q \\to P$ and its contrapositive $\\neg Q \\to \\neg P$.' };
    }
    var a1 = R.pick([3, 5, 7]), odd = R.coin(), b1 = odd ? R.pick([1, 3, 5, 7]) : R.pick([2, 4, 6]);
    var claimC = odd ? 'if $' + T.lin(a1, 'n', b1) + '$ is odd, then $n$ is even' : 'if $' + T.lin(a1, 'n', b1) + '$ is even, then $n$ is even';
    var k0 = odd ? (a1 + b1) / 2 : (a1 + b1 - 1) / 2, bl = plainTerms([[a1, 'k'], [k0, '']]);
    return { q: 'To prove “' + claimC + '” by contrapositive, assume $n$ is odd: $n = 2k + 1$. Then $' + T.lin(a1, 'n', b1) + ' = 2\\,' + BOX + (odd ? '' : ' + 1') + '$. What goes in the box?', a: expr(bl, ['k']),
      steps: ['The contrapositive: if $n$ is odd, then $' + T.lin(a1, 'n', b1) + '$ is ' + (odd ? 'even' : 'odd') + '.', 'Substitute: $' + a1 + '(2k + 1) + ' + b1 + ' = ' + (2 * a1) + 'k + ' + (a1 + b1) + (odd ? ' = 2(' + T.lin(a1, 'k', k0) + ')' : ' = 2(' + T.lin(a1, 'k', k0) + ') + 1') + '$.', 'The box is $' + T.lin(a1, 'k', k0) + '$, which finishes the proof.'], hint: 'Substitute $n = 2k + 1$ and factor out $2$.' };
  });

  G('disc.proof-by-cases', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['missing', 'fill', 'missing']), R.pick(['fill', 'remainders', 'missing']), R.pick(['remainders', 'cover', 'fill']));
    if (shape === 'missing') {
      var pool = [['$n^{2} + n$ is even for every integer $n$', ['$n = 2k$'], '$n = 2k + 1$ (n odd)', ['$n = 0$', '$n = 2k + 2$', '$n < 0$']],
        ['$n^{2}$ leaves remainder $0$ or $1$ when divided by $3$, for every integer $n$', ['$n = 3k$', '$n = 3k + 1$'], '$n = 3k + 2$', ['$n = 3k + 3$', '$n = 2k + 1$', '$n = 0$']],
        ['$|xy| = |x|\\,|y|$ for all real numbers $x$ and $y$', ['$x \\ge 0$ and $y \\ge 0$', '$x \\ge 0$ and $y < 0$', '$x < 0$ and $y \\ge 0$'], '$x < 0$ and $y < 0$', ['$x = 0$ and $y = 0$', '$x > 0$ and $y > 0$', '$x = y$']],
        ['$x^{2} \\ge 0$ for every real number $x$', ['$x > 0$', '$x < 0$'], '$x = 0$', ['$x \\ge 1$', '$-1 < x < 0$', '$x$ is irrational']],
        ['$n^{2} \\ge n$ for every integer $n$', ['$n \\ge 1$', '$n \\le -1$'], '$n = 0$', ['$n \\ge 2$', '$n$ is even', '$n = 1$']],
        ['$n^{3} - n$ is divisible by $3$ for every integer $n$', ['$n = 3k$', '$n = 3k + 1$'], '$n = 3k + 2$', ['$n = 3k + 3$', '$n = 3k - 3$', '$n = 6k$']]];
      var it = R.pick(pool);
      return { q: 'A proof that ' + it[0] + ' treats these cases: ' + it[1].join('; ') + '. Which case is missing?', a: mc(it[2].replace(/ \(n odd\)/, ''), it[3]),
        steps: ['The cases must cover every possibility.', 'Every number not covered by the listed cases falls under ' + it[2].replace(/ \(n odd\)/, '') + '.', 'The other choices are already covered, or do not fill the gap.'], hint: 'Find a value that none of the listed cases covers.' };
    }
    if (shape === 'fill') {
      var c = L === 1 ? 2 : R.pick([3, 3, 4, 5]), r = R.int(1, c - 1), kind = L === 3 && c === 3 && R.coin() ? 'cube' : 'square';
      var lin = [r, c], P2 = kind === 'cube' ? pAdd(pPow(lin, 3), pScale(lin, -1)) : pPow(lin, 2);
      var rem = ((P2[0] % c) + c) % c, blank = pAdd(P2, [-rem]).map(function (x) { return x / c; });
      var lhs = kind === 'cube' ? 'n^{3} - n' : 'n^{2}';
      return { q: 'In the case $n = ' + T.lin(c, 'k', r) + '$, write $' + lhs + ' = ' + c + '\\,' + BOX + (rem ? ' + ' + rem : '') + '$. What polynomial in $k$ goes in the box?', a: expr(pPlain(blank, 'k'), ['k']),
        steps: ['Expand: $' + (kind === 'cube' ? '(' + T.lin(c, 'k', r) + ')^{3} - (' + T.lin(c, 'k', r) + ')' : '(' + T.lin(c, 'k', r) + ')^{2}') + ' = ' + pTex(P2, 'k') + '$.',
          'Factor $' + c + '$ out of every term except the remainder $' + rem + '$: $' + pTex(P2, 'k') + ' = ' + c + '(' + pTex(blank, 'k') + ')' + (rem ? ' + ' + rem : '') + '$.', 'So in this case $' + lhs + '$ leaves remainder $' + rem + '$ when divided by $' + c + '$.'],
        hint: 'Expand, then pull $' + c + '$ out of all the terms with a $k$.' };
    }
    if (shape === 'remainders') {
      var cc = R.pick([3, 4, 5, 6, 8]), f = R.pick([['n^{2}', function (x) { return x * x; }], ['n^{2}', function (x) { return x * x; }], ['n^{3}', function (x) { return x * x * x; }], ['n^{2} + n', function (x) { return x * x + x; }]]);
      var res = range(0, cc - 1).map(function (x) { return f[1](x) % cc; }), set = U.uniq(res.map(String)).map(Number).sort(function (a, b) { return a - b; });
      return { q: 'What remainders can $' + f[0] + '$ leave when divided by $' + cc + '$, for an integer $n$? List every possible remainder.', a: setA(set),
        steps: ['Every integer is $' + cc + 'k + r$ with $r$ one of $' + range(0, cc - 1).join(', ') + '$, and $' + f[0] + '$ has the same remainder as it has for $n = r$. So there are ' + cc + ' cases.', range(0, cc - 1).map(function (x) { return '$r = ' + x + '$: ' + f[1](x) + ' → remainder $' + res[x] + '$'; }).join('; ') + '.', 'Possible remainders: $' + setTex(set) + '$.'],
        hint: 'Only the remainder of $n$ matters. Try $n = 0, 1, \\ldots, ' + (cc - 1) + '$.' };
    }
    var lists = [[['2k', '2k + 1'], [[2, 0], [2, 1]]], [['3k', '3k + 1'], [[3, 0], [3, 1]]], [['4k', '4k + 1', '4k + 3'], [[4, 0], [4, 1], [4, 3]]], [['2k', '4k + 1', '4k + 3'], [[2, 0], [4, 1], [4, 3]]],
      [['2k', '4k + 1'], [[2, 0], [4, 1]]], [['3k', '3k + 2', '6k + 1'], [[3, 0], [3, 2], [6, 1]]], [['3k', '3k + 1', '3k + 2'], [[3, 0], [3, 1], [3, 2]]], [['6k', '6k + 1', '6k + 5'], [[6, 0], [6, 1], [6, 5]]],
      [['4k', '4k + 2', '2k + 1'], [[4, 0], [4, 2], [2, 1]]], [['3k', '6k + 1', '6k + 2', '6k + 5'], [[3, 0], [6, 1], [6, 2], [6, 5]]]];
    function covers(l) { return range(0, 11).every(function (x) { return l[1].some(function (p) { return x % p[0] === p[1]; }); }); }
    var good = lists.filter(covers), bad = lists.filter(function (l) { return !covers(l); });
    var g = R.pick(good), fmt = function (l) { return l[0].map(function (s) { return '$n = ' + s + '$'; }).join(', '); };
    var miss = function (l) { for (var x = 0; x < 12; x++) if (!l[1].some(function (p) { return x % p[0] === p[1]; })) return x; return null; };
    var bads = R.sample(bad, 3);
    return { q: 'Which list of cases covers every integer $n$ (with $k$ an integer)?', a: mc(fmt(g), bads.map(fmt)),
      steps: ['A list covers every integer when every remainder appears. It is enough to check $n = 0, 1, \\ldots, 11$.', 'For ' + fmt(g) + ', each of $0, 1, \\ldots, 11$ fits one of the cases.', 'Each other list misses a value: ' + bads.map(function (l) { return fmt(l) + ' misses $n = ' + miss(l) + '$'; }).join('; ') + '.'],
      hint: 'For each list, look for a small number that none of the cases produces.' };
  });

  G('disc.contradiction-proof', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['assume', 'assume', 'rational']), R.pick(['assume', 'sqrt', 'rational']), R.pick(['sqrt', 'euclid', 'assume']));
    if (shape === 'assume') {
      var pool = [['$\\sqrt{3}$ is irrational.', 'Suppose $\\sqrt{3} = \\frac{a}{b}$ for integers $a$ and $b \\ne 0$, with the fraction in lowest terms.', ['Suppose $\\sqrt{3}$ is irrational.', 'Suppose $\\sqrt{3}$ is an integer.', 'Suppose $\\sqrt{3} = 1.732$.']],
        ['There is no largest even integer.', 'Suppose there is a largest even integer $N$.', ['Suppose there is no largest even integer.', 'Suppose every even integer is larger than $N$.', 'Suppose $N$ is odd.']],
        ['There are infinitely many primes.', 'Suppose there are only finitely many primes, $p_{1}, p_{2}, \\ldots, p_{k}$.', ['Suppose there are infinitely many primes.', 'Suppose every integer is prime.', 'Suppose $2$ is the only even prime.']],
        ['If $n^{2}$ is even, then $n$ is even.', 'Suppose $n^{2}$ is even and $n$ is odd.', ['Suppose $n^{2}$ is odd and $n$ is even.', 'Suppose $n^{2}$ is even and $n$ is even.', 'Suppose $n^{2}$ is odd.']],
        ['No integer is both even and odd.', 'Suppose some integer $n$ is both even and odd.', ['Suppose every integer is both even and odd.', 'Suppose $n$ is even.', 'Suppose no integer is even.']],
        ['For every integer $n$, $n^{2} + 2$ is not divisible by $4$.', 'Suppose there is an integer $n$ with $n^{2} + 2$ divisible by $4$.', ['Suppose $n^{2} + 2$ is divisible by $4$ for every integer $n$.', 'Suppose $n^{2} + 2$ is not divisible by $4$.', 'Suppose $n$ is even.']],
        ['If $x$ is irrational, then $x + 1$ is irrational.', 'Suppose $x$ is irrational and $x + 1$ is rational.', ['Suppose $x$ is rational and $x + 1$ is irrational.', 'Suppose $x + 1$ is irrational.', 'Suppose $x$ and $x + 1$ are both rational.']]];
      var it = R.pick(pool);
      return { q: 'A proof by contradiction of this statement should start from which assumption?<br>“' + it[0] + '”', a: mc(it[1], it[2]),
        steps: ['A proof by contradiction assumes the exact negation of the statement and reasons to something impossible.', /^If/.test(it[0]) ? 'The negation of “if $P$, then $Q$” is “$P$ and not $Q$.”' : /every/.test(it[0]) || /For every/.test(it[0]) ? 'The negation of “for every” is “there is at least one.”' : 'Negate the whole claim.', 'So: ' + it[1]],
        hint: 'Write the exact negation of the whole statement.' };
    }
    if (shape === 'sqrt') {
      var p = R.pick([2, 3, 5, 7]);
      return { q: 'Proof that $\\sqrt{' + p + '}$ is irrational: suppose $\\sqrt{' + p + '} = \\frac{a}{b}$ in lowest terms. Then $a^{2} = ' + p + 'b^{2}$, so $' + p + ' \\mid a^{2}$, and since $' + p + '$ is prime, $' + p + ' \\mid a$. Write $a = ' + p + 'c$. Then $b^{2}$ equals what, in terms of $c$?', a: expr(p + '*c^2', ['c']),
        steps: ['Substitute $a = ' + p + 'c$ into $a^{2} = ' + p + 'b^{2}$: $' + (p * p) + 'c^{2} = ' + p + 'b^{2}$.', 'Divide by $' + p + '$: $b^{2} = ' + p + 'c^{2}$.', 'So $' + p + ' \\mid b$ too. Then $' + p + '$ divides both $a$ and $b$, which contradicts “lowest terms.”'], hint: 'Substitute $a = ' + p + 'c$ into $a^{2} = ' + p + 'b^{2}$.' };
    }
    if (shape === 'rational') {
      var qn = R.int(1, 9), qd = R.pick([2, 3, 4, 5, 6, 8]), rn = R.int(1, 9), rd = R.pick([2, 3, 4, 5, 6]);
      var qv = ML.Q(qn, qd), rv = ML.Q(rn, rd), x = qv.sub(rv);
      if (x.isZero()) { qn++; qv = ML.Q(qn, qd); x = qv.sub(rv); }
      return { q: 'To prove “a rational number plus an irrational number is irrational,” suppose $x$ is irrational, $r = ' + rv.toTex() + '$, and $x + r = ' + qv.toTex() + '$. Solve for $x$. (The answer shows why this is a contradiction.)', a: num(x.toString()),
        steps: ['$x = ' + qv.toTex() + ' - ' + rv.toTex() + ' = ' + x.toTex() + '$.', 'A difference of two fractions is a fraction, so $x$ would be rational.', 'That contradicts “$x$ is irrational,” so $x + r$ cannot be rational.'], hint: 'Subtract $r$ from both sides.' };
    }
    var k = R.int(2, 6), primes = [2, 3, 5, 7, 11, 13].slice(0, k), N = primes.reduce(function (a, b) { return a * b; }, 1) + 1, pr = R.pick(primes);
    if (R.coin()) return { q: 'Euclid’s argument: if $' + primes.join(', ') + '$ were all the primes, consider $N = ' + primes.join(' \\cdot ') + ' + 1 = ' + commas(N) + '$. What is the remainder when $N$ is divided by $' + pr + '$?', a: num(1),
      steps: ['$' + pr + '$ divides the product $' + primes.join(' \\cdot ') + '$.', 'So $N$ is one more than a multiple of $' + pr + '$: the remainder is $1$.', 'The same holds for every prime on the list, so a prime factor of $N$ would be a new prime: a contradiction.'], hint: 'What is the remainder of the product itself?' };
    var isP = isPrime(N);
    return { q: 'Let $N = ' + primes.join(' \\cdot ') + ' + 1 = ' + commas(N) + '$. Is $N$ prime?', a: tf(isP),
      steps: isP ? ['Test primes up to $\\sqrt{' + N + '}$: none divides it.', 'So $N$ is prime.', 'Euclid’s proof does not need this: it only uses that no prime on the list divides $N$.'] : ['$N = ' + U.primeFactors(N).join(' \\cdot ') + '$, so it is not prime.', 'Its prime factors are not on the list, which is all Euclid’s proof needs.', 'The proof never claims $N$ is prime, only that its prime factors are new.'],
      hint: isP ? 'Try dividing by primes up to the square root.' : 'Try primes larger than ' + primes[primes.length - 1] + '.' };
  });

// ---- 03-sets.js
  // ================================================================ Unit 3: Sets and Functions
  // sets whose elements may be numbers or sets (arrays)
  function sCanon(e) { if (typeof e === 'number') return String(e); return '{' + U.uniq(e.map(sCanon)).sort().join(',') + '}'; }
  function sTex(e) { if (typeof e === 'number') return String(e); return e.length ? '\\{' + e.map(sTex).join(', ') + '\\}' : '\\varnothing'; }
  function sIn(x, S) { var c = sCanon(x); return S.some(function (e) { return sCanon(e) === c; }); }
  function sSub(X, S) { return X.every(function (x) { return sIn(x, S); }); }
  function sSize(S) { return U.uniq(S.map(sCanon)).length; }
  function relMap(A, B, pairs, o) { return { name: 'disc-relation', opts: Object.assign({ mode: 'map', A: A.map(String), B: B.map(String), pairs: pairs.map(function (p) { return [String(p[0]), String(p[1])]; }), quiet: true, edit: false }, o || {}) }; }
  function pairsWords(ps) { return ps.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', '); }
  // set expressions on A, B via logic: A -> P, B -> Q
  var SETX = { 'A^{c}': '~P', 'B^{c}': '~Q', 'A \\cup B': 'P | Q', 'A \\cap B': 'P & Q', 'A \\setminus B': 'P & ~Q', 'B \\setminus A': 'Q & ~P', '(A \\cup B)^{c}': '~(P | Q)', '(A \\cap B)^{c}': '~(P & Q)',
    'A^{c} \\cap B^{c}': '~P & ~Q', 'A^{c} \\cup B^{c}': '~P | ~Q', 'A \\cap B^{c}': 'P & ~Q', 'A^{c} \\cap B': '~P & Q', 'A^{c} \\cup B': '~P | Q', 'A \\setminus (A \\setminus B)': 'P & ~(P & ~Q)', '(A \\cup B) \\setminus B': '(P | Q) & ~Q' };

  G('disc.sets', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['size', 'list', 'size']), R.pick(['list', 'member', 'card']), R.pick(['member', 'card', 'member']));
    if (shape === 'size') {
      var k = R.int(1, 4);
      if (k === 1) { var a = R.int(-5, 2), b = a + R.int(3, 9), lo = R.coin(), hi = R.coin(), n = b - a - 1 + (lo ? 1 : 0) + (hi ? 1 : 0);
        return { q: 'How many elements does $\\{x \\in \\mathbb{Z} : ' + a + ' ' + (lo ? '\\le' : '<') + ' x ' + (hi ? '\\le' : '<') + ' ' + b + '\\}$ have?', a: num(n),
          steps: ['The elements are the integers from $' + (lo ? a : a + 1) + '$ to $' + (hi ? b : b - 1) + '$.', 'Count them: $' + (hi ? b : b - 1) + ' - (' + (lo ? a : a + 1) + ') + 1 = ' + n + '$.'], hint: 'Check whether each end is included ($\\le$) or not ($<$).' }; }
      if (k === 2) { var N = R.int(5, 50), m = M.floor(M.sqrt(N - 1)), cnt = 2 * m + 1;
        return { q: 'How many elements does $\\{x \\in \\mathbb{Z} : x^{2} < ' + N + '\\}$ have?', a: num(cnt), steps: ['$x^{2} < ' + N + '$ holds for $x = -' + m + ', \\ldots, ' + m + '$ (and $' + (m + 1) + '^{2} = ' + (m + 1) * (m + 1) + '$ is too big).', 'That is $' + m + '$ negative integers, $0$ and $' + m + '$ positive integers: $' + cnt + '$ elements.'], hint: 'Do not forget the negative integers and $0$.' }; }
      if (k === 3) { var N3 = R.pick([12, 18, 20, 24, 28, 30, 36, 45]), d = U.factors(N3);
        return { q: 'How many elements does $\\{x \\in \\mathbb{Z}^{+} : x \\mid ' + N3 + '\\}$ have? ($x \\mid ' + N3 + '$ means $x$ divides ' + N3 + '.)', a: num(d.length), steps: ['List the positive divisors: $' + d.join(', ') + '$.', 'There are $' + d.length + '$.'], hint: 'Pair divisors: $1 \\cdot ' + N3 + '$, $2 \\cdot \\ldots$' }; }
      var D = range(-R.int(2, 3), R.int(2, 3)), sq = U.uniq(D.map(function (x) { return String(x * x); }));
      return { q: 'How many elements does $\\{k^{2} : k \\in ' + setTex(D) + '\\}$ have?', a: num(sq.length), steps: ['Square each element: $' + D.map(function (x) { return x * x; }).join(', ') + '$.', 'A set lists each element once, so the set is $' + setTex(sortN(sq.map(Number))) + '$, with $' + sq.length + '$ elements.'], hint: 'Repeated values count only once in a set.' };
    }
    if (shape === 'list') {
      var t = R.int(1, 3);
      if (t === 1) { var N2 = R.int(4, 20), r = M.floor(M.sqrt(N2)), el = range(-r, r);
        return { q: 'List the elements of $\\{x \\in \\mathbb{Z} : x^{2} \\le ' + N2 + '\\}$.', a: setA(el), steps: ['$x^{2} \\le ' + N2 + '$ means $|x| \\le \\sqrt{' + N2 + '}$, and $' + r + '^{2} = ' + r * r + ' \\le ' + N2 + ' < ' + (r + 1) * (r + 1) + '$.', 'So the set is $' + setTex(el) + '$.'], hint: 'Include negative values of $x$.' }; }
      if (t === 2) { var N4 = R.pick([10, 12, 15, 16, 18, 20, 21, 28]), dv = U.factors(N4);
        return { q: 'List the elements of $\\{x \\in \\mathbb{Z}^{+} : x \\mid ' + N4 + '\\}$.', a: setA(dv), steps: ['These are the positive divisors of $' + N4 + '$.', 'Pairs: ' + dv.filter(function (x) { return x * x <= N4; }).map(function (x) { return '$' + x + ' \\cdot ' + N4 / x + '$'; }).join(', ') + '.', 'So the set is $' + setTex(dv) + '$.'], hint: 'Find the divisors in pairs.' }; }
      var D2 = range(-R.int(1, 3), R.int(1, 3)), f = R.pick([['k^{2}', function (x) { return x * x; }], ['|k|', function (x) { return M.abs(x); }], ['k^{2} - 1', function (x) { return x * x - 1; }], ['2|k| + 1', function (x) { return 2 * M.abs(x) + 1; }]]);
      var vals = sortN(U.uniq(D2.map(function (x) { return String(f[1](x)); })).map(Number));
      return { q: 'List the elements of $\\{' + f[0] + ' : k \\in ' + setTex(D2) + '\\}$.', a: setA(vals), steps: ['Apply the rule to each $k$: ' + D2.map(function (x) { return '$' + f[1](x) + '$'; }).join(', ') + '.', 'Write each value once: $' + setTex(vals) + '$.'], hint: 'Compute the rule for every $k$, then drop repeats.' };
    }
    var pool = [1, 2, 3, [], [1], [2, 3], [1, 2], [[]]], S;
    do { S = R.sample(pool, R.int(3, 4)); } while (sSize(S) !== S.length);
    var St = '\\{' + S.map(sTex).join(', ') + '\\}';
    if (shape === 'card') {
      var S2 = R.pick([[[], [[]]], [[], [[]], [[], [[]]]], [1, [1], [[1]]], [1, 2, [1, 2]], [[], 1, [1], [1, [1]]], [[1, 2], [2, 1], [1]], [0, [0], [], [[]]]]);
      var st2 = '\\{' + S2.map(sTex).join(', ') + '\\}', sz = sSize(S2);
      return { q: 'How many elements does $' + st2 + '$ have?', a: num(sz), steps: ['Count the items separated by commas at the outermost level; a set inside counts as one element.', sz < S2.length ? 'But $\\{1, 2\\}$ and $\\{2, 1\\}$ are the same set, so it is listed twice and counts once.' : 'All of them are different: ' + S2.map(function (e) { return '$' + sTex(e) + '$'; }).join(', ') + '.', 'So the set has $' + sz + '$ element' + (sz === 1 ? '' : 's') + '.'], hint: 'An element that is itself a set still counts as just one element.' };
    }
    var cand = [], ok;
    [1, 2, 3, [], [1], [2, 3], [1, 2], [[]], [[2, 3]], [[1]]].forEach(function (x) { cand.push(['in', x]); cand.push(['sub', x]); });
    cand = cand.filter(function (c) { return c[0] === 'in' || typeof c[1] !== 'number'; });
    var pick = R.pick(cand), val = pick[0] === 'in' ? sIn(pick[1], S) : sSub(pick[1], S), xt = sTex(pick[1]);
    var why = pick[0] === 'in' ? ('$' + xt + ' \\in S$ asks whether $' + xt + '$ is one of the elements listed: ' + S.map(function (e) { return '$' + sTex(e) + '$'; }).join(', ') + '. ' + (val ? 'It is.' : 'It is not.'))
      : (pick[1].length ? '$' + xt + ' \\subseteq S$ asks whether every element of $' + xt + '$ is an element of $S$. ' + pick[1].map(function (e) { return '$' + sTex(e) + '$' + (sIn(e, S) ? ' is' : ' is not'); }).join('; ') + '.' : 'The empty set is a subset of every set: it has no element that could fail to be in $S$.');
    return { q: 'Let $S = ' + St + '$. True or false: $' + xt + (pick[0] === 'in' ? ' \\in ' : ' \\subseteq ') + 'S$.', a: tf(val), steps: [why, 'So the statement is ' + tfWord(val) + '.'], hint: '$\\in$ is about one element; $\\subseteq$ is about every element of the set on the left.' };
  });

  G('disc.set-operations', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['compute', 'compute', 'demorgan']), R.pick(['compute', 'demorgan', 'which']), R.pick(['which', 'compute', 'demorgan']));
    if (shape === 'compute') {
      var U0 = range(1, 10), A, B, ops = L === 1 ? ['A \\cup B', 'A \\cap B', 'A \\setminus B', 'A^{c}'] : ['B \\setminus A', '(A \\cup B)^{c}', 'A^{c} \\cap B', '(A \\cap B)^{c}', 'A^{c} \\cup B^{c}', 'A \\cap B^{c}'];
      var op = R.pick(ops), res, t = 0;
      do { A = sortN(R.sample(U0, R.int(3, 6))); B = sortN(R.sample(U0, R.int(3, 6))); var f = lparse(SETX[op]); res = U0.filter(function (x) { return lev(f, { P: A.indexOf(x) >= 0, Q: B.indexOf(x) >= 0 }); }); t++; } while ((!res.length || res.length === 10) && t < 50);
      return { q: 'Let $U = ' + setTex(U0) + '$, $A = ' + setTex(A) + '$ and $B = ' + setTex(B) + '$. Find $' + op + '$.', a: setA(res),
        steps: [op.indexOf('^{c}') >= 0 ? 'The complement is taken in $U$: everything in $U$ that is not in the set.' : 'Go through the elements one at a time.', 'Using the description of $' + op + '$: ' + (op === 'A \\cup B' ? 'in $A$ or in $B$ (or both).' : op === 'A \\cap B' ? 'in both $A$ and $B$.' : op === 'A \\setminus B' ? 'in $A$ but not in $B$.' : op === 'B \\setminus A' ? 'in $B$ but not in $A$.' : op === 'A^{c}' ? 'in $U$ but not in $A$.' : op === '(A \\cup B)^{c}' || op === 'A^{c} \\cap B^{c}' ? 'in neither $A$ nor $B$.' : op === '(A \\cap B)^{c}' || op === 'A^{c} \\cup B^{c}' ? 'not in both: missing from $A$ or from $B$.' : op === 'A^{c} \\cap B' ? 'in $B$ but not in $A$.' : 'in $A$ but not in $B$.'), 'Result: $' + setTex(res) + '$.'],
        hint: 'Decide for each element of $U$ whether it belongs.' };
    }
    if (shape === 'demorgan') {
      var N = R.int(30, 60), a = R.int(10, 20), b = R.int(8, 18), c = R.int(2, M.min(a, b) - 2);
      if (a + b - c > N) N = a + b - c + R.int(3, 10);
      var kind = R.pick(['union', 'interc', 'both']), ans = kind === 'union' ? N - (a + b - c) : kind === 'interc' ? N - c : N - a - b + c;
      var qq = kind === 'union' ? '|(A \\cup B)^{c}|' : kind === 'interc' ? '|A^{c} \\cup B^{c}|' : '|A^{c} \\cap B^{c}|';
      return { q: 'In a universe with $|U| = ' + N + '$, $|A| = ' + a + '$, $|B| = ' + b + '$ and $|A \\cap B| = ' + c + '$. Find $' + qq + '$.', a: num(ans),
        steps: kind === 'interc' ? ['De Morgan: $A^{c} \\cup B^{c} = (A \\cap B)^{c}$.', 'So $|A^{c} \\cup B^{c}| = ' + N + ' - ' + c + ' = ' + ans + '$.'] : [kind === 'both' ? 'De Morgan: $A^{c} \\cap B^{c} = (A \\cup B)^{c}$.' : 'The complement of the union is everything outside both sets.', '$|A \\cup B| = ' + a + ' + ' + b + ' - ' + c + ' = ' + (a + b - c) + '$.', 'So the answer is $' + N + ' - ' + (a + b - c) + ' = ' + ans + '$.'],
        hint: 'Rewrite it with De Morgan’s laws, then subtract from $|U|$.' };
    }
    var items = L === 3 ? ['A \\setminus (A \\setminus B)', '(A \\cup B) \\setminus B', '(A \\cap B)^{c}', '(A \\cup B)^{c}'] : ['(A \\cap B)^{c}', '(A \\cup B)^{c}', 'A \\setminus B'];
    var lhs = R.pick(items), rhsAll = ['A^{c} \\cup B^{c}', 'A^{c} \\cap B^{c}', 'A \\cap B^{c}', 'A \\cap B', 'A^{c} \\cap B', 'A \\cup B', 'A^{c} \\cup B'];
    var right = rhsAll.filter(function (x) { return equivF(SETX[x] || SETX[x], SETX[lhs]); })[0], wr = rhsAll.filter(function (x) { return !equivF(SETX[x], SETX[lhs]); });
    return { q: 'Which set is always equal to $' + lhs + '$?', a: mc('$' + right + '$', R.sample(wr, 3).map(function (x) { return '$' + x + '$'; })),
      steps: ['Think of membership: “$x \\in A$” is a statement, and $\\cap$, $\\cup$, complement act like “and,” “or,” “not.”', lhs === '(A \\cap B)^{c}' ? 'Not (in $A$ and in $B$) = not in $A$, or not in $B$ (De Morgan).' : lhs === '(A \\cup B)^{c}' ? 'Not (in $A$ or in $B$) = not in $A$ and not in $B$ (De Morgan).' : lhs === 'A \\setminus B' ? 'In $A$ and not in $B$.' : lhs === '(A \\cup B) \\setminus B' ? '(In $A$ or in $B$) and not in $B$ leaves: in $A$ and not in $B$.' : 'In $A$ and not (in $A$ and not in $B$) leaves: in $A$ and in $B$.', 'So it equals $' + right + '$.'],
      hint: 'Translate to “and,” “or,” “not,” then use De Morgan.' };
  });

  G('disc.power-sets-products', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['power', 'product', 'power']), R.pick(['count', 'tf', 'count', 'pairs']), R.pick(['count', 'nested', 'pairs']));
    var letters = ['a', 'b', 'c', 'd', 'e', 'f'];
    if (shape === 'power') { var n = R.int(2, 6), A = letters.slice(0, n);
      return { q: 'How many subsets does $A = ' + setTex(A) + '$ have? That is, find $|\\mathcal{P}(A)|$.', a: num(M.pow(2, n)), steps: ['To build a subset, decide for each of the $' + n + '$ elements: in or out.', 'That is $2$ choices, $' + n + '$ times: $2^{' + n + '} = ' + M.pow(2, n) + '$, counting $\\varnothing$ and $A$ itself.'], hint: 'Each element is either in the subset or not.' }; }
    if (shape === 'product') {
      var a = R.int(2, 6), b = R.int(2, 6), three = R.coin(), c = R.int(2, 4);
      return { q: 'If $|A| = ' + a + '$, $|B| = ' + b + '$' + (three ? ' and $|C| = ' + c + '$' : '') + ', how many elements does $A \\times B' + (three ? ' \\times C' : '') + '$ have?', a: num(a * b * (three ? c : 1)),
        steps: ['An element is an ordered ' + (three ? 'triple $(a, b, c)$' : 'pair $(a, b)$') + ' with one entry from each set.', 'Product rule: $' + a + ' \\cdot ' + b + (three ? ' \\cdot ' + c : '') + ' = ' + a * b * (three ? c : 1) + '$.'], hint: 'Choose each coordinate independently.' };
    }
    if (shape === 'count') {
      var n2 = R.int(4, 7), kinds = [['contain $1$', M.pow(2, n2 - 1), 'Put $1$ in, then decide freely for the other $' + (n2 - 1) + '$ elements: $2^{' + (n2 - 1) + '}$.'],
        ['contain $1$ but not $2$', M.pow(2, n2 - 2), '$1$ is in and $2$ is out; the other $' + (n2 - 2) + '$ elements are free: $2^{' + (n2 - 2) + '}$.'],
        ['contain both $1$ and $2$', M.pow(2, n2 - 2), 'Both are in; the other $' + (n2 - 2) + '$ are free: $2^{' + (n2 - 2) + '}$.'],
        ['are nonempty', M.pow(2, n2) - 1, 'All $2^{' + n2 + '}$ subsets except $\\varnothing$.'], ['have at most one element', n2 + 1, '$\\varnothing$ and the $' + n2 + '$ one-element subsets.'],
        ['have exactly ' + (L === 3 ? 3 : 2) + ' elements', C(n2, L === 3 ? 3 : 2), 'Choose which ' + (L === 3 ? 3 : 2) + ' elements: $' + binom(n2, L === 3 ? 3 : 2) + ' = ' + C(n2, L === 3 ? 3 : 2) + '$.']];
      var kd = R.pick(kinds);
      return { q: 'How many subsets of $' + setTex(range(1, n2)) + '$ ' + kd[0] + '?', a: num(kd[1]), steps: [kd[2], 'Answer: $' + kd[1] + '$.'], hint: 'Decide in or out for each element, with the rule fixing some of the decisions.' };
    }
    if (shape === 'pairs') {
      var A2 = sortN(R.sample(range(1, 7), R.int(3, 4))), B2 = sortN(R.sample(range(1, 7), R.int(3, 4))), rel = R.pick([['a < b', function (x, y) { return x < y; }], ['a + b \\text{ is even}', function (x, y) { return (x + y) % 2 === 0; }], ['a = b', function (x, y) { return x === y; }], ['a + b > 7', function (x, y) { return x + y > 7; }]]);
      var good = []; A2.forEach(function (x) { B2.forEach(function (y) { if (rel[1](x, y)) good.push([x, y]); }); });
      return { q: 'Let $A = ' + setTex(A2) + '$ and $B = ' + setTex(B2) + '$. How many ordered pairs $(a, b) \\in A \\times B$ have $' + rel[0] + '$?', a: num(good.length),
        steps: ['$A \\times B$ has $' + A2.length + ' \\cdot ' + B2.length + ' = ' + A2.length * B2.length + '$ pairs. Check each one.', good.length ? 'The pairs that work: $' + good.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '$.' : 'None of them work.', 'Count: $' + good.length + '$.'], hint: 'Go through $A$ one element at a time and pair it with each element of $B$.' };
    }
    if (shape === 'nested') {
      var t = R.int(1, 3);
      if (t === 1) { var m = R.int(1, 2); return { q: 'Let $A = ' + setTex(letters.slice(0, m)) + '$. How many elements does $\\mathcal{P}(\\mathcal{P}(A))$ have?', a: num(M.pow(2, M.pow(2, m))), steps: ['$|\\mathcal{P}(A)| = 2^{' + m + '} = ' + M.pow(2, m) + '$.', 'So $|\\mathcal{P}(\\mathcal{P}(A))| = 2^{' + M.pow(2, m) + '} = ' + M.pow(2, M.pow(2, m)) + '$.'], hint: 'Apply $|\\mathcal{P}(X)| = 2^{|X|}$ twice.' }; }
      if (t === 2) { var p = R.int(1, 2), q = R.int(2, 3); return { q: 'If $|A| = ' + p + '$ and $|B| = ' + q + '$, how many elements does $\\mathcal{P}(A \\times B)$ have?', a: num(M.pow(2, p * q)), steps: ['$|A \\times B| = ' + p + ' \\cdot ' + q + ' = ' + p * q + '$.', 'So $|\\mathcal{P}(A \\times B)| = 2^{' + p * q + '} = ' + M.pow(2, p * q) + '$.'], hint: 'First count $A \\times B$.' }; }
      var r = R.int(2, 4); return { q: 'If $|A| = ' + r + '$, how many elements does $\\mathcal{P}(A) \\times A$ have?', a: num(r * M.pow(2, r)), steps: ['$|\\mathcal{P}(A)| = 2^{' + r + '} = ' + M.pow(2, r) + '$.', 'Product rule: $' + M.pow(2, r) + ' \\cdot ' + r + ' = ' + r * M.pow(2, r) + '$.'], hint: 'Count each factor, then multiply.' };
    }
    var facts = [['(1, 2) = (2, 1)', false, 'Ordered pairs with different first entries are different.'], ['\\{1, 2\\} = \\{2, 1\\}', true, 'Sets ignore order.'], ['\\varnothing \\in \\mathcal{P}(\\{1, 2\\})', true, '$\\varnothing$ is a subset of $\\{1, 2\\}$, so it is an element of the power set.'],
      ['\\{1, 2\\} \\in \\mathcal{P}(\\{1, 2\\})', true, 'Every set is a subset of itself.'], ['1 \\in \\mathcal{P}(\\{1, 2\\})', false, 'The elements of $\\mathcal{P}(\\{1, 2\\})$ are sets: $\\varnothing, \\{1\\}, \\{2\\}, \\{1, 2\\}$. The number $1$ is not one of them.'],
      ['\\{1\\} \\in \\mathcal{P}(\\{1, 2\\})', true, '$\\{1\\}$ is a subset of $\\{1, 2\\}$.'], ['\\{1, 2\\} \\subseteq \\mathcal{P}(\\{1, 2\\})', false, 'That would need $1 \\in \\mathcal{P}(\\{1, 2\\})$, but the elements of the power set are sets.'],
      ['(2, 3) \\in \\{1, 2\\} \\times \\{3, 4\\}', true, '$2$ is in the first set and $3$ is in the second.'], ['(3, 2) \\in \\{1, 2\\} \\times \\{3, 4\\}', false, 'The first entry must come from $\\{1, 2\\}$, and $3$ does not.'], ['|\\{1, 2\\} \\times \\varnothing| = 0', true, 'There is no second entry to choose, so there are no pairs: $2 \\cdot 0 = 0$.']];
    var f = R.pick(facts);
    return { q: 'True or false: $' + f[0] + '$', a: tf(f[1]), steps: [f[2]], hint: 'Order matters in a pair, not in a set. The elements of a power set are subsets.' };
  });

  // functions on small sets
  function randFunc(R, A, B) { return A.map(function (a) { return [a, R.pick(B)]; }); }
  function isInj(pairs) { var seen = {}; return pairs.every(function (p) { if (seen[p[1]]) return false; seen[p[1]] = 1; return true; }); }
  function isSurj(pairs, B) { return B.every(function (b) { return pairs.some(function (p) { return p[1] === b; }); }); }
  G('disc.functions', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['isfunc', 'range', 'isfunc']), R.pick(['range', 'count', 'isfunc']), R.pick(['codomain', 'count', 'evens']));
    if (shape === 'isfunc') {
      var A = range(1, R.int(3, 5)), B = ['a', 'b', 'c', 'd', 'e'].slice(0, R.int(3, 4)), pairs = randFunc(R, A, B), kind = R.pick(['ok', 'missing', 'double']);
      if (kind === 'missing') { var i = R.int(0, A.length - 1); var lost = pairs[i][0]; pairs.splice(i, 1); }
      if (kind === 'double') { var j = R.int(0, A.length - 1), other = R.pick(B.filter(function (b) { return b !== pairs[j][1]; })); var dup = pairs[j][0]; pairs.push([dup, other]); pairs.sort(function (x, y) { return x[0] - y[0]; }); }
      var ch = ['Yes, it is a function.', 'No: an element of $A$ has two outputs.', 'No: an element of $A$ has no output.'], v = kind === 'ok' ? 0 : kind === 'double' ? 1 : 2;
      return { q: 'Is $\\{' + pairs.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '\\}$ a function from $A = ' + setTex(A) + '$ to $B = ' + setTex(B) + '$?', a: mcKeep(ch, v), viz: relMap(A, B, pairs),
        steps: ['A function needs exactly one arrow out of each element of $A$. Elements of $B$ may get any number of arrows.', kind === 'ok' ? 'Each of $' + A.join(', ') + '$ has exactly one output.' : kind === 'double' ? '$' + dup + '$ has two outputs.' : '$' + lost + '$ has no output.', 'So: ' + ch[v].replace(/\$/g, '$')], hint: 'Count the arrows leaving each element of $A$.' };
    }
    if (shape === 'range') {
      var D = range(-R.int(1, 3), R.int(2, 4)), f = R.pick([['x^{2}', function (x) { return x * x; }], ['|x|', function (x) { return M.abs(x); }], ['x^{2} - 2x', function (x) { return x * x - 2 * x; }], ['\\lfloor x / 2 \\rfloor', function (x) { return M.floor(x / 2); }], ['3 - |x|', function (x) { return 3 - M.abs(x); }], ['2x + 1', function (x) { return 2 * x + 1; }]]);
      var outs = sortN(U.uniq(D.map(function (x) { return String(f[1](x)); })).map(Number));
      return { q: 'Let $f : ' + setTex(D) + ' \\to \\mathbb{Z}$ be $f(x) = ' + f[0] + '$. The codomain is $\\mathbb{Z}$. What is the range of $f$?', a: setA(outs),
        steps: ['The range is the set of outputs actually reached.', D.map(function (x) { return '$f(' + x + ') = ' + f[1](x) + '$'; }).join(', ') + '.', 'Range: $' + setTex(outs) + '$. It is much smaller than the codomain $\\mathbb{Z}$.'], hint: 'Compute $f(x)$ for every $x$ in the domain and collect the results.' };
    }
    if (shape === 'count') {
      var m = R.int(2, 4), n = R.int(2, 4), fixed = L === 3 && R.coin();
      return { q: 'How many functions are there from a set $A$ with $' + m + '$ elements to a set $B$ with $' + n + '$ elements' + (fixed ? ', if one particular element of $A$ must go to one particular element of $B$' : '') + '?', a: num(M.pow(n, fixed ? m - 1 : m)),
        steps: ['A function picks one output for each element of $A$, and the choices are independent.', fixed ? 'One element’s output is fixed, so the other $' + (m - 1) + '$ elements each have $' + n + '$ choices: $' + n + '^{' + (m - 1) + '} = ' + M.pow(n, m - 1) + '$.' : 'Each of the $' + m + '$ elements has $' + n + '$ choices: $' + n + '^{' + m + '} = ' + M.pow(n, m) + '$.'], hint: 'Count the choices of output for each input, then multiply.' };
    }
    if (shape === 'evens') {
      var g = R.pick([['2x', 'the even integers', ['$\\mathbb{Z}$', 'the positive even integers', 'the odd integers']], ['2x + 1', 'the odd integers', ['$\\mathbb{Z}$', 'the even integers', 'the positive odd integers']], ['x^{2}', 'the perfect squares $0, 1, 4, 9, \\ldots$', ['$\\mathbb{Z}$', 'the nonnegative integers', 'the positive integers']], ['3x', 'the multiples of $3$', ['$\\mathbb{Z}$', 'the positive multiples of $3$', 'the integers from $0$ to $3$']]]);
      return { q: 'Let $f : \\mathbb{Z} \\to \\mathbb{Z}$ be $f(x) = ' + g[0] + '$. The codomain is $\\mathbb{Z}$. What is the range?', a: mc(cap(g[1]), g[2].map(cap)),
        steps: ['The codomain is the set the outputs are allowed to land in: $\\mathbb{Z}$.', 'The range is the set they actually reach: every value $' + g[0] + '$ for an integer $x$, which is ' + g[1] + '.'], hint: 'Which integers can be written as $' + g[0] + '$?' };
    }
    var h = R.pick([['x^{2} + c', function (c) { return '[' + c + ', inf)'; }, 'The smallest value of $x^{2}$ is $0$, at $x = 0$, and it takes every larger value.'], ['-x^{2} + c', function (c) { return '(-inf, ' + c + ']'; }, 'The largest value of $-x^{2}$ is $0$, at $x = 0$, and it takes every smaller value.'],
      ['|x - 2| + c', function (c) { return '[' + c + ', inf)'; }, '$|x - 2| \\ge 0$, with $0$ at $x = 2$, and it takes every larger value.'], ['(x + 1)^{2} + c', function (c) { return '[' + c + ', inf)'; }, '$(x + 1)^{2} \\ge 0$, with $0$ at $x = -1$, and it takes every larger value.']]);
    var c = R.nz(-6, 6), ft = h[0].replace('+ c', c < 0 ? '- ' + (-c) : '+ ' + c);
    return { q: 'Let $f : \\mathbb{R} \\to \\mathbb{R}$ be $f(x) = ' + ft + '$. The codomain is $\\mathbb{R}$. Give the range in interval notation.', a: { t: 'interval', v: h[1](c) },
      steps: [h[2], 'So the outputs are exactly the numbers in $' + h[1](c).replace('inf', '\\infty').replace('-\\infty', '-\\infty') + '$, a smaller set than the codomain $\\mathbb{R}$.'], hint: 'Find the smallest (or largest) output, then ask which values are reached.' };
  });

  var REALF = [['x^{2}', '\\mathbb{R}', '\\mathbb{R}', 3, '$x^{2} = (-x)^{2}$, so $1$ and $-1$ collide; and no $x$ gives $-1$.'], ['x^{2}', '[0, \\infty)', '[0, \\infty)', 0, 'On $[0, \\infty)$ each output $y$ comes from exactly one input, $\\sqrt{y}$.'],
    ['x^{2}', '\\mathbb{R}', '[0, \\infty)', 2, 'Every $y \\ge 0$ is $(\\sqrt{y})^{2}$, but $1$ and $-1$ both go to $1$.'], ['x^{2}', '[0, \\infty)', '\\mathbb{R}', 1, 'Different nonnegative inputs have different squares, but negative outputs are never reached.'],
    ['2x + 1', '\\mathbb{Z}', '\\mathbb{Z}', 1, 'Different inputs give different outputs, but the outputs are all odd: $2$ is never reached.'], ['2x + 1', '\\mathbb{R}', '\\mathbb{R}', 0, 'Each $y$ comes from exactly one $x = \\frac{y - 1}{2}$.'],
    ['\\lfloor x/2 \\rfloor', '\\mathbb{Z}', '\\mathbb{Z}', 2, 'Every integer $k$ is reached (from $2k$), but $2k$ and $2k + 1$ collide.'], ['e^{x}', '\\mathbb{R}', '\\mathbb{R}', 1, '$e^{x}$ is increasing, so it never repeats, but it is always positive.'],
    ['e^{x}', '\\mathbb{R}', '(0, \\infty)', 0, '$e^{x}$ is increasing and reaches every positive number, $y = e^{\\ln y}$.'], ['x^{3}', '\\mathbb{R}', '\\mathbb{R}', 0, 'Each real $y$ has exactly one real cube root.'],
    ['x^{3}', '\\mathbb{Z}', '\\mathbb{Z}', 1, 'Different integers have different cubes, but $2$ is not a cube of an integer.'], ['|x|', '\\mathbb{Z}', '\\mathbb{Z}', 3, '$|3| = |-3|$, and negative outputs are never reached.'],
    ['x + 1', '\\{0, 1, 2, \\ldots\\}', '\\{0, 1, 2, \\ldots\\}', 1, 'No two inputs collide, but $0$ is never reached.'], ['x - 1', '\\{1, 2, 3, \\ldots\\}', '\\{0, 1, 2, \\ldots\\}', 0, 'Each $y$ comes from exactly one $x = y + 1$.']];
  var CLASSES = ['One-to-one and onto', 'One-to-one but not onto', 'Onto but not one-to-one', 'Neither one-to-one nor onto'];
  G('disc.injective-surjective', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['diagram', 'diagram', 'pigeon']), R.pick(['diagram', 'real', 'real']), R.pick(['real', 'count', 'diagram']));
    if (shape === 'diagram') {
      var kind = R.pick(['bij', 'inj', 'surj', 'neither']), m, n;
      if (kind === 'bij') { m = n = R.int(3, 5); } else if (kind === 'inj') { m = R.int(2, 4); n = m + R.int(1, 2); } else if (kind === 'surj') { n = R.int(2, 4); m = n + R.int(1, 2); } else { m = R.int(3, 5); n = R.int(3, 5); }
      var A = range(1, m), B = ['a', 'b', 'c', 'd', 'e', 'f'].slice(0, n), pairs, t = 0;
      do {
        if (kind === 'bij' || kind === 'inj') { var img = R.sample(B, m); pairs = A.map(function (a, i) { return [a, img[i]]; }); }
        else if (kind === 'surj') { var img2 = R.shuffle(B.concat(range(1, m - n).map(function () { return R.pick(B); }))); pairs = A.map(function (a, i) { return [a, img2[i]]; }); }
        else pairs = randFunc(R, A, B);
        t++;
      } while (kind === 'neither' && (isInj(pairs) || isSurj(pairs, B)) && t < 60);
      var inj = isInj(pairs), sur = isSurj(pairs, B);
      var dupB = B.filter(function (b) { return pairs.filter(function (p) { return p[1] === b; }).length > 1; }), missB = B.filter(function (b) { return !pairs.some(function (p) { return p[1] === b; }); });
      var stp = ['One-to-one: no element of $B$ is hit twice. ' + (inj ? 'Every element of $B$ is hit at most once, so it is one-to-one.' : '$' + dupB[0] + '$ is hit more than once, so it is not one-to-one.'), 'Onto: every element of $B$ is hit. ' + (sur ? 'All of $' + B.join(', ') + '$ are hit, so it is onto.' : '$' + missB.join(', ') + '$ ' + (missB.length > 1 ? 'are' : 'is') + ' never hit, so it is not onto.')];
      var qt = 'The function $f : A \\to B$ is $f = \\{' + pairs.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '\\}$, with $B = ' + setTex(B) + '$.';
      if (L === 1) { var askInj = R.coin(); return { q: qt + ' Is $f$ ' + (askInj ? 'one-to-one' : 'onto') + '?', a: tf(askInj ? inj : sur), viz: relMap(A, B, pairs), steps: [askInj ? stp[0] : stp[1]], hint: askInj ? 'Look for an element of $B$ with two arrows coming in.' : 'Look for an element of $B$ with no arrow coming in.' }; }
      return { q: qt + ' Is $f$ one-to-one? Is it onto?', a: multi([part('One-to-one?', tf(inj)), part('Onto?', tf(sur))]), viz: relMap(A, B, pairs), steps: stp, hint: 'Count the arrows arriving at each element of $B$.' };
    }
    if (shape === 'real') {
      var it = R.pick(REALF);
      return { q: 'Classify $f(x) = ' + it[0] + '$ as a function from $' + it[1] + '$ to $' + it[2] + '$.', a: mcKeep(CLASSES, it[3]), steps: [it[4], 'So it is ' + CLASSES[it[3]].toLowerCase() + '. The same formula can change class when the domain or codomain changes.'], hint: 'Check for two inputs with the same output, then for an output in the codomain that is never reached.' };
    }
    if (shape === 'pigeon') {
      var a = R.int(2, 6), b = R.int(2, 6); while (a === b) b = R.int(2, 6);
      var askI = R.coin(), ans = askI ? a <= b : a >= b;
      return { q: 'True or false: a function from a set with $' + a + '$ elements to a set with $' + b + '$ elements can be ' + (askI ? 'one-to-one' : 'onto') + '.', a: tf(ans),
        steps: askI ? [ans ? 'There are enough outputs: send the $' + a + '$ inputs to $' + a + '$ different outputs.' : 'Only $' + b + '$ outputs are available for $' + a + '$ inputs, so two inputs must share an output (the pigeonhole principle).'] : [ans ? 'There are enough inputs to cover all $' + b + '$ outputs.' : 'The $' + a + '$ inputs reach at most $' + a + '$ outputs, fewer than $' + b + '$.'], hint: 'Compare the sizes of the two sets.' };
    }
    var t2 = R.int(1, 3);
    if (t2 === 1) { var m2 = R.int(2, 4), n2 = m2 + R.int(0, 2); return { q: 'How many one-to-one functions are there from a set with $' + m2 + '$ elements to a set with $' + n2 + '$ elements?', a: num(P(n2, m2)), steps: ['The first input has $' + n2 + '$ choices, the next has $' + (n2 - 1) + '$ (it must avoid the first output), and so on.', '$' + range(n2 - m2 + 1, n2).reverse().join(' \\cdot ') + ' = ' + P(n2, m2) + '$.'], hint: 'Each new input must avoid the outputs already used.' }; }
    var m3 = R.int(3, 5), k3 = t2 === 2 ? 2 : 3, onto = 0; for (var j = 0; j <= k3; j++) onto += (j % 2 ? -1 : 1) * C(k3, j) * M.pow(k3 - j, m3);
    return { q: 'How many functions from a set with $' + m3 + '$ elements onto a set with $' + k3 + '$ elements are there?', a: num(onto),
      steps: k3 === 2 ? ['All functions: $2^{' + m3 + '} = ' + M.pow(2, m3) + '$.', 'Not onto means everything goes to one output: $2$ such functions.', 'Onto: $' + M.pow(2, m3) + ' - 2 = ' + onto + '$.'] : ['All functions: $3^{' + m3 + '} = ' + M.pow(3, m3) + '$.', 'Subtract those that miss a given output ($2^{' + m3 + '}$ each, $3$ outputs), then add back those that miss two outputs ($1$ each, $3$ pairs): inclusion–exclusion.', '$' + M.pow(3, m3) + ' - 3 \\cdot ' + M.pow(2, m3) + ' + 3 = ' + onto + '$.'], hint: 'Count all functions, then remove the ones that miss an output.' };
  });

  function permTex(f, name) { var n = f.length; return name + ' = \\begin{array}{c|' + 'c'.repeat(n) + '} x & ' + range(1, n).join(' & ') + ' \\\\ \\hline ' + name + '(x) & ' + f.join(' & ') + ' \\end{array}'; }
  G('disc.bijections-inverses', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['table', 'order', 'table']), R.pick(['compose', 'linear', 'hasinv']), R.pick(['compose', 'linexpr', 'linear']));
    if (shape === 'table') {
      var n = R.int(4, 6), f = R.shuffle(range(1, n)), y = R.int(1, n), x = f.indexOf(y) + 1;
      return { q: 'The bijection $f$ on $' + setTex(range(1, n)) + '$ is given by the table $$' + permTex(f, 'f') + '$$ Find $f^{-1}(' + y + ')$.', a: num(x),
        steps: ['$f^{-1}(' + y + ')$ is the input that $f$ sends to $' + y + '$.', 'In the table, $f(' + x + ') = ' + y + '$.', 'So $f^{-1}(' + y + ') = ' + x + '$.'], hint: 'Find $' + y + '$ in the bottom row and read the input above it.' };
    }
    if (shape === 'compose') {
      var n2 = 5, f2 = R.shuffle(range(1, n2)), g2 = R.shuffle(range(1, n2)), k = R.int(1, n2), j = g2.indexOf(k) + 1, i = f2.indexOf(j) + 1;
      return { q: 'Bijections $f$ and $g$ on $\\{1, 2, 3, 4, 5\\}$ are given by $$' + permTex(f2, 'f') + ' \\qquad ' + permTex(g2, 'g') + '$$ Find $(g \\circ f)^{-1}(' + k + ')$.', a: num(i),
        steps: ['$(g \\circ f)^{-1} = f^{-1} \\circ g^{-1}$: undo $g$ first, then undo $f$.', '$g^{-1}(' + k + ') = ' + j + '$ because $g(' + j + ') = ' + k + '$.', '$f^{-1}(' + j + ') = ' + i + '$ because $f(' + i + ') = ' + j + '$.', 'Check: $g(f(' + i + ')) = g(' + j + ') = ' + k + '$. So the answer is $' + i + '$.'], hint: 'Undo the last step first: find which input $g$ sends to $' + k + '$.' };
    }
    if (shape === 'order') {
      var opts = R.coin();
      if (opts) return { q: 'If $f$ and $g$ are bijections, which is $(g \\circ f)^{-1}$?', a: mc('$f^{-1} \\circ g^{-1}$', ['$g^{-1} \\circ f^{-1}$', '$g \\circ f$', '$(f \\circ g)^{-1}$']),
        steps: ['$g \\circ f$ applies $f$ first, then $g$.', 'To undo it, undo the last step first: apply $g^{-1}$, then $f^{-1}$.', 'In function notation that is $f^{-1} \\circ g^{-1}$ (the rightmost function acts first).'], hint: 'Think of putting on socks, then shoes. What do you take off first?' };
      return { q: 'Getting dressed: first put on socks ($f$), then shoes ($g$), so the whole process is $g \\circ f$. Which describes undoing it, $(g \\circ f)^{-1}$?', a: mc('Take off the shoes, then the socks: $f^{-1} \\circ g^{-1}$', ['Take off the socks, then the shoes: $g^{-1} \\circ f^{-1}$', 'Put on the shoes, then the socks: $f \\circ g$', 'Take off the shoes only: $g^{-1}$']),
        steps: ['The last thing done is the first thing undone.', 'So undo $g$ (shoes) first, then $f$ (socks): $f^{-1} \\circ g^{-1}$.'], hint: 'The last step done is the first step undone.' };
    }
    if (shape === 'hasinv') {
      var bij = REALF.filter(function (x) { return x[3] === 0; }), non = REALF.filter(function (x) { return x[3] !== 0; }), b = R.pick(bij), w = R.sample(non, 3);
      var fmt = function (x) { return '$f(x) = ' + x[0] + '$ from $' + x[1] + '$ to $' + x[2] + '$'; };
      return { q: 'Which function has an inverse function?', a: mc(fmt(b), w.map(fmt)), steps: ['A function has an inverse exactly when it is one-to-one and onto.', b[4], 'Each of the others either sends two inputs to the same output or misses part of its codomain.'], hint: 'Look for the one that is both one-to-one and onto.' };
    }
    var a = R.pick([2, 3, -2, 4, 5]), bb = R.int(-5, 5), c = R.pick([2, 3, -1, -3, 5]), d = R.int(-6, 6);
    var fT = T.lin(a, 'x', bb), gT = T.lin(c, 'x', d), A2 = c * a, B2 = c * bb + d;
    if (shape === 'linear') {
      var x0 = R.int(-4, 5), y0 = A2 * x0 + B2;
      return { q: 'Let $f(x) = ' + fT + '$ and $g(x) = ' + gT + '$. Find $(g \\circ f)^{-1}(' + y0 + ')$.', a: num(x0),
        steps: ['$(g \\circ f)^{-1}(' + y0 + ') = f^{-1}(g^{-1}(' + y0 + '))$.', 'Undo $g$: solve $' + gT + ' = ' + y0 + '$, so $x = ' + ((y0 - d) / c) + '$.', 'Undo $f$: solve $' + fT + ' = ' + ((y0 - d) / c) + '$, so $x = ' + x0 + '$.', 'Check: $f(' + x0 + ') = ' + (a * x0 + bb) + '$ and $g(' + (a * x0 + bb) + ') = ' + y0 + '$.'], hint: 'Undo $g$ first, then undo $f$.' };
    }
    var inv = A2 > 0 ? '(' + plainTerms([[1, 'x'], [-B2, '']]) + ')/' + A2 : '(' + plainTerms([[-1, 'x'], [B2, '']]) + ')/' + (-A2);
    return { q: 'Let $f(x) = ' + fT + '$ and $g(x) = ' + gT + '$. Find a formula for $(g \\circ f)^{-1}(x)$.', a: expr(inv, ['x']),
      steps: ['$g^{-1}(x) = \\dfrac{' + T.lin(1, 'x', -d) + '}{' + c + '}$ and $f^{-1}(x) = \\dfrac{' + T.lin(1, 'x', -bb) + '}{' + a + '}$.', '$(g \\circ f)^{-1} = f^{-1} \\circ g^{-1}$, so substitute $g^{-1}(x)$ into $f^{-1}$.', 'This simplifies to $\\dfrac{' + T.lin(1, 'x', -B2) + '}{' + A2 + '}$. Check: $g(f(x)) = ' + T.lin(A2, 'x', B2) + '$, and solving $' + T.lin(A2, 'x', B2) + ' = y$ gives the same formula.'], hint: 'Compose first: $g(f(x))$ is linear. Then solve for $x$.' };
  });

// ---- 04-relations.js
  // ================================================================ Unit 4: Relations
  function relViz(A, Rl, o) { return { name: 'disc-relation', opts: Object.assign({ mode: 'relation', A: A.map(String), pairs: Rl.map(function (p) { return [String(p[0]), String(p[1])]; }), quiet: true, edit: false }, o || {}) }; }
  function sortPairs(ps) { return ps.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }); }
  function randRel(R, A) {
    var k = R.int(1, 5), out = [], has = {};
    function add(a, b) { if (!has[a + ',' + b]) { has[a + ',' + b] = 1; out.push([a, b]); } }
    if (k === 1) A.forEach(function (a) { A.forEach(function (b) { if (R.chance(0.3)) add(a, b); }); });
    if (k === 2) { A.forEach(function (a) { add(a, a); }); A.forEach(function (a) { A.forEach(function (b) { if (a !== b && R.chance(0.25)) add(a, b); }); }); }
    if (k === 3) { A.forEach(function (a) { A.forEach(function (b) { if (a < b && R.chance(0.35)) { add(a, b); add(b, a); } }); }); if (R.coin()) A.forEach(function (a) { add(a, a); }); }
    if (k === 4) { var rule = R.pick([function (a, b) { return a <= b; }, function (a, b) { return a < b; }, function (a, b) { return b % a === 0; }, function (a, b) { return (a - b) % 2 === 0; }, function (a, b) { return M.abs(a - b) <= 1; }]); A.forEach(function (a) { A.forEach(function (b) { if (rule(a, b)) add(a, b); }); }); }
    if (k === 5) { A.forEach(function (a) { if (R.coin()) add(a, a); }); var x = R.sample(A, 3); add(x[0], x[1]); add(x[1], x[2]); if (R.coin()) add(x[0], x[2]); }
    if (!out.length) add(A[0], A[1]);
    return sortPairs(out);
  }
  var RULES = [['a \\le b', function (a, b) { return a <= b; }], ['a < b', function (a, b) { return a < b; }], ['a \\mid b', function (a, b) { return b % a === 0; }], ['a \\equiv b \\pmod 3', function (a, b) { return (a - b) % 3 === 0; }],
    ['|a - b| \\le 1', function (a, b) { return M.abs(a - b) <= 1; }], ['a + b \\text{ is even}', function (a, b) { return (a + b) % 2 === 0; }], ['a \\ne b', function (a, b) { return a !== b; }], ['a = b', function (a, b) { return a === b; }], ['a + b \\le 6', function (a, b) { return a + b <= 6; }]];
  function propSteps(A, Rl) {
    var p = relProps(A, Rl), out = [];
    out.push('Reflexive (every $(a, a)$ is in $R$): ' + (p.refl ? 'yes.' : 'no, $(' + p.missR[0] + ', ' + p.missR[0] + ')$ is missing.'));
    out.push('Symmetric (every pair reversed is in $R$): ' + (p.sym ? 'yes.' : 'no, $(' + p.missS[0][0] + ', ' + p.missS[0][1] + ')$ is in $R$ but $(' + p.missS[0][1] + ', ' + p.missS[0][0] + ')$ is not.'));
    out.push('Antisymmetric (no two different elements related both ways): ' + (p.anti ? 'yes.' : 'no, both $(' + p.badA[0][0] + ', ' + p.badA[0][1] + ')$ and $(' + p.badA[0][1] + ', ' + p.badA[0][0] + ')$ are in $R$.'));
    out.push('Transitive (whenever $(a, b)$ and $(b, c)$ are in $R$, so is $(a, c)$): ' + (p.trans ? 'yes.' : 'no, $(' + p.transWhy[0].join(', ') + ')$ and $(' + p.transWhy[1].join(', ') + ')$ are in $R$ but $(' + p.transWhy[0][0] + ', ' + p.transWhy[1][1] + ')$ is not.'));
    return { p: p, steps: out };
  }

  G('disc.relations', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['one', 'one', 'antisym']), R.pick(['props', 'rule', 'closure']), R.pick(['props', 'rule', 'count']));
    if (shape === 'one' || shape === 'props') {
      var A = range(1, L === 1 ? 3 : R.int(3, 4)), Rl = randRel(R, A), ps = propSteps(A, Rl), names = ['reflexive', 'symmetric', 'antisymmetric', 'transitive'], vals = [ps.p.refl, ps.p.sym, ps.p.anti, ps.p.trans];
      var qt = 'Let $A = ' + setTex(A) + '$ and $R = ' + pairsTex(Rl) + '$, a relation on $A$.';
      if (shape === 'one') { var i = R.int(0, 3); return { q: qt + ' Is $R$ ' + names[i] + '?', a: tf(vals[i]), viz: relViz(A, Rl), steps: [ps.steps[i]], hint: ['Look for a loop at every element.', 'For every arrow, look for the arrow going back.', 'Look for two different elements with arrows both ways.', 'For every two-step route $a \\to b \\to c$, look for the shortcut $a \\to c$.'][i] }; }
      return { q: qt + ' Which properties does $R$ have?', a: multi(names.map(function (nm, k) { return part(cap(nm) + '?', tf(vals[k])); })), viz: relViz(A, Rl), steps: ps.steps, hint: 'Check each property separately, with its definition.' };
    }
    if (shape === 'rule') {
      var rl = R.pick(RULES), A2 = range(1, R.int(4, 6)), pr = []; A2.forEach(function (a) { A2.forEach(function (b) { if (rl[1](a, b)) pr.push([a, b]); }); });
      var ps2 = propSteps(A2, pr), nm2 = ['Reflexive?', 'Symmetric?', 'Antisymmetric?', 'Transitive?'];
      return { q: 'On $A = ' + setTex(A2) + '$, let $a\\,R\\,b$ mean $' + rl[0] + '$. Which properties does $R$ have?', a: multi(nm2.map(function (nm, k) { return part(nm, tf([ps2.p.refl, ps2.p.sym, ps2.p.anti, ps2.p.trans][k])); })),
        steps: ['$R$ has ' + pr.length + ' pairs.'].concat(ps2.steps), hint: 'Test the definitions on small examples from $A$, and look for a counterexample to each.' };
    }
    if (shape === 'closure') {
      var A3 = range(1, 4), R3 = randRel(R, A3), p3 = relProps(A3, R3), kind = R.pick(['reflexive', 'symmetric']);
      var need = kind === 'reflexive' ? p3.missR.length : U.uniq(p3.missS.map(function (p) { return p[1] + ',' + p[0]; })).length;
      return { q: 'Let $R = ' + pairsTex(R3) + '$ on $A = \\{1, 2, 3, 4\\}$. What is the fewest number of ordered pairs you must add to make $R$ ' + kind + '?', a: num(need), viz: relViz(A3, R3),
        steps: kind === 'reflexive' ? ['Reflexive needs $(a, a)$ for every $a$.', need ? 'Missing: $' + p3.missR.map(function (a) { return '(' + a + ', ' + a + ')'; }).join(', ') + '$.' : 'None are missing.', 'Add $' + need + '$ pair' + (need === 1 ? '' : 's') + '.'] : ['Symmetric needs the reverse of every pair.', need ? 'Missing reverses: $' + p3.missS.map(function (p) { return '(' + p[1] + ', ' + p[0] + ')'; }).join(', ') + '$.' : 'Every reverse is already there.', 'Add $' + need + '$ pair' + (need === 1 ? '' : 's') + '.'],
        hint: 'List the pairs the property requires, and cross off the ones already in $R$.' };
    }
    if (shape === 'antisym') {
      var facts = [['A relation that is not symmetric must be antisymmetric.', false, '$\\{(1, 2), (2, 1), (2, 3)\\}$ on $\\{1, 2, 3\\}$ is neither: $(2, 3)$ has no reverse, and $1$ and $2$ are related both ways.'],
        ['The relation $\\{(1, 1), (2, 2)\\}$ on $\\{1, 2\\}$ is both symmetric and antisymmetric.', true, 'Every pair is its own reverse, and no two different elements are related at all.'],
        ['The relation $<$ on the integers is antisymmetric.', true, '$a < b$ and $b < a$ never happen together, so the condition is never violated.'],
        ['The relation $\\le$ on the integers is symmetric.', false, '$1 \\le 2$ but $2 \\not\\le 1$.'], ['Antisymmetric means the same as “not symmetric.”', false, 'Equality is both symmetric and antisymmetric; some relations are neither.'],
        ['“Divides” on the positive integers is antisymmetric.', true, 'If $a \\mid b$ and $b \\mid a$ for positive integers, then $a = b$.']];
      var f = R.pick(facts);
      return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'Antisymmetric: if $a\\,R\\,b$ and $b\\,R\\,a$, then $a = b$.' };
    }
    var n = R.int(2, 4), k = R.pick(['all', 'refl', 'sym']), val = k === 'all' ? M.pow(2, n * n) : k === 'refl' ? M.pow(2, n * n - n) : M.pow(2, n * (n + 1) / 2);
    return { q: 'How many ' + (k === 'all' ? '' : k === 'refl' ? 'reflexive ' : 'symmetric ') + 'relations are there on a set with $' + n + '$ elements?', a: num(val),
      steps: ['A relation is a subset of $A \\times A$, which has $' + n + '^{2} = ' + n * n + '$ pairs.', k === 'all' ? 'Each pair is in or out: $2^{' + n * n + '} = ' + commas(val) + '$.' : k === 'refl' ? 'The $' + n + '$ pairs $(a, a)$ must be in; the other $' + (n * n - n) + '$ are free: $2^{' + (n * n - n) + '} = ' + commas(val) + '$.' : 'Choose freely the $' + n + '$ pairs $(a, a)$ and, for each of the $' + C(n, 2) + '$ pairs of different elements, both directions or neither: $2^{' + (n + C(n, 2)) + '} = ' + commas(val) + '$.'],
      hint: 'Decide in or out for each pair that is free to choose.' };
  });

  function partitionOf(R, A) { var k = R.int(2, 3), lab = A.map(function (a, i) { return i < k ? i : R.int(0, k - 1); }); lab = R.shuffle(lab); var cls = []; for (var i = 0; i < k; i++) cls.push(A.filter(function (a, j) { return lab[j] === i; })); return cls.filter(function (c) { return c.length; }); }
  function relOfPartition(cls) { var out = []; cls.forEach(function (c) { c.forEach(function (a) { c.forEach(function (b) { out.push([a, b]); }); }); }); return sortPairs(out); }
  G('disc.equivalence-relations', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['classes', 'classof', 'partition']), R.pick(['which', 'partition', 'classof']), R.pick(['which', 'words', 'bell']));
    if (shape === 'classes' || shape === 'classof') {
      var m = R.int(2, 5), N = R.int(m + 5, 20), k = R.int(1, N);
      if (shape === 'classes') return { q: 'On $A = \\{1, 2, \\ldots, ' + N + '\\}$, let $a \\sim b$ mean $a$ and $b$ leave the same remainder when divided by $' + m + '$. How many equivalence classes are there?', a: num(m),
        steps: ['Two numbers are in the same class exactly when they have the same remainder.', 'The possible remainders are $0, 1, \\ldots, ' + (m - 1) + '$, and each one occurs in $A$.', 'So there are $' + m + '$ classes.'], hint: 'One class for each possible remainder.' };
      var cls = range(1, N).filter(function (x) { return (x - k) % m === 0; });
      return { q: 'On $A = \\{1, 2, \\ldots, ' + N + '\\}$, let $a \\sim b$ mean $a$ and $b$ leave the same remainder when divided by $' + m + '$. List the equivalence class $[' + k + ']$.', a: setA(cls),
        steps: ['$' + k + '$ leaves remainder $' + (k % m) + '$.', 'Its class is every element of $A$ with that remainder: start at $' + cls[0] + '$ and add $' + m + '$ each time.', '$[' + k + '] = ' + setTex(cls) + '$.'], hint: 'Find the remainder of $' + k + '$, then list everything in $A$ with the same remainder.' };
    }
    if (shape === 'partition') {
      var A = range(1, R.int(5, 7)), cls2 = partitionOf(R, A), rel = relOfPartition(cls2), a = R.pick(A), b = R.pick(A), same = cls2.some(function (c) { return c.indexOf(a) >= 0 && c.indexOf(b) >= 0; });
      var pt = cls2.map(function (c) { return setTex(c); }).join(', ');
      if (R.coin()) return { q: 'An equivalence relation on $' + setTex(A) + '$ has classes $' + pt + '$. How many ordered pairs are in the relation?', a: num(rel.length),
        steps: ['Inside a class, every element is related to every element (itself included): a class of size $s$ gives $s^{2}$ pairs.', 'Sizes: $' + cls2.map(function (c) { return c.length; }).join(', ') + '$. Total: $' + cls2.map(function (c) { return c.length + '^{2}'; }).join(' + ') + ' = ' + rel.length + '$.'], hint: 'Count the pairs inside each class.' };
      return { q: 'An equivalence relation on $' + setTex(A) + '$ has classes $' + pt + '$. Is $(' + a + ', ' + b + ')$ in the relation?', a: tf(same), steps: ['Two elements are related exactly when they are in the same class.', same ? '$' + a + '$ and $' + b + '$ are in the same class.' : '$' + a + '$ and $' + b + '$ are in different classes.'], hint: 'Find the class of each element.' };
    }
    if (shape === 'which') {
      var A4 = range(1, 4), cls4 = partitionOf(R, A4), rel4 = relOfPartition(cls4), kind = R.pick(['none', 'dropdiag', 'dropone', 'bridge', 'bridge2']);
      var has = {}; rel4.forEach(function (p) { has[p[0] + ',' + p[1]] = 1; });
      if (kind === 'dropdiag') { var x = R.pick(A4); rel4 = rel4.filter(function (p) { return !(p[0] === x && p[1] === x); }); }
      if (kind === 'dropone') { var off = rel4.filter(function (p) { return p[0] !== p[1]; }); if (off.length) { var y = R.pick(off); rel4 = rel4.filter(function (p) { return p !== y; }); } }
      if (kind === 'bridge' || kind === 'bridge2') { var c1 = cls4[0], c2 = cls4[1]; if (c2) { var u = R.pick(c1), v = R.pick(c2); rel4.push([u, v]); if (kind === 'bridge2') rel4.push([v, u]); rel4 = sortPairs(rel4); } }
      var p4 = relProps(A4, rel4), ps4 = propSteps(A4, rel4).steps;
      return { q: 'Let $R = ' + pairsTex(rel4) + '$ on $\\{1, 2, 3, 4\\}$. Is $R$ reflexive, symmetric, transitive?', a: multi([part('Reflexive?', tf(p4.refl)), part('Symmetric?', tf(p4.sym)), part('Transitive?', tf(p4.trans))]), viz: relViz(A4, rel4),
        steps: [ps4[0], ps4[1], ps4[3], (p4.refl && p4.sym && p4.trans) ? 'All three hold, so $R$ is an equivalence relation.' : 'At least one fails, so $R$ is not an equivalence relation.'], hint: 'Check the loops, then the arrows back, then every two-step route.' };
    }
    if (shape === 'words') {
      var words = R.sample(['cat', 'dog', 'bird', 'fish', 'horse', 'mouse', 'owl', 'frog', 'snake', 'tiger', 'lion', 'bear', 'goat', 'eagle', 'zebra', 'yak'], R.int(7, 9));
      var by2 = R.pick([['the same number of letters', function (w) { return w.length; }], ['the same first letter', function (w) { return w[0]; }], ['the same last letter', function (w) { return w[w.length - 1]; }]]);
      var keys = U.uniq(words.map(function (w) { return String(by2[1](w)); }));
      return { q: 'On the set of words $\\{\\text{' + words.join('}, \\text{') + '}\\}$, two words are related when they have ' + by2[0] + '. How many equivalence classes are there?', a: num(keys.length),
        steps: ['Each class collects the words with one value of the feature.', keys.map(function (kk) { return '“' + kk + '”: ' + words.filter(function (w) { return String(by2[1](w)) === kk; }).join(', '); }).join('; ') + '.', 'That is $' + keys.length + '$ classes.'], hint: 'Group the words by the feature and count the groups.' };
    }
    var n = R.pick([3, 3, 4]);
    return { q: 'How many different equivalence relations are there on a set with $' + n + '$ elements?', a: num(n === 3 ? 5 : 15),
      steps: ['Equivalence relations match partitions one to one, so count the ways to split the set into nonempty classes.', n === 3 ? 'For $\\{1, 2, 3\\}$: one class ($1$ way); a pair and a single ($3$ ways); three singles ($1$ way). Total $5$.' : 'For $\\{1, 2, 3, 4\\}$: one class ($1$); three and one ($4$); two and two ($3$); two, one, one ($6$); four singles ($1$). Total $15$.'],
      hint: 'Count partitions by the sizes of their classes.' };
  });

  function divides(a, b) { return b % a === 0; }
  function hasseEdges(S) { var e = []; S.forEach(function (a) { S.forEach(function (b) { if (a !== b && divides(a, b) && !S.some(function (c) { return c !== a && c !== b && divides(a, c) && divides(c, b); })) e.push([a, b]); }); }); return e; }
  G('disc.partial-orders', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['comparable', 'minmax', 'lub']), R.pick(['minmax', 'hasse', 'topo', 'lub']), R.pick(['hasse', 'topo', 'subset']));
    if (shape === 'comparable') {
      var a = R.int(2, 12), b = R.int(2, 30); while (a === b) b = R.int(2, 30);
      var comp = divides(a, b) || divides(b, a);
      return { q: 'Under the partial order “divides” on the positive integers, are $' + a + '$ and $' + b + '$ comparable?', a: tf(comp),
        steps: ['Comparable means one divides the other.', divides(a, b) ? '$' + a + ' \\mid ' + b + '$, since $' + b + ' = ' + a + ' \\cdot ' + b / a + '$.' : divides(b, a) ? '$' + b + ' \\mid ' + a + '$.' : 'Neither divides the other, so they are incomparable. In a partial order, that is allowed.'], hint: 'Does either number divide the other?' };
    }
    if (shape === 'minmax') {
      var S, t = 0; do { S = sortN(R.sample(range(2, 30), R.int(5, 7))); t++; } while (t < 20 && S.filter(function (x) { return !S.some(function (y) { return y !== x && divides(y, x); }); }).length === S.length);
      var mins = S.filter(function (x) { return !S.some(function (y) { return y !== x && divides(y, x); }); }), maxs = S.filter(function (x) { return !S.some(function (y) { return y !== x && divides(x, y); }); });
      var askMin = R.coin(), ans = askMin ? mins : maxs;
      return { q: 'In $S = ' + setTex(S) + '$ ordered by “divides,” list the ' + (askMin ? 'minimal' : 'maximal') + ' elements.', a: setA(ans),
        steps: [askMin ? 'An element is minimal when no other element of $S$ divides it.' : 'An element is maximal when it divides no other element of $S$.', S.map(function (x) { var w = askMin ? S.filter(function (y) { return y !== x && divides(y, x); }) : S.filter(function (y) { return y !== x && divides(x, y); }); return '$' + x + '$: ' + (w.length ? (askMin ? 'divisible by ' : 'divides ') + w.join(', ') : '<b>' + (askMin ? 'minimal' : 'maximal') + '</b>'); }).join('; ') + '.', 'Answer: $' + setTex(ans) + '$. There can be more than one, because some elements are incomparable.'],
        hint: askMin ? 'Cross out every element that has a divisor in $S$.' : 'Cross out every element that divides something in $S$.' };
    }
    if (shape === 'lub') {
      var n = R.pick([12, 18, 24, 30, 36, 60, 72]), D = U.factors(n), x = R.pick(D.slice(1, -1)), y = R.pick(D.slice(1, -1)); while (y === x) y = R.pick(D.slice(1, -1));
      var up = R.coin(), val = up ? U.lcm(x, y) : U.gcd(x, y);
      return { q: 'In the divisors of $' + n + '$ ordered by “divides,” find the ' + (up ? 'least upper bound' : 'greatest lower bound') + ' of $' + x + '$ and $' + y + '$.', a: num(val),
        steps: [up ? 'An upper bound of $' + x + '$ and $' + y + '$ is a divisor of $' + n + '$ that both divide: a common multiple. The least one is divided by all the others.' : 'A lower bound is a divisor of both: a common divisor. The greatest one is divisible by all the others.', up ? 'That is $\\operatorname{lcm}(' + x + ', ' + y + ') = ' + val + '$.' : 'That is $\\gcd(' + x + ', ' + y + ') = ' + val + '$.'], hint: up ? 'Find the smallest common multiple.' : 'Find the largest common divisor.' };
    }
    if (shape === 'hasse') {
      var n2 = R.pick([12, 18, 20, 24, 30, 36, 16, 28, 40]), D2 = U.factors(n2), he = hasseEdges(D2);
      return { q: 'How many edges does the Hasse diagram of the divisors of $' + n2 + '$ under “divides” have?', a: num(he.length),
        steps: ['The divisors are $' + D2.join(', ') + '$.', 'Draw an edge from $a$ up to $b$ only when $a \\mid b$ and nothing lies strictly between them, that is, $b/a$ is prime.', 'Edges: ' + he.map(function (e) { return '$' + e[0] + ' - ' + e[1] + '$'; }).join(', ') + '.', 'That is $' + he.length + '$ edges.'], hint: 'Connect $a$ to $b$ when $b$ is $a$ times a prime.' };
    }
    if (shape === 'topo') {
      var n3 = R.pick([12, 18, 20, 24, 30]), D3 = U.factors(n3), valid = function (ord) { return ord.every(function (a, i) { return ord.slice(0, i).every(function (b) { return !divides(a, b) || a === b; }); }); };
      var good, tries = 0; do { good = R.shuffle(D3); tries++; } while ((!valid(good) || good.join() === D3.join()) && tries < 400);
      if (!valid(good)) good = D3.slice();
      var bads = []; for (var t2 = 0; t2 < 300 && bads.length < 3; t2++) { var b2 = good.slice(), i = R.int(0, b2.length - 2), j = R.int(i + 1, b2.length - 1); var tmp = b2[i]; b2[i] = b2[j]; b2[j] = tmp; if (!valid(b2) && bads.every(function (x) { return x.join() !== b2.join(); })) bads.push(b2); }
      var fmt = function (o) { return o.join(', '); };
      var badWhy = bads.map(function (o) { for (var p = 0; p < o.length; p++) for (var q = p + 1; q < o.length; q++) if (divides(o[q], o[p]) && o[q] !== o[p]) return [o[q], o[p]]; return null; });
      return { q: 'Which list puts the divisors of $' + n3 + '$ in an order where each number comes after all of its divisors?', a: mc(fmt(good), bads.map(fmt)),
        steps: ['A valid order never lists a number before one of its divisors.', 'Check the correct list: every divisor of each number appears earlier.', 'The others fail: ' + badWhy.map(function (w, i) { return w ? 'in ' + fmt(bads[i]) + ', $' + w[1] + '$ comes before its divisor $' + w[0] + '$' : ''; }).filter(Boolean).join('; ') + '.'],
        hint: 'For each list, look for a number that appears before one of its divisors.' };
    }
    var m = R.int(2, 4);
    return { q: 'How many edges does the Hasse diagram of $\\mathcal{P}(S)$ under $\\subseteq$ have, when $|S| = ' + m + '$?', a: num(m * M.pow(2, m - 1)),
      steps: ['An edge joins $X$ to $Y$ when $Y$ is $X$ with one more element.', 'Each of the $2^{' + m + '}$ subsets has one edge up for each element it lacks; adding over all subsets counts each edge once.', 'Count by the element added: each of the $' + m + '$ elements can be added to the $2^{' + (m - 1) + '}$ subsets that lack it: $' + m + ' \\cdot 2^{' + (m - 1) + '} = ' + m * M.pow(2, m - 1) + '$.'],
      hint: 'An edge means “add one element.” Count edges by which element is added.' };
  });

// ---- 05-counting.js
  // ================================================================ Unit 5: Counting
  var DIGITS3 = [
    ['have all three digits odd', function (d) { return d.every(function (x) { return x % 2; }); }, 'Each digit has $5$ choices ($1, 3, 5, 7, 9$): $5 \\cdot 5 \\cdot 5 = 125$.'],
    ['have three different digits', function (d) { return d[0] !== d[1] && d[1] !== d[2] && d[0] !== d[2]; }, 'First digit $9$ choices (not $0$), second $9$ (any but the first), third $8$: $9 \\cdot 9 \\cdot 8 = 648$.'],
    ['have no digit equal to $7$', function (d) { return d.indexOf(7) < 0; }, 'First digit $8$ choices (not $0$ or $7$), the others $9$ each: $8 \\cdot 9 \\cdot 9 = 648$.'],
    ['have three different digits, none of them $0$', function (d) { return d.indexOf(0) < 0 && d[0] !== d[1] && d[1] !== d[2] && d[0] !== d[2]; }, '$9 \\cdot 8 \\cdot 7 = 504$.'],
    ['have an even first digit and an odd last digit', function (d) { return d[0] % 2 === 0 && d[2] % 2 === 1; }, 'First digit $2, 4, 6, 8$ ($4$ choices), middle $10$, last $5$: $4 \\cdot 10 \\cdot 5 = 200$.'],
    ['are even and have three different digits', function (d) { return d[2] % 2 === 0 && d[0] !== d[1] && d[1] !== d[2] && d[0] !== d[2]; }, 'Split by the last digit (sum rule). Last digit $0$: first $9$, middle $8$, so $72$. Last digit $2, 4, 6$ or $8$: $4$ choices, first digit $8$ (not $0$, not the last), middle $8$: $4 \\cdot 8 \\cdot 8 = 256$. Total $72 + 256 = 328$.', 3],
    ['are odd and have three different digits', function (d) { return d[2] % 2 === 1 && d[0] !== d[1] && d[1] !== d[2] && d[0] !== d[2]; }, 'Fill the last digit first: $5$ odd choices. First digit: $8$ (not $0$, not the last). Middle: $8$. So $5 \\cdot 8 \\cdot 8 = 320$.', 3]];
  function count3(f) { var c = 0; for (var n = 100; n <= 999; n++) { if (f([M.floor(n / 100), M.floor(n / 10) % 10, n % 10])) c++; } return c; }

  G('disc.sum-product-rules', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['which', 'basic', 'basic']), R.pick(['basic', 'digits', 'which']), R.pick(['digits', 'routes', 'basic']));
    if (shape === 'which') {
      var a = R.int(3, 9), b = R.int(3, 9), sum = R.coin(), st = R.pick([['pies', 'cakes', 'dessert'], ['novels', 'comic books', 'book to read'], ['soups', 'salads', 'starter'], ['bus routes', 'train routes', 'way to get downtown']]);
      var q = sum ? 'A menu has ' + a + ' ' + st[0] + ' and ' + b + ' ' + st[1] + '. You choose one ' + st[2] + ': either one of the ' + st[0] + ' or one of the ' + st[1] + '. How many choices are there, and which rule gives it?'
        : 'A menu has ' + a + ' ' + st[0] + ' and ' + b + ' ' + st[1] + '. You choose one of the ' + st[0] + ' <b>and</b> one of the ' + st[1] + '. How many choices are there, and which rule gives it?';
      return { q: q, a: multi([part('Rule:', mcKeep(['Sum rule (add)', 'Product rule (multiply)'], sum ? 0 : 1)), part('Number of choices:', num(sum ? a + b : a * b))]),
        steps: sum ? ['The two kinds of choice are alternatives: you pick from one group or the other, never both.', 'Sum rule: $' + a + ' + ' + b + ' = ' + (a + b) + '$.'] : ['You make two choices one after another, and every first choice can go with every second choice.', 'Product rule: $' + a + ' \\cdot ' + b + ' = ' + a * b + '$.'],
        hint: 'Either/or: add. One, then the other: multiply.' };
    }
    if (shape === 'basic') {
      var t = R.int(1, L === 1 ? 3 : 5);
      if (t === 1) { var s = R.int(3, 7), p = R.int(2, 5), h = R.int(2, 4); return { q: 'You own ' + s + ' shirts, ' + p + ' pairs of pants and ' + h + ' hats. An outfit is one of each. How many outfits are there?', a: num(s * p * h), steps: ['You choose a shirt, then pants, then a hat: three choices in a row.', 'Product rule: $' + s + ' \\cdot ' + p + ' \\cdot ' + h + ' = ' + s * p * h + '$.'], hint: 'Multiply the number of choices at each step.' }; }
      if (t === 2) { var n = R.int(6, 15); return { q: 'A club with ' + n + ' members elects a president, a vice president and a treasurer, three different people. How many ways can this be done?', a: num(n * (n - 1) * (n - 2)), steps: ['President: $' + n + '$ choices. Vice president: $' + (n - 1) + '$ (anyone else). Treasurer: $' + (n - 2) + '$.', 'Product rule: $' + n + ' \\cdot ' + (n - 1) + ' \\cdot ' + (n - 2) + ' = ' + commas(n * (n - 1) * (n - 2)) + '$.'], hint: 'Each office has one fewer person to choose from.' }; }
      if (t === 3) { var Lt = R.int(1, 3), D = R.int(1, 3), v = M.pow(26, Lt) * M.pow(10, D); return { q: 'A code is ' + plural(Lt, 'letter') + ' (A–Z) followed by ' + plural(D, 'digit') + ' (0–9). Repeats are allowed. How many codes are there?', a: num(v), steps: ['Each letter has $26$ choices and each digit $10$.', 'Product rule: $26^{' + Lt + '} \\cdot 10^{' + D + '} = ' + commas(v) + '$.'], hint: 'Multiply the choices for every position.' }; }
      if (t === 4) { var l1 = R.int(2, 3), l2 = l1 + 1, k = R.pick([2, 3, 10]); var tot = M.pow(k, l1) + M.pow(k, l2); return { q: 'A code uses only the symbols ' + (k === 2 ? '0 and 1' : k === 3 ? 'A, B and C' : '0–9') + ', with repeats allowed, and has length ' + l1 + ' or ' + l2 + '. How many codes are there?', a: num(tot), steps: ['Length ' + l1 + ': $' + k + '^{' + l1 + '} = ' + M.pow(k, l1) + '$. Length ' + l2 + ': $' + k + '^{' + l2 + '} = ' + commas(M.pow(k, l2)) + '$.', 'A code has one length or the other, never both, so add: $' + commas(tot) + '$.'], hint: 'Split by length (sum rule), then count each length (product rule).' }; }
      var pk = R.int(4, 9); return { q: 'A ' + pk + '-digit PIN uses the digits 0–9 with no digit repeated. How many PINs are there?', a: num(P(10, pk)), steps: ['The first digit has $10$ choices, the next $9$, and so on.', '$' + range(10 - pk + 1, 10).reverse().join(' \\cdot ') + ' = ' + commas(P(10, pk)) + '$.'], hint: 'Each new digit must avoid the ones already used.' };
    }
    if (shape === 'digits') {
      var fam = R.pick(L === 3 ? DIGITS3 : DIGITS3.filter(function (f) { return !f[3]; })), cnt = count3(fam[1]);
      return { q: 'How many three-digit numbers (from 100 to 999) ' + fam[0] + '?', a: num(cnt), steps: ['Fill the hundreds, tens and ones digits; the hundreds digit cannot be $0$.', fam[2]], hint: 'Fill the most restricted digit first.' };
    }
    var a2 = R.int(2, 5), b2 = R.int(2, 5), c2 = R.int(1, 4);
    return { q: 'There are ' + a2 + ' roads from Ashby to Burton, ' + b2 + ' roads from Burton to Carlow, and ' + c2 + ' direct roads from Ashby to Carlow. How many routes go from Ashby to Carlow, if a route either goes through Burton or takes a direct road?', a: num(a2 * b2 + c2),
      steps: ['Through Burton: a road to Burton, then a road to Carlow: $' + a2 + ' \\cdot ' + b2 + ' = ' + a2 * b2 + '$ (product rule).', 'Direct: $' + c2 + '$.', 'A route is one kind or the other: $' + a2 * b2 + ' + ' + c2 + ' = ' + (a2 * b2 + c2) + '$ (sum rule).'], hint: 'Split into the two kinds of route, count each, and add.' };
  });

  G('disc.complement-counting', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['bits', 'dice', 'committee', 'committee', 'pin', 'vowel']), R.pick(['committee', 'pin', 'password', 'overcount']), R.pick(['overcount', 'bits2', 'vowel', 'committee']));
    if (shape === 'bits') { var n = R.int(4, 14); return { q: 'How many bit strings of length ' + n + ' contain at least one 1?', a: num(M.pow(2, n) - 1), steps: ['All strings: $2^{' + n + '} = ' + M.pow(2, n) + '$.', 'The only string with no 1 is $' + Array(n + 1).join('0') + '$.', 'At least one 1: $' + M.pow(2, n) + ' - 1 = ' + (M.pow(2, n) - 1) + '$.'], hint: 'Count all strings, then subtract the ones with no 1.' }; }
    if (shape === 'bits2') { var n2 = R.int(5, 10); return { q: 'How many bit strings of length ' + n2 + ' contain at least two 1s?', a: num(M.pow(2, n2) - 1 - n2), steps: ['All: $2^{' + n2 + '} = ' + M.pow(2, n2) + '$.', 'The complement is “fewer than two 1s”: no 1s ($1$ string) or exactly one 1 ($' + n2 + '$ strings).', 'At least two: $' + M.pow(2, n2) + ' - 1 - ' + n2 + ' = ' + (M.pow(2, n2) - 1 - n2) + '$.'], hint: 'The opposite of “at least two” is “zero or one.”' }; }
    if (shape === 'dice') { var k = R.int(2, 4), dv = R.pick([['a 6', 5, 'not 6'], ['an even number', 3, 'odd'], ['a 1 or a 2', 4, 'from 3 to 6'], ['a number greater than 4', 4, 'at most 4']]); return { q: 'A die is rolled ' + k + ' times, and the sequence of results is recorded. How many sequences contain at least one roll that is ' + dv[0] + '?', a: num(M.pow(6, k) - M.pow(dv[1], k)), steps: ['All sequences: $6^{' + k + '} = ' + M.pow(6, k) + '$.', 'None of the rolls is ' + dv[0] + ' (every roll ' + dv[2] + '): each roll has $' + dv[1] + '$ choices, $' + dv[1] + '^{' + k + '} = ' + M.pow(dv[1], k) + '$.', 'At least one: $' + M.pow(6, k) + ' - ' + M.pow(dv[1], k) + ' = ' + (M.pow(6, k) - M.pow(dv[1], k)) + '$.'], hint: 'Subtract the sequences where it never happens.' }; }
    if (shape === 'pin') { var l = R.int(3, 4); return { q: 'How many ' + l + '-digit PINs (digits 0–9) have at least one repeated digit?', a: num(M.pow(10, l) - P(10, l)), steps: ['All PINs: $10^{' + l + '} = ' + commas(M.pow(10, l)) + '$.', 'No repeated digit: $' + range(11 - l, 10).reverse().join(' \\cdot ') + ' = ' + commas(P(10, l)) + '$.', 'At least one repeat: $' + commas(M.pow(10, l)) + ' - ' + commas(P(10, l)) + ' = ' + commas(M.pow(10, l) - P(10, l)) + '$.'], hint: 'The opposite of “some digit repeats” is “all digits different.”' }; }
    if (shape === 'password') { var l2 = R.int(2, 4); return { q: 'A password has ' + l2 + ' characters, each a letter (A–Z) or a digit (0–9). How many passwords contain at least one digit?', a: num(M.pow(36, l2) - M.pow(26, l2)), steps: ['All: $36^{' + l2 + '} = ' + commas(M.pow(36, l2)) + '$.', 'No digits (letters only): $26^{' + l2 + '} = ' + commas(M.pow(26, l2)) + '$.', 'At least one digit: $' + commas(M.pow(36, l2) - M.pow(26, l2)) + '$.'], hint: 'Subtract the passwords with no digit.' }; }
    if (shape === 'vowel') { var l3 = R.int(2, 3); return { q: 'How many strings of ' + l3 + ' letters (A–Z, repeats allowed) contain at least one vowel (A, E, I, O, U)?', a: num(M.pow(26, l3) - M.pow(21, l3)), steps: ['All: $26^{' + l3 + '} = ' + commas(M.pow(26, l3)) + '$.', 'No vowels: $21^{' + l3 + '} = ' + commas(M.pow(21, l3)) + '$.', 'At least one vowel: $' + commas(M.pow(26, l3) - M.pow(21, l3)) + '$.'], hint: 'Count the strings with no vowels.' }; }
    var w = R.int(3, 6), m = R.int(2, 5), kk = R.int(2, M.min(4, w + m - 1)), right = C(w + m, kk) - C(m, kk), wrong = w * C(w + m - 1, kk - 1);
    var grp = R.pick([['women', 'men', 'woman', 'committee', 'all-men'], ['seniors', 'juniors', 'senior', 'team', 'all-junior'], ['teachers', 'parents', 'teacher', 'panel', 'all-parent'], ['red marbles', 'blue marbles', 'red marble', 'handful', 'all-blue']]);
    if (shape === 'committee') return { q: 'A ' + grp[3] + ' of ' + kk + ' is chosen from ' + w + ' ' + grp[0] + ' and ' + m + ' ' + grp[1] + '. How many choices include at least one ' + grp[2] + '?', a: num(right),
      steps: ['All choices: $' + binom(w + m, kk) + ' = ' + C(w + m, kk) + '$.', 'Choices with no ' + grp[2] + ' (' + grp[4] + '): $' + binom(m, kk) + ' = ' + C(m, kk) + '$.', 'At least one ' + grp[2] + ': $' + C(w + m, kk) + ' - ' + C(m, kk) + ' = ' + right + '$.'], hint: 'Count all choices, then subtract the ' + grp[4] + ' ones.' };
    var small = w + m <= 6 && kk <= 3;
    var pr = { q: 'A committee of ' + kk + ' is chosen from ' + w + ' women and ' + m + ' men, with at least one woman. Jo counts: “choose one woman ($' + w + '$ ways), then any ' + (kk - 1) + ' of the other ' + (w + m - 1) + ' people ($' + binom(w + m - 1, kk - 1) + ' = ' + C(w + m - 1, kk - 1) + '$ ways), so $' + wrong + '$.” What is the correct count?', a: num(right),
      steps: ['Jo counts a committee with two women twice: once for each woman chosen “first.” So $' + wrong + '$ is too big.', 'Count the complement instead: $' + binom(w + m, kk) + ' - ' + binom(m, kk) + ' = ' + C(w + m, kk) + ' - ' + C(m, kk) + ' = ' + right + '$.'], hint: 'How many times does Jo count a committee with two women?' };
    if (small) pr.viz = { name: 'disc-overcount', opts: { mode: 'committee', people: { w: w, m: m }, size: kk, method: 'one-first', group: true, quiet: true, edit: false } };
    return pr;
  });

  function lcm(a, b) { return U.lcm(a, b); }
  G('disc.inclusion-exclusion', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['div2', 'survey2']), R.pick(['div3', 'survey3', 'none3']), R.pick(['div3', 'reverse', 'none3']));
    if (shape === 'div2') {
      var ab = R.pick([[2, 3], [3, 5], [2, 5], [4, 6], [3, 4], [6, 9], [2, 7]]), N = R.int(4, 20) * 10, a = ab[0], b = ab[1], l = lcm(a, b);
      var ans = M.floor(N / a) + M.floor(N / b) - M.floor(N / l);
      return { q: 'How many integers from $1$ to $' + N + '$ are divisible by $' + a + '$ or by $' + b + '$?', a: num(ans),
        steps: ['Divisible by $' + a + '$: $\\lfloor ' + N + '/' + a + ' \\rfloor = ' + M.floor(N / a) + '$. By $' + b + '$: $' + M.floor(N / b) + '$.', 'Divisible by both means divisible by $\\operatorname{lcm}(' + a + ', ' + b + ') = ' + l + '$: $' + M.floor(N / l) + '$. These were counted twice.', '$' + M.floor(N / a) + ' + ' + M.floor(N / b) + ' - ' + M.floor(N / l) + ' = ' + ans + '$.'], hint: 'Add the two counts, then subtract the numbers counted twice.' };
    }
    if (shape === 'survey2') {
      var A = R.int(15, 40), B = R.int(15, 40), AB = R.int(3, M.min(A, B) - 3), lang = R.pick([['French', 'Spanish', 'students'], ['soccer', 'basketball', 'children'], ['a cat', 'a dog', 'families']]);
      return { q: 'In a group, ' + A + ' ' + lang[2] + ' ' + (lang[2] === 'families' ? 'have ' : 'take ') + lang[0] + ', ' + B + ' ' + (lang[2] === 'families' ? 'have ' : 'take ') + lang[1] + ', and ' + AB + ' ' + (lang[2] === 'families' ? 'have ' : 'take ') + 'both. How many ' + (lang[2] === 'families' ? 'have' : 'take') + ' at least one of the two?', a: num(A + B - AB),
        steps: ['$|A \\cup B| = |A| + |B| - |A \\cap B|$: the ' + AB + ' in both were counted twice.', '$' + A + ' + ' + B + ' - ' + AB + ' = ' + (A + B - AB) + '$.'], hint: 'Subtract the overlap once.' };
    }
    if (shape === 'div3' || shape === 'none3') {
      var tri = R.pick(L === 3 ? [[2, 3, 5], [2, 3, 7], [3, 4, 5], [2, 5, 7], [4, 6, 10], [2, 3, 4]] : [[2, 3, 5], [2, 3, 7], [3, 5, 7], [2, 5, 7]]), N2 = R.pick([60, 100, 120, 150, 200, 210, 300]);
      var x = tri[0], y = tri[1], z = tri[2], f = function (d) { return M.floor(N2 / d); };
      var s1 = f(x) + f(y) + f(z), s2 = f(lcm(x, y)) + f(lcm(x, z)) + f(lcm(y, z)), s3 = f(lcm(lcm(x, y), z)), uni = s1 - s2 + s3;
      var none = shape === 'none3';
      return { q: 'How many integers from $1$ to $' + N2 + '$ are divisible by ' + (none ? '<b>none</b> of' : 'at least one of') + ' $' + x + '$, $' + y + '$ and $' + z + '$?', a: num(none ? N2 - uni : uni),
        steps: ['Singles: $' + f(x) + ' + ' + f(y) + ' + ' + f(z) + ' = ' + s1 + '$.', 'Pairs (use the lcm): $\\operatorname{lcm}$s are $' + lcm(x, y) + ', ' + lcm(x, z) + ', ' + lcm(y, z) + '$, giving $' + f(lcm(x, y)) + ' + ' + f(lcm(x, z)) + ' + ' + f(lcm(y, z)) + ' = ' + s2 + '$.', 'All three: $\\operatorname{lcm} = ' + lcm(lcm(x, y), z) + '$, giving $' + s3 + '$.', 'At least one: $' + s1 + ' - ' + s2 + ' + ' + s3 + ' = ' + uni + '$.' + (none ? ' None: $' + N2 + ' - ' + uni + ' = ' + (N2 - uni) + '$.' : '')],
        hint: 'Add the singles, subtract the pairs, add back the triple.' };
    }
    var a3 = R.int(20, 40), b3 = R.int(20, 40), c3 = R.int(20, 40), ab3 = R.int(6, 12), ac3 = R.int(6, 12), bc3 = R.int(6, 12), abc3 = R.int(2, 5), uni3 = a3 + b3 + c3 - ab3 - ac3 - bc3 + abc3;
    if (shape === 'survey3') return { q: 'In a survey, ' + a3 + ' people like apples, ' + b3 + ' like bananas and ' + c3 + ' like cherries. ' + ab3 + ' like apples and bananas, ' + ac3 + ' like apples and cherries, ' + bc3 + ' like bananas and cherries, and ' + abc3 + ' like all three. How many like at least one of the three?', a: num(uni3),
      steps: ['$|A \\cup B \\cup C| = |A| + |B| + |C| - |A \\cap B| - |A \\cap C| - |B \\cap C| + |A \\cap B \\cap C|$.', '$' + a3 + ' + ' + b3 + ' + ' + c3 + ' - ' + ab3 + ' - ' + ac3 + ' - ' + bc3 + ' + ' + abc3 + ' = ' + uni3 + '$.', 'The ' + abc3 + ' who like all three were added $3$ times and subtracted $3$ times, so they must be added back once.'], hint: 'Do not forget to add the triple overlap back.' };
    return { q: 'Sets $A$, $B$ and $C$ have $|A| = ' + a3 + '$, $|B| = ' + b3 + '$, $|C| = ' + c3 + '$, $|A \\cap B| = ' + ab3 + '$, $|A \\cap C| = ' + ac3 + '$, $|B \\cap C| = ' + bc3 + '$ and $|A \\cup B \\cup C| = ' + uni3 + '$. Find $|A \\cap B \\cap C|$.', a: num(abc3),
      steps: ['Inclusion–exclusion: $' + uni3 + ' = ' + a3 + ' + ' + b3 + ' + ' + c3 + ' - ' + ab3 + ' - ' + ac3 + ' - ' + bc3 + ' + |A \\cap B \\cap C|$.', 'The known terms give $' + (uni3 - abc3) + '$, so $|A \\cap B \\cap C| = ' + uni3 + ' - ' + (uni3 - abc3) + ' = ' + abc3 + '$.'], hint: 'Write the inclusion–exclusion formula and solve for the last term.' };
  });

  var WORDS = ['BANANA', 'LETTER', 'APPLE', 'LEVEL', 'BOOK', 'COOKBOOK', 'TOOTH', 'ERROR', 'PIZZA', 'RADAR', 'DEEDED', 'NOON', 'PAPA', 'ASSESS', 'ADDRESS', 'COMMITTEE', 'REFERRER', 'TENNESSEE', 'PEPPER', 'GOOGLE', 'COFFEE', 'ALABAMA', 'BALLOON', 'SUCCESS', 'MISSISSIPPI', 'STATISTICS', 'BOOKKEEPER'];
  function letterCounts(w) { var c = {}; w.split('').forEach(function (ch) { c[ch] = (c[ch] || 0) + 1; }); return c; }
  function arrangements(w) { var c = letterCounts(w), r = fact(w.length); Object.keys(c).forEach(function (k) { r /= fact(c[k]); }); return r; }
  G('disc.division-rule', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['word', 'multiset', 'table', 'multiset']), R.pick(['word', 'together', 'multiset']), R.pick(['word', 'apart', 'bracelet', 'pairs']));
    if (shape === 'word') {
      var w = R.pick(L === 1 ? WORDS.slice(0, 15) : L === 2 ? WORDS.slice(0, 22) : WORDS.slice(11)), c = letterCounts(w), rep = Object.keys(c).filter(function (k) { return c[k] > 1; }), n = arrangements(w);
      return { q: 'How many different arrangements of the letters of ' + w + ' are there?', a: num(n),
        steps: ['If all ' + w.length + ' letters were different, there would be $' + w.length + '!$ arrangements.', 'Repeated letters: ' + rep.map(function (k) { return k + ' appears ' + c[k] + ' times'; }).join(', ') + '. Swapping copies of the same letter gives the same word, so each word was counted ' + rep.map(function (k) { return c[k] + '!'; }).join(' · ') + ' times.', 'Division rule: $\\dfrac{' + w.length + '!}{' + rep.map(function (k) { return c[k] + '!'; }).join('\\,') + '} = ' + commas(n) + '$.'], hint: 'Divide $' + w.length + '!$ by a factorial for each repeated letter.' };
    }
    if (shape === 'multiset') {
      var lt = R.sample('ABCDEHKMNPRSTXYZ'.split(''), 3), k1 = R.int(2, 4), k2 = R.int(1, 3), k3 = R.int(1, 2), s = Array(k1 + 1).join(lt[0]) + Array(k2 + 1).join(lt[1]) + Array(k3 + 1).join(lt[2]), n2 = s.length, v = fact(n2) / (fact(k1) * fact(k2) * fact(k3));
      var nm = function (ch, k) { return '$' + k + '$ ' + ch + (k > 1 ? '’s' : ''); };
      return { q: 'How many different strings can be made by arranging all the letters ' + s.split('').join(', ') + '?', a: num(v),
        steps: ['$' + n2 + '$ letters: ' + nm(lt[0], k1) + ', ' + nm(lt[1], k2) + ' and ' + nm(lt[2], k3) + '.', '$\\dfrac{' + n2 + '!}{' + k1 + '!\\,' + k2 + '!\\,' + k3 + '!} = ' + v + '$.'], hint: 'Divide by the orderings of each repeated letter.' };
    }
    var p = R.int(4, 9), who = R.pick(['people', 'friends', 'guests', 'knights', 'students', 'players']), pr2 = R.pick([['Ana', 'Ben'], ['Kim', 'Leo'], ['Maya', 'Noah'], ['Sam', 'Tia'], ['Ravi', 'Uma']]);
    if (shape === 'table') return { q: p + ' ' + who + ' sit around a round table. Two seatings are the same when everyone has the same left and right neighbors (one is a rotation of the other). How many different seatings are there?', a: num(fact(p - 1)),
      steps: ['In a row there would be $' + p + '! = ' + fact(p) + '$ orders.', 'Each round seating appears as $' + p + '$ rows, one for each rotation.', 'Division rule: $\\dfrac{' + p + '!}{' + p + '} = (' + p + ' - 1)! = ' + fact(p - 1) + '$.'], hint: 'Each seating is counted once for every rotation.' };
    if (shape === 'together') return { q: p + ' ' + who + ', including ' + pr2[0] + ' and ' + pr2[1] + ', sit around a round table (rotations count as the same seating). In how many seatings do ' + pr2[0] + ' and ' + pr2[1] + ' sit next to each other?', a: num(2 * fact(p - 2)),
      steps: ['Glue ' + pr2[0] + ' and ' + pr2[1] + ' into one block: now there are $' + (p - 1) + '$ units around the table, which gives $(' + (p - 1) + ' - 1)! = ' + fact(p - 2) + '$ seatings.', 'Inside the block they can sit in $2$ orders.', 'Total: $2 \\cdot ' + fact(p - 2) + ' = ' + 2 * fact(p - 2) + '$.'], hint: 'Treat the pair as one person, then double.' };
    if (shape === 'apart') return { q: p + ' ' + who + ', including ' + pr2[0] + ' and ' + pr2[1] + ', sit around a round table (rotations count as the same seating). In how many seatings are ' + pr2[0] + ' and ' + pr2[1] + ' <b>not</b> next to each other?', a: num(fact(p - 1) - 2 * fact(p - 2)),
      steps: ['All seatings: $(' + p + ' - 1)! = ' + fact(p - 1) + '$.', 'Next to each other: glue them into a block, $2 \\cdot (' + (p - 1) + ' - 1)! = ' + 2 * fact(p - 2) + '$.', 'Not next to each other: $' + fact(p - 1) + ' - ' + 2 * fact(p - 2) + ' = ' + (fact(p - 1) - 2 * fact(p - 2)) + '$.'], hint: 'Count the complement: seatings where they are together.' };
    if (shape === 'bracelet') { var b = R.int(4, 7); return { q: b + ' different beads are put on a bracelet. Two bracelets are the same if one can be rotated or flipped over to match the other. How many different bracelets are there?', a: num(fact(b - 1) / 2),
      steps: ['Around a circle with rotations counted as the same: $(' + b + ' - 1)! = ' + fact(b - 1) + '$.', 'Flipping the bracelet turns each arrangement into its mirror image, which is a different circular order. So each bracelet was counted twice.', '$\\dfrac{' + fact(b - 1) + '}{2} = ' + fact(b - 1) / 2 + '$.'], hint: 'Divide once for rotations and once more for flips.' }; }
    var m = R.int(2, 4);
    return { q: (2 * m) + ' students are split into ' + m + ' pairs to work on a project. The pairs are not labeled. In how many ways can this be done?', a: num(fact(2 * m) / (M.pow(2, m) * fact(m))),
      steps: ['Line the students up ($' + (2 * m) + '!$ ways) and pair them off: 1st with 2nd, 3rd with 4th, and so on.', 'Swapping the two people in a pair ($2$ ways for each of $' + m + '$ pairs) or reordering the pairs ($' + m + '!$ ways) gives the same split.', '$\\dfrac{' + (2 * m) + '!}{2^{' + m + '} \\cdot ' + m + '!} = ' + fact(2 * m) / (M.pow(2, m) * fact(m)) + '$.'], hint: 'Count lineups, then divide by the orderings that give the same pairs.' };
  });

  G('disc.binomial-identities', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['pascal', 'rowsum', 'symmetry']), R.pick(['pascal', 'story', 'rowsum']), R.pick(['weighted', 'hockey', 'vandermonde', 'story']));
    if (shape === 'pascal') {
      var n = R.int(6, 14), k = R.int(2, n - 2);
      return { q: 'Given $' + binom(n - 1, k - 1) + ' = ' + commas(C(n - 1, k - 1)) + '$ and $' + binom(n - 1, k) + ' = ' + commas(C(n - 1, k)) + '$, find $' + binom(n, k) + '$.', a: num(C(n, k)),
        steps: ['Pascal’s identity: $' + binom(n, k) + ' = ' + binom(n - 1, k - 1) + ' + ' + binom(n - 1, k) + '$.', 'Reason: a group of $' + k + '$ from $' + n + '$ people either includes one particular person (choose the other $' + (k - 1) + '$ from $' + (n - 1) + '$) or does not (choose all $' + k + '$ from $' + (n - 1) + '$).', '$' + commas(C(n - 1, k - 1)) + ' + ' + commas(C(n - 1, k)) + ' = ' + commas(C(n, k)) + '$.'], hint: 'Each entry of Pascal’s triangle is the sum of the two above it.' };
    }
    if (shape === 'symmetry') { var n1 = R.int(10, 30), k1 = R.int(2, 3); return { q: 'Find $' + binom(n1, n1 - k1) + '$.', a: num(C(n1, k1)),
      steps: ['Choosing the $' + (n1 - k1) + '$ items to take is the same as choosing the $' + k1 + '$ to leave out: $' + binom(n1, n1 - k1) + ' = ' + binom(n1, k1) + '$.', '$' + binom(n1, k1) + ' = \\dfrac{' + range(n1 - k1 + 1, n1).reverse().join(' \\cdot ') + '}{' + k1 + '!} = ' + commas(C(n1, k1)) + '$.'], hint: 'Count the ones left out instead.' }; }
    if (shape === 'rowsum') {
      var n2 = R.int(4, 10), t = R.int(1, 4);
      var forms = [[binom(n2, 0) + ' + ' + binom(n2, 1) + ' + \\cdots + ' + binom(n2, n2), M.pow(2, n2), 'Both sides count all subsets of an $' + n2 + '$-element set: by size on the left, by “in or out” for each element on the right. So the sum is $2^{' + n2 + '} = ' + M.pow(2, n2) + '$.'],
        [binom(n2, 1) + ' + ' + binom(n2, 2) + ' + \\cdots + ' + binom(n2, n2), M.pow(2, n2) - 1, 'This counts the nonempty subsets: all $2^{' + n2 + '}$ subsets except $\\varnothing$, so $' + (M.pow(2, n2) - 1) + '$.'],
        [binom(n2, 0) + ' - ' + binom(n2, 1) + ' + ' + binom(n2, 2) + ' - \\cdots ' + (n2 % 2 ? '- ' : '+ ') + binom(n2, n2), 0, 'Expand $(1 - 1)^{' + n2 + '}$ with the binomial theorem: the sum is $0^{' + n2 + '} = 0$. (Subsets of even size and of odd size are equally many.)'],
        [binom(n2, 0) + ' + ' + binom(n2, 2) + ' + ' + binom(n2, 4) + ' + \\cdots', M.pow(2, n2 - 1), 'Subsets of even size are exactly half of all subsets (pair each subset with the one you get by adding or removing element $1$), so $2^{' + (n2 - 1) + '} = ' + M.pow(2, n2 - 1) + '$.']];
      var f = forms[t - 1];
      return { q: 'Find $' + f[0] + '$.', a: num(f[1]), steps: [f[2]], hint: 'What set does this sum count?' };
    }
    if (shape === 'story') {
      var st = [['Count the groups of $k$ from $n$ people by whether they include Ana.', '$\\binom{n}{k} = \\binom{n-1}{k-1} + \\binom{n-1}{k}$'], ['Count all teams of any size from $n$ people, first by size, then by deciding in or out for each person.', '$\\binom{n}{0} + \\binom{n}{1} + \\cdots + \\binom{n}{n} = 2^{n}$'],
        ['Count the ways to choose a committee of $k$ with a chair: pick the committee then the chair, or pick the chair then the other $k - 1$ members.', '$k\\binom{n}{k} = n\\binom{n-1}{k-1}$'], ['Count the ways to choose $k$ people from $m$ adults and $n$ children, by how many adults are chosen.', '$\\sum_{j} \\binom{m}{j}\\binom{n}{k-j} = \\binom{m+n}{k}$'],
        ['Count the ways to choose $k$ people to take on a trip, or equivalently the $n - k$ who stay home.', '$\\binom{n}{k} = \\binom{n}{n-k}$']];
      var it = R.pick(st), others = st.filter(function (x) { return x !== it; }).map(function (x) { return x[1]; });
      return { q: 'Which identity does this counting argument prove? “' + it[0] + '”', a: mc(it[1], R.sample(others, 3)), steps: ['A combinatorial proof counts one set in two ways; the two counts must be equal.', 'This story gives ' + it[1] + '.'], hint: 'Write the count each way, and set them equal.' };
    }
    if (shape === 'weighted') { var n3 = R.int(4, 9); return { q: 'Find $1 \\cdot ' + binom(n3, 1) + ' + 2 \\cdot ' + binom(n3, 2) + ' + \\cdots + ' + n3 + ' \\cdot ' + binom(n3, n3) + '$.', a: num(n3 * M.pow(2, n3 - 1)),
      steps: ['$k\\binom{n}{k}$ counts committees of size $k$ with a chair. Summing over $k$ counts every committee with a chair, of any size.', 'Choose the chair first ($' + n3 + '$ ways), then any subset of the other $' + (n3 - 1) + '$ people ($2^{' + (n3 - 1) + '}$ ways).', 'Total: $' + n3 + ' \\cdot 2^{' + (n3 - 1) + '} = ' + n3 * M.pow(2, n3 - 1) + '$.'], hint: 'Pick the chair first.' }; }
    if (shape === 'hockey') { var k4 = R.int(1, 3), n4 = R.int(k4 + 3, 10); var terms = range(k4, n4).map(function (i) { return binom(i, k4); });
      return { q: 'Find $' + terms.join(' + ') + '$.', a: num(C(n4 + 1, k4 + 1)),
        steps: ['Hockey-stick identity: $\\binom{' + k4 + '}{' + k4 + '} + \\binom{' + (k4 + 1) + '}{' + k4 + '} + \\cdots + \\binom{' + n4 + '}{' + k4 + '} = \\binom{' + (n4 + 1) + '}{' + (k4 + 1) + '}$.', 'Reason: to choose $' + (k4 + 1) + '$ numbers from $1, \\ldots, ' + (n4 + 1) + '$, split by the largest one chosen, $i + 1$: the other $' + k4 + '$ come from $1, \\ldots, i$, in $\\binom{i}{' + k4 + '}$ ways.', '$\\binom{' + (n4 + 1) + '}{' + (k4 + 1) + '} = ' + C(n4 + 1, k4 + 1) + '$.'], hint: 'Count subsets of size $' + (k4 + 1) + '$ by their largest element.' }; }
    var m5 = R.int(2, 4), n5 = R.int(2, 5), k5 = R.int(2, M.min(4, m5 + n5 - 1)), js = range(M.max(0, k5 - n5), M.min(m5, k5));
    return { q: 'Find $' + js.map(function (j) { return binom(m5, j) + binom(n5, k5 - j); }).join(' + ') + '$.', a: num(C(m5 + n5, k5)),
      steps: ['Each term counts groups of $' + k5 + '$ chosen from $' + m5 + '$ adults and $' + n5 + '$ children with exactly $j$ adults.', 'Adding over $j$ counts every group of $' + k5 + '$ from $' + (m5 + n5) + '$ people: $' + binom(m5 + n5, k5) + ' = ' + C(m5 + n5, k5) + '$ (Vandermonde’s identity).'], hint: 'What does the whole sum count?' };
  });

  function encViz(o) { return { name: 'disc-encode', opts: Object.assign({ mode: 'paths', quiet: true, counts: false, edit: false }, o) }; }
  G('disc.lattice-paths', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['grid', 'grid', 'strings']), R.pick(['through', 'grid', 'strings']), R.pick(['avoid', 'through2', 'three']));
    var m = R.int(2, 6), n = R.int(2, 5);
    if (shape === 'grid') return { q: 'How many shortest paths go from the bottom-left corner to the top-right corner of a grid ' + m + ' blocks wide and ' + n + ' blocks tall, moving only right (R) or up (U) along the lines?', a: num(C(m + n, n)), viz: encViz({ m: m, n: n }),
      steps: ['Every shortest path is a string of ' + m + ' R’s and ' + n + ' U’s, in some order, and every such string is a path.', 'Choose which ' + n + ' of the ' + (m + n) + ' steps are U: $' + binom(m + n, n) + ' = ' + commas(C(m + n, n)) + '$.'], hint: 'Count steps, not squares: ' + m + ' rights and ' + n + ' ups.' };
    if (shape === 'strings') { var len = R.int(5, 10), ones = R.int(2, len - 2); return { q: 'How many bit strings of length ' + len + ' have exactly ' + ones + ' ones?', a: num(C(len, ones)),
      steps: ['Choose the ' + ones + ' positions of the ones; the rest are zeros.', '$' + binom(len, ones) + ' = ' + C(len, ones) + '$. (This is the same count as paths in a ' + (len - ones) + '-by-' + ones + ' grid: 1 = up, 0 = right.)'], hint: 'Choose the positions of the ones.' }; }
    if (shape === 'three') { var a = R.int(1, 3), b = R.int(1, 3), c = R.int(1, 3), v = fact(a + b + c) / (fact(a) * fact(b) * fact(c));
      return { q: 'In 3-D, how many shortest paths go from $(0, 0, 0)$ to $(' + a + ', ' + b + ', ' + c + ')$ using unit steps in the $x$, $y$ and $z$ directions?', a: num(v),
        steps: ['A path is a string of ' + a + ' x’s, ' + b + ' y’s and ' + c + ' z’s.', 'Arrange them: $\\dfrac{' + (a + b + c) + '!}{' + a + '!\\,' + b + '!\\,' + c + '!} = ' + v + '$.'], hint: 'Count arrangements of the letters x, y, z, with repeats.' }; }
    var px = R.int(1, m - 1), py = R.int(1, n - 1), to = C(px + py, py), from = C(m - px + n - py, n - py);
    if (shape === 'through') return { q: 'In a grid ' + m + ' blocks wide and ' + n + ' blocks tall, how many shortest paths from $(0, 0)$ to $(' + m + ', ' + n + ')$ pass through the point $(' + px + ', ' + py + ')$?', a: num(to * from), viz: encViz({ m: m, n: n, through: [px, py] }),
      steps: ['To the point: $' + binom(px + py, py) + ' = ' + to + '$ paths.', 'From the point to the corner: $' + binom(m - px + n - py, n - py) + ' = ' + from + '$ paths.', 'Every first half can go with every second half: multiply, $' + to + ' \\cdot ' + from + ' = ' + to * from + '$.'], hint: 'Count the two halves and multiply (do not add).' };
    if (shape === 'avoid') return { q: 'In a grid ' + m + ' blocks wide and ' + n + ' blocks tall, the point $(' + px + ', ' + py + ')$ is blocked. How many shortest paths from $(0, 0)$ to $(' + m + ', ' + n + ')$ avoid it?', a: num(C(m + n, n) - to * from), viz: encViz({ m: m, n: n, avoid: [[px, py]] }),
      steps: ['All paths: $' + binom(m + n, n) + ' = ' + C(m + n, n) + '$.', 'Through the blocked point: $' + to + ' \\cdot ' + from + ' = ' + to * from + '$.', 'Avoiding it: $' + C(m + n, n) + ' - ' + to * from + ' = ' + (C(m + n, n) - to * from) + '$.'], hint: 'Subtract the paths that go through the blocked point.' };
    var mm = R.int(4, 6), nn = R.int(3, 5), x1 = R.int(1, 2), y1 = R.int(1, 2), x2 = R.int(x1 + 1, mm - 1), y2 = R.int(y1, nn - 1), s1 = C(x1 + y1, y1), s2 = C(x2 - x1 + y2 - y1, y2 - y1), s3 = C(mm - x2 + nn - y2, nn - y2);
    return { q: 'In a grid ' + mm + ' blocks wide and ' + nn + ' blocks tall, how many shortest paths from $(0, 0)$ to $(' + mm + ', ' + nn + ')$ pass through both $(' + x1 + ', ' + y1 + ')$ and $(' + x2 + ', ' + y2 + ')$?', a: num(s1 * s2 * s3),
      steps: ['Leg 1, to $(' + x1 + ', ' + y1 + ')$: $' + s1 + '$. Leg 2, to $(' + x2 + ', ' + y2 + ')$: $' + binom(x2 - x1 + y2 - y1, y2 - y1) + ' = ' + s2 + '$. Leg 3, to the corner: $' + s3 + '$.', 'Multiply: $' + s1 + ' \\cdot ' + s2 + ' \\cdot ' + s3 + ' = ' + s1 * s2 * s3 + '$.'], hint: 'Break the trip into three legs.' };
  });

  G('disc.stars-and-bars', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['basic', 'equation', 'basic']), R.pick(['atleast1', 'mins', 'which']), R.pick(['mins', 'upper', 'which', 'atleast1']));
    var stories = [['identical cookies', 'children', 'given to'], ['identical balls', 'boxes', 'put into'], ['identical coins', 'piggy banks', 'dropped into'], ['identical stickers', 'notebooks', 'stuck on'], ['identical pencils', 'students', 'handed out to']];
    if (shape === 'basic') { var n = R.int(4, 12), k = R.int(2, 5), s = R.pick(stories);
      return { q: 'In how many ways can ' + n + ' ' + s[0] + ' be ' + s[2] + ' ' + k + ' different ' + s[1] + ' (some may get none)?', a: num(C(n + k - 1, k - 1)),
        steps: ['Write the ' + n + ' items as stars and use $' + (k - 1) + '$ bars to split them into ' + k + ' groups.', 'Each arrangement of ' + n + ' stars and ' + (k - 1) + ' bars is one way, so choose the bar positions among $' + (n + k - 1) + '$ spots.', '$' + binom(n + k - 1, k - 1) + ' = ' + commas(C(n + k - 1, k - 1)) + '$.'], hint: n + ' stars and ' + (k - 1) + ' bars.' }; }
    if (shape === 'equation') { var n2 = R.int(5, 12), k2 = R.int(3, 4);
      return { q: 'How many solutions in nonnegative integers does $' + range(1, k2).map(function (i) { return 'x_{' + i + '}'; }).join(' + ') + ' = ' + n2 + '$ have?', a: num(C(n2 + k2 - 1, k2 - 1)),
        steps: ['A solution splits ' + n2 + ' units among ' + k2 + ' variables: ' + n2 + ' stars and ' + (k2 - 1) + ' bars.', '$' + binom(n2 + k2 - 1, k2 - 1) + ' = ' + C(n2 + k2 - 1, k2 - 1) + '$.'], hint: 'Each $x_{i}$ is the number of stars in one group.' }; }
    if (shape === 'atleast1') { var n3 = R.int(6, 14), k3 = R.int(3, 5), s3 = R.pick(stories);
      return { q: 'In how many ways can ' + n3 + ' ' + s3[0] + ' be ' + s3[2] + ' ' + k3 + ' different ' + s3[1] + ' if each gets at least one?', a: num(C(n3 - 1, k3 - 1)),
        steps: ['Give one to each first: $' + n3 + ' - ' + k3 + ' = ' + (n3 - k3) + '$ remain, to share freely.', 'Stars and bars: $' + binom(n3 - k3 + k3 - 1, k3 - 1) + ' = ' + C(n3 - 1, k3 - 1) + '$.', '(Same as placing $' + (k3 - 1) + '$ bars in the $' + (n3 - 1) + '$ gaps between ' + n3 + ' stars.)'], hint: 'Hand out the required items first.' }; }
    if (shape === 'mins') { var k4 = 3, mins = [R.int(0, 3), R.int(1, 3), R.int(0, 2)], need = sum(mins), n4 = need + R.int(3, 8), free = n4 - need;
      return { q: 'How many solutions in integers does $x_{1} + x_{2} + x_{3} = ' + n4 + '$ have with $x_{1} \\ge ' + mins[0] + '$, $x_{2} \\ge ' + mins[1] + '$ and $x_{3} \\ge ' + mins[2] + '$?', a: num(C(free + 2, 2)),
        steps: ['Give the minimums first: $' + mins.join(' + ') + ' = ' + need + '$ units, leaving $' + free + '$.', 'Write $x_{i} = ' + '\\text{min}_{i} + y_{i}$ with $y_{i} \\ge 0$: then $y_{1} + y_{2} + y_{3} = ' + free + '$.', 'Stars and bars: $' + binom(free + 2, 2) + ' = ' + C(free + 2, 2) + '$.'], hint: 'Subtract the minimums, then count nonnegative solutions.' }; }
    if (shape === 'upper') { var n5 = R.int(8, 14), c5 = R.int(2, 5), all = C(n5 + 2, 2), over = n5 - c5 - 1 >= 0 ? C(n5 - c5 - 1 + 2, 2) : 0, bf = 0;
      for (var a = 0; a <= n5; a++) for (var b = 0; a + b <= n5; b++) if (a <= c5) bf++;
      if (bf !== all - over) throw new Error('stars upper mismatch');
      return { q: 'How many solutions in nonnegative integers does $x_{1} + x_{2} + x_{3} = ' + n5 + '$ have with $x_{1} \\le ' + c5 + '$?', a: num(all - over),
        steps: ['All nonnegative solutions: $' + binom(n5 + 2, 2) + ' = ' + all + '$.', 'Bad ones have $x_{1} \\ge ' + (c5 + 1) + '$: give $x_{1}$ those first, leaving $' + (n5 - c5 - 1) + '$: $' + binom(n5 - c5 - 1 + 2, 2) + ' = ' + over + '$.', 'Good: $' + all + ' - ' + over + ' = ' + (all - over) + '$.'], hint: 'Count all, then subtract those with $x_{1} \\ge ' + (c5 + 1) + '$.' }; }
    var nb = R.int(4, 6), kb = R.int(2, 4), dist = R.coin();
    var q = dist ? 'In how many ways can ' + nb + ' <b>different</b> books be given to ' + kb + ' students (a student may get none)?' : 'In how many ways can ' + nb + ' <b>identical</b> books be given to ' + kb + ' students (a student may get none)?';
    var cands = ['$' + kb + '^{' + nb + '} = ' + M.pow(kb, nb) + '$', '$' + binom(nb + kb - 1, kb - 1) + ' = ' + C(nb + kb - 1, kb - 1) + '$', '$' + nb + '^{' + kb + '} = ' + M.pow(nb, kb) + '$', '$' + binom(nb, kb) + ' = ' + C(nb, kb) + '$'];
    var right = dist ? cands[0] : cands[1], rv = right.split('= ')[1];
    return { q: q, a: mc(right, cands.filter(function (x) { return x !== right && x.split('= ')[1] !== rv; })),
      steps: dist ? ['Different books: each book chooses its student independently, $' + kb + '$ choices each.', 'Product rule: $' + kb + '^{' + nb + '} = ' + M.pow(kb, nb) + '$. Stars and bars would treat the books as interchangeable.'] : ['Identical books: only how many each student gets matters.', 'Stars and bars: $' + nb + '$ stars, $' + (kb - 1) + '$ bars, $' + binom(nb + kb - 1, kb - 1) + ' = ' + C(nb + kb - 1, kb - 1) + '$.'],
      hint: 'Can you tell the books apart?' };
  });

  G('disc.pigeonhole', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['socks', 'atleast', 'socks']), R.pick(['kof', 'cards', 'atleast', 'specific']), R.pick(['specific', 'kof', 'sums', 'remainders']));
    if (shape === 'socks') { var c = R.int(3, 7); return { q: 'A drawer holds plenty of socks in ' + c + ' colors. You pull socks out in the dark. How many must you pull to be sure of getting two of the same color?', a: num(c + 1),
      steps: ['Worst case: the first ' + c + ' socks are all different colors, one of each.', 'The next sock must match one of them (pigeonhole: ' + (c + 1) + ' socks, ' + c + ' colors).', 'So ' + (c + 1) + ' socks guarantee a pair; ' + c + ' do not.'], hint: 'Imagine the worst luck possible, then take one more.' }; }
    if (shape === 'kof') { var c2 = R.int(3, 6), k = R.int(3, 5); return { q: 'A bag holds plenty of marbles in ' + c2 + ' colors. How many must you draw, without looking, to be sure of getting ' + k + ' of the same color?', a: num(c2 * (k - 1) + 1),
      steps: ['Worst case: $' + (k - 1) + '$ of every color, $' + c2 + ' \\cdot ' + (k - 1) + ' = ' + c2 * (k - 1) + '$ marbles, with no color reaching ' + k + '.', 'One more marble makes some color reach ' + k + '.', 'Answer: $' + (c2 * (k - 1) + 1) + '$.'], hint: 'How many can you draw while every color stays below ' + k + '?' }; }
    if (shape === 'cards') { var k3 = R.int(2, 5); return { q: 'How many cards must you draw from a standard 52-card deck (4 suits) to be sure of getting ' + k3 + ' cards of the same suit?', a: num(4 * (k3 - 1) + 1),
      steps: ['Worst case: $' + (k3 - 1) + '$ of each suit, $4 \\cdot ' + (k3 - 1) + ' = ' + 4 * (k3 - 1) + '$ cards.', 'One more card gives ' + k3 + ' of some suit: $' + (4 * (k3 - 1) + 1) + '$.'], hint: 'Fill each suit up to one below the goal.' }; }
    if (shape === 'atleast') { var nb = R.pick([7, 12, 30, 5, 10]), N = nb * R.int(2, 9) + R.int(1, nb - 1), what = { 7: ['people', 'were born on the same day of the week'], 12: ['people', 'were born in the same month'], 30: ['students', 'share the same score out of 30 points (scores 1 to 30)'], 5: ['letters', 'go into the same mailbox (5 mailboxes)'], 10: ['numbers', 'end in the same digit'] }[nb];
      return { q: 'Among ' + N + ' ' + what[0] + ', what is the largest number you can be sure ' + what[1] + '?', a: num(M.ceil(N / nb)),
        steps: ['There are ' + nb + ' boxes. If every box held at most $' + (M.ceil(N / nb) - 1) + '$, the total would be at most $' + nb * (M.ceil(N / nb) - 1) + ' < ' + N + '$.', 'So some box holds at least $\\lceil ' + N + '/' + nb + ' \\rceil = ' + M.ceil(N / nb) + '$.', 'And $' + M.ceil(N / nb) + '$ is the most you can promise: the ' + what[0] + ' could be spread as evenly as possible.'], hint: 'Divide and round up.' }; }
    if (shape === 'specific') { var r = R.int(3, 8), b = R.int(2, 6), g = R.int(2, 6), want = R.int(2, M.min(3, b));
      return { q: 'A drawer holds ' + r + ' red, ' + b + ' blue and ' + g + ' green socks. How many must you pull out, without looking, to be sure of getting ' + want + ' blue socks?', a: num(r + g + want),
        steps: ['Worst case: you pull every red and green sock first, $' + r + ' + ' + g + ' = ' + (r + g) + '$ socks, with no blue.', 'Then you need ' + want + ' more, and they must be blue.', 'Answer: $' + (r + g) + ' + ' + want + ' = ' + (r + g + want) + '$.'], hint: 'The worst case takes all the other colors first.' }; }
    if (shape === 'sums') { var n = R.int(4, 10); return { q: 'Numbers are chosen from $\\{1, 2, \\ldots, ' + 2 * n + '\\}$. How many must be chosen to be sure two of them add up to $' + (2 * n + 1) + '$?', a: num(n + 1),
      steps: ['Group the numbers into $' + n + '$ pairs that add to $' + (2 * n + 1) + '$: $\\{1, ' + 2 * n + '\\}, \\{2, ' + (2 * n - 1) + '\\}, \\ldots, \\{' + n + ', ' + (n + 1) + '\\}$.', 'You can pick one from each pair, $' + n + '$ numbers, with no matching sum.', 'With $' + (n + 1) + '$ numbers, two land in the same pair (pigeonhole).'], hint: 'Make the pairs the boxes.' }; }
    var m = R.int(3, 9); return { q: 'How many integers must you choose to be sure that two of them leave the same remainder when divided by $' + m + '$?', a: num(m + 1),
      steps: ['There are $' + m + '$ possible remainders: $0, 1, \\ldots, ' + (m - 1) + '$.', 'With $' + m + '$ integers they could all differ; with $' + (m + 1) + '$, two must share a remainder.'], hint: 'The remainders are the boxes.' };
  });

  function derange(n) { var d = [1, 0]; for (var i = 2; i <= n; i++) d[i] = (i - 1) * (d[i - 1] + d[i - 2]); return d[n]; }
  G('disc.derangements', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['dn', 'atleast', 'ie', 'dn', 'fixk']), R.pick(['dn', 'prob', 'exactk', 'atleast', 'rec']), R.pick(['exactk', 'prob', 'ie2', 'rec', 'dn']));
    var n = R.int(3, L === 1 ? 6 : 8), D = derange(n);
    var CX = [['letters', 'envelopes', 'letter', 'in its own envelope'], ['friends in a gift swap', 'name cards drawn from a hat', 'friend', 'drawing their own name'], ['students', 'their old seats', 'student', 'in their old seat'], ['guests', 'checked hats handed back at random', 'guest', 'getting their own hat'], ['numbers $1, \\ldots, ' + n + '$', 'positions', 'number', 'in its own position']];
    var cx = R.pick(CX);
    var ieSteps = function (n0) { return '$D_{' + n0 + '} = ' + range(0, n0).map(function (k) { return (k ? (k % 2 ? ' - ' : ' + ') : '') + '\\binom{' + n0 + '}{' + k + '}' + (n0 - k) + '!'; }).join('') + ' = ' + range(0, n0).map(function (k) { return (k ? (k % 2 ? ' - ' : ' + ') : '') + C(n0, k) * fact(n0 - k); }).join('') + ' = ' + commas(derange(n0)) + '$.'; };
    var dseq = function (m) { return range(1, m).map(function (k) { return commas(derange(k)); }).join(', '); };
    if (shape === 'dn') return { q: 'Count the ways to match ' + n + ' ' + cx[0] + ' with ' + cx[1] + ', one each, so that <b>no</b> ' + cx[2] + ' ends up ' + cx[3] + '.', a: num(D),
      steps: ['This is the number of derangements $D_{' + n + '}$. Inclusion–exclusion over the ones that land in their own place: if $k$ given ones are fixed, the rest can be arranged in $(' + n + ' - k)!$ ways.', ieSteps(n), 'Check with the recurrence $D_{n} = (n - 1)(D_{n-1} + D_{n-2})$: $D_{1}, D_{2}, \ldots = ' + dseq(n) + '$.'], hint: 'Use inclusion–exclusion, or the recurrence $D_{n} = (n - 1)(D_{n-1} + D_{n-2})$.' };
    if (shape === 'rec') { var m = R.int(5, 10); return { q: 'Derangements satisfy $D_{n} = (n - 1)(D_{n-1} + D_{n-2})$. Given $D_{' + (m - 2) + '} = ' + commas(derange(m - 2)) + '$ and $D_{' + (m - 1) + '} = ' + commas(derange(m - 1)) + '$, find $D_{' + m + '}$.', a: num(derange(m)),
      steps: ['$D_{' + m + '} = ' + (m - 1) + '(' + commas(derange(m - 1)) + ' + ' + commas(derange(m - 2)) + ') = ' + (m - 1) + ' \\cdot ' + commas(derange(m - 1) + derange(m - 2)) + ' = ' + commas(derange(m)) + '$.', 'Check: $' + m + '!/e \\approx ' + commas(Math.round(fact(m) / Math.E)) + '$, and $D_{n}$ is always the whole number nearest $n!/e$.'], hint: 'Substitute into the recurrence.' }; }
    if (shape === 'atleast') return { q: 'There are $D_{' + n + '} = ' + D + '$ ways to match ' + n + ' ' + cx[0] + ' with ' + cx[1] + ' so that none is ' + cx[3].replace(/^in |^getting |^drawing /, function (w) { return w; }) + '. In how many matchings is <b>at least one</b> ' + cx[2] + ' ' + cx[3] + '?', a: num(fact(n) - D),
      steps: ['All matchings: $' + n + '! = ' + commas(fact(n)) + '$.', 'None in its own place: $D_{' + n + '} = ' + D + '$.', 'At least one: $' + commas(fact(n)) + ' - ' + D + ' = ' + commas(fact(n) - D) + '$.'], hint: 'Use the complement.' };
    if (shape === 'ie' || shape === 'fixk') { var n2 = R.int(4, 9), k = shape === 'ie' ? 2 : R.int(1, 3), who = U.list(range(1, k).map(function (x) { return '$' + x + '$'; }));
      return { q: 'How many arrangements of $1, 2, \\ldots, ' + n2 + '$ keep ' + (k === 1 ? '$1$' : 'each of ' + who) + ' in ' + (k === 1 ? 'its' : 'their') + ' own place' + (k === 1 ? '' : 's') + ' (others may or may not move)?', a: num(fact(n2 - k)), steps: ['Fix ' + (k === 1 ? 'it' : 'them') + '; the other $' + (n2 - k) + '$ numbers can go anywhere among the remaining places.', '$(' + n2 + ' - ' + k + ')! = ' + commas(fact(n2 - k)) + '$. This is one term in the inclusion–exclusion count of derangements.'], hint: 'Only the unfixed numbers move.' }; }
    if (shape === 'ie2') { var k2 = R.int(1, 3), n3 = R.int(k2 + 2, 8);
      return { q: 'In the inclusion–exclusion count of derangements of $' + n3 + '$ items, what is the total for sets of exactly ' + k2 + ' fixed item' + (k2 > 1 ? 's' : '') + ', $\\binom{' + n3 + '}{' + k2 + '}(' + n3 + ' - ' + k2 + ')!$?', a: num(C(n3, k2) * fact(n3 - k2)),
        steps: ['Choose which ' + k2 + ' item' + (k2 > 1 ? 's are' : ' is') + ' fixed: $' + binom(n3, k2) + ' = ' + C(n3, k2) + '$.', 'Arrange the rest freely: $' + (n3 - k2) + '! = ' + commas(fact(n3 - k2)) + '$.', 'Product: $' + commas(C(n3, k2) * fact(n3 - k2)) + '$. (Notice it equals $' + n3 + '!/' + k2 + '!$.)'], hint: 'Choose the fixed items, then arrange the others.' }; }
    if (shape === 'prob') { var pq = ML.Q(D, fact(n));
      return { q: n + ' ' + cx[0] + ' are matched with ' + cx[1] + ' at random, all matchings equally likely. What is the probability that <b>no</b> ' + cx[2] + ' ends up ' + cx[3] + '? Give an exact fraction.', a: num(pq.toString()),
        steps: ['All matchings: $' + n + '! = ' + commas(fact(n)) + '$.', 'None in its own place: $D_{' + n + '} = ' + commas(D) + '$.', 'Probability $\\dfrac{' + commas(D) + '}{' + commas(fact(n)) + '} = ' + pq.toTex() + ' \\approx ' + (D / fact(n)).toFixed(4) + '$, already close to $\\frac{1}{e} \\approx 0.3679$.'], hint: 'Derangements divided by all matchings.' }; }
    var n4 = R.int(4, 8), k3 = R.int(1, n4 - 2), v = C(n4, k3) * derange(n4 - k3);
    return { q: 'How many arrangements of ' + n4 + ' items leave <b>exactly</b> ' + k3 + ' item' + (k3 > 1 ? 's' : '') + ' in ' + (k3 > 1 ? 'their' : 'its') + ' original place' + (k3 > 1 ? 's' : '') + '?', a: num(v),
      steps: ['Choose which ' + k3 + ' stay: $' + binom(n4, k3) + ' = ' + C(n4, k3) + '$.', 'The other $' + (n4 - k3) + '$ must all move: $D_{' + (n4 - k3) + '} = ' + derange(n4 - k3) + '$.', 'Product: $' + C(n4, k3) + ' \\cdot ' + derange(n4 - k3) + ' = ' + commas(v) + '$.'], hint: 'Choose the fixed items; derange the rest.' };
  });

// ---- 06-recursion.js
  // ================================================================ Unit 6: Induction, Recursion and Growth
  function bpow(a, n) { return BigInt(a) ** BigInt(n); }
  function bfact(n) { var r = 1n; for (var i = 2; i <= n; i++) r *= BigInt(i); return r; }
  var INEQ = [['2^{n} > n^{2}', function (n) { return bpow(2, n) > BigInt(n * n); }], ['2^{n} > n^{3}', function (n) { return bpow(2, n) > BigInt(n * n * n); }], ['3^{n} > n^{3}', function (n) { return bpow(3, n) > BigInt(n * n * n); }],
    ['n! > 2^{n}', function (n) { return bfact(n) > bpow(2, n); }], ['n! > 3^{n}', function (n) { return bfact(n) > bpow(3, n); }], ['2^{n} > 2n + 1', function (n) { return bpow(2, n) > BigInt(2 * n + 1); }],
    ['2^{n} > n^{2} + n', function (n) { return bpow(2, n) > BigInt(n * n + n); }], ['2^{n} > 5n', function (n) { return bpow(2, n) > BigInt(5 * n); }], ['2^{n} > 10n', function (n) { return bpow(2, n) > BigInt(10 * n); }],
    ['n^{2} > 4n + 5', function (n) { return n * n > 4 * n + 5; }], ['3^{n} > 2^{n} + 10', function (n) { return bpow(3, n) > bpow(2, n) + 10n; }],
    ['n! > 4^{n}', function (n) { return bfact(n) > bpow(4, n); }], ['2^{n} > n^{2} + 3', function (n) { return bpow(2, n) > BigInt(n * n + 3); }], ['3^{n} > n^{4}', function (n) { return bpow(3, n) > BigInt(n) ** 4n; }],
    ['2^{n} > 6n', function (n) { return bpow(2, n) > BigInt(6 * n); }], ['4^{n} > n^{4}', function (n) { return bpow(4, n) > BigInt(n) ** 4n; }], ['3^{n} > 4n', function (n) { return bpow(3, n) > BigInt(4 * n); }], ['n^{3} > 10n^{2} + 5', function (n) { return n * n * n > 10 * n * n + 5; }]];
  function ineqStart(f) { var N = 1; for (var n = 1; n <= 80; n++) if (!f(n)) N = n + 1; return N; }
  function ineqShow(tex, n) { return tex.replace(/n/g, '{' + n + '}'); }
  var GCDF = [['n^{3} - n', function (n) { return BigInt(n) ** 3n - BigInt(n); }], ['n^{5} - n', function (n) { return BigInt(n) ** 5n - BigInt(n); }], ['n(n + 1)(n + 2)', function (n) { return BigInt(n * (n + 1) * (n + 2)); }],
    ['4^{n} - 1', function (n) { return bpow(4, n) - 1n; }], ['5^{n} - 1', function (n) { return bpow(5, n) - 1n; }], ['7^{n} - 1', function (n) { return bpow(7, n) - 1n; }], ['9^{n} - 1', function (n) { return bpow(9, n) - 1n; }],
    ['8^{n} - 1', function (n) { return bpow(8, n) - 1n; }], ['6^{n} - 1', function (n) { return bpow(6, n) - 1n; }], ['11^{n} - 6', function (n) { return bpow(11, n) - 6n; }], ['3^{n} + 7^{n} - 2', function (n) { return bpow(3, n) + bpow(7, n) - 2n; }],
    ['n^{2} + n', function (n) { return BigInt(n * n + n); }], ['2^{n+2} + 3^{2n+1}', function (n) { return bpow(2, n + 2) + bpow(3, 2 * n + 1); }], ['n^{7} - n', function (n) { return BigInt(n) ** 7n - BigInt(n); }],
    ['n(n + 1)(n + 2)(n + 3)', function (n) { return BigInt(n * (n + 1) * (n + 2) * (n + 3)); }], ['n^{3} + 5n', function (n) { return BigInt(n * n * n + 5 * n); }], ['5^{n} - 4n - 1', function (n) { return bpow(5, n) - BigInt(4 * n + 1); }], ['10^{n} - 1', function (n) { return bpow(10, n) - 1n; }], ['3^{2n} - 2^{n}', function (n) { return bpow(9, n) - bpow(2, n); }]];
  function bgcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function gcdAll(f) { var g = 0n; for (var n = 1; n <= 30; n++) g = bgcd(g, f(n)); return Number(g); }

  G('disc.induction-beyond-sums', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['base', 'fails', 'step']), R.pick(['step', 'poly', 'base', 'fails']), R.pick(['gcd', 'ineqstep', 'poly', 'base']));
    if (shape === 'fails') {
      var itf = R.pick(INEQ.filter(function (x) { return ineqStart(x[1]) > 2; })), Nf = ineqStart(itf[1]), fl = range(1, Nf - 1).filter(function (n) { return !itf[1](n); });
      return { q: 'For which positive integers $n$ is $' + itf[0] + '$ <b>false</b>? List them all. (It is true for every $n \\ge ' + Nf + '$.)', a: setA(fl),
        steps: ['Only $n = 1, \\ldots, ' + (Nf - 1) + '$ need checking: ' + range(1, Nf - 1).map(function (n) { return '$n = ' + n + '$: ' + (itf[1](n) ? 'true' : '<b>false</b>'); }).join('; ') + '.', 'False for $n = ' + fl.join(', ') + '$. An induction proof of this inequality must start at $n = ' + Nf + '$.'], hint: 'Test each $n$ below ' + Nf + '.' };
    }
    if (shape === 'base') {
      var it = R.pick(INEQ), N = ineqStart(it[1]), fails = range(1, N - 1).filter(function (n) { return !it[1](n); }), holds = range(1, N - 1).filter(function (n) { return it[1](n); });
      return { q: 'What is the smallest positive integer $N$ such that $' + it[0] + '$ holds for every integer $n \\ge N$? (That $N$ is where an induction proof should start.)', a: num(N),
        steps: ['Test small values: ' + range(1, N).map(function (n) { return '$n = ' + n + '$: ' + (it[1](n) ? 'true' : '<b>false</b>'); }).join('; ') + '.', fails.length ? 'The last failure is at $n = ' + fails[fails.length - 1] + '$' + (holds.length ? ', even though it held at $n = ' + holds.join(', ') + '$' : '') + '.' : 'It never fails.', 'From $n = ' + N + '$ on, each step keeps it true (the left side grows faster), so $N = ' + N + '$.'],
        hint: 'Check $n = 1, 2, 3, \\ldots$ and find the last value where it fails.' };
    }
    if (shape === 'step') {
      if (R.coin()) { var a = R.int(3, 20); return { q: 'To prove $' + (a - 1) + ' \\mid ' + a + '^{n} - 1$ for all $n \\ge 1$ by induction, the step writes $' + a + '^{k+1} - 1 = ' + a + '(' + a + '^{k} - 1) + c$. What is $c$?', a: num(a - 1),
        steps: ['Expand: $' + a + '(' + a + '^{k} - 1) = ' + a + '^{k+1} - ' + a + '$.', 'So $' + a + '^{k+1} - 1 = ' + a + '(' + a + '^{k} - 1) + ' + (a - 1) + '$.', 'By the hypothesis $' + (a - 1) + '$ divides $' + a + '^{k} - 1$, and it divides $' + (a - 1) + '$, so it divides the sum.'], hint: 'Expand $' + a + '(' + a + '^{k} - 1)$ and compare.' }; }
      var b = R.int(2, 7), a2 = b + R.int(2, 6);
      return { q: 'To prove $' + (a2 - b) + ' \\mid ' + a2 + '^{n} - ' + b + '^{n}$ by induction, the step writes $' + a2 + '^{k+1} - ' + b + '^{k+1} = ' + a2 + '(' + a2 + '^{k} - ' + b + '^{k}) + c \\cdot ' + b + '^{k}$. What is $c$?', a: num(a2 - b),
        steps: ['$' + a2 + '(' + a2 + '^{k} - ' + b + '^{k}) = ' + a2 + '^{k+1} - ' + a2 + ' \\cdot ' + b + '^{k}$.', 'To get $-' + b + '^{k+1} = -' + b + ' \\cdot ' + b + '^{k}$ we add $(' + a2 + ' - ' + b + ')' + b + '^{k}$, so $c = ' + (a2 - b) + '$.', 'Both parts are multiples of $' + (a2 - b) + '$: the first by the hypothesis, the second because of the factor $' + (a2 - b) + '$.'], hint: 'Expand $' + a2 + '(' + a2 + '^{k} - ' + b + '^{k})$ and see what is still missing.' };
    }
    if (shape === 'poly' && R.coin()) {
      var c2 = R.pick([1, 3, 5, 7, -1, -3, 9]), q2 = (1 + c2) / 2, ft2 = T.terms([[1, 'n^{2}'], [c2, 'n']]), kt2 = T.terms([[1, 'k^{2}'], [c2, 'k']]), cs2 = c2 < 0 ? '- ' + (c2 === -1 ? '' : -c2) : '+ ' + (c2 === 1 ? '' : c2), k12 = '(k + 1)^{2} ' + cs2 + '(k + 1)';
      return { q: 'To prove $2 \\mid ' + ft2 + '$ for all $n \\ge 1$ by induction, the step writes $' + k12 + ' = (' + kt2 + ') + 2\\,' + BOX + '$. What goes in the box?', a: expr(plainTerms([[1, 'k'], [q2, '']]), ['k']),
        steps: ['Expand: $' + k12 + ' = k^{2} + 2k + 1 ' + cs2 + 'k ' + (c2 < 0 ? '- ' + (-c2) : '+ ' + c2) + '$.', 'Subtract $' + kt2 + '$: the rest is $' + T.terms([[2, 'k'], [1 + c2, '']]) + ' = 2(' + T.lin(1, 'k', q2) + ')$.', 'So the $n = k + 1$ case is the $n = k$ case plus an even number.'], hint: 'Expand $(k + 1)^{2}$ and subtract the $n = k$ expression.' };
    }
    if (shape === 'poly') {
      var c = R.pick([2, 5, 8, -1, 11, 14, -4]), q3 = (1 + c) / 3, ex = plainTerms([[1, 'k^2'], [1, 'k'], [q3, '']]), et = T.poly([1, 1, q3], 'k'), ft = T.terms([[1, 'n^{3}'], [c, 'n']]), kt = T.terms([[1, 'k^{3}'], [c, 'k']]), cs = c < 0 ? '- ' + (c === -1 ? '' : -c) : '+ ' + c, k1 = '(k + 1)^{3} ' + cs + '(k + 1)';
      return { q: 'To prove $3 \\mid ' + ft + '$ for all $n \\ge 1$ by induction, the step writes $' + k1 + ' = (' + kt + ') + 3\\,' + BOX + '$. What polynomial in $k$ goes in the box?', a: expr(ex, ['k']),
        steps: ['Expand: $' + k1 + ' = k^{3} + 3k^{2} + 3k + 1 ' + cs + 'k ' + (c < 0 ? '- ' + (-c) : '+ ' + c) + '$.', 'Subtract $' + kt + '$: the rest is $' + T.terms([[3, 'k^{2}'], [3, 'k'], [1 + c, '']]) + ' = 3(' + et + ')$.', 'The hypothesis says $3$ divides $' + kt + '$, and $3$ divides $3(' + et + ')$, so $3$ divides the sum.'], hint: 'Expand $(k + 1)^{3}$ and subtract the $n = k$ expression.' };
    }
    if (shape === 'gcd') {
      var g = R.pick(GCDF), d = gcdAll(g[1]);
      return { q: 'What is the largest integer that divides $' + g[0] + '$ for every positive integer $n$?', a: num(d),
        steps: ['Compute the first few values: ' + range(1, 4).map(function (n) { return '$' + commas(Number(g[1](n))) + '$'; }).join(', ') + '.', 'Any divisor of all of them divides their gcd, which is $' + d + '$.', 'And $' + d + '$ does divide every value; an induction proof (rewriting the case $n = k + 1$ with the case $n = k$) confirms it for all $n$.'], hint: 'Find the gcd of the first few values.' };
    }
    var fam = R.pick([['2^{k} > k^{2}', 2, 2], ['3^{k} > k^{3}', 3, 3], ['2^{k} > k^{3}', 2, 3]]), base = fam[1], p = fam[2], K = 1;
    for (var k = 1; k <= 100; k++) if (base * M.pow(k, p) < M.pow(k + 1, p)) K = k + 1;
    return { q: 'In the step of an induction proof of $' + fam[0] + '$: $' + fam[0].split(' > ')[0].replace('k', '{k+1}') + ' = ' + base + ' \\cdot ' + fam[0].split(' > ')[0] + ' > ' + base + 'k^{' + p + '}$, and the proof needs $' + base + 'k^{' + p + '} \\ge (k + 1)^{' + p + '}$. What is the smallest positive integer $k$ from which this holds for every larger $k$ too?', a: num(K),
      steps: ['$' + base + 'k^{' + p + '} \\ge (k + 1)^{' + p + '}$ is the same as $\\left(1 + \\frac{1}{k}\\right)^{' + p + '} \\le ' + base + '$, which gets easier as $k$ grows.', range(1, K).map(function (k2) { return '$k = ' + k2 + '$: $' + base * M.pow(k2, p) + (base * M.pow(k2, p) >= M.pow(k2 + 1, p) ? ' \\ge ' : ' < ') + M.pow(k2 + 1, p) + '$'; }).join('; ') + '.', 'So it holds from $k = ' + K + '$ on. The base case of the whole proof must be at least this large and must itself be true.'], hint: 'Compare $' + base + 'k^{' + p + '}$ with $(k + 1)^{' + p + '}$ for small $k$.' };
  });

  var STAMPS = [[3, 5], [3, 7], [4, 5], [4, 7], [5, 6], [3, 8], [5, 7], [4, 9], [3, 10], [5, 8]];
  function payable(a, b, n) { for (var x = 0; a * x <= n; x++) if ((n - a * x) % b === 0) return true; return false; }
  G('disc.strong-induction', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['pay', 'reach', 'howmany']), R.pick(['frob', 'basecases', 'chocolate']), R.pick(['basecases', 'frob', 'start']));
    var ab = R.pick(STAMPS), a = ab[0], b = ab[1], F = a * b - a - b, N = F + 1;
    if (shape === 'pay') { var n = F + R.int(-4, 4); if (n < 1) n = F + 2;
      var ok = payable(a, b, n), way = null; for (var x = 0; a * x <= n; x++) if ((n - a * x) % b === 0) { way = [x, (n - a * x) / b]; break; }
      return { q: 'Can exactly ' + n + '¢ be paid using only ' + a + '¢ and ' + b + '¢ stamps?', a: tf(ok),
        steps: ok ? ['Yes: $' + n + ' = ' + a + ' \\cdot ' + way[0] + ' + ' + b + ' \\cdot ' + way[1] + '$.'] : ['Try each number of ' + b + '¢ stamps: $' + range(0, M.floor(n / b)).map(function (y) { return n + ' - ' + b * y + ' = ' + (n - b * y); }).join('$, $') + '$.', 'None of these is a multiple of ' + a + ', so it cannot be done.'],
        hint: 'Try $0, 1, 2, \\ldots$ stamps of ' + b + '¢ and see if the rest is a multiple of ' + a + '.' }; }
    if (shape === 'frob') {
      var bf = 0; for (var m = 1; m < a * b; m++) if (!payable(a, b, m)) bf = m;
      if (bf !== F) throw new Error('frobenius mismatch');
      return { q: 'What is the largest amount that <b>cannot</b> be paid exactly with ' + a + '¢ and ' + b + '¢ stamps?', a: num(F),
        steps: ['Check amounts near the top: ' + range(F - 2, F + a).filter(function (m) { return m > 0; }).map(function (m) { return m + '¢: ' + (payable(a, b, m) ? 'yes' : '<b>no</b>'); }).join('; ') + '.', 'From $' + N + '$ to $' + (N + a - 1) + '$ there are ' + a + ' payable amounts in a row; adding ' + a + '¢ stamps reaches everything above (strong induction).', 'So the largest impossible amount is $' + F + '$ (also $' + a + ' \\cdot ' + b + ' - ' + a + ' - ' + b + '$).'],
        hint: 'Find ' + a + ' payable amounts in a row; everything above them is payable.' };
    }
    if (shape === 'basecases' || shape === 'howmany') {
      if (shape === 'howmany') return { q: 'A strong induction proof shows every amount of at least ' + N + '¢ can be paid with ' + a + '¢ and ' + b + '¢ stamps. Its step pays $n$ cents by adding one ' + a + '¢ stamp to a way of paying $n - ' + a + '$ cents. How many base cases does the proof need?', a: num(a),
        steps: ['The step reaches back ' + a + ' amounts: $n$ uses $n - ' + a + '$.', 'So the base cases must cover ' + a + ' consecutive amounts, $' + N + '$ through $' + (N + a - 1) + '$; after that, every amount is a known amount plus ' + a + '.', 'Answer: $' + a + '$.'], hint: 'How far back does the step reach?' };
      var bc = range(N, N + a - 1);
      return { q: 'Every amount of at least ' + N + '¢ can be paid with ' + a + '¢ and ' + b + '¢ stamps. A strong induction proof steps from $n - ' + a + '$ to $n$ (add one ' + a + '¢ stamp). Which amounts must be checked as base cases?', a: setA(bc),
        steps: ['The step needs the case $n - ' + a + '$, so the first ' + a + ' amounts, $' + N + '$ to $' + (N + a - 1) + '$, have nothing to step from.', bc.map(function (m) { var w; for (var x = 0; a * x <= m; x++) if ((m - a * x) % b === 0) { w = [x, (m - a * x) / b]; break; } return '$' + m + ' = ' + a + ' \\cdot ' + w[0] + ' + ' + b + ' \\cdot ' + w[1] + '$'; }).join('; ') + '.', 'Base cases: $' + setTex(bc) + '$.'],
        hint: 'The step reaches back ' + a + '; list the first ' + a + ' amounts.' };
    }
    if (shape === 'reach') { var rr = R.pick([[2, 'a_{n} = a_{n-1} + a_{n-2}'], [3, 'a_{n} = a_{n-1} + a_{n-3}'], [3, 'a_{n} = 2a_{n-2} + a_{n-3}'], [2, 'a_{n} = 3a_{n-1} - a_{n-2}'], [4, 'a_{n} = a_{n-2} + a_{n-4}']]);
      return { q: 'A proof by strong induction about a sequence with $' + rr[1] + '$ uses the recurrence in its step. How many base cases does it need?', a: num(rr[0]),
        steps: ['The step for $a_{n}$ uses terms as far back as $a_{n-' + rr[0] + '}$.', 'So the first ' + rr[0] + ' terms cannot be reached by the step and must be checked directly.'], hint: 'Find the oldest term the recurrence uses.' }; }
    if (shape === 'chocolate') { var r1 = R.int(2, 8), c1 = R.int(2, 8); return { q: 'A chocolate bar is a ' + r1 + '-by-' + c1 + ' grid of squares. A break splits one piece into two along a grid line. How many breaks does it take to separate all the squares?', a: num(r1 * c1 - 1),
      steps: ['Each break turns one piece into two, so it raises the number of pieces by exactly $1$.', 'We go from $1$ piece to $' + r1 * c1 + '$ pieces: $' + r1 * c1 + ' - 1 = ' + (r1 * c1 - 1) + '$ breaks, whatever order you break in.', '(A strong induction proof splits the bar into two smaller bars and uses the claim for both.)'], hint: 'What does each break do to the number of pieces?' }; }
    return { q: 'Every amount from some point on can be paid with ' + a + '¢ and ' + b + '¢ stamps. What is the smallest amount $N$ such that every amount $\\ge N$ can be paid?', a: num(N),
      steps: ['The largest amount that cannot be paid is $' + F + '$ (check: ' + F + '¢ is impossible).', 'The ' + a + ' amounts $' + N + '$ to $' + (N + a - 1) + '$ are all payable, and adding ' + a + '¢ stamps reaches every larger amount.', 'So $N = ' + N + '$.'], hint: 'Find the largest amount that is impossible.' };
  });

  var RECS = [
    { d: 'ways to tile a 1-by-$n$ strip with 1-by-1 squares and 1-by-2 dominoes', init: [1, 2], step: function (a, n) { return a[n - 1] + a[n - 2]; }, rec: 'a_{n} = a_{n-1} + a_{n-2}', why: 'The last tile is a square (the rest is a strip of length $n - 1$) or a domino (length $n - 2$).' },
    { d: 'ways to tile a 1-by-$n$ strip with tiles of length 1 and length 3', init: [1, 1, 2], step: function (a, n) { return a[n - 1] + a[n - 3]; }, rec: 'a_{n} = a_{n-1} + a_{n-3}', why: 'The last tile has length 1 (leaving $n - 1$) or length 3 (leaving $n - 3$).' },
    { d: 'ways to tile a 1-by-$n$ strip with red squares, blue squares and dominoes', init: [2, 5], step: function (a, n) { return 2 * a[n - 1] + a[n - 2]; }, rec: 'a_{n} = 2a_{n-1} + a_{n-2}', why: 'The last tile is a red square, a blue square (each leaving $n - 1$) or a domino (leaving $n - 2$).' },
    { d: 'ways to tile a 1-by-$n$ strip with squares, red dominoes and blue dominoes', init: [1, 3], step: function (a, n) { return a[n - 1] + 2 * a[n - 2]; }, rec: 'a_{n} = a_{n-1} + 2a_{n-2}', why: 'The last tile is a square (leaving $n - 1$) or one of two colors of domino (each leaving $n - 2$).' },
    { d: 'ways to climb $n$ stairs taking 1, 2 or 3 steps at a time', init: [1, 2, 4], step: function (a, n) { return a[n - 1] + a[n - 2] + a[n - 3]; }, rec: 'a_{n} = a_{n-1} + a_{n-2} + a_{n-3}', why: 'The last move is 1, 2 or 3 steps, leaving $n - 1$, $n - 2$ or $n - 3$ stairs.' },
    { d: 'bit strings of length $n$ with no two 1s in a row', init: [2, 3], step: function (a, n) { return a[n - 1] + a[n - 2]; }, rec: 'a_{n} = a_{n-1} + a_{n-2}', why: 'A good string ends in 0 (any good string of length $n - 1$, then 0) or in 01 (any good string of length $n - 2$, then 01).' },
    { d: 'strings of length $n$ over $\\{0, 1, 2\\}$ with no two 0s in a row', init: [3, 8], step: function (a, n) { return 2 * a[n - 1] + 2 * a[n - 2]; }, rec: 'a_{n} = 2a_{n-1} + 2a_{n-2}', why: 'A good string ends in 1 or 2 (after any good string of length $n - 1$) or in a 0 that follows a 1 or 2 (after any good string of length $n - 2$).' },
    { d: 'bit strings of length $n$ with no three 0s in a row', init: [2, 4, 7], step: function (a, n) { return a[n - 1] + a[n - 2] + a[n - 3]; }, rec: 'a_{n} = a_{n-1} + a_{n-2} + a_{n-3}', why: 'A good string ends in 1, 10 or 100, after a good string of length $n - 1$, $n - 2$ or $n - 3$.' },
    { d: 'moves needed to move a tower of $n$ disks in the Tower of Hanoi', init: [1], step: function (a, n) { return 2 * a[n - 1] + 1; }, rec: 'a_{n} = 2a_{n-1} + 1', why: 'Move the top $n - 1$ disks aside, move the largest disk, then move the $n - 1$ disks back on top.' }];
  function recVals(r, n) { var a = [null].concat(r.init); for (var i = r.init.length + 1; i <= n; i++) a[i] = r.step(a, i); return a; }
  G('disc.recurrence-models', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['value', 'value', 'start']), R.pick(['value', 'which', 'start']), R.pick(['which', 'value']));
    var r = R.pick(RECS), k = r.init.length;
    if (shape === 'value') {
      var n = R.int(k + 3, M.min(10, k + 6)), a = recVals(r, n);
      return { q: 'Let $a_{n}$ be the number of ' + r.d + '. Find $a_{' + n + '}$.', a: num(a[n]),
        steps: ['Split by how the pattern ends. ' + r.why, 'So $' + r.rec + '$, starting from ' + r.init.map(function (v, i) { return '$a_{' + (i + 1) + '} = ' + v + '$'; }).join(', ') + '.', 'Build up: ' + range(1, n).map(function (i) { return '$a_{' + i + '} = ' + a[i] + '$'; }).join(', ') + '.'], hint: 'Ask how the last piece can look, write a recurrence, and build up from small $n$.' };
    }
    if (shape === 'start') {
      return { q: 'Let $a_{n}$ be the number of ' + r.d + '. A recurrence needs starting values: find ' + r.init.map(function (v, i) { return '$a_{' + (i + 1) + '}$'; }).join(' and ').replace(/ and (?=.* and )/g, ', ') + '.', a: multi(r.init.map(function (v, i) { return part('$a_{' + (i + 1) + '} =$', num(v)); })),
        steps: ['List the small cases by hand.'].concat(r.init.map(function (v, i) { return '$a_{' + (i + 1) + '} = ' + v + '$.'; })).concat(['From there the recurrence $' + r.rec + '$ takes over.']), hint: 'Write out every case for the smallest values of $n$.' };
    }
    var all = U.uniq(RECS.map(function (x) { return x.rec; })), wr = all.filter(function (x) { return x !== r.rec; });
    return { q: 'Let $a_{n}$ be the number of ' + r.d + '. Which recurrence does $a_{n}$ satisfy (for $n$ large enough)?', a: mc('$' + r.rec + '$', R.sample(wr, 3).map(function (x) { return '$' + x + '$'; })),
      steps: [r.why, 'Adding the cases (sum rule): $' + r.rec + '$.'], hint: 'Split by the last piece and add the cases.' };
  });

  G('disc.unrolling-recurrences', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['value', 'closed', 'value']), R.pick(['closed', 'check', 'closed']), R.pick(['closed', 'check']));
    var A0 = R.int(0, 6), kind = R.pick(L === 1 ? ['arith', 'geom', 'affine'] : ['arith', 'geom', 'affine', 'affine', 'tri', 'sq', 'pow2', 'hanoi']);
    var rec, form, tex, unroll, start = 0, f;
    if (kind === 'arith') { var d = R.nz(-5, 7); rec = 'a_{n} = a_{n-1} ' + (d < 0 ? '- ' + (-d) : '+ ' + d); form = plainTerms([[d, 'n'], [A0, '']]); tex = T.lin(d, 'n', A0); f = function (n) { return A0 + d * n; }; unroll = '$a_{n} = a_{n-2} + 2(' + d + ') = a_{n-3} + 3(' + d + ') = \\cdots = a_{0} + n(' + d + ')$.'; }
    if (kind === 'geom') { var r = R.int(2, 5); A0 = R.int(1, 5); rec = 'a_{n} = ' + r + 'a_{n-1}'; form = plainTerms([[A0, r + '^n']]); tex = (A0 === 1 ? '' : A0 + ' \\cdot ') + r + '^{n}'; f = function (n) { return A0 * M.pow(r, n); }; unroll = '$a_{n} = ' + r + '^{2}a_{n-2} = ' + r + '^{3}a_{n-3} = \\cdots = ' + r + '^{n}a_{0}$.'; }
    if (kind === 'affine') { var c = R.pick([2, 3]), dd = (c === 2 ? R.nz(-4, 5) : 2 * R.nz(-3, 3)), h = dd / (c - 1); rec = 'a_{n} = ' + c + 'a_{n-1} ' + (dd < 0 ? '- ' + (-dd) : '+ ' + dd); var K = A0 + h; form = plainTerms([[K, c + '^n'], [-h, '']]); tex = T.terms([[K, c + '^{n}'], [-h, '']]); f = function (n) { return K * M.pow(c, n) - h; };
      var sd = dd < 0 ? ' - ' + (-dd) : ' + ' + dd; unroll = '$a_{n} = ' + c + '^{2}a_{n-2}' + sd + '(' + c + ' + 1) = \\cdots = ' + c + '^{n}a_{0}' + sd + '(' + c + '^{n-1} + \\cdots + ' + c + ' + 1) = ' + c + '^{n}a_{0}' + sd + ' \\cdot \\frac{' + c + '^{n} - 1}{' + (c - 1) + '}$ (a geometric series).'; }
    if (kind === 'tri') { rec = 'a_{n} = a_{n-1} + n'; form = plainTerms([[1, 'n*(n+1)/2'], [A0, '']]); tex = (A0 ? A0 + ' + ' : '') + '\\frac{n(n + 1)}{2}'; f = function (n) { return A0 + n * (n + 1) / 2; }; unroll = '$a_{n} = a_{0} + 1 + 2 + \\cdots + n = a_{0} + \\frac{n(n + 1)}{2}$.'; }
    if (kind === 'sq') { rec = 'a_{n} = a_{n-1} + 2n - 1'; form = plainTerms([[1, 'n^2'], [A0, '']]); tex = (A0 ? A0 + ' + ' : '') + 'n^{2}'; f = function (n) { return A0 + n * n; }; unroll = '$a_{n} = a_{0} + 1 + 3 + 5 + \\cdots + (2n - 1) = a_{0} + n^{2}$.'; }
    if (kind === 'pow2') { rec = 'a_{n} = a_{n-1} + 2^{n}'; form = plainTerms([[1, '2^(n+1)'], [A0 - 2, '']]); tex = T.terms([[1, '2^{n+1}'], [A0 - 2, '']]); f = function (n) { return A0 + M.pow(2, n + 1) - 2; }; unroll = '$a_{n} = a_{0} + 2 + 4 + \\cdots + 2^{n} = a_{0} + 2^{n+1} - 2$.'; }
    if (kind === 'hanoi') { start = 1; A0 = 1; rec = 'a_{n} = 2a_{n-1} + 1'; form = '2^n - 1'; tex = '2^{n} - 1'; f = function (n) { return M.pow(2, n) - 1; }; unroll = '$a_{n} = 2a_{n-1} + 1 = 4a_{n-2} + 2 + 1 = \\cdots = 2^{n-1}a_{1} + 2^{n-2} + \\cdots + 1 = 2^{n} - 1$.'; }
    var given = 'a_{' + start + '} = ' + A0;
    // sanity: f satisfies the recurrence at small n
    var seq = [f(start)]; for (var i = start + 1; i <= start + 6; i++) { var prev = f(i - 1), want = kind === 'arith' ? prev + d : kind === 'geom' ? r * prev : kind === 'affine' ? c * prev + dd : kind === 'tri' ? prev + i : kind === 'sq' ? prev + 2 * i - 1 : kind === 'pow2' ? prev + M.pow(2, i) : 2 * prev + 1; if (f(i) !== want) throw new Error('closed form mismatch ' + kind); }
    if (f(start) !== A0) throw new Error('start mismatch');
    if (shape === 'value') { var n = R.int(6, 10); return { q: 'Let $' + rec + '$ with $' + given + '$. Find $a_{' + n + '}$.', a: num(f(n)),
      steps: ['Unroll: ' + unroll, 'Closed form: $a_{n} = ' + tex + '$.', 'So $a_{' + n + '} = ' + f(n) + '$. (You can check by computing term by term: ' + range(start, M.min(n, start + 4)).map(function (k) { return f(k); }).join(', ') + ', …)'], hint: 'Substitute the rule into itself a few times and look for the pattern.' }; }
    if (shape === 'closed') return { q: 'Solve the recurrence $' + rec + '$ with $' + given + '$: find a closed form for $a_{n}$.', a: expr(form, ['n']),
      steps: ['Unroll: ' + unroll, 'So $a_{n} = ' + tex + '$.', 'Check: it gives $' + range(start, start + 3).map(function (k) { return 'a_{' + k + '} = ' + f(k); }).join(', ') + '$, matching the recurrence.'], hint: 'Write $a_{n}$ in terms of $a_{n-2}$, then $a_{n-3}$, until you see the pattern.' };
    // check a guessed formula: either the right one, or a guess that fits the first two terms only
    var right = R.coin(), a0 = f(start), a1 = f(start + 1), guess, gf;
    if (right) { guess = tex; gf = f; }
    else { var slope = a1 - a0; guess = T.lin(slope, 'n', a0 - slope * start); gf = function (n) { return a0 + slope * (n - start); }; if (gf(start + 2) === f(start + 2)) { guess = tex; gf = f; right = true; } }
    return { q: 'For $' + rec + '$ with $' + given + '$, a student guesses $a_{n} = ' + guess + '$ from the first two terms. Is the guess correct for every $n$?', a: tf(right),
      steps: ['The first terms are $' + range(start, start + 3).map(function (k) { return f(k); }).join(', ') + '$.', right ? 'The guess gives the same values, and substituting it into the recurrence works: it is the closed form.' : 'The guess gives $a_{' + (start + 2) + '} = ' + gf(start + 2) + '$, but the recurrence gives $' + f(start + 2) + '$. Matching two terms is not enough.'], hint: 'Compute the third term both ways.' };
  });

  function rMinus(r) { return r < 0 ? 'r + ' + (-r) : 'r - ' + r; }
  function recTex(c1, c2) { return 'a_{n} = ' + T.terms([[c1, 'a_{n-1}'], [c2, 'a_{n-2}']]); }
  function charTex(c1, c2) { return 'r^{2} = ' + T.terms([[c1, 'r'], [c2, '']]); }
  function powTerm(coef, r) { var b = r < 0 ? '(' + r + ')' : String(r); return [coef, b + '^{n}']; }
  function powPlain(coef, r) { return [coef, (r < 0 ? '(' + r + ')' : String(r)) + '^n']; }
  G('disc.linear-recurrences', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['roots', 'char']), R.pick(['AB', 'closed', 'roots']), R.pick(['closed', 'value', 'AB']));
    var r1, r2; do { r1 = R.int(-3, 5); r2 = R.int(-3, 5); } while (!r1 || !r2 || r1 === r2 || r1 === -r2 || (shape === 'closed' && (r1 < 0 || r2 < 0)) || (shape === 'closed' && (r1 === 1 || r2 === 1) && R.chance(0.5)));
    if (r1 < r2) { var tt = r1; r1 = r2; r2 = tt; }
    var c1 = r1 + r2, c2 = -r1 * r2, A = R.nz(-3, 3), B = R.nz(-3, 3), a0 = A + B, a1 = A * r1 + B * r2;
    var rt = recTex(c1, c2), given = 'a_{0} = ' + a0 + '$ and $a_{1} = ' + a1, closed = T.terms([powTerm(A, r1), powTerm(B, r2)]);
    var charLine = 'Try $a_{n} = r^{n}$: $r^{n} = ' + T.terms([[c1, 'r^{n-1}'], [c2, 'r^{n-2}']]) + '$. Divide by $r^{n-2}$: $' + charTex(c1, c2) + '$, that is $' + T.terms([[1, 'r^{2}'], [-c1, 'r'], [-c2, '']]) + ' = 0$.';
    var factLine = 'Factor: $(' + rMinus(r1) + ')(' + rMinus(r2) + ') = 0$, so $r = ' + r1 + '$ or $r = ' + r2 + '$.';
    var fitLine = 'Fit $a_{n} = A \\cdot ' + T.p(r1) + '^{n} + B \\cdot ' + T.p(r2) + '^{n}$: $n = 0$ gives $A + B = ' + a0 + '$; $n = 1$ gives $' + T.terms([[r1, 'A'], [r2, 'B']]) + ' = ' + a1 + '$. Solving, $A = ' + A + '$, $B = ' + B + '$.';
    if (shape === 'roots') return { q: 'Find the roots of the characteristic equation of $' + rt + '$.', a: setA([r1, r2]), steps: [charLine, factLine], hint: 'Substitute $a_{n} = r^{n}$ and divide by $r^{n-2}$.' };
    if (shape === 'char') {
      var right = T.terms([[1, 'r^{2}'], [-c1, 'r'], [-c2, '']]) + ' = 0', w1 = T.terms([[1, 'r^{2}'], [c1, 'r'], [c2, '']]) + ' = 0';
      var w2 = T.terms([[1, 'r^{2}'], [-c2, 'r'], [-c1, '']]) + ' = 0', w3 = T.terms([[1, 'r^{2}'], [-c1, 'r'], [c2, '']]) + ' = 0';
      var cl = function (x) { return '$' + x + '$'; };
      return { q: 'Which is the characteristic equation of $' + rt + '$?', a: mc(cl(right), [cl(w1), cl(w2), cl(w3)].filter(function (x) { return x !== cl(right); })),
        steps: [charLine, 'Move everything to one side, keeping the signs: $' + right + '$.'], hint: 'Replace $a_{n}$ by $r^{2}$, $a_{n-1}$ by $r$ and $a_{n-2}$ by $1$, then move everything to the left.' };
    }
    if (shape === 'AB') return { q: 'The recurrence $' + rt + '$ has characteristic roots $' + r1 + '$ and $' + r2 + '$. With $' + given + '$, write $a_{n} = A \\cdot ' + T.p(r1) + '^{n} + B \\cdot ' + T.p(r2) + '^{n}$. Find $A$ and $B$.', a: multi([part('$A =$', num(A)), part('$B =$', num(B))]),
      steps: ['$n = 0$: $A + B = ' + a0 + '$.', '$n = 1$: $' + T.terms([[r1, 'A'], [r2, 'B']]) + ' = ' + a1 + '$.', 'Solve the system: $A = ' + A + '$, $B = ' + B + '$. Check $a_{2}$: $' + (A * r1 * r1 + B * r2 * r2) + '$ from the formula, and $' + (c1 * a1 + c2 * a0) + '$ from the recurrence.'], hint: 'Use both starting values: two equations for two unknowns.' };
    if (shape === 'closed') return { q: 'Solve $' + rt + '$ with $' + given + '$.', a: expr(plainTerms([powPlain(A, r1), powPlain(B, r2)]), ['n']),
      steps: [charLine, factLine, fitLine, 'So $a_{n} = ' + closed + '$.'], hint: 'Find the characteristic roots, then fit $A$ and $B$ to both starting values.' };
    var k = R.int(5, 8), vals = [a0, a1]; for (var i = 2; i <= k; i++) vals[i] = c1 * vals[i - 1] + c2 * vals[i - 2];
    if (vals[k] !== A * M.pow(r1, k) + B * M.pow(r2, k)) throw new Error('linear recurrence mismatch');
    return { q: 'For $' + rt + '$ with $' + given + '$, find $a_{' + k + '}$ using a closed form.', a: num(vals[k]),
      steps: [factLine, fitLine, 'So $a_{n} = ' + closed + '$ and $a_{' + k + '} = ' + T.terms([[A, T.p(r1) + '^{' + k + '}'], [B, T.p(r2) + '^{' + k + '}']]) + ' = ' + commas(vals[k]) + '$.', 'Check by stepping the recurrence: $' + vals.slice(0, k + 1).join(', ') + '$.'], hint: 'Find the closed form first, then substitute $n = ' + k + '$.' };
  });

  G('disc.repeated-root-recurrences', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['root', 'root', 'why']), R.pick(['AB', 'why', 'AB']), R.pick(['closed', 'value', 'AB']));
    var r0 = R.pick(shape === 'closed' ? [2, 3, 4] : [2, 3, -2, -3, 4]), c1 = 2 * r0, c2 = -r0 * r0, A = R.nz(-3, 4), B = R.nz(-3, 3), a0 = A, a1 = (A + B) * r0;
    var rt = recTex(c1, c2), given = 'a_{0} = ' + a0 + '$ and $a_{1} = ' + a1;
    var charL = 'Characteristic equation: $' + charTex(c1, c2) + '$, that is $r^{2} ' + (c1 > 0 ? '- ' + c1 : '+ ' + (-c1)) + 'r + ' + (-c2) + ' = (r ' + (r0 > 0 ? '- ' + r0 : '+ ' + (-r0)) + ')^{2} = 0$: a double root $r = ' + r0 + '$.';
    if (shape === 'root') return { q: 'The characteristic equation of $' + rt + '$ has a double root. What is it?', a: num(r0), steps: [charL], hint: 'Write $' + T.terms([[1, 'r^{2}'], [-c1, 'r'], [-c2, '']]) + ' = 0$ and look for a perfect square.' };
    if (shape === 'why') return { q: 'For $' + rt + '$, a student writes $a_{n} = A \\cdot ' + T.p(r0) + '^{n} + B \\cdot ' + T.p(r0) + '^{n}$. Why can’t this fit $' + given + '$ in general?', a: mc('It equals $(A + B)' + T.p(r0) + '^{n}$, one constant, so it forces $a_{1} = ' + r0 + 'a_{0}$.', ['The roots should be added, not multiplied.', 'It only fails because $' + r0 + '$ is not prime.', 'It can fit; the student just needs more starting values.']),
      steps: ['$A \\cdot ' + T.p(r0) + '^{n} + B \\cdot ' + T.p(r0) + '^{n} = (A + B)' + T.p(r0) + '^{n}$ has only one free constant.', 'Here $a_{1} = ' + a1 + '$ but $' + r0 + 'a_{0} = ' + r0 * a0 + '$' + (a1 === r0 * a0 ? ' (they happen to agree here, but they do not in general)' : '') + '.', 'The fix: use $a_{n} = (A + Bn)' + T.p(r0) + '^{n}$; the second solution is $n' + T.p(r0) + '^{n}$.'], hint: 'Combine the two terms. How many constants are left?' };
    if (shape === 'AB') return { q: 'Solve $' + rt + '$ with $' + given + '$ in the form $a_{n} = (A + Bn)' + T.p(r0) + '^{n}$. Find $A$ and $B$.', a: multi([part('$A =$', num(A)), part('$B =$', num(B))]),
      steps: [charL, '$n = 0$: $a_{0} = A = ' + A + '$.', '$n = 1$: $(A + B) \\cdot ' + T.p(r0) + ' = ' + a1 + '$, so $A + B = ' + (A + B) + '$ and $B = ' + B + '$.'], hint: 'At $n = 0$ only $A$ survives.' };
    var form = '(' + plainTerms([[A, ''], [B, 'n']]) + ')*' + (r0 < 0 ? '(' + r0 + ')' : r0) + '^n', ft = '(' + T.terms([[A, ''], [B, 'n']]) + ')' + T.p(r0) + '^{n}';
    if (shape === 'closed') return { q: 'Solve $' + rt + '$ with $' + given + '$.', a: expr(form, ['n']),
      steps: [charL, 'So $a_{n} = (A + Bn)' + r0 + '^{n}$. $n = 0$: $A = ' + A + '$. $n = 1$: $(A + B)' + r0 + ' = ' + a1 + '$, so $B = ' + B + '$.', '$a_{n} = ' + ft + '$.'], hint: 'Double root: use $(A + Bn)r^{n}$.' };
    var k = R.int(4, 7), v = [a0, a1]; for (var i = 2; i <= k; i++) v[i] = c1 * v[i - 1] + c2 * v[i - 2];
    if (v[k] !== (A + B * k) * M.pow(r0, k)) throw new Error('repeated root mismatch');
    return { q: 'For $' + rt + '$ with $' + given + '$, find $a_{' + k + '}$ using the closed form.', a: num(v[k]),
      steps: [charL, 'Fit $(A + Bn)' + T.p(r0) + '^{n}$: $A = ' + A + '$, $B = ' + B + '$.', '$a_{' + k + '} = (' + A + ' + ' + T.p(B) + ' \\cdot ' + k + ')' + T.p(r0) + '^{' + k + '} = ' + (A + B * k) + ' \\cdot ' + T.p(M.pow(r0, k)) + ' = ' + commas(v[k]) + '$.', 'Check by stepping: $' + v.join(', ') + '$.'], hint: 'Fit $A$ and $B$, then substitute $n = ' + k + '$.' };
  });

  var GROW = [['\\log_{2} n', 0], ['\\sqrt{n}', 1], ['n', 2], ['n \\log_{2} n', 3], ['n^{2}', 4], ['n^{3}', 5], ['2^{n}', 6], ['n!', 7]];
  G('disc.big-o', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['rank', 'cross1', 'class']), R.pick(['rank', 'cross', 'tf', 'witness']), R.pick(['witness', 'tf', 'cross', 'class']));
    if (shape === 'rank') {
      var pick = R.sample(GROW, 4), coefs = ['1000', '50', '\\tfrac{1}{100}', '10', '3'], fast = R.coin(), best = pick.reduce(function (b, x) { return (fast ? x[1] > b[1] : x[1] < b[1]) ? x : b; });
      var show = pick.map(function (x) { var c = x === best ? (fast ? '\\tfrac{1}{100}' : '1000') : R.pick(coefs); return [x, '$' + (c === '1' ? '' : c + ' \\cdot ') + x[0] + '$']; });
      var right = show.filter(function (s) { return s[0] === best; })[0][1];
      return { q: 'Which function grows ' + (fast ? 'fastest' : 'slowest') + ' as $n \\to \\infty$?', a: mc(right, show.filter(function (s) { return s[0] !== best; }).map(function (s) { return s[1]; })),
        steps: ['Constant factors do not change the growth class. The order is $\\log n \\ll \\sqrt{n} \\ll n \\ll n \\log n \\ll n^{2} \\ll n^{3} \\ll 2^{n} \\ll n!$.', 'Among these, the ' + (fast ? 'fastest' : 'slowest') + ' is ' + right + ', even with its constant: for large enough $n$ the class wins.'], hint: 'Ignore the constants and compare the classes.' };
    }
    if (shape === 'cross1') { var c = R.int(5, 200); return { q: 'For which smallest positive integer $n$ is $n^{2} > ' + c + 'n$?', a: num(c + 1),
      steps: ['For $n > 0$, divide by $n$: $n > ' + c + '$.', 'So the first such $n$ is $' + (c + 1) + '$. Before that, $' + c + 'n$ is bigger, even though $n^{2}$ grows faster in the long run.'], hint: 'Divide both sides by $n$.' }; }
    if (shape === 'cross') { var c2 = R.int(2, 20), r = c2 + R.int(1, 15), d = r * (r - c2);
      return { q: 'For which smallest positive integer $n$ is $n^{2} > ' + c2 + 'n + ' + d + '$?', a: num(r + 1),
        steps: ['Solve $n^{2} - ' + c2 + 'n - ' + d + ' = 0$: it factors as $(n - ' + r + ')(n + ' + (r - c2) + ') = 0$.', 'For positive $n$, $n^{2} > ' + c2 + 'n + ' + d + '$ exactly when $n > ' + r + '$.', 'So the smallest is $n = ' + (r + 1) + '$. Check: $' + (r + 1) * (r + 1) + ' > ' + (c2 * (r + 1) + d) + '$, but $' + r * r + ' = ' + (c2 * r + d) + '$.'], hint: 'Find where the two sides are equal.' }; }
    if (shape === 'witness') { var a = R.int(1, 6), b = R.int(1, 9), cc = R.int(0, 9), k = L === 3 ? R.int(1, 3) : 1, Cq = ML.Q(a * k * k + b * k + cc, k * k), Cint = M.floor((a * k * k + b * k + cc + k * k - 1) / (k * k));
      return { q: 'Find the smallest integer $C$ such that $' + T.poly([a, b, cc], 'n') + ' \\le C n^{2}$ for every integer $n \\ge ' + k + '$. (This $C$ shows the function is $O(n^{2})$.)', a: num(Cint),
        steps: ['Divide by $n^{2}$: we need $' + a + ' + \\frac{' + b + '}{n}' + (cc ? ' + \\frac{' + cc + '}{n^{2}}' : '') + ' \\le C$.', 'The left side shrinks as $n$ grows, so its largest value is at $n = ' + k + '$: $' + Cq.toTex() + '$.', 'The smallest integer at least that big is $C = ' + Cint + '$.'], hint: 'Divide by $n^{2}$ and look at the smallest allowed $n$.' }; }
    if (shape === 'tf') {
      var facts = [['2^{n+1} \\text{ is } O(2^{n})', true, '$2^{n+1} = 2 \\cdot 2^{n}$: take $C = 2$.'], ['4^{n} \\text{ is } O(2^{n})', false, '$4^{n}/2^{n} = 2^{n}$ is unbounded, so no constant works.'], ['\\log_{2} n \\text{ is } O(\\log_{10} n)', true, '$\\log_{2} n = \\log_{2} 10 \\cdot \\log_{10} n$: a constant multiple.'],
        ['n \\log n \\text{ is } O(n)', false, '$(n \\log n)/n = \\log n$ is unbounded.'], ['n^{2} + 1000n \\text{ is } O(n^{2})', true, 'For $n \\ge 1$, $n^{2} + 1000n \\le 1001n^{2}$.'], ['n^{3} \\text{ is } O(n^{2})', false, '$n^{3}/n^{2} = n$ is unbounded.'],
        ['n! \\text{ is } O(2^{n})', false, '$n!/2^{n}$ grows without bound (each new factor is at least $n/2$).'], ['2^{n} \\text{ is } O(n!)', true, 'For $n \\ge 4$, $2^{n} \\le n!$.'], ['\\sqrt{n} \\text{ is } O(\\log n)', false, '$\\sqrt{n}/\\log n$ is unbounded: powers beat logs.'], ['100 \\text{ is } O(1)', true, 'Take $C = 100$.'], ['(n + 1)^{2} \\text{ is } O(n^{2})', true, 'For $n \\ge 1$, $(n + 1)^{2} \\le 4n^{2}$.']];
      var f = R.pick(facts);
      return { q: 'True or false: $' + f[0] + '$.', a: tf(f[1]), steps: ['$f$ is $O(g)$ when $|f(n)| \\le C|g(n)|$ for some constant $C$ and all large $n$.', f[2]], hint: 'Look at the ratio $f(n)/g(n)$: does it stay bounded?' };
    }
    var fams = [['3n^{2} + 10n \\log_{2} n + 5', 'n^{2}', ['n \\log n', 'n^{3}', 'n']], ['5n \\log_{2} n + 100n + 7', 'n \\log n', ['n', 'n^{2}', '\\log n']], ['2^{n} + n^{5}', '2^{n}', ['n^{5}', 'n!', 'n^{6}']], ['1000n + \\sqrt{n}', 'n', ['\\sqrt{n}', 'n^{2}', 'n \\log n']], ['n^{3} + 2^{10}n^{2}', 'n^{3}', ['n^{2}', '2^{n}', 'n^{4}']]];
    var fm = R.pick(fams);
    return { q: 'Let $f(n) = ' + fm[0] + '$. Which is the slowest-growing $g$ in the list with $f(n) = O(g(n))$?', a: mc('$' + fm[1] + '$', fm[2].map(function (x) { return '$' + x + '$'; })),
      steps: ['The fastest-growing term decides: the others are eventually smaller than a constant times it.', 'So $f(n) = O(' + fm[1] + ')$. A faster $g$ also works, but it is not the tightest; a slower one fails.'], hint: 'Find the term that wins for large $n$.' };
  });

// ---- 07-graphs.js
  // ================================================================ Unit 7: Graph Theory
  function havelHakimi(seq) { var s = seq.slice().sort(function (a, b) { return b - a; }); while (s.length) { var d = s.shift(); if (d < 0 || d > s.length) return false; for (var i = 0; i < d; i++) { s[i]--; if (s[i] < 0) return false; } s.sort(function (a, b) { return b - a; }); } return true; }
  function degSeq(g) { var d = gDeg(g); return g.v.map(function (x) { return d[x]; }).sort(function (a, b) { return b - a; }); }
  function randTree(R, n) { var V = 'ABCDEFGHIJ'.slice(0, n).split(''), e = []; for (var i = 1; i < n; i++) e.push([V[R.int(0, i - 1)], V[i]]); return { v: V, e: e }; }
  var PRESET = {
    petersen: { v: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], e: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A'], ['A', 'F'], ['B', 'G'], ['C', 'H'], ['D', 'I'], ['E', 'J'], ['F', 'H'], ['H', 'J'], ['J', 'G'], ['G', 'I'], ['I', 'F']] },
    cube: { v: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], e: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'], ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']] }
  };
  function cycleG(n) { var V = 'ABCDEFGHIJ'.slice(0, n).split(''); return { v: V, e: V.map(function (x, i) { return [x, V[(i + 1) % n]]; }) }; }
  function wheelG(n) { var c = cycleG(n), H = 'ABCDEFGHIJK'.charAt(n); return { v: c.v.concat([H]), e: c.e.concat(c.v.map(function (x) { return [H, x]; })) }; }
  function completeG(n) { var V = 'ABCDEFGHIJ'.slice(0, n).split(''), e = []; for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) e.push([V[i], V[j]]); return { v: V, e: e }; }
  function bipG(m, n) { var V = 'ABCDEFGHIJ'.slice(0, m + n).split(''), e = []; for (var i = 0; i < m; i++) for (var j = m; j < m + n; j++) e.push([V[i], V[j]]); return { v: V, e: e, parts: [V.slice(0, m), V.slice(m)] }; }

  G('disc.graph-basics', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['handshake', 'degree', 'edges', 'regular']), R.pick(['possible', 'odd', 'handshake']), R.pick(['possible', 'missing', 'odd']));
    if (shape === 'regular') { var n = R.int(4, 12), d = R.int(2, M.min(5, n - 1)); if ((n * d) % 2) n++; return { q: 'A graph has ' + n + ' vertices, and every vertex has degree ' + d + '. How many edges does it have?', a: num(n * d / 2),
      steps: ['Sum of degrees: $' + n + ' \\cdot ' + d + ' = ' + n * d + '$.', 'Each edge adds $2$ to the sum (one for each end), so $e = ' + n * d + '/2 = ' + n * d / 2 + '$.'], hint: 'The degrees add up to twice the number of edges.' }; }
    var nv = R.int(5, 7), g = gRandom(R, nv, R.int(nv - 1, nv + 3), false), ds = degSeq(g), dg = gDeg(g);
    if (shape === 'handshake') return { q: 'A graph has degree sequence $' + ds.join(', ') + '$. How many edges does it have?', a: num(g.e.length),
      steps: ['Add the degrees: $' + ds.join(' + ') + ' = ' + sum(ds) + '$.', 'Every edge is counted twice, once at each end, so $e = ' + sum(ds) + '/2 = ' + g.e.length + '$.'], hint: 'Handshake lemma: sum of degrees $= 2e$.' };
    if (shape === 'degree') { var x = R.pick(g.v); return { q: 'In the graph shown (edges $' + gEdgeWords(g) + '$), what is the degree of vertex ' + x + '?', a: num(dg[x]), viz: gViz(g),
      steps: ['Count the edges that touch ' + x + ': ' + (g.e.filter(function (e) { return e[0] === x || e[1] === x; }).map(function (e) { return e[0] + e[1]; }).join(', ') || 'none') + '.', 'Degree of ' + x + ': $' + dg[x] + '$.'], hint: 'Count the edges with ' + x + ' at one end.' }; }
    if (shape === 'edges') return { q: 'How many edges does the graph shown have, if its degree sequence is $' + ds.join(', ') + '$?', a: num(g.e.length), viz: gViz(g),
      steps: ['The degrees add to $' + sum(ds) + '$.', 'So there are $' + sum(ds) + '/2 = ' + g.e.length + '$ edges (you can count them in the picture too).'], hint: 'Halve the sum of the degrees.' };
    if (shape === 'odd') { var odd = g.v.filter(function (v) { return dg[v] % 2; }); return { q: 'In the graph shown (edges $' + gEdgeWords(g) + '$), how many vertices have odd degree?', a: num(odd.length), viz: gViz(g),
      steps: ['Degrees: ' + g.v.map(function (v) { return v + ': ' + dg[v]; }).join(', ') + '.', 'Odd: ' + (odd.join(', ') || 'none') + '. That is $' + odd.length + '$, an even number, as the handshake lemma promises.'], hint: 'Find each degree first.' }; }
    if (shape === 'possible') {
      var bad = R.coin(), seq = ds.slice();
      if (bad) { var i = R.int(0, seq.length - 1); seq[i] += seq[i] > 1 && R.coin() ? -1 : 1; seq.sort(function (a, b) { return b - a; }); }
      var ok = sum(seq) % 2 === 0 && havelHakimi(seq);
      if (!bad && !ok) throw new Error('degree sequence');
      if (bad && sum(seq) % 2 === 0) throw new Error('parity');
      return { q: 'Can a simple graph have degree sequence $' + seq.join(', ') + '$?', a: tf(ok),
        steps: ['The degrees add to $' + sum(seq) + '$.', ok ? 'The sum is even, and a graph with these degrees exists (for example, the one with edges ' + gEdgeWords(g) + ').' : 'The sum is odd, but it must equal $2e$, which is even. So no graph has these degrees.'], hint: 'Add the degrees.' };
    }
    var m = g.e.length, j = R.int(0, ds.length - 1), shown = ds.slice(0, j).concat(ds.slice(j + 1));
    return { q: 'A graph with ' + m + ' edges has ' + ds.length + ' vertices. The degrees of ' + (ds.length - 1) + ' of them are $' + shown.join(', ') + '$. What is the degree of the last vertex?', a: num(ds[j]),
      steps: ['The degrees must add to $2 \\cdot ' + m + ' = ' + 2 * m + '$.', 'The known ones add to $' + sum(shown) + '$, so the last is $' + 2 * m + ' - ' + sum(shown) + ' = ' + ds[j] + '$.'], hint: 'Use sum of degrees $= 2e$.' };
  });

  G('disc.special-graphs', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['edges', 'edges', 'degree']), R.pick(['edges', 'reverse', 'bip']), R.pick(['reverse', 'compare', 'bip']));
    if (shape === 'edges') { var t = R.pick(['K', 'K', 'Kmn', 'C', 'P']), n = R.int(4, 15), m = R.int(2, 7), n2 = R.int(2, 7);
      if (t === 'K') return { q: 'How many edges does the complete graph $K_{' + n + '}$ have?', a: num(n * (n - 1) / 2), viz: n <= 7 ? gViz(completeG(n), { layout: 'circle' }) : undefined,
        steps: ['Each of the $' + n + '$ vertices has degree $' + (n - 1) + '$, so the degrees add to $' + n * (n - 1) + '$.', 'Each edge was counted from both ends: $\\frac{' + n + ' \\cdot ' + (n - 1) + '}{2} = ' + n * (n - 1) / 2 + '$. (Also $' + binom(n, 2) + '$: choose the two ends.)'], hint: 'Choose the two endpoints of an edge.' };
      if (t === 'Kmn') return { q: 'How many edges does the complete bipartite graph $K_{' + m + ',' + n2 + '}$ have?', a: num(m * n2), steps: ['Every one of the $' + m + '$ vertices on one side joins every one of the $' + n2 + '$ on the other, and no other edges exist.', '$' + m + ' \\cdot ' + n2 + ' = ' + m * n2 + '$.'], hint: 'Each edge joins one vertex from each side.' };
      if (t === 'C') return { q: 'How many edges does the cycle $C_{' + n + '}$ have?', a: num(n), steps: ['$C_{' + n + '}$ is $' + n + '$ vertices in a ring; each joins the next, and the last joins the first.', 'That is $' + n + '$ edges (every degree is $2$: $2 \\cdot ' + n + '/2 = ' + n + '$).'], hint: 'Count around the ring.' };
      return { q: 'How many edges does the path $P_{' + n + '}$ (with ' + n + ' vertices) have?', a: num(n - 1), steps: ['A path with $' + n + '$ vertices in a row has one edge between each neighboring pair.', 'That is $' + (n - 1) + '$ edges.'], hint: 'Count the gaps between consecutive vertices.' }; }
    if (shape === 'degree') { var n3 = R.int(4, 12), a = R.int(2, 6), b = R.int(2, 6), useK = R.coin();
      return useK ? { q: 'What is the degree of each vertex of $K_{' + n3 + '}$?', a: num(n3 - 1), steps: ['In a complete graph every vertex is joined to every other vertex: $' + n3 + ' - 1 = ' + (n3 - 1) + '$.'], hint: 'Every other vertex is a neighbor.' }
        : { q: 'In $K_{' + a + ',' + b + '}$, what is the degree of a vertex on the side with ' + a + ' vertices?', a: num(b), steps: ['It is joined to every vertex on the other side, and to nothing on its own side.', 'Degree $' + b + '$.'], hint: 'Its neighbors are exactly the other side.' }; }
    if (shape === 'reverse') { var n4 = R.int(5, 20), E = n4 * (n4 - 1) / 2; return { q: 'A complete graph $K_{n}$ has ' + E + ' edges. What is $n$?', a: num(n4),
      steps: ['$\\frac{n(n - 1)}{2} = ' + E + '$, so $n(n - 1) = ' + 2 * E + '$.', 'Two consecutive integers with product $' + 2 * E + '$: $' + n4 + ' \\cdot ' + (n4 - 1) + '$. So $n = ' + n4 + '$.'], hint: 'Solve $n(n - 1) = ' + 2 * E + '$.' }; }
    if (shape === 'compare') { var n5 = R.int(5, 12); if (R.coin()) return { q: 'How many edges must be removed from $K_{' + n5 + '}$ to leave the cycle $C_{' + n5 + '}$ (on the same vertices)?', a: num(n5 * (n5 - 1) / 2 - n5),
      steps: ['$K_{' + n5 + '}$ has $\\frac{' + n5 + ' \\cdot ' + (n5 - 1) + '}{2} = ' + n5 * (n5 - 1) / 2 + '$ edges; $C_{' + n5 + '}$ keeps $' + n5 + '$.', 'Remove $' + n5 * (n5 - 1) / 2 + ' - ' + n5 + ' = ' + (n5 * (n5 - 1) / 2 - n5) + '$.'], hint: 'Subtract the edge counts.' };
      var p = R.int(2, 5), q = R.int(2, 6); return { q: 'How many more edges does $K_{' + (p + q) + '}$ have than $K_{' + p + ',' + q + '}$?', a: num((p + q) * (p + q - 1) / 2 - p * q),
        steps: ['$K_{' + (p + q) + '}$: $' + binom(p + q, 2) + ' = ' + (p + q) * (p + q - 1) / 2 + '$. $K_{' + p + ',' + q + '}$: $' + p + ' \\cdot ' + q + ' = ' + p * q + '$.', 'Difference $' + ((p + q) * (p + q - 1) / 2 - p * q) + '$: the edges inside each side, $' + binom(p, 2) + ' + ' + binom(q, 2) + '$.'], hint: 'The extra edges join two vertices on the same side.' }; }
    var it = R.pick([['C_{' + 4 + '}', true, 'Color the vertices alternately around the even cycle.'], ['C_{5}', false, 'An odd cycle cannot be two-colored: going around, colors must alternate, and the last vertex clashes with the first.'], ['C_{6}', true, 'Alternate colors around the even cycle.'], ['C_{7}', false, 'It is an odd cycle.'],
      ['K_{3}', false, 'It is a triangle, an odd cycle.'], ['K_{2,5}', true, 'Its two sides are the two parts.'], ['P_{6}', true, 'Alternate colors along the path.'], ['K_{4}', false, 'It contains triangles.']]);
    return { q: 'Is $' + it[0] + '$ bipartite?', a: tf(it[1]), steps: ['A graph is bipartite when its vertices split into two sides with every edge going between the sides.', it[2]], hint: 'Look for a cycle of odd length.' };
  });

  function classifyWalk(g, w) {
    for (var i = 0; i + 1 < w.length; i++) if (!gHasEdge(g, w[i], w[i + 1])) return 'none';
    var es = []; for (i = 0; i + 1 < w.length; i++) es.push([w[i], w[i + 1]].sort().join(''));
    var repE = U.uniq(es).length < es.length, closed = w[0] === w[w.length - 1], inner = closed ? w.slice(0, -1) : w, repV = U.uniq(inner).length < inner.length;
    if (closed) return !repE && !repV && w.length >= 4 ? 'cycle' : 'closed';
    if (!repV) return 'path'; if (!repE) return 'trail'; return 'walk';
  }
  G('disc.connectivity', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['classify', 'components', 'classify']), R.pick(['classify', 'distance', 'components']), R.pick(['distance', 'maxdis', 'classify']));
    if (shape === 'classify') {
      var target = R.pick(['path', 'trail', 'walk', 'cycle']), g, w, t = 0;
      var okT = function () { var c0 = classifyWalk(g, w); return t < 300 ? c0 === target : ['path', 'trail', 'walk', 'cycle'].indexOf(c0) >= 0; };
      do { g = gRandom(R, R.int(5, 6), R.int(6, 8), true); var adj = gAdj(g), len = R.int(3, 6); w = [R.pick(g.v)]; for (var i = 0; i < len; i++) w.push(R.pick(adj[w[w.length - 1]])); if (target === 'cycle' && R.coin()) { var c = gHamCycle({ v: g.v.slice(0, 4), e: g.e.filter(function (e) { return g.v.slice(0, 4).indexOf(e[0]) >= 0 && g.v.slice(0, 4).indexOf(e[1]) >= 0; }) }); if (c) w = c.concat([c[0]]); } t++; } while (!okT() && t < 1000);
      var ty = classifyWalk(g, w), ch = ['A path', 'A trail but not a path', 'A walk but not a trail', 'A cycle'], idx = { path: 0, trail: 1, walk: 2, cycle: 3 }[ty];
      if (idx === undefined) throw new Error('walk type');
      var why = { path: 'No vertex repeats, so it is a path (and so also a trail and a walk).', trail: 'A vertex repeats, but no edge is used twice: a trail, not a path.', walk: 'An edge is used twice, so it is only a walk.', cycle: 'It returns to its start, uses no edge twice and repeats no other vertex: a cycle.' }[ty];
      return { q: 'In the graph shown (edges $' + gEdgeWords(g) + '$), what is the sequence $' + w.join(' \\to ') + '$?', a: mcKeep(ch, idx), viz: gViz(g),
        steps: ['Each step uses an edge of the graph, so it is a walk.', why], hint: 'Check for a repeated edge, then a repeated vertex, then whether it ends where it started.' };
    }
    if (shape === 'components') { var n = R.int(6, 8), g2 = gRandom(R, n, R.int(n - 4, n - 1), false), comps = gComps(g2);
      return { q: 'How many connected components does the graph shown have? (Vertices ' + g2.v.join(', ') + '; edges $' + gEdgeWords(g2) + '$.)', a: num(comps.length), viz: gViz(g2),
        steps: ['Start at a vertex and collect everything reachable from it; repeat with a vertex not yet reached.', 'Components: ' + comps.map(function (c) { return '$\\{' + c.sort().join(', ') + '\\}$'; }).join(', ') + '.', 'That is $' + comps.length + '$.'], hint: 'An isolated vertex is a component by itself.' }; }
    if (shape === 'distance') { var g3, s, tgt, d, tt = 0; do { g3 = gRandom(R, R.int(6, 7), R.int(6, 8), true); s = g3.v[0]; d = gDist(g3, s); tgt = g3.v.filter(function (v) { return d[v] >= 2; }); tt++; } while (!tgt.length && tt < 50);
      var x = R.pick(tgt);
      return { q: 'In the graph shown (edges $' + gEdgeWords(g3) + '$), what is the length of a shortest path from ' + s + ' to ' + x + '?', a: num(d[x]), viz: gViz(g3),
        steps: ['Work outward from ' + s + ' (breadth-first): ' + range(0, d[x]).map(function (k) { return 'distance ' + k + ': ' + g3.v.filter(function (v) { return d[v] === k; }).join(', '); }).join('; ') + '.', x + ' first appears at distance $' + d[x] + '$.'], hint: 'List the vertices 1 step away, then 2 steps away, and so on.' }; }
    var n4 = R.int(5, 12);
    if (R.coin() || L < 3) return { q: 'What is the fewest number of edges a connected graph with ' + n4 + ' vertices can have?', a: num(n4 - 1),
      steps: ['Start with ' + n4 + ' separate vertices: ' + n4 + ' components. Each new edge joins at most two components into one.', 'To get down to one component takes at least $' + (n4 - 1) + '$ edges, and a path uses exactly that many.'], hint: 'Each edge can reduce the number of components by at most one.' };
    return { q: 'What is the largest number of edges a simple graph with ' + n4 + ' vertices can have and still be disconnected?', a: num(C(n4 - 1, 2)),
      steps: ['Put ' + (n4 - 1) + ' vertices in a complete graph and leave one vertex alone: $' + binom(n4 - 1, 2) + ' = ' + C(n4 - 1, 2) + '$ edges.', 'Any more edges would have to touch the lonely vertex (connecting it) or are already there. So $' + C(n4 - 1, 2) + '$ is the most.'], hint: 'Make one part as big and as full as possible.' };
  });

  function imul(A, B) { return A.map(function (r) { return B[0].map(function (_, j) { return r.reduce(function (s, x, k) { return s + x * B[k][j]; }, 0); }); }); }
  G('disc.adjacency-matrices', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['walks2', 'degree', 'edges']), R.pick(['walks2', 'walks3', 'diag']), R.pick(['A2', 'walks3', 'triangles']));
    var n = R.int(3, 4), g = gRandom(R, n, n === 3 ? R.int(2, 3) : R.int(3, 5), true), V = g.v, A = V.map(function (x) { return V.map(function (y) { return gHasEdge(g, x, y) ? 1 : 0; }); });
    var A2 = imul(A, A), A3 = imul(A2, A), At = T.mat(A), lab = V.map(function (x, i) { return String(i + 1); });
    var intro = 'The adjacency matrix of a graph on vertices $' + range(1, n).join(', ') + '$ is $$A = ' + At + '$$';
    var i = R.int(0, n - 1), j = R.int(0, n - 1);
    if (shape === 'degree') return { q: intro + ' What is the degree of vertex ' + (i + 1) + '?', a: num(sum(A[i])), steps: ['Row ' + (i + 1) + ' lists the neighbors of vertex ' + (i + 1) + ': $' + A[i].join(', ') + '$.', 'Its sum is the degree: $' + sum(A[i]) + '$.'], hint: 'Add up row ' + (i + 1) + '.' };
    if (shape === 'edges') return { q: intro + ' How many edges does the graph have?', a: num(g.e.length), steps: ['The entries add to $' + sum(A.map(sum)) + '$.', 'Each edge appears twice (in row $i$, column $j$ and in row $j$, column $i$): $' + sum(A.map(sum)) + '/2 = ' + g.e.length + '$.'], hint: 'The matrix is symmetric: every edge shows up twice.' };
    var walksList = function (k, a, b) { var out = []; (function go(p) { if (p.length === k + 1) { if (p[k] === b) out.push(p.slice()); return; } for (var t = 0; t < n; t++) if (A[p[p.length - 1]][t]) { p.push(t); go(p); p.pop(); } })([a]); return out; };
    if (shape === 'walks2' || shape === 'diag') {
      if (shape === 'diag') j = i;
      var wl = walksList(2, i, j);
      return { nolint: ['+ 0'], q: intro + ' How many walks of length $2$ go from vertex ' + (i + 1) + ' to vertex ' + (j + 1) + '?', a: num(A2[i][j]),
        steps: ['The $(' + (i + 1) + ', ' + (j + 1) + ')$ entry of $A^{2}$ is row ' + (i + 1) + ' times column ' + (j + 1) + ': $' + A[i].map(function (x, k) { return x + ' \\cdot ' + A[k][j]; }).join(' + ') + ' = ' + A2[i][j] + '$.', 'Each term is $1$ exactly when there is a middle vertex $k$ joined to both.', A2[i][j] ? 'The walks: ' + wl.map(function (w) { return w.map(function (x) { return x + 1; }).join('–'); }).join(', ') + (i === j ? '. On the diagonal this is the degree of the vertex.' : '.') : 'There are none.'], hint: 'Multiply row ' + (i + 1) + ' of $A$ by column ' + (j + 1) + '.' };
    }
    if (shape === 'walks3') { var w3 = walksList(3, i, j);
      return { nolint: ['+ 0'], q: intro + ' How many walks of length $3$ go from vertex ' + (i + 1) + ' to vertex ' + (j + 1) + '?', a: num(A3[i][j]),
        steps: ['$A^{2} = ' + T.mat(A2) + '$.', 'The $(' + (i + 1) + ', ' + (j + 1) + ')$ entry of $A^{3} = A^{2}A$ is $' + A2[i].map(function (x, k) { return x + ' \\cdot ' + A[k][j]; }).join(' + ') + ' = ' + A3[i][j] + '$.', A3[i][j] ? 'They are ' + w3.map(function (w) { return w.map(function (x) { return x + 1; }).join('–'); }).join(', ') + '; walks may repeat vertices and edges.' : 'There are none.'], hint: 'Compute $A^{2}$ first, then one entry of $A^{2}A$.' }; }
    if (shape === 'A2') return { q: intro + ' Find $A^{2}$.', a: { t: 'matrix', v: A2.map(function (r) { return r.map(String); }) },
      steps: ['Entry $(i, j)$ of $A^{2}$ is row $i$ times column $j$: the number of walks of length $2$ from $i$ to $j$.', '$A^{2} = ' + T.mat(A2) + '$. The diagonal entries are the degrees.'], hint: 'Row times column for each entry.' };
    var tr = A3.reduce(function (s, r, k) { return s + r[k]; }, 0), tri = 0; for (var a = 0; a < n; a++) for (var b = a + 1; b < n; b++) for (var c = b + 1; c < n; c++) if (A[a][b] && A[b][c] && A[a][c]) tri++;
    if (tr !== 6 * tri) throw new Error('trace');
    return { q: intro + ' The trace of $A^{3}$ (the sum of its diagonal) is $' + tr + '$. How many triangles does the graph have?', a: num(tri),
      steps: ['A diagonal entry of $A^{3}$ counts closed walks of length $3$ from a vertex: going around a triangle.', 'Each triangle gives $6$ such walks: $3$ starting vertices times $2$ directions.', 'Triangles: $' + tr + '/6 = ' + tri + '$.'], hint: 'How many closed walks of length 3 does one triangle give?' };
  });

  function triCount(g) { var c = 0; g.v.forEach(function (a, i) { g.v.forEach(function (b, j) { g.v.forEach(function (cc, k) { if (i < j && j < k && gHasEdge(g, a, b) && gHasEdge(g, b, cc) && gHasEdge(g, a, cc)) c++; }); }); }); return c; }
  function edgeDegPairs(g) { var d = gDeg(g); return g.e.map(function (e) { var p = [d[e[0]], d[e[1]]].sort(); return '(' + p[0] + ', ' + p[1] + ')'; }).sort().join(', '); }
  function relabel(R, g) { var nums = R.shuffle(range(1, g.v.length)).map(String), m = {}; g.v.forEach(function (x, i) { m[x] = nums[i]; }); return { v: range(1, g.v.length).map(String), e: g.e.map(function (e) { return [m[e[0]], m[e[1]]].sort(); }), map: m }; }
  G('disc.isomorphism', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['invariant', 'map']), R.pick(['decide', 'invariant', 'map']), R.pick(['decide', 'decide', 'map']));
    if (shape === 'decide') {
      var g, h, iso, t = 0, want = R.pick(['iso', 'swap', 'swap', 'deg']);
      do {
        g = gRandom(R, R.int(5, 6), R.int(5, 7), true);
        if (want === 'iso') h = relabel(R, g);
        else {
          var e2 = g.e.map(function (e) { return e.slice(); });
          if (want === 'swap') { var a = R.int(0, e2.length - 1), b = R.int(0, e2.length - 1), A1 = e2[a], B1 = e2[b]; if (a !== b && A1[0] !== B1[1] && A1[1] !== B1[0] && A1[0] !== B1[0] && A1[1] !== B1[1]) { var n1 = [A1[0], B1[1]].sort(), n2 = [B1[0], A1[1]].sort(); if (!gHasEdge(g, n1[0], n1[1]) && !gHasEdge(g, n2[0], n2[1])) { e2[a] = n1; e2[b] = n2; } } }
          else { var k = R.int(0, e2.length - 1), u = e2[k][0], others = g.v.filter(function (v) { return v !== u && v !== e2[k][1] && !gHasEdge(g, u, v); }); if (others.length) e2[k] = [u, R.pick(others)].sort(); }
          h = relabel(R, { v: g.v, e: e2 });
        }
        iso = !!gIso(g, h); t++;
      } while (t < 200 && ((want === 'iso') !== iso || !gConnected(h)));
      var dsg = degSeq(g), dsh = degSeq(h), same = dsg.join() === dsh.join();
      var steps = ['Both have $' + g.v.length + '$ vertices and $' + g.e.length + '$ edges. Degree sequences: $' + dsg.join(', ') + '$ and $' + dsh.join(', ') + '$.'];
      if (iso) { var m = gIso(g, h); steps.push('A matching relabeling: ' + g.v.map(function (x) { return x + ' → ' + m[x]; }).join(', ') + '. Every edge of the left graph goes to an edge of the right one, so they are isomorphic.'); }
      else if (!same) steps.push('The degree sequences differ, so they cannot be isomorphic.');
      else { var tg = triCount(g), th = triCount(h), pg = edgeDegPairs(g), ph = edgeDegPairs(h);
        steps.push('The degree sequences match, so look deeper. ' + (tg !== th ? 'The left graph has ' + plural(tg, 'triangle') + ' and the right has ' + th + ', and an isomorphism would keep triangles.' : pg !== ph ? 'Look at the degrees at the two ends of each edge: left $' + pg + '$, right $' + ph + '$. An isomorphism keeps these pairs, and they differ.' : 'Trying every relabeling shows that none matches all the edges.') + ' Matching degree sequences was not enough.'); }
      return { q: 'Are these two graphs isomorphic? Left: edges $' + gEdgeWords(g) + '$. Right: edges $' + gEdgeWords(h) + '$.', a: tf(iso), viz: { name: 'disc-graph', opts: { mode: 'iso', graph: { v: g.v, e: g.e }, graph2: { v: h.v, e: h.e }, quiet: true, edit: false } }, steps: steps, hint: 'Compare degree sequences first; if they match, try to build a relabeling.' };
    }
    if (shape === 'invariant') {
      var g2, h2, t2 = 0;
      do { g2 = gRandom(R, 5, R.int(5, 7), true); var e3 = g2.e.map(function (e) { return e.slice(); }), kk = R.int(0, e3.length - 1), uu = e3[kk][0], oo = g2.v.filter(function (v) { return v !== uu && v !== e3[kk][1] && !gHasEdge(g2, uu, v); }); if (oo.length) e3[kk] = [uu, R.pick(oo)].sort(); h2 = relabel(R, { v: g2.v, e: e3 }); t2++; } while (t2 < 100 && degSeq(g2).join() === degSeq(h2).join());
      return { q: 'Two graphs each have 5 vertices and ' + g2.e.length + ' edges. Left: edges $' + gEdgeWords(g2) + '$. Right: edges $' + gEdgeWords(h2) + '$. What shows they are not isomorphic?', a: mc('Their degree sequences differ: $' + degSeq(g2).join(', ') + '$ vs $' + degSeq(h2).join(', ') + '$.', ['They have different numbers of vertices.', 'They have different numbers of edges.', 'They are drawn differently.']),
        viz: { name: 'disc-graph', opts: { mode: 'iso', graph: { v: g2.v, e: g2.e }, graph2: { v: h2.v, e: h2.e }, quiet: true, edit: false } },
        steps: ['An isomorphism keeps every vertex’s degree, so isomorphic graphs have the same degree sequence.', 'Here: $' + degSeq(g2).join(', ') + '$ and $' + degSeq(h2).join(', ') + '$. They differ, so no isomorphism exists. A drawing is never evidence either way.'], hint: 'List each graph’s degrees.' };
    }
    var g3, d3, top, t3 = 0; do { g3 = gRandom(R, R.int(5, 6), R.int(5, 7), true); d3 = gDeg(g3); var mx = M.max.apply(null, g3.v.map(function (v) { return d3[v]; })); top = g3.v.filter(function (v) { return d3[v] === mx; }); t3++; } while (top.length !== 1 && t3 < 100);
    var h3 = relabel(R, g3), x = top[0];
    return { q: 'Graph $G$ has edges $' + gEdgeWords(g3) + '$. Graph $H$ has edges $' + h3.e.map(function (e) { return e[0] + e[1]; }).join(', ') + '$, and $G$ and $H$ are isomorphic. Which vertex of $H$ must ' + x + ' map to?', a: num(h3.map[x]),
      steps: ['An isomorphism keeps degrees. In $G$, ' + x + ' is the only vertex of degree $' + d3[x] + '$.', 'In $H$, the only vertex of degree $' + d3[x] + '$ is $' + h3.map[x] + '$.', 'So ' + x + ' must go to $' + h3.map[x] + '$.'], hint: 'Find a degree that only one vertex has.' };
  });

  function eulerType(g) { if (!gConnected(g)) return 'disc'; var d = gDeg(g), odd = g.v.filter(function (v) { return d[v] % 2; }); return odd.length === 0 ? 'circuit' : odd.length === 2 ? 'path' : 'neither'; }
  G('disc.euler-circuits', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['type', 'odd', 'type']), R.pick(['type', 'start', 'family']), R.pick(['add', 'family', 'type']));
    if (shape === 'type' || shape === 'odd' || shape === 'start' || shape === 'add') {
      var want = shape === 'start' ? 'path' : shape === 'add' ? 'neither' : R.pick(['circuit', 'path', 'neither']), g, t = 0;
      do { g = gRandom(R, R.int(5, 6), R.int(5, 9), true); t++; } while (eulerType(g) !== want && t < 400);
      var d = gDeg(g), odd = g.v.filter(function (v) { return d[v] % 2; }), ty = eulerType(g);
      if (shape === 'start' && ty !== 'path') shape = 'type';
      var dl = 'Degrees: ' + g.v.map(function (v) { return v + ' ' + d[v]; }).join(', ') + '.';
      if (shape === 'odd') return { q: 'How many vertices of odd degree does the graph shown have? (Edges $' + gEdgeWords(g) + '$.)', a: num(odd.length), viz: gViz(g), steps: [dl, 'Odd: ' + (odd.join(', ') || 'none') + ', so $' + odd.length + '$.'], hint: 'Find each degree.' };
      if (shape === 'start') return { q: 'The connected graph shown (edges $' + gEdgeWords(g) + '$) has an Euler path but no Euler circuit. At which vertices can an Euler path start? List them.', a: setText(odd), viz: gViz(g),
        steps: [dl, 'Exactly two vertices have odd degree: ' + odd.join(' and ') + '.', 'An Euler path must start at one of them and end at the other: every time the path passes through a vertex it uses two edges, so only the ends can have odd degree.'], hint: 'Find the vertices of odd degree.' };
      if (shape === 'add') return { q: 'The graph shown (edges $' + gEdgeWords(g) + '$) has ' + odd.length + ' vertices of odd degree. What is the fewest number of edges you must add (repeating an existing edge is allowed) so that the result has an Euler circuit?', a: num(odd.length / 2), viz: gViz(g),
        steps: [dl, 'Each added edge changes the degrees of its two ends by $1$, so it can fix at most two odd vertices.', 'Pair up the ' + odd.length + ' odd vertices and join each pair: $' + odd.length / 2 + '$ edges.'], hint: 'One new edge fixes two odd vertices.' };
      var ch = ['An Euler circuit', 'An Euler path but no Euler circuit', 'Neither'], idx = { circuit: 0, path: 1, neither: 2 }[ty];
      return { q: 'Does the connected graph shown (edges $' + gEdgeWords(g) + '$) have an Euler circuit, an Euler path, or neither?', a: mcKeep(ch, idx), viz: gViz(g),
        steps: [dl, ty === 'circuit' ? 'Every degree is even, and the graph is connected: an Euler circuit exists.' : ty === 'path' ? 'Exactly two vertices (' + odd.join(' and ') + ') have odd degree: an Euler path exists, from one to the other, but no circuit.' : odd.length + ' vertices have odd degree: more than two, so neither exists.'], hint: 'Count the vertices of odd degree.' };
    }
    var it = R.pick([['K_{5}', true, 'Every vertex has degree $4$, which is even.'], ['K_{6}', false, 'Every vertex has degree $5$, which is odd.'], ['K_{2,4}', true, 'Degrees are $4$ and $2$, all even.'], ['K_{3,4}', false, 'The vertices on the side of $3$ have degree $4$, but those on the side of $4$ have degree $3$, which is odd.'],
      ['C_{9}', true, 'Every degree is $2$.'], ['\\text{the cube graph } Q_{3}', false, 'Every degree is $3$.'], ['K_{7}', true, 'Every degree is $6$.'], ['K_{4,4}', true, 'Every degree is $4$.']]);
    return { q: 'Does ' + (/text/.test(it[0]) ? 'the cube graph $Q_{3}$' : '$' + it[0] + '$') + ' have an Euler circuit?', a: tf(it[1]), steps: ['A connected graph has an Euler circuit exactly when every degree is even.', it[2]], hint: 'Find the degrees.' };
  });

  G('disc.hamilton-paths', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['which', 'dirac', 'decide']), R.pick(['decide', 'dirac', 'kmn']), R.pick(['decide', 'count', 'kmn']));
    if (shape === 'which') { var it = R.pick([['A museum guard wants a route through the halls that walks every <b>hallway</b> exactly once.', 0], ['A tourist wants to visit every <b>city</b> on the map exactly once and return home.', 1], ['A snowplow must clear every <b>street</b> once without repeating a street.', 0], ['A traveling salesperson must stop at every <b>store</b> exactly once.', 1]]);
      return { q: it[0] + ' Which kind of route is that?', a: mcKeep(['An Euler path or circuit (every edge once)', 'A Hamilton path or cycle (every vertex once)'], it[1]), steps: [it[1] ? 'The places to visit are vertices, and each must be visited once: a Hamilton route.' : 'The things to cover are the connections (edges), each used once: an Euler route.'], hint: 'Are the things to cover the places or the connections?' }; }
    if (shape === 'dirac') { var n = R.int(5, 12), dmin = R.int(2, n - 1), ok = dmin >= n / 2;
      return { q: 'A simple graph has ' + n + ' vertices, and every vertex has degree at least ' + dmin + '. Does Dirac’s theorem guarantee a Hamilton cycle?', a: tf(ok), steps: ['Dirac: if $n \\ge 3$ and every degree is at least $n/2 = ' + (n / 2) + '$, there is a Hamilton cycle.', ok ? '$' + dmin + ' \\ge ' + n / 2 + '$, so yes.' : '$' + dmin + ' < ' + n / 2 + '$, so the theorem does not apply. That does not mean there is no Hamilton cycle; it means the theorem cannot promise one.'], hint: 'Compare the smallest degree with $n/2$.' }; }
    if (shape === 'kmn') { var m = R.int(2, 5), n2 = R.int(2, 5), ok2 = m === n2;
      return { q: 'Does $K_{' + m + ',' + n2 + '}$ have a Hamilton cycle?', a: tf(ok2), steps: ['A cycle in a bipartite graph alternates sides, so it uses the same number of vertices from each side.', ok2 ? 'Both sides have $' + m + '$ vertices: alternate between them and return. Yes.' : 'The sides have $' + m + '$ and $' + n2 + '$ vertices, so a cycle cannot use all of them. No.'], hint: 'A cycle alternates between the two sides.' }; }
    if (shape === 'count') { var n3 = R.int(4, 7); return { q: 'How many different Hamilton cycles does $K_{' + n3 + '}$ have? (A cycle is the same whatever its starting vertex and direction.)', a: num(fact(n3 - 1) / 2),
      steps: ['Fix the starting vertex; the other $' + (n3 - 1) + '$ can be visited in any order: $(' + n3 + ' - 1)! = ' + fact(n3 - 1) + '$.', 'Each cycle is counted twice, once in each direction: $' + fact(n3 - 1) / 2 + '$.'], hint: 'Fix a start, then divide by 2 for direction.' }; }
    var pool = [['petersen', PRESET.petersen], ['cube', PRESET.cube], ['K23', bipG(2, 3)], ['K33', bipG(3, 3)], ['wheel', wheelG(5)], ['bowtie', { v: ['A', 'B', 'C', 'D', 'E'], e: [['A', 'B'], ['B', 'C'], ['A', 'C'], ['C', 'D'], ['D', 'E'], ['C', 'E']] }]];
    var g = R.chance(0.5) ? R.pick(pool)[1] : gRandom(R, R.int(5, 6), R.int(6, 8), true), hc = gHamCycle(g);
    var why;
    if (hc) why = 'One Hamilton cycle: $' + hc.concat([hc[0]]).join(' \\to ') + '$.';
    else if (g.v.length === 10) why = 'The Petersen graph has no Hamilton cycle (a known fact, checked by trying every route).';
    else { var dg = gDeg(g), low = g.v.filter(function (v) { return dg[v] < 2; }), cut = g.v.filter(function (x) { return !gConnected({ v: g.v.filter(function (y) { return y !== x; }), e: g.e.filter(function (e) { return e[0] !== x && e[1] !== x; }) }); });
      why = low.length ? 'Vertex ' + low[0] + ' has degree ' + dg[low[0]] + ', but a cycle through it needs two of its edges.' : cut.length ? 'Removing ' + cut[0] + ' disconnects the graph, so a cycle through every vertex would have to pass through ' + cut[0] + ' twice.' : g.parts ? 'The graph is bipartite with sides of ' + g.parts[0].length + ' and ' + g.parts[1].length + ' vertices, and a cycle alternates sides, so it cannot use them all.' : 'Trying every route from ' + g.v[0] + ' finds none.'; }
    return { q: 'Does the graph shown have a Hamilton cycle? (Edges $' + gEdgeWords(g) + '$.)', a: tf(!!hc), viz: gViz(g, g.v.length > 7 ? { graph: g.v.length === 10 ? 'petersen' : 'cube' } : {}), steps: ['A Hamilton cycle visits every vertex exactly once and returns to the start.', why], hint: 'Try to build one; vertices of degree 2 force both of their edges.' };
  });

  G('disc.trees', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['edges', 'istree', 'facts']), R.pick(['istree', 'forest', 'leaves']), R.pick(['leaves', 'istree', 'forest']));
    if (shape === 'edges') { var n = R.int(5, 40), back = R.coin(); return back ? { q: 'A tree has ' + n + ' edges. How many vertices does it have?', a: num(n + 1), steps: ['A tree with $v$ vertices has $v - 1$ edges.', 'So $v = ' + n + ' + 1 = ' + (n + 1) + '$.'], hint: 'Edges are one fewer than vertices.' } : { q: 'How many edges does a tree with ' + n + ' vertices have?', a: num(n - 1), steps: ['Build the tree one vertex at a time: each new vertex joins with exactly one new edge.', 'So $' + n + ' - 1 = ' + (n - 1) + '$ edges.'], hint: 'Edges are one fewer than vertices.' }; }
    if (shape === 'forest') { var n2 = R.int(8, 30), c = R.int(2, 5); return { q: 'A forest (a graph with no cycles) has ' + n2 + ' vertices and ' + c + ' connected components. How many edges does it have?', a: num(n2 - c), steps: ['Each component is a tree, with one fewer edge than vertices.', 'Adding over the ' + c + ' trees: $' + n2 + ' - ' + c + ' = ' + (n2 - c) + '$.'], hint: 'Lose one edge per component.' }; }
    if (shape === 'istree') {
      var nv = R.int(5, 7), g = randTree(R, nv), kind = R.pick(['tree', 'tree', 'cycle', 'trap']);
      if (kind === 'cycle') { var cand = []; g.v.forEach(function (a) { g.v.forEach(function (b) { if (a < b && !gHasEdge(g, a, b)) cand.push([a, b]); }); }); g.e.push(R.pick(cand)); }
      if (kind === 'trap') { var cand2 = [], tt = 0, e0; do { e0 = R.int(0, g.e.length - 1); var rest = { v: g.v, e: g.e.filter(function (x, i) { return i !== e0; }) }, comp = gComps(rest).filter(function (cc) { return cc.length >= 3; })[0]; cand2 = []; if (comp) comp.forEach(function (a) { comp.forEach(function (b) { if (a < b && !gHasEdge(rest, a, b)) cand2.push([a, b]); }); }); tt++; } while (!cand2.length && tt < 50);
        if (cand2.length) { g.e = g.e.filter(function (x, i) { return i !== e0; }); g.e.push(R.pick(cand2)); } else kind = 'tree'; }
      var isT = gIsTree(g), cyc = gHasCycle(g), con = gConnected(g);
      return { q: 'Is the graph shown a tree? (Vertices ' + g.v.join(', ') + '; edges $' + gEdgeWords(g) + '$.)', a: tf(isT), viz: gViz(g),
        steps: ['A tree is connected and has no cycles. It has $v - 1 = ' + (nv - 1) + '$ edges, but that count alone is not enough.', 'Here: ' + g.e.length + ' edges; ' + (con ? 'connected' : 'not connected') + '; ' + (cyc ? 'has a cycle' : 'no cycles') + '.', isT ? 'So it is a tree.' : (g.e.length === nv - 1 ? 'It has the right number of edges but fails the test, so it is not a tree.' : 'So it is not a tree.')], hint: 'Check both conditions: connected, and no cycles.' };
    }
    if (shape === 'leaves') { var n3 = R.int(1, 4), n4 = R.int(0, 3), n5 = R.int(0, 2), n2v = R.int(0, 4), Lf = 2 + n3 + 2 * n4 + 3 * n5;
      var vx = function (k) { return k === 1 ? '1 vertex' : k + ' vertices'; }, parts = []; if (n2v) parts.push(vx(n2v) + ' of degree 2'); parts.push(vx(n3) + ' of degree 3'); if (n4) parts.push(vx(n4) + ' of degree 4'); if (n5) parts.push(vx(n5) + ' of degree 5');
      return { q: 'A tree has ' + parts.join(', ') + ', and every other vertex is a leaf (degree 1). How many leaves does it have?', a: num(Lf),
        steps: ['Let $\\ell$ be the number of leaves. Vertices: $v = ' + (n2v + n3 + n4 + n5) + ' + \\ell$, edges $v - 1$.', 'Handshake: the degrees add to $2(v - 1)$: $\\ell + ' + (2 * n2v + 3 * n3 + 4 * n4 + 5 * n5) + ' = 2(' + (n2v + n3 + n4 + n5) + ' + \\ell - 1)$.', 'Solve: $\\ell = ' + Lf + '$. (Shortcut: $\\ell = 2 + \\sum (d - 2)$ over vertices of degree $d \\ge 3$.)'], hint: 'Combine $e = v - 1$ with the handshake lemma.' }; }
    var facts = [['Adding one edge to a tree (between two of its vertices) creates exactly one cycle.', true, 'The two ends were already joined by a unique path; the new edge closes it into one cycle.'], ['Removing any edge from a tree disconnects it.', true, 'Each edge is the only path between its ends.'],
      ['Every tree with at least 2 vertices has at least 2 leaves.', true, 'The two ends of a longest path must be leaves.'], ['Every graph with $n$ vertices and $n - 1$ edges is a tree.', false, 'A triangle plus a separate vertex has 4 vertices and 3 edges but is not connected.'], ['In a tree there is exactly one path between any two vertices.', true, 'Two different paths would create a cycle.']];
    var f = R.pick(facts);
    return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'A tree is connected with no cycles.' };
  });

  G('disc.spanning-trees', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['weight', 'count', 'weight']), R.pick(['weight', 'reject', 'order']), R.pick(['order', 'reject', 'weight']));
    if (shape === 'count') { var n = R.int(4, 30); return { q: 'How many edges does a spanning tree of a connected graph with ' + n + ' vertices have?', a: num(n - 1), steps: ['A spanning tree is a tree that uses every vertex.', 'A tree with $' + n + '$ vertices has $' + (n - 1) + '$ edges.'], hint: 'Edges of a tree = vertices − 1.' }; }
    var g = wgRandom(R, L), k = kruskal(g), ew = function (e) { return e[0] + e[1] + ' (' + e[2] + ')'; };
    var logTxt = k.log.slice(0, k.log.findIndex(function (x, i) { return k.log.slice(0, i + 1).filter(function (y) { return y[1]; }).length === g.v.length - 1; }) + 1).map(function (x) { return ew(x[0]) + (x[1] ? ' add' : ' skip (cycle)'); }).join('; ');
    var viz = wgViz(g);
    if (shape === 'weight') return { q: 'Use Kruskal’s algorithm to find a minimum spanning tree of the weighted graph shown. What is its total weight?', a: num(k.total), viz: viz,
      steps: ['Sort the edges by weight and take each one that does not close a cycle.', logTxt + '.', 'Tree: ' + k.tree.map(ew).join(', ') + '. Total: $' + k.tree.map(function (e) { return e[2]; }).join(' + ') + ' = ' + k.total + '$.'], hint: 'Cheapest edge first; skip any edge whose ends are already connected.' };
    if (shape === 'reject') { var firstRej = null, added = 0; for (var i = 0; i < k.log.length && added < g.v.length - 1; i++) { if (k.log[i][1]) added++; else { firstRej = k.log[i][0]; break; } }
      if (!firstRej) return { q: 'Use Kruskal’s algorithm on the graph shown. What is the total weight of the minimum spanning tree?', a: num(k.total), viz: viz, steps: [logTxt + '.', 'Total: $' + k.total + '$.'], hint: 'Cheapest edge first; skip any edge that closes a cycle.' };
      var others = g.e.filter(function (e) { return e !== firstRej; });
      return { q: 'Running Kruskal’s algorithm on the graph shown, which edge is the <b>first</b> one rejected because it would close a cycle?', a: mc(ew(firstRej), R.sample(others, 3).map(ew)), viz: viz,
        steps: ['In order of weight: ' + logTxt + '.', ew(firstRej) + ' is the first edge whose ends are already joined by chosen edges.'], hint: 'Go through the edges cheapest first, keeping track of what is connected.' }; }
    var idx = R.int(2, M.min(4, g.v.length - 1)), ed = k.tree[idx - 1];
    return { q: 'Running Kruskal’s algorithm on the graph shown, which edge is the ' + ['', 'first', 'second', 'third', 'fourth'][idx] + ' one <b>added</b> to the tree?', a: mc(ew(ed), R.sample(g.e.filter(function (e) { return e !== ed; }), 3).map(ew)), viz: viz,
      steps: ['In order of weight: ' + logTxt + '.', 'The ' + ['', 'first', 'second', 'third', 'fourth'][idx] + ' edge added is ' + ew(ed) + '.'], hint: 'Rejected edges do not count as added.' };
  });

  G('disc.shortest-paths', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['dist', 'dist', 'second']), R.pick(['dist', 'second', 'order']), R.pick(['order', 'path', 'dist']));
    var g, dj, t = 0; do { g = wgRandom(R, L); dj = dijkstra(g, 'A'); t++; } while (t < 60 && U.uniq(g.v.map(function (v) { return String(dj.d[v]); })).length < g.v.length);
    var viz = wgViz(g, { algo: 'dijkstra', start: 'A' }), ord = dj.order, d = dj.d;
    var log = ord.map(function (v, i) { return 'settle ' + v + ' at ' + d[v]; }).join('; ');
    function pathTo(x) { var p = [x]; while (p[0] !== 'A') p.unshift(dj.prev[p[0]]); return p; }
    if (shape === 'dist') { var x = R.pick(g.v.slice(1)); return { q: 'Use Dijkstra’s algorithm on the weighted graph shown. What is the length of a shortest path from A to ' + x + '?', a: num(d[x]), viz: viz,
      steps: ['Settle the closest unsettled vertex each round, then update its neighbors’ tentative distances.', 'Order: ' + log + '.', 'Shortest path: $' + pathTo(x).join(' \\to ') + '$, length $' + d[x] + '$.'], hint: 'Do not settle a vertex the first time you reach it; settle the closest unsettled one each round.' }; }
    if (shape === 'second') { var sec = ord[1], third = ord[2], ask = R.coin() ? [sec, 'second'] : [third, 'third'];
      return { q: 'Running Dijkstra’s algorithm from A on the graph shown, which vertex is settled ' + ask[1] + '? (A is settled first.)', a: mc(ask[0], g.v.filter(function (v) { return v !== ask[0] && v !== 'A'; }).slice(0, 4)), viz: viz,
        steps: ['Order: ' + log + '.', 'So the ' + ask[1] + ' vertex settled is ' + ask[0] + '.'], hint: 'Each round, settle the unsettled vertex with the smallest tentative distance.' }; }
    if (shape === 'order') return { q: 'Running Dijkstra’s algorithm from A on the graph shown, in what order are the vertices settled? (Type the letters in order, like A, C, B, …)', a: seqText(ord), viz: viz,
      steps: ['Each round: settle the closest unsettled vertex and update its neighbors.', log + '.', 'Order: ' + ord.join(', ') + '.'], hint: 'Keep a table of tentative distances and update it after each settled vertex.' };
    var far = ord[ord.length - 1], pth = pathTo(far), cnt = 0; (function countPaths(v, len, seen) { if (len > d[far]) return; if (v === far) { if (len === d[far]) cnt++; return; } g.e.forEach(function (e) { var o = e[0] === v ? e[1] : e[1] === v ? e[0] : null; if (o && !seen[o]) { seen[o] = 1; countPaths(o, len + e[2], seen); delete seen[o]; } }); })('A', 0, { A: 1 });
    if (cnt !== 1) return { q: 'Use Dijkstra’s algorithm on the weighted graph shown. What is the length of a shortest path from A to ' + far + '?', a: num(d[far]), viz: viz, steps: ['Order: ' + log + '.', 'Distance to ' + far + ': $' + d[far] + '$.'], hint: 'Settle the closest unsettled vertex each round.' };
    return { q: 'Find the shortest path from A to ' + far + ' in the weighted graph shown. List its vertices in order (like A, B, …).', a: seqText(pth), viz: viz,
      steps: ['Run Dijkstra from A, remembering for each vertex which settled vertex gave its best distance: ' + log + '.', 'Trace back from ' + far + ': $' + pth.join(' \\to ') + '$, length $' + d[far] + '$.'], hint: 'Record where each vertex’s best distance came from, then trace back.' };
  });

  function hasK4(g) { var V = g.v; for (var a = 0; a < V.length; a++) for (var b = a + 1; b < V.length; b++) for (var c = b + 1; c < V.length; c++) for (var d = c + 1; d < V.length; d++) { var q = [V[a], V[b], V[c], V[d]], ok = true; for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) if (!gHasEdge(g, q[i], q[j])) ok = false; if (ok) return true; } return false; }
  function colorWords(g, k) { var adj = gAdj(g), col = {}; (function go(i) { if (i === g.v.length) return true; var x = g.v[i]; for (var c = 0; c < k; c++) { if (adj[x].some(function (y) { return col[y] === c; })) continue; col[x] = c; if (go(i + 1)) return true; delete col[x]; } return false; })(0); return range(0, k - 1).map(function (c) { return 'color ' + (c + 1) + ': ' + g.v.filter(function (v) { return col[v] === c; }).join(', '); }).join('; '); }
  G('disc.graph-coloring', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['chromatic', 'bipartite', 'chromatic']), R.pick(['chromatic', 'greedy', 'schedule']), R.pick(['greedy', 'chromatic', 'schedule']));
    if (shape === 'chromatic' || shape === 'bipartite') {
      var fam = R.int(1, 6), g, nm = '';
      if (fam === 1) { var n = R.int(4, 7); g = cycleG(n); nm = 'the cycle $C_{' + n + '}$'; } else if (fam === 2) { var n2 = R.int(4, 6); g = wheelG(n2); nm = 'a wheel: a cycle of ' + n2 + ' with a hub joined to all of them'; }
      else if (fam === 3) { g = completeG(R.int(3, 5)); } else if (fam === 4) { g = bipG(R.int(2, 3), R.int(2, 3)); } else if (fam === 5 && L > 1) { g = PRESET.petersen; nm = 'the Petersen graph'; } else g = gRandom(R, 6, R.int(6, 9), true);
      var chi = gChromatic(g), oc = gOddCycle(g);
      if (shape === 'bipartite') return { q: 'Is the graph shown bipartite (can it be colored with two colors)? (Edges $' + gEdgeWords(g) + '$.)', a: tf(!oc), viz: gViz(g, g.v.length === 10 ? { graph: 'petersen' } : {}),
        steps: ['A graph can be two-colored exactly when it has no cycle of odd length.', oc ? 'It has an odd cycle, so two colors are not enough.' : 'Coloring by alternating along edges never clashes, so yes: ' + (function () { var s = {}, q = [g.v[0]]; s[g.v[0]] = 0; var adj = gAdj(g); while (q.length) { var x = q.shift(); adj[x].forEach(function (y) { if (s[y] === undefined) { s[y] = 1 - s[x]; q.push(y); } }); } g.v.forEach(function (v) { if (s[v] === undefined) s[v] = 0; }); return 'one side ' + g.v.filter(function (v) { return !s[v]; }).join(', ') + ', the other ' + g.v.filter(function (v) { return s[v]; }).join(', '); })() + '.'], hint: 'Look for a triangle or a 5-cycle.' };
      return { q: 'What is the chromatic number of the graph shown' + (nm ? ' (' + nm + ')' : '') + '? (Edges $' + gEdgeWords(g) + '$.)', a: num(chi), viz: gViz(g, g.v.length === 10 ? { graph: 'petersen' } : {}),
        steps: [chi === 2 ? 'It has no odd cycle, so two colors suffice, and one is not enough because it has edges.' : 'Lower bound: ' + (chi === 3 ? 'it has an odd cycle, so two colors are not enough.' : g.e.length === g.v.length * (g.v.length - 1) / 2 ? 'every two vertices are adjacent, so all ' + g.v.length + ' need different colors.' : fam === 2 ? 'the rim is an odd cycle, which needs 3 colors, and the hub touches all of them, so it needs a 4th.' : 'trying every way to use ' + (chi - 1) + ' colors runs into a clash.'),
          'A coloring with ' + chi + ' colors: ' + colorWords(g, chi) + '.', 'So the chromatic number is $' + chi + '$.'], hint: 'Find a lower bound (an odd cycle, a $K_{4}$) and a coloring that matches it.' };
    }
    if (shape === 'greedy') {
      var k = R.int(3, 4), V = [], e = [], ord = [];
      for (var i = 0; i < k; i++) { V.push('A' + (i + 1)); V.push('B' + (i + 1)); }
      for (i = 0; i < k; i++) for (var j = 0; j < k; j++) if (i !== j) e.push(['A' + (i + 1), 'B' + (j + 1)]);
      for (i = 0; i < k; i++) { ord.push('A' + (i + 1)); ord.push('B' + (i + 1)); }
      var gg = { v: V, e: e }, col = gGreedy(gg, ord), used = U.uniq(V.map(function (v) { return String(col[v]); })).length;
      return { q: 'The graph has vertices $A_{1}, \\ldots, A_{' + k + '}$ and $B_{1}, \\ldots, B_{' + k + '}$, with $A_{i}$ joined to $B_{j}$ whenever $i \\ne j$. A greedy coloring visits the vertices in the order $' + ord.map(function (v) { return v[0] + '_{' + v.slice(1) + '}'; }).join(', ') + '$, giving each the lowest-numbered color not used by its colored neighbors. How many colors does it use?', a: num(used),
        steps: ord.map(function (v) { return '$' + v[0] + '_{' + v.slice(1) + '}$ gets color ' + (col[v] + 1); }).concat(['It uses $' + used + '$ colors, but the graph is bipartite (all $A$’s one color, all $B$’s the other), so $2$ is enough. Greedy coloring depends on the order.']),
        hint: 'Work through the order, one vertex at a time.' };
    }
    var courses = ['Art', 'Biology', 'Chemistry', 'Drama', 'Economics', 'French'], gs, chi2, t = 0;
    do { gs = gRandom(R, 6, R.int(6, 9), false); chi2 = gChromatic(gs); t++; } while (chi2 < 3 && t < 40);
    var nmOf = function (x) { return courses['ABCDEF'.indexOf(x)]; };
    return { q: 'Six exams must be scheduled. Two exams that share a student cannot be at the same time. Conflicts: ' + gs.e.map(function (e2) { return nmOf(e2[0]) + '–' + nmOf(e2[1]); }).join(', ') + '. What is the fewest number of time slots needed?', a: num(chi2),
      steps: ['Make a graph: one vertex per exam, an edge for each conflict. Time slots are colors, so we need the chromatic number.', 'A coloring with ' + chi2 + ' colors: ' + (function () { var adj = gAdj(gs), col = {}; (function go(i) { if (i === gs.v.length) return true; var x = gs.v[i]; for (var c = 0; c < chi2; c++) { if (adj[x].some(function (y) { return col[y] === c; })) continue; col[x] = c; if (go(i + 1)) return true; delete col[x]; } return false; })(0); return range(0, chi2 - 1).map(function (c) { return 'slot ' + (c + 1) + ': ' + gs.v.filter(function (v) { return col[v] === c; }).map(nmOf).join(', '); }).join('; '); })() + '.', chi2 === 3 ? 'Two slots fail because the conflicts contain an odd cycle.' : (triCount(gs) && hasK4(gs) ? 'Three slots fail because four exams all conflict with each other.' : 'Three slots fail: trying every way to split the exams into three slots runs into a conflict.'), 'Answer: $' + chi2 + '$.'],
      hint: 'Draw the conflict graph and color it.' };
  });

  var POLY = [['tetrahedron', 4, 6, 4], ['cube', 8, 12, 6], ['octahedron', 6, 12, 8], ['dodecahedron', 20, 30, 12], ['icosahedron', 12, 30, 20], ['triangular prism', 6, 9, 5], ['square pyramid', 5, 8, 5], ['pentagonal prism', 10, 15, 7], ['hexagonal pyramid', 7, 12, 7]];
  G('disc.planar-graphs', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['faces', 'poly', 'edges']), R.pick(['bound', 'test', 'poly', 'Kn']), R.pick(['test', 'tri', 'bound', 'Kn']));
    if (shape === 'faces' || shape === 'edges') { var v = R.int(5, 20), e = v - 1 + R.int(1, 2 * v - 6), f = e - v + 2;
      if (shape === 'faces') return { q: 'A connected planar graph is drawn with ' + v + ' vertices and ' + e + ' edges and no crossings. How many faces does the drawing have (counting the outside region)?', a: num(f), steps: ['Euler’s formula: $v - e + f = 2$.', '$f = 2 - ' + v + ' + ' + e + ' = ' + f + '$, including the unbounded outside face.'], hint: 'Use $v - e + f = 2$.' };
      return { q: 'A connected planar drawing has ' + v + ' vertices and ' + f + ' faces (including the outside). How many edges does it have?', a: num(e), steps: ['$v - e + f = 2$, so $e = v + f - 2$.', '$e = ' + v + ' + ' + f + ' - 2 = ' + e + '$.'], hint: 'Rearrange Euler’s formula.' }; }
    if (shape === 'poly') { var p = R.pick(POLY), miss = R.int(1, 3), nm = ['', 'vertices', 'edges', 'faces'][miss];
      var given = [1, 2, 3].filter(function (i) { return i !== miss; }).map(function (i) { return p[i] + ' ' + ['', 'vertices', 'edges', 'faces'][i]; }).join(' and ');
      return { q: 'A ' + p[0] + ' has ' + given + '. How many ' + nm + ' does it have?', a: num(p[miss]), steps: ['A convex polyhedron flattens into a connected planar graph (look through one face), so $v - e + f = 2$.', 'Solve for the ' + nm + ': $' + p[miss] + '$. Check: $' + p[1] + ' - ' + p[2] + ' + ' + p[3] + ' = 2$.'], hint: 'Use $v - e + f = 2$.' }; }
    if (shape === 'bound') { var v2 = R.int(4, 20), tri = R.coin(); return { q: 'What is the largest number of edges a simple planar graph with ' + v2 + ' vertices can have' + (tri ? '' : ' if it has no triangles (for example, if it is bipartite)') + '?', a: num(tri ? 3 * v2 - 6 : 2 * v2 - 4),
      steps: tri ? ['Every face of a simple planar drawing has at least $3$ edges around it, and each edge borders at most $2$ faces: $3f \\le 2e$.', 'With $f = 2 - v + e$: $3(2 - v + e) \\le 2e$, so $e \\le 3v - 6 = ' + (3 * v2 - 6) + '$ (reached by a triangulation).'] : ['With no triangles, every face has at least $4$ edges: $4f \\le 2e$.', 'With $f = 2 - v + e$: $e \\le 2v - 4 = ' + (2 * v2 - 4) + '$.'], hint: 'Combine Euler’s formula with a count of edges around faces.' }; }
    if (shape === 'test') { var v3 = R.int(5, 12), lim = 3 * v3 - 6, over = R.coin(), e3 = over ? lim + R.int(1, 5) : lim - R.int(0, 4); if (e3 > v3 * (v3 - 1) / 2) { e3 = v3 * (v3 - 1) / 2; over = e3 > lim; }
      return { q: 'A simple graph has ' + v3 + ' vertices and ' + e3 + ' edges. What can you conclude from the bound $e \\le 3v - 6$?', a: mcKeep(['It is not planar.', 'It is planar.', 'The bound does not decide whether it is planar.'], e3 > lim ? 0 : 2),
        steps: ['$3v - 6 = ' + lim + '$.', e3 > lim ? '$' + e3 + ' > ' + lim + '$, so the graph breaks a rule every simple planar graph obeys: it is not planar.' : '$' + e3 + ' \\le ' + lim + '$, so the test passes, but passing proves nothing: $K_{3,3}$ has $9 \\le 12$ edges and is not planar.'], hint: 'The bound can only rule graphs out.' }; }
    if (shape === 'tri') { var v4 = R.int(5, 20); return { q: 'A simple connected planar graph with ' + v4 + ' vertices is drawn so that every face, including the outside one, is a triangle. How many faces are there?', a: num(2 * v4 - 4),
      steps: ['Each face has 3 edges and each edge borders 2 faces: $3f = 2e$.', 'Euler: $v - e + f = 2$ with $e = \\frac{3f}{2}$ gives $v - \\frac{f}{2} = 2$, so $f = 2v - 4 = ' + (2 * v4 - 4) + '$ (and $e = 3v - 6 = ' + (3 * v4 - 6) + '$).'], hint: 'Use $3f = 2e$ together with Euler’s formula.' }; }
    var it = R.pick([['K_{4}', true, 'Draw it as a triangle with a point in the middle joined to all three corners.'], ['K_{5}', false, '$e = 10 > 3 \\cdot 5 - 6 = 9$.'], ['K_{3,3}', false, 'It has no triangles, so a planar drawing would need $e \\le 2v - 4 = 8$, but $e = 9$.'], ['K_{2,4}', true, 'Put the two special vertices on the left and right and the four others in a column between them.'], ['K_{6}', false, '$e = 15 > 3 \\cdot 6 - 6 = 12$.'], ['\\text{the cube graph } Q_{3}', true, 'Draw a square inside a square and join the matching corners.']]);
    return { q: 'Is ' + (/text/.test(it[0]) ? 'the cube graph $Q_{3}$' : '$' + it[0] + '$') + ' planar?', a: tf(it[1]), steps: [it[2]], hint: 'Try to draw it without crossings, or use an edge bound.' };
  });

// ---- 99-tail.js
})(typeof window !== 'undefined' ? window.MathLadder : this.MathLadder);
