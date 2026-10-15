/* Econometrics, Chapter 11 (Panel Data: Fixed and Random Effects): the interactives on this page. Models in model.js (window.EC11M),
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
  var P = W.EC11M, root = $('ec11-lab');
  if (!root || !L || !ES || !P) return;
  var B1 = P.B1;
  var EST = [['pooled', 'Pooled OLS', C.pink], ['between', 'Between (city means)', C.orange], ['re', 'Random effects', C.violet], ['fe', 'Fixed effects (within)', C.green], ['fd', 'First differences', C.blue]];

  /* =====================================================================================
     1. THE MAIN SIMULATION: cities with hidden baselines; pooled vs within vs first differences
     ===================================================================================== */
  (function () {
    var view = $('ec11-view'), cv = $('ec11-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var S = { p: { N: 8, T: 6, sa: 6, k: 0.9, trend: false }, two: false, seed: 9, d: null, e: null, view: 'raw', from: 'raw', t: 1, lines: false, mc: null, touched: false };
    var el = { pre: $('ec11-pre'), view: $('ec11-viewseg'), read: $('ec11-read'), mcBtn: $('ec11-mc'), say: $('ec11-say'), lines: $('ec11-lines'), trend: $('ec11-trend'), two: $('ec11-two') };
    var rk = range('ec11-k', function (v) { return sgn(v, 2); }, function (v) { S.p.k = v; changed(); });
    var rsa = range('ec11-sa', function (v) { return fmt(v, 1) + ' crimes'; }, function (v) { S.p.sa = v; changed(); });
    var rN = range('ec11-N', function (v) { return v + ' cities'; }, function (v) { S.p.N = v; changed(); });
    var rT = range('ec11-T', function (v) { return v + ' years'; }, function (v) { S.p.T = v; changed(); });
    function changed() { S.touched = true; regen(); }
    function regen() {
      S.d = P.gen(S.p, S.seed); S.e = P.all(S.d, S.two);
      if (S.mc && !S.mc.running) S.mc.stale = JSON.stringify(S.mc.p) !== JSON.stringify(S.p) || S.mc.two !== S.two;
      sync(); judge();
    }
    var PRE = { police: [0.9, 6, 8, 6, false, false], nolink: [0, 6, 8, 6, false, false], two: [0.9, 6, 8, 2, false, false], trend: [0.9, 6, 8, 6, true, false] };
    el.pre.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre];
      S.p.k = q[0]; S.p.sa = q[1]; S.p.N = q[2]; S.p.T = q[3]; S.p.trend = q[4]; S.two = q[5]; rk.set(q[0]); rsa.set(q[1]); rN.set(q[2]); rT.set(q[3]); el.trend.checked = q[4]; el.two.checked = q[5]; changed();
    });
    el.view.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (!b) return; setView(b.dataset.v); });
    function setView(v) { if (v === S.view) return; S.from = S.view; S.view = v; S.t = reduced ? 1 : 0; seg(el.view, 'data-v', v); S.touched = true; judge(); }
    el.lines.addEventListener('change', function () { S.lines = el.lines.checked; S.touched = true; judge(); });
    el.trend.addEventListener('change', function () { S.p.trend = el.trend.checked; changed(); });
    el.two.addEventListener('change', function () { S.two = el.two.checked; changed(); });
    function newPanel() { S.seed = (S.seed * 7919 + 13) % 999983; S.touched = true; regen(); }
    $('ec11-new').addEventListener('click', newPanel); $('ec11-new2').addEventListener('click', newPanel);
    el.mcBtn.addEventListener('click', startMC); $('ec11-mc2').addEventListener('click', startMC);
    $('ec11-reset').addEventListener('click', function () { S.p = { N: 8, T: 6, sa: 6, k: 0.9, trend: false }; S.two = false; rk.set(0.9); rsa.set(6); rN.set(8); rT.set(6); el.trend.checked = false; el.two.checked = false; S.mc = null; setView('raw'); regen(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true, vs = ['raw', 'within', 'fd', 'means'];
      if (k === 'ArrowRight' || k === 'ArrowLeft') setView(vs[(vs.indexOf(S.view) + (k === 'ArrowRight' ? 1 : 3)) % 4]);
      else if (k === 'n' || k === 'N') newPanel(); else if (k === 'm' || k === 'M' || k === 'Enter') startMC(); else used = false;
      if (used) e.preventDefault();
    });
    function startMC() { if (S.mc && S.mc.running) return; S.touched = true; scrollTo(view); S.mc = { p: JSON.parse(JSON.stringify(S.p)), two: S.two, r: { pooled: [], between: [], re: [], fe: [], fd: [] }, hp: [], k: 0, running: true, seed: 7000 + S.seed }; el.mcBtn.disabled = true; el.mcBtn.textContent = 'Running…'; runner(function () { stepMC(); return !!(S.mc && S.mc.running); }); }
    function stepMC() {
      var m = S.mc; if (!m || !m.running) return;
      for (var j = 0, per = reduced ? 500 : Math.max(2, Math.round(1200 / (m.p.N * m.p.T))); j < per && m.k < 500; j++, m.k++) {
        var e = P.all(P.gen(m.p, m.seed + m.k * 3), m.two, true); EST.forEach(function (q) { m.r[q[0]].push(e[q[0]].b); }); m.hp.push(e.haus.p);
      }
      if (m.k >= 500) { m.running = false; m.mean = {}; m.sd = {}; EST.forEach(function (q) { m.mean[q[0]] = ES.mean(m.r[q[0]]); m.sd[q[0]] = ES.sd(m.r[q[0]]); }); var ps = m.hp.filter(isFinite); m.rej = ps.filter(function (v) { return v < 0.05; }).length / Math.max(1, ps.length); el.mcBtn.disabled = false; el.mcBtn.textContent = '▶ Run 500 panels'; judgeMC(m); sync(); }
    }
    var MIS = [
      { id: 'flip', title: 'The sign flips', goal: 'Find a panel where pooled OLS says more police go with more crime, while fixed effects finds the true negative effect.' },
      { id: 'within', title: 'Slide to the origin', goal: 'Switch to the within view and watch each city’s cloud slide to the center.' },
      { id: 'lsdv', title: 'Two roads, one answer', goal: 'With the city lines on, compare the dummy-variable regression with the within estimate: identical.' },
      { id: 'two', title: 'Two years', goal: 'Set the panel to 2 years: fixed effects and first differences agree exactly.' },
      { id: 'haus', title: 'Hausman says FE', goal: 'Get a Hausman test p-value below 0.01: random effects is rejected.' },
      { id: 'nolink', title: 'No hidden link', goal: 'Set the link to 0 and run 500 panels: pooled, random and fixed effects all center on −0.8.' },
      { id: 'trend', title: 'Nationwide trend', goal: 'Add the nationwide trend, see one-way fixed effects go wrong, then fix it with year effects.' }
    ];
    var M = missionKit('ec11-missions', 'ec11', MIS, view, function (id) {
      var q = { flip: [0.3, 3, 8, 6, false, false], within: [0.9, 6, 8, 6, false, false], lsdv: [0.9, 6, 8, 6, false, false], two: [0.9, 6, 8, 5, false, false], haus: [0.2, 6, 8, 6, false, false], nolink: [0.5, 6, 8, 6, false, false], trend: [0.9, 6, 8, 6, false, false] }[id];
      S.p.k = q[0]; S.p.sa = q[1]; S.p.N = q[2]; S.p.T = q[3]; S.p.trend = q[4]; S.two = q[5]; rk.set(q[0]); rsa.set(q[1]); rN.set(q[2]); rT.set(q[3]); el.trend.checked = q[4]; el.two.checked = q[5]; regen();
      L.toast(view, { flip: 'Raise the hidden link and the spread of baselines.', within: 'Press “Within” in the view buttons.', lsdv: 'Tick “Lines for each city” and read the table.', two: 'Slide the years down to 2.', haus: 'A stronger hidden link makes RE and FE disagree.', nolink: 'Slide the hidden link to 0, then run 500 panels.', trend: 'Tick the nationwide trend, then tick year effects.' }[id]);
    });
    function judge() {
      if (!S.touched) return; var e = S.e;
      if (e.pooled.b > 0 && e.fe.b < 0) M.win('flip', 'Pooled OLS: ' + sgn(e.pooled.b, 2) + '. Fixed effects: ' + fmt(e.fe.b, 2) + '. High-crime cities hire more police.');
      if (S.view === 'within') M.win('within', 'Each city minus its own averages: only changes within a city are left.');
      if (S.lines && S.view === 'raw' && Math.abs(e.fe.b - (S.two ? e.w2.b : e.w1.b)) < 1e-9) M.win('lsdv', 'Dummy variables and demeaning both give ' + fmt(e.fe.b, 4) + '. Same estimator, two recipes.');
      if (S.p.T === 2 && Math.abs(e.fe.b - e.fd.b) < 1e-9) M.win('two', 'With two years, FE = FD = ' + fmt(e.fe.b, 4) + ' exactly.');
      if (isFinite(e.haus.p) && e.haus.p < 0.01) M.win('haus', 'Hausman H = ' + fmt(e.haus.H, 1) + ', p ' + (e.haus.p < 0.001 ? '< 0.001' : fmt(e.haus.p, 3)) + ': RE and FE differ too much. Use FE.');
      if (S.p.trend && S.two && Math.abs(e.fe2 - B1) < 0.15 && Math.abs(e.fe1 - B1) > 0.3) M.win('trend', 'One-way FE: ' + fmt(e.fe1, 2) + '. With year effects: ' + fmt(e.fe2, 2) + '. Two-way FE removes shocks common to all cities.');
    }
    function judgeMC(m) {
      if (m.p.k === 0 && !m.p.trend && Math.abs(m.mean.pooled - B1) < 0.1 && Math.abs(m.mean.re - B1) < 0.05 && Math.abs(m.mean.fe - B1) < 0.05) M.win('nolink', 'Means: pooled ' + fmt(m.mean.pooled, 2) + ', RE ' + fmt(m.mean.re, 2) + ', FE ' + fmt(m.mean.fe, 2) + '. Without the link, all are fine; pooled is just noisier.');
    }
    function sync() {
      var e = S.e, m = S.mc;
      seg(el.pre, 'data-pre', Object.keys(PRE).filter(function (k) { var q = PRE[k]; return q[0] === S.p.k && q[1] === S.p.sa && q[2] === S.p.N && q[3] === S.p.T && q[4] === S.p.trend && q[5] === S.two; })[0] || '');
      var rows = EST.map(function (q) { var o = e[q[0]]; return '<tr><th><span class="ec11-sw" style="background:' + q[2] + '"></span>' + q[1] + '</th><td>' + fmt(o.b, 3) + '</td><td>' + fmt(o.se, 3) + '</td>' + (m && !m.running ? '<td>' + fmt(m.mean[q[0]], 2) + '</td>' : '') + '</tr>'; }).join('');
      el.read.innerHTML = '<thead><tr><th>Estimator</th><th>β̂</th><th>se</th>' + (m && !m.running ? '<th>mean of 500</th>' : '') + '</tr></thead><tbody>' + rows +
        '<tr><th>Within, by demeaning</th><td>' + fmt(S.two ? e.w2.b : e.w1.b, 3) + '</td><td></td>' + (m && !m.running ? '<td></td>' : '') + '</tr>' +
        '<tr><th>Hausman test (FE vs RE)</th><td colspan="' + (m && !m.running ? 3 : 2) + '">' + (isFinite(e.haus.H) ? 'H = ' + fmt(e.haus.H, 1) + ', p ' + (e.haus.p < 0.001 ? '&lt; 0.001' : '= ' + fmt(e.haus.p, 3)) : 'not defined') + '</td></tr>' +
        '<tr><th>RE weight θ</th><td colspan="' + (m && !m.running ? 3 : 2) + '">' + fmt(e.re.theta, 3) + '</td></tr></tbody>';
      el.say.textContent = 'Truth −0.80. Pooled OLS ' + fmt(e.pooled.b, 2) + ', fixed effects ' + fmt(e.fe.b, 2) + ', first differences ' + fmt(e.fd.b, 2) + ', random effects ' + fmt(e.re.b, 2) + '.';
    }
    // coordinates of each point in each view
    function pts(v) {
      var d = S.d, e = S.e, out = [];
      if (v === 'raw') for (var i = 0; i < d.n; i++) out.push([d.x[i], d.y[i]]);
      else if (v === 'within') { var W2 = S.two ? e.w2 : e.w1; for (i = 0; i < d.n; i++) out.push([W2.xd[i], W2.yd[i]]); }
      else if (v === 'fd') for (i = 0; i < d.n; i++) out.push(d.t[i] > 0 ? [d.x[i] - d.x[i - 1], d.y[i] - d.y[i - 1]] : [0, 0]);
      else { var xm = e.between.xm, ym = e.between.ym; for (i = 0; i < d.n; i++) out.push([xm[d.id[i]], ym[d.id[i]]]); }
      return out;
    }
    function frameFor(v, box) {
      var q = pts(v), xs = q.map(function (r) { return r[0]; }), ys = q.map(function (r) { return r[1]; }), xr = span(xs, 0.06), yr = span(ys, 0.06);
      if (v === 'within' || v === 'fd') { var mx = Math.max(Math.abs(xr[0]), Math.abs(xr[1])), my = Math.max(Math.abs(yr[0]), Math.abs(yr[1])); xr = [-mx, mx]; yr = [-my, my]; }
      return frame(box[0], box[1], box[2], box[3], xr, yr);
    }
    var VL = { raw: ['police per 10,000 residents', 'crimes per 1,000 residents'], within: ['police minus the city’s average', 'crime minus the city’s average'], fd: ['change in police from last year', 'change in crime from last year'], means: ['city’s average police', 'city’s average crime'] };
    function drawRuler(x, y, w, h) {
      var e = S.e, m = S.mc;
      panelBox(c, x, y, w, h, 'WHO GETS IT RIGHT?');
      var vals = [B1]; EST.forEach(function (q) { vals.push(e[q[0]].b); if (m && !m.running) vals.push(m.mean[q[0]] - 2 * m.sd[q[0]], m.mean[q[0]] + 2 * m.sd[q[0]]); });
      var xr = span(vals.map(function (v) { return clamp(v, -6, 6); }), 0.08), F = frame(x + 12, y + 34, w - 24, h - 74, xr, [0, EST.length]);
      c.strokeStyle = C.grid; c.beginPath(); ES.niceTicks(xr[0], xr[1], 5).ticks.forEach(function (v) { if (v < xr[0] || v > xr[1]) return; c.moveTo(F.X(v), F.y); c.lineTo(F.X(v), F.y + F.h); label(c, fmt(v, 1), F.X(v), F.y + F.h + 9, C.muted, { size: 9.5, align: 'center', plain: true }); }); c.stroke();
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(F.X(0), F.y); c.lineTo(F.X(0), F.y + F.h); c.stroke();
      vline(c, F, B1, C.gold, 2); label(c, 'truth −0.8', F.X(B1), F.y - 8, C.gold, { size: 10, bold: true, align: 'center' });
      var rh = F.h / EST.length;
      EST.forEach(function (q, k) {
        var yy = F.y + rh * k + rh * 0.62, o = e[q[0]];
        label(c, q[1], F.x + 2, F.y + rh * k + 11, q[2], { size: 10.5, bold: true });
        if (m && m.r[q[0]].length > 5) { var cnt = binsOf(m.r[q[0]], xr[0], xr[1], 40), mx = Math.max.apply(null, cnt); var Fh = frame(F.x, F.y + rh * k + 16, F.w, rh - 20, xr, [0, 1]); if (m.stale) c.globalAlpha = 0.35; hist(c, Fh, cnt, xr[0], xr[1], q[2], 0.35, mx); c.globalAlpha = 1; }
        var lo = F.X(clamp(o.b - 1.96 * o.se, xr[0], xr[1])), hi = F.X(clamp(o.b + 1.96 * o.se, xr[0], xr[1]));
        c.strokeStyle = q[2]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(lo, yy); c.lineTo(hi, yy); c.stroke();
        dot(c, F.X(clamp(o.b, xr[0], xr[1])), yy, 5, q[2]); ring(c, F.X(clamp(o.b, xr[0], xr[1])), yy, 5, '#06111a', 1);
      });
      var hs = e.haus, txt = isFinite(hs.H) ? 'Hausman: H = ' + fmt(hs.H, 1) + ', p ' + (hs.p < 0.001 ? '< 0.001' : '= ' + fmt(hs.p, 3)) + (hs.p < 0.05 ? ' → use fixed effects' : ' → RE not rejected') : 'Hausman: not defined here';
      label(c, txt, x + 12, y + h - 12, isFinite(hs.p) && hs.p < 0.05 ? C.green : C.muted, { size: 11, bold: true });
      if (m) label(c, m.running ? 'panels: ' + m.k + ' of 500' : '500 panels' + (m.stale ? ' (old settings)' : ''), x + w - 12, y + 13, m.stale ? C.red : C.muted, { size: 10, align: 'right' });
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, d = S.d, e = S.e; bg(c, w, h); if (M.flash > 0) M.flash -= dt;
      if (S.t < 1) S.t = Math.min(1, S.t + dt * 1.2); var t = ease(S.t), wide = w >= 640;
      var box = wide ? [56, 54, w * 0.58 - 70, h - 106] : [48, 54, w - 62, h * 0.55 - 92];
      var F0 = frameFor(S.from, box), F1 = frameFor(S.view, box), P0 = pts(S.from), P1 = pts(S.view);
      var title = { raw: 'Raw data', within: 'Within: each city minus its own averages', fd: 'First differences: change from last year', means: 'Between: one point per city (its averages)' }[S.view];
      label(c, title, 16, 22, C.gold, { size: wide ? 14 : 12.5, bold: true });
      c.globalAlpha = 1 - t; if (t < 1) axes(c, F0, { xl: VL[S.from][0], yl: VL[S.from][1] });
      c.globalAlpha = t; axes(c, F1, { xl: VL[S.view][0], yl: VL[S.view][1] }); c.globalAlpha = 1;
      F1.clip(c);
      for (var i = 0; i < d.n; i++) {
        if ((S.view === 'fd' || S.from === 'fd') && d.t[i] === 0) { var a0 = S.view === 'fd' ? 1 - t : t; if (a0 < 0.02) continue; }
        var px = lerp(F0.X(P0[i][0]), F1.X(P1[i][0]), t), py = lerp(F0.Y(P0[i][1]), F1.Y(P1[i][1]), t);
        dot(c, px, py, S.view === 'means' ? 6 : 3.6, hue(d.id[i], d.N), S.view === 'means' ? 0.95 : 0.85);
      }
      c.restore();
      c.globalAlpha = t;
      if (S.view === 'raw') {
        if (S.lines) { var xm = e.between.xm, ym = e.between.ym, b = e.fe.b; for (var g = 0; g < d.N; g++) fline(c, F1, function (x) { return ym[g] + b * (x - xm[g]); }, hue(g, d.N), 1.6, null, xm[g] - 4.5, xm[g] + 4.5); }
        fline(c, F1, function (x) { return e.pooled.b0 + e.pooled.b * x; }, C.pink, 3);
      } else if (S.view === 'within') fline(c, F1, function (x) { return (S.two ? e.w2.b : e.w1.b) * x; }, C.green, 3);
      else if (S.view === 'fd') fline(c, F1, function (x) { return e.fd.b * x; }, C.blue, 3);
      else fline(c, F1, function (x) { return e.between.b0 + e.between.b * x; }, C.orange, 3);
      c.globalAlpha = 1;
      var lg = { raw: [[C.pink, 'pooled OLS ' + sgn(e.pooled.b, 2)]].concat(S.lines ? [['#ffffff', 'thin: each city, FE slope ' + fmt(e.fe.b, 2)]] : []), within: [[C.green, 'within slope ' + fmt(e.fe.b, 2)]], fd: [[C.blue, 'FD slope ' + fmt(e.fd.b, 2)]], means: [[C.orange, 'between slope ' + sgn(e.between.b, 2)]] }[S.view];
      legend(c, lg, box[0] + 6, box[1] + 12, 11);
      if (wide) drawRuler(w * 0.58 + 6, 44, w * 0.42 - 18, h - 60); else drawRuler(10, h * 0.55 - 6, w - 20, h * 0.45 - 4);
      if (M.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (M.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    regen();
    L.loop(draw, cv);
  })();

  /* =====================================================================================
     2. CLUSTERED STANDARD ERRORS
     ===================================================================================== */
  (function () {
    var view = $('ec11b-view'), cv = $('ec11b-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, GS = [5, 10, 20, 30, 50, 100], MS = [5, 10, 20, 50];
    var S = { p: { G: 50, m: 20, rx: 0.5, ru: 0.5 }, mc: null, seed: 3, d: null };
    var read = $('ec11b-read'), btn = $('ec11b-run');
    var rG = range('ec11b-G', function (v) { return GS[v] + ' clusters'; }, function (v) { S.p.G = GS[v]; changed(); });
    var rm = range('ec11b-m', function (v) { return MS[v] + ' per cluster'; }, function (v) { S.p.m = MS[v]; changed(); });
    var rx = range('ec11b-rx', function (v) { return fmt(v, 2); }, function (v) { S.p.rx = v; changed(); });
    var ru = range('ec11b-ru', function (v) { return fmt(v, 2); }, function (v) { S.p.ru = v; changed(); });
    var GM = missionKit('ec11b-missions', 'ec11b', [
      { id: 'narrow', title: 'Too narrow', goal: 'Run 1,000 samples where classic 95% intervals cover the truth less than 80% of the time.' },
      { id: 'fix', title: 'Cluster to the rescue', goal: 'In such a run, get clustered intervals to cover at least 93%.' },
      { id: 'few', title: 'Few clusters', goal: 'With 10 or fewer clusters, show that even clustered intervals fall short of 93%.' }
    ], view);
    function changed() { S.d = P.genCl(S.p, S.seed); if (S.mc && !S.mc.running) S.mc.stale = JSON.stringify(S.mc.p) !== JSON.stringify(S.p); sync(); }
    btn.addEventListener('click', function () { if (S.mc && S.mc.running) return; scrollTo(view); var p = JSON.parse(JSON.stringify(S.p)); S.mc = { p: p, k: 0, c: 0, h: 0, cl: 0, last: [], b: [], tc: ES.tInv(0.975, p.G * p.m - 2), tg: ES.tInv(0.975, p.G - 1), running: true, seed: 2e5 + S.seed }; btn.disabled = true; btn.textContent = 'Running…'; runner(function () { step(); return !!(S.mc && S.mc.running); }); });
    function step() {
      var m = S.mc; if (!m || !m.running) return;
      for (var j = 0, per = reduced ? 1000 : Math.max(4, Math.round(30000 / (m.p.G * m.p.m))); j < per && m.k < 1000; j++, m.k++) {
        var f = P.clFit(P.genCl(m.p, m.seed + m.k * 5)), r = { b: f.b, w: [m.tc * f.seC, m.tc * f.seH, m.tg * f.seCl] };
        r.in = r.w.map(function (hw) { return Math.abs(f.b - 0.5) <= hw; }); m.c += r.in[0]; m.h += r.in[1]; m.cl += r.in[2]; m.b.push(f.b); m.last.push(r); if (m.last.length > 30) m.last.shift();
      }
      if (m.k >= 1000) {
        m.running = false; btn.disabled = false; btn.textContent = '▶ Run 1,000 samples';
        var c0 = m.c / 1000, cl = m.cl / 1000;
        if (c0 < 0.8) GM.win('narrow', 'Classic intervals covered only ' + pct(c0) + '. Ignoring the clusters made them far too narrow.');
        if (c0 < 0.8 && cl >= 0.93) GM.win('fix', 'Clustered intervals covered ' + pct(cl) + ' in the same samples.');
        if (m.p.G <= 10 && cl < 0.93 && (m.p.rx > 0 && m.p.ru > 0)) GM.win('few', 'With ' + m.p.G + ' clusters, clustered intervals covered ' + pct(cl) + ': too few clusters to estimate the variance well.');
        sync();
      }
    }
    function sync() {
      var m = S.mc, mf = P.moulton(S.p);
      read.innerHTML = '<dt>Moulton factor 1 + (m − 1)ρₓρᵤ</dt><dd>' + fmt(mf, 2) + '</dd><dt>So classic SEs are too small by about</dt><dd>' + fmt(Math.sqrt(mf), 2) + '×</dd>' +
        (m && !m.running ? '<dt>Coverage: classic</dt><dd class="ec11-pk">' + pct(m.c / 1000) + '</dd><dt>Coverage: robust (HC1)</dt><dd class="ec11-bl">' + pct(m.h / 1000) + '</dd><dt>Coverage: clustered</dt><dd class="ec11-gr">' + pct(m.cl / 1000) + '</dd>' : '');
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, m = S.mc; bg(c, w, h); if (GM.flash > 0) GM.flash -= dt;
      var wide = w >= 640, cols = [['classic', 0, C.pink], ['robust', 1, C.blue], ['clustered', 2, C.green]];
      label(c, wide ? 'The latest 30 samples: 95% intervals for the slope (truth 0.5)' : 'Latest 30 samples: 95% intervals', 16, 22, C.ink, { size: wide ? 13 : 11.5, bold: true });
      var top = 50, lh = wide ? h - 160 : h * 0.62 - 60, half = 0.4;
      if (m && m.k > 50) { var sd = ES.sd(m.b); half = Math.max(4 * sd, 0.05); }
      var cw = (w - 40) / 3;
      cols.forEach(function (q, k) {
        var x0 = 16 + k * (cw + 4), F = frame(x0 + 6, top + 18, cw - 12, lh - 24, [0.5 - half, 0.5 + half], [0, 1]);
        panelBox(c, x0, top, cw, lh, null); label(c, q[0], x0 + cw / 2, top + 10, q[2], { size: 11.5, bold: true, align: 'center' });
        c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.moveTo(F.X(0.5), F.y); c.lineTo(F.X(0.5), F.y + F.h); c.stroke();
        if (m) { F.clip(c); var rows = m.last.slice().reverse(), rh = F.h / 30; rows.forEach(function (r, j) { var yy = F.y + rh * (j + 0.5); c.strokeStyle = r.in[q[1]] ? q[2] : C.red; c.lineWidth = r.in[q[1]] ? 2 : 2.6; c.beginPath(); c.moveTo(F.X(r.b - r.w[q[1]]), yy); c.lineTo(F.X(r.b + r.w[q[1]]), yy); c.stroke(); dot(c, F.X(r.b), yy, 1.8, '#fff'); }); c.restore(); }
      });
      // coverage bars
      var by = top + lh + 26, bw = w - 140, F = frame(110, by, bw, h - by - 34, [0.4, 1], [0, 1]);
      [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].forEach(function (v) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(F.X(v), F.y); c.lineTo(F.X(v), F.y + F.h); c.stroke(); label(c, fmt(100 * v, 0) + '%', F.X(v), F.y + F.h + 9, C.muted, { size: 9.5, align: 'center', plain: true }); });
      c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.moveTo(F.X(0.95), F.y - 3); c.lineTo(F.X(0.95), F.y + F.h); c.stroke();
      var bh = F.h / 3 - 4;
      cols.forEach(function (q, k) {
        var yy = F.y + k * (bh + 4), v = m ? [m.c, m.h, m.cl][k] / Math.max(1, m.k) : NaN;
        label(c, q[0], F.x - 8, yy + bh / 2, q[2], { size: 11, bold: true, align: 'right' });
        if (isFinite(v)) { c.fillStyle = q[2]; c.globalAlpha = m.stale ? 0.35 : 0.85; c.fillRect(F.x, yy, Math.max(0, F.X(clamp(v, 0.4, 1)) - F.x), bh); c.globalAlpha = 1; label(c, pct(v), Math.min(F.X(clamp(v, 0.4, 1)) + 6, F.x + F.w - 36), yy + bh / 2, '#fff', { size: 11, bold: true }); }
      });
      if (!m) label(c, 'Press “Run 1,000 samples”', F.x + F.w / 2, F.y + F.h / 2, C.muted, { size: 12, align: 'center' });
      else label(c, m.running ? 'samples: ' + m.k + ' of 1,000' : '1,000 samples of ' + m.p.G + ' × ' + m.p.m + (m.stale ? ' (old settings)' : ''), w - 16, by - 12, m.stale ? C.red : C.muted, { size: 10.5, align: 'right' });
      if (GM.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (GM.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    changed(); L.loop(draw, cv);
  })();
})(window, document);
