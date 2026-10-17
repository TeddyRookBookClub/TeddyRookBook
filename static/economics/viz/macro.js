/* Economics Ladder, Macroeconomics: course visuals (registered on window.MathLadder.viz; names prefixed macro-).
   Load order: math/viz/core.js (+ viz.css), then this file. Vanilla JS, no libraries, no network. CSS is injected below.
   Light and dark themes through V.colors(); mouse, touch and keyboard; no horizontal overflow at 360 px; live aria-labels.

   macro-bars   compare a few places (or years) under two or more measures, one measure at a time, so learners see the
                ranking change (total GDP versus GDP per person).
                opts: labels: ["Country A", "Country B", "Country C"];
                      views: [{ name: "Total GDP", unit: "trillion dollars", values: [20, 4, 1.5], dp: 1, note: "…" },
                              { name: "GDP per person", unit: "dollars", values: [60000, 35000, 75000], dp: 0 }];
                      view: 0 (the measure shown first); quiet: true hides the value labels and the ranking sentence;
                      interactive: false (no toggle); task, caption, label (aria-label).
   macro-debt   the budget balance as a flow and the national debt as a stock. Bars: each year's budget balance (a deficit
                below zero in red, a surplus above zero in green). Line: the debt at the end of each year, which rises by
                each deficit and falls only with a surplus.
                opts: start: 1000 (debt before the first year); balances: [-200, -150, -100, -50, 20, 40] (per year; negative =
                      deficit); years: [2021, …] (labels; default Year 1, 2, …); unit: "billion dollars"; quiet: true hides
                      the numbers on the bars and line and the readout's totals; interactive: false (no year slider);
                      task, caption, label.
                Drag a bar up or down (snaps to 10), or pick a year and use the slider (keyboard). "Halve every deficit"
                and "Start over" buttons.                                                                               */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('economics/viz/macro.js: load math/viz/core.js first'); return; }
  var M = Math, fm = V.fmt, mk = V.el;
  if (!D.getElementById('macro-viz-css')) {
    var st = D.createElement('style'); st.id = 'macro-viz-css';
    st.textContent = '.ml-viz .mcv-task{margin:0 0 .5rem;font-size:.95rem;line-height:1.45}.ml-viz .mcv-yr{display:flex;flex-wrap:wrap;gap:.5rem .9rem;align-items:flex-end;width:100%}' +
      '.ml-viz .mcv-yr label{display:flex;flex-direction:column;gap:.15rem;font-size:.85rem;color:var(--mv-muted)}.ml-viz .mcv-yr select{min-height:36px;border-radius:10px;border:1px solid var(--mv-line);background:var(--mv-card);color:var(--mv-ink);font:inherit;padding:0 .5rem}';
    D.head.appendChild(st);
  }
  function opt(o, d) { o = o || {}; Object.keys(d).forEach(function (k) { if (o[k] === undefined) o[k] = d[k]; }); return o; }
  function num(v, d) { var x = +v; return isFinite(x) ? x : d; }
  function commas(v, dp) { var s = fm(M.abs(v), dp == null ? 2 : dp), p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (v < 0 ? '−' : '') + p.join('.'); }
  function niceMax(v) { if (v <= 0) return 1; var m = M.pow(10, M.floor(M.log10(v))), f = v / m; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * m; }
  function frame(el, o, label) {
    var F = { quiet: o.quiet === true || o.readout === false, inter: o.interactive !== false };
    if (o.task) el.appendChild(mk('p', 'mcv-task', o.task));
    F.box = mk('div'); el.appendChild(F.box);
    F.canvas = function (aspect, min, max) { var c = V.canvas(F.box, { aspect: aspect, min: min || 220, max: max || 420 }); c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || label); return c; };
    F.ctl = mk('div', 'ml-ctl'); if (F.inter) el.appendChild(F.ctl);
    F.out = V.readout(el); if (F.quiet) F.out.el.hidden = true;
    if (o.caption) el.appendChild(mk('p', 'ml-cap', o.caption));
    return F;
  }
  function txt(ctx, s, x, y, q) { q = q || {}; var k = V.colors(); ctx.save(); ctx.fillStyle = q.color || k.ink; ctx.font = (q.wt || 500) + ' ' + (q.size || 12) + 'px system-ui,sans-serif'; ctx.textAlign = q.align || 'left'; ctx.textBaseline = q.base || 'middle'; ctx.fillText(s, x, y); ctx.restore(); }

  /* ---------- macro-bars ---------- */
  V.register('macro-bars', function (el, o) {
    o = opt(o, { labels: ['A', 'B', 'C'], views: [{ name: 'Total', unit: '', values: [3, 2, 1] }], view: 0 });
    var F = frame(el, o, 'Bar chart comparing ' + o.labels.join(', ')), cur = M.max(0, M.min(o.views.length - 1, num(o.view, 0)));
    var c = F.canvas(1.75), cols = function (k) { return [k.blue, k.orange, k.green, k.purple, k.teal, k.pink]; };
    if (F.inter && o.views.length > 1) V.seg(F.ctl, { label: 'Measure', items: o.views.map(function (v, i) { return [String(i), v.name]; }), value: String(cur), change: function (v) { cur = +v; draw(); } });
    function lc(s) { return /^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
    function rank(vals) { return vals.map(function (v, i) { return i; }).sort(function (a, b) { return vals[b] - vals[a]; }).map(function (i) { return o.labels[i]; }); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, vw = o.views[cur], vals = vw.values.map(function (v) { return num(v, 0); }), n = vals.length;
      ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h); ctx.restore();
      var top = niceMax(M.max.apply(null, vals) * 1.08), L = w < 420 ? 8 : 16, R = 10, T = 30, B = 30, ph = h - T - B, gap = (w - L - R) / n, bw = M.min(gap * 0.56, 110);
      txt(ctx, vw.name + (vw.unit ? ' (' + vw.unit + ')' : ''), L, 14, { size: 13, wt: 700 });
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, T + ph + 0.5); ctx.lineTo(w - R, T + ph + 0.5); ctx.stroke(); ctx.restore();
      vals.forEach(function (v, i) {
        var x = L + gap * (i + 0.5), bh = ph * v / top, col = cols(k)[i % 6];
        ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x - bw / 2, T + ph - bh, bw, bh); ctx.restore();
        txt(ctx, o.labels[i], x, T + ph + 15, { align: 'center', size: w < 420 ? 11.5 : 12.5, wt: 600 });
        if (!F.quiet) txt(ctx, commas(v, vw.dp), x, T + ph - bh - 10, { align: 'center', size: 12, wt: 700, color: col });
      });
      var r = rank(vals), other = o.views.length > 1 ? o.views[(cur + 1) % o.views.length] : null;
      c.cv.setAttribute('aria-label', vw.name + ' for ' + o.labels.map(function (lb, i) { return lb + (F.quiet ? '' : ' ' + commas(vals[i], vw.dp) + ' ' + (vw.unit || '')); }).join(', ') + '.');
      if (!F.quiet) F.out.set('Ranked by ' + lc(vw.name) + ': <b>' + r.join(', ') + '</b>.' + (other ? ' Ranked by ' + lc(other.name) + ': ' + rank(other.values.map(function (v) { return num(v, 0); })).join(', ') + '.' : '') + (vw.note ? ' ' + vw.note : ''));
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  /* ---------- macro-debt ---------- */
  V.register('macro-debt', function (el, o) {
    o = opt(o, { start: 1000, balances: [-200, -150, -100, -50, 20, 40], unit: 'billion dollars' });
    var bal0 = o.balances.map(function (v) { return num(v, 0); }), bal = bal0.slice(), n = bal.length, D0 = num(o.start, 0), sel = 0;
    var yrs = (o.years || bal.map(function (_, i) { return 'Year ' + (i + 1); })).map(String);
    var F = frame(el, o, 'Budget balances by year and the national debt'), c = F.canvas(1.6, 360, 440), sl = null, ysel = null;
    var span = M.max(50, niceMax(M.max.apply(null, bal0.map(M.abs)) * 1.25));
    if (F.inter) {
      var row = mk('div', 'mcv-yr'); F.ctl.appendChild(row);
      var lab = mk('label', '', '<span>Year</span>'); ysel = D.createElement('select'); yrs.forEach(function (y, i) { var op = D.createElement('option'); op.value = i; op.textContent = y; ysel.appendChild(op); }); lab.appendChild(ysel); row.appendChild(lab);
      sl = V.slider(row, { label: 'Budget balance that year', min: -span, max: span, step: 10, value: bal[0], fmt: function (v) { return (v < 0 ? 'deficit ' : v > 0 ? 'surplus ' : '') + commas(M.abs(v), 0); }, input: function (v) { bal[sel] = v; draw(); } });
      ysel.addEventListener('change', function () { sel = +ysel.value; sl.set(bal[sel]); draw(); });
      V.button(F.ctl, 'Halve every deficit', function () { bal = bal.map(function (v) { return v < 0 ? M.round(v / 20) * 10 : v; }); sl.set(bal[sel]); draw(); });
      V.button(F.ctl, 'Start over', function () { bal = bal0.slice(); sl.set(bal[sel]); draw(); });
    }
    var geo = {};
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, L = w < 420 ? 44 : 56, R = 12, gapH = 26;
      ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h); ctx.restore();
      var debt = [], d = D0; bal.forEach(function (b) { d -= b; debt.push(d); });
      var h1 = (h - gapH - 40) * 0.45, t1 = 22, h2 = h - t1 - h1 - gapH - 40, t2 = t1 + h1 + gapH + 16, slot = (w - L - R) / n, bw = M.min(slot * 0.55, 60);
      geo = { L: L, slot: slot, bw: bw, t1: t1, h1: h1 };
      // panel 1: budget balance (flow)
      var nar = w < 480; txt(ctx, nar ? 'Budget balance (a flow)' : 'Budget balance each year (a flow)', L, 10, { size: 12.5, wt: 700 });
      var y0 = t1 + h1 / 2, sc = (h1 / 2) / span;
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(L, y0 + 0.5); ctx.lineTo(w - R, y0 + 0.5); ctx.stroke(); ctx.restore();
      txt(ctx, 'surplus', L - 6, t1 + 8, { align: 'right', size: 10.5, color: k.green }); txt(ctx, 'deficit', L - 6, t1 + h1 - 8, { align: 'right', size: 10.5, color: k.red });
      bal.forEach(function (b, i) {
        var x = L + slot * (i + 0.5), bh = b * sc, col = b < 0 ? k.red : k.green;
        ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = i === sel && F.inter ? 0.95 : 0.7; ctx.fillRect(x - bw / 2, M.min(y0, y0 - bh), bw, M.abs(bh)); ctx.restore();
        if (i === sel && F.inter) { ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.strokeRect(x - bw / 2 - 2, M.min(y0, y0 - bh) - 2, bw + 4, M.abs(bh) + 4); ctx.restore(); }
        if (!F.quiet && b) txt(ctx, commas(M.abs(b), 0), x, b < 0 ? y0 - bh + 9 : y0 - bh - 9, { align: 'center', size: 11, wt: 700, color: col });
      });
      // panel 2: debt (stock)
      txt(ctx, nar ? 'Debt at year end (a stock)' : 'National debt at the end of each year (a stock)', L, t2 - 12, { size: 12.5, wt: 700 });
      var all = [D0].concat(debt), lo = M.min.apply(null, all), hi = M.max.apply(null, all), pad = M.max(50, (hi - lo) * 0.25), ymin = M.max(0, lo - pad), ymax = hi + pad;
      var Y = function (v) { return t2 + h2 - (v - ymin) / (ymax - ymin) * h2; }, X = function (i) { return L + slot * (i + 0.5); };
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(L, t2); ctx.lineTo(L, t2 + h2); ctx.lineTo(w - R, t2 + h2); ctx.stroke(); ctx.restore();
      txt(ctx, commas(ymax, 0), L - 4, t2 + 6, { align: 'right', size: 10 }); txt(ctx, commas(ymin, 0), L - 4, t2 + h2 - 6, { align: 'right', size: 10 });
      ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(L, Y(D0)); ctx.lineTo(X(0), Y(debt[0])); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); debt.forEach(function (v, i) { ctx[i ? 'lineTo' : 'moveTo'](X(i), Y(v)); }); ctx.stroke(); ctx.restore();
      debt.forEach(function (v, i) { ctx.save(); ctx.fillStyle = k.purple; ctx.beginPath(); ctx.arc(X(i), Y(v), 4.5, 0, 2 * M.PI); ctx.fill(); ctx.restore(); if (!F.quiet && (n <= 6 || i % 2 === 0 || i === n - 1)) txt(ctx, commas(v, 0), X(i), Y(v) - 12, { align: 'center', size: 10.5, wt: 700, color: k.purple }); });
      yrs.forEach(function (y, i) { txt(ctx, w < 420 ? y.replace('Year ', 'Y') : y, X(i), t2 + h2 + 14, { align: 'center', size: 11 }); });
      var defs = bal.filter(function (b) { return b < 0; }).length, shrink = bal.every(function (b, i) { return i === 0 || b >= bal[i - 1]; });
      var lbl = 'Budget balances ' + bal.map(function (b) { return (b < 0 ? 'deficit ' : b > 0 ? 'surplus ' : '') + M.abs(b); }).join(', ') + '; debt goes from ' + D0 + ' to ' + debt[n - 1] + ' ' + o.unit + '.';
      c.cv.setAttribute('aria-label', F.quiet ? 'Bars of yearly budget balances and a line of the national debt.' : lbl);
      if (!F.quiet) F.out.set('Debt: ' + commas(D0, 0) + ' → <b>' + commas(debt[n - 1], 0) + '</b> ' + o.unit + '. ' + (defs ? 'Each deficit adds to the debt' + (shrink && defs > 1 ? ', even when the deficits are shrinking' : '') + '. ' : '') + (bal.some(function (b) { return b > 0; }) ? 'Only a surplus year brings the debt down.' : 'With no surplus year, the debt never falls.'));
    }
    if (F.inter) V.drag(c.cv, {
      hit: function (px, py) { if (py < geo.t1 || py > geo.t1 + geo.h1) return null; var i = M.floor((px - geo.L) / geo.slot); return i >= 0 && i < n ? i : null; },
      start: function (i) { sel = i; if (ysel) ysel.value = i; },
      move: function (i, px, py) { var y0 = geo.t1 + geo.h1 / 2, v = M.round(((y0 - py) / (geo.h1 / 2) * span) / 10) * 10; bal[i] = M.max(-span, M.min(span, v)); if (sl) sl.set(bal[i]); draw(); }
    });
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });
})(window, document);
