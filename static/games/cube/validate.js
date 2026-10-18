/* Cube Solver: checks a painted cube before solving (TRBCube.validate), written for this site.
   validate(N, stickers, mode) -> { complete, ok, issues: [{kind: 'error' | 'note', text, stickers}], colorAt, opp }
   mode 'standard' expects white opposite yellow, green opposite blue, red opposite orange, with red to the
   right of green when white is on top; mode 'auto' works the color scheme out from the cube itself.
   Problems are explained in plain words and point at the stickers involved, so a mistake can be found. */
(function (G) {
  'use strict';
  var NS = G.TRBCube, th = NS.three;
  var CN = NS.COLOR_NAMES;
  var STD = [0, 1, 2, 3, 4, 5], STD_OPP = [3, 4, 5, 0, 1, 2];
  function nm(c) { return CN[c] || 'unpainted'; }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function cyc(a, b) { for (var r = 0; r < 3; r++) if (a[r] === b[0] && a[(r + 1) % 3] === b[1] && a[(r + 2) % 3] === b[2]) return true; return false; }
  var orbitCache = {};
  // stickers that every move keeps in one family (for 4×4 wings: which of the two stickers is the "first")
  function orbit(N, start) {
    var k = N + ':' + start; if (orbitCache[k]) return orbitCache[k];
    var m = NS.model(N), seen = {}, q = [start]; seen[start] = 1;
    var names = m.names.filter(function (n) { return !/^[xyz]/.test(n); });
    while (q.length) {
      var i = q.shift();
      names.forEach(function (n) { var p = m.moves[n].perm; for (var j = 0; j < p.length; j++) if (p[j] === i && !seen[j]) { seen[j] = 1; q.push(j); } });
    }
    return (orbitCache[k] = seen);
  }
  // the facelets of each corner in clockwise order, for any size
  function cornerStickers(N) { return th.CF.map(function (cn) { return cn.map(function (t) { return th.fi(N, t); }); }); }
  function edgeStickers(N) {
    var m = NS.model(N), out = [];
    m.cubies.forEach(function (q) { if (q.kind === 'edge') out.push(q.st.slice().sort(function (a, b) { return m.face[a] - m.face[b]; })); });
    return out;
  }
  function corneTypes(colorAt) { return th.CCOL.map(function (cc) { return cc.map(function (f) { return colorAt[f]; }); }); }
  function pieceName(cols) { return cols.map(nm).join('-'); }

  function validate(N, s, mode) {
    var m = NS.model(N), issues = [], i, c;
    var per = N * N, unpainted = [], count = [0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) { if (s[i] < 0) unpainted.push(i); else count[s[i]]++; }
    var complete = unpainted.length === 0;
    function err(text, st) { issues.push({ kind: 'error', text: text, stickers: st || [] }); }
    if (!complete) issues.push({ kind: 'note', text: unpainted.length + (unpainted.length === 1 ? ' sticker still needs' : ' stickers still need') + ' a color.', stickers: [] });
    var over = [], under = [];
    for (c = 0; c < 6; c++) { if (count[c] > per) over.push(count[c] + ' ' + nm(c)); else if (complete && count[c] < per) under.push(count[c] + ' ' + nm(c)); }
    if (over.length || under.length) {
      var overCols = []; for (c = 0; c < 6; c++) if (count[c] > per) overCols.push(c);
      var overSt = []; for (i = 0; i < s.length; i++) if (overCols.indexOf(s[i]) >= 0) overSt.push(i);
      err('There are ' + list(over.concat(under)) + ' stickers. A ' + N + '×' + N + ' has exactly ' + per + ' of each color.', overSt);
    }
    // which colors are opposite, and how the scheme is turned
    var opp = null, colorAt = null;
    if (N === 3) {
      var cen = [0, 1, 2, 3, 4, 5].map(function (f) { return s[f * 9 + 4]; }), cenSt = [4, 13, 22, 31, 40, 49];
      var known = cen.filter(function (x) { return x >= 0; });
      var dup = known.filter(function (x, j) { return known.indexOf(x) !== j; });
      if (dup.length) err('Two centers are both ' + nm(dup[0]) + '. Each of the six centers is a different color, and they never move relative to each other.', cenSt.filter(function (j, f) { return cen[f] === dup[0]; }));
      else if (known.length === 6) {
        colorAt = cen;
        opp = []; for (var f = 0; f < 6; f++) opp[cen[f]] = cen[NS.OPP[f]];
        if (mode !== 'auto') {
          var badPair = [0, 1, 2].filter(function (f) { return STD_OPP[cen[f]] !== cen[f + 3]; });
          if (badPair.length) err('On a standard cube ' + list(badPair.map(function (f) { return nm(cen[f]) + ' is opposite ' + nm(STD_OPP[cen[f]]); })) + ', but these centers have ' + list(badPair.map(function (f) { return nm(cen[f]) + ' opposite ' + nm(cen[f + 3]); })) + '. Check the centers, or switch the color scheme to "Work it out from my cube".', badPair.map(function (f) { return cenSt[f]; }).concat(badPair.map(function (f) { return cenSt[f + 3]; })));
          else if (!sameHand(cen, STD)) err('The centers are a mirror image of the standard cube: with white on top and green in front, red belongs on the right. Check the side centers, or switch the color scheme to "Work it out from my cube".', cenSt);
        }
      }
    } else if (mode !== 'auto') { opp = STD_OPP; colorAt = STD; }
    var CS = cornerStickers(N), ES = edgeStickers(N);
    if (N !== 3 && mode === 'auto' && complete) {
      // work out opposite colors: the one color that never shares a corner
      var near = []; for (c = 0; c < 6; c++) near[c] = [0, 0, 0, 0, 0, 0];
      CS.forEach(function (cs) { var col = cs.map(function (x) { return s[x]; }); for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) if (a !== b && col[a] >= 0 && col[b] >= 0) near[col[a]][col[b]]++; });
      opp = [];
      var okOpp = true;
      for (c = 0; c < 6; c++) { var z = []; for (var d = 0; d < 6; d++) if (d !== c && !near[c][d]) z.push(d); if (z.length !== 1) okOpp = false; else opp[c] = z[0]; }
      for (c = 0; c < 6 && okOpp; c++) if (opp[opp[c]] !== c) okOpp = false;
      if (!okOpp) { err('The corners don’t fit together. On a real cube every color has one opposite color that never shares a corner with it, and here that doesn’t work out. Look for a corner with two colors that should be on opposite sides.', []); opp = null; }
      else {
        // which hand the colors go around: the one most corners agree with
        var cand = null, bestN = -1;
        CS.forEach(function (cs) {
          var col = cs.map(function (x) { return s[x]; });
          if (col[0] === col[1] || col[1] === col[2] || col[0] === col[2]) return;
          var ca = [col[0], col[1], col[2], opp[col[0]], opp[col[1]], opp[col[2]]];
          var types = corneTypes(ca), n = 0;
          CS.forEach(function (cs2) { var c2 = cs2.map(function (x) { return s[x]; }); if (types.some(function (t) { return cyc(c2, t); })) n++; });
          if (n > bestN) { bestN = n; cand = ca; }
        });
        colorAt = cand;
      }
    }
    // corners
    var types = colorAt ? corneTypes(colorAt) : null, seenC = {};
    CS.forEach(function (cs) {
      var col = cs.map(function (x) { return s[x]; });
      if (col.some(function (x) { return x < 0; })) return;
      if (col[0] === col[1] || col[1] === col[2] || col[0] === col[2]) { err('A corner has two ' + nm(col[0] === col[1] || col[0] === col[2] ? col[0] : col[1]) + ' stickers. Every corner has three different colors.', cs); return; }
      if (!opp) return;
      for (var a = 0; a < 3; a++) for (var b = a + 1; b < 3; b++) if (opp[col[a]] === col[b]) { err('A corner has ' + nm(col[a]) + ' and ' + nm(col[b]) + '. Those colors are on opposite sides, so no corner has both.', cs); return; }
      if (!types) return;
      var t = types.filter(function (tt) { return cyc(col, tt); })[0];
      if (!t) {
        err('The ' + pieceName(col) + ' corner’s colors go around the wrong way: it is a mirror image of the real one. Two of its stickers are probably swapped.', cs);
        return;
      }
      var k = t.join();
      if (seenC[k]) { err('There are two ' + pieceName(t) + ' corners. Every corner is different.', seenC[k].concat(cs)); }
      else seenC[k] = cs;
    });
    // edges (3×3) or wings (4×4)
    var seenE = {}, O1 = N === 4 ? orbit(4, ES[0][0]) : null;
    ES.forEach(function (es) {
      var col = es.map(function (x) { return s[x]; });
      if (col[0] < 0 || col[1] < 0) return;
      if (col[0] === col[1]) { err('An edge has two ' + nm(col[0]) + ' stickers. Every edge has two different colors.', es); return; }
      if (opp && opp[col[0]] === col[1]) { err('An edge has ' + nm(col[0]) + ' and ' + nm(col[1]) + '. Those colors are on opposite sides, so no edge has both.', es); return; }
      var k;
      if (N === 4) { var first = O1[es[0]] ? 0 : 1; k = col[first] + ',' + col[1 - first]; }
      else k = col.slice().sort().join();
      if (seenE[k]) {
        if (N === 4) err('Two of the ' + pieceName(col.slice().sort()) + ' edge pieces are the same hand. On a 4×4 each two-color edge comes as a left-hand and a right-hand piece. One of these probably has its two stickers swapped.', seenE[k].concat(es));
        else err('There are two ' + pieceName(col.slice().sort()) + ' edges. Every edge is different.', seenE[k].concat(es));
      } else seenE[k] = es;
    });
    if (N === 4) {
      var cc = [0, 0, 0, 0, 0, 0], cst = [[], [], [], [], [], []];
      for (var f4 = 0; f4 < 6; f4++) for (var r = 1; r <= 2; r++) for (var q = 1; q <= 2; q++) { var x = m.idx(f4, r, q); if (s[x] >= 0) { cc[s[x]]++; cst[s[x]].push(x); } }
      for (c = 0; c < 6; c++) if (cc[c] > 4 || (complete && cc[c] !== 4)) err('There are ' + cc[c] + ' ' + nm(c) + ' center pieces. A 4×4 has 4 of each color in the middle of the faces.', cc[c] > 4 ? cst[c] : []);
    }
    var errors = issues.filter(function (x) { return x.kind === 'error'; }).length;
    // whole-cube checks
    if (complete && !errors && colorAt) {
      if (N === 3) {
        var cub = th.fromFacelets(s);
        if (!cub) err('Some pieces don’t match the centers. Check the stickers again.', []);
        else {
          var v = th.verify(cub);
          if (v.twist) err('One corner is twisted. Turning the faces can never twist a single corner, so if every sticker was entered right, a corner has been twisted in place or taken out and put back. More often one corner’s colors were entered one step around. Check each corner.', []);
          if (v.flip) err('One edge is flipped. Turning the faces always flips edges two at a time, so an odd one out means an edge was popped out and put back the other way, or two stickers on one edge were swapped when entering. Check the edges.', []);
          if (v.parity) err('Two pieces are swapped. Turns always move pieces in a way that keeps an even number of swaps, so a single swap of two edges or two corners can’t be made or undone by turning. Most often two stickers were entered in each other’s place.', []);
        }
      } else {
        var dblCol = CS[6].map(function (x) { return s[x]; });
        var at = [opp[dblCol[0]], opp[dblCol[2]], opp[dblCol[1]], dblCol[0], dblCol[2], dblCol[1]];
        if (!sameHand(at, colorAt)) at = null;
        if (!at) err('The corner at the back-bottom-left doesn’t fit the others. Check its three stickers.', CS[6]);
        else {
          var tw = 0, okc = true;
          CS.forEach(function (cs) {
            var col = cs.map(function (x) { return s[x]; }), j = col.indexOf(at[0]) >= 0 ? col.indexOf(at[0]) : col.indexOf(at[3]);
            if (j < 0) okc = false; else tw += j;
          });
          if (okc && tw % 3) err('One corner is twisted. Turning the faces can never twist a single corner, so if every sticker is right, a corner has been twisted in place. More often one corner’s colors were entered one step around. Check each corner.', []);
          colorAt = at;
        }
      }
    }
    errors = issues.filter(function (x) { return x.kind === 'error'; }).length;
    return { complete: complete, ok: complete && !errors, issues: issues, colorAt: colorAt, opp: opp, unpainted: unpainted.length };
  }
  // do two color layouts (U R F D L B) go around the same way?
  function sameHand(a, b) {
    var ta = corneTypes(a), tb = corneTypes(b);
    return tb.every(function (t) { return ta.some(function (u) { return cyc(t, u); }); });
  }
  NS.validate = validate;
  NS.validateHelpers = { orbit: orbit, edgeStickers: edgeStickers, cornerStickers: cornerStickers, sameHand: sameHand };
})(globalThis);
