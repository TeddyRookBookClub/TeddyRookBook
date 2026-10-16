/* Math Ladder: friendly pictures for Grade 1 (static/math/viz/g1.js), registered as "g1-pic".
   Built from one source for Kindergarten (k-pic) and Grade 1 (g1-pic): /tmp/work_mlp1/src/pic.src.js.
   Still pictures for young learners: things to count, groups to join, take away and compare, lengths, heights, a pan
   balance, position words, flat and solid shapes, equal shares, base-ten blocks, a piece of the hundred chart, a picture
   graph, a number bond, a number path and big digits. Nothing in the picture gives an answer away, so it is safe inside a
   practice problem. In a "group" picture the learner may tap each thing to count it (it gets its number).

   Use:  <div class="ml-viz" data-viz="g1-pic" data-opts='{"n": 7, "obj": "apple"}'></div>

   Options every kind understands:  kind (default "group"), label (aria-label), title (a heading above the picture),
   size (object radius in px for group pictures, default 22), seed (for scattered layouts), tap (false: no tap-to-count).

   kind "group"   things to count.  n, obj, color, layout, cols, cross, ring, nums, plate, mix, flash, groups, op, stack, spread
       obj        dot apple star heart ball fish duck flower car balloon ladybug cookie bear cube    (default "apple")
       color      red yellow blue green orange purple pink brown tan (default: the thing's own color)
       layout     "row" (rows of up to 10), "line" (one line), "grid" (rows of cols, default 5), "circle", "scatter",
                  "dice" (dot patterns 1 to 9 on a die), "frame" (ten frames: n red counters, then m yellow ones;
                  split: true starts the yellow ones in the second frame; frames: 1 | 2)
       cross: 3   cross out the last 3 (taken away)          ring: [0, 1] or 2   a soft ring behind those (or the first k)
       nums: true number every thing (1, 2, 3 …)             plate: true   a mat under the group (shows that 0 means none)
       mix: [{obj: "apple", n: 3}, {obj: "star", n: 4}]       different things mixed together (with layout scatter or row)
       flash: 1500 show the things for 1.5 s, then cover them (a "Look again" button shows them again)
       groups: [{n, obj, color, layout, cols, cross, ring, mix, label, m, split}, …]   several groups; op: "+", "−", "=" or
                  "and" drawn between them; stack: true | false | "auto" (one above the other; auto stacks when the row
                  is too wide); spread: true (stacked rows only: the smaller row is spaced out so it looks longer);
                  rows: true (stacked rows lined up at the left, one under the other, for matching; labels on the left)
   kind "lengths" things lying down to compare or measure.  items: [{len: 6, obj, color, at: 0, name, units}],
       unit: 34 (px per unit), grid: false (faint unit lines), line: false (a start line at 0)
       obj        pencil crayon ribbon straw worm train (connected cubes) ; units: {n, obj: "cube" | "clip", at: 0,
                  gaps: [2] (a gap after the 2nd unit), overlaps: [3] (the 4th overlaps the 3rd), ofs: 0 (a shift in units)}
                  (an item with only units and no obj shows just the units)
   kind "heights" things standing up.  items: [{h: 5, obj: "tower" | "tree" | "flower", color, name}], unit: 26
   kind "balance" a pan balance.  left / right: lists of feather leaf balloon rock brick watermelon pumpkin book apple
       ball bear cube, or {text: "3 + 4"};  tilt: "left" (left side heavier, so it goes down) | "right" | "level"
   kind "scene"   position words.  thing: "bear" | "ball", ref: "table" | "box", pos: above below on under left right
       in front behind
   kind "shapes"  items: [{s, rot: 0, scale: 1, color, name, parts}]   flat: circle oval square rectangle rectangle-tall
       triangle triangle-right triangle-skinny triangle-wide triangle-obtuse hexagon pentagon octagon rhombus trapezoid
       halfcircle quartercircle open-triangle curvy-triangle open-square ; solid: cube box cylinder cone sphere pyramid ;
       parts: [[[x, y], …], {path: "M…"}]  a shape made of pieces (unit coordinates, about −1 to 1), seams drawn.
       corners: true marks the corners with dots; cell: 130 (px per shape)
   kind "split"   equal or unequal parts.  items: [{s: "circle" | "rect" | "square", parts: 2 | 3 | 4, equal: true,
       how: "v" | "h" | "grid" | "diag" | "x", shade: 1, name}]
   kind "blocks"  base-ten blocks.  tens, ones (green), tens2, ones2 (blue, being added), crossT, crossO (crossed out),
       items: [{tens, ones, name}] for several numbers side by side
   kind "chart"   a piece of the hundred chart.  start: 1, rows: 3, cols: 10, blank: [n…] (empty squares), ask: n (a "?"
       to find), mark: [n…] (shaded)
   kind "graph"   a picture graph.  cats: [{name: "Apples", n: 4, obj: "apple", color}], note: "Each picture is 1 vote."
   kind "bond"    a number bond.  whole, a, b, hide: "whole" | "a" | "b"
   kind "path"    a number path.  from, to (keep it to about 12 squares), start, hops, dir: 1 | -1, hide: [n…], mark: [n…]
   kind "digits"  big digits in boxes.  items: [{d: "3", flip: false, name}]                                              */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var NAME = 'g1-pic';
  var M = Math, PI = M.PI;
  var uidN = 0;

  /* ---------------------------------------------------------------- styles (shared by k-pic and g1-pic) */
  var CSS = [
    '.kp{--kp-ink:#1d2320;--kp-muted:#5d6862;--kp-line:#cfd9d2;--kp-card:#fff;--kp-soft:#f4f1e8;--kp-shade:rgba(0,112,60,.55);',
    '--kp-red:#ee5d6c;--kp-redE:#c93a4b;--kp-yellow:#ffcf3f;--kp-yellowE:#c99700;--kp-blue:#4f93e0;--kp-blueE:#2f6fb8;',
    '--kp-green:#38b27a;--kp-greenE:#1f8a58;--kp-orange:#f59f4a;--kp-orangeE:#d26d18;--kp-purple:#9775e8;--kp-purpleE:#6741d9;',
    '--kp-pink:#f07fae;--kp-pinkE:#c2255c;--kp-brown:#b07a45;--kp-brownE:#77502b;--kp-tan:#e8bf85;--kp-tanE:#b9864a;',
    '--kp-gray:#a4aeaa;--kp-grayE:#6b7570;--kp-gold:#b8963e;--kp-goldS:rgba(184,150,62,.25);--kp-wood:#c99a62;--kp-woodE:#8e6337;',
    '--kp-sky:#dff0fb;--kp-dark:#333b37}',
    'html[data-theme="dark"] .kp{--kp-ink:#e6ece8;--kp-muted:#a9b8af;--kp-line:#3b5a48;--kp-card:#14211a;--kp-soft:#223529;--kp-shade:rgba(108,199,154,.55);',
    '--kp-red:#f08080;--kp-redE:#c25560;--kp-yellow:#f2c94c;--kp-yellowE:#b8912a;--kp-blue:#7cb8f2;--kp-blueE:#4f88c2;',
    '--kp-green:#74d0a0;--kp-greenE:#4a9c72;--kp-orange:#ffb066;--kp-orangeE:#c77a2e;--kp-purple:#b79cf5;--kp-purpleE:#8a6bd6;',
    '--kp-pink:#f59cc2;--kp-pinkE:#c2557f;--kp-brown:#c99a6b;--kp-brownE:#8e6a43;--kp-tan:#e6c79a;--kp-tanE:#b08c5c;',
    '--kp-gray:#8f9a95;--kp-grayE:#5f6a65;--kp-gold:#e0bd5c;--kp-goldS:rgba(224,189,92,.25);--kp-wood:#b38a5a;--kp-woodE:#7d5a33;',
    '--kp-sky:#1d3340;--kp-dark:#0d1310}',
    '.kp .kp-title{margin:0 0 .4rem;font-weight:700;font-size:1rem}',
    '.kp .kp-stage{position:relative;background:var(--kp-card);border-radius:10px;padding:8px 6px;text-align:center;overflow:hidden}',
    '.kp .kp-svg{display:block;margin:0 auto;max-width:100%;height:auto;overflow:visible;font-family:ui-rounded,"SF Pro Rounded","Arial Rounded MT Bold",system-ui,sans-serif}',
    '.kp .kp-o{cursor:pointer;outline:none}',
    '.kp .kp-o .kp-fr{opacity:0;transition:opacity .15s}',
    '.kp .kp-o:focus-visible .kp-fr{opacity:1}',
    '.kp .kp-ro{margin:.45rem 0 0;font-size:.95rem;line-height:1.45;min-height:1.45em}',
    '.kp .kp-ro:empty{display:none}',
    '.kp .kp-ctl{display:flex;flex-wrap:wrap;gap:.5rem;margin:.5rem 0 0}',
    '.kp .kp-ctl:empty{display:none}',
    '.kp .kp-btn{font:600 .9rem system-ui,sans-serif;min-height:38px;padding:.35rem .9rem;border-radius:999px;border:1px solid var(--kp-line);background:var(--kp-card);color:var(--kp-ink);cursor:pointer}',
    '.kp .kp-btn:hover{border-color:var(--kp-gold)}',
    '.kp .kp-btn:focus-visible{outline:3px solid #b8963e;outline-offset:2px}',
    '.kp .kp-cover{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--kp-soft);border-radius:10px;font:800 2.6rem ui-rounded,system-ui,sans-serif;color:var(--kp-muted)}',
    '.kp .kp-cover[hidden]{display:none}',
    '.kp-say{font-size:1.25rem;line-height:1.5}',
    '.kp-big{display:inline-block;font-size:1.45em;line-height:1.35;margin:.15em 0}',
    '.kp-big math{font-size:1em}'
  ].join('');
  function injectCss() { if (D.getElementById('kp-css')) return; var s = D.createElement('style'); s.id = 'kp-css'; s.textContent = CSS; (D.head || D.documentElement).appendChild(s); }

  /* ---------------------------------------------------------------- small helpers */
  function r1(v) { return M.round(v * 10) / 10; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function int(v, d) { v = parseInt(v, 10); return isFinite(v) ? v : d; }
  function seeded(seed) { var s = ((seed | 0) * 2654435761 >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function shuffle(a, rnd) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = M.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var COLS = ['red', 'yellow', 'blue', 'green', 'orange', 'purple', 'pink', 'brown', 'tan', 'gray'];
  function cp(name) { name = COLS.indexOf(name) >= 0 ? name : 'red'; return ['var(--kp-' + name + ')', 'var(--kp-' + name + 'E)']; }
  function st(fill, stroke, sw, extra) { return ' style="fill:' + (fill || 'none') + ';stroke:' + (stroke || 'none') + (sw ? ';stroke-width:' + sw : '') + (extra ? ';' + extra : '') + '"'; }
  function txt(x, y, s, size, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" style="fill:' + (o.col || 'var(--kp-ink)') + ';font-size:' + size + 'px;font-weight:' + (o.wt || 700) + (o.halo ? ';paint-order:stroke;stroke:var(--kp-card);stroke-width:4px' : '') + '">' + esc(s) + '</text>';
  }
  function g(x, y, sc, inner, extra) { return '<g transform="translate(' + r1(x) + ' ' + r1(y) + ')' + (sc !== 1 ? ' scale(' + M.round(sc * 1000) / 1000 + ')' : '') + '"' + (extra || '') + '>' + inner + '</g>'; }
  function shine(x, y, rx, ry) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + (ry || rx) + '" style="fill:#fff;opacity:.38"/>'; }
  function poly(pts, s) { return '<polygon points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '"' + s + '/>'; }

  /* ---------------------------------------------------------------- things to count (drawn in a box from -10 to 10) */
  var DEF = { dot: 'red', apple: 'red', star: 'yellow', heart: 'pink', ball: 'blue', fish: 'orange', duck: 'yellow', flower: 'purple', car: 'blue', balloon: 'red', ladybug: 'red', cookie: 'tan', bear: 'brown', cube: 'blue' };
  var OBJ = {
    dot: function (c) { return '<circle r="8.6"' + st(c[0], c[1], 1.1) + '/>' + shine(-2.9, -2.9, 2.5); },
    apple: function (c) {
      return '<path d="M0,-5.5C3.5,-8.5 9.5,-7 9.2,-.5C9,5.5 4.5,9.5 1.8,8.8C.8,8.5 -.8,8.5 -1.8,8.8C-4.5,9.5 -9,5.5 -9.2,-.5C-9.5,-7 -3.5,-8.5 0,-5.5Z"' + st(c[0], c[1], 1) + '/>' +
        '<path d="M0,-5.5C.2,-7.5 .8,-9 1.6,-9.8"' + st('none', 'var(--kp-brownE)', 1.5, 'stroke-linecap:round') + '/>' +
        '<path d="M.8,-7.4C2.5,-10 5.5,-9.6 6.2,-8.6C4.6,-6.8 2.2,-6.6 .8,-7.4Z"' + st('var(--kp-green)', 'var(--kp-greenE)', .8) + '/>' + shine(-4.6, -2.2, 1.6, 2.6);
    },
    star: function (c) {
      var p = []; for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, q = i % 2 ? 4.4 : 10; p.push([q * M.cos(a), q * M.sin(a) + .8]); }
      return poly(p, st(c[0], c[1], 1.1, 'stroke-linejoin:round'));
    },
    heart: function (c) { return '<path d="M0,8.6C-9,2.6 -10.6,-4.4 -5.6,-7.5C-2.6,-9.2 0,-7.1 0,-4.5C0,-7.1 2.6,-9.2 5.6,-7.5C10.6,-4.4 9,2.6 0,8.6Z"' + st(c[0], c[1], 1.1, 'stroke-linejoin:round') + '/>' + shine(-4.4, -3.8, 1.6); },
    ball: function (c) {
      return '<circle r="9"' + st(c[0], c[1], 1.1) + '/>' + '<path d="M-6.2,-6.6C-2.4,-2.4 -2.4,2.4 -6.2,6.6M6.2,-6.6C2.4,-2.4 2.4,2.4 6.2,6.6"' + st('none', '#fff', 1.6, 'opacity:.85') + '/>' + shine(-3.6, -4.4, 2);
    },
    fish: function (c) {
      return '<path d="M4.6,0L9.8,-4.8L9.8,4.8Z"' + st(c[0], c[1], 1, 'stroke-linejoin:round') + '/>' + '<ellipse cx="-1.2" cy="0" rx="7" ry="4.8"' + st(c[0], c[1], 1) + '/>' +
        '<path d="M-1,-4.6C0,-6.8 2.6,-7 3.6,-6C3,-5 2.4,-4.4 2,-3.6Z"' + st(c[1], 'none') + '/>' + '<circle cx="-4.6" cy="-1.2" r="1.15"' + st('var(--kp-dark)', 'none') + '/>' +
        '<path d="M-1.6,-1.8C-.6,-.6 -.6,.6 -1.6,1.8"' + st('none', c[1], .8) + '/>';
    },
    duck: function (c) {
      return '<path d="M8.4,1.4L10,-1.2L6.8,.6Z"' + st(c[0], c[1], .9) + '/>' + '<ellipse cx="1.2" cy="3.6" rx="7.8" ry="4.7"' + st(c[0], c[1], 1) + '/>' +
        '<circle cx="-3.8" cy="-3.4" r="3.9"' + st(c[0], c[1], 1) + '/>' + '<path d="M-7.4,-3.6L-10.2,-2.4L-7.2,-1.4Z"' + st('var(--kp-orange)', 'var(--kp-orangeE)', .7, 'stroke-linejoin:round') + '/>' +
        '<circle cx="-4.5" cy="-4.2" r=".85"' + st('var(--kp-dark)', 'none') + '/>' + '<path d="M-.4,2.4C2.4,.2 6,.8 6.6,3.2C4,4.8 1.4,4.6 -.4,2.4Z"' + st(c[1], 'none', 0, 'opacity:.45') + '/>';
    },
    flower: function (c) {
      var s = ''; for (var i = 0; i < 5; i++) { var a = -PI / 2 + i * 2 * PI / 5; s += '<circle cx="' + r1(5.1 * M.cos(a)) + '" cy="' + r1(5.1 * M.sin(a)) + '" r="4"' + st(c[0], c[1], .9) + '/>'; }
      return s + '<circle r="3.4"' + st('var(--kp-yellow)', 'var(--kp-yellowE)', .9) + '/>';
    },
    car: function (c) {
      return '<path d="M-9.6,2.4L-9.6,-.6Q-9.6,-2.6 -7.6,-2.6L-5.4,-2.6L-3.2,-6.6L4,-6.6L6.6,-2.6L8.4,-2.3Q9.8,-2 9.8,-.4L9.8,2.4Z"' + st(c[0], c[1], 1, 'stroke-linejoin:round') + '/>' +
        '<path d="M-2.6,-5.7L-4.2,-2.6L-.5,-2.6L-.5,-5.7ZM.6,-5.7L.6,-2.6L5,-2.6L3.4,-5.7Z"' + st('var(--kp-sky)', c[1], .6) + '/>' +
        '<circle cx="-5" cy="2.8" r="2.7"' + st('var(--kp-dark)', 'none') + '/><circle cx="5" cy="2.8" r="2.7"' + st('var(--kp-dark)', 'none') + '/>' +
        '<circle cx="-5" cy="2.8" r="1"' + st('#ccc', 'none') + '/><circle cx="5" cy="2.8" r="1"' + st('#ccc', 'none') + '/>';
    },
    balloon: function (c) {
      return '<path d="M0,6.4C-1.4,7.8 1.4,8.6 0,10.2"' + st('none', 'var(--kp-muted)', .8) + '/>' + '<ellipse cx="0" cy="-2.4" rx="6.4" ry="7.6"' + st(c[0], c[1], 1) + '/>' +
        '<path d="M-1.1,5.1L1.1,5.1L0,6.5Z"' + st(c[0], c[1], .8) + '/>' + shine(-2.6, -5.4, 1.4, 2.4);
    },
    ladybug: function (c) {
      return '<path d="M-2.4,-8.6L-4.2,-10.2M2.4,-8.6L4.2,-10.2"' + st('none', 'var(--kp-dark)', .9, 'stroke-linecap:round') + '/>' + '<circle cx="0" cy="-6.4" r="3.6"' + st('var(--kp-dark)', 'none') + '/>' +
        '<circle cx="0" cy="1.2" r="8"' + st(c[0], c[1], 1) + '/>' + '<path d="M0,-6.6L0,9.2"' + st('none', 'var(--kp-dark)', .9) + '/>' +
        '<circle cx="-3.9" cy="-1.4" r="1.6"' + st('var(--kp-dark)', 'none') + '/><circle cx="3.9" cy="-1.4" r="1.6"' + st('var(--kp-dark)', 'none') + '/>' +
        '<circle cx="-4.3" cy="4.2" r="1.4"' + st('var(--kp-dark)', 'none') + '/><circle cx="4.3" cy="4.2" r="1.4"' + st('var(--kp-dark)', 'none') + '/>';
    },
    cookie: function (c) {
      var s = '<circle r="9"' + st(c[0], c[1], 1.1) + '/>', ch = [[-4, -3.6], [2.6, -5], [4.6, 1], [-1, 1.4], [-4.6, 3.6], [1.8, 5.4]];
      ch.forEach(function (p) { s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1.2" ry=".95"' + st('var(--kp-brownE)', 'none') + '/>'; });
      return s;
    },
    bear: function (c) {
      return '<circle cx="-6.2" cy="-6" r="3.1"' + st(c[0], c[1], 1) + '/><circle cx="6.2" cy="-6" r="3.1"' + st(c[0], c[1], 1) + '/>' +
        '<circle cx="-6.2" cy="-6" r="1.5"' + st('var(--kp-tan)', 'none') + '/><circle cx="6.2" cy="-6" r="1.5"' + st('var(--kp-tan)', 'none') + '/>' +
        '<circle cx="0" cy=".4" r="8.2"' + st(c[0], c[1], 1) + '/>' + '<ellipse cx="0" cy="3.4" rx="3.7" ry="2.9"' + st('var(--kp-tan)', 'none') + '/>' +
        '<ellipse cx="0" cy="2.3" rx="1.35" ry=".95"' + st('var(--kp-dark)', 'none') + '/>' + '<circle cx="-3" cy="-1.6" r=".95"' + st('var(--kp-dark)', 'none') + '/><circle cx="3" cy="-1.6" r=".95"' + st('var(--kp-dark)', 'none') + '/>' +
        '<path d="M-1.3,4.4Q0,5.5 1.3,4.4"' + st('none', 'var(--kp-dark)', .7, 'stroke-linecap:round') + '/>';
    },
    cube: function (c) { return '<rect x="-8.4" y="-8.4" width="16.8" height="16.8" rx="1.8"' + st(c[0], c[1], 1.1) + '/><rect x="-3.6" y="-3.6" width="7.2" height="7.2" rx="1"' + st('#fff', 'none', 0, 'opacity:.3') + '/>'; }
  };
  function objSvg(type, color) { var f = OBJ[type] || OBJ.dot; return f(cp(color || DEF[type] || 'red')); }
  var CROSS = '<path d="M-8.5,-8.5L8.5,8.5M8.5,-8.5L-8.5,8.5"' + st('none', 'var(--kp-ink)', 2.1, 'stroke-linecap:round') + '/>';

  /* ---------------------------------------------------------------- group layouts: positions of n things, cell s */
  function dicePts(n) {
    var P = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
      6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]], 7: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2], [1, 1]], 8: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2], [1, 0], [1, 2]],
      9: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]] };
    return P[M.max(1, M.min(9, n))] || [];
  }
  function layout(gr, r, rnd) {
    var n = gr.n, s = r * 2.5, L = gr.layout || 'row', pts = [], i, w, h, extra = '';
    if (n <= 0) return { pts: [], w: s * 2.2, h: s * 1.2 };
    if (L === 'circle') {
      var R = M.max(s * 0.95, n * s / (2 * PI) * 1.05);
      for (i = 0; i < n; i++) { var a = -PI / 2 + i * 2 * PI / n; pts.push([R + s / 2 + R * M.cos(a), R + s / 2 + R * M.sin(a)]); }
      return { pts: pts, w: 2 * R + s, h: 2 * R + s };
    }
    if (L === 'dice') {
      var d = dicePts(n), q = s * 0.95, pad = s * 0.55, side = 2 * q + 2 * pad;
      d.forEach(function (p) { pts.push([pad + p[0] * q, pad + p[1] * q]); });
      extra = '<rect x="' + r1(pad - s * 0.48) + '" y="' + r1(pad - s * 0.48) + '" width="' + r1(side - 2 * pad + s * 0.96) + '" height="' + r1(side - 2 * pad + s * 0.96) + '" rx="' + r1(s * 0.4) + '"' + st('var(--kp-soft)', 'var(--kp-line)', 2) + '/>';
      return { pts: pts.slice(0, n), w: side, h: side, under: extra };
    }
    if (L === 'scatter') {
      var cols = M.max(2, M.ceil(M.sqrt(n * 1.7))), rows = M.ceil(n / cols) + (n > 5 ? 1 : 0), cells = [], q2 = s * 1.08;
      for (i = 0; i < cols * rows; i++) cells.push(i);
      var pick = [], rest = [];            // one thing in every row first, so no row is left empty
      for (i = 0; i < rows && pick.length < n; i++) pick.push(i * cols + M.floor(rnd() * cols));
      cells.forEach(function (c) { if (pick.indexOf(c) < 0) rest.push(c); });
      cells = pick.concat(shuffle(rest, rnd).slice(0, n - pick.length)).sort(function (x, y) { return x - y; });
      cells.forEach(function (c) { var cx = c % cols, cy = M.floor(c / cols); pts.push([q2 / 2 + cx * q2 + (rnd() - 0.5) * s * 0.22, q2 / 2 + cy * q2 + (rnd() - 0.5) * s * 0.2]); });
      return { pts: pts, w: cols * q2, h: rows * q2 };
    }
    var per = L === 'line' ? n : L === 'grid' ? (gr.cols || 5) : (gr.cols || (n <= 10 ? n : 10));
    var nr = M.ceil(n / per);
    for (i = 0; i < n; i++) { var row = M.floor(i / per), col = i % per; pts.push([s / 2 + col * s + (per === 10 && col >= 5 ? s * 0.25 : 0), s / 2 + row * s]); }
    w = M.min(n, per) * s + (per === 10 && n > 5 ? s * 0.25 : 0); h = nr * s;
    return { pts: pts, w: w, h: h };
  }
  /* ten frames: n red counters then m yellow ones */
  function frames(gr, r) {
    var n = M.max(0, gr.n | 0), m = M.max(0, gr.m | 0), split = !!gr.split, nf = gr.frames || ((split || n + m > 10) ? 2 : 1);
    var s = r * 2.5, fw = 5 * s, fh = 2 * s, gap = s * 0.45, side = gr.side !== false;
    var cells = [], i, out = '', pts = [], cols = [];
    for (i = 0; i < nf * 10; i++) cells.push(0);
    for (i = 0; i < n && i < cells.length; i++) cells[i] = 1;
    var st0 = split ? 10 : n; for (i = 0; i < m && st0 + i < cells.length; i++) cells[st0 + i] = 2;
    function xy(k) { var f = M.floor(k / 10), c = k % 10, rr = M.floor(c / 5), cc = c % 5; return [(side ? f * (fw + gap) : 0) + cc * s + s / 2, (side ? 0 : f * (fh + gap)) + rr * s + s / 2]; }
    for (var f = 0; f < nf; f++) {
      var x0 = side ? f * (fw + gap) : 0, y0 = side ? 0 : f * (fh + gap);
      out += '<rect x="' + r1(x0 - 3) + '" y="' + r1(y0 - 3) + '" width="' + r1(fw + 6) + '" height="' + r1(fh + 6) + '" rx="10"' + st('var(--kp-card)', 'var(--kp-greenE)', 3) + '/>';
      for (i = 0; i < 10; i++) { var p = xy(f * 10 + i); out += '<rect x="' + r1(p[0] - s / 2 + 3) + '" y="' + r1(p[1] - s / 2 + 3) + '" width="' + r1(s - 6) + '" height="' + r1(s - 6) + '" rx="8"' + st('var(--kp-soft)', 'none') + '/>'; }
      out += '<path d="M' + r1(x0) + ',' + r1(y0 + s) + 'H' + r1(x0 + fw) + '"' + st('none', 'var(--kp-line)', 1.2) + '/>';
    }
    cells.forEach(function (v, k) { if (v) { pts.push(xy(k)); cols.push(v === 1 ? 'red' : 'yellow'); } });
    return { pts: pts, cols: cols, w: side ? nf * fw + (nf - 1) * gap : fw, h: side ? fh : nf * fh + (nf - 1) * gap, under: out };
  }

  /* ---------------------------------------------------------------- kind: group */
  function kGroup(o, avail, S) {
    var r = +o.size || 22, s = r * 2.5, rnd = seeded(int(o.seed, 7) * 31 + 5);
    var groups = (o.groups || [o]).map(function (gr) {
      var q = {}; for (var k in gr) q[k] = gr[k];
      ['obj', 'color', 'layout', 'cols', 'plate'].forEach(function (k) { if (q[k] === undefined && o[k] !== undefined && o.groups) q[k] = o[k]; });
      if (q.mix) { q.types = []; q.mix.forEach(function (mx) { for (var i = 0; i < (mx.n | 0); i++) q.types.push([mx.obj || 'dot', mx.color]); }); q.types = shuffle(q.types, rnd); q.n = q.types.length; }
      q.n = M.max(0, int(q.n, 0)); return q;
    });
    var boxes = groups.map(function (gr) {
      var L = gr.layout === 'frame' ? frames(gr, r) : layout(gr, r, rnd);
      var lab = gr.label != null && gr.label !== '' ? 30 : 0;
      return { gr: gr, L: L, w: L.w + 16, h: L.h + 16 + lab, lab: lab };
    });
    var op = o.op || '', opW = op ? (op === 'and' ? 64 : 48) : (boxes.length > 1 ? 22 : 0);
    var wide = boxes.reduce(function (a, b) { return a + b.w; }, 0) + opW * (boxes.length - 1);
    var stack = o.stack === true || (o.stack !== false && boxes.length > 1 && wide > avail);
    var objs = [], W = 0, H = 0;
    if (stack && (o.spread || o.rows) && boxes.length > 1 && groups.every(function (gr) { return !gr.layout || gr.layout === 'row' || gr.layout === 'line'; })) {
      // rows side by side vertically; the smaller row is spaced out so it is longer than the bigger one
      var big = M.max.apply(null, groups.map(function (gr) { return gr.n; })), full = M.max(big * s, s * 2);
      var maxL = 0; groups.forEach(function (gr) { if (gr.label) maxL = M.max(maxL, String(gr.label).length); });
      var lw = maxL ? 16 + maxL * 9.6 : 0;
      if (!o.spread) full = big * s - s * 0.4;
      boxes.forEach(function (b, bi) {
        var n = b.gr.n, pts = [], i, tight = s * 0.82, fullW = full + s * 0.4;
        if (!o.spread) for (i = 0; i < n; i++) pts.push([s / 2 + i * s, s / 2]);
        else if (n === big && groups.some(function (gr) { return gr.n < big; })) for (i = 0; i < n; i++) pts.push([s / 2 + i * tight, s / 2]);
        else if (n < big && n > 1) for (i = 0; i < n; i++) pts.push([s / 2 + i * (fullW - s) / (n - 1), s / 2]);
        else for (i = 0; i < n; i++) pts.push([s / 2 + i * s, s / 2]);
        b.L = { pts: pts, w: fullW, h: s }; b.w = fullW + 16 + lw; b.h = s + 16; b.lab = 0; b.lw = lw;
      });
    }
    var x = 0, y = 0, ops = [];
    boxes.forEach(function (b, bi) {
      if (bi && !stack) { if (op) ops.push([x + opW / 2, null]); x += opW; }
      if (bi && stack) { if (op) { ops.push([null, y + 17]); y += 34; } else y += 10; }
      b.x = stack ? 0 : x; b.y = stack ? y : 0;
      if (stack) { y += b.h; W = M.max(W, b.w); } else { x += b.w; H = M.max(H, b.h); }
    });
    if (stack) H = y; else W = x;
    var svg = '';
    boxes.forEach(function (b) {
      var bx = stack ? (W - b.w) / 2 : b.x, by = stack ? b.y : (H - b.h) / 2, gr = b.gr, L = b.L;
      if (stack && b.lw) bx = 0;
      var ox = bx + 8 + (b.lw || 0), oy = by + 8;
      if (gr.plate || (gr.n === 0 && gr.layout !== 'frame')) svg += '<rect x="' + r1(bx + 2) + '" y="' + r1(by + 2) + '" width="' + r1(b.w - 4) + '" height="' + r1(b.h - 4 - b.lab) + '" rx="' + r1(M.min(28, (b.h - b.lab) / 2)) + '"' + st('var(--kp-soft)', 'var(--kp-line)', 2) + '/>';
      if (L.under) svg += g(ox, oy, 1, L.under);
      var ring = gr.ring, rings = {};
      if (typeof ring === 'number') for (var i = 0; i < ring; i++) rings[i] = 1; else if (Array.isArray(ring)) ring.forEach(function (k) { rings[k] = 1; });
      var cross = M.max(0, int(gr.cross, 0));
      L.pts.forEach(function (p, i) {
        var type = gr.types ? gr.types[i][0] : (gr.layout === 'frame' ? (gr.obj || 'dot') : (gr.obj || 'apple'));
        var col = gr.types ? gr.types[i][1] : (L.cols ? L.cols[i] : gr.color);
        objs.push({ x: ox + p[0], y: oy + p[1], r: r, type: type, col: col, cross: i >= L.pts.length - cross, ring: !!rings[i], num: gr.nums ? i + 1 : 0 });
      });
      if (b.lab) svg += txt(bx + b.w / 2, by + b.h - 14, gr.label, 17, { col: 'var(--kp-ink)' });
      if (b.lw) svg += txt(bx + 8, by + b.h / 2, gr.label, 16, { anchor: 'start' });
    });
    ops.forEach(function (p) { svg += txt(p[0] == null ? W / 2 : p[0], p[1] == null ? H / 2 - 4 : p[1], op, op === 'and' ? 22 : (stack ? 34 : 40), { col: 'var(--kp-muted)', wt: 800 }); });
    return { w: W, h: H, svg: svg, objs: objs, label: 'A picture of things to count' };
  }

  /* ---------------------------------------------------------------- kind: lengths */
  function lenItem(obj, x, y, L, u, col) {
    var c = cp(col || ({ pencil: 'yellow', crayon: 'blue', ribbon: 'red', straw: 'green', worm: 'pink', train: 'blue' })[obj] || 'blue'), h = u * 0.66, t = y - h / 2, s = '';
    if (obj === 'pencil') {
      var tip = M.min(u * 0.9, L * 0.25), er = M.min(u * 0.45, L * 0.15);
      s += '<rect x="' + r1(x + er) + '" y="' + r1(t) + '" width="' + r1(L - er - tip) + '" height="' + r1(h) + '"' + st(c[0], c[1], 1.2) + '/>';
      s += '<path d="M' + r1(x + er) + ',' + r1(y) + 'H' + r1(x + L - tip) + '"' + st('none', c[1], 1, 'opacity:.5') + '/>';
      s += '<rect x="' + r1(x) + '" y="' + r1(t) + '" width="' + r1(er) + '" height="' + r1(h) + '" rx="3"' + st('var(--kp-pink)', 'var(--kp-pinkE)', 1.2) + '/>';
      s += '<rect x="' + r1(x + er - 3) + '" y="' + r1(t - 1) + '" width="6" height="' + r1(h + 2) + '"' + st('var(--kp-gray)', 'var(--kp-grayE)', 1) + '/>';
      s += poly([[x + L - tip, t], [x + L, y], [x + L - tip, t + h]], st('var(--kp-tan)', 'var(--kp-tanE)', 1.2, 'stroke-linejoin:round'));
      s += poly([[x + L - tip * 0.32, y - h * 0.16], [x + L, y], [x + L - tip * 0.32, y + h * 0.16]], st('var(--kp-dark)', 'none'));
    } else if (obj === 'crayon') {
      var tp = M.min(u * 0.8, L * 0.22);
      s += '<rect x="' + r1(x) + '" y="' + r1(t) + '" width="' + r1(L - tp) + '" height="' + r1(h) + '" rx="4"' + st(c[0], c[1], 1.2) + '/>';
      s += '<rect x="' + r1(x + (L - tp) * 0.18) + '" y="' + r1(t) + '" width="' + r1((L - tp) * 0.62) + '" height="' + r1(h) + '"' + st('#fff', 'none', 0, 'opacity:.28') + '/>';
      s += poly([[x + L - tp, t + h * 0.12], [x + L, y], [x + L - tp, t + h * 0.88]], st(c[0], c[1], 1.2, 'stroke-linejoin:round'));
    } else if (obj === 'ribbon') {
      var nt = M.min(u * 0.35, L * 0.1);
      s += poly([[x, t], [x + L, t], [x + L - nt, y], [x + L, t + h], [x, t + h], [x + nt, y]], st(c[0], c[1], 1.2, 'stroke-linejoin:round'));
      s += '<path d="M' + r1(x + nt) + ',' + r1(t + h * 0.25) + 'H' + r1(x + L - nt) + 'M' + r1(x + nt) + ',' + r1(t + h * 0.75) + 'H' + r1(x + L - nt) + '"' + st('none', '#fff', 1.2, 'opacity:.5;stroke-dasharray:4 4') + '/>';
    } else if (obj === 'straw') {
      var hh = h * 0.55;
      s += '<rect x="' + r1(x) + '" y="' + r1(y - hh / 2) + '" width="' + r1(L) + '" height="' + r1(hh) + '" rx="3"' + st('var(--kp-card)', c[1], 1.4) + '/>';
      for (var k = x + 4; k < x + L - 6; k += 12) s += poly([[k, y + hh / 2], [k + 6, y - hh / 2], [k + 10, y - hh / 2], [k + 4, y + hh / 2]], st(c[0], 'none'));
    } else if (obj === 'worm') {
      s += '<rect x="' + r1(x) + '" y="' + r1(t) + '" width="' + r1(L) + '" height="' + r1(h) + '" rx="' + r1(h / 2) + '"' + st(c[0], c[1], 1.2) + '/>';
      for (var j = x + h; j < x + L - h * 1.2; j += h * 0.7) s += '<path d="M' + r1(j) + ',' + r1(t + 3) + 'v' + r1(h - 6) + '"' + st('none', c[1], 1, 'opacity:.55') + '/>';
      s += '<circle cx="' + r1(x + L - h * 0.42) + '" cy="' + r1(y - h * 0.12) + '" r="' + r1(h * 0.1) + '"' + st('var(--kp-dark)', 'none') + '/>';
    } else if (obj === 'train') {
      var n = M.round(L / u);
      for (var i = 0; i < n; i++) s += '<rect x="' + r1(x + i * u + 1) + '" y="' + r1(y - u * 0.42) + '" width="' + r1(u - 2) + '" height="' + r1(u * 0.84) + '" rx="3"' + st(i % 2 ? c[0] : 'var(--kp-yellow)', i % 2 ? c[1] : 'var(--kp-yellowE)', 1.2) + '/>';
    }
    return s;
  }
  function unitRow(un, x0, y, u) {
    var s = '', n = un.n | 0, x = x0 + (+un.ofs || 0) * u, gaps = un.gaps || [], ov = un.overlaps || [], clip = un.obj === 'clip';
    for (var i = 0; i < n; i++) {
      if (i && ov.indexOf(i) >= 0) x -= u * 0.38;
      if (clip) {
        var w = u - 4, h = u * 0.46, x1 = x + 2;
        s += '<rect x="' + r1(x1) + '" y="' + r1(y - h / 2) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="' + r1(h / 2) + '"' + st('none', 'var(--kp-grayE)', 2.2) + '/>';
        s += '<rect x="' + r1(x1 + w * 0.16) + '" y="' + r1(y - h * 0.24) + '" width="' + r1(w * 0.62) + '" height="' + r1(h * 0.48) + '" rx="' + r1(h * 0.24) + '"' + st('none', 'var(--kp-grayE)', 1.8) + '/>';
      } else s += '<rect x="' + r1(x + 1) + '" y="' + r1(y - u * 0.42) + '" width="' + r1(u - 2) + '" height="' + r1(u * 0.84) + '" rx="3"' + st(i % 2 ? 'var(--kp-orange)' : 'var(--kp-green)', i % 2 ? 'var(--kp-orangeE)' : 'var(--kp-greenE)', 1.2) + '/>';
      x += u; if (gaps.indexOf(i + 1) >= 0) x += u * 0.45;
    }
    return s;
  }
  function kLengths(o) {
    var items = o.items || [], u = +o.unit || 40, lw = items.some(function (it) { return it.name; }) ? 64 : 8, x0 = lw + 8, maxE = 1, y = 10, svg = '', top = 0;
    items.forEach(function (it) { maxE = M.max(maxE, (+it.at || 0) + (+it.len || 0), it.units ? (+it.units.ofs || 0) + (it.units.n | 0) + (it.units.gaps || []).length * 0.45 : 0); });
    var W = x0 + maxE * u + 14, rows = '';
    items.forEach(function (it) {
      var rowH = (it.obj ? u * 0.95 : 0) + (it.units ? u * 1.0 : 0) + 12, cy = y + (it.obj ? u * 0.5 : u * 0.5);
      if (it.name) rows += txt(8, y + rowH / 2 - 6, it.name, 17, { anchor: 'start' });
      if (it.obj) rows += lenItem(it.obj, x0 + (+it.at || 0) * u, cy, (+it.len) * u, u, it.color);
      if (it.units) rows += unitRow(it.units, x0, y + (it.obj ? u * 0.95 : 0) + u * 0.48, u);
      y += rowH;
    });
    var H = y + 2;
    if (o.grid) for (var i = 0; i <= maxE; i++) svg += '<path d="M' + r1(x0 + i * u) + ',2V' + r1(H - 2) + '"' + st('none', 'var(--kp-line)', 1, 'stroke-dasharray:3 4') + '/>';
    if (o.line) svg += '<path d="M' + r1(x0) + ',2V' + r1(H - 2) + '"' + st('none', 'var(--kp-muted)', 2) + '/>';
    return { w: W, h: H, svg: svg + rows, label: 'Things lying side by side to compare' };
  }

  /* ---------------------------------------------------------------- kind: heights */
  function kHeights(o) {
    var items = o.items || [], u = +o.unit || 26, cw = 96, maxH = 1;
    items.forEach(function (it) { maxH = M.max(maxH, +it.h || 1); });
    var lab = items.some(function (it) { return it.name; }) ? 30 : 0, gy = maxH * u + 18, W = items.length * cw + 20, H = gy + 8 + lab, s = '';
    s += '<path d="M6,' + r1(gy) + 'H' + r1(W - 6) + '"' + st('none', 'var(--kp-muted)', 2.5, 'stroke-linecap:round') + '/>';
    items.forEach(function (it, i) {
      var cx = 10 + cw * i + cw / 2, h = (+it.h || 1) * u, c = cp(it.color || ({ tower: 'blue', tree: 'green', flower: 'pink' })[it.obj] || 'blue');
      if (it.obj === 'tree') {
        var cr = M.min(cw * 0.42, h * 0.32), trunk = h - 2 * cr;
        s += '<rect x="' + r1(cx - 6) + '" y="' + r1(gy - trunk - 4) + '" width="12" height="' + r1(trunk + 4) + '" rx="3"' + st('var(--kp-brown)', 'var(--kp-brownE)', 1.2) + '/>';
        s += '<ellipse cx="' + r1(cx) + '" cy="' + r1(gy - trunk - cr) + '" rx="' + r1(M.min(cw * 0.44, cr * 1.15)) + '" ry="' + r1(cr) + '"' + st(c[0], c[1], 1.4) + '/>';
      } else if (it.obj === 'flower') {
        var fr = M.min(13, h * 0.2);
        s += '<path d="M' + r1(cx) + ',' + r1(gy) + 'V' + r1(gy - h + fr) + '"' + st('none', 'var(--kp-greenE)', 3) + '/>';
        s += '<path d="M' + r1(cx) + ',' + r1(gy - h * 0.35) + 'q10,-8 16,-2q-8,6 -16,2"' + st('var(--kp-green)', 'var(--kp-greenE)', 1) + '/>';
        s += g(cx, gy - h + fr, fr / 10, objSvg('flower', it.color || 'pink'));
      } else {
        var n = M.round(+it.h || 1);
        for (var k = 0; k < n; k++) s += '<rect x="' + r1(cx - u / 2 + 1) + '" y="' + r1(gy - (k + 1) * u + 1) + '" width="' + r1(u - 2) + '" height="' + r1(u - 2) + '" rx="3"' + st(k % 2 ? c[0] : 'var(--kp-yellow)', k % 2 ? c[1] : 'var(--kp-yellowE)', 1.2) + '/>';
      }
      if (it.name) s += txt(cx, gy + 20, it.name, 17);
    });
    return { w: W, h: H, svg: s, label: 'Things standing side by side to compare' };
  }

  /* ---------------------------------------------------------------- kind: balance */
  var HEAVY = {
    feather: function () { return '<path d="M-9,7C-4,-2 3,-8 9,-9C8,-2 1,5 -9,7Z"' + st('var(--kp-sky)', 'var(--kp-blueE)', 1) + '/><path d="M-9,7L6,-6"' + st('none', 'var(--kp-blueE)', 1) + '/>'; },
    leaf: function () { return '<path d="M-8,6C-8,-4 0,-9 9,-8C9,2 2,8 -8,6Z"' + st('var(--kp-green)', 'var(--kp-greenE)', 1) + '/><path d="M-8,6L6,-5"' + st('none', 'var(--kp-greenE)', 1) + '/>'; },
    rock: function () { return '<path d="M-9,6C-10,0 -6,-6 -1,-7C5,-8 9,-3 9.5,2C10,6 6,8 0,8C-5,8 -8.5,8 -9,6Z"' + st('var(--kp-gray)', 'var(--kp-grayE)', 1.1) + '/>' + shine(-3, -3, 2.2, 1.3); },
    brick: function () { return '<rect x="-9.5" y="-5" width="19" height="10" rx="1"' + st('var(--kp-red)', 'var(--kp-redE)', 1.1) + '/><path d="M-9.5,0H9.5M-3,-5V0M4,0V5"' + st('none', 'var(--kp-redE)', .8) + '/>'; },
    watermelon: function () { return '<ellipse rx="9.6" ry="7.4"' + st('var(--kp-green)', 'var(--kp-greenE)', 1.1) + '/><path d="M-6,-5C-3,0 -3,2 -6,5M0,-7.3C2,-2 2,2 0,7.3M6,-5C3,0 3,2 6,5"' + st('none', 'var(--kp-greenE)', 1.2) + '/>'; },
    pumpkin: function () { return '<ellipse cx="-4" cy="1" rx="5.4" ry="7"' + st('var(--kp-orange)', 'var(--kp-orangeE)', 1) + '/><ellipse cx="4" cy="1" rx="5.4" ry="7"' + st('var(--kp-orange)', 'var(--kp-orangeE)', 1) + '/><ellipse cx="0" cy="1" rx="4.4" ry="7.4"' + st('var(--kp-orange)', 'var(--kp-orangeE)', 1) + '/><path d="M0,-6L1,-9.5"' + st('none', 'var(--kp-greenE)', 2, 'stroke-linecap:round') + '/>'; },
    book: function () { return '<rect x="-9" y="-6.5" width="18" height="13" rx="1.5"' + st('var(--kp-blue)', 'var(--kp-blueE)', 1.1) + '/><rect x="-6.5" y="-4" width="10" height="3" rx=".5"' + st('#fff', 'none', 0, 'opacity:.5') + '/>'; }
  };
  function heavySvg(t) { if (HEAVY[t]) return HEAVY[t](); return objSvg(t); }
  function kBalance(o) {
    var W = 420, H = 250, cx = W / 2, py = 70, arm = 150, tilt = o.tilt === 'left' ? -11 : o.tilt === 'right' ? 11 : 0, a = tilt * PI / 180, s = '';
    s += poly([[cx - 36, H - 12], [cx + 36, H - 12], [cx, py + 6]], st('var(--kp-wood)', 'var(--kp-woodE)', 2, 'stroke-linejoin:round'));
    s += '<rect x="' + (cx - 60) + '" y="' + (H - 16) + '" width="120" height="10" rx="5"' + st('var(--kp-woodE)', 'none') + '/>';
    var lx = cx - arm * M.cos(a), ly = py - arm * M.sin(a), rx = cx + arm * M.cos(a), ry = py + arm * M.sin(a);
    s += '<path d="M' + r1(lx) + ',' + r1(ly) + 'L' + r1(rx) + ',' + r1(ry) + '"' + st('none', 'var(--kp-woodE)', 7, 'stroke-linecap:round') + '/>';
    s += '<circle cx="' + cx + '" cy="' + py + '" r="7"' + st('var(--kp-gold)', 'var(--kp-woodE)', 2) + '/>';
    function pan(x, y, list) {
      var dy = 62, out = '<path d="M' + r1(x) + ',' + r1(y) + 'L' + r1(x - 46) + ',' + r1(y + dy) + 'M' + r1(x) + ',' + r1(y) + 'L' + r1(x + 46) + ',' + r1(y + dy) + '"' + st('none', 'var(--kp-muted)', 1.5) + '/>';
      out += '<path d="M' + r1(x - 58) + ',' + r1(y + dy) + 'H' + r1(x + 58) + 'Q' + r1(x + 50) + ',' + r1(y + dy + 20) + ' ' + r1(x) + ',' + r1(y + dy + 20) + 'Q' + r1(x - 50) + ',' + r1(y + dy + 20) + ' ' + r1(x - 58) + ',' + r1(y + dy) + 'Z"' + st('var(--kp-gray)', 'var(--kp-grayE)', 1.5) + '/>';
      list = list || [];
      if (!Array.isArray(list)) list = [list];
      var n = list.length, sz = n > 2 ? 15 : 20;
      list.forEach(function (it, i) {
        var ox = x + (i - (n - 1) / 2) * (sz * 2.1);
        if (typeof it === 'object' && it.text != null) out += '<rect x="' + r1(x - 52) + '" y="' + r1(y + dy - 38) + '" width="104" height="34" rx="8"' + st('var(--kp-card)', 'var(--kp-line)', 1.5) + '/>' + txt(x, y + dy - 21, it.text, 21, { wt: 800 });
        else if (typeof it === 'object' && it.cubes) { for (var k = 0; k < it.cubes; k++) out += '<rect x="' + r1(ox - 9) + '" y="' + r1(y + dy - 18 * (k + 1)) + '" width="18" height="17" rx="2"' + st('var(--kp-blue)', 'var(--kp-blueE)', 1) + '/>'; }
        else out += g(ox, y + dy - sz * 0.85, sz / 10, heavySvg(String(it)));
      });
      return out;
    }
    s += pan(lx, ly, o.left) + pan(rx, ry, o.right);
    return { w: W, h: H, svg: s, label: 'A pan balance' };
  }

  /* ---------------------------------------------------------------- kind: scene (position words) */
  function kScene(o) {
    var W = 440, H = 290, gy = 262, s = '', pos = o.pos || 'above', ref = o.ref || 'table', thing = o.thing || 'bear', tr = 30;
    function bearBody() { return '<ellipse cx="0" cy="9.5" rx="6.6" ry="6.2"' + st('var(--kp-brown)', 'var(--kp-brownE)', .8) + '/><ellipse cx="0" cy="10.5" rx="3.6" ry="3.6"' + st('var(--kp-tan)', 'none') + '/>' + objSvg('bear'); }
    var foot = thing === 'bear' ? 15.6 : 9;            // from the thing's center down to where it touches the ground, in its units
    var item = function (x, yFoot, sc) { sc = (sc || 1) * tr / 10; return g(x, yFoot - foot * sc, sc, thing === 'ball' ? objSvg('ball', 'red') : bearBody()); };
    s += '<rect x="0" y="' + gy + '" width="' + W + '" height="' + (H - gy) + '" rx="4"' + st('var(--kp-soft)', 'none') + '/><path d="M0,' + gy + 'H' + W + '"' + st('none', 'var(--kp-line)', 3) + '/>';
    if (ref === 'table') {
      var tx0 = 130, tw = 180, ty = 150, cx = tx0 + tw / 2;
      s += '<rect x="' + tx0 + '" y="' + ty + '" width="' + tw + '" height="16" rx="4"' + st('var(--kp-wood)', 'var(--kp-woodE)', 2) + '/>' +
        '<rect x="' + (tx0 + 12) + '" y="' + (ty + 16) + '" width="12" height="' + (gy - ty - 16) + '"' + st('var(--kp-wood)', 'var(--kp-woodE)', 2) + '/>' +
        '<rect x="' + (tx0 + tw - 24) + '" y="' + (ty + 16) + '" width="12" height="' + (gy - ty - 16) + '"' + st('var(--kp-wood)', 'var(--kp-woodE)', 2) + '/>';
      if (pos === 'above') s += item(cx, 92) + '<path d="M' + (cx - 26) + ',112h52"' + st('none', 'var(--kp-muted)', 2, 'stroke-dasharray:4 5;stroke-linecap:round') + '/>';
      else if (pos === 'on') s += item(cx, ty);
      else if (pos === 'under' || pos === 'below') s += item(cx, gy);
      else if (pos === 'left') s += item(tx0 - 62, gy);
      else s += item(tx0 + tw + 62, gy);
    } else {
      var bx = 150, bw = 130, bh = 104, by = gy - bh, d = 28, open = pos === 'in';
      var front = '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '"' + st('var(--kp-tan)', 'var(--kp-tanE)', 2) + '/>';
      var side = poly([[bx + bw, by], [bx + bw + d, by - d], [bx + bw + d, by + bh - d], [bx + bw, by + bh]], st('var(--kp-tan)', 'var(--kp-tanE)', 2, 'stroke-linejoin:round')) + poly([[bx + bw, by], [bx + bw + d, by - d], [bx + bw + d, by + bh - d], [bx + bw, by + bh]], st('#000', 'none', 0, 'opacity:.12'));
      var top = poly([[bx, by], [bx + d, by - d], [bx + bw + d, by - d], [bx + bw, by]], st(open ? 'var(--kp-woodE)' : 'var(--kp-tan)', 'var(--kp-tanE)', 2, 'stroke-linejoin:round')) + (open ? '' : poly([[bx, by], [bx + d, by - d], [bx + bw + d, by - d], [bx + bw, by]], st('#fff', 'none', 0, 'opacity:.3')));
      var box = side + top + front, cxb = bx + bw / 2 + d / 2;
      if (pos === 'in') s += side + top + item(cxb, by + 24, 0.8) + front;
      else if (pos === 'behind') s += item(bx + bw + d - 8, by + 4, 0.95) + box;
      else if (pos === 'front') s += box + item(bx + bw * 0.4, gy + 18, 1.05);
      else if (pos === 'on') s += box + item(cxb, by - d / 2);
      else if (pos === 'above') s += box + item(cxb, by - d - 50) + '<path d="M' + (cxb - 26) + ',' + (by - d - 26) + 'h52"' + st('none', 'var(--kp-muted)', 2, 'stroke-dasharray:4 5;stroke-linecap:round') + '/>';
      else if (pos === 'left') s += box + item(bx - 58, gy);
      else s += box + item(bx + bw + d + 58, gy);
    }
    return { w: W, h: H, svg: s, zoom: 1.3, label: 'A ' + thing + ' and a ' + ref };
  }

  /* ---------------------------------------------------------------- kind: shapes (flat and solid) */
  function regular(n, R, start) { var p = []; for (var i = 0; i < n; i++) { var a = start + i * 2 * PI / n; p.push([R * M.cos(a), R * M.sin(a)]); } return p; }
  var FLAT = {
    square: [[-.78, -.78], [.78, -.78], [.78, .78], [-.78, .78]],
    rectangle: [[-1, -.56], [1, -.56], [1, .56], [-1, .56]],
    'rectangle-tall': [[-.5, -.95], [.5, -.95], [.5, .95], [-.5, .95]],
    triangle: [[0, -.95], [.92, .65], [-.92, .65]],
    'triangle-right': [[-.85, -.8], [.85, .7], [-.85, .7]],
    'triangle-skinny': [[0, -1], [.36, .9], [-.36, .9]],
    'triangle-wide': [[-1, .45], [1, .45], [.25, -.5]],
    'triangle-obtuse': [[-1, .5], [.3, .5], [1, -.55]],
    hexagon: regular(6, .95, 0), pentagon: regular(5, .95, -PI / 2), octagon: regular(8, .95, PI / 8),
    rhombus: [[0, -1], [.62, 0], [0, 1], [-.62, 0]],
    trapezoid: [[-1, .55], [1, .55], [.5, -.55], [-.5, -.55]]
  };
  var PATHS = {
    circle: 'M-.9,0A.9,.9 0 1 0 .9,0A.9,.9 0 1 0 -.9,0Z', oval: 'M-1,0A1,.58 0 1 0 1,0A1,.58 0 1 0 -1,0Z',
    halfcircle: 'M-1,.45A1,1 0 0 1 1,.45Z', quartercircle: 'M-.7,.7V-1.1A1.8,1.8 0 0 1 1.1,.7Z',
    'open-triangle': 'M-.2,-.66L0,-.95L.92,.65L-.92,.65L-.42,-.22', 'curvy-triangle': 'M0,-.95Q.95,-.1 .92,.65L-.92,.65Z',
    'open-square': 'M-.3,-.78H.78V.78H-.78V-.2'
  };
  function shapeSvg(it, S, c) {
    var sw = 2.6 / S, s = it.s || 'square', fill = c[0], edge = c[1];
    if (it.parts) {
      return it.parts.map(function (p, i) {
        var cc = i % 2 ? (it.color2 ? cp(it.color2) : c) : c;
        if (Array.isArray(p)) return poly(p, st(cc[0], 'var(--kp-ink)', sw, 'stroke-linejoin:round'));
        return '<path d="' + esc(p.path) + '"' + st(cc[0], 'var(--kp-ink)', sw, 'stroke-linejoin:round') + '/>';
      }).join('');
    }
    if (FLAT[s]) {
      var out = poly(FLAT[s], st(fill, edge, sw, 'stroke-linejoin:round'));
      if (it.corners) FLAT[s].forEach(function (p) { out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r1(5.5 / S * 100) / 100 + '"' + st('var(--kp-gold)', 'var(--kp-card)', 1.5 / S) + '/>'; });
      return out;
    }
    if (PATHS[s]) return '<path d="' + PATHS[s] + '"' + st(/^open/.test(s) ? 'none' : fill, edge, sw, 'stroke-linejoin:round;stroke-linecap:round') + '/>';
    // solids: a light top, the main face, a darker side
    var dark = '#000', top = '#fff';
    function face(pts, k, op) { return poly(pts, st(fill, edge, sw, 'stroke-linejoin:round')) + (k ? poly(pts, st(k, 'none', 0, 'opacity:' + op)) : ''); }
    if (s === 'cube' || s === 'box') {
      var w = s === 'cube' ? 1.1 : 1.5, h = s === 'cube' ? 1.1 : .85, d = .5, x0 = -(w + d) / 2, y0 = -(h - d) / 2 + .05;
      return face([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]) + face([[x0, y0], [x0 + d, y0 - d], [x0 + w + d, y0 - d], [x0 + w, y0]], top, .35) + face([[x0 + w, y0], [x0 + w + d, y0 - d], [x0 + w + d, y0 + h - d], [x0 + w, y0 + h]], dark, .2);
    }
    if (s === 'cylinder') return '<path d="M-.7,-.65V.65A.7,.25 0 0 0 .7,.65V-.65Z"' + st(fill, edge, sw) + '/>' + '<path d="M.25,-.65V.65A.7,.25 0 0 0 .7,.65V-.65Z"' + st(dark, 'none', 0, 'opacity:.14') + '/>' +
      '<ellipse cx="0" cy="-.65" rx=".7" ry=".25"' + st(fill, edge, sw) + '/><ellipse cx="0" cy="-.65" rx=".7" ry=".25"' + st(top, 'none', 0, 'opacity:.35') + '/>';
    if (s === 'cone') return '<path d="M0,-1L.75,.62A.75,.27 0 0 1 -.75,.62Z"' + st(fill, edge, sw, 'stroke-linejoin:round') + '/>' + '<path d="M0,-1L.75,.62A.75,.27 0 0 1 .3,.87Z"' + st(dark, 'none', 0, 'opacity:.14') + '/>' +
      '<path d="M-.75,.62A.75,.27 0 0 1 .75,.62"' + st('none', edge, sw, 'stroke-dasharray:' + r1(5 / S * 100) / 100 + ' ' + r1(5 / S * 100) / 100 + ';opacity:.6') + '/>';
    if (s === 'sphere') return '<circle r=".88"' + st(fill, edge, sw) + '/>' + '<path d="M.88,0A.88,.88 0 0 1 -.62,.62A.95,.95 0 0 0 .88,0Z"' + st(dark, 'none', 0, 'opacity:.12') + '/>' + '<ellipse cx="-.3" cy="-.35" rx=".24" ry=".17"' + st(top, 'none', 0, 'opacity:.55') + '/>' +
      '<path d="M-.88,0A.88,.28 0 0 0 .88,0"' + st('none', edge, sw * .8, 'opacity:.55') + '/>';
    if (s === 'pyramid') return face([[-.85, .55], [.35, .55], [0, -1]]) + face([[.35, .55], [.85, .2], [0, -1]], dark, .2);
    return '';
  }
  function kShapes(o, avail) {
    var items = o.items || [], cell = +o.cell || (items.length === 1 ? 190 : 140), S = cell * 0.37, lab = items.some(function (it) { return it.name; }) ? 30 : 0;
    var per = M.max(1, M.min(items.length, M.floor((avail + 10) / (cell + 10)) || 1)), rows = M.ceil(items.length / per);
    var W = per * cell + (per - 1) * 10, H = rows * (cell + lab) + (rows - 1) * 8, s = '';
    items.forEach(function (it, i) {
      var row = M.floor(i / per), col = i % per, inRow = M.min(per, items.length - row * per), off = (W - (inRow * cell + (inRow - 1) * 10)) / 2;
      var cx = off + col * (cell + 10) + cell / 2, cy = row * (cell + lab + 8) + cell / 2, sc = S * (+it.scale || 1);
      var c = cp(it.color || 'green');
      s += '<g transform="translate(' + r1(cx) + ' ' + r1(cy) + ') rotate(' + (+it.rot || 0) + ') scale(' + r1(sc * 100) / 100 + ')">' + shapeSvg(it, sc, c) + '</g>';
      if (it.name) s += txt(cx, cy + cell / 2 + 12, it.name, 19, { wt: 800 });
    });
    return { w: W, h: H, svg: s, label: items.length > 1 ? 'Shapes to look at' : 'A shape' };
  }

  /* ---------------------------------------------------------------- kind: split (equal shares) */
  function kSplit(o, avail) {
    var items = o.items || [], cell = 150, lab = items.some(function (it) { return it.name; }) ? 30 : 0;
    var per = M.max(1, M.min(items.length, M.floor((avail + 10) / (cell + 12)) || 1)), rows = M.ceil(items.length / per);
    var W = per * cell + (per - 1) * 12, H = rows * (cell + lab) + (rows - 1) * 8, s = '';
    items.forEach(function (it, idx) {
      var row = M.floor(idx / per), col = idx % per, inRow = M.min(per, items.length - row * per), off = (W - (inRow * cell + (inRow - 1) * 12)) / 2;
      var cx = off + col * (cell + 12) + cell / 2, cy = row * (cell + lab + 8) + cell / 2, R = cell * 0.42, id = 'kpc' + (++uidN);
      var sh = it.s || 'circle', n = it.parts || 2, eq = it.equal !== false, how = it.how || (n === 4 ? 'grid' : 'v'), shade = it.shade == null ? 0 : it.shade;
      var w = sh === 'rect' ? R * 2 : sh === 'square' ? R * 1.6 : R * 2, h = sh === 'rect' ? R * 1.25 : sh === 'square' ? R * 1.6 : R * 2;
      var x0 = cx - w / 2, y0 = cy - h / 2, regs = [], lines = [];
      function vcut(f) { return x0 + w * f; } function hcut(f) { return y0 + h * f; }
      function rect(a, b, c2, d) { return [[a, b], [c2, b], [c2, d], [a, d]]; }
      if (sh === 'circle' && (n === 3 || (n === 4 && how === 'sector')) && eq) {
        for (var k = 0; k < n; k++) { var a1 = -PI / 2 + k * 2 * PI / n, a2 = a1 + 2 * PI / n, pts = [[cx, cy]]; for (var t = 0; t <= 8; t++) { var aa = a1 + (a2 - a1) * t / 8; pts.push([cx + R * 1.6 * M.cos(aa), cy + R * 1.6 * M.sin(aa)]); } regs.push(pts); lines.push([cx, cy, cx + R * M.cos(a1), cy + R * M.sin(a1)]); }
      } else if (n === 2 && how === 'diag' && sh !== 'circle') {
        regs = [[[x0, y0], [x0 + w, y0], [x0, y0 + h]], [[x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]]; lines.push([x0 + w, y0, x0, y0 + h]);
      } else if (n === 4 && how === 'x' && sh !== 'circle') {
        var mx = cx, my = cy; regs = [[[x0, y0], [x0 + w, y0], [mx, my]], [[x0 + w, y0], [x0 + w, y0 + h], [mx, my]], [[x0 + w, y0 + h], [x0, y0 + h], [mx, my]], [[x0, y0 + h], [x0, y0], [mx, my]]];
        lines.push([x0, y0, x0 + w, y0 + h]); lines.push([x0 + w, y0, x0, y0 + h]);
      } else if (n === 4 && how === 'grid') {
        var fx = eq ? 0.5 : 0.36, fy = eq ? 0.5 : 0.62, X = vcut(fx), Y = hcut(fy);
        regs = [rect(x0 - 2, y0 - 2, X, Y), rect(X, y0 - 2, x0 + w + 2, Y), rect(X, Y, x0 + w + 2, y0 + h + 2), rect(x0 - 2, Y, X, y0 + h + 2)];
        lines.push([X, y0 - 2, X, y0 + h + 2]); lines.push([x0 - 2, Y, x0 + w + 2, Y]);
      } else {
        var cuts = [], j; for (j = 1; j < n; j++) cuts.push(eq ? j / n : [0, [0.37], [0.22, 0.55], [0.15, 0.4, 0.72]][n - 1][j - 1]);
        if (!eq && n === 2) cuts = [0.36];
        var edges = [0].concat(cuts).concat([1]);
        for (j = 0; j < n; j++) {
          if (how === 'h') { var ya = hcut(edges[j]), yb = hcut(edges[j + 1]); regs.push(rect(x0 - 2, ya, x0 + w + 2, yb)); if (j) lines.push([x0 - 2, ya, x0 + w + 2, ya]); }
          else { var xa = vcut(edges[j]), xb = vcut(edges[j + 1]); regs.push(rect(xa, y0 - 2, xb, y0 + h + 2)); if (j) lines.push([xa, y0 - 2, xa, y0 + h + 2]); }
        }
      }
      var clip = sh === 'circle' ? '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(R) + '"/>' : '<rect x="' + r1(x0) + '" y="' + r1(y0) + '" width="' + r1(w) + '" height="' + r1(h) + '"/>';
      s += '<defs><clipPath id="' + id + '">' + clip + '</clipPath></defs>';
      s += clip.replace('/>', st('var(--kp-soft)', 'none') + '/>');
      s += '<g clip-path="url(#' + id + ')">';
      regs.forEach(function (rg, i) { if (i < shade) s += poly(rg, st('var(--kp-shade)', 'none')); });
      lines.forEach(function (l) { s += '<path d="M' + r1(l[0]) + ',' + r1(l[1]) + 'L' + r1(l[2]) + ',' + r1(l[3]) + '"' + st('none', 'var(--kp-ink)', 2.6, 'stroke-linecap:round') + '/>'; });
      s += '</g>' + clip.replace('/>', st('none', 'var(--kp-ink)', 3) + '/>');
      if (it.name) s += txt(cx, cy + cell / 2 + 12, it.name, 19, { wt: 800 });
    });
    return { w: W, h: H, svg: s, label: items.length > 1 ? 'Shapes cut into parts' : 'A shape cut into parts' };
  }

  /* ---------------------------------------------------------------- kind: blocks (tens and ones) */
  function blockSet(b, x0, y0, u) {
    var s = '', x = x0, t1 = b.tens | 0, t2 = b.tens2 | 0, o1 = b.ones | 0, o2 = b.ones2 | 0, cT = b.crossT | 0, cO = b.crossO | 0, i, k, nT = t1 + t2, nO = o1 + o2;
    function rod(x, y, col, crossed) {
      var c = cp(col), out = '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + u + '" height="' + (10 * u) + '" rx="2"' + st(c[0], c[1], 1.2) + '/>';
      for (var j = 1; j < 10; j++) out += '<path d="M' + r1(x + 1) + ',' + r1(y + j * u) + 'h' + (u - 2) + '"' + st('none', c[1], .8, 'opacity:.6') + '/>';
      if (crossed) out += '<path d="M' + r1(x - 4) + ',' + r1(y + 10 * u - 6) + 'L' + r1(x + u + 4) + ',' + r1(y + 6) + '"' + st('none', 'var(--kp-ink)', 2.6, 'stroke-linecap:round') + '/>';
      return out;
    }
    for (i = 0; i < nT; i++) { s += rod(x, y0, i < t1 ? 'green' : 'blue', i >= nT - cT); x += u + 7; }
    if (nT && nO) x += 10;
    var cols = M.ceil(nO / 5);
    for (k = 0; k < nO; k++) {
      var cc = M.floor(k / 5), rr = k % 5, ox = x + cc * (u + 5), oy = y0 + 10 * u - (rr + 1) * (u + 3) + 3, c = cp(k < o1 ? 'green' : 'blue');
      s += '<rect x="' + r1(ox) + '" y="' + r1(oy) + '" width="' + u + '" height="' + u + '" rx="2"' + st(c[0], c[1], 1.2) + '/>';
      if (k >= nO - cO) s += '<path d="M' + r1(ox - 2) + ',' + r1(oy + u + 2) + 'L' + r1(ox + u + 2) + ',' + r1(oy - 2) + '"' + st('none', 'var(--kp-ink)', 2.2, 'stroke-linecap:round') + '/>';
    }
    x += cols * (u + 5);
    return { svg: s, w: M.max(x - x0, u) };
  }
  function kBlocks(o) {
    var items = o.items || [o], u = 14, s = '', x = 6, lab = items.some(function (it) { return it.name; }) ? 30 : 0, H = 10 * u + 12 + lab;
    items.forEach(function (it, i) {
      if (i) { s += '<path d="M' + (x + 8) + ',4V' + (10 * u + 8) + '"' + st('none', 'var(--kp-line)', 2) + '/>'; x += 18; }
      var b = blockSet(it, x, 6, u);
      s += b.svg; if (it.name) s += txt(x + b.w / 2, 10 * u + 26, it.name, 18, { wt: 800 });
      x += b.w + 8;
    });
    return { w: x, h: H, svg: s, label: 'Base-ten blocks: tens and ones' };
  }

  /* ---------------------------------------------------------------- kind: chart (a piece of the hundred chart) */
  function kChart(o) {
    var st0 = int(o.start, 1), cols = int(o.cols, 10), rows = int(o.rows, 3), cs = 46, blank = o.blank || [], mark = o.mark || [], ask = o.ask == null ? null : int(o.ask, 0), s = '';
    for (var i = 0; i < rows * cols; i++) {
      var v = st0 + i, x = 4 + (i % cols) * cs, y = 4 + M.floor(i / cols) * cs, isAsk = v === ask, isBlank = blank.indexOf(v) >= 0;
      s += '<rect x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="' + (cs - 3) + '" height="' + (cs - 3) + '" rx="7"' + st(isAsk ? 'var(--kp-goldS)' : mark.indexOf(v) >= 0 ? 'var(--kp-shade)' : isBlank ? 'var(--kp-soft)' : 'var(--kp-card)', isAsk ? 'var(--kp-gold)' : 'var(--kp-line)', isAsk ? 3 : 1.2) + '/>';
      if (isAsk) s += txt(x + cs / 2, y + cs / 2 + 1, '?', 22, { col: 'var(--kp-gold)', wt: 800 });
      else if (!isBlank) s += txt(x + cs / 2, y + cs / 2 + 1, String(v), v >= 100 ? 16 : 19, { wt: 600 });
    }
    return { w: cols * cs + 8, h: rows * cs + 8, svg: s, label: 'Part of a hundred chart' };
  }

  /* ---------------------------------------------------------------- kind: graph (a picture graph) */
  function kGraph(o) {
    var cats = o.cats || [], r = 15, sp = 38, lw = 112, max = 1, s = '';
    cats.forEach(function (c) { max = M.max(max, c.n | 0); });
    var W = lw + max * sp + 16, H = cats.length * 46 + (o.note ? 30 : 0) + 6;
    cats.forEach(function (c, i) {
      var y = 6 + i * 46 + 21;
      s += '<rect x="2" y="' + (y - 21) + '" width="' + (W - 4) + '" height="42" rx="8"' + st(i % 2 ? 'var(--kp-card)' : 'var(--kp-soft)', 'none') + '/>';
      s += txt(12, y, c.name, 16, { anchor: 'start' });
      for (var k = 0; k < (c.n | 0); k++) s += g(lw + k * sp + sp / 2, y, r / 10, objSvg(c.obj || 'dot', c.color));
    });
    s += '<path d="M' + (lw - 6) + ',4V' + (6 + cats.length * 46) + '"' + st('none', 'var(--kp-line)', 2) + '/>';
    if (o.note) s += txt(W / 2, H - 14, o.note, 14, { col: 'var(--kp-muted)', wt: 600 });
    return { w: W, h: H, svg: s, label: 'A picture graph' };
  }

  /* ---------------------------------------------------------------- kind: bond */
  function kBond(o) {
    var W = 320, H = 210, R = 36, wh = o.whole, a = o.a, b = o.b, hide = o.hide, s = '';
    if (b == null && wh != null && a != null) b = wh - a;
    if (a == null && wh != null && b != null) a = wh - b;
    var P = [[W / 2, 48, wh, 'whole', 'var(--kp-greenE)'], [W / 2 - 92, 158, a, 'a', 'var(--kp-redE)'], [W / 2 + 92, 158, b, 'b', 'var(--kp-yellowE)']];
    s += '<path d="M' + W / 2 + ',48L' + (W / 2 - 92) + ',158M' + W / 2 + ',48L' + (W / 2 + 92) + ',158"' + st('none', 'var(--kp-greenE)', 3.5) + '/>';
    P.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + R + '"' + st('var(--kp-card)', p[4], 4) + '/>' + txt(p[0], p[1] + 1, hide === p[3] ? '?' : String(p[2]), 32, { col: hide === p[3] ? 'var(--kp-gold)' : 'var(--kp-ink)', wt: 800 }); });
    return { w: W, h: H, svg: s, label: 'A number bond: a whole and two parts' };
  }

  /* ---------------------------------------------------------------- kind: path (a number path) */
  function kPath(o) {
    var from = int(o.from, 0), to = int(o.to, 10), cs = 44, n = to - from + 1, hide = o.hide || [], mark = o.mark || [], s = '';
    var hops = int(o.hops, 0), dir = o.dir === -1 ? -1 : 1, start = o.start == null ? null : int(o.start, from), top = hops ? 46 : 8;
    for (var i = 0; i < n; i++) {
      var v = from + i, x = 4 + i * cs, y = top, isM = mark.indexOf(v) >= 0 || v === start;
      s += '<rect x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="' + (cs - 3) + '" height="' + (cs - 3) + '" rx="7"' + st(v === start ? 'var(--kp-goldS)' : isM ? 'var(--kp-shade)' : 'var(--kp-card)', v === start ? 'var(--kp-gold)' : 'var(--kp-line)', v === start ? 3 : 1.4) + '/>';
      s += txt(x + cs / 2, y + cs / 2 + 1, hide.indexOf(v) >= 0 ? '?' : String(v), v >= 100 ? 17 : 21, { col: hide.indexOf(v) >= 0 ? 'var(--kp-gold)' : 'var(--kp-ink)', wt: hide.indexOf(v) >= 0 ? 800 : 600 });
    }
    if (hops && start != null) {
      for (var k = 0; k < hops; k++) {
        var a = start + dir * k, b = a + dir, xa = 4 + (a - from) * cs + cs / 2, xb = 4 + (b - from) * cs + cs / 2, mid = (xa + xb) / 2;
        s += '<path d="M' + r1(xa) + ',' + (top - 4) + 'Q' + r1(mid) + ',' + (top - 40) + ' ' + r1(xb) + ',' + (top - 6) + '"' + st('none', 'var(--kp-blueE)', 2.4, 'stroke-linecap:round') + '/>';
        var ang = M.atan2(34, xb - mid);
        s += poly([[xb, top - 4], [xb - 9 * M.cos(ang - 0.45) * (dir), top - 4 - 9 * M.sin(ang - 0.45)], [xb - 9 * M.cos(ang + 0.45) * dir, top - 4 - 9 * M.sin(ang + 0.45)]], st('var(--kp-blueE)', 'none'));
        s += txt(mid, top - 30, String(k + 1), 13, { col: 'var(--kp-blueE)', halo: 1 });
      }
    }
    return { w: n * cs + 8, h: top + cs + 6, svg: s, label: 'A number path' };
  }

  /* ---------------------------------------------------------------- kind: digits */
  function kDigits(o) {
    var items = o.items || [], cw = 96, s = '', lab = items.some(function (it) { return it.name; }) ? 30 : 0;
    items.forEach(function (it, i) {
      var x = 6 + i * (cw + 14);
      s += '<rect x="' + x + '" y="4" width="' + cw + '" height="' + cw + '" rx="12"' + st('var(--kp-soft)', 'var(--kp-line)', 2) + '/>';
      s += '<g transform="translate(' + (x + cw / 2) + ' ' + (4 + cw / 2) + ')' + (it.flip ? ' scale(-1 1)' : '') + '">' + txt(0, 3, String(it.d), 64, { wt: 800 }) + '</g>';
      if (it.name) s += txt(x + cw / 2, cw + 22, it.name, 18, { wt: 800 });
    });
    return { w: items.length * (cw + 14) + 2, h: cw + 8 + lab, svg: s, label: 'Digits' };
  }

  var KINDS = { group: kGroup, lengths: kLengths, heights: kHeights, balance: kBalance, scene: kScene, shapes: kShapes, split: kSplit, blocks: kBlocks, chart: kChart, graph: kGraph, bond: kBond, path: kPath, digits: kDigits };

  /* ---------------------------------------------------------------- the visual */
  function factory(el, o) {
    injectCss();
    o = o || {};
    var kind = KINDS[o.kind] ? o.kind : 'group';
    el.classList.add('kp', 'kp-' + kind, 'ml-notex');
    el.setAttribute('role', 'group');
    el.innerHTML = '';
    if (o.title) { var ti = D.createElement('p'); ti.className = 'kp-title'; ti.textContent = o.title; el.appendChild(ti); }
    var stage = D.createElement('div'); stage.className = 'kp-stage'; el.appendChild(stage);
    var ro = D.createElement('p'); ro.className = 'kp-ro'; ro.setAttribute('aria-live', 'polite'); el.appendChild(ro);
    var ctl = D.createElement('div'); ctl.className = 'kp-ctl'; el.appendChild(ctl);
    var counted = {}, order = 0, lastW = 0, cover = null, timer = 0, focusI = 0, objs = [];
    var canTap = kind === 'group' && o.tap !== false && !o.flash;
    function availW() { var w = stage.clientWidth || el.clientWidth || 600; return M.max(200, w - 12); }
    function render() {
      var av = availW(); lastW = av;
      var R = KINDS[kind](o, av, stage);
      objs = R.objs || [];
      var body = R.svg;
      objs.forEach(function (ob, i) {
        var inner = (ob.ring ? '<circle r="12.6"' + st('var(--kp-goldS)', 'var(--kp-gold)', 1.2) + '/>' : '') + (ob.cross ? '<g style="opacity:.42">' + objSvg(ob.type, ob.col) + '</g>' + CROSS : objSvg(ob.type, ob.col));
        var num = counted[i] || ob.num;
        if (num) inner += '<circle cx="0" cy="0" r="5.6"' + st('var(--kp-greenE)', '#fff', 1) + '/>' + '<text x="0" y=".3" text-anchor="middle" dominant-baseline="central" style="fill:#fff;font-size:' + (num > 9 ? 6 : 7) + 'px;font-weight:800">' + num + '</text>';
        if (canTap) inner += '<circle class="kp-fr" r="12.2"' + st('none', '#b8963e', 1.6) + '/>';
        var lab = canTap ? (ob.type === 'dot' ? 'counter' : ob.type) + (counted[i] ? ', counted: number ' + counted[i] : ', not counted yet') : '';
        body += g(ob.x, ob.y, ob.r / 10, inner, canTap ? ' class="kp-o" data-i="' + i + '" role="button" tabindex="' + (i === focusI ? 0 : -1) + '" aria-label="' + esc(lab) + '"' : '');
      });
      var Wd = M.ceil(R.w), Hd = M.ceil(R.h);
      var label = o.label || R.label;
      var zm = +o.zoom || R.zoom || 1;
      stage.innerHTML = '<svg class="kp-svg" xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ' + (Wd + 4) + ' ' + (Hd + 4) + '" width="' + M.round((Wd + 4) * zm) + '" height="' + M.round((Hd + 4) * zm) + '"' + (canTap ? ' role="group"' : ' role="img"') + ' aria-label="' + esc(label + (canTap ? '. Tap each one to count it.' : '')) + '">' + body + '</svg>';
      if (cover) stage.appendChild(cover);
      if (canTap) bind();
    }
    function bind() {
      var nodes = stage.querySelectorAll('.kp-o');
      [].forEach.call(nodes, function (nd) {
        nd.addEventListener('click', function () { tap(+nd.getAttribute('data-i')); });
        nd.addEventListener('keydown', function (e) {
          var i = +nd.getAttribute('data-i'), k = e.key, j = null;
          if (k === 'Enter' || k === ' ') { e.preventDefault(); tap(i); return; }
          if (k === 'ArrowRight' || k === 'ArrowDown') j = M.min(objs.length - 1, i + 1); else if (k === 'ArrowLeft' || k === 'ArrowUp') j = M.max(0, i - 1); else if (k === 'Home') j = 0; else if (k === 'End') j = objs.length - 1;
          if (j !== null) { e.preventDefault(); focusI = j; render(); var nn = stage.querySelector('.kp-o[data-i="' + j + '"]'); if (nn) nn.focus(); }
        });
      });
    }
    function tap(i) {
      if (counted[i]) return;
      var had = el.contains(D.activeElement);
      counted[i] = ++order; focusI = i; render();
      if (had) { var nn = stage.querySelector('.kp-o[data-i="' + i + '"]'); if (nn) try { nn.focus({ preventScroll: true }); } catch (e) { } }
      say(); restart.hidden = false;
    }
    function say() { ro.innerHTML = order ? 'You counted <b>' + order + '</b>' + (order === objs.length ? '. That is all of them.' : ' so far.') : (canTap && objs.length ? 'Tap each one as you count it.' : ''); }
    var restart = D.createElement('button'); restart.type = 'button'; restart.className = 'kp-btn'; restart.textContent = 'Start over'; restart.hidden = true;
    restart.addEventListener('click', function () { counted = {}; order = 0; render(); say(); restart.hidden = true; });
    if (canTap) ctl.appendChild(restart);
    if (o.flash) {
      cover = D.createElement('div'); cover.className = 'kp-cover'; cover.textContent = '?'; cover.hidden = true; cover.setAttribute('aria-hidden', 'true');
      var again = D.createElement('button'); again.type = 'button'; again.className = 'kp-btn'; again.textContent = 'Look again'; again.hidden = true; ctl.appendChild(again);
      var look = function () { cover.hidden = true; W.clearTimeout(timer); timer = W.setTimeout(function () { cover.hidden = false; again.hidden = false; ro.textContent = 'How many did you see?'; }, M.max(400, +o.flash)); };
      again.addEventListener('click', look);
      W.setTimeout(look, 30);
    }
    render(); say();
    if (canTap && objs.length) ro.textContent = 'Tap each one as you count it.';
    var rs = function () { var w = availW(); if (M.abs(w - lastW) > 8) render(); };
    if ('ResizeObserver' in W) new ResizeObserver(rs).observe(stage); else W.addEventListener('resize', rs);
    return { destroy: function () { W.clearTimeout(timer); } };
  }

  try { injectCss(); } catch (e) { }
  function boot() { if (ML.viz && ML.viz.register) { ML.viz.register('g1-pic', factory); return true; } return false; }
  if (!boot()) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else W.setTimeout(boot, 0); }
  ML.__kpic = ML.__kpic || {}; ML.__kpic[NAME] = { kinds: Object.keys(KINDS), objs: Object.keys(OBJ) };
})(window, document);
