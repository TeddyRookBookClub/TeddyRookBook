/* Math Ladder: extra visuals for Grade 3 (static/math/viz/g3.js), registered with MathLadder.viz.register.
   These are calm, still pictures (SVG) made for problems and lessons: they show the situation and never print the
   answer (the shared visuals' live readouts would say "3 rows of 4 = 12" under a "how many dots?" question).
   Every picture scales down to fit a phone, follows the light and dark themes, and has an aria-label that
   describes what is drawn. CSS is injected once from this file. Common option: label (the aria-label), title.

   g3-groups    equal groups on plates, or a pile to share
                {groups: 3, each: 4}                 3 plates with 4 dots on each
                {groups: 3, each: 0, pile: 12}       3 empty plates and a pile of 12 to share
                {pile: 15}                           just a pile
                shape: "plate" (circle, default) | "bag" (rounded box)
   g3-array     a still array
                {rows: 3, cols: 5, style: "dots" | "squares", labels: false (show the row and column counts),
                 split: 0 (a dashed line after this many columns; the two parts get two colors),
                 splitRows: 0 (the same across, after this many rows), loops: false (a loop around each row)}
   g3-frac      fraction pictures
                {model: "bar" | "circle" | "rect", d: 4, n: 3}       one whole cut into d equal parts, n shaded
                n > d draws more wholes (5/4 needs two). wholes: forces the number of wholes drawn.
                shade: [0, 2]       shade these parts (instead of the first n)
                unequal: true       parts of different sizes (to ask "are these equal parts?")
                sizes: [2, 1, 1]    your own part sizes (bar and circle); unequal parts
                pattern (rect):     "cols" (default), "rows", "grid" (needs gr: [rows, cols]), "diag" (4 triangles),
                                    "tri" (2 triangles), "mix4" (2 small rectangles + 2 triangles, each 1/4 of the area)
                bars: [{n: 1, d: 3, label: "1/3"}, …]   stacked bars of the same length (to compare)
                partLabels: false   write 1/d in every part
   g3-nline     a fraction number line
                {max: 1, d: 4, points: [{v: "3/4", label: "A"}], labels: "wholes" | "all" | "none",
                 hops: false (arcs of 1/d from 0 to the first point), bar: false (a thick bar from 0 to the first point),
                 tickNums: false (number the ticks 0, 1, 2 … under the line, to show counting ticks vs spaces)}
   g3-shape     a polygon on a grid (area, perimeter, quadrilaterals)
                {poly: [[0,0],[6,0],[6,3],[3,3],[3,5],[0,5]]}  grid units, y grows downward; or rect: [w, h]
                grid: "squares" (unit squares inside) | "dots" (a dot grid behind) | "none"
                sides: "auto" (each side's length, with unit) | ["5 cm", null, "?", …] (one per side, from the first
                point; null skips) | false
                unit: "cm"   parts: [[x, y, w, h, "blue"]] colored rectangles under the outline (decomposition)
                cuts: [[x1, y1, x2, y2]] dashed lines   right: false (mark right angles)   ticks: false (equal sides)
                fill: "green" | "blue" | "gold" | "none"
   g3-graph     scaled picture graph or bar graph
                {kind: "picture", cats: ["Red", "Blue"], vals: [10, 15], scale: 5, symbol: "circle" | "star" | "square",
                 key: "votes", title: "Favorite colors"}     (a value of scale/2 left over draws half a symbol)
                {kind: "bar", cats: […], vals: […], step: 2, max: 20, title, ylabel}
   g3-ruler     an inch ruler with halves and quarters, and something lying on it
                {inches: 6, marks: 4 (2 = halves only), len: "2 3/4", start: 0, object: "pencil" | "ribbon" |
                 "crayon" | "worm" | "key", name: "pencil"}
   g3-lineplot  a line plot with X marks
                {min: 0, max: 2, d: 4, data: ["1/4", "1 1/2", …], caption: "Length in inches"}
   g3-clock     a still analog clock
                {time: "7:43", ring: false (minute numbers around the face), size: 240}
   g3-measure   a measuring beaker or a dial scale
                {kind: "beaker", max: 10, step: 1, minor: 0, value: 6, unit: "L"}
                {kind: "scale", max: 10, step: 1, minor: 1, value: 4, unit: "kg"}                                  */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math;

  /* ------------------------------------------------------------------ style */
  var CSS = [
    '.g3v{--g3-ink:#1d2320;--g3-muted:#5d6862;--g3-line:#c9d3cc;--g3-card:#fff;--g3-empty:#f3efe4;--g3-empty-edge:#cfc8b6;',
    '--g3-green:#38b27a;--g3-green-soft:#9fd6b9;--g3-green-edge:#1f8a58;--g3-blue:#4f93e0;--g3-blue-soft:#b3d0f2;--g3-blue-edge:#2f6fb8;',
    '--g3-red:#ee5d6c;--g3-red-edge:#c93a4b;--g3-gold:#e2b13c;--g3-gold-soft:#f2dca4;--g3-gold-edge:#a8811f;--g3-purple:#8f6fe8;',
    '--g3-purple-soft:#d7cbf7;--g3-purple-edge:#6646c4;--g3-wood:#f4dfae;--g3-wood-edge:#b8963e;--g3-water:#8cc4f0;--g3-water-edge:#3a87c9;--g3-face:#fffdf6}',
    'html[data-theme="dark"] .g3v{--g3-ink:#e6ece8;--g3-muted:#a9b8af;--g3-line:#3a5446;--g3-card:#14211a;--g3-empty:#1f3128;--g3-empty-edge:#4a6656;',
    '--g3-green:#74d0a0;--g3-green-soft:#3f8f66;--g3-green-edge:#8fe0b6;--g3-blue:#7cb8f2;--g3-blue-soft:#2b4e74;--g3-blue-edge:#9cccf7;',
    '--g3-red:#f08080;--g3-red-edge:#ffb0b0;--g3-gold:#f2c94c;--g3-gold-soft:#5c4c1e;--g3-gold-edge:#ffd479;--g3-purple:#b197fc;',
    '--g3-purple-soft:#463a6e;--g3-purple-edge:#cbb8ff;--g3-wood:#4a3f22;--g3-wood-edge:#c9a957;--g3-water:#2f5f8a;--g3-water-edge:#7cb8f2;--g3-face:#18261e}',
    '.g3v .g3v-card{background:var(--g3-card);border-radius:10px;padding:.5rem;display:flex;justify-content:center}',
    '.g3v .g3v-svg{display:block;width:100%;height:auto;overflow:visible}',
    '.g3v .g3v-title{margin:0 0 .45rem;font:700 1.02rem/1.3 Georgia,"Times New Roman",serif;color:var(--g3-ink)}',
    '.g3v text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;fill:var(--g3-ink)}',
    '.g3v .g3-mut{fill:var(--g3-muted)}'
  ].join('');
  function injectCss() {
    if (D.getElementById('g3v-css')) return;
    var s = D.createElement('style'); s.id = 'g3v-css'; s.textContent = CSS; (D.head || D.documentElement).appendChild(s);
  }

  /* ------------------------------------------------------------------ helpers */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n2(v) { return M.round(v * 100) / 100; }
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function int(v, d, lo, hi) { v = parseInt(v, 10); if (!isFinite(v)) v = d; if (lo !== undefined) v = M.max(lo, v); if (hi !== undefined) v = M.min(hi, v); return v; }
  /* "3/4", "2 3/4", "2", 0.75 -> {n, d} (not reduced) */
  function q(s) {
    if (typeof s === 'number') { if (s === M.round(s)) return { n: s, d: 1 }; var k = 1; while (M.abs(s * k - M.round(s * k)) > 1e-9 && k < 1e6) k *= 2; return { n: M.round(s * k), d: k }; }
    s = String(s == null ? '' : s).trim();
    var m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/); if (m) return { n: +m[1] * +m[3] + +m[2], d: +m[3] };
    m = s.match(/^(\d+)\s*\/\s*(\d+)$/); if (m) return { n: +m[1], d: +m[2] || 1 };
    m = s.match(/^(\d+(?:\.\d+)?)$/); if (m) return q(+m[1]);
    return { n: 0, d: 1 };
  }
  function qv(s) { var r = q(s); return r.n / r.d; }
  function col(name) {
    var c = { green: ['--g3-green-soft', '--g3-green-edge'], blue: ['--g3-blue-soft', '--g3-blue-edge'], gold: ['--g3-gold-soft', '--g3-gold-edge'], purple: ['--g3-purple-soft', '--g3-purple-edge'], red: ['--g3-red', '--g3-red-edge'], none: ['--g3-card', '--g3-ink'] }[name] || ['--g3-green-soft', '--g3-green-edge'];
    return { f: 'var(' + c[0] + ')', s: 'var(' + c[1] + ')' };
  }
  function T(x, y, s, o) { // text
    o = o || {};
    return '<text x="' + n2(x) + '" y="' + n2(y) + '" font-size="' + (o.size || 16) + '" font-weight="' + (o.wt || 600) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central"' +
      (o.cls ? ' class="' + o.cls + '"' : '') + ((o.fill || o.halo) ? ' style="' + (o.fill ? 'fill:' + o.fill + ';' : '') + (o.halo ? 'paint-order:stroke;stroke:' + o.halo + ';stroke-width:5px;stroke-linejoin:round' : '') + '"' : '') + '>' + esc(s) + '</text>';
  }
  function frac(x, y, n, d, size, o) { // a stacked fraction centered at x, y
    size = size || 15; o = o || {};
    var w = M.max(String(n).length, String(d).length) * size * 0.62 + 4;
    return T(x, y - size * 0.62, n, { size: size, wt: o.wt || 700, fill: o.fill }) + '<line x1="' + n2(x - w / 2) + '" y1="' + n2(y) + '" x2="' + n2(x + w / 2) + '" y2="' + n2(y) + '" style="stroke:' + (o.fill || 'var(--g3-ink)') + '" stroke-width="1.6"/>' + T(x, y + size * 0.66, d, { size: size, wt: o.wt || 700, fill: o.fill });
  }
  function qLabel(x, y, n, d, size, o) { // a number written as a whole, a fraction, or a whole and a fraction, centered at x, y
    size = size || 15; o = o || {};
    if (d === 1 || n % d === 0) return T(x, y, n / d, { size: size + 1, wt: 700, fill: o.fill });
    var w = M.floor(n / d), r = n - w * d;
    if (o.simplify) { var g = gcd(r, d); r /= g; d /= g; }
    if (!w || o.improper) { if (o.improper) { r = n; } return frac(x, y, r, d, size, o); }
    return T(x - size * 0.55, y, w, { size: size + 1, wt: 700, fill: o.fill }) + frac(x + size * 0.45, y, r, d, size, o);
  }
  function rect(x, y, w, h, f, s, o) { o = o || {}; return '<rect x="' + n2(x) + '" y="' + n2(y) + '" width="' + n2(w) + '" height="' + n2(h) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + ' style="fill:' + f + ';stroke:' + s + '" stroke-width="' + (o.sw || 1.5) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>'; }
  function line(x1, y1, x2, y2, s, w, dash) { return '<line x1="' + n2(x1) + '" y1="' + n2(y1) + '" x2="' + n2(x2) + '" y2="' + n2(y2) + '" style="stroke:' + s + '" stroke-width="' + (w || 1.5) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>'; }
  function circ(x, y, r, f, s, w) { return '<circle cx="' + n2(x) + '" cy="' + n2(y) + '" r="' + n2(r) + '" style="fill:' + f + ';stroke:' + (s || 'none') + '" stroke-width="' + (w || 1.5) + '"/>'; }
  function path(d, f, s, w, o) { o = o || {}; return '<path d="' + d + '" style="fill:' + f + ';stroke:' + (s || 'none') + '" stroke-width="' + (w || 1.5) + '" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>'; }
  function dot(x, y, r) { return circ(x, y, r, 'var(--g3-red)', 'var(--g3-red-edge)', 1.4) + circ(x - r * 0.3, y - r * 0.32, r * 0.22, 'rgba(255,255,255,.55)'); }
  function star(x, y, r, f, s) { var p = []; for (var i = 0; i < 10; i++) { var a = -M.PI / 2 + i * M.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push(n2(x + rr * M.cos(a)) + ',' + n2(y + rr * M.sin(a))); } return '<polygon points="' + p.join(' ') + '" style="fill:' + f + ';stroke:' + s + '" stroke-width="1.3" stroke-linejoin="round"/>'; }
  function svg(w, h, body, label, maxw) {
    return '<svg class="g3v-svg" viewBox="0 0 ' + n2(w) + ' ' + n2(h) + '" style="max-width:' + M.round(maxw || w) + 'px" role="img" aria-label="' + esc(label) + '" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  }
  function shell(el, o, inner, label) {
    el.classList.add('g3v');
    if (!el.getAttribute('aria-label') || el.getAttribute('aria-label') === el.getAttribute('data-viz') || el.getAttribute('aria-label') === 'A picture for this problem') el.setAttribute('aria-label', o.label || label);
    el.innerHTML = (o.title ? '<p class="g3v-title">' + esc(o.title) + '</p>' : '') + '<div class="g3v-card">' + inner + '</div>';
  }
  function plural(n, w, p) { return n + ' ' + (n === 1 ? w : (p || w + 's')); }
  function hash(i, k) { var x = M.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - M.floor(x); }

  var defs = {};

  /* ------------------------------------------------------------------ g3-groups */
  defs['g3-groups'] = function (el, o) {
    var g = int(o.groups, 0, 0, 10), each = int(o.each, 0, 0, 12), pile = int(o.pile, 0, 0, 60), bag = o.shape === 'bag';
    var r = each > 6 ? 46 : 38, gap = 16, per = g > 5 ? M.ceil(g / 2) : M.max(g, 1), rowsG = g ? M.ceil(g / per) : 0;
    var W0 = M.max(per * (2 * r + gap) + gap, 300), body = '', y = 12, label = [];
    if (pile) {
      var pc = M.min(10, M.max(5, M.ceil(M.sqrt(pile * 2)))), pr = M.ceil(pile / pc), ps = 22, pw = pc * ps, ph = pr * ps;
      var px = (W0 - pw) / 2;
      body += rect(px - 14, y, pw + 28, ph + 16, 'var(--g3-empty)', 'var(--g3-empty-edge)', { rx: 18, dash: '5 4' });
      for (var i = 0; i < pile; i++) { var cx = px + (i % pc) * ps + ps / 2 + (hash(i, 1) - 0.5) * 6, cy = y + 8 + M.floor(i / pc) * ps + ps / 2 + (hash(i, 2) - 0.5) * 6; body += dot(cx, cy, 8); }
      y += ph + 16 + 18; label.push('a pile of ' + plural(pile, 'dot'));
    }
    for (var k = 0; k < g; k++) {
      var row = M.floor(k / per), inRow = row === rowsG - 1 ? g - row * per : per, x0 = (W0 - inRow * (2 * r + gap) + gap) / 2;
      var ccx = x0 + (k - row * per) * (2 * r + gap) + r, ccy = y + row * (2 * r + gap) + r;
      body += bag ? rect(ccx - r, ccy - r, 2 * r, 2 * r, 'var(--g3-gold-soft)', 'var(--g3-gold-edge)', { rx: 14, sw: 2 }) : circ(ccx, ccy, r, 'var(--g3-gold-soft)', 'var(--g3-gold-edge)', 2);
      if (each) {
        var c = each <= 2 ? each : each <= 4 ? 2 : each <= 9 ? 3 : 4, rr = M.ceil(each / c), s = M.min(2 * r * 0.72 / M.max(c, rr), 22), dr = M.min(8, s * 0.38);
        for (var j = 0; j < each; j++) {
          var jr = M.floor(j / c), inR = jr === rr - 1 ? each - jr * c : c;
          body += dot(ccx + (j % c - (inR - 1) / 2) * s, ccy + (jr - (rr - 1) / 2) * s, dr);
        }
      }
    }
    if (g) { y += rowsG * (2 * r + gap) - gap; label.push(plural(g, bag ? 'bag' : 'plate') + (each ? ' with ' + plural(each, 'dot') + ' on each' : ' with nothing on them yet')); }
    shell(el, o, svg(W0, y + 10, body, label.join(' and '), W0 * 1.35), label.join(' and '));
  };

  /* ------------------------------------------------------------------ g3-array */
  defs['g3-array'] = function (el, o) {
    var R = int(o.rows, 3, 1, 12), C = int(o.cols, 4, 1, 12), sq = o.style === 'squares', sp = int(o.split, 0, 0, C - 1), spr = int(o.splitRows, 0, 0, R - 1);
    var u = sq ? 34 : 32, lab = !!o.labels, x0 = lab ? 38 : 12, y0 = lab ? 36 : 12, body = '';
    var w = x0 + C * u + 12, h = y0 + R * u + 12;
    for (var i = 0; i < R; i++) {
      if (o.loops) body += rect(x0 + 2, y0 + i * u + 3, C * u - 4, u - 6, 'none', 'var(--g3-gold-edge)', { rx: (u - 6) / 2, sw: 2 });
      for (var j = 0; j < C; j++) {
        var second = (sp && j >= sp) || (spr && i >= spr), cl = second ? col('blue') : col('red');
        if (sq) body += rect(x0 + j * u + 1, y0 + i * u + 1, u - 2, u - 2, second ? 'var(--g3-blue-soft)' : 'var(--g3-green-soft)', second ? 'var(--g3-blue-edge)' : 'var(--g3-green-edge)', { rx: 3, sw: 1.3 });
        else if (second) body += circ(x0 + j * u + u / 2, y0 + i * u + u / 2, u * 0.32, 'var(--g3-blue)', 'var(--g3-blue-edge)', 1.4);
        else body += dot(x0 + j * u + u / 2, y0 + i * u + u / 2, u * 0.32);
        void cl;
      }
    }
    if (sp) body += line(x0 + sp * u, y0 - 8, x0 + sp * u, y0 + R * u + 8, 'var(--g3-ink)', 2.5, '6 4');
    if (spr) body += line(x0 - 8, y0 + spr * u, x0 + C * u + 8, y0 + spr * u, 'var(--g3-ink)', 2.5, '6 4');
    if (lab) {
      if (sp) { body += T(x0 + sp * u / 2, 16, sp, { size: 17, wt: 800, fill: 'var(--g3-red-edge)' }) + T(x0 + sp * u + (C - sp) * u / 2, 16, C - sp, { size: 17, wt: 800, fill: 'var(--g3-blue-edge)' }); }
      else body += T(x0 + C * u / 2, 16, C, { size: 17, wt: 800, fill: 'var(--g3-blue-edge)' });
      body += line(x0 + 2, 28, x0 + C * u - 2, 28, 'var(--g3-muted)', 1.5);
      if (spr) { body += T(18, y0 + spr * u / 2, spr, { size: 17, wt: 800, fill: 'var(--g3-red-edge)' }) + T(18, y0 + spr * u + (R - spr) * u / 2, R - spr, { size: 17, wt: 800, fill: 'var(--g3-blue-edge)' }); }
      else body += T(16, y0 + R * u / 2, R, { size: 17, wt: 800, fill: 'var(--g3-red-edge)' });
      body += line(28, y0 + 2, 28, y0 + R * u - 2, 'var(--g3-muted)', 1.5);
    }
    var lb = 'An array of ' + plural(R, 'row') + ' with ' + C + (sq ? ' squares' : ' dots') + ' in each row' + (sp ? ', split after ' + plural(sp, 'column') : '') + (spr ? ', split after ' + plural(spr, 'row') : '');
    shell(el, o, svg(w, h, body, lb, w * 1.15), lb);
  };

  /* ------------------------------------------------------------------ g3-frac */
  function sizesOf(o, d) {
    if (Array.isArray(o.sizes) && o.sizes.length) return o.sizes.map(function (v) { return M.max(0.2, +v || 1); });
    var s = []; for (var i = 0; i < d; i++) s.push(1);
    if (o.unequal) { // keep the count, change the sizes (always visibly different)
      if (d === 2) s = [1.6, 1]; else if (d === 3) s = [1, 1.9, 0.9]; else if (d === 4) s = [1.5, 0.7, 1.4, 0.8];
      else s = s.map(function (v, i) { return i % 2 ? 0.65 : 1.35; });
    }
    return s;
  }
  function barSVG(x, y, w, h, d, shaded, sizes, partLabels) {
    var tot = sizes.reduce(function (a, b) { return a + b; }, 0), out = '', cx = x;
    for (var i = 0; i < sizes.length; i++) {
      var pw = w * sizes[i] / tot, on = shaded.indexOf(i) >= 0;
      out += rect(cx, y, pw, h, on ? 'var(--g3-green-soft)' : 'var(--g3-empty)', on ? 'var(--g3-green-edge)' : 'var(--g3-empty-edge)', { sw: 1.4 });
      if (partLabels && pw > 26) out += frac(cx + pw / 2, y + h / 2, 1, d, M.min(14, h * 0.32), { fill: 'var(--g3-muted)' });
      cx += pw;
    }
    return out + rect(x, y, w, h, 'none', 'var(--g3-green-edge)', { sw: 2.4, rx: 2 });
  }
  function circleSVG(cx, cy, r, d, shaded, sizes, partLabels) {
    var tot = sizes.reduce(function (a, b) { return a + b; }, 0), out = '', a = -M.PI / 2;
    if (sizes.length === 1) return circ(cx, cy, r, shaded.length ? 'var(--g3-green-soft)' : 'var(--g3-empty)', 'var(--g3-green-edge)', 2.4);
    for (var i = 0; i < sizes.length; i++) {
      var da = 2 * M.PI * sizes[i] / tot, on = shaded.indexOf(i) >= 0, a2 = a + da;
      out += path('M' + n2(cx) + ' ' + n2(cy) + ' L' + n2(cx + r * M.cos(a)) + ' ' + n2(cy + r * M.sin(a)) + ' A' + r + ' ' + r + ' 0 ' + (da > M.PI ? 1 : 0) + ' 1 ' + n2(cx + r * M.cos(a2)) + ' ' + n2(cy + r * M.sin(a2)) + ' Z', on ? 'var(--g3-green-soft)' : 'var(--g3-empty)', on ? 'var(--g3-green-edge)' : 'var(--g3-empty-edge)', 1.4);
      if (partLabels && d <= 8) out += frac(cx + r * 0.6 * M.cos(a + da / 2), cy + r * 0.6 * M.sin(a + da / 2), 1, d, 12, { fill: 'var(--g3-muted)' });
      a = a2;
    }
    return out + circ(cx, cy, r, 'none', 'var(--g3-green-edge)', 2.4);
  }
  function rectSVG(x, y, w, h, d, shaded, pattern, gr) { // equal parts of a rectangle in different patterns
    var polys = [], i, j;
    if (pattern === 'diag') { var cx = x + w / 2, cy = y + h / 2; polys = [[[x, y], [x + w, y], [cx, cy]], [[x + w, y], [x + w, y + h], [cx, cy]], [[x + w, y + h], [x, y + h], [cx, cy]], [[x, y + h], [x, y], [cx, cy]]]; }
    else if (pattern === 'tri') polys = [[[x, y], [x + w, y], [x, y + h]], [[x + w, y], [x + w, y + h], [x, y + h]]];
    else if (pattern === 'mix4') { var hw = w / 2; polys = [[[x, y], [x + hw, y], [x + hw, y + h / 2], [x, y + h / 2]], [[x, y + h / 2], [x + hw, y + h / 2], [x + hw, y + h], [x, y + h]], [[x + hw, y], [x + w, y], [x + hw, y + h]], [[x + w, y], [x + w, y + h], [x + hw, y + h]]]; }
    else {
      var rr = 1, cc = d; if (pattern === 'rows') { rr = d; cc = 1; } else if (pattern === 'grid' && gr) { rr = gr[0]; cc = gr[1]; }
      for (i = 0; i < rr; i++) for (j = 0; j < cc; j++) polys.push([[x + j * w / cc, y + i * h / rr], [x + (j + 1) * w / cc, y + i * h / rr], [x + (j + 1) * w / cc, y + (i + 1) * h / rr], [x + j * w / cc, y + (i + 1) * h / rr]]);
    }
    var out = '';
    polys.forEach(function (p, k) { var on = shaded.indexOf(k) >= 0; out += '<polygon points="' + p.map(function (pt) { return n2(pt[0]) + ',' + n2(pt[1]); }).join(' ') + '" style="fill:' + (on ? 'var(--g3-green-soft)' : 'var(--g3-empty)') + ';stroke:' + (on ? 'var(--g3-green-edge)' : 'var(--g3-empty-edge)') + '" stroke-width="1.4" stroke-linejoin="round"/>'; });
    return { svg: out + rect(x, y, w, h, 'none', 'var(--g3-green-edge)', { sw: 2.4 }), count: polys.length };
  }
  defs['g3-frac'] = function (el, o) {
    var body = '', W0 = 420, y = 10, lb = '';
    if (Array.isArray(o.bars) && o.bars.length) {
      var hasLab = o.bars.some(function (b) { return b.label; }), lx = hasLab ? 64 : 10, bw = W0 - lx - 10, bh = 44;
      var descr = [];
      o.bars.forEach(function (b, i) {
        var d = int(b.d, 1, 1, 24), n = int(b.n, 0, 0, d), sh = []; for (var k = 0; k < n; k++) sh.push(k);
        body += barSVG(lx, y, bw, bh, d, sh, sizesOf({}, d), b.partLabels || o.partLabels);
        if (b.label) { var lp = String(b.label).split('/'); body += lp.length === 2 ? frac(30, y + bh / 2, lp[0].trim(), lp[1].trim(), 16) : T(30, y + bh / 2, b.label, { size: 16, wt: 700 }); }
        descr.push('a bar cut into ' + plural(d, 'equal part') + ' with ' + n + ' shaded');
        y += bh + 12;
      });
      lb = 'Bars of the same length: ' + descr.join('; ');
      shell(el, o, svg(W0, y, body, lb, 540), lb); return;
    }
    var model = o.model || 'bar', d = int(o.d, 4, 1, 24), n = int(o.n, 0, 0, 120), sizes = sizesOf(o, d), cnt = sizes.length;
    var wholes = int(o.wholes, M.max(1, M.ceil(n / cnt)), 1, 6), shadeList = Array.isArray(o.shade) ? o.shade.map(Number) : null, i;
    function shadedIn(w) { var s = []; for (var k = 0; k < cnt; k++) { var idx = w * cnt + k; if (shadeList ? shadeList.indexOf(idx) >= 0 : idx < n) s.push(k); } return s; }
    var totalShaded = 0; for (i = 0; i < wholes; i++) totalShaded += shadedIn(i).length;
    var eq = !o.unequal && !(Array.isArray(o.sizes) && o.sizes.some(function (v) { return +v !== +o.sizes[0]; }));
    if (model === 'circle') {
      var r = 70, per = M.min(wholes, 3), rows = M.ceil(wholes / per);
      W0 = M.max(per * (2 * r + 24) + 16, 200);
      for (i = 0; i < wholes; i++) { var rw = M.floor(i / per), inRow = rw === rows - 1 ? wholes - rw * per : per, x0 = (W0 - inRow * (2 * r + 24) + 24) / 2; body += circleSVG(x0 + (i - rw * per) * (2 * r + 24) + r, 12 + rw * (2 * r + 20) + r, r, d, shadedIn(i), sizes, o.partLabels); }
      y = 12 + rows * (2 * r + 20) - 8;
      lb = (wholes > 1 ? plural(wholes, 'circle') + ', each' : 'A circle') + ' cut into ' + cnt + (eq ? ' equal parts' : ' parts that are not the same size') + ', ' + totalShaded + ' shaded';
    } else if (model === 'rect') {
      var rw2 = 200, rh = o.pattern === 'rows' ? 200 : 150; if (o.square) rh = rw2;
      W0 = M.max(wholes * (rw2 + 24) + 16, 240);
      var made = 0;
      for (i = 0; i < wholes; i++) { var R0 = rectSVG(16 + i * (rw2 + 24), 12, rw2, rh, d, shadedIn(i), o.pattern || 'cols', o.gr); body += R0.svg; made = R0.count; }
      y = 12 + rh + 12;
      lb = (wholes > 1 ? plural(wholes, 'rectangle') + ', each' : 'A rectangle') + ' cut into ' + (made || cnt) + ' equal parts' + (o.pattern === 'diag' || o.pattern === 'tri' ? ' shaped like triangles' : o.pattern === 'mix4' ? ' (two small rectangles and two triangles)' : '') + ', ' + totalShaded + ' shaded';
    } else {
      var bh2 = 46;
      for (i = 0; i < wholes; i++) { body += barSVG(10, y, W0 - 20, bh2, d, shadedIn(i), sizes, o.partLabels); y += bh2 + 12; }
      lb = (wholes > 1 ? plural(wholes, 'bar') + ' (each one whole), each' : 'A bar') + ' cut into ' + cnt + (eq ? ' equal parts' : ' parts that are not the same size') + ', ' + totalShaded + ' shaded';
    }
    shell(el, o, svg(W0, y, body, lb, model === 'bar' ? 540 : W0), lb);
  };

  /* ------------------------------------------------------------------ g3-nline */
  defs['g3-nline'] = function (el, o) {
    var mx = int(o.max, 1, 1, 5), d = int(o.d, 4, 1, 16), W0 = mx === 1 ? 400 : 480, x0 = 30, x1 = W0 - 30, yL = 74, body = '', labels = o.labels || 'wholes';
    var unit = (x1 - x0) / mx, pts = Array.isArray(o.points) ? o.points : [], i;
    function X(v) { return x0 + v * unit; }
    // hops and bar under the points
    if (pts.length && (o.hops || o.bar)) {
      var pv = qv(pts[0].v), steps = M.round(pv * d);
      if (o.bar) body += line(X(0), yL, X(pv), yL, 'var(--g3-green)', 9);
      if (o.hops) for (i = 0; i < steps; i++) { var a = X(i / d), b = X((i + 1) / d), m = (a + b) / 2, hgt = M.min(30, (b - a) * 0.55 + 6); body += path('M' + n2(a) + ' ' + (yL - 3) + ' Q' + n2(m) + ' ' + n2(yL - 3 - hgt * 2) + ' ' + n2(b) + ' ' + (yL - 3), 'none', 'var(--g3-purple)', 2.2); }
    }
    body += line(x0 - 14, yL, x1 + 14, yL, 'var(--g3-ink)', 2.4);
    body += path('M' + (x1 + 18) + ' ' + yL + ' l-9 -6 l0 12 z', 'var(--g3-ink)', 'var(--g3-ink)', 1);
    var total = mx * d;
    for (i = 0; i <= total; i++) {
      var x = X(i / d), whole = i % d === 0;
      body += line(x, yL - (whole ? 14 : 9), x, yL + (whole ? 14 : 9), 'var(--g3-ink)', whole ? 2.6 : 1.8);
      if (o.tickNums) body += T(x, yL + 54, i + 1, { size: 14, wt: 700, fill: 'var(--g3-gold-edge)' });
      if (labels === 'all' && !whole) body += frac(x, yL + 36, i, d, d > 6 ? 13 : 15, { fill: 'var(--g3-muted)' });
      if (whole && labels !== 'none') body += T(x, yL + 30, i / d, { size: 20, wt: 800 });
      if (whole && labels === 'all' && d > 1) body += frac(x, yL + (o.tickNums ? 86 : 70), i, d, 14, { fill: 'var(--g3-muted)' });
    }
    var cols = { red: ['var(--g3-red)', 'var(--g3-red-edge)'], blue: ['var(--g3-blue)', 'var(--g3-blue-edge)'], green: ['var(--g3-green)', 'var(--g3-green-edge)'], purple: ['var(--g3-purple)', 'var(--g3-purple-edge)'] };
    var desc = [];
    pts.forEach(function (p, k) {
      var v = qv(p.v), c = cols[p.color] || (k ? cols.blue : cols.red), x = X(v);
      body += circ(x, yL, 8.5, c[0], c[1], 2);
      if (p.label) body += T(x, yL - 26 - (o.hops ? 18 : 0), p.label, { size: 18, wt: 800, fill: c[1] });
      if (p.show) { var pq = q(p.v); body += frac(x, yL - 52, pq.n, pq.d, 13, { fill: c[1] }); }
      desc.push((p.label ? 'point ' + p.label : 'a point') + (p.show ? ' at ' + p.v : ''));
    });
    var hgt = yL + (labels === 'all' && d > 1 ? (o.tickNums ? 108 : 92) : o.tickNums ? 66 : 50);
    var lb = 'A number line from 0 to ' + mx + '; each whole is cut into ' + plural(d, 'equal part') + (desc.length ? '; it shows ' + desc.join(' and ') : '');
    shell(el, o, svg(W0, hgt, body, lb, 620), lb);
  };

  /* ------------------------------------------------------------------ g3-shape */
  function inside(pt, poly) {
    var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; }
    return c;
  }
  defs['g3-shape'] = function (el, o) {
    var poly = Array.isArray(o.poly) && o.poly.length >= 3 ? o.poly.map(function (p) { return [+p[0], +p[1]]; }) : null;
    if (!poly) { var rw = Array.isArray(o.rect) ? o.rect : [4, 3]; poly = [[0, 0], [+rw[0], 0], [+rw[0], +rw[1]], [0, +rw[1]]]; }
    var xs = poly.map(function (p) { return p[0]; }), ys = poly.map(function (p) { return p[1]; });
    var minx = M.min.apply(null, xs), maxx = M.max.apply(null, xs), miny = M.min.apply(null, ys), maxy = M.max.apply(null, ys);
    var gw = maxx - minx, gh = maxy - miny, u = M.max(18, M.min(46, 340 / M.max(gw, 1), 260 / M.max(gh, 1))), pad = o.sides === false ? 22 : 58;
    var W0 = gw * u + 2 * pad, H0 = gh * u + 2 * pad, grid = o.grid || 'none', unit = o.unit || '', body = '', i;
    function X(x) { return pad + (x - minx) * u; } function Y(y) { return pad + (y - miny) * u; }
    var pts = poly.map(function (p) { return n2(X(p[0])) + ',' + n2(Y(p[1])); }).join(' ');
    if (grid === 'dots') for (var gx = M.floor(minx) - 1; gx <= M.ceil(maxx) + 1; gx++) for (var gy = M.floor(miny) - 1; gy <= M.ceil(maxy) + 1; gy++) { var px = X(gx), py = Y(gy); if (px > 4 && px < W0 - 4 && py > 4 && py < H0 - 4) body += circ(px, py, 2.2, 'var(--g3-line)'); }
    var fc = col(o.fill || 'green');
    body += '<polygon points="' + pts + '" style="fill:' + (o.fill === 'none' ? 'none' : fc.f) + ';stroke:none"/>';
    (o.parts || []).forEach(function (pr) { var c = col(pr[4] || 'blue'); body += rect(X(pr[0]), Y(pr[1]), pr[2] * u, pr[3] * u, c.f, c.s, { sw: 1.2 }); });
    if (grid === 'squares') {
      var id = 'g3c' + M.floor(M.random() * 1e9);
      body += '<clipPath id="' + id + '"><polygon points="' + pts + '"/></clipPath><g clip-path="url(#' + id + ')">';
      for (i = M.ceil(minx); i <= maxx; i++) body += line(X(i), Y(miny), X(i), Y(maxy), 'var(--g3-green-edge)', 1.1);
      for (i = M.ceil(miny); i <= maxy; i++) body += line(X(minx), Y(i), X(maxx), Y(i), 'var(--g3-green-edge)', 1.1);
      body += '</g>';
    }
    (o.cuts || []).forEach(function (c) { body += line(X(c[0]), Y(c[1]), X(c[2]), Y(c[3]), 'var(--g3-ink)', 2.4, '7 5'); });
    body += '<polygon points="' + pts + '" style="fill:none;stroke:' + fc.s + '" stroke-width="3" stroke-linejoin="round"/>';
    var n = poly.length, lens = [];
    for (i = 0; i < n; i++) { var a = poly[i], b = poly[(i + 1) % n]; lens.push(M.hypot(b[0] - a[0], b[1] - a[1])); }
    if (o.right) for (i = 0; i < n; i++) {
      var p0 = poly[(i + n - 1) % n], p1 = poly[i], p2 = poly[(i + 1) % n], v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
      if (M.abs(v1[0] * v2[0] + v1[1] * v2[1]) < 1e-9) {
        var l1 = M.hypot(v1[0], v1[1]), l2 = M.hypot(v2[0], v2[1]), s = 13 / u;
        var e1 = [v1[0] / l1 * s, v1[1] / l1 * s], e2 = [v2[0] / l2 * s, v2[1] / l2 * s];
        var mid = [p1[0] + e1[0] + e2[0] * 0.5, p1[1] + e1[1] + e2[1] * 0.5], interior = inside(mid, poly);
        if (interior) body += path('M' + n2(X(p1[0] + e1[0])) + ' ' + n2(Y(p1[1] + e1[1])) + ' L' + n2(X(p1[0] + e1[0] + e2[0])) + ' ' + n2(Y(p1[1] + e1[1] + e2[1])) + ' L' + n2(X(p1[0] + e2[0])) + ' ' + n2(Y(p1[1] + e2[1])), 'none', 'var(--g3-red-edge)', 1.8);
      }
    }
    if (o.ticks) {
      var groups = {}, gi = 0;
      lens.forEach(function (L, k) { var key = L.toFixed(4); if (!groups[key]) groups[key] = []; groups[key].push(k); });
      Object.keys(groups).sort(function (a, b) { return groups[a][0] - groups[b][0]; }).forEach(function (key) {
        var g = groups[key]; if (g.length < 2) return; gi++;
        g.forEach(function (k) {
          var a = poly[k], b = poly[(k + 1) % n], mx = (X(a[0]) + X(b[0])) / 2, my = (Y(a[1]) + Y(b[1])) / 2, dx = X(b[0]) - X(a[0]), dy = Y(b[1]) - Y(a[1]), L = M.hypot(dx, dy), ux = dx / L, uy = dy / L;
          for (var t = 0; t < gi; t++) { var off = (t - (gi - 1) / 2) * 6; body += line(mx + ux * off - uy * 7, my + uy * off + ux * 7, mx + ux * off + uy * 7, my + uy * off - ux * 7, 'var(--g3-ink)', 2); }
        });
      });
    }
    var sides = o.sides === undefined ? false : o.sides, said = [], boxes = [];
    function hits(b) { return boxes.some(function (c) { return b.x < c.x + c.w && c.x < b.x + b.w && b.y < c.y + c.h && c.y < b.y + b.h; }); }
    if (sides) for (i = 0; i < n; i++) {
      var A = poly[i], B = poly[(i + 1) % n], txt = sides === 'auto' ? (M.round(lens[i] * 100) / 100) + (unit ? ' ' + unit : '') : sides[i];
      if (txt === null || txt === undefined || txt === '') continue;
      var mx2 = (A[0] + B[0]) / 2, my2 = (A[1] + B[1]) / 2, ddx = B[0] - A[0], ddy = B[1] - A[1], LL = M.hypot(ddx, ddy) || 1, nx = -ddy / LL, ny = ddx / LL;
      if (inside([mx2 + nx * 0.05, my2 + ny * 0.05], poly)) { nx = -nx; ny = -ny; }
      var tw = String(txt).length * 8.6 + 10, off2 = M.abs(nx) > 0.7 ? tw / 2 + 4 : 18;
      var lx = X(mx2) + nx * off2, ly = Y(my2) + ny * (M.abs(ny) > 0.7 ? 18 : off2 * M.abs(ny)), tries = 0;
      while (tries++ < 8 && hits({ x: lx - tw / 2, y: ly - 10, w: tw, h: 20 })) { lx += nx * 9; ly += ny * 9; }
      boxes.push({ x: lx - tw / 2, y: ly - 10, w: tw, h: 20 });
      var unknown = String(txt).indexOf('?') >= 0;
      body += T(lx, ly, txt, { size: 16, wt: 700, fill: unknown ? 'var(--g3-red-edge)' : 'var(--g3-ink)' });
      said.push(txt);
    }
    var lb = o.label || ('A shape with ' + n + ' sides' + (said.length ? ', marked ' + said.join(', ') : '') + (grid === 'squares' ? ', covered with unit squares' : ''));
    shell(el, o, svg(W0, H0, body, lb, W0 * 1.1), lb);
  };

  /* ------------------------------------------------------------------ g3-graph */
  function symbolSVG(kind, x, y, r, half) {
    var c = kind === 'star' ? ['var(--g3-gold)', 'var(--g3-gold-edge)'] : kind === 'square' ? ['var(--g3-blue)', 'var(--g3-blue-edge)'] : ['var(--g3-red)', 'var(--g3-red-edge)'];
    var s = kind === 'star' ? star(x, y, r, c[0], c[1]) : kind === 'square' ? rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7, c[0], c[1], { rx: 3 }) : circ(x, y, r * 0.9, c[0], c[1], 1.5);
    if (!half) return s;
    var id = 'g3h' + M.floor(M.random() * 1e9);
    return '<clipPath id="' + id + '"><rect x="' + n2(x - r - 2) + '" y="' + n2(y - r - 2) + '" width="' + n2(r + 2) + '" height="' + n2(2 * r + 4) + '"/></clipPath><g clip-path="url(#' + id + ')">' + s + '</g>';
  }
  defs['g3-graph'] = function (el, o) {
    var cats = o.cats || [], vals = (o.vals || []).map(Number), body = '', W0, H0, lb, i;
    if (o.kind === 'bar') {
      var step = +o.step || 1, mx = +o.max || M.ceil(M.max.apply(null, vals.concat([step])) / step) * step, lx = 54, top = 16, ph = 220, bw = M.min(70, 300 / M.max(cats.length, 1));
      W0 = lx + cats.length * (bw + 22) + 24; H0 = top + ph + 52;
      function Yv(v) { return top + ph - v / mx * ph; }
      for (var v = 0; v <= mx + 1e-9; v += step) { body += line(lx, Yv(v), W0 - 12, Yv(v), 'var(--g3-line)', 1.2); body += T(lx - 10, Yv(v), M.round(v * 100) / 100, { size: 16, wt: 700, anchor: 'end' }); }
      body += line(lx, top - 4, lx, top + ph, 'var(--g3-ink)', 2) + line(lx, top + ph, W0 - 12, top + ph, 'var(--g3-ink)', 2);
      cats.forEach(function (c, k) { var x = lx + 14 + k * (bw + 22); body += rect(x, Yv(vals[k] || 0), bw, ph - (Yv(vals[k] || 0) - top), 'var(--g3-blue-soft)', 'var(--g3-blue-edge)', { sw: 2 }); body += T(x + bw / 2, top + ph + 18, c, { size: 16, wt: 700 }); });
      if (o.ylabel) body += T(lx, H0 - 10, o.ylabel, { size: 15, wt: 600, anchor: 'start', cls: 'g3-mut' });
      lb = 'A bar graph' + (o.title ? ' titled ' + o.title : '') + '. The scale goes up by ' + step + '. Bars: ' + cats.map(function (c, k) { return c + ' ' + vals[k]; }).join(', ');
    } else {
      var sc = +o.scale || 1, r = 13, lw = 96, sym = o.symbol || 'circle', maxN = 0;
      vals.forEach(function (v) { maxN = M.max(maxN, M.ceil(v / sc)); });
      W0 = M.max(lw + maxN * (2 * r + 8) + 20, 300); var rowH = 38; H0 = 10 + cats.length * rowH + 50;
      cats.forEach(function (c, k) {
        var y = 10 + k * rowH + rowH / 2, full = M.floor(vals[k] / sc), half = vals[k] - full * sc > 0;
        if (k) body += line(10, y - rowH / 2, W0 - 10, y - rowH / 2, 'var(--g3-line)', 1);
        body += T(lw - 12, y, c, { size: 15, wt: 700, anchor: 'end' });
        for (var j = 0; j < full; j++) body += symbolSVG(sym, lw + r + j * (2 * r + 8), y, r);
        if (half) body += symbolSVG(sym, lw + r + full * (2 * r + 8), y, r, true);
      });
      body += line(lw - 2, 8, lw - 2, 10 + cats.length * rowH, 'var(--g3-ink)', 1.6);
      var ky = 10 + cats.length * rowH + 26;
      body += rect(10, ky - 18, W0 - 20, 36, 'var(--g3-empty)', 'var(--g3-empty-edge)', { rx: 8 });
      body += T(24, ky, 'Key:', { size: 15, wt: 700, anchor: 'start' }) + symbolSVG(sym, 80, ky, r) + T(100, ky, '= ' + sc + (o.key ? ' ' + o.key : ''), { size: 15, wt: 700, anchor: 'start' });
      lb = 'A picture graph' + (o.title ? ' titled ' + o.title : '') + '. Key: each symbol stands for ' + sc + (o.key ? ' ' + o.key : '') + '. Rows: ' + cats.map(function (c, k) { var f = M.floor(vals[k] / sc), h = vals[k] - f * sc > 0; return c + ' ' + f + (h ? ' and a half' : '') + ' symbols'; }).join(', ');
    }
    shell(el, o, svg(W0, H0, body, lb, W0 * 1.1), lb);
  };

  /* ------------------------------------------------------------------ g3-ruler */
  defs['g3-ruler'] = function (el, o) {
    var inch = int(o.inches, 6, 2, 10), marks = int(o.marks, 4, 1, 8), L = qv(o.len || '2'), st = qv(o.start || 0), u = M.min(76, 440 / inch), x0 = 22, W0 = x0 * 2 + inch * u, yR = 78, body = '', i;
    function X(v) { return x0 + v * u; }
    // object
    var a = X(st), b = X(st + L), oy = 40, kind = o.object || 'pencil';
    if (kind === 'pencil' || kind === 'crayon') {
      var tip = M.min(22, (b - a) * 0.3), c = kind === 'crayon' ? ['var(--g3-purple)', 'var(--g3-purple-edge)'] : ['var(--g3-gold)', 'var(--g3-gold-edge)'];
      body += rect(a, oy - 10, b - a - tip, 20, c[0], c[1], { sw: 1.6 });
      if (kind === 'pencil') body += rect(a, oy - 10, M.min(12, (b - a) * 0.12), 20, 'var(--g3-red)', 'var(--g3-red-edge)', { sw: 1.4 });
      body += path('M' + n2(b - tip) + ' ' + (oy - 10) + ' L' + n2(b) + ' ' + oy + ' L' + n2(b - tip) + ' ' + (oy + 10) + ' Z', kind === 'pencil' ? 'var(--g3-wood)' : c[0], c[1], 1.6);
    } else if (kind === 'worm') {
      body += rect(a, oy - 8, b - a, 16, 'var(--g3-red)', 'var(--g3-red-edge)', { rx: 8, sw: 1.6 }) + circ(b - 6, oy - 2, 1.8, 'var(--g3-ink)');
    } else if (kind === 'key') {
      var hr = M.min(13, (b - a) * 0.22);
      body += circ(a + hr, oy, hr, 'var(--g3-gold-soft)', 'var(--g3-gold-edge)', 2.2) + rect(a + 2 * hr - 1, oy - 4, b - a - 2 * hr + 1, 8, 'var(--g3-gold-soft)', 'var(--g3-gold-edge)', { sw: 1.6 }) + rect(b - M.min(12, (b - a) * 0.2), oy + 4, 5, 8, 'var(--g3-gold-soft)', 'var(--g3-gold-edge)', { sw: 1.4 });
    } else body += rect(a, oy - 9, b - a, 18, 'var(--g3-blue)', 'var(--g3-blue-edge)', { rx: 3, sw: 1.6 });
    body += line(a, oy + 12, a, yR, 'var(--g3-muted)', 1.4, '4 4') + line(b, oy + 12, b, yR, 'var(--g3-muted)', 1.4, '4 4');
    // ruler
    body += rect(x0 - 14, yR, inch * u + 28, 58, 'var(--g3-wood)', 'var(--g3-wood-edge)', { rx: 4, sw: 2 });
    for (i = 0; i <= inch * marks; i++) {
      var x = X(i / marks), whole = i % marks === 0, halfm = marks % 2 === 0 && i % (marks / 2) === 0, len = whole ? 26 : halfm ? 18 : 11;
      body += line(x, yR, x, yR + len, 'var(--g3-ink)', whole ? 2.2 : 1.6);
      if (whole) body += T(x, yR + 42, i / marks, { size: 20, wt: 800 });
    }
    body += T(X(inch) + 14, yR + 74, 'inches', { size: 13, wt: 600, anchor: 'end', cls: 'g3-mut' });
    var lb = 'An inch ruler marked in ' + (marks === 2 ? 'halves' : marks === 4 ? 'quarters' : marks + 'ths') + ' of an inch, with a ' + (o.name || kind) + ' lying on it' + (st ? ', starting at the ' + o.start + ' inch mark' : ', starting at 0');
    shell(el, o, svg(W0, yR + 82, body, lb, W0 * 1.1), lb);
  };

  /* ------------------------------------------------------------------ g3-lineplot */
  defs['g3-lineplot'] = function (el, o) {
    var mn = qv(o.min || 0), mx = qv(o.max || 2), d = int(o.d, 4, 1, 8), data = (o.data || []).map(function (s) { return q(s); }), body = '', i;
    var W0 = 440, x0 = 30, x1 = W0 - 30, cnt = {}, top = 0;
    data.forEach(function (r) { var k = M.round(r.n / r.d * d); cnt[k] = (cnt[k] || 0) + 1; top = M.max(top, cnt[k]); });
    var xs = 24, yL = 24 + top * xs + 10;
    function X(v) { return x0 + (v - mn) / (mx - mn) * (x1 - x0); }
    body += line(x0 - 12, yL, x1 + 12, yL, 'var(--g3-ink)', 2.2);
    for (i = M.round(mn * d); i <= M.round(mx * d); i++) {
      var x = X(i / d), whole = i % d === 0;
      body += line(x, yL - (whole ? 10 : 7), x, yL + (whole ? 10 : 7), 'var(--g3-ink)', whole ? 2.2 : 1.6);
      body += qLabel(x, yL + 34, i, d, d > 2 && (M.round(mx * d) - M.round(mn * d)) > 8 ? 13 : 15, { simplify: true });
      for (var k = 0; k < (cnt[i] || 0); k++) { var cy = yL - 20 - k * xs; body += line(x - 7, cy - 7, x + 7, cy + 7, 'var(--g3-blue-edge)', 3) + line(x - 7, cy + 7, x + 7, cy - 7, 'var(--g3-blue-edge)', 3); }
    }
    var H0 = yL + 60;
    if (o.caption) { body += T(W0 / 2, H0 + 6, o.caption, { size: 15, wt: 600, cls: 'g3-mut' }); H0 += 22; }
    var lb = 'A line plot from ' + o.min + ' to ' + o.max + ' marked in ' + (d === 2 ? 'halves' : d === 4 ? 'quarters' : d + 'ths') + ', with ' + data.length + ' X marks' + (o.caption ? ' (' + o.caption + ')' : '');
    shell(el, o, svg(W0, H0, body, lb), lb);
  };

  /* ------------------------------------------------------------------ g3-clock */
  defs['g3-clock'] = function (el, o) {
    var m = String(o.time || '3:00').match(/^(\d{1,2}):(\d{2})/), h = m ? +m[1] % 12 : 3, mi = m ? +m[2] % 60 : 0, ring = !!o.ring;
    var R = 110, pad = ring ? 30 : 10, S = 2 * (R + pad), cx = S / 2, cy = S / 2, body = '', i;
    body += circ(cx, cy, R + 4, 'var(--g3-face)', 'var(--g3-green-edge)', 7);
    for (i = 0; i < 60; i++) { var a = i / 60 * 2 * M.PI - M.PI / 2, big = i % 5 === 0, r1 = R - 5, r2 = R - (big ? 15 : 9); body += line(cx + r1 * M.cos(a), cy + r1 * M.sin(a), cx + r2 * M.cos(a), cy + r2 * M.sin(a), big ? 'var(--g3-ink)' : 'var(--g3-muted)', big ? 2.6 : 1.1); }
    for (i = 1; i <= 12; i++) { var b = i / 12 * 2 * M.PI - M.PI / 2; body += T(cx + R * 0.73 * M.cos(b), cy + R * 0.73 * M.sin(b) + 1, i, { size: 21, wt: 800 }); }
    if (ring) for (i = 0; i < 12; i++) { var c2 = i / 12 * 2 * M.PI - M.PI / 2; body += T(cx + (R + 20) * M.cos(c2), cy + (R + 20) * M.sin(c2), i * 5, { size: 12, wt: 700, fill: 'var(--g3-red-edge)' }); }
    var mA = mi / 60 * 2 * M.PI - M.PI / 2, hA = (h * 60 + mi) / 720 * 2 * M.PI - M.PI / 2;
    function hand(a, len, w, c, e) { return line(cx - 12 * M.cos(a), cy - 12 * M.sin(a), cx + len * M.cos(a), cy + len * M.sin(a), e, w + 2.5) + line(cx - 12 * M.cos(a), cy - 12 * M.sin(a), cx + len * M.cos(a), cy + len * M.sin(a), c, w); }
    body += hand(hA, R * 0.5, 9, 'var(--g3-blue)', 'var(--g3-blue-edge)') + hand(mA, R * 0.8, 5, 'var(--g3-red)', 'var(--g3-red-edge)');
    body += circ(cx, cy, 7, 'var(--g3-ink)') + circ(cx, cy, 3, 'var(--g3-card)');
    var lb = 'An analog clock. The short blue hour hand and the long red minute hand show a time to read.';
    shell(el, o, svg(S, S, body, lb, int(o.size, 260, 160, 360)), lb);
  };

  /* ------------------------------------------------------------------ g3-measure */
  defs['g3-measure'] = function (el, o) {
    var kind = o.kind === 'scale' ? 'scale' : 'beaker', mx = +o.max || 10, st = +o.step || 1, mn = int(o.minor, 0, 0, 9), val = M.max(0, M.min(mx, +o.value || 0)), unit = o.unit || (kind === 'scale' ? 'kg' : 'L'), body = '', i, lb;
    var ticks = M.round(mx / st) * (mn + 1);
    if (kind === 'beaker') {
      var bx = 90, bw = 140, top = 24, bh = 280, W0 = 300, H0 = top + bh + 24;
      function Y(v) { return top + bh - v / mx * (bh - 16); }
      body += path('M' + bx + ' ' + (top - 8) + ' L' + bx + ' ' + (top + bh - 14) + ' Q' + bx + ' ' + (top + bh) + ' ' + (bx + 14) + ' ' + (top + bh) + ' L' + (bx + bw - 14) + ' ' + (top + bh) + ' Q' + (bx + bw) + ' ' + (top + bh) + ' ' + (bx + bw) + ' ' + (top + bh - 14) + ' L' + (bx + bw) + ' ' + (top - 8), 'var(--g3-card)', 'none');
      if (val > 0) body += path('M' + (bx + 2) + ' ' + n2(Y(val)) + ' L' + (bx + 2) + ' ' + (top + bh - 14) + ' Q' + (bx + 2) + ' ' + (top + bh - 2) + ' ' + (bx + 14) + ' ' + (top + bh - 2) + ' L' + (bx + bw - 14) + ' ' + (top + bh - 2) + ' Q' + (bx + bw - 2) + ' ' + (top + bh - 2) + ' ' + (bx + bw - 2) + ' ' + (top + bh - 14) + ' L' + (bx + bw - 2) + ' ' + n2(Y(val)) + ' Z', 'var(--g3-water)', 'none');
      if (val > 0) body += line(bx + 2, Y(val), bx + bw - 2, Y(val), 'var(--g3-water-edge)', 2.5);
      for (i = 0; i <= ticks; i++) { var v = i * st / (mn + 1), big = i % (mn + 1) === 0; if (v === 0) continue; body += line(bx, Y(v), bx + (big ? 30 : 16), Y(v), 'var(--g3-ink)', big ? 2.2 : 1.3); if (big) body += T(bx - 10, Y(v), M.round(v * 100) / 100, { size: 15, wt: 700, anchor: 'end' }); }
      body += path('M' + bx + ' ' + (top - 8) + ' L' + bx + ' ' + (top + bh - 14) + ' Q' + bx + ' ' + (top + bh) + ' ' + (bx + 14) + ' ' + (top + bh) + ' L' + (bx + bw - 14) + ' ' + (top + bh) + ' Q' + (bx + bw) + ' ' + (top + bh) + ' ' + (bx + bw) + ' ' + (top + bh - 14) + ' L' + (bx + bw) + ' ' + (top - 8), 'none', 'var(--g3-ink)', 3);
      body += T(bx + bw + 14, top + 8, unit === 'L' ? 'liters' : unit, { size: 14, wt: 700, anchor: 'start', cls: 'g3-mut' });
      lb = 'A measuring container marked in ' + (unit === 'L' ? 'liters' : unit) + ' from 0 to ' + mx + ', with water in it';
      shell(el, o, svg(W0, H0, body, lb, 300), lb); return;
    }
    var R = 118, S = 2 * R + 60, cx = S / 2, cy = R + 28, sweep = 1.8 * M.PI, a0 = -M.PI / 2;
    function A(v) { return a0 + v / mx * sweep; }
    body += rect(cx - 90, 2, 180, 14, 'var(--g3-wood)', 'var(--g3-wood-edge)', { rx: 4 }) + rect(cx - 10, 14, 20, 14, 'var(--g3-empty)', 'var(--g3-empty-edge)');
    body += circ(cx, cy, R + 6, 'var(--g3-empty)', 'var(--g3-green-edge)', 5) + circ(cx, cy, R - 4, 'var(--g3-face)', 'none');
    var labs = '';
    for (i = 0; i <= ticks; i++) { var v2 = i * st / (mn + 1), big2 = i % (mn + 1) === 0, a = A(v2), r1 = R - 6, r2 = R - (big2 ? 22 : 13); body += line(cx + r1 * M.cos(a), cy + r1 * M.sin(a), cx + r2 * M.cos(a), cy + r2 * M.sin(a), 'var(--g3-ink)', big2 ? 2.4 : 1.3); if (big2) { var lab2 = String(M.round(v2 * 100) / 100), rl = R - 36 - M.max(0, lab2.length - 2) * 7; labs += T(cx + rl * M.cos(a), cy + rl * M.sin(a), lab2, { size: lab2.length > 3 ? 13 : 15, wt: 800, halo: 'var(--g3-face)' }); } }
    var na = A(val);
    body += line(cx, cy, cx + (R - 12) * M.cos(na), cy + (R - 12) * M.sin(na), 'var(--g3-red-edge)', 3.5) + labs + circ(cx, cy, 8, 'var(--g3-red)', 'var(--g3-red-edge)', 2);
    body += T(cx, cy + R + 24, unit === 'kg' ? 'kilograms' : unit === 'g' ? 'grams' : unit, { size: 15, wt: 700, cls: 'g3-mut' });
    lb = 'A dial scale marked in ' + (unit === 'kg' ? 'kilograms' : unit === 'g' ? 'grams' : unit) + ' from 0 to ' + mx + ', with a needle pointing to the mass';
    shell(el, o, svg(S, cy + R + 40, body, lb, 300), lb);
  };

  /* ------------------------------------------------------------------ registration */
  function boot() {
    if (!ML.viz || !ML.viz.register || boot.done) return false;
    boot.done = true; injectCss();
    Object.keys(defs).forEach(function (k) { register(k, defs[k]); });
    return true;
  }
  function register(name, fn) { ML.viz.register(name, function (el, o) { try { fn(el, o || {}); } catch (e) { el.innerHTML = '<p class="ml-viz-err">This picture could not be drawn.</p>'; if (W.console) W.console.error('g3 visual ' + name, e); } return {}; }); }
  /* (the names, for tools that scan this file: register('g3-groups') register('g3-array') register('g3-frac')
     register('g3-nline') register('g3-shape') register('g3-graph') register('g3-ruler') register('g3-lineplot')
     register('g3-clock') register('g3-measure')) */
  ML.g3viz = defs;
  if (!boot()) {
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
    W.addEventListener('load', boot);
  }
})(window, document);
