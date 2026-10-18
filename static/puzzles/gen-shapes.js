/* Space and shape families: mazes, matchstick equations, piece fitting, cube nets and turned shapes. */
(function (root) {
  'use strict';
  var P = root.TRBPuzzles, esc = P.esc;

  /* ================= Mazes ================= */
  P.mazeMake = function (r, w, h) {
    /* walls: right[i], down[i] true when there is a wall; a perfect maze made by a random depth-first walk */
    var right = new Array(w * h).fill(true), down = new Array(w * h).fill(true), seen = new Array(w * h).fill(false), stack = [0];
    seen[0] = true;
    while (stack.length) {
      var c = stack[stack.length - 1], x = c % w, y = Math.floor(c / w), nb = [];
      if (x > 0 && !seen[c - 1]) nb.push(c - 1); if (x < w - 1 && !seen[c + 1]) nb.push(c + 1);
      if (y > 0 && !seen[c - w]) nb.push(c - w); if (y < h - 1 && !seen[c + w]) nb.push(c + w);
      if (!nb.length) { stack.pop(); continue; }
      var n = r.pick(nb);
      if (n === c + 1) right[c] = false; else if (n === c - 1) right[n] = false; else if (n === c + w) down[c] = false; else down[n] = false;
      seen[n] = true; stack.push(n);
    }
    return { w: w, h: h, right: right, down: down };
  };
  P.mazeNbrs = function (m, c) {
    var w = m.w, x = c % w, out = [];
    if (x < w - 1 && !m.right[c]) out.push(c + 1); if (x > 0 && !m.right[c - 1]) out.push(c - 1);
    if (c + w < w * m.h && !m.down[c]) out.push(c + w); if (c - w >= 0 && !m.down[c - w]) out.push(c - w);
    return out;
  };
  P.mazePath = function (m) {
    var end = m.w * m.h - 1, prev = {}, q = [0]; prev[0] = -1;
    while (q.length) { var c = q.shift(); if (c === end) break; P.mazeNbrs(m, c).forEach(function (n) { if (!(n in prev)) { prev[n] = c; q.push(n); } }); }
    var path = [end]; while (prev[path[0]] >= 0) path.unshift(prev[path[0]]);
    return path;
  };
  function mazeSvg(m, path, cellIn, label) {
    var s = 20, W = m.w * s + 6, H = m.h * s + 6, o = 3, out = '<rect width="' + W + '" height="' + H + '" fill="#fff"/>', d = '';
    for (var i = 0; i < m.w * m.h; i++) {
      var x = o + (i % m.w) * s, y = o + Math.floor(i / m.w) * s;
      if (m.right[i] && !(i === m.w * m.h - 1)) d += 'M' + (x + s) + ' ' + y + 'v' + s;
      if (m.down[i] && !(i === m.w * m.h - 1 && false)) d += 'M' + x + ' ' + (y + s) + 'h' + s;
    }
    d += 'M' + (o + s) + ' ' + o + 'H' + (o + m.w * s) + 'M' + o + ' ' + o + 'V' + (o + m.h * s);
    /* exit: open the right wall of the last cell */
    out += '<path d="' + d + '" stroke="#000" stroke-width="2.2" stroke-linecap="square" fill="none"/>';
    out += '<path d="M' + (o + m.w * s) + ' ' + o + 'V' + (o + (m.h - 1) * s) + '" stroke="#000" stroke-width="2.2" stroke-linecap="square"/>';
    out += '<path d="M' + (o + s * 0.5 - 4) + ' ' + (o + 2) + 'l4 6 4 -6" fill="none" stroke="#000" stroke-width="1.6"/>';
    if (path) out += '<polyline points="' + path.map(function (c) { return (o + (c % m.w) * s + s / 2) + ',' + (o + Math.floor(c / m.w) * s + s / 2); }).join(' ') + ' ' + (o + m.w * s + 3) + ',' + (o + (m.h - 1) * s + s / 2) + '" fill="none" stroke="#000" stroke-width="3" stroke-dasharray="1 0" stroke-linejoin="round" opacity=".55"/>';
    return P.svg(W, H, (cellIn * W / s).toFixed(2), out, label);
  }
  P.add({
    key: 'mazes', cols: function (level) { return level === 'easy' ? 2 : 1; },
    gen: function (rng, level) {
      var dims = level === 'easy' ? [8, 10, 0.4] : level === 'medium' ? [16, 20, 0.33] : [24, 30, 0.255];
      var m = P.mazeMake(rng, dims[0], dims[1]), path = P.mazePath(m);
      return {
        q: mazeSvg(m, null, dims[2], 'maze'),
        a: mazeSvg(m, path, level === 'easy' ? 0.2 : level === 'medium' ? 0.15 : 0.12, 'maze answer'),
        sub: dims[0] + ' × ' + dims[1], play: { kind: 'maze', m: m }, data: { m: m, path: path }
      };
    }
  });

  /* ================= Matchstick equations ================= */
  var SEG = [63, 6, 91, 79, 102, 109, 125, 7, 127, 111]; /* bits a b c d e f g = 1 2 4 8 16 32 64 */
  P.SEG = SEG;
  function digitOf(m) { return SEG.indexOf(m); }
  function evalEq(sy) {
    /* sy: [{t:'d',m}, ..., {t:'o',m:3|1}, ..., {t:'e'}, ...] */
    var parts = [[]], op = null;
    for (var i = 0; i < sy.length; i++) {
      var s = sy[i];
      if (s.t === 'd') { var d = digitOf(s.m); if (d < 0) return null; parts[parts.length - 1].push(d); }
      else if (s.t === 'o') { if (s.m !== 3 && s.m !== 1) return null; op = s.m === 3 ? '+' : '−'; parts.push([]); }
      else parts.push([]);
    }
    if (parts.length !== 3 || !op) return null;
    var nums = parts.map(function (ds) { if (!ds.length || (ds.length > 1 && ds[0] === 0)) return NaN; return +ds.join(''); });
    if (nums.some(isNaN)) return null;
    return { ok: (op === '+' ? nums[0] + nums[1] : nums[0] - nums[1]) === nums[2], text: nums[0] + ' ' + op + ' ' + nums[1] + ' = ' + nums[2] };
  }
  P.matchEval = evalEq;
  function slots(sy) { var out = []; sy.forEach(function (s, i) { var n = s.t === 'd' ? 7 : s.t === 'o' ? 2 : 0; for (var b = 0; b < n; b++) out.push([i, 1 << b]); }); return out; }
  P.matchMoves = function (sy) {
    /* every equation reachable by moving one match */
    var sl = slots(sy), res = [];
    sl.forEach(function (from) {
      if (!(sy[from[0]].m & from[1])) return;
      sl.forEach(function (to) {
        if (sy[to[0]].m & to[1]) return;
        if (from[0] === to[0] && from[1] === to[1]) return;
        var ns = sy.map(function (s) { return { t: s.t, m: s.m }; });
        ns[from[0]].m &= ~from[1]; ns[to[0]].m |= to[1];
        var e = evalEq(ns); if (e) res.push({ sy: ns, e: e, from: from, to: to });
      });
    });
    return res;
  };
  function eqSyms(a, op, b, c) {
    var sy = [];
    String(a).split('').forEach(function (d) { sy.push({ t: 'd', m: SEG[+d] }); });
    sy.push({ t: 'o', m: op === '+' ? 3 : 1 });
    String(b).split('').forEach(function (d) { sy.push({ t: 'd', m: SEG[+d] }); });
    sy.push({ t: 'e', m: 0 });
    String(c).split('').forEach(function (d) { sy.push({ t: 'd', m: SEG[+d] }); });
    return sy;
  }
  function stick(x1, y1, x2, y2, style) {
    var cls = style === 'ghost' ? ' stroke="#000" stroke-width="1.2" stroke-dasharray="3 3" fill="none"' : style === 'new' ? ' fill="#fff" stroke="#000" stroke-width="2"' : ' fill="#fff" stroke="#000" stroke-width="1.6"';
    var horiz = y1 === y2, L = horiz ? x2 - x1 : y2 - y1, t = 6;
    var rect = horiz ? '<rect x="' + (x1 + 2) + '" y="' + (y1 - t / 2) + '" width="' + (L - 4) + '" height="' + t + '" rx="2"' + cls + '/>' : '<rect x="' + (x1 - t / 2) + '" y="' + (y1 + 2) + '" width="' + t + '" height="' + (L - 4) + '" rx="2"' + cls + '/>';
    if (style === 'ghost') return rect;
    var hx = horiz ? x2 - 6 : x1, hy = horiz ? y1 : y1 + 6;
    return rect + '<circle cx="' + hx + '" cy="' + hy + '" r="4.6" fill="#000"/>' + (style === 'new' ? '<rect x="' + ((horiz ? x1 : x1 - 9)) + '" y="' + (horiz ? y1 - 9 : y1) + '" width="' + (horiz ? L : 18) + '" height="' + (horiz ? 18 : L) + '" fill="none" stroke="#000" stroke-width="1.2" rx="4"/>' : '');
  }
  function eqSvg(sy, mark) {
    /* mark: {from:[i,bit], to:[i,bit]} draws the moved match */
    var x = 6, out = '', L = 34, H = 2 * L;
    sy.forEach(function (s, i) {
      function st(bit, x1, y1, x2, y2) {
        var on = s.m & bit, isFrom = mark && mark.from[0] === i && mark.from[1] === bit, isTo = mark && mark.to[0] === i && mark.to[1] === bit;
        if (on) out += stick(x1, y1, x2, y2, isTo ? 'new' : '');
        else if (isFrom) out += stick(x1, y1, x2, y2, 'ghost');
      }
      if (s.t === 'd') {
        var y = 10;
        st(1, x, y, x + L, y); st(2, x + L, y, x + L, y + L); st(4, x + L, y + L, x + L, y + H); st(8, x, y + H, x + L, y + H);
        st(16, x, y + L, x, y + H); st(32, x, y, x, y + L); st(64, x, y + L, x + L, y + L);
        x += L + 22;
      } else if (s.t === 'o') {
        st(1, x, 10 + L, x + L, 10 + L); st(2, x + L / 2, 10 + L / 2, x + L / 2, 10 + L * 1.5); x += L + 22;
      } else {
        out += stick(x, 10 + L - 8, x + L, 10 + L - 8, '') + stick(x, 10 + L + 8, x + L, 10 + L + 8, ''); x += L + 22;
      }
    });
    return P.svg(x - 10, H + 22, ((x - 10) * 0.0103).toFixed(2), out, 'matchstick equation');
  }
  P.add({
    key: 'matchsticks', keyTop: function () { return '<p class="pz-chart">In each answer, the dashed outline shows where the stick came from, and the boxed stick shows where it went.</p>'; },
    cols: function (level) { return level === 'hard' ? 1 : 2; },
    gen: function (rng, level) {
      return P.tryGen(rng, function (r) {
        var a, b, op = r.pick(['+', '−']), c;
        if (level === 'hard') { a = r.int(10, 59); b = r.int(1, 9); } else { a = r.int(0, 9); b = r.int(0, 9); }
        if (op === '−' && a < b) { var t = a; a = b; b = t; }
        c = op === '+' ? a + b : a - b;
        if (level === 'easy' && c > 9) return null;
        var truth = eqSyms(a, op, b, c), truthTxt = evalEq(truth).text;
        var cands = P.matchMoves(truth).filter(function (m) { return !m.e.ok; });
        cands = r.shuffle(cands);
        for (var k = 0; k < cands.length; k++) {
          var puzzle = cands[k].sy, fixes = P.matchMoves(puzzle).filter(function (m) { return m.e.ok; });
          var texts = fixes.map(function (m) { return m.e.text; }).filter(function (x, i, arr) { return arr.indexOf(x) === i; });
          if (texts.length === 1 && texts[0] === truthTxt) {
            var fx = fixes[0];
            return {
              q: eqSvg(puzzle) + '<p class="pz-cap">' + esc(evalEq(puzzle).text.replace(/ /g, ' ')) + '?</p>',
              a: eqSvg(fx.sy, { from: fx.from, to: fx.to }) + '<p class="pz-cap"><b>' + esc(truthTxt) + '</b></p>',
              data: { puzzle: puzzle, answer: truthTxt, wrong: evalEq(puzzle).text }
            };
          }
        }
        return null;
      });
    }
  });

  /* ================= Piece fitting (pentominoes and tetrominoes) ================= */
  var PENT = { F: '.##|##.|.#.', I: '#####', L: '#...|####', N: '##..|.###', P: '##|##|#.', T: '###|.#.|.#.', U: '#.#|###', V: '#..|#..|###', W: '#..|##.|.##', X: '.#.|###|.#.', Y: '.#..|####', Z: '##.|.#.|.##' };
  var TET = { I: '####', O: '##|##', T: '###|.#.', S: '.##|##.', L: '#..|###' };
  function cellsOf(s) { var out = []; s.split('|').forEach(function (row, y) { row.split('').forEach(function (ch, x) { if (ch === '#') out.push([x, y]); }); }); return out; }
  function norm(cs) {
    var mx = Math.min.apply(null, cs.map(function (c) { return c[0]; })), my = Math.min.apply(null, cs.map(function (c) { return c[1]; }));
    return cs.map(function (c) { return [c[0] - mx, c[1] - my]; }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; });
  }
  function key(cs) { return cs.map(function (c) { return c[0] + ',' + c[1]; }).join(';'); }
  function orients(cs) {
    var out = [], seen = {}, cur = cs;
    for (var f = 0; f < 2; f++) {
      for (var t = 0; t < 4; t++) { cur = cur.map(function (c) { return [c[1], -c[0]]; }); var n = norm(cur), k = key(n); if (!seen[k]) { seen[k] = 1; out.push(n); } }
      cur = cur.map(function (c) { return [-c[0], c[1]]; });
    }
    return out;
  }
  P.pieceOrients = orients;
  P.PENT = PENT; P.TET = TET; P.cellsOf = cellsOf;
  P.fitCount = function (region, pieces, limit) {
    /* region: list of [x,y]; pieces: list of names with shapes; count exact tilings, each piece once */
    var set = {}, order = norm(region).map(function (c) { return c; });
    region.forEach(function (c) { set[c[0] + ',' + c[1]] = 0; });
    var cellsSorted = region.slice().sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; });
    var ors = pieces.map(function (p) { return orients(cellsOf(p.s)); }), used = pieces.map(function () { return false; }), count = 0, sol = null, place = {};
    (function go(left) {
      if (count >= limit) return;
      var first = null;
      for (var i = 0; i < cellsSorted.length; i++) { var k = cellsSorted[i][0] + ',' + cellsSorted[i][1]; if (!set[k]) { first = cellsSorted[i]; break; } }
      if (!first) { count++; if (!sol) sol = Object.assign({}, place); return; }
      for (var pi = 0; pi < pieces.length; pi++) if (!used[pi]) {
        for (var oi = 0; oi < ors[pi].length; oi++) {
          var o = ors[pi][oi], dx = first[0] - o[0][0], dy = first[1] - o[0][1], ok = true, ks = [];
          for (var j = 0; j < o.length; j++) { var kk = (o[j][0] + dx) + ',' + (o[j][1] + dy); if (set[kk] !== 0) { ok = false; break; } ks.push(kk); }
          if (!ok) continue;
          ks.forEach(function (x) { set[x] = 1; place[x] = pi; }); used[pi] = true;
          go(left - 1);
          ks.forEach(function (x) { set[x] = 0; delete place[x]; }); used[pi] = false;
          if (count >= limit) return;
        }
      }
    })(pieces.length);
    return { count: count, sol: sol };
  };
  function pieceSvg(cs, s, fillIdx, label) {
    var w = Math.max.apply(null, cs.map(function (c) { return c[0]; })) + 1, h = Math.max.apply(null, cs.map(function (c) { return c[1]; })) + 1, out = '';
    cs.forEach(function (c) { out += '<rect x="' + (2 + c[0] * s) + '" y="' + (2 + c[1] * s) + '" width="' + s + '" height="' + s + '" fill="#fff" stroke="#000" stroke-width="1"/>'; });
    out += outline(cs, s, 2, 3);
    return { svg: out, w: w * s + 4, h: h * s + 4 };
  }
  function outline(cs, s, o, wdt) {
    var set = {}, d = ''; cs.forEach(function (c) { set[c[0] + ',' + c[1]] = 1; });
    cs.forEach(function (c) {
      var x = o + c[0] * s, y = o + c[1] * s;
      if (!set[c[0] + ',' + (c[1] - 1)]) d += 'M' + x + ' ' + y + 'h' + s;
      if (!set[c[0] + ',' + (c[1] + 1)]) d += 'M' + x + ' ' + (y + s) + 'h' + s;
      if (!set[(c[0] - 1) + ',' + c[1]]) d += 'M' + x + ' ' + y + 'v' + s;
      if (!set[(c[0] + 1) + ',' + c[1]]) d += 'M' + (x + s) + ' ' + y + 'v' + s;
    });
    return '<path d="' + d + '" stroke="#000" stroke-width="' + wdt + '" stroke-linecap="square" fill="none"/>';
  }
  var FILLS = ['#ffffff', '#d9d9d9', '#a6a6a6', '#efefef', '#bfbfbf', '#8c8c8c', '#e6e6e6', '#cccccc'];
  P.add({
    key: 'pieces', cols: 1,
    gen: function (rng, level) {
      var useTet = level === 'easy', lib = useTet ? TET : PENT, k = level === 'easy' ? 4 : level === 'medium' ? 5 : 7;
      return P.tryGen(rng, function (r) {
        var names = r.shuffle(Object.keys(lib)).slice(0, k), region = [], set = {};
        for (var i = 0; i < names.length; i++) {
          var ors = orients(cellsOf(lib[names[i]])), best = null, bestScore = 1e9;
          for (var t = 0; t < 60; t++) {
            var o = r.pick(ors), dx, dy;
            if (!region.length) { dx = 0; dy = 0; }
            else { var anchor = r.pick(region); dx = anchor[0] + r.int(-3, 3); dy = anchor[1] + r.int(-3, 3); }
            var cs = o.map(function (c) { return [c[0] + dx, c[1] + dy]; }), ok = true, touch = !region.length;
            cs.forEach(function (c) { if (set[c[0] + ',' + c[1]]) ok = false; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { if (set[(c[0] + d[0]) + ',' + (c[1] + d[1])]) touch = true; }); });
            if (!ok || !touch) continue;
            var all = region.concat(cs), xs = all.map(function (c) { return c[0]; }), ys = all.map(function (c) { return c[1]; });
            var bw = Math.max.apply(null, xs) - Math.min.apply(null, xs) + 1, bh = Math.max.apply(null, ys) - Math.min.apply(null, ys) + 1;
            var score = bw * bh + Math.abs(bw - bh) * 2 + r.next() * 3;
            if (score < bestScore) { bestScore = score; best = cs; }
          }
          if (!best) return null;
          best.forEach(function (c) { region.push(c); set[c[0] + ',' + c[1]] = 1; });
        }
        region = norm(region);
        /* no holes: every empty square inside the outline must reach the edge */
        var rs = {}, bw2 = 0, bh2 = 0; region.forEach(function (c) { rs[c[0] + ',' + c[1]] = 1; bw2 = Math.max(bw2, c[0] + 1); bh2 = Math.max(bh2, c[1] + 1); });
        var seenE = {}, stk = [[-1, -1]]; seenE['-1,-1'] = 1;
        while (stk.length) { var cc = stk.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = cc[0] + d[0], ny = cc[1] + d[1], kk = nx + ',' + ny; if (nx < -1 || ny < -1 || nx > bw2 || ny > bh2 || seenE[kk] || rs[kk]) return; seenE[kk] = 1; stk.push([nx, ny]); }); }
        if ((bw2 + 2) * (bh2 + 2) - Object.keys(seenE).length !== region.length) return null;
        var pieces = names.map(function (n) { return { n: n, s: lib[n] }; });
        var res = P.fitCount(region, pieces, 2);
        if (res.count !== 1) return null;
        var s = 30, W = Math.max.apply(null, region.map(function (c) { return c[0]; })) + 1, H = Math.max.apply(null, region.map(function (c) { return c[1]; })) + 1;
        function regionSvg(sol) {
          var out = '<rect width="' + (W * s + 4) + '" height="' + (H * s + 4) + '" fill="#fff"/>';
          region.forEach(function (c) {
            var pi = sol ? sol[c[0] + ',' + c[1]] : -1;
            out += '<rect x="' + (2 + c[0] * s) + '" y="' + (2 + c[1] * s) + '" width="' + s + '" height="' + s + '" fill="' + (sol ? FILLS[pi % FILLS.length] : '#fff') + '" stroke="#000" stroke-width="' + (sol ? 0.6 : 0.6) + '" stroke-dasharray="' + (sol ? '0' : '2 3') + '"/>';
            if (sol) out += P.txt(2 + c[0] * s + s / 2, 2 + c[1] * s + s / 2, names[pi], 13, 'text-anchor="middle" dominant-baseline="central" font-weight="700"');
          });
          if (sol) names.forEach(function (n, pi) { out += outline(region.filter(function (c) { return sol[c[0] + ',' + c[1]] === pi; }), s, 2, 3.6); });
          out += outline(region, s, 2, 3.2);
          return P.svg(W * s + 4, H * s + 4, sol ? (0.27 * (W * s + 4) / s).toFixed(2) : (0.42 * (W * s + 4) / s).toFixed(2), out, sol ? 'filled shape' : 'shape to fill');
        }
        var cut = names.map(function (n) {
          var ps = pieceSvg(norm(cellsOf(lib[n])), s, 0, n);
          return '<figure class="pz-piece">' + P.svg(ps.w, ps.h, (0.42 * ps.w / s).toFixed(2), ps.svg, 'piece ' + n) + '<figcaption>' + n + '</figcaption></figure>';
        }).join('');
        return {
          q: '<div class="pz-fit"><div>' + regionSvg(null) + '</div><div class="pz-pieces">' + cut + '</div></div><p class="pz-note">Cut out the ' + k + ' pieces (or copy them onto paper) and fit them into the shape. You may turn and flip them. Use each piece once.</p>',
          a: regionSvg(res.sol), sub: k + ' pieces · ' + region.length + ' squares', data: { region: region, names: names, lib: useTet ? 'TET' : 'PENT' }
        };
      }, 800);
    }
  });

  /* ================= Cube nets and turned shapes ================= */
  var NETS = [
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]]
  ];
  P.NETS = NETS;
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function neg(a) { return [-a[0], -a[1], -a[2]]; }
  function vk(a) { return a.join(','); }
  /* fold a net: returns the outward normal of each cell, or null if two cells land on the same face */
  P.fold = function (net) {
    var N = {}, idx = {}; net.forEach(function (c, i) { idx[c[0] + ',' + c[1]] = i; });
    var st = [[0, [0, 0, 1], [1, 0, 0], [0, -1, 0]]]; N[0] = [0, 0, 1];
    var seen = { 0: 1 }, frames = { 0: [[0, 0, 1], [1, 0, 0], [0, -1, 0]] };
    while (st.length) {
      var cur = st.pop(), i = cur[0], n = cur[1], r = cur[2], d = cur[3], c = net[i];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (dir) {
        var j = idx[(c[0] + dir[0]) + ',' + (c[1] + dir[1])]; if (j === undefined || seen[j]) return;
        var nn, nr = r, nd = d;
        if (dir[0] === 1) { nn = r; nr = neg(n); } else if (dir[0] === -1) { nn = neg(r); nr = n; } else if (dir[1] === 1) { nn = d; nd = neg(n); } else { nn = neg(d); nd = n; }
        seen[j] = 1; N[j] = nn; frames[j] = [nn, nr, nd]; st.push([j, nn, nr, nd]);
      });
    }
    var ks = {}; for (var k = 0; k < net.length; k++) { if (!N[k] || ks[vk(N[k])]) return null; ks[vk(N[k])] = 1; }
    return net.map(function (c, k) { return N[k]; });
  };
  P.cubeMatches = function (normals, syms, view) {
    /* view: [top, left, right] symbols; true if this folded cube can be turned to show that corner */
    var at = {}; normals.forEach(function (n, i) { at[syms[i]] = n; });
    var u = at[view[0]], v = at[view[1]], w = at[view[2]];
    if (!u || !v || !w) return false;
    var c = cross(v, w);
    return c[0] === u[0] && c[1] === u[1] && c[2] === u[2];
  };
  var SYMS = ['dot', 'ring', 'plus', 'cross', 'square', 'diamond'];
  P.CUBESYMS = SYMS;
  function symSvg(k) {
    /* drawn in a 0..1 box; every symbol looks the same after a quarter turn, so only position matters */
    var nse = ' vector-effect="non-scaling-stroke"';
    switch (k) {
      case 'dot': return '<circle cx=".5" cy=".5" r=".22" fill="#000"/>';
      case 'ring': return '<circle cx=".5" cy=".5" r=".25" fill="none" stroke="#000" stroke-width="2.4"' + nse + '/>';
      case 'plus': return '<path d="M.5 .2V.8M.2 .5H.8" stroke="#000" stroke-width="3.4"' + nse + '/>';
      case 'cross': return '<path d="M.27 .27L.73 .73M.73 .27L.27 .73" stroke="#000" stroke-width="3.4"' + nse + '/>';
      case 'square': return '<rect x=".28" y=".28" width=".44" height=".44" fill="#000"/>';
      case 'diamond': return '<path d="M.5 .2L.8 .5L.5 .8L.2 .5Z" fill="none" stroke="#000" stroke-width="2.4"' + nse + '/>';
    }
    return '';
  }
  function netSvg(net, syms, label) {
    var s = 34, W = Math.max.apply(null, net.map(function (c) { return c[0]; })) + 1, H = Math.max.apply(null, net.map(function (c) { return c[1]; })) + 1, out = '';
    net.forEach(function (c, i) {
      out += '<rect x="' + (2 + c[0] * s) + '" y="' + (2 + c[1] * s) + '" width="' + s + '" height="' + s + '" fill="#fff" stroke="#000" stroke-width="1.6"/>';
      out += '<g transform="translate(' + (2 + c[0] * s) + ' ' + (2 + c[1] * s) + ') scale(' + s + ')">' + symSvg(syms[i]) + '</g>';
    });
    return P.svg(W * s + 4, H * s + 4, ((W * s + 4) / s * 0.3).toFixed(2), out, label);
  }
  function cubeSvg(view) {
    /* isometric cube: top, left (front-left), right (front-right) */
    var a = 46, cx = 60, cy = 52, c30 = Math.cos(Math.PI / 6) * a, s30 = a / 2;
    var top = [cx, cy - a], R = [c30, s30], L = [-c30, s30], D = [0, a];
    function face(o, e1, e2, sym) {
      var path = 'M' + o[0] + ' ' + o[1] + 'l' + e1[0] + ' ' + e1[1] + 'l' + e2[0] + ' ' + e2[1] + 'l' + (-e1[0]) + ' ' + (-e1[1]) + 'Z';
      return '<path d="' + path + '" fill="#fff" stroke="#000" stroke-width="2" stroke-linejoin="round"/><g transform="matrix(' + e1[0] + ' ' + e1[1] + ' ' + e2[0] + ' ' + e2[1] + ' ' + o[0] + ' ' + o[1] + ')">' + symSvg(sym) + '</g>';
    }
    /* top face: from the back corner, going right-down and left-down */
    var out = face([cx, cy - a], R, L, view[0]);
    out += face([cx - c30, cy - a + s30], R, D, view[1]);
    out += face([cx, cy], [c30, -s30], D, view[2]);
    return P.svg(120, 125, 1.25, out, 'cube');
  }
  function polyRand(r, k) {
    var cs = [[0, 0]], set = { '0,0': 1 };
    while (cs.length < k) {
      var c = r.pick(cs), d = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), n = [c[0] + d[0], c[1] + d[1]];
      if (!set[n[0] + ',' + n[1]]) { set[n[0] + ',' + n[1]] = 1; cs.push(n); }
    }
    return norm(cs);
  }
  function rot(cs, t) { var c = cs; for (var i = 0; i < t; i++) c = c.map(function (p) { return [p[1], -p[0]]; }); return norm(c); }
  function flip(cs) { return norm(cs.map(function (p) { return [-p[0], p[1]]; })); }
  P.rotKey = function (cs) { return key(norm(cs)); };
  P.isTurnOf = function (a, b) { for (var t = 0; t < 4; t++) if (key(rot(a, t)) === key(norm(b))) return true; return false; };
  function polySvg(cs, label, sz) {
    var s = 22, W = Math.max.apply(null, cs.map(function (c) { return c[0]; })) + 1, H = Math.max.apply(null, cs.map(function (c) { return c[1]; })) + 1, M = Math.max(W, H), out = '';
    var ox = 2 + (M - W) * s / 2, oy = 2 + (M - H) * s / 2;
    cs.forEach(function (c) { out += '<rect x="' + (ox + c[0] * s) + '" y="' + (oy + c[1] * s) + '" width="' + s + '" height="' + s + '" fill="#bdbdbd" stroke="#000" stroke-width="1"/>'; });
    out += outline(cs, s, 0, 2.6).replace('<path d="', '<path transform="translate(' + ox + ' ' + oy + ')" d="');
    return P.svg(M * s + 4, M * s + 4, sz, out, label);
  }
  var LET = ['A', 'B', 'C', 'D'];
  P.add({
    key: 'cubes', cols: 1,
    kinds: [['auto', 'Both'], ['net', 'Cube nets'], ['turn', 'Turned shapes']],
    gen: function (rng, level, o) {
      var type = (o && o.kind && o.kind !== 'auto') ? o.kind : P.cycle(o, arguments[3], ['net', 'turn'], 'cube');
      return P.tryGen(rng, function (r) {
        if (type === 'turn') {
          var k = level === 'easy' ? 5 : level === 'medium' ? 7 : 9, sh = polyRand(r, k);
          var fl = flip(sh);
          if (P.isTurnOf(sh, fl)) return null; /* must look different from its mirror image */
          var right = rot(sh, r.int(1, 3)), opts = [right], keys = {}; keys[key(right)] = 1;
          for (var t = 0; t < 40 && opts.length < 4; t++) {
            var w = rot(fl, r.int(0, 3)); if (level === 'easy' && t > 10) w = rot(polyRand(r, k), r.int(0, 3));
            if (P.isTurnOf(sh, w) || keys[key(w)]) continue;
            keys[key(w)] = 1; opts.push(w);
          }
          if (opts.length < 4) return null;
          opts = r.shuffle(opts); var ci = opts.indexOf(right);
          var q = '<div class="pz-turn"><figure>' + polySvg(sh, 'shape', 1.1) + '<figcaption>This shape</figcaption></figure><span class="pz-arrow" aria-hidden="true">→</span>' +
            opts.map(function (op, i) { return '<figure>' + polySvg(op, 'choice ' + LET[i], 0.95) + '<figcaption>' + LET[i] + '</figcaption></figure>'; }).join('') + '</div><p class="pz-note">Which one is the first shape turned around (not flipped over)?</p>';
          return { q: q, a: '<b>' + LET[ci] + '</b> — the others are mirror images' + (level === 'easy' ? ' or different shapes' : '') + '.', choice: { n: 4, correct: ci }, sub: 'Turned shapes', data: { type: 'turn', shape: sh, opts: opts, correct: ci } };
        }
        var syms = r.shuffle(SYMS), net = r.pick(NETS);
        net = transform(net, r.int(0, 7));
        var nr = P.fold(net); if (!nr) return null;
        /* choose a corner to show */
        var ui = r.int(0, 5), u = nr[ui], vs = [];
        nr.forEach(function (n, i) { if (n[0] * u[0] + n[1] * u[1] + n[2] * u[2] === 0) vs.push(i); });
        var vi = r.pick(vs), v = nr[vi], w = cross(u, v), wi = -1;
        nr.forEach(function (n, i) { if (vk(n) === vk(w)) wi = i; });
        var view = [syms[ui], syms[vi], syms[wi]];
        if (!P.cubeMatches(nr, syms, view)) return null;
        var opts2 = [{ net: net, syms: syms }], tries = 0, want = level === 'easy' ? 'opposite' : level === 'hard' ? 'mirror' : 'any';
        while (opts2.length < 4 && tries++ < 400) {
          var n2 = transform(r.pick(NETS), r.int(0, 7)), s2 = r.shuffle(SYMS), f2 = P.fold(n2);
          if (!f2 || P.cubeMatches(f2, s2, view)) continue;
          var at = {}; f2.forEach(function (n, i) { at[s2[i]] = n; });
          var anyOpp = [[0, 1], [0, 2], [1, 2]].some(function (pq) { var A = at[view[pq[0]]], B = at[view[pq[1]]]; return A[0] === -B[0] && A[1] === -B[1] && A[2] === -B[2]; });
          if (want === 'opposite' && !anyOpp) continue;
          if (want === 'mirror' && anyOpp) continue;
          opts2.push({ net: n2, syms: s2 });
        }
        if (opts2.length < 4) return null;
        var correct = opts2[0]; opts2 = r.shuffle(opts2); var ci2 = opts2.indexOf(correct);
        var q2 = '<div class="pz-nets"><figure class="pz-cubefig">' + cubeSvg(view) + '<figcaption>This cube</figcaption></figure>' +
          opts2.map(function (op, i) { return '<figure>' + netSvg(op.net, op.syms, 'net ' + LET[i]) + '<figcaption>' + LET[i] + '</figcaption></figure>'; }).join('') +
          '</div><p class="pz-note">Which net folds up into this cube? (The cube is drawn from one corner, so three faces show.)</p>';
        var why = want === 'opposite' ? 'In the others, two of the faces you can see would end up on opposite sides.' : want === 'mirror' ? 'The others put the three faces in the wrong order around the corner (a mirror image).' : 'The others either put two of these faces on opposite sides or set them around the corner in the wrong order.';
        return { q: q2, a: '<b>' + LET[ci2] + '</b> — ' + why, choice: { n: 4, correct: ci2 }, sub: 'Cube net', data: { type: 'net', view: view, opts: opts2, correct: ci2 } };
      });
    }
  });
  function transform(net, t) {
    var cs = net.map(function (c) { return [c[0], c[1]]; });
    for (var i = 0; i < (t & 3); i++) cs = cs.map(function (c) { return [c[1], -c[0]]; });
    if (t & 4) cs = cs.map(function (c) { return [-c[0], c[1]]; });
    return norm(cs);
  }
})(typeof window !== 'undefined' ? window : globalThis);
