/* Econometrics, Chapter 8 (Heteroskedasticity and Robust Standard Errors): the interactives on this page. Models in model.js (window.EC8M),
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
  var P = W.EC8M, root = $('ec8-lab');
  if (!root || !L || !ES || !P) return;
  var NS = [20, 30, 50, 100, 200, 500, 1000], REPS = 2000;
  var shared = { p: { n: 100, shape: 'fan', g: 1 }, seed: 21, d: null, f: null, bp: null, subs: [] };
  function regen() {
    shared.d = P.gen(shared.p, shared.seed); shared.f = P.simple(shared.d.x, shared.d.y); shared.bp = P.bp(shared.d.x, shared.f.resid);
    shared.subs.forEach(function (fn) { fn(); });
  }
  function pfmt(p) { return p < 0.001 ? '< 0.001' : fmt(p, 3); }

  /* =====================================================================================
     1. THE MAIN SIMULATION: the fan, and 2,000 confidence intervals
     ===================================================================================== */
  (function () {
    var view = $('ec8-view'), cv = $('ec8-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var S = { mc: null, touched: false, anim: 1, old: null };
    var el = { shape: $('ec8-shape'), read: $('ec8-read'), mcBtn: $('ec8-mc'), say: $('ec8-say') };
    var rg = range('ec8-g', function (v) { return v === 0 ? '0 (constant noise)' : fmt(v, 2); }, function (v) { shared.p.g = v; S.touched = true; changed(); });
    var rn = range('ec8-n', function (v) { return grp(NS[v]) + ' households'; }, function (v) { shared.p.n = NS[v]; S.touched = true; changed(); });
    function changed() { S.old = shared.f ? { b0: shared.f.b0, b1: shared.f.b1 } : null; S.anim = reduced ? 1 : 0; regen(); if (S.mc && !S.mc.running) S.mc.stale = !same(S.mc.p, shared.p); judge(); }
    function same(a, b) { return a.n === b.n && a.g === b.g && a.shape === b.shape; }
    el.shape.addEventListener('click', function (e) { var b = e.target.closest('button[data-shape]'); if (!b) return; shared.p.shape = b.dataset.shape; seg(el.shape, 'data-shape', shared.p.shape); S.touched = true; changed(); });
    function newSample() { shared.seed = (shared.seed * 7919 + 13) % 999983; S.touched = true; changed(); }
    $('ec8-new').addEventListener('click', newSample); $('ec8-new2').addEventListener('click', newSample);
    el.mcBtn.addEventListener('click', startMC); $('ec8-mc2').addEventListener('click', startMC);
    $('ec8-reset').addEventListener('click', function () { shared.p = { n: 100, shape: 'fan', g: 1 }; seg(el.shape, 'data-shape', 'fan'); rg.set(1); rn.set(3); S.mc = null; changed(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'n' || k === 'N') newSample(); else if (k === 'm' || k === 'M' || k === 'Enter') startMC();
      else if (k === 'ArrowUp' || k === 'ArrowDown') { shared.p.g = clamp(Math.round((shared.p.g + (k === 'ArrowUp' ? 0.1 : -0.1)) * 100) / 100, 0, 1.5); rg.set(shared.p.g); S.touched = true; changed(); }
      else used = false;
      if (used) e.preventDefault();
    });
    function startMC() {
      if (S.mc && S.mc.running) return; S.touched = true; scrollTo(view); var p = { n: shared.p.n, shape: shared.p.shape, g: shared.p.g };
      S.mc = { p: p, crit: ES.tInv(0.975, p.n - 2), k: 0, inC: 0, inH: 0, b: [], seC: 0, seH: 0, last: [], running: true, seed: 9000 + shared.seed * 3 };
      el.mcBtn.disabled = true; el.mcBtn.textContent = 'Running…';
      runner(function () { stepMC(); return !!(S.mc && S.mc.running); });
    }
    function stepMC() {
      var m = S.mc; if (!m || !m.running) return;
      var per = reduced ? REPS : 24;
      for (var j = 0; j < per && m.k < REPS; j++) {
        var r = P.draw(m.p, m.seed + m.k * 17, m.crit); m.k++; m.inC += r.inC; m.inH += r.inH; m.b.push(r.b1); m.seC += r.seC; m.seH += r.seH;
        m.last.push(r); if (m.last.length > 40) m.last.shift();
      }
      if (m.k >= REPS) { m.running = false; m.mean = ES.mean(m.b); m.sd = ES.sd(m.b); el.mcBtn.disabled = false; el.mcBtn.textContent = '▶ Run 2,000 samples'; judgeMC(m); sync(); }
    }
    var MIS = [
      { id: 'fan', title: 'Fan it out', goal: 'Make the noise fan out (strength 1.2 or more) so the Breusch–Pagan test below rejects constant variance at the 1% level.' },
      { id: 'short', title: 'Classic falls short', goal: 'Run 2,000 samples where the classic 95% intervals cover the truth less than 90% of the time.' },
      { id: 'rescue', title: 'Robust to the rescue', goal: 'In a run where classic coverage is under 91%, get robust (HC1) coverage of at least 93.5%.' },
      { id: 'calm', title: 'Calm seas', goal: 'With constant noise, run 2,000 samples: both kinds of interval cover between 93.5% and 96.5%.' },
      { id: 'over', title: 'Too cautious', goal: 'Find a noise pattern where classic intervals cover more than 97% of the time.' },
      { id: 'small', title: 'Small samples bite', goal: 'With 30 or fewer households and strong heteroskedasticity (1 or more), show robust coverage below 93%.' },
      { id: 'unbiased', title: 'Still unbiased', goal: 'With strength 1.2 or more, run 2,000 samples: the slopes average within 2% of the true 0.120.' }
    ];
    var M = missionKit('ec8-missions', 'ec8', MIS, view, function (id) {
      var q = { fan: ['fan', 0.6, 3], short: ['fan', 0.8, 3], rescue: ['fan', 0.8, 3], calm: ['fan', 0.6, 3], over: ['fan', 0.5, 3], small: ['fan', 1, 3], unbiased: ['fan', 0.6, 3] }[id];
      shared.p.shape = q[0]; shared.p.g = q[1]; shared.p.n = NS[q[2]]; seg(el.shape, 'data-shape', q[0]); rg.set(q[1]); rn.set(q[2]); changed();
      L.toast(view, { fan: 'Push the strength slider up, then check the test below the simulation.', short: 'Strong fan or bow tie, then “Run 2,000 samples”.', rescue: 'Watch the green bar: robust intervals widen where the noise is.', calm: 'Set the strength to 0 and run.', over: 'Try the Football pattern: the noise is biggest where x tells you least.', small: 'Slide the sample down to 20 or 30 and run.', unbiased: 'Heteroskedasticity changes the spread, not the center. Run and check the mean.' }[id]);
    });
    function judge() {
      if (!S.touched) return;
      if (shared.p.shape === 'fan' && shared.p.g >= 1.2 && shared.bp.p < 0.01) M.win('fan', 'Breusch–Pagan LM = ' + fmt(shared.bp.LM, 1) + ', p ' + pfmt(shared.bp.p) + ': the spread grows with income.');
    }
    function judgeMC(m) {
      var c = m.inC / REPS, h = m.inH / REPS;
      if (c < 0.9) M.win('short', 'Classic intervals covered only ' + pct(c) + ' of the time, not 95%.');
      if (c < 0.91 && h >= 0.935) M.win('rescue', 'Robust intervals covered ' + pct(h) + ' while classic ones covered ' + pct(c) + '.');
      if (m.p.g === 0 && c >= 0.935 && c <= 0.965 && h >= 0.935 && h <= 0.965) M.win('calm', 'Constant noise: classic ' + pct(c) + ', robust ' + pct(h) + '. Both on target.');
      if (c > 0.97) M.win('over', 'Classic coverage ' + pct(c) + ': the usual standard errors can be too big, too.');
      if (m.p.n <= 30 && m.p.g >= 1 && h < 0.93) M.win('small', 'Robust coverage ' + pct(h) + ' with ' + m.p.n + ' households: HC1 is a large-sample fix.');
      if (m.p.g >= 1.2 && Math.abs(m.mean - P.B1) <= 0.02 * P.B1) M.win('unbiased', 'Mean slope ' + fmt(m.mean, 4) + ' against the true 0.1200: unbiased, just noisier.');
    }
    function sync() {
      var f = shared.f, m = S.mc, ratio = f.seH / f.seC;
      var html = '<dt>Slope β̂₁ (saving per $1 of income)</dt><dd>' + fmt(f.b1, 4) + '</dd>' +
        '<dt>Classic standard error</dt><dd class="ec8-pk">' + fmt(f.seC, 4) + '</dd><dt>Robust (HC1) standard error</dt><dd class="ec8-gr">' + fmt(f.seH, 4) + '</dd>' +
        '<dt>Robust ÷ classic</dt><dd>' + fmt(ratio, 2) + '×</dd>' +
        '<dt>Breusch–Pagan test p-value</dt><dd>' + pfmt(shared.bp.p) + '</dd>';
      if (m && !m.running) html += '<dt>Classic coverage (2,000 runs)</dt><dd class="ec8-pk">' + pct(m.inC / REPS) + '</dd><dt>Robust coverage</dt><dd class="ec8-gr">' + pct(m.inH / REPS) + '</dd><dt>Mean of β̂₁ over runs</dt><dd>' + fmt(m.mean, 4) + '</dd>';
      el.read.innerHTML = html;
      el.say.textContent = 'This sample: slope ' + fmt(f.b1, 4) + ', classic standard error ' + fmt(f.seC, 4) + ', robust ' + fmt(f.seH, 4) + '.' + (m && !m.running ? ' Over 2,000 samples, classic 95% intervals covered ' + pct(m.inC / REPS) + ' and robust ones ' + pct(m.inH / REPS) + '.' : '');
    }
    shared.subs.push(sync);

    function layout(w, h) {
      if (w >= 640) { var sw = Math.round(w * 0.56); return { sc: [56, 34, sw - 72, h * 0.6 - 64], lad: [sw + 6, 30, w - sw - 18, h * 0.6 - 44], cov: [16, h * 0.6 + 14, w - 32, h * 0.4 - 26], wide: true }; }
      return { sc: [46, 52, w - 60, h * 0.36 - 70], lad: [10, h * 0.36 + 8, w - 20, h * 0.3], cov: [10, h * 0.66 + 26, w - 20, h * 0.34 - 36], wide: false };
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, d = shared.d, f = shared.f, p = shared.p; bg(c, w, h); if (M.flash > 0) M.flash -= dt;
      S.anim = Math.min(1, S.anim + dt * 3.5); var t = ease(S.anim), Lo = layout(w, h);
      // scatter with the true 95% band
      var F = frame(Lo.sc[0], Lo.sc[1], Lo.sc[2], Lo.sc[3], [20, 160], [-35, 50]);
      axes(c, F, { xl: 'household income ($ thousands)', yl: 'annual saving ($ thousands)' });
      F.clip(c);
      c.fillStyle = 'rgba(255,212,121,.09)'; c.beginPath();
      for (var i = 0; i <= 60; i++) { var xv = 20 + 140 * i / 60; c.lineTo(F.X(xv), F.Y(P.B0 + P.B1 * xv + 1.96 * P.sdAt(p, xv))); }
      for (i = 60; i >= 0; i--) { xv = 20 + 140 * i / 60; c.lineTo(F.X(xv), F.Y(P.B0 + P.B1 * xv - 1.96 * P.sdAt(p, xv))); }
      c.closePath(); c.fill();
      var nn = Math.min(d.n, 1000), rad = d.n > 300 ? 2.2 : 3.2;
      for (i = 0; i < nn; i++) dot(c, F.X(d.x[i]), F.Y(d.y[i]), rad, '#a5d8ff', d.n > 300 ? 0.55 : 0.8);
      c.restore();
      fline(c, F, function (x) { return P.B0 + P.B1 * x; }, C.gold, 2, [6, 4]);
      var b0 = f.b0, b1 = f.b1; if (S.old && t < 1) { b0 = lerp(S.old.b0, b0, t); b1 = lerp(S.old.b1, b1, t); }
      fline(c, F, function (x) { return b0 + b1 * x; }, C.green, 3);
      legend(c, Lo.wide ? [[C.green, 'OLS fit'], [C.gold, 'truth', true]] : [[C.green, 'OLS'], [C.gold, 'truth', true]], F.x + 6, F.y + 12, 11);
      label(c, 'shaded: where 95% of households fall', F.x + F.w - 6, F.y + F.h - 10, C.gold, { size: 10.5, align: 'right' });
      drawLadder(Lo.lad, Lo.wide);
      drawCover(Lo.cov, Lo.wide);
      if (M.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (M.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    function drawLadder(b, wide) {
      var x = b[0], y = b[1], w = b[2], h = b[3], m = S.mc, f = shared.f;
      panelBox(c, x, y, w, h, wide ? '95% INTERVALS, NEWEST ON TOP' : '95% INTERVALS');
      var crit = ES.tInv(0.975, (m ? m.p : shared.p).n - 2), sdT = P.trueSd(m ? m.p : shared.p, shared.d.x), half = Math.max(4.4 * sdT, 1.25 * crit * Math.max(f.seC, f.seH));
      var cw = (w - 30) / 2, top = y + 40, rows = m ? m.last.slice().reverse() : [{ b1: f.b1, seC: f.seC, seH: f.seH, inC: Math.abs(f.b1 - P.B1) <= crit * f.seC, inH: Math.abs(f.b1 - P.B1) <= crit * f.seH }];
      var rh = Math.min(10, (h - 82) / 40);
      [['classic', 'seC', 'inC', C.pink], ['robust (HC1)', 'seH', 'inH', C.green]].forEach(function (col, k) {
        var x0 = x + 10 + k * (cw + 10), F = frame(x0, top, cw, h - 78, [P.B1 - half, P.B1 + half], [0, 1]);
        label(c, col[0], x0 + cw / 2, y + 28, col[3], { size: 11, bold: true, align: 'center' });
        c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.moveTo(F.X(P.B1), top - 4); c.lineTo(F.X(P.B1), top + h - 74); c.stroke();
        F.clip(c);
        rows.forEach(function (r, j) {
          var yy = top + 4 + j * rh, lo = r.b1 - crit * r[col[1]], hi = r.b1 + crit * r[col[1]], ok = r[col[2]];
          c.strokeStyle = ok ? (k ? 'rgba(99,230,190,.85)' : 'rgba(249,168,212,.85)') : C.red; c.lineWidth = ok ? 2 : 2.6; c.beginPath(); c.moveTo(F.X(lo), yy); c.lineTo(F.X(hi), yy); c.stroke();
          dot(c, F.X(r.b1), yy, 2, '#fff', 0.9);
        });
        c.restore();
        label(c, 'truth', F.X(P.B1), top + h - 66, C.gold, { size: 10, align: 'center' });
      });
      if (!m) label(c, w > 420 ? 'one interval each from this sample; run 2,000 to fill the ladder' : 'run 2,000 samples to fill the ladder', x + w / 2, y + h - 12, C.muted, { size: 10, align: 'center' });
      else label(c, 'red = missed the truth', x + w / 2, y + h - 12, C.red, { size: 10, align: 'center' });
    }
    function drawCover(b, wide) {
      var x = b[0], y = b[1], w = b[2], h = b[3], m = S.mc;
      panelBox(c, x, y, w, h, m ? (m.running ? 'RUNNING: ' + grp(m.k) + ' OF 2,000 SAMPLES' : '2,000 SAMPLES OF ' + grp(m.p.n) + (m.stale ? '  (OLD SETTINGS: RUN AGAIN)' : '')) : (wide ? 'HOW OFTEN DO THE 95% INTERVALS COVER THE TRUTH?' : 'HOW OFTEN THE INTERVALS COVER THE TRUTH'), m && m.stale ? C.red : C.muted);
      var half = wide ? (w - 40) / 2 : w - 20, x1 = x + 10, y1 = y + 30, bh = wide ? h - 44 : (h - 44) / 2 - 6;
      // coverage bars
      var F = frame(x1 + (wide ? 92 : 80), y1 + 6, half - (wide ? 104 : 90), Math.min(bh - 30, 70), [0.75, 1], [0, 1]);
      var ticks = [0.75, 0.8, 0.85, 0.9, 0.95, 1];
      c.strokeStyle = C.grid; c.beginPath(); ticks.forEach(function (v) { c.moveTo(F.X(v), F.y); c.lineTo(F.X(v), F.y + F.h); }); c.stroke();
      ticks.forEach(function (v) { label(c, fmt(100 * v, 0) + '%', F.X(v), F.y + F.h + 9, C.muted, { size: 9.5, align: 'center', plain: true }); });
      c.fillStyle = 'rgba(255,212,121,.15)'; c.fillRect(F.X(0.94), F.y, F.X(0.96) - F.X(0.94), F.h);
      c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.moveTo(F.X(0.95), F.y - 3); c.lineTo(F.X(0.95), F.y + F.h + 2); c.stroke();
      var bars = [['classic', m ? m.inC / Math.max(1, m.k) : NaN, C.pink], ['robust', m ? m.inH / Math.max(1, m.k) : NaN, C.green]], bhh = F.h / 2 - 6;
      bars.forEach(function (q, k) {
        var yy = F.y + 3 + k * (bhh + 8); label(c, q[0], F.x - 8, yy + bhh / 2, q[2], { size: 11, bold: true, align: 'right' });
        if (isFinite(q[1])) { c.fillStyle = q[2]; c.globalAlpha = m.stale ? 0.35 : 0.85; c.fillRect(F.x, yy, Math.max(0, F.X(clamp(q[1], 0.75, 1)) - F.x), bhh); c.globalAlpha = 1; label(c, pct(q[1]), Math.min(F.X(clamp(q[1], 0.75, 1)) + 6, F.x + F.w - 40), yy + bhh / 2, '#fff', { size: 11.5, bold: true }); }
      });
      if (!m) label(c, 'Press “Run 2,000 samples”', F.x + F.w / 2, F.y + F.h / 2, C.muted, { size: 12, align: 'center' });
      // standard errors against the real spread
      var x2 = wide ? x + 20 + half : x1, y2 = wide ? y1 : y1 + bh + 18, w2 = half - 10;
      label(c, wide ? 'Average standard error vs. the real spread of β̂₁' : 'Avg. SE vs. real spread of β̂₁', x2, y2 + 2, C.muted, { size: 10.5, bold: true });
      if (m && m.k > 20) {
        var sdNow = m.running ? ES.sd(m.b) : m.sd, items = [['real spread', sdNow, C.gold], ['classic SE', m.seC / m.k, C.pink], ['robust SE', m.seH / m.k, C.green]], mx = Math.max(sdNow, m.seC / m.k, m.seH / m.k) * 1.15;
        var rowH = Math.min(18, (bh - 22) / 3);
        items.forEach(function (q, k) {
          var yy = y2 + 14 + k * (rowH + 4), bx = x2 + 84;
          label(c, q[0], bx - 8, yy + rowH / 2, q[2], { size: 10.5, align: 'right' });
          c.fillStyle = q[2]; c.globalAlpha = 0.8; c.fillRect(bx, yy, (w2 - 140) * q[1] / mx, rowH); c.globalAlpha = 1;
          label(c, fmt(q[1], 4), bx + (w2 - 140) * q[1] / mx + 6, yy + rowH / 2, '#fff', { size: 10.5 });
        });
      }
    }
    G.fit(); regen(); judge();
    L.loop(draw, cv);
  })();

  /* =====================================================================================
     2. TESTING FOR IT AND FIXING IT: Breusch–Pagan, WLS and FGLS on the same sample
     ===================================================================================== */
  (function () {
    var view = $('ec8b-view'), cv = $('ec8b-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, read = $('ec8b-read'), btn = $('ec8b-cmp');
    var S = { w: null, fg: null, wh: null, cmp: null, touched: false };
    var GM = missionKit('ec8b-missions', 'ec8b', [
      { id: 'bp', title: 'Caught it', goal: 'Get a Breusch–Pagan p-value below 0.01 on the current sample.' },
      { id: 'quiet', title: 'No false alarm', goal: 'With constant noise (strength 0), get a p-value above 0.10.' },
      { id: 'wls', title: 'Weights win', goal: 'Compare 1,000 samples and find WLS at least 40% less spread out than OLS.' }
    ], view);
    function update() {
      var d = shared.d, f = shared.f; S.w = P.wlsTrue(shared.p, d); S.fg = P.fgls(d, f.resid); S.wh = P.white(d.x.map(function (v) { return f.b0 + f.b1 * v; }), f.resid);
      if (S.cmp && !S.cmp.running && (S.cmp.p.g !== shared.p.g || S.cmp.p.shape !== shared.p.shape || S.cmp.p.n !== shared.p.n)) S.cmp.stale = true;
      var b = shared.bp;
      read.innerHTML = '<dt>Breusch–Pagan LM = n·R²</dt><dd>' + fmt(b.LM, 2) + '</dd><dt>p-value (χ², 1 df)</dt><dd>' + pfmt(b.p) + '</dd>' +
        '<dt>F version</dt><dd>F = ' + fmt(b.F, 2) + ', p ' + pfmt(b.Fp) + '</dd><dt>White test (special form), p</dt><dd>' + pfmt(S.wh.p) + '</dd>' +
        '<dt>OLS β̂₁ (robust se)</dt><dd class="ec8-gr">' + fmt(f.b1, 4) + ' (' + fmt(f.seH, 4) + ')</dd>' +
        '<dt>WLS, true weights</dt><dd class="ec8-bl">' + fmt(S.w.b1, 4) + ' (' + fmt(S.w.se, 4) + ')</dd>' +
        '<dt>FGLS, estimated weights</dt><dd class="ec8-gd">' + fmt(S.fg.b1, 4) + ' (' + fmt(S.fg.se, 4) + ')</dd>';
      if (S.touched || shared.touchedB) judge();
    }
    shared.subs.push(update);
    function judge() {
      if (shared.bp.p < 0.01) GM.win('bp', 'p ' + pfmt(shared.bp.p) + ': the squared residuals clearly rise with income.');
      if (shared.p.g === 0 && shared.bp.p > 0.1) GM.win('quiet', 'p = ' + fmt(shared.bp.p, 2) + ': no evidence against constant variance, as it should be.');
    }
    root.addEventListener('input', function (e) { if (e.target.id === 'ec8-g' || e.target.id === 'ec8-n') shared.touchedB = true; });
    root.addEventListener('click', function (e) { if (e.target.closest('#ec8-shape,#ec8-new,#ec8-new2')) { shared.touchedB = true; judge(); } });
    btn.addEventListener('click', function () { if (S.cmp && S.cmp.running) return; S.touched = true; S.cmp = { p: { n: shared.p.n, shape: shared.p.shape, g: shared.p.g }, k: 0, o: [], w: [], f: [], running: true, seed: 70000 + shared.seed }; btn.disabled = true; btn.textContent = 'Comparing…'; scrollTo(view); runner(function () { stepCmp(); return !!(S.cmp && S.cmp.running); }); });
    function stepCmp() {
      var m = S.cmp; if (!m || !m.running) return;
      for (var j = 0; j < (reduced ? 1000 : 12) && m.k < 1000; j++, m.k++) { var d = P.gen(m.p, m.seed + m.k * 13), f = P.simple(d.x, d.y); m.o.push(f.b1); m.w.push(P.wlsTrue(m.p, d).b1); m.f.push(P.fgls(d, f.resid).b1); }
      if (m.k >= 1000) {
        m.running = false; m.sd = [ES.sd(m.o), ES.sd(m.w), ES.sd(m.f)]; btn.disabled = false; btn.textContent = '▶ Compare 1,000 samples';
        if (m.sd[1] <= 0.6 * m.sd[0]) GM.win('wls', 'Spread: OLS ' + fmt(m.sd[0], 4) + ', WLS ' + fmt(m.sd[1], 4) + ', FGLS ' + fmt(m.sd[2], 4) + '. Weighting pays.');
      }
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, d = shared.d, f = shared.f, b = shared.bp; bg(c, w, h); if (GM.flash > 0) GM.flash -= dt;
      var wide = w >= 640, top = 40, ph = wide ? h * 0.58 - top : h * 0.33 - top + 8, pw = wide ? (w - 120) / 2 : w - 66;
      // left: squared residuals with the BP auxiliary regression
      var u2max = ES.quantile(b.u2, 0.97) * 1.15 || 1, F1 = frame(52, top, pw, ph, [20, 160], [0, u2max]);
      axes(c, F1, { xl: 'income', yl: 'squared residual û²', ny: 4 });
      F1.clip(c); for (var i = 0; i < Math.min(d.n, 1000); i++) dot(c, F1.X(d.x[i]), F1.Y(b.u2[i]), 2.6, C.violet, 0.7); c.restore();
      fline(c, F1, function (x) { return b.aux.b[0] + b.aux.b[1] * x; }, C.gold, 2.5);
      label(c, 'Breusch–Pagan: LM = ' + fmt(b.LM, 1) + ', p ' + pfmt(b.p), F1.x + 6, F1.y + 12, b.p < 0.05 ? C.red : C.green, { size: 11.5, bold: true });
      // right: OLS, WLS and FGLS lines
      var x2 = wide ? 52 + pw + 38 : 52, y2 = wide ? top : top + ph + 46, F2 = frame(x2, y2, pw, ph, [20, 160], [-35, 50]);
      axes(c, F2, { xl: 'income', yl: 'saving', ny: 4 });
      F2.clip(c); for (i = 0; i < Math.min(d.n, 1000); i++) dot(c, F2.X(d.x[i]), F2.Y(d.y[i]), 2.4, '#a5d8ff', 0.5); c.restore();
      fline(c, F2, function (x) { return P.B0 + P.B1 * x; }, C.gold, 1.5, [5, 4]);
      fline(c, F2, function (x) { return f.b0 + f.b1 * x; }, C.green, 2.4);
      fline(c, F2, function (x) { return S.w.b0 + S.w.b1 * x; }, C.blue, 2.4);
      fline(c, F2, function (x) { return S.fg.b0 + S.fg.b1 * x; }, C.orange, 1.8, [7, 3]);
      legend(c, [[C.green, 'OLS'], [C.blue, 'WLS'], [C.orange, 'FGLS', true]], F2.x + 6, F2.y + 12, 11);
      // bottom: the comparison
      var y3 = (wide ? top + ph : y2 + ph) + 44, F3 = frame(52, y3, w - 72, h - y3 - 30, [P.B1 - 0.07, P.B1 + 0.07], [0, 1]), m = S.cmp;
      axes(c, F3, { noY: true, ny: 1, xl: 'estimated slope over 1,000 samples', fx: function (v) { return fmt(v, 2); } });
      if (m && m.o.length) {
        var nb = 50, co = binsOf(m.o, F3.xr[0], F3.xr[1], nb, true), cw = binsOf(m.w, F3.xr[0], F3.xr[1], nb, true), cf = binsOf(m.f, F3.xr[0], F3.xr[1], nb, true), mx = Math.max.apply(null, co.concat(cw, cf, [5])) * 1.08;
        if (m.stale) c.globalAlpha = 0.4;
        hist(c, F3, co, F3.xr[0], F3.xr[1], C.green, 0.35, mx, true); hist(c, F3, cf, F3.xr[0], F3.xr[1], C.orange, 0.25, mx, true); hist(c, F3, cw, F3.xr[0], F3.xr[1], C.blue, 0.35, mx, true);
        c.globalAlpha = 1;
        if (!m.running) label(c, 'spread (sd): OLS ' + fmt(m.sd[0], 4) + ' · WLS ' + fmt(m.sd[1], 4) + ' · FGLS ' + fmt(m.sd[2], 4) + (m.stale ? ' (old settings)' : ''), F3.x + 4, F3.y - 10, C.ink, { size: 11, bold: true });
        else label(c, 'Comparing… ' + m.k + ' of 1,000', F3.x + 4, F3.y - 10, C.muted, { size: 11, bold: true });
      } else label(c, w > 520 ? 'Press “Compare 1,000 samples” to see which estimator is most precise' : 'Compare 1,000 samples to see the spread', F3.x + 4, F3.y - 10, C.muted, { size: 11 });
      vline(c, F3, P.B1, C.gold, 1.5);
      if (GM.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (GM.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    update();
    L.loop(draw, cv);
  })();
  regen();
})(window, document);
