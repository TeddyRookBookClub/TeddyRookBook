/* Logic families: sudoku, cage-sum squares, logic grids, picture logic, letter arithmetic, brainteasers. */
(function (root) {
  'use strict';
  var P = root.TRBPuzzles, esc = P.esc;

  function popcount(m) { var c = 0; while (m) { m &= m - 1; c++; } return c; }
  function bits(m) { var r = []; for (var v = 1; m >> v; v++) if (m & (1 << v)) r.push(v); return r; }

  /* ================= Sudoku ================= */
  var BOX = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };
  function boxOf(n, r, c) { var b = BOX[n]; return Math.floor(r / b[0]) * (n / b[1]) + Math.floor(c / b[1]); }
  /* count solutions (up to limit); rng given = random fill order (used to make full grids) */
  P.sudokuSolve = function (g, n, limit, rng) {
    var cells = g.slice(), full = (1 << (n + 1)) - 2, R = [], C = [], B = [], count = 0, sol = null, i;
    for (i = 0; i < n; i++) { R[i] = 0; C[i] = 0; B[i] = 0; }
    for (i = 0; i < n * n; i++) if (cells[i]) {
      var r = Math.floor(i / n), c = i % n, b = boxOf(n, r, c), m = 1 << cells[i];
      if ((R[r] | C[c] | B[b]) & m) return { count: 0 };
      R[r] |= m; C[c] |= m; B[b] |= m;
    }
    var bx = []; for (i = 0; i < n * n; i++) bx[i] = boxOf(n, Math.floor(i / n), i % n);
    (function go() {
      if (count >= limit) return;
      var best = -1, bestM = 0, bestN = 99;
      for (var k = 0; k < n * n; k++) if (!cells[k]) {
        var mm = full & ~(R[Math.floor(k / n)] | C[k % n] | B[bx[k]]), pc = popcount(mm);
        if (pc < bestN) { bestN = pc; best = k; bestM = mm; if (pc <= 1) break; }
      }
      if (best < 0) { count++; if (!sol) sol = cells.slice(); return; }
      if (!bestN) return;
      var vs = bits(bestM); if (rng) vs = rng.shuffle(vs);
      var rr = Math.floor(best / n), cc = best % n, bb = bx[best];
      for (var j = 0; j < vs.length && count < limit; j++) {
        var bit = 1 << vs[j];
        cells[best] = vs[j]; R[rr] |= bit; C[cc] |= bit; B[bb] |= bit;
        go();
        cells[best] = 0; R[rr] &= ~bit; C[cc] &= ~bit; B[bb] &= ~bit;
      }
    })();
    return { count: count, sol: sol };
  };
  /* solve with naked and hidden singles only; true if that finishes the grid */
  P.sudokuSingles = function (g, n) {
    var cells = g.slice(), full = (1 << (n + 1)) - 2, units = [], i, r, c;
    for (r = 0; r < n; r++) { var u = []; for (c = 0; c < n; c++) u.push(r * n + c); units.push(u); }
    for (c = 0; c < n; c++) { u = []; for (r = 0; r < n; r++) u.push(r * n + c); units.push(u); }
    for (var b = 0; b < n; b++) { u = []; for (i = 0; i < n * n; i++) if (boxOf(n, Math.floor(i / n), i % n) === b) u.push(i); units.push(u); }
    var peers = []; for (i = 0; i < n * n; i++) { var s = {}; units.forEach(function (un) { if (un.indexOf(i) >= 0) un.forEach(function (x) { if (x !== i) s[x] = 1; }); }); peers[i] = Object.keys(s).map(Number); }
    function cand(k) { var m = full; peers[k].forEach(function (p) { if (cells[p]) m &= ~(1 << cells[p]); }); return m; }
    var progress = true;
    while (progress) {
      progress = false;
      for (i = 0; i < n * n; i++) if (!cells[i]) { var m = cand(i); if (popcount(m) === 1) { cells[i] = bits(m)[0]; progress = true; } else if (!m) return false; }
      units.forEach(function (un) {
        for (var v = 1; v <= n; v++) {
          var spots = [], have = false;
          un.forEach(function (k) { if (cells[k] === v) have = true; else if (!cells[k] && (cand(k) & (1 << v))) spots.push(k); });
          if (!have && spots.length === 1) { cells[spots[0]] = v; progress = true; }
        }
      });
    }
    return cells.indexOf(0) < 0;
  };
  function sudokuSvg(n, vals, givens, label) {
    var s = 40, W = n * s + 4, out = '<rect x="2" y="2" width="' + (n * s) + '" height="' + (n * s) + '" fill="#fff"/>', b = BOX[n];
    for (var i = 0; i < n * n; i++) if (vals[i]) {
      var x = 2 + (i % n) * s + s / 2, y = 2 + Math.floor(i / n) * s + s / 2;
      out += P.txt(x, y + 1, vals[i], 24, 'text-anchor="middle" dominant-baseline="central"' + (givens && givens[i] ? ' font-weight="700"' : ' fill="#333" font-family="Georgia,serif" font-style="italic"'));
    }
    for (var k = 0; k <= n; k++) {
      out += P.line(2 + k * s, 2, 2 + k * s, 2 + n * s, k % b[1] === 0 ? 3 : 1);
      out += P.line(2, 2 + k * s, 2 + n * s, 2 + k * s, k % b[0] === 0 ? 3 : 1);
    }
    var w = n === 4 ? 2.0 : n === 6 ? 2.9 : 3.45;
    return P.svg(W, W, w, out, label);
  }
  P.add({
    key: 'sudoku',
    kinds: [['auto', 'Size to match the level'], ['4', '4 × 4'], ['6', '6 × 6'], ['9', '9 × 9']],
    cols: function (level, o) { var n = sizeFor(level, o); return n === 4 ? 3 : 2; },
    gen: function (rng, level, o) {
      var n = sizeFor(level, o);
      var target = { 4: { easy: 8, medium: 6, hard: 4 }, 6: { easy: 20, medium: 15, hard: 10 }, 9: { easy: 38, medium: 30, hard: 22 } }[n][level];
      return P.tryGen(rng, function (r) {
        var full = P.sudokuSolve(new Array(n * n).fill(0), n, 1, r).sol;
        var g = full.slice(), clues = n * n, order = r.shuffle(P.range(0, n * n));
        for (var j = 0; j < order.length && clues > target; j++) {
          var k = order[j], k2 = n * n - 1 - k, pair = (n === 9 && k2 !== k && g[k2]) ? [k, k2] : [k];
          if (!g[k]) continue;
          if (clues - pair.length < target && pair.length === 2) pair = [k];
          var keep = pair.map(function (x) { return g[x]; });
          pair.forEach(function (x) { g[x] = 0; });
          var ok = P.sudokuSolve(g, n, 2).count === 1 && (level === 'hard' || P.sudokuSingles(g, n));
          if (ok) clues -= pair.length; else pair.forEach(function (x, ii) { g[x] = keep[ii]; });
        }
        if (clues > target + (n === 9 ? 6 : 2)) return null;
        var givens = g.map(function (v) { return v ? 1 : 0; });
        return {
          q: sudokuSvg(n, g, givens, n + ' by ' + n + ' sudoku'), a: sudokuSvg(n, full, givens, 'sudoku answer'),
          sub: n + ' × ' + n + ' · ' + clues + ' clues',
          play: { kind: 'cells', n: n, box: BOX[n], givens: g, sol: full }, data: { n: n, g: g, sol: full, clues: clues }
        };
      });
    }
  });
  function sizeFor(level, o) { var k = o && o.kind; if (k === '4' || k === '6' || k === '9') return +k; return level === 'easy' ? 4 : level === 'medium' ? 6 : 9; }

  /* ================= Cage-sum squares ================= */
  function latin(n, r) {
    var g = new Array(n * n).fill(0);
    function ok(k, v) { var rr = Math.floor(k / n), cc = k % n; for (var i = 0; i < n; i++) { if (g[rr * n + i] === v || g[i * n + cc] === v) return false; } return true; }
    (function go(k) {
      if (k === n * n) return true;
      var vs = r.shuffle(P.range(1, n + 1));
      for (var j = 0; j < n; j++) if (ok(k, vs[j])) { g[k] = vs[j]; if (go(k + 1)) return true; g[k] = 0; }
      return false;
    })(0);
    return g;
  }
  function cageVal(op, vals) {
    if (op === '+') return vals.reduce(function (a, b) { return a + b; }, 0);
    if (op === '×') return vals.reduce(function (a, b) { return a * b; }, 1);
    var hi = Math.max(vals[0], vals[1]), lo = Math.min(vals[0], vals[1]);
    if (op === '−') return hi - lo;
    if (op === '÷') return hi % lo === 0 ? hi / lo : NaN;
    return vals[0];
  }
  P.cageVal = cageVal;
  /* cages: [{cells:[], op:'+', t:7}] ; count Latin fillings that satisfy all cages */
  P.cageSolve = function (n, cages, limit) {
    var g = new Array(n * n).fill(0), R = new Array(n).fill(0), C = new Array(n).fill(0), cageOf = [], count = 0, sol = null;
    cages.forEach(function (cg, ci) { cg.cells.forEach(function (x) { cageOf[x] = ci; }); });
    function cageOk(ci) {
      var cg = cages[ci], vals = [], empty = 0;
      cg.cells.forEach(function (x) { if (g[x]) vals.push(g[x]); else empty++; });
      if (!empty) return cageVal(cg.op, vals) === cg.t;
      if (cg.op === '+') { var s = vals.reduce(function (a, b) { return a + b; }, 0); return s + empty <= cg.t && s + empty * n >= cg.t; }
      if (cg.op === '×') { var p = vals.reduce(function (a, b) { return a * b; }, 1); return cg.t % p === 0; }
      return true;
    }
    (function go() {
      if (count >= limit) return;
      var best = -1, bestM = 0, bestN = 99, full = (1 << (n + 1)) - 2;
      for (var k = 0; k < n * n; k++) if (!g[k]) {
        var m = full & ~(R[Math.floor(k / n)] | C[k % n]), pc = popcount(m);
        if (pc < bestN) { bestN = pc; best = k; bestM = m; }
      }
      if (best < 0) { count++; if (!sol) sol = g.slice(); return; }
      var rr = Math.floor(best / n), cc = best % n;
      bits(bestM).forEach(function (v) {
        if (count >= limit) return;
        g[best] = v;
        if (cageOk(cageOf[best])) { R[rr] |= 1 << v; C[cc] |= 1 << v; go(); R[rr] &= ~(1 << v); C[cc] &= ~(1 << v); }
        g[best] = 0;
      });
    })();
    return { count: count, sol: sol };
  };
  function cageSvg(n, cages, vals, label) {
    var s = 56, W = n * s + 4, out = '<rect x="2" y="2" width="' + (n * s) + '" height="' + (n * s) + '" fill="#fff"/>', cageOf = [];
    cages.forEach(function (cg, ci) { cg.cells.forEach(function (x) { cageOf[x] = ci; }); });
    for (var k = 0; k <= n; k++) { out += P.line(2 + k * s, 2, 2 + k * s, 2 + n * s, 0.8, ' stroke-dasharray="3 3"'); out += P.line(2, 2 + k * s, 2 + n * s, 2 + k * s, 0.8, ' stroke-dasharray="3 3"'); }
    for (var i = 0; i < n * n; i++) {
      var r = Math.floor(i / n), c = i % n, x = 2 + c * s, y = 2 + r * s;
      if (r === 0 || cageOf[i - n] !== cageOf[i]) out += P.line(x, y, x + s, y, r === 0 ? 4 : 3.5);
      if (c === 0 || cageOf[i - 1] !== cageOf[i]) out += P.line(x, y, x, y + s, c === 0 ? 4 : 3.5);
      if (r === n - 1) out += P.line(x, y + s, x + s, y + s, 4);
      if (c === n - 1) out += P.line(x + s, y, x + s, y + s, 4);
      if (vals && vals[i]) out += P.txt(x + s / 2, y + s / 2 + 5, vals[i], 26, 'text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif"');
    }
    cages.forEach(function (cg) {
      var f = Math.min.apply(null, cg.cells), x = 2 + (f % n) * s, y = 2 + Math.floor(f / n) * s;
      out += '<text x="' + (x + 5) + '" y="' + (y + 16) + '" font-size="15" font-weight="700">' + cg.t + (cg.cells.length > 1 ? cg.op : '') + '</text>';
    });
    var w = n === 4 ? 2.6 : n === 5 ? 3.1 : 3.6;
    return P.svg(W, W, w, out, label);
  }
  P.add({
    key: 'cages',
    kinds: [['auto', 'Size to match the level'], ['4', '4 × 4'], ['5', '5 × 5'], ['6', '6 × 6']],
    cols: function () { return 2; },
    gen: function (rng, level, o) {
      var k = o && o.kind, n = (k === '4' || k === '5' || k === '6') ? +k : (level === 'easy' ? 4 : level === 'medium' ? 5 : 6);
      var ops = level === 'easy' ? ['+', '+', '−'] : level === 'medium' ? ['+', '−', '×'] : ['+', '−', '×', '÷', '×'];
      var sizes = level === 'easy' ? [1, 2, 2, 2, 3] : level === 'medium' ? [2, 2, 2, 3, 3] : [2, 2, 3, 3, 4];
      return P.tryGen(rng, function (r) {
        var g = latin(n, r), owner = new Array(n * n).fill(-1), cages = [], order = r.shuffle(P.range(0, n * n));
        order.forEach(function (st) {
          if (owner[st] >= 0) return;
          var want = r.pick(sizes), cells = [st]; owner[st] = cages.length;
          while (cells.length < want) {
            var nb = [];
            cells.forEach(function (x) {
              var rr = Math.floor(x / n), cc = x % n;
              [[rr - 1, cc], [rr + 1, cc], [rr, cc - 1], [rr, cc + 1]].forEach(function (p) { if (p[0] >= 0 && p[0] < n && p[1] >= 0 && p[1] < n && owner[p[0] * n + p[1]] < 0) nb.push(p[0] * n + p[1]); });
            });
            if (!nb.length) break;
            var pick = r.pick(nb); owner[pick] = cages.length; cells.push(pick);
          }
          var vals = cells.map(function (x) { return g[x]; }), op, t;
          if (cells.length === 1) { op = '='; t = vals[0]; }
          else if (cells.length === 2) {
            var tryOps = r.shuffle(ops);
            for (var j = 0; j < tryOps.length; j++) { var v = cageVal(tryOps[j], vals); if (v === v && v > 0) { op = tryOps[j]; t = v; break; } }
            if (!op) { op = '+'; t = cageVal('+', vals); }
          } else { op = (ops.indexOf('×') >= 0 && r.chance(0.4)) ? '×' : '+'; t = cageVal(op, vals); }
          cages.push({ cells: cells, op: op, t: t });
        });
        var singles = cages.filter(function (c) { return c.cells.length === 1; }).length;
        if (singles > (level === 'easy' ? 3 : 1)) return null;
        if (P.cageSolve(n, cages, 2).count !== 1) return null;
        return {
          q: cageSvg(n, cages, null, n + ' by ' + n + ' cage square'), a: cageSvg(n, cages, g, 'cage square answer'), sub: n + ' × ' + n,
          play: { kind: 'cells', n: n, givens: new Array(n * n).fill(0), sol: g, cages: cages }, data: { n: n, cages: cages, sol: g }
        };
      }, 3000);
    }
  });

  /* ================= Logic grids ================= */
  var NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Ella', 'Finn', 'Gia', 'Hugo', 'Ivy', 'Jack', 'Kai', 'Lena', 'Max', 'Nora', 'Owen', 'Rosa', 'Sam', 'Tess', 'Theo', 'Wes'];
  var CATS = [
    { key: 'pet', head: 'Pet', items: ['cat', 'dog', 'rabbit', 'parrot', 'goldfish', 'turtle', 'hamster'], pred: 'has the {x}', npred: "doesn't have the {x}", either: 'has either the {x} or the {y}', subj: 'the child with the {x}' },
    { key: 'color', head: 'Color', items: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], pred: 'likes {x} best', npred: "doesn't like {x} best", either: 'likes either {x} or {y} best', subj: 'the child who likes {x}' },
    { key: 'snack', head: 'Snack', items: ['apples', 'popcorn', 'pretzels', 'grapes', 'cheese', 'carrots'], pred: 'brought {x}', npred: "didn't bring {x}", either: 'brought either {x} or {y}', subj: 'the child who brought {x}' },
    { key: 'hobby', head: 'Hobby', items: ['chess', 'painting', 'soccer', 'piano', 'reading', 'baking', 'swimming'], pred: 'enjoys {x}', npred: "doesn't enjoy {x}", either: 'enjoys either {x} or {y}', subj: 'the child who enjoys {x}' }
  ];
  var AGE = { key: 'age', head: 'Age', ordinal: true, pred: 'is {x}', npred: 'is not {x}', either: 'is either {x} or {y}', subj: 'the {x}-year-old' };
  var NAMECAT = { key: 'name', head: 'Name', pred: 'is {x}', npred: 'is not {x}', either: 'is either {x} or {y}', subj: '{x}' };
  function perms(n) { var out = []; (function go(a, used) { if (a.length === n) { out.push(a.slice()); return; } for (var i = 0; i < n; i++) if (!used[i]) { used[i] = 1; a.push(i); go(a, used); a.pop(); used[i] = 0; } })([], []); return out; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  /* an assignment A is an array per category of item-index per person (category 0 = names, identity) */
  function personOf(A, c, i) { return A[c].indexOf(i); }
  P.lgEval = function (cl, A) {
    var p, q;
    switch (cl.t) {
      case 'pos': return A[cl.cb][personOf(A, cl.ca, cl.ia)] === cl.ib;
      case 'neg': return A[cl.cb][personOf(A, cl.ca, cl.ia)] !== cl.ib;
      case 'either': p = A[cl.cb][personOf(A, cl.ca, cl.ia)]; return p === cl.ib || p === cl.ib2;
      case 'neither': p = personOf(A, cl.ca, cl.ia); q = personOf(A, cl.ca2, cl.ia2); return p !== q && A[cl.cb][p] !== cl.ib && A[cl.cb][q] !== cl.ib;
      case 'older': p = personOf(A, cl.ca, cl.ia); q = personOf(A, cl.cb, cl.ib); return A[cl.age][p] > A[cl.age][q];
      case 'next': p = personOf(A, cl.ca, cl.ia); q = personOf(A, cl.cb, cl.ib); return A[cl.age][p] === A[cl.age][q] + 1;
    }
    return false;
  };
  P.lgCandidates = function (n, k) {
    var ps = perms(n), out = [[]];
    for (var c = 1; c < k; c++) { var nx = []; out.forEach(function (a) { ps.forEach(function (p) { nx.push(a.concat([p])); }); }); out = nx; }
    var id = P.range(0, n);
    return out.map(function (a) { return [id].concat(a); });
  };
  P.add({
    key: 'logicgrid', cols: 1,
    gen: function (rng, level) {
      var n = level === 'easy' ? 3 : 4, k = level === 'hard' ? 4 : 3;
      return P.tryGen(rng, function (r) {
        var cats = r.shuffle(CATS).slice(0, k - 1 - (level === 'easy' ? 0 : (r.chance(level === 'hard' ? 1 : 0.4) ? 1 : 0)));
        var useAge = cats.length < k - 1, ageStart = r.int(7, 9);
        var catDefs = [NAMECAT].concat(cats.map(function (c) { return { def: c, items: r.shuffle(c.items).slice(0, n) }; }).map(function (x) { var d = Object.assign({}, x.def); d.items = x.items; return d; }));
        if (useAge) { var ag = Object.assign({}, AGE); ag.items = P.range(0, n).map(function (i) { return String(ageStart + i); }); catDefs.push(ag); }
        catDefs[0] = Object.assign({}, NAMECAT, { items: r.shuffle(NAMES).slice(0, n).sort() });
        var ageC = useAge ? catDefs.length - 1 : -1;
        var sol = [P.range(0, n)]; for (var c = 1; c < k; c++) sol.push(r.shuffle(P.range(0, n)));
        /* clue pool */
        var pool = [];
        function who(c, i) { return personOf(sol, c, i); }
        for (var ca = 0; ca < k; ca++) for (var cb = 0; cb < k; cb++) if (ca !== cb) for (var ia = 0; ia < n; ia++) {
          if (ca === ageC && cb !== 0) continue;
          var pp = who(ca, ia), ib = sol[cb][pp];
          if (cb === 0 || ca !== 0 || true) pool.push({ t: 'pos', ca: ca, ia: ia, cb: cb, ib: ib, w: level === 'easy' ? 3 : level === 'medium' ? 1.2 : 0.5 });
          for (var j = 0; j < n; j++) if (j !== ib) {
            pool.push({ t: 'neg', ca: ca, ia: ia, cb: cb, ib: j, w: 1 });
            pool.push({ t: 'either', ca: ca, ia: ia, cb: cb, ib: r.chance(0.5) ? ib : j, ib2: 0, w: level === 'easy' ? 0.5 : 0.8, other: j, real: ib });
          }
        }
        pool.forEach(function (cl) { if (cl.t === 'either') { var a = [cl.real, cl.other]; if (r.chance(0.5)) a.reverse(); cl.ib = a[0]; cl.ib2 = a[1]; } });
        if (level !== 'easy') {
          for (ca = 0; ca < k; ca++) for (var ca2 = ca; ca2 < k; ca2++) for (ia = 0; ia < n; ia++) for (var ia2 = 0; ia2 < n; ia2++) {
            if (ca === ageC || ca2 === ageC) continue;
            var p1 = who(ca, ia), p2 = who(ca2, ia2);
            if (p1 === p2 || (ca === ca2 && ia2 <= ia)) continue;
            for (cb = 0; cb < k; cb++) if (cb !== ca && cb !== ca2) for (j = 0; j < n; j++) if (sol[cb][p1] !== j && sol[cb][p2] !== j && r.chance(0.3))
              pool.push({ t: 'neither', ca: ca, ia: ia, ca2: ca2, ia2: ia2, cb: cb, ib: j, w: 0.6 });
          }
        }
        if (ageC > 0) {
          for (ca = 0; ca < k; ca++) for (cb = 0; cb < k; cb++) if (ca !== ageC && cb !== ageC) for (ia = 0; ia < n; ia++) for (ib = 0; ib < n; ib++) {
            var a1 = who(ca, ia), a2 = who(cb, ib); if (a1 === a2) continue;
            var d = sol[ageC][a1] - sol[ageC][a2];
            if (d > 0) pool.push({ t: d === 1 ? 'next' : 'older', ca: ca, ia: ia, cb: cb, ib: ib, age: ageC, w: 1.4 });
            if (d === 1) pool.push({ t: 'older', ca: ca, ia: ia, cb: cb, ib: ib, age: ageC, w: 1 });
          }
        }
        /* pick clues weighted at random until one solution is left */
        var keyed = pool.map(function (cl) { return { cl: cl, key: Math.pow(r.next(), 1 / cl.w) }; }).sort(function (a, b) { return b.key - a.key; });
        var cands = P.lgCandidates(n, k), chosen = [];
        for (var t = 0; t < keyed.length && cands.length > 1; t++) {
          var cl = keyed[t].cl, nx = cands.filter(function (A) { return P.lgEval(cl, A); });
          if (nx.length < cands.length) { cands = nx; chosen.push(cl); }
        }
        if (cands.length !== 1) return null;
        /* drop clues that are not needed */
        var all = P.lgCandidates(n, k);
        for (var x = chosen.length - 1; x >= 0; x--) {
          var rest = chosen.slice(0, x).concat(chosen.slice(x + 1));
          var cnt = 0; for (var y = 0; y < all.length && cnt < 2; y++) { var A = all[y], ok = true; for (var z = 0; z < rest.length && ok; z++) ok = P.lgEval(rest[z], A); if (ok) cnt++; }
          if (cnt === 1) chosen = rest;
        }
        var maxClues = level === 'easy' ? 6 : level === 'medium' ? 9 : 12;
        if (chosen.length > maxClues || chosen.length < 3) return null;
        chosen = r.shuffle(chosen);
        var texts = chosen.map(function (cl) { return clueText(cl, catDefs); });
        return {
          q: lgPuzzle(catDefs, n, texts), a: lgAnswer(catDefs, n, sol),
          sub: n + ' children · ' + (k - 1) + ' things to match',
          play: { kind: 'lgrid', n: n, k: k, sol: sol },
          data: { n: n, k: k, sol: sol, clues: chosen, texts: texts, cats: catDefs.map(function (c) { return { head: c.head, items: c.items }; }) }
        };
      }, 600);
    }
  });
  function subj(cd, i) { return cd.subj.replace('{x}', cd.items[i]); }
  function pred(cd, i) { return cd.pred.replace('{x}', cd.items[i]); }
  function clueText(cl, cds) {
    var A = cds[cl.ca], B = cds[cl.cb];
    switch (cl.t) {
      case 'pos': return cap(subj(A, cl.ia)) + ' ' + pred(B, cl.ib) + '.';
      case 'neg': return cap(subj(A, cl.ia)) + ' ' + B.npred.replace('{x}', B.items[cl.ib]) + '.';
      case 'either': return cap(subj(A, cl.ia)) + ' ' + B.either.replace('{x}', B.items[cl.ib]).replace('{y}', B.items[cl.ib2]) + '.';
      case 'neither': return 'Neither ' + subj(A, cl.ia) + ' nor ' + subj(cds[cl.ca2], cl.ia2) + ' ' + pred(B, cl.ib) + '.';
      case 'older': return cap(subj(A, cl.ia)) + ' is older than ' + subj(B, cl.ib) + '.';
      case 'next': return cap(subj(A, cl.ia)) + ' is exactly one year older than ' + subj(B, cl.ib) + '.';
    }
    return '';
  }
  P.lgClueText = clueText;
  function lgGrid(cds, n) {
    var k = cds.length, cols = P.range(1, k), rows = [0].concat(P.range(2, k).reverse());
    var h = '<table class="pz-lg" aria-label="logic grid"><thead><tr><th class="pz-lgcorner" colspan="2" rowspan="2"></th>';
    cols.forEach(function (c) { h += '<th class="pz-lgcat" colspan="' + n + '">' + esc(cds[c].head) + '</th>'; });
    h += '</tr><tr>';
    cols.forEach(function (c) { cds[c].items.forEach(function (it, i) { h += '<th class="pz-lgv' + (i === 0 ? ' pz-lgb' : '') + '"><span>' + esc(it) + '</span></th>'; }); });
    h += '</tr></thead><tbody>';
    rows.forEach(function (rc) {
      cds[rc].items.forEach(function (it, i) {
        h += '<tr' + (i === 0 ? ' class="pz-lgtop"' : '') + '>';
        if (i === 0) h += '<th class="pz-lgrcat" rowspan="' + n + '"><span>' + esc(cds[rc].head) + '</span></th>';
        h += '<th class="pz-lgh">' + esc(it) + '</th>';
        cols.forEach(function (c) {
          var show = rc === 0 || c < rc;
          for (var j = 0; j < n; j++) h += show ? '<td class="pz-lgc' + (j === 0 ? ' pz-lgb' : '') + '" data-r="' + rc + '.' + i + '" data-c="' + c + '.' + j + '"></td>' : '<td class="pz-lgx"></td>';
        });
        h += '</tr>';
      });
    });
    return h + '</tbody></table>';
  }
  function lgPuzzle(cds, n, texts) {
    return '<div class="pz-lgwrap"><ol class="pz-clues">' + texts.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' + lgGrid(cds, n) + '</div>' + lgTable(cds, n, null);
  }
  function lgTable(cds, n, sol) {
    var h = '<table class="pz-lgans" aria-label="answer table"><tr>' + cds.map(function (c) { return '<th>' + esc(c.head) + '</th>'; }).join('') + '</tr>';
    for (var p = 0; p < n; p++) h += '<tr>' + cds.map(function (c, ci) { return '<td>' + (ci === 0 ? esc(c.items[p]) : sol ? esc(c.items[sol[ci][p]]) : '') + '</td>'; }).join('') + '</tr>';
    return h + '</table>';
  }
  function lgAnswer(cds, n, sol) { return lgTable(cds, n, sol); }

  /* ================= Picture logic (nonograms) ================= */
  var PICS = {
    easy: [
      ['heart', '.##..##.|########|########|########|.######.|..####..|...##...|........'],
      ['house', '...##...|..####..|.######.|########|.#....#.|.#.##.#.|.#.##.#.|.######.'],
      ['rook', '#.#..#.#|########|.######.|..####..|..####..|..####..|.######.|########'],
      ['cup', '........|#######.|#.....##|#.....#.|#.....##|.#####..|..###...|.#####..'],
      ['fish', '........|...###..|#.#####.|######.#|#.######|...###..|........|........'],
      ['tree', '...##...|..####..|.######.|..####..|.######.|########|...##...|..####..'],
      ['smiling face', '.######.|##....##|#.#..#.#|#......#|#......#|#.####.#|##....##|.######.'],
      ['mushroom', '..####..|.######.|##.##.##|########|...##...|...##...|..####..|........'],
      ['duck', '..##....|.#.##...|####....|..#.....|.######.|########|.######.|..####..']
    ],
    medium: [
      ['cat', '#......#..|##....##..|#.####.#..|#......#..|#.#..#.#..|#......#..|.#.##.#...|..####....|.######...|########..'],
      ['umbrella', '....##....|..######..|.########.|##########|#.#.##.#.#|....#.....|....#.....|....#.....|.#..#.....|..##......'],
      ['mug', '..........|.#######..|.#.....###|.#.....#.#|.#.....#.#|.#.....###|.#.....#..|..#####...|##########|..........'],
      ['key', '..........|..........|.####.....|##..##....|#....#####|##..##.#.#|.####..#.#|..........|..........|..........'],
      ['apple', '.....#....|....#.....|.###.###..|##########|##########|##########|##########|.########.|.########.|..##..##..'],
      ['boat', '....#.....|....##....|....###...|....####..|....#####.|....#.....|##########|.########.|..######..|..........'],
      ['bell', '....##....|...####...|..######..|..######..|..######..|.########.|.########.|##########|..........|....##....'],
      ['star', '....##....|....##....|...####...|##########|.########.|..######..|..######..|.###..###.|.##....##.|##......##'],
      ['pine tree', '....##....|...####...|..######..|...####...|..######..|.########.|..######..|.########.|##########|....##....']
    ],
    hard: [
      ['rook', '..##..##..##...|..##..##..##...|..##########...|...########....|....######.....|....######.....|....######.....|....######.....|....######.....|...########....|..##########...|.############..|.############..|...............|...............'],
      ['owl', '..#.......#....|..##.....##....|..#########....|.##.##.##.##...|.#.#..#..#.#...|.##.##.##.##...|..#...#...#....|..#..###..#....|..#.......#....|..#.#.#.#.#....|..#.......#....|...#.#.#.#.....|....#####......|....#...#......|...##...##.....'],
      ['sailboat', '.......#.......|.......##......|.......###.....|......####.....|.....#.####....|....##.#####...|...###.######..|..####.#######.|.......#.......|###############|.#############.|..###########..|...#########...|...............|.###.###.###.##'],
      ['teacup', '...............|....#..#..#....|.....#..#..#...|....#..#..#....|...............|.###########...|.#.........###.|.#.........#.#.|.#.........#.#.|.#.........###.|..#.......#....|...#######.....|#############..|.###########...|...............']
    ]
  };
  P.PICS = PICS;
  function parsePic(s) { return s.split('|').map(function (row) { return row.split('').map(function (ch) { return ch === '#' ? 1 : 0; }); }); }
  function clueOf(line) { var out = [], run = 0; line.forEach(function (v) { if (v) run++; else if (run) { out.push(run); run = 0; } }); if (run) out.push(run); return out.length ? out : [0]; }
  P.nonoClues = function (g) {
    var h = g.length, w = g[0].length, rows = g.map(clueOf), cols = [];
    for (var c = 0; c < w; c++) { var col = []; for (var r = 0; r < h; r++) col.push(g[r][c]); cols.push(clueOf(col)); }
    return { rows: rows, cols: cols };
  };
  /* line logic: line holds -1 unknown, 0 empty, 1 filled; returns improved line or null */
  function solveLine(clue, line) {
    var n = line.length, blocks = clue[0] === 0 ? [] : clue, canF = new Array(n).fill(false), canE = new Array(n).fill(false), any = false;
    var memo = {};
    function place(bi, pos, arr) {
      var key = bi + ',' + pos; if (memo[key] === false) return false;
      if (bi === blocks.length) {
        for (var i = pos; i < n; i++) if (line[i] === 1) { memo[key] = false; return false; }
        for (i = 0; i < n; i++) { if (i < pos ? arr[i] : false) canF[i] = true; else canE[i] = true; }
        any = true; return true;
      }
      var len = blocks[bi], rest = 0; for (var b = bi + 1; b < blocks.length; b++) rest += blocks[b] + 1;
      var found = false;
      for (var st = pos; st + len + rest <= n; st++) {
        if (st > pos && line[st - 1] === 1) break;
        var ok = true; for (var k = st; k < st + len; k++) if (line[k] === 0) { ok = false; break; }
        if (!ok) continue;
        if (st + len < n && line[st + len] === 1) continue;
        var a2 = arr.slice(); for (k = pos; k < st; k++) a2[k] = 0; for (k = st; k < st + len; k++) a2[k] = 1; if (st + len < n) a2[st + len] = 0;
        if (place(bi + 1, Math.min(n, st + len + 1), a2)) found = true;
      }
      if (!found) memo[key] = false;
      return found;
    }
    place(0, 0, new Array(n).fill(0));
    if (!any) return null;
    return line.map(function (v, i) { return canF[i] && !canE[i] ? 1 : (!canF[i] && canE[i] ? 0 : v); });
  }
  P.nonoLineSolve = function (cl, h, w) {
    var g = []; for (var r = 0; r < h; r++) g.push(new Array(w).fill(-1));
    var changed = true;
    while (changed) {
      changed = false;
      for (r = 0; r < h; r++) { var nl = solveLine(cl.rows[r], g[r]); if (!nl) return null; for (var c = 0; c < w; c++) if (nl[c] !== g[r][c]) { g[r][c] = nl[c]; changed = true; } }
      for (c = 0; c < w; c++) {
        var col = []; for (r = 0; r < h; r++) col.push(g[r][c]);
        nl = solveLine(cl.cols[c], col); if (!nl) return null;
        for (r = 0; r < h; r++) if (nl[r] !== g[r][c]) { g[r][c] = nl[r]; changed = true; }
      }
    }
    for (r = 0; r < h; r++) for (c = 0; c < w; c++) if (g[r][c] < 0) return null;
    return g;
  };
  function nonoSvg(cl, g, label, isKey, cellIn) {
    var h = cl.rows.length, w = cl.cols.length, s = w <= 8 ? 30 : w <= 10 ? 27 : 22, fs = s * 0.55;
    var maxR = Math.max.apply(null, cl.rows.map(function (x) { return x.length; })), maxC = Math.max.apply(null, cl.cols.map(function (x) { return x.length; }));
    var cw = fs * 1.05, left = maxR * cw + 8, top = maxC * fs * 1.15 + 8, W = left + w * s + 3, H = top + h * s + 3, out = '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    cl.rows.forEach(function (rc, r) { rc.forEach(function (v, i) { out += P.txt(left - 6 - (rc.length - 1 - i) * cw, top + r * s + s / 2, v === 0 && rc.length === 1 ? '0' : v, fs, 'text-anchor="end" dominant-baseline="central"'); }); });
    cl.cols.forEach(function (cc, c) { cc.forEach(function (v, i) { out += P.txt(left + c * s + s / 2, top - 6 - (cc.length - 1 - i) * fs * 1.15 - fs * 0.4, v, fs); }); });
    if (g) for (var r = 0; r < h; r++) for (var c = 0; c < w; c++) if (g[r][c] === 1) out += '<rect x="' + (left + c * s) + '" y="' + (top + r * s) + '" width="' + s + '" height="' + s + '" fill="#000"/>';
    for (var k = 0; k <= w; k++) out += P.line(left + k * s, isKey ? top : 2, left + k * s, top + h * s, k % 5 === 0 || k === w ? 2.2 : 0.8);
    for (k = 0; k <= h; k++) out += P.line(isKey ? left : 2, top + k * s, left + w * s, top + k * s, k % 5 === 0 || k === h ? 2.2 : 0.8);
    return P.svg(W, H, (cellIn * W / s).toFixed(2), out, label);
  }
  P.add({
    key: 'nonogram',
    sig: function (d) { return d.g ? JSON.stringify(d.g) : null; },
    kinds: [['auto', 'Size to match the level'], ['5', '5 × 5'], ['8', '8 × 8'], ['10', '10 × 10'], ['15', '15 × 15']],
    cols: function (level, o) { var z = nonoSize(level, o); return z <= 8 ? 2 : z === 10 ? 2 : 1; },
    gen: function (rng, level, o, idx) {
      var size = nonoSize(level, o);
      return P.tryGen(rng, function (r, t) {
        var g, name = null, lib = { 8: PICS.easy, 10: PICS.medium, 15: PICS.hard }[size];
        if (lib && t < 3 && r.chance(0.65)) { var pk = lib[(idx + r.int(0, lib.length - 1)) % lib.length]; g = parsePic(pk[1]); name = pk[0]; if (r.chance(0.5)) g = g.map(function (row) { return row.slice().reverse(); }); }
        else {
          var dens = size <= 5 ? 0.55 : 0.58; g = [];
          for (var y = 0; y < size; y++) { var row = []; for (var x = 0; x < size; x++) row.push(r.chance(dens) ? 1 : 0); g.push(row); }
          if (size > 5) g = g.map(function (row, y) { return row.map(function (v, x) { var s = 0, c = 0; for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var yy = y + dy, xx = x + dx; if (yy >= 0 && yy < size && xx >= 0 && xx < size) { s += g[yy][xx]; c++; } } return s * 2 > c ? 1 : (s * 2 === c ? v : 0); }); });
          var filled = g.reduce(function (a, row) { return a + row.reduce(function (b, v) { return b + v; }, 0); }, 0);
          if (filled < size * size * 0.35 || filled > size * size * 0.75) return null;
        }
        var cl = P.nonoClues(g), solved = P.nonoLineSolve(cl, g.length, g[0].length);
        if (!solved) return null;
        return {
          q: nonoSvg(cl, null, 'picture logic puzzle', false, size <= 8 ? 0.3 : size === 10 ? 0.25 : 0.32), a: nonoSvg(cl, g, 'picture logic answer', true, size <= 10 ? 0.15 : 0.13) + (name ? '<p class="pz-cap">It’s a ' + esc(name) + '!</p>' : ''),
          sub: g[0].length + ' × ' + g.length,
          play: { kind: 'nono', g: g, clues: cl }, data: { g: g, clues: cl, name: name }
        };
      });
    }
  });
  function nonoSize(level, o) { var k = o && o.kind; if (k === '5' || k === '8' || k === '10' || k === '15') return +k; return level === 'easy' ? 8 : level === 'medium' ? 10 : 15; }

  /* ================= Letter arithmetic (cryptarithms) ================= */
  P.cryptoSolve = function (words, sum, fixed, limit) {
    /* words: array of strings (addends), sum: string. fixed: {L: digit}. Count digit maps (distinct digits, no leading zero). */
    var all = words.concat([sum]), maxLen = sum.length, letters = [], lead = {};
    all.forEach(function (w) { lead[w[0]] = 1; });
    for (var col = 0; col < maxLen; col++) {
      all.forEach(function (w) { var ch = w[w.length - 1 - col]; if (ch && letters.indexOf(ch) < 0) letters.push(ch); });
    }
    var val = {}, used = new Array(10).fill(false), count = 0, sol = null;
    for (var f in fixed) { val[f] = fixed[f]; used[fixed[f]] = true; }
    function colCheck(col, carry) {
      if (col === maxLen) return carry === 0;
      var s = carry;
      for (var i = 0; i < words.length; i++) { var ch = words[i][words[i].length - 1 - col]; if (ch) s += val[ch]; }
      if (s % 10 !== val[sum[sum.length - 1 - col]]) return false;
      return colCheck(col + 1, Math.floor(s / 10));
    }
    /* letters are ordered by column, so after assigning all letters of col 0..c we can check those columns */
    var colDone = [];
    for (col = 0; col < maxLen; col++) {
      var mx = -1; all.forEach(function (w) { var ch = w[w.length - 1 - col]; if (ch) mx = Math.max(mx, letters.indexOf(ch)); });
      colDone.push(mx);
    }
    function partial(k) {
      var carry = 0;
      for (var c = 0; c < maxLen; c++) {
        if (colDone[c] > k) return true;
        var s = carry; for (var i = 0; i < words.length; i++) { var ch = words[i][words[i].length - 1 - c]; if (ch) s += val[ch]; }
        if (s % 10 !== val[sum[sum.length - 1 - c]]) return false;
        carry = Math.floor(s / 10);
      }
      return carry === 0;
    }
    (function go(k) {
      if (count >= limit) return;
      if (k === letters.length) { if (colCheck(0, 0)) { count++; if (!sol) sol = Object.assign({}, val); } return; }
      var L = letters[k];
      if (L in fixed) { if (partial(k)) go(k + 1); return; }
      for (var d = lead[L] ? 1 : 0; d < 10; d++) {
        if (used[d]) continue;
        used[d] = true; val[L] = d;
        if (partial(k)) go(k + 1);
        used[d] = false; delete val[L];
      }
    })(0);
    return { count: count, sol: sol };
  };
  P.add({
    key: 'crypto', cols: 2,
    gen: function (rng, level) {
      return P.tryGen(rng, function (r) {
        var digits = level === 'easy' ? 2 : 3, nAdd = level === 'hard' && r.chance(0.5) ? 3 : 2, maxHints = level === 'easy' ? 3 : level === 'medium' ? 2 : 1;
        if (level === 'hard' && nAdd === 2) digits = 4;
        var nums = []; for (var i = 0; i < nAdd; i++) nums.push(r.int(Math.pow(10, digits - 1), Math.pow(10, digits) - 1));
        var total = nums.reduce(function (a, b) { return a + b; }, 0);
        var letters = r.shuffle('ABCDEFGHJKLMNPRSTUWY'.split('')).slice(0, 10), map = {}, inv = {};
        String(nums.join('') + total).split('').forEach(function (ch) { if (!(ch in map)) { map[ch] = letters[Object.keys(map).length]; } });
        Object.keys(map).forEach(function (dg) { inv[map[dg]] = +dg; });
        function enc(x) { return String(x).split('').map(function (ch) { return map[ch]; }).join(''); }
        var words = nums.map(enc), sum = enc(total), fixed = {}, used = Object.keys(inv);
        var res = P.cryptoSolve(words, sum, fixed, 2), order = r.shuffle(used);
        for (var h = 0; res.count > 1 && h < maxHints; h++) { fixed[order[h]] = inv[order[h]]; res = P.cryptoSolve(words, sum, fixed, 2); }
        if (res.count !== 1) return null;
        if (level !== 'easy' && Object.keys(fixed).length === 0 && used.length < 5) return null;
        var w = Math.max(sum.length, words[0].length + 1);
        function stack(ws, s) {
          var lines = ws.map(function (x, ii) { return '<div><span class="pz-op">' + (ii === ws.length - 1 ? '+' : '') + '</span>' + esc(x) + '</div>'; });
          return '<div class="pz-stack" style="--w:' + (w + 1) + '">' + lines.join('') + '<div class="pz-sum">' + esc(s) + '</div></div>';
        }
        var hints = Object.keys(fixed).sort().map(function (L) { return L + ' = ' + fixed[L]; });
        var q = stack(words, sum) + '<p class="pz-note">Each letter stands for one digit (0–9). Different letters, different digits. No number starts with 0.' + (hints.length ? ' <b>Hint: ' + hints.join(', ') + '.</b>' : '') + '</p>';
        var key = Object.keys(inv).sort().map(function (L) { return L + '=' + inv[L]; }).join(' ');
        var a = stack(nums.map(String), String(total)) + '<p class="pz-cap">' + key + '</p>';
        return { q: q, a: a, data: { words: words, sum: sum, fixed: fixed, nums: nums, total: total, inv: inv } };
      });
    }
  });

  /* ================= Brainteasers ================= */
  function bridge(times) {
    /* Dijkstra over (who is on the start side, lantern side) */
    var n = times.length, start = (1 << n) - 1, best = {}, prev = {}, q = [[0, start, 0]];
    best[start + ',0'] = 0;
    while (q.length) {
      q.sort(function (a, b) { return a[0] - b[0]; });
      var cur = q.shift(), d = cur[0], m = cur[1], side = cur[2], key = m + ',' + side;
      if (d > best[key]) continue;
      if (m === 0) return { time: d, path: trace(key) };
      var here = side === 0 ? m : (start & ~m), moves = [];
      for (var i = 0; i < n; i++) if (here & (1 << i)) { moves.push([i]); for (var j = i + 1; j < n; j++) if (here & (1 << j)) moves.push([i, j]); }
      moves.forEach(function (mv) {
        if (side === 0 && mv.length === 1 && n > 1) return;
        if (side === 1 && mv.length === 2) return;
        var bit = mv.reduce(function (a, x) { return a | (1 << x); }, 0), nm = side === 0 ? m & ~bit : m | bit, ns = 1 - side;
        var nd = d + Math.max.apply(null, mv.map(function (x) { return times[x]; })), nk = nm + ',' + ns;
        if (!(nk in best) || nd < best[nk]) { best[nk] = nd; prev[nk] = [key, mv, side]; q.push([nd, nm, ns]); }
      });
    }
    function trace(k) { var out = []; while (prev[k]) { out.unshift({ who: prev[k][1], dir: prev[k][2] }); k = prev[k][0]; } return out; }
    return null;
  }
  P.bridge = bridge;
  function jugs(a, b, t) {
    var start = '0,0', prev = {}, seen = {}, q = [[0, 0]]; seen[start] = 1;
    while (q.length) {
      var s = q.shift(), x = s[0], y = s[1];
      if (x === t || y === t) { var path = [], k = x + ',' + y; while (prev[k]) { path.unshift(prev[k][1]); k = prev[k][0]; } return path; }
      var px = Math.min(x, b - y), py = Math.min(y, a - x);
      [[a, y, 'Fill the ' + a + '-liter jug.'], [x, b, 'Fill the ' + b + '-liter jug.'], [0, y, 'Empty the ' + a + '-liter jug.'], [x, 0, 'Empty the ' + b + '-liter jug.'],
        [x - px, y + px, 'Pour the ' + a + '-liter jug into the ' + b + '-liter jug.'], [x + py, y - py, 'Pour the ' + b + '-liter jug into the ' + a + '-liter jug.']].forEach(function (mv) {
        var nk = mv[0] + ',' + mv[1];
        if (!seen[nk]) { seen[nk] = 1; prev[nk] = [x + ',' + y, mv[2] + ' (' + a + '-L: ' + mv[0] + ', ' + b + '-L: ' + mv[1] + ')']; q.push([mv[0], mv[1]]); }
      });
    }
    return null;
  }
  P.jugs = jugs;
  var RIVER = [
    { items: ['fox', 'goose', 'bag of beans'], eats: [[0, 1], [1, 2]], verb: ['would chase', 'would peck open'] },
    { items: ['dog', 'cat', 'pot of cream'], eats: [[0, 1], [1, 2]], verb: ['would chase', 'would lap up'] },
    { items: ['wolf', 'goat', 'cabbage'], eats: [[0, 1], [1, 2]], verb: ['would chase', 'would munch'] },
    { items: ['cat', 'mouse', 'wedge of cheese'], eats: [[0, 1], [1, 2]], verb: ['would chase', 'would nibble'] }
  ];
  function river(nItems, conflicts, cap) {
    /* state: bitmask of items on start side + farmer side; returns shortest list of trips */
    var all = (1 << nItems) - 1, start = all + ',0', seen = {}, prev = {}, q = [[all, 0]]; seen[start] = 1;
    function safe(m) { for (var i = 0; i < conflicts.length; i++) { var c = conflicts[i]; if ((m >> c[0] & 1) && (m >> c[1] & 1)) return false; } return true; }
    while (q.length) {
      var s = q.shift(), m = s[0], side = s[1];
      if (m === 0 && side === 1) { var path = [], k = m + ',' + side; while (prev[k]) { path.unshift(prev[k][1]); k = prev[k][0]; } return path; }
      var here = side === 0 ? m : all & ~m, loads = [[]];
      for (var i = 0; i < nItems; i++) if (here >> i & 1) { loads.push([i]); if (cap > 1) for (var j = i + 1; j < nItems; j++) if (here >> j & 1) loads.push([i, j]); }
      loads.forEach(function (ld) {
        var bit = ld.reduce(function (a, x) { return a | (1 << x); }, 0), nm = side === 0 ? m & ~bit : m | bit, ns = 1 - side;
        var left = ns === 1 ? nm : all & ~nm; /* the side the farmer just left */
        if (!safe(left)) return;
        var nk = nm + ',' + ns;
        if (!seen[nk]) { seen[nk] = 1; prev[nk] = [m + ',' + side, { load: ld, dir: side }]; q.push([nm, ns]); }
      });
    }
    return null;
  }
  P.river = river;
  P.add({
    key: 'classics', cols: 1,
    kinds: [['auto', 'Mixed'], ['bridge', 'Night bridge'], ['jugs', 'Water jugs'], ['river', 'River crossing'], ['coins', 'Coin weighing']],
    gen: function (rng, level, o) {
      var type = (o && o.kind && o.kind !== 'auto') ? o.kind : P.cycle(o, arguments[3], ['bridge', 'jugs', 'river', 'coins'], 'cl');
      return P.tryGen(rng, function (r) {
        if (type === 'bridge') {
          var n = level === 'easy' ? 3 : level === 'medium' ? 4 : 5, times = [];
          while (times.length < n) { var t = r.int(1, level === 'easy' ? 8 : 15); if (times.indexOf(t) < 0) times.push(t); }
          times.sort(function (a, b) { return a - b; });
          if (n >= 4 && !(2 * times[1] < times[0] + times[n - 2])) return null;
          var who = r.shuffle(NAMES).slice(0, n), res = bridge(times);
          var q = '<p>' + ['Three', 'Four', 'Five'][n - 3] + ' friends reach an old rope bridge after dark. They have one lantern, and nobody may step onto the bridge without it. The bridge holds at most two people at a time. When two walk together, they go at the slower person’s pace.</p><p>Time to cross: ' +
            who.map(function (w, i) { return '<b>' + w + '</b> ' + times[i] + ' min'; }).join(', ') + '.</p><p><b>What is the shortest time for everyone to get across?</b></p>';
          var a = '<b>' + res.time + ' minutes.</b> ' + res.path.map(function (s) { return s.who.map(function (x) { return who[x]; }).join(' and ') + (s.dir === 0 ? ' cross' : ' bring' + (s.who.length === 1 ? 's' : '') + ' the lantern back') + ' (' + Math.max.apply(null, s.who.map(function (x) { return times[x]; })) + ')'; }).join('; ') + '.';
          return { q: q, a: a, ans: [{ label: 'Minutes', value: String(res.time) }], sub: 'Night bridge', data: { type: 'bridge', times: times, time: res.time } };
        }
        if (type === 'jugs') {
          var A = r.int(2, level === 'easy' ? 5 : 9), B = r.int(A + 1, level === 'easy' ? 7 : 13), T = r.int(1, B - 1);
          if (T === A) return null;
          var path = jugs(A, B, T); if (!path) return null;
          var lo = level === 'easy' ? 2 : level === 'medium' ? 5 : 8, hi = level === 'easy' ? 4 : level === 'medium' ? 7 : 20;
          if (path.length < lo || path.length > hi) return null;
          return {
            q: '<p>You are at a spring with two empty jugs. One holds exactly <b>' + A + ' liters</b> and the other holds exactly <b>' + B + ' liters</b>. Neither has any marks on it. You may fill a jug to the top, empty it out, or pour one jug into the other until the first is empty or the second is full.</p><p><b>How can you end up with exactly ' + T + ' liter' + (T > 1 ? 's' : '') + ' in one jug?</b> Try to use as few steps as you can.</p>',
            a: '<b>' + path.length + ' steps:</b> ' + path.map(function (s, i) { return (i + 1) + '. ' + esc(s); }).join(' '), sub: 'Water jugs', data: { type: 'jugs', A: A, B: B, T: T, steps: path.length }
          };
        }
        if (type === 'river') {
          var set = r.pick(RIVER), res2 = river(3, set.eats, 1);
          var it = set.items, far = r.pick(['A farmer', 'A shepherd', 'A traveler', 'A miller']);
          var q2 = '<p>' + far + ' has to bring a ' + it[0] + ', a ' + it[1] + ' and a ' + it[2] + ' across a river. The little boat holds the ' + far.split(' ')[1] + ' and just one of them. If they are left alone together, the ' + it[0] + ' ' + set.verb[0] + ' the ' + it[1] + ', and the ' + it[1] + ' ' + set.verb[1] + ' the ' + it[2] + '. Nothing goes wrong while the ' + far.split(' ')[1] + ' is there.</p><p><b>How can everything get across safely? What is the fewest number of boat trips?</b></p>';
          var a2 = '<b>' + res2.length + ' trips:</b> ' + res2.map(function (s, i) { return (i + 1) + '. ' + (s.load.length ? 'take the ' + it[s.load[0]] : 'go alone') + (s.dir === 0 ? ' across' : ' back'); }).join(', ') + '.';
          if (level === 'hard') {
            var third = res2[2] && res2[2].load[0], other = third === 0 ? 2 : 0;
            q2 += '<p><b>Bonus:</b> there are two different ways to do it in the fewest trips. Can you find both?</p>';
            a2 += ' The other way: on trip 3 take the ' + it[other] + ' instead, and bring the ' + it[third] + ' over on trip 5.';
          }
          return { q: q2, a: a2, ans: [{ label: 'Trips', value: String(res2.length) }], sub: 'River crossing', data: { type: 'river', trips: res2.length, path: res2, set: set } };
        }
        var nC = level === 'easy' ? r.int(3, 9) : level === 'medium' ? r.int(10, 27) : r.int(28, 81);
        var w = 0, p3 = 1; while (p3 < nC) { p3 *= 3; w++; }
        var g1 = Math.ceil(nC / 3);
        var rest = nC - 2 * g1;
        var plan = 'Put ' + g1 + ' coin' + (g1 > 1 ? 's' : '') + ' on each pan' + (rest > 0 ? ' and keep the other ' + rest + ' off the scale' : '') + '. If one pan goes down, the fake is there' + (rest > 0 ? '; if they balance, it is in the group you kept off' : '') + '. Then do the same with the coins that are left. Each weighing leaves at most a third of the suspects. ' + w + ' weighing' + (w > 1 ? 's' : '') + ' can find the fake among up to ' + Math.pow(3, w) + ' coins' + (w > 1 ? ', but ' + (w - 1) + ' can only handle ' + Math.pow(3, w - 1) : '') + '.';
        if (rest < 0) return null;
        return {
          q: '<p>You have <b>' + nC + ' coins</b> that look exactly alike. One of them is a fake that is a little <b>heavier</b> than the rest. You have a balance scale with two pans and no weights.</p><p><b>What is the fewest number of weighings that will always find the fake coin?</b></p>',
          a: '<b>' + w + '.</b> ' + esc(plan), ans: [{ label: 'Weighings', value: String(w) }], sub: 'Coin weighing', data: { type: 'coins', n: nC, w: w }
        };
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
