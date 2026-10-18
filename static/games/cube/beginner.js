/* Cube Solver: a beginner's layer-by-layer solution for the 3×3 (TRBCube.beginner), written for this site.
   It solves the way a person learns to: white cross on the bottom, white corners, middle edges,
   yellow cross, yellow edges, yellow corners into place, then yellow corners turned. Every step is a short,
   named piece of work with an explanation, so a learner can follow it on a real cube.
   The cross uses a tiny search (one edge at a time, keeping the ones already placed); everything else uses the
   standard beginner algorithms, with whole-cube turns (y) so each algorithm is always done from the same hold. */
(function (G) {
  'use strict';
  var NS = G.TRBCube, th = NS.three, MV = NS.moves, M3 = NS.model(3);
  var CN = NS.COLOR_NAMES;
  var EFI = th.EFI, CFI = th.CFI;
  var Y = ['', 'y', 'y2', "y'"], UT = ['', 'U', 'U2', "U'"];
  var ALG = {
    sexy: "R U R' U'",
    right: "U R U' R' U' F' U F",
    left: "U' L' U L U F U' F'",
    fru: "F R U R' U' F'",
    sune: "R U R' U R U2 R' U",
    niklas: "U R U' L' U R' U' L",
    twist: "R' D' R D"
  };

  // one-edge tables for the cross search
  var EM = [], EDIST = {};
  (function () {
    for (var st = 0; st < 24; st++) { EM[st] = []; }
    for (var m = 0; m < 18; m++) {
      var mv = th.MV[m];
      for (var i = 0; i < 12; i++) for (var o = 0; o < 2; o++) EM[mv.ep[i] * 2 + o][m] = i * 2 + ((o + mv.eo[i]) % 2);
    }
    [4, 5, 6, 7].forEach(function (h) {
      var d = []; for (var s = 0; s < 24; s++) d[s] = -1;
      d[h * 2] = 0; var q = [h * 2];
      while (q.length) { var s0 = q.shift(); for (var mm = 0; mm < 18; mm++) { var t = EM[s0][mm]; if (d[t] < 0) { d[t] = d[s0] + 1; q.push(t); } } }
      EDIST[h] = d;
    });
  })();
  function crossSearch(c, target, done) {
    var homes = done.concat([target]);
    var st = homes.map(function (h) { var p = c.ep.indexOf(h); return p * 2 + c.eo[p]; });
    var path = [];
    function h(sts) { var m = 0; for (var i = 0; i < sts.length; i++) { var d = EDIST[homes[i]][sts[i]]; if (d > m) m = d; } return m; }
    function dfs(sts, togo, lastFace) {
      if (togo === 0) return h(sts) === 0;
      for (var m = 0; m < 18; m++) {
        var f = (m / 3) | 0; if (f === lastFace || f === lastFace - 3) continue;
        var n = sts.map(function (x) { return EM[x][m]; });
        if (h(n) >= togo) continue;
        path.push(m); if (dfs(n, togo - 1, f)) return true; path.pop();
      }
      return false;
    }
    for (var d = h(st); d <= 9; d++) { path = []; if (dfs(st, d, -9)) return path.map(function (m) { return th.MOVE_NAMES[m]; }); }
    return null;
  }

  function solve(start) {
    var s = Int8Array.from(start), steps = [];
    function cub() { return th.fromFacelets(s); }
    function cc(f) { return s[f * 9 + 4]; } // center color of a face
    function nm(col) { return CN[col] || 'gray'; }
    function run(list) { list = MV.parse(list); s = M3.applyAll(s, list); return list; }
    function step(stage, title, text, moves) { steps.push({ stage: stage, title: title, text: text, moves: moves }); }
    function edgeName(c, piece) { return nm(cc(th.ECOL[piece][0])) + '-' + nm(cc(th.ECOL[piece][1])); }
    function cornerName(piece) { return th.CCOL[piece].map(function (f) { return nm(cc(f)); }).join('-'); }
    function rotationTo(test) {
      for (var k = 0; k < 4; k++) { var t = Y[k] ? M3.apply(s, Y[k]) : s; if (test(th.fromFacelets(t), t)) return Y[k]; }
      return null;
    }

    // 0. hold the cube with white on the bottom
    var white = 0, rots = ['', 'z2', "x'", 'x', 'z', "z'"], r0 = '';
    if ([0, 1, 2, 3, 4, 5].map(cc).indexOf(white) < 0) white = cc(3);
    for (var k = 0; k < rots.length; k++) { var t = rots[k] ? M3.apply(s, rots[k]) : s; if (t[3 * 9 + 4] === white) { r0 = rots[k]; break; } }
    if (r0) { run(r0); }
    var top = cc(0);
    step(0, 'Hold the cube', r0 ? 'Turn the whole cube so the ' + nm(white) + ' center is on the bottom (' + MV.pretty(r0) + '). Keep holding it this way: the ' + nm(cc(2)) + ' center faces you and ' + nm(top) + ' is on top.' :
      'The ' + nm(white) + ' center is already on the bottom. Keep holding the cube this way: the ' + nm(cc(2)) + ' center faces you and ' + nm(top) + ' is on top.', r0 ? [r0] : []);

    // 1. cross
    var done = [], left = [5, 4, 7, 6];
    while (left.length) {
      var c = cub(), best = null, bh = -1;
      left.forEach(function (h) { var p = crossSearch(c, h, done); if (p && (!best || p.length < best.length)) { best = p; bh = h; } });
      var e = bh, already = best.length === 0;
      run(best);
      step(1, 'Cross: the ' + edgeName(c, e) + ' edge', already ? 'The ' + edgeName(c, e) + ' edge is already in place: ' + nm(white) + ' on the bottom, ' + nm(cc(th.ECOL[e][1])) + ' against the ' + nm(cc(th.ECOL[e][1])) + ' center.' :
        'Bring the ' + edgeName(c, e) + ' edge down next to the ' + nm(cc(th.ECOL[e][1])) + ' center, with ' + nm(white) + ' facing down. ' + (done.length ? 'These turns keep the cross edges you already placed.' : ''), best);
      done.push(e); left.splice(left.indexOf(e), 1);
    }

    // 2. white corners
    var guard = 0;
    for (;;) {
      if (++guard > 12) throw new Error('corner stage stuck');
      c = cub();
      var todo = [4, 5, 6, 7].filter(function (h) { return c.cp[h] !== h || c.co[h] !== 0; });
      if (!todo.length) break;
      // a white corner in the top layer, if there is one
      var upper = [0, 1, 2, 3].filter(function (p) { return c.cp[p] >= 4; });
      var moves = [], title, text;
      if (upper.length) {
        // follow the corner by its colors; prefer one whose spot is already at the front right
        var cols = null;
        upper.forEach(function (p) {
          var cl = CFI[p].map(function (x) { return s[x]; }).sort().join(',');
          if (!cols || homeOfColors(s, cl) === 4) cols = cl;
        });
        var rot = rotationTo(function (cu, tt) { return homeOfColors(tt, cols) === 4; });
        moves = moves.concat(rot ? run(rot) : []);
        var j = [0, 1, 2, 3].filter(function (q) { return locateAfter(s, cols, UT[q]) === 0; })[0];
        if (j) moves = moves.concat(run(UT[j]));
        var reps = 0; while (!(cub().cp[4] === 4 && cub().co[4] === 0)) { moves = moves.concat(run(ALG.sexy)); if (++reps > 6) throw new Error('corner insert'); }
        c = cub();
        title = 'Corner: ' + cornerName(4);
        text = (rot ? 'Turn the whole cube (' + MV.pretty(rot) + ') so this corner’s spot is at the bottom front right. ' : 'This corner’s spot is at the bottom front right. ') +
          (j ? 'Turn the top (' + MV.pretty(UT[j]) + ') so the corner sits right above its spot. ' : 'The corner is already right above its spot. ') +
          'Then repeat R U R′ U′ until it drops in with ' + nm(white) + ' on the bottom: ' + (reps === 1 ? 'once' : reps + ' times') + ' here.';
      } else {
        // a white corner is stuck in the bottom layer in the wrong place or turned the wrong way: lift it out
        var bad = todo.map(function (h) { return [4, 5, 6, 7].filter(function (p) { return c.cp[p] === h || (p === h && c.co[p]); })[0]; })[0];
        var colsB = CFI[bad].map(function (x) { return s[x]; }).slice().sort().join(',');
        var rotB = rotationTo(function (cu, tt) { return locate(tt, colsB) === 4; });
        moves = moves.concat(rotB ? run(rotB) : []).concat(run(ALG.sexy));
        title = 'Corner: lift one out';
        text = 'A ' + nm(white) + ' corner is in the bottom layer but in the wrong spot or turned wrong. ' + (rotB ? 'Turn the whole cube (' + MV.pretty(rotB) + ') so it is at the bottom front right, then ' : 'It is at the bottom front right, so ') + 'do R U R′ U′ once to lift it into the top layer.';
      }
      step(2, title, text, moves);
    }

    // 3. middle-layer edges
    guard = 0;
    for (;;) {
      if (++guard > 14) throw new Error('middle stage stuck');
      c = cub();
      var wrong = [8, 9, 10, 11].filter(function (p) { return c.ep[p] !== p || c.eo[p] !== 0; });
      if (!wrong.length) break;
      var cand = [0, 1, 2, 3].filter(function (p) { return c.ep[p] >= 8; });
      moves = [];
      if (cand.length) {
        var p0 = cand[0];
        var side = s[EFI[p0][1]], topc = s[EFI[p0][0]];
        var rotE = rotationTo(function (cu, tt) { return tt[2 * 9 + 4] === side; });
        moves = moves.concat(rotE ? run(rotE) : []);
        var jj = [0, 1, 2, 3].filter(function (q) { var tt = UT[q] ? M3.apply(s, UT[q]) : s; return tt[EFI[1][1]] === side && tt[EFI[1][0]] === topc; })[0];
        if (jj) moves = moves.concat(run(UT[jj]));
        var goRight = cc(1) === topc;
        moves = moves.concat(run(goRight ? ALG.right : ALG.left));
        step(3, 'Middle: the ' + nm(side) + '-' + nm(topc) + ' edge',
          (rotE ? 'Turn the whole cube (' + MV.pretty(rotE) + ') so the ' + nm(side) + ' center faces you. ' : 'The ' + nm(side) + ' center already faces you. ') +
          (jj ? 'Turn the top (' + MV.pretty(UT[jj]) + ') so the edge’s front color matches the ' + nm(side) + ' center below it. ' : 'The edge already lines up with the ' + nm(side) + ' center below it. ') +
          'Its top color is ' + nm(topc) + ', so it goes to the ' + (goRight ? 'right: U R U′ R′ U′ F′ U F.' : 'left: U′ L′ U L U F U′ F′.'), moves);
      } else {
        var slot = wrong[0], scol = [s[EFI[slot][0]], s[EFI[slot][1]]].sort().join(',');
        var rotS = rotationTo(function (cu, tt) { var q = edgeAt(tt, scol); return q === 8; });
        moves = moves.concat(rotS ? run(rotS) : []).concat(run(ALG.right));
        step(3, 'Middle: lift an edge out', 'A middle edge is in the wrong spot or flipped, and no top edge is ready to go in. ' + (rotS ? 'Turn the whole cube (' + MV.pretty(rotS) + ') so it is at the front right, then ' : 'It is at the front right, so ') + 'do the right-hand algorithm once to swap it for a top edge.', moves);
      }
    }

    // 4. yellow cross
    guard = 0;
    for (;;) {
      if (++guard > 8) throw new Error('cross stage stuck');
      c = cub();
      var ok = [0, 1, 2, 3].filter(function (p) { return c.eo[p] === 0; });
      if (ok.length === 4) break;
      moves = []; var shape;
      if (ok.length === 0) shape = 'dot';
      else {
        var setup = [0, 1, 2, 3].filter(function (q) { var cu = th.fromFacelets(UT[q] ? M3.apply(s, UT[q]) : s); return (cu.eo[0] === 0 && cu.eo[2] === 0) || (cu.eo[2] === 0 && cu.eo[3] === 0 && cu.eo[0] && cu.eo[1]); })[0];
        if (setup) moves = moves.concat(run(UT[setup]));
        c = cub(); shape = c.eo[0] === 0 && c.eo[2] === 0 ? 'line' : 'L';
      }
      moves = moves.concat(run(ALG.fru));
      step(4, 'Top cross: ' + (shape === 'dot' ? 'from a dot' : shape === 'line' ? 'from a line' : 'from an L'),
        shape === 'dot' ? 'No ' + nm(top) + ' edges face up yet, only the center (a dot). Do F R U R′ U′ F′ once to get an L or a line.' :
        shape === 'line' ? 'Two ' + nm(top) + ' edges and the center make a line. ' + (moves.length > 6 ? 'Turn the top so the line runs left to right, then ' : 'It already runs left to right, so ') + 'do F R U R′ U′ F′.' :
        'Two ' + nm(top) + ' edges make an L with the center. ' + (moves.length > 6 ? 'Turn the top so the L points to the back and the left, then ' : 'It already points to the back and the left, so ') + 'do F R U R′ U′ F′.', moves);
    }

    // 5. yellow edges match their side centers
    function matched(t) { var n = []; [[1, 2], [0, 1], [3, 5], [2, 4]].forEach(function (pf) { if (t[EFI[pf[0]][1]] === t[pf[1] * 9 + 4]) n.push(pf[1]); }); return n; }
    guard = 0;
    for (;;) {
      if (++guard > 6) throw new Error('edge stage stuck');
      var bestJ = 0, bestN = -1;
      for (var q = 0; q < 4; q++) { var nq = matched(UT[q] ? M3.apply(s, UT[q]) : s).length; if (nq > bestN) { bestN = nq; bestJ = q; } }
      moves = [];
      if (bestJ) moves = moves.concat(run(UT[bestJ]));
      var mm = matched(s);
      if (mm.length === 4) { if (moves.length) step(5, 'Top edges: line them up', 'Turn the top (' + MV.pretty(UT[bestJ]) + ') so every ' + nm(top) + ' edge matches the center below it.', moves); break; }
      var adj = mm.length === 2 && MV && !(mm.indexOf(2) >= 0 && mm.indexOf(5) >= 0) && !(mm.indexOf(1) >= 0 && mm.indexOf(4) >= 0);
      var rotY = '';
      if (adj) {
        rotY = rotationTo(function (cu, tt) { var m2 = matched(tt); return m2.indexOf(5) >= 0 && m2.indexOf(1) >= 0; }) || '';
        if (rotY) moves = moves.concat(run(rotY));
      }
      moves = moves.concat(run(ALG.sune));
      step(5, 'Top edges: ' + (adj ? 'swap the front and left' : 'mix them up once'),
        (bestJ ? 'Turn the top (' + MV.pretty(UT[bestJ]) + ') so as many ' + nm(top) + ' edges as possible match their centers. ' : '') +
        (adj ? 'Two matching edges sit side by side. ' + (rotY ? 'Turn the whole cube (' + MV.pretty(rotY) + ') so they are at the back and the right, then ' : 'They are already at the back and the right, so ') + 'do R U R′ U R U2 R′ U to swap the front and left edges.' :
          'The matching edges are across from each other (or only one matches). Do R U R′ U R U2 R′ U once from here; after that two neighbors will match.'), moves);
    }

    // 6. yellow corners into their places
    function cornerOk(t, p) {
      var want = CFI[p].map(function (x) { return t[M3.face[x] * 9 + 4]; }).sort().join(','), have = CFI[p].map(function (x) { return t[x]; }).sort().join(',');
      return want === have;
    }
    guard = 0;
    for (;;) {
      if (++guard > 6) throw new Error('corner place stuck');
      var placed = [0, 1, 2, 3].filter(function (p) { return cornerOk(s, p); });
      if (placed.length === 4) break;
      moves = []; var rotC = '';
      if (placed.length) { rotC = rotationTo(function (cu, tt) { return cornerOk(tt, 0); }) || ''; if (rotC) moves = moves.concat(run(rotC)); }
      moves = moves.concat(run(ALG.niklas));
      step(6, 'Top corners: move them into place',
        placed.length ? 'One ' + nm(top) + ' corner is already in its right spot (its colors match the three centers around it, even if it is turned). ' + (rotC ? 'Turn the whole cube (' + MV.pretty(rotC) + ') so it is at the front right, then ' : 'It is at the front right, so ') + 'do U R U′ L′ U R′ U′ L. This moves the other three around.' :
          'No ' + nm(top) + ' corner is in its right spot yet. Do U R U′ L′ U R′ U′ L once; then one will be.', moves);
    }

    // 7. turn the yellow corners
    guard = 0; var first = true;
    for (;;) {
      if (++guard > 12) throw new Error('corner twist stuck');
      c = cub();
      var un = [0, 1, 2, 3].filter(function (p) { return c.co[p] !== 0; });
      if (!un.length) break;
      moves = [];
      var jt = [0, 1, 2, 3].filter(function (q) { return th.fromFacelets(UT[q] ? M3.apply(s, UT[q]) : s).co[0] !== 0; })[0];
      if (jt) moves = moves.concat(run(UT[jt]));
      var n2 = 0; while (cub().co[0] !== 0) { moves = moves.concat(run(ALG.twist), run(ALG.twist)); n2 += 2; if (n2 > 4) throw new Error('twist'); }
      step(7, 'Top corners: turn one', (first ? 'Hold the cube still from here on: don’t turn the whole cube until the end of this step. ' : '') +
        (jt ? 'Turn the top (' + MV.pretty(UT[jt]) + ') to bring a corner that isn’t ' + nm(top) + '-up to the front right. ' : 'The corner at the top front right isn’t ' + nm(top) + '-up. ') +
        'Repeat R′ D′ R D until ' + nm(top) + ' faces up: ' + n2 + ' times here. The bottom looks scrambled for a while. That’s normal; it comes back.', moves);
      first = false;
    }
    var fin = [0, 1, 2, 3].filter(function (q) { return M3.isSolved(UT[q] ? M3.apply(s, UT[q]) : s); })[0];
    if (fin === undefined) throw new Error('not solved at the end');
    if (fin) step(7, 'Last turn', 'Turn the top (' + MV.pretty(UT[fin]) + ') to line it up. Solved!', run(UT[fin]));
    return { steps: steps, moves: [].concat.apply([], steps.map(function (x) { return x.moves; })), end: s };
  }
  // helpers that work on raw stickers so a piece can be followed while the whole cube turns
  function locate(t, cols) { for (var p = 0; p < 8; p++) if (CFI[p].map(function (x) { return t[x]; }).sort().join(',') === cols) return p; return -1; }
  function locateAfter(t, cols, mv) { return locate(mv ? M3.apply(t, mv) : t, cols); }
  function homeOfColors(t, cols) { for (var p = 0; p < 8; p++) if (CFI[p].map(function (x) { return t[M3.face[x] * 9 + 4]; }).sort().join(',') === cols) return p; return -1; }
  function edgeAt(t, cols) { for (var p = 0; p < 12; p++) if (EFI[p].map(function (x) { return t[x]; }).sort().join(',') === cols) return p; return -1; }

  NS.beginner = { solve: solve, ALG: ALG, STAGES: ['Hold the cube', 'The white cross', 'The white corners', 'The middle layer', 'The top cross', 'The top edges', 'Top corners into place', 'Turn the top corners'] };
})(globalThis);
