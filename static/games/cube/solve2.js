/* Cube Solver: an optimal 2×2 solver (TRBCube.two), written for this site.
   The back-down-left corner never moves (only U, R and F turns are used), so a position is the order of the
   other 7 corners (5,040 ways) times their twists (729 ways): 3,674,160 positions. A breadth-first search
   from the solved cube labels every position with its exact distance, and a solution walks downhill.
   Every answer is as short as possible in the half-turn metric (never more than 11 turns). */
(function (G) {
  'use strict';
  var NS = G.TRBCube, th = NS.three;
  var MOVES = ['U', 'U2', "U'", 'R', 'R2', "R'", 'F', 'F2', "F'"];
  var MI = MOVES.map(function (n) { return th.MV[th.MOVE_NAMES.indexOf(n)]; });
  var POS = [0, 1, 2, 3, 4, 5, 7];
  var SIZE = 5040 * 729, D = null, PT = null, TT = null;
  function getPerm(c) { var q = POS.map(function (p) { var v = c.cp[p]; return v === 7 ? 6 : v; }); return th.rankPerm(q, 7, 0); }
  function setPerm(c, r) { var q = th.unrankPerm(r, 7); for (var i = 0; i < 7; i++) c.cp[POS[i]] = q[i] === 6 ? 7 : q[i]; c.cp[6] = 6; }
  function getTw(c) { var t = 0; for (var i = 0; i < 6; i++) t = t * 3 + c.co[i]; return t; }
  function setTw(c, t) { var s = 0; for (var i = 5; i >= 0; i--) { c.co[i] = t % 3; s += c.co[i]; t = (t / 3) | 0; } c.co[6] = 0; c.co[7] = (3 - s % 3) % 3; }
  function init() {
    if (D) return;
    var i, m, c;
    PT = new Uint16Array(5040 * 9); TT = new Uint16Array(729 * 9);
    for (i = 0; i < 5040; i++) { c = th.cube(); setPerm(c, i); for (m = 0; m < 9; m++) PT[i * 9 + m] = getPerm(th.mul(c, MI[m])); }
    for (i = 0; i < 729; i++) { c = th.cube(); setTw(c, i); for (m = 0; m < 9; m++) TT[i * 9 + m] = getTw(th.mul(c, MI[m])); }
    D = new Int8Array(SIZE).fill(-1); D[0] = 0;
    var cur = new Int32Array(SIZE), nxt = new Int32Array(SIZE), nc = 1, depth = 0; cur[0] = 0;
    while (nc) {
      var nn = 0;
      for (var k = 0; k < nc; k++) {
        var s = cur[k], p = (s / 729) | 0, t = s - p * 729;
        for (m = 0; m < 9; m++) { var j = PT[p * 9 + m] * 729 + TT[t * 9 + m]; if (D[j] < 0) { D[j] = depth + 1; nxt[nn++] = j; } }
      }
      var tmp = cur; cur = nxt; nxt = tmp; nc = nn; depth++;
    }
  }
  function index(c) { return getPerm(c) * 729 + getTw(c); }
  // corners in the 3×3 numbering, with DBL already home
  function solveCorners(c) {
    init();
    var s = index(c), out = [], last = -1;
    if (D[s] < 0) return null;
    while (D[s] > 0) {
      var p = (s / 729) | 0, t = s - p * 729, found = false;
      for (var m = 0; m < 9; m++) {
        if (((m / 3) | 0) === last) continue;
        var j = PT[p * 9 + m] * 729 + TT[t * 9 + m];
        if (D[j] === D[s] - 1) { out.push(MOVES[m]); s = j; last = (m / 3) | 0; found = true; break; }
      }
      if (!found) return null;
    }
    return out;
  }
  function distance(c) { init(); return D[index(c)]; }
  // the 2×2's corner stickers, in the same order as the 3×3's
  var CFI2 = th.CF.map(function (cn) { return cn.map(function (t) { return th.fi(2, t); }); });
  // read the 8 corners. colorAt[face] is the color that belongs on each face (from the DBL corner).
  function cornersFromFacelets(s, colorAt) {
    var faceOf = {}; for (var f = 0; f < 6; f++) faceOf[colorAt[f]] = f;
    var c = th.cube();
    for (var i = 0; i < 8; i++) {
      var fc = CFI2[i].map(function (x) { return faceOf[s[x]]; }), j, k, found = -1;
      for (j = 0; j < 3; j++) if (fc[j] === 0 || fc[j] === 3) break;
      if (j === 3) return null;
      for (k = 0; k < 8; k++) if (th.CCOL[k][0] === fc[j] && th.CCOL[k][1] === fc[(j + 1) % 3] && th.CCOL[k][2] === fc[(j + 2) % 3]) found = k;
      if (found < 0) return null;
      c.cp[i] = found; c.co[i] = j;
    }
    return c;
  }
  // colors of each face of the solved cube, taken from the corner that stays put (DBL) and the opposite pairs
  function schemeFromDBL(s, opp) {
    var d = s[CFI2[6][0]], b = s[CFI2[6][1]], l = s[CFI2[6][2]];
    return [opp[d], opp[l], opp[b], d, l, b];
  }
  function solveFacelets(s, opp) {
    var colorAt = schemeFromDBL(s, opp), c = cornersFromFacelets(s, colorAt);
    if (!c || c.cp[6] !== 6 || c.co[6] !== 0) return { error: 'bad' };
    var t = Date.now(), mv = solveCorners(c);
    if (!mv) return { error: 'unsolvable' };
    return { moves: mv, ms: Date.now() - t, colorAt: colorAt };
  }
  function randomState(rnd) {
    rnd = rnd || Math.random; init();
    var c = th.cube(); setPerm(c, Math.floor(rnd() * 5040)); setTw(c, Math.floor(rnd() * 729)); return c;
  }
  function toFacelets(c, colorAt) {
    var s = new Int8Array(24);
    colorAt = colorAt || [0, 1, 2, 3, 4, 5];
    for (var i = 0; i < 8; i++) for (var n = 0; n < 3; n++) s[CFI2[i][(n + c.co[i]) % 3]] = colorAt[th.CCOL[c.cp[i]][n]];
    return s;
  }
  NS.two = { init: init, solveCorners: solveCorners, distance: distance, solveFacelets: solveFacelets, cornersFromFacelets: cornersFromFacelets, schemeFromDBL: schemeFromDBL, randomState: randomState, toFacelets: toFacelets, CFI2: CFI2, MOVES: MOVES, SIZE: SIZE, getD: function () { init(); return D; } };
})(globalThis);
