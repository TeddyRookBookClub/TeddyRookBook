/* Math Ladder: extra visuals for Grade 2 (static/math/viz/g2.js), registered with MathLadder.viz.register.
   The shared visuals (base10, coins, clock, numberline …) are interactive and say what they show in a readout. Inside a
   practice problem that readout would give the answer away, so these are quiet pictures for problems (and lessons),
   plus two small interactive ones (the ruler you slide, and graphs you can build).

   Every visual takes  label (screen-reader words; a good default is made from the options) and  title (a heading).

   g2-blocks   base-ten blocks on a place-value mat, with no numbers unless asked
     n: 352  or  h: 3, t: 5, o: 2       what to show (h, t, o may be 10 or more: {"t": 3, "o": 14})
     groups: [{t: 3, o: 8}, {t: 4, o: 7}]   up to 4 numbers in different colors (an addition picture; ones keep
                                         filling the same ten-groups, so the new ten shows)
     cross: {t: 2, o: 7}                the last blocks of each place drawn crossed out (taken away)
     cols: auto                         2 (tens, ones) or 3 (hundreds, tens, ones)
     counts: false                      show how many are in each place under its name
     ring: false                        a dashed loop around each full group of 10 ones (ready to trade)
   g2-coins    U.S. coins and bills at their real sizes compared with each other
     coins: ["quarter", "dime", "penny"]  or  {quarter: 2, dime: 1}   also "half", "dollar" ($1), "five", "ten", "twenty"
     show: "both"                       on each coin: "both" (25¢ and its name), "name", "value" or "none"
     sort: false                        true lines them up from greatest to least value
   g2-ruler    a ruler (inches or centimeters) with things lying above it
     unit: "in" | "cm"                  len: 6 (ruler length in units; default fits the things)
     objs: [{from: 0, to: 5, kind: "pencil", name: "pencil", color: "blue"}]   kind: pencil, crayon, ribbon, stick, straw
     drag: false                        true: slide the first thing along the ruler (drag it, or use the buttons);
                                        the readout says where it starts and ends and counts the spaces
     jumps: false                       numbered arcs over the spaces the first thing covers (count spaces, not marks)
     second: null                       "cm" draws a centimeter scale under an inch ruler (same zero), to compare units
     halves: false                      half-inch marks
   g2-graph    picture graphs, bar graphs and line plots
     kind: "bar" | "picture" | "lineplot"
     cats: ["Apples", "Pears"], vals: [5, 3]     categories and counts (bar, picture)
     icon: "star"                       picture graphs: star, circle, heart, square, smile; key: "Each ★ = 1 vote" (key text)
     max, labelEvery: 1                 bar graphs: top of the scale and which grid lines get numbers (every line is 1)
     yLabel, xLabel                     axis words
     data: [4, 5, 5, 7], min, max, unitLabel   line plots: one X per value above a number line
     edit: false                        bar and picture: −/+ buttons for each category;  task: {vals: [4, 6, 2]}
                                        "Make the graph match the table." (checks as you go)
   g2-array    a still array, a rectangle cut into squares, or objects in pairs
     rows: 3, cols: 4, item: "dot"     item: dot, star, heart, square, apple
     squares: false                     true: a rectangle split into rows and columns of same-size squares
     groups: false                      "rows" or "cols": a loop around each row (or column)
     n: 9, layout: "pairs"              n things in pairs (2 rows); an odd one left over is easy to see
     highlight: true                    (pairs) color the one left over in yellow; false keeps every dot the same color
     color: "red"                       "red", "blue" or "green" items
   g2-shapes   flat shapes (and a cube), with equal or unequal shares
     items: [{shape: "rect", parts: 4, dir: "v", equal: true, shade: 1, label: "A"}]
       shape: circle, square, rect, tri, quad, pent, hex, oct, poly (pts: [[x, y], …] on a 10 × 8 grid), cube
       parts: 2 | 3 | 4    dir: "v" (strips), "h", "grid" (4 as 2 × 2), "diag" (2 triangles), "x" (4 triangles);
       circles cut into wedges.  equal: false makes the cuts uneven.  shade: how many shares are shaded.
   g2-line     a still number line
     min: 0, max: 100, step: 10         ends and the space between tick marks
     labels: "all" | "ends" | [300, 350]  which ticks get numbers
     points: [{v: 70, text: "?", color: "red"}]   dots with a word or "?" above them
     hops: [{from: 46, to: 66, text: "+20"}]      jumps drawn as arcs (text defaults to +n or −n)              */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math, TAU = 2 * M.PI;

  /* ---------------------------------------------------------------- look */
  var CSS = '.g2v{overflow:hidden}' +
    '.g2v .g2v-title{margin:0 0 .45rem;font:700 1rem/1.3 Georgia,"Times New Roman",serif;color:var(--mv-ink)}' +
    '.g2v .g2v-stage{position:relative;max-width:100%}' +
    '.g2v .ml-readout{font-size:1rem}' +
    '.g2v .ml-readout:empty{display:none}' +
    '.g2v .g2v-ctl{display:flex;flex-wrap:wrap;gap:.45rem .55rem;align-items:center;margin:.55rem 0 0}' +
    '.g2v .g2v-ctl:empty{display:none}' +
    '.g2v .g2v-step{display:inline-flex;align-items:center;gap:.25rem;padding:.12rem .22rem .12rem .6rem;border:1px solid var(--mv-line);border-radius:999px;background:var(--mv-card)}' +
    '.g2v .g2v-step span{font-size:.85rem;color:var(--mv-muted)}' +
    '.g2v .g2v-step output{min-width:1.6em;text-align:center;font-weight:700;font-variant-numeric:tabular-nums}' +
    '.g2v .g2v-step .ml-btn{min-width:36px;min-height:36px;padding:0;border-radius:50%;font-size:1.1rem;line-height:1}' +
    '.g2v .ml-btn:disabled{opacity:.42;cursor:default}' +
    '.g2v .g2v-task{margin:0 0 .55rem;padding:.5rem .7rem;border-left:4px solid #b8963e;border-radius:8px;background:var(--mv-card);font-weight:600}' +
    '.g2v .g2v-task.g2v-ok{border-left-color:#1d7a4b}' +
    'html[data-theme="dark"] .g2v .g2v-task.g2v-ok{border-left-color:#7fd6a6}' +
    '.g2v .g2v-task b{font-weight:800}';
  function css() { if (D.getElementById('g2v-css')) return; var s = D.createElement('style'); s.id = 'g2v-css'; s.textContent = CSS; D.head.appendChild(s); }

  var V = null;
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function K() {
    var c = V.colors(), dk = dark(); c.dk = dk;
    c.card = dk ? '#14211a' : '#ffffff'; c.line = dk ? '#3b5a48' : '#cfd9d2'; c.soft = dk ? '#1f3027' : '#f6f3ea';
    c.pal = dk ? [['#74d0a0', '#3e8f66'], ['#7cb8f2', '#3f78b3'], ['#ffb36b', '#c4772e'], ['#c4a8ff', '#8a6ad6']]
               : [['#7fd3a8', '#1f8a58'], ['#8fc0f0', '#2f6fb8'], ['#ffc08a', '#c8661c'], ['#c9b5ff', '#6f4fd0']];
    c.kid = dk ? ['#f08080', '#f2c94c', '#7cb8f2', '#74d0a0', '#c4a8ff', '#ffb36b'] : ['#ee5d6c', '#f5b700', '#4f93e0', '#38b27a', '#9b7be6', '#f08a3c'];
    c.named = { red: c.kid[0], yellow: c.kid[1], blue: c.kid[2], green: c.kid[3], purple: c.kid[4], orange: c.kid[5] };
    return c;
  }
  var KF = 'ui-rounded,"SF Pro Rounded","Arial Rounded MT Bold",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  function font(sz, wt) { return (wt || 600) + ' ' + sz + 'px ' + KF; }
  function tx(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = o.font || font(o.size || 14, o.wt); ctx.fillStyle = o.col || '#000';
    ctx.textAlign = o.al || 'center'; ctx.textBaseline = o.bl || 'middle';
    if (o.halo) { ctx.lineWidth = 4; ctx.strokeStyle = o.halo; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillText(s, x, y); ctx.restore();
  }
  function tw(ctx, s, f) { ctx.save(); ctx.font = f; var w = ctx.measureText(s).width; ctx.restore(); return w; }
  function rr(ctx, x, y, w, h, r) { r = M.max(0, M.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function box(ctx, x, y, w, h, r, fill, stroke, lw) { rr(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } }
  function disc(ctx, x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, M.max(0, r), 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } }
  function ln(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw || 1.5; ctx.lineCap = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  function poly(ctx, pts, fill, stroke, lw, dash) { ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.stroke(); } ctx.restore(); }
  function soft(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function int(v, d, lo, hi) { v = parseInt(v, 10); if (!isFinite(v)) v = d; if (lo != null) v = M.max(lo, v); if (hi != null) v = M.min(hi, v); return v; }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function clamp(v, a, b) { return M.max(a, M.min(b, v)); }
  function plural(n, w, p) { return n + ' ' + (n === 1 ? w : (p || w + 's')); }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function minus(v) { return String(v).replace('-', '−'); }

  /* the frame: title, stage with a canvas, readout, controls */
  function shell(el, o, d) {
    css();
    el.classList.add('g2v', 'g2v-' + d.name, 'ml-notex');
    var S = { el: el, o: o };
    if (o.title) { var t = V.el('p', 'g2v-title'); t.textContent = o.title; el.appendChild(t); }
    S.taskEl = V.el('p', 'g2v-task'); S.taskEl.hidden = true; S.taskEl.setAttribute('aria-live', 'polite'); el.appendChild(S.taskEl);
    S.stage = V.el('div', 'g2v-stage'); el.appendChild(S.stage);
    S.co = { height: d.height || 200 }; S.c = V.canvas(S.stage, S.co); S.ctx = S.c.ctx;
    S.c.cv.setAttribute('role', 'img');
    S.ro = V.el('p', 'ml-readout'); S.ro.setAttribute('aria-live', 'polite'); el.appendChild(S.ro);
    S.ctl = V.el('div', 'g2v-ctl'); el.appendChild(S.ctl);
    if (o.controls === false) S.ctl.hidden = true;
    S.label = function (s) { var l = o.label || s; el.setAttribute('aria-label', l); S.c.cv.setAttribute('aria-label', l); };
    S.label(d.label);
    S.height = function (h) { h = M.max(40, M.round(h)); if (S.c.h !== h) { S.co.height = h; S.c.fit(); } };
    S.say = function (h) { if (S.ro._h !== h) { S.ro.innerHTML = h; S.ro._h = h; } };
    S.live = function (fn) { S.c.onResize(fn); V.onTheme(fn); fn(); };
    return S;
  }
  function stepper(parent, label, val, lo, hi, change) {
    var w = V.el('div', 'g2v-step'), lab = V.el('span'); lab.textContent = label; w.appendChild(lab);
    var mi = V.button(w, '−', function () { set(val - 1, true); }); mi.setAttribute('aria-label', 'One less: ' + label);
    var out = D.createElement('output'); w.appendChild(out);
    var pl = V.button(w, '+', function () { set(val + 1, true); }); pl.setAttribute('aria-label', 'One more: ' + label);
    function set(v, user) { val = clamp(v, lo, hi); out.textContent = String(val); mi.disabled = val <= lo; pl.disabled = val >= hi; if (user) change(val); }
    set(val); parent.appendChild(w); return { set: set, get: function () { return val; } };
  }

  /* ================================================================ g2-blocks */
  var PL = ['ones', 'tens', 'hundreds'], PL1 = ['one', 'ten', 'hundred'];
  function blocksFactory(el, o) {
    var S = shell(el, o, { name: 'blocks', label: 'Base-ten blocks', height: 220 });
    var groups = Array.isArray(o.groups) && o.groups.length ? o.groups.slice(0, 4) : [o.n != null ? { n: o.n } : { h: o.h, t: o.t, o: o.o }];
    groups = groups.map(function (g) { if (g.n != null) { var n = int(g.n, 0, 0, 999); return [n % 10, M.floor(n / 10) % 10, M.floor(n / 100)]; } return [int(g.o, 0, 0, 40), int(g.t, 0, 0, 30), int(g.h, 0, 0, 12)]; });
    var cr = o.cross || {}, cross = [int(cr.o, 0, 0, 40), int(cr.t, 0, 0, 30), int(cr.h, 0, 0, 12)];
    var tot = [0, 0, 0]; groups.forEach(function (g) { for (var p = 0; p < 3; p++) tot[p] += g[p]; });
    var cols = o.cols === 2 || o.cols === 3 ? o.cols : tot[2] ? 3 : 2;
    if (cols === 2 && tot[2]) cols = 3;
    // each block: [place, groupIndex]
    var B = [[], [], []]; groups.forEach(function (g, gi) { for (var p = 0; p < 3; p++) for (var i = 0; i < g[p]; i++) B[p].push(gi); });
    var parts = []; for (var p = cols - 1; p >= 0; p--) parts.push(plural(tot[p], PL1[p], PL[p]));
    S.label('Base-ten blocks: ' + list(parts) + (cross.some(Boolean) ? ', some crossed out' : ''));
    var G = {};
    function geo() {
      var w = S.c.w, gap = 8, wts = cols === 3 ? [0.27, 0.31, 0.42] : [0.45, 0.55], cw = [];
      for (var q = 0; q < cols; q++) cw.push((w - gap * (cols - 1)) * wts[q]);
      var u = clamp(M.floor(w / 34), 7, 11);
      G = { w: w, gap: gap, cw: cw, u: u, head: o.counts ? 44 : 26, x: [] };
      var x = 0; for (q = cols - 1; q >= 0; q--) { G.x[q] = x; x += cw[q] + gap; }
      // ones: groups of ten as 2 rows of 5; groups side by side when there is room
      var cu = u + 3, gw = 5 * cu + 8, perRowG = M.max(1, M.floor((cw[0] - 8) / gw)), ng = M.max(1, M.ceil(B[0].length / 10));
      G.o = { cu: cu, gw: gw, perRowG: perRowG, gh: 2 * cu + 10 };
      var hO = M.ceil(ng / perRowG) * G.o.gh;
      // tens: rods in rows
      var perT = M.max(1, M.floor((cw[1] - 8) / (u + 5))), hT = M.max(1, M.ceil(B[1].length / perT)) * (10 * u + 10);
      G.t = { per: perT };
      var hH = 0;
      if (cols === 3) {
        var F = M.min(8 * u, (cw[2] - 20) / 3), perH = M.max(1, M.floor((cw[2] - 8 + 6) / (F + 6)));
        G.h = { F: F, per: perH }; hH = M.max(1, M.ceil(B[2].length / perH)) * (F + 8);
      }
      G.body = M.max(hO, hT, hH, 10 * u + 10);
      S.height(G.head + G.body + 12);
    }
    function colr(gi, k) { return k.pal[gi % k.pal.length]; }
    function crossed(p, i) { return i >= B[p].length - cross[p]; }
    function xMark(ctx, x, y, w, h, k) { ln(ctx, x - 2, y - 2, x + w + 2, y + h + 2, k.red, 2.5); ln(ctx, x + w + 2, y - 2, x - 2, y + h + 2, k.red, 2.5); }
    function draw() {
      geo(); var ctx = S.ctx, k = K(), u = G.u, p, i;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      for (p = cols - 1; p >= 0; p--) {
        var x = G.x[p];
        box(ctx, x, 0, G.cw[p], S.c.h, 10, p % 2 ? k.soft : k.card, k.line, 1);
        var nm = PL[p][0].toUpperCase() + PL[p].slice(1);
        if (tw(ctx, nm, font(13, 700)) > G.cw[p] - 6) nm = ['Ones', 'Tens', 'Hund.'][p];
        tx(ctx, nm, x + G.cw[p] / 2, 14, { size: 13, wt: 700, col: k.muted });
        if (o.counts) tx(ctx, String(B[p].length), x + G.cw[p] / 2, 33, { size: 18, wt: 800, col: k.ink });
      }
      var top = G.head;
      // hundreds
      if (cols === 3) B[2].forEach(function (gi, i) {
        var F = G.h.F, per = G.h.per, r = M.floor(i / per), c = i % per, n = M.min(per, B[2].length), x0 = G.x[2] + (G.cw[2] - n * (F + 6) + 6) / 2;
        var xx = x0 + c * (F + 6), yy = top + 4 + r * (F + 8), cl = colr(gi, k);
        box(ctx, xx, yy, F, F, 4, cl[0], cl[1], 1.4);
        ctx.save(); ctx.strokeStyle = cl[1]; ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.beginPath();
        for (var j = 1; j < 10; j++) { ctx.moveTo(xx + j * F / 10, yy + 1); ctx.lineTo(xx + j * F / 10, yy + F - 1); ctx.moveTo(xx + 1, yy + j * F / 10); ctx.lineTo(xx + F - 1, yy + j * F / 10); }
        ctx.stroke(); ctx.restore();
        if (crossed(2, i)) xMark(ctx, xx, yy, F, F, k);
      });
      // tens
      B[1].forEach(function (gi, i) {
        var per = G.t.per, r = M.floor(i / per), c = i % per, n = M.min(per, M.max(1, B[1].length)), x0 = G.x[1] + (G.cw[1] - n * (u + 5) + 5) / 2;
        var xx = x0 + c * (u + 5), yy = top + 4 + r * (10 * u + 10), cl = colr(gi, k);
        box(ctx, xx, yy, u, 10 * u, M.min(3, u / 4), cl[0], cl[1], 1.2);
        ctx.save(); ctx.strokeStyle = cl[1]; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.beginPath();
        for (var j = 1; j < 10; j++) { ctx.moveTo(xx + 1, yy + j * u + 0.5); ctx.lineTo(xx + u - 1, yy + j * u + 0.5); }
        ctx.stroke(); ctx.restore();
        if (crossed(1, i)) xMark(ctx, xx, yy, u, 10 * u, k);
      });
      // ones
      var oo = G.o, ng = M.max(1, M.ceil(B[0].length / 10)), rowsG = M.min(oo.perRowG, ng), x0o = G.x[0] + (G.cw[0] - rowsG * oo.gw + 8) / 2;
      B[0].forEach(function (gi, i) {
        var g = M.floor(i / 10), gr = M.floor(g / oo.perRowG), gc = g % oo.perRowG, j = i % 10, r = M.floor(j / 5), c = j % 5;
        var xx = x0o + gc * oo.gw + c * oo.cu, yy = top + 4 + gr * oo.gh + r * oo.cu, cl = colr(gi, k);
        box(ctx, xx, yy, u, u, M.min(3, u / 4), cl[0], cl[1], 1);
        if (crossed(0, i)) xMark(ctx, xx, yy, u, u, k);
      });
      if (o.ring) for (var g = 0; g < M.floor(B[0].length / 10); g++) {
        var gr2 = M.floor(g / oo.perRowG), gc2 = g % oo.perRowG;
        ctx.save(); ctx.setLineDash([5, 4]); box(ctx, x0o + gc2 * oo.gw - 4, top + gr2 * oo.gh, 5 * oo.cu + 5, 2 * oo.cu + 5, 8, null, k.gold, 2.2); ctx.restore();
      }
    }
    S.live(draw);
    return { update: function () { draw(); } };
  }

  /* ================================================================ g2-coins */
  var COIN = {
    penny: { v: 1, d: 19.05, n: 'penny', cu: 1 }, nickel: { v: 5, d: 21.21, n: 'nickel' }, dime: { v: 10, d: 17.91, n: 'dime', reed: 1 },
    quarter: { v: 25, d: 24.26, n: 'quarter', reed: 1 }, half: { v: 50, d: 30.61, n: 'half dollar', reed: 1 },
    dollar: { v: 100, bill: 1, n: 'one-dollar bill' }, five: { v: 500, bill: 1, n: 'five-dollar bill' }, ten: { v: 1000, bill: 1, n: 'ten-dollar bill' }, twenty: { v: 2000, bill: 1, n: 'twenty-dollar bill' }
  };
  function coinsFactory(el, o) {
    var S = shell(el, o, { name: 'coins', label: 'Coins', height: 120 });
    var L = [];
    if (Array.isArray(o.coins)) L = o.coins.filter(function (c) { return COIN[c]; });
    else if (o.coins && typeof o.coins === 'object') ['twenty', 'ten', 'five', 'dollar', 'half', 'quarter', 'dime', 'nickel', 'penny'].forEach(function (c) { for (var i = 0; i < int(o.coins[c], 0, 0, 20); i++) L.push(c); });
    L = L.slice(0, 30);
    if (o.sort) L.sort(function (a, b) { return COIN[b].v - COIN[a].v; });
    var show = o.show || 'both', by = {};
    L.forEach(function (c) { by[c] = (by[c] || 0) + 1; });
    S.label(o.label || (L.length ? 'Money: ' + list(Object.keys(by).sort(function (a, b) { return COIN[b].v - COIN[a].v; }).map(function (c) { return by[c] + ' ' + (by[c] === 1 ? COIN[c].n : COIN[c].n === 'penny' ? 'pennies' : COIN[c].n + 's'); })) : 'No coins'));
    var items = [];
    function layout() {
      var w = S.c.w, sc = M.min(2.7, (w - 24) / 4.7 / 24.26), x = 10, y = 10, rowH = 0; items = [];
      L.forEach(function (c) {
        var C = COIN[c], iw = C.bill ? 24.26 * sc * 2.45 : C.d * sc, ih = C.bill ? 24.26 * sc * 1.05 : C.d * sc;
        if (x + iw > w - 8 && x > 10) { x = 10; y += rowH + 10; rowH = 0; }
        items.push({ c: c, x: x, y: y, w: iw, h: ih }); x += iw + 10; rowH = M.max(rowH, ih);
      });
      S.height(M.max(24.26 * sc + 20, y + rowH + 10));
    }
    function draw() {
      layout(); var ctx = S.ctx, k = K(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      items.forEach(function (it) {
        var C = COIN[it.c];
        if (C.bill) {
          box(ctx, it.x, it.y, it.w, it.h, 5, k.dk ? '#3c5a46' : '#d6e8d2', k.dk ? '#7fb08f' : '#5b8a5f', 2);
          box(ctx, it.x + 4, it.y + 4, it.w - 8, it.h - 8, 3, null, k.dk ? '#7fb08f' : '#7aa77d', 1);
          disc(ctx, it.x + it.w / 2, it.y + it.h / 2, it.h * 0.3, k.dk ? '#4c6e57' : '#eef6ea', k.dk ? '#7fb08f' : '#7aa77d', 1);
          var dv = C.v / 100, ink = k.dk ? '#d9f0de' : '#2f5a35';
          if (show !== 'none' && show !== 'name') tx(ctx, '$' + dv, it.x + it.w / 2, it.y + it.h / 2 + 1, { size: it.h * 0.3, wt: 800, col: ink });
          else tx(ctx, ['ONE', 'FIVE', 'TEN', 'TWENTY'][[1, 5, 10, 20].indexOf(dv)], it.x + it.w / 2, it.y + it.h / 2 + 1, { size: it.h * 0.2, wt: 800, col: ink });
          tx(ctx, String(dv), it.x + 11, it.y + 12, { size: 10, wt: 700, col: ink }); tx(ctx, String(dv), it.x + it.w - 11, it.y + it.h - 11, { size: 10, wt: 700, col: ink });
          return;
        }
        var r = it.w / 2, cx = it.x + r, cy = it.y + r, g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
        if (C.cu) { g.addColorStop(0, '#f1b38a'); g.addColorStop(1, '#b8693a'); } else { g.addColorStop(0, '#f7f9fa'); g.addColorStop(1, '#a9b1b8'); }
        disc(ctx, cx, cy, r, g, C.cu ? '#8a4a24' : '#7d868e', 1.5);
        if (C.reed) { ctx.save(); ctx.strokeStyle = 'rgba(80,90,100,.55)'; ctx.lineWidth = 1; ctx.beginPath(); for (var a = 0; a < 48; a++) { var t = a / 48 * TAU; ctx.moveTo(cx + (r - 1) * M.cos(t), cy + (r - 1) * M.sin(t)); ctx.lineTo(cx + (r - 3.5) * M.cos(t), cy + (r - 3.5) * M.sin(t)); } ctx.stroke(); ctx.restore(); }
        disc(ctx, cx, cy, r * 0.8, null, C.cu ? 'rgba(120,60,25,.45)' : 'rgba(90,100,110,.4)', 1);
        var ink2 = C.cu ? '#5a2c10' : '#39424a', nm = C.n === 'half dollar' ? 'half' : C.n;
        if (show === 'both') { tx(ctx, C.v + '¢', cx, cy - r * 0.1, { size: M.max(10, r * (C.v >= 10 ? 0.6 : 0.7)), wt: 800, col: ink2 }); tx(ctx, nm, cx, cy + r * 0.47, { size: M.max(8, r * 0.27), wt: 700, col: ink2 }); }
        else if (show === 'value') tx(ctx, C.v + '¢', cx, cy, { size: M.max(10, r * (C.v >= 10 ? 0.62 : 0.72)), wt: 800, col: ink2 });
        else if (show === 'name') tx(ctx, nm, cx, cy, { size: M.max(9, r * (nm.length > 6 ? 0.32 : 0.38)), wt: 800, col: ink2 });
      });
      if (!items.length) tx(ctx, 'No coins', S.c.w / 2, S.c.h / 2, { size: 14, col: k.muted });
    }
    S.live(draw);
    return { update: function () { draw(); } };
  }

  /* ================================================================ g2-ruler */
  var OBJC = { pencil: '#f5b700', crayon: '#e8590c', ribbon: '#d6336c', stick: '#9c6b3c', straw: '#1c6fd6' };
  function rulerFactory(el, o) {
    var S = shell(el, o, { name: 'ruler', label: 'A ruler', height: 160 });
    var unit = o.unit === 'cm' ? 'cm' : 'in', uw = unit === 'cm' ? 'centimeters' : 'inches', u1 = unit === 'cm' ? 'centimeter' : 'inch';
    var objs = (o.objs || [{ from: 0, to: 4, kind: 'pencil' }]).slice(0, 3).map(function (b, i) {
      var f = num(b.from, 0), t = num(b.to, f + 3); if (t < f) { var z = f; f = t; t = z; }
      var kind = OBJC[b.kind] ? b.kind : ['pencil', 'crayon', 'ribbon'][i % 3];
      return { from: f, to: t, kind: kind, name: b.name || kind, color: b.color };
    });
    var maxEnd = objs.reduce(function (m, b) { return M.max(m, b.to); }, 0);
    var len = int(o.len, M.max(unit === 'cm' ? 10 : 6, M.ceil(maxEnd) + 1), 2, unit === 'cm' ? 30 : 15);
    var drag = !!o.drag, G = {};
    function describe() {
      return objs.map(function (b) { return 'a ' + b.name + ' from the ' + b.from + ' mark to the ' + b.to + ' mark'; });
    }
    S.label('A ruler in ' + uw + ' from 0 to ' + len + ', with ' + list(describe()) + (o.second === 'cm' ? ', and a centimeter scale below it' : ''));
    function geo() {
      var w = S.c.w, pad = 18, lane = 34;
      G = { x0: pad, x1: w - pad, lane: lane };
      G.ppu = (G.x1 - G.x0) / len;
      G.oy = 10 + (o.jumps ? 26 : 0);
      G.ry = G.oy + objs.length * lane + 12; // top of the ruler
      G.rh = 54;
      S.height(G.ry + G.rh + (o.second === 'cm' ? 52 : 6));
    }
    function X(v) { return G.x0 + v * G.ppu; }
    function drawObj(ctx, b, y, k) {
      var x1 = X(b.from), x2 = X(b.to), h = 18, mid = y + h / 2, col = b.color && k[b.color] ? k[b.color] : OBJC[b.kind];
      if (x2 - x1 < 4) return;
      if (b.kind === 'pencil') {
        var tip = M.min(18, (x2 - x1) * 0.25), er = M.min(12, (x2 - x1) * 0.15);
        box(ctx, x1, y, er, h, 3, '#f497b5', '#b5476b', 1.2);
        ctx.fillStyle = '#c0c6cc'; ctx.fillRect(x1 + er - 2, y, 5, h);
        ctx.fillStyle = col; ctx.fillRect(x1 + er + 3, y, x2 - x1 - er - tip - 3, h);
        ln(ctx, x1 + er + 3, mid, x2 - tip, mid, 'rgba(0,0,0,.18)', 1);
        poly(ctx, [[x2 - tip, y], [x2, mid], [x2 - tip, y + h]], '#f1d3a8', '#a67c45', 1);
        poly(ctx, [[x2 - tip * 0.35, mid - h * 0.18], [x2, mid], [x2 - tip * 0.35, mid + h * 0.18]], '#333', null);
        ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.strokeRect(x1 + er + 3, y + 0.5, x2 - x1 - er - tip - 3, h - 1); ctx.restore();
      } else if (b.kind === 'crayon') {
        var tp = M.min(14, (x2 - x1) * 0.22);
        box(ctx, x1, y, x2 - x1 - tp, h, 4, col, 'rgba(0,0,0,.35)', 1);
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x1 + (x2 - x1) * 0.2, y + 2, (x2 - x1) * 0.4, h - 4);
        poly(ctx, [[x2 - tp, y + 2], [x2, mid], [x2 - tp, y + h - 2]], col, 'rgba(0,0,0,.35)', 1);
      } else if (b.kind === 'ribbon') {
        box(ctx, x1, y + 2, x2 - x1, h - 4, 2, col, 'rgba(0,0,0,.25)', 1);
        ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); for (var s = x1 + 6; s < x2 - 2; s += 10) { ctx.moveTo(s, y + 4); ctx.lineTo(s - 4, y + h - 4); } ctx.stroke(); ctx.restore();
      } else if (b.kind === 'straw') {
        box(ctx, x1, y + 3, x2 - x1, h - 6, 5, k.dk ? '#dfe7ee' : '#ffffff', 'rgba(0,0,0,.35)', 1);
        ctx.save(); rr(ctx, x1, y + 3, x2 - x1, h - 6, 5); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); for (var s2 = x1 - 10; s2 < x2 + 10; s2 += 12) { ctx.moveTo(s2, y + h); ctx.lineTo(s2 + 10, y); } ctx.stroke(); ctx.restore();
      } else {
        box(ctx, x1, y + 2, x2 - x1, h - 4, 6, col, 'rgba(0,0,0,.4)', 1);
        ln(ctx, x1 + 6, mid, x2 - 6, mid - 1, 'rgba(0,0,0,.2)', 1.5);
      }
    }
    function draw() {
      geo(); var ctx = S.ctx, k = K(), i;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      // ruler body
      box(ctx, G.x0 - 10, G.ry, G.x1 - G.x0 + 20, G.rh, 6, k.dk ? '#5a4a22' : '#f7e3a1', k.dk ? '#b8963e' : '#b8963e', 1.5);
      var lblEvery = G.ppu < 16 ? (G.ppu < 9 ? 5 : 2) : 1;
      for (i = 0; i <= len; i++) {
        var x = X(i);
        ln(ctx, x, G.ry, x, G.ry + 16, k.dk ? '#f3e7c4' : '#3a2f12', 1.6);
        if (i % lblEvery === 0) tx(ctx, String(i), x, G.ry + 26, { size: 13, wt: 700, col: k.dk ? '#f3e7c4' : '#3a2f12' });
        if (o.halves && unit === 'in' && i < len) ln(ctx, x + G.ppu / 2, G.ry, x + G.ppu / 2, G.ry + 9, k.dk ? '#d8cba4' : '#6b5a2a', 1.1);
      }
      tx(ctx, unit === 'cm' ? 'centimeters' : 'inches', (G.x0 + G.x1) / 2 + (len % 2 ? 0 : G.ppu / 2), G.ry + G.rh - 9, { size: 10, wt: 700, col: k.dk ? '#d8cba4' : '#6b5a2a' });
      if (o.second === 'cm' && unit === 'in') {
        var y2 = G.ry + G.rh + 4, cpu = G.ppu / 2.54, ncm = M.floor(len * 2.54);
        box(ctx, G.x0 - 10, y2, G.x1 - G.x0 + 20, 42, 6, k.dk ? '#22384a' : '#dceefe', '#4f93e0', 1.5);
        for (i = 0; i <= ncm; i++) { var xc = G.x0 + i * cpu; ln(ctx, xc, y2, xc, y2 + 12, k.dk ? '#cfe6ff' : '#1e4f86', 1.3); if (cpu >= 14 || i % 2 === 0) tx(ctx, String(i), xc, y2 + 24, { size: 11, wt: 700, col: k.dk ? '#cfe6ff' : '#1e4f86' }); }
        tx(ctx, 'centimeters', (G.x0 + G.x1) / 2, y2 + 35, { size: 10, wt: 700, col: k.dk ? '#cfe6ff' : '#1e4f86' });
      }
      objs.forEach(function (b, j) {
        var y = G.oy + j * G.lane + 6;
        if (o.guides !== false) { ln(ctx, X(b.from), y + 18, X(b.from), G.ry, k.muted, 1.2, [3, 3]); ln(ctx, X(b.to), y + 18, X(b.to), G.ry, k.muted, 1.2, [3, 3]); }
        drawObj(ctx, b, y, k);
      });
      if (o.jumps && objs.length) {
        var b0 = objs[0], n = M.round(b0.to - b0.from);
        for (i = 0; i < n; i++) {
          var xa = X(b0.from + i), xb = X(b0.from + i + 1), mx = (xa + xb) / 2;
          ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa + 2, G.oy + 4); ctx.quadraticCurveTo(mx, G.oy - 22, xb - 2, G.oy + 4); ctx.stroke(); ctx.restore();
          tx(ctx, String(i + 1), mx, G.oy - 12, { size: 12, wt: 800, col: k.purple, halo: k.card });
        }
      }
      say();
    }
    function say() {
      if (!drag && !o.say) { S.say(''); return; }
      var b = objs[0], L = b.to - b.from;
      var s = 'The ' + b.name + ' starts at <b>' + b.from + '</b> and ends at <b>' + b.to + '</b>. ';
      s += b.from === 0 ? 'It starts at 0, so the number at its end tells the length: <b>' + plural(L, u1, uw) + '</b>.' : 'It does not start at 0, so count the spaces under it: ' + b.to + ' − ' + b.from + ' = <b>' + plural(L, u1, uw) + '</b>.';
      S.say(s);
    }
    function move(d) { var b = objs[0], L = b.to - b.from, f = clamp(b.from + d, 0, len - L); if (f !== b.from) { b.from = f; b.to = f + L; draw(); } }
    if (drag) {
      var grab = null;
      V.drag(S.c.cv, {
        touchAction: 'pan-y',
        hit: function (x, y) { var b = objs[0], yy = G.oy + 6; return x >= X(b.from) - 8 && x <= X(b.to) + 8 && y >= yy - 10 && y <= yy + 30 ? 1 : null; },
        start: function (h, x) { grab = x - X(objs[0].from); },
        move: function (h, x) { var f = M.round((x - grab - G.x0) / G.ppu); move(f - objs[0].from); },
        end: function () { grab = null; }
      });
      V.button(S.ctl, '← Slide left', function () { move(-1); });
      V.button(S.ctl, 'Slide right →', function () { move(1); });
      V.button(S.ctl, 'Line it up with 0', function () { move(-objs[0].from); }, 'pri');
    }
    S.live(draw);
    return { update: function () { draw(); } };
  }

  /* ================================================================ g2-graph */
  function iconDraw(ctx, kind, x, y, r, col, edge) {
    if (kind === 'circle') { disc(ctx, x, y, r, col, edge, 1.4); return; }
    if (kind === 'square') { box(ctx, x - r, y - r, 2 * r, 2 * r, 3, col, edge, 1.4); return; }
    if (kind === 'heart') {
      ctx.save(); ctx.beginPath(); ctx.moveTo(x, y + r * 0.9); ctx.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.7, y - r * 1.25, x, y - r * 0.45); ctx.bezierCurveTo(x + r * 0.7, y - r * 1.25, x + r * 1.5, y - r * 0.1, x, y + r * 0.9); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 1.3; ctx.stroke(); ctx.restore(); return;
    }
    if (kind === 'smile') { disc(ctx, x, y, r, col, edge, 1.4); disc(ctx, x - r * 0.35, y - r * 0.25, r * 0.12, edge); disc(ctx, x + r * 0.35, y - r * 0.25, r * 0.12, edge); ctx.save(); ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y + r * 0.05, r * 0.5, 0.2 * M.PI, 0.8 * M.PI); ctx.stroke(); ctx.restore(); return; }
    var pts = []; for (var i = 0; i < 10; i++) { var a = -M.PI / 2 + i * M.PI / 5, rr2 = i % 2 ? r * 0.45 : r; pts.push([x + rr2 * M.cos(a), y + rr2 * M.sin(a)]); }
    poly(ctx, pts, col, edge, 1.2);
  }
  var ICONCH = { star: '★', circle: '●', heart: '♥', square: '■', smile: '☺' };
  function graphFactory(el, o) {
    var S = shell(el, o, { name: 'graph', label: 'A graph', height: 240 });
    var kind = o.kind === 'picture' || o.kind === 'lineplot' ? o.kind : 'bar';
    var cats = (o.cats || ['A', 'B', 'C']).slice(0, 6).map(String), vals = cats.map(function (c, i) { return int((o.vals || [])[i], 0, 0, 50); });
    var data = (o.data || []).map(function (v) { return num(v, 0); });
    var icon = ICONCH[o.icon] ? o.icon : 'star', TT = o.task && typeof o.task === 'object' ? o.task : null, G = {};
    function catCol(k, i) { var nm = cats[i].toLowerCase(); return k.named[nm] || k.kid[i % k.kid.length]; }
    var tvals = TT && Array.isArray(TT.vals) ? TT.vals.map(function (v) { return int(v, 0, 0, 50); }) : null;
    function lab() {
      if (kind === 'lineplot') { var by = {}; data.forEach(function (v) { by[v] = (by[v] || 0) + 1; }); return 'A line plot' + (o.unitLabel ? ' of ' + o.unitLabel : '') + ': ' + Object.keys(by).map(Number).sort(function (a, b) { return a - b; }).map(function (v) { return plural(by[v], 'X') + ' above ' + v; }).join(', '); }
      return (kind === 'picture' ? 'A picture graph' : 'A bar graph') + (o.title ? ' titled ' + o.title : '') + ': ' + cats.map(function (c, i) { return c + ' ' + vals[i]; }).join(', ');
    }
    function geo() {
      var w = S.c.w, ctx = S.ctx;
      if (kind === 'picture') {
        var lw = 0; cats.forEach(function (c) { lw = M.max(lw, tw(ctx, c, font(14, 700))); });
        var mxv = M.max.apply(null, vals.concat([tvals ? M.max.apply(null, tvals) : 0, 1]));
        var room = w - lw - 30, r = clamp(M.floor(room / (2.3 * M.max(mxv, 5)) ), 6, 13);
        G = { lw: lw, r: r, row: 2 * r + 14, x0: lw + 22 };
        S.height(12 + cats.length * G.row + 34);
      } else if (kind === 'bar') {
        var top = int(o.max, 0, 0, 50) || M.max(5, M.ceil((M.max.apply(null, vals.concat(tvals || [], [1])) + 1) / 2) * 2);
        G = { top: top, x0: 44 + (o.yLabel ? 16 : 0), x1: w - 8, y0: 14, h: clamp(w * 0.5, 190, 300) };
        G.y1 = G.y0 + G.h; G.bw = (G.x1 - G.x0) / cats.length;
        S.height(G.y1 + 30 + (o.xLabel ? 22 : 0));
      } else {
        var lo = o.min != null ? num(o.min, 0) : data.length ? M.min.apply(null, data) - 1 : 0, hi = o.max != null ? num(o.max, 10) : data.length ? M.max.apply(null, data) + 1 : lo + 6;
        if (hi <= lo) hi = lo + 6;
        var by = {}, mx = 1; data.forEach(function (v) { by[v] = (by[v] || 0) + 1; mx = M.max(mx, by[v]); });
        var sp = (w - 36) / M.max(1, hi - lo), xs = clamp(M.min(sp * 0.36, 11), 5, 11);
        G = { lo: lo, hi: hi, sp: sp, x0: 18, by: by, xs: xs, st: 2 * xs + 5 };
        G.ay = 14 + mx * G.st + 8;
        S.height(G.ay + 44 + (o.unitLabel ? 18 : 0));
      }
    }
    function draw() {
      geo(); var ctx = S.ctx, k = K(), i, j;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      if (kind === 'picture') {
        cats.forEach(function (c, i) {
          var y = 12 + i * G.row + G.row / 2, col = catCol(k, i);
          if (i) ln(ctx, 8, y - G.row / 2, S.c.w - 8, y - G.row / 2, k.grid, 1);
          tx(ctx, c, G.lw + 8, y, { size: 14, wt: 700, al: 'right', col: k.ink });
          ln(ctx, G.lw + 14, y - G.row / 2 + 3, G.lw + 14, y + G.row / 2 - 3, k.line, 2);
          for (j = 0; j < vals[i]; j++) iconDraw(ctx, icon, G.x0 + G.r + j * (2.3 * G.r), y, G.r, col, k.dk ? '#0f1a14' : 'rgba(0,0,0,.45)');
        });
        var ky = 12 + cats.length * G.row + 16;
        ln(ctx, 8, ky - 16, S.c.w - 8, ky - 16, k.grid, 1);
        iconDraw(ctx, icon, 18, ky, 8, k.kid[0], k.dk ? '#0f1a14' : 'rgba(0,0,0,.45)');
        tx(ctx, o.key || ('Each ' + ICONCH[icon] + ' stands for 1'), 32, ky, { size: 13, wt: 600, al: 'left', col: k.muted });
      } else if (kind === 'bar') {
        var every = int(o.labelEvery, 1, 1, 10);
        for (i = 0; i <= G.top; i++) {
          var y = G.y1 - i / G.top * G.h;
          ln(ctx, G.x0, y, G.x1, y, i ? k.grid : k.axis, i ? 1 : 1.6);
          if (i % every === 0) tx(ctx, String(i), G.x0 - 8, y, { size: 12, wt: 600, al: 'right', col: k.muted });
        }
        ln(ctx, G.x0, G.y0 - 4, G.x0, G.y1, k.axis, 1.6);
        if (o.yLabel) { ctx.save(); ctx.translate(12, G.y0 + G.h / 2); ctx.rotate(-M.PI / 2); tx(ctx, o.yLabel, 0, 0, { size: 12, wt: 700, col: k.muted }); ctx.restore(); }
        cats.forEach(function (c, i) {
          var x = G.x0 + i * G.bw, bw = M.min(G.bw * 0.6, 70), bx = x + (G.bw - bw) / 2, h = vals[i] / G.top * G.h, col = catCol(k, i);
          if (vals[i]) box(ctx, bx, G.y1 - h, bw, h, 3, soft(col, k.dk ? 0.75 : 0.85), col, 1.5);
          var cl = c; while (tw(ctx, cl, font(12, 700)) > G.bw - 4 && cl.length > 3) cl = cl.slice(0, -2) + '…';
          tx(ctx, cl, x + G.bw / 2, G.y1 + 14, { size: 12, wt: 700, col: k.ink });
        });
        if (o.xLabel) tx(ctx, o.xLabel, (G.x0 + G.x1) / 2, G.y1 + 36, { size: 12, wt: 700, col: k.muted });
      } else {
        var X = function (v) { return G.x0 + (v - G.lo) * G.sp; }, ay = G.ay;
        ln(ctx, G.x0 - 8, ay, S.c.w - 10, ay, k.ink, 2);
        for (var v = G.lo; v <= G.hi; v++) { ln(ctx, X(v), ay - 6, X(v), ay + 6, k.ink, 1.6); tx(ctx, String(v), X(v), ay + 18, { size: 13, wt: 700, col: k.ink }); }
        Object.keys(G.by).forEach(function (key) {
          var vv = Number(key), n = G.by[key];
          for (var q = 0; q < n; q++) { var cx = X(vv), cy = ay - 12 - q * G.st, s = G.xs; ln(ctx, cx - s, cy - s, cx + s, cy + s, k.blue, 3); ln(ctx, cx + s, cy - s, cx - s, cy + s, k.blue, 3); }
        });
        if (o.unitLabel) tx(ctx, o.unitLabel, S.c.w / 2, ay + 38, { size: 12, wt: 700, col: k.muted });
      }
      S.label(lab());
      check();
    }
    function check() {
      if (!tvals) return;
      var ok = tvals.every(function (v, i) { return vals[i] === v; });
      S.taskEl.hidden = false; S.taskEl.classList.toggle('g2v-ok', ok);
      S.taskEl.innerHTML = ok ? '✓ The graph matches: ' + cats.map(function (c, i) { return c + ' ' + vals[i]; }).join(', ') + '.' : (TT.text || 'Make the graph match the table.') + ' Use the − and + buttons.';
      el.classList.toggle('g2v-done', ok);
    }
    if (o.edit && kind !== 'lineplot') cats.forEach(function (c, i) { stepper(S.ctl, c, vals[i], 0, 30, function (v) { vals[i] = v; draw(); }); });
    S.live(draw);
    return { update: function () { draw(); } };
  }

  /* ================================================================ g2-array */
  function arrayFactory(el, o) {
    var S = shell(el, o, { name: 'array', label: 'An array', height: 200 });
    var pairs = o.layout === 'pairs', n = int(o.n, 8, 0, 40), rows = int(o.rows, 3, 1, 10), cols = int(o.cols, 4, 1, 12);
    if (pairs) { rows = 2; cols = M.ceil(n / 2); }
    var item = ['dot', 'star', 'heart', 'square', 'apple'].indexOf(o.item) >= 0 ? o.item : 'dot', G = {};
    S.label(o.squares ? 'A rectangle cut into ' + plural(rows, 'row') + ' and ' + plural(cols, 'column') + ' of same-size squares' : pairs ? plural(n, 'object') + ' set out in pairs' : 'An array with ' + plural(rows, 'row') + ' and ' + plural(cols, 'column'));
    function geo() {
      var w = S.c.w, u = M.min(o.squares ? 52 : 46, (w - 24) / M.max(cols, 3)), x0 = (w - u * cols) / 2;
      G = { u: u, x0: x0, y0: 12 }; S.height(24 + u * rows + (pairs ? 8 : 0));
    }
    function draw() {
      geo(); var ctx = S.ctx, k = K(), u = G.u, i, j, col = k.kid[o.color === 'blue' ? 2 : o.color === 'green' ? 3 : 0];
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      if (o.squares) {
        box(ctx, G.x0, G.y0, u * cols, u * rows, 4, soft(k.blue, k.dk ? 0.3 : 0.16), k.blue, 2.5);
        for (i = 1; i < rows; i++) ln(ctx, G.x0, G.y0 + i * u, G.x0 + u * cols, G.y0 + i * u, k.blue, 1.6);
        for (j = 1; j < cols; j++) ln(ctx, G.x0 + j * u, G.y0, G.x0 + j * u, G.y0 + u * rows, k.blue, 1.6);
        return;
      }
      if (o.groups === 'rows') for (i = 0; i < rows; i++) box(ctx, G.x0 + 2, G.y0 + i * u + 3, cols * u - 4, u - 6, (u - 6) / 2, null, k.gold, 2);
      if (o.groups === 'cols') for (j = 0; j < cols; j++) box(ctx, G.x0 + j * u + 3, G.y0 + 2, u - 6, rows * u - 4, (u - 6) / 2, null, k.gold, 2);
      var cnt = 0, edge = k.dk ? '#0f1a14' : 'rgba(0,0,0,.4)';
      for (j = 0; j < cols; j++) for (i = 0; i < rows; i++) {
        if (pairs && cnt >= n) continue;
        var cx = G.x0 + j * u + u / 2, cy = G.y0 + i * u + u / 2, r = u * 0.33;
        if (pairs) cnt++;
        var c = pairs && n % 2 === 1 && cnt === n && o.highlight !== false ? k.kid[1] : col;
        if (item === 'dot' || item === 'apple') { disc(ctx, cx, cy, r, c, edge, 1.4); ctx.save(); ctx.globalAlpha = 0.35; disc(ctx, cx - r * 0.3, cy - r * 0.3, r * 0.28, '#fff'); ctx.restore(); if (item === 'apple') { ln(ctx, cx, cy - r, cx + 2, cy - r - 5, '#7a4b21', 2); disc(ctx, cx + 5, cy - r - 3, 3, '#38b27a'); } }
        else iconDraw(ctx, item === 'star' ? 'star' : item === 'heart' ? 'heart' : 'square', cx, cy, r, c, edge);
      }
    }
    S.live(draw);
    return { update: function () { draw(); } };
  }

  /* ================================================================ g2-shapes */
  var REG = { tri: 3, quad: 4, pent: 5, hex: 6, oct: 8 };
  function shapesFactory(el, o) {
    var S = shell(el, o, { name: 'shapes', label: 'Shapes', height: 180 });
    var items = (o.items || [{ shape: 'rect', parts: 2 }]).slice(0, 4), G = {};
    var NAMES = { circle: 'circle', square: 'square', rect: 'rectangle', tri: 'triangle', quad: 'four-sided shape', pent: 'five-sided shape', hex: 'six-sided shape', oct: 'eight-sided shape', poly: 'shape', cube: 'cube' };
    S.label(o.label || items.map(function (it) { return (it.label ? it.label + ': ' : '') + 'a ' + (NAMES[it.shape] || 'shape') + (it.parts > 1 ? ' cut into ' + it.parts + (it.equal === false ? ' parts that are not the same size' : ' equal parts') : '') + (it.shade ? ', ' + it.shade + ' shaded' : ''); }).join('; '));
    function geo() {
      var w = S.c.w, n = items.length, cell = M.min(200, (w - 8 * (n - 1)) / n), sz = cell - 16;
      G = { cell: cell, sz: sz, x0: (w - (cell * n + 8 * (n - 1))) / 2 };
      var lab = items.some(function (it) { return it.label; });
      S.height(sz * 0.82 + 20 + (lab ? 26 : 0));
      G.h = sz * 0.82;
    }
    function regular(n, cx, cy, r) { var p = []; for (var i = 0; i < n; i++) { var a = -M.PI / 2 + i * TAU / n + (n === 4 ? M.PI / 4 : n === 8 ? M.PI / 8 : 0); p.push([cx + r * M.cos(a), cy + r * M.sin(a)]); } return p; }
    function drawItem(ctx, it, x, y, w, h, k) {
      var fill = soft(k.green, k.dk ? 0.22 : 0.12), edge = k.green, shadeC = soft(k.gold, k.dk ? 0.75 : 0.65), parts = int(it.parts, 1, 1, 8), eq = it.equal !== false, sh = int(it.shade, 0, 0, 8);
      var cx = x + w / 2, cy = y + h / 2;
      if (it.shape === 'cube') {
        var s = (M.min(w, h) - 6) / 1.35, d = s * 0.35, x1 = cx - (s + d) / 2, y1 = cy - (s + d) / 2;
        var F = [[x1, y1 + d], [x1 + s, y1 + d], [x1 + s, y1 + d + s], [x1, y1 + d + s]], B = F.map(function (p) { return [p[0] + d, p[1] - d]; });
        poly(ctx, F, soft(k.green, k.dk ? 0.3 : 0.18), null); poly(ctx, [F[0], B[0], B[1], F[1]], soft(k.green, k.dk ? 0.42 : 0.28), null); poly(ctx, [F[1], B[1], B[2], F[2]], soft(k.green, k.dk ? 0.36 : 0.22), null);
        ln(ctx, B[3][0], B[3][1], B[0][0], B[0][1], k.muted, 1.3, [4, 4]); ln(ctx, B[3][0], B[3][1], B[2][0], B[2][1], k.muted, 1.3, [4, 4]); ln(ctx, B[3][0], B[3][1], F[3][0], F[3][1], k.muted, 1.3, [4, 4]);
        poly(ctx, F, null, edge, 2.2);
        [[F[0], B[0]], [F[1], B[1]], [F[2], B[2]], [B[0], B[1]], [B[1], B[2]]].forEach(function (e) { ln(ctx, e[0][0], e[0][1], e[1][0], e[1][1], edge, 2.2); });
        return;
      }
      if (it.shape === 'circle') {
        var r = M.min(w, h) / 2 - 3;
        disc(ctx, cx, cy, r, fill, null);
        if (parts > 1) {
          var angs = []; for (var i = 0; i <= parts; i++) angs.push(i / parts);
          if (!eq) { angs = parts === 2 ? [0, 0.38, 1] : parts === 3 ? [0, 0.22, 0.6, 1] : [0, 0.15, 0.42, 0.62, 1]; }
          for (i = 0; i < parts; i++) if (i < sh) { ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -M.PI / 2 + angs[i] * TAU, -M.PI / 2 + angs[i + 1] * TAU); ctx.closePath(); ctx.fillStyle = shadeC; ctx.fill(); ctx.restore(); }
          for (i = 0; i < parts; i++) { var a = -M.PI / 2 + angs[i] * TAU; ln(ctx, cx, cy, cx + r * M.cos(a), cy + r * M.sin(a), edge, 2); }
          if (parts === 2 && eq) { var a2 = -M.PI / 2 + 0.5 * TAU; ln(ctx, cx, cy, cx + r * M.cos(a2), cy + r * M.sin(a2), edge, 2); }
        }
        disc(ctx, cx, cy, r, null, edge, 2.5);
        return;
      }
      if (it.shape === 'square' || it.shape === 'rect') {
        var ww = it.shape === 'square' ? M.min(w, h) - 6 : M.min(w - 6, (h - 6) * 1.6), hh = it.shape === 'square' ? ww : M.min(h - 6, ww / 1.6), rx = cx - ww / 2, ry = cy - hh / 2;
        var cells = [], dir = it.dir || 'v';
        if (parts <= 1) cells.push([[rx, ry], [rx + ww, ry], [rx + ww, ry + hh], [rx, ry + hh]]);
        else if (dir === 'diag' && parts === 2) { cells.push([[rx, ry], [rx + ww, ry], [rx + ww, ry + hh]]); cells.push([[rx, ry], [rx + ww, ry + hh], [rx, ry + hh]]); }
        else if (dir === 'x' && parts === 4) { var c0 = [cx, cy]; cells.push([[rx, ry], [rx + ww, ry], c0]); cells.push([[rx + ww, ry], [rx + ww, ry + hh], c0]); cells.push([[rx + ww, ry + hh], [rx, ry + hh], c0]); cells.push([[rx, ry + hh], [rx, ry], c0]); }
        else if (dir === 'grid' && parts === 4) { var mx2 = eq ? 0.5 : 0.36, my2 = eq ? 0.5 : 0.62; [[0, 0, mx2, my2], [mx2, 0, 1, my2], [0, my2, mx2, 1], [mx2, my2, 1, 1]].forEach(function (q) { cells.push([[rx + q[0] * ww, ry + q[1] * hh], [rx + q[2] * ww, ry + q[1] * hh], [rx + q[2] * ww, ry + q[3] * hh], [rx + q[0] * ww, ry + q[3] * hh]]); }); }
        else {
          var cuts = []; for (var c = 0; c <= parts; c++) cuts.push(c / parts);
          if (!eq) cuts = parts === 2 ? [0, 0.34, 1] : parts === 3 ? [0, 0.2, 0.55, 1] : [0, 0.14, 0.38, 0.7, 1];
          for (c = 0; c < parts; c++) {
            if (dir === 'h') cells.push([[rx, ry + cuts[c] * hh], [rx + ww, ry + cuts[c] * hh], [rx + ww, ry + cuts[c + 1] * hh], [rx, ry + cuts[c + 1] * hh]]);
            else cells.push([[rx + cuts[c] * ww, ry], [rx + cuts[c + 1] * ww, ry], [rx + cuts[c + 1] * ww, ry + hh], [rx + cuts[c] * ww, ry + hh]]);
          }
        }
        cells.forEach(function (cl, i) { poly(ctx, cl, i < sh ? shadeC : fill, edge, 2); });
        box(ctx, rx, ry, ww, hh, 0, null, edge, 2.5);
        return;
      }
      var pts;
      if (it.shape === 'poly' && Array.isArray(it.pts) && it.pts.length >= 3) {
        var sc2 = M.min((w - 8) / 10, (h - 8) / 8); pts = it.pts.map(function (p) { return [cx + (num(p[0], 0) - 5) * sc2, cy - (num(p[1], 0) - 4) * sc2]; });
      } else pts = regular(REG[it.shape] || 3, cx, cy + (it.shape === 'tri' ? h * 0.08 : 0), M.min(w, h) / 2 - 4);
      poly(ctx, pts, fill, edge, 2.5);
      if (it.corners) pts.forEach(function (p) { disc(ctx, p[0], p[1], 4.5, k.red); });
    }
    function draw() {
      geo(); var ctx = S.ctx, k = K(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      items.forEach(function (it, i) {
        var x = G.x0 + i * (G.cell + 8);
        drawItem(ctx, it, x + 8, 10, G.cell - 16, G.h, k);
        if (it.label) tx(ctx, it.label, x + G.cell / 2, 10 + G.h + 18, { size: 15, wt: 800, col: k.ink });
      });
    }
    S.live(draw);
    return { update: function () { draw(); } };
  }

  /* ================================================================ g2-line */
  function lineFactory(el, o) {
    var S = shell(el, o, { name: 'line', label: 'A number line', height: 110 });
    var lo = num(o.min, 0), hi = num(o.max, 10), step = M.abs(num(o.step, 1)) || 1; if (hi <= lo) hi = lo + 10 * step;
    var n = M.round((hi - lo) / step), labels = o.labels || 'all';
    var pts = (o.points || []).map(function (p, i) { return { v: num(p.v, lo), text: p.text != null ? String(p.text) : '', color: p.color || ['red', 'blue', 'purple', 'orange'][i % 4] }; });
    var hops = (o.hops || []).map(function (h) { var f = num(h.from, lo), t = num(h.to, f + step); return { from: f, to: t, text: h.text != null ? String(h.text) : (t >= f ? '+' : '−') + M.abs(t - f) }; });
    function labeled(v, i) { if (labels === 'all') return true; if (labels === 'ends') return i === 0 || i === n; if (Array.isArray(labels)) return labels.some(function (x) { return M.abs(num(x, NaN) - v) < 1e-9; }); return false; }
    var shown = []; for (var i = 0; i <= n; i++) if (labeled(lo + i * step, i)) shown.push(lo + i * step);
    S.label('A number line from ' + lo + ' to ' + hi + ' with tick marks every ' + step + (labels !== 'all' ? '; the numbers shown are ' + list(shown.map(String)) : '') +
      (pts.length ? '; ' + pts.map(function (p) { return 'a dot labeled ' + (p.text === '?' ? 'with a question mark' : p.text || 'with no word') + (p.text === '?' ? '' : ''); }).join(', ') : '') +
      (hops.length ? '; jumps: ' + hops.map(function (h) { return h.text.replace('-', 'minus ').replace('−', 'minus ').replace('+', 'plus ') + ' from ' + h.from + ' to ' + h.to; }).join(', ') : ''));
    var G = {};
    function geo() { var w = S.c.w; G = { x0: 22, x1: w - 22, y: 20 + (hops.length ? 50 : 0) + (pts.some(function (p) { return p.text; }) ? 30 : 6) }; if (hops.length && pts.some(function (p) { return p.text; })) G.y = M.max(G.y, 96); S.height(G.y + 40); }
    function X(v) { return G.x0 + (v - lo) / (hi - lo) * (G.x1 - G.x0); }
    function draw() {
      geo(); var ctx = S.ctx, k = K(), y = G.y;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      ln(ctx, G.x0 - 14, y, G.x1 + 14, y, k.ink, 2);
      poly(ctx, [[G.x0 - 20, y], [G.x0 - 11, y - 5], [G.x0 - 11, y + 5]], k.ink); poly(ctx, [[G.x1 + 20, y], [G.x1 + 11, y - 5], [G.x1 + 11, y + 5]], k.ink);
      var px = (G.x1 - G.x0) / n, fs = px < 26 ? 11 : 13;
      for (var i = 0; i <= n; i++) {
        var v = lo + i * step, x = X(v), lab = labeled(v, i);
        ln(ctx, x, y - (lab ? 9 : 7), x, y + (lab ? 9 : 7), k.ink, lab ? 2 : 1.5);
        if (lab && (labels !== 'all' || px >= 22 || i % 2 === 0 || i === n)) tx(ctx, String(+v.toFixed(6)), x, y + 22, { size: fs, wt: 700, col: k.ink });
      }
      hops.forEach(function (h) {
        var xa = X(h.from), xb = X(h.to), mid = (xa + xb) / 2, hh = M.min(34, M.abs(xb - xa) / 2 + 10);
        ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(xa, y - 4); ctx.quadraticCurveTo(mid, y - 4 - hh * 2, xb, y - 4); ctx.stroke(); ctx.restore();
        var ang = M.atan2(2 * hh, xb - mid), hs = 10;
        poly(ctx, [[xb, y - 4], [xb - hs * M.cos(ang - 0.42), y - 4 - hs * M.sin(ang - 0.42)], [xb - hs * M.cos(ang + 0.42), y - 4 - hs * M.sin(ang + 0.42)]], k.purple);
      });
      pts.forEach(function (p) {
        var x = X(p.v), col = k[p.color] || p.color;
        disc(ctx, x, y, 7, col, k.card, 2);
        if (p.text) { box(ctx, x - 18, y - 46, 36, 28, 7, k.card, col, 1.6); tx(ctx, p.text, x, y - 32, { size: 15, wt: 800, col: p.text === '?' ? k.gold : k.ink }); }
      });
      // jump labels last, so a dot's label never hides them; short jumps put their label up high
      var placed = pts.filter(function (p) { return p.text; }).map(function (p) { return [X(p.v) - 20, y - 48, X(p.v) + 20, y - 16]; });
      hops.forEach(function (h) {
        var xa = X(h.from), xb = X(h.to), mid = (xa + xb) / 2, hh = M.min(34, M.abs(xb - xa) / 2 + 10), ly = y - 10 - hh, wd = tw(ctx, h.text, font(13, 800)) / 2 + 3;
        for (var tries = 0; tries < 6; tries++) {
          var r = [mid - wd, ly - 9, mid + wd, ly + 9];
          if (!placed.some(function (q) { return r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]; })) break;
          ly = M.min(ly, y - 48) - 12;
        }
        placed.push([mid - wd, ly - 9, mid + wd, ly + 9]);
        tx(ctx, h.text, mid, ly, { size: 13, wt: 800, col: k.purple, halo: k.card });
      });
    }
    S.live(draw);
    return { update: function () { draw(); } };
  }

  function boot() {
    if (!ML.viz || boot.done) return; boot.done = true; V = ML.viz;
    V.register('g2-blocks', blocksFactory);
    V.register('g2-coins', coinsFactory);
    V.register('g2-ruler', rulerFactory);
    V.register('g2-graph', graphFactory);
    V.register('g2-array', arrayFactory);
    V.register('g2-shapes', shapesFactory);
    V.register('g2-line', lineFactory);
  }
  ML.g2viz = { coins: COIN };
  if (ML.viz) boot(); else D.addEventListener('DOMContentLoaded', boot);
})(window, document);
