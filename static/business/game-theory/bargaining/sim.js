/* Game Theory, Chapter 11: Bargaining. Two interactive pieces:
   1. alternating offers against a bot with its own patience (main simulation, with missions),
   2. the Nash bargaining solution drawn on the set of possible deals.
   The models are in model.js (window.GT11M), tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, M = W.GT11M, root = D.getElementById('gt11-lab');
  if (!root || !L || !M) return;
  /* ---------- drawing and UI helpers (the same in every Game Theory chapter from 8 on) ---------- */
  var fmt = L.fmt, reduced = L.reduced;
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', orange: '#ffa94d',
    ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', grid: 'rgba(120,170,200,.10)', panel: 'rgba(11,27,39,.92)', bg: '#06111a' };
  var FONT = 'system-ui,-apple-system,"Segoe UI",sans-serif', MONO = 'ui-monospace,Menlo,Consolas,monospace';
  function $(id) { return D.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function grp(v, d) { var s = fmt(v, d || 0), neg = s.charAt(0) === '−'; if (neg) s = s.slice(1); var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '−' : '') + p.join('.'); }
  function money(v, d) { var s = grp(Math.abs(v), d || 0); return (v < 0 && +Math.abs(v).toFixed(d || 0) !== 0 ? '−$' : '$') + s; }
  function pct(v, d) { return fmt(100 * v, d === undefined ? 0 : d) + '%'; }
  function label(c, text, x, y, col, o) {
    o = o || {};
    c.save(); c.font = (o.bold ? '600 ' : '') + (o.size || 12) + 'px ' + (o.mono ? MONO : FONT);
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (o.max) { var tw = c.measureText(text).width; if (tw > o.max) { var sc = o.max / tw; c.font = (o.bold ? '600 ' : '') + Math.max(8, (o.size || 12) * sc) + 'px ' + (o.mono ? MONO : FONT); } }
    if (!o.plain) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(6,17,26,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = col; c.fillText(text, x, y); c.restore();
  }
  function textW(c, text, size, bold) { c.save(); c.font = (bold ? '600 ' : '') + (size || 12) + 'px ' + FONT; var w = c.measureText(text).width; c.restore(); return w; }
  function rrect(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function bg(c, w, h) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1c2a'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  function panelBox(c, x, y, w, h, title, col) {
    c.fillStyle = 'rgba(255,255,255,.035)'; c.strokeStyle = 'rgba(120,170,200,.16)'; c.lineWidth = 1; rrect(c, x, y, w, h, 10); c.fill(); c.stroke();
    if (title) label(c, title, x + 10, y + 13, col || C.muted, { size: 10.5, bold: true, max: w - 20 });
  }
  function dot(c, x, y, r, col, o) {
    o = o || {}; c.save(); if (o.glow) { c.shadowColor = col; c.shadowBlur = o.glow; }
    c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fillStyle = col; c.fill();
    if (o.ring) { c.shadowBlur = 0; c.lineWidth = o.lw || 2; c.strokeStyle = o.ring; c.stroke(); }
    c.restore();
  }
  function line(c, pts, col, lw, dash) {
    if (pts.length < 2) return; c.save(); c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.lineCap = 'round'; if (dash) c.setLineDash(dash);
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); c.restore();
  }
  function arrow(c, x, y, x2, y2, col, o) {
    o = o || {}; var dx = x2 - x, dy = y2 - y, len = Math.hypot(dx, dy); if (len < 2) return;
    var ux = dx / len, uy = dy / len, hw = o.head || 6, lw = o.width || 2;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2 - ux * hw * 1.2, y2 - uy * hw * 1.2); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - ux * hw * 1.9 - uy * hw * 0.8, y2 - uy * hw * 1.9 + ux * hw * 0.8); c.lineTo(x2 - ux * hw * 1.9 + uy * hw * 0.8, y2 - uy * hw * 1.9 - ux * hw * 0.8); c.closePath(); c.fill(); c.restore();
  }
  /* a plot area: box {x,y,w,h}, ranges [lo,hi]; draws grid, axes, ticks and titles; returns {X, Y, ix, iy} */
  function plot(c, b, xr, yr, o) {
    o = o || {};
    var X = function (v) { return b.x + (v - xr[0]) / (xr[1] - xr[0]) * b.w; }, Y = function (v) { return b.y + b.h - (v - yr[0]) / (yr[1] - yr[0]) * b.h; };
    var ix = function (px) { return xr[0] + (px - b.x) / b.w * (xr[1] - xr[0]); }, iy = function (py) { return yr[0] + (b.y + b.h - py) / b.h * (yr[1] - yr[0]); };
    c.save(); c.lineWidth = 1;
    var xt = o.xt || nice(xr, o.nx || 5), yt = o.yt || nice(yr, o.ny || 4);
    c.strokeStyle = C.grid; c.beginPath();
    xt.forEach(function (t) { c.moveTo(X(t), b.y); c.lineTo(X(t), b.y + b.h); }); yt.forEach(function (t) { c.moveTo(b.x, Y(t)); c.lineTo(b.x + b.w, Y(t)); }); c.stroke();
    c.strokeStyle = 'rgba(143,179,198,.55)'; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x, b.y + b.h); c.lineTo(b.x + b.w, b.y + b.h); c.stroke(); c.restore();
    var df = function (t) { return fmt(t, Math.abs(t - Math.round(t)) > 1e-9 ? (Math.abs(t * 10 - Math.round(t * 10)) > 1e-9 ? 2 : 1) : 0); }, xf = o.xf || df, yf = o.yf || df;
    if (!o.noXLabels) xt.forEach(function (t) { label(c, xf(t), X(t), b.y + b.h + 9, C.muted, { size: 10, align: 'center', plain: true }); });
    if (!o.noYLabels) yt.forEach(function (t) { label(c, yf(t), b.x - 5, Y(t), C.muted, { size: 10, align: 'right', plain: true }); });
    if (o.xl) label(c, o.xl, b.x + b.w - 2, b.y + b.h - 9, C.muted, { size: 10.5, align: 'right' });
    if (o.yl) label(c, o.yl, b.x + 2, b.y - 9, C.muted, { size: 10.5, plain: true });
    return { X: X, Y: Y, ix: ix, iy: iy, b: b };
  }
  function nice(r, n) {
    var span = r[1] - r[0], raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag, st = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag, out = [];
    for (var t = Math.ceil(r[0] / st - 1e-9) * st; t <= r[1] + st * 1e-6; t += st) out.push(+t.toFixed(10));
    return out;
  }
  function seg(groupEl, attr, val) { groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val))); }); }
  function readout(dl, rows) { dl.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd' + (r[2] ? ' style="color:' + r[2] + '"' : '') + '>' + r[1] + '</dd>'; }).join(''); }
  /* pointer dragging on a canvas: pick(x,y) returns a target or null; move(target,x,y); up(target) */
  function drag(cv, pick, move, up, hover) {
    var cur = null, id = null;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { var p = pos(e); cur = pick(p[0], p[1], e); if (cur === null || cur === undefined) return; id = e.pointerId; try { cv.setPointerCapture(id); } catch (er) { } e.preventDefault(); move(cur, p[0], p[1], e); });
    cv.addEventListener('pointermove', function (e) { var p = pos(e); if (cur !== null && cur !== undefined && e.pointerId === id) { move(cur, p[0], p[1], e); e.preventDefault(); } else if (hover) hover(p[0], p[1]); });
    function end(e) { if (cur !== null && cur !== undefined && e.pointerId === id) { var t = cur; cur = null; if (up) up(t); } }
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  }
  function celebrate(view, text) { L.toast(view, text); if (!reduced) { view.classList.remove('gt11-win'); void view.offsetWidth; view.classList.add('gt11-win'); } }
  /* seeded random numbers, so a "new round" button can be replayed in tests */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }


  var BOTS = { hal: { name: 'Hasty Hal', d: 0.6, col: '#ff8787' }, sam: { name: 'Steady Sam', d: 0.9, col: '#74c0fc' }, pat: { name: 'Patient Pat', d: 0.97, col: '#b197fc' } };

  /* =====================================================================================
     1. ALTERNATING OFFERS
     ===================================================================================== */
  (function () {
    var view = $('gt11-view'), cv = $('gt11-cv'), hud = $('gt11-hud'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var el = { bot: $('gt11-bot'), d1: $('gt11-d1'), d1O: $('gt11-d1-o'), first: $('gt11-first'), T: $('gt11-T'), keep: $('gt11-keep'), keepO: $('gt11-keep-o'), keepRow: $('gt11-keep-row'),
      act: $('gt11-act'), rej: $('gt11-rej'), read: $('gt11-read'), reset: $('gt11-reset') };
    var P = { bot: 'sam', d1: 0.9, d2: 0.9, first: 1, T: Infinity }, S = { t: 1, phase: 'you', hist: [], keep: 0.6, botOffer: 0, result: null, wait: 0, hudTxt: '', pieAng: 0.6, pie: null };
    function newGame() { S.t = 1; S.hist = []; S.result = null; S.wait = 0; S.phase = P.first === 1 ? 'you' : 'botwait'; if (S.phase === 'botwait') S.wait = 0.6; sync(); }
    function spe1() { return M.proposerShare(S.t, P.T, P.d1, P.d2, P.first); }
    function botPropose() { var x = M.proposerShare(S.t, P.T, P.d1, P.d2, P.first); S.botOffer = 1 - x; S.phase = 'botoffer'; S.hist.push({ t: S.t, prop: 2, you: S.botOffer, state: 'open', note: BOTS[P.bot].name.split(' ')[1] + ' offers you ' + pct(S.botOffer, 1) + (isFinite(P.T) && S.t === P.T ? ' (last round: take it or get nothing)' : ' (what you’d get by waiting, worth ' + pct(S.botOffer, 1) + ' today)') }); sync(); }
    function end(youShare, agreed) {
      S.phase = 'over'; var pay = agreed ? youShare * Math.pow(P.d1, S.t - 1) * 100 : 0, bp = agreed ? (1 - youShare) * Math.pow(P.d2, S.t - 1) * 100 : 0;
      S.result = { agreed: agreed, you: youShare, round: S.t, pay: pay, bp: bp }; check(); sync();
    }
    function offer() {
      if (S.phase !== 'you') return;
      var res = M.reservation(S.t, P.T, P.d1, P.d2, P.first), give = 1 - S.keep, ok = give >= res - 0.0005, bn = BOTS[P.bot].name.split(' ')[1];
      var why = isFinite(P.T) && S.t >= P.T ? 'Last round, so anything beats nothing.' : 'Waiting a round gets me ' + pct(res, 1) + ' in today’s money.';
      S.hist.push({ t: S.t, prop: 1, you: S.keep, state: ok ? 'yes' : 'no', note: 'You keep ' + pct(S.keep, 1) + '. ' + bn + ': ' + (ok ? '“Deal.” ' : '“No.” ') + why });
      if (ok) end(S.keep, true);
      else { if (mis.done('rejected')) celebrate(view, '✓ Rejected! ' + bn + ' would rather wait and propose.'); if (isFinite(P.T) && S.t >= P.T) end(0, false); else { S.t++; S.phase = 'botwait'; S.wait = 0.9; sync(); } }
    }
    function respond(yes) {
      if (S.phase !== 'botoffer') return; var h = S.hist[S.hist.length - 1];
      if (yes) { h.state = 'yes'; end(S.botOffer, true); }
      else { h.state = 'no'; if (isFinite(P.T) && S.t >= P.T) end(0, false); else { S.t++; S.phase = 'you'; sync(); } }
    }
    function sync() {
      seg(el.bot, 'data-b', P.bot); seg(el.first, 'data-f', P.first); seg(el.T, 'data-t', isFinite(P.T) ? P.T : 'inf');
      el.d1.value = P.d1; el.d1O.textContent = fmt(P.d1, 2);
      el.keep.value = Math.round(S.keep * 1000) / 10; el.keepO.textContent = pct(S.keep, 1); el.keep.disabled = S.phase !== 'you';
      el.rej.hidden = S.phase !== 'botoffer';
      el.act.textContent = S.phase === 'you' ? 'Offer: I keep ' + pct(S.keep, 1) : S.phase === 'botoffer' ? 'Accept ' + pct(S.botOffer, 1) : S.phase === 'over' ? 'New game' : 'Waiting…';
      el.act.disabled = S.phase === 'botwait';
      var x1 = M.rubinstein(P.d1, P.d2), res = S.phase === 'you' ? M.reservation(S.t, P.T, P.d1, P.d2, P.first) : NaN;
      var bn = BOTS[P.bot].name.split(' ')[1];
      readout(el.read, [['Your patience δ₁ / ' + bn + '’s δ₂', fmt(P.d1, 2) + ' / ' + fmt(P.d2, 2)], ['No deadline, you first: you keep', pct(x1, 1)], ['No deadline, ' + bn + ' first: you get', pct(1 - M.rubinstein(P.d2, P.d1), 1)],
        ['Equilibrium split now (proposer keeps)', S.phase === 'over' ? '—' : pct(spe1(), 1)], ['Least the bot accepts now', isFinite(res) ? pct(res, 1) : '—'],
        ['Result', S.result ? (S.result.agreed ? 'deal in round ' + S.result.round + ': you ' + money(S.result.pay, 2) : 'no deal: $0') : 'round ' + S.t]]);
      var t = '<b>' + (S.phase === 'over' ? (S.result.agreed ? 'Deal in round ' + S.result.round : 'No deal') : 'Round ' + S.t + (isFinite(P.T) ? ' of ' + P.T : '')) + '</b> · ' + (S.phase === 'you' ? 'your offer' : S.phase === 'botoffer' ? BOTS[P.bot].name + ' made an offer' : S.phase === 'botwait' ? BOTS[P.bot].name + ' is thinking…' : 'press New game to play again') + '<br>a $100 pie; payoffs shrink each round by δ';
      if (t !== S.hudTxt) { hud.innerHTML = t; S.hudTxt = t; }
    }
    el.bot.addEventListener('click', function (e) { var b = e.target.closest('button[data-b]'); if (!b) return; P.bot = b.dataset.b; P.d2 = BOTS[P.bot].d; newGame(); });
    el.first.addEventListener('click', function (e) { var b = e.target.closest('button[data-f]'); if (!b) return; P.first = +b.dataset.f; newGame(); });
    el.T.addEventListener('click', function (e) { var b = e.target.closest('button[data-t]'); if (!b) return; P.T = b.dataset.t === 'inf' ? Infinity : +b.dataset.t; newGame(); });
    el.d1.addEventListener('input', function () { P.d1 = +el.d1.value; newGame(); });
    el.keep.addEventListener('input', function () { S.keep = +el.keep.value / 100; sync(); });
    el.act.addEventListener('click', function () { if (S.phase === 'you') offer(); else if (S.phase === 'botoffer') respond(true); else if (S.phase === 'over') newGame(); });
    el.rej.addEventListener('click', function () { respond(false); });
    el.reset.addEventListener('click', newGame);
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'Enter' || k === ' ') el.act.click(); else if ((k === 'r' || k === 'R') && S.phase === 'botoffer') respond(false);
      else if ((k === 'ArrowRight' || k === 'ArrowUp') && S.phase === 'you') { S.keep = clamp(Math.round((S.keep + (e.shiftKey ? 0.01 : 0.001)) * 1000) / 1000, 0, 1); sync(); }
      else if ((k === 'ArrowLeft' || k === 'ArrowDown') && S.phase === 'you') { S.keep = clamp(Math.round((S.keep - (e.shiftKey ? 0.01 : 0.001)) * 1000) / 1000, 0, 1); sync(); }
      else used = false;
      if (used) e.preventDefault();
    });
    drag(cv, function (x, y) { if (S.phase !== 'you' || !S.pie) return null; var d = Math.hypot(x - S.pie.x, y - S.pie.y); return d < S.pie.r + 24 ? 1 : null; },
      function (t, x, y) { var a = Math.atan2(x - S.pie.x, -(y - S.pie.y)); if (a < 0) a += 2 * Math.PI; S.keep = clamp(Math.round(a / (2 * Math.PI) * 1000) / 1000, 0, 1); sync(); });

    /* missions */
    var MIS = [
      { id: 'ultimatum', title: 'Take it or leave it', goal: 'One round only, you propose: keep at least 99% and get it accepted.' },
      { id: 'rejected', title: 'Too greedy', goal: 'Make an offer the bot turns down, and read why.' },
      { id: 'instant', title: 'Rubinstein’s deal', goal: 'No deadline, you first: agree in round 1 within 1 point of the equilibrium split.' },
      { id: 'second', title: 'Second mover', goal: 'Let the bot propose first (no deadline) and accept its opening offer.' },
      { id: 'patience', title: 'Patience pays', goal: 'Against Hasty Hal, with your patience at 0.95 or more, keep at least 85% in round 1.' },
      { id: 'backward', title: 'Count back from the deadline', goal: 'With 2, 3 or 5 rounds, you first: agree in round 1 within 1 point of the backward-induction split.' },
      { id: 'fifty', title: 'Almost fifty-fifty', goal: 'Match Patient Pat’s patience (0.97) and agree in round 1 within 1 point of the equilibrium.' }
    ];
    var mis = L.missions($('gt11-missions'), 'gt11', MIS, function (id) {
      if (id === 'ultimatum') { P.T = 1; P.first = 1; } else if (id === 'second') { P.T = Infinity; P.first = 2; } else if (id === 'patience') { P.bot = 'hal'; P.d2 = 0.6; P.T = Infinity; P.first = 1; }
      else if (id === 'backward') { P.T = 3; P.first = 1; } else if (id === 'fifty') { P.bot = 'pat'; P.d2 = 0.97; P.T = Infinity; P.first = 1; P.d1 = 0.97; } else if (id === 'instant') { P.T = Infinity; P.first = 1; }
      newGame(); L.toast(view, MIS.filter(function (m) { return m.id === id; })[0].goal);
    });
    function win(id, text) { if (mis.done(id)) celebrate(view, '✓ ' + text); }
    function check() {
      var r = S.result; if (!r || !r.agreed) return;
      if (P.T === 1 && P.first === 1 && r.round === 1 && r.you >= 0.99 - 1e-9) win('ultimatum', 'In the last round, any offer beats nothing, so the proposer takes it all.');
      if (!isFinite(P.T) && P.first === 1 && r.round === 1 && Math.abs(r.you - M.rubinstein(P.d1, P.d2)) <= 0.01 + 1e-9) win('instant', 'Rubinstein’s split: agreement at once, no time wasted.');
      if (!isFinite(P.T) && P.first === 2 && r.round === 1) win('second', 'You took ' + pct(r.you, 1) + ': the first mover gets the edge.');
      if (P.d2 <= 0.6 + 1e-9 && P.d1 >= 0.95 - 1e-9 && r.round === 1 && r.you >= 0.85 && S.hist[0] && S.hist[0].prop === 1) win('patience', 'Patience is power: the impatient side gives up the most.');
      if (isFinite(P.T) && P.T >= 2 && P.first === 1 && r.round === 1 && Math.abs(r.you - M.finite(P.T, P.d1, P.d2, 1).share[1]) <= 0.01 + 1e-9) win('backward', 'Backward induction: you solved the game from its last round.');
      if (!isFinite(P.T) && P.d1 >= 0.97 - 1e-9 && P.d2 >= 0.97 - 1e-9 && Math.abs(P.d1 - P.d2) < 0.005 && P.first === 1 && r.round === 1 && Math.abs(r.you - M.rubinstein(P.d1, P.d2)) <= 0.01 + 1e-9) win('fifty', 'Patient players split almost evenly: 1/(1 + δ) → ½.');
    }

    function miniPie(x, y, r, you, alpha, ring) {
      c.save(); c.globalAlpha = alpha;
      c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + you * 2 * Math.PI); c.closePath(); c.fillStyle = C.gold; c.fill();
      c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, -Math.PI / 2 + you * 2 * Math.PI, 1.5 * Math.PI); c.closePath(); c.fillStyle = BOTS[P.bot].col; c.fill();
      if (ring) { c.beginPath(); c.arc(x, y, r + 2, 0, 7); c.strokeStyle = ring; c.lineWidth = 2; c.stroke(); }
      c.restore();
    }
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 620; bg(c, w, h);
      if (S.phase === 'botwait') { S.wait -= dt; if (S.wait <= 0) botPropose(); }
      var top = narrow ? 92 : 62;
      var A = narrow ? { x: 10, y: top, w: w - 20, h: 270 } : { x: 10, y: top, w: w * 0.46 - 15, h: h - top - 210 };
      var B = narrow ? { x: 10, y: A.y + A.h + 8, w: w - 20, h: 200 } : { x: w * 0.46 + 5, y: top, w: w * 0.54 - 15, h: h - top - 210 };
      var Cb = narrow ? { x: 10, y: B.y + B.h + 8, w: w - 20, h: h - B.y - B.h - 18 } : { x: 10, y: h - 200, w: w - 20, h: 190 };
      // the pie
      panelBox(c, A.x, A.y, A.w, A.h, S.phase === 'you' ? 'YOUR OFFER · DRAG THE EDGE OF YOUR SLICE' : S.phase === 'botoffer' ? 'THE BOT’S OFFER' : 'THE PIE');
      var r = Math.min(A.w * 0.36, (A.h - 104) / 2), px = A.x + A.w / 2, py = A.y + 30 + r + 6;
      var you = S.phase === 'botoffer' ? S.botOffer : S.phase === 'over' && S.result ? (S.result.agreed ? S.result.you : 0) : S.keep;
      S.pieAng += ((you) - S.pieAng) * (reduced ? 1 : Math.min(1, dt * 10));
      var shrink = Math.pow(P.d1, S.t - 1); S.pie = { x: px, y: py, r: r };
      c.save(); c.beginPath(); c.arc(px, py, r, 0, 7); c.strokeStyle = 'rgba(255,255,255,.15)'; c.setLineDash([4, 4]); c.stroke(); c.restore();
      if (S.phase === 'over' && S.result && !S.result.agreed) { label(c, 'No deal: the pie is gone.', px, py, C.red, { size: 14, bold: true, align: 'center' }); }
      else {
        miniPie(px, py, r * Math.sqrt(shrink), S.pieAng, 1);
        var ex = px + Math.sin(S.pieAng * 2 * Math.PI) * r * Math.sqrt(shrink), ey = py - Math.cos(S.pieAng * 2 * Math.PI) * r * Math.sqrt(shrink);
        if (S.phase === 'you') { line(c, [[px, py], [ex, ey]], '#fff', 2); dot(c, ex, ey, 8, '#fff', { ring: C.gold, lw: 3, glow: 10 }); }
        label(c, 'You ' + pct(S.pieAng, 1), px - 8, py + r + 16, C.gold, { size: 13, bold: true, align: 'right' });
        label(c, BOTS[P.bot].name.split(' ')[1] + ' ' + pct(1 - S.pieAng, 1), px + 8, py + r + 16, BOTS[P.bot].col, { size: 13, bold: true });
      }
      label(c, 'Round ' + S.t + ': a deal now is worth ' + Math.round(Math.pow(P.d1, S.t - 1) * 100) + '% of face value to you, ' + Math.round(Math.pow(P.d2, S.t - 1) * 100) + '% to ' + BOTS[P.bot].name.split(' ')[1], A.x + A.w / 2, A.y + A.h - 14, C.muted, { size: 10.5, align: 'center', max: A.w - 16 });
      // the rounds log
      panelBox(c, B.x, B.y, B.w, B.h, 'ROUND BY ROUND');
      var rowH = narrow ? 34 : 40, maxRows = Math.floor((B.h - 40) / rowH), rows = S.hist.slice(-maxRows);
      rows.forEach(function (hh, k) {
        var yy = B.y + 34 + k * rowH + rowH / 2, mx = B.x + 22;
        miniPie(mx, yy - 2, 11, hh.you, 1, hh.state === 'yes' ? C.green : hh.state === 'no' ? C.red : '#fff');
        label(c, 'Round ' + hh.t + ' · ' + (hh.prop === 1 ? 'you propose' : BOTS[P.bot].name.split(' ')[1] + ' proposes') + (hh.state === 'yes' ? ' · accepted' : hh.state === 'no' ? ' · rejected' : ''), mx + 20, yy - 9, hh.state === 'yes' ? C.green : hh.state === 'no' ? C.red : C.ink, { size: 11.5, bold: true, max: B.w - 50 });
        label(c, hh.note, mx + 20, yy + 8, C.muted, { size: 10.5, max: B.w - 50 });
      });
      if (!S.hist.length) label(c, P.first === 1 ? 'You propose first. Drag your slice or use the slider, then make your offer.' : BOTS[P.bot].name + ' proposes first.', B.x + 12, B.y + 50, C.muted, { size: 11.5, max: B.w - 24 });
      if (S.result) label(c, S.result.agreed ? 'You get ' + money(S.result.pay, 2) + ' in today’s money; ' + BOTS[P.bot].name.split(' ')[1] + ' gets ' + money(S.result.bp, 2) + '.' : 'Both get $0.', B.x + 12, B.y + B.h - 14, S.result.agreed ? C.green : C.red, { size: 12, bold: true, max: B.w - 24 });
      // the theory chart
      panelBox(c, Cb.x, Cb.y, Cb.w, Cb.h, narrow ? 'RUBINSTEIN: YOUR SHARE vs YOUR PATIENCE' : 'RUBINSTEIN: YOUR SHARE IN EQUILIBRIUM, FOR EACH LEVEL OF YOUR PATIENCE (OPPONENT FIXED)');
      var pl = plot(c, { x: Cb.x + 44, y: Cb.y + 32, w: Cb.w - 60, h: Cb.h - 60 }, [0, 1], [0, 1], { nx: narrow ? 4 : 10, ny: 4, xl: 'your δ₁', yf: function (t) { return pct(t); } });
      var p1 = [], p2 = []; for (var d = 0; d <= 0.995; d += 0.005) { p1.push([pl.X(d), pl.Y(M.rubinstein(d, P.d2))]); p2.push([pl.X(d), pl.Y(1 - M.rubinstein(P.d2, d))]); }
      line(c, [[pl.X(0), pl.Y(0.5)], [pl.X(1), pl.Y(0.5)]], 'rgba(255,255,255,.25)', 1, [3, 4]);
      line(c, p1, C.gold, 2.5); line(c, p2, C.gold, 1.8, [5, 4]);
      var line2 = isFinite(P.T) ? M.finite(P.T, P.d1, P.d2, 1).share[1] : null;
      dot(c, pl.X(P.d1), pl.Y(M.rubinstein(P.d1, P.d2)), 6, C.gold, { ring: '#fff', lw: 1.5, glow: 8 }); dot(c, pl.X(P.d1), pl.Y(1 - M.rubinstein(P.d2, P.d1)), 5, C.gold, { ring: '#06111a', lw: 1.5 });
      if (line2 !== null) { dot(c, pl.X(P.d1), pl.Y(line2), 5, C.pink, { glow: 8 }); label(c, P.T + ' rounds', pl.X(P.d1) + 8, pl.Y(line2), C.pink, { size: 10.5 }); }
      label(c, '— you propose first   - - ' + BOTS[P.bot].name.split(' ')[1] + ' proposes first', Cb.x + 12, Cb.y + Cb.h - 12, C.gold, { size: 10.5, max: Cb.w - 24 });
    }
    sync(); newGame(); L.loop(frame, cv);
  })();

  /* =====================================================================================
     2. THE NASH BARGAINING SOLUTION
     ===================================================================================== */
  (function () {
    var cv = $('gt11-nc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var el = { fr: $('gt11-fr'), b: $('gt11-beta'), bO: $('gt11-beta-o'), ks: $('gt11-ks'), read: $('gt11-nread'), reset: $('gt11-nreset') };
    var S = { fr: 'split', d: [0, 0], b: 0.5, cand: 30, ks: false, pl: null };
    function sync() {
      seg(el.fr, 'data-fr', S.fr); el.b.value = S.b; el.bO.textContent = S.b === 0.5 ? '0.50 (equal)' : fmt(S.b, 2); el.ks.checked = S.ks;
      var fr = M.FRONTIERS[S.fr], n = M.nash(fr, S.d[0], S.d[1], S.b), k = M.ks(fr, S.d[0], S.d[1]), cu1 = S.cand, cu2 = fr.f(cu1), cp = (cu1 - S.d[0]) * (cu2 - S.d[1]);
      readout(el.read, [['Disagreement point d', '(' + fmt(S.d[0], 0) + ', ' + fmt(S.d[1], 0) + ')'], ['Nash solution (you, partner)', n ? '(' + fmt(n.u1, 1) + ', ' + fmt(n.u2, 1) + ')' : '—'], ['Its product of gains', n ? grp(n.prod, 0) : '—'],
        ['Your blue deal’s product', cp > 0 && cu1 > S.d[0] ? grp(cp, 0) : 'not better for both'], ['Kalai–Smorodinsky', k ? '(' + fmt(k.u1, 1) + ', ' + fmt(k.u2, 1) + ')' : '—']]);
    }
    el.fr.addEventListener('click', function (e) { var b = e.target.closest('button[data-fr]'); if (!b) return; S.fr = b.dataset.fr; S.d = [0, 0]; sync(); });
    el.b.addEventListener('input', function () { S.b = +el.b.value; sync(); });
    el.ks.addEventListener('change', function () { S.ks = el.ks.checked; });
    el.reset.addEventListener('click', function () { S.d = [0, 0]; S.b = 0.5; S.cand = 30; sync(); });
    drag(cv, function (x, y) {
      if (!S.pl) return null; var fr = M.FRONTIERS[S.fr];
      if (Math.hypot(S.pl.X(S.d[0]) - x, S.pl.Y(S.d[1]) - y) < 26) return 'd';
      if (Math.hypot(S.pl.X(S.cand) - x, S.pl.Y(fr.f(S.cand)) - y) < 26) return 'c';
      return null;
    }, function (t, x, y) {
      var fr = M.FRONTIERS[S.fr], u = clamp(S.pl.ix(x), 0, fr.m);
      if (t === 'c') S.cand = u;
      else { var v = clamp(S.pl.iy(y), 0, 100); var lim = fr.f(u) - 2; S.d = [Math.round(Math.min(u, fr.m - 2)), Math.round(Math.max(0, Math.min(v, lim)))]; }
      sync();
    });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, fr = M.FRONTIERS[S.fr], used = true;
      if (k === 'ArrowRight') S.d[0] = Math.min(S.d[0] + 1, fr.m - 2); else if (k === 'ArrowLeft') S.d[0] = Math.max(0, S.d[0] - 1); else if (k === 'ArrowUp') S.d[1] = Math.min(S.d[1] + 1, fr.f(S.d[0]) - 2); else if (k === 'ArrowDown') S.d[1] = Math.max(0, S.d[1] - 1); else used = false;
      if (used) { S.d[1] = Math.max(0, Math.min(S.d[1], fr.f(S.d[0]) - 2)); e.preventDefault(); sync(); }
    });
    function frame() {
      G.fit(); var w = G.w, h = G.h, fr = M.FRONTIERS[S.fr]; bg(c, w, h);
      var side = Math.min(w - 90, h - 70), pb = { x: (w - side) / 2 + 14, y: 22, w: side, h: side };
      var pl = plot(c, pb, [0, 105], [0, 105], { nx: 5, ny: 5, xl: 'your gain', yl: 'partner’s gain' }); S.pl = pl;
      // feasible set
      c.beginPath(); c.moveTo(pl.X(0), pl.Y(0)); for (var u = 0; u <= fr.m; u += 0.5) c.lineTo(pl.X(u), pl.Y(fr.f(u))); c.lineTo(pl.X(fr.m), pl.Y(0)); c.closePath(); c.fillStyle = 'rgba(116,192,252,.10)'; c.fill();
      var fpts = []; for (u = 0; u <= fr.m; u += 0.5) fpts.push([pl.X(u), pl.Y(fr.f(u))]); line(c, fpts, C.blue, 2.5);
      label(c, 'possible deals', pl.X(fr.m * 0.25), pl.Y(fr.f(fr.m * 0.25) * 0.5), 'rgba(219,231,239,.6)', { size: 11, align: 'center' });
      var n = M.nash(fr, S.d[0], S.d[1], S.b);
      if (n) {
        c.fillStyle = 'rgba(255,212,121,.14)'; c.fillRect(pl.X(S.d[0]), pl.Y(n.u2), pl.X(n.u1) - pl.X(S.d[0]), pl.Y(S.d[1]) - pl.Y(n.u2));
        // level curve of the Nash product through the solution
        if (S.b === 0.5) { var hp = []; for (u = S.d[0] + 0.5; u <= 105; u += 0.5) { var v = S.d[1] + n.prod / (u - S.d[0]); if (v <= 105) hp.push([pl.X(u), pl.Y(v)]); } line(c, hp, 'rgba(255,212,121,.6)', 1.5, [5, 4]); }
        dot(c, pl.X(n.u1), pl.Y(n.u2), 7, C.gold, { glow: 12, ring: '#fff', lw: 1.5 }); label(c, 'Nash', pl.X(n.u1) + 10, pl.Y(n.u2) - 10, C.gold, { size: 12, bold: true });
      }
      if (S.ks) { var k = M.ks(fr, S.d[0], S.d[1]); if (k) { line(c, [[pl.X(S.d[0]), pl.Y(S.d[1])], [pl.X(k.ideal[0]), pl.Y(k.ideal[1])]], C.pink, 1.5, [3, 4]); dot(c, pl.X(k.ideal[0]), pl.Y(k.ideal[1]), 4, C.pink); dot(c, pl.X(k.u1), pl.Y(k.u2), 6, C.pink, { glow: 8 }); label(c, 'K–S', pl.X(k.u1) + 9, pl.Y(k.u2) + 12, C.pink, { size: 11.5, bold: true }); } }
      var cu = S.cand, cv2 = fr.f(cu);
      if (cu > S.d[0] && cv2 > S.d[1]) { c.strokeStyle = 'rgba(116,192,252,.8)'; c.lineWidth = 1.5; c.strokeRect(pl.X(S.d[0]), pl.Y(cv2), pl.X(cu) - pl.X(S.d[0]), pl.Y(S.d[1]) - pl.Y(cv2)); }
      dot(c, pl.X(cu), pl.Y(cv2), 7, C.blue, { ring: '#fff', lw: 1.5 }); label(c, 'drag me', pl.X(cu) + 10, pl.Y(cv2) + 2, C.blue, { size: 10.5 });
      dot(c, pl.X(S.d[0]), pl.Y(S.d[1]), 7, '#fff', { glow: 10 }); label(c, 'd: no deal', pl.X(S.d[0]) + 10, pl.Y(S.d[1]) - 10, '#fff', { size: 11, bold: true });
    }
    sync(); L.loop(frame, cv);
  })();
})(window, document);
