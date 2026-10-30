/* Pre-K hand-skills printables (Teddy Rook Book): tracing lines, shapes and numbers 0-10, mazes, color by shape,
   cutting lines and dot-to-dot to 10. Every sheet is an SVG drawn here in the browser and printed with print CSS;
   nothing is stored or sent anywhere. Uses Brain Puzzles' seeded random numbers and maze maker (static/puzzles/). */
(function (W, D) {
  'use strict';
  var root = D.getElementById('pkp'), P = W.TRBPuzzles;
  if (!root || !P || !P.rng || !P.mazeMake) return;
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var KEY = 'trb-prek-sheets-v1', st = { tab: 'lines', lines: 'mix', shapes: 'first', nums: 'a', maze: 'easy', seed: 0 };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) if (k in st) st[k] = sv[k]; } catch (e) { }
  var q = new URLSearchParams(W.location.search); if (q.get('t')) st.tab = q.get('t');
  if (!st.seed) st.seed = 1 + Math.floor(Math.random() * 9999);
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }

  // ---------- drawing kit (units: mm on a 190 x 230 page) ----------
  var PW = 190, PH = 230, TRACE = 'fill="none" stroke="#8d9b94" stroke-width="1.15" stroke-dasharray="2.3 1.9" stroke-linecap="round" stroke-linejoin="round"';
  var MODEL = 'fill="none" stroke="#1d2320" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  var EMO = 'font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif"';
  function f1(n) { return Math.round(n * 10) / 10; }
  function svg(inner, label, h) { return '<svg viewBox="0 0 ' + PW + ' ' + (h || PH) + '" role="img" aria-label="' + esc(label) + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'; }
  function emo(x, y, size, e) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + size + '" text-anchor="middle" dominant-baseline="central" ' + EMO + '>' + e + '</text>'; }
  function txt(x, y, size, t, extra) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + size + '" text-anchor="middle" dominant-baseline="central" font-family="Andika,Century Gothic,system-ui,sans-serif" fill="#1d2320"' + (extra || '') + '>' + esc(t) + '</text>'; }
  function dot(x, y, r, fill) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + (r || 1.5) + '" fill="' + (fill || '#2e7d4f') + '"/>'; }
  function poly(pts) { return 'M' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join('L'); }

  // ---------- 1. tracing lines ----------
  var PAIRS = [['🐝', '🌸'], ['🐭', '🧀'], ['🐶', '🦴'], ['🐰', '🥕'], ['🚗', '🏠'], ['🐟', '🐚'], ['✈️', '☁️'], ['🐿️', '🌰'], ['🦋', '🌼'], ['🐒', '🍌'], ['🚂', '🏁'], ['🐻', '🍯'], ['🐞', '🍃'], ['🐔', '🥚'], ['🚀', '🌙'], ['🐢', '🌿']];
  var LINE_KINDS = { mix: ['straight', 'zigzag', 'wave', 'bumps', 'loops', 'steps', 'down', 'slant'], straight: ['straight', 'down', 'slant'], zigzag: ['zigzag', 'steps'], curves: ['wave', 'bumps'], loops: ['loops', 'bumps'] };
  function linePath(kind, x0, x1, yc, r) {
    var w = x1 - x0, pts = [], i, n, t;
    if (kind === 'straight') return { d: 'M' + x0 + ' ' + yc + 'H' + x1, starts: [[x0, yc]] };
    if (kind === 'zigzag') { n = r.int(4, 8) * 2; var A = r.int(6, 11); for (i = 0; i <= n; i++) pts.push([x0 + w * i / n, yc + (i % 2 ? -A : A)]); return { d: poly(pts), starts: [pts[0]] }; }
    if (kind === 'wave') { n = r.int(2, 4); var A2 = r.int(6, 10); for (i = 0; i <= 120; i++) { t = i / 120; pts.push([x0 + w * t, yc + A2 * Math.sin(2 * Math.PI * n * t)]); } return { d: poly(pts), starts: [pts[0]] }; }
    if (kind === 'bumps') { n = r.int(3, 6); var H = r.int(10, 17), up = r.chance(.5); for (i = 0; i <= 160; i++) { t = i / 160; var v = Math.abs(Math.sin(Math.PI * n * t)); pts.push([x0 + w * t, up ? yc + H / 2 - H * v : yc - H / 2 + H * v]); } return { d: poly(pts), starts: [pts[0]] }; }
    if (kind === 'loops') {
      n = r.int(4, 6); var a = w / (2 * Math.PI * n), b = a * (1.55 + r.next() * .3), sx = x0;
      for (i = 0; i <= 50 * n; i++) { var th = Math.PI + 2 * Math.PI * n * i / (50 * n); pts.push([sx + a * (th - Math.PI) - b * Math.sin(th), yc + 4 - b * Math.cos(th) - b + 2]); }
      return { d: poly(pts), starts: [pts[0]] };
    }
    if (kind === 'steps') { n = r.int(4, 7); var S = r.int(8, 12), y = yc + S / 2, sw = w / (2 * n); pts.push([x0, y]); for (i = 0; i < 2 * n; i++) { var x = x0 + sw * (i + 1); pts.push([pts[pts.length - 1][0], i % 2 ? yc + S / 2 : yc - S / 2]); pts.push([x, pts[pts.length - 1][1]]); } return { d: poly(pts), starts: [pts[0]] }; }
    // short strokes, each from its own dot: straight down, or slanting
    n = r.int(8, 12); var d = '', starts = [], sl = kind === 'slant' ? (r.chance(.5) ? 5 : -5) : 0, gap = (w - 10) / (n - 1);
    for (i = 0; i < n; i++) { var xs = x0 + 5 + gap * i - sl / 2; d += 'M' + f1(xs) + ' ' + (yc - 11) + 'L' + f1(xs + sl) + ' ' + (yc + 11); starts.push([xs, yc - 11]); }
    return { d: d, starts: starts, noEnds: true };
  }
  function sheetLines(r) {
    var kinds = LINE_KINDS[st.lines] || LINE_KINDS.mix, rows = 6, rh = PH / rows, out = '', pairs = r.shuffle(PAIRS), order = r.shuffle(kinds);
    for (var i = 0; i < rows; i++) {
      var kind = order[i % order.length], yc = rh * i + rh / 2, pr = pairs[i];
      var p = linePath(kind, p0x(kind), p1x(kind), yc, r);
      if (!p.noEnds) out += emo(11, yc, 13, pr[0]) + emo(179, yc, 13, pr[1]);
      out += '<path d="' + p.d + '" ' + TRACE + '/>' + p.starts.map(function (s) { return dot(s[0], s[1], 1.6); }).join('');
      if (i < rows - 1) out += '<path d="M4 ' + f1(rh * (i + 1)) + 'H186" stroke="#e3e8e5" stroke-width=".4"/>';
    }
    return { svg: svg(out, 'Lines to trace'), title: 'Trace the lines', tip: 'Start at the green dot and follow the gray line with a crayon or a thick pencil, left to right. Slow is good. Trace each row two or three times in different colors.' };
  }
  function p0x(k) { return k === 'down' || k === 'slant' ? 10 : 24; }
  function p1x(k) { return k === 'down' || k === 'slant' ? 180 : 166; }

  // ---------- 2. shapes ----------
  var SHAPES = {
    circle: function (cx, cy, s) { return { d: 'M' + f1(cx) + ' ' + f1(cy - s / 2) + 'A' + s / 2 + ' ' + s / 2 + ' 0 1 0 ' + f1(cx) + ' ' + f1(cy + s / 2) + 'A' + s / 2 + ' ' + s / 2 + ' 0 1 0 ' + f1(cx) + ' ' + f1(cy - s / 2), st: [cx, cy - s / 2] }; },
    square: function (cx, cy, s) { var h = s * .44; return { d: poly([[cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h], [cx - h, cy - h]]), st: [cx - h, cy - h] }; },
    triangle: function (cx, cy, s) { var h = s * .5; return { d: poly([[cx, cy - h], [cx + h * 1.1, cy + h * .9], [cx - h * 1.1, cy + h * .9], [cx, cy - h]]), st: [cx, cy - h] }; },
    rectangle: function (cx, cy, s) { var w = s * .7, h = s * .38; return { d: poly([[cx - w, cy - h], [cx + w, cy - h], [cx + w, cy + h], [cx - w, cy + h], [cx - w, cy - h]]), st: [cx - w, cy - h] }; },
    oval: function (cx, cy, s) { var a = s * .54, b = s * .38; return { d: 'M' + f1(cx) + ' ' + f1(cy - b) + 'A' + f1(a) + ' ' + f1(b) + ' 0 1 0 ' + f1(cx) + ' ' + f1(cy + b) + 'A' + f1(a) + ' ' + f1(b) + ' 0 1 0 ' + f1(cx) + ' ' + f1(cy - b), st: [cx, cy - b] }; },
    diamond: function (cx, cy, s) { var h = s * .52, w = s * .38; return { d: poly([[cx, cy - h], [cx + w, cy], [cx, cy + h], [cx - w, cy], [cx, cy - h]]), st: [cx, cy - h] }; },
    star: function (cx, cy, s) { var pts = []; for (var i = 0; i <= 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * .21 : s * .5; pts.push([cx + rr * Math.cos(a), cy + .06 * s + rr * Math.sin(a)]); } return { d: poly(pts), st: pts[0] }; },
    heart: function (cx, cy, s) { var pts = []; for (var i = 0; i <= 80; i++) { var t = 2 * Math.PI * i / 80, x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); pts.push([cx + x * s / 34, cy - y * s / 34 - s * .03]); } return { d: poly(pts), st: pts[0] }; }
  };
  var FIRST = ['circle', 'square', 'triangle', 'rectangle'], MORE = ['oval', 'diamond', 'star', 'heart'];
  function sheetShapes(r) {
    var list = st.shapes === 'first' ? r.shuffle(FIRST).concat([r.pick(FIRST)]) : r.shuffle(FIRST).slice(0, 2).concat(r.shuffle(MORE).slice(0, 3));
    list = r.shuffle(list);
    var rows = 5, rh = PH / rows, out = '';
    list.forEach(function (name, i) {
      var cy = rh * i + rh / 2 - 2, s = name === 'rectangle' ? 23 : 30;
      var m = SHAPES[name](22, cy, s);
      out += '<path d="' + m.d + '" ' + MODEL + '/>' + txt(22, cy + 21, 5, name);
      for (var k = 0; k < 4; k++) { var cx = 62 + k * 37, t = SHAPES[name](cx, cy, s); out += '<path d="' + t.d + '" ' + TRACE + '/>' + dot(t.st[0], t.st[1], 1.6); }
      if (i < rows - 1) out += '<path d="M4 ' + f1(rh * (i + 1)) + 'H186" stroke="#e3e8e5" stroke-width=".4"/>';
    });
    return { svg: svg(out, 'Shapes to trace'), title: 'Trace the shapes', tip: 'Say each shape’s name together. Start at the green dot and go all the way around. Then look for the same shapes around your home: a round plate, a square napkin, a door shaped like a rectangle.' };
  }

  // ---------- 3. numbers 0 to 10 ----------
  // single-stroke numerals in a 10 x 16 box; each entry is a list of strokes (the dot marks where each starts)
  var NUM = {
    0: ['M5 .5A4.5 7.5 0 1 0 5 15.5A4.5 7.5 0 1 0 5 .5'],
    1: ['M2.4 3.2L5 .5V15.5'],
    2: ['M1 4.2C1 1.8 2.8 .5 5 .5C7.4 .5 9 2.1 9 4.3C9 7 6.4 9.6 1 15.5H9.4'],
    3: ['M1.2 2.6C2.4 1.2 3.7 .5 5 .5C7.5 .5 8.8 2 8.8 4C8.8 6.2 7 7.6 4.5 7.6C7.3 7.6 9.2 9.3 9.2 11.6C9.2 14 7.3 15.5 5 15.5C3.3 15.5 1.8 14.8 .8 13.5'],
    4: ['M6.8 .5L.8 10.6H9.6', 'M6.8 .5V15.5'],
    5: ['M2 .5L1.4 7.2C2.6 6.3 3.8 5.9 5 5.9C7.6 5.9 9.2 7.8 9.2 10.6C9.2 13.5 7.3 15.5 4.8 15.5C3.2 15.5 1.9 14.9 .9 13.8', 'M2 .5H8.8'],
    6: ['M7.8 1.6C6.9 .9 6 .5 5 .5C2.4 .5 .8 3.6 .8 8.6C.8 13 2.6 15.5 5 15.5C7.4 15.5 9.2 13.6 9.2 11C9.2 8.4 7.4 6.6 5.1 6.6C3 6.6 1.4 7.9 .9 9.6'],
    7: ['M.8 .5H9.2L3.6 15.5'],
    8: ['M8.4 3.6C8.4 1.8 6.9 .5 5 .5C3.1 .5 1.6 1.8 1.6 3.7C1.6 5.7 3.3 6.8 5 7.6C7.2 8.6 9.2 9.8 9.2 12C9.2 14.1 7.3 15.5 5 15.5C2.7 15.5 .8 14.1 .8 12C.8 9.8 2.8 8.6 5 7.6C6.7 6.8 8.4 5.6 8.4 3.6'],
    9: ['M8.8 4.4C8.8 2.2 7.2 .5 5 .5C2.8 .5 1.2 2.2 1.2 4.4C1.2 6.6 2.8 8.2 5 8.2C7.2 8.2 8.8 6.6 8.8 4.4V15.5']
  };
  var NUM_START = { 0: [5, .5], 1: [2.4, 3.2], 2: [1, 4.2], 3: [1.2, 2.6], 4: [6.8, .5], 5: [2, .5], 6: [7.8, 1.6], 7: [.8, .5], 8: [8.4, 3.6], 9: [8.8, 4.4] };
  function numeral(n, x, y, h, style, withDot) { // x,y = top-left; h = height in mm
    var s = h / 16, ds = String(n).split(''), out = '';
    ds.forEach(function (c, j) {
      var ox = x + j * 11.5 * s;
      out += '<g transform="translate(' + f1(ox) + ' ' + f1(y) + ') scale(' + f1(s * 100) / 100 + ')"><path d="' + NUM[c].join('') + '" ' + style.replace(/stroke-width="([\d.]+)"/, function (m, w) { return 'stroke-width="' + f1(+w / s * 10) / 10 + '"'; }).replace(/stroke-dasharray="([\d.]+) ([\d.]+)"/, function (m, a, b) { return 'stroke-dasharray="' + f1(+a / s * 10) / 10 + ' ' + f1(+b / s * 10) / 10 + '"'; }) + '/></g>';
      if (withDot) { var p = NUM_START[c]; out += dot(ox + p[0] * s, y + p[1] * s, 1.5); if (c === '4' || c === '5') { out += dot(ox + (c === '4' ? 6.8 : 2) * s, y + .5 * s, 1.5); } }
    });
    return out;
  }
  var COUNTERS = ['🍎', '⭐', '🐞', '🌸', '🚗', '🐟', '🍓', '🎈', '🐤', '🧁', '🍪', '🦆'];
  function counters(n, x, y, e) { // up to 10 in two rows of five, inside a 40 x 24 box
    if (!n) return '<rect x="' + x + '" y="' + (y + 2) + '" width="38" height="20" rx="3" fill="none" stroke="#c9d3cd" stroke-width=".6" stroke-dasharray="1.5 1.2"/>' + txt(x + 19, y + 12, 5, 'none', ' fill="#5d6862"');
    var out = '';
    for (var i = 0; i < n; i++) out += emo(x + 4.5 + (i % 5) * 8.6, y + (n > 5 ? 5 : 12) + Math.floor(i / 5) * 13, 8, e);
    return out;
  }
  function sheetNumbers(r) {
    var set = st.nums === 'a' ? [0, 1, 2, 3, 4, 5] : st.nums === 'b' ? [6, 7, 8, 9, 10] : r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 5).sort(function (a, b) { return a - b; });
    var rows = set.length, rh = PH / rows, out = '', es = r.shuffle(COUNTERS), h = Math.min(26, rh - 10);
    set.forEach(function (n, i) {
      var y = rh * i + (rh - h) / 2;
      out += counters(n, 4, rh * i + rh / 2 - 12, es[i]);
      var step = n === 10 ? 42 : 26, x = 54;
      out += numeral(n, x, y, h, MODEL, false);
      for (var k = 0; k < (n === 10 ? 2 : 4); k++) { x += step + (k === 0 ? 4 : 0); out += numeral(n, x, y, h, TRACE, true); }
      if (i < rows - 1) out += '<path d="M4 ' + f1(rh * (i + 1)) + 'H186" stroke="#e3e8e5" stroke-width=".4"/>';
    });
    return { svg: svg(out, 'Numbers to trace'), title: 'Trace the numbers', tip: 'Count the pictures together, touching each one. Then trace the number, starting at the green dot. For 4 and 5, lift the crayon and start the second line at the dot.' };
  }

  // ---------- 4. mazes (the maze maker from Brain Puzzles) ----------
  var MAZE_ENDS = [['🐭', '🧀'], ['🐝', '🌸'], ['🐶', '🦴'], ['🐰', '🥕'], ['🐻', '🍯'], ['🐒', '🍌'], ['🐿️', '🌰'], ['🐔', '🥚'], ['🚗', '🏠'], ['🐢', '🌿']];
  function mazeSvg(m, x0, y0, cell, ends) {
    var d = '', w = m.w, h = m.h, last = w * h - 1;
    for (var i = 0; i < w * h; i++) {
      var x = x0 + (i % w) * cell, y = y0 + Math.floor(i / w) * cell;
      if (m.right[i] && i !== last) d += 'M' + f1(x + cell) + ' ' + f1(y) + 'v' + f1(cell);
      if (m.down[i]) d += 'M' + f1(x) + ' ' + f1(y + cell) + 'h' + f1(cell);
    }
    d += 'M' + f1(x0) + ' ' + f1(y0) + 'H' + f1(x0 + w * cell); // top
    d += 'M' + f1(x0) + ' ' + f1(y0 + cell) + 'V' + f1(y0 + h * cell); // left, open at the first cell
    d += 'M' + f1(x0 + w * cell) + ' ' + f1(y0) + 'V' + f1(y0 + (h - 1) * cell); // right, open at the last cell
    var es = Math.min(14, cell * .8);
    return '<path d="' + d + '" stroke="#1d2320" stroke-width="' + (cell > 25 ? 2.4 : 1.9) + '" stroke-linecap="round" fill="none"/>' +
      emo(x0 - es * .55, y0 + cell / 2, es, ends[0]) + emo(x0 + w * cell + es * .55, y0 + (h - .5) * cell, es, ends[1]) +
      dot(x0 + cell * .5, y0 + cell / 2, 1.8);
  }
  function sheetMazes(r) {
    var cfg = { easy: [[4, 3], [4, 3]], mid: [[5, 4], [6, 4]], big: [[8, 7]] }[st.maze] || [[4, 3], [4, 3]], out = '', ends = r.shuffle(MAZE_ENDS);
    var slot = PH / cfg.length;
    cfg.forEach(function (wh, j) {
      var m = P.mazeMake(r.fork('m' + j), wh[0], wh[1]), cell = Math.min(150 / wh[0], (slot - 16) / wh[1]);
      var x0 = (PW - cell * wh[0]) / 2, y0 = slot * j + (slot - cell * wh[1]) / 2;
      out += mazeSvg(m, x0, y0, cell, ends[j]);
    });
    return { svg: svg(out, 'Mazes'), title: 'Find the way', tip: 'Start at the green dot beside the ' + 'first picture and draw a path to the other picture without crossing a line. If the crayon bumps a wall, back up and try another way. A finger first, then a crayon.' };
  }

  // ---------- 5. color by shape ----------
  var COLORS = [['red', '#e53935'], ['blue', '#1e88e5'], ['yellow', '#fdd835'], ['green', '#43a047'], ['orange', '#fb8c00'], ['purple', '#8e24aa']];
  function S(type, x, y, w, h, rot) { return { t: type, x: x, y: y, w: w, h: h || w, r: rot || 0 }; }
  var SCENES = [
    ['a house', function (r) { var o = [S('square', 95, 125, 70), S('triangle', 95, 72, 86, 36), S('rectangle', 95, 145, 18, 30), S('square', 73, 112, 16), S('square', 117, 112, 16), S('circle', 160, 30, 22)]; if (r.chance(.6)) o.push(S('triangle', 30, 120, 26, 40), S('rectangle', 30, 150, 6, 16)); else o.push(S('circle', 30, 120, 26), S('rectangle', 30, 148, 6, 22)); return o; }],
    ['a train', function (r) { var o = [S('rectangle', 60, 110, 60, 34), S('square', 52, 76, 28), S('rectangle', 130, 115, 52, 26), S('circle', 42, 136, 16), S('circle', 76, 136, 16), S('circle', 116, 136, 14), S('circle', 144, 136, 14), S('triangle', 22, 120, 16, 18), S('rectangle', 84, 80, 10, 22)]; o.push(S('circle', 89, 56, 10), S('circle', 98, 44, 8)); return o; }],
    ['a rocket', function (r) { var o = [S('rectangle', 95, 115, 40, 80), S('triangle', 95, 58, 40, 34), S('circle', 95, 100, 16), S('circle', 95, 128, 12), S('triangle', 66, 150, 18, 30), S('triangle', 124, 150, 18, 30), S('rectangle', 95, 162, 22, 8)]; for (var i = 0; i < 3; i++) o.push(S('circle', r.pick([30, 40, 150, 162]), 30 + i * 40, 8)); return o; }],
    ['a robot', function () { return [S('square', 95, 60, 44), S('circle', 84, 56, 9), S('circle', 106, 56, 9), S('rectangle', 95, 73, 20, 5), S('triangle', 95, 30, 14, 12), S('rectangle', 95, 115, 54, 56), S('square', 95, 108, 16), S('rectangle', 54, 110, 24, 9), S('rectangle', 136, 110, 24, 9), S('rectangle', 82, 160, 10, 30), S('rectangle', 108, 160, 10, 30)]; }],
    ['a castle', function () { return [S('rectangle', 95, 125, 80, 60), S('rectangle', 45, 115, 24, 80), S('rectangle', 145, 115, 24, 80), S('triangle', 45, 63, 30, 24), S('triangle', 145, 63, 30, 24), S('rectangle', 95, 142, 22, 26), S('circle', 45, 100, 10), S('circle', 145, 100, 10), S('square', 78, 110, 12), S('square', 112, 110, 12), S('triangle', 95, 86, 26, 18)]; }],
    ['a snowman', function (r) { return [S('circle', 95, 135, 60), S('circle', 95, 84, 42), S('rectangle', 95, 60, 34, 8), S('square', 95, 46, 22), S('triangle', 95, 88, 8, 10, 90), S('circle', 87, 78, 6), S('circle', 103, 78, 6), S('circle', 95, 125, 7), S('circle', 95, 143, 7), S('circle', r.chance(.5) ? 30 : 160, 34, 20)]; }],
    ['a boat', function (r) { return [S('rectangle', 95, 135, 110, 22), S('triangle', 80, 92, 40, 56), S('triangle', 118, 98, 28, 44), S('rectangle', 98, 85, 4, 80), S('circle', 60, 135, 9), S('circle', 95, 135, 9), S('circle', 130, 135, 9), S('circle', r.chance(.5) ? 30 : 162, 36, 22)]; }]
  ];
  function shapeEl(o) {
    var d;
    if (o.t === 'circle') return '<circle cx="' + o.x + '" cy="' + o.y + '" r="' + o.w / 2 + '"/>';
    if (o.t === 'triangle') d = poly([[o.x, o.y - o.h / 2], [o.x + o.w / 2, o.y + o.h / 2], [o.x - o.w / 2, o.y + o.h / 2]]) + 'Z';
    else d = poly([[o.x - o.w / 2, o.y - o.h / 2], [o.x + o.w / 2, o.y - o.h / 2], [o.x + o.w / 2, o.y + o.h / 2], [o.x - o.w / 2, o.y + o.h / 2]]) + 'Z';
    return '<path d="' + d + '"' + (o.r ? ' transform="rotate(' + o.r + ' ' + o.x + ' ' + o.y + ')"' : '') + '/>';
  }
  function keyIcon(t, x, y, s) { return shapeEl({ t: t, x: x, y: y, w: t === 'rectangle' ? s * 1.4 : s, h: t === 'rectangle' ? s * .7 : s }); }
  function sheetColor(r) {
    var sc = SCENES[Math.floor(r.next() * SCENES.length)], shapes = sc[1](r), cols = r.shuffle(COLORS).slice(0, 4), types = ['circle', 'square', 'triangle', 'rectangle'];
    var key = '', out = '';
    types.forEach(function (t, i) {
      var x = 8 + i * 46;
      key += '<g fill="' + cols[i][1] + '" stroke="#1d2320" stroke-width=".7">' + keyIcon(t, x + 7, 14, 10) + '</g>' + txt(x + 27, 11, 4.6, t, ' text-anchor="middle"') + txt(x + 27, 18, 4.6, cols[i][0], ' font-weight="700" fill="' + (cols[i][0] === 'yellow' ? '#8a6d00' : cols[i][1]) + '"');
    });
    out += '<rect x="2" y="2" width="186" height="24" rx="3" fill="none" stroke="#c9d3cd" stroke-width=".6"/>' + key;
    out += '<g transform="translate(0 34) scale(1)" fill="#fff" stroke="#1d2320" stroke-width="1.3" stroke-linejoin="round">' + shapes.map(shapeEl).join('') + '</g>';
    out += '<path d="M10 222H180" stroke="#c9d3cd" stroke-width=".5"/>';
    return { svg: svg(out, 'Color by shape: ' + sc[0]), title: 'Color by shape', tip: 'Look at the key: each shape has its own color. Find a circle in the picture, say “circle,” and color it the circle’s color. Then the squares, triangles and rectangles. It makes ' + sc[0] + '.' };
  }

  // ---------- 6. cutting lines ----------
  var CUT = ['straight', 'zigzag', 'wave', 'steps', 'arch', 'bumps'];
  function sheetCut(r) {
    var n = 5, gap = PH / (n + 1), kinds = r.shuffle(CUT).slice(0, n), out = '', pics = r.shuffle(['🐶', '🐱', '🐰', '🐻', '🦊', '🐸', '🐵', '🐼', '🦁', '🐯', '🐮', '🐷']);
    kinds.forEach(function (k, i) {
      var y = gap * (i + 1), x0 = 22, x1 = 184, w = x1 - x0, pts = [], j, d;
      if (k === 'straight') d = 'M' + x0 + ' ' + f1(y) + 'H' + x1;
      else if (k === 'zigzag') { var m = r.int(4, 7) * 2; for (j = 0; j <= m; j++) pts.push([x0 + w * j / m, y + (j % 2 ? -7 : 7)]); d = poly(pts); }
      else if (k === 'wave') { var c = r.int(2, 3); for (j = 0; j <= 100; j++) pts.push([x0 + w * j / 100, y + 8 * Math.sin(2 * Math.PI * c * j / 100)]); d = poly(pts); }
      else if (k === 'steps') { var sN = r.int(3, 5), sw = w / (2 * sN); pts.push([x0, y + 6]); for (j = 0; j < 2 * sN; j++) { pts.push([pts[pts.length - 1][0], j % 2 ? y + 6 : y - 6]); pts.push([x0 + sw * (j + 1), pts[pts.length - 1][1]]); } d = poly(pts); }
      else if (k === 'arch') { for (j = 0; j <= 100; j++) pts.push([x0 + w * j / 100, y + 9 - 18 * Math.sin(Math.PI * j / 100)]); d = poly(pts); }
      else { var bN = r.int(3, 5); for (j = 0; j <= 120; j++) pts.push([x0 + w * j / 120, y + 6 - 12 * Math.abs(Math.sin(Math.PI * bN * j / 120))]); d = poly(pts); }
      out += emo(10, y, 11, '✂️') + '<path d="' + d + '" fill="none" stroke="#1d2320" stroke-width="1.1" stroke-dasharray="3 2.2"/>';
    });
    for (var s = 0; s <= n; s++) out += emo(178, gap * s + gap / 2, 9, pics[s]);
    return { svg: svg(out, 'Lines to cut'), title: 'Cut on the lines', tip: 'Use child-sized scissors, with you sitting beside your child. Thumb on top, and turn the paper, not the scissors. Snip along the dashed line from the scissors to the edge. Straight lines first, then the bends.' };
  }

  // ---------- 7. dot-to-dot to 10 ----------
  function heartPts() { var o = []; for (var i = 0; i < 10; i++) { var t = 2 * Math.PI * i / 10, x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); o.push([.5 + x / 36, .45 - y / 36]); } return o; }
  function starPts() { var o = []; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? .21 : .5; o.push([.5 + rr * Math.cos(a), .55 + rr * Math.sin(a)]); } return o; }
  function moonPts() { var o = [], i, a; for (i = 0; i < 6; i++) { a = -Math.PI / 2 - i * Math.PI / 5; o.push([.5 + .45 * Math.cos(a), .5 + .45 * Math.sin(a)]); } for (i = 1; i <= 4; i++) { a = Math.PI / 2 + i * Math.PI / 5; o.push([.75 + .42 * Math.cos(a), .5 + .42 * Math.sin(a)]); } return o; }
  var DOTS = [
    ['a star', starPts(), true],
    ['a house', [[.1, 1], [.1, .45], [.5, .06], [.68, .24], [.68, .08], [.8, .08], [.8, .36], [.9, .45], [.9, 1], [.5, 1]], true],
    ['a fish', [[.02, .5], [.22, .22], [.5, .15], [.76, .4], [.98, .18], [.98, .82], [.76, .6], [.5, .85], [.22, .78], [.08, .64]], true],
    ['a sailboat', [[.5, .03], [.9, .6], [.5, .6], [.5, .7], [.96, .7], [.8, .96], [.2, .96], [.04, .7], [.44, .7], [.44, .14]], true],
    ['a crown', [[.04, .95], [.04, .22], [.28, .55], [.5, .06], [.72, .55], [.96, .22], [.96, .95], [.72, .95], [.5, .95], [.28, .95]], true],
    ['a heart', heartPts(), true],
    ['a cup', [[.06, .12], [.16, .92], [.62, .92], [.67, .66], [.86, .62], [.96, .44], [.86, .28], [.7, .28], [.72, .12], [.4, .12]], true],
    ['a rocket', [[.5, .02], [.66, .3], [.66, .7], [.84, .92], [.6, .85], [.5, .98], [.4, .85], [.16, .92], [.34, .7], [.34, .3]], true],
    ['a moon', moonPts(), true]
  ];
  function dotPic(tpl, x0, y0, w, h, mirror) {
    var pts = tpl[1].map(function (p) { return [x0 + (mirror ? 1 - p[0] : p[0]) * w, y0 + p[1] * h]; }), out = '';
    var cx = 0, cy = 0; pts.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= pts.length; cy /= pts.length;
    pts.forEach(function (p, i) {
      var dx = p[0] - cx, dy = p[1] - cy, L = Math.sqrt(dx * dx + dy * dy) || 1;
      out += dot(p[0], p[1], i === 0 ? 2.2 : 1.6, i === 0 ? '#2e7d4f' : '#1d2320') + txt(p[0] + dx / L * 6.5, p[1] + dy / L * 6.5, 6, String(i + 1), ' font-weight="700"' + (i === 0 ? ' fill="#2e7d4f"' : ''));
    });
    return out + '<text x="' + f1(x0 + w + 8) + '" y="' + f1(y0 + h + 6) + '" font-size="3" fill="#9aa59f" font-family="system-ui,sans-serif" text-anchor="end" transform="rotate(180 ' + f1(x0 + w + 8) + ' ' + f1(y0 + h + 6) + ')">It’s ' + esc(tpl[0]) + '!</text>';
  }
  function sheetDots(r) {
    var two = r.shuffle(DOTS).slice(0, 2), out = '';
    two.forEach(function (t, j) { out += dotPic(t, 45, 14 + j * 116, 100, 88, r.chance(.5)); });
    out += '<path d="M10 115H180" stroke="#e3e8e5" stroke-width=".4"/>';
    return { svg: svg(out, 'Dot-to-dot to 10'), title: 'Dot-to-dot to 10', tip: 'Start at 1, the green dot. Say each number as you draw to it: 1, 2, 3… When you reach 10, ' + 'join it back to 1 if the picture needs it. What did you draw? (The answer is printed upside down in small letters.)' };
  }

  // ---------- options and drawing ----------
  var TABS = { lines: sheetLines, shapes: sheetShapes, nums: sheetNumbers, maze: sheetMazes, color: sheetColor, cut: sheetCut, dots: sheetDots };
  function sel(id, val, list, label) { return '<label>' + label + ' <select id="' + id + '">' + list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>'; }
  function opts() {
    root.querySelectorAll('[data-t]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.t === st.tab ? 'true' : 'false'); });
    var h = '';
    if (st.tab === 'lines') h = sel('o-lines', st.lines, [['mix', 'A mix of lines'], ['straight', 'Straight lines'], ['zigzag', 'Zigzags and steps'], ['curves', 'Waves and hills'], ['loops', 'Loops and hills']], 'Lines');
    if (st.tab === 'shapes') h = sel('o-shapes', st.shapes, [['first', 'Circle, square, triangle, rectangle'], ['more', 'Add oval, diamond, star and heart']], 'Shapes');
    if (st.tab === 'nums') h = sel('o-nums', st.nums, [['a', '0 to 5'], ['b', '6 to 10'], ['c', 'A mix from 0 to 10']], 'Numbers');
    if (st.tab === 'maze') h = sel('o-maze', st.maze, [['easy', 'Two small mazes'], ['mid', 'Two bigger mazes'], ['big', 'One big maze']], 'Mazes');
    $('pkp-opts').innerHTML = '<div class="ps-row">' + h + '<button type="button" class="hs-btn pri" id="pkp-new">🔀 Generate a new sheet</button><button type="button" class="hs-btn" id="pkp-print">🖨 Print</button></div><p class="hs-small" id="pkp-no">Sheet number ' + st.seed + '. The same number always makes the same sheet.</p>';
  }
  function draw() {
    var r = P.rng('prek|' + st.tab + '|' + st.seed + '|' + (st[st.tab] || ''));
    var s = TABS[st.tab](r);
    $('pkp-prev').innerHTML = '<div class="ps-paper"><div class="pk-pr-head"><b>' + esc(s.title) + '</b><span>Name: ____________________</span></div>' + s.svg +
      '<p class="pk-pr-tip"><b>For the grown-up:</b> ' + esc(s.tip) + '</p><p class="pk-pr-tip" style="font-size:10px;color:#777;margin-top:1mm">Teddy Rook Book · teddyrookbook.com/homeschool/pre-k/printables/</p></div>';
  }
  root.querySelector('.pl-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (!b) return; st.tab = b.dataset.t; save(); opts(); draw(); });
  $('pkp-opts').addEventListener('change', function (e) {
    var id = e.target.id, v = e.target.value;
    if (id === 'o-lines') st.lines = v; else if (id === 'o-shapes') st.shapes = v; else if (id === 'o-nums') st.nums = v; else if (id === 'o-maze') st.maze = v;
    save(); draw();
  });
  $('pkp-opts').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'pkp-new') { st.seed = 1 + Math.floor(Math.random() * 9999); save(); $('pkp-no').textContent = 'Sheet number ' + st.seed + '. The same number always makes the same sheet.'; draw(); }
    if (b.id === 'pkp-print') W.print();
  });
  if (!TABS[st.tab]) st.tab = 'lines';
  opts(); draw();
})(window, document);
