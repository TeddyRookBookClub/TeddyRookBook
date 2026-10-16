/* Math Ladder visuals for Probability and Statistics (course key "stat"). Registered on window.MathLadder.viz.
   Load after viz/core.js. Styles are injected from this file (class prefix "mls-"). No animation: every change redraws
   at once, so prefers-reduced-motion needs no special case.

   stat-chart   a still chart for lessons and problems (no statistics in a readout, so it never gives an answer away)
     kind: "dots" | "hist" | "bar" | "box" | "scatter" | "resid"
     dots:    data: [values], step: 1, min, max
     hist:    bins: [[lo, hi, count], …]  or  data: [values] with width and start
     bar:     cats: [["Bus", 12], …], ylabel ("count" by default)
     box:     boxes: [{name, min, q1, med, q3, max, out: [outliers]}, …]  (or data: [values] for one box)
     scatter: points: [[x, y], …], line: [a, b] (draws ŷ = a + bx), mark: index of a point to highlight as "P"
     resid:   points: [[x, residual], …] (a residual plot with a zero line)
     marks:   [{x, label, color: "red" | "purple" | "blue" | "green" | "gold"}]  vertical marker lines (dots, hist, box)
     tail:    "right" | "left"  label the long tail of a histogram or dot plot
     xlabel, ylabel, height, label (aria-label)

   stat-ci      the confidence-interval machine: draw samples, build intervals, and count how many catch the truth
     p: 0.6 (true proportion), n: 50 (slider 10 … 400), level: 95 (80, 90, 95 or 99), batch: 20, seed: 0, task

   stat-icons   natural frequencies for a screening test (base rates and Bayes' rule): a grid of N people
     N: 1000 (100, 1000 or 10000 shown as 1000 squares of 10), prev: 0.01, sens: 0.9, fpr: 0.09, sliders: true,
     cond: "have the condition", test: "test positive", task

   stat-shuffle a randomization test: reshuffle the group labels and build the distribution of differences in means
     a: [values], b: [values], names: ["New", "Old"], tail: "right" | "left" | "two", seed: 0, task

   stat-curve   t or chi-square curves with a shaded tail, next to the standard normal
     dist: "t" | "chi2", df: 5, x: 2 (the test statistic; drag it or use the slider), tail: "right" | "left" | "two"
     (t only; chi-square is right-tailed), compare: true (overlay the standard normal for t), dfmax: 30, task

   stat-power   power and the two kinds of error: the sampling distribution under H0 and under a true alternative
     mu0: 100, mua: 104, sigma: 10, n: 25, alpha: 0.05 (0.01, 0.05 or 0.10), sliders: true, task           */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/stat.js: load viz/core.js first'); return; }
  var M = Math, TAU = 2 * M.PI, fm = V.fmt;

  // ---------------------------------------------------------------- styles
  (function css() {
    if (D.getElementById('mls-css')) return;
    var s = D.createElement('style'); s.id = 'mls-css';
    s.textContent = [
      '.ml-viz.mls{overflow:hidden}',
      '.mls .mls-task{display:flex;gap:.55rem;align-items:flex-start;margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}',
      '.mls .mls-btns{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}',
      '.mls .mls-stat{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:.4rem;margin:.55rem 0 0}',
      '.mls .mls-stat div{background:var(--mv-card);border:1px solid var(--mv-line);border-radius:10px;padding:.35rem .55rem;font-size:.8rem;color:var(--mv-muted);line-height:1.3}',
      '.mls .mls-stat b{display:block;color:var(--mv-ink);font-size:1.05rem;font-variant-numeric:tabular-nums}',
      '.mls .mls-key{display:flex;flex-wrap:wrap;gap:.3rem .9rem;margin:.5rem 0 0;font-size:.85rem;color:var(--mv-ink)}',
      '.mls .mls-key span{display:inline-flex;align-items:center;gap:.35rem}',
      '.mls .mls-key i{display:inline-block;width:.9rem;height:.9rem;border-radius:3px;box-sizing:border-box}',
      '.mls .ml-readout{overflow-wrap:anywhere}',
      '.mls .ml-readout b{font-variant-numeric:tabular-nums}',
      '.mls .ml-ctl:empty{display:none}',
      '.mls .ml-sl-val{white-space:nowrap}',
      '.mls .ml-cv:focus-visible{outline:3px solid #b8963e;outline-offset:2px}',
      '@media (max-width:480px){.ml-viz.mls{padding:.55rem}.mls .mls-task{font-size:.9rem}.mls .ml-sl{min-width:130px;flex-basis:130px}}'
    ].join('\n');
    (D.head || D.documentElement).appendChild(s);
  })();

  // ---------------------------------------------------------------- distributions (same methods as gen/stat.js)
  function lgamma(z) {
    var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return M.log(M.PI / M.abs(M.sin(M.PI * z))) - lgamma(1 - z);
    z -= 1; var x = c[0]; for (var i = 1; i < 9; i++) x += c[i] / (z + i); var t = z + 7.5; return 0.5 * M.log(2 * M.PI) + (z + 0.5) * M.log(t) - t + M.log(x);
  }
  function igam(a, x) {
    if (x <= 0) return [0, 1]; var pre = M.exp(-x + a * M.log(x) - lgamma(a)), i;
    if (x < a + 1) { var ap = a, s = 1 / a, d = s; for (i = 0; i < 1000; i++) { ap += 1; d *= x / ap; s += d; if (M.abs(d) < M.abs(s) * 1e-15) break; } return [s * pre, 1 - s * pre]; }
    var b = x + 1 - a, c = 1e300, dd = 1 / b, h = dd;
    for (i = 1; i < 1000; i++) { var an = -i * (i - a); b += 2; dd = an * dd + b; if (M.abs(dd) < 1e-300) dd = 1e-300; c = b + an / c; if (M.abs(c) < 1e-300) c = 1e-300; dd = 1 / dd; var dl = dd * c; h *= dl; if (M.abs(dl - 1) < 1e-15) break; }
    return [1 - pre * h, pre * h];
  }
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap; if (M.abs(d) < 1e-300) d = 1e-300; d = 1 / d; var h = d;
    for (var m = 1; m <= 300; m++) { var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (M.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (M.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c; aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (M.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (M.abs(c) < 1e-300) c = 1e-300; d = 1 / d; var del = d * c; h *= del; if (M.abs(del - 1) < 1e-15) break; }
    return h;
  }
  function ibeta(x, a, b) { if (x <= 0) return 0; if (x >= 1) return 1; var bt = M.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * M.log(x) + b * M.log(1 - x)); return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b; }
  function Phi(z) { var q = 0.5 * igam(0.5, z * z / 2)[1]; return z < 0 ? q : 1 - q; }
  function PhiInv(p) { var lo = -9, hi = 9; for (var i = 0; i < 70; i++) { var m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function npdf(z) { return M.exp(-z * z / 2) / M.sqrt(TAU); }
  function tpdf(t, df) { return M.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * M.log(df * M.PI) - (df + 1) / 2 * M.log(1 + t * t / df)); }
  function tcdf(t, df) { var x = df / (df + t * t), p = 0.5 * ibeta(x, df / 2, 0.5); return t > 0 ? 1 - p : p; }
  function c2pdf(x, k) { return x <= 0 ? 0 : M.exp((k / 2 - 1) * M.log(x) - x / 2 - (k / 2) * M.log(2) - lgamma(k / 2)); }
  function c2sf(x, k) { return igam(k / 2, x / 2)[1]; }

  // ---------------------------------------------------------------- small helpers
  function mk(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function num(v, d) { var x = typeof v === 'number' ? v : parseFloat(v); return isFinite(x) ? x : d; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rgba(hex, a) { if (!/^#/.test(hex)) return hex; var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function rng(seed) { var a = (seed >>> 0) || (M.random() * 4294967296 >>> 0) || 1; return function () { a = a + 0x6D2B79F5 | 0; var t = M.imul(a ^ a >>> 15, 1 | a); t = t + M.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function txt(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = (o.italic ? 'italic ' : '') + (o.bold ? '700 ' : '') + (o.size || 12) + 'px system-ui,sans-serif';
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
    if (o.halo) { ctx.lineWidth = 4; ctx.strokeStyle = o.halo; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.color || '#000'; ctx.fillText(s, x, y); ctx.restore();
  }
  function line(ctx, x1, y1, x2, y2, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  function niceStep(span, px) { var raw = span / M.max(2, px / 70), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  function xAxis(ctx, k, X, lo, hi, y, x0, x1, label) {
    line(ctx, x0, y, x1, y, k.axis, 1.5);
    var st = niceStep(hi - lo, x1 - x0);
    for (var v = M.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) { var px = X(v); if (px < x0 - 1 || px > x1 + 1) continue; line(ctx, px, y, px, y + 5, k.axis, 1); txt(ctx, fm(v, 4), px, y + 15, { align: 'center', size: 11, color: k.muted }); }
    if (label) txt(ctx, label, (x0 + x1) / 2, y + 32, { align: 'center', size: 12, color: k.ink, italic: true });
  }
  function shell(el, o, label) {
    el.classList.add('mls'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label') || el.getAttribute('aria-label') === el.dataset.viz) el.setAttribute('aria-label', o.label || label);
    var S = {};
    if (o.task) { S.task = mk('p', 'mls-task', '<span>' + o.task + '</span>'); el.appendChild(S.task); if (ML.typeset) try { ML.typeset(S.task); } catch (e) { } }
    S.box = mk('div', 'mls-box'); el.appendChild(S.box);
    S.ctl = mk('div', 'ml-ctl'); el.appendChild(S.ctl);
    S.out = V.readout(el);
    S.canvas = function (q) { var c = V.canvas(S.box, q); c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || label); return c; };
    S.row = function () { var r = mk('div', 'ml-ctl'); el.insertBefore(r, S.out.el); return r; };
    return S;
  }
  function live(c, draw) { c.onResize(draw); V.onTheme(draw); draw(); }
  var COL = function (k, name) { return k[name] || name || k.blue; };

  // ================================================================ stat-chart
  V.register('stat-chart', function (el, o) {
    o = o || {}; var kind = o.kind || 'dots';
    var desc = { dots: 'A dot plot', hist: 'A histogram', bar: 'A bar graph', box: 'Box plots', scatter: 'A scatterplot', resid: 'A residual plot' }[kind] || 'A chart';
    el.classList.add('mls'); el.setAttribute('role', 'img');
    if (!el.getAttribute('aria-label') || /picture for this problem/.test(el.getAttribute('aria-label'))) el.setAttribute('aria-label', o.label || desc + (o.xlabel ? ' of ' + o.xlabel : ''));
    var box = mk('div', 'mls-box'); el.appendChild(box);
    var ht = num(o.height, kind === 'box' ? 90 + 56 * ((o.boxes || [1]).length) : kind === 'scatter' || kind === 'resid' ? 300 : 230);
    var c = V.canvas(box, { height: ht }); c.cv.setAttribute('aria-hidden', 'true');
    var draw = {
      dots: function (k, ctx, w, h) {
        var data = (o.data || []).map(Number), step = num(o.step, 1), lo = num(o.min, M.min.apply(null, data) - step), hi = num(o.max, M.max.apply(null, data) + step);
        var x0 = 18, x1 = w - 18, ay = h - (o.xlabel ? 44 : 28), X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
        var cnt = {}, r = clamp(M.min((x1 - x0) / ((hi - lo) / step) / 2 - 1, 9), 3, 9), maxStack = 1;
        data.forEach(function (v) { var key = M.round(v / step); cnt[key] = (cnt[key] || 0) + 1; maxStack = M.max(maxStack, cnt[key]); });
        r = M.min(r, (ay - 14) / (2 * maxStack + 1)); var seen = {};
        data.slice().sort(function (a, b) { return a - b; }).forEach(function (v) { var key = M.round(v / step); seen[key] = (seen[key] || 0) + 1; ctx.beginPath(); ctx.arc(X(v), ay - r - 1 - (seen[key] - 1) * (2 * r + 1), r, 0, TAU); ctx.fillStyle = k.blue; ctx.fill(); });
        xAxis(ctx, k, X, lo, hi, ay, x0, x1, o.xlabel);
        marks(ctx, k, X, 14, ay); tail(ctx, k, x0, x1, 18);
      },
      hist: function (k, ctx, w, h) {
        var bins = o.bins;
        if (!bins && o.data) { var wd = num(o.width, 1), st = num(o.start, M.floor(M.min.apply(null, o.data) / wd) * wd), b = {}; o.data.forEach(function (v) { var i = M.floor((v - st) / wd + 1e-9); b[i] = (b[i] || 0) + 1; }); var mx = M.max.apply(null, Object.keys(b).map(Number)); bins = []; for (var i = 0; i <= mx; i++) bins.push([st + i * wd, st + (i + 1) * wd, b[i] || 0]); }
        bins = bins || [];
        var lo = bins[0][0], hi = bins[bins.length - 1][1], top = M.max.apply(null, bins.map(function (q) { return q[2]; })) || 1;
        var x0 = 34, x1 = w - 14, ay = h - (o.xlabel ? 44 : 28), yt = 16, X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); }, Y = function (v) { return ay - v / top * (ay - yt); };
        var ys = niceStep(top, ay - yt); for (var v = ys; v <= top + 1e-9; v += ys) { line(ctx, x0, Y(v), x1, Y(v), k.grid, 1); txt(ctx, fm(v, 2), x0 - 5, Y(v), { align: 'right', size: 11, color: k.muted }); }
        bins.forEach(function (q) { ctx.fillStyle = rgba(k.teal, 0.55); ctx.strokeStyle = k.teal; ctx.lineWidth = 1.2; ctx.fillRect(X(q[0]), Y(q[2]), X(q[1]) - X(q[0]), ay - Y(q[2])); ctx.strokeRect(X(q[0]) + 0.5, Y(q[2]) + 0.5, X(q[1]) - X(q[0]) - 1, ay - Y(q[2])); });
        xAxis(ctx, k, X, lo, hi, ay, x0, x1, o.xlabel);
        if (o.ylabel) txt(ctx, o.ylabel, x0 + 4, 8, { size: 11, color: k.muted, italic: true });
        marks(ctx, k, X, yt, ay); tail(ctx, k, x0, x1, yt + 4);
      },
      bar: function (k, ctx, w, h) {
        var cats = o.cats || [], top = M.max.apply(null, cats.map(function (q) { return +q[1]; })) || 1, x0 = 40, x1 = w - 12, ay = h - 40, yt = 18, Y = function (v) { return ay - v / top * (ay - yt); };
        var ys = niceStep(top, ay - yt); for (var v = ys; v <= top + 1e-9; v += ys) { line(ctx, x0, Y(v), x1, Y(v), k.grid, 1); txt(ctx, fm(v, 2), x0 - 5, Y(v), { align: 'right', size: 11, color: k.muted }); }
        var bw = (x1 - x0) / cats.length, pal = [k.blue, k.green, k.gold, k.purple, k.orange, k.teal, k.pink];
        cats.forEach(function (q, i) { var x = x0 + i * bw + bw * 0.18; ctx.fillStyle = rgba(pal[i % pal.length], 0.75); ctx.fillRect(x, Y(+q[1]), bw * 0.64, ay - Y(+q[1])); txt(ctx, String(q[0]), x0 + (i + 0.5) * bw, ay + 14, { align: 'center', size: 11, color: k.ink }); });
        line(ctx, x0, ay, x1, ay, k.axis, 1.5);
        txt(ctx, o.ylabel || 'count', x0 + 4, 8, { size: 11, color: k.muted, italic: true });
      },
      box: function (k, ctx, w, h) {
        var boxes = o.boxes || (o.data ? [five(o.data)] : []);
        var all = []; boxes.forEach(function (b) { all.push(b.min, b.max); (b.out || []).forEach(function (x) { all.push(x); }); });
        var lo = num(o.min, M.min.apply(null, all)), hi = num(o.max, M.max.apply(null, all)), pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
        var nameW = boxes.some(function (b) { return b.name; }) ? M.min(110, w * 0.26) : 10, x0 = nameW + 8, x1 = w - 16, ay = h - (o.xlabel ? 44 : 28), X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
        var rowH = (ay - 10) / boxes.length;
        boxes.forEach(function (b, i) {
          var cy = 10 + rowH * (i + 0.5), bh = M.min(34, rowH * 0.55), col = i % 2 ? k.purple : k.blue;
          if (b.name) txt(ctx, b.name, 6, cy, { size: 12, color: k.ink, bold: true });
          line(ctx, X(b.min), cy, X(b.q1), cy, k.ink, 1.6); line(ctx, X(b.q3), cy, X(b.max), cy, k.ink, 1.6);
          line(ctx, X(b.min), cy - bh / 3, X(b.min), cy + bh / 3, k.ink, 1.6); line(ctx, X(b.max), cy - bh / 3, X(b.max), cy + bh / 3, k.ink, 1.6);
          ctx.fillStyle = rgba(col, 0.22); ctx.fillRect(X(b.q1), cy - bh / 2, X(b.q3) - X(b.q1), bh); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(X(b.q1), cy - bh / 2, X(b.q3) - X(b.q1), bh);
          line(ctx, X(b.med), cy - bh / 2, X(b.med), cy + bh / 2, col, 3);
          (b.out || []).forEach(function (x) { ctx.beginPath(); ctx.arc(X(x), cy, 4, 0, TAU); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.stroke(); });
        });
        xAxis(ctx, k, X, lo, hi, ay, x0, x1, o.xlabel);
        marks(ctx, k, X, 6, ay);
      },
      scatter: function (k, ctx, w, h) { plotXY(k, ctx, w, h, false); },
      resid: function (k, ctx, w, h) { plotXY(k, ctx, w, h, true); }
    };
    function five(a) { var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length, h = n >> 1, med = function (q) { var m = q.length >> 1; return q.length % 2 ? q[m] : (q[m - 1] + q[m]) / 2; }; return { min: s[0], q1: med(s.slice(0, h)), med: med(s), q3: med(s.slice(n % 2 ? h + 1 : h)), max: s[n - 1] }; }
    function marks(ctx, k, X, yt, ay) { (o.marks || []).forEach(function (m, i) { var col = COL(k, m.color || (i ? 'purple' : 'red')), x = X(+m.x), ly = yt + 4 + i * 15; line(ctx, x, ly + 8, x, ay, col, 2, [6, 4]); if (m.label) txt(ctx, m.label, x, ly, { align: x > c.w - 50 ? 'right' : x < 50 ? 'left' : 'center', size: 12, bold: true, color: col, halo: k.bg }); }); }
    function tail(ctx, k, x0, x1, y) { if (!o.tail) return; var r = o.tail === 'right', a = r ? x1 - 120 : x0 + 120, b = r ? x1 - 14 : x0 + 14; line(ctx, a, y, b, y, k.orange, 2); ctx.save(); ctx.fillStyle = k.orange; ctx.beginPath(); ctx.moveTo(b, y); ctx.lineTo(b + (r ? -8 : 8), y - 5); ctx.lineTo(b + (r ? -8 : 8), y + 5); ctx.closePath(); ctx.fill(); ctx.restore(); txt(ctx, 'long tail', (a + b) / 2, y - 10, { align: 'center', size: 12, bold: true, color: k.orange, halo: k.bg }); }
    function plotXY(k, ctx, w, h, resid) {
      var pts = (o.points || []).map(function (p) { return [+p[0], +p[1]]; }), xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var xa = num(o.xmin, M.min.apply(null, xs)), xb = num(o.xmax, M.max.apply(null, xs)), ya = num(o.ymin, M.min.apply(null, ys.concat(resid ? [0] : []))), yb = num(o.ymax, M.max.apply(null, ys.concat(resid ? [0] : [])));
      var px = (xb - xa) * 0.08 || 1, py = (yb - ya) * 0.1 || 1; xa -= px; xb += px; ya -= py; yb += py;
      if (resid) { var my = M.max(M.abs(ya), M.abs(yb)); ya = -my; yb = my; }
      var x0 = 44, x1 = w - 14, y0 = 14, y1 = h - (o.xlabel ? 44 : 30), X = function (v) { return x0 + (v - xa) / (xb - xa) * (x1 - x0); }, Y = function (v) { return y1 - (v - ya) / (yb - ya) * (y1 - y0); };
      var sy = niceStep(yb - ya, (y1 - y0) * 1.6); for (var v = M.ceil(ya / sy) * sy; v <= yb + 1e-9; v += sy) { line(ctx, x0, Y(v), x1, Y(v), k.grid, 1); txt(ctx, fm(v, 4), x0 - 5, Y(v), { align: 'right', size: 11, color: k.muted }); }
      if (resid) line(ctx, x0, Y(0), x1, Y(0), k.red, 2, [7, 5]);
      line(ctx, x0, y0, x0, y1, k.axis, 1.5);
      if (o.line && !resid) { var a = +o.line[0], b = +o.line[1]; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); line(ctx, X(xa), Y(a + b * xa), X(xb), Y(a + b * xb), k.blue, 2.5); ctx.restore(); }
      pts.forEach(function (p, i) { var hl = o.mark === i; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), hl ? 7 : 4.5, 0, TAU); ctx.fillStyle = hl ? k.red : k.ink; ctx.fill(); if (hl) txt(ctx, 'P', X(p[0]) + 10, Y(p[1]) - 10, { size: 14, bold: true, color: k.red, halo: k.bg }); });
      xAxis(ctx, k, X, xa, xb, y1, x0, x1, o.xlabel || (resid ? 'x' : ''));
      txt(ctx, o.ylabel || (resid ? 'residual' : ''), x0 + 6, 8, { size: 11, italic: true, color: k.muted });
    }
    function redraw() { var k = V.colors(), ctx = c.ctx; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h); try { (draw[kind] || draw.dots)(k, ctx, c.w, c.h); } catch (e) { if (W.console) W.console.error(e); } }
    live(c, redraw);
    return { draw: redraw };
  });

  // ================================================================ stat-ci
  V.register('stat-ci', function (el, o) {
    o = o || {}; var S = shell(el, o, 'Confidence intervals from many samples'), rnd = rng(num(o.seed, 0)), st = { p: clamp(num(o.p, 0.6), 0.05, 0.95), n: clamp(num(o.n, 50), 10, 400), lev: [80, 90, 95, 99].indexOf(+o.level) >= 0 ? +o.level : 95 }, list = [], batch = clamp(num(o.batch, 20), 1, 100);
    var c = S.canvas({ height: 330 }), ZS = { 80: 1.282, 90: 1.645, 95: 1.96, 99: 2.576 };
    V.seg(S.ctl, { label: 'Confidence level', items: [[80, '80%'], [90, '90%'], [95, '95%'], [99, '99%']], value: st.lev, change: function (v) { st.lev = +v; list = []; draw(); } });
    var r2 = S.row();
    V.slider(r2, { label: 'sample size n', min: 10, max: 400, step: 10, value: st.n, input: function (v) { st.n = v; list = []; draw(); } });
    V.slider(r2, { label: 'true proportion p', min: 0.1, max: 0.9, step: 0.05, value: st.p, input: function (v) { st.p = v; list = []; draw(); } });
    var bt = mk('div', 'mls-btns'); S.row().appendChild(bt);
    V.button(bt, 'Take 1 sample', function () { take(1); }, 'pri'); V.button(bt, '+' + batch, function () { take(batch); }); V.button(bt, '+100', function () { take(100); }); V.button(bt, 'Reset', function () { list = []; draw(); });
    function take(m) { for (var j = 0; j < m; j++) { var x = 0; for (var i = 0; i < st.n; i++) if (rnd() < st.p) x++; var ph = x / st.n, me = ZS[st.lev] * M.sqrt(ph * (1 - ph) / st.n); list.push([ph, ph - me, ph + me]); } draw(); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, x0 = 16, x1 = w - 16, ay = h - 28, X = function (v) { return x0 + v * (x1 - x0); };
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var show = list.slice(-40), rowH = M.min(12, (ay - 30) / M.max(show.length, 1));
      xAxis(ctx, k, X, 0, 1, ay, x0, x1, '');
      line(ctx, X(st.p), 12, X(st.p), ay, k.ink, 2, [5, 4]); txt(ctx, 'true p = ' + fm(st.p, 2), X(st.p), 8, { align: 'center', size: 12, bold: true, color: k.ink, halo: k.bg });
      show.forEach(function (q, i) { var hit = q[1] <= st.p && st.p <= q[2], y = ay - 10 - (show.length - i) * rowH + rowH / 2, col = hit ? k.green : k.red; line(ctx, X(clamp(q[1], 0, 1)), y, X(clamp(q[2], 0, 1)), y, col, M.max(2, rowH * 0.45)); ctx.beginPath(); ctx.arc(X(q[0]), y, M.max(2, rowH * 0.3), 0, TAU); ctx.fillStyle = k.ink; ctx.fill(); });
      if (!list.length) txt(ctx, 'Take samples to build intervals', w / 2, h / 2, { align: 'center', size: 14, color: k.muted });
      var hits = list.filter(function (q) { return q[1] <= st.p && st.p <= q[2]; }).length;
      S.out.set(list.length ? 'Each line is one sample\'s interval: $\\hat{p} \\pm ' + ZS[st.lev] + '\\sqrt{\\hat{p}(1 - \\hat{p})/n}$. <b>' + hits + '</b> of <b>' + list.length + '</b> intervals (<b>' + fm(100 * hits / list.length, 1) + '%</b>) caught the true p; the misses are red. In the long run about ' + st.lev + '% catch it. Any one interval either did or did not.' + (list.length > 40 ? ' (Showing the last 40.)' : '') : 'Set a confidence level, then take samples. Green intervals catch the true p; red ones miss.');
    }
    live(c, draw);
    return { draw: draw };
  });

  // ================================================================ stat-icons
  V.register('stat-icons', function (el, o) {
    o = o || {}; var S = shell(el, o, 'Natural frequencies for a screening test'), N = [100, 1000, 10000].indexOf(+o.N) >= 0 ? +o.N : 1000;
    var st = { prev: clamp(num(o.prev, 0.01), 0.001, 0.5), sens: clamp(num(o.sens, 0.9), 0.5, 1), fpr: clamp(num(o.fpr, 0.09), 0, 0.5) }, cond = o.cond || 'have the condition';
    var cq = { height: 240 }, c = S.canvas(cq);
    var key = mk('div', 'mls-key'); S.box.appendChild(key);
    if (o.sliders !== false) {
      var r1 = S.row();
      V.slider(r1, { label: 'base rate', min: 0.001, max: 0.3, step: 0.001, value: st.prev, fmt: function (v) { return fm(v * 100, 1) + '%'; }, input: function (v) { st.prev = v; draw(); } });
      V.slider(r1, { label: 'positive if they have it', min: 0.5, max: 1, step: 0.01, value: st.sens, fmt: function (v) { return fm(v * 100, 0) + '%'; }, input: function (v) { st.sens = v; draw(); } });
      V.slider(r1, { label: 'false positive rate', min: 0, max: 0.3, step: 0.005, value: st.fpr, fmt: function (v) { return fm(v * 100, 1) + '%'; }, input: function (v) { st.fpr = v; draw(); } });
    }
    function counts() { var d = M.round(N * st.prev), tp = M.round(d * st.sens), fp = M.round((N - d) * st.fpr); return { d: d, tp: tp, fn: d - tp, fp: fp, tn: N - d - fp }; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, q = counts(), cells = N === 10000 ? 1000 : N, per = N / cells;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var cols = N === 100 ? (w < 520 ? 10 : 20) : (w < 520 ? 40 : 50), rows = M.ceil(cells / cols), sz = M.min((w - 16) / cols, N === 100 ? 34 : 16), want = M.round(rows * sz + 16);
      if (cq.height !== want) { cq.height = want; c.fit(); w = c.w; h = c.h; ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h); }
      var gx = (w - sz * cols) / 2, gy = (h - sz * rows) / 2;
      var kinds = [], add = function (n, t) { for (var i = 0; i < M.round(n / per); i++) kinds.push(t); };
      add(q.tp, 'tp'); add(q.fn, 'fn'); add(q.fp, 'fp'); while (kinds.length < cells) kinds.push('tn'); kinds.length = cells;
      var fill = { tp: k.red, fn: k.bg, fp: k.gold, tn: rgba(k.muted, 0.22) };
      kinds.forEach(function (t, i) { var x = gx + (i % cols) * sz, y = gy + M.floor(i / cols) * sz, s = sz * 0.82; ctx.fillStyle = fill[t]; ctx.fillRect(x, y, s, s); if (t === 'fn') { ctx.strokeStyle = k.red; ctx.lineWidth = M.max(1, sz * 0.12); ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1); } });
      key.innerHTML = '<span><i style="background:' + k.red + '"></i>' + cond + ', test positive</span><span><i style="border:2px solid ' + k.red + '"></i>' + cond + ', test negative</span><span><i style="background:' + k.gold + '"></i>false positive</span><span><i style="background:' + rgba(k.muted, 0.35) + '"></i>true negative</span>' + (per > 1 ? '<span>(each square = ' + per + ' people)</span>' : '');
      var pos = q.tp + q.fp, pp = pos ? q.tp / pos : 0;
      S.out.set('Out of <b>' + N.toLocaleString('en-US') + '</b> people, <b>' + q.d.toLocaleString('en-US') + '</b> ' + cond + ' and <b>' + q.tp.toLocaleString('en-US') + '</b> of them test positive. Of the <b>' + (N - q.d).toLocaleString('en-US') + '</b> who do not, <b>' + q.fp.toLocaleString('en-US') + '</b> test positive anyway. So of <b>' + pos.toLocaleString('en-US') + '</b> positive tests, only <b>' + q.tp.toLocaleString('en-US') + '</b> are real: P(' + cond.replace(/^(have|has|carry) (the |a |an )?/, '') + ' | positive) ≈ <b>' + fm(100 * pp, 1) + '%</b>.');
    }
    live(c, draw);
    return { draw: draw };
  });

  // ================================================================ stat-shuffle
  V.register('stat-shuffle', function (el, o) {
    o = o || {}; var S = shell(el, o, 'A randomization test by reshuffling'), A = (o.a || [24, 27, 29, 31, 33, 35]).map(Number), B = (o.b || [20, 22, 23, 26, 27, 28]).map(Number), names = o.names || ['New', 'Old'], tailK = o.tail || 'right', rnd = rng(num(o.seed, 0));
    var all = A.concat(B), na = A.length, mean = function (a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }, obs = mean(A) - mean(B), diffs = [], cur = null;
    var c = S.canvas({ height: 350 });
    var bt = mk('div', 'mls-btns'); S.ctl.appendChild(bt);
    V.button(bt, 'Shuffle once', function () { run(1); }, 'pri'); V.button(bt, '+100', function () { run(100); }); V.button(bt, '+1000', function () { run(1000); }); V.button(bt, 'Reset', function () { diffs = []; cur = null; draw(); });
    function shuffle() { var a = all.slice(); for (var i = a.length - 1; i > 0; i--) { var j = M.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function run(m) { for (var r = 0; r < m; r++) { var s = shuffle(); cur = s; diffs.push(mean(s.slice(0, na)) - mean(s.slice(na))); } draw(); }
    function extreme(d) { return tailK === 'two' ? M.abs(d) >= M.abs(obs) - 1e-9 : tailK === 'left' ? d <= obs + 1e-9 : d >= obs - 1e-9; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h; ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var lo = M.min.apply(null, all), hi = M.max.apply(null, all), x0 = 16, x1 = w - 16, X = function (v) { return x0 + (v - lo + 1) / (hi - lo + 2) * (x1 - x0); };
      var groups = cur ? [cur.slice(0, na), cur.slice(na)] : [A, B], lab = cur ? ['Shuffled ' + names[0], 'Shuffled ' + names[1]] : [names[0], names[1]];
      [0, 1].forEach(function (g) { var y = 40 + g * 46, cnt = {}; txt(ctx, lab[g] + ' (mean ' + fm(mean(groups[g]), 2) + ')', 6, y - 26, { size: 12, bold: true, color: g ? k.purple : k.blue }); line(ctx, x0, y + 10, x1, y + 10, k.grid, 1); groups[g].forEach(function (v) { cnt[v] = (cnt[v] || 0) + 1; ctx.beginPath(); ctx.arc(X(v), y + 4 - (cnt[v] - 1) * 9, 4.5, 0, TAU); ctx.fillStyle = g ? k.purple : k.blue; ctx.fill(); }); var m = mean(groups[g]); line(ctx, X(m), y - 12, X(m), y + 14, k.ink, 2); });
      // histogram of shuffled differences
      var top = 128, bot = h - 44, span = M.max(M.abs(obs) * 1.6, 1) , dl = -span, dh = span; diffs.forEach(function (d) { dl = M.min(dl, d); dh = M.max(dh, d); });
      var XD = function (v) { return 20 + (v - dl) / (dh - dl) * (w - 40); }, nb = 30, bw = (dh - dl) / nb, bins = new Array(nb).fill(0), ext = new Array(nb).fill(0);
      diffs.forEach(function (d) { var i = clamp(M.floor((d - dl) / bw), 0, nb - 1); bins[i]++; if (extreme(d)) ext[i]++; });
      var mx = M.max.apply(null, bins.concat([1]));
      bins.forEach(function (b, i) { if (!b) return; var hh = b / mx * (bot - top - 16), x = XD(dl + i * bw); ctx.fillStyle = rgba(k.teal, 0.5); ctx.fillRect(x + 0.5, bot - hh, XD(dl + (i + 1) * bw) - x - 1, hh); if (ext[i]) { var he = ext[i] / mx * (bot - top - 16); ctx.fillStyle = rgba(k.red, 0.75); ctx.fillRect(x + 0.5, bot - he, XD(dl + (i + 1) * bw) - x - 1, he); } });
      xAxis(ctx, k, XD, dl, dh, bot, 20, w - 20, 'difference in means (' + names[0] + ' − ' + names[1] + ') after shuffling');
      line(ctx, XD(obs), top, XD(obs), bot, k.red, 2.5, [6, 4]); txt(ctx, 'observed ' + fm(obs, 2), XD(obs), top - 6, { align: 'center', size: 12, bold: true, color: k.red, halo: k.bg });
      if (tailK === 'two') line(ctx, XD(-obs), top, XD(-obs), bot, k.red, 1.5, [3, 4]);
      var e = diffs.filter(extreme).length;
      S.out.set('Observed difference in means: <b>' + fm(obs, 2) + '</b>. Shuffles so far: <b>' + diffs.length + '</b>. ' + (diffs.length ? 'At least as extreme as observed: <b>' + e + '</b>, so the estimated p-value is <b>' + fm(e / diffs.length, 3) + '</b>. ' : '') + 'Each shuffle pretends the treatment does nothing, so the group labels could be swapped freely.');
    }
    live(c, draw);
    return { draw: draw };
  });

  // ================================================================ stat-curve
  V.register('stat-curve', function (el, o) {
    o = o || {}; var chi = o.dist === 'chi2', S = shell(el, o, chi ? 'The chi-square distribution' : 'The t distribution'), st = { df: clamp(M.round(num(o.df, 5)), 1, 60), x: num(o.x, chi ? 6 : 2), tail: chi ? 'right' : (o.tail || 'right') };
    var dfmax = clamp(num(o.dfmax, 30), 2, 60), c = S.canvas({ height: 270 }), xr = function () { return chi ? [0, M.max(12, st.df + 5 * M.sqrt(2 * st.df))] : [-4.5, 4.5]; };
    if (!chi) V.seg(S.ctl, { label: 'Tail', items: [['left', 'Left'], ['right', 'Right'], ['two', 'Both tails']], value: st.tail, change: function (v) { st.tail = v; draw(); } });
    var r2 = S.row();
    V.slider(r2, { label: 'degrees of freedom', min: 1, max: dfmax, step: 1, value: st.df, input: function (v) { st.df = v; draw(); } });
    var xs = V.slider(r2, { label: chi ? 'χ² statistic' : 't statistic', min: chi ? 0 : -4, max: chi ? 40 : 4, step: chi ? 0.1 : 0.01, value: st.x, input: function (v) { st.x = v; draw(); } });
    var P = { X: null };
    V.drag(c.cv, { hit: function (px) { return P.X && M.abs(px - P.X(st.x)) < 22 ? 1 : null; }, move: function (h, px) { var r = xr(); st.x = M.round(clamp(r[0] + (px - 20) / (c.w - 40) * (r[1] - r[0]), chi ? 0 : -4, chi ? 40 : 4) * 100) / 100; xs.set(st.x); draw(); } });
    c.cv.style.touchAction = 'pan-y';
    function f(x) { return chi ? c2pdf(x, st.df) : tpdf(x, st.df); }
    function area() { if (chi) return c2sf(st.x, st.df); var L = tcdf(st.x, st.df); return st.tail === 'left' ? L : st.tail === 'right' ? 1 - L : 2 * (1 - tcdf(M.abs(st.x), st.df)); }
    function areaN() { var L = Phi(st.x); return st.tail === 'left' ? L : st.tail === 'right' ? 1 - L : 2 * (1 - Phi(M.abs(st.x))); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, r = xr(), x0 = 20, x1 = w - 20, ay = h - 34, X = function (v) { return x0 + (v - r[0]) / (r[1] - r[0]) * (x1 - x0); };
      P.X = X; ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var top = 0; for (var i = 0; i <= 200; i++) { var xv = r[0] + (r[1] - r[0]) * i / 200; top = M.max(top, f(xv), chi ? 0 : npdf(xv)); }
      top = M.min(top, chi && st.df <= 2 ? 0.6 : top);
      var Y = function (v) { return ay - M.min(v, top * 1.05) / (top * 1.08) * (ay - 14); };
      function inTail(xv) { return chi ? xv >= st.x : st.tail === 'left' ? xv <= st.x : st.tail === 'right' ? xv >= st.x : M.abs(xv) >= M.abs(st.x); }
      ctx.fillStyle = rgba(k.red, 0.35); ctx.beginPath(); var on = false;
      for (i = 0; i <= 400; i++) { xv = r[0] + (r[1] - r[0]) * i / 400; if (inTail(xv)) { if (!on) { ctx.moveTo(X(xv), ay); on = true; } ctx.lineTo(X(xv), Y(f(xv))); } else if (on) { ctx.lineTo(X(xv), ay); ctx.closePath(); ctx.fill(); ctx.beginPath(); on = false; } }
      if (on) { ctx.lineTo(X(r[1]), ay); ctx.closePath(); ctx.fill(); }
      if (!chi && o.compare !== false) { ctx.save(); ctx.strokeStyle = k.muted; ctx.lineWidth = 1.8; ctx.setLineDash([6, 5]); ctx.beginPath(); for (i = 0; i <= 200; i++) { xv = r[0] + (r[1] - r[0]) * i / 200; if (i) ctx.lineTo(X(xv), Y(npdf(xv))); else ctx.moveTo(X(xv), Y(npdf(xv))); } ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 2.6; ctx.beginPath(); for (i = 0; i <= 300; i++) { xv = r[0] + (r[1] - r[0]) * i / 300 + (chi && i === 0 ? 1e-3 : 0); if (i) ctx.lineTo(X(xv), Y(f(xv))); else ctx.moveTo(X(xv), Y(f(xv))); } ctx.stroke(); ctx.restore();
      xAxis(ctx, k, X, r[0], r[1], ay, x0, x1, '');
      line(ctx, X(st.x), 14, X(st.x), ay, k.red, 2.2); ctx.beginPath(); ctx.arc(X(st.x), ay, 7, 0, TAU); ctx.fillStyle = k.red; ctx.fill();
      txt(ctx, (chi ? 'χ² = ' : 't = ') + fm(st.x, 2), X(st.x), 10, { align: X(st.x) > w - 60 ? 'right' : X(st.x) < 60 ? 'left' : 'center', size: 12, bold: true, color: k.red, halo: k.bg });
      var a = area();
      S.out.set((chi ? 'Chi-square curve with <b>' + st.df + '</b> degrees of freedom. Area to the right of ' + fm(st.x, 2) + ' (the p-value): <b>' + fm(a, 4) + '</b>. The curve is skewed right and its mean is the df.' : 't curve with <b>' + st.df + '</b> degrees of freedom (blue) and the standard normal (dashed gray). Shaded area: <b>' + fm(a, 4) + '</b>; the normal curve would give ' + fm(areaN(), 4) + '. Fewer degrees of freedom mean heavier tails; as df grows, t approaches the normal.'));
    }
    live(c, draw);
    return { draw: draw };
  });

  // ================================================================ stat-power
  V.register('stat-power', function (el, o) {
    o = o || {}; var S = shell(el, o, 'Type I error, Type II error and power'), st = { mu0: num(o.mu0, 100), mua: num(o.mua, 104), sg: num(o.sigma, 10), n: clamp(M.round(num(o.n, 25)), 4, 400), a: [0.01, 0.05, 0.1].indexOf(+o.alpha) >= 0 ? +o.alpha : 0.05 };
    var c = S.canvas({ height: 290 }), stats = mk('div', 'mls-stat'); S.box.appendChild(stats);
    V.seg(S.ctl, { label: 'Significance level', items: [[0.01, 'α = 0.01'], [0.05, 'α = 0.05'], [0.1, 'α = 0.10']], value: st.a, change: function (v) { st.a = +v; draw(); } });
    if (o.sliders !== false) {
      var r2 = S.row();
      V.slider(r2, { label: 'true mean μ', min: st.mu0, max: st.mu0 + 3 * st.sg, step: st.sg / 20, value: st.mua, input: function (v) { st.mua = v; draw(); } });
      V.slider(r2, { label: 'sample size n', min: 4, max: 200, step: 1, value: st.n, input: function (v) { st.n = v; draw(); } });
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, se = st.sg / M.sqrt(st.n), cut = st.mu0 + PhiInv(1 - st.a) * se;
      var lo = st.mu0 - 3.5 * se, hi = M.max(st.mua, st.mu0) + 3.5 * se, x0 = 14, x1 = w - 14, ay = h - 44, X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); }, pk = npdf(0) / se, Y = function (v) { return ay - v / (pk * 1.15) * (ay - 16); };
      var f0 = function (x) { return npdf((x - st.mu0) / se) / se; }, f1 = function (x) { return npdf((x - st.mua) / se) / se; };
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      function shade(fn, a, b, col) { if (b <= a) return; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X(a), ay); for (var i = 0; i <= 120; i++) { var xv = a + (b - a) * i / 120; ctx.lineTo(X(xv), Y(fn(xv))); } ctx.lineTo(X(b), ay); ctx.closePath(); ctx.fill(); }
      shade(f1, cut, hi, rgba(k.green, 0.35)); shade(f1, lo, cut, rgba(k.gold, 0.4)); shade(f0, cut, hi, rgba(k.red, 0.55));
      [[f0, k.ink, 'H₀: μ = ' + fm(st.mu0, 2), st.mu0, 'right'], [f1, k.blue, 'true μ = ' + fm(st.mua, 2), st.mua, 'left']].forEach(function (q) { ctx.save(); ctx.strokeStyle = q[1]; ctx.lineWidth = 2.4; ctx.beginPath(); for (var i = 0; i <= 200; i++) { var xv = lo + (hi - lo) * i / 200; if (i) ctx.lineTo(X(xv), Y(q[0](xv))); else ctx.moveTo(X(xv), Y(q[0](xv))); } ctx.stroke(); ctx.restore(); var lx = q[4] === 'right' ? X(q[3] - 0.9 * se) - 4 : X(q[3] + 0.9 * se) + 4; txt(ctx, q[2], clamp(lx, 4, w - 4), Y(q[0](q[3] + (q[4] === 'right' ? -0.9 : 0.9) * se)) - 6, { align: q[4], size: 12, bold: true, color: q[1], halo: k.bg }); });
      line(ctx, X(cut), 22, X(cut), ay, k.red, 2.2, [6, 4]); txt(ctx, 'reject H₀ if x̄ > ' + fm(cut, 2), X(cut) > w / 2 ? X(cut) - 4 : X(cut) + 4, 12, { align: X(cut) > w / 2 ? 'right' : 'left', size: 12, bold: true, color: k.red, halo: k.bg });
      xAxis(ctx, k, X, lo, hi, ay, x0, x1, 'sample mean x̄');
      var beta = Phi((cut - st.mua) / se), pw = 1 - beta;
      stats.innerHTML = '<div><span style="color:' + k.red + '">■</span> Type I error α<b>' + fm(st.a, 3) + '</b></div><div><span style="color:' + k.gold + '">■</span> Type II error β<b>' + fm(beta, 3) + '</b></div><div><span style="color:' + k.green + '">■</span> Power 1 − β<b>' + fm(pw, 3) + '</b></div>';
      S.out.set('Both curves are sampling distributions of x̄, with spread σ/√n = ' + fm(se, 3) + '. Red: the chance of rejecting a true H₀ (α). Gold: the chance of missing the real difference (β). Green: power. A bigger n narrows both curves, so power grows; a smaller α moves the cutoff right, so β grows.');
    }
    live(c, draw);
    return { draw: draw };
  });
})(window, document);
