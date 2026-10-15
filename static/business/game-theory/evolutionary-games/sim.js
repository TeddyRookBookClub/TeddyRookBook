/* Game Theory, Chapter 14: Evolutionary Game Theory. Three interactive pieces:
   1. hawks and doves under the replicator dynamics or in a population of 200 birds (main simulation, with missions),
   2. the spatial prisoner's dilemma of Nowak and May, 3. rock–paper–scissors cycles.
   The models are in model.js (window.GT14M), tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, M = W.GT14M, root = D.getElementById('gt14-lab');
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
  function celebrate(view, text) { L.toast(view, text); if (!reduced) { view.classList.remove('gt14-win'); void view.offsetWidth; view.classList.add('gt14-win'); } }
  /* seeded random numbers, so a "new round" button can be replayed in tests */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }


  /* =====================================================================================
     1. HAWKS AND DOVES
     ===================================================================================== */
  (function () {
    var view = $('gt14-view'), cv = $('gt14-cv'), hud = $('gt14-hud'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, NB = 200, R = rng(1973);
    var el = { V: $('gt14-V'), VO: $('gt14-V-o'), C: $('gt14-C'), CO: $('gt14-C-o'), x0: $('gt14-x0'), x0O: $('gt14-x0-o'), mode: $('gt14-mode'), sp: $('gt14-sp'), spO: $('gt14-sp-o'),
      go: $('gt14-go'), addH: $('gt14-addh'), addD: $('gt14-addd'), read: $('gt14-read'), pause: $('gt14-pause'), reset: $('gt14-reset'), pre: $('gt14-pre') };
    var P = { V: 2, C: 4, x0: 0.1, mode: 'rep', sp: 2 };
    var S = { x: 0.1, t: 0, hist: [], paused: false, pop: null, birds: [], acc: 0, mutatedFromZero: false, hudTxt: '', spark: [] };
    for (var i = 0; i < NB; i++) S.birds.push({ x: R(), y: R(), a: R() * 6.283, hawk: 0, show: 0 });
    function restart(x0) {
      S.x = x0; S.x0 = x0; S.t = 0; S.hist = [[0, x0]]; S.mutatedFromZero = false; S.pop = new M.Pop(NB, x0, R);
      if (P.mode === 'pop') S.x = S.pop.share(); sync();
    }
    function mutate(dh) {
      var before = S.x;
      if (P.mode === 'rep') S.x = clamp(S.x + dh, 0, 1);
      else { var k = Math.round(Math.abs(dh) * NB); for (var i = 0; i < S.pop.n && k > 0; i++) { var j = Math.floor(R() * S.pop.n); if (S.pop.s[j] !== (dh > 0 ? 1 : 0)) { S.pop.s[j] = dh > 0 ? 1 : 0; k--; } } S.x = S.pop.share(); }
      if (dh > 0 && before < 0.005) S.mutatedFromZero = true; S.hist.push([S.t, S.x]);
    }
    function sync() {
      el.V.value = P.V; el.VO.textContent = fmt(P.V, 1); el.C.value = P.C; el.CO.textContent = fmt(P.C, 1); el.x0.value = Math.round(P.x0 * 100); el.x0O.textContent = Math.round(P.x0 * 100) + '%';
      el.sp.value = P.sp; el.spO.textContent = fmt(P.sp, 1) + '×'; seg(el.mode, 'data-m', P.mode);
      var key = null; [['classic', 2, 4], ['cheap', 4, 2], ['costly', 2, 12]].forEach(function (q) { if (P.V === q[1] && P.C === q[2]) key = q[0]; }); seg(el.pre, 'data-p', key);
      var p = M.hdPay(S.x, P.V, P.C), ess = M.hdESS(P.V, P.C);
      readout(el.read, [['Hawks now', pct(S.x, 1)], ['Stable mix (V/C, or all hawks)', pct(ess, 1)], ['Hawk payoff / dove payoff', fmt(p.H, 2) + ' / ' + fmt(p.D, 2)], ['Average payoff now', fmt(p.avg, 2)], ['Average in an all-dove world', fmt(P.V / 2, 2)], ['Time', fmt(S.t, 1)]]);
      var t = '<b>Hawk–dove</b> · prize V = ' + fmt(P.V, 1) + ', cost of losing a fight C = ' + fmt(P.C, 1) + '<br>' + (P.mode === 'rep' ? 'replicator equation (a very large population)' : '200 birds that copy more successful birds');
      if (t !== S.hudTxt) { hud.innerHTML = t; S.hudTxt = t; }
    }
    function setPause(p) { S.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
    el.V.addEventListener('input', function () { P.V = +el.V.value; sync(); });
    el.C.addEventListener('input', function () { P.C = +el.C.value; sync(); });
    el.x0.addEventListener('input', function () { P.x0 = +el.x0.value / 100; sync(); });
    el.sp.addEventListener('input', function () { P.sp = +el.sp.value; sync(); });
    el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; P.mode = b.dataset.m; restart(S.x); });
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (!b) return; var q = { classic: [2, 4], cheap: [4, 2], costly: [2, 12] }[b.dataset.p]; P.V = q[0]; P.C = q[1]; restart(P.x0); setPause(false); });
    el.go.addEventListener('click', function () { restart(P.x0); setPause(false); });
    el.addH.addEventListener('click', function () { mutate(0.03); sync(); });
    el.addD.addEventListener('click', function () { mutate(-0.03); sync(); });
    el.pause.addEventListener('click', function () { setPause(!S.paused); });
    el.reset.addEventListener('click', function () { restart(P.x0); });
    cv.addEventListener('keydown', function (e) { var k = e.key, used = true; if (k === ' ') setPause(!S.paused); else if (k === 'h' || k === 'H') { mutate(0.03); sync(); } else if (k === 'd' || k === 'D') { mutate(-0.03); sync(); } else if (k === 'r' || k === 'R') restart(P.x0); else used = false; if (used) e.preventDefault(); });

    var MIS = [
      { id: 'balance', title: 'Find the balance', goal: 'With fights costlier than the prize, let the hawk share settle within 2 points of V/C.' },
      { id: 'invade', title: 'Hawks invade', goal: 'Start with 2% hawks or fewer (fights costlier than the prize) and watch hawks pass 20%.' },
      { id: 'rest', title: 'Stuck, but not stable', goal: 'Start with no hawks at all, then add a few and watch the population leave.' },
      { id: 'allhawk', title: 'A world of hawks', goal: 'Make the prize worth at least the cost of fighting and reach 98% hawks.' },
      { id: 'peace', title: 'Mostly peaceful', goal: 'Settle at a stable mix with fewer than 20% hawks.' },
      { id: 'waste', title: 'Evolution isn’t kind', goal: 'Settle where the average payoff is less than half what an all-dove world would get.' }
    ];
    var mis = L.missions($('gt14-missions'), 'gt14', MIS, function (id) {
      if (id === 'invade') { P.V = 2; P.C = 4; P.x0 = 0.01; } else if (id === 'rest') { P.V = 2; P.C = 4; P.x0 = 0; } else if (id === 'allhawk') { P.V = 4; P.C = 2; P.x0 = 0.1; } else if (id === 'peace') { P.V = 2; P.C = 4; P.x0 = 0.5; } else if (id === 'waste') { P.V = 2; P.C = 4; P.x0 = 0.1; } else { P.V = 2; P.C = 4; P.x0 = 0.1; }
      restart(P.x0); setPause(false); L.toast(view, MIS.filter(function (m) { return m.id === id; })[0].goal);
    });
    function win(id, text) { if (mis.done(id)) celebrate(view, '✓ ' + text); }
    function check() {
      var ess = M.hdESS(P.V, P.C), near = Math.abs(S.x - ess) < 0.02, settled = S.t > 4 && near;
      if (P.C > P.V && settled) win('balance', 'Balanced: at V/C hawks and doves earn exactly the same.');
      if (P.C > P.V && S.x0 <= 0.02 + 1e-9 && S.x > 0.2) win('invade', 'Invaded! A hawk among doves wins every fight it picks.');
      if (S.mutatedFromZero && S.x > 0.1 && P.C > P.V) win('rest', 'All doves was a rest point, but an unstable one: a few hawks were enough.');
      if (P.V >= P.C && S.x >= 0.98) win('allhawk', 'All hawks: when the prize is worth the fight, fighting takes over.');
      if (P.C > P.V && settled && ess < 0.2) win('peace', 'Costly fights keep the peace: the stable mix has few hawks.');
      if (P.C > P.V && settled && M.hdPay(S.x, P.V, P.C).avg < 0.5 * P.V / 2) win('waste', 'Everyone would be better off as doves, yet the mix is stable.');
    }
    function bird(x, y, a, hawk, sz) {
      c.save(); c.translate(x, y); c.rotate(a);
      if (hawk > 0.5) { c.fillStyle = C.red; c.beginPath(); c.moveTo(sz * 1.3, 0); c.lineTo(-sz, sz * 0.9); c.lineTo(-sz * 0.5, 0); c.lineTo(-sz, -sz * 0.9); c.closePath(); c.fill(); }
      else { c.fillStyle = '#e7f5ff'; c.beginPath(); c.ellipse(0, 0, sz * 1.1, sz * 0.75, 0, 0, 7); c.fill(); c.fillStyle = C.blue; c.beginPath(); c.arc(sz * 0.8, 0, sz * 0.45, 0, 7); c.fill(); }
      c.restore();
    }
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 620; bg(c, w, h);
      if (!S.paused) {
        var simDt = dt * P.sp;
        if (P.mode === 'rep') { var sub = 4; for (var k = 0; k < sub; k++) S.x = M.hdStep(S.x, P.V, P.C, simDt / sub); S.t += simDt; }
        else { S.acc += simDt * 4; while (S.acc >= 1) { S.acc -= 1; S.x = S.pop.round(P.V, P.C, 4, 0.25); S.t += 0.25; } }
        if (!S.hist.length || S.t - S.hist[S.hist.length - 1][0] > 0.05) S.hist.push([S.t, S.x]); if (S.hist.length > 4000) S.hist.splice(0, S.hist.length - 4000);
        check(); if (Math.random() < 0.2) sync();
      }
      var top = narrow ? 114 : 62;
      var A = narrow ? { x: 10, y: top, w: w - 20, h: 220 } : { x: 10, y: top, w: w * 0.5 - 15, h: h - top - 10 };
      var B = narrow ? { x: 10, y: A.y + A.h + 8, w: w - 20, h: 200 } : { x: w * 0.5 + 5, y: top, w: w * 0.5 - 15, h: (h - top - 18) / 2 };
      var Cb = narrow ? { x: 10, y: B.y + B.h + 8, w: w - 20, h: h - B.y - B.h - 18 } : { x: w * 0.5 + 5, y: B.y + B.h + 8, w: w * 0.5 - 15, h: (h - top - 18) / 2 };
      // the meadow
      panelBox(c, A.x, A.y, A.w, A.h, 'THE MEADOW · ' + Math.round(S.x * 100) + '% HAWKS');
      var mx = A.x + 10, my = A.y + 26, mw = A.w - 20, mh = A.h - 36, sz = narrow ? 4 : 5;
      var g = c.createRadialGradient(mx + mw / 2, my + mh / 2, 10, mx + mw / 2, my + mh / 2, Math.max(mw, mh) * 0.7); g.addColorStop(0, 'rgba(99,230,190,.07)'); g.addColorStop(1, 'rgba(99,230,190,0)'); c.fillStyle = g; c.fillRect(mx, my, mw, mh);
      var nh = P.mode === 'rep' ? Math.round(S.x * NB) : 0;
      S.birds.forEach(function (b, i) {
        var want = P.mode === 'rep' ? (i < nh ? 1 : 0) : S.pop.s[i];
        b.show += (want - b.show) * (reduced ? 1 : Math.min(1, dt * 4));
        if (!reduced && !S.paused) { b.a += (Math.random() - 0.5) * 2.4 * dt; var spd = (b.show > 0.5 ? 0.09 : 0.05) * dt; b.x += Math.cos(b.a) * spd; b.y += Math.sin(b.a) * spd * mw / mh; if (b.x < 0.02 || b.x > 0.98) { b.a = Math.PI - b.a; b.x = clamp(b.x, 0.02, 0.98); } if (b.y < 0.03 || b.y > 0.97) { b.a = -b.a; b.y = clamp(b.y, 0.03, 0.97); } }
        bird(mx + b.x * mw, my + b.y * mh, b.a, b.show, sz);
      });
      if (!reduced && !S.paused && Math.random() < 0.25) { var a1 = S.birds[Math.floor(Math.random() * NB)], a2 = S.birds[Math.floor(Math.random() * NB)]; if (a1.show > 0.5 && a2.show > 0.5) S.spark.push({ x: mx + a1.x * mw, y: my + a1.y * mh, t: 0 }); }
      S.spark = S.spark.filter(function (s) { s.t += dt; if (s.t < 0.5) { c.save(); c.globalAlpha = 1 - s.t * 2; c.strokeStyle = C.gold; c.lineWidth = 1.5; for (var q = 0; q < 6; q++) { var an = q * 1.047; c.beginPath(); c.moveTo(s.x + Math.cos(an) * 4, s.y + Math.sin(an) * 4); c.lineTo(s.x + Math.cos(an) * (6 + 14 * s.t), s.y + Math.sin(an) * (6 + 14 * s.t)); c.stroke(); } c.restore(); } return s.t < 0.5; });
      // hawk share over time
      panelBox(c, B.x, B.y, B.w, B.h, 'SHARE OF HAWKS OVER TIME');
      var tmax = Math.max(10, S.t), tmin = Math.max(0, tmax - 60);
      var pl = plot(c, { x: B.x + 44, y: B.y + 30, w: B.w - 58, h: B.h - 50 }, [tmin, tmax], [0, 1], { nx: 4, ny: 4, yf: function (t) { return pct(t); }, xl: 'time' });
      var ess = M.hdESS(P.V, P.C); line(c, [[pl.b.x, pl.Y(ess)], [pl.b.x + pl.b.w, pl.Y(ess)]], C.gold, 1.5, [5, 4]); label(c, 'stable mix', pl.b.x + 4, pl.Y(ess) - 8, C.gold, { size: 10 });
      line(c, S.hist.filter(function (p) { return p[0] >= tmin; }).map(function (p) { return [pl.X(p[0]), pl.Y(p[1])]; }), C.red, 2.5);
      // payoffs against the hawk share, with the flow on the axis
      panelBox(c, Cb.x, Cb.y, Cb.w, Cb.h, 'PAYOFFS FOR EACH SHARE OF HAWKS');
      var lo = Math.min(0, (P.V - P.C) / 2), hi = Math.max(P.V, P.V / 2);
      var p2 = plot(c, { x: Cb.x + 44, y: Cb.y + 30, w: Cb.w - 58, h: Cb.h - 86 }, [0, 1], [lo - 0.1, hi + 0.2], { nx: 4, ny: 4, xf: function (t) { return pct(t); }, xl: 'share of hawks' });
      var ph = [], pd = [], pa = []; for (var x = 0; x <= 1.0001; x += 0.02) { var p = M.hdPay(x, P.V, P.C); ph.push([p2.X(x), p2.Y(p.H)]); pd.push([p2.X(x), p2.Y(p.D)]); pa.push([p2.X(x), p2.Y(p.avg)]); }
      line(c, [[p2.b.x, p2.Y(0)], [p2.b.x + p2.b.w, p2.Y(0)]], 'rgba(255,255,255,.2)', 1);
      line(c, pa, 'rgba(255,255,255,.45)', 1.5, [3, 4]); line(c, ph, C.red, 2.5); line(c, pd, C.blue, 2.5);
      var pc = M.hdPay(S.x, P.V, P.C); dot(c, p2.X(S.x), p2.Y(pc.H), 5, C.red, { ring: '#fff', lw: 1.5 }); dot(c, p2.X(S.x), p2.Y(pc.D), 5, C.blue, { ring: '#fff', lw: 1.5 });
      // flow arrows under the axis
      var ay = p2.b.y + p2.b.h + 22;
      for (var q = 0.05; q < 1; q += 0.1) { var f = M.hdDot(q, P.V, P.C); if (Math.abs(f) < 1e-4) continue; var xx = p2.X(q); arrow(c, xx - (f > 0 ? 7 : -7), ay, xx + (f > 0 ? 7 : -7), ay, 'rgba(219,231,239,.6)', { width: 1.5, head: 4 }); }
      M.hdRest(P.V, P.C).forEach(function (r) { dot(c, p2.X(r.x), ay, 5, r.stable ? C.gold : '#06111a', { ring: C.gold, lw: 2 }); });
      label(c, '— hawk  — dove  - - average   ● stable  ○ unstable', Cb.x + 10, Cb.y + Cb.h - 9, C.muted, { size: 10, max: Cb.w - 20 });
    }
    restart(P.x0); L.loop(frame, cv);
  })();

  /* =====================================================================================
     2. THE SPATIAL PRISONER'S DILEMMA
     ===================================================================================== */
  (function () {
    var cv = $('gt14-gc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, N = 99, R = rng(1992), grid = new M.Grid(N), off = D.createElement('canvas'); off.width = N; off.height = N;
    var oc = off.getContext('2d'), img = oc.createImageData(N, N);
    var el = { b: $('gt14-b'), bO: $('gt14-b-o'), start: $('gt14-start'), play: $('gt14-gplay'), step: $('gt14-gstep'), sp: $('gt14-gsp'), spO: $('gt14-gsp-o'), read: $('gt14-gread') };
    var S = { b: 1.85, start: 'one', playing: true, sp: 6, acc: 0, hist: [], box: null };
    function restart() { grid.fill(S.start === 'one' ? 'one' : 'rand', R, S.start === 'r10' ? 0.1 : 0.5); S.hist = [grid.coop()]; S.acc = 0; paint(); sync(); }
    function sync() {
      el.b.value = S.b; el.bO.textContent = fmt(S.b, 2); seg(el.start, 'data-s', S.start); el.sp.value = S.sp; el.spO.textContent = S.sp + ' per second';
      el.play.textContent = S.playing ? '❚❚ Pause' : '▶ Play';
      readout(el.read, [['Generation', String(grid.gen)], ['Cooperators', pct(grid.coop(), 1)], ['Temptation b', fmt(S.b, 2)]]);
    }
    function paint() {
      var d = img.data, s = grid.s, pv = grid.prev;
      for (var i = 0; i < N * N; i++) { var col = s[i] ? (pv[i] ? [56, 132, 255] : [72, 214, 126]) : (pv[i] ? [255, 214, 72] : [235, 70, 70]); d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255; }
      oc.putImageData(img, 0, 0);
    }
    el.b.addEventListener('input', function () { S.b = +el.b.value; sync(); });
    el.start.addEventListener('click', function (e) { var b = e.target.closest('button[data-s]'); if (!b) return; S.start = b.dataset.s; restart(); });
    el.play.addEventListener('click', function () { S.playing = !S.playing; sync(); });
    el.step.addEventListener('click', function () { S.playing = false; grid.step(S.b); S.hist.push(grid.coop()); paint(); sync(); });
    el.sp.addEventListener('input', function () { S.sp = +el.sp.value; sync(); });
    $('gt14-grestart').addEventListener('click', restart);
    drag(cv, function (x, y) { if (!S.box) return null; var b = S.box; return x >= b.x && x < b.x + b.s && y >= b.y && y < b.y + b.s ? 1 : null; }, function (t, x, y) {
      var b = S.box, gx = Math.floor((x - b.x) / b.s * N), gy = Math.floor((y - b.y) / b.s * N); if (gx < 0 || gy < 0 || gx >= N || gy >= N) return; var k = gy * N + gx; grid.s[k] = 0; grid.prev[k] = 0; paint();
    });
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 640; bg(c, w, h);
      if (S.playing) { S.acc += dt * S.sp; var n = 0; while (S.acc >= 1 && n < 4) { S.acc -= 1; grid.step(S.b); S.hist.push(grid.coop()); n++; } if (n) { paint(); sync(); } if (S.hist.length > 600) S.hist.splice(0, S.hist.length - 600); }
      var gs = narrow ? Math.min(w - 20, h - 150) : Math.min(h - 20, w * 0.62), gx = narrow ? (w - gs) / 2 : 10, gy = 10;
      gs = Math.floor(gs / N) * N || gs; S.box = { x: gx, y: gy, s: gs };
      c.imageSmoothingEnabled = false; c.drawImage(off, gx, gy, gs, gs); c.imageSmoothingEnabled = true;
      var B = narrow ? { x: 10, y: gy + gs + 10, w: w - 20, h: h - gs - 30 } : { x: gx + gs + 12, y: 10, w: w - gs - 32, h: h - 20 };
      panelBox(c, B.x, B.y, B.w, B.h, 'COOPERATORS OVER TIME');
      var pl = plot(c, { x: B.x + 40, y: B.y + 30, w: B.w - 54, h: B.h - (narrow ? 50 : 150) }, [0, Math.max(50, S.hist.length - 1)], [0, 1], { nx: 3, ny: 4, yf: function (t) { return pct(t); }, xl: 'generation' });
      line(c, S.hist.map(function (v, i) { return [pl.X(i), pl.Y(v)]; }), C.blue, 2);
      if (!narrow) {
        var ly = B.y + B.h - 104, items = [['cooperator, stayed', 'rgb(56,132,255)'], ['defector, stayed', 'rgb(235,70,70)'], ['just turned defector', 'rgb(255,214,72)'], ['just turned cooperator', 'rgb(72,214,126)']];
        items.forEach(function (it, i) { c.fillStyle = it[1]; c.fillRect(B.x + 12, ly + i * 20, 12, 12); label(c, it[0], B.x + 30, ly + i * 20 + 6, C.ink, { size: 11, max: B.w - 40 }); });
        label(c, 'Tap or drag on the grid to add defectors.', B.x + 12, B.y + B.h - 14, C.muted, { size: 10.5, max: B.w - 20 });
      }
    }
    restart(); L.loop(frame, cv);
  })();

  /* =====================================================================================
     3. ROCK–PAPER–SCISSORS
     ===================================================================================== */
  (function () {
    var cv = $('gt14-rc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, NAMES = ['Orange', 'Yellow', 'Blue'], COLS = ['#ffa94d', '#ffe066', '#74c0fc'];
    var el = { w: $('gt14-w'), wO: $('gt14-w-o'), read: $('gt14-rread'), clr: $('gt14-rclr') };
    var S = { w: 1, x: [0.6, 0.25, 0.15], trails: [], t: 0, hist: [], tri: null };
    function sync() {
      el.w.value = S.w; el.wO.textContent = fmt(S.w, 2) + (Math.abs(S.w - 1) < 1e-9 ? ' (equal to a loss)' : S.w > 1 ? ' (wins count more)' : ' (losses hurt more)');
      readout(el.read, [['Orange / yellow / blue', S.x.map(function (v) { return pct(v, 0); }).join(' / ')], ['Product of the shares', fmt(S.x[0] * S.x[1] * S.x[2], 4) + (Math.abs(S.w - 1) < 1e-9 ? ' (stays constant)' : '')]]);
    }
    function startAt(x) { S.x = x; S.trails.push([]); if (S.trails.length > 5) S.trails.shift(); S.hist = []; S.t = 0; }
    el.w.addEventListener('input', function () { S.w = +el.w.value; sync(); });
    el.clr.addEventListener('click', function () { S.trails = [[]]; startAt([0.6, 0.25, 0.15]); sync(); });
    function toXY(x) { var t = S.tri; return [x[0] * t[0][0] + x[1] * t[1][0] + x[2] * t[2][0], x[0] * t[0][1] + x[1] * t[1][1] + x[2] * t[2][1]]; }
    function fromXY(px, py) { var t = S.tri, x1 = t[0][0], y1 = t[0][1], x2 = t[1][0], y2 = t[1][1], x3 = t[2][0], y3 = t[2][1], d = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3), a = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / d, b = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / d; return [a, b, 1 - a - b]; }
    cv.addEventListener('pointerdown', function (e) { if (!S.tri) return; var r = cv.getBoundingClientRect(), l = fromXY(e.clientX - r.left, e.clientY - r.top); if (l.every(function (v) { return v > 0.005; })) { startAt(l); sync(); } });
    cv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var r = rng(Date.now() & 0xffff); var a = 0.1 + 0.6 * r(), b2 = (1 - a) * (0.2 + 0.6 * r()); startAt([a, b2, 1 - a - b2]); sync(); e.preventDefault(); } });
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 640; bg(c, w, h);
      var A = M.rpsMatrix(S.w, 1), n = reduced ? 1 : 6;
      for (var k = 0; k < n; k++) { S.x = M.repStep(A, S.x, dt * 2 / n); }
      S.t += dt * 2; var tr = S.trails[S.trails.length - 1]; if (tr) { tr.push(S.x.slice()); if (tr.length > 3000) tr.shift(); }
      S.hist.push([S.t, S.x.slice()]); if (S.hist.length > 900) S.hist.shift();
      if (Math.random() < 0.1) sync();
      var side = narrow ? Math.min(w - 60, (h * 0.55 - 50) * 1.1547) : Math.min(w * 0.5 - 40, (h - 80) * 1.1547), cx = narrow ? w / 2 : 10 + (w * 0.5) / 2, ty = 36, th = side * 0.866;
      S.tri = [[cx, ty], [cx - side / 2, ty + th], [cx + side / 2, ty + th]];
      var t3 = S.tri; c.beginPath(); c.moveTo(t3[0][0], t3[0][1]); c.lineTo(t3[1][0], t3[1][1]); c.lineTo(t3[2][0], t3[2][1]); c.closePath(); c.fillStyle = 'rgba(255,255,255,.03)'; c.fill(); c.strokeStyle = 'rgba(219,231,239,.45)'; c.lineWidth = 1.5; c.stroke();
      // faint flow arrows
      for (var i = 1; i < 10; i++) for (var j = 1; j < 10 - i; j++) { var x = [i / 10, j / 10, 1 - i / 10 - j / 10]; if (x[2] <= 0.02) continue; var d = M.repDot(A, x), p0 = toXY(x), p1 = toXY([x[0] + d[0] * 0.5, x[1] + d[1] * 0.5, x[2] + d[2] * 0.5]); arrow(c, p0[0], p0[1], p1[0], p1[1], 'rgba(143,179,198,.35)', { width: 1, head: 3 }); }
      S.trails.forEach(function (trl, k2) { line(c, trl.map(toXY), k2 === S.trails.length - 1 ? C.gold : 'rgba(255,212,121,.3)', 2); });
      var pt = toXY(S.x); dot(c, pt[0], pt[1], 6, '#fff', { glow: 10 });
      dot(c, toXY([1 / 3, 1 / 3, 1 / 3])[0], toXY([1 / 3, 1 / 3, 1 / 3])[1], 3, C.muted);
      [0, 1, 2].forEach(function (k3) { var p = t3[k3]; label(c, 'all ' + NAMES[k3].toLowerCase(), p[0] + (k3 === 1 ? -6 : k3 === 2 ? 6 : 0), p[1] + (k3 === 0 ? -12 : 14), COLS[k3], { size: 11.5, bold: true, align: k3 === 0 ? 'center' : k3 === 1 ? 'left' : 'right' }); });
      label(c, 'Tap inside the triangle to start from there', cx, ty + th + 34, C.muted, { size: 10.5, align: 'center' });
      var B = narrow ? { x: 10, y: ty + th + 50, w: w - 20, h: h - ty - th - 60 } : { x: w * 0.5 + 10, y: 10, w: w * 0.5 - 20, h: h - 20 };
      panelBox(c, B.x, B.y, B.w, B.h, 'SHARES OVER TIME');
      var tmin = S.hist.length ? S.hist[0][0] : 0, tmax = Math.max(tmin + 1, S.t);
      var pl = plot(c, { x: B.x + 40, y: B.y + 30, w: B.w - 54, h: B.h - 56 }, [tmin, tmax], [0, 1], { nx: 3, ny: 4, yf: function (t) { return pct(t); }, noXLabels: true, xl: 'time' });
      [0, 1, 2].forEach(function (k4) { line(c, S.hist.map(function (q) { return [pl.X(q[0]), pl.Y(q[1][k4])]; }), COLS[k4], 2); label(c, NAMES[k4], B.x + 14 + k4 * 70, B.y + B.h - 12, COLS[k4], { size: 11, bold: true }); });
    }
    startAt(S.x); sync(); L.loop(frame, cv);
  })();
})(window, document);
