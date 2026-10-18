/* Cube Solver: a 4×4 solver by reduction (TRBCube.four), written for this site.
   1. Centers, in three searches with exact distance tables on where the center colors sit:
      A. the two colors for one axis onto that pair of faces (any mix), using all outer and wide turns;
      B. the next two colors onto the next pair of faces, with turns that keep A;
      C. every center onto its own face, with outer turns and wide half turns only.
   2. Edges: each wing has a partner with the same two colors. Short "slice, swap, slice back" moves
      (a wide turn, three outer turns, the wide turn undone) pair them up, chosen by a greedy search that
      keeps the centers and the edges already paired. The last two use a last-two-edges algorithm.
   3. Parity: if the result is a 3×3 with one flipped edge (OLL parity) or two swapped edges (PLL parity),
      a fixed algorithm fixes it.
   4. Solve the result like a 3×3 with the two-phase solver, turning only the outer layers. */
(function (G) {
  'use strict';
  var NS = G.TRBCube, th = NS.three, MVs = NS.moves, M = NS.model(4), M3 = NS.model(3);
  var N = 4, NN = 16, GROUP = [0, 3, 1, 4, 2, 5]; // center bit groups: U D R L F B
  var BIT = new Int8Array(96).fill(-1), STK = [];
  GROUP.forEach(function (f, g) { for (var r = 1; r <= 2; r++) for (var c = 1; c <= 2; c++) { var i = M.idx(f, r, c); BIT[i] = g * 4 + (r - 1) * 2 + (c - 1); STK[BIT[i]] = i; } });
  var OUTER = [], WIDE = [];
  'URFDLB'.split('').forEach(function (F) { ['', '2', "'"].forEach(function (x) { OUTER.push(F + x); WIDE.push(F + 'w' + x); }); });
  var MA = OUTER.concat(WIDE);
  var MB = OUTER.concat(['Uw', 'Uw2', "Uw'", 'Dw', 'Dw2', "Dw'", 'Rw2', 'Lw2', 'Fw2', 'Bw2']);
  var MC = OUTER.concat(['Uw2', 'Dw2', 'Rw2', 'Lw2', 'Fw2', 'Bw2']);
  var OLL_PARITY = "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'";
  var PLL_PARITY = "Rw2 F2 U2 Rw2 R2 U2 F2 Rw2";
  var L2E = ["Uw' R U R' F R' F' R Uw", "Uw R U R' F R' F' R Uw'", "Dw R F' U R' F Dw'", "Dw' R F' U R' F Dw"];

  // byte lookup tables that move a 24-bit mask of center places
  var LUT = {};
  function lut(name) {
    if (LUT[name]) return LUT[name];
    var p = M.moves[name].perm, dest = new Int8Array(24), t = new Int32Array(768);
    for (var j = 0; j < 96; j++) if (BIT[j] >= 0) dest[BIT[p[j]]] = BIT[j];
    for (var k = 0; k < 3; k++) for (var v = 0; v < 256; v++) { var o = 0; for (var b = 0; b < 8; b++) if (v & (1 << b)) o |= 1 << dest[k * 8 + b]; t[k * 256 + v] = o; }
    return (LUT[name] = t);
  }
  function mv(mask, t) { return t[mask & 255] | t[256 + ((mask >> 8) & 255)] | t[512 + ((mask >> 16) & 255)]; }
  var R70 = new Int16Array(256).fill(-1), n70 = 0;
  for (var v0 = 0; v0 < 256; v0++) { var bc = 0; for (var b0 = 0; b0 < 8; b0++) if (v0 & (1 << b0)) bc++; if (bc === 4) R70[v0] = n70++; }
  function keyC(m) { return R70[m & 255] * 4900 + R70[(m >> 8) & 255] * 70 + R70[(m >> 16) & 255]; }

  var TA = null, TB = null, TC = null, LA, LB, LC;
  function bfs(size, goal, moves, keyOf) {
    var d = new Uint8Array(size).fill(255), luts = moves.map(lut);
    var cur = [goal], depth = 0; d[keyOf(goal)] = 0;
    while (cur.length) {
      var nxt = [];
      for (var i = 0; i < cur.length; i++) for (var m = 0; m < luts.length; m++) {
        var n = mv(cur[i], luts[m]), k = keyOf(n);
        if (d[k] === 255) { d[k] = depth + 1; nxt.push(n); }
      }
      cur = nxt; depth++;
    }
    return d;
  }
  function init() {
    if (TA) return;
    TA = bfs(1 << 24, 0xFF, MA, function (m) { return m; });
    TB = bfs(1 << 16, 0xFF00, MB, function (m) { return m >>> 8; });
    TC = bfs(343000, 0x0F0F0F, MC, keyC);
    LA = MA.map(lut); LB = MB.map(lut); LC = MC.map(lut);
  }
  function descend(mask, table, keyOf, moves, luts) {
    var out = [], last = '';
    while (table[keyOf(mask)] > 0) {
      var d = table[keyOf(mask)], ok = false;
      for (var m = 0; m < moves.length; m++) {
        if (MVs.base(moves[m]) === last) continue;
        var n = mv(mask, luts[m]);
        if (table[keyOf(n)] === d - 1) { out.push(moves[m]); mask = n; last = MVs.base(moves[m]); ok = true; break; }
      }
      if (!ok) return null;
    }
    return out;
  }
  function colorMask(s, cols) { var m = 0; for (var b = 0; b < 24; b++) if (cols.indexOf(s[STK[b]]) >= 0) m |= 1 << b; return m; }

  // edge slots: 12 places, each with two wings, each wing = [sticker on face a, sticker on face b]
  var SLOTS = (function () {
    var by = {};
    M.cubies.forEach(function (q) {
      if (q.kind !== 'edge') return;
      var st = q.st.slice().sort(function (a, b) { return M.face[a] - M.face[b]; });
      var k = st.map(function (i) { return M.face[i]; }).join('');
      (by[k] = by[k] || []).push(st);
    });
    return Object.keys(by).map(function (k) { return by[k]; });
  })();
  function pairedList(s) { var o = []; for (var i = 0; i < 12; i++) { var w = SLOTS[i]; if (s[w[0][0]] === s[w[1][0]] && s[w[0][1]] === s[w[1][1]]) o.push(i); } return o; }
  function pairedCount(s) { var n = 0; for (var i = 0; i < 12; i++) { var w = SLOTS[i]; if (s[w[0][0]] === s[w[1][0]] && s[w[0][1]] === s[w[1][1]]) n++; } return n; }
  function centersSolved(s) { for (var f = 0; f < 6; f++) { var c = s[M.idx(f, 1, 1)]; if (s[M.idx(f, 1, 2)] !== c || s[M.idx(f, 2, 1)] !== c || s[M.idx(f, 2, 2)] !== c) return false; } return true; }
  function perm(s, p) { var o = new Int8Array(96); for (var i = 0; i < 96; i++) o[i] = s[p[i]]; return o; }
  function compose(list) { var p = new Int16Array(96); for (var i = 0; i < 96; i++) p[i] = i; list.forEach(function (n) { var q = M.moves[n].perm, r = new Int16Array(96); for (var i = 0; i < 96; i++) r[i] = p[q[i]]; p = r; }); return p; }

  // pairing macros: wide turn, an outer insert, wide turn back; kept only if the centers come back
  var MACROS = null, SETUPS = null, WIDEP = null;
  function initEdges() {
    if (MACROS) return;
    var inserts = OUTER.map(function (q) { return [q]; });
    OUTER.forEach(function (p) {
      OUTER.forEach(function (q) {
        var fp = 'URFDLB'.indexOf(p[0]), fq = 'URFDLB'.indexOf(q[0]);
        if (fp === fq || fp === NS.OPP[fq]) return;
        inserts.push([p, q, MVs.invert([p])[0]]);
      });
    });
    var solved = M.solved();
    MACROS = [];
    WIDE.forEach(function (S) {
      var Si = MVs.invert([S])[0], list = [];
      inserts.forEach(function (X) {
        var seq = [S].concat(X, [Si]), p = compose(seq);
        if (centersSolved(perm(solved, p))) list.push({ seq: seq, p: p });
      });
      MACROS.push({ S: S, p: compose([S]), list: list });
    });
    SETUPS = [{ seq: [], p: compose([]) }];
    OUTER.forEach(function (a) {
      SETUPS.push({ seq: [a], p: compose([a]) });
      OUTER.forEach(function (b) { if (a[0] !== b[0]) SETUPS.push({ seq: [a, b], p: compose([a, b]) }); });
    });
    WIDEP = L2E.map(function (a) { var l = MVs.parse(a); return { seq: l, p: compose(l) }; });
  }
  function bestPairing(s) {
    var base = pairedCount(s), best = null, bestScore = 0;
    for (var u = 0; u < SETUPS.length; u++) {
      var s1 = perm(s, SETUPS[u].p), pl1 = pairedList(s1);
      for (var k = 0; k < MACROS.length; k++) {
        var s2 = perm(s1, MACROS[k].p), pl2 = pairedList(s2), fresh = false;
        for (var i = 0; i < pl2.length; i++) if (pl1.indexOf(pl2[i]) < 0) { fresh = true; break; }
        if (!fresh) continue;
        var L = MACROS[k].list;
        for (var x = 0; x < L.length; x++) {
          var s4 = perm(s1, L[x].p), gain = pairedCount(s4) - base;
          if (gain <= 0) continue;
          var len = SETUPS[u].seq.length + L[x].seq.length, score = gain / len;
          if (score > bestScore + 1e-9) { bestScore = score; best = { seq: SETUPS[u].seq.concat(L[x].seq), s: s4, gain: gain }; }
        }
      }
      if (best && u === 18) break; // a good move with at most one setup turn is good enough
    }
    return best;
  }
  function lastTwo(s) {
    var setups3 = SETUPS.slice();
    for (var d = 0; d < 2; d++) {
      for (var u = 0; u < setups3.length; u++) {
        var s1 = perm(s, setups3[u].p);
        for (var a = 0; a < WIDEP.length; a++) {
          var s2 = perm(s1, WIDEP[a].p);
          if (pairedCount(s2) === 12 && centersSolved(s2)) return { seq: setups3[u].seq.concat(WIDEP[a].seq), s: s2 };
        }
      }
      // try three setup turns
      if (d === 0) {
        var more = [];
        SETUPS.forEach(function (st) { if (st.seq.length !== 2) return; OUTER.forEach(function (c) { if (c[0] !== st.seq[1][0]) { var l = st.seq.concat([c]); more.push({ seq: l, p: compose(l) }); } }); });
        setups3 = more;
      }
    }
    return null;
  }

  function virtual3(s) {
    var map = [0, 1, 3], v = new Int8Array(54);
    for (var f = 0; f < 6; f++) for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) v[f * 9 + r * 3 + c] = s[M.idx(f, map[r], map[c])];
    return v;
  }
  // the colors on each face of the solved cube, in all 24 ways of holding it
  function orientations(colorAt) {
    var s = M.solved(), out = [], seen = {}, i;
    for (i = 0; i < 96; i++) s[i] = colorAt[M.face[i]];
    var q = [s];
    while (q.length) {
      var t = q.shift(), k = [0, 1, 2, 3, 4, 5].map(function (f) { return t[f * 16 + 5]; });
      if (seen[k.join()]) continue;
      seen[k.join()] = 1; out.push(k);
      q.push(M.apply(t, 'x'), M.apply(t, 'y'));
    }
    return out;
  }
  var CF4 = th.CF.map(function (cn) { return cn.map(function (t) { return th.fi(4, t); }); });
  function colorName(c) { return NS.COLOR_NAMES[c] || 'gray'; }

  // s: 96 stickers; opp: opposite color of each color (from the corners); colorAt: a correct way the colors sit
  function solve(start, colorAt, opts) {
    opts = opts || {};
    init(); initEdges();
    var s = Int8Array.from(start), steps = [];
    function run(list) { list = MVs.parse(list); s = M.applyAll(s, list); return list; }
    function step(stage, title, text, moves) { steps.push({ stage: stage, title: title, text: text, moves: moves }); }
    var orient = orientations(colorAt);
    var pairs = [[colorAt[0], colorAt[3]], [colorAt[1], colorAt[4]], [colorAt[2], colorAt[5]]];
    // A
    var bestA = null;
    pairs.forEach(function (pr, i) { var d = TA[colorMask(s, pr)]; if (!bestA || d < bestA.d) bestA = { d: d, i: i }; });
    var pA = pairs[bestA.i], mA = descend(colorMask(s, pA), TA, function (m) { return m; }, MA, LA);
    run(mA);
    step(1, 'Centers: ' + colorName(pA[0]) + ' and ' + colorName(pA[1]), 'Gather the eight ' + colorName(pA[0]) + ' and ' + colorName(pA[1]) + ' center pieces onto the top and bottom faces. For now they can be mixed: some ' + colorName(pA[0]) + ' on the bottom is fine.', mA);
    // B
    var rest = pairs.filter(function (p, i) { return i !== bestA.i; }), bestB = null;
    rest.forEach(function (pr, i) { var d = TB[colorMask(s, pr) >>> 8]; if (!bestB || d < bestB.d) bestB = { d: d, i: i }; });
    var pB = rest[bestB.i], mB = descend(colorMask(s, pB), TB, function (m) { return m >>> 8; }, MB, LB);
    run(mB);
    step(1, 'Centers: ' + colorName(pB[0]) + ' and ' + colorName(pB[1]), 'Gather the ' + colorName(pB[0]) + ' and ' + colorName(pB[1]) + ' centers onto the right and left faces, still mixed, without disturbing the top and bottom. The front and back now hold the last two colors.', mB);
    // C
    var bestC = null;
    orient.forEach(function (o) {
      if (pA.indexOf(o[0]) < 0 || pB.indexOf(o[1]) < 0) return;
      var m = colorMask(s, [o[0]]) & 0xFF | colorMask(s, [o[1]]) & 0xFF00 | colorMask(s, [o[2]]) & 0xFF0000;
      var d = TC[keyC(m)];
      if (d !== 255 && (!bestC || d < bestC.d)) bestC = { d: d, o: o, m: m };
    });
    var mC = descend(bestC.m, TC, keyC, MC, LC);
    run(mC);
    var target = bestC.o;
    step(1, 'Centers: finish all six', 'Sort each pair so every face has four matching centers: ' + colorName(target[0]) + ' on top, ' + colorName(target[2]) + ' in front, ' + colorName(target[1]) + ' on the right. Only half turns of the wide layers are used, so the first four colors stay on their faces.', mC);
    if (!centersSolved(s)) throw new Error('centers');

    // edges
    var guard = 0;
    while (pairedCount(s) < 12) {
      if (++guard > 30) throw new Error('pairing stuck');
      var before = pairedList(s), left = 12 - before.length, res;
      if (left <= 2) {
        res = lastTwo(s);
        if (!res) throw new Error('last two');
        s = res.s;
        step(2, 'Edges: the last two', 'Two edges are left, each holding one piece of the other. Set them up, then a last-two-edges algorithm (wide turn, edge swap, wide turn back) pairs both at once.', res.seq);
        continue;
      }
      res = bestPairing(s);
      if (!res) {
        res = lastTwo(s);
        if (!res) throw new Error('no pairing move');
      }
      s = res.s;
      var now = pairedList(s), made = now.filter(function (x) { return before.indexOf(x) < 0; });
      var names = made.map(function (i) { var w = SLOTS[i][0]; return colorName(s[w[0]]) + '-' + colorName(s[w[1]]); });
      step(2, 'Edges: pair ' + (names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : 'the ' + names[0]),
        (res.seq.length > 5 ? 'Set up the two matching edge pieces with outer turns. ' : '') + 'A wide turn brings them together, three outer turns move the new pair out of the way and bring in an unpaired edge, and the wide turn is undone so the centers come back.' + (names.length > 1 ? ' This one pairs ' + names.length + ' edges.' : ''), res.seq);
    }

    // parity
    var v = virtual3(s), c = th.fromFacelets(v), ver = c && th.verify(c);
    if (!c) throw new Error('reduction');
    if (ver.flip) {
      run(OLL_PARITY);
      step(3, 'OLL parity: one flipped edge', 'Reduced to a 3×3, this cube has a single flipped edge, which no 3×3 can have. A 4×4 can, because each edge is really two pieces. This algorithm flips the front-top edge. It also moves a few other top pieces, which the 3×3 solve at the end puts right.', MVs.parse(OLL_PARITY));
      v = virtual3(s); c = th.fromFacelets(v); ver = th.verify(c);
    }
    if (ver.parity) {
      run(PLL_PARITY);
      step(3, 'PLL parity: two swapped edges', 'Reduced to a 3×3, two edges would need to swap places on their own, which a 3×3 can’t do. This algorithm swaps the front-top and back-top edges.', MVs.parse(PLL_PARITY));
      v = virtual3(s); c = th.fromFacelets(v); ver = th.verify(c);
    }
    if (ver.flip || ver.parity || ver.twist) throw new Error('parity');
    var r3 = th.solveCubie(c, { maxTime: opts.maxTime3 == null ? 800 : opts.maxTime3, target: 20 });
    run(r3);
    step(4, 'Solve it like a 3×3', 'Every center is a solid block and every edge is a matched pair, so the cube now acts like a 3×3. Turn only the outer layers from here on.', r3);
    if (!M.isSolved(s)) throw new Error('not solved');
    return { steps: steps, moves: [].concat.apply([], steps.map(function (x) { return x.moves; })), target: target };
  }
  NS.four = { init: init, initEdges: initEdges, solve: solve, orientations: orientations, CF4: CF4, SLOTS: SLOTS, pairedCount: pairedCount, centersSolved: centersSolved, virtual3: virtual3, OLL_PARITY: OLL_PARITY, PLL_PARITY: PLL_PARITY, L2E: L2E };
})(globalThis);
