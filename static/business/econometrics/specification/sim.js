/* Econometrics, Chapter 9 (Specification, Measurement Error and Outliers): the interactives on this page. Models in model.js (window.EC9M),
   statistics from the shared library window.EconStats, lab helpers from window.TRBLab. */
(function (W, D) {
  'use strict';
  /* ---------- drawing kit shared by the chapter 6–11 simulations (same code in each sim.js) ---------- */
  var L = W.TRBLab, ES = W.EconStats;
  var fmt = L.fmt, reduced = L.reduced;
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', orange: '#ffa94d',
    ink: '#dbe7ef', muted: '#8fb3c6', dim: '#5f7f92', line: 'rgba(120,170,200,.25)', grid: 'rgba(120,170,200,.10)', panel: 'rgba(11,27,39,.9)' };
  function $(id) { return D.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function grp(s) { var p = String(s).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function sgn(v, d) { return (v > 0 ? '+' : '') + fmt(v, d); }
  function pct(v, d) { return fmt(100 * v, d === undefined ? 1 : d) + '%'; }
  function rrect(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function font(size, bold, mono) { return (bold ? '600 ' : '') + size + 'px ' + (mono ? 'ui-monospace,Menlo,Consolas,monospace' : 'system-ui,-apple-system,"Segoe UI",sans-serif'); }
  function label(c, text, x, y, col, o) {
    o = o || {};
    c.save(); c.font = o.serif ? ((o.bold ? '600 ' : '') + 'italic ' + (o.size || 13) + 'px Georgia,"Times New Roman",serif') : font(o.size || 12, o.bold, o.mono);
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (o.rot) { c.translate(x, y); c.rotate(o.rot); x = 0; y = 0; }
    if (!o.plain) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(6,17,26,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = col; c.fillText(text, x, y); c.restore();
  }
  function textW(c, text, size, bold, mono) { c.save(); c.font = font(size || 12, bold, mono); var w = c.measureText(text).width; c.restore(); return w; }
  function bg(c, w, h) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1c2a'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  function panelBox(c, x, y, w, h, title, col) {
    c.fillStyle = 'rgba(255,255,255,.035)'; c.strokeStyle = 'rgba(120,170,200,.16)'; c.lineWidth = 1; rrect(c, x, y, w, h, 10); c.fill(); c.stroke();
    if (title) label(c, title, x + 10, y + 13, col || C.muted, { size: 10.5, bold: true });
  }
  function dot(c, x, y, r, col, a) { c.globalAlpha = a === undefined ? 1 : a; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); c.globalAlpha = 1; }
  function ring(c, x, y, r, col, lw) { c.strokeStyle = col; c.lineWidth = lw || 1.5; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.stroke(); }
  function seg(groupEl, attr, val) { if (groupEl) groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val))); }); }
  // a slider with its <output>: range('ec6-b2', function (v) { return '$' + fmt(v, 1); }, onInput)
  function range(id, show, onInput) {
    var el = $(id), out = $(id + '-o');
    var o = { el: el, get: function () { return +el.value; }, set: function (v) { el.value = v; o.show(); }, show: function () { if (out) out.textContent = show(+el.value); } };
    if (el) el.addEventListener('input', function () { o.show(); if (onInput) onInput(+el.value); });
    o.show(); return o;
  }
  function lerpCol(a, b, t) { // hex colors
    var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), r = Math.round(lerp(A >> 16, B >> 16, t)), g = Math.round(lerp(A >> 8 & 255, B >> 8 & 255, t)), bl = Math.round(lerp(A & 255, B & 255, t));
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }
  function hue(i, n, s, l) { return 'hsl(' + Math.round((i * 360 / Math.max(1, n) + 200) % 360) + ',' + (s || 80) + '%,' + (l || 68) + '%)'; }
  /* a plot frame: data ranges xr = [lo, hi], yr = [lo, hi] mapped to a box at (x, y, w, h) in CSS pixels */
  function frame(x, y, w, h, xr, yr) {
    var F = { x: x, y: y, w: w, h: h, xr: xr, yr: yr };
    F.X = function (v) { return x + (v - xr[0]) / (xr[1] - xr[0]) * w; };
    F.Y = function (v) { return y + h - (v - yr[0]) / (yr[1] - yr[0]) * h; };
    F.ix = function (px) { return xr[0] + (px - x) / w * (xr[1] - xr[0]); };
    F.iy = function (py) { return yr[0] + (y + h - py) / h * (yr[1] - yr[0]); };
    F.clip = function (c) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); };
    F.inside = function (px, py) { return px >= x && px <= x + w && py >= y && py <= y + h; };
    return F;
  }
  // nice axis ranges that cover the data with a margin
  function span(vals, pad, ticks) {
    var lo = Infinity, hi = -Infinity; for (var i = 0; i < vals.length; i++) { var v = vals[i]; if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } }
    if (!isFinite(lo)) { lo = 0; hi = 1; } if (hi - lo < 1e-9) { lo -= 0.5; hi += 0.5; }
    var m = (hi - lo) * (pad === undefined ? 0.06 : pad), t = ES.niceTicks(lo - m, hi + m, ticks || 5); return [t.lo, t.hi];
  }
  function axes(c, F, o) {
    o = o || {}; var tx = ES.niceTicks(F.xr[0], F.xr[1], o.nx || 5), ty = ES.niceTicks(F.yr[0], F.yr[1], o.ny || 5), i, v, s;
    c.save(); c.lineWidth = 1; c.strokeStyle = C.grid; c.beginPath();
    for (i = 0; i < tx.ticks.length; i++) { v = tx.ticks[i]; if (v < F.xr[0] - 1e-9 || v > F.xr[1] + 1e-9) continue; s = Math.round(F.X(v)) + 0.5; c.moveTo(s, F.y); c.lineTo(s, F.y + F.h); }
    for (i = 0; i < ty.ticks.length; i++) { v = ty.ticks[i]; if (v < F.yr[0] - 1e-9 || v > F.yr[1] + 1e-9) continue; s = Math.round(F.Y(v)) + 0.5; c.moveTo(F.x, s); c.lineTo(F.x + F.w, s); }
    c.stroke(); c.strokeStyle = 'rgba(120,170,200,.35)'; c.strokeRect(F.x + 0.5, F.y + 0.5, F.w - 1, F.h - 1); c.restore();
    var fx = o.fx || function (v) { return fmt(v, tx.step < 1 ? (tx.step < 0.1 ? 2 : 1) : 0).replace('−', '−'); };
    var fy = o.fy || function (v) { return fmt(v, ty.step < 1 ? (ty.step < 0.1 ? 2 : 1) : 0); };
    if (!o.noX) for (i = 0; i < tx.ticks.length; i++) { v = tx.ticks[i]; if (v < F.xr[0] - 1e-9 || v > F.xr[1] + 1e-9) continue; label(c, fx(v), F.X(v), F.y + F.h + 9, C.muted, { size: 10, align: 'center', plain: true }); }
    if (!o.noY) for (i = 0; i < ty.ticks.length; i++) { v = ty.ticks[i]; if (v < F.yr[0] - 1e-9 || v > F.yr[1] + 1e-9) continue; label(c, fy(v), F.x - 5, F.Y(v), C.muted, { size: 10, align: 'right', plain: true }); }
    if (o.xl) label(c, o.xl, F.x + F.w, F.y + F.h + 22, C.muted, { size: 11, align: 'right', plain: true });
    if (o.yl) label(c, o.yl, F.x + 2, F.y - 9, C.muted, { size: 11, plain: true });
  }
  function fline(c, F, fn, col, lw, dash, x0, x1) {
    x0 = x0 === undefined ? F.xr[0] : x0; x1 = x1 === undefined ? F.xr[1] : x1;
    F.clip(c); c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash);
    c.beginPath(); var N = 80; for (var i = 0; i <= N; i++) { var xv = lerp(x0, x1, i / N), yv = fn(xv), px = F.X(xv), py = F.Y(yv); if (!isFinite(py)) continue; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
    c.stroke(); c.setLineDash([]); c.restore();
  }
  function vline(c, F, xv, col, lw, dash, text, top) {
    var px = F.X(xv); if (px < F.x - 1 || px > F.x + F.w + 1) return;
    c.save(); c.strokeStyle = col; c.lineWidth = lw || 2; if (dash) c.setLineDash(dash); c.beginPath(); c.moveTo(px, F.y); c.lineTo(px, F.y + F.h); c.stroke(); c.restore();
    if (text) label(c, text, clamp(px, F.x + 4, F.x + F.w - 4), top === undefined ? F.y - 8 : top, col, { size: 10.5, bold: true, align: px > F.x + F.w * 0.75 ? 'right' : px < F.x + F.w * 0.25 ? 'left' : 'center' });
  }
  // histogram of vals over [lo, hi] with nb bins; values outside pile into the end bins when o.pile; returns the counts
  function binsOf(vals, lo, hi, nb, pile) {
    var cnt = new Array(nb).fill(0), w = (hi - lo) / nb;
    for (var i = 0; i < vals.length; i++) { var v = vals[i]; if (!isFinite(v)) continue; var k = Math.floor((v - lo) / w); if (k < 0) { if (!pile) continue; k = 0; } if (k >= nb) { if (!pile) continue; k = nb - 1; } cnt[k]++; }
    return cnt;
  }
  function hist(c, F, cnt, lo, hi, col, alpha, maxC, outline) {
    var nb = cnt.length, w = (hi - lo) / nb, m = maxC || Math.max.apply(null, cnt.concat([1]));
    c.save(); c.globalAlpha = alpha === undefined ? 0.55 : alpha; c.fillStyle = col;
    for (var k = 0; k < nb; k++) { if (!cnt[k]) continue; var x0 = F.X(lo + k * w), x1 = F.X(lo + (k + 1) * w), hh = cnt[k] / m * F.h; c.fillRect(x0 + 0.5, F.y + F.h - hh, Math.max(1, x1 - x0 - 1), hh); }
    c.globalAlpha = 1;
    if (outline) { c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(F.X(lo), F.y + F.h); for (k = 0; k < nb; k++) { var hy = F.y + F.h - cnt[k] / m * F.h; c.lineTo(F.X(lo + k * w), hy); c.lineTo(F.X(lo + (k + 1) * w), hy); } c.lineTo(F.X(hi), F.y + F.h); c.stroke(); }
    c.restore();
  }
  function arrow(c, x, y, x2, y2, col, lw, head, dash) {
    var dx = x2 - x, dy = y2 - y, len = Math.hypot(dx, dy); if (len < 2) return; var ux = dx / len, uy = dy / len, hw = head || 7;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw || 2; c.lineCap = 'round'; if (dash) c.setLineDash(dash);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2 - ux * hw, y2 - uy * hw); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - ux * hw * 1.6 - uy * hw * 0.8, y2 - uy * hw * 1.6 + ux * hw * 0.8); c.lineTo(x2 - ux * hw * 1.6 + uy * hw * 0.8, y2 - uy * hw * 1.6 - ux * hw * 0.8); c.closePath(); c.fill(); c.restore();
  }
  function legend(c, items, x, y, size) { // items: [[color, text, dashed?], ...] in a row; returns the end x
    size = size || 11;
    for (var i = 0; i < items.length; i++) {
      var it = items[i]; c.save(); c.strokeStyle = it[0]; c.lineWidth = 2.5; if (it[2]) c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16, y); c.stroke(); c.restore();
      label(c, it[1], x + 21, y, C.ink, { size: size }); x += 21 + textW(c, it[1], size) + 14;
    }
    return x;
  }
  // pointer helper: calls down(x, y, e) → truthy to start a drag, move(x, y, e), up(); coordinates in CSS pixels of the canvas
  function pointer(cv, down, move, up, hover) {
    var active = false;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { var p = pos(e); if (down(p[0], p[1], e)) { active = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); } });
    cv.addEventListener('pointermove', function (e) { var p = pos(e); if (active) { move(p[0], p[1], e); e.preventDefault(); } else if (hover) hover(p[0], p[1], e); });
    function end() { if (active) { active = false; if (up) up(); } }
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    if (hover) cv.addEventListener('pointerleave', function () { if (!active) hover(-1, -1); });
  }
  // runs step() about once a frame until it returns false; unlike TRBLab.loop it keeps going while the canvas is off
  // screen (so a Monte Carlo started from the panel below the canvas on a phone still finishes)
  function runner(step) {
    function tick() { var more = false; try { more = step(); } catch (e) { if (W.console) W.console.error(e); } if (more) { if (D.hidden) setTimeout(tick, 250); else W.requestAnimationFrame(tick); } }
    W.requestAnimationFrame(tick);
  }
  function scrollTo(el) { var r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > (W.innerHeight || 800)) el.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); }
  // the mission helper used by every stage: win(id, text) toasts and flashes once
  function missionKit(listId, slug, items, view, pick) {
    var M = L.missions($(listId), slug, items, pick ? function (id) { pick(id); scrollTo(view); } : null);
    M.win = function (id, text, where) { if (M.done(id)) { L.toast(where || view, '★ ' + text); M.flash = 1.2; return true; } return false; };
    M.flash = 0; return M;
  }
  var P = W.EC9M, root = $('ec9-lab');
  if (!root || !L || !ES || !P) return;
  var B1 = P.ME.b1, NS = [50, 100, 200, 500, 1000];
  var MIS = [
    { id: 'shrink', title: 'The shrinking slope', goal: 'Add noise to measured income until the fitted slope is below 75% of the true 0.90.' },
    { id: 'half', title: 'Exactly half', goal: 'Set the reliability ratio to 0.50, then run 1,000 samples: the slopes center on 0.45.' },
    { id: 'ynoise', title: 'Noise in y is harmless (for bias)', goal: 'Add at least 20 of noise to consumption, none to income, and run 1,000 samples: still centered on 0.90.' },
    { id: 'lever', title: 'One point to rule them', goal: 'In the outlier lab, drag one point so the slope changes by more than half.' },
    { id: 'quiet', title: 'Loud but harmless', goal: 'Make a point with a studentized residual above 3 but a Cook’s distance below 0.5.' },
    { id: 'overfit', title: 'Overfit', goal: 'In the polynomial lab, pick a degree whose test error is at least twice the best degree’s.' },
    { id: 'sweet', title: 'The sweet spot', goal: 'Pick the degree with the lowest test error.' }
  ];
  var M;

  /* =====================================================================================
     1. THE MAIN SIMULATION: measurement error and attenuation
     ===================================================================================== */
  (function () {
    var view = $('ec9-view'), cv = $('ec9-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var S = { se: 10, sv: 0, ni: 2, seed: 7, base: null, o: null, f: null, ghost: true, mc: null, touched: false };
    var el = { read: $('ec9-read'), mcBtn: $('ec9-mc'), ghost: $('ec9-ghost'), say: $('ec9-say'), pre: $('ec9-pre') };
    var rse = range('ec9-se', function (v) { return '$' + fmt(v, 1) + 'k'; }, function (v) { S.se = v; S.touched = true; obs(); });
    var rsv = range('ec9-sv', function (v) { return '$' + fmt(v, 1) + 'k'; }, function (v) { S.sv = v; S.touched = true; obs(); });
    var rn = range('ec9-n', function (v) { return grp(NS[v]) + ' households'; }, function (v) { S.ni = v; S.touched = true; draw0(); });
    function draw0() { S.base = P.drawME(NS[S.ni], S.seed); obs(); }
    function obs() {
      S.o = P.observe(S.base, S.se, S.sv); S.f = ES.ols(S.o.y, S.o.x.map(function (v) { return [v]; }), { intercept: true });
      if (S.mc && !S.mc.running) S.mc.stale = !(S.mc.se === S.se && S.mc.sv === S.sv && S.mc.n === NS[S.ni]);
      sync(); judge();
    }
    var PRE = { clean: [0, 0], some: [10, 0], half: [15, 0], ynoise: [0, 25] };
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre]; S.se = q[0]; S.sv = q[1]; rse.set(q[0]); rsv.set(q[1]); S.touched = true; obs(); });
    el.ghost.addEventListener('change', function () { S.ghost = el.ghost.checked; });
    function newSample() { S.seed = (S.seed * 7919 + 13) % 999983; S.touched = true; draw0(); }
    $('ec9-new').addEventListener('click', newSample); $('ec9-new2').addEventListener('click', newSample);
    el.mcBtn.addEventListener('click', startMC); $('ec9-mc2').addEventListener('click', startMC);
    $('ec9-reset').addEventListener('click', function () { S.se = 10; S.sv = 0; S.ni = 2; rse.set(10); rsv.set(0); rn.set(2); S.mc = null; draw0(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'n' || k === 'N') newSample(); else if (k === 'm' || k === 'M' || k === 'Enter') startMC();
      else if (k === 'ArrowUp' || k === 'ArrowDown') { S.se = clamp(S.se + (k === 'ArrowUp' ? 1 : -1), 0, 30); rse.set(S.se); S.touched = true; obs(); }
      else if (k === 'ArrowRight' || k === 'ArrowLeft') { S.sv = clamp(S.sv + (k === 'ArrowRight' ? 1 : -1), 0, 30); rsv.set(S.sv); S.touched = true; obs(); }
      else used = false;
      if (used) e.preventDefault();
    });
    function startMC() { if (S.mc && S.mc.running) return; S.touched = true; scrollTo(view); S.mc = { se: S.se, sv: S.sv, n: NS[S.ni], b: [], running: true, seed: 3000 + S.seed }; el.mcBtn.disabled = true; el.mcBtn.textContent = 'Running…'; runner(function () { stepMC(); return !!(S.mc && S.mc.running); }); }
    function stepMC() {
      var m = S.mc; if (!m || !m.running) return;
      for (var j = 0, per = reduced ? 1000 : Math.max(8, Math.round(20000 / m.n)); j < per && m.b.length < 1000; j++) { var o = P.observe(P.drawME(m.n, m.seed + m.b.length * 11), m.se, m.sv); m.b.push(P.slopeOf(o.x, o.y).b1); }
      if (m.b.length >= 1000) { m.running = false; m.mean = ES.mean(m.b); m.sd = ES.sd(m.b); el.mcBtn.disabled = false; el.mcBtn.textContent = '▶ Run 1,000 samples'; judgeMC(m); sync(); }
    }
    M = missionKit('ec9-missions', 'ec9', MIS, view, function (id) {
      var where = { lever: 'ec9b', quiet: 'ec9b', overfit: 'ec9c', sweet: 'ec9c' }[id];
      if (where) { var v = $(where + '-view'); scrollTo(v); L.toast(v, { lever: 'Drag a point at either end far up or down: that is leverage.', quiet: 'Drag a point in the middle of the cloud straight up.', overfit: 'Slide the degree up to 10 or more and look at the edges.', sweet: 'Watch the test-error curve and stop at its bottom.' }[id]); return; }
      L.toast(view, { shrink: 'Slide “noise in measured income” up.', half: 'Reliability = 15² / (15² + noise²). Which noise level gives 0.50?', ynoise: 'Set income noise to 0 and consumption noise to 20 or more, then run.' }[id]);
    });
    function judge() {
      if (!S.touched) return;
      if (S.se > 0 && S.f.b[1] < 0.75 * B1) M.win('shrink', 'Slope ' + fmt(S.f.b[1], 3) + ': noise in x drags the slope toward zero.');
    }
    function judgeMC(m) {
      var lam = P.lambda(m.se);
      if (Math.abs(lam - 0.5) <= 0.02 && Math.abs(m.mean - 0.45) <= 0.02) M.win('half', 'Reliability 0.50, average slope ' + fmt(m.mean, 3) + ': half the truth, as plim β̂₁ = λβ₁ says.');
      if (m.se === 0 && m.sv >= 20 && Math.abs(m.mean - B1) <= 0.02 * B1) M.win('ynoise', 'Average ' + fmt(m.mean, 3) + ': unbiased. The spread grew to ' + fmt(m.sd, 3) + ', though.');
    }
    function sync() {
      var f = S.f, lam = P.lambda(S.se), m = S.mc;
      seg(el.pre, 'data-pre', Object.keys(PRE).filter(function (k) { return PRE[k][0] === S.se && PRE[k][1] === S.sv; })[0] || '');
      el.read.innerHTML = '<dt>Reliability λ = 15²/(15² + σₑ²)</dt><dd>' + fmt(lam, 3) + '</dd>' +
        '<dt>Fitted slope β̂₁ (se)</dt><dd class="ec9-gr">' + fmt(f.b[1], 3) + ' (' + fmt(f.se[1], 3) + ')</dd>' +
        '<dt>Predicted center λβ₁</dt><dd class="ec9-pk">' + fmt(lam * B1, 3) + '</dd><dt>True slope β₁</dt><dd class="ec9-gd">0.900</dd><dt>R²</dt><dd>' + fmt(f.r2, 3) + '</dd>' +
        (m && !m.running ? '<dt>Mean of 1,000 slopes</dt><dd>' + fmt(m.mean, 3) + '</dd><dt>Their spread (sd)</dt><dd>' + fmt(m.sd, 3) + '</dd>' : '');
      el.say.textContent = 'Reliability ' + fmt(lam, 2) + '. Fitted slope ' + fmt(f.b[1], 3) + ' against a true 0.900; measurement error predicts about ' + fmt(lam * B1, 3) + '.';
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, o = S.o, f = S.f, lam = P.lambda(S.se); bg(c, w, h); if (M.flash > 0) M.flash -= dt;
      var wide = w >= 640, sw = wide ? Math.round(w * 0.6) : w;
      var F = frame(56, 40, sw - 74, (wide ? h : h * 0.56) - 92, [0, 120], [0, 120]);
      axes(c, F, { xl: 'measured yearly income ($ thousands)', yl: 'measured consumption ($ thousands)' });
      F.clip(c); var nn = Math.min(o.x.length, 700), rad = o.x.length > 300 ? 2.2 : 3.2;
      if (S.ghost && (S.se > 0 || S.sv > 0)) {
        c.strokeStyle = 'rgba(255,212,121,.22)'; c.lineWidth = 1; c.beginPath();
        for (var i = 0; i < nn; i++) { c.moveTo(F.X(o.xs[i]), F.Y(o.yt[i])); c.lineTo(F.X(o.x[i]), F.Y(o.y[i])); } c.stroke();
        for (i = 0; i < nn; i++) dot(c, F.X(o.xs[i]), F.Y(o.yt[i]), 1.6, C.gold, 0.45);
      }
      for (i = 0; i < nn; i++) dot(c, F.X(o.x[i]), F.Y(o.y[i]), rad, '#a5d8ff', 0.75);
      c.restore();
      var mx = ES.mean(o.x), my = ES.mean(o.y);
      fline(c, F, function (x) { return P.ME.b0 + B1 * x; }, C.gold, 2, [6, 4]);
      fline(c, F, function (x) { return my + lam * B1 * (x - mx); }, C.pink, 1.8, [2, 4]);
      fline(c, F, function (x) { return f.b[0] + f.b[1] * x; }, C.green, 3);
      legend(c, wide ? [[C.green, 'fit to measured data'], [C.gold, 'truth, 0.90', true], [C.pink, 'λ × truth', true]] : [[C.green, 'fit'], [C.gold, 'truth', true], [C.pink, 'λβ', true]], F.x + 6, F.y + 12, 11);
      if (S.ghost && S.se > 0) label(c, 'gold: true values; lines: measurement error', F.x + F.w - 6, F.y + F.h - 10, C.gold, { size: 10.5, align: 'right' });
      // the slope meter
      var bx = wide ? sw + 6 : 14, by = wide ? 40 : h * 0.56 + 12, bw = wide ? w - sw - 20 : w - 28, bh = wide ? h - 70 : h * 0.44 - 30;
      panelBox(c, bx, by - 6, bw, bh, 'THE SLOPE');
      var Fm = frame(bx + 16, by + 34, bw - 32, Math.max(40, bh * 0.42), [0, 1.2], [0, 1]), m = S.mc;
      axes(c, Fm, { noY: true, ny: 1, nx: 6 });
      if (m && m.b.length) { var nb = 60, cnt = binsOf(m.b, 0, 1.2, nb), mxc = Math.max.apply(null, cnt.concat([5])) * 1.1; if (m.stale) c.globalAlpha = 0.4; hist(c, Fm, cnt, 0, 1.2, C.green, 0.45, mxc, true); c.globalAlpha = 1; }
      vline(c, Fm, B1, C.gold, 2.5, null); vline(c, Fm, lam * B1, C.pink, 2, [4, 3]);
      var ci = f.ci(0.95)[1]; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(Fm.X(ci[0]), Fm.y + Fm.h - 12); c.lineTo(Fm.X(ci[1]), Fm.y + Fm.h - 12); c.stroke();
      dot(c, Fm.X(f.b[1]), Fm.y + Fm.h - 12, 5, C.green);
      label(c, 'truth', Fm.X(B1), Fm.y - 8, C.gold, { size: 10.5, bold: true, align: 'center' });
      if (Math.abs(lam - 1) > 0.03) label(c, 'λβ₁', Fm.X(lam * B1), Fm.y - 8, C.pink, { size: 10.5, bold: true, align: 'center' });
      label(c, m ? (m.running ? 'drawing samples… ' + m.b.length : '1,000 samples: mean ' + fmt(m.mean, 3) + (m.stale ? ' (old settings)' : '')) : 'dot and bar: this sample’s slope and 95% interval', Fm.x, Fm.y + Fm.h + 24, m && m.stale ? C.red : C.muted, { size: 10.5 });
      // reliability bar
      var ry = Fm.y + Fm.h + 46, rw = bw - 32;
      if (ry + 46 < by + bh) {
        label(c, bw > 330 ? 'Reliability λ: share of measured variance that is real' : 'Reliability λ (share that is real)', bx + 16, ry, C.muted, { size: 10.5, bold: true });
        c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(bx + 16, ry + 12, rw, 16);
        c.fillStyle = C.blue; c.fillRect(bx + 16, ry + 12, rw * lam, 16); c.fillStyle = 'rgba(255,135,135,.55)'; c.fillRect(bx + 16 + rw * lam, ry + 12, rw * (1 - lam), 16);
        label(c, 'real ' + pct(lam, 0), bx + 20, ry + 20, '#fff', { size: 10.5, bold: true });
        if (lam < 0.85) label(c, 'noise ' + pct(1 - lam, 0), bx + 12 + rw, ry + 20, '#fff', { size: 10.5, bold: true, align: 'right' });
        label(c, 'plim β̂₁ = λ × 0.90 = ' + fmt(lam * B1, 3), bx + 16, ry + 44, C.pink, { size: 12, bold: true });
      }
      if (M.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (M.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    draw0();
    L.loop(draw, cv);
  })();

  /* =====================================================================================
     2. OUTLIERS: leverage and influence you can drag
     ===================================================================================== */
  (function () {
    var view = $('ec9b-view'), cv = $('ec9b-cv'); if (!cv || !M) return;
    var G = L.canvas(cv), c = G.c;
    var S = { d: P.genOutlier(4), sel: 15, drag: false, lad: true, F: null, inf: null, l: null, base: null, touched: false };
    var read = $('ec9b-read');
    function refit() {
      S.inf = P.influence(S.d.x, S.d.y); S.l = P.lad(S.d.x, S.d.y);
      var xi = S.d.x.filter(function (v, j) { return j !== S.sel; }), yi = S.d.y.filter(function (v, j) { return j !== S.sel; }); S.wo = P.slopeOf(xi, yi);
      var I = S.inf, k = S.sel;
      read.innerHTML = '<dt>Slope with all points</dt><dd class="ec9-gr">' + fmt(I.b1, 3) + '</dd><dt>Slope without the ringed point</dt><dd>' + fmt(S.wo.b1, 3) + '</dd>' +
        '<dt>Least absolute deviations slope</dt><dd class="ec9-bl">' + fmt(S.l.b1, 3) + '</dd>' +
        '<dt>Ringed point: leverage hᵢᵢ</dt><dd>' + fmt(I.h[k], 3) + '</dd><dt>Studentized residual</dt><dd>' + fmt(I.r[k], 2) + '</dd><dt>Cook’s distance</dt><dd>' + fmt(I.D[k], 2) + '</dd>';
      if (S.touched && !S.drag) judge();
    }
    function judge() {
      var I = S.inf, k = S.sel, base = S.base;
      if (base && Math.abs(I.b1 - base) > 0.5 * Math.abs(base)) M.win('lever', 'The slope went from ' + fmt(base, 2) + ' to ' + fmt(I.b1, 2) + ': one high-leverage point did that. Cook’s D = ' + fmt(I.D[k], 2) + '.', view);
      if (Math.abs(I.r[k]) > 3 && I.D[k] < 0.5) M.win('quiet', 'Studentized residual ' + fmt(I.r[k], 1) + ' but Cook’s D only ' + fmt(I.D[k], 2) + ': far off the line, yet low leverage.', view);
    }
    function reset(kind) {
      S.d = P.genOutlier(4); S.sel = 15; S.base = P.slopeOf(S.d.x, S.d.y).b1;
      if (kind === 'lev') { S.d.x.push(14); S.d.y.push(4); S.sel = 16; }
      if (kind === 'mid') { S.d.x.push(5.6); S.d.y.push(2 + 0.8 * 5.6 + 5.2); S.sel = 16; }
      refit();
    }
    $('ec9b-reset').addEventListener('click', function () { reset(); });
    $('ec9b-lev').addEventListener('click', function () { reset('lev'); });
    $('ec9b-mid').addEventListener('click', function () { reset('mid'); });
    $('ec9b-lad').addEventListener('change', function () { S.lad = this.checked; });
    pointer(cv, function (x, y) {
      if (!S.F) return false; var best = -1, bd = 26;
      for (var i = 0; i < S.d.x.length; i++) { var dd = Math.hypot(S.F.X(S.d.x[i]) - x, S.F.Y(S.d.y[i]) - y); if (dd < bd) { bd = dd; best = i; } }
      if (best < 0) return false; S.sel = best; S.drag = true; S.touched = true; refit(); return true;
    }, function (x, y) { S.d.x[S.sel] = clamp(S.F.ix(x), 0, 16); S.d.y[S.sel] = clamp(S.F.iy(y), -4, 16); refit(); }, function () { S.drag = false; refit(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'ArrowUp') S.d.y[S.sel] = clamp(S.d.y[S.sel] + 0.3, -4, 16); else if (k === 'ArrowDown') S.d.y[S.sel] = clamp(S.d.y[S.sel] - 0.3, -4, 16);
      else if (k === 'ArrowRight') S.d.x[S.sel] = clamp(S.d.x[S.sel] + 0.3, 0, 16); else if (k === 'ArrowLeft') S.d.x[S.sel] = clamp(S.d.x[S.sel] - 0.3, 0, 16);
      else if (k === 'n' || k === 'N') { S.sel = (S.sel + 1) % S.d.x.length; }
      else used = false;
      if (used) { e.preventDefault(); S.touched = true; refit(); }
    });
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, d = S.d, I = S.inf; bg(c, w, h); if (M.flash > 0) M.flash -= dt;
      var F = frame(50, 36, w - 66, h * 0.7 - 50, [0, 16], [-4, 16]); S.F = F;
      axes(c, F, { xl: 'x', yl: 'y' });
      // leverage zones: shade where hᵢᵢ would exceed 2k/n for a new point
      fline(c, F, function (x) { return I.b0 + I.b1 * x; }, C.green, 3);
      fline(c, F, function (x) { return S.wo.b0 + S.wo.b1 * x; }, '#ffffff', 1.5, [6, 5]);
      if (S.lad) fline(c, F, function (x) { return S.l.b0 + S.l.b1 * x; }, C.blue, 2, [10, 4]);
      for (var i = 0; i < d.x.length; i++) {
        var px = F.X(d.x[i]), py = F.Y(d.y[i]), Dv = I.D[i], big = Dv > 1 ? C.red : Dv > 4 / d.x.length ? C.orange : '#a5d8ff';
        ring(c, px, py, 5 + Math.min(22, 14 * Math.sqrt(Dv)), big === '#a5d8ff' ? 'rgba(165,216,255,.25)' : big, 1.5);
        dot(c, px, py, 4.5, big, 0.95);
        if (i === S.sel) { ring(c, px, py, 9, '#fff', 2); }
      }
      legend(c, w > 560 ? [[C.green, 'OLS, all points'], ['#ffffff', 'OLS without the ringed point', true], [C.blue, 'least absolute deviations', true]] : [[C.green, 'OLS'], ['#fff', 'without ring', true], [C.blue, 'LAD', true]], F.x + 6, F.y + 12, 11);
      label(c, 'Drag any point. Halo size = Cook’s distance', F.x + F.w - 6, F.y + F.h - 10, C.muted, { size: 10.5, align: 'right' });
      // Cook's D bars
      var Fb = frame(50, h * 0.7 + 22, w - 66, h * 0.3 - 52, [0, 16], [0, Math.max(1.2, Math.max.apply(null, I.D) * 1.1)]);
      c.strokeStyle = 'rgba(120,170,200,.35)'; c.strokeRect(Fb.x + 0.5, Fb.y + 0.5, Fb.w - 1, Fb.h - 1);
      label(c, 'Cook’s distance of each point, at its x', Fb.x, Fb.y - 9, C.muted, { size: 10.5, bold: true });
      [[1, C.red, 'D = 1'], [4 / d.x.length, C.orange, 'D = 4/n']].forEach(function (q) { var yy = Fb.Y(q[0]); c.strokeStyle = q[1]; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(Fb.x, yy); c.lineTo(Fb.x + Fb.w, yy); c.stroke(); c.setLineDash([]); label(c, q[2], Fb.x + Fb.w - 4, yy - 7, q[1], { size: 9.5, align: 'right' }); });
      for (i = 0; i < d.x.length; i++) { var bxp = Fb.X(clamp(d.x[i], 0, 16)), top = Fb.Y(Math.min(I.D[i], Fb.yr[1])); c.fillStyle = I.D[i] > 1 ? C.red : I.D[i] > 4 / d.x.length ? C.orange : C.blue; c.fillRect(bxp - 2.5, top, 5, Fb.y + Fb.h - top); }
      if (M.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (M.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    reset(); L.loop(draw, cv);
  })();

  /* =====================================================================================
     3. OVERFITTING: polynomial degree against training and test error
     ===================================================================================== */
  (function () {
    var view = $('ec9c-view'), cv = $('ec9c-cv'); if (!cv || !M) return;
    var G = L.canvas(cv), c = G.c;
    var S = { deg: 1, sd: 0.5, seed: 7, tr: null, te: null, sw: null, touched: false, showTest: true };
    var read = $('ec9c-read');
    var rd = range('ec9c-deg', function (v) { return 'degree ' + v + (v === 1 ? ' (a line)' : v === 2 ? ' (quadratic)' : v === 3 ? ' (cubic)' : ''); }, function (v) { S.deg = v; S.touched = true; sync(); judge(); });
    var rs = range('ec9c-sd', function (v) { return fmt(v, 2); }, function (v) { S.sd = v; S.touched = true; regen(); });
    $('ec9c-new').addEventListener('click', function () { S.seed = (S.seed * 7919 + 13) % 999983; S.touched = true; regen(); });
    $('ec9c-test').addEventListener('change', function () { S.showTest = this.checked; });
    cv.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { rd.set(Math.min(12, S.deg + 1)); S.deg = rd.get(); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { rd.set(Math.max(1, S.deg - 1)); S.deg = rd.get(); } else return; e.preventDefault(); S.touched = true; sync(); judge(); });
    function regen() { S.tr = P.genCurve(20, S.sd, S.seed, true); S.te = P.genCurve(300, S.sd, 999); S.sw = P.sweep(S.tr, S.te, 12); sync(); judge(); }
    function row() { return S.sw.rows[S.deg - 1]; }
    function judge() {
      if (!S.touched) return; var r = row(), best = S.sw.rows[S.sw.best.test - 1];
      if (S.deg >= 6 && r.test >= 2 * best.test) M.win('overfit', 'Degree ' + S.deg + ': training error ' + fmt(r.train, 3) + ' but test error ' + fmt(r.test, 2) + ', against ' + fmt(best.test, 2) + ' at degree ' + best.d + '.', view);
      if (S.deg === S.sw.best.test) M.win('sweet', 'Degree ' + S.deg + ' has the lowest test error, ' + fmt(r.test, 3) + '. BIC picked ' + S.sw.best.bic + ', AIC ' + S.sw.best.aic + '.', view);
    }
    function sync() {
      var r = row(), b = S.sw.best, rs0 = P.reset(S.tr.x, S.tr.y, r.f.o.fit, S.deg);
      read.innerHTML = '<dt>Training R²</dt><dd>' + fmt(r.r2, 3) + '</dd><dt>Adjusted R²</dt><dd>' + fmt(r.adj, 3) + '</dd>' +
        '<dt>Training error (MSE)</dt><dd class="ec9-bl">' + fmt(r.train, 3) + '</dd><dt>Test error (MSE, 300 new points)</dt><dd class="ec9-rd">' + (r.test > 100 ? grp(fmt(r.test, 0)) : fmt(r.test, 3)) + '</dd>' +
        '<dt>AIC / BIC</dt><dd>' + fmt(r.aic, 1) + ' / ' + fmt(r.bic, 1) + '</dd><dt>RESET test p-value</dt><dd>' + (rs0.p < 0.001 ? '&lt; 0.001' : fmt(rs0.p, 3)) + '</dd>' +
        '<dt>Best degree by test / BIC / AIC / adj. R²</dt><dd>' + b.test + ' / ' + b.bic + ' / ' + b.aic + ' / ' + b.adj + '</dd>';
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, tr = S.tr, te = S.te, r = row(); bg(c, w, h); if (M.flash > 0) M.flash -= dt;
      var wide = w >= 640, pw = wide ? w * 0.58 : w, F = frame(48, 36, pw - 62, (wide ? h : h * 0.55) - 84, [0, 4], [-1.5, 4.5]);
      axes(c, F, { xl: 'x', yl: 'y' });
      F.clip(c);
      if (S.showTest) for (var i = 0; i < te.x.length; i++) dot(c, F.X(te.x[i]), F.Y(te.y[i]), 2, '#8fb3c6', 0.3);
      for (i = 0; i < tr.x.length; i++) dot(c, F.X(tr.x[i]), F.Y(tr.y[i]), 4.5, C.blue, 0.95);
      c.restore();
      fline(c, F, P.truth, C.gold, 1.8, [6, 4]);
      F.clip(c); c.strokeStyle = C.green; c.lineWidth = 3; c.beginPath(); for (var j = 0; j <= 300; j++) { var xv = 4 * j / 300, yv = clamp(r.f.pred(xv), -50, 50); if (j) c.lineTo(F.X(xv), F.Y(yv)); else c.moveTo(F.X(xv), F.Y(yv)); } c.stroke(); c.restore();
      legend(c, [[C.green, 'degree ' + S.deg + ' fit'], [C.gold, 'truth', true]], F.x + 6, F.y + 12, 11);
      label(c, 'blue: 20 training points' + (S.showTest ? '; gray: 300 test points' : ''), F.x + F.w - 6, F.y + F.h - 10, C.muted, { size: 10.5, align: 'right' });
      // error curves by degree (log scale)
      var gx = wide ? pw + 34 : 48, gy = wide ? 44 : h * 0.55 + 20, gw = wide ? w - pw - 50 : w - 62, gh = wide ? h - 110 : h * 0.45 - 70;
      var rows = S.sw.rows, lo = Math.log10(Math.min.apply(null, rows.map(function (q) { return q.train; })) * 0.8), hi = Math.log10(Math.min(1e3, Math.max.apply(null, rows.map(function (q) { return q.test; }))) * 1.3);
      var Fe = frame(gx, gy, gw, gh, [0.5, 12.5], [lo, hi]);
      c.strokeStyle = 'rgba(120,170,200,.35)'; c.strokeRect(Fe.x + 0.5, Fe.y + 0.5, Fe.w - 1, Fe.h - 1);
      [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000].forEach(function (v) { var lv = Math.log10(v); if (lv < lo || lv > hi) return; var yy = Fe.Y(lv); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(Fe.x, yy); c.lineTo(Fe.x + Fe.w, yy); c.stroke(); label(c, String(v), Fe.x - 5, yy, C.muted, { size: 9.5, align: 'right', plain: true }); });
      for (var d = 1; d <= 12; d++) label(c, String(d), Fe.X(d), Fe.y + Fe.h + 9, d === S.deg ? '#fff' : C.muted, { size: 10, align: 'center', bold: d === S.deg, plain: true });
      label(c, 'polynomial degree', Fe.x + Fe.w, Fe.y + Fe.h + 22, C.muted, { size: 10.5, align: 'right', plain: true });
      label(c, 'error (MSE, log scale)', Fe.x, Fe.y - 10, C.muted, { size: 10.5, bold: true });
      c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(Fe.X(S.deg - 0.4), Fe.y, Fe.X(0.8) - Fe.X(0), Fe.h);
      [['train', C.blue], ['test', C.red]].forEach(function (q) {
        c.strokeStyle = q[1]; c.lineWidth = 2.2; c.beginPath(); rows.forEach(function (rr, k) { var yy = Fe.Y(clamp(Math.log10(rr[q[0]]), lo, hi)); if (k) c.lineTo(Fe.X(rr.d), yy); else c.moveTo(Fe.X(rr.d), yy); }); c.stroke();
        rows.forEach(function (rr) { dot(c, Fe.X(rr.d), Fe.Y(clamp(Math.log10(rr[q[0]]), lo, hi)), rr.d === S.deg ? 5 : 3, q[1]); });
      });
      var b = S.sw.best; [['test', C.red, 'best test'], ['bic', C.violet, 'BIC'], ['aic', C.orange, 'AIC']].forEach(function (q, k) { var xx = Fe.X(b[q[0]]), yy = Fe.y + Fe.h - 10 - k * 13, rt = xx > Fe.x + Fe.w - 60; c.fillStyle = q[1]; c.beginPath(); c.moveTo(xx, yy - 5); c.lineTo(xx - 4.5, yy + 3); c.lineTo(xx + 4.5, yy + 3); c.fill(); label(c, q[2], rt ? xx - 7 : xx + 7, yy, q[1], { size: 9.5, bold: true, align: rt ? 'right' : 'left' }); });
      legend(c, [[C.blue, 'training error'], [C.red, 'test error']], Fe.x + 6, Fe.y + 12, 10.5);
      if (M.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (M.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    regen(); L.loop(draw, cv);
  })();
})(window, document);
