/* Cube Solver: the 3×3 piece model and a two-phase solver (TRBCube.three), written for this site.
   Pieces follow the usual numbering: corners URF UFL ULB UBR DFR DLF DBL DRB, edges UR UF UL UB DR DF DL DB FR FL BL BR.
   A cube is {cp, co, ep, eo}: which piece sits in each place and how it is turned (corners 0..2, edges 0..1).
   Phase 1 brings the cube into the group <U, D, R2, L2, F2, B2> (no twisted corners, no flipped edges,
   middle-layer edges in the middle layer); phase 2 solves it inside that group. Both phases search with
   iterative deepening, guided by exact distance tables for pairs of coordinates (built once, about a second).
   The search keeps looking for shorter answers until it reaches the target length or runs out of time. */
(function (G) {
  'use strict';
  var NS = G.TRBCube;
  var M = NS.model(3);
  // facelet (face, row, col) of each corner and edge, in the order that defines its twist or flip
  var CF = [[[0, 2, 2], [1, 0, 0], [2, 0, 2]], [[0, 2, 0], [2, 0, 0], [4, 0, 2]], [[0, 0, 0], [4, 0, 0], [5, 0, 2]], [[0, 0, 2], [5, 0, 0], [1, 0, 2]],
    [[3, 0, 2], [2, 2, 2], [1, 2, 0]], [[3, 0, 0], [4, 2, 2], [2, 2, 0]], [[3, 2, 0], [5, 2, 2], [4, 2, 0]], [[3, 2, 2], [1, 2, 2], [5, 2, 0]]];
  var EF = [[[0, 1, 2], [1, 0, 1]], [[0, 2, 1], [2, 0, 1]], [[0, 1, 0], [4, 0, 1]], [[0, 0, 1], [5, 0, 1]],
    [[3, 1, 2], [1, 2, 1]], [[3, 0, 1], [2, 2, 1]], [[3, 1, 0], [4, 2, 1]], [[3, 2, 1], [5, 2, 1]],
    [[2, 1, 2], [1, 1, 0]], [[2, 1, 0], [4, 1, 2]], [[5, 1, 2], [4, 1, 0]], [[5, 1, 0], [1, 1, 2]]];
  function fi(N, t) { var L = N - 1; return t[0] * N * N + (t[1] === 2 ? L : t[1]) * N + (t[2] === 2 ? L : t[2]); }
  var CFI = CF.map(function (c) { return c.map(function (t) { return fi(3, t); }); });
  var EFI = EF.map(function (e) { return e.map(function (t) { return fi(3, t); }); });
  var CCOL = CF.map(function (c) { return c.map(function (t) { return t[0]; }); });
  var ECOL = EF.map(function (e) { return e.map(function (t) { return t[0]; }); });
  var CORNER_NAMES = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB'];
  var EDGE_NAMES = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR'];

  function cube() { return { cp: [0, 1, 2, 3, 4, 5, 6, 7], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }; }
  function copy(c) { return { cp: c.cp.slice(), co: c.co.slice(), ep: c.ep.slice(), eo: c.eo.slice() }; }
  function mul(a, b) {
    var r = { cp: [], co: [], ep: [], eo: [] }, i;
    for (i = 0; i < 8; i++) { r.cp[i] = a.cp[b.cp[i]]; r.co[i] = (a.co[b.cp[i]] + b.co[i]) % 3; }
    for (i = 0; i < 12; i++) { r.ep[i] = a.ep[b.ep[i]]; r.eo[i] = (a.eo[b.ep[i]] + b.eo[i]) % 2; }
    return r;
  }

  // facelets -> pieces. faceOf maps a color to the face whose center has it. Returns null on a bad piece.
  function fromFacelets(s, faceOf) {
    if (!faceOf) { faceOf = {}; for (var f = 0; f < 6; f++) faceOf[s[f * 9 + 4]] = f; }
    var c = cube(), i, j, k;
    for (i = 0; i < 8; i++) {
      var fc = CFI[i].map(function (x) { return faceOf[s[x]]; });
      for (j = 0; j < 3; j++) if (fc[j] === 0 || fc[j] === 3) break;
      if (j === 3) return null;
      var a = fc[(j + 1) % 3], b = fc[(j + 2) % 3], found = -1;
      for (k = 0; k < 8; k++) if (CCOL[k][0] === fc[j] && CCOL[k][1] === a && CCOL[k][2] === b) found = k;
      if (found < 0) return null;
      c.cp[i] = found; c.co[i] = j;
    }
    for (i = 0; i < 12; i++) {
      var e0 = faceOf[s[EFI[i][0]]], e1 = faceOf[s[EFI[i][1]]];
      found = -1;
      for (k = 0; k < 12; k++) { if (ECOL[k][0] === e0 && ECOL[k][1] === e1) { found = k; c.eo[i] = 0; } else if (ECOL[k][0] === e1 && ECOL[k][1] === e0) { found = k; c.eo[i] = 1; } }
      if (found < 0) return null;
      c.ep[i] = found;
    }
    return c;
  }
  function toFacelets(c, colorOf) {
    var s = M.solved(), i, n;
    colorOf = colorOf || [0, 1, 2, 3, 4, 5];
    for (i = 0; i < 54; i++) s[i] = colorOf[M.face[i]];
    for (i = 0; i < 8; i++) for (n = 0; n < 3; n++) s[CFI[i][(n + c.co[i]) % 3]] = colorOf[CCOL[c.cp[i]][n]];
    for (i = 0; i < 12; i++) for (n = 0; n < 2; n++) s[EFI[i][(n + c.eo[i]) % 2]] = colorOf[ECOL[c.ep[i]][n]];
    return s;
  }
  function parityOf(p) { var n = 0; for (var i = 0; i < p.length; i++) for (var j = i + 1; j < p.length; j++) if (p[i] > p[j]) n++; return n & 1; }
  function verify(c) {
    var t = 0, f = 0, i, seenC = {}, seenE = {};
    for (i = 0; i < 8; i++) { t += c.co[i]; seenC[c.cp[i]] = 1; }
    for (i = 0; i < 12; i++) { f += c.eo[i]; seenE[c.ep[i]] = 1; }
    return { corners: Object.keys(seenC).length === 8, edges: Object.keys(seenE).length === 12, twist: t % 3, flip: f % 2, parity: parityOf(c.cp) !== parityOf(c.ep) };
  }

  // the 18 face turns as piece moves, read off the sticker model
  var MOVE_NAMES = [], MV = [];
  'URFDLB'.split('').forEach(function (F) { ['', '2', "'"].forEach(function (sfx) { MOVE_NAMES.push(F + sfx); }); });
  MOVE_NAMES.forEach(function (n) { MV.push(fromFacelets(M.apply(M.solved(), n))); });
  function applyMove(c, m) { return mul(c, MV[m]); }
  function applyNames(c, list) { NS.moves.parse(list).forEach(function (t) { c = mul(c, MV[MOVE_NAMES.indexOf(t)]); }); return c; }

  // ---------- coordinates ----------
  var FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320];
  function Cnk(n, k) { if (k < 0 || k > n) return 0; var r = 1; for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); }
  function getTwist(c) { var t = 0; for (var i = 0; i < 7; i++) t = t * 3 + c.co[i]; return t; }
  function setTwist(c, t) { var s = 0; for (var i = 6; i >= 0; i--) { c.co[i] = t % 3; s += c.co[i]; t = (t / 3) | 0; } c.co[7] = (3 - s % 3) % 3; }
  function getFlip(c) { var t = 0; for (var i = 0; i < 11; i++) t = t * 2 + c.eo[i]; return t; }
  function setFlip(c, t) { var s = 0; for (var i = 10; i >= 0; i--) { c.eo[i] = t & 1; s += c.eo[i]; t >>= 1; } c.eo[11] = s & 1; }
  function getSlice(c) { var r = 0, k = 0; for (var j = 0; j < 12; j++) if (c.ep[j] >= 8) { k++; r += Cnk(j, k); } return r; }
  function setSlice(c, r) {
    var occ = [], k = 4, j;
    for (j = 11; j >= 0 && k > 0; j--) { if (Cnk(j, k) <= r) { r -= Cnk(j, k); occ[j] = 1; k--; } }
    var a = 8, b = 0; for (j = 0; j < 12; j++) c.ep[j] = occ[j] ? a++ : b++;
  }
  function rankPerm(p, n, off) {
    var r = 0; for (var i = 0; i < n; i++) { var s = 0; for (var j = i + 1; j < n; j++) if (p[j + off] < p[i + off]) s++; r += s * FACT[n - 1 - i]; } return r;
  }
  function unrankPerm(r, n) {
    var avail = [], out = [], i; for (i = 0; i < n; i++) avail.push(i);
    for (i = 0; i < n; i++) { var f = FACT[n - 1 - i], q = Math.floor(r / f); r -= q * f; out.push(avail.splice(q, 1)[0]); }
    return out;
  }
  function getCP(c) { return rankPerm(c.cp, 8, 0); }
  function setCP(c, r) { c.cp = unrankPerm(r, 8); }
  function getUDE(c) { return rankPerm(c.ep, 8, 0); }
  function setUDE(c, r) { var p = unrankPerm(r, 8); for (var i = 0; i < 8; i++) c.ep[i] = p[i]; for (i = 8; i < 12; i++) c.ep[i] = i; }
  function getSP(c) { var q = [c.ep[8] - 8, c.ep[9] - 8, c.ep[10] - 8, c.ep[11] - 8]; return rankPerm(q, 4, 0); }
  function setSP(c, r) { var p = unrankPerm(r, 4); for (var i = 0; i < 4; i++) c.ep[8 + i] = 8 + p[i]; }
  var SOLVED_SLICE = getSlice(cube());

  var P2MOVES = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16]; // U U2 U' R2 F2 D D2 D' L2 B2
  var T = null;
  function moveTable(size, set, get, moves) {
    var t = new Uint16Array(size * moves.length);
    for (var v = 0; v < size; v++) {
      var c = cube(); set(c, v);
      for (var m = 0; m < moves.length; m++) t[v * moves.length + m] = get(mul(c, MV[moves[m]]));
    }
    return t;
  }
  function prune(nA, nB, tA, tB, nm, goal) {
    var size = nA * nB, d = new Int8Array(size).fill(-1), done = 1, depth = 0;
    d[goal] = 0;
    while (done < size) {
      var back = done > size / 2, any = false;
      for (var i = 0; i < size; i++) {
        if (back ? d[i] !== -1 : d[i] !== depth) continue;
        var a = (i / nB) | 0, b = i - a * nB;
        for (var m = 0; m < nm; m++) {
          var j = tA[a * nm + m] * nB + tB[b * nm + m];
          if (back) { if (d[j] === depth) { d[i] = depth + 1; done++; any = true; break; } }
          else if (d[j] === -1) { d[j] = depth + 1; done++; any = true; }
        }
      }
      depth++;
      if (!any) break;
    }
    return d;
  }
  function init() {
    if (T) return T;
    var all = []; for (var i = 0; i < 18; i++) all.push(i);
    T = {};
    T.tw = moveTable(2187, setTwist, getTwist, all);
    T.fl = moveTable(2048, setFlip, getFlip, all);
    T.sl = moveTable(495, setSlice, getSlice, all);
    T.cp = moveTable(40320, setCP, getCP, P2MOVES);
    T.ue = moveTable(40320, setUDE, getUDE, P2MOVES);
    T.sp = moveTable(24, setSP, getSP, P2MOVES);
    T.pTS = prune(2187, 495, T.tw, T.sl, 18, 0 * 495 + SOLVED_SLICE);
    T.pFS = prune(2048, 495, T.fl, T.sl, 18, 0 * 495 + SOLVED_SLICE);
    T.pCS = prune(40320, 24, T.cp, T.sp, 10, 0);
    T.pES = prune(40320, 24, T.ue, T.sp, 10, 0);
    return T;
  }

  function now() { return (G.performance && G.performance.now) ? G.performance.now() : Date.now(); }
  // two-phase search. opts: maxTime (ms, keep improving until then), target (stop at this length or less)
  function solveCubie(cc, opts) {
    opts = opts || {};
    init();
    var maxTime = opts.maxTime == null ? 1500 : opts.maxTime, target = opts.target == null ? 20 : opts.target, hardMax = opts.hardMax || 60000;
    var t0 = now(), best = null, bestLen = opts.maxLen || 31, sol1 = [], sol2 = [], stop = false, nodes = 0;
    var TW = T.tw, FL = T.fl, SL = T.sl, PTS = T.pTS, PFS = T.pFS, CPt = T.cp, UEt = T.ue, SPt = T.sp, PCS = T.pCS, PES = T.pES;
    function timeUp() { var e = now() - t0; return (best && e > maxTime) || e > hardMax; }
    function p2(cp, ue, sp, togo, lastFace, depth) {
      if (togo === 0) return cp === 0 && ue === 0 && sp === 0;
      for (var k = 0; k < 10; k++) {
        var m = P2MOVES[k], f = (m / 3) | 0;
        if (f === lastFace || f === lastFace - 3) continue;
        var c2 = CPt[cp * 10 + k], e2 = UEt[ue * 10 + k], s2 = SPt[sp * 10 + k];
        var h = PCS[c2 * 24 + s2], h2 = PES[e2 * 24 + s2]; if (h2 > h) h = h2;
        if (h >= togo) continue;
        sol2[depth] = m;
        if (p2(c2, e2, s2, togo - 1, f, depth + 1)) return true;
      }
      return false;
    }
    function startP2(d1) {
      var c = cc; for (var i = 0; i < d1; i++) c = mul(c, MV[sol1[i]]);
      var cp = getCP(c), ue = getUDE(c), sp = getSP(c);
      var h = PCS[cp * 24 + sp], h2 = PES[ue * 24 + sp]; if (h2 > h) h = h2;
      var lim = bestLen - 1 - d1;
      if (h > lim) return;
      var lastFace = d1 ? (sol1[d1 - 1] / 3) | 0 : -9;
      for (var d2 = h; d2 <= lim; d2++) {
        if (p2(cp, ue, sp, d2, lastFace, 0)) {
          best = sol1.slice(0, d1).concat(sol2.slice(0, d2)); bestLen = d1 + d2;
          if (bestLen <= target) stop = true;
          return;
        }
      }
    }
    function p1(tw, fl, sl, depth, togo, lastFace, lastMove) {
      if (togo === 0) {
        // only phase-1 ends whose last turn is a quarter turn of R, L, F or B (other endings repeat a shorter case)
        if (depth === 0 || (lastFace !== 0 && lastFace !== 3 && lastMove % 3 !== 1)) startP2(depth);
        return;
      }
      if ((++nodes & 1023) === 0 && timeUp()) { stop = true; return; }
      for (var m = 0; m < 18; m++) {
        var f = (m / 3) | 0;
        if (f === lastFace || f === lastFace - 3) continue;
        var t2 = TW[tw * 18 + m], f2 = FL[fl * 18 + m], s2 = SL[sl * 18 + m];
        var h = PTS[t2 * 495 + s2], hb = PFS[f2 * 495 + s2]; if (hb > h) h = hb;
        if (h >= togo) continue;
        sol1[depth] = m;
        p1(t2, f2, s2, depth + 1, togo - 1, f, m);
        if (stop) return;
      }
    }
    var tw = getTwist(cc), fl = getFlip(cc), sl = getSlice(cc);
    for (var d1 = 0; d1 < bestLen && !stop; d1++) {
      var h = Math.max(PTS[tw * 495 + sl], PFS[fl * 495 + sl]);
      if (h > d1) continue;
      p1(tw, fl, sl, 0, d1, -9, -1);
      if (timeUp()) break;
    }
    return best ? best.map(function (m) { return MOVE_NAMES[m]; }) : null;
  }
  // facelets (54 colors, centers tell the faces) -> moves
  function solveFacelets(s, opts) {
    var c = fromFacelets(s);
    if (!c) return { error: 'bad' };
    var v = verify(c);
    if (!v.corners || !v.edges || v.twist || v.flip || v.parity) return { error: 'unsolvable', check: v };
    var t = now(), moves = solveCubie(c, opts);
    return { moves: moves, ms: Math.round(now() - t) };
  }
  // a random solvable cube, every position equally likely
  function randomCube(rnd) {
    rnd = rnd || Math.random;
    var c = cube();
    setCP(c, Math.floor(rnd() * 40320));
    var ep; do { ep = unrankPerm(Math.floor(rnd() * 479001600), 12); } while (parityOf(ep) !== parityOf(c.cp));
    c.ep = ep;
    setTwist(c, Math.floor(rnd() * 2187)); setFlip(c, Math.floor(rnd() * 2048));
    return c;
  }
  FACT.push(362880, 3628800, 39916800, 479001600);

  NS.three = {
    cube: cube, copy: copy, mul: mul, fromFacelets: fromFacelets, toFacelets: toFacelets, verify: verify, parityOf: parityOf,
    MV: MV, MOVE_NAMES: MOVE_NAMES, applyMove: applyMove, applyNames: applyNames, CFI: CFI, EFI: EFI, CCOL: CCOL, ECOL: ECOL, CF: CF, EF: EF, fi: fi,
    CORNER_NAMES: CORNER_NAMES, EDGE_NAMES: EDGE_NAMES, init: init, solveCubie: solveCubie, solveFacelets: solveFacelets, randomCube: randomCube,
    getTwist: getTwist, getFlip: getFlip, setTwist: setTwist, rankPerm: rankPerm, unrankPerm: unrankPerm
  };
})(globalThis);
