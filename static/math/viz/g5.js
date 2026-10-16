/* Math Ladder: extra visuals for Grade 5 (static/math/viz/g5.js). Built on the toolkit in viz/core.js
   (window.MathLadder.viz); looks like the shared visuals in basic.js and injects its own few CSS rules.
   Every visual takes the common options: label (aria-label), title (a heading above), controls: false (hide buttons),
   quiet: true (no text under the picture: use it inside a problem so the picture does not give the answer away).

   g5-fracarea   Multiplying fractions (and tenths × tenths) as an area: a unit square cut into columns and rows.
                 a × b means "a of b": first b of the square is shaded (columns, labeled on top), then a of that
                 part (rows, labeled at the left). The double-shaded overlap is the product.
     opts:  a: "2/3", b: "3/4"   the factors (fractions as written: "2/4" keeps fourths; decimals "0.3" mean tenths;
                                 mixed "1 1/2" and improper "3/2" draw more than one whole square)
            dec: false           label everything as decimals (0.3 × 0.2 = 0.06)
            steps: true          "Next step" / "Back" walk through: the whole, b of it, a of that part, count
            edit: false          −/+ steppers for both numerators and denominators (a free-play model)
            tiles: false         area language instead of "of": a rectangle a by b tiled with 1/d by 1/d' tiles
            unit: ""             a length unit for tiles mode ("ft" gives "square ft")

   g5-factortree  A factor tree. Tap a number that is not prime (or use its "Split" button) and choose a factor pair.
                 The tree is finished only when every branch ends in a prime (primes are circled in green).
     opts:  n: 60               the number (4 to 9999)
            first: [6, 10]      the first split (optional)
            auto: false         true draws the whole tree at once (first split, then smallest-prime splits)

   g5-lineplot   A line plot of fraction measurements with X marks and fraction labels (1/8, 1/4, 3/8 …).
     opts:  data: ["1/8", "1/4", "1/4", "3/8"]   the values
            min: "0", max: "1", step: "1/8"     the scale (labels in lowest terms; mixed numbers above 1)
            label: "Length (inches)"           what the numbers measure
            total: true          a "Find the total" button that adds the marks column by column
            tap: true            tap a column (or use its button) to see how many marks it has and their sum

   g5-prisms     Rectangular prisms built from unit cubes, alone or joined (composite figures), drawn in 3D.
     opts:  boxes: [{at: [0, 0, 0], size: [5, 3, 2], color: "blue", name: "A", show: "lwh", pull: [0, 0, 2]}]
                                 at = corner, size = [length (x), width (y), height (z)]; show = which edges get a label (l, w, h on
                                 the bottom and left edges; L, W on the top edges; H on the right edge);
                                 pull = how far "Pull apart" moves the box (default: up 2 if it sits on another box,
                                 otherwise to the right)
            unit: "cm"           the unit written on the edge labels ("" for unit cubes)
            cubes: true          draw each unit cube (false: plain faces)
            sums: false          the readout lists each box's volume and the total (lessons, not problems)
            labels: [{at: [0, 3, 2.5], text: "5 cm", al: "right"}]   extra labels at points (al: left, right, center)
            pull: true           a "Pull apart" button when there is more than one box

   g5-shapetree  The family tree of quadrilaterals (or of triangles by sides). Tap a shape (or its button) to light up
                 every family it belongs to and list the properties it inherits from each.
     opts:  family: "quad"       "quad" or "tri"
            kite: true           include kites (a rhombus is a kite too)
            trapezoid: "inclusive"   "inclusive" (at least one pair of parallel sides) or "exclusive" (exactly one
                                 pair: then a parallelogram is not a trapezoid)
            pick: "square"       the shape selected at the start (optional)

   g5-grid       The first quadrant of the coordinate plane with labeled axes.
     opts:  xmax: 10, ymax: 10   the largest numbers on the axes; xstep: 1, ystep: 1 the scales
            xlabel: "x", ylabel: "y"   axis names (e.g. "Hours", "Dollars")
            points: [{x: 2, y: 5, label: "A", color: "blue"}]   (or [[2, 5, "A"]])
            line: false          join the points in order (for patterns)
            coords: false        write each point's coordinates beside it
            drag: false          true: one red point to drag (or move with the arrow keys); drag: [3, 4] sets its start
            walk: false          a "Show the path" button: from (0, 0) go across x, then up y
            task: {x: 2, y: 5}   "Put the point at (2, 5)." (needs drag)                                                */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math, TAU = 2 * M.PI;
  var V = null, defs = [];
  function def(name, fn) { defs.push([name, fn]); }

  /* ---------------------------------------------------------------- styles */
  var CSS = '.g5v .g5v-ro{margin:.55rem .1rem 0;font-size:.95rem;line-height:1.55;overflow-wrap:anywhere;min-height:1.2em}' +
    '.g5v .g5v-ro:empty{display:none}.g5v .g5v-row{display:flex;flex-wrap:wrap;gap:.4rem .5rem;align-items:center;width:100%}' +
    '.g5v .g5v-row:empty{display:none}.g5v .g5v-title{margin:0 0 .5rem;font:700 1.02rem/1.3 Georgia,serif}' +
    '.g5v .g5v-lab{font-size:.85rem;color:var(--mv-muted)}.g5v .ml-btn[aria-pressed="true"]{box-shadow:inset 0 0 0 2px var(--mv-acc);border-color:var(--mv-acc)}' +
    '.g5v .g5v-step{display:inline-flex;align-items:center;gap:.25rem;padding:.1rem .25rem .1rem .6rem;border:1px solid var(--mv-line);border-radius:999px;background:var(--mv-card)}' +
    '.g5v .g5v-step .ml-btn{min-width:36px;min-height:36px;padding:0;border-radius:50%;font-size:1.05rem}.g5v .g5v-step output{min-width:2.2em;text-align:center;font-weight:700}' +
    '.g5v .ml-btn:disabled{opacity:.42;cursor:default}.g5v .g5v-task{margin:0 0 .6rem;padding:.55rem .8rem;border:1px solid var(--mv-line);border-left:4px solid #b8963e;border-radius:10px;background:var(--mv-card)}' +
    '.g5v .g5v-task p{margin:.1rem 0}.g5v .g5v-ok{color:#1d7a4b;font-weight:600}html[data-theme="dark"] .g5v .g5v-ok{color:#7fd6a6}' +
    '.g5v canvas.ml-cv:focus-visible{outline:3px solid #b8963e;outline-offset:2px}';
  function css() { if (D.getElementById('g5v-css')) return; var s = D.createElement('style'); s.id = 'g5v-css'; s.textContent = CSS; D.head.appendChild(s); }

  /* ---------------------------------------------------------------- numbers */
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function fr(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return { n: n / g, d: d / g, v: n / d }; }
  /* "n/d" kept as written; "0.25" -> 25/100; "1 1/2" -> 3/2; 3 -> 3/1. Returns {n, d, v} (not reduced) */
  function raw(x) {
    var s = String(x == null ? '0' : x).trim().replace(/[−–]/g, '-'), m;
    if ((m = /^(-?)(\d+)\s+(\d+)\/(\d+)$/.exec(s))) { var d = +m[4], n = +m[2] * d + +m[3]; return { n: m[1] ? -n : n, d: d, v: (m[1] ? -n : n) / d }; }
    if ((m = /^(-?\d+)\/(\d+)$/.exec(s))) return { n: +m[1], d: +m[2], v: +m[1] / +m[2] };
    if ((m = /^(-?)(\d*)\.(\d+)$/.exec(s))) { var dd = M.pow(10, m[3].length), nn = +((m[2] || '0') + m[3]); if (m[1]) nn = -nn; return { n: nn, d: dd, v: nn / dd, dec: m[3].length }; }
    var v = +s; return isFinite(v) ? { n: v, d: 1, v: v } : { n: 0, d: 1, v: 0 };
  }
  function fixd(v) { return +(+v).toFixed(10); }
  function decText(v) { var s = String(fixd(v)); return s.replace('-', '−'); }
  function qText(q, form) { // plain text for a reduced fraction
    q = fr(q.n, q.d); if (q.d === 1) return String(q.n).replace('-', '−');
    if (form === 'dec') return decText(q.v);
    if (form === 'mixed' && M.abs(q.n) > q.d) return (q.n < 0 ? '−' : '') + M.floor(M.abs(q.n) / q.d) + ' ' + (M.abs(q.n) % q.d) + '/' + q.d;
    return (q.n < 0 ? '−' : '') + M.abs(q.n) + '/' + q.d;
  }
  function htmlQ(q, form, keep) { // stacked fraction in HTML (typeset as TeX by the readout)
    var r = keep ? q : fr(q.n, q.d);
    if (form === 'dec') return '$' + decText(r.v) + '$';
    if (r.d === 1) return '$' + r.n + '$';
    if (form === 'mixed' && r.n > r.d) return '$' + M.floor(r.n / r.d) + '\\frac{' + (r.n % r.d) + '}{' + r.d + '}$';
    return '$\\frac{' + r.n + '}{' + r.d + '}$';
  }

  /* ---------------------------------------------------------------- drawing */
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function soft(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function C() {
    var c = V.colors(), dk = isDark(); c.dark = dk;
    c.empty = dk ? '#223529' : '#f4f1e8'; c.line = dk ? '#3b5a48' : '#cfd9d2'; c.frame = dk ? '#7fb898' : '#1d5c3c';
    c.colA = dk ? 'rgba(116,192,252,.45)' : 'rgba(28,111,214,.30)'; c.colB = dk ? 'rgba(255,212,121,.45)' : 'rgba(214,160,20,.36)';
    c.both = dk ? 'rgba(108,199,154,.85)' : 'rgba(0,112,60,.62)';
    return c;
  }
  var FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  function font(sz, wt) { return (wt || 400) + ' ' + sz + 'px ' + FONT; }
  function tx(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = font(o.size || 14, o.wt); ctx.fillStyle = o.col || C().ink;
    ctx.textAlign = o.al || 'center'; ctx.textBaseline = o.bl || 'middle';
    if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); x = 0; y = 0; }
    if (o.halo) { ctx.lineWidth = o.haloW || 4; ctx.strokeStyle = o.halo; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillText(s, x, y); ctx.restore();
  }
  function tw(ctx, s, f) { ctx.save(); ctx.font = f; var w = ctx.measureText(s).width; ctx.restore(); return w; }
  /* a stacked fraction (or whole / mixed / decimal) centered at x, y; returns its width */
  function qDraw(ctx, q, x, y, o) {
    o = o || {}; var sz = o.size || 15, col = o.col || C().ink, wt = o.wt || 700, r = o.keep ? q : fr(q.n, q.d);
    if (o.form === 'dec' || r.d === 1) { var s = r.d === 1 ? String(r.n) : decText(r.v); tx(ctx, s, x, y, { size: sz * 1.1, wt: wt, col: col, halo: o.halo }); return tw(ctx, s, font(sz * 1.1, wt)); }
    var whole = '', n = r.n; if (o.form === 'mixed' && r.n > r.d) { whole = String(M.floor(r.n / r.d)); n = r.n % r.d; }
    var f1 = font(sz, wt), w1 = M.max(tw(ctx, String(n), f1), tw(ctx, String(r.d), f1)) + 4, ww = whole ? tw(ctx, whole, font(sz * 1.15, wt)) + 3 : 0, x0 = x - (w1 + ww) / 2;
    if (whole) tx(ctx, whole, x0 + ww / 2 - 1, y, { size: sz * 1.15, wt: wt, col: col, halo: o.halo });
    var cx = x0 + ww + w1 / 2;
    tx(ctx, String(n), cx, y - sz * 0.62, { size: sz, wt: wt, col: col, halo: o.halo });
    tx(ctx, String(r.d), cx, y + sz * 0.66, { size: sz, wt: wt, col: col, halo: o.halo });
    ctx.save(); if (o.halo) { ctx.strokeStyle = o.halo; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - w1 / 2 + 1, y); ctx.lineTo(cx + w1 / 2 - 1, y); ctx.stroke(); }
    ctx.strokeStyle = col; ctx.lineWidth = M.max(1.2, sz / 11); ctx.beginPath(); ctx.moveTo(cx - w1 / 2 + 1, y); ctx.lineTo(cx + w1 / 2 - 1, y); ctx.stroke(); ctx.restore();
    return w1 + ww;
  }
  function ln(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw || 1.5; ctx.lineCap = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  function poly(ctx, pts, fill, stroke, lw) { ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.2; ctx.lineJoin = 'round'; ctx.stroke(); } ctx.restore(); }
  function disc(ctx, x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, M.max(0, r), 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } }
  function rr(ctx, x, y, w, h, r) { r = M.max(0, M.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function arw(ctx, x1, y1, x2, y2, col, lw) {
    var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(10, L * 0.6);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = lw || 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.7 * M.cos(a), y2 - hs * 0.7 * M.sin(a)); ctx.stroke();
    if (L > 4) { ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.42), y2 - hs * M.sin(a - 0.42)); ctx.lineTo(x2 - hs * M.cos(a + 0.42), y2 - hs * M.sin(a + 0.42)); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  /* a bracket from (x1, y) to (x2, y) with end ticks pointing toward the drawing (dir = +1 down, -1 up) */
  function hbracket(ctx, x1, x2, y, dir, col) { ln(ctx, x1, y, x2, y, col, 1.8); ln(ctx, x1, y, x1, y + 6 * dir, col, 1.8); ln(ctx, x2, y, x2, y + 6 * dir, col, 1.8); }
  function vbracket(ctx, y1, y2, x, dir, col) { ln(ctx, x, y1, x, y2, col, 1.8); ln(ctx, x, y1, x + 6 * dir, y1, col, 1.8); ln(ctx, x, y2, x + 6 * dir, y2, col, 1.8); }

  /* ---------------------------------------------------------------- the frame */
  function shell(el, o, name, label, h) {
    css();
    el.classList.add('g5v', 'mlb', 'g5v-' + name, 'ml-notex');
    el.setAttribute('role', 'group');
    var al = el.getAttribute('aria-label'); if (!al || al === name || al === 'A picture for this problem') al = null;
    el.setAttribute('aria-label', o.label || al || label);
    var S = { el: el, o: o };
    if (o.title) { var t = V.el('p', 'g5v-title'); t.textContent = o.title; el.appendChild(t); }
    S.taskBox = V.el('div', 'g5v-task'); S.taskBox.hidden = true; el.appendChild(S.taskBox);
    S.stage = V.el('div', 'mlb-stage'); el.appendChild(S.stage);
    S.co = { height: h || 260 }; S.c = V.canvas(S.stage, S.co); S.ctx = S.c.ctx;
    S.c.cv.setAttribute('role', 'img'); S.c.cv.setAttribute('aria-label', o.label || al || label);
    S.ro = V.el('p', 'g5v-ro'); S.ro.setAttribute('aria-live', 'polite'); el.appendChild(S.ro);
    S.ctl = V.el('div', 'ml-ctl'); el.appendChild(S.ctl);
    if (o.controls === false) S.ctl.hidden = true;
    S.say = function (h2) { if (o.quiet) h2 = ''; if (S._said === h2) return; S._said = h2; S.ro.innerHTML = h2; if (ML.typeset) { try { ML.typeset(S.ro); } catch (e) { } } };
    S.height = function (px) { px = M.round(px); if (S.co.height !== px || S.c.h !== px) { S.co.height = px; S.c.fit(); } };
    S.row = function () { var r = V.el('div', 'g5v-row'); S.ctl.appendChild(r); return r; };
    S.live = function (fn) { S.c.onResize(fn); V.onTheme(fn); };
    S.ro.classList.remove('ml-notex');
    return S;
  }
  function stepper(parent, label, val, lo, hi, change) {
    var w = V.el('div', 'g5v-step'), lab = V.el('span', 'g5v-lab'); lab.textContent = label; w.appendChild(lab);
    var mi = V.button(w, '−', function () { set(val - 1, true); }); mi.setAttribute('aria-label', 'Less: ' + label);
    var out = D.createElement('output'); w.appendChild(out);
    var pl = V.button(w, '+', function () { set(val + 1, true); }); pl.setAttribute('aria-label', 'More: ' + label);
    function set(v, user) { val = M.max(lo, M.min(hi, v)); out.textContent = String(val); mi.disabled = val <= lo; pl.disabled = val >= hi; if (user) change(val); }
    set(val); parent.appendChild(w); return { set: set, get: function () { return val; } };
  }
  function tapOn(cv, fn) {
    var st = null;
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); st = [e.clientX - r.left, e.clientY - r.top]; });
    cv.addEventListener('pointerup', function (e) { if (!st) return; var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (M.hypot(x - st[0], y - st[1]) < 10) fn(x, y); st = null; });
  }

  /* ================================================================ g5-fracarea */
  def('g5-fracarea', function (el, o) {
    var S = shell(el, o, 'fracarea', 'An area model for multiplying fractions', 300);
    var A = raw(o.a != null ? o.a : '2/3'), B = raw(o.b != null ? o.b : '3/4'), dec = !!o.dec, tiles = !!o.tiles;
    if (A.d < 1) A.d = 1; if (B.d < 1) B.d = 1;
    var steps = o.steps !== false && !tiles, step = steps ? 0 : 3, G = {};
    function form() { return dec ? 'dec' : 'frac'; }
    function wholesW() { return o.w || M.max(1, M.ceil(B.v - 1e-9)); }
    function wholesH() { return o.h || M.max(1, M.ceil(A.v - 1e-9)); }
    function geo() {
      var w = S.c.w, Wn = wholesW(), Hn = wholesH(), padL = 64, padR = 18, padT = 54, padB = 30;
      var u = M.min((w - padL - padR) / Wn, (Wn === 1 && Hn === 1 ? 260 : 300) / Hn, 300);
      G = { u: u, Wn: Wn, Hn: Hn, x0: padL + M.max(0, (w - padL - padR - u * Wn) / 2), y0: padT };
      S.height(padT + u * Hn + padB);
    }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), u = G.u, x0 = G.x0, y0 = G.y0, Wn = G.Wn, Hn = G.Hn;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      ctx.fillStyle = k.empty; ctx.fillRect(x0, y0, Wn * u, Hn * u);
      var bw = B.v * u, ah = A.v * u;
      if (step >= 1 && !tiles) { ctx.fillStyle = k.colA; ctx.fillRect(x0, y0, bw, Hn * u); }
      if (step >= 2 && !tiles) { ctx.fillStyle = k.colB; ctx.fillRect(x0, y0, Wn * u, ah); }
      if (step >= 2 || tiles) { ctx.fillStyle = k.both; ctx.fillRect(x0, y0, bw, ah); }
      // cuts: columns (B.d per whole) and rows (A.d per whole)
      var cw = u / B.d, rh = u / A.d, i;
      ctx.save(); ctx.strokeStyle = k.line; ctx.lineWidth = 1;
      ctx.beginPath();
      if (step >= 1 || tiles || !steps) for (i = 1; i < Wn * B.d; i++) { var xx = M.round(x0 + i * cw) + 0.5; ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + Hn * u); }
      if (step >= 2 || tiles || !steps) for (i = 1; i < Hn * A.d; i++) { var yy = M.round(y0 + i * rh) + 0.5; ctx.moveTo(x0, yy); ctx.lineTo(x0 + Wn * u, yy); }
      ctx.stroke(); ctx.restore();
      if (step >= 3 || tiles) { // outline the overlap
        ctx.save(); ctx.strokeStyle = k.dark ? '#e6ece8' : '#0b3d24'; ctx.lineWidth = 3; ctx.strokeRect(x0 + 1.5, y0 + 1.5, bw - 3, ah - 3); ctx.restore();
      }
      // wholes
      ctx.save(); ctx.strokeStyle = k.frame; ctx.lineWidth = 2.5;
      for (var a = 0; a < Wn; a++) for (var b = 0; b < Hn; b++) ctx.strokeRect(x0 + a * u, y0 + b * u, u, u);
      ctx.restore();
      // labels: b on top, a at left, and 1 for each whole along the bottom and right
      var lc = k.dark ? '#74c0fc' : '#1c5fb8', ac = k.dark ? '#ffd479' : '#8a6100';
      if (step >= 1 || tiles) { hbracket(ctx, x0, x0 + bw, y0 - 12, 1, lc); qDraw(ctx, B, x0 + bw / 2, y0 - 34, { size: 15, col: lc, form: form(), keep: true, halo: k.bg }); }
      if (step >= 2 || tiles) { vbracket(ctx, y0, y0 + ah, x0 - 12, 1, ac); qDraw(ctx, A, x0 - 38, y0 + ah / 2, { size: 15, col: ac, form: form(), keep: true, halo: k.bg }); }
      for (a = 0; a < Wn; a++) tx(ctx, '1', x0 + (a + 0.5) * u, y0 + Hn * u + 15, { size: 12, wt: 600, col: k.muted });
      if (Wn > 1 || Hn > 1 || step === 0) for (b = 0; b < Hn; b++) tx(ctx, '1', x0 + Wn * u + 9, y0 + (b + 0.5) * u, { size: 12, wt: 600, col: k.muted });
      say();
    }
    function say() {
      var na = A.n, nb = B.n, N = A.d * B.d, P = { n: na * nb, d: N }, red = fr(P.n, P.d), aT = htmlQ(A, form(), true), bT = htmlQ(B, form(), true);
      var piece = dec ? '$' + decText(1 / N) + '$' : '$\\frac{1}{' + N + '}$', prod = dec ? '$' + decText(red.v) + '$' : '$\\frac{' + P.n + '}{' + N + '}$' + (red.d !== N ? ' $= ' + (red.d === 1 ? red.n : '\\frac{' + red.n + '}{' + red.d + '}') + '$' : '');
      var s;
      if (tiles) {
        var u2 = o.unit ? ' square ' + o.unit : ' square units';
        s = 'Each small tile is $\\frac{1}{' + B.d + '}$ by $\\frac{1}{' + A.d + '}$, and ' + B.d + ' × ' + A.d + ' = ' + N + ' tiles fill one whole square, so each tile has area ' + piece + '.' +
          ' The rectangle is ' + nb + ' tiles across and ' + na + ' tiles down: ' + nb + ' × ' + na + ' = <b>' + P.n + ' tiles</b>. Area = ' + prod + u2 + '.';
      } else if (step === 0) s = 'Start with one whole square' + (G.Wn * G.Hn > 1 ? 's' : '') + '. We will find ' + aT + ' of ' + bT + '.';
      else if (step === 1) s = 'Shade ' + bT + ' of the square: cut it into ' + B.d + ' equal columns and shade ' + nb + '.';
      else if (step === 2) s = 'Now take ' + aT + ' of the shaded part: cut the square into ' + A.d + ' equal rows and shade ' + na + '. The dark green part is ' + aT + ' of ' + bT + '.';
      else s = 'The square is cut into ' + B.d + ' × ' + A.d + ' = ' + N + ' equal pieces, so each piece is ' + piece + '. The dark green overlap is ' + nb + ' × ' + na + ' = ' + P.n + ' pieces: <b>' + aT + ' × ' + bT + ' = ' + prod + '</b>.';
      S.say(s);
    }
    if (steps && o.controls !== false) {
      var row = S.row(), back, next;
      back = V.button(row, 'Back', function () { step = M.max(0, step - 1); upd(); });
      next = V.button(row, 'Next step', function () { step = M.min(3, step + 1); upd(); }, 'pri');
      var upd = function () { back.disabled = step === 0; next.disabled = step === 3; draw(); };
      back.disabled = true;
      if (o.start === 'end') { step = 3; next.disabled = true; back.disabled = false; }
    } else if (steps) step = 3;
    if (o.edit) {
      var r2 = S.row();
      stepper(r2, 'top: parts', B.d, 1, 12, function (v) { B = { n: M.min(B.n, v * wholesW()), d: v, v: 0 }; B.v = B.n / B.d; draw(); });
      stepper(r2, 'shaded', B.n, 1, 12, function (v) { B = { n: v, d: B.d, v: v / B.d }; if (B.v > wholesW() && !o.w) { } draw(); });
      var r3 = S.row();
      stepper(r3, 'side: parts', A.d, 1, 12, function (v) { A = { n: M.min(A.n, v), d: v, v: 0 }; A.v = A.n / A.d; draw(); });
      stepper(r3, 'shaded', A.n, 1, 12, function (v) { A = { n: v, d: A.d, v: v / A.d }; draw(); });
    }
    S.live(draw); draw();
    return { update: function () { draw(); } };
  });

  /* ================================================================ g5-factortree */
  function smallestPrime(n) { for (var p = 2; p * p <= n; p++) if (n % p === 0) return p; return n; }
  function isPrime(n) { return n >= 2 && smallestPrime(n) === n; }
  def('g5-factortree', function (el, o) {
    var S = shell(el, o, 'factortree', 'A factor tree', 260);
    var N = M.max(4, M.min(9999, M.round(+o.n || 60))), root, sel = null, ids = 0, G = {};
    function node(v) { return { v: v, kids: null, id: ++ids }; }
    function reset() { ids = 0; root = node(N); sel = null; if (o.first && o.first.length === 2 && o.first[0] * o.first[1] === N && o.first[0] > 1 && o.first[1] > 1) split(root, o.first[0]); if (o.auto) finish(root); }
    function split(nd, a) { nd.kids = [node(a), node(nd.v / a)]; }
    function finish(nd) { if (nd.kids) { finish(nd.kids[0]); finish(nd.kids[1]); return; } if (!isPrime(nd.v)) { var a = 1; for (var f = 2; f * f <= nd.v; f++) if (nd.v % f === 0) a = f; split(nd, a); finish(nd); } }
    function leaves(nd, out) { out = out || []; if (nd.kids) { leaves(nd.kids[0], out); leaves(nd.kids[1], out); } else out.push(nd); return out; }
    function depth(nd) { return nd.kids ? 1 + M.max(depth(nd.kids[0]), depth(nd.kids[1])) : 0; }
    function layout() {
      var L = leaves(root), w = S.c.w, dp = depth(root), gap = M.min(70, M.max(40, (w - 40) / M.max(1, L.length))), rowH = 62;
      var i = 0; G.nodes = [];
      (function place(nd, d) { if (nd.kids) { place(nd.kids[0], d + 1); place(nd.kids[1], d + 1); nd.x = (nd.kids[0].x + nd.kids[1].x) / 2; } else { nd.x = i++ * gap; } nd.y = 34 + d * rowH; G.nodes.push(nd); })(root, 0);
      var span = (L.length - 1) * gap, off = (w - span) / 2; G.nodes.forEach(function (nd) { nd.x += off; });
      G.r = 19; S.height(34 + dp * rowH + 34);
    }
    function draw() {
      layout(); var ctx = S.ctx, k = C(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      G.nodes.forEach(function (nd) { if (nd.kids) nd.kids.forEach(function (c) { ln(ctx, nd.x, nd.y + G.r - 2, c.x, c.y - G.r + 2, k.muted, 1.8); }); });
      G.nodes.forEach(function (nd) {
        var leaf = !nd.kids, pr = isPrime(nd.v), r = G.r;
        if (sel === nd) disc(ctx, nd.x, nd.y, r + 6, soft(k.gold, 0.35));
        if (leaf && pr) disc(ctx, nd.x, nd.y, r, k.dark ? '#1f4a33' : '#e3f4ea', k.green, 2.5);
        else if (leaf) { disc(ctx, nd.x, nd.y, r, k.dark ? '#3a3320' : '#fff6e0', k.gold, 2); ctx.save(); ctx.setLineDash([4, 3]); disc(ctx, nd.x, nd.y, r + 4, null, k.gold, 1.2); ctx.restore(); }
        else disc(ctx, nd.x, nd.y, r, k.bg, k.line, 1.5);
        var s = String(nd.v); tx(ctx, s, nd.x, nd.y + 1, { size: s.length > 3 ? 13 : 15, wt: 700, col: leaf && pr ? (k.dark ? '#a9f0c8' : '#0b5a33') : k.ink });
      });
      say(); buttons();
    }
    function primesText(L) { return L.map(function (n) { return n.v; }).sort(function (a, b) { return a - b; }).join(' × '); }
    function say() {
      var L = leaves(root), open = L.filter(function (n) { return !isPrime(n.v); });
      if (!root.kids) S.say('Tap ' + N + ' (or press its button) and choose two factors to start the tree.' + (isPrime(N) ? ' ' + N + ' is prime already!' : ''));
      else if (open.length) S.say('So far: ' + N + ' = ' + L.map(function (n) { return n.v; }).join(' × ') + '. ' + open.map(function (n) { return n.v; }).join(' and ') + (open.length > 1 ? ' are' : ' is') + ' not prime yet, so the tree is not finished: split ' + (open.length > 1 ? 'them' : 'it') + ' too.');
      else S.say('Finished: every branch ends in a prime. <b>' + N + ' = ' + primesText(L) + '</b>. Any first split gives these same primes.');
    }
    var rowA, rowB;
    function buttons() {
      if (o.controls === false) return;
      rowA.innerHTML = ''; rowB.innerHTML = '';
      var open = leaves(root).filter(function (n) { return !isPrime(n.v); });
      if (sel && (sel.kids || isPrime(sel.v))) sel = null;
      if (sel) {
        var lab = V.el('span', 'g5v-lab'); lab.textContent = 'Split ' + sel.v + ' into:'; rowA.appendChild(lab);
        for (var a = 2; a * a <= sel.v; a++) if (sel.v % a === 0) (function (a) { V.button(rowA, a + ' × ' + (sel.v / a), function () { split(sel, a); sel = null; draw(); var b = rowA.querySelector('button') || rowB.querySelector('button'); if (b) b.focus(); }, 'pri'); })(a);
      } else open.forEach(function (nd) { V.button(rowA, 'Split ' + nd.v, function () { sel = nd; draw(); var b = rowA.querySelector('button'); if (b) b.focus(); }); });
      if (root.kids) V.button(rowB, 'Start over', function () { o.first = null; o.auto = false; reset(); draw(); });
      if (open.length) V.button(rowB, 'Finish it for me', function () { finish(root); sel = null; draw(); });
    }
    if (o.controls !== false) { rowA = S.row(); rowB = S.row(); }
    tapOn(S.c.cv, function (x, y) { var hit = null; (G.nodes || []).forEach(function (nd) { if (M.hypot(nd.x - x, nd.y - y) < G.r + 8) hit = nd; }); if (hit && !hit.kids && !isPrime(hit.v)) { sel = hit; draw(); } });
    reset(); S.live(draw); draw();
  });

  /* ================================================================ g5-lineplot */
  def('g5-lineplot', function (el, o) {
    var S = shell(el, o, 'lineplot', 'A line plot', 220);
    var data = (o.data || ['1/8', '1/4', '1/4', '3/8', '1/2', '1/2', '1/2', '5/8']).map(raw);
    var mn = raw(o.min != null ? o.min : 0), mx = raw(o.max != null ? o.max : 1), st = raw(o.step != null ? o.step : '1/8');
    var den = st.d * (st.n === 0 ? 1 : 1), unitDen = M.round(1 / st.v * 1) ? 0 : 0;
    var nTicks = M.round((mx.v - mn.v) / st.v), ticks = [], counts = [], pick = -1, showTot = false, G = {};
    for (var i = 0; i <= nTicks; i++) { var tv = { n: mn.n * st.d * 1, d: 1 }; ticks.push(fr(mn.n * st.d + i * st.n * mn.d, mn.d * st.d)); counts.push(0); }
    data.forEach(function (q) { var j = M.round((q.v - mn.v) / st.v); if (j >= 0 && j <= nTicks) counts[j]++; });
    var mixed = mx.v > 1;
    void den; void unitDen;
    function geo() { var w = S.c.w, maxc = M.max.apply(null, counts.concat([1])); G.x0 = 30; G.x1 = w - 30; G.dx = (G.x1 - G.x0) / M.max(1, nTicks); G.m = M.min(15, G.dx * 0.42); G.ay = 26 + maxc * (G.m * 2 + 4) + 8; S.height(G.ay + (o.label ? 66 : 48)); }
    function X(j) { return G.x0 + j * G.dx; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), y = G.ay; ctx.clearRect(0, 0, S.c.w, S.c.h);
      if (pick >= 0) { ctx.save(); ctx.fillStyle = soft(k.gold, 0.18); rr(ctx, X(pick) - G.dx / 2 + 3, 6, G.dx - 6, y - 4, 8); ctx.fill(); ctx.restore(); }
      ln(ctx, G.x0 - 14, y, G.x1 + 14, y, k.ink, 2);
      var every = G.dx < 26 ? 2 : 1;
      ticks.forEach(function (q, j) {
        ln(ctx, X(j), y - 6, X(j), y + 6, k.ink, 1.5);
        if (j % every === 0 || j === nTicks) qDraw(ctx, q, X(j), y + 25, { size: 12, col: k.muted, wt: 600, form: mixed ? 'mixed' : 'frac' });
        for (var c = 0; c < counts[j]; c++) {
          var cy = y - 10 - G.m - c * (G.m * 2 + 4), s = G.m * 0.78, col = pick === j ? (k.dark ? '#ffd479' : '#a86f00') : k.blue;
          ln(ctx, X(j) - s, cy - s, X(j) + s, cy + s, col, 3); ln(ctx, X(j) - s, cy + s, X(j) + s, cy - s, col, 3);
        }
      });
      if (o.label) tx(ctx, o.label, (G.x0 + G.x1) / 2, y + 52, { size: 12.5, wt: 600, col: k.muted });
      say();
    }
    function sumOf(j) { return fr(ticks[j].n * counts[j], ticks[j].d); }
    function say() {
      var s = data.length + ' measurement' + (data.length === 1 ? '' : 's') + '.';
      if (pick >= 0) { var c = counts[pick], q = ticks[pick]; s = c + ' mark' + (c === 1 ? '' : 's') + ' at ' + htmlQ(q, mixed ? 'mixed' : '') + (c > 1 ? ': ' + c + ' × ' + htmlQ(q) + ' = ' + htmlQ(sumOf(pick), 'mixed') : '') + '.'; }
      if (showTot) {
        var parts = [], tot = { n: 0, d: 1 };
        ticks.forEach(function (q, j) { if (!counts[j]) return; parts.push((counts[j] > 1 ? counts[j] + ' \\times ' : '') + (q.d === 1 ? q.n : '\\frac{' + q.n + '}{' + q.d + '}')); tot = fr(tot.n * q.d + q.n * counts[j] * tot.d, tot.d * q.d); });
        s += ' Total: $' + parts.join(' + ') + ' = ' + (tot.d === 1 ? tot.n : (tot.n > tot.d ? M.floor(tot.n / tot.d) : '') + '\\frac{' + (tot.n > tot.d ? tot.n % tot.d : tot.n) + '}{' + tot.d + '}') + '$.';
      }
      S.say(s);
    }
    if (o.controls !== false) {
      var row = S.row();
      if (o.total !== false) var tb = V.button(row, 'Find the total', function () { showTot = !showTot; tb.setAttribute('aria-pressed', String(showTot)); draw(); });
      if (o.tap !== false) {
        var r2 = S.row(), lab = V.el('span', 'g5v-lab'); lab.textContent = 'Look at:'; r2.appendChild(lab);
        ticks.forEach(function (q, j) { if (!counts[j]) return; var b = V.button(r2, qText(q, mixed ? 'mixed' : ''), function () { pick = pick === j ? -1 : j; r2.querySelectorAll('button').forEach(function (bb) { bb.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', String(pick === j)); draw(); }); b.setAttribute('aria-pressed', 'false'); });
      }
    }
    if (o.tap !== false) tapOn(S.c.cv, function (x) { var j = M.round((x - G.x0) / G.dx); if (j >= 0 && j <= nTicks && counts[j]) { pick = pick === j ? -1 : j; draw(); } });
    S.live(draw); draw();
  });

  /* ================================================================ g5-prisms */
  var BOXCOL = { blue: ['#9cc3f0', '#5d93d6', '#3f74b8'], green: ['#9ad9b4', '#5fb98a', '#3f936a'], gold: ['#f5d98a', '#d9b44e', '#b48e2c'], purple: ['#c9b8f5', '#9d86e0', '#7a62bf'], orange: ['#f8c39a', '#e8955a', '#c4733c'], teal: ['#98dbe4', '#55b8c6', '#368f9c'] };
  var BOXCOLD = { blue: ['#5c8fc8', '#3f6fa3', '#2e5582'], green: ['#4f9c76', '#3a7c5b', '#2b5f45'], gold: ['#b89a4a', '#937934', '#735e25'], purple: ['#8b78c8', '#6d5ba6', '#544586'], orange: ['#c88654', '#a5683c', '#82502c'], teal: ['#4fa3ae', '#3a838d', '#2b656d'] };
  def('g5-prisms', function (el, o) {
    var S = shell(el, o, 'prisms', 'Rectangular prisms made of unit cubes', 280);
    var names = ['blue', 'gold', 'green', 'purple', 'orange', 'teal'];
    var boxes = (o.boxes || [{ at: [0, 0, 0], size: [4, 3, 2] }]).map(function (b, i) {
      var at = b.at || [0, 0, 0], sz = b.size || [1, 1, 1];
      return { at: at.map(Number), size: sz.map(function (v) { return M.max(1, M.round(+v)); }), col: names.indexOf(b.color) >= 0 ? b.color : names[i % names.length], name: b.name || String.fromCharCode(65 + i), show: b.show != null ? b.show : 'lwh', pull: b.pull };
    });
    boxes.forEach(function (b) { if (!b.pull) b.pull = b.at[2] > 0 ? [0, 0, 2] : (b.at[0] > 0 ? [2, 0, 0] : b.at[1] > 0 ? [0, 2, 0] : [0, 0, 0]); });
    var apart = 0, unit = o.unit != null ? String(o.unit) : '', G = {}, anim = null;
    var c30 = M.cos(M.PI / 6), s30 = 0.5;
    function P(x, y, z) { return [(x - y) * c30, (x + y) * s30 - z]; }
    function pos(b) { return [b.at[0] + b.pull[0] * apart, b.at[1] + b.pull[1] * apart, b.at[2] + b.pull[2] * apart]; }
    function geo() {
      var xs = [], ys = [];
      boxes.forEach(function (b) { [0, 1].forEach(function (pa) { var p = pa ? [b.at[0] + b.pull[0], b.at[1] + b.pull[1], b.at[2] + b.pull[2]] : b.at; [0, 1].forEach(function (i) { [0, 1].forEach(function (j) { [0, 1].forEach(function (kk) { var q = P(p[0] + i * b.size[0], p[1] + j * b.size[1], p[2] + kk * b.size[2]); xs.push(q[0]); ys.push(q[1]); }); }); }); }); });
      var minx = M.min.apply(null, xs), maxx = M.max.apply(null, xs), miny = M.min.apply(null, ys), maxy = M.max.apply(null, ys);
      var w = S.c.w, pad = 46, s = M.min((w - 2 * pad - 20) / (maxx - minx || 1), 300 / (maxy - miny || 1), 46);
      G.s = s; G.ox = (w - (maxx - minx) * s) / 2 - minx * s; G.oy = 30 - miny * s; S.height((maxy - miny) * s + 70);
    }
    function scr(x, y, z) { var p = P(x, y, z); return [G.ox + p[0] * G.s, G.oy + p[1] * G.s]; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), pal = k.dark ? BOXCOLD : BOXCOL, edge = k.dark ? 'rgba(10,20,14,.55)' : 'rgba(20,40,30,.45)';
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      var cubes = [];
      boxes.forEach(function (b, bi) { var p = pos(b); for (var x = 0; x < b.size[0]; x++) for (var y = 0; y < b.size[1]; y++) for (var z = 0; z < b.size[2]; z++) cubes.push([p[0] + x, p[1] + y, p[2] + z, bi]); });
      cubes.sort(function (a, b) { return (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]) || a[2] - b[2]; });
      var cubesOn = o.cubes !== false;
      cubes.forEach(function (c) {
        var x = c[0], y = c[1], z = c[2], cl = pal[boxes[c[3]].col];
        var top = [scr(x, y, z + 1), scr(x + 1, y, z + 1), scr(x + 1, y + 1, z + 1), scr(x, y + 1, z + 1)];
        var right = [scr(x + 1, y, z), scr(x + 1, y + 1, z), scr(x + 1, y + 1, z + 1), scr(x + 1, y, z + 1)];
        var left = [scr(x, y + 1, z), scr(x + 1, y + 1, z), scr(x + 1, y + 1, z + 1), scr(x, y + 1, z + 1)];
        var e = cubesOn ? edge : null;
        poly(ctx, top, cl[0], e || cl[0], 1); poly(ctx, left, cl[1], e || cl[1], 1); poly(ctx, right, cl[2], e || cl[2], 1);
      });
      // box outlines (visible edges) and labels
      boxes.forEach(function (b) {
        var p = pos(b), L = b.size[0], Wd = b.size[1], H = b.size[2], x = p[0], y = p[1], z = p[2], oc = k.dark ? '#dfe9e3' : '#173a28';
        [[[x, y + Wd, z], [x + L, y + Wd, z]], [[x + L, y, z], [x + L, y + Wd, z]], [[x + L, y + Wd, z], [x + L, y + Wd, z + H]], [[x, y + Wd, z], [x, y + Wd, z + H]], [[x + L, y, z], [x + L, y, z + H]],
          [[x, y, z + H], [x + L, y, z + H]], [[x, y, z + H], [x, y + Wd, z + H]], [[x + L, y, z + H], [x + L, y + Wd, z + H]], [[x, y + Wd, z + H], [x + L, y + Wd, z + H]]].forEach(function (sg) { var a = scr.apply(null, sg[0]), c = scr.apply(null, sg[1]); ln(ctx, a[0], a[1], c[0], c[1], oc, 1.8); });
        var lab = function (v) { return v + (unit ? ' ' + unit : ''); }, lc = k.ink, halo = k.bg;
        if (b.show.indexOf('l') >= 0) { var a1 = scr(x + L / 2, y + Wd, z); tx(ctx, lab(L), a1[0] - 14, a1[1] + 16, { size: 13.5, wt: 700, col: lc, halo: halo, haloW: 5 }); }
        if (b.show.indexOf('w') >= 0) { var a2 = scr(x + L, y + Wd / 2, z); tx(ctx, lab(Wd), a2[0] + 16, a2[1] + 14, { size: 13.5, wt: 700, col: lc, halo: halo, haloW: 5, al: 'left' }); }
        if (b.show.indexOf('h') >= 0) { var a3 = scr(x, y + Wd, z + H / 2); tx(ctx, lab(H), a3[0] - 10, a3[1], { size: 13.5, wt: 700, col: lc, halo: halo, haloW: 5, al: 'right' }); }
        if (b.show.indexOf('L') >= 0) { var a4 = scr(x + L / 2, y, z + H); tx(ctx, lab(L), a4[0] + 12, a4[1] - 14, { size: 13.5, wt: 700, col: lc, halo: halo, haloW: 5 }); }
        if (b.show.indexOf('W') >= 0) { var a5 = scr(x, y + Wd / 2, z + H); tx(ctx, lab(Wd), a5[0] - 12, a5[1] - 12, { size: 13.5, wt: 700, col: lc, halo: halo, haloW: 5, al: 'right' }); }
        if (b.show.indexOf('H') >= 0) { var a6 = scr(x + L, y, z + H / 2); tx(ctx, lab(H), a6[0] + 10, a6[1], { size: 13.5, wt: 700, col: lc, halo: halo, haloW: 5, al: 'left' }); }
      });
      (o.labels || []).forEach(function (L) { var a = scr(+L.at[0], +L.at[1], +L.at[2]); tx(ctx, String(L.text), a[0] + (L.al === 'right' ? -10 : L.al === 'left' ? 10 : 0), a[1], { size: 13.5, wt: 700, col: k.ink, halo: k.bg, haloW: 5, al: L.al || 'center' }); });
      say();
    }
    function vol(b) { return b.size[0] * b.size[1] * b.size[2]; }
    function say() {
      if (!o.sums) { S.say(''); return; }
      var u3 = unit ? ' cubic ' + unit : ' cubic units', tot = 0, parts = boxes.map(function (b) { tot += vol(b); return (boxes.length > 1 ? 'Prism ' + b.name + ': ' : '') + b.size.join(' × ') + ' = ' + vol(b); });
      S.say(parts.join('. ') + (boxes.length > 1 ? '. Together: ' + boxes.map(vol).join(' + ') + ' = <b>' + tot + u3 + '</b>.' : u3 + '.'));
    }
    function animate(to) {
      if (anim) cancelAnimationFrame(anim); var from = apart, t0 = null;
      if (V.reduced) { apart = to; draw(); return; }
      function fr2(t) { if (!t0) t0 = t; var p = M.min(1, (t - t0) / 450), e = p < 0.5 ? 2 * p * p : 1 - M.pow(-2 * p + 2, 2) / 2; apart = from + (to - from) * e; draw(); if (p < 1) anim = requestAnimationFrame(fr2); else anim = null; }
      anim = requestAnimationFrame(fr2);
    }
    if (boxes.length > 1 && o.pull !== false && o.controls !== false) {
      var row = S.row(), pb = V.button(row, 'Pull apart', function () { var on = apart < 0.5; pb.textContent = on ? 'Put together' : 'Pull apart'; pb.setAttribute('aria-pressed', String(on)); animate(on ? 1 : 0); });
      pb.setAttribute('aria-pressed', 'false');
    }
    S.live(draw); draw();
  });

  /* ================================================================ g5-shapetree */
  var QUAD = {
    quad: { name: 'Quadrilateral', has: '4 straight sides and 4 angles', up: [], pts: [[0.1, 0.85], [0.95, 0.75], [0.7, 0.15], [0.2, 0.3]] },
    trap: { name: 'Trapezoid', has: 'at least one pair of parallel sides', up: ['quad'], pts: [[0.05, 0.85], [0.95, 0.85], [0.7, 0.2], [0.3, 0.2]] },
    kite: { name: 'Kite', has: 'two pairs of equal sides that are next to each other', up: ['quad'], pts: [[0.5, 0.05], [0.85, 0.35], [0.5, 0.95], [0.15, 0.35]] },
    para: { name: 'Parallelogram', has: 'two pairs of parallel sides (and opposite sides equal)', up: ['trap'], pts: [[0.05, 0.85], [0.7, 0.85], [0.95, 0.2], [0.3, 0.2]] },
    rect: { name: 'Rectangle', has: '4 right angles', up: ['para'], pts: [[0.05, 0.8], [0.95, 0.8], [0.95, 0.25], [0.05, 0.25]] },
    rhom: { name: 'Rhombus', has: '4 equal sides', up: ['para', 'kite'], pts: [[0.5, 0.05], [0.9, 0.5], [0.5, 0.95], [0.1, 0.5]] },
    sq: { name: 'Square', has: '4 right angles and 4 equal sides', up: ['rect', 'rhom'], pts: [[0.15, 0.85], [0.85, 0.85], [0.85, 0.15], [0.15, 0.15]] }
  };
  var TRI = {
    tri: { name: 'Triangle', has: '3 straight sides and 3 angles', up: [], pts: [[0.1, 0.85], [0.95, 0.8], [0.35, 0.15]] },
    scal: { name: 'Scalene', has: 'no equal sides', up: ['tri'], pts: [[0.05, 0.85], [0.95, 0.85], [0.3, 0.2]] },
    isos: { name: 'Isosceles', has: 'at least two equal sides', up: ['tri'], pts: [[0.2, 0.9], [0.8, 0.9], [0.5, 0.05]] },
    equi: { name: 'Equilateral', has: '3 equal sides (and 3 equal angles)', up: ['isos'], pts: [[0.1, 0.88], [0.9, 0.88], [0.5, 0.19]] }
  };
  def('g5-shapetree', function (el, o) {
    var S = shell(el, o, 'shapetree', 'The family tree of shapes', 420);
    var fam = o.family === 'tri' ? 'tri' : 'quad', T = JSON.parse(JSON.stringify(fam === 'tri' ? TRI : QUAD));
    var excl = o.trapezoid === 'exclusive', kite = fam === 'quad' && o.kite !== false;
    if (fam === 'quad') {
      if (excl) { T.para.up = ['quad']; T.trap.has = 'exactly one pair of parallel sides'; }
      if (!kite) { delete T.kite; T.rhom.up = ['para']; }
    }
    var rows = fam === 'tri' ? [['tri'], ['scal', 'isos'], ['equi']] : (excl ? [['quad'], kite ? ['trap', 'para', 'kite'] : ['trap', 'para'], ['rect', 'rhom'], ['sq']] : [['quad'], kite ? ['trap', 'kite'] : ['trap'], ['para'], ['rect', 'rhom'], ['sq']]);
    if (fam === 'quad' && kite && !excl) rows[1] = ['trap', 'kite'];
    var pick = o.pick && T[{ square: 'sq', rectangle: 'rect', rhombus: 'rhom', parallelogram: 'para', trapezoid: 'trap', kite: 'kite', quadrilateral: 'quad', triangle: 'tri', scalene: 'scal', isosceles: 'isos', equilateral: 'equi' }[o.pick] || o.pick] ? ({ square: 'sq', rectangle: 'rect', rhombus: 'rhom', parallelogram: 'para', trapezoid: 'trap', kite: 'kite', quadrilateral: 'quad', triangle: 'tri', scalene: 'scal', isosceles: 'isos', equilateral: 'equi' }[o.pick] || o.pick) : null;
    var G = {};
    function ancestors(id, out) { out = out || {}; (T[id].up || []).forEach(function (u) { if (!out[u]) { out[u] = 1; ancestors(u, out); } }); return out; }
    function geo() {
      var w = S.c.w, rowH = 96, bw = M.min(124, (w - 24) / 3 - 10), bh = 78;
      G.pos = {}; rows.forEach(function (r, i) { var tot = r.length * bw + (r.length - 1) * 16, x = (w - tot) / 2; r.forEach(function (id, j) { G.pos[id] = { x: x + j * (bw + 16), y: 10 + i * rowH, w: bw, h: bh }; }); });
      if (fam === 'quad' && kite && !excl && G.pos.kite && G.pos.rhom) { // keep the kite above the rhombus side
        G.pos.kite.x = M.max(G.pos.kite.x, G.pos.rhom.x); }
      S.height(10 + rows.length * rowH);
    }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), anc = pick ? ancestors(pick) : {};
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      Object.keys(G.pos).forEach(function (id) { var a = G.pos[id]; (T[id].up || []).forEach(function (u) { var b = G.pos[u]; if (!b) return; var lit = pick && (id === pick || anc[id]) && anc[u]; ln(ctx, a.x + a.w / 2, a.y, b.x + b.w / 2, b.y + b.h, lit ? (k.dark ? '#ffd479' : '#b8860b') : k.line, lit ? 3.5 : 2); }); });
      Object.keys(G.pos).forEach(function (id) {
        var a = G.pos[id], on = id === pick, lit = on || anc[id];
        ctx.save(); rr(ctx, a.x, a.y, a.w, a.h, 10); ctx.fillStyle = on ? (k.dark ? '#3a3320' : '#fff3d6') : lit ? (k.dark ? '#22362b' : '#eef6f0') : k.bg; ctx.fill();
        ctx.strokeStyle = on ? (k.dark ? '#ffd479' : '#b8860b') : lit ? k.green : k.line; ctx.lineWidth = on ? 3 : lit ? 2.2 : 1.2; ctx.stroke(); ctx.restore();
        var sz = 40, sx = a.x + (a.w - sz * 1.3) / 2, sy = a.y + 8;
        poly(ctx, T[id].pts.map(function (p) { return [sx + p[0] * sz * 1.3, sy + p[1] * sz * 0.85]; }), lit ? soft(k.green, 0.25) : soft(k.blue, 0.15), lit ? k.green : k.blue, 2);
        tx(ctx, T[id].name, a.x + a.w / 2, a.y + a.h - 13, { size: a.w < 100 ? 11.5 : 13, wt: 700, col: k.ink });
      });
      say();
    }
    function say() {
      if (!pick) { S.say('Tap a shape to see every family it belongs to.'); return; }
      var anc = ancestors(pick), lvl = {}; rows.forEach(function (r, i) { r.forEach(function (id) { lvl[id] = i; }); });
      var list = Object.keys(anc).sort(function (a, b) { return lvl[b] - lvl[a]; }), nm = T[pick].name.toLowerCase(), art = /^[aeiou]/.test(nm) ? 'An ' : 'A ';
      var s = art + '<b>' + nm + '</b> has ' + T[pick].has + '.';
      if (list.length) s += ' It is also ' + list.map(function (u) { var n2 = T[u].name.toLowerCase(); return (/^[aeiou]/.test(n2) ? 'an ' : 'a ') + n2; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + ', so it has every property they have: ' + list.map(function (u) { return T[u].has; }).join('; ') + '.';
      S.say(s);
    }
    var btns = {};
    if (o.controls !== false) {
      var row = S.row();
      Object.keys(G.pos || T).forEach(function () { });
      rows.forEach(function (r) { r.forEach(function (id) { var b = V.button(row, T[id].name, function () { pick = pick === id ? null : id; Object.keys(btns).forEach(function (x) { btns[x].setAttribute('aria-pressed', String(x === pick)); }); draw(); }); b.setAttribute('aria-pressed', String(id === pick)); btns[id] = b; }); });
    }
    tapOn(S.c.cv, function (x, y) { Object.keys(G.pos).forEach(function (id) { var a = G.pos[id]; if (x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h) { pick = pick === id ? null : id; Object.keys(btns).forEach(function (q) { btns[q].setAttribute('aria-pressed', String(q === pick)); }); draw(); } }); });
    S.live(draw); draw();
  });

  /* ================================================================ g5-grid */
  def('g5-grid', function (el, o) {
    var S = shell(el, o, 'grid', 'A coordinate grid', 320);
    var xmax = +o.xmax || 10, ymax = +o.ymax || 10, xs = +o.xstep || 1, ys = +o.ystep || 1, G = {};
    var pts = (o.points || []).map(function (p, i) { return Array.isArray(p) ? { x: +p[0], y: +p[1], label: p[2] != null ? String(p[2]) : '', color: p[3] } : { x: +p.x, y: +p.y, label: p.label != null ? String(p.label) : '', color: p.color }; });
    var dp = o.drag ? (Array.isArray(o.drag) ? [+o.drag[0], +o.drag[1]] : [0, 0]) : null, walk = 0, walkOn = false, raf = null, TT = o.task && dp ? o.task : null, solved = false;
    function geo() {
      var w = S.c.w, padL = o.ylabel ? 58 : 40, padR = 22, padT = 18, padB = o.xlabel ? 54 : 34, nx = xmax / xs, ny = ymax / ys;
      var cell = M.min((w - padL - padR) / nx, 360 / ny, 44);
      G.cell = cell; G.x0 = padL + M.max(0, (w - padL - padR - cell * nx) / 2); G.y0 = padT + cell * ny; G.nx = nx; G.ny = ny;
      S.height(padT + cell * ny + padB);
    }
    function X(v) { return G.x0 + v / xs * G.cell; }
    function Y(v) { return G.y0 - v / ys * G.cell; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), i; ctx.clearRect(0, 0, S.c.w, S.c.h);
      ctx.fillStyle = k.bg; ctx.fillRect(X(0), Y(ymax), G.cell * G.nx, G.cell * G.ny);
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath();
      for (i = 1; i <= G.nx; i++) { var xx = M.round(X(i * xs)) + 0.5; ctx.moveTo(xx, Y(0)); ctx.lineTo(xx, Y(ymax)); }
      for (i = 1; i <= G.ny; i++) { var yy = M.round(Y(i * ys)) + 0.5; ctx.moveTo(X(0), yy); ctx.lineTo(X(xmax), yy); }
      ctx.stroke(); ctx.restore();
      arw(ctx, X(0), Y(0), X(xmax) + 14, Y(0), k.axis, 2); arw(ctx, X(0), Y(0), X(0), Y(ymax) - 14, k.axis, 2);
      var everyX = G.cell < 22 ? 2 : 1, everyY = G.cell < 18 ? 2 : 1;
      tx(ctx, '0', X(0) - 8, Y(0) + 12, { size: 12, col: k.muted });
      for (i = 1; i <= G.nx; i++) if (i % everyX === 0) tx(ctx, String(+(i * xs).toFixed(6)), X(i * xs), Y(0) + 13, { size: 12, col: k.muted });
      for (i = 1; i <= G.ny; i++) if (i % everyY === 0) tx(ctx, String(+(i * ys).toFixed(6)), X(0) - 7, Y(i * ys), { size: 12, col: k.muted, al: 'right' });
      if (o.xlabel) tx(ctx, o.xlabel, X(xmax / 2), Y(0) + 36, { size: 13, wt: 700, col: k.ink });
      if (o.ylabel) tx(ctx, o.ylabel, 14, Y(ymax / 2), { size: 13, wt: 700, col: k.ink, rot: -M.PI / 2 });
      if (o.line && pts.length > 1) { ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); pts.forEach(function (p, j) { ctx[j ? 'lineTo' : 'moveTo'](X(p.x), Y(p.y)); }); ctx.stroke(); ctx.restore(); }
      // the walk: across, then up
      var wp = dp || (pts[0] ? [pts[0].x, pts[0].y] : null);
      if (walkOn && wp) {
        var t = walk, ax = M.min(1, t * 2), up = M.max(0, t * 2 - 1), oc = k.dark ? '#ffa94d' : '#d9480f', gc = k.dark ? '#b197fc' : '#7048e8';
        if (wp[0] > 0) arw(ctx, X(0), Y(0) - 0, X(wp[0] * ax), Y(0), oc, 4);
        if (up > 0 && wp[1] > 0) arw(ctx, X(wp[0]), Y(0), X(wp[0]), Y(wp[1] * up), gc, 4);
        if (wp[0] > 0) tx(ctx, 'across ' + wp[0], X(wp[0] * ax / 2), Y(0) - 12, { size: 12.5, wt: 700, col: oc, halo: k.bg });
        if (up > 0 && wp[1] > 0) tx(ctx, 'up ' + wp[1], X(wp[0]) + 8, Y(wp[1] * up / 2), { size: 12.5, wt: 700, col: gc, halo: k.bg, al: 'left' });
      }
      pts.forEach(function (p) { var col = k[p.color] || k.blue; disc(ctx, X(p.x), Y(p.y), 6, col, k.bg, 2); var s = p.label + (o.coords ? (p.label ? ' ' : '') + '(' + p.x + ', ' + p.y + ')' : ''); if (s) tx(ctx, s, X(p.x) + 9, Y(p.y) - 12, { size: 13.5, wt: 700, al: 'left', col: k.ink, halo: k.bg }); });
      if (dp) { disc(ctx, X(dp[0]), Y(dp[1]), 12, soft(k.red, 0.18)); disc(ctx, X(dp[0]), Y(dp[1]), 7.5, k.red, k.bg, 2); tx(ctx, '(' + dp[0] + ', ' + dp[1] + ')', X(dp[0]) + 11, Y(dp[1]) - 14, { size: 13.5, wt: 700, al: 'left', col: k.red, halo: k.bg }); }
      say();
    }
    function say() {
      if (dp) {
        var s = 'The red point is at <b>(' + dp[0] + ', ' + dp[1] + ')</b>: ' + dp[0] + ' across' + (o.xlabel ? ' (' + o.xlabel + ')' : '') + ', then ' + dp[1] + ' up' + (o.ylabel ? ' (' + o.ylabel + ')' : '') + '.';
        if (TT) { var ok = +TT.x === dp[0] && +TT.y === dp[1]; if (ok && !solved) { solved = true; el.classList.add('mlb-done'); try { el.dispatchEvent(new CustomEvent('ml-task', { bubbles: true, detail: { ok: true, name: 'g5-grid' } })); } catch (e) { } } if (!ok) solved = false; taskMsg.innerHTML = ok ? '<span class="g5v-ok">✓ That is (' + TT.x + ', ' + TT.y + '). Across first, then up.</span>' : (dp[0] === +TT.y && dp[1] === +TT.x && TT.x !== TT.y ? 'Close! That point is (' + dp[0] + ', ' + dp[1] + '): the numbers are swapped. The first number tells how far across.' : ''); }
        S.say(s);
      } else S.say(walkOn && pts[0] ? 'To reach ' + (pts[0].label || 'the point') + ' (' + pts[0].x + ', ' + pts[0].y + '), start at (0, 0), go ' + pts[0].x + ' across, then ' + pts[0].y + ' up.' : '');
    }
    var taskMsg = null;
    if (TT) { S.taskBox.hidden = false; S.taskBox.innerHTML = '<p><b>Put the red point at (' + TT.x + ', ' + TT.y + ').</b></p>'; taskMsg = V.el('p', ''); taskMsg.setAttribute('aria-live', 'polite'); S.taskBox.appendChild(taskMsg); }
    function playWalk() {
      if (raf) cancelAnimationFrame(raf); walkOn = true;
      if (V.reduced) { walk = 1; draw(); return; }
      var t0 = null; walk = 0;
      function fr2(t) { if (!t0) t0 = t; walk = M.min(1, (t - t0) / 1600); draw(); if (walk < 1) raf = requestAnimationFrame(fr2); else raf = null; }
      raf = requestAnimationFrame(fr2);
    }
    function snap(px, py) { return [M.max(0, M.min(xmax, M.round((px - G.x0) / G.cell) * xs)), M.max(0, M.min(ymax, M.round((G.y0 - py) / G.cell) * ys))]; }
    if (dp) {
      V.drag(S.c.cv, { hit: function (x, y) { return M.hypot(x - X(dp[0]), y - Y(dp[1])) < 26 ? 1 : null; }, move: function (h, x, y) { var q = snap(x, y); if (q[0] !== dp[0] || q[1] !== dp[1]) { dp = q; walkOn = false; draw(); } } });
      tapOn(S.c.cv, function (x, y) { dp = snap(x, y); walkOn = false; draw(); });
      S.c.cv.tabIndex = 0; S.c.cv.setAttribute('role', 'application'); S.c.cv.setAttribute('aria-label', 'Coordinate grid. Use the arrow keys to move the red point.');
      S.c.cv.addEventListener('keydown', function (e) {
        var d = { ArrowLeft: [-xs, 0], ArrowRight: [xs, 0], ArrowUp: [0, ys], ArrowDown: [0, -ys] }[e.key]; if (!d) return; e.preventDefault();
        dp = [M.max(0, M.min(xmax, +(dp[0] + d[0]).toFixed(6))), M.max(0, M.min(ymax, +(dp[1] + d[1]).toFixed(6)))]; walkOn = false; draw();
      });
    }
    if ((o.walk || dp) && o.controls !== false) { var row = S.row(); V.button(row, 'Show the path', playWalk); }
    S.live(draw); draw();
  });

  /* ---------------------------------------------------------------- boot */
  ML.vizG5 = { raw: raw, fr: fr };
  function fnOf(name) { for (var i = 0; i < defs.length; i++) if (defs[i][0] === name) return defs[i][1]; }
  function boot() {
    if (!ML.viz || boot.done) return; boot.done = true; V = ML.viz;
    V.register('g5-fracarea', fnOf('g5-fracarea'));
    V.register('g5-factortree', fnOf('g5-factortree'));
    V.register('g5-lineplot', fnOf('g5-lineplot'));
    V.register('g5-prisms', fnOf('g5-prisms'));
    V.register('g5-shapetree', fnOf('g5-shapetree'));
    V.register('g5-grid', fnOf('g5-grid'));
  }
  if (ML.viz) boot(); else if (D.addEventListener) D.addEventListener('DOMContentLoaded', boot);
})(window, document);
