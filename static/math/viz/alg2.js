/* Math Ladder visuals made for Algebra 2 (course key alg2). Registered on window.MathLadder.viz; CSS is injected below.
   Load after viz/core.js (and cas.js). Every visual follows the light/dark theme, works with mouse, touch and keyboard,
   and has an aria-label (opts.label overrides the default).

   alg2-plot       a still graph with no formula shown (for "read the graph" questions and pictures of asymptotes and holes)
     fns:     ["x^2-4", {"f": "1/(x-2)", "color": "red", "dash": true, "from": -3, "to": 5}]   colors: blue red green purple orange teal pink gold
     points:  [{"x": 2, "y": 4, "label": "hole", "open": true, "color": "red"}]   open: a hollow circle (a hole)
     vlines:  [2, -1]  dashed vertical lines (asymptotes)        hlines: [1]  dashed horizontal lines
     xmin, xmax, ymin, ymax (-10..10)   equal (false)   height (px; default follows the width)   names: true labels each curve with its "label"
   alg2-signchart  a sign chart: the sign of each factor on each interval, the sign of the product, and the solution set
     factors: [{"t": "x + 2", "z": -2, "m": 1}, {"t": "(x − 1)²", "z": 1, "m": 2}, {"t": "x − 3", "z": 3, "m": 1, "den": true}]
              t: the label, z: its zero, m: the power (even powers never change sign), den: true for a factor of the denominator
     lead:    a constant factor in front (default 1; a negative one flips every product sign)
     rel:     ">", ">=", "<" or "<=" to shade the solution set on the bottom line (omit to show only signs)
     x:       where the test line starts         xmin, xmax: the ends of the number line (default: the zeros ± 2)
     task:    optional short instruction shown above
   alg2-synth      synthetic division, one step at a time (bring down, multiply, add), then the quotient and remainder
     coeffs:  [1, 0, -7, 6]  the dividend's coefficients, highest power first (write 0 for a missing power)
     r:       2  divide by (x − r)          v: "x" the variable          start: "step" (default) or "all"
   alg2-machines   function machines in a row: an input goes through g, then f; swap the order to compare f(g(x)) with g(f(x))
     fns:     [{"name": "g", "f": "2x - 3", "tex": "2x - 3"}, {"name": "f", "f": "x^2 + 1", "tex": "x^2 + 1"}]  (applied left to right)
     x: 2, min: -5, max: 5, step: 1   the input slider         swap: true   show a "Swap the order" button
     inverse: true   the second machine undoes the first: the readout says so when the output equals the input
   ---- neural-network thread (nn) visuals begin
   alg2-ramps      ramps, ReLU(x) = max(0, x), and the bent-line graphs they add up to: f(x) = mx + b + Σ cᵢ·ReLU(sᵢ(x − aᵢ))
     ramps:   [{"a": 0, "c": 1, "s": 1}]  each ramp bends at x = a; c is its coefficient (the change in slope at the bend);
              s: 1 opens to the right, ReLU(x − a); s: −1 opens to the left, ReLU(a − x)
     line:    {"m": 0, "b": 0}  a straight line added to the ramps          lineEdit: false   sliders for m and b too
     edit:    true   a row of controls per ramp (bend, coefficient, flip) and Add a ramp / Remove (max: 4 ramps)
     parts:   true   draw each ramp thin and dashed under the sum           slopes: true   label each straight piece with its slope
     target:  {"ramps": [...], "line": {...}}  a dashed gold graph to match; with task, a check mark once the sum matches it
     xmin, xmax, ymin, ymax (-6, 6, -3, 7), snap: 0.5 (bend positions)  task, label
     quiet:   true (or readout: false) no formula, no slope labels, no readout (for a picture inside a problem)
     Drag a bend marker sideways to move it (arrow keys: left/right move the picked bend, up/down change its coefficient,
     Enter picks the next ramp).
   ---- neural-network thread (nn) visuals end
   */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/alg2.js: load viz/core.js first'); return; }
  var M = Math, fm = V.fmt, mk = V.el;
  var CSS = [
    '.a2v .a2-task{margin:0 0 .55rem;padding:.45rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}',
    '.a2v .a2-cv{outline:none}',
    '.a2v .a2-grid{border-collapse:separate;border-spacing:0;margin:.2rem auto;font:600 1.05rem system-ui,sans-serif;font-variant-numeric:tabular-nums}',
    '.a2v .a2-grid td{min-width:2.6rem;height:2.2rem;padding:.15rem .35rem;text-align:center;border-radius:8px;transition:background .25s}',
    '.a2v .a2-grid td.a2-r{border-right:2px solid var(--mv-ink);color:#b8963e}',
    '.a2v .a2-grid tr.a2-sum td{border-top:2px solid var(--mv-ink);border-radius:0 0 8px 8px}',
    '.a2v .a2-grid tr.a2-sum td.a2-blank{border-top:0}',
    '.a2v .a2-grid td.a2-on{background:rgba(184,150,62,.28)}',
    '.a2v .a2-grid td.a2-rem{box-shadow:inset 0 0 0 2px #00562f}',
    'html[data-theme="dark"] .a2v .a2-grid td.a2-rem{box-shadow:inset 0 0 0 2px #6cc79a}',
    '.a2v .a2-grid td.a2-dim{color:var(--mv-muted)}',
    '.a2v .a2-scroll{overflow-x:auto;max-width:100%}',
    '.a2v .a2-say{margin:.5rem 0 0;min-height:3em;line-height:1.5}',
    '.a2v .a2-chain{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.4rem .5rem;margin:.3rem 0}',
    '.a2v .a2-val{min-width:3.2rem;padding:.45rem .6rem;border-radius:10px;background:var(--mv-card);border:2px solid var(--mv-line);text-align:center;font:700 1.15rem system-ui,sans-serif;font-variant-numeric:tabular-nums}',
    '.a2v .a2-val.in{border-color:#b8963e}',
    '.a2v .a2-mach{padding:.45rem .75rem;border-radius:12px;background:#004225;color:#fff;text-align:center;line-height:1.3;min-width:5.5rem}',
    'html[data-theme="dark"] .a2v .a2-mach{background:#6cc79a;color:#0f1a14}',
    '.a2v .a2-mach small{display:block;font-size:.78rem;opacity:.85}',
    '.a2v .a2-arr{font-size:1.3rem;color:var(--mv-muted)}',
    '.a2v .a2-mach.flash{animation:a2flash .5s ease}',
    '@keyframes a2flash{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}',
    '@media (prefers-reduced-motion:reduce){.a2v .a2-mach.flash{animation:none}.a2v .a2-grid td{transition:none}}'
  ].join('\n');
  if (!D.getElementById('a2v-css')) { var st = D.createElement('style'); st.id = 'a2v-css'; st.textContent = CSS; D.head.appendChild(st); }

  function nv(v, d) { if (typeof v === 'number') return isFinite(v) ? v : d; if (v == null || v === '') return d; var x = +v; if (!isNaN(x)) return x; var m = /^\s*(-?\d+)\s*\/\s*(\d+)\s*$/.exec(String(v)); return m ? +m[1] / +m[2] : d; }
  function fixPow(t) { var C = W.CAS; if (!t || !t.a) return t; for (var i = 0; i < t.a.length; i++) if (t.a[i] && t.a[i].k) t.a[i] = fixPow(t.a[i]); if (t.k === '^' && !Object.keys(C.freeVars(t.a[1])).length) { try { var s = C.simp(t.a[1]); if (s && s.k) t.a[1] = s; } catch (e) { } } return t; }
  function compile(src) {
    var C = W.CAS; if (!C) return function () { return NaN; };
    var g = C.compile(fixPow(C.parse(String(src))), ['x']);
    return function (x) { try { var y = g(x); return typeof y === 'number' ? y : NaN; } catch (e) { return NaN; } };
  }
  function frameUp(el, o, label) {
    el.classList.add('a2v'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label') || o.label) el.setAttribute('aria-label', o.label || label);
    if (o.task) { var t = mk('p', 'a2-task', o.task); el.appendChild(t); if (ML.typeset) try { ML.typeset(t); } catch (e) { } }
  }
  function sup(n) { var S = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }; return String(n).split('').map(function (c) { return S[c] || c; }).join(''); }
  function minus(s) { return String(s).replace(/-/g, '−'); }

  // ================================================================ alg2-plot
  V.register('alg2-plot', function (el, o) {
    o = o || {};
    var win = { xmin: nv(o.xmin, -10), xmax: nv(o.xmax, 10), ymin: nv(o.ymin, -10), ymax: nv(o.ymax, 10), equal: !!o.equal };
    var PAL = ['blue', 'red', 'green', 'purple', 'orange', 'teal'];
    var fns = (o.fns || (o.f ? [o.f] : [])).map(function (q, i) { q = typeof q === 'string' ? { f: q } : q; return { f: compile(q.f), color: q.color || PAL[i % PAL.length], dash: q.dash ? [7, 6] : null, from: q.from == null ? undefined : nv(q.from), to: q.to == null ? undefined : nv(q.to), label: q.label || '' }; });
    frameUp(el, o, 'A graph');
    var box = mk('div', ''); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.45, max: 380, min: 240, height: o.height }), P = V.plane(c, win);
    c.cv.className += ' a2-cv'; c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || 'A graph');
    function draw() {
      var k = V.colors(), ctx = c.ctx; P.clear(); P.grid(); P.axes({ x: 'x', y: 'y' });
      (o.vlines || []).forEach(function (x) { x = nv(x, 0); P.seg(x, win.ymin - 50, x, win.ymax + 50, { color: 'muted', dash: [6, 5], width: 1.6 }); });
      (o.hlines || []).forEach(function (y) { y = nv(y, 0); P.seg(win.xmin - 50, y, win.xmax + 50, y, { color: 'muted', dash: [6, 5], width: 1.6 }); });
      fns.forEach(function (fn) { P.plot(fn.f, { color: fn.color, dash: fn.dash, from: fn.from, to: fn.to }); });
      if (o.names) fns.forEach(function (fn) { if (!fn.label) return; var x = win.xmax - (win.xmax - win.xmin) * 0.08, y = fn.f(x); if (isFinite(y) && y < win.ymax && y > win.ymin) P.text(fn.label, x, y, { color: fn.color, italic: true, dy: -12, align: 'right' }); });
      (o.points || []).forEach(function (p) { var x = nv(p.x, 0), y = nv(p.y, 0); P.point(x, y, { color: p.color || 'ink', hollow: !!p.open, r: 5 }); if (p.label) P.text(p.label, x, y, { dx: 9, dy: -12, size: 13, color: p.color || 'ink' }); });
      void k; void ctx;
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ================================================================ alg2-signchart
  V.register('alg2-signchart', function (el, o) {
    o = o || {};
    var fac = (o.factors || []).map(function (f) { return { t: String(f.t || ''), z: nv(f.z, 0), m: M.max(1, M.round(nv(f.m, 1))), den: !!f.den }; });
    var lead = nv(o.lead, 1), rel = o.rel || null;
    var zs = fac.map(function (f) { return f.z; }).sort(function (a, b) { return a - b; });
    var lo = o.xmin != null ? nv(o.xmin, -5) : (zs.length ? zs[0] - 2 : -5), hi = o.xmax != null ? nv(o.xmax, 5) : (zs.length ? zs[zs.length - 1] + 2 : 5);
    var X = o.x != null ? nv(o.x, (lo + hi) / 2) : (zs.length > 1 ? (zs[0] + zs[1]) / 2 : zs.length ? zs[0] + 0.5 : 0);
    var rows = fac.length + (lead !== 1 ? 1 : 0);
    frameUp(el, o, 'A sign chart for ' + fac.map(function (f) { return f.t; }).join(' times '));
    var box = mk('div', ''); el.appendChild(box);
    var rowH = 34, H = (rows + 1) * rowH + 78;
    var c = V.canvas(box, { height: H }); c.cv.className += ' a2-cv'; c.cv.tabIndex = 0;
    c.cv.setAttribute('aria-label', 'Sign chart. Arrow keys move the test line.');
    var out = V.readout(el);
    function sgn(v) { return v > 1e-12 ? 1 : v < -1e-12 ? -1 : 0; }
    function facVal(f, x) { return M.pow(x - f.z, f.m); }
    function prodAt(x) { var s = sgn(lead), und = false; fac.forEach(function (f) { var v = sgn(facVal(f, x)); if (v === 0 && f.den) und = true; s *= v; }); return und ? NaN : s; }
    function holds(s) { return rel === '>' ? s > 0 : rel === '>=' ? s >= 0 : rel === '<' ? s < 0 : rel === '<=' ? s <= 0 : false; }
    var L = 0, R = 0;
    function px(x) { return L + (x - lo) / (hi - lo) * (R - L); }
    function xp(p) { return lo + (p - L) / (R - L) * (hi - lo); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w;
      ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, c.h);
      ctx.font = '600 14px system-ui,sans-serif'; var labW = 0;
      fac.forEach(function (f) { labW = M.max(labW, ctx.measureText(f.t).width); }); labW = M.max(labW, ctx.measureText('product').width, lead !== 1 ? ctx.measureText(fm(lead)).width : 0);
      L = M.min(labW + 22, w * 0.42); R = w - 14;
      var bounds = [lo].concat(zs.filter(function (z) { return z > lo && z < hi; })).concat([hi]);
      var list = (lead !== 1 ? [{ lab: minus(fm(lead)), val: function () { return sgn(lead); }, zs: [] }] : []).concat(fac.map(function (f) { return { lab: f.t, val: function (x) { return sgn(facVal(f, x)); }, zs: [f.z], den: f.den }; }));
      list.push({ lab: 'product', val: prodAt, zs: zs, prod: true });
      list.forEach(function (r, i) {
        var y = 14 + i * rowH + rowH / 2;
        if (r.prod) { ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(8, y - rowH / 2); ctx.lineTo(w - 8, y - rowH / 2); ctx.stroke(); }
        ctx.fillStyle = r.prod ? k.ink : k.muted; ctx.font = (r.prod ? '700 ' : '600 ') + '14px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(r.lab, 8, y);
        for (var j = 0; j < bounds.length - 1; j++) {
          var a = bounds[j], b = bounds[j + 1], mid = (a + b) / 2, s = r.val(mid);
          var sym = isNaN(s) ? '' : s > 0 ? '+' : s < 0 ? '−' : '0';
          ctx.fillStyle = s > 0 ? k.green : k.red; ctx.font = '700 ' + (r.prod ? 20 : 17) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(sym, px(mid), y);
        }
        r.zs.forEach(function (z) { if (z <= lo || z >= hi) return; var isDen = r.prod ? fac.some(function (f) { return f.den && f.z === z; }) : r.den; ctx.fillStyle = isDen ? k.orange : k.ink; ctx.font = '600 12px system-ui,sans-serif'; ctx.fillText(isDen ? 'undef' : '0', px(z), y); });
      });
      // zero lines
      ctx.setLineDash([4, 4]); ctx.strokeStyle = k.grid; ctx.lineWidth = 1;
      zs.forEach(function (z) { if (z <= lo || z >= hi) return; ctx.beginPath(); ctx.moveTo(px(z), 8); ctx.lineTo(px(z), 14 + list.length * rowH + 4); ctx.stroke(); });
      ctx.setLineDash([]);
      // number line with the solution set
      var ny = 14 + list.length * rowH + 30;
      ctx.strokeStyle = k.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L - 6, ny); ctx.lineTo(R, ny); ctx.stroke();
      ctx.fillStyle = k.axis; ctx.beginPath(); ctx.moveTo(R + 2, ny); ctx.lineTo(R - 7, ny - 5); ctx.lineTo(R - 7, ny + 5); ctx.fill();
      if (rel) {
        for (var j2 = 0; j2 < bounds.length - 1; j2++) { var mm = (bounds[j2] + bounds[j2 + 1]) / 2; if (holds(prodAt(mm))) { ctx.strokeStyle = k.blue; ctx.lineWidth = 7; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.moveTo(px(bounds[j2]), ny); ctx.lineTo(px(bounds[j2 + 1]), ny); ctx.stroke(); ctx.globalAlpha = 1; } }
      }
      ctx.font = '600 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      zs.forEach(function (z) {
        if (z <= lo || z >= hi) return; var s = prodAt(z), inc = rel && !isNaN(s) && holds(s);
        ctx.fillStyle = k.ink; ctx.fillText(minus(fm(z)), px(z), ny + 10);
        if (rel) { ctx.beginPath(); ctx.arc(px(z), ny, 6, 0, 2 * M.PI); ctx.lineWidth = 2.5; ctx.strokeStyle = k.blue; ctx.fillStyle = inc ? k.blue : k.bg; ctx.fill(); ctx.stroke(); }
        else { ctx.fillStyle = k.ink; ctx.fillRect(px(z) - 1, ny - 6, 2, 12); }
      });
      // test line
      var tx = px(X); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tx, 6); ctx.lineTo(tx, ny); ctx.stroke();
      ctx.fillStyle = k.gold; ctx.beginPath(); ctx.arc(tx, ny, 9, 0, 2 * M.PI); ctx.fill(); ctx.fillStyle = k.bg; ctx.beginPath(); ctx.arc(tx, ny, 3.5, 0, 2 * M.PI); ctx.fill();
      ctx.restore();
      var parts = fac.map(function (f) { var v = facVal(f, X); return f.t + ' = ' + minus(fm(v, 3)) + (f.den && M.abs(v) < 1e-12 ? ' (division by 0)' : ''); });
      var s0 = prodAt(X);
      out.set('At <i>x</i> = ' + minus(fm(X, 2)) + ': ' + parts.join(', ') + '. Product: <b>' + (isNaN(s0) ? 'undefined' : s0 > 0 ? 'positive' : s0 < 0 ? 'negative' : 'zero') + '</b>' + (rel ? (isNaN(s0) ? ', so this x is left out.' : holds(s0) ? ', so this x is a solution.' : ', so this x is not a solution.') : '.'));
    }
    V.drag(c.cv, { hit: function (p) { return M.abs(p - px(X)) < 26 || p > L ? 1 : null; }, start: function (h, p) { X = M.max(lo, M.min(hi, M.round(xp(p) * 4) / 4)); draw(); }, move: function (h, p) { X = M.max(lo, M.min(hi, M.round(xp(p) * 4) / 4)); draw(); }, touchAction: 'pan-y' });
    c.cv.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.25 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.25 : 0; if (!d) return; e.preventDefault(); X = M.max(lo, M.min(hi, X + d * (e.shiftKey ? 4 : 1))); draw(); });
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ================================================================ alg2-synth
  V.register('alg2-synth', function (el, o) {
    o = o || {};
    var cs = (o.coeffs || [1, 0, -7, 6]).map(function (v) { return nv(v, 0); }), r = nv(o.r, 2), v = o.v || 'x', n = cs.length;
    var prod = [], sum = [];
    sum[0] = cs[0]; for (var i = 1; i < n; i++) { prod[i] = r * sum[i - 1]; sum[i] = cs[i] + prod[i]; }
    var total = 1 + 2 * (n - 1), step = o.start === 'all' ? total : 0;
    function polyHTML(a, deg) { var s = '', first = true; a.forEach(function (c0, j) { var p = deg - j; if (!c0) return; var neg = c0 < 0, m = M.abs(c0); var body = (p === 0 ? fm(m) : (m === 1 ? '' : fm(m)) + '<i>' + v + '</i>' + (p > 1 ? '<sup>' + p + '</sup>' : '')); s += first ? (neg ? '−' : '') + body : (neg ? ' − ' : ' + ') + body; first = false; }); return s || '0'; }
    var divisor = r === 0 ? '<i>' + v + '</i>' : '<i>' + v + '</i> ' + (r > 0 ? '− ' + fm(r) : '+ ' + fm(-r));
    frameUp(el, o, 'Synthetic division of ' + polyHTML(cs, n - 1).replace(/<[^>]+>/g, '') + ' by ' + divisor.replace(/<[^>]+>/g, ''));
    var head = mk('p', 'a2-say', 'Divide <b>' + polyHTML(cs, n - 1) + '</b> by <b>' + divisor + '</b>. The box holds ' + minus(fm(r)) + ', the number that makes ' + divisor + ' equal 0.'); el.appendChild(head);
    var wrap = mk('div', 'a2-scroll'), tbl = mk('table', 'a2-grid'); wrap.appendChild(tbl); el.appendChild(wrap);
    tbl.setAttribute('aria-label', 'Synthetic division table');
    var say = mk('p', 'a2-say'); say.setAttribute('aria-live', 'polite'); el.appendChild(say);
    var ctl = mk('div', 'ml-ctl'); el.appendChild(ctl);
    V.button(ctl, 'Back', function () { if (step > 0) { step--; draw(); } });
    var nextB = V.button(ctl, 'Next step', function () { if (step < total) { step++; draw(); } }, 'pri');
    V.button(ctl, 'Show all', function () { step = total; draw(); });
    V.button(ctl, 'Start over', function () { step = 0; draw(); });
    function draw() {
      // which cells are visible: step 1 = bring down; then step 2j = multiply into column j, 2j+1 = add column j
      var showProd = [], showSum = [], on = null;
      if (step >= 1) { showSum[0] = true; if (step === 1) on = ['s', 0]; }
      for (var j = 1; j < n; j++) { if (step >= 2 * j) { showProd[j] = true; if (step === 2 * j) on = ['p', j]; } if (step >= 2 * j + 1) { showSum[j] = true; if (step === 2 * j + 1) on = ['s', j]; } }
      var h = '<tr><td class="a2-r">' + minus(fm(r)) + '</td>' + cs.map(function (c0, j) { return '<td' + (on && on[1] === j ? ' class="a2-on"' : '') + '>' + minus(fm(c0)) + '</td>'; }).join('') + '</tr>';
      h += '<tr><td class="a2-blank"></td>' + cs.map(function (c0, j) { return '<td' + (on && on[0] === 'p' && on[1] === j ? ' class="a2-on"' : '') + '>' + (j && showProd[j] ? minus(fm(prod[j])) : '') + '</td>'; }).join('') + '</tr>';
      h += '<tr class="a2-sum"><td class="a2-blank"></td>' + cs.map(function (c0, j) { var cls = []; if (on && on[0] === 's' && on[1] === j) cls.push('a2-on'); if (j === n - 1 && showSum[j]) cls.push('a2-rem'); return '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + (showSum[j] ? minus(fm(sum[j])) : '') + '</td>'; }).join('') + '</tr>';
      tbl.innerHTML = h;
      var msg;
      if (step === 0) msg = 'Press <b>Next step</b> to begin.';
      else if (step === 1) msg = 'Bring down the first coefficient, ' + minus(fm(cs[0])) + '.';
      else { var jj = M.floor(step / 2); if (step % 2 === 0) msg = 'Multiply: ' + minus(fm(r)) + ' × ' + minus(fm(sum[jj - 1])) + ' = ' + minus(fm(prod[jj])) + '. Write it under the next coefficient.'; else msg = 'Add the column: ' + minus(fm(cs[jj])) + ' + ' + minus(fm(prod[jj])).replace(/^−/, '(−') + (prod[jj] < 0 ? ')' : '') + ' = ' + minus(fm(sum[jj])) + '.'; }
      if (step === total) msg += ' Done. The bottom row gives the quotient <b>' + polyHTML(sum.slice(0, n - 1), n - 2) + '</b> (one degree lower) and the remainder <b>' + minus(fm(sum[n - 1])) + '</b>. By the remainder theorem, <i>p</i>(' + minus(fm(r)) + ') = ' + minus(fm(sum[n - 1])) + '.';
      say.innerHTML = msg; nextB.disabled = step >= total;
    }
    draw();
    return { draw: draw };
  });

  // ================================================================ alg2-machines
  V.register('alg2-machines', function (el, o) {
    o = o || {};
    var fns = (o.fns || [{ name: 'g', f: '2x-3', tex: '2x - 3' }, { name: 'f', f: 'x^2+1', tex: 'x^2 + 1' }]).map(function (q) { return { name: q.name || 'f', f: compile(q.f), tex: q.tex || q.f }; });
    var x = nv(o.x, 2), lo = nv(o.min, -5), hi = nv(o.max, 5), stp = nv(o.step, 1), rev = false;
    frameUp(el, o, 'Function machines: ' + fns.map(function (f) { return f.name; }).join(' then '));
    var chain = mk('div', 'a2-chain'); el.appendChild(chain);
    var ctl = mk('div', 'ml-ctl'); el.appendChild(ctl);
    var sl = V.slider(ctl, { label: 'Input x', min: lo, max: hi, step: stp, value: x, input: function (val) { x = val; draw(); } });
    if (o.swap) V.button(ctl, 'Swap the order', function () { rev = !rev; draw(true); });
    var out = V.readout(el);
    function draw(flash) {
      var order = rev ? fns.slice().reverse() : fns, v = x, h = '<span class="a2-val in" aria-label="input">' + minus(fm(x, 3)) + '</span>', vals = [x];
      order.forEach(function (f) { v = f.f(v); vals.push(v); h += '<span class="a2-arr" aria-hidden="true">→</span><span class="a2-mach' + (flash ? ' flash' : '') + '"><small>machine ' + f.name + '</small>$' + f.name + '(x) = ' + f.tex + '$</span><span class="a2-arr" aria-hidden="true">→</span><span class="a2-val">' + (isFinite(v) ? minus(fm(v, 3)) : 'undefined') + '</span>'; });
      chain.innerHTML = h; if (ML.typeset) try { ML.typeset(chain); } catch (e) { }
      var name = 'x', txt = [];
      order.forEach(function (f, i) { name = f.name + '(' + name + ')'; txt.push('<i>' + name.replace(/x\)*$/, function (m) { return minus(fm(x, 3)) + m.slice(1); }) + '</i> = ' + (isFinite(vals[i + 1]) ? minus(fm(vals[i + 1], 3)) : 'undefined')); });
      var last = vals[vals.length - 1];
      out.set(txt.join(', then ') + '.' + (o.inverse && isFinite(last) && M.abs(last - x) < 1e-9 ? ' The output equals the input: the second machine undid the first.' : ''));
      void sl;
    }
    draw();
    return { draw: draw };
  });
})(window, document);

