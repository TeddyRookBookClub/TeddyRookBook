/* Math Ladder visuals for Real Analysis (course key ra). Registered on window.MathLadder.viz; needs viz/core.js and the
   site's CAS (homeschool/calc/cas.js); uses the frame styles of viz/adv.css (Real Analysis pages load both). Styles for
   these visuals are injected below. Formulas are CAS strings ("1-1/n", "(2n+1)/(n+3)", "x^n*(1-x)", "sqrt(x)").

   Shared options (all nine visuals)
     task      an instruction line above the picture (HTML and $…$ allowed)
     label     the aria-label (a sensible one is built when it is missing)
     height    canvas height in px (default: follows the width)
     edit      false: a still picture (no sliders, buttons or dragging)
     quiet     true (or readout: false): hide every number or verdict a problem might ask for (each visual lists what
               quiet hides). Lessons leave it off; generators pass quiet: true and edit: false.
   Keyboard: focus a picture (Tab), then the arrow keys move its main handle (N, δ, the point, the bound …); sliders and
   buttons work as usual. Touch and mouse drag the same handles. prefers-reduced-motion: no animation.

   ra-supinf    A set on the number line: its elements, its upper bounds (shaded), sup and inf, and the ε-test.
     opts: seq: "1-1/n" (terms for n = 1 … nmax), nmax: 40; intervals: [[a, b, aClosed, bClosed], …]; points: [x, …]
           sup, inf: CAS strings to mark (or null: none marked); eps: 0.1 (the ε-test band (sup − ε, sup]; null: off)
           bound: a draggable candidate upper bound at this x (null: none); closure: false (true: hollow gold rings at
                  limit points that are not in the set; give them in limits: [x, …])
           xmin, xmax (default: fit the set)
     quiet hides the sup and inf labels, the ε readout and the verdict on the candidate bound.
   ra-diagonal  Cantor's diagonal argument, or the diagonal listing of pairs of positive integers.
     opts: mode: "diagonal" | "pairing"; rows: ["31415", "27182", …] (digits after the point, diagonal mode)
           size: 6 (pairing: an m-by-n grid); steps: true (Step / Show all buttons; false: everything at once)
     quiet: diagonal mode hides the new digits; pairing mode shows only positions 1 to 6.
   ra-epsband   Terms of a sequence with the ε-band around L and a movable N.
     opts: f: "(2n+1)/(n+3)", L: "2", eps: 0.1, N: 5 (null: no marker), nmax: 40, ymin, ymax
           mode: "limit" (band around L; terms from N on green inside, red outside) | "cauchy" (the spread of the
                 terms from N on, compared with ε) | "tails" (tail suprema and infima: lim sup and lim inf) | "plain"
           sub: [a, b] (highlight the subsequence n ≡ b mod a)
     quiet hides the verdict, the smallest working N and every value.
   ra-cobweb    Iterating x → g(x): the graph of g, the line y = x and the cobweb path from x0.
     opts: g: "sqrt(2+x)", x0: 0 (draggable), steps: 3 (a Step button adds more), xmin, xmax, ymin, ymax (default fit)
     quiet hides the readout of the iterates' values (the path itself stays, as a picture).
   ra-epsdelta  The ε–δ box: an ε-band around L, a δ-window around a, and which part of the graph escapes.
     opts: f: "x^2", a: 2, L: null (default f(a)), eps: 0.5, delta: 0.3 (null: start at the largest δ, or 0.3 when quiet)
           mode: "point" | "uniform" (a: draggable along interval [lo, hi]; a strip shows the best δ at each point)
           interval: [0, 3], punct: false (draw a hole at a), xmin…ymax
     quiet hides the largest δ and the verdict.
   ra-sums      Upper and lower sums for a partition, with the gap U − L shaded.
     opts: f: "x^2", a: 0, b: 2, n: 4 (equal pieces) or P: [0, 0.5, 1, 2] (a partition), show: "both" | "upper" |
           "lower" | "gap"; jump: {at: 1, left: 0, right: 1} (a step function instead of f); ymin, ymax
     quiet hides U, L and U − L.
   ra-unifband  A sequence of functions fₙ, its limit f and the band f ± ε, with the sup norm marked.
     opts: fn: "x^n" (CAS in x and n), f: "0" (the limit), n: 3, nmax: 40, eps: 0.1 (null: no band), ghosts: true
           xmin: 0, xmax: 1, ymin, ymax
     quiet hides ‖fₙ − f‖ and the verdict (the marker stays, unlabeled).
   ra-balls     Open balls in ℝ² for the taxicab, Euclidean and max metrics.
     opts: p: [0, 0] (draggable), q: [3, 2] (draggable; null: none), r: 2, metric: "all" | 1 | 2 | "inf"
           square: null (s: draw the open square (0, s)², and the largest ball around p inside it)
     quiet hides the distances and the verdicts.
   ra-cover     An open cover of an interval and a finite subcover.
     opts: a: 0, b: 4, intervals: [[-0.2, 1.1], …] (open intervals), mode: "cover" | "inv" (the cover (1/n, 2) of (0, 1])
           nmax: 12 (inv), steps: true (a Find button runs the greedy choice)
     quiet hides the count.                                                                                          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/ra.js: load viz/core.js first'); return; }
  var M = Math, mk = V.el, fm = V.fmt;

  (function css() {
    if (D.getElementById('ra-viz-css')) return;
    var s = D.createElement('style'); s.id = 'ra-viz-css';
    s.textContent = [
      '.rav .rav-row{display:flex;flex-wrap:wrap;gap:.45rem .8rem;align-items:center;margin:.55rem 0 0}',
      '.rav .rav-key{display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-size:.82rem;color:var(--mv-muted);margin:.35rem 0 0}',
      '.rav .rav-key i{display:inline-block;width:1.1em;height:.6em;border-radius:3px;vertical-align:0;margin-right:.35em;background:var(--c)}',
      '.rav .rav-ok{color:#00703c;font-weight:700}.rav .rav-bad{color:#c2410c;font-weight:700}',
      'html[data-theme="dark"] .rav .rav-ok{color:#6cc79a}html[data-theme="dark"] .rav .rav-bad{color:#ffa94d}',
      '.rav .rav-tblw{max-width:100%;overflow-x:auto;padding:.15rem 0}',
      '.rav table.rav-dg{border-collapse:separate;border-spacing:3px;margin:0 auto;font:600 1rem ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
      '.rav table.rav-dg th{font:600 .8rem system-ui,sans-serif;color:var(--mv-muted);padding:0 .35rem;text-align:right;white-space:nowrap}',
      '.rav table.rav-dg td{min-width:1.7em;height:1.9em;text-align:center;border-radius:6px;background:var(--mv-card);border:1px solid var(--mv-line);padding:0 .1rem}',
      '.rav table.rav-dg td.dg{background:rgba(184,150,62,.25);border-color:#b8963e}',
      '.rav table.rav-dg td.dim{color:var(--mv-muted)}',
      '.rav table.rav-dg td.new{background:rgba(0,112,60,.16);border-color:#00703c}',
      'html[data-theme="dark"] .rav table.rav-dg td.new{background:rgba(108,199,154,.2);border-color:#6cc79a}',
      '.rav table.rav-dg td.pos{font:600 .85rem system-ui,sans-serif;min-width:2.1em}',
      '.rav table.rav-dg td.pos.cur{outline:3px solid #b8963e;outline-offset:-2px}',
      '.rav .rav-x{margin:.6rem 0 0;text-align:center;font:600 1.05rem ui-monospace,Menlo,Consolas,monospace;overflow-wrap:anywhere}',
      '@media (max-width:480px){.rav table.rav-dg{font-size:.88rem}.rav table.rav-dg td{min-width:1.45em;height:1.7em}}'
    ].join('\n');
    D.head.appendChild(s);
  })();

  // ---------------------------------------------------------------- helpers
  function num(v, d) { if (v === null || v === undefined || v === '') return d; if (typeof v === 'number') return isFinite(v) ? v : d; try { var x = W.CAS.evalNum(W.CAS.parse(String(v))); if (x && typeof x === 'object') x = x.re; return isFinite(x) ? x : d; } catch (e) { return d; } }
  var CC = {};
  function cf(src, vars) { // compiled CAS function; returns NaN on failure
    var key = src + '|' + vars.join(','); if (CC[key]) return CC[key];
    var f; try { var c = W.CAS.compile(W.CAS.parse(String(src)), vars); f = function () { try { var y = c.apply(null, arguments); if (y && typeof y === 'object') y = M.abs(y.im) < 1e-12 ? y.re : NaN; return y; } catch (e) { return NaN; } }; } catch (e) { f = function () { return NaN; }; }
    return (CC[key] = f);
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function frame(el, o, label) {
    el.classList.add('mla', 'rav'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), edit: o.edit !== false };
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'mla-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl); if (!F.edit) F.ctl.hidden = true;
    F.key = mk('div', 'rav-key'); el.appendChild(F.key);
    F.out = V.readout(el);
    F.say = function (h) { F.out.set(h); };
    F.done = function (ok) { if (F.task) F.task.classList.toggle('ok', !!ok); };
    F.canvas = function (q) { q = q || {}; return V.canvas(F.box, { aspect: q.aspect || 1.7, min: q.min || 190, max: q.max || 430, height: o.height || q.height }); };
    F.legend = function (items) { F.key.innerHTML = items.map(function (it) { return '<span><i style="--c:' + it[0] + '"></i>' + it[1] + '</span>'; }).join(''); };
    return F;
  }
  function keyNav(cv, label, fn) { // arrow keys -> fn(dir, big)
    cv.tabIndex = 0; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', label);
    cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (!d) return; e.preventDefault(); fn(d, e.shiftKey, e.key); });
  }
  function txt(ctx, s, x, y, o) { o = o || {}; var k = V.colors(); ctx.save(); ctx.font = (o.bold ? '700 ' : '600 ') + (o.size || 12) + 'px system-ui,sans-serif'; ctx.fillStyle = o.color || k.muted; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y); ctx.restore(); }
  function pill(ctx, s, x, y, col, W0, o) {
    o = o || {}; var k = V.colors(); ctx.save(); ctx.font = '700 ' + (o.size || 12) + 'px system-ui,sans-serif';
    var w = ctx.measureText(s).width, h = (o.size || 12) + 6, bx = clamp(x - w / 2 - 5, 2, (W0 || 1e5) - w - 12), by = y - h / 2;
    ctx.fillStyle = k.bg; ctx.globalAlpha = 0.9; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, w + 10, h, 6); else ctx.rect(bx, by, w + 10, h); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = col; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 5, by + h / 2 + 0.5); ctx.restore();
  }
  function dot(ctx, x, y, r, fill, stroke) { ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * M.PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
  function hband(c, P, y0, y1, col) { var ctx = c.ctx; ctx.save(); ctx.fillStyle = col; ctx.fillRect(0, M.min(P.Y(y0), P.Y(y1)), c.w, M.abs(P.Y(y1) - P.Y(y0))); ctx.restore(); }
  function vband(c, P, x0, x1, col) { var ctx = c.ctx; ctx.save(); ctx.fillStyle = col; ctx.fillRect(M.min(P.X(x0), P.X(x1)), 0, M.abs(P.X(x1) - P.X(x0)), c.h); ctx.restore(); }
  function hline(c, P, y, col, dash, w) { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(0, P.Y(y)); ctx.lineTo(c.w, P.Y(y)); ctx.stroke(); ctx.restore(); }
  function vline(c, P, x, col, dash, w) { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(P.X(x), 0); ctx.lineTo(P.X(x), c.h); ctx.stroke(); ctx.restore(); }
  function fitY(vals, pad) { var lo = Infinity, hi = -Infinity; vals.forEach(function (v) { if (isFinite(v)) { lo = M.min(lo, v); hi = M.max(hi, v); } }); if (!isFinite(lo)) { lo = -1; hi = 1; } if (hi - lo < 1e-9) { lo -= 1; hi += 1; } var p = (hi - lo) * (pad || 0.12); return [lo - p, hi + p]; }
  function redraw(c, fn) { c.onResize(fn); V.onTheme(fn); }

  // ================================================================ ra-supinf
  V.register('ra-supinf', function (el, o) {
    o = Object.assign({ seq: null, nmax: 40, intervals: [], points: [], sup: null, inf: null, eps: null, bound: null, closure: false, limits: [] }, o || {});
    var F = frame(el, o, 'A set on the number line with its supremum'), c = F.canvas({ aspect: 3.2, min: 150, max: 230 });
    var seq = o.seq ? cf(o.seq, ['n']) : null, terms = [];
    if (seq) for (var n = 1; n <= o.nmax; n++) { var t = seq(n); if (isFinite(t)) terms.push(t); }
    var ivs = (o.intervals || []).map(function (I) { return [num(I[0], 0), num(I[1], 1), !!I[2], !!I[3]]; }), pts = (o.points || []).map(function (x) { return num(x, 0); });
    var sup = o.sup === null || o.sup === undefined ? null : num(o.sup, null), inf = o.inf === null || o.inf === undefined ? null : num(o.inf, null);
    var all = terms.concat(pts); ivs.forEach(function (I) { all.push(I[0], I[1]); }); if (sup !== null) all.push(sup); if (inf !== null) all.push(inf);
    var lo = o.xmin !== undefined ? num(o.xmin, 0) : M.min.apply(null, all), hi = o.xmax !== undefined ? num(o.xmax, 1) : M.max.apply(null, all), pad = (hi - lo) * 0.12 || 1;
    if (o.xmin === undefined) lo -= pad; if (o.xmax === undefined) hi += pad;
    var P = V.plane(c, { xmin: lo, xmax: hi, ymin: -1, ymax: 1 }), S = { eps: o.eps === null ? null : num(o.eps, 0.1), b: o.bound === null ? null : num(o.bound, 0) };
    var limits = (o.limits || []).map(function (x) { return num(x, 0); });
    if (F.edit && S.eps !== null) V.slider(F.ctl, { label: 'ε', min: 0.01, max: M.max(0.02, (hi - lo) / 2), step: 0.01, value: S.eps, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.eps = v; draw(); } });
    if (F.edit && S.b !== null) V.drag(c.cv, { hit: function (px) { return M.abs(px - P.X(S.b)) < 22 ? 1 : null; }, move: function (h, px) { S.b = clamp(P.x(px), lo, hi); draw(); } });
    keyNav(c.cv, 'Number line with the set', function (d, big) { if (!F.edit) return; if (S.b !== null) S.b = clamp(S.b + d * (hi - lo) / (big ? 20 : 200), lo, hi); else if (S.eps !== null) S.eps = clamp(S.eps * (d > 0 ? 1.15 : 0.87), 0.002, hi - lo); draw(); });
    function inSet(x) { if (terms.some(function (t) { return M.abs(t - x) < 1e-12; }) || pts.some(function (t) { return M.abs(t - x) < 1e-12; })) return true; return ivs.some(function (I) { return (x > I[0] && x < I[1]) || (I[2] && M.abs(x - I[0]) < 1e-12) || (I[3] && M.abs(x - I[1]) < 1e-12); }); }
    function setMax() { var m = -Infinity; terms.concat(pts).forEach(function (t) { m = M.max(m, t); }); ivs.forEach(function (I) { m = M.max(m, I[1]); }); return m; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, y0 = c.h * 0.55; P.clear();
      // upper bounds region
      var s = sup !== null ? sup : null;
      if (s !== null) { ctx.save(); ctx.fillStyle = k.goldSoft; ctx.fillRect(P.X(s), y0 - 26, c.w - P.X(s), 52); ctx.restore(); if (!F.quiet) txt(ctx, 'upper bounds', c.w - 8, y0 + 38, { color: k.gold, size: 11, align: 'right' }); }
      if (S.eps !== null && s !== null) { ctx.save(); ctx.fillStyle = k.blueSoft; ctx.fillRect(P.X(s - S.eps), y0 - 14, P.X(s) - P.X(s - S.eps), 28); ctx.restore(); }
      // axis and ticks
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(4, y0); ctx.lineTo(c.w - 4, y0); ctx.stroke(); ctx.restore();
      var step = (function () { var raw = (hi - lo) / M.max(3, c.w / 70), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; })();
      for (var x = M.ceil(lo / step) * step; x <= hi; x += step) { ctx.save(); ctx.strokeStyle = k.axis; ctx.beginPath(); ctx.moveTo(P.X(x), y0 - 5); ctx.lineTo(P.X(x), y0 + 5); ctx.stroke(); ctx.restore(); if (P.X(x) > 16 && P.X(x) < c.w - 16) txt(ctx, fm(x, 4), P.X(x), y0 + 18, { align: 'center', size: 11 }); }
      // intervals
      ivs.forEach(function (I) { ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(P.X(I[0]), y0); ctx.lineTo(P.X(I[1]), y0); ctx.stroke(); ctx.restore(); dot(ctx, P.X(I[0]), y0, 6, I[2] ? k.blue : k.bg, k.blue); dot(ctx, P.X(I[1]), y0, 6, I[3] ? k.blue : k.bg, k.blue); });
      // points and terms
      pts.forEach(function (t) { dot(ctx, P.X(t), y0, 5, k.blue); });
      terms.forEach(function (t) { var inE = S.eps !== null && s !== null && t > s - S.eps && t <= s + 1e-12; dot(ctx, P.X(t), y0, 3.6, inE ? k.green : k.blue); });
      if (o.closure) limits.forEach(function (t) { if (!inSet(t)) dot(ctx, P.X(t), y0, 7, null, k.gold); });
      // sup and inf
      if (!F.quiet) {
        if (s !== null) { vline(c, P, s, k.gold, [5, 4], 2); pill(ctx, 'sup = ' + fm(s, 4), P.X(s), 14, k.gold, c.w); }
        if (inf !== null) { vline(c, P, inf, k.purple, [5, 4], 2); pill(ctx, 'inf = ' + fm(inf, 4), P.X(inf), c.h - 14, k.purple, c.w); }
      }
      if (S.b !== null) { var bx = P.X(S.b); ctx.save(); ctx.fillStyle = k.red; ctx.beginPath(); ctx.moveTo(bx, y0 - 30); ctx.lineTo(bx - 8, y0 - 44); ctx.lineTo(bx + 8, y0 - 44); ctx.closePath(); ctx.fill(); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, y0 - 30); ctx.lineTo(bx, y0 + 26); ctx.stroke(); ctx.restore(); txt(ctx, 'b', bx + 10, y0 - 40, { color: k.red, bold: true }); }
      // readout
      var msg = [];
      if (!F.quiet && S.b !== null) { var mx = setMax(), ub = S.b >= mx - 1e-9; msg.push('Candidate $b = ' + fm(S.b, 3) + '$: ' + (ub ? '<span class="rav-ok">an upper bound</span>' : '<span class="rav-bad">not an upper bound</span> (some element is bigger)') + (ub && s !== null ? (S.b - s < 1e-6 ? ', and the least one.' : ', but not the least: $\\sup = ' + fm(s, 4) + '$ is smaller.') : '.')); }
      if (!F.quiet && S.eps !== null && s !== null) { var hit = terms.concat(pts).filter(function (t) { return t > s - S.eps && t <= s + 1e-12; }); ivs.forEach(function (I) { if (I[1] > s - S.eps) hit.push(I[1]); }); msg.push('ε-test with $\\varepsilon = ' + fm(S.eps, 3) + '$: ' + (hit.length ? '<span class="rav-ok">some element lies in $(\\sup - \\varepsilon, \\sup]$</span>' + (terms.length ? ' (' + hit.length + (hit.length === 1 ? ' term' : ' terms') + ' shown in green)' : '') : '<span class="rav-bad">no element shown is that close</span> (try more terms)')); }
      F.say(msg.join('<br>'));
      c.cv.setAttribute('aria-label', 'Number line from ' + fm(lo, 3) + ' to ' + fm(hi, 3) + (F.quiet || s === null ? '' : ', supremum ' + fm(s, 4)));
    }
    var leg = [[V.colors().blue, 'elements']]; if (sup !== null) leg.push([V.colors().goldSoft, 'upper bounds']); if (S.eps !== null) leg.push([V.colors().blueSoft, '(sup − ε, sup]']); F.legend(leg);
    redraw(c, draw); draw();
  });

  // ================================================================ ra-diagonal
  V.register('ra-diagonal', function (el, o) {
    o = Object.assign({ mode: 'diagonal', rows: ['31415', '27182', '14142', '16180', '57721'], size: 6, steps: true }, o || {});
    var F = frame(el, o, o.mode === 'pairing' ? 'The diagonal listing of pairs of positive integers' : 'Cantor\'s diagonal argument');
    var wrap = mk('div', 'rav-tblw'); F.box.appendChild(wrap); wrap.tabIndex = 0; wrap.setAttribute('role', 'region');
    var line = mk('p', 'rav-x'); F.box.appendChild(line); line.setAttribute('aria-live', 'polite');
    if (o.mode === 'pairing') {
      var n = M.max(3, M.min(8, o.size | 0 || 6)), total = n * (n + 1) / 2, shown = (o.steps && F.edit) ? 1 : (F.quiet ? 6 : total);
      var pos = function (m, k) { var s = m + k; return (s - 2) * (s - 1) / 2 + m; };
      var draw = function () {
        var h = '<table class="rav-dg" aria-label="Positions of the pairs (m, n)"><tr><th>m \\ n</th>'; for (var k = 1; k <= n; k++) h += '<th style="text-align:center">' + k + '</th>'; h += '</tr>';
        for (var m = 1; m <= n; m++) { h += '<tr><th>' + m + '</th>'; for (var k2 = 1; k2 <= n; k2++) { var p = pos(m, k2), vis = m + k2 <= n + 1 && p <= shown; h += '<td class="pos' + (p === shown && !F.quiet && o.steps && F.edit ? ' cur' : '') + (vis ? '' : ' dim') + '">' + (vis ? p : '·') + '</td>'; } h += '</tr>'; }
        wrap.innerHTML = h + '</table>';
        line.textContent = F.quiet ? '' : (shown >= total ? 'Each diagonal m + n = s holds s − 1 pairs; together they list every pair exactly once.' : 'Next: position ' + (shown + 1) + '.');
        F.say(F.quiet ? '' : 'Listed so far: ' + shown + ' of the ' + total + ' pairs with m + n ≤ ' + (n + 1) + '.');
      };
      if (o.steps && F.edit) { V.button(F.ctl, 'Next pair', function () { shown = M.min(total, shown + 1); draw(); }, 'pri'); V.button(F.ctl, 'Show all', function () { shown = total; draw(); }); V.button(F.ctl, 'Start over', function () { shown = 1; draw(); }); }
      wrap.setAttribute('aria-label', 'Grid of pairs'); draw(); return;
    }
    var rows = (o.rows || []).map(String).filter(Boolean).slice(0, 8), k0 = rows.length, done = (o.steps && F.edit) ? 0 : k0;
    var nd = M.max.apply(null, rows.map(function (r) { return r.length; }));
    function draw2() {
      var h = '<table class="rav-dg" aria-label="The listed numbers, digit by digit">';
      rows.forEach(function (r, i) { h += '<tr><th>x<sub>' + (i + 1) + '</sub> = 0.</th>'; for (var j = 0; j < nd; j++) h += '<td class="' + (i === j ? 'dg' : '') + '">' + (r[j] || '') + '</td>'; h += '<td class="dim">…</td></tr>'; });
      h += '<tr><th>x = 0.</th>'; for (var j2 = 0; j2 < nd; j2++) { var vis = j2 < done && j2 < k0; h += '<td class="' + (vis ? 'new' : 'dim') + '">' + (vis && !F.quiet ? (rows[j2][j2] === '5' ? '4' : '5') : (j2 < k0 ? '?' : '')) + '</td>'; } h += '<td class="dim">…</td></tr></table>';
      wrap.innerHTML = h;
      line.textContent = F.quiet ? 'Rule: the kth digit of x is 4 if the kth digit of xₖ is 5, and 5 otherwise.' : done >= k0 ? 'x differs from x₁ in digit 1, from x₂ in digit 2, …: it is on no line of the list.' : 'Digit ' + (done + 1) + ': look at digit ' + (done + 1) + ' of x' + (done + 1) + '.';
      F.say(F.quiet ? '' : done ? 'x = 0.' + rows.slice(0, done).map(function (r, i) { return r[i] === '5' ? '4' : '5'; }).join('') + '…' : 'Press Next digit to build x.');
    }
    if (o.steps && F.edit) { V.button(F.ctl, 'Next digit', function () { done = M.min(k0, done + 1); draw2(); }, 'pri'); V.button(F.ctl, 'Show all', function () { done = k0; draw2(); }); V.button(F.ctl, 'Start over', function () { done = 0; draw2(); }); }
    wrap.setAttribute('aria-label', 'Table of digits'); draw2();
  });

  // ================================================================ ra-epsband
  V.register('ra-epsband', function (el, o) {
    o = Object.assign({ f: '1/n', L: null, eps: 0.1, N: null, nmax: 40, mode: 'limit', sub: null }, o || {});
    var mode = /^(limit|cauchy|tails|plain)$/.test(o.mode) ? o.mode : 'limit';
    var F = frame(el, o, mode === 'tails' ? 'Terms of a sequence with their tail suprema and infima' : 'Terms of a sequence with an ε-band'), c = F.canvas({ aspect: 1.8 });
    var f = cf(o.f, ['n']), nmax = M.max(8, M.min(400, o.nmax | 0 || 40)), a = []; for (var n = 1; n <= nmax; n++) a.push(f(n));
    var aT = mode === 'tails' ? a.slice() : a; if (mode === 'tails') for (var n2 = nmax + 1; n2 <= 4 * nmax; n2++) aT.push(f(n2)); // tails look past the last term shown
    var L = o.L === null || o.L === undefined ? null : num(o.L, 0), S = { eps: o.eps === null ? null : num(o.eps, 0.1), N: o.N === null || o.N === undefined ? null : clamp(o.N | 0, 1, nmax) };
    if (S.N === null && F.edit && mode !== 'plain' && mode !== 'tails') S.N = M.max(1, M.round(nmax / 4));
    var yr = fitY(a.concat(L !== null ? [L] : []).filter(function (v) { return M.abs(v) < 1e6; })); if (o.ymin !== undefined) yr[0] = num(o.ymin, yr[0]); if (o.ymax !== undefined) yr[1] = num(o.ymax, yr[1]);
    var P = V.plane(c, { xmin: -nmax * 0.04, xmax: nmax * 1.03, ymin: yr[0], ymax: yr[1] });
    if (F.edit && S.eps !== null && mode !== 'tails' && mode !== 'plain') V.slider(F.ctl, { label: 'ε', min: 0.001, max: M.max(0.01, (yr[1] - yr[0]) / 2), step: 0.001, value: S.eps, fmt: function (v) { return fm(v, 3); }, input: function (v) { S.eps = v; draw(); } });
    var NS = (F.edit && S.N !== null) ? V.slider(F.ctl, { label: 'N', min: 1, max: nmax, step: 1, value: S.N, input: function (v) { S.N = v; draw(); } }) : null;
    if (F.edit && S.N !== null) V.drag(c.cv, { hit: function (px) { return M.abs(px - P.X(S.N)) < 24 ? 1 : null; }, move: function (h, px) { S.N = clamp(M.round(P.x(px)), 1, nmax); if (NS) NS.set(S.N); draw(); } });
    keyNav(c.cv, 'Plot of the terms', function (d, big) { if (!F.edit || S.N === null) return; S.N = clamp(S.N + d * (big ? 5 : 1), 1, nmax); if (NS) NS.set(S.N); draw(); });
    function inSub(n) { return o.sub && ((n - o.sub[1]) % o.sub[0] + o.sub[0]) % o.sub[0] === 0; }
    function inside(v) { return M.abs(v - L) < S.eps - 1e-9; } // strict |aₙ − L| < ε, with room for rounding (45/25 − 2 is not < 0.2)
    function smallestN() { if (L === null || S.eps === null) return null; var last = 0; for (var i = 0; i < a.length; i++) if (!inside(a[i])) last = i + 1; return last < a.length ? last + 1 : null; }
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear(); P.grid({ minor: false }); P.axes({ x: 'n', y: 'aₙ' });
      if (mode === 'limit' && L !== null) { if (S.eps !== null) hband(c, P, L - S.eps, L + S.eps, k.goldSoft); hline(c, P, L, k.gold, [6, 4], 2); if (!F.quiet || true) txt(ctx, 'L', c.w - 14, P.Y(L) - 9, { color: k.gold, bold: true }); }
      if (S.N !== null && mode !== 'tails') { vband(c, P, S.N - 0.5, nmax + 1, k.greenSoft.replace(/[\d.]+\)$/, '0.08)')); vline(c, P, S.N - 0.5, k.green, [4, 3], 2); txt(ctx, 'N = ' + S.N, M.min(c.w - 50, P.X(S.N - 0.5) + 5), 12, { color: k.green, bold: true }); }
      var spread = null;
      if (mode === 'cauchy' && S.N !== null) { var mn = Infinity, mx = -Infinity; for (var i = S.N - 1; i < a.length; i++) { mn = M.min(mn, a[i]); mx = M.max(mx, a[i]); } spread = mx - mn; ctx.save(); ctx.fillStyle = spread < S.eps ? k.greenSoft : k.redSoft; ctx.fillRect(P.X(S.N - 0.5), P.Y(mx), c.w - P.X(S.N - 0.5), P.Y(mn) - P.Y(mx)); ctx.restore(); hline(c, P, mx, k.muted, [3, 3], 1); hline(c, P, mn, k.muted, [3, 3], 1); }
      if (mode === 'tails') { ctx.save(); [['sup', k.red], ['inf', k.blue]].forEach(function (q) { ctx.strokeStyle = q[1]; ctx.lineWidth = 2; ctx.beginPath(); for (var j = 0; j < a.length; j++) { var t = q[0] === 'sup' ? -Infinity : Infinity; for (var m = j; m < aT.length; m++) t = q[0] === 'sup' ? M.max(t, aT[m]) : M.min(t, aT[m]); var X = P.X(j + 1), Y = P.Y(t); if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.stroke(); }); ctx.restore(); }
      for (var j = 0; j < a.length; j++) { var x = P.X(j + 1), y = P.Y(a[j]); if (!isFinite(y)) continue; var col = k.blue;
        if (mode === 'limit' && L !== null && S.N !== null && S.eps !== null && j + 1 >= S.N) col = inside(a[j]) ? k.green : k.red;
        if (inSub(j + 1)) col = k.purple; dot(ctx, x, y, nmax > 120 ? 2.2 : 3.6, col); }
      var msg = '';
      if (!F.quiet) {
        if (mode === 'limit' && L !== null && S.N !== null && S.eps !== null) { var bad = []; for (var i2 = S.N - 1; i2 < a.length; i2++) if (!inside(a[i2])) bad.push(i2 + 1); var sN = smallestN(); msg = bad.length ? '<span class="rav-bad">N = ' + S.N + ' fails</span>: $|a_{' + bad[0] + '} - L| = ' + fm(M.abs(a[bad[0] - 1] - L), 4) + ' \\ge \\varepsilon$.' : '<span class="rav-ok">N = ' + S.N + ' works</span> for the terms shown: from $n = ' + S.N + '$ on, every term is within $\\varepsilon = ' + fm(S.eps, 3) + '$ of $L$.'; if (sN) msg += ' Smallest N that works here: ' + sN + '.'; }
        else if (mode === 'cauchy' && spread !== null) msg = 'From $n = ' + S.N + '$ on, the terms shown spread over a width of $' + fm(spread, 4) + '$: ' + (spread < S.eps ? '<span class="rav-ok">less than ε</span>, so every pair is within ε.' : '<span class="rav-bad">not less than ε</span>, so some pair is ε or more apart.');
        else if (mode === 'tails') msg = 'Red: tail suprema $\\sup\\{a_k : k \\ge n\\}$, falling toward $\\limsup a_n$. Blue: tail infima, rising toward $\\liminf a_n$.';
      }
      F.say(msg); F.done(mode === 'limit' && S.N !== null && !F.quiet && smallestN() !== null && S.N >= smallestN());
      c.cv.setAttribute('aria-label', 'Terms a1 to a' + nmax + (L !== null ? ', limit ' + fm(L, 4) : '') + (S.N !== null ? ', N = ' + S.N : ''));
    }
    var k0 = V.colors(); F.legend(mode === 'tails' ? [[k0.blue, 'terms'], [k0.red, 'tail sup'], [k0.blue, 'tail inf']] : mode === 'limit' && L !== null ? [[k0.goldSoft, 'ε-band around L'], [k0.green, 'inside, n ≥ N'], [k0.red, 'outside, n ≥ N']].concat(o.sub ? [[k0.purple, 'subsequence']] : []) : [[k0.blue, 'terms']].concat(o.sub ? [[k0.purple, 'subsequence']] : []));
    redraw(c, draw); draw();
  });

  // ================================================================ ra-cobweb
  V.register('ra-cobweb', function (el, o) {
    o = Object.assign({ g: 'sqrt(2+x)', x0: 0, steps: 3 }, o || {});
    var F = frame(el, o, 'Cobweb diagram of an iteration'), c = F.canvas({ aspect: 1.25, max: 420 }), g = cf(o.g, ['x']), S = { x0: num(o.x0, 0), k: M.max(0, o.steps | 0) };
    var xs = [S.x0]; for (var i = 0; i < 30; i++) xs.push(g(xs[i]));
    var lo = o.xmin !== undefined ? num(o.xmin, 0) : M.min.apply(null, xs.filter(isFinite).concat([S.x0])), hi = o.xmax !== undefined ? num(o.xmax, 1) : M.max.apply(null, xs.filter(isFinite));
    var sp = hi - lo || 1; if (o.xmin === undefined) lo -= sp * 0.15; if (o.xmax === undefined) hi += sp * 0.15; if (o.xmax !== undefined) hi += (hi - lo) * 0.12;
    var P = V.plane(c, { xmin: lo, xmax: hi, ymin: o.ymin !== undefined ? num(o.ymin, lo) : lo, ymax: o.ymax !== undefined ? num(o.ymax, hi) : hi });
    if (F.edit) { V.button(F.ctl, 'Step', function () { S.k = M.min(30, S.k + 1); draw(); }, 'pri'); V.button(F.ctl, 'Start over', function () { S.k = 0; draw(); });
      V.drag(c.cv, { hit: function (px, py) { return M.abs(px - P.X(S.x0)) < 22 && M.abs(py - P.Y(0)) < 40 ? 1 : M.abs(px - P.X(S.x0)) < 14 ? 1 : null; }, move: function (h, px) { S.x0 = clamp(P.x(px), lo, hi); draw(); } }); }
    keyNav(c.cv, 'Cobweb diagram', function (d, big) { if (!F.edit) return; if (big) S.k = clamp(S.k + d, 0, 30); else S.x0 = clamp(S.x0 + d * (hi - lo) / 100, lo, hi); draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear(); P.grid({ minor: false }); P.axes({ x: 'x', y: 'y' });
      P.plot(function (x) { return x; }, { color: k.muted, width: 1.5, dash: [5, 4] }); P.plot(g, { color: k.blue, width: 2.5 });
      var x = S.x0, pts = [x]; ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(P.X(x), P.Y(0 > P.o.ymin ? 0 : P.o.ymin));
      for (var i = 0; i < S.k; i++) { var y = g(x); if (!isFinite(y)) break; ctx.lineTo(P.X(x), P.Y(y)); ctx.lineTo(P.X(y), P.Y(y)); x = y; pts.push(x); }
      ctx.stroke(); ctx.restore();
      dot(ctx, P.X(S.x0), P.Y(P.o.ymin <= 0 && P.o.ymax >= 0 ? 0 : P.o.ymin), 6, k.red);
      txt(ctx, 'y = x', c.w - 46, P.Y(hi * 0.97) + 12, { color: k.muted, size: 11 }); txt(ctx, 'y = g(x)', 8, 14, { color: k.blue, bold: true, size: 12 });
      if (!F.quiet) F.say('$x_0 = ' + fm(S.x0, 4) + '$' + pts.slice(1, 6).map(function (v, i) { return ', $x_{' + (i + 1) + '} = ' + fm(v, 5) + '$'; }).join('') + (pts.length > 6 ? ', …, $x_{' + (pts.length - 1) + '} = ' + fm(pts[pts.length - 1], 6) + '$' : '') + '. Up to $g(x_n)$, then across to the line $y = x$: that is the next $x$.');
      else F.say('');
      c.cv.setAttribute('aria-label', 'Graph of g with the line y = x and ' + S.k + ' cobweb steps from x0 = ' + fm(S.x0, 3));
    }
    var k1 = V.colors(); F.legend([[k1.blue, 'y = g(x)'], [k1.muted, 'y = x'], [k1.red, 'iterates']]);
    redraw(c, draw); draw();
  });

  // ================================================================ ra-epsdelta
  function bestDelta(f, a, L, eps, span, punct) { // largest δ (numerically) with |f(x) − L| < ε for 0 < |x − a| < δ
    function ok(t) { for (var j = 1; j <= 120; j++) { var x1 = a + t * j / 120, x2 = a - t * j / 120; if (!(M.abs(f(x1) - L) < eps) || !(M.abs(f(x2) - L) < eps)) return false; } return true; }
    var lo = 0, hi = span; if (ok(hi)) return hi; for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; } return lo;
  }
  V.register('ra-epsdelta', function (el, o) {
    o = Object.assign({ f: 'x^2', a: 2, L: null, eps: 0.5, delta: null, mode: 'point', interval: [0, 3], punct: false }, o || {});
    var uni = o.mode === 'uniform', F = frame(el, o, uni ? 'Uniform continuity: the best δ at each point' : 'An ε–δ picture for a limit'), c = F.canvas({ aspect: uni ? 1.45 : 1.6 });
    var f = cf(o.f, ['x']), S = { a: num(o.a, 2), eps: num(o.eps, 0.5), d: o.delta === null ? null : num(o.delta, 0.3) }, I = (o.interval || [0, 3]).map(function (v) { return num(v, 0); });
    function Lval() { return uni ? f(S.a) : (o.L === null || o.L === undefined ? f(S.a) : num(o.L, f(S.a))); }
    var span0 = uni ? (I[1] - I[0]) : M.max(1, M.abs(S.a) * 0.6 + 1);
    if (S.d === null) S.d = F.quiet ? 0 : M.max(1e-3, bestDelta(f, S.a, Lval(), S.eps, span0));
    var xmin = o.xmin !== undefined ? num(o.xmin, 0) : uni ? I[0] - (I[1] - I[0]) * 0.08 : S.a - span0, xmax = o.xmax !== undefined ? num(o.xmax, 1) : uni ? I[1] + (I[1] - I[0]) * 0.08 : S.a + span0;
    var ys = []; for (var i = 0; i <= 60; i++) ys.push(f(xmin + (xmax - xmin) * i / 60)); var yr = fitY(ys.concat([Lval() - S.eps, Lval() + S.eps]), 0.08);
    if (o.ymin !== undefined) yr[0] = num(o.ymin, yr[0]); if (o.ymax !== undefined) yr[1] = num(o.ymax, yr[1]);
    if (uni && F.edit) yr[0] -= (yr[1] - yr[0]) * 48 / M.max(100, c.h - 48); // room under the axis labels for the best-δ strip
    var P = V.plane(c, { xmin: xmin, xmax: xmax, ymin: yr[0], ymax: yr[1] });
    if (F.edit) {
      V.slider(F.ctl, { label: 'ε', min: 0.01, max: M.max(0.05, (yr[1] - yr[0]) / 2), step: 0.01, value: S.eps, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.eps = v; draw(); } });
      var DS = V.slider(F.ctl, { label: 'δ', min: 0.001, max: M.max(0.01, span0), step: 0.001, value: S.d, fmt: function (v) { return fm(v, 3); }, input: function (v) { S.d = v; draw(); } });
      if (!F.quiet) V.button(F.ctl, 'Largest δ', function () { S.d = M.max(1e-3, bestDelta(f, S.a, Lval(), S.eps, span0)); DS.set(S.d); draw(); });
      if (uni) V.drag(c.cv, { hit: function (px) { return M.abs(px - P.X(S.a)) < 24 ? 1 : null; }, move: function (h, px) { S.a = clamp(P.x(px), I[0], I[1]); draw(); } });
    }
    keyNav(c.cv, 'Graph with an epsilon band and a delta window', function (d, big) { if (!F.edit) return; if (uni && !big) S.a = clamp(S.a + d * (I[1] - I[0]) / 60, I[0], I[1]); else { S.d = clamp(S.d * (d > 0 ? 1.1 : 0.9), 1e-3, span0); if (DS) DS.set(S.d); } draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, L = Lval(), a = S.a, d = S.d; P.clear(); P.grid({ minor: false }); P.axes({});
      hband(c, P, L - S.eps, L + S.eps, k.goldSoft); if (d > 0) vband(c, P, a - d, a + d, k.blueSoft);
      P.plot(f, { color: k.muted, width: 2 });
      // the part over the δ-window: green inside the band, red outside
      ctx.save(); ctx.lineWidth = 4; ctx.lineCap = 'round'; var N = d > 0 ? 160 : -1, prevOk = null, px0, py0, bad = false;
      for (var j = 0; j <= N; j++) { var x = a - d + 2 * d * j / N, y = f(x), okp = M.abs(y - L) < S.eps || (o.punct && M.abs(x - a) < 1e-12); if (!okp) bad = true; if (j) { ctx.strokeStyle = okp && prevOk ? k.green : k.red; ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(P.X(x), P.Y(y)); ctx.stroke(); } prevOk = okp; px0 = P.X(x); py0 = P.Y(y); }
      ctx.restore();
      hline(c, P, L, k.gold, [6, 4], 1.5); vline(c, P, a, k.blue, [6, 4], 1.5);
      if (o.punct) dot(ctx, P.X(a), P.Y(f(a + 1e-9)), 5, k.bg, k.ink);
      dot(ctx, P.X(a), P.Y(L), uni ? 6 : 4, uni ? k.blue : null, uni ? null : k.gold);
      txt(ctx, 'L ± ε', c.w - 8, P.Y(L + S.eps) - 8, { color: k.gold, bold: true, size: 11, align: 'right' }); if (d > 0) txt(ctx, 'a ± δ', M.min(c.w - 44, P.X(a + d) + 4), c.h - 10, { color: k.blue, bold: true, size: 11 });
      if (uni) { // strip: best δ at each point of the interval
        var hS = 34, top = c.h - hS - 2, vals = [], mx = 0; for (var q = 0; q <= 60; q++) { var xa = I[0] + (I[1] - I[0]) * q / 60, bd = bestDelta(f, xa, f(xa), S.eps, (I[1] - I[0])); vals.push(bd); mx = M.max(mx, bd); }
        ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = k.panel; ctx.fillRect(P.X(I[0]), top, P.X(I[1]) - P.X(I[0]), hS); ctx.fillStyle = k.purple; vals.forEach(function (v, q) { var X = P.X(I[0] + (I[1] - I[0]) * q / 60), hh = mx ? (hS - 4) * v / mx : 0; ctx.fillRect(X - 2, top + hS - hh, 4, hh); }); ctx.restore();
        txt(ctx, 'best δ at each point', P.X(I[0]) + 4, top + 8, { color: k.purple, size: 10, bold: true });
        S.minBest = M.min.apply(null, vals);
      }
      var bd2 = F.quiet ? null : bestDelta(f, a, L, S.eps, span0);
      F.say(F.quiet ? '' : (bad ? '<span class="rav-bad">This δ is too big</span>: part of the graph over the window leaves the ε-band (red).' : '<span class="rav-ok">This δ works</span>: over the whole window the graph stays in the band.') + ' Largest δ here ≈ ' + fm(bd2, 4) + (uni ? '; smallest of the best δ\'s over the interval ≈ ' + fm(S.minBest, 4) + ' (one δ for every point).' : '.'));
      F.done(!bad && !F.quiet);
      c.cv.setAttribute('aria-label', 'Graph of f near ' + fm(a, 3) + ' with ε = ' + fm(S.eps, 3) + ' and δ = ' + fm(d, 3));
    }
    var k2 = V.colors(); F.legend([[k2.goldSoft, 'ε-band around L'], [k2.blueSoft, 'δ-window around a'], [k2.green, 'inside the band'], [k2.red, 'escapes']].concat(uni ? [[k2.purple, 'best δ at each point']] : []));
    redraw(c, draw); draw();
  });

  // ================================================================ ra-sums
  V.register('ra-sums', function (el, o) {
    o = Object.assign({ f: 'x^2', a: 0, b: 2, n: 4, P: null, show: 'both', jump: null }, o || {});
    var F = frame(el, o, 'Upper and lower sums'), c = F.canvas({ aspect: 1.7 }), a = num(o.a, 0), b = num(o.b, 2);
    var J = o.jump, f = J ? function (x) { return x < J.at ? J.left : J.right; } : cf(o.f, ['x']);
    var S = { P: o.P ? o.P.map(function (v) { return num(v, 0); }) : null, n: M.max(1, o.n | 0 || 4), show: o.show };
    function part() { if (S.P) return S.P; var p = []; for (var i = 0; i <= S.n; i++) p.push(a + (b - a) * i / S.n); return p; }
    function supinf(x0, x1) { var mx = -Infinity, mn = Infinity, N = 160; for (var j = 0; j <= N; j++) { var y = f(x0 + (x1 - x0) * j / N); if (isFinite(y)) { mx = M.max(mx, y); mn = M.min(mn, y); } } if (J && J.at > x0 && J.at < x1) { mx = M.max(mx, J.left, J.right); mn = M.min(mn, J.left, J.right); } if (J && J.at === x1) { mx = M.max(mx, J.right); mn = M.min(mn, J.right); } return [mx, mn]; }
    var ys = []; for (var i = 0; i <= 80; i++) ys.push(f(a + (b - a) * i / 80)); var yr = fitY(ys.concat([0]), 0.1); if (o.ymin !== undefined) yr[0] = num(o.ymin, yr[0]); if (o.ymax !== undefined) yr[1] = num(o.ymax, yr[1]);
    var P = V.plane(c, { xmin: a - (b - a) * 0.06, xmax: b + (b - a) * 0.06, ymin: yr[0], ymax: yr[1] });
    if (F.edit) {
      V.seg(F.ctl, { label: 'Show', items: [['both', 'Both'], ['upper', 'Upper'], ['lower', 'Lower'], ['gap', 'Gap U − L']], value: S.show, change: function (v) { S.show = v; draw(); } });
      V.slider(F.ctl, { label: 'pieces n', min: 1, max: 64, step: 1, value: S.P ? S.P.length - 1 : S.n, input: function (v) { S.P = null; S.n = v; draw(); } });
      V.button(F.ctl, 'Refine (add midpoints)', function () { var p = part(), q = []; p.forEach(function (x, i) { if (i) q.push((p[i - 1] + x) / 2); q.push(x); }); S.P = q; draw(); });
    }
    keyNav(c.cv, 'Graph with upper and lower rectangles', function (d) { if (!F.edit) return; S.P = null; S.n = clamp(S.n + d, 1, 64); draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, p = part(), U = 0, Lw = 0; P.clear(); P.grid({ minor: false }); P.axes({});
      for (var i = 1; i < p.length; i++) {
        var si = supinf(p[i - 1], p[i]), x0 = P.X(p[i - 1]), x1 = P.X(p[i]), w = p[i] - p[i - 1]; U += si[0] * w; Lw += si[1] * w;
        ctx.save();
        if (S.show === 'both' || S.show === 'upper') { ctx.fillStyle = k.blueSoft; ctx.strokeStyle = k.blue; ctx.lineWidth = 1.2; if (S.show === 'upper') ctx.fillRect(x0, P.Y(si[0]), x1 - x0, P.Y(0) - P.Y(si[0])); ctx.strokeRect(x0, P.Y(si[0]), x1 - x0, P.Y(0) - P.Y(si[0])); }
        if (S.show === 'both' || S.show === 'lower') { ctx.fillStyle = k.greenSoft; ctx.strokeStyle = k.green; ctx.lineWidth = 1.2; ctx.fillRect(x0, P.Y(si[1]), x1 - x0, P.Y(0) - P.Y(si[1])); ctx.strokeRect(x0, P.Y(si[1]), x1 - x0, P.Y(0) - P.Y(si[1])); }
        if (S.show === 'gap' || S.show === 'both') { ctx.fillStyle = k.goldSoft; ctx.fillRect(x0, P.Y(si[0]), x1 - x0, P.Y(si[1]) - P.Y(si[0])); if (S.show === 'gap') { ctx.strokeStyle = k.gold; ctx.lineWidth = 1.5; ctx.strokeRect(x0, P.Y(si[0]), x1 - x0, P.Y(si[1]) - P.Y(si[0])); } }
        ctx.restore();
      }
      if (J) { ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(P.X(a), P.Y(J.left)); ctx.lineTo(P.X(J.at), P.Y(J.left)); ctx.moveTo(P.X(J.at), P.Y(J.right)); ctx.lineTo(P.X(b), P.Y(J.right)); ctx.stroke(); ctx.restore(); dot(ctx, P.X(J.at), P.Y(J.left), 4.5, k.bg, k.ink); dot(ctx, P.X(J.at), P.Y(J.right), 4.5, k.ink); }
      else P.plot(f, { color: k.ink, width: 2.2, from: a, to: b });
      p.forEach(function (x) { ctx.save(); ctx.strokeStyle = k.muted; ctx.beginPath(); ctx.moveTo(P.X(x), P.Y(0) - 4); ctx.lineTo(P.X(x), P.Y(0) + 4); ctx.stroke(); ctx.restore(); });
      F.say(F.quiet ? '' : '$U(f, P) = ' + fm(U, 4) + '$, $L(f, P) = ' + fm(Lw, 4) + '$, gap $U - L = ' + fm(U - Lw, 4) + '$ with ' + (p.length - 1) + ' piece' + (p.length === 2 ? '' : 's') + '.');
      c.cv.setAttribute('aria-label', 'Upper and lower sums with ' + (p.length - 1) + ' pieces');
    }
    var k3 = V.colors(); F.legend([[k3.blueSoft, 'upper sum U'], [k3.greenSoft, 'lower sum L'], [k3.goldSoft, 'gap U − L']]);
    redraw(c, draw); draw();
  });

  // ================================================================ ra-unifband
  V.register('ra-unifband', function (el, o) {
    o = Object.assign({ fn: 'x^n', f: '0', n: 3, nmax: 40, eps: 0.1, ghosts: true, xmin: 0, xmax: 1 }, o || {});
    var F = frame(el, o, 'A sequence of functions and the band around its limit'), c = F.canvas({ aspect: 1.7 });
    var fn = cf(o.fn, ['x', 'n']), noLim = o.f === null, f = noLim ? function () { return NaN; } : cf(o.f || '0', ['x']), S = { n: clamp(o.n | 0 || 3, 1, o.nmax), eps: o.eps === null || o.eps === undefined || o.f === null ? null : num(o.eps, 0.1) }, xmin = num(o.xmin, 0), xmax = num(o.xmax, 1);
    var ys = []; for (var nn = 1; nn <= 6; nn++) for (var i = 0; i <= 40; i++) ys.push(fn(xmin + (xmax - xmin) * i / 40, nn)); for (var i2 = 0; i2 <= 40; i2++) ys.push(f(xmin + (xmax - xmin) * i2 / 40));
    var yr = fitY(ys.filter(function (v) { return M.abs(v) < 50; }), 0.1); if (o.ymin !== undefined) yr[0] = num(o.ymin, yr[0]); if (o.ymax !== undefined) yr[1] = num(o.ymax, yr[1]);
    var P = V.plane(c, { xmin: xmin - (xmax - xmin) * 0.04, xmax: xmax + (xmax - xmin) * 0.04, ymin: yr[0], ymax: yr[1] });
    var NS = F.edit ? V.slider(F.ctl, { label: 'n', min: 1, max: o.nmax, step: 1, value: S.n, input: function (v) { S.n = v; draw(); } }) : null;
    if (F.edit && S.eps !== null) V.slider(F.ctl, { label: 'ε', min: 0.01, max: M.max(0.05, (yr[1] - yr[0]) / 2), step: 0.01, value: S.eps, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.eps = v; draw(); } });
    keyNav(c.cv, 'Graphs of f_n and f', function (d, big) { if (!F.edit) return; S.n = clamp(S.n + d * (big ? 5 : 1), 1, o.nmax); if (NS) NS.set(S.n); draw(); });
    function norm(n) { var best = -1, bx = xmin, N = 600; for (var j = 0; j <= N; j++) { var x = xmin + (xmax - xmin) * j / N, d = M.abs(fn(x, n) - f(x)); if (isFinite(d) && d > best) { best = d; bx = x; } } return [best, bx]; }
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear(); P.grid({ minor: false }); P.axes({});
      if (S.eps !== null) { ctx.save(); ctx.fillStyle = k.goldSoft; ctx.beginPath(); var N = 200, j; for (j = 0; j <= N; j++) { var x = xmin + (xmax - xmin) * j / N; ctx.lineTo(P.X(x), P.Y(f(x) + S.eps)); } for (j = N; j >= 0; j--) { var x2 = xmin + (xmax - xmin) * j / N; ctx.lineTo(P.X(x2), P.Y(f(x2) - S.eps)); } ctx.closePath(); ctx.fill(); ctx.restore(); }
      if (o.ghosts) for (var g = M.max(1, S.n - 4); g < S.n; g++) P.plot(function (x) { return fn(x, g); }, { color: k.blueSoft, width: 1.5, from: xmin, to: xmax });
      P.plot(f, { color: k.gold, width: 2.5, dash: [6, 4], from: xmin, to: xmax });
      P.plot(function (x) { return fn(x, S.n); }, { color: k.blue, width: 2.5, from: xmin, to: xmax });
      if (noLim) { txt(ctx, 'n = ' + S.n, 8, 14, { color: k.blue, bold: true }); F.say(F.quiet ? '' : 'Watch the value at one fixed $x$ as $n$ grows: that is pointwise convergence.'); return; }
      var nm = norm(S.n), bx = nm[1]; ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(P.X(bx), P.Y(f(bx))); ctx.lineTo(P.X(bx), P.Y(fn(bx, S.n))); ctx.stroke(); ctx.restore();
      if (!F.quiet) pill(ctx, '‖fₙ − f‖ ≈ ' + fm(nm[0], 4), P.X(bx), M.max(14, M.min(c.h - 14, (P.Y(f(bx)) + P.Y(fn(bx, S.n))) / 2)), k.red, c.w);
      txt(ctx, 'n = ' + S.n, 8, 14, { color: k.blue, bold: true });
      var inside = S.eps !== null && nm[0] < S.eps;
      F.say(F.quiet ? '' : 'Largest gap between $f_{' + S.n + '}$ and $f$: $\\|f_{' + S.n + '} - f\\| \\approx ' + fm(nm[0], 4) + '$ (red).' + (S.eps !== null ? ' ' + (inside ? '<span class="rav-ok">The whole graph of $f_{' + S.n + '}$ is inside the band.</span>' : '<span class="rav-bad">Part of $f_{' + S.n + '}$ leaves the band.</span>') : ''));
      F.done(!F.quiet && inside);
      c.cv.setAttribute('aria-label', 'Graph of f_' + S.n + ' and its limit f' + (S.eps !== null ? ' with a band of width ' + fm(S.eps, 3) : ''));
    }
    var k4 = V.colors(), lg = [[k4.blue, 'fₙ']]; if (o.ghosts) lg.push([k4.blueSoft, 'earlier fₙ']); if (!noLim) { lg.push([k4.gold, 'limit f']); if (S.eps !== null) lg.push([k4.goldSoft, 'band f ± ε']); lg.push([k4.red, 'largest gap']); } F.legend(lg);
    redraw(c, draw); draw();
  });

  // ================================================================ ra-balls
  V.register('ra-balls', function (el, o) {
    o = Object.assign({ p: [0, 0], q: [3, 2], r: 2, metric: 'all', square: null }, o || {});
    var F = frame(el, o, 'Open balls for three metrics on the plane'), c = F.canvas({ aspect: 1.25, max: 420 });
    var S = { p: [num(o.p[0], 0), num(o.p[1], 0)], q: o.q ? [num(o.q[0], 3), num(o.q[1], 2)] : null, r: num(o.r, 2) }, sq = o.square ? num(o.square, 6) : null, met = String(o.metric);
    var pts = [S.p[0], S.p[1]].concat(S.q || []), lo = M.min.apply(null, pts.concat([sq !== null ? 0 : 0])) - S.r - 1.2, hi = M.max.apply(null, pts.concat([sq !== null ? sq : 0])) + S.r + 1.2;
    if (sq !== null) { lo = -1; hi = sq + 1; }
    var P = V.plane(c, { xmin: lo, xmax: hi, ymin: lo, ymax: hi, equal: true });
    if (F.edit) { V.slider(F.ctl, { label: 'radius r', min: 0.1, max: M.max(1, (hi - lo) / 2), step: 0.1, value: S.r, fmt: function (v) { return fm(v, 1); }, input: function (v) { S.r = v; draw(); } });
      V.drag(c.cv, { hit: function (px, py) { if (S.q && M.hypot(px - P.X(S.q[0]), py - P.Y(S.q[1])) < 20) return 'q'; if (M.hypot(px - P.X(S.p[0]), py - P.Y(S.p[1])) < 20) return 'p'; return null; }, move: function (h, px, py) { var x = M.round(P.x(px) * 2) / 2, y = M.round(P.y(py) * 2) / 2; S[h] = [clamp(x, lo, hi), clamp(y, lo, hi)]; draw(); } }); }
    var sel = 'p'; keyNav(c.cv, 'Balls around a point', function (d, big, key) { if (!F.edit) return; if (big && S.q) sel = sel === 'p' ? 'q' : 'p'; var h = S[sel]; if (key === 'ArrowLeft' || key === 'ArrowRight') h[0] = clamp(h[0] + d * 0.5, lo, hi); else h[1] = clamp(h[1] + d * 0.5, lo, hi); draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, p = S.p, r = S.r; P.clear(); P.grid({ minor: false }); P.axes({});
      if (sq !== null) { ctx.save(); ctx.strokeStyle = k.ink; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.strokeRect(P.X(0), P.Y(sq), P.X(sq) - P.X(0), P.Y(0) - P.Y(sq)); ctx.restore(); }
      var show = function (m) { return met === 'all' || met === String(m); };
      ctx.save(); ctx.lineWidth = 2.2; ctx.setLineDash([5, 3]);
      if (show('inf')) { ctx.strokeStyle = k.purple; ctx.fillStyle = k.purpleSoft; ctx.beginPath(); ctx.rect(P.X(p[0] - r), P.Y(p[1] + r), P.X(p[0] + r) - P.X(p[0] - r), P.Y(p[1] - r) - P.Y(p[1] + r)); ctx.fill(); ctx.stroke(); }
      if (show(2)) { ctx.strokeStyle = k.blue; ctx.fillStyle = k.blueSoft; ctx.beginPath(); ctx.arc(P.X(p[0]), P.Y(p[1]), P.X(p[0] + r) - P.X(p[0]), 0, 2 * M.PI); ctx.fill(); ctx.stroke(); }
      if (show(1)) { ctx.strokeStyle = k.green; ctx.fillStyle = k.greenSoft; ctx.beginPath(); ctx.moveTo(P.X(p[0] + r), P.Y(p[1])); ctx.lineTo(P.X(p[0]), P.Y(p[1] + r)); ctx.lineTo(P.X(p[0] - r), P.Y(p[1])); ctx.lineTo(P.X(p[0]), P.Y(p[1] - r)); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.restore();
      dot(ctx, P.X(p[0]), P.Y(p[1]), 6, k.ink); txt(ctx, 'P', P.X(p[0]) + 9, P.Y(p[1]) - 10, { color: k.ink, bold: true });
      var msg = '';
      if (S.q) { var q = S.q, dx = M.abs(q[0] - p[0]), dy = M.abs(q[1] - p[1]), d1 = dx + dy, d2 = M.hypot(dx, dy), di = M.max(dx, dy);
        ctx.save(); ctx.strokeStyle = k.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(P.X(p[0]), P.Y(p[1])); ctx.lineTo(P.X(q[0]), P.Y(p[1])); ctx.lineTo(P.X(q[0]), P.Y(q[1])); ctx.stroke(); ctx.restore();
        dot(ctx, P.X(q[0]), P.Y(q[1]), 6, k.red); txt(ctx, 'Q', P.X(q[0]) + 9, P.Y(q[1]) - 10, { color: k.red, bold: true });
        if (!F.quiet) msg = '$d_1(P, Q) = ' + fm(d1, 3) + '$, $d_2(P, Q) = ' + fm(d2, 3) + '$, $d_\\infty(P, Q) = ' + fm(di, 3) + '$. Inside the ball of radius $' + fm(r, 2) + '$: ' + [['d_1', d1], ['d_2', d2], ['d_\\infty', di]].map(function (z) { return '$' + z[0] + '$ ' + (z[1] < r ? '<span class="rav-ok">yes</span>' : '<span class="rav-bad">no</span>'); }).join(', ') + '.'; }
      if (sq !== null && !F.quiet) { var room = M.min(p[0], p[1], sq - p[0], sq - p[1]); msg += (msg ? ' ' : '') + 'Room to the nearest side of the square: $' + fm(room, 3) + '$, ' + (r <= room + 1e-9 ? '<span class="rav-ok">so this ball fits inside</span>.' : '<span class="rav-bad">so this ball sticks out</span>.'); }
      F.say(msg); c.cv.setAttribute('aria-label', 'Balls of radius ' + fm(r, 2) + ' around P = (' + fm(p[0], 2) + ', ' + fm(p[1], 2) + ')');
    }
    var k5 = V.colors(), leg = []; if (met === 'all' || met === '1') leg.push([k5.green, 'd₁ ball (diamond)']); if (met === 'all' || met === '2') leg.push([k5.blue, 'd₂ ball (disk)']); if (met === 'all' || met === 'inf') leg.push([k5.purple, 'd∞ ball (square)']); F.legend(leg);
    redraw(c, draw); draw();
  });

  // ================================================================ ra-cover
  V.register('ra-cover', function (el, o) {
    o = Object.assign({ a: 0, b: 4, intervals: [[-0.3, 1.2], [0.9, 2.1], [1.8, 3.3], [3, 4.5], [0.5, 1.5], [2.5, 3.6]], mode: 'cover', nmax: 12, steps: true }, o || {});
    var inv = o.mode === 'inv', F = frame(el, o, inv ? 'The open cover (1/n, 2) of (0, 1]' : 'An open cover of a closed interval');
    var c = F.canvas({ aspect: 1.9, min: 150, height: 14 + 20 * (inv ? M.max(1, o.nmax | 0) : (o.intervals || []).length) + 52 }); // rows of 20px, then the axis
    var a = num(o.a, 0), b = num(o.b, 4), ivs = inv ? [] : (o.intervals || []).map(function (I) { return [num(I[0], 0), num(I[1], 1)]; }), S = { chosen: null, n: inv ? M.min(5, o.nmax) : 0 };
    if (inv) { a = 0; b = 1; }
    function greedy() { var p = a, out = [], guard = 0; while (guard++ < 60) { var best = -1; ivs.forEach(function (I, i) { if (I[0] < p && I[1] > p && (best < 0 || I[1] > ivs[best][1])) best = i; }); if (best < 0) return null; out.push(best); if (ivs[best][1] > b) return out; p = ivs[best][1]; } return null; }
    var lo = M.min(a, M.min.apply(null, ivs.map(function (I) { return I[0]; }).concat([a]))) - 0.25, hi = M.max(b, M.max.apply(null, ivs.map(function (I) { return I[1]; }).concat([b]))) + 0.25;
    if (inv) { lo = -0.08; hi = 2.45; } // room for the labels to the right of 2
    var P = V.plane(c, { xmin: lo, xmax: hi, ymin: 0, ymax: 1 });
    if (F.edit && !inv) { V.button(F.ctl, 'Find a finite subcover', function () { S.chosen = greedy(); draw(); }, 'pri'); V.button(F.ctl, 'Show all', function () { S.chosen = null; draw(); }); }
    var NS = (F.edit && inv) ? V.slider(F.ctl, { label: 'intervals used', min: 1, max: o.nmax, step: 1, value: S.n, input: function (v) { S.n = v; draw(); } }) : null;
    keyNav(c.cv, 'Intervals covering a set', function (d) { if (!F.edit || !inv) return; S.n = clamp(S.n + d, 1, o.nmax); if (NS) NS.set(S.n); draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, axisY = c.h - 30; P.clear();
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(4, axisY); ctx.lineTo(c.w - 4, axisY); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(P.X(a), axisY); ctx.lineTo(P.X(b), axisY); ctx.stroke(); ctx.restore();
      dot(ctx, P.X(a), axisY, 6, inv ? k.bg : k.ink, k.ink); dot(ctx, P.X(b), axisY, 6, k.ink, k.ink);
      txt(ctx, fm(a, 3), P.X(a), axisY + 16, { align: 'center' }); txt(ctx, fm(b, 3), P.X(b), axisY + 16, { align: 'center' });
      var list = inv ? [] : ivs.map(function (I, i) { return { I: I, i: i }; });
      if (inv) for (var n = 1; n <= S.n; n++) list.push({ I: [1 / n, 2], i: n });
      var rows = list.length, top = 14, rowH = M.max(9, M.min(22, (axisY - top - 18) / M.max(1, rows)));
      list.forEach(function (it, r) { var on = !S.chosen || S.chosen.indexOf(it.i) >= 0, y = top + r * rowH + rowH / 2; ctx.save(); ctx.globalAlpha = on ? 1 : 0.25; ctx.strokeStyle = on && S.chosen ? k.green : k.blue; ctx.lineWidth = M.min(6, rowH * 0.45); ctx.beginPath(); ctx.moveTo(P.X(it.I[0]), y); ctx.lineTo(P.X(it.I[1]), y); ctx.stroke(); ctx.restore(); ctx.save(); ctx.globalAlpha = on ? 1 : 0.25; dot(ctx, P.X(it.I[0]), y, 4, k.bg, on && S.chosen ? k.green : k.blue); dot(ctx, P.X(it.I[1]), y, 4, k.bg, on && S.chosen ? k.green : k.blue); ctx.restore(); if (inv && rowH >= 12) txt(ctx, '(1/' + it.i + ', 2)', P.X(2) + 6, y, { size: 10 }); });
      if (inv) { var gap = 1 / S.n; ctx.save(); ctx.fillStyle = k.redSoft; ctx.fillRect(P.X(0), axisY - 10, P.X(gap) - P.X(0), 20); ctx.restore(); }
      var msg = '';
      if (!F.quiet) msg = inv ? 'With ' + S.n + ' interval' + (S.n === 1 ? '' : 's') + ', the points of $(0, \\frac{1}{' + S.n + '}]$ (red) are still uncovered. Adding more never finishes: no finite subcover.' : S.chosen ? '<span class="rav-ok">' + S.chosen.length + ' intervals</span> (green) cover $[' + fm(a, 3) + ', ' + fm(b, 3) + ']$: start at the left end, and always take the interval that reaches farthest right.' : 'The ' + ivs.length + ' open intervals together cover $[' + fm(a, 3) + ', ' + fm(b, 3) + ']$.';
      F.say(msg); c.cv.setAttribute('aria-label', inv ? 'The intervals (1/n, 2) for n up to ' + S.n : ivs.length + ' open intervals covering [' + fm(a, 3) + ', ' + fm(b, 3) + ']');
    }
    var k6 = V.colors(); F.legend(inv ? [[k6.blue, 'intervals (1/n, 2)'], [k6.redSoft, 'not yet covered']] : [[k6.blue, 'open intervals'], [k6.green, 'chosen subcover']]);
    redraw(c, draw); draw();
  });
})(window, document);
