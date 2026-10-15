/* Game Theory, Chapter 13: Coalitions, the Core and the Shapley Value. Three interactive pieces:
   1. the Shapley value as the average of marginal contributions over every order of arrival (main simulation, with missions),
   2. the core of a three-player game drawn in the triangle of possible splits, 3. voting power in weighted voting.
   The models are in model.js (window.GT13M), tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, M = W.GT13M, root = D.getElementById('gt13-lab');
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
  function celebrate(view, text) { L.toast(view, text); if (!reduced) { view.classList.remove('gt13-win'); void view.offsetWidth; view.classList.add('gt13-win'); } }
  /* seeded random numbers, so a "new round" button can be replayed in tests */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }


  var PC = ['#ffd479', '#f9a8d4', '#63e6be', '#74c0fc'];
  var GAMES = {
    gloves: { n: 3, names: ['Lefty', 'Righty 1', 'Righty 2'], short: ['L', 'R1', 'R2'], a: [0, 0, 0, 1, 1, 0, 1], unit: 'pair', note: 'Lefty has a left glove; the Rightys each have a right glove. A matched pair sells for $1.' },
    airport: { n: 3, cost: true, names: ['Small plane', 'Medium plane', 'Large plane'], short: ['S', 'M', 'L'], a: [8, 11, 13, 11, 13, 13, 13], note: 'A runway long enough for the largest plane using it: $8M, $11M or $13M. The Shapley value splits the cost.' },
    merger: { n: 3, names: ['Firm A', 'Firm B', 'Firm C'], short: ['A', 'B', 'C'], a: [10, 20, 30, 40, 50, 60, 80], note: 'Yearly profits in $M of each firm alone, each pair merged, and all three merged.' },
    majority: { n: 3, names: ['Voter 1', 'Voter 2', 'Voter 3'], short: ['1', '2', '3'], a: [0, 0, 0, 1, 1, 1, 1], note: 'Any two of the three can grab the whole $1. No split is safe.' },
    custom: { n: 3, names: ['Player 1', 'Player 2', 'Player 3'], short: ['1', '2', '3'], a: [0, 0, 0, 4, 6, 2, 10], note: 'Your own game: type any worths in the boxes.' },
    air4: { n: 4, cost: true, names: ['Small', 'Medium', 'Large', 'Jumbo'], short: ['S', 'M', 'L', 'J'], c4: [20, 50, 80, 120], note: 'Four planes; runway costs $20M, $50M, $80M or $120M for the largest one using it.' },
    gl4: { n: 4, names: ['Left 1', 'Left 2', 'Right 1', 'Right 2'], short: ['L1', 'L2', 'R1', 'R2'], note: 'Two left gloves and two right gloves; each matched pair is worth $1.' }
  };
  var CUR = { key: 'gloves', g: null, cost: false };
  function build(key) {
    var d = GAMES[key]; CUR.key = key; CUR.cost = !!d.cost; CUR.def = d;
    if (d.n === 3) { var a = d.a.slice(); CUR.a = a; CUR.g = M.game3(d.cost ? a.map(function (x) { return -x; }) : a); }
    else if (key === 'air4') CUR.g = M.gameFrom(4, function (S) { var m = 0; for (var i = 0; i < 4; i++) if (S & (1 << i)) m = Math.max(m, d.c4[i]); return -m; });
    else CUR.g = M.gameFrom(4, function (S) { return Math.min((S & 1 ? 1 : 0) + (S & 2 ? 1 : 0), (S & 4 ? 1 : 0) + (S & 8 ? 1 : 0)); });
    listeners.forEach(function (f) { f(); });
  }
  function setCustom(a) { GAMES.custom.a = a.slice(); CUR.key = 'custom'; CUR.cost = false; CUR.def = GAMES.custom; CUR.a = a.slice(); CUR.g = M.game3(a); listeners.forEach(function (f) { f(); }); }
  var listeners = [];
  build('gloves');
  function show(x) { return CUR.cost ? -x : x; } // display worths (costs shown as positive)
  function num(x) { return fmt(x, Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 2); }
  function coalName(S, n) { var a = []; for (var i = 0; i < n; i++) if (S & (1 << i)) a.push(CUR.def.short[i]); return a.length ? '{' + a.join(', ') + '}' : '(∅)'; }

  /* =====================================================================================
     1. THE SHAPLEY VALUE, ONE ORDER OF ARRIVAL AT A TIME
     ===================================================================================== */
  var mis = null, view = $('gt13-view');
  function win(id, text) { if (mis && mis.done(id)) celebrate(view, '✓ ' + text); }
  (function () {
    var cv = $('gt13-cv'), hud = $('gt13-hud'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, R = rng(1953);
    var el = { pre: $('gt13-pre'), ed: $('gt13-ed'), edWrap: $('gt13-edwrap'), note: $('gt13-note'), next: $('gt13-next'), all: $('gt13-all'), reset: $('gt13-reset'), pause: $('gt13-pause'), read: $('gt13-read') };
    var S = { orders: [], doneIdx: [], cur: null, t: 0, playing: false, sum: [], bars: [], hudTxt: '' };
    function restart() {
      var n = CUR.g.n; S.orders = M.orders(n); S.doneIdx = []; S.cur = null; S.t = 0; S.playing = false; S.sum = []; S.bars = []; for (var i = 0; i < n; i++) { S.sum[i] = 0; S.bars[i] = 0; } sync();
    }
    function startNext(random) {
      var left = S.orders.map(function (o, i) { return i; }).filter(function (i) { return S.doneIdx.indexOf(i) < 0; });
      if (!left.length) { S.playing = false; sync(); return; }
      var k = random ? left[Math.floor(R() * left.length)] : left[0]; S.cur = { idx: k, order: S.orders[k], mc: M.marginals(CUR.g, S.orders[k]) }; S.t = 0;
    }
    function finishCur() {
      if (!S.cur) return; S.doneIdx.push(S.cur.idx); S.cur.mc.forEach(function (x, i) { S.sum[i] += x; }); S.cur = null;
      if (S.doneIdx.length === S.orders.length) {
        if (CUR.g.n === 3) win('allorders', 'Every order done: the averages are the Shapley value.');
        if (CUR.key === 'gloves') win('gloves', 'Lefty gets 2/3: the scarce left glove is worth more than either right glove.');
        S.playing = false;
      }
      sync();
    }
    function sync() {
      var n = CUR.g.n, phi = M.shapley(CUR.g), k = S.doneIdx.length;
      seg(el.pre, 'data-g', CUR.key);
      el.note.textContent = CUR.def.note; el.edWrap.hidden = n !== 3; if (n === 3) fillEditor();
      el.all.textContent = S.playing ? 'Pause' : k === S.orders.length ? 'Start over' : 'Run all ' + S.orders.length + ' orders';
      var rows = [['Orders done', k + ' of ' + S.orders.length]];
      for (var i = 0; i < n; i++) rows.push([CUR.def.names[i] + (CUR.cost ? ' pays' : ' gets'), (k ? num(show(S.sum[i] / k)) : '—') + ' → ' + num(show(phi[i]))]);
      var core = n === 3 ? M.core3(CUR.g) : null;
      rows.push(['Superadditive?', M.superadditive(CUR.g) ? 'yes' : 'no']);
      if (core) rows.push(['Core', core.empty ? 'empty' : M.inCore(CUR.g, phi, 1e-9) ? 'contains the Shapley value' : 'does not contain the Shapley value']);
      readout(el.read, rows);
      var t = '<b>' + (CUR.cost ? 'Cost sharing' : 'Splitting the worth') + '</b> · ' + n + ' players, ' + S.orders.length + ' orders<br>average of marginal contributions = Shapley value';
      if (t !== S.hudTxt) { hud.innerHTML = t; S.hudTxt = t; }
      // missions about the game itself
      if (n === 3 && core) {
        var nulls = M.nullPlayers(CUR.g);
        if (CUR.key === 'custom' && nulls.length && CUR.g.v[7] !== 0) win('dummy', 'A null player adds nothing to any coalition and gets nothing.');
        if (core.empty) win('empty', 'Empty core: whatever the split, some coalition can do better on its own.');
        if (CUR.key === 'custom' && !core.empty && !M.inCore(CUR.g, phi, 1e-9)) win('outside', 'The Shapley value can lie outside the core: fairness and stability can clash.');
      }
    }
    var LBL = ['v(1)', 'v(2)', 'v(3)', 'v(1,2)', 'v(1,3)', 'v(2,3)', 'v(1,2,3)'];
    function fillEditor() {
      var a = CUR.key === 'custom' ? GAMES.custom.a : CUR.a, pre = CUR.cost ? 'c' : 'v';
      if (el.ed.dataset.key !== CUR.key || el.ed.dataset.vals !== a.join(',')) {
        el.ed.innerHTML = LBL.map(function (lb, i) { return '<label><span>' + lb.replace('v', pre) + '</span><input type="number" step="0.5" value="' + a[i] + '" data-i="' + i + '" aria-label="Worth of coalition ' + lb.slice(1) + '"></label>'; }).join('');
        el.ed.dataset.key = CUR.key; el.ed.dataset.vals = a.join(',');
      }
    }
    el.ed.addEventListener('input', function (e) {
      var inp = e.target.closest('input[data-i]'); if (!inp) return; var v = parseFloat(inp.value); if (!isFinite(v)) return;
      var a = (CUR.key === 'custom' ? GAMES.custom.a : CUR.a).slice(); if (CUR.cost) a = a.map(function (x) { return x; });
      a[+inp.dataset.i] = v;
      if (CUR.cost) a = a.map(function (x) { return -x; }); // a custom game is a value game
      el.ed.dataset.key = 'custom'; el.ed.dataset.vals = a.join(',');
      setCustom(a);
    });
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-g]'); if (b) build(b.dataset.g); });
    el.next.addEventListener('click', function () { if (S.cur) { finishCur(); } S.playing = false; startNext(false); sync(); });
    el.all.addEventListener('click', function () { if (S.doneIdx.length === S.orders.length && !S.playing) restart(); S.playing = !S.playing; if (S.playing && !S.cur) startNext(false); sync(); });
    el.reset.addEventListener('click', restart);
    el.pause.addEventListener('click', function () { S.playing = !S.playing; if (S.playing && !S.cur) startNext(false); sync(); });
    cv.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { el.next.click(); e.preventDefault(); } });
    listeners.push(restart); restart();

    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 600, n = CUR.g.n; bg(c, w, h);
      var step = reduced ? 0.2 : S.playing ? (n === 4 ? 0.16 : 0.42) : 0.7;
      if (S.cur) { S.t += dt; if (S.t > step * (n + 0.8)) { var auto = S.playing; finishCur(); if (auto) startNext(false); } }
      else if (S.playing) startNext(false);
      var phi = M.shapley(CUR.g), k = S.doneIdx.length;
      for (var i = 0; i < n; i++) { var target = k ? S.sum[i] / k : 0; S.bars[i] += (target - S.bars[i]) * (reduced ? 1 : Math.min(1, dt * 6)); }
      var top = narrow ? 92 : 62;
      var A = narrow ? { x: 10, y: top, w: w - 20, h: 200 } : { x: 10, y: top, w: w * 0.56 - 15, h: 250 };
      var B = narrow ? { x: 10, y: A.y + A.h + 8, w: w - 20, h: n === 3 ? 150 : 190 } : { x: w * 0.56 + 5, y: top, w: w * 0.44 - 15, h: 250 };
      var Cb = { x: 10, y: B.y + B.h + 8, w: w - 20, h: h - B.y - B.h - 18 };
      // the room
      panelBox(c, A.x, A.y, A.w, A.h, 'PLAYERS ARRIVE ONE AT A TIME');
      var doorX = A.x + 30, roomX = A.x + 80, roomW = A.w - 100, roomY = A.y + 60, roomH = A.h - 100;
      c.fillStyle = 'rgba(255,255,255,.04)'; c.strokeStyle = 'rgba(120,170,200,.35)'; c.lineWidth = 1.5; rrect(c, roomX, roomY, roomW, roomH, 12); c.fill(); c.stroke();
      c.fillStyle = '#3b2a12'; c.fillRect(roomX - 4, roomY + roomH / 2 - 26, 8, 52); label(c, 'door', roomX, roomY + roomH / 2 + 38, C.muted, { size: 10, align: 'center' });
      var order = S.cur ? S.cur.order : null, mc = S.cur ? S.cur.mc : null, inRoom = 0, Sm = 0;
      if (order) {
        var slot = roomW / (n + 0.5);
        order.forEach(function (p, j) {
          var tj = S.t - j * step, enter = clamp(tj / (step * 0.6), 0, 1), e2 = ease(enter);
          var qx = doorX - 6 - (j - Math.min(j, Math.floor(S.t / step))) * 0, sx = A.x + 24 + j * 0, x0 = doorX - 4, y0 = roomY + roomH / 2;
          var tx = roomX + slot * (j + 0.75), ty = roomY + roomH / 2;
          var x = tj < 0 ? A.x + 16 + 0 : lerp(x0, tx, e2), y = tj < 0 ? A.y + 40 + j * 0 : lerp(y0, ty, e2);
          if (tj < 0) { x = A.x + 18; y = roomY + 10 + (j - Math.floor(S.t / step) - 0) * 24; }
          dot(c, x, y, narrow ? 14 : 17, PC[p], { ring: '#06111a', lw: 2 });
          label(c, CUR.def.short[p], x, y + 1, '#06111a', { size: 11, bold: true, align: 'center', plain: true });
          if (tj >= step * 0.6) { inRoom = j + 1; Sm |= 1 << p; var pop = clamp((tj - step * 0.6) / 0.3, 0, 1); label(c, (show(mc[p]) >= 0 ? '+' : '') + num(show(mc[p])), tx, ty - 30 - 8 * pop, PC[p], { size: 14, bold: true, align: 'center' }); }
        });
      } else label(c, k === S.orders.length ? 'All orders done.' : 'Press “Next order” or “Run all”.', roomX + roomW / 2, roomY + roomH / 2, C.muted, { size: 12, align: 'center' });
      label(c, (CUR.cost ? 'Cost so far: c' : 'Worth so far: v') + coalName(Sm, n) + ' = ' + num(show(CUR.g.v[Sm])), roomX + roomW / 2, A.y + 40, '#fff', { size: 12.5, bold: true, align: 'center', max: roomW });
      label(c, 'Each arrival gets what it adds: its marginal contribution', A.x + A.w / 2, A.y + A.h - 16, C.muted, { size: 10.5, align: 'center', max: A.w - 20 });
      // the orders table
      panelBox(c, B.x, B.y, B.w, B.h, 'ALL ' + S.orders.length + ' ORDERS · MARGINAL CONTRIBUTIONS');
      var cols = n === 3 ? (narrow ? 2 : 1) : (narrow ? 3 : 2), rowsPer = Math.ceil(S.orders.length / cols), rh = Math.min(30, (B.h - 34) / rowsPer), cw = (B.w - 16) / cols;
      S.orders.forEach(function (o, idx) {
        var col = Math.floor(idx / rowsPer), row = idx % rowsPer, x0 = B.x + 8 + col * cw, y0 = B.y + 30 + row * rh, dn = S.doneIdx.indexOf(idx) >= 0, cur = S.cur && S.cur.idx === idx;
        if (cur) { c.fillStyle = 'rgba(255,212,121,.12)'; c.fillRect(x0, y0, cw - 6, rh - 2); }
        var mcs = M.marginals(CUR.g, o), dx = (cw - 10) / n;
        o.forEach(function (p, j) {
          var xx = x0 + 6 + j * dx; dot(c, xx + 6, y0 + rh / 2 - 1, Math.min(6, rh * 0.25), PC[p], { });
          label(c, dn || cur ? num(show(mcs[p])) : '·', xx + 15, y0 + rh / 2, dn ? PC[p] : C.muted, { size: Math.min(11, rh * 0.45), bold: dn });
        });
      });
      // the bars
      panelBox(c, Cb.x, Cb.y, Cb.w, Cb.h, narrow ? 'AVERAGE SO FAR (BARS), SHAPLEY VALUE (LINES)' : 'AVERAGE MARGINAL CONTRIBUTION SO FAR (BAR) AND THE SHAPLEY VALUE (LINE)');
      var all = phi.map(show), lo = Math.min(0, Math.min.apply(null, all)), hi = Math.max.apply(null, all.concat(S.bars.map(show), [1e-9]));
      var by = Cb.y + 44, bh = Cb.h - 74, bw = Math.min(90, (Cb.w - 60) / n - 20), Y = function (v) { return by + bh - (v - lo) / (hi - lo || 1) * bh; };
      for (i = 0; i < n; i++) {
        var bx = Cb.x + 40 + i * ((Cb.w - 60) / n) + ((Cb.w - 60) / n - bw) / 2, val = show(S.bars[i]);
        c.fillStyle = PC[i]; c.globalAlpha = 0.85; c.fillRect(bx, Math.min(Y(val), Y(0)), bw, Math.abs(Y(val) - Y(0))); c.globalAlpha = 1;
        line(c, [[bx - 6, Y(all[i])], [bx + bw + 6, Y(all[i])]], '#fff', 2.5);
        label(c, num(all[i]), bx + bw / 2, Y(all[i]) - 10, '#fff', { size: 11, bold: true, align: 'center' });
        label(c, CUR.def.names[i], bx + bw / 2, Cb.y + Cb.h - 14, PC[i], { size: 11, bold: true, align: 'center', max: (Cb.w - 60) / n - 4 });
      }
      line(c, [[Cb.x + 30, Y(0)], [Cb.x + Cb.w - 10, Y(0)]], 'rgba(143,179,198,.5)', 1);
    }
    L.loop(frame, cv);
  })();

  /* =====================================================================================
     2. THE CORE IN THE TRIANGLE
     ===================================================================================== */
  (function () {
    var cv = $('gt13-tc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, el = { read: $('gt13-tread'), shap: $('gt13-tshap') };
    var S = { l: [1 / 3, 1 / 3, 1 / 3], tri: null };
    function toXY(l) { var t = S.tri; return [l[0] * t[0][0] + l[1] * t[1][0] + l[2] * t[2][0], l[0] * t[0][1] + l[1] * t[1][1] + l[2] * t[2][1]]; }
    function fromXY(x, y) { var t = S.tri, x1 = t[0][0], y1 = t[0][1], x2 = t[1][0], y2 = t[1][1], x3 = t[2][0], y3 = t[2][1], d = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3); var a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / d, b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / d; return [a, b, 1 - a - b]; }
    function clampL(l) { var a = l.map(function (x) { return Math.max(0, x); }), s = a[0] + a[1] + a[2]; return a.map(function (x) { return x / s; }); }
    function sync() {
      if (CUR.g.n !== 3) { readout(el.read, [['The triangle needs 3 players', 'pick a 3-player game']]); return; }
      var g = CUR.g, x = M.toImputation(g, S.l), ob = M.objections(g, x), core = M.core3(g);
      var rows = [['Your split', x.map(function (z) { return num(show(z)); }).join(' / ')], ['Core', core.empty ? 'empty' : core.poly.length === 1 ? 'a single point' : 'the green region']];
      rows.push(['Coalitions that would walk out', ob.length ? ob.map(function (o) { return coalName(o.S, 3) + (CUR.cost ? ' pays ' + num(-o.gets) + ', alone ' + num(-o.could) : ' gets ' + num(o.gets) + ', could get ' + num(o.could)); }).join('; ') : 'none: it’s in the core']);
      readout(el.read, rows);
      if (S.user && !core.empty && !ob.length && core.poly.length > 1) win('inside', 'In the core: no group can do better by breaking away.');
    }
    el.shap.addEventListener('click', function () { if (CUR.g.n === 3) { S.user = true; S.l = clampL(M.toBary(CUR.g, M.shapley(CUR.g))); sync(); } });
    drag(cv, function (x, y) { return S.tri && CUR.g.n === 3 ? 1 : null; }, function (t, x, y) { S.user = true; S.l = clampL(fromXY(x, y)); sync(); });
    cv.addEventListener('keydown', function (e) { var k = e.key, d = 0.01, l = S.l.slice(); if (k === 'ArrowUp') { l[0] += d; l[1] -= d / 2; l[2] -= d / 2; } else if (k === 'ArrowDown') { l[0] -= d; l[1] += d / 2; l[2] += d / 2; } else if (k === 'ArrowLeft') { l[1] += d; l[2] -= d; } else if (k === 'ArrowRight') { l[1] -= d; l[2] += d; } else return; e.preventDefault(); S.user = true; S.l = clampL(l); sync(); });
    listeners.push(function () { S.l = [1 / 3, 1 / 3, 1 / 3]; S.user = false; sync(); });
    function frame() {
      G.fit(); var w = G.w, h = G.h; bg(c, w, h);
      if (CUR.g.n !== 3) { label(c, 'The core picture needs a three-player game. Pick one above.', w / 2, h / 2, C.muted, { size: 13, align: 'center', max: w - 40 }); S.tri = null; return; }
      var side = Math.min(w - 60, (h - 104) * 1.1547), cx = w / 2, ty = 40, th = side * 0.866;
      S.tri = [[cx, ty], [cx - side / 2, ty + th], [cx + side / 2, ty + th]];
      var g = CUR.g, core = M.core3(g), phi = M.shapley(g), tri = S.tri;
      c.beginPath(); c.moveTo(tri[0][0], tri[0][1]); c.lineTo(tri[1][0], tri[1][1]); c.lineTo(tri[2][0], tri[2][1]); c.closePath(); c.fillStyle = 'rgba(116,192,252,.06)'; c.fill(); c.strokeStyle = 'rgba(219,231,239,.5)'; c.lineWidth = 1.5; c.stroke();
      // pair constraint lines l_k = cap_k
      if (core.cap) core.cap.forEach(function (cp, k) {
        if (cp <= 0 || cp >= 1) return; var a = [0, 0, 0], b = [0, 0, 0], o1 = (k + 1) % 3, o2 = (k + 2) % 3; a[k] = cp; a[o1] = 1 - cp; b[k] = cp; b[o2] = 1 - cp;
        var A = toXY(a), B = toXY(b); line(c, [A, B], 'rgba(255,135,135,.55)', 1.5, [5, 4]);
      });
      if (!core.empty) {
        if (core.poly.length >= 3) { c.beginPath(); core.poly.forEach(function (p, i) { var q = toXY(p); if (i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); c.closePath(); c.fillStyle = 'rgba(99,230,190,.28)'; c.fill(); c.strokeStyle = C.green; c.lineWidth = 2; c.stroke(); }
        else core.poly.forEach(function (p) { var q = toXY(p); dot(c, q[0], q[1], 6, C.green, { glow: 10 }); });
        var cen = [0, 1, 2].map(function (k) { return core.poly.reduce(function (s, p) { return s + p[k]; }, 0) / core.poly.length; }), cq = toXY(cen);
        var spq = toXY(M.toBary(g, phi)); if (core.poly.length >= 3) label(c, 'core', cq[0], cq[1] + (Math.hypot(spq[0] - cq[0], spq[1] - cq[1]) < 30 ? 30 : 0), C.green, { size: 12, bold: true, align: 'center' });
      } else label(c, 'The core is empty', cx, ty + th * 0.62, C.red, { size: 14, bold: true, align: 'center' });
      var names = CUR.def.short;
      [0, 1, 2].forEach(function (k) { var p = tri[k]; label(c, 'all extra to ' + names[k], p[0] + (k === 0 ? 0 : k === 1 ? -4 : 4), p[1] + (k === 0 ? -14 : 16), PC[k], { size: 11, bold: true, align: k === 0 ? 'center' : k === 1 ? 'left' : 'right' }); });
      var sp = toXY(M.toBary(g, phi)); dot(c, sp[0], sp[1], 6, C.gold, { glow: 10, ring: '#06111a', lw: 1.5 }); label(c, 'Shapley', sp[0] + 9, sp[1] - 10, C.gold, { size: 11, bold: true });
      var mp = toXY(S.l), x = M.toImputation(g, S.l), ok = !M.objections(g, x).length;
      dot(c, mp[0], mp[1], 8, '#fff', { ring: ok ? C.green : C.red, lw: 3 });
      label(c, x.map(function (z) { return num(show(z)); }).join(' / '), mp[0], mp[1] + 20, '#fff', { size: 11, bold: true, align: 'center' });
      label(c, 'Drag the white dot: each point is one way to split ' + (CUR.cost ? 'the cost' : 'the worth') + '. Red dashes: pair limits.', w / 2, h - 12, C.muted, { size: 10.5, align: 'center', max: w - 20 });
    }
    sync(); L.loop(frame, cv);
  })();

  /* =====================================================================================
     3. VOTING POWER
     ===================================================================================== */
  (function () {
    var cv = $('gt13-vc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c;
    var el = { pre: $('gt13-vpre'), w: $('gt13-vw'), q: $('gt13-vq'), qO: $('gt13-vq-o'), read: $('gt13-vread') };
    var PRE = { eec: { names: ['France', 'Germany', 'Italy', 'Belgium', 'Netherlands', 'Luxembourg'], w: [4, 4, 4, 2, 2, 1], q: 12 }, nassau: { names: ['Hempstead 1', 'Hempstead 2', 'Oyster Bay', 'N. Hempstead', 'Long Beach', 'Glen Cove'], w: [31, 31, 28, 21, 2, 2], q: 58 },
      share: { names: ['Investor A', 'Investor B', 'Investor C'], w: [49, 49, 2], q: 51 }, council: { names: ['Ann', 'Bo', 'Cy', 'Di'], w: [3, 2, 1, 1], q: 4 } };
    var S = { key: 'eec', names: PRE.eec.names.slice(), w: PRE.eec.w.slice(), q: 12 };
    function inputs() { el.w.innerHTML = S.w.map(function (x, i) { return '<label><span>' + S.names[i] + '</span><input type="number" min="0" max="99" step="1" value="' + x + '" data-i="' + i + '" aria-label="Votes of ' + S.names[i] + '"></label>'; }).join(''); }
    function sync() {
      seg(el.pre, 'data-p', S.key); var tot = S.w.reduce(function (a, b) { return a + b; }, 0);
      el.q.max = tot; el.q.value = S.q; el.qO.textContent = S.q + ' of ' + tot + ' votes';
      var ss = M.shapleyShubik(S.w, S.q), bz = M.banzhaf(S.w, S.q), rows = [];
      rows.push(['Member', 'votes → SS / Bz']); S.names.forEach(function (nm, i) { rows.push([nm, pct(S.w[i] / tot, 0) + ' → ' + pct(ss[i], 1) + ' / ' + pct(bz.norm[i], 1)]); });
      readout(el.read, rows);
    }
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (!b) return; var p = PRE[b.dataset.p]; S.key = b.dataset.p; S.names = p.names.slice(); S.w = p.w.slice(); S.q = p.q; inputs(); sync(); });
    el.w.addEventListener('input', function (e) { var inp = e.target.closest('input[data-i]'); if (!inp) return; var v = Math.max(0, Math.min(99, Math.round(+inp.value || 0))); S.w[+inp.dataset.i] = v; S.key = null; var tot = S.w.reduce(function (a, b) { return a + b; }, 0); S.q = Math.min(S.q, Math.max(1, tot)); sync(); });
    el.q.addEventListener('input', function () { S.q = +el.q.value; S.key = null; sync(); });
    function frame() {
      G.fit(); var w = G.w, h = G.h, n = S.w.length, narrow = w < 640; bg(c, w, h);
      var tot = S.w.reduce(function (a, b) { return a + b; }, 0), ss = M.shapleyShubik(S.w, S.q), bz = M.banzhaf(S.w, S.q);
      panelBox(c, 10, 10, w - 20, h - 20, 'VOTES (GRAY) VERSUS POWER: SHAPLEY–SHUBIK (GOLD) AND BANZHAF (BLUE)');
      var gx = 20, gw = w - 40, colW = gw / n, base = h - 64, top = 104, maxv = Math.max(0.5, Math.max.apply(null, ss.concat(bz.norm, S.w.map(function (x) { return x / tot; })))), Y = function (v) { return base - v / maxv * (base - top); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (t) { if (t > maxv + 1e-9) return; line(c, [[gx, Y(t)], [gx + gw, Y(t)]], C.grid, 1); label(c, pct(t), gx + 2, Y(t) - 7, C.muted, { size: 9.5, plain: true }); });
      for (var i = 0; i < n; i++) {
        var x0 = gx + colW * i + colW * 0.15, bw = colW * 0.7 / 3, vals = [S.w[i] / tot, ss[i], bz.norm[i]], cols = ['rgba(219,231,239,.45)', C.gold, C.blue];
        vals.forEach(function (v, k) { c.fillStyle = cols[k]; c.fillRect(x0 + k * bw + 1, Y(v), bw - 2, base - Y(v)); });
        var r = 8 + 18 * Math.sqrt(S.w[i] / Math.max.apply(null, S.w));
        dot(c, x0 + colW * 0.35, 62, Math.min(r, colW * 0.3), ss[i] === 0 ? 'rgba(255,135,135,.6)' : 'rgba(116,192,252,.6)', { ring: '#06111a', lw: 1.5 });
        label(c, String(S.w[i]), x0 + colW * 0.35, 63, '#fff', { size: 11, bold: true, align: 'center' });
        label(c, narrow ? S.names[i].slice(0, 6) : S.names[i], x0 + colW * 0.35, base + 14, ss[i] === 0 ? C.red : C.ink, { size: 10.5, bold: true, align: 'center', max: colW - 4 });
        if (ss[i] === 0) label(c, 'no power', x0 + colW * 0.35, base + 30, C.red, { size: 10, align: 'center' });
      }
      label(c, 'Quota: ' + S.q + ' of ' + tot + ' votes', w - 22, h - 26, C.muted, { size: 11, align: 'right' });
    }
    inputs(); sync(); L.loop(frame, cv);
  })();

  /* missions (registered last so that every piece can report wins) */
  var MIS = [
    { id: 'allorders', title: 'Every order', goal: 'Run through all 6 orders of arrival in any three-player game.' },
    { id: 'gloves', title: 'The scarce glove', goal: 'Complete all orders in the glove game and see what the left glove is worth.' },
    { id: 'dummy', title: 'A free rider gets nothing', goal: 'Edit a game so that one player adds nothing to any coalition.' },
    { id: 'empty', title: 'No stable split', goal: 'Find a game whose core is empty.' },
    { id: 'outside', title: 'Fair but not stable', goal: 'Edit a game whose core is not empty but doesn’t contain the Shapley value.' },
    { id: 'inside', title: 'Into the core', goal: 'In the triangle below, drag a split into a core with more than one point.' }
  ];
  mis = L.missions($('gt13-missions'), 'gt13', MIS, function (id) {
    if (id === 'gloves' || id === 'allorders') build('gloves'); else if (id === 'empty') build('merger'); else if (id === 'inside') { build('merger'); var t = $('gt13-tview'); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
    else { build('custom'); }
    L.toast(view, MIS.filter(function (m) { return m.id === id; })[0].goal);
  });
  listeners.forEach(function (f) { f(); });
})(window, document);
