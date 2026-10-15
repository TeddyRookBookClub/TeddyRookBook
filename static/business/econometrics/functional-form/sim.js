/* Econometrics, Chapter 7 (Logs, Dummies and Interactions): the interactives on this page. Models in model.js (window.EC7M),
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
  var P = W.EC7M, root = $('ec7-lab');
  if (!root || !L || !ES || !P) return;
  var FC = { ll: C.blue, lg: C.gold, gl: C.green, gg: C.pink }, FN = { ll: 'Level–level', lg: 'Log–level', gl: 'Level–log', gg: 'Log–log' };
  var FEQ = { ll: 'y = β₀ + β₁x', lg: 'log y = β₀ + β₁x', gl: 'y = β₀ + β₁ log x', gg: 'log y = β₀ + β₁ log x' };
  function wrap(c, text, maxW, size, bold) { var words = text.split(' '), lines = [], cur = ''; for (var i = 0; i < words.length; i++) { var t = cur ? cur + ' ' + words[i] : words[i]; if (textW(c, t, size, bold) > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = t; } if (cur) lines.push(cur); return lines; }
  var money = function (v, d) { return (v < 0 ? '−$' : '$') + fmt(Math.abs(v), d === undefined ? 2 : d); };
  var DS = {
    taxi: { name: 'Taxi fares', xl: 'trip length (miles)', yl: 'fare ($)', xn: 'trip length', xu: 'mile', yn: 'fare', yf: function (v) { return money(v); }, eff: function (v) { return '$' + fmt(v, 2) + ' per mile'; }, effL: 'Price per mile', mw: ['higher', 'lower'] },
    wage: { name: 'Wages', xl: 'years of schooling', yl: 'hourly pay ($)', xn: 'schooling', xu: 'year of school', yn: 'hourly pay', yf: function (v) { return money(v); }, eff: function (v) { return fmt(100 * v, 0) + '% per year (log points)'; }, effL: 'Return to a year of school', mw: ['higher', 'lower'] },
    ads: { name: 'Ad budgets', xl: 'monthly ad spending ($ thousands)', yl: 'monthly sales ($ thousands)', xn: 'ad spending', xu: '$1,000 of ads', yn: 'sales', yf: function (v) { return (v < 0 ? '−$' : '$') + grp(Math.round(Math.abs(v) * 1000)); }, eff: function (v) { return '$' + grp(Math.round(v * 10)) + ' per 1% more ads'; }, effL: 'Sales gained per 1% more ads', mw: ['more', 'less'] },
    demand: { name: 'Coffee demand', xl: 'price per pound ($)', yl: 'pounds sold per week', xn: 'the price', xu: 'dollar of price', yn: 'pounds sold', yf: function (v) { return fmt(v, 1) + ' lb'; }, eff: function (v) { return 'elasticity ' + fmt(v, 2); }, effL: 'Price elasticity of demand', mw: ['more', 'fewer'] },
    mystery: { name: 'Mystery', xl: 'x', yl: 'y', xn: 'x', xu: 'unit of x', yn: 'y', yf: function (v) { return fmt(v, 2); }, eff: function () { return 'hidden'; }, effL: 'Effect size', mw: ['higher', 'lower'] }
  };
  function sentence(form, f, ds) {
    var b = f.b, e = P.effects(form, b), U = DS[ds], more = function (v) { return v >= 0 ? U.mw[0] : U.mw[1]; };
    if (form === 'll') return 'Each extra ' + U.xu + ' goes with ' + U.yf(Math.abs(b)) + ' ' + more(b) + ' ' + U.yn + '.';
    if (form === 'lg') return 'Each extra ' + U.xu + ' goes with about ' + fmt(Math.abs(e.approxPct), 1) + '% ' + more(b) + ' ' + U.yn + ' (exactly ' + fmt(e.exactPct, 1) + '%).';
    if (form === 'gl') return 'A 1% rise in ' + U.xn + ' goes with ' + U.yf(Math.abs(e.perPct)) + ' ' + more(b) + ' ' + U.yn + '; doubling it adds ' + U.yf(e.perDouble) + '.';
    return 'A 1% rise in ' + U.xn + ' goes with ' + fmt(Math.abs(b), 2) + '% ' + more(b) + ' ' + U.yn + ': an elasticity of ' + fmt(b, 2) + '.';
  }

  /* =====================================================================================
     1. THE MAIN SIMULATION: four models, one data set; and the experience profile
     ===================================================================================== */
  (function () {
    var view = $('ec7-view'), cv = $('ec7-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, st = L.store('ec7');
    var S = { mode: 'four', ds: 'taxi', form: 'll', straight: false, resid: false, seed: 5, d: null, f: null, bx: 0, by: 0, touched: false,
      myst: { seed: 101 + Math.floor(Math.random() * 1000), guessed: null, right: st.get('right', 0) },
      peak: 25, xseed: 3, xd: null, xq: null, at: 10, lin: true, drag: false, chips: [] };
    var el = { mode: $('ec7-mode'), data: $('ec7-data'), model: $('ec7-model'), four: $('ec7-four'), xp: $('ec7-xp'), straight: $('ec7-straight'), resid: $('ec7-resid'), read: $('ec7-read'),
      say: $('ec7-say'), guess: $('ec7-guess'), next: $('ec7-nextm'), mrow: $('ec7-mrow'), effL: $('ec7-eff-l'), xread: $('ec7-xread'), lin: $('ec7-lin') };
    var eff = range('ec7-eff', function (v) { return DS[S.ds].eff(v); }, function () { S.touched = true; refit(); });
    var rpeak = range('ec7-peak', function (v) { return 'year ' + fmt(v, 0); }, function (v) { S.peak = v; S.touched = true; refitX(); });
    var rat = range('ec7-at', function (v) { return fmt(v, 1) + ' years'; }, function (v) { S.at = v; S.touched = true; syncX(); judgeX(); });
    function setEffRange() {
      var D = P.SETS[S.ds]; if (!D) { eff.el.disabled = true; return; }
      eff.el.disabled = false; eff.el.min = D.eff[0]; eff.el.max = D.eff[1]; eff.el.step = (D.eff[1] - D.eff[0]) / 100; eff.set(D.eff[2]);
      el.effL.textContent = DS[S.ds].effL;
    }
    function refit() {
      S.d = S.ds === 'mystery' ? P.genMystery(S.myst.seed) : P.genSet(S.ds, eff.get(), S.seed);
      S.f = P.fitAll(S.d); sync(); judge();
    }
    function refitX() { S.xd = P.genExper(S.peak, S.xseed); S.xq = P.fitQuad(S.xd); syncX(); judgeX(); }
    el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-mode]'); if (!b) return; S.mode = b.dataset.mode; seg(el.mode, 'data-mode', S.mode); el.four.hidden = S.mode !== 'four'; el.xp.hidden = S.mode !== 'xp'; S.touched = true; if (S.mode === 'xp') judgeX(); });
    el.data.addEventListener('click', function (e) { var b = e.target.closest('button[data-ds]'); if (!b) return; S.ds = b.dataset.ds; seg(el.data, 'data-ds', S.ds); S.myst.guessed = null; setEffRange(); S.touched = true; refit(); });
    el.model.addEventListener('click', function (e) { var b = e.target.closest('button[data-form]'); if (!b) return; pickForm(b.dataset.form); });
    function pickForm(f) { S.form = f; seg(el.model, 'data-form', f); S.touched = true; sync(); judge(); }
    el.straight.addEventListener('change', function () { S.straight = el.straight.checked; S.touched = true; judge(); });
    el.resid.addEventListener('change', function () { S.resid = el.resid.checked; S.touched = true; judge(); });
    el.lin.addEventListener('change', function () { S.lin = el.lin.checked; });
    $('ec7-new').addEventListener('click', newData); $('ec7-new2').addEventListener('click', newData);
    function newData() { S.touched = true; if (S.mode === 'xp') { S.xseed = (S.xseed * 7919 + 17) % 999983; refitX(); return; } if (S.ds === 'mystery') { S.myst.seed++; S.myst.guessed = null; } else S.seed = (S.seed * 7919 + 13) % 999983; refit(); }
    el.next.addEventListener('click', function () { S.myst.seed++; S.myst.guessed = null; refit(); });
    el.guess.addEventListener('click', function () {
      if (S.myst.guessed) return; S.myst.guessed = S.form; var right = S.form === S.d.form;
      if (right) { S.myst.right++; st.set('right', S.myst.right); }
      L.toast(view, right ? '✓ Right: it was ' + FN[S.d.form] + '. (' + S.myst.right + ' solved)' : '✗ It was ' + FN[S.d.form] + '. Look at its residuals: no pattern.');
      sync(); judge();
    });
    $('ec7-reset').addEventListener('click', function () { S.ds = 'taxi'; S.form = 'll'; S.straight = false; S.resid = false; el.straight.checked = false; el.resid.checked = false; seg(el.data, 'data-ds', 'taxi'); seg(el.model, 'data-form', 'll'); setEffRange(); refit(); S.peak = 25; rpeak.set(25); S.at = 10; rat.set(10); refitX(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true, i = P.FORMS.indexOf(S.form);
      if (S.mode === 'xp' && (k === 'ArrowLeft' || k === 'ArrowRight')) { S.at = clamp(S.at + (k === 'ArrowRight' ? 0.5 : -0.5), 0, 40); rat.set(S.at); syncX(); judgeX(); }
      else if (k === 'ArrowRight' || k === 'ArrowLeft') pickForm(P.FORMS[(i + (k === 'ArrowRight' ? 1 : 3)) % 4]);
      else if (k === 's' || k === 'S') { S.straight = !S.straight; el.straight.checked = S.straight; judge(); }
      else if (k === 'r' || k === 'R') { S.resid = !S.resid; el.resid.checked = S.resid; judge(); }
      else if (k === 'n' || k === 'N') newData(); else used = false;
      if (used) e.preventDefault();
    });
    pointer(cv, function (x, y) {
      if (S.mode === 'four') { for (var i = 0; i < S.chips.length; i++) { var q = S.chips[i]; if (x >= q[0] && x <= q[0] + q[2] && y >= q[1] && y <= q[1] + q[3]) { pickForm(q[4]); return false; } } return false; }
      if (S.xF && S.xF.inside(x, y)) { S.drag = true; S.at = clamp(S.xF.ix(x), 0, 40); rat.set(S.at); S.touched = true; syncX(); return true; } return false;
    }, function (x) { S.at = clamp(S.xF.ix(x), 0, 40); rat.set(S.at); syncX(); }, function () { S.drag = false; judgeX(); });

    /* missions */
    var MIS = [
      { id: 'straight', title: 'Straighten it out', goal: 'Show the coffee-demand data in log–log axes: the curve becomes a straight line.' },
      { id: 'resid', title: 'Read the residuals', goal: 'For the ad budgets, pick the model whose residuals show no pattern, with residuals on.' },
      { id: 'unit', title: 'Unit elastic', goal: 'Set coffee demand so the estimated elasticity is within 0.05 of −1. Then revenue barely changes with price.' },
      { id: 'exact', title: 'When 100·β fibs', goal: 'Make the log–level estimate for wages so big that 100·β̂ and the exact percent differ by 3 points or more.' },
      { id: 'myst', title: 'Mystery solver', goal: 'Identify the true form of 3 mystery data sets.' },
      { id: 'peak', title: 'Find the peak', goal: 'In the experience profile, drag the marker to the turning point (within 1 year).' },
      { id: 'beyond', title: 'Peak beyond the data', goal: 'Make the estimated turning point fall past 40 years, the most experience anyone in the data has.' }
    ];
    var M = missionKit('ec7-missions', 'ec7', MIS, view, function (id) {
      var tips = { straight: 'Choose Coffee demand, then Log–log, then tick “Straighten the axes”.', resid: 'Choose Ad budgets and tick “Show residuals”. Try each model: which leaves a flat band?', unit: 'Choose Coffee demand and slide the elasticity toward −1.',
        exact: 'Choose Wages, then Log–level, and push the return above 20%.', myst: 'Choose Mystery, try models and residuals, then lock in your answer.', peak: 'Switch to “Experience profile” and drag across the chart.', beyond: 'In the experience profile, slide the true peak far to the right.' };
      if (id === 'peak' || id === 'beyond') { S.mode = 'xp'; seg(el.mode, 'data-mode', 'xp'); el.four.hidden = true; el.xp.hidden = false; }
      else { S.mode = 'four'; seg(el.mode, 'data-mode', 'four'); el.four.hidden = false; el.xp.hidden = true; }
      L.toast(view, tips[id]);
    });
    function judge() {
      if (!S.touched || S.mode !== 'four') return; var f = S.f[S.form];
      if (S.ds === 'demand' && S.form === 'gg' && S.straight) M.win('straight', 'A power curve is a straight line in log–log axes. Its slope is the elasticity: ' + fmt(f.b, 2) + '.');
      if (S.ds === 'ads' && S.form === 'gl' && S.resid) M.win('resid', 'Level–log: a flat band of residuals. Each doubling of ads adds the same dollar amount of sales.');
      if (S.ds === 'demand' && Math.abs(S.f.gg.b + 1) <= 0.05) M.win('unit', 'Elasticity ' + fmt(S.f.gg.b, 2) + ': a 1% higher price loses about 1% of sales, so revenue hardly moves.');
      if (S.ds === 'wage' && S.form === 'lg') { var e = P.effects('lg', S.f.lg.b); if (e.exactPct - e.approxPct >= 3) M.win('exact', '100·β̂ = ' + fmt(e.approxPct, 1) + '% but the exact change is ' + fmt(e.exactPct, 1) + '%. Use exp(β̂) − 1 for big effects.'); }
      if (S.myst.right >= 3) M.win('myst', 'Three mysteries solved: shape plus residuals tells you the form.');
    }
    function judgeX() {
      if (!S.touched || S.mode !== 'xp' || !S.xq) return; var tp = S.xq.turn;
      if (isFinite(tp) && tp > 0 && tp < 40 && Math.abs(S.at - tp) <= 1 && !S.drag) M.win('peak', 'At ' + fmt(tp, 1) + ' years the slope β̂₁ + 2β̂₂·exper is zero: wages peak.');
      if (S.xq.b2 < 0 && tp > 40) M.win('beyond', 'The turning point (' + fmt(tp, 0) + ' years) is past every worker in the data, so it is only an extrapolation.');
    }

    function sync() {
      var f = S.f, ds = S.ds, my = ds === 'mystery';
      el.mrow.hidden = !my; el.guess.disabled = !!S.myst.guessed; el.guess.textContent = S.myst.guessed ? 'Answer locked' : 'Lock in: ' + FN[S.form];
      var rows = P.FORMS.map(function (fm) {
        var q = f[fm], on = fm === S.form;
        return '<tr' + (on ? ' class="ec7-on"' : '') + '><th><span class="ec7-sw" style="background:' + FC[fm] + '"></span>' + FN[fm] + '</th><td>' + fmt(q.b, fm === 'lg' ? 4 : 3) + '</td><td>' + fmt(q.r2lev, 3) + '</td></tr>';
      }).join('');
      el.read.innerHTML = '<thead><tr><th>Model</th><th>β̂₁</th><th>R² in levels</th></tr></thead><tbody>' + rows + '</tbody>';
      el.say.innerHTML = '<b>' + FN[S.form] + '</b> (' + FEQ[S.form] + '): ' + sentence(S.form, f[S.form], ds) + (my && S.myst.guessed ? ' <i>The truth was ' + FN[S.d.form] + '.</i>' : '');
    }
    function syncX() {
      var q = S.xq; if (!q) return;
      el.xread.innerHTML = '<dt>β̂₁ (exper)</dt><dd>' + fmt(q.b1, 3) + '</dd><dt>β̂₂ (exper²)</dt><dd>' + fmt(q.b2, 4) + '</dd>' +
        '<dt>Turning point −β̂₁/(2β̂₂)</dt><dd>' + (q.b2 < 0 ? fmt(q.turn, 1) + ' years' : 'none (U-shape)') + '</dd>' +
        '<dt>Extra year at ' + fmt(S.at, 1) + ' years</dt><dd>' + sgn(q.slopeAt(S.at), 2).replace(/^([+−]?)/, '$1$') + '/hr</dd>' +
        '<dt>Straight-line slope</dt><dd>$' + fmt(q.lin.b[1], 3) + '/hr</dd>';
    }

    /* drawing: four models */
    function mapper(lo, hi, p0, p1, blend) {
      var llo = Math.log(lo), lhi = Math.log(hi);
      return function (v) { var a = (v - lo) / (hi - lo), b = (Math.log(Math.max(v, 1e-9)) - llo) / (lhi - llo); return p0 + (p1 - p0) * lerp(a, b, blend); };
    }
    function logTicks(lo, hi) { var out = [], ms = hi / lo < 12 ? [1, 1.5, 2, 3, 4, 5, 6, 8] : hi / lo < 40 ? [1, 2, 3, 5] : [1, 2, 5]; for (var e = Math.floor(Math.log10(lo)) - 1; e <= Math.ceil(Math.log10(hi)); e++) ms.forEach(function (m) { var v = m * Math.pow(10, e); if (v >= lo * 0.999 && v <= hi * 1.001) out.push(v); }); return out; }
    function tickFmt(v) { return v >= 1000 ? grp(Math.round(v)) : v >= 10 ? fmt(v, 0) : v >= 1 ? fmt(v, v % 1 ? 1 : 0) : fmt(v, 2); }
    function drawFour(dt) {
      var w = G.w, h = G.h, d = S.d, f = S.f, my = S.ds === 'mystery';
      var tbx = S.straight && P.logX(S.form) ? 1 : 0, tby = S.straight && P.logY(S.form) ? 1 : 0, k = reduced ? 1 : Math.min(1, dt * 3);
      S.bx += (tbx - S.bx) * k; S.by += (tby - S.by) * k;
      // chips
      var cx = 12, cy = 10, ch = 28; S.chips = [];
      P.FORMS.forEach(function (fm) {
        var t = FN[fm], tw = textW(c, t, 12, true) + 30, on = fm === S.form;
        if (cx + tw > w - (cy < 40 ? 100 : 12)) { cx = 12; cy += ch + 6; }
        c.fillStyle = on ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.04)'; rrect(c, cx, cy, tw, ch, 14); c.fill(); c.strokeStyle = on ? FC[fm] : 'rgba(120,170,200,.25)'; c.lineWidth = on ? 2 : 1; c.stroke();
        c.fillStyle = FC[fm]; c.fillRect(cx + 9, cy + ch / 2 - 1.5, 12, 3);
        label(c, t, cx + 25, cy + ch / 2, on ? '#fff' : C.ink, { size: 12, bold: on, plain: true });
        S.chips.push([cx, cy, tw, ch, fm]); cx += tw + 6;
      });
      var top = cy + ch + 34, plotBot = S.resid ? h * 0.66 : h - 44;
      var xs = d.x, ys = d.y, xlo = Math.min.apply(null, xs), xhi = Math.max.apply(null, xs), ylo = Math.min.apply(null, ys), yhi = Math.max.apply(null, ys);
      var xpad = (xhi - xlo) * 0.04, ypad = (yhi - ylo) * 0.06; xlo = Math.max(xlo - xpad, xlo * 0.85); xhi += xpad; ylo = Math.max(ylo - ypad, ylo * 0.8); yhi += ypad;
      var X0 = 58, X1 = w - 18, mx = mapper(xlo, xhi, X0, X1, S.bx), myp = mapper(ylo, yhi, plotBot, top, S.by);
      // grid and ticks
      c.strokeStyle = 'rgba(120,170,200,.35)'; c.lineWidth = 1; c.strokeRect(X0 + 0.5, top + 0.5, X1 - X0 - 1, plotBot - top - 1);
      var xt = S.bx > 0.5 ? logTicks(xlo, xhi) : ES.niceTicks(xlo, xhi, 6).ticks, yt = S.by > 0.5 ? logTicks(ylo, yhi) : ES.niceTicks(ylo, yhi, 5).ticks;
      c.strokeStyle = C.grid; c.beginPath();
      xt.forEach(function (v) { if (v < xlo || v > xhi) return; var px = Math.round(mx(v)) + 0.5; c.moveTo(px, top); c.lineTo(px, plotBot); label(c, tickFmt(v), px, plotBot + 9, C.muted, { size: 10, align: 'center', plain: true }); });
      yt.forEach(function (v) { if (v < ylo || v > yhi) return; var py = Math.round(myp(v)) + 0.5; c.moveTo(X0, py); c.lineTo(X1, py); label(c, tickFmt(v), X0 - 5, py, C.muted, { size: 10, align: 'right', plain: true }); });
      c.stroke();
      label(c, DS[S.ds].xl + (S.bx > 0.5 ? ' (log scale)' : ''), X1, plotBot + 22, C.muted, { size: 11, align: 'right', plain: true });
      label(c, DS[S.ds].yl + (S.by > 0.5 ? ' (log scale)' : ''), X0 + 2, top - 9, C.muted, { size: 11, plain: true });
      c.save(); c.beginPath(); c.rect(X0, top, X1 - X0, plotBot - top); c.clip();
      for (var i = 0; i < d.x.length; i++) dot(c, mx(d.x[i]), myp(d.y[i]), 3.3, '#a5d8ff', 0.75);
      function curve(fn, col, lw, dash, alpha) {
        c.globalAlpha = alpha; c.strokeStyle = col; c.lineWidth = lw; if (dash) c.setLineDash(dash); c.beginPath();
        for (var j = 0; j <= 120; j++) { var t = j / 120, xv = Math.exp(lerp(Math.log(xlo), Math.log(xhi), t)) * S.bx + lerp(xlo, xhi, t) * (1 - S.bx), yv = fn(xv); if (!isFinite(yv)) continue; var py = myp(clamp(yv, ylo * 0.2, yhi * 3)); if (j) c.lineTo(mx(xv), py); else c.moveTo(mx(xv), py); }
        c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
      }
      P.FORMS.forEach(function (fm) { if (fm !== S.form) curve(f[fm].pred, FC[fm], 1.5, null, 0.45); });
      if (!my || S.myst.guessed) { var D = P.SETS[S.ds], e = d.eff, tr = my ? null : function (x) { return D.truth(x, e); }; if (my) tr = mysteryTruth(d); curve(tr, '#ffffff', 1.5, [3, 4], 0.7); }
      curve(f[S.form].pred, FC[S.form], 3.2, null, 1);
      c.restore();
      // interpretation banner
      var txt = sentence(S.form, f[S.form], S.ds), lines = wrap(c, txt, Math.min(560, X1 - X0 - 24), 12.5, false), bw = 0;
      lines.forEach(function (ln) { bw = Math.max(bw, textW(c, ln, 12.5)); });
      c.fillStyle = 'rgba(6,17,26,.82)'; rrect(c, X0 + 6, top + 6, bw + 20, lines.length * 17 + 12, 8); c.fill(); c.strokeStyle = FC[S.form]; c.lineWidth = 1; c.stroke();
      lines.forEach(function (ln, j) { label(c, ln, X0 + 16, top + 18 + j * 17, '#fff', { size: 12.5, plain: true }); });
      if (!my || S.myst.guessed) label(c, 'white dashes: the true curve', X1 - 6, plotBot - 12, C.muted, { size: 10.5, align: 'right' });
      else label(c, 'Mystery: which model made these data?', X1 - 6, plotBot - 12, C.gold, { size: 11.5, bold: true, align: 'right' });
      // residual strip
      if (S.resid) {
        var r = f[S.form].resid, rlo = Math.min.apply(null, r), rhi = Math.max.apply(null, r), rm = Math.max(Math.abs(rlo), Math.abs(rhi)) * 1.1, R0 = h * 0.66 + 36, R1 = h - 30;
        var ry = function (v) { return lerp(R1, R0, (v + rm) / (2 * rm)); };
        c.strokeStyle = 'rgba(120,170,200,.35)'; c.strokeRect(X0 + 0.5, R0 + 0.5, X1 - X0 - 1, R1 - R0 - 1);
        c.strokeStyle = C.line; c.beginPath(); c.moveTo(X0, ry(0)); c.lineTo(X1, ry(0)); c.stroke();
        label(c, 'residuals of the ' + FN[S.form].toLowerCase() + ' model' + (P.logY(S.form) ? ' (in log points)' : ''), X0 + 2, R0 - 9, FC[S.form], { size: 11, bold: true, plain: true });
        for (i = 0; i < d.x.length; i++) dot(c, mx(d.x[i]), ry(r[i]), 2.6, FC[S.form], 0.6);
        var bm = P.binMeans(d.x, r, 8); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); bm.forEach(function (q, j) { if (j) c.lineTo(mx(q[0]), ry(q[1])); else c.moveTo(mx(q[0]), ry(q[1])); }); c.stroke();
        label(c, 'white line: average residual by x (flat = no pattern)', X1 - 4, R1 - 10, C.muted, { size: 10, align: 'right' });
      }
    }
    function mysteryTruth(d) {
      var a = d.eff;
      return { ll: function (x) { return 30 + a * x; }, lg: function (x) { return 20 * Math.exp(a * (x - 10)); }, gl: function (x) { return 40 + a * Math.log(x); }, gg: function (x) { return 30 * Math.pow(x / 5, a); } }[d.form];
    }
    /* drawing: experience profile */
    function drawXP() {
      var w = G.w, h = G.h, d = S.xd, q = S.xq;
      var F = frame(56, 50, w - 76, h - 104, [0, 40], span(d.w, 0.05)); S.xF = F;
      axes(c, F, { xl: 'years of experience', yl: 'hourly wage ($)' });
      label(c, 'The experience profile: wage = β₀ + β₁·exper + β₂·exper² + u', 14, 20, C.ink, { size: 13, bold: true });
      F.clip(c); for (var i = 0; i < d.e.length; i++) dot(c, F.X(d.e[i]), F.Y(d.w[i]), 3.2, '#a5d8ff', 0.7); c.restore();
      if (S.lin) fline(c, F, function (x) { return q.lin.b[0] + q.lin.b[1] * x; }, C.pink, 2, [6, 5]);
      fline(c, F, function (x) { return 14 + d.G * (2 * x / d.P - x * x / (d.P * d.P)); }, '#ffffff', 1.4, [3, 4]);
      fline(c, F, q.at, C.green, 3.2);
      if (q.b2 < 0 && isFinite(q.turn)) {
        if (q.turn <= 40) { vline(c, F, q.turn, C.gold, 1.5, [5, 4]); label(c, 'peak ' + fmt(q.turn, 1) + ' yrs', F.X(q.turn), F.y + 12, C.gold, { size: 11, bold: true, align: 'center' }); }
        else label(c, 'turning point at ' + fmt(q.turn, 0) + ' yrs: off the chart →', F.x + F.w - 6, F.y + 12, C.gold, { size: 11, bold: true, align: 'right' });
      }
      // marker and tangent
      var x0 = S.at, y0 = q.at(x0), m = q.slopeAt(x0), dx = 6;
      F.clip(c); c.strokeStyle = C.blue; c.lineWidth = 2.5; c.beginPath(); c.moveTo(F.X(x0 - dx), F.Y(y0 - m * dx)); c.lineTo(F.X(x0 + dx), F.Y(y0 + m * dx)); c.stroke(); c.restore();
      ring(c, F.X(x0), F.Y(y0), 8, '#fff', 2); dot(c, F.X(x0), F.Y(y0), 5, C.blue);
      label(c, 'at ' + fmt(x0, 1) + ' yrs, one more year: ' + (m >= 0 ? '+' : '−') + '$' + fmt(Math.abs(m), 2) + '/hr', clamp(F.X(x0), F.x + 90, F.x + F.w - 90), F.Y(y0) - 22, C.blue, { size: 12, bold: true, align: 'center' });
      legend(c, w > 560 ? [[C.green, 'quadratic fit'], [C.pink, 'straight line', true], ['#ffffff', 'truth', true], [C.blue, 'slope β̂₁ + 2β̂₂·exper']] : [[C.green, 'quadratic'], [C.pink, 'line', true], [C.blue, 'slope']], 14, h - 16);
    }
    function draw(dt) {
      G.fit(); bg(c, G.w, G.h); if (M.flash > 0) M.flash -= dt;
      if (S.mode === 'four') drawFour(dt); else drawXP();
      if (M.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (M.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, G.w - 4, G.h - 4, 14); c.stroke(); }
    }
    setEffRange(); refit(); refitX();
    L.loop(draw, cv);
  })();

  /* =====================================================================================
     2. DUMMIES AND INTERACTIONS
     ===================================================================================== */
  (function () {
    var view = $('ec7b-view'), cv = $('ec7b-cv'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var S = { model: 'inter', trap: false, seed: 11, d: null, f: null, touched: false };
    var el = { model: $('ec7b-model'), read: $('ec7b-read'), say: $('ec7b-say'), trap: $('ec7b-trap') };
    var r0 = range('ec7b-d0', function (v) { return sgn(v, 1).replace(/^([+−]?)/, '$1$'); }, function () { S.touched = true; refit(); });
    var r1 = range('ec7b-d1', function (v) { return sgn(v, 2).replace(/^([+−]?)/, '$1$') + ' per year'; }, function () { S.touched = true; refit(); });
    el.model.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; S.model = b.dataset.m; seg(el.model, 'data-m', S.model); S.touched = true; sync(); judge(); });
    el.trap.addEventListener('click', function () { S.trap = !S.trap; el.trap.setAttribute('aria-pressed', String(S.trap)); S.touched = true; refit(); });
    $('ec7b-new').addEventListener('click', function () { S.seed = (S.seed * 7919 + 13) % 999983; S.touched = true; refit(); });
    var GM = missionKit('ec7b-missions', 'ec7b', [
      { id: 'trap', title: 'Fall into the trap', goal: 'Add a nonunion dummy next to the union dummy and the intercept.' },
      { id: 'cross', title: 'Lines that cross', goal: 'With the interaction model, make the two fitted lines cross between 0 and 30 years.' },
      { id: 'same', title: 'One line is enough', goal: 'Set both true gaps to zero; the Chow test should not reject (p above 0.10).' }
    ], view);
    function refit() { S.d = P.genUnion(r0.get(), r1.get(), S.seed); S.f = P.fitUnion(S.d, S.trap); sync(); judge(); }
    function judge() {
      if (!S.touched) return; var f = S.f;
      if (S.trap) GM.win('trap', 'The two dummies add up to the intercept column: perfect multicollinearity.');
      if (S.model === 'inter' && !S.trap && f.cross > 0 && f.cross < 30) GM.win('cross', 'The lines cross at ' + fmt(f.cross, 1) + ' years: the union premium changes sign there.');
      if (r0.get() === 0 && r1.get() === 0 && f.chowP > 0.1) GM.win('same', 'Chow p = ' + fmt(f.chowP, 2) + ': no evidence the groups need separate lines.');
    }
    function sync() {
      var f = S.f, b;
      if (S.trap) { el.read.innerHTML = '<tbody><tr><td colspan="3">Perfect multicollinearity: OLS can’t estimate this model.</td></tr></tbody>'; el.say.textContent = 'union + nonunion = 1 for every worker, which is exactly the intercept column. Drop one of the three.'; return; }
      var rows = [];
      if (S.model === 'pooled') { b = f.pooled; rows = [['intercept', b.b[0], b.se[0]], ['exper', b.b[1], b.se[1]]]; }
      else if (S.model === 'dummy') { b = f.dummy; rows = [['intercept', b.b[0], b.se[0]], ['exper', b.b[1], b.se[1]], ['union (δ₀)', b.b[2], b.se[2]]]; }
      else { b = f.inter; rows = [['intercept', b.b[0], b.se[0]], ['exper', b.b[1], b.se[1]], ['union (δ₀)', b.b[2], b.se[2]], ['union × exper (δ₁)', b.b[3], b.se[3]]]; }
      el.read.innerHTML = '<thead><tr><th>Variable</th><th>Estimate</th><th>Std. error</th></tr></thead><tbody>' + rows.map(function (q) { return '<tr><th>' + q[0] + '</th><td>' + fmt(q[1], 3) + '</td><td>' + fmt(q[2], 3) + '</td></tr>'; }).join('') +
        '<tr><th>R²</th><td>' + fmt(b.r2, 3) + '</td><td></td></tr><tr><th>Chow test F (2, ' + (S.d.n - 4) + ')</th><td>' + fmt(f.chow, 2) + '</td><td>p ' + (f.chowP < 0.001 ? '&lt; 0.001' : '= ' + fmt(f.chowP, 3)) + '</td></tr></tbody>';
      if (S.model === 'pooled') el.say.textContent = 'One line for everyone: the model assumes union membership makes no difference at all.';
      else if (S.model === 'dummy') el.say.textContent = 'Parallel lines: union members earn ' + money(b.b[2]) + ' more (or less, if negative) at every level of experience. The dummy shifts the intercept only.';
      else el.say.textContent = 'Separate slopes: at zero experience union members earn ' + money(b.b[2]) + ' more; each year of experience is worth ' + money(b.b[3], 3) + ' more for them than the nonunion slope of ' + money(b.b[1], 3) + '.';
    }
    function draw(dt) {
      G.fit(); var w = G.w, h = G.h, d = S.d, f = S.f; bg(c, w, h); if (GM.flash > 0) GM.flash -= dt;
      var F = frame(54, 44, w - 72, h - 96, [0, 30], span(d.w, 0.05));
      axes(c, F, { xl: 'years of experience', yl: 'hourly wage ($)' });
      F.clip(c); for (var i = 0; i < d.n; i++) dot(c, F.X(d.e[i]), F.Y(d.w[i]), 3.4, d.g[i] ? C.gold : C.blue, 0.75); c.restore();
      if (S.trap) {
        c.fillStyle = 'rgba(6,17,26,.82)'; rrect(c, F.x + 20, F.y + F.h / 2 - 56, F.w - 40, 112, 12); c.fill(); c.strokeStyle = C.red; c.lineWidth = 2; c.stroke();
        var ls = wrap(c, 'Perfect multicollinearity! union + nonunion = 1 for every worker, the same as the intercept column. There are infinitely many ways to split the effect, so OLS has no answer. (' + (f.trapErr || '') + ')', F.w - 80, 13, false);
        label(c, '⚠ The dummy-variable trap', F.x + 40, F.y + F.h / 2 - 34, C.red, { size: 15, bold: true, plain: true });
        ls.slice(0, 4).forEach(function (t, j) { label(c, t, F.x + 40, F.y + F.h / 2 - 8 + j * 17, C.ink, { size: 13, plain: true }); });
      } else {
        var lines;
        if (S.model === 'pooled') lines = [[f.pooled.b[0], f.pooled.b[1], C.violet]];
        else if (S.model === 'dummy') lines = [[f.dummy.b[0], f.dummy.b[1], C.blue], [f.dummy.b[0] + f.dummy.b[2], f.dummy.b[1], C.gold]];
        else lines = [[f.inter.b[0], f.inter.b[1], C.blue], [f.inter.b[0] + f.inter.b[2], f.inter.b[1] + f.inter.b[3], C.gold]];
        lines.forEach(function (q) { fline(c, F, function (x) { return q[0] + q[1] * x; }, q[2], 3); });
        if (lines.length === 2) [0, 25].forEach(function (x0) {
          var a = lines[0][0] + lines[0][1] * x0, b2 = lines[1][0] + lines[1][1] * x0, px = F.X(x0) + (x0 ? 0 : 14);
          arrow(c, px, F.Y(a), px, F.Y(b2), '#fff', 1.5, 5);
          label(c, (b2 - a >= 0 ? '+' : '−') + '$' + fmt(Math.abs(b2 - a), 2), px + 7, F.Y((a + b2) / 2), '#fff', { size: 11, bold: true });
        });
      }
      legend(c, [[C.gold, 'union members'], [C.blue, 'not in a union']].concat(S.model === 'pooled' && !S.trap ? [[C.violet, 'one pooled line']] : []), 14, h - 16);
      label(c, (w < 500 ? '' : 'wage = ') + (S.model === 'pooled' ? 'β₀ + β₁·exper' : S.model === 'dummy' ? 'β₀ + β₁·exper + δ₀·union' : 'β₀ + β₁·exper + δ₀·union + δ₁·union·exper'), 14, 20, C.ink, { size: w < 500 ? 11.5 : 12.5, bold: true });
      if (GM.flash > 0) { c.strokeStyle = 'rgba(99,230,190,' + (GM.flash / 1.2 * 0.8) + ')'; c.lineWidth = 4; rrect(c, 2, 2, w - 4, h - 4, 14); c.stroke(); }
    }
    refit(); L.loop(draw, cv);
  })();
})(window, document);
