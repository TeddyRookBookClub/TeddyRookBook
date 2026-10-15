/* Econometrics, Chapter 6 (Multiple Regression and Omitted Variables): the interactives on this page. Models in model.js (window.EC6M),
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
  var P = W.EC6M, root = $('ec6-lab');
  if (!root || !L || !ES || !P) return;
  var B1 = P.W1.b1;
  function abilCol(a) { var t = clamp((a + 2) / 4, 0, 1); return t < 0.5 ? lerpCol('#4dabf7', '#c5d6e0', t * 2) : lerpCol('#c5d6e0', '#ffa94d', t * 2 - 1); }

  /* =====================================================================================
     1. THE MAIN SIMULATION: wages, schooling and the ability you can't see
     ===================================================================================== */
  (function () {
    var view = $('ec6-view'), cv = $('ec6-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var NS = [30, 50, 100, 200, 500, 1000, 2000];
    var S = { b2: 4, r: 0.5, ni: 3, seed: 11, d: null, f: null, mc: null, touched: false, groups: true, color: true, anim: 1 };
    var el = { pre: $('ec6-pre'), read: $('ec6-read'), groups: $('ec6-groups'), color: $('ec6-color'), mcBtn: $('ec6-mc'), say: $('ec6-say') };
    var rb2 = range('ec6-b2', function (v) { return (v > 0 ? '+' : '') + '$' + fmt(v, 1).replace('−', '−') + ' per SD'; }, function (v) { S.b2 = v; touch(); refit(); });
    var rr = range('ec6-r', function (v) { return sgn(v, 2); }, function (v) { S.r = v; touch(); refit(); });
    var rn = range('ec6-n', function (v) { return grp(NS[v]) + ' workers'; }, function (v) { S.ni = v; touch(); refit(); });
    function p() { return { n: NS[S.ni], b2: S.b2, r: S.r }; }
    var lastLines = null;
    function refit() {
      var old = S.f;
      S.d = P.genAbility(p(), S.seed); S.f = P.fitAbility(S.d);
      if (old) lastLines = { s0: old.short.b[0], s1: old.short.b[1], l0: old.long.b[0], l1: old.long.b[1], l2: old.long.b[2] };
      S.anim = lastLines && !reduced ? 0 : 1;
      if (S.mc && !S.mc.running && !same(S.mc.p, p())) S.mc.stale = true;
      sync(); judge();
    }
    function same(a, b) { return a.n === b.n && a.b2 === b.b2 && a.r === b.r; }
    function touch() { S.touched = true; }
    var PRE = { bias: { b2: 4, r: 0.5 }, nolink: { b2: 4, r: 0 }, irrelevant: { b2: 0, r: 0.6 }, reverse: { b2: 4, r: -0.6 } };
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre]; S.b2 = q.b2; S.r = q.r; rb2.set(S.b2); rr.set(S.r); touch(); refit(); });
    el.groups.addEventListener('change', function () { S.groups = el.groups.checked; });
    el.color.addEventListener('change', function () { S.color = el.color.checked; });
    $('ec6-new').addEventListener('click', newSample); $('ec6-new2').addEventListener('click', newSample);
    function newSample() { S.seed = (S.seed * 7919 + 13) % 1000003; touch(); refit(); }
    el.mcBtn.addEventListener('click', startMC); $('ec6-mc2').addEventListener('click', startMC);
    $('ec6-reset').addEventListener('click', function () { S.b2 = 4; S.r = 0.5; S.ni = 3; rb2.set(4); rr.set(0.5); rn.set(3); S.mc = null; refit(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'n' || k === 'N' || k === 'Enter') newSample(); else if (k === 'm' || k === 'M') startMC();
      else if (k === 'ArrowUp' || k === 'ArrowDown') { S.b2 = clamp(S.b2 + (k === 'ArrowUp' ? 0.5 : -0.5), -6, 8); rb2.set(S.b2); touch(); refit(); }
      else if (k === 'ArrowLeft' || k === 'ArrowRight') { S.r = clamp(Math.round((S.r + (k === 'ArrowRight' ? 0.05 : -0.05)) * 100) / 100, -0.9, 0.9); rr.set(S.r); touch(); refit(); }
      else used = false;
      if (used) e.preventDefault();
    });
    function startMC() {
      if (S.mc && S.mc.running) return; touch(); var q = p(); scrollTo(view);
      S.mc = { p: q, sh: [], lo: [], seed: 5000 + S.seed, running: true, stale: false, reps: 1000 };
      el.mcBtn.disabled = true; el.mcBtn.textContent = 'Running…';
      runner(function () { stepMC(); return !!(S.mc && S.mc.running); });
    }
    function stepMC() {
      var m = S.mc; if (!m || !m.running) return;
      var per = reduced ? 1000 : Math.max(10, Math.round(60000 / m.p.n));
      for (var k = 0; k < per && m.sh.length < m.reps; k++) { var q = P.slopes(P.genAbility(m.p, m.seed + m.sh.length * 31 + 1)); m.sh.push(q.short); m.lo.push(q.long); }
      if (m.sh.length >= m.reps) { m.running = false; el.mcBtn.disabled = false; el.mcBtn.textContent = '▶ Run 1,000 samples'; m.mS = ES.mean(m.sh); m.mL = ES.mean(m.lo); m.sdS = ES.sd(m.sh); m.sdL = ES.sd(m.lo); judgeMC(m); sync(); }
    }

    /* missions */
    var MIS = [
      { id: 'up', title: 'Ability bias', goal: 'Make the short regression overstate the true $2.00 effect of a year of school by at least $1.' },
      { id: 'down', title: 'Bias the other way', goal: 'Make the short regression understate the effect by at least $1.' },
      { id: 'nocorr', title: 'A harmless omission', goal: 'Ability matters a lot (at least $4 per SD), yet leaving it out causes no bias.' },
      { id: 'neg', title: 'The wrong sign', goal: 'Get a short-regression slope below zero, even though school truly raises wages.' },
      { id: 'center', title: 'Bias isn’t bad luck', goal: 'With a predicted bias of at least $0.75, run 1,000 samples: the short slopes pile up around $2 + bias, not $2.' },
      { id: 'big', title: 'More data won’t fix it', goal: 'Run 1,000 samples of at least 1,000 workers each with a big bias: a narrow pile, still in the wrong place.' },
      { id: 'irrel', title: 'Correlated but irrelevant', goal: 'Set ability’s effect to $0 and its correlation with school to at least 0.6, then run 1,000 samples. Who is noisier?' }
    ];
    var M = missionKit('ec6-missions', 'ec6', MIS, view, function (id) {
      var q = { up: [2, 0.2, 3], down: [3, 0.1, 3], nocorr: [2, 0.5, 3], neg: [5, -0.4, 3], center: [4, 0.6, 1], big: [4, 0.6, 3], irrel: [3, 0.3, 3] }[id];
      S.b2 = q[0]; S.r = q[1]; S.ni = q[2]; rb2.set(S.b2); rr.set(S.r); rn.set(S.ni); refit();
      L.toast(view, { up: 'Ability raises wages and goes with more school: push both sliders up.', down: 'Make ability and school move in opposite directions.', nocorr: 'Bias = β₂ × (how ability moves with school). Make one factor zero.',
        neg: 'You need a bias bigger than $2 pointing down: a strong ability effect and a strong negative correlation.', center: 'Set a sizeable bias, then press “Run 1,000 samples”.', big: 'Slide the sample size to 1,000 or more and run.', irrel: 'β₂ = 0 means no bias. Watch the spread of the two piles.' }[id]);
    });
    function judge() {
      if (!S.touched) return; var f = S.f;
      if (f.bShort - B1 >= 1) M.win('up', 'Ability bias: the short slope is $' + fmt(f.bShort, 2) + ', not $2.00.');
      if (B1 - f.bShort >= 1) M.win('down', 'Understated by $' + fmt(B1 - f.bShort, 2) + '. The sign of the bias = sign(β₂) × sign(corr).');
      if (Math.abs(S.b2) >= 4 && Math.abs(P.popBias(p())) <= 0.05) M.win('nocorr', 'No correlation, no bias: what you leave out only hurts if it moves with what you keep.');
      if (f.bShort < 0) M.win('neg', 'The short regression says school lowers wages! Omitted variables can flip a sign.');
    }
    function judgeMC(m) {
      var bias = P.popBias(m.p);
      if (Math.abs(bias) >= 0.75 && Math.abs(m.mS - (B1 + bias)) < 0.1) M.win('center', 'The short slopes average $' + fmt(m.mS, 2) + ', right where the formula said: $' + fmt(B1 + bias, 2) + '.');
      if (m.p.n >= 1000 && Math.abs(bias) >= 0.75) M.win('big', 'Spread $' + fmt(m.sdS, 2) + ', bias $' + fmt(bias, 2) + ': bigger samples shrink the noise, never the bias.');
      if (m.p.b2 === 0 && Math.abs(m.p.r) >= 0.6) M.win('irrel', 'No bias either way, but the long regression is ' + fmt(m.sdL / m.sdS, 1) + '× as spread out: a correlated extra regressor costs precision.');
    }

    function sync() {
      var f = S.f, pb = P.popBias(p());
      seg(el.pre, 'data-pre', Object.keys(PRE).filter(function (k) { return PRE[k].b2 === S.b2 && PRE[k].r === S.r; })[0] || '');
      el.read.innerHTML =
        '<dt>Short slope β̃₁ (school only)</dt><dd class="ec6-pk">$' + fmt(f.bShort, 2) + '</dd>' +
        '<dt>Long slope β̂₁ (school + ability)</dt><dd class="ec6-gr">$' + fmt(f.bLong, 2) + '</dd>' +
        '<dt>Ability coefficient β̂₂</dt><dd>$' + fmt(f.bAbil, 2) + '</dd>' +
        '<dt>δ̃₁: ability per year of school</dt><dd>' + fmt(f.delta, 3) + '</dd>' +
        '<dt>β̂₂ × δ̃₁</dt><dd>$' + fmt(f.formula, 2) + '</dd>' +
        '<dt>Short − long</dt><dd>$' + fmt(f.gap, 2) + '</dd>' +
        '<dt>Bias in the population β₂·r/2.5</dt><dd>$' + fmt(pb, 2) + '</dd>' +
        '<dt>R² short / long</dt><dd>' + fmt(f.short.r2, 3) + ' / ' + fmt(f.long.r2, 3) + '</dd>' +
        '<dt>Adjusted R² long</dt><dd>' + fmt(f.long.adjR2, 3) + '</dd>';
      el.say.textContent = 'Short regression: $' + fmt(f.bShort, 2) + ' per year of school. Long regression holding ability fixed: $' + fmt(f.bLong, 2) + '. The gap, $' + fmt(f.gap, 2) + ', equals β̂₂ × δ̃₁ = ' + fmt(f.bAbil, 2) + ' × ' + fmt(f.delta, 3) + '.' +
        (S.mc && !S.mc.running ? ' Over 1,000 samples the short slope averaged $' + fmt(S.mc.mS, 2) + ' and the long slope $' + fmt(S.mc.mL, 2) + '.' : '');
    }

    /* drawing */
    function layout(w, h) {
      if (w >= 640) {
        var sw = Math.round(w * 0.6);
        return { sc: [56, 30, sw - 76, h * 0.6 - 54], ovb: [sw, 58, w - sw - 12, h * 0.6 - 66], mc: [56, h * 0.6 + 34, w - 76, h * 0.4 - 64], wide: true };
      }
      return { sc: [44, 58, w - 58, h * 0.38 - 58], ovb: [8, h * 0.38 + 30, w - 16, 236], mc: [44, h * 0.38 + 300, w - 58, h * 0.62 - 340], wide: false };
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, f = S.f, d = S.d; bg(c, w, h);
      S.anim = Math.min(1, S.anim + dt * 3.5); var t = ease(S.anim);
      if (M.flash > 0) M.flash -= dt;
      var Lo = layout(w, h);
      // scatter
      var sx = [6, 20], yAll = d.Y, yr = span(yAll.length > 400 ? yAll.slice(0, 400) : yAll, 0.04);
      yr = [Math.min(yr[0], 0), Math.max(yr[1], 50)];
      var F = frame(Lo.sc[0], Lo.sc[1], Lo.sc[2], Lo.sc[3], sx, yr);
      axes(c, F, { xl: 'years of schooling S', yl: 'hourly wage ($)' });
      F.clip(c);
      var nn = Math.min(d.n, 600), rad = d.n > 300 ? 2.2 : d.n > 100 ? 3 : 3.8;
      for (var i = 0; i < nn; i++) dot(c, F.X(d.S[i]), F.Y(d.Y[i]), rad, S.color ? abilCol(d.A[i]) : C.blue, d.n > 300 ? 0.55 : 0.8);
      c.restore();
      var ls = lastLines, sh0 = f.short.b[0], sh1 = f.short.b[1], l0 = f.long.b[0], l1 = f.long.b[1], l2 = f.long.b[2], mA = ES.mean(d.A);
      if (ls && t < 1) { sh0 = lerp(ls.s0, sh0, t); sh1 = lerp(ls.s1, sh1, t); l0 = lerp(ls.l0, l0, t); l1 = lerp(ls.l1, l1, t); l2 = lerp(ls.l2, l2, t); }
      if (S.groups) [-1, 1].forEach(function (a) { c.globalAlpha = 0.8; fline(c, F, function (s) { return l0 + l1 * s + l2 * a; }, abilCol(a * 1.6), 1.6, [6, 4]); c.globalAlpha = 1; });
      fline(c, F, function (s) { return P.W1.b0 + B1 * s; }, C.gold, 2, [2, 4]);
      fline(c, F, function (s) { return l0 + l1 * s + l2 * mA; }, C.green, 3);
      fline(c, F, function (s) { return sh0 + sh1 * s; }, C.pink, 3);
      var lgX = F.x + 8, lgY = F.y + 12;
      c.fillStyle = 'rgba(6,17,26,.72)'; rrect(c, F.x + 3, F.y + 3, Math.min(F.w - 6, Lo.wide ? 300 : 250), S.groups ? 62 : 46, 8); c.fill();
      label(c, 'short: school only, slope ' + fmt(f.bShort, 2), lgX + 20, lgY, C.pink, { size: 11 }); c.fillStyle = C.pink; c.fillRect(lgX, lgY - 1.5, 15, 3);
      label(c, 'long: holding ability fixed, slope ' + fmt(f.bLong, 2), lgX + 20, lgY + 16, C.green, { size: 11 }); c.fillStyle = C.green; c.fillRect(lgX, lgY + 14.5, 15, 3);
      label(c, 'truth: $2.00 per year', lgX + 20, lgY + 32, C.gold, { size: 11 }); c.fillStyle = C.gold; c.fillRect(lgX, lgY + 30.5, 15, 2);
      if (S.groups) label(c, 'dashed: low / high ability (±1 SD)', lgX + 20, lgY + 48, C.muted, { size: 10.5 });
      if (S.color) { // ability color key
        var kx = F.x + F.w - 112, ky = F.y + F.h - 14, gr = c.createLinearGradient(kx, 0, kx + 100, 0);
        gr.addColorStop(0, '#4dabf7'); gr.addColorStop(0.5, '#c5d6e0'); gr.addColorStop(1, '#ffd479');
        c.fillStyle = 'rgba(6,17,26,.7)'; rrect(c, kx - 6, ky - 20, 112, 30, 6); c.fill();
        c.fillStyle = gr; c.fillRect(kx, ky, 100, 5); label(c, 'low ← ability → high', kx + 50, ky - 9, C.muted, { size: 9.5, align: 'center' });
      }
      drawOVB(Lo.ovb, f, Lo.wide);
      drawMC(Lo.mc);
      if (M.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (M.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    function drawOVB(b, f, wide) {
      var x = b[0], y = b[1], w = b[2], h = b[3];
      panelBox(c, x, y, w, h, 'THE OMITTED-VARIABLE FORMULA');
      var eqY = y + 34, sz = wide ? 15 : 14;
      var parts = [['β̃₁', C.pink], [' = ', C.ink], ['β̂₁', C.green], [' + ', C.ink], ['β̂₂', C.gold], [' × ', C.ink], ['δ̃₁', C.blue]], xx = x + 12;
      parts.forEach(function (q) { label(c, q[0], xx, eqY, q[1], { size: sz, bold: true, plain: true }); xx += textW(c, q[0], sz, true); });
      var nums = fmt(f.bShort, 2) + ' = ' + fmt(f.bLong, 2) + ' + ' + fmt(f.bAbil, 2) + ' × ' + fmt(f.delta, 3);
      label(c, nums, x + 12, eqY + 20, C.ink, { size: 12.5, mono: true, plain: true });
      // number line with the decomposition
      var lo = Math.min(0, f.bShort, f.bLong, B1) - 0.3, hi = Math.max(3, f.bShort, f.bLong, B1) + 0.3, nl = ES.niceTicks(lo, hi, 4);
      var Fl = frame(x + 16, eqY + 44, w - 32, 34, [nl.lo, nl.hi], [0, 1]);
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(Fl.x, Fl.y + 34); c.lineTo(Fl.x + Fl.w, Fl.y + 34); c.stroke();
      nl.ticks.forEach(function (v) { var px = Fl.X(v); c.beginPath(); c.moveTo(px, Fl.y + 31); c.lineTo(px, Fl.y + 37); c.stroke(); label(c, '$' + fmt(v, nl.step < 1 ? 1 : 0), px, Fl.y + 46, C.muted, { size: 9.5, align: 'center', plain: true }); });
      c.fillStyle = C.green; c.globalAlpha = 0.8; c.fillRect(Math.min(Fl.X(0), Fl.X(f.bLong)), Fl.y + 4, Math.abs(Fl.X(f.bLong) - Fl.X(0)), 10); c.globalAlpha = 1;
      var g0 = Fl.X(f.bLong), g1 = Fl.X(f.bShort);
      c.fillStyle = f.formula >= 0 ? C.gold : C.red; c.globalAlpha = 0.85; c.fillRect(Math.min(g0, g1), Fl.y + 17, Math.max(1.5, Math.abs(g1 - g0)), 10); c.globalAlpha = 1;
      c.fillStyle = C.pink; c.beginPath(); c.moveTo(g1, Fl.y + 30); c.lineTo(g1 - 5, Fl.y + 21); c.lineTo(g1 + 5, Fl.y + 21); c.fill();
      c.strokeStyle = C.gold; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(Fl.X(B1), Fl.y); c.lineTo(Fl.X(B1), Fl.y + 34); c.stroke(); c.setLineDash([]);
      label(c, 'β̂₁', Math.min(g0, Fl.X(0)) - 4, Fl.y + 9, C.green, { size: 10, align: 'right' });
      label(c, 'bias part', Math.max(g0, g1) + 6, Fl.y + 22, f.formula >= 0 ? C.gold : C.red, { size: 10 });
      // sign table
      var ty = Fl.y + 62, rowsH = y + h - ty - 8; if (rowsH < 64) return;
      var cw = (w - 24) / 3, rh = Math.min(26, (rowsH - 18) / 3), tx = x + 12;
      label(c, 'Sign of the bias β₂·δ₁', tx, ty, C.muted, { size: 10.5, bold: true });
      var r0 = ty + 12, sb2 = S.b2 > 0 ? 0 : S.b2 < 0 ? 1 : -1, sr = S.r > 0 ? 0 : S.r < 0 ? 1 : -1;
      var head = ['', 'corr(S, a) > 0', 'corr(S, a) < 0'], rows = [['β₂ > 0', 'up ↑', 'down ↓'], ['β₂ < 0', 'down ↓', 'up ↑']];
      for (var j = 0; j < 3; j++) label(c, head[j], tx + cw * j + cw / 2, r0 + rh / 2, C.muted, { size: 10, align: 'center', plain: true });
      for (var i = 0; i < 2; i++) for (j = 0; j < 3; j++) {
        var cx0 = tx + cw * j, cy0 = r0 + rh * (i + 1), on = j > 0 && sb2 === i && sr === j - 1;
        if (on) { c.fillStyle = 'rgba(99,230,190,.18)'; rrect(c, cx0 + 2, cy0 + 2, cw - 4, rh - 4, 6); c.fill(); c.strokeStyle = C.green; c.lineWidth = 1.5; c.stroke(); }
        label(c, rows[i][j], cx0 + cw / 2, cy0 + rh / 2, j === 0 ? C.muted : on ? '#fff' : C.ink, { size: 11, align: 'center', bold: on, plain: true });
      }
      if (sb2 < 0 || sr < 0) label(c, S.b2 === 0 ? 'β₂ = 0: no bias' : 'corr = 0: no bias', x + w - 12, ty, C.green, { size: 10.5, bold: true, align: 'right' });
    }
    function drawMC(b) {
      var x = b[0], y = b[1], w = b[2], h = b[3], m = S.mc;
      var bias = P.popBias(m ? m.p : p()), lo = Math.min(B1, B1 + bias) - 1.1, hi = Math.max(B1, B1 + bias) + 1.1;
      var nl = ES.niceTicks(lo, hi, 6), F = frame(x, y, w, h, [nl.lo, nl.hi], [0, 1]);
      c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(F.x, F.y, F.w, F.h);
      axes(c, F, { noY: true, ny: 1, fx: function (v) { return '$' + fmt(v, nl.step < 1 ? 1 : 0); }, xl: 'estimated effect of a year of school' });
      label(c, m ? (m.running ? 'Drawing samples… ' + m.sh.length + ' of 1,000' : '1,000 samples of ' + grp(m.p.n) + ' workers' + (m.stale ? (w > 400 ? ' (old settings: run again)' : ' (old settings)') : '')) : w > 480 ? 'Press “Run 1,000 samples” to see the estimates from many samples' : 'Run 1,000 samples to see the spread', x, y - 10, m && m.stale ? C.red : C.muted, { size: 11, bold: true });
      if (m && m.sh.length) {
        var nb = Math.max(20, Math.min(60, Math.round(w / 9))), cs = binsOf(m.sh, F.xr[0], F.xr[1], nb), cl = binsOf(m.lo, F.xr[0], F.xr[1], nb), mx = Math.max.apply(null, cs.concat(cl, [5]));
        if (m.stale) c.globalAlpha = 0.4;
        hist(c, F, cl, F.xr[0], F.xr[1], C.green, 0.45, mx * 1.1, true);
        hist(c, F, cs, F.xr[0], F.xr[1], C.pink, 0.45, mx * 1.1, true);
        c.globalAlpha = 1;
        if (!m.running) {
          vline(c, F, B1 + P.popBias(m.p), C.pink, 1.5, [5, 4]);
          label(c, 'short avg ' + fmt(m.mS, 2), F.X(m.mS), F.y + 10, C.pink, { size: 10.5, bold: true, align: 'center' });
          label(c, 'long avg ' + fmt(m.mL, 2), F.X(m.mL), F.y + 24, C.green, { size: 10.5, bold: true, align: 'center' });
        }
      }
      vline(c, F, B1, C.gold, 2, null);
      label(c, 'truth $2', F.X(B1) + 4, F.y + F.h - 8, C.gold, { size: 10.5, bold: true });
    }
    G.fit(); refit(); S.anim = 1;
    L.loop(draw, cv);
    L.onTheme(function () { });
  })();

  /* =====================================================================================
     2 and 3. PARTIALLING OUT (Frisch–Waugh–Lovell) and THE 3-D PLANE share one data set of 60 workers
     ===================================================================================== */
  var shared = { c: -0.6, seed: 3, d: null, f: null, subs: [] };
  function regen() { shared.d = P.genWorkers({ n: 60, c: shared.c }, shared.seed); shared.f = P.fwl(shared.d); shared.subs.forEach(function (fn) { fn(); }); }
  function expCol(x) { return lerpCol('#4dabf7', '#ffd479', clamp(x / 32, 0, 1)); }

  (function () {
    var view = $('ec6f-view'), cv = $('ec6f-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var S = { st: 0, from: 0, t: 1, play: false, hold: 0 };
    var say = $('ec6f-say'), read = $('ec6f-read');
    var TXT = [
      'The raw picture: wage against schooling, colored by experience. The pink line is the simple regression of wage on schooling alone.',
      'Step 1: predict schooling from experience. Here people with more experience have less schooling, so the blue line slopes down.',
      'Step 2: keep only the part of schooling that experience can’t predict: the residual r̂ = schooling − predicted schooling. Each point drops to its distance from the blue line.',
      'Step 3: regress wage on that residual. The green slope is exactly the coefficient on schooling in the full regression with both variables.'
    ];
    var rc = range('ec6f-c', function (v) { return sgn(v, 2); }, function (v) { shared.c = v; regen(); });
    $('ec6f-prev').addEventListener('click', function () { go(S.st - 1); });
    $('ec6f-next').addEventListener('click', function () { go(S.st + 1); });
    $('ec6f-play').addEventListener('click', function () { S.play = true; S.hold = 0; go(S.st >= 3 ? 0 : S.st + 1); });
    $('ec6f-new').addEventListener('click', function () { shared.seed = (shared.seed * 48271 + 7) % 2147483647; regen(); });
    cv.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { go(S.st + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { go(S.st - 1); e.preventDefault(); } });
    function go(k) { k = clamp(k, 0, 3); if (k === S.st && S.t >= 1) { S.play = false; return; } S.from = S.st; S.st = k; S.t = reduced ? 1 : 0; sync(); }
    function sync() {
      var f = shared.f;
      say.textContent = 'Step ' + S.st + ' of 3. ' + TXT[S.st];
      $('ec6f-prev').disabled = S.st === 0; $('ec6f-next').disabled = S.st === 3;
      read.innerHTML = '<dt>Simple slope (wage on school)</dt><dd class="ec6-pk">' + fmt(f.simple.b[1], 3) + '</dd>' +
        '<dt>Step 1: R² of school on experience</dt><dd>' + fmt(f.r2aux, 3) + '</dd>' +
        '<dt>Step 3: slope on the residual</dt><dd class="ec6-gr">' + fmt(f.slope3, 3) + '</dd>' +
        '<dt>Full regression: coefficient on school</dt><dd class="ec6-gr">' + fmt(f.slopeFull, 3) + '</dd>' +
        '<dt>Difference</dt><dd>' + (Math.abs(f.slope3 - f.slopeFull) < 1e-9 ? '0 (to 10⁻⁹)' : fmt(f.slope3 - f.slopeFull, 12)) + '</dd>' +
        '<dt>Full regression: experience</dt><dd>' + fmt(f.full.b[2], 3) + '</dd>';
    }
    shared.subs.push(sync);
    function coords(k, i) { var d = shared.d, f = shared.f; return k === 0 ? [d.E[i], d.Y[i]] : k === 1 ? [d.X[i], d.E[i]] : k === 2 ? [d.X[i], f.resid[i]] : [f.resid[i], d.Y[i]]; }
    function frames(k, box) {
      var d = shared.d, f = shared.f, xs, ys;
      if (k === 0) { xs = d.E; ys = d.Y; } else if (k === 1) { xs = d.X; ys = d.E; } else if (k === 2) { xs = d.X; ys = f.resid; } else { xs = f.resid; ys = d.Y; }
      var xr = span(xs, 0.05), yr = span(ys, 0.08);
      if (k === 2) { var m = Math.max(Math.abs(yr[0]), Math.abs(yr[1])); yr = [-m, m]; }
      if (k === 3) { var mx = Math.max(Math.abs(xr[0]), Math.abs(xr[1])); xr = [-mx, mx]; }
      return frame(box[0], box[1], box[2], box[3], xr, yr);
    }
    var AX = [['years of schooling', 'hourly wage ($)'], ['years of experience', 'years of schooling'], ['years of experience', 'r̂: schooling experience can’t predict'], ['r̂: schooling experience can’t predict', 'hourly wage ($)']];
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, d = shared.d, f = shared.f; bg(c, w, h);
      if (S.t < 1) S.t = Math.min(1, S.t + dt * 0.9);
      if (S.play && S.t >= 1) { S.hold += dt; if (S.hold > 1.4) { S.hold = 0; if (S.st < 3) go(S.st + 1); else S.play = false; } }
      var t = ease(S.t), box = [52, 64, w - 72, h - 112];
      label(c, ['The data', 'Step 1', 'Step 2', 'Step 3'][S.st], 16, 22, C.gold, { size: 15, bold: true });
      label(c, ['wage on schooling, alone', 'schooling on experience', 'keep the residual r̂', 'wage on r̂ = the multiple-regression slope'][S.st], 16 + textW(c, ['The data', 'Step 1', 'Step 2', 'Step 3'][S.st], 15, true) + 10, 22, C.ink, { size: 13 });
      var F0 = frames(S.from, box), F1 = frames(S.st, box);
      c.globalAlpha = 1 - t; if (t < 1) axes(c, F0, { xl: AX[S.from][0], yl: AX[S.from][1] });
      c.globalAlpha = t; axes(c, F1, { xl: AX[S.st][0], yl: AX[S.st][1] }); c.globalAlpha = 1;
      var k1 = S.st;
      // lines for the current stage, fading in
      c.globalAlpha = t;
      if (k1 === 0) fline(c, F1, function (x) { return f.simple.b[0] + f.simple.b[1] * x; }, C.pink, 2.5);
      if (k1 === 1) {
        fline(c, F1, function (x) { return f.step1.b[0] + f.step1.b[1] * x; }, C.blue, 2.5);
        F1.clip(c); c.strokeStyle = 'rgba(116,192,252,.45)'; c.lineWidth = 1; c.beginPath();
        for (var i = 0; i < d.n; i++) { var px = F1.X(d.X[i]); c.moveTo(px, F1.Y(d.E[i])); c.lineTo(px, F1.Y(f.step1.fit[i])); } c.stroke(); c.restore();
      }
      if (k1 === 2) {
        fline(c, F1, function () { return 0; }, C.blue, 2);
        F1.clip(c); c.strokeStyle = 'rgba(116,192,252,.45)'; c.lineWidth = 1; c.beginPath();
        for (i = 0; i < d.n; i++) { px = F1.X(d.X[i]); c.moveTo(px, F1.Y(0)); c.lineTo(px, F1.Y(f.resid[i])); } c.stroke(); c.restore();
      }
      if (k1 === 3) {
        var my = ES.mean(d.Y);
        fline(c, F1, function (x) { return my + f.simple.b[1] * x; }, C.pink, 1.6, [6, 5]);
        fline(c, F1, function (x) { return f.step3.b[0] + f.step3.b[1] * x; }, C.green, 3);
      }
      c.globalAlpha = 1;
      // points, moving from the old stage to the new one
      for (i = 0; i < d.n; i++) {
        var a = coords(S.from, i), b2 = coords(S.st, i), x0 = F0.X(a[0]), y0 = F0.Y(a[1]), x1 = F1.X(b2[0]), y1 = F1.Y(b2[1]);
        dot(c, lerp(x0, x1, t), lerp(y0, y1, t), 4, expCol(d.X[i]), 0.9);
      }
      // legend
      var ly = h - 18, lx = 16;
      if (k1 === 0) lx = legend(c, [[C.pink, 'simple slope ' + fmt(f.simple.b[1], 2)]], lx, ly);
      if (k1 === 1) lx = legend(c, [[C.blue, 'predicted schooling, slope ' + fmt(f.step1.b[1], 2)]], lx, ly);
      if (k1 === 2) lx = legend(c, [[C.blue, 'r̂ has mean 0 and no link to experience']], lx, ly);
      if (k1 === 3) lx = legend(c, w > 560 ? [[C.green, 'slope ' + fmt(f.slope3, 3) + ' = full-regression β̂₁'], [C.pink, 'simple slope ' + fmt(f.simple.b[1], 2), true]] : [[C.green, 'slope ' + fmt(f.slope3, 3) + ' = β̂₁'], [C.pink, 'simple', true]], lx, ly);
      if (w > 520) { var kx = w - 128, gr = c.createLinearGradient(kx, 0, kx + 100, 0); gr.addColorStop(0, '#4dabf7'); gr.addColorStop(1, '#ffd479'); c.fillStyle = gr; c.fillRect(kx, 18, 100, 5); label(c, 'experience 0 → 32 yrs', kx + 50, 32, C.muted, { size: 9.5, align: 'center' }); }
    }
    L.loop(draw, cv);
    shared.syncF = sync;
  })();

  (function () {
    var view = $('ec6d-view'), cv = $('ec6d-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var S = { yaw: -0.75, pitch: 0.38, ty: null, tp: null, spin: !reduced, sticks: true, plane: true, drag: null, idle: 0 };
    var read = $('ec6d-read');
    function sync() {
      var f = shared.f;
      read.innerHTML = '<dt>Fitted plane</dt><dd>ŵage = ' + fmt(f.full.b[0], 1) + ' + ' + fmt(f.full.b[1], 2) + '·S ' + (f.full.b[2] < 0 ? '− ' : '+ ') + fmt(Math.abs(f.full.b[2]), 2) + '·exper</dd>' +
        '<dt>Truth</dt><dd>wage = 2 + 1.80·S + 0.50·exper + u</dd><dt>R²</dt><dd>' + fmt(f.full.r2, 3) + '</dd>';
    }
    shared.subs.push(sync);
    function setView(y, p) { S.ty = y; S.tp = p; S.spin = false; $('ec6d-spin').setAttribute('aria-pressed', 'false'); }
    $('ec6d-alongx').addEventListener('click', function () { setView(0, 0); });
    $('ec6d-alonge').addEventListener('click', function () { setView(-Math.PI / 2, 0); });
    $('ec6d-top').addEventListener('click', function () { setView(-0.75, 0.38); });
    $('ec6d-spin').addEventListener('click', function () { S.spin = !S.spin; this.setAttribute('aria-pressed', String(S.spin)); S.ty = null; });
    $('ec6d-sticks').addEventListener('change', function () { S.sticks = this.checked; });
    $('ec6d-plane').addEventListener('change', function () { S.plane = this.checked; });
    pointer(cv, function (x, y) { S.drag = [x, y, S.yaw, S.pitch]; S.spin = false; S.ty = null; $('ec6d-spin').setAttribute('aria-pressed', 'false'); return true; },
      function (x, y) { S.yaw = S.drag[2] + (x - S.drag[0]) * 0.01; S.pitch = clamp(S.drag[3] + (y - S.drag[1]) * 0.008, -0.15, 1.4); }, function () { S.drag = null; });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true; S.ty = null; S.spin = false;
      if (k === 'ArrowLeft') S.yaw -= 0.12; else if (k === 'ArrowRight') S.yaw += 0.12; else if (k === 'ArrowUp') S.pitch = clamp(S.pitch + 0.08, -0.15, 1.4); else if (k === 'ArrowDown') S.pitch = clamp(S.pitch - 0.08, -0.15, 1.4); else used = false;
      if (used) e.preventDefault();
    });
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, d = shared.d, f = shared.f; bg(c, w, h);
      if (S.spin) S.yaw += dt * 0.25;
      if (S.ty !== null) { var dy = S.ty - S.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); S.yaw += dy * Math.min(1, dt * 5); S.pitch += (S.tp - S.pitch) * Math.min(1, dt * 5); if (Math.abs(dy) < 1e-3 && Math.abs(S.tp - S.pitch) < 1e-3) S.ty = null; }
      var er = [6, 20], xr = [0, 36], yr = [0, 70];
      function nx(v) { return (v - er[0]) / (er[1] - er[0]) * 2 - 1; } function nz(v) { return (v - xr[0]) / (xr[1] - xr[0]) * 2 - 1; } function ny(v) { return (v - yr[0]) / (yr[1] - yr[0]) * 2 - 1; }
      var narrow = w < 520, cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch), R = narrow ? Math.min(w * 0.33, h * 0.36) : Math.min(w * 0.42, h * 0.4), ox = w / 2, oy = h / 2 + (narrow ? 20 : 8), DD = 6;
      function pr(u, v, z) { var x1 = u * cy - z * sy, z1 = u * sy + z * cy, y2 = v * cp - z1 * sp, z2 = v * sp + z1 * cp, s = DD / (DD + z2); return [ox + x1 * s * R, oy - y2 * s * R, z2, s]; }
      function P3(e, x, y) { return pr(nx(e), ny(y), nz(x)); }
      // floor grid and box
      c.lineWidth = 1; c.strokeStyle = C.grid; c.beginPath();
      for (var g = -1; g <= 1.001; g += 0.25) { var a = pr(g, -1, -1), b = pr(g, -1, 1); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); a = pr(-1, -1, g); b = pr(1, -1, g); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
      c.stroke();
      c.strokeStyle = 'rgba(120,170,200,.4)'; c.beginPath(); var o0 = pr(-1, -1, -1), ex = pr(1, -1, -1), ez = pr(-1, -1, 1), ey = pr(-1, 1, -1);
      c.moveTo(o0[0], o0[1]); c.lineTo(ex[0], ex[1]); c.moveTo(o0[0], o0[1]); c.lineTo(ez[0], ez[1]); c.moveTo(o0[0], o0[1]); c.lineTo(ey[0], ey[1]); c.stroke();
      label(c, 'schooling →', ex[0], ex[1] + 12, C.blue, { size: 11, bold: true, align: 'center' });
      label(c, 'experience →', ez[0], ez[1] + 12, C.gold, { size: 11, bold: true, align: 'center' });
      label(c, 'wage ↑', ey[0], ey[1] - 10, C.ink, { size: 11, bold: true, align: 'center' });
      [6, 13, 20].forEach(function (v) { var q = pr(nx(v), -1, -1.08); label(c, v + ' yrs', q[0], q[1] + 2, C.muted, { size: 9.5, align: 'center' }); });
      [0, 18, 36].forEach(function (v) { var q = pr(-1.08, -1, nz(v)); label(c, v + ' yrs', q[0], q[1] + 2, C.muted, { size: 9.5, align: 'center' }); });
      [0, 35, 70].forEach(function (v) { var q = pr(-1, ny(v), -1); label(c, '$' + v, q[0] - 6, q[1], C.muted, { size: 9.5, align: 'right' }); });
      var b = f.full.b; function pl(e, x) { return b[0] + b[1] * e + b[2] * x; }
      // items to depth-sort: points and plane cells
      var items = [];
      if (S.plane) {
        var N = 8;
        for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
          var e0 = lerp(er[0], er[1], i / N), e1 = lerp(er[0], er[1], (i + 1) / N), x0 = lerp(xr[0], xr[1], j / N), x1 = lerp(xr[0], xr[1], (j + 1) / N);
          var q = [P3(e0, x0, pl(e0, x0)), P3(e1, x0, pl(e1, x0)), P3(e1, x1, pl(e1, x1)), P3(e0, x1, pl(e0, x1))];
          items.push({ z: (q[0][2] + q[1][2] + q[2][2] + q[3][2]) / 4, quad: q });
        }
      }
      for (i = 0; i < d.n; i++) {
        var pt = P3(d.E[i], d.X[i], d.Y[i]), fp = P3(d.E[i], d.X[i], pl(d.E[i], d.X[i]));
        items.push({ z: pt[2] - 0.001, pt: pt, fp: fp, above: d.Y[i] >= pl(d.E[i], d.X[i]), col: expCol(d.X[i]) });
      }
      items.sort(function (A, B) { return B.z - A.z; });
      items.forEach(function (it) {
        if (it.quad) {
          var q = it.quad; c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (var k = 1; k < 4; k++) c.lineTo(q[k][0], q[k][1]); c.closePath();
          c.fillStyle = 'rgba(99,230,190,.13)'; c.fill(); c.strokeStyle = 'rgba(99,230,190,.45)'; c.lineWidth = 0.8; c.stroke();
        } else {
          if (S.sticks) { c.strokeStyle = it.above ? 'rgba(99,230,190,.7)' : 'rgba(255,135,135,.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(it.pt[0], it.pt[1]); c.lineTo(it.fp[0], it.fp[1]); c.stroke(); }
          dot(c, it.pt[0], it.pt[1], 3.6 * it.pt[3], it.col, 0.95);
        }
      });
      label(c, 'Drag to turn the cube', 14, 18, C.muted, { size: 11 });
      label(c, 'ŵage = ' + fmt(b[0], 1) + ' + ' + fmt(b[1], 2) + '·school + ' + fmt(b[2], 2) + '·exper', 14, narrow ? 38 : h - 16, C.green, { size: 12, bold: true });
    }
    L.loop(draw, cv);
  })();
  regen();
})(window, document);
