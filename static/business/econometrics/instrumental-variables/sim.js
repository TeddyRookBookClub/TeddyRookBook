/* Econometrics, Chapter 10 (Instrumental Variables and 2SLS): the interactives on this page. Models in model.js (window.EC10M),
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
  var P = W.EC10M, root = $('ec10-lab');
  if (!root || !L || !ES || !P) return;
  var B1 = P.B1, NS = [200, 500, 1000, 3000, 10000], REPS = 1000;
  var shared = { p: { n: 3000, pi: 0.32, gam: 1.2, del: 0 }, subs: [] };
  function f3(v) { return fmt(v, 3); }

  /* =====================================================================================
     1. THE MAIN SIMULATION: a world with an instrument, and 1,000 samples of OLS vs 2SLS
     ===================================================================================== */
  (function () {
    var view = $('ec10-view'), cv = $('ec10-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var S = { ni: 3, seed: 17, d: null, e: null, mc: null, touched: false, pulse: 0 };
    var el = { pre: $('ec10-pre'), read: $('ec10-read'), mcBtn: $('ec10-mc'), say: $('ec10-say') };
    var rpi = range('ec10-pi', function (v) { return fmt(v, 2) + ' years'; }, function (v) { shared.p.pi = v; changed(); });
    var rg = range('ec10-g', function (v) { return fmt(v, 1) + ' years per SD'; }, function (v) { shared.p.gam = v; changed(); });
    var rd = range('ec10-d', function (v) { return v === 0 ? '0 (valid)' : '+' + fmt(100 * v, 1) + '% wages'; }, function (v) { shared.p.del = v; changed(); });
    var rn = range('ec10-n', function (v) { return grp(NS[v]) + ' people'; }, function (v) { S.ni = v; shared.p.n = NS[v]; changed(); });
    function changed() { S.touched = true; sample(); if (S.mc && !S.mc.running) S.mc.stale = !same(S.mc.p, shared.p); shared.subs.forEach(function (fn) { fn(); }); }
    function same(a, b) { return a.n === b.n && a.pi === b.pi && a.gam === b.gam && a.del === b.del; }
    function sample() { S.d = P.gen(shared.p, S.seed); S.e = P.estimate(S.d); sync(); judge(); }
    var PRE = { card: [0.32, 1.2, 0, 3], strong: [1, 1.2, 0, 3], weak: [0.08, 1.2, 0, 3], invalid: [0.5, 1.2, 0.03, 3], clean: [0.5, 0, 0, 3] };
    el.pre.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre];
      shared.p.pi = q[0]; shared.p.gam = q[1]; shared.p.del = q[2]; S.ni = q[3]; shared.p.n = NS[q[3]]; rpi.set(q[0]); rg.set(q[1]); rd.set(q[2]); rn.set(q[3]); changed();
    });
    function newSample() { S.seed = (S.seed * 7919 + 13) % 999983; S.touched = true; sample(); S.pulse = 1; }
    $('ec10-new').addEventListener('click', newSample); $('ec10-new2').addEventListener('click', newSample);
    el.mcBtn.addEventListener('click', startMC); $('ec10-mc2').addEventListener('click', startMC);
    $('ec10-reset').addEventListener('click', function () { shared.p = { n: 3000, pi: 0.32, gam: 1.2, del: 0 }; S.ni = 3; rpi.set(0.32); rg.set(1.2); rd.set(0); rn.set(3); S.mc = null; sample(); shared.subs.forEach(function (fn) { fn(); }); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'n' || k === 'N') newSample(); else if (k === 'm' || k === 'M' || k === 'Enter') startMC();
      else if (k === 'ArrowUp' || k === 'ArrowDown') { shared.p.pi = clamp(Math.round((shared.p.pi + (k === 'ArrowUp' ? 0.02 : -0.02)) * 100) / 100, 0, 1.5); rpi.set(shared.p.pi); changed(); }
      else if (k === 'ArrowRight' || k === 'ArrowLeft') { shared.p.del = clamp(Math.round((shared.p.del + (k === 'ArrowRight' ? 0.002 : -0.002)) * 1000) / 1000, 0, 0.06); rd.set(shared.p.del); changed(); }
      else used = false;
      if (used) e.preventDefault();
    });
    function startMC() { if (S.mc && S.mc.running) return; S.touched = true; scrollTo(view); var p = { n: shared.p.n, pi: shared.p.pi, gam: shared.p.gam, del: shared.p.del }; S.mc = { p: p, o: [], iv: [], F: [], cO: 0, cI: 0, running: true, seed: 50000 + S.seed }; el.mcBtn.disabled = true; el.mcBtn.textContent = 'Running…'; runner(function () { stepMC(); return !!(S.mc && S.mc.running); }); }
    function stepMC() {
      var m = S.mc; if (!m || !m.running) return;
      var per = reduced ? REPS : Math.max(3, Math.round(45000 / m.p.n));
      for (var j = 0; j < per && m.o.length < REPS; j++) {
        var e = P.estimate(P.gen(m.p, m.seed + m.o.length * 7)); m.o.push(e.ols); m.iv.push(e.iv); m.F.push(e.F);
        if (Math.abs(e.ols - B1) <= 1.96 * e.seO) m.cO++; if (Math.abs(e.iv - B1) <= 1.96 * e.seI) m.cI++;
      }
      if (m.o.length >= REPS) {
        m.running = false; var q = ES.quantile;
        m.oMed = q(m.o, 0.5); m.ivMed = q(m.iv, 0.5); m.oIqr = q(m.o, 0.75) - q(m.o, 0.25); m.ivIqr = q(m.iv, 0.75) - q(m.iv, 0.25); m.fMed = q(m.F, 0.5); m.f10 = m.F.filter(function (v) { return v > 10; }).length / REPS;
        el.mcBtn.disabled = false; el.mcBtn.textContent = '▶ Run 1,000 samples'; judgeMC(m); sync();
      }
    }
    var MIS = [
      { id: 'ols', title: 'OLS is fooled', goal: 'Run 1,000 samples with ability tangled in: OLS misses the true 0.080 by more than 0.015 while 2SLS lands within 0.005.' },
      { id: 'f10', title: 'Pass the first stage', goal: 'Get a single sample whose first-stage F is above 10.' },
      { id: 'weak', title: 'Weak instrument', goal: 'Run 1,000 samples with a median first-stage F below 5. Watch the 2SLS pile.' },
      { id: 'invalid', title: 'A broken instrument', goal: 'Let distance affect wages directly until 2SLS lands farther from the truth than OLS.' },
      { id: 'leak', title: 'Small leak, weak pipe', goal: 'With a direct effect of 1% or less and an instrument strength of 0.25 or less, make 2SLS miss by more than 0.03.' },
      { id: 'price', title: 'The price of IV', goal: 'With no confounding at all, run 1,000 samples: both are centered, but 2SLS is at least 3 times as spread out.' }
    ];
    var M = missionKit('ec10-missions', 'ec10', MIS, view, function (id) {
      var q = { ols: [0.6, 1.2, 0, 3], f10: [0.1, 1.2, 0, 2], weak: [0.32, 1.2, 0, 3], invalid: [0.5, 1.2, 0.005, 3], leak: [0.5, 1.2, 0.005, 3], price: [0.5, 0.6, 0, 3] }[id];
      shared.p.pi = q[0]; shared.p.gam = q[1]; shared.p.del = q[2]; S.ni = q[3]; shared.p.n = NS[q[3]]; rpi.set(q[0]); rg.set(q[1]); rd.set(q[2]); rn.set(q[3]); sample(); shared.subs.forEach(function (fn) { fn(); });
      L.toast(view, { ols: 'The defaults are fine: press “Run 1,000 samples”.', f10: 'Make the instrument stronger, or the sample bigger.', weak: 'Slide instrument strength toward zero, then run.', invalid: 'Push the direct effect up and run 1,000 samples.', leak: 'Bias = δ/π: a small δ over a small π is big.', price: 'Set ability’s pull on schooling to 0, then run.' }[id]);
    });
    function judge() {
      if (!S.touched) return;
      if (S.e.F > 10) M.win('f10', 'First-stage F = ' + fmt(S.e.F, 1) + '. Strong enough by the old rule of thumb, though see the lesson below.');
    }
    function judgeMC(m) {
      var p = m.p;
      if (p.gam > 0 && Math.abs(m.oMed - B1) > 0.015 && Math.abs(m.ivMed - B1) <= 0.005) M.win('ols', 'OLS centered on ' + f3(m.oMed) + '; 2SLS on ' + f3(m.ivMed) + '. The instrument sees past ability.');
      if (m.fMed < 5) M.win('weak', 'Median F ' + fmt(m.fMed, 1) + ': the 2SLS pile is ' + fmt(m.ivIqr / m.oIqr, 0) + '× wider than OLS, and its center drifts toward OLS.');
      if (p.del > 0 && Math.abs(m.ivMed - B1) > Math.abs(m.oMed - B1)) M.win('invalid', '2SLS centered on ' + f3(m.ivMed) + ', worse than OLS (' + f3(m.oMed) + '). An invalid instrument can be worse than none.');
      if (p.del > 0 && p.del <= 0.01 && p.pi <= 0.25 && Math.abs(m.ivMed - B1) > 0.03) M.win('leak', 'Bias ≈ δ/π = ' + f3(p.del / p.pi) + ': a weak instrument magnifies a tiny violation.');
      if (p.gam === 0 && Math.abs(m.oMed - B1) < 0.005 && Math.abs(m.ivMed - B1) < 0.005 && m.ivIqr >= 3 * m.oIqr) M.win('price', 'Both centered, but 2SLS is ' + fmt(m.ivIqr / m.oIqr, 1) + '× as spread out. IV buys consistency with precision.');
    }
    function sync() {
      var e = S.e, pl = P.plims(shared.p), m = S.mc;
      seg(el.pre, 'data-pre', Object.keys(PRE).filter(function (k) { var q = PRE[k]; return q[0] === shared.p.pi && q[1] === shared.p.gam && q[2] === shared.p.del && q[3] === S.ni; })[0] || '');
      var html = '<dt>OLS β̂₁ (se)</dt><dd class="ec10-pk">' + f3(e.ols) + ' (' + f3(e.seO) + ')</dd><dt>2SLS β̂₁ (se)</dt><dd class="ec10-gr">' + f3(e.iv) + ' (' + f3(e.seI) + ')</dd>' +
        '<dt>First stage π̂ (se)</dt><dd>' + f3(e.pi) + ' (' + f3(e.sePi) + ')</dd><dt>First-stage F</dt><dd>' + fmt(e.F, 1) + '</dd>' +
        '<dt>Where OLS heads (large n)</dt><dd>' + f3(pl.ols) + '</dd><dt>Where 2SLS heads: 0.08 + δ/π</dt><dd>' + (shared.p.pi > 0 ? f3(pl.iv) : '—') + '</dd>';
      if (m && !m.running) html += '<dt>Median OLS / 2SLS</dt><dd>' + f3(m.oMed) + ' / ' + f3(m.ivMed) + '</dd><dt>Samples with F &gt; 10</dt><dd>' + pct(m.f10, 0) + '</dd><dt>95% intervals cover: OLS / 2SLS</dt><dd>' + pct(m.cO / REPS, 0) + ' / ' + pct(m.cI / REPS, 0) + '</dd>';
      el.read.innerHTML = html;
      el.say.textContent = 'This sample: OLS ' + f3(e.ols) + ', 2SLS ' + f3(e.iv) + ', first-stage F ' + fmt(e.F, 1) + '. The true return is 0.080.' + (m && !m.running ? ' Over 1,000 samples, OLS centered on ' + f3(m.oMed) + ' and 2SLS on ' + f3(m.ivMed) + '.' : '');
    }
    // drawing
    function node(x, y, r, title, sub, col, dashed) {
      c.save(); c.fillStyle = 'rgba(11,27,39,.95)'; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
      c.strokeStyle = col; c.lineWidth = 2; if (dashed) c.setLineDash([5, 4]); c.stroke(); c.restore();
      label(c, title, x, y - (sub ? 5 : 0), col, { size: 13, bold: true, align: 'center', plain: true });
      if (sub) label(c, sub, x, y + 10, C.muted, { size: 9.5, align: 'center', plain: true });
    }
    function edge(a, b, ra, rb, val, max, col, text, bend, dashed) {
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, lw = 1 + 7 * clamp(Math.abs(val) / max, 0, 1);
      if (val === 0) { c.save(); c.globalAlpha = 0.35; }
      if (bend) {
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + bend, x0 = a[0] + ux * ra, y0 = a[1] + uy * ra + 6, x1 = b[0] - ux * rb, y1 = b[1] - uy * rb + 6;
        c.save(); c.strokeStyle = col; c.lineWidth = lw; if (dashed) c.setLineDash([7, 5]); c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mx, my, x1, y1); c.stroke(); c.restore();
        arrow(c, x1 - (x1 - mx) * 0.08, y1 - (y1 - my) * 0.08, x1, y1, col, Math.max(2, lw * 0.6), 7);
        label(c, text, mx, a[1] + bend * 0.55 + 8, col, { size: 11, bold: true, align: 'center' });
      } else {
        arrow(c, a[0] + ux * ra, a[1] + uy * ra, b[0] - ux * (rb + 2), b[1] - uy * (rb + 2), col, lw, 6 + lw * 0.6, dashed ? [7, 5] : null);
        label(c, text, (a[0] + b[0]) / 2 + uy * 14, (a[1] + b[1]) / 2 - ux * 14, col, { size: 11, bold: true, align: 'center' });
      }
      if (val === 0) c.restore();
    }
    function drawDag(x, y, w, h) {
      panelBox(c, x, y, w, h, 'THE CAUSAL STORY');
      var p = shared.p, r = Math.min(30, w / 11), cy = y + h * 0.66, Zp = [x + w * 0.13, cy], Sp = [x + w * 0.5, cy], Yp = [x + w * 0.87, cy], Ap = [x + w * 0.69, y + h * 0.3];
      edge(Zp, Sp, r, r, p.pi, 1.5, C.blue, 'π = ' + fmt(p.pi, 2));
      edge(Sp, Yp, r, r, B1, 0.1, C.gold, 'β₁ = 0.08');
      edge(Ap, Sp, r, r, p.gam, 2.5, C.violet, 'γ = ' + fmt(p.gam, 1));
      edge(Ap, Yp, r, r, P.B2, 0.2, C.violet, '0.15');
      edge(Zp, Yp, r, r, p.del, 0.06, C.red, p.del > 0 ? 'δ = ' + fmt(p.del, 3) + ': exclusion broken' : 'δ = 0: no direct path', h * 0.42, true);
      node(Zp[0], Zp[1], r, 'Z', 'near college', C.blue); node(Sp[0], Sp[1], r, 'S', 'schooling', C.ink); node(Yp[0], Yp[1], r, 'Y', 'log wage', C.ink); node(Ap[0], Ap[1], r, 'A', 'ability', C.violet, true);
      label(c, 'dashed circle: never observed', x + w - 10, y + 13, C.muted, { size: 10, align: 'right' });
    }
    function drawSample(x, y, w, h) {
      var e = S.e; panelBox(c, x, y, w, h, 'THIS SAMPLE');
      var lo = -0.05, hi = 0.25, F = frame(x + 52, y + 30, w - 68, Math.min(70, h * 0.42), [lo, hi], [0, 1]);
      c.strokeStyle = C.grid; c.beginPath(); ES.niceTicks(lo, hi, 6).ticks.forEach(function (v) { if (v < lo || v > hi) return; c.moveTo(F.X(v), F.y); c.lineTo(F.X(v), F.y + F.h); label(c, fmt(v, 2), F.X(v), F.y + F.h + 9, C.muted, { size: 9.5, align: 'center', plain: true }); }); c.stroke();
      vline(c, F, B1, C.gold, 2);
      [['OLS', e.ols, e.seO, C.pink, 0.3], ['2SLS', e.iv, e.seI, C.green, 0.72]].forEach(function (q) {
        var yy = F.y + F.h * q[4], a = F.X(clamp(q[1] - 1.96 * q[2], lo, hi)), b = F.X(clamp(q[1] + 1.96 * q[2], lo, hi));
        label(c, q[0], F.x - 8, yy, q[3], { size: 11, bold: true, align: 'right' });
        c.strokeStyle = q[3]; c.lineWidth = 3; c.beginPath(); c.moveTo(a, yy); c.lineTo(b, yy); c.stroke();
        if (q[1] >= lo && q[1] <= hi) dot(c, F.X(q[1]), yy, 5.5 + 3 * S.pulse, q[3]); else label(c, q[1] < lo ? '◀ ' + f3(q[1]) : f3(q[1]) + ' ▶', q[1] < lo ? F.x + 4 : F.x + F.w - 4, yy - 10, q[3], { size: 10, align: q[1] < lo ? 'left' : 'right' });
      });
      // first-stage F gauge on a log scale
      var gy = F.y + F.h + 40, gx = x + 52, gw = w - 68, fl = function (v) { return gx + gw * clamp(Math.log10(Math.max(v, 0.1)) + 1, 0, 4) / 4; };
      if (gy + 30 < y + h) {
        label(c, 'first-stage F (log scale)', gx, gy - 9, C.ink, { size: 10.5, bold: true });
        c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(gx, gy, gw, 14);
        c.fillStyle = e.F > 10 ? C.green : e.F > 5 ? C.gold : C.red; c.fillRect(gx, gy, fl(e.F) - gx, 14);
        [[10, '10'], [104.7, '104.7']].forEach(function (q) { var xx = fl(q[0]); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(xx, gy - 3); c.lineTo(xx, gy + 17); c.stroke(); label(c, q[1], xx, gy + 26, C.muted, { size: 9.5, align: 'center' }); });
        label(c, fmt(e.F, 1), Math.min(fl(e.F) + 6, gx + gw - 30), gy + 7, '#fff', { size: 11, bold: true });
      }
    }
    function drawMC(x, y, w, h) {
      var m = S.mc, lo = -0.04, hi = 0.26, F = frame(x, y + 8, w, h - 40, [lo, hi], [0, 1]);
      c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(F.x, F.y, F.w, F.h);
      axes(c, F, { noY: true, ny: 1, nx: 6, fx: function (v) { return fmt(v, 2); }, xl: 'estimated return to a year of school' });
      var title = m ? (m.running ? 'Drawing samples… ' + m.o.length + ' of 1,000' : '1,000 samples of ' + grp(m.p.n) + ' people' + (m.stale ? ' (old settings: run again)' : '')) : (w > 480 ? 'Press “Run 1,000 samples” to see OLS and 2SLS over many samples' : 'Run 1,000 samples to compare');
      label(c, title, x, y - 6, m && m.stale ? C.red : C.muted, { size: 11, bold: true });
      if (m && m.o.length) {
        var nb = Math.round(clamp(w / 8, 30, 90)), co = binsOf(m.o, lo, hi, nb, true), ci = binsOf(m.iv, lo, hi, nb, true), mx = Math.max(Math.max.apply(null, ci) * 1.15, 8);
        var oTop = Math.max.apply(null, co);
        if (m.stale) c.globalAlpha = 0.4;
        hist(c, F, ci, lo, hi, C.green, 0.5, mx, true);
        hist(c, F, co.map(function (v) { return Math.min(v, mx * 0.98); }), lo, hi, C.pink, 0.5, mx, true);
        c.globalAlpha = 1;
        if (oTop > mx) label(c, 'OLS pile is ' + fmt(oTop / mx, 0) + '× taller ↑', F.X(ES.quantile(m.o, 0.5)), F.y + 10, C.pink, { size: 10.5, bold: true, align: 'center' });
        var outL = m.iv.filter(function (v) { return v < lo; }).length, outR = m.iv.filter(function (v) { return v > hi; }).length;
        if (outL) label(c, '◀ ' + outL + ' further left', F.x + 4, F.y + F.h - 30, C.green, { size: 10 });
        if (outR) label(c, outR + ' further right ▶', F.x + F.w - 4, F.y + F.h - 30, C.green, { size: 10, align: 'right' });
        if (!m.running) {
          var s = 'OLS median ' + f3(m.oMed) + ' · 2SLS median ' + f3(m.ivMed) + ' · median F ' + fmt(m.fMed, 1) + ' · F > 10 in ' + pct(m.f10, 0);
          label(c, w > 620 ? s : '2SLS median ' + f3(m.ivMed) + ' · median F ' + fmt(m.fMed, 1), F.x + F.w, y - 6, C.ink, { size: 11, align: 'right' });
          vline(c, F, P.plims(m.p).iv, C.green, 1.2, [3, 4]);
        }
      }
      vline(c, F, B1, C.gold, 2.2); label(c, 'truth 0.08', F.X(B1) + 5, F.y + F.h - 10, C.gold, { size: 10.5, bold: true });
      legend(c, [[C.pink, 'OLS'], [C.green, '2SLS']], F.x + F.w - 130, F.y + 14, 11);
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h; bg(c, w, h); if (M.flash > 0) M.flash -= dt; if (S.pulse > 0) S.pulse = Math.max(0, S.pulse - dt * 3);
      if (w >= 640) { var tw = Math.round(w * 0.54); drawDag(12, 50, tw - 18, h * 0.44 - 50); drawSample(tw, 50, w - tw - 12, h * 0.44 - 50); drawMC(48, h * 0.44 + 34, w - 64, h * 0.56 - 44); }
      else { drawDag(10, 54, w - 20, h * 0.3 - 54); drawSample(10, h * 0.3 + 8, w - 20, h * 0.27); drawMC(28, h * 0.57 + 40, w - 40, h * 0.43 - 48); }
      if (M.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (M.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    sample();
    L.loop(draw, cv);
  })();

  /* =====================================================================================
     2. 2SLS STEP BY STEP (n = 400, the same world settings)
     ===================================================================================== */
  (function () {
    var view = $('ec10b-view'), cv = $('ec10b-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var S = { st: 0, from: 0, t: 1, seed: 5, d: null, ts: null, wd: null, ols: null, tsls: null, jit: [] };
    var say = $('ec10b-say'), read = $('ec10b-read');
    var TXT = [
      'The problem: log wage against schooling, for 400 people. Gold dots grew up near a college, blue ones didn’t. The pink OLS line is too steep, because able people get more schooling and also earn more.',
      'Stage 1: regress schooling on the instrument. People who grew up near a college got π̂ more years of school on average. The first-stage F tells you whether that gap is clearly real.',
      'Stage 1, fitted values: replace each person’s schooling with the part the instrument predicts, Ŝ. Everyone slides to one of two values, the two group averages. Ability’s influence on schooling is gone.',
      'Stage 2: regress log wage on Ŝ. The line runs through the two group averages, so its slope is the Wald ratio (ȳ₁ − ȳ₀)/(S̄₁ − S̄₀): the wage gap the instrument causes, per year of schooling it causes.',
      'Standard errors: running the second stage by hand gives the right slope but the wrong standard error, because its residuals use Ŝ instead of the real S. 2SLS software uses y − β̂₀ − β̂₁S.'
    ];
    function regen() {
      var p = { n: 400, pi: Math.max(1, shared.p.pi), gam: shared.p.gam, del: shared.p.del };
      S.p = p; S.d = P.gen(p, S.seed); S.ts = P.twoStep(S.d); S.wd = P.wald(S.d); S.ols = ES.ols(S.d.Y, S.d.S.map(function (v) { return [v]; }), { intercept: true });
      S.tsls = ES.tsls(S.d.Y, S.d.S.map(function (v) { return [v]; }), S.d.Z.map(function (v) { return [v]; }), { intercept: true, endog: [1] });
      var r = ES.rng(S.seed + 1); S.jit = S.d.Z.map(function () { return r.u() - 0.5; });
      sync();
    }
    shared.subs.push(regen);
    $('ec10b-prev').addEventListener('click', function () { go(S.st - 1); });
    $('ec10b-next').addEventListener('click', function () { go(S.st + 1); });
    $('ec10b-new').addEventListener('click', function () { S.seed = (S.seed * 7919 + 13) % 999983; regen(); });
    cv.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { go(S.st + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { go(S.st - 1); e.preventDefault(); } });
    function go(k) { k = clamp(k, 0, 4); if (k === S.st) return; S.from = S.st; S.st = k; S.t = reduced ? 1 : 0; sync(); }
    function sync() {
      var ts = S.ts, wd = S.wd, t = S.tsls;
      say.textContent = 'Step ' + S.st + ' of 4. ' + TXT[S.st] + (S.p && S.p.pi !== shared.p.pi ? ' (This demo uses an instrument strength of at least 1 year so the steps are easy to see.)' : '');
      $('ec10b-prev').disabled = S.st === 0; $('ec10b-next').disabled = S.st === 4;
      read.innerHTML = '<dt>OLS slope (biased)</dt><dd class="ec10-pk">' + f3(S.ols.b[1]) + '</dd><dt>First stage π̂, F</dt><dd>' + f3(ts.fs.b[1]) + ', F = ' + fmt(ts.F, 1) + '</dd>' +
        '<dt>Group means S̄₀, S̄₁</dt><dd>' + fmt(wd.S0, 2) + ', ' + fmt(wd.S1, 2) + '</dd><dt>Group means ȳ₀, ȳ₁</dt><dd>' + f3(wd.Y0) + ', ' + f3(wd.Y1) + '</dd>' +
        '<dt>Wald (ȳ₁ − ȳ₀)/(S̄₁ − S̄₀)</dt><dd class="ec10-gr">' + f3(wd.b) + '</dd><dt>2SLS from the library</dt><dd class="ec10-gr">' + f3(t.b[1]) + '</dd>' +
        '<dt>Second-stage se, by hand (wrong)</dt><dd class="ec10-rd">' + fmt(ts.seNaive, 4) + '</dd><dt>2SLS se (right)</dt><dd class="ec10-gr">' + fmt(t.se[1], 4) + '</dd>';
    }
    function xOf(k, i) { var d = S.d; return k === 1 ? d.Z[i] + 0.32 * S.jit[i] : k === 2 || k === 3 || k === 4 ? S.ts.Sh[i] + (k >= 3 ? 0.18 * S.jit[i] : 0) : d.S[i]; }
    function yOf(k, i) { return k === 1 ? S.d.S[i] : S.d.Y[i]; }
    function frameFor(k, box) {
      var d = S.d, xs = k === 1 ? [-0.6, 1.6] : span(d.S, 0.04), ys = k === 1 ? span(d.S, 0.05) : span(d.Y, 0.05);
      return frame(box[0], box[1], box[2], box[3], xs, ys);
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, d = S.d; bg(c, w, h);
      if (S.t < 1) S.t = Math.min(1, S.t + dt * 1.1); var t = ease(S.t);
      var box = [56, 58, w - 76, h - 108], F0 = frameFor(S.from, box), F1 = frameFor(S.st, box);
      var titles = ['The problem', 'Stage 1', 'Stage 1: fitted values', 'Stage 2', 'Standard errors'];
      label(c, titles[S.st], 16, 22, C.gold, { size: 15, bold: true });
      label(c, ['OLS of wage on schooling is biased', 'schooling on the instrument', 'each S replaced by Ŝ', 'wage on Ŝ: the 2SLS slope', 'why the by-hand SE is wrong'][S.st], 16 + textW(c, titles[S.st], 15, true) + 10, 22, C.ink, { size: 13 });
      var AX = function (k) { return k === 1 ? ['grew up near a college (0 = no, 1 = yes)', 'years of schooling'] : k >= 2 ? ['Ŝ: schooling predicted by the instrument', 'log hourly wage'] : ['years of schooling', 'log hourly wage']; };
      c.globalAlpha = 1 - t; if (t < 1) axes(c, F0, { xl: AX(S.from)[0], yl: AX(S.from)[1], fx: S.from === 1 ? function (v) { return v === 0 || v === 1 ? String(v) : ''; } : null });
      c.globalAlpha = t; axes(c, F1, { xl: AX(S.st)[0], yl: AX(S.st)[1], fx: S.st === 1 ? function (v) { return v === 0 || v === 1 ? String(v) : ''; } : null }); c.globalAlpha = 1;
      for (var i = 0; i < d.n; i++) {
        var x0 = F0.X(xOf(S.from, i)), y0 = F0.Y(yOf(S.from, i)), x1 = F1.X(xOf(S.st, i)), y1 = F1.Y(yOf(S.st, i));
        dot(c, lerp(x0, x1, t), lerp(y0, y1, t), 2.8, d.Z[i] ? C.gold : C.blue, 0.65);
      }
      c.globalAlpha = t;
      var wd = S.wd, ts = S.ts, ols = S.ols;
      if (S.st === 0) fline(c, F1, function (x) { return ols.b[0] + ols.b[1] * x; }, C.pink, 3);
      if (S.st === 1) {
        fline(c, F1, function (x) { return ts.fs.b[0] + ts.fs.b[1] * x; }, C.blue, 2.5, null, 0, 1);
        [[0, wd.S0], [1, wd.S1]].forEach(function (q) { ring(c, F1.X(q[0]), F1.Y(q[1]), 9, '#fff', 2.5); });
        label(c, 'π̂ = ' + fmt(ts.fs.b[1], 2) + ' years, F = ' + fmt(ts.F, 1), F1.X(0.5), F1.Y((wd.S0 + wd.S1) / 2) - 26, C.blue, { size: 12.5, bold: true, align: 'center' });
      }
      if (S.st >= 3) {
        fline(c, F1, function (x) { return ts.b0 + ts.b1 * x; }, C.green, 3);
        fline(c, F1, function (x) { return ols.b[0] + ols.b[1] * x; }, C.pink, 1.6, [6, 5]);
        [[wd.S0, wd.Y0], [wd.S1, wd.Y1]].forEach(function (q) { ring(c, F1.X(q[0]), F1.Y(q[1]), 9, '#fff', 2.5); dot(c, F1.X(q[0]), F1.Y(q[1]), 4, '#fff'); });
        label(c, 'slope = (' + f3(wd.Y1) + ' − ' + f3(wd.Y0) + ') / (' + fmt(wd.S1, 2) + ' − ' + fmt(wd.S0, 2) + ') = ' + f3(wd.b), F1.x + 8, F1.y + 14, C.green, { size: 12, bold: true });
      }
      if (S.st === 4) {
        var bx = F1.x + F1.w - Math.min(330, F1.w - 20), by = F1.y + F1.h - 96, bw = Math.min(320, F1.w - 30);
        c.fillStyle = 'rgba(6,17,26,.88)'; rrect(c, bx, by, bw, 84, 10); c.fill(); c.strokeStyle = C.line; c.stroke();
        label(c, 'by hand, step 2 OLS se: ' + fmt(ts.seNaive, 4), bx + 12, by + 20, C.red, { size: 12, bold: true });
        label(c, '2SLS se (residuals use real S): ' + fmt(S.tsls.se[1], 4), bx + 12, by + 42, C.green, { size: 12, bold: true });
        label(c, 'same slope, ' + fmt(Math.abs(ts.seNaive / S.tsls.se[1] - 1) * 100, 0) + '% different se', bx + 12, by + 64, C.muted, { size: 11 });
      }
      c.globalAlpha = 1;
      legend(c, [[C.gold, 'grew up near a college'], [C.blue, 'did not']], 16, h - 16, 11);
    }
    regen(); L.loop(draw, cv);
  })();
})(window, document);
