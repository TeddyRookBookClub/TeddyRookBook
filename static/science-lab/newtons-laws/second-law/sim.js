/* Newton's Laws, Chapter 2 (F = ma): the page. A cart on a track with a force probe and live strip charts (main simulation),
   a hammer and a feather falling in air, in a vacuum and on the Moon, a skydiver, a tug-of-war and a v–t graph to drag.
   The physics is in physics.js (window.NL2Phys), in SI units. */
(function () {
  'use strict';
  var LAB = window.TRBLab, P = window.NL2Phys;
  var root = document.getElementById('nl2-lab');
  if (!root || !LAB || !P) return;
  function $(id) { return document.getElementById(id); }
  var fmt = LAB.fmt, reduced = LAB.reduced, G = P.G;
  var C = { bg: '#06111a', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', faint: 'rgba(120,170,200,.12)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', white: '#ffffff', violet: '#b197fc', lime: '#c0eb75', cyan: '#66d9e8' };
  // force colors shared across the unit: applied push green, net force gold, friction red, weight pink, normal force blue, tension violet, air drag lime
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function arrow(ctx, x1, y1, x2, y2, col, w, head) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); if (L < 1) return;
    var hd = Math.min(head || 10, L * 0.6), ux = dx / L, uy = dy / L;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * hd * 0.7, y2 - uy * hd * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - ux * hd - uy * hd * 0.5, y2 - uy * hd + ux * hd * 0.5); ctx.lineTo(x2 - ux * hd + uy * hd * 0.5, y2 - uy * hd - ux * hd * 0.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function txt(ctx, s, x, y, col, font, align) { ctx.fillStyle = col; ctx.font = font || '12px system-ui,sans-serif'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); }
  function pressSeg(group, attr, val) { group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-' + attr) === String(val))); }); }
  function niceMax(v) { var s = [0.5, 1, 2, 5, 10, 20, 50, 100]; for (var i = 0; i < s.length; i++) if (v <= s[i]) return s[i]; return Math.ceil(v / 100) * 100; }
  var toastQ = [], toastAt = -10;
  function sayIn(v, text) { toastQ.push([v, text]); pump(); }
  function pump() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.8) { toastAt = now; var q = toastQ.shift(); LAB.toast(q[0], q[1]); } }
  setInterval(pump, 400);
  function ensureVisible(v) { var r = v.getBoundingClientRect(), H = window.innerHeight || 800, seen = Math.min(r.bottom, H) - Math.max(r.top, 0); if (seen < 0.7 * Math.min(r.height, H)) v.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }

  // =====================================================================================
  // 1. The cart, the force probe and the strip charts
  // =====================================================================================
  var view = $('nl2-view'), cv = $('nl2-cv'), K = LAB.canvas(cv), ctx = K.c;
  var MU_S = 0.5, MU_K = 0.3, X0 = 0.5, XMIN = 0.2, XMAX = 3.8, LINE = 3.0, CARTW = 0.32;
  var S = { m: 1, fric: false, Fset: 0, motor: false, hand: 0, key: 0, paused: false, cart: null, hist: [], acc: 0, drag: null, steady: null, log: [], race: null, still: 0, flash: 0, bal: 0, moved: false, touched: false };
  var el = { mass: $('nl2-mass'), fric: $('nl2-fric'), F: $('nl2-F'), FO: $('nl2-F-o'), motor: $('nl2-motor'), read: $('nl2-read'), hud: $('nl2-hud'), pause: $('nl2-pause'), reset: $('nl2-reset'), race: $('nl2-race') };

  var MISSIONS = [
    { id: 'newton', title: 'Feel a newton', goal: 'With the 1 kg cart and no friction, push steadily with 1.0 N. What acceleration do you get?' },
    { id: 'heavy', title: 'Heavy and quick', goal: 'Load the cart to 4 kg and make it accelerate at 2 m/s² or more.' },
    { id: 'half', title: 'Double the mass', goal: 'With no friction, push one mass steadily, then push twice the mass with the same force. Compare the accelerations.' },
    { id: 'balance', title: 'Balanced forces', goal: 'With friction on, keep the cart moving faster than 0.2 m/s at a steady speed for 2 s.' },
    { id: 'line', title: 'Stop on the line', goal: 'Bring the cart to rest with its middle within 2 cm of the red line at 3.00 m.' },
    { id: 'graph', title: 'Match the graph', goal: 'Press “Match the graph” and push so the cart’s velocity follows the dashed line for 6 s.' }
  ];
  var TITLE = {}; MISSIONS.forEach(function (m) { TITLE[m.id] = m.title; });
  var PICK = {
    newton: function () { setup(1, false, 0, false); sayIn(view, 'Set the push to 1.0 N, then switch on the steady push.'); },
    heavy: function () { setup(4, false, 0, false); sayIn(view, '4 kg now. How big a push makes 2 m/s²?'); },
    half: function () { setup(1, false, 2, false); sayIn(view, 'Switch on the steady push, then try 2 kg with the same 2.0 N.'); },
    balance: function () { setup(1, true, 3, false); sayIn(view, 'Drag the cart to get it going, then let the steady push match the friction.'); },
    line: function () { setup(2, false, 0, false); sayIn(view, 'Drag the cart toward the red line, then pull back to stop it there.'); },
    graph: function () { setup(1, false, 0.4, false); startRace(); }
  };
  var MS = LAB.missions($('nl2-missions'), 'nl-second-law', MISSIONS, function (id) { toastQ = []; toastAt = -10; S.touched = true; if (PICK[id]) PICK[id](); ensureVisible(view); });
  function win(id, text) { if (MS.done(id)) { sayIn(view, '✓ ' + TITLE[id] + '! ' + text); S.flash = 1; } }

  function newCart() {
    S.cart = new P.Cart({ m: S.m, muS: S.fric ? MU_S : 0, muK: S.fric ? MU_K : 0, x: X0, xMin: XMIN, xMax: XMAX });
    S.hist = []; S.acc = 0; S.steady = null; S.still = 0; S.bal = 0; S.moved = false; S.race = null; el.race.textContent = 'Match the graph';
  }
  function setup(m, fric, F, motor) { S.m = m; S.fric = fric; S.Fset = F; S.motor = motor; syncForm(); newCart(); }
  function syncForm() {
    pressSeg(el.mass, 'm', S.m); el.fric.checked = S.fric; el.F.value = S.Fset; el.motor.checked = S.motor;
    el.FO.textContent = fmt(S.Fset, 2) + ' N';
  }
  function applyLive() { var c = S.cart; c.m = S.m; c.muS = S.fric ? MU_S : 0; c.muK = S.fric ? MU_K : 0; S.steady = null; S.bal = 0; }
  el.mass.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.m = +b.dataset.m; pressSeg(el.mass, 'm', S.m); applyLive(); });
  el.fric.addEventListener('change', function () { S.fric = el.fric.checked; applyLive(); });
  el.F.addEventListener('input', function () { S.Fset = +el.F.value; el.FO.textContent = fmt(S.Fset, 2) + ' N'; S.touched = true; });
  el.motor.addEventListener('change', function () { S.motor = el.motor.checked; S.touched = true; });
  el.pause.addEventListener('click', function () { S.paused = !S.paused; el.pause.textContent = S.paused ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', S.paused ? 'Play' : 'Pause'); });
  el.reset.addEventListener('click', function () { S.motor = false; el.motor.checked = false; newCart(); });
  el.race.addEventListener('click', function () { if (S.race) { S.race = null; el.race.textContent = 'Match the graph'; } else startRace(); });
  function startRace() {
    S.motor = false; el.motor.checked = false; S.cart.x = X0; S.cart.v = 0; S.hist = []; S.race = { t: -2, n: 0, err: 0 }; el.race.textContent = 'Stop the match';
    sayIn(view, 'Get ready: follow the dashed line. Speed up for 2 s, hold 0.8 m/s for 2 s, slow to a stop in 2 s.');
  }
  function target(t) { return t < 0 ? 0 : t < 2 ? 0.4 * t : t < 4 ? 0.8 : t < 6 ? 0.8 - 0.4 * (t - 4) : 0; }
  cv.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowLeft') { S.key = (k === 'ArrowRight' ? 1 : -1) * Math.max(1, Math.abs(S.Fset)); S.touched = true; e.preventDefault(); }
    else if (k === ' ') { S.motor = !S.motor; el.motor.checked = S.motor; e.preventDefault(); }
    else if (k === 'r' || k === 'R') { newCart(); e.preventDefault(); }
  });
  cv.addEventListener('keyup', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { S.key = 0; e.preventDefault(); } });
  cv.addEventListener('blur', function () { S.key = 0; });

  // ---- layout ----
  var L = {};
  function layout() {
    var W = K.w, H = K.h, th = clamp(H * 0.4, 170, 250);
    L = { W: W, H: H, th: th, sc: (W - 40) / 4.2, x0: 20, ground: th - 34, charts: { top: th + 4, h: H - th - 8 } };
  }
  function X(x) { return L.x0 + (x + 0.1) * L.sc; }
  function handForce(px) {
    var d = px - X(S.cart.x), dead = CARTW / 2 * L.sc + 8;
    if (Math.abs(d) <= dead) return 0;
    return Math.sign(d) * Math.min(20, (Math.abs(d) - dead) * 10 / 110);
  }
  function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  cv.addEventListener('pointerdown', function (e) { var p = ptr(e); if (p.y > L.th) return; S.drag = p; S.touched = true; cv.setPointerCapture(e.pointerId); e.preventDefault(); });
  cv.addEventListener('pointermove', function (e) { var p = ptr(e); if (S.drag) S.drag = p; else cv.style.cursor = p.y < L.th ? 'grab' : 'default'; });
  function up() { S.drag = null; }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  // ---- stepping ----
  function Fapp() { return (S.motor ? S.Fset : 0) + S.hand + S.key; }
  function stepCart(dt) {
    var c = S.cart, h = 1 / 600, n = Math.round(dt / h), F;
    S.hand = S.drag ? handForce(S.drag.x) : 0;
    for (var i = 0; i < n; i++) {
      F = Fapp();
      var ev = c.step(h, F);
      if (ev === 'bump') { S.steady = null; S.bal = 0; }
    }
    if (Math.abs(c.x - X0) > 0.05) S.moved = true;
    S.hist.push({ t: c.t, x: c.x, v: c.v, a: c.a, Fn: c.Fnet, F: c.F, f: c.f }); if (S.hist.length > 900) S.hist.shift();
    checkMissions(dt);
    if (S.race) {
      S.race.t += dt;
      if (S.race.t >= 0 && S.race.t <= 6) { var e = c.v - target(S.race.t); S.race.err += e * e; S.race.n++; }
      if (S.race.t > 6) {
        var rms = Math.sqrt(S.race.err / Math.max(1, S.race.n));
        if (rms < 0.08) win('graph', 'Average miss only ' + fmt(rms, 3) + ' m/s. You pushed forward, then nothing, then backward.');
        else sayIn(view, 'Average miss ' + fmt(rms, 2) + ' m/s. Under 0.08 m/s wins. Try again: about 0.4 N forward, then 0 N, then 0.4 N back.');
        S.race.done = rms; S.race = null; el.race.textContent = 'Match the graph';
      }
    }
  }
  function checkMissions(dt) {
    var c = S.cart, F = c.F, moving = Math.abs(c.v) > 0.01;
    // a steady push: the same force and acceleration for half a second
    if (moving && S.steady && Math.abs(S.steady.F - F) < 1e-9 && Math.abs(S.steady.a - c.a) < 0.01 && S.steady.m === S.m && S.steady.fric === S.fric) {
      S.steady.time += dt;
      if (S.steady.time >= 0.5 && !S.steady.logged) {
        S.steady.logged = true; var s = { F: F, m: S.m, a: c.a, fric: S.fric };
        if (S.m === 1 && !S.fric && Math.abs(F - 1) < 0.05 && Math.abs(c.a - 1) < 0.03) win('newton', '1 N on 1 kg gives 1 m/s². That is what a newton is: 1 N = 1 kg·m/s².');
        if (S.m >= 4 && c.a >= 1.95) win('heavy', fmt(F, 1) + ' N on ' + S.m + ' kg gives ' + fmt(c.a, 2) + ' m/s²: ' + fmt(F, 1) + ' ÷ ' + S.m + (S.fric ? ' (minus friction)' : '') + '.');
        if (!S.fric) S.log.forEach(function (q) {
          if (q.fric || Math.abs(q.F - F) > 0.05 || Math.abs(F) < 0.2) return;
          var r = S.m / q.m;
          if (Math.abs(r - 2) < 0.01 || Math.abs(r - 0.5) < 0.01) win('half', 'Same ' + fmt(F, 1) + ' N: ' + q.m + ' kg went ' + fmt(q.a, 2) + ' m/s², ' + S.m + ' kg went ' + fmt(c.a, 2) + ' m/s². Twice the mass, half the acceleration.');
        });
        S.log.push(s); if (S.log.length > 12) S.log.shift();
      }
    } else S.steady = { F: F, a: c.a, m: S.m, fric: S.fric, time: 0 };
    // balanced: moving at a steady speed with friction and a push
    if (S.fric && Math.abs(c.v) > 0.2 && Math.abs(c.a) < 0.03 && Math.abs(F) > 0.1) { S.bal += dt; if (S.bal >= 2) { S.bal = -1e9; win('balance', 'A push of ' + fmt(Math.abs(F), 2) + ' N against ' + fmt(Math.abs(c.f), 2) + ' N of friction: net force zero, so the velocity stays the same.'); } }
    else if (S.bal > 0) S.bal = 0;
    // stopped on the line
    if (Math.abs(c.v) < 0.004 && S.moved && !S.drag && !S.key) { S.still += dt; if (S.still > 0.8 && Math.abs(c.x - LINE) <= 0.02) { S.still = -1e9; win('line', 'Stopped ' + fmt(Math.abs(c.x - LINE) * 100, 1) + ' cm from the line.'); } }
    else if (S.still > 0) S.still = 0;
  }

  // ---- drawing ----
  function drawCart(dt) {
    K.fit(); layout();
    var W = L.W, H = L.H, c = S.cart, gy = L.ground;
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, 0, L.th); g.addColorStop(0, '#0b1d2d'); g.addColorStop(1, '#06111a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, L.th);
    // the track and its ruler
    ctx.fillStyle = '#16354d'; ctx.fillRect(X(0) - 8, gy, X(4) - X(0) + 16, 7);
    ctx.fillStyle = '#2c4a60'; ctx.fillRect(X(XMIN - CARTW / 2) - 8, gy - 22, 6, 22); ctx.fillRect(X(XMAX + CARTW / 2) + 2, gy - 22, 6, 22);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
    for (var t = 0; t <= 40; t++) { var xx = Math.round(X(t / 10)) + 0.5, big = t % 10 === 0, mid = t % 5 === 0; ctx.beginPath(); ctx.moveTo(xx, gy + 8); ctx.lineTo(xx, gy + (big ? 18 : mid ? 14 : 11)); ctx.stroke(); if (big) txt(ctx, (t / 10) + ' m', xx, gy + 30, C.muted, '11px system-ui,sans-serif', 'center'); }
    // the line at 3.00 m
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(LINE), gy - 70); ctx.lineTo(X(LINE), gy + 6); ctx.stroke(); ctx.restore();
    txt(ctx, '3.00 m', X(LINE) + 4, gy - 60, C.red, '600 11px system-ui,sans-serif');
    // the ghost for the graph match
    if (S.race && S.race.t >= 0) {
      var tt = S.race.t, gx = X0 + (tt < 2 ? 0.2 * tt * tt : tt < 4 ? 0.8 + 0.8 * (tt - 2) : 2.4 + 0.8 * (tt - 4) - 0.2 * (tt - 4) * (tt - 4));
      ctx.fillStyle = 'rgba(165,216,255,.15)'; ctx.strokeStyle = 'rgba(165,216,255,.75)'; ctx.setLineDash([4, 3]); rr(ctx, X(gx) - CARTW / 2 * L.sc, gy - 30, CARTW * L.sc, 22, 5); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    }
    // the cart and its blocks
    var cx = X(c.x), cw = CARTW * L.sc, chh = 22, top = gy - 8 - chh;
    ctx.fillStyle = '#0d1a24'; [cx - cw * 0.3, cx + cw * 0.3].forEach(function (wx) { ctx.beginPath(); ctx.arc(wx, gy - 6, 6, 0, 7); ctx.fill(); ctx.strokeStyle = '#8fb3c6'; ctx.lineWidth = 1.5; ctx.stroke(); });
    var cg = ctx.createLinearGradient(0, top, 0, top + chh); cg.addColorStop(0, '#3d8ec9'); cg.addColorStop(1, '#245a82'); ctx.fillStyle = cg; rr(ctx, cx - cw / 2, top, cw, chh, 5); ctx.fill();
    if (S.fric) { ctx.fillStyle = '#c99a5b'; ctx.fillRect(cx - cw * 0.35, gy - 3, cw * 0.7, 3); }
    for (var b = 1; b < S.m; b++) { var by = top - b * 15; ctx.fillStyle = b % 2 ? '#b8862b' : '#d6a542'; rr(ctx, cx - cw * 0.36, by, cw * 0.72, 14, 3); ctx.fill(); txt(ctx, '1 kg', cx, by + 11, '#06111a', '600 9px system-ui,sans-serif', 'center'); }
    txt(ctx, S.m + ' kg', cx, top + 15, '#fff', '700 11px system-ui,sans-serif', 'center');
    // the force probe (a stretched spring to your hand)
    if (S.drag && S.hand !== 0) {
      var side = S.hand > 0 ? 1 : -1, hx0 = cx + side * cw / 2, hx1 = S.drag.x, hy = top + chh / 2, coils = 9;
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx0, hy);
      for (var k = 1; k <= coils * 2; k++) ctx.lineTo(hx0 + (hx1 - hx0) * k / (coils * 2 + 1), hy + (k % 2 ? -6 : 6));
      ctx.lineTo(hx1, hy); ctx.stroke();
      txt(ctx, '✊', hx1, hy + 7, C.ink, '20px system-ui', 'center');
    } else if (!S.touched) {
      if (W < 600) txt(ctx, '← drag the cart →', cx, top - 52, hexA(C.ink, 0.85), 'italic 13px Georgia,serif', 'center');
      else txt(ctx, 'drag the cart to push or pull it →', cx + cw / 2 + 12, top + 15, hexA(C.ink, 0.8), 'italic 13px Georgia,serif');
    }
    // forces, to scale: 1 N = fs px
    var fs = Math.min(9, (W * 0.18) / 10), ay = top - (S.m - 1) * 15 - 20, F = c.F, f = c.f, Fn = c.Fnet;
    if (Math.abs(F) > 0.005) { arrow(ctx, cx, ay, cx + F * fs, ay, C.green, 3.5, 10); txt(ctx, 'push ' + fmt(Math.abs(F), 2) + ' N', cx + F * fs + (F > 0 ? 6 : -6), ay + 4, C.green, '600 11px system-ui,sans-serif', F > 0 ? 'left' : 'right'); }
    if (Math.abs(f) > 0.005) { arrow(ctx, cx, gy + 1, cx + f * fs, gy + 1, C.red, 3.5, 10); txt(ctx, 'friction ' + fmt(Math.abs(f), 2) + ' N', cx + f * fs + (f > 0 ? 6 : -6), gy - 6, C.red, '600 11px system-ui,sans-serif', f > 0 ? 'left' : 'right'); }
    var ny = ay - 26;
    if (Math.abs(Fn) > 0.005) { arrow(ctx, cx, ny, cx + Fn * fs, ny, C.gold, 4, 11); txt(ctx, 'net ' + fmt(Fn, 2) + ' N', cx + Fn * fs + (Fn > 0 ? 6 : -6), ny + 4, C.gold, '700 11px system-ui,sans-serif', Fn > 0 ? 'left' : 'right'); }
    else txt(ctx, 'net force 0', cx, ny + 4, C.gold, '700 11px system-ui,sans-serif', 'center');
    // weight and normal force cancel: shown small, not to scale
    var wy = top + chh + 2;
    arrow(ctx, cx - cw / 2 - 10, top + 2, cx - cw / 2 - 10, top + 26, hexA(C.pink, 0.85), 2, 6);
    arrow(ctx, cx + cw / 2 + 10, wy, cx + cw / 2 + 10, wy - 24, hexA(C.blue, 0.85), 2, 6);
    if (W > 520) { txt(ctx, 'W', cx - cw / 2 - 20, top + 22, C.pink, '600 10px system-ui,sans-serif', 'right'); txt(ctx, 'N', cx + cw / 2 + 20, wy - 14, C.blue, '600 10px system-ui,sans-serif'); }
    if (S.flash > 0) { ctx.fillStyle = 'rgba(99,230,190,' + (0.16 * S.flash) + ')'; ctx.fillRect(0, 0, W, L.th); S.flash = Math.max(0, S.flash - dt * 1.5); }
    drawCharts();
  }
  var CH = [
    { k: 'x', label: 'position x', unit: 'm', col: C.blue, fixed: [0, 4] },
    { k: 'v', label: 'velocity v', unit: 'm/s', col: '#e9f1f6' },
    { k: 'a', label: 'acceleration a', unit: 'm/s²', col: C.cyan },
    { k: 'Fn', label: 'net force F', unit: 'N', col: C.gold }
  ];
  function drawCharts() {
    var W = L.W, top = L.charts.top, h = L.charts.h, n = CH.length, gap = 4, chh = (h - gap * (n - 1)) / n, left = 44, right = W - 10, span = 10;
    var hist = S.hist, tNow = S.cart.t, t0 = tNow - span;
    ctx.fillStyle = '#081a27'; rr(ctx, 6, top, W - 12, h + 2, 10); ctx.fill();
    CH.forEach(function (ch, i) {
      var y0 = top + i * (chh + gap), yT = y0 + 14, yB = y0 + chh - 4, mid;
      var lo, hi;
      if (ch.fixed) { lo = ch.fixed[0]; hi = ch.fixed[1]; }
      else { var m = 0.5; hist.forEach(function (q) { if (q.t >= t0) m = Math.max(m, Math.abs(q[ch.k])); }); if (S.race && ch.k === 'v') m = Math.max(m, 0.8); m = niceMax(m * 1.05); lo = -m; hi = m; }
      function yy(v) { return yB - (v - lo) / (hi - lo) * (yB - yT); }
      function xx(t) { return left + (t - t0) / span * (right - left); }
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath();
      if (lo < 0) { mid = Math.round(yy(0)) + 0.5; ctx.moveTo(left, mid); ctx.lineTo(right, mid); }
      ctx.moveTo(left, Math.round(yT) + 0.5); ctx.lineTo(right, Math.round(yT) + 0.5); ctx.moveTo(left, Math.round(yB) + 0.5); ctx.lineTo(right, Math.round(yB) + 0.5);
      for (var s = Math.ceil(t0); s <= tNow; s++) { var X2 = Math.round(xx(s)) + 0.5; ctx.moveTo(X2, yT); ctx.lineTo(X2, yB); }
      ctx.stroke();
      txt(ctx, ch.label + ' (' + ch.unit + ')', left + 4, y0 + 11, ch.col, '600 10.5px system-ui,sans-serif');
      txt(ctx, fmt(hi, hi < 2 ? 1 : 0), left - 5, yT + 4, C.muted, '9.5px system-ui,sans-serif', 'right');
      txt(ctx, fmt(lo, Math.abs(lo) < 2 && lo !== 0 ? 1 : 0), left - 5, yB + 1, C.muted, '9.5px system-ui,sans-serif', 'right');
      if (lo < 0) txt(ctx, '0', left - 5, yy(0) + 3, C.muted, '9.5px system-ui,sans-serif', 'right');
      // the target for the graph match
      if (ch.k === 'v' && S.race) {
        ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = '#a5d8ff'; ctx.lineWidth = 2; ctx.beginPath();
        var rs = tNow - S.race.t;
        for (var q = -0.01; q <= 6.01; q += 0.1) { var X3 = xx(rs + q); if (q < 0) ctx.moveTo(X3, yy(target(q))); else ctx.lineTo(X3, yy(target(q))); }
        ctx.stroke(); ctx.restore();
      }
      ctx.save(); ctx.beginPath(); ctx.rect(left, yT - 3, right - left, yB - yT + 6); ctx.clip();
      ctx.beginPath(); var st = false;
      hist.forEach(function (q) { if (q.t < t0) return; var X4 = xx(q.t), Y4 = yy(clamp(q[ch.k], lo, hi)); if (st) ctx.lineTo(X4, Y4); else { ctx.moveTo(X4, Y4); st = true; } });
      if (!reduced) { ctx.shadowColor = ch.col; ctx.shadowBlur = 6; }
      ctx.strokeStyle = ch.col; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      var last = hist[hist.length - 1]; if (last) txt(ctx, fmt(last[ch.k], 2), right - 4, y0 + 11, C.ink, '600 10.5px ui-monospace,Menlo,monospace', 'right');
    });
  }
  var readClock = 0;
  function readouts(dt) {
    readClock -= dt; if (readClock > 0) return; readClock = 0.15;
    var c = S.cart;
    el.hud.innerHTML = 'F<sub>net</sub> = <b>' + fmt(c.Fnet, 2) + ' N</b> · m = <b>' + S.m + ' kg</b><br>a = F<sub>net</sub>/m = <b>' + fmt(c.a, 2) + ' m/s²</b>' + (S.race ? '<br>match: <b>' + (S.race.t < 0 ? 'starts in ' + fmt(-S.race.t, 1) + ' s' : fmt(S.race.t, 1) + ' s of 6') + '</b>' : '');
    el.read.innerHTML = '<dt>Push (applied force)</dt><dd>' + fmt(c.F, 2) + ' N</dd><dt>Friction</dt><dd>' + fmt(c.f, 2) + ' N</dd><dt>Net force</dt><dd>' + fmt(c.Fnet, 2) + ' N</dd><dt>Mass</dt><dd>' + S.m + ' kg</dd><dt>Acceleration</dt><dd>' + fmt(c.a, 3) + ' m/s²</dd><dt>Velocity</dt><dd>' + fmt(c.v, 3) + ' m/s</dd><dt>Position</dt><dd>' + fmt(c.x, 3) + ' m</dd>';
  }
  syncForm(); newCart();
  LAB.loop(function (dt) { if (!S.paused) stepCart(dt); drawCart(dt); readouts(dt); }, view);

  // =====================================================================================
  // 2. Falling: the hammer and the feather, and a skydiver
  // =====================================================================================
  var fview = $('nl2-fview'), fcv = $('nl2-fcv'), FK = LAB.canvas(fcv), fc = FK.c;
  var HF = 1.6, FEATHER_VT = 0.5, HAMMER_K = P.dragK(1.21, 1.0, 0.003);
  var FA = { mode: 'drop', slow: false, cols: null, t: 0, run: false, sky: null, skyRun: false, pose: 'head', clouds: [], skySpeed: 1 };
  for (var ci = 0; ci < 14; ci++) FA.clouds.push({ x: Math.random(), y: Math.random() * 1.4, s: 0.5 + Math.random(), z: 0.4 + Math.random() * 0.6 });
  var POSES = { head: { C: 0.70, A: 0.18, name: 'Head first' }, spread: { C: 1.0, A: 0.39, name: 'Spread-eagle' }, chute: { C: 1.3, A: 25, name: 'Parachute open' } };
  var fel = { mode: $('nl2-fmode'), drop: $('nl2-fdrop'), slow: $('nl2-fslow'), pose: $('nl2-pose'), read: $('nl2-fread'), dropBox: $('nl2-fdrop-box'), skyBox: $('nl2-fsky-box'), jump: $('nl2-fjump'), fast: $('nl2-ffast') };
  function newDrop() {
    FA.cols = [
      { name: 'Air, on Earth', g: G, items: [new P.Faller(1.32, HAMMER_K, G), new P.Faller(0.003, 0.003 * G / (FEATHER_VT * FEATHER_VT), G)], sky: ['#16324a', '#0b1d2d'] },
      { name: 'Vacuum, on Earth', g: G, items: [new P.Faller(1.32, 0, G), new P.Faller(0.003, 0, G)], sky: ['#0b1622', '#06111a'], glass: true },
      { name: 'The Moon', g: 1.62, items: [new P.Faller(1.32, 0, 1.62), new P.Faller(0.003, 0, 1.62)], sky: ['#020509', '#020509'], moon: true }
    ];
    FA.cols.forEach(function (c) { c.land = [NaN, NaN]; });
    FA.t = 0; FA.run = false;
  }
  function newSky() { var p = POSES[FA.pose]; FA.sky = new P.Faller(75, P.dragK(1.21, p.C, p.A), 9.80); FA.sky.alt = 4000; FA.skyHist = [[0, 0]]; FA.skyRun = false; FA.ramp = null; FA.peak = 0; }
  fel.mode.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; FA.mode = b.dataset.mode; pressSeg(fel.mode, 'mode', FA.mode); fel.dropBox.hidden = FA.mode !== 'drop'; fel.skyBox.hidden = FA.mode !== 'sky'; });
  fel.drop.addEventListener('click', function () { newDrop(); FA.run = true; });
  fel.slow.addEventListener('change', function () { FA.slow = fel.slow.checked; });
  fel.jump.addEventListener('click', function () { if (FA.pose === 'chute') { FA.pose = 'head'; pressSeg(fel.pose, 'pose', 'head'); } newSky(); FA.skyRun = true; });
  fel.fast.addEventListener('change', function () { FA.skySpeed = fel.fast.checked ? 4 : 1; });
  // a change of pose takes about half a second; a parachute takes about 3 s to open (its drag grows like the cube of the time)
  fel.pose.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (FA.skyRun && FA.pose === 'chute' && b.dataset.pose !== 'chute') { sayIn(fview, 'A parachute can’t be closed in the air. Press Jump to start again.'); return; }
    FA.pose = b.dataset.pose; pressSeg(fel.pose, 'pose', FA.pose); var p = POSES[FA.pose], kT = P.dragK(1.21, p.C, p.A);
    if (FA.sky && FA.skyRun) FA.ramp = { k0: FA.sky.k, kT: kT, t: 0, T: FA.pose === 'chute' ? 3 : 0.5, pw: FA.pose === 'chute' ? 3 : 1 };
    else if (FA.sky) { FA.sky.k = kT; FA.ramp = null; }
  });
  fcv.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (FA.mode === 'drop') { newDrop(); FA.run = true; } else { newSky(); FA.skyRun = true; } } });
  function stepFall(dt) {
    if (FA.mode === 'drop' && FA.run) {
      var d = dt * (FA.slow ? 0.25 : 1), h = 1 / 2000, n = Math.round(d / h), all = true;
      for (var i = 0; i < n; i++) {
        FA.t += h;
        FA.cols.forEach(function (c) { c.items.forEach(function (it, j) { if (isNaN(c.land[j])) { it.step(h); if (it.y >= HF) { var over = it.y - HF; c.land[j] = it.t - over / Math.max(1e-9, it.v); it.y = HF; } } }); });
      }
      FA.cols.forEach(function (c) { if (isNaN(c.land[0]) || isNaN(c.land[1])) all = false; });
      if (all) FA.run = false;
    }
    if (FA.mode === 'sky' && FA.skyRun) {
      var s = FA.sky, hh = 1 / 200, nn = Math.round(dt * FA.skySpeed / hh);
      for (var k = 0; k < nn && s.alt > 0; k++) {
        var rp = FA.ramp; if (rp) { rp.t += hh; var u = Math.min(1, rp.t / rp.T); s.k = rp.k0 + (rp.kT - rp.k0) * Math.pow(u, rp.pw); if (u >= 1) FA.ramp = null; }
        s.step(hh); s.alt = 4000 - s.y; FA.peak = Math.max(FA.peak, (s.drag() - 75 * 9.8) / 75);
      }
      if (s.alt <= 0) { s.alt = 0; FA.skyRun = false; }
      FA.skyHist.push([s.t, s.v]); if (FA.skyHist.length > 3000) FA.skyHist.splice(0, 500);
    }
  }
  function drawHammer(c, x, y, s) { c.save(); c.translate(x, y); c.fillStyle = '#c99a5b'; c.fillRect(-2, -16 * s, 4, 26 * s); c.fillStyle = '#9fb3c3'; rr(c, -11 * s, -20 * s, 22 * s, 8 * s, 2); c.fill(); c.restore(); }
  function drawFeather(c, x, y, s, wob) { c.save(); c.translate(x, y); c.rotate(wob); c.fillStyle = '#f1e3c6'; c.beginPath(); c.ellipse(0, -6 * s, 5 * s, 14 * s, 0.3, 0, 7); c.fill(); c.strokeStyle = '#b8862b'; c.lineWidth = 1; c.beginPath(); c.moveTo(-3 * s, 8 * s); c.lineTo(3 * s, -20 * s); c.stroke(); c.restore(); }
  function drawFall(dt) {
    FK.fit(); var W = FK.w, H = FK.h;
    fc.clearRect(0, 0, W, H);
    if (FA.mode === 'drop') {
      var n = 3, gap = 6, cw = (W - gap * (n + 1)) / n, top = 46, bot = H - 52, S2 = (bot - top) / HF;
      FA.cols.forEach(function (col, i) {
        var x0 = gap + i * (cw + gap), gr = fc.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, col.sky[0]); gr.addColorStop(1, col.sky[1]);
        fc.fillStyle = gr; rr(fc, x0, 4, cw, H - 8, 10); fc.fill();
        if (col.moon) { for (var st = 0; st < 30; st++) { fc.fillStyle = 'rgba(255,255,255,' + (0.3 + (st * 37 % 10) / 20) + ')'; fc.fillRect(x0 + (st * 53 % 100) / 100 * cw, 8 + (st * 71 % 100) / 100 * (H * 0.5), 1.5, 1.5); } fc.fillStyle = '#6b7280'; fc.fillRect(x0, bot, cw, H - 4 - bot); fc.fillStyle = '#4b5563'; for (var cr = 0; cr < 4; cr++) { fc.beginPath(); fc.ellipse(x0 + cw * (0.15 + cr * 0.23), bot + 14 + (cr % 2) * 8, 8, 3, 0, 0, 7); fc.fill(); } }
        else { fc.fillStyle = col.glass ? '#1b2a36' : '#2b4a2b'; fc.fillRect(x0, bot, cw, H - 4 - bot); }
        if (col.glass) { fc.strokeStyle = 'rgba(165,216,255,.5)'; fc.lineWidth = 2; rr(fc, x0 + 8, top - 18, cw - 16, bot - top + 18, 12); fc.stroke(); fc.fillStyle = 'rgba(165,216,255,.05)'; fc.fill(); txt(fc, 'no air', x0 + cw - 14, bot - 8, 'rgba(165,216,255,.7)', '10px system-ui,sans-serif', 'right'); }
        txt(fc, col.name, x0 + cw / 2, 22, C.ink, '700 12px system-ui,sans-serif', 'center');
        txt(fc, 'g = ' + fmt(col.g, 2) + ' m/s²', x0 + cw / 2, 37, C.muted, '10.5px system-ui,sans-serif', 'center');
        var hx = x0 + cw * 0.32, fx = x0 + cw * 0.7, it = col.items, sc = Math.min(1.5, cw / 110);
        drawHammer(fc, hx, top + it[0].y * S2 + 10 * sc, sc);
        drawFeather(fc, fx, top + it[1].y * S2 + 10 * sc, sc, col.moon || col.glass ? 0 : Math.sin(FA.t * 5) * 0.4 * (isNaN(col.land[1]) ? 1 : 0));
        var ly = bot + 18;
        txt(fc, isNaN(col.land[0]) ? (FA.run ? '…' : '') : fmt(col.land[0], 2) + ' s', hx, ly + 8, C.gold, '600 11px system-ui,sans-serif', 'center');
        txt(fc, isNaN(col.land[1]) ? (FA.run ? '…' : '') : fmt(col.land[1], 2) + ' s', fx, ly + 8, C.gold, '600 11px system-ui,sans-serif', 'center');
      });
      txt(fc, 't = ' + fmt(FA.t, 2) + ' s' + (FA.slow ? ' (¼ speed)' : ''), W - 12, H - 10, C.muted, '11px ui-monospace,Menlo,monospace', 'right');
      fel.read.innerHTML = '<dt>Landing times</dt><dd>hammer · feather</dd>' + FA.cols.map(function (c) { return '<dt>' + c.name + '</dt><dd>' + (isNaN(c.land[0]) ? '—' : fmt(c.land[0], 2) + ' s') + ' · ' + (isNaN(c.land[1]) ? '—' : fmt(c.land[1], 2) + ' s') + '</dd>'; }).join('');
    } else {
      var s = FA.sky, half = W < 560 ? W : W * 0.42, gtop = W < 560 ? H * 0.52 : 0;
      // left: the diver falling past clouds
      var sg = fc.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#3a6f9a'); sg.addColorStop(1, '#1b3b57'); fc.fillStyle = sg; fc.fillRect(0, 0, half, W < 560 ? gtop : H);
      var vh = W < 560 ? gtop : H, travel = s.y;
      FA.clouds.forEach(function (cl) { var y = ((cl.y * vh - travel * 6 * cl.z) % (vh * 1.4) + vh * 1.4) % (vh * 1.4) - vh * 0.2; fc.fillStyle = 'rgba(255,255,255,' + (0.12 + 0.18 * cl.z) + ')'; fc.beginPath(); fc.ellipse(cl.x * half, y, 34 * cl.s, 11 * cl.s, 0, 0, 7); fc.fill(); });
      var dx = half / 2, dy = vh * 0.42, pose = FA.pose;
      if (pose === 'chute') { fc.fillStyle = '#ff8787'; fc.beginPath(); fc.arc(dx, dy - 58, 46, Math.PI, 0); fc.fill(); fc.fillStyle = '#ffd479'; fc.beginPath(); fc.arc(dx, dy - 58, 46, Math.PI, Math.PI * 1.33); fc.lineTo(dx, dy - 58); fc.fill(); fc.strokeStyle = 'rgba(255,255,255,.6)'; fc.lineWidth = 1; [-44, -20, 20, 44].forEach(function (o) { fc.beginPath(); fc.moveTo(dx + o, dy - 58); fc.lineTo(dx, dy - 8); fc.stroke(); }); }
      fc.fillStyle = '#ffd479'; fc.strokeStyle = '#ffd479'; fc.lineWidth = 5; fc.lineCap = 'round';
      if (pose === 'head') { fc.beginPath(); fc.arc(dx, dy + 14, 7, 0, 7); fc.fill(); fc.beginPath(); fc.moveTo(dx, dy + 6); fc.lineTo(dx, dy - 18); fc.moveTo(dx, dy - 18); fc.lineTo(dx - 5, dy - 36); fc.moveTo(dx, dy - 18); fc.lineTo(dx + 5, dy - 36); fc.moveTo(dx, dy + 2); fc.lineTo(dx - 6, dy - 12); fc.moveTo(dx, dy + 2); fc.lineTo(dx + 6, dy - 12); fc.stroke(); }
      else { fc.beginPath(); fc.arc(dx, dy - 2, 7, 0, 7); fc.fill(); fc.beginPath(); fc.moveTo(dx, dy + 4); fc.lineTo(dx, dy + 24); fc.moveTo(dx, dy + 8); fc.lineTo(dx - 22, dy - 2); fc.moveTo(dx, dy + 8); fc.lineTo(dx + 22, dy - 2); fc.moveTo(dx, dy + 24); fc.lineTo(dx - 16, dy + 38); fc.moveTo(dx, dy + 24); fc.lineTo(dx + 16, dy + 38); fc.stroke(); }
      // forces on the diver: weight down, drag up, net
      var Wt = 75 * 9.80, Fd = s.drag(), fsc = (vh * 0.36) / Wt, ax = dx + Math.min(70, half * 0.28);
      arrow(fc, ax, dy, ax, dy + Wt * fsc, C.pink, 4, 11); txt(fc, 'weight ' + fmt(Wt, 0) + ' N', ax + 8, dy + Wt * fsc - 2, C.pink, '600 11px system-ui,sans-serif');
      var dl = Math.min(Fd, Wt * 2.6) * fsc;
      if (Fd > 1) { arrow(fc, ax - 16, dy, ax - 16, dy - dl, C.lime, 4, 11); txt(fc, 'drag ' + fmt(Fd, 0) + ' N' + (Fd > Wt * 2.6 ? ' ↑' : ''), ax - 8, Math.max(16, dy - dl + 10), C.lime, '600 11px system-ui,sans-serif'); }
      var Fn = Wt - Fd, nx = dx - Math.min(70, half * 0.28);
      if (Math.abs(Fn) > 2) { arrow(fc, nx, dy, nx, dy + clamp(Fn, -Wt * 2.6, Wt) * fsc, C.gold, 4, 11); }
      txt(fc, 'net ' + fmt(Fn, 0) + ' N', nx - 8, dy - 8, C.gold, '700 11px system-ui,sans-serif', 'right');
      fc.fillStyle = 'rgba(6,17,26,.6)'; rr(fc, 6, vh - 46, Math.min(half - 12, 190), 40, 8); fc.fill();
      txt(fc, fmt(s.alt, 0) + ' m above the ground', 14, vh - 30, C.ink, '600 12px system-ui,sans-serif');
      txt(fc, fmt(s.v, 1) + ' m/s · ' + fmt(s.v * 3.6, 0) + ' km/h', 14, vh - 13, C.gold, '700 13px system-ui,sans-serif');
      // right: the v–t graph
      var gx0 = W < 560 ? 0 : half + 8, gw = W < 560 ? W : W - half - 8, gy0 = gtop, gh = W < 560 ? H - gtop : H;
      fc.fillStyle = '#081a27'; rr(fc, gx0, gy0 + (W < 560 ? 6 : 0), gw, gh - (W < 560 ? 6 : 0), 10); fc.fill();
      var left = gx0 + 40, right = gx0 + gw - 12, yT = gy0 + 30, yB = gy0 + gh - 26, tMax = Math.max(30, Math.ceil((s.t + 1) / 10) * 10), vMax = 110;
      function gxp(t) { return left + t / tMax * (right - left); } function gyp(v) { return yB - v / vMax * (yB - yT); }
      fc.strokeStyle = C.faint; fc.lineWidth = 1; fc.beginPath();
      for (var v = 0; v <= vMax; v += 20) { fc.moveTo(left, Math.round(gyp(v)) + 0.5); fc.lineTo(right, Math.round(gyp(v)) + 0.5); }
      fc.stroke();
      for (v = 0; v <= vMax; v += 20) txt(fc, String(v), left - 6, gyp(v) + 4, C.muted, '10px system-ui,sans-serif', 'right');
      for (var tt = 0; tt <= tMax; tt += 10) txt(fc, tt + ' s', gxp(tt), yB + 15, C.muted, '10px system-ui,sans-serif', 'center');
      txt(fc, 'speed (m/s) against time', left, gy0 + 20, C.ink, '600 11px system-ui,sans-serif');
      var vT = s.vT();
      fc.save(); fc.setLineDash([6, 4]); fc.strokeStyle = C.red; fc.lineWidth = 1.5; fc.beginPath(); fc.moveTo(left, gyp(Math.min(vT, vMax))); fc.lineTo(right, gyp(Math.min(vT, vMax))); fc.stroke(); fc.restore();
      txt(fc, 'terminal speed ' + fmt(vT, 1) + ' m/s', right - 4, gyp(Math.min(vT, vMax)) - 6, C.red, '600 11px system-ui,sans-serif', 'right');
      fc.save(); fc.beginPath(); FA.skyHist.forEach(function (q, i) { var X5 = gxp(q[0]), Y5 = gyp(Math.min(q[1], vMax)); if (i) fc.lineTo(X5, Y5); else fc.moveTo(X5, Y5); });
      if (!reduced) { fc.shadowColor = C.green; fc.shadowBlur = 6; } fc.strokeStyle = C.green; fc.lineWidth = 2.2; fc.stroke(); fc.restore();
      fel.read.innerHTML = '<dt>Speed</dt><dd>' + fmt(s.v, 1) + ' m/s</dd><dt>Weight</dt><dd>' + fmt(Wt, 0) + ' N</dd><dt>Air drag</dt><dd>' + fmt(Fd, 0) + ' N</dd><dt>Net force (down)</dt><dd>' + fmt(Fn, 0) + ' N</dd><dt>Acceleration (down)</dt><dd>' + fmt(Fn / 75, 2) + ' m/s²</dd><dt>Terminal speed</dt><dd>' + fmt(vT, 1) + ' m/s (' + fmt(vT * 3.6, 0) + ' km/h)</dd>';
    }
  }
  newDrop(); newSky();
  LAB.loop(function (dt) { stepFall(dt); drawFall(dt); }, fview);

  // =====================================================================================
  // 3. Tug-of-war: a net-force builder
  // =====================================================================================
  var tcv = $('nl2-tcv'), TK = LAB.canvas(tcv), tc = TK.c;
  var TW = { left: [300, 150], right: [150, 150, 150], sled: null, ice: true, done: false };
  var tel = { read: $('nl2-tread'), fric: $('nl2-tfric') };
  function newSled() { TW.sled = new P.Cart({ m: 200, muS: TW.ice ? 0.04 : 0, muK: TW.ice ? 0.02 : 0, x: 0, xMin: -3, xMax: 3 }); TW.done = false; }
  function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  root.querySelectorAll('[data-tug]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.dataset.tug.split(':'), side = TW[p[0]];
      if (p[1] === 'clear') side.length = 0; else if (side.length < 5) side.push(+p[1]);
      if (TW.done) newSled();
    });
  });
  $('nl2-treset').addEventListener('click', newSled);
  tel.fric.addEventListener('change', function () { TW.ice = tel.fric.checked; newSled(); });
  function drawBear(c, x, y, s, dir, col) {
    c.save(); c.translate(x, y); c.scale(dir * s, s); c.rotate(-0.25);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -18, 9, 12, 0, 0, 7); c.fill();
    c.beginPath(); c.arc(-2, -36, 8, 0, 7); c.fill(); c.beginPath(); c.arc(-7, -42, 3.5, 0, 7); c.arc(3, -43, 3.5, 0, 7); c.fill();
    c.fillRect(-7, -8, 5, 9); c.fillRect(2, -8, 5, 9);
    c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(4, -22); c.lineTo(16, -18); c.stroke();
    c.restore();
  }
  function drawTug(dt) {
    TK.fit(); var W = TK.w, H = TK.h, s = TW.sled, Lf = sum(TW.left), Rf = sum(TW.right);
    if (!TW.done) { var n = Math.round(dt / (1 / 600)); for (var i = 0; i < n; i++) s.step(1 / 600, Rf - Lf); if (Math.abs(s.x) >= 2.99) TW.done = true; }
    tc.fillStyle = C.bg; tc.fillRect(0, 0, W, H);
    var ice = tc.createLinearGradient(0, H * 0.62, 0, H); ice.addColorStop(0, '#2b5876'); ice.addColorStop(1, '#16354d'); tc.fillStyle = ice; tc.fillRect(0, H * 0.62, W, H * 0.38);
    var sc = (W * 0.5) / 6, mid = W / 2, gy = H * 0.74, sx = mid + s.x * sc, bs = clamp(H / 230, 1, 1.5), sp = 30 * bs;
    tc.strokeStyle = 'rgba(255,135,135,.6)'; tc.setLineDash([4, 4]); tc.lineWidth = 2; [-3, 3].forEach(function (e) { tc.beginPath(); tc.moveTo(mid + e * sc, gy - 40); tc.lineTo(mid + e * sc, H); tc.stroke(); }); tc.setLineDash([]);
    // rope and teams
    var ry = gy - 26 * bs, cs = 30 * bs;
    tc.strokeStyle = '#c99a5b'; tc.lineWidth = 3; tc.beginPath(); tc.moveTo(sx - cs - 20 - TW.left.length * sp - 10, ry); tc.lineTo(sx + cs + 20 + TW.right.length * sp + 10, ry); tc.stroke();
    TW.left.forEach(function (f, i) { drawBear(tc, sx - cs - 26 - i * sp, gy + 6, (f > 200 ? 1.15 : 0.85) * bs, -1, f > 200 ? '#c08552' : '#e0a872'); });
    TW.right.forEach(function (f, i) { drawBear(tc, sx + cs + 26 + i * sp, gy + 6, (f > 200 ? 1.15 : 0.85) * bs, 1, f > 200 ? '#8f6a4a' : '#d39a64'); });
    // the crate
    tc.fillStyle = '#b8862b'; rr(tc, sx - cs, gy - 2 * cs + 2, 2 * cs, 2 * cs - 4, 5); tc.fill(); tc.strokeStyle = '#7a5a1c'; tc.lineWidth = 2; tc.beginPath(); tc.moveTo(sx - cs, gy - 2 * cs + 2); tc.lineTo(sx + cs, gy - 2); tc.moveTo(sx + cs, gy - 2 * cs + 2); tc.lineTo(sx - cs, gy - 2); tc.stroke();
    tc.fillStyle = 'rgba(6,17,26,.55)'; rr(tc, sx - 24, gy - cs - 9, 48, 16, 4); tc.fill();
    txt(tc, '200 kg', sx, gy - cs + 3, '#fff', '700 11px system-ui,sans-serif', 'center');
    // forces head to tail
    var fs = Math.min(0.16, (W * 0.38) / Math.max(400, Lf, Rf)), y1 = 30, x = sx;
    TW.right.forEach(function (f, i) { arrow(tc, x, y1, x + f * fs, y1, i % 2 ? '#3cc9a0' : C.green, 4, 9); x += f * fs; });
    txt(tc, fmt(Rf, 0) + ' N', x + 6, y1 + 4, C.green, '600 11px system-ui,sans-serif');
    x = sx; var y2 = 54;
    TW.left.forEach(function (f, i) { arrow(tc, x, y2, x - f * fs, y2, i % 2 ? '#3fb5c6' : C.cyan, 4, 9); x -= f * fs; });
    txt(tc, fmt(Lf, 0) + ' N', x - 6, y2 + 4, C.cyan, '600 11px system-ui,sans-serif', 'right');
    var Fn = s.Fnet, y3 = 82;
    if (Math.abs(Fn) > 0.5) arrow(tc, sx, y3, sx + Fn * fs, y3, C.gold, 5, 11);
    txt(tc, 'net ' + fmt(Fn, 0) + ' N', sx + (Fn >= 0 ? Math.max(Fn * fs, 0) + 8 : Fn * fs - 8), y3 + 4, C.gold, '700 12px system-ui,sans-serif', Fn >= 0 ? 'left' : 'right');
    if (TW.done) txt(tc, (s.x > 0 ? 'Right' : 'Left') + ' team wins!', mid, H - 12, C.gold, '700 14px system-ui,sans-serif', 'center');
    tel.read.innerHTML = '<dt>Right team</dt><dd>' + fmt(Rf, 0) + ' N</dd><dt>Left team</dt><dd>' + fmt(Lf, 0) + ' N</dd>' + (TW.ice ? '<dt>Friction on the crate</dt><dd>' + fmt(s.f, 1) + ' N</dd>' : '') + '<dt>Net force</dt><dd>' + fmt(s.Fnet, 1) + ' N</dd><dt>Acceleration = F<sub>net</sub> ÷ 200 kg</dt><dd>' + fmt(s.a, 3) + ' m/s²</dd><dt>Velocity</dt><dd>' + fmt(s.v, 2) + ' m/s</dd>';
  }
  newSled();
  LAB.loop(drawTug, tcv);

  // =====================================================================================
  // 4. A velocity–time graph you can drag
  // =====================================================================================
  var gcv = $('nl2-gcv'), GK = LAB.canvas(gcv), gc = GK.c;
  var VT = { pts: [[0, 0], [2, 1], [4, 1], [6, -0.5], [8, 0]], sel: 1, drag: -1, play: -1 };
  var gel = { read: $('nl2-gread'), play: $('nl2-gplay') };
  function gl() { var W = GK.w, H = GK.h; return { W: W, H: H, left: 44, right: W - 14, top: 80, bot: H - 28, vMin: -2, vMax: 2 }; }
  function gX(g, t) { return g.left + t / 8 * (g.right - g.left); } function gY(g, v) { return g.bot - (v - g.vMin) / (g.vMax - g.vMin) * (g.bot - g.top); }
  function vAt(t) { var p = VT.pts; for (var i = 0; i + 1 < p.length; i++) if (t <= p[i + 1][0]) return p[i][1] + (p[i + 1][1] - p[i][1]) * (t - p[i][0]) / (p[i + 1][0] - p[i][0]); return p[p.length - 1][1]; }
  function xAt(t) { var x = 0, dtt = 0.01; for (var s = 0; s < t; s += dtt) x += vAt(s + dtt / 2) * Math.min(dtt, t - s); return x; }
  function drawVT(dt) {
    GK.fit(); var g = gl(), pc = P.vtPieces(VT.pts);
    gc.fillStyle = C.bg; gc.fillRect(0, 0, g.W, g.H);
    // the little track on top, with a cart that follows the graph
    var tx0 = g.left, tx1 = g.right, ty = 30, xmin = -3, xmax = 6;
    gc.fillStyle = '#16354d'; gc.fillRect(tx0, ty + 8, tx1 - tx0, 4);
    for (var m = xmin; m <= xmax; m++) { var px = tx0 + (m - xmin) / (xmax - xmin) * (tx1 - tx0); gc.fillStyle = C.muted; gc.fillRect(px, ty + 12, 1, m % 5 === 0 ? 8 : 4); if (m % 3 === 0) txt(gc, m + ' m', px, ty + 30, C.muted, '9.5px system-ui,sans-serif', 'center'); }
    var tp = VT.play >= 0 ? VT.play : 8, xp = xAt(tp), cpx = tx0 + (clamp(xp, xmin, xmax) - xmin) / (xmax - xmin) * (tx1 - tx0);
    gc.fillStyle = C.blue; rr(gc, cpx - 10, ty - 4, 20, 12, 3); gc.fill();
    // areas
    function shade(a, b) { gc.beginPath(); gc.moveTo(gX(g, a[0]), gY(g, 0)); gc.lineTo(gX(g, a[0]), gY(g, a[1])); gc.lineTo(gX(g, b[0]), gY(g, b[1])); gc.lineTo(gX(g, b[0]), gY(g, 0)); gc.closePath(); gc.fillStyle = (a[1] + b[1]) >= 0 ? 'rgba(99,230,190,.18)' : 'rgba(255,135,135,.2)'; gc.fill(); }
    for (var i = 0; i < pc.length; i++) {
      var a = VT.pts[i], b = VT.pts[i + 1];
      if (a[1] * b[1] < 0) { var tc0 = a[0] + (b[0] - a[0]) * a[1] / (a[1] - b[1]); shade(a, [tc0, 0]); shade([tc0, 0], b); } else shade(a, b);
    }
    gc.strokeStyle = C.faint; gc.lineWidth = 1; gc.beginPath();
    for (var v = -2; v <= 2; v++) { gc.moveTo(g.left, Math.round(gY(g, v)) + 0.5); gc.lineTo(g.right, Math.round(gY(g, v)) + 0.5); }
    for (var t = 0; t <= 8; t += 2) { gc.moveTo(Math.round(gX(g, t)) + 0.5, g.top); gc.lineTo(Math.round(gX(g, t)) + 0.5, g.bot); }
    gc.stroke();
    gc.strokeStyle = C.muted; gc.beginPath(); gc.moveTo(g.left, Math.round(gY(g, 0)) + 0.5); gc.lineTo(g.right, Math.round(gY(g, 0)) + 0.5); gc.stroke();
    for (v = -2; v <= 2; v++) txt(gc, String(v), g.left - 6, gY(g, v) + 4, C.muted, '10px system-ui,sans-serif', 'right');
    for (t = 0; t <= 8; t += 2) txt(gc, t + ' s', gX(g, t), g.bot + 16, C.muted, '10px system-ui,sans-serif', 'center');
    txt(gc, 'velocity (m/s)', g.left, g.top - 6, C.green, '600 10.5px system-ui,sans-serif');
    gc.strokeStyle = C.green; gc.lineWidth = 3; gc.beginPath(); VT.pts.forEach(function (p, j) { if (j) gc.lineTo(gX(g, p[0]), gY(g, p[1])); else gc.moveTo(gX(g, p[0]), gY(g, p[1])); }); gc.stroke();
    pc.forEach(function (p, j) { var xm = gX(g, (p.t0 + p.t1) / 2), ym = gY(g, (VT.pts[j][1] + VT.pts[j + 1][1]) / 2); txt(gc, 'a = ' + fmt(p.a, 2), xm, ym - 12, C.pink, '600 11px system-ui,sans-serif', 'center'); });
    VT.pts.forEach(function (p, j) { gc.fillStyle = j === VT.sel ? C.gold : C.white; gc.beginPath(); gc.arc(gX(g, p[0]), gY(g, p[1]), j === VT.sel ? 8 : 6.5, 0, 7); gc.fill(); if (j === VT.sel) { gc.strokeStyle = C.gold; gc.lineWidth = 2; gc.beginPath(); gc.arc(gX(g, p[0]), gY(g, p[1]), 12, 0, 7); gc.stroke(); } });
    if (VT.play >= 0) { var pxx = gX(g, VT.play); gc.strokeStyle = C.blue; gc.lineWidth = 1.5; gc.beginPath(); gc.moveTo(pxx, g.top); gc.lineTo(pxx, g.bot); gc.stroke(); VT.play += dt; if (VT.play > 8) VT.play = -1; }
    var disp = pc.reduce(function (s2, p) { return s2 + p.area; }, 0);
    gel.read.innerHTML = '<dt>Displacement (area above minus area below)</dt><dd>' + fmt(disp, 2) + ' m</dd><dt>Distance traveled</dt><dd>' + fmt(P.vtDistance(VT.pts), 2) + ' m</dd><dt>Slopes (accelerations)</dt><dd>' + pc.map(function (p) { return fmt(p.a, 2); }).join(', ') + ' m/s²</dd>';
  }
  function gptr(e) { var r = gcv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  gcv.addEventListener('pointerdown', function (e) {
    var p = gptr(e), g = gl(), best = -1, bd = 34;
    VT.pts.forEach(function (q, j) { var d = Math.abs(p.x - gX(g, q[0])); if (d < bd) { bd = d; best = j; } });
    if (best < 0) return; VT.drag = best; VT.sel = best; gcv.setPointerCapture(e.pointerId); e.preventDefault(); moveVT(p);
  });
  function moveVT(p) { var g = gl(); var v = g.vMin + (g.bot - p.y) / (g.bot - g.top) * (g.vMax - g.vMin); VT.pts[VT.drag][1] = clamp(Math.round(v * 10) / 10, -2, 2); }
  gcv.addEventListener('pointermove', function (e) { if (VT.drag >= 0) moveVT(gptr(e)); });
  gcv.addEventListener('pointerup', function () { VT.drag = -1; }); gcv.addEventListener('pointercancel', function () { VT.drag = -1; });
  gcv.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowLeft') VT.sel = Math.max(0, VT.sel - 1); else if (k === 'ArrowRight') VT.sel = Math.min(4, VT.sel + 1);
    else if (k === 'ArrowUp' || k === 'ArrowDown') VT.pts[VT.sel][1] = clamp(Math.round((VT.pts[VT.sel][1] + (k === 'ArrowUp' ? 0.1 : -0.1)) * 10) / 10, -2, 2);
    else return; e.preventDefault();
  });
  gel.play.addEventListener('click', function () { VT.play = 0; });
  LAB.loop(drawVT, gcv);
})();
