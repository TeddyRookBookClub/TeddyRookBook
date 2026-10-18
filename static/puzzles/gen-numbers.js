/* Number families: sequences, cross-sum grids, magic squares, balance scales, Roman numerals. */
(function (root) {
  'use strict';
  var P = root.TRBPuzzles, esc = P.esc;

  /* ================= Number sequences ================= */
  var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
  function arith(a, d, n) { var t = []; for (var i = 0; i < n; i++) t.push(a + d * i); return t; }
  var SEQ = {
    add: function (r, n) { var d = r.int(2, 9), a = r.int(1, 20); return { t: arith(a, d, n), rule: 'Add ' + d + ' each time.' }; },
    sub: function (r, n) { var d = r.int(2, 9), a = d * (n + 1) + r.int(0, 30); return { t: arith(a, -d, n), rule: 'Subtract ' + d + ' each time.' }; },
    double: function (r, n) { var a = r.int(1, 5); var t = [a]; for (var i = 1; i < n; i++) t.push(t[i - 1] * 2); return { t: t, rule: 'Double the number each time (multiply by 2).' }; },
    addBig: function (r, n) { var d = r.pick([11, 12, 15, 20, 25, 50]), a = r.int(1, 30); return { t: arith(a, d, n), rule: 'Add ' + d + ' each time.' }; },
    mul: function (r, n) { var k = r.int(3, 5), a = r.int(1, 3); var t = [a]; for (var i = 1; i < n; i++) t.push(t[i - 1] * k); return { t: t, rule: 'Multiply by ' + k + ' each time.' }; },
    half: function (r, n) { var k = r.pick([2, 2, 3]), a = r.int(1, 5) * Math.pow(k, n - 1); var t = [a]; for (var i = 1; i < n; i++) t.push(t[i - 1] / k); return { t: t, rule: (k === 2 ? 'Halve the number each time (divide by 2).' : 'Divide by 3 each time.') }; },
    grow: function (r, n) {
      var a = r.int(1, 10), d = r.int(1, 4), s = r.int(1, 2); var t = [a], step = d;
      for (var i = 1; i < n; i++) { t.push(t[i - 1] + step); step += s; }
      return { t: t, rule: 'The amount added grows by ' + s + ' each time (+' + d + ', +' + (d + s) + ', +' + (d + 2 * s) + ', …).' };
    },
    squares: function (r, n) { var b = r.int(1, 4); var t = []; for (var i = 0; i < n; i++) t.push((b + i) * (b + i)); return { t: t, rule: 'Square numbers: ' + b + '×' + b + ', ' + (b + 1) + '×' + (b + 1) + ', ' + (b + 2) + '×' + (b + 2) + ', … (the gaps go up by 2).' }; },
    fib: function (r, n) { var a = r.int(1, 4), b = a + r.int(0, 4); var t = [a, b]; for (var i = 2; i < n; i++) t.push(t[i - 1] + t[i - 2]); return { t: t, rule: 'Add the two numbers before to get the next one.' }; },
    weave: function (r, n) {
      var a = r.int(1, 9), d = r.int(2, 5), b = r.int(20, 40), e = r.int(1, 4), up = r.chance(0.5); var t = [];
      for (var i = 0; i < n; i++) t.push(i % 2 === 0 ? a + d * (i / 2) : (up ? b + e * ((i - 1) / 2) : b - e * ((i - 1) / 2)));
      return { t: t, rule: 'Two patterns take turns: ' + a + ', ' + (a + d) + ', ' + (a + 2 * d) + ', … (add ' + d + ') and ' + b + ', ' + (up ? b + e : b - e) + ', … (' + (up ? 'add ' : 'subtract ') + e + ').' };
    },
    altOps: function (r, n) {
      var p = r.int(1, 5), m = r.pick([2, 3]), a = r.int(1, 4); var t = [a];
      for (var i = 1; i < n; i++) t.push(i % 2 === 1 ? t[i - 1] + p : t[i - 1] * m);
      return { t: t, rule: 'Add ' + p + ', then multiply by ' + m + ', and repeat.' };
    },
    mulAdd: function (r, n) {
      var k = r.pick([2, 2, 3]), c = r.pick([1, -1, 2]), a = r.int(2, 5); if (k === 3 && c === 2) c = 1; var t = [a];
      for (var i = 1; i < n; i++) t.push(t[i - 1] * k + c);
      return { t: t, rule: 'Multiply by ' + k + ', then ' + (c > 0 ? 'add ' + c : 'subtract ' + (-c)) + '.' };
    },
    primes: function (r, n) { var s = r.int(0, 6); return { t: PRIMES.slice(s, s + n), rule: 'Prime numbers in order (numbers with exactly two factors, 1 and itself).' }; },
    cubes: function (r, n) { var b = r.int(1, 3); var t = []; for (var i = 0; i < n; i++) t.push(Math.pow(b + i, 3)); return { t: t, rule: 'Cube numbers: ' + b + '×' + b + '×' + b + ', ' + (b + 1) + '×' + (b + 1) + '×' + (b + 1) + ', …' }; },
    dbldiff: function (r, n) { var a = r.int(1, 9), d = r.int(1, 3); var t = [a]; for (var i = 1; i < n; i++) t.push(t[i - 1] + d * Math.pow(2, i - 1)); return { t: t, rule: 'The amount added doubles each time (+' + d + ', +' + 2 * d + ', +' + 4 * d + ', …).' }; },
    climb: function (r, n) { var a = r.int(1, 3), s = r.int(0, 1); var t = [a]; for (var i = 1; i < n; i++) t.push(t[i - 1] * (i + s)); return { t: t, rule: 'Multiply by ' + (1 + s) + ', then by ' + (2 + s) + ', then by ' + (3 + s) + ', and so on.' }; },
    sqplus: function (r, n) { var c = r.pick([-1, 1, 2, 3]), b = r.int(1, 3); var t = []; for (var i = 0; i < n; i++) t.push((b + i) * (b + i) + c); return { t: t, rule: 'Square numbers ' + (c > 0 ? 'plus ' + c : 'minus ' + (-c)) + ': ' + b + '×' + b + (c > 0 ? '+' : '−') + Math.abs(c) + ', ' + (b + 1) + '×' + (b + 1) + (c > 0 ? '+' : '−') + Math.abs(c) + ', …' }; }
  };
  /* rule name : how many terms to show (enough so only one rule fits) */
  var SEQ_LV = {
    easy: [['add', 5], ['add', 5], ['sub', 5], ['double', 5], ['addBig', 5]],
    medium: [['mul', 5], ['half', 5], ['grow', 6], ['squares', 6], ['fib', 6], ['weave', 8], ['sub', 5], ['addBig', 5]],
    hard: [['altOps', 7], ['mulAdd', 6], ['primes', 6], ['cubes', 6], ['dbldiff', 6], ['climb', 6], ['sqplus', 6], ['fib', 6], ['weave', 8], ['grow', 6]]
  };
  P.SEQ = SEQ; P.SEQ_LV = SEQ_LV;
  P.add({
    key: 'sequences', cols: 1,
    sig: function (d) { return d.shown ? d.shown.join(',') : null; },
    gen: function (rng, level, o, idx) {
      var pick = P.cycle(o, idx, SEQ_LV[level], 'seq' + level);
      return P.tryGen(rng, function (r) {
        var nShow = pick[1];
        var ask = (level === 'medium' && pick[0] !== 'weave' && r.chance(0.4)) ? 2 : 1;
        var s = SEQ[pick[0]](r, nShow + ask);
        var max = level === 'easy' ? 200 : level === 'medium' ? 1000 : 6000;
        for (var i = 0; i < s.t.length; i++) if (s.t[i] < 0 || s.t[i] > max || s.t[i] !== Math.round(s.t[i])) return null;
        var shown = s.t.slice(0, nShow), hid = s.t.slice(nShow);
        var q = '<div class="pz-seq">' + shown.map(function (v) { return '<span class="pz-sbox">' + v + '</span>'; }).join('<span class="pz-comma">,</span>') +
          hid.map(function () { return '<span class="pz-comma">,</span><span class="pz-sbox pz-sans"></span>'; }).join('') + '</div>';
        var a = '<b>' + hid.join(', ') + '</b> — ' + esc(s.rule);
        return { q: q, a: a, ans: hid.map(function (v, k) { return { label: (hid.length > 1 ? (k ? 'Then' : 'Next') : 'Next'), value: String(v) }; }), data: { rule: pick[0], shown: shown, hidden: hid } };
      });
    }
  });

  /* ================= Cross-sum grids ================= */
  function ap(x, o, y) {
    if (o === '+') return x + y; if (o === '−') return x - y; if (o === '×') return x * y;
    if (o === '÷') return (y !== 0 && x % y === 0) ? x / y : NaN; return NaN;
  }
  function ev3(a, o1, b, o2, c) { return ap(ap(a, o1, b), o2, c); }
  P.crossCount = function (g, rowOps, colOps, R, C, limit) {
    /* g: 9 cells, 0 = blank. Count fillings with 1..9 used once that match all results. */
    var cells = g.slice(), used = 0, count = 0, sol = null;
    for (var i = 0; i < 9; i++) if (cells[i]) used |= 1 << cells[i];
    function rowOk(r) { return ev3(cells[r * 3], rowOps[r][0], cells[r * 3 + 1], rowOps[r][1], cells[r * 3 + 2]) === R[r]; }
    function colOk(c) { return ev3(cells[c], colOps[c][0], cells[c + 3], colOps[c][1], cells[c + 6]) === C[c]; }
    (function go(k) {
      if (count >= limit) return;
      if (k === 9) { count++; if (!sol) sol = cells.slice(); return; }
      var given = g[k] !== 0;
      for (var v = given ? g[k] : 1; v <= (given ? g[k] : 9); v++) {
        if (!given && (used & (1 << v))) continue;
        cells[k] = v; if (!given) used |= 1 << v;
        var ok = true;
        if (k % 3 === 2 && !rowOk((k - 2) / 3)) ok = false;
        if (ok && k >= 6 && !colOk(k - 6)) ok = false;
        if (ok) go(k + 1);
        if (!given) { used &= ~(1 << v); cells[k] = 0; }
      }
    })(0);
    return { count: count, sol: sol };
  };
  P.add({
    key: 'crosssum', cols: 2,
    gen: function (rng, level) {
      var ops = level === 'easy' ? ['+', '+', '−'] : level === 'medium' ? ['+', '−', '×'] : ['+', '−', '×', '÷'];
      var gmin = level === 'easy' ? 3 : level === 'medium' ? 1 : 0, gmax = level === 'easy' ? 5 : level === 'medium' ? 3 : 2;
      return P.tryGen(rng, function (r) {
        var g = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        var rowOps = [], colOps = [], R = [], C = [];
        for (var i = 0; i < 3; i++) {
          var ro = [r.pick(ops), r.pick(ops)], co = [r.pick(ops), r.pick(ops)];
          rowOps.push(ro); colOps.push(co);
          R.push(ev3(g[i * 3], ro[0], g[i * 3 + 1], ro[1], g[i * 3 + 2]));
          C.push(ev3(g[i], co[0], g[i + 3], co[1], g[i + 6]));
        }
        for (var j = 0; j < 3; j++) if (!(R[j] >= 0) || !(C[j] >= 0) || R[j] > 200 || C[j] > 200) return null;
        var order = r.shuffle(P.range(0, 9)), giv = [0, 0, 0, 0, 0, 0, 0, 0, 0], k = 0;
        for (; k < gmin; k++) giv[order[k]] = g[order[k]];
        var c = P.crossCount(giv, rowOps, colOps, R, C, 2).count;
        while (c > 1 && k < gmax) { giv[order[k]] = g[order[k]]; k++; c = P.crossCount(giv, rowOps, colOps, R, C, 2).count; }
        if (c !== 1) return null;
        function grid(vals, isKey) {
          var h = '<table class="pz-xs" aria-label="cross-sum grid">';
          for (var rr = 0; rr < 3; rr++) {
            h += '<tr>';
            for (var cc = 0; cc < 3; cc++) {
              var v = vals[rr * 3 + cc];
              h += '<td class="pz-xn' + (giv[rr * 3 + cc] ? ' pz-given' : '') + '">' + (v || '') + '</td>';
              if (cc < 2) h += '<td class="pz-xo">' + rowOps[rr][cc] + '</td>';
            }
            h += '<td class="pz-xo">=</td><td class="pz-xr">' + R[rr] + '</td></tr>';
            if (rr < 2) { h += '<tr>'; for (cc = 0; cc < 3; cc++) { h += '<td class="pz-xo">' + colOps[cc][rr] + '</td>'; if (cc < 2) h += '<td></td>'; } h += '<td></td><td></td></tr>'; }
          }
          h += '<tr>'; for (cc = 0; cc < 3; cc++) { h += '<td class="pz-xo">=</td>'; if (cc < 2) h += '<td></td>'; } h += '<td></td><td></td></tr>';
          h += '<tr>'; for (cc = 0; cc < 3; cc++) { h += '<td class="pz-xr">' + C[cc] + '</td>'; if (cc < 2) h += '<td></td>'; } h += '<td></td><td></td></tr>';
          return h + '</table>' + (isKey ? '' : '');
        }
        return { q: grid(giv), a: grid(g, true), play: { kind: 'cells', n: 3, givens: giv, sol: g }, data: { g: g, giv: giv, rowOps: rowOps, colOps: colOps, R: R, C: C } };
      });
    }
  });

  /* ================= Magic squares ================= */
  var LO = [2, 7, 6, 9, 5, 1, 4, 3, 8];
  function sym3(sq, k) {
    var out = [];
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) {
      var rr = r, cc = c;
      for (var t = 0; t < (k & 3); t++) { var tmp = rr; rr = cc; cc = 2 - tmp; }
      if (k & 4) cc = 2 - cc;
      out[rr * 3 + cc] = sq[r * 3 + c];
    }
    return out;
  }
  function lines(n) {
    var L = [], r, c, a, b;
    for (r = 0; r < n; r++) { a = []; for (c = 0; c < n; c++) a.push(r * n + c); L.push(a); }
    for (c = 0; c < n; c++) { a = []; for (r = 0; r < n; r++) a.push(r * n + c); L.push(a); }
    a = []; b = []; for (r = 0; r < n; r++) { a.push(r * n + r); b.push(r * n + (n - 1 - r)); } L.push(a, b);
    return L;
  }
  P.magicLines = lines;
  /* count ways to fill blanks (0) using the leftover numbers so every line sums to S */
  P.magicCount = function (g, n, nums, S, limit) {
    var L = lines(n), cells = g.slice(), left = nums.filter(function (v) { return g.indexOf(v) < 0; });
    var blanks = []; for (var i = 0; i < g.length; i++) if (!g[i]) blanks.push(i);
    var lastOf = {}; /* lines that become complete at blank index k */
    L.forEach(function (ln) { var m = -1; ln.forEach(function (ci) { var p = blanks.indexOf(ci); if (p > m) m = p; }); (lastOf[m] = lastOf[m] || []).push(ln); });
    var count = 0, sol = null, usedL = left.map(function () { return false; });
    function okLines(k) { var ls = lastOf[k] || []; for (var j = 0; j < ls.length; j++) { var s = 0; for (var q = 0; q < n; q++) s += cells[ls[j][q]]; if (s !== S) return false; } return true; }
    if (!okLines(-1)) return { count: 0 };
    (function go(k) {
      if (count >= limit) return;
      if (k === blanks.length) { count++; if (!sol) sol = cells.slice(); return; }
      for (var j = 0; j < left.length; j++) {
        if (usedL[j]) continue;
        usedL[j] = true; cells[blanks[k]] = left[j];
        if (okLines(k)) go(k + 1);
        usedL[j] = false; cells[blanks[k]] = 0;
      }
    })(0);
    return { count: count, sol: sol };
  };
  function magic4(r) {
    /* random 4×4 magic square using 1..16 (search with forced last cells) */
    var g = new Array(16).fill(0), used = new Array(17).fill(false), S = 34, steps = 0;
    function rowSum(rr, upto) { var s = 0; for (var c = 0; c < upto; c++) s += g[rr * 4 + c]; return s; }
    function colSum(cc, upto) { var s = 0; for (var rr = 0; rr < upto; rr++) s += g[rr * 4 + cc]; return s; }
    function go(k) {
      if (++steps > 200000) return false;
      if (k === 16) return g[0] + g[5] + g[10] + g[15] === S && g[3] + g[6] + g[9] + g[12] === S;
      var rr = Math.floor(k / 4), cc = k % 4, cand;
      if (cc === 3) cand = [S - rowSum(rr, 3)];
      else if (rr === 3) cand = [S - colSum(cc, 3)];
      else cand = r.shuffle(P.range(1, 17));
      for (var j = 0; j < cand.length; j++) {
        var v = cand[j];
        if (v < 1 || v > 16 || used[v]) continue;
        if (rr === 3 && cc === 3 && v !== S - colSum(3, 3)) continue;
        if (cc < 3 && rowSum(rr, cc) + v > S - (3 - cc)) continue;
        if (rr < 3 && colSum(cc, rr) + v > S - (3 - rr)) continue;
        if (rr === 3 && cc === 0 && g[3] + g[6] + g[9] + v !== S) continue;
        g[k] = v; used[v] = true;
        if (go(k + 1)) return true;
        g[k] = 0; used[v] = false;
      }
      return false;
    }
    return go(0) ? g.slice() : null;
  }
  P.add({
    key: 'magic', cols: function (level) { return level === 'hard' ? 2 : 3; },
    gen: function (rng, level) {
      return P.tryGen(rng, function (r) {
        var n, sq, nums, a = 1, d = 1;
        if (level === 'hard') { n = 4; sq = magic4(r); if (!sq) return null; nums = P.range(1, 17); }
        else {
          n = 3; if (level === 'medium') { a = r.int(2, 12); d = r.int(1, 3); }
          var base = sym3(LO, r.int(0, 7));
          sq = base.map(function (v) { return a + d * (v - 1); }); nums = P.range(1, 10).map(function (v) { return a + d * (v - 1); });
        }
        var S = 0; for (var i = 0; i < n; i++) S += sq[i];
        var target = level === 'easy' ? 4 : level === 'medium' ? 6 : 10;
        var g = sq.slice(), blanks = 0, order = r.shuffle(P.range(0, n * n));
        for (var j = 0; j < order.length && blanks < target; j++) {
          var keep = g[order[j]]; g[order[j]] = 0;
          if (P.magicCount(g, n, nums, S, 2).count === 1) blanks++; else g[order[j]] = keep;
        }
        if (blanks < target - (level === 'hard' ? 3 : 1)) return null;
        var numTxt = (a === 1 && d === 1) ? 'Use each number from 1 to ' + (n * n) + ' once.' : 'Use each of these numbers once: ' + nums.join(', ') + '.';
        function grid(vals) {
          var h = '<table class="pz-grid pz-g' + n + '" aria-label="magic square">';
          for (var rr = 0; rr < n; rr++) { h += '<tr>'; for (var cc = 0; cc < n; cc++) { var v = vals[rr * n + cc]; h += '<td' + (g[rr * n + cc] ? ' class="pz-given"' : '') + '>' + (v || '') + '</td>'; } h += '</tr>'; }
          return h + '</table>';
        }
        var q = '<p class="pz-note">Magic sum: <b>' + S + '</b>. ' + numTxt + '</p>' + grid(g);
        return { q: q, a: grid(sq), play: { kind: 'cells', n: n, givens: g, sol: sq }, data: { n: n, g: g, sol: sq, nums: nums, S: S } };
      });
    }
  });

  /* ================= Balance scales ================= */
  var SHAPES = ['circle', 'square', 'triangle', 'star'];
  var SHAPE_NAME = { circle: '●', square: '■', triangle: '▲', star: '★' };
  function shapeSvg(kind, x, y, s) {
    var h = s / 2;
    if (kind === 'circle') return '<circle cx="' + x + '" cy="' + (y - h) + '" r="' + (h * 0.92) + '" fill="#000"/>';
    if (kind === 'square') return '<rect x="' + (x - h * 0.85) + '" y="' + (y - s * 0.9) + '" width="' + (s * 0.85) + '" height="' + (s * 0.85) + '" fill="#fff" stroke="#000" stroke-width="2.2"/>';
    if (kind === 'triangle') return '<path d="M' + x + ' ' + (y - s) + 'L' + (x + h) + ' ' + y + 'L' + (x - h) + ' ' + y + 'Z" fill="#fff" stroke="#000" stroke-width="2.2" stroke-linejoin="round"/><path d="M' + x + ' ' + (y - s * 0.55) + 'L' + (x + h * 0.45) + ' ' + (y - 2) + 'L' + (x - h * 0.45) + ' ' + (y - 2) + 'Z" fill="#000"/>';
    var pts = []; for (var i = 0; i < 10; i++) { var ang = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? h * 0.42 : h; pts.push((x + rad * Math.cos(ang)).toFixed(1) + ' ' + (y - h + rad * Math.sin(ang)).toFixed(1)); }
    return '<path d="M' + pts.join('L') + 'Z" fill="#fff" stroke="#000" stroke-width="2" stroke-linejoin="round"/>';
  }
  P.shapeSvg = shapeSvg;
  function sideSvg(side, cx, y) {
    /* side: {s:[shape idx...]} or {num: n} */
    var out = '', s = 26, gap = 4;
    if (side.num != null) {
      var w = 20 + String(side.num).length * 11;
      return '<path d="M' + (cx - w / 2) + ' ' + y + 'L' + (cx - w / 2 + 5) + ' ' + (y - 30) + 'L' + (cx + w / 2 - 5) + ' ' + (y - 30) + 'L' + (cx + w / 2) + ' ' + y + 'Z" fill="#fff" stroke="#000" stroke-width="2.2"/>' +
        P.txt(cx, y - 14, side.num, 17, 'text-anchor="middle" dominant-baseline="central" font-weight="700"');
    }
    var n = side.s.length, perRow = Math.min(n, 4), rows = Math.ceil(n / perRow);
    for (var i = 0; i < n; i++) {
      var row = Math.floor(i / perRow), col = i % perRow, inRow = Math.min(perRow, n - row * perRow);
      var x = cx - (inRow * (s + gap) - gap) / 2 + col * (s + gap) + s / 2;
      out += shapeSvg(SHAPES[side.s[i]], x, y - row * (s + gap), s);
    }
    return out + (rows ? '' : '');
  }
  function scaleSvg(L, R, label) {
    var W = 300, H = 130, by = 70, out = '';
    out += '<path d="M150 ' + (by + 4) + 'L135 120L165 120Z" fill="#fff" stroke="#000" stroke-width="2.2"/>' + P.line(120, 121, 180, 121, 3);
    out += P.line(25, by, 275, by, 3) + '<circle cx="150" cy="' + by + '" r="4" fill="#000"/>';
    out += '<path d="M15 ' + by + 'Q75 ' + (by + 14) + ' 135 ' + by + '" fill="none" stroke="#000" stroke-width="2"/>';
    out += '<path d="M165 ' + by + 'Q225 ' + (by + 14) + ' 285 ' + by + '" fill="none" stroke="#000" stroke-width="2"/>';
    out += sideSvg(L, 75, by - 2) + sideSvg(R, 225, by - 2);
    return P.svg(W, H, 3.0, out, label);
  }
  P.balanceSolve = function (eqs, K) {
    /* eqs: rows of K coefficients plus constant (sum coef*w = c). Gaussian elimination, returns weights or null if not unique. */
    var M = eqs.map(function (e) { return e.slice(); }), rows = M.length, piv = 0, where = [];
    for (var col = 0; col < K && piv < rows; col++) {
      var best = -1; for (var i = piv; i < rows; i++) if (Math.abs(M[i][col]) > 1e-9) { best = i; break; }
      if (best < 0) continue;
      var t = M[piv]; M[piv] = M[best]; M[best] = t;
      for (i = 0; i < rows; i++) if (i !== piv && Math.abs(M[i][col]) > 1e-9) { var f = M[i][col] / M[piv][col]; for (var j = col; j <= K; j++) M[i][j] -= f * M[piv][j]; }
      where[col] = piv; piv++;
    }
    if (piv < K) return null;
    var w = []; for (col = 0; col < K; col++) w.push(M[where[col]][K] / M[where[col]][col]);
    return w;
  };
  P.add({
    key: 'balance', cols: 2,
    gen: function (rng, level) {
      var K = level === 'easy' ? 2 : level === 'medium' ? 3 : 4, nS = level === 'easy' ? 2 : level === 'medium' ? 3 : 4;
      return P.tryGen(rng, function (r) {
        var maxW = level === 'easy' ? 6 : 9, w = [];
        var kinds = r.shuffle([0, 1, 2, 3]).slice(0, K);
        for (var i = 0; i < K; i++) w.push(r.int(1, maxW));
        for (i = 0; i < K; i++) for (var j = i + 1; j < K; j++) if (w[i] === w[j]) return null;
        var scales = [], eqs = [], numScales = 0;
        for (var t = 0; t < nS + 6 && scales.length < nS; t++) {
          var nl = r.int(1, level === 'easy' ? 3 : 4), L = [];
          for (i = 0; i < nl; i++) L.push(r.int(0, K - 1));
          L.sort();
          var sum = L.reduce(function (s, x) { return s + w[x]; }, 0), R = null;
          var wantNum = (numScales === 0 && scales.length === nS - 1) || r.chance(level === 'hard' ? 0.25 : 0.45);
          if (!wantNum) {
            /* try to find other shapes with the same total */
            var others = P.range(0, K).filter(function (x) { return L.indexOf(x) < 0; }), found = null;
            for (var tries = 0; tries < 40 && !found; tries++) {
              var m = r.int(1, 4), Rs = [], s2 = 0;
              for (i = 0; i < m; i++) { var x = r.pick(others.length ? others : [0]); Rs.push(x); s2 += w[x]; }
              if (others.length && s2 === sum) found = Rs.sort();
            }
            if (found) R = { s: found };
          }
          if (!R) {
            if (level === 'hard' && L.length === 1) continue;
            R = { num: sum }; numScales++;
          }
          var co = P.range(0, K).map(function () { return 0; });
          L.forEach(function (x) { co[x]++; }); if (R.s) R.s.forEach(function (x) { co[x]--; });
          co.push(R.num != null ? R.num : 0);
          eqs.push(co); scales.push({ L: { s: L }, R: R });
        }
        if (scales.length < nS) return null;
        var sol = P.balanceSolve(eqs, K);
        if (!sol) return null;
        for (i = 0; i < K; i++) if (Math.abs(sol[i] - w[i]) > 1e-6) return null;
        var mapped = scales.map(function (sc) {
          return { L: { s: sc.L.s.map(function (x) { return kinds[x]; }) }, R: sc.R.s ? { s: sc.R.s.map(function (x) { return kinds[x]; }) } : sc.R };
        });
        var q = '<div class="pz-scales">' + mapped.map(function (sc) { return scaleSvg(sc.L, sc.R, 'balanced scale'); }).join('') + '</div>' +
          '<p class="pz-fill">' + kinds.map(function (k) { return '<span>' + shapeSvgInline(k) + ' = <span class="pz-blank" style="min-width:2.5em"></span></span>'; }).join('') + '</p>';
        var a = kinds.map(function (k, ii) { return shapeSvgInline(k) + ' = <b>' + w[ii] + '</b>'; }).join('&nbsp;&nbsp; ');
        return { q: q, a: a, ans: kinds.map(function (k, ii) { return { label: SHAPE_NAME[SHAPES[k]], value: String(w[ii]) }; }), data: { eqs: eqs, w: w, K: K } };
      });
    }
  });
  function shapeSvgInline(k) { return '<svg class="pz-ish" viewBox="0 0 30 30" aria-label="' + SHAPES[k] + '">' + shapeSvg(SHAPES[k], 15, 28, 26) + '</svg>'; }

  /* ================= Roman numerals ================= */
  var RV = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  P.toRoman = function (n) { var s = ''; RV.forEach(function (p) { while (n >= p[0]) { s += p[1]; n -= p[0]; } }); return s; };
  P.add({
    key: 'roman', cols: 2,
    sig: function (d) { return d.n != null ? 'n' + d.n : null; },
    top: function () { return '<p class="pz-chart">I = 1 &nbsp; V = 5 &nbsp; X = 10 &nbsp; L = 50 &nbsp; C = 100 &nbsp; D = 500 &nbsp; M = 1000 &nbsp;·&nbsp; A smaller numeral before a bigger one is taken away: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900.</p>'; },
    gen: function (rng, level) {
      var max = level === 'easy' ? 50 : level === 'medium' ? 500 : 3999;
      var type = rng.pick(level === 'hard' ? ['to', 'from', 'add', 'add'] : ['to', 'from']);
      var n = rng.int(level === 'easy' ? 1 : 11, max);
      if (type === 'add') {
        var a = rng.int(5, 1500), b = rng.int(5, 1500);
        return { q: '<span class="pz-big">' + P.toRoman(a) + ' + ' + P.toRoman(b) + ' =</span> ' + P.blank(6), a: '<b>' + P.toRoman(a + b) + '</b> (' + a + ' + ' + b + ' = ' + (a + b) + ')', ans: [{ label: 'Answer', value: P.toRoman(a + b) }], data: { a: a, b: b, sum: P.toRoman(a + b) } };
      }
      if (type === 'to') return { q: '<span class="pz-big">' + n + '</span> = ' + P.blank(6), a: '<b>' + P.toRoman(n) + '</b>', ans: [{ label: 'Roman', value: P.toRoman(n) }], data: { n: n, r: P.toRoman(n) } };
      return { q: '<span class="pz-big">' + P.toRoman(n) + '</span> = ' + P.blank(4), a: '<b>' + n + '</b>', ans: [{ label: 'Number', value: String(n) }], data: { n: n, r: P.toRoman(n) } };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
