/* Cube Solver: the sticker model for 2×2, 3×3 and 4×4 cubes (TRBCube.model(N)).
   Faces are numbered U R F D L B (0..5). Sticker i = face*N*N + row*N + col, laid out like the usual net:
   U seen from above with the back edge at the top, D seen from below with the front edge at the top,
   F R B L seen from the side with U at the top. Colors are numbered the same way for the standard scheme:
   0 white (U), 1 red (R), 2 green (F), 3 yellow (D), 4 orange (L), 5 blue (B); -1 means "not painted yet".
   Moves are permutations built from the 3-D geometry, so every size uses the same code.
   Works in the page, in a Web Worker and in node (everything hangs off globalThis.TRBCube). */
(function (G) {
  'use strict';
  var NS = G.TRBCube = G.TRBCube || {};
  var FACES = 'URFDLB';
  var NORM = [[0, 1, 0], [1, 0, 0], [0, 0, 1], [0, -1, 0], [-1, 0, 0], [0, 0, -1]];
  var OPP = [3, 4, 5, 0, 1, 2];

  function stickerPos(N, f, r, c) {
    var a = -(N - 1) + 2 * c, b = (N - 1) - 2 * r;
    switch (f) {
      case 0: return [a, N, -(N - 1) + 2 * r];
      case 1: return [N, b, (N - 1) - 2 * c];
      case 2: return [a, b, N];
      case 3: return [a, -N, (N - 1) - 2 * r];
      case 4: return [-N, b, -(N - 1) + 2 * c];
      default: return [(N - 1) - 2 * c, b, -N];
    }
  }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  // rotate v by a quarter turn clockwise as seen looking at the face whose outward normal is n
  function rotCW(v, n) { var c = cross(n, v), d = dot(n, v); return [-c[0] + n[0] * d, -c[1] + n[1] * d, -c[2] + n[2] * d]; }

  var cache = {};
  function model(N) {
    if (cache[N]) return cache[N];
    var NN = N * N, count = 6 * NN, pos = [], nrm = [], face = [], cub = [], key = {};
    for (var f = 0; f < 6; f++) for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var p = stickerPos(N, f, r, c), i = f * NN + r * N + c;
      pos[i] = p; nrm[i] = NORM[f]; face[i] = f;
      cub[i] = [p[0] - NORM[f][0], p[1] - NORM[f][1], p[2] - NORM[f][2]];
      key[p.join(',')] = i;
    }
    // cubies: stickers grouped by the little cube they sit on
    var cubMap = {}, cubies = [];
    for (i = 0; i < count; i++) {
      var k = cub[i].join(',');
      if (!(k in cubMap)) { cubMap[k] = cubies.length; cubies.push({ center: cub[i], st: [] }); }
      cubies[cubMap[k]].st.push(i);
    }
    var cubieOf = new Int16Array(count);
    cubies.forEach(function (q, j) { q.st.forEach(function (s) { cubieOf[s] = j; }); q.kind = q.st.length === 3 ? 'corner' : q.st.length === 2 ? 'edge' : 'center'; });

    // layer k (0 = outermost) of a sticker along face f's axis
    function layer(i, f) { return Math.round((N - 1 - dot(cub[i], NORM[f])) / 2); }
    function buildPerm(f, layers, q) {
      var perm = new Int16Array(count), on = {};
      layers.forEach(function (l) { on[l] = 1; });
      for (var i = 0; i < count; i++) perm[i] = i;
      for (i = 0; i < count; i++) {
        if (!on[layer(i, f)]) continue;
        var p = pos[i];
        for (var t = 0; t < q; t++) p = rotCW(p, NORM[f]);
        perm[key[p.join(',')]] = i; // pull: the sticker now at the new place came from i
      }
      return perm;
    }
    var moves = {}, all = [];
    function add(name, f, layers, q) { moves[name] = { name: name, face: f, layers: layers, q: q, perm: buildPerm(f, layers, q) }; all.push(name); }
    var SUF = ['', '2', "'"];
    for (f = 0; f < 6; f++) for (var q = 1; q <= 3; q++) {
      add(FACES[f] + SUF[q - 1], f, [0], q);
      if (N >= 3) add(FACES[f] + 'w' + SUF[q - 1], f, [0, 1], q);
      if (N >= 4) add('i' + FACES[f] + SUF[q - 1], f, [1], q); // inner slice, only used inside the solvers
    }
    var every = []; for (var l = 0; l < N; l++) every.push(l);
    for (q = 1; q <= 3; q++) { add('x' + SUF[q - 1], 1, every, q); add('y' + SUF[q - 1], 0, every, q); add('z' + SUF[q - 1], 2, every, q); }
    if (N === 3) for (q = 1; q <= 3; q++) { add('M' + SUF[q - 1], 4, [1], q); add('E' + SUF[q - 1], 3, [1], q); add('S' + SUF[q - 1], 2, [1], q); }

    var m = {
      N: N, NN: NN, count: count, pos: pos, nrm: nrm, face: face, cub: cub, cubies: cubies, cubieOf: cubieOf,
      moves: moves, names: all, FACES: FACES, NORM: NORM, OPP: OPP, layer: layer,
      solved: function () { var s = new Int8Array(count); for (var i = 0; i < count; i++) s[i] = face[i]; return s; },
      blank: function () { var s = new Int8Array(count); s.fill(-1); return s; },
      idx: function (f, r, c) { return f * NN + r * N + c; },
      apply: function (s, name) {
        var mv = moves[norm(name)]; if (!mv) throw new Error('Unknown move ' + name);
        var o = new Int8Array(count), p = mv.perm; for (var i = 0; i < count; i++) o[i] = s[p[i]]; return o;
      },
      applyAll: function (s, list) { if (typeof list === 'string') list = parse(list); for (var i = 0; i < list.length; i++) s = m.apply(s, list[i]); return s; },
      isSolved: function (s) {
        for (var f = 0; f < 6; f++) { var c0 = s[f * NN]; for (var i = 1; i < NN; i++) if (s[f * NN + i] !== c0) return false; }
        return true;
      },
      has: function (name) { return !!moves[norm(name)]; }
    };
    cache[N] = m;
    return m;
  }

  // --- move strings ---
  function norm(t) {
    t = String(t).replace(/[’′`]/g, "'").replace(/2'$/, '2');
    var mm = /^([URFDLB])w(.*)$/.exec(t); if (mm) return mm[1] + 'w' + mm[2];
    mm = /^([urfdlb])(.*)$/.exec(t); if (mm) return mm[1].toUpperCase() + 'w' + mm[2]; // r = Rw
    return t;
  }
  function parse(str) {
    if (Array.isArray(str)) return str.slice();
    var out = [], toks = String(str).replace(/[()\[\],]/g, ' ').trim().split(/\s+/);
    toks.forEach(function (t) { if (t) out.push(norm(t)); });
    return out;
  }
  function validToken(t, N) {
    t = norm(t);
    var re = N === 2 ? /^[URFDLBxyz](2|')?$/ : N === 3 ? /^([URFDLB]w?|[xyzMES])(2|')?$/ : /^([URFDLB]w?|[xyz])(2|')?$/;
    return re.test(t);
  }
  function base(t) { return t.replace(/(2|')$/, ''); }
  function amount(t) { return /2$/.test(t) ? 2 : /'$/.test(t) ? 3 : 1; }
  function withAmount(b, q) { q = ((q % 4) + 4) % 4; return q === 0 ? null : q === 1 ? b : q === 2 ? b + '2' : b + "'"; }
  function invert(list) { return parse(list).reverse().map(function (t) { return withAmount(base(t), 4 - amount(t)); }); }
  // merge neighbors on the same layer (R R -> R2, R R' -> nothing), repeatedly
  function simplify(list) {
    var out = [];
    parse(list).forEach(function (t) {
      var b = base(t), q = amount(t);
      if (out.length && base(out[out.length - 1]) === b) { var nt = withAmount(b, amount(out.pop()) + q); if (nt) out.push(nt); }
      else out.push(t);
    });
    return out;
  }
  function isRotation(t) { return /^[xyz]/.test(t); }
  function turnCount(list) { return parse(list).filter(function (t) { return !isRotation(t); }).length; }

  // random-move scramble: no two turns of the same face in a row, no "R L R"
  function randomMoves(N, len, rnd) {
    rnd = rnd || Math.random;
    var faces = N === 4 ? ['U', 'R', 'F', 'D', 'L', 'B', 'Uw', 'Rw', 'Fw'] : ['U', 'R', 'F', 'D', 'L', 'B'];
    var axis = { U: 0, D: 0, Uw: 0, R: 1, L: 1, Rw: 1, F: 2, B: 2, Fw: 2 };
    var out = [], used = {}, lastAxis = -1;
    while (out.length < len) {
      var f = faces[Math.floor(rnd() * faces.length)], a = axis[f];
      if (a === lastAxis && used[f]) continue;
      if (a !== lastAxis) { used = {}; lastAxis = a; }
      used[f] = 1;
      out.push(f + ['', '2', "'"][Math.floor(rnd() * 3)]);
    }
    return out;
  }
  function pretty(t) { return t.replace(/'/g, '′'); }

  NS.model = model;
  NS.moves = { parse: parse, norm: norm, invert: invert, simplify: simplify, base: base, amount: amount, withAmount: withAmount, isRotation: isRotation, turnCount: turnCount, validToken: validToken, randomMoves: randomMoves, pretty: pretty };
  NS.FACES = FACES; NS.OPP = OPP;
  NS.COLOR_NAMES = ['white', 'red', 'green', 'yellow', 'orange', 'blue'];
})(globalThis);
