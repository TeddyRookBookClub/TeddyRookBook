/* Difference-in-Differences and Event Studies (/business/econometrics/difference-in-differences/): drawing and controls
   for the three simulations. The models are in model.js (window.Ec12Model); statistics from stats.js (window.EconStats). */
(function () {
  'use strict';
  var PFX = 'ec12';
  /* ---------- shared drawing and control helpers (the same block in every chapter 12-17 sim.js) ---------- */
  var L = window.TRBLab, S = window.EconStats, D = document;
  if (!L || !S) return;
  var C = { bg: '#06111a', bg2: '#0b1b27', card: 'rgba(14,34,48,.92)', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', grid: 'rgba(120,170,200,.11)',
    green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', orange: '#ffa94d' };
  var MONO = 'ui-monospace,Menlo,Consolas,monospace', SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var reduced = L.reduced, fmt = L.fmt, TAU = Math.PI * 2;
  function $(id) { return D.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rgba(hex, a) { return 'rgba(' + parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16) + ',' + a + ')'; }
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // text: o = {col, size, weight, align, base, mono, max}
  function txt(c, s, x, y, o) {
    o = o || {}; c.font = (o.weight || 400) + ' ' + (o.size || 12) + 'px ' + (o.mono ? MONO : SANS);
    c.fillStyle = o.col || C.ink; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    if (o.max) c.fillText(s, x, y, o.max); else c.fillText(s, x, y);
  }
  function tw(c, s, size, weight, mono) { c.font = (weight || 400) + ' ' + (size || 12) + 'px ' + (mono ? MONO : SANS); return c.measureText(s).width; }
  // a dark card with a title, like the panels inside the simulations
  function card(c, x, y, w, h, title, col) {
    rr(c, x, y, w, h, 10); c.fillStyle = C.card; c.fill(); c.strokeStyle = C.line; c.lineWidth = 1; c.stroke();
    if (title) txt(c, title, x + 10, y + 17, { size: 11, weight: 700, col: col || C.muted, max: w - 20 });
  }
  // a plot area that maps data to pixels: P.X(v), P.Y(v), P.iX(px), P.iY(py)
  function Plot(x, y, w, h, xr, yr) {
    var P = { x: x, y: y, w: w, h: h, xr: xr, yr: yr };
    P.X = function (v) { return P.x + (v - P.xr[0]) / (P.xr[1] - P.xr[0]) * P.w; };
    P.Y = function (v) { return P.y + P.h - (v - P.yr[0]) / (P.yr[1] - P.yr[0]) * P.h; };
    P.iX = function (px) { return P.xr[0] + (px - P.x) / P.w * (P.xr[1] - P.xr[0]); };
    P.iY = function (py) { return P.yr[0] + (P.y + P.h - py) / P.h * (P.yr[1] - P.yr[0]); };
    P.inside = function (px, py) { return px >= P.x && px <= P.x + P.w && py >= P.y && py <= P.y + P.h; };
    return P;
  }
  // axes with grid lines and tick labels: o = {xt, yt (tick counts), xf, yf (label formatters), xlab, ylab, noX, noY, xticks, yticks}
  function axes(c, P, o) {
    o = o || {}; c.save(); c.lineWidth = 1;
    var xt = o.xticks || S.niceTicks(P.xr[0], P.xr[1], o.xt || 5).ticks, yt = o.yticks || S.niceTicks(P.yr[0], P.yr[1], o.yt || 4).ticks;
    c.strokeStyle = C.grid; c.beginPath();
    yt.forEach(function (v) { if (v < P.yr[0] - 1e-9 || v > P.yr[1] + 1e-9) return; var py = Math.round(P.Y(v)) + 0.5; c.moveTo(P.x, py); c.lineTo(P.x + P.w, py); });
    if (!o.noXgrid) xt.forEach(function (v) { if (v < P.xr[0] - 1e-9 || v > P.xr[1] + 1e-9) return; var px = Math.round(P.X(v)) + 0.5; c.moveTo(px, P.y); c.lineTo(px, P.y + P.h); });
    c.stroke();
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(P.x, P.y + P.h + 0.5); c.lineTo(P.x + P.w, P.y + P.h + 0.5); c.stroke();
    var xf = o.xf || function (v) { return fmt(v, dec(xt)); }, yf = o.yf || function (v) { return fmt(v, dec(yt)); };
    if (!o.noX) xt.forEach(function (v) { if (v < P.xr[0] - 1e-9 || v > P.xr[1] + 1e-9) return; txt(c, xf(v), P.X(v), P.y + P.h + 13, { size: 10, col: C.muted, align: 'center', mono: true }); });
    if (!o.noY) yt.forEach(function (v) { if (v < P.yr[0] - 1e-9 || v > P.yr[1] + 1e-9) return; txt(c, yf(v), P.x - 5, P.Y(v) + 3, { size: 10, col: C.muted, align: 'right', mono: true }); });
    if (o.xlab) txt(c, o.xlab, P.x + P.w / 2, P.y + P.h + 27, { size: 11, col: C.muted, align: 'center' });
    if (o.ylab) { c.translate(P.x - (o.ylabOff || 34), P.y + P.h / 2); c.rotate(-Math.PI / 2); txt(c, o.ylab, 0, 0, { size: 11, col: C.muted, align: 'center' }); }
    c.restore();
  }
  function dec(ticks) { if (ticks.length < 2) return 0; var s = Math.abs(ticks[1] - ticks[0]); return s >= 1 ? 0 : s >= 0.1 ? 1 : s >= 0.01 ? 2 : 3; }
  function clip(c, P, pad) { pad = pad || 0; c.save(); c.beginPath(); c.rect(P.x - pad, P.y - pad, P.w + 2 * pad, P.h + 2 * pad); c.clip(); }
  // a polyline through data points: xs, ys arrays (or a function f(x) sampled over the x range when ys is a function)
  function curve(c, P, xs, ys, col, lw, dash) {
    c.save(); c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.lineCap = 'round'; if (dash) c.setLineDash(dash);
    c.beginPath(); var started = false;
    for (var i = 0; i < xs.length; i++) { var yv = ys[i]; if (!isFinite(yv)) { started = false; continue; } var px = P.X(xs[i]), py = P.Y(yv); if (!started) { c.moveTo(px, py); started = true; } else c.lineTo(px, py); }
    c.stroke(); c.restore();
  }
  function fn(c, P, f, col, lw, dash, a, b, n) {
    a = a === undefined ? P.xr[0] : a; b = b === undefined ? P.xr[1] : b; n = n || 120; var xs = [], ys = [];
    for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n; xs.push(x); ys.push(f(x)); }
    curve(c, P, xs, ys, col, lw, dash);
  }
  function dot(c, x, y, r, fill, stroke, lw) { c.beginPath(); c.arc(x, y, r, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } }
  function seg(el, attr, cur, cb) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); cb(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd' + (r[2] ? ' class="' + r[2] + '"' : '') + '>' + r[1] + '</dd>'; }).join(''); }
  // a range slider bound to a state object: o = {el, out, get(), set(v), show(v)}
  function slider(id, get, set, show) {
    var el = $(id), out = $(id + '-o');
    function sync() { el.value = get(); if (out) out.textContent = show(get()); }
    el.addEventListener('input', function () { set(+el.value); if (out) out.textContent = show(+el.value); });
    sync(); return sync;
  }
  function counts(vals, lo, hi, nb) { var c = new Array(nb).fill(0), w = (hi - lo) / nb; vals.forEach(function (v) { var k = Math.floor((v - lo) / w); if (k >= 0 && k < nb) c[k]++; }); return c; }
  // pointer helper: positions in CSS pixels relative to the canvas
  function pointer(cv, h) {
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    var down = false;
    cv.addEventListener('pointerdown', function (e) { var p = pos(e); down = true; if (h.down && h.down(p.x, p.y, e) !== false) { try { cv.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); } });
    cv.addEventListener('pointermove', function (e) { var p = pos(e); if (down && h.drag) h.drag(p.x, p.y, e); else if (h.hover) h.hover(p.x, p.y, e); });
    function up(e) { if (!down) return; down = false; var p = pos(e); if (h.up) h.up(p.x, p.y, e); }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', function () { if (!down && h.leave) h.leave(); });
  }
  function celebrate(el) {
    if (reduced || !el) return;
    el.classList.remove(PFX + '-win'); void el.offsetWidth; el.classList.add(PFX + '-win');
    setTimeout(function () { el.classList.remove(PFX + '-win'); }, 1300);
  }
  function pText(p) { return p < 0.001 ? '< 0.001' : fmt(p, 3); }
  function pEq(p) { return p < 0.001 ? 'p < 0.001' : 'p = ' + fmt(p, 3); }

  var M = window.Ec12Model, root = $('ec12-lab');
  if (!M || !root) return;
  var store = L.store('econ-did');

  /* ---------- missions ---------- */
  var MIS = [
    { id: 'two', title: 'Two wrong answers', goal: 'Try “Before vs after” and “Treated vs control”, then “DiD”. Each naive comparison misses for a different reason; DiD fixes both.', sec: 'ec12-view' },
    { id: 'break', title: 'Break the trend', goal: 'Move “Break parallel trends” until the bias is bigger than the true effect itself (with a true effect of at least 1).', sec: 'ec12-view' },
    { id: 'unbiased', title: 'Right on average', goal: 'With parallel trends (break = 0), run 1,000 studies. The average DiD should land within 0.05 of the truth.', sec: 'ec12-view' },
    { id: 'biased', title: 'Confidently wrong', goal: 'Break the trend by 1 or more and run 1,000 studies. Fewer than half of the 95% intervals now contain the truth.', sec: 'ec12-view' },
    { id: 'size', title: 'False alarms', goal: 'Set the true effect and the trend break to 0 and run 1,000 studies. About 5% still find a “significant” effect.', sec: 'ec12-view' },
    { id: 'pre', title: 'Catch a pre-trend', goal: 'In the event study, add a pre-trend or anticipation until the joint test of the leads rejects (p < 0.05).', sec: 'ec12-ev' },
    { id: 'flip', title: 'Wrong sign', goal: 'In “Staggered adoption”, make two-way fixed effects come out negative while every true effect is positive.', sec: 'ec12-st' },
    { id: 'clean', title: 'Clean comparisons', goal: 'Find a setup where TWFE misses the true average effect by more than 1 while Callaway and Sant’Anna’s estimate gets it right.', sec: 'ec12-st' }
  ];
  var view = $('ec12-view'), mis = L.missions($('ec12-missions'), 'econ-did', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    if (id === 'size') { st.tau = 0; st.delta = 0; syncAll(); refit(); }
    if (id === 'unbiased') { st.delta = 0; syncAll(); refit(); }
    var el = $(m.sec); if (el && m.sec !== 'ec12-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }

  /* =========================================================================================
     1. The 2x2: treated and control, before and after
     ========================================================================================= */
  var PRE = {
    clean: { tau: 1.5, delta: 0, n: 40, sd: 1.5 },
    trend: { tau: 1.5, delta: 2, n: 40, sd: 1.5 },
    noisy: { tau: 1.5, delta: 0, n: 15, sd: 4 },
    zero: { tau: 0, delta: 0, n: 40, sd: 1.5 }
  };
  var st = { tau: +store.get('tau', 1.5), delta: +store.get('delta', 0), n: +store.get('n', 40), sd: +store.get('sd', 1.5), est: store.get('est', 'did'),
    paths: store.get('paths', false), truth: store.get('truth', true), seed: 11 };
  var seen = { did: 0, ba: 0, cs: 0 };
  var cv = $('ec12-cv'), G = L.canvas(cv), ctx = G.c, hud = $('ec12-hud');
  var data, E, mc = null, dirty = true;
  function params() { return { nT: st.n, nC: st.n, tau: st.tau, delta: st.delta, g: -2, gap: -3, base: 23, sdU: 3, sd: st.sd }; }
  function refit(keepMc) {
    data = M.gen2x2(params(), st.seed); E = M.est2x2(data);
    if (!keepMc) mc = null;
    dirty = true; readout(); checks();
  }
  function estOf(e) { return st.est === 'ba' ? e.ba : st.est === 'cs' ? e.cs : e.did; }
  function cfHat(e) { return st.est === 'ba' ? e.m.T0 : st.est === 'cs' ? e.m.C1 : e.cfDid; }
  var EST_NAME = { did: 'Difference-in-differences', ba: 'Before vs after (treated only)', cs: 'Treated vs control (after only)' };

  // Monte Carlo: 1,000 fresh samples with the same settings, drawn a few dozen per frame
  function startMC() {
    mc = { est: st.est, vals: [], cover: 0, rej: 0, n: 0, target: 1000, key: key() };
    L.toast(view, 'Running 1,000 studies with these settings…');
    var r = view.getBoundingClientRect();
    if (r.bottom < 60 || r.top > window.innerHeight - 60) view.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    pump();
  }
  // the studies run in small batches on a timer, so they finish even while the picture is off screen
  function pump() { if (!mc || mc.n >= mc.target) return; stepMC(); dirty = true; if (mc && mc.n < mc.target) setTimeout(pump, 16); }
  function key() { return [st.tau, st.delta, st.n, st.sd, st.est].join('|'); }
  function stepMC() {
    if (!mc || mc.n >= mc.target) return false;
    var per = reduced ? 1000 : 40, pp = params();
    for (var r = 0; r < per && mc.n < mc.target; r++) {
      var d = M.gen2x2(pp, 900001 + mc.n * 7919), v, se, df;
      if (mc.est === 'did') { var q = M.quick2x2(d); v = q.did; se = q.se; df = q.df; }
      else {
        // naive comparisons: a difference in two group means, with the usual unequal-variance standard error
        var a = [], b = [];
        d.forEach(function (u) { if (mc.est === 'ba') { if (u.treat) { a.push(u.y1); b.push(u.y0); } } else { if (u.treat) a.push(u.y1); else b.push(u.y1); } });
        v = S.mean(a) - S.mean(b); se = Math.sqrt(S.variance(a) / a.length + S.variance(b) / b.length); df = a.length + b.length - 2;
        if (mc.est === 'ba') { var dd = d.filter(function (u) { return u.treat; }).map(function (u) { return u.y1 - u.y0; }); se = S.sd(dd) / Math.sqrt(dd.length); df = dd.length - 1; }
      }
      var tc = S.tInv(0.975, df);
      mc.vals.push(v); if (Math.abs(v - st.tau) <= tc * se) mc.cover++; if (Math.abs(v) > tc * se) mc.rej++; mc.n++;
    }
    if (mc.n >= mc.target) mcDone();
    return true;
  }
  function mcDone() {
    var m = S.mean(mc.vals), cov = mc.cover / mc.n, rej = mc.rej / mc.n;
    readout();
    if (mc.est === 'did' && st.delta === 0 && Math.abs(m - st.tau) < 0.05) win('unbiased', 'Average estimate ' + fmt(m, 3) + ' vs truth ' + fmt(st.tau, 1) + ': unbiased.');
    if (mc.est === 'did' && Math.abs(st.delta) >= 1 && cov < 0.5) win('biased', 'Only ' + Math.round(cov * 100) + '% of the intervals contain the truth. Precise, and wrong.');
    if (mc.est === 'did' && st.tau === 0 && st.delta === 0 && rej >= 0.03 && rej <= 0.07) win('size', Math.round(rej * 1000) / 10 + '% false alarms at the 5% level, as promised.');
  }
  function checks() {
    seen[st.est] = 1;
    if (seen.ba && seen.cs && st.est === 'did') win('two', 'DiD subtracts the common change and the starting gap at once.');
    if (Math.abs(st.tau) >= 1 && Math.abs(st.delta) > Math.abs(st.tau)) win('break', 'The bias (' + fmt(st.delta, 1) + ') is now bigger than the effect (' + fmt(st.tau, 1) + ').');
  }

  function layout(w, h) {
    if (w >= 640) {
      var lw = Math.round(w * 0.57), rx = lw + 6, rw = w - rx - 10, top = 54, rh = h - top - 10, h1 = Math.round(rh * 0.5);
      return { wide: true, main: { x: 0, y: 0, w: lw, h: h }, reg: { x: rx, y: top, w: rw, h: h1 - 5 }, mc: { x: rx, y: top + h1 + 5, w: rw, h: rh - h1 - 5 } };
    }
    var mh = Math.round(h * 0.52), rest = h - mh - 14, r1 = Math.round(rest * 0.5);
    return { wide: false, main: { x: 0, y: 0, w: w, h: mh }, reg: { x: 8, y: mh + 4, w: w - 16, h: r1 - 4 }, mc: { x: 8, y: mh + r1 + 4, w: w - 16, h: rest - r1 } };
  }
  function draw() {
    G.fit(); var c = ctx, w = G.w, h = G.h; c.clearRect(0, 0, w, h);
    var Lo = layout(w, h), m = E.m;
    // y range from the stores' outcomes (2nd to 98th percentile) and the group means
    var all = []; data.forEach(function (u) { all.push(u.y0, u.y1); });
    var lo = Math.min(S.quantile(all, 0.02), m.CF, E.cfDid, cfHat(E)), hi = Math.max(S.quantile(all, 0.98), m.CF, E.cfDid);
    var pad = (hi - lo) * 0.1 + 0.5; lo -= pad; hi += pad;
    var A = Lo.main, P = Plot(A.x + 46, A.y + (Lo.wide ? 74 : 66), A.w - (Lo.wide ? 70 : 60), A.h - (Lo.wide ? 74 : 66) - 34, [-0.42, 1.42], [lo, hi]);
    axes(c, P, { xticks: [], yt: 5, ylab: 'Jobs per store', ylabOff: 32 });
    txt(c, 'Before', P.X(0), P.y + P.h + 16, { size: 12, weight: 700, col: C.muted, align: 'center' });
    txt(c, 'After', P.X(1), P.y + P.h + 16, { size: 12, weight: 700, col: C.muted, align: 'center' });
    c.save(); c.setLineDash([3, 5]); c.strokeStyle = 'rgba(255,212,121,.35)'; c.beginPath(); c.moveTo(P.X(0.5), P.y); c.lineTo(P.X(0.5), P.y + P.h); c.stroke(); c.restore();
    txt(c, 'policy starts', P.X(0.5), P.y - 4, { size: 10, col: 'rgba(255,212,121,.75)', align: 'center' });
    clip(c, P, 2);
    // each store, with its own path if asked
    var sm = data.length > 200 ? 2 : 2.6;
    data.forEach(function (u) {
      var col = u.treat ? C.gold : C.blue, off = u.treat ? 0.05 + 0.2 * u.j0 : -0.05 - 0.2 * u.j0;
      if (st.paths) { c.strokeStyle = rgba(col, 0.16); c.lineWidth = 1; c.beginPath(); c.moveTo(P.X(off), P.Y(u.y0)); c.lineTo(P.X(1 + off), P.Y(u.y1)); c.stroke(); }
      dot(c, P.X(off), P.Y(u.y0), sm, rgba(col, 0.45)); dot(c, P.X(1 + off), P.Y(u.y1), sm, rgba(col, 0.45));
    });
    c.restore();
    // group means and the counterfactuals
    function seg2(x0, y0, x1, y1, col, lw, dash) { c.save(); c.strokeStyle = col; c.lineWidth = lw; if (dash) c.setLineDash(dash); c.beginPath(); c.moveTo(P.X(x0), P.Y(y0)); c.lineTo(P.X(x1), P.Y(y1)); c.stroke(); c.restore(); }
    seg2(0, m.C0, 1, m.C1, C.blue, 3);
    seg2(0, m.T0, 1, m.T1, C.gold, 3);
    var ch = cfHat(E);
    if (st.truth) seg2(0, m.T0, 1, m.CF, C.pink, 2, [2, 5]);
    seg2(0, m.T0, 1, ch, C.gold, 2.2, [8, 6]);
    dot(c, P.X(0), P.Y(m.C0), 6, C.blue, '#06111a', 2); dot(c, P.X(1), P.Y(m.C1), 6, C.blue, '#06111a', 2);
    dot(c, P.X(0), P.Y(m.T0), 6, C.gold, '#06111a', 2); dot(c, P.X(1), P.Y(m.T1), 6, C.gold, '#06111a', 2);
    dot(c, P.X(1), P.Y(ch), 5, '#06111a', C.gold, 2);
    if (st.truth) dot(c, P.X(1), P.Y(m.CF), 4, C.pink);
    // brackets: the estimate, and its error against the truth
    function bracket(x, a, b, col, label, side) {
      var px = P.X(x), ya = P.Y(a), yb = P.Y(b); c.save(); c.strokeStyle = col; c.lineWidth = 2;
      c.beginPath(); c.moveTo(px - 5, ya); c.lineTo(px, ya); c.lineTo(px, yb); c.lineTo(px - 5, yb); c.stroke(); c.restore();
      var ly = (ya + yb) / 2; if (Math.abs(ya - yb) < 14) ly = Math.min(ya, yb) - 8;
      txt(c, label, px + 6, ly + 4, { size: 11, weight: 700, col: col, mono: true });
    }
    var est = estOf(E);
    bracket(1.12, ch, m.T1, C.green, (st.est === 'did' ? 'DiD ' : 'est ') + fmt(est, 2));
    if (st.truth && Math.abs(ch - m.CF) > 0.02) bracket(1.06, m.CF, ch, C.red, '');
    // legend
    var lx = P.x + 4, ly = P.y + 12, items = [[C.gold, 'treated', 0], [C.blue, 'control', 0], [C.gold, 'assumed path without the policy', [8, 6]]];
    if (st.truth) items.push([C.pink, 'true path without the policy', [2, 5]]);
    if (!Lo.wide) items = items.slice(0, st.truth ? 4 : 3);
    c.save(); c.fillStyle = 'rgba(6,17,26,.72)'; rr(c, lx - 4, ly - 11, Lo.wide ? 214 : Math.min(214, P.w - 4), items.length * 15 + 6, 6); c.fill(); c.restore();
    items.forEach(function (it, i) {
      c.save(); c.strokeStyle = it[0]; c.lineWidth = 2.2; if (it[2]) c.setLineDash(it[2]); c.beginPath(); c.moveTo(lx, ly + i * 15 - 3); c.lineTo(lx + 22, ly + i * 15 - 3); c.stroke(); c.restore();
      txt(c, it[1], lx + 28, ly + i * 15 + 1, { size: 11, col: C.ink });
    });
    if (st.truth && Math.abs(ch - m.CF) > 0.05) {
      var err = ch - m.CF; // the estimate is too small by err
      txt(c, 'error ' + fmt(-err, 2), P.X(1.06) - 8, (P.Y(ch) + P.Y(m.CF)) / 2 + 4, { size: 11, weight: 700, col: C.red, align: 'right', mono: true });
    }
    drawReg(c, Lo.reg, Lo.wide); drawMC(c, Lo.mc, Lo.wide);
    hud.innerHTML = '<b>' + EST_NAME[st.est] + '</b><br>estimate ' + fmt(est, 2) + ' · true effect ' + fmt(st.tau, 2);
  }
  function drawReg(c, A, wide) {
    card(c, A.x, A.y, A.w, A.h, 'THE DiD REGRESSION · ' + (2 * data.length) + ' ROWS, ' + data.length + ' CLUSTERS');
    var R = E.reg, x = A.x + 10, y = A.y + 34, small = A.w < 330 || A.h < 150, fs = small ? 10.5 : 12;
    txt(c, 'y = β₀ + δ₀·d2 + β₁·dT + δ₁·d2·dT + u', x, y, { size: small ? 11 : 12.5, col: C.ink, max: A.w - 20 });
    var rows = [['β₀', R.b[0], R.se[0], 'control, before', C.blue], ['β₁', R.b[1], R.se[1], 'treated − control, before', C.muted], ['δ₀', R.b[2], R.se[2], 'change for control', C.muted], ['δ₁', R.b[3], R.se[3], 'the DiD', C.green]];
    var lh = Math.max(15, Math.min(22, (A.h - 64) / 5)), y0 = y + lh + 2;
    var cx = [x, x + 30, x + (small ? 88 : 100), x + (small ? 150 : 172)];
    txt(c, 'estimate', cx[1], y0 - 2, { size: 10, col: C.muted }); txt(c, '(SE)', cx[2], y0 - 2, { size: 10, col: C.muted });
    rows.forEach(function (r, i) {
      var yy = y0 + (i + 1) * lh;
      if (i === 3) { c.fillStyle = 'rgba(99,230,190,.10)'; c.fillRect(A.x + 4, yy - lh + 5, A.w - 8, lh); }
      txt(c, r[0], cx[0], yy, { size: fs, weight: 700, col: r[4] });
      txt(c, fmt(r[1], 2), cx[1], yy, { size: fs, mono: true, col: C.ink });
      txt(c, '(' + fmt(r[2], 2) + ')', cx[2], yy, { size: fs, mono: true, col: C.muted });
      txt(c, r[3], cx[3], yy, { size: fs - 0.5, col: r[4] === C.muted ? C.muted : r[4], max: A.x + A.w - cx[3] - 8 });
    });
    var ci = R.ci(0.95)[3], yy = y0 + 5 * lh + 2;
    if (yy < A.y + A.h - 4) txt(c, '95% CI for δ₁: [' + fmt(ci[0], 2) + ', ' + fmt(ci[1], 2) + ']  ·  SEs clustered by store', x, yy, { size: 10.5, col: C.muted, max: A.w - 20 });
    // the four cells rebuilt from the coefficients (the regression is saturated)
    var top = yy + 12, room = A.y + A.h - top - 6;
    if (room >= 62) {
      var b = R.b, cw = (A.w - 20 - 62) / 2, rh = Math.min(22, (room - 16) / 2), gx = x + 62;
      txt(c, 'before', gx + cw / 2, top + 10, { size: 10, col: C.muted, align: 'center' }); txt(c, 'after', gx + cw * 1.5, top + 10, { size: 10, col: C.muted, align: 'center' });
      var cells = [[['β₀', b[0]], ['β₀+δ₀', b[0] + b[2]]], [['β₀+β₁', b[0] + b[1]], ['β₀+δ₀+β₁+δ₁', b[0] + b[1] + b[2] + b[3]]]];
      ['control', 'treated'].forEach(function (g, gi) {
        var ry = top + 16 + gi * rh;
        txt(c, g, x, ry + rh / 2 + 4, { size: 10.5, weight: 700, col: gi ? C.gold : C.blue });
        cells[gi].forEach(function (cl, ci2) {
          rr(c, gx + ci2 * cw + 2, ry + 1, cw - 4, rh - 2, 5); c.fillStyle = gi && ci2 ? 'rgba(99,230,190,.12)' : 'rgba(120,170,200,.07)'; c.fill();
          txt(c, cl[0] + ' = ' + fmt(cl[1], 2), gx + ci2 * cw + cw / 2, ry + rh / 2 + 4, { size: 10.5, mono: true, col: gi && ci2 ? C.green : C.ink, align: 'center', max: cw - 8 });
        });
      });
    }
  }
  function drawMC(c, A, wide) {
    var title = 'SAMPLING DISTRIBUTION · ' + (mc ? mc.n.toLocaleString('en-US') : 0) + ' STUDIES';
    card(c, A.x, A.y, A.w, A.h, title);
    var P = Plot(A.x + 14, A.y + 30, A.w - 28, A.h - 66, [0, 1], [0, 1]);
    if (!mc || !mc.vals.length) {
      txt(c, 'Press “Run 1,000 studies” (or the R key) to draw', A.x + A.w / 2, A.y + A.h / 2 - 4, { size: 12, col: C.muted, align: 'center', max: A.w - 20 });
      txt(c, 'a fresh sample 1,000 times with these settings.', A.x + A.w / 2, A.y + A.h / 2 + 13, { size: 12, col: C.muted, align: 'center', max: A.w - 20 });
      return;
    }
    var sdv = Math.max(0.15, S.sd(mc.vals.length > 2 ? mc.vals : [0, 1])), mid = (S.mean(mc.vals) + st.tau) / 2;
    var span = Math.max(Math.abs(S.mean(mc.vals) - st.tau) + 4 * sdv, 2.5), lo = mid - span / 2 - 0.3, hi = mid + span / 2 + 0.3;
    var nb = 36, cnt = counts(mc.vals, lo, hi, nb), mx = Math.max.apply(null, cnt) || 1;
    P.xr = [lo, hi]; P.yr = [0, mx * 1.15];
    axes(c, P, { yticks: [], xt: 5 });
    var bw = P.w / nb;
    for (var i = 0; i < nb; i++) { if (!cnt[i]) continue; var y = P.Y(cnt[i]); c.fillStyle = rgba(st.est === 'did' ? C.green : C.violet, 0.55); c.fillRect(P.x + i * bw + 0.5, y, bw - 1, P.y + P.h - y); }
    var mean = S.mean(mc.vals);
    c.save(); c.lineWidth = 2; c.strokeStyle = C.gold; c.beginPath(); c.moveTo(P.X(st.tau), P.y - 4); c.lineTo(P.X(st.tau), P.y + P.h); c.stroke();
    c.setLineDash([4, 3]); c.strokeStyle = C.ink; c.beginPath(); c.moveTo(P.X(mean), P.y + 6); c.lineTo(P.X(mean), P.y + P.h); c.stroke(); c.restore();
    txt(c, 'truth', P.X(st.tau) + 3, P.y + 6, { size: 10, col: C.gold });
    var cov = mc.cover / mc.n;
    txt(c, 'mean ' + fmt(mean, 2) + ' · sd ' + fmt(S.sd(mc.vals.length > 1 ? mc.vals : [0, 0]), 2) + ' · CIs with the truth ' + Math.round(cov * 1000) / 10 + '%', A.x + 10, A.y + A.h - 8, { size: 10.5, col: C.ink, mono: true, max: A.w - 20 });
  }
  function readout() {
    var R = E.reg, ci = R.ci(0.95)[3], est = estOf(E), rows = [
      ['Treated: before → after', fmt(E.m.T0, 2) + ' → ' + fmt(E.m.T1, 2)],
      ['Control: before → after', fmt(E.m.C0, 2) + ' → ' + fmt(E.m.C1, 2)],
      ['Your comparison', fmt(est, 2)],
      ['DiD (δ₁) and clustered SE', fmt(E.did, 2) + ' (' + fmt(R.se[3], 2) + ')'],
      ['95% CI', '[' + fmt(ci[0], 2) + ', ' + fmt(ci[1], 2) + ']'],
      ['True effect', fmt(st.tau, 2)],
      ['Bias built in', st.est === 'did' ? fmt(st.delta, 2) : st.est === 'ba' ? fmt(-2 + st.delta, 2) : fmt(-3 + st.delta, 2)]
    ];
    if (mc && mc.n >= mc.target) rows.push(['1,000 studies: CIs with truth', Math.round(mc.cover / mc.n * 1000) / 10 + '%']);
    dl($('ec12-read'), rows);
  }
  var markPre = seg($('ec12-pre'), 'data-p', store.get('pre', 'clean'), function (k) {
    var p = PRE[k]; st.tau = p.tau; st.delta = p.delta; st.n = p.n; st.sd = p.sd; store.set('pre', k); save(); syncAll(); refit();
  });
  var markEst = seg($('ec12-est'), 'data-e', st.est, function (k) { st.est = k; store.set('est', k); refit(); });
  function save() { store.set('tau', st.tau); store.set('delta', st.delta); store.set('n', st.n); store.set('sd', st.sd); }
  var syncs = [
    slider('ec12-tau', function () { return st.tau; }, function (v) { st.tau = v; save(); refit(); }, function (v) { return fmt(v, 1) + ' jobs'; }),
    slider('ec12-del', function () { return st.delta; }, function (v) { st.delta = v; save(); refit(); }, function (v) { return (v > 0 ? '+' : '') + fmt(v, 1); }),
    slider('ec12-n', function () { return st.n; }, function (v) { st.n = v; save(); refit(); }, function (v) { return v + ' + ' + v; }),
    slider('ec12-sd', function () { return st.sd; }, function (v) { st.sd = v; save(); refit(); }, function (v) { return fmt(v, 1); })
  ];
  function syncAll() { syncs.forEach(function (f) { f(); }); markEst(st.est); }
  var chP = $('ec12-paths'), chT = $('ec12-truth');
  chP.checked = !!st.paths; chT.checked = !!st.truth;
  chP.addEventListener('change', function () { st.paths = chP.checked; store.set('paths', st.paths); dirty = true; });
  chT.addEventListener('change', function () { st.truth = chT.checked; store.set('truth', st.truth); dirty = true; });
  function newSample() { st.seed = 1 + Math.floor(Math.random() * 1e8); refit(true); mc = mc && mc.n >= mc.target ? mc : null; }
  $('ec12-new').addEventListener('click', newSample);
  $('ec12-mc').addEventListener('click', startMC);
  $('ec12-reset').addEventListener('click', function () { markPre('clean'); var p = PRE.clean; st.tau = p.tau; st.delta = p.delta; st.n = p.n; st.sd = p.sd; st.est = 'did'; save(); syncAll(); refit(); });
  $('ec12-new2').addEventListener('click', newSample);
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === 'n' || k === 'N') newSample();
    else if (k === 'r' || k === 'R') startMC();
    else if (k === 'ArrowRight') { st.delta = clamp(Math.round((st.delta + 0.1) * 10) / 10, -3, 3); save(); syncAll(); refit(); }
    else if (k === 'ArrowLeft') { st.delta = clamp(Math.round((st.delta - 0.1) * 10) / 10, -3, 3); save(); syncAll(); refit(); }
    else if (k === 'ArrowUp') { st.tau = clamp(Math.round((st.tau + 0.1) * 10) / 10, -4, 4); save(); syncAll(); refit(); }
    else if (k === 'ArrowDown') { st.tau = clamp(Math.round((st.tau - 0.1) * 10) / 10, -4, 4); save(); syncAll(); refit(); }
    else used = false;
    if (used) e.preventDefault();
  });
  window.addEventListener('resize', function () { dirty = true; dirtyEv = true; dirtySt = true; });
  L.onTheme(function () { dirty = true; });

  /* =========================================================================================
     2. Event study: leads and lags
     ========================================================================================= */
  var ev = { shape: store.get('evShape', 'jump'), size: +store.get('evSize', 2), pretrend: +store.get('evPre', 0), rho: +store.get('evRho', 0.5), n: +store.get('evN', 30), seed: 5 };
  var evCv = $('ec12-ec'), EG = L.canvas(evCv), evD, evE, dirtyEv = true;
  function evParams() { return { nT: ev.n, nC: ev.n, pre: 5, post: 6, shape: ev.shape, size: ev.size, pretrend: ev.pretrend, rho: ev.rho, sd: 1, sdU: 2 }; }
  function evFit() {
    evD = M.genEvent(evParams(), ev.seed); evE = M.estEvent(evD); dirtyEv = true;
    var sig = evE.coef.filter(function (c) { return c.k < -1 && (c.lo > 0 || c.hi < 0); }).length;
    dl($('ec12-evread'), [
      ['Joint test of the 4 leads', 'F = ' + fmt(evE.W / evE.q, 2) + ', ' + pEq(evE.p), evE.p < 0.05 ? 'ec12-bad' : ''],
      ['Leads with CIs away from 0', sig + ' of 4'],
      ['Effect after 3 periods (truth)', fmt(evE.coef[5 + 3].b, 2) + ' (' + fmt(evD.truth[5 + 3], 2) + ')'],
      ['Units (clusters)', (2 * ev.n) + ' · ' + evD.T + ' periods']
    ]);
    if (ev.touched && evE.p < 0.05 && (ev.pretrend !== 0 || ev.shape === 'antic')) win('pre', 'The leads give it away: ' + pEq(evE.p) + '. Parallel trends looks doubtful.', $('ec12-evv'));
  }
  function drawEv() {
    EG.fit(); var c = EG.c, w = EG.w, h = EG.h; c.clearRect(0, 0, w, h);
    var wide = w >= 640, top, P1, P2;
    // group means by period
    var T = evD.T, mT = new Array(T).fill(0), mC = new Array(T).fill(0);
    evD.rows.forEach(function (r) { if (r.treat) mT[r.t] += r.y / ev.n; else mC[r.t] += r.y / ev.n; });
    var ks = []; for (var k = -5; k <= 6; k++) ks.push(k);
    var lo = Math.min.apply(null, mT.concat(mC)), hi = Math.max.apply(null, mT.concat(mC)), pd = (hi - lo) * 0.12 + 0.2;
    if (wide) {
      var lw = Math.round(w * 0.38);
      card(c, 8, 8, lw - 8, h - 16, 'GROUP AVERAGES BY PERIOD');
      P1 = Plot(46, 40, lw - 62, h - 84, [-5.5, 6.5], [lo - pd, hi + pd]);
      card(c, lw + 8, 8, w - lw - 16, h - 16, 'EVENT STUDY: TREATED − CONTROL, RELATIVE TO PERIOD −1');
      P2 = Plot(lw + 50, 40, w - lw - 70, h - 84, [-5.5, 6.5], [0, 1]);
    } else {
      var h1 = Math.round(h * 0.38);
      card(c, 6, 6, w - 12, h1 - 6, 'GROUP AVERAGES BY PERIOD');
      P1 = Plot(42, 34, w - 56, h1 - 64, [-5.5, 6.5], [lo - pd, hi + pd]);
      card(c, 6, h1 + 4, w - 12, h - h1 - 10, 'EVENT STUDY (RELATIVE TO −1)');
      P2 = Plot(42, h1 + 32, w - 56, h - h1 - 74, [-5.5, 6.5], [0, 1]);
    }
    axes(c, P1, { xticks: [-5, -3, -1, 1, 3, 5], yt: 4, xlab: 'periods since the policy' });
    c.save(); c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,212,121,.5)'; c.beginPath(); c.moveTo(P1.X(-0.5), P1.y); c.lineTo(P1.X(-0.5), P1.y + P1.h); c.stroke(); c.restore();
    curve(c, P1, ks, mC, C.blue, 2.4); curve(c, P1, ks, mT, C.gold, 2.4);
    ks.forEach(function (k, i) { dot(c, P1.X(k), P1.Y(mC[i]), 3, C.blue); dot(c, P1.X(k), P1.Y(mT[i]), 3, C.gold); });
    txt(c, 'treated', P1.x + 6, P1.y + 10, { size: 11, col: C.gold, weight: 700 }); txt(c, 'control', P1.x + 62, P1.y + 10, { size: 11, col: C.blue, weight: 700 });
    // coefficients
    var lo2 = 0, hi2 = 0; evE.coef.forEach(function (o) { lo2 = Math.min(lo2, o.lo); hi2 = Math.max(hi2, o.hi); }); evD.truth.forEach(function (v) { lo2 = Math.min(lo2, v); hi2 = Math.max(hi2, v); });
    var p2 = (hi2 - lo2) * 0.1 + 0.2; P2.yr = [lo2 - p2, hi2 + p2];
    axes(c, P2, { xticks: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], yt: 5, xlab: 'periods since the policy (leads ← | → lags)' });
    c.save(); c.strokeStyle = 'rgba(219,231,239,.45)'; c.beginPath(); c.moveTo(P2.x, P2.Y(0)); c.lineTo(P2.x + P2.w, P2.Y(0)); c.stroke();
    c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,212,121,.5)'; c.beginPath(); c.moveTo(P2.X(-0.5), P2.y); c.lineTo(P2.X(-0.5), P2.y + P2.h); c.stroke(); c.restore();
    c.fillStyle = 'rgba(255,135,135,.06)'; c.fillRect(P2.x, P2.y, P2.X(-0.5) - P2.x, P2.h);
    curve(c, P2, ks, evD.truth, C.gold, 2, [6, 5]);
    evE.coef.forEach(function (o) {
      var x = P2.X(o.k), bad = o.k < -1 && (o.lo > 0 || o.hi < 0), col = o.k === -1 ? C.muted : o.k < 0 ? (bad ? C.red : C.blue) : C.green;
      if (o.k !== -1) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x, P2.Y(o.lo)); c.lineTo(x, P2.Y(o.hi)); c.stroke(); c.beginPath(); c.moveTo(x - 4, P2.Y(o.lo)); c.lineTo(x + 4, P2.Y(o.lo)); c.moveTo(x - 4, P2.Y(o.hi)); c.lineTo(x + 4, P2.Y(o.hi)); c.stroke(); }
      dot(c, x, P2.Y(o.b), o.k === -1 ? 4 : 5, o.k === -1 ? '#06111a' : col, o.k === -1 ? C.muted : '#06111a', 1.5);
    });
    txt(c, 'leads: should hover at 0', P2.x + 6, P2.y + 12, { size: 11, col: C.muted });
    txt(c, '- - truth', P2.x + P2.w - 6, P2.y + 12, { size: 11, col: C.gold, align: 'right' });
  }
  var markEvShape = seg($('ec12-evshape'), 'data-s', ev.shape, function (s) { ev.touched = 1; ev.shape = s; store.set('evShape', s); evFit(); });
  slider('ec12-evsize', function () { return ev.size; }, function (v) { ev.touched = 1; ev.size = v; store.set('evSize', v); evFit(); }, function (v) { return fmt(v, 1); });
  slider('ec12-evpre', function () { return ev.pretrend; }, function (v) { ev.touched = 1; ev.pretrend = v; store.set('evPre', v); evFit(); }, function (v) { return (v > 0 ? '+' : '') + fmt(v, 2) + ' per period'; });
  slider('ec12-evrho', function () { return ev.rho; }, function (v) { ev.touched = 1; ev.rho = v; store.set('evRho', v); evFit(); }, function (v) { return fmt(v, 2); });
  slider('ec12-evn', function () { return ev.n; }, function (v) { ev.touched = 1; ev.n = v; store.set('evN', v); evFit(); }, function (v) { return v + ' + ' + v; });
  $('ec12-evnew').addEventListener('click', function () { ev.touched = 1; ev.seed = 1 + Math.floor(Math.random() * 1e8); evFit(); });

  /* =========================================================================================
     3. Staggered adoption and two-way fixed effects
     ========================================================================================= */
  var sg = { sE: +store.get('sgE', 3), sL: +store.get('sgL', 7), kind: store.get('sgK', 'grow'), never: store.get('sgN', true), size: +store.get('sgS', 1) };
  var sgCv = $('ec12-sc'), SG = L.canvas(sgCv), SR, dirtySt = true, T10 = 10;
  var GN = ['Early', 'Late', 'Never'], GC = [C.gold, C.pink, C.blue];
  function sgFit() {
    if (sg.sL <= sg.sE) sg.sL = Math.min(T10, sg.sE + 1);
    var groups = [{ n: 1, start: sg.sE, alpha: 3 }, { n: 1, start: sg.sL, alpha: 1.5 }];
    if (sg.never) groups.push({ n: 1, start: Infinity, alpha: 0 });
    SR = M.stagger({ T: T10, groups: groups, lam: function (t) { return 0.25 * t + 0.6 * Math.sin(t * 0.8); },
      effect: function (g, t, e) { return sg.kind === 'const' ? sg.size * 2 : sg.kind === 'het' ? (g === 0 ? 3 : 1) * sg.size : sg.size * (e + 1); } });
    dirtySt = true;
    var allPos = true; SR.tau.forEach(function (r, gi) { r.forEach(function (v, t) { if (SR.D[gi][t] && !(v > 0)) allPos = false; }); });
    var forb = SR.comps.filter(function (cp) { return cp.type === 'late'; }).reduce(function (a, cp) { return a + cp.w; }, 0);
    dl($('ec12-sgread'), [
      ['True average effect (ATT)', fmt(SR.att, 2)],
      ['Two-way fixed effects (TWFE)', fmt(SR.twfe, 2), SR.twfe < 0 ? 'ec12-bad' : Math.abs(SR.twfe - SR.att) > 0.5 ? 'ec12-warn' : ''],
      ['Callaway–Sant’Anna', isFinite(SR.csAtt) ? fmt(SR.csAtt, 2) + (SR.csCover < 0.999 ? ' (its cells: ' + fmt(SR.csTruth, 2) + ')' : '') : '—'],
      ['Weight on “forbidden” comparisons', Math.round(forb * 100) + '%'],
      ['Sum of negative cell weights', fmt(SR.negW, 2)]
    ]);
    $('ec12-sgnote').textContent = SR.csCover < 0.999 ? 'With no never-treated group, Callaway–Sant’Anna compares each group with groups not yet treated, so it can only estimate ' + Math.round(SR.csCover * 100) + '% of the treated cells; it reports the truth for those cells.' : 'Callaway–Sant’Anna compares each group with the never-treated group, period by period, and averages.';
    if (!sg.touched) return;
    if (SR.twfe < 0 && allPos) win('flip', 'TWFE says ' + fmt(SR.twfe, 2) + ', yet every true effect is positive.', $('ec12-sgv'));
    if (Math.abs(SR.twfe - SR.att) > 1 && isFinite(SR.csAtt) && Math.abs(SR.csAtt - SR.csTruth) < 0.01 && SR.csCover > 0.999) win('clean', 'TWFE is off by ' + fmt(Math.abs(SR.twfe - SR.att), 2) + '; the clean comparisons nail ' + fmt(SR.att, 2) + '.', $('ec12-sgv'));
  }
  function drawSt() {
    SG.fit(); var c = SG.c, w = SG.w, h = SG.h; c.clearRect(0, 0, w, h);
    var wide = w >= 700, A1, A2, A3;
    if (wide) { var lw = Math.round(w * 0.4), rw = w - lw - 24, h2 = Math.round((h - 24) * 0.55); A1 = { x: 8, y: 8, w: lw, h: h - 16 }; A2 = { x: lw + 16, y: 8, w: rw, h: h2 }; A3 = { x: lw + 16, y: h2 + 16, w: rw, h: h - h2 - 24 }; }
    else { var a = Math.round(h * 0.4), b = Math.round(h * 0.38); A1 = { x: 6, y: 6, w: w - 12, h: a - 6 }; A2 = { x: 6, y: a + 4, w: w - 12, h: b - 6 }; A3 = { x: 6, y: a + b + 2, w: w - 12, h: h - a - b - 8 }; }
    // 1. group paths
    card(c, A1.x, A1.y, A1.w, A1.h, 'OUTCOME BY GROUP (dashed: without the policy)');
    var ys = []; SR.Y.forEach(function (r) { ys = ys.concat(r); });
    var lo = Math.min.apply(null, ys) - 0.5, hi = Math.max.apply(null, ys) + 0.5, ts = []; for (var t = 1; t <= T10; t++) ts.push(t);
    var P = Plot(A1.x + 34, A1.y + 30, A1.w - 46, A1.h - 62, [0.5, T10 + 0.5], [lo, hi]);
    axes(c, P, { xticks: ts, yt: 4, xlab: 'period' });
    SR.Y.forEach(function (r, gi) {
      var start = gi === 0 ? sg.sE : gi === 1 ? sg.sL : Infinity;
      if (isFinite(start)) {
        var cf = r.map(function (v, t) { return v - SR.tau[gi][t]; });
        curve(c, P, ts, cf, rgba(GC[gi], 0.6), 1.6, [5, 4]);
        c.save(); c.strokeStyle = rgba(GC[gi], 0.35); c.setLineDash([2, 3]); c.beginPath(); c.moveTo(P.X(start - 0.5), P.y); c.lineTo(P.X(start - 0.5), P.y + P.h); c.stroke(); c.restore();
      }
      curve(c, P, ts, r, GC[gi], 2.6); r.forEach(function (v, t) { dot(c, P.X(t + 1), P.Y(v), SR.D[gi][t] ? 3.6 : 2.6, SR.D[gi][t] ? GC[gi] : '#06111a', GC[gi], 1.4); });
    });
    var lx = P.x + 4; SR.Y.forEach(function (r, gi) { txt(c, GN[gi] + (gi < 2 ? ' (from ' + (gi === 0 ? sg.sE : sg.sL) + ')' : ''), lx, P.y + 10, { size: 11, weight: 700, col: GC[gi] }); lx += tw(c, GN[gi] + (gi < 2 ? ' (from ' + (gi === 0 ? sg.sE : sg.sL) + ')' : ''), 11, 700) + 10; });
    // 2. Goodman-Bacon scatter
    card(c, A2.x, A2.y, A2.w, A2.h, 'GOODMAN-BACON: TWFE = WEIGHTED AVERAGE OF 2×2 DiDs');
    var bs = SR.comps.map(function (cp) { return cp.b; }).concat([SR.twfe, SR.att, 0]), blo = Math.min.apply(null, bs), bhi = Math.max.apply(null, bs), bp = (bhi - blo) * 0.15 + 0.4;
    var wmax = Math.max.apply(null, SR.comps.map(function (cp) { return cp.w; }).concat([0.1]));
    var Q = Plot(A2.x + 44, A2.y + 30, A2.w - 60, A2.h - 64, [0, Math.min(1, wmax * 1.25 + 0.02)], [blo - bp, bhi + bp]);
    axes(c, Q, { xt: 4, yt: 4, xlab: 'weight in TWFE', xf: function (v) { return Math.round(v * 100) + '%'; } });
    function hline(v, col, label, dash) { c.save(); c.strokeStyle = col; c.lineWidth = 1.6; if (dash) c.setLineDash(dash); c.beginPath(); c.moveTo(Q.x, Q.Y(v)); c.lineTo(Q.x + Q.w, Q.Y(v)); c.stroke(); c.restore(); txt(c, label, Q.x + Q.w - 4, Q.Y(v) - 4, { size: 10.5, weight: 700, col: col, align: 'right' }); }
    hline(0, 'rgba(219,231,239,.35)', '');
    hline(SR.att, C.gold, 'true ATT ' + fmt(SR.att, 2), [6, 4]);
    hline(SR.twfe, C.pink, 'TWFE ' + fmt(SR.twfe, 2));
    var NAME = { never: function (cp) { return GN[cp.tr] + ' vs never'; }, early: function (cp) { return 'Early vs not-yet Late'; }, late: function (cp) { return 'Late vs already-treated Early'; } };
    SR.comps.forEach(function (cp) {
      var x = Q.X(cp.w), y = Q.Y(cp.b), col = cp.type === 'late' ? C.red : cp.type === 'early' ? C.violet : C.green;
      dot(c, x, y, 6, col, '#06111a', 2);
      var lab = NAME[cp.type](cp) + ': ' + fmt(cp.b, 2), wdt = tw(c, lab, 10.5, 600), right = x + 10 + wdt < Q.x + Q.w;
      txt(c, lab, right ? x + 9 : x - 9, y + 4, { size: 10.5, weight: 600, col: col, align: right ? 'left' : 'right' });
    });
    // 3. weights on treated cells
    card(c, A3.x, A3.y, A3.w, A3.h, 'WEIGHT TWFE PUTS ON EACH TREATED GROUP-PERIOD');
    var rowsN = 2, gx = A3.x + 56, gy = A3.y + 30, gw = (A3.w - 70) / T10, gh = Math.min(30, (A3.h - 58) / rowsN);
    var wmx = 0; SR.W.forEach(function (r) { r.forEach(function (v) { if (v !== null) wmx = Math.max(wmx, Math.abs(v)); }); });
    for (var gi = 0; gi < 2; gi++) {
      txt(c, GN[gi], gx - 8, gy + gi * gh + gh / 2 + 4, { size: 11, weight: 700, col: GC[gi], align: 'right' });
      for (t = 0; t < T10; t++) {
        var v = SR.W[gi][t], x0 = gx + t * gw, y0 = gy + gi * gh;
        rr(c, x0 + 1.5, y0 + 1.5, gw - 3, gh - 3, 4);
        if (v === null) { c.fillStyle = 'rgba(120,170,200,.06)'; c.fill(); continue; }
        var a = Math.min(1, Math.abs(v) / (wmx || 1));
        c.fillStyle = v >= 0 ? rgba(C.green, 0.15 + 0.6 * a) : rgba(C.red, 0.2 + 0.7 * a); c.fill();
        if (gw > 30) txt(c, (v * 100).toFixed(0), x0 + gw / 2, y0 + gh / 2 + 4, { size: 10, mono: true, col: '#06111a', align: 'center', weight: 700 });
      }
    }
    for (t = 0; t < T10; t++) txt(c, String(t + 1), gx + t * gw + gw / 2, gy + 2 * gh + 13, { size: 10, col: C.muted, align: 'center', mono: true });
    txt(c, 'numbers are % weights; red cells count against the total', A3.x + 10, A3.y + A3.h - 8, { size: 10.5, col: C.muted, max: A3.w - 20 });
  }
  var markK = seg($('ec12-sgk'), 'data-k', sg.kind, function (k) { sg.touched = 1; sg.kind = k; store.set('sgK', k); sgFit(); });
  var syncL;
  slider('ec12-sgE', function () { return sg.sE; }, function (v) { sg.touched = 1; sg.sE = v; if (sg.sL <= v) { sg.sL = Math.min(T10, v + 1); } store.set('sgE', v); store.set('sgL', sg.sL); syncL(); sgFit(); }, function (v) { return 'period ' + v; });
  syncL = slider('ec12-sgL', function () { return sg.sL; }, function (v) { sg.touched = 1; sg.sL = Math.max(v, sg.sE + 1); store.set('sgL', sg.sL); sgFit(); if (sg.sL !== v) syncL(); }, function (v) { return 'period ' + Math.max(v, sg.sE + 1); });
  slider('ec12-sgS', function () { return sg.size; }, function (v) { sg.touched = 1; sg.size = v; store.set('sgS', v); sgFit(); }, function (v) { return fmt(v, 1); });
  var chN = $('ec12-sgN'); chN.checked = !!sg.never; chN.addEventListener('change', function () { sg.touched = 1; sg.never = chN.checked; store.set('sgN', sg.never); sgFit(); });

  /* ---------- start ---------- */
  syncAll(); refit(); evFit(); sgFit();
  L.loop(function () { if (dirty) { draw(); dirty = false; } }, view);
  L.loop(function () { if (dirtyEv) { drawEv(); dirtyEv = false; } }, $('ec12-evv'));
  L.loop(function () { if (dirtySt) { drawSt(); dirtySt = false; } }, $('ec12-sgv'));
})();