// ==== neural-network thread (nn) begin: alg2-ramps (options in the header comment above) ====
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, fm = V.fmt, mk = V.el;
  (function css() {
    if (D.getElementById('nnv-css')) return;
    var s = D.createElement('style'); s.id = 'nnv-css';
    s.textContent = [
      '.nnv .nnv-task{display:flex;gap:.55rem;align-items:flex-start;margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}',
      '.nnv .nnv-tk{flex:0 0 auto;width:1.25rem;height:1.25rem;margin-top:.1rem;border-radius:50%;border:2px solid #b8963e;box-sizing:border-box;position:relative}',
      '.nnv .nnv-task.ok{border-left-color:#00703c}.nnv .nnv-task.ok .nnv-tk{background:#00703c;border-color:#00703c}',
      '.nnv .nnv-task.ok .nnv-tk::after{content:"";position:absolute;left:.33rem;top:.12rem;width:.28rem;height:.55rem;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}',
      'html[data-theme="dark"] .nnv .nnv-task.ok{border-left-color:#6cc79a}html[data-theme="dark"] .nnv .nnv-task.ok .nnv-tk{background:#6cc79a;border-color:#6cc79a}html[data-theme="dark"] .nnv .nnv-task.ok .nnv-tk::after{border-color:#0f1a14}',
      '.nnv .nnv-rows{display:grid;gap:.45rem;margin:.6rem 0 0}',
      '.nnv .nnv-row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:.35rem .8rem;padding:.45rem .6rem;border:1px solid var(--mv-line);border-left:5px solid var(--nnc);border-radius:10px;background:var(--mv-card)}',
      '.nnv .nnv-row .ml-sl{min-width:130px;flex:1 1 130px}',
      '.nnv .nnv-name{font:600 .9rem system-ui,sans-serif;min-width:5.5rem;align-self:center;color:var(--mv-ink)}',
      '.nnv .nnv-btns{display:flex;flex-wrap:wrap;gap:.4rem;margin:.6rem 0 0}',
      '.nnv .ml-btn[aria-pressed="true"]{background:rgba(0,112,60,.16);border-color:#00703c}',
      '.nnv .ml-readout{overflow-wrap:anywhere}',
      '.nnv .nnv-say{margin:.45rem 0 0;font-size:.92rem;line-height:1.5;color:var(--mv-muted);min-height:1.4em}',
      '@media (max-width:480px){.nnv .nnv-row .ml-sl{min-width:120px;flex-basis:120px}.ml-viz.nnv{padding:.55rem}}'
    ].join('\n');
    D.head.appendChild(s);
  })();
  function nv(v, d) { if (v === null || v === undefined || v === '') return d; v = +v; return isFinite(v) ? v : d; }
  function relu(v) { return v > 0 ? v : 0; }
  function frame(el, o, label) {
    el.classList.add('nnv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = mk('p', 'nnv-task', '<span class="nnv-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'nnv-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    F.done = function (ok) { if (F.task) F.task.classList.toggle('ok', !!ok); };
    return F;
  }
  function pill(ctx, s, x, y, color, cw, ch) {
    var k = V.colors(); ctx.save(); ctx.font = '700 12px system-ui,sans-serif'; var w = ctx.measureText(s).width + 10, h = 19;
    x = M.max(2, M.min(x - w / 2, cw - w - 2)); y = M.max(h / 2 + 2, M.min(y, ch - h / 2 - 2));
    ctx.fillStyle = k.bg; ctx.globalAlpha = 0.88; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y - h / 2, w, h, 6); else ctx.rect(x, y - h / 2, w, h); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 5, y + 1); ctx.restore();
  }
  var PAL = ['purple', 'orange', 'teal', 'pink', 'green', 'gold'];

  V.register('alg2-ramps', function (el, o) {
    o = Object.assign({ ramps: [{ a: 0, c: 1, s: 1 }], line: { m: 0, b: 0 }, edit: true, lineEdit: false, parts: true, slopes: true, max: 4, xmin: -6, xmax: 6, ymin: -3, ymax: 7, snap: 0.5 }, o || {});
    var quiet = !!(o.quiet || o.readout === false);
    function norm(r) { return { a: nv(r.a, 0), c: nv(r.c, 1), s: r.s === -1 ? -1 : 1 }; }
    var start = (o.ramps || []).map(norm), ramps = start.map(function (r) { return Object.assign({}, r); });
    var line0 = { m: nv((o.line || {}).m, 0), b: nv((o.line || {}).b, 0) }, line = Object.assign({}, line0);
    var tgt = o.target ? { ramps: (o.target.ramps || []).map(norm), line: { m: nv((o.target.line || {}).m, 0), b: nv((o.target.line || {}).b, 0) } } : null;
    var F = frame(el, o, 'Ramps adding up to a bent-line graph');
    var c = V.canvas(F.box, { aspect: 1.55, min: 240, max: 430 }), P = V.plane(c, { xmin: nv(o.xmin, -6), xmax: nv(o.xmax, 6), ymin: nv(o.ymin, -3), ymax: nv(o.ymax, 7) });
    c.cv.tabIndex = 0; c.cv.setAttribute('role', 'img');
    var sel = 0, focus = false, rowsEl = null, btnRow = null;
    function f(x, rs, ln) { rs = rs || ramps; ln = ln || line; var y = ln.m * x + ln.b; rs.forEach(function (r) { y += r.c * relu(r.s * (x - r.a)); }); return y; }
    function col(i) { return V.colors()[PAL[i % PAL.length]]; }
    function snap(v) { var s = nv(o.snap, 0.5) || 0.5; return M.round(v / s) * s; }
    function termTex(r) { var inner = r.s === 1 ? (r.a === 0 ? 'x' : 'x ' + (r.a > 0 ? '- ' + fm(r.a) : '+ ' + fm(-r.a))) : (r.a === 0 ? '-x' : fm(r.a).replace('−', '-') + ' - x'); return '\\operatorname{ReLU}(' + inner.replace(/−/g, '-') + ')'; }
    function formula() {
      var parts = [], first = true;
      function add(coef, body) { if (!coef) return; var a = M.abs(coef), sg = coef < 0 ? (first ? '-' : ' - ') : (first ? '' : ' + '); parts.push(sg + (body && a === 1 ? '' : fm(a).replace('−', '-')) + body); first = false; }
      if (line.m) add(line.m, 'x'); if (line.b) add(line.b, ''); ramps.forEach(function (r) { add(r.c, termTex(r)); });
      return '$f(x) = ' + (parts.join('') || '0') + '$';
    }
    function bends(rs) { return rs.map(function (r) { return r.a; }).filter(function (a, i, arr) { return arr.indexOf(a) === i; }).sort(function (u, v) { return u - v; }); }
    function slopeAt(x, rs, ln) { var h = 1e-4; return (f(x + h, rs, ln) - f(x - h, rs, ln)) / (2 * h); }
    function matches() {
      if (!tgt) return false;
      var xs = bends(ramps).concat(bends(tgt.ramps)); xs.push(P.o.xmin - 5, P.o.xmax + 5, 0);
      for (var x = P.o.xmin - 6; x <= P.o.xmax + 6; x += 0.25) xs.push(x);
      return xs.every(function (x) { return M.abs(f(x) - f(x, tgt.ramps, tgt.line)) < 1e-6; });
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view();
      P.clear(); P.grid(); P.axes();
      if (tgt) P.plot(function (x) { return f(x, tgt.ramps, tgt.line); }, { color: 'gold', width: 5, dash: [9, 7] });
      if (o.parts && !quiet) ramps.forEach(function (r, i) { P.plot(function (x) { return r.c * relu(r.s * (x - r.a)); }, { color: col(i), width: 2, dash: [5, 5] }); });
      if (o.parts && !quiet && (line.m || line.b)) P.plot(function (x) { return line.m * x + line.b; }, { color: k.muted, width: 1.6, dash: [3, 5] });
      P.plot(function (x) { return f(x); }, { color: 'blue', width: 3.6 });
      // bend markers (diamonds) on the sum
      ramps.forEach(function (r, i) {
        var px = P.X(r.a), py = P.Y(f(r.a)); if (px < -10 || px > c.w + 10) return;
        ctx.save(); ctx.fillStyle = quiet ? k.blue : col(i); ctx.strokeStyle = k.bg; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px, py - 8); ctx.lineTo(px + 8, py); ctx.lineTo(px, py + 8); ctx.lineTo(px - 8, py); ctx.closePath(); ctx.fill(); ctx.stroke();
        if (focus && i === sel && o.edit && !quiet) { ctx.strokeStyle = k.gold; ctx.setLineDash([4, 3]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(px, py, 14, 0, 2 * M.PI); ctx.stroke(); }
        ctx.restore();
      });
      // slope labels on each straight piece
      if (o.slopes && !quiet) {
        var bs = bends(ramps).filter(function (a) { return a > v.xmin && a < v.xmax; }), cuts = [v.xmin].concat(bs, [v.xmax]);
        for (var j = 0; j < cuts.length - 1; j++) {
          var a = cuts[j], b = cuts[j + 1]; if (P.X(b) - P.X(a) < 46) continue;
          var xm = (a + b) / 2, sl = slopeAt(xm), ym = f(xm), py2 = P.Y(ym);
          pill(ctx, 'slope ' + fm(M.round(sl * 100) / 100), P.X(xm), py2 + (py2 > c.h * 0.6 ? -20 : 20), k.blue, c.w, c.h);
        }
      }
      var ok = matches(); F.done(ok);
      if (!quiet) {
        var sl = bends(ramps).length ? [slopeAt(bends(ramps)[0] - 0.5)].concat(bends(ramps).map(function (a) { return slopeAt(a + 1e-3); })) : [slopeAt(0)];
        F.out.set(formula() + '<br><span style="color:var(--mv-muted)">Slopes from left to right: ' + sl.map(function (s) { return fm(M.round(s * 100) / 100); }).join(', ') +
          (ramps.length ? '. Each ramp changes the slope by its coefficient at its bend.' : '.') + (tgt ? (ok ? ' <b>It matches the target.</b>' : '') : '') + '</span>');
      } else F.out.el.hidden = true;
      c.cv.setAttribute('aria-label', 'Graph of a bent line made of ' + ramps.length + ' ramp' + (ramps.length === 1 ? '' : 's') + (quiet ? '' : ', bends at x = ' + bends(ramps).map(function (a) { return fm(a); }).join(', ')) + '.' + (o.edit && !quiet ? ' Arrow keys: left and right move the picked bend, up and down change its coefficient, Enter picks the next ramp.' : ''));
    }
    // ---- controls
    function buildRows() {
      if (!o.edit || quiet) return;
      if (!rowsEl) { rowsEl = mk('div', 'nnv-rows'); el.insertBefore(rowsEl, F.ctl); }
      rowsEl.innerHTML = '';
      ramps.forEach(function (r, i) {
        var row = mk('div', 'nnv-row'); row.style.setProperty('--nnc', col(i));
        var name = mk('span', 'nnv-name', 'Ramp ' + (i + 1)); row.appendChild(name);
        var sa = V.slider(row, { label: 'bend at x =', min: P.o.xmin, max: P.o.xmax, step: nv(o.snap, 0.5), value: r.a, input: function (val) { r.a = val; sel = i; draw(); } });
        var sc = V.slider(row, { label: 'coefficient', min: -4, max: 4, step: 0.5, value: r.c, input: function (val) { r.c = val; sel = i; draw(); } });
        var fb = V.button(row, r.s === 1 ? 'Opens right' : 'Opens left', function () { r.s = -r.s; fb.textContent = r.s === 1 ? 'Opens right' : 'Opens left'; fb.setAttribute('aria-pressed', String(r.s === -1)); draw(); });
        fb.setAttribute('aria-pressed', String(r.s === -1)); fb.title = 'Flip: ReLU(x − a) or ReLU(a − x)';
        r._sa = sa; r._sc = sc; rowsEl.appendChild(row);
      });
      if (addB) addB.disabled = ramps.length >= nv(o.max, 4); if (remB) remB.disabled = !ramps.length;
    }
    var addB = null, remB = null;
    if (o.edit && !quiet) {
      if (o.lineEdit) {
        V.slider(F.ctl, { label: 'line slope m', min: -3, max: 3, step: 0.5, value: line.m, input: function (val) { line.m = val; draw(); } });
        V.slider(F.ctl, { label: 'line intercept b', min: -4, max: 4, step: 0.5, value: line.b, input: function (val) { line.b = val; draw(); } });
      }
      btnRow = mk('div', 'nnv-btns'); el.insertBefore(btnRow, F.out.el);
      addB = V.button(btnRow, 'Add a ramp', function () { if (ramps.length >= nv(o.max, 4)) return; ramps.push({ a: snap((P.o.xmin + P.o.xmax) / 2 + ramps.length), c: 1, s: 1 }); sel = ramps.length - 1; buildRows(); draw(); });
      remB = V.button(btnRow, 'Remove the last ramp', function () { if (!ramps.length) return; ramps.pop(); sel = M.max(0, M.min(sel, ramps.length - 1)); buildRows(); draw(); });
      V.button(btnRow, 'Reset', function () { ramps = start.map(function (r) { return Object.assign({}, r); }); line = Object.assign({}, line0); sel = 0; buildRows(); draw(); });
      buildRows();
      V.drag(c.cv, {
        hit: function (px, py) { var best = null, bd = 26; ramps.forEach(function (r, i) { var d = M.hypot(P.X(r.a) - px, P.Y(f(r.a)) - py); if (d < bd) { bd = d; best = i; } }); return best; },
        start: function (i) { sel = i; },
        move: function (i, px) { var r = ramps[i]; r.a = M.max(P.o.xmin, M.min(P.o.xmax, snap(P.x(px)))); if (r._sa) r._sa.set(r.a); draw(); }
      });
      c.cv.addEventListener('focus', function () { focus = true; draw(); }); c.cv.addEventListener('blur', function () { focus = false; draw(); });
      c.cv.addEventListener('keydown', function (e) {
        var r = ramps[sel]; if (!r) return; var st = nv(o.snap, 0.5) || 0.5;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { r.a = M.max(P.o.xmin, M.min(P.o.xmax, snap(r.a + (e.key === 'ArrowRight' ? st : -st)))); if (r._sa) r._sa.set(r.a); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { r.c = M.max(-4, M.min(4, r.c + (e.key === 'ArrowUp' ? 0.5 : -0.5))); if (r._sc) r._sc.set(r.c); }
        else if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') { sel = (sel + 1) % ramps.length; }
        else return;
        e.preventDefault(); draw();
      });
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { update: draw };
  });
})(window, document);
// ==== neural-network thread (nn) end ====
